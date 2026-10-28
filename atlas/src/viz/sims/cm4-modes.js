// Small oscillations by the Lagrangian method, for systems whose coupling is
// in the kinetic energy: a hanging chain of point masses on light rods (N = 2
// is the double pendulum) and a cart on a spring with a pendulum hanging
// from it (a tuned-mass damper). The motion is the exact sum of the normal
// modes of M q̈ = −K q (no numerical drift), drawn with true geometry.
// Panels: 'system' (the motion), 'gallery' (every mode shape with its ω),
// 'det' (det(K − ω²M) against ω, crossing zero at each normal frequency) and
// 'ladder' (a chain's ω_n√(L/g) beside the continuous hanging chain's
// j₀,ₙ/2, the zeros of the Bessel function J₀ halved).
// Physics: model/cm4-modes.js (test/cm4-modes.test.mjs).
//
//   { type: 'cm4-modes', params: {
//       system: 'chain',          // chain | cart
//       N: 2,                     // chain: masses (1–24)
//       m: 1, l: null,            // chain: mass of each bead (kg) and length of each rod (m; default 1/N, total 1 m) — or arrays
//       m2: null, l2: null,       // chain, N = 2: the lower mass and lower rod, if different (sliders 'm2', 'l2')
//       Mc: 2, k: 20, m1: 1, l1: 1, // cart: cart mass (kg), spring (N/m), bob mass (kg), pendulum length (m)
//       g: 9.8,
//       start: 'mode',            // mode | pluck (the lowest mass pulled aside, the rest straight) | custom (x0)
//       n: 1,                     // mode: which mode (1 = slowest)
//       x0: null,                 // custom: the starting coordinates (angles in rad; cart: x in m and θ in rad)
//       amp: 0.25,                // the drawn amplitude: the largest sideways swing, as a fraction of the chain's length
//                                 // (cart: of the pendulum's length) — exaggerated for visibility
//       panels: ['system', 'det'],// any of system gallery det ladder
//       controls: ['start', 'n'], // any of start n N m2 l2 k
//       maxN: 24,
//       play: true,               // a Play button (never moves under reduced motion until pressed); false: a still at `time`
//       time: 0,                  // the moment shown when still (s)
//       labels: true,             // ω labels in the gallery and on the det curve
//       readout: true, hide: [],  // the ω's and periods under the picture; rows to print as “?”: w T
//   } }
//
// A problem's picture must not show its answer: hide the readout (or rows) and
// the labels when a frequency is asked for.

import { Plot } from '../plot.js';
import * as M from '../model/cm4-modes.js';

