/* LEVEL 29 — Independent engine acceptance campaign.

   No procedure: a request and the stand. BPE-3 S/N 002 has to be accepted:
   a pump-fed cold flow first (water), then — drained and loaded with
   propellants — a design-point hot fire of at least 20 s and a gas
   generator throttle profile. The order, the number of runs, the margins
   and the budget are the conductor's. A hidden fault may be present.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { finalize } from './common.js';
import { GG_PTS } from './gg-common.js';
import { GG_CAMPAIGN_SPEC, ggCampaignFindings } from '../../analysis/report-gg.js';

export const request = () => ({
  tankP: psi(50),
  title: 'BPE-3 S/N 002 acceptance',
  text: 'Acceptance of BPE-3 S/N 002 with TPA-1 for flight-type use. Deliverables: (1) a PUMP-FED COLD FLOW on water of at least 6 s, giving the main injector\'s CdA on each side under pump feed; (2) a DESIGN-POINT HOT FIRE of at least 20 s at full gas generator throttle, tanks 50 psig, giving Pc, thrust, mixture ratio, turbine inlet temperature, c* efficiency and engine Isp; (3) a GAS GENERATOR THROTTLE PROFILE of at least three points, the lowest at 70 % or below, giving the thrust at the lowest point. The order, the number of runs and the margins you keep are yours. Report whether the data represent the engine.',
  success: 'All three deliverables; a campaign report with an honest call on the data; a diagnosis submitted; the stand left safe.',
});

export function procedure(def) {
  const R = def.ratings, F = v => ggCampaignFindings(v.session);
  return finalize({
    id: 'gg-campaign',
    title: 'Milestone sheet · BPE-3 S/N 002 acceptance',
    sections: [
      { id: 'A', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'Read the test request', text: v => v.request.text,
          teach: 'Cold flow first: it needs water in the tanks and the meters on water, and it tells you what the injector will do before the hot fires. Then drain, load propellants, put the meters on OX-1 and FU-1, spark-check. Budget the propellant: about 0.47 kg/s of OX-1 and 0.33 kg/s of FU-1 at mainstage, the gas generator\'s share included, plus the start and the reserve. Let the case cool below 60 °C between long burns.' },
        { kind: 'action', station: 'TC', title: 'Write the test plan in the notebook',
          text: 'NOTEBOOK ▸ Pre-test notes: the runs in order, the propellant and gas budget, the checks before the first fire, what would make you stop.',
          check: v => v.has(e => e.cat === 'OPR' && e.text.startsWith('Pre-test note')) },
      ] },
      { id: 'B', title: 'Deliverables', steps: [
        { kind: 'action', station: 'TC', title: 'Pump-fed cold flow, ≥ 6 s, injector CdA both sides', check: v => !!F(v).cold },
        { kind: 'action', station: 'TC', title: 'Design-point hot fire, ≥ 20 s at full GG throttle', check: v => !!F(v).design },
        { kind: 'action', station: 'TC', title: 'GG throttle profile, ≥ 3 points, lowest ≤ 70 %', check: v => !!F(v).throttle },
      ] },
      { id: 'C', title: 'Close-out', steps: [
        { kind: 'action', station: 'TC', title: 'Submit a diagnosis (or "no fault")', check: v => !!v.diagnosis },
        { kind: 'action', station: 'PROP', title: 'Stand safe: disarmed, vented, rotor stopped, bank closed',
          check: v => !v.armed && v.cmd('HV-300') === 0 && GG_PTS.every(id => v.ch(id) < R.VENTED) && v.ch('SPD') < 300 },
        { kind: 'action', station: 'TC', title: 'File the campaign report', text: 'NOTEBOOK ▸ Session report ▸ results, data validity, file.',
          check: v => v.flags.has('campaign-report') },
      ] },
    ],
  });
}

export default {
  id: 'gg-campaign', title: 'Engine acceptance campaign', objective: 'BPE-3 S/N 002: cold flow, design point and throttle profile, graded',
  request, procedure,
  campaign: true, campaignSpec: GG_CAMPAIGN_SPEC, seriesPoll: true,
  faults: true, faultChanceNone: 0.35,
};
