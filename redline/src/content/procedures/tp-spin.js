/* LEVEL 19 — First spin of TPA-1.

   Two spins in speed control: half speed, then design speed. On the way up,
   watch the two speed pickups agree; at each plateau, read the head and
   flow; after shut-off, read the coast-down. The affinity laws say what the
   second spin should look like from the first — check that they do. */

import { psi } from '../../lib/units.js';
import { near, pollSection, reportStep, finalize } from './common.js';
import { tpPretest, tpInstrumentation, tpFill, tpRotor, tpDaq, tpSupply, tpLeak, tpClearCell, tpPressurise,
         tpRunSteps, tpFireSteps, tpSafe, pumpRuns } from './tp-common.js';

export const SPIN_LO = { mode: 'spin', ctl: 'speed', speed: 18000, thr: 0.66, duration: 8 };
export const SPIN_HI = { mode: 'spin', ctl: 'speed', speed: 36000, thr: 0.66, duration: 8 };
const at = w => r => r.plan?.mode === 'spin' && Math.abs((r.plan.speed ?? 0) - w.speed) < 1;

export const request = () => ({
  tankP: psi(50), speed: 36000, speeds: [18000, 36000],
  title: 'TPA-1 S/N 001 first spin',
  text: 'First spin of TPA-1 S/N 001 on water. Both tanks at 50 psig, both throttles at 66 %. Two spins in speed control, 8 s each: 18 000 rpm (50 %), then 36 000 rpm (design). Deliverables: both speed pickups agree on the way up; head of each pump at each speed (the affinity laws say the design-speed head is four times the half-speed head at the same throttle); spin-up and coast-down times; turbine efficiency at design speed; bearing temperatures. Pre-test prediction at design: ox pump ≈ 385 m, fuel pump ≈ 479 m; drive ≈ 227 psig; turbine efficiency ≈ 0.52.',
  success: 'Two clean spins; the head ratio within 3 % of four; a report filed.',
});

const ratio = v => {
  const a = pumpRuns(v, at(SPIN_LO))[0]?.metrics.points[0], b = pumpRuns(v, at(SPIN_HI))[0]?.metrics.points[0];
  return a && b ? b.HOx / a.HOx : NaN;
};

export function procedure(def) {
  const lo = tpRunSteps(def, { label: 'Spin 1 (50 %)', want: SPIN_LO, match: at(SPIN_LO) });
  const hi = tpRunSteps(def, { label: 'Spin 2 (design)', want: SPIN_HI, match: at(SPIN_HI) });
  return finalize({
    id: 'tp-spin',
    title: 'TP-TP-019 · TPA-1 first spin',
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
      { id: 'J', title: 'Spin 1 — half speed', steps: lo },
      pollSection('K', { text: 'Console ▸ FIRE CONTROL ▸ POLL. The poll covers this test series: both spins.' }),
      { id: 'L', title: 'Spin 1 — fire', steps: [
        ...tpFireSteps(def, { label: 'Spin 1', match: at(SPIN_LO) }),
        { kind: 'verify', station: 'DAQ', title: 'The two speed pickups agreed all the way up',
          text: 'ANALYSIS ▸ the run: SE-341 and SE-342 on one plot. The reduction gives the largest disagreement.',
          why: 'If they disagree, the redline (the higher) and the speed controller (the mean) are acting on different numbers. Find out which is right BEFORE going to design speed.',
          check: v => { const r = pumpRuns(v, at(SPIN_LO))[0]; return !!r && r.metrics.summary.pickupSplit < 300; },
          failMsg: 'The pickups disagree. Stop and find out why: this is a NO-GO for the design-speed spin.' },
      ] },
      { id: 'M', title: 'Spin 2 — design speed', steps: [...hi, ...tpFireSteps(def, { label: 'Spin 2', match: at(SPIN_HI) })] },
      { id: 'N', title: 'Data', steps: [
        { kind: 'action', station: 'TC', title: 'Open both runs in ANALYSIS', check: v => pumpRuns(v).filter(r => v.flags.has('analysis:' + r.id)).length >= 2 },
        { kind: 'record', station: 'TC', title: 'Record the ox pump head at design speed (m)',
          record: { unit: 'm', validate: (x, v) => {
            const pt = pumpRuns(v, at(SPIN_HI))[0]?.metrics.points[0];
            if (!pt) return { ok: false, msg: 'No design-speed spin recorded.' };
            return near(x, pt.HOx, 3) ? { ok: true, msg: `${pt.HOx.toFixed(1)} m against a predicted ${v.runs.find(r => at(SPIN_HI)(r))?.meta.config.prediction?.headOx?.toFixed(1)} m.` } : { ok: false, msg: `The reduction gives ${pt.HOx.toFixed(1)} m.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the ratio of the two heads (design ÷ half speed)',
          text: 'Ox pump head at 36 000 rpm divided by the ox pump head at 18 000 rpm.',
          why: 'Head goes as speed squared at the same flow coefficient — and with the same throttle the flow is proportional to speed, so the flow coefficient IS the same. The ratio should be (36 000/18 000)² = 4, give or take the small change in the system curve.',
          record: { unit: '', validate: (x, v) => {
            const q = ratio(v);
            if (!Number.isFinite(q)) return { ok: false, msg: 'Both spins needed.' };
            return near(x, q, 0.05) ? { ok: true, msg: `${q.toFixed(3)}: ${Math.abs(q - 4) < 0.12 ? 'the affinity laws hold' : 'NOT four — find out why'}.` } : { ok: false, msg: `The heads give ${q.toFixed(3)}.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the turbine efficiency at design speed',
          text: 'ETA-T in the reduction: the actual temperature drop over the isentropic one.',
          record: { unit: '', validate: (x, v) => {
            const pt = pumpRuns(v, at(SPIN_HI))[0]?.metrics.points[0];
            if (!pt) return { ok: false, msg: 'No design-speed spin recorded.' };
            return near(x, pt.etaT, 0.01) ? { ok: true, msg: `${pt.etaT.toFixed(3)} at u/c0 = ${pt.uc0.toFixed(3)}.` } : { ok: false, msg: `The reduction gives ${pt.etaT.toFixed(3)}.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the coast-down to half speed after the design-speed spin (s)',
          why: 'The coast-down is a drag measurement with no instrument but a clock: trend it, run to run. A bearing or a rub shortens it.',
          record: { unit: 's', validate: (x, v) => {
            const s = pumpRuns(v, at(SPIN_HI))[0]?.metrics.summary;
            if (!s) return { ok: false, msg: 'No design-speed spin recorded.' };
            return near(x, s.coast50, 0.05) ? { ok: true, msg: `${s.coast50.toFixed(2)} s.` } : { ok: false, msg: `The reduction gives ${s.coast50.toFixed(2)} s.` };
          } } },
      ] },
      tpSafe(def, 'O'),
      { id: 'P', title: 'Report', steps: [reportStep()] },
    ],
  });
}

export default {
  id: 'tp-spin', title: 'First spin', objective: 'TPA-1: spins at 50 % and 100 % speed — affinity, coast-down, turbine efficiency',
  request, procedure, seriesPoll: true,
};
