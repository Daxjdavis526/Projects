// Bessel functions of both kinds and what they solve.
//
// mode 'functions': Jₙ(x) (blue) and the Neumann function Yₙ(x) (orange) for
// one order n, with optional overlays — the large-x forms √(2/πx)cos(x − nπ/2
// − π/4) and √(2/πx)sin(…) (dashed), their envelope ±√(2/πx), the small-x
// forms (xⁿ/2ⁿn!; (2/π)(ln(x/2) + γ) or −(n−1)!(2/x)ⁿ/π) and the zeros.
//
// mode 'annulus': a membrane (or a coaxial guide's cross-section) between
// radii q·b and b, b = 1. Above: one mode from above (blue up, orange down,
// nodal lines bold), R(r) = Yₘ(kq)Jₘ(kr) − Jₘ(kq)Yₘ(kr) times cos mθ for both
// rims clamped (kind 'D'), or the Neumann combination of Jₘ and Yₘ with zero
// slope at both rims (kind 'N': H_z of a coaxial TE mode). Below: the
// cross-product whose roots are the allowed k, scaled by √(πk/2) and divided by
// √(Jₘ(kq)² + Yₘ(kq)²) so it stays of order 1 (a positive factor: the roots
// are unchanged), with the roots marked, the full disk's zero j_{m,n} and the
// thin-gap estimate nπ/(1 − q) as dashed lines. Everything computed by
// model/fa2-special.js.
//
//   { type: 'fa2-bessel', params: {
//       mode: 'functions',       // functions | annulus
//       n: 0,                    // functions: the order (0–5)
//       x: [0, 20], y: [-1, 1],  // functions: the window
//       show: ['J', 'Y'],        // functions: any of J Y asym env small zeros
//       m: 0, k: 1,              // annulus: angular number m (0–4) and which root (1–4)
//       q: 0.4,                  // annulus: inner radius ÷ outer radius (0.05–0.9)
//       kind: 'D',               // annulus: D (both rims fixed) | N (zero slope at both: coax TE)
//       kmax: 20,                // annulus: the k range of the lower panel
//       marks: ['disk', 'gap'],  // annulus: dashed comparison lines on the lower panel
//       panels: ['top', 'cross'],// annulus: which panels
//       controls: null,          // true, false, or a list of: n q m k
//       readout: true, hide: [], // hide: any of k zero (show “?”)
//       labels: true,
//   } }

import { Plot } from '../plot.js';
import * as S from '../model/fa2-special.js';
import { besselZero } from '../model/pde2-membrane.js';
import { sampleGrid, contourSegments, joinSegments } from '../model/c3-contour.js';

