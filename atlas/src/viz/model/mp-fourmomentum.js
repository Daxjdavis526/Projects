// Four-momentum in one space dimension, for the mp-collide simulation and
// the PHYS 2710 relativistic-dynamics lessons. DOM-free.
//
// Units: c = 1 and energies in MeV, so a four-momentum is [E, p] with E and
// p (really pc) both in MeV, and a mass is mc² in MeV. Frames are labelled
// by rapidity y (β = tanh y), because rapidities add: boosting by y₁ then y₂
// is boosting by y₁ + y₂.
//
// Masses: CODATA 2022 (e, p, n, d, α) and the Particle Data Group's 2024
// Review (everything else).

export const PARTICLES = {
  e: { m: 0.51099895069, label: 'electron' },
  mu: { m: 105.6583755, label: 'muon' },
  'pi+': { m: 139.57039, label: 'π⁺' },
  'pi-': { m: 139.57039, label: 'π⁻' },
  pi0: { m: 134.9768, label: 'π⁰' },
  'K+': { m: 493.677, label: 'K⁺' },
  p: { m: 938.27208943, label: 'proton' },
  pbar: { m: 938.27208943, label: 'antiproton' },
  n: { m: 939.56542194, label: 'neutron' },
  Lambda: { m: 1115.683, label: 'Λ⁰' },
  Delta: { m: 1232, label: 'Δ(1232)' },
  d: { m: 1875.612945, label: 'deuteron' },
  alpha: { m: 3727.3794118, label: 'alpha particle' },
  W: { m: 80369.2, label: 'W boson' },
  Z: { m: 91188.0, label: 'Z boson' },
  H: { m: 125200, label: 'Higgs boson' },
  gamma: { m: 0, label: 'photon' },
};
export const massOf = (k) => (typeof k === 'number' ? k : PARTICLES[k]?.m);

/** Total energy of a particle of mass m and momentum p. */
export const energy = (m, p) => Math.hypot(m, p);
/** Momentum of a particle of mass m and kinetic energy K. */
export const momentumFromK = (m, K) => Math.sqrt(K * K + 2 * K * m);
/** The four-momentum [E, p] of a particle of mass m and kinetic energy K moving in direction dir (±1). */
export const fourFromK = (m, K, dir = 1) => [m + K, dir * momentumFromK(m, K)];
/** The four-momentum of a particle of mass m and momentum p. */
export const fourFromP = (m, p) => [energy(m, p), p];
/** The mass of a four-momentum, √(E² − p²) — zero for light, and the same in every frame. */
export const mass = ([E, p]) => Math.sqrt(Math.max(0, (E - p) * (E + p)));
/** Add four-momenta. */
export const sum = (list) => list.reduce(([E, p], [e, q]) => [E + e, p + q], [0, 0]);
/** The invariant mass of a system: the mass of its total four-momentum. */
export const invariantMass = (list) => mass(sum(list));
/** Speed β = p/E of a four-momentum (of a particle, or of a system's centre of momentum). */
export const velocity = ([E, p]) => p / E;
/** Rapidity of a four-momentum: the frame in which it has no momentum. */
export const rapidity = ([E, p]) => Math.atanh(p / E);
/** The Lorentz factor of a particle with this four-momentum. */
export const gammaOf = (P) => P[0] / mass(P);
/** The four-momentum seen from a frame moving at rapidity y along +x. */
export function boost([E, p], y) {
  const ch = Math.cosh(y), sh = Math.sinh(y);
  return [E * ch - p * sh, p * ch - E * sh];
}
/** The Minkowski product of two four-momenta, E₁E₂ − p₁p₂ — the same in every frame. */
export const dot = ([E1, p1], [E2, p2]) => E1 * E2 - p1 * p2;

/** √s for a beam (mass mb, kinetic energy K) striking a target of mass mt at rest. */
export const sqrtSFixed = (mb, mt, K) => Math.sqrt(mb * mb + mt * mt + 2 * (K + mb) * mt);
/** √s for two beams meeting head-on with kinetic energies K1 and K2. */
export const sqrtSCollider = (m1, m2, K1, K2 = K1) => invariantMass([fourFromK(m1, K1, 1), fourFromK(m2, K2, -1)]);
/**
 * The least kinetic energy a beam of mass mb needs, on a target mt at rest,
 * to make final particles of total mass M: s = (mb + mt)² + 2 K mt = M².
 * Works for a massless beam (mb = 0), where K is the photon's energy.
 */
export function thresholdFixed(mb, mt, M) {
  if (M <= mb + mt) return 0;
  return (M * M - (mb + mt) ** 2) / (2 * mt);
}
/** The least kinetic energy each of two identical beams (mass m) needs, head-on, to make total mass M. */
export const thresholdCollider = (m, M) => Math.max(0, M / 2 - m);
/**
 * Head-on collision of a beam of mass mb with a massless particle of energy
 * Eg: the least beam energy (total, not kinetic) to make mass M.
 * s = mb² + 2 Eg (E + p) ≈ mb² + 4 Eg E when the beam is ultra-relativistic.
 */
