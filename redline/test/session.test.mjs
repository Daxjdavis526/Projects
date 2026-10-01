/* Headless session checks: a complete Level-2 test driven through the
   same API the UI uses, plus interlocks, the go/no-go poll and automatic
   aborts. run: node redline/test/session.test.mjs */
import def from '../src/content/stands/ts1-coldgas.js';
import basic from '../src/content/procedures/cg-basic-firing.js';
import orientation from '../src/content/procedures/cg-orientation.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

function drive(s) {
  return (a, x = {}, confirmed = true) => s.execute(a, x, { confirmed });
}

console.log('Level 2, guided, driven start to finish');
{
  const s = new Session({ def, scenario: basic, mode: 'guided', seed: 11 });
  const ex = drive(s), P = s.procedure;
  const ok = id => P.confirm(id);
  ok('A1');
  ex('tech', { task: 'walkdown' }); s.run(21);
  ok('A3');
  ex('daqPower', { on: true }); s.run(5);
  ok('B2'); ok('B3');
  ex('zero'); ex('tare'); s.run(1);
  ex('shunt', { on: true }); s.run(0.5);
  P.confirm('C3', s.daq.latest('LC-501').toFixed(2));
  ex('shunt', { on: false }); s.run(0.5);
  ex('daqRate', { rate: 2000 }); s.run(0.5);
  ex('tech', { task: 'openHV' }); s.run(9);
  P.confirm('E2', (s.daq.latest('PT-101') / psi(1)).toFixed(0));
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: psi(50) }); s.run(6);
  ex('valve', { id: 'IV-101', open: false }); ex('regSet', { value: 0 }); s.run(3);
  const hr = P.startHold('E6');
  check('leak-check hold starts once isolated', hr && hr.ok, JSON.stringify(hr));
  s.run(61);
  const lc = P.confirm('E6', true);
  check('leak check passes on a tight system', lc.ok && s.leakCheck?.ok, s.leakCheck?.msg);
  ex('clearCell'); s.run(7);
  ex('pa', { text: 'TS-1 cell is hazardous' });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: psi(150) }); s.run(12);
  ok('G3');
  ex('tare'); s.run(0.5);
  ex('plan', { plan: { mode: 'single', duration: 3.0 } });
  ex('record', { on: true }); s.run(1);
  const poll = s.startPoll();
  check('poll: every station GO on a nominal stand', poll.allGo, poll.stations.filter(x => !x.go).map(x => x.name + ':' + x.items.filter(i => !i.ok).map(i => i.label).join('/')).join(' '));
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, 'GO'])), 'GO'); s.run(0.3);
  const arm = ex('arm', {}, false);
  check('arming after a GO poll needs no confirmation', arm.ok, JSON.stringify(arm));
  ex('fire'); s.run(12);
  const run = s.runs[0];
  check('run recorded and auto-stopped', !!run && run.reason.startsWith('auto'), run?.reason);
  check('run reduced: steady thrust within 3 % of prediction', run && Math.abs(run.metrics.summary.F / s.prediction.F - 1) < 0.03,
        `${run?.metrics.summary.F.toFixed(3)} vs ${s.prediction.F.toFixed(3)} N`);
  check('no alarms on a nominal firing', s.alarms.list.length === 0, s.alarms.list.map(a => a.id).join(','));
  ok('K1');
  ex('regSet', { value: 0 }); ex('valve', { id: 'IV-101', open: false }); s.run(1.5);
  ex('valve', { id: 'VV-201', open: true }); ex('valve', { id: 'VV-101', open: true }); s.run(10);
  ok('L4');
  ex('enterCell'); ex('tech', { task: 'closeHV' }); s.run(8);
  ex('valve', { id: 'IV-101', open: true }); s.run(8);
  ex('valve', { id: 'IV-101', open: false }); s.run(2);
  ex('tech', { task: 'inspect' }); s.run(27);
  s.flag('analysis:' + run.id); s.run(0.5);
  P.confirm('N3', run.metrics.summary.F.toFixed(2)); ok('N4');
  s.flag('report:' + run.id); s.run(0.5);
  const sum = P.summary();
  const notDone = P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => `${x.id}:${P.status(x.id)}${P.state.get(x.id).msg ? '(' + P.state.get(x.id).msg + ')' : ''}`);
  check('every procedure step COMPLETE', sum.counts.COMPLETE === sum.total, notDone.join(' '));
  check('no safety violations', s.safetyViolations.length === 0);
  check('audit: zero taken while vented', P.state.get('C1').truthOk === true);
}

