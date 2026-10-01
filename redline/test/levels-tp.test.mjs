/* Levels 18, 19 and 23 on TS-3, headless: the orientation and the first
   spin walked through their procedures start to finish, and the acceptance
   campaign's findings and report grading.
   run: node redline/test/levels-tp.test.mjs */
import def from '../src/content/stands/ts3-turbopump.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';
import tpOrientation from '../src/content/procedures/tp-orientation.js';
import tpSpin from '../src/content/procedures/tp-spin.js';
import tpCampaign from '../src/content/procedures/tp-campaign.js';
import tpMap from '../src/content/procedures/tp-map.js';
import tpSuction from '../src/content/procedures/tp-suction.js';
import tpTrouble from '../src/content/procedures/tp-trouble.js';
import { TP_CAMPAIGN_SPEC } from '../src/analysis/report-tp.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const pending = P => P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => `${x.id}:${P.status(x.id)}${P.state.get(x.id).msg ? '(' + P.state.get(x.id).msg + ')' : ''}`).join(' ');

console.log('Level 18 — orientation, tutorial, start to finish');
{
  const s = new Session({ def, scenario: tpOrientation, mode: 'tutorial', seed: 21 });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  P.confirm('A1'); P.confirm('A2');
  for (const st of P.steps.filter(x => x.id.startsWith('K-'))) s.inspect(st.id.slice(2));
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) }); ex('tare', { ids: ['WT-411', 'WT-421'] }); s.run(0.5);
  ex('tech', { task: 'fillTanks' }); s.run(91);
  ex('tech', { task: 'turnRotor' }); s.run(31);
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('regSet', { id: 'PR-410', value: psi(40) }); ex('regSet', { id: 'PR-420', value: psi(40) }); s.run(20);
  ex('regSet', { id: 'PR-410', value: psi(20) }); s.run(40);
  check('the relieving regulator brought the ox tank down to 20 psig with its vent shut', Math.abs(s.daq.latest('PT-410') / psi(1) - 20) < 4, `${(s.daq.latest('PT-410') / psi(1)).toFixed(1)} psig`);
  for (const id of ['PR-410', 'PR-420', 'PR-330']) ex('regSet', { id, value: 0 });
  ex('valve', { id: 'IV-301', open: false }); s.run(2);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: true }); s.run(30);
  P.confirm('E3'); P.confirm('E4'); s.run(0.5);
  const sum = P.summary();
  check('orientation completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
}

