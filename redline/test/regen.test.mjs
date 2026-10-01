/* BPE-2, the regeneratively cooled engine on TS-2, headless: the cooling
   physics, a cold flow through the jacket, hot fires against prediction,
   throttling, the start with the jacket to prime, every cooling fault's
   fingerprint in the measured data, and the rules.
   run: node redline/test/regen.test.mjs */
import def from '../src/content/stands/ts2-regen.js';
import { REGEN_FAULTS, REGEN_DIAGNOSIS } from '../src/content/faults/ts2r-faults.js';
import { Session } from '../src/sim/session.js';
import { predictHot } from '../src/physics/predict-bp.js';
import { tsatFU } from '../src/physics/cooling.js';
import { scoreDiagnosis } from '../src/faults/diagnosis.js';
import { psi, degC } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1), C = k => `${(k - 273.15).toFixed(0)} °C`;

function ready({ ox = 420, fu = 480, seed = 5, fault = null, load = 'loadPropellants', meters = ['OX-1', 'FU-1'] } = {}) {
  const s = new Session({ def, mode: 'independent', seed, fault });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-716', 'WT-726'] }); ex('daqRate', { rate: 2000 });
  ex('tech', { task: load }); s.run(121);
  ex('meterCal', { line: 'ox', fluid: meters[0] }); ex('meterCal', { line: 'fu', fluid: meters[1] });
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2); ex('clearCell'); s.run(7);
  ex('regSet', { id: 'PR-630', value: psi(150) }); ex('regSet', { id: 'PR-610', value: psi(ox) }); ex('regSet', { id: 'PR-620', value: psi(fu) });
  s.run(30);
  ex('tare', { ids: ['LC-901'] }); s.run(1);
  return { s, ex };
}
function hot(opts = {}, plan = {}) {
  const { s, ex } = ready(opts);
  const m = { rest728: s.daq.latest('TC-728'), rest727: s.daq.latest('TC-727'), s };
  ex('plan', { plan: { mode: 'hot', duration: 5, lead: -0.2, ignLead: 0.5, ignCheck: 0.7, ignOff: 1.2, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3, ...plan } });
  ex('record', { on: true }); s.run(0.5);
  m.arm = s.execute('arm', {}, { confirmed: true }); ex('fire');
  s.run(5 + (plan.duration ?? 5) + 12);
  ex('record', { on: false });
  m.run = s.runs[s.runs.length - 1];
  m.S = m.run?.metrics?.summary || {};
  m.abort = m.run?.abort || '';
  return m;
}

console.log('cooling physics');
{
  check('FU-1 boils near 78 °C at one atmosphere', Math.abs(tsatFU(101325) - degC(78)) < 3, C(tsatFU(101325)));
  check('…and near 200 °C at 3 MPa (alcohol-like)', Math.abs(tsatFU(3e6) - degC(200)) < 12, C(tsatFU(3e6)));
  check('no boiling above the critical pressure', tsatFU(7e6) === Infinity);
}

console.log('a cold flow through the jacket (water, fuel side)');
{
  const { s, ex } = ready({ fu: 300, load: 'fillTanks', meters: ['water', 'water'] });
  ex('plan', { plan: { mode: 'single', sides: 'fuel', duration: 3, lead: 0, postPurge: 3 } });
  ex('record', { on: true }); s.run(0.5); ex('arm'); ex('fire'); s.run(18);
  const r = s.runs[s.runs.length - 1], S = r.metrics.summary;
  const want = s.model.line('fu').CdAjacket;
  check('the jacket ΔP is measured (PT-729 − PT-725)', S.dPjkt > psi(20), `${P(S.dPjkt).toFixed(1)} psi`);
  check('the jacket CdA is recovered from water (±3 %)', Math.abs(S.CdAjkt / want - 1) < 0.03, `${(S.CdAjkt * 1e6).toFixed(2)} vs ${(want * 1e6).toFixed(2)} mm²`);
  check('the fuel side primes slower than BPE-1\'s: the jacket fills first', S.primeFu > 0.3, `${(S.primeFu * 1e3).toFixed(0)} ms`);
}

