// A 1D PDE player: one initial profile, evolved exactly by the transport, the
// variable-speed transport, the wave or the heat equation on the whole line.
// Above, u(x, t) at the chosen moment over the initial profile (dashed). Below,
// the x–t plane: the solution as shading (blue above zero, orange below), the
// characteristics (lines x − ct = const for transport; curves dx/dt = c(x);
// both families x ∓ ct for waves; none for heat), the current time as a gold
// line, and an optional draggable probe with its domain of dependence: one
// characteristic traced back, a wave's backward light-cone triangle, or for
// heat the whole line below it. Exact solutions in model/pde-1d.js
// (tested in test/pde-1d.test.mjs).
//
//   { type: 'pde-player', params: {
//       mode: 'transport',      // transport | variable | wave | heat
//       modes: null,            // modes the learner may switch between, e.g. ['transport', 'wave', 'heat']
//       profile: 'gauss',       // gauss | box | tri | rough (a bump with a fine ripple)
//       A: 1, w: 1, x0: 0,      // the initial profile A·p((x − x0)/w)
//       c: 1,                   // transport and wave speed (m/s); variable: the base speed (for 'stretch', the rate a in c = a x, 1/s)
//       lambda: 0,              // transport: decay rate λ in u_t + c u_x = −λu (1/s)
//       speed: 'river',         // variable: stretch | river (a reach where the flow slows to `slow`·c, between x = −2 and 3)
//       slow: 0.35,
//       init: 'pluck',          // wave: pluck (displaced, released from rest) | strike (flat, given a velocity A·p) | right (one pulse moving right)
//       D: 0.5,                 // heat: diffusivity (m²/s)
//       t: 0, tmax: 5,          // the moment shown (s); the height of the x–t panel (s)
//       x: [-10, 10],           // the window (m)
//       xt: true,               // the x–t panel
//       chars: true, sheet: true,   // characteristics; the solution shaded in the x–t plane
//       probe: null,            // [x, t]: a draggable probe with its domain of dependence
//       halves: false,          // wave: the right- and left-moving parts, dashed
//       flux: false,            // transport, heat: flux arrows (q = cu or q = −D u_x) along the bottom of the profile
//       energy: false,          // wave: the energy density ½(u_t² + c²u_x²), shaded under the axis
//       far: null,              // heat: a distant x where the readout shows u — the infinite speed of the model
//       tag: true,              // transport, variable: a dot riding the characteristic from the peak
//       controls: null,         // true, false, or a list of: mode profile init speed c lambda slow D w t
//       play: null,             // animate (default: in the Explore step, not in a problem)
//       readout: true,
//       hide: [],               // readouts shown as “?”: u peak energy max area spread far foot
//   } }

import { Plot, themeColors } from '../plot.js';
import * as M from '../model/pde-1d.js';

export const defaults = { mode: 'transport', modes: null, profile: 'gauss', A: 1, w: 1, x0: 0, c: 1, lambda: 0, speed: 'river', slow: 0.35, init: 'pluck', D: 0.5, t: 0, tmax: 5, x: [-10, 10], xt: true, chars: true, sheet: true, probe: null, halves: false, flux: false, energy: false, far: null, tag: true, controls: null, play: null, readout: true, hide: [] };
const MODES = ['transport', 'variable', 'wave', 'heat'];
const MODE_LABEL = { transport: 'transport', variable: 'variable speed', wave: 'wave', heat: 'heat' };
const CONTROLS = ['mode', 'profile', 'init', 'speed', 'c', 'lambda', 'slow', 'D', 'w', 't'];
const DEFAULT_CONTROLS = { transport: ['profile', 'c', 't'], variable: ['speed', 'c', 't'], wave: ['init', 'profile', 'c', 't'], heat: ['profile', 'D', 't'] };
const HIDE = ['u', 'peak', 'energy', 'max', 'area', 'spread', 'far', 'foot'];
const f3 = (x) => (!Number.isFinite(x) ? '\\infty' : x === 0 ? '0' : Math.abs(x) >= 1e4 || Math.abs(x) < 1e-3 ? texExp(x) : String(+x.toPrecision(3)));
function texExp(x) { const [m, e] = x.toExponential(2).split('e'); return `${+m}\\times10^{${+e}}`; }

