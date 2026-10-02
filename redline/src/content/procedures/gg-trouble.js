/* LEVEL 28 — Gas-generator engine fault diagnosis.

   BPE-3 is back on the stand after a teardown. Repeat the reference fire —
   8 s at full throttle on the standard start — and either show that it is
   back in family or find out why not. The hidden fault comes from TS-3G's
   catalogue: the gas generator's orifices, its igniter, the start gas
   regulator, the main igniter, the ablative liner and throat, an inducer,
   the turbine inlet thermocouple, a GG valve, a flowmeter. About one
   session in five has none. On this engine everything is coupled to
   everything else through the shaft: a fault in the gas generator shows up
   as a speed, a chamber pressure and a thrust.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { pollSection, reportStep, finalize } from './common.js';
import { ggPretest, ggInstrumentation, ggLoad, ggRotor, ggDaq, ggSpark, ggSupply, ggLeak, ggClearCell, ggPurge, ggPressurise,
         ggPlanSteps, ggFireSteps, ggSafe, ggDone } from './gg-common.js';

export const REF = { mode: 'hot', duration: 8, thr: 1 };

export const request = () => ({
  tankP: psi(50),
  title: 'BPE-3 return-to-service fire',
  text: 'BPE-3 is back from a teardown: the gas generator\'s orifices and injector cleaned and refitted, both igniters re-gapped, the start gas regulator serviced, the main chamber inspected and refitted, the inducers borescoped, the DAQ\'s channel set reloaded. Repeat the reference fire — 8.0 s at full GG throttle, tanks 50 psig, the standard start — and confirm the engine is back to reference, or find out why not.',
  success: 'Either a reference-quality fire with the data in family, or a stand held safely and a supported diagnosis.',
});

const stopped = v => ggDone(v) || (!!v.lastPoll && !v.lastPoll.go);

export function procedure(def) {
  const match = () => true;
  return finalize({
    id: 'gg-trouble',
    title: 'TP-GG-028 · Return-to-service fire and troubleshooting',
    sections: [
      ggPretest(def, 'A', { reviewText: v => `${v.request.text} Reference, from the acceptance fire: breakaway torque 10 N·mm, turning smoothly; both sparks strong; the start — main chamber lit about 170 ms after its valves, the gas generator about 245 ms after its own, mainstage at T+1.12 s, the start gas line peaking near 230 psig; at mainstage 35 360 rpm, Pc 321 psig, the gas generator (PT-333) 150 psig at 836 K (TT-334), turbine exhaust 730 K; pump discharges 675 / 584 psig; MR 1.53 from the meters, 0.37 inferred for the gas generator; thrust 1670 N; c* efficiency 0.936; Isp 224 s chamber, 213 s engine; TPA vibration 1.2 g, chamber 0.6 g; coast-down to half speed 2.4 s; the case barely warms in 8 s.` }),
      ggInstrumentation(def, 'B'),
      ggLoad(def, 'C'),
      ggRotor(def, 'D'),
      ggDaq(def, 'E'),
      ggSpark(def, 'F'),
      ggSupply(def, 'G'),
      ggLeak(def, 'H'),
      ggClearCell(def, 'I'),
      ggPurge(def, 'J'),
      ggPressurise(def, 'K', psi(50)),
      { id: 'L', title: 'Plan', steps: ggPlanSteps(def, { label: 'Reference fire', want: REF, match }) },
      pollSection('M', { text: 'Compare every station\'s numbers with the reference. If something does not fit, NO-GO — skip the fire and go to safing.' }),
      { id: 'N', title: 'Fire', steps: ggFireSteps(def, { label: 'Reference fire', want: REF, match }).map(st => ({ ...st, text: (st.text || '') + ' (Skip after a NO-GO.)' })) },
      ggSafe(def, 'O', stopped),
      { id: 'P', title: 'Investigate', steps: [
        { kind: 'action', station: 'TC', title: 'Review the data against the reference',
          text: 'The start first — the two lights, the speed and TT-334 peaks, PT-333 at the GG valves — then mainstage: speed, Pc, PT-333 and TT-334, the inferred GG mixture ratio, the main flows and MR, thrust and c*; then the shutdown, the coast-down and TC-503 after.',
          why: 'On a gas-generator engine the shaft couples everything. A faster engine with a hotter turbine says the gas generator is running oxidiser-rich; a slower one with a normal TIT says it is getting less flow, or the pumps are giving less for it. Which channels moved, and which did not?',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'action', station: 'PROP', title: 'Gather evidence: at least two inspections',
          text: 'Console ▸ INSPECT: the igniters, the GG orifices on the flow bench, the GG injector, the liner and the throat, the inducers, the bearings, the start gas regulator on the bench, the TT-334 chain against a reference, the flowmeter K-factors, the valve stroke times. Some need the propellants drained first.',
          check: v => v.inspections.length >= 2 },
        { kind: 'action', station: 'TC', title: 'Submit the diagnosis', text: 'Console ▸ INSPECT ▸ Submit diagnosis. "No fault" is an answer.',
          check: v => !!v.diagnosis },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'gg-trouble', title: 'Gas-generator engine fault diagnosis', objective: 'BPE-3 return-to-service: reference fire; diagnose any anomaly',
  request, procedure,
  faults: true, faultChanceNone: 0.2,
};