console.log('a hot fire at the design point');
const base = hot();
{
  const { S, run, s } = base;
  check('a 5 s burn, lit and clean', run && !run.aborted && S.ignited && S.start === 'smooth', base.abort || `${S.start}, ${(S.overshoot * 100).toFixed(0)} %`);
  const pr = predictHot(def, { Pox: psi(420), Pfu: psi(480), cdaOx: def.design.CdAox * 0.97, cdaFu: def.design.CdAfu * 0.985, eta: 0.95 });
  check('Pc matches the as-built prediction, jacket included (±4 %)', Math.abs(S.Pc / pr.Pc - 1) < 0.04, `${P(S.Pc).toFixed(1)} vs ${P(pr.Pc).toFixed(1)} psig`);
  check('MR matches it too (±4 %)', Math.abs(S.MR / pr.MR - 1) < 0.04, `${S.MR.toFixed(3)} vs ${pr.MR.toFixed(3)}`);
  check('jacket ΔP near its design value', Math.abs(S.dPjkt / def.design.dPjacket - 1) < 0.2, `${P(S.dPjkt).toFixed(0)} psi`);
  const J = s.model.jacket;
  check('the coolant heat balance from the instruments matches the model (±6 %)', Math.abs(S.Qjkt / J.Q - 1) < 0.06 || !(J.Q > 1000), `${(S.Qjkt / 1e3).toFixed(1)} kW measured`);
  check('the coolant rises tens of kelvin and stays well short of boiling', S.dTc > 40 && S.dTc < 150 && S.boilMargin > 40, `ΔT ${S.dTc.toFixed(0)} K, margin ${S.boilMargin.toFixed(0)} K`);
  check('the throat liner stays far below a heat-sink chamber\'s temperatures', S.TthMax < degC(320), C(S.TthMax));
  check('the liner is steady: nothing like soak-back after shutdown', S.TthPeak < S.TthMax + 15, `${C(S.TthMax)} burning, ${C(S.TthPeak)} after`);
  check('no coking at the design point', J.seg.every(sg => sg.coke < 2e-7), J.seg.map(sg => (sg.coke * 1e6).toFixed(2)).join('/'));
  check('no cooling flag', !run.metrics.flags.includes('cooling-margin'));
}

console.log('the start: the jacket has to fill');
{
  const z = hot({}, { lead: 0, duration: 2 });
  check('zero lead lights later than a 200 ms fuel lead', z.S.ignDelay > base.S.ignDelay + 0.06, `${(z.S.ignDelay * 1e3).toFixed(0)} vs ${(base.S.ignDelay * 1e3).toFixed(0)} ms valve-to-flame`);
  const x = hot({}, { lead: -0.4, duration: 2 });
  check('…and too long a fuel lead makes a rough start', x.S.start !== 'smooth' || x.run.aborted, `${x.S.start}, ${(x.S.overshoot * 100).toFixed(0)} %`);
}

console.log('long burns and throttling');
{
  const L = hot({}, { duration: 25 });
  check('a 25 s burn runs to completion (no heat-sink limit)', !L.run.aborted && L.S.dur > 24.5, L.abort || `${L.S.dur.toFixed(1)} s`);
  check('…with the liner as cool at the end as after a 5 s burn', Math.abs(L.S.TthMax - base.S.TthMax) < 10, `${C(L.S.TthMax)} vs ${C(base.S.TthMax)}`);
  const T = hot({ ox: 260, fu: 290 }, { duration: 4 });
  check('throttled: less heat, but a larger coolant rise', T.S.Qjkt < base.S.Qjkt && T.S.dTc > base.S.dTc - 3, `${(T.S.Qjkt / 1e3).toFixed(1)} kW, ΔT ${T.S.dTc.toFixed(0)} K`);
  check('…and a smaller boiling margin', T.S.boilMargin < base.S.boilMargin - 10, `${T.S.boilMargin.toFixed(0)} vs ${base.S.boilMargin.toFixed(0)} K`);
}

