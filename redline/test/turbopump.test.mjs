/* TS-3 and TPA-1, headless: the pump and turbine physics against their own
   laws, the steady prediction against the simulation, the three kinds of
   run through a full session and its reductions, the speed controller, the
   stand's rules, and the overspeed abort.
   run: node redline/test/turbopump.test.mjs */
import { BipropModel } from '../src/physics/biprop.js';
import { physics, FLUIDS3 } from '../src/content/stands/ts3-physics.js';
import def from '../src/content/stands/ts3-turbopump.js';
import { steadyTP } from '../src/physics/predict-tp.js';
import { Session } from '../src/sim/session.js';
import { psi, degC } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const P = x => x / psi(1);
const near = (a, b, tol) => Math.abs(a / b - 1) <= tol;

/* A bare model: water loaded, tanks at 50 psig, throttles set. */
function rig({ tank = 50, thr = 0.66, drive = 0, dv = true } = {}) {
  const m = new BipropModel({ physics }, {});
  m.load({ ox: FLUIDS3.water, fu: FLUIDS3.water }, { ox: 35, fu: 35 });
  const c = (id, v) => m.command(id, v);
  c('HV-300', 1); c('VV-413', 0); c('VV-423', 0); c('VV-301', 0); m.advance(3);
  c('IV-301', 1); m.advance(1);
  c('PR-410', psi(tank)); c('PR-420', psi(tank)); c('PR-330', psi(drive)); m.advance(6);
  c('FCV-418', thr); c('FCV-428', thr); m.advance(2);
  if (dv) { c('DV-414', 1); c('DV-424', 1); m.advance(2); }
  return m;
}

console.log('pump physics');
{
  const p = rig().tp.pumps.ox, rho = 998;
  const H = (n, q) => { p.n = n; p.f = 1; const t = p.terms(rho, q * rho * p.Q0); return (t.src - t.Rq * (q * rho * p.Q0) ** 2) / (rho * 9.80665); };
  check('affinity: head ∝ n² at the same flow coefficient', near(H(0.5, 0.5) / H(1, 1), 0.25, 1e-9), `${H(0.5, 0.5).toFixed(1)} m vs ${H(1, 1).toFixed(1)} m`);
  check('the head curve droops with flow, from a shutoff head above design', H(1, 0) > H(1, 1) && H(1, 1) > H(1, 1.5) && near(H(1, 1), p.H0, 0.001));
  p.n = 0;
  check('a stopped pump is a restriction (negative head with flow)', H(0, 0.5) < 0);
  const ox = { ...FLUIDS3.water, rho: 1140 }, a = p.terms(998, 0), b = p.terms(1140, 0);
  p.n = 1; const dw = p.terms(998, 0).src, dx = p.terms(1140, 0).src;
  check('a pump makes head, not pressure: ΔP scales with density', near(dx / dw, 1140 / 998, 1e-9));
}

console.log('the steady prediction against the simulation');
{
  for (const [drive, thr] of [[180, 0.66], [225, 0.5], [225, 0.9]]) {
    const m = rig({ drive, thr });
    m.command('TSV-332', 1); m.advance(8);
    const Ptin = m.net.vol('tin').P - physics.ambient.P;
    const r = steadyTP({ physics }, { tankOx: psi(50), tankFu: psi(50), thrOx: thr, thrFu: thr, Ptin, Pbank: m.net.vol('sup').P - physics.ambient.P });
    check(`drive ${drive} psig, throttle ${thr}: speed and flows within 2 % of the prediction at the measured turbine inlet`,
      near(m.tp.rpm, r.rpm, 0.02) && near(m.lines[0].mdot, r.mdotOx, 0.02) && near(m.lines[1].mdot, r.mdotFu, 0.02),
      `${m.tp.rpm.toFixed(0)} vs ${r.rpm.toFixed(0)} rpm, ox ${m.lines[0].mdot.toFixed(3)} vs ${r.mdotOx.toFixed(3)} kg/s`);
  }
}

