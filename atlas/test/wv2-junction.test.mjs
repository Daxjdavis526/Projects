// The two-string junction behind sims/wv2-junction.js (PHYS 3750 W9):
// continuity of displacement and transverse force at the junction, the local
// energy balance ∂e/∂t + ∂S/∂x = 0, total energy conserved through the
// reflection, the final split r² + 4Z₁Z₂/(Z₁ + Z₂)² = 1 matching the energies
// actually found on each string, and the sim's validator.
//   node atlas/test/wv2-junction.test.mjs

import * as J from '../src/viz/model/wv2-junction.js';
import { validate, defaults } from '../src/viz/sims/wv2-junction.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b));

for (const ratio of [0.05, 0.25, 1, 4, 30]) {
  const S = J.setup({ ratio });
  const ta = J.arrival(S);
  // coefficients
  check(`ratio ${ratio}: 1 + r = τ`, close(1 + S.r, S.tau, 1e-12));
  check(`ratio ${ratio}: r² + τ²Z₂/Z₁ = 1`, close(S.R + S.Tr, 1, 1e-12), `${S.R + S.Tr}`);
  check(`ratio ${ratio}: τ²Z₂/Z₁ = 4Z₁Z₂/(Z₁ + Z₂)²`, close(S.Tr, (4 * S.Z1 * S.Z2) / (S.Z1 + S.Z2) ** 2, 1e-12));
  // continuity at the junction, at several times around the arrival
  for (const f of [0.8, 0.95, 1, 1.05, 1.2]) {
    const t = f * ta, h = 1e-9;
    const L = J.field(S, -h, t), R = J.field(S, h, t), scale = S.A;
    check(`ratio ${ratio} t=${f}ta: y continuous`, Math.abs(L.y - R.y) < 1e-6 * scale, `${L.y} vs ${R.y}`);
    check(`ratio ${ratio} t=${f}ta: T y_x continuous`, Math.abs(L.yx - R.yx) < 1e-6 * (S.A / S.w), `${L.yx} vs ${R.yx}`);
    const SL = J.energy(S, -h, t).S, SR = J.energy(S, h, t).S;
    check(`ratio ${ratio} t=${f}ta: flux continuous`, Math.abs(SL - SR) <= 1e-6 * Math.max(Math.abs(SL), S.E * S.v1 / S.w * 1e-3), `${SL} vs ${SR}`);
  }
  // local energy balance ∂e/∂t + ∂S/∂x = 0 away from the junction (central differences)
  let worst = 0;
  for (const x of [-4.3, -2.1, -0.7, 0.4, 1.3, 2.9]) {
    for (const f of [0.3, 0.9, 1.1, 1.6]) {
      const t = f * ta, dt = 1e-6 * ta, dx = 1e-5;
      const det = (J.energy(S, x, t + dt).e - J.energy(S, x, t - dt).e) / (2 * dt);
      const dSx = (J.energy(S, x + dx, t).S - J.energy(S, x - dx, t).S) / (2 * dx);
      const sc = (S.E * S.v1) / (S.w * S.w);
      worst = Math.max(worst, Math.abs(det + dSx) / sc);
    }
  }
  check(`ratio ${ratio}: ∂e/∂t + ∂S/∂x = 0`, worst < 1e-4, `${worst}`);
  // the incident pulse's energy, total energy over time, and the final split
  const s0 = J.split(S, 0);
  check(`ratio ${ratio}: starting energy = T A²√π/2w`, close(s0.left, S.E, 1e-6) && s0.right < 1e-9 * S.E, `${s0.left} vs ${S.E}`);
  for (const f of [0.5, 0.9, 1, 1.1, 1.5]) {
    const s = J.split(S, f * ta);
    check(`ratio ${ratio} t=${f}ta: energy conserved`, close(s.left + s.right, S.E, 1e-5), `${(s.left + s.right) / S.E}`);
  }
  const late = J.split(S, ta + (12 * S.w) / Math.min(S.v1, S.v2) + 2 * ta);
  check(`ratio ${ratio}: reflected energy = r² E`, close(late.left, S.R * S.E, 1e-4) || Math.abs(late.left - S.R * S.E) < 1e-9 * S.E, `${late.left / S.E} vs ${S.R}`);
  check(`ratio ${ratio}: transmitted energy = (4Z₁Z₂/(Z₁+Z₂)²) E`, close(late.right, S.Tr * S.E, 1e-4), `${late.right / S.E} vs ${S.Tr}`);
}
// equal strings: no reflection
{ const S = J.setup({ ratio: 1 }); check('equal strings: r = 0, τ = 1', Math.abs(S.r) < 1e-15 && close(S.tau, 1, 1e-15)); }
// heavy far string: inverted reflection; light far string: upright, larger transmitted pulse
{ const H = J.setup({ ratio: 9 }), L = J.setup({ ratio: 1 / 9 });
  check('heavier second string: r < 0 (inverted)', H.r < 0 && close(H.r, -0.5, 1e-12), `${H.r}`);
  check('lighter second string: r > 0 and τ > 1', L.r > 0 && L.tau > 1 && close(L.tau, 1.5, 1e-12), `${L.r}, ${L.tau}`); }

// validator
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('bad ratio caught', validate({ ...defaults, ratio: 100 }).length > 0);
check('bad x0 caught', validate({ ...defaults, x0: 1 }).length > 0);
check('bad panel caught', validate({ ...defaults, panels: ['nope'] }).length > 0);
check('bad readout caught', validate({ ...defaults, hide: ['zz'] }).length > 0);

console.log(`\nwv2-junction: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
