// The virtual lab bench (model/lab-bench.js, behind sims/lab-bench.js and the
// PHYS 2215 lab lessons): the statistics and least-squares formulas against
// hand calculations, seeded noise that is deterministic and honest (error
// bars that are true standard deviations: pulls of mean 0 and width 1,
// χ²/dof near 1), and every injected systematic error doing exactly what its
// label says — moving the intercept, or the slope, by the predicted amount.
//   node atlas/test/lab-bench.test.mjs

import * as B from '../src/viz/model/lab-bench.js';
import { validate } from '../src/viz/sims/lab-bench.js';
import { makeRng } from '../src/core/rng.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const D2R = Math.PI / 180;

// ─── random numbers, rounding, statistics ──────────────────────────────────
{
  const rng = makeRng(42), z = Array.from({ length: 40000 }, () => B.gaussian(rng));
  const st = B.stats(z);
  check('gaussian deviates have mean 0', Math.abs(st.mean) < 0.02, st.mean);
  check('gaussian deviates have SD 1', Math.abs(st.sd - 1) < 0.02, st.sd);
  const within = z.filter((x) => Math.abs(x) < 1).length / z.length;
  check('68 % of gaussian deviates lie within ±1', Math.abs(within - 0.6827) < 0.01, within);
  const again = makeRng(42);
  check('the same seed gives the same deviates', B.gaussian(again) === z[0] && B.gaussian(again) === z[1]);
}
check('roundTo 1 ms', B.roundTo(0.31249, 0.001) === 0.312 && B.roundTo(0.3125001, 0.001) === 0.313);
check('roundTo 0.5°', B.roundTo(22.74, 0.5) === 22.5 && B.roundTo(22.76, 0.5) === 23);
check('roundTo 0.1 ms keeps no float dust', String(B.roundTo(0.01234567, 0.0001)) === '0.0123');
{
  const st = B.stats([2, 4, 4, 4, 5, 5, 7, 9]);
  check('stats: mean 5', near(st.mean, 5));
  check('stats: population SD 2', near(st.sdPop, 2));
  check('stats: sample SD √(32/7)', near(st.sd, Math.sqrt(32 / 7)));
  check('stats: SEM = SD/√N', near(st.sem, Math.sqrt(32 / 7) / Math.sqrt(8)));
  const one = B.stats([3.2]);
  check('stats: one reading has a mean but no SD', one.mean === 3.2 && Number.isNaN(one.sd));
}
check('resolution uncertainty: step/(2√3)', near(B.resolutionU(0.01), 0.01 / (2 * Math.sqrt(3))));
check('discrepancy in combined σ', near(B.discrepancy(9.79, 0.03, 9.83, 0.04), 0.8));
{
  const r = B.pm(9.81067, 0.04376);
  check('pm: σ to two figures, value to match', r.v === '9.811' && r.s === '0.044', JSON.stringify(r));
  const q = B.pm(1011.9, 10.4);
  check('pm: large values round to the same place', q.v === '1012' && q.s === '10', JSON.stringify(q));
}

