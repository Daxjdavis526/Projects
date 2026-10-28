// Where the energy goes: the Poynting vector S = E × B/μ₀ drawn in three
// quasistatic set-ups, side-on, with the electric field (orange), the
// magnetic field (blue ⊙ out of the page, ⊗ into it) and S (gold) — and the
// total flow of S through a surface beside the power it accounts for. The
// physics is model/em4-poynting.js (tested in test/em4-poynting.test.mjs).
//
//   wire       a resistor of radius a and length L carrying I with V across
//              it: S points straight IN through its side, and ∮S·da = VI = I²R
//              — the energy arrives from the space around the wire;
//   capacitor  circular plates charging (or discharging): S points in (or
//              out) through the rim of the gap, growing in proportion to the
//              distance from the axis, and S·2πRd = VI = d/dt(½CV²);
//   coax       a coaxial line from a source to a load: S runs along the gap
//              between the conductors, crowded toward the inner one (∝ 1/s²),
//              and ∫S·da over the gap = VI.
//
//   { type: 'em4-poynting', params: {
//       mode: 'wire',            // 'wire' | 'capacitor' | 'coax'
//       modes: null,             // a list of modes to offer as a choice
//       V: 12, I: 2,             // volts and amperes (capacitor: I < 0 discharges)
//       a: 1, L: 10,             // wire: radius (mm), length (cm)
//       R: 5, d: 2,              // capacitor: plate radius (cm), gap (mm)
//       ca: 1, cb: 3.5,          // coax: inner and outer radii (mm)
//       controls: null,          // true | false | a list of slider keys (V I a L R d cb dir); default: all unless compact
//       readouts: null,          // a list of: E B S flow P U (default: all for the mode); readout: false hides the bar
//       labels: true,            // name the fields on the picture
//       hide: [],                // 'S' | 'E' | 'B': leave that field off the picture (a question about it)
//   } }
//
// Fields are drawn to show direction; arrow lengths are only roughly to scale
// (the caption says so). Fringing at the capacitor's edge, the surface charges
// that bend E outside the wire, and the wire's own inductance are ignored.

import { Plot } from '../plot.js';
import * as M from '../model/em4-poynting.js';

export const defaults = { mode: 'wire', modes: null, V: 12, I: 2, a: 1, L: 10, R: 5, d: 2, ca: 1, cb: 3.5, controls: null, readouts: null, readout: null, labels: true, hide: [] };
const MODES = ['wire', 'capacitor', 'coax'];
const CONTROLS = { wire: ['V', 'I', 'a', 'L'], capacitor: ['V', 'I', 'R', 'd'], coax: ['V', 'I', 'cb'] };
const READOUTS = { wire: ['E', 'B', 'S', 'flow', 'P'], capacitor: ['E', 'B', 'S', 'flow', 'U'], coax: ['E', 'S', 'flow', 'P'] };

export function validate(P) {
  const out = [];
  const p = { ...defaults, ...P };
  if (!MODES.includes(p.mode)) out.push(`em4-poynting: mode must be one of ${MODES.join(', ')}`);
  for (const m of p.modes || []) if (!MODES.includes(m)) out.push(`em4-poynting: unknown mode ${m}`);
  for (const k of ['V', 'a', 'L', 'R', 'd', 'ca', 'cb']) if (!(typeof p[k] === 'number' && p[k] > 0)) out.push(`em4-poynting: ${k} must be a positive number`);
  if (!(typeof p.I === 'number' && p.I !== 0)) out.push('em4-poynting: I must be a non-zero number');
  if (p.cb <= p.ca) out.push('em4-poynting: the outer radius cb must exceed the inner ca');
  for (const r of p.readouts || []) if (!['E', 'B', 'S', 'flow', 'P', 'U'].includes(r)) out.push(`em4-poynting: unknown readout ${r}`);
  for (const h of p.hide || []) if (!['S', 'E', 'B'].includes(h)) out.push(`em4-poynting: unknown hide ${h}`);
  return out;
}

