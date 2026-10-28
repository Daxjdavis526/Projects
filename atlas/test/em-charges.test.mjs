// The DOM-free electrostatics behind sims/em-coulomb.js and sims/em-charging.js:
// Coulomb forces and their superposition, the image-charge solution for a
// conducting sphere near a point charge (checked against direct numerical
// integration of its surface charge), the dipole approximation for an
// insulating sphere, and charge sharing.
//   node atlas/test/em-charges.test.mjs

import * as C from '../src/viz/model/em-charges.js';
import { validate as validateCoulomb } from '../src/viz/sims/em-coulomb.js';
import { validate as validateInduction } from '../src/viz/sims/em-charging.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1e-300, Math.abs(b));

// ─── Coulomb's law and superposition ───────────────────────────────────────
check('k = 1/(4πε₀) with CODATA 2022 ε₀', near(C.K, 1 / (4 * Math.PI * 8.8541878188e-12), 1e-11));
check('two 1 µC charges 1 m apart: 8.99 mN', near(C.coulomb(1e-6, 1e-6, 1), 8.98755e-3, 1e-5));
check('inverse square: twice as far, a quarter of the force', near(C.coulomb(2e-6, 3e-6, 0.4) / C.coulomb(2e-6, 3e-6, 0.2), 0.25));
{
  const a = { x: 0.1, y: -0.2, q: 4e-6 }, b = { x: -0.3, y: 0.5, q: -1e-6 };
  const Fab = C.forceFrom(a, b), Fba = C.forceFrom(b, a);
  check('third law: equal and opposite, whatever the charges', near(Fab[0], -Fba[0]) && near(Fab[1], -Fba[1]));
  check('unlike charges attract: the force on a points toward b', Fab[0] * (b.x - a.x) + Fab[1] * (b.y - a.y) > 0);
  check('the force has the Coulomb magnitude', near(Math.hypot(...Fab), C.coulomb(a.q, b.q, Math.hypot(a.x - b.x, a.y - b.y))));
}
{
  // equilateral triangle of equal charges: net force √3 F, pointing away from the opposite side
  const s = 0.2, q = 2e-6, h = (s * Math.sqrt(3)) / 2;
  const ch = [{ x: 0, y: 0, q }, { x: s, y: 0, q }, { x: s / 2, y: h, q }];
  const { net, parts } = C.forcesOn(2, ch);
  check('triangle: two parts', parts.length === 2);
  check('triangle: net force √3 kq²/s², straight up', near(net[1], Math.sqrt(3) * C.coulomb(q, q, s), 1e-9) && Math.abs(net[0]) < 1e-12 * net[1]);
  // a 3-4-5 arrangement (the lesson's worked example): +2 µC at origin, −3 µC at (0.30, 0), +1 µC at (0, 0.40)
  const w = [{ x: 0, y: 0, q: 2e-6 }, { x: 0.3, y: 0, q: -3e-6 }, { x: 0, y: 0.4, q: 1e-6 }];
  const F = C.forcesOn(2, w).net;
  check('3-4-5 example: F = (0.0647, 0.0261) N', near(F[0], 0.06471, 2e-3) && near(F[1], 0.02607, 3e-3), F.map((v) => v.toFixed(5)).join(', '));
}
{
  // zero-force points on the line through two charges
  const zf = (q1, q2, d) => { const x = C.zeroForcePoint(q1, q2, d); return C.forcesOn(2, [{ x: 0, y: 0, q: q1 }, { x: d, y: 0, q: q2 }, { x, y: 0, q: 1e-9 }]).net[0]; };
  check('like charges q and 4q: zero force a third of the way along', near(C.zeroForcePoint(1, 4, 0.9), 0.3) && Math.abs(zf(1e-6, 4e-6, 0.9)) < 1e-12);
  check('unlike charges q and −4q: zero force outside, beyond the smaller one', near(C.zeroForcePoint(1, -4, 0.9), -0.9) && Math.abs(zf(1e-6, -4e-6, 0.9)) < 1e-12);
  check('equal and opposite charges: no zero-force point', C.zeroForcePoint(2, -2, 1) === null);
}

