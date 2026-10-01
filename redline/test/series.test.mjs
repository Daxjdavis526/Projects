/* Headless checks for the test-series levels: Level 3 (pressure
   characterisation) and Level 4 (pulse testing), driven start to finish in
   guided mode through the same API the UI uses, plus the campaign
   arithmetic. run: node redline/test/series.test.mjs */
import def from '../src/content/stands/ts1-coldgas.js';
import pressureChar from '../src/content/procedures/cg-pressure-char.js';
import pulse from '../src/content/procedures/cg-pulse.js';
import { Session } from '../src/sim/session.js';
import { linfit, stats, value } from '../src/analysis/campaign.js';
import { psi, fromDisplay } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

console.log('campaign arithmetic');
{
  const f = linfit([1, 2, 3, 4], [3.1, 4.9, 7.0, 9.1]);
  check('least-squares slope and intercept', Math.abs(f.a - 2.0) < 0.05 && Math.abs(f.b - 1.0) < 0.15, `${f.a.toFixed(3)}, ${f.b.toFixed(3)}`);
  check('R² and standard errors defined', f.r2 > 0.99 && f.sa > 0 && f.sb > 0);
  const exact = linfit([0, 1, 2], [1, 3, 5]);
  check('exact line: zero residual, R² = 1', exact.se < 1e-12 && exact.r2 === 1);
  const st = stats([10, 10.2, 9.8, 10.1, 9.9]);
  check('mean, σ, CV', Math.abs(st.mean - 10) < 1e-9 && Math.abs(st.sd - 0.1581) < 1e-3 && Math.abs(st.cv - 0.01581) < 1e-4);
}

/* Everything up to "pressurised at the first point and re-tared". */
function prepare(s, rate) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  const P = s.procedure;
  P.confirm('A1'); ex('tech', { task: 'walkdown' }); s.run(21); P.confirm('A3');
  ex('daqPower', { on: true }); s.run(5); P.confirm('B2'); P.confirm('B3');
  ex('zero'); ex('tare'); s.run(1);
  ex('shunt', { on: true }); s.run(0.5); P.confirm('C3', s.daq.latest('LC-501').toFixed(2));
  ex('shunt', { on: false }); s.run(0.5);
  ex('daqRate', { rate }); s.run(0.5);
  ex('tech', { task: 'openHV' }); s.run(9); P.confirm('E2', (s.daq.latest('PT-101') / psi(1)).toFixed(0));
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: psi(50) }); s.run(6);
  ex('valve', { id: 'IV-101', open: false }); ex('regSet', { value: 0 }); s.run(3);
  P.startHold('E6'); s.run(61); P.confirm('E6', true);
  ex('clearCell'); s.run(7); ex('pa', { text: 'TS-1 hazardous' });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: s.request.regSet }); s.run(s.request.regSet / psi(25) + 6);
  P.confirm('G3'); ex('tare'); s.run(0.5);
  return ex;
}

function fireAt(s, ex, regSet, plan, first) {
  if (!first) {
    ex('regSet', { value: regSet }); s.run(Math.abs(regSet - s.daq.latest('EPC-101')) / psi(25) + 6);
    if (s.daq.latest('PT-201') > regSet + psi(3)) {
      // non-relieving regulator: bleed the feed down through VV-201
      ex('valve', { id: 'VV-201', open: true });
      for (let k = 0; k < 400 && s.daq.latest('PT-201') > regSet + psi(2); k++) s.run(0.05);
      ex('valve', { id: 'VV-201', open: false }); s.run(3);
    }
    ex('tare'); s.run(0.5);
  }
  ex('plan', { plan });
  if (!s.daq.recording) ex('record', { on: true });
  s.run(1);
  if (!s.controller.pollGo) {         // e.g. after a vent was operated: poll again
    s.alarms.ackAll();                // the outlet-above-setpoint caution during bleed-down is expected
    const poll = s.startPoll();
    s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, 'GO'])), 'GO');
    s.run(0.3);
  }
  const arm = s.execute('arm', {}, { confirmed: false });
  ex('fire'); s.run((plan.mode === 'pulse' ? plan.count * (plan.on + plan.off) : plan.duration) + 9);
  return arm;
}

