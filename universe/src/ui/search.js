/* ============================================================================
   ui/search.js — search + quick-jump bookmarks
   ========================================================================== */
const $ = s => document.querySelector(s);

const BOOKMARKS = [
  ['Earth', 'earth'], ['Moon', 'moon'], ['Solar System', 'sun'],
  ['Heliopause', 'heliopause'], ['Oort Cloud', 'oort'],
  ['Nearest Stars', 'star:Proxima Centauri'], ['Orion Nebula', 'neb:Orion Nebula (M42)'],
  ['Pleiades', 'cl2:Pleiades (M45)'], ['TRAPPIST-1', 'star:TRAPPIST-1'],
  ['Milky Way', 'milkyway'],
  ['Galactic Center', 'sgra'], ['Andromeda', 'lg:Andromeda Galaxy (M31)'],
  ['Local Group', 'localgroup'], ['Virgo Cluster', 'cl:Virgo Cluster'],
  ['Laniakea', 'laniakea'], ['Cosmic Web', 'cosmicweb'],
  ['Observable Universe', 'observable'],
];

export class Search {
  constructor(registry, goto) {
    this.registry = registry;
    this.goto = goto;
    this.box = $('#searchbox');
    this.input = $('#searchInput');
    this.results = $('#searchResults');
    this.hot = 0;
    const chips = $('#chips');
    for (const [label, id] of BOOKMARKS) {
      const b = document.createElement('button');
      b.textContent = label;
      b.onclick = () => { this.close(); this._go(id); };
      chips.appendChild(b);
    }
    this.input.addEventListener('input', () => this._render());
    this.input.addEventListener('keydown', e => {
      const items = this.results.querySelectorAll('button');
      if (e.key === 'ArrowDown') { this.hot = Math.min(this.hot + 1, items.length - 1); this._mark(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { this.hot = Math.max(this.hot - 1, 0); this._mark(); e.preventDefault(); }
      else if (e.key === 'Enter' && items[this.hot]) items[this.hot].click();
    });
  }
  _go(id) {
    const o = this.registry.find(r => r.id === id);
    if (o) this.goto(o);
  }
  _render() {
    const q = this.input.value.trim().toLowerCase();
    this.hot = 0;
    if (!q) { this.results.innerHTML = ''; return; }
    const scored = [];
    for (const o of this.registry) {
      const n = o.name.toLowerCase();
      let s = -1;
      if (n.startsWith(q)) s = 0;
      else if (n.includes(q)) s = 1;
      else if ((o.cls ?? '').toLowerCase().includes(q)) s = 2;
      if (s >= 0) scored.push([s, o]);
    }
    scored.sort((a, b) => a[0] - b[0] || b[1].priority - a[1].priority);
    this.results.innerHTML = '';
    for (const [, o] of scored.slice(0, 9)) {
      const b = document.createElement('button');
      b.innerHTML = `<span>${o.name}</span><span class="k">${o.kind}</span>`;
      b.onclick = () => { this.close(); this.goto(o); };
      this.results.appendChild(b);
    }
    this._mark();
  }
  _mark() {
    this.results.querySelectorAll('button').forEach((b, i) =>
      b.classList.toggle('hot', i === this.hot));
  }
  open() { this.box.classList.add('on'); this.input.value = ''; this.results.innerHTML = ''; this.input.focus(); }
  close() { this.box.classList.remove('on'); this.input.blur(); }
  get isOpen() { return this.box.classList.contains('on'); }
}