// ─── a conducting sphere near a point charge ───────────────────────────────
{
  const p = { Q: 5e-9, d: 0.3, a: 0.1 };
  // integrate the surface charge over the sphere: ∫σ 2πa² sin θ dθ
  const total = (pp) => { let s = 0; const n = 4000; for (let i = 0; i < n; i++) { const th = ((i + 0.5) * Math.PI) / n; s += C.sphereSigma(th, pp) * 2 * Math.PI * pp.a * pp.a * Math.sin(th) * (Math.PI / n); } return s; };
  check('neutral sphere: surface charge sums to zero', Math.abs(total({ ...p, qNet: 0 })) < 1e-6 * p.Q, total({ ...p, qNet: 0 }).toExponential(3));
  check('charged sphere: surface charge sums to its net charge', near(total({ ...p, qNet: 2e-9 }), 2e-9, 1e-5));
  const g = C.groundedCharge(p.Q, p.d, p.a);
  check('grounded sphere takes up −Qa/d', near(g, (-5e-9 * 0.1) / 0.3));
  check('grounded sphere: surface charge sums to −Qa/d', near(total({ ...p, qNet: g }), g, 1e-5));
  check('near side of a neutral sphere is charged opposite to Q', C.sphereSigma(0, p) < 0 && C.sphereSigma(Math.PI, p) > 0);
  // force: closed form, and direct integration of k Q σ dA over the sphere
  const closed = (pp) => (C.K * pp.Q ** 2 * pp.a ** 3 * (2 * pp.d ** 2 - pp.a ** 2)) / (pp.d ** 3 * (pp.d ** 2 - pp.a ** 2) ** 2);
  check('neutral sphere is attracted: closed form', near(C.forceOnSphere(p), closed(p), 1e-9));
  check('attracted whatever the sign of Q', near(C.forceOnSphere({ ...p, Q: -p.Q }), closed(p), 1e-9));
  const direct = (pp) => {                  // force on Q along +x from the surface charge; the sphere feels −that
    let fx = 0; const n = 6000;
    for (let i = 0; i < n; i++) {
      const th = ((i + 0.5) * Math.PI) / n, dA = 2 * Math.PI * pp.a * pp.a * Math.sin(th) * (Math.PI / n);
      const dx = pp.d - pp.a * Math.cos(th), dy = pp.a * Math.sin(th), r = Math.hypot(dx, dy);
      fx += (C.K * pp.Q * C.sphereSigma(th, pp) * dA * dx) / r ** 3;
    }
    return -fx;
  };
  for (const qNet of [0, 3e-9, -4e-9, g]) {
    const pp = { ...p, qNet };
    check(`force on the sphere matches direct integration (qNet = ${qNet.toExponential(1)} C)`, near(C.forceOnSphere(pp), direct(pp), 2e-4), `${C.forceOnSphere(pp).toExponential(5)} vs ${direct(pp).toExponential(5)}`);
  }
  check('a sphere charged like Q far away is repelled', C.forceOnSphere({ Q: 5e-9, d: 2, a: 0.1, qNet: 5e-9 }) < 0);
  // far away, the conductor and a dielectric with κ → ∞ agree: 2kQ²a³/d⁵
  const far = { Q: 5e-9, d: 3, a: 0.1 };
  check('dielectric with κ → ∞ matches the conductor far away', near(C.forceOnDielectric({ ...far, kappa: 1e9 }), C.forceOnSphere(far), 2e-3));
  check('a plastic sphere (κ = 3) is attracted less than a metal one', C.forceOnDielectric({ ...far, kappa: 3 }) < C.forceOnSphere(far) && C.forceOnDielectric({ ...far, kappa: 3 }) > 0);
}

// ─── sharing and counting ──────────────────────────────────────────────────
check('touching identical spheres share the total equally', C.share(6e-9, -2e-9).every((q) => near(q, 2e-9)));
check('sharing conserves charge', near(C.share(7e-9, 3e-9).reduce((a, b) => a + b), 1e-8));
check('1.6 × 10⁻¹⁸ C is 10 elementary charges', C.elementary(1.602176634e-18) === 10);
check('−25 nC is about −1.56 × 10¹¹ e', near(C.elementary(-25e-9), -1.5604e11, 1e-4));

// ─── the simulations' parameter checks ─────────────────────────────────────
check('em-coulomb validate accepts its defaults', validateCoulomb({}).length === 0, validateCoulomb({}).join('; '));
check('em-coulomb validate rejects charges on top of each other', validateCoulomb({ charges: [{ x: 0, y: 0, q: 1 }, { x: 0, y: 0, q: 2 }] }).length > 0);
check('em-charging validate accepts its defaults', validateInduction({}).length === 0, validateInduction({}).join('; '));
check('em-charging validate rejects an unknown scene', validateInduction({ scene: 'nope' }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
