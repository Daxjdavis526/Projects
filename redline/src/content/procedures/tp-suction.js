/* LEVEL 21 — Suction performance (NPSH).

   Hold design speed and the design throttle, and bring one tank's pressure
   down at a steady rate under the running pump. The head holds — then
   breaks. The suction head at which it has fallen by 3 % is the pump's NPSH
   required, by definition. One run per pump. The test that finds out how
   close to boiling an inducer can work — and that is meant to go past the
   edge, deliberately, with the speed held and the abort armed. */

import { psi } from '../../lib/units.js';
import { near, pollSection, reportStep, finalize } from './common.js';
import { tpPretest, tpInstrumentation, tpFill, tpRotor, tpDaq, tpSupply, tpClearCell, tpPressurise,
         tpRunSteps, tpFireSteps, tpSafe, pumpRuns } from './tp-common.js';

export const SUC_OX = { mode: 'suction', ctl: 'speed', speed: 36000, thr: 0.66, side: 'ox', pEnd: psi(3), rate: psi(1.5), settle: 3, duration: 44 };
export const SUC_FU = { ...SUC_OX, side: 'fu' };
const at = w => r => r.plan?.mode === 'suction' && (r.plan.side || 'ox') === w.side;

export const request = () => ({
  tankP: psi(50), speed: 36000,
  title: 'TPA-1 suction performance',
  text: 'Suction test of each pump of TPA-1 at design speed (36 000 rpm) and design throttle (66 %). Each run starts with both tanks at 50 psig; after the speed settles, the tested side\'s tank is ramped down at 1.5 psi/s towards 3 psig — 44 s per run. Deliverables: the NPSH available at which each pump\'s head has fallen 3 % (its NPSH required), against the specification (≈ 20.9 m ox, ≈ 18.9 m fuel at this flow).',
  success: 'Both pumps\' NPSH required measured; a report.',
});

const npshr = (v, w) => pumpRuns(v, at(w)).pop()?.metrics.summary.npshr3;

export function procedure(def) {
  const rec = (w, spec) => ({ kind: 'record', station: 'TC', title: `Record the ${w.side === 'fu' ? 'fuel' : 'ox'} pump NPSH required (m)`,
    text: 'From the reduction: the NPSH available where the head had fallen 3 % below its value at the start of the ramp.',
    record: { unit: 'm', validate: (x, v) => {
      const n = npshr(v, w);
      if (!Number.isFinite(n)) return { ok: false, msg: 'No 3 % head drop in a recorded suction run (did the ramp go low enough?).' };
      return near(x, n, 0.5) ? { ok: true, msg: `${n.toFixed(1)} m against a specification of about ${spec} m: ${n < spec * 1.1 ? 'acceptable' : 'OUT OF SPECIFICATION'}.` } : { ok: false, msg: `The reduction gives ${n.toFixed(1)} m.` };
    } } });
  return finalize({
    id: 'tp-suction',
    title: 'TP-TP-021 · TPA-1 suction performance',
    sections: [
      tpPretest(def, 'A'),
      tpInstrumentation(def, 'B'),
      tpFill(def, 'C'),
      tpRotor(def, 'D'),
      tpDaq(def, 'E'),
      tpSupply(def, 'F'),
      tpClearCell(def, 'G'),
      tpPressurise(def, 'H', psi(50)),
      { id: 'I', title: 'Ox pump suction run', steps: [
        { kind: 'info', station: 'TC', title: 'What will happen',
          text: 'The NPSH-OX caution will come up as the tank comes down: it is expected — acknowledge it. The head will hold, then sag, then fall away; vibration rises as the inducer cavitates; the pump unloads, and SC-330 takes the drive pressure DOWN to hold the speed. The tank empties nothing: the ramp only lowers its pressure.',
          why: 'A test that goes past the edge on purpose needs everyone to know where the edge is and what crossing it looks like.' },
        ...tpRunSteps(def, { label: 'Suction run 1 (ox)', want: SUC_OX, match: at(SUC_OX) }),
      ] },
      pollSection('J', { text: 'POLL. The poll covers both suction runs. The suction margin item will be low by design on the side under test.' }),
      { id: 'K', title: 'Ox pump suction run — fire', steps: tpFireSteps(def, { label: 'Suction run 1', match: at(SUC_OX) }) },
      { id: 'L', title: 'Fuel pump suction run', steps: [
        { kind: 'action', station: 'PROP', title: 'Ox-side tank back to 50 psig', check: v => near(v.sp['PR-410'], psi(50), psi(1)) && near(v.ch('PT-410'), psi(50), psi(5)) },
        ...tpRunSteps(def, { label: 'Suction run 2 (fuel)', want: SUC_FU, match: at(SUC_FU) }),
        ...tpFireSteps(def, { label: 'Suction run 2', match: at(SUC_FU) }),
      ] },
      { id: 'M', title: 'Data', steps: [
        { kind: 'action', station: 'TC', title: 'Open both runs in ANALYSIS', text: 'Head against time with NPSH-OX / NPSH-FU beside it; the breakdown is where the head leaves its plateau.',
          check: v => pumpRuns(v, r => r.metrics.mode === 'suction').filter(r => v.flags.has('analysis:' + r.id)).length >= 2 },
        rec(SUC_OX, 20.9), rec(SUC_FU, 18.9),
      ] },
      tpSafe(def, 'N'),
      { id: 'O', title: 'Report', steps: [reportStep()] },
    ],
  });
}

export default {
  id: 'tp-suction', title: 'Suction performance (NPSH)', objective: 'TPA-1: NPSH required of each pump by a suction ramp at design speed',
  request, procedure, seriesPoll: true,
};