console.log('interlocks');
{
  const s = new Session({ def, mode: 'tutorial', seed: 3 });
  const ex = drive(s);
  check('cannot fire unarmed', ex('fire').blocked?.id === 'FIRE-ARM');
  check('cannot arm with the cell open', ex('arm').blocked?.id === 'ARM-AREA');
  check('cannot command above the EPC limit', ex('regSet', { value: psi(245) }).blocked?.id === 'REG-MAX');
  check('tutorial blocks pressurising past 50 psig with the cell open', ex('regSet', { value: psi(100) }).blocked?.id === 'REG-PERSONNEL');
  const g = new Session({ def, mode: 'guided', seed: 3 });
  const r = g.execute('regSet', { value: psi(100) });
  check('guided warns instead', !!r.confirm && r.confirm[0].id === 'REG-PERSONNEL');
  const i = new Session({ def, mode: 'independent', seed: 3 });
  i.execute('regSet', { value: psi(100) });
  check('independent allows it — and records a safety violation', i.safetyViolations.length === 1 && i.controller.regSet === psi(100));
  // zeroing under pressure: allowed in independent mode, and it bites
  const z = new Session({ def, mode: 'independent', seed: 5 });
  const ez = drive(z);
  ez('daqPower', { on: true }); z.run(5);
  ez('tech', { task: 'openHV' }); z.run(9);
  ez('valve', { id: 'VV-101', open: false }); ez('valve', { id: 'VV-201', open: false });
  ez('valve', { id: 'IV-101', open: true }); z.run(2);
  ez('regSet', { value: psi(40) }); z.run(6);
  ez('zero'); z.run(0.5);
  ez('regSet', { value: 0 }); ez('valve', { id: 'IV-101', open: false }); ez('valve', { id: 'VV-201', open: true }); ez('valve', { id: 'VV-101', open: true }); z.run(8);
  const r201 = z.daq.latest('PT-201') / psi(1);
  check('PT zeroed at 40 psig reads ≈ −40 when vented', r201 < -35 && r201 > -45, r201.toFixed(1) + ' psig');
}

console.log('go/no-go catches a pre-fire problem');
{
  const s = new Session({ def, mode: 'independent', seed: 9 });
  const ex = drive(s);
  ex('daqPower', { on: true }); s.run(5); ex('zero'); ex('tare');
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-101', open: false });   // VV-201 left open
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('clearCell'); s.run(7);
  ex('regSet', { value: psi(150) }); s.run(12);
  ex('record', { on: true }); s.run(0.5);
  const poll = s.startPoll();
  const prop = poll.stations.find(x => x.id === 'PROP');
  check('propulsion NO-GO with a vent left open', !prop.go, prop.items.filter(i => !i.ok).map(i => `${i.label}: ${i.value}`).join('; '));
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, 'GO'])), 'GO');
  check('a GO over a real NO-GO is remembered for the debrief', s.pollMisses.length === 1);
}

