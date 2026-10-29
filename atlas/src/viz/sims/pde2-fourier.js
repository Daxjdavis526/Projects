// A linear PDE on the whole line solved in Fourier space. Below: the
// spectrum f̂(k) of the initial profile (dashed), the multiplier G(k) that the
// equation applies to each wavenumber (gold, scaled so G = 1 sits at the top
// of f̂), and their product û(k) (blue). Above: the profile itself, initial
// (dashed) and now (blue) — what you get by adding the surviving waves back
// up. Heat damps high k (e^{−Dk²t}); the wave equation only re-phases them
// (cos ckt); Laplace's equation in the half-plane y > 0 damps them with
// height (e^{−|k|y}); a dispersive Schrödinger-type equation turns each by
// its own phase e^{−iβk²t}, so |û| never changes while the packet spreads.
// Model in model/pde2-fourier.js (closed forms checked against numerical
// synthesis in test/pde2.test.mjs).
//
//   { type: 'pde2-fourier', params: {
//       eq: 'heat',            // heat | wave | laplace | schrod
//       eqs: null,             // equations the learner may switch between, e.g. ['heat', 'wave', 'schrod']
//       profile: 'gauss',      // gauss: e^{−x²/2w²} | box: 1 for |x| < w (schrod always uses gauss)
//       w: 1,                  // the profile's width (m)
//       D: 0.5, c: 1, beta: 0.5,   // diffusivity (m²/s), wave speed (m/s), dispersion β (m²/s)
//       t: 0, tmax: 4,         // the time (s) — for laplace, the height y (m) — and its slider's top
//       x: 8, k: 8,            // the windows: −x … x (m) and −k … k (rad/m)
//       mult: true,            // draw the multiplier G(k)
//       labels: true,          // the text inside the panels (false hides it, so a picture does not name its equation)
//       controls: null,        // true, false, or a list of: eq profile w D c beta t
//       play: null, readout: true,
//       hide: [],              // readouts shown as “?”: peak spread
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/pde2-fourier.js';

