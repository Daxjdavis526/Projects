/* LEVEL 16 — Regen engine fault diagnosis (BPE-2).

   The reference 10 s burn on an engine that may or may not be healthy. The
   hidden fault is drawn from the cooling faults — a blocked zone, coke, a
   cracked liner, hot fuel, a lying coolant thermocouple — and from a few of
   TS-2's own. About one session in five has none. A cooling fault is the
   kind that gives the least warning: watch the trends in the first
   seconds, and know your reference.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { pollSection, reportStep, finalize } from './common.js';
import { bpPretest, bpInstrumentation, bpPressurantLeak, bpClearCell, bpPurge, bpSafe,
         bpLoadPropellants, bpHotDaq, bpSparkCheck, bpPressuriseHot, hotFirePoint, bpAfterFire, hotFired } from './bp-common.js';
import { WANT_RG } from './rg-hotfire.js';

export const request = () => ({
  oxP: psi(420), fuP: psi(480), duration: 10.0,
  title: 'BPE-2 return-to-service hot fire',
  text: 'BPE-2 is back from refurbishment: the jacket was flushed and re-proofed, the liner inspected, the coolant thermocouple replaced, the fuel conditioning skid serviced. Repeat the reference hot fire — 10 s, 420/480 psig, 200 ms fuel lead — and confirm it is back to reference, or find out why not.',
  success: 'Either a reference-quality burn with the data in family, or a stand held safely and a supported diagnosis.',
});

const stopped = v => hotFired(v) || (!!v.lastPoll && !v.lastPoll.go);

export function procedure(def) {
  const fire = hotFirePoint(def, { label: 'Reference hot fire', want: WANT_RG, match: () => true });
  return finalize({
    id: 'rg-trouble',
    title: 'TP-RG-016 · Return-to-service hot fire and troubleshooting',
    sections: [
      bpPretest(def, 'A', { reviewText: v => `${v.request.text} Reference from the last good run: Pc ≈ 290 psig, MR ≈ 1.47, c* efficiency ≈ 0.95; jacket ΔP ≈ 62 psi; coolant 20 → 121 °C (ΔT ≈ 102 K, ≈ 22 kW); boiling margin ≈ 70 K; TC-802 ≈ 170 °C and TC-803 ≈ 180 °C, steady from 2 s; fuel lead 200 ms gives valve-to-flame ≈ 0.19 s. At rest, every thermocouple in the cell reads the cell temperature.` }),
      bpInstrumentation(def, 'B'),
      bpLoadPropellants(def, 'C'),
      bpHotDaq(def, 'D'),
      bpSparkCheck(def, 'E'),
      bpPressurantLeak(def, 'F'),
      bpClearCell(def, 'G'),
      bpPurge(def, 'H'),
      bpPressuriseHot(def, 'I'),
      { id: 'J', title: 'Plan', steps: [fire[0]] },
      pollSection('K', { text: 'Compare every station\'s numbers with the reference. If something does not fit, NO-GO — skip the firing and go to safing.' }),
      { id: 'L', title: 'Fire', steps: fire.slice(1).map(st => ({ ...st, text: st.text + ' (Skip after a NO-GO.)' })) },
      bpAfterFire(def, 'M'),
      bpSafe(def, 'N', stopped),
      { id: 'O', title: 'Investigate', steps: [
        { kind: 'action', station: 'TC', title: 'Review the data against the reference',
          text: 'Static readings first (thermocouples at rest, PT-801 open to the cell); then the jacket ΔP, the coolant rise and heat, the boiling margin, both liner temperatures, flows and c*.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'action', station: 'PROP', title: 'Gather evidence: at least two inspections',
          text: 'Console ▸ INSPECT: new for BPE-2 — water-flow and zone-check the jacket, pressure-decay it, radiograph it, borescope the liner, hand-probe the fuel, compare thermocouples with a reference probe. Opening the engine needs the propellants drained.',
          check: v => v.inspections.length >= 2 },
        { kind: 'action', station: 'TC', title: 'Submit the diagnosis', text: 'Console ▸ INSPECT ▸ Submit diagnosis. "No fault" is an answer.',
          check: v => !!v.diagnosis },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'rg-trouble', title: 'Regen engine fault diagnosis', objective: 'BPE-2 return-to-service: 10 s reference burn; diagnose any anomaly',
  request, procedure,
  faults: true, faultChanceNone: 0.2,
  faultPool: ['jkt-blocked', 'jkt-coked', 'liner-crack', 'hot-fuel', 'tc728-bias', 'ign-weak', 'ox-inj-blocked', 'pt801-bias', 'ft724-kfactor', 'ox-reg-droop'],
  setup(session) { session.daq.setRate(250); },
};
