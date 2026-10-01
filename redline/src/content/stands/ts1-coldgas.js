/* TS-1 — a small nitrogen cold-gas thruster test stand. FICTIONAL.

   Everything a stand is lives in this one data file: the plumbing the physics
   model integrates, the instruments wired to it, the components the operator
   can click on, the alarm limits, the abort sequence, the interlocks and the
   go/no-go stations. The P&ID drawing is in ts1-pid.js. A different stand —
   the bipropellant stand to come — is another file of this shape with a
   different `model`.

   The hardware is representative of a university or small-company cold-gas
   stand, not a copy of any real one. The thruster, CGT-1, is invented. */

import { psi, degC, mm, cc, litre, P_STD } from '../../lib/units.js';
import gonogo from './ts1-gonogo.js';
import pid from './ts1-pid.js';
import { FAULTS, DIAGNOSIS } from '../faults/ts1-faults.js';
import { INSPECTIONS } from '../faults/ts1-inspections.js';
import { interlocks } from './ts1-interlocks.js';
import { predictColdGas } from '../../physics/predict.js';

const AMB = { P: P_STD, T: degC(20) };
const g = x => AMB.P + psi(x);        // psig → Pa absolute

/* ---- physics --------------------------------------------------------- */

const physics = {
  model: 'coldgas',
  gas: 'N2',
  ambient: AMB,
  volumes: [
    { id: 'tank', V: litre(49), P0: g(2200), T0: AMB.T,
      wall: { C: 30000, hA: 15, hAflow: 200, hAamb: 25 } },
    { id: 'sup', V: cc(40), wall: { C: 400, hA: 0.5, hAflow: 100, hAamb: 1 } },
    { id: 'hp', V: cc(25), wall: { C: 400, hA: 0.5, hAflow: 100, hAamb: 1 } },
    { id: 'lp', V: cc(35), wall: { C: 600, hA: 1.0, hAflow: 300, hAamb: 2 } },
    { id: 'feed', V: cc(60), wall: { C: 200, hA: 0.4, hAflow: 600, hAamb: 0.8 } },
    { id: 'chamber', V: cc(2.5), wall: { C: 35, hA: 0.05, hAflow: 60, hAamb: 0.15 } },
  ],
  elements: [
    { id: 'HV-100', type: 'valve', from: 'tank', to: 'sup', CdA: 2.0e-5,
      normally: 'closed', delay: 0, stroke: 2.5, char: 'linear' },
    { id: 'IV-101', type: 'valve', from: 'sup', to: 'hp', CdA: 2.5e-5,
      normally: 'closed', delay: 0.15, strokeOpen: 0.7, strokeClose: 0.5, char: 'ball' },
    { id: 'VV-101', type: 'valve', from: 'hp', to: 'ambient', CdA: 3.0e-6,
      normally: 'open', delay: 0.012, stroke: 0.015 },
    { id: 'PR-101', type: 'regulator', from: 'hp', to: 'lp', CdA: 1.5e-6,
      band: psi(24), tau: 0.001, spe: 0.012, PinRef: psi(2200),
      domeRate: psi(25), domeTau: 0.3 },
    { id: 'RV-201', type: 'relief', from: 'lp', to: 'ambient', CdA: 1.2e-5,
      set: psi(250), accumulation: 0.10, blowdown: 0.08 },
    { id: 'F-201', type: 'filter', from: 'lp', to: 'feed', CdA: 3.0e-5 },
    { id: 'VV-201', type: 'valve', from: 'feed', to: 'ambient', CdA: 5.0e-6,
      normally: 'open', delay: 0.012, stroke: 0.015 },
    // A leak path that is normally shut (CdA 0): the SV-301 inlet fitting.
    // Faults open it; the physics then does the rest.
    { id: 'LK-301', type: 'orifice', from: 'feed', to: 'ambient', CdA: 0, hidden: true },
    { id: 'SV-301', type: 'solenoid', from: 'feed', to: 'chamber', CdA: 1.45e-5,
      normally: 'closed', strokeOpen: 0.0022, strokeClose: 0.0028,
      coil: { volts: 28, ohms: 24, henry: 0.12, backEmf: 0.04,
              pullIn: 0.55, pullInPerPa: 1.8e-7, dropOut: 0.33 } },
    { id: 'NZ-401', type: 'nozzle', from: 'chamber', to: 'ambient',
      nozzle: { throatDia: mm(2.50), exitDia: mm(3.55), Cd: 0.97, halfAngleDeg: 15 } },
  ],
  nozzleElement: 'NZ-401',
  thrustStand: { fn: 120, zeta: 0.10, tareVolume: 'feed', tarePerPa: 0.0020 / psi(1) },
};

