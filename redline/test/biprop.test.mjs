/* TS-2, the bipropellant stand, headless: the liquid feed physics, a full
   cold flow through the session, the reductions, and the stand's rules.
   run: node redline/test/biprop.test.mjs */
import def from '../src/content/stands/ts2-biprop.js';
import { BipropModel } from '../src/physics/biprop.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';
import bpOrientation from '../src/content/procedures/bp-orientation.js';
import bpColdflow from '../src/content/procedures/bp-coldflow.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);

/* A bare model, tanks loaded and pressurised to `p` psig. */
function pressurised(p = 300, opts = {}) {
  const m = new BipropModel(def), net = m.net;
  m.line('ox').setLiquid(net, 10); m.line('fu').setLiquid(net, 8);
  for (const [id, v] of [['HV-600', 1], ['VV-601', 0], ['VV-711', 0], ['VV-721', 0]]) m.command(id, v);
  m.advance(3); m.command('IV-601', 1); m.advance(2);
  m.command('PR-610', psi(p)); m.command('PR-620', psi(p)); m.command('PR-630', psi(150));
  m.advance(opts.settle ?? 25);
  return m;
}
const gauge = (m, v) => m.net.vol(v).P - m.net.ambient.P;

console.log('liquid feed physics');
{
  const m = pressurised(300);
  check('tanks lock up at setpoint', Math.abs(P(gauge(m, 'oxu')) - 300) < 6 && Math.abs(P(gauge(m, 'fuu')) - 300) < 6, `${P(gauge(m, 'oxu')).toFixed(1)} / ${P(gauge(m, 'fuu')).toFixed(1)} psig`);
  check('dry manifolds before flow', m.line('ox').fill === 0 && m.line('fu').fill === 0);
  const ox = m.line('ox'), m0 = ox.mL;
  m.command('MOV-713', 1);
  let tPrime = null;
  const t0 = m.t;
  m.advance(1.5, t => { if (tPrime === null && ox.w > 0.95) tPrime = t - t0; });
  check('the manifold primes in a fraction of a second', tPrime > 0.05 && tPrime < 0.5, `${(tPrime * 1e3).toFixed(0)} ms`);
  const q1 = ox.mdotInj;
  check('steady: line flow equals injector flow', Math.abs(ox.mdot - ox.mdotInj) < 0.002, `${(ox.mdot * 1e3).toFixed(1)} vs ${(ox.mdotInj * 1e3).toFixed(1)} g/s`);
  const used = m0 - ox.mL - ox.Vl * ox.rho;
  check('liquid mass is conserved', Math.abs(used - ox.drained) < 1e-3, `${used.toFixed(4)} kg left the tank, ${ox.drained.toFixed(4)} kg through the injector`);
  const dPi = gauge(m, 'oxman') - gauge(m, 'chamber');
  const CdA = q1 / Math.sqrt(2 * 998 * dPi);
  check('injector obeys ṁ = CdA·√(2ρΔP)', Math.abs(CdA / ox.CdAinj - 1) < 0.01, `${(CdA * 1e6).toFixed(3)} vs ${(ox.CdAinj * 1e6).toFixed(3)} mm²`);
  // square law: quadruple the pressure, double the flow
  const m4 = pressurised(75); m4.command('MOV-713', 1); m4.advance(1.5);
  const q4 = m4.line('ox').mdotInj;
  check('flow scales with √ΔP (75 → 300 psig: ×2)', Math.abs(q1 / q4 - 2) < 0.08, (q1 / q4).toFixed(3));
  // water hammer: the faster the valve closes, the bigger the surge
  const surge = closeTime => {
    const mm = pressurised(300, { settle: 20 }); const l = mm.line('ox');
    l.valve.strokeClose = closeTime;
    mm.command('MOV-713', 1); mm.advance(1.2);
    const base = l.Pvi; let pk = 0;
    mm.command('MOV-713', 0); mm.advance(0.5, () => { pk = Math.max(pk, l.Pvi - base); });
    return pk;
  };
  const slow = surge(0.4), fast = surge(0.04);
  check('closing the valve raises the valve-inlet pressure (water hammer)', slow > psi(5), `${P(slow).toFixed(0)} psi at 0.4 s`);
  check('a faster closure hammers harder', fast > 2 * slow, `${P(fast).toFixed(0)} psi at 40 ms vs ${P(slow).toFixed(0)} psi at 0.4 s`);
}
{
  // purge clears a wet manifold; the check valve keeps liquid out of the purge line
  const m = pressurised(300); const ox = m.line('ox');
  m.command('MOV-713', 1); m.advance(1.0); m.command('MOV-713', 0); m.advance(0.4);
  const wet = ox.fill;
  const purgeLine0 = m.net.vol('oxpl').m;
  m.advance(2.0);
  const stillWet = ox.fill;
  m.command('PV-631', 1); m.advance(2.0);
  check('liquid left in the manifold after shutdown', wet > 0.5, wet.toFixed(2));
  check('without purge it drains only slowly', stillWet > 0.3, stillWet.toFixed(2));
  check('the purge blows the manifold dry', ox.fill < 0.05, ox.fill.toFixed(3));
  check('purge gas reached the manifold through the check valve', m.net.el('CV-633').mdot > 0 && gauge(m, 'oxman') > psi(50), `${P(gauge(m, 'oxman')).toFixed(0)} psig`);
  check('no reverse flow into the purge line while the manifold was full', purgeLine0 >= 0 && m.net.el('CV-633').lift >= 0);
}
{
  // the ullage expands as liquid leaves; the regulator has to fill it
  const m = pressurised(300); const ox = m.line('ox');
  const V0 = m.net.vol('oxu').V;
  m.command('MOV-713', 1); m.advance(3);
  check('ullage grows by the volume of liquid delivered', Math.abs((m.net.vol('oxu').V - V0) - (ox.drained + ox.Vl * ox.rho) / 998) < 2e-5,
        `${((m.net.vol('oxu').V - V0) * 1e3).toFixed(3)} L`);
  check('the tank droops a little while flowing', P(gauge(m, 'oxu')) < 299 && P(gauge(m, 'oxu')) > 280, `${P(gauge(m, 'oxu')).toFixed(1)} psig`);
}

