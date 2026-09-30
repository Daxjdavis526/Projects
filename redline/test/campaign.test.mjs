/* Level 6, the independent campaign, driven end to end headlessly: the
   milestone sheet completes from the record, the session report assembles,
   and the campaign report is graded against the conductor's own reductions
   and against the truth about the stand. Then the same campaign on a stand
   with a load-cell fault, reported two ways.
   run: node redline/test/campaign.test.mjs */
import def from '../src/content/stands/ts1-coldgas.js';
import campaign from '../src/content/procedures/cg-campaign.js';
import { Session } from '../src/sim/session.js';
import { campaignFindings, gradeCampaign, sessionReport } from '../src/analysis/report.js';
import { reportHTML } from '../src/analysis/reporthtml.js';
import trouble from '../src/content/procedures/cg-trouble.js';
import { psi } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

function runCampaign({ fault = null, seed = 21 } = {}) {
  const s = new Session({ def, scenario: campaign, mode: 'independent', seed, fault, faultChanceNone: fault ? 0 : 1 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  s.note('Pre-test note: baseline at 150, sweep 60/100/150, 10 ms pulses at 150; stop on anything out of family.');
  ex('daqPower', { on: true }); s.run(5); ex('zero'); ex('tare'); ex('daqRate', { rate: 2000 }); s.run(0.5);
  ex('shunt', { on: true }); s.run(0.5); ex('shunt', { on: false }); s.run(0.5);
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: psi(50) }); s.run(6);
  ex('valve', { id: 'IV-101', open: false }); ex('regSet', { value: 0 }); s.run(3);
  const lk = s.startLeakCheck(); s.run(61);
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'TS-1 hazardous' });
  const poll = () => { const p = s.startPoll(); s.concludePoll(p, Object.fromEntries(p.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), 'GO'); s.run(0.3); };
  const fire = (sp, plan) => {
    ex('regSet', { value: sp }); s.run(Math.abs(sp - s.daq.latest('EPC-101')) / psi(25) + 8);
    ex('tare'); s.run(0.5);
    ex('plan', { plan }); ex('record', { on: true }); s.run(1);
    poll(); ex('arm'); ex('fire');
    s.run((plan.mode === 'pulse' ? plan.count * (plan.on + plan.off) : plan.duration) + 9);
  };
  fire(psi(60), { mode: 'single', duration: 2 });
  fire(psi(100), { mode: 'single', duration: 2 });
  fire(psi(150), { mode: 'single', duration: 3 });
  fire(psi(150), { mode: 'pulse', on: 0.010, off: 0.2, count: 10 });
  // safe
  ex('regSet', { value: 0 }); ex('valve', { id: 'IV-101', open: false }); s.run(1.5);
  ex('valve', { id: 'VV-201', open: true }); ex('valve', { id: 'VV-101', open: true }); s.run(12);
  ex('enterCell'); ex('tech', { task: 'closeHV' }); s.run(8);
  ex('valve', { id: 'IV-101', open: true }); s.run(8); ex('valve', { id: 'IV-101', open: false }); s.run(2);
  return { s, ex, lk };
}

console.log('Level 6 — a nominal campaign');
{
  const { s, lk } = runCampaign();
  const P = s.procedure;
  P.confirm('A1');
  check('console leak check runs outside a procedure', lk.ok && s.leakCheck?.ok, s.leakCheck?.msg || lk.msg);
  check('no fault in this campaign', !s.faults.active);
  check('runs recorded, none aborted', s.runs.length === 4 && s.runs.every(r => !r.aborted), s.runs.map(r => r.id + (r.aborted ? '!' : '')).join(' '));
  const f = campaignFindings(s);
  check('baseline found', !!f.baseline, f.baseline && `F ${f.baseline.F.toFixed(2)} N, Isp ${f.baseline.Isp.toFixed(1)} s`);
  check('sweep qualifies (3 points, 90 psi)', f.sweep.ok && f.sweep.n === 3, `n ${f.sweep.n}, Cf ${f.sweep.Cf.toFixed(3)}, R² ${f.sweep.r2.toFixed(4)}`);
  check('thrust coefficient plausible for this nozzle', f.sweep.Cf > 1.2 && f.sweep.Cf < 1.6);
  check('pulse train found', !!f.pulse && f.pulse.n === 10, f.pulse && `Ibit ${(f.pulse.Ibit * 1e3).toFixed(2)} mN·s, CV ${(100 * f.pulse.IbitCv).toFixed(1)} %`);
  s.run(0.5);
  check('clean go/no-go record', s.pollMisses.length === 0 && s.polls.every(p => p.allGo),
        s.polls.map(p => p.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => i.label + ' = ' + i.value).join(' / ')).join('; ')).filter(Boolean).join(' | '));
  check('plan and deliverable milestones complete', ['A2', 'B1', 'B2', 'B3', 'C2'].every(id => P.status(id) === 'COMPLETE'),
        ['A2', 'B1', 'B2', 'B3', 'C2'].map(id => id + ':' + P.status(id)).join(' '));
  s.submitDiagnosis({ component: 'NONE', mode: 'none', evidence: ['prediction', 'leak-check', 'static-agreement', 'shunt-cal'], action: 'continue' });
  const good = { F: f.baseline.F, Pc: f.baseline.Pc, Isp: f.baseline.Isp, Cf: f.sweep.Cf, Ibit: f.pulse.Ibit, IbitCv: f.pulse.IbitCv, validity: 'valid' };
  const g = gradeCampaign(s, good);
  check('an accurate, honest report scores full marks', g.score === 100, `${g.score} ${g.parts.filter(p => p.got < p.max).map(p => p.label).join(', ')}`);
  const sloppy = gradeCampaign(s, { ...good, F: good.F * 1.08, validity: 'anomalies' });
  check('a wrong number and a false alarm cost marks', sloppy.score < 85 && sloppy.score > 60, String(sloppy.score));
  const rep = sessionReport(s);
  check('session report lists every run with its results', rep.runs.length === 4 && rep.runs.filter(r => r.pulse).length === 1 && Number.isFinite(rep.runs[2].F));
  check('session report carries the diagnosis and the answer', rep.diagnosis?.component === 'NONE' && rep.rootCause?.none === true);
  s.flag('campaign-report'); s.run(0.5);
  const sum = P.summary();
  check('milestone sheet complete', sum.counts.COMPLETE === sum.total, P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => x.id + ':' + P.status(x.id)).join(' '));
}

