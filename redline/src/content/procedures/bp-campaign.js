/* LEVEL 12 — Independent bipropellant test campaign.

   No procedure: a test request with targets, and the stand. The milestone
   sheet completes itself from the RECORD and says nothing about how. The
   targets are a mixture ratio and a chamber pressure, not tank pressures —
   the conductor has to work out the two tank pressures that give them on
   this injector (the drawing will not; the cold flow and the first hot fire
   will), check the throttled point is not too soft, and manage the copper
   chamber's heat between burns.

   A hidden fault may be present (about one campaign in three has none). The
   campaign report is graded against the conductor's own reductions and
   against what was really wrong.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { finalize } from './common.js';
import { SYS_PTS } from './bp-common.js';
import { bpCampaignFindings, BP_CAMPAIGN, BP_CAMPAIGN_SPEC } from '../../analysis/report-bp.js';

export const request = () => ({
  oxP: psi(400), fuP: psi(400),
  duration: 2.0,
  title: 'BPE-1 performance campaign',
  text: 'Performance acceptance of BPE-1 S/N 001 on LOX / ethanol. Deliverables: (1) a burn of at least 2.0 s at the DESIGN POINT — mixture ratio 1.50 ± 0.05 and chamber pressure 275 ± 15 psig — giving chamber pressure, thrust, mixture ratio, c* efficiency and specific impulse; (2) a burn of at least 1.5 s at a THROTTLED POINT — chamber pressure 220 ± 15 psig, mixture ratio 1.50 ± 0.08 — giving its c* efficiency. The tank pressures are yours to choose. Heat-sink chamber: 5 s burn limit, throat below 150 °C before each burn. Report whether the data represent the engine.',
  success: 'Both points hit and reduced; a campaign report filed with the results and an honest call on the data; a diagnosis submitted (including "no fault"); the stand left safe.',
});

export function procedure(def) {
  const R = def.ratings;
  const F = v => bpCampaignFindings(v.session);
  const D = BP_CAMPAIGN.design, T = BP_CAMPAIGN.throttle;
  return finalize({
    id: 'bp-campaign',
    title: 'Milestone sheet · BPE-1 performance campaign',
    sections: [
      { id: 'A', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'Read the test request', text: v => v.request.text,
          why: 'Targets, not setpoints: the engine decides what tank pressures they need.',
          teach: 'At equal tank pressures this injector runs below MR 1.5 — the cold flow said so. Mixture ratio follows the ratio of the two flows, each ∝ CdA·√(ρ·ΔP_injector): trim it with the difference between the tank pressures, then move both together for chamber pressure.' },
        { kind: 'action', station: 'TC', title: 'Write the test plan in the notebook',
          text: 'NOTEBOOK ▸ Pre-test notes: the burns, the tank pressures you will start from and why, what each should show, and what would make you stop.',
          check: v => v.has(e => e.cat === 'OPR' && e.text.startsWith('Pre-test note')) },
      ] },
      { id: 'B', title: 'Deliverables', steps: [
        { kind: 'action', station: 'TC', title: `Design point: MR ${D.MR.toFixed(2)} ± ${D.MRtol}, Pc 275 ± 15 psig, ≥ ${D.minDur.toFixed(1)} s`,
          text: 'Completes when a recorded, un-aborted, lit hot fire meets all three.',
          check: v => !!F(v).design },
        { kind: 'action', station: 'TC', title: `Throttled point: Pc 220 ± 15 psig, MR ${T.MR.toFixed(2)} ± ${T.MRtol}, ≥ ${T.minDur.toFixed(1)} s`,
          text: 'Completes when a recorded, un-aborted, lit hot fire meets all three.',
          check: v => !!F(v).throttle },
      ] },
      { id: 'C', title: 'Close-out', steps: [
        { kind: 'action', station: 'TC', title: 'Submit a diagnosis (or "no fault")', text: 'Console ▸ INSPECT ▸ Submit diagnosis.',
          check: v => !!v.diagnosis },
        { kind: 'action', station: 'PROP', title: 'Stand safe: disarmed, vented, bottle closed',
          text: 'Leave the stand the way the next crew expects to find it.',
          check: v => !v.armed && v.cmd('HV-600') === 0 && SYS_PTS.every(id => v.ch(id) < R.VENTED) },
        { kind: 'action', station: 'TC', title: 'File the campaign report',
          text: 'NOTEBOOK ▸ Session report ▸ results, data validity, file.',
          check: v => v.flags.has('campaign-report') },
      ] },
    ],
  });
}

export default {
  id: 'bp-campaign',
  title: 'Independent test campaign',
  objective: 'BPE-1 performance: design point (MR 1.50, Pc 275 psig) and a throttled point',
  request,
  procedure,
  campaign: true,
  campaignSpec: BP_CAMPAIGN_SPEC,
  seriesPoll: true,
  faults: true,
  faultChanceNone: 0.35,
  setup(session) {
    session.daq.setRate(250);
  },
};
