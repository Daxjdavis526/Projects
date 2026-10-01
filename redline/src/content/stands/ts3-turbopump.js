/* TS-3 — a turbopump component test stand. FICTIONAL.

   TPA-1, the turbopump for a pump-fed engine, on the bench: both pumps
   flowing water from pressurised run tanks through throttle valves to a
   catch tank, the turbine spun on cold nitrogen from a bottle bank. What a
   component test establishes, before a turbopump is ever asked to feed an
   engine: that it spins up and coasts down as it should, the head it makes
   against flow and speed (its MAP), how much suction pressure it needs
   before it cavitates (its NPSH), what its turbine delivers, and that its
   bearings and vibration stay where they belong.

   The physics is in ts3-physics.js and physics/turbopump.js; this file is
   the stand: instruments, limits, the abort, the sequence, the speed
   controller, and the stand's own technician tasks. */

import { psi, degC, P_STD } from '../../lib/units.js';
import { physics, FLUIDS3, TPA, AMB } from './ts3-physics.js';
import gonogo from './ts3-gonogo.js';
import pid from './ts3-pid.js';
import { interlocks } from './ts3-interlocks.js';
import { steadyTP } from '../../physics/predict-tp.js';
import { pvapWater } from '../../physics/turbopump.js';
import { computeMetricsTP } from '../../analysis/metrics-tp.js';
import { FAULTS, DIAGNOSIS } from '../faults/ts3-faults.js';
import { INSPECTIONS } from '../faults/ts3-inspections.js';

const G0 = 9.80665;
const RHO_CAL = 998;              // the head channels assume water
const ND = TPA.Nd;

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
const EPC = (id, reg, fs = 300) => ({ id, kind: 'FB', quantity: 'pressure', gauge: true, signal: 'dome:' + reg,
  desc: `${reg} dome pressure (EPC feedback)`, range: [0, psi(fs)], noise: psi(0.05), hum: 0, tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false });
const ZS = (valve, which) => ({ id: `${valve}-${which}`, kind: 'ZS', quantity: 'discrete', signal: `${which.toLowerCase()}:${valve}`,
  desc: `${valve} ${which === 'ZSO' ? 'open' : 'closed'} limit switch` });
/* Magnetic speed pickups looking at a 6-tooth wheel on the shaft: the DAQ
   counts teeth. Two of them, because speed is the redline that matters most
   on a turbopump and one sensor is one failure from flying blind. */
const SE = (id, desc) => ({ id, kind: 'SE', quantity: 'speed', signal: 'N:tp', desc,
  range: [0, 60000], noise: 6, hum: 0, tau: 0.004, zeroSigma: 0, bits: 16, zeroable: false });

const sensors = [
  PT('PT-301', 'Pg:sup', 'GN₂ bank pressure (downstream of HV-300)', 5000, { zeroSigma: psi(5000) * 0.001 }),
  PT('PT-302', 'Pg:hp', 'Supply header (regulator inlets)', 5000, { zeroSigma: psi(5000) * 0.001 }),
  PT('PT-410', 'Pg:oxu', 'Ox-side tank ullage pressure', 300),
  PT('PT-420', 'Pg:fuu', 'Fuel-side tank ullage pressure', 300),
  PT('PT-413', 'Pgin:ox', 'Ox pump inlet', 300, { tau: 0.0003 }),
  PT('PT-423', 'Pgin:fu', 'Fuel pump inlet', 300, { tau: 0.0003 }),
  PT('PT-414', 'Pgd:ox', 'Ox pump discharge', 1500, { tau: 0.0003 }),
  PT('PT-424', 'Pgd:fu', 'Fuel pump discharge', 1500, { tau: 0.0003 }),
  PT('PT-417', 'Pg:oxman', 'Ox throttle inlet', 1500, { tau: 0.0003 }),
  PT('PT-427', 'Pg:fuman', 'Fuel throttle inlet', 1500, { tau: 0.0003 }),
  PT('PT-336', 'Pg:treg', 'Drive regulator outlet (upstream of TSV-332)', 1000),
  PT('PT-333', 'Pg:tin', 'Turbine inlet pressure', 1000, { tau: 0.0003 }),
  /* Turbine meters, water-calibrated: τ ≈ 20 ms rotor lag. */
  { id: 'FT-416', kind: 'FM', quantity: 'massflow', signal: 'Qm:ox', desc: 'Ox pump flow (turbine meter, water)',
    range: [0, 1.2], noise: 0.0012, hum: 0, tau: 0.02, zeroSigma: 0.0008, bits: 16, zeroable: false },
  { id: 'FT-426', kind: 'FM', quantity: 'massflow', signal: 'Qm:fu', desc: 'Fuel pump flow (turbine meter, water)',
    range: [0, 1.2], noise: 0.0012, hum: 0, tau: 0.02, zeroSigma: 0.0008, bits: 16, zeroable: false },
  /* The drive gas: a critical-flow venturi would be the honest way; a
     thermal mass-flow meter is what this stand has. Slow. */
  { id: 'FT-337', kind: 'FM', quantity: 'massflow', signal: 'mdot:TNZ-337', desc: 'Turbine drive gas flow (thermal meter)',
    range: [0, 0.3], noise: 0.0004, hum: 0, tau: 0.15, zeroSigma: 0.0005, bits: 16, zeroable: false },
  { id: 'WT-411', kind: 'WT', quantity: 'mass', signal: 'W:ox', desc: 'Ox-side tank weight (load cells)',
    range: [-5, 60], noise: 0.008, hum: 0.004, tau: 0.05, zeroSigma: 0.3, bits: 24 },
  { id: 'WT-421', kind: 'WT', quantity: 'mass', signal: 'W:fu', desc: 'Fuel-side tank weight (load cells)',
    range: [-5, 60], noise: 0.008, hum: 0.004, tau: 0.05, zeroSigma: 0.3, bits: 24 },
  TC('TT-412', 'Tl:ox', 'Ox-side water temperature (tank)', 2.0),
  TC('TT-422', 'Tl:fu', 'Fuel-side water temperature (tank)', 2.0),
  TC('TT-415', 'Tc:ox', 'Ox pump discharge temperature', 0.5),
  TC('TT-425', 'Tc:fu', 'Fuel pump discharge temperature', 0.5),
  TC('TT-334', 'T:tin', 'Turbine inlet gas temperature', 0.4),
  TC('TT-335', 'T:texh', 'Turbine exhaust gas temperature', 0.4),
  TC('TC-343', 'Tb:pb', 'Pump-end bearing outer race temperature', 1.0),
  TC('TC-344', 'Tb:tb', 'Turbine-end bearing outer race temperature', 1.0),
  TC('TC-301', 'Tw:bank', 'Bottle bank skin temperature', 4.0),
  SE('SE-341', 'Shaft speed, magnetic pickup A'),
  SE('SE-342', 'Shaft speed, magnetic pickup B'),
  { id: 'VIB-345', kind: 'ACC', quantity: 'accel', signal: 'vib:tp', desc: 'TPA housing vibration (accelerometer, RMS converter)',
    range: [0, 50], noise: 0.03, hum: 0, tau: 0.05, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'ZT-418', kind: 'ZT', quantity: 'ratio', signal: 'thr:ox', desc: 'FCV-418 ox throttle position (0–1)',
    range: [0, 1], noise: 0.0008, hum: 0, tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false },
  { id: 'ZT-428', kind: 'ZT', quantity: 'ratio', signal: 'thr:fu', desc: 'FCV-428 fuel throttle position (0–1)',
    range: [0, 1], noise: 0.0008, hum: 0, tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false },
  EPC('EPC-410', 'PR-410'), EPC('EPC-420', 'PR-420'), EPC('EPC-330', 'PR-330', 600),
  ZS('IV-301', 'ZSO'), ZS('IV-301', 'ZSC'),
  ZS('DV-414', 'ZSO'), ZS('DV-414', 'ZSC'),
  ZS('DV-424', 'ZSO'), ZS('DV-424', 'ZSC'),
  ZS('TSV-332', 'ZSO'), ZS('TSV-332', 'ZSC'),
];

