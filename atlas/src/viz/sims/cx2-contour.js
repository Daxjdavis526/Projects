// A contour integral as a sum of little arrows. On the left, the z-plane: a
// contour (circle, arc, segment, polygon, rectangle or parametrised curve)
// cut into N pieces Δzₖ, with each piece's arrow f(zₖ)Δzₖ drawn on it, the
// singularities of f marked, and optionally the plane painted by the value
// of f (the enhanced phase portrait of cx-map). On the right, the same
// arrows laid head to tail from 0: their sum is the Riemann sum, and as the
// pieces shrink it becomes ∮ f(z) dz — the exact value is the ringed point.
// Drag the contour (its centre, rim or corners) and watch the end of the
// chain: for an analytic f it does not move until the contour crosses a
// singularity, when it jumps by 2πi times the residue. Annuli and discs can
// be shaded (Laurent and Taylor regions), the chain can be divided by 2πi
// (so a circle round a gives the Cauchy average f(a)), and the readout gives
// the integral, winding numbers, and the ML bound. The mathematics lives in
// model/cx2-contour.js (test/cx2-contour.test.mjs).
//
//   { type: 'cx2-contour', params: {
//       f: '1/z',                 // the integrand: a complex expression of z (+ − * / ^, i, pi, e, exp log sqrt sin cos tan cot sinh cosh tanh conj re im abs arg; slider keys are real numbers)
//       fns: null,                // or [{ f, label, marks, value, valueLabel }]: a control to switch integrands (label is markup; marks replace the default marks; value: a complex expression of the slider keys shown in the readout as valueLabel)
//       sliders: [], constants: {}, choices: [],
//       contour: { kind: 'circle', c: [0, 0], r: 1 },   // or arc { c, r, from, to }, segment { from, to }, poly { pts, closed }, rect { x, y }, param { param: [x(t), y(t)], t: [a, b] }, path { parts: [contour, …] } (joined in order); numbers or expressions of slider keys; null: no contour
//       ccw: true,                // circle and rect: anticlockwise
//       drag: false,              // true: circle: centre and rim handles; segment, poly: every vertex; rect: two corners
//       dragRadius: true,         // false: a dragged circle keeps its radius (centre handle only)
//       snap: 0,                  // round dragged positions to this step
//       marks: [],                // [{ x, y, label, kind: 'pole' | 'zero' | 'point', color }] — × for a pole, ○ for a zero
//       x: [-2, 2], y: [-2, 2],   // the z window (equal axes)
//       view: 'plain',            // 'plain' | 'colour' (paint each z by f(z)); showChoice adds a control
//       showChoice: false,
//       panel: 'sum',             // 'sum': the chain of arrows beside the plane; 'none': the plane alone
//       wx: null, wy: null,       // the sum panel's window (default: fitted to the chain and 0)
//       n: 24, nSlider: false,    // pieces; nSlider adds a slider for them
//       arrowsOn: 'fdz',          // arrows on the contour: 'fdz' (f·Δz, scaled up together) | 'f' (f(z), scaled) | false
//       walk: false, play: false, // a slider for how much of the contour has been walked (and a button to walk it)
//       scaleBy: 'one',           // 'twopii': divide the chain and the integral by 2πi
//       rings: [],                // [{ c, r0, r1, color, label }] shaded annuli (r0 = 0: a disc)
//       circles: [],              // [{ c, r, color, dash, label }] reference circles
//       ticks: true, sumTicks: null,   // numbers on the axes (sumTicks for the sum panel; default ticks)
//       readout: true,            // or false, or a list: 'I' 'I2' 'sum' 'wind' 'L' 'M' 'ML', or { label, value } (a complex expression of the slider keys)
//       zname: 'z-plane', wname: null,  // panel titles (plain text)
//       fLabel: null,             // markup for the label of the fns control (default “Integrand f(z)”)
//       iLabel: null,             // markup replacing the label of the readout's integral row (e.g. '$a_n$')
//   } }
//
// get('point') returns the circle's centre or the first vertex as { x, y } (for point
// items); get('I') the integral (after any 2πi division) as { x, y }.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as C from '../model/cx2-contour.js';
import { phaseColor } from '../model/cx-map.js';