export const defaults = { mode: 'functions', n: 0, x: [0, 20], y: [-1, 1], show: ['J', 'Y'], m: 0, k: 1, q: 0.4, kind: 'D', kmax: 20, marks: ['disk', 'gap'], panels: ['top', 'cross'], controls: null, readout: true, hide: [], labels: true };
const SHOW = ['J', 'Y', 'asym', 'env', 'small', 'zeros'];
const CONTROLS = ['n', 'q', 'm', 'k'];
const HIDE = ['k', 'zero'];
const f4 = (x) => String(+x.toPrecision(4));
const POS = [60, 140, 230], NEG = [235, 135, 55];
const PI = Math.PI;

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const annulus = P.mode === 'annulus';
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? (annulus ? ['q', 'm', 'k'] : ['n']) : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('n', () => F.slider({ key: 'n', label: 'Order $n$', min: 0, max: 5, step: 1, value: P.n, unit: '', explain: 'Bessel’s equation $x^2y\'\' + xy\' + (x^2 - n^2)y = 0$ of order $n$.' }));
  ctl('q', () => F.slider({ key: 'q', label: 'Hub ratio $a/b$', min: 0.05, max: 0.9, step: 0.01, value: P.q, unit: '', explain: 'The inner radius as a fraction of the outer one.' }));
  ctl('m', () => F.slider({ key: 'm', label: 'Angular number $m$', min: 0, max: 4, step: 1, value: P.m, unit: '', explain: 'The mode varies as $\\cos m\\theta$ around the ring: $m$ nodal diameters.' }));
  ctl('k', () => F.slider({ key: 'k', label: 'Root number', min: 1, max: 4, step: 1, value: P.k, unit: '', explain: 'Which allowed $k$: the $n$-th root has $n - 1$ nodal circles between the rims.' }));

  let top = null, cross = null, fplot = null, tplot = null, cplot = null;
  const panels = new Set(P.panels);
  if (!annulus) {
    fplot = F.canvas({ aspect: 'wide', label: P.alt || 'Bessel functions of the first and second kind' });
    tplot = new Plot(fplot.canvas, { x: P.x, y: P.y, xlabel: 'x', ylabel: '', axesAt: 'edge' });
  } else {
    if (panels.has('top')) { top = F.canvas({ aspect: 'wide', label: P.alt || 'A mode of an annular membrane seen from above' }); tplot = new Plot(top.canvas, { x: [-1.2, 1.2], y: [-1.1, 1.1], equal: true, axes: false, grid: false }); }
    if (panels.has('cross')) { cross = F.canvas({ label: 'The cross-product whose roots are the allowed wavenumbers', height: F.compact ? '150px' : '190px' }); cplot = new Plot(cross.canvas, { x: [0, P.kmax], y: [-1.3, 1.3], xlabel: 'k b', ylabel: '', yticks: 0, axesAt: 'edge' }); }
  }
  const off = document.createElement('canvas');

  function drawFunctions() {
    const n = Math.round(F.params.n), show = new Set(P.show);
    const p = tplot;
    p.clear();
    const [x0, x1] = [p.vx0, p.vx1];
    const env = (x) => Math.sqrt(2 / (PI * x));
    const ph = (x) => x - (n * PI) / 2 - PI / 4;
    if (show.has('env')) { p.fn((x) => env(x), { color: 'ink4', width: 1.2, dash: [3, 4], domain: [Math.max(x0, 0.05), x1] }); p.fn((x) => -env(x), { color: 'ink4', width: 1.2, dash: [3, 4], domain: [Math.max(x0, 0.05), x1] }); }
    if (show.has('asym')) {
      if (show.has('J')) p.fn((x) => env(x) * Math.cos(ph(x)), { color: 'accent', width: 1.5, dash: [6, 5], domain: [Math.max(x0, 0.3), x1] });
      if (show.has('Y')) p.fn((x) => env(x) * Math.sin(ph(x)), { color: 'warn', width: 1.5, dash: [6, 5], domain: [Math.max(x0, 0.3), x1] });
    }
    if (show.has('small')) {
      const nf = S.fact(n);
      if (show.has('J')) p.fn((x) => (x / 2) ** n / nf, { color: 'violet', width: 1.5, dash: [2, 4], domain: [Math.max(x0, 0), Math.min(x1, n + 3)] });
      if (show.has('Y')) p.fn((x) => (n === 0 ? (2 / PI) * (Math.log(x / 2) + S.EULER_GAMMA) : (-S.fact(n - 1) / PI) * (2 / x) ** n), { color: 'violet', width: 1.5, dash: [2, 4], domain: [Math.max(x0, 0.02), Math.min(x1, n + 3)] });
    }
    // sample Yₙ on a fixed grid once per draw (each value is an integral)
    if (show.has('Y')) {
      const N = 360, pts = [], lo = p.vy0 - (p.vy1 - p.vy0), xs = Math.max(1e-3, x0);
      for (let i = 0; i <= N; i++) { const x = xs + ((x1 - xs) * i) / N; pts.push([x, Math.max(lo, S.besselY(n, x))]); }
      p.ctx.save(); p._clip(); p.path(pts, { color: 'warn', width: 2.3 }); p.ctx.restore();
    }
    if (show.has('J')) p.fn((x) => S.besselJ(n, x), { color: 'accent', width: 2.3 });
    if (show.has('zeros')) {
      if (show.has('J')) for (let s = 1; s < 40; s++) { const z = besselZero(n, s); if (z > x1) break; if (z >= x0) p.point(z, 0, { color: 'accent', r: 3.5 }); }
      if (show.has('Y')) for (const z of S.roots((x) => S.besselY(n, x), Math.max(0.05, x0), x1, 0.1)) p.point(z, 0, { color: 'warn', r: 3.5 });
    }
    if (P.labels !== false) {
      // a small legend in the top-right corner
      const narrow = (fplot.canvas.clientWidth || 600) < 520, fs = narrow ? 11 : 12.5;
      let row = 0;
      const put = (txt, color) => { p.text(txt, p.R - 8, p.T + 12 + 17 * row++, { screen: true, color, size: fs, weight: 700, align: 'right' }); };
      if (show.has('J')) put(`J${sub(n)}(x)`, 'accent');
      if (show.has('Y')) put(`Y${sub(n)}(x)`, 'warn');
      if (show.has('asym')) put('large-x form', 'ink3');
      if (show.has('small')) put('small-x form', 'violet');
    }
    if (P.readout !== false) {
      const q = (key, v) => (hide.has(key) ? '?' : v);
      const yz = S.roots((x) => S.besselY(n, x), 0.05, 40, 0.1, 1)[0];
      F.readout([
        ['order', String(n)],
        [`first zero of $J_{${n}}$`, q('zero', f4(besselZero(n, 1)))],
        [`first zero of $Y_{${n}}$`, q('zero', f4(yz))],
      ]);
    }
  }

  function mode() {
    const m = Math.round(F.params.m), k = Math.round(F.params.k), q = +F.params.q;
    const ks = S.annulusRoots(m, q, 6, P.kind);
    return { m, k, q, ks, kk: ks[k - 1] };
  }

  function radialTable(m, q, kk) {
    const N = 400, R = [];
    const A = P.kind === 'D' ? S.besselY(m, kk * q) : S.besselYp(m, kk * q), B = P.kind === 'D' ? S.besselJ(m, kk * q) : S.besselJp(m, kk * q);
    let mx = 0;
    for (let i = 0; i <= N; i++) { const r = q + ((1 - q) * i) / N, v = A * S.besselJ(m, kk * r) - B * S.besselY(m, kk * r); R.push(v); mx = Math.max(mx, Math.abs(v)); }
    // for m ≥ 1 the cos mθ factor carries the sign pattern; keep the profile's own sign
    return (r) => { const t = ((r - q) / (1 - q)) * N; if (t < 0 || t > N) return NaN; const i = Math.min(N - 1, Math.floor(t)), f = t - i; return (R[i] * (1 - f) + R[i + 1] * f) / (mx || 1); };
  }

  function drawTop({ m, q, kk }) {
    const p = tplot;
    p.clear();
    const Rf = radialTable(m, q, kk);
    const g = (X, Y) => { const r = Math.hypot(X, Y); return r < q || r > 1 ? NaN : Rf(r) * Math.cos(m * Math.atan2(Y, X)); };
    const ctx = p.ctx, N = 150;
    const X0 = p.vx0, X1 = p.vx1, Y0 = p.vy0, Y1 = p.vy1;
    const ny = Math.max(20, Math.round((N * (Y1 - Y0)) / (X1 - X0)));
    off.width = N; off.height = ny;
    const ox = off.getContext('2d'), img = ox.createImageData(N, ny);
    for (let i = 0; i < N; i++) for (let j = 0; j < ny; j++) {
      const X = X0 + ((i + 0.5) * (X1 - X0)) / N, Y = Y1 - ((j + 0.5) * (Y1 - Y0)) / ny;
      const v = g(X, Y), o = 4 * (j * N + i);
      if (!Number.isFinite(v)) { img.data[o + 3] = 0; continue; }
      const c = v >= 0 ? POS : NEG, s = Math.min(1, Math.abs(v));
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = Math.round(40 + 200 * s);
    }
    ox.putImageData(img, 0, 0);
    ctx.save(); p._clip(); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, p.X(X0), p.Y(Y1), p.X(X1) - p.X(X0), p.Y(Y0) - p.Y(Y1));
    ctx.restore();
    const e = 0.006;
    const grid = sampleGrid((X, Y) => { const r = Math.hypot(X, Y); return r < q + e || r > 1 - e ? NaN : g(X, Y); }, [-1, 1], [-1, 1], 161, 161);
    for (const line of joinSegments(contourSegments(grid, 0))) p.path(line, { color: 'ink', width: 2.2 });
    const rimStyle = P.kind === 'D' ? { color: 'ink', width: 2.4 } : { color: 'ink2', width: 2.4, dash: [7, 4] };
    p.circle(0, 0, 1, rimStyle);
    p.circle(0, 0, q, { ...rimStyle, fill: 'ink4', alpha: 0.35, strokeAlpha: 1 });
  }

  function drawCross({ m, k, q, ks }) {
    const p = cplot;
    p.clear();
    const kmax = P.kmax;
    const Fk = P.kind === 'D'
      ? (x) => S.crossD(m, q, x) * Math.sqrt((PI * x) / 2) / Math.hypot(S.besselJ(m, x * q), S.besselY(m, x * q))
      : (x) => S.crossN(m, q, x) * Math.sqrt((PI * x) / 2) / Math.hypot(S.besselJp(m, x * q), S.besselYp(m, x * q));
    const narrow = (cross.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    const marks = new Set(P.marks || []);
    if (marks.has('disk') && P.kind === 'D') for (let s = 1; s < 12; s++) { const z = besselZero(m, s); if (z > kmax) break; p.line(z, -1.25, z, 1.25, { color: 'ink3', width: 1.2, dash: [3, 4] }); if (s === 1 && P.labels !== false) p.text('full disk', z, -1.12, { color: 'ink3', size: fs - 1, align: 'center' }); }
    if (marks.has('gap') && P.kind === 'D') for (let s = 1; s < 30; s++) { const z = (s * PI) / (1 - q); if (z > kmax) break; p.line(z, -1.25, z, 1.25, { color: 'violet', width: 1.2, dash: [7, 4] }); if (s === 1 && P.labels !== false) p.text('nπ/(1 − q)', z, 1.12, { color: 'violet', size: fs - 1, align: 'center' }); }
    const N = 500, pts = [];
    for (let i = 0; i <= N; i++) { const x = 0.02 + ((kmax - 0.02) * i) / N; const v = Fk(x); pts.push([x, Math.max(-1.3, Math.min(1.3, v))]); }
    p.path(pts, { color: 'accent', width: 2.1 });
    ks.forEach((z, i) => { if (z <= kmax && !(hide.has('k') && i === k - 1)) p.point(z, 0, { color: i === k - 1 ? 'gold' : 'accent', r: i === k - 1 ? 5.5 : 3.5 }); });
  }

  function drawAnnulus() {
    const md = mode();
    if (tplot) drawTop(md);
    if (cplot) drawCross(md);
    if (P.readout !== false) {
      const q = (key, v) => (hide.has(key) ? '?' : v);
      const rows = [['mode', `m = ${md.m},\\ \\text{root } ${md.k}`], ['$k b$', q('k', f4(md.kk))]];
      if (P.kind === 'D') rows.push([`full disk $j_{${md.m},${md.k}}$`, f4(besselZero(md.m, md.k))]);
      F.readout(rows);
    }
  }

  const draw = () => (annulus ? drawAnnulus() : drawFunctions());
  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || (annulus
    ? 'An ideal membrane (or a coaxial guide’s cross-section) between two circles; b = 1. Shading: blue up, orange down; bold lines stay still. Lower panel: the cross-product of Jₘ and Yₘ, scaled by a positive factor that leaves its roots in place.'
    : 'Jₙ (blue) and Yₙ (orange), computed from Bessel’s integrals. Dashed: the large-x forms; dotted: the small-x forms.'));
  return { get: (key) => (key === 'kb' ? mode().kk : F.params[key]) };
}

