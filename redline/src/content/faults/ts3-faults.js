/* TS-3's faults: what can be wrong with a turbopump, its instruments and
   the stand it sits on. Same contract as the other stands: each fault
   changes the physics or an instrument through a hook, names the evidence
   that shows it in the MEASURED data, and tells its story in the debrief.

   Turbomachinery faults have a property the stands before this one did not:
   the hardware has a closed loop around it. A speed controller acts on what
   its pickups say, so an instrument fault here can drive the real machine
   somewhere it should not go. */

import { FAILURE_MODES as BASE_MODES, ACTIONS, RIGHT_ACTION as BASE_RIGHT, CHECKS as BASE_CHECKS, CATEGORIES as BASE_CATS } from './ts2-faults.js';

const pct = x => `${Math.round(100 * x)} %`;

export const FAULTS = [
  { id: 'se342-dropout', component: 'SE-342', mode: 'disconnected', category: 'sensor', hazard: true, onset: 'start',
    params: rng => ({ p: 0.0006 + rng.uniform(0, 0.0004) }),
    apply: (S, p) => { const s = S.daq.sensor('SE-342'); s.intermittent = p.p; s.dropValue = 0; },
    evidence: ['SE-342', 'SE-341', 'SPD', 'EPC-330', 'pickup-check'],
    story: () => ({
      what: 'The connector on speed pickup SE-342 was loose. While the cable vibrated, the pulses stopped reaching the counter for tens of milliseconds at a time — and a frequency counter that loses its pulses reads ZERO, not "no data".',
      indicators: 'SE-342 dropping to zero in short bursts while SE-341 held steady. SC-330 controls on the MEAN of the two pickups, so every burst looked to it like the shaft had lost half its speed: it pushed the drive pressure (EPC-330) up, and the real shaft — read honestly by SE-341 and by SPD — ran several per cent above its target, with spikes towards 108 %.',
      misleading: 'The redline channel takes the HIGHER pickup, so the redline was never fooled; and the speed controller\'s own feedback (the mean) hovered near the target. Everything that looked "controlled" was the controller chasing a lie.',
      notice: 'SE-341 and SE-342 side by side through the spin-up; the speed-above-104 % caution; the pickup-disagreement figure in the reduction; pump head above the prediction for the planned speed.',
      abort: 'A genuine hazard: an instrument fault drove the machine towards its redline through the control loop. Stopping and finding out why the pickups disagree was right.',
      expert: 'Re-terminate the connector, then fix the logic: a speed controller should vote its pickups and reject one that reads zero while the other reads 36 000 — not average them.',
    }) },
  { id: 'se341-teeth', component: 'SE-341', mode: 'cal', category: 'sensor', hazard: true, onset: 'start',
    params: () => ({ teeth: 7 }),
    apply: (S, p) => { S.daq.sensor('SE-341').chainGain = 6 / p.teeth; },
    evidence: ['SE-341', 'SE-342', 'SPD', 'daq-speed-config', 'prediction', 'H-OX'],
    story: p => ({
      what: `The DAQ channel for SE-341 was configured for ${p.teeth} teeth per revolution; the wheel on TPA-1 has 6. SE-341 read ${pct(6 / p.teeth)} of the true speed.`,
      indicators: 'SE-341 consistently lower than SE-342, by the same proportion at every speed. Because SC-330 controls on the mean, the shaft was actually driven about 8 % FASTER than the plan: SE-342 and SPD read high, the head and flow were above the prediction for the planned speed, and the drive pressure was more than the feed-forward expected.',
      misleading: 'The speed controller held its target perfectly — on the mean. The plot of the mean looks exactly right. A fault in an instrument made the machine run too fast, and made the controller look healthy while it did.',
      notice: 'A constant RATIO between the pickups (not a constant offset, not a dropout) is a configuration error. And pump head is a speedometer in its own right: H/n² against the prediction says what speed the shaft really ran at.',
      abort: 'A real hazard: the turbopump ran at about 108 % with a 110 % redline — and the margin to the redline was being eaten without anyone being told.',
      expert: 'Check every rotating-speed channel\'s teeth-per-revolution against the drawing before the first spin, and check the pickups agree at the first speed plateau before going higher.',
    }) },
  { id: 'brg-pe', component: 'TPA-1', alt: ['P-OX'], mode: 'bearing', category: 'machinery', hazard: true, onset: 'start',
    params: rng => ({ f: 1.5 + rng.uniform(0, 0.4), h: 3.0 + rng.uniform(0, 1.0) }),
    apply: (S, p) => { const T = S.model.tp; T.brgFactor = p.f; T.brgHeatPE = p.h; },
    evidence: ['TC-343', 'VIB-345', 'coast-down', 'turn-rotor', 'bearing-check'],
    story: p => ({
      what: `The pump-end bearing was in distress: spalling on its inner race and its coolant passage partly blocked. Friction about ${p.f.toFixed(1)}× nominal; its own heating about ${p.h.toFixed(1)}× nominal.`,
      indicators: 'TC-343 (pump-end bearing) climbing well above TC-344 and above earlier runs; vibration up with speed; the coast-down shorter than the reference (more drag); and the rotor gritty and stiff when turned by hand.',
      misleading: 'The pumps\' head and flow were nominal — a sick bearing does not change the hydraulics until it seizes.',
      notice: 'The two bearing temperatures against each other and against the last run; the hand-turn before the first run of the day.',
      abort: 'A genuine hazard: a bearing on its way out at 36 000 rpm ends in a seizure and a rotor rub. The bearing redline was right.',
      expert: 'Trend every bearing temperature and the coast-down time run to run. A bearing announces itself in both long before it fails.',
    }) },
  { id: 'ox-wear', component: 'P-OX', mode: 'worn', category: 'machinery', hazard: false, onset: 'start',
    params: rng => ({ loss: 0.07 + rng.uniform(0, 0.04) }),
    apply: (S, p) => { S.model.tp.pumps.ox.headLoss = p.loss; },
    evidence: ['H-OX', 'PT-414', 'FT-416', 'prediction', 'wear-rings'],
    story: p => ({
      what: `The ox impeller's front wear-ring clearance had opened to about ${(0.10 + 2.6 * p.loss).toFixed(2)} mm (0.10 mm nominal). Liquid recirculated from discharge to suction inside the pump: about ${pct(p.loss)} of the head was lost at every speed and flow.`,
      indicators: 'Ox pump head (and so PT-414 and the ox flow through its fixed throttle) below the prediction by the same fraction at every map point; the fuel pump nominal; speed, drive and turbine normal.',
      misleading: 'The speed was right, so the turbine and controller look healthy — the loss is inside the pump, after the shaft.',
      notice: 'Head referred to design speed (H/n²) against the design curve, point by point: a curve shifted down by a constant fraction is internal leakage.',
      abort: 'Not a hazard. A performance shortfall: the pump would not give the engine its design pressure.',
      expert: 'Measure wear-ring clearances at every teardown and keep the map from the acceptance test: performance falls with clearance before anything else changes.',
    }) },
  { id: 'fu-inducer', component: 'P-FU', mode: 'damaged', category: 'machinery', hazard: false, onset: 'start',
    params: rng => ({ k: 1.7 + rng.uniform(0, 0.3) }),
    apply: (S, p) => { S.model.tp.pumps.fu.npshScale = p.k; },
    evidence: ['NPSH-FU', 'H-FU', 'VIB-345', 'inducer-borescope', 'suction'],
    story: p => ({
      what: `Two of the fuel inducer's blade leading edges had been chipped and bent (foreign object). The fuel pump needed about ${p.k.toFixed(1)}× its design suction head before it cavitated.`,
      indicators: 'The fuel pump\'s head fell away at high flow (the last map points) and in a suction test it broke down at a far higher NPSH than the ox pump or the spec; vibration up when it did. At the design point with full tank pressure, almost nothing.',
      misleading: 'At the normal operating point, with 50 psig in the tank, the margin hid the damage. Only a test that went looking for the edge found it.',
      notice: 'A suction test on each pump, compared with the spec; the head at the high-flow end of the map.',
      abort: 'Not a hazard on this stand. On an engine, a pump that cavitates sooner than its spec says is a pump that will lose its head on a low tank pressure or a warm propellant.',
      expert: 'Borescope the inducers after any run that might have ingested debris, and keep the suction test in every acceptance campaign.',
    }) },
  { id: 'tnz-blocked', component: 'TURB', mode: 'restricted', category: 'flow', hazard: false, onset: 'start',
    params: rng => ({ f: 0.62 + rng.uniform(0, 0.1) }),
    apply: (S, p) => { const e = S.model.net.el('TNZ-337'); e.CdA0 *= p.f; },
    evidence: ['PT-333', 'FT-337', 'EPC-330', 'prediction', 'turbine-borescope'],
    story: p => ({
      what: `About ${pct(1 - p.f)} of the turbine's nozzle area was blocked with a white deposit — moisture in the drive gas had frozen in the nozzle throats (the gas reaches them well below zero).`,
      indicators: 'For the planned speed, the turbine inlet pressure (PT-333) and EPC-330 far above the feed-forward and the prediction, and the drive-gas flow (FT-337) about the same; the efficiency (ΔT/ΔT isentropic) normal. Same power from the same gas flow — just at a higher pressure, through less area.',
      misleading: 'SC-330 held the speed, so everything downstream of the shaft was perfect. The controller hid the fault inside its own output.',
      notice: 'Drive pressure against the prediction at the held speed. A controller\'s OUTPUT is data too.',
      abort: 'Not a hazard by itself — but a speed controller that has to work this hard has little left for anything else.',
      expert: 'Dry the drive gas (dew point) and borescope the nozzles; trend the drive pressure needed per unit of speed squared, run to run.',
    }) },
  { id: 'turb-blades', component: 'TURB', mode: 'damaged', category: 'machinery', hazard: true, onset: 'start',
    params: rng => ({ e: 0.74 + rng.uniform(0, 0.08), i: 2.3 + rng.uniform(0, 0.6) }),
    apply: (S, p) => { const T = S.model.tp; T.turbEff = p.e; T.imbalance = p.i; },
    evidence: ['ETA-T', 'TT-335', 'VIB-345', 'PT-333', 'turbine-borescope', 'rotor-runout'],
    story: p => ({
      what: `Several turbine blade tips had curled and broken off after a rub against the shroud: efficiency down to about ${pct(p.e)} of nominal and the rotor out of balance (≈${p.i.toFixed(1)}× nominal imbalance).`,
      indicators: 'Turbine efficiency from the temperatures (ETA-T) well below the prediction — the exhaust warmer than it should be — and more drive pressure for the same speed; vibration rising with speed squared.',
      misleading: 'Speed and pump performance were nominal; the controller made up the lost efficiency with pressure.',
      notice: 'The temperature drop across the turbine and the vibration at the first plateau, against the reference.',
      abort: 'A genuine hazard: missing blade material is an imbalance that grows, and a disc with damaged blades is not one to spin up again.',
      expert: 'Vibration rising as speed squared is imbalance. Look at the rotor before the next run.',
    }) },
  { id: 'seal-rub', component: 'TPA-1', alt: ['P-OX'], mode: 'rub', category: 'machinery', hazard: true, onset: 'start',
    params: rng => ({ t: 0.18 + rng.uniform(0, 0.1) }),
    apply: (S, p) => { S.model.tp.rub = p.t; },
    evidence: ['VIB-345', 'turn-rotor', 'coast-down', 'TC-343', 'wear-rings'],
    story: p => ({
      what: `The ox impeller was rubbing on its wear ring (a ring had been pressed in off-square): about ${(p.t * 1000).toFixed(0)} N·mm of rub torque at design speed, and the heat of it.`,
      indicators: 'Vibration well above the reference at every speed; a scrape felt once per revolution when the rotor was turned by hand; a short coast-down; the pump-end bearing warmer.',
      misleading: 'Head, flow and turbine all nominal. The rub costs a little power the controller quietly supplies.',
      notice: 'The hand-turn. Then vibration against speed: a rub adds a component even at low speed, where imbalance adds almost nothing.',
      abort: 'A genuine hazard: a rub heats and grows, and in an oxidiser pump a rub is an ignition source.',
      expert: 'Turn the rotor by hand before every test day, and before every first spin after any work on the pump.',
    }) },
  { id: 'ft416-kfactor', component: 'FT-416', mode: 'cal', category: 'sensor', hazard: false, onset: 'start',
    params: rng => ({ g: 1.06 + rng.uniform(0, 0.03) }),
    apply: (S, p) => { S.daq.sensor('FT-416').chainGain = p.g; },
    evidence: ['FT-416', 'prediction', 'meter-check', 'scale-vs-meter'],
    story: p => ({
      what: `FT-416's K-factor had been typed into the DAQ ${pct(p.g - 1)} wrong: it read ${pct(p.g)} of the true ox flow.`,
      indicators: 'Ox flow above the prediction while the ox head sat exactly on it — a pump on its curve cannot make more flow at the same head through the same throttle. The tank scale\'s slope (WT-411) disagreed with the meter.',
      misleading: 'Read alone, the meter said the pump was better than designed.',
      notice: 'Head and flow are not independent on a pump: if one matches the curve and the other does not, suspect the instrument. The tank scale is a second flowmeter.',
      abort: 'Not a hazard; bad data.',
      expert: 'Cross-check every flowmeter against the tank weight over a steady window on every run.',
    }) },
  { id: 'pr410-relief-leak', component: 'PR-410', mode: 'int-leak', category: 'control', hazard: false, onset: 'start',
    params: rng => ({ a: 3.0e-9 + rng.uniform(0, 3.0e-9) }),
    apply: (S, p) => { S.model.net.el('PR-410V').leakCdA = p.a; },
    evidence: ['PT-410', 'leak-check', 'reg-bench', 'PT-420'],
    story: () => ({
      what: 'PR-410\'s relief seat was scored: it bled the ox-side tank to the cell continuously, and the regulator fed it continuously to make up.',
      indicators: 'The leak check failing on the ox side alone — the fuel side, an identical tank on an identical regulator, held. With the supply open, lock-up looked normal.',
      misleading: 'With the supply open, the regulator makes up the leak and hides it completely: only an isolated hold can see it.',
      notice: 'The leak check, and lock-up compared between the two identical tanks.',
      abort: 'Not a hazard.',
      expert: 'Identical sides are a gift: compare them, every time.',
    }) },
  { id: 'dv424-partial', component: 'DV-424', mode: 'not-open', category: 'flow', hazard: false, onset: 'start',
    params: rng => ({ m: 0.30 + rng.uniform(0, 0.08) }),
    apply: (S, p) => { S.model.element('DV-424').maxOpen = p.m; },
    evidence: ['DV-424-ZSO', 'FT-426', 'PT-424', 'PT-427', 'dv-stroke'],
    story: p => ({
      what: `DV-424's actuator stopped at about ${pct(p.m)} of its travel (a sticking ball); the open limit switch was never made.`,
      indicators: 'DV-424 position disagreement (no ZSO); fuel flow well below the prediction; fuel pump discharge (PT-424) high and the throttle inlet (PT-427) low — the pressure drop in the wrong place; the fuel pump\'s discharge temperature rising (it was nearer deadhead).',
      misleading: 'The fuel pump was on its curve — it was just being run at the wrong point on it, by the valve.',
      notice: 'Limit switches before a spin; the pressure DROP between PT-424 and PT-427, which should be a few psi.',
      abort: 'Not a hazard at this opening; a valve that stays shut would deadhead the pump.',
      expert: 'A valve with position indication that does not indicate is a NO-GO, not a curiosity.',
    }) },
];

