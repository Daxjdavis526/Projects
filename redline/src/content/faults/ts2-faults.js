/* Faults for TS-2 — the bipropellant stand, cold flow and hot fire.

   Same contract as ts1-faults.js: a fault is never announced; it changes the
   physics or a measurement, and the operator finds it from the data and the
   inspections. Most of these only show themselves with propellant flowing,
   and several only with fire — a hot-fire campaign is where a biprop
   engine's problems live.

   All hardware here is fictional. The failure mechanisms are the ordinary
   ones every pressure-fed engine stand has. */

import { psi, degC } from '../../lib/units.js';

const sign = rng => (rng.chance(0.5) ? 1 : -1);
const fmtP = x => `${(x / psi(1)).toFixed(0)} psi`;
const pct = x => `${(x * 100).toFixed(0)} %`;

export const FAULTS = [
  /* ---- ignition -------------------------------------------------------- */
  { id: 'ign-nospark', component: 'IGN-901', mode: 'no-spark', category: 'system', hazard: true, onset: 'start',
    apply: S => { S.model.chamber.igniter.fail = true; },
    evidence: ['OD-804', 'IGN-I', 'PT-801', 'spark-check', 'inspect-igniter'],
    inspect: { 'inspect-igniter': () => ({ lines: [
      ['Plug electrode gap', '0.0 mm — electrodes bridged by a carbon/oxide deposit', '1.0 ± 0.1 mm'],
      ['Insulator', 'tracked: a carbon path down the ceramic', 'clean'], ['Exciter output (bench)', 'normal', 'normal']],
      text: 'The exciter is fine and drives its full current — straight down a carbon track and across bridged electrodes. Energy delivered, no spark gap to jump.' }) },
    story: () => ({
      what: 'IGN-901\'s plug had a carbon-bridged gap. The exciter drew its normal current, so everything electrical looked right, but there was no spark: the engine never lit, and both propellants sprayed through the nozzle until the ignition check aborted the run.',
      indicators: 'OD-804 stayed dark through the igniter-on period — before T-0 it should show the faint spark glow (≈0.6 V), here it read cell-dark. PT-801 never rose after both manifolds primed. The flowmeters read propellant flowing.',
      misleading: 'IGN-I read a healthy 1.8 A. Exciter current proves the exciter and the wiring, not the spark.',
      notice: 'Before T-0: the flame detector sees the spark. A spark check at the start of the day — a technician watching it through the nozzle — would have shown nothing at the plug.',
      abort: 'A genuine hazard: unburned oxidiser and fuel in the cell. The ignition-check redline abort and the purge were right. Do NOT re-fire until the cell is clear and the cause is known — an igniter that works next time lights whatever has collected.',
      expert: 'Separate "the box is powered" from "the function happened". Current says the first; the spark (camera, photodiode, the technician\'s eyes) says the second.',
    }) },
  { id: 'ign-open', component: 'IGN-901', mode: 'fail-closed-elec', category: 'system', hazard: true, onset: 'start',
    apply: S => { S.model.chamber.igniter.open = true; },
    evidence: ['IGN-I', 'OD-804', 'PT-801', 'spark-check', 'continuity'],
    inspect: { 'inspect-igniter': () => ({ lines: [['Plug electrode gap', '1.0 mm', '1.0 ± 0.1 mm'], ['HT lead connector at the plug', 'not seated — backed off half a turn', 'seated, locked']],
      text: 'The plug is good. Its high-tension lead was never locked onto it.' }) },
    story: () => ({
      what: 'IGN-901\'s high-tension lead was not seated: the exciter had no load, drew no current, and produced no spark. The engine did not light.',
      indicators: 'IGN-I read zero while the igniter command was on — a dead circuit, visible from T−0.5 s, before any propellant moved. OD-804 stayed dark, PT-801 never rose.',
      misleading: 'The igniter command channel showed ON. A command is what the computer asked for.',
      notice: 'IGN-I at the moment the igniter is commanded, before the main valves open. A hold there costs nothing.',
      abort: 'A hazard: unburned propellants. The ignition-check abort was right. Fix and spark-check before the next attempt.',
      expert: 'Command, current, effect: three independent proofs of an actuation. Here the second failed — and it failed early enough to hold the sequence if anyone had been watching it.',
    }) },
  { id: 'ign-weak', component: 'IGN-901', mode: 'ign-weak', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ d: 0.06 + rng.uniform(0, 0.06) }),
    apply: (S, p) => { S.model.chamber.igniter.weak = p.d; },
    evidence: ['OD-804', 'PT-801', 'VIB-805', 'start-transient', 'inspect-igniter', 'spark-check'],
    inspect: { 'inspect-igniter': () => ({ lines: [
      ['Plug electrode gap', '2.2 mm — centre electrode eroded', '1.0 ± 0.1 mm'], ['Spark (bench, 1 atm)', 'intermittent, thin and orange', 'regular, blue-white']],
      text: 'An eroded plug: the gap has opened to twice its drawing value. It still sparks, irregularly and weakly — enough to light the engine, eventually.' }),
      'spark-check': () => ({ lines: [['Spark at the plug', 'irregular, weak, thin orange', 'regular, strong, blue']], text: '' }) },
    story: p => ({
      what: `IGN-901's plug was eroded to a wide gap. It still lit the engine — about ${(p.d * 1e3).toFixed(0)} ms late. In that time both propellants kept arriving and wetting the chamber, and when the flame found them they went at once: a HARD START.`,
      indicators: 'Flame (OD-804) came later after the manifolds primed than on earlier runs; PT-801 spiked far above its steady level in the first few milliseconds and the vibration channel jumped. The overpressure redline, if it caught it.',
      misleading: 'The steady part of the run, if there was one, is perfectly normal — c*, MR, Pc all on prediction. Everything wrong happened in the first 50 ms.',
      notice: 'The start transient. Compare valve-to-flame time and peak Pc with the good runs; a few tens of ms later is the warning, and the spark check shows the plug.',
      abort: 'A hard start can crack an injector or a chamber. The redline abort was right, and the engine needs an inspection before another start.',
      expert: 'Ignition delay is the variable that makes starts hard. Track valve-to-flame time on every run: it drifts before it fails.',
    }) },

  /* ---- injector -------------------------------------------------------- */
  { id: 'ox-inj-blocked', component: 'BPE-1', mode: 'obstructed', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ b: 0.14 + rng.uniform(0, 0.1) }),
    apply: (S, p) => { S.model.line('ox').injBlockage = p.b; },
    evidence: ['PT-715', 'FT-714', 'DP-OXI', 'MR-C', 'CDA-OX', 'inspect-injector', 'flow-bench', 'prediction'],
    inspect: { 'inspect-injector': (S, p) => ({ lines: [
      ['Oxidiser orifices', `${Math.max(1, Math.round(p.b * 16))} of 16 plugged — PTFE tape shreds`, 'all clear'], ['Fuel orifices', 'all clear', 'all clear'], ['Face', 'clean, no erosion', 'clean']],
      text: 'Thread-seal tape from a fitting upstream migrated into the oxidiser manifold and lodged in the orifices.' }) },
    story: p => ({
      what: `About ${pct(p.b)} of the oxidiser injector's flow area was plugged by shreds of thread-seal tape. Less oxidiser flowed at the same tank pressure, so the engine ran fuel-rich: lower mixture ratio, lower chamber pressure and thrust.`,
      indicators: 'PT-715 (oxidiser manifold) read HIGHER than on earlier runs while FT-714 read LOWER — a restriction downstream of the manifold transducer. The oxidiser CdA from the reduction fell; the fuel side was unchanged; MR dropped.',
      misleading: 'Lower thrust and Pc could be a regulator or a c* problem. The fuel side being exactly nominal, and the oxidiser manifold being high not low, rules out anything upstream.',
      notice: 'Injector ΔP versus flow, per side, against the cold-flow calibration. One side\'s CdA moving is the injector.',
      abort: 'Not a hazard at this size: a fuel-rich engine runs cooler. The data are off-condition; stop and fix.',
      expert: 'Walk each side: tank → valve inlet → manifold → chamber. A manifold pressure that rose while flow fell has only one explanation — less area at the orifices.',
    }) },
  { id: 'fu-inj-eroded', component: 'BPE-1', mode: 'eroded', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ k: 1.45 + rng.uniform(0, 0.25) }),
    apply: (S, p) => { S.model.line('fu').CdAinj *= p.k; },
    evidence: ['PT-725', 'FT-724', 'DP-FUI', 'CDA-FU', 'MR-C', 'VIB-805', 'flow-bench', 'inspect-injector', 'stiffness'],
    inspect: { 'inspect-injector': () => ({ lines: [
      ['Fuel orifices', 'entrances rounded, bores visibly oversize', 'sharp-edged, drawing size'], ['Oxidiser orifices', 'clear, sharp', 'clear, sharp'],
      ['Face', 'light streaking downstream of the fuel elements', 'clean']],
      text: 'The fuel orifices have been opened up — by a reamer that was the wrong size at manufacture, then rounded by flow.' }) },
    story: p => ({
      what: `The fuel injector's flow area was about ${pct(p.k - 1)} larger than its cold-flow value. More fuel flowed at the same tank pressure — fuel-rich — and, worse, the fuel injector pressure drop fell, making the injector "soft".`,
      indicators: 'FT-724 up, PT-725 (fuel manifold) down, fuel CdA up in the reduction. Injector stiffness (ΔP/Pc) on the fuel side well below the oxidiser side — and roughness and vibration above the earlier runs: the start of chug.',
      misleading: 'The thrust is about normal. A fuel-rich engine at higher total flow still produces its rated thrust; it is the mixture ratio and the stiffness that are wrong.',
      notice: 'The stiffness rows of the reduction. Below about 0.2 this engine couples to its feed system.',
      abort: 'Chug can grow to destructive amplitude, so the vibration redline is the protection. A soft injector is not fit to fire until replaced or recalibrated.',
      expert: 'Re-flow the injector on water and compare its CdA with the original cold flow. An injector is calibrated hardware; when its calibration moves, the engine moved with it.',
    }) },

  /* ---- combustion and chamber ----------------------------------------- */
  { id: 'hf-instability', component: 'BPE-1', mode: 'instability', category: 'system', hazard: true, onset: { fire: 0.6 },
    params: rng => ({ g: 75 + rng.uniform(0, 50) }),
    apply: (S, p) => { S.model.chamber.hf.drive = p.g; },
    evidence: ['VIB-805', 'PT-801', 'TC-803', 'inspect-chamber', 'inspect-injector'],
    inspect: { 'inspect-chamber': () => ({ lines: [
      ['Chamber wall', 'local erosion and heat tint in a ring near the injector face', 'even heat tint'],
      ['Throat', 'streaks; diameter unchanged', 'smooth'], ['Injector face', 'one oxidiser element\'s impingement point visibly shifted — a bent tube', 'all elements aligned']],
      text: 'One injector element was knocked out of alignment (a dropped tool during the last inspection). The misaligned stream put its energy release where the chamber\'s first acoustic mode is most sensitive.' }) },
    story: () => ({
      what: 'High-frequency combustion instability (screech): a chamber acoustic mode at about 3.3 kHz grew until it dominated. The wall heat flux multiplied and the vibration level went off-scale.',
      indicators: 'VIB-805 rose from its usual fraction of a g to tens of g in tens of milliseconds, mid-burn, with no change in tank pressures or flows. PT-801\'s mean stayed near normal but its noise band widened enormously. TC-803 heated faster than on any earlier run.',
      misleading: 'At the DAQ\'s sample rate a 3.3 kHz oscillation aliases: PT-801 looks like broadband noise, not a tone. It is not a sensor fault — every engine channel saw it at once.',
      notice: 'VIB-805. Screech arrives fast; the redline is the only thing quick enough, and it is set for exactly this.',
      abort: 'The automatic vibration abort was right. Screech can burn through a chamber wall in well under a second.',
      expert: 'Instability that appears on hardware that was stable is a change in the hardware. Look at the injector face first.',
    }) },
  { id: 'film-loss', component: 'BPE-1', mode: 'film-cooling', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ f: 1.35 + rng.uniform(0, 0.25) }),
    apply: (S, p) => { S.model.chamber.film = p.f; },
    evidence: ['TC-803', 'TC-802', 'inspect-injector', 'inspect-chamber'],
    inspect: { 'inspect-injector': () => ({ lines: [['Fuel film-cooling holes (outer ring)', '9 of 24 blocked with a varnish deposit', 'all clear'], ['Main orifices', 'clear', 'clear']],
      text: 'The outer ring of small fuel holes that lays a cool film along the chamber wall is partly blocked: fuel residue left to bake after an earlier run without a post-purge.' }) },
    story: p => ({
      what: `The film-cooling ring was partly blocked, so the wall saw about ${pct(p.f - 1)} more heat flux than designed. Everything else about the engine — flows, Pc, c* — was normal.`,
      indicators: 'TC-803 and TC-802 heating faster than on earlier runs at the same chamber pressure; the throat caution and redline coming earlier in the burn. Flows and c* unchanged.',
      misleading: 'c* and Isp are normal (a little high, if anything: less fuel is wasted in the film). The performance numbers say the engine is fine.',
      notice: 'Wall temperature rise rate per second of burn, compared run to run. A heat-sink chamber is a calorimeter; use it.',
      abort: 'The throat redline exists for this. A burn that runs to the redline is a burn that was planned too long for the hardware as it is.',
      expert: 'And the root cause behind the root cause: residue baked on because a run ended without its post-purge. Procedures have reasons.',
    }) },

  /* ---- feed system ----------------------------------------------------- */
  { id: 'ox-reg-droop', component: 'PR-610', mode: 'droop', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ scale: 14 + rng.uniform(0, 6) }),
    apply: (S, p) => { S.model.element('PR-610').droopScale = p.scale; },
    evidence: ['PT-710', 'FT-714', 'MR-C', 'droop', 'check-regulator', 'prediction'],
    inspect: { 'check-regulator': (S, p) => ({ lines: [
      ['PR-610 lock-up, dome 400 psig', '400.6 psig', '400 ± 5 psig'], ['PR-610 droop at test flow', `${(1.3 * p.scale).toFixed(0)} psi`, '≤ 8 psi'],
      ['PR-620 lock-up / droop', '400.2 psig / 1.3 psi', '400 ± 5 / ≤ 8 psi']],
      text: 'PR-610 locks up correctly but needs a large error before it opens: its sensing diaphragm has hardened.' }) },
    story: p => ({
      what: `PR-610 drooped about ${(1.3 * p.scale).toFixed(0)} psi under flow instead of a psi or two. The oxidiser tank sagged once the engine was running, so oxidiser flow fell and the mixture ratio with it.`,
      indicators: 'PT-710 (ox tank) stepped down at T-0 and stayed down while PT-720 (fuel tank) held; FT-714 and MR below prediction. Static readings perfect.',
      misleading: 'Low oxidiser flow with low oxidiser manifold pressure looks like an injector or valve problem until you look one transducer further upstream.',
      notice: 'Tank droop (lock-up minus flowing) on each side in the reduction — the cold flow measured it for this regulator.',
      abort: 'Not a hazard. The run is off-condition.',
      expert: 'A mixture ratio shift has two sides. Find which side moved, then walk that side upstream until the pressure stops being wrong.',
    }) },
  { id: 'pr620-set', component: 'PR-620', alt: ['EPC-620'], mode: 'set-wrong', category: 'system', hazard: false, onset: 'start',
    params: rng => ({ bias: sign(rng) * psi(30 + rng.uniform(0, 20)) }),
    apply: (S, p) => { S.model.element('PR-620').setBias = p.bias; },
    evidence: ['PT-720', 'EPC-620', 'MR-C', 'FT-724', 'go-no-go', 'check-regulator'],
    inspect: { 'check-regulator': (S, p) => ({ lines: [
      ['PR-610 lock-up, dome 400 psig', '400.4 psig', '400 ± 5 psig'],
      ['PR-620 lock-up, dome 400 psig', `${(400 + p.bias / psi(1)).toFixed(1)} psig`, '400 ± 5 psig']],
      text: 'PR-620\'s reference spring was adjusted during its last overhaul and not reset.' }) },
    story: p => ({
      what: `PR-620 regulated the fuel tank ${fmtP(Math.abs(p.bias))} ${p.bias > 0 ? 'above' : 'below'} its setpoint. Fuel flow, and so mixture ratio, followed.`,
      indicators: 'PT-720 locked up away from its setpoint while EPC-620\'s feedback read exactly the setpoint, and PT-710 sat on its own. MR off prediction in the direction the fuel tank was wrong.',
      misleading: 'The EPC feedback is the dome, not the tank.',
      notice: 'The go/no-go PROP readings of both tank pressures against their setpoints, before arming.',
      abort: 'Not a hazard. NO-GO before firing was the right call.',
      expert: 'Two tanks, two regulators: compare each with its own setpoint, not with each other.',
    }) },
  { id: 'mfv-slow', component: 'MFV-723', mode: 'slow', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ k: 3 + rng.uniform(0, 1.5) }),
    apply: (S, p) => { S.model.element('MFV-723').strokeScale = p.k; },
    evidence: ['MFV-723-ZSO', 'PT-725', 'PT-801', 'start-transient', 'valve-stroke'],
    inspect: { 'valve-stroke': (S, p) => ({ lines: [
      ['MOV-713 open stroke', '0.25 s', '0.25 ± 0.05 s'], ['MFV-723 open stroke', `${(0.25 * p.k).toFixed(2)} s`, '0.25 ± 0.05 s'],
      ['MFV-723 actuator supply', 'regulator at 35 psig', '80 psig']],
      text: 'MFV-723\'s actuator air regulator was set low after a maintenance task. The valve still opens fully — slowly.' }) },
    story: p => ({
      what: `MFV-723 opened about ${p.k.toFixed(1)}× slower than normal, so fuel reached the injector well after the oxidiser even with a zero-lead sequence: an oxidiser lead nobody planned, and a rough or hard start.`,
      indicators: 'MFV-723\'s open limit switch (ZSO) arrived late against MOV-713\'s; PT-725 rose later and slower than PT-715; the start overshoot and valve-to-flame time grew.',
      misleading: 'The sequence plan says zero lead, and the commands show zero lead. The valve is not the command.',
      notice: 'The limit-switch timing on every run. Command-to-ZSO is the valve\'s health in one number.',
      abort: 'A hard start is hardware-threatening. If the redline caught it, right; if not, inspect the engine.',
      expert: 'Starts are set by what the valves DO. Time the stroke on the stand, and re-time it after anyone touches the pneumatics.',
    }) },

  /* ---- instruments ----------------------------------------------------- */
  { id: 'ft724-kfactor', component: 'FT-724', mode: 'cal', category: 'sensor', hazard: false, onset: 'start',
    params: rng => ({ k: 1 + sign(rng) * (0.1 + rng.uniform(0, 0.06)) }),
    apply: (S, p) => { S.daq.sensor('FT-724').chainGain = p.k; },
    evidence: ['FT-724', 'WT-726', 'MR-C', 'meter-bench', 'scale-vs-meter'],
    inspect: { 'meter-bench': (S, p) => ({ lines: [
      ['FT-714 K-factor (water bench)', 'within 0.3 % of its certificate', '± 0.5 %'], ['FT-724 K-factor (water bench)', `${((p.k - 1) * 100).toFixed(1)} % from the value in the DAQ`, '± 0.5 %'],
      ['FT-724 certificate in the DAQ', 'belongs to serial 0411 — the meter installed is 0418', 'matching serial']],
      text: 'The meter was swapped; its calibration file was not.' }) },
    story: p => ({
      what: `FT-724 read ${pct(Math.abs(p.k - 1))} ${p.k > 1 ? 'high' : 'low'}: the DAQ held the calibration of a different meter. The fuel flow was right; its measurement was not.`,
      indicators: 'The weighed fuel flow (the slope of WT-726) disagreed with FT-724 while the oxidiser meter and scale agreed. The metered mixture ratio and c* were off; the weighed ones were not.',
      misleading: 'Everything in the reduction computed from FT-724 — mixture ratio, c*, Isp — moved together and looks like an engine change.',
      notice: 'Meter-versus-scale on each side, every run: two independent measurements of the same flow.',
      abort: 'Not a hazard. The data need re-reducing with the right calibration.',
      expert: 'Before believing a performance change, ask whether the engine changed or a measurement did. A second, independent measurement settles it.',
    }) },
  { id: 'pt801-bias', component: 'PT-801', mode: 'bias', category: 'sensor', hazard: false, onset: 'pressurised',
    params: rng => ({ bias: psi(22 + rng.uniform(0, 14)) }),
    apply: (S, p) => { S.daq.sensor('PT-801').bias = p.bias; },
    evidence: ['PT-801', 'LC-901', 'CSTAR-C', 'static-agreement', 'reference-gauge'],
    inspect: { 'reference-gauge': (S, p) => ({ lines: [
      ['PT-801 with the chamber open to the cell', `${(p.bias / psi(1)).toFixed(1)} psig`, '0.0 ± 0.5 psig'], ['Others', 'agree within 0.5 psi', 'agree within 0.5 psi']],
      text: 'PT-801\'s zero has shifted since it was zeroed this morning — the transducer took a thermal shock from the last run\'s soak-back through its standoff.' }) },
    story: p => ({
      what: `PT-801's zero shifted about ${fmtP(p.bias)} high after zeroing. Chamber pressure read high, and everything computed from it — c*, η_c*, Cf — with it.`,
      indicators: 'PT-801 read a steady positive pressure with the chamber open to the cell (nothing can hold pressure in an open nozzle). In the reduction c* efficiency came out above what the engine had shown, and Cf below — while thrust (LC-901) and both flows were unchanged.',
      misleading: 'A "better c*" is good news, so nobody questions it.',
      notice: 'Look at PT-801 at rest before every run. An open chamber is at ambient pressure by definition.',
      abort: 'Not a hazard — unless it reads LOW, which would hide a real overpressure. It is a NO-GO either way until re-zeroed.',
      expert: 'Use the physics as a reference: thrust and flows did not change, so a chamber pressure change is the transducer.',
    }) },
  { id: 'tc803-open', component: 'TC-803', mode: 'failed', category: 'sensor', hazard: false, onset: { fire: 0.9 },
    apply: S => { S.daq.sensor('TC-803').open = true; },
    evidence: ['TC-803', 'TC-802', 'continuity', 'inspect-tc'],
    inspect: { 'inspect-tc': () => ({ lines: [['TC-803 junction', 'wire broken at the sheath exit — fatigue crack', 'intact'], ['TC-802', 'intact', 'intact']],
      text: 'Vibration fatigued the thermocouple lead where it leaves its clamp.' }) },
    story: () => ({
      what: 'TC-803\'s lead broke during the burn. An open thermocouple reads full scale, so the throat-temperature redline tripped on a temperature the throat never had.',
      indicators: 'TC-803 jumped from a plausible value to full scale in one sample — no copper throat heats by a thousand degrees in a millisecond — while TC-802, a hand-span away, carried on rising smoothly. Afterwards the loop check reads open.',
      misleading: 'A throat redline is the most believable abort on a heat-sink chamber.',
      notice: 'The rate. Physical temperatures have time constants; open circuits do not.',
      abort: 'The automatic abort was correct behaviour on the data it had. The fault was not a hazard — but the system could not know that, and neither could you in the moment.',
      expert: 'After the abort, before anything else: is the measurement physically possible? Then a loop check from the rack, which takes thirty seconds.',
    }) },
];

