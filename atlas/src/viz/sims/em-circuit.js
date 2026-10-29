// DC circuits and RC transients as live schematics. A fixed layout (series,
// parallel, combination, ladder, Wheatstone bridge, two-loop, RC or a
// capacitor-discharge firing circuit) is solved by nodal analysis in
// model/em-circuit.js (tested headlessly in test/em-circuit.test.mjs) and
// drawn with: charges flowing along every wire at a speed that follows the
// current (the same everywhere in a series loop: current is not used up),
// wires coloured by their potential, bulbs glowing with their power, charge
// piling up on capacitor plates, and — for circuits with capacitors — a live
// V(t) graph with the time constant marked.
//
//   { type: 'em-circuit', params: {
//       circuit: 'series',                 // single series parallel combo ladder bridge twoloop rc firing
//       opts: { n: 3, lamp: true },        // layout options (see preset() in the model): n, sw, amm, volt, lamp,
//                                          //   wire, line, bsw, det ('volt'|'galv'), flip, net ('single'|'series'|'parallel'|'combo')
//       values: { E: 12, R1: 4 },          // element values in SI (Ω, V, F), over the layout's defaults
//       sliders: ['E', 'R1'],              // a slider per value key — or { key, min, max, step, unit: 'kΩ'|'µF'|…, label, explain }
//       switches: { S: false },            // starting switch states; rc: { mode: 'charge'|'discharge' }
//       controls: true,                    // switch controls (default: on unless compact); or a list of switch ids
//       show: { names, values, I, drop, V, P },   // what is printed on the schematic
//       hide: ['R2'],                      // values printed as “?” (what a question asks for)
//       names: { R1: 'igniter' },          // canvas labels (plain text)
//       flow: true,                        // moving charges (default: on unless compact)
//       carriers: 'conventional',          // or 'electrons'; carrierToggle: true offers the switch
//       potential: true,                   // wires coloured by potential (default: on unless compact)
//       graph: true,                       // capacitor circuits: V(t) below the schematic; 'static' draws a finished curve
//       t: null, v0: {},                   // a still picture t seconds after the switch moved; starting capacitor voltages
//       loop: null, loopChoice: false,     // twoloop: trace 'left' | 'right' | 'outer' and sum the potential changes
//       junction: false,                   // the junction rule at the layout's junction
//       arrows: { R1: ['I₁', 1] },         // assumed current directions (label, +1 along the element, −1 against)
//       wire: { material: 'nichrome', L: 1, d: 0.5e-3, controls: true },   // single: R₁ is a wire, R = ρL/A
//       energy: false,                     // rc/firing: battery work, stored and dissipated energy in the readout
//       readout: null, speed: 1.6,         // readout bar (default: on unless compact); seconds of animation per τ
//   } }

import { Plot, themeColors } from '../plot.js';
import * as M from '../model/em-circuit.js';

export const defaults = {
  circuit: 'series', opts: {}, values: {}, sliders: [], switches: {}, controls: null, show: null, hide: [], names: {},
  flow: null, carriers: 'conventional', carrierToggle: false, potential: null, graph: null, t: null, v0: {},
  loop: null, loopChoice: false, junction: false, arrows: null, wire: null, energy: false, readout: null, speed: 1.6,
  glow: true, netChoice: false, mark: true,
};

const OPT_KEYS = ['n', 'sw', 'amm', 'volt', 'lamp', 'wire', 'line', 'lineName', 'bsw', 'det', 'flip', 'net', 'nc'];
const MATERIAL_KEYS = Object.keys(M.MATERIALS);

// ─── numbers for canvas labels (plain text) and readouts (TeX) ─────────────
const PREFIX = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
function scaleOf(x, unit) {
  const a = Math.abs(x);
  if (unit === 'F') return a >= 1 ? [1, ''] : a >= 0.0099995 ? [1e-3, 'm'] : a >= 0.9995e-6 ? [1e-6, 'µ'] : a >= 0.9995e-9 ? [1e-9, 'n'] : [1e-12, 'p'];
  if ((a >= 0.0995 || (unit === 'Ω' && a >= 0.001)) && a < 1) return [1, ''];      // 0.50 A, 0.05 Ω
  return PREFIX.find(([f]) => a >= f * 0.9995) || PREFIX[PREFIX.length - 1];
}
const trimNum = (v, n) => String(+v.toPrecision(n));
/** A measured value: 3 significant figures, zeros kept (0.500 A). */
export function eng(x, unit, n = 3) {
  if (!Number.isFinite(x)) return '—';
  if (Math.abs(x) < 1e-15) return `0 ${unit}`;
  const [f, p] = scaleOf(x, unit);
  let s = (x / f).toPrecision(n);
  if (/e/.test(s)) s = String(+s);
  return `${s} ${p}${unit}`;
}
/** A given value: as short as it can be (4.7 kΩ, 100 µF, 12 V). */
export function given(x, unit) {
  if (Math.abs(x) < 1e-15) return `0 ${unit}`;
  const [f, p] = scaleOf(x, unit);
  return `${trimNum(x / f, 4)} ${p}${unit}`;
}
const texUnit = (s) => s.replace(/ ([GMkmµnp]?)(Ω|A|V|W|F|J|C|s)$/, (m, p, u) => `\\,\\mathrm{${p === 'µ' ? '\\mu ' : p}${u === 'Ω' ? '\\Omega' : u}}`);
const texEng = (x, unit, n) => texUnit(eng(x, unit, n));

const UNIT = { R: 'Ω', L: 'Ω', G: 'Ω', C: 'F' };
const SLIDER_UNITS = { 'Ω': 1, 'kΩ': 1e3, 'MΩ': 1e6, 'V': 1, 'kV': 1e3, 'F': 1, 'mF': 1e-3, 'µF': 1e-6, 'nF': 1e-9, 'pF': 1e-12 };
const texOfUnit = (u) => `\\mathrm{${u.replace('µ', '\\mu ').replace('Ω', '\\Omega')}}`;

