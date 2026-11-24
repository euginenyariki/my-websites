/* LinkShelf — a local-only bookmark library. */
const KEY = 'linkshelf:v1';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toast = m => { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); };

const demo = [
  { id: 1, title: 'GitHub', url: 'https://github.com/euginenyariki', folder: 'Work', tags: ['code', 'profile'], note: 'My repos and contributions.', visits: 12, fav: true, at: Date.now() - 1000 },
  { id: 2, title: 'MDN Web Docs', url: 'https://developer.mozilla.org', folder: 'Learning', tags: ['docs', 'web'], note: 'The reference I open every day.', visits: 30, fav: true, at: Date.now() - 2000 },
  { id: 3, title: 'Next.js Documentation', url: 'https://nextjs.org/docs', folder: 'Learning', tags: ['docs', 'react'], note: 'App Router patterns and API reference.', visits: 18, fav: false, at: Date.now() - 3000 },
  { id: 4, title: 'Azure Portal', url: 'https://portal.azure.com', folder: 'Work', tags: ['cloud'], note: 'Infrastructure and deployments.', visits: 9, fav: false, at: Date.now() - 4000 },
  { id: 5, title: 'Prisma Docs', url: 'https://www.prisma.io/docs', folder: 'Learning', tags: ['database', 'typescript'], note: 'Schema, migrations and adapters.', visits: 7, fav: false, at: Date.now() - 5000 },
  { id: 6, title: 'Awesome CSS', url: 'https://github.com/bradtraversy/awesome-css-frameworks-and-tools', folder: 'Inspiration', tags: ['css', 'design'], note: 'Design system inspiration.', visits: 4, fav: false, at: Date.now() - 6000 },
];
let state = load();
let folder = 'all', tag = 'all';
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.links)) return s; } catch (_) {} return { links: structuredClone(demo) }; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
function host(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return url; } }