const headOf = dp => dp / (RHO_CAL * G0);
const channels = {
  commands: [
    { id: 'TSV-332-CMD', target: 'TSV-332', desc: 'Turbine start valve command' },
    { id: 'DV-414-CMD', target: 'DV-414', desc: 'Ox pump discharge valve command' },
    { id: 'DV-424-CMD', target: 'DV-424', desc: 'Fuel pump discharge valve command' },
    { id: 'FCV-418-CMD', target: 'FCV-418', desc: 'Ox throttle position command (0–1)', quantity: 'ratio' },
    { id: 'FCV-428-CMD', target: 'FCV-428', desc: 'Fuel throttle position command (0–1)', quantity: 'ratio' },
    { id: 'IV-301-CMD', target: 'IV-301', desc: 'Supply isolation command' },
  ],
  derived: [
    /* The redline channel is the HIGHER of the two pickups: a pickup that
       fails low must not hide an overspeed. A pickup that fails high
       aborts a good run instead — the cheaper mistake. */
    { id: 'SPD', quantity: 'speed', desc: 'Shaft speed for the redline: higher of SE-341 / SE-342', inputs: ['SE-341', 'SE-342'], fn: ([a, b]) => Math.max(a, b) },
    { id: 'SPD-PCT', quantity: 'ratio', desc: 'Shaft speed, fraction of design (36 000 rpm)', inputs: ['SPD'], fn: ([n]) => n / ND },
    { id: 'DP-OXP', quantity: 'pressure', gauge: 'd', desc: 'Ox pump ΔP (PT-414 − PT-413)', inputs: ['PT-414', 'PT-413'], fn: ([a, b]) => a - b },
    { id: 'DP-FUP', quantity: 'pressure', gauge: 'd', desc: 'Fuel pump ΔP (PT-424 − PT-423)', inputs: ['PT-424', 'PT-423'], fn: ([a, b]) => a - b },
    { id: 'H-OX', quantity: 'head', desc: 'Ox pump head, ΔP/(ρg) at water density', inputs: ['DP-OXP'], fn: ([d]) => headOf(d) },
    { id: 'H-FU', quantity: 'head', desc: 'Fuel pump head, ΔP/(ρg) at water density', inputs: ['DP-FUP'], fn: ([d]) => headOf(d) },
    /* Net positive suction head available: inlet pressure (absolute) less
       the vapour pressure at the measured water temperature. */
    { id: 'NPSH-OX', quantity: 'head', desc: 'Ox pump NPSH available, (PT-413 + Pamb − Pv(TT-412))/(ρg)', inputs: ['PT-413', 'TT-412'],
      fn: ([p, T], k) => (p + k.Pamb - pvapWater(T)) / (RHO_CAL * G0) },
    { id: 'NPSH-FU', quantity: 'head', desc: 'Fuel pump NPSH available, (PT-423 + Pamb − Pv(TT-422))/(ρg)', inputs: ['PT-423', 'TT-422'],
      fn: ([p, T], k) => (p + k.Pamb - pvapWater(T)) / (RHO_CAL * G0) },
    { id: 'DT-TURB', quantity: 'ratio', desc: 'Turbine gas temperature drop, TT-334 − TT-335 (K)', inputs: ['TT-334', 'TT-335'], fn: ([a, b]) => a - b },
    /* Turbine efficiency from temperatures alone: actual over isentropic
       temperature drop for the measured pressure ratio. No torque meter
       needed — the classic cold-gas spin-rig method. */
    { id: 'ETA-T', quantity: 'ratio', desc: 'Turbine efficiency, ΔT / ΔT isentropic (TT-334, TT-335, PT-333)', inputs: ['TT-334', 'TT-335', 'PT-333'],
      fn: ([Ti, Te, p], k) => {
        const pr = k.Pamb * 1.05 / (p + k.Pamb);
        const dTs = Ti * (1 - Math.pow(pr, 0.4 / 1.4));
        return p > psi(20) && dTs > 1 ? (Ti - Te) / dTs : 0;
      } },
    { id: 'PWR-T', quantity: 'power', desc: 'Turbine power, FT-337 · cp · (TT-334 − TT-335)', inputs: ['FT-337', 'TT-334', 'TT-335'], fn: ([m, a, b]) => m * 1039 * (a - b) },
    { id: 'PWR-OXH', quantity: 'power', desc: 'Ox pump hydraulic power, ΔP · Q', inputs: ['DP-OXP', 'FT-416'], fn: ([d, m]) => d * m / RHO_CAL },
    { id: 'PWR-FUH', quantity: 'power', desc: 'Fuel pump hydraulic power, ΔP · Q', inputs: ['DP-FUP', 'FT-426'], fn: ([d, m]) => d * m / RHO_CAL },
  ],
};

