/* TS-3G, the gas-generator engine, headless: the steady operating point
   against the transient model, the bootstrap start, throttling on the gas
   generator, what the gas generator's mixture ratio does to the turbine,
   the starts that go wrong (hang, overspeed, no light in either chamber),
   the staged shutdown, a long burn on the ablative chamber, and the
   pump-fed cold flow.
   run: node redline/test/gg.test.mjs */
import def from '../src/content/stands/ts3g-engine.js';
import { physics, FLUIDS_G } from '../src/content/stands/ts3g-physics.js';
import { steadyGG } from '../src/physics/predict-gg.js';
import { Session } from '../src/sim/session.js';
import { psi, degC } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const A = 101325, P = x => (x / psi(1)).toFixed(0) + ' psig';
const PROP = { ox: FLUIDS_G['LOX'], fu: FLUIDS_G['ethanol'] };

/* A stand ready to fire: loaded, igniters checked, tanks at 50 psig, purge up. */
function ready({ seed = 3, prop = true, fault = null } = {}) {
  const s = new Session({ def, mode: 'independent', seed, faultChanceNone: 1 });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) }); ex('tare', { ids: ['LC-501', 'WT-411', 'WT-421'] });
  ex('daqRate', { rate: 2000 });
  ex('tech', { task: prop ? 'loadPropellants' : 'fillTanks' }); s.run(prop ? 151 : 91);
  if (prop) { ex('meterCal', { line: 'ox', fluid: 'LOX' }); ex('meterCal', { line: 'fu', fluid: 'ethanol' }); ex('inspection', { id: 'spark-check' }); s.run(41); }
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); s.run(2); ex('clearCell'); s.run(7);
  ex('regSet', { id: 'PR-410', value: psi(50) }); ex('regSet', { id: 'PR-420', value: psi(50) }); ex('regSet', { id: 'PR-630', value: psi(150) }); s.run(30);
  if (fault) fault(s);
  return { s, ex };
}
function fire(plan, opts = {}, tail = 8) {
  const { s, ex } = ready(opts);
  ex('plan', { plan: { mode: 'hot', duration: 8, ...plan } });
  ex('record', { on: true }); s.run(0.5);
  const a = s.execute('arm', {}, { confirmed: true }), f = s.execute('fire', {}, { confirmed: true });
  const trace = [];
  const T = 5 + def.holdTime(s.controller.plan) + tail;
  for (let t = 0; t < T; t += 0.05) { s.run(0.05, 0.05); trace.push({ t: s.t, n: s.model.tp.rpm, cmd: { ...s.controller.cmd } }); }
  ex('record', { on: false }); s.run(0.5);
  const run = s.runs[s.runs.length - 1];
  return { s, run, M: run?.metrics, S: run?.metrics?.summary, trace, armed: a.ok && f.ok };
}