/** TeX for a value key: R1 → R_1, Rc → R_\text{c}, E → \mathcal{E}, r2 → r_2. */
function texKey(k) {
  const m = /^([A-Za-z])(\w*)$/.exec(k);
  if (!m) return k;
  const base = m[1] === 'E' ? '\\mathcal{E}' : m[1];
  if (!m[2]) return base;
  return /^\d+$/.test(m[2]) ? `${base}_{${m[2]}}` : `${base}_\\text{${m[2]}}`;
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  let pre = M.preset(P.circuit, P.opts);
  let kindOf = Object.fromEntries(pre.elements.map((e) => [e.id, e]));
  const keyKind = {};
  for (const e of pre.elements) { if (e.kind === 'B') { keyKind[e.id] = 'emf'; keyKind[e.rKey] = 'r'; } else if (UNIT[e.kind]) keyKind[e.id] = e.kind === 'C' ? 'C' : 'R'; }
  const base = { ...pre.defaults, ...P.values };
  const show = { names: true, values: true, I: !compact, drop: false, V: !compact, P: false, ...(P.show || {}) };
  const flowOn = P.flow ?? !compact;
  const potOn = P.potential ?? !compact;
  const hasCaps = pre.elements.some((e) => e.kind === 'C');
  const graphMode = hasCaps ? (P.graph ?? (compact ? false : true)) : false;
  const wantReadout = P.readout ?? !compact;
  const still = P.t !== null && P.t !== undefined;

  // ── controls ──
  const sliderKeys = [];
  for (const s0 of P.sliders || []) {
    const s = typeof s0 === 'string' ? { key: s0 } : s0;
    const kk = keyKind[s.key];
    const v = base[s.key];
    const unit = s.unit || (kk === 'C' ? (v >= 0.01 ? 'mF' : v >= 0.9995e-6 ? 'µF' : v >= 0.9995e-9 ? 'nF' : 'pF') : kk === 'R' && v >= 1e4 ? 'kΩ' : kk === 'emf' ? 'V' : 'Ω');
    const f = SLIDER_UNITS[unit];
    const shown = v / f;
    const max = s.max ?? niceUp(kk === 'emf' ? Math.max(24, shown * 2) : kk === 'r' ? Math.max(2, shown * 3) : shown * 3);
    const min = s.min ?? (kk === 'emf' || kk === 'r' ? 0 : niceUp(max / 100));
    const step = s.step ?? niceUp((max - min) / 120);
    const label = s.label ?? ({ emf: `Battery emf $${texKey(s.key)}$`, r: `Internal resistance $${texKey(s.key)}$`, C: `Capacitance $${texKey(s.key)}$`, R: `Resistance $${texKey(s.key)}$` }[kk] || s.key);
    const explain = s.explain ?? ({
      emf: 'The energy the battery gives each coulomb that passes through it: 1 V = 1 J/C.',
      r: 'Resistance inside the battery itself: it wastes $I^2 r$ and lowers the voltage at the terminals as the current rises.',
      C: 'Charge stored per volt across the plates: $Q = CV$.',
      R: 'How hard it is to push current through: $V = IR$.',
    }[kk] || '');
    F.slider({ key: s.key, label, min, max, step, value: Math.min(max, Math.max(min, shown)), unit: texOfUnit(unit), explain, logScale: !!s.logScale });
    sliderKeys.push([s.key, f]);
  }
  // the wire option: R₁ = ρL/A from a material, a length and a diameter
  const W = P.wire && P.circuit === 'single' ? { material: 'nichrome', L: 1, d: 0.5e-3, controls: !compact, ...P.wire } : null;
  if (W && W.controls) {
    const list = W.materials || MATERIAL_KEYS;
    F.choice({ key: 'material', label: 'Material', options: list.map((m) => [m, M.MATERIALS[m].label]), value: W.material, explain: 'Resistivity $\\rho$ at 20 °C: ' + list.map((m) => `${M.MATERIALS[m].label} ${fmtRho(M.MATERIALS[m].rho)}`).join(', ') + ' Ω·m.' });
    F.slider({ key: 'L', label: 'Length $L$', min: 0.1, max: Math.max(5, W.L), step: 0.1, value: W.L, unit: '\\mathrm{m}', explain: 'Twice the length: twice the resistance.' });
    F.slider({ key: 'd', label: 'Diameter $d$', min: 0.1, max: Math.max(2, W.d * 1e3), step: 0.05, value: W.d * 1e3, unit: '\\mathrm{mm}', explain: 'Cross-section $A = \\pi d^2/4$: twice the diameter, a quarter of the resistance.' });
  }
  // switches
  const swState = {};
  const ctlList = P.controls === true || (P.controls === null && !compact) ? pre.switches : Array.isArray(P.controls) ? P.controls : [];
  for (const s of pre.switches) {
    if (s === 'mode') {
      swState.mode = P.switches.mode ?? 'charge';
      if (ctlList.includes('mode')) F.choice({ key: 'mode', label: 'Switch position', options: [['charge', 'Charge'], ['discharge', 'Discharge']], value: swState.mode, explain: 'Charge: the battery drives current through $R$ onto the capacitor. Discharge: the battery is cut out and the capacitor drives current back through $R$.' });
    } else {
      swState[s] = P.switches[s] ?? (P.circuit === 'firing' ? s === 'S1' : true);
      if (ctlList.includes(s)) {
        const lbl = P.circuit === 'firing' ? (s === 'S1' ? 'Arm switch closed (charging)' : 'Fire switch closed') : /^S\d$/.test(s) && P.circuit === 'parallel' ? `Branch ${s.slice(1)} switch closed` : 'Switch closed';
        F.toggle({ key: `sw_${s}`, label: lbl, value: swState[s], explain: P.circuit === 'firing' ? (s === 'S1' ? 'Connects the bus to the capacitor bank through the charging resistor.' : 'Connects the charged bank across the igniter’s bridgewire.') : '' });
      }
    }
  }
  if (P.netChoice && P.circuit === 'rc') F.choice({ key: 'net', label: 'Capacitors', options: [['series', 'in series'], ['parallel', 'in parallel']], value: P.opts.net === 'parallel' ? 'parallel' : 'series', explain: 'In parallel they share one voltage and their charges add. In series they carry equal charges and their voltages add.' });
  if (P.carrierToggle) F.choice({ key: 'carriers', label: 'Show the moving charges as', options: [['conventional', 'positive (conventional current)'], ['electrons', 'electrons']], value: P.carriers, explain: 'In a metal the movers are electrons, drifting against the current arrow. Conventional current pretends positive charges move the other way: the effect is the same.' });
  if (P.loopChoice && Object.keys(pre.loops).length) F.choice({ key: 'loop', label: 'Trace a loop', options: [['none', 'none'], ...Object.keys(pre.loops).map((k) => [k, k])], value: P.loop || 'none', explain: 'Walk round the loop adding each change in potential: up across a battery from − to +, down by $IR$ across a resistor in the direction of the current. The sum is always zero.' });

  // ── state ──
  const valuesNow = () => {
    const v = { ...base };
    for (const [k, f] of sliderKeys) if (F.params[k] !== undefined) v[k] = F.params[k] * f;
    if (W) v.R1 = M.wireR(M.MATERIALS[wireNow().material].rho, wireNow().L, wireNow().d);
    return v;
  };
  const wireNow = () => ({ material: F.params.material ?? W.material, L: F.params.L ?? W.L, d: F.params.d !== undefined ? F.params.d * 1e-3 : W.d });
  const swNow = () => {
    const s = { ...swState };
    if (F.params.mode !== undefined) s.mode = F.params.mode;
    for (const k of pre.switches) if (F.params[`sw_${k}`] !== undefined) s[k] = F.params[`sw_${k}`];
    return s;
  };
  const carriers = () => F.params.carriers ?? P.carriers;
  const loopNow = () => { const l = F.params.loop ?? P.loop; return l && l !== 'none' ? l : null; };

  // the running transient: a segment starts whenever a switch or value changes
  const S = { seg: null, running: !still, Iref: null, phase: {} };
  const capIds = pre.elements.filter((e) => e.kind === 'C').map((e) => e.id);
  const startV = (sw, vals) => {
    if (P.v0 && Object.keys(P.v0).length) return { ...P.v0 };
    // discharging starts from full: the voltages the charging circuit settles to
    if (P.circuit === 'rc' && sw.mode === 'discharge') return M.transient(M.circuitOf(pre, vals, { mode: 'charge' }), {}).final;
    if (P.circuit === 'firing' && sw.S2 && !sw.S1) return M.transient(M.circuitOf(pre, vals, { S1: true, S2: false }), {}).final;
    return Object.fromEntries(capIds.map((id) => [id, 0]));
  };
  function newSegment(v0) {
    const vals = valuesNow(), sw = swNow();
    let tr = null, err = null;
    try { tr = M.transient(M.circuitOf(pre, vals, sw), v0); } catch (e) { err = e.message; }
    S.seg = { tr, err, t: 0, vals, sw, v0: { ...v0 }, tau: tr && tr.tau.length ? tr.tau[0] : 0 };
    if (tr && S.Iref === null) {
      const st = tr.state(0);
      S.Iref = Math.max(1e-12, ...pre.elements.filter((e) => e.kind !== 'V').map((e) => Math.abs(st.I[e.id])));
      if (S.Iref <= 1e-12) S.Iref = Math.max(...pre.elements.filter((e) => e.kind === 'B').map((e) => vals[e.id])) / Math.max(1, ...pre.elements.filter((e) => UNIT[e.kind] === 'Ω').map((e) => vals[e.id]));
    }
  }
  const restart = () => { newSegment(startV(swNow(), valuesNow())); if (still) S.seg.t = P.t; };
  restart();
  // a lamp's full brightness: the power it would take alone across the largest emf
  // a bulb's full brightness, fixed at the start so the glow follows the power as values change:
  // the power it would take alone across the largest emf, or the most a battery with internal
  // resistance r could deliver to any load, ℰ²/4r, if that is more
  const LREF = (() => {
    const v = valuesNow(), bats = pre.elements.filter((e) => e.kind === 'B');
    const Emax = Math.max(...bats.map((e) => Math.abs(v[e.id]))), rs = bats.map((e) => v[e.rKey] || 0).filter((x) => x > 0);
    const lamps = pre.elements.filter((e) => e.kind === 'L');
    if (!lamps.length || !(Emax > 0)) return 1;
    return Math.max(...lamps.map((e) => (Emax * Emax) / v[e.id]), rs.length ? (Emax * Emax) / (4 * Math.min(...rs)) : 0);
  })();
  const lampRef = () => LREF;

  F.onChange((key) => {
    if (key === 'carriers' || key === 'loop') return draw();
    if (key === 'net') {
      pre = M.preset('rc', { ...P.opts, net: F.params.net });
      kindOf = Object.fromEntries(pre.elements.map((e) => [e.id, e]));
      sized = { w: 0, tries: 0 };
      restart(); S.running = true; draw();
      return;
    }
    const cur = S.seg && S.seg.tr ? S.seg.tr.vAt(S.seg.t) : startV(swNow(), valuesNow());
    if (key === 'mode' || /^sw_/.test(key)) newSegment(cur);
    else newSegment(hasCaps ? cur : {});
    S.running = true;
    draw();
  });

  // ── canvas ──
  const tall = hasCaps && graphMode;
  const { canvas, box } = F.canvas({ aspect: tall ? '' : 'wide', label: P.alt || `Circuit diagram: ${altOf(P.circuit)}` });
  const ctx = canvas.getContext('2d');
  const A = new Plot(canvas, { grid: false, axes: false, equal: true });
  const G = new Plot(canvas, { grid: true, axes: true, axesAt: 'edge' });

  // a click on a switch flips it
  canvas.addEventListener('click', (ev) => {
    const r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    for (const e of pre.elements) {
      if (e.kind !== 'S') continue;
      const [ax, ay] = pre.nodes[e.a], [bx, by] = pre.nodes[e.b];
      const cx = A.X((ax + bx) / 2), cy = A.Y((ay + by) / 2);
      if (Math.hypot(cx - x, cy - y) > 26) continue;
      if (e.spdt) { if (ctlList.includes('mode')) F.set('mode', swNow().mode === 'charge' ? 'discharge' : 'charge'); }
      else if (ctlList.includes(e.id)) F.set(`sw_${e.id}`, !swNow()[e.id]);
      return;
    }
  });

  // ── animation ──
  let anim = null;
  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const animated = flowOn || (hasCaps && graphMode && !still && graphMode !== 'static');
  if (animated) {
    let playing = !reduced();
    const step = (dt) => {
      if (!playing) return;
      const seg = S.seg;
      if (seg && seg.tr && hasCaps && !still && seg.tau > 0 && S.running) {
        seg.t = Math.min(seg.t + (dt * seg.tau) / P.speed, 6 * seg.tau);
        if (seg.t >= 6 * seg.tau) S.running = false;
      }
      if (flowOn) advanceFlow(dt);
      draw();
    };
    anim = F.animate(step);
    const btn = F.button({
      label: playing ? 'Pause' : 'Play',
      onClick: () => {
        playing = !playing;
        btn.textContent = playing ? 'Pause' : 'Play';
        anim.stop();
        if (playing) anim = F.animate(step, { force: true });
      },
    });
    if (hasCaps && !still) F.button({ label: 'Restart', onClick: () => { restart(); S.running = true; draw(); } });
  }

  function current() {
    const seg = S.seg;
    if (!seg || !seg.tr) return null;
    return seg.tr.state(seg.t);
  }

  // ─── charge flow ───
  // every element (or capacitor lead) is a path; dots sit at an even spacing along it
  // and slide at a speed proportional to its current
  const SP = 17;          // px between moving charges
  function advanceFlow(dt) {
    const st = current();
    if (!st) return;
    const k = 55 / (S.Iref || 1);
    const sgn = carriers() === 'electrons' ? -1 : 1;
    for (const e of pre.elements) {
      if (e.kind === 'V') continue;
      const v = Math.max(-260, Math.min(260, sgn * k * st.I[e.id]));
      S.phase[e.id] = ((S.phase[e.id] || 0) + v * dt) % 1e6;
    }
  }

  // ─── drawing ───
  let C = themeColors();
  const rgb = (c) => { const h = String(c).trim(); if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) return null; const s = h.length === 4 ? h.slice(1).split('').map((x) => x + x).join('') : h.slice(1); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); };
  const mix = (c1, c2, f) => { const a = rgb(c1), b = rgb(c2); if (!a || !b) return f < 0.5 ? c1 : c2; return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * f)).join(',')})`; };
  let Vlo = 0, Vhi = 1;
  const potColor = (V) => {
    if (!potOn) return C.ink2;
    const f = Math.max(0, Math.min(1, (V - Vlo) / (Vhi - Vlo || 1)));
    return f < 0.5 ? mix(C.accent, C.violet, f * 2) : mix(C.violet, C.bad, (f - 0.5) * 2);
  };

  // the canvas takes the height the schematic needs at the full width (plus the graph)
  let sized = { w: 0, tries: 0 };
  function fitHeight(Wd, Ht, want) {
    if (sized.w !== Wd) sized = { w: Wd, tries: 0 };
    if (Math.abs(want - Ht) <= 6 || sized.tries > 3) return true;
    sized.tries++;
    box.style.aspectRatio = `${Wd} / ${Math.round(want)}`;
    return false;
  }

  let FS = 12.5, LW = 2.6;
  function line(x0, y0, x1, y1, color, width = LW, dash = []) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
  function text(s, x, y, o = {}) {
    ctx.save();
    ctx.font = `${o.weight || 600} ${o.size || FS}px Inter, system-ui, sans-serif`;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1;
    ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y);
    ctx.restore();
  }

  // what is written beside each element: [name = value lines, reading lines]
  function labelLines(e, st, vals) {
    const name = P.names[e.id] ?? e.name;
    const l1 = [], l2 = [];
    const val = (key, unit) => (P.hide.includes(key) ? '?' : given(vals[key], unit));
    if (show.names && name) {
      const nm = e.kind === 'B' ? name.replace(/^E/, 'ℰ') : name;
      if (e.kind === 'B') l1.push(show.values ? `${nm} = ${val(e.id, 'V')}` : nm);
      else if (UNIT[e.kind] === 'Ω') l1.push(show.values ? `${nm} = ${val(e.id, 'Ω')}` : nm);
      else if (e.kind === 'C') l1.push(show.values ? `${nm} = ${val(e.id, 'F')}` : nm);
      else if (e.kind === 'S' || e.kind === 'A') l1.push(nm);
    }
    if (W && e.id === 'R1' && show.names) { const w = wireNow(); l1.push(`${M.MATERIALS[w.material].label}, L = ${trimNum(w.L, 3)} m`, `d = ${trimNum(w.d * 1e3, 3)} mm`); }
    if (e.kind === 'A') l2.push(P.hide.includes(e.id) ? '?' : eng(Math.abs(st.I[e.id]), 'A'));
    else if (e.kind !== 'S' && !(A.w < 520 && !compact)) {
      if (show.I) l2.push(P.hide.includes(`I:${e.id}`) ? 'I = ?' : `I = ${eng(Math.abs(st.I[e.id]), 'A')}`);
      if (show.drop && e.kind !== 'B') l2.push(P.hide.includes(`dV:${e.id}`) ? 'ΔV = ?' : `ΔV = ${eng(Math.abs(st.drop[e.id]), 'V')}`);
      if (show.P && e.kind !== 'C') l2.push(P.hide.includes(`P:${e.id}`) ? 'P = ?' : `P = ${eng(Math.abs(e.kind === 'B' ? vals[e.id] * st.I[e.id] : st.P[e.id]), 'W')}`);
      if (e.kind === 'C' && (show.drop || show.I)) l2.push(P.hide.includes(`Q:${e.id}`) ? 'Q = ?' : `Q = ${eng(Math.abs(vals[e.id] * st.drop[e.id]), 'C')}`);
    }
    return [l1, l2];
  }
  const labSide = (e) => e.lab || (Math.abs(pre.nodes[e.a][0] - pre.nodes[e.b][0]) < 1e-9 ? 'r' : 't');
  const sideOffset = (side, d) => ({ l: [-d, 0], r: [d, 0], t: [0, -d], b: [0, d] }[side]);
  const HALF = { R: 0.2, L: 0.38, G: 0.35, B: 0.5, C: 0.48, S: 0.34, A: 0.31 };
  const showBatR = (e, vals) => e.kind === 'B' && (vals[e.rKey] > 0 || sliderKeys.some(([k]) => k === e.rKey));
  const halfOf = (e, vals) => (e.kind === 'B' && showBatR(e, vals) ? 0.66 : HALF[e.kind] ?? 0.1);
  const TAGS = { tl: [-8, -12, 'right'], tr: [8, -12, 'left'], bl: [-8, 13, 'right'], br: [8, 13, 'left'], tc: [0, -16, 'center'], r: [10, 0, 'left'] };

  function draw() {
    C = themeColors();
    A.resize(); A.refreshTheme(); G.resize(); G.refreshTheme();
    const Wd = A.w, Ht = A.h;
    ctx.clearRect(0, 0, Wd, Ht);
    const narrow = Wd < 520;
    const fs = compact || narrow ? 11 : 12.5, lh = fs + 3;
    FS = fs;
    const st = current();
    const seg = S.seg;
    if (!st) {
      text(seg && seg.err ? 'This circuit cannot be solved: ' + seg.err : '—', Wd / 2, Ht / 2, { color: C.bad });
      return;
    }
    const vals = seg.vals;
    // the colour scale spans the node potentials
    Vlo = Math.min(...st.V); Vhi = Math.max(...st.V);
    if (Vhi - Vlo < 1e-9) Vhi = Vlo + 1;

    // ── layout: the nodes' box, with margins measured from the text that goes outside it ──
    const xs = pre.nodes.map((n) => n[0]), ys = pre.nodes.map((n) => n[1]);
    const x0w = Math.min(...xs), x1w = Math.max(...xs), y0w = Math.min(...ys), y1w = Math.max(...ys);
    const graphH = tall ? (narrow ? 200 : 230) : 0;
    const need = { l: 14, r: 14, t: 14, b: 12 };
    const measure = (s, w = 650) => { ctx.save(); ctx.font = `${w} ${fs}px Inter, system-ui, sans-serif`; const m = ctx.measureText(s).width; ctx.restore(); return m; };
    // a first guess at the scale, then the margins the labels need at that scale
    let u = Math.min((Wd - 180) / (x1w - x0w || 1), (Ht - graphH - 90) / (y1w - y0w || 1));
    for (let pass = 0; pass < 2; pass++) {
      for (const e of pre.elements) {
        if (e.kind === 'W' || e.spdt) continue;
        const [l1, l2] = e.kind === 'V' ? [[P.names[e.id] ?? e.name], ['00.0 V']] : labelLines(e, st, vals);
        const all = [...l1, ...l2];
        const [ax, ay] = pre.nodes[e.a], [bx, by] = pre.nodes[e.b];
        const cx = (ax + bx) / 2, cy = (ay + by) / 2, side = labSide(e), hw = halfOf(e, vals) * u;
        let wmax = all.length ? Math.max(...all.map((x) => measure(x))) : 0;
        if (e.kind === 'B' && showBatR(e, vals)) wmax = Math.max(wmax, measure(`${M.nameOf(e.rKey)} = 00.0 Ω`, 500));
        if (e.kind === 'V') { need.r = Math.max(need.r, (e.off ?? 1.4) * u + 0.36 * u + 10 + wmax - (x1w - cx) * u); continue; }
        if (!all.length) continue;
        if (side === 'l') need.l = Math.max(need.l, hw + 9 + wmax - (cx - x0w) * u);
        if (side === 'r') need.r = Math.max(need.r, hw + 9 + wmax - (x1w - cx) * u);
        if (side === 't') need.t = Math.max(need.t, hw + 6 + all.length * lh - (y1w - cy) * u);
        if (side === 'b') need.b = Math.max(need.b, hw + 6 + all.length * lh - (cy - y0w) * u);
      }
      if (show.V) for (const tg of pre.tags) {
        const [x, y] = pre.nodes[tg.n], o = TAGS[tg.at] || TAGS.tr, w = measure('00.0 V', 700) + 4;
        if (o[1] < 0) need.t = Math.max(need.t, -o[1] + 9 - (y1w - y) * u);
        if (o[1] > 0) need.b = Math.max(need.b, o[1] + 9 - (y - y0w) * u);
        if (o[2] === 'right') need.l = Math.max(need.l, w - o[0] - (x - x0w) * u);
        if (o[2] === 'left') need.r = Math.max(need.r, w + o[0] - (x1w - x) * u);
      }
      u = (Wd - need.l - need.r) / (x1w - x0w || 1);
    }
    if (potOn) need.t += 30;          // a strip of its own for the potential legend
    // the schematic at full width sets the canvas height (within reason)
    const want = Math.max(Wd * 0.36, Math.min(Wd * (tall ? 1.6 : 0.9), (y1w - y0w) * u + need.t + need.b + graphH));
    if (!fitHeight(Wd, Ht, want)) { requestAnimationFrame(draw); return; }
    A.o.pad = { l: need.l, r: need.r, t: need.t, b: need.b + graphH };
    A.setView([x0w, x1w], [y0w, y1w]);
    u = A.X(1) - A.X(0);
    const pt = (n) => [A.X(pre.nodes[n][0]), A.Y(pre.nodes[n][1])];
    LW = Math.max(2.2, Math.min(3.2, u * 0.05));
    const lw = LW;

    // loop highlight
    const loopName = loopNow();
    if (loopName && pre.loops[loopName]) {
      const L = pre.loops[loopName], cx = L.reduce((s, n) => s + pre.nodes[n][0], 0) / L.length, cy = L.reduce((s, n) => s + pre.nodes[n][1], 0) / L.length;
      const inset = 0.3;
      const pts = L.map((n) => { const [x, y] = pre.nodes[n]; return [A.X(x + Math.sign(cx - x) * inset * (Math.abs(cx - x) > 1e-9)), A.Y(y + Math.sign(cy - y) * inset * (Math.abs(cy - y) > 1e-9))]; });
      ctx.save(); ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.3; ctx.lineWidth = Math.max(5, u * 0.12); ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke(); ctx.restore();
      // the walking direction, along the first side
      const [x0, y0] = pts[0], [x1, y1] = pts[1];
      const mx = x0 + (x1 - x0) * 0.82, my = y0 + (y1 - y0) * 0.82, len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
      ctx.save(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(mx + ux * 10, my + uy * 10); ctx.lineTo(mx - ux * 6 - uy * 7, my - uy * 6 + ux * 7); ctx.lineTo(mx - ux * 6 + uy * 7, my - uy * 6 - ux * 7); ctx.closePath(); ctx.fill(); ctx.restore();
    }

    // bodies: how long each symbol is along its segment (grid units)
    const bodyLen = (e) => ({ R: e.wire ? 1.9 : 1.3, L: 0.76, G: 0.7, B: 0.3, C: 0.3, S: 1.0, A: 0.62 }[e.kind] ?? 0);
    const geo = {};
    for (const e of pre.elements) {
      if (e.kind === 'V') continue;
      const [x0, y0] = pt(e.a), [x1, y1] = pt(e.b);
      const len = Math.hypot(x1 - x0, y1 - y0), dx = (x1 - x0) / len, dy = (y1 - y0) / len;
      const at = showBatR(e, vals) ? 0.34 : 0.5;
      const cx = x0 + (x1 - x0) * at, cy = y0 + (y1 - y0) * at;
      const Lb = Math.min(len * 0.8, bodyLen(e) * u);
      geo[e.id] = { x0, y0, x1, y1, len, dx, dy, nx: -dy, ny: dx, cx, cy, Lb, p: [cx - (dx * Lb) / 2, cy - (dy * Lb) / 2], q: [cx + (dx * Lb) / 2, cy + (dy * Lb) / 2] };
    }

    // wires and leads, coloured by potential
    for (const e of pre.elements) {
      const g = geo[e.id];
      if (!g) continue;
      const ca = potColor(st.V[e.a]), cb = potColor(st.V[e.b]);
      if (e.kind === 'W') { line(g.x0, g.y0, g.x1, g.y1, ca); continue; }
      if (e.kind === 'S' && e.spdt) continue;
      if (e.kind === 'B' && showBatR(e, vals)) {
        // the cell at 34% of the way along, its internal resistance at 68%
        const mid = [g.x0 + (g.x1 - g.x0) * 0.68, g.y0 + (g.y1 - g.y0) * 0.68];
        const Lr = Math.min(0.62 * u, g.len * 0.22);
        const inner = potColor(st.V[e.a] + vals[e.id]);
        line(g.x0, g.y0, g.p[0], g.p[1], ca);
        line(g.q[0], g.q[1], mid[0] - (g.dx * Lr) / 2, mid[1] - (g.dy * Lr) / 2, inner);
        line(mid[0] + (g.dx * Lr) / 2, mid[1] + (g.dy * Lr) / 2, g.x1, g.y1, cb);
        g.rmid = mid; g.Lr = Lr; g.inner = inner;
        continue;
      }
      line(g.x0, g.y0, g.p[0], g.p[1], ca);
      line(g.q[0], g.q[1], g.x1, g.y1, cb);
    }

    // symbols
    for (const e of pre.elements) {
      const g = geo[e.id];
      if (!g) continue;
      const ca = potColor(st.V[e.a]), cb = potColor(st.V[e.b]);
      if (e.kind === 'R') zigzag(g.p, g.q, g, ca, cb, 0.17 * u, e.wire ? 12 : 6);
      else if (e.kind === 'L') lamp(e, g, st);
      else if (e.kind === 'G') meter(g, 'G', C.ink2, st.I[e.id]);
      else if (e.kind === 'A') meter(g, 'A', C.ink2);
      else if (e.kind === 'B') battery(e, g);
      else if (e.kind === 'C') capacitor(e, g, st);
      else if (e.kind === 'S' && !e.spdt) swtch(e, g, ca, cb);
    }
    if (pre.elements.some((e) => e.spdt)) spdt(st);
    // voltmeters: off to the side, on dashed leads
    for (const e of pre.elements) {
      if (e.kind !== 'V') continue;
      const [xa, ya] = pt(e.a), [xb, yb] = pt(e.b);
      const vertical = Math.abs(xa - xb) < 1;
      const off = (e.off ?? 1.4) * u, r = 0.36 * u;
      const mx = (xa + xb) / 2 + (vertical ? off : 0), my = (ya + yb) / 2;
      if (vertical) {
        line(xa, ya, mx, ya, C.ink3, 1.4, [4, 4]); line(mx, ya, mx, my - r, C.ink3, 1.4, [4, 4]);
        line(xb, yb, mx, yb, C.ink3, 1.4, [4, 4]); line(mx, yb, mx, my + r, C.ink3, 1.4, [4, 4]);
      } else {
        line(xa, ya, mx + r * Math.sign(xa - mx), my, C.ink3, 1.4, [4, 4]);
        line(xb, yb, mx + r * Math.sign(xb - mx), my, C.ink3, 1.4, [4, 4]);
      }
      ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore();
      text('V', mx, my, { color: C.ink, size: fs + 1, weight: 700 });
      const name = P.names[e.id] ?? e.name;
      const reading = P.hide.includes(e.id) ? '?' : eng(st.drop[e.id], 'V');
      if (vertical) { text(name, mx + r + 7, my - lh / 2, { align: 'left', color: C.ink, weight: 650 }); text(reading, mx + r + 7, my + lh / 2, { align: 'left', color: C.gold }); }
      else text(`${name} = ${reading}`, mx, my - r - 10, { color: C.gold });
    }

    // junction dots where three or more conductors meet
    const deg = new Array(pre.nodes.length).fill(0);
    for (const e of pre.elements) if (e.kind !== 'V') { deg[e.a]++; deg[e.b]++; }
    for (let n = 0; n < pre.nodes.length; n++) if (deg[n] >= 3) { const [x, y] = pt(n); ctx.save(); ctx.fillStyle = potColor(st.V[n]); ctx.beginPath(); ctx.arc(x, y, lw + 1.6, 0, 2 * Math.PI); ctx.fill(); ctx.restore(); }

    // moving charges: along wires and leads, through resistors and the battery; not across a capacitor's gap
    if (flowOn) {
      ctx.save();
      ctx.fillStyle = C.ink;
      const spacing = Math.max(11, Math.min(SP, 0.3 * u)), rad = Math.max(1.7, Math.min(carriers() === 'electrons' ? 2.2 : 2.6, 0.045 * u));
      for (const e of pre.elements) {
        const g = geo[e.id];
        if (!g || (e.kind === 'S' && !swNow()[e.id] && !e.spdt)) continue;
        if (e.kind === 'S' && e.spdt && swNow().mode !== e.spdt) continue;
        const ends = e.kind === 'C' || e.kind === 'A' || e.kind === 'G' || e.kind === 'L';
        const pad = e.kind === 'C' ? 0 : HALF[e.kind] * u * 0.95;
        const p = ends ? [g.cx - g.dx * Math.max(pad, g.Lb / 2), g.cy - g.dy * Math.max(pad, g.Lb / 2)] : null;
        const q = ends ? [g.cx + g.dx * Math.max(pad, g.Lb / 2), g.cy + g.dy * Math.max(pad, g.Lb / 2)] : null;
        const paths = ends ? [[[g.x0, g.y0], p], [q, [g.x1, g.y1]]] : [[[g.x0, g.y0], [g.x1, g.y1]]];
        for (const [p0, p1] of paths) {
          const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
          if (L < 4) continue;
          const n = Math.max(1, Math.round(L / spacing)), sp = L / n;
          const ph = (((S.phase[e.id] || 0) % sp) + sp) % sp;
          for (let k = 0; k < n; k++) {
            const s = ph + k * sp;
            if (s > L) continue;
            ctx.beginPath(); ctx.arc(p0[0] + ((p1[0] - p0[0]) * s) / L, p0[1] + ((p1[1] - p0[1]) * s) / L, rad, 0, 2 * Math.PI); ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // static current arrows: assumed directions (arrows) or the actual currents (show.I without flow)
    const arrowSpecs = P.arrows ? Object.entries(P.arrows).map(([id, [label, dir]]) => [id, label, dir]) : (show.I && !flowOn ? pre.elements.filter((e) => ['R', 'L', 'G', 'B', 'A'].includes(e.kind) && Math.abs(st.I[e.id]) > 1e-12).map((e) => [e.id, '', Math.sign(st.I[e.id])]) : []);
    for (const [id, label, dir] of arrowSpecs) {
      const g = geo[id];
      if (!g) continue;
      // on the lead nearer node a, a sixth of the way along
      const f = 0.17, x = g.x0 + (g.x1 - g.x0) * f, y = g.y0 + (g.y1 - g.y0) * f;
      const ux = g.dx * dir, uy = g.dy * dir, sz = 7;
      ctx.save(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(x + ux * sz, y + uy * sz); ctx.lineTo(x - ux * sz - uy * sz * 0.75, y - uy * sz + ux * sz * 0.75); ctx.lineTo(x - ux * sz + uy * sz * 0.75, y - uy * sz - ux * sz * 0.75); ctx.closePath(); ctx.fill(); ctx.restore();
      if (label) { const side = labSide(kindOf[id]), [ox, oy] = sideOffset(side, 13); text(label, x + ox, y + oy, { color: C.gold, align: side === 'r' ? 'left' : side === 'l' ? 'right' : 'center', weight: 700 }); }
    }

    // labels: everything on the element's outer side, name = value nearest
    for (const e of pre.elements) {
      const g = geo[e.id];
      if (!g || e.kind === 'W' || e.spdt) continue;
      const [l1, l2] = labelLines(e, st, vals);
      const side = labSide(e), hw = halfOf(e, vals) * u;
      const all = [...l1.map((x) => [x, C.ink, 650]), ...l2.map((x) => [x, C.gold, 600])];
      if (side === 'l' || side === 'r') {
        const x = g.cx + (side === 'r' ? hw + 8 : -hw - 8), y0 = g.cy - ((all.length - 1) * lh) / 2;
        all.forEach(([x1, col, w], i) => text(x1, x, y0 + i * lh, { align: side === 'r' ? 'left' : 'right', color: col, weight: w }));
      } else {
        const dir = side === 't' ? -1 : 1;
        all.forEach(([x1, col, w], i) => text(x1, g.cx, g.cy + dir * (hw + 4 + lh / 2 + i * lh), { color: col, weight: w }));
      }
      if (e.kind === 'B' && showBatR(e, vals)) {
        const rl = show.values ? `${M.nameOf(e.rKey)} = ${P.hide.includes(e.rKey) ? '?' : given(vals[e.rKey], 'Ω')}` : M.nameOf(e.rKey);
        const [ox, oy] = sideOffset(side, hw + 8);
        text(rl, g.rmid[0] + ox, g.rmid[1] + oy, { align: side === 'l' ? 'right' : side === 'r' ? 'left' : 'center', color: C.ink2, weight: 500 });
      }
    }

    // node potentials
    if (show.V) for (const tg of pre.tags) {
      if (P.hide.includes(`V:${tg.n}`)) continue;
      const [x, y] = pt(tg.n), o = TAGS[tg.at] || TAGS.tr;
      text(eng(st.V[tg.n], 'V'), x + o[0], y + o[1], { align: o[2], color: potOn ? potColor(st.V[tg.n]) : C.gold, weight: 700 });
    }

    // the potential legend, top right
    if (potOn) {
      const lx = Wd - 10, ly = 15, wbar = Math.min(90, Wd * 0.2);
      const grad = ctx.createLinearGradient(lx - wbar, 0, lx, 0);
      [0, 0.25, 0.5, 0.75, 1].forEach((f) => grad.addColorStop(f, potColor(Vlo + f * (Vhi - Vlo))));
      ctx.save(); ctx.fillStyle = grad; ctx.fillRect(lx - wbar, ly - 3, wbar, 6); ctx.restore();
      text(`${trimNum(Vlo, 3)} V`, lx - wbar - 5, ly, { align: 'right', size: fs - 1.5, color: C.ink3, weight: 500 });
      text(`${trimNum(Vhi, 3)} V`, lx, ly + 12, { align: 'right', size: fs - 1.5, color: C.ink3, weight: 500 });
      text('potential', lx - wbar, ly + 12, { align: 'left', size: fs - 1.5, color: C.ink3, weight: 500 });
    }

    if (tall) drawGraph(graphH, fs, narrow);
    if (wantReadout) readout(st);
  }

  function zigzag(p, q, g, ca, cb, amp, n) {
    const grad = ctx.createLinearGradient(p[0], p[1], q[0], q[1]);
    grad.addColorStop(0, ca); grad.addColorStop(1, cb);
    ctx.save(); ctx.strokeStyle = grad; ctx.lineWidth = Math.max(2, (A.X(1) - A.X(0)) * 0.04); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n, s = k % 2 ? -1 : 1;
      ctx.lineTo(p[0] + (q[0] - p[0]) * f + g.nx * amp * s, p[1] + (q[1] - p[1]) * f + g.ny * amp * s);
    }
    ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore();
  }

  function lamp(e, g, st) {
    const u = A.X(1) - A.X(0), r = 0.36 * u;
    // brightness on a perceptual (square-root) scale of the power
    const b = P.glow === false ? 0 : Math.sqrt(Math.max(0, Math.min(1, Math.abs(st.P[e.id]) / lampRef())));
    if (b > 0.03) {
      const R = r * (1.5 + 2.3 * b);
      const glow = ctx.createRadialGradient(g.cx, g.cy, r * 0.9, g.cx, g.cy, R);
      glow.addColorStop(0, C.gold); glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.globalAlpha = 0.35 + 0.6 * b; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(g.cx, g.cy, R, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.fillStyle = b > 0.03 ? mix(C.panel, C.gold, 0.35 * b) : C.panel; ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(g.cx, g.cy, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    // the filament (or, for an igniter, its bridgewire), hot when the power is high
    ctx.strokeStyle = b > 0.03 ? mix(C.ink3, C.gold, Math.min(1, 0.4 + b)) : C.ink3; ctx.lineWidth = 2.2;
    ctx.beginPath();
    if (e.igniter) { const w = r * 0.62; ctx.moveTo(g.cx - g.dx * w, g.cy - g.dy * w); for (let k = 1; k <= 4; k++) { const f = -1 + (2 * k) / 5, sg = k % 2 ? 1 : -1; ctx.lineTo(g.cx + g.dx * w * f + g.nx * r * 0.32 * sg, g.cy + g.dy * w * f + g.ny * r * 0.32 * sg); } ctx.lineTo(g.cx + g.dx * w, g.cy + g.dy * w); }
    else { const w = r * 0.5; ctx.moveTo(g.cx - g.dx * r, g.cy - g.dy * r); ctx.lineTo(g.cx - g.dx * w * 0.6, g.cy - g.dy * w * 0.6); ctx.arc(g.cx, g.cy, w * 0.6, Math.atan2(-g.dy, -g.dx), Math.atan2(g.dy, g.dx), false); ctx.lineTo(g.cx + g.dx * r, g.cy + g.dy * r); }
    ctx.stroke(); ctx.restore();
  }

  function meter(g, letter, color, I) {
    const u = A.X(1) - A.X(0), r = 0.31 * u;
    ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g.cx, g.cy, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore();
    if (letter === 'G' && I !== undefined) {
      // a needle: full scale at a tenth of the reference current
      const f = Math.max(-1, Math.min(1, I / (0.1 * (S.Iref || 1)))), a = -Math.PI / 2 + f * 1.1;
      ctx.save(); ctx.strokeStyle = C.bad; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(g.cx, g.cy + r * 0.55); ctx.lineTo(g.cx + Math.cos(a) * r * 0.85, g.cy + r * 0.55 + Math.sin(a) * r * 1.05); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.font = `700 ${Math.max(9, r * 0.7)}px Inter, system-ui, sans-serif`; ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('G', g.cx, g.cy + r * 0.12); ctx.restore();
    } else {
      ctx.save(); ctx.font = `700 ${Math.max(10, r * 0.9)}px Inter, system-ui, sans-serif`; ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, g.cx, g.cy + 0.5); ctx.restore();
    }
  }

  function battery(e, g) {
    const u = A.X(1) - A.X(0);
    const gap = Math.min(g.Lb, 0.3 * u);
    // the − plate nearer a (short, thick), the + plate nearer b (long)
    const pm = [g.cx - (g.dx * gap) / 2, g.cy - (g.dy * gap) / 2], pp = [g.cx + (g.dx * gap) / 2, g.cy + (g.dy * gap) / 2];
    const plate = (c, half, w, col) => line(c[0] - g.nx * half, c[1] - g.ny * half, c[0] + g.nx * half, c[1] + g.ny * half, col, w);
    plate(pp, 0.5 * u, 2.6, C.ink);
    plate(pm, 0.26 * u, 5.5, C.ink);
    const sgn = labSide(e) === 'l' ? 1 : -1;            // the + sign on the side away from the labels
    const ox = g.nx * 0.5 * u * sgn * 0.9, oy = g.ny * 0.5 * u * sgn * 0.9;
    ctx.save(); ctx.font = `700 ${Math.max(11, u * 0.26)}px Inter, system-ui, sans-serif`; ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('+', pp[0] + ox + g.dx * 9, pp[1] + oy + g.dy * 9); ctx.fillText('−', pm[0] + ox - g.dx * 9, pm[1] + oy - g.dy * 9); ctx.restore();
    if (g.rmid) {
      zigzag([g.rmid[0] - (g.dx * g.Lr) / 2, g.rmid[1] - (g.dy * g.Lr) / 2], [g.rmid[0] + (g.dx * g.Lr) / 2, g.rmid[1] + (g.dy * g.Lr) / 2], g, g.inner, potColor(current().V[e.b]), 0.13 * u, 4);
      // a dashed outline: both parts are the one battery
      const a = [g.x0 + (g.x1 - g.x0) * 0.2, g.y0 + (g.y1 - g.y0) * 0.2], b = [g.x0 + (g.x1 - g.x0) * 0.82, g.y0 + (g.y1 - g.y0) * 0.82], w = 0.62 * u;
      ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(a[0] + g.nx * w, a[1] + g.ny * w); ctx.lineTo(b[0] + g.nx * w, b[1] + g.ny * w); ctx.lineTo(b[0] - g.nx * w, b[1] - g.ny * w); ctx.lineTo(a[0] - g.nx * w, a[1] - g.ny * w); ctx.closePath(); ctx.stroke(); ctx.restore();
    }
  }

  function capacitor(e, g, st) {
    const u = A.X(1) - A.X(0), half = 0.46 * u;
    const vC = st.drop[e.id], Cv = S.seg.vals[e.id];
    // full scale: the most charge any capacitor holds at either end of this charge or discharge
    const seg = S.seg;
    const qref = Math.max(1e-30, ...capIds.map((id) => Math.max(Math.abs(seg.vals[id] * (seg.tr.final[id] ?? 0)), Math.abs(seg.vals[id] * (seg.v0[id] ?? 0)))));
    // the field between the plates, fainter as the charge falls
    const f = Math.min(1, Math.abs(vC * Cv) / (qref || 1));
    ctx.save(); ctx.fillStyle = C.violet; ctx.globalAlpha = 0.1 + 0.35 * f;
    ctx.beginPath(); ctx.moveTo(g.p[0] - g.nx * half, g.p[1] - g.ny * half); ctx.lineTo(g.p[0] + g.nx * half, g.p[1] + g.ny * half); ctx.lineTo(g.q[0] + g.nx * half, g.q[1] + g.ny * half); ctx.lineTo(g.q[0] - g.nx * half, g.q[1] - g.ny * half); ctx.closePath(); ctx.fill(); ctx.restore();
    for (const [c, V] of [[g.p, st.V[e.a]], [g.q, st.V[e.b]]]) line(c[0] - g.nx * half, c[1] - g.ny * half, c[0] + g.nx * half, c[1] + g.ny * half, potOn ? potColor(V) : C.ink, 3.2);
    // charges on the plates: + on the higher-potential plate
    const nq = f > 0.02 ? Math.max(1, Math.round(5 * f)) : 0;
    if (nq > 0) {
      const pos = vC >= 0 ? [g.p, -1] : [g.q, 1], neg = vC >= 0 ? [g.q, 1] : [g.p, -1];
      ctx.save(); ctx.font = `700 ${Math.max(10, u * 0.22)}px Inter, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // slots either side of the centre, where the lead wire meets the plate
      const SLOTS = [0.22, -0.22, 0.52, -0.52, 0.82, -0.82];
      for (let k = 0; k < nq; k++) {
        const s = SLOTS[k] * half;
        ctx.fillStyle = C.bad; ctx.fillText('+', pos[0][0] + g.nx * s + g.dx * 8 * pos[1], pos[0][1] + g.ny * s + g.dy * 8 * pos[1]);
        ctx.fillStyle = C.accent; ctx.fillText('−', neg[0][0] + g.nx * s + g.dx * 8 * neg[1], neg[0][1] + g.ny * s + g.dy * 8 * neg[1]);
      }
      ctx.restore();
    }
  }

  function swtch(e, g, ca, cb) {
    const u = A.X(1) - A.X(0);
    const closed = swNow()[e.id];
    const r = 3.2;
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = Math.max(2.6, u * 0.06); ctx.lineCap = 'round';
    const ang = closed ? 0 : -0.55;
    const c = Math.cos(ang), s = Math.sin(ang);
    const dx = g.dx * c - g.dy * s, dy = g.dx * s + g.dy * c;
    ctx.beginPath(); ctx.moveTo(g.p[0], g.p[1]); ctx.lineTo(g.p[0] + dx * g.Lb, g.p[1] + dy * g.Lb); ctx.stroke();
    ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6;
    for (const p of [g.p, g.q]) { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    void cb;
  }

  // the two-way switch of the rc layout, drawn once
  function spdt(st) {
    const Sc = pre.elements.find((e) => e.spdt === 'charge'), Sd = pre.elements.find((e) => e.spdt === 'discharge');
    if (!Sc) return;
    const pivot = [A.X(pre.nodes[Sc.b][0]), A.Y(pre.nodes[Sc.b][1])];
    const X = [A.X(pre.nodes[Sc.a][0]), A.Y(pre.nodes[Sc.a][1])], Yc = [A.X(pre.nodes[Sd.a][0]), A.Y(pre.nodes[Sd.a][1])];
    const on = swNow().mode === 'discharge' ? Yc : X;
    line(pivot[0], pivot[1], on[0], on[1], C.ink2, Math.max(2.6, (A.X(1) - A.X(0)) * 0.06));
    ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6;
    for (const p of [X, Yc]) { ctx.beginPath(); ctx.arc(p[0], p[1], 3.4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(pivot[0], pivot[1], 3.8, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
    const fs = compact || A.w < 520 ? 10.5 : 11.5;
    ctx.save(); ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`; ctx.fillStyle = C.ink3; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('charge', X[0], X[1] - 8); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('discharge', Yc[0] + 8, Yc[1]); ctx.restore();
  }

  // ─── the V(t) graph ───
  function drawGraph(gh, fs, narrow) {
    const seg = S.seg;
    if (!seg || !seg.tr) return;
    const Ht = A.h, Wd = A.w;
    const tau = seg.tau || 1;
    const [tf, tu] = tau >= 0.5 ? [1, 's'] : tau >= 5e-4 ? [1e3, 'ms'] : [1e6, 'µs'];
    const Tmax = 5 * tau;
    const vmax = Math.max(1e-9, Vhi);
    G.o.pad = { l: narrow ? 40 : 52, r: 14, t: Ht - gh + 18, b: 30 };
    G.o.xlabel = `t (${tu})`; G.o.ylabel = '';
    G.setView([0, Tmax * tf], [Math.min(0, Vlo) * 1.05, vmax * 1.08]);
    ctx.save(); ctx.strokeStyle = C.line2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(10, Ht - gh + 4); ctx.lineTo(Wd - 10, Ht - gh + 4); ctx.stroke(); ctx.restore();
    G.grid(); G.axes();
    const cols = ['accent', 'teal', 'violet'];
    const fsS = fs - 0.5;
    G.text('V (V)', G.L + 4, G.T + 2, { align: 'left', color: 'ink2', size: fsS, screen: true, dy: -10 });
    // the time constant and the level reached after one τ
    G.line(tau * tf, G.vy0, tau * tf, G.vy1, { color: 'gold', width: 1.3, dash: [5, 5] });
    G.text(`τ = ${eng(tau, 's', 3)}`, tau * tf, G.vy0 + 0.1 * (G.vy1 - G.vy0), { dx: 6, color: 'gold', size: fsS, weight: 650 });
    const curveIds = capIds;
    const tEnd = graphMode === 'static' || still ? Tmax : Math.min(seg.t, Tmax);
    curveIds.forEach((id, k) => {
      const col = cols[k % cols.length];
      const vinf = seg.tr.final[id], v0 = seg.v0[id] ?? 0;
      if (Math.abs(vinf - v0) > 1e-9) {
        const v1 = vinf + (v0 - vinf) * Math.exp(-1);
        if (k === 0) { G.line(0, v1, tau * tf, v1, { color: 'gold', width: 1, dash: [3, 4] }); G.text(v0 < vinf ? '63%' : '37%', 0, v1, { dx: 4, dy: -8, color: 'gold', size: fsS - 1 }); }
        G.line(0, vinf, Tmax * tf, vinf, { color: col, width: 1, dash: [6, 5], alpha: 0.6 });
      }
      const n = 240, pts = [];
      for (let i = 0; i <= n; i++) { const t = (tEnd * i) / n; pts.push([t * tf, seg.tr.vAt(t)[id]]); }
      G.path(pts, { color: col, width: 2.4 });
      const tt = still ? P.t : seg.t;
      if (((!still && graphMode !== 'static') || (still && P.mark !== false)) && tt <= Tmax * 1.0001) G.point(Math.min(tt, Tmax) * tf, seg.tr.vAt(tt)[id], { color: col, r: 4.5 });
      if (capIds.length > 1) G.text(P.names[id] ?? M.nameOf(id), Tmax * tf, vinf, { dx: -4, dy: -9, align: 'right', color: col, size: fsS, weight: 650 });
    });
  }

  function readout(st) {
    const seg = S.seg, vals = seg.vals, rows = [];
    const bats = pre.elements.filter((e) => e.kind === 'B');
    if (P.circuit === 'twoloop') {
      // signed along the directions the lessons guess: I₁ and I₂ toward the top junction, I₃ down
      rows.push(['$I_1$ (→ through $R_1$)', texEng(st.I.R1, 'A')], ['$I_2$ (← through $R_2$)', texEng(-st.I.R2, 'A')], ['$I_3$ (↓ through $R_3$)', texEng(st.I.R3, 'A')]);
      const loopName = loopNow();
      if (loopName) {
        const L = pre.loops[loopName];
        let sum = 0;
        const terms = [];
        L.forEach((n, i) => {
          const m = L[(i + 1) % L.length];
          const e = pre.elements.find((x) => (x.a === n && x.b === m) || (x.a === m && x.b === n));
          if (!e || e.kind === 'W') return;
          const dV = (e.a === n ? -1 : 1) * st.drop[e.id];
          sum += dV;
          terms.push(`${dV >= 0 ? '+' : '-'}${trimNum(Math.abs(dV), 3)}`);
        });
        rows.push([`changes round the ${loopName} loop`, `${terms.join(' ')} = ${trimNum(Math.abs(sum) < 1e-9 ? 0 : sum, 3)}\\,\\mathrm{V}`]);
      }
      if (P.junction) rows.push(['top junction: $I_1 + I_2 = I_3$', `${texEng(st.I.R1, 'A')} ${-st.I.R2 < 0 ? '-' : '+'} ${texEng(Math.abs(st.I.R2), 'A')} = ${texEng(st.I.R3, 'A')}`]);
    } else if (hasCaps) {
      const tau = seg.tau, t = seg.t;
      rows.push(['$t$', `${texEng(t, 's')}${tau ? ` = ${trimNum(t / tau, 3)}\\,\\tau` : ''}`]);
      if (tau) rows.push(['time constant $\\tau$', texEng(tau, 's')]);
      for (const id of capIds) rows.push([`$V_{${texKey(id)}}$`, texEng(st.drop[id], 'V')]);
      const Rid = P.circuit === 'firing' ? (seg.sw.S2 ? 'Rb' : 'Rc') : 'R';
      rows.push([P.circuit === 'firing' && seg.sw.S2 ? 'igniter current' : 'current $I$', texEng(Math.abs(st.I[Rid]), 'A')]);
      if (P.energy) {
        // since the switch moved: the emf's work ℰ∫I dt, the change in stored energy, and the heat (resistors and the battery's own r)
        const en = seg.tr.energy(t), q = seg.tr.charge(t);
        const work = bats.reduce((s, e) => s + vals[e.id] * q[e.id], 0);
        const stored = capIds.reduce((s, id) => s + en[id], 0);
        const heat = pre.elements.filter((e) => UNIT[e.kind] === 'Ω').reduce((s, e) => s + en[e.id], 0) + bats.reduce((s, e) => s + en[e.id] + vals[e.id] * q[e.id], 0);
        if (bats.some((e) => Math.abs(q[e.id]) > 0)) rows.push(['work done by the battery', texEng(work, 'J')]);
        rows.push(['change in stored energy', texEng(stored, 'J')], ['heat in the resistors', texEng(heat, 'J')]);
      }
    } else {
      if (bats.length === 1) {
        const b = bats[0], I = st.I[b.id], Vt = st.V[b.b] - st.V[b.a];
        rows.push(['battery current', texEng(I, 'A')]);
        if (vals[b.rKey] > 0 || sliderKeys.some(([k]) => k === b.rKey)) rows.push(['terminal voltage', texEng(Vt, 'V')]);
        if (Math.abs(I) > 1e-12) rows.push(['$R_\\text{eq} = V/I$', texEng(Vt / I, 'Ω')]);
        rows.push(['power delivered', texEng(Vt * I, 'W')]);
      }
      if (P.circuit === 'bridge') {
        const det = pre.elements.find((e) => e.kind === 'V' || e.kind === 'G');
        if (det.kind === 'V') rows.push(['$V_\\text{out}$', texEng(st.drop[det.id], 'V')]); else rows.push(['galvanometer current', texEng(st.I[det.id], 'A')]);
        rows.push(['$R_1/R_2$', trimNum(vals.R1 / vals.R2, 4)], ['$R_3/R_4$', trimNum(vals.R3 / vals.R4, 4)]);
      }
      if (W) {
        const w = wireNow(), Ar = (Math.PI * w.d * w.d) / 4, I = Math.abs(st.I.R1), mat = M.MATERIALS[w.material];
        rows.push(['$R = \\rho L/A$', texEng(vals.R1, 'Ω')], ['current density $J = I/A$', `${trimNum(I / Ar / 1e6, 3)}\\,\\mathrm{A/mm^2}`], ['field in the wire $E = V/L$', `${trimNum(Math.abs(st.drop.R1) / w.L, 3)}\\,\\mathrm{V/m}`]);
        if (mat.n) rows.push(['drift speed $v_d$', `${trimNum(M.driftSpeed(I, mat.n, Ar) * 1e3, 3)}\\,\\mathrm{mm/s}`]);
      }
    }
    // on a narrow screen the per-element readings live here rather than on the picture
    if (A.w < 520 && !compact && !hasCaps && P.circuit !== 'twoloop' && (show.I || show.P || show.drop)) {
      for (const e of pre.elements) {
        if (!['R', 'L', 'G'].includes(e.kind)) continue;
        const parts = [];
        if (show.I && !P.hide.includes(`I:${e.id}`)) parts.push(texEng(Math.abs(st.I[e.id]), 'A'));
        if (show.drop && !P.hide.includes(`dV:${e.id}`)) parts.push(texEng(Math.abs(st.drop[e.id]), 'V'));
        if (show.P && !P.hide.includes(`P:${e.id}`)) parts.push(texEng(Math.abs(st.P[e.id]), 'W'));
        if (parts.length) rows.push([`$${texKey(e.id)}$`, parts.join(',\\ ')]);
      }
    }
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(captionOf(P, pre, flowOn, potOn, hasCaps, hasCaps && !still && (flowOn || (graphMode && graphMode !== 'static'))));
  return { get: (k) => F.params[k], destroy: () => anim?.stop() };
}

function altOf(name) {
  return { single: 'a battery and one resistor', series: 'resistors in series with a battery', parallel: 'resistors in parallel across a battery', combo: 'one resistor in series with two in parallel', ladder: 'a resistor ladder', bridge: 'a Wheatstone bridge', twoloop: 'two batteries in a two-loop circuit', rc: 'a battery charging a capacitor through a resistor, with a two-way switch', firing: 'a capacitor-discharge firing circuit: a bus charges a capacitor bank that is then switched across an igniter' }[name] || name;
}

function captionOf(P, pre, flowOn, potOn, hasCaps, animatedCaps) {
  const parts = ['Ideal wires; every resistor obeys $V = IR$ with a fixed $R$.'];
  if (pre.elements.some((e) => e.kind === 'L')) parts.push('Bulbs are drawn as fixed resistors glowing with their power; a real filament’s resistance rises several-fold as it heats.');
  if (flowOn) parts.push(`The moving dots are ${P.carriers === 'electrons' ? 'electrons' : 'charge carriers'} at a speed proportional to the current, enormously exaggerated: real drift speeds are below a millimetre per second, while the signal that sets them moving crosses the circuit at nearly the speed of light.`);
  if (potOn) parts.push('Wire colour shows potential, from the lowest node (blue) to the highest (red).');
  if (hasCaps) parts.push(animatedCaps ? 'Capacitors are ideal (no leakage); time runs slowed down so that one time constant $\\tau$ takes about a second and a half.' : 'Capacitors are ideal (no leakage).');
  return parts.join(' ');
}

const fmtRho = (r) => { const e = Math.floor(Math.log10(r)); return `${trimNum(r / 10 ** e, 3)}×10${String(e).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`; };
function niceUp(x) {
  if (!(x > 0)) return 1;
  const m = 10 ** Math.floor(Math.log10(x)), r = x / m;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * m;
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!M.PRESETS.includes(P.circuit)) return [`circuit must be one of ${M.PRESETS.join(', ')}`];
  for (const k of Object.keys(P.opts || {})) if (!OPT_KEYS.includes(k)) problems.push(`unknown layout option “${k}” (use ${OPT_KEYS.join(', ')})`);
  let pre;
  try { pre = M.preset(P.circuit, P.opts); } catch (e) { return [e.message]; }
  const keys = M.keysOf(pre);
  for (const k of Object.keys(P.values || {})) if (!keys.includes(k)) problems.push(`unknown value key “${k}” for ${P.circuit} (use ${keys.join(', ')})`);
  const vals = { ...pre.defaults, ...P.values };
  for (const k of keys) {
    const v = vals[k] ?? 0;
    if (!Number.isFinite(v)) problems.push(`value ${k} must be a number`);
    else if (/^r\d?$/.test(k) ? v < 0 : /^E\d?$/.test(k) ? false : !(v > 0)) problems.push(`value ${k} must be positive (SI units: Ω, V, F)`);
  }
  for (const s0 of P.sliders || []) {
    const s = typeof s0 === 'string' ? { key: s0 } : s0;
    if (!keys.includes(s.key)) problems.push(`slider for unknown value “${s.key}”`);
    if (s.unit && !SLIDER_UNITS[s.unit]) problems.push(`slider unit “${s.unit}” (use ${Object.keys(SLIDER_UNITS).join(', ')})`);
    if (s.min !== undefined && s.max !== undefined && !(s.min < s.max)) problems.push(`slider ${s.key}: min must be below max`);
  }
  const sws = pre.switches;
  for (const k of Object.keys(P.switches || {})) if (!sws.includes(k)) problems.push(`unknown switch “${k}” for ${P.circuit} (use ${sws.join(', ') || 'none'})`);
  if (P.switches?.mode && !['charge', 'discharge'].includes(P.switches.mode)) problems.push('switches.mode must be charge or discharge');
  if (Array.isArray(P.controls)) for (const k of P.controls) if (!sws.includes(k)) problems.push(`unknown switch control “${k}”`);
  const ids = pre.elements.map((e) => e.id);
  for (const h of P.hide || []) { const [kind, id] = h.includes(':') ? h.split(':') : [null, h]; if (kind === 'V' ? !(+id >= 0 && +id < pre.nodes.length) : !ids.includes(id) && !keys.includes(id)) problems.push(`hide: unknown “${h}”`); }
  for (const k of Object.keys(P.names || {})) if (!ids.includes(k)) problems.push(`names: unknown element “${k}”`);
  for (const k of Object.keys(P.arrows || {})) { if (!ids.includes(k)) problems.push(`arrows: unknown element “${k}”`); const a = P.arrows[k]; if (!Array.isArray(a) || ![1, -1].includes(a[1])) problems.push(`arrows.${k} must be [label, +1 or −1]`); }
  if (P.loop && !pre.loops[P.loop]) problems.push(`loop “${P.loop}” is not a loop of ${P.circuit} (use ${Object.keys(pre.loops).join(', ') || 'none'})`);
  if (!['conventional', 'electrons'].includes(P.carriers)) problems.push('carriers must be conventional or electrons');
  if (P.wire) {
    if (P.circuit !== 'single') problems.push('wire works with the single layout only');
    const w = { material: 'nichrome', L: 1, d: 0.5e-3, ...P.wire };
    if (!M.MATERIALS[w.material]) problems.push(`unknown material “${w.material}” (use ${MATERIAL_KEYS.join(', ')})`);
    if (!(w.L > 0) || !(w.d > 0 && w.d < 0.01)) problems.push('wire: L in metres and d in metres (below 1 cm)');
  }
  if (P.t !== null && P.t !== undefined && !(P.t >= 0)) problems.push('t must be zero or positive (seconds)');
  // the circuit must solve in every switch position
  for (let m = 0; m < 2 ** sws.length; m++) {
    const sw = Object.fromEntries(sws.map((s, i) => [s, s === 'mode' ? ((m >> i) & 1 ? 'discharge' : 'charge') : !!((m >> i) & 1)]));
    try { M.transient(M.circuitOf(pre, vals, sw), {}); } catch (e) { problems.push(`does not solve with switches ${JSON.stringify(sw)}: ${e.message}`); break; }
  }
  return problems;
}
