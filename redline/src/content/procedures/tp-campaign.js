/* LEVEL 23 — Independent turbopump acceptance campaign.

   No procedure: a request and the stand. TPA-1 S/N 002 has to be accepted
   for engine use: performance at the design point, a map, a suction test,
   and an honest call on whether the data represent the turbopump. A hidden
   fault may be present.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { finalize } from './common.js';
import { TP_PTS } from './tp-common.js';
import { TP_CAMPAIGN_SPEC, tpCampaignFindings } from '../../analysis/report-tp.js';

export const request = () => ({
  tankP: psi(50), speed: 36000,
  title: 'TPA-1 S/N 002 acceptance',
  text: 'Acceptance of TPA-1 S/N 002 for engine use. Deliverables: (1) a spin of at least 8 s at the DESIGN POINT — 36 000 rpm in speed control, throttles 66 %, tanks 50 psig — giving the head of each pump, the ox flow, the turbine efficiency and the coast-down time; (2) a head–flow MAP at design speed, at least four throttle points; (3) a SUCTION TEST of the ox pump at the design point, giving its NPSH required (3 % head drop). The order, the number of runs and the margins you keep are yours. Report whether the data represent the turbopump.',
  success: 'All three deliverables; a campaign report with an honest call on the data; a diagnosis submitted; the stand left safe.',
});

export function procedure(def) {
  const R = def.ratings, F = v => tpCampaignFindings(v.session);
  return finalize({
    id: 'tp-campaign',
    title: 'Milestone sheet · TPA-1 S/N 002 acceptance',
    sections: [
      { id: 'A', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'Read the test request', text: v => v.request.text,
          teach: 'Budget the water and the gas: a design-point spin takes about 0.5 kg/s from each tank and 0.12 kg/s of nitrogen; the suction ramp alone is 40 s. Put the suction test last — it is the run that goes past an edge on purpose.' },
        { kind: 'action', station: 'TC', title: 'Write the test plan in the notebook',
          text: 'NOTEBOOK ▸ Pre-test notes: the runs in order, the water and gas budget, the checks before the first spin, what would make you stop.',
          check: v => v.has(e => e.cat === 'OPR' && e.text.startsWith('Pre-test note')) },
      ] },
      { id: 'B', title: 'Deliverables', steps: [
        { kind: 'action', station: 'TC', title: 'Design-point spin: 36 000 rpm, 66 %, ≥ 8 s', check: v => !!F(v).spin },
        { kind: 'action', station: 'TC', title: 'Pump map at design speed, ≥ 4 points', check: v => !!F(v).map },
        { kind: 'action', station: 'TC', title: 'Ox pump suction test, NPSH required found', check: v => !!F(v).suction },
      ] },
      { id: 'C', title: 'Close-out', steps: [
        { kind: 'action', station: 'TC', title: 'Submit a diagnosis (or "no fault")', check: v => !!v.diagnosis },
        { kind: 'action', station: 'PROP', title: 'Stand safe: disarmed, vented, rotor stopped, bank closed',
          check: v => !v.armed && v.cmd('HV-300') === 0 && TP_PTS.every(id => v.ch(id) < R.VENTED) && v.ch('SPD') < 300 },
        { kind: 'action', station: 'TC', title: 'File the campaign report', text: 'NOTEBOOK ▸ Session report ▸ results, data validity, file.',
          check: v => v.flags.has('campaign-report') },
      ] },
    ],
  });
}

export default {
  id: 'tp-campaign', title: 'Turbopump acceptance campaign', objective: 'TPA-1 S/N 002: design point, map and suction test, graded',
  request, procedure,
  campaign: true, campaignSpec: TP_CAMPAIGN_SPEC, seriesPoll: true,
  faults: true, faultChanceNone: 0.35,
};
