// Magnetic fields of steady currents, drawn in the plane of the page: long
// straight wires crossing the page (⊙ out of it, ⊗ into it), or circular loops
// and solenoids cut through their axis, or a toroid cut through its middle —
// with field lines, field vectors, a probe that reads B, an Amperian loop you
// drag and reshape while ∮B·dl is computed numerically beside μ₀I_enc, and
// the force per metre that each wire feels from the others. The physics is
// model/em-bfield.js (exact fields; tested in test/em-bfield.test.mjs).
//
//   { type: 'em-bfield', params: {
//       unit: 'cm', x: [-6, 6], y: [-4, 4],      // positions in m|cm|mm; the view (equal scales)
//       wires: [{ x, y, I, label, drag }],       // straight wires across the page; I in A (> 0 out of the page)
//       loops: [{ x, R, I }],                    // circular loops on the x-axis, seen edge-on (I > 0: B along +x inside)
//       solenoid: { x0, x1, R, N, I },           // N such loops filling x0…x1 evenly (one per slice of length (x1 − x0)/N)
//       toroid: { x, y, a, b, N, I },            // a toroid cut through its middle: N wires on radius a (out), N on b (in)
//       uniform: [Bx, By],                       // a uniform field, T
//       lines: true, density: 1, arrows: false,  // field lines (more or fewer with density); field vectors
//       probe: { x, y, label } | null,           // drag it; reads B (probeArrow: false hides the B arrow drawn on it)
//       loop: { shape: 'circle', x, y, r, move: true, resize: true } | null,   // an Amperian loop
//       shapes: ['circle', 'square', 'lumpy'],   // offer a choice of its shape
//       forces: false, forceOn: 0,               // force-per-length arrows on the wires; which wire the readout follows ('all': each)
//       readouts: ['B'],                         // any of B Bx By circ muI Ienc F d mu0nI mu0NI (d: wires 1–2 apart)
//       labels: true, static: false,             // label wires with their currents; a still picture (no dragging)
//       sliders, choices, constants,             // as in graph: keys usable in I, x, y, R, N, …
//       presets: [{ id, label, wires, loops, … }], preset } }   // a choice of arrangements
//
// Wires and loops cannot be mixed: the wires are infinitely long, while the
// loops' field is that of real circles. A picture must not show its answer:
// leave the asked-for value out of readouts.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/em-bfield.js';

export const defaults = {
  unit: 'cm', x: [-6, 6], y: [-4, 4], wires: [], loops: [], solenoid: null, toroid: null, uniform: null,
  lines: true, density: 1, arrows: false, probe: null, loop: null, shapes: null, forces: false, forceOn: 0,
  readouts: ['B'], labels: true, static: false, presets: null, preset: null, aspect: '',
};

const UNIT = { m: 1, cm: 0.01, mm: 0.001 };
const UNIT_TEXT = { m: 'm', cm: 'cm', mm: 'mm' };
const READOUTS = ['B', 'Bx', 'By', 'circ', 'muI', 'Ienc', 'F', 'd', 'mu0nI', 'mu0NI'];
const SHAPES = { circle: 'Circle', square: 'Square', lumpy: 'Lumpy loop' };
const SCENE_KEYS = ['wires', 'loops', 'solenoid', 'toroid', 'uniform', 'probe', 'loop'];
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
const clone = (v) => (v === undefined || v === null ? v : JSON.parse(JSON.stringify(v)));

