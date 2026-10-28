// An orbit beside its effective potential. Left, the orbit seen from above,
// with the force centre at the origin and dashed circles at the two turning
// radii; right, U_eff(r) = U(r) + ℓ²/(2μr²) with the total energy E as a
// gold line you can drag. Where the line lies above the curve the body may
// be; where it meets the curve (rₚ and rₐ) the radial motion turns round, and
// those are exactly the circles on the left. Play runs the body at its true
// relative rate and rides a marker along the E line, with the radial kinetic
// energy E − U_eff as the gap. Force laws: Newton's inverse square, any power
// law F = −krⁿ (n > −3: nearly circular orbits precess unless n = −2 or 1),
// or Newton plus the Schwarzschild −GMℓ²/(c²μr³) term (Mercury's precession,
// exaggerated). Units: μ = k = 1 (GM = 1). Physics in model/cm3-orbit.js
// (tested in test/cm3-orbit.test.mjs).
//
//   { type: 'cm3-orbit', params: {
//       force: 'kepler',          // 'kepler' | 'power' | 'gr'
//       laws: null,               // e.g. ['kepler', 'power']: a choice between force laws
//       n: -2, L: 1, E: -0.3,     // power-law exponent, angular momentum ℓ, energy E
//       delta: 0.005,             // gr: GM/c² in these units (Mercury's is ~10⁻⁸ of its orbit; the sim exaggerates)
//       sliders: ['L', 'E'],      // any of L E n delta ([] for a still picture)
//       ranges: { E: [-0.6, 0.3, 0.005] },   // [min, max, step] per slider key
//       turns: 3,                 // how many turns (2π of φ) of a bound orbit to draw
//       view: null,               // half-width of the orbit panel (default: fitted to the starting orbit)
//       r: null, y: null,         // U_eff panel ranges (default: fitted to the starting orbit)
//       parts: true,              // U(r) and ℓ²/2μr² drawn dashed beside U_eff
//       turning: true,            // turning points rₚ, rₐ on the E line, with their circles on the orbit
//       allowed: true,            // shade where E > U_eff
//       apsides: true,            // periapsis and apoapsis dots on the orbit
//       dragE: true, play: true,  // drag the energy line; a Play button
//       readouts: ['E', 'L', 'rp', 'ra', 'ecc'],   // any of E L rp ra ecc rc apsidal advance formula fate ([] hides)
//       labels: true,             // curve legend and apsis labels
//       panels: ['orbit', 'ueff'],
//       orbitSeconds: 5,          // animation seconds per radial period
//   } }
// A problem that asks for a turning point, the eccentricity or the apsidal
// angle should hide the matching marker or readout — a picture must not show
// its answer. `get('E')` (and every slider key) answers slider items.

import { Plot } from '../plot.js';
import * as O from '../model/cm3-orbit.js';