/* ---- instrumentation ---------------------------------------------------
   Each sensor names the truth signal it measures and how imperfectly.
     range       [lo, hi] in SI; output saturates a little past both ends
     noise       1σ white noise, SI
     hum         amplitude of 60 Hz mains pickup, SI
     tau         first-order response lag, s
     zeroSigma   1σ of the zero offset each sensor starts the day with (it is
                 removed by zeroing — if zeroing is done at the right time)
     bits        ADC resolution over the range
   Discretes are 0/1 channels (valve commands and limit switches). */

const PT = (id, sig, desc, fs, extra = {}) => ({
  id, kind: 'PT', quantity: 'pressure', gauge: true, signal: sig, desc,
  range: [0, psi(fs)], noise: psi(fs) * 0.00012, hum: psi(fs) * 0.00008,
  tau: 0.0005, zeroSigma: psi(fs) * 0.0012, bits: 16, ...extra,
});
const TC = (id, sig, desc, tau, extra = {}) => ({
  id, kind: 'TC', quantity: 'temperature', signal: sig, desc,
  range: [degC(-200), degC(1250)], noise: 0.12, hum: 0.05, tau, zeroSigma: 0.35, bits: 16,
  zeroable: false, ...extra,
});

const sensors = [
  PT('PT-101', 'Pg:sup', 'Supply pressure (bottle, downstream of HV-100)', 5000, { zeroSigma: psi(5000) * 0.0010 }),
  PT('PT-102', 'Pg:hp', 'Regulator inlet pressure', 5000, { zeroSigma: psi(5000) * 0.0010 }),
  PT('PT-201', 'Pg:lp', 'Regulator outlet pressure', 500),
  PT('PT-301', 'Pg:feed', 'Fire-valve inlet pressure', 500),
  PT('PT-401', 'Pg:chamber', 'Chamber (plenum) pressure', 500, { tau: 0.0002 }),
  TC('TC-101', 'Tw:tank', 'Bottle skin temperature', 4.0),
  TC('TC-301', 'T:feed', 'Feed gas temperature (immersion)', 0.4),
  TC('TC-401', 'Tw:chamber', 'Thruster body temperature', 1.5),
  { id: 'LC-501', kind: 'LC', quantity: 'force', signal: 'F:stand', desc: 'Thrust load cell',
    range: [-50, 50], noise: 0.006, hum: 0.004, tau: 0, zeroSigma: 0.08, bits: 24,
    shuntCal: 25.0 },
  { id: 'EPC-101', kind: 'FB', quantity: 'pressure', gauge: true, signal: 'dome:PR-101',
    desc: 'Regulator dome pressure (EPC feedback)', range: [0, psi(500)], noise: psi(0.05), hum: 0,
    tau: 0.02, zeroSigma: 0, bits: 16, zeroable: false },
  /* A Coriolis mass flowmeter in the feed line: the one INDEPENDENT flow
     measurement on the stand. It is slow (its output is heavily filtered,
     τ ≈ 60 ms), so it misses start transients and sees the line filling,
     but in steady state it is the reference that MDOT-C — flow CALCULATED
     from chamber pressure and an assumed throat — can be checked against. */
  { id: 'FT-201', kind: 'FM', quantity: 'massflow', signal: 'mdot:F-201', desc: 'Feed mass flow (Coriolis meter)',
    range: [0, 0.030], noise: 0.00002, hum: 0, tau: 0.06, zeroSigma: 0.00002, bits: 16, zeroable: false },
  { id: 'SV-301-I', kind: 'I', quantity: 'current', signal: 'I:SV-301', desc: 'Fire-valve coil current',
    range: [0, 2], noise: 0.003, hum: 0.001, tau: 0.00005, zeroSigma: 0.002, bits: 16, zeroable: false },
  { id: 'IV-101-ZSO', kind: 'ZS', quantity: 'discrete', signal: 'zso:IV-101', desc: 'IV-101 open limit switch' },
  { id: 'IV-101-ZSC', kind: 'ZS', quantity: 'discrete', signal: 'zsc:IV-101', desc: 'IV-101 closed limit switch' },
];