/* ---- components ------------------------------------------------------- */
const V = (tag, name, kind, specs, text, extra = {}) => ({ tag, name, kind, specs, text, ...extra });
const components = {
  'N2-B': V('GN₂ BANK', 'Nitrogen bottle bank (six K-bottles, manifolded)', 'Pressurant and drive-gas source',
    { 'Water volume': '≈300 L', 'Fill at start of day': '≈2400 psig' },
    'Pressurises both run tanks and drives the turbine. The turbine is greedy — about a tenth of a kilogram of nitrogen a second at design speed — so the bank blows down noticeably over a day of tests, and the drive regulator droops with it.', { ref: ['blowdown'] }),
  'HV-300': V('HV-300', 'Bank hand valve', 'Manual valve', { 'Operation': 'Manual, in-cell only' }, 'The bank isolation; a technician task.', { commandable: 'tech' }),
  'IV-301': V('IV-301', 'Supply isolation valve', 'Pneumatic ball valve, normally closed', { 'Fail position': 'CLOSED', 'Indication': 'ZSO / ZSC' },
    'Isolates the bank from all three regulators.', { commandable: 'remote' }),
  'VV-301': V('VV-301', 'Supply header vent', 'Solenoid vent, normally OPEN', { 'Fail position': 'OPEN' }, 'Vents the header between IV-301 and the regulators.', { commandable: 'remote' }),
  'PR-410': V('PR-410', 'Ox-side tank pressure regulator', 'Dome-loaded RELIEVING regulator', { 'Dome': 'EPC-410', 'Relief port': 'vents the tank above setpoint + 3 psi' },
    'Sets the pressure at the ox pump\'s suction. Relieving: turn it down and it bleeds the tank down to the new setpoint — which is how a suction test lowers the inlet pressure under a running pump.', { commandable: 'setpoint', ref: ['npsh'] }),
  'PR-420': V('PR-420', 'Fuel-side tank pressure regulator', 'Dome-loaded RELIEVING regulator', { 'Dome': 'EPC-420' }, 'The fuel side\'s PR-410.', { commandable: 'setpoint', ref: ['npsh'] }),
  'PR-330': V('PR-330', 'Turbine drive regulator', 'Dome-loaded regulator, high flow', { 'Dome': 'EPC-330 (fast)', 'Relief': 'RV-331 at 500 psig' },
    'The turbine inlet pressure, and so the speed. In SPEED control the speed controller SC-330 moves its dome; in PRESSURE control you set it and the speed is whatever the turbine and the pumps settle on. It droops at full turbine flow.', { commandable: 'setpoint', ref: ['speed-control'] }),
  'EPC-410': V('EPC-410', 'Electronic pressure controller (ox tank)', 'Dome loader', { 'Slew': '≈30 psi/s' }, 'Loads PR-410\'s dome.', { commandable: 'setpoint' }),
  'EPC-420': V('EPC-420', 'Electronic pressure controller (fuel tank)', 'Dome loader', { 'Slew': '≈30 psi/s' }, 'Loads PR-420\'s dome.', { commandable: 'setpoint' }),
  'EPC-330': V('EPC-330', 'Electronic pressure controller (turbine drive)', 'Fast dome loader', { 'Slew': '≈150 psi/s', 'Driven by': 'you, or SC-330' },
    'Loads PR-330\'s dome — the actuator the speed controller works through.', { commandable: 'setpoint' }),
  'SC-330': V('SC-330', 'Turbopump speed controller', 'PI controller in the facility PLC', { 'Feedback': 'mean of SE-341 and SE-342', 'Output': 'EPC-330 command', 'Feed-forward': 'the pre-test prediction' },
    'Holds the shaft at the planned speed by adjusting the drive pressure. It trusts its feedback completely: if a speed pickup lies, the controller acts on the lie.', { ref: ['speed-control'] }),
  'CV-411': V('CV-411', 'Ox-side pressurant check valve', 'Spring check valve', { 'Cracking': '≈1 psid' }, 'Keeps water out of the regulator.'),
  'CV-421': V('CV-421', 'Fuel-side pressurant check valve', 'Spring check valve', { 'Cracking': '≈1 psid' }, 'The fuel side\'s CV-411.'),
  'T-410': V('T-410', 'Ox-side run tank', 'Pressure vessel', { 'Volume': '40 L', 'MEOP': '120 psig', 'Relief': 'RV-412 at 150 psig', 'Load': 'water' },
    'Feeds the ox pump. Weighed by WT-411. Run it dry and the pump loses its load in a fraction of a second.', { ref: ['npsh'] }),
  'T-420': V('T-420', 'Fuel-side run tank', 'Pressure vessel', { 'Volume': '40 L', 'MEOP': '120 psig', 'Relief': 'RV-422 at 150 psig', 'Load': 'water' }, 'Feeds the fuel pump. Weighed by WT-421.', { ref: ['npsh'] }),
  'VV-413': V('VV-413', 'Ox-side tank vent', 'Solenoid vent, normally OPEN', { 'Fail position': 'OPEN' }, 'Vents T-410.', { commandable: 'remote' }),
  'VV-423': V('VV-423', 'Fuel-side tank vent', 'Solenoid vent, normally OPEN', { 'Fail position': 'OPEN' }, 'Vents T-420.', { commandable: 'remote' }),
  'RV-412': V('RV-412', 'Ox-side tank relief', 'Spring relief', { 'Set': '150 psig' }, 'Last line of defence for the tank.'),
  'RV-422': V('RV-422', 'Fuel-side tank relief', 'Spring relief', { 'Set': '150 psig' }, 'Last line of defence for the tank.'),
  'RV-331': V('RV-331', 'Drive gas relief', 'Spring relief', { 'Set': '500 psig' }, 'Protects the turbine inlet line.'),
  'VV-338': V('VV-338', 'Drive line vent', 'Solenoid vent, normally closed', { 'Fail position': 'CLOSED' },
    'The only way out for the gas left between PR-330 and the shut turbine start valve after a run: a trapped volume at a couple of hundred psi. Shut before a run — open, it would bleed the drive gas away.', { commandable: 'remote' }),
  'TSV-332': V('TSV-332', 'Turbine start valve', 'Fast pneumatic ball valve, normally closed', { 'Stroke': '≈80 ms', 'Indication': 'ZSO / ZSC', 'Operated by': 'the sequencer' },
    'Admits the drive gas. The sequencer opens it at T-0 and shuts it at the end of the run; the abort shuts it first. Shutting it is the only way to take power off the shaft.', { ref: ['overspeed'] }),
  'TPA-1': V('TPA-1', 'Turbopump assembly (fictional)', 'Test article', {
      'Configuration': 'Two centrifugal pumps with inducers and a single-stage impulse turbine on one shaft',
      'Design speed': '36 000 rpm', 'Ox pump (OX-1)': '0.54 kg/s, 390 m head', 'Fuel pump (FU-1)': '0.36 kg/s, 480 m head',
      'Turbine': 'Partial-admission impulse, mean blade radius 50 mm', 'Redline': '39 600 rpm (110 %)' },
    'Built to feed the pump-fed engine to come. On TS-3 its pumps run on water and its turbine on cold nitrogen: the component test that says whether it is fit to be put on an engine. Head goes as speed squared; power as speed cubed; and a pump that loses its load lets the turbine run away.', { ref: ['centrifugal-pump', 'affinity-laws', 'npsh', 'turbine', 'overspeed'] }),
  'P-OX': V('P-OX', 'Oxidiser pump', 'Centrifugal, inducer + shrouded impeller', { 'Design': '390 m at 4.7 L/s', 'NPSH required (design)': '≈20 m', 'Shutoff head': '≈115 % of design' },
    'Designed for OX-1 (1140 kg/m³); on water it makes the same HEAD but 12 % less pressure rise.', { ref: ['centrifugal-pump', 'npsh'] }),
  'P-FU': V('P-FU', 'Fuel pump', 'Centrifugal, inducer + shrouded impeller', { 'Design': '480 m at 4.5 L/s', 'NPSH required (design)': '≈18 m' },
    'Designed for FU-1 (800 kg/m³); on water it makes 25 % MORE pressure rise than on fuel, and draws 25 % more power.', { ref: ['centrifugal-pump', 'npsh'] }),
  'TURB': V('TURB', 'Turbine', 'Single-stage impulse, partial admission', { 'Nozzles': 'CdA ≈ 31 mm²', 'Drive gas (TS-3)': 'GN₂ at ≈ 220 psig' },
    'Its power depends on the gas\'s spouting velocity and on the blade speed: efficiency peaks at a blade-to-spouting velocity ratio near 0.45. Cold nitrogen leaves it at −70 °C — the temperature drop is how its efficiency is measured.', { ref: ['turbine'] }),
  'DV-414': V('DV-414', 'Ox pump discharge valve', 'Pneumatic ball valve, normally closed', { 'Indication': 'ZSO / ZSC', 'Operated by': 'the sequencer' },
    'Open before the turbine starts (the pumps must have somewhere to put the water) and shut only after the coast-down. A pump spun against a shut discharge valve is DEADHEADED: no flow, little load, all its power going into heating the water in its casing.', { ref: ['deadhead'] }),
  'DV-424': V('DV-424', 'Fuel pump discharge valve', 'Pneumatic ball valve, normally closed', { 'Indication': 'ZSO / ZSC', 'Operated by': 'the sequencer' }, 'The fuel side\'s DV-414.', { ref: ['deadhead'] }),
  'FCV-418': V('FCV-418', 'Ox throttle valve', 'Electro-pneumatic globe valve, positioner', { 'Feedback': 'ZT-418', 'Slew': '50 % / s', 'Set by': 'the plan' },
    'Sets the flow the pump sees — the knob that walks the pump along its curve.', { ref: ['pump-map'] }),
  'FCV-428': V('FCV-428', 'Fuel throttle valve', 'Electro-pneumatic globe valve, positioner', { 'Feedback': 'ZT-428', 'Slew': '50 % / s' }, 'The fuel side\'s FCV-418.', { ref: ['pump-map'] }),
};
const componentSensors = {
  'N2-B': ['PT-301', 'TC-301'], 'HV-300': ['PT-301'], 'IV-301': ['IV-301-ZSO', 'IV-301-ZSC', 'PT-301', 'PT-302'], 'VV-301': ['PT-302'],
  'PR-410': ['PT-302', 'PT-410', 'EPC-410'], 'PR-420': ['PT-302', 'PT-420', 'EPC-420'], 'PR-330': ['PT-302', 'PT-336', 'EPC-330'], 'VV-338': ['PT-336'],
  'EPC-410': ['EPC-410', 'PT-410'], 'EPC-420': ['EPC-420', 'PT-420'], 'EPC-330': ['EPC-330', 'PT-336'], 'SC-330': ['SE-341', 'SE-342', 'EPC-330', 'PT-333'],
  'T-410': ['PT-410', 'WT-411', 'TT-412'], 'T-420': ['PT-420', 'WT-421', 'TT-422'], 'VV-413': ['PT-410'], 'VV-423': ['PT-420'],
  'TSV-332': ['TSV-332-ZSO', 'TSV-332-ZSC', 'PT-336', 'PT-333'],
  'TPA-1': ['SPD', 'SE-341', 'SE-342', 'VIB-345', 'TC-343', 'TC-344'],
  'P-OX': ['PT-413', 'PT-414', 'DP-OXP', 'H-OX', 'NPSH-OX', 'FT-416', 'TT-415'], 'P-FU': ['PT-423', 'PT-424', 'DP-FUP', 'H-FU', 'NPSH-FU', 'FT-426', 'TT-425'],
  'TURB': ['PT-333', 'TT-334', 'TT-335', 'FT-337', 'ETA-T', 'PWR-T'],
  'DV-414': ['DV-414-ZSO', 'DV-414-ZSC', 'PT-414', 'PT-417'], 'DV-424': ['DV-424-ZSO', 'DV-424-ZSC', 'PT-424', 'PT-427'],
  'FCV-418': ['ZT-418', 'PT-417', 'FT-416'], 'FCV-428': ['ZT-428', 'PT-427', 'FT-426'],
};

