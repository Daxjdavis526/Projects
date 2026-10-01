/* LEVEL 11 — Bipropellant fault diagnosis.

   The standard 2 s hot fire at 400/400 psig, on an engine and stand that
   may or may not be healthy. A hidden fault is drawn when the session starts
   (about one session in five draws none): an igniter that does not spark or
   sparks late, an injector partly plugged or eroded, combustion instability,
   lost film cooling, a regulator, a slow valve — or an instrument that lies.

   As in Level 5, a NO-GO before firing is a legitimate path, and an abort is
   never wrong when the data cannot be explained. The investigation afterwards
   is the point.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { pollSection, reportStep, finalize } from './common.js';
import { bpPretest, bpInstrumentation, bpPressurantLeak, bpClearCell, bpPurge, bpSafe,
         bpLoadPropellants, bpHotDaq, bpSparkCheck, bpPressuriseHot, hotFirePoint, bpAfterFire, hotFired } from './bp-common.js';

const WANT = { duration: 2.0, lead: 0, ignLead: 0.5, ignCheck: 0.5, shutdown: 'ox-first' };

export const request = () => ({
  oxP: psi(400), fuP: psi(400),
  duration: 2.0,
  title: 'BPE-1 return-to-service hot fire',
  text: 'BPE-1 is back on TS-2 after a teardown inspection: the injector was removed and refitted, the igniter plug and the chamber thermocouples re-installed, a flowmeter replaced, and the regulators overhauled. Repeat the reference hot fire — 2.0 s, 400/400 psig, zero lead — and confirm the engine and stand are back to their reference, or find out why not.',
  success: 'Either a reference-quality hot fire with the data in family, or a stand held safely and a supported diagnosis. In both cases, a diagnosis submitted with its evidence.',
});

const stopped = v => hotFired(v) || (!!v.lastPoll && !v.lastPoll.go);

export function procedure(def) {
  const fire = hotFirePoint(def, { label: 'Reference hot fire', want: WANT, match: () => true });
  return finalize({
    id: 'bp-trouble',
    title: 'TP-BP-011 · Return-to-service hot fire and troubleshooting',
    sections: [
      bpPretest(def, 'A', { reviewText: v => `${v.request.text} Reference from the last good run of this engine: Pc ≈ 276 psig, thrust ≈ 448 N, MR ≈ 1.37 (meters and scales agreeing), c* efficiency ≈ 0.94, valve-to-flame ≈ 0.19 s, smooth start, throat ≈ 190 °C at shutdown and ≈ 320 °C after soak-back.` }),
      bpInstrumentation(def, 'B'),
      bpLoadPropellants(def, 'C'),
      bpHotDaq(def, 'D'),
      bpSparkCheck(def, 'E'),
      bpPressurantLeak(def, 'F'),
      bpClearCell(def, 'G'),
      bpPurge(def, 'H'),
      bpPressuriseHot(def, 'I'),
      { id: 'J', title: 'Plan', steps: [fire[0]] },
      pollSection('K', {
        text: 'Console ▸ FIRE CONTROL ▸ POLL. Compare every station\'s numbers with the reference. If something does not fit, call NO-GO — then skip the firing and go straight to safing.',
        why: 'After a teardown, the poll is the last chance to catch an assembly error before it becomes a hot-fire anomaly.',
      }),
      { id: 'L', title: 'Fire', steps: fire.slice(1).map(st => ({ ...st, text: st.text + ' (Skip after a NO-GO.)' })) },
      bpAfterFire(def, 'M'),
      bpSafe(def, 'N', stopped),
      { id: 'O', title: 'Investigate', steps: [
        { kind: 'action', station: 'TC', title: 'Review the data',
          text: 'ANALYSIS ▸ the run, against the reference: the start, both sides\' flows and manifold pressures, meters against scales, c*, vibration, wall temperatures. And the static data before the run.',
          why: 'Locate first: which side, which phase of the run, which channels show it — and which do not.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'action', station: 'PROP', title: 'Gather evidence: at least two inspections',
          text: 'Console ▸ INSPECT. Rack checks need nothing; cell checks need the cell open; opening the engine or a meter needs the stand vented AND the propellants drained (FACILITY ▸ Technician ▸ Drain tanks, vents open).',
          why: 'Choose the inspection whose result would change your mind.',
          check: v => v.inspections.length >= 2 },
        { kind: 'action', station: 'TC', title: 'Submit the diagnosis',
          text: 'Console ▸ INSPECT ▸ Submit diagnosis. "No fault" is an answer.',
          check: v => !!v.diagnosis },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'bp-trouble',
  title: 'Bipropellant fault diagnosis',
  objective: 'Return-to-service hot fire at 400/400 psig; diagnose any anomaly',
  request,
  procedure,
  faults: true,
  faultChanceNone: 0.2,
  setup(session) {
    session.daq.setRate(250);
  },
};
