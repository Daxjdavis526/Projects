// A finite-difference lab for module B13 of the PDE course: one scheme run on a
// periodic grid against the exact solution, the stencil's numerical domain of
// dependence against the physical one (the CFL picture), and the von Neumann
// amplification factor G(θ) against the unit circle.
//   profile — the grid values uⱼⁿ (dots) over the exact solution (line) at time t
//   cone    — the grid in the x–t plane, in cells and steps: the points one value
//             depends on n steps back (shaded), and the characteristic(s) of the
//             PDE traced back from it (for heat, the whole line)
//   gain    — G(θ) for θ = kΔx from −π to π in the complex plane, inside or
//             outside the unit circle; or |G| against θ (gain: 'abs')
// Schemes and exact solutions in model/pde4-fd.js (test/pde4-fd.test.mjs).
//
//   { type: 'pde4-scheme', params: {
//       eq: 'advect',            // advect (u_t + c u_x = 0) | heat (u_t = D u_xx) | wave (u_tt = c² u_xx, from rest)
//       scheme: 'upwind',        // advect: upwind downwind ftcs laxf lw · heat: ftcs · wave: leapfrog
//       schemes: null,           // schemes the learner may switch between (advection only), e.g. ['upwind', 'ftcs', 'lw']
//       nu: 0.8,                 // the Courant number cΔt/Δx (heat: r = DΔt/Δx²)
//       numax: 1.5,              // the top of its slider
//       N: 100, Ns: null,        // grid points on the periodic domain [0, 10) m; Ns: a choice of N, e.g. [25, 50, 100, 200]
//       profile: 'gauss',        // gauss | box | sine
//       w: 0.8, m: 1,            // the bump's width or the box's half-width (m); the sine's whole waves across the domain
//       noise: 0,                // the size of random noise added at t = 0 (e.g. 1e-6, a stand-in for round-off)
//       c: 1, D: 0.1,            // advection and wave speed (m/s); diffusivity (m²/s)
//       t: 0, tmax: 10,          // the moment shown (s); the top of the time slider
//       panels: ['profile', 'cone', 'gain'],
//       gain: 'plane',           // plane (G in the complex plane) | abs (|G| against θ)
//       levels: 5,               // cone: how many steps back
//       ylim: [-0.4, 1.4],       // profile: the vertical window (values beyond it are pinned to its edge, in red)
//       exact: true,             // profile: draw the exact solution
//       controls: null,          // true, false, or a list of: scheme nu N profile t noise
//       play: null,              // animate t (default: in the Explore step)
//       readout: true,
//       hide: [],                // readouts shown as “?”: steps maxu gain error
//   } }
// `get('nu')` reads the Courant-number slider, so a slider item can ask for a stability limit.

import { Plot } from '../plot.js';
import * as M from '../model/pde4-fd.js';

