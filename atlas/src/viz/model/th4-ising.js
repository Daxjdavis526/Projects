// The two-dimensional Ising model on an L × L square lattice with periodic
// edges: spins sᵢ = ±1, energy E = −J Σ⟨ij⟩ sᵢsⱼ − h Σ sᵢ (each nearest-
// neighbour bond counted once). Temperatures and fields are in units of J
// (T means kT/J, h means h/J). Metropolis Monte Carlo — pick a spin, flip it
// with probability min(1, e^(−ΔE/kT)) — with a seeded generator, so a
// static picture is the same every time; exact results to check it against:
// Onsager's critical temperature, Yang's spontaneous magnetization, the
// mean-field self-consistency equation, and brute-force enumeration of a
// small lattice. DOM-free; tested in test/th4-ising.test.mjs.

/** Onsager (1944): kT_c/J = 2/ln(1 + √2) = 2.269 185… */
export const TC = 2 / Math.log(1 + Math.SQRT2);

/** A small seeded generator (mulberry32): numbers in [0, 1). */
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

/** A lattice: 'cold' (all up), 'hot' (each spin random) or 'half' (left half up, right half down). */
export function lattice(L, start = 'cold', seed = 1) {
  const s = new Int8Array(L * L), r = rng(seed * 7919 + 13);
  for (let i = 0; i < L * L; i++) s[i] = start === 'cold' ? 1 : start === 'half' ? ((i % L) < L / 2 ? 1 : -1) : (r() < 0.5 ? 1 : -1);
  return { L, s, rand: rng(seed), sweeps: 0, tried: 0, accepted: 0 };
}

/** The sum of the four neighbours of site i. */
export function neighbours(S, i) {
  const { L, s } = S, x = i % L, y = (i - x) / L;
  return s[y * L + ((x + 1) % L)] + s[y * L + ((x + L - 1) % L)] + s[((y + 1) % L) * L + x] + s[((y + L - 1) % L) * L + x];
}

/** The energy change (units of J) if spin i flips: ΔE = 2sᵢ(Σ neighbours + h). */
export const deltaE = (S, i, h = 0) => 2 * S.s[i] * (neighbours(S, i) + h);

/** One Metropolis sweep: L² attempts at randomly chosen sites. Returns the number of flips accepted. */
export function sweep(S, T, h = 0) {
  const n = S.L * S.L, r = S.rand;
  let acc = 0;
  for (let k = 0; k < n; k++) {
    const i = Math.floor(r() * n), dE = deltaE(S, i, h);
    if (dE <= 0 || r() < Math.exp(-dE / T)) { S.s[i] = -S.s[i]; acc++; }
  }
  S.sweeps++; S.tried += n; S.accepted += acc;
  return acc;
}

/** Magnetization per spin, between −1 and 1. */
export function magnetization(S) {
  let m = 0;
  for (const v of S.s) m += v;
  return m / S.s.length;
}

/** Energy per spin, in units of J (−2 for a perfectly aligned lattice with h = 0). */
export function energy(S, h = 0) {
  const { L, s } = S;
  let e = 0, m = 0;
  for (let i = 0; i < L * L; i++) {
    const x = i % L, y = (i - x) / L;
    e -= s[i] * (s[y * L + ((x + 1) % L)] + s[((y + 1) % L) * L + x]);
    m += s[i];
  }
  return (e - h * m) / (L * L);
}

/** Yang (1952): the exact spontaneous magnetization of the infinite lattice at h = 0. */
export function onsagerM(T) {
  if (!(T > 0) || T >= TC) return 0;
  const sh = Math.sinh(2 / T);
  return (1 - sh ** -4) ** 0.125;
}

/** Mean field: the positive root of m = tanh((z m + h)/T), z = 4 neighbours (0 above T = z when h = 0). */
export function meanFieldM(T, h = 0, z = 4) {
  let m = 1;
  for (let k = 0; k < 2000; k++) {
    const next = Math.tanh((z * m + h) / T);
    if (Math.abs(next - m) < 1e-13) return next;
    m = next;
  }
  return m;
}

/** Exact averages by enumerating every state of a small L × L periodic lattice (L ≤ 4): ⟨E⟩/N, ⟨|m|⟩, ⟨m²⟩. */
export function exactSmall(L, T, h = 0) {
  const N = L * L, S = { L, s: new Int8Array(N) };
  let Z = 0, E1 = 0, A = 0, M2 = 0, emin = Infinity;
  const states = [];
  for (let c = 0; c < 2 ** N; c++) {
    for (let i = 0; i < N; i++) S.s[i] = (c >> i) & 1 ? 1 : -1;
    const e = energy(S, h) * N, m = magnetization(S);
    states.push([e, m]);
    if (e < emin) emin = e;
  }
  for (const [e, m] of states) {
    const w = Math.exp(-(e - emin) / T);
    Z += w; E1 += w * e; A += w * Math.abs(m); M2 += w * m * m;
  }
  return { E: E1 / Z / N, absM: A / Z, m2: M2 / Z };
}