export const FAILURE_MODES = [
  ...BASE_MODES,
  ['bearing', 'Bearing distress (spalling, lubrication or cooling)', 'machinery'],
  ['worn', 'Worn (internal clearance opened)', 'machinery'],
  ['damaged', 'Damaged blading (impeller, inducer or turbine)', 'machinery'],
  ['rub', 'Rotor rub (seal, wear ring or blade contact)', 'machinery'],
];
export const RIGHT_ACTION = { ...BASE_RIGHT, bearing: ['repair'], worn: ['repair'], damaged: ['repair'], rub: ['repair'] };
export const CHECKS = [
  ...BASE_CHECKS.filter(c => !['stiffness', 'start-transient', 'spark-check'].includes(c[0])),
  ['turn-rotor', 'Rotor turned by hand'],
  ['coast-down', 'Coast-down time / shaft load after shut-off'],
  ['suction', 'Suction test (head against NPSH)'],
  ['pump-map', 'Head referred to design speed (H/n²) against the curve'],
];
export const CATEGORIES = { ...BASE_CATS, machinery: 'Turbomachinery' };
export const DIAGNOSIS = { modes: FAILURE_MODES, actions: ACTIONS, rightAction: RIGHT_ACTION, checks: CHECKS, categories: CATEGORIES };
