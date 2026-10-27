// The PV diagram of an ideal gas. A process is drawn as you drag its end
// state along the curve, with the work done by the gas shaded as the area
// under the path; reference isotherms and adiabats run through the states; Q,
// W and ΔE_int are read out. Several paths between the same two states show
// that work and heat depend on the path while ΔE_int does not. Whole cycles —
// Carnot, Otto, Brayton, a rectangle — shade the net work inside them, colour
// each leg by whether heat flows in or out, and read out the efficiency beside
// the Carnot limit (or, run backwards, the coefficients of performance). A
// temperature–entropy diagram can sit beside the PV diagram: there the area
// under a reversible path is the heat. A separate mode draws the energy-flow
// diagram of an engine, a refrigerator or a heat pump, arrows to scale.
// Physics in model/therm-pv.js (tested headlessly in test/therm-pv.test.mjs).
//
// Pressures and volumes in params are in the display units (punit, vunit);
// temperatures are in kelvin.
//
//   { type: 'therm-pv', params: {
//       mode: 'process',            // 'process' | 'paths' | 'cycle' | 'flow'
//       gas: 'air',                 // He Ar (γ = 5/3); air N2 O2 H2 (7/5); exhaust (1.2); or γ itself, a number
//       gases: null,                // the gases the 'gas' control offers (default: just gas)
//       n: 1,                       // moles (an Otto cycle works it out from its intake state)
//       vunit: 'L', punit: 'kPa',   // L m3 cm3 · Pa kPa MPa bar atm
//       vrange: null, prange: null, // axis ranges in display units (default: fitted, from zero)
//
//       // 'process': one quasi-static process from start; drag (or slide) its end along the curve
//       start: { P: 100, V: 1 },    // any two of P, V, T
//       process: 'isothermal',      // isothermal isobaric isochoric adiabatic line
//       processes: null,            // the processes the 'process' control offers
//       end: { V: 3 },              // V, P or T (isochoric: P or T; a straight line: V and P)
//       drag: true,                 // drag the end state
//
//       // 'paths': named states joined by legs; a path that ends where it began is a cycle
//       states: { A: { P: 300, V: 1, label: 'A', dx: 8, dy: -10 } },   // label: canvas text (default: the name; '' hides it)
//       paths: [{ from: 'A', legs: [['isobaric', 'B'], ['isochoric', { P: 100 }]], label: 'path 1', color: 'accent' }],
//       show: 0,                    // the path that is shaded and read out ('all' shades every one)
//
//       // 'cycle': a preset, run forwards (an engine) or backwards (reverse: true, a refrigerator)
//       cycle: 'carnot',            // carnot otto brayton rect
//       cycles: null,               // the cycles the 'cycle' control offers
//       Th: 600, Tc: 300, VA: 1, ratio: 2,               // carnot: reservoirs (K), V at A, isothermal expansion ratio V_B/V_A
//       r: 8, T1: 300, P1: 100, V1: 0.5, T3: 1800,       // otto: compression ratio, intake state 1, peak temperature
//       rp: 10,                     // brayton: pressure ratio (with T1, P1 at the compressor inlet, T3 at the turbine inlet, n)
//       V2: 3, P2: 300,             // rect: corners (V1, P1) and (V2, P2)
//       reverse: false,
//
//       // 'flow': an energy-flow diagram with arrow widths to scale
//       device: 'engine',           // engine fridge pump
//       Qh: 1000, Qc: 600, W: 400,  // energies per cycle, in any one unit (they must balance)
//       labels: { Qh: 'Q_h = 1000 J', Qc: 'Q_c = ?', W: 'W = 400 J', hot: 'hot reservoir', cold: 'cold reservoir', device: 'engine' },
//
//       controls: [],               // any of process gas end path cycle Th Tc ratio r rp T1 T3 V2 P2 reverse; true: all that apply
//       ranges: {},                 // slider ranges: { Th: [min, max, step], V2: […], … } (display units)
//       readouts: null,             // any of W Q dU dS Qh Qc Wnet e carnot COP COPhp bwr legs, or T/P/V + a state name
//                                   // (T1 T2 in process mode; TA…TD, T1…T4 for cycles); default: a few when there are controls
//       ts: false,                  // a temperature–entropy diagram beside (or below) the PV diagram
//       isotherms: 'auto',          // dashed reference isotherms: 'auto' (through the states), a list of K, or false
//       isoLabels: true,            // label isotherms with their temperatures
//       adiabats: false,            // dotted reference adiabats: true (through every state) or a list of state names
//       shade: true,                // work as area: under a process (green: by the gas, orange: on it), inside a cycle (gold)
//       heat: true,                 // colour legs by heat: red in, blue out, violet none (false: the path's own colour)
//       arrows: true,               // direction arrows along the legs
//       legend: 'auto',             // the heat-colour key (auto: when legs are coloured and the picture is not small)
//       stateLabels: true, stateT: false,   // state names; stateT adds each state's temperature
//       areaLabel: null,            // text in the shaded area, e.g. 'W = ?'
//       note: null,                 // a line of text at the top left of the PV diagram
//       aspect: null, alt: null,
//   } }
//
// A problem's picture must not show its answer: switch off the readouts, the
// isotherm labels (isoLabels: false) or stateT when a temperature is asked for.

import { Plot, themeColors } from '../plot.js';
import * as M from '../model/therm-pv.js';

export const defaults = {
  mode: 'process', gas: 'air', gases: null, n: 1, vunit: 'L', punit: 'kPa', vrange: null, prange: null,
  start: { P: 100, V: 1 }, process: 'isothermal', processes: null, end: { V: 3 }, drag: true,
  states: null, paths: null, show: 0,
  cycle: 'carnot', cycles: null, Th: 600, Tc: 300, VA: 1, ratio: 2, r: 8, T1: 300, P1: 100, V1: 0.5, T3: 1800, rp: 10, V2: 3, P2: 300, reverse: false,
  device: 'engine', Qh: 1000, Qc: 600, W: 400, labels: {},
  controls: [], ranges: {}, readouts: null, ts: false, isotherms: 'auto', isoLabels: true, adiabats: false,
  shade: true, heat: true, arrows: true, legend: 'auto', stateLabels: true, stateT: false, areaLabel: null, note: null, aspect: null, alt: null,
};

const MODES = ['process', 'paths', 'cycle', 'flow'];
const PROCESSES = ['isothermal', 'isobaric', 'isochoric', 'adiabatic', 'line'];
const CYCLES = ['carnot', 'otto', 'brayton', 'rect'];
const DEVICES = ['engine', 'fridge', 'pump'];
const VUNITS = { L: [1e-3, 'L'], m3: [1, 'm³'], cm3: [1e-6, 'cm³'] };
const PUNITS = { Pa: [1, 'Pa'], kPa: [1e3, 'kPa'], MPa: [1e6, 'MPa'], bar: [1e5, 'bar'], atm: [101325, 'atm'] };
const CONTROLS = ['process', 'gas', 'end', 'path', 'cycle', 'Th', 'Tc', 'ratio', 'r', 'rp', 'T1', 'T3', 'V2', 'P2', 'reverse'];
const READOUTS = ['W', 'Q', 'dU', 'dS', 'Qh', 'Qc', 'Wnet', 'e', 'carnot', 'COP', 'COPhp', 'bwr', 'legs'];
// the sliders each cycle uses
const CYCLE_KEYS = { carnot: ['Th', 'Tc', 'ratio'], otto: ['r', 'T1', 'T3'], brayton: ['rp', 'T1', 'T3'], rect: ['V2', 'P2'] };
const RANGE = {
  Th: [300, 1500, 10], Tc: [100, 600, 5], ratio: [1.2, 4, 0.1], r: [2, 20, 0.5], rp: [2, 50, 1], T1: [250, 350, 5], T3: [800, 3000, 20],
};
const PROC_NAME = { isothermal: 'Isothermal', isobaric: 'Isobaric', isochoric: 'Isochoric', adiabatic: 'Adiabatic', line: 'Straight line' };
const CYCLE_NAME = { carnot: 'Carnot', otto: 'Otto', brayton: 'Brayton', rect: 'Rectangle' };
const CYCLE_TIP = { carnot: 'Carnot: two isotherms and two adiabats.', otto: 'Otto: the petrol engine — heat added at constant volume.', brayton: 'Brayton: the gas turbine — heat added at constant pressure.', rect: 'Rectangle: two isochores and two isobars.' };
const LEG_NAME = { isothermal: 'isothermal', isobaric: 'isobaric', isochoric: 'isochoric', adiabatic: 'adiabatic', line: 'straight line', free: 'free expansion' };

