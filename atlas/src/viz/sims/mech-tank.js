// Fluids at rest: pressure at depth, manometers and barometers, and buoyancy.
// Three scenes; the physics is model/mech-fluids.js (tested headlessly in
// test/mech-fluids.test.mjs).
//
//   vessels  one to four vessels of different shapes, joined at the base and
//            filled to one level — or a single closed tank with gas (ullage)
//            above the liquid. A probe at depth h reads the same pressure in
//            every vessel, whatever its shape: p = p₀ + ρgh. Beside them, p
//            against depth on the same vertical scale. An optional sensor
//            membrane can be turned: the pressure force on each face stays
//            perpendicular to it and the same size — pressure has no direction.
//   utube    a U-tube manometer (one arm on a gas at pressure p, the other open
//            to the air) or a barometer (a closed tube, vacuum above the
//            column, standing in a dish). The level difference is Δp/(ρg).
//   buoy     a block in a tank, hung from a spring scale and lowered in, or let
//            go to float or sink. Weight, buoyant force and the scale's pull
//            (or the floor's push) are drawn to one scale.
//
//   { type: 'mech-tank', params: {
//       scene: 'vessels',
//       fluid: 'water', rho: null,       // a name (water seawater mercury lox rp1 lh2 oil), or rho in kg/m³
//       fluids: ['water', 'mercury'],    // the fluid choice offered (default: a sensible set per scene)
//       g: 9.8,                          // gravity — or an effective g (a tank on an accelerating rocket)
//       sliders: true,                   // or a list of control keys (see SETS below); none by default
//       values: true,                    // print numbers on the picture (false for a question's picture)
//       readout: null,                   // the live readout bar (default: on when there are controls)
//     // vessels
//       shapes: ['column', 'wide', 'flare', 'flask'],   // 1–4 of: column wide flare flask slant tank
//       H: 2, depth: 1,                  // liquid level above the base (m); probe depth (m) — null: no probe
//       p0: 101325, closed: false,       // pressure on the surface (Pa); closed: one tank, gas above at p0
//       gauge: false, graph: true,       // print p − p_atm; the p–depth graph beside the vessels
//       sensor: false, tilt: 0,          // a turnable sensor membrane at the first probe (degrees)
//     // utube
//       mode: 'manometer',               // or 'barometer'
//       p: 120000, patm: 101325,         // gas pressure in the closed arm; the air's pressure (Pa)
//     // buoy
//       rhoObj: 2700, V: 0.001,          // the block's density (kg/m³) and volume (m³)
//       hold: 'scale', depth: 0.15,      // 'scale' (lowered until its bottom is `depth` m under) or 'free'
//       tankDepth: null,                 // liquid depth in the tank (m; default fitted to the block)
//   } }

import { Plot } from '../plot.js';
import * as MF from '../model/mech-fluids.js';

const SCENES = ['vessels', 'utube', 'buoy'];
const SHAPES = ['column', 'wide', 'flare', 'flask', 'slant', 'tank'];
const SETS = {
  vessels: ['depth', 'H', 'fluid', 'p0', 'g', 'tilt', 'gauge'],
  utube: ['p', 'patm', 'fluid'],
  buoy: ['rhoObj', 'V', 'depth', 'fluid', 'hold'],
};
const USUAL = { vessels: ['depth', 'fluid'], closed: ['depth', 'p0', 'g'], manometer: ['p', 'fluid'], barometer: ['patm', 'fluid'], buoy: ['rhoObj', 'V', 'depth', 'fluid', 'hold'] };
const FLUID_SETS = { vessels: ['water', 'seawater', 'mercury', 'lox', 'rp1'], utube: ['mercury', 'water', 'oil'], buoy: ['water', 'seawater', 'mercury', 'lox'] };
const TINT = { water: 'accent', seawater: 'teal', mercury: 'ink3', lox: 'accent2', rp1: 'warn', lh2: 'violet', oil: 'gold', air: 'ink4', fluid: 'accent' };

export const defaults = {
  scene: 'vessels', fluid: 'water', rho: null, fluids: null, g: MF.G, sliders: null, values: true, readout: null,
  shapes: ['column', 'wide', 'flare', 'flask'], H: 2, depth: undefined, p0: MF.P_ATM, closed: false, gauge: false, graph: true, sensor: false, tilt: 0,
  mode: 'manometer', p: 120000, patm: MF.P_ATM,
  rhoObj: 2700, V: 0.001, hold: 'scale', tankDepth: null,
};

// ─── number formats for canvas labels and readouts ─────────────────────────
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const kPa = (p) => `${Math.abs(p) >= 100e3 ? (p / 1000).toFixed(1) : trim(p / 1000, 3)} kPa`;
const texkPa = (p) => `${Math.abs(p) >= 100e3 ? (p / 1000).toFixed(1) : trim(p / 1000, 3)}\\,\\mathrm{kPa}`;
const len = (m) => (Math.abs(m) >= 1 ? `${trim(m, 3)} m` : Math.abs(m) >= 0.01 ? `${trim(m * 100, 3)} cm` : `${trim(m * 1000, 3)} mm`);
const texLen = (m) => len(m).replace(/ (m|cm|mm)$/, '\\,\\mathrm{$1}');
const newtons = (f) => (Math.abs(f) >= 1000 ? `${trim(f / 1000, 3)} kN` : `${trim(f, 3)} N`);
const texN = (f) => newtons(f).replace(/ (k?N)$/, '\\,\\mathrm{$1}');

