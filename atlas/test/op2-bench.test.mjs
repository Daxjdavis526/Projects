// The ray-transfer and exact-tracing model behind sims/op2-bench.js (PHYS 4650
// O4): matrices against the closed forms (single surface, thick lens, two
// thin lenses, ball lens), cardinal points, imaging, exact rays converging to
// the paraxial focus near the axis, a paraboloid's perfect focus, third-order
// spherical aberration against exact tracing, Hubble's prescription (f/24,
// 57.6 m) and its as-built primary's aberration, fibres and prisms, and the
// sim's validator.
//   node atlas/test/op2-bench.test.mjs

import * as M from '../src/viz/model/op2-bench.js';
import { validate, defaults } from '../src/viz/sims/op2-bench.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b));

// a single surface: n₁/s_o + n₂/s_i = (n₂ − n₁)/R
{
  const els = [{ kind: 'surf', z: 0, R: 20, n: 1.5 }];
  const im = M.image(els, 60);
  check('single surface image', close(im.si, 1.5 / (0.5 / 20 - 1 / 60), 1e-12), im.si);
  check('single surface magnification −n₁s_i/(n₂s_o)', close(im.m, -(1 * im.si) / (1.5 * 60), 1e-12), im.m);
  const c = M.cardinal(els);
  check('single surface back focal distance n₂R/(n₂ − n₁)', close(c.bfd, 60, 1e-12));
  check('single surface det M = n₁/n₂', close(M.det(c.M), 1 / 1.5, 1e-12));
}
// thick lens and its principal planes
{
  const n = 1.5, R1 = 50, R2 = -30, tt = 8;
  const els = [{ kind: 'surf', z: 0, R: R1, n }, { kind: 'surf', z: tt, R: R2, n: 1 }];
  const c = M.cardinal(els), f = M.thickLensF(n, R1, R2, tt);
  check('thick lens f matches the lensmaker formula with thickness', close(c.f, f, 1e-12), `${c.f} vs ${f}`);
  check('thick lens H′ = −f(n − 1)t/(nR₁)', close(c.h2, (-f * (n - 1) * tt) / (n * R1), 1e-12), c.h2);
  check('thick lens H = −f(n − 1)t/(nR₂)', close(c.h1, (-f * (n - 1) * tt) / (n * R2), 1e-12), c.h1);
  check('det M = 1 in air', close(M.det(c.M), 1, 1e-12));
  check('F′ − H′ = f', close(c.zF2 - c.zH2, c.f, 1e-12));
  check('H − F = f', close(c.zH - c.zF, c.f, 1e-12));
  // imaging from the principal planes obeys the thin-lens equation
  const so = 200, im = M.image(els, so);
  const soH = so + c.h1, siH = im.si - c.h2;
  check('Gaussian equation from the principal planes', close(1 / soH + 1 / siH, 1 / c.f, 1e-10));
}
// two thin lenses
{
  const els = [{ kind: 'thin', z: 0, f: 100 }, { kind: 'thin', z: 60, f: -50 }];
  const c = M.cardinal(els);
  check('two thin lenses f = f₁f₂/(f₁ + f₂ − d)', close(c.f, M.twoLensF(100, -50, 60), 1e-12), c.f);
  check('two thin lenses BFD = f(d − f₁)/(d − f₁ − f₂)', close(c.bfd, (c.f * (100 - 60)) / 100, 1e-12), c.bfd);
}
// ball lens f = nD/4(n − 1) from the centre
{
  const n = 1.8, D = 2, els = [{ kind: 'surf', z: -1, R: 1, n }, { kind: 'surf', z: 1, R: -1, n: 1 }];
  const c = M.cardinal(els);
  check('ball lens EFL', close(c.f, (n * D) / (4 * (n - 1)), 1e-12));
  check('ball lens principal planes at the centre', Math.abs(c.zH) < 1e-12 && Math.abs(c.zH2) < 1e-12);
}
// exact rays near the axis meet the paraxial focus; a paraboloid is perfect
{
  const els = [{ kind: 'surf', z: 0, R: 51.68, n: 1.5168 }, { kind: 'surf', z: 4, R: Infinity, n: 1 }];
  check('exact ray near the axis → paraxial focus', Math.abs(M.longitudinal(els, 0.01)) < 1e-5);
  check('spherical aberration grows as h²', close(M.longitudinal(els, 1) / M.longitudinal(els, 0.1), 100, 0.01));
  check('a paraboloidal mirror has no spherical aberration', Math.abs(M.longitudinal([{ kind: 'mirror', z: 0, R: -10, k: -1 }], 3)) < 1e-9);
  const sph = M.longitudinal([{ kind: 'mirror', z: 0, R: -100, k: 0 }], 10);
  check('a spherical mirror: edge focus short by ≈ h²/4R', close(sph, -(10 * 10) / (4 * 100), 0.03), sph);
}
// third-order spherical aberration of a thin lens (Coddington) against exact tracing
for (const [R1, R2] of [[51.68, Infinity], [Infinity, -51.68], [103.36, -103.36]]) {
  const els = [{ kind: 'surf', z: 0, R: R1, n: 1.5168 }, { kind: 'surf', z: 3, R: R2, n: 1 }];
  const ex = M.longitudinal(els, 3), th = M.thinLensLSA3(1.5168, R1, R2, 3);
  check(`third-order LSA ≈ exact (R₁ ${R1}, R₂ ${R2})`, close(ex, th, 0.05), `${ex} vs ${th}`);
}
// Hubble: R₁ 11.04 m, R₂ 1.358 m (convex), 4.906 m apart: f ≈ 57.6 m, focus ≈ 1.5 m behind the primary
{
  const els = [{ kind: 'mirror', z: 0, R: -11.04, k: -1.0023, ap: 1.2, hole: 0.3 }, { kind: 'mirror', z: -4.906, R: -1.358, k: -1.4965, ap: 0.15 }];
  const c = M.cardinal(els);
  check('Hubble f ≈ 57.6 m', close(c.f, 57.6, 0.005), c.f);
  check('Hubble focus ≈ 1.5 m behind the primary', close(c.zF2, 1.5, 0.02), c.zF2);
  check('Hubble design: edge rays focus within 0.1 mm', Math.abs(M.longitudinal(els, 1.2)) < 1e-4);
  const built = [{ ...els[0], k: -1.0139 }, els[1]];
  const d = M.longitudinal(built, 1.2) - M.longitudinal(built, 0.33);
  check('Hubble as built (k = −1.0139): edge and inner foci ≈ 4 cm apart', d > 0.03 && d < 0.05, d);
  const r = M.exactRay(els, [-6, 1.0], [1, 0]);
  check('Hubble exact ray passes the primary’s hole after the secondary', r.ok && r.d[0] > 0);
}
// fibres and prisms
check('fibre NA', close(M.fibreNA(1.48, 1.46).NA, Math.sqrt(1.48 ** 2 - 1.46 ** 2), 1e-12));
check('modal spread', close(M.modalSpread(1.48, 1.46), (1.48 * 0.02) / (1.46 * 299792458), 1e-12));
{
  const A = 60 * M.DEG, n = 1.5168, dm = M.minDeviation(A, n);
  const th1 = Math.asin(n * Math.sin(A / 2));
  check('prism deviation at the symmetric angle is the minimum', close(M.prismDeviation(A, n, th1), dm, 1e-12));
  check('prism deviation larger off minimum', M.prismDeviation(A, n, th1 + 0.1) > dm && M.prismDeviation(A, n, th1 - 0.1) > dm);
}
// validator
check('validator accepts the defaults', validate(defaults).length === 0, validate(defaults).join('; '));
check('validator rejects an element behind the light', validate({ elements: [{ kind: 'mirror', z: 0, R: -10 }, { kind: 'thin', z: 5, f: 10 }] }).length > 0);
check('validator rejects an unknown kind', validate({ elements: [{ kind: 'prism', z: 0 }] }).length > 0);
check('validator rejects a bad control', validate({ controls: [{ key: 'a', label: 'a', min: 0, max: 1, value: 0, explain: 'x', set: [[3, 'z']] }] }).length > 0);

console.log(`op2-bench: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
