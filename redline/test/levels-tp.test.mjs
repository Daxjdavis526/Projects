/* Levels 18–23 on TS-3, headless: the orientation, first spin, pump map,
   suction test and troubleshooting walked through their procedures start
   to finish, and the acceptance campaign's findings and report grading.
   run: node redline/test/levels-tp.test.mjs */
import def from '../src/content/stands/ts3-turbopump.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';
import tpOrientation from '../src/content/procedures/tp-orientation.js';
import tpSpin from '../src/content/procedures/tp-spin.js';
import tpCampaign from '../src/content/procedures/tp-campaign.js';
import tpMap, { MAP_HI, MAP_LO } from '../src/content/procedures/tp-map.js';
import tpSuction, { SUC_OX, SUC_FU } from '../src/content/procedures/tp-suction.js';
import tpTrouble, { REF } from '../src/content/procedures/tp-trouble.js';
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

/* Sections A to I of Levels 20–22 are the same stand preparation: walk them. */
function prepare(s, P) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
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
  ex('valve', { id: 'VV-301', open: false }); ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'TS-3 run' });
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); s.run(25);
  P.confirm('I2');
  return h?.ok && P.status('G3') === 'COMPLETE';
}
/* Load a plan, record, poll if the series poll does not already cover it, fire, coast. */
function fire(s, plan, label) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('plan', { plan }); ex('record', { on: true }); s.run(0.5);
  if (!s.controller.pollGo) {
    const poll = s.startPoll();
    check(`${label}: poll all GO`, poll.allGo, poll.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
    s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), poll.allGo ? 'GO' : 'NO-GO');
  }
  const arm = s.execute('arm');
  check(`${label}: arming accepted`, arm.ok, JSON.stringify(arm.blocked || arm.confirm));
  ex('fire'); s.run(def.holdTime(s.controller.plan) + 20);
  // the last of the coast-down is bearing drag alone: wait it out, as the stand would
  for (let k = 0; k < 30 && (s.controller.seq || s.daq.latest('SPD') >= 1500); k++) s.run(2);
  return s.runs[s.runs.length - 1];
}
function safe(s) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  for (const id of ['PR-410', 'PR-420', 'PR-330']) ex('regSet', { id, value: 0 });
  ex('valve', { id: 'IV-301', open: false }); s.run(2);
  for (const id of ['VV-301', 'VV-413', 'VV-423', 'VV-338']) ex('valve', { id, open: true });
  s.run(40);
}
const clean = r => !!r && !r.aborted && !r.alarms.some(a => /REDLINE/.test(a));

