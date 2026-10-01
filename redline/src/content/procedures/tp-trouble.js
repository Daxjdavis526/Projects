/* LEVEL 22 — Turbopump fault diagnosis.

   TPA-1 is back from a rebuild. Repeat the reference spin at design speed —
   and, if anything is out of family, find out why. The hidden fault is
   drawn from TS-3's catalogue: bearings, rubs, worn rings, damaged blading,
   a blocked turbine nozzle, the speed pickups, a flowmeter, the stand's own
   valves and regulators. About one session in five has none. A turbopump
   has a closed loop around it, so look at what the controller DID as well
   as at what it achieved.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { pollSection, reportStep, finalize } from './common.js';
import { tpPretest, tpInstrumentation, tpFill, tpRotor, tpDaq, tpSupply, tpLeak, tpClearCell, tpPressurise,
         tpRunSteps, tpFireSteps, tpSafe, spun } from './tp-common.js';

export const REF = { mode: 'spin', ctl: 'speed', speed: 36000, thr: 0.66, duration: 10 };

export const request = () => ({
  tankP: psi(50), speed: 36000,
  title: 'TPA-1 return-to-service spin',
  text: 'TPA-1 is back from a rebuild: new bearings, new wear rings, turbine nozzles cleaned, both speed pickups re-gapped, the DAQ\'s channel set reloaded. Repeat the reference spin — 36 000 rpm, throttles 66 %, tanks 50 psig, 10 s — and confirm it is back to reference, or find out why not.',
  success: 'Either a reference-quality spin with the data in family, or a stand held safely and a supported diagnosis.',
});

const stopped = v => spun(v) || (!!v.lastPoll && !v.lastPoll.go);

export function procedure(def) {
  const plan = tpRunSteps(def, { label: 'Reference spin', want: REF, match: () => true });
  return finalize({
    id: 'tp-trouble',
    title: 'TP-TP-022 · Return-to-service spin and troubleshooting',
    sections: [
      tpPretest(def, 'A', { reviewText: v => `${v.request.text} Reference from the last good run: breakaway torque 10 N·mm, turning smoothly; at 36 000 rpm the drive takes ≈ 227 psig (EPC-330 ≈ 245); ox pump 385 m and 0.495 kg/s, fuel pump 478 m and 0.457 kg/s; turbine efficiency 0.52 with the exhaust at about −74 °C; vibration 1.3–1.4 g; bearings about 30 °C; the pickups within 60 rpm of each other; coast-down to half speed 1.1 s. Both tanks lock up within 1 psi of each other.` }),
      tpInstrumentation(def, 'B'),
      tpFill(def, 'C'),
      tpRotor(def, 'D'),
      tpDaq(def, 'E'),
      tpSupply(def, 'F'),
      tpLeak(def, 'G'),
      tpClearCell(def, 'H'),
      tpPressurise(def, 'I', psi(50)),
      { id: 'J', title: 'Plan', steps: plan },
      pollSection('K', { text: 'Compare every station\'s numbers with the reference. If something does not fit, NO-GO — skip the spin and go to safing.' }),
      { id: 'L', title: 'Spin', steps: tpFireSteps(def, { label: 'Reference spin', match: () => true }).map(st => ({ ...st, text: st.text + ' (Skip after a NO-GO.)' })) },
      tpSafe(def, 'M', stopped),
      { id: 'N', title: 'Investigate', steps: [
        { kind: 'action', station: 'TC', title: 'Review the data against the reference',
          text: 'Both pickups against each other; the drive pressure the controller needed; head and flow of each pump; turbine temperatures; vibration and bearings; the coast-down.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'action', station: 'PROP', title: 'Gather evidence: at least two inspections',
          text: 'Console ▸ INSPECT: bearings, wear rings, inducers and turbine by borescope, rotor runout, the speed pickups and the DAQ\'s speed configuration, the flowmeter K-factors, the regulators, the discharge valves.',
          check: v => v.inspections.length >= 2 },
        { kind: 'action', station: 'TC', title: 'Submit the diagnosis', text: 'Console ▸ INSPECT ▸ Submit diagnosis. "No fault" is an answer.',
          check: v => !!v.diagnosis },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'tp-trouble', title: 'Turbopump fault diagnosis', objective: 'TPA-1 return-to-service: reference spin; diagnose any anomaly',
  request, procedure,
  faults: true, faultChanceNone: 0.2,
};