console.log('Level 19 — first spin, guided, start to finish');
{
  const s = new Session({ def, scenario: tpSpin, mode: 'guided', seed: 23 });
  const P = s.procedure, ex = (a, x = {}) => { const r = s.execute(a, x, { confirmed: true }); return r; };
  P.confirm('A1'); ex('tech', { task: 'walkdown' }); s.run(21); P.confirm('A3');
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) }); ex('tare', { ids: ['WT-411', 'WT-421'] }); s.run(0.5);
  ex('tech', { task: 'fillTanks' }); s.run(91);
  P.confirm('C2', s.daq.latest('WT-411').toFixed(1));
  ex('tech', { task: 'turnRotor' }); s.run(31);
  const brk = s.log.items.filter(e => e.cat === 'TECH' && /breakaway/.test(e.text)).pop().text.match(/breakaway (\d+)/)[1];
  P.confirm('D2', brk); P.confirm('D3');
  ex('daqRate', { rate: 2000 });
  ex('tech', { task: 'openHV' }); s.run(9);
  P.confirm('F2', (s.daq.latest('PT-301') / psi(1)).toFixed(0));
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('regSet', { id: 'PR-410', value: psi(40) }); ex('regSet', { id: 'PR-420', value: psi(40) }); s.run(20);
  ex('valve', { id: 'IV-301', open: false }); ex('valve', { id: 'VV-301', open: true }); s.run(2);
  const h = P.startHold('G3'); s.run(61); P.confirm('G3', true);
  check('leak-check hold accepted', h?.ok && P.status('G3') === 'COMPLETE', P.state.get('G3').msg || JSON.stringify(h));
  ex('valve', { id: 'VV-301', open: false }); ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'TS-3 spin' });
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); s.run(20);
  P.confirm('I2');
  ex('plan', { plan: { mode: 'spin', ctl: 'speed', speed: 18000, ramp: 3, duration: 8, thr: 0.66 } });
  ex('record', { on: true }); s.run(0.5);
  const poll = s.startPoll();
  check('poll all GO before the first spin', poll.allGo, poll.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), 'GO');
  const arm = s.execute('arm');
  check('arming accepted', arm.ok, JSON.stringify(arm.blocked || arm.confirm));
  ex('fire'); s.run(30);
  P.confirm('L2'); P.confirm('L3');
  ex('plan', { plan: { mode: 'spin', ctl: 'speed', speed: 36000, ramp: 3, duration: 8, thr: 0.66 } });
  ex('record', { on: true }); s.run(0.5);
  const arm2 = s.execute('arm');
  check('the series poll still covers the design-speed spin', arm2.ok, JSON.stringify(arm2.blocked || arm2.confirm));
  ex('fire'); s.run(30);
  P.confirm('M4');
  const runs = s.runs.filter(r => r.tFire !== null);
  check('two clean spins recorded', runs.length === 2 && runs.every(r => !r.aborted && !r.alarms.length), runs.map(r => r.id + (r.aborted ? ' ' + r.abort : '') + r.alarms.join(';')).join(' | '));
  for (const r of runs) s.flag('analysis:' + r.id);
  s.run(0.5);
  const lo = runs[0].metrics.points[0], hi = runs[1].metrics.points[0];
  P.confirm('N2', hi.HOx.toFixed(1)); P.confirm('N3', (hi.HOx / lo.HOx).toFixed(3)); P.confirm('N4', hi.etaT.toFixed(3)); P.confirm('N5', runs[1].metrics.summary.coast50.toFixed(2));
  check('the affinity laws: head ratio within 3 % of four', Math.abs(hi.HOx / lo.HOx / 4 - 1) < 0.03, (hi.HOx / lo.HOx).toFixed(3));
  for (const id of ['PR-410', 'PR-420', 'PR-330']) ex('regSet', { id, value: 0 });
  ex('valve', { id: 'IV-301', open: false }); s.run(2);
  for (const id of ['VV-301', 'VV-413', 'VV-423', 'VV-338']) ex('valve', { id, open: true });
  s.run(40);
  P.confirm('O4');
  ex('enterCell'); s.run(1); ex('tech', { task: 'closeHV' }); s.run(6);
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('first-spin procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  check('no safety violations, no wrong poll calls', s.safetyViolations.length === 0 && s.pollMisses.length === 0, s.safetyViolations.map(v => v.msg).join('; ') + ' / ' + JSON.stringify(s.pollMisses));
}

console.log('Levels 20–22 build and their requests are self-consistent');
{
  for (const L of [tpMap, tpSuction, tpTrouble]) {
    const s = new Session({ def, scenario: L, mode: 'guided', seed: 5 });
    check(`${L.id}: procedure built (${s.procedure.steps.length} steps) with a request`, s.procedure.steps.length > 20 && !!s.request?.text);
  }
}

