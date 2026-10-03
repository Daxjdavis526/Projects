/* TS-2 hot fire, headless: ignition, the start transient, steady combustion
   against the prediction, the reductions, instabilities, the heat-sink
   chamber's burn limit, and the rules that keep a cold-flow plan away from
   loaded propellants.
   run: node redline/test/hotfire.test.mjs */
import def from '../src/content/stands/ts2-biprop.js';
import { Session } from '../src/sim/session.js';
import { predictHot } from '../src/physics/predict-bp.js';
import { psi, degC } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);
const C = k => (k - 273.15).toFixed(0) + ' °C';

/* A stand with propellants loaded, both meters set for them, tanks at
   `p` psig, cell secured, load cell tared — ready for a plan. */
function ready({ p = 400, seed = 3, meterCal = true, fault = null } = {}) {
  const s = new Session({ def, mode: 'independent', seed });
  const ex = (a, x = {}) => s.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); s.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-716', 'WT-726'] }); ex('daqRate', { rate: 2000 });
  ex('tech', { task: 'loadPropellants' }); s.run(121);
  if (meterCal) { ex('meterCal', { line: 'ox', fluid: 'LOX' }); ex('meterCal', { line: 'fu', fluid: 'ethanol' }); }
  ex('tech', { task: 'openHV' }); s.run(9);
  for (const id of ['VV-601', 'VV-711', 'VV-721']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-601', open: true }); s.run(2); ex('clearCell'); s.run(7);
  ex('regSet', { id: 'PR-630', value: psi(150) }); ex('regSet', { id: 'PR-610', value: psi(p) }); ex('regSet', { id: 'PR-620', value: psi(p) });
  s.run(30);
  ex('tare', { ids: ['LC-901'] });
  if (fault) fault(s.model);
  return { s, ex };
}
function hotFire(opts = {}, plan = {}, tail = 10) {
  const { s, ex } = ready(opts);
  ex('plan', { plan: { mode: 'hot', duration: 2, lead: 0, ignLead: 0.5, ignOff: 1.0, ignCheck: 0.5, shutdown: 'ox-first', shutLag: 0.05, postPurge: 3, ...plan } });
  ex('record', { on: true }); s.run(0.5);
  ex('arm'); ex('fire');
  s.run(5 + (plan.duration ?? 2) + tail);
  ex('record', { on: false });
  const run = s.runs[s.runs.length - 1];
  return { s, run, M: run?.metrics, S: run?.metrics?.summary };
}

console.log('a clean hot fire against its prediction');
{
  const { s, run, M, S } = hotFire();
  check('the run fired and was not aborted', run && run.tFire !== null && !run.aborted, run?.abort || '');
  check('reduced as a hot fire', M?.kind === 'hotfire');
  check('it lit', S.ignited, `flame ${(S.ignDelay * 1e3).toFixed(0)} ms after the later main valve`);
  check('valve-to-flame is priming plus a few ms of ignition delay', S.ignDelay > 0.1 && S.ignDelay < 0.3, `${(S.ignDelay * 1e3).toFixed(0)} ms`);
  check('a smooth start at zero lead', S.start === 'smooth', `overshoot ${(S.overshoot * 100).toFixed(0)} %`);
  check('Pc rises in tens of milliseconds', S.rise > 0.003 && S.rise < 0.08, `${(S.rise * 1e3).toFixed(1)} ms`);
  // as-built prediction: the real injector and the real η_c*
  const asBuilt = predictHot(def, { Pox: psi(400), Pfu: psi(400), cdaOx: def.design.CdAox * 0.94, cdaFu: def.design.CdAfu * 1.03, eta: 0.94 });
  check('Pc matches the as-built prediction (±4 %)', Math.abs(S.Pc / asBuilt.Pc - 1) < 0.04, `${P(S.Pc).toFixed(1)} vs ${P(asBuilt.Pc).toFixed(1)} psig`);
  check('thrust matches the as-built prediction (±6 %)', Math.abs(S.F / asBuilt.F - 1) < 0.06, `${S.F.toFixed(0)} vs ${asBuilt.F.toFixed(0)} N`);
  check('mixture ratio matches the as-built prediction (±4 %)', Math.abs(S.MR / asBuilt.MR - 1) < 0.04, `${S.MR.toFixed(3)} vs ${asBuilt.MR.toFixed(3)}`);
  const drawing = s.prediction;
  check('the drawing prediction is off in the direction the cold flow says', drawing.kind === 'hotfire' && drawing.MR > S.MR, `drawing MR ${drawing.MR.toFixed(2)}, measured ${S.MR.toFixed(2)}`);
  check('c* efficiency recovers the as-built 0.94 (±0.02)', Math.abs(S.etaCstar - 0.94) < 0.02, S.etaCstar.toFixed(3));
  check('meters and scales agree on c* (±2 %)', Math.abs(S.cstar / S.cstarW - 1) < 0.02, `${S.cstar.toFixed(0)} vs ${S.cstarW.toFixed(0)} m/s`);
  check('thrust coefficient is plausible for ε≈3.8 at sea level', S.Cf > 1.3 && S.Cf < 1.5, S.Cf.toFixed(3));
  check('Isp is plausible for a small storable engine', S.Isp > 190 && S.Isp < 240, `${S.Isp.toFixed(0)} s`);
  check('injector stiff on both sides (ΔP/Pc > 0.25)', S.stiffOx > 0.25 && S.stiffFu > 0.25, `${S.stiffOx.toFixed(2)} / ${S.stiffFu.toFixed(2)}`);
  check('combustion smooth (σ/mean < 1 %)', S.rough < 0.01, `${(S.rough * 100).toFixed(2)} %`);
  check('the throat heats during the burn', S.TthShut > degC(150), C(S.TthShut));
  check('and keeps heating after shutdown (soak-back)', S.TthPeak > S.TthShut + 20, `${C(S.TthShut)} → ${C(S.TthPeak)}`);
  check('there is impulse after the valves close (dribble volume)', S.Ishut > 5 && S.Ishut < 0.3 * S.Itot, `${S.Ishut.toFixed(0)} of ${S.Itot.toFixed(0)} N·s`);
  check('no flags on a clean run', M.flags.length === 0, M.flags.join(', '));
  check('flame detector dark after shutdown', s.daq.latest('OD-804') < 1, s.daq.latest('OD-804').toFixed(2) + ' V');
}