console.log('suction, deadhead, runaway');
{
  const lo = rig({ tank: 8, drive: 225 }); lo.command('TSV-332', 1); lo.advance(6);
  const hi = rig({ tank: 50, drive: 225 }); hi.command('TSV-332', 1); hi.advance(6);
  check('at 8 psig tank pressure the ox pump cavitates: head well below the 50 psig case', lo.tp.pumps.ox.f < 0.9 && lo.tp.pumps.ox.dP < 0.9 * hi.tp.pumps.ox.dP,
    `f ${lo.tp.pumps.ox.f.toFixed(2)}, NPSHa ${lo.tp.pumps.ox.npsha.toFixed(1)} m vs required ${lo.tp.pumps.ox.npshr.toFixed(1)} m`);
  check('…and the cavitating pump unloads: vibration rises', lo.tp.vib > hi.tp.vib + 1, `${lo.tp.vib.toFixed(2)} vs ${hi.tp.vib.toFixed(2)} g`);
  const dh = rig({ drive: 225, dv: false }); dh.command('TSV-332', 1); dh.advance(6);
  check('deadheaded (discharge valves shut): the shaft runs away well past design', dh.tp.rpm > 1.15 * hi.tp.rpm, `${dh.tp.rpm.toFixed(0)} vs ${hi.tp.rpm.toFixed(0)} rpm`);
  check('…and the water in the casings heats', dh.tp.pumps.ox.Tc > hi.tp.pumps.ox.Tc + 3, `${(dh.tp.pumps.ox.Tc - 273.15).toFixed(1)} vs ${(hi.tp.pumps.ox.Tc - 273.15).toFixed(1)} °C`);
  const tur = hi.tp, md = hi.net.el('TNZ-337').mdot;
  check('the turbine\'s gas leaves colder by exactly the work it did', Math.abs(md * hi.net.gas.cp * (hi.net.vol('tin').T - tur.Texh) / tur.Pt - 1) < 1e-6);
}

/* ---- a full session -------------------------------------------------- */
function session(plan, { fault = null, tank = 50, extra = null, seed = 9 } = {}) {
  const S = new Session({ def, mode: 'independent', seed, fault });
  const ex = (a, x = {}) => S.execute(a, x, { confirmed: true });
  ex('daqPower', { on: true }); S.run(5);
  ex('zero', { ids: def.sensors.filter(x => x.kind === 'PT').map(x => x.id) });
  ex('tare', { ids: ['WT-411', 'WT-421'] });
  ex('tech', { task: 'fillTanks' }); S.run(91);
  ex('tech', { task: 'turnRotor' }); S.run(31);
  ex('tech', { task: 'openHV' }); S.run(9);
  for (const id of ['VV-301', 'VV-413', 'VV-423']) ex('valve', { id, open: false });
  ex('valve', { id: 'IV-301', open: true }); S.run(2);
  ex('clearCell'); S.run(7); ex('pa', { text: 'TS-3 spin' });
  ex('regSet', { id: 'PR-410', value: psi(tank) }); ex('regSet', { id: 'PR-420', value: psi(tank) }); S.run(20);
  ex('daqRate', { rate: 2000 });
  ex('plan', { plan: { mode: 'spin', ctl: 'speed', speed: 36000, ramp: 3, duration: 10, thr: 0.66, ...plan } });
  if (extra) extra(S, ex);
  S.run(0.5);
  ex('record', { on: true }); S.run(0.5);
  const poll = S.startPoll(); S.concludePoll(poll, Object.fromEntries(poll.stations.map(x => [x.id, 'GO'])), 'GO');
  const arm = ex('arm'), fire = ex('fire');
  const span = def.holdTime(S.controller.plan) + 6 + 12;
  S.run(span);
  return { S, poll, arm, fire, run: S.runs[S.runs.length - 1] };
}

console.log('a spin at design speed, through the session');
{
  const { S, poll, run } = session({});
  const nogo = poll.stations.flatMap(st => st.items.filter(i => !i.ok).map(i => i.label));
  check('the go/no-go poll is clean but for the leak check not performed', nogo.length === 1 && /Leak/.test(nogo[0]), nogo.join('; '));
  const m = run?.metrics, pt = m?.points?.[0], pr = run?.meta.config.prediction;
  check('a recorded, un-aborted run with no alarms', !!m && !run.aborted && !run.alarms.length, run?.alarms?.join('; '));
  check('speed control holds 36 000 rpm within 0.3 %, overshoot under 1 %', pt && near(pt.N, 36000, 0.003) && m.summary.overshoot < 0.01,
    `${pt?.N.toFixed(0)} rpm, overshoot ${(100 * m.summary.overshoot).toFixed(2)} %`);
  check('head and flow of both pumps within 1.5 % of the prediction',
    near(pt.HOx, pr.headOx, 0.015) && near(pt.HFu, pr.headFu, 0.015) && near(pt.mdotOx, pr.mdotOx, 0.015) && near(pt.mdotFu, pr.mdotFu, 0.015),
    `ox ${pt.HOx.toFixed(1)} vs ${pr.headOx.toFixed(1)} m, fuel ${pt.HFu.toFixed(1)} vs ${pr.headFu.toFixed(1)} m`);
  check('turbine efficiency from the temperatures, near the prediction', near(pt.etaT, pr.etaT, 0.05), `${pt.etaT.toFixed(3)} vs ${pr.etaT.toFixed(3)}`);
  check('spin-up to 90 % in about the ramp time; coast-down to half speed in about a second',
    m.summary.spinup > 2.5 && m.summary.spinup < 3.5 && m.summary.coast50 > 0.7 && m.summary.coast50 < 1.6, `${m.summary.spinup.toFixed(2)} s, ${m.summary.coast50.toFixed(2)} s`);
  check('the shaft load after shut-off agrees with the turbine power within 15 %', near(m.summary.loadPower, pt.Pturb, 0.15),
    `${(m.summary.loadPower / 1e3).toFixed(2)} vs ${(pt.Pturb / 1e3).toFixed(2)} kW`);
  check('the cold drive gas leaves the turbine below −50 °C', pt.Texh < degC(-50), `${(pt.Texh - 273.15).toFixed(0)} °C`);
  check('discharge valves closed only after the coast-down, and the stand left safe', S.controller.cmd['DV-414'] === 0 && S.controller.cmd['TSV-332'] === 0 && !S.controller.armed);
}