/* ---- limits --------------------------------------------------------- */
const N = f => f * ND;
const spinning = c => c.Tburn !== null && c.Tburn !== undefined;
const limits = [
  { id: 'PT301-LO', channel: 'PT-301', lo: psi(1200), level: 'caution', persist: 1.0, when: c => c.armed, text: 'Bottle bank low for a turbine run' },
  { id: 'PT410-HI', channel: 'PT-410', hi: c => c.sp['PR-410'] + psi(12), level: 'caution', persist: 1.5, when: c => c.sp['PR-410'] > psi(10), text: 'Ox-side tank above setpoint' },
  { id: 'PT420-HI', channel: 'PT-420', hi: c => c.sp['PR-420'] + psi(12), level: 'caution', persist: 1.5, when: c => c.sp['PR-420'] > psi(10), text: 'Fuel-side tank above setpoint' },
  { id: 'PT410-RL', channel: 'PT-410', hi: psi(140), level: 'redline', action: 'abort', persist: 0.05, text: 'ox-side tank overpressure' },
  { id: 'PT420-RL', channel: 'PT-420', hi: psi(140), level: 'redline', action: 'abort', persist: 0.05, text: 'fuel-side tank overpressure' },
  /* the turbopump */
  { id: 'SPD-RL', channel: 'SPD', hi: N(1.10), level: 'redline', action: 'abort', persist: 0.01, text: 'turbopump OVERSPEED (110 %)' },
  { id: 'SPD-HI', channel: 'SPD', hi: N(1.04), level: 'caution', persist: 0.1, text: 'Turbopump speed above 104 %' },
  { id: 'SPD-DEV', channel: 'SPD', lo: c => 0.85 * c.target, hi: c => 1.08 * c.target, level: 'caution', persist: 0.4,
    when: c => c.burning && c.target > 0 && c.Tburn > c.ramp + 1.5, text: 'Speed off target (speed control not holding)' },
  { id: 'SE-DIS', channel: 'SE-341', lo: c => c.seB - 600, hi: c => c.seB + 600, level: 'caution', persist: 0.2,
    when: c => c.seB > 3000 || c.seA > 3000, text: 'Speed pickups disagree (SE-341 vs SE-342)' },
  { id: 'VIB345-HI', channel: 'VIB-345', hi: 4, level: 'caution', persist: 0.3, text: 'TPA vibration above normal' },
  { id: 'VIB345-RL', channel: 'VIB-345', hi: 9, level: 'redline', action: 'abort', persist: 0.15, text: 'TPA vibration' },
  { id: 'TC343-HI', channel: 'TC-343', hi: degC(80), level: 'caution', persist: 0.5, text: 'Pump-end bearing temperature high' },
  { id: 'TC343-RL', channel: 'TC-343', hi: degC(110), level: 'redline', action: 'abort', persist: 0.3, text: 'pump-end bearing over temperature' },
  { id: 'TC344-HI', channel: 'TC-344', hi: degC(80), level: 'caution', persist: 0.5, text: 'Turbine-end bearing temperature high' },
  { id: 'TC344-RL', channel: 'TC-344', hi: degC(110), level: 'redline', action: 'abort', persist: 0.3, text: 'turbine-end bearing over temperature' },
  { id: 'TT415-HI', channel: 'TT-415', hi: degC(45), level: 'caution', persist: 0.5, text: 'Ox pump discharge temperature high (low flow?)' },
  { id: 'TT425-HI', channel: 'TT-425', hi: degC(45), level: 'caution', persist: 0.5, text: 'Fuel pump discharge temperature high (low flow?)' },
  { id: 'TT415-RL', channel: 'TT-415', hi: degC(75), level: 'redline', action: 'abort', persist: 0.3, text: 'ox pump overheating (deadheaded?)' },
  { id: 'TT425-RL', channel: 'TT-425', hi: degC(75), level: 'redline', action: 'abort', persist: 0.3, text: 'fuel pump overheating (deadheaded?)' },
  { id: 'PT414-RL', channel: 'PT-414', hi: psi(1000), level: 'redline', action: 'abort', persist: 0.02, text: 'ox pump discharge overpressure' },
  { id: 'PT424-RL', channel: 'PT-424', hi: psi(1000), level: 'redline', action: 'abort', persist: 0.02, text: 'fuel pump discharge overpressure' },
  { id: 'NPSH-OX-LO', channel: 'NPSH-OX', lo: 26, level: 'caution', persist: 0.5, when: c => c.burning && c.Tburn > 1, text: 'Ox pump suction margin low (NPSH)' },
  { id: 'NPSH-FU-LO', channel: 'NPSH-FU', lo: 24, level: 'caution', persist: 0.5, when: c => c.burning && c.Tburn > 1, text: 'Fuel pump suction margin low (NPSH)' },
  /* losing the load is how a turbopump runs away: the tank redlines are set
     with the time it takes to shut the turbine down in mind */
  { id: 'WT411-LO', channel: 'WT-411', lo: 4, level: 'redline', action: 'abort', persist: 0.1, when: c => c.burning, text: 'ox-side tank nearly empty' },
  { id: 'WT421-LO', channel: 'WT-421', lo: 4, level: 'redline', action: 'abort', persist: 0.1, when: c => c.burning, text: 'fuel-side tank nearly empty' },
  { id: 'FT416-DEV', channel: 'FT-416', lo: c => 0.85 * c.predOx, hi: c => 1.15 * c.predOx, level: 'caution', persist: 0.4,
    when: c => c.burning && c.steady && c.predOx > 0.05, text: 'Ox pump flow out of family (±15 % of prediction)' },
  { id: 'FT426-DEV', channel: 'FT-426', lo: c => 0.85 * c.predFu, hi: c => 1.15 * c.predFu, level: 'caution', persist: 0.4,
    when: c => c.burning && c.steady && c.predFu > 0.05, text: 'Fuel pump flow out of family (±15 % of prediction)' },
  { id: 'DEADHEAD', channel: 'SPD', hi: N(0.15), level: 'warning', persist: 0.3,
    when: c => c.cmd['DV-414'] === 0 || c.cmd['DV-424'] === 0, text: 'Turbopump turning with a discharge valve shut (deadhead)' },
];

