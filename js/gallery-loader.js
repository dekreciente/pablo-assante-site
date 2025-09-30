// js/gallery-loader.js
(async () => {
  try {
    const res = await fetch('/content/gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : data;

    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const frag = document.createDocumentFragment();

    for (const it of items) {
      // ----- IMAGE -----
      if (it.type === 'image' || it.name === 'image') {
        let src = it.src || it.url || '';

        // strip "public/" if CMS saved "public/uploads/..."
        src = src.replace(/^public\//, '');

        // if not http(s) and not already root-relative, make it root-relative
        if (!/^https?:\/\//i.test(src) && !src.startsWith('/')) {
          src = '/' + src.replace(/^\.?\//, '');
        }

        const fig = document.createElement('figure');
        fig.className = 'gallery-item';
        fig.innerHTML = `
          <div class="media-frame">
            <img loading="lazy" src="${src}" alt="${it.alt || ''}">
          </div>`;
        frag.appendChild(fig);
      }

      // ----- YOUTUBE -----
      if (it.type === 'youtube' || it.name === 'youtube') {
        const val = it.video || '';
        let id = val;
        try {
          const u = new URL(val);
          id = u.searchParams.get('v') || u.pathname.split('/').pop() || val;
        } catch { /* already an ID */ }
        const src = `https://www.youtube.com/embed/${id}?autoplay=0&mute=0&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0`;

        const fig = document.createElement('figure');
        fig.className = 'gallery-item';
        fig.innerHTML = `
          <div class="media-frame">
            <iframe class="yt-contain" src="${src}"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen></iframe>
          </div>`;
        frag.appendChild(fig);
      }
    }

    grid.replaceChildren(frag);
  } catch (e) {
    console.error('Gallery load failed:', e);
  }
})();