export const defaults = {
  force: 'kepler', laws: null, n: -2, L: 1, E: -0.3, delta: 0.005, sliders: ['L', 'E'], ranges: {}, turns: 3,
  view: null, r: null, y: null, parts: true, turning: true, allowed: true, apsides: true, dragE: true, play: true,
  readouts: ['E', 'L', 'rp', 'ra', 'ecc'], labels: true, panels: ['orbit', 'ueff'], orbitSeconds: 5,
};
export const READOUTS = ['E', 'L', 'rp', 'ra', 'ecc', 'rc', 'apsidal', 'advance', 'formula', 'fate'];
const SLIDERS = ['L', 'E', 'n', 'delta'];
const RANGE = { L: [0.4, 2, 0.01], E: [-1, 0.5, 0.005], n: [-2.9, 2, 0.05], delta: [0, 0.03, 0.0005] };
const LAWNAME = { kepler: 'Inverse square', power: 'Power law $r^n$', gr: 'Newton + GR term' };
const FATE = { bound: 'bound', circle: 'circular', escape: 'escapes', plunge: 'falls to the centre' };
const trim = (x, n = 3) => String(+(+x).toPrecision(n)).replace(/e\+?(-?\d+)/, '\\times10^{$1}');
const DEG = 180 / Math.PI;

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const panels = (P.panels || ['orbit', 'ueff']).filter((p) => p === 'orbit' || p === 'ueff');
  const both = panels.length === 2;
  const narrow = typeof window !== 'undefined' && window.innerWidth < 560;
  const { canvas } = F.canvas({ aspect: both ? (narrow ? 'square' : 'wide') : panels[0] === 'orbit' ? '' : 'wide', label: P.alt || 'An orbit seen from above beside its effective potential energy, with the energy line and turning points' });
  const ctx = canvas.getContext('2d');

  // controls
  if (P.laws && P.laws.length > 1) F.choice({ key: 'force', label: 'Force law', options: P.laws.map((k) => [k, LAWNAME[k]]), value: P.force, explain: 'Inverse square is gravity; a power law $F = -kr^n$ includes the spring ($n = 1$); the GR term is general relativity’s correction, exaggerated.' });
  else F.params.force = P.force;
  const rng = (k) => P.ranges?.[k] || RANGE[k];
  const EXPLAIN = {
    L: ['Angular momentum $\\ell$', '', 'Conserved; it sets the centrifugal barrier $\\ell^2/2\\mu r^2$ (units with $\\mu = k = 1$).'],
    E: ['Energy $E$', '', 'Kinetic plus potential, conserved. You can also drag the gold line.'],
    n: ['Force exponent $n$', '', 'An attractive force $F = -kr^n$: $n = -2$ is gravity, $n = 1$ a spring.'],
    delta: ['GR strength $GM/c^2$', '', 'Adds $-GM\\ell^2/(c^2\\mu r^3)$ to $U_{\\text{eff}}$. Zero is Newton.'],
  };
  for (const k of SLIDERS) {
    if ((P.sliders || []).includes(k)) { const [lo, hi, st] = rng(k); F.slider({ key: k, label: EXPLAIN[k][0], min: lo, max: hi, step: st, value: P[k], unit: EXPLAIN[k][1], explain: EXPLAIN[k][2] }); }
    else F.params[k] = P[k];
  }
  const par = () => ({ force: F.params.force, n: +F.params.n, L: +F.params.L, E: +F.params.E, delta: +F.params.delta });

  // fixed views, fitted to the starting orbit
  const o0 = O.orbit(par(), { turns: 1 });
  const span0 = o0.ra ?? (o0.rp ? 3.2 * o0.rp : 2);
  const VIEW = P.view ?? 1.18 * span0;
  const RX = P.r ?? [0, 1.25 * VIEW];
  let YR = P.y;
  if (!YR) {
    const m = o0.Emin ?? -0.5, s = Math.max(Math.abs(m), 0.2);
    YR = [m - 0.45 * s, Math.max(o0.E, m) + 0.9 * s];
  }

  const po = new Plot(canvas, { x: [-VIEW, VIEW], y: [-VIEW, VIEW], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
  const pu = new Plot(canvas, { x: RX, y: YR, grid: true, axes: true, axesAt: 'edge', xlabel: 'r', ylabel: 'energy', xticks: 6, yticks: 5, pad: { l: 46, r: 14, t: 12, b: 30 } });

  let cache = null, ckey = '';
  const getOrbit = () => {
    const p = par(), key = JSON.stringify(p);
    if (key !== ckey) { ckey = key; cache = O.orbit(p, { turns: P.turns, steps: 1440, rfar: 4 * Math.max(VIEW, RX[1]) }); cache.V = O.ueff(O.law(p), p.L); cache.U = O.law(p).U; cache.p = p; }
    return cache;
  };

  // drag the energy line
  if (P.dragE && panels.includes('ueff')) {
    const hx = () => RX[0] + 0.86 * (RX[1] - RX[0]);
    pu.handle(() => [hx(), Math.max(getOrbit().E, YR[0])], (x, y) => {
      const [lo, hi, st] = rng('E');
      const v = Math.round(Math.min(hi, Math.max(lo, Math.min(YR[1], Math.max(YR[0], y)))) / st) * st;
      F.set('E', +v.toFixed(6));
      return [hx(), v];
    }, { hollow: true, label: 'energy line' });
  }

  // animation: S.time is the time since the start of the drawn orbit
  const S = { time: null, running: false };
  let btn = null;
  const anim = P.play ? F.animate((dt) => {
    if (!S.running) return;
    const o = getOrbit(), t0 = o.t[0], t1 = o.t[o.t.length - 1];
    const Tr = o.fate === 'bound' && o.apsidal ? 2 * timeAt(o, o.apsidal) : (t1 - t0) / 3;
    S.time = (S.time ?? t0) + dt * (Tr / P.orbitSeconds);
    if (S.time > t1) {
      if (o.fate === 'bound' || o.fate === 'circle') S.time = t0 + ((S.time - t0) % (t1 - t0));
      else { S.time = t1; S.running = false; btn.textContent = 'Replay'; }
    }
    draw();
  }, { force: true }) : null;
  if (anim) {
    btn = F.button({ label: 'Play', primary: true, onClick: () => {
      if (S.running) { S.running = false; btn.textContent = 'Play'; return; }
      if (btn.textContent === 'Replay' || S.time === null) S.time = getOrbit().t[0];
      S.running = true; btn.textContent = 'Pause'; anim.start();
    } });
  }
  F.onChange(() => { S.running = false; S.time = null; if (btn) btn.textContent = 'Play'; draw(); });

  function layout() {
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    if (!both) return { o: { l: 6, r: 6, t: 6, b: 6 }, u: { l: 50, r: 14, t: 12, b: 30 }, W, H };
    if (W / H > 1.3) {
      const split = Math.round(W * 0.45);
      return { o: { l: 4, r: W - split + 4, t: 4, b: 4 }, u: { l: split + 46, r: 14, t: 12, b: 30 }, W, H };
    }
    const split = Math.round(H * 0.5);
    return { o: { l: 4, r: 4, t: 4, b: H - split + 2 }, u: { l: 46, r: 12, t: split + 8, b: 28 }, W, H };
  }

  function draw() {
    const lay = layout();
    po.o.pad = lay.o; pu.o.pad = lay.u;
    po.resize(); pu.resize();
    po.refreshTheme(); pu.refreshTheme();
    ctx.setTransform(po.dpr, 0, 0, po.dpr, 0, 0);
    ctx.clearRect(0, 0, lay.W, lay.H);
    const o = getOrbit();
    const idx = S.time === null ? 0 : index(o, S.time);
    const rNow = o.r[idx] ?? o.rp;
    if (panels.includes('orbit')) drawOrbit(o, idx);
    if (panels.includes('ueff')) drawUeff(o, rNow);
    readouts(o);
  }

  function drawOrbit(o, idx) {
    const p = po;
    ctx.save();
    ctx.beginPath(); ctx.rect(p.L, p.T, p.R - p.L, p.B - p.T); ctx.clip();
    if (P.turning) {
      if (o.rp) p.circle(0, 0, o.rp, { stroke: 'ink4', width: 1, dash: [4, 4] });
      if (o.ra && o.fate !== 'circle') p.circle(0, 0, o.ra, { stroke: 'ink4', width: 1, dash: [4, 4] });
    }
    p.path(o.pts, { color: 'accent', width: 1.8 });
    p.point(0, 0, { color: 'gold', r: 5 });
    if (P.apsides && o.rp && o.fate !== 'circle') {
      const start = o.fate === 'plunge' ? null : [o.rp, 0];
      if (start) p.point(start[0], start[1], { color: 'good', r: 4, label: P.labels ? 'periapsis' : '', ldx: 8, ldy: 12, lsize: 11 });
      if (o.fate === 'bound' && o.apsidal) p.point(o.ra * Math.cos(o.apsidal), o.ra * Math.sin(o.apsidal), { color: 'good', r: 4, label: P.labels ? 'apoapsis' : '', ldx: 8, ldy: -10, lsize: 11 });
    }
    const [bx, by] = o.pts[idx] || [o.rp, 0];
    if (S.time !== null) {
      const tr = o.pts.slice(Math.max(0, idx - 60), idx + 1);
      p.path(tr, { color: 'warn', width: 3, alpha: 0.6 });
    }
    p.point(bx, by, { color: 'warn', r: 6 });
    if (P.labels && (o.fate === 'escape' || o.fate === 'plunge')) p.text(FATE[o.fate], p.L + 8, p.T + 14, { screen: true, color: o.fate === 'plunge' ? 'bad' : 'ink2', size: 12, weight: 650 });
    ctx.restore();
  }

  function drawUeff(o, rNow) {
    const p = pu, V = o.V, U = o.U, L = o.p.L, E = o.E;
    p.grid(); p.axes();
    const xa = Math.max(RX[0], 1e-6), xb = RX[1];
    if (P.allowed) {
      const a = o.rp ?? xa, b = o.ra ?? xb;
      if (o.fate !== 'circle') p.area(() => E, Math.max(a, xa), Math.min(b, xb), { lower: (r) => Math.min(E, V(r)), color: 'good', alpha: 0.16 });
    }
    if (P.parts) {
      p.fn((r) => (r > xa ? U(r) : NaN), { color: 'ink3', width: 1.3, dash: [5, 4], domain: [xa, xb] });
      p.fn((r) => (r > xa ? (L * L) / (2 * r * r) : NaN), { color: 'violet', width: 1.3, dash: [5, 4], domain: [xa, xb] });
    }
    p.fn((r) => (r > xa ? V(r) : NaN), { color: 'accent', width: 2.4, domain: [xa, xb] });
    p.line(xa, E, xb, E, { color: 'gold', width: 2 });
    if (P.turning) {
      for (const [r, lab] of [[o.rp, 'rₚ'], [o.fate === 'circle' ? null : o.ra, 'rₐ']]) {
        if (!r || r > xb) continue;
        p.line(r, p.vy0, r, E, { color: 'ink3', width: 1, dash: [3, 4] });
        p.point(r, E, { color: 'good', r: 4.5, label: P.labels ? lab : '', ldx: lab === 'rₚ' ? -16 : 6, ldy: -11, lsize: 12 });
      }
    }
    if (S.time !== null && Number.isFinite(rNow) && rNow < xb) {
      p.line(rNow, V(rNow), rNow, E, { color: 'warn', width: 3 });
      p.point(rNow, E, { color: 'warn', r: 5 });
    }
    if (P.labels) {
      const items = [['U eff', 'accent', []], ...(P.parts ? [['U(r)', 'ink3', [5, 4]], ['ℓ²/2μr²', 'violet', [5, 4]]] : []), ['E', 'gold', []]];
      const g = ctx, x0 = p.R - 92, y0 = p.T + 10;
      g.save(); g.font = '500 11.5px Inter, system-ui, sans-serif'; g.textBaseline = 'middle';
      g.fillStyle = p.col.bg; g.globalAlpha = 0.8; g.fillRect(x0 - 6, y0 - 8, 96, items.length * 15 + 2); g.globalAlpha = 1;
      items.forEach(([s, c, d], i) => {
        const y = y0 + i * 15;
        g.strokeStyle = p.color(c); g.lineWidth = 2; g.setLineDash(d); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 18, y); g.stroke();
        g.setLineDash([]); g.fillStyle = p.color('ink2'); g.fillText(s, x0 + 24, y);
      });
      g.restore();
    }
    p.drawHandles();
  }

  function readouts(o) {
    const want = P.readouts || [];
    const p = o.p, ka = p.force !== 'gr';
    const rows = want.map((k) => {
      switch (k) {
        case 'E': return ['$E$', trim(o.E)];
        case 'L': return ['$\\ell$', trim(p.L)];
        case 'rp': return ['$r_p$', o.rp ? trim(o.rp) : '\\text{none}'];
        case 'ra': return ['$r_a$', o.ra ? trim(o.ra) : '\\infty'];
        case 'rc': return ['circle at $r_c$', o.rc ? trim(o.rc) : '\\text{none}'];
        case 'ecc': return ['$e$', o.fate === 'bound' || o.fate === 'circle' ? trim((o.ra - o.rp) / (o.ra + o.rp)) : p.force === 'kepler' ? trim(O.keplerElements(o.E, p.L).e) : '\\text{—}'];
        case 'apsidal': return ['apsidal angle', o.apsidal ? `${trim(o.apsidal * DEG, 4)}^\\circ` : '\\text{—}'];
        case 'advance': return ['advance per orbit', o.advance !== null ? `${trim(o.advance * DEG, 3)}^\\circ` : '\\text{—}'];
        case 'formula': return ka ? ['$\\pi/\\sqrt{3+n}$', `${trim(O.apsidalFormula(p.force === 'kepler' ? -2 : p.n) * DEG, 4)}^\\circ`] : null;
        case 'fate': return ['orbit', `\\text{${FATE[o.fate]}}`];
        default: return null;
      }
    });
    F.readout(rows.filter(Boolean));
  }

  F.draw(draw);
  F.caption('Units with $\\mu = k = 1$ ($GM = 1$ for gravity). The orbit is integrated exactly (RK4 on $u\'\' + u = -F/\\ell^2u^2$, $u = 1/r$) and drawn to scale; the body moves at its true relative rate. One body about a fixed centre: for two bodies this is the motion of their separation, with $\\mu$ the reduced mass.');
  return { get: (k) => F.params[k] };
}

