// Diffusion from a random walk: N walkers start at x = 0 and every tick Δt
// each hops one step Δx, right or left at random. Above, the walkers as dots
// (scattered vertically only so they can be seen). Below, the histogram of
// their positions against the Gaussian of the heat equation with
// D = Δx²/(2Δt), whose spread is √(2Dt). The walk is seeded, so a static
// picture is the same every time. Model in model/pde-1d.js (tested in
// test/pde-1d.test.mjs).
//
//   { type: 'pde-walk', params: {
//       N: 2000,             // walkers: 200, 2000 or 20000
//       dx: 1,               // step length Δx (mm)
//       dt: 1,               // tick Δt (s)
//       p: 0.5,              // chance of a step to the right (≠ ½: drift)
//       steps: 0,            // hops already taken when the picture opens
//       nmax: 400,           // the walk stops (and Play restarts it) after this many hops
//       xr: 40,              // the window is −xr … xr (mm)
//       seed: 1,
//       curve: true,         // the heat-equation Gaussian over the histogram
//       controls: null,      // true, false, or a list of: N dx p
//       play: null, readout: true,
//       hide: [],            // readouts shown as “?”: mean spread D predicted
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/pde-1d.js';

export const defaults = { N: 2000, dx: 1, dt: 1, p: 0.5, steps: 0, nmax: 400, xr: 40, seed: 1, curve: true, controls: null, play: null, readout: true, hide: [] };
const CONTROLS = ['N', 'dx', 'p'];
const HIDE = ['mean', 'spread', 'D', 'predicted'];
const f3 = (x) => String(+x.toPrecision(3));
const jitter = (i) => { let h = Math.imul(i + 1, 2654435761) >>> 0; h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; return ((h >>> 8) % 10000) / 10000; };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? ['N', 'dx'] : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('N', () => F.choice({ key: 'N', label: 'Walkers', options: [[200, '200'], [2000, '2 000'], [20000, '20 000']], value: P.N, explain: 'More walkers: a smoother histogram. Each one still moves at random.' }));
  ctl('dx', () => F.slider({ key: 'dx', label: 'Step length $\\Delta x$', min: 0.5, max: 2, step: 0.1, value: P.dx, unit: '\\mathrm{mm}', explain: 'How far a walker hops each tick. The diffusivity is $D = \\Delta x^2/(2\\Delta t)$.' }));
  ctl('p', () => F.slider({ key: 'p', label: 'Chance of a right step $p$', min: 0.3, max: 0.7, step: 0.01, value: P.p, unit: '', explain: 'At ½ the walk is fair. Otherwise the cloud drifts, at $(2p - 1)\\,\\Delta x/\\Delta t$, while it spreads.' }));

  const a = F.canvas({ aspect: 'wide', label: P.alt || 'Walkers scattered along x' });
  const pa = new Plot(a.canvas, { x: [-P.xr, P.xr], y: [0, 1], xlabel: 'x (mm)', ylabel: '', yticks: 0, xticks: 8 });
  const b = F.canvas({ aspect: 'wide', label: 'The histogram of positions against the heat-equation Gaussian' });
  const pb = new Plot(b.canvas, { x: [-P.xr, P.xr], y: [0, 0.5], xlabel: 'x (mm)', ylabel: 'fraction per mm', xticks: 8 });

  let W = null;
  const reset = () => { W = M.walkers(F.params.N, P.seed); for (let i = 0; i < P.steps; i++) M.hop(W, F.params.p); };
  reset();

  function draw() {
    const dx = F.params.dx, dt = P.dt, n = W.n, t = n * dt, D = (dx * dx) / (2 * dt);
    const narrow = (a.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    // dots
    pa.clear();
    pa.line(0, 0, 0, 1, { color: 'ink3', width: 1, dash: [3, 4] });
    const show = Math.min(W.pos.length, 800), g = pa.ctx, col = pa.color('accent');
    g.save(); g.fillStyle = col; g.globalAlpha = 0.75;
    for (let i = 0; i < show; i++) { const x = W.pos[i] * dx; if (x < -P.xr || x > P.xr) continue; g.beginPath(); g.arc(pa.X(x), pa.Y(0.06 + 0.88 * jitter(i)), 2.2, 0, 2 * Math.PI); g.fill(); }
    g.restore();
    pa.text(`${n} hops, t = ${f3(t)} s`, P.xr, 1, { color: 'ink2', align: 'right', size: fs, dx: -6, dy: 10 });
    if (W.pos.length > show) pa.text(`(${show} of ${W.pos.length} walkers drawn)`, -P.xr, 1, { color: 'ink3', size: fs - 1, dx: 6, dy: 10 });
    // histogram: bins 2Δx wide, centred on the sites this parity can occupy
    const bw = 2 * dx, counts = new Map();
    for (const m of W.pos) counts.set(m, (counts.get(m) || 0) + 1);
    const mean = (2 * F.params.p - 1) * n * dx, varP = 4 * F.params.p * (1 - F.params.p) * n * dx * dx;
    const peakG = n ? 1 / Math.sqrt(2 * Math.PI * varP) : 1 / bw;
    let peakH = 0;
    for (const c of counts.values()) peakH = Math.max(peakH, c / W.pos.length / bw);
    pb.setView([-P.xr, P.xr], [0, 1.15 * Math.max(peakH, Math.min(peakG, 2 / bw))]);
    pb.clear();
    for (const [m, c] of counts) { const x = m * dx; if (x < -P.xr - dx || x > P.xr + dx) continue; pb.rect(x - dx, 0, bw, c / W.pos.length / bw, { color: 'accent', alpha: 0.35, width: 1 }); }
    if (P.curve && n > 0) {
      pb.fn((x) => Math.exp(-((x - mean) ** 2) / (2 * varP)) / Math.sqrt(2 * Math.PI * varP), { color: 'gold', width: 2.2, samples: 500 });
      const s = Math.sqrt(varP);
      if (!hide.has('predicted')) {
        const y = 0.5 * Math.exp(-0.5) * peakG;
        pb.arrow(mean, y, mean + s, y, { color: 'gold', width: 1.5, head: 6 });
        pb.arrow(mean, y, mean - s, y, { color: 'gold', width: 1.5, head: 6 });
        pb.text(F.params.p === 0.5 ? '±√(2Dt)' : '±spread', mean, y, { color: 'gold', align: 'center', size: fs, dy: -10 });
      }
    }
    if (P.readout !== false) {
      const mo = M.moments(W.pos), q = (k, v) => (hide.has(k) ? '?' : v);
      F.readout([
        ['hops $n$', String(n)], ['$t = n\\,\\Delta t$', `${f3(t)}\\,\\text{s}`],
        ['$D = \\Delta x^2/2\\Delta t$', q('D', `${f3(D)}\\,\\text{mm}^2\\text{/s}`)],
        ['measured mean', q('mean', `${f3(mo.mean * dx)}\\,\\text{mm}`)],
        ['measured spread', q('spread', `${f3(Math.sqrt(mo.variance) * dx)}\\,\\text{mm}`)],
        [F.params.p === 0.5 ? '$\\sqrt{2Dt}$' : 'predicted spread', q('predicted', `${f3(Math.sqrt(varP))}\\,\\text{mm}`)],
      ]);
    }
  }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  let acc = 0;
  const step = (dt) => {
    acc += dt * 12;                                     // about twelve hops a second
    let k = Math.floor(acc);
    if (!k) return;
    acc -= k;
    if (W.n >= P.nmax) { reset(); k = 0; }
    for (let i = 0; i < k && W.n < P.nmax; i++) M.hop(W, F.params.p);
    draw();
  };
  let loop = F.animate((dt) => { if (running) step(dt); });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
    } });
    F.button({ label: '+10 hops', onClick: () => { for (let i = 0; i < 10 && W.n < P.nmax; i++) M.hop(W, F.params.p); draw(); } });
    F.button({ label: 'Restart', onClick: () => { W = M.walkers(F.params.N, P.seed); draw(); } });
  }
  F.onChange((k) => { if (k === 'N' || k === 'p') reset(); draw(); });
  F.draw(draw);
  F.caption(P.caption || 'A lattice random walk — a teaching model of molecular motion. Real molecules move in three dimensions with a spread of free paths and speeds; the √t growth of the spread survives all of that. Histogram bars are 2Δx wide because after n hops a walker can only sit on every other site.');
  return { get: (k) => (k === 'n' ? W.n : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (![200, 2000, 20000].includes(P.N)) p.push('pde-walk: N is 200, 2000 or 20000');
  if (!(P.dx >= 0.5 && P.dx <= 2)) p.push('pde-walk: dx lies in 0.5–2 mm');
  if (!(P.dt > 0)) p.push('pde-walk: dt must be positive');
  if (!(P.p > 0 && P.p < 1)) p.push('pde-walk: p lies strictly between 0 and 1');
  if (!(Number.isInteger(P.steps) && P.steps >= 0 && P.steps <= P.nmax)) p.push('pde-walk: steps is a whole number of hops, at most nmax');
  if (!(P.xr > 0)) p.push('pde-walk: xr must be positive');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`pde-walk: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`pde-walk: unknown hide “${h}”`);
  return p;
}
