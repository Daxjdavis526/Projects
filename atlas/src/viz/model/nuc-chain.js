// Radioactive decay chains, DOM-free (tested in test/nuc-chain.test.mjs):
// the Bateman solution of a linear chain A → B → C → … with branching
// fractions, its activities, the time of the daughter's peak, and the
// equilibrium a parent and daughter settle into (secular, transient or
// none). Real chains carry NUBASE2020 half-lives: uranium-238 to lead-206,
// radium-226 and its radon, radon's short-lived progeny, and the
// molybdenum-99 → technetium-99m generator. Used by the nuc-chain
// simulation and the PHYS 3710 lessons on radioactivity.

export const LN2 = Math.LN2;
export const MIN = 60, HOUR = 3600, DAY = 86400, YEAR = 365.25 * 86400;

/**
 * A chain is a list of members { name, label, T (half-life, s; Infinity if
 * stable), b (the fraction of the previous member's decays that feed this
 * one; default 1), mode }. Half-lives from NUBASE2020 (Kondev et al. 2021).
 */
export const CHAINS = {
  u238: {
    title: 'uranium-238 to lead-206',
    members: [
      { name: 'U-238', label: '²³⁸U', T: 4.468e9 * YEAR, mode: 'α' },
      { name: 'Th-234', label: '²³⁴Th', T: 24.10 * DAY, mode: 'β⁻' },
      { name: 'Pa-234m', label: '²³⁴ᵐPa', T: 1.159 * MIN, mode: 'β⁻' },
      { name: 'U-234', label: '²³⁴U', T: 2.455e5 * YEAR, mode: 'α' },
      { name: 'Th-230', label: '²³⁰Th', T: 7.54e4 * YEAR, mode: 'α' },
      { name: 'Ra-226', label: '²²⁶Ra', T: 1600 * YEAR, mode: 'α' },
      { name: 'Rn-222', label: '²²²Rn', T: 3.8215 * DAY, mode: 'α' },
      { name: 'Po-218', label: '²¹⁸Po', T: 3.098 * MIN, mode: 'α' },
      { name: 'Pb-214', label: '²¹⁴Pb', T: 27.06 * MIN, mode: 'β⁻' },
      { name: 'Bi-214', label: '²¹⁴Bi', T: 19.9 * MIN, mode: 'β⁻' },
      { name: 'Po-214', label: '²¹⁴Po', T: 164.3e-6, mode: 'α' },
      { name: 'Pb-210', label: '²¹⁰Pb', T: 22.20 * YEAR, mode: 'β⁻' },
      { name: 'Bi-210', label: '²¹⁰Bi', T: 5.012 * DAY, mode: 'β⁻' },
      { name: 'Po-210', label: '²¹⁰Po', T: 138.376 * DAY, mode: 'α' },
      { name: 'Pb-206', label: '²⁰⁶Pb', T: Infinity, mode: 'stable' },
    ],
  },
  radium: {
    title: 'radium-226 and its radon',
    members: [
      { name: 'Ra-226', label: '²²⁶Ra', T: 1600 * YEAR, mode: 'α' },
      { name: 'Rn-222', label: '²²²Rn', T: 3.8215 * DAY, mode: 'α' },
      { name: 'Po-218', label: '²¹⁸Po', T: 3.098 * MIN, mode: 'α' },
      { name: 'Pb-214', label: '²¹⁴Pb', T: 27.06 * MIN, mode: 'β⁻' },
      { name: 'Bi-214', label: '²¹⁴Bi', T: 19.9 * MIN, mode: 'β⁻' },
      { name: 'Pb-210', label: '²¹⁰Pb', T: 22.20 * YEAR, mode: 'β⁻' },   // Po-214 (164 μs) folded into Bi-214's decay
    ],
  },
  radon: {
    title: 'radon-222 and its short-lived progeny',
    members: [
      { name: 'Rn-222', label: '²²²Rn', T: 3.8215 * DAY, mode: 'α' },
      { name: 'Po-218', label: '²¹⁸Po', T: 3.098 * MIN, mode: 'α' },
      { name: 'Pb-214', label: '²¹⁴Pb', T: 27.06 * MIN, mode: 'β⁻' },
      { name: 'Bi-214', label: '²¹⁴Bi', T: 19.9 * MIN, mode: 'β⁻' },
      { name: 'Pb-210', label: '²¹⁰Pb', T: 22.20 * YEAR, mode: 'β⁻' },
    ],
  },
  moly: {
    title: 'the molybdenum-99 → technetium-99m generator',
    members: [
      { name: 'Mo-99', label: '⁹⁹Mo', T: 65.976 * HOUR, mode: 'β⁻' },
      { name: 'Tc-99m', label: '⁹⁹ᵐTc', T: 6.0067 * HOUR, b: 0.875, mode: 'γ' },
      { name: 'Tc-99', label: '⁹⁹Tc', T: 2.111e5 * YEAR, mode: 'β⁻' },
    ],
  },
};