// ─── least squares against hand formulas ───────────────────────────────────
{
  const x = [1, 2, 3, 4, 5, 6], y = x.map((v) => 0.7 + 2.5 * v);
  const f = B.fitLine(x, y, x.map(() => 0.1));
  check('fitLine recovers an exact line', near(f.b, 2.5, 1e-12) && near(f.a, 0.7, 1e-12) && f.chi2 < 1e-20);
  // equal error bars σ: σ_b = σ/√Σ(x − x̄)², σ_a = σ√(Σx²/(NΣ(x − x̄)²))
  const Sxx = x.reduce((s, v) => s + (v - 3.5) ** 2, 0);
  check('fitLine σ_b = σ/√Σ(x−x̄)² for equal error bars', near(f.sb, 0.1 / Math.sqrt(Sxx), 1e-12));
  check('fitLine σ_a = σ√(Σx²/(NΣ(x−x̄)²))', near(f.sa, 0.1 * Math.sqrt(x.reduce((s, v) => s + v * v, 0) / (6 * Sxx)), 1e-12));
  check('fitLine dof = N − 2', f.dof === 4);
}
{
  // Taylor-style unweighted fit: σ_y estimated from the residuals; slope from the closed form
  const x = [10, 20, 30, 40, 50], y = [8.0, 12.5, 16.5, 21.0, 24.4];
  const n = 5, Sx = 150, Sy = y.reduce((s, v) => s + v, 0), Sxx = x.reduce((s, v) => s + v * v, 0), Sxy = x.reduce((s, v, i) => s + v * y[i], 0);
  const D = n * Sxx - Sx * Sx, b = (n * Sxy - Sx * Sy) / D, a = (Sxx * Sy - Sx * Sxy) / D;
  const sy = Math.sqrt(y.reduce((s, v, i) => s + (v - a - b * x[i]) ** 2, 0) / (n - 2));
  const f = B.fitLine(x, y);
  check('unweighted fit: slope and intercept by the closed form', near(f.b, b, 1e-12) && near(f.a, a, 1e-12));
  check('unweighted fit: σ_b = σ_y√(N/Δ) with σ_y from the residuals', near(f.sb, sy * Math.sqrt(n / D), 1e-12));
  check('unweighted fit: σ_a = σ_y√(Σx²/Δ)', near(f.sa, sy * Math.sqrt(Sxx / D), 1e-12));
  const w = B.fitLine(x, y, x.map(() => 0.3));
  check('scaled σ of a weighted fit = unweighted σ when the bars are equal (numpy polyfit cov=True)', near(w.sbScaled, f.sb, 1e-12) && near(w.b, f.b, 1e-12));
}
{
  const x = [1, 2, 3, 4], y = [2.1, 3.9, 6.2, 7.8];
  const f = B.fitOrigin(x, y, x.map(() => 0.2));
  const Sxx = 30, Sxy = x.reduce((s, v, i) => s + v * y[i], 0);
  check('fitOrigin: b = Σxy/Σx² for equal bars', near(f.b, Sxy / Sxx, 1e-12));
  check('fitOrigin: σ_b = σ/√Σx²', near(f.sb, 0.2 / Math.sqrt(Sxx), 1e-12));
  check('fitOrigin: dof = N − 1', f.dof === 3);
}
{
  // errors in x only: the effective-variance fit of y on x gives the slope that the
  // ordinary fit of x on y gives, inverted
  const rng = makeRng(5), x0 = [0.5, 1, 1.5, 2, 2.5, 3, 3.5], xs = x0.map((v) => v + 0.05 * B.gaussian(rng)), y = x0.map((v) => 3 * v);
  const fy = B.fitLine(xs, y, null, xs.map(() => 0.05));
  const fx = B.fitLine(y, xs, y.map(() => 0.05));
  check('effective variance: x errors give the inverse of the x-on-y slope', near(fy.b, 1 / fx.b, 1e-6), `${fy.b} vs ${1 / fx.b}`);
  check('effective variance: σ_b matches the x-on-y fit', near(fy.sb, fx.sb / fx.b ** 2, 1e-3), `${fy.sb} vs ${fx.sb / fx.b ** 2}`);
}

