/* LEVEL 20 — Pump map.

   One run at design speed with the throttles stepped through five
   positions: five points on each pump's head–flow curve. Then the same at
   75 % speed. Referred to design speed by the affinity laws (H/n², Q/n),
   the two curves should fall on top of each other. Where they do not, the
   pump is not obeying similarity — cavitation at the high-flow end is the
   usual reason. */

import { psi } from '../../lib/units.js';
import { near, pollSection, reportStep, finalize } from './common.js';
import { tpPretest, tpInstrumentation, tpFill, tpRotor, tpDaq, tpSupply, tpLeak, tpClearCell, tpPressurise,
         tpRunSteps, tpFireSteps, tpSafe, pumpRuns } from './tp-common.js';

const STEPS = [0.4, 0.55, 0.7, 0.85, 1.0];
export const MAP_HI = { mode: 'map', ctl: 'speed', speed: 36000, thrSteps: STEPS, dwell: 4 };
export const MAP_LO = { mode: 'map', ctl: 'speed', speed: 27000, thrSteps: STEPS, dwell: 4 };
const at = w => r => r.plan?.mode === 'map' && Math.abs((r.plan.speed ?? 0) - w.speed) < 1 && r.metrics.points.length >= 4;

export const request = () => ({
  tankP: psi(50), speed: 36000, speeds: [36000, 27000],
  title: 'TPA-1 head–flow map',
  text: 'Map both pumps of TPA-1: a run at 36 000 rpm (design) and one at 27 000 rpm (75 %), each stepping both throttles 40 → 55 → 70 → 85 → 100 % with 4 s at each. Tanks at 50 psig. Deliverables: head against flow at each point, referred to design speed (H/n² against Q/n); the referred curves from the two speeds should agree within 2 %; the head at the design flow (≈ 4.74 L/s on the ox pump) against the design 390 m.',
  success: 'Ten points per pump, the two speeds collapsing onto one referred curve, and a report.',
});

/* The ox pump's referred head at the point nearest a 70 % throttle, at each speed. */
const refAt = (v, w) => pumpRuns(v, at(w)).pop()?.metrics.points.find(p => Math.abs(p.thr - 0.7) < 0.01);

export function procedure(def) {
  return finalize({
    id: 'tp-map',
    title: 'TP-TP-020 · TPA-1 pump map',
    sections: [
      tpPretest(def, 'A'),
      tpInstrumentation(def, 'B'),
      tpFill(def, 'C'),
      tpRotor(def, 'D'),
      tpDaq(def, 'E'),
      tpSupply(def, 'F'),
      tpLeak(def, 'G'),
      tpClearCell(def, 'H'),
      tpPressurise(def, 'I', psi(50)),
      { id: 'J', title: 'Map at design speed', steps: tpRunSteps(def, { label: 'Map 1 (36 000 rpm)', want: MAP_HI, match: at(MAP_HI) }) },
      pollSection('K', { text: 'POLL. The poll covers both map runs: the second differs only in speed.' }),
      { id: 'L', title: 'Map 1 — fire', steps: tpFireSteps(def, { label: 'Map 1', match: at(MAP_HI) }) },
      { id: 'M', title: 'Map at 75 % speed', steps: [...tpRunSteps(def, { label: 'Map 2 (27 000 rpm)', want: MAP_LO, match: at(MAP_LO) }), ...tpFireSteps(def, { label: 'Map 2', match: at(MAP_LO) })] },
      { id: 'N', title: 'Data', steps: [
        { kind: 'action', station: 'TC', title: 'Open both runs in ANALYSIS; look at the map table',
          text: 'Each throttle step is a row: head referred to design speed (H/n²) and flow referred to design speed (Q/n).',
          check: v => pumpRuns(v, r => r.metrics.mode === 'map').filter(r => v.flags.has('analysis:' + r.id)).length >= 2 },
        { kind: 'record', station: 'TC', title: 'Ox pump: referred head (H/n²) at the 70 % throttle point, design speed (m)',
          record: { unit: 'm', validate: (x, v) => {
            const p = refAt(v, MAP_HI); if (!p) return { ok: false, msg: 'No design-speed map recorded.' };
            return near(x, p.HnOx, 2) ? { ok: true, msg: `${p.HnOx.toFixed(1)} m at ${(p.QnOx * 1e3).toFixed(3)} L/s.` } : { ok: false, msg: `The reduction gives ${p.HnOx.toFixed(1)} m.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Same point at 75 % speed, referred (m)',
          why: 'If the pump obeys the affinity laws, the 75 % map referred to design speed is the design-speed map.',
          record: { unit: 'm', validate: (x, v) => {
            const p = refAt(v, MAP_LO), q = refAt(v, MAP_HI); if (!p) return { ok: false, msg: 'No 75 % map recorded.' };
            if (!near(x, p.HnOx, 2)) return { ok: false, msg: `The reduction gives ${p.HnOx.toFixed(1)} m.` };
            return { ok: true, msg: `${p.HnOx.toFixed(1)} m${q ? ` against ${q.HnOx.toFixed(1)} m at design speed — ${Math.abs(p.HnOx / q.HnOx - 1) < 0.02 ? 'similarity holds' : 'they do NOT agree: why?'}` : ''}.` };
          } } },
      ] },
      tpSafe(def, 'O'),
      { id: 'P', title: 'Report', steps: [reportStep()] },
    ],
  });
}

export default {
  id: 'tp-map', title: 'Pump map', objective: 'TPA-1: head–flow maps at 100 % and 75 % speed, referred by the affinity laws',
  request, procedure, seriesPoll: true,
};
