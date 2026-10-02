/* The session test report, and the grading of a campaign report. No DOM.

   A test report is what survives the test: what was asked, how the stand
   was configured, what was run, what the data say against the prediction,
   what went wrong, what was concluded. `sessionReport` assembles the facts
   from the session's own record; the conductor adds the conclusions.

   For the independent campaign (Level 6) the conclusions are also graded:
   the numbers against the conductor's own reductions (did you report what
   your data say?), the data-validity call against what was really wrong
   with the stand (were your data what they seemed?), plus the diagnosis and
   the safety record. */

import { linfit, value } from './campaign.js';
import { psi } from '../lib/units.js';

const valid = r => r.tFire !== null && !r.aborted && !!r.metrics?.summary;

export function sessionReport(S) {
  const c = S.controller;
  const runs = S.runs.map(r => {
    // a gas-generator engine's run reports its first mainstage point (speed
    // and the start are in its own rows)
    const gp = r.metrics?.kind === 'gg' ? r.metrics.points?.[0] : null;
    const m = gp ? { ...r.metrics.summary, F: gp.F, Pc: gp.Pc, Isp: gp.IspE } : r.metrics?.summary || {};
    const pulse = r.plan?.mode === 'pulse';
    return {
      id: r.id, clock: r.clock, plan: c.planText(r.plan || r.meta.config.plan), pulse,
      regSet: r.meta.config.regSet, rate: r.meta.config.rate, supply: r.meta.config.supply,
      fired: r.tFire !== null, aborted: r.aborted, abort: r.abort, reason: r.reason,
      alarms: [...new Set(r.alarms)],
      F: m.F, Pc: m.Pc, Isp: Number.isFinite(m.IspFM) ? m.IspFM : m.Isp, mdot: m.mdotFM, dur: m.dur,
      Ibit: m.Ibit, IbitCv: m.IbitCv, n: m.n,
      coldflow: r.metrics?.kind === 'coldflow' ? { mdotOx: m.mdotOx, mdotFu: m.mdotFu, CdAOx: m.CdAOx, CdAFu: m.CdAFu, MR: m.MR, MRhot: m.MRhot, errOx: m.errOx, errFu: m.errFu,
        pOx: r.meta.config.prediction?.mdotOx, pFu: r.meta.config.prediction?.mdotFu, sides: r.plan?.sides || 'both' } : null,
      hotfire: r.metrics?.kind === 'hotfire' ? { ignited: m.ignited, Pc: m.Pc, F: m.F, MR: m.MR, MRw: m.MRw, cstar: m.cstar, eta: m.etaCstar, Isp: m.Isp, start: m.start,
        overshoot: m.overshoot, ignDelay: m.ignDelay, TthPeak: m.TthPeak, unburned: m.unburned, flags: r.metrics.flags || [],
        pPc: r.meta.config.prediction?.Pc, pF: r.meta.config.prediction?.F, pMR: r.meta.config.prediction?.MR, oxP: r.meta.config.sp?.['PR-610'], fuP: r.meta.config.sp?.['PR-620'] } : null,
      pred: r.meta.config.prediction ? { F: r.meta.config.prediction.F, Pc: r.meta.config.prediction.kind === 'gg' ? r.meta.config.prediction.Pc - 101325 : r.meta.config.prediction.Pc, Isp: r.meta.config.prediction.Isp } : null,
    };
  });
  const anomalies = [];
  for (const e of S.log.filter(e => e.cat === 'ABT' && e.text.startsWith('ABORT'))) anomalies.push({ t: e.t, kind: 'Abort', text: e.text });
  const alarmSeen = new Set();
  for (const e of S.log.filter(e => e.cat === 'ALM')) {
    const k = e.alarm || e.text;
    if (alarmSeen.has(k)) continue;
    alarmSeen.add(k);
    anomalies.push({ t: e.t, kind: 'Alarm', text: e.text });
  }
  for (const p of S.polls.filter(p => !p.go)) anomalies.push({ t: p.tEnd, kind: 'Hold', text: 'Go/no-go poll: NO-GO, test held' });
  for (const v of S.safetyViolations) anomalies.push({ t: v.t, kind: 'Safety', text: v.msg });
  anomalies.sort((a, b) => a.t - b.t);
  const dg = S.faults.diagnosis;
  const rv = S.faults.reveal();
  return {
    title: S.request?.title || 'Open-stand session',
    request: S.request?.text || null, success: S.request?.success || null,
    stand: S.def.name, article: S.def.article, mode: S.mode,
    procedure: S.procedure ? S.procedure.proc.title : null,
    procSummary: S.procedure ? S.procedure.summary() : null,
    start: S.clockStart, end: S.clock,
    runs, anomalies,
    inspections: S.inspections.map(i => ({ label: i.label, lines: i.lines, text: i.text })),
    diagnosis: dg ? { component: dg.component, mode: dg.mode, action: dg.action, evidence: dg.evidence, score: dg.result.score, grade: dg.result.grade } : null,
    rootCause: rv ? (rv.none ? { none: true } : { component: rv.fault.component, mode: rv.fault.mode, what: rv.story.what }) : null,
    faultSession: S.faults.enabled,
    polls: S.polls.length, safety: S.safetyViolations.length, pollMisses: S.pollMisses.length,
  };
}

