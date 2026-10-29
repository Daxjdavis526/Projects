// Electromagnetic fields as one tensor, DOM-free (PHYS 4600 M6). Signature
// (−, +, +, +), x⁰ = ct, as in Carroll and the rest of the Atlas. Used by the
// em4c-boost simulation and the PHYS 4600 M6 lessons; tested in
// test/em4c-fields.test.mjs.
//
//   F^{μν}: F^{0i} = E_i/c, F^{ij} = ε_{ijk}B_k  (so F^{12} = B_z, F^{13} = −B_y, F^{23} = B_x)
//   F_{μν} = η_{μα}η_{νβ}F^{αβ}: the time–space entries change sign, F_{0i} = −E_i/c
//   G^{μν} (the dual): E/c → B, B → −E/c, so G^{0i} = B_i, G^{ij} = −ε_{ijk}E_k/c
//   Maxwell: ∂_ν F^{μν} = μ₀J^μ and ∂_ν G^{μν} = 0, with J^μ = (cρ, J)
//   Lorentz force: dp^μ/dτ = q F^{μν} u_ν
//   T^{μν} = (1/μ₀)[F^{μα}F^ν_α − ¼η^{μν}F_{αβ}F^{αβ}]: T^{00} = u, T^{0i} = S_i/c, T^{ij} = −σ_ij
//
// Fields are SI by default (E in V/m, B in T); pass c = 1 to work with E and
// cB in the same units.

export const ETA = [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];

export const gamma = (b) => 1 / Math.sqrt(1 - b * b);

/** F^{μν} from E and B (arrays of three). */
export function Fup(E, B, c = 299792458) {
  const [ex, ey, ez] = E.map((v) => v / c), [bx, by, bz] = B;
  return [
    [0, ex, ey, ez],
    [-ex, 0, bz, -by],
    [-ey, -bz, 0, bx],
    [-ez, by, -bx, 0],
  ];
}

/** The dual G^{μν} (E/c → B, B → −E/c). */
export function Gup(E, B, c = 299792458) {
  return Fup(B.map((v) => v * c), E.map((v) => -v / c), c);
}

/** E and B read back from a contravariant F^{μν}. */
export function fieldsOf(F, c = 299792458) {
  return { E: [F[0][1] * c, F[0][2] * c, F[0][3] * c], B: [F[2][3], F[3][1], F[1][2]] };
}

export const matmul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
export const transpose = (A) => A[0].map((_, j) => A.map((row) => row[j]));

/** Lower both indices: F_{μν} = η F η. */
export const lower = (F) => matmul(matmul(ETA, F), ETA);
/** Mixed F^μ_ν = F^{μα}η_{αν}. */
export const mixed = (F) => matmul(F, ETA);

/** The boost matrix Λ^μ_ν for velocity β (a fraction of c) along x, y or z: x′ = Λx. */
export function Lambda(beta, axis = 0) {
  const g = gamma(beta), L = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], i = axis + 1;
  L[0][0] = g; L[i][i] = g; L[0][i] = -g * beta; L[i][0] = -g * beta;
  return L;
}

/** Transform a (2,0) tensor: T′ = Λ T Λᵀ. */
export const boostTensor = (T, L) => matmul(matmul(L, T), transpose(L));

/**
 * The fields seen from a frame moving at β (a fraction of c) along x (Griffiths 12.109):
 * E′x = Ex, E′y = γ(Ey − vBz), E′z = γ(Ez + vBy), B′x = Bx, B′y = γ(By + vEz/c²), B′z = γ(Bz − vEy/c²).
 */
export function boostFields(E, B, beta, c = 299792458) {
  const g = gamma(beta), v = beta * c;
  return {
    E: [E[0], g * (E[1] - v * B[2]), g * (E[2] + v * B[1])],
    B: [B[0], g * (B[1] + (v * E[2]) / (c * c)), g * (B[2] - (v * E[1]) / (c * c))],
  };
}

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The invariants: E² − c²B² and E·B (SI), and the contractions F_{μν}F^{μν} = 2(B² − E²/c²), F_{μν}G^{μν} = −4E·B/c. */
export function invariants(E, B, c = 299792458) {
  return { EEcBB: dot3(E, E) - c * c * dot3(B, B), EB: dot3(E, B) };
}

/** The full contraction Σ A_{μν}B^{μν} of a lower-index A with an upper-index B. */
export const contract = (Adown, Bup) => Adown.reduce((s, row, m) => s + row.reduce((t, a, n) => t + a * Bup[m][n], 0), 0);

/** The stress–energy tensor T^{μν} of the field (J/m³), from E (V/m) and B (T). */
export function stressEnergy(E, B, mu0 = 1.25663706127e-6, c = 299792458) {
  const F = Fup(E, B, c), Fd = lower(F), Fm = mixed(F), FF = contract(Fd, F);
  const T = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let m = 0; m < 4; m++) for (let n = 0; n < 4; n++) {
    let s = 0;
    for (let a = 0; a < 4; a++) s += F[m][a] * Fm[n][a];
    T[m][n] = (s - 0.25 * ETA[m][n] * FF) / mu0;   // η^{μν} has the same entries as η_{μν}
  }
  return T;
}

/** Energy density u and Poynting vector S of the fields (SI). */
export function energyFlux(E, B, mu0 = 1.25663706127e-6, c = 299792458) {
  const eps0 = 1 / (mu0 * c * c);
  return { u: 0.5 * eps0 * dot3(E, E) + dot3(B, B) / (2 * mu0), S: cross3(E, B).map((v) => v / mu0) };
}

/** The speed (fraction of c) of the frame along E × B in which one field vanishes, for E ⟂ B: cB/E if E > cB (B′ = 0), E/cB if E < cB (E′ = 0). */
export function killSpeed(E, cB) {
  return E > cB ? cB / E : E / cB;
}
