// Stability regions of ODE methods in the complex hλ-plane (Numerical Methods,
// st-f F9–F11). Applied to y′ = λy with step h, a one-step method multiplies
// y by R(z), z = hλ, every step; it is absolutely stable where |R(z)| ≤ 1.
//   plane — the region |R(z)| ≤ 1 of the chosen method, shaded, with its
//           boundary; other offered methods outlined (`compare`); a draggable
//           point z, or the eigenvalues hλ of a system scaled by a step slider,
//           or the method-of-lines eigenvalues of the heat equation scaled by
//           the mesh ratio r = DΔt/Δx²
//   run   — |yₙ| after n steps on a logarithmic axis: the method (dots) against
//           the exact |e^(nz)| (line), for the point or the worst eigenvalue
// Stability functions in model/num3-stab.js (test/num3-stab.test.mjs).
//
//   { type: 'num3-stability', params: {
//       methods: ['euler', 'heun', 'rk4'],  // offered: euler heun rk3 rk4 dp5 beuler trap
//       method: 'euler',                    // the one shaded first
//       compare: false,                     // outline every offered method, not only the chosen one
//       z: [-0.6, 0.8],                     // the draggable point z = hλ (null: none)
//       drag: true,                         // false: the point is fixed
//       snap: 0.05,                         // the point snaps to multiples of this (0: no snapping)
//       eigs: null,                         // [[re, im], …]: eigenvalues λ (in s⁻¹), drawn as z = hλ
//       eigLabels: null,                    // plain-text labels for them
//       h: 0.1, hmin: 0.001, hmax: 1, hlog: true, hunit: 's',   // the step slider when eigs are given
//       mol: 0,                             // N > 0: the heat equation on N interior points; a slider sets r
//       r: 0.4, rmax: 1,                    // the mesh ratio and the top of its slider
//       x: [-3.6, 1.2], y: [-3.2, 3.2],     // the window (equal scales: the shorter range widens)
//       panels: ['plane', 'run'],
//       n: 30,                              // run panel: steps shown
//       marks: [],                          // [{ z: [re, im], label, color }]: fixed labelled points
//       legend: true,
//       controls: null,                     // true, false, or a list of: method h r
//       readout: true,
//       hide: [],                           // readouts shown as “?”: R verdict
//   } }
// `get('point')` returns z as { x, y } for point items; `get('h')` and `get('r')` read the sliders.

import { Plot } from '../plot.js';
import * as M from '../model/num3-stab.js';

export const defaults = { methods: ['euler', 'heun', 'rk4'], method: 'euler', compare: false, z: [-0.6, 0.8], drag: true, snap: 0.05, eigs: null, eigLabels: null, h: 0.1, hmin: 0.001, hmax: 1, hlog: true, hunit: 's', mol: 0, r: 0.4, rmax: 1, x: [-3.6, 1.2], y: [-3.2, 3.2], panels: ['plane', 'run'], n: 30, marks: [], legend: true, controls: null, readout: true, hide: [] };
const CONTROLS = ['method', 'h', 'r'];
const HIDE = ['R', 'verdict'];
const OUTLINE = ['warn', 'good', 'violet', 'teal', 'gold', 'bad'];