export function thresholdOnPhoton(mb, Eg, M) {
  // solve mb² + 2 Eg (E + √(E² − mb²)) = M² for E
  const k = (M * M - mb * mb) / (2 * Eg); // = E + p
  return (k * k + mb * mb) / (2 * k);
}
/**
 * Two-body decay at rest: M → m1 + m2. Returns the momentum each daughter
 * carries and their energies.
 */
export function twoBody(M, m1, m2) {
  if (M < m1 + m2) return null;
  const p = Math.sqrt((M * M - (m1 + m2) ** 2) * (M * M - (m1 - m2) ** 2)) / (2 * M);
  return { p, E1: (M * M + m1 * m1 - m2 * m2) / (2 * M), E2: (M * M + m2 * m2 - m1 * m1) / (2 * M) };
}

/**
 * Ready-made situations for the simulation. K is in MeV: the beam's kinetic
 * energy (each beam's, for a collider), or for a decay the parent's.
 */
export const SCENARIOS = {
  bevatron: { mode: 'fixed', beam: 'p', target: 'p', products: ['p', 'p', 'p', 'pbar'], K: 6200, range: [500, 10000], label: 'Bevatron: p + p → p + p + p + p̄' },
  pion: { mode: 'fixed', beam: 'p', target: 'p', products: ['p', 'p', 'pi0'], K: 400, range: [20, 1500], label: 'p + p → p + p + π⁰' },
  pp: { mode: 'collider', beam: 'p', target: 'p', products: [], K: 500, range: [0, 3000], label: 'Two protons head-on' },
  ppbar: { mode: 'collider', beam: 'p', target: 'p', products: ['p', 'p', 'p', 'pbar'], K: 1500, range: [100, 5000], label: 'Head-on: p + p → p + p + p + p̄' },
  lhc: { mode: 'collider', beam: 'p', target: 'p', products: ['p', 'p', 'H'], K: 6.8e6, range: [1e4, 7e6], label: 'LHC: protons head-on' },
  lhcfixed: { mode: 'fixed', beam: 'p', target: 'p', products: ['p', 'p', 'H'], K: 6.8e6, range: [1e4, 7e6], label: 'An LHC proton on a proton at rest' },
  lambda: { mode: 'decay', parent: 'Lambda', daughters: ['p', 'pi-'], K: 0, range: [0, 3000], label: 'Λ⁰ → p + π⁻' },
};

/**
 * Everything the simulation draws for one situation, in the lab frame:
 *   parts:   [{ key, m, P }] — the incoming particles (or the decay products)
 *   total:   the total four-momentum
 *   M:       the invariant mass (√s)
 *   Mth:     the total mass of the products (0 if none), and Kth, the threshold K
 *   ycm:     the rapidity of the centre-of-momentum frame
 * For a decay, parts are the two daughters, emitted forward and backward
 * along the parent's motion, and K is the parent's kinetic energy.
 */
export function situation({ mode, beam = 'p', target = 'p', products = [], parent, daughters = [], K = 0 }) {
  const Mth = products.reduce((s, k) => s + massOf(k), 0);
  if (mode === 'decay') {
    const M = massOf(parent), [m1, m2] = daughters.map(massOf);
    const d = twoBody(M, m1, m2);
    const Pp = fourFromK(M, K), yp = rapidity(Pp);
    const parts = [
      { key: daughters[0], m: m1, P: boost([d.E1, d.p], -yp) },
      { key: daughters[1], m: m2, P: boost([d.E2, -d.p], -yp) },
    ];
    return { mode, parts, parent: { key: parent, m: M, P: Pp }, total: Pp, M, Mth: 0, Kth: 0, ycm: yp, pstar: d.p };
  }
  const mb = massOf(beam), mt = massOf(target);
  const parts = mode === 'collider'
    ? [{ key: beam, m: mb, P: fourFromK(mb, K, 1) }, { key: target, m: mt, P: fourFromK(mt, K, -1) }]
    : [{ key: beam, m: mb, P: fourFromK(mb, K, 1) }, { key: target, m: mt, P: [mt, 0] }];
  const total = sum(parts.map((q) => q.P));
  const M = mass(total);
  const Kth = Mth ? (mode === 'collider' ? (mb === mt ? thresholdCollider(mb, Mth) : NaN) : thresholdFixed(mb, mt, Mth)) : 0;
  return { mode, parts, total, M, Mth, Kth, ycm: rapidity(total) };
}

/**
 * The frame slider’s value s (from −0.5 to 2), turned into a rapidity:
 *   fixed target: y = s·y_cm, so s = 0 is the lab, 1 the centre of momentum,
 *                 and (for equal masses) 2 the beam particle’s rest frame;
 *   collider:     y = s·½ln 3 (lab = CM at 0; β = 0.5 at s = 1, 0.8 at s = 2);
 *   decay:        y = s·y_parent, so 0 is the lab and 1 the parent’s rest frame.
 */
export function frameRapidity(S, s) {
  if (S.mode === 'collider') return (s * Math.log(3)) / 2;
  return s * S.ycm;
}
export const FRAME_RANGE = [-0.5, 2];
