// The Fresnel equations at a flat boundary (PHYS 4650 O3.3–O3.4). Physics in
// model/op-fresnel.js (tested headlessly in test/op-fresnel.test.mjs).
// Two views:
//
//   coeffs      r_s, r_p, t_s, t_p (amplitudes, Hecht's signs) or R_s, R_p,
//               T_s, T_p (power fractions) against the angle of incidence, with
//               Brewster's angle and the critical angle marked; a draggable
//               angle (on the graph, or the incident ray in the little sketch
//               of the interface beside it on wide screens). Beyond the critical
//               angle the amplitude view draws |r| = 1: r is complex there.
//   evanescent  the s-polarized field (E out of the page) near the boundary, as
//               a colour map of its instantaneous value: incident and reflected
//               waves above, and below either a wave that leaves (θ < θ_c) or an
//               evanescent field that dies away over a penetration depth δ. With
//               a gap (a layer of medium 2 between two blocks of medium 1), light
//               tunnels across: frustrated total internal reflection. Beside it,
//               the field's envelope against depth (panel 'profile') or the
//               transmission through the gap against its width (panel 'tunnel').
//
//   { type: 'op-fresnel', params: {
//       view: 'coeffs',
//       n1: 1, n2: 1.5168,        // where the light comes from, and across the boundary (1–3)
//       angle: 30,                // angle of incidence, ° from the normal (0–89.9)
//       show: 'amplitude',        // coeffs: 'amplitude' | 'power'
//       pols: ['s', 'p'],         // coeffs: which polarizations to draw
//       trans: true,              // coeffs: draw the transmission curves too
//       sketch: true,             // coeffs: the interface sketch on wide screens
//       gap: null,                // evanescent: gap width in vacuum wavelengths (0–2); null: one boundary
//       panel: 'profile',         // evanescent: 'profile' | 'tunnel' | 'none'
//       lambda: 633,              // vacuum wavelength, nm (penetration depth readout)
//       play: null,               // evanescent: animate (default: when not compact)
//       controls: null,           // true, false or a list of: angle n1 n2 show gap (default: all when not compact)
//       readout: true,
//       readouts: null,           // rows: angle brewster critical rs rp ts tp Rs Rp Ts Tp delta T
//       hide: [],                 // rows (and the marks brewster, critical) not to show: the answer to a problem
//       labels: true,
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/op-fresnel.js';