/* The failure-mode vocabulary for TS-2: TS-1's, plus what an engine adds. */
export const FAILURE_MODES = [
  ['none', 'No fault — hardware and instruments nominal', 'none'],
  ['set-wrong', 'Set incorrectly / wrong setting', 'control'],
  ['droop', 'Excessive droop / cannot hold outlet under flow', 'control'],
  ['creep', 'Seat leak — will not lock up (creep)', 'control'],
  ['stuck', 'Stuck / jammed', 'control'],
  ['supply-low', 'Supply pressure too low', 'control'],
  ['not-open', 'Not fully open', 'flow'],
  ['restricted', 'Blocked / restricted', 'flow'],
  ['obstructed', 'Obstructed (foreign object)', 'flow'],
  ['eroded', 'Eroded / oversized', 'flow'],
  ['ext-leak', 'External leak', 'flow'],
  ['int-leak', 'Internal leak (through the seat)', 'flow'],
  ['slow', 'Slow to open', 'actuation'],
  ['fail-closed-mech', 'Fails to open — mechanical', 'actuation'],
  ['fail-closed-elec', 'Fails to operate — electrical', 'actuation'],
  ['no-spark', 'No spark (igniter energised, no ignition source)', 'ignition'],
  ['ign-weak', 'Weak / late ignition', 'ignition'],
  ['instability', 'Combustion instability', 'combustion'],
  ['film-cooling', 'Loss of film cooling', 'combustion'],
  ['bias', 'Sensor bias / zero offset', 'sensor'],
  ['cal', 'Sensor calibration / scaling error', 'sensor'],
  ['drift', 'Sensor drift', 'sensor'],
  ['failed', 'Sensor failed (open circuit / off-scale)', 'sensor'],
  ['noise', 'Electrical noise / grounding', 'sensor'],
  ['disconnected', 'Disconnected / intermittent', 'sensor'],
];

