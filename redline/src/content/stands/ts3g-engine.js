/* TS-3G — TS-3 rebuilt as an engine stand: BPE-3, a gas-generator cycle
   engine on TPA-1. FICTIONAL.

   The turbopump that was spun on water and cold nitrogen in Levels 18–23
   now feeds an engine. Its pumps take LOX and ethanol from low-pressure run
   tanks and push them, at several hundred psi, into the main injector —
   and through two small taps into the GAS GENERATOR, a fuel-rich burner
   whose 850 K gas drives the turbine and leaves through the exhaust duct.
   The loop closes on itself: the gas generator's flow depends on the
   pumps' pressure, which depends on the turbine's power, which depends on
   the gas generator. To start it, the turbine is spun on nitrogen (the
   START GAS) until the pumps make enough pressure to light both chambers;
   then the start gas is shut and the engine runs on its own — BOOTSTRAP.
   Get the timing wrong and it hangs short of mainstage, or overspeeds.

   Physics: ts3g-physics.js, physics/combustion.js (both chambers),
   physics/liquid.js (pumps and taps), physics/turbopump.js; the steady
   operating point: physics/predict-gg.js. This file is the stand. */

import { psi, degC, P_STD } from '../../lib/units.js';
import { physics, FLUIDS_G, DESIGN_G, AS_BUILT_G, AMB } from './ts3g-physics.js';
import { TPA } from './ts3-physics.js';
import gonogo from './ts3g-gonogo.js';
import pid from './ts3g-pid.js';
import { interlocks } from './ts3g-interlocks.js';
import { steadyGG } from '../../physics/predict-gg.js';
import { MR_STOICH } from '../../physics/propellants.js';
import { computeMetricsGG } from '../../analysis/metrics-gg.js';
import { FAULTS, DIAGNOSIS } from '../faults/ts3g-faults.js';
import { INSPECTIONS } from '../faults/ts3g-inspections.js';

const G0 = 9.80665;
const ND = TPA.Nd;
const At0 = Math.PI / 4 * DESIGN_G.throatDia ** 2;

/* ---- instrumentation ------------------------------------------------- */
const PT = (id, sig, desc, fs, extra = {}) => ({
  id, kind: 'PT', quantity: 'pressure', gauge: true, signal: sig, desc,
  range: [0, psi(fs)], noise: psi(fs) * 0.00012, hum: psi(fs) * 0.00008,
  tau: 0.0005, zeroSigma: psi(fs) * 0.0012, bits: 16, ...extra,
});
const TC = (id, sig, desc, tau, extra = {}) => ({
  id, kind: 'TC', quantity: 'temperature', signal: sig, desc,
  range: [degC(-200), degC(1250)], noise: 0.12, hum: 0.05, tau, zeroSigma: 0.35, bits: 16, zeroable: false, ...extra,
});
const EPC = (id, reg, fs = 600) => ({ id, kind: 'FB', quantity: 'pressure', gauge: true, signal: 'dome:' + reg,
  desc: `${reg} dome pressure (EPC feedback)`, range: [0, psi(fs)], noise: psi(0.05), hum: 0, tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false });
const ZS = (valve, which) => ({ id: `${valve}-${which}`, kind: 'ZS', quantity: 'discrete', signal: `${which.toLowerCase()}:${valve}`,
  desc: `${valve} ${which === 'ZSO' ? 'open' : 'closed'} limit switch` });
const SE = (id, desc) => ({ id, kind: 'SE', quantity: 'speed', signal: 'N:tp', desc,
  range: [0, 60000], noise: 6, hum: 0, tau: 0.004, zeroSigma: 0, bits: 16, zeroable: false });

const sensors = [
  PT('PT-301', 'Pg:sup', 'GN₂ bank pressure (downstream of HV-300)', 5000, { zeroSigma: psi(5000) * 0.001 }),
  PT('PT-302', 'Pg:hp', 'Supply header (regulator inlets)', 5000, { zeroSigma: psi(5000) * 0.001 }),
  PT('PT-410', 'Pg:oxu', 'Oxidiser tank ullage pressure', 300),
  PT('PT-420', 'Pg:fuu', 'Fuel tank ullage pressure', 300),
  PT('PT-413', 'Pgin:ox', 'Ox pump inlet', 300, { tau: 0.0003 }),
  PT('PT-423', 'Pgin:fu', 'Fuel pump inlet', 300, { tau: 0.0003 }),
  PT('PT-414', 'Pgd:ox', 'Ox pump discharge', 1500, { tau: 0.0003 }),
  PT('PT-424', 'Pgd:fu', 'Fuel pump discharge', 1500, { tau: 0.0003 }),
  PT('PT-415', 'Pg:oxman', 'Main oxidiser injector manifold', 1500, { tau: 0.0002 }),
  PT('PT-425', 'Pg:fuman', 'Main fuel injector manifold', 1500, { tau: 0.0002 }),
  PT('PT-501', 'Pg:chamber', 'Main chamber pressure', 1000, { tau: 0.0002 }),
  PT('PT-333', 'Pg:gg', 'Gas generator / turbine inlet pressure', 1000, { tau: 0.0002 }),
  PT('PT-336', 'Pg:treg', 'Start gas regulator outlet (upstream of TSV-332)', 1000),
  PT('PT-630', 'Pg:purge', 'Purge supply pressure', 500),
  /* Turbine meters on the main lines, downstream of the GG taps: they see
     what goes to the main injector, not what the pumps make. */
  { id: 'FT-416', kind: 'FM', quantity: 'massflow', signal: 'Qm:ox', desc: 'Main oxidiser flow (turbine meter)',
    range: [0, 1.2], noise: 0.0012, hum: 0, tau: 0.02, zeroSigma: 0.0008, bits: 16, zeroable: false },
  { id: 'FT-426', kind: 'FM', quantity: 'massflow', signal: 'Qm:fu', desc: 'Main fuel flow (turbine meter)',
    range: [0, 1.2], noise: 0.0012, hum: 0, tau: 0.02, zeroSigma: 0.0008, bits: 16, zeroable: false },
  { id: 'WT-411', kind: 'WT', quantity: 'mass', signal: 'W:ox', desc: 'Oxidiser tank weight (load cells)',
    range: [-5, 90], noise: 0.01, hum: 0.005, tau: 0.05, zeroSigma: 0.3, bits: 24 },
  { id: 'WT-421', kind: 'WT', quantity: 'mass', signal: 'W:fu', desc: 'Fuel tank weight (load cells)',
    range: [-5, 90], noise: 0.01, hum: 0.005, tau: 0.05, zeroSigma: 0.3, bits: 24 },
  TC('TT-412', 'Tl:ox', 'Oxidiser temperature (tank)', 2.0),
  TC('TT-422', 'Tl:fu', 'Fuel temperature (tank)', 2.0),
  TC('TT-415', 'Tc:ox', 'Ox pump discharge temperature', 0.5),
  TC('TT-425', 'Tc:fu', 'Fuel pump discharge temperature', 0.5),
  /* The turbine inlet temperature — the gas generator's redline. A fast
     bare-bead thermocouple in the turbine manifold. */
  TC('TT-334', 'Tg:gg', 'Turbine inlet gas temperature (GG outlet)', 0.08),
  TC('TT-335', 'T:texh', 'Turbine exhaust gas temperature', 0.3),
  TC('TC-343', 'Tb:pb', 'Pump-end bearing outer race temperature', 1.0),
  TC('TC-344', 'Tb:tb', 'Turbine-end bearing outer race temperature', 1.0),
  TC('TC-301', 'Tw:bank', 'Bottle bank skin temperature', 4.0),
  /* The ablative chamber's case: the liner insulates it, so it warms late
     in a long burn, and keeps warming for a while after. */
  TC('TC-503', 'Tw:ch', 'Main chamber case temperature (throat plane)', 1.5),
  SE('SE-341', 'Shaft speed, magnetic pickup A'),
  SE('SE-342', 'Shaft speed, magnetic pickup B'),
  { id: 'VIB-345', kind: 'ACC', quantity: 'accel', signal: 'vib:tp', desc: 'TPA housing vibration (accelerometer, RMS converter)',
    range: [0, 50], noise: 0.03, hum: 0, tau: 0.05, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'VIB-505', kind: 'ACC', quantity: 'accel', signal: 'vib', desc: 'Main chamber vibration (accelerometer, RMS converter)',
    range: [0, 100], noise: 0.03, hum: 0, tau: 0.05, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'OD-504', kind: 'OD', quantity: 'voltage', signal: 'flame', desc: 'Main chamber flame detector (photodiode up the nozzle)',
    range: [0, 10], noise: 0.02, hum: 0.01, tau: 0.002, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'IGN-I', kind: 'I', quantity: 'current', signal: 'I:IGN', desc: 'Main igniter exciter current',
    range: [0, 3], noise: 0.01, hum: 0, tau: 0.001, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'IGG-I', kind: 'I', quantity: 'current', signal: 'I:GGIGN', desc: 'Gas generator igniter exciter current',
    range: [0, 3], noise: 0.01, hum: 0, tau: 0.001, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'ZT-417', kind: 'ZT', quantity: 'ratio', signal: 'thr:GCV-417', desc: 'GCV-417 GG oxidiser throttle position (0–1)',
    range: [0, 1], noise: 0.0008, hum: 0, tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'ZT-427', kind: 'ZT', quantity: 'ratio', signal: 'thr:GCV-427', desc: 'GCV-427 GG fuel throttle position (0–1)',
    range: [0, 1], noise: 0.0008, hum: 0, tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'LC-501', kind: 'LC', quantity: 'force', signal: 'F:stand', desc: 'Engine thrust load cell',
    range: [-1000, 4000], noise: 0.25, hum: 0.15, tau: 0, zeroSigma: 4, bits: 24, shuntCal: 2000 },
  EPC('EPC-410', 'PR-410', 300), EPC('EPC-420', 'PR-420', 300), EPC('EPC-330', 'PR-330'), EPC('EPC-630', 'PR-630'),
  ZS('IV-301', 'ZSO'), ZS('IV-301', 'ZSC'),
  ZS('MOV-414', 'ZSO'), ZS('MOV-414', 'ZSC'),
  ZS('MFV-424', 'ZSO'), ZS('MFV-424', 'ZSC'),
  ZS('GOV-416', 'ZSO'), ZS('GOV-416', 'ZSC'),
  ZS('GFV-426', 'ZSO'), ZS('GFV-426', 'ZSC'),
  ZS('TSV-332', 'ZSO'), ZS('TSV-332', 'ZSC'),
];

