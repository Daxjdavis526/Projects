// A small ball of freely falling dust, released at rest (the Baez–Bunn ball).
// Gravity at its centre cannot be felt — the ball falls with it — but its
// grains accelerate relative to the centre, and that is curvature:
//
//   mode 'tides'  — in empty space near a mass (Earth, a 10 M☉ black hole,
//     Sagittarius A*): the ball stretches along the line to the mass and is
//     squeezed across it, 2 : 1, and its volume starts out unchanged.
//   mode 'matter' — at the centre of uniform matter of density ρ, pressure
//     p = wρc² and cosmological constant Λ: the ball shrinks (or grows) the
//     same way in every direction, V̈/V = −4πG(ρ + 3p/c²) + Λc².
//   mode 'both'   — the two together: the local matter sets the volume change,
//     the distant mass the change of shape.
//   mode 'wave'   — a gravitational wave travelling along z: the shape
//     oscillates, the volume (to first order) does not.
//
// Left: side view, the mass to the left. Top right: the end-on view (looking
// along the line to the mass). Bottom right: the volume against time. Time
// counts in a time scale T printed in the readout (for tides 1/√(GM/r³); for
// matter 1/√(4πGρ/3); shorter when the change is faster), so shapes are drawn
// to scale. Physics in model/gr-dustball.js (tested headlessly).
//
//   { type: 'gr-dustball', params: { mode: 'tides', body: 'earth', bodies: true, t: 0.6 } }
//   modes: ['tides', 'matter'] adds a choice of mode; bodies: true a choice of mass;
//   r (in Earth radii or horizon radii r_s) and rSlider; rho (kg/m³), rhoSlider, rhoRange;
//   w (= p/ρc²) and wSlider; lambda (in units of the measured Λ) and lambdaSlider;
//   pol ('plus' | 'cross') and pols; h (the drawn strain); t (time in units of T —
//   for a wave, in periods); play (a time slider and a Play button); arrows (the
//   relative accelerations and their labels); readout: false hides every number
//   (so a question's picture does not print its answer); views: 'side' draws the
//   side view alone.

import { Plot } from '../plot.js';
import { BODIES, tidalRates, matterRate, combinedRates, volumeAccel, ballAt, volumeAt, waveDeform, waveArea, dustPoints, LAMBDA, C } from '../model/gr-dustball.js';

export const defaults = {
  mode: 'tides', modes: null, body: 'earth', bodies: false, r: null, rSlider: true,
  rho: 1000, rhoSlider: true, rhoRange: [1e-3, 1e18], w: 0, wSlider: false, lambda: 0, lambdaSlider: false,
  pol: 'plus', pols: false, h: 0.5, t: null, play: true, arrows: true, readout: true, views: 'all',
};

const MODES = { tides: 'Empty space near a mass', matter: 'Inside matter', both: 'Matter and a distant mass', wave: 'A passing gravitational wave' };
const TMAX = { tides: 0.7, matter: 0.7, both: 0.7, wave: 2 };
const T0 = { tides: 0.6, matter: 0.6, both: 0.6, wave: 0 };
const BODY_KEYS = Object.keys(BODIES);
const DUST = dustPoints(150);
const G0 = 9.81;

