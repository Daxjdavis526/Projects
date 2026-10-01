/* LEVEL 14 — First regeneratively cooled hot fire (BPE-2).

   Ten seconds — twice what BPE-1's copper could survive — at the design
   point, with a fuel lead so that the jacket and the injector manifold are
   full when the oxidiser arrives. The new things to watch are the coolant:
   how far it warms crossing the jacket (TC-728 − TC-727), how much heat
   that is, how far it is from boiling, and the liner temperatures, which
   should rise in the first second and then STAY — a cooled wall reaches a
   steady state, a heat sink never does.

   Generalised for training on a fictional stand. */

import { psi, degC } from '../../lib/units.js';
import { near, pollSection, reportStep, finalize } from './common.js';
import { bpPretest, bpInstrumentation, bpPressurantLeak, bpClearCell, bpPurge, bpSafe, P,
         bpLoadPropellants, bpHotDaq, bpSparkCheck, bpPressuriseHot, hotFirePoint, bpAfterFire, hotWhere, hotFired } from './bp-common.js';

export const WANT_RG = { duration: 10.0, lead: -0.2, ignLead: 0.5, ignCheck: 0.7, shutdown: 'ox-first' };
const first = v => hotWhere(v, () => true, { aborted: true })[0] || null;
const rec = (title, key, unit, conv, tol, msg) => ({ kind: 'record', station: 'TC', title,
  record: { unit, validate: (x, v) => {
    const r = first(v); if (!r || !r.metrics.summary.ignited) return { ok: false, msg: 'No lit run recorded.' };
    const val = conv(r.metrics.summary[key]);
    return near(x, val, tol) ? { ok: true, msg: msg(val, r) } : { ok: false, msg: `The reduction gives ${val.toFixed(1)} ${unit}.` };
  } } });

export const request = () => ({
  oxP: psi(420), fuP: psi(480),
  duration: 10.0,
  title: 'BPE-2 first hot fire',
  text: 'First hot fire of BPE-2 S/N 001, the regeneratively cooled engine. One 10.0 s burn: oxidiser tank 420 psig, fuel tank 480 psig (the extra 60 psi pays for the cooling jacket), FUEL LEAD 200 ms (the jacket must fill first — your cold flow measured how long that takes), igniter on at T−0.5 s, ignition check at T+0.7 s, oxidiser-first shutdown. Deliverables: Pc against prediction, the coolant temperature rise, the heat into the coolant, the boiling margin at the jacket outlet, and the throat liner temperature.',
  success: 'A clean start and a full 10 s; Pc within 5 % of prediction; liner temperatures steady below 320 °C; boiling margin reported.',
});

export function procedure(def) {
  const fire = hotFirePoint(def, { label: 'Hot fire', want: WANT_RG, match: () => true });
  return finalize({
    id: 'rg-hotfire',
    title: 'TP-RG-014 · First regeneratively cooled hot fire',
    sections: [
      bpPretest(def, 'A', { reviewText: v => {
        const p = v.prediction;
        return `${v.request.text} Pre-test prediction (drawing values, jacket included): ${p && p.kind === 'hotfire' && p.Pc > 0 ? `Pc ${P(p.Pc)}, thrust ${p.F.toFixed(0)} N, MR ${p.MR.toFixed(2)}` : 'available once propellants are loaded and the tanks set'}.`;
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
        { kind: 'info', station: 'TC', title: 'What is different about this engine',
          text: 'FUEL first: MFV-723 opens 200 ms before MOV-713, so that 55 cc of jacket and 20 cc of manifold are full when the oxidiser arrives. Ignition check at T+0.7 s rather than T+0.5. Then watch the coolant: TC-728 climbs for a second or two and levels off; TSAT-M is how far it is from boiling; TC-803 is the liner at the throat.',
          why: 'A cooled engine is only as good as its coolant flow. The fuel lead protects the start; the fuel tank pressure protects the cooling.',
          teach: 'Burnout is the failure mode of a regeneratively cooled chamber: the coolant boils at the wall, a vapour film forms, and a millimetre of copper meets 3000 K with nothing behind it. The redlines on TC-803 and the boiling margin exist for that.' },
        fire[0],
      ] },
      pollSection('K', { text: 'Console ▸ FIRE CONTROL ▸ POLL. New for BPE-2: the coolant (fuel) inlet temperature, and a propellant budget for a 10 s burn.' }),
      { id: 'L', title: 'Fire', steps: fire.slice(1) },
      bpAfterFire(def, 'M'),
      bpSafe(def, 'N', hotFired),
      { id: 'O', title: 'Data', steps: [
        { kind: 'verify', station: 'TC', title: 'Ignition confirmed and a full 10 s',
          check: v => { const r = first(v); return !!r && !r.aborted && r.metrics.summary.ignited && r.metrics.summary.dur > 9.5; },
          failMsg: 'Not a full-duration lit run. Look at the abort and the start before anything else.' },
        { kind: 'action', station: 'TC', title: 'Open the run in ANALYSIS',
          text: 'The start (PT-729, PT-725, PT-715 and PT-801 in the first second), the coolant (TC-728 levelling off), the liner (TC-802, TC-803).',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'verify', station: 'TC', title: 'Pc within 5 % of the prediction',
          check: v => { const r = first(v), p = r?.meta.config.prediction; return !!r && r.metrics.summary.ignited && p?.Pc > 0 && Math.abs(r.metrics.summary.Pc / p.Pc - 1) < 0.05; },
          failMsg: 'More than 5 % from the prediction.' },
        rec('Record the coolant temperature rise (TC-728 − TC-727), K', 'dTc', 'K', x => x, 3, (x, r) => `${x.toFixed(0)} K.`),
        rec('Record the heat into the coolant, kW', 'Qjkt', 'kW', x => x / 1e3, 0.5, x => `${x.toFixed(1)} kW — heat that goes back into the chamber with the fuel instead of into the wall.`),
        rec('Record the smallest boiling margin at the jacket outlet, K', 'boilMargin', 'K', x => x, 3, x => `${x.toFixed(0)} K below boiling at the hottest, lowest-pressure point of the jacket.`),
        { kind: 'verify', station: 'PROP', title: 'Throat liner steady below 320 °C',
          why: 'BPE-1\'s throat passed 400 °C in 4 s and kept climbing. A cooled liner levels off: the heat goes into the fuel instead of into the copper.',
          check: v => { const r = first(v); return !!r && r.metrics.summary.TthMax < degC(320); },
          failMsg: 'The throat liner ran hotter than it should. Something is wrong with the cooling.' },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'rg-hotfire', title: 'First regen hot fire', objective: 'BPE-2: 10 s at 420/480 psig, 200 ms fuel lead',
  request, procedure,
  setup(session) { session.daq.setRate(250); },
};
