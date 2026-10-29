// Ideal flow past a cylinder or a Joukowski airfoil, from one complex
// potential. Streamlines are the level curves of ψ = Im W, traced in the
// circle plane and carried to the airfoil by ζ = z + 1/z, so the picture is
// exactly the conformal-map construction of the lesson. Sliders set the
// angle of attack, the circulation Γ (or let the Kutta condition choose it),
// and the airfoil's camber and thickness; the stagnation points are marked
// (with too little circulation the rear one sits on the upper surface and
// the flow whips round the sharp trailing edge at infinite speed). Rows of
// dots released together upstream show the parcels over the top reaching
// the trailing edge first — there is no "equal transit time". The
// background can be shaded by speed (fast is low pressure, by Bernoulli).
// Optionally the circle plane is drawn beside, with the same streamlines.
// The mathematics lives in model/cx3-flow.js (test/cx3-flow.test.mjs).
//
//   { type: 'cx3-flow', params: {
//       mode: 'airfoil',          // 'airfoil' (Joukowski) | 'cylinder'
//       alpha: 6,                 // angle of attack, degrees
//       gamma: 0,                 // circulation Γ in units of U × (circle-plane length); clockwise positive (lift up)
//       kutta: true,              // Γ set by the Kutta condition (airfoil only); false: the gamma slider rules
//       camber: 0.08, thick: 0.1, // the circle's centre (−thick, camber); it passes through z = 1
//       a: 1,                     // the cylinder's radius
//       controls: null,           // which controls: any of 'alpha' 'gamma' 'kutta' 'camber' 'thick' 'a' (default by mode)
//       ranges: {},               // { alpha: [min, max], gamma: [min, max], … } slider ranges
//       panels: ['flow'],         // add 'circle' for the circle plane beside the flow
//       dots: true,               // rows of parcels released together upstream (animated; under reduced motion, press Play)
//       speed: false,             // shade the background by |V|/U; showSpeed: true adds a toggle
//       showSpeed: false,
//       stag: true,               // mark the stagnation points
//       lines: 8, dpsi: 0.3,      // streamlines: this many on each side of the body, Δψ apart (× U·R)
//       x: [-3.4, 3.4], y: [-1.9, 1.9],   // the flow window (equal axes)
//       readout: true,            // or false, or a list: 'gamma' 'kutta' 'cl' 'stag'
//       labels: true,             // canvas labels (trailing edge, stagnation)
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/cx3-flow.js';

export const defaults = {
  mode: 'airfoil', alpha: 6, gamma: 0, kutta: true, camber: 0.08, thick: 0.1, a: 1, controls: null, ranges: {},
  panels: ['flow'], dots: true, speed: false, showSpeed: false, stag: true, lines: 8, dpsi: 0.3,
  x: [-3.4, 3.4], y: [-1.9, 1.9], readout: true, labels: true,
};
const DEG = Math.PI / 180;
const CTRL = ['alpha', 'gamma', 'kutta', 'camber', 'thick', 'a'];
const n3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toPrecision(3)));
// speed ratio → colour: slow (high pressure) blue, free stream grey, fast (low pressure) orange
function speedColor(q) {
  const t = Math.max(-1, Math.min(1, Math.log2(Math.max(1e-3, q))));
  const A = [70, 120, 220], Z = [128, 128, 140], B = [240, 140, 50];
  const [p, s] = t < 0 ? [A, -t] : [B, t];
  return Z.map((v, k) => Math.round(v + (p[k] - v) * s));
}

