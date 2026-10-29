// Fresnel (near-field) diffraction (PHYS 4650 O8.3). Physics in
// model/op3-fresnel.js (tested headlessly in test/op3-fresnel.test.mjs):
// scalar, paraxial, obliquity factor 1. Two modes:
//
//   zones   a plane wave on a circular hole (or an opaque disc) of radius a,
//           seen on the axis at distance L. Left: the opening face on, with
//           its half-period zones coloured alternately (gold odd, violet
//           even). Middle: the vibration curve — each zone's contribution as
//           a little arrow laid head to tail, a circle whose centre is the
//           unobstructed field — and the resultant. Right: the on-axis
//           irradiance against the Fresnel number N_F = a²/(λL), with the
//           current value marked. Behind a disc the spot on the axis is as
//           bright as with no disc at all (Arago/Poisson).
//   edge    a straight edge (kind 'edge') or a slit (kind 'slit') of width w:
//           the Cornu spiral (C(v), S(v)) with the stretch that the opening
//           uncovers for a probe point and the chord whose length² is the
//           irradiance; beside it the irradiance across the screen, the
//           geometric shadow shaded, the probe draggable.
//
//   { type: 'op3-fresnel', params: {
//       mode: 'zones',
//       // zones: a 1 (mm, 0.05–10), L 1 (m, 0.05–20), lambda 633 (nm, 380–1100), obstacle 'hole' | 'disc'
//       // edge:  kind 'edge' | 'slit', w 1 (mm, slit width, 0.02–10), L 1 (m), lambda 633 (nm),
//       //        y null (mm, the probe; default 0), view null ([y0, y1] in mm; default fitted at the start)
//       panels: null,          // zones: any of 'face', 'phasor', 'axis'; edge: 'cornu', 'pattern' (default all that fit)
//       controls: null,        // true, false or a list of: a L lambda obstacle | kind w L lambda y (default all when not compact)
//       readout: true,
//       hide: [],              // readout rows not to show (the answer): NF rho1 I v
//       labels: true,
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/op3-fresnel.js';

