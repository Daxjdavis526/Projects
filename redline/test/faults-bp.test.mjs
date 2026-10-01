/* TS-2's faults, forced one at a time through the same standard hot fire,
   and a check that each leaves the fingerprint its answer key claims in the
   MEASURED data. Plus TS-2's inspections and diagnosis vocabulary.
   run: node redline/test/faults-bp.test.mjs */
import def from '../src/content/stands/ts2-biprop.js';
import { FAULTS, DIAGNOSIS } from '../src/content/faults/ts2-faults.js';
import { Session } from '../src/sim/session.js';
import { scoreDiagnosis } from '../src/faults/diagnosis.js';
import { edges, meanIn } from '../src/analysis/metrics.js';
import { psi, degC } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);
const f2 = x => (Number.isFinite(x) ? x.toFixed(3) : String(x));

/* The standard hot fire: propellants, meters set, 400/400 psig, 2 s, zero
   lead — with the readings an operator takes on the way. */
function standardHot(fault, seed = 11) {
  const s = new Session({ def, mode: 'independent', seed, fault });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  const m = { fault };
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-716', 'WT-726'] }); ex('daqRate', { rate: 2000 });
  ex('tech', { task: 'loadPropellants' }); s.run(121);
  ex('meterCal', { line: 'ox', fluid: 'OX-1' }); ex('meterCal', { line: 'fu', fluid: 'FU-1' });
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2); ex('clearCell'); s.run(7);
  ex('regSet', { id: 'PR-630', value: psi(150) }); ex('regSet', { id: 'PR-610', value: psi(400) }); ex('regSet', { id: 'PR-620', value: psi(400) });
  s.run(30);
  ex('tare', { ids: ['LC-901'] }); s.run(2);
  const st = id => s.daq.store.stats(id, 1.5);
  m.lock710 = st('PT-710').mean; m.lock720 = st('PT-720').mean; m.epc620 = st('EPC-620').mean; m.pc0 = st('PT-801').mean;
  ex('plan', { plan: { mode: 'hot', duration: 2, lead: 0, ignLead: 0.5, ignOff: 1.0, ignCheck: 0.5, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3 } });
  ex('record', { on: true }); s.run(0.5);
  ex('arm'); ex('fire');
  s.run(4.8);                                     // to T−0.2: igniter on, valves shut
  m.ignI = s.daq.latest('IGN-I'); m.od0 = s.daq.latest('OD-804');
  s.run(12);
  ex('record', { on: false });
  const run = s.runs[s.runs.length - 1];
  m.run = run; m.S = run.metrics?.summary || {}; m.M = run.metrics;
  m.abort = run.abort || '';
  const T = run.data.T, ch = id => run.data.series(id);
  const zo = edges(T, ch('MOV-713-ZSO')).on[0], zf = edges(T, ch('MFV-723-ZSO')).on[0];
  m.zsoLag = zf - zo;
  const tF = run.tFire;
  m.tc802 = Math.max(...Array.from(ch('TC-802')).filter(Number.isFinite));
  m.pt710run = meanIn(T, ch('PT-710'), tF + 1.0, tF + 1.9);
  m.s = s;
  return m;
}

const base = standardHot(null);
const B = base.S;
console.log('baseline (no fault)');
check('the standard hot fire runs clean', !base.run.aborted && B.start === 'smooth', base.abort || `overshoot ${(B.overshoot * 100).toFixed(0)} %`);
check('igniter draws current before T-0 and the flame detector sees the spark', base.ignI > 1.5 && base.od0 > 0.4, `${base.ignI.toFixed(2)} A, ${base.od0.toFixed(2)} V`);
check('main valves reach open together', Math.abs(base.zsoLag) < 0.05, `${(base.zsoLag * 1e3).toFixed(0)} ms`);

const R = {};
for (const f of FAULTS) R[f.id] = standardHot(f.id);
console.log('fingerprints in the measured data');
const r = id => R[id], S = id => R[id].S;

