// The oscillating-dipole model behind the em4c-dipole simulation.
//   node atlas/test/em4c-dipole.test.mjs

import * as D from '../src/viz/model/em4c-dipole.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;

// the field is tangent to the level curves of Ψ: E_r = ∂θΨ/(r² sin θ), E_θ = −∂rΨ/(r sin θ)
{
  let worst = 0;
  for (const [r, th, ph] of [[0.3, 0.7, 0.2], [1.1, 1.3, 2.0], [4.5, 0.4, 4.1], [12, 2.2, 5.5], [0.8, 2.9, 1.0]]) {
    const h = 1e-6, F = D.fields(r, th, ph);
    const dr = (D.psi(r + h, th, ph) - D.psi(r - h, th, ph)) / (2 * h);
    const dt = (D.psi(r, th + h, ph) - D.psi(r, th - h, ph)) / (2 * h);
    const s = Math.sin(th), scale = Math.hypot(F.Er, F.Eth);
    worst = Math.max(worst, Math.abs(F.Er - dt / (r * r * s)) / scale, Math.abs(F.Eth + dr / (r * s)) / scale);
  }
  check('E is the curl of Ψ: field lines are level curves of Ψ', worst < 1e-6, `${worst}`);
}

// psiXZ agrees with psi (coordinates in wavelengths)
{
  const x = 0.31, z = -0.47, ph = 1.7, r = Math.hypot(x, z), th = Math.acos(z / r);
  check('psiXZ in wavelengths matches psi in units of 1/k', near(D.psiXZ(x, z, ph), D.psi(2 * Math.PI * r, th, ph), 1e-12));
}

// Faraday's law in the meridian plane, ∂B_φ/∂t = −(1/r)[∂(rE_θ)/∂r − ∂E_r/∂θ] (c = 1)
{
  const r = 1.7, th = 0.9, ph = 0.6, h = 1e-5;
  const dBdt = (D.fields(r, th, ph + h).Bphi - D.fields(r, th, ph - h).Bphi) / (2 * h);
  const drE = ((r + h) * D.fields(r + h, th, ph).Eth - (r - h) * D.fields(r - h, th, ph).Eth) / (2 * h);
  const dthE = (D.fields(r, th + h, ph).Er - D.fields(r, th - h, ph).Er) / (2 * h);
  check('Faraday’s law holds for the exact fields', near(dBdt, -(drE - dthE) / r, 1e-6), `${dBdt} vs ${-(drE - dthE) / r}`);
}

// the time-averaged energy flux through any sphere is the same (the reactive terms average out): r²⟨E_θ B_φ⟩ = sin²θ/2
for (const r of [0.2, 1, 7, 40]) {
  const th = 1.1, n = 720;
  let s = 0;
  for (let k = 0; k < n; k++) { const F = D.fields(r, th, (2 * Math.PI * k) / n); s += F.Eth * F.Bphi; }
  check(`r = ${r}: r²⟨E_θB_φ⟩ = sin²θ/2`, near((r * r * s) / n, Math.sin(th) ** 2 / 2, 1e-9));
}

// far field: E_θ ≈ −sin θ cos(ωt − kr)/kr, and B_φ ≈ E_θ
{
  const r = 400, th = 0.8, ph = 0.3, F = D.fields(r, th, ph);
  check('far zone: E_θ → −sin θ cos(ωt − kr)/kr', near(F.Eth, (-Math.sin(th) * Math.cos(ph - r)) / r, 3e-3, 1e-6));
  check('far zone: B_φ → E_θ (B = E/c)', near(F.Bphi, F.Eth, 3e-3, 1e-6));
  check('far zone: E_r is smaller by a factor ~1/kr', Math.abs(F.Er) < 1e-2 * Math.abs(F.Eth) + 1e-7);
}

// patterns
check('short-dipole pattern is zero on the axis and 1 at the equator', D.pattern('short', 0) === 0 && near(D.pattern('short', Math.PI / 2), 1));
check('half-wave pattern is zero on the axis and 1 at the equator', D.pattern('half', 0) === 0 && near(D.pattern('half', Math.PI / 2), 1));
check('half-wave pattern is narrower than sin²θ', D.pattern('half', 0.6) < D.pattern('short', 0.6));

// the half-wave integral and radiation resistances
const Z0 = Math.sqrt(1.25663706127e-6 / 8.8541878188e-12);
check('∫cos²(π/2 cos θ)/sin θ dθ = 1.218827 (½Cin 2π)', near(D.halfWaveIntegral(), 1.2188266965, 1e-6), `${D.halfWaveIntegral()}`);
check('half-wave antenna: R = 73.08 Ω', near(D.radResistance('half', Z0), 73.079, 1e-4), `${D.radResistance('half', Z0)}`);
check('short antenna: R = 789.0 (d/λ)² Ω', near(D.radResistance('short', Z0, 0.1), 7.8902, 1e-4), `${D.radResistance('short', Z0, 0.1)}`);
check('a point dipole puts 11/16 of its power within 30° of the equator', near(D.beltFraction('short', Math.PI / 6), 11 / 16, 1e-6), `${D.beltFraction('short', Math.PI / 6)}`);

console.log(`em4c-dipole: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