export const defaults = { mode: 'zones', panels: null, controls: null, readout: true, hide: [], labels: true };
const MODES = ['zones', 'edge'];
const MODE_DEFAULTS = {
  zones: { a: 1, L: 1, lambda: 633, obstacle: 'hole' },
  edge: { kind: 'edge', w: 1, L: 1, lambda: 633, y: null, view: null },
};
const CONTROLS = { zones: ['a', 'L', 'lambda', 'obstacle'], edge: ['kind', 'w', 'L', 'lambda', 'y'] };
const PANELS = { zones: ['face', 'phasor', 'axis'], edge: ['cornu', 'pattern'] };
const ROWS = ['NF', 'rho1', 'I', 'v'];
const trim = (x, n = 3) => (Number.isFinite(x) ? String(+(+x).toPrecision(n)) : '\\text{—}');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export function mount(F, P0) {
  const mode = MODES.includes(P0.mode) ? P0.mode : 'zones';
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  const hide = new Set(P.hide || []);
  const want = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS[mode] : Array.isArray(P.controls) ? P.controls : [];
  const slider = (o) => (want.includes(o.key) ? F.slider(o) : ((F.params[o.key] = o.value), null));
  const choice = (o) => (want.includes(o.key) ? F.choice(o) : ((F.params[o.key] = o.value), null));

  // the edge mode's window on the screen, fixed at the start so that changes show as growth
  let view = P.view;
  if (mode === 'edge' && !view) {
    const s = 1e3 / M.vScale(P.lambda * 1e-9, P.L);          // mm per unit of v
    const half = P.kind === 'slit' ? P.w / 2 + 4.5 * s : 0;
    view = P.kind === 'slit' ? [-half, half] : [-3.5 * s, 7 * s];
    view = view.map((v) => +v.toPrecision(2));
  }

  if (mode === 'zones') {
    slider({ key: 'a', label: 'Radius of the opening $a$', min: 0.05, max: 10, value: P.a, logScale: true, fmt: (v) => trim(v, 3), unit: '\\mathrm{mm}', explain: 'The hole’s radius — or the disc’s.' });
    slider({ key: 'L', label: 'Distance to the screen $L$', min: 0.05, max: 20, value: P.L, logScale: true, fmt: (v) => trim(v, 3), unit: '\\mathrm{m}', explain: 'Where on the axis you look. Moving closer packs more zones into the opening.' });
    slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 380, max: 1100, step: 1, value: P.lambda, unit: '\\mathrm{nm}', explain: 'The light’s wavelength (a plane wave arrives from the left).' });
    choice({ key: 'obstacle', label: 'Screen', options: [['hole', 'A round hole'], ['disc', 'A round disc']], value: P.obstacle, explain: 'An opening in a dark screen, or the opposite: an opaque disc in open light.' });
  } else {
    choice({ key: 'kind', label: 'Obstacle', options: [['edge', 'Straight edge'], ['slit', 'Slit']], value: P.kind, explain: 'A half-plane blocking everything below y = 0, or a slit of width w centred on y = 0.' });
    slider({ key: 'w', label: 'Slit width $w$', min: 0.02, max: 10, value: P.w, logScale: true, fmt: (v) => trim(v, 3), unit: '\\mathrm{mm}', explain: 'Only used for the slit.' });
    slider({ key: 'L', label: 'Distance to the screen $L$', min: 0.05, max: 20, value: P.L, logScale: true, fmt: (v) => trim(v, 3), unit: '\\mathrm{m}', explain: 'The pattern widens as the square root of L.' });
    slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 380, max: 1100, step: 1, value: P.lambda, unit: '\\mathrm{nm}', explain: 'The light’s wavelength.' });
    slider({ key: 'y', label: 'Probe position $y$', min: view[0], max: view[1], step: +((view[1] - view[0]) / 400).toPrecision(2), value: P.y ?? 0, unit: '\\mathrm{mm}', explain: 'Where on the screen you look. Or drag the gold line.' });
  }
  F.onChange(() => draw());

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || (mode === 'zones'
    ? 'Fresnel zones in a round opening, their contributions added as a vibration curve, and the brightness on the axis'
    : 'The Cornu spiral and the diffraction pattern of a straight edge or a slit near the screen') });
  const ctx = canvas.getContext('2d');
  const A = new Plot(canvas, { grid: false, axes: false, equal: true });
  const B = new Plot(canvas, { grid: false, axes: false, equal: true });
  const Cp = new Plot(canvas, { grid: true, axes: true });

  // the Cornu spiral, sampled once
  const SPIRAL = [];
  for (let i = 0; i <= 1600; i++) { const v = -12 + (24 * i) / 1600; SPIRAL.push([v, ...M.fresnelCS(v)]); }
  const spiralPart = (v0, v1) => SPIRAL.filter(([v]) => v >= v0 && v <= v1).map(([, c, s]) => [c, s]);

  function layout() {
    const W = A.w || canvas.clientWidth || 600, H = A.h || canvas.clientHeight || 300;
    const fit = mode === 'zones' ? (W >= 560 ? 3 : 2) : 2;
    const panels = (Array.isArray(P.panels) ? P.panels : PANELS[mode]).filter((p) => PANELS[mode].includes(p)).slice(0, fit);
    return { W, H, panels };
  }
  /** Give a plot the column [x0, x1] of the canvas (pixels). */
  const place = (pl, x0, x1, pad = {}) => { pl.o.pad = { l: x0 + (pad.l ?? 8), r: (pl.w || canvas.clientWidth) - x1 + (pad.r ?? 8), t: pad.t ?? 22, b: pad.b ?? 10 }; };

  function draw() {
    A.resize(); B.resize(); Cp.resize(); A.refreshTheme(); B.refreshTheme(); Cp.refreshTheme();
    ctx.clearRect(0, 0, A.w, A.h);
    const { W, panels } = layout();
    const n = panels.length, colW = W / n;
    panels.forEach((p, i) => {
      const x0 = i * colW, x1 = (i + 1) * colW;
      if (p === 'face') drawFace(x0, x1);
      if (p === 'phasor') drawPhasor(x0, x1);
      if (p === 'axis') drawAxis(x0, x1);
      if (p === 'cornu') drawCornu(x0, x1);
      if (p === 'pattern') drawPattern(x0, x1);
    });
    readout();
  }

  const fs = () => (A.w < 520 ? 10.5 : 11.5);
  const title = (pl, s) => { if (P.labels) pl.text(s, pl.L, pl.T - 12, { screen: true, color: 'ink2', size: fs(), weight: 600 }); };

  // ── zones ─────────────────────────────────────────────────────────────────
  const zoneState = () => {
    const { a, L, lambda } = F.params, lam = lambda * 1e-9;
    const NF = M.fresnelNumber(a * 1e-3, lam, L);
    return { a, L, lam, NF, rho1: M.zoneRadius(1, lam, L) * 1e3 };
  };

  function drawFace(x0, x1) {
    const { a, NF, rho1 } = zoneState(), disc = F.params.obstacle === 'disc';
    const Rv = 1.3 * a;
    place(A, x0, x1, { b: 26 });
    A.setView([-Rv, Rv], [-Rv, Rv]);
    const cx = A.X(0), cy = A.Y(0), k = (A.X(Rv) - cx) / Rv;      // pixels per mm
    const kmax = (Rv / rho1) ** 2;                                   // zones out to the edge of the view
    // draw zones from the outside in, while they are at least 1.4 px wide
    const g = ctx;
    g.save();
    const mLast = Math.ceil(2 * kmax);                                // out to the corners
    let mDraw = mLast;
    while (mDraw > 1 && (Math.sqrt(mDraw) - Math.sqrt(mDraw - 1)) * rho1 * k < 1.4) mDraw--;
    const fill = (rmm, color, alpha) => { g.beginPath(); g.arc(cx, cy, Math.max(0, rmm * k), 0, 2 * Math.PI); g.fillStyle = A.color(color); g.globalAlpha = alpha; g.fill(); g.globalAlpha = 1; };
    g.beginPath(); g.rect(A.X(-Rv), A.Y(Rv), 2 * Rv * k, 2 * Rv * k); g.clip();
    if (mDraw < mLast) fill(Rv * 1.5, 'ink3', 0.35);                 // zones too fine to draw: an even grey
    for (let m = Math.min(mLast, mDraw); m >= 1; m--) fill(rho1 * Math.sqrt(m), m % 2 ? 'gold' : 'violet', 0.62);
    // the screen: dark outside a hole, a dark disc inside a disc
    g.fillStyle = A.color('void'); g.globalAlpha = 0.92;
    g.beginPath();
    if (disc) g.arc(cx, cy, a * k, 0, 2 * Math.PI);
    else { g.rect(A.X(-Rv) - 2, A.Y(Rv) - 2, 2 * Rv * k + 4, 2 * Rv * k + 4); g.arc(cx, cy, a * k, 0, 2 * Math.PI, true); }
    g.fill('evenodd'); g.globalAlpha = 1;
    g.restore();
    A.circle(0, 0, a, { color: 'ink2', width: 1.4 });
    if (P.labels) {
      title(A, disc ? 'disc and the zones around it' : 'the opening and its zones');
      A.text(`a = ${trim(a)} mm${mDraw < mLast ? ' · outer zones finer than a pixel' : ''}`, 0, -Rv, { color: 'ink2', size: fs() - 0.5, align: 'center', dy: 14 });
    }
  }

  function drawPhasor(x0, x1) {
    const { NF } = zoneState(), disc = F.params.obstacle === 'disc';
    place(B, x0, x1);
    B.setView([-0.35, 2.35], [-1.3, 1.3]);
    const phi = M.rimPhase(NF);
    // the whole circle, faint: every zone, out to infinity
    B.curve((t) => M.vibration(t)[0], (t) => M.vibration(t)[1], 0, 2 * Math.PI, { color: 'ink3', width: 1.2, samples: 200 });
    // the open zones, bright
    if (!disc) B.curve((t) => M.vibration(t)[0], (t) => M.vibration(t)[1], 0, Math.min(phi, 2 * Math.PI * 30), { color: 'gold', width: 2.6, samples: 400 });
    else B.curve((t) => M.vibration(t)[0], (t) => M.vibration(t)[1], phi, phi + 2 * Math.PI, { color: 'gold', width: 2.6, samples: 300, alpha: 0.5 });
    const [ex, ey] = M.vibration(phi);
    B.arrow(0, 0, 1, 0, { color: 'ink3', width: 1.4, dash: [4, 4] });
    if (!disc) B.arrow(0, 0, ex, ey, { color: 'accent', width: 2.6 });
    else B.arrow(ex, ey, 1, 0, { color: 'accent', width: 2.6 });
    B.point(0, 0, { r: 3, color: 'ink2' });
    B.point(1, 0, { r: 3, color: 'ink2' });
    if (P.labels) {
      title(B, 'zones added head to tail');
      B.text('no screen', 0.5, 0, { color: 'ink3', size: fs() - 0.5, dy: 12, align: 'center' });
      const tx = disc ? ex + 0.75 * (1 - ex) : 0.75 * ex, ty = disc ? ey + 0.75 * (0 - ey) : 0.75 * ey;
      B.text(disc ? 'outer zones' : 'resultant', tx, ty, { color: 'accent', size: fs() - 0.5, dx: 6, dy: -12 });
    }
  }

  function drawAxis(x0, x1) {
    const { NF } = zoneState(), disc = F.params.obstacle === 'disc';
    const xmax = Math.max(4, Math.min(24, Math.ceil(NF + 1.5)));
    place(Cp, x0, x1, { l: 34, t: 22, b: 30 });
    Cp.o.xlabel = 'Fresnel number a²/(λL)'; Cp.o.ylabel = ''; Cp.o.xticks = 4; Cp.o.yticks = 4;
    Cp.setView([0, xmax], [0, 4.4]);
    Cp.grid(); Cp.axes();
    Cp.fn((x) => (disc ? 1 : M.holeOnAxis(x)), { color: 'gold', width: 2.2, samples: 600 });
    const I = disc ? 1 : M.holeOnAxis(NF);
    if (NF <= xmax) Cp.point(NF, I, { r: 5, color: 'accent' });
    if (P.labels) title(Cp, 'brightness on the axis, I / I₀');
  }

  // ── edge and slit ───────────────────────────────────────────────────────────
  const edgeState = () => {
    const { L, lambda, w, kind } = F.params, lam = lambda * 1e-9;
    const sc = M.vScale(lam, L) * 1e-3;            // per mm
    return { L, lam, w, kind, sc };
  };
  /** v-limits of the open part, seen from screen position y (mm). */
  const limits = (y, st) => (st.kind === 'slit' ? [(-st.w / 2 - y) * st.sc, (st.w / 2 - y) * st.sc] : [-y * st.sc, Infinity]);
  const irr = (y, st) => { const [v1, v2] = limits(y, st); return v2 === Infinity ? M.edgeIntensity(-v1) : M.slitIntensity(v1, v2); };

  function drawCornu(x0, x1) {
    const st = edgeState(), y = F.params.y;
    place(A, x0, x1);
    A.setView([-0.85, 0.85], [-0.85, 0.85]);
    A.line(-0.9, 0, 0.9, 0, { color: 'ink4', width: 1 }); A.line(0, -0.9, 0, 0.9, { color: 'ink4', width: 1 });
    A.path(SPIRAL.map(([, c, s]) => [c, s]), { color: 'ink3', width: 1.2 });
    const [v1, v2] = limits(y, st);
    // the open stretch, drawn bold only to |v| = 5 (beyond, it winds into the eye)
    A.path(spiralPart(Math.max(v1, -5), Math.min(v2, 5)), { color: 'gold', width: 2.2 });
    const p1 = M.fresnelCS(v1), p2 = v2 === Infinity ? [0.5, 0.5] : M.fresnelCS(v2);
    A.arrow(p1[0], p1[1], p2[0], p2[1], { color: 'accent', width: 2.4 });
    A.point(0.5, 0.5, { r: 3, color: 'ink2' }); A.point(-0.5, -0.5, { r: 3, color: 'ink2' });
    if (P.labels) {
      title(A, 'Cornu spiral (C, S)');
      A.text('v → ∞', 0.5, 0.5, { color: 'ink3', size: fs() - 0.5, dx: 16, dy: 0 });
      A.text('v → −∞', -0.5, -0.5, { color: 'ink3', size: fs() - 0.5, dx: -16, dy: 0, align: 'right' });
    }
  }

  function drawPattern(x0, x1) {
    const st = edgeState(), y = F.params.y;
    const N = 360, xs = [], Is = [];
    for (let i = 0; i <= N; i++) { const yy = view[0] + ((view[1] - view[0]) * i) / N; xs.push(yy); Is.push(irr(yy, st)); }
    const ymax = Math.max(1.6, Math.ceil(Math.max(...Is) * 5.5) / 5);
    place(Cp, x0, x1, { l: 34, t: 22, b: 30 });
    Cp.o.xlabel = 'position on the screen y (mm)'; Cp.o.ylabel = ''; Cp.o.xticks = 5; Cp.o.yticks = 4;
    Cp.setView(view, [0, ymax]);
    Cp.grid(); Cp.axes();
    // the geometric shadow
    if (st.kind === 'slit') { Cp.rect(view[0], 0, -st.w / 2 - view[0], ymax, { color: 'ink3', alpha: 0.18, stroke: false }); Cp.rect(st.w / 2, 0, view[1] - st.w / 2, ymax, { color: 'ink3', alpha: 0.18, stroke: false }); }
    else Cp.rect(view[0], 0, 0 - view[0], ymax, { color: 'ink3', alpha: 0.18, stroke: false });
    Cp.line(view[0], 1, view[1], 1, { color: 'ink3', width: 1, dash: [4, 4] });
    Cp.path(xs.map((x, i) => [x, Is[i]]), { color: 'gold', width: 2.2 });
    Cp.line(y, 0, y, ymax, { color: 'accent', width: 1.6 });
    Cp.drawHandles();
    if (P.labels) {
      title(Cp, A.w < 520 ? 'I / I₀, shadow shaded' : 'irradiance I / I₀ (shadow shaded)');
    }
  }
  if (mode === 'edge') {
    Cp.handle(() => [F.params.y, Cp.vy1 - 0.08 * (Cp.vy1 - Cp.vy0)], (x) => { F.set('y', clamp(+x.toPrecision(3), view[0], view[1])); }, { hollow: true });
    Cp.onDrag = () => draw();
  }

  function readout() {
    if (P.readout === false) { F.readout([]); return; }
    const rows = [];
    if (mode === 'zones') {
      const { NF, rho1 } = zoneState(), disc = F.params.obstacle === 'disc';
      if (!hide.has('NF')) rows.push(['Fresnel number $N_F$', trim(NF)]);
      if (!hide.has('rho1')) rows.push(['first zone $\\rho_1$', `${trim(rho1)}\\ \\mathrm{mm}`]);
      if (!hide.has('I')) rows.push(['on the axis $I/I_0$', trim(disc ? 1 : M.holeOnAxis(NF))]);
    } else {
      const st = edgeState(), y = F.params.y;
      if (!hide.has('v')) rows.push(['probe $v = y\\sqrt{2/\\lambda L}$', trim(y * st.sc)]);
      if (!hide.has('I')) rows.push(['$I/I_0$ at the probe', trim(irr(y, st))]);
      if (st.kind === 'slit' && !hide.has('NF')) rows.push(['slit’s $N_F = (w/2)^2/\\lambda L$', trim(((st.w / 2) * 1e-3) ** 2 / (st.lam * st.L))]);
    }
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(mode === 'zones'
    ? 'Scalar, paraxial diffraction of a plane wave, with the obliquity factor taken as 1, so the vibration curve is a circle; really it spirals slowly inward over thousands of zones, toward the centre that is the unobstructed field. Zones are coloured alternately; the screen is dark.'
    : 'Scalar, paraxial Fresnel diffraction of a plane wave by a straight edge or a slit (infinitely long). The irradiance at a point is the squared length of the chord across the part of the spiral the opening uncovers, in units where the unobstructed light gives 1.');
  return { get: (k) => F.params[k] };
}