/* Abort: take the drive gas off FIRST (it is the only thing powering the
   shaft), keep the discharge valves open while the pumps coast down — a
   coasting pump with nowhere to put its water is a deadheaded one — then
   shut them, take the tanks off pressure, vent. */
const abortSequence = [
  { at: 0.00, id: 'TSV-332', value: 0, text: 'TSV-332 turbine start valve CLOSE' },
  { at: 0.00, id: 'PR-330', value: 0, text: 'PR-330 drive regulator → 0 (speed control off)' },
  { at: 0.10, id: 'PR-410', value: 0, text: 'PR-410 ox-side tank regulator → 0' },
  { at: 0.10, id: 'PR-420', value: 0, text: 'PR-420 fuel-side tank regulator → 0' },
  { at: 1.00, id: 'DISARM', value: 0, text: 'Fire circuit DISARM' },
  { at: 6.00, id: 'DV-414', value: 0, text: 'DV-414 ox discharge valve CLOSE (pumps coasted down)' },
  { at: 6.00, id: 'DV-424', value: 0, text: 'DV-424 fuel discharge valve CLOSE' },
  { at: 6.50, id: 'VV-413', value: 1, text: 'VV-413 ox-side tank vent OPEN' },
  { at: 6.50, id: 'VV-423', value: 1, text: 'VV-423 fuel-side tank vent OPEN' },
  { at: 6.50, id: 'VV-338', value: 1, text: 'VV-338 drive line vent OPEN' },
];

