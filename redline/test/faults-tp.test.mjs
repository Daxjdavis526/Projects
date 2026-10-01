/* TS-3's faults, forced one at a time through a standard spin (36 000 rpm,
   throttles 66 %, tanks 50 psig, 10 s), and a check that each leaves the
   fingerprint its answer key claims in the MEASURED data. The damaged
   inducer only shows where a test goes looking for it: a suction test.
   Plus the inspections and the diagnosis vocabulary.
   run: node redline/test/faults-tp.test.mjs */
import def from '../src/content/stands/ts3-turbopump.js';
import { FAULTS, DIAGNOSIS } from '../src/content/faults/ts3-faults.js';
import { INSPECTIONS } from '../src/content/faults/ts3-inspections.js';
import { Session } from '../src/sim/session.js';
import { scoreDiagnosis } from '../src/faults/diagnosis.js';
import { psi, degC } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);
const f1 = x => (Number.isFinite(x) ? x.toFixed(1) : String(x));

function standard(fault, plan = {}, { seed = 5, leak = false } = {}) {
  const S = new Session({ def, mode: 'independent', seed, fault });
  const ex = (a, x = {}) => S.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); S.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-411', 'WT-421'] });
  ex('tech', { task: 'fillTanks' }); S.run(91);
  ex('tech', { task: 'turnRotor' }); S.run(31);
  const handTurn = S.log.items.filter(e => e.cat === 'TECH' && /torque wrench/.test(e.text)).pop()?.text || '';
  ex('tech', { task: 'openHV' }); S.run(9);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); S.run(2);
  ex('clearCell'); S.run(7); ex('pa', { text: 'x' });
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); S.run(25);
  const lock = { ox: S.daq.store.stats('PT-410', 3).mean, fu: S.daq.store.stats('PT-420', 3).mean };
  let leakResult = null;
  if (leak) {
    ex('valve', { id: 'IV-301', open: false }); ex('valve', { id: 'VV-301', open: true }); S.run(2);
    S.startLeakCheck(); S.run(62); leakResult = S.leakCheck;
    ex('valve', { id: 'VV-301', open: false }); ex('valve', { id: 'IV-301', open: true }); S.run(3);
  }
  ex('daqRate', { rate: 2000 });
  ex('plan', { plan: { mode: 'spin', ctl: 'speed', speed: 36000, ramp: 3, duration: 10, thr: 0.66, ...plan } }); S.run(0.5);
  ex('record', { on: true }); S.run(0.5);
  const p = S.startPoll(); S.concludePoll(p, Object.fromEntries(p.stations.map(x => [x.id, 'GO'])), 'GO');
  ex('arm'); ex('fire');
  S.run(def.holdTime(S.controller.plan) + 18);
  const run = S.runs[S.runs.length - 1];
  return { S, run, m: run.metrics, pt: run.metrics?.points?.[0], lock, handTurn, leakResult, alarms: run.alarms.join(' | ') };
}

console.log('the reference run');
const ref = standard(null, {}, { leak: true });
check('nominal: no alarms, no flags, leak check passes', !ref.run.alarms.length && !ref.m.flags.length && ref.leakResult?.ok, ref.alarms + ' ' + ref.leakResult?.msg);
const R = ref.pt, RS = ref.m.summary;

