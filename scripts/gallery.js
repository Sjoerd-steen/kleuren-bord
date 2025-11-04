(() => {
  function fetchArtworks() {
    return fetch('/api/artworks').then(r => r.json());
  }

  function removeArtwork(id) {
    fetch(`/api/artworks/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Verwijderen mislukt');
        render();
      })
      .catch(() => alert('Verwijderen mislukt. Probeer opnieuw.'));
  }

  function render() {
    const container = document.getElementById('gallery');
    const empty = document.getElementById('empty');
    container.innerHTML = '';
    fetchArtworks().then(items => {
      if (!items.length) {
        empty.style.display = 'block';
        return;
      }
      empty.style.display = 'none';
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = document.createElement('img');
        img.src = item.image_path;
        img.alt = item.title || 'Artwork';
        const meta = document.createElement('div');
        meta.className = 'meta';
        const title = document.createElement('span');
        title.className = 'grid-card-title';
        title.textContent = item.title || 'Zonder titel';
        const del = document.createElement('button');
        del.className = 'btn btn-danger danger';
        del.textContent = 'Verwijderen';
        del.addEventListener('click', () => removeArtwork(item.id));
        meta.appendChild(title);
        meta.appendChild(del);
        card.appendChild(img);
        card.appendChild(meta);
        container.appendChild(card);
      });
    }).catch(() => {
      empty.style.display = 'block';
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();