function texNum(v, n = 3) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (Math.abs(v) < 1e-300) return '0';
  const a = Math.abs(v);
  if (a >= 1e4 || a < 1e-2) { const [m, e] = v.toExponential(n - 1).split('e'); return `${m} \\times 10^{${+e}}`; }
  return String(+v.toPrecision(n));
}
const TPREF = [[1, '\\mathrm{T}'], [1e-3, '\\mathrm{mT}'], [1e-6, '\\mu\\mathrm{T}'], [1e-9, '\\mathrm{nT}']];
function tesla(v, n = 3) {
  if (!Number.isFinite(v)) return '\\text{—}';
  if (Math.abs(v) < 1e-15) return '0\\ \\mathrm{T}';
  const [f, u] = TPREF.find(([f]) => Math.abs(v) >= f * 0.99995) || TPREF[TPREF.length - 1];
  return `${+(v / f).toPrecision(n)}\\ ${u}`;
}
const txt = (v) => String(+v.toPrecision(3)).replace('-', '−');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = !!F.compact, live = !P.static;
  const L = UNIT[P.unit] ?? 0.01, ut = UNIT_TEXT[P.unit] ?? P.unit;
  const { canvas } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'The magnetic field of currents in the plane of the page, with field lines' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.presets?.length) F.choice({ key: '_preset', label: P.presetLabel || 'Arrangement', options: P.presets.map((p) => [p.id, p.label]), value: P.preset ?? P.presets[0].id, explain: P.presetExplain || '' });
  if (P.shapes?.length && P.loop) F.choice({ key: '_shape', label: 'Amperian loop', options: P.shapes.map((s) => [s, SHAPES[s]]), value: P.loop.shape ?? P.shapes[0], explain: 'Any closed path will do: Ampère’s law holds for every one.' });
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const num = (v, E) => (v === undefined || v === null ? v : typeof v === 'number' ? v : fn(v, keys)(E));

  // the movable state (display units), reloaded when the preset changes
  const st = {};
  const presetOf = (id) => (P.presets || []).find((p) => p.id === id);
  const load = (src) => { for (const k of SCENE_KEYS) st[k] = clone(src[k] ?? null); st.wires = st.wires || []; st.loops = st.loops || []; };
  load(P.presets?.length ? { ...P, ...presetOf(F.params._preset) } : P);

  const plot = new Plot(canvas, { x: P.x, y: P.y, equal: true, xlabel: P.xlabel ?? `x (${ut})`, ylabel: P.ylabel ?? `y (${ut})`, grid: P.grid ?? true, axes: P.axes ?? true, xticks: compact ? 6 : undefined, yticks: compact ? 5 : undefined });

  // the scene in SI at the present control values
  function sceneNow() {
    const E = env();
    const wires = st.wires.map((w) => ({ x: num(w.x, E) * L, y: num(w.y, E) * L, I: num(w.I, E), label: w.label }));
    let loops = st.loops.map((l) => ({ x: num(l.x, E) * L, R: num(l.R, E) * L, I: num(l.I, E) }));
    if (st.solenoid) { const s = st.solenoid; loops = loops.concat(M.solenoidLoops({ x0: num(s.x0, E) * L, x1: num(s.x1, E) * L, R: num(s.R, E) * L, N: Math.max(1, Math.round(num(s.N, E))), I: num(s.I, E) })); }
    let tw = [];
    if (st.toroid) { const t = st.toroid; tw = M.toroidWires({ x: num(t.x ?? 0, E) * L, y: num(t.y ?? 0, E) * L, a: num(t.a, E) * L, b: num(t.b, E) * L, N: Math.max(1, Math.round(num(t.N, E))), I: num(t.I, E) }); }
    const uni = st.uniform ? st.uniform.map((c) => num(c, E)) : null;
    return M.scene({ wires: [...wires, ...tw], loops, uniform: uni });
  }

  // ─── handles ─────────────────────────────────────────────────────────────
  const handles = [];
  if (live) {
    // a handle for every wire index that is draggable in any arrangement; it acts on whichever wire is there now
    const nDrag = Math.max(0, ...[P, ...(P.presets || [])].map((S) => (S.wires || []).reduce((m, w, k) => (w.drag ? k + 1 : m), 0)));
    for (let k = 0; k < nDrag; k++) {
      handles.push(plot.handle(() => { const w = st.wires[k]; return w?.drag ? [num(w.x, env()), num(w.y, env())] : [NaN, NaN]; }, (x, y) => { const w = st.wires[k]; if (w?.drag) { w.x = +x.toFixed(3); w.y = +y.toFixed(3); } }, { r: 11, label: `wire ${k + 1}` }));
    }
    if (st.probe && st.probe.drag !== false) handles.push(plot.handle(() => [st.probe.x, st.probe.y], (x, y) => { st.probe.x = x; st.probe.y = y; }, { r: 9, label: 'probe' }));
    if (st.loop && st.loop.move !== false) handles.push(plot.handle(() => [st.loop.x, st.loop.y], (x, y) => { st.loop.x = x; st.loop.y = y; }, { r: 9, label: 'Amperian loop centre' }));
    if (st.loop && st.loop.resize !== false) handles.push(plot.handle(() => [st.loop.x + st.loop.r, st.loop.y], (x) => { st.loop.r = Math.max(0.05 * (plot.vx1 - plot.vx0), x - st.loop.x); }, { r: 8, label: 'Amperian loop size' }));
    plot.onDrag = () => { draw(); F.notify('drag'); };
  }
  F.onChange((key) => {
    if (key === '_preset') load({ ...P, ...presetOf(F.params._preset) });
    draw();
  });

  // ─── field lines: contours of the flux function, cached per scene ───────
  let lineCache = { sig: '', segs: [] };
  function fieldLines(S, v) {
    const sig = JSON.stringify([S, v.x0, v.x1, v.y0, v.y1, P.density]);
    if (lineCache.sig === sig) return lineCache.segs;
    const nx = compact ? 110 : 150, ny = Math.round((nx * (v.y1 - v.y0)) / (v.x1 - v.x0));
    const X = (i) => (v.x0 + ((v.x1 - v.x0) * i) / nx) * L, Y = (j) => (v.y0 + ((v.y1 - v.y0) * j) / ny) * L;
    const g = [];
    for (let i = 0; i <= nx; i++) { g[i] = []; for (let j = 0; j <= ny; j++) g[i][j] = M.psi(S, X(i), Y(j)); }
    // levels: through equally spaced seeds inside the loops; equally spaced in ψ for wires
    let levels = [];
    const dens = P.density || 1;
    if (S.loops.length) {
      const xs = S.loops.map((l) => l.x), xm = (Math.min(...xs) + Math.max(...xs)) / 2, Rm = Math.min(...S.loops.map((l) => l.R));
      const n = Math.round(7 * dens);
      for (let k = 0; k < n; k++) { const p = M.psi(S, xm, (Rm * (k + 0.5)) / n); levels.push(p); }
      if (S.uniform) levels = levels.concat(levels.map((p) => -p));
    } else {
      const vals = g.flat().filter(Number.isFinite).sort((a, b) => a - b);
      const lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.floor(vals.length * 0.98)];
      const step = (hi - lo) / (14 * dens);
      if (step > 0) { const base = Math.ceil(lo / step); for (let k = base; k * step <= hi; k++) levels.push(k * step + step * 0.5); }
    }
    const segs = [];
    for (const lev of levels) {
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], pts = [];
        for (let k = 0; k < 4; k++) {
          const [a1, b1] = c[k], [a2, b2] = c[(k + 1) % 4], v1 = g[a1][b1], v2 = g[a2][b2];
          if (!Number.isFinite(v1) || !Number.isFinite(v2)) continue;
          if ((v1 - lev) * (v2 - lev) < 0) { const t = (lev - v1) / (v2 - v1); pts.push([(X(a1) + (X(a2) - X(a1)) * t) / L, (Y(b1) + (Y(b2) - Y(b1)) * t) / L]); }
        }
        if (pts.length === 2) segs.push(pts);
        else if (pts.length === 4) segs.push([pts[0], pts[1]], [pts[2], pts[3]]);
      }
    }
    lineCache = { sig, segs };
    return segs;
  }

  function glyph(g, X, Y, r, out, col, bg) {
    g.save(); g.fillStyle = bg; g.strokeStyle = col; g.lineWidth = r > 7 ? 2 : 1.5;
    g.beginPath(); g.arc(X, Y, r, 0, 2 * Math.PI); g.fill(); g.stroke();
    if (out) { g.fillStyle = col; g.beginPath(); g.arc(X, Y, Math.max(1.6, r * 0.28), 0, 2 * Math.PI); g.fill(); }
    else { const d = r * 0.55; g.beginPath(); g.moveTo(X - d, Y - d); g.lineTo(X + d, Y + d); g.moveTo(X + d, Y - d); g.lineTo(X - d, Y + d); g.stroke(); }
    g.restore();
  }

  function draw() {
    plot.clear();
    const g = plot.ctx, c = plot.col, S = sceneNow(), E = env();
    const v = { x0: plot.vx0, x1: plot.vx1, y0: plot.vy0, y1: plot.vy1 };
    const pxPer = (plot.R - plot.L) / (v.x1 - v.x0);
    const crossings = M.crossings(S);

    // field vectors
    if (P.arrows) {
      const step = compact ? 40 : 46, pts = [];
      for (let X = plot.L + step / 2; X < plot.R; X += step) for (let Y = plot.T + step / 2; Y < plot.B; Y += step) {
        const x = plot.ix(X), y = plot.iy(Y);
        if (crossings.some((q) => Math.hypot(q.x / L - x, q.y / L - y) * pxPer < 16)) continue;
        const b = M.field(S, x * L, y * L);
        pts.push([x, y, b, Math.hypot(...b)]);
      }
      const ref = pts.map((p) => p[3]).filter(Number.isFinite).sort((a, b) => a - b)[Math.floor(pts.length * 0.8)] || 1;
      for (const [x, y, b, m] of pts) {
        if (!(m > 0)) continue;
        const len = (Math.min(1.6, (m / ref) ** 0.45) * 0.42 * step) / pxPer;
        plot.arrow(x, y, x + (b[0] / m) * len, y + (b[1] / m) * len, { color: 'teal', width: 1.3, head: 6, alpha: 0.6 });
      }
    }
    // field lines, with arrowheads along them
    if (P.lines) {
      const segs = fieldLines(S, v);
      g.save(); g.strokeStyle = c.teal; g.lineWidth = 1.5; g.globalAlpha = 0.85; g.beginPath();
      for (const [[x0, y0], [x1, y1]] of segs) { g.moveTo(plot.X(x0), plot.Y(y0)); g.lineTo(plot.X(x1), plot.Y(y1)); }
      g.stroke(); g.restore();
      const marks = [];
      for (let k = 0; k < segs.length; k += 7) {
        const [[x0, y0], [x1, y1]] = segs[k], xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, X = plot.X(xm), Y = plot.Y(ym);
        if (marks.some(([a, b]) => Math.hypot(a - X, b - Y) < 70)) continue;
        if (crossings.some((q) => Math.hypot(plot.X(q.x / L) - X, plot.Y(q.y / L) - Y) < 22)) continue;
        if (X < plot.L + 8 || X > plot.R - 8 || Y < plot.T + 8 || Y > plot.B - 8) continue;
        const b = M.field(S, xm * L, ym * L), m = Math.hypot(...b);
        if (!(m > 0)) continue;
        marks.push([X, Y]);
        const ux = b[0] / m, uy = -b[1] / m, h = 6.5;
        g.save(); g.fillStyle = c.teal; g.beginPath();
        g.moveTo(X + ux * h, Y + uy * h); g.lineTo(X - ux * h - uy * h * 0.6, Y - uy * h + ux * h * 0.6); g.lineTo(X - ux * h + uy * h * 0.6, Y - uy * h - ux * h * 0.6);
        g.closePath(); g.fill(); g.restore();
      }
    }

    // the Amperian loop, coloured by the sign of B·dl along it
    const rows = [], want = P.readouts || [];
    let path = null;
    if (st.loop) {
      const shape = P.shapes?.length ? F.params._shape : st.loop.shape || 'circle';
      path = M.pathOf(shape, st.loop.x * L, st.loop.y * L, st.loop.r * L, 720);
      const bdl = path.map(([x, y], k) => { const [x1, y1] = path[(k + 1) % path.length], b = M.field(S, (x + x1) / 2, (y + y1) / 2); return b[0] * (x1 - x) + b[1] * (y1 - y); });
      const ref = Math.max(...bdl.map(Math.abs)) || 1;
      g.save(); g.lineWidth = 3; g.lineCap = 'round';
      for (let k = 0; k < path.length; k++) {
        const [x0, y0] = path[k], [x1, y1] = path[(k + 1) % path.length], s = bdl[k] / ref;
        g.strokeStyle = Math.abs(s) < 0.04 ? c.ink3 : s > 0 ? c.good : c.warn; g.globalAlpha = 0.95;
        g.beginPath(); g.moveTo(plot.X(x0 / L), plot.Y(y0 / L)); g.lineTo(plot.X(x1 / L), plot.Y(y1 / L)); g.stroke();
      }
      g.restore();
      // direction of travel round it (anticlockwise)
      for (const f of [0.125, 0.375, 0.625, 0.875]) {
        const k = Math.floor(f * path.length), [x0, y0] = path[k], [x1, y1] = path[(k + 6) % path.length];
        plot.arrow(x0 / L, y0 / L, x1 / L, y1 / L, { color: 'ink2', width: 1.4, head: 8 });
      }
      const Ienc = M.enclosed(S, path), C = M.circulation(S, path), onPath = M.nearest(S, path) < 0.01 * st.loop.r * L;
      for (const q of crossings) if (M.inside(path, q.x, q.y)) { g.save(); g.strokeStyle = c.good; g.lineWidth = 2; g.setLineDash([3, 3]); g.beginPath(); g.arc(plot.X(q.x / L), plot.Y(q.y / L), 13, 0, 2 * Math.PI); g.stroke(); g.restore(); }
      if (want.includes('circ')) rows.push(['$\\oint\\vec B\\cdot d\\vec l$ round the loop', onPath ? '\\text{undefined: a current is on the loop}' : `${texNum(C)}\\ \\mathrm{T\\,m}`]);
      if (want.includes('muI')) rows.push(['$\\mu_0 I_{\\text{enc}}$', `${texNum(M.MU0 * Ienc)}\\ \\mathrm{T\\,m}`]);
      if (want.includes('Ienc')) rows.push(['current through the loop, $I_{\\text{enc}}$', `${+Ienc.toPrecision(4)}\\ \\mathrm{A}`]);
    }

    // the sources: loops edge-on, toroid outline, wires
    for (const l of S.loops) plot.line(l.x / L, l.R / L, l.x / L, -l.R / L, { color: 'ink3', width: 1, dash: [3, 4], alpha: 0.6 });
    if (st.toroid) { const t = st.toroid; for (const r of [num(t.a, E), num(t.b, E)]) plot.circle(num(t.x ?? 0, E), num(t.y ?? 0, E), r, { color: 'ink3', width: 1, dash: [3, 4] }); }
    const many = crossings.length > 12, rg = many ? 5.5 : 9.5;
    crossings.forEach((q) => glyph(g, plot.X(q.x / L), plot.Y(q.y / L), rg, q.I > 0, c.ink, c.panel));
    if (P.labels) S.wires.forEach((w, k) => {
      if (k >= st.wires.length) return;
      const lab = w.label ? `${w.label}: ${txt(Math.abs(w.I))} A` : `${txt(Math.abs(w.I))} A`;
      plot.text(lab, w.x / L, w.y / L, { dx: 13, dy: -13, color: 'ink2', size: compact ? 11 : 12, weight: 600 });
    });

    // forces between wires (per metre of wire)
    if (P.forces && S.wires.length > 1) {
      const Fs = S.wires.map((_, k) => M.forcePerLength(S, k)), Fmax = Math.max(...Fs.map((f) => Math.hypot(...f))) || 1;
      Fs.forEach((f, k) => {
        if (k >= st.wires.length) return;
        const m = Math.hypot(...f);
        if (!(m > 1e-6 * Fmax)) return;
        const w = S.wires[k], gap = Math.min(...S.wires.filter((_, j) => j !== k).map((o) => Math.hypot(o.x - w.x, o.y - w.y) / L));
        const len = Math.min(0.12 * (v.x1 - v.x0), 0.42 * gap) * Math.sqrt(m / Fmax);
        plot.arrow(w.x / L + (f[0] / m) * 0.02 * (v.x1 - v.x0), w.y / L + (f[1] / m) * 0.02 * (v.x1 - v.x0), w.x / L + (f[0] / m) * len, w.y / L + (f[1] / m) * len, { color: 'violet', width: 2.6, head: 10, label: k === 0 ? 'F' : '', ldx: 6, ldy: -8 });
      });
      if (want.includes('F')) {
        const on = P.forceOn === 'all' ? st.wires.map((_, k) => k) : [P.forceOn ?? 0];
        for (const k of on) { const f = Fs[k], lb = S.wires[k]?.label; if (f) rows.push([`force per metre on ${lb ? (lb.length <= 2 ? `wire ${lb}` : lb) : 'the wire'}`, `${texNum(Math.hypot(...f))}\\ \\mathrm{N/m}`]); }
      }
    }
    if (want.includes('d') && S.wires.length > 1) rows.push(['separation $d$', `${+(Math.hypot(S.wires[1].x - S.wires[0].x, S.wires[1].y - S.wires[0].y) / L).toPrecision(3)}\\ \\mathrm{${ut}}`]);

    // the probe
    if (st.probe) {
      const pr = st.probe, b = M.field(S, pr.x * L, pr.y * L), m = Math.hypot(...b);
      if (m > 0 && Number.isFinite(m) && P.probeArrow !== false) {
        const len = 0.11 * (v.x1 - v.x0);
        plot.arrow(pr.x, pr.y, pr.x + (b[0] / m) * len, pr.y + (b[1] / m) * len, { color: 'teal', width: 2.8, head: 10, label: 'B', ldx: 6, ldy: -8 });
      }
      // a filled point (a ring with a dot would read as a current out of the page); dashed ring if it can be dragged
      g.save(); g.fillStyle = c.gold; g.strokeStyle = c.bg; g.lineWidth = 1.5;
      g.beginPath(); g.arc(plot.X(pr.x), plot.Y(pr.y), 5.5, 0, 2 * Math.PI); g.fill(); g.stroke();
      if (live && pr.drag !== false) { g.strokeStyle = c.gold; g.setLineDash([2, 2]); g.beginPath(); g.arc(plot.X(pr.x), plot.Y(pr.y), 10, 0, 2 * Math.PI); g.stroke(); }
      g.restore();
      if (pr.label) plot.text(pr.label, pr.x, pr.y, { dx: -9, dy: -12, color: 'gold', size: 12, weight: 700, align: 'right' });
      if (want.includes('B')) rows.unshift([`$|\\vec B|$ at ${pr.label || 'the probe'}`, tesla(m)]);
      if (want.includes('Bx')) rows.push(['$B_x$', tesla(b[0])]);
      if (want.includes('By')) rows.push(['$B_y$', tesla(b[1])]);
      if (want.includes('mu0NI') && st.toroid) {
        const t = st.toroid, r = Math.hypot(pr.x - num(t.x ?? 0, E), pr.y - num(t.y ?? 0, E)) * L;
        rows.push([`$\\mu_0NI/(2\\pi r)$ at ${pr.label || 'the probe'}`, tesla((M.MU0 * Math.round(num(t.N, E)) * num(t.I, E)) / (2 * Math.PI * r))]);
      }
    }
    if (want.includes('mu0nI') && st.solenoid) {
      const s = st.solenoid, n = Math.round(num(s.N, E)) / (Math.abs(num(s.x1, E) - num(s.x0, E)) * L);
      rows.push(['$\\mu_0 nI$ (ideal long solenoid)', tesla(M.MU0 * n * num(s.I, E))]);
    }
    // handles: a ring for the loop's centre and size
    if (live && st.loop) {
      for (const [hx, hy, kind] of [[st.loop.x, st.loop.y, 'c'], [st.loop.x + st.loop.r, st.loop.y, 's']]) {
        if ((kind === 'c' && st.loop.move === false) || (kind === 's' && st.loop.resize === false)) continue;
        const X = plot.X(hx), Y = plot.Y(hy);
        g.save(); g.fillStyle = c.panel; g.strokeStyle = c.good; g.lineWidth = 2.2;
        g.beginPath(); g.arc(X, Y, 7, 0, 2 * Math.PI); g.fill(); g.stroke();
        g.lineWidth = 1.4; g.beginPath();
        if (kind === 'c') { g.moveTo(X - 4, Y); g.lineTo(X + 4, Y); g.moveTo(X, Y - 4); g.lineTo(X, Y + 4); } else { g.moveTo(X - 3.5, Y); g.lineTo(X + 3.5, Y); g.moveTo(X + 1, Y - 2.5); g.lineTo(X + 3.5, Y); g.lineTo(X + 1, Y + 2.5); }
        g.stroke(); g.restore();
      }
    }
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(P.caption || defaultCaption(P));
  return { get: (k) => (k === 'loop' ? clone(st.loop) : k === 'probe' ? clone(st.probe) : F.params[k]) };
}

