/* LEVEL 6 — Independent cold-gas test conductor.

   No procedure: a test request with deliverables, and the stand. The
   checklist below is the test director's milestone sheet, not a set of
   instructions — its items complete themselves when the RECORD shows them
   done, and it says nothing about how.

   A hidden fault may be present (a little over one campaign in three has
   none). The campaign ends with a report whose numbers are checked against
   the conductor's own reductions, and whose call on the data — valid or
   not — is checked against what was really wrong.

   Generalised for training on a fictional stand. */

import { psi } from '../../lib/units.js';
import { finalize } from './common.js';
import { campaignFindings, CAMPAIGN } from '../../analysis/report.js';

export const request = () => ({
  regSet: psi(150),
  range: [psi(60), psi(200)],
  duration: 3.0,
  supplyAssumed: psi(2200),
  title: 'CGT-1 acceptance campaign',
  text: 'Acceptance of CGT-1 S/N 002 with nozzle N-02 for delivery. Deliverables: (1) a baseline steady-state firing at 150 psig, at least 2 s, giving thrust, chamber pressure and specific impulse; (2) thrust against absolute chamber pressure at no fewer than three setpoints spanning at least 80 psi between 60 and 200 psig, giving the thrust coefficient; (3) a pulse train of at least ten 10 ms pulses, giving the mean impulse bit and its scatter. Plan the campaign, run it, and report whether the data can be used.',
  success: 'All three deliverables recorded and reduced; a campaign report filed with the results and an honest call on whether the data represent the article; a diagnosis submitted (including "no fault"); the stand left safe.',
});

export function procedure(def) {
  const R = def.ratings;
  const F = v => campaignFindings(v.session, def);
  return finalize({
    id: 'cg-campaign',
    title: 'Milestone sheet · CGT-1 acceptance campaign',
    sections: [
      { id: 'A', title: 'Plan', steps: [
        { kind: 'info', station: 'TC', title: 'Read the test request',
          text: v => v.request.text,
          why: 'Everything that follows is judged against it.' },
        { kind: 'action', station: 'TC', title: 'Write the test plan in the notebook',
          text: 'NOTEBOOK ▸ Pre-test notes: the sequence of firings, the setpoints, the DAQ rates, what each run should show, and what would make you stop.',
          why: 'A campaign without a written plan is a sequence of improvisations.',
          check: v => v.has(e => e.cat === 'OPR' && e.text.startsWith('Pre-test note')) },
      ] },
      { id: 'B', title: 'Deliverables', steps: [
        { kind: 'action', station: 'TC', title: 'Baseline firing at 150 psig (≥ 2 s)',
          text: 'Completes when a recorded, un-aborted single burn at 150 ± 5 psig of at least 2 s exists.',
          check: v => !!F(v).baseline },
        { kind: 'action', station: 'TC', title: `Pressure sweep: ≥ ${CAMPAIGN.sweep.points} setpoints spanning ≥ 80 psi`,
          text: 'Completes when single burns (≥ 1 s) at enough distinct setpoints between 60 and 200 psig are recorded.',
          check: v => F(v).sweep.ok },
        { kind: 'action', station: 'TC', title: 'Pulse train: ≥ 10 × 10 ms',
          text: 'Completes when a recorded pulse train with 10 ms on-time and at least ten pulses exists.',
          check: v => !!F(v).pulse },
      ] },
      { id: 'C', title: 'Close-out', steps: [
        { kind: 'action', station: 'TC', title: 'Submit a diagnosis (or "no fault")',
          text: 'Console ▸ INSPECT ▸ Submit diagnosis.',
          check: v => !!v.diagnosis },
        { kind: 'action', station: 'PROP', title: 'Stand safe: disarmed, vented, bottle closed',
          text: 'Leave the stand the way the next crew expects to find it.',
          check: v => !v.armed && v.cmd('HV-100') === 0 && ['PT-101', 'PT-102', 'PT-201', 'PT-301', 'PT-401'].every(id => v.ch(id) < R.VENTED) },
        { kind: 'action', station: 'TC', title: 'File the campaign report',
          text: 'NOTEBOOK ▸ Session report ▸ campaign results, data validity, file.',
          check: v => v.flags.has('campaign-report') },
      ] },
    ],
  });
}

export default {
  id: 'cg-campaign',
  title: 'Independent cold-gas test conductor',
  objective: 'CGT-1 acceptance campaign: baseline, pressure sweep, 10 ms pulses',
  request,
  procedure,
  campaign: true,
  seriesPoll: true,
  faults: true,
  faultChanceNone: 0.35,
  setup(session) {
    session.daq.setRate(250);
  },
};
