// Fluids in motion: a Venturi tube and a Pitot-static probe. The physics is
// model/mech-fluids.js (tested headlessly in test/mech-fluids.test.mjs).
//
//   venturi  a horizontal pipe that narrows to a throat and widens again.
//            Tracer particles move with the local speed: the same volume
//            passes every section each second (continuity), so they race
//            through the throat. Open tubes on the wall (piezometers) show
//            the static pressure — lowest where the flow is fastest
//            (Bernoulli). Below, the pressure budget along the pipe: the
//            static pressure and ½ρv² add up to the same total everywhere.
//   pitot    a Pitot-static probe in a uniform stream (two-dimensional
//            potential flow past a blunt body, a Rankine half-body): the nose
//            port brings the air to rest and reads the total pressure, ports
//            on the side read the static pressure, and a dial turns the
//            difference ½ρv² into an airspeed.
//
//   { type: 'mech-flow', params: {
//       scene: 'venturi',
//       v1: 2, ratio: 0.4,          // inlet speed (m/s); throat area ÷ inlet area (0.05–1)
//       D1: 0.1,                    // inlet diameter (m): sets the flow rate shown
//       fluid: 'water', rho: null,  // water lox rp1 (or rho, kg/m³: a liquid, for the tubes)
//       p1: 200000,                 // inlet static pressure (Pa, absolute; above 1 atm for the tubes)
//       tubes: true, budget: true,  // piezometer tubes; the pressure budget along the pipe
//       slugs: false,               // equal volumes in the inlet and the throat
//       arrows: true,               // speed arrows at the taps
//     // pitot
//       v: 70, alt: 0,              // true airspeed (m/s); altitude (km), setting the air density
//       rho: null,                  // or the air density directly (kg/m³)
//     // both
//       sliders: true,              // or a list: venturi v1 ratio fluid p1; pitot v alt
//       values: true,               // numbers on the picture (false hides them and the dial’s needle)
//       readout: null,              // the live readout bar (default: on when there are controls)
//       play: true,                 // animate the tracer particles (paused under reduced motion until Play)
//   } }

import { Plot } from '../plot.js';
import * as MF from '../model/mech-fluids.js';

const SCENES = ['venturi', 'pitot'];
const SETS = { venturi: ['v1', 'ratio', 'fluid', 'p1'], pitot: ['v', 'alt'] };
const LIQUIDS = ['water', 'lox', 'rp1'];
const TAPS = [[0.14, '1'], [0.5, '2'], [0.88, '3']];

export const defaults = {
  scene: 'venturi', v1: 2, ratio: 0.4, D1: 0.1, fluid: 'water', rho: null, p1: 200000,
  tubes: true, budget: true, slugs: false, arrows: true, v: 70, alt: 0,
  sliders: null, values: true, readout: null, play: true,
};

