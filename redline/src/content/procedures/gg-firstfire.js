/* LEVEL 26 — First hot fire of BPE-3.

   Eight seconds at full GG throttle on the standard start: start gas at
   T-0, the main chamber at T+0.45, the gas generator at T+0.75, the start
   gas off at T+1.1 — bootstrap — and mainstage. The new things to read are
   the start itself (two lights, the time to mainstage, the peaks on the
   way), the gas generator (its pressure, temperature and inferred mixture
   ratio), and what the cycle costs: the engine's Isp below the main
   chamber's by the gas generator's flow.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { near, pollSection, reportStep, inspectStep, finalize } from './common.js';
import { ggPretest, ggInstrumentation, ggLoad, ggRotor, ggDaq, ggSpark, ggSupply, ggLeak, ggClearCell, ggPurge, ggPressurise,
         ggPlanSteps, ggFireSteps, ggSafe, ggRuns, ggPlanMatch, recordFrom, P } from './gg-common.js';

export const FIRST = { mode: 'hot', duration: 8, thr: 1 };
const match = ggPlanMatch(FIRST);
const any = v => ggRuns(v, match, { aborted: true })[0] || null;
const lit = v => ggRuns(v, match)[0] || null;
const pt = r => r.metrics.points[0];

/* A temperature in K, or in °C: both are accepted, and the message says which. */
const recordTemp = (title, get, find, why) => ({ kind: 'record', station: 'TC', title, why,
  record: { unit: 'K', validate: (x, v) => {
    const r = find(v); if (!r) return { ok: false, msg: 'No qualifying run recorded.' };
    const K = get(r);
    if (near(x, K, 5)) return { ok: true, msg: `${K.toFixed(0)} K (${(K - 273.15).toFixed(0)} °C).` };
    if (near(x, K - 273.15, 5)) return { ok: true, msg: `${(K - 273.15).toFixed(0)} °C — that is ${K.toFixed(0)} K. Turbine inlet temperatures are quoted absolute.` };
    return { ok: false, msg: `The reduction gives ${K.toFixed(0)} K.` };
  } } });

export const request = () => ({
  tankP: psi(50),
  title: 'BPE-3 first hot fire',
  text: 'First hot fire of BPE-3 S/N 001 on TPA-1. One 8.0 s burn at full gas generator throttle, tanks 50 psig, the standard start: start gas 220 psig from T-0 to T+1.10 s, main valves T+0.45 s, gas generator T+0.75 s, igniters T−0.5 to T+2.0 s. Deliverables: the start (both lights and the time to mainstage), speed, Pc and thrust against prediction, the mixture ratio, the turbine inlet temperature, c* efficiency, and the specific impulse of the main chamber and of the engine.',
  success: 'A smooth start and a full 8 s; Pc within 6 % of prediction; the deliverables reported; a report filed.',
});

