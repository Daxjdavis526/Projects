// The electric field of charges you place and drag: field vectors, field lines,
// equipotentials, a probe that reads E and V (and the force on a test charge),
// a Gaussian surface you move and resize whose numerically integrated flux is
// shown beside Q_enc/ε₀, an open patch with its flux, a charged particle you
// launch through the field, and a profile of V along a line. Sources: point
// charges; rods (which can be chopped into point-charge pieces); long line
// charges and charged sheets or strips standing across the page (seen end-on
// and edge-on); uniformly charged balls and shells; a uniform field; and one
// conducting sphere, solid or hollow, with its exact induced charge. The
// physics is model/em-field.js, tested headlessly in test/em-field.test.mjs.
//
//   { type: 'em-field', params: {
//       unit: 'cm', qunit: 'nC',            // positions and sizes in m|cm|mm|um; charges in C|uC|nC|pC|e
//       x: [-10, 10], y: [-6, 6],           // the view (in `unit`; the shorter range grows to keep scales equal)
//       charges: [{ x: -3, y: 0, q: 2, label: 'A', drag: true }],   // q: a number or an expression of slider keys
//       rods: [{ x1, y1, x2, y2, Q, pieces: 'n' }],                 // pieces ≥ 1: that many point charges instead
//       fan: false,                         // with pieces: draw each piece's own field at the probe (up to 24)
//       lines: [{ x, y, lambda }],          // line charges across the page; λ in qunit per metre
//       sheets: [{ x, y, angle: 90, sigma, width }],                // sheets across the page; σ in qunit per m²; no width = infinite
//       balls: [{ x, y, R, Q, shell: false }],
//       uniform: [Ex, Ey],                  // N/C
//       conductor: { x, y, R, a: 0, Q: 0 },  // one conducting sphere (a > 0: with a cavity); only with charges and a uniform field
//       ref: [x, y],                        // where V = 0 when the scene has lines, sheets or a uniform field (default the origin)
//       arrows: true | 'linear' | false,    // field vectors (compressed lengths, or to scale)
//       fieldLines: true, equip: false,     // field lines; equipotentials
//       dV: 50, levels: [100, 200],         // equipotential spacing in volts, or explicit levels (default: a tidy step)
//       density: 12,                        // field lines from the largest charge
//       probe: { x: 4, y: 2, label: 'P' } | false,   // drag it; reads E and V
//       test: 1,                            // a test charge at the probe (qunit, or a slider key): draws the force on it
//       gauss: { shape: 'sphere'|'cube'|'box'|'cylinder'|'lumpy', x, y, r, w, h, depth, angle, move: true, resize: true },
//       shapes: ['sphere', 'cube', 'lumpy'],  // offer a choice of the Gaussian surface's shape
//       normals: false,                     // arrows of E·n̂ around the Gaussian surface
//       patch: { shape: 'square'|'disk', x, y, angle, size, move: true, rotate: true },   // an open surface; angle: its normal
//       particle: { kind: 'electron'|'proton'|'alpha'|'xenon' (or a choice key), q (in e), m (kg), x, y, speed (m/s), angle (deg),
//                   fieldLine: false, drag: true, path },   // path: true shows the whole path in a static picture
//       profile: false,                     // a graph of V along the horizontal line through the probe
//       edit: false,                        // buttons to add and remove charges
//       presets: [{ id, label, charges: […], … }], preset: 'id',   // a choice of arrangements (each may also set probe, gauss, …)
//       toggles: ['arrows', 'fieldLines', 'equip'],                 // checkboxes for the layers
//       readouts: ['E', 'V'],               // any of E Ex Ey Edir V F flux Qenc Qeps Esurf Eexact Vc speed K deflect time dVdx
//       labels: true,                       // label charges with their values
//       notes: { arrows: [{ from, to, label, color }], points: [{ x, y, label, color }], lines: [{ from, to, color, dash }] },   // extra marks, in `unit`
//       static: false,                      // no dragging (a picture for a problem)
//       sliders, choices, constants,        // as in graph: keys usable in q, Q, lambda, sigma, uniform, r, speed, …
//       axes: true, grid: true, aspect: '' } }
//
// A picture must not show its answer: set readouts: [] (or leave out the one
// asked for), and fieldLines/equip/arrows as the problem needs.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/em-field.js';

export const defaults = {
  unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6.25, 6.25], aspect: '',
  charges: [], rods: [], lines: [], sheets: [], balls: [], uniform: null, conductor: null, ref: null,
  arrows: true, fieldLines: true, equip: false, dV: null, levels: null, density: null,
  probe: null, test: null, gauss: null, shapes: null, normals: false, patch: null, particle: null,
  profile: false, edit: false, fan: false, presets: null, preset: null, toggles: null, readouts: ['E', 'V'], labels: false,
  static: false, axes: true, grid: true,
};

const UNIT = { m: 1, cm: 0.01, mm: 0.001, um: 1e-6, km: 1000 };
const UNIT_TEX = { m: 'm', cm: 'cm', mm: 'mm', um: 'μm', km: 'km' };
const QUNIT = { C: 1, mC: 1e-3, uC: 1e-6, nC: 1e-9, pC: 1e-12, e: M.E_CHARGE };
const QUNIT_TEX = { C: '\\mathrm{C}', mC: '\\mathrm{mC}', uC: '\\mu\\mathrm{C}', nC: '\\mathrm{nC}', pC: '\\mathrm{pC}', e: 'e' };
const QUNIT_TEXT = { C: 'C', mC: 'mC', uC: 'μC', nC: 'nC', pC: 'pC', e: 'e' };
const READOUTS = ['E', 'Ex', 'Ey', 'Edir', 'V', 'F', 'flux', 'Qenc', 'Qeps', 'Esurf', 'Eexact', 'Vc', 'speed', 'K', 'deflect', 'time', 'dVdx'];
const SHAPES = { sphere: 'Sphere', cube: 'Cube', box: 'Box', cylinder: 'Cylinder', lumpy: 'Lumpy blob' };
const TOGGLES = { arrows: 'Field vectors', fieldLines: 'Field lines', equip: 'Equipotentials', normals: 'Flux arrows on the surface' };
const KINDS = ['electron', 'proton', 'alpha', 'xenon'];

const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
const SCENE_KEYS = ['charges', 'rods', 'lines', 'sheets', 'balls', 'uniform', 'conductor', 'ref', 'probe', 'gauss', 'patch', 'particle'];
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