/* Densities and vapour pressures the DAQ's derived channels assume: the
   propellants. On a water cold flow the NPSH and GG-flow channels are off
   by the density ratio — and say so. */
const RHO = { ox: FLUIDS_G.LOX.rho, fu: FLUIDS_G.ethanol.rho };
const safeDiv = (a, b) => (Math.abs(b) > 0.005 ? a / b : 0);
const ggFlow = (CdA, rho) => ([pd, pg]) => (pd > pg + psi(5) ? CdA * Math.sqrt(2 * rho * (pd - pg)) : 0);
const channels = {
  commands: [
    { id: 'TSV-332-CMD', target: 'TSV-332', desc: 'Turbine start valve command' },
    { id: 'MOV-414-CMD', target: 'MOV-414', desc: 'Main oxidiser valve command' },
    { id: 'MFV-424-CMD', target: 'MFV-424', desc: 'Main fuel valve command' },
    { id: 'GOV-416-CMD', target: 'GOV-416', desc: 'Gas generator oxidiser valve command' },
    { id: 'GFV-426-CMD', target: 'GFV-426', desc: 'Gas generator fuel valve command' },
    { id: 'GCV-417-CMD', target: 'GCV-417', desc: 'GG oxidiser throttle command (0–1)', quantity: 'ratio' },
    { id: 'GCV-427-CMD', target: 'GCV-427', desc: 'GG fuel throttle command (0–1)', quantity: 'ratio' },
    { id: 'IGN-501-CMD', target: 'IGN-501', desc: 'Main igniter command' },
    { id: 'IGN-502-CMD', target: 'IGN-502', desc: 'Gas generator igniter command' },
    { id: 'PV-631-CMD', target: 'PV-631', desc: 'Main oxidiser-side purge command' },
    { id: 'PV-632-CMD', target: 'PV-632', desc: 'Main fuel-side purge command' },
    { id: 'PV-635-CMD', target: 'PV-635', desc: 'Gas generator purge command' },
    { id: 'IV-301-CMD', target: 'IV-301', desc: 'Supply isolation command' },
  ],
  derived: [
    { id: 'SPD', quantity: 'speed', desc: 'Shaft speed for the redline: higher of SE-341 / SE-342', inputs: ['SE-341', 'SE-342'], fn: ([a, b]) => Math.max(a, b) },
    { id: 'SPD-PCT', quantity: 'ratio', desc: 'Shaft speed, fraction of design (36 000 rpm)', inputs: ['SPD'], fn: ([n]) => n / ND },
    { id: 'DP-OXP', quantity: 'pressure', gauge: 'd', desc: 'Ox pump ΔP (PT-414 − PT-413)', inputs: ['PT-414', 'PT-413'], fn: ([a, b]) => a - b },
    { id: 'DP-FUP', quantity: 'pressure', gauge: 'd', desc: 'Fuel pump ΔP (PT-424 − PT-423)', inputs: ['PT-424', 'PT-423'], fn: ([a, b]) => a - b },
    { id: 'NPSH-OX', quantity: 'head', desc: 'Ox pump NPSH available at LOX properties, (PT-413 + Pamb − Pv(TT-412))/(ρg)', inputs: ['PT-413', 'TT-412'],
      fn: ([p, T], k) => (p + k.Pamb - FLUIDS_G.LOX.pvap(T)) / (RHO.ox * G0) },
    { id: 'NPSH-FU', quantity: 'head', desc: 'Fuel pump NPSH available at ethanol properties, (PT-423 + Pamb − Pv(TT-422))/(ρg)', inputs: ['PT-423', 'TT-422'],
      fn: ([p, T], k) => (p + k.Pamb - FLUIDS_G.ethanol.pvap(T)) / (RHO.fu * G0) },
    { id: 'DP-OXI', quantity: 'pressure', gauge: 'd', desc: 'Main oxidiser injector ΔP (PT-415 − PT-501)', inputs: ['PT-415', 'PT-501'], fn: ([a, b]) => a - b },
    { id: 'DP-FUI', quantity: 'pressure', gauge: 'd', desc: 'Main fuel injector ΔP (PT-425 − PT-501)', inputs: ['PT-425', 'PT-501'], fn: ([a, b]) => a - b },
    { id: 'MR-C', quantity: 'ratio', desc: 'Main chamber mixture ratio, FT-416 / FT-426 (as measured)', inputs: ['FT-416', 'FT-426'], fn: ([o, f]) => safeDiv(o, f) },
    { id: 'CSTAR-C', quantity: 'velocity', desc: 'Main chamber c*, from PT-501 and FT-416 + FT-426 (drawing throat)', inputs: ['PT-501', 'FT-416', 'FT-426'],
      fn: ([p, o, f], k) => (o + f > 0.1 && p > psi(30) ? (p + k.Pamb) * 0.98 * At0 / (o + f) : 0) },
    /* The gas generator's flows are too small for turbine meters: they are
       inferred from the pressure drop across its calibrated orifices, at
       the drawing's flow coefficient. A worn or blocked orifice makes these
       wrong in a way nothing else on the stand can show. */
    { id: 'GGF-OX', quantity: 'massflow', desc: 'GG oxidiser flow, inferred: CdA(drawing)·√(2ρ(PT-414 − PT-333))', inputs: ['PT-414', 'PT-333'],
      fn: ggFlow(DESIGN_G.CdAggOx, RHO.ox) },
    { id: 'GGF-FU', quantity: 'massflow', desc: 'GG fuel flow, inferred: CdA(drawing)·√(2ρ(PT-424 − PT-333))', inputs: ['PT-424', 'PT-333'],
      fn: ggFlow(DESIGN_G.CdAggFu, RHO.fu) },
    { id: 'MR-GG', quantity: 'ratio', desc: 'Gas generator mixture ratio, GGF-OX / GGF-FU (inferred)', inputs: ['GGF-OX', 'GGF-FU'], fn: ([o, f]) => safeDiv(o, f) },
    { id: 'ISP-E', quantity: 'ratio', desc: 'Engine specific impulse, s: LC-501 / g0 / (all four flows)', inputs: ['LC-501', 'FT-416', 'FT-426', 'GGF-OX', 'GGF-FU'],
      fn: ([F, a, b, c, d]) => (a + b > 0.1 && F > 50 ? F / G0 / (a + b + c + d) : 0) },
    { id: 'ISP-C', quantity: 'ratio', desc: 'Main chamber specific impulse, s: LC-501 / g0 / (main flows)', inputs: ['LC-501', 'FT-416', 'FT-426'],
      fn: ([F, a, b]) => (a + b > 0.1 && F > 50 ? F / G0 / (a + b) : 0) },
  ],
};

