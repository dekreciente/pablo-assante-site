// js/gallery-loader.js
(async function () {
  try {
    const res = await fetch('/content/gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Cannot load gallery.json');
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    // Helper: accept YouTube ID or full URL
    const getYouTubeId = (input) => {
      if (!input) return '';
      // If looks like a raw ID, return it
      if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
      // Else try to extract from URL
      try {
        const u = new URL(input);
        if (u.hostname.includes('youtu.be')) {
          return u.pathname.slice(1);
        }
        if (u.hostname.includes('youtube.com')) {
          if (u.searchParams.get('v')) return u.searchParams.get('v');
          const match = u.pathname.match(/\/embed\/([^/?#]+)/);
          if (match) return match[1];
        }
      } catch (_) {}
      return input; // fallback
    };

    const toCard = (it) => {
      // IMAGE
      if (it.image && it.image.src) {
        const src = it.image.src;
        const alt = it.image.alt || '';
        return `
          <figure class="gallery-item">
            <div class="media-frame">
              <img src="${src}" alt="${alt}" loading="lazy" />
            </div>
          </figure>`;
      }

      // YOUTUBE
      if (it.youtube && it.youtube.video) {
        const id = getYouTubeId(it.youtube.video);
        if (!id) return '';
        const embed = `https://www.youtube.com/embed/${id}?autoplay=0&mute=0&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0`;
        return `
          <figure class="gallery-item">
            <div class="media-frame">
              <iframe class="video-thumb yt-contain"
                src="${embed}"
                title="${it.youtube.title ? it.youtube.title.replace(/"/g, '&quot;') : 'YouTube video'}"
                frameborder="0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowfullscreen>
              </iframe>
            </div>
          </figure>`;
      }

      return '';
    };

    grid.innerHTML = items.map(toCard).join('');
  } catch (err) {
    console.error(err);
  }
})();
