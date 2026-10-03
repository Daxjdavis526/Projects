/* Levels 24–29 on TS-3G, headless: the orientation, the pump-fed cold flow,
   the first hot fire, throttling and duration, and troubleshooting walked
   through their procedures start to finish; the acceptance campaign's
   findings and report grading.
   run: node redline/test/levels-gg.test.mjs */
import def from '../src/content/stands/ts3g-engine.js';
import { Session } from '../src/sim/session.js';
import { psi } from '../src/lib/units.js';
import ggOrientation from '../src/content/procedures/gg-orientation.js';
import ggColdflow, { COLD } from '../src/content/procedures/gg-coldflow.js';
import ggFirstfire, { FIRST } from '../src/content/procedures/gg-firstfire.js';
import ggThrottle, { THROTTLE, LONG } from '../src/content/procedures/gg-throttle.js';
import ggTrouble, { REF } from '../src/content/procedures/gg-trouble.js';
import ggCampaign from '../src/content/procedures/gg-campaign.js';
import { GG_CAMPAIGN_SPEC } from '../src/analysis/report-gg.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const pending = P => P.steps.filter(x => P.status(x.id) !== 'COMPLETE').map(x => `${x.id}:${P.status(x.id)}${P.state.get(x.id).msg ? '(' + P.state.get(x.id).msg + ')' : ''}`).join(' ');
const PTS = def.sensors.filter(x => x.kind === 'PT').map(x => x.id);
const EXIT = (x, d = 0) => (Number.isFinite(x) ? x.toFixed(d) : 'NaN');
const clean = r => !!r && !r.aborted && !r.alarms.some(a => /REDLINE/.test(a));
const noViolations = (s, tag) => check(`${tag}: no safety violations, no wrong poll calls`, s.safetyViolations.length === 0 && s.pollMisses.length === 0,
  s.safetyViolations.map(v => v.msg).join('; ') + ' / ' + JSON.stringify(s.pollMisses));

console.log('Level 24 — orientation, tutorial, start to finish');
{
  const s = new Session({ def, scenario: ggOrientation, mode: 'tutorial', seed: 61 });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  P.confirm('A1'); P.confirm('A2'); P.confirm('A3');
  for (const st of P.steps.filter(x => x.id.startsWith('K-'))) s.inspect(st.id.slice(2));
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: PTS }); ex('tare', { ids: ['WT-411', 'WT-421'] }); s.run(0.5);
  ex('plan', { plan: { ...def.defaultPlan } }); s.run(0.5);
  P.confirm('C2'); P.confirm('C3', '1.1'); P.confirm('C4');
  ex('inspection', { id: 'spark-check' }); s.run(41);
  ex('tech', { task: 'openHV' }); s.run(9);
  ex('valve', { id: 'VV-301', open: false }); ex('valve', { id: 'IV-301', open: true }); s.run(2);
  const r630 = ex('regSet', { id: 'PR-630', value: psi(50) }); s.run(12);
  check('the purge regulator may go to the personnel limit with the cell open', r630.ok, r630.blocked?.msg);
  for (const id of ['PV-631', 'PV-632', 'PV-635']) ex('valve', { id, open: true });
  s.run(3);
  check('the purge fills the main manifolds and sweeps through the gas generator', s.daq.latest('PT-415') > psi(8) && s.daq.latest('PT-333') < psi(3),
    `PT-415 ${EXIT(s.daq.latest('PT-415') / psi(1), 1)}, PT-333 ${EXIT(s.daq.latest('PT-333') / psi(1), 1)} psig`);
  for (const id of ['PV-631', 'PV-632', 'PV-635']) ex('valve', { id, open: false });
  s.run(1);
  ex('regSet', { id: 'PR-630', value: 0 }); ex('valve', { id: 'IV-301', open: false }); s.run(2);
  ex('valve', { id: 'VV-301', open: true }); s.run(10);
  P.confirm('E3');
  check('the purge line stays trapped after its regulator is set to zero', P.status('E3') !== 'COMPLETE' && s.daq.latest('PT-630') > psi(20), `PT-630 ${EXIT(s.daq.latest('PT-630') / psi(1), 1)} psig`);
  ex('valve', { id: 'PV-635', open: true }); s.run(4); ex('valve', { id: 'PV-635', open: false }); s.run(1);
  P.confirm('E3'); P.confirm('E4'); s.run(0.5);
  const sum = P.summary();
  check('orientation completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  noViolations(s, 'orientation');
}