export const defaults = {
  f: '1/z', fns: null, sliders: [], constants: {}, choices: [],
  contour: { kind: 'circle', c: [0, 0], r: 1 }, ccw: true, drag: false, dragRadius: true, snap: 0, marks: [],
  x: [-2, 2], y: [-2, 2], view: 'plain', showChoice: false, panel: 'sum', wx: null, wy: null,
  n: 24, nSlider: false, arrowsOn: 'fdz', walk: false, play: false, scaleBy: 'one',
  rings: [], circles: [], ticks: true, sumTicks: null, readout: true, zname: 'z-plane', wname: null, iLabel: null, fLabel: null,
};

const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...Object.keys(P.constants || {})];
const n3 = (x) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (Math.abs(x) < 5e-4) return '0';
  const r = Math.round(x);
  if (Math.abs(x - r) < 5e-4) return String(r);
  return String(+x.toPrecision(3));
};
const cTeX = (z) => {
  if (!z || !Number.isFinite(z[0]) || !Number.isFinite(z[1])) return '\\infty';
  const re = n3(z[0]), im = n3(Math.abs(z[1]));
  if (im === '0') return re;
  const ip = im === '1' ? 'i' : `${im}i`;
  if (re === '0') return `${z[1] < 0 ? '-' : ''}${ip}`;
  return `${re} ${z[1] < 0 ? '-' : '+'} ${ip}`;
};
// the k-th of N arrows: a hue running from blue round to orange along the contour
const hue = (k, N) => `hsl(${Math.round(215 - (190 * k) / Math.max(1, N - 1))}, 72%, 56%)`;
const TWOPI_I = [0, 2 * Math.PI];