const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const kPa = (p) => `${Math.abs(p) >= 100e3 ? (p / 1000).toFixed(1) : trim(p / 1000, 3)} kPa`;
const texkPa = (p) => kPa(p).replace(' kPa', '\\,\\mathrm{kPa}');
const wantedOf = (P) => (P.sliders === true ? SETS[P.scene] : Array.isArray(P.sliders) ? P.sliders : []);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact, wanted = wantedOf(P);
  const venturi = P.scene === 'venturi';
  const { canvas } = F.canvas({
    aspect: P.aspect ?? (venturi && P.budget && !compact ? '' : 'wide'),
    label: P.alt_text || (venturi ? 'Water flowing through a pipe that narrows, with pressure tubes on its wall' : 'A Pitot-static probe in a stream of air, with an airspeed dial'),
  });
  const ctx = canvas.getContext('2d');
  const A = new Plot(canvas, { grid: false, axes: false });
  const B = new Plot(canvas, { grid: true, axes: true });

  // ── controls ──
  for (const k of wanted) {
    if (k === 'v1') F.slider({ key: 'v1', label: 'Inlet speed $v_1$', min: 0.2, max: Math.max(6, P.v1), step: 0.1, value: P.v1, unit: '\\mathrm{m/s}', explain: 'How fast the liquid enters the wide part of the pipe.' });
    if (k === 'ratio') F.slider({ key: 'ratio', label: 'Throat area $A_2/A_1$', min: 0.15, max: 1, step: 0.01, value: P.ratio, unit: '', explain: 'How much the pipe narrows: 0.25 means a quarter of the area (half the diameter).' });
    if (k === 'fluid') F.choice({ key: 'fluid', label: 'Liquid', options: LIQUIDS.map((f) => [f, MF.FLUIDS[f].label]), value: LIQUIDS.includes(P.fluid) ? P.fluid : 'water', explain: 'Densities: water 1000, liquid oxygen 1141, RP-1 810 kg/m³.' });
    if (k === 'p1') F.slider({ key: 'p1', label: 'Inlet pressure $p_1$', min: 110, max: Math.max(400, Math.round(P.p1 / 1000)), step: 1, value: Math.round(P.p1 / 1000), unit: '\\mathrm{kPa}', explain: 'Absolute static pressure in the wide inlet.' });
    if (k === 'v') F.slider({ key: 'v', label: 'True airspeed $v$', min: 0, max: Math.max(150, P.v), step: 1, value: P.v, unit: '\\mathrm{m/s}', explain: 'The probe’s speed through the air (a light aircraft cruises at 50–70 m/s).' });
    if (k === 'alt') F.slider({ key: 'alt', label: 'Altitude', min: 0, max: 12, step: 0.1, value: P.alt, unit: '\\mathrm{km}', explain: 'Sets the air density (US Standard Atmosphere): thinner air, smaller pressure difference at the same speed.' });
  }
  const showReadout = P.readout ?? wanted.length > 0;
  const val = (k) => F.params[k];
  const env = () => {
    const fl = val('fluid') ?? P.fluid;
    const rhoL = val('fluid') !== undefined ? MF.FLUIDS[fl].rho : P.rho ?? MF.FLUIDS[fl]?.rho ?? 1000;
    const alt = val('alt') ?? P.alt;
    return {
      fl, rho: venturi ? rhoL : P.rho ?? MF.airAt(alt), alt,
      v1: val('v1') ?? P.v1, ratio: val('ratio') ?? P.ratio, p1: val('p1') !== undefined ? val('p1') * 1000 : P.p1, v: val('v') ?? P.v,
    };
  };

  // ── tracer particles ──
  const rnd = (() => { let s = 12345; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const N = venturi ? (compact ? 90 : 140) : (compact ? 80 : 130);
  const parts = [];
  if (venturi) for (let i = 0; i < N; i++) parts.push({ x: rnd(), s: (rnd() * 2 - 1) * 0.9 });
  const view = { x0: -2.6, x1: 4.2, y: 1.7 };                 // pitot world (probe half-width a)
  const a = 0.36;
  const spawn = (p, anywhere) => { p.x = anywhere ? view.x0 + rnd() * (view.x1 - view.x0) : view.x0 - rnd() * 0.3; do { p.y = (rnd() * 2 - 1) * view.y; } while (Math.abs(p.y) < 0.015 || MF.insideHalfBody(p.x, p.y, a)); };
  if (!venturi) for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); parts.push(p); }

  const S = {};
  let playBtn = null;
  const step = (dt) => {
    const e = env();
    if (venturi) {
      const rate = 0.16 * Math.sqrt(Math.max(0.2, e.v1) / 2);
      for (const p of parts) {
        p.x += dt * rate / MF.venturiArea(p.x, e.ratio);
        if (p.x > 1) { p.x -= 1; p.s = (rnd() * 2 - 1) * 0.9; }
      }
    } else {
      const U = Math.max(1, e.v), rate = 0.55 * Math.sqrt(U / 60);
      for (const p of parts) {
        for (let k = 0; k < 2; k++) {
          const [u, w] = MF.halfBodyVelocity(p.x, p.y, U, a);
          p.x += (dt / 2) * rate * (u / U); p.y += (dt / 2) * rate * (w / U);
        }
        if (p.x > view.x1 || MF.insideHalfBody(p.x, p.y, a)) spawn(p, false);
      }
    }
    draw();
  };
  // the particles drift on their own unless the viewer asked for reduced motion (the frame then
  // stops this loop); Play runs them regardless, Pause stops them
  S.paused = false; S.user = false;
  if (P.play !== false) {
    F.animate((dt) => { if (!S.paused && !S.user) step(dt); }, { force: false });
    F.animate((dt) => { if (S.user && !S.paused) step(dt); }, { force: true });
    playBtn = F.button({ label: 'Play ▶', onClick: () => {
      if (!S.user) { S.user = true; S.paused = false; } else S.paused = !S.paused;
      playBtn.textContent = S.paused ? 'Play ▶' : 'Pause ❚❚';
    } });
  }
  F.onChange(() => draw());

  // ─── Venturi ─────────────────────────────────────────────────────────────
  function drawVenturi(e) {
    A.resize(); A.refreshTheme(); B.resize(); B.refreshTheme();
    const W = A.w, H = A.h;
    ctx.clearRect(0, 0, W, H);
    const split = P.budget ? Math.round(H * (compact ? 0.6 : 0.58)) : H;
    const tubes = P.tubes && e.rho >= 100;
    const top = tubes ? 5.6 : 1.5;
    A.o.pad = { l: compact ? 40 : 52, r: compact ? 14 : 18, t: 8, b: H - split + 6 };
    A.setView([-0.03, 1.03], [-1.45, top]);
    const R = (x) => Math.sqrt(MF.venturiArea(x, e.ratio));
    const xs = Array.from({ length: 161 }, (_, i) => i / 160);
    const tint = { water: 'accent', lox: 'accent2', rp1: 'warn' }[e.fl] || 'accent';
    // the liquid and the walls
    A.path([...xs.map((x) => [x, R(x)]), ...xs.slice().reverse().map((x) => [x, -R(x)])], { close: true, fill: tint, fillAlpha: 0.22, stroke: false });
    A.path(xs.map((x) => [x, R(x)]), { color: 'ink2', width: 2.4 });
    A.path(xs.map((x) => [x, -R(x)]), { color: 'ink2', width: 2.4 });
    // equal volumes passing the inlet and the throat in the same time
    if (P.slugs) {
      const L1 = 0.13 * e.ratio, L2 = 0.13;
      A.rect(0.06, -1, L1, 2, { color: 'gold', alpha: 0.35, width: 1 });
      A.rect(0.435, -Math.sqrt(e.ratio), L2, 2 * Math.sqrt(e.ratio), { color: 'gold', alpha: 0.35, width: 1 });
      A.text('same volume', 0.06 + L1 / 2, -1.22, { align: 'center', color: 'gold', size: 11.5, weight: 650 });
      A.text('same volume', 0.5, -Math.sqrt(e.ratio) - 0.22, { align: 'center', color: 'gold', size: 11.5, weight: 650 });
    }
    // tracer particles
    const g = ctx;
    g.save(); g.fillStyle = A.color('ink'); g.globalAlpha = 0.75;
    for (const p of parts) { const y = p.s * R(p.x); g.beginPath(); g.arc(A.X(p.x), A.Y(y), compact ? 1.5 : 1.8, 0, Math.PI * 2); g.fill(); }
    g.restore();
    // the state at the taps
    const st = TAPS.map(([x, name]) => ({ x, name, ...MF.venturiAt(x, { v1: e.v1, ratio: e.ratio, p1: e.p1, rho: e.rho }) }));
    const pv = (P.rho === null ? MF.FLUIDS[e.fl]?.pv : null) ?? 0;   // below this the liquid boils
    const fs = compact ? 11 : 12;
    if (tubes) {
      const h1 = MF.headOf(e.p1 - MF.P_ATM, e.rho);
      const k = (top - 1.15) / Math.max(h1, 1e-6);           // drawing units per metre of column
      for (const s of st) {
        const xw = 0.022, r = R(s.x), h = MF.headOf(s.p - MF.P_ATM, e.rho), level = h * k;
        A.rect(s.x - xw, r, 2 * xw, top - 0.2 - r, { color: 'panel', alpha: 0.0, width: 1.6, stroke: 'ink2' });
        if (level > r) A.rect(s.x - xw, r, 2 * xw, level - r, { color: tint, alpha: 0.6, stroke: false });
        const boils = s.p < pv;
        const label = boils ? 'cavitation: the liquid boils' : P.values ? (h >= 0 ? `p${sub(s.name)} = ${kPa(s.p)}` : 'below 1 atm: suction') : `p${sub(s.name)}`;
        A.text(label, s.x, Math.max(level, r), { dy: -9, align: 'center', color: h >= 0 && !boils ? 'ink' : 'bad', size: fs, weight: 650 });
        if (P.values && h >= 0) A.text(`${trim(h, 3)} m`, s.x + xw, Math.max(level, r) * 0.5 + r * 0.5, { dx: 4, color: 'ink3', size: fs - 1 });
      }
    }
    if (P.arrows) {
      const vmax = Math.max(...st.map((s) => s.v));
      for (const s of st) {
        const L = 0.1 * (s.v / vmax) + 0.02;
        A.arrow(s.x - L / 2, 0, s.x + L / 2, 0, { color: 'gold', width: 2.4, head: 8 });
        if (P.values) A.text(`v${sub(s.name)} = ${trim(s.v)} m/s`, s.x, 0, { dy: 13, align: 'center', color: 'gold', size: fs, weight: 650 });
        else A.text(`v${sub(s.name)}`, s.x, 0, { dy: 13, align: 'center', color: 'gold', size: fs, weight: 650 });
      }
    }
    // the pressure budget along the pipe
    if (P.budget) {
      B.o.pad = { l: A.o.pad.l, r: A.o.pad.r, t: split + 14, b: 26 };
      const prof = xs.map((x) => MF.venturiAt(x, { v1: e.v1, ratio: e.ratio, p1: e.p1, rho: e.rho }));
      const tot = prof[0].total / 1000, pmin = Math.min(...prof.map((q) => q.p)) / 1000;
      const span = Math.max(tot - pmin, tot * 0.02);
      const y0 = pmin - 0.35 * span, y1 = tot + 0.45 * span;
      B.o.xfmt = () => ''; B.o.xlabel = ''; B.o.ylabel = '';
      B.setView([-0.03, 1.03], [y0, y1]);
      B.grid(); B.axes();
      B.area((x) => MF.venturiAt(x, { v1: e.v1, ratio: e.ratio, p1: e.p1, rho: e.rho }).p / 1000, 0, 1, { color: 'accent', alpha: 0.18, lower: () => y0 });
      B.area(() => tot, 0, 1, { color: 'gold', alpha: 0.3, lower: (x) => MF.venturiAt(x, { v1: e.v1, ratio: e.ratio, p1: e.p1, rho: e.rho }).p / 1000 });
      B.path(xs.map((x, i) => [x, prof[i].p / 1000]), { color: 'accent', width: 2.4 });
      B.line(0, tot, 1, tot, { color: 'gold', width: 2, dash: [6, 5] });
      if (pv / 1000 > y0 && pv / 1000 < y1 && pmin < pv / 1000) {
        B.line(0, pv / 1000, 1, pv / 1000, { color: 'bad', width: 1.6, dash: [4, 4] });
        B.text('vapour pressure: below it the liquid boils', 0.97, pv / 1000, { dy: 11, align: 'right', color: 'bad', size: fs - 1, weight: 600 });
      }
      B.text('static pressure p', 0.03, (pmin + y0) / 2 + 0.1 * span, { color: 'accent', size: fs, weight: 650 });
      B.text('½ρv²', 0.5, (tot + MF.venturiAt(0.5, { v1: e.v1, ratio: e.ratio, p1: e.p1, rho: e.rho }).p / 1000) / 2, { align: 'center', color: 'gold', size: fs, weight: 700 });
      B.text('total p + ½ρv² (the same everywhere)', 0.97, tot, { dy: -10, align: 'right', color: 'gold', size: fs, weight: 600 });
      ctx.save(); ctx.fillStyle = B.col.ink2; ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('kPa', 6, split + 8); ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('along the pipe →', B.R, H - 4); ctx.restore();
    }
    if (showReadout) {
      const s2 = st[1], A1 = MF.areaOf(P.D1), Q = A1 * e.v1;
      F.readout([
        ['$v_1$', `${trim(e.v1)}\\,\\mathrm{m/s}`], ['throat $v_2$', `${trim(s2.v)}\\,\\mathrm{m/s}`], ['$p_1 - p_2$', texkPa(e.p1 - s2.p)],
        ['throat $p_2$', s2.p < pv ? '\\text{cavitation}' : texkPa(s2.p)], [`flow $Q$ (${trim(P.D1 * 100)} cm pipe)`, `${trim(Q * 1000)}\\,\\mathrm{L/s}`], ['mass flow $\\rho Q$', `${trim(e.rho * Q)}\\,\\mathrm{kg/s}`],
      ]);
    }
  }

  // ─── Pitot-static probe ──────────────────────────────────────────────────
  const streamlines = (() => {
    const lines = [];
    for (const y0 of [0.06, 0.2, 0.42, 0.7, 1.05, 1.45]) for (const sgn of [1, -1]) {
      let x = view.x0 - 0.2, y = sgn * y0;
      const pts = [[x, y]];
      for (let i = 0; i < 1600 && x < view.x1 + 0.2; i++) {
        const [u, w] = MF.halfBodyVelocity(x, y, 1, a), sp = Math.hypot(u, w) || 1;
        const h = 0.012 / Math.max(0.25, sp);
        const [u2, w2] = MF.halfBodyVelocity(x + (h * u) / 2, y + (h * w) / 2, 1, a);
        x += h * u2; y += h * w2;
        if (i % 3 === 0) pts.push([x, y]);
      }
      lines.push(pts);
    }
    return lines;
  })();
  const surface = (() => {
    const up = [];
    for (let i = 0; i <= 200; i++) {
      const th = Math.PI - 1e-3 - (Math.PI - 0.02) * (i / 200) ** 1.6;
      const [x, y] = MF.halfBodySurface(th, a);
      if (x > view.x1 + 0.3) break;
      up.push([x, y]);
    }
    up.push([view.x1 + 0.3, a * 0.995]);
    return up;
  })();
  const XS = 2.3;   // static ports

  function drawPitot(e) {
    A.resize(); A.refreshTheme();
    const W = A.w, H = A.h;
    ctx.clearRect(0, 0, W, H);
    A.o.pad = { l: 6, r: 6, t: 8, b: 8 };
    A.o.equal = true;
    A.setView([view.x0, view.x1], [-view.y, view.y]);
    // streamlines and particles
    for (const s of streamlines) A.path(s, { color: 'ink4', width: 1 });
    const g = ctx;
    g.save(); g.fillStyle = A.color('accent2');
    for (const p of parts) { g.beginPath(); g.arc(A.X(p.x), A.Y(p.y), compact ? 1.6 : 2, 0, Math.PI * 2); g.fill(); }
    g.restore();
    // the probe
    const body = [...surface, ...surface.slice().reverse().map(([x, y]) => [x, -y])];
    A.path(body, { close: true, fill: 'ink3', fillAlpha: 0.9, color: 'ink2', width: 1.6 });
    // internal lines: the total-pressure tube from the nose, the static line from the side ports
    A.line(-a / Math.PI + 0.04, 0, view.x1 + 0.3, 0, { color: 'gold', width: 2 });
    A.line(XS, a * 0.97, XS, a * 0.45, { color: 'teal', width: 2 });
    A.line(XS, -a * 0.97, XS, -a * 0.45, { color: 'teal', width: 2 });
    A.line(XS, a * 0.45, view.x1 + 0.3, a * 0.45, { color: 'teal', width: 2 });
    A.line(XS, -a * 0.45, view.x1 + 0.3, -a * 0.45, { color: 'teal', width: 2 });
    A.point(-a / Math.PI, 0, { color: 'gold', r: 4 });
    for (const sgn of [1, -1]) A.point(XS, sgn * a * 0.99, { color: 'teal', r: 3.2 });
    const fs = compact ? 11 : 12;
    {
      // the nose label, kept inside the canvas
      const txt = compact ? 'nose: total pressure' : 'nose port: air brought to rest → total pressure';
      ctx.save(); ctx.font = `650 ${fs}px Inter, system-ui, sans-serif`; const tw = ctx.measureText(txt).width; ctx.restore();
      const nx = A.X(-a / Math.PI) - 10, ny = A.Y(0) - 18;
      if (nx - tw >= 6) A.text(txt, nx, ny, { screen: true, align: 'right', color: 'gold', size: fs, weight: 650 });
      else A.text(txt, 6, ny - 6, { screen: true, color: 'gold', size: fs, weight: 650 });
    }
    A.text('static ports → p', XS, a, { dy: -14, align: 'center', color: 'teal', size: fs, weight: 650 });
    // the dial: indicated airspeed, from the difference between the two lines
    const q = MF.dynamicPressure(e.rho, e.v), ias = MF.pitotSpeed(q, MF.RHO_SL);
    const r = compact ? 34 : 44, cx = W - r - 16, cy = H - r - 14, vmax = 160;
    g.save();
    g.fillStyle = A.color('panel'); g.strokeStyle = A.color('ink2'); g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.stroke();
    g.font = `600 ${compact ? 9 : 10}px Inter, system-ui, sans-serif`; g.fillStyle = A.color('ink2'); g.textAlign = 'center'; g.textBaseline = 'middle';
    const ang = (v) => (Math.PI * 5) / 4 - (Math.PI * 3 / 2) * (v / vmax);
    for (let v = 0; v <= vmax; v += 20) {
      const t = ang(v), c = Math.cos(t), s = -Math.sin(t);
      g.strokeStyle = A.color('ink3'); g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(cx + c * r * 0.82, cy + s * r * 0.82); g.lineTo(cx + c * r * 0.96, cy + s * r * 0.96); g.stroke();
      if (v % 40 === 0) g.fillText(String(v), cx + c * r * 0.62, cy + s * r * 0.62);
    }
    if (!compact) { g.fillStyle = A.color('ink3'); g.fillText('m/s', cx, cy + r * 0.42); }
    if (P.values) {
      const t = ang(Math.min(ias, vmax * 1.02)), c = Math.cos(t), s = -Math.sin(t);
      g.strokeStyle = A.color('bad'); g.lineWidth = 2.4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + c * r * 0.78, cy + s * r * 0.78); g.stroke();
    } else { g.fillStyle = A.color('bad'); g.font = `700 ${compact ? 14 : 16}px Inter, system-ui, sans-serif`; g.fillText('?', cx, cy - 2); }
    g.fillStyle = A.color('ink'); g.beginPath(); g.arc(cx, cy, 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = A.color('ink2'); g.font = `600 ${fs}px Inter, system-ui, sans-serif`; g.textAlign = 'right';
    g.fillText(compact ? 'airspeed dial (m/s)' : 'airspeed dial', cx - r - 8, cy + r * 0.6);
    // the two lines run to the dial
    g.strokeStyle = A.color('gold'); g.lineWidth = 2; g.beginPath(); g.moveTo(W - 4, A.Y(0)); g.lineTo(cx + 6, A.Y(0)); g.lineTo(cx + 6, cy - r); g.stroke();
    g.strokeStyle = A.color('teal'); g.beginPath(); g.moveTo(W - 4, A.Y(-a * 0.45)); g.lineTo(cx - 6, A.Y(-a * 0.45)); g.lineTo(cx - 6, cy - r); g.stroke();
    g.restore();
    A.text('air →', view.x0 + 0.1, view.y - 0.2, { color: 'ink2', size: fs + 1, weight: 650 });
    if (showReadout) F.readout([
      ['true airspeed $v$', `${trim(e.v)}\\,\\mathrm{m/s}`], ['air density $\\rho$', `${trim(e.rho, 4)}\\,\\mathrm{kg/m^3}`],
      ['$p_\\text{total} - p = \\tfrac12\\rho v^2$', `${trim(q / 1000, 3)}\\,\\mathrm{kPa}`], ['dial (sea-level $\\rho$)', `${trim(ias)}\\,\\mathrm{m/s}`],
    ]);
  }

  function draw() {
    const e = env();
    if (venturi) drawVenturi(e); else drawPitot(e);
  }
  F.draw(draw);
  F.caption(venturi
    ? 'Steady, incompressible flow with no friction, uniform across each section: $A v$ is the same at every section and $p + \\tfrac12\\rho v^2$ is the same along the pipe.' + (P.tubes ? ' Real pipes lose some pressure to friction, so a real outlet column stands a little lower than the inlet’s. The columns are not drawn to the pipe’s scale.' : '') + (P.slugs ? ' The pipe is round: equal volumes have lengths in inverse proportion to the areas, not the drawn widths.' : '') + ' Particles slowed for viewing, in proportion.'
    : 'Ideal two-dimensional flow past a blunt body (a Rankine half-body), with no friction. The static ports are taken to read the free-stream pressure exactly; real probes place them where the nose’s and the stem’s effects cancel. The dial is calibrated with sea-level air, 1.225 kg/m³, as real airspeed indicators are. Incompressible: above about 100 m/s (Mach 0.3) real instruments correct for compression. Particles slowed for viewing.');
  return { get: (k) => F.params[k] };
}

