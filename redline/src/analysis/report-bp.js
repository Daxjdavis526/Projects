/* The Level 12 campaign on TS-2: what the conductor's own runs support, and
   the grading of the campaign report. No DOM.

   Two hot-fire points with targets, not setpoints: the design point (mixture
   ratio and chamber pressure) and a throttled point. Hitting a mixture-ratio
   target on a pressure-fed engine means setting the two tank pressures
   differently — by how much is what the cold flow and the first hot fire
   told you about the real injector. */

import { psi } from '../lib/units.js';
import { numPart, commonParts, gradeOf } from './report.js';

export const BP_CAMPAIGN = {
  design: { MR: 1.50, MRtol: 0.05, Pc: psi(275), Pctol: psi(15), minDur: 2.0 },
  throttle: { MR: 1.50, MRtol: 0.08, Pc: psi(220), Pctol: psi(15), minDur: 1.5 },
};

const hotRuns = S => S.runs.filter(r => r.tFire !== null && !r.aborted && r.metrics?.kind === 'hotfire' && r.metrics.summary.ignited);
const hits = (r, T) => { const s = r.metrics.summary;
  return Math.abs(s.MR - T.MR) <= T.MRtol && Math.abs(s.Pc - T.Pc) <= T.Pctol && s.dur >= T.minDur - 0.05; };

export function bpCampaignFindings(S) {
  const runs = hotRuns(S);
  const pick = T => [...runs].reverse().find(r => hits(r, T)) || null;
  const d = pick(BP_CAMPAIGN.design), t = pick(BP_CAMPAIGN.throttle);
  const sum = r => r && { run: r.id, Pc: r.metrics.summary.Pc, F: r.metrics.summary.F, MR: r.metrics.summary.MR, eta: r.metrics.summary.etaCstar,
    Isp: r.metrics.summary.Isp, oxP: r.meta.config.sp?.['PR-610'], fuP: r.meta.config.sp?.['PR-620'] };
  return { design: sum(d), throttle: sum(t), fired: runs.length };
}

/* A PT-801 zero shift moves Pc and c* but leaves the run, the thrust and the
   flows standing; a broken TC trips a redline but corrupts nothing else. */
const ALSO = new Set(['tc803-open', 'film-loss']);

/* rep: { Pc, F, MR, eta, Isp, etaT, validity } in SI */
export function gradeBpCampaign(S, rep) {
  const f = bpCampaignFindings(S);
  const parts = [];
  const num = (...a) => numPart(parts, ...a);
  num('Design point: chamber pressure', rep.Pc, f.design?.Pc, 0.03, 8, 'pressure');
  num('Design point: thrust', rep.F, f.design?.F, 0.03, 8, 'force');
  num('Design point: mixture ratio', rep.MR, f.design?.MR, 0.02, 8, 'ratio');
  num('Design point: c* efficiency', rep.eta, f.design?.eta, 0.02, 6, 'ratio');
  num('Design point: Isp', rep.Isp, f.design?.Isp, 0.03, 4, 'isp');
  num('Throttled point: c* efficiency', rep.etaT, f.throttle?.eta, 0.02, 6, 'ratio');
  const exp = commonParts(S, parts, rep.validity, ALSO);
  const score = parts.reduce((s, p) => s + p.got, 0);
  return { score, parts, findings: f, expected: exp, grade: gradeOf(score) };
}

export const BP_CAMPAIGN_SPEC = {
  fields: [['Pc', 'Design point: chamber pressure', 'pressure'], ['F', 'Design point: thrust', 'force'], ['MR', 'Design point: mixture ratio', 'plain', ''],
    ['eta', 'Design point: c* efficiency', 'plain', ''], ['Isp', 'Design point: Isp', 'plain', 's'], ['etaT', 'Throttled point: c* efficiency', 'plain', '']],
  findings: bpCampaignFindings,
  grade: gradeBpCampaign,
};