export const ACTIONS = [
  ['repair', 'Repair or replace the component, then retest'],
  ['clean', 'Clean / flush, re-cold-flow to recalibrate, then retest'],
  ['recal', 'Recalibrate / re-zero the instrument and re-reduce the data'],
  ['wiring', 'Repair wiring, connector or shielding'],
  ['config', 'Correct the configuration or setting, then retest'],
  ['continue', 'No action — hardware nominal; continue testing'],
  ['retest', 'Repeat the test to confirm before acting'],
];

export const RIGHT_ACTION = {
  none: ['continue'], 'set-wrong': ['config', 'repair'], droop: ['repair'], creep: ['repair'], stuck: ['repair'], 'supply-low': ['config'],
  'not-open': ['repair'], restricted: ['clean', 'repair'], obstructed: ['clean', 'repair'], eroded: ['repair'], 'ext-leak': ['repair'],
  'int-leak': ['repair'], slow: ['repair', 'config'], 'fail-closed-mech': ['repair'], 'fail-closed-elec': ['wiring', 'repair'],
  'no-spark': ['repair', 'clean'], 'ign-weak': ['repair'], instability: ['repair'], 'film-cooling': ['clean', 'repair'],
  bias: ['recal'], cal: ['recal'], drift: ['repair', 'recal'], failed: ['wiring', 'repair'], noise: ['wiring'], disconnected: ['wiring'],
};

export const CHECKS = [
  ['go-no-go', 'Go/no-go poll data'],
  ['prediction', 'Comparison with the pre-test prediction'],
  ['static-agreement', 'Static readings at rest (zeros, lock-up)'],
  ['leak-check', 'Pressure-decay leak check'],
  ['droop', 'Tank droop (lock-up vs flowing)'],
  ['scale-vs-meter', 'Flowmeter vs tank-scale flow'],
  ['stiffness', 'Injector stiffness (ΔP / Pc)'],
  ['start-transient', 'Start transient: valve-to-flame, overshoot'],
  ['spark-check', 'Igniter spark check'],
  ['cctv', 'Cell camera'],
];

export const CATEGORIES = { none: 'No fault', control: 'Pressure control and supply', flow: 'Flow path', actuation: 'Actuation', ignition: 'Ignition', combustion: 'Combustion and chamber', sensor: 'Instrument' };

export const DIAGNOSIS = { modes: FAILURE_MODES, actions: ACTIONS, rightAction: RIGHT_ACTION, checks: CHECKS, categories: CATEGORIES };