const SUB = { 1: '₁', 2: '₂', 3: '₃' };
const sub = (n) => SUB[n] || n;

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!SCENES.includes(P.scene)) return [`scene must be one of ${SCENES.join(', ')}`];
  const wanted = wantedOf(P);
  for (const k of wanted) if (!SETS[P.scene].includes(k)) problems.push(`unknown control “${k}” for ${P.scene} (use ${SETS[P.scene].join(', ')})`);
  if (P.scene === 'venturi') {
    if (!(P.v1 > 0)) problems.push('v1 must be positive');
    if (!(P.ratio >= 0.05 && P.ratio <= 1)) problems.push('ratio must lie in [0.05, 1]');
    if (!(P.D1 > 0)) problems.push('D1 must be positive');
    if (P.rho === null && !MF.FLUIDS[P.fluid]) problems.push(`unknown fluid “${P.fluid}”`);
    if (wanted.includes('fluid') && !LIQUIDS.includes(P.fluid)) problems.push(`with a fluid choice, fluid must be one of ${LIQUIDS.join(', ')}`);
    const rho = P.rho ?? MF.FLUIDS[P.fluid]?.rho;
    if (P.tubes && rho < 100) problems.push('piezometer tubes need a liquid (rho ≥ 100), or set tubes: false');
    if (!(P.p1 > MF.P_ATM)) problems.push('p1 is absolute (Pa) and must exceed 1 atm (101 325 Pa) for the tubes to stand');
  } else {
    if (!(P.v >= 0 && P.v <= 400)) problems.push('v must lie in [0, 400] m/s');
    if (!(P.alt >= 0 && P.alt <= 20)) problems.push('alt must lie in [0, 20] km');
    if (P.rho !== null && !(P.rho > 0)) problems.push('rho must be positive');
  }
  return problems;
}