/* Sections A to J (cold) or A to K (hot) of Levels 25–28: the stand
   preparation, walked. */
function prepare(s, P, { hot = true } = {}) {
  const ex = (a, x = {}) => { const r = s.execute(a, x, { confirmed: true }); if (!r.ok) console.log('    refused', a, JSON.stringify(x), r.blocked?.msg || r.msg); return r; };
  const L = hot ? { sup: 'G', leak: 'H', clear: 'I', press: 'K' } : { sup: 'F', leak: 'G', clear: 'H', press: 'J' };
  P.confirm('A1'); ex('tech', { task: 'walkdown' }); s.run(21); P.confirm('A3');
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: PTS }); ex('tare', { ids: ['WT-411', 'WT-421'] }); s.run(0.5);
  ex('tech', { task: hot ? 'loadPropellants' : 'fillTanks' }); s.run(hot ? 151 : 91);
  P.confirm('C2', s.daq.latest('WT-411').toFixed(1));
  ex('tech', { task: 'turnRotor' }); s.run(31);
  const brk = s.log.items.filter(e => e.cat === 'TECH' && /breakaway/.test(e.text)).pop().text.match(/breakaway (\d+)/)[1];
  P.confirm('D2', brk); P.confirm('D3');
  ex('daqRate', { rate: 2000 });
  if (hot) { ex('meterCal', { line: 'ox', fluid: 'LOX' }); ex('meterCal', { line: 'fu', fluid: 'ethanol' }); }
  if (hot) { ex('inspection', { id: 'spark-check' }); s.run(41); P.confirm('F2'); }
  ex('tech', { task: 'openHV' }); s.run(9);
  P.confirm(L.sup + '2', (s.daq.latest('PT-301') / psi(1)).toFixed(0));
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('regSet', { id: 'PR-410', value: psi(40) }); ex('regSet', { id: 'PR-420', value: psi(40) }); s.run(20);
  ex('valve', { id: 'IV-301', open: false }); ex('valve', { id: 'VV-301', open: true }); s.run(2);
  const h = P.startHold(L.leak + '3'); s.run(61); P.confirm(L.leak + '3', true);
  ex('valve', { id: 'VV-301', open: false }); ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'TS-3G run' });
  ex('regSet', { id: 'PR-630', value: psi(150) });
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); s.run(25);
  P.confirm(L.press + '2');
  if (hot) ex('tare', { ids: ['LC-501'] });
  s.run(0.5);
  return h?.ok && P.status(L.leak + '3') === 'COMPLETE';
}
/* Load a plan, record, poll if the series poll does not already cover it,
   fire, and wait out the coast-down. */
function fire(s, plan, label) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('plan', { plan: { thrSteps: null, ...plan } }); ex('record', { on: true }); s.run(0.5);
  if (!s.controller.pollGo) {
    const poll = s.startPoll();
    check(`${label}: poll all GO`, poll.allGo, poll.stations.filter(x => !x.go).map(x => x.id + ': ' + x.items.filter(i => !i.ok).map(i => `${i.label} = ${i.value}`).join('; ')).join(' | '));
    s.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, x.go ? 'GO' : 'NO-GO'])), poll.allGo ? 'GO' : 'NO-GO');
  }
  const arm = s.execute('arm');
  check(`${label}: arming accepted`, arm.ok, JSON.stringify(arm.blocked || arm.confirm));
  ex('fire'); s.run(def.holdTime(s.controller.plan) + 15);
  for (let k = 0; k < 40 && (s.controller.seq || s.daq.latest('SPD') >= 1500); k++) s.run(2);
  return s.runs[s.runs.length - 1];
}
function safe(s) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  for (const id of ['PR-410', 'PR-420', 'PR-330', 'PR-630']) ex('regSet', { id, value: 0 });
  ex('valve', { id: 'IV-301', open: false }); s.run(2);
  for (const id of ['VV-301', 'VV-413', 'VV-423', 'VV-338']) ex('valve', { id, open: true });
  s.run(2);
  ex('valve', { id: 'PV-635', open: true }); s.run(5); ex('valve', { id: 'PV-635', open: false });
  s.run(35);
  for (let k = 0; k < 30 && s.daq.latest('SPD') >= 300; k++) s.run(5);
}
function close(s) {
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('enterCell'); s.run(1); ex('tech', { task: 'closeHV' }); s.run(6);
}

