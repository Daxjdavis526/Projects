// A complex function as a map of the plane, w = f(z), in the spirit of
// Needham's Visual Complex Analysis. The z-plane (left, or on top on a phone)
// carries a grid — Cartesian or polar — and the w-plane (right) its image,
// so you see what f does to everything at once: lines bend, right angles
// survive wherever f′ ≠ 0, circles of a Möbius map stay circles. A draggable
// point z and its image f(z) give the local picture: the "amplitwist" — a
// small circle round z goes to (nearly) a circle round f(z), magnified by
// |f′(z)| and turned by arg f′(z) — or, for a map that is not complex-
// differentiable, an ellipse. A colour view paints each z by the value f(z)
// (an enhanced phase portrait: hue = arg f, brightness steps where |f|
// doubles and every 30° of arg f), with the w-plane's colour key beside it.
// Multivalued functions (log z, √z, z^c) show their principal branch cut;
// with `follow` the dragged point's value is continued along its path, so
// one trip round 0 lands on another branch. The mathematics lives in
// model/cx-map.js (test/cx-map.test.mjs).
//
//   { type: 'cx-map', params: {
//       f: 'z2',                  // id z2 z3 inv exp log sqrt pow mobius joukowski sin cos conj uv
//       fns: null,                // or a list of those keys: a control to switch between them (f starts it)
//       a: [1, 0], b: [0, 0], c: [0, 0], d: [1, 0],   // Möbius (az + b)/(cz + d): [re, im], numbers or expressions of slider keys
//       p: [0.5, 0],              // the power z^p (complex), principal branch e^{p Log z}
//       u: 'x', v: '-y',          // f = 'uv': real and imaginary parts as expressions of x, y (and slider keys)
//       sliders: [], constants: {}, choices: [],
//       layout: 'split',          // 'split': z-plane and w-plane side by side; 'same': one plane holding both
//       x: [-2, 2], y: [-2, 2],   // the z window (equal axes: the longer side wins)
//       wx: null, wy: null,       // the w window (default: the z window)
//       grid: 'cartesian',        // 'cartesian' | 'polar' | 'none'
//       gx: null, gy: null, gn: 9,          // the Cartesian grid's x and y ranges (default the window) and lines each way
//       gr: [0.25, 2], gth: [-3.1416, 3.1416], gm: 12,   // the polar grid: radii, angles, and rays (circles: gn)
//       ghost: true,              // with layout 'same': the grid before the map, faint
//       shape: null,              // 'F': an asymmetric letter and its image (shows turning and reflection)
//       shapeAt: [0.4, 0.3], shapeSize: 1,
//       view: 'grid',             // 'grid' | 'colour'; showChoice: true adds a control between them
//       showChoice: false,
//       key: true,                // colour view, split: the w panel shows the colour key
//       ticks: true,              // false hides the numbers on the axes
//       curves: [],               // [{ param: [x(t), y(t)], t: [a, b], color, label, wlabel, follow }] in z, drawn with their images
//       points: [],               // [{ x, y, label, wlabel, color }] fixed points and their images
//       drag: { x: 1, y: 0.5, snap: 0, label: 'z', wlabel: 'f(z)' },   // the draggable point (false for none)
//       arrows: false,            // arrows from 0 to z and from 0 to f(z)
//       amplitwist: false, eps: 0.3,        // a small circle round z (radius eps) and two short arrows, with their images
//       follow: false,            // multivalued f: continue the dragged point's value along its path (a branch counter)
//       play: false,              // a button that carries the point once round 0 at its present radius
//       trail: false,             // draw the dragged point's path and its image's path
//       cut: true,                // draw the principal branch cut of a multivalued f
//       readout: true,            // or false, or a list: 'z' 'w' 'fp' 'amp' 'twist' 'jac' 'cr' 'branch', or { label, expr, digits }
//       zname: 'z-plane', wname: 'w-plane',  // panel titles (plain text)
//   } }
//
// get('point') returns the dragged point z as { x, y } (for point items);
// get('w') returns its image.

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/cx-map.js';