export function validate(P0) {
  const mode = P0.mode ?? 'zones';
  if (!MODES.includes(mode)) return [`op3-fresnel: mode must be one of ${MODES.join(', ')}`];
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  const out = [];
  const num = (k, lo, hi) => { if (!(typeof P[k] === 'number' && P[k] >= lo && P[k] <= hi)) out.push(`op3-fresnel: ${k} must lie in [${lo}, ${hi}] (got ${P[k]})`); };
  num('L', 0.05, 20); num('lambda', 380, 1100);
  if (mode === 'zones') {
    num('a', 0.05, 10);
    if (!['hole', 'disc'].includes(P.obstacle)) out.push('op3-fresnel: obstacle must be hole or disc');
  } else {
    num('w', 0.02, 10);
    if (!['edge', 'slit'].includes(P.kind)) out.push('op3-fresnel: kind must be edge or slit');
    if (P.view !== null && !(Array.isArray(P.view) && P.view.length === 2 && P.view[0] < P.view[1])) out.push('op3-fresnel: view must be null or [y0, y1] with y0 < y1');
    if (P.y !== null && typeof P.y !== 'number') out.push('op3-fresnel: y must be null or a number (mm)');
  }
  if (!(P.controls === null || P.controls === true || P.controls === false || (Array.isArray(P.controls) && P.controls.every((c) => CONTROLS[mode].includes(c))))) out.push(`op3-fresnel: controls must be true, false, null or a list of ${CONTROLS[mode].join(', ')}`);
  if (P.panels !== null && !(Array.isArray(P.panels) && P.panels.length && P.panels.every((p) => PANELS[mode].includes(p)))) out.push(`op3-fresnel: panels must be null or a list of ${PANELS[mode].join(', ')}`);
  if (!Array.isArray(P.hide) || P.hide.some((h) => !ROWS.includes(h))) out.push(`op3-fresnel: hide must list some of ${ROWS.join(', ')}`);
  for (const k of ['readout', 'labels']) if (typeof P[k] !== 'boolean') out.push(`op3-fresnel: ${k} must be true or false`);
  return out;
}