export function validate(P) {
  const p = [];
  const modes = P.modes || [P.mode];
  for (const m of new Set([P.mode, ...modes])) if (!MODES[m]) p.push(`gr-dustball: unknown mode “${m}” (use ${Object.keys(MODES).join(', ')})`);
  if (!modes.includes(P.mode)) p.push('gr-dustball: mode must be one of modes');
  if (modes.includes('wave') && modes.length > 1) p.push('gr-dustball: the wave mode cannot be mixed with the others (its time runs in periods)');
  if (!BODIES[P.body]) p.push(`gr-dustball: unknown body “${P.body}” (use ${BODY_KEYS.join(', ')})`);
  else if (P.r !== null && P.r !== undefined) {
    const [lo, hi] = BODIES[P.body].range;
    if (!(P.r >= lo && P.r <= hi)) p.push(`gr-dustball: r = ${P.r} lies outside ${lo}–${hi} for ${P.body}`);
  }
  const [a, b] = P.rhoRange || [];
  if (!(a > 0 && b > a)) p.push('gr-dustball: rhoRange must be [low, high] with 0 < low < high');
  if (!(P.rho >= 0)) p.push('gr-dustball: rho must be ≥ 0');
  if (P.rhoSlider && (modes.includes('matter') || modes.includes('both')) && !(P.rho >= a && P.rho <= b)) p.push('gr-dustball: rho must lie in rhoRange when its slider is shown');
  if (!(P.w >= -1 && P.w <= 1)) p.push('gr-dustball: w = p/ρc² must lie in [−1, 1]');
  if (!(P.lambda >= 0 && P.lambda <= 3)) p.push('gr-dustball: lambda (in units of the measured Λ) must lie in [0, 3]');
  if (!['plus', 'cross'].includes(P.pol)) p.push('gr-dustball: pol must be plus or cross');
  if (!(P.h > 0 && P.h <= 0.8)) p.push('gr-dustball: h (the drawn strain) must lie in (0, 0.8]');
  if (P.t !== null && P.t !== undefined && MODES[P.mode] && !(P.t >= 0 && P.t <= TMAX[P.mode])) p.push(`gr-dustball: t must lie in [0, ${TMAX[P.mode]}] for mode ${P.mode}`);
  if (!['all', 'side'].includes(P.views)) p.push('gr-dustball: views must be all or side');
  return p;
}

// numbers as TeX (3.1 × 10⁻⁶ style), n significant figures
function texNum(x, n = 2) {
  if (!Number.isFinite(x)) return x > 0 ? '\\infty' : '\\text{—}';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e4 || a < 1e-2) {
    const [m, e] = x.toExponential(n - 1).split('e');
    return `${m}\\times10^{${parseInt(e, 10)}}`;
  }
  return String(+x.toPrecision(n));
}
// a duration in a sensible unit
function texTime(s) {
  if (!Number.isFinite(s)) return '\\infty\\ \\text{(nothing happens)}';
  const YR = 3.15576e7;
  const units = [[1e-3, 1e-6, '\\mu\\text{s}'], [1, 1e-3, '\\text{ms}'], [120, 1, '\\text{s}'], [7200, 60, '\\text{min}'], [172800, 3600, '\\text{h}'], [2 * YR, 86400, '\\text{days}'], [1e6 * YR, YR, '\\text{yr}'], [Infinity, 1e9 * YR, '\\text{Gyr}']];
  for (const [lim, f, u] of units) if (s < lim) return `${texNum(s / f, 2)}\\ ${u}`;
  return `${texNum(s, 2)}\\ \\text{s}`;
}
function wText(v) {
  const near = (a) => Math.abs(v - a) < 1e-6;
  if (near(0)) return '0\\ \\text{(dust)}';
  if (near(1 / 3)) return '\\tfrac13\\ \\text{(light)}';
  if (near(-1)) return '-1\\ \\text{(vacuum energy)}';
  if (near(-1 / 3)) return '-\\tfrac13';
  return v.toFixed(2);
}