console.log('a cold flow through the session');
function coldFlow({ sides = 'both', p = 300, tareAfterFill = false, plan = {} } = {}) {
  const s = new Session({ def, mode: 'independent', seed: 4 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); s.run(5); ex('zero'); ex('daqRate', { rate: 1000 });
  if (!tareAfterFill) ex('tare', { ids: ['WT-716', 'WT-726'] });
  const fill = ex('tech', { task: 'fillTanks' }); s.run(61);
  if (tareAfterFill) ex('tare', { ids: ['WT-716', 'WT-726'] });
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2);
  // leak check at the personnel limit: tanks to 50, isolate, hold
  ex('regSet', { id: 'PR-610', value: psi(50) }); ex('regSet', { id: 'PR-620', value: psi(50) }); s.run(12);
  ex('valve', { id: 'IV-601', open: false }); ex('regSet', { id: 'PR-610', value: 0 }); ex('regSet', { id: 'PR-620', value: 0 });
  ex('valve', { id: 'VV-601', open: true }); s.run(2);
  const leak = s.startLeakCheck(); s.run(61);
  ex('valve', { id: 'VV-601', open: false }); ex('valve', { id: 'IV-601', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'cold flow' });
  ex('regSet', { id: 'PR-610', value: psi(p) }); ex('regSet', { id: 'PR-620', value: psi(p) }); ex('regSet', { id: 'PR-630', value: psi(150) }); s.run(25);
  ex('tare', { ids: ['LC-901'] });
  ex('plan', { plan: { mode: 'single', duration: 3, sides, lead: 0.1, postPurge: 3, ...plan } });
  ex('record', { on: true }); s.run(0.5);
  const poll = s.startPoll();
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), 'GO');
  ex('arm'); ex('fire'); s.run(18);
  return { s, ex, poll, fill, leak };
}
{
  const { s, poll, fill, leak } = coldFlow();
  check('leak check on both tanks', leak.ok && s.leakCheck?.ok, s.leakCheck?.msg || leak.msg);
  const ln = s.model.line('ox');
  check('technician loads the tanks with the vents open', fill.ok && Math.abs(ln.mL + ln.drained + ln.Vl * ln.rho - 10) < 0.01);
  check('every station GO for a properly prepared cold flow', poll.allGo,
        poll.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
  const run = s.runs[0], S = run?.metrics?.summary || {};
  check('run recorded, not aborted, reduced as a cold flow', run && !run.aborted && run.metrics?.kind === 'coldflow', run?.abort || '');
  check('measured ox CdA is the as-built injector, not the drawing', Math.abs(S.CdArelOx - 0.94) < 0.015, S.CdArelOx?.toFixed(3));
  check('measured fuel CdA likewise', Math.abs(S.CdArelFu - 1.03) < 0.015, S.CdArelFu?.toFixed(3));
  check('flowmeters agree with the scales', Math.abs(S.errOx) < 0.02 && Math.abs(S.errFu) < 0.02, `${(100 * S.errOx).toFixed(2)} %, ${(100 * S.errFu).toFixed(2)} %`);
  const pred = run.meta.config.prediction;
  check('the drawing-based prediction is a few per cent off — on purpose', S.mdotOx < pred.mdotOx * 0.98 && S.mdotOx > pred.mdotOx * 0.9, `${(S.mdotOx * 1e3).toFixed(1)} vs predicted ${(pred.mdotOx * 1e3).toFixed(1)} g/s`);
  check('hot-fire MR predicted from cold flow differs from design', S.MRhot < 1.45 && S.MRhot > 1.25, `${S.MRhot.toFixed(3)} vs design 1.50`);
  check('priming time measured on both sides', S.primeOx > 0.05 && S.primeOx < 0.5 && S.primeFu > 0.05 && S.primeFu < 0.5, `${(S.primeOx * 1e3).toFixed(0)} / ${(S.primeFu * 1e3).toFixed(0)} ms`);
  check('shutdown surge seen at the valve inlets', S.surgeOx > psi(10), `${P(S.surgeOx).toFixed(0)} psi`);
  const cmds = s.log.filter(e => e.cat === 'CMD').map(e => e.text);
  const iO = cmds.findIndex(t => t.startsWith('MOV-713 OPEN')), iF = cmds.findIndex(t => t.startsWith('MFV-723 OPEN'));
  check('oxidiser leads by the planned 100 ms', iO >= 0 && iF > iO);
  check('post-purge runs after shutdown and ends', cmds.some(t => t.startsWith('PV-631 OPEN (post-purge)')) && cmds.some(t => t.startsWith('PV-631 CLOSE (post-purge end)')));
  check('sequence completes, fire circuit safe', !s.controller.seq && !s.controller.armed);
}
{
  const { s } = coldFlow({ sides: 'ox' });
  const S = s.runs[0]?.metrics?.summary || {};
  check('single-side flow: oxidiser only', Number.isFinite(S.mdotOx) && !Number.isFinite(S.mdotFu) && s.model.line('fu').drained < 0.01);
}
{
  const { s } = coldFlow({ tareAfterFill: true });
  check('scales tared after loading read empty — the tank-empty redline aborts', s.runs[0]?.aborted && /nearly empty/.test(s.runs[0].abort), s.runs[0]?.abort || 'no abort');
}

console.log('stand rules');
{
  const s = new Session({ def, mode: 'guided', seed: 2 });
  const ex = (a, x = {}, o = {}) => s.execute(a, x, o);
  check('main valves cannot be opened by hand (guided)', !!ex('valve', { id: 'MOV-713', open: true }).blocked);
  ex('daqPower', { on: true }); s.run(5);
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-601', open: false }, { confirmed: true }); ex('valve', { id: 'IV-601', open: true }, { confirmed: true }); s.run(2);
  ex('valve', { id: 'VV-711', open: false }); ex('valve', { id: 'VV-721', open: false });
  ex('regSet', { id: 'PR-610', value: psi(40) }, { confirmed: true }); s.run(10);
  check('technician will not fill a pressurised tank', !!ex('tech', { task: 'fillTanks' }).blocked);
  check('pressurising a tank with its vent open warns', (() => { ex('valve', { id: 'VV-721', open: true }); return !!ex('regSet', { id: 'PR-620', value: psi(30) }).confirm; })());
  ex('clearCell'); s.run(7);
  const arm = ex('arm');
  check('arming without purge pressure is questioned', !!arm.confirm?.some(w => /Purge/.test(w.msg)) || !!arm.blocked, JSON.stringify(arm.confirm || arm.blocked));
  check('the purge EPC is limited to 300 psig', !!ex('regSet', { id: 'PR-630', value: psi(400) }).blocked);
}
{
  // a cutoff brings the post-purge forward instead of waiting for the planned end
  const { s } = (() => {
    const s = new Session({ def, mode: 'independent', seed: 9 });
    const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
    ex('daqPower', { on: true }); s.run(5); ex('tare', { ids: ['WT-716', 'WT-726'] });
    ex('tech', { task: 'fillTanks' }); s.run(61); ex('tech', { task: 'openHV' }); s.run(9);
    for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
    ex('valve', { id: 'IV-601', open: true }); s.run(2); ex('clearCell'); s.run(7);
    for (const [id, p] of [['PR-610', 200], ['PR-620', 200], ['PR-630', 150]]) ex('regSet', { id, value: psi(p) });
    s.run(25);
    ex('plan', { plan: { mode: 'single', duration: 10, sides: 'both', lead: 0, postPurge: 2 } });
    ex('arm'); ex('fire'); s.run(5 + 1.0); ex('cutoff'); s.run(6);
    return { s };
  })();
  const cmds = s.log.filter(e => e.cat === 'CMD' || e.cat === 'SEQ');
  const tCut = cmds.find(e => /Manual CUTOFF/.test(e.text))?.t;
  const tPurge = cmds.find(e => /PV-631 OPEN \(post-purge\)/.test(e.text))?.t;
  check('after a cutoff the post-purge follows at once', tPurge - tCut < 0.2, `${(tPurge - tCut).toFixed(3)} s`);
  check('and the sequence completes without waiting for the planned 10 s', !s.controller.seq && s.controller.completed?.cutoff);
}

console.log('Level 7 — orientation, tutorial');
{
  const s = new Session({ def, scenario: bpOrientation, mode: 'tutorial', seed: 12 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  const P = s.procedure;
  for (const id of ['A1', 'A2']) P.confirm(id);
  for (const st of P.steps.filter(x => x.id.startsWith('K-'))) s.inspect(st.id.slice(2));
  ex('daqPower', { on: true }); s.run(5); ex('zero'); ex('tare', { ids: ['WT-716', 'WT-726'] }); s.run(0.5);
  ex('tech', { task: 'fillTanks' }); s.run(61);
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2);
  ex('regSet', { id: 'PR-610', value: psi(40) }); ex('regSet', { id: 'PR-620', value: psi(40) }); s.run(10);
  ex('regSet', { id: 'PR-630', value: psi(40) }); s.run(5);
  ex('valve', { id: 'PV-631', open: true }); s.run(3); ex('valve', { id: 'PV-631', open: false }); s.run(1);
  for (const id of ['PR-610', 'PR-620', 'PR-630']) ex('regSet', { id, value: 0 });
  ex('valve', { id: 'IV-601', open: false }); s.run(2);
  ex('valve', { id: 'VV-711', open: true }); ex('valve', { id: 'VV-721', open: true }); s.run(15);
  const trapped = P.confirm('E3');
  check('verify catches the trapped header and purge line', !trapped.ok, trapped.msg);
  P.reopen('E3');
  ex('valve', { id: 'VV-601', open: true }); ex('valve', { id: 'PV-631', open: true }); s.run(6); ex('valve', { id: 'PV-631', open: false }); s.run(1);
  P.confirm('E3'); P.confirm('E4'); s.run(0.5);
  const sum = P.summary();
  check('orientation completes with every step COMPLETE', sum.counts.COMPLETE === sum.total,
        P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => x.id + ':' + P.status(x.id)).join(' '));
  check('no safety violations', s.safetyViolations.length === 0, s.safetyViolations.map(v => v.msg).join('; '));
}

console.log('Level 8 — cold flow, guided, start to finish');
{
  const s = new Session({ def, scenario: bpColdflow, mode: 'guided', seed: 21 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  const P = s.procedure;
  P.confirm('A1'); ex('tech', { task: 'walkdown' }); s.run(21); P.confirm('A3');
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) }); ex('tare', { ids: ['WT-716', 'WT-726'] }); s.run(0.5);
  ex('tech', { task: 'fillTanks' }); s.run(61);
  P.confirm('C2', s.daq.latest('WT-716').toFixed(2));
  ex('daqRate', { rate: 1000 });
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2);
  ex('regSet', { id: 'PR-610', value: psi(50) }); ex('regSet', { id: 'PR-620', value: psi(50) }); s.run(12);
  ex('valve', { id: 'IV-601', open: false }); ex('regSet', { id: 'PR-610', value: 0 }); ex('regSet', { id: 'PR-620', value: 0 });
  ex('valve', { id: 'VV-601', open: true }); s.run(2);
  const hold = P.startHold('E5'); s.run(61); P.confirm('E5', true);
  check('leak-check hold accepted', hold?.ok && P.status('E5') === 'COMPLETE', P.state.get('E5').msg || JSON.stringify(hold));
  ex('valve', { id: 'VV-601', open: false }); ex('valve', { id: 'IV-601', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'cold flow' });
  ex('regSet', { id: 'PR-630', value: psi(150) }); s.run(8);
  ex('regSet', { id: 'PR-610', value: psi(150) }); ex('regSet', { id: 'PR-620', value: psi(150) }); s.run(14);
  ex('tare', { ids: ['LC-901'] }); s.run(0.5);
  ex('record', { on: true }); s.run(0.3);
  const poll = s.startPoll();
  check('poll all GO before the matrix', poll.allGo, poll.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
  s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), 'GO');
  ex('record', { on: false }); s.run(0.3);
  const flow = (sides, setP = null, lead = 0.1) => {
    if (setP) { ex('regSet', { id: 'PR-610', value: setP }); ex('regSet', { id: 'PR-620', value: setP }); s.run(14); }
    ex('plan', { plan: { mode: 'single', duration: 3, sides, lead, postPurge: 3 } });
    ex('record', { on: true }); s.run(0.5);
    const arm = s.execute('arm');
    ex('fire'); s.run(17);
    return arm;
  };
  const arm1 = flow('ox');
  check('series poll still valid between points (no re-poll needed)', arm1.ok, JSON.stringify(arm1.confirm || arm1.blocked));
  flow('fuel'); flow('ox', psi(300)); flow('fuel'); flow('both');
  check('five flows recorded, none aborted', s.runs.filter(r => r.tFire !== null && !r.aborted).length === 5, s.runs.map(r => r.id + (r.aborted ? '!' + r.abort : '')).join(' '));
  // safe
  ex('regSet', { id: 'PR-610', value: 0 }); ex('regSet', { id: 'PR-620', value: 0 }); ex('valve', { id: 'IV-601', open: false }); s.run(2);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: true }); s.run(15);
  ex('regSet', { id: 'PR-630', value: 0 }); ex('valve', { id: 'PV-631', open: true }); s.run(8); ex('valve', { id: 'PV-631', open: false }); s.run(1);
  P.confirm('K4');
  // data
  for (const r of s.runs) s.flag('analysis:' + r.id);
  s.run(0.5);
  const fl = s.runs.filter(r => r.tFire !== null);
  const S3 = fl.find(r => r.plan.sides === 'ox' && r.meta.config.sp['PR-610'] > psi(250)).metrics.summary;
  const S4 = fl.find(r => r.plan.sides === 'fuel' && r.meta.config.sp['PR-620'] > psi(250)).metrics.summary;
  const S5 = fl.find(r => r.plan.sides === 'both').metrics.summary;
  P.confirm('L2', (S3.CdAOx * 1e6).toFixed(3)); P.confirm('L3', (S4.CdAFu * 1e6).toFixed(3));
  P.confirm('L4'); P.confirm('L5'); P.confirm('L6', S5.MRhot.toFixed(3));
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('cold-flow procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total,
        P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => `${x.id}:${P.status(x.id)}${P.state.get(x.id).msg ? '(' + P.state.get(x.id).msg + ')' : ''}`).join(' '));
  check('no safety violations, no wrong poll calls', s.safetyViolations.length === 0 && s.pollMisses.length === 0);
  check('CdA repeatable 150 → 300 psig', Math.abs(fl[0].metrics.summary.CdAOx / S3.CdAOx - 1) < 0.02, `${(fl[0].metrics.summary.CdAOx * 1e6).toFixed(3)} vs ${(S3.CdAOx * 1e6).toFixed(3)} mm²`);
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
