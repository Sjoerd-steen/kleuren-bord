//dit zijn alle variablen die niet kunnen veranderen
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

const clearButton = document.getElementById('verwijder');
const eraseButton = document.getElementById('gum');
const saveButton = document.getElementById('save');
const colorButtons = document.querySelectorAll('.color');
const colorPicker = document.getElementById('color-picker');
const brushRange = document.getElementById('brush-range');
const brushValue = document.getElementById('brush-value');

//dit zijn allen varbiablen die we wel kunnen laten veranderen

let drawing = false;
let currentColor = colorPicker ? colorPicker.value : 'black';
let currentSize = brushRange ? parseInt(brushRange.value) : 5;
let isErasing = false;

//  dit is de canvas zelf de grooten etc
function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const displayWidth = window.innerWidth - (window.innerWidth < 768 ? 20 : 300);
  const displayHeight = window.innerHeight - 200;
  canvas.width = displayWidth * ratio;
  canvas.height = displayHeight * ratio;
  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";
  ctx.scale(ratio, ratio);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  return { x: x / (window.devicePixelRatio || 1), y: y / (window.devicePixelRatio || 1) };
}

// dit is voor het tek enen zelf
function startDrawing(e) {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineWidth = currentSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isErasing ? '#ffffff' : currentColor;
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath();
}

// dit is voor de verschillende  tools zoals de gum enzo
eraseButton.addEventListener('click', () => {
  isErasing = !isErasing;
  eraseButton.textContent = isErasing ? 'Teken' : 'Gum';
});

clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'whiteboard-drawing.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// dit is voor de kleuren en de kleur kiezen 
colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    colorButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = btn.dataset.color;
    if (colorPicker) colorPicker.value = rgbToHex(getComputedStyle(btn).backgroundColor);
    isErasing = false;
    eraseButton.textContent = 'Verwijder';
  });
});

if (colorPicker) {
  colorPicker.addEventListener('input', () => {
    currentColor = colorPicker.value;
    colorButtons.forEach(b => b.classList.remove('active'));
  });
}

// dit is voor de dikte van het tekenen
if (brushRange) {
  brushRange.addEventListener('input', () => {
    currentSize = parseInt(brushRange.value);
    if (brushValue) brushValue.textContent = `${currentSize}px`;
  });
}

// voor mijzelf dit zijn de muis en touch events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', (e) => startDrawing(e.touches[0]), { passive: true });
canvas.addEventListener('touchmove', (e) => draw(e.touches[0]), { passive: true });
canvas.addEventListener('touchend', stopDrawing);

// dit is voor de knop om een tekening toe te voegen aan de gallerij
const postButton = document.getElementById('post');

postButton.addEventListener('click', () => {
  const title = prompt('Geef je kunstwerk een titel:');
  if (!title) return;

  const image = canvas.toDataURL('image/png');
  const artwork = { title, image, date: new Date().toLocaleString() };

  // meest huidigen gemaakten art ophalen
  const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
  gallery.push(artwork);

  // Opslaan 
  localStorage.setItem('gallery', JSON.stringify(gallery));

  alert('Je kunstwerk is gepost naar de gallery!');
});