export const defaults = { eq: 'advect', scheme: 'upwind', schemes: null, nu: 0.8, numax: 1.5, N: 100, Ns: null, profile: 'gauss', w: 0.8, m: 1, noise: 0, c: 1, D: 0.1, t: 0, tmax: 10, panels: ['profile', 'cone', 'gain'], gain: 'plane', levels: 5, ylim: [-0.4, 1.4], exact: true, controls: null, play: null, readout: true, hide: [] };
const CONTROLS = ['scheme', 'nu', 'N', 'profile', 't', 'noise'];
const PANELS = ['profile', 'cone', 'gain'];
const HIDE = ['steps', 'maxu', 'gain', 'error'];
const L = 10;
const EXPLAIN = { upwind: 'Upwind takes its difference from the side the wave comes from.', downwind: 'Downwind takes it from the wrong side.', ftcs: 'FTCS (forward in time, centred in space) uses both neighbours equally.', laxf: 'Lax–Friedrichs replaces the old value by the average of its neighbours.', lw: 'Lax–Wendroff adds a second-order correction from the Taylor series.' };
const texNum = (x) => {
  if (!Number.isFinite(x)) return '\\infty';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e4)) { const [mm, e] = x.toExponential(2).split('e'); return `${+mm}\\times10^{${+e}}`; }
  return String(+x.toPrecision(3));
};

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const panels = P.panels;
  const schemes = P.eq === 'advect' && Array.isArray(P.schemes) && P.schemes.length ? P.schemes : [P.scheme];
  const auto = [...(schemes.length > 1 ? ['scheme'] : []), 'nu', ...(P.Ns ? ['N'] : []), ...(panels.includes('profile') ? ['t'] : [])];
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? auto : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  const isHeat = P.eq === 'heat';
  const nuName = isHeat ? 'r' : 'ν';

  ctl('scheme', () => F.choice({ key: 'scheme', label: 'Scheme', options: schemes.map((s) => [s, M.NAME[s]]), value: P.scheme, explain: schemes.map((k) => EXPLAIN[k]).join(' ') }));
  ctl('nu', () => F.slider({ key: 'nu', label: isHeat ? 'Mesh ratio $r = D\\,\\Delta t/\\Delta x^2$' : 'Courant number $\\nu = c\\,\\Delta t/\\Delta x$', min: 0.05, max: P.numax, step: 0.01, value: P.nu, explain: isHeat ? 'How big a time step is, measured against $\\Delta x^2/D$.' : 'How many cells the wave crosses in one time step.' }));
  ctl('N', () => F.choice({ key: 'N', label: 'Grid points $N$', options: (P.Ns || [P.N]).map((n) => [n, String(n)]), value: P.N, explain: `Points across the ${L} m domain: $\\Delta x = ${L}/N$.` }));
  ctl('profile', () => F.choice({ key: 'profile', label: 'Initial profile', options: [['gauss', 'bump'], ['box', 'square'], ['sine', 'sine wave']], value: P.profile, explain: 'The square’s jumps contain every wavelength, the shortest the grid can hold included.' }));
  ctl('t', () => F.slider({ key: 't', label: 'Time $t$', min: 0, max: P.tmax, step: P.tmax / 400, value: P.t, unit: '\\mathrm{s}', explain: 'The scheme takes as many whole steps as fit.' }));
  ctl('noise', () => F.toggle({ key: 'noise', label: 'Add noise of size $10^{-6}$', value: !!P.noise, explain: 'A stand-in for round-off: tiny, but it contains every grid wavelength.' }));

  const cvP = panels.includes('profile') ? F.canvas({ aspect: 'wide', label: P.alt || 'Grid values of the numerical solution over the exact solution' }) : null;
  const cvC = panels.includes('cone') ? F.canvas({ aspect: 'wide', label: 'The grid in the x–t plane: the numerical and physical domains of dependence of one point' }) : null;
  const cvG = panels.includes('gain') ? F.canvas({ aspect: 'wide', label: 'The amplification factor G(θ) against the unit circle' }) : null;
  const pP = cvP && new Plot(cvP.canvas, { x: [0, L], y: P.ylim, xlabel: 'x (m)', ylabel: 'u', axesAt: 'edge', xticks: 10 });
  const pC = cvC && new Plot(cvC.canvas, { x: [-10, 10], y: [-0.7, P.levels + 0.9], axes: false, grid: false, pad: { l: 8, r: 8, t: 8, b: 8 } });
  const pG = cvG && (P.gain === 'abs'
    ? new Plot(cvG.canvas, { x: [0, Math.PI], y: [0, 2.2], xlabel: 'θ = kΔx', ylabel: '|G|', axesAt: 'edge' })
    : new Plot(cvG.canvas, { x: [-2.4, 2.4], y: [-1.7, 1.7], equal: true, xlabel: 'Re G', ylabel: 'Im G' }));

  const opts = () => {
    const p = F.params;
    return { eq: P.eq, scheme: p.scheme, N: +p.N, nu: p.nu, profile: p.profile, w: P.w, m: P.m, noise: p.noise === true ? 1e-6 : +p.noise || 0, c: P.c, D: P.D, L, XL: 0, t: p.t ?? 0 };
  };
  let cache = { key: '' };
  const result = () => {
    const o = opts(), key = JSON.stringify(o);
    if (key !== cache.key) cache = { key, o, R: M.run({ ...o, cap: 1e150 }) };
    return cache;
  };
  const gkey = () => M.gainKey(P.eq, F.params.scheme);

  function drawProfile() {
    if (!pP) return;
    const { o, R } = result();
    pP.clear();
    const narrow = (cvP.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    if (P.exact) pP.fn((x) => M.exact(o, x, R.time), { color: 'ink3', width: 2, samples: 900 });
    const [lo, hi] = P.ylim;
    const pts = R.x.map((x, j) => [x, Math.max(lo, Math.min(hi, R.u[j]))]);
    pP.path(pts, { color: 'accent', width: 1.2, alpha: 0.7 });
    const r = o.N > 150 ? 1.6 : o.N > 60 ? 2.4 : 3.2;
    R.x.forEach((x, j) => {
      const v = R.u[j], out = v > hi || v < lo;
      pP.point(x, Math.max(lo, Math.min(hi, v)), { color: out ? 'bad' : 'accent', r });
    });
    pP.text(R.blown ? `blown up after ${R.blown} steps` : `${R.steps} steps, t = ${R.time.toFixed(2)} s`, L, hi, { align: 'right', dx: -6, dy: 10, size: fs, color: R.blown ? 'bad' : 'ink2' });
    if (P.exact) pP.text('line: exact · dots: grid', 0, hi, { dx: 6, dy: 10, size: fs, color: 'ink3' });
  }

  function drawCone() {
    if (!pC) return;
    const n0 = P.levels, nu = F.params.nu, sch = F.params.scheme;
    const K = Math.max(n0 + 1, Math.ceil(P.numax * n0) + 1);
    pC.setView([-K - 0.6, K + 0.6], [-0.9, n0 + 0.9]);
    pC.clear();
    const narrow = (cvC.canvas.clientWidth || 600) < 520, fs = narrow ? 9.5 : 11;
    // the numerical domain of dependence, level by level
    const reach = (n) => (sch === 'upwind' ? [-n, 0] : sch === 'downwind' ? [0, n] : [-n, n]);
    const [a0, b0] = reach(n0);
    pC.path([[a0, 0], [0, n0], [b0, 0]], { color: 'accent', width: 0, stroke: false, fill: 'accent', fillAlpha: 0.16, close: true });
    for (let n = 0; n <= n0; n++) for (let j = -K; j <= K; j++) {
      const [a, b] = reach(n0 - n), inside = j >= a && j <= b;
      pC.point(j, n, { color: inside ? 'accent' : 'ink4', r: inside ? 3.2 : 2 });
    }
    pC.point(0, n0, { color: 'gold', r: 5 });
    // the physical domain of dependence
    const cfl = isHeat ? null : P.eq === 'wave' ? [-nu * n0, nu * n0] : [-nu * n0, -nu * n0];
    if (isHeat) {
      pC.line(-K - 0.5, -0.35, K + 0.5, -0.35, { color: 'warn', width: 4 });
      pC.text('the heat equation’s domain of dependence: the whole line', 0, -0.35, { align: 'center', dy: 11, size: fs, color: 'warn' });
    } else {
      const feet = P.eq === 'wave' ? [-nu * n0, nu * n0] : [-nu * n0];
      for (const f of feet) {
        const ok = f >= a0 - 1e-9 && f <= b0 + 1e-9;
        pC.line(0, n0, f, 0, { color: ok ? 'good' : 'bad', width: 2.4 });
        pC.point(f, 0, { color: ok ? 'good' : 'bad', r: 5.5 });
      }
      const ok = cfl[0] >= a0 - 1e-9 && cfl[1] <= b0 + 1e-9;
      pC.text(ok ? 'characteristic inside the stencil’s reach' : 'characteristic OUTSIDE the stencil’s reach', 0, -0.45, { align: 'center', dy: 4, size: fs, color: ok ? 'good' : 'bad', weight: 650 });
    }
    pC.text(`${n0} steps back`, -K - 0.4, n0, { size: fs, color: 'ink3' });
  }

  function drawGain() {
    if (!pG) return;
    const nu = F.params.nu, key = gkey();
    pG.clear();
    const narrow = (cvG.canvas.clientWidth || 600) < 520, fs = narrow ? 9.5 : 11;
    const n = 720;
    if (P.gain === 'abs') {
      pG.line(0, 1, Math.PI, 1, { color: 'ink3', width: 1.4, dash: [5, 4] });
      for (let r = 0; r < M.gain(key, 0, nu).length; r++) {
        const pts = [];
        for (let i = 0; i <= n; i++) { const th = (Math.PI * i) / n; pts.push([th, Math.min(2.2, M.cabs(M.gain(key, th, nu)[r]))]); }
        pG.path(pts, { color: 'accent', width: 2.4 });
        const over = pts.filter((p) => p[1] > 1 + 1e-9);
        if (over.length) pG.path(pts.map((p) => (p[1] > 1 + 1e-9 ? p : [p[0], NaN])), { color: 'bad', width: 3 });
      }
      pG.text('|G| = 1', 0.05, 1, { dy: -9, size: fs, color: 'ink3' });
      return;
    }
    pG.circle(0, 0, 1, { color: 'ink3', width: 1.4, dash: [5, 4] });
    for (let r = 0; r < M.gain(key, 0, nu).length; r++) {
      const pts = [];
      for (let i = 0; i <= n; i++) { const th = -Math.PI + (2 * Math.PI * i) / n; pts.push(M.gain(key, th, nu)[r]); }
      pG.path(pts, { color: 'accent', width: 2.4 });
      pG.path(pts.map((z) => (M.cabs(z) > 1 + 1e-9 ? z : [NaN, NaN])), { color: 'bad', width: 3.2 });
      const zpi = M.gain(key, Math.PI, nu)[r];
      pG.point(zpi[0], zpi[1], { color: M.cabs(zpi) > 1 + 1e-9 ? 'bad' : 'gold', r: 4.5, label: r ? '' : 'θ = π (sawtooth)', ldx: zpi[0] > 0.8 ? -8 : 8, ldy: 14, lalign: zpi[0] > 0.8 ? 'right' : 'left', lsize: fs });
    }
    const z0 = M.gain(key, 0, nu)[0];
    pG.point(z0[0], z0[1], { color: 'good', r: 4, label: 'θ = 0', ldx: 6, ldy: -10, lsize: fs });
    pG.text('unit circle', -0.78, 0.78, { dx: -6, dy: -6, align: 'right', size: fs, color: 'ink3' });
  }

  function readout() {
    if (P.readout === false) return;
    const rows = [];
    const q = (k, v) => (hide.has(k) ? '?' : v);
    if (pP) {
      const { o, R } = result();
      let e = 0;
      R.x.forEach((x, j) => { e = Math.max(e, Math.abs(R.u[j] - M.exact(o, x, R.time))); });
      rows.push(['steps', q('steps', R.blown ? `${R.blown}\\ (\\text{blown up})` : String(R.steps))]);
      rows.push(['$\\max|u|$', q('maxu', texNum(R.maxu))]);
      if (P.exact) rows.push(['largest error', q('error', texNum(e))]);
    }
    if (pG || !hide.has('gain')) rows.push([`largest $|G|$ at $${nuName === 'r' ? 'r' : '\\nu'} = ${F.params.nu.toFixed(2)}$`, q('gain', texNum(M.maxGain(gkey(), F.params.nu, 720)))]);
    F.readout(rows);
  }

  function drawAll() { drawProfile(); drawCone(); drawGain(); readout(); }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = !!pP && wanted.includes('t') && (P.play ?? !F.compact) && !reduced();
  const setT = (v) => { F.set('t', v); };
  const tick = (dt) => { let v = F.params.t + (dt * P.tmax) / 10; if (v > P.tmax) v = 0; setT(+v.toFixed(4)); };
  let loop = F.animate((dt) => { if (running) tick(dt); });
  if (pP && wanted.includes('t') && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) tick(dt); }, { force: running });
    } });
    F.button({ label: 'Back to t = 0', onClick: () => setT(0) });
  }
  F.onChange(() => drawAll());
  F.draw(drawAll);
  F.caption(P.caption || `A periodic domain ${L} m long. Dots: the scheme’s grid values; grey line: the exact solution. Values beyond the window are pinned to its edge in red. Shaded triangle: the grid values one point depends on, ${P.levels} steps back.`);
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!M.EQS.includes(P.eq)) p.push(`pde4-scheme: eq is one of ${M.EQS.join(', ')}`);
  else {
    if (!M.SCHEMES[P.eq].includes(P.scheme)) p.push(`pde4-scheme: for ${P.eq} the scheme is one of ${M.SCHEMES[P.eq].join(', ')}`);
    if (P.schemes != null && !(Array.isArray(P.schemes) && P.schemes.every((s) => M.SCHEMES[P.eq].includes(s)) && P.schemes.includes(P.scheme))) p.push('pde4-scheme: schemes lists schemes of this equation and includes scheme');
  }
  if (!M.PROFILES.includes(P.profile)) p.push(`pde4-scheme: profile is one of ${M.PROFILES.join(', ')}`);
  if (!(P.nu > 0 && P.nu <= P.numax && P.numax <= 3)) p.push('pde4-scheme: 0 < nu ≤ numax ≤ 3');
  if (!(Number.isInteger(P.N) && P.N >= 10 && P.N <= 400)) p.push('pde4-scheme: N is a whole number from 10 to 400');
  if (P.Ns != null && !(Array.isArray(P.Ns) && P.Ns.includes(P.N) && P.Ns.every((n) => Number.isInteger(n) && n >= 10 && n <= 400))) p.push('pde4-scheme: Ns lists grid sizes (10–400) and includes N');
  if (!(P.t >= 0 && P.t <= P.tmax && P.tmax <= 100)) p.push('pde4-scheme: 0 ≤ t ≤ tmax ≤ 100');
  if (!(Array.isArray(P.panels) && P.panels.length && P.panels.every((q) => PANELS.includes(q)))) p.push(`pde4-scheme: panels from ${PANELS.join(', ')}`);
  if (!['plane', 'abs'].includes(P.gain)) p.push('pde4-scheme: gain is plane or abs');
  if (!(Number.isInteger(P.levels) && P.levels >= 2 && P.levels <= 8)) p.push('pde4-scheme: levels is a whole number from 2 to 8');
  if (!(Array.isArray(P.ylim) && P.ylim[1] > P.ylim[0])) p.push('pde4-scheme: ylim is [min, max]');
  if (!(P.w > 0 && P.w < 4)) p.push('pde4-scheme: w lies in (0, 4)');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`pde4-scheme: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`pde4-scheme: unknown hide “${h}”`);
  return p;
}