const texNum = (x, d = 3) => {
  if (!Number.isFinite(x)) return '\\infty';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e4)) { const [m, e] = x.toExponential(d - 1).split('e'); return `${+m}\\times10^{${+e}}`; }
  return String(+x.toPrecision(d));
};
const zTeX = (z) => {
  const re = +z[0].toPrecision(3), im = +z[1].toPrecision(3);
  if (Math.abs(im) < 1e-9) return texNum(re);
  if (Math.abs(re) < 1e-9) return `${texNum(im)}i`;
  return `${texNum(re)} ${im < 0 ? '-' : '+'} ${texNum(Math.abs(im))}i`;
};

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const methods = P.methods.includes(P.method) ? P.methods : [P.method, ...P.methods];
  const mode = P.mol > 0 ? 'mol' : P.eigs ? 'eigs' : 'point';
  const auto = [...(methods.length > 1 ? ['method'] : []), ...(mode === 'eigs' ? ['h'] : []), ...(mode === 'mol' ? ['r'] : [])];
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? auto : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('method', () => F.choice({ key: 'method', label: 'Method', options: methods.map((m) => [m, M.NAME[m]]), value: P.method, explain: 'The shaded region is where that method’s step multiplier satisfies $|R(h\\lambda)| \\le 1$.' }));
  ctl('h', () => F.slider({ key: 'h', label: 'Step $h$', min: P.hmin, max: P.hmax, step: P.hlog ? undefined : (P.hmax - P.hmin) / 200, value: P.h, unit: P.hunit ? `\\mathrm{${P.hunit}}` : '', logScale: !!P.hlog, explain: 'Each eigenvalue λ of the system is drawn at z = hλ: a longer step pushes them all outward along their rays.' }));
  ctl('r', () => F.slider({ key: 'r', label: 'Mesh ratio $r = D\\,\\Delta t/\\Delta x^2$', min: 0.02, max: P.rmax, step: 0.01, value: P.r, explain: `The time step measured against $\\Delta x^2/D$. The ${P.mol} grid modes sit at $z = -4r\\sin^2(\\cdot)$, spread over $[-4r, 0]$.` }));
  if (!wanted.includes('method')) F.params.method = P.method;

  let z = P.z ? [...P.z] : null;
  const panels = P.panels;
  const cvA = panels.includes('plane') ? F.canvas({ aspect: '', label: P.alt || 'The stability region of the method in the complex plane of z = hλ' }) : null;
  const cvB = panels.includes('run') ? F.canvas({ aspect: 'wide', label: 'The size of the numerical solution after n steps against the exact one, on a log scale' }) : null;
  const pA = cvA && new Plot(cvA.canvas, { x: P.x, y: P.y, equal: true, xlabel: 'Re(hλ)', ylabel: 'Im(hλ)' });
  const pB = cvB && new Plot(cvB.canvas, { x: [0, P.n], y: [-6.6, 6.6], xlabel: 'step n', ylabel: '|yₙ|', axesAt: 'edge', yfmt: undefined });
  if (pB) pB.o.yfmt = (t) => { const k = Math.round(t); if (Math.abs(t - k) > 1e-9 || k % 2) return ''; return k === 0 ? '1' : `10${String(k).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`; };

  if (pA && z && P.drag) {
    pA.handle(() => z, (x, y) => {
      if (P.snap > 0) { x = Math.round(x / P.snap) * P.snap; y = Math.round(y / P.snap) * P.snap; }
      z = [+x.toFixed(10), +y.toFixed(10)];
    }, { hollow: true, label: 'z = hλ' });
    pA.onDrag = () => { drawAll(); F.notify('point'); };
  }

  // the scaled points z = hλ of the current setting
  const zs = () => {
    if (mode === 'mol') return M.heatZ(P.mol, F.params.r);
    if (mode === 'eigs') return P.eigs.map((l) => [F.params.h * l[0], F.params.h * l[1]]);
    return z ? [z] : [];
  };
  const worst = (m) => {
    const list = zs();
    if (!list.length) return null;
    let k = 0, a = -1;
    list.forEach((q, i) => { const v = M.absR(m, q); if (v > a + 1e-12) { a = v; k = i; } });
    return { k, z: list[k], a };
  };

  function region(m, shade, color, width, dash) {
    const g = pA.ctx, cell = 3;
    const nx = Math.ceil((pA.R - pA.L) / cell) + 1, ny = Math.ceil((pA.B - pA.T) / cell) + 1;
    const v = new Float64Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const q = [pA.ix(pA.L + i * cell), pA.iy(pA.T + j * cell)];
      const a = M.absR(m, q);
      v[j * nx + i] = Number.isFinite(a) ? Math.log(a) : 50;       // log|R|: 0 on the boundary
    }
    g.save();
    pA._clip();
    if (shade) {
      // one path of cells filled once, so neighbouring cells do not double the alpha at their seams
      g.fillStyle = pA.color('accent');
      g.globalAlpha = 0.2;
      g.beginPath();
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const c = (v[j * nx + i] + v[j * nx + i + 1] + v[(j + 1) * nx + i] + v[(j + 1) * nx + i + 1]) / 4;
        if (c <= 0) g.rect(pA.L + i * cell, pA.T + j * cell, cell, cell);
      }
      g.fill();
      g.globalAlpha = 1;
    }
    // the boundary |R| = 1 by marching squares
    g.strokeStyle = pA.color(color);
    g.lineWidth = width;
    g.setLineDash(dash || []);
    g.beginPath();
    const lerp = (a, b) => a / (a - b);
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = v[j * nx + i], b = v[j * nx + i + 1], c = v[(j + 1) * nx + i + 1], d = v[(j + 1) * nx + i];
      const x0 = pA.L + i * cell, y0 = pA.T + j * cell;
      const pts = [];
      if ((a <= 0) !== (b <= 0)) pts.push([x0 + cell * lerp(a, b), y0]);
      if ((b <= 0) !== (c <= 0)) pts.push([x0 + cell, y0 + cell * lerp(b, c)]);
      if ((d <= 0) !== (c <= 0)) pts.push([x0 + cell * lerp(d, c), y0 + cell]);
      if ((a <= 0) !== (d <= 0)) pts.push([x0, y0 + cell * lerp(a, d)]);
      if (pts.length >= 2) { g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); }
      if (pts.length === 4) { g.moveTo(pts[2][0], pts[2][1]); g.lineTo(pts[3][0], pts[3][1]); }
    }
    g.stroke();
    g.restore();
  }

  function drawPlane() {
    if (!pA) return;
    const m = F.params.method;
    pA.clear();
    const narrow = (cvA.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    region(m, true, 'accent', 2.4);
    const others = P.compare ? methods.filter((q) => q !== m) : [];
    others.forEach((q, i) => region(q, false, OUTLINE[i % OUTLINE.length], 1.6, [6, 4]));
    if (P.legend) {
      const rows = [[M.NAME[m] + ' (shaded: |R| ≤ 1)', 'accent'], ...others.map((q, i) => [M.NAME[q], OUTLINE[i % OUTLINE.length]])];
      rows.forEach(([s, c], i) => pA.text(s, pA.L + 8, pA.T + 12 + i * (fs + 5), { screen: true, color: c, size: fs, weight: 650 }));
    }
    for (const mk of P.marks || []) pA.point(mk.z[0], mk.z[1], { color: mk.color || 'ink2', r: 3.5, label: mk.label, lsize: fs, ldx: mk.ldx, ldy: mk.ldy, lalign: mk.lalign });
    const W = worst(m);
    if (mode !== 'point') {
      zs().forEach((q, i) => {
        const bad = M.absR(m, q) > 1 + 1e-12;
        const lab = mode === 'eigs' && P.eigLabels ? P.eigLabels[i] : '';
        const out = q[0] < pA.vx0;
        const qx = Math.max(pA.vx0 + 0.02 * (pA.vx1 - pA.vx0), q[0]);
        pA.point(qx, q[1], { color: bad ? 'bad' : 'gold', r: mode === 'mol' ? 3.2 : 5, label: lab ? lab + (out ? ' (off the left edge)' : '') : out ? 'off the left edge' : '', lsize: fs, ldy: -11, ldx: 6 });
      });
    } else if (z) {
      const bad = M.absR(m, z) > 1 + 1e-12;
      pA.point(z[0], z[1], { color: bad ? 'bad' : 'gold', r: 4 });
      if (!P.drag) pA.point(z[0], z[1], { color: bad ? 'bad' : 'gold', r: 0, label: 'z = hλ', lsize: fs });
    }
    pA.drawHandles();
  }

  function drawRun() {
    if (!pB) return;
    const m = F.params.method, W = worst(m);
    pB.clear();
    const narrow = (cvB.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    if (!W) return;
    const [lo, hi] = [-6.4, 6.4];
    pB.fn((n) => (n * W.z[0]) / Math.LN10, { color: 'ink3', width: 2, domain: [0, P.n] });
    for (let n = 0; n <= P.n; n++) {
      // values beyond the top are pinned there in red; below the bottom (decayed away) in grey
      const v = M.logGrowth(m, W.z, n).num;
      pB.point(n, Math.max(lo, Math.min(hi, v)), { color: v > hi ? 'bad' : v < lo ? 'ink3' : W.a > 1 + 1e-12 ? 'bad' : 'accent', r: P.n > 60 ? 2 : 3.2 });
    }
    const who = mode === 'point' ? 'z' : mode === 'mol' ? 'the worst grid mode' : 'the worst eigenvalue';
    pB.text(`dots: ${M.NAME[m]}, ${who} · line: exact e^(nz)`, pB.L + 6, pB.T + 10, { screen: true, size: fs, color: 'ink2' });
  }

  function readout() {
    if (P.readout === false) return;
    const m = F.params.method, W = worst(m), rows = [];
    const q = (k, v) => (hide.has(k) ? '?' : v);
    if (!W) { F.readout([]); return; }
    if (mode === 'point') rows.push(['$z = h\\lambda$', zTeX(W.z)]);
    else rows.push([mode === 'mol' ? 'stiffest mode $z$' : 'worst $z = h\\lambda$', zTeX(W.z)]);
    rows.push([mode === 'point' ? '$|R(z)|$' : 'largest $|R(z)|$', q('R', texNum(W.a, 4))]);
    rows.push(['verdict', q('verdict', W.a > 1 + 1e-12 ? '\\text{grows: unstable}' : W.a > 1 - 1e-9 ? '\\text{neutral}' : '\\text{decays: stable}')]);
    F.readout(rows);
  }

  function drawAll() { drawPlane(); drawRun(); readout(); }
  F.onChange(() => drawAll());
  F.draw(drawAll);
  F.caption(P.caption || 'Shaded: where the method’s step multiplier has |R(hλ)| ≤ 1, computed on a fine pixel grid. The test equation y′ = λy stands in for each eigen-direction of a linear system; a nonlinear problem is judged by its Jacobian’s eigenvalues, a local, approximate test.');
  return { get: (k) => (k === 'point' ? (z ? { x: z[0], y: z[1] } : null) : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!(Array.isArray(P.methods) && P.methods.length && P.methods.every((m) => M.METHODS.includes(m)))) p.push(`num3-stability: methods from ${M.METHODS.join(', ')}`);
  if (!M.METHODS.includes(P.method)) p.push(`num3-stability: method is one of ${M.METHODS.join(', ')}`);
  if (P.z != null && !(Array.isArray(P.z) && P.z.length === 2 && P.z.every(Number.isFinite))) p.push('num3-stability: z is [re, im] or null');
  if (P.eigs != null && !(Array.isArray(P.eigs) && P.eigs.length && P.eigs.every((e) => Array.isArray(e) && e.length === 2 && e.every(Number.isFinite)))) p.push('num3-stability: eigs is a list of [re, im]');
  if (P.eigLabels != null && !(Array.isArray(P.eigLabels) && P.eigs && P.eigLabels.length === P.eigs.length)) p.push('num3-stability: eigLabels has one label per eigenvalue');
  if (P.eigs && !(P.hmin > 0 && P.hmax > P.hmin && P.h >= P.hmin && P.h <= P.hmax)) p.push('num3-stability: 0 < hmin ≤ h ≤ hmax');
  if (!(Number.isInteger(P.mol) && P.mol >= 0 && P.mol <= 200)) p.push('num3-stability: mol is a whole number of grid points (0 for none, at most 200)');
  if (P.mol > 0 && !(P.r > 0 && P.r <= P.rmax && P.rmax <= 5)) p.push('num3-stability: 0 < r ≤ rmax ≤ 5');
  if (P.mol > 0 && P.eigs) p.push('num3-stability: give eigs or mol, not both');
  if (!(Array.isArray(P.x) && P.x[1] > P.x[0] && Array.isArray(P.y) && P.y[1] > P.y[0])) p.push('num3-stability: x and y are [min, max]');
  if (!(Array.isArray(P.panels) && P.panels.length && P.panels.every((q) => ['plane', 'run'].includes(q)))) p.push('num3-stability: panels from plane, run');
  if (!(Number.isInteger(P.n) && P.n >= 2 && P.n <= 200)) p.push('num3-stability: n is a whole number from 2 to 200');
  for (const mk of P.marks || []) if (!(Array.isArray(mk.z) && mk.z.length === 2) || /[$\\_^]/.test(mk.label || '')) p.push('num3-stability: marks are { z: [re, im], label } with plain-text labels');
  for (const l of P.eigLabels || []) if (/[$\\_^]/.test(l)) p.push('num3-stability: eigLabels are plain text');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`num3-stability: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`num3-stability: unknown hide “${h}”`);
  return p;
}