// numbers for display: n significant figures, as TeX with ×10ⁿ outside 0.01…9999
function texNum(v, n = 3) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (v === 0) return '0';
  const r = +v.toPrecision(n), a = Math.abs(r);
  if (a >= 1e4 || a < 1e-2) { const [m, e] = r.toExponential(n - 1).split('e'); return `${m} \\times 10^{${+e}}`; }
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(a)));
  return r.toFixed(d);
}
const qty = (v, unit, n) => `${texNum(v, n)}\\ \\mathrm{${unit}}`;
// plain text for canvas labels
function txtNum(v, n = 3) {
  if (v === 0) return '0';
  const r = +v.toPrecision(n), a = Math.abs(r);
  if (a >= 1e5 || a < 1e-2) { const [m, e] = r.toExponential(n - 1).split('e'); return `${m}×10${sup(+e)}`.replace('-', '−'); }
  return String(r).replace('-', '−');
}
const sup = (k) => String(k).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] ?? (c === '-' ? '⁻' : c)).join('');
const volts = (v) => (Math.abs(v) >= 1e4 ? `${txtNum(v / 1000)} kV` : `${txtNum(v)} V`);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = !!F.compact;
  const L = UNIT[P.unit] ?? 0.01, QF = QUNIT[P.qunit] ?? 1e-9;
  const ut = UNIT_TEX[P.unit] ?? P.unit;
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'Electric charges with their field: arrows, field lines and a movable probe' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.presets?.length) F.choice({ key: '_preset', label: P.presetLabel || 'Arrangement', options: P.presets.map((p) => [p.id, p.label]), value: P.preset ?? P.presets[0].id, explain: P.presetExplain || '' });
  if (P.shapes?.length) F.choice({ key: '_shape', label: 'Gaussian surface', options: P.shapes.map((s) => [s, SHAPES[s]]), value: P.gauss?.shape ?? P.shapes[0], explain: 'A closed surface in 3D; you see its cross-section in the page.' });
  for (const k of P.toggles || []) F.toggle({ key: `_${k}`, label: TOGGLES[k], value: !!P[k] });
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const num = (v, E) => (v === undefined || v === null ? v : typeof v === 'number' ? v : fn(v, keys)(E));
  const layer = (k) => (P.toggles?.includes(k) ? (F.params[`_${k}`] ? P[k] || true : false) : P[k]);

  // the scene's movable state, in display units; a preset replaces parts of it
  const st = {};
  const load = (src) => { for (const k of SCENE_KEYS) st[k] = clone(src[k] ?? null); };
  const presetOf = (id) => (P.presets || []).find((p) => p.id === id);
  load(P.presets?.length ? { ...P, ...presetOf(F.params._preset) } : P);
  for (const k of ['charges', 'rods', 'lines', 'sheets', 'balls']) st[k] = st[k] || [];

  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: true, xlabel: P.xlabel ?? `x (${ut})`, ylabel: P.ylabel ?? `y (${ut})`, grid: P.grid, axes: P.axes, xticks: compact ? 6 : undefined, yticks: compact ? 5 : undefined });
  const live = !P.static;

  // ── handles ──
  // the probe first (the keyboard's default handle), then the surfaces, then the sources
  const handles = [];
  const addHandle = (kind, get, set, o = {}) => { const H = plot.handle(get, set, { r: o.r ?? 10, label: o.label }); H.kind = kind; handles.push(H); return H; };
  const view = () => ({ x0: plot.vx0, x1: plot.vx1, y0: plot.vy0, y1: plot.vy1 });
  const clampV = (x, y) => { const v = view(), mx = (v.x1 - v.x0) * 0.01; return [Math.max(v.x0 + mx, Math.min(v.x1 - mx, x)), Math.max(v.y0 + mx, Math.min(v.y1 - mx, y))]; };
  function wireHandles() {
    plot.handles.length = 0; handles.length = 0;
    if (!live) return;
    if (st.probe) addHandle('probe', () => [st.probe.x, st.probe.y], (x, y) => { [st.probe.x, st.probe.y] = clampV(x, y); }, { label: 'probe' });
    if (st.particle && st.particle.drag !== false) addHandle('particle', () => [st.particle.x, st.particle.y], (x, y) => { [st.particle.x, st.particle.y] = clampV(x, y); }, { label: 'particle start' });
    st.charges.forEach((c, i) => { if (c.drag !== false) addHandle('charge', () => [c.x, c.y], (x, y) => moveCharge(i, x, y), { label: `charge ${i + 1}` }); });
    st.lines.forEach((l) => { if (l.drag !== false) addHandle('line', () => [l.x, l.y], (x, y) => { [l.x, l.y] = clampV(x, y); }, { label: 'line charge' }); });
    st.balls.forEach((b) => { if (b.drag === true) addHandle('ball', () => [b.x, b.y], (x, y) => { [b.x, b.y] = clampV(x, y); }, { label: 'charged ball' }); });
    st.rods.forEach((r) => {
      if (r.drag !== true) return;
      addHandle('rod', () => [(r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2], (x, y) => { const dx = x - (r.x1 + r.x2) / 2, dy = y - (r.y1 + r.y2) / 2; r.x1 += dx; r.x2 += dx; r.y1 += dy; r.y2 += dy; }, { label: 'rod' });
    });
    const g = st.gauss;
    if (g) {
      if (g.move !== false) addHandle('gauss-move', () => gaussGrip(g, 225), (x, y) => { const [gx, gy] = gaussGrip(g, 225); g.x += x - gx; g.y += y - gy; }, { label: 'move the Gaussian surface' });
      if (g.resize !== false) addHandle('gauss-size', () => gaussGrip(g, 45), (x, y) => resizeGauss(g, x, y), { label: 'resize the Gaussian surface' });
    }
    const pa = st.patch;
    if (pa) {
      if (pa.move !== false) addHandle('patch-move', () => [pa.x, pa.y], (x, y) => { [pa.x, pa.y] = clampV(x, y); }, { label: 'move the surface' });
      if (pa.rotate !== false) addHandle('patch-turn', () => patchTip(pa), (x, y) => { pa.angle = Math.round((Math.atan2(y - pa.y, x - pa.x) * 180) / Math.PI); }, { label: 'turn the surface' });
    }
  }
  // a charge in a conductor scene stays in the region (cavity or outside) it started in
  function moveCharge(i, x, y) {
    const c = st.charges[i];
    [x, y] = clampV(x, y);
    const cd = st.conductor;
    if (cd) {
      const E = env(), R = num(cd.R, E), a = num(cd.a ?? 0, E) || 0, inCav = Math.hypot(c.x - cd.x, c.y - cd.y) < a;
      const d = Math.hypot(x - cd.x, y - cd.y) || 1e-9, ux = (x - cd.x) / d, uy = (y - cd.y) / d;
      if (inCav && d > a * 0.93) { x = cd.x + ux * a * 0.93; y = cd.y + uy * a * 0.93; }
      if (!inCav && d < R * 1.07) { x = cd.x + ux * R * 1.07; y = cd.y + uy * R * 1.07; }
    }
    c.x = x; c.y = y;
  }
  function gaussSize(g, E) {
    const r = num(g.r, E);
    if (g.shape === 'box') return { a1: num(g.w, E) / 2, a2: num(g.h, E) / 2 };
    return { a1: r, a2: r };
  }
  function gaussGrip(g, deg) {
    const E = env(), { a1, a2 } = gaussSize(g, E), shape = currentShape();
    const t = (deg * Math.PI) / 180;
    if (shape === 'cube' || shape === 'box') {
      const al = ((g.angle || 0) * Math.PI) / 180, s1 = Math.sign(Math.cos(t)) * a1, s2 = Math.sign(Math.sin(t)) * a2;
      return [g.x + s1 * Math.cos(al) - s2 * Math.sin(al), g.y + s1 * Math.sin(al) + s2 * Math.cos(al)];
    }
    const k = shape === 'lumpy' ? 1 + 0.25 * Math.cos(3 * (t - ((g.angle || 0) * Math.PI) / 180)) : 1;
    return [g.x + a1 * k * Math.cos(t), g.y + a1 * k * Math.sin(t)];
  }
  function resizeGauss(g, x, y) {
    const v = view(), maxR = Math.max(v.x1 - v.x0, v.y1 - v.y0) * 0.6, minR = (v.x1 - v.x0) * 0.02;
    const shape = currentShape(), al = ((g.angle || 0) * Math.PI) / 180;
    const dx = x - g.x, dy = y - g.y, l1 = Math.abs(dx * Math.cos(al) + dy * Math.sin(al)), l2 = Math.abs(-dx * Math.sin(al) + dy * Math.cos(al));
    const cl = (r) => Math.max(minR, Math.min(maxR, r));
    if (typeof g.r === 'string' || (shape === 'box' && typeof g.w === 'string')) return;   // set by a slider
    if (shape === 'box') { g.w = 2 * cl(l1); g.h = 2 * cl(l2); return; }
    if (shape === 'cube') { g.r = cl(Math.max(l1, l2)); return; }
    const k = shape === 'lumpy' ? 1 + 0.25 * Math.cos(3 * (Math.PI / 4 - al)) : 1;
    g.r = cl(Math.hypot(dx, dy) / k);
  }
  const patchTip = (pa) => { const E = env(), s = num(pa.size, E), a = (num(pa.angle ?? 0, E) * Math.PI) / 180; return [pa.x + 0.45 * s * Math.cos(a), pa.y + 0.45 * s * Math.sin(a)]; };
  const currentShape = () => (P.shapes?.length ? F.params._shape : st.gauss?.shape || 'sphere');

  // ── the SI scene ──
  function sceneSI(E, opts = {}) {
    const u = st.uniform ? [num(st.uniform[0], E) || 0, num(st.uniform[1], E) || 0] : null;
    const cd = st.conductor;
    return M.scene({
      charges: st.charges.map((c) => ({ x: c.x * L, y: c.y * L, q: num(c.q, E) * QF })),
      rods: st.rods.map((r) => ({ x1: r.x1 * L, y1: r.y1 * L, x2: r.x2 * L, y2: r.y2 * L, Q: num(r.Q, E) * QF, pieces: opts.exact ? 0 : num(r.pieces ?? 0, E) })),
      lines: st.lines.map((l) => ({ x: l.x * L, y: l.y * L, lambda: num(l.lambda, E) * QF })),
      sheets: st.sheets.map((s) => ({ x: s.x * L, y: s.y * L, angle: num(s.angle ?? 90, E), sigma: num(s.sigma, E) * QF, width: s.width === undefined || s.width === null ? Infinity : num(s.width, E) * L })),
      balls: st.balls.map((b) => ({ x: b.x * L, y: b.y * L, R: num(b.R, E) * L, Q: num(b.Q, E) * QF, shell: !!b.shell })),
      uniform: u,
      conductor: cd ? { x: cd.x * L, y: cd.y * L, R: num(cd.R, E) * L, a: (num(cd.a ?? 0, E) || 0) * L, Q: (num(cd.Q ?? 0, E) || 0) * QF } : null,
      ref: refPoint().map((c) => c * L),
    });
  }
  // where V = 0 for a scene with lines, sheets or a uniform field: as given, or the origin unless a line charge sits there
  function refPoint() {
    if (st.ref) return st.ref;
    const busy = (x, y) => st.lines.some((l) => Math.hypot(l.x - x, l.y - y) < 1e-9);
    if (!busy(0, 0)) return [0, 0];
    const v = view();
    return [v.x0 + 0.1 * (v.x1 - v.x0), v.y0 + 0.1 * (v.y1 - v.y0)];
  }
  function gaussSI(E) {
    const g = st.gauss, shape = currentShape();
    const r = num(g.r, E);
    return M.surface({ shape, x: g.x * L, y: g.y * L, r: r * L, w: (num(g.w, E) ?? 2 * r) * L, h: (num(g.h, E) ?? 2 * r) * L, depth: g.depth !== undefined ? num(g.depth, E) * L : undefined, angle: num(g.angle ?? 0, E) });
  }

  // ── buttons ──
  let playBtn = null, anim = null;
  const T = { running: false, t0: 0, tau: 0, path: null };
  if (live && st.particle) {
    anim = F.animate((dt) => {
      if (!T.running || !T.path) return;
      T.tau += dt / T.dur;
      if (T.tau >= 1) { T.tau = 1; T.running = false; if (playBtn) playBtn.textContent = 'Replay'; }
      draw();
    }, { force: true });
    playBtn = F.button({ label: 'Launch', primary: true, onClick: () => { if (T.running) { T.running = false; playBtn.textContent = 'Launch'; return; } T.tau = 0; T.running = true; playBtn.textContent = 'Pause'; anim.start(); } });
  }
  if (live && P.edit) {
    const add = (sign) => {
      const v = view(), n = st.charges.length, a = n * 2.4;
      const x = (v.x0 + v.x1) / 2 + (v.x1 - v.x0) * 0.18 * Math.cos(a), y = (v.y0 + v.y1) / 2 + (v.y1 - v.y0) * 0.22 * Math.sin(a);
      st.charges.push({ x: +x.toFixed(2), y: +y.toFixed(2), q: sign * (P.addCharge ?? 1) });
      wireHandles(); draw();
    };
    F.button({ label: `Add +${P.addCharge ?? 1} ${QUNIT_TEXT[P.qunit]}`, onClick: () => add(1) });
    F.button({ label: `Add −${P.addCharge ?? 1} ${QUNIT_TEXT[P.qunit]}`, onClick: () => add(-1) });
    F.button({ label: 'Remove last', onClick: () => { if (st.charges.length) { st.charges.pop(); wireHandles(); draw(); } } });
  }

  F.onChange((key) => {
    if (key === '_preset') { probeRef = 0; load({ ...P, ...presetOf(F.params._preset) }); for (const k of ['charges', 'rods', 'lines', 'sheets', 'balls']) st[k] = st[k] || []; wireHandles(); T.running = false; T.tau = 0; }
    draw();
  });
  plot.onDrag = () => { if (T.running) { T.running = false; if (playBtn) playBtn.textContent = 'Launch'; } T.tau = 0; draw(); F.notify('point'); };

  // ── drawing ──
  const prof = P.profile && !compact ? F.canvas({ height: '150px', label: 'The potential along the horizontal line through the probe' }) : null;
  const pplot = prof ? new Plot(prof.canvas, { x: P.x, y: [0, 1], xlabel: `x (${ut})`, ylabel: 'V (V)', pad: { l: 58, r: 16, t: 10, b: 30 } }) : null;

  const cache = {};
  let probeRef = 0;                // |E| where the probe started: sets the length of its arrow
  const memo = (name, sig, make) => { if (cache[name]?.sig !== sig) cache[name] = { sig, val: make() }; return cache[name].val; };

  function draw() {
    plot.clear();
    const E = env(), S = sceneSI(E), g = plot.ctx, c = plot.col;
    const sig = JSON.stringify([st.charges, st.rods, st.lines, st.sheets, st.balls, st.uniform, st.conductor, st.ref, E, plot.vx0, plot.vx1, plot.vy0, plot.vy1, plot.w]);
    const v = view(), box = { x0: v.x0 * L, x1: v.x1 * L, y0: v.y0 * L, y1: v.y1 * L };
    const W = plot.R - plot.L, pxPer = W / (v.x1 - v.x0);                  // pixels per display unit
    const fs = compact ? 11 : 12.5;
    const Ev = [0, 0, 0];
    const Eat = (x, y) => M.field(S, x * L, y * L, 0, Ev);
    const qmax = Math.max(1e-300, ...S.charges.map((q) => Math.abs(q.q)));

    // equipotentials
    if (layer('equip')) {
      const nx = compact ? 110 : 160, ny = Math.round((nx * (v.y1 - v.y0)) / (v.x1 - v.x0));
      const grid = memo('grid', sig + nx, () => M.potentialGrid(S, box, nx, ny));
      const vals = Array.from(grid.v).filter(Number.isFinite).sort((a, b) => a - b);
      const lo = vals[Math.floor(vals.length * 0.015)], hi = vals[Math.floor(vals.length * 0.985)];
      let levels = P.levels;
      if (!levels) {
        const step = P.dV ?? M.niceStep(grid, compact ? 8 : 10);
        levels = [];
        for (let k = Math.ceil(lo / step); k * step <= hi && levels.length < 80; k++) levels.push(k * step);
      }
      const vc = S.conductor ? M.conductorPotential(S) : NaN;
      const placed = [];
      const step0 = levels.length > 1 ? Math.abs(levels[1] - levels[0]) : 1;
      g.save(); g.font = `500 ${fs - 1.5}px Inter, system-ui, sans-serif`;
      const widthOf = (t) => g.measureText(t).width; g.restore();
      const clearOf = (px, py, w) => {
        if (placed.some(([qx, qy, qw]) => Math.abs(qx - px) < (qw + w) / 2 + 6 && Math.abs(qy - py) < 15)) return false;
        if (S.charges.some((q) => Math.hypot(plot.X(q.x / L) - px, plot.Y(q.y / L) - py) < 22 + w / 2)) return false;
        for (const sh of S.sheets) {
          const Lw = sh.w === Infinity ? 1e6 : sh.w / 2, wx = (px - plot.X(sh.x / L)) / pxPer * L, wy = -(py - plot.Y(sh.y / L)) / pxPer * L;
          const t = wx * sh.ux + wy * sh.uy, d = Math.abs(wx * sh.nx + wy * sh.ny);
          if (Math.abs(t) < Lw + (16 / pxPer) * L && d < ((w / 2 + 10) / pxPer) * L) return false;
        }
        if (S.conductor && Math.hypot(px - plot.X(S.conductor.x / L), py - plot.Y(S.conductor.y / L)) < S.conductor.R / L * pxPer + 12) return false;
        return true;
      };
      for (const lev0 of levels) {
        if (Math.abs(lev0 - vc) < 0.2 * step0) continue;           // the conductor itself is (nearly) that equipotential
        const lev = lev0;
        const segs = M.contour(grid, lev);
        if (!segs.length) continue;
        g.save(); g.strokeStyle = c.violet; g.globalAlpha = 0.8; g.lineWidth = 1.3; g.setLineDash([5, 4]);
        g.beginPath();
        for (const [x0, y0, x1, y1] of segs) { g.moveTo(plot.X(x0 / L), plot.Y(y0 / L)); g.lineTo(plot.X(x1 / L), plot.Y(y1 / L)); }
        g.stroke(); g.restore();
        if (P.equipLabels === false) continue;
        // a label at the highest free point of the contour inside the frame
        const text = volts(lev0), w = widthOf(text);
        const ax0 = plot.vx0 <= 0 && plot.vx1 >= 0 && P.axes !== false ? plot.X(0) : -1e9, ay0 = plot.vy0 <= 0 && plot.vy1 >= 0 && P.axes !== false ? plot.Y(0) : -1e9;
        const cands = [];
        for (const [x0, y0, x1, y1] of segs) {
          let px = plot.X((x0 + x1) / 2 / L), py = plot.Y((y0 + y1) / 2 / L) - 8;
          if (Math.abs(px - ax0) < w / 2 + 4) px = ax0 + w / 2 + 6;          // beside the y axis, not on its numbers
          if (Math.abs(py - ay0) < 9) py = ay0 - 10;
          if (px - w / 2 < plot.L + 4 || px + w / 2 > plot.R - 4 || py < plot.T + 10 || py > plot.B - 8) continue;
          cands.push([px, py]);
        }
        cands.sort((p1, p2) => p1[1] - p2[1]);
        const spot = cands.find(([px, py]) => clearOf(px, py, w));
        if (spot) {
          placed.push([spot[0], spot[1], w]);
          plot.text(text, spot[0], spot[1], { color: 'violet', size: fs - 1.5, align: 'center', screen: true });
        }
      }
    }

    // field vectors
    const arrowsOn = layer('arrows');
    const nxA = P.grid === false ? 0 : (P.gridN ?? (compact ? 13 : 18));
    let Eref = 1;
    if (arrowsOn) {
      const dx = (v.x1 - v.x0) / nxA, nyA = Math.max(2, Math.round((v.y1 - v.y0) / dx));
      const dy = (v.y1 - v.y0) / nyA, pts = [];
      for (let i = 0; i < nxA; i++) for (let j = 0; j < nyA; j++) {
        const x = v.x0 + (i + 0.5) * dx, y = v.y0 + (j + 0.5) * dy;
        if (S.charges.some((q) => Math.hypot(q.x / L - x, q.y / L - y) < 0.55 * dx) || S.lines.some((q) => Math.hypot(q.x / L - x, q.y / L - y) < 0.55 * dx)) continue;
        const e = Eat(x, y), m = Math.hypot(e[0], e[1]);
        if (Number.isFinite(m) && m > 0) pts.push([x, y, e[0] / m, e[1] / m, m]);
      }
      const mags = pts.map((p) => p[4]).sort((a, b) => a - b);
      Eref = (arrowsOn === 'linear' ? mags[mags.length - 1] : mags[Math.floor(mags.length * 0.75)]) || 1;
      const Lmax = 0.42 * Math.min(dx, dy);
      for (const [x, y, ux, uy, m] of pts) {
        const t = arrowsOn === 'linear' ? m / Eref : Math.min(1.25, (m / Eref) ** 0.4);
        if (t < 0.04) continue;
        const len = Lmax * t * (arrowsOn === 'linear' ? 2 : 1);
        plot.arrow(x - (ux * len) / 2, y - (uy * len) / 2, x + (ux * len) / 2, y + (uy * len) / 2, { color: 'ink3', width: 1.3, head: 5.5, alpha: arrowsOn === 'linear' ? 0.85 : 0.35 + 0.55 * Math.min(1, t) });
      }
    }

    // field lines
    if (layer('fieldLines')) {
      const FL = memo('lines', sig, () => M.fieldLines(S, box, { n: P.density ?? (compact ? 10 : 12) }));
      g.save(); g.strokeStyle = c.ink2; g.globalAlpha = 0.75; g.lineWidth = 1.4; g.lineJoin = 'round';
      g.beginPath();
      for (const l of FL) l.pts.forEach(([x, y], k) => (k ? g.lineTo(plot.X(x / L), plot.Y(y / L)) : g.moveTo(plot.X(x / L), plot.Y(y / L))));
      g.stroke(); g.restore();
      // arrowheads along each line
      for (const l of FL) {
        const s = [0];
        for (let k = 1; k < l.pts.length; k++) s.push(s[k - 1] + Math.hypot(plot.X(l.pts[k][0] / L) - plot.X(l.pts[k - 1][0] / L), plot.Y(l.pts[k][1] / L) - plot.Y(l.pts[k - 1][1] / L)));
        const len = s[s.length - 1];
        if (len < 40) continue;
        const marks = len > 0.9 * W ? [0.3, 0.7] : [0.5];
        for (const f of marks) {
          const target = f * len;
          let k = s.findIndex((d) => d >= target);
          if (k < 1) k = 1;
          const [x0, y0] = l.pts[k - 1], [x1, y1] = l.pts[k];
          const X0 = plot.X(x0 / L), Y0 = plot.Y(y0 / L), X1 = plot.X(x1 / L), Y1 = plot.Y(y1 / L);
          const ang = Math.atan2(Y1 - Y0, X1 - X0), hx = X0 + (X1 - X0) * 0.5, hy = Y0 + (Y1 - Y0) * 0.5;
          if (hx < plot.L || hx > plot.R || hy < plot.T || hy > plot.B) continue;
          g.save(); g.fillStyle = c.ink2; g.globalAlpha = 0.9; g.translate(hx, hy); g.rotate(ang);
          g.beginPath(); g.moveTo(5, 0); g.lineTo(-4, 3.6); g.lineTo(-4, -3.6); g.closePath(); g.fill(); g.restore();
        }
      }
    }

    // sources
    const signCol = (s) => (s > 0 ? 'bad' : s < 0 ? 'accent' : 'ink3');
    for (const s of S.sheets) {
      const col = signCol(s.sigma), Lw = s.w === Infinity ? 4 * Math.hypot(v.x1 - v.x0, v.y1 - v.y0) * L : s.w;
      const ax = (s.x - (Lw / 2) * s.ux) / L, ay = (s.y - (Lw / 2) * s.uy) / L, bx = (s.x + (Lw / 2) * s.ux) / L, by = (s.y + (Lw / 2) * s.uy) / L;
      g.save(); plot._clip(); plot.line(ax, ay, bx, by, { color: col, width: compact ? 3.5 : 4.5 }); g.restore();
      // ± marks along it
      const span = Math.min(Lw / L, 2 * Math.hypot(v.x1 - v.x0, v.y1 - v.y0)), nm = Math.max(3, Math.round((span * pxPer) / 26));
      for (let k = 0; k <= nm; k++) {
        const t = -span / 2 + (span * k) / nm, x = s.x / L + t * s.ux, y = s.y / L + t * s.uy;
        if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
        sign(x, y, s.sigma, 3.2);
      }
    }
    S.rods.forEach((r, i) => {
      const col = signCol(r.Q), pieces = S.pieces.filter((p) => p.rod === i);
      plot.line(r.x1 / L, r.y1 / L, r.x2 / L, r.y2 / L, { color: col, width: pieces.length ? 2 : 5, alpha: pieces.length ? 0.45 : 1 });
      if (pieces.length) for (const p of pieces) plot.point(p.x / L, p.y / L, { color: col, r: pieces.length > 30 ? 2.2 : 3.4 });
      else { const nm = Math.max(2, Math.round((r.L / L) * pxPer / 18)); for (let k = 0; k < nm; k++) { const f = (k + 0.5) / nm; sign((r.x1 + f * (r.x2 - r.x1)) / L, (r.y1 + f * (r.y2 - r.y1)) / L, r.Q, 3); } }
    });
    for (const b of S.balls) {
      const col = signCol(b.Q);
      if (b.shell) plot.circle(b.x / L, b.y / L, b.R / L, { color: col, width: 3 });
      else plot.circle(b.x / L, b.y / L, b.R / L, { fill: col, alpha: 0.22, color: col, width: 1.5 });
      if (!compact || b.R / L * pxPer > 14) plot.text(b.Q > 0 ? '+' : '−', b.x / L, b.y / L, { color: col, size: 16, weight: 700, align: 'center' });
    }
    const C = S.conductor;
    if (C) {
      // the metal, and its surface charge as + and − marks whose number follows |σ|
      const cx = C.x / L, cy = C.y / L, R = C.R / L, a = C.a / L;
      g.save(); g.fillStyle = c.ink3; g.globalAlpha = 0.32; g.beginPath();
      g.ellipse(plot.X(cx), plot.Y(cy), R * pxPer, R * pxPer, 0, 0, 2 * Math.PI);
      if (a > 0) { g.moveTo(plot.X(cx) + a * pxPer, plot.Y(cy)); g.ellipse(plot.X(cx), plot.Y(cy), a * pxPer, a * pxPer, 0, 0, 2 * Math.PI); }
      g.fill('evenodd'); g.globalAlpha = 0.85; g.strokeStyle = c.ink2; g.lineWidth = 1.5; g.stroke(); g.restore();
      const rim = (rad, inner) => {
        const n = Math.max(12, Math.round((2 * Math.PI * rad * pxPer) / 13)), sig = [];
        for (let k = 0; k < n; k++) { const t = (2 * Math.PI * (k + 0.5)) / n; sig.push(M.sigmaAt(S, Math.cos(t), Math.sin(t), 0, inner)); }
        const smax = Math.max(...sig.map(Math.abs));
        if (!(smax > 0)) return;
        sig.forEach((s, k) => {
          if (Math.abs(s) < 0.06 * smax) return;
          const t = (2 * Math.PI * (k + 0.5)) / n, rr = inner ? rad - 7 / pxPer : rad + 7 / pxPer;
          const keep = (Math.abs(s) / smax) ** 0.7;
          if ((k * 0.618034) % 1 > keep + 0.02) return;        // thin the marks where |σ| is small
          sign(cx + rr * Math.cos(t), cy + rr * Math.sin(t), s, 3);
        });
      };
      rim(R, false);
      if (a > 0) rim(a, true);
    }
    for (const l of S.lines) {
      const col = signCol(l.lambda), X = plot.X(l.x / L), Y = plot.Y(l.y / L);
      g.save(); g.strokeStyle = c[col]; g.fillStyle = c.panel; g.lineWidth = 2.5;
      g.beginPath(); g.arc(X, Y, 10, 0, 2 * Math.PI); g.fill(); g.stroke();
      g.beginPath(); g.arc(X, Y, 6, 0, 2 * Math.PI); g.stroke(); g.restore();
      sign(l.x / L, l.y / L, l.lambda, 3.2);
    }
    S.charges.forEach((q, i) => {
      const col = signCol(q.q), r = (compact ? 7 : 8) + 5 * Math.sqrt(Math.abs(q.q) / qmax);
      g.save(); g.fillStyle = c[col]; g.beginPath(); g.arc(plot.X(q.x / L), plot.Y(q.y / L), r, 0, 2 * Math.PI); g.fill();
      g.strokeStyle = c.bg; g.lineWidth = 1.5; g.stroke(); g.restore();
      glyph(plot.X(q.x / L), plot.Y(q.y / L), q.q, r * 0.5, '#fff');
      const lab = st.charges[i].label ?? (P.labels ? `${q.q > 0 ? '+' : '−'}${txtNum(Math.abs(q.q) / QF)} ${QUNIT_TEXT[P.qunit]}` : null);
      if (lab) plot.text(lab, q.x / L, q.y / L, { dx: r + 4, dy: -r - 2, color: col, size: fs, weight: 600 });
    });
    // the zero of potential, when it is not at infinity
    if (S.unbounded && (P.readouts || []).includes('V') && P.showRef !== false) {
      const [rx, ry] = refPoint();
      if (rx >= v.x0 && rx <= v.x1 && ry >= v.y0 && ry <= v.y1) {
        plot.point(rx, ry, { color: 'ink3', r: 3 });
        plot.text('V = 0', rx, ry, { color: 'ink3', size: fs - 1.5, dx: 6, dy: 10 });
      }
    }

    // the Gaussian surface
    const rows = [];
    if (st.gauss) {
      const surf = gaussSI(E);
      g.save(); g.strokeStyle = c.good; g.lineWidth = 2.4; g.fillStyle = c.good; g.globalAlpha = 0.07;
      g.beginPath(); surf.outline.forEach(([x, y], k) => (k ? g.lineTo(plot.X(x / L), plot.Y(y / L)) : g.moveTo(plot.X(x / L), plot.Y(y / L)))); g.closePath(); g.fill();
      g.globalAlpha = 1; g.stroke(); g.restore();
      if (layer('normals')) {
        const n = surf.outline.length, step = Math.max(1, Math.floor(n / (compact ? 16 : 24)));
        const en = [];
        for (let k = 0; k < n; k += step) { const [x, y] = surf.outline[k], [nx, ny] = surf.normals[k], e = M.field(S, x, y, 0, Ev); en.push([x / L, y / L, nx, ny, e[0] * nx + e[1] * ny]); }
        const emax = Math.max(1e-300, ...en.map((q) => Math.abs(q[4]))), Lm = 0.09 * (v.x1 - v.x0);
        for (const [x, y, nx, ny, e] of en) {
          if (!Number.isFinite(e) || Math.abs(e) < 0.02 * emax) continue;
          const len = (Lm * Math.sign(e) * Math.min(1, Math.abs(e) / emax) ** 0.6);
          if (e > 0) plot.arrow(x, y, x + nx * len, y + ny * len, { color: 'good', width: 1.6, head: 6 });
          else plot.arrow(x - nx * len, y - ny * len, x, y, { color: 'warn', width: 1.6, head: 6 });
        }
      }
      const want = P.readouts || [];
      if (want.includes('Esurf')) {
        // the field's size where the surface crosses the +x direction from its centre (marked)
        const [mx, my] = gaussGrip(st.gauss, 0), em = M.field(S, mx * L, my * L, 0, Ev);
        plot.point(mx, my, { color: 'good', r: 4 });
        rows.push(['$|\\vec E|$ on the surface (at the dot)', qty(Math.hypot(em[0], em[1], em[2]), 'N/C')]);
      }
      if (want.includes('flux') || want.includes('Qenc') || want.includes('Qeps')) {
        const onSurf = S.charges.some((q) => surf.outline.some(([x, y]) => Math.hypot(x - q.x, y - q.y) < 0.012 * (v.x1 - v.x0) * L));
        const gsig = sig + JSON.stringify([st.gauss, currentShape()]);
        const { f, Qe } = memo('gauss', gsig, () => ({ f: M.flux(S, surf, { tol: 1e-7, budget: 150000 }), Qe: M.enclosed(S, surf) }));
        const approx = f.converged ? '' : '\\approx ';
        if (want.includes('flux')) rows.push(['flux $\\Phi_E = \\oint\\vec E\\cdot d\\vec A$', onSurf ? '\\text{undefined: a charge is on the surface}' : approx + qty(f.flux, 'N\\,m^2/C', 3)]);
        if (want.includes('Qenc')) rows.push(['charge inside $Q_\\text{enc}$', `${texNum(Qe / QF, 3)}\\ ${QUNIT_TEX[P.qunit]}`]);
        if (want.includes('Qeps')) rows.push(['$Q_\\text{enc}/\\varepsilon_0$', qty(Qe / M.EPS0, 'N\\,m^2/C', 3)]);
      }
    }
    // the open patch
    if (st.patch) {
      const pa = st.patch, size = num(pa.size, E), ang = num(pa.angle ?? 0, E);
      const surf = M.surface({ shape: pa.shape || 'square', x: pa.x * L, y: pa.y * L, angle: ang, size: size * L });
      const [A, B] = surf.ends;
      plot.line(A[0] / L, A[1] / L, B[0] / L, B[1] / L, { color: 'gold', width: 5 });
      const tip = patchTip(pa);
      plot.arrow(pa.x, pa.y, tip[0], tip[1], { color: 'gold', width: 2, head: 9, label: 'n̂', ldx: 6, ldy: -8 });
      if ((P.readouts || []).includes('flux')) {
        const f = M.flux(S, surf, { tol: 1e-8, budget: 150000 });
        rows.push(['flux through it, $\\Phi_E$', qty(f.flux, 'N\\,m^2/C', 3)]);
      }
    }

    // the particle
    if (st.particle) {
      const pa = st.particle, kindName = (P.choices || []).some((c) => c.key === pa.kind) ? F.params[pa.kind] : pa.kind;
      const kind = M.PARTICLES[kindName] || M.PARTICLES.electron;
      const q = pa.q !== undefined ? num(pa.q, E) * M.E_CHARGE : kind.q, m = pa.m !== undefined ? num(pa.m, E) : kind.m;
      const sp = num(pa.speed ?? 0, E), an = (num(pa.angle ?? 0, E) * Math.PI) / 180;
      const tr = memo('path', sig + JSON.stringify([pa.x, pa.y, sp, an, q, m]), () => M.trajectory(S, { x: pa.x * L, y: pa.y * L, vx: sp * Math.cos(an), vy: sp * Math.sin(an), q, m }, { box, tmax: pa.tmax }));
      T.path = tr;
      T.dur = Math.max(1.5, Math.min(5, (tr.pts.length / 400) * 2.2));
      if (pa.fieldLine) {
        const fl = M.lineThrough(S, pa.x * L, pa.y * L, box);
        plot.path(fl.map(([x, y]) => [x / L, y / L]), { color: 'ink2', width: 1.6, dash: [6, 5] });
      }
      const pts = tr.pts.map(([x, y]) => [x / L, y / L]);
      // where it is now: at the start until launched; the trail grows behind it (a static picture shows the whole path when path: true)
      let k = 0;
      if (!live || pa.path === true || T.tau >= 1) k = pts.length - 1;
      else if (T.tau > 0) { const tt = T.tau * tr.t[tr.t.length - 1]; k = Math.max(0, tr.t.findIndex((x) => x >= tt)); }
      if (!live && pa.path === false) k = 0;
      if (k > 0) plot.path(pts.slice(0, k + 1), { color: 'gold', width: 2.2, alpha: 0.9 });
      const [px, py] = pts[k];
      plot.point(px, py, { color: q > 0 ? 'bad' : 'accent', r: 6.5, ...(live && pa.drag !== false && k === 0 ? { ring: 'gold' } : {}) });
      glyph(plot.X(px), plot.Y(py), q, 3, '#fff');
      const want = P.readouts || [];
      const last = tr.v[tr.v.length - 1], vEnd = Math.hypot(last[0], last[1]);
      if (want.includes('speed')) rows.push(['final speed', qty(vEnd, 'm/s', 3)]);
      if (want.includes('K')) rows.push(['final kinetic energy', qty((0.5 * m * vEnd * vEnd) / M.E_CHARGE, 'eV', 3)]);
      if (want.includes('deflect')) rows.push(['sideways shift', `${texNum(pts[pts.length - 1][1] - pa.y, 3)}\\ \\mathrm{${ut}}`]);
      if (want.includes('time')) rows.push(['time of flight', qty(tr.t[tr.t.length - 1], 's', 3)]);
    }

    // the probe
    if (st.probe) {
      const pr = st.probe, e = [...Eat(pr.x, pr.y)], m = Math.hypot(e[0], e[1]);
      const V = M.potential(S, pr.x * L, pr.y * L);
      const unitLen = 0.42 * ((v.x1 - v.x0) / Math.max(1, nxA || 18));
      if (Number.isFinite(m) && m > 0 && P.probeArrow !== false) {
        // the probe's own scale: a set length where the probe starts, then (square-root) compressed
        if (!(probeRef > 0)) probeRef = m;
        const t = arrowsOn === 'linear' ? m / Eref : Math.max(0.2, Math.min(2.4, Math.sqrt(m / probeRef)));
        let len = arrowsOn === 'linear' ? unitLen * 2 * t : (P.probeLen ?? 0.12) * (v.x1 - v.x0) * t;
        const fan = P.fan && S.pieces.length && S.pieces.length <= 24;
        if (fan) {
          // each piece's own field at the probe, added tip to tail: the chain ends where the total does.
          // One scale for the chain and the total, as long as it stays in the picture
          const dEs = S.pieces.map((pc) => M.field({ ...M.scene({}), charges: [pc] }, pr.x * L, pr.y * L, 0, [0, 0, 0]));
          let f = (0.22 * (v.x1 - v.x0)) / m;
          for (let it = 0; it < 30; it++) {
            let ax = pr.x, ay = pr.y, inside = true;
            for (const dE of dEs) { ax += dE[0] * f; ay += dE[1] * f; if (ax < v.x0 || ax > v.x1 || ay < v.y0 || ay > v.y1) inside = false; }
            if (inside) break;
            f *= 0.85;
          }
          let ax = pr.x, ay = pr.y;
          for (const dE of dEs) { plot.arrow(ax, ay, ax + dE[0] * f, ay + dE[1] * f, { color: 'bad', width: 1.4, head: 6, alpha: 0.85 }); ax += dE[0] * f; ay += dE[1] * f; }
          len = m * f;
        }
        // screen directions: along E, and across it (where the force arrow sits)
        const sx = e[0] / m, sy = -e[1] / m, cx = sy, cy = -sx;
        const tqv = num(P.test, E);
        const lab = (k) => ({ ldx: 7 * sx + k * cx - 4, ldy: 7 * sy + k * cy });
        plot.arrow(pr.x, pr.y, pr.x + (e[0] / m) * len, pr.y + (e[1] / m) * len, { color: 'gold', width: 2.8, head: 10, label: P.probeLabel === false ? '' : 'E', ...(tqv ? lab(-13) : { ldx: 6, ldy: -8 }) });
        const tq = num(P.test, E);
        if (tq) {
          // the force on the test charge: along E or against it, its length in proportion to |q₀|
          const sl = typeof P.test === 'string' ? (P.sliders || []).find((x) => x.key === P.test) : null;
          const ref = sl ? Math.max(Math.abs(sl.min), Math.abs(sl.max)) : Math.abs(tq);
          const flen = len * 1.1 * (Math.abs(tq) / ref) * Math.sign(tq);
          const ox = (-e[1] / m) * (7 / pxPer), oy = (e[0] / m) * (7 / pxPer);    // beside the E arrow, not on it
          plot.arrow(pr.x + ox, pr.y + oy, pr.x + ox + (e[0] / m) * flen, pr.y + oy + (e[1] / m) * flen, { color: tq > 0 ? 'bad' : 'accent', width: 2.4, head: 9, label: 'F', ...(tq > 0 ? lab(16) : { ldx: -7 * sx + 16 * cx - 4, ldy: -7 * sy + 16 * cy }) });
        }
      }
      // the probe itself
      g.save(); g.strokeStyle = c.gold; g.lineWidth = 2; g.fillStyle = c.panel;
      g.beginPath(); g.arc(plot.X(pr.x), plot.Y(pr.y), 6.5, 0, 2 * Math.PI); g.fill(); g.stroke();
      const tq = num(P.test, E);
      if (tq) glyph(plot.X(pr.x), plot.Y(pr.y), tq, 3.2, c[tq > 0 ? 'bad' : 'accent']);
      else { g.beginPath(); g.arc(plot.X(pr.x), plot.Y(pr.y), 1.8, 0, 2 * Math.PI); g.fillStyle = c.gold; g.fill(); }
      g.restore();
      if (pr.label) plot.text(pr.label, pr.x, pr.y, { dx: -10, dy: 12, color: 'gold', size: fs, weight: 700, align: 'right' });
      const want = P.readouts || [];
      const Vlab = S.unbounded ? '$V$ (zero at the marked point)' : '$V$';
      const pieces = want.includes('Eexact') && S.rods.some((r) => !r.exact);
      if (want.includes('E')) rows.unshift([pieces ? `sum of ${S.pieces.length} point charges, $|\\vec E|$` : '$|\\vec E|$ at the probe', qty(m, 'N/C', pieces ? 4 : 3)]);
      if (want.includes('Ex')) rows.push(['$E_x$', qty(e[0], 'N/C')]);
      if (want.includes('Ey')) rows.push(['$E_y$', qty(e[1], 'N/C')]);
      if (want.includes('Edir')) rows.push(['direction of $\\vec E$', `${Math.round((Math.atan2(e[1], e[0]) * 180) / Math.PI)}^\\circ`]);
      if (want.includes('V')) rows.push([Vlab, qty(V, 'V')]);
      if (want.includes('F')) { const tq2 = num(P.test, E) * QF; rows.push(['force on the test charge, $|\\vec F|$', qty(Math.abs(tq2) * m, 'N')]); }
      if (pieces) {
        const Sx = sceneSI(E, { exact: true }), ex = M.field(Sx, pr.x * L, pr.y * L);
        rows.push(['the integral, $|\\vec E|$', qty(Math.hypot(ex[0], ex[1]), 'N/C', 4)]);
      }
      if (want.includes('dVdx')) {
        const h = (v.x1 - v.x0) * 1e-4 * L, d = (M.potential(S, pr.x * L + h, pr.y * L) - M.potential(S, pr.x * L - h, pr.y * L)) / (2 * h);
        rows.push(['slope $dV/dx$', qty(d, 'V/m')], ['$E_x = -dV/dx$', qty(e[0], 'N/C')]);
      }
      if (pplot) drawProfile(S, pr, v);
    }
    if (C && (P.readouts || []).includes('Vc')) rows.push(['potential of the conductor', qty(M.conductorPotential(S), 'V')]);
    const usesV = layer('equip') || P.profile || (P.readouts || []).some((k) => ['V', 'Vc', 'dVdx'].includes(k));
    const problems = S.problems.filter((m) => usesV || !/reference point/.test(m));
    if (problems.length) rows.push(['note', `\\text{${problems[0].replace(/[{}\\$]/g, '')}}`]);

    for (const l of P.notes?.lines || []) plot.line(l.from[0], l.from[1], l.to[0], l.to[1], { color: l.color || 'ink3', width: l.width || 1.6, dash: l.dash ? [6, 5] : [] });
    for (const a of P.notes?.arrows || []) plot.arrow(a.from[0], a.from[1], a.to[0], a.to[1], { color: a.color || 'ink', width: a.width || 2.2, head: 9, label: a.label, ldx: a.ldx ?? 7, ldy: a.ldy ?? -7 });
    for (const q of P.notes?.points || []) plot.point(q.x, q.y, { color: q.color || 'ink2', r: q.r ?? 4, label: q.label, ldx: q.ldx, ldy: q.ldy, lcolor: q.color || 'ink2' });
    drawHandles();
    F.readout(rows);
  }

  // + and − glyphs
  function sign(x, y, s, size) { glyph(plot.X(x), plot.Y(y), s, size, plot.col[s > 0 ? 'bad' : 'accent'], true); }
  function glyph(X, Y, s, size, color, halo = false) {
    const g = plot.ctx;
    g.save(); g.lineCap = 'round';
    if (halo) { g.strokeStyle = plot.col.bg; g.lineWidth = 4.5; g.beginPath(); g.moveTo(X - size, Y); g.lineTo(X + size, Y); if (s > 0) { g.moveTo(X, Y - size); g.lineTo(X, Y + size); } g.stroke(); }
    g.strokeStyle = color; g.lineWidth = 2;
    g.beginPath(); g.moveTo(X - size, Y); g.lineTo(X + size, Y);
    if (s > 0) { g.moveTo(X, Y - size); g.lineTo(X, Y + size); }
    g.stroke(); g.restore();
  }
  function drawHandles() {
    const g = plot.ctx, c = plot.col;
    for (const H of handles) {
      if (H.kind === 'charge' || H.kind === 'probe' || H.kind === 'line' || H.kind === 'particle') continue;   // drawn as themselves
      const [x, y] = H.get(), X = plot.X(x), Y = plot.Y(y);
      g.save(); g.fillStyle = c.panel; g.strokeStyle = H.kind.startsWith('gauss') ? c.good : c.gold; g.lineWidth = 2.2;
      g.beginPath(); g.arc(X, Y, 7, 0, 2 * Math.PI); g.fill(); g.stroke();
      g.lineWidth = 1.4; g.beginPath();
      if (H.kind === 'gauss-size') { g.moveTo(X - 3.5, Y + 3.5); g.lineTo(X + 3.5, Y - 3.5); g.moveTo(X + 3.5, Y - 3.5); g.lineTo(X + 0.5, Y - 3.5); g.moveTo(X + 3.5, Y - 3.5); g.lineTo(X + 3.5, Y - 0.5); }
      else if (H.kind === 'patch-turn') { g.arc(X, Y, 3.5, 0.3, 4.6); }
      else { g.moveTo(X - 4, Y); g.lineTo(X + 4, Y); g.moveTo(X, Y - 4); g.lineTo(X, Y + 4); }
      g.stroke(); g.restore();
    }
    if (st.particle && live && st.particle.drag !== false && !(T.tau > 0)) {
      const X = plot.X(st.particle.x), Y = plot.Y(st.particle.y);
      g.save(); g.strokeStyle = c.gold; g.setLineDash([2, 2]); g.lineWidth = 1.5; g.beginPath(); g.arc(X, Y, 10, 0, 2 * Math.PI); g.stroke(); g.restore();
    }
  }
  function drawProfile(S, pr, v) {
    pplot.setView([v.x0, v.x1], [0, 1]);
    const n = 300, xs = [], vs = [];
    for (let i = 0; i <= n; i++) { const x = v.x0 + ((v.x1 - v.x0) * i) / n; xs.push(x); vs.push(M.potential(S, x * L, pr.y * L)); }
    const fin = vs.filter(Number.isFinite).sort((a, b) => a - b);
    let lo = fin[Math.floor(fin.length * 0.03)] ?? -1, hi = fin[Math.floor(fin.length * 0.97)] ?? 1;
    const V0 = M.potential(S, pr.x * L, pr.y * L);
    if (Number.isFinite(V0)) { lo = Math.min(lo, V0); hi = Math.max(hi, V0); }
    if (!(hi > lo)) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12;
    pplot.setView([v.x0, v.x1], [lo - pad, hi + pad]);
    pplot.clear();
    pplot.fn((x) => M.potential(S, x * L, pr.y * L), { color: 'violet', width: 2 });
    const h = (v.x1 - v.x0) * 1e-4, slope = (M.potential(S, (pr.x + h) * L, pr.y * L) - M.potential(S, (pr.x - h) * L, pr.y * L)) / (2 * h);
    if (Number.isFinite(V0) && Number.isFinite(slope)) {
      const w = (v.x1 - v.x0) * 0.12;
      pplot.line(pr.x - w, V0 - slope * w, pr.x + w, V0 + slope * w, { color: 'gold', width: 2 });
      pplot.point(pr.x, V0, { color: 'gold', r: 4.5 });
    }
  }

  wireHandles();
  F.draw(draw);
  F.caption(P.caption || defaultCaption(P));
  return {
    get: (k) => {
      if (k === 'point' || k === 'probe') return st.probe ? { x: st.probe.x, y: st.probe.y } : null;
      if (k === 'gauss') return st.gauss ? { x: st.gauss.x, y: st.gauss.y, r: st.gauss.r } : null;
      return F.params[k];
    },
  };
}

