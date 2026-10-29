// The Fresnel-diffraction model behind sims/op3-fresnel.js (PHYS 4650 O8.3):
// the Fresnel integrals against tabulated values and their limits, continuity
// where the quadrature hands over to the asymptotic series, the straight
// edge's ¼ at the shadow and 1.37 at its first maximum, a wide slit tending to
// the unobstructed value, Babinet-style complementarity of the vibration curve,
// zone radii and Fresnel numbers, the hole's on-axis zeros and fourfold maxima,
// and the sim's validator.
//   node atlas/test/op3-fresnel.test.mjs

import * as M from '../src/viz/model/op3-fresnel.js';
import { validate } from '../src/viz/sims/op3-fresnel.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// Fresnel integrals: Abramowitz & Stegun Table 7.7 values
for (const [x, C, S] of [[0.5, 0.4923442, 0.0647324], [1, 0.7798934, 0.4382591], [1.5, 0.4452612, 0.6975050], [2, 0.4882534, 0.3433776], [3, 0.6057208, 0.4963130], [5, 0.5636312, 0.4991914]]) {
  const [c, s] = M.fresnelCS(x);
  check(`C(${x}), S(${x}) match the table`, near(c, C, 2e-7) && near(s, S, 2e-7), `${c}, ${s}`);
}
check('C and S are odd', near(M.fresnelCS(-1.3)[0], -M.fresnelCS(1.3)[0], 1e-14) && near(M.fresnelCS(-1.3)[1], -M.fresnelCS(1.3)[1], 1e-14));
const big = M.fresnelCS(60);
check('C, S → ½ far out', near(big[0], 0.5, 0.006) && near(big[1], 0.5, 0.006));
{
  const a = M.fresnelCS(8 - 1e-9), b = M.fresnelCS(8 + 1e-9);
  check('quadrature and asymptotic series agree at the hand-over (x = 8)', near(a[0], b[0], 1e-6) && near(a[1], b[1], 1e-6), `${a} vs ${b}`);
}

// straight edge
check('a straight edge gives ¼ at the geometric shadow', near(M.edgeIntensity(0), 0.25, 1e-12));
const fm = M.edgeFirstMax();
check('the first maximum outside an edge is 1.37 at v ≈ 1.22', near(fm.I, 1.3704, 2e-4) && near(fm.v, 1.2172, 2e-3), JSON.stringify(fm));
check('deep in the shadow the light dies away', M.edgeIntensity(-4) < 0.01);
check('far into the light the edge is forgotten', near(M.edgeIntensity(30), 1, 0.05));
check('a very wide slit passes the unobstructed irradiance at its centre', near(M.slitIntensity(-40, 40), 1, 0.05));
check('a slit is the difference of two edges seen as chords', near(M.slitIntensity(-1, 1), ((2 * M.fresnelCS(1)[0]) ** 2 + (2 * M.fresnelCS(1)[1]) ** 2) / 2, 1e-12));

// zones
check('zone radii grow as √m', near(M.zoneRadius(4, 500e-9, 1) / M.zoneRadius(1, 500e-9, 1), 2, 1e-12));
check('first zone at 500 nm, 1 m is 0.707 mm', near(M.zoneRadius(1, 500e-9, 1) * 1e3, 0.7071, 1e-4));
check('a point source shrinks the zones (R0 = L halves ρ²)', near(M.zoneRadius(1, 500e-9, 1, 1) ** 2, M.zoneRadius(1, 500e-9, 1) ** 2 / 2, 1e-15));
check('Fresnel number counts zones', near(M.fresnelNumber(M.zoneRadius(3, 600e-9, 2), 600e-9, 2), 3, 1e-12));
check('a hole holding one zone gives 4 I₀ on the axis', near(M.holeOnAxis(1), 4, 1e-12));
check('a hole holding two zones gives darkness on the axis', near(M.holeOnAxis(2), 0, 1e-12));
{
  // the vibration curve: |U(rim)|² is the hole's irradiance; the rest of the circle to its centre has length 1 (the disc)
  const NF = 0.7, [x, y] = M.vibration(M.rimPhase(NF));
  check('vibration curve reproduces the hole', near(x * x + y * y, M.holeOnAxis(NF), 1e-12));
  check('from the rim to the centre of the vibration curve is the disc’s field, magnitude 1', near(Math.hypot(1 - x, -y), 1, 1e-12));
}
check('zone plate focal length ρ₁²/λ', near(M.zonePlateFocus(0.5e-3, 500e-9), 0.5, 1e-12));
check('scale v = y√(2/(λL))', near(M.vScale(500e-9, 1), 2000, 1e-9));

// validator
check('defaults validate (zones)', validate({ mode: 'zones' }).length === 0, validate({ mode: 'zones' }).join('; '));
check('defaults validate (edge)', validate({ mode: 'edge' }).length === 0, validate({ mode: 'edge' }).join('; '));
check('defaults validate (slit)', validate({ mode: 'edge', kind: 'slit' }).length === 0, validate({ mode: 'edge', kind: 'slit' }).join('; '));
check('a bad mode is caught', validate({ mode: 'nope' }).length > 0);
check('a radius out of range is caught', validate({ mode: 'zones', a: 50 }).length > 0);
check('an unknown control is caught', validate({ mode: 'edge', controls: ['zz'] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
