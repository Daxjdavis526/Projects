/* Levels 9 and 12 on TS-2, headless: the first hot fire walked through its
   procedure start to finish, and the independent campaign's findings and
   report grading.
   run: node redline/test/levels-bp.test.mjs */
import def from '../src/content/stands/ts2-biprop.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';
import bpHotfire from '../src/content/procedures/bp-hotfire.js';
import bpCampaign from '../src/content/procedures/bp-campaign.js';
import { bpCampaignFindings, gradeBpCampaign } from '../src/analysis/report-bp.js';
import { sessionReport } from '../src/analysis/report.js';
import { reportHTML } from '../src/analysis/reporthtml.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const pending = P => P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => `${x.id}:${P.status(x.id)}${P.state.get(x.id).msg ? '(' + P.state.get(x.id).msg + ')' : ''}`).join(' ');

/* Common lead-in: walkdown, DAQ, zero, tare, propellants, meters, spark check,
   leak check, cell, purge. */
function leadIn(s, P, { confirm = true } = {}) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  if (confirm) P.confirm('A1');
  ex('tech', { task: 'walkdown' }); s.run(21); if (confirm) P.confirm('A3');
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) }); ex('tare', { ids: ['WT-716', 'WT-726'] }); s.run(0.5);
  ex('tech', { task: 'loadPropellants' }); s.run(121);
  if (confirm) P.confirm('C2', s.daq.latest('WT-716').toFixed(2));
  ex('daqRate', { rate: 2000 });
  ex('meterCal', { line: 'ox', fluid: 'OX-1' }); ex('meterCal', { line: 'fu', fluid: 'FU-1' });
  ex('inspection', { id: 'spark-check' }); s.run(21); if (confirm) P.confirm('E2');
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2);
  ex('regSet', { id: 'PR-610', value: psi(50) }); ex('regSet', { id: 'PR-620', value: psi(50) }); s.run(12);
  ex('valve', { id: 'IV-601', open: false }); ex('regSet', { id: 'PR-610', value: 0 }); ex('regSet', { id: 'PR-620', value: 0 });
  ex('valve', { id: 'VV-601', open: true }); s.run(2);
  if (confirm) { const h = P.startHold('F5'); s.run(61); P.confirm('F5', true); check('leak-check hold accepted', h?.ok && P.status('F5') === 'COMPLETE', P.state.get('F5').msg || JSON.stringify(h)); }
  else s.leakCheck = { ok: true, value: 0 };
  ex('valve', { id: 'VV-601', open: false }); ex('valve', { id: 'IV-601', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'hot fire' });
  ex('regSet', { id: 'PR-630', value: psi(150) }); s.run(8);
  return ex;
}
const safe = (s, ex) => {
  ex('regSet', { id: 'PR-610', value: 0 }); ex('regSet', { id: 'PR-620', value: 0 }); ex('valve', { id: 'IV-601', open: false }); s.run(2);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: true }); s.run(15);
  ex('regSet', { id: 'PR-630', value: 0 }); ex('valve', { id: 'PV-631', open: true }); s.run(8); ex('valve', { id: 'PV-631', open: false }); s.run(1);
};
const enter = (s, ex) => { ex('enterCell'); s.run(1); ex('tech', { task: 'closeHV' }); s.run(6); };