const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const minus = (s) => String(s).replace(/^-/, '−');

/** An energy in J as TeX, in J, kJ or MJ. */
function eTeX(x, signed = false) {
  const a = Math.abs(x);
  if (a < 1e-9) return '0';
  const [v, u] = a >= 1e6 ? [x / 1e6, 'MJ'] : a >= 1e3 ? [x / 1e3, 'kJ'] : [x, 'J'];
  return `${signed && x > 0 ? '+' : ''}${trim(v)}\\,\\mathrm{${u}}`;
}

/** Canvas text with subscripts: 'Q_h = 10 J', 'T_{max}'. Returns its width. */
function rich(g, c, s, px, py, o = {}) {
  const size = o.size || 12.5, weight = o.weight || 500;
  const parts = [];
  const re = /_(\{[^}]*\}|[^\s{])/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push({ t: s.slice(last, m.index), sub: false });
    parts.push({ t: m[1].replace(/^\{|\}$/g, ''), sub: true });
    last = re.lastIndex;
  }
  if (last < s.length) parts.push({ t: s.slice(last), sub: false });
  const font = (sub) => `${weight} ${sub ? Math.round(size * 0.76) : size}px Inter, system-ui, sans-serif`;
  let w = 0;
  for (const p of parts) { g.font = font(p.sub); p.w = g.measureText(p.t).width; w += p.w; }
  if (o.measure) return w;
  let x = o.align === 'center' ? px - w / 2 : o.align === 'right' ? px - w : px;
  g.save(); g.textAlign = 'left'; g.textBaseline = 'middle';
  for (const p of parts) {
    g.font = font(p.sub);
    const y = py + (p.sub ? size * 0.3 : 0);
    if (o.halo !== false) { g.lineWidth = 3.5; g.strokeStyle = c.bg; g.globalAlpha = 0.85; g.strokeText(p.t, x, y); g.globalAlpha = 1; }
    g.fillStyle = c[o.color] || o.color || c.ink;
    g.fillText(p.t, x, y);
    x += p.w;
  }
  g.restore();
  return w;
}

