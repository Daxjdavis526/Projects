// Counting for thermal physics: log-factorials, binomial coefficients, the
// multiplicity of an Einstein solid, and two Einstein solids sharing energy
// quanta — the exact distribution of the macrostate q_A and a random-exchange
// dynamics whose long-run visits follow it. DOM-free; tested headlessly in
// test/th-einstein.test.mjs. Used by sims/th-einstein.js and the PHYS 3700
// lessons (content/phys3700/_count.js).

const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

/** ln Γ(x) for x > 0 (Lanczos, g = 7: about 15 significant figures). */
export function lnGamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// exact small factorials keep ln n! exact where it is cheap
const LNF = [0];
for (let n = 1; n <= 256; n++) LNF[n] = LNF[n - 1] + Math.log(n);

/** ln n! for a whole number n ≥ 0. */
export function lnFact(n) {
  if (n < 0) return NaN;
  return n <= 256 ? LNF[n] : lnGamma(n + 1);
}

/** ln C(n, k), the log of a binomial coefficient (−∞ outside 0 ≤ k ≤ n). */
export function lnChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return lnFact(n) - lnFact(k) - lnFact(n - k);
}

/** C(n, k) exactly, as a BigInt. */
export function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let c = 1n;
  for (let i = 1; i <= k; i++) c = (c * BigInt(n - k + i)) / BigInt(i);
  return c;
}

/** Stirling's approximations to ln n!: the crude N ln N − N and the one with ½ln(2πN). */
export const stirling = (n) => n * Math.log(n) - n;
export const stirling2 = (n) => n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);

/** Multiplicity of an Einstein solid: N oscillators sharing q quanta, Ω = C(q + N − 1, q). */
export const lnOmega = (N, q) => lnChoose(q + N - 1, q);
export const omega = (N, q) => choose(q + N - 1, q);

/**
 * Two Einstein solids, N_A and N_B oscillators, sharing q quanta. For every
 * macrostate q_A = 0 … q: ln(Ω_A Ω_B) and its probability. Also the total
 * multiplicity, the most probable q_A, and the mean and standard deviation.
 */
export function pairDist(NA, NB, q) {
  const lnW = new Float64Array(q + 1);
  let max = -Infinity, peak = 0;
  for (let a = 0; a <= q; a++) {
    lnW[a] = lnOmega(NA, a) + lnOmega(NB, q - a);
    if (lnW[a] > max) { max = lnW[a]; peak = a; }
  }
  let s = 0;
  for (let a = 0; a <= q; a++) s += Math.exp(lnW[a] - max);
  const lnTotal = max + Math.log(s);
  const p = new Float64Array(q + 1);
  let mean = 0, m2 = 0;
  for (let a = 0; a <= q; a++) { p[a] = Math.exp(lnW[a] - lnTotal); mean += a * p[a]; m2 += a * a * p[a]; }
  return { lnW, p, lnTotal, peak, lnPeak: max, mean, sd: Math.sqrt(Math.max(0, m2 - mean * mean)) };
}

/** Every way to put q quanta into N oscillators (compositions of q into N parts), up to `cap` of them, in order. */
export function microstates(N, q, cap = 500) {
  const out = [], cur = new Array(N).fill(0);
  const rec = (i, left) => {
    if (out.length >= cap) return;
    if (i === N - 1) { cur[i] = left; out.push(cur.slice()); return; }
    for (let k = left; k >= 0; k--) { cur[i] = k; rec(i + 1, left - k); }
  };
  if (N >= 1) rec(0, q);
  return out;
}

/** A small seeded generator (mulberry32): returns a function giving numbers in [0, 1). */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The two solids as one row of N_A + N_B oscillators (A first). `start`:
 * 'A' puts every quantum in A, 'B' every one in B, 'even' shares them in
 * proportion to size, or a whole number is q_A itself. Quanta are dropped on
 * random oscillators of their solid.
 */
export function makePair(NA, NB, q, start = 'A', seed = 1) {
  const R = rng(seed);
  const qA = typeof start === 'number' ? Math.max(0, Math.min(q, Math.round(start))) : start === 'B' ? 0 : start === 'even' ? Math.round((q * NA) / (NA + NB)) : q;
  const n = new Int32Array(NA + NB);
  for (let k = 0; k < qA; k++) n[Math.floor(R() * NA)]++;
  for (let k = 0; k < q - qA; k++) n[NA + Math.floor(R() * NB)]++;
  return { NA, NB, q, n, qA, moves: 0, visits: new Float64Array(q + 1), R };
}

/**
 * k random exchanges: pick an oscillator at random; if it holds a quantum,
 * hand one to another oscillator picked at random (either solid). Every move
 * and its reverse are equally likely, so in the long run every microstate is
 * visited equally often — the fundamental assumption, made into dynamics.
 * Each move's macrostate q_A is tallied in `visits`.
 */
export function exchange(S, k = 1) {
  const N = S.NA + S.NB, n = S.n, R = S.R;
  for (let m = 0; m < k; m++) {
    const i = Math.floor(R() * N);
    if (n[i] > 0) {
      const j = Math.floor(R() * N);
      n[i]--; n[j]++;
      if (i < S.NA && j >= S.NA) S.qA--;
      else if (i >= S.NA && j < S.NA) S.qA++;
    }
    S.moves++;
    S.visits[S.qA]++;
  }
  return S;
}