export function mount(F, P) {
  const modes = P.modes || [P.mode];
  const { canvas } = F.canvas({ label: 'A ball of freely falling dust, seen from the side and end-on, with a graph of its volume against time' });

  // ── controls ──────────────────────────────────────────────────────────────
  if (modes.length > 1) F.choice({ key: 'mode', label: 'Where is the ball?', options: modes.map((m) => [m, MODES[m]]), value: P.mode, explain: 'Each choice starts the ball at rest, falling freely.' });
  else F.params.mode = P.mode;
  const usesBody = modes.some((m) => m === 'tides' || m === 'both');
  const usesMatter = modes.some((m) => m === 'matter' || m === 'both');
  const bodyKeys = P.bodies ? BODY_KEYS : [P.body];
  if (usesBody && P.bodies) F.choice({ key: 'body', label: 'The mass', options: BODY_KEYS.map((k) => [k, BODIES[k].name]), value: P.body, explain: 'Its centre lies to the left of the ball.' });
  else F.params.body = P.body;
  const rCtl = {};
  for (const k of bodyKeys) {
    const B = BODIES[k], key = `r_${k}`;
    const value = k === P.body && P.r != null ? P.r : B.r;
    if (usesBody && P.rSlider) {
      rCtl[k] = F.slider({
        key, label: `Distance from the centre of ${B.hole ? 'the hole' : 'Earth'}, $r$`, min: B.range[0], max: B.range[1], value, unit: B.unitTeX,
        logScale: true, fmt: (v) => texNum(v, v < 10 ? 2 : 3),
        explain: B.hole ? 'In horizon radii, $r_s = 2GM/c^2$. The ball falls freely; it does not hover.' : 'In Earth radii, from the surface outward (imagine a vacuum tube: no air).',
      });
    } else F.params[key] = value;
  }
  const matterCtl = [];
  if (usesMatter && P.rhoSlider) matterCtl.push(F.slider({ key: 'rho', label: 'Density of the matter around the ball, $\\rho$', min: P.rhoRange[0], max: P.rhoRange[1], value: P.rho, unit: '\\text{kg/m}^3', logScale: true, fmt: (v) => texNum(v, 2), explain: 'Water is 1000; the centre of the Sun about $1.5\\times10^{5}$; a neutron star’s core about $5\\times10^{17}$.' }));
  else F.params.rho = P.rho;
  if (usesMatter && P.wSlider) matterCtl.push(F.slider({ key: 'w', label: 'Pressure as a fraction of the energy density, $p/\\rho c^2$', min: -1, max: 1 / 3, step: 1 / 30, value: P.w, fmt: wText, explain: '0: dust. ⅓: light, or any gas of particles moving near $c$. −1: vacuum energy, whose pressure is *negative*.' }));
  else F.params.w = P.w;
  if (usesMatter && P.lambdaSlider) matterCtl.push(F.slider({ key: 'lambda', label: 'Cosmological constant $\\Lambda$', min: 0, max: 3, step: 0.05, value: P.lambda, unit: '\\Lambda_\\text{obs}', fmt: (v) => v.toFixed(2), explain: 'In units of the measured value, $\\Lambda_\\text{obs} \\approx 1.1\\times10^{-52}\\ \\text{m}^{-2}$.' }));
  else F.params.lambda = P.lambda;
  if (modes.includes('wave') && P.pols) F.choice({ key: 'pol', label: 'Polarization', options: [['plus', 'plus (+)'], ['cross', 'cross (×)']], value: P.pol, explain: 'The same stretch-and-squeeze pattern, turned by 45°.' });
  else F.params.pol = P.pol;
  const tmax = TMAX[P.mode];
  let tCtl = null;
  if (P.play) tCtl = F.slider({ key: 't', label: 'Time since release, $t$', min: 0, max: tmax, step: 0.01, value: P.t ?? T0[P.mode], unit: P.mode === 'wave' ? '\\text{periods}' : 'T', explain: P.mode === 'wave' ? 'In periods of the wave.' : 'In units of the time scale $T$ shown in the readout.' });
  else F.params.t = P.t ?? T0[P.mode];
  const S = { running: false };
  const anim = P.play ? F.animate((dt) => {
    if (!S.running) return;
    const t = Math.min(tmax, F.params.t + (dt * tmax) / (P.mode === 'wave' ? 4 : 3.2));
    tCtl.set(t);
    if (t >= tmax) S.running = false;
    draw();
  }, { force: true }) : null;
  if (P.play) F.button({ label: 'Play ▶', primary: true, onClick: () => { tCtl.set(0); S.running = true; anim.start(); } });

  // show only the controls that act in the current mode
  function showControls() {
    const m = F.params.mode;
    for (const [k, c] of Object.entries(rCtl)) c.node.hidden = !((m === 'tides' || m === 'both') && k === F.params.body);
    for (const c of matterCtl) c.node.hidden = !(m === 'matter' || m === 'both');
  }
  F.onChange(() => { showControls(); draw(); });
  showControls();

  // ── physics for the current settings ──────────────────────────────────────
  function state() {
    const m = F.params.mode, body = BODIES[F.params.body];
    const r = F.params[`r_${F.params.body}`] * body.unit;
    const rho = F.params.rho, p = F.params.w * rho * C * C, lambda = F.params.lambda * LAMBDA;
    let k = [0, 0, 0], kref = 0;
    if (m === 'tides') { k = tidalRates(body.GM, r); kref = body.GM / r ** 3; }
    if (m === 'matter') { const x = matterRate(rho, p, lambda); k = [x, x, x]; kref = matterRate(rho); }
    if (m === 'both') { k = combinedRates({ GM: body.GM, r, rho, p, lambda }); kref = Math.max(body.GM / r ** 3, matterRate(rho)); }
    // the time unit: the natural scale, shortened when the change is faster still (so the drawing stays on screen)
    const unit = Math.max(kref, Math.max(...k.map(Math.abs)) / 2);
    const T = unit > 0 ? 1 / Math.sqrt(unit) : Infinity;
    return { m, body, r, rho, p, lambda, k, T };
  }
  // the deformation at time τ (units of T, or wave periods): a 3×3 map of the unit ball
  function deform(st, tau) {
    if (st.m === 'wave') {
      const [[a, b], [c, d]] = waveDeform(P.h, 2 * Math.PI * tau, F.params.pol);
      return [[a, b, 0], [c, d, 0], [0, 0, 1]];
    }
    const f = Number.isFinite(st.T) ? ballAt(st.k, tau * st.T) : [1, 1, 1];
    return [[f[0], 0, 0], [0, f[1], 0], [0, 0, f[2]]];
  }
  const apply = (M, p) => [0, 1, 2].map((i) => M[i][0] * p[0] + M[i][1] * p[1] + M[i][2] * p[2]);
  function volume(st, tau) {
    if (st.m === 'wave') return waveArea(P.h, 2 * Math.PI * tau, F.params.pol);
    return Number.isFinite(st.T) ? volumeAt(st.k, tau * st.T) : 1;
  }
  // relative acceleration (in units of 1/T², any consistent scale) of the grain that started at p0 and is now at q
  function accel(st, tau, p0, q) {
    if (st.m === 'wave') {
      const now = apply(deform(st, tau), p0);
      return now.map((x, i) => -(x - p0[i]));          // ∝ −ω²(ξ − ξ₀): pulled back toward its rest position
    }
    return q.map((qi, i) => -st.k[i] * st.T * st.T * qi);
  }

  // ── drawing ───────────────────────────────────────────────────────────────
  const side = new Plot(canvas, { x: [-2.4, 2.35], y: [-1.8, 1.8], equal: true, grid: false, axes: false });
  const end = new Plot(canvas, { x: [-1.8, 1.8], y: [-1.9, 1.7], equal: true, grid: false, axes: false });
  const vol = new Plot(canvas, { x: [0, 1], y: [0, 2], grid: true, axes: true, xlabel: '', ylabel: '', yticks: 4, xticks: 4 });

  function clip(pl, x0, y0, w, h, fn) {
    const ctx = pl.ctx;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip(); fn(); ctx.restore();
  }
  // the image of the unit circle in the plane of axes (i, j)
  function outline(pl, M, i, j, o) {
    const pts = [];
    for (let s = 0; s <= 72; s++) {
      const th = (s / 72) * 2 * Math.PI, u = [0, 0, 0];
      u[i] = Math.cos(th); u[j] = Math.sin(th);
      const q = apply(M, u);
      pts.push([q[i], q[j]]);
    }
    pl.path(pts, { close: true, ...o });
  }
  // the grains projected onto the plane of axes (i, j); depth along axis d, toward the viewer = +
  function dust(pl, M, i, j, d, small = false) {
    const qs = DUST.map((p) => apply(M, p)).sort((a, b) => a[d] - b[d]);
    const k = small ? 0.65 : 1;
    for (const q of qs) {
      const s = Math.max(0, Math.min(1, (q[d] + 1.4) / 2.8));
      pl.ctx.globalAlpha = 0.3 + 0.6 * s;
      pl.point(q[i], q[j], { color: 'accent2', r: k * (1.3 + 1.5 * s) });
    }
    pl.ctx.globalAlpha = 1;
  }

  function drawSide(st, tau, narrow) {
    const pl = side, M = deform(st, tau);
    if (st.m === 'matter' || st.m === 'both') {
      pl.rect(pl.vx0, pl.vy0, pl.vx1 - pl.vx0, pl.vy1 - pl.vy0, { color: 'gold', alpha: 0.07, stroke: false });
      const words = narrow ? (st.m === 'both' ? 'matter, and a mass' : 'uniform matter') : st.m === 'both' ? 'uniform matter all round, and a mass' : 'uniform matter all round the ball';
      pl.text(words, pl.vx1 - 0.08, pl.vy0 + 0.18, { color: 'gold', size: narrow ? 10 : 11, align: 'right' });
    }
    if (st.m === 'tides' || st.m === 'both') {
      const B = st.body, R = 2.2, cx = pl.vx0 - R + 0.42;
      if (B.hole) pl.circle(cx, 0, R, { fill: '#05070c', color: 'ink3', width: 1.5 });
      else pl.circle(cx, 0, R, { fill: 'teal', alpha: 0.28, color: 'teal', width: 2 });
      const name = B.hole ? (B.name === 'Sagittarius A*' ? 'Sgr A*' : 'black hole') : 'Earth';
      pl.text(name, pl.vx0 + 0.5, pl.vy0 + 0.18, { color: B.hole ? 'ink2' : 'teal', size: narrow ? 10 : 11.5 });
      if (!P.arrows) {                     // the line to the centre (the arrows would sit on it)
        pl.line(pl.vx0 + 0.5, 0, -1.15, 0, { color: 'ink4', width: 1.2, dash: [4, 4] });
        if (!narrow) pl.text('to the centre', pl.vx0 + 0.55, -0.16, { color: 'ink3', size: 10.5 });
      }
    }
    if (st.m === 'wave') pl.text('face-on: the wave comes toward you', pl.vx0 + 0.08, pl.vy1 - 0.14, { color: 'ink3', size: narrow ? 10 : 11 });
    pl.circle(0, 0, 1, { color: 'ink3', width: 1.2, dash: [4, 4] });
    outline(pl, M, 0, 1, { color: 'accent', width: 2, fill: 'accent', fillAlpha: 0.07 });
    dust(pl, M, 0, 1, 2, narrow);
    if (P.arrows) arrows(pl, st, tau, M, narrow);
    if (st.m !== 'wave' && P.play) pl.text(`t = ${tau.toFixed(2)} T`, pl.vx1 - 0.08, pl.vy1 - 0.14, { color: 'ink2', size: 11, align: 'right' });
  }

  // arrows of relative acceleration at four points of the outline (side view: axes x, y)
  function arrows(pl, st, tau, M, narrow) {
    const dirs = st.m === 'wave' && F.params.pol === 'cross'
      ? [[1, 1], [-1, -1], [1, -1], [-1, 1]].map(([a, b]) => [a / Math.SQRT2, b / Math.SQRT2, 0])
      : [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];
    const acc = dirs.map((u) => { const q = apply(M, u); return { q, a: accel(st, tau, u, q) }; });
    const big = Math.max(...acc.map(({ a }) => Math.hypot(a[0], a[1])));
    if (!(big > 1e-9)) return;
    const s = 0.55 / big;
    acc.forEach(({ q, a }, n) => {
      const len = Math.hypot(a[0], a[1]) * s;
      if (len < 0.04) return;
      const rq = Math.hypot(q[0], q[1]) || 1, ux = q[0] / rq, uy = q[1] / rq;
      const out = a[0] * q[0] + a[1] * q[1] > 0;
      // an outward arrow starts just outside the outline; an inward one ends just outside it
      const gap = out ? 0.06 : 0.08 + len;
      const base = [q[0] + ux * gap, q[1] + uy * gap], tip = [base[0] + a[0] * s, base[1] + a[1] * s];
      pl.arrow(base[0], base[1], tip[0], tip[1], { color: 'warn', width: 2.2 });
      if ((n !== 0 && n !== 2) || narrow) return;
      const word = st.m === 'matter' ? (out ? 'grow' : 'shrink') : (out ? 'stretch' : 'squeeze');
      // beside the middle of the arrow: above a level arrow, to the right of an upright one
      const mid = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2];
      if (Math.abs(ux) > 0.5) pl.text(word, mid[0], mid[1] + 0.2, { color: 'warn', size: narrow ? 10 : 11.5, align: 'center' });
      else pl.text(word, mid[0] + 0.12, mid[1], { color: 'warn', size: narrow ? 10 : 11.5, align: 'left' });
    });
  }

  function drawEnd(st, tau, narrow) {
    const pl = end, M = deform(st, tau);
    const title = narrow ? (st.m === 'wave' ? 'edge-on' : 'end-on') : st.m === 'wave' ? 'edge-on: the wave moves →' : st.m === 'matter' ? 'end-on view (the same)' : 'end-on, looking toward the mass';
    pl.text(title, pl.L + 2, pl.T + 8, { screen: true, color: 'ink2', size: narrow ? 9.5 : 11, weight: 650 });
    pl.circle(0, 0, 1, { color: 'ink3', width: 1.2, dash: [4, 4] });
    if (st.m === 'wave') {
      // across: the direction of travel z (unchanged); up: x
      const Mz = [[M[2][2], M[2][0], 0], [M[0][2], M[0][0], 0], [0, 0, 1]];
      outline(pl, Mz, 0, 1, { color: 'accent', width: 2, fill: 'accent', fillAlpha: 0.07 });
      for (const p of DUST) { const q = apply(M, p); pl.point(q[2], q[0], { color: 'accent2', r: narrow ? 1 : 1.4 }); }
    } else {
      // looking along −x from the +x side: across is z, up is y, depth toward the viewer is +x
      outline(pl, M, 2, 1, { color: 'accent', width: 2, fill: 'accent', fillAlpha: 0.07 });
      dust(pl, M, 2, 1, 0, narrow);
    }
  }

  function drawVolume(st, tau, narrow) {
    const pl = vol, tm = TMAX[st.m];
    pl.grid(); pl.axes();
    pl.line(0, 1, tm, 1, { color: 'ink3', width: 1.2, dash: [5, 4] });
    pl.fn((x) => volume(st, x), { color: 'good', width: 2.4, domain: [0, tm] });
    pl.point(tau, volume(st, tau), { color: 'good', r: 4 });
    pl.text('volume ÷ starting volume', pl.L + 4, pl.T + 8, { screen: true, color: 'good', size: narrow ? 9.5 : 11, weight: 650 });
    pl.text(st.m === 'wave' ? 'periods' : 't / T', pl.R, pl.B + 22, { screen: true, color: 'ink3', size: 10.5, align: 'right' });
  }

  function draw() {
    const st = state();
    const tau = F.params.t;
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 375;
    const narrow = W < 480, sideOnly = P.views === 'side';
    const split = sideOnly ? W : Math.round(W * (narrow ? 0.64 : 0.6));
    // the volume axis grows to fit the curve
    const tm = TMAX[st.m];
    let vmax = 1;
    for (let s = 0; s <= 40; s++) vmax = Math.max(vmax, volume(st, (s / 40) * tm));
    vol.setView([0, tm], [0, vmax > 1.8 ? Math.ceil(vmax * 1.15) : 2]);
    side.o.pad = { l: 4, r: W - split + 4, t: 4, b: 4 };
    end.o.pad = { l: split + 6, r: 6, t: 6, b: narrow ? 6 : Math.round(H * 0.5) + 2 };
    vol.o.pad = { l: split + 34, r: 10, t: Math.round(H * 0.5) + 12, b: 26 };
    for (const pl of [side, end, vol]) { pl.resize(); pl.refreshTheme(); }
    side.ctx.clearRect(0, 0, W, H);
    clip(side, 0, 0, split, H, () => drawSide(st, tau, narrow));
    if (!sideOnly) {
      const ctx = side.ctx;
      ctx.save(); ctx.strokeStyle = side.col.line2; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(split + 0.5, 8); ctx.lineTo(split + 0.5, H - 8); ctx.stroke(); ctx.restore();
      clip(end, split, 0, W - split, narrow ? H : H / 2, () => drawEnd(st, tau, narrow));
      if (!narrow) clip(vol, split, H / 2, W - split, H / 2, () => drawVolume(st, tau, narrow));
    }
    if (P.readout) F.readout(readoutRows(st, tau));
  }

  function readoutRows(st, tau) {
    const vrow = ['volume now', `${volume(st, tau).toFixed(3)}\\,V_0`];
    if (st.m === 'tides') {
      const k = st.body.GM / st.r ** 3, a2 = 2 * k * 2;
      return [
        ['distance $r$', `${texNum(st.r / 1e3, 3)}\\ \\text{km}${st.body.hole ? `\\;(${texNum(st.r / st.body.unit, 3)}\\,r_s)` : ''}`],
        ['stretch along the line, $2GM/r^3$', `${texNum(2 * k)}\\ \\text{s}^{-2}`],
        ['squeeze across (each way), $GM/r^3$', `${texNum(k)}\\ \\text{s}^{-2}`],
        ['on a 2 m body, head to foot', `${texNum(a2)}\\ \\text{m/s}^2\\ (${texNum(a2 / G0)}\\,g)`],
        ['time scale $T$', texTime(st.T)],
        vrow,
      ];
    }
    if (st.m === 'matter') {
      return [
        ['source $\\rho + 3p/c^2$', `${texNum(st.rho + (3 * st.p) / (C * C))}\\ \\text{kg/m}^3`],
        ...(st.lambda > 0 ? [['$\\Lambda c^2$', `${texNum(st.lambda * C * C)}\\ \\text{s}^{-2}`]] : []),
        ['$\\ddot V/V$ at release', `${texNum(volumeAccel(st.k))}\\ \\text{s}^{-2}`],
        ['time scale $T$', texTime(st.T)],
        vrow,
      ];
    }
    if (st.m === 'both') {
      return [
        ['volume part, from the local matter: $\\ddot V/V$', `${texNum(volumeAccel(st.k))}\\ \\text{s}^{-2}`],
        ['shape part, from the distant mass: $2GM/r^3$', `${texNum((2 * st.body.GM) / st.r ** 3)}\\ \\text{s}^{-2}`],
        ['time scale $T$', texTime(st.T)],
        vrow,
      ];
    }
    return [
      ['strain drawn, $h$', String(P.h)],
      ['a real wave reaching Earth', '\\sim 10^{-21}'],
      ['the drawing exaggerates by about', texNum(P.h / 1e-21, 1)],
      ['area now', `${waveArea(P.h, 2 * Math.PI * tau, F.params.pol).toFixed(3)}\\,A_0`],
    ];
  }

  F.draw(draw);
  F.caption('Each grain falls freely; the arrows show how it accelerates relative to the centre. Shapes are to scale, with time in units of the time scale $T$ in the readout. The tidal field is held fixed while the ball falls (fine while the ball moves little compared with its distance from the mass), and the grains do not pull on one another.');
  return { get: (k) => F.params[k] };
}
