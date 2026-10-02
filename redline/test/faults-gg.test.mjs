/* TS-3G's faults, forced one at a time through the reference fire (8 s at
   full GG throttle, tanks 50 psig, the standard start), and a check that
   each leaves the fingerprint its answer key claims in the MEASURED data.
   Plus the inspections and the diagnosis vocabulary.
   run: node redline/test/faults-gg.test.mjs */
import def from '../src/content/stands/ts3g-engine.js';
import { FAULTS, DIAGNOSIS } from '../src/content/faults/ts3g-faults.js';
import { INSPECTIONS } from '../src/content/faults/ts3g-inspections.js';
import { Session } from '../src/sim/session.js';
import { scoreDiagnosis } from '../src/faults/diagnosis.js';
import { meanIn, maxIn } from '../src/analysis/metrics.js';
import { psi } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);
const f0 = x => (Number.isFinite(x) ? x.toFixed(0) : String(x));
const f3 = x => (Number.isFinite(x) ? x.toFixed(3) : String(x));

function standard(fault, plan = {}, { seed = 5 } = {}) {
  const S = new Session({ def, mode: 'independent', seed, fault, faultChanceNone: fault ? 0 : 1 });
  const ex = (a, x = {}) => S.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); S.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-411', 'WT-421'] });
  ex('tech', { task: 'loadPropellants' }); S.run(151);
  ex('meterCal', { line: 'ox', fluid: 'OX-1' }); ex('meterCal', { line: 'fu', fluid: 'FU-1' });
  ex('inspection', { id: 'spark-check' }); S.run(41);
  ex('tech', { task: 'openHV' }); S.run(9);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); S.run(2);
  ex('clearCell'); S.run(7); ex('pa', { text: 'x' });
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); ex('regSet', { id: 'PR-630', value: psi(150) }); S.run(25);
  ex('tare', { ids: ['LC-501'] }); ex('daqRate', { rate: 2000 });
  ex('plan', { plan: { mode: 'hot', duration: 8, thrSteps: null, ...plan } }); S.run(0.5);
  ex('record', { on: true }); S.run(0.5);
  const p = S.startPoll(); S.concludePoll(p, Object.fromEntries(p.stations.map(x => [x.id, 'GO'])), 'GO');
  ex('arm'); ex('fire');
  S.run(def.holdTime(S.controller.plan) + 15);
  const run = S.runs[S.runs.length - 1];
  const d = run.data, T = d.T, tOn = run.metrics?.tOn ?? 0;
  const mean = (id, a, b) => meanIn(T, d.series(id), tOn + a, tOn + b);
  const max = (id, a, b) => maxIn(T, d.series(id), tOn + a, tOn + b).v;
  return { S, run, m: run.metrics, pt: run.metrics?.points?.[0], sm: run.metrics?.summary, mean, max, alarms: run.alarms.join(' | '), abort: run.abort || '' };
}

console.log('the reference fire');
const ref = standard(null);
check('nominal: no abort, no alarms, no flags, a smooth start', !ref.run.aborted && !ref.run.alarms.length && !ref.m.flags.length && ref.sm.start === 'smooth', `${ref.abort} ${ref.alarms} ${ref.m.flags.join(',')}`);
const R = ref.pt, RS = ref.sm;
const R336 = ref.mean('PT-336', 0.3, 0.9), SP = def.defaultPlan.startP;