console.log('the steady operating point');
{
  const D = def.design, cda = { ox: D.CdAox, fu: D.CdAfu, ggox: D.CdAggOx, ggfu: D.CdAggFu };
  const r = steadyGG(def, { fluids: PROP, tankOx: A + psi(50), tankFu: A + psi(50), cda, eta: D.etaCstar, etaGG: D.etaGG });
  check('the drawing engine balances at design speed (±1 %)', Math.abs(r.n - 1) < 0.01, `${r.rpm.toFixed(0)} rpm`);
  const ab = steadyGG(def, { fluids: PROP });
  check('the as-built engine runs a little slower and lower (weaker c*, its own injector)', ab.rpm < r.rpm && ab.Pc < r.Pc && ab.Pc > 0.93 * r.Pc, `${ab.rpm.toFixed(0)} rpm, ${P(ab.Pc - A)}`);
  check('at MR 1.6, Pc ≈ 2.4 MPa abs', Math.abs(r.MR - 1.6) < 0.03 && Math.abs(r.Pc / 2.4e6 - 1) < 0.02, `MR ${r.MR.toFixed(3)}, ${P(r.Pc - A)}`);
  check('the gas generator runs very fuel-rich and around 850 K', r.MRgg > 0.33 && r.MRgg < 0.41 && r.TIT > 780 && r.TIT < 920, `MR ${r.MRgg.toFixed(3)}, ${r.TIT.toFixed(0)} K`);
  check('it takes 3–7 % of the engine\'s flow', r.ggFrac > 0.03 && r.ggFrac < 0.07, `${(100 * r.ggFrac).toFixed(1)} %`);
  check('engine Isp below main-chamber Isp by the GG flow', r.Isp < r.IspChamber && Math.abs(r.Isp / r.IspChamber - (1 - r.ggFrac)) < 0.005, `${r.Isp.toFixed(1)} vs ${r.IspChamber.toFixed(1)} s`);
  check('the turbine runs far below its best blade-speed ratio on hot gas', r.uc0 > 0.1 && r.uc0 < 0.25, `u/c0 ${r.uc0.toFixed(3)}`);
  const lo = steadyGG(def, { fluids: PROP, thrGG: 0.7 });
  check('closing the GG throttles slows the pumps and drops Pc', lo.rpm < r.rpm && lo.Pc < r.Pc && lo.F < r.F, `${lo.rpm.toFixed(0)} rpm, ${P(lo.Pc - A)}, ${lo.F.toFixed(0)} N`);
  const hot = steadyGG(def, { fluids: PROP, thrGGfu: 0.85 });
  // CEA's fuel-rich products are only gently hotter with more oxygen (≈ 35 K per 0.1 of MR here), so
  // the lost GG flow wins: the engine slows, and the turbine runs a little hotter
  check('starving the GG of fuel raises the turbine inlet temperature a little and slows the engine', hot.TIT > ab.TIT + 8 && hot.rpm < ab.rpm, `${hot.TIT.toFixed(0)} K vs ${ab.TIT.toFixed(0)} K, ${hot.rpm.toFixed(0)} rpm`);
  const cold = steadyGG(def, { fluids: { ox: FLUIDS_G.water, fu: FLUIDS_G.water }, cold: { P: A + psi(200), T: 293 } });
  check('cold flow: start gas alone spins the pumps on water', cold.kind === 'ggcold' && cold.n > 0.7 && cold.n < 1.05, `${cold.rpm.toFixed(0)} rpm, ${cold.mdotOx.toFixed(2)} / ${cold.mdotFu.toFixed(2)} kg/s`);
}

let NOM = null;                       // the nominal fire's mainstage point
console.log('a nominal hot fire: the bootstrap start and mainstage');
{
  const { s, run, M, S, trace, armed } = fire({});
  check('armed and fired', armed);
  check('the run completed without an abort', run && !run.aborted, run?.abort || '');
  check('a smooth start, mainstage within 2 s of T-0', S.start === 'smooth' && S.tMainstage < 2, `${S.start}, T+${S.tMainstage?.toFixed(2)} s`);
  check('the gas generator lit within 0.4 s of its valves', S.tIgnGG > 0 && S.tIgnGG < 0.4, `${(S.tIgnGG * 1e3).toFixed(0)} ms`);
  check('the main chamber lit within 0.3 s of its valves', S.tIgnMain > 0 && S.tIgnMain < 0.3, `${(S.tIgnMain * 1e3).toFixed(0)} ms`);
  const p0 = M.points[0], pred = run.meta.config.prediction;
  NOM = p0;
  check('mainstage speed within 3 % of the drawing prediction', Math.abs(p0.N / pred.rpm - 1) < 0.03, `${p0.N.toFixed(0)} vs ${pred.rpm.toFixed(0)} rpm`);
  check('chamber pressure within 6 % of the drawing prediction', Math.abs(p0.Pc / (pred.Pc - A) - 1) < 0.06, `${P(p0.Pc)} vs ${P(pred.Pc - A)}`);
  const ab = steadyGG(def, { fluids: PROP });
  check('mixture ratio from the meters matches the AS-BUILT engine (the drawing says 1.6)', Math.abs(p0.MR / ab.MR - 1) < 0.03 && Math.abs(p0.MR - 1.6) > 0.03, `${p0.MR.toFixed(3)} vs as-built ${ab.MR.toFixed(3)}`);
  check('turbine inlet temperature within 40 K of the prediction', Math.abs(p0.TIT - pred.TIT) < 40, `${p0.TIT.toFixed(0)} vs ${pred.TIT.toFixed(0)} K`);
  check('the inferred GG mixture ratio is right when the orifices are', Math.abs(p0.MRgg / pred.MRgg - 1) < 0.05, p0.MRgg.toFixed(3));
  check('c* efficiency recovers the as-built 0.94 (±0.02)', Math.abs(p0.etaCstar - 0.94) < 0.02, p0.etaCstar.toFixed(3));
  check('the cycle costs Isp: engine < chamber by 8–15 s', p0.IspC - p0.IspE > 8 && p0.IspC - p0.IspE < 15, `${p0.IspC.toFixed(1)} vs ${p0.IspE.toFixed(1)} s`);
  check('the start gas was off well before mainstage ended (bootstrap)', trace.some(x => x.cmd['TSV-332'] === 0 && x.n > 0.9 * pred.rpm && x.cmd['GOV-416'] === 1));
  const ss = run.alarms.filter(a => /REDLINE|WARNING/.test(a));
  check('no redline or warning on a nominal run', ss.length === 0, ss.join('; '));
  const tGO = s.log.items.find(e => /GOV-416 CLOSE/.test(e.text))?.t, tMO = s.log.items.find(e => /MOV-414 CLOSE/.test(e.text))?.t;
  check('shutdown: the gas generator before the main valves', tGO < tMO && tMO - tGO > 0.2, `${((tMO - tGO) * 1e3).toFixed(0)} ms apart`);
  check('the pumps coast down after the GG goes out', S.coast50 > 0.2 && S.coast50 < 6, `${S.coast50.toFixed(2)} s to half speed`);
}