/** A two-member chain parent → daughter → stable, with the daughter's half-life `ratio` times the parent's (parent T = 1). */
export function pairChain(ratio, T1 = 1) {
  return { title: 'parent → daughter', members: [
    { name: 'parent', label: 'parent', T: T1, mode: '' },
    { name: 'daughter', label: 'daughter', T: T1 * ratio, mode: '' },
    { name: 'stable', label: 'stable', T: Infinity, mode: 'stable' },
  ] };
}

export const lambdaOf = (T) => (Number.isFinite(T) ? LN2 / T : 0);

/**
 * Bateman's solution: the number of each member at time t (same units as the
 * half-lives) from initial numbers N0 (an array; missing entries are 0).
 * Members whose decay constants coincide are split by a part in 10⁹ so the
 * formula stays defined. Returns an array of numbers, one per member.
 *
 * N_n(t) = Σ_i N_i(0) · Π_{j=i}^{n−1} b_{j+1} λ_j · Σ_{j=i}^{n} e^{−λ_j t} / Π_{k=i, k≠j}^{n} (λ_k − λ_j)
 */
export function bateman(chain, N0, t) {
  const m = chain.members, n = m.length;
  const lam = m.map((x) => lambdaOf(x.T));
  for (let i = 1; i < n; i++) for (let j = 0; j < i; j++) if (Math.abs(lam[i] - lam[j]) <= 1e-12 * Math.max(lam[i], lam[j])) lam[i] *= 1 + 1e-9;
  const b = m.map((x, i) => (i === 0 ? 1 : x.b ?? 1));
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const Ni = N0[i] || 0;
    if (!Ni) continue;
    for (let k = i; k < n; k++) {
      // the coefficient Π b λ over the links i → k
      let pre = Ni;
      for (let j = i; j < k; j++) pre *= b[j + 1] * lam[j];
      if (pre === 0) continue;
      let s = 0;
      for (let j = i; j <= k; j++) {
        let den = 1;
        for (let q = i; q <= k; q++) if (q !== j) den *= lam[q] - lam[j];
        s += Math.exp(-lam[j] * t) / den;
      }
      out[k] += pre * s;
    }
  }
  return out.map((v) => Math.max(0, v));
}

/** The activities λN of every member at time t (decays per unit time, in the half-lives' time unit). */
export function activities(chain, N0, t) {
  const N = bateman(chain, N0, t);
  return N.map((v, i) => lambdaOf(chain.members[i].T) * v);
}

/** Start from a pure parent with activity 1: N₀ = 1/λ₁. */
export const pureParent = (chain) => [1 / lambdaOf(chain.members[0].T)];

/**
 * Parent and daughter (decay constants l1, l2) from a pure parent: the time at which
 * the daughter's activity peaks, ln(λ₂/λ₁)/(λ₂ − λ₁).
 */
export const peakTime = (l1, l2) => Math.log(l2 / l1) / (l2 - l1);

/**
 * The equilibrium a parent–daughter pair settles into, and the ratio of their
 * activities then (with the daughter's branching fraction b):
 * secular (λ₁ ≪ λ₂): A₂/A₁ → b; transient (λ₁ < λ₂): b·λ₂/(λ₂ − λ₁); none (λ₁ ≥ λ₂).
 */
export function equilibrium(T1, T2, b = 1) {
  const l1 = LN2 / T1, l2 = LN2 / T2;
  if (l1 >= l2) return { kind: 'none', ratio: Infinity };
  const ratio = (b * l2) / (l2 - l1);
  return { kind: T1 / T2 > 1000 ? 'secular' : 'transient', ratio };
}

/** Radon ingrowth from radium in a sealed volume: the radon's activity as a fraction of radium's after time t (same unit as T). */
export const ingrowth = (t, T) => 1 - Math.pow(2, -t / T);

/** Atoms present for a given activity: N = A/λ = A·T½/ln 2. */
export const atomsFor = (A, T) => (A * T) / LN2;

/** The K–Ar age (same unit as T) from the ratio ⁴⁰Ar/⁴⁰K today, with the fraction fEC of potassium-40 decays that make argon. */
export const kArAge = (ArK, T = 1.248e9, fEC = 0.1072) => (T / LN2) * Math.log(1 + ArK / fEC);