const cases = {
  'gg-ox-eroded': f => [
    ['the turbine inlet runs well above the reference', f.pt.TIT > R.TIT + 22, `${f0(f.pt.TIT)} vs ${f0(R.TIT)} K`],
    ['and the engine runs faster, at a higher Pc — without an overspeed', f.pt.N > R.N * 1.025 && f.pt.Pc > R.Pc && !f.run.aborted, `${f0(f.pt.N)} vs ${f0(R.N)} rpm`],
    ['while the INFERRED GG mixture ratio barely moves (the orifice inference is blind to it)', Math.abs(f.pt.MRgg / R.MRgg - 1) < 0.06, `${f3(f.pt.MRgg)} vs ${f3(R.MRgg)}`],
  ],
  'gg-fu-blocked': f => [
    ['the turbine inlet runs above the reference', f.pt.TIT > R.TIT + 30, `${f0(f.pt.TIT)} vs ${f0(R.TIT)} K`],
    ['the inferred GG fuel flow does not show the blockage (within 5 %)', Math.abs(f.pt.ggFu / R.ggFu - 1) < 0.05, `${f3(f.pt.ggFu)} vs ${f3(R.ggFu)} kg/s`],
  ],
  'pr330-droop': f => [
    ['the start gas pressure (PT-336) sags below its setpoint 2.5× as far as the reference while TSV-332 is open', SP - f.mean('PT-336', 0.3, 0.9) > 2.5 * (SP - R336), `${f0(P(f.mean('PT-336', 0.3, 0.9)))} vs ${f0(P(R336))} psig, set ${f0(P(SP))}`],
    ['a slow start: mainstage later than the reference, or a hang', f.sm.start === 'hang' || f.sm.tMainstage > RS.tMainstage + 0.08, `${f.sm.start}, T+${f.sm.tMainstage?.toFixed(2)} vs T+${RS.tMainstage.toFixed(2)} s ${f.abort}`],
  ],
  'gg-ign-late': f => [
    ['the gas generator lights late', f.sm.tIgnGG > RS.tIgnGG + 0.1, `${(1e3 * f.sm.tIgnGG).toFixed(0)} vs ${(1e3 * RS.tIgnGG).toFixed(0)} ms`],
    ['a hard start in the gas generator (PT-333 spike)', f.sm.start === 'gg-hard', `${f.sm.start}; ${f0(P(f.sm.PggPeak))} psig peak ${f.abort}`],
    ['the GG igniter current is normal', f.max('IGG-I', -0.4, 1.5) > 1.4, `${f.max('IGG-I', -0.4, 1.5).toFixed(2)} A`],
  ],
  'main-ign-fail': f => [
    ['the ignition check aborts the start', f.run.aborted && /no ignition/.test(f.abort), f.abort],
    ['with the main igniter current normal', f.max('IGN-I', -0.4, 0.8) > 1.5, `${f.max('IGN-I', -0.4, 0.8).toFixed(2)} A`],
  ],
  'liner-thin': f => [
    ['the case warms through the burn several times faster than on the reference chamber', f.sm.caseShut - f.sm.caseStart > Math.max(4, 3 * (RS.caseShut - RS.caseStart)),
      `+${(f.sm.caseShut - f.sm.caseStart).toFixed(1)} vs +${(RS.caseShut - RS.caseStart).toFixed(1)} K over the burn`],
    ['and the engine is otherwise nominal (Pc within 1 %)', Math.abs(f.pt.Pc / R.Pc - 1) < 0.01, `${f0(P(f.pt.Pc))} vs ${f0(P(R.Pc))} psig`],
  ],
  'throat-eroded': f => [
    ['chamber pressure below the reference by more than 4 %', f.pt.Pc < 0.96 * R.Pc, `${f0(P(f.pt.Pc))} vs ${f0(P(R.Pc))} psig`],
    ['the main flows within 2 % of the reference', Math.abs(f.pt.mdotMain / R.mdotMain - 1) < 0.02, `${f3(f.pt.mdotMain)} vs ${f3(R.mdotMain)} kg/s`],
    ['c* (with the drawing throat) reads low, as if combustion were poor', f.pt.etaCstar < R.etaCstar - 0.03, `${f3(f.pt.etaCstar)} vs ${f3(R.etaCstar)}`],
  ],
  'ox-inducer': f => [
    ['the ox pump discharge low against the reference, the fuel pump\'s not', f.pt.PdOx < 0.975 * R.PdOx && Math.abs(f.pt.PdFu / R.PdFu - 1) < 0.02, `${f0(P(f.pt.PdOx))} vs ${f0(P(R.PdOx))} psig`],
    ['the main chamber pressure, mixture ratio and turbine inlet temperature down', f.pt.Pc < R.Pc && f.pt.MR < R.MR - 0.03 && f.pt.TIT < R.TIT - 8, `${f0(P(f.pt.Pc))} psig, MR ${f3(f.pt.MR)}, ${f0(f.pt.TIT)} K`],
    ['the TPA vibration up, the speed barely moved', f.pt.vibTP > R.vibTP + 0.25 && Math.abs(f.pt.N / R.N - 1) < 0.015, `${f.pt.vibTP.toFixed(2)} vs ${R.vibTP.toFixed(2)} g, ${f0(f.pt.N)} rpm`],
  ],
  'tt334-low': f => [
    ['TT-334 reads well below the reference', f.pt.TIT < R.TIT - 40, `${f0(f.pt.TIT)} vs ${f0(R.TIT)} K`],
    ['while the turbine exhaust and everything else are on the reference', Math.abs(f.pt.Texh - R.Texh) < 8 && Math.abs(f.pt.N / R.N - 1) < 0.005, `${f0(f.pt.Texh)} vs ${f0(R.Texh)} K, ${f0(f.pt.N)} rpm`],
  ],
  'gov416-slow': f => [
    ['a smooth start and a nominal mainstage', f.sm.start === 'smooth' && Math.abs(f.pt.Pc / R.Pc - 1) < 0.01],
    ['a turbine over-temperature at shutdown', /TURBINE INLET OVER TEMPERATURE/.test(f.abort), f.abort],
  ],
  'ft416-kfactor': f => [
    ['the main ox flow reads > 5 % above the reference, Pc unchanged', f.pt.mdotOx > 1.05 * R.mdotOx && Math.abs(f.pt.Pc / R.Pc - 1) < 0.005, `${f3(f.pt.mdotOx)} vs ${f3(R.mdotOx)} kg/s`],
    ['so MR reads high and c* low', f.pt.MR > R.MR * 1.04 && f.pt.etaCstar < R.etaCstar, `MR ${f3(f.pt.MR)}, η* ${f3(f.pt.etaCstar)}`],
  ],
};