// numbers with SI prefixes, as TeX
const PRE = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, '\\mu '], [1e-9, 'n'], [1e-12, 'p']];
function tq(x, unit, n = 3) {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (Math.abs(x) < 1e-15) return `0\\ \\mathrm{${unit}}`;
  const [f, p] = PRE.find(([s]) => Math.abs(x) >= s * 0.9995) || PRE[PRE.length - 1];
  return `${+(x / f).toPrecision(n)}\\ \\mathrm{${p}${unit}}`;
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const modes = P.modes && P.modes.length > 1 ? P.modes : null;
  if (modes) F.choice({ key: 'mode', label: 'Set-up', options: modes.map((m) => [m, { wire: 'resistor', capacitor: 'charging capacitor', coax: 'coaxial cable' }[m]]), value: P.mode, explain: 'Three places energy flows: into a resistor, into a capacitor, along a cable.' });
  const allKeys = ['V', 'I', 'a', 'L', 'R', 'd', 'cb'];
  const want = P.controls === true || (P.controls == null && !compact) ? allKeys : Array.isArray(P.controls) ? P.controls : [];
  const mode = () => F.params.mode ?? P.mode;
  const SL = {
    V: { label: 'Voltage $V$', min: 0.5, max: 50, step: 0.5, value: P.V, unit: '\\mathrm{V}', explain: 'Across the resistor, across the plates so far, or between the coax’s conductors.' },
    I: { label: 'Current $I$', min: -5, max: 5, step: 0.1, value: P.I, unit: '\\mathrm{A}', explain: 'Positive: to the right, charging the capacitor. Negative: reversed — the capacitor discharges.' },
    a: { label: 'Wire radius $a$', min: 0.1, max: 3, step: 0.1, value: P.a, unit: '\\mathrm{mm}', explain: 'A thinner wire has a stronger B at its surface, so S there is larger — over a smaller area.' },
    L: { label: 'Resistor length $L$', min: 1, max: 50, step: 1, value: P.L, unit: '\\mathrm{cm}', explain: 'The same V over a longer wire makes a weaker E along it.' },
    R: { label: 'Plate radius $R$', min: 1, max: 15, step: 0.5, value: P.R, unit: '\\mathrm{cm}', explain: 'The rim through which the energy enters.' },
    d: { label: 'Gap $d$', min: 0.5, max: 10, step: 0.5, value: P.d, unit: '\\mathrm{mm}', explain: 'A wider gap holds the same V with a weaker E — over a taller rim.' },
    cb: { label: 'Outer radius $b$', min: P.ca * 1.2, max: P.ca * 10, step: 0.1, value: P.cb, unit: '\\mathrm{mm}', explain: `The inner radius is ${P.ca} mm. A wider gap spreads the flow out; the total stays $VI$.` },
  };
  const relevant = (k) => CONTROLS[mode()].includes(k) || modes;
  for (const k of allKeys) if (want.includes(k) && relevant(k)) F.slider({ key: k, ...SL[k] });
  const v = (k) => F.params[k] ?? P[k];

  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || 'A conductor side-on with its electric field, magnetic field and Poynting vector' });
  const plot = new Plot(canvas, { x: [-6, 6], y: [-3.1, 3.1], equal: true, grid: false, axes: false, pad: { l: 6, r: 6, t: 6, b: 6 } });
  const hide = new Set(P.hide || []);
  const lab = P.labels !== false;

  const dot = (x, y, r, col) => { plot.circle(x, y, r, { color: col, width: 1.6 }); plot.point(x, y, { r: 2, color: col }); };
  const cross = (x, y, r, col) => { plot.circle(x, y, r, { color: col, width: 1.6 }); const q = r * 0.62; plot.line(x - q, y - q, x + q, y + q, { color: col, width: 1.6 }); plot.line(x - q, y + q, x + q, y - q, { color: col, width: 1.6 }); };
  const bmark = (x, y, out, r = 0.17) => (out ? dot : cross)(x, y, r, 'accent');

  function drawWire() {
    const I = Math.abs(v('I'));   // a resistor's current and voltage reverse together: S always points in
    const ra = 0.42;
    plot.line(-6, 0, -2.6, 0, { color: 'ink3', width: 3 }); plot.line(2.6, 0, 6, 0, { color: 'ink3', width: 3 });
    plot.rect(-2.6, -ra, 5.2, 2 * ra, { fill: 'gold', alpha: 0.28, stroke: 'gold', width: 1.4 });
    if (!hide.has('E')) {
      for (const x of [-1.6, 0, 1.6]) plot.arrow(x - 0.5, 0, x + 0.5, 0, { color: 'warn', width: 2.2, head: 8 });
      for (const y of [0.62, -0.62]) plot.arrow(-0.4, y, 0.4, y, { color: 'warn', width: 1.4, head: 6, alpha: 0.7 });
      if (lab) plot.text('E', 0.48, 0.62, { color: 'warn', size: 12, dx: 4 });
    }
    if (!hide.has('B')) for (const x of [-1.8, -0.6, 0.6, 1.8]) { bmark(x, 1.05, I > 0); bmark(x, -1.05, I < 0); }
    if (!hide.has('B') && lab) plot.text('B', 2.7, 1.05, { color: 'accent', size: 12 });
    if (!hide.has('S')) {
      for (const x of [-2.1, -1.2, -0.3, 0.6, 1.5, 2.4].map((u) => u - 0.15)) { plot.arrow(x, 2.6, x, 0.62, { color: 'gold', width: 2.2, head: 9 }); plot.arrow(x, -2.6, x, -0.62, { color: 'gold', width: 2.2, head: 9 }); }
      if (lab) plot.text('S = E × B / μ₀', -5.8, 2.2, { color: 'gold', size: 12.5 });
    }
    if (lab) { plot.arrow(-5.4, 0.35, -4.2, 0.35, { color: 'ink2', width: 1.6, head: 7 }); plot.text(`I`, -4.1, 0.35, { color: 'ink2', size: 12, dx: 4 }); plot.text('resistor', 2.7, -0.7, { color: 'gold', size: 11.5 }); }
    const w = M.wire({ V: v('V'), I, a: v('a') * 1e-3, L: v('L') * 1e-2 });
    return {
      E: ['$E$ along the wire', tq(w.E, 'V/m')], B: ['$B$ at its surface', tq(w.B, 'T')], S: ['$S$ into its surface', tq(w.S, 'W/m^2')],
      flow: ['$\\oint\\vec S\\cdot d\\vec a$ in through the side', tq(w.inflow, 'W')], P: ['$VI = I^2R$', tq(w.P, 'W')],
    };
  }

  function drawCap() {
    const I = v('I'), Rr = 2.3, g = 0.65;
    plot.line(-6, 0, -g - 0.12, 0, { color: 'ink3', width: 3 }); plot.line(g + 0.12, 0, 6, 0, { color: 'ink3', width: 3 });
    plot.rect(-g - 0.12, -Rr, 0.12, 2 * Rr, { fill: 'ink2', alpha: 0.85, stroke: 'ink2' });
    plot.rect(g, -Rr, 0.12, 2 * Rr, { fill: 'ink2', alpha: 0.85, stroke: 'ink2' });
    if (lab) { plot.text('+', -g - 0.32, 1.45, { color: 'bad', size: 14, align: 'center' }); plot.text('−', g + 0.32, 1.45, { color: 'accent', size: 14, align: 'center' }); }
    if (!hide.has('E')) {
      for (const y of [-1.6, -0.55, 0.55, 1.6]) plot.arrow(-g + 0.08, y, g - 0.08, y, { color: 'warn', width: 2, head: 7 });
      if (lab) plot.text('E', 0, 0, { color: 'warn', size: 12, align: 'center' });
    }
    if (!hide.has('B')) for (const y of [0.9, 2.0]) { bmark(1.5, y, I > 0, 0.12 + 0.05 * y); bmark(1.5, -y, I < 0, 0.12 + 0.05 * y); bmark(-1.5, y, I > 0, 0.12 + 0.05 * y); bmark(-1.5, -y, I < 0, 0.12 + 0.05 * y); }
    if (!hide.has('B') && lab) plot.text('B', 1.85, 2.0, { color: 'accent', size: 12 });
    if (!hide.has('S')) {
      const s = I > 0 ? 1 : -1;
      // through the rim, and inside the gap (∝ distance from the axis)
      for (const x of [-0.25, 0.25]) {
        if (s > 0) { plot.arrow(x, 3.0, x, Rr + 0.05, { color: 'gold', width: 2.4, head: 9 }); plot.arrow(x, -3.0, x, -Rr - 0.05, { color: 'gold', width: 2.4, head: 9 }); }
        else { plot.arrow(x, Rr + 0.05, x, 3.0, { color: 'gold', width: 2.4, head: 9 }); plot.arrow(x, -Rr - 0.05, x, -3.0, { color: 'gold', width: 2.4, head: 9 }); }
      }
      for (const y of [1.15, 1.9]) {
        const len = 0.3 * y;
        if (s > 0) { plot.arrow(0, y + len / 2, 0, y - len / 2, { color: 'gold', width: 1.6, head: 6 }); plot.arrow(0, -y - len / 2, 0, -y + len / 2, { color: 'gold', width: 1.6, head: 6 }); }
        else { plot.arrow(0, y - len / 2, 0, y + len / 2, { color: 'gold', width: 1.6, head: 6 }); plot.arrow(0, -y + len / 2, 0, -y - len / 2, { color: 'gold', width: 1.6, head: 6 }); }
      }
      if (lab) plot.text(s > 0 ? 'S in through the rim' : 'S out through the rim', 0.45, 2.75, { color: 'gold', size: 12 });
    }
    if (lab) { plot.arrow(-5.4, 0.35, -4.2, 0.35, { color: 'ink2', width: 1.6, head: 7 }); plot.text(I > 0 ? 'I (charging)' : 'I (discharging)', -4.1, 0.35, { color: 'ink2', size: 12, dx: 4 }); }
    const c = M.capacitor({ V: v('V'), I: v('I'), R: v('R') * 1e-2, d: v('d') * 1e-3 });
    return {
      E: ['$E$ in the gap', tq(c.E, 'V/m')], B: ['$B$ at the rim', tq(Math.abs(c.Brim), 'T')], S: ['$S$ at the rim', tq(Math.abs(c.Srim), 'W/m^2')],
      flow: [I > 0 ? 'in through the rim' : 'out through the rim', tq(Math.abs(c.inflow), 'W')], U: ['$\\tfrac{d}{dt}(\\tfrac12CV^2) = VI$', tq(c.dUdt, 'W')],
    };
  }

  function drawCoax() {
    const I = v('I'), ri = 0.45, ro = 2.3;
    plot.rect(-5.6, -ri, 11.2, 2 * ri, { fill: 'gold', alpha: 0.5, stroke: 'gold' });
    plot.rect(-5.6, ro, 11.2, 0.22, { fill: 'ink3', alpha: 0.9, stroke: 'ink3' });
    plot.rect(-5.6, -ro - 0.22, 11.2, 0.22, { fill: 'ink3', alpha: 0.9, stroke: 'ink3' });
    if (lab) { plot.text('source', -5.9, 2.85, { color: 'ink2', size: 12 }); plot.text('load', 5.9, 2.85, { color: 'ink2', size: 12, align: 'right' }); }
    if (!hide.has('E')) {
      for (const x of [-4.2, 4.2]) { plot.arrow(x, ri + 0.05, x, ro - 0.05, { color: 'warn', width: 2, head: 7 }); plot.arrow(x, -ri - 0.05, x, -ro + 0.05, { color: 'warn', width: 2, head: 7 }); }
      if (lab) plot.text('E', 4.35, 1.5, { color: 'warn', size: 12 });
    }
    if (!hide.has('B')) for (const x of [-3.2, 3.2]) for (const y of [0.85, 1.75]) { bmark(x, y, I > 0, 0.2 - 0.04 * y); bmark(x, -y, I < 0, 0.2 - 0.04 * y); }
    if (!hide.has('S')) {
      const dir = I > 0 ? 1 : -1;
      for (const y of [0.75, 1.15, 1.6, 2.05]) {
        const len = Math.min(2.4, 1.1 * (0.75 / y) ** 2 * 2.2);
        for (const sy of [y, -y]) plot.arrow(-len / 2 * dir, sy, len / 2 * dir, sy, { color: 'gold', width: 2.2, head: 8 });
      }
      if (lab) plot.text('S, toward the load', 1.5, 2.05, { color: 'gold', size: 12, dx: 6 });
    }
    const x = M.coax({ V: v('V'), I: v('I'), a: P.ca * 1e-3, b: v('cb') * 1e-3 });
    return {
      E: ['$E$ at the inner conductor', tq(x.E(P.ca * 1e-3), 'V/m')], S: ['$S$ at the inner conductor', tq(x.S(P.ca * 1e-3), 'W/m^2')],
      flow: ['$\\int\\vec S\\cdot d\\vec a$ over the gap', tq(x.flow, 'W')], P: ['$VI$', tq(x.P, 'W')],
    };
  }

  function draw() {
    plot.clear();
    const m = mode();
    const rows = m === 'capacitor' ? drawCap() : m === 'coax' ? drawCoax() : drawWire();
    if (P.readout === false) { F.readout([]); return; }
    const keys = (P.readouts || READOUTS[m]).filter((k) => rows[k]);
    F.readout(keys.map((k) => rows[k]));
  }
  F.onChange(draw);
  F.draw(draw);
  if (!P.caption) F.caption('Directions are exact; arrow lengths are only roughly to scale. Quasistatic: fringing, the wire’s surface charges and its inductance are ignored.');
}