export function mount(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const split = P.panels.includes('circle');
  const airfoil = P.mode === 'airfoil';
  const { canvas, box } = F.canvas({ aspect: split ? (narrow ? '' : 'wide') : '', label: P.alt || (airfoil ? 'Streamlines of ideal flow past an airfoil, with parcels released together upstream' : 'Streamlines of ideal flow past a cylinder') });
  if (split && narrow) box.style.aspectRatio = '3 / 4';
  const fp = new Plot(canvas, { x: P.x, y: P.y, equal: true, grid: false, axes: false });
  const cp = split ? new Plot(canvas, { x: [-2.6, 2.6], y: [-2, 2], equal: true, grid: false, axes: false }) : null;

  const want = P.controls || (airfoil ? ['alpha', 'kutta', 'gamma', 'camber', 'thick'] : ['alpha', 'gamma']);
  const rg = (k, d) => P.ranges?.[k] || d;
  const ctl = {};
  for (const k of want) {
    if (k === 'alpha') { const [lo, hi] = rg('alpha', [-10, 16]); ctl.alpha = F.slider({ key: 'alpha', label: 'angle of attack $\\alpha$', min: lo, max: hi, step: 0.5, value: P.alpha, unit: '^\\circ', explain: 'The angle between the oncoming stream and the line through the trailing edge and the circle’s centre’s image (the chord, for a flat plate).' }); }
    if (k === 'kutta' && airfoil) ctl.kutta = F.toggle({ key: 'kutta', label: 'Kutta condition sets $\\Gamma$', value: P.kutta, explain: 'Choose the one circulation that makes the flow leave the sharp trailing edge smoothly.' });
    if (k === 'gamma') { const [lo, hi] = rg('gamma', airfoil ? [-3, 8] : [-16, 16]); ctl.gamma = F.slider({ key: 'gamma', label: 'circulation $\\Gamma$', min: lo, max: hi, step: 0.1, value: P.gamma, explain: 'How strongly the flow circulates round the body (clockwise positive), in units of free-stream speed × length.' }); }
    if (k === 'camber' && airfoil) { const [lo, hi] = rg('camber', [0, 0.25]); F.slider({ key: 'camber', label: 'camber $m_y$', min: lo, max: hi, step: 0.01, value: P.camber, explain: 'Moves the circle’s centre up: the airfoil curves, and lifts even at zero angle of attack.' }); }
    if (k === 'thick' && airfoil) { const [lo, hi] = rg('thick', [0, 0.3]); F.slider({ key: 'thick', label: 'thickness $m_x$', min: lo, max: hi, step: 0.01, value: P.thick, explain: 'Moves the circle’s centre left: a fatter, rounder nose.' }); }
    if (k === 'a' && !airfoil) { const [lo, hi] = rg('a', [0.4, 1.4]); F.slider({ key: 'a', label: 'radius $a$', min: lo, max: hi, step: 0.05, value: P.a, explain: 'The cylinder’s radius.' }); }
  }
  for (const k of CTRL) if (F.params[k] === undefined) F.params[k] = P[k];
  if (P.showSpeed) F.toggle({ key: 'speed', label: 'shade by speed', value: P.speed, explain: 'Orange: faster than the free stream (lower pressure, by Bernoulli). Blue: slower (higher pressure).' });
  else F.params.speed = P.speed;

  const flow = () => {
    const U = 1, alpha = +F.params.alpha * DEG;
    if (!airfoil) return { U, alpha, c0: [0, 0], R: +F.params.a, Gamma: +F.params.gamma, map: 'none' };
    const { c0, R, beta } = M.circleFor(+F.params.thick, +F.params.camber);
    const Gk = M.kuttaGamma(U, R, alpha, beta);
    return { U, alpha, c0, R, beta, Gk, Gamma: F.params.kutta ? Gk : +F.params.gamma, map: 'joukowski' };
  };

  // parcels: a row released together upstream, tracked by circle-plane points
  let dots = [], clock = 0;
  const release = (Fl) => {
    const x0 = fp.vx0 + 0.04 * (fp.vx1 - fp.vx0), n = narrow ? 13 : 17, ys = [];
    for (let k = 0; k < n; k++) ys.push(P.y[0] * 0.8 + ((P.y[1] - P.y[0]) * 0.8 * k) / (n - 1));
    dots = ys.map((y) => { const z = M.inverse([x0, y], Fl); return { z, above: M.psi(z, Fl) > M.psiBody(Fl) }; });
    clock = 0;
  };
  let anim = null;
  const step = (dt) => {
    const Fl = flow();
    if (!dots.length) release(Fl);
    const h = Math.min(dt, 0.05) * 1.1;
    for (const d of dots) for (let s = 0; s < 3; s++) d.z = M.advect(d.z, Fl, h / 3);
    clock += h;
    const map = M.mapOf(Fl);
    if (clock > 9 || dots.every((d) => map(d.z)[0] > fp.vx1)) release(Fl);
    draw();
  };
  if (P.dots) {
    anim = F.animate((dt) => step(dt));
    F.button({ label: 'Release a row of dots', onClick: () => { release(flow()); anim?.stop(); anim = F.animate((dt) => step(dt), { force: true }); } });
  }
  F.onChange((k) => { if (k !== 'speed') release(flow()); draw(); });

  function layout() {
    fp.resize();
    const w = fp.w, h = fp.h, pad = { l: 8, r: 8, t: 24, b: 8 };
    if (!split) fp.o.pad = pad;
    else if (narrow) { cp.o.pad = { ...pad, b: h * 0.6 + 8 }; fp.o.pad = { ...pad, t: h * 0.4 + 26 }; }
    else { cp.o.pad = { ...pad, r: w * 0.6 + 8 }; fp.o.pad = { ...pad, l: w * 0.4 + 10 }; }
    fp._fit(); fp.refreshTheme();
    if (split) { cp.resize(); cp.o.pad = narrow ? { ...pad, b: h * 0.6 + 8 } : { ...pad, r: w * 0.6 + 8 }; cp._fit(); cp.refreshTheme(); }
  }
  const frame = (plot, title) => {
    const g = plot.ctx;
    g.save(); g.strokeStyle = plot.col.line2; g.lineWidth = 1; g.strokeRect(plot.L - 0.5, plot.T - 0.5, plot.R - plot.L + 1, plot.B - plot.T + 1); g.restore();
    if (title) plot.text(title, plot.L + 2, plot.T - 11, { screen: true, color: 'ink2', weight: 650, size: 12 });
  };
  const clipTo = (plot) => { const g = plot.ctx; g.beginPath(); g.rect(plot.L, plot.T, plot.R - plot.L, plot.B - plot.T); g.clip(); };

  let paintKey = '', paintCnv = null, lineKey = '', lineCache = null;
  function paint(Fl) {
    const W = Math.max(8, Math.round((fp.R - fp.L) / 2)), H = Math.max(8, Math.round((fp.B - fp.T) / 2));
    const key = `${JSON.stringify(Fl)}|${W}x${H}|${fp.vx0},${fp.vy0},${fp.vx1}`;
    if (key !== paintKey) {
      const cnv = document.createElement('canvas'); cnv.width = W; cnv.height = H;
      const g = cnv.getContext('2d'), img = g.createImageData(W, H);
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        const zeta = [fp.vx0 + ((i + 0.5) / W) * (fp.vx1 - fp.vx0), fp.vy1 - ((j + 0.5) / H) * (fp.vy1 - fp.vy0)];
        const z = M.inverse(zeta, Fl), o = 4 * (j * W + i);
        if (M.abs(M.sub(z, Fl.c0)) < Fl.R) { img.data[o + 3] = 0; continue; }
        const [r, gg, b] = speedColor(M.abs(M.velocity(z, Fl)) / Fl.U);
        img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = b; img.data[o + 3] = 120;
      }
      g.putImageData(img, 0, 0);
      paintKey = key; paintCnv = cnv;
    }
    const g = fp.ctx;
    g.save(); g.imageSmoothingEnabled = true; g.drawImage(paintCnv, fp.L, fp.T, fp.R - fp.L, fp.B - fp.T); g.restore();
  }

  function draw() {
    layout();
    const g = fp.ctx;
    g.clearRect(0, 0, fp.w, fp.h);
    const Fl = flow(), map = M.mapOf(Fl);
    const key = JSON.stringify(Fl);
    if (key !== lineKey) { lineCache = M.streamlines(Fl, { n: P.lines, dpsi: P.dpsi, rmax: 10 }); lineKey = key; }
    const stag = P.stag ? M.stagnation(Fl) : [];

    // the circle plane
    if (split) {
      frame(cp, 'circle plane z');
      cp.ctx.save(); clipTo(cp);
      for (const L of lineCache) cp.path(L.pts, { color: L.k === 0 ? 'accent2' : 'accent', width: L.k === 0 ? 2 : 1.3, alpha: L.k === 0 ? 1 : 0.75 });
      cp.circle(Fl.c0[0], Fl.c0[1], Fl.R, { fill: 'ink4', alpha: 0.5, color: 'ink2', width: 2, strokeAlpha: 1 });
      cp.circle(0, 0, 1, { color: 'ink3', width: 1, dash: [3, 4] });
      for (const p of [[1, 0], [-1, 0]]) cp.point(p[0], p[1], { color: 'ink2', r: 3 });
      if (P.labels) cp.text('±1: J′ = 0', 1, 0, { dx: 6, dy: 12, color: 'ink3', size: 11 });
      for (const s of stag) cp.point(s[0], s[1], { color: 'bad', r: 4.5 });
      cp.ctx.restore();
    }

    // the flow plane
    if (F.params.speed) paint(Fl);
    frame(fp, airfoil ? (split ? 'airfoil plane ζ = z + 1/z' : '') : '');
    g.save(); clipTo(fp);
    for (const L of lineCache) fp.path(L.pts.map(map), { color: L.k === 0 ? 'accent2' : 'accent', width: L.k === 0 ? 2.2 : 1.4, alpha: L.k === 0 ? 1 : 0.8 });
    fp.path(M.body(Fl, 400), { color: 'ink2', width: 2, fill: 'ink3', fillAlpha: 0.55, close: true });
    // free-stream arrow
    const ax = fp.vx0 + 0.05 * (fp.vx1 - fp.vx0), ay = fp.vy1 - 0.12 * (fp.vy1 - fp.vy0), al = 0.12 * (fp.vx1 - fp.vx0);
    fp.arrow(ax, ay, ax + al * Math.cos(Fl.alpha), ay + al * Math.sin(Fl.alpha), { color: 'ink2', width: 2, head: 8 });
    if (P.labels) fp.text('U', ax + al * Math.cos(Fl.alpha), ay + al * Math.sin(Fl.alpha), { dx: 6, dy: -6, color: 'ink2', weight: 650 });
    for (const s of stag) {
      const p = map(s);
      fp.point(p[0], p[1], { color: 'bad', r: 5 });
    }
    if (P.labels && stag.length) {
      const pts = stag.map(map).sort((a, b) => a[0] - b[0]);
      fp.text('stagnation', pts[0][0], pts[0][1], { dx: 0, dy: 16, align: 'center', color: 'bad', size: 11.5 });
    }
    if (airfoil && P.labels) fp.text('trailing edge', 2, 0, { dx: 2, dy: 16, align: 'right', color: 'ink3', size: 11 });
    // the parcels
    if (P.dots && dots.length) {
      const pts = dots.map((d) => ({ p: map(d.z), above: d.above }));
      const gap = 0.35 * (P.y[1] - P.y[0]);
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k];
        if (a.above === b.above && M.abs(M.sub(a.p, b.p)) < gap) fp.line(a.p[0], a.p[1], b.p[0], b.p[1], { color: a.above ? 'gold' : 'violet', width: 1.6, alpha: 0.9 });
      }
      for (const d of pts) fp.point(d.p[0], d.p[1], { color: d.above ? 'gold' : 'violet', r: 3.6 });
    }
    g.restore();

    // readout
    if (P.readout) {
      const wantR = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
      const ch = M.chord(Fl), cl = (2 * Fl.Gamma) / (Fl.U * ch);
      F.readout([
        wantR('gamma') && ['$\\Gamma$', n3(Fl.Gamma)],
        airfoil && wantR('kutta') && ['$\\Gamma_{\\text{Kutta}}$', n3(Fl.Gk)],
        wantR('cl') && ['lift coefficient $C_L = 2\\Gamma/Uc$', n3(cl)],
        wantR('stag') && ['stagnation points', String(stag.length)],
      ]);
    }
  }
  F.draw(draw);
  return { get: (k) => (k === 'gamma' ? flow().Gamma : undefined) };
}