console.log('Level 20 — pump map, guided, start to finish');
{
  const s = new Session({ def, scenario: tpMap, mode: 'guided', seed: 41 });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  check('leak-check hold accepted', prepare(s, P), P.state.get('G3').msg);
  const a = fire(s, MAP_HI, 'map 1');
  check('design-speed map ran clean with five points', clean(a) && a.metrics.points.length === 5, `${a.id} ${a.abort || ''} ${a.alarms.join('; ')} points ${a.metrics.points.length}`);
  P.confirm('L2');
  const b = fire(s, MAP_LO, 'map 2');
  check('75 % map ran clean with five points', clean(b) && b.metrics.points.length === 5, `${b.id} ${b.abort || ''} ${b.alarms.join('; ')} points ${b.metrics.points.length}`);
  P.confirm('M4');
  for (const r of [a, b]) s.flag('analysis:' + r.id);
  s.run(0.5);
  const pa = a.metrics.points.find(p => Math.abs(p.thr - 0.7) < 0.01), pb = b.metrics.points.find(p => Math.abs(p.thr - 0.7) < 0.01);
  P.confirm('N2', pa.HnOx.toFixed(1)); P.confirm('N3', pb.HnOx.toFixed(1));
  check('the two speeds collapse onto one referred curve (within 2 %)', Math.abs(pb.HnOx / pa.HnOx - 1) < 0.02, `${pa.HnOx.toFixed(1)} m vs ${pb.HnOx.toFixed(1)} m`);
  check('water left after both maps', s.daq.latest('WT-411') > 9 && s.daq.latest('WT-421') > 9, `${s.daq.latest('WT-411').toFixed(1)} / ${s.daq.latest('WT-421').toFixed(1)} kg`);
  safe(s); P.confirm('O4');
  ex('enterCell'); s.run(1); ex('tech', { task: 'closeHV' }); s.run(6);
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('map procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  check('no safety violations, no wrong poll calls', s.safetyViolations.length === 0 && s.pollMisses.length === 0, s.safetyViolations.map(v => v.msg).join('; ') + ' / ' + JSON.stringify(s.pollMisses));
}

console.log('Level 21 — suction performance, guided, start to finish');
{
  const s = new Session({ def, scenario: tpSuction, mode: 'guided', seed: 43 });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  check('leak-check hold accepted', prepare(s, P), P.state.get('G3').msg);
  P.confirm('J1');
  const a = fire(s, SUC_OX, 'ox suction');
  check('ox suction run: no abort, the head broke down', clean(a) && Number.isFinite(a.metrics.summary.npshr3), `${a.id} ${a.abort || ''} ${a.alarms.join('; ')} npshr ${a.metrics.summary.npshr3}`);
  P.confirm('L2');
  ex('regSet', { id: 'PR-410', value: psi(50) }); s.run(30);
  const b = fire(s, SUC_FU, 'fuel suction');
  check('fuel suction run: no abort, the head broke down', clean(b) && Number.isFinite(b.metrics.summary.npshr3), `${b.id} ${b.abort || ''} ${b.alarms.join('; ')} npshr ${b.metrics.summary.npshr3}`);
  P.confirm('M5');
  check('a tank load covers both suction runs with margin', s.daq.latest('WT-411') > 12 && s.daq.latest('WT-421') > 12, `${s.daq.latest('WT-411').toFixed(1)} / ${s.daq.latest('WT-421').toFixed(1)} kg left`);
  for (const r of [a, b]) s.flag('analysis:' + r.id);
  s.run(0.5);
  P.confirm('N2', a.metrics.summary.npshr3.toFixed(1)); P.confirm('N3', b.metrics.summary.npshr3.toFixed(1));
  check('NPSH required near the specification (20.9 m ox, 18.9 m fuel)', Math.abs(a.metrics.summary.npshr3 / 20.9 - 1) < 0.12 && Math.abs(b.metrics.summary.npshr3 / 18.9 - 1) < 0.12, `${a.metrics.summary.npshr3.toFixed(1)} / ${b.metrics.summary.npshr3.toFixed(1)} m`);
  safe(s); P.confirm('O4');
  ex('enterCell'); s.run(1); ex('tech', { task: 'closeHV' }); s.run(6);
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('suction procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  check('no safety violations, no wrong poll calls', s.safetyViolations.length === 0 && s.pollMisses.length === 0, s.safetyViolations.map(v => v.msg).join('; ') + ' / ' + JSON.stringify(s.pollMisses));
}

console.log('Level 22 — troubleshooting: a clean rebuild, and a worn ox pump');
for (const [fault, none] of [[null, 1], ['ox-wear', 0]]) {
  const s = new Session({ def, scenario: tpTrouble, mode: 'guided', seed: 47, fault, faultChanceNone: none });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  const tag = fault || 'no fault';
  check(`${tag}: leak-check hold accepted`, prepare(s, P), P.state.get('G3').msg);
  const r = fire(s, REF, `${tag}: reference spin`);
  check(`${tag}: the reference spin ran without an abort`, !!r && !r.aborted, `${r?.id} ${r?.abort || ''}`);
  P.confirm('L2');
  safe(s); P.confirm('M4');
  ex('enterCell'); s.run(1); ex('tech', { task: 'closeHV' }); s.run(6);
  s.flag('analysis:' + r.id);
  for (const id of fault ? ['wear-rings', 'daq-speed-config'] : ['daq-speed-config', 'meter-check']) {
    const x = ex('inspection', { id });
    check(`${tag}: ${id} inspection accepted`, x.ok, x.blocked?.msg || x.msg);
    s.run(def.inspections.find(i => i.id === id).dur + 2);
  }
  const sub = fault ? { component: 'P-OX', mode: 'worn', evidence: ['prediction', 'wear-rings', 'H-OX', 'PT-414'], action: 'repair', notes: '' }
                    : { component: 'NONE', mode: 'none', evidence: ['prediction', 'daq-speed-config', 'meter-check'], action: 'continue', notes: '' };
  const d = s.submitDiagnosis(sub);
  check(`${tag}: the right diagnosis scores as diagnosed`, d.result.score >= 85, `${d.result.score} ${d.result.parts.filter(p => p.got < p.max).map(p => p.label + ': ' + p.note).join(', ')}`);
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check(`${tag}: troubleshooting procedure completes, every step COMPLETE`, sum.counts.COMPLETE === sum.total, pending(P));
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
