/* LEVEL 25 — Pump-fed cold flow.

   Before anything burns: water in both tanks, the turbine on start gas
   alone for the whole run, the main valves open, nothing lit. The engine's
   feed system — pumps, main valves, injector — at the pressures and flows
   it will see on a hot fire, with none of the hazard. What it measures is
   the main injector under pump feed: its flow coefficient on each side,
   which sets the mixture ratio the engine will actually run at.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { pollSection, reportStep, finalize } from './common.js';
import { ggPretest, ggInstrumentation, ggLoad, ggRotor, ggDaq, ggSupply, ggLeak, ggClearCell, ggPurge, ggPressurise,
         ggPlanSteps, ggFireSteps, ggSafe, coldRuns, ggPlanMatch, recordFrom } from './gg-common.js';

export const COLD = { mode: 'cold', duration: 8, startP: psi(200), mainOpen: 0.3 };
const match = ggPlanMatch(COLD);
const first = v => coldRuns(v, match)[0] || null;
const pt = r => r.metrics.points[0];

export const request = () => ({
  tankP: psi(50),
  title: 'BPE-3 pump-fed cold flow',
  text: 'Pump-fed cold flow of BPE-3 S/N 001 on TPA-1, water in both tanks at 50 psig. One 8.0 s run: start gas 200 psig for the whole run, main valves at T+0.30 s, nothing lit, a 3 s coast with the main valves open, then a post-purge. Deliverables: speed on start gas, both water flows, and the main injector\'s flow coefficient (CdA) on each side under pump feed, against the drawing.',
  success: 'A full 8 s run; the speed and both CdAs reported; a report filed.',
});

export function procedure(def) {
  const D = def.design;
  return finalize({
    id: 'gg-coldflow',
    title: 'TP-GG-025 · BPE-3 pump-fed cold flow',
    sections: [
      ggPretest(def, 'A', { reviewText: v => {
        const p = v.prediction;
        return `${v.request.text} Pre-test prediction (drawing injector, start gas only): ${p?.kind === 'ggcold' ? `${Math.round(p.rpm).toLocaleString('en-US')} rpm, ox ${p.mdotOx.toFixed(2)} kg/s, fuel ${p.mdotFu.toFixed(2)} kg/s` : 'available once the tanks are filled and set'}. Drawing CdA: ox ${(D.CdAox * 1e6).toFixed(2)} mm², fuel ${(D.CdAfu * 1e6).toFixed(2)} mm².`;
      } }),
      ggInstrumentation(def, 'B'),
      ggLoad(def, 'C', { prop: false }),
      ggRotor(def, 'D'),
      ggDaq(def, 'E', { prop: false }),
      ggSupply(def, 'F'),
      ggLeak(def, 'G'),
      ggClearCell(def, 'H', { hot: false }),
      ggPurge(def, 'I'),
      ggPressurise(def, 'J', psi(50), { hot: false }),
      { id: 'K', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'What a pump-fed cold flow is',
          text: 'The start gas drives the turbine for the whole run — no gas generator, no igniters. The main valves open early, at T+0.30 s, so the pumps take their load before they are fast. The injector sees water at the pressure the pumps make, as it will see propellant on a hot fire: a few hundred psi across it.',
          why: 'A pressure-fed cold flow tests the injector at the tank pressure. A pump-fed one tests it in the system it will fire in — and spins the pumps against the real load for the first time.',
          teach: 'Water is denser than FU-1 and lighter than OX-1: the pumps make more pressure on it than on the fuel, less than on the oxidiser, and the flows differ from a hot fire\'s. The CdA does not: it is geometry, and that is why it is the deliverable.' },
        ...ggPlanSteps(def, { label: 'Cold flow', want: COLD, match }),
      ] },
      pollSection('L', { text: 'Console ▸ FIRE CONTROL ▸ POLL. Water in both tanks and the meters on water; a cold-flow plan; no igniters to check.' }),
      { id: 'M', title: 'Flow', steps: ggFireSteps(def, { label: 'Cold flow', want: COLD, match }) },
      { id: 'N', title: 'Data', steps: [
        { kind: 'verify', station: 'TC', title: 'A full run, reduced',
          check: v => { const r = first(v); return !!r && !!pt(r); }, failMsg: 'No complete cold flow to reduce.' },
        { kind: 'action', station: 'TC', title: 'Open the run in ANALYSIS',
          text: 'SPD coming up on start gas, the pump pressures, the main valves opening and the flows settling; after TSV-332 shuts, the coast-down.',
          check: v => [...v.flags].some(f => f.startsWith('analysis:')) },
        recordFrom('Record the speed on start gas, rpm', { find: first, get: r => pt(r).N, unit: 'rpm', tol: 150,
          msg: (x, r) => `${Math.round(x)} rpm against a predicted ${Math.round(r.meta.config.prediction?.rpm ?? NaN)}.` }),
        recordFrom('Record the main ox injector CdA (water), mm²', { find: first, get: r => pt(r).cdaOx * 1e6, unit: 'mm²', tol: 0.05,
          msg: x => `${x.toFixed(2)} mm² against ${(D.CdAox * 1e6).toFixed(2)} on the drawing: ${Math.abs(x / (D.CdAox * 1e6) - 1) < 0.015 ? 'on the drawing' : `${(100 * (x / (D.CdAox * 1e6) - 1)).toFixed(1)} % off it`}.` }),
        recordFrom('Record the main fuel injector CdA (water), mm²', { find: first, get: r => pt(r).cdaFu * 1e6, unit: 'mm²', tol: 0.05,
          msg: x => `${x.toFixed(2)} mm² against ${(D.CdAfu * 1e6).toFixed(2)} on the drawing: ${Math.abs(x / (D.CdAfu * 1e6) - 1) < 0.015 ? 'on the drawing' : `${(100 * (x / (D.CdAfu * 1e6) - 1)).toFixed(1)} % off it`}.` }),
        { kind: 'info', station: 'TC', title: 'What the two CdAs say about the hot fire',
          text: 'The mixture ratio a hot fire runs at is close to the ratio of the oxidiser and fuel flows, and those go as each side\'s CdA. If the ox side is a few per cent small and the fuel side a few per cent large, the engine will run a few per cent LEANER in oxidiser than the drawing\'s 1.6 — and the prediction, made from the drawing, will not say so. Carry these numbers into the first hot fire.',
          why: 'This is what a cold flow is for: to find the hardware\'s own numbers before propellant makes them expensive.' },
        recordFrom('Record the coast-down to half speed, s', { find: first, get: r => r.metrics.summary.coast50, unit: 's', tol: 0.05,
          why: 'With the main valves open the pumps keep pumping as they slow: a much faster coast-down than TS-3\'s against its throttles. Trend it.' }),
      ] },
      ggSafe(def, 'O'),
      { id: 'P', title: 'Report', steps: [reportStep()] },
    ],
  });
}

export default {
  id: 'gg-coldflow', title: 'Pump-fed cold flow', objective: 'BPE-3 on water: the turbine on start gas, the injector under pump feed',
  request, procedure,
};
