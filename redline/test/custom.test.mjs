/* Custom hardware, headless: the builder against TS-1, the datasheet
   conversions, the pre-test checks, and a predicted test end to end.
   run: node redline/test/custom.test.mjs */
import ts1 from '../src/content/stands/ts1-coldgas.js';
import { buildColdGasStand, checkConfig, CV_TO_CDA } from '../src/content/stands/custom-coldgas.js';
import { defaultConfig, complete, FIELDS } from '../src/content/hardware/schema.js';
import { PRESETS } from '../src/content/hardware/presets.js';
import { predictColdGas } from '../src/physics/predict.js';
import { predictTest, describePrediction } from '../src/sim/predict-test.js';
import { psi } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);
const cfgWith = (base, over) => { const c = JSON.parse(JSON.stringify(base)); for (const [k, v] of Object.entries(over)) c.f[k] = { v, src: 'measured', note: '' }; return c; };

console.log('the schema');
{
  const c = defaultConfig('x');
  check('every field has a default, a source and a note', FIELDS.every(f => c.f[f.k] && c.f[f.k].src === 'default' && 'note' in c.f[f.k]));
  const part = complete({ name: 'old', f: { throat: { v: 1.2, src: 'measured', note: 'pin gauge' } } });
  check('an incomplete (older) configuration is completed with defaults', part.f.throat.v === 1.2 && part.f.regCv.src === 'default');
}

console.log('the reference configuration reproduces TS-1');
const ref = buildColdGasStand(defaultConfig('ref'));
for (const set of [60, 150, 200]) {
  const a = predictColdGas(ts1, { supplyGauge: psi(2200), regSet: psi(set) });
  const b = predictColdGas(ref, { supplyGauge: psi(2200), regSet: psi(set) });
  check(`${set} psig: Pc, thrust and flow within 1.5 % of TS-1`, Math.abs(b.Pc / a.Pc - 1) < 0.015 && Math.abs(b.F / a.F - 1) < 0.015 && Math.abs(b.mdot / a.mdot - 1) < 0.015,
    `Pc ${P(b.Pc).toFixed(1)} vs ${P(a.Pc).toFixed(1)}, F ${b.F.toFixed(3)} vs ${a.F.toFixed(3)}`);
}

console.log('datasheet conversions');
{
  const c = cfgWith(defaultConfig('x'), { regCv: 0.2, svCv: 0.5, throat: 1.8 });
  const d = buildColdGasStand(c), el = id => d.physics.elements.find(e => e.id === id);
  check('regulator Cv → effective area', Math.abs(el('PR-101').CdA / (0.2 * CV_TO_CDA) - 1) < 1e-9, `${(el('PR-101').CdA * 1e6).toFixed(2)} mm²`);
  check('solenoid Cv → effective area', Math.abs(el('SV-301').CdA / (0.5 * CV_TO_CDA) - 1) < 1e-9);
  check('throat into the nozzle and into the data system\'s nominal geometry', Math.abs(el('NZ-401').nozzle.throatDia - 1.8e-3) < 1e-12 && Math.abs(d.nominal.throatDia - 1.8e-3) < 1e-12);
  const o = buildColdGasStand(cfgWith(defaultConfig('x'), { svCv: 0, svOrifice: 2.0 }));
  check('orifice-only solenoid: Cd 0.8 × hole area', Math.abs(o.physics.elements.find(e => e.id === 'SV-301').CdA / (0.8 * Math.PI / 4 * 4e-6) - 1) < 1e-9);
  const coil = buildColdGasStand(cfgWith(defaultConfig('x'), { svVolts: 12, svWatts: 8 })).physics.elements.find(e => e.id === 'SV-301').coil;
  check('coil resistance from voltage and power', Math.abs(coil.ohms - 18) < 1e-9, `${coil.ohms} Ω`);
  const two = [buildColdGasStand(cfgWith(defaultConfig('a'), { throat: 2.0 })), buildColdGasStand(cfgWith(defaultConfig('a'), { throat: 3.0 }))];
  check('two configurations never share a prediction', two[0].predictKey !== two[1].predictKey
    && predictColdGas(two[0], { supplyGauge: psi(2200), regSet: psi(150) }).mdot < predictColdGas(two[1], { supplyGauge: psi(2200), regSet: psi(150) }).mdot);
  const he = buildColdGasStand(cfgWith(defaultConfig('x'), { gas: 'He' }));
  const pHe = predictColdGas(he, { supplyGauge: psi(2200), regSet: psi(150) }), pN = predictColdGas(ref, { supplyGauge: psi(2200), regSet: psi(150) });
  check('helium: much higher Isp, much less mass flow', pHe.Isp > 2.3 * pN.Isp && pHe.mdot < 0.5 * pN.mdot, `Isp ${pHe.Isp.toFixed(0)} vs ${pN.Isp.toFixed(0)} s`);
  const alt = buildColdGasStand(cfgWith(defaultConfig('x'), { Pamb: 12.2 }));
  check('at altitude the same chamber gives more thrust', predictColdGas(alt, { supplyGauge: psi(2200), regSet: psi(150) }).F > pN.F, 'site at 12.2 psia');
}

