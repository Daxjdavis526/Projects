/* TS-2 with BPE-2 — the same stand, a regeneratively cooled engine.
   FICTIONAL.

   BPE-2 is BPE-1's big brother in all but size: the same throat, the same
   propellants, an injector of the same pattern — and a chamber that cools
   itself. Its liner is a thin copper alloy with channels milled into the
   back; the fuel, after MFV-723 and FT-724, enters them at the nozzle end,
   runs forward to the injector end and only then reaches the injector. The
   burn is no longer limited by a heat sink filling up: it is limited by the
   propellant on board, and by the fuel's ability to carry the heat away
   without boiling.

   Everything that is not the engine — tanks, regulators, purge, valves,
   meters, the sequencer, the go/no-go stations — is TS-2's, imported, not
   copied. What changes: the fuel line runs through the jacket (more
   resistance, a bigger volume to prime — the fuel side now needs a LEAD),
   two new instruments (PT-727 jacket inlet, TC-728 jacket outlet), wall
   thermocouples that read a cooled liner, new limits, faults and
   inspections. */

import { psi, degC, cc } from '../../lib/units.js';
import base, { DESIGN } from './ts2-biprop.js';
import basePid from './ts2-pid.js';
import { FAULTS as BASE_FAULTS } from '../faults/ts2-faults.js';
import { REGEN_FAULTS, REGEN_INSPECTIONS, REGEN_DIAGNOSIS } from '../faults/ts2r-faults.js';
import { INSPECTIONS as BASE_INSPECTIONS } from '../faults/ts2-inspections.js';
import { tsatFU } from '../../physics/cooling.js';

/* The as-built BPE-2 injector differs from the drawing differently from
   BPE-1's: every injector is its own. */
const AS_BUILT2 = { ox: 0.97, fu: 0.985, etaCstar: 0.95 };
const CP_FU = 2500;          // J/kg/K, FU-1 (fictional, alcohol-like)

export const DESIGN2 = {
  ...DESIGN,
  etaCstar: 0.95,
  burnLimit: 30,             // s: no heat sink to fill — the tanks and the stand rating set it
  dPjacket: psi(60),         // jacket ΔP at the design fuel flow
  regen: true,
};

/* The cooling jacket, nozzle exit to injector face, as seven segments
   (listed injector → exit; the coolant runs the other way). hc0 is the
   coolant-side coefficient at the design flow: higher where the channels
   are narrower and faster, at the throat. */
const regen = {
  line: 'fu',
  throatDia: DESIGN.throatDia,
  segments: [
    { id: 'c1', AR: 4.0, L: 0.020, hc0: 34000 },
    { id: 'c2', AR: 4.0, L: 0.020, hc0: 32000 },
    { id: 'c3', AR: 4.0, L: 0.020, hc0: 32000 },
    { id: 'cv', AR: 2.2, L: 0.015, hc0: 40000 },
    { id: 'th', AR: 1.0, L: 0.010, hc0: 60000 },
    { id: 'd1', AR: 1.6, L: 0.012, hc0: 45000 },
    { id: 'd2', AR: 3.0, L: 0.015, hc0: 30000 },
  ],
  liner: { t: 1.0e-3, k: 320, rhoC: 8900 * 385 },
  hg0: 3000,                 // W/m²/K at the throat, at Pnom
  Pnom: 2.1e6,
  mdotNom: 0.090,
  cp: CP_FU, rho: 800,
  Vjacket: cc(55),
  Tcoke: degC(240), cokeRate: 2e-7,
  qchf0: 3e6,                // W/m², critical heat flux at design flow, saturated
  Tdamage: degC(600),        // liner hot face: above this it is being damaged
  breachCdA: 4e-7,
  chamberSeg: 'c2', throatSeg: 'th',
};

const physics = {
  ...base.physics,
  lines: base.physics.lines.map(l => (l.id === 'fu'
    ? { ...l, Vman: cc(20 + 55), wetFrom: 0.78, jacket: { CdA: DESIGN.mdotFu / Math.sqrt(2 * 800 * DESIGN2.dPjacket) }, CdAinj: DESIGN.CdAfu * AS_BUILT2.fu }
    : { ...l, CdAinj: DESIGN.CdAox * AS_BUILT2.ox })),
  chamber: { ...base.physics.chamber, etaCstar: AS_BUILT2.etaCstar, regen: true },
  regen,
};

