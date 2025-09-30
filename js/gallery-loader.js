// /js/gallery-loader.js
(async function () {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  // Normaliza rutas: "public/uploads/..." -> "/uploads/..."
  function resolveSrc(p) {
    if (!p) return "";
    let s = String(p).trim();
    s = s.replace(/^\/?public\/uploads/i, "/uploads");
    s = s.replace(/^public\//i, "/");
    if (!/^https?:\/\//i.test(s) && !s.startsWith("/")) s = "/" + s;
    return s;
  }

  try {
    // Carga el JSON
    const res = await fetch("/content/gallery.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Cannot load gallery.json");
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    console.log("[gallery] items:", items.length);

    // Helpers para crear elementos
    const card = (...children) => {
      const fig = document.createElement("figure");
      fig.className = "gallery-item";
      const frame = document.createElement("div");
      frame.className = "media-frame";
      children.forEach(c => c && frame.appendChild(c));
      fig.appendChild(frame);
      return fig;
    };
    const caption = (title) =>
      title ? Object.assign(document.createElement("figcaption"), { textContent: title }) : null;

    const frag = document.createDocumentFragment();

    for (const item of items) {
      // Caso: imagen
      if (item.src) {
        const img = new Image();
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = item.alt || "";
        img.src = resolveSrc(item.src);

        img.addEventListener("error", () => {
          console.error("Image failed:", img.src);
          img.title = "Image not found: " + img.src;
          img.style.outline = "2px solid #f00";
        });

        const fig = card(img);
        const cap = caption(item.title);
        if (cap) fig.appendChild(cap);
        frag.appendChild(fig);

      // Caso: YouTube
      } else if (item.video) {
        const v = String(item.video).trim();
        const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
        const id = m ? m[1] : v;
        const ifr = document.createElement("iframe");
        ifr.className = "yt-contain";
        ifr.src = `https://www.youtube.com/embed/${id}?autoplay=0&controls=1&modestbranding=1&rel=0`;
        ifr.allowFullscreen = true;
        ifr.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        ifr.setAttribute("referrerpolicy", "no-referrer-when-downgrade");

        const fig = card(ifr);
        const cap = caption(item.title);
        if (cap) fig.appendChild(cap);
        frag.appendChild(fig);
      }
    }

    grid.innerHTML = "";
    grid.appendChild(frag);

  } catch (e) {
    console.error("Error cargando galería:", e);
    grid.innerHTML = `<p class="error">❌ No se pudo cargar la galería: ${String(e)}</p>`;
  }
})();
