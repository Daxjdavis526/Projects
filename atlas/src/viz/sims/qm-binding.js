// The curve of binding energy: binding energy per nucleon, B/A, against mass
// number A, from measured atomic masses (AME2020), with the liquid-drop
// (semi-empirical) formula as a smooth curve. Pick a nuclide to read its
// mass defect and binding energy; switch on fusion and fission to see both
// climb toward the peak near iron and nickel. Physics in
// model/qm-nuclear.js (tested in test/qm-nuclear.test.mjs).
//
//   { type: 'qm-binding', params: {
//       nuclide: 'Fe-56',     // the highlighted nuclide (a name in NUCLIDES), or null for none
//       semf: true,           // the liquid-drop curve
//       reactions: false,     // arrows for fusion (light nuclei) and fission (heavy ones)
//       labels: true,         // name the landmark nuclides
//       controls: null,       // true, false, or a list of: nuclide semf reactions
//       readout: true,
//       hide: [],             // 'B' hides the highlighted nuclide’s binding energy (point drawn, value withheld)
//       zoom: null,           // [Amin, Amax, ymin, ymax] to look at part of the curve
//   } }

import { Plot } from '../plot.js';
import * as Nu from '../model/qm-nuclear.js';

export const defaults = { nuclide: 'Fe-56', semf: true, reactions: false, labels: true, controls: null, readout: true, hide: [], zoom: null };
const CONTROLS = ['nuclide', 'semf', 'reactions'];
const LANDMARKS = ['H-2', 'He-4', 'Li-6', 'C-12', 'O-16', 'Fe-56', 'Ni-62', 'Kr-84', 'Sn-120', 'Ba-138', 'Pb-208', 'U-235', 'U-238'];
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** 'Fe-56' → '⁵⁶Fe' for canvas labels, and → {}^{56}\text{Fe} in TeX. */
const nice = (name) => { const [el, A] = name.split('-'); return A.replace(/\d/g, (d) => SUP[d]) + el; };
const texName = (name) => { const [el, A] = name.split('-'); return `{}^{${A}}\\text{${el}}`; };
const PICKS = ['H-2', 'H-3', 'He-3', 'He-4', 'Li-7', 'C-12', 'O-16', 'Ne-20', 'Si-28', 'Ca-40', 'Fe-56', 'Ni-62', 'Kr-84', 'Zr-90', 'Sn-120', 'Ba-138', 'Au-197', 'Pb-208', 'Ra-226', 'U-235', 'U-238', 'Pu-238'];

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const picks = PICKS.includes(P.nuclide) || !P.nuclide ? PICKS : [...PICKS, P.nuclide].sort((a, b) => Nu.byName[a].A - Nu.byName[b].A);
  if (wanted.includes('nuclide')) F.slider({ key: 'k', label: 'Nuclide', min: 0, max: picks.length - 1, step: 1, value: Math.max(0, picks.indexOf(P.nuclide)), explain: 'Step through nuclides from the lightest to the heaviest.', fmt: (v) => texName(picks[Math.round(v)]) });
  else F.params.k = Math.max(0, picks.indexOf(P.nuclide));
  if (wanted.includes('semf')) F.toggle({ key: 'semf', label: 'Liquid-drop model', value: P.semf, explain: 'A formula that treats the nucleus as a charged drop: volume, surface, electric repulsion and neutron–proton balance.' });
  else F.params.semf = P.semf;
  if (wanted.includes('reactions')) F.toggle({ key: 'reactions', label: 'Fusion and fission', value: P.reactions, explain: 'Either way, energy is released when the products sit higher on the curve.' });
  else F.params.reactions = P.reactions;

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'Binding energy per nucleon against mass number' });
  const [x0, x1, y0, y1] = P.zoom || [0, 245, 0, 9.6];
  const plot = new Plot(canvas, { x: [x0, x1], y: [y0, y1], xlabel: 'mass number A (protons + neutrons)', ylabel: 'binding energy per nucleon (MeV)' });
  const sel = () => (P.nuclide === null ? null : Nu.byName[picks[Math.round(F.params.k)]]);

  function draw() {
    plot.clear();
    if (F.params.semf) plot.fn((A) => (A >= 4 ? Nu.semfCurve(Math.round(A)) : NaN), { color: 'ink3', width: 1.6, dash: [6, 4], domain: [Math.max(4, x0), x1], samples: 240 });
    for (const n of Nu.NUCLIDES) {
      if (n.A < x0 || n.A > x1) continue;
      const v = Nu.bindingPerNucleon(n);
      plot.point(n.A, v, { color: 'accent', r: 3.4 });
    }
    // the highlighted nuclide's label: below and to the right of a light nucleus, above a middling
    // one (clear of the fission arrows), below and to the left of a heavy one
    const n = sel(), shown = n && n.A >= x0 && n.A <= x1;
    let gold = null;
    if (shown) {
      const v = Nu.bindingPerNucleon(n), text = hide.has('B') ? `${nice(n.name)}: ?` : `${nice(n.name)}: ${v.toFixed(3)} MeV`;
      const [dx, dy, align] = n.A <= 30 ? [12, 18, 'left'] : n.A <= 180 ? [10, -16, 'left'] : [-12, 18, 'right'];
      const w = text.length * 7.4, x = plot.X(n.A) + dx, y = plot.Y(v) + dy;
      const px = plot.X(n.A), py = plot.Y(v);
      gold = { v, text, dx, dy, align, box: [align === 'left' ? x : x - w, align === 'left' ? x + w : x, y - 8, y + 8], dot: [px - 8, px + 8, py - 8, py + 8] };
    }
    const overlaps = (a, b) => a[0] < b[1] && b[0] < a[1] && a[2] < b[3] && b[2] < a[3];
    if (P.labels) for (const name of LANDMARKS) {
      const m = Nu.byName[name], v = Nu.bindingPerNucleon(m);
      if (m.A < x0 || m.A > x1 || v < y0 || v > y1 || (shown && m === n)) continue;
      const below = ['Ni-62', 'U-238', 'Kr-84', 'Ba-138', 'Li-6'].includes(name);
      const dx = name === 'H-2' ? 8 : 0, dy = below ? 14 : -12, w = nice(name).length * 6.6;
      const x = plot.X(m.A) + dx, y = plot.Y(v) + dy, box = name === 'H-2' ? [x, x + w, y - 7, y + 7] : [x - w / 2, x + w / 2, y - 7, y + 7];
      if (gold && (overlaps(box, gold.box) || overlaps(box, gold.dot))) continue;      // the highlighted nuclide wins
      plot.text(nice(name), m.A, v, { color: 'ink2', dx, dy, align: name === 'H-2' ? 'left' : 'center', size: 11 });
    }
    if (F.params.reactions) {
      plot.arrow(4, 2.0, 4, 6.6, { color: 'good', width: 2.4 });
      plot.text('fusion: light nuclei join', 9, 3.4, { color: 'good', align: 'left', size: 12 });
      plot.arrow(232, 7.45, 150, 8.18, { color: 'warn', width: 2.4 });
      plot.arrow(232, 7.45, 100, 8.45, { color: 'warn', width: 2.4 });
      plot.text('fission: a heavy nucleus splits', 236, 6.2, { color: 'warn', align: 'right', size: 12 });
    }
    if (gold) {
      plot.point(n.A, gold.v, { color: 'gold', r: 6.5 });
      plot.text(gold.text, n.A, gold.v, { color: 'gold', dx: gold.dx, dy: gold.dy, align: gold.align, size: 12.5, weight: 700 });
    }
    readout(n);
  }
  function readout(n) {
    if (P.readout === false) return;
    if (!n) { F.readout([]); return; }
    const dm = Nu.massDefect(n), B = Nu.binding(n);
    F.readout([
      ['nuclide', `${texName(n.name)}:\\ Z = ${n.Z},\\ N = ${n.N},\\ A = ${n.A}`],
      ['atomic mass', `${n.M.toFixed(6)}\\,\\mathrm{u}`],
      ['mass defect $\\Delta m$', hide.has('B') ? '?' : `${dm.toFixed(6)}\\,\\mathrm{u}`],
      ['binding energy $B$', hide.has('B') ? '?' : `${B.toFixed(2)}\\,\\mathrm{MeV}`],
      ['$B/A$', hide.has('B') ? '?' : `${(B / n.A).toFixed(3)}\\,\\mathrm{MeV}`],
    ]);
  }
  F.onChange(draw);
  F.draw(draw);
  F.caption(P.caption || 'Dots: measured nuclides (atomic masses from the 2020 Atomic Mass Evaluation). Dashed: the liquid-drop formula, a model that misses the extra stability of helium-4 and other “magic” nuclei. The peak lies near iron and nickel: nickel-62 is the most tightly bound, iron-58 and iron-56 a whisker behind.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (P.nuclide !== null && !Nu.byName[P.nuclide]) p.push(`qm-binding: unknown nuclide “${P.nuclide}”`);
  for (const h of P.hide || []) if (h !== 'B') p.push(`qm-binding: unknown hide “${h}”`);
  if (P.zoom && !(Array.isArray(P.zoom) && P.zoom.length === 4 && P.zoom[0] < P.zoom[1] && P.zoom[2] < P.zoom[3])) p.push('qm-binding: zoom is [Amin, Amax, ymin, ymax]');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`qm-binding: unknown control “${c}”`);
  return p;
}