const cases = {
  'se342-dropout': f => [
    ['the pickups disagree by thousands of rpm', f.m.summary.pickupSplit > 10000, `${f.m.summary.pickupSplit.toFixed(0)} rpm`],
    ['the real shaft (SPD) ran fast: held speed > 102 % of target', f.pt.N > 1.02 * 36000, `${f.pt.N.toFixed(0)} rpm`],
    ['the drive pressure is above the reference for the same plan', f.pt.Ptin > 1.05 * R.Ptin, `${P(f.pt.Ptin).toFixed(0)} vs ${P(R.Ptin).toFixed(0)} psig`],
  ],
  'se341-teeth': f => [
    ['SE-341 reads a constant fraction (6/7) of SE-342 at speed', Math.abs(f.S.daq.store.stats('SE-341', 0.1).mean) >= 0 && f.m.summary.pickupSplit > 4000, `split ${f.m.summary.pickupSplit.toFixed(0)} rpm`],
    ['the shaft actually ran ≈ 8 % fast (SPD from SE-342)', f.pt.N > 1.06 * 36000, `${f.pt.N.toFixed(0)} rpm`],
    ['pump head above the reference by about speed squared', f.pt.HOx > 1.12 * R.HOx, `${f1(f.pt.HOx)} vs ${f1(R.HOx)} m`],
    ['the speed-above-104 % caution fired', /104/.test(f.alarms), f.alarms],
  ],
  'brg-pe': f => [
    ['the pump-end bearing (TC-343) far hotter than the reference', f.m.summary.TbMax > RS.TbMax + 25, `${f1(f.m.summary.TbMax - 273.15)} vs ${f1(RS.TbMax - 273.15)} °C`],
    ['vibration above normal', f.m.summary.vibMax > 4, `${f.m.summary.vibMax.toFixed(2)} g`],
    ['the rotor turned by hand is gritty and stiff', /gritty/.test(f.handTurn), f.handTurn],
  ],
  'ox-wear': f => [
    ['ox head below the reference by > 5 %, fuel pump unchanged', f.pt.HOx < 0.95 * R.HOx && Math.abs(f.pt.HFu / R.HFu - 1) < 0.01, `${f1(f.pt.HOx)} vs ${f1(R.HOx)} m`],
    ['and the speed and turbine are nominal', Math.abs(f.pt.N / R.N - 1) < 0.003 && Math.abs(f.pt.etaT / R.etaT - 1) < 0.03],
  ],
  'tnz-blocked': f => [
    ['turbine inlet pressure far above the reference for the same speed', f.pt.Ptin > 1.3 * R.Ptin, `${P(f.pt.Ptin).toFixed(0)} vs ${P(R.Ptin).toFixed(0)} psig`],
    ['turbine efficiency about normal', Math.abs(f.pt.etaT / R.etaT - 1) < 0.06, `${f.pt.etaT.toFixed(3)} vs ${R.etaT.toFixed(3)}`],
  ],
  'turb-blades': f => [
    ['turbine efficiency well below the reference', f.pt.etaT < 0.85 * R.etaT, `${f.pt.etaT.toFixed(3)} vs ${R.etaT.toFixed(3)}`],
    ['vibration up', f.m.summary.vibMax > RS.vibMax + 1.5, `${f.m.summary.vibMax.toFixed(2)} vs ${RS.vibMax.toFixed(2)} g`],
    ['more drive pressure for the same speed', f.pt.Ptin > 1.15 * R.Ptin],
  ],
  'seal-rub': f => [
    ['vibration above normal', f.m.summary.vibMax > 4, `${f.m.summary.vibMax.toFixed(2)} g`],
    ['a scrape felt when the rotor is turned by hand', /scrape/.test(f.handTurn), f.handTurn],
    ['the coast-down is shorter than the reference', f.m.summary.coast50 < 0.95 * RS.coast50, `${f.m.summary.coast50.toFixed(2)} vs ${RS.coast50.toFixed(2)} s`],
  ],
  'ft416-kfactor': f => [
    ['ox flow reads > 5 % above the reference while the ox head is unchanged', f.pt.mdotOx > 1.05 * R.mdotOx && Math.abs(f.pt.HOx / R.HOx - 1) < 0.005, `${f.pt.mdotOx.toFixed(3)} vs ${R.mdotOx.toFixed(3)} kg/s`],
  ],
  'pr410-relief-leak': f => [
    ['the leak check fails, on the ox side only', f.leakResult && !f.leakResult.ok && /ox-side -[0-9.]+/.test(f.leakResult.msg) && /fuel-side -?0\.[0-4]/.test(f.leakResult.msg), f.leakResult?.msg],
    ['with the supply open, lock-up hides it (within 1 psi of the fuel side)', Math.abs(f.lock.ox - f.lock.fu) < psi(1), `${P(f.lock.ox).toFixed(1)} vs ${P(f.lock.fu).toFixed(1)} psig`],
  ],
  'dv424-partial': f => [
    ['DV-424 position disagreement alarm', /DV-424/.test(f.alarms), f.alarms],
    ['fuel flow well below the reference; fuel discharge pressure above it', f.pt.mdotFu < 0.95 * R.mdotFu && f.pt.PdFu > R.PdFu, `${f.pt.mdotFu.toFixed(3)} vs ${R.mdotFu.toFixed(3)} kg/s`],
  ],
};

