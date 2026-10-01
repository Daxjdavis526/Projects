/* LEVEL 17 — Independent long-duration acceptance campaign (BPE-2).

   No procedure: a request with targets and the stand. A long burn at the
   design point — mixture ratio AND chamber pressure, which on this engine
   means finding two tank pressures with the jacket's pressure drop in the
   fuel's budget — and a throttled point, where the cooling margin is
   thinnest. The report adds two cooling deliverables to the performance
   ones. A hidden fault may be present.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { finalize } from './common.js';
import { SYS_PTS } from './bp-common.js';
import { makeBpCampaign } from '../../analysis/report-bp.js';

export const RG_CAMPAIGN = makeBpCampaign({
  design: { MR: 1.50, MRtol: 0.05, Pc: psi(275), Pctol: psi(15), minDur: 20.0 },
  throttle: { MR: 1.50, MRtol: 0.08, Pc: psi(210), Pctol: psi(15), minDur: 6.0 },
  also: new Set(['tc728-bias', 'pt801-bias']),
  extra: [
    ['Q', 'Qjkt', 'design', 'Design point: heat into the coolant', 'power', 0.05, 3, 'kW', 'kW'],
    ['marginT', 'boilMargin', 'throttle', 'Throttled point: boiling margin', 'ratio', 0.1, 3, 'plain', 'K'],
  ],
});

export const request = () => ({
  oxP: psi(420), fuP: psi(480), duration: 20.0,
  title: 'BPE-2 long-duration acceptance',
  text: 'Acceptance of BPE-2 S/N 001 for long-duration service. Deliverables: (1) a burn of at least 20 s at the DESIGN POINT — mixture ratio 1.50 ± 0.05 and chamber pressure 275 ± 15 psig — giving Pc, thrust, MR, c* efficiency, Isp and the heat into the coolant; (2) a burn of at least 6 s at a THROTTLED POINT — Pc 210 ± 15 psig, MR 1.50 ± 0.08 — giving its c* efficiency and boiling margin. The tank pressures are yours to choose; the fuel tank must also pay for the jacket. Stand rating 30 s per burn. Report whether the data represent the engine.',
  success: 'Both points hit and reduced; a campaign report filed with an honest call on the data; a diagnosis submitted; the stand left safe.',
});

export function procedure(def) {
  const R = def.ratings, F = v => RG_CAMPAIGN.findings(v.session);
  return finalize({
    id: 'rg-campaign',
    title: 'Milestone sheet · BPE-2 long-duration acceptance',
    sections: [
      { id: 'A', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'Read the test request', text: v => v.request.text,
          teach: 'Budget the propellant: a 20 s burn takes about 1.8 kg of fuel and 2.7 kg of oxidiser, and the go/no-go wants a reserve on top. Budget the coolant too: the throttled point has the least boiling margin.' },
        { kind: 'action', station: 'TC', title: 'Write the test plan in the notebook',
          check: v => v.has(e => e.cat === 'OPR' && e.text.startsWith('Pre-test note')) },
      ] },
      { id: 'B', title: 'Deliverables', steps: [
        { kind: 'action', station: 'TC', title: 'Design point: MR 1.50 ± 0.05, Pc 275 ± 15 psig, ≥ 20 s', check: v => !!F(v).design },
        { kind: 'action', station: 'TC', title: 'Throttled point: Pc 210 ± 15 psig, MR 1.50 ± 0.08, ≥ 6 s', check: v => !!F(v).throttle },
      ] },
      { id: 'C', title: 'Close-out', steps: [
        { kind: 'action', station: 'TC', title: 'Submit a diagnosis (or "no fault")', check: v => !!v.diagnosis },
        { kind: 'action', station: 'PROP', title: 'Stand safe: disarmed, vented, bottle closed',
          check: v => !v.armed && v.cmd('HV-600') === 0 && SYS_PTS.every(id => v.ch(id) < R.VENTED) },
        { kind: 'action', station: 'TC', title: 'File the campaign report', text: 'NOTEBOOK ▸ Session report ▸ results, data validity, file.',
          check: v => v.flags.has('campaign-report') },
      ] },
    ],
  });
}

export default {
  id: 'rg-campaign', title: 'Long-duration acceptance campaign', objective: 'BPE-2: 20 s at the design point and a throttled point, with cooling deliverables',
  request, procedure,
  campaign: true, campaignSpec: RG_CAMPAIGN.spec, seriesPoll: true,
  faults: true, faultChanceNone: 0.35,
  setup(session) { session.daq.setRate(250); },
};