export const defaults = {
  system: 'chain', N: 2, m: 1, l: null, m2: null, l2: null, Mc: 2, k: 20, m1: 1, l1: 1, g: M.G,
  start: 'mode', n: 1, x0: null, amp: 0.25, panels: ['system', 'det'], controls: ['start', 'n'], maxN: 24,
  play: true, time: 0, labels: true, readout: true, hide: [],
};
const PANELS = ['system', 'gallery', 'det', 'ladder'];
const CONTROLS = ['start', 'n', 'N', 'm2', 'l2', 'k'];
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n) => String(n).replace(/\d/g, (d) => SUB[d]);
const tx = (v, d = 3) => String(+(+v).toPrecision(d));
const pl = (v, d = 3) => tx(v, d).replace('-', '−');
// the largest sideways displacement of any mass (chain), or of the cart and bob (cart: q = [x, θ], l unused)
const swing = (q, l, lp = 1) => {
  if (!l) return Math.max(Math.abs(q[0]), Math.abs(q[0] + lp * q[1]));
  let x = 0, big = 0;
  q.forEach((a, k) => { x += l[k] * a; big = Math.max(big, Math.abs(x)); });
  return big;
};

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const panels = (P.panels || []).filter((p) => PANELS.includes(p));
  const C = new Set(P.controls || []);
  const cart = P.system === 'cart';

  const cv = {};
  if (panels.includes('system')) cv.system = F.canvas({ aspect: cart ? 'wide' : '', label: cart ? 'A cart on a spring with a pendulum hanging from it, oscillating' : 'A chain of masses hanging on light rods, swinging' });
  if (panels.includes('gallery')) cv.gallery = F.canvas({ aspect: 'wide', label: 'Every normal mode, side by side' });
  if (panels.includes('det')) cv.det = F.canvas({ aspect: 'wide', label: 'The determinant of K − ω²M against ω' });
  if (panels.includes('ladder')) cv.ladder = F.canvas({ aspect: 'wide', label: 'The chain’s frequencies beside the continuous chain’s' });

  if (C.has('N') && !cart) F.slider({ key: 'N', label: 'Masses $N$', min: 1, max: P.maxN, step: 1, value: P.N, explain: 'Equal beads on equal rods, the total length fixed: as $N$ grows the chain becomes a hanging rope.' });
  else F.params.N = P.N;
  if (C.has('m2') && !cart) F.slider({ key: 'm2', label: 'Lower mass $m_2$', min: 0.1, max: 4, step: 0.05, value: P.m2 ?? (Array.isArray(P.m) ? P.m[1] : P.m), unit: '\\mathrm{kg}', explain: 'The upper mass stays fixed. A light lower bob barely disturbs the upper pendulum; a heavy one dominates.' });
  if (C.has('l2') && !cart) F.slider({ key: 'l2', label: 'Lower rod $\\ell_2$', min: 0.1, max: 2, step: 0.05, value: P.l2 ?? 0.5, unit: '\\mathrm{m}', explain: 'The length of the lower rod; the upper rod stays fixed.' });
  if (C.has('k') && cart) F.slider({ key: 'k', label: 'Spring $k$', min: 2, max: 80, step: 0.5, value: P.k, unit: '\\mathrm{N/m}', explain: 'The spring tying the cart to the wall. Tuned so the cart alone matches the pendulum, the two modes split widely.' });
  else F.params.k = P.k;
  const maxModes = () => (cart ? 2 : Math.round(F.params.N));
  if (C.has('start')) F.choice({ key: 'start', label: 'Start', options: [['mode', 'One normal mode'], ['pluck', cart ? 'Pull the cart aside' : 'Pull the lowest mass aside']], value: P.start === 'custom' ? 'mode' : P.start, explain: 'A normal mode keeps its shape as it swings; any other start is a mixture of modes, each at its own frequency.' });
  else F.params.start = P.start;
  if (C.has('n')) F.slider({ key: 'n', label: 'Mode $n$', min: 1, max: cart ? 2 : (C.has('N') ? P.maxN : P.N), step: 1, value: P.n, explain: 'Mode 1 is the slowest. (A mode number above $N$ shows mode $N$.)' });
  else F.params.n = P.n;

  function build() {
    const N = maxModes();
    let p;
    if (cart) p = { system: 'cart', Mc: P.Mc, k: +F.params.k, m1: P.m1, l1: P.l1, g: P.g };
    else {
      let m = Array.isArray(P.m) ? P.m.slice() : Array(N).fill(P.m), l = Array.isArray(P.l) ? P.l.slice() : Array(N).fill(P.l ?? 1 / N);
      if (N === 2) {
        if (C.has('m2')) m[1] = +F.params.m2; else if (P.m2 != null) m[1] = P.m2;
        if (C.has('l2')) l[1] = +F.params.l2; else if (P.l2 != null) l[1] = P.l2;
      }
      m = m.slice(0, N); l = l.slice(0, N);
      p = { system: 'chain', N, m, l, g: P.g };
    }
    const sys = M.build(p), md = M.modes(sys.M, sys.K);
    const n = Math.max(1, Math.min(md.w.length, Math.round(F.params.n)));
    let q0;
    if (F.params.start === 'mode') q0 = md.a[n - 1].slice();
    else if (F.params.start === 'pluck') {
      if (cart) q0 = [1, 0];
      else { // the lowest mass pulled aside, every rod still straight below the top: only the last rod tilts
        q0 = Array(md.w.length).fill(0); q0[q0.length - 1] = 1;
      }
    } else q0 = (P.x0 || []).slice(0, md.w.length);
    while (q0.length < md.w.length) q0.push(0);
    // scale to the drawn amplitude: the largest sideways swing = amp × the length
    const ltot = cart ? P.l1 : p.l.reduce((s, x) => s + x, 0);
    const big = swing(q0, p.l, P.l1) / ltot;
    q0 = q0.map((x) => (x * P.amp) / (big || 1));
    return { p, sys, md, n, q0, x: M.motion(sys.M, md, q0), ltot, N: md.w.length };
  }
  let B = build();

  const still = P.play === false;
  const S = { t: P.time || 0, running: false };
  const anim = F.animate((dt) => { if (!S.running) return; S.t += dt; draw(); }, { force: true });
  if (!still && panels.includes('system')) {
    const btn = F.button({ label: 'Play', primary: true, onClick: () => { S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
    F.button({ label: 'Restart', onClick: () => { S.t = 0; draw(); } });
    if (!reduced && !F.compact && P.play === 'auto') { S.running = true; btn.textContent = 'Pause'; }
  }
  F.onChange(() => { B = build(); S.t = still ? P.time || 0 : 0; draw(); });

  const plots = {};
  if (cv.system) plots.system = new Plot(cv.system.canvas, { x: [-1, 1], y: [-1, 0.2], equal: true, grid: false, axes: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  if (cv.gallery) plots.gallery = new Plot(cv.gallery.canvas, { x: [0, 1], y: [-1, 0.2], grid: false, axes: false, pad: { l: 6, r: 6, t: 22, b: 6 } });
  if (cv.det) plots.det = new Plot(cv.det.canvas, { x: [0, 1], y: [-1.2, 1.2], xlabel: 'ω (rad/s)', ylabel: 'det(K − ω²M), scaled', yticks: 0, pad: { l: 34, r: 16, t: 14, b: 34 } });
  if (cv.ladder) plots.ladder = new Plot(cv.ladder.canvas, { x: [0, 1], y: [0, 1], xlabel: 'mode n', ylabel: 'ω √(L/g)', pad: { l: 46, r: 16, t: 14, b: 34 } });

  // a chain (or cart) at coordinates q, drawn in plot p; x0 shifts it sideways
  function drawSystem(p, q, { x0 = 0, scale = 1, faint = false } = {}) {
    if (!cart) {
      // the linear (small-angle) picture: sideways x = Σ ℓθ, heights as at rest — the swing is exaggerated, not the geometry bent
      let xs = 0, ys = 0;
      const pts = q.map((a, k) => { xs += B.p.l[k] * a; ys -= B.p.l[k]; return [x0 + scale * xs, scale * ys]; });
      p.line(x0 - 0.12 * B.ltot * scale, 0, x0 + 0.12 * B.ltot * scale, 0, { color: 'ink3', width: 3 });
      p.line(x0, 0, x0, -B.ltot * scale * 1.04, { color: 'ink4', width: 1, dash: [3, 4] });
      let prev = [x0, 0];
      for (const pt of pts) { p.line(prev[0], prev[1], pt[0], pt[1], faint ? { color: 'ink4', width: 1, dash: [3, 4] } : { color: 'ink2', width: 1.8 }); prev = pt; }
      const mmax = Math.max(...B.p.m);
      if (!faint) pts.forEach((pt, k) => p.point(pt[0], pt[1], { color: k === pts.length - 1 ? 'warn' : 'accent', r: Math.max(B.N > 8 ? 2.5 : 4.5, (B.N > 8 ? 4 : 7) * Math.sqrt(B.p.m[k] / mmax)) }));
    } else {
      const [x, th] = q, l = P.l1, cw = 0.36, wall = -1.5;
      p.line(wall - 0.1, -0.02, 1.6, -0.02, { color: 'ink3', width: 1.4 });
      p.line(wall, -0.02, wall, 0.4, { color: 'ink3', width: 3 });
      // spring
      const s0 = wall, s1 = x - cw / 2, zz = [];
      for (let k = 0; k <= 24; k++) zz.push([s0 + ((s1 - s0) * k) / 24, 0.16 + (k % 2 ? 0.05 : -0.05) * (k > 1 && k < 23 ? 1 : 0)]);
      p.path(zz, { color: 'ink2', width: 1.4 });
      p.path([[x - cw / 2, 0.02], [x + cw / 2, 0.02], [x + cw / 2, 0.3], [x - cw / 2, 0.3], [x - cw / 2, 0.02]], { color: 'accent', width: 2 });
      const bx = x + l * Math.sin(th), by = 0.02 - l * Math.cos(th);
      p.line(x, 0.02, x, 0.02 - l * 1.04, { color: 'ink4', width: 1, dash: [3, 4] });
      p.line(x, 0.02, bx, by, { color: 'ink2', width: 1.8 });
      p.point(bx, by, { color: 'warn', r: 8 });
    }
  }

  function draw() {
    const md = B.md;
    if (plots.system) {
      const p = plots.system;
      if (cart) p.setView([-1.6, 1.6], [-P.l1 - 0.25, 0.45]);
      else { const L = B.ltot; p.setView([-0.75 * L, 0.75 * L], [-1.08 * L, 0.06 * L]); }
      p.clear();
      if (!still && !cart) drawSystem(p, B.q0.map(() => 0), { faint: true });   // the equilibrium, faint
      if (cart) p.line(0, -0.1, 0, 0.42, { color: 'ink4', width: 1, dash: [3, 4] });   // the cart's rest position
      drawSystem(p, B.x(S.t));
    }
    if (plots.gallery) {
      const p = plots.gallery, n = Math.min(md.w.length, 8), L = B.ltot, w = cart ? 3.4 : 1.5 * L;
      p.setView([0, n * w], cart ? [-P.l1 - 0.3, 0.55] : [-1.1 * L, 0.08 * L]);
      p.clear();
      for (let k = 0; k < n; k++) {
        const a = md.a[k], big = swing(a, B.p.l, P.l1) / L;
        const q = a.map((x) => (x * Math.min(0.8, P.amp * 1.4)) / (big || 1));
        if (cart) {
          // draw the cart mode about the panel's centre
          const cx = (k + 0.5) * w;
          const [x, th] = q, l = P.l1, cw = 0.36;
          p.path([[cx + x - cw / 2, 0.02], [cx + x + cw / 2, 0.02], [cx + x + cw / 2, 0.3], [cx + x - cw / 2, 0.3], [cx + x - cw / 2, 0.02]], { color: 'accent', width: 2 });
          p.line(cx - 1.4, -0.02, cx + 1.4, -0.02, { color: 'ink4', width: 1 });
          p.line(cx, -0.1, cx, 0.45, { color: 'ink3', width: 1, dash: [3, 4] });   // the cart's rest position
          p.line(cx + x, 0.02, cx + x + l * Math.sin(th), 0.02 - l * Math.cos(th), { color: 'ink2', width: 1.8 });
          p.point(cx + x + l * Math.sin(th), 0.02 - l * Math.cos(th), { color: 'warn', r: 7 });
        } else drawSystem(p, q, { x0: (k + 0.5) * w });
        const room = p.w / n;   // pixels per mode: shorter labels on a narrow screen
        if (P.labels) p.text(room > 120 ? `ω${sub(k + 1)} = ${pl(md.w[k])} rad/s` : room > 62 ? `ω${sub(k + 1)} ${pl(md.w[k])}` : pl(md.w[k], 2), (k + 0.5) * w, p.vy1, { dy: -10, align: 'center', color: 'ink2', size: room > 90 ? 12 : 10.5 });
        else p.text(`mode ${k + 1}`, (k + 0.5) * w, p.vy1, { dy: -10, align: 'center', color: 'ink2', size: 12 });
      }
    }
    if (plots.det) {
      const p = plots.det, wmax = Math.max(...md.w) * 1.2, N = md.w.length, d0 = M.detKM(B.sys.M, B.sys.K, 0);
      // up to three modes: det/det(0) itself; more: its N-th root, so every crossing stays visible
      const f = (w) => { const d = M.detKM(B.sys.M, B.sys.K, w) / d0; return N <= 3 ? d : Math.sign(d) * Math.abs(d) ** (1 / N); };
      let lo = -0.2, hi = 1.1;
      for (let i = 0; i <= 200; i++) { const v = f((wmax * i) / 200); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      hi = Math.min(hi, 3 * Math.max(1, -lo)); lo = Math.max(lo, -3 * Math.max(1, hi));
      p.setView([0, wmax], [lo * 1.1, hi * 1.1]);
      p.clear();
      p.fn(f, { color: 'accent', width: 2.2 });
      md.w.forEach((w, k) => p.point(w, 0, { color: 'gold', r: 5, label: P.labels ? `ω${sub(k + 1)}` : '', ldx: -6, ldy: -12 }));
    }
    if (plots.ladder) {
      const p = plots.ladder, n = Math.min(md.w.length, 8), sc = Math.sqrt(B.ltot / P.g);
      const top = Math.max(M.J0_ZEROS[n - 1] / 2, md.w[n - 1] * sc) * 1.12;
      p.setView([0.4, n + 0.6], [0, top]);
      p.clear();
      for (let k = 1; k <= n; k++) {
        const c = M.J0_ZEROS[k - 1] / 2;
        p.line(k - 0.32, c, k + 0.32, c, { color: 'gold', width: 2, dash: [4, 3] });
        p.point(k, md.w[k - 1] * sc, { color: 'accent', r: 5 });
      }
      p.text(`● chain of ${B.N}`, p.L + 10, p.T + 12, { screen: true, color: 'accent', size: 12, weight: 650 });
      p.text('– – continuous chain (j₀,ₙ/2)', p.L + 10, p.T + 28, { screen: true, color: 'gold', size: 12, weight: 650 });
    }
    if (P.readout !== false) {
      const hide = new Set(P.hide || []), q = (k, v) => (hide.has(k) ? '?' : v);
      const rows = md.w.slice(0, 4).map((w, k) => [`$\\omega_{${k + 1}}$`, q('w', `${tx(w)}\\,\\mathrm{rad/s}`)]);
      rows.push(['$T_1$', q('T', `${tx((2 * Math.PI) / md.w[0])}\\,\\mathrm{s}`)]);
      if (!still && panels.includes('system')) rows.push(['$t$', `${tx(S.t, 3)}\\,\\mathrm{s}`]);
      F.readout(rows);
    }
  }
  F.draw(draw);
  F.caption(cart
    ? 'Small oscillations, solved exactly as a sum of normal modes (no friction, no damping). Swings are exaggerated for visibility; the linear equations hold only for small angles.'
    : 'Point masses on light rigid rods, small oscillations solved exactly as a sum of normal modes. Sideways swings are exaggerated for visibility (and drawn as the small-angle theory sees them, so rods seem to stretch); the linear theory holds only for small angles.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!['chain', 'cart'].includes(P.system)) out.push('system must be chain or cart');
  if (!(Number.isInteger(P.N) && P.N >= 1 && P.N <= 24)) out.push('N must be an integer from 1 to 24');
  if (P.N > P.maxN) out.push('N must not exceed maxN');
  for (const k of ['Mc', 'k', 'm1', 'l1', 'g', 'amp']) if (!(P[k] > 0)) out.push(`${k} must be positive`);
  const pos = (v) => (Array.isArray(v) ? v.every((x) => x > 0) : v > 0);
  if (!pos(P.m)) out.push('m must be positive');
  if (P.l !== null && !pos(P.l)) out.push('l must be positive');
  if (Array.isArray(P.m) && P.m.length < P.N) out.push('m needs one mass per bead');
  if (Array.isArray(P.l) && P.l.length < P.N) out.push('l needs one length per rod');
  if (!['mode', 'pluck', 'custom'].includes(P.start)) out.push('start must be mode, pluck or custom');
  if (P.start === 'custom' && !Array.isArray(P.x0)) out.push('custom start needs x0');
  if (!(P.n >= 1)) out.push('n must be 1 or more');
  for (const p of P.panels || []) if (!PANELS.includes(p)) out.push(`unknown panel “${p}”`);
  if (!(P.panels || []).length) out.push('panels must name at least one panel');
  for (const c of P.controls || []) if (!CONTROLS.includes(c)) out.push(`unknown control “${c}”`);
  for (const h of P.hide || []) if (!['w', 'T'].includes(h)) out.push(`unknown readout “${h}”`);
  if (P.amp > 0.8) out.push('amp above 0.8 rad would make the small-angle picture misleading');
  return out;
}
