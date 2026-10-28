// A uniformly magnetized cylinder or sphere — a permanent magnet — cut
// through its axis, which lies across the page: its B field, its H field or
// its magnetization M, with their sources. B lines are closed loops through
// the magnet, made by the bound surface current K_b = M × n̂ (⊙ on top, ⊗
// underneath); H lines start on the north face and end on the south face,
// where the "pole density" M·n̂ sits, and inside the magnet H points against
// M. A draggable probe draws μ₀H and μ₀M head to tail, adding up to B. The
// aspect-ratio slider runs from a thin disk (H inside ≈ −M) to a long rod
// (H inside ≈ 0); the readout gives the demagnetizing factor at the centre.
// With kind: 'electret' the same picture is a uniformly polarized body: D, E
// and P instead of B, H and M, bound charge ±P·n̂ instead of bound current —
// the side-by-side of electrostatics and magnetostatics. Exact fields (the
// solenoid in closed form) from model/em3h-magnet.js, tested headlessly in
// test/em3h-magnet.test.mjs.
//
//   { type: 'em3h-magnet', params: {
//       kind: 'magnet',         // magnet | electret
//       shape: 'cylinder',      // cylinder | sphere
//       ratio: 1,               // cylinder: length / diameter (0.1–6)
//       show: 'B',              // B | H | M   (electret: D | E | P)
//       M: 1000,                // magnetization, kA/m (electret: P in μC/m²), for the readouts
//       sources: true,          // draw the sources of the field shown: bound currents (B, M) or pole density (H)
//       lines: 5,               // field lines per half (0–10)
//       probe: [0.4, 0.5],      // [along the axis, across it] in units of the radius, or false
//       inset: true,            // the probe's B, μ₀H and μ₀M added head to tail in a corner panel
//       x: null, y: null,       // the view (units of the radius; the axis runs along x); a default from the shape
//       labels: true,           // N and S, and the names of the sources
//       controls: null,         // true, false, or a list of: show ratio shape sources kind
//       readout: true,
//       readouts: null,         // which rows to show (default all): B H M N
//       views: null,            // which views the Show choice offers (default B H M)
//       hide: [],               // readouts shown as “?”: B H M N
//   } }

import { Plot } from '../plot.js';
import * as Mod from '../model/em3h-magnet.js';