/* Channels are what the DAQ records: every sensor, plus command states (from
   the controller, not the physics) and derived channels computed from other
   measured channels. A derived channel is only as good as its inputs AND
   its assumptions — MDOT-C assumes the nominal throat. */
const channels = {
  commands: [
    { id: 'SV-301-CMD', target: 'SV-301', desc: 'Fire valve command' },
    { id: 'IV-101-CMD', target: 'IV-101', desc: 'Isolation valve command' },
    { id: 'VV-101-CMD', target: 'VV-101', desc: 'HP vent command (1 = open)' },
    { id: 'VV-201-CMD', target: 'VV-201', desc: 'Feed vent command (1 = open)' },
  ],
  derived: [
    { id: 'MDOT-C', quantity: 'massflow', desc: 'Mass flow, calculated from PT-401 and TC-301',
      inputs: ['PT-401', 'TC-301'],
      /* Choked-throat mass flow using the NOMINAL throat and Cd, as a data
         system would. If the throat is not nominal, this channel is wrong
         and nothing about it looks wrong. */
      fn: ([pc, tc], k) => {
        const Pc = pc + k.Pamb;
        if (Pc < k.Pamb / 0.528) return 0;
        return k.CdAt * Pc * k.fChoke / Math.sqrt(k.R * tc);
      } },
    { id: 'DP-F201', quantity: 'pressure', gauge: 'd', desc: 'ΔP across F-201 + feed line (PT-201 − PT-301)',
      inputs: ['PT-201', 'PT-301'], fn: ([a, b]) => a - b },
  ],
};

/* ---- components (what clicking one on the P&ID tells you) -------------
   Deliberately only what a test engineer would know from the drawing, the
   data sheet and the instrumentation: never the hidden truth. */
