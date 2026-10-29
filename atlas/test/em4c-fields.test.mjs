// The field-tensor model behind the em4c-boost simulation and PHYS 4600 M6.
//   node atlas/test/em4c-fields.test.mjs

import * as T from '../src/viz/model/em4c-fields.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const close3 = (a, b, rel = 1e-9) => a.every((v, i) => near(v, b[i], rel, rel * Math.max(...a.map(Math.abs), ...b.map(Math.abs))));
const c = 299792458, mu0 = 1.25663706127e-6;

const cases = [[[3e5, -2e5, 1e5], [1e-3, 4e-4, -2e-3]], [[0, 5e6, 0], [0, 0, 0]], [[1, 2, 3], [4e-9, -1e-9, 2e-9]]];

// boosting F^{μν} as a tensor reproduces Griffiths's field transformation, for every β
for (const [E, B] of cases) for (const beta of [0.3, -0.6, 0.95]) {
  const Fp = T.boostTensor(T.Fup(E, B), T.Lambda(beta));
  const got = T.fieldsOf(Fp), want = T.boostFields(E, B, beta);
  check(`ΛFΛᵀ = field transformation (β = ${beta})`, close3(got.E, want.E, 1e-9) && close3(got.B, want.B, 1e-9), JSON.stringify([got, want]));
}

// antisymmetry and the dual
{
  const F = T.Fup([1, 2, 3], [4e-9, 5e-9, 6e-9]);
  check('F is antisymmetric', F.every((row, m) => row.every((v, n) => v === -F[n][m])));
  const G = T.Gup([1, 2, 3], [4e-9, 5e-9, 6e-9]);
  check('G^{0i} = B_i', near(G[0][1], 4e-9) && near(G[0][3], 6e-9));
  check('G^{12} = −E_z/c', near(G[1][2], -3 / c));
}

// invariants, two ways
for (const [E, B] of cases) {
  const F = T.Fup(E, B), I = T.invariants(E, B);
  check('F_{μν}F^{μν} = 2(B² − E²/c²)', near(T.contract(T.lower(F), F), (-2 * I.EEcBB) / (c * c), 1e-9));
  check('F_{μν}G^{μν} = −4 E·B/c', near(T.contract(T.lower(F), T.Gup(E, B)), (-4 * I.EB) / c, 1e-9, 1e-30));
  for (const beta of [0.5, -0.9]) {
    const { E: E2, B: B2 } = T.boostFields(E, B, beta), J = T.invariants(E2, B2);
    check(`E² − c²B² and E·B unchanged by a boost (β = ${beta})`, near(J.EEcBB, I.EEcBB, 1e-8, 1e-6) && near(J.EB, I.EB, 1e-8, 1e-12));
  }
}

// the Lorentz force from the tensor: dp^i/dτ = q F^{iν} u_ν = qγ(E + v × B)
{
  const E = [2e3, -1e3, 5e2], B = [1e-5, 3e-5, -2e-5], v = [1e7, -3e7, 2e7], q = 1.6e-19;
  const g = 1 / Math.sqrt(1 - (v[0] ** 2 + v[1] ** 2 + v[2] ** 2) / (c * c));
  const u = [-g * c, g * v[0], g * v[1], g * v[2]];   // u_ν, lower index
  const F = T.Fup(E, B), K = F.map((row) => q * row.reduce((s, f, n) => s + f * u[n], 0));
  const vxB = [v[1] * B[2] - v[2] * B[1], v[2] * B[0] - v[0] * B[2], v[0] * B[1] - v[1] * B[0]];
  check('qF^{iν}u_ν = qγ(E + v×B)', [0, 1, 2].every((i) => near(K[i + 1], q * g * (E[i] + vxB[i]), 1e-9)));
  check('qF^{0ν}u_ν = qγ E·v/c (power over c)', near(K[0], (q * g * (E[0] * v[0] + E[1] * v[1] + E[2] * v[2])) / c, 1e-9));
}

// stress–energy: T^{00} = u, T^{0i} = S_i/c, the Maxwell stress, symmetric and traceless; boosts as a tensor
for (const [E, B] of cases) {
  const Tm = T.stressEnergy(E, B), { u, S } = T.energyFlux(E, B);
  check('T^{00} = ½ε₀E² + B²/2μ₀', near(Tm[0][0], u, 1e-9));
  check('T^{0i} = S_i/c', [0, 1, 2].every((i) => near(Tm[0][i + 1], S[i] / c, 1e-9, 1e-9 * u)));
  check('T is symmetric', Tm.every((row, m) => row.every((v, n) => near(v, Tm[n][m], 1e-9, 1e-12 * u))));
  const trace = -Tm[0][0] + Tm[1][1] + Tm[2][2] + Tm[3][3];
  check('T is traceless', Math.abs(trace) < 1e-9 * u);
  const eps0 = 1 / (mu0 * c * c), E2 = E[0] ** 2 + E[1] ** 2 + E[2] ** 2, B2 = B[0] ** 2 + B[1] ** 2 + B[2] ** 2;
  const sxy = eps0 * E[0] * E[1] + (B[0] * B[1]) / mu0, sxx = eps0 * (E[0] ** 2 - E2 / 2) + (B[0] ** 2 - B2 / 2) / mu0;
  check('T^{ij} = −σ_ij (Maxwell stress)', near(Tm[1][2], -sxy, 1e-9, 1e-12 * u) && near(Tm[1][1], -sxx, 1e-9, 1e-12 * u));
  const beta = 0.7, L = T.Lambda(beta), { E: E2b, B: B2b } = T.boostFields(E, B, beta);
  const viaTensor = T.boostTensor(Tm, L), viaFields = T.stressEnergy(E2b, B2b);
  check('T built from boosted fields = ΛTΛᵀ', viaTensor.every((row, m) => row.every((v, n) => near(v, viaFields[m][n], 1e-8, 1e-10 * viaFields[0][0]))));
}

// the frame that removes one field
{
  const E = [0, 3e8 * 0.6, 0], B = [0, 0, 1];          // E = 0.6 cB (in V/m with c ≈ 3e8 for round numbers)
  const b = T.killSpeed(Math.abs(E[1]), c * B[2]);
  const { E: E2 } = T.boostFields(E, B, b);
  check('boosting along E×B at E/cB removes E', Math.hypot(...E2) < 1e-6 * Math.hypot(...E));
}

console.log(`em4c-fields: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