function safeAndClose(s, ex, sec) {
  const P = s.procedure;
  ex('regSet', { value: 0 }); ex('valve', { id: 'IV-101', open: false }); s.run(1.5);
  ex('valve', { id: 'VV-201', open: true }); ex('valve', { id: 'VV-101', open: true }); s.run(12);
  P.confirm(sec.safe + '4');
  ex('enterCell'); ex('tech', { task: 'closeHV' }); s.run(8);
  ex('valve', { id: 'IV-101', open: true }); s.run(8); ex('valve', { id: 'IV-101', open: false }); s.run(2);
  ex('tech', { task: 'inspect' }); s.run(27);
  s.flag('report:' + s.runs[0].id); s.run(0.5);
}

function report(s, label) {
  const P = s.procedure, sum = P.summary();
  const bad = P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => `${x.id}:${P.status(x.id)}${P.state.get(x.id).msg ? '(' + P.state.get(x.id).msg + ')' : ''}`);
  check(`${label}: every step COMPLETE`, sum.counts.COMPLETE === sum.total, bad.join(' '));
  check(`${label}: no safety violations, no wrong poll calls`, s.safetyViolations.length === 0 && s.pollMisses.length === 0,
        s.polls.map(p => p.stations.filter(x => !x.go).map(x => x.id + ':' + x.items.filter(i => !i.ok).map(i => i.label + '=' + i.value).join('/')).join(';')).join(' | '));
}

console.log('Level 3 — pressure characterisation, guided');
{
  const s = new Session({ def, scenario: pressureChar, mode: 'guided', seed: 31 });
  const ex = prepare(s, 1000);
  const P = s.procedure;
  const matrix = s.request.matrix;
  let firstArm = null, laterArms = [];
  matrix.forEach((p, i) => {
    if (i === 0) {
      ex('plan', { plan: { mode: 'single', duration: 2.0 } }); ex('record', { on: true }); s.run(0.5);
      const poll = s.startPoll();
      check('series poll: all stations GO', poll.allGo, poll.stations.filter(x => !x.go).map(x => x.name + ':' + x.items.filter(i => !i.ok).map(i => i.label).join('/')).join(' '));
      s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, 'GO'])), 'GO');
      firstArm = fireAt(s, ex, p, { mode: 'single', duration: 2.0 }, true);
    } else laterArms.push(fireAt(s, ex, p, { mode: 'single', duration: 2.0 }, false));
    P.confirm(String.fromCharCode(73 + i) + '4');
  });
  check('one poll covers every point of the matrix (no re-poll warning)', firstArm.ok && laterArms.every(a => a.ok), JSON.stringify(laterArms.find(a => !a.ok) || {}));
  check('four clean runs', s.runs.filter(r => !r.aborted && r.metrics).length === 4);
  const runs = s.runs;
  const f = linfit(runs.map(r => value(r, 'PcAbs')), runs.map(r => value(r, 'F')));
  const Ae = Math.PI / 4 * 0.00355 ** 2;
  check('thrust vs absolute Pc is linear (R² > 0.999)', f.r2 > 0.999, f.r2.toFixed(6));
  check('intercept ≈ −Pa·Ae (within 10 %)', Math.abs(f.b / (-def.physics.ambient.P * Ae) - 1) < 0.10, `${f.b.toFixed(3)} N vs ${(-def.physics.ambient.P * Ae).toFixed(3)} N`);
  const dT = runs.map(r => value(r, 'dThroat'));
  check('effective throat from FT-201 ≈ 2.50 mm at every point', dT.every(d => Math.abs(d * 1e3 - 2.5) < 0.02), dT.map(d => (d * 1e3).toFixed(3)).join(' '));
  const droop = runs.map(r => value(r, 'droop') / psi(1));
  check('regulator droop grows with setpoint', droop[3] > droop[0], droop.map(d => d.toFixed(2)).join(' → ') + ' psi');
  s.flag('campaign'); s.run(0.5);
  P.confirm('M2', (f.a * fromDisplay(1, 'pressure')).toPrecision(5));
  P.confirm('M3', f.b.toFixed(3));
  P.confirm('M4', (Math.sqrt(4 * -f.b / (Math.PI * def.physics.ambient.P)) * 1e3).toFixed(3));
  P.confirm('M5', (dT.reduce((a, b) => a + b, 0) / dT.length * 1e3).toFixed(3));
  P.confirm('M6'); P.confirm('M7');
  safeAndClose(s, ex, { safe: 'N' });
  report(s, 'Level 3');
}

