/* Every fault, forced one at a time, through the same standard test — and
   a check that each leaves the fingerprint its answer key claims, in the
   MEASURED data. Plus the inspections, the diagnosis scoring and the fault
   lottery. run: node redline/test/faults.test.mjs */
import def from '../src/content/stands/ts1-coldgas.js';
import { FAULTS, FAILURE_MODES, RIGHT_ACTION } from '../src/content/faults/ts1-faults.js';
import { Session } from '../src/sim/session.js';
import { scoreDiagnosis } from '../src/faults/diagnosis.js';
import { psi } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);

/* A standard 3 s firing at 150 psig in independent rules, with measurements
   taken along the way the way an operator would read them. */
function standardTest(fault, seed = 7) {
  const s = new Session({ def, mode: 'independent', seed, fault });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  const m = { fault };
  ex('daqPower', { on: true }); s.run(5); ex('zero'); ex('tare'); ex('daqRate', { rate: 2000 }); s.run(0.5);
  ex('shunt', { on: true }); s.run(0.5); m.shunt = s.daq.latest('LC-501'); ex('shunt', { on: false }); s.run(0.5);
  ex('tech', { task: 'openHV' }); s.run(9);
  m.supply = s.daq.latest('PT-101');
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false });
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: psi(50) }); s.run(6);
  ex('valve', { id: 'IV-101', open: false }); ex('regSet', { value: 0 }); s.run(25);
  m.leak = s.daq.store.stats('PT-301', 15)?.slope * 60 / psi(1);      // psi/min, after settling
  ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('clearCell'); s.run(7);
  ex('regSet', { value: psi(150) }); s.run(12);
  ex('tare'); s.run(3);
  const st = id => s.daq.store.stats(id, 2);
  m.lock201 = st('PT-201').mean; m.lock301 = st('PT-301').mean; m.pc0 = st('PT-401').mean;
  m.slope201 = st('PT-201').slope; m.sd401 = st('PT-401').std; m.sd301 = st('PT-301').std;
  m.tc301 = s.daq.latest('TC-301');
  ex('record', { on: true }); s.run(1);
  ex('arm'); ex('fire');
  let iPk = 0, min201 = Infinity, ptGap = 0, zsoBurn = 0;
  for (let k = 0; k < 400; k++) {
    s.run(0.025);
    const q = s.controller.seq;
    if (q && q.state === 'BURN' && s.t - q.tFire > 0.5) min201 = Math.min(min201, s.daq.latest('PT-201'));
    if (q && q.state === 'BURN' && s.t - q.tFire > 0.1) {
      ptGap = Math.max(ptGap, s.daq.latest('PT-101') - s.daq.latest('PT-102'));
      zsoBurn = Math.max(zsoBurn, s.daq.latest('IV-101-ZSO'));
    }
    iPk = Math.max(iPk, s.daq.latest('SV-301-I') || 0);
  }
  s.run(6);
  m.iPk = iPk; m.min201 = min201; m.ptGap = ptGap; m.zsoBurn = zsoBurn;
  m.run = s.runs[0]; m.sum = m.run?.metrics?.summary || {};
  m.aborted = !!s.controller.abort || s.log.has(e => e.cat === 'ABT');
  m.alarms = s.log.filter(e => e.cat === 'ALM').map(e => e.alarm);
  m.lcAfter = s.daq.latest('LC-501');
  m.pred = s.prediction;
  m.s = s;
  return m;
}