const components = {
  'N2-K': { tag: 'N₂ SUPPLY', name: 'Nitrogen K-bottle', kind: 'Pressurant source',
    specs: { 'Water volume': '49 L', 'Service pressure': '2400 psig', 'Fill at start of day': '≈2200 psig (per tag)', 'Gas': 'Nitrogen, industrial grade' },
    text: 'The stored-gas supply. Its pressure falls as gas is drawn (blowdown) and the gas inside cools as it expands — slowly, because 49 litres of gas has a lot of steel around it to borrow heat from. Nothing on the DAQ reads the bottle directly: PT-101 is downstream of the bottle valve, so it reads zero until HV-100 is opened.',
    ref: ['blowdown', 'pressure-transducer'] },
  'HV-100': { tag: 'HV-100', name: 'Bottle hand valve', kind: 'Manual valve', commandable: 'tech',
    specs: { 'Operation': 'Manual, in-cell only', 'Position indication': 'None' },
    text: 'The cylinder valve. Opened and closed by a technician standing at the bottle, so it can only be operated while the test cell is open to personnel. Opening it pressurises the short supply section up to IV-101 and brings PT-101 to life.',
    ref: ['isolation-valve'] },
  'IV-101': { tag: 'IV-101', name: 'Supply isolation valve', kind: 'Pneumatic ball valve, normally closed', commandable: 'remote',
    specs: { 'Actuator': 'Spring-return pneumatic', 'Fail position': 'CLOSED', 'Stroke': '≈0.7 s open / 0.5 s close', 'Indication': 'Open (ZSO) and closed (ZSC) limit switches' },
    text: 'The remotely operated main isolation between the stored gas and everything downstream. Fail-closed: loss of pneumatic or electrical power shuts off the supply. The HMI shows its position from the limit switches, not from the command — if the two disagree, believe neither until you know why.',
    ref: ['isolation-valve', 'fail-safe'] },
  'VV-101': { tag: 'VV-101', name: 'Regulator-inlet vent valve', kind: 'Solenoid vent, normally OPEN', commandable: 'remote',
    specs: { 'Fail position': 'OPEN (vents)', 'Orifice': 'Small (≈Cv 0.06)', 'Indication': 'Command only' },
    text: 'Vents the high-pressure section between IV-101 and the regulator. Normally-open so that losing power vents the system instead of trapping pressure. It must be commanded CLOSED to pressurise. When the stand is safed with the regulator shut, this is the only way out for the gas trapped between IV-101 and PR-101.',
    ref: ['vent', 'fail-safe', 'trapped-volume'] },
  'PR-101': { tag: 'PR-101', name: 'Dome-loaded pressure regulator', kind: 'Pressure-reducing regulator', commandable: 'setpoint',
    specs: { 'Inlet rating': '4000 psig', 'Outlet range': '0–250 psig', 'Loading': 'Dome, via EPC-101', 'Lock-up': 'at set pressure', 'Droop': 'a few psi at design flow (spec sheet)', 'Relieving': 'No — outlet pressure is only reduced by venting' },
    text: 'Reduces bottle pressure to the test pressure. The setpoint you command is the dome loading pressure; with no flow the outlet locks up at about that value, and with flow it droops a little below it. As the bottle blows down the outlet creeps slightly (supply-pressure effect). If supply falls near the outlet pressure the regulator runs out of authority and the outlet simply follows the supply. It is NON-RELIEVING: lowering the setpoint does not lower the pressure already downstream — that takes a vent.',
    ref: ['regulator', 'droop', 'lock-up'] },
  'EPC-101': { tag: 'EPC-101', name: 'Electronic pressure controller', kind: 'Dome loader', commandable: 'setpoint',
    specs: { 'Slew': '≈25 psi/s', 'Feedback': 'EPC-101 channel (dome pressure)' },
    text: 'Loads the regulator dome to the commanded pressure. It slews at a limited rate, so a new setpoint takes several seconds to arrive — watch its feedback channel rather than assuming the regulator already has what you asked for.',
    ref: ['regulator'] },
  'RV-201': { tag: 'RV-201', name: 'Relief valve', kind: 'Spring-loaded relief',
    specs: { 'Set pressure': '250 psig', 'Full lift': '275 psig', 'Reseat': '≈230 psig', 'Protects': 'Low-pressure section, MAWP 300 psig', 'Indication': 'None' },
    text: 'The last line of protection for the low-pressure plumbing if the regulator fails open. It is set below the maximum allowable working pressure of everything it protects and above the maximum expected operating pressure (200 psig), so it never lifts in normal operation. It has no position indication: you know it lifted because PT-201 stops rising near 250 and you can hear it.',
    ref: ['relief-valve', 'meop'] },
  'F-201': { tag: 'F-201', name: 'Inline filter, 10 µm', kind: 'Filter',
    specs: { 'Rating': '10 µm nominal', 'Clean ΔP': '≈1–3 psi at design flow, incl. feed line', 'Housing': 'Tee-type, cleanable element' },
    text: 'Protects the fire valve seat and the nozzle throat from particles. A filter only shows its pressure drop while gas is flowing — with no flow PT-201 and PT-301 read the same whatever state the element is in. DP-F201 is the channel to watch during a firing.',
    ref: ['pressure-drop'] },
  'VV-201': { tag: 'VV-201', name: 'Feed-line vent valve', kind: 'Solenoid vent, normally OPEN', commandable: 'remote',
    specs: { 'Fail position': 'OPEN (vents)', 'Orifice': '≈Cv 0.1', 'Indication': 'Command only' },
    text: 'Vents the feed line (and, through the filter, the regulator outlet) to the vent stack. Normally-open for the same reason as VV-101. If it is left open while the regulator is set, the regulator will flow gas straight out of the vent — the outlet pressure sags and the vent stack hisses.',
    ref: ['vent', 'fail-safe'] },
  'SV-301': { tag: 'SV-301', name: 'Thruster fire valve', kind: 'Direct-acting solenoid, normally closed', commandable: 'sequencer',
    specs: { 'Coil': '28 VDC, ≈24 Ω', 'Fail position': 'CLOSED', 'Response': 'a few ms (spec sheet); depends on inlet pressure', 'Indication': 'Coil current (SV-301-I). No position sensor.' },
    text: 'The valve that fires the thruster. It is only ever opened by the firing sequencer, and only when the fire circuit is armed. It has no position sensor: whether it actually opened is inferred from its coil current (a dip as the armature pulls in) and from the chamber pressure rising behind it.',
    ref: ['solenoid-valve', 'interlock'] },
  'CGT-1': { tag: 'CGT-1', name: 'Cold-gas research thruster (fictional)', kind: 'Test article',
    specs: { 'Serial': 'S/N 002', 'Nozzle': 'N-02, conical 15°', 'Throat Ø (drawing)': '2.50 mm', 'Exit Ø (drawing)': '3.55 mm', 'Expansion ratio': '2.0 (sea-level development nozzle)', 'Chamber volume': '≈2.5 cm³ incl. valve outlet' },
    text: 'A deliberately simple nitrogen thruster: a solenoid valve feeding a small plenum and a short conical nozzle. Its expansion ratio is chosen to run near-matched at sea level at about 150 psia chamber pressure. A flight cold-gas thruster would have a much larger expansion ratio and would be tested in vacuum; at sea level such a nozzle would run separated.',
    ref: ['chamber-pressure', 'thrust-coefficient', 'specific-impulse'] },
  'LC-501': { tag: 'LC-501', name: 'Thrust stand load cell', kind: 'Strain-gauge load cell on flexure stand',
    specs: { 'Range': '±50 N', 'Shunt-cal equivalent': '25.00 N', 'Stand natural frequency': '≈120 Hz (hammer test)', 'Excitation': '10 V bridge' },
    text: 'Measures thrust through a flexure-mounted platform. The stand is a mass on a spring: a sharp thrust step makes it ring near its natural frequency before settling. Pressurising the feed line also loads the stand slightly (pressure tare), so the zero you take with the system vented is not the zero you fire from.',
    ref: ['load-cell', 'shunt-calibration', 'pressure-tare'] },
};