function defaultCaption(P) {
  const parts = [];
  if ((P.wires || []).length || P.toroid) parts.push('A dot in a circle: current out of the page; a cross: into it. Each wire is long and straight, perpendicular to the page.');
  if ((P.loops || []).length || P.solenoid) parts.push('The loops are cut through their axis: each crosses the page twice (current out at the dot, in at the cross), and the field is that of real circular loops, computed exactly.');
  if (P.lines) parts.push('Field lines are drawn closer where the field is stronger.');
  if (P.loop) parts.push('The Amperian loop is green where B points along it, amber where against it; ∮B·dl is summed numerically.');
  return parts.join(' ');
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const p = [];
  const keys = keysOf(P);
  const ex = (v, where) => {
    if (v === undefined || v === null || typeof v === 'number') return;
    if (typeof v !== 'string') { p.push(`em-bfield ${where}: a number or an expression`); return; }
    try { fn(v, keys); } catch (e) { p.push(`em-bfield ${where}: “${v}” — ${e.message}`); }
  };
  if (!UNIT[P.unit]) p.push(`em-bfield: unknown unit “${P.unit}” (use ${Object.keys(UNIT).join(', ')})`);
  const scenes = [P, ...(P.presets || [])];
  for (const S of scenes) {
    const hasW = (S.wires || []).length || S.toroid, hasL = (S.loops || []).length || S.solenoid;
    if (hasW && hasL) p.push('em-bfield: wires (or a toroid) and loops (or a solenoid) cannot be mixed in one scene');
    (S.wires || []).forEach((w, k) => { ex(w.x, `wires[${k}].x`); ex(w.y, `wires[${k}].y`); ex(w.I, `wires[${k}].I`); });
    (S.loops || []).forEach((l, k) => { ex(l.x, `loops[${k}].x`); ex(l.R, `loops[${k}].R`); ex(l.I, `loops[${k}].I`); });
    if (S.solenoid) for (const f of ['x0', 'x1', 'R', 'N', 'I']) { if (S.solenoid[f] === undefined) p.push(`em-bfield: solenoid needs ${f}`); ex(S.solenoid[f], `solenoid.${f}`); }
    if (S.toroid) for (const f of ['a', 'b', 'N', 'I']) { if (S.toroid[f] === undefined) p.push(`em-bfield: toroid needs ${f}`); ex(S.toroid[f], `toroid.${f}`); }
    if (S.loop && !(S.loop.r > 0)) p.push('em-bfield: the Amperian loop needs a size r > 0');
    if (S.loop?.shape && !SHAPES[S.loop.shape]) p.push(`em-bfield: unknown loop shape “${S.loop.shape}”`);
  }
  for (const s of P.shapes || []) if (!SHAPES[s]) p.push(`em-bfield: unknown shape “${s}” (use ${Object.keys(SHAPES).join(', ')})`);
  for (const r of P.readouts || []) if (!READOUTS.includes(r)) p.push(`em-bfield: unknown readout “${r}” (use ${READOUTS.join(', ')})`);
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) p.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) p.push(`slider ${s.key} needs a label`);
  }
  if (!(P.x?.[1] > P.x?.[0] && P.y?.[1] > P.y?.[0])) p.push('em-bfield: x and y are ranges [min, max]');
  return p;
}
