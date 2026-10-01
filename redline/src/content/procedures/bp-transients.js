/* LEVEL 10 — Start and shutdown transients.

   Three short hot fires that differ only in their start: valves together,
   oxidiser 50 ms first, fuel 50 ms first. Everything interesting happens in
   the first few tenths of a second and the last few — priming, ignition,
   the overshoot, and the dribble volume burning out after the valves have
   closed. The steady state in the middle is the control.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { near, pollSection, reportStep, finalize } from './common.js';
import { bpPretest, bpInstrumentation, bpPressurantLeak, bpClearCell, bpPurge, bpSafe,
         bpLoadPropellants, bpHotDaq, bpSparkCheck, bpPressuriseHot, hotFirePoint, bpAfterFire, hotWhere } from './bp-common.js';

const BASE = { duration: 1.5, ignLead: 0.5, ignCheck: 0.5, shutdown: 'ox-first' };
const POINTS = [
  { n: 1, label: 'Fire 1', lead: 0 },
  { n: 2, label: 'Fire 2', lead: 0.05 },
  { n: 3, label: 'Fire 3', lead: -0.05 },
];
const leadOf = r => r.plan?.lead ?? 0;
const match = p => r => Math.abs(leadOf(r) - p.lead) < 0.001 && Math.abs((r.plan?.duration ?? 0) - BASE.duration) < 0.001;
const runOf = (v, n) => { const p = POINTS[n - 1]; const rs = hotWhere(v, match(p), { aborted: true }); return rs[rs.length - 1] || null; };
const S_ = (v, n) => runOf(v, n)?.metrics?.summary;
const allFired = v => POINTS.every(p => !!runOf(v, p.n));

export const request = () => ({
  oxP: psi(400), fuP: psi(400),
  duration: 1.5,
  title: 'BPE-1 start-transient characterisation',
  text: 'Characterise the BPE-1 start and shutdown at 400/400 psig. Three 1.5 s burns, identical except for the main-valve lead: zero; oxidiser 50 ms first; fuel 50 ms first. Igniter T−0.5 s, ignition check T+0.5 s, oxidiser-first shutdown. Cool the throat below 150 °C between burns. Deliverables per run: valve-to-flame time, Pc rise time, start overshoot; for the zero-lead run, the shutdown impulse.',
  success: 'Three lit runs; the start overshoot and valve-to-flame time of each reported; a recommendation on the lead for the campaign.',
});

export function procedure(def) {
  const fires = POINTS.flatMap(p => hotFirePoint(def, { label: p.label, want: { ...BASE, lead: p.lead }, match: match(p) }));
  return finalize({
    id: 'bp-transients',
    title: 'TP-BP-010 · Start and shutdown transients',
    sections: [
      bpPretest(def, 'A'),
      bpInstrumentation(def, 'B'),
      bpLoadPropellants(def, 'C'),
      bpHotDaq(def, 'D'),
      bpSparkCheck(def, 'E'),
      bpPressurantLeak(def, 'F'),
      bpClearCell(def, 'G'),
      bpPurge(def, 'H'),
      bpPressuriseHot(def, 'I'),
      pollSection('J', { text: 'One poll for the series. Between burns, only the plan changes — and the throat cools.' }),
      { id: 'K', title: 'The burns', steps: [
        { kind: 'info', station: 'TC', title: 'What to watch',
          text: 'Each manifold primes in about 0.2 s. With a lead, one propellant arrives first and collects — as spray and as a film on the walls — until the other arrives and the spark lights both. The longer the lead, the more is waiting.',
          why: 'This is how hard starts happen, in miniature. The overpressure redline (475 psig, the chamber\'s structural limit) protects the engine from the big ones.',
          teach: 'A real sequence designer picks the lead from the two priming times the cold flow measured, so that both propellants reach the injector face together.' },
        ...fires,
      ] },
      bpAfterFire(def, 'L', allFired),
      bpSafe(def, 'M', allFired),
      { id: 'N', title: 'Data', steps: [
        { kind: 'action', station: 'TC', title: 'Overlay the three starts in ANALYSIS',
          text: 'Compare PT-801, OD-804, PT-715 and PT-725 over the first 0.5 s of each run.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        { kind: 'record', station: 'TC', title: 'Record the start overshoot of Fire 1 (zero lead), %',
          record: { unit: '%', validate: (x, v) => {
            const s = S_(v, 1); if (!s?.ignited) return { ok: false, msg: 'Fire 1 not recorded (or not lit).' };
            return near(x, 100 * s.overshoot, 3) ? { ok: true, msg: `${(100 * s.overshoot).toFixed(0)} % — ${s.start}.` } : { ok: false, msg: `The reduction gives ${(100 * s.overshoot).toFixed(0)} %.` };
          } } },
        { kind: 'record', station: 'TC', title: 'Record the start overshoot of Fire 2 (oxidiser lead), %',
          record: { unit: '%', validate: (x, v) => {
            const s = S_(v, 2); if (!s?.ignited) return { ok: false, msg: 'Fire 2 not recorded (or not lit).' };
            return near(x, 100 * s.overshoot, 3) ? { ok: true, msg: `${(100 * s.overshoot).toFixed(0)} % — ${s.start}.` } : { ok: false, msg: `The reduction gives ${(100 * s.overshoot).toFixed(0)} %.` };
          } } },
        { kind: 'verify', station: 'TC', title: 'A lead in either direction makes the start rougher',
          text: 'Compare the three overshoots.',
          why: 'Zero lead is the sweet spot on this engine because its two manifolds prime at nearly the same time. That is an engine-specific result, not a rule.',
          check: v => { const a = S_(v, 1), b = S_(v, 2), c = S_(v, 3); return !!(a && b && c) && b.overshoot > a.overshoot && c.overshoot > a.overshoot; },
          failMsg: 'Not what the data show — look again at the start of each run.' },
        { kind: 'record', station: 'TC', title: 'Record the shutdown impulse of Fire 1, N·s',
          text: 'From the reduction: impulse from the first main valve closing to 1 s later.',
          why: 'The dribble volume burning out after the valves close. For a 1.5 s burn it is a sizeable fraction of the total — which is what makes short pulses hard to meter with this injector.',
          record: { unit: 'N·s', validate: (x, v) => {
            const s = S_(v, 1); if (!s?.ignited) return { ok: false, msg: 'Fire 1 not recorded (or not lit).' };
            return near(x, s.Ishut, Math.max(3, 0.05 * s.Ishut)) ? { ok: true, msg: `${s.Ishut.toFixed(0)} N·s of ${s.Itot.toFixed(0)} N·s total.` } : { ok: false, msg: `The reduction gives ${s.Ishut.toFixed(0)} N·s.` };
          } } },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'bp-transients',
  title: 'Startup/shutdown analysis',
  objective: 'Three 1.5 s hot fires: zero lead, 50 ms ox lead, 50 ms fuel lead',
  request,
  procedure,
  seriesPoll: true,
  setup(session) {
    session.daq.setRate(250);
  },
};