/* ---- components ------------------------------------------------------- */
const V = (tag, name, kind, specs, text, extra = {}) => ({ tag, name, kind, specs, text, ...extra });
const components = {
  'N2-B': V('GN₂ BANK', 'Nitrogen bottle bank (six K-bottles)', 'Pressurant, start gas and purge source',
    { 'Water volume': '≈300 L', 'Fill at start of day': '≈2400 psig' },
    'Pressurises both tanks, spins the turbine for the start, and supplies the purges. The start uses a few hundred grams of it — the engine, once running, needs none.', { ref: ['blowdown'] }),
  'HV-300': V('HV-300', 'Bank hand valve', 'Manual valve', { 'Operation': 'Manual, in-cell only' }, 'The bank isolation; a technician task.', { commandable: 'tech' }),
  'IV-301': V('IV-301', 'Supply isolation valve', 'Pneumatic ball valve, normally closed', { 'Fail position': 'CLOSED', 'Indication': 'ZSO / ZSC' }, 'Isolates the bank from all four regulators.', { commandable: 'remote' }),
  'VV-301': V('VV-301', 'Supply header vent', 'Solenoid vent, normally OPEN', { 'Fail position': 'OPEN' }, 'Vents the header.', { commandable: 'remote' }),
  'PR-410': V('PR-410', 'Oxidiser tank pressure regulator', 'Dome-loaded RELIEVING regulator', { 'Dome': 'EPC-410' },
    'Sets the oxidiser pump\'s suction pressure. A pump-fed engine\'s tanks run at tens of psi, not hundreds: they only have to keep the inducers out of cavitation.', { commandable: 'setpoint', ref: ['npsh', 'pump-fed'] }),
  'PR-420': V('PR-420', 'Fuel tank pressure regulator', 'Dome-loaded RELIEVING regulator', { 'Dome': 'EPC-420' }, 'The fuel side\'s PR-410.', { commandable: 'setpoint', ref: ['npsh'] }),
  'PR-330': V('PR-330', 'Start gas regulator', 'Dome-loaded regulator, high flow', { 'Dome': 'EPC-330 (fast)', 'Relief': 'RV-331 at 500 psig', 'Set by': 'the sequencer (the plan\'s start pressure)' },
    'Sets the pressure of the nitrogen that spins the turbine for the start. Too low and the pumps never make the pressure to light the gas generator properly — a start hang. Too high, or left on too long, and the turbine has two drives at once — an overspeed.', { commandable: 'setpoint', ref: ['bootstrap'] }),
  'PR-630': V('PR-630', 'Purge regulator', 'Dome-loaded regulator', { 'Dome': 'EPC-630', 'Typical setting': '150 psig' }, 'Purges both injector manifolds and the gas generator.', { commandable: 'setpoint', ref: ['purge'] }),
  'EPC-410': V('EPC-410', 'Electronic pressure controller (ox tank)', 'Dome loader', {}, 'Loads PR-410\'s dome.', { commandable: 'setpoint' }),
  'EPC-420': V('EPC-420', 'Electronic pressure controller (fuel tank)', 'Dome loader', {}, 'Loads PR-420\'s dome.', { commandable: 'setpoint' }),
  'EPC-330': V('EPC-330', 'Electronic pressure controller (start gas)', 'Fast dome loader', {}, 'Loads PR-330\'s dome.', { commandable: 'setpoint' }),
  'EPC-630': V('EPC-630', 'Electronic pressure controller (purge)', 'Dome loader', {}, 'Loads PR-630\'s dome.', { commandable: 'setpoint' }),
  'T-410': V('T-410', 'Oxidiser run tank', 'Pressure vessel', { 'Volume': '60 L', 'MEOP': '120 psig', 'Relief': 'RV-412 at 150 psig', 'Propellant load': '≈60 kg LOX' },
    'Feeds the oxidiser pump. Weighed by WT-411.', { ref: ['npsh'] }),
  'T-420': V('T-420', 'Fuel run tank', 'Pressure vessel', { 'Volume': '60 L', 'MEOP': '120 psig', 'Relief': 'RV-422 at 150 psig', 'Propellant load': '≈42 kg ethanol' },
    'Feeds the fuel pump. Weighed by WT-421.', { ref: ['npsh'] }),
  'VV-413': V('VV-413', 'Oxidiser tank vent', 'Solenoid vent, normally OPEN', {}, 'Vents T-410.', { commandable: 'remote' }),
  'VV-423': V('VV-423', 'Fuel tank vent', 'Solenoid vent, normally OPEN', {}, 'Vents T-420.', { commandable: 'remote' }),
  'VV-338': V('VV-338', 'Start gas line vent', 'Solenoid vent, normally closed', {}, 'Bleeds the start-gas line after a run.', { commandable: 'remote' }),
  'TSV-332': V('TSV-332', 'Turbine start valve', 'Fast pneumatic ball valve, normally closed', { 'Stroke': '≈80 ms', 'Operated by': 'the sequencer' },
    'Admits the start gas to the turbine manifold at T-0 and shuts it once the gas generator has taken over. Open too long, and the turbine has two drives.', { ref: ['bootstrap', 'overspeed'] }),
  'TPA-1': V('TPA-1', 'Turbopump assembly', 'Turbomachinery', { 'Design speed': '36 000 rpm', 'Redline': '39 600 rpm (110 %)', 'Turbine drive': 'GG gas at ≈850 K (start: GN₂)' },
    'The turbopump from TS-3, now driven by the gas generator. On hot gas its turbine sees more than twice the spouting velocity it had on cold nitrogen — far above its best blade speed ratio, so it is less efficient, but it needs a third of the flow.', { ref: ['turbine', 'overspeed', 'gas-generator-cycle'] }),
  'P-OX': V('P-OX', 'Oxidiser pump', 'Centrifugal, inducer + impeller', { 'Design': '390 m at 0.54 kg/s LOX' }, 'Feeds the main injector and, through GOV-416, the gas generator.', { ref: ['centrifugal-pump', 'npsh'] }),
  'P-FU': V('P-FU', 'Fuel pump', 'Centrifugal, inducer + impeller', { 'Design': '480 m at 0.36 kg/s ethanol' }, 'Feeds the main injector and, through GFV-426, the gas generator.', { ref: ['centrifugal-pump', 'npsh'] }),
  'TURB': V('TURB', 'Turbine', 'Single-stage impulse, partial admission', { 'Inlet': 'the gas generator\'s gas (TT-334, PT-333)' },
    'Its nozzles are the gas generator\'s throat: the GG\'s pressure is set by how much gas the turbine nozzles pass.', { ref: ['turbine'] }),
  'GG': V('GG', 'Gas generator', 'Fuel-rich combustor, spark ignited', { 'Mixture ratio': '≈0.37 (very fuel-rich)', 'Outlet': '≈840 K, ≈150 psig', 'Flow': '≈0.035 kg/s — 4 % of the engine', 'Redline': 'TT-334 1050 K' },
    'Burns a few percent of the propellants very fuel-rich — cool enough for an uncooled turbine — and dumps its gas overboard after the turbine. That gas is what the cycle pays for its simplicity: propellant that makes no thrust in the main chamber. Its mixture ratio sets its temperature; its temperature is the turbine\'s redline.', { ref: ['gas-generator-cycle', 'turbine-inlet-temperature'] }),
  'GOV-416': V('GOV-416', 'GG oxidiser valve', 'Fast pneumatic valve, normally closed', { 'Stroke': '≈60 ms', 'Operated by': 'the sequencer' },
    'Opens the oxidiser tap to the gas generator. It opens after the fuel side is flowing and shuts first: an oxidiser-rich gas generator is a hot one.', { ref: ['gas-generator-cycle'] }),
  'GFV-426': V('GFV-426', 'GG fuel valve', 'Fast pneumatic valve, normally closed', { 'Stroke': '≈60 ms', 'Operated by': 'the sequencer' }, 'Opens the fuel tap to the gas generator.', { ref: ['gas-generator-cycle'] }),
  'GCV-417': V('GCV-417', 'GG oxidiser throttle', 'Electro-pneumatic control valve', { 'Feedback': 'ZT-417', 'Set by': 'the plan' },
    'With GCV-427, the engine\'s THROTTLE: less flow to the gas generator, less turbine power, lower pump speed, lower chamber pressure. Move one without the other and the gas generator\'s mixture ratio — its temperature — moves.', { ref: ['throttling'] }),
  'GCV-427': V('GCV-427', 'GG fuel throttle', 'Electro-pneumatic control valve', { 'Feedback': 'ZT-427', 'Set by': 'the plan' }, 'The fuel side\'s GCV-417.', { ref: ['throttling'] }),
  'MOV-414': V('MOV-414', 'Main oxidiser valve', 'Pneumatic ball valve, normally closed', { 'Stroke': '≈0.3 s', 'Indication': 'ZSO / ZSC' },
    'Opens the pumped oxidiser to the main injector. It opens with the pumps already turning on start gas — but before they are at speed: the pumps need a load, and the chamber must light at modest pressure.', { ref: ['bootstrap'] }),
  'MFV-424': V('MFV-424', 'Main fuel valve', 'Pneumatic ball valve, normally closed', { 'Stroke': '≈0.3 s', 'Indication': 'ZSO / ZSC' }, 'The fuel side\'s MOV-414.', { ref: ['bootstrap'] }),
  'PV-631': V('PV-631', 'Main oxidiser-side purge', 'Solenoid valve, normally closed', {}, 'Purges the main oxidiser manifold before and after flow.', { commandable: 'remote', ref: ['purge'] }),
  'PV-632': V('PV-632', 'Main fuel-side purge', 'Solenoid valve, normally closed', {}, 'Purges the main fuel manifold.', { commandable: 'remote', ref: ['purge'] }),
  'PV-635': V('PV-635', 'Gas generator purge', 'Solenoid valve, normally closed', {}, 'Purges the gas generator and the turbine manifold: unburned fuel left there after a shutdown is the next start\'s hard start.', { commandable: 'remote', ref: ['purge'] }),
  'BPE-3': V('BPE-3', 'Gas-generator cycle engine (fictional)', 'Test article', {
      'Thrust (sea level)': '≈1.8 kN', 'Chamber pressure': '≈2.3 MPa (330 psig)', 'Mixture ratio': '1.6 (main), 0.37 (GG)',
      'Throat / exit': 'Ø 26.2 / 57 mm', 'Chamber': 'ablative: silica-phenolic liner in a steel case', 'Design burn': '60 s' },
    'Fed by TPA-1. The main chamber is ablatively cooled: its liner chars and erodes as it burns, the throat grows, and the chamber pressure drifts down through a long burn. The case thermocouple watches the liner thin.', { ref: ['gas-generator-cycle', 'ablative-chamber', 'bootstrap'] }),
  'IGN-501': V('IGN-501', 'Main chamber igniter', 'Spark-torch', { 'Exciter current': '≈1.8 A' }, 'Lights the main chamber.', { ref: ['ignition'] }),
  'IGN-502': V('IGN-502', 'Gas generator igniter', 'Spark plug', { 'Exciter current': '≈1.6 A' },
    'Lights the gas generator. If it does not, the turbine gets unburned propellant instead of power: the pumps stall, and a hot start waits in the manifold.', { ref: ['ignition', 'gas-generator-cycle'] }),
  'LC-501': V('LC-501', 'Engine thrust load cell', '±4000 N load cell', { 'Shunt cal': '2000 N' }, 'Measures the main chamber\'s thrust (the turbine exhaust duct points sideways and adds almost none).'),
};
const componentSensors = {
  'N2-B': ['PT-301', 'TC-301'], 'HV-300': ['PT-301'], 'IV-301': ['IV-301-ZSO', 'IV-301-ZSC', 'PT-301', 'PT-302'], 'VV-301': ['PT-302'],
  'PR-410': ['PT-302', 'PT-410', 'EPC-410'], 'PR-420': ['PT-302', 'PT-420', 'EPC-420'], 'PR-330': ['PT-302', 'PT-336', 'EPC-330'], 'PR-630': ['PT-630', 'EPC-630'],
  'EPC-410': ['EPC-410', 'PT-410'], 'EPC-420': ['EPC-420', 'PT-420'], 'EPC-330': ['EPC-330', 'PT-336'], 'EPC-630': ['EPC-630', 'PT-630'],
  'T-410': ['PT-410', 'WT-411', 'TT-412'], 'T-420': ['PT-420', 'WT-421', 'TT-422'], 'VV-413': ['PT-410'], 'VV-423': ['PT-420'], 'VV-338': ['PT-336'],
  'TSV-332': ['TSV-332-ZSO', 'TSV-332-ZSC', 'PT-336', 'PT-333'],
  'TPA-1': ['SPD', 'SE-341', 'SE-342', 'VIB-345', 'TC-343', 'TC-344'],
  'P-OX': ['PT-413', 'PT-414', 'DP-OXP', 'NPSH-OX', 'TT-415'], 'P-FU': ['PT-423', 'PT-424', 'DP-FUP', 'NPSH-FU', 'TT-425'],
  'TURB': ['PT-333', 'TT-334', 'TT-335'], 'GG': ['PT-333', 'TT-334', 'GGF-OX', 'GGF-FU', 'MR-GG', 'IGG-I'],
  'GOV-416': ['GOV-416-ZSO', 'GOV-416-ZSC', 'GGF-OX'], 'GFV-426': ['GFV-426-ZSO', 'GFV-426-ZSC', 'GGF-FU'],
  'GCV-417': ['ZT-417', 'GGF-OX'], 'GCV-427': ['ZT-427', 'GGF-FU'],
  'MOV-414': ['MOV-414-ZSO', 'MOV-414-ZSC', 'PT-415', 'FT-416'], 'MFV-424': ['MFV-424-ZSO', 'MFV-424-ZSC', 'PT-425', 'FT-426'],
  'PV-631': ['PT-630', 'PT-415'], 'PV-632': ['PT-630', 'PT-425'], 'PV-635': ['PT-630', 'PT-333'],
  'BPE-3': ['PT-501', 'DP-OXI', 'DP-FUI', 'MR-C', 'CSTAR-C', 'TC-503', 'OD-504', 'VIB-505', 'ISP-E', 'ISP-C'],
  'IGN-501': ['IGN-I', 'OD-504'], 'IGN-502': ['IGG-I', 'TT-334'], 'LC-501': ['LC-501'],
};

