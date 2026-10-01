/* TS-2 — a pressure-fed bipropellant engine stand. FICTIONAL.

   A nitrogen K-bottle feeds three dome-loaded regulators: one pressurises
   the oxidiser tank, one the fuel tank, one the purge system. Each tank
   feeds its own run line, main valve, turbine flowmeter and injector
   manifold; purge gas reaches each manifold through its own valve and check
   valve. The engine, BPE-1, is an invented 500 N-class research engine with
   an impinging-doublet injector.

   Phase 6 runs it COLD: both tanks hold water (the simulant), the chamber
   is open to the cell, and nothing burns. The propellants BPE-1 is designed
   for — OX-1 and FU-1 — are fictional too; their densities are what
   turns a cold-flow result into a hot-fire prediction.

   Same shape as TS-1: one data file is the stand. */

import { psi, degC, mm, cc, litre, P_STD } from '../../lib/units.js';
import gonogo from './ts2-gonogo.js';
import pid from './ts2-pid.js';
import { interlocks } from './ts2-interlocks.js';
import { predictBiprop } from '../../physics/predict-bp.js';
import { computeMetricsBP } from '../../analysis/metrics-bp.js';

const AMB = { P: P_STD, T: degC(20) };
const g = x => AMB.P + psi(x);

/* Fluids. Water is real; OX-1 and FU-1 are invented, with densities chosen
   to sit where a storable oxidiser and an alcohol fuel would. */
export const FLUIDS = {
  water: { name: 'Water (simulant)', rho: 998 },
  'OX-1': { name: 'OX-1 oxidiser (fictional)', rho: 1140 },
  'FU-1': { name: 'FU-1 fuel (fictional)', rho: 800 },
};

/* The injector as DRAWN: design flow areas, sized for the hot-fire point
   (ṁ_ox 0.130 kg/s OX-1, ṁ_f 0.087 kg/s FU-1, 100 psi injector ΔP). The
   as-built hardware differs — it always does — and finding by how much is
   what a cold flow is for. */
export const DESIGN = {
  CdAox: 3.28e-6, CdAfu: 2.62e-6,
  mdotOx: 0.130, mdotFu: 0.087, MR: 1.50, dPinj: psi(100),
  oxidiser: 'OX-1', fuel: 'FU-1', simulant: 'water',
  throatDia: mm(14.4),
};
const AS_BUILT = { ox: 0.94, fu: 1.03 };

const tankWall = { C: 15000, hA: 8, hAflow: 120, hAamb: 10 };
const small = { C: 300, hA: 0.4, hAflow: 80, hAamb: 1 };