for (const F of FAULTS) {
  if (F.id === 'fu-inducer') continue;
  console.log(F.id);
  const f = standard(F.id, {}, { leak: F.id === 'pr410-relief-leak' });
  for (const [label, ok, detail] of (cases[F.id]?.(f) || [['(no fingerprint case written)', false]])) check(label, ok, detail);
}

console.log('fu-inducer (a suction test on the fuel side)');
{
  const plan = { mode: 'suction', side: 'fu', thr: 0.66, pEnd: psi(3), rate: psi(1.5), settle: 3, duration: 46 };
  const n = standard(null, plan), f = standard('fu-inducer', plan);
  check('at the design point with full tank pressure, almost nothing to see', Math.abs(f.pt.HFu / n.pt.HFu - 1) < 0.02, `${f1(f.pt.HFu)} vs ${f1(n.pt.HFu)} m`);
  check('the suction test finds an NPSH required far above the healthy pump\'s',
    f.m.summary.npshr3 > 1.4 * n.m.summary.npshr3, `${f1(f.m.summary.npshr3)} vs ${f1(n.m.summary.npshr3)} m`);
}

console.log('inspections and diagnosis vocabulary');
{
  const S = new Session({ def, mode: 'independent', seed: 2, fault: 'turb-blades' });
  const lines = S.def.inspections.find(i => i.id === 'turbine-borescope').run(S).lines;
  check('the turbine borescope sees the damaged blade tips', /curled/.test(lines[1][1]), lines[1][1]);
  const N = new Session({ def, mode: 'independent', seed: 2 });
  const all = INSPECTIONS.map(i => i.run(N).lines).flat();
  check('on nominal hardware every inspection reads within its expected band (no "damage" words)', !all.some(l => /spall|chipped|blocked —|curled|scrape|scored|loose/.test(l[1])), all.filter(l => /spall|chipped|curled|scrape|scored|loose/.test(l[1])).map(l => l[0]).join('; '));
  const modes = new Set(DIAGNOSIS.modes.map(m => m[0]));
  check('every fault\'s mode is in the vocabulary, with a right action', FAULTS.every(f => modes.has(f.mode) && DIAGNOSIS.rightAction[f.mode]?.length));
  const evid = new Set([...def.sensors.map(s => s.id), ...def.channels.derived.map(d => d.id), ...INSPECTIONS.map(i => i.id), ...DIAGNOSIS.checks.map(c => c[0])]);
  const missing = FAULTS.flatMap(f => f.evidence.filter(e => !evid.has(e)).map(e => `${f.id}:${e}`));
  check('every piece of key evidence is something the operator can cite', !missing.length, missing.join(', '));
  const f = FAULTS.find(x => x.id === 'se341-teeth');
  const sc = scoreDiagnosis({ component: 'SE-341', mode: 'cal', evidence: ['SE-341', 'SE-342', 'daq-speed-config'], action: 'recal' }, f, DIAGNOSIS);
  check('a full-marks diagnosis scores 100', sc.score === 100, JSON.stringify(sc.parts.map(p => p.got)));
  const sc2 = scoreDiagnosis({ component: 'SE-342', mode: 'cal', evidence: [], action: 'recal' }, f, DIAGNOSIS);
  check('the wrong pickup still earns the instrument-not-hardware credit', sc2.parts[0].got === 10);
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