function index(o, t) {
  const T = o.t;
  let lo = 0, hi = T.length - 1;
  if (t <= T[0]) return 0;
  if (t >= T[hi]) return hi;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; }
  return lo;
}
function timeAt(o, phi) {
  const i = o.phi.findIndex((p) => p >= phi);
  return i < 0 ? o.t[o.t.length - 1] - o.t[0] : o.t[i] - o.t[0];
}

export function validate(P0) {
  const P = { ...defaults, ...P0 }, out = [];
  if (!O.LAWS.includes(P.force)) out.push(`cm3-orbit: unknown force “${P.force}” (use ${O.LAWS.join(', ')})`);
  for (const k of P.laws || []) if (!O.LAWS.includes(k)) out.push(`cm3-orbit: unknown law “${k}” in laws`);
  if (P.laws && P.laws.length && !P.laws.includes(P.force)) out.push('cm3-orbit: force must be one of laws');
  if (!(P.n > -3 && P.n <= 4)) out.push('cm3-orbit: n must lie in (−3, 4]: for n ≤ −3 there is no stable circular orbit');
  if (!(P.L > 0)) out.push('cm3-orbit: L (angular momentum) must be positive');
  if (!(P.delta >= 0 && P.delta < 0.1)) out.push('cm3-orbit: delta must lie in [0, 0.1)');
  if (P.force === 'gr' && !(P.L * P.L > 12 * P.delta)) out.push('cm3-orbit: with the GR term ℓ² must exceed 12δ, or there is no well');
  if (!(typeof P.E === 'number' && Number.isFinite(P.E))) out.push('cm3-orbit: E must be a number');
  for (const s of P.sliders || []) if (!SLIDERS.includes(s)) out.push(`cm3-orbit: unknown slider “${s}” (use ${SLIDERS.join(', ')})`);
  for (const [k, r] of Object.entries(P.ranges || {})) {
    if (!SLIDERS.includes(k)) out.push(`cm3-orbit: ranges has unknown key “${k}”`);
    else if (!(Array.isArray(r) && r.length === 3 && r[0] < r[1] && r[2] > 0)) out.push(`cm3-orbit: ranges.${k} must be [min, max, step]`);
    else if ((P.sliders || []).includes(k) && !(P[k] >= r[0] && P[k] <= r[1])) out.push(`cm3-orbit: ${k} = ${P[k]} lies outside ranges.${k}`);
  }
  for (const k of P.readouts || []) if (!READOUTS.includes(k)) out.push(`cm3-orbit: unknown readout “${k}” (use ${READOUTS.join(', ')})`);
  for (const p of P.panels || []) if (!['orbit', 'ueff'].includes(p)) out.push(`cm3-orbit: unknown panel “${p}”`);
  if (!(P.turns >= 1 && P.turns <= 12)) out.push('cm3-orbit: turns must lie in [1, 12]');
  if (P.view !== null && !(P.view > 0)) out.push('cm3-orbit: view must be positive');
  for (const key of ['r', 'y']) if (P[key] !== null && !(Array.isArray(P[key]) && P[key][0] < P[key][1])) out.push(`cm3-orbit: ${key} must be [min, max]`);
  if (O.LAWS.includes(P.force) && P.L > 0 && !out.length) {
    const tp = O.turning({ force: P.force, n: P.n, L: P.L, E: P.E, delta: P.delta });
    if (tp.Emin !== null && P.E < tp.Emin - 1e-9) out.push(`cm3-orbit: E = ${P.E} lies below the floor of the well (${tp.Emin.toPrecision(4)})`);
  }
  return out;
}
