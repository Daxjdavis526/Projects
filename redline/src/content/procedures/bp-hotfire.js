/* LEVEL 9 — First hot fire.

   OX-1 and FU-1 instead of water, and a spark. The same stand and the same
   feed system the cold flow characterised; the new things are the igniter
   (which must be sparking before the propellants arrive and confirmed
   after), the start sequence, the ignition check, a burn-time limit set by
   a copper chamber that is not cooled, and the soak-back after shutdown.

   One 2 s burn at the conservative point: both tanks at 400 psig, zero
   lead. The result is compared with the prediction — which used the
   injector drawing, and is therefore a few per cent off in exactly the way
   the cold flow said it would be.

   Generalised for training on a fictional stand. */

import { psi, degC } from '../../lib/units.js';
import { near, pollSection, reportStep, finalize } from './common.js';
import { bpPretest, bpInstrumentation, bpPressurantLeak, bpClearCell, bpPurge, bpSafe, P,
         bpLoadPropellants, bpHotDaq, bpSparkCheck, bpPressuriseHot, hotFirePoint, bpAfterFire, hotWhere, hotFired } from './bp-common.js';

const WANT = { duration: 2.0, lead: 0, ignLead: 0.5, ignCheck: 0.5, shutdown: 'ox-first' };
const first = v => hotWhere(v, () => true, { aborted: true })[0] || null;

export const request = () => ({
  oxP: psi(400), fuP: psi(400),
  duration: 2.0,
  title: 'BPE-1 first hot fire',
  text: 'First ignition of BPE-1 S/N 001 on OX-1 / FU-1. One 2.0 s burn, both tanks at 400 psig, zero valve lead, igniter on at T−0.5 s, ignition check at T+0.5 s, oxidiser-first shutdown with 50 ms lag, 3 s post-purge. Deliverables: confirmed ignition, steady chamber pressure, thrust and mixture ratio against the pre-test prediction, c* efficiency, and the throat temperature peak after shutdown.',
  success: 'A clean start and a full-duration burn; Pc within 5 % of prediction; c* efficiency reported; throat peak below the 600 °C limit.',
});