const physics = {
  model: 'biprop',
  gas: 'N2',
  ambient: AMB,
  volumes: [
    { id: 'tank', V: litre(49), P0: g(2400), T0: AMB.T, wall: { C: 30000, hA: 15, hAflow: 200, hAamb: 25 } },
    { id: 'sup', V: cc(40), wall: small },
    { id: 'hp', V: cc(60), wall: small },
    { id: 'oxreg', V: cc(40), wall: small },
    { id: 'fureg', V: cc(40), wall: small },
    { id: 'oxu', V: litre(12), wall: tankWall },          // ox tank ullage (resized by the liquid)
    { id: 'fuu', V: litre(10), wall: tankWall },          // fuel tank ullage
    { id: 'purge', V: cc(30), wall: small },
    { id: 'oxpl', V: cc(10), wall: small },
    { id: 'fupl', V: cc(10), wall: small },
    { id: 'oxman', V: cc(25), wall: small },              // ox injector manifold (gas part)
    { id: 'fuman', V: cc(20), wall: small },              // fuel injector manifold (gas part)
    { id: 'chamber', V: litre(0.4), wall: { C: 3000, hA: 0.5, hAflow: 40, hAamb: 2 } },
  ],
  elements: [
    { id: 'HV-600', type: 'valve', from: 'tank', to: 'sup', CdA: 2.0e-5, normally: 'closed', stroke: 2.5 },
    { id: 'IV-601', type: 'valve', from: 'sup', to: 'hp', CdA: 2.5e-5, normally: 'closed', delay: 0.15, strokeOpen: 0.7, strokeClose: 0.5, char: 'ball' },
    { id: 'VV-601', type: 'valve', from: 'hp', to: 'ambient', CdA: 3.0e-6, normally: 'open', delay: 0.012, stroke: 0.015 },
    { id: 'PR-610', type: 'regulator', from: 'hp', to: 'oxreg', CdA: 3.0e-6, band: psi(40), tau: 0.002, spe: 0.012, PinRef: psi(2400), domeRate: psi(40), domeTau: 0.3 },
    { id: 'CV-611', type: 'check', from: 'oxreg', to: 'oxu', CdA: 2.0e-5, crack: psi(1) },
    { id: 'RV-712', type: 'relief', from: 'oxu', to: 'ambient', CdA: 2.0e-5, set: psi(660), accumulation: 0.1, blowdown: 0.08 },
    { id: 'VV-711', type: 'valve', from: 'oxu', to: 'ambient', CdA: 1.2e-5, normally: 'open', delay: 0.012, stroke: 0.02 },
    { id: 'PR-620', type: 'regulator', from: 'hp', to: 'fureg', CdA: 3.0e-6, band: psi(40), tau: 0.002, spe: 0.012, PinRef: psi(2400), domeRate: psi(40), domeTau: 0.3 },
    { id: 'CV-621', type: 'check', from: 'fureg', to: 'fuu', CdA: 2.0e-5, crack: psi(1) },
    { id: 'RV-722', type: 'relief', from: 'fuu', to: 'ambient', CdA: 2.0e-5, set: psi(660), accumulation: 0.1, blowdown: 0.08 },
    { id: 'VV-721', type: 'valve', from: 'fuu', to: 'ambient', CdA: 1.2e-5, normally: 'open', delay: 0.012, stroke: 0.02 },
    { id: 'PR-630', type: 'regulator', from: 'hp', to: 'purge', CdA: 2.0e-6, band: psi(30), tau: 0.002, spe: 0.012, PinRef: psi(2400), domeRate: psi(40), domeTau: 0.3 },
    { id: 'PV-631', type: 'valve', from: 'purge', to: 'oxpl', CdA: 3.0e-6, normally: 'closed', delay: 0.015, stroke: 0.02 },
    { id: 'CV-633', type: 'check', from: 'oxpl', to: 'oxman', CdA: 1.0e-5, crack: psi(2) },
    { id: 'PV-632', type: 'valve', from: 'purge', to: 'fupl', CdA: 3.0e-6, normally: 'closed', delay: 0.015, stroke: 0.02 },
    { id: 'CV-634', type: 'check', from: 'fupl', to: 'fuman', CdA: 1.0e-5, crack: psi(2) },
    // gas escaping through the injector orifices the liquid has not reached
    // (area driven by the liquid model each step)
    { id: 'INJ-OXG', type: 'orifice', from: 'oxman', to: 'chamber', CdA: 3.6e-6, hidden: true },
    { id: 'INJ-FUG', type: 'orifice', from: 'fuman', to: 'chamber', CdA: 2.9e-6, hidden: true },
    { id: 'NZ-801', type: 'nozzle', from: 'chamber', to: 'ambient',
      nozzle: { throatDia: DESIGN.throatDia, exitDia: mm(28), Cd: 0.98, halfAngleDeg: 15 } },
  ],
  lines: [
    { id: 'ox', fluid: FLUIDS.water, tank: 'oxu', manifold: 'oxman', chamber: 'chamber', gasPath: 'INJ-OXG',
      Vtank: litre(12), Vman: cc(25), inertance: 3.5e4, CdAline: 6.5e-6,
      CdAinj: DESIGN.CdAox * AS_BUILT.ox, CdAinjGas: 3.6e-6,
      valve: { id: 'MOV-713', CdA: 4.0e-5, normally: 'closed', delay: 0.05, strokeOpen: 0.25, strokeClose: 0.2, char: 'ball' } },
    { id: 'fu', fluid: FLUIDS.water, tank: 'fuu', manifold: 'fuman', chamber: 'chamber', gasPath: 'INJ-FUG',
      Vtank: litre(10), Vman: cc(20), inertance: 3.8e4, CdAline: 5.5e-6,
      CdAinj: DESIGN.CdAfu * AS_BUILT.fu, CdAinjGas: 2.9e-6,
      valve: { id: 'MFV-723', CdA: 4.0e-5, normally: 'closed', delay: 0.05, strokeOpen: 0.25, strokeClose: 0.2, char: 'ball' } },
  ],
  nozzleElement: 'NZ-801',
  thrustStand: { fn: 60, zeta: 0.08 },
  // tank scales: zero is set by taring; the flex lines put a pressure tare on them
  scales: { ox: { tarePerPa: 0.030 / psi(100), rhoCal: 998 }, fu: { tarePerPa: 0.025 / psi(100), rhoCal: 998 } },
};

/* ---- instrumentation ------------------------------------------------- */

const PT = (id, sig, desc, fs, extra = {}) => ({
  id, kind: 'PT', quantity: 'pressure', gauge: true, signal: sig, desc,
  range: [0, psi(fs)], noise: psi(fs) * 0.00012, hum: psi(fs) * 0.00008,
  tau: 0.0005, zeroSigma: psi(fs) * 0.0012, bits: 16, ...extra,
});
const TC = (id, sig, desc, tau) => ({
  id, kind: 'TC', quantity: 'temperature', signal: sig, desc,
  range: [degC(-200), degC(1250)], noise: 0.12, hum: 0.05, tau, zeroSigma: 0.35, bits: 16, zeroable: false,
});
const EPC = (id, reg) => ({ id, kind: 'FB', quantity: 'pressure', gauge: true, signal: 'dome:' + reg,
  desc: `${reg} dome pressure (EPC feedback)`, range: [0, psi(1000)], noise: psi(0.08), hum: 0, tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false });
const ZS = (valve, which) => ({ id: `${valve}-${which}`, kind: 'ZS', quantity: 'discrete', signal: `${which.toLowerCase()}:${valve}`,
  desc: `${valve} ${which === 'ZSO' ? 'open' : 'closed'} limit switch` });