/* ---- limits --------------------------------------------------------- */
const N = f => f * ND;
const limits = [
  { id: 'PT301-LO', channel: 'PT-301', lo: psi(1200), level: 'caution', persist: 1.0, when: c => c.armed, text: 'Bottle bank low for a start' },
  { id: 'PT410-RL', channel: 'PT-410', hi: psi(140), level: 'redline', action: 'abort', persist: 0.05, text: 'oxidiser tank overpressure' },
  { id: 'PT420-RL', channel: 'PT-420', hi: psi(140), level: 'redline', action: 'abort', persist: 0.05, text: 'fuel tank overpressure' },
  { id: 'PT630-LO', channel: 'PT-630', lo: psi(100), level: 'warning', persist: 0.5, when: c => c.armed || c.seqActive, text: 'Purge pressure low — purge not available' },
  /* the turbopump */
  { id: 'SPD-RL', channel: 'SPD', hi: N(1.10), level: 'redline', action: 'abort', persist: 0.01, text: 'turbopump OVERSPEED (110 %)' },
  { id: 'SPD-HI', channel: 'SPD', hi: N(1.05), level: 'caution', persist: 0.1, text: 'Turbopump speed above 105 %' },
  { id: 'SE-DIS', channel: 'SE-341', lo: c => c.seB - 600, hi: c => c.seB + 600, level: 'caution', persist: 0.2,
    when: c => c.seB > 3000 || c.seA > 3000, text: 'Speed pickups disagree (SE-341 vs SE-342)' },
  /* the start: mainstage by msCheck, or it has hung */
  { id: 'START-HANG', channel: 'SPD', lo: c => 0.8 * c.predN, level: 'redline', action: 'abort', persist: 0.05,
    when: c => c.hot && c.burning && c.T >= c.msCheck && c.T < c.msCheck + 1 && c.T < c.tShut && c.predN > 0, text: 'START HANG — the turbopump did not reach mainstage speed' },
  { id: 'VIB345-HI', channel: 'VIB-345', hi: 4, level: 'caution', persist: 0.3, text: 'TPA vibration above normal' },
  { id: 'VIB345-RL', channel: 'VIB-345', hi: 9, level: 'redline', action: 'abort', persist: 0.15, text: 'TPA vibration' },
  { id: 'TC343-RL', channel: 'TC-343', hi: degC(110), level: 'redline', action: 'abort', persist: 0.3, text: 'pump-end bearing over temperature' },
  { id: 'TC344-RL', channel: 'TC-344', hi: degC(120), level: 'redline', action: 'abort', persist: 0.3, text: 'turbine-end bearing over temperature' },
  { id: 'NPSH-OX-LO', channel: 'NPSH-OX', lo: 26, level: 'caution', persist: 0.5, when: c => c.burning && c.Tburn > 1.5, text: 'Ox pump suction margin low (NPSH)' },
  { id: 'NPSH-FU-LO', channel: 'NPSH-FU', lo: 24, level: 'caution', persist: 0.5, when: c => c.burning && c.Tburn > 1.5, text: 'Fuel pump suction margin low (NPSH)' },
  { id: 'WT411-LO', channel: 'WT-411', lo: 4, level: 'redline', action: 'abort', persist: 0.1, when: c => c.burning, text: 'oxidiser tank nearly empty' },
  { id: 'WT421-LO', channel: 'WT-421', lo: 4, level: 'redline', action: 'abort', persist: 0.1, when: c => c.burning, text: 'fuel tank nearly empty' },
  { id: 'PT414-RL', channel: 'PT-414', hi: psi(1100), level: 'redline', action: 'abort', persist: 0.02, text: 'ox pump discharge overpressure' },
  { id: 'PT424-RL', channel: 'PT-424', hi: psi(1100), level: 'redline', action: 'abort', persist: 0.02, text: 'fuel pump discharge overpressure' },
  /* the gas generator */
  { id: 'TT334-HI', channel: 'TT-334', hi: 960, level: 'caution', persist: 0.2, text: 'Turbine inlet temperature high' },
  { id: 'TT334-RL', channel: 'TT-334', hi: 1050, level: 'redline', action: 'abort', persist: 0.05, text: 'TURBINE INLET OVER TEMPERATURE' },
  { id: 'GG-NOLIGHT', channel: 'TT-334', lo: 450, level: 'redline', action: 'abort', persist: 0.05,
    when: c => c.hot && c.burning && c.T >= c.ggCheck && c.T < c.tShut, text: 'gas generator did not light (no turbine inlet temperature rise)' },
  /* the main chamber */
  { id: 'PT501-HI', channel: 'PT-501', hi: psi(520), level: 'redline', action: 'abort', persist: 0, when: c => c.hot && c.firing, text: 'chamber overpressure (hard start?)' },
  { id: 'PT501-LO', channel: 'PT-501', lo: c => (c.T < c.ignCheck + 0.6 ? 0.15 : 0.5) * c.predPcG, level: 'redline', action: 'abort', persist: 0.03,
    when: c => c.hot && c.burning && c.T >= c.ignCheck && c.T < c.tShut && c.predPcG > 0, text: 'chamber pressure low — no ignition, or flameout' },
  { id: 'PT501-COLD', channel: 'PT-501', hi: psi(80), level: 'redline', action: 'abort', persist: 0.05, when: c => !c.hot, text: 'chamber pressure in a cold flow' },
  { id: 'VIB505-HI', channel: 'VIB-505', hi: 4, level: 'caution', persist: 0.15, when: c => c.burning && c.hot, text: 'Engine vibration above normal (roughness)' },
  { id: 'VIB505-RL', channel: 'VIB-505', hi: 15, level: 'redline', action: 'abort', persist: 0.08, when: c => c.burning && c.hot, text: 'engine vibration — combustion instability' },
  { id: 'TC503-HI', channel: 'TC-503', hi: degC(150), level: 'caution', persist: 0.5, text: 'Chamber case temperature high (liner thinning?)' },
  { id: 'TC503-RL', channel: 'TC-503', hi: degC(250), level: 'redline', action: 'abort', persist: 0.2, when: c => c.burning, text: 'chamber case over temperature — liner burn-through imminent' },
  { id: 'FT416-DEV', channel: 'FT-416', lo: c => 0.85 * c.predOx, hi: c => 1.15 * c.predOx, level: 'caution', persist: 0.4,
    when: c => c.burning && c.steady && c.predOx > 0.05, text: 'Main oxidiser flow out of family (±15 % of prediction)' },
  { id: 'FT426-DEV', channel: 'FT-426', lo: c => 0.85 * c.predFu, hi: c => 1.15 * c.predFu, level: 'caution', persist: 0.4,
    when: c => c.burning && c.steady && c.predFu > 0.05, text: 'Main fuel flow out of family (±15 % of prediction)' },
  // outside a sequence: the sequencer's own coast-down after shutdown is
  // short and planned; a rotor turning against shut valves otherwise is not
  { id: 'DEADHEAD', channel: 'SPD', hi: N(0.4), level: 'warning', persist: 1.0,
    when: c => !c.seqActive && c.cmd['MOV-414'] === 0 && c.cmd['MFV-424'] === 0, text: 'Turbopump at speed with both main valves shut (deadhead)' },
];