/* ---- the Level 6 campaign ------------------------------------------------ */

export const CAMPAIGN = {
  baseline: { regSet: psi(150), tol: psi(5), minDur: 2.0 },
  sweep: { points: 3, span: psi(80), lo: psi(55), hi: psi(205) },
  pulse: { on: 0.010, tol: 0.0005, count: 10 },
};

/* What the conductor's own recorded, un-aborted runs support. */
export function campaignFindings(S, def = S.def) {
  const runs = S.runs.filter(valid);
  const single = runs.filter(r => r.plan?.mode !== 'pulse');
  const B = CAMPAIGN.baseline;
  const base = [...single].reverse().find(r => Math.abs(r.meta.config.regSet - B.regSet) <= B.tol && r.metrics.summary.dur >= B.minDur - 0.05) || null;
  const bs = base?.metrics.summary;
  // characterisation: one point per setpoint (the latest), steady burns only
  const W = CAMPAIGN.sweep, bySet = new Map();
  for (const r of single) {
    const sp = r.meta.config.regSet;
    if (sp < W.lo || sp > W.hi || !(r.metrics.summary.dur >= 0.8)) continue;
    bySet.set(Math.round(sp / psi(5)), r);
  }
  const pts = [...bySet.values()];
  const sets = pts.map(r => r.meta.config.regSet);
  const span = sets.length ? Math.max(...sets) - Math.min(...sets) : 0;
  const sweepOk = pts.length >= W.points && span >= W.span - psi(1);
  const fit = sweepOk ? linfit(pts.map(r => value(r, 'PcAbs')), pts.map(r => value(r, 'F'))) : null;
  const At = Math.PI / 4 * def.nominal.throatDia ** 2;
  const Pp = CAMPAIGN.pulse;
  const pr = [...runs].reverse().find(r => r.plan?.mode === 'pulse' && Math.abs(r.plan.on - Pp.on) <= Pp.tol && r.plan.count >= Pp.count) || null;
  const ps = pr?.metrics.summary;
  return {
    baseline: base ? { run: base.id, F: bs.F, Pc: bs.Pc, Isp: Number.isFinite(bs.IspFM) ? bs.IspFM : bs.Isp } : null,
    sweep: { ok: sweepOk, n: pts.length, span, runs: pts.map(r => r.id), Cf: fit ? fit.a / At : NaN, r2: fit?.r2 ?? NaN },
    pulse: pr ? { run: pr.id, Ibit: ps.Ibit, IbitCv: ps.IbitCv, n: ps.n } : null,
  };
}

export const VALIDITY = [
  ['valid', 'Valid — the data represent the article'],
  ['anomalies', 'Valid with anomalies noted — the deliverables stand'],
  ['invalid-hw', 'Invalid — the stand or article was not as specified'],
  ['invalid-inst', 'Invalid — instrumentation error in the deliverables'],
];

/* The honest call on the data, given what was really wrong. Hardware faults
   mean the stand did not test the article as specified; instrument faults
   invalidate the data they touch. A few faults leave the deliverables
   standing, and then "valid with anomalies" is right too. */
const ALSO_ANOMALIES = new Set(['pt301-bias', 'tc301-fail', 'pt401-noise', 'lc-intermittent', 'fitting-leak', 'sv-seat-leak', 'reg-creep']);
export function expectedValidity(fault, applied, also = ALSO_ANOMALIES) {
  if (!fault || !applied) return ['valid'];
  const main = fault.category === 'sensor' ? 'invalid-inst' : 'invalid-hw';
  return also.has(fault.id) ? [main, 'anomalies'] : [main];
}