function render() {
  const links = state.links;
  const folders = ['all', ...new Set(links.map(l => l.folder).filter(Boolean))];
  const tags = [...new Set(links.flatMap(l => l.tags || []))].sort();
  if (!folders.includes(folder)) folder = 'all';
  if (tag !== 'all' && !tags.includes(tag)) tag = 'all';
  document.getElementById('folder').innerHTML = ['Work', 'Learning', 'Inspiration', ...folders.slice(1)].filter((v, i, a) => a.indexOf(v) === i).map(f => `<option>${esc(f)}</option>`).join('');
  document.getElementById('folders').innerHTML = folders.map(f => `<button class="chip ${f === folder ? 'active' : ''}" data-folder="${esc(f)}">${f === 'all' ? 'All links' : esc(f)}</button>`).join('');
  document.getElementById('tagFilters').innerHTML = `<button class="chip ${tag === 'all' ? 'active' : ''}" data-tag="all">All tags</button>` + tags.map(t => `<button class="chip ${t === tag ? 'active' : ''}" data-tag="${esc(t)}">#${esc(t)}</button>`).join('');
  const q = (document.getElementById('search').value || '').toLowerCase().trim();
  const sort = document.getElementById('sort').value;
  const list = links.filter(l => (folder === 'all' || l.folder === folder) && (tag === 'all' || (l.tags || []).includes(tag)) &&
    (!q || `${l.title} ${l.url} ${l.note} ${(l.tags || []).join(' ')}`.toLowerCase().includes(q)))
    .sort((a, b) => sort === 'az' ? a.title.localeCompare(b.title) : sort === 'visits' ? (b.visits || 0) - (a.visits || 0) : b.at - a.at);
  document.getElementById('stats').innerHTML = [
    ['Saved links', links.length, 'in your shelf'],
    ['Folders', new Set(links.map(l => l.folder)).size, 'organised spaces'],
    ['Total visits', links.reduce((n, l) => n + (l.visits || 0), 0), 'opens tracked locally'],
  ].map(([l, v, h]) => `<div class="stat"><div class="label">${l}</div><div class="value">${v}</div><div class="muted">${h}</div></div>`).join('');
  document.getElementById('cards').innerHTML = list.length ? list.map(l => `<article class="link" data-id="${l.id}">
    <div class="link-top"><h3>${esc(l.title)}</h3><button class="fav ${l.fav ? 'on' : ''}" data-fav="${l.id}" title="Favourite">${l.fav ? '★' : '☆'}</button></div>
    <div class="host">${esc(host(l.url))}</div>
    <p class="note">${esc(l.note || 'No note')}</p>
    <div class="tags">${(l.tags || []).map(t => `<span>#${esc(t)}</span>`).join('')}</div>
    <div class="link-actions"><button data-open="${l.id}">Open ↗</button><button data-copy="${l.id}">Copy</button><button data-edit="${l.id}">Edit</button><button data-del="${l.id}">Delete</button></div>
  </article>`).join('') : '<div class="empty">Nothing here. Add a link above or try another filter.</div>';
  save();
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('linkshelf:dark') === 'true') document.body.classList.add('dark');
  render();
  document.getElementById('addForm').addEventListener('submit', e => {
    e.preventDefault();
    const url = document.getElementById('url').value.trim();
    let parsed;
    try { parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad'); } catch (_) { toast('Enter a valid http/https URL'); return; }
    state.links.unshift({
      id: Date.now(), title: document.getElementById('title').value.trim() || parsed.hostname,
      url: parsed.href, folder: document.getElementById('folder').value,
      tags: document.getElementById('tags').value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      note: document.getElementById('note').value.trim(), visits: 0, fav: false, at: Date.now(),
    });
    e.target.reset(); render(); toast('Link saved');
  });
  document.getElementById('folders').addEventListener('click', e => { const b = e.target.closest('[data-folder]'); if (b) { folder = b.dataset.folder; render(); } });
  document.getElementById('tagFilters').addEventListener('click', e => { const b = e.target.closest('[data-tag]'); if (b) { tag = b.dataset.tag; render(); } });
  ['search', 'sort'].forEach(id => document.getElementById(id).addEventListener('input', render));
  document.getElementById('cards').addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    const id = Number(b.dataset.fav || b.dataset.open || b.dataset.copy || b.dataset.edit || b.dataset.del);
    const link = state.links.find(l => l.id === id); if (!link) return;
    if (b.dataset.fav) { link.fav = !link.fav; render(); }
    if (b.dataset.open) { link.visits = (link.visits || 0) + 1; window.open(link.url, '_blank', 'noopener,noreferrer'); render(); }
    if (b.dataset.copy) { try { await navigator.clipboard.writeText(link.url); toast('URL copied'); } catch (_) { toast('Clipboard unavailable'); } }
    if (b.dataset.edit) {
      const title = prompt('Title', link.title); if (title === null) return;
      const note = prompt('Note', link.note || ''); if (note === null) return;
      const tags = prompt('Tags (comma separated)', (link.tags || []).join(', ')); if (tags === null) return;
      link.title = title.trim() || link.title; link.note = note.trim();
      link.tags = tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean); render(); toast('Link updated');
    }
    if (b.dataset.del && confirm(`Delete "${link.title}"?`)) { state.links = state.links.filter(l => l.id !== id); render(); toast('Link deleted'); }
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })); a.download = 'linkshelf.json'; a.click(); URL.revokeObjectURL(a.href); toast('Shelf exported');
  });
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data) ? data : data.links;
      if (!Array.isArray(incoming)) throw new Error('bad');
      const clean = incoming.filter(l => l && l.url).map((l, i) => ({ id: Date.now() + i, title: String(l.title || host(l.url)), url: String(l.url), folder: String(l.folder || 'Imported'), tags: Array.isArray(l.tags) ? l.tags.map(String) : [], note: String(l.note || ''), visits: Number(l.visits) || 0, fav: Boolean(l.fav), at: Date.now() }));
      state.links = [...clean, ...state.links]; render(); toast(`Imported ${clean.length} links`);
    } catch (_) { toast('Could not read that JSON file'); }
    e.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => { if (!confirm('Restore the demo shelf?')) return; state = { links: structuredClone(demo) }; folder = 'all'; tag = 'all'; render(); toast('Demo shelf restored'); });
  document.getElementById('themeBtn').addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('linkshelf:dark', document.body.classList.contains('dark')); });
});