export function mount(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const split = P.panel === 'sum';
  const { canvas, box } = F.canvas({ aspect: split ? (narrow ? '' : 'wide') : (narrow ? 'square' : ''), label: P.alt || 'A contour in the complex plane cut into small pieces, and the arrows f times delta z laid head to tail' });
  if (split && narrow) box.style.aspectRatio = '4 / 5';
  const tk = P.ticks === false ? 0 : 5, stk = (P.sumTicks ?? P.ticks) === false ? 0 : 5;
  const zp = new Plot(canvas, { x: P.x, y: P.y, equal: true, grid: false, axes: false, xticks: tk, yticks: tk });
  const wp = split ? new Plot(canvas, { x: P.wx || [-1, 1], y: P.wy || [-1, 1], equal: true, grid: false, axes: false, xticks: stk, yticks: stk }) : null;

  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.fns?.length) F.choice({ key: 'fi', label: P.fLabel || 'Integrand $f(z)$', options: P.fns.map((o, k) => [k, o.label]), value: 0 });
  else F.params.fi = 0;
  if (P.showChoice) F.choice({ key: 'view', label: 'Show', options: [['plain', 'plain plane'], ['colour', 'colour by value of f']], value: P.view });
  else F.params.view = P.view;
  if (P.nSlider) F.slider({ key: 'n', label: 'pieces $N$', min: 4, max: 96, step: 1, value: P.n, explain: 'How many pieces the contour is cut into. More pieces: shorter arrows, and their sum closes in on the integral.' });
  else F.params.n = P.n;
  if (P.walk) F.slider({ key: 'walk', label: 'walked so far', min: 0, max: 1, step: 0.01, value: 1, explain: 'The fraction of the contour walked: the chain on the right is the sum of the arrows so far.' });
  else F.params.walk = 1;

  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const ev = (src, E) => (typeof src === 'number' ? src : fn(src, keys)(E));
  const cv = (pair, E) => [ev(pair[0], E), ev(pair[1], E)];
  const current = () => (P.fns?.length ? P.fns[F.params.fi] || P.fns[0] : { f: P.f, marks: P.marks });
  const compiled = new Map();
  const integrand = () => {
    const src = current().f;
    if (!compiled.has(src)) compiled.set(src, C.compile(src, keys));
    return compiled.get(src);
  };

  // the contour, with numbers; dragging edits this copy
  const evalSpec = (S, E) => {
    if (!S) return null;
    switch (S.kind) {
      case 'circle': return { kind: 'circle', c: cv(S.c, E), r: ev(S.r, E), ccw: S.ccw ?? P.ccw, start: S.start ? ev(S.start, E) : 0 };
      case 'arc': return { kind: 'arc', c: cv(S.c, E), r: ev(S.r, E), from: ev(S.from, E), to: ev(S.to, E) };
      case 'segment': return { kind: 'segment', from: cv(S.from, E), to: cv(S.to, E) };
      case 'poly': return { kind: 'poly', pts: S.pts.map((p) => cv(p, E)), closed: S.closed !== false };
      case 'rect': return { kind: 'rect', x: [ev(S.x[0], E), ev(S.x[1], E)], y: [ev(S.y[0], E), ev(S.y[1], E)], ccw: S.ccw ?? P.ccw };
      case 'param': {
        const fx = fn(S.param[0], ['t', ...keys]), fy = fn(S.param[1], ['t', ...keys]);
        return { kind: 'param', z: (t) => [fx({ ...E, t }), fy({ ...E, t })], t: [ev(S.t[0], E), ev(S.t[1], E)] };
      }
      case 'path': return { kind: 'path', parts: S.parts.map((q) => evalSpec(q, E)) };
      default: return null;
    }
  };
  let S = evalSpec(P.contour, env());
  const live = () => (P.drag ? S : evalSpec(P.contour, env()));
  const snap = (v) => (P.snap ? Math.round(v / P.snap) * P.snap : v);
  const clampX = (x) => Math.max(zp.vx0, Math.min(zp.vx1, snap(x))), clampY = (y) => Math.max(zp.vy0, Math.min(zp.vy1, snap(y)));
  if (P.drag && S) {
    if (S.kind === 'circle') {
      zp.handle(() => S.c, (x, y) => { S.c = [clampX(x), clampY(y)]; }, { hollow: true, label: 'centre' });
      if (P.dragRadius !== false) zp.handle(() => [S.c[0] + S.r, S.c[1]], (x) => { S.r = Math.max(0.05, snap(x - S.c[0])); }, { label: 'radius' });
    } else if (S.kind === 'segment') {
      zp.handle(() => S.from, (x, y) => { S.from = [clampX(x), clampY(y)]; }, { hollow: true });
      zp.handle(() => S.to, (x, y) => { S.to = [clampX(x), clampY(y)]; }, { hollow: true });
    } else if (S.kind === 'poly') {
      S.pts.forEach((p, k) => zp.handle(() => S.pts[k], (x, y) => { S.pts[k] = [clampX(x), clampY(y)]; }, { hollow: true }));
    } else if (S.kind === 'rect') {
      zp.handle(() => [S.x[0], S.y[0]], (x, y) => { S.x[0] = Math.min(clampX(x), S.x[1] - 0.05); S.y[0] = Math.min(clampY(y), S.y[1] - 0.05); }, { hollow: true });
      zp.handle(() => [S.x[1], S.y[1]], (x, y) => { S.x[1] = Math.max(clampX(x), S.x[0] + 0.05); S.y[1] = Math.max(clampY(y), S.y[0] + 0.05); }, { hollow: true });
    }
    zp.onDrag = () => { draw(); F.notify('point'); };
  }
  if (P.walk && P.play) {
    let anim = null;
    F.button({ label: 'Walk the contour', onClick: () => {
      anim?.stop();
      let s = 0;
      anim = F.animate((dt) => { s = Math.min(1, s + dt / 5); F.set('walk', +s.toFixed(3)); draw(); if (s >= 1) anim.stop(); }, { force: true });
    } });
  }
  F.onChange(() => draw());

  function layout() {
    zp.resize();
    const w = zp.w, h = zp.h;
    const pad = { l: 30, r: 10, t: 24, b: 22 };
    if (!split) zp.o.pad = pad;
    else if (narrow) { zp.o.pad = { ...pad, b: h / 2 + 14 }; wp.o.pad = { ...pad, t: h / 2 + 24 }; }
    else { zp.o.pad = { ...pad, r: w / 2 + 10 }; wp.o.pad = { ...pad, l: w / 2 + 30 }; }
    zp._fit(); if (split) { wp.resize(); wp._fit(); }
    zp.refreshTheme(); if (split) wp.refreshTheme();
  }
  const frame = (plot, title) => {
    const g = plot.ctx;
    g.save(); g.strokeStyle = plot.col.line2; g.lineWidth = 1; g.strokeRect(plot.L - 0.5, plot.T - 0.5, plot.R - plot.L + 1, plot.B - plot.T + 1); g.restore();
    if (title) plot.text(title, plot.L + 2, plot.T - 11, { screen: true, color: 'ink2', weight: 650, size: 12 });
  };
  let paintKey = '', paintCnv = null;
  function paint(f, E) {
    const W = Math.max(8, Math.round((zp.R - zp.L) / 1.5)), H = Math.max(8, Math.round((zp.B - zp.T) / 1.5));
    const key = `${current().f}|${JSON.stringify(E)}|${W}x${H}|${zp.vx0},${zp.vx1},${zp.vy0},${zp.vy1}`;
    if (key !== paintKey) {
      const cnv = document.createElement('canvas'); cnv.width = W; cnv.height = H;
      const g = cnv.getContext('2d'), img = g.createImageData(W, H);
      for (let j = 0; j < H; j++) {
        const y = zp.vy1 - ((j + 0.5) / H) * (zp.vy1 - zp.vy0);
        for (let i = 0; i < W; i++) {
          const x = zp.vx0 + ((i + 0.5) / W) * (zp.vx1 - zp.vx0);
          const [r, gg, b] = phaseColor(f([x, y], E));
          const o = 4 * (j * W + i);
          img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = b; img.data[o + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      paintKey = key; paintCnv = cnv;
    }
    const g = zp.ctx;
    g.save(); g.imageSmoothingEnabled = true; g.drawImage(paintCnv, zp.L, zp.T, zp.R - zp.L, zp.B - zp.T); g.restore();
  }
  const ring = (c, r0, r1, color, alpha) => {
    const g = zp.ctx;
    g.save(); zp._clip();
    g.beginPath();
    const rx1 = Math.abs(zp.X(c[0] + r1) - zp.X(c[0])), ry1 = Math.abs(zp.Y(c[1] + r1) - zp.Y(c[1]));
    g.ellipse(zp.X(c[0]), zp.Y(c[1]), rx1, ry1, 0, 0, 2 * Math.PI);
    if (r0 > 0) {
      const rx0 = Math.abs(zp.X(c[0] + r0) - zp.X(c[0])), ry0 = Math.abs(zp.Y(c[1] + r0) - zp.Y(c[1]));
      g.moveTo(zp.X(c[0]) + rx0, zp.Y(c[1]));
      g.ellipse(zp.X(c[0]), zp.Y(c[1]), rx0, ry0, 0, 0, 2 * Math.PI, true);
    }
    g.fillStyle = zp.color(color); g.globalAlpha = alpha; g.fill('evenodd');
    g.restore();
  };

  let lastI = null;
  function draw() {
    layout();
    const g = zp.ctx;
    g.clearRect(0, 0, zp.w, zp.h);
    const E = env(), f0 = integrand(), f = (z) => f0(z, E);
    const spec = live();
    const colour = F.params.view === 'colour';
    const marks = (current().marks || P.marks || []).map((m) => ({ ...m, z: [ev(m.x, E), ev(m.y, E)] }));

    if (colour) paint(f0, E);
    else zp.grid();
    zp.axes();
    frame(zp, P.zname);
    for (const R of P.rings || []) {
      const c = cv(R.c || [0, 0], E), r0 = ev(R.r0 ?? 0, E), r1 = ev(R.r1, E), color = R.color || 'teal';
      ring(c, r0, r1, color, colour ? 0.28 : 0.16);
      zp.circle(c[0], c[1], r1, { color, width: 1.6, dash: [5, 4] });
      if (r0 > 0) zp.circle(c[0], c[1], r0, { color, width: 1.6, dash: [5, 4] });
      // the label sits inside the shaded ring, within the window even when the ring runs far outside it
      const rl = Math.min((r0 + r1) / 2, r0 + 0.22 * (zp.vy1 - zp.vy0));
      if (R.label) zp.text(R.label, c[0] + rl * Math.cos(0.9), c[1] + rl * Math.sin(0.9), { color, weight: 650, align: 'center' });
    }
    for (const Ci of P.circles || []) {
      const c = cv(Ci.c || [0, 0], E), r = ev(Ci.r, E), color = Ci.color || 'ink3';
      zp.circle(c[0], c[1], r, { color, width: 1.4, dash: Ci.dash ?? [4, 4] });
      if (Ci.label) zp.text(Ci.label, c[0] + r * Math.cos(0.6), c[1] + r * Math.sin(0.6), { color, dx: 6, dy: -8, weight: 650 });
    }

    const N = Math.max(1, Math.round(F.params.n));
    const walk = Math.max(0, Math.min(1, +F.params.walk));
    let Iv = null, sum = null, R = null, broken = false, closed = false;
    if (spec) {
      broken = C.hitsSingularity(f, spec);
      const pts = C.sample(spec, 240);
      closed = C.abs(C.sub(pts[0], pts[pts.length - 1])) < 1e-6;
      const ink = colour ? 'ink' : 'violet';
      // the contour, the walked part bold
      g.save(); zp._clip();
      zp.path(pts, { color: ink, width: 2, alpha: walk < 1 ? 0.45 : 1 });
      if (walk < 1 && walk > 0) zp.path(pts.slice(0, Math.max(2, Math.round(walk * pts.length))), { color: ink, width: 3 });
      g.restore();
      if (!broken) {
        R = C.riemann(f, spec, N);
        const raw = C.integrate(f, spec);
        const div = P.scaleBy === 'twopii';
        Iv = div ? C.div(raw, TWOPI_I) : raw;
        const chain = div ? R.chain.map((z) => C.div(z, TWOPI_I)) : R.chain;
        sum = chain[chain.length - 1];
        const shown = Math.round(walk * R.arrows.length);
        // arrows on the contour, scaled up together
        if (P.arrowsOn) {
          const vec = (A) => (P.arrowsOn === 'f' ? A.fz : C.scale(A.a, 1 / Math.max(1e-12, C.abs(A.dz))));
          const lens = R.arrows.map((A) => C.abs(vec(A))).filter(Number.isFinite).sort((a, b) => a - b);
          const ref = lens[Math.floor(0.8 * (lens.length - 1))] || 1;
          const target = 0.1 * Math.min(zp.vx1 - zp.vx0, zp.vy1 - zp.vy0);
          g.save(); zp._clip();
          R.arrows.forEach((A, k) => {
            let v = C.scale(vec(A), target / ref);
            const L = C.abs(v);
            if (L > 1.6 * target) v = C.scale(v, (1.6 * target) / L);
            zp.arrow(A.z[0], A.z[1], A.z[0] + v[0], A.z[1] + v[1], { color: hue(k, R.arrows.length), width: 2, head: 7, alpha: k < shown ? 1 : 0.25 });
          });
          g.restore();
        }
        if (walk < 1) { const zw = C.sample(spec, 240)[Math.min(pts.length - 1, Math.round(walk * (pts.length - 1)))]; zp.point(zw[0], zw[1], { color: 'gold', r: 5 }); }
        // the chain
        if (split) {
          if (!P.wx || !P.wy) {
            let x0 = Math.min(0, Iv[0]), x1 = Math.max(0, Iv[0]), y0 = Math.min(0, Iv[1]), y1 = Math.max(0, Iv[1]);
            for (const z of chain) if (Number.isFinite(z[0]) && Number.isFinite(z[1])) { x0 = Math.min(x0, z[0]); x1 = Math.max(x1, z[0]); y0 = Math.min(y0, z[1]); y1 = Math.max(y1, z[1]); }
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, half = Math.max(0.6, 0.62 * Math.max(x1 - x0, y1 - y0));
            wp.setView(P.wx || [cx - half, cx + half], P.wy || [cy - half, cy + half]);
          }
          wp.grid(); wp.axes();
          g.save(); wp._clip();
          for (let k = 0; k < R.arrows.length; k++) {
            const a = chain[k], b = chain[k + 1];
            wp.arrow(a[0], a[1], b[0], b[1], { color: hue(k, R.arrows.length), width: 2.2, head: 7, alpha: k < shown ? 1 : 0.18 });
          }
          wp.point(0, 0, { color: 'ink2', r: 3.5 });
          if (walk >= 1) {
            wp.circle(Iv[0], Iv[1], (wp.vx1 - wp.vx0) * 0.022, { color: 'gold', width: 2.4 });
            wp.text(div ? (closed ? '(1/2πi)∮ f dz' : '(1/2πi)∫ f dz') : (closed ? '∮ f dz' : '∫ f dz'), Iv[0], Iv[1], { color: 'gold', weight: 700, ...(Iv[0] > (wp.vx0 + wp.vx1) / 2 ? { align: 'right', dx: -12 } : { dx: 12 }), dy: Iv[1] > wp.vy1 - 0.12 * (wp.vy1 - wp.vy0) ? 16 : -12 });
          }
          g.restore();
        }
      } else if (split) {
        wp.setView(P.wx || [-1, 1], P.wy || [-1, 1]);
        wp.grid(); wp.axes();
        wp.text('The contour runs through a singularity:', (wp.L + wp.R) / 2, (wp.T + wp.B) / 2 - 10, { screen: true, align: 'center', color: 'bad', weight: 650 });
        wp.text('the integral is not defined.', (wp.L + wp.R) / 2, (wp.T + wp.B) / 2 + 10, { screen: true, align: 'center', color: 'bad', weight: 650 });
      }
      // direction chevrons
      const PS = C.pieces(spec);
      for (const Pc of PS) for (const u of PS.length > 2 ? [0.5] : PS.length === 2 ? [0.35, 0.8] : [0.13, 0.38, 0.63, 0.88]) {
        // a chevron of fixed screen size at z(u), pointing along the path
        const z = Pc.z(u), d = Pc.dz(u), X = zp.X(z[0]), Y = zp.Y(z[1]);
        const dx = zp.X(z[0] + d[0]) - X, dy = zp.Y(z[1] + d[1]) - Y, L = Math.hypot(dx, dy) || 1;
        const ux = dx / L, uy = dy / L;
        zp.arrow(zp.ix(X - 9 * ux), zp.iy(Y - 9 * uy), zp.ix(X + 9 * ux), zp.iy(Y + 9 * uy), { color: ink, width: 2.4, head: 12 });
      }
    } else if (split) { wp.grid(); wp.axes(); }
    if (split) frame(wp, P.wname || (P.scaleBy === 'twopii' ? 'the arrows ÷ 2πi, head to tail' : 'the arrows f·Δz, head to tail'));

    // marks
    for (const m of marks) {
      const [x, y] = m.z, color = m.color || (colour ? 'ink' : m.kind === 'zero' ? 'teal' : m.kind === 'point' ? 'gold' : 'bad');
      if (m.kind === 'zero') zp.circle(x, y, (zp.vx1 - zp.vx0) * 0.012, { color, width: 2.4 });
      else if (m.kind === 'point') zp.point(x, y, { color, r: 4.5 });
      else {
        const s = 6, X = zp.X(x), Y = zp.Y(y);
        g.save(); g.strokeStyle = zp.color(color); g.lineWidth = 2.6; g.lineCap = 'round';
        g.beginPath(); g.moveTo(X - s, Y - s); g.lineTo(X + s, Y + s); g.moveTo(X - s, Y + s); g.lineTo(X + s, Y - s); g.stroke(); g.restore();
      }
      if (m.label) zp.text(m.label, x, y, { color, dx: 9, dy: -11, weight: 650 });
    }
    zp.drawHandles();

    // readout
    const want = (k) => (P.readout === true ? ['I', 'sum'].includes(k) : Array.isArray(P.readout) && P.readout.includes(k));
    const rows = [];
    const sym = closed ? '\\oint' : '\\int';
    if (spec) {
      const pre = P.scaleBy === 'twopii' ? `\\tfrac{1}{2\\pi i}${sym}` : sym;
      if (broken) { if (P.readout !== false) rows.push([`$${sym} f\\,dz$`, '\\text{not defined: a singularity on the contour}']); }
      else {
        if (want('I')) rows.push([P.iLabel || `$${pre} f\\,dz$`, cTeX(Iv)]);
        if (want('I2') && P.scaleBy !== 'twopii') rows.push([`$\\tfrac{1}{2\\pi i}${sym} f\\,dz$`, cTeX(C.div(C.integrate(f, spec), TWOPI_I))]);
        if (want('sum')) rows.push([`sum of ${N} arrows`, cTeX(sum)]);
      }
      if (want('wind')) for (const m of marks) if (m.label) { const w = C.winding(spec, m.z); rows.push([`laps round ${m.label}`, Number.isFinite(w) ? String(Math.round(w)) : '\\text{on the contour}']); }
      const L = C.length(spec), Mx = broken ? { M: Infinity } : C.maxAbs(f, spec);
      if (want('L')) rows.push(['length $L$', n3(L)]);
      if (want('M')) rows.push(['largest $|f|$ on it, $M$', n3(Mx.M)]);
      if (want('ML')) rows.push(['bound $ML$', Number.isFinite(Mx.M) ? n3(L * Mx.M) : '\\infty']);
      if (want('M') && Mx.at && Number.isFinite(Mx.M)) zp.point(Mx.at[0], Mx.at[1], { color: 'gold', r: 5, label: 'M', ldx: 8, ldy: -12 });
    }
    for (const r of Array.isArray(P.readout) ? P.readout : []) if (r && typeof r === 'object') rows.push([r.label, cTeX(C.compile(r.value, keys)([0, 0], E))]);
    const cur = current();
    if (cur.value && P.readout !== false) rows.push([cur.valueLabel || 'value', cTeX(C.compile(cur.value, keys)([0, 0], E))]);
    lastI = Iv;
    F.readout(P.readout === false ? [] : rows);
    F.caption(split
      ? 'Left: the contour cut into pieces, each carrying the arrow f(z)·Δz (drawn longer than true, all by the same factor). Right: the same arrows head to tail from 0, to true scale; the gold ring is the exact integral.'
      : 'The z-plane with the contour and the singularities of f (× poles, ○ zeros).');
  }
  F.draw(draw);
  return {
    get: (k) => {
      const s = live();
      if (k === 'point') { if (!s) return null; const p = s.kind === 'circle' || s.kind === 'arc' ? s.c : s.kind === 'segment' ? s.from : s.kind === 'poly' ? s.pts[0] : s.kind === 'rect' ? [s.x[0], s.y[0]] : null; return p ? { x: p[0], y: p[1] } : null; }
      if (k === 'I') return lastI ? { x: lastI[0], y: lastI[1] } : null;
      return F.params[k];
    },
  };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const check = (src, where, vars = keys) => {
    if (typeof src === 'number') { if (!Number.isFinite(src)) problems.push(`cx2-contour ${where}: not a finite number`); return; }
    if (typeof src !== 'string') { problems.push(`cx2-contour ${where}: expected a number or an expression`); return; }
    try { fn(src, vars); } catch (e) { problems.push(`cx2-contour ${where}: “${src}” — ${e.message}`); }
  };
  const pair = (v, where) => { if (!Array.isArray(v) || v.length !== 2) problems.push(`cx2-contour ${where} must be [x, y]`); else v.forEach((s, i) => check(s, `${where}[${i}]`)); };
  const win = (v, where) => { if (v != null && (!Array.isArray(v) || v.length !== 2 || !(v[0] < v[1]))) problems.push(`cx2-contour ${where} must be [min, max] with min < max`); };
  const cexpr = (src, where) => {
    if (typeof src !== 'string') { problems.push(`cx2-contour ${where}: the integrand must be a string`); return; }
    try { const g = C.compile(src, keys); const E = { ...(P.constants || {}) }; for (const s of P.sliders || []) E[s.key] = s.value; for (const c of P.choices || []) E[c.key] = c.value; g([0.37, 0.21], E); } catch (e) { problems.push(`cx2-contour ${where}: “${src}” — ${e.message}`); }
  };
  if (P.fns != null) {
    if (!Array.isArray(P.fns) || !P.fns.length) problems.push('cx2-contour fns must be a list of { f, label }');
    else P.fns.forEach((o, k) => { cexpr(o.f, `fns[${k}].f`); if (!o.label) problems.push(`cx2-contour fns[${k}] needs a label`); (o.marks || []).forEach((m, j) => { check(m.x, `fns[${k}].marks[${j}].x`); check(m.y, `fns[${k}].marks[${j}].y`); }); if (o.value != null) cexpr(o.value, `fns[${k}].value`); });
  } else cexpr(P.f, 'f');
  for (const k of keys) if (['n', 'walk', 'fi', 'view', 'z', 'i', 'x', 'y', 'e', 'pi'].includes(k)) problems.push(`cx2-contour: the key “${k}” is reserved; name the slider, choice or constant something else`);
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`cx2-contour slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`cx2-contour slider ${s.key} needs a label`);
    if (!s.explain) problems.push(`cx2-contour slider ${s.key} needs an explain line`);
  }
  const S = P.contour;
  if (S != null) {
    const kinds = ['circle', 'arc', 'segment', 'poly', 'rect', 'param', 'path'];
    if (!kinds.includes(S.kind)) problems.push(`cx2-contour contour.kind must be one of ${kinds.join(', ')}`);
    if (S.kind === 'circle' || S.kind === 'arc') { pair(S.c, 'contour.c'); check(S.r, 'contour.r'); }
    if (S.kind === 'arc') { check(S.from, 'contour.from'); check(S.to, 'contour.to'); }
    if (S.kind === 'segment') { pair(S.from, 'contour.from'); pair(S.to, 'contour.to'); }
    if (S.kind === 'poly') { if (!Array.isArray(S.pts) || S.pts.length < 2) problems.push('cx2-contour contour.pts needs 2+ points'); else S.pts.forEach((p, k) => pair(p, `contour.pts[${k}]`)); }
    if (S.kind === 'rect') { pair(S.x, 'contour.x'); pair(S.y, 'contour.y'); }
    if (S.kind === 'path') { if (!Array.isArray(S.parts) || !S.parts.length) problems.push('cx2-contour contour.parts must list the pieces'); else S.parts.forEach((q, k) => { for (const pr of validate({ ...P, drag: false, contour: q, fns: null, f: P.fns?.[0]?.f ?? P.f })) problems.push(pr.replace('contour.', `contour.parts[${k}].`)); }); }
    if (S.kind === 'param') { if (!Array.isArray(S.param) || S.param.length !== 2) problems.push('cx2-contour contour.param must be [x(t), y(t)]'); else S.param.forEach((s, i) => check(s, `contour.param[${i}]`, ['t', ...keys])); pair(S.t, 'contour.t'); }
    if (P.drag && ['arc', 'param', 'path'].includes(S.kind)) problems.push('cx2-contour drag works on circle, segment, poly and rect contours only');
    if (P.drag) {
      const leaves = [S.c, S.r, S.from, S.to, S.pts, S.x, S.y].flat(3).filter((v) => v !== undefined);
      if (leaves.some((v) => typeof v !== 'number')) problems.push('cx2-contour a draggable contour takes numbers, not expressions');
    }
  } else if (P.panel === 'sum') problems.push('cx2-contour panel “sum” needs a contour');
  (P.marks || []).forEach((m, k) => { check(m.x, `marks[${k}].x`); check(m.y, `marks[${k}].y`); if (m.kind && !['pole', 'zero', 'point'].includes(m.kind)) problems.push(`cx2-contour marks[${k}].kind must be pole, zero or point`); });
  for (const [k, R] of (P.rings || []).entries()) { if (R.c) pair(R.c, `rings[${k}].c`); check(R.r1, `rings[${k}].r1`); if (R.r0 != null) check(R.r0, `rings[${k}].r0`); }
  for (const [k, R] of (P.circles || []).entries()) { if (R.c) pair(R.c, `circles[${k}].c`); check(R.r, `circles[${k}].r`); }
  win(P.x, 'x'); win(P.y, 'y'); win(P.wx, 'wx'); win(P.wy, 'wy');
  if (!['plain', 'colour'].includes(P.view)) problems.push('cx2-contour view must be plain or colour');
  if (!['sum', 'none'].includes(P.panel)) problems.push('cx2-contour panel must be sum or none');
  if (!['one', 'twopii'].includes(P.scaleBy)) problems.push('cx2-contour scaleBy must be one or twopii');
  if (![false, 'fdz', 'f'].includes(P.arrowsOn)) problems.push('cx2-contour arrowsOn must be fdz, f or false');
  if (!(Number.isInteger(P.n) && P.n >= 1 && P.n <= 400)) problems.push('cx2-contour n must be a whole number from 1 to 400');
  if (P.play && !P.walk) problems.push('cx2-contour play needs walk');
  if (Array.isArray(P.readout)) {
    for (const r of P.readout) {
      if (r && typeof r === 'object') { if (!r.label) problems.push('cx2-contour readout entries need a label'); cexpr(r.value, 'readout value'); }
      else if (!['I', 'I2', 'sum', 'wind', 'L', 'M', 'ML'].includes(r)) problems.push(`cx2-contour readout: unknown entry “${r}”`);
    }
  }
  else if (typeof P.readout !== 'boolean') problems.push('cx2-contour readout must be true, false or a list');
  const plain = [P.zname, P.wname, ...(P.marks || []).map((m) => m.label), ...(P.fns || []).flatMap((o) => (o.marks || []).map((m) => m.label)), ...(P.rings || []).map((r) => r.label), ...(P.circles || []).map((r) => r.label)];
  for (const s of plain) if (s && /[$\\]|(?<![\w])[A-Za-z]{1,2}[_^](?:\{|[A-Za-z0-9])/.test(String(s))) problems.push(`cx2-contour label “${s}” is plain text: use Unicode (z₀, w², θ), not TeX`);
  return problems;
}