const sensors = [
  PT('PT-601', 'Pg:sup', 'Pressurant supply (bottle, downstream of HV-600)', 5000, { zeroSigma: psi(5000) * 0.001 }),
  PT('PT-602', 'Pg:hp', 'Regulator inlet header', 5000, { zeroSigma: psi(5000) * 0.001 }),
  PT('PT-710', 'Pg:oxu', 'Oxidiser tank ullage pressure', 1000),
  PT('PT-720', 'Pg:fuu', 'Fuel tank ullage pressure', 1000),
  PT('PT-630', 'Pg:purge', 'Purge supply pressure', 500),
  PT('PT-713', 'Pgvi:ox', 'Oxidiser main valve inlet', 1000, { tau: 0.0003 }),
  PT('PT-723', 'Pgvi:fu', 'Fuel main valve inlet', 1000, { tau: 0.0003 }),
  PT('PT-715', 'Pg:oxman', 'Oxidiser injector manifold', 1000, { tau: 0.0002 }),
  PT('PT-725', 'Pg:fuman', 'Fuel injector manifold', 1000, { tau: 0.0002 }),
  PT('PT-801', 'Pg:chamber', 'Chamber pressure', 1000, { tau: 0.0002 }),
  /* Turbine meters: volume flow, converted to mass by the DAQ with the
     density they were set up for (water). τ ≈ 20 ms rotor lag. */
  { id: 'FT-714', kind: 'FM', quantity: 'massflow', signal: 'Qm:ox', desc: 'Oxidiser flow (turbine meter, water-calibrated)',
    range: [0, 0.40], noise: 0.0004, hum: 0, tau: 0.02, zeroSigma: 0.0003, bits: 16, zeroable: false },
  { id: 'FT-724', kind: 'FM', quantity: 'massflow', signal: 'Qm:fu', desc: 'Fuel flow (turbine meter, water-calibrated)',
    range: [0, 0.40], noise: 0.0004, hum: 0, tau: 0.02, zeroSigma: 0.0003, bits: 16, zeroable: false },
  /* Tank weigh scales: the independent flow measurement. Slow and noisy,
     but they weigh what actually left. */
  { id: 'WT-716', kind: 'WT', quantity: 'mass', signal: 'W:ox', desc: 'Oxidiser tank weight (load cells)',
    range: [-5, 25], noise: 0.004, hum: 0.002, tau: 0.05, zeroSigma: 0.15, bits: 24 },
  { id: 'WT-726', kind: 'WT', quantity: 'mass', signal: 'W:fu', desc: 'Fuel tank weight (load cells)',
    range: [-5, 25], noise: 0.004, hum: 0.002, tau: 0.05, zeroSigma: 0.15, bits: 24 },
  TC('TC-717', 'Tl:ox', 'Oxidiser liquid temperature', 2.0),
  TC('TC-727', 'Tl:fu', 'Fuel liquid temperature', 2.0),
  TC('TC-601', 'Tw:tank', 'Pressurant bottle skin temperature', 4.0),
  { id: 'LC-901', kind: 'LC', quantity: 'force', signal: 'F:stand', desc: 'Engine thrust load cell',
    range: [-1000, 1000], noise: 0.08, hum: 0.05, tau: 0, zeroSigma: 1.5, bits: 24, shuntCal: 500 },
  EPC('EPC-610', 'PR-610'), EPC('EPC-620', 'PR-620'), EPC('EPC-630', 'PR-630'),
  ZS('IV-601', 'ZSO'), ZS('IV-601', 'ZSC'),
  ZS('MOV-713', 'ZSO'), ZS('MOV-713', 'ZSC'),
  ZS('MFV-723', 'ZSO'), ZS('MFV-723', 'ZSC'),
];

