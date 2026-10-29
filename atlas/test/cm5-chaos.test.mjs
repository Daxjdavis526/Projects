// Chaos in the driven damped pendulum and the logistic map (model/cm5-chaos.js,
// behind sims/cm5-pendulum.js and sims/cm5-logistic.js, PHYS 3550 M10): RK4
// against linear theory and a finer step, the Poincaré-section periods along
// Taylor's period-doubling cascade, the thresholds of that cascade, the
// Lyapunov exponent (positive only in chaos, independent of the step, and
// matching the growth of a small separation), the logistic map's doublings
// against their closed forms and Feigenbaum's δ, its Lyapunov exponent
// against exact values, and the two sims' validators.
//   node atlas/test/cm5-chaos.test.mjs

import * as K from '../src/viz/model/cm5-chaos.js';
import * as SP from '../src/viz/sims/cm5-pendulum.js';
import * as SL from '../src/viz/sims/cm5-logistic.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol;
const { w, w0, beta } = K.TAYLOR;

// ── the pendulum ──
// 1. a weak drive: the steady response is the linear one, A = γω₀²/√((ω₀² − ω²)² + 4β²ω²)
{
  const gamma = 0.002, A = (gamma * w0 * w0) / Math.sqrt((w0 * w0 - w * w) ** 2 + 4 * beta * beta * w * w);
  const R = K.run({ gamma }, [0, 0], { periods: 40, spp: 200 });
  const tail = R.phi.slice(-201);
  const amp = (Math.max(...tail) - Math.min(...tail)) / 2;
  check('weak drive: linear amplitude', close(amp / A, 1, 2e-3), `${amp} vs ${A}`);
}
// 2. RK4 converges: 200 and 800 steps per period agree on a periodic orbit
{
  const a = K.run({ gamma: 1.073 }, [-Math.PI / 2, 0], { periods: 30, spp: 200 }).end, b = K.run({ gamma: 1.073 }, [-Math.PI / 2, 0], { periods: 30, spp: 800 }).end;
  check('RK4: 200 vs 800 steps per period', Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-5, `${a} ${b}`);
}
// 3. undriven and undamped: energy ½φ̇² − ω₀² cos φ is conserved
{
  const R = K.run({ gamma: 0, beta: 0 }, [2.5, 0], { periods: 10, spp: 200 });
  const E = (i) => 0.5 * R.dphi[i] ** 2 - w0 * w0 * Math.cos(R.phi[i]);
  check('undamped energy conserved', Math.abs(E(R.t.length - 1) - E(0)) < 1e-6 * Math.abs(E(0)), `${E(0)} → ${E(R.t.length - 1)}`);
}
// 4. the cascade, read from Poincaré sections
for (const [g, n] of [[0.9, 1], [1.06, 1], [1.073, 2], [1.078, 2], [1.081, 4], [1.0826, 8], [1.105, 0]]) {
  const pc = K.poincare({ gamma: g }, undefined, { skip: 300, keep: 64, spp: 200 });
  check(`γ = ${g}: period ${n || 'none (chaos)'}`, K.period(pc) === n, `${K.period(pc)}`);
}
// 5. the doubling thresholds, recomputed (continuation + bisection on the Floquet multiplier)
{
  let g = 1.06, m = 1, s = K.cycle({ gamma: g }, K.poincare({ gamma: g }, undefined, { skip: 200, keep: 1 })[0], 1).s;
  const gs = [];
  for (let k = 0; k < 4; k++) {
    const d = K.doubling({}, s, m, g, { dg: k < 2 ? 5e-4 : 2e-5, tol: 1e-9 });
    if (!d) break;
    gs.push(d.gamma);
    g = d.gamma + (k < 2 ? 2e-4 : 2e-5); m *= 2;
    let z = [d.s[0] + 1e-3, d.s[1]];
    for (let i = 0; i < 4000; i++) z = K.strobe({ gamma: g }, z);
    s = K.cycle({ gamma: g }, z, m).s;
  }
  check('four doublings found', gs.length === 4, `${gs}`);
  gs.forEach((x, i) => check(`doubling ${i + 1} at TAYLOR_DOUBLINGS[${i}]`, close(x, K.TAYLOR_DOUBLINGS[i], 2e-7), `${x}`));
  [1.0663, 1.0793, 1.0821, 1.0827].forEach((x, i) => check(`doubling ${i + 1} matches Taylor's ${x}`, close(K.TAYLOR_DOUBLINGS[i], x, 1e-4)));
  const D = K.TAYLOR_DOUBLINGS, d1 = (D[1] - D[0]) / (D[2] - D[1]), d2 = (D[2] - D[1]) / (D[3] - D[2]);
  check('pendulum δ estimates near Feigenbaum', close(d1, K.FEIGENBAUM_DELTA, 0.01) && close(d2, K.FEIGENBAUM_DELTA, 0.01), `${d1} ${d2}`);
  // a period-2 cycle has det J = e^{−2β·2T} (the flow shrinks areas at rate 2β)
  const c = K.cycle({ gamma: 1.073 }, K.poincare({ gamma: 1.073 }, undefined, { skip: 200, keep: 1 })[0], 2);
  const det = c.J[0] * c.J[3] - c.J[1] * c.J[2];
  check('det of the 2-cycle map = e^{−4β}', close(det / Math.exp(-4 * beta), 1, 1e-4), `${det}`);
}
// 6. Lyapunov exponents
{
  const l = (g, spp) => K.lyapunov({ gamma: g }, undefined, { skip: 60, periods: 600, spp });
  const c100 = l(1.105, 100), c200 = l(1.105, 200);
  check('λ > 0 in chaos (γ = 1.105)', c200 > 0.4, `${c200}`);
  check('λ independent of the step (γ = 1.105)', close(c100, c200, 0.05 * c200), `${c100} ${c200}`);
  for (const g of [0.9, 1.073, 1.081]) check(`λ < 0 on a periodic orbit (γ = ${g})`, l(g, 100) < 0, `${l(g, 100)}`);
  // a periodic orbit's λ equals ln|largest multiplier| per period
  const c = K.cycle({ gamma: 1.073 }, K.poincare({ gamma: 1.073 }, undefined, { skip: 200, keep: 1 })[0], 2);
  const mu = Math.max(...c.mult.re.map((re, i) => Math.hypot(re, c.mult.im[i])));
  check('periodic λ = ln|μ|/(2T)', close(l(1.073, 200), Math.log(mu) / 2, 0.02), `${l(1.073, 200)} vs ${Math.log(mu) / 2}`);
  // the separation's growth rate matches λ (fit over the clean growth)
  const sep = K.separation({ gamma: 1.105 }, undefined, 1e-8, { periods: 30, spp: 200, every: 10 }), fit = SP.sepFit(sep);
  check('separation slope ≈ λ', fit && close(fit.m, c200, 0.25 * c200), `${fit && fit.m} vs ${c200}`);
}