export const defaults = {
  f: 'z2', fns: null, a: [1, 0], b: [0, 0], c: [0, 0], d: [1, 0], p: [0.5, 0], u: 'x', v: '-y',
  sliders: [], constants: {}, choices: [],
  layout: 'split', x: [-2, 2], y: [-2, 2], wx: null, wy: null,
  grid: 'cartesian', gx: null, gy: null, gn: 9, gr: [0.25, 2], gth: [-Math.PI, Math.PI], gm: 12, ghost: true,
  shape: null, shapeAt: [0.4, 0.3], shapeSize: 1,
  view: 'grid', showChoice: false, key: true, ticks: true,
  curves: [], points: [], drag: { x: 1, y: 0.5 }, arrows: false, amplitwist: false, eps: 0.3,
  follow: false, play: false, trail: false, cut: true, readout: true, zname: 'z-plane', wname: 'w-plane',
};

const LABELS = { id: 'z', z2: 'z²', z3: 'z³', inv: '1/z', exp: 'eᶻ', log: 'Log z', sqrt: '√z', pow: 'zᶜ', mobius: 'Möbius', joukowski: 'z + 1/z', sin: 'sin z', cos: 'cos z', conj: 'z̄', uv: 'u + iv' };
const TEXNAME = { id: 'z', z2: 'z^2', z3: 'z^3', inv: '1/z', exp: 'e^z', log: '\\operatorname{Log} z', sqrt: '\\sqrt z', pow: 'z^c', mobius: '\\tfrac{az+b}{cz+d}', joukowski: 'z + 1/z', sin: '\\sin z', cos: '\\cos z', conj: '\\bar z', uv: 'u + iv' };
const F_SHAPE = [[0.15, 0.1], [0.15, 0.9], [0.78, 0.9], [0.78, 0.74], [0.33, 0.74], [0.33, 0.58], [0.64, 0.58], [0.64, 0.42], [0.33, 0.42], [0.33, 0.1]];

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