/* Which components carry which instruments, for the inspector. */
const componentSensors = {
  'N2-K': ['TC-101'], 'HV-100': ['PT-101'], 'IV-101': ['IV-101-ZSO', 'IV-101-ZSC', 'PT-101', 'PT-102'],
  'VV-101': ['PT-102'], 'PR-101': ['PT-102', 'PT-201', 'EPC-101'], 'EPC-101': ['EPC-101'],
  'RV-201': ['PT-201'], 'F-201': ['PT-201', 'PT-301', 'DP-F201', 'FT-201'], 'VV-201': ['PT-301'],
  'SV-301': ['SV-301-I', 'PT-301', 'PT-401'], 'CGT-1': ['PT-401', 'TC-401', 'MDOT-C', 'FT-201'], 'LC-501': ['LC-501'],
};

/* ---- limits ----------------------------------------------------------
   level:  caution (amber, advisory) | warning (orange, act) | redline (red)
   action: 'alarm' — tell the operator; 'abort' — the sequencer aborts.
   persist: seconds a limit must be exceeded before it trips. Without it, a
            single noise spike would abort a test.
   when(ctx): the limit is only armed in this condition (a chamber-pressure
            LOW limit means nothing before the valve has opened). */
const limits = [
  { id: 'PT101-LO', channel: 'PT-101', lo: psi(800), level: 'caution', persist: 1.0,
    when: c => c.armed, text: 'Supply pressure low for test — regulator may drop out' },
  { id: 'PT101-HI', channel: 'PT-101', hi: psi(2650), level: 'warning', persist: 0.5,
    text: 'Supply pressure above bottle service pressure' },
  { id: 'PT201-HI', channel: 'PT-201', hi: c => c.regSet + psi(15), level: 'caution', persist: 1.0,
    when: c => c.regSet > psi(20) && c.domeSettled, text: 'Regulator outlet above setpoint' },
  { id: 'PT201-LO', channel: 'PT-201', lo: c => c.regSet - psi(20), level: 'caution', persist: 1.5,
    when: c => c.armed && !c.flowing && c.regSet > psi(40) && c.domeSettled, text: 'Regulator outlet below setpoint (not flowing)' },
  { id: 'PT201-RL', channel: 'PT-201', hi: psi(235), level: 'redline', action: 'abort', persist: 0.05,
    text: 'regulator outlet overpressure' },
  { id: 'PT301-RL', channel: 'PT-301', hi: psi(235), level: 'redline', action: 'abort', persist: 0.05,
    text: 'feed pressure overpressure' },
  { id: 'PT401-HI', channel: 'PT-401', hi: c => c.regSet + psi(25), level: 'redline', action: 'abort', persist: 0.05,
    when: c => c.firing, text: 'chamber pressure high' },
  { id: 'PT401-LO', channel: 'PT-401', lo: c => c.regSet * 0.5, level: 'redline', action: 'abort', persist: 0.05,
    when: c => c.burning && c.Tburn > 0.25, text: 'chamber pressure low during burn' },
  { id: 'LC501-DEV', channel: 'LC-501', lo: c => c.predF * 0.8, hi: c => c.predF * 1.2, level: 'caution', persist: 0.3,
    when: c => c.burning && c.Tburn > 0.3 && c.predF > 0.5, text: 'Thrust out of family (±20 % of pre-test prediction)' },
  { id: 'TC301-LO', channel: 'TC-301', lo: degC(-40), level: 'caution', persist: 1.0,
    text: 'Feed gas below −40 °C (soft-seal temperature limit)' },
  { id: 'TC401-LO', channel: 'TC-401', lo: degC(-30), level: 'caution', persist: 1.0,
    text: 'Thruster body below −30 °C' },
  { id: 'SV301-I-LO', channel: 'SV-301-I', lo: 0.9, level: 'warning', persist: 0.05,
    when: c => c.burning && c.Tburn > 0.03, text: 'Fire-valve coil current low while commanded open' },
  { id: 'SV301-I-UNCMD', channel: 'SV-301-I', hi: 0.15, level: 'warning', persist: 0.1,
    when: c => !c.svCmd && c.sinceSvOff > 0.1, text: 'Fire-valve coil energised without command' },
];