const RHO_SIM = FLUIDS.water.rho;
const safeDiv = (a, b) => (Math.abs(b) > 0.005 ? a / b : 0);
const channels = {
  commands: [
    { id: 'MOV-713-CMD', target: 'MOV-713', desc: 'Oxidiser main valve command' },
    { id: 'MFV-723-CMD', target: 'MFV-723', desc: 'Fuel main valve command' },
    { id: 'PV-631-CMD', target: 'PV-631', desc: 'Oxidiser-side purge command' },
    { id: 'PV-632-CMD', target: 'PV-632', desc: 'Fuel-side purge command' },
    { id: 'IV-601-CMD', target: 'IV-601', desc: 'Pressurant isolation command' },
    { id: 'VV-711-CMD', target: 'VV-711', desc: 'Oxidiser tank vent command (1 = open)' },
    { id: 'VV-721-CMD', target: 'VV-721', desc: 'Fuel tank vent command (1 = open)' },
  ],
  derived: [
    { id: 'DP-OXI', quantity: 'pressure', gauge: false, desc: 'Oxidiser injector ΔP (PT-715 − PT-801)', inputs: ['PT-715', 'PT-801'], fn: ([a, b]) => a - b },
    { id: 'DP-FUI', quantity: 'pressure', gauge: false, desc: 'Fuel injector ΔP (PT-725 − PT-801)', inputs: ['PT-725', 'PT-801'], fn: ([a, b]) => a - b },
    { id: 'DP-OXL', quantity: 'pressure', gauge: false, desc: 'Oxidiser feed-line ΔP (PT-710 − PT-715)', inputs: ['PT-710', 'PT-715'], fn: ([a, b]) => a - b },
    { id: 'DP-FUL', quantity: 'pressure', gauge: false, desc: 'Fuel feed-line ΔP (PT-720 − PT-725)', inputs: ['PT-720', 'PT-725'], fn: ([a, b]) => a - b },
    { id: 'MR-C', quantity: 'ratio', desc: 'Mixture ratio, FT-714 / FT-724 (as measured)', inputs: ['FT-714', 'FT-724'], fn: ([o, f]) => safeDiv(o, f) },
    /* Flow coefficient of each injector side, from the flowmeter and the
       injector ΔP, assuming the SIMULANT density. Valid in steady cold flow
       only; meaningless while the manifold is priming. */
    { id: 'CDA-OX', quantity: 'area', desc: 'Oxidiser injector CdA, FT-714 / √(2ρΔP), water', inputs: ['FT-714', 'DP-OXI'],
      fn: ([m, dp]) => (dp > 6894.757 * 5 && m > 0.01 ? m / Math.sqrt(2 * RHO_SIM * dp) : 0) },
    { id: 'CDA-FU', quantity: 'area', desc: 'Fuel injector CdA, FT-724 / √(2ρΔP), water', inputs: ['FT-724', 'DP-FUI'],
      fn: ([m, dp]) => (dp > 6894.757 * 5 && m > 0.01 ? m / Math.sqrt(2 * RHO_SIM * dp) : 0) },
  ],
};