console.log('pre-test checks');
{
  const has = (cfg, re, set) => checkConfig(cfg, { regSet: set }).some(x => re.test(x.text));
  const base = defaultConfig('x');
  check('relief set above MAWP is an error', has(cfgWith(base, { rvSet: 350 }), /above the low-side MAWP/));
  check('test pressure above the solenoid MOPD is an error', has(cfgWith(base, { svMOPD: 100 }), /MOPD/, 150));
  check('a pilot valve below its minimum differential is an error', has(cfgWith(base, { svType: 'pilot', svMinDP: 200 }), /minimum differential/, 150));
  check('fill above the bottle rating is an error', has(cfgWith(base, { fillP: 3000 }), /service pressure/));
  check('a load cell too small for the thrust is flagged', has(cfgWith(base, { lcRange: 5 }), /load cell/, 150));
  check('a fire valve too small for the throat is flagged', has(cfgWith(base, { svCv: 0.15 }), /fire valve's flow area/, 150));
  check('the reference stand at 150 psig has no errors', !checkConfig(base, { regSet: 150 }).some(x => x.level === 'error'));
}

console.log('a pilot-operated valve below its minimum differential');
{
  const d = buildColdGasStand(cfgWith(defaultConfig('x'), { svType: 'pilot', svMinDP: 200 }));
  const p = predictColdGas(d, { supplyGauge: psi(2200), regSet: psi(100) });
  const q = predictColdGas(ref, { supplyGauge: psi(2200), regSet: psi(100) });
  check('it opens only partway: lower chamber pressure', p.Pc < 0.8 * q.Pc, `${P(p.Pc).toFixed(1)} vs ${P(q.Pc).toFixed(1)} psig`);
}

console.log('a predicted test, end to end');
for (const preset of PRESETS) {
  const d = buildColdGasStand(preset.make());
  const r = await predictTest(d, { regSet: 150, mode: 'single', duration: 2, rate: 2000 });
  const S = r.run?.metrics?.summary;
  check(`${preset.name}: a recorded, reduced, un-aborted 2 s burn`, !!S && !r.aborted && Math.abs(S.dur - 2) < 0.1, r.abort || `${S?.dur?.toFixed(2)} s`);
  check(`${preset.name}: no alarms on a nominal run`, !(r.run?.alarms || []).length, (r.run?.alarms || []).join('; '));
  const st = predictColdGas(d, { supplyGauge: psi(d.custom.f.fillP.v), regSet: psi(150) });
  check(`${preset.name}: the recorded Pc agrees with the steady prediction (±3 %)`, Math.abs(S.Pc / st.Pc - 1) < 0.03, `${P(S.Pc).toFixed(1)} vs ${P(st.Pc).toFixed(1)} psig`);
  check(`${preset.name}: a plain-language description`, describePrediction(r, d).length >= 4);
}
{
  const c = PRESETS[1].make();
  const d = buildColdGasStand(c);
  const r = await predictTest(d, { regSet: 150, mode: 'single', duration: 2, rate: 2000 });
  const S = r.run.metrics.summary;
  // the datasheet droop point, scaled linearly to this flow and inlet pressure
  const f = c.f, rhoStd = 101325 / (296.8 * 288.71);
  const mD = f.droopQ.v * 4.7195e-4 * rhoStd;
  const flow = Number.isFinite(S.mdotFM) ? S.mdotFM : S.mdot;
  const expect = f.droopP.v * (flow / mD) * (f.droopPin.v + 14.7) / (f.fillP.v + 14.7);
  check('regulator droop follows the datasheet flow-curve point (±30 %)', Math.abs(P(S.droop) / expect - 1) < 0.3, `${P(S.droop).toFixed(1)} psi vs ${expect.toFixed(1)} expected`);
  check('opening delay is of the order of the datasheet response time', S.delay > 0.6 * f.svTopen.v / 1e3 && S.delay < 2 * f.svTopen.v / 1e3, `${(S.delay * 1e3).toFixed(1)} ms vs ${f.svTopen.v} ms stated`);
  const p = await predictTest(d, { regSet: 150, mode: 'pulse', on: 50, off: 100, count: 5, rate: 5000 });
  check('a pulse train predicts an impulse bit', p.run?.metrics?.summary?.Ibit > 0, `${(p.run?.metrics?.summary?.Ibit * 1e3).toFixed(1)} mN·s`);
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
