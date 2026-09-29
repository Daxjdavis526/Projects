/* LEVEL 2 — Basic cold-gas firing.

   The whole life of one test: configure, instrument, zero, leak-check,
   clear the cell, pressurise, poll, arm, fire, safe, inspect, reduce the
   data, report. Generalised for training on a fictional stand — it is how
   such a procedure is SHAPED, not a certified procedure for real hardware.

   Every step says why it exists. `teach` is extra explanation shown only in
   tutorial mode; `why` is shown in tutorial and (on request) guided mode;
   independent mode shows the title and nothing else. */

import { psi } from '../../lib/units.js';
import { P, near, finalize, pretest, instrumentation, zeroCal, daqConfig, supplyLeak, clearCell,
         pressurise, pollSection, safeStand, returnSafe, inspectStep, reportStep } from './common.js';

export const request = def => ({
  regSet: psi(150),
  duration: 3.0,
  supplyAssumed: psi(2200),
  title: 'CGT-1 baseline steady-state firing',
  text: 'First steady-state firing of CGT-1 S/N 002 with nozzle N-02. Single 3.0 s burn at a regulator setpoint of 150 psig. Establish baseline chamber pressure, thrust, mass flow and specific impulse for later comparison.',
  success: 'Burn of 3.0 s recorded at ≥ 1000 Hz; steady thrust and chamber pressure within ±10 % of prediction; stand safed; data reduced.',
});

export function procedure(def) {
  return finalize({
    id: 'cg-basic-firing',
    title: 'TP-CG-002 · Baseline steady-state firing',
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
          text: 'Console ▸ FIRE CONTROL ▸ plan. The sequencer opens SV-301 at T-0 and closes it at the end of the burn by itself.',
          why: 'Burn timing is done by the sequencer, not by a hand on a switch, so every firing is repeatable to the millisecond and the abort logic knows where in the test it is.',
          check: v => v.plan.mode === 'single' && near(v.plan.duration, v.request.duration, 0.001) && v.has(e => e.cat === 'SEQ' && e.text.startsWith('Firing plan loaded')) },
        { kind: 'action', station: 'DAQ', title: 'Start DAQ recording',
          text: 'Console ▸ DAQ ▸ RECORD. Recording starts now so the file has a quiet pre-fire baseline; with auto-stop on, it stops by itself a few seconds after shutdown.',
          why: 'The strip charts are a live view, not a record. A firing without recording produced no data.',
          check: v => v.daq.recording },
      ] },
      pollSection('I'),
      { id: 'J', title: 'Arm and fire', steps: [
        { kind: 'action', station: 'TC', title: 'Arm the fire circuit',
          text: 'FIRE CONTROL ▸ ARM. The beacons go red.',
          why: 'Arming powers the fire-valve circuit. It is interlocked with the cell door and is the last step before the sequence.',
          check: v => v.armed || !!v.completedSeq },
        { kind: 'action', station: 'TC', title: 'FIRE — and monitor',
          text: 'FIRE starts a 5-second countdown. During the burn watch PT-401 and LC-501 against the prediction. Your hand is on ABORT. If the data stops making sense, abort: an abort costs a run, a late abort can cost the article.',
          why: 'The operator is part of the protection system. Automatic redlines catch what they were written for; the operator catches everything else.',
          teach: 'Ask, continuously: What state is the system in? What should happen next? What do the instruments say? Does that make physical sense? Is it safe to continue?',
          check: v => !!v.completedSeq || v.has(e => e.cat === 'ABT' && e.text.startsWith('ABORT')) },
      ] },
      { id: 'K', title: 'Post-fire', steps: [
        { kind: 'verify', station: 'PROP', title: 'Verify normal shutdown',
          text: 'Chamber pressure back to ≈ 0, SV-301 coil current 0, fire circuit SAFE, regulator back at lock-up.',
          why: 'A fire valve that did not close is the most dangerous state a cold-gas stand has. Confirm it from the data, not from the command.',
          check: v => Math.abs(v.ch('PT-401')) < psi(2) && Math.abs(v.ch('SV-301-I')) < 0.05 && !v.armed },
        { kind: 'action', station: 'DAQ', title: 'Recording stopped and file saved',
          text: 'The run appears in the NOTEBOOK and ANALYSIS lists.',
          why: 'Confirm the data exists before you take the stand apart.',
          check: v => v.runs.some(r => r.tFire !== null) },
      ] },
      safeStand(def, 'L'),
      returnSafe(def, 'M'),
      { id: 'N', title: 'Post-test inspection and data', steps: [
        inspectStep(),
        { kind: 'action', station: 'TC', title: 'Open the run in ANALYSIS',
          text: 'Review the chamber-pressure and thrust traces around T-0 and shutdown, and the automatic reductions.',
          why: 'The firing is not the test; the data is.', check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'record', station: 'TC', title: 'Record steady-state thrust (N)',
          text: 'From the analysis view (baseline-corrected, steady window).',
          why: 'Reading a number off a reduction is the start. Knowing which window, which baseline and which assumptions produced it is the job.',
          record: { unit: 'N', validate: (x, v) => {
            const run = v.runs.find(r => r.metrics?.summary?.F !== undefined);
            if (!run) return { ok: false, msg: 'No reduced run yet.' };
            const F = run.metrics.summary.F;
            return near(x, F, Math.max(0.05, 0.03 * F)) ? { ok: true, msg: `${F.toFixed(2)} N` } : { ok: false, msg: `Reduction gives ${F.toFixed(2)} N.` };
          } } },
        { kind: 'verify', station: 'TC', title: 'Compare with prediction',
          text: 'Is the measured thrust within ±10 % of the pre-test prediction? If not, the test is not complete — it is an investigation.',
          why: 'This comparison is the verdict on the test.',
          check: v => { const run = v.runs.find(r => r.metrics?.summary?.F !== undefined); const p = run?.meta.config.prediction;
            return !!run && !!p && Math.abs(run.metrics.summary.F / p.F - 1) < 0.10; },
          failMsg: 'Measured thrust is not within ±10 % of the prediction. Something is not nominal.' },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'cg-basic',
  title: 'Basic cold-gas firing',
  objective: 'Baseline 3.0 s steady-state firing at 150 psig',
  request,
  procedure,
  setup(session) {
    session.daq.setRate(250);          // facility default: slow
  },
};
