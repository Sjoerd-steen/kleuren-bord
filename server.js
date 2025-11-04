const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Database
const dbPath = path.join(__dirname, 'gallery.sqlite');
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Middleware
app.use(express.static(__dirname)); // serve html/css/js
app.use('/uploads', express.static(uploadDir)); // serve images
app.use(express.urlencoded({ extended: true }));

// Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// API endpoints
app.get('/api/artworks', (_req, res) => {
  db.all('SELECT * FROM artworks ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows);
  });
});

app.post('/api/artworks', upload.single('image'), (req, res) => {
  const title = req.body.title || '';
  if (!req.file || !title.trim()) return res.status(400).json({ error: 'missing_fields' });
  const publicPath = '/uploads/' + req.file.filename;
  db.run('INSERT INTO artworks (title, image_path) VALUES (?, ?)', [title.trim(), publicPath], function(err) {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.status(201).json({ id: this.lastID, title: title.trim(), image_path: publicPath });
  });
});

app.delete('/api/artworks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'bad_id' });
  db.get('SELECT image_path FROM artworks WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    if (!row) return res.status(404).json({ error: 'not_found' });
    db.run('DELETE FROM artworks WHERE id = ?', [id], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'db_error' });
      // Try to remove file
      const fileOnDisk = path.join(__dirname, row.image_path.replace(/^\/+/, ''));
      fs.unlink(fileOnDisk, () => {});
      res.json({ ok: true });
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