const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n) => String(n).split('').map((d) => SUBS[+d]).join('');

export function validate(P) {
  const p = [];
  if (!['functions', 'annulus'].includes(P.mode)) p.push('fa2-bessel: mode is functions or annulus');
  if (!(Number.isInteger(P.n) && P.n >= 0 && P.n <= 5)) p.push('fa2-bessel: n is a whole number 0–5');
  if (!(Number.isInteger(P.m) && P.m >= 0 && P.m <= 4)) p.push('fa2-bessel: m is a whole number 0–4');
  if (!(Number.isInteger(P.k) && P.k >= 1 && P.k <= 4)) p.push('fa2-bessel: k is a whole number 1–4');
  if (!(P.q >= 0.05 && P.q <= 0.9)) p.push('fa2-bessel: q lies in 0.05–0.9');
  if (!['D', 'N'].includes(P.kind)) p.push('fa2-bessel: kind is D or N');
  if (!(P.kmax > 1 && P.kmax <= 60)) p.push('fa2-bessel: kmax lies in 1–60');
  if (!(Array.isArray(P.x) && P.x.length === 2 && P.x[0] >= 0 && P.x[1] > P.x[0] && P.x[1] <= 60)) p.push('fa2-bessel: x is [min, max] within 0–60');
  if (!(Array.isArray(P.y) && P.y.length === 2 && P.y[1] > P.y[0])) p.push('fa2-bessel: y is [min, max]');
  for (const s of P.show || []) if (!SHOW.includes(s)) p.push(`fa2-bessel: unknown show “${s}”`);
  for (const s of P.panels || []) if (!['top', 'cross'].includes(s)) p.push(`fa2-bessel: unknown panel “${s}”`);
  for (const s of P.marks || []) if (!['disk', 'gap'].includes(s)) p.push(`fa2-bessel: unknown mark “${s}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`fa2-bessel: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`fa2-bessel: unknown hide “${h}”`);
  return p;
}