export function validate(P) {
  const out = [];
  if (!['airfoil', 'cylinder'].includes(P.mode)) out.push('cx3-flow mode must be airfoil or cylinder');
  for (const k of ['alpha', 'gamma', 'camber', 'thick', 'a', 'lines', 'dpsi']) if (!Number.isFinite(+P[k])) out.push(`cx3-flow ${k} must be a number`);
  if (!(+P.thick > -0.5 && +P.thick < 0.8)) out.push('cx3-flow thick must lie in (−0.5, 0.8)');
  if (!(+P.camber > -0.6 && +P.camber < 0.6)) out.push('cx3-flow camber must lie in (−0.6, 0.6)');
  if (!(+P.a > 0)) out.push('cx3-flow a must be positive');
  if (!Array.isArray(P.panels) || !P.panels.includes('flow') || P.panels.some((p) => !['flow', 'circle'].includes(p))) out.push('cx3-flow panels must include flow, and may add circle');
  if (P.controls != null && (!Array.isArray(P.controls) || P.controls.some((c) => !CTRL.includes(c)))) out.push(`cx3-flow controls: any of ${CTRL.join(', ')}`);
  for (const [k, r] of Object.entries(P.ranges || {})) if (!CTRL.includes(k) || !Array.isArray(r) || !(r[0] < r[1])) out.push(`cx3-flow ranges.${k} must be [min, max]`);
  for (const w of ['x', 'y']) if (!Array.isArray(P[w]) || !(P[w][0] < P[w][1])) out.push(`cx3-flow ${w} must be [min, max]`);
  if (Array.isArray(P.readout)) for (const r of P.readout) if (!['gamma', 'kutta', 'cl', 'stag'].includes(r)) out.push(`cx3-flow readout: unknown entry “${r}”`);
  return out;
}