/** Controls that apply to these parameters (controls: true). */
function allControls(P) {
  if (P.mode === 'process') return ['process', 'gas', 'end'];
  if (P.mode === 'paths') return ['path', 'gas'];
  if (P.mode === 'cycle') return ['cycle', 'gas', ...new Set((P.cycles || [P.cycle]).flatMap((c) => CYCLE_KEYS[c])), 'reverse'];
  return [];
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const [vf, vname] = VUNITS[P.vunit], [pf, pname] = PUNITS[P.punit];
  const controls = P.controls === true ? allControls(P) : P.controls || [];
  const gases = P.gases || [P.gas];
  const has = (k) => controls.includes(k);

  // ── controls ─────────────────────────────────────────────────────────────
  if (has('gas') && gases.length > 1) F.choice({ key: 'gas', label: 'Gas', options: gases.map((k) => [k, typeof k === 'number' ? `γ = ${k}` : `${M.GASES[k].name} (γ = ${trim(M.GASES[k].gamma, 3)})`]), value: P.gas, explain: 'Helium and argon atoms only fly about ($\\gamma = 5/3$); air molecules also tumble ($\\gamma = 7/5$).' });
  else F.params.gas = P.gas;
  const nodes = {};
  const slide = (key, label, unit, explain, def) => {
    const [lo, hi, st] = P.ranges[key] || def;
    nodes[key] = F.slider({ key, label, min: lo, max: hi, step: st, value: Math.min(hi, Math.max(lo, P[key])), unit, explain }).node;
  };

  if (P.mode === 'process') {
    const procs = P.processes || [P.process];
    if (has('process') && procs.length > 1) F.choice({ key: 'process', label: 'Process', options: procs.map((k) => [k, PROC_NAME[k]]), value: P.process, explain: 'Isothermal: $T$ fixed. Isobaric: $P$ fixed. Isochoric: $V$ fixed. Adiabatic: no heat flows. Straight line: any two states.' });
    else F.params.process = P.process;
  } else if (P.mode === 'paths') {
    if (has('path') && P.paths.length > 1) F.choice({ key: 'path', label: 'Path', options: P.paths.map((p, i) => [i, p.label || `path ${i + 1}`]), value: P.show === 'all' ? 0 : P.show, explain: 'Every path runs between the same two end states.' });
    else F.params.path = P.show;
  } else if (P.mode === 'cycle') {
    const cyc = P.cycles || [P.cycle];
    if (has('cycle') && cyc.length > 1) F.choice({ key: 'cycle', label: 'Cycle', options: cyc.map((k) => [k, CYCLE_NAME[k]]), value: P.cycle, explain: cyc.map((k) => CYCLE_TIP[k]).join(' ') });
    else F.params.cycle = P.cycle;
    if (has('Th')) slide('Th', 'Hot reservoir $T_h$', '\\mathrm{K}', 'The temperature at which the engine takes in heat.', RANGE.Th);
    if (has('Tc')) slide('Tc', 'Cold reservoir $T_c$', '\\mathrm{K}', 'The temperature at which it gives heat out.', RANGE.Tc);
    if (has('ratio')) slide('ratio', 'Expansion ratio $V_B/V_A$', '', 'How far the gas expands along the hot isotherm: more heat and more work per cycle.', RANGE.ratio);
    if (has('r')) slide('r', 'Compression ratio $r = V_1/V_2$', '', 'Cylinder volume at the bottom of the stroke over the volume at the top.', RANGE.r);
    if (has('rp')) slide('rp', 'Pressure ratio $r_p = P_2/P_1$', '', 'Compressor outlet pressure over inlet pressure.', RANGE.rp);
    if (has('T1')) slide('T1', 'Intake temperature $T_1$', '\\mathrm{K}', 'The air drawn in at state 1.', RANGE.T1);
    if (has('T3')) slide('T3', 'Peak temperature $T_3$', '\\mathrm{K}', 'After the fuel burns: set by the fuel and by what the metal can survive.', RANGE.T3);
    if (has('V2')) slide('V2', `Largest volume $V_2$`, `\\mathrm{${P.vunit === 'm3' ? 'm^3' : P.vunit === 'cm3' ? 'cm^3' : 'L'}}`, 'The right-hand side of the rectangle.', [P.V1 * 1.2, P.V1 * 5, P.V1 / 20]);
    if (has('P2')) slide('P2', `Highest pressure $P_2$`, `\\mathrm{${P.punit}}`, 'The top of the rectangle.', [P.P1 * 1.2, P.P1 * 5, P.P1 / 20]);
    if (has('reverse')) F.toggle({ key: 'reverse', label: 'Run it backwards (a refrigerator)', value: P.reverse, explain: 'The same states in the opposite order: every heat and work changes sign.' });
    else F.params.reverse = P.reverse;
  }
  for (const k of ['Th', 'Tc', 'ratio', 'r', 'rp', 'T1', 'T3', 'V2', 'P2']) if (!(k in F.params)) F.params[k] = P[k];

  // ── the process mode: a fixed start, an end that moves ─────────────────────
  const n0 = P.n;
  const gam = () => M.gammaOf(F.params.gas);
  const toSI = (s) => { const o = {}; if (s.P !== undefined) o.P = s.P * pf; if (s.V !== undefined) o.V = s.V * vf; if (s.T !== undefined) o.T = s.T; return o; };
  const nice = (x) => { const m = 10 ** Math.floor(Math.log10(x)); return [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((k) => k * m).find((v) => v >= x * 0.999); };
  const niceStep = (x) => { const m = 10 ** Math.floor(Math.log10(x)); return [1, 2, 5, 10].map((k) => k * m).find((v) => v >= x * 0.999); };
  let fixedV = P.vrange, fixedP = P.prange;     // process mode and explicit ranges keep their axes
  let A0 = null, lastB = null;
  const E = { V: null, P: null, T: null };      // the end state (SI): V fixes it, or T (isochoric), or V and P (a line)
  const endState = () => {
    const kind = F.params.process;
    if (kind === 'isochoric') return M.state({ V: A0.V, T: E.T }, n0);
    if (kind === 'line') return M.state({ V: E.V, P: E.P }, n0);
    return M.reach(kind, A0, { V: E.V }, n0, gam());
  };
  const settle = () => { lastB = endState(); E.V = lastB.V; E.P = lastB.P; E.T = lastB.T; };
  if (P.mode === 'process') {
    A0 = M.state(toSI(P.start), n0);
    const B = P.process === 'line' ? M.state(toSI(P.end), n0) : M.reach(P.process, A0, toSI(P.end), n0, gam());
    E.V = B.V; E.P = B.P; E.T = B.T;
    settle();
    if (!fixedV) fixedV = [0, nice(1.5 * Math.max(A0.V, B.V) / vf)];
    if (!fixedP) fixedP = [0, nice(1.4 * Math.max(A0.P, B.P) / pf)];
    if (has('end')) {
      const [lo, hi, st] = P.ranges.V2 || [niceStep(fixedV[1] / 40), fixedV[1], niceStep(fixedV[1] / 100)];
      nodes.V2 = F.slider({ key: 'V2', label: 'Final volume $V_2$', min: lo, max: hi, step: st, value: Math.min(hi, Math.max(lo, B.V / vf)), unit: `\\mathrm{${vname.replace('³', '^3')}}`, explain: 'Or drag the end point along the curve.' }).node;
      const [tlo, thi, tst] = P.ranges.T2 || [Math.round(A0.T / 3), Math.round(3 * A0.T), 1];
      nodes.T2 = F.slider({ key: 'T2', label: 'Final temperature $T_2$', min: tlo, max: thi, step: tst, value: Math.min(thi, Math.max(tlo, B.T)), unit: '\\mathrm{K}', explain: 'At constant volume the pressure rises in proportion to the temperature. Or drag the end point.' }).node;
    }
  }
  // only the sliders that mean something for the current process or cycle are shown
  const showSliders = () => {
    if (P.mode === 'process') {
      if (nodes.V2) nodes.V2.style.display = F.params.process === 'isochoric' ? 'none' : '';
      if (nodes.T2) nodes.T2.style.display = F.params.process === 'isochoric' ? '' : 'none';
    }
    if (P.mode === 'cycle') for (const k of Object.keys(nodes)) nodes[k].style.display = CYCLE_KEYS[F.params.cycle].includes(k) ? '' : 'none';
  };
  showSliders();
  let quiet = false;
  /** Move the end sliders to the end state without re-entering onChange. */
  const sync = () => {
    quiet = true;
    if (nodes.V2 && F.params.process !== 'isochoric') F.set('V2', +(lastB.V / vf).toPrecision(4));
    else if (nodes.T2 && F.params.process === 'isochoric') F.set('T2', +lastB.T.toPrecision(4));
    else F.notify('end');
    quiet = false;
  };

  const { canvas, box } = F.canvas({ aspect: P.aspect ?? (compact || P.ts ? 'wide' : ''), label: P.alt || (P.mode === 'flow' ? 'An energy-flow diagram' : 'A pressure–volume diagram of a gas') });
  const ctx = canvas.getContext('2d');
  const pv = new Plot(canvas, { x: [0, 1], y: [0, 1], xlabel: `V (${vname})`, ylabel: `P (${pname})` });
  const tsp = P.ts ? new Plot(canvas, { x: [0, 1], y: [0, 1], xlabel: 'S (J/K), zero arbitrary', ylabel: 'T (K)' }) : null;

  // ── build the picture's legs from the current parameters ───────────────────
  function build() {
    const g = gam();
    if (P.mode === 'process') {
      const kind = F.params.process, B = endState();
      return { g, n: n0, paths: [{ legs: [M.leg(kind, A0, B, n0, g)], names: ['1', '2'], closed: false }], focus: 0, named: { 1: A0, 2: B } };
    }
    if (P.mode === 'paths') {
      const named = {};
      for (const [k, s] of Object.entries(P.states)) named[k] = M.state(toSI(s), n0);
      const paths = P.paths.map((p) => {
        let A = named[p.from];
        const legs = [], names = [p.from];
        for (const [kind, to] of p.legs) {
          const B = typeof to === 'string' ? named[to] : M.reach(kind, A, toSI(to), n0, g);
          legs.push(M.leg(kind, A, B, n0, g));
          names.push(typeof to === 'string' ? to : null);
          A = B;
        }
        const closed = legs.length > 1 && legs[legs.length - 1].B === named[p.from];
        return { legs, names, closed, color: p.color, label: p.label };
      });
      const focus = P.show === 'all' ? 'all' : (F.params.path ?? 0);
      return { g, n: n0, paths, focus, named };
    }
    if (P.mode === 'cycle') {
      const k = F.params.cycle, Q = F.params;
      let c, n = n0;
      if (k === 'carnot') c = M.carnot({ Th: Q.Th, Tc: Math.min(Q.Tc, Q.Th - 5), VA: P.VA * vf, ratio: Q.ratio, n, g });
      else if (k === 'otto') { c = M.otto({ T1: Q.T1, P1: P.P1 * pf, V1: P.V1 * vf, r: Q.r, T3: Q.T3, g }); n = c.n; }
      else if (k === 'brayton') c = M.brayton({ T1: Q.T1, P1: P.P1 * pf, rp: Q.rp, T3: Q.T3, n, g });
      else c = M.rect({ V1: P.V1 * vf, V2: Q.V2 * vf, P1: P.P1 * pf, P2: Q.P2 * pf, n });
      if (Q.reverse) c = M.reversed(c);
      const legs = M.cycleLegs(c, n, g);
      const named = Object.fromEntries(c.names.map((nm, i) => [nm, c.states[i]]));
      return { g, n, paths: [{ legs, names: [...c.names, c.names[0]], closed: true }], focus: 0, named };
    }
    return null;
  }

  // ── dragging the end state ──────────────────────────────────────────────────
  if (P.mode === 'process' && P.drag) {
    pv.handle(() => [lastB.V / vf, lastB.P / pf], (x, y) => {
      const kind = F.params.process, g = gam();
      const vlo = Math.max(pv.vx0, 1e-6 * pv.vx1), vhi = pv.vx1, plo = Math.max(pv.vy0, 1e-6 * pv.vy1), phi = pv.vy1;
      const cx = (v) => Math.min(vhi, Math.max(vlo + 0.01 * (vhi - vlo), v)), cy = (p) => Math.min(phi, Math.max(plo + 0.01 * (phi - plo), p));
      if (kind === 'line') { E.V = cx(x) * vf; E.P = cy(y) * pf; }
      else if (kind === 'isochoric') E.T = (cy(y) * pf * A0.V) / (n0 * M.R);
      else {
        // the nearest point of the curve, in screen space
        let best = Infinity, bv = E.V;
        const px = pv.X(x), py = pv.Y(y);
        for (let i = 0; i <= 600; i++) {
          const v = vlo + ((vhi - vlo) * (i + 0.5)) / 601;
          const p = M.pressureOn(kind, A0, v * vf, n0, g) / pf;
          if (!(p <= phi && p >= plo)) continue;
          const d = (pv.X(v) - px) ** 2 + (pv.Y(p) - py) ** 2;
          if (d < best) { best = d; bv = v * vf; }
        }
        E.V = bv;
      }
      settle();
      sync();
    });
    pv.onDrag = () => draw();
  }

  F.onChange((key) => {
    if (quiet) return;
    if (P.mode === 'process') {
      const kind = F.params.process;
      if (key === 'V2') E.V = F.params.V2 * vf;
      if (key === 'T2') E.T = F.params.T2;
      if (key === 'process') {
        // start the new process from where the old one ended, unless that is no move at all
        E.V = lastB.V; E.P = lastB.P; E.T = lastB.T;
        const rT = E.T / A0.T, rV = E.V / A0.V;
        if (kind === 'isochoric' && Math.abs(rT - 1) < 0.01) E.T = A0.T * (Math.abs(rV - 1) > 0.01 ? rV : 1.5);
        if (kind !== 'isochoric' && Math.abs(rV - 1) < 0.01) E.V = A0.V * (Math.abs(rT - 1) > 0.01 ? rT : 2);
        if (kind === 'line' && Math.abs(E.V / A0.V - 1) < 0.01 && Math.abs(E.P / A0.P - 1) < 0.01) { E.V = 2 * A0.V; E.P = A0.P / 2; }
      }
      if (['V2', 'T2', 'process', 'gas'].includes(key)) settle();
      if (key === 'process') { showSliders(); sync(); }
    }
    if (P.mode === 'cycle' && key === 'cycle') showSliders();
    draw();
  });

  // ── drawing ──────────────────────────────────────────────────────────────
  function draw() {
    const c = themeColors();
    if (P.mode === 'flow') { drawFlow(c); return; }
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 340;
    const narrow = W < 540;
    if (tsp) {
      const want = narrow ? (compact ? '5 / 6' : '4 / 5') : '';
      if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    }
    // shown to the pieces of the layout
    const pad = { l: 54, r: 16, t: 16, b: 36 };
    if (tsp && !narrow) { pv.o.pad = { ...pad, r: Math.round(W / 2) + 8 }; tsp.o.pad = { ...pad, l: Math.round(W / 2) + 56 }; }
    else if (tsp) { const h2 = Math.round(H / 2); pv.o.pad = { ...pad, b: h2 + 26 }; tsp.o.pad = { ...pad, t: h2 + 22 }; }
    else pv.o.pad = pad;

    let m;
    try { m = build(); } catch (e) { pv.setView([0, 1], [0, 1]); pv.clear(); readout([['', '\\text{these settings give no valid states}']]); return; }
    const { g, n, paths, focus, named } = m;
    const isFocus = (i) => focus === 'all' || focus === i;
    const small = compact || W < 420;
    const fs = small ? 11.5 : 12.5;

    // samples of every leg, in display units
    const samp = paths.map((p) => p.legs.map((L) => M.sampleLeg(L, n, g, 120)));
    // the views
    let vr = fixedV, pr = fixedP;
    if (!vr || !pr) {
      let vmax = 0, pmax = 0;
      samp.flat(2).forEach((s) => { vmax = Math.max(vmax, s.V / vf); pmax = Math.max(pmax, s.P / pf); });
      vr = vr || [0, nice(1.12 * vmax)];
      pr = pr || [0, nice(1.15 * pmax)];
    }
    pv.setView(vr, pr);
    pv.clear();

    // reference curves
    const Ts = isothermList(m, samp);
    const dom = [Math.max(pv.vx0, pv.vx1 * 1e-3), pv.vx1];
    for (const T of Ts) pv.fn((v) => (n * M.R * T) / (v * vf) / pf, { color: 'ink3', width: 1.1, dash: [5, 5], domain: dom });
    const adi = adiabatStates(m);
    for (const s of adi) pv.fn((v) => (s.P * (s.V / (v * vf)) ** g) / pf, { color: 'violet', width: 1.1, dash: [2, 4], alpha: 0.8, domain: dom });

    // the work as area
    const heatOf = (L) => (Math.abs(L.Q) < 1e-9 * (Math.abs(L.W) + Math.abs(L.dU) + 1) ? 0 : Math.sign(L.Q));
    const legColor = (L, p) => (P.heat ? (L.kind === 'free' ? 'ink3' : heatOf(L) > 0 ? 'bad' : heatOf(L) < 0 ? 'accent' : 'violet') : p.color || 'accent');
    const areaAt = [];
    if (P.shade) paths.forEach((p, i) => {
      if (!isFocus(i)) return;
      if (p.closed) {
        const pts = samp[i].flat().map((s) => [s.V / vf, s.P / pf]);
        pv.path(pts, { close: true, fill: 'gold', fillAlpha: 0.26, stroke: false });
        areaAt.push(centroid(pts));
      } else p.legs.forEach((L, k) => {
        if (L.kind === 'free' || Math.abs(L.B.V - L.A.V) < 1e-12) return;
        const pts = samp[i][k].map((s) => [s.V / vf, s.P / pf]);
        pv.path([...pts, [L.B.V / vf, 0], [L.A.V / vf, 0]], { close: true, fill: L.W >= 0 ? 'good' : 'warn', fillAlpha: 0.22, stroke: false });
        areaAt.push(centroid([...pts, [L.B.V / vf, pv.vy0], [L.A.V / vf, pv.vy0]]));
      });
    });

    // the legs and their arrows
    paths.forEach((p, i) => p.legs.forEach((L, k) => {
      const pts = samp[i][k].map((s) => [s.V / vf, s.P / pf]);
      const col = legColor(L, p);
      if (L.kind === 'free') pv.path(pts, { color: col, width: 1.8, dash: [3, 5] });
      else pv.path(pts, { color: col, width: isFocus(i) ? 2.8 : 1.8, alpha: isFocus(i) ? 1 : 0.55 });
      if (P.arrows && L.kind !== 'free') arrowOn(pv, pts, col, small ? 10 : 12, isFocus(i) ? 1 : 0.6);
    }));

    // words: the heat key first, then the states, then the isotherms, each kept clear of what is already placed
    const lab = placer(pv, c);
    if (P.heat && (P.legend === true || (P.legend === 'auto' && !small))) {
      const kinds = new Set(paths.flatMap((p) => p.legs.map((L) => (L.kind === 'free' ? 'free' : heatOf(L)))));
      const items = [[1, 'bad', 'heat in'], [-1, 'accent', 'heat out'], [0, 'violet', 'no heat']].filter(([k]) => kinds.has(k));
      let y = pv.T + 10, wmax = 0;
      const xr = pv.R - 8;
      for (const [, col, text] of items) {
        const w = rich(ctx, c, text, 0, 0, { size: fs - 1, measure: true });
        wmax = Math.max(wmax, w);
        rich(ctx, c, text, xr, y, { color: 'ink2', size: fs - 1, align: 'right' });
        ctx.save(); ctx.strokeStyle = c[col]; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(xr - w - 24, y); ctx.lineTo(xr - w - 6, y); ctx.stroke(); ctx.restore();
        y += fs + 5;
      }
      if (items.length) lab.reserve({ x0: xr - wmax - 26, y0: pv.T, x1: pv.R, y1: y - fs / 2 });
    }
    if (P.note) { const w = rich(ctx, c, P.note, pv.L + 8, pv.T + 10, { color: 'ink2', size: fs }); lab.reserve({ x0: pv.L, y0: pv.T, x1: pv.L + 10 + w, y1: pv.T + 18 }); }
    drawStates(pv, m, (s) => [s.V / vf, s.P / pf], c, fs, lab);
    if (P.isoLabels) for (const T of Ts) {
      const pAt = (v) => (n * M.R * T) / (v * vf) / pf, vAt = (p) => (n * M.R * T) / (p * pf) / vf;
      const tries = [];
      const pr = pAt(pv.vx1);
      if (pr > pv.vy0 + 0.02 * (pv.vy1 - pv.vy0)) tries.push([pv.X(pv.vx1) - 4, pv.Y(pr), -10, 'right'], [pv.X(pv.vx1) - 4, pv.Y(pr), 10, 'right']);
      const vt = vAt(pv.vy1);
      if (vt > pv.vx0 && vt < pv.vx1) tries.push([pv.X(vt) + 6, pv.Y(pv.vy1) + 9, 0, 'left']);
      const ylow = pv.vy0 + 0.06 * (pv.vy1 - pv.vy0), vl = vAt(ylow);
      if (vl > pv.vx0 && vl < pv.vx1) tries.push([pv.X(vl) + 4, pv.Y(ylow), -9, 'left']);
      const v1 = vAt(pv.vy0 + 0.5 * (pv.vy1 - pv.vy0));
      if (v1 > pv.vx0 && v1 < pv.vx1) tries.push([pv.X(v1) + 6, pv.Y(pv.vy0 + 0.5 * (pv.vy1 - pv.vy0)), 0, 'left']);
      lab.text(`${trim(T, 4)} K`, tries.map(([x, y, dy, al]) => ({ x, y: y + dy, align: al })), { color: 'ink3', size: fs - 1 });
    }
    if (P.areaLabel && areaAt.length) rich(ctx, c, P.areaLabel, pv.X(areaAt[0][0]), pv.Y(areaAt[0][1]), { color: 'ink', size: fs + 0.5, weight: 650, align: 'center' });
    pv.drawHandles();

    // the temperature–entropy diagram
    if (tsp) {
      // entropy's zero is arbitrary: put it a little left of the lowest entropy drawn, so the T axis sits at the left edge
      const ref = paths[0].legs[0].A;
      let smin = Infinity, smax = -Infinity, tmax = 0;
      samp.flat(2).forEach((s) => { const S = M.entropy(s, ref, n, g); smin = Math.min(smin, S); smax = Math.max(smax, S); tmax = Math.max(tmax, s.T); });
      const span = Math.max(smax - smin, 0.2 * n * M.R), zero = smin - 0.15 * span - (span - (smax - smin)) / 2;
      const Sof = (s) => M.entropy(s, ref, n, g) - zero;
      const Ssamp = samp.map((sp) => sp.map((pts) => pts.map((s) => ({ S: Sof(s), T: s.T }))));
      tsp.setView([0, 1.3 * span], [0, nice(1.15 * tmax)]);
      tsp.resize(); tsp.refreshTheme(); tsp.grid(); tsp.axes();
      for (const T of Ts) tsp.line(tsp.vx0, T, tsp.vx1, T, { color: 'ink3', width: 1.1, dash: [5, 5] });
      for (const s of adi) { const S = Sof(s); tsp.line(S, tsp.vy0, S, tsp.vy1, { color: 'violet', width: 1.1, dash: [2, 4] }); }
      if (P.shade) paths.forEach((p, i) => {
        if (!isFocus(i)) return;
        if (p.closed) tsp.path(Ssamp[i].flat().map((q) => [q.S, q.T]), { close: true, fill: 'gold', fillAlpha: 0.26, stroke: false });
        else p.legs.forEach((L, k) => {
          if (L.kind === 'free' || Math.abs(L.dS) < 1e-12) return;
          const pts = Ssamp[i][k].map((q) => [q.S, q.T]);
          tsp.path([...pts, [pts[pts.length - 1][0], 0], [pts[0][0], 0]], { close: true, fill: L.Q >= 0 ? 'bad' : 'accent', fillAlpha: 0.18, stroke: false });
        });
      });
      paths.forEach((p, i) => p.legs.forEach((L, k) => {
        const pts = Ssamp[i][k].map((q) => [q.S, q.T]);
        const col = legColor(L, p);
        if (L.kind === 'free') tsp.path(pts, { color: col, width: 1.8, dash: [3, 5] });
        else tsp.path(pts, { color: col, width: isFocus(i) ? 2.8 : 1.8, alpha: isFocus(i) ? 1 : 0.55 });
        if (P.arrows && L.kind !== 'free') arrowOn(tsp, pts, col, small ? 10 : 12, isFocus(i) ? 1 : 0.6);
      }));
      const tl = placer(tsp, c);
      const head = P.shade ? (paths.some((p) => p.closed) ? 'area inside = net work' : 'area under the path = heat Q') : 'reversible paths only';
      const hw = rich(ctx, c, head, tsp.L + 8, tsp.T + 10, { color: 'ink2', size: fs - 1 });
      tl.reserve({ x0: tsp.L, y0: tsp.T, x1: tsp.L + 12 + hw, y1: tsp.T + 20 });
      drawStates(tsp, m, (s) => [Sof(s), s.T], c, fs, tl);
    }

    // numbers
    readout(readoutRows(m));
  }

  /** Temperatures of the reference isotherms: through the states of an open path; a cycle's lowest and highest. */
  function isothermList(m, samp) {
    if (P.isotherms === false) return [];
    if (Array.isArray(P.isotherms)) return P.isotherms;
    const out = [];
    const add = (T) => { if (!out.some((u) => Math.abs(u - T) < 1e-3 * T)) out.push(T); };
    m.paths.forEach((p, i) => {
      if (p.closed) { const Ts = samp[i].flat().map((s) => s.T); add(Math.min(...Ts)); add(Math.max(...Ts)); }
      else for (const L of p.legs) { add(L.A.T); add(L.B.T); }
    });
    return out;
  }
  function adiabatStates(m) {
    if (!P.adiabats) return [];
    if (Array.isArray(P.adiabats)) return P.adiabats.map((k) => m.named[k]).filter(Boolean);
    const out = [], g = m.g;
    for (const p of m.paths) for (const L of p.legs) for (const s of [L.A, L.B]) if (!out.some((q) => Math.abs(q.P * q.V ** g - s.P * s.V ** g) < 1e-3 * s.P * s.V ** g)) out.push(s);
    return out;
  }

  function drawStates(plot, m, xy, c, fs, lab) {
    const all = [];
    m.paths.forEach((p) => p.legs.forEach((L, k) => { if (k === 0) all.push([L.A, p.names[0]]); all.push([L.B, p.names[k + 1]]); }));
    const pts = all.map(([s]) => xy(s).map(Number));
    // labels push away from the middle of everything drawn
    const cx = pts.reduce((a, q) => a + plot.X(q[0]), 0) / pts.length, cy = pts.reduce((a, q) => a + plot.Y(q[1]), 0) / pts.length;
    const seen = new Set(), todo = [];
    all.forEach(([s, name], i) => {
      const key = `${trim(s.P, 6)}|${trim(s.V, 6)}`;
      if (seen.has(key)) return;
      seen.add(key);
      const [x, y] = pts[i];
      // in process mode the end is the drag handle (on the PV diagram), not a dot
      if (!(P.mode === 'process' && name === '2' && P.drag && plot === pv)) plot.point(x, y, { color: 'ink', r: compact ? 3.5 : 4.5 });
      lab.reserve({ x0: plot.X(x) - 6, y0: plot.Y(y) - 6, x1: plot.X(x) + 6, y1: plot.Y(y) + 6 });
      todo.push([s, name, x, y]);
    });
    if (!P.stateLabels) return;
    for (const [s, name, x, y] of todo) {
      const spec = (P.mode === 'paths' && name && P.states[name]) || {};
      let text = spec.label ?? name ?? '';
      if (P.stateT && text !== '') text += ` · ${trim(s.T, 3)} K`;
      if (!text) continue;
      const sx = plot.X(x), sy = plot.Y(y);
      const tries = [];
      if (spec.dx !== undefined || spec.dy !== undefined) tries.push([spec.dx ?? 0, spec.dy ?? 0]);
      let ux = sx - cx, uy = sy - cy;
      const len = Math.hypot(ux, uy);
      if (len < 1 || todo.length < 2) { ux = 0.6; uy = -0.8; } else { ux /= len; uy /= len; }
      for (const a of [0, 0.7, -0.7, 1.4, -1.4, Math.PI]) {
        const ca = Math.cos(a), sa = Math.sin(a);
        tries.push([13 * (ux * ca - uy * sa), 13 * (ux * sa + uy * ca)]);
      }
      tries.push([0, -15], [0, 15], [12, 0], [-12, 0]);
      lab.text(text, tries.map(([dx, dy]) => ({ x: sx + dx, y: sy + dy, align: dx < -3 ? 'right' : dx > 3 ? 'left' : 'center' })), { color: 'ink', size: fs, weight: 650 });
    }
  }

  /** Words on a plot, each at the first of its candidate places that is inside the frame and clear of the others. */
  function placer(plot, c) {
    const boxes = [];
    const hit = (b) => boxes.some((q) => !(b.x1 < q.x0 || b.x0 > q.x1 || b.y1 < q.y0 || b.y0 > q.y1));
    return {
      reserve(b) { boxes.push(b); },
      text(s, tries, o) {
        const w = rich(ctx, c, s, 0, 0, { ...o, measure: true }), h = (o.size || 12.5) + 2;
        const boxOf = (t) => { const x0 = t.align === 'left' ? t.x : t.align === 'right' ? t.x - w : t.x - w / 2; return { x0, y0: t.y - h / 2, x1: x0 + w, y1: t.y + h / 2 }; };
        const inside = (b) => b.x0 >= plot.L + 2 && b.x1 <= plot.R - 2 && b.y0 >= plot.T - 2 && b.y1 <= plot.B + 2;
        let pick = tries.find((t) => { const b = boxOf(t); return inside(b) && !hit(b); }) || tries.find((t) => inside(boxOf(t))) || tries[0];
        if (!pick) return;
        boxes.push(boxOf(pick));
        rich(ctx, c, s, pick.x, pick.y, { ...o, align: pick.align });
      },
    };
  }

  function readoutRows(m) {
    const keys = P.readouts ?? (controls.length ? (P.mode === 'cycle' ? ['Qh', 'Qc', 'Wnet', 'e', 'carnot'] : ['W', 'Q', 'dU']) : []);
    if (!keys.length) return [];
    const p = m.focus === 'all' ? m.paths[0] : m.paths[m.focus];
    const A = M.analyse(p.legs, m.n, m.g);
    const fridge = p.closed && A.W < 0;
    const rows = [];
    for (const k of keys) {
      if (k === 'W') rows.push(['work by the gas $W$', eTeX(A.W)]);
      else if (k === 'Q') rows.push(['heat into the gas $Q$', eTeX(A.Q)]);
      else if (k === 'dU') rows.push(['$\\Delta E_\\text{int}$', eTeX(A.dU)]);
      else if (k === 'dS') rows.push(['entropy change $\\Delta S$', Math.abs(A.dS) < 1e-12 ? '0' : `${trim(A.dS)}\\,\\mathrm{J/K}`]);
      else if (k === 'Qh') rows.push([fridge ? 'heat out, hot side $Q_h$' : 'heat in $Q_h$', eTeX(fridge ? A.Qout : A.Qin)]);
      else if (k === 'Qc') rows.push([fridge ? 'heat in, cold side $Q_c$' : 'heat out $Q_c$', eTeX(fridge ? A.Qin : A.Qout)]);
      else if (k === 'Wnet') rows.push([fridge ? 'net work done on the gas' : 'net work $W$', eTeX(Math.abs(A.W))]);
      else if (k === 'e') rows.push(['efficiency $e = W/Q_h$', A.e !== undefined ? `${(100 * A.e).toFixed(1)}\\,\\%` : '\\text{—}']);
      else if (k === 'carnot') rows.push(['Carnot limit $1 - T_\\text{min}/T_\\text{max}$', p.closed ? `${(100 * A.carnot).toFixed(1)}\\,\\%` : '\\text{—}']);
      else if (k === 'COP') rows.push(['cooling COP $Q_c/|W|$', A.copRef !== undefined ? trim(A.copRef) : '\\text{—}']);
      else if (k === 'COPhp') rows.push(['heating COP $Q_h/|W|$', A.copHP !== undefined ? trim(A.copHP) : '\\text{—}']);
      else if (k === 'bwr') {
        const ad = p.legs.filter((L) => L.kind === 'adiabatic');
        const wc = ad.filter((L) => L.W < 0).reduce((s, L) => s - L.W, 0), wt = ad.filter((L) => L.W > 0).reduce((s, L) => s + L.W, 0);
        rows.push(['back-work ratio $W_\\text{comp}/W_\\text{turb}$', wt > 0 ? `${(100 * wc / wt).toFixed(0)}\\,\\%` : '\\text{—}']);
      } else if (k === 'legs') {
        p.legs.forEach((L, i) => rows.push([`${p.names[i] ?? ''}→${p.names[i + 1] ?? ''} ${LEG_NAME[L.kind]}`, `Q = ${eTeX(L.Q)},\\; W = ${eTeX(L.W)},\\; \\Delta E_\\text{int} = ${eTeX(L.dU)}`]));
      } else if (/^[TPV]./.test(k)) {
        const s = m.named[k.slice(1)];
        if (!s) continue;
        const q = k[0];
        rows.push([`$${q}_{${k.slice(1)}}$`, q === 'T' ? `${trim(s.T, 4)}\\,\\mathrm{K}` : q === 'P' ? `${trim(s.P / pf)}\\,\\mathrm{${pname}}` : `${trim(s.V / vf)}\\,\\mathrm{${vname.replace('³', '^3')}}`]);
      }
    }
    return rows;
  }
  function readout(rows) { F.readout(rows); }

  // ── the energy-flow diagram ────────────────────────────────────────────────
  function drawFlow(c) {
    const W0 = canvas.clientWidth || 600;
    const want = W0 < 480 ? '4 / 3' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const fs = compact || W < 420 ? 11.5 : 13;
    const engine = P.device === 'engine';
    const lab = { hot: 'hot reservoir', cold: 'cold reservoir', device: engine ? 'engine' : P.device === 'fridge' ? 'refrigerator' : 'heat pump', Qh: 'Q_h', Qc: 'Q_c', W: 'W', ...P.labels };
    const cx = Math.round(W * 0.38), cy = Math.round(H * 0.5);
    const rad = Math.max(Math.min(H * 0.13, W * 0.09), rich(ctx, c, lab.device, 0, 0, { size: fs, weight: 650, measure: true }) / 2 + 9);
    const bw = Math.min(W * 0.62, 420), bh = Math.max(26, H * 0.15);
    const hotY = H * 0.04, coldY = H * 0.96 - bh;
    const roundRect = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    const box2 = (y, col, text) => {
      ctx.save(); roundRect(cx - bw / 2, y, bw, bh, 8); ctx.globalAlpha = 0.16; ctx.fillStyle = c[col]; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = c[col]; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
      rich(ctx, c, text, cx, y + bh / 2, { color: 'ink', size: fs, weight: 600, align: 'center', halo: false });
    };
    box2(hotY, 'bad', lab.hot);
    box2(coldY, 'accent', lab.cold);
    const top = Math.max(P.Qh, P.Qc, P.W) || 1, wmax = Math.min(W * 0.1, H * 0.16);
    const width = (e) => Math.max(3, (wmax * e) / top);
    // a thick arrow from (x0, y0) to (x1, y1)
    const band = (x0, y0, x1, y1, w, col) => {
      const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux;
      const hw = Math.max(w * 0.95 + 5, 9), hl = Math.min(L * 0.45, Math.max(12, w * 0.8));
      const bx = x1 - ux * hl, by = y1 - uy * hl;
      ctx.save(); ctx.fillStyle = c[col]; ctx.globalAlpha = 0.85; ctx.beginPath();
      ctx.moveTo(x0 + (nx * w) / 2, y0 + (ny * w) / 2); ctx.lineTo(bx + (nx * w) / 2, by + (ny * w) / 2); ctx.lineTo(bx + nx * hw, by + ny * hw);
      ctx.lineTo(x1, y1); ctx.lineTo(bx - nx * hw, by - ny * hw); ctx.lineTo(bx - (nx * w) / 2, by - (ny * w) / 2); ctx.lineTo(x0 - (nx * w) / 2, y0 - (ny * w) / 2);
      ctx.closePath(); ctx.fill(); ctx.restore();
    };
    const yHotB = hotY + bh + 3, yTop = cy - rad - 3, yBot = cy + rad + 3, yColdT = coldY - 3;
    if (engine) { band(cx, yHotB, cx, yTop, width(P.Qh), 'bad'); band(cx, yBot, cx, yColdT, width(P.Qc), 'accent'); band(cx + rad + 3, cy, W * 0.86, cy, width(P.W), 'gold'); }
    else { band(cx, yTop, cx, yHotB, width(P.Qh), 'bad'); band(cx, yColdT, cx, yBot, width(P.Qc), 'accent'); band(W * 0.86, cy, cx + rad + 3, cy, width(P.W), 'gold'); }
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.fillStyle = c.panel; ctx.fill(); ctx.strokeStyle = c.ink2; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    rich(ctx, c, lab.device, cx, cy, { color: 'ink', size: fs, weight: 650, align: 'center', halo: false });
    const off = (e) => Math.max(width(e) * 0.95 + 5, 9) + 8;      // clear of the arrowhead
    rich(ctx, c, lab.Qh, cx + Math.max(off(P.Qh), 14), (yHotB + yTop) / 2, { color: 'bad', size: fs + 0.5, weight: 650 });
    rich(ctx, c, lab.Qc, cx + Math.max(off(P.Qc), 14), (yBot + yColdT) / 2, { color: 'accent', size: fs + 0.5, weight: 650 });
    rich(ctx, c, lab.W, (cx + rad + W * 0.86) / 2, cy - width(P.W) / 2 - 16, { color: 'gold', size: fs + 0.5, weight: 650, align: 'center' });
    F.readout([]);
  }

  F.draw(draw);
  F.caption(P.mode === 'flow'
    ? 'Arrow widths are drawn to scale with the energy each carries per cycle. Energy is conserved: what goes into the device comes out of it.'
    : P.mode === 'cycle'
      ? `An ideal gas going round quasi-statically, with constant heat capacities (γ = ${trim(M.gammaOf(P.gas), 3)}). Shaded: the net work per cycle, the area inside. Red legs take heat in, blue legs give it out. Real engines are open, fast and leaky: they fall well short of these ideal efficiencies.`
      : `An ideal gas with constant heat capacities (γ = ${trim(M.gammaOf(P.gas), 3)}). Every process is quasi-static — slow enough that the gas passes through equilibrium states, so it has a path to draw. Shaded: the work done by the gas, the area under the path (green when the gas expands, orange when it is compressed).`);
  return { get: (k) => F.params[k] };
}

/** An arrowhead halfway along a polyline of world points. */
function arrowOn(plot, pts, col, size, alpha) {
  if (pts.length < 2) return;
  // halfway by screen length, so the arrow sits mid-leg however the curve is spaced
  const scr = pts.map(([x, y]) => [plot.X(x), plot.Y(y)]);
  const seg = [];
  let total = 0;
  for (let i = 1; i < scr.length; i++) { const d = Math.hypot(scr[i][0] - scr[i - 1][0], scr[i][1] - scr[i - 1][1]); seg.push(d); total += d; }
  if (total < 3 * size) return;
  let acc = 0, i = 0;
  while (i < seg.length - 1 && acc + seg[i] < total / 2) acc += seg[i++];
  const f = seg[i] ? (total / 2 - acc) / seg[i] : 0;
  const x = scr[i][0] + f * (scr[i + 1][0] - scr[i][0]), y = scr[i][1] + f * (scr[i + 1][1] - scr[i][1]);
  const ux = (scr[i + 1][0] - scr[i][0]) / (seg[i] || 1), uy = (scr[i + 1][1] - scr[i][1]) / (seg[i] || 1);
  const g = plot.ctx;
  g.save(); g.globalAlpha = alpha; g.beginPath();
  g.moveTo(x + ux * size * 0.7, y + uy * size * 0.7);
  g.lineTo(x - ux * size * 0.6 - uy * size * 0.5, y - uy * size * 0.6 + ux * size * 0.5);
  g.lineTo(x - ux * size * 0.6 + uy * size * 0.5, y - uy * size * 0.6 - ux * size * 0.5);
  g.closePath();
  g.lineWidth = 2; g.strokeStyle = plot.col.bg; g.stroke();     // a thin outline of the background, so it reads on its own line
  g.fillStyle = plot.color(col); g.fill(); g.restore();
}

/** The average of a polygon's vertices (good enough to place a label). */
function centroid(pts) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const cr = x0 * y1 - x1 * y0;
    a += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr;
  }
  if (Math.abs(a) < 1e-12) return pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]);
  return [cx / (3 * a), cy / (3 * a)];
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  const bad = (m) => problems.push(m);
  if (!MODES.includes(P.mode)) { bad(`mode must be one of ${MODES.join(', ')}`); return problems; }
  const okGas = (k) => (typeof k === 'number' ? k > 1 && k < 2 : !!M.GASES[k]);
  if (!okGas(P.gas)) bad(`unknown gas “${P.gas}” (use ${Object.keys(M.GASES).join(', ')}, or γ as a number)`);
  if (P.gases && (!Array.isArray(P.gases) || !P.gases.every(okGas) || !P.gases.includes(P.gas))) bad('gases must be a list of known gases that includes gas');
  if (!VUNITS[P.vunit]) bad(`vunit must be one of ${Object.keys(VUNITS).join(', ')}`);
  if (!PUNITS[P.punit]) bad(`punit must be one of ${Object.keys(PUNITS).join(', ')}`);
  for (const k of ['vrange', 'prange']) if (P[k] !== null && !(Array.isArray(P[k]) && P[k].length === 2 && P[k][0] < P[k][1] && P[k][0] >= 0)) bad(`${k} must be [min, max] with 0 ≤ min < max`);
  const controls = P.controls === true ? allControls(P) : P.controls;
  if (!Array.isArray(controls) || !controls.every((k) => CONTROLS.includes(k))) bad(`controls must be true or a list of ${CONTROLS.join(', ')}`);
  for (const [k, r] of Object.entries(P.ranges || {})) if (!(Array.isArray(r) && r.length >= 2 && r[0] < r[1] && (r[2] === undefined || r[2] > 0))) bad(`ranges.${k} must be [min, max, step]`);
  if (P.readouts !== null && !(Array.isArray(P.readouts) && P.readouts.every((k) => READOUTS.includes(k) || /^[TPV]./.test(k)))) bad(`readouts must be a list of ${READOUTS.join(', ')} or T/P/V followed by a state name`);
  if (P.isotherms !== false && P.isotherms !== 'auto' && !(Array.isArray(P.isotherms) && P.isotherms.every((T) => T > 0))) bad('isotherms must be auto, false or a list of temperatures (K)');
  if (P.mode === 'flow') {
    if (!DEVICES.includes(P.device)) bad(`device must be one of ${DEVICES.join(', ')}`);
    if (![P.Qh, P.Qc, P.W].every((e) => typeof e === 'number' && e >= 0)) bad('Qh, Qc and W must be numbers ≥ 0');
    else if (Math.abs(P.Qh - P.Qc - P.W) > 0.01 * Math.max(P.Qh, P.Qc, P.W)) bad(`energy does not balance: Qh = Qc + W is needed (${P.Qh} ≠ ${P.Qc} + ${P.W})`);
    return problems;
  }
  if (!(P.n > 0)) bad('n must be positive');
  if (problems.length) return problems;
  const g = M.gammaOf(P.gas), vf = VUNITS[P.vunit][0], pf = PUNITS[P.punit][0];
  const toSI = (s) => { const o = {}; if (s.P !== undefined) o.P = s.P * pf; if (s.V !== undefined) o.V = s.V * vf; if (s.T !== undefined) o.T = s.T; return o; };
  const sliderOK = (key, value, def) => { const r = P.ranges?.[key] || def; if (r && controls.includes(key) && !(value >= r[0] && value <= r[1])) bad(`${key} = ${value} lies outside its slider range [${r[0]}, ${r[1]}]`); };
  try {
    if (P.mode === 'process') {
      if (!PROCESSES.includes(P.process)) bad(`process must be one of ${PROCESSES.join(', ')}`);
      if (P.processes && !(Array.isArray(P.processes) && P.processes.every((k) => PROCESSES.includes(k)) && P.processes.includes(P.process))) bad('processes must be a list of processes that includes process');
      const A = M.state(toSI(P.start), P.n);
      const B = P.process === 'line' ? M.state(toSI(P.end), P.n) : M.reach(P.process, A, toSI(P.end), P.n, g);
      if (Math.abs(B.V / A.V - 1) < 1e-9 && Math.abs(B.P / A.P - 1) < 1e-9) bad('the process must end somewhere other than where it starts');
    } else if (P.mode === 'paths') {
      if (!P.states || typeof P.states !== 'object' || !Object.keys(P.states).length) bad('paths mode needs states');
      if (!Array.isArray(P.paths) || !P.paths.length) bad('paths mode needs at least one path');
      if (problems.length) return problems;
      const named = {};
      for (const [k, s] of Object.entries(P.states)) named[k] = M.state(toSI(s), P.n);
      P.paths.forEach((p, i) => {
        if (!named[p.from]) { bad(`path ${i + 1} starts at an unknown state “${p.from}”`); return; }
        let A = named[p.from];
        for (const lg of p.legs || []) {
          const [kind, to] = lg;
          if (!M.KINDS.includes(kind)) { bad(`path ${i + 1}: unknown process “${kind}”`); return; }
          let B;
          if (typeof to === 'string') {
            B = named[to];
            if (!B) { bad(`path ${i + 1}: unknown state “${to}”`); return; }
            if (!M.onProcess(kind, A, B, g)) bad(`path ${i + 1}: ${to} does not lie on the ${kind} process through the previous state`);
          } else B = M.reach(kind, A, toSI(to), P.n, g);
          A = B;
        }
        if (!(p.legs || []).length) bad(`path ${i + 1} has no legs`);
      });
      if (P.show !== 'all' && !(Number.isInteger(P.show) && P.show >= 0 && P.show < P.paths.length)) bad('show must be a path index or “all”');
    } else if (P.mode === 'cycle') {
      if (!CYCLES.includes(P.cycle)) bad(`cycle must be one of ${CYCLES.join(', ')}`);
      if (P.cycles && !(Array.isArray(P.cycles) && P.cycles.every((k) => CYCLES.includes(k)) && P.cycles.includes(P.cycle))) bad('cycles must be a list of cycles that includes cycle');
      for (const k of ['Th', 'Tc', 'ratio', 'r', 'rp', 'T1', 'T3']) sliderOK(k, P[k], RANGE[k]);
      if (P.cycle === 'carnot' && !(P.Th > P.Tc && P.Tc > 0 && P.ratio > 1 && P.VA > 0)) bad('carnot needs Th > Tc > 0, ratio > 1 and VA > 0');
      if (P.cycle === 'otto' && !(P.r > 1 && P.T1 > 0 && P.P1 > 0 && P.V1 > 0 && P.T3 > 0)) bad('otto needs r > 1 and positive T1, P1, V1, T3');
      if (P.cycle === 'brayton' && !(P.rp > 1 && P.T1 > 0 && P.P1 > 0 && P.T3 > 0)) bad('brayton needs rp > 1 and positive T1, P1, T3');
      if (P.cycle === 'rect' && !(P.V1 > 0 && P.V2 > 0 && P.P1 > 0 && P.P2 > 0 && P.V1 !== P.V2 && P.P1 !== P.P2)) bad('rect needs two different volumes and two different pressures');
    }
  } catch (e) { bad(e.message); }
  return problems;
}