const PT = (id, sig, desc, fs, extra = {}) => ({
  id, kind: 'PT', quantity: 'pressure', gauge: true, signal: sig, desc,
  range: [0, psi(fs)], noise: psi(fs) * 0.00012, hum: psi(fs) * 0.00008,
  tau: 0.0005, zeroSigma: psi(fs) * 0.0012, bits: 16, ...extra,
});
const TC = (id, sig, desc, tau) => ({
  id, kind: 'TC', quantity: 'temperature', signal: sig, desc,
  range: [degC(-200), degC(1250)], noise: 0.12, hum: 0.05, tau, zeroSigma: 0.35, bits: 16, zeroable: false,
});

const sensors = [
  ...base.sensors.map(s => (s.id === 'TC-802' ? { ...s, desc: 'Chamber liner temperature (embedded, barrel)', tau: 0.3 }
    : s.id === 'TC-803' ? { ...s, desc: 'Throat liner temperature (embedded)', tau: 0.3 } : s)),
  PT('PT-727', 'Pg:jin', 'Fuel cooling-jacket inlet pressure', 1000, { tau: 0.0003 }),
  TC('TC-728', 'Tc:jout', 'Fuel temperature, jacket outlet (coolant out)', 0.25),
];

const channels = {
  commands: base.channels.commands,
  derived: [
    ...base.channels.derived,
    { id: 'DP-JKT', quantity: 'pressure', gauge: false, desc: 'Cooling-jacket ΔP (PT-727 − PT-725)', inputs: ['PT-727', 'PT-725'], fn: ([a, b]) => a - b },
    /* Heat picked up by the coolant: ṁ·cp·ΔT. Only meaningful in steady
       flow with the meter set for FU-1. */
    { id: 'Q-JKT', quantity: 'power', desc: 'Heat into the coolant, FT-724·cp·(TC-728 − TC-727)', inputs: ['FT-724', 'TC-728', 'TC-727'],
      fn: ([m, a, b]) => (m > 0.01 ? m * CP_FU * (a - b) : 0) },
    /* Boiling margin at the jacket outlet: saturation temperature of FU-1 at
       the manifold pressure, minus the coolant temperature. The outlet is
       the hottest coolant and the lowest pressure in the jacket. */
    { id: 'TSAT-M', quantity: 'ratio', desc: 'Boiling margin at jacket outlet, Tsat(PT-725) − TC-728, kelvin', inputs: ['PT-725', 'TC-728'],
      fn: ([p, t], k) => { const ts = tsatFU(p + k.Pamb); return Number.isFinite(ts) ? ts - t : 500; } },
  ],
};

const V = (tag, name, kind, specs, text, extra = {}) => ({ tag, name, kind, specs, text, ...extra });
const components = { ...base.components };
delete components['BPE-1'];
components['BPE-2'] = V('BPE-2', 'Regeneratively cooled research engine (fictional)', 'Test article', {
    'Injector': 'Impinging doublets (BPE-1 pattern)', 'Design point (hot)': 'OX-1 0.130 kg/s, FU-1 0.087 kg/s, MR 1.50',
    'Design injector ΔP': '100 psi', 'Cooling': 'FU-1 through 7-zone milled channels, counterflow', 'Jacket ΔP (design)': '≈60 psi',
    'Liner': 'Copper alloy, 1.0 mm', 'Throat': 'Ø 14.4 mm', 'Burn limit': 'propellant on board (stand rating 30 s)' },
  'The same size and propellants as BPE-1, but cooled by its own fuel. The fuel picks up the heat the wall would otherwise store, so the burn can run as long as the tanks last — as long as the fuel keeps up: flow it too little, too hot or at too low a pressure and it boils against the wall, and a boiling wall is a burning wall.',
  { ref: ['regenerative-cooling', 'injector', 'mixture-ratio', 'hard-start', 'critical-heat-flux'] });
components['JKT-2'] = V('JKT-2', 'Regenerative cooling jacket', 'Milled channels in the liner, closed out by an electroformed shell',
  { 'Inlet': 'nozzle end (PT-727)', 'Outlet': 'injector fuel manifold (PT-725, TC-728)', 'Volume': '≈55 cc', 'Coolant': 'FU-1, all of it' },
  'Every gram of fuel the engine burns crosses this jacket first. It adds a pressure drop the fuel tank must supply and a volume the fuel must fill before it reaches the injector — so the fuel side primes later than the oxidiser side, and the start sequence must allow for it.',
  { ref: ['regenerative-cooling', 'coking', 'priming'] });