/* ---- components ------------------------------------------------------- */
const V = (tag, name, kind, specs, text, extra = {}) => ({ tag, name, kind, specs, text, ...extra });
const components = {
  'N2-K': V('N₂ SUPPLY', 'Nitrogen K-bottle (pressurant)', 'Pressurant source',
    { 'Water volume': '49 L', 'Fill at start of day': '≈2400 psig (per tag)' },
    'Pressurant for both tanks and the purge system. It blows down as the tanks are pressurised and as liquid leaves them — the ullage it must fill grows with every kilogram delivered.', { ref: ['blowdown', 'pressure-fed'] }),
  'HV-600': V('HV-600', 'Bottle hand valve', 'Manual valve', { 'Operation': 'Manual, in-cell only' },
    'The cylinder valve; a technician task.', { commandable: 'tech' }),
  'IV-601': V('IV-601', 'Pressurant isolation valve', 'Pneumatic ball valve, normally closed',
    { 'Fail position': 'CLOSED', 'Indication': 'ZSO / ZSC' }, 'Isolates the pressurant from all three regulators. Its indication is from limit switches.', { commandable: 'remote' }),
  'VV-601': V('VV-601', 'Pressurant header vent', 'Solenoid vent, normally OPEN', { 'Fail position': 'OPEN' },
    'Vents the regulator inlet header. The only way out for the gas trapped between IV-601 and three shut regulators.', { commandable: 'remote' }),
  'PR-610': V('PR-610', 'Oxidiser tank pressure regulator', 'Dome-loaded regulator', { 'Dome': 'EPC-610', 'Type': 'Non-relieving' },
    'Holds the oxidiser tank ullage at its setpoint as liquid leaves. A pressure-fed engine\'s feed pressure is this regulator — droop here is flow lost at the injector.', { commandable: 'setpoint' }),
  'PR-620': V('PR-620', 'Fuel tank pressure regulator', 'Dome-loaded regulator', { 'Dome': 'EPC-620', 'Type': 'Non-relieving' },
    'Holds the fuel tank ullage at its setpoint.', { commandable: 'setpoint' }),
  'PR-630': V('PR-630', 'Purge regulator', 'Dome-loaded regulator', { 'Dome': 'EPC-630', 'Typical setting': '150 psig' },
    'Sets the purge pressure. Purge must be ABOVE the manifold pressure it is meant to clear, and must be available before anything is armed.', { commandable: 'setpoint' }),
  'CV-611': V('CV-611', 'Ox pressurant check valve', 'Spring check valve', { 'Cracking': '≈1 psid' },
    'Stops oxidiser vapour or liquid reaching the regulator and, through the header, the fuel side.'),
  'CV-621': V('CV-621', 'Fuel pressurant check valve', 'Spring check valve', { 'Cracking': '≈1 psid' }, 'The fuel side\'s equivalent of CV-611.'),
  'T-710': V('T-710', 'Oxidiser run tank', 'Pressure vessel', { 'Volume': '12 L', 'MEOP': '600 psig', 'Relief': 'RV-712 at 660 psig', 'Load': 'water (simulant) in phase 6' },
    'Weighed by WT-716. Load it vented; pressurise it closed. As liquid leaves, the ullage grows and the regulator must fill it.', { ref: ['ullage', 'pressure-fed'] }),
  'T-720': V('T-720', 'Fuel run tank', 'Pressure vessel', { 'Volume': '10 L', 'MEOP': '600 psig', 'Relief': 'RV-722 at 660 psig', 'Load': 'water (simulant) in phase 6' },
    'Weighed by WT-726.', { ref: ['ullage', 'pressure-fed'] }),
  'VV-711': V('VV-711', 'Oxidiser tank vent', 'Solenoid vent, normally OPEN', { 'Fail position': 'OPEN (vents)' }, 'Vents the ox tank ullage. Open to load the tank, closed to pressurise it.', { commandable: 'remote' }),
  'VV-721': V('VV-721', 'Fuel tank vent', 'Solenoid vent, normally OPEN', { 'Fail position': 'OPEN (vents)' }, 'Vents the fuel tank ullage.', { commandable: 'remote' }),
  'RV-712': V('RV-712', 'Ox tank relief', 'Spring relief', { 'Set': '660 psig' }, 'Last line of defence for the tank.'),
  'RV-722': V('RV-722', 'Fuel tank relief', 'Spring relief', { 'Set': '660 psig' }, 'Last line of defence for the tank.'),
  'MOV-713': V('MOV-713', 'Main oxidiser valve', 'Pneumatic ball valve, normally closed',
    { 'Stroke': '≈0.25 s open / 0.20 s close', 'Indication': 'ZSO / ZSC', 'Operated by': 'the sequencer' },
    'Starts and stops oxidiser flow. Its speed matters: open slowly and priming is slow; close fast and the decelerating liquid column hammers the valve inlet (PT-713).', { ref: ['water-hammer', 'priming'] }),
  'MFV-723': V('MFV-723', 'Main fuel valve', 'Pneumatic ball valve, normally closed',
    { 'Stroke': '≈0.25 s open / 0.20 s close', 'Indication': 'ZSO / ZSC', 'Operated by': 'the sequencer' },
    'Starts and stops fuel flow. Which main valve opens first — the lead — is one of the most consequential numbers in a hot-fire sequence.', { ref: ['water-hammer', 'priming'] }),
  'PV-631': V('PV-631', 'Oxidiser-side purge valve', 'Solenoid valve, normally closed', {}, 'Purges the oxidiser manifold through CV-633. Before flow it keeps the manifold clear; after flow it pushes out what is left.', { commandable: 'remote', ref: ['purge'] }),
  'PV-632': V('PV-632', 'Fuel-side purge valve', 'Solenoid valve, normally closed', {}, 'Purges the fuel manifold through CV-634.', { commandable: 'remote', ref: ['purge'] }),
  'CV-633': V('CV-633', 'Ox purge check valve', 'Spring check valve', { 'Cracking': '≈2 psid' }, 'Keeps oxidiser out of the purge system when the manifold is full and the purge is off.'),
  'CV-634': V('CV-634', 'Fuel purge check valve', 'Spring check valve', { 'Cracking': '≈2 psid' }, 'Keeps fuel out of the purge system — and so out of the oxidiser side.'),
  'BPE-1': V('BPE-1', 'Bipropellant research engine (fictional)', 'Test article', {
      'Injector': 'Impinging doublets', 'Design point (hot)': 'OX-1 0.130 kg/s, FU-1 0.087 kg/s, MR 1.50',
      'Design injector ΔP': '100 psi', 'Ox injector CdA (drawing)': '3.28 mm²', 'Fuel injector CdA (drawing)': '2.62 mm²', 'Throat': 'Ø 14.4 mm' },
    'In phase 6 it is flowed cold: water through both sides, the chamber open to the cell. The flow coefficients on its drawing are estimates; the cold flow measures the real ones.', { ref: ['injector', 'mixture-ratio', 'cold-flow'] }),
  'LC-901': V('LC-901', 'Engine thrust load cell', '±1000 N load cell', { 'Shunt cal': '500 N' },
    'Sized for hot fire. In cold flow it sees only the momentum of the water jets — a few newtons in a 1000 N cell.'),
};
const componentSensors = {
  'N2-K': ['TC-601'], 'HV-600': ['PT-601'], 'IV-601': ['IV-601-ZSO', 'IV-601-ZSC', 'PT-601', 'PT-602'], 'VV-601': ['PT-602'],
  'PR-610': ['PT-602', 'PT-710', 'EPC-610'], 'PR-620': ['PT-602', 'PT-720', 'EPC-620'], 'PR-630': ['PT-602', 'PT-630', 'EPC-630'],
  'T-710': ['PT-710', 'WT-716', 'TC-717'], 'T-720': ['PT-720', 'WT-726', 'TC-727'], 'VV-711': ['PT-710'], 'VV-721': ['PT-720'],
  'MOV-713': ['MOV-713-ZSO', 'MOV-713-ZSC', 'PT-713', 'PT-715', 'FT-714'], 'MFV-723': ['MFV-723-ZSO', 'MFV-723-ZSC', 'PT-723', 'PT-725', 'FT-724'],
  'PV-631': ['PT-630', 'PT-715'], 'PV-632': ['PT-630', 'PT-725'], 'BPE-1': ['PT-715', 'PT-725', 'PT-801', 'DP-OXI', 'DP-FUI', 'CDA-OX', 'CDA-FU', 'MR-C'],
  'LC-901': ['LC-901'],
};