console.log('a pump map: five throttle points at constant speed');
{
  const { run } = session({ mode: 'map', thrSteps: [0.4, 0.55, 0.7, 0.85, 1.0], dwell: 4 });
  const pts = run.metrics.points, pr = run.meta.config.prediction.map;
  check('five points, each within 0.5 % of 36 000 rpm', pts.length === 5 && pts.every(p => near(p.N, 36000, 0.005)), pts.map(p => p.N.toFixed(0)).join(', '));
  check('head falls as flow rises, point by point (both pumps)', pts.every((p, k) => k === 0 || (p.QnOx > pts[k - 1].QnOx && p.HnOx < pts[k - 1].HnOx && p.HnFu < pts[k - 1].HnFu)));
  check('every map point within 2 % of its predicted head', pts.every((p, k) => near(p.HOx, pr[k].headOx, 0.02) && near(p.HFu, pr[k].headFu, 0.02)),
    pts.map((p, k) => `${p.HOx.toFixed(0)}/${pr[k].headOx.toFixed(0)}`).join(' '));
}

console.log('a suction test: the ox tank ramped down at design speed');
{
  const { run } = session({ mode: 'suction', side: 'ox', thr: 0.66, pEnd: psi(3), rate: psi(1.5), settle: 3, duration: 40 });
  const S = run.metrics.summary, pr = run.meta.config.prediction;
  check('the head broke down 3 % and the reduction found where', Number.isFinite(S.npshr3), `NPSHr ${S.npshr3?.toFixed(1)} m at ${P(S.tankAtBreak).toFixed(1)} psig`);
  check('the measured NPSH required is within 10 % of the design curve at this flow', near(S.npshr3, pr.npshrOx, 0.10), `${S.npshr3.toFixed(1)} vs ${pr.npshrOx.toFixed(1)} m`);
  check('the speed was held through the breakdown', near(S.NAtBreak, 36000, 0.01), `${S.NAtBreak.toFixed(0)} rpm`);
}

console.log('the stand\'s rules');
{
  const S = new Session({ def, mode: 'independent', seed: 3 });
  S.execute('daqPower', { on: true }); S.execute('clearCell'); S.run(7);
  const r1 = S.execute('arm', {}, { confirmed: true });
  check('nothing arms with empty tanks', r1.ok === false && /empty/.test(r1.blocked?.msg || ''), r1.blocked?.msg);
  S.controller.loaded = 'water';
  S.execute('plan', { plan: { speed: 39000 } });
  const r2 = S.execute('arm', {}, { confirmed: true });
  check('a plan above 105 % speed is refused', r2.ok === false && r2.blocked?.id === 'FIRE-SPEED', r2.blocked?.id);
  const G = new Session({ def, mode: 'guided', seed: 3 });
  const r3 = G.execute('valve', { id: 'TSV-332', open: true });
  check('the turbine start valve cannot be opened by hand (guided)', r3.ok === false && r3.blocked?.id === 'MAIN-MANUAL');
  const r4 = S.execute('valve', { id: 'TSV-332', open: true });
  check('…and an independent conductor is warned before doing it', r4.ok === false && r4.confirm?.some(c => c.id === 'MAIN-MANUAL'));
}

console.log('overspeed: pressure control with too much drive');
{
  const { S, run } = session({ ctl: 'pressure', duration: 8, thr: 0.4 }, { extra: (S, ex) => ex('regSet', { id: 'PR-330', value: psi(380) }) });
  check('the run aborted on the speed redline', run.aborted && /OVERSPEED/.test(run.abort), run.abort);
  const peak = run.metrics?.summary?.Npeak ?? Math.max(...run.data.series('SPD'));
  // the turbine valve takes ~90 ms to shut, and the shaft is still being
  // driven hard: the peak overshoots the redline. That margin is why a
  // redline sits well below the rotor's burst speed.
  check('the drive was cut fast enough to hold the peak under 120 % (burst margin)', peak < 1.20 * 36000 && peak > 1.10 * 36000, `${peak.toFixed(0)} rpm`);
  check('abort: turbine valve shut, discharge valves shut after the coast, rotor stopped', S.controller.cmd['TSV-332'] === 0 && S.controller.cmd['DV-414'] === 0 && S.model.tp.rpm < 6000);
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