const ratings = {
  TANK_MEOP: psi(120), RELIEF_TANK: psi(150), MAWP_TANK: psi(200),
  PERSONNEL_MAX: psi(50), REG_MAX_CMD: psi(125), DRIVE_MAX: psi(420), SUPPLY_MIN: psi(1200), VENTED: psi(3),
  MAX_BURN: 60, TANK_RESERVE: 5, FILL_OX: 36, FILL_FU: 36,
  N_DESIGN: ND, N_MAX_PLAN: 1.05 * ND, N_REDLINE: 1.10 * ND,
  NPSH_MIN_TANK: psi(30),
};

/* ---- the plan and the sequence -------------------------------------- */
/* Three kinds of run:
     spin     — hold one speed (or one drive pressure) at one throttle
                setting, then shut the turbine and record the coast-down
     map      — hold speed and step both throttles through a list: one run,
                a whole head–flow curve
     suction  — hold speed and throttle, and bring one tank's pressure down
                at a steady rate: the head holds, then breaks — the NPSH test
   Before T-0 the throttles are set and the discharge valves opened (the
   tanks push a little water through the stopped pumps: the pre-flow). At
   T-0 the turbine start valve opens; speed control ramps the speed up.
   After the run the turbine valve shuts, the pumps coast down with their
   discharge valves still open, and only then are those shut. */
const COAST = 6;
function holdTime(p) {
  if (p.mode === 'map') return (p.ramp ?? 3) + (p.thrSteps?.length || 1) * (p.dwell ?? 4);
  return p.duration;
}
function sequence(p) {
  const ev = [];
  const thr0 = p.mode === 'map' && p.thrSteps?.length ? p.thrSteps[0] : p.thr ?? TPA.thrDesign;
  const thrO = p.thrOx ?? thr0, thrF = p.thrFu ?? thr0;
  ev.push({ T: -4, id: 'FCV-418', v: thrO, why: 'throttle preset' }, { T: -4, id: 'FCV-428', v: thrF, why: 'throttle preset' });
  ev.push({ T: -3, id: 'DV-414', v: 1, why: 'pre-flow' }, { T: -3, id: 'DV-424', v: 1, why: 'pre-flow' });
  const dur = holdTime(p), ramp = p.ramp ?? 3;
  ev.push({ T: 0, id: 'TSV-332', v: 1, why: 'T-0 turbine start', main: true });
  if ((p.ctl || 'speed') === 'speed') ev.push({ T: 0, id: 'SC-330', hook: true, v: p.speed, ramp, why: 'speed control ON' });
  if (p.mode === 'map' && p.thrSteps?.length > 1) {
    p.thrSteps.forEach((x, k) => {
      if (k === 0) return;
      const T = ramp + k * (p.dwell ?? 4);
      ev.push({ T, id: 'FCV-418', v: x, why: `map point ${k + 1}` }, { T, id: 'FCV-428', v: x, why: `map point ${k + 1}` });
    });
  }
  if (p.mode === 'suction') {
    const reg = p.side === 'fu' ? 'PR-420' : 'PR-410';
    ev.push({ T: ramp + (p.settle ?? 3), id: 'TR-' + reg, hook: true, reg, to: p.pEnd, rate: p.rate ?? psi(1.5), why: 'suction ramp start' });
  }
  ev.push({ T: dur, id: 'TSV-332', v: 0, why: 'turbine shutdown', main: true });
  ev.push({ T: dur, id: 'SC-330', hook: true, v: 0, why: 'speed control OFF' });
  ev.push({ T: dur + COAST, id: 'DV-414', v: 0, why: 'coast-down complete' }, { T: dur + COAST, id: 'DV-424', v: 0, why: 'coast-down complete' });
  return ev.sort((a, b) => a.T - b.T);
}
const krpm = x => `${(x / 1000).toFixed(1)} krpm`;
const pct = x => `${Math.round(x * 100)} %`;
function planText(p) {
  const ctl = (p.ctl || 'speed') === 'speed' ? `speed ${krpm(p.speed)} (ramp ${(p.ramp ?? 3).toFixed(0)} s)` : 'drive pressure as set on PR-330';
  if (p.mode === 'map') return `pump map, ${ctl}, throttles ${(p.thrSteps || []).map(pct).join(' → ')} at ${(p.dwell ?? 4).toFixed(0)} s each, coast-down ${COAST} s`;
  if (p.mode === 'suction') return `suction test, ${ctl}, throttles ${pct(p.thr ?? TPA.thrDesign)}, ${p.side === 'fu' ? 'fuel' : 'ox'}-side tank ramped down to ${(p.pEnd / 6894.757).toFixed(0)} psig at ${((p.rate ?? psi(1.5)) / 6894.757).toFixed(1)} psi/s, ${p.duration.toFixed(0)} s, coast-down ${COAST} s`;
  return `spin, ${ctl}, throttles ${pct(p.thrOx ?? p.thr ?? TPA.thrDesign)}${p.thrFu != null && p.thrFu !== p.thrOx ? ` / ${pct(p.thrFu)}` : ''}, ${p.duration.toFixed(1)} s, coast-down ${COAST} s`;
}

/* ---- speed control and setpoint ramps ------------------------------- */
const SC = { Kp: 2.0, Ki: 3.0, Imax: 0.6 };
/* Feed-forward: the drive pressure the prediction says this speed needs at
   the throttle positions now commanded (recomputed when a map steps them). */