/* ---- limits --------------------------------------------------------- */
const limits = [
  { id: 'PT601-LO', channel: 'PT-601', lo: psi(1000), level: 'caution', persist: 1.0, when: c => c.armed, text: 'Pressurant supply low for test' },
  { id: 'PT710-HI', channel: 'PT-710', hi: c => c.sp['PR-610'] + psi(25), level: 'caution', persist: 1.0, when: c => c.sp['PR-610'] > psi(20), text: 'Oxidiser tank above setpoint' },
  { id: 'PT720-HI', channel: 'PT-720', hi: c => c.sp['PR-620'] + psi(25), level: 'caution', persist: 1.0, when: c => c.sp['PR-620'] > psi(20), text: 'Fuel tank above setpoint' },
  { id: 'PT710-RL', channel: 'PT-710', hi: psi(620), level: 'redline', action: 'abort', persist: 0.05, text: 'oxidiser tank overpressure' },
  { id: 'PT720-RL', channel: 'PT-720', hi: psi(620), level: 'redline', action: 'abort', persist: 0.05, text: 'fuel tank overpressure' },
  { id: 'PT630-LO', channel: 'PT-630', lo: psi(100), level: 'warning', persist: 0.5, when: c => c.armed || c.seqActive, text: 'Purge pressure low — purge not available' },
  { id: 'WT716-LO', channel: 'WT-716', lo: 0.8, level: 'redline', action: 'abort', persist: 0.2, when: c => c.burning && c.cmd['MOV-713'] === 1, text: 'oxidiser tank nearly empty' },
  { id: 'WT726-LO', channel: 'WT-726', lo: 0.8, level: 'redline', action: 'abort', persist: 0.2, when: c => c.burning && c.cmd['MFV-723'] === 1, text: 'fuel tank nearly empty' },
  { id: 'PT715-LO', channel: 'PT-715', lo: c => 0.4 * c.predDpOx, level: 'warning', persist: 0.3,
    when: c => c.burning && c.cmd['MOV-713'] === 1 && c.Tburn > 1.0 && c.predDpOx > 0, text: 'Oxidiser manifold pressure low during flow' },
  { id: 'PT725-LO', channel: 'PT-725', lo: c => 0.4 * c.predDpFu, level: 'warning', persist: 0.3,
    when: c => c.burning && c.cmd['MFV-723'] === 1 && c.Tburn > 1.0 && c.predDpFu > 0, text: 'Fuel manifold pressure low during flow' },
  { id: 'PT801-RL', channel: 'PT-801', hi: psi(60), level: 'redline', action: 'abort', persist: 0.05, text: 'chamber pressure in a cold-flow test' },
  { id: 'FT714-DEV', channel: 'FT-714', lo: c => 0.8 * c.predOx, hi: c => 1.2 * c.predOx, level: 'caution', persist: 0.3,
    when: c => c.burning && c.cmd['MOV-713'] === 1 && c.Tburn > 1.0 && c.predOx > 0.02, text: 'Oxidiser flow out of family (±20 % of prediction)' },
  { id: 'FT724-DEV', channel: 'FT-724', lo: c => 0.8 * c.predFu, hi: c => 1.2 * c.predFu, level: 'caution', persist: 0.3,
    when: c => c.burning && c.cmd['MFV-723'] === 1 && c.Tburn > 1.0 && c.predFu > 0.02, text: 'Fuel flow out of family (±20 % of prediction)' },
];

/* Abort: stop both propellants, purge both manifolds, take the tanks off
   pressure and vent them. The purge stays on for five seconds; nothing is
   left sitting in a manifold. */
const abortSequence = [
  { at: 0.00, id: 'MOV-713', value: 0, text: 'MOV-713 main oxidiser valve CLOSE' },
  { at: 0.00, id: 'MFV-723', value: 0, text: 'MFV-723 main fuel valve CLOSE' },
  { at: 0.05, id: 'PV-631', value: 1, text: 'PV-631 oxidiser-side purge OPEN' },
  { at: 0.05, id: 'PV-632', value: 1, text: 'PV-632 fuel-side purge OPEN' },
  { at: 0.10, id: 'PR-610', value: 0, text: 'PR-610 ox tank regulator → 0' },
  { at: 0.10, id: 'PR-620', value: 0, text: 'PR-620 fuel tank regulator → 0' },
  { at: 1.00, id: 'VV-711', value: 1, text: 'VV-711 ox tank vent OPEN' },
  { at: 1.00, id: 'VV-721', value: 1, text: 'VV-721 fuel tank vent OPEN' },
  { at: 1.30, id: 'DISARM', value: 0, text: 'Fire circuit DISARM' },
  { at: 5.00, id: 'PV-631', value: 0, text: 'PV-631 purge CLOSE' },
  { at: 5.00, id: 'PV-632', value: 0, text: 'PV-632 purge CLOSE' },
];