for (const F of FAULTS) {
  console.log(F.id);
  const f = standard(F.id);
  if (!f.pt && !['main-ign-fail'].includes(F.id)) { check('(reduced to a mainstage point)', false, `${f.abort} ${f.alarms}`); continue; }
  for (const [label, ok, detail] of (cases[F.id]?.(f) || [['(no fingerprint case written)', false]])) check(label, ok, detail);
}

console.log('inspections and diagnosis vocabulary');
{
  const N = new Session({ def, mode: 'independent', seed: 2, faultChanceNone: 1 });
  const all = INSPECTIONS.map(i => i.run(N).lines).flat();
  check('on nominal hardware every inspection reads within its expected band (no "damage" words)', !all.some(l => /nicks|spalling|bridged|worn round|occluded|rounded|scalloped|does not match|weeping|scorched/.test(l[1])),
    all.filter(l => /nicks|spalling|bridged|worn round|occluded|rounded|scalloped|does not match|weeping|scorched/.test(l[1])).map(l => l[0]).join('; '));
  const look = (fault, id, row) => { const S = new Session({ def, mode: 'independent', seed: 2, fault }); return S.def.inspections.find(i => i.id === id).run(S).lines[row][1]; };
  check('the GG orifice bench flow sees an eroded ox orifice', /rounded/.test(look('gg-ox-eroded', 'gg-orifice-flow', 2)), look('gg-ox-eroded', 'gg-orifice-flow', 2));
  check('the TC reference check finds the wrong extension wire', /does not match/.test(look('tt334-low', 'tc-reference', 3)), look('tt334-low', 'tc-reference', 3));
  check('the inducer borescope sees the damage', /nicks/.test(look('ox-inducer', 'inducer-borescope', 0)), look('ox-inducer', 'inducer-borescope', 0));
  const modes = new Set(DIAGNOSIS.modes.map(m => m[0]));
  check('every fault\'s mode is in the vocabulary, with a right action', FAULTS.every(f => modes.has(f.mode) && DIAGNOSIS.rightAction[f.mode]?.length));
  const evid = new Set([...def.sensors.map(s => s.id), ...def.channels.derived.map(d => d.id), ...INSPECTIONS.map(i => i.id), ...DIAGNOSIS.checks.map(c => c[0])]);
  const missing = FAULTS.flatMap(f => f.evidence.filter(e => !evid.has(e)).map(e => `${f.id}:${e}`));
  check('every piece of key evidence is something the operator can cite', !missing.length, missing.join(', '));
  const comps = new Set(Object.keys(def.components).concat(def.sensors.map(s => s.id)));
  check('every faulted component is on the stand', FAULTS.every(f => comps.has(f.component) && (f.alt || []).every(a => comps.has(a))), FAULTS.filter(f => !comps.has(f.component)).map(f => f.id).join(','));
  const f = FAULTS.find(x => x.id === 'gg-ox-eroded');
  const sc = scoreDiagnosis({ component: 'GG', mode: 'eroded', evidence: ['TT-334', 'gg-orifice-flow', 'SPD'], action: 'repair' }, f, DIAGNOSIS);
  check('a full-marks diagnosis scores 100', sc.score === 100, JSON.stringify(sc.parts.map(p => [p.label, p.got])));
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