export const defaults = {
  view: 'coeffs', n1: 1, n2: 1.5168, angle: 30, show: 'amplitude', pols: ['s', 'p'], trans: true, sketch: true,
  gap: null, panel: 'profile', lambda: 633, play: null, controls: null, readout: true, readouts: null, hide: [], labels: true,
};
const VIEWS = ['coeffs', 'evanescent'];
const ROWS = ['angle', 'brewster', 'critical', 'rs', 'rp', 'ts', 'tp', 'Rs', 'Rp', 'Ts', 'Tp', 'delta', 'T'];
const CONTROLS = ['angle', 'n1', 'n2', 'show', 'gap'];
const D = M.DEG;
const trim = (x, n = 3) => (Number.isFinite(x) ? String(+(+x).toPrecision(n)) : '\\text{—}');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const evan = P.view === 'evanescent';
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const want = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const has = (k) => want.includes(k);
  const slider = (o) => (has(o.key) ? F.slider(o) : ((F.params[o.key] = o.value), null));

  slider({ key: 'angle', label: 'Angle of incidence $\\theta_1$', min: 0, max: 89.5, step: 0.5, value: P.angle, unit: '^\\circ', explain: 'From the normal to the boundary. Or drag the gold line on the graph' + (evan ? '.' : ', or the start of the incident ray.') });
  slider({ key: 'n1', label: 'Incident medium $n_1$', min: 1, max: 2.5, step: 0.01, value: P.n1, explain: 'Where the light comes from: 1.00 air, 1.33 water, 1.52 crown glass (BK7), 2.42 diamond.' });
  slider({ key: 'n2', label: evan && P.gap !== null ? 'Gap medium $n_2$' : 'Second medium $n_2$', min: 1, max: 2.5, step: 0.01, value: P.n2, explain: evan && P.gap !== null ? 'The thin layer between the two blocks; air in a beam-splitter cube.' : 'Across the boundary.' });
  if (!evan && has('show')) F.choice({ key: 'show', label: 'Plot', options: [['amplitude', 'Amplitudes $r$, $t$'], ['power', 'Powers $R$, $T$']], value: P.show, explain: 'Amplitude ratios of the fields, or fractions of the power: $R = |r|^2$, and $T$ carries a factor for the change of speed and beam width.' });
  else F.params.show = P.show;
  if (evan && P.gap !== null) slider({ key: 'gap', label: 'Gap width $d$', min: 0, max: 1.5, step: 0.01, value: P.gap, unit: '\\lambda_0', explain: 'In vacuum wavelengths. A gap much thinner than the penetration depth lets most of the light tunnel through.' });
  else F.params.gap = P.gap;

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || (evan ? 'The electric field near a boundary: incident and reflected waves above, the transmitted or evanescent field below' : 'Fresnel reflection and transmission coefficients against the angle of incidence') });
  const ctx = canvas.getContext('2d');
  const main = new Plot(canvas, { x: [0, 90], y: [-1, 1], grid: true, axes: true });
  const side = new Plot(canvas, { x: [-1, 1], y: [-1, 1], grid: false, axes: false });
  const st = { phase: 0, running: false };
  let anim = null;
  if (evan) {
    const autoplay = (P.play ?? !F.compact) && !reduced;
    st.running = autoplay;
    anim = F.animate((dt) => { if (!st.running) return; st.phase += dt * 2 * Math.PI * 0.5; draw(); }, { force: true });
    if ((P.play ?? !F.compact) !== false) {
      const btn = F.button({ label: st.running ? 'Pause' : 'Play', primary: true, onClick: () => { st.running = !st.running; btn.textContent = st.running ? 'Pause' : 'Play'; if (st.running) anim.start(); } });
    }
  }
  F.onChange(() => draw());

  // ── coeffs ──────────────────────────────────────────────────────────────
  function drawCoeffs() {
    const { n1, n2, angle, show } = F.params;
    const W = main.w, wide = P.sketch && W >= 520;
    const split = wide ? Math.round(W * 0.34) : 0;
    const crit = M.critical(n1, n2), brew = M.brewster(n1, n2);
    const thc = Number.isNaN(crit) ? 90 : crit / D;
    const pols = (P.pols || ['s', 'p']).filter((p) => p === 's' || p === 'p');
    // the vertical range
    let ymin = 0, ymax = 1.05;
    if (show === 'amplitude') {
      ymin = -1.05;
      if (P.trans) for (let a = 0; a < Math.min(thc, 89.9); a += 0.5) { const f = M.coefficients(n1, n2, a * D); ymax = Math.max(ymax, f.ts[0] * 1.05, f.tp[0] * 1.05); }
      if (P.trans && !Number.isNaN(crit)) { const f = M.coefficients(n1, n2, crit * 0.99999); ymax = Math.max(ymax, f.ts[0] * 1.05, f.tp[0] * 1.05); }
    }
    main.o.pad = { l: split + 40, r: 14, t: 24, b: 34 };
    main.o.xlabel = 'angle of incidence (°)'; main.o.ylabel = ''; main.o.xticks = 6;
    main.setView([0, 90], [ymin, ymax]);
    main.clear();
    const narrow = W < 520, fs = narrow ? 10.5 : 11.5;
    const curve = (fn, color, dash) => main.fn((x) => fn(x), { color, width: 2.2, dash, domain: [0, 89.95], samples: 500 });
    const below = (x) => x < thc;
    if (show === 'amplitude') {
      main.line(0, 0, 90, 0, { color: 'ink3', width: 1 });
      if (pols.includes('s')) curve((x) => (below(x) ? M.coefficients(n1, n2, x * D).rs[0] : NaN), 'violet');
      if (pols.includes('p')) curve((x) => (below(x) ? M.coefficients(n1, n2, x * D).rp[0] : NaN), 'teal');
      if (P.trans && pols.includes('s')) curve((x) => (below(x) ? M.coefficients(n1, n2, x * D).ts[0] : NaN), 'violet', [6, 4]);
      if (P.trans && pols.includes('p')) curve((x) => (below(x) ? M.coefficients(n1, n2, x * D).tp[0] : NaN), 'teal', [6, 4]);
      if (thc < 90) main.line(thc, 1, 90, 1, { color: 'bad', width: 2.4 });
    } else {
      if (pols.includes('s')) curve((x) => M.coefficients(n1, n2, x * D).Rs, 'violet');
      if (pols.includes('p')) curve((x) => M.coefficients(n1, n2, x * D).Rp, 'teal');
      if (P.trans && pols.includes('s')) curve((x) => M.coefficients(n1, n2, x * D).Ts, 'violet', [6, 4]);
      if (P.trans && pols.includes('p')) curve((x) => M.coefficients(n1, n2, x * D).Tp, 'teal', [6, 4]);
    }
    // marks
    const yTop = ymax - 0.04 * (ymax - ymin);
    if (!hide.has('brewster') && brew / D < thc) {
      main.line(brew / D, ymin, brew / D, ymax, { color: 'teal', width: 1.2, dash: [2, 4] });
      if (P.labels) main.text(`θB ${trim(brew / D)}°`, brew / D, ymin + 0.06 * (ymax - ymin), { color: 'teal', size: fs, align: brew / D > 62 ? 'right' : 'left', dx: brew / D > 62 ? -5 : 5 });
    }
    if (!hide.has('critical') && thc < 90) {
      main.line(thc, ymin, thc, ymax, { color: 'bad', width: 1.2, dash: [2, 4] });
      if (P.labels) main.text(`θc ${trim(thc)}°`, thc, ymin + 0.16 * (ymax - ymin), { color: 'bad', size: fs, align: thc > 62 ? 'right' : 'left', dx: thc > 62 ? -5 : 5 });
      if (P.labels && show === 'amplitude') main.text('|r| = 1', Math.min(88, thc + 2), 1, { color: 'bad', size: fs, dy: 10 });
    }
    // the angle marker (draggable)
    main.line(angle, ymin, angle, ymax, { color: 'gold', width: 1.6 });
    // legend
    if (P.labels) {
      const L = show === 'amplitude' ? ['r', 't'] : ['R', 'T'];
      let lx = main.R - 6;
      const items = [];
      for (const p of pols) { items.push([`${L[0]}${p === 's' ? 'ₛ' : 'ₚ'}`, p === 's' ? 'violet' : 'teal', null]); if (P.trans) items.push([`${L[1]}${p === 's' ? 'ₛ' : 'ₚ'}`, p === 's' ? 'violet' : 'teal', [6, 4]]); }
      const g = ctx;
      g.save(); g.font = `600 ${fs}px Inter, system-ui, sans-serif`;
      for (let i = items.length - 1; i >= 0; i--) {
        const [txt, col, dash] = items[i];
        const tw = g.measureText(txt).width;
        main.text(txt, lx, main.T - 12, { screen: true, color: col, size: fs, weight: 600, align: 'right' });
        lx -= tw + 4;
        main.line(main.ix(lx - 18), main.iy(main.T - 12), main.ix(lx - 2), main.iy(main.T - 12), { color: col, width: 2, dash: dash || [] });
        lx -= 30;
      }
      g.restore();
      main.text(show === 'amplitude' ? 'amplitude ratio' : 'fraction of power', main.L + 2, main.T - 12, { screen: true, color: 'ink2', size: fs, weight: 600 });
    }
    main.drawHandles();
    if (wide) drawSketch(split);
    readout();
  }

  // a small picture of the interface with the three rays, brightness from the Fresnel powers
  function drawSketch(split) {
    const { n1, n2, angle } = F.params;
    side.o.pad = { l: 6, r: main.w - split + 8, t: 8, b: 8 };
    side.setView([-1.15, 1.15], [-1, 1]);
    side.o.equal = true;
    side.resize();
    const f = M.coefficients(n1, n2, angle * D);
    const tint = (n) => Math.min(0.4, 0.05 + 0.2 * (n - 1));
    const X0 = side.vx0, X1 = side.vx1;
    ctx.save();
    ctx.globalAlpha = tint(n1); ctx.fillStyle = side.color('accent');
    ctx.fillRect(side.X(X0), side.Y(side.vy1), side.X(X1) - side.X(X0), side.Y(0) - side.Y(side.vy1));
    ctx.globalAlpha = tint(n2);
    ctx.fillRect(side.X(X0), side.Y(0), side.X(X1) - side.X(X0), side.Y(side.vy0) - side.Y(0));
    ctx.restore();
    side.line(X0, 0, X1, 0, { color: 'ink3', width: 1.4 });
    side.line(0, 0.95, 0, -0.95, { color: 'ink3', width: 1, dash: [4, 4] });
    const th = angle * D, L = 0.9;
    side.arrow(-Math.sin(th) * L, Math.cos(th) * L, 0, 0, { color: 'gold', width: 2.6 });
    side.arrow(0, 0, Math.sin(th) * L, Math.cos(th) * L, { color: 'gold', width: 2.6, alpha: 0.25 + 0.75 * Math.sqrt(f.R) });
    if (!f.tir) {
      const t2 = Math.asin((n1 * Math.sin(th)) / n2);
      side.arrow(0, 0, Math.sin(t2) * L, -Math.cos(t2) * L, { color: 'gold', width: 2.6, alpha: 0.25 + 0.75 * Math.sqrt(f.T) });
    }
    if (P.labels) {
      side.text(`n₁ = ${n1.toFixed(2)}`, X0, 0.82, { color: 'ink2', size: 11, dx: 6 });
      side.text(`n₂ = ${n2.toFixed(2)}`, X0, -0.82, { color: 'ink2', size: 11, dx: 6 });
      if (f.tir) side.text('total reflection', 0.08, -0.35, { color: 'bad', size: 11, weight: 600 });
    }
  }

  // ── evanescent ──────────────────────────────────────────────────────────
  function drawEvanescent() {
    const { n1, n2, angle } = F.params;
    const gap = P.gap === null ? null : +F.params.gap;
    const W = main.w, panel = P.panel !== 'none' && W >= 420 ? P.panel : 'none';
    const split = panel !== 'none' ? Math.round(W * 0.64) : W;
    const lam = P.lambda * 1e-9, th = angle * D;
    const n3 = gap === null ? n2 : n1;
    const S = M.layer({ n1, n2: gap === null ? n1 : n2, n3, th, d: gap === null ? 0 : gap * lam, lambda: lam, pol: 's' });
    // the map, in vacuum wavelengths
    const yTop = 1.6, yBot = -(gap === null ? 1.6 : Math.max(1.6, gap + 1.1));
    main.o.pad = { l: 8, r: W - split + 8, t: 8, b: 8 };
    main.o.equal = false;
    main.setView([0, 3.2], [yBot, yTop]);
    main.resize(); main.refreshTheme();
    ctx.clearRect(0, 0, W, main.h);
    const nx = Math.max(60, Math.round((main.R - main.L) / 4)), ny = Math.max(40, Math.round((main.B - main.T) / 4));
    const cw = (main.R - main.L) / nx, ch = (main.B - main.T) / ny;
    const ph = M.exp([0, -st.phase]);
    const pos = main.color('warn'), neg = main.color('accent');
    for (let j = 0; j < ny; j++) {
      const y = main.iy(main.T + (j + 0.5) * ch);
      for (let i = 0; i < nx; i++) {
        const x = main.ix(main.L + (i + 0.5) * cw);
        const v = M.mul(S.field(x * lam, y * lam), ph)[0];
        ctx.globalAlpha = Math.min(0.9, Math.abs(v) / 2.0 * 0.95);
        ctx.fillStyle = v >= 0 ? pos : neg;
        ctx.fillRect(main.L + i * cw, main.T + j * ch, cw + 0.6, ch + 0.6);
      }
    }
    ctx.globalAlpha = 1;
    main.line(0, 0, 3.2, 0, { color: 'ink', width: 1.6 });
    if (gap !== null) main.line(0, -gap, 3.2, -gap, { color: 'ink', width: 1.6 });
    // the incident and reflected directions
    const ax = 0.25, ay = yTop - 0.15, L = 0.55;
    main.arrow(ax, ay, ax + Math.sin(th) * L, ay - Math.cos(th) * L, { color: 'ink', width: 2 });
    if (P.labels) {
      const fs = W < 520 ? 10.5 : 11.5;
      main.text(`n₁ = ${n1.toFixed(2)}`, 3.2, yTop - 0.15, { color: 'ink', size: fs, align: 'right', dx: -6, weight: 600 });
      if (gap === null) main.text(`n₂ = ${n2.toFixed(2)}`, 3.2, -0.2, { color: 'ink', size: fs, align: 'right', dx: -6, weight: 600 });
      else {
        if (gap > 0.12) main.text(`gap n₂ = ${n2.toFixed(2)}`, 3.2, -gap / 2, { color: 'ink', size: fs, align: 'right', dx: -6, weight: 600 });
        main.text(`n₁ = ${n1.toFixed(2)}`, 3.2, yBot + 0.15, { color: 'ink', size: fs, align: 'right', dx: -6, weight: 600 });
      }
      main.text('incident', ax + Math.sin(th) * L, ay - Math.cos(th) * L, { color: 'ink', size: fs, dx: 6 });
    }
    // the side panel
    if (panel === 'profile') {
      side.o.equal = false;
      side.o.pad = { l: split + 30, r: 12, t: 8, b: 8 };
      side.setView([0, 2.2], [yBot, yTop]);
      side.resize();
      side.line(0, yBot, 0, yTop, { color: 'ink3', width: 1 });
      side.line(0, 0, 2.2, 0, { color: 'ink', width: 1.2 });
      if (gap !== null) side.line(0, -gap, 2.2, -gap, { color: 'ink', width: 1.2 });
      side.fn(() => 0, { color: 'ink3' });
      const pts = [];
      for (let i = 0; i <= 300; i++) { const y = yBot + ((yTop - yBot) * i) / 300; pts.push([Math.min(2.2, M.abs(S.field(0, y * lam))), y]); }
      side.path(pts, { color: 'gold', width: 2.2 });
      const K = M.kappa(n1, gap === null ? n2 : n2, th, lam);
      if (K > 0 && !hide.has('delta')) {
        const dl = 1 / K / lam, a0 = M.abs(S.field(0, 0));
        if (dl < -yBot) {
          side.line(0, -dl, 2.2, -dl, { color: 'violet', width: 1.2, dash: [3, 3] });
          side.text('δ', 2.2, -dl, { color: 'violet', size: 12, align: 'right', dx: -4, dy: -8, weight: 700 });
        }
        void a0;
      }
      side.text('|E|', 2.2, yTop, { color: 'ink2', size: 11, align: 'right', dx: -4, dy: 8 });
    } else if (panel === 'tunnel') {
      side.o.equal = false;
      side.o.pad = { l: split + 36, r: 10, t: 22, b: 30 };
      side.o.xlabel = 'gap / λ₀'; side.o.xticks = 3; side.o.yticks = 4;
      side.setView([0, 1.5], [0, 1.05]);
      side.resize();
      side.grid(); side.axes();
      const Tof = (pol) => (x) => M.layer({ n1, n2, n3: n1, th, d: x * lam, lambda: lam, pol }).T;
      side.fn(Tof('s'), { color: 'violet', width: 2, samples: 160 });
      side.fn(Tof('p'), { color: 'teal', width: 2, samples: 160 });
      if (gap !== null) side.line(gap, 0, gap, 1.05, { color: 'gold', width: 1.4 });
      side.text('T', side.L + 4, side.T - 12, { screen: true, color: 'ink2', size: 11, weight: 600 });
      side.text('s', side.X(0.12), side.Y(Tof('s')(0.12)), { color: 'violet', size: 11, weight: 700, dx: 6, dy: -6 });
    }
    readout(S);
  }

  function readout(S) {
    if (P.readout === false) { F.readout([]); return; }
    const { n1, n2, angle } = F.params, th = angle * D;
    const f = M.coefficients(n1, n2, th);
    const crit = M.critical(n1, n2), brew = M.brewster(n1, n2);
    const cxs = (z) => (Math.abs(z[1]) < 1e-9 ? trim(z[0]) : `${trim(M.abs(z))}\\angle{${trim(M.arg(z) / D, 3)}^\\circ}`);
    const pct = (x) => `${trim(100 * x, 3)}\\%`;
    const val = {
      angle: ['$\\theta_1$', `${trim(angle)}^\\circ`],
      brewster: ['Brewster $\\theta_B$', `${trim(brew / D)}^\\circ`],
      critical: ['critical $\\theta_c$', Number.isNaN(crit) ? '\\text{none}' : `${trim(crit / D)}^\\circ`],
      rs: ['$r_s$', cxs(f.rs)], rp: ['$r_p$', cxs(f.rp)],
      ts: ['$t_s$', f.tir ? '\\text{(evanescent)}' : trim(f.ts[0])], tp: ['$t_p$', f.tir ? '\\text{(evanescent)}' : trim(f.tp[0])],
      Rs: ['$R_s$', pct(f.Rs)], Rp: ['$R_p$', pct(f.Rp)], Ts: ['$T_s$', pct(f.Ts)], Tp: ['$T_p$', pct(f.Tp)],
      delta: ['depth $\\delta$', (() => { const dd = M.penetration(n1, n2, th, P.lambda * 1e-9); return Number.isFinite(dd) ? `${trim(dd * 1e9)}\\ \\mathrm{nm} = ${trim(dd / (P.lambda * 1e-9))}\\,\\lambda_0` : '\\text{no evanescent wave}'; })()],
      T: ['through the gap $T_s$', S && P.gap !== null ? pct(S.T) : '\\text{—}'],
    };
    const def = evan ? ['angle', 'critical', 'delta', ...(P.gap !== null ? ['T'] : [])]
      : F.params.show === 'amplitude' ? ['angle', 'rs', 'rp', 'brewster', 'critical'] : ['angle', 'Rs', 'Rp', 'brewster', 'critical'];
    const rows = (P.readouts || def).filter((k) => val[k] && !hide.has(k));
    F.readout(rows.map((k) => val[k]));
  }

  function draw() { if (evan) drawEvanescent(); else drawCoeffs(); }

  // drag the angle: on the graph's gold line, or the sketch's incident ray
  if (!evan && has('angle')) {
    main.handle(() => [F.params.angle, main.vy1 - 0.06 * (main.vy1 - main.vy0)], (x) => { F.set('angle', clamp(Math.round(x * 2) / 2, 0, 89.5)); }, { hollow: true });
    main.onDrag = () => draw();
    side.handle(() => { const t = F.params.angle * D; return [-Math.sin(t) * 0.9, Math.cos(t) * 0.9]; },
      (x, y) => { if (main.w * 0.34 < 100 || main.w < 520 || !P.sketch) return; F.set('angle', clamp(Math.round((Math.atan2(-x, Math.max(1e-6, y)) / D) * 2) / 2, 0, 89.5)); }, { hollow: true });
    side.onDrag = () => draw();
  }

  F.draw(draw);
  F.caption(evan
    ? (P.gap === null
      ? 'The s-polarized electric field (out of the page) at one instant: orange positive, blue negative. Ideal, lossless media and an infinitely wide beam; real beams are finite, and the reflected one is shifted slightly along the surface (the Goos–Hänchen shift), which is not drawn.'
      : 'The s-polarized electric field (out of the page) at one instant, with a gap of medium 2 between two blocks of medium 1. Exact plane-wave solution for ideal, lossless media; the transmission graph shows s (violet) and p (teal) light.')
    : 'Exact Fresnel equations for smooth, non-absorbing, non-magnetic media. Amplitude signs follow Hecht’s convention (r_s and r_p have opposite signs at normal incidence); dashed curves are transmission. Beyond the critical angle all the power is reflected and r is complex, with magnitude 1.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const P = { ...defaults, ...P0 };
  const out = [];
  if (!VIEWS.includes(P.view)) return [`op-fresnel: view must be one of ${VIEWS.join(', ')}`];
  for (const k of ['n1', 'n2']) if (!(typeof P[k] === 'number' && P[k] >= 1 && P[k] <= 3)) out.push(`op-fresnel: ${k} must lie in [1, 3]`);
  if (!(typeof P.angle === 'number' && P.angle >= 0 && P.angle <= 89.9)) out.push('op-fresnel: angle must lie in [0, 89.9]°');
  if (!['amplitude', 'power'].includes(P.show)) out.push('op-fresnel: show must be amplitude or power');
  if (!Array.isArray(P.pols) || !P.pols.length || P.pols.some((p) => p !== 's' && p !== 'p')) out.push('op-fresnel: pols must be a list of s, p');
  if (P.gap !== null && !(typeof P.gap === 'number' && P.gap >= 0 && P.gap <= 1.5)) out.push('op-fresnel: gap must be null or a width in [0, 1.5] wavelengths');
  if (!['profile', 'tunnel', 'none'].includes(P.panel)) out.push('op-fresnel: panel must be profile, tunnel or none');
  if (P.panel === 'tunnel' && P.view === 'evanescent' && P.gap === null) out.push('op-fresnel: the tunnel panel needs a gap');
  if (!(P.lambda >= 200 && P.lambda <= 20000)) out.push('op-fresnel: lambda (nm) must lie in [200, 20000]');
  if (!(P.controls === null || P.controls === true || P.controls === false || (Array.isArray(P.controls) && P.controls.every((c) => CONTROLS.includes(c))))) out.push(`op-fresnel: controls must be true, false, null or a list of ${CONTROLS.join(', ')}`);
  for (const r of [...(P.hide || []), ...(P.readouts || [])]) if (!ROWS.includes(r)) out.push(`op-fresnel: unknown readout or mark “${r}”`);
  if (P.play !== null && typeof P.play !== 'boolean') out.push('op-fresnel: play must be true, false or null');
  return out;
}