console.log('the meter calibration fluid');
{
  const { M, S } = hotFire({ meterCal: false });
  check('a meter still set for water reads LOX low', S.mdotOx / S.mdotWOx < 0.92, `meter/scale ${(S.mdotOx / S.mdotWOx).toFixed(3)}`);
  check('…and ethanol high, so the metered mixture ratio is badly wrong', S.mdotFu / S.mdotWFu > 1.15 && Math.abs(S.MR / S.MRw - 1) > 0.2, `MR ${S.MR.toFixed(2)} metered, ${S.MRw.toFixed(2)} weighed`);
  check('the scales still give the right c* efficiency', Math.abs(S.etaCstarW - 0.94) < 0.025, S.etaCstarW.toFixed(3));
  check('the reduction flags the meter calibration', M.flags.includes('meter-cal'));
}

console.log('starts that go wrong');
{
  const { run, M, S } = hotFire({}, { lead: 0.2 });
  check('a 200 ms oxidiser lead is a hard start and aborts on overpressure', run.aborted && /overpressure/.test(run.abort), run.abort || '');
  check('and is reduced as one', S.start === 'hard' && M.flags.includes('hard-start'), `peak ${P(S.Pmax).toFixed(0)} psig`);
}
{
  const { run, S } = hotFire({}, { lead: 0.05 });
  check('a 50 ms lead lights rough but runs', !run.aborted && S.start !== 'smooth', `overshoot ${(S.overshoot * 100).toFixed(0)} % — ${S.start}`);
}
{
  const { run, S } = hotFire({ fault: m => { m.chamber.igniter.weak = 0.15; } });
  check('a late light (weak igniter) is a hard start', run.aborted && S.start === 'hard', run.abort || `overshoot ${(S.overshoot * 100).toFixed(0)} %`);
}
{
  const { run, M, S } = hotFire({ fault: m => { m.chamber.igniter.fail = true; } });
  check('no spark: no ignition, the ignition check aborts', run.aborted && /no ignition/.test(run.abort), run.abort || '');
  check('reduced as no ignition, with the unburned propellant counted', !S.ignited && M.flags.includes('no-ignition') && S.unburned > 0.05, `${(S.unburned * 1e3).toFixed(0)} g unburned`);
}

console.log('instability');
{
  // throttled down: injector ΔP falls as ṁ², chamber pressure only as ṁ,
  // so the injector gets softer the lower the tank pressure
  const { run, S } = hotFire({ p: 180 });
  check('throttled to 180 psig the injector is soft (ΔP/Pc < 0.2)', S.stiffOx < 0.2 && S.stiffFu < 0.2, `${S.stiffOx.toFixed(3)} / ${S.stiffFu.toFixed(3)}`);
  check('and it chugs', S.rough > 0.02 || /vibration/.test(run.abort || ''), `roughness ${(S.rough * 100).toFixed(1)} %, ${run.abort || 'no abort'}`);
  const { S: S2 } = hotFire({ p: 300 });
  check('at 300 psig it does not', S2.rough < 0.01 && S2.vibMax < 4, `roughness ${(S2.rough * 100).toFixed(2)} %, peak ${S2.vibMax.toFixed(1)} g`);
}
{
  const { run } = hotFire({ fault: m => { m.chamber.hf.drive = 400; } });
  check('screech trips the vibration redline', run.aborted && /vibration/.test(run.abort), run.abort || '');
}

console.log('the heat-sink chamber');
{
  const { run, S } = hotFire({}, { duration: 5 });
  check('a 5 s burn completes inside the throat redline', !run.aborted, run.abort || `${C(S.TthShut)} at shutdown`);
}
{
  const { run } = hotFire({ fault: m => { m.chamber.film = 1.5; } }, { duration: 5 });
  check('lose the film cooling and the throat redline ends it early', run.aborted && /throat/.test(run.abort), run.abort || '');
}

console.log('rules');
{
  const { s } = ready();
  const t = (a, x) => s.execute(a, x);
  s.execute('plan', { plan: { mode: 'single', duration: 2 } });
  const r = t('arm', {});
  check('propellants loaded + cold-flow plan: arming blocked', !r.ok && r.blocked && /cold flow/.test(r.blocked.msg), r.blocked?.msg || JSON.stringify(r));
  s.execute('plan', { plan: { mode: 'hot', duration: 8 } });
  const r2 = t('arm', {});
  check('hot plan beyond the burn limit: blocked or warned', !r2.ok, JSON.stringify(r2.blocked || r2.confirm?.map(c => c.id)));
  s.execute('plan', { plan: { mode: 'hot', duration: 2, lead: 0.4, ignCheck: 0.5 } });
  const r3 = t('arm', {});
  check('ignition check before both manifolds can prime: flagged', !r3.ok && JSON.stringify(r3).includes('IGNCHECK'), JSON.stringify(r3.blocked?.msg || r3.confirm?.map(c => c.id)));
}

console.log(`\n${count - failures}/${count} passed`);
if (failures) process.exit(1);