/* What an automatic or manual abort does, in order. `at` is seconds after
   the abort. Cold gas is simple: stop the flow, isolate the supply, drop the
   regulator, vent. */
const abortSequence = [
  { at: 0.00, id: 'SV-301', value: 0, text: 'SV-301 fire valve CLOSE' },
  { at: 0.00, id: 'IV-101', value: 0, text: 'IV-101 supply isolation CLOSE' },
  { at: 0.10, id: 'PR-101', value: 0, text: 'PR-101 regulator setpoint → 0' },
  { at: 1.00, id: 'VV-201', value: 1, text: 'VV-201 feed vent OPEN' },
  { at: 1.20, id: 'VV-101', value: 1, text: 'VV-101 HP vent OPEN' },
  { at: 1.30, id: 'DISARM', value: 0, text: 'Fire circuit DISARM' },
];

/* Operating limits of the stand — shown in the reference and used by the
   interlocks. */
const ratings = {
  MEOP_LP: psi(200),        // max expected operating pressure, low-pressure side
  RELIEF_LP: psi(250),
  MAWP_LP: psi(300),
  PERSONNEL_MAX: psi(50),   // personnel may be in the cell below this
  REG_MAX_CMD: psi(240),
  SUPPLY_MIN: psi(800),
  VENTED: psi(3),           // "vented" means everything below this
  MAX_BURN: 30,             // s, longest single burn the sequencer accepts
};