console.log('throttling on the gas generator');
{
  const { run, M } = fire({ thrSteps: [1.0, 0.85, 0.7], settle: 4, dwell: 4 });
  check('a three-point throttle run completed', run && !run.aborted && M.points.length === 3, run?.abort || `${M?.points.length} points`);
  if (M.points.length === 3) {
    const [a, b, c] = M.points;
    check('speed, Pc and thrust fall with each step', a.N > b.N && b.N > c.N && a.Pc > b.Pc && b.Pc > c.Pc && a.F > b.F && b.F > c.F,
      M.points.map(p => `${p.N.toFixed(0)} rpm ${P(p.Pc)} ${p.F.toFixed(0)} N`).join(' → '));
    check('the GG mixture ratio stays put when both legs move together, so the TIT moves little (fuel-rich products cool a touch with pressure)', Math.abs(c.TIT - a.TIT) < 45, `${a.TIT.toFixed(0)} → ${c.TIT.toFixed(0)} K`);
    check('70 % on the GG is still well above half thrust', c.F / a.F > 0.5, `${(100 * c.F / a.F).toFixed(0)} %`);
  }
}

console.log('the gas generator mixture ratio');
{
  const { run, M } = fire({ thrFu: 0.88, thrOx: 1.0 });
  const p0 = M.points[0];
  check('less GG fuel: a slightly hotter turbine inlet, but less gas — a slower engine', p0 && NOM && p0.TIT > NOM.TIT + 5 && p0.N < 0.98 * NOM.N && !run.aborted,
    `${p0?.TIT.toFixed(0)} K, ${p0?.N.toFixed(0)} rpm vs ${NOM?.TIT.toFixed(0)} K, ${NOM?.N.toFixed(0)} rpm ${run.abort || ''}`);
}

console.log('starts that go wrong');
{
  const { run } = fire({ startP: psi(120), spinEnd: 0.75, ggOpen: 0.6, mainOpen: 0.4 });
  check('too little start gas, cut too early: a START HANG, aborted', run.aborted && /START HANG|did not light|pressure low/.test(run.abort), run.abort || 'not aborted');
}
{
  const { run, S } = fire({ startP: psi(380), spinEnd: 2.4 });
  check('too much start gas, left on too long: OVERSPEED, aborted', run.aborted && /OVERSPEED/.test(run.abort), `${run.abort || 'not aborted'}; peak ${S?.Npeak?.toFixed(0)}`);
}
{
  const { run } = fire({}, { fault: s => { s.model.gg.igniter.fail = true; } });
  check('no spark in the gas generator: the GG light check aborts', run.aborted && /gas generator did not light|START HANG/.test(run.abort), run.abort || 'not aborted');
}
{
  const { run } = fire({}, { fault: s => { s.model.chamber.igniter.fail = true; } });
  check('no spark in the main chamber: the ignition check aborts', run.aborted && /no ignition/.test(run.abort), run.abort || 'not aborted');
}
{
  const { run, S, M } = fire({}, { fault: s => { s.model.gg.igniter.weak = 0.25; } });
  check('a late GG light: a hard start in the gas generator (PT-333 spike)', S.start === 'gg-hard' && S.PggPeak > 1.6 * M.points[0].Pgg, `${S.start}; peak ${(S.PggPeak / psi(1)).toFixed(0)} psig vs ${(M.points[0]?.Pgg / psi(1)).toFixed(0)} ${run.abort || ''}`);
}
{
  const { run, S } = fire({}, { fault: s => { s.model.element('GOV-416').strokeScale = 7; } });
  check('a slow GG oxidiser valve: a nominal start, a hot SHUTDOWN', S.start === 'smooth' && /TURBINE INLET OVER TEMPERATURE/.test(run.abort || ''), `${S.start}; ${run.abort || 'no abort'}`);
}

