/* Headless physics and instrumentation checks — Node, no DOM.
   run: node redline/test/physics.test.mjs */
import def from '../src/content/stands/ts1-coldgas.js';
import { ColdGasModel } from '../src/physics/coldgas.js';
import { GASES, flowFunction, orificeFlow, prepareGas } from '../src/physics/gas.js';
import { Nozzle } from '../src/physics/nozzle.js';
import { Sensor } from '../src/instruments/sensor.js';
import { Rng } from '../src/lib/rng.js';
import { psi, mm, degC } from '../src/lib/units.js';

let failures = 0, count = 0;
const check = (label, cond, detail = '') => {
  count++;
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};
const N2 = prepareGas(GASES.N2);
const Pa = def.physics.ambient.P;
const pg = (m, id) => (m.net.vol(id).P - Pa) / psi(1);

/* A stand brought to lock-up at `set` psig with everything open. */
function pressurised(set = 150, opts = {}) {
  const m = new ColdGasModel(def);
  if (opts.setup) opts.setup(m);
  m.command('HV-100', 1); m.advance(3);
  m.command('VV-101', 0); m.command('VV-201', 0); m.command('IV-101', 1); m.advance(1.2);
  m.command('PR-101', psi(set)); m.advance(set / 25 + 3);
  return m;
}

console.log('gas flow');
{
  check('choked flux constant below critical ratio', Math.abs(flowFunction(0.1, N2) - flowFunction(0.5, N2)) < 1e-12);
  check('critical pressure ratio 0.528 for N2', Math.abs(N2.prCrit - 0.5283) < 1e-3, N2.prCrit.toFixed(4));
  let mono = true, prev = Infinity;
  for (let pr = 0.53; pr < 1; pr += 0.001) { const f = flowFunction(pr, N2); if (f > prev + 1e-12) mono = false; prev = f; }
  check('flux falls monotonically from choking to equal pressure', mono);
  check('flux is continuous at the choking point', Math.abs(flowFunction(N2.prCrit + 1e-6, N2) - N2.fChoke) < 1e-3);
  const a = orificeFlow(1e-6, 2e5, 300, 1e5, 300, N2), b = orificeFlow(1e-6, 1e5, 300, 2e5, 300, N2);
  check('orifice flow is antisymmetric', Math.abs(a + b) < 1e-15);
}

console.log('nozzle');
{
  const nz = new Nozzle({ throatDia: mm(2.5), exitDia: mm(3.55), Cd: 0.97, halfAngleDeg: 15 }, N2);
  check('expansion ratio ≈ 2.0', Math.abs(nz.eps - 2.016) < 0.01, nz.eps.toFixed(3));
  const T = 290, Pc = 1.0e6;
  const o = nz.evaluate(Pc, T, Pa, T);
  const ideal = nz.Cd * nz.At * Pc * N2.fChoke / Math.sqrt(N2.R * T);
  check('choked mass flow = Cd·At·Pc·Γ/√RT', Math.abs(o.mdot / ideal - 1) < 1e-9);
  // continuity of mass flow at the choking boundary
  const PcCh = Pa / nz.prSub;
  const m1 = nz.evaluate(PcCh * 0.9999, T, Pa, T).mdot, m2 = nz.evaluate(PcCh * 1.0001, T, Pa, T).mdot;
  check('mass flow continuous across choking', Math.abs(m1 / m2 - 1) < 0.01, `${(m1 * 1e3).toFixed(3)} / ${(m2 * 1e3).toFixed(3)} g/s`);
  // F vs Pc is linear with a negative intercept (−Pa·Ae) in the attached regime
  const F = p => nz.evaluate(p, T, Pa, T).F;
  const p1 = 8e5, p2 = 1.6e6;
  const slope = (F(p2) - F(p1)) / (p2 - p1), icpt = F(p1) - slope * p1;
  check('thrust linear in Pc (attached flow)', Math.abs(F(1.2e6) - (slope * 1.2e6 + icpt)) < 1e-3 * F(1.2e6));
  check('thrust intercept ≈ −Pa·Ae', Math.abs(icpt / (-Pa * nz.Ae) - 1) < 0.02, `${icpt.toFixed(3)} N vs ${(-Pa * nz.Ae).toFixed(3)} N`);
  check('separated at low Pc, attached at nominal', nz.evaluate(3e5, T, Pa, T).regime === 'separated' && F(1.1e6) > 0 && nz.evaluate(1.1e6, T, Pa, T).regime !== 'separated');
  check('no thrust below ambient', F(0.9e5) === 0);
  let neg = false; for (let p = Pa; p < 2e6; p += 2e3) if (F(p) < 0) neg = true;
  check('thrust never negative', !neg);
}