/* Abort: take the power off the turbine FIRST — the gas generator and the
   start gas — then the main valves a moment later (pumps coasting against
   shut valves are deadheaded; a beat of flow lets them unload), purge both
   chambers, take the tanks off pressure, vent. */
const abortSequence = [
  { at: 0.00, id: 'GOV-416', value: 0, text: 'GOV-416 GG oxidiser valve CLOSE' },
  { at: 0.00, id: 'TSV-332', value: 0, text: 'TSV-332 start valve CLOSE' },
  { at: 0.00, id: 'PR-330', value: 0, text: 'PR-330 start gas → 0' },
  { at: 0.00, id: 'IGN-501', value: 0, text: 'Main igniter OFF' },
  { at: 0.00, id: 'IGN-502', value: 0, text: 'GG igniter OFF' },
  { at: 0.03, id: 'GFV-426', value: 0, text: 'GFV-426 GG fuel valve CLOSE' },
  { at: 0.20, id: 'MOV-414', value: 0, text: 'MOV-414 main oxidiser valve CLOSE' },
  { at: 0.25, id: 'MFV-424', value: 0, text: 'MFV-424 main fuel valve CLOSE' },
  { at: 0.30, id: 'PV-631', value: 1, text: 'PV-631 main oxidiser-side purge OPEN' },
  { at: 0.30, id: 'PV-632', value: 1, text: 'PV-632 main fuel-side purge OPEN' },
  { at: 0.30, id: 'PV-635', value: 1, text: 'PV-635 GG purge OPEN' },
  { at: 0.40, id: 'PR-410', value: 0, text: 'PR-410 oxidiser tank regulator → 0' },
  { at: 0.40, id: 'PR-420', value: 0, text: 'PR-420 fuel tank regulator → 0' },
  { at: 1.50, id: 'DISARM', value: 0, text: 'Fire circuit DISARM' },
  { at: 2.00, id: 'VV-413', value: 1, text: 'VV-413 oxidiser tank vent OPEN' },
  { at: 2.00, id: 'VV-423', value: 1, text: 'VV-423 fuel tank vent OPEN' },
  { at: 2.00, id: 'VV-338', value: 1, text: 'VV-338 start gas line vent OPEN' },
  { at: 6.00, id: 'PV-631', value: 0, text: 'PV-631 purge CLOSE' },
  { at: 6.00, id: 'PV-632', value: 0, text: 'PV-632 purge CLOSE' },
  { at: 6.00, id: 'PV-635', value: 0, text: 'PV-635 purge CLOSE' },
];