const SIG = {
  'reg-set': m => [Math.abs(P(m.lock201) - 150) > 15 && Math.abs(P(m.lock201 - m.lock301)) < 1.5, `lock-up ${P(m.lock201).toFixed(1)} / ${P(m.lock301).toFixed(1)} psig`],
  'reg-droop': m => [P(m.sum.droop) > 14, `droop ${P(m.sum.droop).toFixed(1)} psi`],
  'reg-creep': m => [P(m.slope201) * 60 > 30 || m.aborted, `outlet rising ${(P(m.slope201) * 60).toFixed(0)} psi/min at lock-up${m.aborted ? ', aborted' : ''}`],
  'reg-stuck': m => [m.aborted && P(m.min201) < 110, `aborted ${m.aborted}, PT-201 fell to ${P(m.min201).toFixed(0)}`],
  'supply-low': m => [P(m.supply) < 700 && P(m.min201) < 140, `supply ${P(m.supply).toFixed(0)}, PT-201 in burn ${P(m.min201).toFixed(0)}`],
  'iv-partial': m => [P(m.ptGap) > 200 && m.zsoBurn === 1, `PT-101 − PT-102 in burn ${P(m.ptGap).toFixed(0)} psi, ZSO=${m.zsoBurn}${m.aborted ? ', aborted ' + m.alarms.join(',') : ''}`],
  'filter-blocked': m => [P(m.sum.Preg - m.sum.Pin) > 15 && Math.abs(P(m.lock201 - m.lock301)) < 1.5, `ΔP filter in flow ${P(m.sum.Preg - m.sum.Pin).toFixed(1)} psi, static ${P(m.lock201 - m.lock301).toFixed(2)}`],
  'line-kink': m => [P(m.sum.Preg - m.sum.Pin) > 12, `ΔP filter+line ${P(m.sum.Preg - m.sum.Pin).toFixed(1)} psi`],
  'fitting-leak': m => [m.leak < -1.0, `leak check ${m.leak.toFixed(2)} psi/min`],
  'sv-slow': m => [m.sum.rise > 0.005, `Pc rise ${(m.sum.rise * 1e3).toFixed(1)} ms`],
  'sv-partial': m => [P(m.sum.Pin - m.sum.Pc) > 20, `valve ΔP ${P(m.sum.Pin - m.sum.Pc).toFixed(1)} psi`],
  'sv-stuck': m => [m.aborted && m.iPk > 1.0 && !(m.sum.Pc > psi(20)), `aborted, coil current peak ${m.iPk.toFixed(2)} A`],
  'sv-coil': m => [m.aborted && m.iPk < 0.05, `aborted, coil current peak ${m.iPk.toFixed(3)} A`],
  'sv-seat-leak': m => [P(m.pc0) > 2, `PT-401 behind a closed valve ${P(m.pc0).toFixed(1)} psig`],
  'wrong-nozzle': m => [Math.abs(m.sum.dThroat * 1e3 - 2.20) < 0.05, `effective throat ${(m.sum.dThroat * 1e3).toFixed(3)} mm`],
  'throat-eroded': m => [m.sum.dThroat * 1e3 > 2.65, `effective throat ${(m.sum.dThroat * 1e3).toFixed(3)} mm`],
  'nozzle-blocked': m => [m.sum.dThroat * 1e3 < 2.35, `effective throat ${(m.sum.dThroat * 1e3).toFixed(3)} mm`],
  'pt301-bias': m => [Math.abs(P(m.lock201 - m.lock301)) > 5, `static PT-201 − PT-301 ${P(m.lock201 - m.lock301).toFixed(1)} psi`],
  'pt401-bias': m => [m.sum.dThroat * 1e3 > 2.6 && Math.abs(m.sum.F / m.pred.F - 1) < 0.05, `throat "looks" ${(m.sum.dThroat * 1e3).toFixed(2)} mm, thrust ${(100 * (m.sum.F / m.pred.F - 1)).toFixed(1)} %`],
  'pt201-fail': m => [m.aborted && m.alarms.includes('PT201-RL'), `aborted on ${m.alarms.join(',')}`],
  'tc301-fail': m => [m.tc301 > 1273 && m.sum.mdot < 0.6 * m.sum.mdotFM, `TC-301 ${(m.tc301 - 273).toFixed(0)} °C, MDOT-C ${(m.sum.mdot * 1e3).toFixed(1)} vs FT ${(m.sum.mdotFM * 1e3).toFixed(1)} g/s`],
  'lc-cal': m => [m.shunt > 26.5, `shunt cal ${m.shunt.toFixed(2)} N`],
  'lc-sens': m => [m.sum.F < 0.93 * m.pred.F && Math.abs(m.sum.Pc / m.pred.Pc - 1) < 0.03 && Math.abs(m.shunt - 25) < 0.2, `F ${(100 * (m.sum.F / m.pred.F - 1)).toFixed(1)} %, Pc ${(100 * (m.sum.Pc / m.pred.Pc - 1)).toFixed(1)} %, shunt ${m.shunt.toFixed(2)}`],
  'lc-drift': m => [m.lcAfter < -0.25, `LC-501 after the burn ${m.lcAfter.toFixed(2)} N`],
  'pt401-noise': m => [m.sd401 > 5 * m.sd301, `PT-401 σ at rest ${P(m.sd401).toFixed(2)} vs PT-301 ${P(m.sd301).toFixed(3)} psi`],
  'lc-intermittent': m => [m.alarms.includes('DAQ-LC-501'), `alarms ${[...new Set(m.alarms)].join(',')}`],
};

console.log('nominal baseline');
const nom = standardTest(null);
check('nominal: no alarms, no abort', !nom.aborted && nom.alarms.length === 0, nom.alarms.join(','));
check('nominal: leak check holds', nom.leak > -1, `${nom.leak.toFixed(2)} psi/min`);
check('nominal: effective throat 2.50 mm', Math.abs(nom.sum.dThroat * 1e3 - 2.5) < 0.02);

