/* Levels 14 and 17 on TS-2 with BPE-2, headless: the first regen hot fire
   walked through its procedure start to finish, and the long-duration
   campaign's findings and report grading.
   run: node redline/test/levels-rg.test.mjs */
import def from '../src/content/stands/ts2-regen.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';
import rgHotfire from '../src/content/procedures/rg-hotfire.js';
import rgCampaign, { RG_CAMPAIGN } from '../src/content/procedures/rg-campaign.js';
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
  ex('meterCal', { line: 'ox', fluid: 'LOX' }); ex('meterCal', { line: 'fu', fluid: 'ethanol' });
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

console.log('Level 14 — first regen hot fire, guided, start to finish');
{
  const s = new Session({ def, scenario: rgHotfire, mode: 'guided', seed: 37 });
  const P = s.procedure;
  const ex = leadIn(s, P);
  ex('regSet', { id: 'PR-610', value: psi(420) }); ex('regSet', { id: 'PR-620', value: psi(480) }); s.run(30);
  ex('tare', { ids: ['LC-901'] }); s.run(0.5);
  P.confirm('J1');
  ex('plan', { plan: { mode: 'hot', duration: 10, lead: -0.2, ignLead: 0.5, ignCheck: 0.7, ignOff: 1.2, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 } });
  ex('record', { on: true }); s.run(0.3);
  const poll = s.startPoll();
  check('poll all GO before the first regen hot fire', poll.allGo, poll.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), 'GO');
  P.confirm('L1');
  const arm = s.execute('arm');
  check('arming accepted', arm.ok, JSON.stringify(arm.blocked || arm.confirm));
  ex('fire'); s.run(24);
  const r = s.runs.find(x => x.tFire !== null);
  check('a full 10 s, lit and clean', r && !r.aborted && r.metrics.summary.ignited && r.metrics.summary.dur > 9.5, r?.abort || '');
  P.confirm('M1'); P.confirm('M2');
  safe(s, ex);
  P.confirm('N4'); enter(s, ex);
  for (const x of s.runs) s.flag('analysis:' + x.id);
  s.run(0.5);
  const S = r.metrics.summary;
  P.confirm('O1'); P.confirm('O3'); P.confirm('O4', S.dTc.toFixed(1)); P.confirm('O5', (S.Qjkt / 1e3).toFixed(2)); P.confirm('O6', S.boilMargin.toFixed(1)); P.confirm('O7');
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('first-regen-hot-fire procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  check('no safety violations, no wrong poll calls', s.safetyViolations.length === 0 && s.pollMisses.length === 0, s.safetyViolations.map(v => v.msg).join('; '));
}

console.log('Level 17 — long-duration campaign findings and grading');
{
  const s = new Session({ def, scenario: rgCampaign, mode: 'independent', seed: 43, faultChanceNone: 1 });
  const P = s.procedure;
  const ex = leadIn(s, P, { confirm: false });
  const fire = (ox, fu, dur) => {
    ex('regSet', { id: 'PR-610', value: 0 }); ex('regSet', { id: 'PR-620', value: 0 });
    ex('valve', { id: 'VV-711', open: true }); ex('valve', { id: 'VV-721', open: true }); s.run(6);
    ex('valve', { id: 'VV-711', open: false }); ex('valve', { id: 'VV-721', open: false }); s.run(1);
    ex('regSet', { id: 'PR-610', value: psi(ox) }); ex('regSet', { id: 'PR-620', value: psi(fu) }); s.run(30);
    ex('tare', { ids: ['LC-901'] }); s.run(0.3);
    ex('plan', { plan: { mode: 'hot', duration: dur, lead: -0.2, ignLead: 0.5, ignCheck: 0.7, ignOff: 1.2, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 } });
    ex('record', { on: true }); s.run(0.3);
    ex('arm'); ex('fire'); s.run(5 + dur + 12);
    ex('record', { on: false });
    s.run(300, 0.5);
    return s.runs[s.runs.length - 1];
  };
  const a = fire(400, 448, 21), b = fire(285, 315, 7);
  const f = RG_CAMPAIGN.findings(s);
  const sa = a.metrics.summary, sb = b.metrics.summary;
  check('design point hit for 20 s+', !!f.design, `${a.aborted ? a.abort : ''} MR ${sa.MR?.toFixed(3)}, Pc ${(sa.Pc / psi(1)).toFixed(1)} psig, ${sa.dur?.toFixed(1)} s`);
  check('throttled point hit', !!f.throttle, `${b.aborted ? b.abort : ''} MR ${sb.MR?.toFixed(3)}, Pc ${(sb.Pc / psi(1)).toFixed(1)} psig`);
  if (f.design && f.throttle) {
    s.submitDiagnosis({ component: 'NONE', mode: 'none', evidence: ['prediction', 'heat-balance'], action: 'continue', notes: '' });
    const good = { Pc: f.design.Pc, F: f.design.F, MR: f.design.MR, eta: f.design.eta, Isp: f.design.Isp, etaT: f.throttle.eta,
      Q: f.design.Qjkt, marginT: f.throttle.boilMargin, validity: 'valid' };
    const g = RG_CAMPAIGN.grade(s, good);
    check('an honest, accurate report scores high', g.score >= 90, `${g.score} — ${g.parts.filter(p => p.got < p.max).map(p => p.label).join(', ')}`);
    check('the deliverables are worth 40 points', g.parts.slice(0, 8).reduce((x, p) => x + p.max, 0) === 40);
    const bad = RG_CAMPAIGN.grade(s, { ...good, Q: good.Q * 1.3, marginT: good.marginT * 1.5 });
    check('cooling numbers not from the reduction lose points', bad.score === g.score - 6, `${bad.score}`);
  }
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