const usual = (P) => (P.scene === 'vessels' ? (P.closed ? USUAL.closed : USUAL.vessels) : P.scene === 'utube' ? USUAL[P.mode] : USUAL.buoy);
const wantedOf = (P) => (P.sliders === true ? usual(P) : Array.isArray(P.sliders) ? P.sliders : []);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  if (P.depth === undefined) P.depth = P.scene === 'buoy' ? 0.15 : P.H / 2;
  const compact = F.compact;
  const wanted = wantedOf(P);
  const { canvas } = F.canvas({
    aspect: P.aspect ?? (P.scene === 'buoy' && !compact ? '' : 'wide'),
    label: P.alt || { vessels: 'Vessels of different shapes filled with liquid to one level, with a pressure probe at a depth', utube: P.mode === 'barometer' ? 'A barometer: a liquid column held up by the air’s pressure' : 'A U-tube manometer comparing a gas pressure with the air’s', buoy: 'A block in a tank of liquid with its weight and the buoyant force' }[P.scene],
  });
  const ctx = canvas.getContext('2d');
  const A = new Plot(canvas, { grid: false, axes: false });   // the picture
  const B = new Plot(canvas, { grid: true, axes: true });     // the p–depth graph (vessels)

  // ── controls ──
  const fluidList = P.fluids || FLUID_SETS[P.scene];
  const kp = (pa) => Math.round(pa / 100) / 10;   // Pa → kPa, to 0.1
  for (const k of wanted) {
    if (k === 'fluid') F.choice({ key: 'fluid', label: P.scene === 'utube' ? 'Liquid in the tube' : 'Liquid', options: fluidList.map((f) => [f, MF.FLUIDS[f].label]), value: fluidList.includes(P.fluid) ? P.fluid : fluidList[0], explain: 'Each has its own density $\\rho$: ' + fluidList.map((f) => `${MF.FLUIDS[f].label} ${MF.FLUIDS[f].rho.toLocaleString('en-US')}`).join(', ') + ' kg/m³.' });
    if (P.scene === 'vessels') {
      if (k === 'depth') F.slider({ key: 'depth', label: 'Probe depth $h$', min: 0, max: P.H, step: niceStep(P.H / 100), value: Math.min(P.depth ?? 0, P.H), unit: '\\mathrm{m}', explain: 'How far below the liquid’s surface the probes sit.' });
      if (k === 'H') F.slider({ key: 'H', label: 'Liquid level $H$', min: 0.5, max: Math.max(12, P.H), step: 0.1, value: P.H, unit: '\\mathrm{m}', explain: 'Height of the surface above the base — the same in every joined vessel.' });
      if (k === 'p0') F.slider({ key: 'p0', label: P.closed ? 'Gas pressure $p_0$' : 'Surface pressure $p_0$', min: 0, max: P.closed ? Math.max(600, kp(P.p0)) : Math.max(150, kp(P.p0)), step: 0.1, value: kp(P.p0), unit: '\\mathrm{kPa}', explain: P.closed ? 'The pressure of the gas above the liquid: in a propellant tank, the ullage pressure.' : 'The air’s pressure on the surface: 101.3 kPa at sea level, about 0.6 kPa on Mars.' });
      if (k === 'g') F.slider({ key: 'g', label: 'Effective gravity $g$', min: 0, max: Math.max(50, P.g), step: 0.1, value: P.g, unit: '\\mathrm{m/s^2}', explain: 'On the pad, 9.8. On a rocket accelerating upward at $a$, the liquid presses as if $g$ were $9.8 + a$; in free fall, zero.' });
      if (k === 'gauge') F.toggle({ key: 'gauge', label: 'Gauge pressure', value: !!P.gauge, explain: 'Show $p - p_\\text{atm}$, the pressure above the atmosphere’s — what most gauges read.' });
      if (k === 'tilt') F.slider({ key: 'tilt', label: 'Sensor angle', min: 0, max: 180, step: 1, value: P.tilt, unit: '^\\circ', explain: 'Turn the sensor membrane: the pressure on it does not change.' });
    }
    if (P.scene === 'utube') {
      if (k === 'p') F.slider({ key: 'p', label: 'Gas pressure $p$', min: 50, max: Math.max(200, kp(P.p)), step: 0.5, value: kp(P.p), unit: '\\mathrm{kPa}', explain: 'Absolute pressure of the gas in the closed arm.' });
      if (k === 'patm') F.slider({ key: 'patm', label: 'Air pressure $p_\\text{atm}$', min: 30, max: Math.max(110, kp(P.patm)), step: 0.1, value: kp(P.patm), unit: '\\mathrm{kPa}', explain: '101.3 kPa at sea level; about 70 kPa at 3000 m.' });
    }
    if (P.scene === 'buoy') {
      if (k === 'rhoObj') F.slider({ key: 'rhoObj', label: 'Block density $\\rho_\\text{block}$', min: 100, max: 20000, value: P.rhoObj, logScale: true, unit: '\\mathrm{kg/m^3}', fmt: (v) => String(Math.round(v)), explain: 'Cork about 240, ice 917, aluminium 2700, steel 7800, gold 19 300.' });
      if (k === 'V') F.slider({ key: 'V', label: 'Block volume $V$', min: 0.1, max: 10, step: 0.1, value: +(P.V * 1000).toFixed(1), unit: '\\mathrm{L}', explain: 'One litre is $10^{-3}\\ \\text{m}^3$: a cube 10 cm on a side.' });
      if (k === 'depth') F.slider({ key: 'depth', label: 'Lowered to depth', min: -0.1, max: +tankOf(P, wanted.includes('V')).D.toFixed(2), step: 0.005, value: P.depth, unit: '\\mathrm{m}', explain: 'On the scale: how far the block’s bottom face is below the surface (negative: still in the air).' });
      if (k === 'hold') F.choice({ key: 'hold', label: 'The block is', options: [['scale', 'on a spring scale'], ['free', 'let go']], value: P.hold, explain: 'Let go, it floats if it is less dense than the liquid and sinks if it is denser.' });
    }
  }
  const showReadout = P.readout ?? wanted.length > 0;

  // the current values, in SI
  const val = (k) => (F.params[k] !== undefined ? F.params[k] : undefined);
  const env = () => {
    const fl = val('fluid') ?? P.fluid;
    const rho = val('fluid') !== undefined ? MF.FLUIDS[fl].rho : P.rho ?? MF.FLUIDS[fl]?.rho ?? 1000;
    const pa = (k) => (val(k) !== undefined ? val(k) * 1000 : P[k]);
    return {
      fl, rho, g: val('g') ?? P.g, H: val('H') ?? P.H, depth: val('depth') ?? P.depth, p0: pa('p0'), p: pa('p'), patm: pa('patm'),
      tilt: val('tilt') ?? P.tilt, gauge: val('gauge') ?? P.gauge, rhoObj: val('rhoObj') ?? P.rhoObj, V: val('V') !== undefined ? val('V') / 1000 : P.V, hold: val('hold') ?? P.hold,
    };
  };

  F.onChange((key) => {
    // a new liquid level moves the end of the depth slider
    if (key === 'H' && wanted.includes('depth')) {
      const input = canvas.closest('figure')?.querySelector('input[aria-label="Probe depth $h$"]');
      const H = F.params.H;
      if (input) { input.max = String(H); input.step = String(niceStep(H / 100)); }
      if (F.params.depth > H) F.set('depth', H);
    }
    draw();
  });

  function frame() {
    A.resize(); A.refreshTheme(); B.resize(); B.refreshTheme();
    ctx.clearRect(0, 0, A.w, A.h);
  }

  // ─── vessels ─────────────────────────────────────────────────────────────
  function drawVessels(e) {
    frame();
    const W = A.w, closed = P.closed, shapes = closed ? ['tank'] : P.shapes, n = shapes.length;
    const H = e.H, top = 0.22 * H, pipe = n > 1 ? 0.07 * H : 0;
    const graph = P.graph !== false;
    const split = graph ? Math.round(W * (W < 520 ? 0.5 : n > 2 ? 0.6 : 0.5)) : W;
    const yLo = -H - pipe - 0.04 * H, yHi = top + 0.16 * H;
    const padT = 24, padB = 26;
    // the vessels' region; a lone vessel or two without the graph stays tall rather than stretched.
    // A margin on its left holds the depth arrow and its label.
    const lab = P.values ? 76 : 18;
    let x0 = 0, x1 = split;
    if (!graph && n <= 2) { const want = n * (A.h - padT - padB) * 0.95 + lab + 30; if (want < W) { x0 = (W - want) / 2; x1 = x0 + want; } }
    A.o.pad = { l: x0 + lab + 6, r: W - x1 + 10, t: padT, b: padB };
    A.setView([0, n], [yLo, yHi]);
    const tint = TINT[e.fl] || 'accent';
    const alpha = e.fl === 'mercury' ? 0.55 : 0.32;
    const pAt = (d) => MF.pressureAt(e.p0, e.rho, d, e.g);
    const gauge = e.gauge;
    const shown = (p) => (gauge ? p - MF.P_ATM : p);

    // the connecting pipe along the base
    if (pipe) {
      A.rect(0.5 - 0.1, -H - pipe, n - 1 + 0.2, pipe, { color: tint, alpha, stroke: false });
      A.line(0.4, -H - pipe, n - 0.4, -H - pipe, { color: 'ink2', width: 2 });
      A.line(0.4, -H - pipe, 0.4, -H, { color: 'ink2', width: 2 });
      A.line(n - 0.4, -H - pipe, n - 0.4, -H, { color: 'ink2', width: 2 });
    }
    const outline = (k) => {
      const cx = k + 0.5, f = SHAPE[shapes[k]];
      const L = [], R = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40, y = -H + u * (H + top), [a, b] = f(u);
        L.push([cx + a, y]); R.push([cx + b, y]);
      }
      return { L, R, cx, f };
    };
    for (let k = 0; k < n; k++) {
      const { L, R } = outline(k);
      // liquid up to the surface (y = 0)
      const sub = (pts) => pts.filter(([, y]) => y <= 1e-9);
      const liquid = [...sub(L), ...sub(R).reverse()];
      // close exactly at the surface
      const fAt = SHAPE[shapes[k]](H / (H + top));
      liquid.splice(sub(L).length, 0, [k + 0.5 + fAt[0], 0], [k + 0.5 + fAt[1], 0]);
      A.path(liquid, { close: true, fill: tint, fillAlpha: alpha, stroke: false });
      if (closed) {
        // the gas above the liquid
        const gas = [[k + 0.5 + fAt[0], 0], ...L.filter(([, y]) => y > 0), ...R.filter(([, y]) => y > 0).reverse(), [k + 0.5 + fAt[1], 0]];
        A.path(gas, { close: true, fill: 'violet', fillAlpha: 0.1, stroke: false });
      }
      A.line(k + 0.5 + fAt[0], 0, k + 0.5 + fAt[1], 0, { color: tint, width: 2.2 });
      // walls, with the bottom open onto the pipe
      A.path(L, { color: 'ink2', width: 2.2 });
      A.path(R, { color: 'ink2', width: 2.2 });
      const [l0] = L, [r0] = R;
      if (pipe) {
        if (l0[0] < k + 0.4) A.line(l0[0], -H, k + 0.4, -H, { color: 'ink2', width: 2.2 });
        if (r0[0] > k + 0.6) A.line(k + 0.6, -H, r0[0], -H, { color: 'ink2', width: 2.2 });
      }
      else A.line(l0[0], -H, r0[0], -H, { color: 'ink2', width: 2.2 });
      if (closed) A.line(L[L.length - 1][0], top, R[R.length - 1][0], top, { color: 'ink2', width: 3 });
      if (pipe && k < n - 1) A.line(r0[0], -H, k + 1.5 + SHAPE[shapes[k + 1]](0)[0], -H, { color: 'ink2', width: 2 });
    }
    // what is above the surface
    if (P.values) {
      const txt = closed ? `gas at p₀ = ${kPa(shown(e.p0))}${gauge ? ' (gauge)' : ''}` : `air: p₀ = ${kPa(shown(e.p0))}${gauge ? ' (gauge)' : ''}`;
      A.text(txt, n / 2, closed ? top / 2 : top + 0.07 * H, { align: 'center', color: 'ink2', size: compact ? 11.5 : 12.5, weight: 600 });
    }
    // the probes
    const d = e.depth;
    if (d !== null && d !== undefined && Number.isFinite(d)) {
      const y = -Math.max(0, Math.min(H, d));
      const xd = A.ix(A.L - 10);   // the depth arrow, in the left margin
      A.line(xd, y, n, y, { color: 'gold', width: 1.2, dash: [5, 5] });
      for (let k = 0; k < n; k++) {
        const f = SHAPE[shapes[k]], [a, b] = f((H + y) / (H + top)), cx = k + 0.5 + (a + b) / 2;
        A.point(cx, y, { color: 'gold', r: 4.5 });
        if (P.values && !(P.sensor && k === 0)) A.text(kPa(shown(pAt(-y))), cx, y, { dx: 0, dy: -12, align: 'center', color: 'gold', size: compact ? 11 : 12, weight: 650 });
      }
      // the depth, marked in the left margin
      A.arrow(xd, 0, xd, y, { color: 'ink3', width: 1.4, head: 7 });
      if (P.values) A.text(`h = ${len(-y)}`, xd, y / 2, { dx: -5, align: 'right', color: 'ink2', size: compact ? 11 : 12, weight: 600 });
      if (P.sensor) sensor(A, 0.5 + (SHAPE[shapes[0]]((H + y) / (H + top))[0] + SHAPE[shapes[0]]((H + y) / (H + top))[1]) / 2, y, pAt(-y), pAt(H), e.tilt, gauge);
    }
    if (graph) {
      const pTop = shown(e.p0), pBot = shown(pAt(H));
      const lo = Math.min(0, pTop), hi = Math.max(pBot, pTop) * 1.12 || 1;
      B.o.pad = { l: split + 44, r: 14, t: padT, b: padB };
      B.o.xlabel = ''; B.o.ylabel = '';
      B.o.yfmt = (t) => (t > 1e-9 ? '' : trim(-t, 4));
      B.o.xfmt = (t) => trim(t, 4);
      B.setView([lo / 1000, hi / 1000], [yLo, yHi]);
      B.grid(); B.axes();
      ctx.save(); ctx.fillStyle = B.col.ink2; ctx.font = `600 ${compact ? 11 : 12}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText(gauge ? 'gauge p (kPa)' : 'p (kPa)', B.R, 4);
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('depth (m)', split + 6, B.h - 4);
      ctx.restore();
      B.line(pTop / 1000, 0, pTop / 1000, top, { color: 'violet', width: 2, dash: [4, 4] });
      B.line(pTop / 1000, 0, pBot / 1000, -H, { color: tint === 'ink3' ? 'ink2' : tint, width: 2.6 });
      if (!gauge && MF.P_ATM < hi && Math.abs(e.p0 - MF.P_ATM) > 50) {
        B.line(MF.P_ATM / 1000, yLo, MF.P_ATM / 1000, top, { color: 'ink3', width: 1, dash: [3, 4] });
        B.text('1 atm', MF.P_ATM / 1000, top, { dx: -3, dy: -2, align: 'right', color: 'ink3', size: 11 });
      }
      if (d !== null && d !== undefined && Number.isFinite(d)) {
        const y = -Math.max(0, Math.min(H, d)), p = shown(pAt(-y));
        B.line(B.vx0, y, p / 1000, y, { color: 'gold', width: 1.2, dash: [5, 5] });
        B.point(p / 1000, y, { color: 'gold', r: 5 });
      }
      ctx.save(); ctx.strokeStyle = B.col.line2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(split + 0.5, 8); ctx.lineTo(split + 0.5, A.h - 8); ctx.stroke(); ctx.restore();
    }
    if (showReadout) {
      const y = Math.max(0, Math.min(H, d ?? 0)), p = pAt(y);
      F.readout([
        ['depth $h$', texLen(y)], ['$\\rho g h$', texkPa(e.rho * e.g * y)],
        ['pressure $p$', texkPa(p)], ['gauge $p - p_\\text{atm}$', texkPa(p - MF.P_ATM)], ['in atmospheres', trim(p / MF.P_ATM, 4)],
      ]);
    }
  }

  // a sensor membrane at (x, y) turned by `tilt` degrees, with the pressure force on each face
  function sensor(pl, x, y, p, pMax, tilt, gauge) {
    const g = ctx, X = pl.X(x), Y = pl.Y(y), th = (tilt * Math.PI) / 180;
    const ux = Math.cos(th), uy = -Math.sin(th);          // along the membrane (screen)
    const nx = -uy, ny = ux;                               // its normal
    const half = compact ? 11 : 14, L = (compact ? 22 : 34) * (0.45 + 0.55 * p / pMax);
    g.save();
    g.strokeStyle = pl.color('ink'); g.lineWidth = 3.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(X - ux * half, Y - uy * half); g.lineTo(X + ux * half, Y + uy * half); g.stroke();
    g.restore();
    for (const s of [1, -1]) {
      const sx = X + s * nx * (L + 3), sy = Y + s * ny * (L + 3), ex = X + s * nx * 3, ey = Y + s * ny * 3;
      pl.arrow(pl.ix(sx), pl.iy(sy), pl.ix(ex), pl.iy(ey), { color: 'bad', width: 2.4, head: 8 });
    }
    if (P.values) pl.text(kPa(gauge ? p - MF.P_ATM : p), pl.ix(X + 18), pl.iy(Y - L - 10), { color: 'bad', size: compact ? 11 : 12, weight: 650 });
  }

  // ─── U-tube and barometer ────────────────────────────────────────────────
  function drawUtube(e) {
    frame();
    const W = A.w;
    A.o.pad = { l: 12, r: 12, t: 16, b: 14 };
    if (P.mode === 'barometer') return drawBarometer(e);
    // the level difference, and a view steady over the slider's range
    const dh = MF.manometerRise(e.p - e.patm, e.rho, e.g);
    // steady while the pressure slider moves; refitted when the liquid changes
    const pr = wanted.includes('p') ? [50e3, Math.max(200e3, e.p)] : [e.p, e.p];
    const span = Math.max(MF.manometerRise(Math.max(Math.abs(pr[0] - e.patm), Math.abs(pr[1] - e.patm)), e.rho, e.g), 0.02);
    const yb = -span / 2 - 0.25 * span, yt = span / 2 + 0.22 * span;
    A.setView([-3.2, 3.2], [yb - 0.32 * span, yt + 0.36 * span]);
    const tint = TINT[e.fl] || 'accent';
    const yL = -dh / 2, yR = dh / 2;
    const r = 0.25 * span;
    // the tube's centreline: down the left arm, round the bend, up the right
    const path = [];
    path.push([-1, yt]);
    for (let i = 0; i <= 24; i++) { const a = Math.PI + (Math.PI * i) / 24; path.push([Math.cos(a), yb + r * Math.sin(a)]); }
    path.push([1, yt]);
    const pts = path.map(([x, y]) => [A.X(x), A.Y(y)]);
    const stroke = (list, color, width) => { const g = ctx; g.save(); g.strokeStyle = A.color(color); g.lineWidth = width; g.lineJoin = 'round'; g.lineCap = 'butt'; g.beginPath(); list.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.restore(); };
    const wide = compact ? 15 : 20;
    stroke(pts, 'ink2', wide + 4); stroke(pts, 'bg', wide);
    // the liquid: from the left level, round the bend, to the right level
    const liquid = [[A.X(-1), A.Y(yL)], ...pts.slice(1, -1), [A.X(1), A.Y(yR)]];
    ctx.save(); ctx.globalAlpha = e.fl === 'mercury' ? 0.8 : 0.6; stroke(liquid, tint, wide); ctx.restore();
    // the gas reservoir on the left arm, open air on the right
    const bx0 = -3.0, bx1 = -0.55, by0 = yt, by1 = yt + 0.28 * span;
    A.rect(bx0, by0, bx1 - bx0, by1 - by0, { color: 'violet', alpha: 0.16, width: 2 });
    A.rect(-1 - 0.06, yL, 0.12, by0 - yL, { color: 'violet', alpha: 0.12, stroke: false });
    A.line(-1.12, yt, -1.12, by0, { color: 'ink2', width: 2 });
    const fs = compact ? 11.5 : 12.5;
    if (P.values) {
      A.text(`gas: p = ${kPa(e.p)}`, (bx0 + bx1) / 2, (by0 + by1) / 2, { align: 'center', color: 'violet', size: fs, weight: 650 });
      A.text(`open to air at ${kPa(e.patm)}`, 1, yt, { align: 'center', dy: -12, color: 'ink2', size: fs, weight: 600 });
    } else {
      A.text('gas', (bx0 + bx1) / 2, (by0 + by1) / 2, { align: 'center', color: 'violet', size: fs, weight: 650 });
      A.text('open to the air', 1, yt, { align: 'center', dy: -12, color: 'ink2', size: fs, weight: 600 });
    }
    // the level difference
    A.line(-1.4, yL, 1.9, yL, { color: 'gold', width: 1.2, dash: [4, 4] });
    A.line(0.6, yR, 1.9, yR, { color: 'gold', width: 1.2, dash: [4, 4] });
    if (Math.abs(dh) > 0.004 * span) {
      A.arrow(1.75, yL, 1.75, yR, { color: 'gold', width: 1.8, head: 7 });
      A.arrow(1.75, yR, 1.75, yL, { color: 'gold', width: 1.8, head: 7 });
    }
    A.text(P.values ? `Δh = ${len(Math.abs(dh))}` : 'Δh', 1.95, (yL + yR) / 2, { color: 'gold', size: fs, weight: 650 });
    if (showReadout) F.readout([
      ['gas pressure $p$', texkPa(e.p)], ['$p - p_\\text{atm}$', texkPa(e.p - e.patm)], ['level difference $\\Delta h$', texLen(dh)], ['liquid density $\\rho$', `${e.rho.toLocaleString('en-US')}\\,\\mathrm{kg/m^3}`],
    ]);
    return W;
  }

  function drawBarometer(e) {
    const h = MF.headOf(e.patm, e.rho, e.g);
    const hmax = wanted.includes('patm') ? MF.headOf(Math.max(110e3, e.patm), e.rho, e.g) : h;   // steady while the air-pressure slider moves
    const top = hmax * 1.12;
    A.setView([-3.2, 3.2], [-0.16 * hmax, top + 0.1 * hmax]);
    const tint = TINT[e.fl] || 'accent', al = e.fl === 'mercury' ? 0.7 : 0.4;
    const dish = 0.1 * hmax;
    // the dish
    A.rect(-2.2, -dish, 4.4, dish, { color: tint, alpha: al, stroke: false });
    A.path([[-2.3, 0.04 * hmax], [-2.3, -dish - 0.02 * hmax], [2.3, -dish - 0.02 * hmax], [2.3, 0.04 * hmax]], { color: 'ink2', width: 2.2 });
    // the tube: open at the bottom (under the surface), closed at the top
    const tw = 0.32, bottom = -0.07 * hmax;
    A.rect(-tw, bottom, 2 * tw, h - bottom, { color: tint, alpha: al, stroke: false });
    A.path([[-tw, bottom], [-tw, top], [tw, top], [tw, bottom]], { color: 'ink2', width: 2.2 });
    const fs = compact ? 11.5 : 12.5;
    A.text('vacuum', 0, (h + top) / 2, { align: 'center', color: 'ink3', size: fs - 1 });
    for (const x of [-1.5, 1.5]) A.arrow(x, 0.16 * hmax, x, 0.01 * hmax, { color: 'violet', width: 2, head: 7 });
    A.text(P.values ? `air at ${kPa(e.patm)}` : 'air pressure', 1.5, 0.2 * hmax, { align: 'center', dy: -6, color: 'violet', size: fs, weight: 650 });
    A.line(-1.0, h, 0.5, h, { color: 'gold', width: 1.2, dash: [4, 4] });
    A.arrow(-0.75, 0, -0.75, h, { color: 'gold', width: 1.8, head: 7 });
    A.text(P.values ? `h = ${len(h)}` : 'h', -0.87, h * 0.55, { align: 'right', color: 'gold', size: fs, weight: 650 });
    if (showReadout) F.readout([['air pressure $p_\\text{atm}$', texkPa(e.patm)], ['column height $h$', texLen(h)], ['in mm of this liquid', `${Math.round(h * 1000)}\\,\\mathrm{mm}`], ['liquid density $\\rho$', `${e.rho.toLocaleString('en-US')}\\,\\mathrm{kg/m^3}`]]);
  }

  // ─── buoyancy ────────────────────────────────────────────────────────────
  function drawBuoy(e) {
    frame();
    const T = tankOf(P, wanted.includes('V'));
    const D = T.D, Wt = T.W, s = Math.cbrt(e.V), smax = T.smax;
    const hook = 0.18 * D + smax + 0.16 * D;           // the scale's hook, above the highest block position
    A.o.pad = { l: 8, r: 8, t: 10, b: 8 };
    A.o.equal = true;
    A.setView([-Wt / 2 - 0.1 * D, Wt / 2 + 0.1 * D], [-D - 0.06 * D, hook + 0.3 * D]);
    const tint = TINT[e.fl] || 'accent';
    const st = MF.block({ rhoObj: e.rhoObj, V: e.V, rhoFluid: e.rho, hold: e.hold, depth: e.depth, floorDepth: D, g: e.g });
    // the liquid and the tank
    A.rect(-Wt / 2, -D, Wt, D, { color: tint, alpha: e.fl === 'mercury' ? 0.5 : 0.3, stroke: false });
    A.path([[-Wt / 2, 0.2 * D], [-Wt / 2, -D], [Wt / 2, -D], [Wt / 2, 0.2 * D]], { color: 'ink2', width: 2.4 });
    A.line(-Wt / 2, 0, Wt / 2, 0, { color: tint, width: 2 });
    // the block
    const yb = -st.bottom, yt = yb + s;
    const heavy = e.rhoObj >= e.rho;
    A.rect(-s / 2, yb, s, s, { color: e.rhoObj < 1000 ? 'warn' : 'ink3', alpha: 0.85, width: 1.5 });
    // the scale and its string
    const fs = compact ? 11 : 12.5;
    if (e.hold === 'scale') {
      const bw = 0.16 * D + 0.25 * smax, bh = 0.2 * D;
      A.line(-Wt / 2 - 0.05 * D, hook + 0.28 * D, Wt / 2 + 0.05 * D, hook + 0.28 * D, { color: 'ink3', width: 3 });
      A.line(0, hook + 0.28 * D, 0, hook + bh, { color: 'ink3', width: 1.6 });
      A.rect(-bw / 2, hook, bw, bh, { color: 'panel', alpha: 1, width: 2, stroke: 'ink2' });
      A.text(P.values ? newtons(st.T) : 'scale', 0, hook + bh / 2, { align: 'center', color: 'good', size: fs, weight: 700 });
      A.line(0, hook, 0, yt, { color: st.T > 0 ? 'ink2' : 'ink4', width: 1.4, dash: st.T > 0 ? [] : [3, 3] });
    }
    // the forces, to one scale
    const fmax = Math.max(st.W, st.B, st.T, st.N, 1e-9);
    const k = (0.42 * D) / fmax;
    const lab = (name, f) => (P.values ? `${name} = ${newtons(f)}` : name);
    const minLen = 0.012 * D;
    if (st.W * k > minLen) { A.arrow(0, yb + s / 2, 0, yb + s / 2 - st.W * k, { color: 'ink', width: 2.6, head: 9 }); A.text(lab('W', st.W), 0, yb + s / 2 - st.W * k, { dx: 7, dy: 2, color: 'ink', size: fs, weight: 650 }); }
    const xb = -0.3 * s, ycb = yb + (st.sub * s) / 2;
    if (st.B * k > minLen) {
      A.arrow(xb, ycb, xb, ycb + st.B * k, { color: 'accent', width: 2.6, head: 9 });
      // a short arrow ends inside the block: label it beside the block instead
      const inside = ycb + st.B * k < yt;
      A.text(lab('B', st.B), inside ? -s / 2 : xb, ycb + st.B * k, { dx: -7, dy: -2, align: 'right', color: 'accent', size: fs, weight: 650 });
    }
    if (st.T * k > minLen) { A.arrow(0.3 * s, yt, 0.3 * s, yt + st.T * k, { color: 'good', width: 2.6, head: 9 }); A.text(lab('T', st.T), 0.3 * s, yt + st.T * k, { dx: 7, dy: 2, color: 'good', size: fs, weight: 650 }); }
    if (st.N * k > minLen) { A.arrow(0.3 * s, yb, 0.3 * s, yb + st.N * k, { color: 'teal', width: 2.6, head: 9 }); A.text(lab('N', st.N), 0.3 * s, yb + st.N * k, { dx: 7, dy: 2, color: 'teal', size: fs, weight: 650 }); }
    const status = st.floats ? `floating: ${Math.round(st.sub * 100)}% under` : st.onFloor ? 'resting on the floor' : st.sub >= 1 ? 'fully under' : st.sub > 0 ? `${Math.round(st.sub * 100)}% under` : 'in the air';
    if (P.values) A.text(status, -Wt / 2 + 0.03 * D, -D + 0.06 * D, { color: 'ink2', size: fs, weight: 600 });
    if (showReadout) F.readout([
      ['weight $W$', texN(st.W)], ['buoyant force $B$', texN(st.B)], [e.hold === 'scale' && !st.onFloor ? 'scale reads $T$' : 'floor pushes $N$', texN(e.hold === 'scale' && !st.onFloor ? st.T : st.N)],
      ['under the surface', `${Math.round(st.sub * 1000) / 10}\\,\\%`], ['$\\rho_\\text{block}/\\rho_\\text{liquid}$', trim(e.rhoObj / e.rho, 3)],
    ]);
    return heavy;
  }

  function draw() {
    const e = env();
    if (P.scene === 'vessels') drawVessels(e);
    else if (P.scene === 'utube') drawUtube(e);
    else drawBuoy(e);
  }
  F.draw(draw);
  F.caption({
    vessels: P.closed
      ? 'Liquid at rest and incompressible, so $p = p_0 + \\rho g h$ below the surface. The gas’s own weight is neglected, so its pressure is the same throughout. Depths are to scale; widths are not.'
      : 'Liquid at rest and incompressible: the pressure depends only on the depth below the surface, $p = p_0 + \\rho g h$, whatever the vessel’s shape. The air’s own weight above the surface is neglected. Depths are to scale; widths are not. $g = 9.8\\ \\text{m/s}^2$ unless set.',
    utube: P.mode === 'barometer'
      ? 'The air’s pressure on the dish holds up the column: $p_\\text{atm} = \\rho g h$. The space above the column is taken as a perfect vacuum (real mercury has a tiny vapour pressure). Heights are to scale; widths are not.'
      : 'The gas pushes the liquid down in its arm until the extra liquid in the other arm balances it: $p - p_\\text{atm} = \\rho g\\,\\Delta h$. The gas’s own weight is neglected. Heights are to scale; widths are not.',
    buoy: 'The buoyant force is the weight of the liquid the block pushes aside, $B = \\rho_\\text{liquid} V_\\text{under}\\, g$. Arrows share one scale; $B$ is drawn from the centre of the submerged part, shifted aside for clarity. The tank is taken to be wide enough that its level does not rise.',
  }[P.scene]);
  return { get: (k) => F.params[k] };
}

// vessel shapes: the walls' x-offsets (in slot widths) at a height fraction u from the base to the rim
const ease = (u) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, u)));
const SHAPE = {
  column: () => [-0.1, 0.1],
  wide: () => [-0.4, 0.4],
  flare: (u) => [-(0.09 + 0.33 * u), 0.09 + 0.33 * u],
  flask: (u) => { const w = 0.4 - 0.31 * ease(u / 0.62); return [-w, w]; },
  slant: (u) => [-0.08 + 0.32 * u, 0.08 + 0.32 * u],
  tank: () => [-0.36, 0.36],
};

/** The buoyancy tank's size: liquid depth D and width W, fitted to the largest block it must hold. */
function tankOf(P, rangeV) {
  const smax = Math.cbrt(rangeV ? Math.max(0.01, P.V) : P.V);
  const D = P.tankDepth ?? Math.max(0.3, +(3.2 * smax).toFixed(2));
  return { D, W: Math.max(D * 1.5, 4 * smax), smax };
}

function niceStep(x) {
  const m = 10 ** Math.floor(Math.log10(x)), r = x / m;
  return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * m;
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!SCENES.includes(P.scene)) return [`scene must be one of ${SCENES.join(', ')}`];
  if (P.rho === null && !MF.FLUIDS[P.fluid]) problems.push(`unknown fluid “${P.fluid}” (use ${Object.keys(MF.FLUIDS).join(', ')}, or give rho)`);
  if (P.rho !== null && !(P.rho > 0)) problems.push('rho must be positive');
  for (const f of P.fluids || []) if (!MF.FLUIDS[f]) problems.push(`unknown fluid “${f}” in fluids`);
  if (!(P.g >= 0)) problems.push('g must be zero or positive');
  const wanted = wantedOf(P);
  for (const k of wanted) if (!SETS[P.scene].includes(k)) problems.push(`unknown control “${k}” for ${P.scene} (use ${SETS[P.scene].join(', ')})`);
  if (wanted.includes('fluid') && P.rho !== null) problems.push('a fluid choice cannot be combined with rho');
  if (wanted.includes('fluid') && !(P.fluids || FLUID_SETS[P.scene]).includes(P.fluid)) problems.push(`fluid “${P.fluid}” is not among the choices offered`);
  if (P.scene === 'vessels') {
    if (!Array.isArray(P.shapes) || P.shapes.length < 1 || P.shapes.length > 4) problems.push('shapes must list 1–4 vessels');
    for (const s of P.shapes || []) if (!SHAPES.includes(s)) problems.push(`unknown shape “${s}” (use ${SHAPES.join(', ')})`);
    if (!(P.H > 0)) problems.push('H must be positive');
    if (P.depth !== undefined && P.depth !== null && !(P.depth >= 0 && P.depth <= P.H)) problems.push('depth must lie in [0, H]');
    if (!(P.p0 >= 0)) problems.push('p0 must be zero or positive (absolute pressure, Pa)');
    if (P.p0 > 0 && P.p0 < 200) problems.push('p0 is in pascals: did you mean kPa × 1000?');
    if (wanted.includes('tilt') && !P.sensor) problems.push('the tilt control needs sensor: true');
  }
  if (P.scene === 'utube') {
    if (!['manometer', 'barometer'].includes(P.mode)) problems.push('mode must be manometer or barometer');
    if (!(P.p > 0 && P.patm > 0)) problems.push('p and patm are absolute pressures in Pa and must be positive');
    if (P.p < 200 || P.patm < 200) problems.push('pressures are in pascals: did you mean kPa × 1000?');
  }
  if (P.scene === 'buoy') {
    if (!(P.rhoObj > 0)) problems.push('rhoObj must be positive');
    if (!(P.V > 0 && P.V <= 0.05)) problems.push('V is in m³ and must lie in (0, 0.05]');
    if (!['scale', 'free'].includes(P.hold)) problems.push('hold must be scale or free');
    if (P.tankDepth !== null && !(P.tankDepth > Math.cbrt(P.V))) problems.push('tankDepth must exceed the block’s side');
  }
  return problems;
}