const componentSensors = { ...base.componentSensors };
componentSensors['BPE-2'] = [...base.componentSensors['BPE-1'], 'PT-727', 'TC-728'];
componentSensors['JKT-2'] = ['PT-727', 'PT-725', 'TC-728', 'TC-727', 'DP-JKT', 'Q-JKT', 'TSAT-M'];
delete componentSensors['BPE-1'];

const limits = [
  ...base.limits.filter(L => !['TC803-HI', 'TC803-RL', 'TC802-HI'].includes(L.id)),
  // a cooled liner should never get near a heat-sink chamber's temperatures
  { id: 'TC803-HI', channel: 'TC-803', hi: degC(320), level: 'caution', persist: 0.2, text: 'Throat liner temperature high' },
  { id: 'TC803-RL', channel: 'TC-803', hi: degC(420), level: 'redline', action: 'abort', persist: 0.1, when: c => c.burning, text: 'throat liner over temperature — cooling lost' },
  { id: 'TC802-HI', channel: 'TC-802', hi: degC(250), level: 'caution', persist: 0.3, text: 'Chamber liner temperature high' },
  { id: 'TC728-HI', channel: 'TC-728', hi: degC(150), level: 'caution', persist: 0.5, when: c => c.burning, text: 'Coolant outlet temperature high' },
  { id: 'TSAT-LO', channel: 'TSAT-M', lo: 15, level: 'redline', action: 'abort', persist: 0.3, when: c => c.burning && c.Tburn > 1.0, text: 'coolant within 15 K of boiling at the jacket outlet' },
];

const ratings = { ...base.ratings, COOLANT_MAX_IN: degC(35) };

/* The go/no-go: TS-2's stations, plus the coolant. */
const gonogo = base.gonogo.map(st => (st.id !== 'PROP' ? st : { ...st, items: [...st.items,
  { label: 'Fuel (coolant) inlet temperature TC-727', eval: v => ({ value: `${(v.ch('TC-727') - 273.15).toFixed(1)} °C (limit ${(v.ratings.COOLANT_MAX_IN - 273.15).toFixed(0)} °C)`,
      ok: v.plan.mode !== 'hot' || v.ch('TC-727') <= v.ratings.COOLANT_MAX_IN }),
    why: 'The fuel is the coolant. Every degree it starts warmer is a degree of boiling margin gone at the throat.' },
] }));

/* The P&ID: TS-2's, with the jacket's two instruments on the engine. */
const pid = {
  ...basePid,
  symbols: basePid.symbols.map(sy => (sy.id === 'BPE-1' ? { ...sy, id: 'BPE-2', regen: true } : sy)),
  instruments: [...basePid.instruments,
    { id: 'PT-727', x: 1196, y: 226, tap: [1218, 288], lab: 'above' },
    { id: 'TC-728', x: 980, y: 470, tap: [1120, 292], lab: 'below' }],
};

export default {
  ...base,
  id: 'TS-2R',
  family: 'TS-2',
  program: 'regen',
  name: 'TS-2 Bipropellant Engine Stand · BPE-2',
  short: 'TS-2 · BPE-2 regen',
  article: 'BPE-2 S/N 001 · regeneratively cooled',
  physics, sensors, channels, components, componentSensors, limits, ratings, gonogo, pid,
  faults: [...BASE_FAULTS.filter(f => !['film-loss'].includes(f.id)), ...REGEN_FAULTS],
  diagnosis: REGEN_DIAGNOSIS,
  inspections: [...BASE_INSPECTIONS, ...REGEN_INSPECTIONS],
  design: DESIGN2,
  plots: [['PT-710', 'PT-720', 'PT-630'], ['PT-715', 'PT-725', 'PT-727', 'MOV-713-CMD', 'MFV-723-CMD'], ['FT-714', 'FT-724']],
  analysisPlotsHot: [['PT-801', 'MOV-713-CMD', 'MFV-723-CMD'], ['PT-715', 'PT-725', 'PT-727'], ['FT-714', 'FT-724'], ['LC-901'],
    ['TC-728', 'TC-727'], ['TC-802', 'TC-803'], ['OD-804', 'VIB-805', 'IGN-I']],
  analysisPlots: [['PT-713', 'PT-715', 'MOV-713-CMD'], ['PT-723', 'PT-727', 'PT-725', 'MFV-723-CMD'], ['FT-714', 'FT-724'], ['WT-716', 'WT-726']],
  segmentSensors: { ...base.segmentSensors, fuline: 'PT-727' },
};
