// /js/gallery-loader.js
(function () {
  const GRID_ID = "gallery-grid";
  const DATA_URL = "/data/gallery.json"; // ver sección 3

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k.startsWith("data-")) node.setAttribute(k, v);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    });
    children.flat().forEach(c => node.append(c && c.nodeType ? c : document.createTextNode(c)));
    return node;
  }

  async function load() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = await res.json(); // [{src, alt, title, width, height}]
      if (!Array.isArray(items)) throw new Error("JSON no es un array");

      grid.innerHTML = "";
      if (items.length === 0) {
        grid.append(el("p", { class: "empty" }, "No hay imágenes todavía."));
        return;
      }

      for (const item of items) {
        const { src, alt = "", title = "", width, height } = item;
        const img = el("img", {
          loading: "lazy",
          decoding: "async",
          alt,
          src,
          width,
          height
        });
        const fig = el(
          "figure",
          { class: "gallery-item" },
          img,
          title ? el("figcaption", {}, title) : null
        );
        grid.append(fig);
      }
    } catch (err) {
      console.error("Error cargando galería:", err);
      const grid = document.getElementById(GRID_ID);
      if (grid) {
        grid.innerHTML = "";
        grid.append(
          el("p", { class: "error" }, "No se pudo cargar la galería. Revisa la consola.")
        );
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