const ratings = {
  TANK_MEOP: psi(120), RELIEF_TANK: psi(150), MAWP_TANK: psi(200),
  PERSONNEL_MAX: psi(50), REG_MAX_CMD: psi(125), START_MAX: psi(400), PURGE_MIN: psi(100), PURGE_MAX: psi(300),
  SUPPLY_MIN: psi(1200), VENTED: psi(3),
  MAX_BURN: 60, TANK_RESERVE: 5, FILL_OX: 60, FILL_FU: 42, FILL_WATER: 54,
  N_DESIGN: ND, N_REDLINE: 1.10 * ND, NPSH_MIN_TANK: psi(35),
  TIT_REDLINE: 1050, CASE_REFIRE: degC(60), THR_MIN: 0.6,
};

/* ---- the plan and the sequence -------------------------------------- */
/* Two kinds of run:
     cold — a pump-fed cold flow on water: the turbine spun on start gas for
            the whole run, the main valves open, nothing lit. The feed
            system and the injector, under pump pressure, before anything
            burns.
     hot  — a hot fire: start gas from T-0; main valves at mainOpen; GG
            valves at ggOpen; both igniters sparking from before T-0;
            start gas shut at spinEnd (BOOTSTRAP: from here the engine
            drives itself); mainstage; the GG throttles stepped if the plan
            says so; shutdown GG first, main valves shutLag later; purge.
   The start checks: main chamber pressure by ignCheck, turbine inlet
   temperature by ggCheck, mainstage speed by msCheck — each an abort. */
const hotDefaults = { startP: psi(220), mainOpen: 0.45, ggOpen: 0.75, spinEnd: 1.1, ignLead: 0.5, ignOff: 2.0, shutLag: 0.25, postPurge: 4, thr: 1.0 };
const plan_ = p => ({ ...hotDefaults, ...p });
const checks = p => ({ ignCheck: p.ignCheck ?? p.mainOpen + 0.45, ggCheck: p.ggCheck ?? p.ggOpen + 0.5, msCheck: p.msCheck ?? Math.max(2.5, p.spinEnd + 1.2) });
function holdTime(p) {
  p = plan_(p);
  if (p.mode === 'hot' && p.thrSteps?.length > 1) return (p.settle ?? 4) + (p.thrSteps.length - 1) * (p.dwell ?? 4) + (p.dwell ?? 4);
  return p.duration;
}
function sequence(p0) {
  const p = plan_(p0), ev = [];
  const sg = v => ({ id: 'SG', hook: true, v });
  if (p.mode === 'cold') {
    ev.push({ T: -3, ...sg(p.startP), why: 'start gas regulator up' });
    ev.push({ T: 0, id: 'TSV-332', v: 1, why: 'T-0 turbine start (cold flow)', main: true });
    ev.push({ T: p.mainOpen, id: 'MOV-414', v: 1, why: 'main oxidiser valve (water)', main: true }, { T: p.mainOpen, id: 'MFV-424', v: 1, why: 'main fuel valve (water)', main: true });
    const dur = p.duration;
    ev.push({ T: dur, id: 'TSV-332', v: 0, why: 'turbine shutdown', main: true }, { T: dur + 0.1, ...sg(0), why: 'start gas regulator down' });
    ev.push({ T: dur + 3, id: 'MOV-414', v: 0, why: 'coast-down complete', main: true }, { T: dur + 3, id: 'MFV-424', v: 0, why: 'coast-down complete', main: true });
    ev.push({ T: dur + 3.05, id: 'PV-631', v: 1, why: 'post-purge' }, { T: dur + 3.05, id: 'PV-632', v: 1, why: 'post-purge' });
    ev.push({ T: dur + 3.05 + p.postPurge, id: 'PV-631', v: 0, why: 'post-purge end' }, { T: dur + 3.05 + p.postPurge, id: 'PV-632', v: 0, why: 'post-purge end' });
    return ev.sort((a, b) => a.T - b.T);
  }
  const thr0 = p.thrSteps?.length ? p.thrSteps[0] : p.thr;
  ev.push({ T: -3, ...sg(p.startP), why: 'start gas regulator up' });
  ev.push({ T: -3, id: 'GCV-417', v: p.thrOx ?? thr0, why: 'GG throttle preset' }, { T: -3, id: 'GCV-427', v: p.thrFu ?? thr0, why: 'GG throttle preset' });
  ev.push({ T: -2, id: 'PV-631', v: 1, why: 'pre-purge' }, { T: -2, id: 'PV-632', v: 1, why: 'pre-purge' }, { T: -2, id: 'PV-635', v: 1, why: 'pre-purge' });
  ev.push({ T: -p.ignLead, id: 'IGN-501', v: 1, why: 'main igniter on' }, { T: -p.ignLead, id: 'IGN-502', v: 1, why: 'GG igniter on' });
  ev.push({ T: 0, id: 'TSV-332', v: 1, why: 'T-0 turbine start (start gas)', main: true });
  ev.push({ T: p.mainOpen, id: 'PV-631', v: 0, why: 'purge off' }, { T: p.mainOpen, id: 'PV-632', v: 0, why: 'purge off' });
  ev.push({ T: p.mainOpen, id: 'MOV-414', v: 1, why: 'main oxidiser valve', main: true }, { T: p.mainOpen, id: 'MFV-424', v: 1, why: 'main fuel valve', main: true });
  // the gas generator: fuel a beat ahead of the oxidiser (a fuel-rich light)
  ev.push({ T: p.ggOpen - 0.03, id: 'PV-635', v: 0, why: 'GG purge off' });
  ev.push({ T: p.ggOpen - 0.03, id: 'GFV-426', v: 1, why: 'GG fuel valve', main: true }, { T: p.ggOpen, id: 'GOV-416', v: 1, why: 'GG oxidiser valve', main: true });
  ev.push({ T: p.spinEnd, id: 'TSV-332', v: 0, why: 'start gas off — bootstrap', main: true }, { T: p.spinEnd + 0.1, ...sg(0), why: 'start gas regulator down' });
  ev.push({ T: p.ignOff, id: 'IGN-501', v: 0, why: 'igniter off' }, { T: p.ignOff, id: 'IGN-502', v: 0, why: 'igniter off' });
  if (p.thrSteps?.length > 1) {
    p.thrSteps.forEach((x, k) => {
      if (k === 0) return;
      const Tk = (p.settle ?? 4) + (k - 1) * (p.dwell ?? 4);
      ev.push({ T: Tk, id: 'GCV-417', v: x, why: `throttle point ${k + 1}` }, { T: Tk, id: 'GCV-427', v: x, why: `throttle point ${k + 1}` });
    });
  }
  const end = holdTime(p0);
  ev.push({ T: end, id: 'GOV-416', v: 0, why: 'shutdown: GG oxidiser first', main: true }, { T: end + 0.03, id: 'GFV-426', v: 0, why: 'shutdown: GG fuel', main: true });
  ev.push({ T: end + p.shutLag, id: 'MOV-414', v: 0, why: 'shutdown: main oxidiser', main: true }, { T: end + p.shutLag + 0.05, id: 'MFV-424', v: 0, why: 'shutdown: main fuel', main: true });
  const tp = end + p.shutLag + 0.1;
  ev.push({ T: tp, id: 'PV-631', v: 1, why: 'post-purge' }, { T: tp, id: 'PV-632', v: 1, why: 'post-purge' }, { T: tp, id: 'PV-635', v: 1, why: 'post-purge' });
  ev.push({ T: tp + p.postPurge, id: 'PV-631', v: 0, why: 'post-purge end' }, { T: tp + p.postPurge, id: 'PV-632', v: 0, why: 'post-purge end' }, { T: tp + p.postPurge, id: 'PV-635', v: 0, why: 'post-purge end' });
  return ev.sort((a, b) => a.T - b.T);
}
const pct = x => `${Math.round(x * 100)} %`;
const pg = x => `${Math.round(x / 6894.757)} psig`;
function planText(p0) {
  const p = plan_(p0);
  if (p.mode === 'cold') return `pump-fed cold flow (water), start gas ${pg(p.startP)}, ${p.duration.toFixed(1)} s, main valves at T+${p.mainOpen.toFixed(2)} s, coast 3 s, post-purge ${p.postPurge.toFixed(0)} s`;
  const thr = p.thrSteps?.length > 1 ? `GG throttle ${p.thrSteps.map(pct).join(' → ')} (${(p.settle ?? 4).toFixed(0)} s, then ${(p.dwell ?? 4).toFixed(0)} s each)` : `GG throttle ${pct(p.thr)}`;
  return `hot fire, ${holdTime(p0).toFixed(1)} s, ${thr}; start gas ${pg(p.startP)} T-0 → T+${p.spinEnd.toFixed(2)}; mains T+${p.mainOpen.toFixed(2)}, GG T+${p.ggOpen.toFixed(2)}; igniters T−${p.ignLead.toFixed(1)} → T+${p.ignOff.toFixed(1)}; GG-first shutdown, mains ${Math.round(p.shutLag * 1000)} ms later; post-purge ${p.postPurge.toFixed(0)} s`;
}
function onEvent(ctrl, ev) {
  if (ev.id === 'SG') {
    ctrl.sp['PR-330'] = ev.v;
    ctrl.s.model.command('PR-330', ev.v);
    ctrl.log('SEQ', ev.v > 0 ? `Start gas: PR-330 → ${pg(ev.v)}` : 'Start gas: PR-330 → 0');
  }
}