check('ign-nospark: current normal, flame detector dark, no ignition', r('ign-nospark').ignI > 1.5 && r('ign-nospark').od0 < 0.3 && /no ignition/.test(r('ign-nospark').abort),
  `${r('ign-nospark').ignI.toFixed(2)} A, ${r('ign-nospark').od0.toFixed(2)} V, ${r('ign-nospark').abort}`);
check('ign-open: no exciter current before T-0, no ignition', r('ign-open').ignI < 0.2 && /no ignition/.test(r('ign-open').abort), `${r('ign-open').ignI.toFixed(2)} A`);
check('ign-weak: a hard start, later flame than baseline', S('ign-weak').start === 'hard' && S('ign-weak').ignDelay > B.ignDelay + 0.03,
  `${(S('ign-weak').ignDelay * 1e3).toFixed(0)} vs ${(B.ignDelay * 1e3).toFixed(0)} ms, ${r('ign-weak').abort}`);
check('ox-inj-blocked: less ox flow at higher ox manifold pressure, MR down', S('ox-inj-blocked').mdotOx < 0.93 * B.mdotOx && S('ox-inj-blocked').dPOx > B.dPOx && S('ox-inj-blocked').MR < 0.92 * B.MR,
  `ṁox ${f2(S('ox-inj-blocked').mdotOx)} vs ${f2(B.mdotOx)}, ΔP ${P(S('ox-inj-blocked').dPOx).toFixed(0)} vs ${P(B.dPOx).toFixed(0)} psi, MR ${f2(S('ox-inj-blocked').MR)}`);
check('fu-inj-eroded: more fuel, softer fuel injector, MR down', S('fu-inj-eroded').mdotFu > 1.15 * B.mdotFu && S('fu-inj-eroded').stiffFu < 0.75 * B.stiffFu && S('fu-inj-eroded').MR < 0.88 * B.MR,
  `ṁfu ${f2(S('fu-inj-eroded').mdotFu)}, stiffness ${f2(S('fu-inj-eroded').stiffFu)} vs ${f2(B.stiffFu)}`);
check('hf-instability: vibration redline mid-burn', /vibration/.test(r('hf-instability').abort), r('hf-instability').abort);
check('film-loss: throat hotter at shutdown, flows unchanged', S('film-loss').TthShut - 293 > 1.25 * (B.TthShut - 293) && Math.abs(S('film-loss').mdotOx / B.mdotOx - 1) < 0.02,
  `${(S('film-loss').TthShut - 273).toFixed(0)} vs ${(B.TthShut - 273).toFixed(0)} °C`);
check('ox-reg-droop: ox tank sags in flow, MR down', base.pt710run - r('ox-reg-droop').pt710run > psi(10) && S('ox-reg-droop').MR < 0.97 * B.MR,
  `PT-710 flowing ${P(r('ox-reg-droop').pt710run).toFixed(0)} vs ${P(base.pt710run).toFixed(0)} psig`);
check('pr620-set: fuel tank locks up off setpoint, EPC at setpoint', Math.abs(r('pr620-set').lock720 - psi(400)) > psi(20) && Math.abs(r('pr620-set').epc620 - psi(400)) < psi(5),
  `PT-720 ${P(r('pr620-set').lock720).toFixed(0)} psig, EPC-620 ${P(r('pr620-set').epc620).toFixed(0)}`);
check('mfv-slow: fuel valve open switch late, start not smooth', r('mfv-slow').zsoLag > 0.3 && S('mfv-slow').start !== 'smooth',
  `ZSO lag ${(r('mfv-slow').zsoLag * 1e3).toFixed(0)} ms, ${S('mfv-slow').start}, ${r('mfv-slow').abort || 'no abort'}`);
check('ft724-kfactor: fuel meter disagrees with the scale, ox does not', Math.abs(S('ft724-kfactor').mdotFu / S('ft724-kfactor').mdotWFu - 1) > 0.08 && Math.abs(S('ft724-kfactor').mdotOx / S('ft724-kfactor').mdotWOx - 1) < 0.02,
  `fuel meter/scale ${f2(S('ft724-kfactor').mdotFu / S('ft724-kfactor').mdotWFu)}`);
