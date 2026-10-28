// Burgers' equation u_t + u u_x = 0: characteristics that cross, and the shock
// that replaces the crossing. Above, u(x, t) at the chosen moment over the
// initial profile (dashed): the folded, three-valued profile the
// characteristics alone would give (violet, dashed), and the physical weak
// solution with its shocks (blue, each shock marked in orange). Optional dots
// from an upwind scheme — conservative (right shock speed) or non-conservative
// (wrong speed). Below, the x–t plane: the straight characteristics
// x = ξ + u0(ξ)t (faint where they run on past the shock that swallowed them),
// the first crossing at the breaking time t* = −1/min u0′ (gold), and the shock
// paths (orange), which move at the Rankine–Hugoniot speed (u⁻ + u⁺)/2.
// Exact solution by the Lax–Oleinik formula in model/pde3-burgers.js
// (tested in test/pde3-burgers.test.mjs).
//
//   { type: 'pde3-burgers', params: {
//       profile: 'gauss',      // gauss: A e^(−x²/w²) | sine: A sin(x/w) | box: A on |x| < w | step: uL then uR | nwave: A (x/w) e^((1 − x²/w²)/2)
//       profiles: null,        // profiles the learner may switch between, e.g. ['gauss', 'box', 'nwave']
//       A: 1, w: 1,            // amplitude (the speed of the fastest characteristic, m/s) and width (m)
//       uL: 1, uR: 0,          // step: the values left and right of x = 0 (m/s)
//       t: 0, tmax: 4,         // the moment shown (s); the height of the x–t panel (s)
//       x: [-4, 6],            // the window (m)
//       fold: true,            // the folded profile the characteristics alone would give
//       shock: true,           // the weak (entropy) solution and its shock paths; false: characteristics only
//       chars: true,           // the characteristics in the x–t panel
//       nchars: 26,            // how many
//       tstar: true,           // mark the first crossing (the breaking point)
//       scheme: 'none',        // none | conservative | nonconservative: upwind dots over the profile
//       xt: true,              // the x–t panel
//       controls: null,        // true, false, or a list of: profile A uL uR t scheme fold
//       play: null,            // animate (default: in the Explore step)
//       readout: true,
//       hide: [],              // readouts shown as “?”: tstar shock speed sides
//   } }
// The sim's `get('t')` is the time slider, so a slider item can ask for “the
// moment the first characteristics cross”.

import { Plot } from '../plot.js';
import * as M from '../model/pde3-burgers.js';