// ─── physics helpers ───────────────────────────────────────────────────────
check('a seconds pendulum: L = 0.993 m swings in 2.000 s at g = 9.80', Math.abs(2 * Math.PI * Math.sqrt(0.993 / 9.8) - 2) < 1e-4);
check('amplitude factor is 1 for tiny swings', near(B.amplitudeFactor(1e-6), 1, 1e-12));
check('amplitude factor at 60° is 1.07318', Math.abs(B.amplitudeFactor(60 * D2R) - 1.07318) < 1e-5);
check('amplitude factor ≈ 1 + θ²/16 + 11θ⁴/3072 at 0.3 rad', Math.abs(B.amplitudeFactor(0.3) - (1 + 0.09 / 16 + (11 * 0.0081) / 3072)) < 1e-6);
check('disc moment of inertia ½MR²', near(B.inertiaRotary(B.EXPERIMENTS.rotary.defaults), 0.5 * 1.4 * 0.114 ** 2, 1e-12));
check('disc + ring adds ½M(R₁² + R₂²)', near(B.inertiaRotary({ ...B.EXPERIMENTS.rotary.defaults, ring: true }), 0.5 * 1.4 * 0.114 ** 2 + 0.5 * 0.47 * (0.054 ** 2 + 0.064 ** 2), 1e-12));

// ─── every experiment ──────────────────────────────────────────────────────
const fitted = (id, opts) => B.analyse(id, B.makeData(id, opts).rows, opts);
for (const [id, E] of Object.entries(B.EXPERIMENTS)) {
  const a = B.makeData(id, { seed: 11 }), b = B.makeData(id, { seed: 11 }), c = B.makeData(id, { seed: 12 });
  check(`${id}: the same seed gives the same readings`, JSON.stringify(a.rows) === JSON.stringify(b.rows));
  check(`${id}: another seed gives other readings`, JSON.stringify(a.rows.map((r) => r.R)) !== JSON.stringify(c.rows.map((r) => r.R)));
  check(`${id}: readings sit on the instrument’s resolution`, a.rows.every((r) => r.R.every((v, k) => Math.abs(v / E.series[k].res - Math.round(v / E.series[k].res)) < 1e-6)));
  check(`${id}: re-reading rows reproduces them`, JSON.stringify(B.rereadRows(id, a.rows).map((r) => r.R)) === JSON.stringify(a.rows.map((r) => r.R)));
  for (const S of Object.values(E.systematics || {})) check(`${id}: systematic “${S.short}” is described`, S.label && S.explain && S.short);
  if (!E.axes) continue;
  for (const [ax, A] of Object.entries(E.axes)) {
    const r = fitted(id, { seed: 3, axes: ax });
    check(`${id}/${ax}: fits every series`, r.series.every((s) => s.fit && Number.isFinite(s.fit.b)));
    if (A.curved) { check(`${id}/${ax}: a curved plot is flagged by χ²/dof ≫ 1`, r.series[0].fit.chi2r > 10, r.series[0].fit.chi2r); continue; }
    check(`${id}/${ax}: results are finite`, r.results.every((q) => Number.isFinite(q.value) && q.sigma > 0));
  }
  // honest error bars: over many seeds the fitted slope scatters about the noise-free
  // fit by its own σ (pulls of mean ≈ 0, SD ≈ 1) and χ²/dof averages ≈ 1
  const ax = E.defaultAxes, truth = B.analyse(id, B.makeData(id, { noiseless: true }).rows, { axes: ax });
  const pulls = [], chis = [];
  for (let seed = 1; seed <= 300; seed++) {
    const r = fitted(id, { seed, axes: ax });
    r.series.forEach((s, k) => { pulls.push((s.fit.b - truth.series[k].fit.b) / s.fit.sb); chis.push(s.fit.chi2r); });
  }
  const sp = B.stats(pulls), sc = B.stats(chis);
  check(`${id}: slope pulls have mean ≈ 0`, Math.abs(sp.mean) < 0.2, sp.mean.toFixed(3));
  check(`${id}: slope pulls have SD ≈ 1 (honest error bars)`, sp.sd > 0.85 && sp.sd < 1.15, sp.sd.toFixed(3));
  if (id !== 'heater') check(`${id}: χ²/dof averages ≈ 1`, Math.abs(sc.mean - 1) < 0.15, sc.mean.toFixed(3));
}

