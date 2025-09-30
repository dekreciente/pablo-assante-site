// /js/gallery-loader.js
(function () {
  const GRID_ID = "gallery-grid";
  const DATA_URL = "content/gallery.json";
  const YT_RE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/;

  function el(tag, attrs = {}, ...children) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === "class") n.className = v;
      else if (k in n) n[k] = v;
      else n.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(c));
    return n;
  }

  const youtubeId = (input) => {
    if (!input) return null;
    const m = String(input).match(YT_RE);
    if (m) return m[1];
    try {
      const u = new URL(input, location.origin);
      const v = u.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    } catch {}
    return /^[A-Za-z0-9_-]{11}$/.test(input) ? input : null;
  };

  const renderImage = ({ src, alt = "", title = "", width, height }) =>
    el("figure", { class: "gallery-item" },
      el("img", { src, alt, loading: "lazy", decoding: "async", width, height }),
      title ? el("figcaption", {}, title) : null
    );

  const renderYouTube = ({ video, title = "" }) => {
    const id = youtubeId(video);
    if (!id) return el("div", { class: "gallery-item error" }, "Video de YouTube inválido");
    const wrap = el("div", { class: "yt-wrap" },
      el("iframe", {
        src: `https://www.youtube.com/embed/${id}`,
        title: title || "YouTube video",
        frameBorder: "0",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowFullscreen: true,
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade"
      })
    );
    return el("figure", { class: "gallery-item" }, wrap, title ? el("figcaption", {}, title) : null);
  };

  async function load() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;
    grid.innerHTML = "<p>📦 Cargando galería…</p>";

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];

      grid.innerHTML = "";
      if (!items.length) { grid.innerHTML = "<p>No hay imágenes todavía.</p>"; return; }

      for (const item of items) {
        if (item.src) grid.append(renderImage(item));
        else if (item.video) grid.append(renderYouTube(item));
      }
    } catch (e) {
      console.error("Error cargando galería:", e);
      grid.innerHTML = `<p class="error">❌ No se pudo cargar la galería: ${String(e)}</p>`;
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", load) : load();
})();