const ratings = {
  TANK_MEOP: psi(600), RELIEF_TANK: psi(660), MAWP_TANK: psi(750),
  PERSONNEL_MAX: psi(50), REG_MAX_CMD: psi(620), PURGE_MIN: psi(100), PURGE_MAX: psi(300),
  SUPPLY_MIN: psi(1000), VENTED: psi(3), MAX_BURN: 30, TANK_RESERVE: 1.5,
  FILL_OX: 10.0, FILL_FU: 8.0,
};

/* The sequence a cold-flow (later: hot-fire) plan turns into. T is
   relative to T-0. `lead` > 0 opens the oxidiser first. Purge is on until
   the main valves open and comes back on as they close. */
function sequence(p) {
  const ev = [], ox = p.sides !== 'fuel', fu = p.sides !== 'ox';
  const lead = ox && fu ? (p.lead ?? 0) : 0;
  const tOx = Math.max(0, -lead), tFu = Math.max(0, lead), dur = p.duration;
  if (ox) ev.push({ T: tOx, id: 'PV-631', v: 0, why: 'purge off' }, { T: tOx, id: 'MOV-713', v: 1, why: 'T-0 ox', main: true });
  if (fu) ev.push({ T: tFu, id: 'PV-632', v: 0, why: 'purge off' }, { T: tFu, id: 'MFV-723', v: 1, why: 'T-0 fuel', main: true });
  // shutdown in the reverse order of opening, by the same lead
  const end = Math.max(tOx, tFu) + dur;
  if (ox) ev.push({ T: end + tFu, id: 'MOV-713', v: 0, why: 'end of flow', main: true }, { T: end + tFu + 0.05, id: 'PV-631', v: 1, why: 'post-purge' });
  if (fu) ev.push({ T: end + tOx, id: 'MFV-723', v: 0, why: 'end of flow', main: true }, { T: end + tOx + 0.05, id: 'PV-632', v: 1, why: 'post-purge' });
  const tp = end + Math.abs(lead) + 0.05 + (p.postPurge ?? 3);
  if (ox) ev.push({ T: tp, id: 'PV-631', v: 0, why: 'post-purge end' });
  if (fu) ev.push({ T: tp, id: 'PV-632', v: 0, why: 'post-purge end' });
  return ev.sort((a, b) => a.T - b.T);
}
function planText(p) {
  const sides = p.sides === 'ox' ? 'oxidiser side only' : p.sides === 'fuel' ? 'fuel side only' : 'both sides';
  const lead = p.sides === 'both' || !p.sides ? `, ${(p.lead ?? 0) >= 0 ? 'ox' : 'fuel'} lead ${Math.abs(Math.round((p.lead ?? 0) * 1000))} ms` : '';
  return `cold flow, ${sides}, ${p.duration.toFixed(2)} s${lead}, post-purge ${(p.postPurge ?? 3).toFixed(0)} s`;
}