function rgbOf(css) {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const g = c.getContext('2d'); g.fillStyle = css; g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]];
  } catch { return [92, 157, 255]; }
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const modes = Array.isArray(P.modes) && P.modes.length ? P.modes : [P.mode];
  const wanted = P.controls === true || (P.controls === null && !F.compact)
    ? [...(modes.length > 1 ? ['mode'] : []), ...(modes.length > 1 ? [...new Set(modes.flatMap((m) => DEFAULT_CONTROLS[m]))] : DEFAULT_CONTROLS[P.mode])]
    : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  const [XL, XR] = P.x;
  const TM = P.tmax;

  ctl('mode', () => F.choice({ key: 'mode', label: 'Equation', options: modes.map((m) => [m, MODE_LABEL[m]]), value: P.mode, explain: 'The same initial profile, evolved by a different law.' }));
  ctl('profile', () => F.choice({ key: 'profile', label: 'Initial profile', options: [['gauss', 'bump'], ['box', 'square'], ['tri', 'triangle'], ['rough', 'rippled']], value: P.profile, explain: 'What $u$ looks like at $t = 0$. The square has jumps, the triangle has corners.' }));
  ctl('init', () => F.choice({ key: 'init', label: 'Start the string by', options: [['pluck', 'displacing it'], ['strike', 'striking it'], ['right', 'one pulse moving right']], value: P.init, explain: 'Displaced from rest: $u = f$, $u_t = 0$. Struck while flat: $u = 0$, $u_t = g$. One pulse: $u_t = -c f\'$.' }));
  ctl('speed', () => F.choice({ key: 'speed', label: 'Speed field', options: [['river', 'a slow reach'], ['stretch', '$c = a x$']], value: P.speed, explain: 'A river slowing where it widens, or a flow that speeds up in proportion to $x$.' }));
  ctl('c', () => F.slider(P.mode === 'variable' && P.speed === 'stretch'
    ? { key: 'c', label: 'Rate $a$', min: 0.1, max: 1, step: 0.05, value: P.c, unit: '\\mathrm{s^{-1}}', explain: 'In $c(x) = a x$: the farther from $x = 0$, the faster the flow.' }
    : P.mode === 'wave' || modes.length > 1 ? { key: 'c', label: 'Wave speed $c$', min: 0.5, max: 4, step: 0.1, value: P.c, unit: '\\mathrm{m/s}', explain: 'How fast each half of the disturbance runs along the string.' }
      : P.mode === 'variable' ? { key: 'c', label: 'Speed outside the reach $c$', min: 0.5, max: 3, step: 0.1, value: P.c, unit: '\\mathrm{m/s}', explain: 'The flow speed upstream and downstream of the slow reach.' }
        : { key: 'c', label: 'Speed $c$', min: -3, max: 3, step: 0.1, value: P.c, unit: '\\mathrm{m/s}', explain: 'Positive: the profile is carried toward $+x$. Negative: toward $-x$.' }));
  ctl('lambda', () => F.slider({ key: 'lambda', label: 'Decay rate $\\lambda$', min: 0, max: 1.5, step: 0.05, value: P.lambda, unit: '\\mathrm{s^{-1}}', explain: 'In $u_t + c u_x = -\\lambda u$: the substance decays as it rides along.' }));
  ctl('slow', () => F.slider({ key: 'slow', label: 'Speed in the reach', min: 0.15, max: 1, step: 0.05, value: P.slow, unit: '\\times c', explain: 'The fraction of $c$ the flow keeps in the slow reach (shaded).' }));
  ctl('D', () => F.slider({ key: 'D', label: 'Diffusivity $D$', min: 0.05, max: 3, step: 0.05, value: P.D, unit: '\\mathrm{m^2/s}', explain: 'How fast the profile spreads: its width grows like $\\sqrt{2Dt}$.' }));
  ctl('w', () => F.slider({ key: 'w', label: 'Initial width $w$', min: 0.2, max: 3, step: 0.05, value: P.w, unit: '\\mathrm{m}', explain: 'The half-width of the initial profile.' }));
  ctl('t', () => F.slider({ key: 't', label: 'Time $t$', min: 0, max: TM, step: TM / 200, value: P.t, unit: '\\mathrm{s}', explain: 'The moment shown above, and the gold line below.' }));

  const top = F.canvas({ aspect: 'wide', label: P.alt || 'The solution u(x, t) at the chosen time' });
  const tp = new Plot(top.canvas, { x: [XL, XR], y: [-0.2, 1.2], xlabel: 'x (m)', ylabel: 'u', xticks: 10 });
  const bot = P.xt ? F.canvas({ aspect: 'wide', label: 'The x–t plane: the solution as shading, the characteristics, the current time' }) : null;
  const xp = bot ? new Plot(bot.canvas, { x: [XL, XR], y: [0, TM], xlabel: 'x (m)', ylabel: 't (s)', xticks: 10, axesAt: 'edge' }) : null;

  const probe = P.probe ? { x: P.probe[0], t: P.probe[1] } : null;
  if (probe && xp) {
    xp.handle(() => [probe.x, probe.t], (x, t) => { probe.x = Math.max(XL, Math.min(XR, x)); probe.t = Math.max(0.02 * TM, Math.min(TM, t)); }, { hollow: true });
    xp.onDrag = () => { drawAll(); F.notify('probe'); };
  }

  const opts = () => {
    const p = F.params;
    return { mode: p.mode, profile: p.profile, A: P.A, w: p.w, x0: P.x0, c: p.c, lambda: p.lambda, speed: p.speed, slow: p.slow, init: p.init, D: p.D };
  };
  const u = (o, x, t) => (o.mode === 'variable' ? M.transport(o, x, t) : M.solve(o, x, t));

  // the x–t shading and the vertical range, recomputed only when a parameter (not t) changes
  let cache = { key: '' };
  function analyse() {
    const o = opts(), key = JSON.stringify(o);
    if (key === cache.key) return cache;
    const nx = 240, nt = 120, vals = new Float32Array(nx * nt);
    let lo = 0, hi = 0;
    for (let j = 0; j < nt; j++) {
      const t = ((j + 0.5) / nt) * TM;
      for (let i = 0; i < nx; i++) {
        const v = u(o, XL + ((i + 0.5) / nx) * (XR - XL), t);
        vals[j * nx + i] = v;
        if (v > hi) hi = v; if (v < lo) lo = v;
      }
    }
    for (let i = 0; i <= 400; i++) { const v = M.initial(o, XL + (i / 400) * (XR - XL)); if (o.mode !== 'wave' || o.init !== 'strike') { if (v > hi) hi = v; if (v < lo) lo = v; } }
    cache = { key, o, nx, nt, vals, lo, hi, img: null };
    return cache;
  }
  function sheetImage(C) {
    if (C.img) return C.img;
    const col = themeColors(), pos = rgbOf(col.accent), neg = rgbOf(col.warn);
    const c = document.createElement('canvas'); c.width = C.nx; c.height = C.nt;
    const g = c.getContext('2d'), im = g.createImageData(C.nx, C.nt), scale = Math.max(C.hi, -C.lo) || 1;
    for (let j = 0; j < C.nt; j++) for (let i = 0; i < C.nx; i++) {
      const v = C.vals[j * C.nx + i], k = ((C.nt - 1 - j) * C.nx + i) * 4, rgb = v >= 0 ? pos : neg;
      im.data[k] = rgb[0]; im.data[k + 1] = rgb[1]; im.data[k + 2] = rgb[2]; im.data[k + 3] = Math.round(235 * Math.min(1, Math.abs(v) / scale) ** 0.8);
    }
    g.putImageData(im, 0, 0);
    C.img = c;
    return c;
  }

  function drawTop() {
    const C = analyse(), o = C.o, t = F.params.t;
    const span = C.hi - C.lo || 1;
    const fluxRoom = P.flux ? 0.32 * span : 0, enRoom = P.energy && o.mode === 'wave' ? 0.4 * span : 0;
    tp.setView([XL, XR], [C.lo - 0.08 * span - fluxRoom - enRoom, C.hi + 0.18 * span]);
    tp.clear();
    const narrow = (top.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    if (o.mode === 'variable' && o.speed === 'river') tp.rect(-2, tp.vy0, 5, tp.vy1 - tp.vy0, { color: 'teal', alpha: 0.07, stroke: false });
    if (!(o.mode === 'wave' && o.init === 'strike')) tp.fn((x) => M.initial(o, x), { color: 'ink3', width: 1.3, dash: [5, 4], samples: 900 });
    if (o.mode === 'wave' && P.halves) {
      tp.fn((x) => M.waveParts(o, x, t).R, { color: 'violet', width: 1.5, dash: [3, 3], samples: 900 });
      tp.fn((x) => M.waveParts(o, x, t).L, { color: 'teal', width: 1.5, dash: [3, 3], samples: 900 });
    }
    tp.fn((x) => u(o, x, t), { color: 'accent', width: 2.4, samples: 1200 });
    // energy density, drawn downward from a baseline under the axis
    if (enRoom) {
      const base = C.lo - 0.08 * span, emax = Math.max(1e-9, ...Array.from({ length: 300 }, (_, i) => { const d = M.waveGrad(o, XL + (i / 299) * (XR - XL), 0); return d ? 0.5 * (d.ut ** 2 + o.c ** 2 * d.ux ** 2) : 0; }));
      const ed = (x) => { const d = M.waveGrad(o, x, t); return d ? 0.5 * (d.ut ** 2 + o.c ** 2 * d.ux ** 2) : 0; };
      if (M.waveGrad(o, 0, 0)) {
        tp.area((x) => base - (0.36 * span * ed(x)) / emax, XL, XR, { color: 'gold', alpha: 0.35, lower: () => base, samples: 600 });
        tp.text('energy density', XR, base - 0.05 * span, { color: 'gold', align: 'right', size: fs - 0.5, dx: -4 });
      }
    }
    // flux arrows along the bottom
    if (P.flux && (o.mode === 'transport' || o.mode === 'heat')) {
      const yb = C.lo - 0.08 * span - 0.16 * span, n = 15, q = (x) => (o.mode === 'heat' ? -o.D * (u(o, x + 1e-4, t) - u(o, x - 1e-4, t)) / 2e-4 : o.c * u(o, x, t));
      let qmax = 1e-9;
      for (let i = 0; i <= 200; i++) qmax = Math.max(qmax, Math.abs(q(XL + (i / 200) * (XR - XL))));
      const dxMax = (0.9 * (XR - XL)) / n;
      for (let i = 0; i < n; i++) {
        const x = XL + ((i + 0.5) / n) * (XR - XL), L = (q(x) / qmax) * dxMax;
        if (Math.abs(L) > 0.04 * dxMax) tp.arrow(x - L / 2, yb, x + L / 2, yb, { color: 'teal', width: 1.8, head: 7 });
      }
      tp.text(o.mode === 'heat' ? 'flux q = −D uₓ' : 'flux q = c u', XL, yb + 0.1 * span, { color: 'teal', size: fs - 0.5, dx: 4 });
    }
    // the tagged feature rides its characteristic
    if (P.tag && (o.mode === 'transport' || o.mode === 'variable')) {
      const xf = M.along(o, P.x0, t);
      if (xf >= XL && xf <= XR) tp.point(xf, u(o, xf, t), { color: 'gold', r: 5 });
    }
    if (probe) tp.line(probe.x, tp.vy0, probe.x, tp.vy1, { color: 'gold', width: 1, dash: [2, 4], alpha: 0.8 });
    tp.text(`t = ${t.toFixed(2)} s`, XR, tp.vy1, { color: 'ink2', align: 'right', size: fs, dx: -6, dy: 10 });
  }

  function drawXT() {
    if (!xp) return;
    const C = analyse(), o = C.o, t = F.params.t;
    xp.clear();
    const narrow = (bot.canvas.clientWidth || 600) < 520, fs = narrow ? 10 : 11.5;
    if (P.sheet) {
      const g = xp.ctx;
      g.save(); g.imageSmoothingEnabled = true;
      g.drawImage(sheetImage(C), xp.X(XL), xp.Y(TM), xp.X(XR) - xp.X(XL), xp.Y(0) - xp.Y(TM));
      g.restore();
    }
    if (o.mode === 'variable' && o.speed === 'river') { xp.rect(-2, 0, 5, TM, { color: 'teal', alpha: 0.08, stroke: false }); xp.text('slow reach', 0.5, TM, { color: 'teal', align: 'center', size: fs - 0.5, dy: 9 }); }
    if (P.chars) {
      if (o.mode === 'transport' || o.mode === 'variable') {
        // launch from the bottom edge, and (for flow into the window) from the side
        const starts = [];
        const n = 22;
        for (let i = 0; i <= n; i++) starts.push(XL + (i / n) * (XR - XL));
        if (o.mode === 'transport' && o.c !== 0) { const d = (XR - XL) / n; const reach = Math.abs(o.c) * TM; for (let s = d; s <= reach + 1e-9; s += d) starts.push(o.c > 0 ? XL - s : XR + s); }
        if (o.mode === 'variable' && o.speed === 'river') { const xs = M.foot(o, XL, TM), d = (XR - XL) / n; for (let s = XL - d; s >= xs - 1e-9; s -= d) starts.push(s); }
        for (const x0 of starts) xp.curve((s) => M.along(o, x0, s), (s) => s, 0, TM, { color: 'ink2', width: 1, alpha: 0.55, samples: 80 });
      } else if (o.mode === 'wave') {
        const n = 16, d = (XR - XL) / n;
        for (let k = XL - o.c * TM; k <= XR + 1e-9; k += d) xp.line(k, 0, k + o.c * TM, TM, { color: 'violet', width: 1, alpha: 0.5 });
        for (let k = XL; k <= XR + o.c * TM + 1e-9; k += d) xp.line(k, 0, k - o.c * TM, TM, { color: 'teal', width: 1, alpha: 0.5 });
      }
    }
    // domain of dependence of the probe
    if (probe) {
      const g = xp.ctx;
      if (o.mode === 'wave') {
        const a = probe.x - o.c * probe.t, b = probe.x + o.c * probe.t;
        xp.path([[a, 0], [probe.x, probe.t], [b, 0]], { color: 'gold', width: 2, fill: 'gold', fillAlpha: 0.2, close: true });
        xp.line(a, 0, b, 0, { color: 'gold', width: 5 });
      } else if (o.mode === 'heat') {
        xp.rect(XL, 0, XR - XL, probe.t, { color: 'gold', alpha: 0.13, stroke: false });
        xp.line(XL, 0, XR, 0, { color: 'gold', width: 5 });
        xp.text('every point below matters', probe.x, probe.t / 2, { color: 'gold', align: probe.x > (XL + XR) / 2 ? 'right' : 'left', size: fs, dx: probe.x > (XL + XR) / 2 ? -14 : 14 });
      } else {
        xp.curve((s) => M.along(o, M.foot(o, probe.x, probe.t), s), (s) => s, 0, probe.t, { color: 'gold', width: 2.6, samples: 120 });
        xp.point(M.foot(o, probe.x, probe.t), 0, { color: 'gold', r: 5 });
      }
      g.save(); xp.drawHandles(); g.restore();
    }
    xp.line(XL, t, XR, t, { color: 'gold', width: 1.6, dash: [6, 4] });
  }

  function readout() {
    if (P.readout === false) return;
    const C = analyse(), o = C.o, t = F.params.t, q = (k, v) => (hide.has(k) ? '?' : v);
    const rows = [['$t$', `${t.toFixed(2)}\\,\\text{s}`]];
    if (o.mode === 'transport' || o.mode === 'variable') {
      rows.push(['peak at $x$', q('peak', f3(M.along(o, P.x0, t)))]);
      if (probe) rows.push([`$u(${f3(probe.x)},\\,${f3(probe.t)})$`, q('u', f3(u(o, probe.x, probe.t)))], ['foot of its characteristic', q('foot', `x = ${f3(M.foot(o, probe.x, probe.t))}`)]);
    } else if (o.mode === 'wave') {
      const e = M.waveEnergy(o, t);
      rows.push(['kinetic', q('energy', f3(e.K))], ['potential', q('energy', f3(e.V))], ['total energy', q('energy', f3(e.E))]);
      if (probe) rows.push([`$u(${f3(probe.x)},\\,${f3(probe.t)})$`, q('u', f3(u(o, probe.x, probe.t)))], ['depends on data in', q('foot', `[${f3(probe.x - o.c * probe.t)},\\ ${f3(probe.x + o.c * probe.t)}]`)]);
    } else {
      let mx = -Infinity;
      for (let i = 0; i <= 800; i++) mx = Math.max(mx, u(o, XL + (i / 800) * (XR - XL), t));
      let area = 0;
      const a = XL - 30, b = XR + 30, n = 3000, h = (b - a) / n;
      for (let i = 0; i < n; i++) area += u(o, a + (i + 0.5) * h, t) * h;
      rows.push(['max $u$', q('max', f3(mx))], ['area $\\int u\\,dx$', q('area', f3(area))]);
      const sd = M.heatSpread(o, t);
      if (sd !== null) rows.push(['spread', q('spread', `${f3(sd)}\\,\\text{m}`)]);
      if (P.far !== null && P.far !== undefined) rows.push([`$u$ at $x = ${f3(P.far)}$`, q('far', f3(u(o, P.far, t)))]);
      if (probe) rows.push([`$u(${f3(probe.x)},\\,${f3(probe.t)})$`, q('u', f3(u(o, probe.x, probe.t)))]);
    }
    F.readout(rows);
  }

  function drawAll() { drawTop(); drawXT(); readout(); }

  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let running = (P.play ?? !F.compact) && !reduced();
  const setT = (v) => { if (wanted.includes('t')) F.set('t', v); else { F.params.t = v; drawAll(); } };
  const step = (dt) => { let v = F.params.t + (dt * TM) / 7; if (v > TM) v = 0; setT(+v.toFixed(4)); };
  let loop = F.animate((dt) => { if (running) step(dt); });
  if (!F.compact && P.play !== false) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', onClick: () => {
      running = !running; btn.textContent = running ? 'Pause' : 'Play';
      loop.stop(); loop = F.animate((dt) => { if (running) step(dt); }, { force: running });
    } });
    F.button({ label: 'Back to t = 0', onClick: () => setT(0) });
  }
  F.onChange(() => drawAll());
  F.draw(() => { cache.img = null; drawAll(); });
  F.caption(P.caption || {
    transport: 'Exact solution u = e^(−λt) f(x − ct) on an infinite line; the window is a piece of it. Shading below: blue where u > 0, its depth showing the size of u. Grey lines: characteristics, along which u is carried unchanged.',
    variable: 'Exact solution: u is constant along each characteristic dx/dt = c(x). The slow reach is shaded; its edges are smoothed over about 0.35 m. Units are illustrative.',
    wave: 'Exact d’Alembert solution on an infinite string — nothing reflects, the window is only a piece of it. Violet: characteristics x − ct = const; teal: x + ct = const. Energies are per unit linear density (multiply by μ for joules).',
    heat: 'Exact solution of u_t = D u_xx on an infinite line: the initial profile spread by the heat kernel. The model has no wave speed, so a change is felt everywhere at once; real heat conduction departs from it only at extremely short times.',
  }[P.mode]);
  return { get: (k) => (k === 'probe' ? probe && { ...probe } : k === 'point' ? probe && { x: probe.x, y: probe.t } : F.params[k]) };
}