export function mount(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const split = P.layout !== 'same';
  const { canvas, box } = F.canvas({ aspect: split ? (narrow ? '' : 'wide') : (narrow ? 'square' : ''), label: P.alt || 'A complex function as a map: a grid in the z-plane and its image in the w-plane' });
  if (split && narrow) box.style.aspectRatio = '4 / 5';      // a phone stacks the two planes
  const tk = P.ticks === false ? 0 : 5;      // ticks: false hides the numbers on the axes (and the faint grid)
  const zp = new Plot(canvas, { x: P.x, y: P.y, equal: true, xlabel: '', ylabel: '', grid: false, axes: false, xticks: tk, yticks: tk });
  const wp = split ? new Plot(canvas, { x: P.wx || P.x, y: P.wy || P.y, equal: true, xlabel: '', ylabel: '', grid: false, axes: false, xticks: tk, yticks: tk }) : zp;

  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  if (P.fns?.length) F.choice({ key: 'f', label: 'Function $w = f(z)$', options: P.fns.map((k) => [k, `$${TEXNAME[k]}$`]), value: P.f });
  else F.params.f = P.f;
  if (P.showChoice) F.choice({ key: 'view', label: 'Show', options: [['grid', 'grid and its image'], ['colour', 'colour by value']], value: P.view });
  else F.params.view = P.view;
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const ev = (src, E) => (typeof src === 'number' ? src : fn(src, keys)(E));
  const cv = (pair, E) => [ev(pair[0], E), ev(pair[1], E)];
  const opts = (E) => {
    const o = { a: cv(P.a, E), b: cv(P.b, E), c: cv(P.c, E), d: cv(P.d, E), p: cv(P.p, E) };
    if (F.params.f === 'uv') Object.assign(o, M.uvFrom(P.u, P.v, E));
    return o;
  };

  // the dragged point, the continuous argument that follows it, and its trail
  const D = P.drag ? { x: P.drag.x ?? 1, y: P.drag.y ?? 0.5 } : null;
  let th = D ? M.arg([D.x, D.y]) : 0;
  let trail = D ? [[D.x, D.y]] : [];
  const resetTrail = () => { trail = D ? [[D.x, D.y]] : []; th = D ? M.arg([D.x, D.y]) : 0; };
  const moveTo = (x, y) => {
    if (P.drag.snap) { x = Math.round(x / P.drag.snap) * P.drag.snap; y = Math.round(y / P.drag.snap) * P.drag.snap; }
    // continue the argument in small steps, so a fast drag cannot skip round the origin
    const steps = Math.max(1, Math.ceil(Math.hypot(x - D.x, y - D.y) / 0.02));
    for (let k = 1; k <= steps; k++) {
      const z = [D.x + ((x - D.x) * k) / steps, D.y + ((y - D.y) * k) / steps];
      if (M.abs(z) > 1e-9) th = M.contArg(th, z);
    }
    D.x = x; D.y = y;
    if (P.trail || P.follow) { trail.push([x, y]); if (trail.length > 2000) trail.shift(); }
  };
  if (D) {
    zp.handle(() => [D.x, D.y], (x, y) => moveTo(Math.max(zp.vx0, Math.min(zp.vx1, x)), Math.max(zp.vy0, Math.min(zp.vy1, y))), { hollow: true });
    zp.onDrag = () => { draw(); F.notify('point'); };
  }
  if (D && P.play) {
    let anim = null;
    F.button({ label: 'Carry z once round 0', onClick: () => {
      anim?.stop();
      const r = Math.max(0.2, Math.hypot(D.x, D.y)), a0 = Math.atan2(D.y, D.x);
      let s = 0;
      anim = F.animate((dt) => {
        s = Math.min(1, s + dt / 4);
        const a = a0 + 2 * Math.PI * s;
        moveTo(r * Math.cos(a), r * Math.sin(a));
        draw(); F.notify('point');
        if (s >= 1) anim.stop();
      }, { force: true });
    } });
  }
  if (D && (P.follow || P.trail)) F.button({ label: 'Reset path', onClick: () => { resetTrail(); draw(); } });
  F.onChange((k) => { if (k === 'f') resetTrail(); draw(); });

  // ── layout: two panels on one canvas ──
  function layout() {
    zp.resize();
    const w = zp.w, h = zp.h;
    const pad = { l: 30, r: 10, t: 24, b: 22 };
    if (!split) zp.o.pad = pad;
    else if (narrow) {
      zp.o.pad = { ...pad, b: h / 2 + 14 };
      wp.o.pad = { ...pad, t: h / 2 + 24 };
    } else {
      zp.o.pad = { ...pad, r: w / 2 + 10 };
      wp.o.pad = { ...pad, l: w / 2 + 30 };
    }
    zp._fit(); if (split) { wp.resize(); wp._fit(); }
    zp.refreshTheme(); if (split) wp.refreshTheme();
  }
  const frame = (plot, title) => {
    const g = plot.ctx;
    g.save(); g.strokeStyle = plot.col.line2; g.lineWidth = 1; g.strokeRect(plot.L - 0.5, plot.T - 0.5, plot.R - plot.L + 1, plot.B - plot.T + 1); g.restore();
    if (title) plot.text(title, plot.L + 2, plot.T - 11, { screen: true, color: 'ink2', weight: 650, size: 12 });
  };

  // ── colour painting (cached: it is the slow part) ──
  const paintCache = new Map();
  function paint(plot, which, mapFn, sig) {
    const W = Math.max(8, Math.round((plot.R - plot.L) / 1.5)), H = Math.max(8, Math.round((plot.B - plot.T) / 1.5));
    const key = `${which}|${sig}|${W}x${H}|${plot.vx0},${plot.vx1},${plot.vy0},${plot.vy1}`;
    let off = paintCache.get(which);
    if (!off || off.key !== key) {
      const cnv = document.createElement('canvas'); cnv.width = W; cnv.height = H;
      const g = cnv.getContext('2d'), img = g.createImageData(W, H);
      for (let j = 0; j < H; j++) {
        const y = plot.vy1 - ((j + 0.5) / H) * (plot.vy1 - plot.vy0);
        for (let i = 0; i < W; i++) {
          const x = plot.vx0 + ((i + 0.5) / W) * (plot.vx1 - plot.vx0);
          const [r, gg, b] = M.phaseColor(mapFn([x, y]));
          const o = 4 * (j * W + i);
          img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = b; img.data[o + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      off = { key, cnv };
      paintCache.set(which, off);
    }
    const g = plot.ctx;
    g.save(); g.imageSmoothingEnabled = true; g.drawImage(off.cnv, plot.L, plot.T, plot.R - plot.L, plot.B - plot.T); g.restore();
  }

  // ── the grid's lines in z, as parametrised curves ──
  function gridLines() {
    const L = [];
    if (P.grid === 'cartesian') {
      const gx = P.gx || [zp.vx0, zp.vx1], gy = P.gy || [zp.vy0, zp.vy1], n = P.gn;
      for (let k = 0; k < n; k++) {
        const yk = gy[0] + ((gy[1] - gy[0]) * k) / (n - 1), xk = gx[0] + ((gx[1] - gx[0]) * k) / (n - 1);
        L.push({ z: (t) => [t, yk], t: gx, color: 'accent', axis: Math.abs(yk) < 1e-9 });
        L.push({ z: (t) => [xk, t], t: gy, color: 'warn', axis: Math.abs(xk) < 1e-9 });
      }
    } else if (P.grid === 'polar') {
      const [r0, r1] = P.gr, [t0, t1] = P.gth, n = P.gn, m = P.gm;
      for (let k = 0; k < n; k++) { const r = r0 + ((r1 - r0) * k) / Math.max(1, n - 1); L.push({ z: (t) => M.polar(r, t), t: [t0, t1], color: 'accent' }); }
      const full = Math.abs(t1 - t0 - 2 * Math.PI) < 1e-6;
      for (let k = 0; k < m; k++) { const a = t0 + ((t1 - t0) * k) / (full ? m : Math.max(1, m - 1)); L.push({ z: (t) => M.polar(t, a), t: [r0, r1], color: 'warn' }); }
    }
    return L;
  }

  function draw() {
    layout();
    const g = zp.ctx;
    g.clearRect(0, 0, zp.w, zp.h);
    const E = env(), o = opts(E), f = F.params.f;
    const multi = M.multivalued(f, o);
    const colour = F.params.view === 'colour';
    const wdiag = Math.hypot(wp.vx1 - wp.vx0, wp.vy1 - wp.vy0);
    const jump = 0.45 * wdiag;
    const sig = JSON.stringify([f, o.a, o.b, o.c, o.d, o.p, f === 'uv' ? [P.u, P.v, E] : 0]);
    const val = (z) => M.value(f, z, o);

    // backgrounds
    if (colour) {
      paint(zp, 'z', val, sig);
      if (split && P.key) paint(wp, 'w', (w) => w, 'key');
    }
    for (const plot of split ? [zp, wp] : [zp]) {
      if (!colour || (plot === wp && !P.key)) plot.grid();
      plot.axes();
    }
    frame(zp, split ? P.zname : '');
    if (split) frame(wp, P.wname);

    // the grid and its image
    const lines = colour ? [] : gridLines();
    const drawZ = (pts, style) => { g.save(); zp._clip(); zp.path(pts, style); g.restore(); };
    const drawW = (pts, style) => { g.save(); wp._clip(); wp.path(pts, style); g.restore(); };
    for (const Ln of lines) {
      const { z, w } = M.mapCurve(f, o, Ln.z, Ln.t[0], Ln.t[1], 260, { jump });
      if (split || P.ghost) drawZ(z, { color: split ? Ln.color : 'ink3', width: Ln.axis ? 1.8 : 1.2, alpha: split ? 0.75 : 0.45 });
      drawW(w, { color: Ln.color, width: Ln.axis ? 2.2 : 1.6, alpha: 0.9 });
    }
    // the shape
    if (P.shape === 'F') {
      const [sx, sy] = P.shapeAt, s = P.shapeSize;
      const poly = F_SHAPE.map(([x, y]) => [sx + s * x, sy + s * y]);
      const dense = [];
      poly.forEach((p, k) => { const q = poly[(k + 1) % poly.length]; for (let i = 0; i < 16; i++) dense.push([p[0] + ((q[0] - p[0]) * i) / 16, p[1] + ((q[1] - p[1]) * i) / 16]); });
      const img = dense.map((z) => val(z));
      g.save(); zp._clip(); zp.path(dense, { close: true, color: 'ink3', width: 1.2, dash: split ? [] : [4, 4], fill: 'ink3', fillAlpha: 0.12 }); g.restore();
      g.save(); wp._clip(); wp.path(img, { close: true, color: 'gold', width: 2, fill: 'gold', fillAlpha: 0.3 }); g.restore();
    }
    // the branch cut
    if (multi && P.cut) {
      zp.line(0, 0, zp.vx0, 0, { color: 'bad', width: 3, dash: [7, 5] });
      zp.text('cut', Math.max(zp.vx0 + 0.15 * (zp.vx1 - zp.vx0), zp.vx0), 0, { color: 'bad', dy: -11, weight: 650 });
    }
    // curves
    for (const c of P.curves || []) {
      const fx = fn(c.param[0], ['t', ...keys]), fy = fn(c.param[1], ['t', ...keys]);
      const t0 = ev(c.t[0], E), t1 = ev(c.t[1], E);
      const { z, w } = M.mapCurve(f, o, (t) => [fx({ ...E, t }), fy({ ...E, t })], t0, t1, 400, { jump, follow: !!c.follow });
      const color = c.color || 'violet';
      drawZ(z, { color, width: 2.4, dash: split ? [] : [5, 4] });
      drawW(w, { color, width: 2.6 });
      const zl = z.find((p) => Number.isFinite(p[0])), wl = w.filter((p) => Number.isFinite(p[0]));
      if (c.label && zl) { const at = z[Math.floor(z.length * 0.12)]; if (Number.isFinite(at[0])) zp.text(c.label, at[0], at[1], { color, dx: 6, dy: -10, weight: 650 }); }
      if (c.wlabel && wl.length) { const at = wl[Math.floor(wl.length * 0.12)]; wp.text(c.wlabel, at[0], at[1], { color, dx: 6, dy: -10, weight: 650 }); }
    }
    // fixed points
    for (const p of P.points || []) {
      const z = [ev(p.x, E), ev(p.y, E)], w = val(z), color = p.color || 'violet';
      if (split) zp.point(z[0], z[1], { color, r: 4.5, label: p.label });
      else { zp.point(z[0], z[1], { color: 'ink3', r: 2.5, label: p.label }); g.save(); zp._clip(); zp.line(z[0], z[1], w[0], w[1], { color: 'ink4', width: 1, dash: [2, 3] }); g.restore(); }
      if (Number.isFinite(w[0]) && Number.isFinite(w[1])) wp.point(w[0], w[1], { color, r: 4.5, label: p.wlabel });
    }

    // the dragged point
    let w0 = null, at = null, z0 = null, J = null;
    if (D) {
      z0 = [D.x, D.y];
      const th0 = P.follow ? th : M.arg(z0);
      w0 = M.value(f, z0, o, th0);
      at = M.amplitwist(f, z0, o, th0);
      J = M.jacobian(f, z0, o, th0);
      if (P.trail || P.follow) {
        const tz = trail, tw = [];
        let tt = M.arg(tz[0]);
        for (const z of tz) { tt = M.contArg(tt, z); tw.push(M.value(f, z, o, P.follow ? tt : M.arg(z))); }
        drawZ(tz, { color: 'gold', width: 1.6, alpha: 0.7 });
        drawW(tw, { color: 'gold', width: 1.6, alpha: 0.7 });
      }
      if (P.amplitwist) {
        const e = P.eps;
        const circ = (k) => [z0[0] + e * Math.cos(k), z0[1] + e * Math.sin(k)];
        const { z: cz, w: cw } = M.mapCurve(f, o, circ, 0, 2 * Math.PI, 120, { follow: true, th0 });
        drawZ(cz, { color: 'good', width: 2, fill: 'good', fillAlpha: 0.15 });
        drawW(cw, { color: 'good', width: 2.2, fill: 'good', fillAlpha: 0.18 });
        // two short perpendicular arrows from z and their images (the images of the segments, end to end)
        for (const [dir, color] of [[[1, 0], 'accent'], [[0, 1], 'warn']]) {
          const tip = [z0[0] + e * dir[0], z0[1] + e * dir[1]];
          zp.arrow(z0[0], z0[1], tip[0], tip[1], { color, width: 2.4, head: 7 });
          const wt = M.value(f, tip, o, M.contArg(th0, tip));
          if (Number.isFinite(wt[0]) && Number.isFinite(w0[0])) wp.arrow(w0[0], w0[1], wt[0], wt[1], { color, width: 2.6, head: 7 });
        }
      }
      if (P.arrows) {
        zp.arrow(0, 0, z0[0], z0[1], { color: 'ink2', width: 2 });
        if (Number.isFinite(w0[0])) wp.arrow(0, 0, w0[0], w0[1], { color: 'gold', width: 2.6 });
      }
      if (Number.isFinite(w0[0]) && Number.isFinite(w0[1])) {
        wp.point(w0[0], w0[1], { color: 'gold', r: 6, label: P.drag.wlabel ?? 'f(z)', ldx: 10, ldy: -12 });
        wp.point(w0[0], w0[1], { color: 'panel', r: 2.5 });
      }
      zp.point(z0[0], z0[1], { color: 'accent2', r: 0, label: P.drag.label ?? 'z', ldx: 12, ldy: -12 });
      zp.drawHandles();
    }

    // readout
    const want = (k) => P.readout === true ? ['z', 'w', 'amp', 'twist'].includes(k) : Array.isArray(P.readout) && P.readout.includes(k);
    const rows = [];
    if (D) {
      if (want('z')) rows.push(['$z$', cTeX(z0)]);
      if (want('w')) rows.push([P.drag.wlabel && P.drag.wlabel !== 'f(z)' ? P.drag.wlabel : '$f(z)$', cTeX(w0)]);
      if (want('fp')) rows.push([`$f'(z)$`, at ? cTeX(at.d) : '\\text{none}']);
      if (want('amp')) rows.push(['amplification $|f\'(z)|$', at ? n3(at.amp) : '\\text{none: not differentiable}']);
      if (want('twist')) rows.push(['twist $\\arg f\'(z)$', at ? `${n3((at.twist * 180) / Math.PI)}^\\circ` : '\\text{none}']);
      if (want('jac')) rows.push(['Jacobian', `\\begin{bmatrix} ${n3(J[0][0])} & ${n3(J[0][1])} \\\\ ${n3(J[1][0])} & ${n3(J[1][1])} \\end{bmatrix}`]);
      if (want('cr')) { const [r1, r2] = M.crResidual(J); rows.push(['$u_x - v_y$', n3(r1)], ['$u_y + v_x$', n3(r2)]); }
      if (want('branch') && multi) rows.push(['laps round 0 (branch)', String(M.branchOf(z0, th))]);
    }
    for (const r of Array.isArray(P.readout) ? P.readout : []) {
      if (typeof r !== 'object') continue;
      const v = ev(r.expr, E);
      rows.push([r.label, `${Number.isFinite(v) ? +v.toPrecision(r.digits || 3) : '\\text{—}'}${r.unit ? `\\ ${r.unit}` : ''}`]);
    }
    F.readout(P.readout === false ? [] : rows);
    F.caption(colour
      ? `Each point z is painted by the value f(z): the hue gives arg f(z) (red along the positive reals, then yellow-green, blue and violet as the angle turns) and the brightness steps up where |f(z)| doubles and every 30° of arg f(z).${split && P.key ? ' The key paints the w-plane by its own values.' : ''}`
      : split ? 'Left: a grid in the z-plane. Right: where w = f(z) sends it, line by line in the same colours.' : 'Faint: the grid before the map. Bold: its image under w = f(z), in the same colours.');
  }
  F.draw(draw);
  return {
    get: (k) => {
      if (k === 'point') return D ? { x: D.x, y: D.y } : null;
      if (k === 'w') { if (!D) return null; const w = M.value(F.params.f, [D.x, D.y], opts(env()), P.follow ? th : undefined); return { x: w[0], y: w[1] }; }
      return F.params[k];
    },
  };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const check = (src, where, vars = keys) => {
    if (typeof src === 'number') { if (!Number.isFinite(src)) problems.push(`cx-map ${where}: not a finite number`); return; }
    if (typeof src !== 'string') { problems.push(`cx-map ${where}: expected a number or an expression`); return; }
    try { fn(src, vars); } catch (e) { problems.push(`cx-map ${where}: “${src}” — ${e.message}`); }
  };
  const pair = (v, where) => { if (!Array.isArray(v) || v.length !== 2) problems.push(`cx-map ${where} must be [re, im]`); else v.forEach((s, i) => check(s, `${where}[${i}]`)); };
  const win = (v, where) => { if (v != null && (!Array.isArray(v) || v.length !== 2 || !(v[0] < v[1]))) problems.push(`cx-map ${where} must be [min, max] with min < max`); };
  if (!(P.f in M.FNS)) problems.push(`cx-map f: unknown function “${P.f}” (one of ${Object.keys(M.FNS).join(', ')})`);
  if (P.fns != null) { if (!Array.isArray(P.fns) || !P.fns.length) problems.push('cx-map fns must be a list of function keys'); else { for (const k of P.fns) if (!(k in M.FNS)) problems.push(`cx-map fns: unknown function “${k}”`); if (!P.fns.includes(P.f)) problems.push('cx-map fns must include f, the one shown first'); } }
  for (const k of ['a', 'b', 'c', 'd', 'p']) pair(P[k], k);
  const usesUV = P.f === 'uv' || (P.fns || []).includes('uv');
  if (usesUV) { check(P.u, 'u', ['x', 'y', ...keys]); check(P.v, 'v', ['x', 'y', ...keys]); }
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`cx-map slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`cx-map slider ${s.key} needs a label`);
    if (!s.explain) problems.push(`cx-map slider ${s.key} needs an explain line`);
  }
  if (!['split', 'same'].includes(P.layout)) problems.push('cx-map layout must be split or same');
  win(P.x, 'x'); win(P.y, 'y'); win(P.wx, 'wx'); win(P.wy, 'wy'); win(P.gx, 'gx'); win(P.gy, 'gy');
  if (!['cartesian', 'polar', 'none'].includes(P.grid)) problems.push('cx-map grid must be cartesian, polar or none');
  if (P.grid === 'polar') { win(P.gr, 'gr'); win(P.gth, 'gth'); if (P.gr && P.gr[0] < 0) problems.push('cx-map gr: radii must be ≥ 0'); }
  if (!(Number.isInteger(P.gn) && P.gn >= 2 && P.gn <= 40)) problems.push('cx-map gn must be a whole number from 2 to 40');
  if (!(Number.isInteger(P.gm) && P.gm >= 1 && P.gm <= 60)) problems.push('cx-map gm must be a whole number from 1 to 60');
  if (P.shape != null && P.shape !== 'F') problems.push('cx-map shape must be null or F');
  if (!['grid', 'colour'].includes(P.view)) problems.push('cx-map view must be grid or colour');
  if (!(P.eps > 0)) problems.push('cx-map eps must be positive');
  (P.curves || []).forEach((c, k) => {
    if (!Array.isArray(c.param) || c.param.length !== 2) problems.push(`cx-map curves[${k}].param must be [x(t), y(t)]`);
    else c.param.forEach((s, i) => check(s, `curves[${k}].param[${i}]`, ['t', ...keys]));
    if (!Array.isArray(c.t) || c.t.length !== 2) problems.push(`cx-map curves[${k}].t must be [a, b]`); else c.t.forEach((s, i) => check(s, `curves[${k}].t[${i}]`));
  });
  (P.points || []).forEach((p, k) => { check(p.x, `points[${k}].x`); check(p.y, `points[${k}].y`); });
  if (P.drag && !(Number.isFinite(P.drag.x) && Number.isFinite(P.drag.y))) problems.push('cx-map drag needs numbers x and y');
  if ((P.follow || P.play) && !P.drag) problems.push('cx-map follow and play need a draggable point');
  if (Array.isArray(P.readout)) for (const r of P.readout) {
    if (typeof r === 'string') { if (!['z', 'w', 'fp', 'amp', 'twist', 'jac', 'cr', 'branch'].includes(r)) problems.push(`cx-map readout: unknown entry “${r}”`); }
    else if (r && typeof r === 'object') { if (!r.label) problems.push('cx-map readout entries need a label'); check(r.expr, 'readout expr'); }
    else problems.push('cx-map readout entries are names or { label, expr }');
  } else if (typeof P.readout !== 'boolean') problems.push('cx-map readout must be true, false or a list');
  const plain = [P.zname, P.wname, P.drag?.label, P.drag?.wlabel, ...(P.curves || []).flatMap((c) => [c.label, c.wlabel]), ...(P.points || []).flatMap((p) => [p.label, p.wlabel])];
  for (const s of plain) if (s && /[$\\]|(?<![\w])[A-Za-z]{1,2}[_^](?:\{|[A-Za-z0-9])/.test(String(s))) problems.push(`cx-map label “${s}” is plain text: use Unicode (z₀, w², θ), not TeX`);
  return problems;
}