console.log('Level 9 — first hot fire, guided, start to finish');
{
  const s = new Session({ def, scenario: bpHotfire, mode: 'guided', seed: 31 });
  const P = s.procedure;
  const ex = leadIn(s, P);
  ex('regSet', { id: 'PR-610', value: psi(400) }); ex('regSet', { id: 'PR-620', value: psi(400) }); s.run(30);
  ex('tare', { ids: ['LC-901'] }); s.run(0.5);
  P.confirm('J1');
  ex('plan', { plan: { mode: 'hot', duration: 2, lead: 0, ignLead: 0.5, ignCheck: 0.5, ignOff: 1.0, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 } });
  ex('record', { on: true }); s.run(0.3);
  const poll = s.startPoll();
  check('poll all GO before the first hot fire', poll.allGo, poll.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), 'GO');
  P.confirm('L1');
  const arm = s.execute('arm');
  check('arming accepted', arm.ok, JSON.stringify(arm.blocked || arm.confirm));
  ex('fire'); s.run(16);
  const r = s.runs.find(x => x.tFire !== null);
  check('the hot fire lit and ran full duration', r && !r.aborted && r.metrics.summary.ignited, r?.abort || '');
  s.run(15);                                     // soak-back peak passes
  P.confirm('M1'); P.confirm('M2');
  safe(s, ex);
  P.confirm('N4'); enter(s, ex);
  for (const x of s.runs) s.flag('analysis:' + x.id);
  s.run(0.5);
  const S = r.metrics.summary;
  P.confirm('O1'); P.confirm('O3', (S.Pc / psi(1)).toFixed(1)); P.confirm('O4'); P.confirm('O5', S.MR.toFixed(3)); P.confirm('O6', S.etaCstar.toFixed(3)); P.confirm('O7');
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('first-hot-fire procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  check('no safety violations, no wrong poll calls', s.safetyViolations.length === 0 && s.pollMisses.length === 0,
    s.safetyViolations.map(v => v.msg).join('; '));
  const html = reportHTML(sessionReport(s), { result: 'Success' });
  check('the session report carries a hot-fire results table', /Hot-fire results/.test(html) && /smooth/.test(html));
}

console.log('Level 12 — campaign findings and grading');
{
  const s = new Session({ def, scenario: bpCampaign, mode: 'independent', seed: 41, faultChanceNone: 1 });
  const P = s.procedure;
  const ex = leadIn(s, P, { confirm: false });
  const fire = (ox, fu, dur) => {
    // the regulators do not relieve: to go down, vent a little first
    ex('regSet', { id: 'PR-610', value: 0 }); ex('regSet', { id: 'PR-620', value: 0 });
    ex('valve', { id: 'VV-711', open: true }); ex('valve', { id: 'VV-721', open: true }); s.run(6);
    ex('valve', { id: 'VV-711', open: false }); ex('valve', { id: 'VV-721', open: false }); s.run(1);
    ex('regSet', { id: 'PR-610', value: psi(ox) }); ex('regSet', { id: 'PR-620', value: psi(fu) }); s.run(30);
    ex('tare', { ids: ['LC-901'] }); s.run(0.3);
    ex('plan', { plan: { mode: 'hot', duration: dur, lead: 0, ignLead: 0.5, ignCheck: 0.5, ignOff: 1.0, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 } });
    ex('record', { on: true }); s.run(0.3);
    ex('arm'); ex('fire'); s.run(5 + dur + 10);
    ex('record', { on: false });
    s.speed = 1; s.run(400, 0.5);                   // cool down
    return s.runs[s.runs.length - 1].metrics.summary;
  };
  const a = fire(412, 390, 2.0);
  const b = fire(300, 287, 1.6);
  const f = bpCampaignFindings(s);
  check('design point hit with ox/fuel tanks trimmed apart', !!f.design, `MR ${a.MR?.toFixed(3)}, Pc ${(a.Pc / psi(1)).toFixed(1)} psig`);
  check('throttled point hit', !!f.throttle, `MR ${b.MR?.toFixed(3)}, Pc ${(b.Pc / psi(1)).toFixed(1)} psig, stiffness ${b.stiffOx?.toFixed(2)}/${b.stiffFu?.toFixed(2)}`);
  if (f.design && f.throttle) {
    s.submitDiagnosis({ component: 'NONE', mode: 'none', evidence: ['prediction', 'scale-vs-meter'], action: 'continue', notes: '' });
    const good = { Pc: f.design.Pc, F: f.design.F, MR: f.design.MR, eta: f.design.eta, Isp: f.design.Isp, etaT: f.throttle.eta, validity: 'valid' };
    const g = gradeBpCampaign(s, good);
    check('an honest, accurate report scores high', g.score >= 90, `${g.score} — ${g.parts.filter(p => p.got < p.max).map(p => p.label).join(', ')}`);
    const bad = gradeBpCampaign(s, { ...good, MR: 1.50, eta: 0.97, validity: 'anomalies' });
    check('reporting the target instead of the reduction loses points', bad.score < g.score - 10, `${bad.score}`);
  }
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
