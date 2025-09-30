// js/events-loader.js
(async function () {
  try {
    const res = await fetch('/content/events.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Cannot load events.json');
    const data = await res.json();
    const events = Array.isArray(data.events) ? data.events : [];

    // sort by date ascending
    events.sort((a, b) => new Date(a.start) - new Date(b.start));

    const tbody = document.getElementById('events-body');
    if (!tbody) return;

    const toHuman = (iso) => {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };
    const toSort = (iso) => {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    };

    tbody.innerHTML = events.map(ev => {
      const title = ev.title || '';
      const tags = ev.tags || '';
      const start = ev.start || new Date().toISOString();
      const loc = ev.location || '';
      const link = ev.link ? `<a href="${ev.link}" aria-label="Open event" target="_blank" rel="noopener">↗</a>` : '';
      return `
        <tr data-sort-date="${toSort(start)}">
          <td class="ev-title">${title}</td>
          <td class="ev-tags">${tags}</td>
          <td class="ev-date">${toHuman(start)}</td>
          <td class="ev-loc">${loc}</td>
          <td class="ev-link">${link}</td>
        </tr>`;
    }).join('');
  } catch (e) {
    console.error(e);
  }
})();