function ffPressure(ctrl, rpm) {
  const S = ctrl.s;
  const r = steadyTP(S.def, { tankOx: ctrl.sp['PR-410'], tankFu: ctrl.sp['PR-420'], thrOx: ctrl.cmd['FCV-418'], thrFu: ctrl.cmd['FCV-428'], rpm,
    Pbank: S.daq.latest('PT-301') });
  return Math.max(0, Math.min(ratings.DRIVE_MAX, r.Ptin));
}
function setDrive(ctrl, P) {
  ctrl.sp['PR-330'] = P;
  ctrl.s.model.command('PR-330', P);
}
function onEvent(ctrl, ev) {
  const st = ctrl.tp;
  if (ev.id === 'SC-330') {
    if (ev.v > 0) {
      st.sc = { target: ev.v, ramp: ev.ramp ?? 3, t0: ctrl.t, I: 0, ff: ffPressure(ctrl, ev.v), last: ctrl.t };
      ctrl.log('SEQ', `SC-330 speed control ON: target ${ev.v.toFixed(0)} rpm over ${st.sc.ramp.toFixed(1)} s (feed-forward ${(st.sc.ff / 6894.757).toFixed(0)} psig)`);
    } else if (st.sc) {
      st.sc = null;
      setDrive(ctrl, 0);
      ctrl.log('SEQ', 'SC-330 speed control OFF; PR-330 → 0');
    }
  } else if (ev.id.startsWith('TR-')) {
    st.ramp = { reg: ev.reg, from: ctrl.sp[ev.reg], to: ev.to, rate: ev.rate, t0: ctrl.t };
    ctrl.log('SEQ', `${ev.reg} setpoint ramp: ${(ctrl.sp[ev.reg] / 6894.757).toFixed(0)} → ${(ev.to / 6894.757).toFixed(0)} psig at ${(ev.rate / 6894.757).toFixed(1)} psi/s`);
  }
}
function controlTick(ctrl) {
  const st = ctrl.tp;
  const aborting = !!(ctrl.abort && !ctrl.abort.reset);
  if (st.sc && (aborting || !ctrl.cmd['TSV-332'])) {
    st.sc = null;
    if (!aborting) setDrive(ctrl, 0);
  }
  if (st.ramp && (aborting || !ctrl.seq)) st.ramp = null;
  const S = ctrl.s, t = ctrl.t;
  if (st.sc) {
    const sc = st.sc, dt = Math.max(0, t - sc.last); sc.last = t;
    const key = `${ctrl.cmd['FCV-418']}/${ctrl.cmd['FCV-428']}`;
    if (key !== sc.ffKey) { sc.ffKey = key; sc.ff = ffPressure(ctrl, sc.target); }
    const a = S.daq.latest('SE-341'), b = S.daq.latest('SE-342');
    const Nm = Number.isFinite(a) && Number.isFinite(b) ? 0.5 * (a + b) : Number.isFinite(a) ? a : Number.isFinite(b) ? b : 0;
    const Nt = sc.target * Math.min(1, (t - sc.t0) / sc.ramp);
    const e = (Nt - Nm) / ND;
    // no integral action while the setpoint is still ramping: the shaft
    // always lags an accelerating setpoint, and an integrator that winds
    // up on that lag overshoots when the ramp ends
    if (t - sc.t0 >= sc.ramp) sc.I = Math.max(-SC.Imax, Math.min(SC.Imax, sc.I + SC.Ki * e * dt));
    const P = sc.ff * Math.pow(Math.max(0, Nt / sc.target), 1.8) + sc.ff * (SC.Kp * e + sc.I);
    setDrive(ctrl, Math.max(0, Math.min(ratings.DRIVE_MAX, P)));
  }
  if (st.ramp) {
    const r = st.ramp, P = Math.max(r.to, r.from - r.rate * (t - r.t0));
    ctrl.sp[r.reg] = P;
    S.model.command(r.reg, P);
    if (P <= r.to) st.ramp = null;
  }
}

/* ---- prediction ------------------------------------------------------ */
export function predictTP(S) {
  const c = S.controller, p = c.plan;
  const thr = p.mode === 'map' && p.thrSteps?.length ? p.thrSteps[0] : p.thr ?? TPA.thrDesign;
  const req = S.request || {};
  const tank = (id, r) => (c.sp[id] > psi(5) ? c.sp[id] : r ?? psi(50));
  const args = { tankOx: tank('PR-410', req.tankP), tankFu: tank('PR-420', req.tankP), thrOx: p.thrOx ?? thr, thrFu: p.thrFu ?? thr,
    Pbank: S.daq?.latest('PT-301') };
  const r = (p.ctl || 'speed') === 'speed' ? steadyTP(S.def, { ...args, rpm: p.speed || ND }) : steadyTP(S.def, { ...args, Ptin: c.sp['PR-330'] || 0 });
  // a map: the curve the plan will walk, point by point
  if (p.mode === 'map' && p.thrSteps?.length) r.map = p.thrSteps.map(x => steadyTP(S.def, { ...args, thrOx: x, thrFu: x, rpm: p.speed || ND }));
  return r;
}