/* A deliverable number against the conductor's own reduction. */
export function numPart(parts, label, got, ref, rel, max, q) {
  if (!Number.isFinite(ref)) { parts.push({ label, got: 0, max, note: 'No qualifying run recorded — the deliverable is missing.' }); return; }
  const ok = Number.isFinite(got) && Math.abs(got - ref) <= rel * Math.abs(ref);
  parts.push({ label, got: ok ? max : 0, max, ref, q, reported: got, note: ok ? 'Agrees with your reduction.' : Number.isFinite(got) ? 'Does not agree with your own reduction.' : 'Not reported.' });
}

/* The parts every campaign grade shares: the call on the data, the
   diagnosis, the safety record. */
export function commonParts(S, parts, validity, also) {
  const fault = S.faults.active, applied = S.faults.applied;
  const exp = expectedValidity(fault, applied, also);
  let v = 0, vn;
  if (exp.includes(validity)) { v = 30; vn = 'Right call on the data.'; }
  else if (exp[0] !== 'valid' && validity && validity !== 'valid') { v = 15; vn = `Something was wrong, and you said so — but the better call was "${VALIDITY.find(x => x[0] === exp[0])[1]}".`; }
  else if (exp[0] === 'valid' && validity === 'anomalies') { v = 10; vn = 'The stand was nominal: the anomalies you noted were ordinary scatter or your own actions.'; }
  else vn = exp[0] === 'valid' ? 'The stand was nominal; the data were good.' : 'The data were not what they seemed. Reporting them as valid is how a bad number reaches a design review.';
  parts.push({ label: 'Data validity', got: v, max: 30, note: vn });
  const dg = S.faults.diagnosis;
  const d = dg ? Math.round(dg.result.score * 0.2) : 0;
  parts.push({ label: 'Diagnosis', got: d, max: 20, note: dg ? `Diagnosis scored ${dg.result.score}/100.` : 'No diagnosis submitted.' });
  const safe = S.safetyViolations.length === 0 && S.pollMisses.length === 0;
  parts.push({ label: 'Safety and go/no-go record', got: safe ? 10 : 0, max: 10, note: safe ? 'Clean.' : `${S.safetyViolations.length} safety violation(s), ${S.pollMisses.length} wrong poll call(s).` });
  return exp;
}
export const gradeOf = score => (score >= 85 ? 'Qualified' : score >= 60 ? 'Qualified with remarks' : 'Not yet');

/* rep: { F, Pc, Isp, Cf, Ibit, IbitCv (fraction), validity, anomalies } in SI. */
export function gradeCampaign(S, rep, def = S.def) {
  const f = campaignFindings(S, def);
  const parts = [];
  const num = (...a) => numPart(parts, ...a);
  num('Baseline thrust', rep.F, f.baseline?.F, 0.03, 8, 'force');
  num('Baseline chamber pressure', rep.Pc, f.baseline?.Pc, 0.03, 8, 'pressure');
  num('Baseline Isp', rep.Isp, f.baseline?.Isp, 0.03, 6, 'isp');
  num('Thrust coefficient from the sweep', rep.Cf, f.sweep.ok ? f.sweep.Cf : NaN, 0.03, 8, 'ratio');
  num('Impulse bit at 10 ms', rep.Ibit, f.pulse?.Ibit, 0.05, 6, 'impulse');
  num('Impulse-bit scatter', rep.IbitCv, f.pulse?.IbitCv, 0.25, 4, 'percent');
  const exp = commonParts(S, parts, rep.validity);
  const score = parts.reduce((s, p) => s + p.got, 0);
  return { score, parts, findings: f, expected: exp, grade: gradeOf(score) };
}

/* What the Level 6 report form asks for: [key, label, conversion, unit]. */
export const CAMPAIGN_SPEC = {
  fields: [['F', 'Baseline thrust', 'force'], ['Pc', 'Baseline chamber pressure', 'pressure'], ['Isp', 'Baseline Isp', 'plain', 's'],
    ['Cf', 'Thrust coefficient (sweep)', 'plain', ''], ['Ibit', 'Impulse bit, 10 ms', 'mNs', 'mN·s'], ['IbitCv', 'Impulse-bit scatter (1σ/mean)', 'pct', '%']],
  findings: campaignFindings,
  grade: gradeCampaign,
};