console.log('Level 4 — pulse testing, guided');
{
  const s = new Session({ def, scenario: pulse, mode: 'guided', seed: 41 });
  const ex = prepare(s, 5000);
  const P = s.procedure;
  ex('plan', { plan: { mode: 'single', duration: 0.5 } }); ex('record', { on: true }); s.run(0.5);
  const poll = s.startPoll();
  check('series poll: all stations GO', poll.allGo);
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, 'GO'])), 'GO');
  fireAt(s, ex, psi(150), { mode: 'single', duration: 0.5 }, true);
  const hi = s.runs[0].metrics.summary.delay;
  ex('regSet', { value: psi(60) }); s.run(9);
  check('non-relieving regulator: lowering the setpoint leaves the feed high', s.daq.latest('PT-201') > psi(140), (s.daq.latest('PT-201') / psi(1)).toFixed(1) + ' psig');
  P.confirm('I2', (hi * 1e3).toFixed(2));
  fireAt(s, ex, psi(60), { mode: 'single', duration: 0.5 }, false);
  const lo = s.runs[1].metrics.summary.delay;
  P.confirm('I5', (lo * 1e3).toFixed(2));
  check('valve opens later at higher inlet pressure (≈1 ms)', hi > lo + 0.0007, `${(hi * 1e3).toFixed(2)} ms @150 vs ${(lo * 1e3).toFixed(2)} ms @60`);
  P.confirm('I6');
  ex('regSet', { value: psi(150) }); s.run(8); ex('tare'); s.run(0.5);
  const widths = [0.020, 0.010, 0.006, 0.005];
  for (const w of widths) fireAt(s, ex, psi(150), { mode: 'pulse', on: w, off: 0.2, count: 10 }, true);
  const trains = s.runs.slice(2);
  const ib = trains.map(r => r.metrics.summary.Ibit);
  check('impulse bit falls with width', ib[0] > ib[1] && ib[1] > ib[2] && ib[2] > ib[3], ib.map(x => (x * 1e3).toFixed(1)).join(' > ') + ' mN·s');
  check('long pulses reach steady chamber pressure', trains[0].metrics.summary.steady === 10 && trains[1].metrics.summary.steady === 10);
  check('the shortest pulse does not open the valve', trains[3].metrics.summary.fired === 0, `${trains[3].metrics.summary.fired}/10 fired`);
  // scatter grows as the pulse shortens: the valve's timing jitter is a larger share of a shorter pulse
  check('impulse-bit scatter grows as pulses shorten, and stays under 10 %', trains.slice(0, 3).every(r => r.metrics.summary.IbitCv < 0.10) && trains[2].metrics.summary.IbitCv > trains[0].metrics.summary.IbitCv,
        trains.slice(0, 3).map(r => (r.metrics.summary.IbitCv * 100).toFixed(2) + '%').join(' '));
  s.flag('campaign'); s.run(0.5);
  P.confirm('K2', (ib[0] * 1e3).toFixed(1));
  P.confirm('K3', (trains[0].metrics.summary.IbitCv * 100).toFixed(2));
  P.confirm('K4', '6'); P.confirm('K5');
  safeAndClose(s, ex, { safe: 'L' });
  report(s, 'Level 4');
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