export const defaults = { eq: 'heat', eqs: null, profile: 'gauss', w: 1, D: 0.5, c: 1, beta: 0.5, t: 0, tmax: 4, x: 8, k: 8, mult: true, labels: true, controls: null, play: null, readout: true, hide: [] };
const CONTROLS = ['eq', 'profile', 'w', 'D', 'c', 'beta', 't'];
const HIDE = ['peak', 'spread'];
const LABEL = { heat: 'heat  uₜ = D uₓₓ', wave: 'wave  uₜₜ = c² uₓₓ', laplace: 'Laplace in y > 0', schrod: 'dispersive  uₜ = iβ uₓₓ' };
const MULT = { heat: 'e^{-Dk^2t}', wave: '\\cos(ckt)', laplace: 'e^{-|k|y}', schrod: 'e^{-i\\beta k^2t}' };
const f3 = (x) => (!Number.isFinite(x) ? '\\text{—}' : String(+x.toPrecision(3)));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const eqs = Array.isArray(P.eqs) && P.eqs.length ? P.eqs : [P.eq];
  const sVar = () => (F.params.eq === 'laplace' ? 'y' : 't');
  const wanted = P.controls === true || (P.controls === null && !F.compact)
    ? [...(eqs.length > 1 ? ['eq'] : []), 'profile', ...new Set(eqs.map((e) => ({ heat: 'D', wave: 'c', laplace: null, schrod: 'beta' }[e])).filter(Boolean)), 't']
    : Array.isArray(P.controls) ? P.controls : [];
  const nodes = {};
  const ctl = (key, make) => (wanted.includes(key) ? (nodes[key] = make()) : (F.params[key] = P[key]));
  ctl('eq', () => F.choice({ key: 'eq', label: 'Equation', options: eqs.map((e) => [e, LABEL[e]]), value: P.eq, explain: 'The same initial profile; each equation treats every wavenumber $k$ by its own rule.' }));
  ctl('profile', () => F.choice({ key: 'profile', label: 'Initial profile', options: [['gauss', 'Gaussian'], ['box', 'square']], value: P.profile, explain: 'A Gaussian’s spectrum is another Gaussian; a square’s, $2\\sin(kw)/k$, reaches out to high $k$ because of its jumps.' }));
  ctl('w', () => F.slider({ key: 'w', label: 'Width $w$', min: 0.3, max: 2.5, step: 0.05, value: P.w, unit: '\\mathrm{m}', explain: 'Narrow in $x$ means wide in $k$: the spectrum’s width is about $1/w$.' }));
  ctl('D', () => F.slider({ key: 'D', label: 'Diffusivity $D$', min: 0.05, max: 2, step: 0.05, value: P.D, unit: '\\mathrm{m^2/s}', explain: 'Heat: wavenumber $k$ decays at the rate $Dk^2$.' }));
  ctl('c', () => F.slider({ key: 'c', label: 'Speed $c$', min: 0.2, max: 3, step: 0.1, value: P.c, unit: '\\mathrm{m/s}', explain: 'Wave: each wavenumber oscillates at $\\omega = ck$ — all at the same speed $\\omega/k = c$.' }));
  ctl('beta', () => F.slider({ key: 'beta', label: 'Dispersion $\\beta$', min: 0.05, max: 2, step: 0.05, value: P.beta, unit: '\\mathrm{m^2/s}', explain: 'Dispersive: wavenumber $k$ turns at $\\omega = \\beta k^2$, so short waves outrun long ones.' }));
  ctl('t', () => F.slider({ key: 't', label: P.eq === 'laplace' && eqs.length === 1 ? 'Height $y$' : 'Time $t$ (height $y$ for Laplace)', min: 0, max: P.tmax, step: P.tmax / 200, value: P.t, unit: P.eq === 'laplace' && eqs.length === 1 ? '\\mathrm{m}' : '', explain: 'How long the equation has acted — or, for Laplace’s equation, how high above the line $y = 0$ you look.' }));
  const showRelevant = () => { for (const [k, e] of [['D', 'heat'], ['c', 'wave'], ['beta', 'schrod']]) if (nodes[k]?.node) nodes[k].node.style.display = F.params.eq === e ? '' : 'none'; };

  const a = F.canvas({ aspect: 'wide', label: P.alt || 'The profile u in x-space, initially and now' });
  const px = new Plot(a.canvas, { x: [-P.x, P.x], y: [-0.3, 1.2], xlabel: 'x (m)', ylabel: 'u', axesAt: 'edge' });
  const b = F.canvas({ aspect: 'wide', label: 'The spectrum in k-space: initial, multiplier and now' });
  const pk = new Plot(b.canvas, { x: [-P.k, P.k], y: [-0.5, 2.6], xlabel: 'k (rad/m)', ylabel: 'û(k)', axesAt: 'edge' });

  function draw() {
    const eq = F.params.eq, pr = eq === 'schrod' ? 'gauss' : F.params.profile, w = +F.params.w, s = +F.params.t;
    const p = { D: +F.params.D, c: +F.params.c, beta: +F.params.beta };
    const narrow = (a.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    // x-space
    const N = narrow ? 241 : 401, xs = [], re = [], im = [], ab = [];
    for (let i = 0; i < N; i++) { const x = -P.x + (2 * P.x * i) / (N - 1); const [r, j] = M.solve(pr, w, eq, s, p, x); xs.push(x); re.push(r); im.push(j); ab.push(Math.hypot(r, j)); }
    const top = Math.max(1, ...ab) * 1.15;
    px.setView([-P.x, P.x], [eq === 'schrod' || eq === 'wave' ? -0.55 * top : -0.12 * top, top]);
    px.clear();
    px.fn((x) => M.f0(pr, w, x), { color: 'ink3', width: 1.4, dash: [5, 4], samples: 600 });
    if (eq === 'schrod') {
      px.path(xs.map((x, i) => [x, ab[i]]), { color: 'gold', width: 2 });
      if (P.labels !== false) px.text('|u|', xs[Math.round(N * 0.5)], ab[Math.round(N * 0.5)], { color: 'gold', size: fs, dx: 8, dy: -10 });
    }
    px.path(xs.map((x, i) => [x, re[i]]), { color: 'accent', width: 2.4 });
    if (P.labels !== false) px.text(eq === 'schrod' ? 'Re u (blue), |u| (gold)' : eq === 'laplace' ? `u along the line y = ${f3(s)} m` : `u at t = ${f3(s)} s`, P.x, top, { color: 'ink2', align: 'right', size: fs, dx: -6, dy: 12 });
    // k-space
    const F0 = M.fhat(pr, w, 0);
    pk.setView([-P.k, P.k], [-0.45 * F0, 1.25 * F0]);
    pk.clear();
    pk.fn((k) => M.fhat(pr, w, k), { color: 'ink3', width: 1.4, dash: [5, 4], samples: 800 });
    if (P.mult !== false) pk.fn((k) => F0 * M.multiplier(eq, k, s, p)[0], { color: 'gold', width: 1.8, samples: 800 });
    pk.fn((k) => M.fhat(pr, w, k) * M.multiplier(eq, k, s, p)[0], { color: 'accent', width: 2.4, samples: 800 });
    if (eq === 'schrod') pk.fn((k) => M.fhat(pr, w, k) * M.multiplier(eq, k, s, p)[1], { color: 'violet', width: 1.4, dash: [3, 3], samples: 800 });
    if (P.labels !== false) pk.text(`gold: multiplier ${eq === 'schrod' ? '(real part) ' : ''}× f̂(0)`, P.k, 1.25 * F0, { color: 'gold', align: 'right', size: fs, dx: -6, dy: 12 });
    if (P.labels !== false) pk.text(eq === 'schrod' ? 'blue, violet: Re û, Im û' : 'blue: û = f̂ G', P.k, 1.25 * F0, { color: 'accent', align: 'right', size: fs, dx: -6, dy: 28 });
    if (P.readout !== false) {
      const q = (k, v) => (hide.has(k) ? '?' : v);
      F.readout([
        ['multiplier $G(k)$', `$${MULT[eq]}$`],
        [eq === 'laplace' ? 'height $y$' : 'time $t$', `${f3(s)}\\,\\text{${eq === 'laplace' ? 'm' : 's'}}`],
        ['peak $|u|$', q('peak', f3(Math.max(...ab)))],
        ['rms half-width', q('spread', `${f3(M.spread(xs, ab))}\\,\\text{m}`)],
      ].map(([l, v]) => [l, v.startsWith('$') ? v.slice(1, -1) : v]));
    }
    showRelevant();
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? false) && !F.compact && !reduced();
  const step = (dt) => {
    let s = +F.params.t + dt * (P.tmax / 8);
    if (s > P.tmax) s = 0;
    F.params.t = +s.toFixed(4);
    if (nodes.t?.set) nodes.t.set(F.params.t);
    draw();
  };
  let loop = F.animate((dt) => { if (running) step(dt); });
  if (!F.compact && P.play !== false && wanted.includes('t')) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
    } });
  }
  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || 'Exact solutions on an infinite line (Laplace: the bounded solution in the half-plane above the line). The window is a piece of it. Spectrum convention: f̂(k) = ∫ f(x) e^(−ikx) dx.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!M.EQS.includes(P.eq)) p.push(`pde2-fourier: eq is one of ${M.EQS.join(', ')}`);
  if (P.eqs != null && !(Array.isArray(P.eqs) && P.eqs.every((e) => M.EQS.includes(e)) && P.eqs.includes(P.eq))) p.push('pde2-fourier: eqs lists known equations and includes eq');
  if (!['gauss', 'box'].includes(P.profile)) p.push('pde2-fourier: profile is gauss or box');
  if (!(P.w >= 0.3 && P.w <= 2.5)) p.push('pde2-fourier: w lies in 0.3–2.5');
  for (const [k, lo, hi] of [['D', 0.05, 2], ['c', 0.2, 3], ['beta', 0.05, 2]]) if (!(P[k] >= lo && P[k] <= hi)) p.push(`pde2-fourier: ${k} lies in ${lo}–${hi}`);
  if (!(P.tmax > 0 && P.t >= 0 && P.t <= P.tmax)) p.push('pde2-fourier: 0 ≤ t ≤ tmax');
  if (!(P.x > 0 && P.k > 0)) p.push('pde2-fourier: x and k windows must be positive');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`pde2-fourier: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`pde2-fourier: unknown hide “${h}”`);
  return p;
}