console.log('Level 6 — the same campaign with a load-path fault on LC-501');
{
  const { s } = runCampaign({ fault: 'lc-sens' });
  const f = campaignFindings(s);
  check('the fault is live', s.faults.applied);
  check('the deliverables still reduce', !!f.baseline && f.sweep.ok && !!f.pulse);
  const pred = s.runs[2].meta.config.prediction;
  check('reported thrust is low against prediction', f.baseline.F < 0.93 * pred.F, `${f.baseline.F.toFixed(2)} vs ${pred.F.toFixed(2)} N`);
  const nums = { F: f.baseline.F, Pc: f.baseline.Pc, Isp: f.baseline.Isp, Cf: f.sweep.Cf, Ibit: f.pulse.Ibit, IbitCv: f.pulse.IbitCv };
  const fooled = gradeCampaign(s, { ...nums, validity: 'valid' });
  s.submitDiagnosis({ component: 'LC-501', mode: 'sensitivity', evidence: ['LC-501', 'PT-401', 'prediction', 'deadweight-lc'], action: 'repair' });
  const caught = gradeCampaign(s, { ...nums, validity: 'invalid-inst' });
  check('calling the thrust data valid is penalised', fooled.parts.find(p => p.label === 'Data validity').got === 0);
  check('the right call and diagnosis pass', caught.score >= 85, `${caught.score} vs fooled ${fooled.score}`);
}

console.log('the report document and the hints');
{
  const { s } = runCampaign();
  const f = campaignFindings(s);
  s.submitDiagnosis({ component: 'NONE', mode: 'none', evidence: ['prediction'], action: 'continue' });
  const c = { result: 'Success', summary: 'All three deliverables <in family>.', anomalies: 'None', validity: 'valid',
    numbers: { F: f.baseline.F, Pc: f.baseline.Pc, Isp: f.baseline.Isp, Cf: f.sweep.Cf, Ibit: f.pulse.Ibit, IbitCv: f.pulse.IbitCv } };
  const g = gradeCampaign(s, { ...c.numbers, validity: c.validity });
  const html = reportHTML(sessionReport(s), c, g, { date: '2026-09-30', level: 'Level 6' });
  check('standalone document', html.startsWith('<!doctype html>') && html.includes('</html>'));
  check('every run is in the run log', s.runs.every(r => html.includes(r.id)));
  check('operator text is escaped', html.includes('&lt;in family&gt;') && !html.includes('<in family>'));
  check('the review is included', html.includes(`${g.score}/100`));
  check('labelled as a training exercise on fictional hardware', /fictional/i.test(html));

  const h = new Session({ def, scenario: trouble, mode: 'guided', seed: 5, fault: 'filter-blocked' });
  const texts = [h.faults.hint(), h.faults.hint(), h.faults.hint(), h.faults.hint()];
  check('three hints, then no more', texts.slice(0, 3).every(Boolean) && texts[3] === null);
  check('no hint names the answer outright before the last', !/F-201|filter/i.test(texts[0] + texts[1]), texts[1]);
  const rec = h.submitDiagnosis({ component: 'F-201', mode: 'restricted', evidence: ['DP-F201', 'PT-201', 'inspect-filter'], action: 'repair' });
  check('each hint costs five points', rec.result.score === 85, String(rec.result.score));
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