function defaultCaption(P) {
  const bits = [];
  if (P.arrows) bits.push(P.arrows === 'linear' ? 'Arrows are drawn to scale.' : 'Arrow lengths are compressed so that weak and strong regions both show; the probe’s readout gives the true size.');
  if (P.fieldLines) bits.push('Field lines are drawn in the plane of the page: the number leaving a charge is proportional to its charge, but in a flat slice their spacing does not fall off as 1/r² the way the field does.');
  if (P.equip) bits.push('Equipotentials (dashed) are equally spaced in V.');
  if ((P.lines || []).length || (P.sheets || []).length) bits.push('Line charges and sheets run straight through the page, toward you and away; you see them end-on and edge-on.');
  if (P.gauss) bits.push('The Gaussian surface is a closed surface in 3D, cut by the page; its flux is integrated numerically over the whole surface.');
  return bits.join(' ');
}

// ─── parameter checks (Node-safe) ─────────────────────────────────────────
export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const out = [];
  if (!(P.unit in UNIT)) out.push(`unknown unit “${P.unit}” (use ${Object.keys(UNIT).join(', ')})`);
  if (!(P.qunit in QUNIT)) out.push(`unknown charge unit “${P.qunit}” (use ${Object.keys(QUNIT).join(', ')})`);
  if (!(Array.isArray(P.x) && P.x[0] < P.x[1]) || !(Array.isArray(P.y) && P.y[0] < P.y[1])) out.push('x and y must be ranges [min, max]');
  const keys = keysOf(P);
  const E = { ...(P.constants || {}) };
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) out.push(`slider ${s.key} needs a label`);
    E[s.key] = s.value;
  }
  for (const c of P.choices || []) E[c.key] = c.value;
  const expr = (v, what) => {
    if (v === undefined || v === null || typeof v === 'number') return v;
    try { return fn(v, keys)(E); } catch (e) { out.push(`${what}: “${v}” — ${e.message}`); return NaN; }
  };
  const checkScene = (S, where) => {
    for (const c of S.charges || []) { if (!Number.isFinite(c.x) || !Number.isFinite(c.y)) out.push(`${where}: a charge needs numeric x and y`); expr(c.q, `${where} charge q`); }
    for (const r of S.rods || []) { expr(r.Q, `${where} rod Q`); expr(r.pieces, `${where} rod pieces`); if (r.x1 === r.x2 && r.y1 === r.y2) out.push(`${where}: a rod needs two different ends`); }
    for (const l of S.lines || []) expr(l.lambda, `${where} line lambda`);
    for (const s of S.sheets || []) { expr(s.sigma, `${where} sheet sigma`); expr(s.angle, `${where} sheet angle`); expr(s.width, `${where} sheet width`); }
    for (const b of S.balls || []) { if (!(expr(b.R, `${where} ball R`) > 0)) out.push(`${where}: a ball needs R > 0`); expr(b.Q, `${where} ball Q`); }
    if (S.uniform) S.uniform.forEach((u, i) => expr(u, `${where} uniform[${i}]`));
    const cd = S.conductor;
    if (cd) {
      const R = expr(cd.R, `${where} conductor R`), a = expr(cd.a ?? 0, `${where} conductor a`) || 0;
      if (!(R > 0) || !(a >= 0 && a < R)) out.push(`${where}: a conductor needs R > 0 and 0 ≤ a < R`);
      if ((S.rods || []).length || (S.lines || []).length || (S.sheets || []).length || (S.balls || []).length) out.push(`${where}: a conductor can share the scene only with point charges and a uniform field`);
      for (const c of S.charges || []) { const d = Math.hypot(c.x - cd.x, c.y - cd.y); if (d >= a && d <= R) out.push(`${where}: a charge sits inside the conducting material`); }
    }
    const g = S.gauss;
    if (g) {
      const shapes = P.shapes?.length ? P.shapes : [g.shape || 'sphere'];
      for (const sh of shapes) {
        if (!SHAPES[sh]) out.push(`${where}: unknown Gaussian shape “${sh}”`);
        if ((sh === 'sphere' || sh === 'lumpy') && ((S.lines || []).length || (S.sheets || []).length)) out.push(`${where}: a ${sh} cut by a line charge or a sheet is not supported — use a cylinder or a box`);
      }
      if (shapes.includes('box') && (expr(g.w, `${where} gauss w`) === undefined || expr(g.h, `${where} gauss h`) === undefined)) out.push(`${where}: a box needs w and h`);
      else if (!shapes.every((s) => s === 'box') && !(expr(g.r, `${where} gauss r`) > 0)) out.push(`${where}: the Gaussian surface needs r > 0`);
      expr(g.depth, `${where} gauss depth`);
    }
    const pa = S.patch;
    if (pa) { if (!['square', 'disk', undefined].includes(pa.shape)) out.push(`${where}: a patch is a square or a disk`); if (!(expr(pa.size, `${where} patch size`) > 0)) out.push(`${where}: a patch needs size > 0`); expr(pa.angle, `${where} patch angle`); }
    const pt = S.particle;
    if (pt) {
      const choiceKind = (P.choices || []).find((c) => c.key === pt.kind);
      if (choiceKind) { for (const [v] of choiceKind.options) if (!KINDS.includes(v)) out.push(`${where}: particle choice option “${v}” must be one of ${KINDS.join(', ')}`); }
      else if (pt.kind && !KINDS.includes(pt.kind)) out.push(`${where}: particle kind must be one of ${KINDS.join(', ')} (or a choice key)`);
      if (!pt.kind && (pt.q === undefined || pt.m === undefined)) out.push(`${where}: a particle needs a kind, or q (in e) and m (kg)`);
      expr(pt.speed, `${where} particle speed`); expr(pt.angle, `${where} particle angle`); expr(pt.q, `${where} particle q`); expr(pt.m, `${where} particle m`);
    }
    if (S.probe && (!Number.isFinite(S.probe.x) || !Number.isFinite(S.probe.y))) out.push(`${where}: the probe needs x and y`);
  };
  checkScene(P, 'scene');
  for (const pr of P.presets || []) {
    if (!pr.id || !pr.label) out.push('every preset needs an id and a label');
    checkScene({ ...P, ...pr }, `preset ${pr.id}`);
  }
  if (P.preset && !(P.presets || []).some((p) => p.id === P.preset)) out.push(`no preset “${P.preset}”`);
  for (const r of P.readouts || []) if (!READOUTS.includes(r)) out.push(`unknown readout “${r}” (use ${READOUTS.join(', ')})`);
  for (const t of P.toggles || []) if (!TOGGLES[t]) out.push(`unknown toggle “${t}” (use ${Object.keys(TOGGLES).join(', ')})`);
  if (P.shapes) for (const s of P.shapes) if (!SHAPES[s]) out.push(`unknown shape “${s}”`);
  if (P.shapes && !P.gauss) out.push('shapes needs a gauss surface');
  if (P.test !== null && P.test !== undefined) expr(P.test, 'test charge');
  if (P.arrows !== true && P.arrows !== false && P.arrows !== 'linear') out.push('arrows is true, false or “linear”');
  if (P.levels && !(Array.isArray(P.levels) && P.levels.every(Number.isFinite))) out.push('levels must be a list of numbers (volts)');
  if (P.dV !== null && P.dV !== undefined && !(P.dV > 0)) out.push('dV must be positive');
  return out;
}