export const defaults = { profile: 'gauss', profiles: null, A: 1, w: 1, uL: 1, uR: 0, t: 0, tmax: 4, x: [-4, 6], fold: true, shock: true, chars: true, nchars: 26, tstar: true, scheme: 'none', xt: true, controls: null, play: null, readout: true, hide: [] };
const CONTROLS = ['profile', 'A', 'uL', 'uR', 't', 'scheme', 'fold'];
const HIDE = ['tstar', 'shock', 'speed', 'sides'];
const SCHEMES = ['none', 'conservative', 'nonconservative'];
const LABEL = { gauss: 'a bump', sine: 'a sine wave', box: 'a square pulse', step: 'a step (Riemann problem)', nwave: 'up and down (sonic boom)' };
const f3 = (x) => (!Number.isFinite(x) ? '—' : Math.abs(x) < 5e-4 ? '0' : String(+x.toPrecision(3)));

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const profiles = Array.isArray(P.profiles) && P.profiles.length ? P.profiles : [P.profile];
  const auto = [...(profiles.length > 1 ? ['profile'] : []), ...(profiles.some((p) => p !== 'step') ? ['A'] : []), ...(profiles.includes('step') ? ['uL', 'uR'] : []), 't'];
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? auto : Array.isArray(P.controls) ? P.controls : [];
  const nodes = {};
  const ctl = (key, make) => (wanted.includes(key) ? (nodes[key] = make()) : (F.params[key] = P[key]));
  const [XL, XR] = P.x, TM = P.tmax;

  ctl('profile', () => F.choice({ key: 'profile', label: 'Initial profile', options: profiles.map((p) => [p, LABEL[p]]), value: P.profile, explain: 'What $u$ looks like at $t = 0$. Each point of it sets off at its own speed $u$.' }));
  ctl('A', () => F.slider({ key: 'A', label: 'Amplitude $A$', min: -1.5, max: 1.5, step: 0.05, value: P.A, unit: '\\mathrm{m/s}', explain: 'The largest value of $u$ — the speed of the fastest characteristic. Negative values move left.' }));
  ctl('uL', () => F.slider({ key: 'uL', label: 'Left value $u_L$', min: -1, max: 2, step: 0.05, value: P.uL, unit: '\\mathrm{m/s}', explain: 'The value of $u$ for $x < 0$ at $t = 0$.' }));
  ctl('uR', () => F.slider({ key: 'uR', label: 'Right value $u_R$', min: -1, max: 2, step: 0.05, value: P.uR, unit: '\\mathrm{m/s}', explain: 'The value of $u$ for $x > 0$ at $t = 0$. If $u_L > u_R$ a shock forms at once; if $u_L < u_R$ a fan opens.' }));
  ctl('t', () => F.slider({ key: 't', label: 'Time $t$', min: 0, max: TM, step: TM / 200, value: P.t, unit: '\\mathrm{s}', explain: 'The moment shown above, and the gold line below.' }));
  ctl('scheme', () => F.choice({ key: 'scheme', label: 'Numerical scheme', options: [['none', 'none'], ['conservative', 'conservative upwind'], ['nonconservative', 'non-conservative upwind']], value: P.scheme, explain: 'Dots: a first-order upwind computation on 400 cells. The conservative form updates $u$ by flux differences; the other differences $u\\,u_x$ directly.' }));
  ctl('fold', () => F.toggle({ key: 'fold', label: 'Show the folded profile', value: P.fold, explain: 'Where each characteristic alone would carry its value: past the breaking time it folds over and gives three values of $u$ at one $x$.' }));
  const showRelevant = () => {
    const step = F.params.profile === 'step';
    for (const k of ['uL', 'uR']) if (nodes[k]?.node) nodes[k].node.style.display = step ? '' : 'none';
    if (nodes.A?.node) nodes.A.node.style.display = step ? 'none' : '';
  };

  const top = F.canvas({ aspect: 'wide', label: P.alt || 'The solution u(x, t) of Burgers’ equation at the chosen time' });
  const tp = new Plot(top.canvas, { x: [XL, XR], y: [-0.2, 1.2], xlabel: 'x (m)', ylabel: 'u (m/s)', xticks: 10, axesAt: 'edge' });
  const bot = P.xt ? F.canvas({ aspect: 'wide', label: 'The x–t plane: characteristics, the first crossing and the shock paths' }) : null;
  const xp = bot ? new Plot(bot.canvas, { x: [XL, XR], y: [0, TM], xlabel: 'x (m)', ylabel: 't (s)', xticks: 10, axesAt: 'edge' }) : null;

  const opts = () => {
    const p = F.params;
    return { profile: p.profile, A: p.A, w: P.w, uL: p.uL, uR: p.uR };
  };

  // everything that depends on the profile (not on t), recomputed only when it changes
  let cache = { key: '' };
  function analyse() {
    const o = opts(), key = JSON.stringify(o);
    if (key === cache.key) return cache;
    const S = Math.max(M.maxSpeed(o), 1e-6), pad = S * TM + 1;
    const solver = M.solver(o, XL - pad, XR + pad, 6000);
    const br = M.breaking(o);
    // the y range from the initial profile
    let lo = 0, hi = 0;
    for (let i = 0; i <= 600; i++) { const v = M.u0(o, XL + (i / 600) * (XR - XL)); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    if (hi - lo < 1e-6) hi = lo + 1;
    // feet of the characteristics: the window, widened to catch those that drift in
    const n = Math.max(6, Math.round(P.nchars)), feet = [];
    const d = (XR - XL) / n;
    for (let xi = XL - d * Math.ceil(S * TM / d); xi <= XR + d * Math.ceil(S * TM / d) + 1e-9; xi += d) feet.push(xi);
    // jumps launch a fan of characteristics: add a few from either side of each jump
    if (o.profile === 'step' || o.profile === 'box') {
      const jumps = o.profile === 'step' ? [0] : [-P.w, P.w];
      for (const j of jumps) for (const e of [-1e-9, 1e-9]) feet.push(j + e);
    }
    // where each characteristic is swallowed by a shock (t_end), sampled on 90 times
    const ends = feet.map((xi) => {
      if (!P.shock) return TM;
      for (let k = 1; k <= 90; k++) {
        const t = (k / 90) * TM, x = M.charX(o, xi, t);
        if (Math.abs(solver.ystar(x, t) - xi) > 1e-3 * (1 + S * t)) return ((k - 0.5) / 90) * TM;
      }
      return TM;
    });
    // shock paths: shocks found at 90 times, joined to their nearest predecessor
    const segs = [];
    if (P.shock) {
      let prev = [];
      const nt = 90;
      for (let k = 0; k <= nt; k++) {
        const t = Math.max(1e-3 * TM, (k / nt) * TM);
        const sh = solver.shocks(t, XL - 0.5, XR + 0.5, 260);
        for (const s of sh) {
          let best = null, bd = Infinity;
          for (const q of prev) { const dd = Math.abs(q.x - s.x); if (dd < bd) { bd = dd; best = q; } }
          if (best && bd < 3 * S * (TM / nt) + 0.1) segs.push([[best.x, best.t], [s.x, t]]);
          else if (br && br.t <= t) segs.push([[s.x, t], [s.x, t]]);
        }
        prev = sh.map((s) => ({ x: s.x, t }));
      }
    }
    cache = { key, o, solver, br, lo, hi, feet, ends, segs, S };
    return cache;
  }

  function drawTop() {
    const C = analyse(), o = C.o, t = F.params.t;
    const span = C.hi - C.lo;
    tp.setView([XL, XR], [C.lo - 0.12 * span, C.hi + 0.22 * span]);
    tp.clear();
    const narrow = (top.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    tp.line(XL, 0, XR, 0, { color: 'ink3', width: 1 });
    tp.fn((x) => M.u0(o, x), { color: 'ink3', width: 1.3, dash: [5, 4], samples: 900 });
    // the folded profile: each foot carried to x = ξ + u0(ξ)t at height u0(ξ)
    if (F.params.fold && t > 0) {
      const a = XL - C.S * t - 0.5, b = XR + 0.5;
      tp.curve((xi) => M.charX(o, xi, t), (xi) => M.u0(o, xi), a, b, { color: 'violet', width: 1.6, dash: [4, 3], samples: 1600 });
      // a jump fans out: its vertical edge is carried too
      if (o.profile === 'step' || o.profile === 'box') {
        const js = o.profile === 'step' ? [[0, o.uL, o.uR]] : [[-P.w, 0, o.A], [P.w, o.A, 0]];
        for (const [j, l, r] of js) tp.curve((s) => j + (l + s * (r - l)) * t, (s) => l + s * (r - l), 0, 1, { color: 'violet', width: 1.6, dash: [4, 3], samples: 40 });
      }
    }
    if (P.shock) {
      tp.fn((x) => C.solver.u(x, t), { color: 'accent', width: 2.4, samples: Math.min(700, Math.round(top.canvas.clientWidth || 600)) });
      for (const s of C.solver.shocks(t, XL, XR, 300)) {
        tp.line(s.x, s.uR, s.x, s.uL, { color: 'warn', width: 3 });
        tp.point(s.x, s.uL, { color: 'warn', r: 3 });
      }
    }
    if (F.params.scheme && F.params.scheme !== 'none') {
      const R = M.scheme(o, t, XL - C.S * TM - 1, XR + C.S * TM + 1, 400 + 40 * Math.round((C.S * TM + 1) * 2), F.params.scheme);
      const col = F.params.scheme === 'conservative' ? 'good' : 'bad';
      for (let j = 0; j < R.xs.length; j += 2) if (R.xs[j] >= XL && R.xs[j] <= XR) tp.point(R.xs[j], R.u[j], { color: col, r: 1.8 });
      tp.text(F.params.scheme === 'conservative' ? 'dots: conservative upwind' : 'dots: non-conservative upwind', XL, tp.vy1, { color: col, size: fs, dx: 6, dy: 10 });
    }
    tp.text(`t = ${t.toFixed(2)} s`, XR, tp.vy1, { color: 'ink2', align: 'right', size: fs, dx: -6, dy: 10 });
  }

  function drawXT() {
    if (!xp) return;
    const C = analyse(), o = C.o, t = F.params.t;
    xp.clear();
    const narrow = (bot.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    const g = xp.ctx;
    g.save(); xp._clip();
    if (P.chars) {
      C.feet.forEach((xi, i) => {
        const te = C.ends[i], v = M.u0(o, xi);
        xp.line(xi, 0, xi + v * te, te, { color: 'ink2', width: 1.1, alpha: 0.75 });
        if (te < TM) xp.line(xi + v * te, te, xi + v * TM, TM, { color: 'ink3', width: 1, alpha: 0.28, dash: [3, 3] });
      });
      // a fan from each upward jump
      if (P.shock && (o.profile === 'step' || o.profile === 'box')) {
        const js = o.profile === 'step' ? [[0, o.uL, o.uR]] : [[-P.w, 0, o.A], [P.w, o.A, 0]];
        for (const [j, l, r] of js) if (r > l) for (let k = 1; k < 6; k++) {
          const s = l + (k / 6) * (r - l);
          let te = TM;
          for (let q = 1; q <= 60; q++) { const tt = (q / 60) * TM, x = j + s * tt; if (Math.abs(C.solver.u(x, tt) - s) > 1e-3 * (1 + C.S)) { te = ((q - 0.5) / 60) * TM; break; } }
          xp.line(j, 0, j + s * te, te, { color: 'teal', width: 1.1, alpha: 0.8 });
        }
      }
    }
    for (const sgm of C.segs) xp.path(sgm, { color: 'warn', width: 3 });
    g.restore();
    if (P.tstar && C.br && C.br.t <= TM) {
      xp.point(C.br.x, C.br.t, { color: 'gold', r: 5 });
      if (!hide.has('tstar')) xp.text(C.br.t > 0 ? 'first crossing' : 'shock at once', C.br.x, C.br.t, { color: 'gold', size: fs, dx: C.br.x > (XL + XR) / 2 ? -10 : 10, dy: C.br.t > 0.85 * TM ? 12 : -12, align: C.br.x > (XL + XR) / 2 ? 'right' : 'left', weight: 650 });
    }
    xp.line(XL, t, XR, t, { color: 'gold', width: 1.6, dash: [6, 4] });
  }

  function readout() {
    if (P.readout === false) return;
    const C = analyse(), t = F.params.t, q = (k, v) => (hide.has(k) ? '?' : v);
    const rows = [['$t$', `${t.toFixed(2)}\\,\\text{s}`]];
    rows.push(['breaking time $t^*$', q('tstar', C.br ? `${f3(C.br.t)}\\,\\text{s}` : '\\text{never}')]);
    if (P.shock) {
      const sh = C.solver.shocks(t, XL, XR, 300);
      if (!sh.length) rows.push(['shocks', q('shock', t < (C.br?.t ?? Infinity) ? '\\text{none yet}' : '\\text{none in view}')]);
      sh.slice(0, 2).forEach((s, i) => {
        const tag = sh.length > 1 ? (i ? ' (2nd)' : ' (1st)') : '';
        rows.push([`shock at $x$${tag}`, q('shock', `${f3(s.x)}\\,\\text{m}`)]);
        rows.push([`$u^-,\\ u^+$${tag}`, q('sides', `${f3(s.uL)},\\ ${f3(s.uR)}\\,\\text{m/s}`)]);
        rows.push([`speed $\\tfrac12(u^- + u^+)$${tag}`, q('speed', `${f3(s.s)}\\,\\text{m/s}`)]);
      });
    }
    F.readout(rows);
  }

  function drawAll() { drawTop(); drawXT(); readout(); }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  const setT = (v) => { if (wanted.includes('t')) F.set('t', v); else { F.params.t = v; drawAll(); } };
  const step = (dt) => { let v = F.params.t + (dt * TM) / 8; if (v > TM) v = 0; setT(+v.toFixed(4)); };
  let loop = F.animate((dt) => { if (running) step(dt); });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
    } });
    F.button({ label: 'Back to t = 0', onClick: () => setT(0) });
  }
  F.onChange((k) => { if (k === 'profile') showRelevant(); drawAll(); });
  F.draw(drawAll);
  showRelevant();
  F.caption(P.caption || 'Exact solution of the inviscid Burgers equation on an infinite line (Lax–Oleinik formula); the window is a piece of it. Grey: characteristics, faint and dashed past the shock that absorbed them; teal: a fan from an upward jump; orange: shocks. Real fluids have a little viscosity, which gives a shock a small but nonzero thickness.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!M.PROFILES.includes(P.profile)) p.push(`pde3-burgers: profile is one of ${M.PROFILES.join(', ')}`);
  if (P.profiles != null && !(Array.isArray(P.profiles) && P.profiles.every((q) => M.PROFILES.includes(q)) && P.profiles.includes(P.profile))) p.push('pde3-burgers: profiles lists known profiles and includes profile');
  if (!(Array.isArray(P.x) && P.x.length === 2 && P.x[1] > P.x[0])) p.push('pde3-burgers: x is a window [min, max]');
  if (!(P.tmax > 0)) p.push('pde3-burgers: tmax must be positive');
  if (!(P.t >= 0 && P.t <= P.tmax)) p.push('pde3-burgers: t must lie in [0, tmax]');
  if (!(P.w > 0)) p.push('pde3-burgers: w must be positive');
  if (!(Math.abs(P.A) <= 1.5)) p.push('pde3-burgers: A lies in [−1.5, 1.5]');
  if (!(P.uL >= -1 && P.uL <= 2 && P.uR >= -1 && P.uR <= 2)) p.push('pde3-burgers: uL and uR lie in [−1, 2]');
  if (!SCHEMES.includes(P.scheme)) p.push(`pde3-burgers: scheme is one of ${SCHEMES.join(', ')}`);
  if (!(Number.isInteger(P.nchars) && P.nchars >= 6 && P.nchars <= 80)) p.push('pde3-burgers: nchars is a whole number from 6 to 80');
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`pde3-burgers: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`pde3-burgers: unknown hide “${h}”`);
  return p;
}
