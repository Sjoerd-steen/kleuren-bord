(() => {
  // When backend is present, we post to /api/artworks instead of localStorage

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    let errorBox = document.getElementById('upload-error');
    if (!errorBox) {
      errorBox = document.createElement('div');
      errorBox.id = 'upload-error';
      errorBox.style.marginTop = '8px';
      errorBox.style.color = '#c62828';
      form && form.parentNode && form.parentNode.insertBefore(errorBox, form.nextSibling);
    }
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = form.querySelector('input[name="title"]').value.trim();
      const fileInput = form.querySelector('input[name="imageFile"]');
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;
      if (!title || !file) {
        alert('Vul zowel titel als afbeelding in.');
        return;
      }
      errorBox.textContent = '';
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Bezig met uploaden...'; }
      const formData = new FormData();
      formData.append('title', title);
      formData.append('image', file);

      fetch('/api/artworks', {
        method: 'POST',
        body: formData
      })
      .then(res => {
        if (!res.ok) {
          return res.json().catch(() => ({})).then(err => {
            const msg = err && err.error ? String(err.error) : 'upload_failed';
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then(() => {
        window.location.href = 'gallery.html';
      })
      .catch((err) => {
        const map = { missing_fields: 'Titel of afbeelding ontbreekt.', db_error: 'Database fout.', upload_failed: 'Upload mislukt.' };
        errorBox.textContent = map[err.message] || 'Upload mislukt. Controleer of de server draait.';
      })
      .finally(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Opslaan'; }
      });
    });
  });
})();