export function procedure(def) {
  return finalize({
    id: 'bp-hotfire',
    title: 'TP-BP-009 · First hot fire',
    sections: [
      bpPretest(def, 'A', { reviewText: v => {
        const p = v.prediction;
        return `${v.request.text} Pre-test prediction (injector drawing, design c* efficiency, both tanks 400 psig): ${p && p.kind === 'hotfire' && p.Pc > 0 ? `Pc ${P(p.Pc)}, thrust ${p.F.toFixed(0)} N, MR ${p.MR.toFixed(2)}, Isp ${p.Isp.toFixed(0)} s` : 'available once propellants are loaded'}. Your cold flow measured the real injector — expect the mixture ratio to be lower than the drawing says, by the amount the cold flow predicted.`;
      } }),
      bpInstrumentation(def, 'B'),
      bpLoadPropellants(def, 'C'),
      bpHotDaq(def, 'D'),
      bpSparkCheck(def, 'E'),
      bpPressurantLeak(def, 'F'),
      bpClearCell(def, 'G'),
      bpPurge(def, 'H'),
      bpPressuriseHot(def, 'I', { title: 'Pressurise to the firing point' }),
      { id: 'J', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'The start sequence',
          text: 'T−0.5 s igniter on (sparking into an empty chamber; OD-804 sees the spark glow). T-0 both main valves open together; both manifolds prime in ≈0.2 s; the first mixture to reach the spark lights. T+0.5 s the ignition check: PT-801 must be above 30 % of the predicted Pc, or the sequence aborts. T+1.0 s igniter off. T+2.0 s oxidiser valve closes, fuel 50 ms later; post-purge.',
          why: 'Every line of that is a decision someone made for a reason. The igniter is on first so that the first propellant in the chamber meets a spark. The ignition check is late enough for both manifolds to prime and early enough that a no-light does not fill the cell. Oxidiser closes first so the engine goes out fuel-rich, which is cooler.',
          teach: 'Hard start: propellant collecting unlit and then lighting all at once. Lead one valve by 100 ms, or light 50 ms late, and the chamber sees a pressure spike the structure was not designed for.' },
        ...hotFirePoint(def, { label: 'Hot fire', want: WANT, match: () => true }).slice(0, 1),
      ] },
      pollSection('K', { text: 'Console ▸ FIRE CONTROL ▸ POLL. New items for a hot fire: run type against what is in the tanks, meter calibration fluid, igniter spark check, throat temperature, burn duration against the heat-sink limit.' }),
      { id: 'L', title: 'Fire', steps: hotFirePoint(def, { label: 'Hot fire', want: WANT, match: () => true }).slice(1) },
      bpAfterFire(def, 'M'),
      bpSafe(def, 'N', hotFired),
      { id: 'O', title: 'Data', steps: [
        { kind: 'verify', station: 'TC', title: 'Ignition confirmed and a full-duration burn',
          text: 'ANALYSIS ▸ the run: OD-804 crossing into flame, PT-801 rising, no abort.',
          why: 'Confirmation is from two independent measurements: a pressure and a light.',
          check: v => { const r = first(v); return !!r && !r.aborted && r.metrics.summary.ignited; },
          failMsg: 'The run did not light, or was aborted. Find out why before anything else — see the debrief and the abort log.' },
        { kind: 'action', station: 'TC', title: 'Open the run in ANALYSIS', text: 'Look at the start (OD-804, PT-801, PT-715/725 in the first 0.4 s), the steady window, the shutdown tail, and TC-803 after shutdown.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'record', station: 'TC', title: 'Record the steady chamber pressure (PT-801)',
          record: { unit: 'psig', validate: (x, v) => {
            const r = first(v); if (!r || !r.metrics.summary.ignited) return { ok: false, msg: 'No lit run recorded.' };
            const pc = r.metrics.summary.Pc / psi(1);
            return near(x, pc, 2) ? { ok: true, msg: `${pc.toFixed(1)} psig against a predicted ${(r.meta.config.prediction?.Pc / psi(1)).toFixed(1)}.` } : { ok: false, msg: `The reduction gives ${pc.toFixed(1)} psig.` };
          } } },
        { kind: 'verify', station: 'TC', title: 'Pc within 5 % of the prediction',
          why: 'The prediction used the drawing; the engine is the as-built injector. A few per cent is the cold flow showing through — more than that is a finding.',
          check: v => { const r = first(v); const p = r?.meta.config.prediction; return !!r && r.metrics.summary.ignited && p?.Pc > 0 && Math.abs(r.metrics.summary.Pc / p.Pc - 1) < 0.05; },
          failMsg: 'Chamber pressure is more than 5 % from the prediction. Is it the flows (tank pressures, meters) or the combustion (c*)?' },
        { kind: 'record', station: 'TC', title: 'Record the mixture ratio (FT-714 / FT-724)',
          text: 'Compare it with the drawing prediction AND with the hot-fire MR your cold flow predicted.',
          why: 'The drawing said 1.48 at equal tank pressures. The real injector is not the drawing.',
          record: { unit: '', validate: (x, v) => {
            const r = first(v); if (!r || !r.metrics.summary.ignited) return { ok: false, msg: 'No lit run recorded.' };
            const m = r.metrics.summary.MR;
            return near(x, m, 0.02) ? { ok: true, msg: `MR ${m.toFixed(3)} (weighed ${r.metrics.summary.MRw.toFixed(3)}); drawing ${r.meta.config.prediction?.MR?.toFixed(3)}.` } : { ok: false, msg: `The reduction gives ${m.toFixed(3)}.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the c* efficiency',
          text: 'Measured c* (Pc·Cd·At/ṁ) over the ideal c* at the measured MR.',
          why: 'The figure of merit for the injector and chamber: how much of the chemistry\'s energy became pressure.',
          record: { unit: '', validate: (x, v) => {
            const r = first(v); if (!r || !r.metrics.summary.ignited) return { ok: false, msg: 'No lit run recorded.' };
            const e = r.metrics.summary.etaCstar;
            return near(x, e, 0.01) ? { ok: true, msg: `η c* = ${e.toFixed(3)} (the design assumed ${def.design.etaCstar}).` } : { ok: false, msg: `The reduction gives ${e.toFixed(3)}.` };
          } } },
        { kind: 'verify', station: 'PROP', title: 'Throat peak after shutdown below 600 °C',
          text: 'From the reduction: TC-803 peak (soak-back).',
          check: v => { const r = first(v); return !!r && r.metrics.summary.TthPeak < degC(600); },
          failMsg: 'The throat soaked back above its limit. The burn was too long for this chamber.' },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'bp-hotfire',
  title: 'First hot fire',
  objective: 'BPE-1 first ignition: 2 s at 400/400 psig, zero lead',
  request,
  procedure,
  setup(session) {
    session.daq.setRate(250);
  },
};