console.log('Level 23 — acceptance campaign findings and grading');
{
  const s = new Session({ def, scenario: tpCampaign, mode: 'independent', seed: 29, faultChanceNone: 1 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) }); ex('tare', { ids: ['WT-411', 'WT-421'] });
  ex('tech', { task: 'fillTanks' }); s.run(91); ex('tech', { task: 'turnRotor' }); s.run(31);
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('regSet', { id: 'PR-410', value: psi(40) }); ex('regSet', { id: 'PR-420', value: psi(40) }); s.run(20);
  ex('valve', { id: 'IV-301', open: false }); ex('valve', { id: 'VV-301', open: true }); s.run(2);
  s.startLeakCheck(); s.run(62);
  check('campaign leak check passes', s.leakCheck?.ok, s.leakCheck?.msg);
  ex('valve', { id: 'VV-301', open: false }); ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'x' }); ex('daqRate', { rate: 2000 });
  // water budget: the suction run alone takes ~22 kg from the ox tank — top up first
  const refill = () => {
    // a refill puts a technician in the cell: safe the whole stand first
    for (const id of ['PR-410', 'PR-420', 'PR-330']) ex('regSet', { id, value: 0 });
    ex('valve', { id: 'IV-301', open: false }); s.run(1);
    for (const id of ['VV-301', 'VV-413', 'VV-423', 'VV-338']) ex('valve', { id, open: true });
    s.run(30);
    while (s.model.tp.w > 30) s.run(5);
    ex('enterCell'); s.run(1);
    const r = ex('tech', { task: 'fillTanks' }); s.run(91);
    check('refill between runs accepted', r.ok, r.blocked?.msg);
    for (const id of ['VV-301', 'VV-413', 'VV-423', 'VV-338']) ex('valve', { id, open: false });
    ex('valve', { id: 'IV-301', open: true }); s.run(2); ex('clearCell'); s.run(7); ex('pa', { text: 'x' });
  };
  const run = plan => {
    if (s.daq.latest('WT-411') < 30) refill();
    ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); s.run(30);
    ex('plan', { plan: { ctl: 'speed', speed: 36000, ramp: 3, settle: 3, rate: psi(1.5), ...plan } }); s.run(0.5);
    ex('record', { on: true }); s.run(0.5);
    if (!s.controller.pollGo) {
      const p = s.startPoll();
      check(`poll all GO before ${plan.mode}`, p.allGo, p.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
      s.concludePoll(p, Object.fromEntries(p.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), p.allGo ? 'GO' : 'NO-GO');
    }
    ex('arm'); ex('fire'); s.run(def.holdTime(s.controller.plan) + 18);
    return s.runs[s.runs.length - 1];
  };
  const a = run({ mode: 'spin', thr: 0.66, duration: 10 });
  const b = run({ mode: 'map', thrSteps: [0.4, 0.55, 0.7, 0.85, 1.0], dwell: 4 });
  const c = run({ mode: 'suction', side: 'ox', thr: 0.66, pEnd: psi(3), duration: 44 });
  const f = TP_CAMPAIGN_SPEC.findings(s);
  check('design-point spin, map and suction test all found', !!f.spin && !!f.map && !!f.suction, [a, b, c].map(r => r.id + (r.aborted ? ' ' + r.abort : '')).join(', '));
  if (f.spin && f.suction) {
    s.submitDiagnosis({ component: 'NONE', mode: 'none', evidence: ['prediction', 'coast-down', 'turn-rotor', 'leak-check'], action: 'continue', notes: '' });
    const good = { Hox: f.spin.Hox, Hfu: f.spin.Hfu, mOx: f.spin.mOx, etaT: f.spin.etaT, coast: f.spin.coast, npshr: f.suction.npshr, validity: 'valid' };
    const g = TP_CAMPAIGN_SPEC.grade(s, good);
    check('an honest, accurate report scores high', g.score >= 90, `${g.score} — ${g.parts.filter(p => p.got < p.max).map(p => p.label + ': ' + p.note).join(', ')}`);
    check('the deliverables are worth 40 points', g.parts.slice(0, 7).reduce((x, p) => x + p.max, 0) === 40);
    const bad = TP_CAMPAIGN_SPEC.grade(s, { ...good, npshr: good.npshr * 1.3 });
    check('an NPSH required not from the reduction loses its points', bad.score === g.score - 6, `${bad.score}`);
  }
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