export default {
  id: 'TS-1',
  program: 'coldgas',
  name: 'TS-1 Cold-Gas Thruster Stand',
  short: 'TS-1 · N₂ cold gas',
  article: 'CGT-1 S/N 002 · nozzle N-02',
  fictional: true,
  physics,
  sensors,
  channels,
  components,
  componentSensors,
  limits,
  abortSequence,
  ratings,
  gonogo,
  pid,
  faults: FAULTS,
  diagnosis: DIAGNOSIS,
  inspections: INSPECTIONS,
  /* Nominal geometry the data system and the test predictions assume. */
  nominal: { throatDia: mm(2.50), exitDia: mm(3.55), Cd: 0.97 },
  /* Which instrument indicates which P&ID line segment (for the HMI's
     derived line state). */
  segmentSensors: { sup: 'PT-101', hp: 'PT-102', lp: 'PT-201', feed: 'PT-301', chamber: 'PT-401' },
  /* How the controller's valve list is presented (order = console order). */
  consoleValves: [
    { id: 'IV-101', label: 'IV-101 Supply isolation', kind: 'remote' },
    { id: 'VV-101', label: 'VV-101 HP vent', kind: 'remote', vent: true },
    { id: 'VV-201', label: 'VV-201 Feed vent', kind: 'remote', vent: true },
    { id: 'HV-100', label: 'HV-100 Bottle valve', kind: 'tech' },
  ],
  /* Valves with position indication, for the command/indication disagree
     alarm. */
  indications: [{ valve: 'IV-101', zso: 'IV-101-ZSO', zsc: 'IV-101-ZSC', timeout: 2.0 }],
  regulator: 'PR-101',
  fireValve: 'SV-301',
  supplyIso: 'IV-101',
  supplyChannel: 'PT-101',
  loadCell: 'LC-501',
  lpChannels: ['PT-102', 'PT-201', 'PT-301', 'PT-401'],
  ventElements: ['VV-101', 'VV-201', 'RV-201', 'LK-301'],
  pneumaticValves: ['IV-101'],
  interlocks,
  /* The prediction: the nominal stand at the measured supply (or the
     request's assumption) and the commanded setpoint. */
  predict(S) {
    const supply = S.request?.supplyAssumed ?? psi(2200);
    let sup = S.daq.online ? S.daq.latest('PT-101') : NaN;
    if (!(sup > psi(300))) sup = supply;
    const c = S.controller;
    const regSet = c.regSet > psi(5) ? c.regSet : (S.request?.regSet ?? psi(150));
    return predictColdGas(S.def, { supplyGauge: sup, regSet });
  },
  alarmCtx(S, base) {
    const c = S.controller;
    return { ...base,
      domeSettled: Math.abs(S.daq.latest('EPC-101') - c.regSet) < psi(5),
      flowing: base.svCmd || c.cmd['VV-101'] === 1 || c.cmd['VV-201'] === 1,
      predF: S.prediction ? S.prediction.F : 0 };
  },
};