console.log('automatic abort on a redline');
{
  const s = new Session({ def, mode: 'independent', seed: 21 });
  const ex = drive(s);
  ex('daqPower', { on: true }); s.run(5); ex('zero'); ex('tare');
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('clearCell'); s.run(7);
  ex('regSet', { value: psi(150) }); s.run(10);
  ex('record', { on: true });
  s.model.element('PR-101').creepCdA = 2.5e-8;       // a regulator seat that will not hold
  let aborted = null;
  for (let k = 0; k < 600 && !aborted; k++) { s.run(0.1); if (s.controller.abort) aborted = s.controller.abort; }
  check('regulator creep trips the PT-201 redline and aborts', !!aborted && aborted.source === 'auto', aborted?.reason);
  s.run(12);
  check('abort sequence completes', s.controller.abort?.complete === true);
  check('abort isolates supply and opens vents', s.controller.cmd['IV-101'] === 0 && s.controller.cmd['VV-201'] === 1 && s.controller.cmd['VV-101'] === 1);
  check('system vents after the abort', ['PT-102', 'PT-201', 'PT-301'].every(id => s.daq.latest(id) < psi(5)),
        ['PT-102', 'PT-201', 'PT-301'].map(id => (s.daq.latest(id) / psi(1)).toFixed(1)).join(' / '));
  check('recording auto-stopped after the abort', s.runs.length === 1 && s.runs[0].aborted);
}

console.log('pulse train');
{
  const s = new Session({ def, mode: 'independent', seed: 13 });
  const ex = drive(s);
  ex('daqPower', { on: true }); s.run(5); ex('zero'); ex('tare'); ex('daqRate', { rate: 2000 });
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('clearCell'); s.run(7);
  ex('regSet', { value: psi(150) }); s.run(12); ex('tare');
  ex('plan', { plan: { mode: 'pulse', on: 0.05, off: 0.2, count: 10 } });
  ex('record', { on: true }); s.run(1);
  ex('arm'); ex('fire'); s.run(12);
  const run = s.runs[0], m = run?.metrics;
  check('ten pulses reduced', m?.kind === 'pulse' && m.pulses.length === 10, m ? `${m.kind}, ${m.pulses?.length}` : 'no metrics');
  const ib = m?.pulses.map(p => p.Ibit) || [];
  const mean = ib.reduce((a, b) => a + b, 0) / (ib.length || 1);
  // a 50 ms pulse is ~40 ms of thrust at ~6 N after the ~6 ms opening delay
  // 50 ms of command ≈ 50 ms of ~6.2 N, less the ~6 ms opening delay, plus
  // the ~9 ms shutdown delay and the chamber blowdown
  check('impulse bit plausible for 50 ms pulses', mean > 0.25 && mean < 0.40, `${(mean * 1e3).toFixed(1)} mN·s`);
  const sd = Math.sqrt(ib.reduce((a, b) => a + (b - mean) ** 2, 0) / (ib.length - 1));
  check('impulse bits repeat within a few percent — but not perfectly', sd / mean < 0.05 && sd / mean > 0.001, `${(100 * sd / mean).toFixed(2)} % (1σ)`);
}

console.log('Level 1 orientation, guided');
{
  const s = new Session({ def, scenario: orientation, mode: 'guided', seed: 2 });
  const ex = drive(s), P = s.procedure;
  ['A1', 'A2', 'A3'].forEach(id => P.confirm(id));
  for (const id of ['N2-K', 'HV-100', 'IV-101', 'PR-101', 'RV-201', 'F-201', 'VV-201', 'SV-301', 'CGT-1', 'LC-501']) s.inspect(id);
  ex('daqPower', { on: true }); s.run(5); P.confirm('B2'); ex('zero');
  ex('daqRate', { rate: 5000 }); s.run(0.5); ex('daqRate', { rate: 1000 });
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: psi(30) }); s.run(5);
  ex('valve', { id: 'VV-201', open: true }); s.run(3); ex('valve', { id: 'VV-201', open: false }); s.run(2);
  ex('regSet', { value: 0 }); ex('valve', { id: 'IV-101', open: false }); s.run(2);
  ex('valve', { id: 'VV-201', open: true }); s.run(5);
  const early = P.confirm('D3');
  check('trapped HP volume is caught by the vented check', !early.ok && /PT-102/.test(early.msg || ''));
  ex('valve', { id: 'VV-101', open: true }); s.run(15);
  P.reopen('D3'); P.confirm('D3'); P.confirm('D4');
  const sum = P.summary();
  check('orientation completes', sum.counts.COMPLETE === sum.total,
        P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => x.id + ':' + P.status(x.id)).join(' '));
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