console.log('every fault leaves its fingerprint in the measured data');
for (const f of FAULTS) {
  const sig = SIG[f.id];
  if (!sig) { check(`${f.id}: has a signature test`, false); continue; }
  const m = standardTest(f.id);
  const [ok, detail] = sig(m);
  check(`${f.id} (${f.component}, ${f.mode})`, ok, detail);
}

console.log('inspections read the hardware');
{
  const run = (fault, ids, openAt = 0) => {
    const s = new Session({ def, mode: 'independent', seed: 3, fault });
    const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
    ex('daqPower', { on: true }); s.run(5);
    const out = {};
    for (const id of ids) { const r = ex('inspection', { id }); out[id] = r; s.run(130); }
    for (const r of s.inspections) out[r.id] = r;
    return out;
  };
  const e = run('throat-eroded', ['measure-throat', 'visual-nozzle']);
  const d = parseFloat(e['measure-throat'].lines[0][1]);
  check('eroded throat measures large with pin gauges', d > 2.65, e['measure-throat'].lines[0][1]);
  const n = run(null, ['measure-throat', 'check-valve', 'continuity']);
  check('nominal throat measures 2.50 mm', /2\.50 mm/.test(n['measure-throat'].lines[0][1]), n['measure-throat'].lines[0][1]);
  check('nominal coil ≈ 24 Ω', /^2[34]\.\d Ω$/.test(n['check-valve'].lines[0][1]), n['check-valve'].lines[0][1]);
  const c = run('sv-coil', ['continuity']);
  check('open coil found by the continuity check', c['continuity'].lines.some(l => /SV-301/.test(l[0]) && /^OPEN/.test(l[1])));
  const w = run('lc-sens', ['deadweight-lc']);
  check('dead weights reveal the load-path loss', parseFloat(w['deadweight-lc'].lines[2][1]) < 9.2, w['deadweight-lc'].lines[2][1]);
  // a pressurised system is not opened
  const s = new Session({ def, mode: 'independent', seed: 3 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); s.run(5); ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-101', open: false }); ex('valve', { id: 'VV-201', open: false }); ex('valve', { id: 'IV-101', open: true }); s.run(2);
  ex('regSet', { value: psi(40) }); s.run(6);
  const r = ex('inspection', { id: 'measure-throat' });
  check('technician refuses to open a pressurised system', !!r.blocked && /pressurised/.test(r.blocked.msg), r.blocked?.msg);
  check('the cell must be open for hands-on work', (() => { ex('clearCell'); s.run(7); return !!ex('inspection', { id: 'electrical' }).blocked; })());
}

console.log('diagnosis scoring and the fault lottery');
{
  const f = FAULTS.find(x => x.id === 'filter-blocked');
  const opts = { modes: FAILURE_MODES, rightAction: RIGHT_ACTION };
  const full = scoreDiagnosis({ component: 'F-201', mode: 'restricted', evidence: ['DP-F201', 'PT-201', 'inspect-filter'], action: 'repair' }, f, opts);
  check('correct diagnosis with the key evidence scores 100', full.score === 100, String(full.score));
  const part = scoreDiagnosis({ component: 'SV-301', mode: 'not-open', evidence: ['PT-401'], action: 'repair' }, f, opts);
  check('wrong component, right family scores partially', part.score > 10 && part.score < 50, String(part.score));
  const none = scoreDiagnosis({ component: 'NONE', mode: 'none', evidence: ['PT-201', 'leak-check', 'prediction'], action: 'continue' }, null, opts);
  check('"no fault" on a nominal stand scores full marks', none.score >= 85, String(none.score));
  const miss = scoreDiagnosis({ component: 'NONE', mode: 'none', evidence: [], action: 'continue' }, f, opts);
  check('"no fault" on a faulty stand scores low', miss.score < 20, String(miss.score));
  let nominal = 0;
  for (let seed = 1; seed <= 300; seed++) if (!new Session({ def, mode: 'fault', seed }).faults.active) nominal++;
  check('about one fault session in five has no fault', nominal > 35 && nominal < 90, `${nominal}/300`);
  const ids = new Set();
  for (let seed = 1; seed <= 400; seed++) { const a = new Session({ def, mode: 'fault', seed }).faults.active; if (a) ids.add(a.id); }
  check('every fault can be drawn', ids.size === FAULTS.length, `${ids.size}/${FAULTS.length}`);
  const g = new Session({ def, mode: 'guided', seed: 5 });
  check('no faults outside fault sessions', !g.faults.active);
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
