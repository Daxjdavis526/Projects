/* The pressure-decay leak check, shared by the scripted procedures (as a
   hold step) and the console (for the open stand and the unscripted
   campaign, where nobody hands the operator a checklist). No DOM.

   Isolate, then watch the trapped low-pressure section for 60 s. The limit
   is on the slope, not the value: 1 psi/min is invisible on a gauge and
   obvious on a trend. */

import { psi } from '../lib/units.js';

export const LEAK_SECONDS = 60;
export const LEAK_LIMIT = -1.0;          // psi/min

export function leakPre(v) {
  return (v.cmd('IV-101') === 0 && v.regSet === 0 && v.cmd('VV-201') === 0 && v.cmd('VV-101') === 0 && v.ch('PT-301') > psi(40))
    ? { ok: true } : { ok: false, msg: 'Isolate first: IV-101 closed, PR-101 at 0, both vents closed, LP section pressurised (> 40 psig).' };
}

export function leakEval(v) {
  const lp = v.stats('PT-301', 50), hp = v.stats('PT-102', 50);
  const rate = lp ? lp.slope : NaN;
  const perMin = rate * 60 / psi(1);
  const ok = Number.isFinite(rate) && perMin > LEAK_LIMIT;
  return { value: rate, hpValue: hp ? hp.slope : NaN, ok,
    msg: `LP decay ${perMin.toFixed(2)} psi/min${hp ? `, HP ${(hp.slope * 60 / psi(1)).toFixed(1)} psi/min` : ''} — ${ok ? 'within limit' : 'EXCEEDS 1.0 psi/min limit'}` };
}
