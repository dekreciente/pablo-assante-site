// /js/gallery-loader.js
(async function () {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  try {
    const res = await fetch("/content/gallery.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar gallery.json");
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    console.log("[gallery] items:", items.length);

    // --- helpers ---
    const card = (...children) => {
      const fig = document.createElement("figure");
      fig.className = "gallery-item";
      const frame = document.createElement("div");
      frame.className = "media-frame";
      children.forEach(c => c && frame.appendChild(c));
      fig.appendChild(frame);
      return fig;
    };

    const ytId = (v) => {
      const m = String(v).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
      return m ? m[1] : String(v);
    };

    // --- build ---
    const frag = document.createDocumentFragment();
    for (const it of items) {
      if (it.type === "image" && it.src) {
        const img = new Image();
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = it.alt || "";
        img.src = it.src; // ✅ ya viene correcto desde el CMS (/public/uploads/...)
        frag.appendChild(card(img));
      } else if (it.type === "youtube" && it.video) {
        const id = ytId(it.video);
        const ifr = document.createElement("iframe");
        ifr.className = "yt-contain";
        ifr.src = `https://www.youtube.com/embed/${id}?autoplay=0&controls=1&modestbranding=1&rel=0`;
        ifr.allowFullscreen = true;
        ifr.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        );
        frag.appendChild(card(ifr));
      }
    }

    grid.innerHTML = "";
    grid.appendChild(frag);
  } catch (e) {
    console.error("Error cargando galería:", e);
    grid.innerHTML = `<p class="error">❌ No se pudo cargar la galería: ${String(e)}</p>`;
  }
})();