/* ---- prediction ------------------------------------------------------ */
export function predictGG(S) {
  const c = S.controller, p = plan_(c.plan), m = S.model, A = AMB.P;
  const req = S.request || {};
  const tank = (id, r) => A + (c.sp[id] > psi(5) ? c.sp[id] : r ?? psi(50));
  const fluids = { ox: m.line('ox').fluid, fu: m.line('fu').fluid };
  // the prediction is the DRAWING: its injector and orifice areas, its c* efficiencies
  const cda = { ox: DESIGN_G.CdAox, fu: DESIGN_G.CdAfu, ggox: DESIGN_G.CdAggOx, ggfu: DESIGN_G.CdAggFu };
  const args = { tankOx: tank('PR-410', req.tankP), tankFu: tank('PR-420', req.tankP), fluids, cda, eta: DESIGN_G.etaCstar, etaGG: DESIGN_G.etaGG };
  if (p.mode === 'cold' || c.loaded !== 'propellants') {
    const r = steadyGG(S.def, { ...args, cold: { P: A + (p.startP ?? psi(200)), T: AMB.T } });
    return { ...r, kind: 'ggcold' };
  }
  const thr = p.thrSteps?.length ? p.thrSteps[0] : p.thr;
  const r = steadyGG(S.def, { ...args, thrGGox: p.thrOx ?? thr, thrGGfu: p.thrFu ?? thr });
  if (p.thrSteps?.length > 1) r.steps = p.thrSteps.map(x => steadyGG(S.def, { ...args, thrGG: x }));
  return r;
}

