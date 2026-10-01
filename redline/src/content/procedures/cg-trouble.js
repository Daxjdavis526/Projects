/* LEVEL 5 — Cold-gas troubleshooting.

   The baseline firing again, on a stand that has just come back from
   maintenance — and that may or may not be healthy. A hidden fault is drawn
   when the session starts (about one session in five draws none), in the
   hardware or in the instruments, and applied at a realistic moment: from
   the start, on pressurisation, or partway into the burn.

   The procedure does not know which. It asks the operator to run the test
   as usual, notice what does not fit, stop when that is the right call,
   gather evidence (data, comparisons, inspections) and submit a diagnosis.
   A NO-GO before firing is a legitimate path through it: the firing steps
   are then skipped, and the investigation starts from the static data.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { finalize, pretest, instrumentation, zeroCal, daqConfig, supplyLeak, clearCell,
         pressurise, pollSection, safeStand, returnSafe, fired, reportStep } from './common.js';

export const request = () => ({
  regSet: psi(150),
  duration: 3.0,
  supplyAssumed: psi(2200),
  title: 'CGT-1 return-to-service firing',
  text: 'TS-1 is back from maintenance: the feed system was disassembled and reassembled, instruments were re-installed, and a new bottle was connected. Repeat the baseline: single 3.0 s burn at 150 psig. Confirm the stand and article are back to baseline — or find out why they are not.',
  success: 'Either a baseline-quality firing with the data in family, or a stand held safely and a supported diagnosis of what is wrong. In both cases, a diagnosis submitted with its evidence.',
});

/* Safing is due after a firing — or after the conductor held on NO-GO. */
const stopped = v => fired(v) || (!!v.lastPoll && !v.lastPoll.go);

export function procedure(def) {
  return finalize({
    id: 'cg-trouble',
    title: 'TP-CG-005 · Return-to-service firing and troubleshooting',
    sections: [
      pretest(def, 'A'),
      instrumentation(def, 'B'),
      zeroCal(def, 'C'),
      daqConfig(def, 'D', { minRate: 1000 }),
      supplyLeak(def, 'E'),
      clearCell(def, 'F'),
      pressurise(def, 'G'),
      { id: 'H', title: 'Sequence and data', steps: [
        { kind: 'action', station: 'TC', title: v => `Load the firing plan: single burn, ${v.request.duration.toFixed(1)} s`,
          text: 'Console ▸ FIRE CONTROL ▸ plan.',
          why: 'Same plan as the baseline, so the result can be compared with it directly.',
          check: v => v.plan.mode === 'single' && Math.abs(v.plan.duration - v.request.duration) < 0.001 },
        { kind: 'action', station: 'DAQ', title: 'Start DAQ recording',
          text: 'Console ▸ DAQ ▸ RECORD.', why: 'If something is wrong, the recording is the evidence.',
          check: v => v.daq.recording || fired(v) },
      ] },
      pollSection('I', {
        text: 'Console ▸ FIRE CONTROL ▸ POLL. Compare every station\'s numbers with what you saw in the baseline and the prediction. If something does not fit, call NO-GO — then skip section J and go straight to safing.',
        why: 'On a stand just back from maintenance the poll is the last chance to catch an assembly error before it becomes a firing anomaly.',
      }),
      { id: 'J', title: 'Arm and fire', steps: [
        { kind: 'action', station: 'TC', title: 'Arm the fire circuit', text: 'FIRE CONTROL ▸ ARM. (Skip after a NO-GO.)',
          why: 'Arming is the last step before the sequence.', check: v => v.armed || fired(v) },
        { kind: 'action', station: 'TC', title: 'FIRE — and watch for what does not fit',
          text: 'Compare PT-401, LC-501, PT-201 and FT-201 with the prediction as they arrive. An anomaly during the burn is a decision: is it hazardous (abort), or data worth completing the run to capture?',
          why: 'The fault, if there is one, may only appear with flow — or only partway into the burn.',
          teach: 'An abort is never wrong when you cannot explain what you see. But the next question is always whether the data were real.',
          check: v => fired(v) },
      ] },
      safeStand(def, 'K', stopped),
      { id: 'L', title: 'Investigate', steps: [
        { kind: 'action', station: 'TC', title: 'Review the data',
          text: 'ANALYSIS ▸ the run (if there is one): traces, reductions, comparison with prediction. Look at the static data before the firing too — and at channels that should agree with each other.',
          why: 'Locate the anomaly first: when it started, which channels show it, which do not. What does NOT show it is often the strongest evidence.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'action', station: 'PROP', title: 'Gather evidence: at least two inspections',
          text: 'Console ▸ INSPECT. Some checks run from the rack; hands-on work needs the cell open, and opening hardware needs it vented. Choose inspections that would tell your hypotheses apart.',
          why: 'Inspections cost time and disturb hardware. Pick the one whose result would change your mind — and remember that finding nothing is a result.',
          check: v => v.inspections.length >= 2 },
        { kind: 'action', station: 'TC', title: 'Submit the diagnosis',
          text: 'Console ▸ INSPECT ▸ Submit diagnosis. Component, failure mode, the evidence that supports it, and what should be done. "No fault" is an answer.',
          why: 'A diagnosis is a claim about the hardware that someone else will act on: they will replace a part, re-calibrate an instrument, or fire again.',
          check: v => !!v.diagnosis },
      ] },
      returnSafe(def, 'M', v => stopped(v) && !!v.diagnosis),
      { id: 'N', title: 'Close-out', steps: [reportStep()] },
    ],
  });
}

export default {
  id: 'cg-trouble',
  title: 'Cold-gas troubleshooting',
  objective: 'Return-to-service firing at 150 psig; diagnose any anomaly',
  request,
  procedure,
  faults: true,
  faultChanceNone: 0.2,
  setup(session) {
    session.daq.setRate(250);
  },
};