// ── the logistic map ──
{
  const r = K.doublings(9);
  check('r₁ = 3', close(r[0], 3, 1e-12), `${r[0]}`);
  check('r₂ = 1 + √6', close(r[1], 1 + Math.sqrt(6), 1e-12), `${r[1]}`);
  check('r₃ = 3.544090', close(r[2], 3.5440903596, 1e-9), `${r[2]}`);
  const R = K.superstable(12);
  check('R₁ = 1 + √5', close(R[1], 1 + Math.sqrt(5), 1e-12));
  check('accumulation r∞ = 3.5699456', close(K.accumulation(r), 3.56994567, 2e-7), `${K.accumulation(r)}`);
  const dR = K.deltaEstimates(R), dr = K.deltaEstimates(r);
  check('δ from superstable parameters → 4.66920', close(dR[dR.length - 1], K.FEIGENBAUM_DELTA, 2e-5), `${dR}`);
  check('δ from doublings → 4.6692', close(dr[dr.length - 1], K.FEIGENBAUM_DELTA, 1e-3), `${dr}`);
  // at each doubling the cycle's multiplier is −1, checked directly
  for (let j = 0; j < 3; j++) {
    const p = 2 ** j, rr = r[j];
    let x = 0.3; for (let i = 0; i < 200000; i++) x = K.logistic(rr - 1e-4 * 4 ** -j, x);   // just before: settled on the cycle
    let d = 1, y = x; for (let i = 0; i < p; i++) { d *= (rr - 1e-4 * 4 ** -j) * (1 - 2 * y); y = K.logistic(rr - 1e-4 * 4 ** -j, y); }
    check(`multiplier just below r${j + 1} is near −1 from above`, d > -1 && d < -0.8, `${d}`);
  }
  check('λ(4) = ln 2', close(K.lyapLogistic(4, { n: 200000 }), Math.LN2, 5e-3), `${K.lyapLogistic(4)}`);
  check('λ(2.5) = ln 0.5', close(K.lyapLogistic(2.5), Math.log(0.5), 1e-9));
  const x2 = (3.2 + 1 + Math.sqrt((3.2 - 3) * (3.2 + 1))) / (2 * 3.2), x2b = (3.2 + 1 - Math.sqrt((3.2 - 3) * (3.2 + 1))) / (2 * 3.2);
  check('λ(3.2) = ½ ln|f′(x₊)f′(x₋)|', close(K.lyapLogistic(3.2), 0.5 * Math.log(Math.abs(3.2 * (1 - 2 * x2) * 3.2 * (1 - 2 * x2b))), 1e-6));
  for (const [rr, n] of [[2.8, 1], [3.2, 2], [3.5, 4], [3.56, 8], [3.835, 3], [3.9, 0]]) check(`logistic r = ${rr}: period ${n || 'none'}`, SL.periodOf(rr) === n, `${SL.periodOf(rr)}`);
  const cw = K.cobweb(3.2, 0.2, 3);
  check('cobweb alternates curve and diagonal', cw.length === 7 && cw[1][1] === K.logistic(3.2, 0.2) && cw[2][0] === cw[2][1]);
}

// ── validators ──
check('cm5-pendulum defaults valid', SP.validate({ ...SP.defaults }).length === 0, SP.validate({ ...SP.defaults }).join('; '));
check('cm5-logistic defaults valid', SL.validate({ ...SL.defaults }).length === 0, SL.validate({ ...SL.defaults }).join('; '));
check('cm5-pendulum rejects a bad panel', SP.validate({ ...SP.defaults, panels: ['nope'] }).length > 0);
check('cm5-pendulum rejects γ outside its slider range', SP.validate({ ...SP.defaults, gamma: 1.5 }).length > 0 && SP.validate({ ...SP.defaults, gamma: 1.5, controls: [] }).length === 0);
check('cm5-logistic rejects r > 4', SL.validate({ ...SL.defaults, r: 4.2 }).length > 0);
check('cm5-logistic rejects an unknown readout', SL.validate({ ...SL.defaults, hide: ['x'] }).length > 0);

console.log(`cm5-chaos: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