export default {
  id: 'TS-3G',
  program: 'ggengine',
  name: 'TS-3G Gas-Generator Engine Stand',
  short: 'TS-3G · gas-generator engine',
  article: 'BPE-3 S/N 001 · GG cycle on TPA-1',
  fictional: true,
  physics, sensors, channels, components, componentSensors, limits, abortSequence, ratings, gonogo, pid,
  interlocks,
  faults: FAULTS,
  diagnosis: DIAGNOSIS,
  inspections: INSPECTIONS,
  inspectGuard(ctrl, insp) {
    if (insp.dry && ctrl.loaded === 'propellants') return { msg: 'Technician: "Not with propellants on board. Drain and purge first."', why: 'Breaking into the engine or the gas generator means opening the propellant system.' };
    return null;
  },
  nominal: {},
  design: DESIGN_G,
  asBuilt: AS_BUILT_G,
  fluids: FLUIDS_G,
  flame: { MRst: MR_STOICH, soot: 0.12 },
  segmentSensors: { bank: 'PT-301', sup: 'PT-301', hp: 'PT-302', oxreg: 'PT-410', fureg: 'PT-420', oxu: 'PT-410', fuu: 'PT-420',
    treg: 'PT-336', ggc: 'PT-333', purge: 'PT-630', oxpl: 'PT-630', fupl: 'PT-630', oxman: 'PT-415', fuman: 'PT-425', chamber: 'PT-501',
    oxsuc: 'PT-413', fusuc: 'PT-423', oxdis: 'PT-414', fudis: 'PT-424' },
  consoleValves: [
    { id: 'IV-301', label: 'IV-301 Supply isolation', kind: 'remote' },
    { id: 'VV-301', label: 'VV-301 Header vent', kind: 'remote', vent: true },
    { id: 'VV-413', label: 'VV-413 Ox tank vent', kind: 'remote', vent: true },
    { id: 'VV-423', label: 'VV-423 Fuel tank vent', kind: 'remote', vent: true },
    { id: 'VV-338', label: 'VV-338 Start gas line vent', kind: 'remote', vent: true },
    { id: 'PV-631', label: 'PV-631 Main ox-side purge', kind: 'remote' },
    { id: 'PV-632', label: 'PV-632 Main fuel-side purge', kind: 'remote' },
    { id: 'PV-635', label: 'PV-635 GG purge', kind: 'remote' },
    { id: 'HV-300', label: 'HV-300 Bank valve', kind: 'tech' },
  ],
  indications: [
    { valve: 'IV-301', zso: 'IV-301-ZSO', zsc: 'IV-301-ZSC', timeout: 2.0 },
    { valve: 'MOV-414', zso: 'MOV-414-ZSO', zsc: 'MOV-414-ZSC', timeout: 1.0 },
    { valve: 'MFV-424', zso: 'MFV-424-ZSO', zsc: 'MFV-424-ZSC', timeout: 1.0 },
    { valve: 'GOV-416', zso: 'GOV-416-ZSO', zsc: 'GOV-416-ZSC', timeout: 0.5 },
    { valve: 'GFV-426', zso: 'GFV-426-ZSO', zsc: 'GFV-426-ZSC', timeout: 0.5 },
    { valve: 'TSV-332', zso: 'TSV-332-ZSO', zsc: 'TSV-332-ZSC', timeout: 0.6 },
  ],
  regulator: 'PR-410',
  regulators: [
    { id: 'PR-410', label: 'Ox tank (PR-410)', epc: 'EPC-410', out: 'PT-410', vent: 'VV-413' },
    { id: 'PR-420', label: 'Fuel tank (PR-420)', epc: 'EPC-420', out: 'PT-420', vent: 'VV-423' },
    { id: 'PR-630', label: 'Purge (PR-630)', epc: 'EPC-630', out: 'PT-630' },
    { id: 'PR-330', label: 'Start gas (PR-330)', epc: 'EPC-330', out: 'PT-336' },
  ],
  supplyIso: 'IV-301',
  supplyChannel: 'PT-301',
  mainValves: ['TSV-332', 'MOV-414', 'MFV-424', 'GOV-416', 'GFV-426'],
  // a manual cutoff shuts the gas generator first, the main valves after
  cutoffStages: [[0, ['GOV-416', 'TSV-332']], [0.03, ['GFV-426']], [0.25, ['MOV-414']], [0.3, ['MFV-424']]],
  sequencedValves: ['TSV-332', 'MOV-414', 'MFV-424', 'GOV-416', 'GFV-426', 'GCV-417', 'GCV-427'],
  auxCommands: ['IGN-501', 'IGN-502'],
  loadCell: 'LC-501',
  tareIds: ['LC-501', 'WT-411', 'WT-421'],
  lpChannels: ['PT-302', 'PT-410', 'PT-420', 'PT-336', 'PT-333', 'PT-414', 'PT-424', 'PT-630'],
  ventElements: ['VV-301', 'VV-413', 'VV-423', 'VV-338', 'RV-412', 'RV-422', 'RV-331'],
  pneumaticValves: ['IV-301', 'MOV-414', 'MFV-424', 'GOV-416', 'GFV-426', 'TSV-332'],
  bottle: { valve: 'HV-300', volume: 'bank' },
  text: {
    walkdown: 'Walkdown complete: BPE-3 on the thrust stand and torque-striped, TPA-1 mounted and its coupling guard on, speed pickups gapped, GG and turbine manifold bolted and lock-wired, turbine exhaust duct clear and pointing at the berm, both igniter leads secured, propellant and purge lines supported, tank load cells free, catch area clear.',
    inspect: S => {
      const m = S.model, C = m.chamber, warm = C.walls.ch - 273.15;
      return `Post-test visual: engine intact, ablative exit lip charred black${C.abl.char > 0.004 ? ' and visibly eroded' : ''}, soot on the turbine exhaust duct, no leaks at the pump seals or the GG flanges, rotor turns freely by hand${warm > 50 ? ', chamber case hot to the touch' : ''}.`;
    },
  },
  plots: [['PT-501', 'PT-333', 'MOV-414-CMD'], ['SPD', 'TSV-332-CMD', 'GOV-416-CMD'], ['TT-334', 'TT-335'], ['PT-414', 'PT-424', 'PT-415', 'PT-425']],
  analysisPlots: [['PT-501', 'PT-333', 'TSV-332-CMD'], ['SPD', 'GOV-416-CMD', 'MOV-414-CMD'], ['TT-334', 'TT-335'], ['PT-414', 'PT-424', 'PT-415', 'PT-425'],
    ['FT-416', 'FT-426', 'GGF-OX', 'GGF-FU'], ['LC-501'], ['VIB-345', 'VIB-505'], ['TC-503', 'TC-343', 'TC-344']],
  defaultPlan: { mode: 'hot', duration: 10, ...hotDefaults, thrSteps: null, settle: 4, dwell: 4 },
  planForm: 'gg',
  sequence, planText, holdTime,
  predict: predictGG,
  metrics: computeMetricsGG,
  onEvent,
  alarmCtx(S, base) {
    const c = S.controller, pr = S.prediction || {}, p = plan_(c.plan);
    const seA = S.daq.latest('SE-341'), seB = S.daq.latest('SE-342');
    const ck = checks(p);
    const tShut = holdTime(c.plan);
    const steady = base.burning && base.T > ck.msCheck + 2 && base.T < tShut && !(p.thrSteps?.length > 1);
    return { ...base, sp: c.sp, cmd: c.cmd, plan: c.plan, hot: c.loaded === 'propellants', seA, seB, steady, tShut,
      ...ck, predN: pr.kind === 'gg' ? pr.rpm : 0, predPcG: pr.kind === 'gg' ? pr.Pc - AMB.P : 0,
      predOx: pr.mdotOx || 0, predFu: pr.mdotFu || 0 };
  },
  actions: {
    meterCal(ctrl, a) {
      const sc = ctrl.s.model.scales[a.line];
      if (!sc) return { ok: false, blocked: { msg: `No meter on ${a.line}.`, why: '' } };
      sc.rhoCal = FLUIDS_G[a.fluid].rho;
      ctrl.meterFluid[a.line] = a.fluid;
      ctrl.log('DAQ', `${a.line === 'ox' ? 'FT-416' : 'FT-426'} calibration fluid set to ${a.fluid} (ρ ${FLUIDS_G[a.fluid].rho} kg/m³)`);
      return { ok: true };
    },
  },
  initController(ctrl) {
    ctrl.loaded = null;
    ctrl.meterFluid = { ox: 'water', fu: 'water' };
    ctrl.cmd['GCV-417'] = 1; ctrl.cmd['GCV-427'] = 1;
  },
  techTasks(ctrl) {
    const S = ctrl.s, m = S.model, R = ratings;
    const fill = (load, prop = false) => ({ dur: prop ? 150 : 90, text: !load ? 'Draining both run tanks' : prop ? 'Loading propellants: LOX into T-410, ethanol into T-420' : 'Filling both run tanks with water', pre: () => {
      const hi = ['oxu', 'fuu'].map(v => m.net.vol(v).P - AMB.P);
      if (hi.some(p => p > R.VENTED)) return 'Technician: "Tank gauges show pressure. Vent both tanks before I open a fill port."';
      if (ctrl.cmd['VV-413'] !== 1 || ctrl.cmd['VV-423'] !== 1) return 'Technician: "Both tank vents must be open while I fill."';
      if (m.tp.w > 50) return 'Technician: "The pump is still turning."';
      if (load && m.lines.some(l => l.mL > 0.5)) return 'Technician: "There is already liquid in the tanks. Drain them first — I am not mixing fluids."';
      return null;
    }, done: () => {
      const fl = prop ? { ox: FLUIDS_G.LOX, fu: FLUIDS_G.ethanol } : { ox: FLUIDS_G.water, fu: FLUIDS_G.water };
      m.load(fl, load ? (prop ? { ox: R.FILL_OX, fu: R.FILL_FU } : { ox: R.FILL_WATER, fu: R.FILL_WATER }) : { ox: 0, fu: 0 });
      ctrl.loaded = load ? (prop ? 'propellants' : 'water') : null;
      ctrl.bump();
      S.requestPrediction();
      ctrl.log('TECH', !load ? 'Tanks drained; fill ports capped.' : prop
        ? `Propellants loaded: about ${R.FILL_OX} kg LOX in T-410, ${R.FILL_FU} kg ethanol in T-420. Fill ports capped. The stand is now a propellant hazard.`
        : `Tanks filled with water: about ${R.FILL_WATER} kg in each. Fill ports capped.`);
    } });
    return {
      fillTanks: fill(true), drainTanks: fill(false), loadPropellants: fill(true, true),
      turnRotor: { dur: 30, text: 'Turning TPA-1 by hand (breakaway torque check)', pre: () => (m.tp.w > 1 ? 'Technician: "Not while it is spinning."' : ctrl.facility.area !== 'OPEN' ? 'Technician: "I need to be in the cell for that."' : null),
        done: () => {
          const T = m.tp, B = physics.turbopump.bearings;
          const brk = (B.c0 * T.brgFactor + (T.rub > 0 ? 0.02 : 0)) * 1000;
          const feel = T.seized ? 'it will not turn at all' : T.rub > 0 ? 'it turns, but there is a scrape once per revolution' : T.brgFactor > 1.5 ? 'it turns, but it feels gritty and stops dead' : 'it turns smoothly and coasts a quarter turn';
          ctrl.log('TECH', `Rotor turned by hand with a torque wrench: breakaway ${brk.toFixed(0)} N·mm; ${feel}.`);
          S.inspect('turn-rotor');
        } },
    };
  },
  inspectionVolumes: ['hp', 'oxu', 'fuu', 'treg', 'purge', 'oxman', 'fuman'],
  lowPVolume: 'oxu',
  techButtons: [['fillTanks', 'Fill tanks (water)', 'Fill both run tanks with water (tanks vented, vents open)'],
    ['loadPropellants', 'Load propellants', 'Load LOX and ethanol for a hot fire (tanks vented and empty, vents open)'],
    ['drainTanks', 'Drain tanks', 'Drain both run tanks'],
    ['turnRotor', 'Turn rotor', 'Turn the TPA-1 rotor by hand and feel for drag, rub, grit']],
  leak: {
    pre: v => (v.cmd('IV-301') === 0 && ['PR-330', 'PR-630'].every(id => v.sp[id] === 0) && v.sp['PR-410'] > psi(25) && v.sp['PR-420'] > psi(25)
      && ['VV-413', 'VV-423', 'PV-631', 'PV-632', 'PV-635'].every(id => v.cmd(id) === 0) && v.cmd('VV-301') === 1
      && v.ch('PT-410') > psi(30) && v.ch('PT-420') > psi(30))
      ? { ok: true } : { ok: false, msg: 'Isolate first: IV-301 closed and VV-301 open, PR-330 and PR-630 at 0, tank vents and purges closed, both tanks above 30 psig (the tank regulators stay at their setpoints — they are relieving).' },
    eval: v => {
      const a = v.stats('PT-410', 50), b = v.stats('PT-420', 50);
      const ra = a ? a.slope * 60 / psi(1) : NaN, rb = b ? b.slope * 60 / psi(1) : NaN;
      const ok = ra > -0.5 && rb > -0.5;
      return { value: Math.min(a?.slope ?? NaN, b?.slope ?? NaN), ok,
        msg: `ox tank ${ra.toFixed(2)}, fuel tank ${rb.toFixed(2)} psi/min — ${ok ? 'within limit' : 'EXCEEDS 0.5 psi/min limit'}` };
    },
  },
};
