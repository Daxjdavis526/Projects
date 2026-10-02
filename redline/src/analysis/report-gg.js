/* The TS-3G acceptance campaign (Level 29): what the conductor's own runs
   support, and the grading of the campaign report. No DOM.

   Three deliverables, each from its own kind of run: a pump-fed cold flow
   on water (the main injector under pump feed), a design-point hot fire of
   at least 20 s (the engine's performance), and a gas generator throttle
   profile down to 70 % or below (the thrust at the bottom). */

import { numPart, commonParts, gradeOf } from './report.js';

const runsOf = (S, kind, pred) => S.runs.filter(r => r.tFire !== null && !r.aborted && r.metrics?.kind === kind && pred(r));
const full = p => Math.abs((p.thrOx ?? p.thr ?? 1) - 1) < 0.005 && Math.abs((p.thrFu ?? p.thr ?? 1) - 1) < 0.005;
const coldFlow = r => r.metrics.points.length > 0 && (r.plan.duration ?? 0) >= 5.95;
const designFire = r => !(r.plan.thrSteps?.length > 1) && full(r.plan) && r.metrics.summary.dur >= 19.9 && r.metrics.points.length > 0;
const profile = r => r.plan.thrSteps?.length >= 3 && Math.min(...r.plan.thrSteps) <= 0.705 && r.metrics.points.length >= 3;

export function ggCampaignFindings(S) {
  const last = (kind, p) => runsOf(S, kind, p).pop() || null;
  const cf = last('ggcold', coldFlow), df = last('gg', designFire), tp = last('gg', profile);
  const c = cf?.metrics.points[0], d = df?.metrics.points[0], low = tp ? tp.metrics.points[tp.metrics.points.length - 1] : null;
  return {
    cold: cf ? { run: cf.id, cdaOx: c.cdaOx * 1e6, cdaFu: c.cdaFu * 1e6, N: c.N } : null,
    design: df ? { run: df.id, Pc: d.Pc, F: d.F, MR: d.MR, TIT: d.TIT, etaCstar: d.etaCstar, IspE: d.IspE, IspC: d.IspC, drift: df.metrics.summary.PcDrift } : null,
    throttle: tp ? { run: tp.id, Flow: low.F, thr: low.thr, n: tp.metrics.points.length } : null,
    fired: runsOf(S, 'gg', () => true).length,
  };
}

export function gradeGgCampaign(S, rep) {
  const f = ggCampaignFindings(S);
  const parts = [];
  const num = (...a) => numPart(parts, ...a);
  num('Cold flow: main ox injector CdA', rep.cdaOx, f.cold?.cdaOx, 0.02, 5, 'ratio');
  num('Cold flow: main fuel injector CdA', rep.cdaFu, f.cold?.cdaFu, 0.02, 4, 'ratio');
  num('Design point: chamber pressure', rep.Pc, f.design?.Pc, 0.02, 5, 'pressure');
  num('Design point: thrust', rep.F, f.design?.F, 0.02, 5, 'force');
  num('Design point: mixture ratio', rep.MR, f.design?.MR, 0.02, 4, 'ratio');
  num('Design point: turbine inlet temperature', rep.TIT, f.design?.TIT, 0.02, 4, 'ratio');
  num('Design point: c* efficiency', rep.etaCstar, f.design?.etaCstar, 0.02, 4, 'ratio');
  num('Design point: engine Isp', rep.IspE, f.design?.IspE, 0.02, 5, 'ratio');
  num('Throttle profile: thrust at the lowest point', rep.Flow, f.throttle?.Flow, 0.03, 4, 'force');
  // a slow start-gas regulator or a slow GG valve leaves the mainstage data
  // good: "valid with anomalies" is as right as calling them invalid
  const exp = commonParts(S, parts, rep.validity, new Set(['pr330-droop', 'gov416-slow']));
  const score = parts.reduce((s, p) => s + p.got, 0);
  return { score, parts, findings: f, expected: exp, grade: gradeOf(score) };
}

export const GG_CAMPAIGN_SPEC = {
  fields: [['cdaOx', 'Cold flow: main ox injector CdA (water)', 'plain', 'mm²'], ['cdaFu', 'Cold flow: main fuel injector CdA (water)', 'plain', 'mm²'],
    ['Pc', 'Design point: chamber pressure', 'pressure'], ['F', 'Design point: thrust', 'force'],
    ['MR', 'Design point: mixture ratio (meters)', 'plain', ''], ['TIT', 'Design point: turbine inlet temperature', 'plain', 'K'],
    ['etaCstar', 'Design point: c* efficiency', 'plain', ''], ['IspE', 'Design point: engine Isp (GG flow included)', 'plain', 's'],
    ['Flow', 'Throttle profile: thrust at the lowest point', 'force']],
  findings: ggCampaignFindings,
  grade: gradeGgCampaign,
};
