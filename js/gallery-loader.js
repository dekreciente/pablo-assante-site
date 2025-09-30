// js/gallery-loader.js
(async function () {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  // Normalize any path the CMS gives us to something the site can serve
  function resolveSrc(p) {
    if (!p) return "";
    let s = String(p).trim();

    // If the CMS stored a repo path, map it to the public URL
    // e.g. "public/uploads/file.jpg" -> "/uploads/file.jpg"
    s = s.replace(/^\/?public\/uploads/i, "/uploads");
    s = s.replace(/^public\//i, "/");        // just in case

    // Ensure it starts with "/" if it's a site-relative path
    if (!/^https?:\/\//i.test(s) && !s.startsWith("/")) s = "/" + s;

    return s;
  }

  // Fetch data authored in /content/gallery.json (committed by Decap)
  const res = await fetch("/content/gallery.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load gallery.json");
  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];

  // Helper: create a gallery card
  function card(children) {
    const fig = document.createElement("figure");
    fig.className = "gallery-item";
    const frame = document.createElement("div");
    frame.className = "media-frame";
    children.forEach(c => frame.appendChild(c));
    fig.appendChild(frame);
    return fig;
  }

  // Build DOM
  const frag = document.createDocumentFragment();

  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.loading = "lazy";
      img.alt = item.alt || "";
      img.src = resolveSrc(item.src || item.image || "");

      // helpful debug if an image fails to load
      img.addEventListener("error", () => {
        console.error("Image failed:", img.src);
        img.title = "Image not found: " + img.src;
        img.style.outline = "2px solid #f00";
      });

      frag.appendChild(card([img]));
    } else if (item.youtube) {
      // Accept full YouTube URL or just the ID
      let v = (item.video || item.youtube || "").trim();
      const m = v.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
      const id = m ? m[1] : v;
      const ifr = document.createElement("iframe");
      ifr.className = "video-thumb yt-contain";
      ifr.src = `https://www.youtube.com/embed/${id}?autoplay=0&mute=0&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0`;
      ifr.setAttribute("frameborder", "0");
      ifr.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
      ifr.allowFullscreen = true;
      frag.appendChild(card([ifr]));
    }
  });

  grid.innerHTML = "";
  grid.appendChild(frag);
})();