// ─── noise-free data recover the physics ───────────────────────────────────
const exact = (id, opts = {}) => B.analyse(id, B.makeData(id, { noiseless: true, ...opts }).rows, opts);
{
  const r = exact('freefall');
  check('freefall: t against √h gives g = 9.80 exactly', near(r.results[0].value, 9.8, 1e-9) && Math.abs(r.series[0].fit.a) < 1e-12);
  const d = exact('freefall', { sys: 'delay' });
  check('freefall: the release delay is the intercept', near(d.series[0].fit.a, 0.012, 1e-9));
  check('freefall: the release delay leaves g alone on t against √h', near(d.results[0].value, 9.8, 1e-9));
  const sq = exact('freefall', { sys: 'delay', axes: 'square' });
  check('freefall: on t² against h the delay biases g low', sq.results[0].value < 9.6, sq.results[0].value);
}
{
  const r = exact('ramp'), z = exact('ramp', { sys: 'zero' });
  check('ramp: a = 2 × slope = g sin θ', near(r.results[0].value, 9.8 * Math.sin(2 * D2R), 1e-9));
  check('ramp: the sensor offset is the intercept, slope unchanged', near(z.series[0].fit.a, 0.05, 1e-9) && near(z.series[0].fit.b, r.series[0].fit.b, 1e-9));
  const ll = exact('ramp', { axes: 'loglog' }), llz = exact('ramp', { axes: 'loglog', sys: 'zero' });
  check('ramp: log–log slope is the power 2', near(ll.results[0].value, 2, 1e-9));
  check('ramp: an offset bends the log–log plot below 2', llz.results[0].value < 1.9);
}
{
  const r = exact('launcher'), z = exact('launcher', { sys: 'zero' });
  check('launcher: v₀ = √(g × slope)', near(r.results[0].value, 4.2, 1e-9));
  check('launcher: the tape offset is a −6.0 cm intercept', near(z.series[0].fit.a, -0.06, 1e-9) && near(z.results[0].value, 4.2, 1e-9));
}
{
  const r = exact('cart'), f = exact('cart', { sys: 'friction' });
  check('cart: M = 1/slope = 0.600 kg', near(r.results[0].value, 0.6, 1e-9));
  check('cart: friction is an intercept of −f/M', near(f.series[0].fit.a, -0.03 / 0.6, 1e-9) && near(f.results[0].value, 0.6, 1e-9));
  const o = B.analyse('cart', B.makeData('cart', { noiseless: true, sys: 'friction' }).rows, { sys: 'friction', origin: true });
  check('cart: forcing the friction data through the origin biases M high', o.results[0].value > 0.62, o.results[0].value);
}
{
  const r = exact('friction'), a = exact('friction', { sys: 'angle' });
  check('friction: slopes are μs and μk', near(r.results[0].value, 0.42, 1e-9) && near(r.results[1].value, 0.30, 1e-9));
  const fac = (mu) => 1 / (Math.cos(20 * D2R) + mu * Math.sin(20 * D2R));
  check('friction: a 20° pull scales each slope by 1/(cos α + μ sin α), intercept still 0', near(a.results[1].value, 0.3 * fac(0.3), 1e-9) && near(a.results[0].value, 0.42 * fac(0.42), 1e-9) && Math.abs(a.series[1].fit.a) < 1e-12);
  const z = exact('friction', { sys: 'zero' });
  check('friction: an unzeroed sensor is a +0.20 N intercept on both lines, slopes unchanged', near(z.series[0].fit.a, 0.2, 1e-9) && near(z.series[1].fit.a, 0.2, 1e-9) && near(z.results[1].value, 0.3, 1e-9));
}
{
  const r = exact('energy'), f = exact('energy', { sys: 'flag' });
  check('energy: K/U = 1 − μ cot θ for rolling friction', near(r.results[0].value, 1 - 0.004 / Math.tan(10 * D2R), 1e-9));
  check('energy: a wider flag scales v² by (2.50/2.60)²', near(f.results[0].value, r.results[0].value * (0.025 / 0.026) ** 2, 1e-9));
  const s6 = exact('energy', { params: { theta: 6 } }), s15 = exact('energy', { params: { theta: 15 } });
  check('energy: friction’s share μ cot θ grows on a shallower track', s6.results[0].value < r.results[0].value && r.results[0].value < s15.results[0].value);
  const f6 = exact('energy', { params: { theta: 6 }, sys: 'flag' });
  check('energy: the flag error’s factor does not depend on the angle', near(f6.results[0].value / s6.results[0].value, (0.025 / 0.026) ** 2, 1e-9));
}
{
  const r = exact('collision'), m = exact('collision', { sys: 'mass' });
  check('collision: momentum after = momentum before (slope 1)', near(r.results[0].value, 1, 1e-9) && Math.abs(r.series[0].fit.a) < 1e-12);
  check('collision: an unweighed 0.100 kg bar gives slope 1.000/1.100', near(m.results[0].value, 1 / 1.1, 1e-9));
}
{
  const r = exact('rotary'), f = exact('rotary', { sys: 'friction' }), ring = exact('rotary', { params: { ring: true } });
  check('rotary: slope of τ against α is I = ½MR²', near(r.results[0].value, 0.5 * 1.4 * 0.114 ** 2, 1e-9));
  check('rotary: bearing friction is the intercept, I unchanged', near(f.series[0].fit.a, 0.0015, 1e-9) && near(f.results[0].value, r.results[0].value, 1e-9));
  check('rotary: the ring adds its own moment of inertia', near(ring.results[0].value, B.inertiaRotary({ ...B.EXPERIMENTS.rotary.defaults, ring: true }), 1e-9));
}
{
  const r = exact('pendulum'), k = exact('pendulum', { sys: 'knot' }), big = exact('pendulum', { sys: 'amplitude' });
  const f5 = B.amplitudeFactor(5 * D2R) ** 2;
  check('pendulum: T² against L gives 4π²/g (×1.0004 for 5° swings)', near(r.series[0].fit.b, (4 * Math.PI ** 2 / 9.8) * f5, 1e-9));
  check('pendulum: lengths 2.5 cm short give an intercept 4π²r/g, slope unchanged', near(k.series[0].fit.a, (4 * Math.PI ** 2 * 0.025 / 9.8) * f5, 1e-9) && near(k.series[0].fit.b, r.series[0].fit.b, 1e-9));
  check('pendulum: 40° swings make g about 6 % low', big.results[0].value < 9.8 * 0.95 && big.results[0].value > 9.8 * 0.93, big.results[0].value);
  const ll = exact('pendulum', { axes: 'loglog' });
  check('pendulum: log–log slope is ½', near(ll.results[0].value, 0.5, 1e-9));
}
{
  const s = exact('spring-static'), sh = exact('spring-static', { sys: 'hanger' });
  check('spring (static): slope of F against x is k', near(s.results[0].value, 15, 1e-9));
  check('spring (static): forgetting the hanger is an intercept of −m_h g', near(sh.series[0].fit.a, -0.05 * 9.8, 1e-9) && near(sh.results[0].value, 15, 1e-9));
  const d = exact('spring-dynamic'), dh = exact('spring-dynamic', { sys: 'hanger' });
  check('spring (dynamic): slope 4π²/k gives k', near(d.results[0].value, 15, 1e-9));
  check('spring (dynamic): the intercept is 4π²(m_s/3)/k', near(d.series[0].fit.a, (4 * Math.PI ** 2 * 0.04) / (3 * 15), 1e-9));
  check('spring (dynamic): forgetting the hanger adds 4π²m_h/k to the intercept', near(dh.series[0].fit.a - d.series[0].fit.a, (4 * Math.PI ** 2 * 0.05) / 15, 1e-9));
}
{
  const r = exact('heater'), l = exact('heater', { sys: 'leak' });
  check('heater: the lagged block gives c within 1.5 % (a small leak remains)', r.results[0].value > 897 && r.results[0].value < 897 * 1.015, r.results[0].value);
  check('heater: without lagging c comes out over 10 % high', l.results[0].value > 897 * 1.1, l.results[0].value);
  check('heater: the uncertainty budget includes the meters', r.results[0].terms.length === 4 && r.results[0].sigma > r.results[0].sFit * 3);
  const noLeak = exact('heater', { params: { tau: 1e12 } });
  check('heater: with no leak at all, c = P/(m × slope) exactly', near(noLeak.results[0].value, 897, 1e-6));
}
{
  const st = B.repeatStats('stopwatch', B.makeData('stopwatch', { seed: 2, n: 400 }).rows);
  check('stopwatch: the mean period approaches 2.000 s', Math.abs(st.mean - 2) < 4 * st.sem, st.mean);
  check('stopwatch: SD ≈ the 0.05 s reaction scatter', Math.abs(st.sd - 0.05) < 0.006, st.sd);
  const b = B.repeatStats('stopwatch', B.makeData('stopwatch', { seed: 2, n: 400, sys: 'reaction' }).rows);
  check('stopwatch: a late stop shifts every reading by +0.10 s; averaging does not remove it', near(b.mean - st.mean, 0.1, 1e-6) && b.z > 20);
  const ten = B.repeatStats('stopwatch', B.makeData('stopwatch', { seed: 2, n: 400, params: { n: 10 } }).rows, { params: { n: 10 } });
  check('stopwatch: timing 10 swings divides the scatter of T by 10', Math.abs(ten.sd - 0.005) < 0.0008, ten.sd);
  const tl = B.repeatStats('tilt', B.makeData('tilt', { seed: 2, n: 400 }).rows), tz = B.repeatStats('tilt', B.makeData('tilt', { seed: 2, n: 400, sys: 'zero' }).rows);
  check('tilt: the mean slipping angle approaches tan⁻¹ μs', Math.abs(tl.mean - Math.atan(0.42) / D2R) < 4 * tl.sem);
  check('tilt: a protractor zero error shifts the mean by 2.0°', Math.abs(tz.mean - tl.mean - 2) < 0.3);
  const lr = B.repeatStats('launcher', B.makeData('launcher', { seed: 2, n: 400, at: 30 }).rows);
  check('launcher, repeated at 30°: the mean range approaches v₀² sin 60°/g', Math.abs(lr.mean - lr.accepted) < 4 * lr.sem, `${lr.mean} vs ${lr.accepted}`);
  const cr = B.repeatStats('collision', B.makeData('collision', { seed: 2, n: 400, at: 0.5 }).rows);
  check('collision, repeated: the momentum ratio averages 1', Math.abs(cr.mean - 1) < 4 * cr.sem, cr.mean);
}