export function validate(P) {
  const p = [];
  if (!MODES.includes(P.mode)) p.push(`pde-player: mode must be one of ${MODES.join(', ')}`);
  if (P.modes !== null && P.modes !== undefined) { if (!Array.isArray(P.modes)) p.push('pde-player: modes is a list'); else for (const m of P.modes) if (!MODES.includes(m)) p.push(`pde-player: unknown mode “${m}” in modes`); }
  if (!M.PROFILES[P.profile]) p.push(`pde-player: unknown profile “${P.profile}”`);
  if (!['pluck', 'strike', 'right'].includes(P.init)) p.push('pde-player: init is pluck, strike or right');
  if (!['stretch', 'river'].includes(P.speed)) p.push('pde-player: speed is stretch or river');
  if (!(Array.isArray(P.x) && P.x.length === 2 && P.x[1] > P.x[0])) p.push('pde-player: x is a window [min, max]');
  if (!(P.tmax > 0)) p.push('pde-player: tmax must be positive');
  if (!(P.t >= 0 && P.t <= P.tmax)) p.push('pde-player: t must lie in [0, tmax]');
  if (!(P.w > 0)) p.push('pde-player: w must be positive');
  if (!(P.D > 0)) p.push('pde-player: D must be positive');
  if (!(P.lambda >= 0)) p.push('pde-player: lambda must be ≥ 0');
  if (!(P.slow > 0 && P.slow <= 1)) p.push('pde-player: slow lies in (0, 1]');
  if (P.mode === 'wave' && !(P.c > 0)) p.push('pde-player: a wave speed must be positive');
  if (P.mode === 'variable' && !(P.c > 0)) p.push('pde-player: variable mode needs c > 0');
  if (P.mode === 'variable' && P.speed === 'stretch' && P.x0 <= 0) p.push('pde-player: stretch needs the profile centred at x0 > 0');
  if (P.probe !== null && P.probe !== undefined) {
    if (!(Array.isArray(P.probe) && P.probe.length === 2)) p.push('pde-player: probe is [x, t]');
    else if (!(P.probe[0] >= P.x[0] && P.probe[0] <= P.x[1] && P.probe[1] > 0 && P.probe[1] <= P.tmax)) p.push('pde-player: probe must lie inside the x–t window');
  }
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`pde-player: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`pde-player: unknown hide “${h}”`);
  return p;
}