export const defaults = {
  kind: 'magnet', shape: 'cylinder', ratio: 1, show: 'B', M: 1000, sources: true, lines: 5,
  probe: [0.4, 0.5], inset: true, x: null, y: null, labels: true, controls: null, readout: true, readouts: null, views: null, hide: [],
};
const CONTROLS = ['show', 'ratio', 'shape', 'sources', 'kind'];
const HIDE = ['B', 'H', 'M', 'N'];
const NAMES = {
  magnet: { B: 'B', H: 'H', M: 'M', fB: 'B', fH: 'μ₀H', fM: 'μ₀M' },
  electret: { B: 'D', H: 'E', M: 'P', fB: 'D', fH: 'ε₀E', fM: 'P' },
};
const COLORS = { B: 'accent', H: 'violet', M: 'gold' };
const f3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toPrecision(3)));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? ['show', 'ratio', 'sources'] : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make, value) => (wanted.includes(key) ? make() : (F.params[key] = value));
  const kindNow = () => F.params.kind ?? P.kind;
  const nm = () => NAMES[kindNow()];
  ctl('kind', () => F.choice({ key: 'kind', label: 'The body', options: [['magnet', 'a magnet ($\\vec M$)'], ['electret', 'an electret ($\\vec P$)']], value: P.kind, explain: 'A uniformly magnetized body, or a uniformly polarized one: the same mathematics with bound current replaced by bound charge.' }), P.kind);
  const toView = (s) => ({ B: 'B', H: 'H', M: 'M', D: 'B', E: 'H', P: 'M' }[s] || 'B');
  const OPTS = wanted.includes('kind')
    ? { B: 'the field ($\\vec B$ or $\\vec D$)', H: 'the auxiliary field ($\\vec H$ or $\\vec E$)', M: 'the magnetization or polarization' }
    : P.kind === 'electret' ? { B: '$\\vec D$', H: '$\\vec E$', M: '$\\vec P$' } : { B: '$\\vec B$', H: '$\\vec H$', M: '$\\vec M$' };
  const views = (P.views || ['B', 'H', 'M']).map(toView);
  const EXPL = { B: 'B and D have closed field lines', H: 'H and E start and end on the end faces', M: 'M and P live only inside the material' };
  ctl('show', () => F.choice({ key: 'show', label: 'Show', options: views.map((v) => [v, OPTS[v]]), value: toView(P.show), explain: `${views.map((v) => EXPL[v]).join('; ')}.` }), toView(P.show));
  const hasH = views.includes('H');
  ctl('shape', () => F.choice({ key: 'shape', label: 'Shape', options: [['cylinder', 'cylinder'], ['sphere', 'sphere']], value: P.shape, explain: hasH ? 'A sphere’s inside fields are uniform: B = ⅔μ₀M and H = −M/3.' : 'A sphere’s inside field is uniform: B = ⅔μ₀M.' }), P.shape);
  ctl('ratio', () => F.slider({ key: 'ratio', label: 'Length ÷ diameter', min: 0.1, max: 4, step: 0.05, value: P.ratio, explain: 'A thin disk on the left of the scale, a long rod on the right.' }), P.ratio);
  ctl('sources', () => F.toggle({ key: 'sources', label: 'Show the sources', value: P.sources, explain: hasH ? 'Bound current K = M × n̂ for B; the pole density M·n̂ on the end faces for H (bound charge for an electret).' : 'The bound current K = M × n̂ on the curved side.' }), P.sources);

  const a = F.canvas({ aspect: 'wide', label: P.alt || 'A uniformly magnetized body cut through its axis, with its field lines' });
  const plot = new Plot(a.canvas, { x: [-3.2, 3.2], y: [-1.6, 1.6], equal: true, axes: false, grid: false });
  // the probe, in screen coordinates (along the axis, across it)
  const pr = P.probe ? { u: P.probe[0], v: P.probe[1] } : null;
  if (pr) {
    plot.handle(() => [pr.u, pr.v], (u, v) => { pr.u = Math.max(plot.vx0, Math.min(plot.vx1, u)); pr.v = Math.max(plot.vy0, Math.min(plot.vy1, v)); }, { hollow: true, label: 'probe' });
    plot.onDrag = () => draw();
  }

  const bodyNow = () => Mod.body({ shape: F.params.shape ?? P.shape, ratio: F.params.ratio ?? P.ratio });
  // screen (u along the axis, v across) ↔ model (x radial, z axial): u = z, v = x
  function view(S) {
    if (P.x && P.y) return [P.x, P.y];
    const half = S.shape === 'sphere' ? 1 : S.half;
    const xr = Math.max(3.2, half + 2.3);
    return [[-xr, xr], [-xr / 2, xr / 2]];
  }

  function draw() {
    const S = bodyNow(), [vx, vy] = view(S);
    plot.setView(vx, vy);
    plot.clear();
    const g = plot.ctx, narrow = (a.canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    const which = F.params.show ?? 'B', names = nm(), elec = kindNow() === 'electret';
    const half = S.shape === 'sphere' ? 1 : S.half;
    // the body
    if (S.shape === 'sphere') plot.circle(0, 0, 1, { fill: 'ink3', alpha: 0.18, color: 'ink2', width: 1.6, strokeAlpha: 1 });
    else plot.rect(-half, -1, 2 * half, 2, { fill: 'ink3', alpha: 0.18, stroke: 'ink2', width: 1.6 });

    const box = [plot.vy0 - 0.2, plot.vy1 + 0.2, plot.vx0 - 0.2, plot.vx1 + 0.2];   // model [x0, x1, z0, z1]
    const ds = (plot.vx1 - plot.vx0) / 500;
    const col = COLORS[which];
    const nL = Math.max(0, Math.min(10, P.lines | 0));
    const toScreen = (pts) => pts.map(([x, z]) => [z, x]);
    const head = (pts, frac, c) => {
      if (pts.length < 8) return;
      const i = Math.min(pts.length - 3, Math.floor(pts.length * frac));
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 2];
      plot.arrow(z0, x0, z1, x1, { color: c, width: 1.6, head: 7 });
    };
    if (which === 'M') {
      // M (or P) lives only inside: a grid of equal arrows
      const nu = Math.max(2, Math.round((2 * half) / 0.55)), nv = 4;
      for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
        const u = -half + ((i + 0.5) * 2 * half) / nu, v = -1 + ((j + 0.5) * 2) / nv;
        if (S.shape === 'sphere' && u * u + v * v > 0.8) continue;
        const L = Math.min(0.42, (1.6 * half) / nu);
        plot.arrow(u - L / 2, v, u + L / 2, v, { color: 'gold', width: 2, head: 7 });
      }
    } else if (nL > 0) {
      for (const [x0, z0] of Mod.seeds(S, which, nL)) for (const side of x0 === 0 ? [1] : [1, -1]) {
        if (which === 'B') {
          const fw = Mod.trace(S, 'B', side * x0, z0, 1, box, { ds });
          let pts = fw.pts;
          if (fw.end !== 'closed') { const bw = Mod.trace(S, 'B', side * x0, z0, -1, box, { ds }); pts = [...bw.pts.reverse(), ...fw.pts.slice(1)]; }
          plot.path(toScreen(pts), { color: col, width: 1.5, alpha: 0.9 });
          head(fw.pts, 0.08, col); head(fw.pts, 0.5, col);
        } else {
          const eps = 1e-3;
          const sx = side * x0, outZ = S.shape === 'sphere' ? z0 * (1 + eps) : z0 + eps, inZ = S.shape === 'sphere' ? z0 * (1 - eps) : z0 - eps;
          const sxo = S.shape === 'sphere' ? sx * (1 + eps) : sx, sxi = S.shape === 'sphere' ? sx * (1 - eps) : sx;
          const out = Mod.trace(S, 'H', sxo, outZ, 1, box, { ds });
          const inn = Mod.trace(S, 'H', sxi, inZ, 1, box, { ds });
          plot.path(toScreen(out.pts), { color: col, width: 1.5, alpha: 0.9 });
          plot.path(toScreen(inn.pts), { color: col, width: 1.5, alpha: 0.9 });
          head(out.pts, 0.3, col); head(inn.pts, 0.5, col);
        }
      }
    }
    // the sources
    if (F.params.sources ?? P.sources) {
      if (which === 'H' || (elec && which !== 'B')) {
        // pole density (magnet) or bound charge (electret): + on the north face, − on the south
        const marks = S.shape === 'sphere'
          ? [15, 35, 55, 75, 105, 125, 145, 165].flatMap((t) => [1, -1].map((s) => { const th = (t * Math.PI) / 180; return [Math.cos(th), s * Math.sin(th), Math.cos(th)]; }))
          : [-0.8, -0.4, 0, 0.4, 0.8].flatMap((v) => [[half, v, 1], [-half, v, -1]]);
        for (const [u, v, c] of marks) {
          const sz = S.shape === 'sphere' ? 10 + 6 * Math.abs(c) : 14;
          plot.text(c > 0 ? '+' : '−', u, v, { align: 'center', size: sz, weight: 700, color: c > 0 ? 'warn' : 'accent', dx: (c > 0 ? 1 : -1) * (S.shape === 'sphere' ? 0 : 8) });
        }
        if (P.labels !== false && !narrow) plot.text(elec ? 'bound charge P·n̂' : 'pole density M·n̂', half, 1, { dx: 10, dy: -12, size: fs - 0.5, color: 'ink2' });
      } else if (!elec) {
        // bound current K = M × n̂: out of the page on top, into it underneath
        const nK = half < 0.3 ? 1 : Math.max(2, Math.round((2 * half) / 0.5));
        const us = S.shape === 'sphere' ? [-0.8, -0.5, -0.2, 0.2, 0.5, 0.8] : Array.from({ length: nK }, (_, i) => -half + ((i + 0.5) * 2 * half) / nK);
        for (const u of us) for (const s of [1, -1]) {
          const v = S.shape === 'sphere' ? s * Math.sqrt(Math.max(0, 1 - u * u)) : s;
          const r = S.shape === 'sphere' ? 3 + 3.5 * Math.abs(v) : 5.5;
          const X = plot.X(u), Y = plot.Y(v);
          g.save(); g.strokeStyle = plot.col.warn; g.fillStyle = plot.col.warn; g.lineWidth = 1.6;
          g.beginPath(); g.arc(X, Y, r, 0, 2 * Math.PI); g.stroke();
          if (s > 0) { g.beginPath(); g.arc(X, Y, Math.max(1.4, r * 0.3), 0, 2 * Math.PI); g.fill(); }
          else { const d = r * 0.65; g.beginPath(); g.moveTo(X - d, Y - d); g.lineTo(X + d, Y + d); g.moveTo(X - d, Y + d); g.lineTo(X + d, Y - d); g.stroke(); }
          g.restore();
        }
        if (P.labels !== false && !narrow) plot.text('bound current K = M × n̂', -half, 1, { dx: -12, dy: -12, size: fs - 0.5, color: 'warn', align: 'right' });
      }
    }
    // names of the ends
    if (P.labels !== false && !elec) {
      plot.text('N', half, 0, { dx: 14, dy: 0, size: fs + 2, weight: 700, color: 'ink2' });
      plot.text('S', -half, 0, { dx: -14, dy: 0, size: fs + 2, weight: 700, color: 'ink2', align: 'right' });
    }
    // the probe: the field there, and an inset adding μ₀H and μ₀M head to tail to make B
    if (pr) {
      const x = pr.v, z = pr.u, b = Mod.B(S, x, z), h = Mod.H(S, x, z), m = Mod.M(S, x, z);
      const f = which === 'H' ? h : which === 'M' ? m : b, fm = Math.hypot(f[0], f[1]);
      if (fm > 1e-3) plot.arrowPx(z, x, (f[1] / fm) * 34, (f[0] / fm) * 34, { color: col, width: 2.6, head: 8 });
      plot.drawHandles();
      if (P.inset !== false) inset(b, h, m, names, narrow);
    }
    readouts(S);
  }

  // a small panel in the top-left corner: B, μ₀H and μ₀M at the probe, on one scale (rows, so collinear arrows stay apart)
  function inset(b, h, m, names, narrow) {
    const g = plot.ctx, c = plot.col, s = narrow ? 30 : 44, lab = narrow ? 30 : 40;
    const W = lab + 2.15 * s + 12, Hh = 66, x0 = plot.L + 6, y0 = plot.T + 6;
    g.save(); g.fillStyle = c.bg; g.globalAlpha = 0.82; g.fillRect(x0, y0, W, Hh); g.globalAlpha = 1;
    g.strokeStyle = c.line3; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, W, Hh); g.restore();
    const ox = x0 + lab + 1.05 * s, rows = [y0 + 16, y0 + 34, y0 + 52];
    const seg = (sx, y, v, color, w) => {
      const dx = v[1] * s, dy = -v[0] * s, L = Math.hypot(dx, dy);
      if (L < 1.5) { g.save(); g.fillStyle = c[color]; g.beginPath(); g.arc(sx, y, 2.2, 0, 2 * Math.PI); g.fill(); g.restore(); return sx; }
      plot.arrow(plot.ix(sx), plot.iy(y), plot.ix(sx + dx), plot.iy(y + Math.max(-7, Math.min(7, dy))), { color, width: w, head: 7 });
      return sx + dx;
    };
    g.save(); g.strokeStyle = c.line3; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(ox, y0 + 6); g.lineTo(ox, y0 + Hh - 4); g.stroke(); g.restore();
    seg(ox, rows[0], b, 'accent', 2.6);
    const tip = seg(ox, rows[1], h, 'violet', 2.2);
    seg(tip, rows[2], m, 'gold', 2.2);
    plot.text(names.fB, x0 + 6, rows[0], { screen: true, size: 11.5, color: 'accent', weight: 600 });
    plot.text(names.fH, x0 + 6, rows[1], { screen: true, size: 11.5, color: 'violet', weight: 600 });
    plot.text(`+ ${names.fM}`, x0 + 6, rows[2], { screen: true, size: 11.5, color: 'gold', weight: 600 });
  }

  function readouts(S) {
    if (P.readout === false) { F.readout([]); return; }
    const q = (k, v) => (hide.has(k) ? '?' : v);
    const elec = kindNow() === 'electret', Mv = P.M;
    const rows = [];
    const want = new Set(P.readouts || HIDE);
    if (pr) {
      const x = pr.v, z = pr.u, b = Mod.B(S, x, z), h = Mod.H(S, x, z), m = Mod.M(S, x, z);
      const lead = (k) => (rows.length ? '' : ' at the probe');
      if (elec) {
        if (want.has('B')) rows.push([`$D$ along the axis${lead()}`, q('B', `${f3(b[1] * Mv)}\\,\\mu\\text{C/m}^2`)]);
        if (want.has('H')) rows.push([`$E$ along the axis${lead()}`, q('H', `${f3((h[1] * Mv * 1e-6) / Mod.EPS0 / 1e3)}\\,\\text{kV/m}`)]);
        if (want.has('M')) rows.push(['$P$', q('M', `${f3(m[1] * Mv)}\\,\\mu\\text{C/m}^2`)]);
      } else {
        if (want.has('B')) rows.push([`$B$ along the axis${lead()}`, q('B', `${f3(b[1] * Mod.MU0 * Mv * 1e3)}\\,\\text{T}`)]);
        if (want.has('H')) rows.push([`$H$ along the axis${lead()}`, q('H', `${f3(h[1] * Mv)}\\,\\text{kA/m}`)]);
        if (want.has('M')) rows.push(['$M$', q('M', `${f3(m[1] * Mv)}\\,\\text{kA/m}`)]);
      }
    }
    if (want.has('N')) rows.push([elec ? 'depolarizing factor at the centre' : 'demagnetizing factor at the centre', q('N', `N = ${f3(Mod.centreN(S))}`)]);
    F.readout(rows);
  }

  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || (P.kind === 'electret'
    ? 'A uniformly polarized body cut through its axis, with exact fields. Lines start spaced by equal flux in three dimensions; arrows at the probe share one scale.'
    : 'A uniformly magnetized body cut through its axis, with exact fields (the magnet is its bound surface current: a finite solenoid). Lines start spaced by equal flux in three dimensions; arrows at the probe share one scale. Real magnets are not perfectly uniform.'));
  return { get: (k) => (k === 'point' ? (pr ? { x: pr.u, y: pr.v } : null) : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!['magnet', 'electret'].includes(P.kind)) p.push('em3h-magnet: kind is magnet or electret');
  if (!['cylinder', 'sphere'].includes(P.shape)) p.push('em3h-magnet: shape is cylinder or sphere');
  if (!(Number.isFinite(P.ratio) && P.ratio >= 0.05 && P.ratio <= 6)) p.push('em3h-magnet: ratio (length/diameter) is in 0.05–6');
  if (!['B', 'H', 'M', 'D', 'E', 'P'].includes(P.show)) p.push('em3h-magnet: show is B, H or M (D, E or P)');
  if (!(Number.isFinite(P.M) && P.M > 0)) p.push('em3h-magnet: M is a positive number (kA/m, or μC/m² for an electret)');
  if (!(Number.isInteger(P.lines) && P.lines >= 0 && P.lines <= 10)) p.push('em3h-magnet: lines is 0–10 per half');
  if (P.probe !== false && P.probe !== null && !(Array.isArray(P.probe) && P.probe.length === 2 && P.probe.every(Number.isFinite))) p.push('em3h-magnet: probe is [u, v] or false');
  for (const k of ['x', 'y']) if (P[k] !== null && !(Array.isArray(P[k]) && P[k].length === 2 && P[k][0] < P[k][1])) p.push(`em3h-magnet: ${k} is a range [lo, hi]`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`em3h-magnet: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`em3h-magnet: unknown hide “${h}”`);
  for (const h of P.readouts || []) if (!HIDE.includes(h)) p.push(`em3h-magnet: unknown readout “${h}”`);
  for (const v of P.views || []) if (!['B', 'H', 'M', 'D', 'E', 'P'].includes(v)) p.push(`em3h-magnet: unknown view “${v}”`);
  return p;
}