// ─── the simulation’s parameter check ──────────────────────────────────────
const good = [
  { exp: 'freefall' }, { exp: 'stopwatch' }, { exp: ['spring-static', 'spring-dynamic'] },
  { exp: 'launcher', repeat: true, at: 30 }, { exp: 'pendulum', view: 'plot', axes: 'loglog', residuals: true },
  { exp: 'cart', view: 'plot', data: [[0.01, 0.16], [0.02, 0.33]] }, { exp: 'stopwatch', view: 'plot', data: [[2.01], [1.98]] },
  { exp: 'rotary', params: { ring: true } }, { exp: 'heater', sys: true, sysKind: 'leak' }, { exp: 'pendulum', sysKind: 'amplitude' },
];
for (const P of good) check(`validate accepts ${JSON.stringify(P).slice(0, 70)}`, validate(P).length === 0, validate(P).join('; '));
const bad = [
  [{ exp: 'nope' }, 'unknown experiment'], [{ exp: 'freefall', axes: 'cube' }, 'unknown axes'], [{ exp: 'freefall', params: { gee: 9 } }, 'unknown parameter'],
  [{ exp: 'launcher', repeat: true }, 'repeat without at'], [{ exp: 'cart', view: 'plot', data: [[0.01]] }, 'short data row'],
  [{ exp: 'cart', data: [[0.01, 0.2]] }, 'data on a bench'], [{ exp: 'freefall', sysKind: 'zero' }, 'unknown systematic'],
  [{ exp: 'stopwatch', residuals: true }, 'residuals of repeats'], [{ exp: 'freefall', view: 'movie' }, 'unknown view'],
  [{ exp: 'cart', repeat: true, at: 0.02 }, 'no repeated view'],
];
for (const [P, why] of bad) check(`validate rejects ${why}`, validate(P).length > 0);