export default {
  id: 'TS-2',
  program: 'biprop',
  name: 'TS-2 Bipropellant Engine Stand',
  short: 'TS-2 · pressure-fed biprop',
  article: 'BPE-1 S/N 001 · cold-flow configuration',
  fictional: true,
  physics, sensors, channels, components, componentSensors, limits, abortSequence, ratings, gonogo, pid,
  interlocks,
  faults: [],
  inspections: [],
  nominal: { throatDia: DESIGN.throatDia, Cd: 0.98 },
  design: DESIGN,
  fluids: FLUIDS,
  segmentSensors: { sup: 'PT-601', hp: 'PT-602', oxreg: 'PT-710', fureg: 'PT-720', oxu: 'PT-710', fuu: 'PT-720', purge: 'PT-630',
    oxpl: 'PT-630', fupl: 'PT-630', oxman: 'PT-715', fuman: 'PT-725', chamber: 'PT-801', oxline: 'PT-713', fuline: 'PT-723' },
  consoleValves: [
    { id: 'IV-601', label: 'IV-601 Pressurant isolation', kind: 'remote' },
    { id: 'VV-601', label: 'VV-601 Header vent', kind: 'remote', vent: true },
    { id: 'VV-711', label: 'VV-711 Ox tank vent', kind: 'remote', vent: true },
    { id: 'VV-721', label: 'VV-721 Fuel tank vent', kind: 'remote', vent: true },
    { id: 'PV-631', label: 'PV-631 Ox-side purge', kind: 'remote' },
    { id: 'PV-632', label: 'PV-632 Fuel-side purge', kind: 'remote' },
    { id: 'HV-600', label: 'HV-600 Bottle valve', kind: 'tech' },
  ],
  indications: [
    { valve: 'IV-601', zso: 'IV-601-ZSO', zsc: 'IV-601-ZSC', timeout: 2.0 },
    { valve: 'MOV-713', zso: 'MOV-713-ZSO', zsc: 'MOV-713-ZSC', timeout: 1.0 },
    { valve: 'MFV-723', zso: 'MFV-723-ZSO', zsc: 'MFV-723-ZSC', timeout: 1.0 },
  ],
  regulator: 'PR-610',
  regulators: [
    { id: 'PR-610', label: 'Ox tank (PR-610)', epc: 'EPC-610', out: 'PT-710', vent: 'VV-711' },
    { id: 'PR-620', label: 'Fuel tank (PR-620)', epc: 'EPC-620', out: 'PT-720', vent: 'VV-721' },
    { id: 'PR-630', label: 'Purge (PR-630)', epc: 'EPC-630', out: 'PT-630' },
  ],
  supplyIso: 'IV-601',
  supplyChannel: 'PT-601',
  mainValves: ['MOV-713', 'MFV-723'],
  sequencedValves: ['MOV-713', 'MFV-723', 'PV-631', 'PV-632'],
  loadCell: 'LC-901',
  tareIds: ['LC-901', 'WT-716', 'WT-726'],
  lpChannels: ['PT-602', 'PT-710', 'PT-720', 'PT-630', 'PT-715', 'PT-725'],
  ventElements: ['VV-601', 'VV-711', 'VV-721', 'RV-712', 'RV-722'],
  pneumaticValves: ['IV-601', 'MOV-713', 'MFV-723'],
  bottle: { valve: 'HV-600', volume: 'tank' },
  text: {
    walkdown: 'Walkdown complete: both run tanks secured, flex lines supported, fittings torque-striped, purge and pressurant check valves installed in the right direction, catch area under the engine clear, load-cell cables secured.',
    inspect: () => 'Post-test visual: engine and injector face intact, water in the catch area, no leaks at the main valves or flowmeters, purge lines secure.',
  },
  defaultPlan: { mode: 'single', duration: 3.0, sides: 'both', lead: 0.1, postPurge: 3 },
  sequence, planText,
  predict: predictBiprop,
  metrics: computeMetricsBP,
  alarmCtx(S, base) {
    const c = S.controller, p = S.prediction || {};
    return { ...base, sp: c.sp, cmd: c.cmd,
      predOx: p.mdotOx || 0, predFu: p.mdotFu || 0, predDpOx: p.dPox || 0, predDpFu: p.dPfu || 0 };
  },
  /* Technician tasks only this stand has. */
  techTasks(ctrl) {
    const S = ctrl.s, m = S.model, R = ratings;
    const fill = (load) => ({ dur: 60, text: load ? 'Loading both run tanks with water' : 'Draining both run tanks', pre: () => {
      const hi = ['oxu', 'fuu'].map(v => m.net.vol(v).P - S.def.physics.ambient.P);
      if (hi.some(p => p > R.VENTED)) return 'Technician: "Tank gauges show pressure. Vent both tanks before I open a fill port."';
      if (ctrl.cmd['VV-711'] !== 1 || ctrl.cmd['VV-721'] !== 1) return 'Technician: "Both tank vents must be open while I fill — the gas has to go somewhere."';
      return null;
    }, done: () => {
      m.line('ox').setLiquid(m.net, load ? R.FILL_OX : 0);
      m.line('fu').setLiquid(m.net, load ? R.FILL_FU : 0);
      ctrl.bump();
      ctrl.log('TECH', load ? `Tanks loaded with water: about ${R.FILL_OX.toFixed(0)} kg in T-710, ${R.FILL_FU.toFixed(0)} kg in T-720 (sight-glass estimate). Fill ports capped.` : 'Tanks drained; fill ports capped.');
    } });
    return { fillTanks: fill(true), drainTanks: fill(false) };
  },
  inspectionVolumes: ['hp', 'oxu', 'fuu', 'purge', 'oxman', 'fuman'],
  /* Leak check: both tanks pressurised and isolated (pressurant shut off,
     all three regulators at zero, vents shut), 60 s hold. A 12-litre ullage
     hides a small leak far better than TS-1's few cubic centimetres: the
     limit is tighter in psi/min for the same reason. */
  leak: {
    pre: v => (v.cmd('IV-601') === 0 && ['PR-610', 'PR-620', 'PR-630'].every(id => v.sp[id] === 0)
      && ['VV-601', 'VV-711', 'VV-721', 'PV-631', 'PV-632'].every(id => v.cmd(id) === (id === 'VV-601' ? 1 : 0))
      && v.ch('PT-710') > psi(40) && v.ch('PT-720') > psi(40))
      ? { ok: true } : { ok: false, msg: 'Isolate first: IV-601 closed and VV-601 open, all three regulators at 0, tank vents and purges closed, both tanks above 40 psig.' },
    eval: v => {
      const a = v.stats('PT-710', 50), b = v.stats('PT-720', 50);
      const ra = a ? a.slope * 60 / psi(1) : NaN, rb = b ? b.slope * 60 / psi(1) : NaN;
      const ok = ra > -0.5 && rb > -0.5;
      return { value: Math.min(a?.slope ?? NaN, b?.slope ?? NaN), ok,
        msg: `ox tank ${ra.toFixed(2)}, fuel tank ${rb.toFixed(2)} psi/min — ${ok ? 'within limit' : 'EXCEEDS 0.5 psi/min limit'}` };
    },
  },
};
