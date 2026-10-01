/* LEVEL 15 — Cooling margins (BPE-2).

   Three burns that move the operating point and watch what it does to the
   coolant: the design point; an oxidiser-rich point (less fuel, so less
   coolant, for nearly the same heat); and a throttled point (less of
   everything — but the heat falls more slowly than the coolant flow, and
   the jacket pressure, and with it the boiling point, falls too). The
   deliverable is the boiling margin at each, and where the engine is
   closest to trouble.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { near, pollSection, reportStep, finalize } from './common.js';
import { bpPretest, bpInstrumentation, bpPressurantLeak, bpClearCell, bpPurge, bpSafe, P,
         bpLoadPropellants, bpHotDaq, bpSparkCheck, hotFirePoint, bpAfterFire, hotWhere } from './bp-common.js';
import { WANT_RG } from './rg-hotfire.js';

const WANT = { ...WANT_RG, duration: 6.0 };
const POINTS = [
  { n: 1, label: 'Fire 1 (design)', ox: 420, fu: 480 },
  { n: 2, label: 'Fire 2 (oxidiser-rich)', ox: 460, fu: 440 },
  { n: 3, label: 'Fire 3 (throttled)', ox: 300, fu: 340 },
];
const at = (r, p) => near(r.meta.config.sp?.['PR-610'], psi(p.ox), psi(3)) && near(r.meta.config.sp?.['PR-620'], psi(p.fu), psi(3));
const runOf = (v, n) => { const p = POINTS[n - 1]; const rs = hotWhere(v, r => at(r, p), { aborted: true }); return rs[rs.length - 1] || null; };
const S_ = (v, n) => runOf(v, n)?.metrics?.summary;
const allFired = v => POINTS.every(p => !!runOf(v, p.n));

export const request = () => ({
  oxP: psi(420), fuP: psi(480), duration: 6.0,
  title: 'BPE-2 cooling-margin survey',
  text: 'Map BPE-2\'s cooling margin across its operating range. Three 6 s burns, 200 ms fuel lead: (1) design, 420/480 psig; (2) oxidiser-rich, 460/440 psig; (3) throttled, 300/340 psig. Cool the liner below 150 °C between burns. Deliverables per burn: heat into the coolant, coolant temperature rise, boiling margin at the jacket outlet; and which point has the least margin.',
  success: 'Three lit, full-duration burns; the margins reported; the limiting point identified.',
});

export function procedure(def) {
  const steps = [];
  for (const p of POINTS) {
    steps.push({ kind: 'action', station: 'PROP', title: `${p.label}: tanks → ox ${p.ox}, fuel ${p.fu} psig, locked up`,
      text: 'The tank regulators do not relieve. To go DOWN in pressure: setpoint to 0, crack the tank vent until the tank is below the new value, close it, then set.',
      why: 'Two tank pressures set two flows: their ratio is the mixture ratio, their level is the thrust.',
      check: v => near(v.sp['PR-610'], psi(p.ox), psi(1)) && near(v.sp['PR-620'], psi(p.fu), psi(1)) && near(v.ch('PT-710'), psi(p.ox), psi(8)) && near(v.ch('PT-720'), psi(p.fu), psi(8)) || !!runOf(v, p.n) });
    steps.push(...hotFirePoint(def, { label: p.label, want: WANT, match: r => at(r, p) }));
  }
  const rec = n => ({ kind: 'record', station: 'TC', title: `Record the boiling margin of ${POINTS[n - 1].label}, K`,
    record: { unit: 'K', validate: (x, v) => {
      const s = S_(v, n); if (!s?.ignited) return { ok: false, msg: 'That burn is not recorded (or did not light).' };
      return near(x, s.boilMargin, 3) ? { ok: true, msg: `${s.boilMargin.toFixed(0)} K; ${(s.Qjkt / 1e3).toFixed(1)} kW into ${(s.mdotFu * 1e3).toFixed(0)} g/s of fuel, ΔT ${s.dTc.toFixed(0)} K.` } : { ok: false, msg: `The reduction gives ${s.boilMargin.toFixed(0)} K.` };
    } } });
  return finalize({
    id: 'rg-margins',
    title: 'TP-RG-015 · Cooling-margin survey',
    sections: [
      bpPretest(def, 'A'),
      bpInstrumentation(def, 'B'),
      bpLoadPropellants(def, 'C'),
      bpHotDaq(def, 'D'),
      bpSparkCheck(def, 'E'),
      bpPressurantLeak(def, 'F'),
      bpClearCell(def, 'G'),
      bpPurge(def, 'H'),
      pollSection('I', { text: 'One poll for the survey; between burns only the tank pressures and the plan change.' }),
      { id: 'J', title: 'The burns', steps },
      bpAfterFire(def, 'K', allFired),
      bpSafe(def, 'L', allFired),
      { id: 'M', title: 'Data', steps: [
        { kind: 'action', station: 'TC', title: 'Compare the three in ANALYSIS ▸ CAMPAIGN',
          text: 'Try the regen presets: heat against Pc, coolant rise against flow, boiling margin against Pc.',
          check: v => v.flags.has('campaign') },
        rec(1), rec(2), rec(3),
        { kind: 'verify', station: 'TC', title: 'The design point has the most margin',
          why: 'Less fuel means less coolant. Ox-rich, the heat stays nearly the same and the coolant falls; throttled, the coolant falls faster than the heat, and the jacket pressure — and the fuel\'s boiling point with it — falls too.',
          check: v => { const a = S_(v, 1), b = S_(v, 2), c = S_(v, 3); return !!(a && b && c) && a.boilMargin > b.boilMargin && a.boilMargin > c.boilMargin; },
          failMsg: 'Not what the data say — look again at each burn\'s margin.' },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'rg-margins', title: 'Cooling margins', objective: 'BPE-2: design, ox-rich and throttled — where is the coolant closest to boiling?',
  request, procedure, seriesPoll: true,
  setup(session) { session.daq.setRate(250); },
};