check('pt801-bias: PT-801 reads pressure in an open chamber; c* efficiency inflated', r('pt801-bias').pc0 > psi(15) && S('pt801-bias').etaCstar > B.etaCstar + 0.05,
  `${P(r('pt801-bias').pc0).toFixed(1)} psig at rest, η ${f2(S('pt801-bias').etaCstar)} vs ${f2(B.etaCstar)}`);
check('tc803-open: throat redline with TC-802 still cool', /throat/.test(r('tc803-open').abort) && r('tc803-open').tc802 < degC(200),
  `${r('tc803-open').abort}; TC-802 peak ${(r('tc803-open').tc802 - 273).toFixed(0)} °C`);

console.log('inspections');
{
  const m = R['ox-inj-blocked'], s = m.s, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  // after the run: the stand is still loaded and pressurised
  const blocked = ex('inspection', { id: 'inspect-injector' });
  check('no injector inspection with propellants loaded / cell secured', !blocked.ok, blocked.blocked?.msg);
  const ov = s.faults.inspectOverride('inspect-injector');
  check('the injector inspection finds the plugged orifices', ov && /plugged/.test(ov.lines[0][1]), ov?.lines[0][1]);
  const fb = def.inspections.find(i => i.id === 'flow-bench').run(s);
  check('the flow bench measures the reduced oxidiser CdA', parseFloat(fb.lines[0][1]) < 0.9 * def.design.CdAox * 1e6, fb.lines[0][1]);
}
{
  const s = R['ign-nospark'].s;
  const sp = def.inspections.find(i => i.id === 'spark-check').run(s);
  check('spark check: current normal, no spark', /none/.test(sp.lines[1][1]) && !/0\.0 A/.test(sp.lines[0][1]), sp.lines.map(l => l[1]).join(' / '));
}
{
  const ch = def.inspections.find(i => i.id === 'inspect-chamber').run(R['hf-instability'].s);
  check('the chamber borescope shows the screech damage', /erosion/.test(ch.lines[0][1]), ch.lines[0][1]);
  const ok = def.inspections.find(i => i.id === 'inspect-chamber').run(base.s);
  check('…and a nominal chamber shows an even heat tint', /tint/.test(ok.lines[0][1]) && !/erosion/.test(ok.lines[0][1]), ok.lines[0][1]);
}

console.log('diagnosis vocabulary');
for (const f of FAULTS) {
  const modeOk = DIAGNOSIS.modes.some(m => m[0] === f.mode);
  const actOk = (DIAGNOSIS.rightAction[f.mode] || []).length > 0;
  const comp = def.components[f.component] || def.sensors.find(x => x.id === f.component);
  if (!modeOk || !actOk || !comp) check(`${f.id}: mode, action and component exist`, false, `${f.mode} ${f.component}`);
}
check('every fault\'s mode, action and component exist in the stand', true);
{
  const f = FAULTS.find(x => x.id === 'fu-inj-eroded');
  const sc = scoreDiagnosis({ component: 'BPE-1', mode: 'eroded', evidence: ['FT-724', 'CDA-FU', 'stiffness'], action: 'repair' }, f, DIAGNOSIS);
  check('a right diagnosis scores 100', sc.score === 100, `${sc.score}`);
  const s2 = scoreDiagnosis({ component: 'FT-724', mode: 'cal', evidence: ['FT-724'], action: 'recal' }, f, DIAGNOSIS);
  check('blaming the flowmeter for an eroded injector scores low', s2.score < 30, `${s2.score}`);
}
for (const f of FAULTS) {
  const st = f.story(f.params ? f.params(base.s.rng) : {});
  if (!(st.what && st.indicators && st.misleading && st.notice && st.abort && st.expert)) check(`${f.id}: complete debrief`, false);
}
check('every fault has a complete debrief', true);

console.log(`\n${count - failures}/${count} passed`);
if (failures) process.exit(1);