console.log('cooling faults, as the instruments see them');
const F = Object.fromEntries(REGEN_FAULTS.map(f => [f.id, hot({ fault: f.id })]));
{
  const b = F['jkt-blocked'];
  check('jkt-blocked: the throat liner runs hot (or trips its redline) while TC-728 barely moves',
    /throat liner/.test(b.abort) || (b.S.TthMax > base.S.TthMax + 60 && Math.abs(b.S.Tcout - base.S.Tcout) < 12),
    `${C(b.S.TthMax)} vs ${C(base.S.TthMax)}; ${b.abort || 'no abort'}`);
  check('jkt-blocked: …and the jacket ΔP is up', b.S.dPjkt > base.S.dPjkt * 1.05 || b.run.aborted, `${P(b.S.dPjkt).toFixed(1)} vs ${P(base.S.dPjkt).toFixed(1)} psi`);
  const k = F['jkt-coked'];
  check('jkt-coked: walls hotter, coolant a little cooler', k.S.TthMax > base.S.TthMax + 25 && k.S.Tcout < base.S.Tcout, `throat ${C(k.S.TthMax)}, coolant out ${C(k.S.Tcout)} vs ${C(base.S.Tcout)}`);
  const c = F['liner-crack'];
  check('liner-crack: more fuel flow and a lower c* efficiency', c.S.mdotFu > base.S.mdotFu * 1.03 && c.S.etaCstar < base.S.etaCstar - 0.015,
    `ṁfu ${(c.S.mdotFu * 1e3).toFixed(0)} vs ${(base.S.mdotFu * 1e3).toFixed(0)} g/s, η ${c.S.etaCstar.toFixed(3)} vs ${base.S.etaCstar.toFixed(3)}`);
  const h = F['hot-fuel'];
  check('hot-fuel: TC-727 high at rest; small boiling margin or its redline', h.rest727 > degC(55) && (h.S.boilMargin < 40 || /boiling/.test(h.abort)),
    `${C(h.rest727)}, margin ${h.S.boilMargin?.toFixed(0)} K ${h.abort}`);
  const t = F['tc728-bias'];
  check('tc728-bias: TC-728 disagrees with TC-727 at rest', t.rest728 - t.rest727 > 15, `${(t.rest728 - t.rest727).toFixed(1)} K`);
  check('tc728-bias: …the walls are normal', Math.abs(t.S.TthMax - base.S.TthMax) < 10, C(t.S.TthMax));
}

console.log('rules and vocabulary');
{
  const { s } = ready({ fault: 'hot-fuel' });
  s.execute('plan', { plan: { mode: 'hot', duration: 5, lead: -0.2, ignCheck: 0.7 } });
  const poll = s.startPoll();
  const bad = poll.stations.flatMap(st => st.items.filter(i => !i.ok).map(i => i.label));
  check('the go/no-go poll flags hot coolant', bad.some(l => /coolant/.test(l)), bad.join('; '));
  for (const f of REGEN_FAULTS) {
    const ok = REGEN_DIAGNOSIS.modes.some(m => m[0] === f.mode) && (REGEN_DIAGNOSIS.rightAction[f.mode] || []).length
      && (def.components[f.component] || def.sensors.find(x => x.id === f.component));
    if (!ok) check(`${f.id}: vocabulary and component exist`, false);
  }
  check('every cooling fault has its mode, action and component', true);
  const sc = scoreDiagnosis({ component: 'JKT-2', mode: 'coking', evidence: ['TC-803', 'TC-728', 'Q-JKT'], action: 'clean' }, REGEN_FAULTS.find(f => f.id === 'jkt-coked'), REGEN_DIAGNOSIS);
  check('a right coking diagnosis scores 100', sc.score === 100, String(sc.score));
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
