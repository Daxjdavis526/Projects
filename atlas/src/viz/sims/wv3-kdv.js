// Solitons of the Korteweg–de Vries equation u_t + 6uu_x + u_xxx = 0
// (dimensionless). Three views:
//   soliton   one solitary wave of height A, moving at c = 2A: taller is
//             faster and narrower; its starting shape dashed.
//   collide   the exact two-soliton solution: the tall one catches the short
//             one, they merge, and both come out unchanged — but shifted
//             (the fast one forward, the slow one back) against dashed ghosts
//             that never met.
//   compare   one sech² hump under each half of the equation: dispersion alone
//             (u_t + u_xxx = 0, violet) spreads it into ripples that run
//             backwards; nonlinearity alone (u_t + 6uu_x = 0, gold, dashed)
//             steepens it until it folds over (where a real wave would break);
//             together (blue) they balance, and the hump travels unchanged.
// Exact solutions throughout (Fourier modes for the linear part,
// characteristics for the fold); physics in model/wv3-kdv.js, tested in
// test/wv3-kdv.test.mjs.
//
//   { type: 'wv3-kdv', params: {
//       mode: 'soliton',       // soliton | collide | compare
//       modes: null,           // modes the learner may switch between, e.g. ['soliton', 'collide']
//       A: 1,                  // soliton, compare: the height (0.2–2.5)
//       A1: 2, A2: 0.5,        // collide: the two heights, A1 > A2 (0.1–2.5)
//       tc: 3,                 // collide: when the two would meet
//       t: 0, tmax: 6,         // the moment shown; the time slider's top
//       x: null,               // the window [min, max]; default per mode
//       ghost: true,           // dashed reference: the starting shape (soliton), the non-interacting pair (collide)
//       show: ['linear', 'fold', 'kdv'],   // compare: which curves
//       controls: null,        // true, false, or a list of: mode A A1 A2 t
//       play: null,            // animate (default: in the Explore step)
//       readout: true,
//       labels: true,          // the legend text on the canvas
//       hide: [],              // readouts shown as “?”: speed width shift tstar
//   } }
// get('t') returns the time slider, for slider items.

import { Plot } from '../plot.js';
import * as K from '../model/wv3-kdv.js';

export const defaults = { mode: 'soliton', modes: null, A: 1, A1: 2, A2: 0.5, tc: 3, t: 0, tmax: 6, x: null, ghost: true, show: ['linear', 'fold', 'kdv'], controls: null, play: null, readout: true, labels: true, hide: [] };
const MODES = ['soliton', 'collide', 'compare'];
const CONTROLS = ['mode', 'A', 'A1', 'A2', 't'];
const HIDE = ['speed', 'width', 'shift', 'tstar'];
const SHOW = ['linear', 'fold', 'kdv'];
const WINDOW = { soliton: [-6, 20], collide: [-16, 18], compare: [-14, 14] };
const f3 = (x) => (!Number.isFinite(x) ? '\\text{—}' : String(+x.toPrecision(3)));