console.log('Level 25 — pump-fed cold flow, guided, start to finish');
{
  const s = new Session({ def, scenario: ggColdflow, mode: 'guided', seed: 63 });
  const P = s.procedure;
  check('leak-check hold accepted', prepare(s, P, { hot: false }), P.state.get('G3').msg);
  P.confirm('K1');
  const r = fire(s, COLD, 'cold flow');
  check('the cold flow ran clean and was reduced', clean(r) && r.metrics?.kind === 'ggcold' && r.metrics.points.length === 1, `${r?.id} ${r?.abort || ''} ${r?.alarms.join('; ')}`);
  P.confirm('M2');
  s.flag('analysis:' + r.id); s.run(0.5);
  const pt = r.metrics.points[0];
  P.confirm('N1'); P.confirm('N3', pt.N.toFixed(0)); P.confirm('N4', (pt.cdaOx * 1e6).toFixed(3)); P.confirm('N5', (pt.cdaFu * 1e6).toFixed(3)); P.confirm('N6');
  P.confirm('N7', r.metrics.summary.coast50.toFixed(2));
  check('the cold flow finds the as-built ox injector a little small (−1.5 to −5 %)', pt.cdaOx / def.design.CdAox - 1 < -0.015 && pt.cdaOx / def.design.CdAox - 1 > -0.05, `${(pt.cdaOx * 1e6).toFixed(2)} vs ${(def.design.CdAox * 1e6).toFixed(2)} mm²`);
  safe(s); P.confirm('O5'); close(s);
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('cold-flow procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  noViolations(s, 'cold flow');
}

console.log('Level 26 — first hot fire, guided, start to finish');
{
  const s = new Session({ def, scenario: ggFirstfire, mode: 'guided', seed: 65 });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  check('leak-check hold accepted', prepare(s, P), P.state.get('H3').msg);
  P.confirm('L1');
  const r = fire(s, FIRST, 'first fire');
  check('a clean 8 s hot fire with a smooth start', clean(r) && r.metrics?.summary.start === 'smooth' && r.metrics.points.length === 1, `${r?.id} ${r?.abort || ''} ${r?.alarms.join('; ')} ${r?.metrics?.summary.start}`);
  P.confirm('N1'); P.confirm('N3');
  safe(s); P.confirm('O5'); close(s);
  ex('tech', { task: 'inspect' }); s.run(26);
  s.flag('analysis:' + r.id); s.run(0.5);
  const S = r.metrics.summary, pt = r.metrics.points[0];
  P.confirm('P2'); P.confirm('P4', S.tMainstage.toFixed(2)); P.confirm('P5'); P.confirm('P6', pt.N.toFixed(0)); P.confirm('P7', pt.MR.toFixed(3));
  P.confirm('P8', (pt.TIT - 273.15).toFixed(0));
  check('a turbine inlet temperature recorded in °C is accepted too', P.status('P8') === 'COMPLETE', P.state.get('P8').msg);
  P.confirm('P9', pt.etaCstar.toFixed(3)); P.confirm('P10', pt.IspE.toFixed(1)); P.confirm('P11');
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('first-fire procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  noViolations(s, 'first fire');
}

console.log('Level 27 — throttling and duration, independent, start to finish');
{
  const s = new Session({ def, scenario: ggThrottle, mode: 'independent', seed: 67 });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  check('leak-check hold accepted', prepare(s, P), P.state.get('H3').msg);
  P.confirm('L1');
  const a = fire(s, THROTTLE, 'burn 1');
  check('burn 1: a clean three-point throttle profile', clean(a) && a.metrics.points.length === 3, `${a?.id} ${a?.abort || ''} ${a?.alarms.join('; ')} ${a?.metrics?.points.length}`);
  P.confirm('N1'); P.confirm('N3'); P.confirm('O1');
  check('the case is cool enough to fire again straight away after 12 s', s.daq.latest('TC-503') < def.ratings.CASE_REFIRE, `${EXIT(s.daq.latest('TC-503') - 273.15)} °C`);
  const b = fire(s, LONG, 'burn 2');
  check('burn 2: a clean 30 s at full throttle', clean(b) && b.metrics.points.length === 1 && b.metrics.summary.dur > 29.9, `${b?.id} ${b?.abort || ''} ${b?.alarms.join('; ')}`);
  P.confirm('O4'); P.confirm('O6');
  check('propellant left after both burns', s.daq.latest('WT-411') > 25 && s.daq.latest('WT-421') > 15, `${EXIT(s.daq.latest('WT-411'), 1)} / ${EXIT(s.daq.latest('WT-421'), 1)} kg`);
  safe(s); P.confirm('P5'); close(s);
  ex('tech', { task: 'inspect' }); s.run(26);
  for (const r of [a, b]) s.flag('analysis:' + r.id);
  s.run(0.5);
  const [p0, , p2] = a.metrics.points, B = b.metrics.summary;
  P.confirm('Q2'); P.confirm('Q4', p2.F.toFixed(0)); P.confirm('Q5', (p2.TIT - p0.TIT).toFixed(0)); P.confirm('Q6', Math.min(p2.stiffOx, p2.stiffFu).toFixed(3));
  P.confirm('Q7', (100 * B.PcDrift).toFixed(2)); P.confirm('Q8', (B.caseShut - 273.15).toFixed(1));
  check('throttled to 70 %, the thrust falls by a quarter to a half', p2.F / p0.F > 0.5 && p2.F / p0.F < 0.8, `${(100 * p2.F / p0.F).toFixed(0)} %`);
  check('the 30 s burn erodes the throat: Pc drifts down', B.PcDrift < -0.001, `${(100 * B.PcDrift).toFixed(2)} % per 10 s`);
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check('throttle-and-duration procedure completes, every step COMPLETE', sum.counts.COMPLETE === sum.total, pending(P));
  noViolations(s, 'throttle');
}

console.log('Level 28 — troubleshooting: a clean rebuild, and an eroded GG oxidiser orifice');
for (const [fault, none] of [[null, 1], ['gg-ox-eroded', 0]]) {
  const s = new Session({ def, scenario: ggTrouble, mode: 'guided', seed: 69, fault, faultChanceNone: none });
  const P = s.procedure, ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  const tag = fault || 'no fault';
  check(`${tag}: leak-check hold accepted`, prepare(s, P), P.state.get('H3').msg);
  const r = fire(s, REF, `${tag}: reference fire`);
  check(`${tag}: the reference fire ran without an abort`, !!r && !r.aborted, `${r?.id} ${r?.abort || ''}`);
  const pt = r?.metrics?.points[0];
  if (fault) check(`${tag}: a hotter turbine and a faster engine than the reference`, pt && pt.TIT > 836 && pt.N > 36200, `${EXIT(pt?.TIT)} K, ${EXIT(pt?.N)} rpm`);
  P.confirm('N1'); P.confirm('N3');
  safe(s); P.confirm('O5'); close(s);
  ex('tech', { task: 'drainTanks' }); s.run(91);
  s.flag('analysis:' + r.id);
  for (const id of ['gg-orifice-flow', 'tc-reference']) {
    const x = ex('inspection', { id });
    check(`${tag}: ${id} inspection accepted`, x.ok, x.blocked?.msg || x.msg);
    s.run(def.inspections.find(i => i.id === id).dur + 2);
  }
  const sub = fault ? { component: 'GG', mode: 'eroded', evidence: ['prediction', 'gg-orifice-flow', 'TT-334', 'SPD'], action: 'repair', notes: '' }
                    : { component: 'NONE', mode: 'none', evidence: ['prediction', 'gg-orifice-flow', 'tc-reference'], action: 'continue', notes: '' };
  const d = s.submitDiagnosis(sub);
  check(`${tag}: the right diagnosis scores as diagnosed`, d.result.score >= 85, `${d.result.score} ${d.result.parts.filter(p => p.got < p.max).map(p => p.label + ': ' + p.note).join(', ')}`);
  s.flag('report:session'); s.run(0.5);
  const sum = P.summary();
  check(`${tag}: troubleshooting procedure completes, every step COMPLETE`, sum.counts.COMPLETE === sum.total, pending(P));
}

console.log('Level 29 — acceptance campaign: cold flow, drain, load, design point, throttle profile; grading');
{
  const s = new Session({ def, scenario: ggCampaign, mode: 'independent', seed: 71, faultChanceNone: 1 });
  const ex = (a, x = {}) => { const r = s.execute(a, x, { confirmed: true }); if (!r.ok) console.log('    refused', a, JSON.stringify(x), r.blocked?.msg || r.msg); return r; };
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: PTS }); ex('tare', { ids: ['WT-411', 'WT-421'] });
  ex('tech', { task: 'fillTanks' }); s.run(91); ex('tech', { task: 'turnRotor' }); s.run(31);
  ex('inspection', { id: 'spark-check' }); s.run(41);
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('regSet', { id: 'PR-410', value: psi(40) }); ex('regSet', { id: 'PR-420', value: psi(40) }); s.run(20);
  ex('valve', { id: 'IV-301', open: false }); ex('valve', { id: 'VV-301', open: true }); s.run(2);
  s.startLeakCheck(); s.run(62);
  check('campaign leak check passes', s.leakCheck?.ok, s.leakCheck?.msg);
  ex('valve', { id: 'VV-301', open: false }); ex('valve', { id: 'IV-301', open: true }); s.run(2);
  ex('clearCell'); s.run(7); ex('pa', { text: 'x' }); ex('daqRate', { rate: 2000 });
  ex('regSet', { id: 'PR-630', value: psi(150) });
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); s.run(25);
  const c = fire(s, COLD, 'campaign cold flow');
  // water out, propellants in: the cell has to be opened, so the stand is safed first
  safe(s); ex('enterCell'); s.run(1);
  const dr = ex('tech', { task: 'drainTanks' }); s.run(91);
  const ld = ex('tech', { task: 'loadPropellants' }); s.run(151);
  check('drain and load accepted between the cold flow and the hot fires', dr.ok && ld.ok && s.controller.loaded === 'propellants');
  ex('meterCal', { line: 'ox', fluid: 'LOX' }); ex('meterCal', { line: 'fu', fluid: 'ethanol' });
  for (const id of ['VV-301', 'VV-413', 'VV-423', 'VV-338']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); s.run(2); ex('clearCell'); s.run(7); ex('pa', { text: 'x' });
  ex('regSet', { id: 'PR-630', value: psi(150) });
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); s.run(25);
  ex('tare', { ids: ['LC-501'] });
  const d = fire(s, { mode: 'hot', duration: 22, thr: 1 }, 'campaign design point');
  // before the next fire: the case below its refire limit, the rotor stopped, the turbine-end bearing cool
  for (let k = 0; k < 120 && (s.daq.latest('TC-503') >= def.ratings.CASE_REFIRE || s.daq.latest('SPD') >= 300 || s.daq.latest('TC-344') >= 273.15 + 45); k++) s.run(10);
  const t = fire(s, { mode: 'hot', thrSteps: [1.0, 0.85, 0.7], settle: 4, dwell: 4 }, 'campaign throttle profile');
  const f = GG_CAMPAIGN_SPEC.findings(s);
  check('cold flow, design point and throttle profile all found', !!f.cold && !!f.design && !!f.throttle, [c, d, t].map(r => r?.id + (r?.aborted ? ' ' + r.abort : '')).join(', '));
  if (f.cold && f.design && f.throttle) {
    s.submitDiagnosis({ component: 'NONE', mode: 'none', evidence: ['prediction', 'turn-rotor', 'leak-check'], action: 'continue', notes: '' });
    const good = { cdaOx: f.cold.cdaOx, cdaFu: f.cold.cdaFu, Pc: f.design.Pc, F: f.design.F, MR: f.design.MR, TIT: f.design.TIT, etaCstar: f.design.etaCstar, IspE: f.design.IspE, Flow: f.throttle.Flow, validity: 'valid' };
    const g = GG_CAMPAIGN_SPEC.grade(s, good);
    check('an honest, accurate report scores high', g.score >= 90, `${g.score} — ${g.parts.filter(p => p.got < p.max).map(p => p.label + ': ' + p.note).join(', ')}`);
    check('the deliverables are worth 40 points', g.parts.slice(0, 9).reduce((x, p) => x + p.max, 0) === 40);
    const bad = GG_CAMPAIGN_SPEC.grade(s, { ...good, IspE: f.design.IspC });
    check('reporting the main chamber Isp as the engine\'s loses its points', bad.score === g.score - 5, `${bad.score}`);
  }
  noViolations(s, 'campaign');
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
