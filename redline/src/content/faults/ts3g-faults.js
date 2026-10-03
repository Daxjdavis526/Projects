/* TS-3G's faults: what goes wrong with a gas-generator engine, its
   turbopump, its instruments and its stand. Same contract as the other
   stands: a hook into the physics or an instrument, the evidence in the
   MEASURED data, and the story for the debrief.

   A gas-generator engine is a loop — gas generator, turbine, pumps, gas
   generator — so a fault anywhere in it moves everything else: a hotter
   gas generator spins the pumps faster, which raises the chamber pressure
   AND the gas generator's own flow. The art is finding which end of the
   loop moved first. */

import { FAILURE_MODES as BASE_MODES, ACTIONS, RIGHT_ACTION as BASE_RIGHT, CHECKS as BASE_CHECKS, CATEGORIES as BASE_CATS } from './ts2-faults.js';
import { DESIGN_G } from '../stands/ts3g-physics.js';

const pct = x => `${Math.round(100 * x)} %`;

export const FAULTS = [
  { id: 'gg-ox-eroded', component: 'GG', alt: ['GOV-416', 'GCV-417'], mode: 'eroded', category: 'flow', hazard: true, onset: 'start',
    params: rng => ({ e: 0.05 + rng.uniform(0, 0.03) }),
    apply: (S, p) => { S.model.line('ox').tap.erosion = p.e; },
    evidence: ['TT-334', 'MR-GG', 'SPD', 'PT-501', 'PT-333', 'gg-orifice-flow', 'prediction'],
    story: p => ({
      what: `The gas generator's oxidiser orifice had eroded about ${pct(p.e)} oversize. The GG passed more oxidiser than designed: more gas, and a little hotter, so the turbine had more power and the whole engine ran fast.`,
      indicators: 'Speed, pump pressures and chamber pressure all a few per cent above the prediction from the start onward (the loop amplifies a stronger GG into a faster engine: a few per cent more orifice is several per cent more speed); the GG pressure up; turbine inlet temperature (TT-334) 10–20 K above the last good run — LOX/ethanol\'s fuel-rich temperature is flat in mixture ratio, so the TIT says little and the speed says a lot.',
      misleading: 'The GG\'s mixture ratio on the console (MR-GG) is INFERRED from the pressure drop across the orifices at the drawing\'s flow coefficient — so an eroded orifice reports the flow it was designed to pass, not what it passes. MR-GG looked nominal while the GG ran hot.',
      notice: 'Speed and PT-333 against the prediction at mainstage, with TT-334 a little high. Everything on the engine being high in proportion says the turbine had more power — then ask why. A water flow of the GG orifices on the bench measures their real flow coefficient.',
      abort: 'A real hazard if it grows: the turbine inlet redline is the thing a GG engine most often trips on, and an eroding orifice only gets worse.',
      expert: 'Flow-check the GG orifices after every few hot fires; trend TT-334 at mainstage run to run — a slow climb is an orifice going.',
    }) },
  { id: 'gg-fu-blocked', component: 'GG', alt: ['GFV-426', 'GCV-427'], mode: 'restricted', category: 'flow', hazard: true, onset: 'start',
    params: rng => ({ b: 0.14 + rng.uniform(0, 0.08) }),
    apply: (S, p) => { S.model.line('fu').tap.blockage = p.b; },
    evidence: ['TT-334', 'MR-GG', 'GGF-FU', 'PT-333', 'SPD', 'gg-orifice-flow', 'gg-injector-inspect'],
    story: p => ({
      what: `About ${pct(p.b)} of the gas generator's fuel orifice area was blocked (debris from the last fuel load). Less fuel at the same oxidiser flow: the GG ran less fuel-rich — a little hotter — and passed less gas, so the turbine had less power and the engine ran slow.`,
      indicators: 'Speed, pump pressures, chamber pressure and PT-333 all a few per cent below the prediction — and TT-334 not low with them but 10–25 K ABOVE it: less gas, and hotter.',
      misleading: 'The inferred GG fuel flow (GGF-FU) reads from the pressure drop across the orifice — and a partly blocked orifice has the SAME drop for LESS flow, so GGF-FU fell only as far as everything else did, and the inferred GG mixture ratio looked normal. A slow engine looks like a tired pump or a weak turbine; only the temperature, high when everything else was low, said the gas was short of fuel.',
      notice: 'A slow engine with TT-334 high and the inferred GG mixture ratio normal: the inference is wrong somewhere. The bench flow of the orifices finds which one.',
      abort: 'Hazardous as it grows: past a GG mixture ratio of about 0.55 the temperature climbs steeply, and a blocked orifice only gets worse.',
      expert: 'Filter the GG feed separately and finer than the main feed: a GG orifice is a few tenths of a millimetre, and a flake of anything blocks a measurable fraction of it.',
    }) },
  { id: 'pr330-droop', component: 'PR-330', mode: 'droop', category: 'control', hazard: false, onset: 'start',
    params: rng => ({ scale: 3.5 + rng.uniform(0, 1.5) }),
    apply: (S, p) => { S.model.element('PR-330').droopScale = p.scale; },
    evidence: ['PT-336', 'EPC-330', 'SPD', 'PT-333', 'reg-bench', 'start-transient'],
    story: p => ({
      what: `The start gas regulator PR-330 drooped badly under flow — about ${p.scale.toFixed(1)}× its normal droop (a worn dome seal). It held its setpoint at lock-up and sagged as soon as the turbine drew start gas.`,
      indicators: 'PT-336 well below the EPC-330 dome feedback while TSV-332 was open; the turbine spun up slowly on start gas, so the pumps had less pressure when the main valves and the gas generator opened; a slow start — or, with an early start-gas cut-off, a start hang.',
      misleading: 'The regulator\'s setpoint and its EPC feedback were exactly right: the fault only exists while gas is flowing, and only in the first second of a run.',
      notice: 'PT-336 against EPC-330 during the spin-up. The speed when the gas generator lights against the prediction.',
      abort: 'Not a hazard in itself — a hung start aborts itself safely — but a start that only just bootstraps is a start that one day will not.',
      expert: 'Flow-test start regulators, not just lock-up: a start system\'s performance is its pressure at full flow.',
    }) },
  { id: 'gg-ign-late', component: 'IGN-502', mode: 'ign-weak', category: 'ignition', hazard: true, onset: 'start',
    params: rng => ({ w: 0.22 + rng.uniform(0, 0.1) }),
    apply: (S, p) => { S.model.gg.igniter.weak = p.w; },
    evidence: ['PT-333', 'TT-334', 'SPD', 'IGG-I', 'start-transient', 'spark-check', 'inspect-igniter'],
    story: p => ({
      what: `The gas generator's igniter was sparking weakly; the GG lit about ${Math.round(p.w * 1000)} ms late. Propellant collected in the GG and the turbine manifold first — and then burned all at once: a hard start in the gas generator.`,
      indicators: 'TT-334 slow to rise after the GG valves opened; then PT-333 spiking well above anything else in the start, and the speed jumping with it. Mainstage, once reached, was nominal.',
      misleading: 'The igniter current (IGG-I) was normal: current proves the exciter, not the spark. And everything after the start looked fine.',
      notice: 'The GG light time and the peak GG pressure in the start, against the last good run.',
      abort: 'A hazard: a pressure spike in the turbine manifold is a load on the turbine\'s nozzles and its seals, and a later light is a bigger spike.',
      expert: 'Spark-check BOTH igniters before every hot fire, with eyes on the spark — and trend the GG light time.',
    }) },
  { id: 'main-ign-fail', component: 'IGN-501', mode: 'no-spark', category: 'ignition', hazard: true, onset: 'start',
    params: () => ({}),
    apply: S => { S.model.chamber.igniter.fail = true; },
    evidence: ['OD-504', 'PT-501', 'IGN-I', 'spark-check', 'inspect-igniter'],
    story: () => ({
      what: 'The main chamber igniter\'s plug was fouled: the exciter drew its normal current, and nothing sparked.',
      indicators: 'No chamber pressure after the main valves opened; no flame on OD-504; IGN-I normal. The start check aborted at the ignition check. (The gas generator lit; the turbopump came up on it while the main chamber flooded.)',
      misleading: 'Everything upstream of the injector was nominal — the pumps, the gas generator, the start — and IGN-I says "on".',
      notice: 'Flame detector and Pc at the ignition check. Exciter current is not a spark.',
      abort: 'The start check aborting was exactly right: an unlit chamber filling with propellant is a hard start waiting for a spark.',
      expert: 'Purge long after a failed start before anyone goes near the engine, and spark-check with eyes on the spark.',
    }) },
  { id: 'liner-thin', component: 'BPE-3', mode: 'eroded', category: 'combustion', hazard: true, onset: 'start',
    params: rng => ({ char: 0.0055 + rng.uniform(0, 0.0015) }),
    apply: (S, p) => { S.model.chamber.abl.char = p.char; },
    evidence: ['TC-503', 'liner-ultrasonic', 'throat-gauge', 'case-trend'],
    story: p => ({
      what: `The ablative liner had already lost about ${(p.char * 1000).toFixed(1)} mm of its 14 mm to earlier burns that were not logged against this chamber. What was left insulated the case for far less time.`,
      indicators: 'TC-503 rising much earlier and faster than on a fresh chamber; its peak after shutdown far higher. Chamber pressure and thrust nominal.',
      misleading: 'Everything the engine does — pressure, thrust, mixture ratio — was nominal. The only witness was the case thermocouple, and the case is not where the action is.',
      notice: 'TC-503\'s rate of rise against the last run of the same duration on the same chamber.',
      abort: 'A hazard: a liner that burns through puts flame through the case.',
      expert: 'An ablative chamber has a life in seconds. Log every second of it, and measure the liner (ultrasonics) between tests.',
    }) },
  { id: 'throat-eroded', component: 'BPE-3', alt: ['PT-501'], mode: 'eroded', category: 'combustion', hazard: false, onset: 'start',
    params: rng => ({ e: 0.0008 + rng.uniform(0, 0.0004) }),
    apply: (S, p) => { const C = S.model.chamber; C.abl.eroded = p.e; C.At = Math.PI / 4 * (C.Dt0 + p.e) ** 2; },
    evidence: ['PT-501', 'CSTAR-C', 'LC-501', 'throat-gauge', 'prediction'],
    story: p => ({
      what: `The throat had eroded to ${((DESIGN_G.throatDia + p.e) * 1000).toFixed(2)} mm (drawing ${(DESIGN_G.throatDia * 1000).toFixed(2)} mm) over earlier burns — ${pct((1 + p.e / DESIGN_G.throatDia) ** 2 - 1)} more throat area.`,
      indicators: 'Chamber pressure below the prediction by about the area ratio; thrust a little low; flows nominal (the pumps barely notice).',
      misleading: 'c* on the console is computed with the DRAWING throat, so it read low — as if combustion were poor. Combustion was fine; the throat was bigger.',
      notice: 'Pc low with the flows nominal; c* low with nothing else wrong with combustion; a pin gauge in the throat.',
      abort: 'Not a hazard: a performance shortfall, and a reason to retire the chamber before the liner goes.',
      expert: 'Gauge the throat between tests; reduce c* with the MEASURED throat.',
    }) },
  { id: 'ox-inducer', component: 'P-OX', mode: 'damaged', category: 'machinery', hazard: true, onset: 'start',
    params: rng => ({ k: 2.35 + rng.uniform(0, 0.15) }),
    apply: (S, p) => { S.model.tp.pumps.ox.npshScale = p.k; },
    evidence: ['PT-414', 'VIB-345', 'MR-C', 'PT-501', 'TT-334', 'NPSH-OX', 'inducer-borescope'],
    story: p => ({
      what: `The oxidiser pump's inducer blade tips had been nicked (foreign object damage): it needed about ${pct(p.k - 1)} more suction head than the drawing.`,
      indicators: 'At mainstage the ox pump was cavitating: PT-414 a few per cent low, VIB-345 up, the ox flow and the main mixture ratio down, Pc down — and the turbine inlet temperature DOWN as well, because the gas generator\'s oxidiser comes from the same pump. The speed moved little — a couple of per cent up: the cavitating pump unloaded the shaft more than its gas generator lost power. Raising the ox tank pressure cures it.',
      misleading: 'NPSH-OX on the console read exactly as it always does: it is the suction head the pump HAS, computed from the inlet pressure. What the damage changed is the head the pump NEEDS — which no instrument on the stand reads.',
      notice: 'One pump\'s discharge low with the other\'s normal, at a normal speed, with the vibration up: that pump is losing its grip. The ox side, not the fuel side, says which inducer to borescope.',
      abort: 'A hazard: a cavitating pump on a GG engine is a step on the way to an overspeed.',
      expert: 'Borescope the inducers after anything has been through the propellant system; keep a suction-performance curve for each pump (Level 21).',
    }) },
  { id: 'tt334-low', component: 'TT-334', mode: 'cal', category: 'sensor', hazard: true, onset: 'start',
    params: rng => ({ k: 0.86 + rng.uniform(0, 0.04) }),
    // a wrong extension wire scales the thermocouple's EMF, i.e. the
    // temperature above the cold junction: it reads right at room temperature
    apply: (S, p) => { const s = S.daq.sensor('TT-334'); s.chainGain = p.k; s.bias = (1 - p.k) / p.k * S.def.physics.ambient.T; },
    evidence: ['TT-334', 'TT-335', 'PT-333', 'SPD', 'tc-reference', 'prediction'],
    story: p => ({
      what: `The turbine inlet thermocouple's extension wire was the wrong type: TT-334 read right at room temperature and about ${pct(1 - p.k)} of the rise above it LOW — some 60–70 K low at mainstage.`,
      indicators: 'TT-334 low against the prediction; the turbine exhaust TT-335 nominal — and a turbine cannot exhaust gas hotter, relative to its inlet, than the work it did allows; speed, pressures and chamber pressure all exactly on prediction.',
      misleading: 'A low TIT looks like margin. The redline was set on TT-334: with it reading low, a genuinely hot GG would have been read as a cool one.',
      notice: 'The engine was nominal everywhere else; only one temperature disagreed — and it disagreed with the exhaust temperature downstream of it.',
      abort: 'A hazard in the way that matters most: it hides the redline.',
      expert: 'Two thermocouples on any temperature with a redline, of different types, and a check against a reference at installation.',
    }) },
  { id: 'gov416-slow', component: 'GOV-416', mode: 'slow', category: 'actuation', hazard: true, onset: 'start',
    params: rng => ({ k: 6 + rng.uniform(0, 2) }),
    apply: (S, p) => { S.model.element('GOV-416').strokeScale = p.k; },
    evidence: ['GOV-416-ZSC', 'GOV-416-ZSO', 'TT-334', 'PT-333', 'valve-timing', 'valve-stroke'],
    story: p => ({
      what: `The GG oxidiser valve GOV-416 stroked about ${p.k.toFixed(0)}× slower than it should (a kinked actuator supply line). On the way open it hardly mattered — the GG's flow is set by its orifices, not its valves. On the way SHUT it mattered a great deal: the fuel valve closed on time and the oxidiser kept coming for a third of a second.`,
      indicators: 'A nominal start and mainstage; then at shutdown a spike in TT-334 — the gas generator burning oxidiser-rich with its fuel already off — and GOV-416\'s closed limit switch arriving late. The turbine inlet redline tripped after the planned shutdown.',
      misleading: 'Everything during the burn was nominal. A valve fault that only shows on the way shut, after the data everyone looks at.',
      notice: 'The shutdown, not just the burn: TT-334 after the GG valves were commanded shut, and the command-to-limit-switch times.',
      abort: 'A hazard: an oxidiser-rich gas generator is a turbine burning. The GG oxidiser valve shuts first for exactly this reason — and only if it actually does.',
      expert: 'Time every sequenced valve against its limit switches on every run — closing as well as opening.',
    }) },
  { id: 'ft416-kfactor', component: 'FT-416', mode: 'cal', category: 'sensor', hazard: false, onset: 'start',
    params: rng => ({ k: 1.06 + rng.uniform(0, 0.04) }),
    apply: (S, p) => { S.daq.sensor('FT-416').chainGain = p.k; },
    evidence: ['FT-416', 'MR-C', 'CSTAR-C', 'WT-411', 'meter-check'],
    story: p => ({
      what: `FT-416's K-factor was entered for another meter: it read ${pct(p.k - 1)} high.`,
      indicators: 'The main mixture ratio and the ox flow read high against the prediction; c* read low; the ox tank\'s weigh scale (WT-411) disagreed with FT-416 over the burn.',
      misleading: 'The engine itself was nominal: chamber pressure, speed and thrust all matched.',
      notice: 'Meter against scale over the burn — the scale weighs what actually left.',
      abort: 'Not a hazard; a data error that would have mis-set the mixture ratio of every later test.',
      expert: 'Cross-check meters against the scales on every hot fire.',
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
  ...BASE_CHECKS,
  ['turn-rotor', 'Rotor turned by hand'],
  ['gg-orifice-flow', 'GG orifices flowed on the bench'],
  ['case-trend', 'Case temperature trended against earlier runs'],
  ['valve-timing', 'Sequenced valve timing (command to limit switch)'],
];
export const CATEGORIES = { ...BASE_CATS, machinery: 'Turbomachinery' };
export const DIAGNOSIS = { modes: FAILURE_MODES, actions: ACTIONS, rightAction: RIGHT_ACTION, checks: CHECKS, categories: CATEGORIES };