// the periodic grid for the linear (dispersion-only) evolution: wide enough that ripples do not wrap into view
const NG = 4096, XG = 160, DX = (2 * XG) / NG;
const GRID = Array.from({ length: NG }, (_, i) => -XG + i * DX);

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const modes = Array.isArray(P.modes) && P.modes.length ? P.modes : [P.mode];
  const wanted = P.controls === true ? CONTROLS : P.controls === null && !F.compact ? [...(modes.length > 1 ? ['mode'] : []), 'A', 'A1', 'A2', 't'] : Array.isArray(P.controls) ? P.controls : [];
  const nodes = {};
  const ctl = (key, make) => (wanted.includes(key) ? (nodes[key] = make()) : (F.params[key] = P[key]));
  ctl('mode', () => F.choice({ key: 'mode', label: 'View', options: modes.map((m) => [m, { soliton: 'one soliton', collide: 'two solitons collide', compare: 'take the equation apart' }[m]]), value: P.mode, explain: 'One solitary wave; two passing through each other; or each half of the equation on its own.' }));
  ctl('A', () => F.slider({ key: 'A', label: 'Height $A$', min: 0.2, max: 2.5, step: 0.05, value: P.A, explain: 'A KdV soliton of height $A$ moves at $c = 2A$ and has width $\\propto 1/\\sqrt{A}$.' }));
  ctl('A1', () => F.slider({ key: 'A1', label: 'Tall soliton $A_1$', min: 0.4, max: 2.5, step: 0.05, value: P.A1, explain: 'Starts behind; moves at $2A_1$.' }));
  ctl('A2', () => F.slider({ key: 'A2', label: 'Short soliton $A_2$', min: 0.1, max: 2, step: 0.05, value: P.A2, explain: 'Starts ahead; moves at $2A_2$. Kept below $A_1$ so the tall one catches it.' }));
  ctl('t', () => F.slider({ key: 't', label: 'Time $t$', min: 0, max: P.tmax, step: P.tmax / 300, value: P.t, explain: 'Dimensionless time.' }));
  const showRelevant = () => {
    const m = F.params.mode;
    for (const [k, on] of [['A', m !== 'collide'], ['A1', m === 'collide'], ['A2', m === 'collide']]) if (nodes[k]?.node) nodes[k].node.style.display = on ? '' : 'none';
  };

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'A KdV wave profile u(x) at one moment' });
  const plot = new Plot(canvas, { x: P.x || WINDOW[P.mode], y: [-0.3, 1.3], xlabel: 'x', ylabel: 'u' });

  // the sech² starting profile of the compare view, and its spectrum, cached per height
  let cache = { A: NaN, u0: null };
  const u0Grid = (A) => { if (cache.A !== A) cache = { A, u0: GRID.map((x) => K.soliton(x, 0, 2 * A)) }; return cache.u0; };

  const S = { running: (P.play ?? !F.compact) && !reduced };
  const still = P.play === false;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    let t = +F.params.t + dt * 0.8;
    if (t > P.tmax) t = 0;
    if (nodes.t) nodes.t.set(t); else F.params.t = t;
    draw();
  }, { force: true });
  if (!still && !F.compact || P.play === true) {
    const btn = F.button({ label: S.running ? 'Pause' : 'Play', primary: true, onClick: () => { S.running = !S.running; btn.textContent = S.running ? 'Pause' : 'Play'; if (S.running) anim.start(); } });
    F.button({ label: 'Restart', onClick: () => { if (nodes.t) nodes.t.set(0); else F.params.t = 0; draw(); } });
  }

  function draw() {
    showRelevant();
    const mode = MODES.includes(F.params.mode) ? F.params.mode : 'soliton', t = +F.params.t;
    const xr = P.x || WINDOW[mode];
    const narrow = (canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    const xs = Array.from({ length: 900 }, (_, i) => xr[0] + ((xr[1] - xr[0]) * i) / 899);
    const rows = [];
    const q = (k, v) => (hide.has(k) ? '?' : v);
    if (mode === 'soliton') {
      const A = +F.params.A, c = 2 * A;
      plot.setView(xr, [-0.15 * Math.max(A, 1), 1.25 * Math.max(A, 1)]);
      plot.clear();
      if (P.ghost) plot.path(xs.map((x) => [x, K.soliton(x, 0, c)]), { color: 'ink3', width: 1.3, dash: [5, 4] });
      plot.path(xs.map((x) => [x, K.soliton(x, t, c)]), { color: 'accent', width: 2.6 });
      if (P.labels) plot.text(`speed c = 2A`, xr[1], 1.15 * Math.max(A, 1), { color: 'ink3', size: fs, align: 'right', dx: -6 });
      rows.push(['speed $c$', q('speed', f3(c))], ['height $A$', f3(A)], ['width (FWHM)', q('width', f3(K.fwhm(c)))]);
    } else if (mode === 'collide') {
      let A1 = +F.params.A1, A2 = Math.min(+F.params.A2, 0.9 * A1);
      const k1 = Math.sqrt(2 * A1), k2 = Math.sqrt(2 * A2), c1 = k1 * k1, c2 = k2 * k2, lnA = 2 * Math.log(Math.abs(k1 - k2) / (k1 + k2));
      const x1 = -c1 * P.tc, x2 = -c2 * P.tc + lnA / k2;
      plot.setView(xr, [-0.15 * A1, 1.25 * A1]);
      plot.clear();
      if (P.ghost) {
        plot.path(xs.map((x) => [x, K.soliton(x, t, c1, x1)]), { color: 'gold', width: 1.2, dash: [5, 4] });
        plot.path(xs.map((x) => [x, K.soliton(x, t, c2, x2 - lnA / k2)]), { color: 'violet', width: 1.2, dash: [5, 4] });
      }
      plot.path(xs.map((x) => [x, K.twoSoliton(x, t, k1, k2, x1, x2)]), { color: 'accent', width: 2.6 });
      if (P.labels && P.ghost) plot.text('dashed: the two if they never met', xr[1], 1.15 * A1, { color: 'ink3', size: fs, align: 'right', dx: -6 });
      const [d1, d2] = K.phaseShifts(k1, k2);
      rows.push(['speeds', q('speed', `${f3(c1)},\\ ${f3(c2)}`)], ['shift of the tall one', q('shift', `+${f3(d1)}`)], ['of the short one', q('shift', f3(d2))]);
    } else {
      const A = +F.params.A, c = 2 * A, show = new Set((P.show || SHOW).filter((s) => SHOW.includes(s)));
      plot.setView(xr, [-0.45 * A, 1.3 * A]);
      plot.clear();
      if (P.ghost) plot.path(xs.map((x) => [x, K.soliton(x, 0, c)]), { color: 'ink4', width: 1.1, dash: [2, 3] });
      if (show.has('linear')) {
        const u = K.linear(u0Grid(A), DX, t);
        const pts = [];
        for (let i = 0; i < NG; i++) if (GRID[i] >= xr[0] - DX && GRID[i] <= xr[1] + DX) pts.push([GRID[i], u[i]]);
        plot.path(pts, { color: 'violet', width: 1.9 });
      }
      if (show.has('fold')) {
        const xi = Array.from({ length: 1500 }, (_, i) => -12 + (24 * i) / 1499);
        plot.path(K.fold((s) => K.soliton(s, 0, c), xi, t), { color: 'gold', width: 1.9, dash: [6, 4] });
      }
      if (show.has('kdv')) plot.path(xs.map((x) => [x, K.soliton(x, t, c)]), { color: 'accent', width: 2.6 });
      if (P.labels) {
        const lines = [['violet', 'dispersion only'], ['gold', 'nonlinearity only'], ['accent', 'both: KdV']].filter((_, i) => show.has(SHOW[i]));
        lines.forEach(([col, s], i) => plot.text(s, xr[0], 1.2 * A - i * 0.16 * A, { color: col, size: fs, dx: 8 }));
      }
      rows.push(['breaking time (nonlinearity only)', q('tstar', f3(K.breakTime(c)))], ['soliton speed', q('speed', f3(c))]);
    }
    if (P.readout !== false) F.readout([['$t$', f3(t)], ...rows]); else F.readout([]);
  }
  F.onChange(() => draw());
  F.draw(draw);
  F.caption('The KdV equation in dimensionless units. Every curve is an exact solution, not a numerical approximation.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const out = [];
  if (!MODES.includes(P.mode)) out.push(`wv3-kdv: mode must be one of ${MODES.join(', ')}`);
  if (P.modes !== null && P.modes !== undefined && !(Array.isArray(P.modes) && P.modes.every((m) => MODES.includes(m)) && P.modes.includes(P.mode))) out.push('wv3-kdv: modes must list modes, including mode');
  if (!(P.A >= 0.2 && P.A <= 2.5)) out.push('wv3-kdv: A must lie in 0.2–2.5');
  if (!(P.A1 >= 0.4 && P.A1 <= 2.5)) out.push('wv3-kdv: A1 must lie in 0.4–2.5');
  if (!(P.A2 >= 0.1 && P.A2 <= 2)) out.push('wv3-kdv: A2 must lie in 0.1–2');
  if (!(P.A2 < P.A1)) out.push('wv3-kdv: A2 must be smaller than A1');
  if (!(P.tmax > 0) || !(P.t >= 0 && P.t <= P.tmax)) out.push('wv3-kdv: t must lie in 0…tmax');
  if (!(P.tc > 0)) out.push('wv3-kdv: tc must be positive');
  if (P.x !== null && !(Array.isArray(P.x) && P.x.length === 2 && P.x[0] < P.x[1] && P.x[0] > -XG / 2 && P.x[1] < XG / 2)) out.push('wv3-kdv: x must be [min, max] within ±80');
  if (!Array.isArray(P.show) || P.show.some((s) => !SHOW.includes(s))) out.push(`wv3-kdv: show must list ${SHOW.join(', ')}`);
  if (P.controls !== null && P.controls !== true && P.controls !== false && !(Array.isArray(P.controls) && P.controls.every((c) => CONTROLS.includes(c)))) out.push(`wv3-kdv: controls must be true, false or a list of ${CONTROLS.join(' ')}`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) out.push(`wv3-kdv: unknown hide “${h}”`);
  if (![null, undefined, true, false].includes(P.play)) out.push('wv3-kdv: play must be true, false or null');
  return out;
}
