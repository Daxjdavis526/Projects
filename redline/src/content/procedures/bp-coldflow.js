/* LEVEL 8 — Bipropellant cold-flow test.

   Water through the injector, one side at a time and then both, at two
   tank pressures. What comes out of it is the injector's real flow
   coefficient on each side, a check of each flowmeter against its tank
   scale, and — the point of the exercise — the mixture ratio the engine
   will actually run at when the water becomes propellant.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { near, daqConfig, pollSection, reportStep, finalize } from './common.js';
import { bpRecordStep, bpPretest, bpInstrumentation, bpLoad, bpPressurantLeak, bpClearCell, bpPurge, bpSafe, flowPoint, flowsWhere, P } from './bp-common.js';

const at = (r, id, p) => near(r.meta.config.sp?.[id], p, psi(2));
const side = s => r => (r.plan?.sides || 'both') === s;
const POINTS = [
  { n: 1, label: 'Flow 1', sides: 'ox', oxP: psi(150), fuP: psi(150), match: r => side('ox')(r) && at(r, 'PR-610', psi(150)) },
  { n: 2, label: 'Flow 2', sides: 'fuel', match: r => side('fuel')(r) && at(r, 'PR-620', psi(150)) },
  { n: 3, label: 'Flow 3', sides: 'ox', oxP: psi(300), fuP: psi(300), match: r => side('ox')(r) && at(r, 'PR-610', psi(300)) },
  { n: 4, label: 'Flow 4', sides: 'fuel', match: r => side('fuel')(r) && at(r, 'PR-620', psi(300)) },
  { n: 5, label: 'Flow 5', sides: 'both', match: r => side('both')(r) && at(r, 'PR-610', psi(300)) && at(r, 'PR-620', psi(300)) },
];
const runOf = (v, n) => { const p = POINTS[n - 1]; const rs = flowsWhere(v, p.match); return rs[rs.length - 1] || null; };

export const request = () => ({
  oxP: psi(150), fuP: psi(150),
  range: [psi(150), psi(300)],
  duration: 3.0,
  title: 'BPE-1 injector cold flow',
  text: 'Water cold flow of the BPE-1 injector, S/N 001, as built. Five 3 s flows: oxidiser side alone and fuel side alone at 150 psig tank pressure, then each alone at 300 psig, then both together at 300 psig with a 100 ms oxidiser lead. Deliverables: the measured flow coefficient (CdA) of each injector side, a check of each turbine meter against its tank scale, and the hot-fire mixture ratio this injector will give on OX-1 / FU-1 at the design injector ΔP (100 psi).',
  success: 'Five clean flows; CdA from each side repeatable between 150 and 300 psig within 2 %; meters within 2 % of the scales; hot-fire MR reported against the design value of 1.50.',
});

export function procedure(def) {
  const R = def.ratings;
  const flows = POINTS.flatMap(p => flowPoint(def, { label: p.label, sides: p.sides, oxP: p.oxP ?? null, fuP: p.fuP ?? null, match: p.match }));
  return finalize({
    id: 'bp-coldflow',
    title: 'TP-BP-008 · Injector cold flow (water)',
    sections: [
      bpPretest(def, 'A', { reviewText: v => `${v.request.text} Pre-test prediction from the injector DRAWING, both sides at ${P(v.request.oxP)}: ox ${v.prediction ? (v.prediction.mdotOx * 1e3).toFixed(0) : '…'} g/s, fuel ${v.prediction ? (v.prediction.mdotFu * 1e3).toFixed(0) : '…'} g/s of water.` }),
      bpInstrumentation(def, 'B'),
      bpLoad(def, 'C'),
      daqConfig(def, 'D', { minRate: 1000, text: 'Console ▸ DAQ ▸ Rate ≥ 1000 Hz.', why: 'Priming takes a couple of hundred milliseconds and the shutdown surge less than that. 250 Hz would draw both as a step.' }),
      bpPressurantLeak(def, 'E'),
      bpClearCell(def, 'F'),
      bpPurge(def, 'G'),
      { id: 'H', title: 'Pressurise to the first point', steps: [
        { kind: 'action', station: 'PROP', title: 'Both tanks → 150 psig',
          text: 'PR-610 and PR-620 to 150 psig; wait for PT-710 and PT-720 to lock up.',
          check: v => near(v.ch('PT-710'), psi(150), psi(6)) && near(v.ch('PT-720'), psi(150), psi(6)) },
        { kind: 'action', station: 'DAQ', title: 'Tare LC-901 at pressure',
          text: 'Console ▸ DAQ ▸ TARE LC.', why: 'The engine load cell will see a few newtons of jet momentum. Its zero has to be good to well under that.',
          check: v => v.has(e => e.tare && e.tare.some(o => o.id === 'LC-901')) },
        bpRecordStep(),
      ] },
      pollSection('I', { text: 'One poll for the whole approved matrix (150–300 psig). Anything outside it — a valve, the cell, a technician — needs a new one.' }),
      { id: 'J', title: 'The flows', steps: flows },
      bpSafe(def, 'K', v => !!runOf(v, 5)),
      { id: 'L', title: 'Data', steps: [
        { kind: 'action', station: 'TC', title: 'Open the flows in ANALYSIS',
          text: 'Look at priming (PT-715/725 rising after the valve opens), the steady window, the shutdown surge on PT-713/723, and the tank scales falling.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'record', station: 'TC', title: 'Record the oxidiser-side CdA at 300 psig (Flow 3), mm²',
          text: 'From the reduction of Flow 3.', why: 'The number the drawing only estimated.',
          record: { unit: 'mm²', validate: (x, v) => {
            const r = runOf(v, 3); if (!r) return { ok: false, msg: 'Flow 3 not recorded yet.' };
            const c = r.metrics.summary.CdAOx * 1e6;
            return near(x, c, 0.02 * c) ? { ok: true, msg: `${c.toFixed(3)} mm² (drawing ${(def.design.CdAox * 1e6).toFixed(2)})` } : { ok: false, msg: `The reduction gives ${c.toFixed(3)} mm².` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the fuel-side CdA at 300 psig (Flow 4), mm²',
          record: { unit: 'mm²', validate: (x, v) => {
            const r = runOf(v, 4); if (!r) return { ok: false, msg: 'Flow 4 not recorded yet.' };
            const c = r.metrics.summary.CdAFu * 1e6;
            return near(x, c, 0.02 * c) ? { ok: true, msg: `${c.toFixed(3)} mm² (drawing ${(def.design.CdAfu * 1e6).toFixed(2)})` } : { ok: false, msg: `The reduction gives ${c.toFixed(3)} mm².` };
          } } },
        { kind: 'verify', station: 'TC', title: 'CdA repeatable between 150 and 300 psig (within 2 %)',
          text: 'Compare Flow 1 with Flow 3 and Flow 2 with Flow 4.',
          why: 'An orifice\'s flow coefficient barely changes with pressure. If yours does, the measurement is suspect — a meter, a transducer, or a manifold that never fully primed.',
          check: v => { const a = runOf(v, 1), b = runOf(v, 3), c = runOf(v, 2), d = runOf(v, 4);
            return !!(a && b && c && d) && Math.abs(a.metrics.summary.CdAOx / b.metrics.summary.CdAOx - 1) < 0.02 && Math.abs(c.metrics.summary.CdAFu / d.metrics.summary.CdAFu - 1) < 0.02; },
          failMsg: 'CdA changed by more than 2 % with pressure on at least one side.' },
        { kind: 'verify', station: 'TC', title: 'Flowmeters agree with the tank scales (within 2 %)',
          text: 'Meter vs scale, every flow.',
          why: 'The scale weighs what actually left; the turbine meter infers it from a rotor speed and a density. Agreement makes both trustworthy.',
          check: v => POINTS.every(p => { const r = runOf(v, p.n); if (!r) return false; const S = r.metrics.summary;
            return (!Number.isFinite(S.errOx) || Math.abs(S.errOx) < 0.02) && (!Number.isFinite(S.errFu) || Math.abs(S.errFu) < 0.02); }),
          failMsg: 'A meter disagrees with its scale by more than 2 % in at least one flow.' },
        { kind: 'record', station: 'TC', title: 'Record the hot-fire mixture ratio this injector will give (Flow 5)',
          text: 'From the reduction: CdA_ox·√(2ρ_OX·ΔP) ÷ CdA_fu·√(2ρ_FU·ΔP) at the design ΔP. Design value 1.50.',
          why: 'This is what the cold flow was for. If it is not 1.50, the hot-fire tank pressures must be set differently on each side — or the injector reworked — before anything is lit.',
          record: { unit: '', validate: (x, v) => {
            const r = runOf(v, 5); if (!r) return { ok: false, msg: 'Flow 5 not recorded yet.' };
            const m = r.metrics.summary.MRhot;
            return near(x, m, 0.02) ? { ok: true, msg: `MR ${m.toFixed(3)} against a design 1.50.` } : { ok: false, msg: `The reduction gives ${m.toFixed(3)}.` };
          } } },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'bp-coldflow',
  title: 'Bipropellant cold-flow test',
  objective: 'Injector cold flow, water: CdA per side, meter check, hot-fire MR',
  request,
  procedure,
  seriesPoll: true,
  setup(session) {
    session.daq.setRate(250);
  },
};