export function procedure(def) {
  return finalize({
    id: 'gg-firstfire',
    title: 'TP-GG-026 · BPE-3 first hot fire',
    sections: [
      ggPretest(def, 'A', { reviewText: v => {
        const p = v.prediction;
        return `${v.request.text} Pre-test prediction (the drawing): ${p?.kind === 'gg' ? `${Math.round(p.rpm).toLocaleString('en-US')} rpm, Pc ${P(p.Pc - 101325)}, ${p.F.toFixed(0)} N, MR ${p.MR.toFixed(2)}, gas generator ${P(p.Pgg - 101325)} at ${p.TIT.toFixed(0)} K and MR ${p.MRgg.toFixed(2)}, Isp ${p.IspChamber.toFixed(0)} s (chamber) / ${p.Isp.toFixed(0)} s (engine)` : 'available once propellants are loaded and the tanks set'}.`;
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
      { id: 'L', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'What to watch',
          text: 'SPD rising on start gas from T-0, the pump discharges (PT-414, PT-424) with it. At T+0.45 the main valves: PT-415/425 fill, PT-501 lifts off the floor, OD-504 sees the flame. At T+0.75 the gas generator: PT-333 jumps and TT-334 climbs to about 850 K. At T+1.1 TSV-332 shuts — and SPD keeps RISING. That is bootstrap. Mainstage a few tenths later.',
          why: 'Three automatic start checks will abort it if the main chamber, the gas generator or the speed is late. Know which channel each one watches.',
          teach: 'A gas-generator start is a race between the start gas running out and the gas generator taking over. If the start gas goes off before the gas generator has the power, the speed sags and the engine hangs.' },
        ...ggPlanSteps(def, { label: 'Hot fire', want: FIRST, match }),
      ] },
      pollSection('M', { text: 'Console ▸ FIRE CONTROL ▸ POLL. New on this stand: two igniters, three purges, the start gas plan and the turbine manifold cold and empty.' }),
      { id: 'N', title: 'Fire', steps: ggFireSteps(def, { label: 'Hot fire', want: FIRST, match }) },
      ggSafe(def, 'O'),
      { id: 'P', title: 'Data', steps: [
        inspectStep(),
        { kind: 'verify', station: 'TC', title: 'A smooth start and the full 8 s',
          check: v => { const r = any(v); return !!r && !r.aborted && r.metrics.summary.start === 'smooth' && !!pt(r); },
          failMsg: 'Not a smooth, full-duration run. Look at the abort and the start before anything else.' },
        { kind: 'action', station: 'TC', title: 'Open the run in ANALYSIS',
          text: 'The start: SPD with TSV-332 and GOV-416; PT-501 and PT-333 in the first two seconds; TT-334. Then mainstage.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        recordFrom('Record the time to mainstage (Pc at 90 %), s after T-0', { find: lit, get: r => r.metrics.summary.tMainstage, unit: 's', tol: 0.03,
          msg: (x, r) => `T+${x.toFixed(2)} s; the main chamber lit ${(1e3 * r.metrics.summary.tIgnMain).toFixed(0)} ms after its valves, the gas generator ${(1e3 * r.metrics.summary.tIgnGG).toFixed(0)} ms after its own.` }),
        { kind: 'verify', station: 'TC', title: 'Pc within 6 % of the prediction',
          check: v => { const r = lit(v), p = r?.meta.config.prediction; return !!r && p?.kind === 'gg' && Math.abs(pt(r).Pc / (p.Pc - 101325) - 1) < 0.06; },
          failMsg: 'More than 6 % from the prediction.' },
        recordFrom('Record the mainstage speed, rpm', { find: lit, get: r => pt(r).N, unit: 'rpm', tol: 150,
          msg: (x, r) => `${Math.round(x).toLocaleString('en-US')} rpm against a predicted ${Math.round(r.meta.config.prediction.rpm).toLocaleString('en-US')}: the engine finds its own balance, a little below the drawing's.` }),
        recordFrom('Record the main mixture ratio (FT-416 / FT-426)', { find: lit, get: r => pt(r).MR, unit: '', tol: 0.02,
          msg: x => `${x.toFixed(3)} — the drawing says 1.600. ${x < 1.58 ? 'Leaner in oxidiser, as the cold flow\'s CdAs said it would be.' : ''}` }),
        recordTemp('Record the turbine inlet temperature (TT-334), K', r => pt(r).TIT, lit,
          'The gas generator\'s mixture ratio sets it; it is the turbine\'s redline. Its margin to 1050 K is the margin the engine has to run hotter, harder or leaner.'),
        recordFrom('Record the c* efficiency', { find: lit, get: r => pt(r).etaCstar, unit: '', tol: 0.01 }),
        recordFrom('Record the specific impulse of the ENGINE (gas generator flow included), s', { find: lit, get: r => pt(r).IspE, unit: 's', tol: 1,
          msg: (x, r) => `${x.toFixed(1)} s, against ${pt(r).IspC.toFixed(1)} s for the main chamber alone: the gas generator costs ${(pt(r).IspC - x).toFixed(1)} s — ${(100 * pt(r).ggFrac).toFixed(1)} % of the propellant, burned for the turbine and thrown overboard.` }),
        { kind: 'info', station: 'TC', title: 'After the burn',
          text: 'Watch TC-503 for the next few minutes: the case keeps warming after shutdown as the heat in the charred liner soaks outward.',
          why: 'The ablative does not cool the way a regenerative chamber does: it insulates, and it spends itself doing so. Every burn costs liner.' },
        reportStep(),
      ] },
    ],
  });
}

export default {
  id: 'gg-firstfire', title: 'First hot fire', objective: 'BPE-3: 8 s at full GG throttle — the bootstrap start, the cost of the cycle',
  request, procedure,
};