console.log('pressurisation and lock-up');
{
  const m = pressurised(150);
  const lp = pg(m, 'lp'), feed = pg(m, 'feed');
  check('regulator locks up within 2 psi of setpoint', Math.abs(lp - 150) < 2, lp.toFixed(2) + ' psig');
  check('no flow: PT-201 and PT-301 read the same pressure', Math.abs(lp - feed) < 0.05);
  // numerical quiet: truth should not oscillate at steady state
  let mn = Infinity, mx = -Infinity;
  m.advance(1, () => { const p = m.net.vol('lp').P; mn = Math.min(mn, p); mx = Math.max(mx, p); });
  check('locked-up system is numerically quiet', (mx - mn) < psi(0.02), `${((mx - mn) / psi(1)).toFixed(4)} psi p-p`);
  // closed system conserves mass
  const M0 = m.net.totalMass();
  m.advance(2);
  check('mass conserved with every exit closed', Math.abs(m.net.totalMass() / M0 - 1) < 1e-9);
}

console.log('steady firing at 150 psig');
{
  const m = pressurised(150);
  const i0 = m.impulse, m0 = m.massOut;
  let tOpen = null, t10 = null, t90 = null;
  const tCmd = m.t;
  m.command('SV-301', 1);
  let Fmax = 0, zc = [], prevF = null, mean = 6.2;
  m.advance(0.25, t => {
    const pc = pg(m, 'chamber');
    if (tOpen === null && m.net.el('SV-301').pos > 0.01) tOpen = t;
    if (t10 === null && pc > 13.7) t10 = t;
    if (t90 === null && pc > 123.8) t90 = t;
    Fmax = Math.max(Fmax, m.stand.y);
    const f = m.stand.y - mean;
    if (prevF !== null && prevF < 0 && f >= 0 && t - tCmd > 0.01) zc.push(t);
    prevF = f;
  });
  m.advance(2.75);
  const Pc = pg(m, 'chamber'), F = m.nozzleEl.F, md = m.nozzleEl.mdot;
  check('valve opening delay 3–10 ms', tOpen - tCmd > 0.003 && tOpen - tCmd < 0.010, ((tOpen - tCmd) * 1e3).toFixed(2) + ' ms');
  check('chamber pressure rise 10→90 % under 10 ms', t90 - t10 < 0.010 && t90 > t10, ((t90 - t10) * 1e3).toFixed(2) + ' ms');
  check('Pc 130–145 psig', Pc > 130 && Pc < 145, Pc.toFixed(2));
  check('thrust 5.8–6.6 N', F > 5.8 && F < 6.6, F.toFixed(3) + ' N');
  check('mass flow 10–13 g/s', md > 0.010 && md < 0.013, (md * 1e3).toFixed(2) + ' g/s');
  const Isp = (m.impulse - i0) / ((m.massOut - m0) * 9.80665);
  check('sea-level Isp 50–60 s', Isp > 50 && Isp < 60, Isp.toFixed(1) + ' s');
  check('regulator droops under flow', pg(m, 'lp') < 149 && pg(m, 'lp') > 140, pg(m, 'lp').toFixed(2));
  check('pressure falls down the line: lp > feed > chamber', pg(m, 'lp') > pg(m, 'feed') && pg(m, 'feed') > Pc);
  check('thrust stand overshoots the step', Fmax > F * 1.2, `${Fmax.toFixed(2)} N peak`);
  const fr = zc.length > 3 ? (zc.length - 1) / (zc[zc.length - 1] - zc[0]) : 0;
  check('stand rings near its 120 Hz natural frequency', fr > 100 && fr < 135, fr.toFixed(1) + ' Hz');
  check('JT cooling: feed gas below ambient during flow', m.net.vol('feed').T < degC(19), (m.net.vol('feed').T - 273.15).toFixed(1) + ' °C');
  const tClose = m.t;
  m.command('SV-301', 0);
  let tc = null;
  m.advance(0.1, t => { if (tc === null && pg(m, 'chamber') < 0.1 * Pc) tc = t; });
  check('chamber pressure decays to 10 % within 20 ms of command', tc !== null && tc - tClose < 0.020, ((tc - tClose) * 1e3).toFixed(1) + ' ms');
  m.advance(1);
  check('lock-up after flow stops sits slightly above setpoint', pg(m, 'lp') > 150 && pg(m, 'lp') < 155, pg(m, 'lp').toFixed(2));
}

