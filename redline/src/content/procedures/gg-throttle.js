/* LEVEL 27 — Throttling and duration.

   Two burns. The first steps the gas generator throttles down — 100, 85 and
   70 % — and watches the whole engine follow: less turbine power, a slower
   shaft, less pump pressure, less chamber pressure and thrust, while the
   turbine inlet temperature stays where it was, because both GG legs move
   together. The second is 30 s at full throttle: long enough to see the
   ablative chamber at work — the throat eroding, the chamber pressure
   drifting down, the case warming late and soaking back after.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { pollSection, reportStep, inspectStep, finalize } from './common.js';
import { ggPretest, ggInstrumentation, ggLoad, ggRotor, ggDaq, ggSpark, ggSupply, ggLeak, ggClearCell, ggPurge, ggPressurise,
         ggPlanSteps, ggFireSteps, ggSafe, ggRuns, ggPlanMatch, recordFrom, P } from './gg-common.js';

export const THROTTLE = { mode: 'hot', thrSteps: [1.0, 0.85, 0.7], settle: 4, dwell: 4 };
export const LONG = { mode: 'hot', duration: 30, thr: 1 };
const mT = ggPlanMatch(THROTTLE), mL = ggPlanMatch(LONG);
const thr = v => ggRuns(v, mT).find(r => r.metrics.points.length === 3) || null;
const long = v => ggRuns(v, mL)[0] || null;
const both = v => !!ggRuns(v, mT, { aborted: true }).length && !!ggRuns(v, mL, { aborted: true }).length;

export const request = () => ({
  tankP: psi(50),
  title: 'BPE-3 throttling and duration',
  text: 'Two burns of BPE-3 S/N 001, tanks 50 psig, the standard start. (1) A gas generator throttle profile: both GG throttles together, 100 % for 4 s, then 85 % and 70 % for 4 s each — 12 s. (2) A 30 s burn at 100 %, after the chamber case is back below 60 °C. Deliverables: speed, Pc and thrust at each throttle point; the turbine inlet temperature across the profile; the injector stiffness at the lowest point; and from the long burn, the chamber pressure drift (the throat eroding) and the case temperature at shutdown.',
  success: 'Both burns complete; the deliverables reported; a report filed.',
});

export function procedure(def) {
  return finalize({
    id: 'gg-throttle',
    title: 'TP-GG-027 · BPE-3 throttling and duration',
    sections: [
      ggPretest(def, 'A', { reviewText: v => {
        const p = v.prediction;
        const st = p?.steps?.length ? ` Throttle profile predicted: ${p.steps.map((q, k) => `${Math.round(100 * THROTTLE.thrSteps[k])} % → ${Math.round(q.rpm).toLocaleString('en-US')} rpm, ${P(q.Pc - 101325)}, ${q.F.toFixed(0)} N`).join('; ')}.` : '';
        return `${v.request.text}${st}`;
      } }),
      ggInstrumentation(def, 'B'),
      ggLoad(def, 'C'),
      ggRotor(def, 'D'),
      ggDaq(def, 'E'),
      ggSpark(def, 'F'),
      ggSupply(def, 'G'),
      ggLeak(def, 'H'),
      ggClearCell(def, 'I'),
      ggPurge(def, 'J'),
      ggPressurise(def, 'K', psi(50)),
      { id: 'L', title: 'Burn 1 — throttle profile', steps: [
        { kind: 'info', station: 'TC', title: 'How a gas-generator engine throttles',
          text: 'Nothing on the main side moves. GCV-417 and GCV-427 cut the gas generator\'s flow; the turbine gets less power; the shaft slows until the pumps\' smaller appetite matches it; the pumps make less pressure; less flows through the main injector; Pc and thrust fall. The whole engine walks down its own operating line.',
          why: 'Move both GG throttles together and the gas generator\'s mixture ratio — so its temperature — stays put. Move one and you have changed the turbine inlet temperature instead of the thrust.',
          teach: 'The limit is the injector: as the flow falls, so does its pressure drop, faster than the chamber pressure. Below some throttle the injector is no longer STIFF enough to isolate the feed system from the chamber, and the engine chugs.' },
        ...ggPlanSteps(def, { label: 'Burn 1', want: THROTTLE, match: mT }),
      ] },
      pollSection('M', { text: 'Console ▸ FIRE CONTROL ▸ POLL. The poll covers both burns: the second must wait for the case.' }),
      { id: 'N', title: 'Burn 1 — fire', steps: ggFireSteps(def, { label: 'Burn 1', want: THROTTLE, match: mT }) },
      { id: 'O', title: 'Burn 2 — 30 s at full throttle', steps: [
        { kind: 'info', station: 'TC', title: 'An ablative chamber over a long burn',
          text: 'The liner chars from the inside, a fraction of a millimetre a second; the char insulates what is behind it, and the hot face slowly recedes. At the throat it also erodes: the throat grows, so the same propellant flow holds a slightly lower chamber pressure. Watch PT-501 drift down through the burn, and TC-503 on the case barely move until late — and keep rising after shutdown.',
          why: 'The drift is the throat\'s growth; the case temperature is what is left of the liner. Those two are what limit an ablative chamber\'s life.' },
        ...ggPlanSteps(def, { label: 'Burn 2', want: LONG, match: mL }),
        ...ggFireSteps(def, { label: 'Burn 2', want: LONG, match: mL }),
      ] },
      ggSafe(def, 'P', both),
      { id: 'Q', title: 'Data', steps: [
        inspectStep(),
        { kind: 'verify', station: 'TC', title: 'Both burns complete',
          check: v => !!thr(v) && !!long(v), failMsg: 'Not both burns complete: three throttle points and 30 s.' },
        { kind: 'action', station: 'TC', title: 'Open both runs in ANALYSIS',
          check: v => ggRuns(v).filter(r => v.flags.has('analysis:' + r.id)).length >= 2 },
        recordFrom('Burn 1: record the thrust at the 70 % point, N', { find: thr, get: r => r.metrics.points[2].F, unit: 'N', tol: 15,
          msg: (x, r) => `${x.toFixed(0)} N — ${(100 * x / r.metrics.points[0].F).toFixed(0)} % of full thrust on 70 % of the gas generator. The speed fell ${(100 * (1 - r.metrics.points[2].N / r.metrics.points[0].N)).toFixed(0)} %.` }),
        recordFrom('Burn 1: record the change in turbine inlet temperature from 100 % to 70 %, K', { find: thr, get: r => r.metrics.points[2].TIT - r.metrics.points[0].TIT, unit: 'K', tol: 4,
          msg: x => `${x.toFixed(0)} K: ${Math.abs(x) < 30 ? 'both legs moved together, so the gas generator\'s mixture ratio held' : 'more than it should — did both throttles move?'}.` }),
        recordFrom('Burn 1: record the smaller injector stiffness (ΔP/Pc) at 70 %', { find: thr, get: r => Math.min(r.metrics.points[2].stiffOx, r.metrics.points[2].stiffFu), unit: '', tol: 0.01,
          msg: (x, r) => `${x.toFixed(2)}, from ${Math.min(r.metrics.points[0].stiffOx, r.metrics.points[0].stiffFu).toFixed(2)} at full throttle. ${x < 0.15 ? 'Below about 0.15 the injector no longer isolates the chamber from the feed — that is where the throttle limit comes from.' : 'Still stiff.'}` }),
        recordFrom('Burn 2: record the chamber pressure drift, % per 10 s', { find: long, get: r => 100 * r.metrics.summary.PcDrift, unit: '%', tol: 0.08,
          msg: x => `${x.toFixed(2)} % per 10 s: the throat eroding. Over the 60 s design life that is about ${(6 * x).toFixed(1)} %.` }),
        recordFrom('Burn 2: record the case temperature at shutdown (TC-503), °C', { find: long, get: r => r.metrics.summary.caseShut - 273.15, unit: '°C', tol: 2,
          msg: (x, r) => `${x.toFixed(0)} °C at shutdown, from ${(r.metrics.summary.caseStart - 273.15).toFixed(0)} °C at the start: the liner held most of 30 s of 3000 K gas off the steel.` }),
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'gg-throttle', title: 'Throttling and duration', objective: 'BPE-3: a GG throttle profile, then 30 s on the ablative chamber',
  request, procedure, seriesPoll: true,
};
