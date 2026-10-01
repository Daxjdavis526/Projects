/* LEVEL 13 — Cooling-jacket cold flow (BPE-2).

   Before a regeneratively cooled engine sees fire, its jacket is flowed:
   water through the fuel side, at two tank pressures, to measure the
   jacket's own pressure drop and flow coefficient — the fuel tank has to
   supply that drop on top of everything else — and to time how long the
   fuel side takes to prime now that the jacket must fill before the
   injector. Then the oxidiser side alone, for its priming time. The
   difference between the two is the valve LEAD the hot fire needs.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { near, daqConfig, pollSection, reportStep, finalize } from './common.js';
import { bpPretest, bpInstrumentation, bpLoad, bpPressurantLeak, bpClearCell, bpPurge, bpSafe, flowPoint, flowsWhere } from './bp-common.js';

const at = (r, id, p) => near(r.meta.config.sp?.[id], p, psi(2));
const side = s => r => (r.plan?.sides || 'both') === s;
const POINTS = [
  { n: 1, label: 'Flow 1', sides: 'fuel', oxP: psi(200), fuP: psi(200), match: r => side('fuel')(r) && at(r, 'PR-620', psi(200)) },
  { n: 2, label: 'Flow 2', sides: 'fuel', oxP: psi(350), fuP: psi(350), match: r => side('fuel')(r) && at(r, 'PR-620', psi(350)) },
  { n: 3, label: 'Flow 3', sides: 'ox', match: r => side('ox')(r) && at(r, 'PR-610', psi(350)) },
];
const runOf = (v, n) => { const p = POINTS[n - 1]; const rs = flowsWhere(v, p.match); return rs[rs.length - 1] || null; };

export const request = () => ({
  oxP: psi(200), fuP: psi(200), range: [psi(200), psi(350)], duration: 3.0,
  title: 'BPE-2 cooling-jacket cold flow',
  text: 'Water cold flow of BPE-2 S/N 001 before its first hot fire. Three 3 s flows: the fuel side alone (through the cooling jacket) at 200 and at 350 psig tank pressure, then the oxidiser side alone at 350 psig. Deliverables: the jacket ΔP and flow coefficient (CdA), repeatable between the two pressures; the priming time of each side; and the fuel lead the hot-fire sequence should use.',
  success: 'Three clean flows; jacket CdA repeatable within 3 %; a fuel lead recommended from the measured priming times.',
});

export function procedure(def) {
  const flows = POINTS.flatMap(p => flowPoint(def, { label: p.label, sides: p.sides, oxP: p.oxP ?? null, fuP: p.fuP ?? null, match: p.match }));
  return finalize({
    id: 'rg-coldflow',
    title: 'TP-RG-013 · Cooling-jacket cold flow (water)',
    sections: [
      bpPretest(def, 'A'),
      bpInstrumentation(def, 'B'),
      bpLoad(def, 'C'),
      daqConfig(def, 'D', { minRate: 1000, text: 'Console ▸ DAQ ▸ Rate ≥ 1000 Hz.', why: 'Priming is what this test times. 250 Hz would blur it.' }),
      bpPressurantLeak(def, 'E'),
      bpClearCell(def, 'F'),
      bpPurge(def, 'G'),
      { id: 'H', title: 'Pressurise to the first point', steps: [
        { kind: 'action', station: 'PROP', title: 'Both tanks → 200 psig',
          text: 'PR-610 and PR-620 to 200 psig; wait for lock-up.',
          check: v => near(v.ch('PT-710'), psi(200), psi(6)) && near(v.ch('PT-720'), psi(200), psi(6)) },
      ] },
      pollSection('I', { text: 'One poll for the matrix (200–350 psig).' }),
      { id: 'J', title: 'The flows', steps: [
        { kind: 'info', station: 'TC', title: 'Where the new transducer is',
          text: 'PT-727 is at the jacket INLET, at the nozzle end; PT-725 at its outlet, in the injector manifold. Their difference is the jacket ΔP. The fuel flow passes FT-724 before either.',
          why: 'Every component in a flow path has its own pressure drop, and the only way to know each is a transducer on each side of it.' },
        ...flows] },
      bpSafe(def, 'K', v => !!runOf(v, 3)),
      { id: 'L', title: 'Data', steps: [
        { kind: 'action', station: 'TC', title: 'Open the flows in ANALYSIS',
          text: 'PT-727 and PT-725 through each fuel flow; the manifold pressures rising after each valve opens.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'record', station: 'TC', title: 'Record the jacket CdA (Flow 2), mm²',
          record: { unit: 'mm²', validate: (x, v) => {
            const r = runOf(v, 2); if (!r) return { ok: false, msg: 'Flow 2 not recorded yet.' };
            const c = r.metrics.summary.CdAjkt * 1e6;
            return near(x, c, 0.02 * c) ? { ok: true, msg: `${c.toFixed(2)} mm² — with ${P2(r.metrics.summary.dPjkt)} of ΔP at this flow.` } : { ok: false, msg: `The reduction gives ${c.toFixed(2)} mm².` };
          } } },
        { kind: 'verify', station: 'TC', title: 'Jacket CdA repeatable between 200 and 350 psig (within 3 %)',
          why: 'A jacket that changes its flow coefficient with pressure is either not full, or not what it seems.',
          check: v => { const a = runOf(v, 1), b = runOf(v, 2); return !!(a && b) && Math.abs(a.metrics.summary.CdAjkt / b.metrics.summary.CdAjkt - 1) < 0.03; },
          failMsg: 'The jacket CdA moved by more than 3 % between the two pressures.' },
        { kind: 'record', station: 'TC', title: 'Record the fuel-side priming time (Flow 2), ms',
          record: { unit: 'ms', validate: (x, v) => {
            const r = runOf(v, 2); if (!r) return { ok: false, msg: 'Flow 2 not recorded yet.' };
            const t = r.metrics.summary.primeFu * 1e3;
            return near(x, t, 20) ? { ok: true, msg: `${t.toFixed(0)} ms — the jacket fills before the injector sees liquid.` } : { ok: false, msg: `The reduction gives ${t.toFixed(0)} ms.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the oxidiser-side priming time (Flow 3), ms',
          record: { unit: 'ms', validate: (x, v) => {
            const r = runOf(v, 3); if (!r) return { ok: false, msg: 'Flow 3 not recorded yet.' };
            const t = r.metrics.summary.primeOx * 1e3;
            return near(x, t, 20) ? { ok: true, msg: `${t.toFixed(0)} ms.` } : { ok: false, msg: `The reduction gives ${t.toFixed(0)} ms.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Recommend the hot-fire fuel lead, ms',
          text: 'Fuel priming time minus oxidiser priming time: open the fuel valve that much earlier and both propellants reach the injector face together.',
          why: 'On BPE-1 zero lead was right because its two manifolds primed together. A jacket changes that — and a start sequence copied from the old engine would light late.',
          record: { unit: 'ms', validate: (x, v) => {
            const a = runOf(v, 2), b = runOf(v, 3); if (!a || !b) return { ok: false, msg: 'Flows 2 and 3 are both needed.' };
            const d = (a.metrics.summary.primeFu - b.metrics.summary.primeOx) * 1e3;
            return near(x, d, 60) ? { ok: true, msg: `${d.toFixed(0)} ms from the priming times; the reference sequence uses 200 ms.` } : { ok: false, msg: `The priming times differ by ${d.toFixed(0)} ms.` };
          } } },
        reportStep(),
      ] },
    ],
  });
}
const P2 = x => `${(x / 6894.757).toFixed(0)} psi`;

export default {
  id: 'rg-coldflow', title: 'Cooling-jacket cold flow', objective: 'BPE-2 jacket ΔP and CdA, priming times, the fuel lead',
  request, procedure, seriesPoll: true,
  setup(session) { session.daq.setRate(250); },
};
