// /js/gallery-loader.js
(function () {
  const GRID_ID = "gallery-grid";
  // Importante: tu gallery.json está en content/
  const DATA_URL = "content/gallery.json";

  const YT_RE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/;

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v == null) return;
      if (k === "class") node.className = v;
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c == null) return;
      node.append(c && c.nodeType ? c : document.createTextNode(c));
    });
    return node;
  }

  function normSrc(src) {
    // Con tu config, CMS devuelve /uploads/archivo.ext (ya público).
    // Si viniera relativo (sin barra), lo dejamos tal cual.
    return src;
  }

  function youtubeId(input) {
    if (!input) return null;
    // Si es URL, intenta extraer el ID
    const m = String(input).match(YT_RE);
    if (m) return m[1];
    // Si ya es un ID de 11 chars, úsalo
    if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
    // Si es una URL con ?v=… sin coincidir arriba
    try {
      const u = new URL(input, location.origin);
      const v = u.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    } catch (_) {}
    return null;
  }

  function renderImage({ src, alt = "", title = "", width, height }) {
    const img = el("img", {
      src: normSrc(src),
      alt,
      loading: "lazy",
      decoding: "async",
      width,
      height
    });
    return el("figure", { class: "gallery-item" }, img, title ? el("figcaption", {}, title) : null);
  }

  function renderYouTube({ video, title = "" }) {
    const id = youtubeId(video);
    if (!id) return el("div", { class: "gallery-item error" }, "Video de YouTube inválido");
    const iframe = el("iframe", {
      src: `https://www.youtube.com/embed/${id}`,
      title: title || "YouTube video",
      frameBorder: "0",
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      allowFullscreen: true,
      loading: "lazy",
      referrerPolicy: "no-referrer-when-downgrade"
    });
    // wrapper responsive 16:9
    const wrap = el("div", { class: "yt-wrap" }, iframe);
    return el("figure", { class: "gallery-item" }, wrap, title ? el("figcaption", {}, title) : null);
  }

  async function load() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    grid.innerHTML = "<p>📦 Cargando galería…</p>";

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); // { items: [...] }
      const items = Array.isArray(data?.items) ? data.items : [];

      grid.innerHTML = "";
      if (items.length === 0) {
        grid.append(el("p", { class: "empty" }, "No hay imágenes todavía."));
        return;
      }

      for (const item of items) {
        // Netlify CMS "list types": image | youtube
        if (item?.src) {
          grid.append(renderImage(item));
        } else if (item?.video) {
          grid.append(renderYouTube(item));
        }
      }
    } catch (err) {
      console.error("Error cargando galería:", err);
      grid.innerHTML = `<p class="error">❌ No se pudo cargar la galería: ${String(err)}</p>`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