export default {
  id: 'TS-3',
  program: 'turbopump',
  name: 'TS-3 Turbopump Component Stand',
  short: 'TS-3 · turbopump',
  article: 'TPA-1 S/N 001 · water / cold GN₂',
  fictional: true,
  physics, sensors, channels, components, componentSensors, limits, abortSequence, ratings, gonogo, pid,
  interlocks,
  faults: FAULTS,
  diagnosis: DIAGNOSIS,
  inspections: INSPECTIONS,
  nominal: {},
  design: TPA,
  fluids: FLUIDS3,
  segmentSensors: { bank: 'PT-301', sup: 'PT-301', hp: 'PT-302', oxreg: 'PT-410', fureg: 'PT-420', oxu: 'PT-410', fuu: 'PT-420',
    treg: 'PT-336', tin: 'PT-333', oxman: 'PT-417', fuman: 'PT-427', oxsuc: 'PT-413', fusuc: 'PT-423', oxdis: 'PT-414', fudis: 'PT-424' },
  consoleValves: [
    { id: 'IV-301', label: 'IV-301 Supply isolation', kind: 'remote' },
    { id: 'VV-301', label: 'VV-301 Header vent', kind: 'remote', vent: true },
    { id: 'VV-413', label: 'VV-413 Ox-side tank vent', kind: 'remote', vent: true },
    { id: 'VV-423', label: 'VV-423 Fuel-side tank vent', kind: 'remote', vent: true },
    { id: 'VV-338', label: 'VV-338 Drive line vent', kind: 'remote', vent: true },
    { id: 'HV-300', label: 'HV-300 Bank valve', kind: 'tech' },
  ],
  indications: [
    { valve: 'IV-301', zso: 'IV-301-ZSO', zsc: 'IV-301-ZSC', timeout: 2.0 },
    { valve: 'DV-414', zso: 'DV-414-ZSO', zsc: 'DV-414-ZSC', timeout: 1.2 },
    { valve: 'DV-424', zso: 'DV-424-ZSO', zsc: 'DV-424-ZSC', timeout: 1.2 },
    { valve: 'TSV-332', zso: 'TSV-332-ZSO', zsc: 'TSV-332-ZSC', timeout: 0.6 },
  ],
  regulator: 'PR-410',
  regulators: [
    { id: 'PR-410', label: 'Ox tank (PR-410)', epc: 'EPC-410', out: 'PT-410', vent: 'VV-413' },
    { id: 'PR-420', label: 'Fuel tank (PR-420)', epc: 'EPC-420', out: 'PT-420', vent: 'VV-423' },
    { id: 'PR-330', label: 'Turbine drive (PR-330)', epc: 'EPC-330', out: 'PT-336' },
  ],
  supplyIso: 'IV-301',
  supplyChannel: 'PT-301',
  mainValves: ['TSV-332'],
  sequencedValves: ['TSV-332', 'DV-414', 'DV-424', 'FCV-418', 'FCV-428'],
  loadCell: null,
  tareIds: ['WT-411', 'WT-421'],
  lpChannels: ['PT-302', 'PT-410', 'PT-420', 'PT-336', 'PT-333', 'PT-414', 'PT-424'],
  ventElements: ['VV-301', 'VV-413', 'VV-423', 'VV-338', 'RV-412', 'RV-422', 'RV-331', 'TNZ-337'],
  pneumaticValves: ['IV-301', 'DV-414', 'DV-424', 'TSV-332'],
  bottle: { valve: 'HV-300', volume: 'bank' },
  text: {
    walkdown: 'Walkdown complete: TPA-1 mounted and torque-striped, coupling guard on, speed pickups gapped and their cables secured, suction and discharge lines supported, turbine exhaust duct clear to the stack, catch tank drain open, accelerometer stud tight.',
    inspect: S => {
      const m = S.model;
      const warm = Math.max(m.tp.brg.pb, m.tp.brg.tb) - 273.15;
      return `Post-test visual: TPA-1 intact, no leaks at the pump seals or the discharge flanges, rotor turns freely by hand with a smooth coast, frost on the turbine exhaust duct${warm > 40 ? ', bearing housings warm to the touch' : ''}. Catch tank level up.`;
    },
  },
  plots: [['SPD', 'SE-341', 'SE-342'], ['PT-414', 'PT-424', 'PT-413', 'PT-423'], ['FT-416', 'FT-426'], ['PT-333', 'EPC-330', 'TSV-332-CMD']],
  analysisPlots: [['SPD', 'TSV-332-CMD'], ['PT-414', 'PT-424', 'PT-413', 'PT-423'], ['FT-416', 'FT-426', 'ZT-418'], ['PT-333', 'PT-336'], ['TT-334', 'TT-335'], ['VIB-345'], ['TC-343', 'TC-344', 'TT-415', 'TT-425']],
  defaultPlan: { mode: 'spin', ctl: 'speed', speed: 30000, ramp: 3, duration: 10, thr: TPA.thrDesign, thrSteps: [0.4, 0.55, 0.7, 0.85, 1.0], dwell: 4, side: 'ox', pEnd: psi(10), rate: psi(1.5), settle: 3 },
  planForm: true,
  sequence, planText,
  holdTime,
  predict: predictTP,
  metrics: computeMetricsTP,
  onEvent, controlTick,
  alarmCtx(S, base) {
    const c = S.controller, p = S.prediction || {}, plan = c.plan;
    const seA = S.daq.latest('SE-341'), seB = S.daq.latest('SE-342');
    const target = (plan.ctl || 'speed') === 'speed' && c.seq ? plan.speed || 0 : 0;
    const ramp = plan.ramp ?? 3;
    // "steady": past the ramp and away from a map step or a suction ramp
    const steady = base.burning && base.Tburn > ramp + 1.5 && plan.mode === 'spin';
    return { ...base, sp: c.sp, cmd: c.cmd, plan, target, ramp, seA, seB, steady,
      predOx: p.mdotOx || 0, predFu: p.mdotFu || 0 };
  },
  initController(ctrl) {
    ctrl.loaded = null;
    ctrl.tp = { sc: null, ramp: null };
    ctrl.cmd['FCV-418'] = 0; ctrl.cmd['FCV-428'] = 0;
  },
  techTasks(ctrl) {
    const S = ctrl.s, m = S.model, R = ratings;
    const fill = load => ({ dur: 90, text: load ? 'Filling both run tanks with water' : 'Draining both run tanks', pre: () => {
      const hi = ['oxu', 'fuu'].map(v => m.net.vol(v).P - AMB.P);
      if (hi.some(p => p > R.VENTED)) return 'Technician: "Tank gauges show pressure. Vent both tanks before I open a fill port."';
      if (ctrl.cmd['VV-413'] !== 1 || ctrl.cmd['VV-423'] !== 1) return 'Technician: "Both tank vents must be open while I fill."';
      if (m.tp.w > 50) return 'Technician: "The pump is still turning."';
      return null;
    }, done: () => {
      m.load({ ox: FLUIDS3.water, fu: FLUIDS3.water }, load ? { ox: R.FILL_OX, fu: R.FILL_FU } : { ox: 0, fu: 0 });
      ctrl.loaded = load ? 'water' : null;
      ctrl.bump();
      S.requestPrediction();
      ctrl.log('TECH', load ? `Run tanks filled from the catch tank: about ${R.FILL_OX} kg of water in T-410, ${R.FILL_FU} kg in T-420. Fill ports capped.`
        : 'Run tanks drained to the catch tank; fill ports capped.');
    } });
    return {
      fillTanks: fill(true), drainTanks: fill(false),
      // turn the rotor by hand: the first thing anyone does to a turbopump
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
  inspectionVolumes: ['hp', 'oxu', 'fuu', 'treg', 'tin', 'oxman', 'fuman'],
  lowPVolume: 'oxu',
  techButtons: [['fillTanks', 'Fill tanks (water)', 'Fill both run tanks with water (tanks vented, vents open)'],
    ['drainTanks', 'Drain tanks', 'Drain both run tanks to the catch tank'],
    ['turnRotor', 'Turn rotor', 'Turn the TPA-1 rotor by hand and feel for drag, rub, grit']],
  /* Leak check: both tanks pressurised and isolated, 60 s hold. */
  leak: {
    // the tank regulators are relieving: left at their setpoints they hold
    // the tanks where they are (at zero they would bleed them down)
    pre: v => (v.cmd('IV-301') === 0 && v.sp['PR-330'] === 0 && v.sp['PR-410'] > psi(25) && v.sp['PR-420'] > psi(25)
      && ['VV-413', 'VV-423'].every(id => v.cmd(id) === 0) && v.cmd('VV-301') === 1
      && v.ch('PT-410') > psi(25) && v.ch('PT-420') > psi(25))
      ? { ok: true } : { ok: false, msg: 'Isolate first: IV-301 closed and VV-301 open, PR-330 at 0, both tank regulators left at their setpoints (relieving: at zero they would bleed the tanks), tank vents closed, both tanks above 25 psig.' },
    eval: v => {
      const a = v.stats('PT-410', 50), b = v.stats('PT-420', 50);
      const ra = a ? a.slope * 60 / psi(1) : NaN, rb = b ? b.slope * 60 / psi(1) : NaN;
      const ok = ra > -0.5 && rb > -0.5;
      return { value: Math.min(a?.slope ?? NaN, b?.slope ?? NaN), ok,
        msg: `ox-side ${ra.toFixed(2)}, fuel-side ${rb.toFixed(2)} psi/min — ${ok ? 'within limit' : 'EXCEEDS 0.5 psi/min limit'}` };
    },
  },
};