console.log('valve response vs inlet pressure');
{
  const delay = set => {
    const m = pressurised(set);
    const t0 = m.t; m.command('SV-301', 1);
    let t = null; m.advance(0.05, tt => { if (t === null && m.net.el('SV-301').pos > 0.01) t = tt; });
    return t - t0;
  };
  const d50 = delay(50), d200 = delay(200);
  check('higher inlet pressure delays opening of a normally-closed solenoid', d200 > d50, `${(d50 * 1e3).toFixed(2)} ms @50, ${(d200 * 1e3).toFixed(2)} ms @200`);
}

console.log('blowdown, dropout and relief');
{
  const m = pressurised(150);
  const P0 = pg(m, 'tank'), T0 = m.net.vol('tank').T;
  m.command('SV-301', 1); m.advance(20); m.command('SV-301', 0);
  const drop = P0 - pg(m, 'tank');
  check('bottle blows down 60–120 psi in 20 s', drop > 60 && drop < 120, drop.toFixed(1) + ' psi');
  check('bottle gas cools during blowdown', m.net.vol('tank').T < T0 - 0.3, (T0 - m.net.vol('tank').T).toFixed(2) + ' K');

  const low = pressurised(150, { setup: mm0 => {
    const t = mm0.net.vol('tank'); t.P = Pa + psi(300); t.m = t.P * t.V / (N2.R * t.T); t.U = t.m * N2.cv * t.T; } });
  low.command('SV-301', 1); low.advance(1);
  check('low supply: regulator drops out, outlet well below setpoint', pg(low, 'lp') < 135, pg(low, 'lp').toFixed(1) + ' psig at 300 psig supply');

  const rv = pressurised(150);
  rv.net.el('PR-101').stuckAt = 1;          // regulator fails wide open
  let pmax = 0; rv.advance(6, () => { pmax = Math.max(pmax, pg(rv, 'lp')); });
  check('relief valve caps a failed-open regulator below MAWP', pmax > 245 && pmax < 290, pmax.toFixed(1) + ' psig peak');
}

console.log('sensors');
{
  const rng = new Rng(7);
  let truth = psi(150);
  const s = new Sensor({ id: 'X', quantity: 'pressure', range: [0, psi(500)], noise: psi(0.06), hum: 0, tau: 0.0005, zeroSigma: 0, bits: 16 }, () => truth, rng);
  let t = 0;
  const run = (secs, rate = 1000) => { const vals = []; for (let k = 0; k < secs * 10000; k++) { t += 1e-4; s.update(t, 1e-4, 0.35 * rate); if (k % (10000 / rate) === 0) vals.push(s.sample(t, 1)); } return vals; };
  let v = run(0.5);
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
  check('sensor noise near spec', Math.abs(sd / psi(0.06) - 1) < 0.2, (sd / psi(1)).toFixed(4) + ' psi 1σ');
  s.zero();
  truth = 0; v = run(0.5);
  const m2 = v.slice(-100).reduce((a, b) => a + b, 0) / 100;
  check('a transducer zeroed at 150 psig reads ≈ −150 when vented', Math.abs(m2 / psi(1) + 150) < 1, (m2 / psi(1)).toFixed(2) + ' psig');
  s.zeroCorr = 0; truth = psi(900); v = run(0.2);
  check('output saturates just above full scale', Math.max(...v) <= psi(550) + 1 && Math.max(...v) > psi(500));
}

console.log(`\n${count - failures}/${count} passed`);
process.exit(failures ? 1 : 0);
