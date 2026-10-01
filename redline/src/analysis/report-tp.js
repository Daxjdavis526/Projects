/* The TS-3 acceptance campaign (Level 23): what the conductor's own runs
   support, and the grading of the campaign report. No DOM.

   Three deliverables, each from its own kind of run: a spin at the design
   point (head, flow, turbine efficiency, coast-down), a map at design speed,
   and a suction test on the ox pump. */

import { numPart, commonParts, gradeOf } from './report.js';

const runsOf = (S, pred) => S.runs.filter(r => r.tFire !== null && !r.aborted && r.metrics?.kind === 'pump' && pred(r));
const designSpin = r => r.metrics.mode === 'spin' && (r.plan.ctl || 'speed') === 'speed' && Math.abs(r.plan.speed - 36000) < 1
  && Math.abs((r.plan.thrOx ?? r.plan.thr) - 0.66) < 0.011 && r.metrics.summary.dur >= 7.95 && r.metrics.points.length;
const designMap = r => r.metrics.mode === 'map' && Math.abs(r.plan.speed - 36000) < 1 && r.metrics.points.length >= 4;
const oxSuction = r => r.metrics.mode === 'suction' && (r.plan.side || 'ox') === 'ox' && Number.isFinite(r.metrics.summary.npshr3);

export function tpCampaignFindings(S) {
  const last = p => runsOf(S, p).pop() || null;
  const sp = last(designSpin), mp = last(designMap), su = last(oxSuction);
  const pt = sp?.metrics.points[0];
  return {
    spin: sp ? { run: sp.id, Hox: pt.HOx, Hfu: pt.HFu, mOx: pt.mdotOx, etaT: pt.etaT, coast: sp.metrics.summary.coast50, N: pt.N } : null,
    map: mp ? { run: mp.id, n: mp.metrics.points.length } : null,
    suction: su ? { run: su.id, npshr: su.metrics.summary.npshr3 } : null,
    spun: runsOf(S, () => true).length,
  };
}

export function gradeTpCampaign(S, rep) {
  const f = tpCampaignFindings(S);
  const parts = [];
  const num = (...a) => numPart(parts, ...a);
  num('Design point: ox pump head', rep.Hox, f.spin?.Hox, 0.01, 7, 'head');
  num('Design point: fuel pump head', rep.Hfu, f.spin?.Hfu, 0.01, 7, 'head');
  num('Design point: ox pump flow', rep.mOx, f.spin?.mOx, 0.02, 6, 'massflow');
  num('Design point: turbine efficiency', rep.etaT, f.spin?.etaT, 0.03, 6, 'ratio');
  num('Design point: coast-down to half speed', rep.coast, f.spin?.coast, 0.05, 4, 'time');
  num('Ox pump NPSH required', rep.npshr, f.suction?.npshr, 0.05, 6, 'head');
  parts.push({ label: 'Pump map at design speed', got: f.map ? 4 : 0, max: 4, note: f.map ? `${f.map.n} points (${f.map.run}).` : 'No map at design speed recorded.' });
  const exp = commonParts(S, parts, rep.validity, new Set(['pr410-relief-leak']));
  const score = parts.reduce((s, p) => s + p.got, 0);
  return { score, parts, findings: f, expected: exp, grade: gradeOf(score) };
}

export const TP_CAMPAIGN_SPEC = {
  fields: [['Hox', 'Design point: ox pump head', 'plain', 'm'], ['Hfu', 'Design point: fuel pump head', 'plain', 'm'],
    ['mOx', 'Design point: ox pump flow', 'plain', 'kg/s'], ['etaT', 'Design point: turbine efficiency', 'plain', ''],
    ['coast', 'Design point: coast-down to half speed', 'plain', 's'], ['npshr', 'Ox pump NPSH required (3 % head drop)', 'plain', 'm']],
  findings: tpCampaignFindings,
  grade: gradeTpCampaign,
};