console.log('a manual cutoff shuts the gas generator first');
{
  const { s, ex } = ready();
  ex('plan', { plan: { mode: 'hot', duration: 20 } }); ex('record', { on: true }); s.run(0.5);
  ex('arm'); ex('fire'); s.run(5 + 4);
  ex('cutoff'); s.run(1.0);
  const tG = s.log.items.find(e => /GOV-416 CLOSE/.test(e.text))?.t, tM = s.log.items.find(e => /MOV-414 CLOSE/.test(e.text))?.t;
  check('GOV-416 shut at cutoff, MOV-414 a quarter-second later', tG && tM && tM - tG > 0.2 && tM - tG < 0.4, `${((tM - tG) * 1e3).toFixed(0)} ms`);
}

console.log('a long burn on the ablative chamber');
{
  const { run, M, S } = fire({ duration: 55 }, {}, 30);
  check('55 s completed', run && !run.aborted, run?.abort || '');
  check('the throat eroded: Pc drifts down through the burn', S.PcDrift < -0.0015 && S.PcDrift > -0.02, `${(100 * S.PcDrift).toFixed(2)} % per 10 s`);
  check('the case warmed late in the burn and kept warming after (soak-back)', S.caseShut > degC(45) && S.casePeak > S.caseShut + 5, `${(S.caseShut - 273.15).toFixed(0)} → ${(S.casePeak - 273.15).toFixed(0)} °C`);
  check('and stayed below its redline', S.casePeak < degC(250));
}

console.log('a pump-fed cold flow on water');
{
  const { s, ex } = ready({ prop: false });
  ex('plan', { plan: { mode: 'cold', duration: 8, startP: psi(200), mainOpen: 0.3 } }); ex('record', { on: true }); s.run(0.5);
  const a = s.execute('arm', {}, { confirmed: true }); ex('fire'); s.run(5 + 8 + 10);
  const run = s.runs[s.runs.length - 1], M = run?.metrics, pred = run?.meta.config.prediction;
  check('armed, ran, no abort', a.ok && run && !run.aborted, JSON.stringify(a.blocked || run?.abort || ''));
  const p0 = M?.points[0];
  check('reduced as a cold flow', M?.kind === 'ggcold' && !!p0);
  if (p0 && pred) {
    check('speed on start gas within 5 % of the drawing prediction', Math.abs(p0.N / pred.rpm - 1) < 0.05, `${p0.N.toFixed(0)} vs ${pred.rpm.toFixed(0)} rpm`);
    const ab = steadyGG(def, { fluids: { ox: FLUIDS_G.water, fu: FLUIDS_G.water }, cold: { P: A + psi(200), T: 293 } });
    check('flows within 4 % of the as-built engine on the same start gas', Math.abs(p0.mdotOx / ab.mdotOx - 1) < 0.04 && Math.abs(p0.mdotFu / ab.mdotFu - 1) < 0.04, `${p0.mdotOx.toFixed(3)}/${p0.mdotFu.toFixed(3)} vs ${ab.mdotOx.toFixed(3)}/${ab.mdotFu.toFixed(3)}`);
    check('and the drawing over-predicts the ox side (the as-built ox injector is smaller)', pred.mdotOx > p0.mdotOx, `${pred.mdotOx.toFixed(3)} vs ${p0.mdotOx.toFixed(3)}`);
    check('the injector CdA under pump feed recovers the as-built ox side (±3 %)', Math.abs(p0.cdaOx / (def.design.CdAox * def.asBuilt.ox) - 1) < 0.03, `${(p0.cdaOx * 1e6).toFixed(3)} mm²`);
  }
  check('nothing lit', !s.model.chamber.burning && s.model.chamber.peak.P < A + psi(80));
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