// ─── PHYS 2225: the lab strand of PHYS 2220 ───────────────────────────────
{
  // L.1 — field mapping on conductive paper
  const r = exact('fieldmap'), c = exact('fieldmap', { sys: 'contact' });
  check('fieldmap: between full-width bars, E = −slope = V₀/d = 100 V/m and V(0) = V₀', near(r.results[0].value, 100, 1e-9) && near(r.series[0].fit.a, 10, 1e-9));
  check('fieldmap: 3 % lost at each contact leaves the paper from 9.70 V to 0.30 V (E = 94 V/m)', near(c.series[0].fit.a, 9.7, 1e-9) && near(c.results[0].value, 94, 1e-9) && near(c.series[0].fit.a + c.series[0].fit.b * 0.1, 0.3, 1e-9));
  const P = B.EXPERIMENTS['fieldmap-dots'].defaults, g = B.dotsGeom(P);
  check('fieldmap-dots: each dot’s rim is at its electrode’s potential', near(B.dotsV(P.a, P), 10, 1e-12) && Math.abs(B.dotsV(P.D - P.a, P)) < 1e-12);
  check('fieldmap-dots: the Apollonius points sit 0.04 mm inside the dots’ centres', Math.abs(g.f1 - 4.0e-5) < 1e-6);
  let line = 0; const n = 2000, x1 = 0.01, x2 = 0.09;
  for (let i = 0; i < n; i++) line += B.dotsE(x1 + ((i + 0.5) * (x2 - x1)) / n, P) * ((x2 - x1) / n);
  check('fieldmap-dots: ∫E dx between two points is the potential difference (E = −dV/dx)', near(line, B.dotsV(x1, P) - B.dotsV(x2, P), 1e-6), `${line} vs ${B.dotsV(x1, P) - B.dotsV(x2, P)}`);
  check('fieldmap-dots: the midpoint field is 2K/c, within 0.1 % of 4K/D, and far weaker than next to a dot', near(B.dotsE(0.05, P), (2 * g.K) / g.c, 1e-12) && Math.abs(B.dotsE(0.05, P) / ((4 * g.K) / 0.1) - 1) < 1e-3 && B.dotsE(0.01, P) > 2.5 * B.dotsE(0.05, P));
  const d = exact('fieldmap-dots'), dc = exact('fieldmap-dots', { sys: 'contact' });
  check('fieldmap-dots: V against ln(r₂/r₁) is straight with slope K and intercept V₀/2', near(d.results[0].value, g.K, 1e-9) && near(d.series[0].fit.a, 5, 1e-9) && d.series[0].fit.chi2 < 1e-12);
  check('fieldmap-dots: contact loss scales K by 1 − 2f and keeps the midpoint at 5.0 V', near(dc.results[0].value, 0.94 * g.K, 1e-9) && near(dc.series[0].fit.a, 5, 1e-9));
  for (const Q of [{ exp: ['fieldmap', 'fieldmap-dots'] }, { exp: 'fieldmap-dots', view: 'plot', axes: 'raw', fit: false }, { exp: 'fieldmap', sys: true, view: 'apparatus' }]) check(`validate accepts ${JSON.stringify(Q)}`, validate(Q).length === 0, validate(Q).join('; '));
  check('validate rejects bars plotted on the dots’ log axes', validate({ exp: 'fieldmap', axes: 'log' }).length > 0);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
