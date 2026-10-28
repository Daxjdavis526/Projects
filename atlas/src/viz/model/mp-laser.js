// Laser rate equations, DOM-free (tested in test/mp-laser.test.mjs). Atoms in
// a gain medium between two mirrors, with photons in the cavity’s one mode.
// Three level schemes:
//   two   — ground g and upper u; the pump light drives g → u and, equally,
//           u → g (stimulated by the pump itself), so N_u can approach N_g but
//           never pass it: no inversion, no laser.
//   three — ruby-like: pump g → p, fast decay p → u, laser u → g. The lower
//           laser level is the ground state, so over half the atoms must be
//           pumped before the gain beats absorption.
//   four  — Nd:YAG- or helium–neon-like: pump g → p, fast p → u, laser u → l,
//           fast l → g. The lower laser level stays nearly empty, so even a
//           weak pump inverts the laser transition.
// Rates (per atom, per unit time; time is in units of the upper level’s
// spontaneous lifetime τ₂₁): pump W; spontaneous decay of u, 1/τ₂₁ = 1; fast
// decays 1/τ_fast; stimulated emission and absorption b·q per atom, with q
// the number of photons in the cavity mode; a fraction β of spontaneous
// emission lands in the mode (the seed); photons leave the cavity at 1/τ_c,
// where 1/τ_c = (round trips per unit time) × (internal loss − ln R) and R is
// the output mirror’s reflectivity. Populations are numbers of atoms (NA in
// all), so the same rates drive the mean-field equations and the stochastic
// picture of individual atoms.
//
// A teaching model: time is slowed enormously (real lifetimes are microseconds
// to milliseconds and a photon crosses the cavity in nanoseconds), one cavity
// mode stands for all of them, and the gain is not saturated spatially.

export const NA = 40;                              // atoms in the picture and in the equations
export const DEFAULTS = { tauFast: 0.05, b: 0.12, beta: 0.004, trips: 4, loss: 0.02 };

/** Level names, top to bottom of the energy ladder, and what the laser transition joins. */
export const SCHEMES = {
  two: { levels: ['u', 'g'], upper: 'u', lower: 'g', pump: ['g', 'u'] },
  three: { levels: ['p', 'u', 'g'], upper: 'u', lower: 'g', pump: ['g', 'p'] },
  four: { levels: ['p', 'u', 'l', 'g'], upper: 'u', lower: 'l', pump: ['g', 'p'] },
};

/** The cavity photon lifetime τ_c (units of τ₂₁) for an output mirror of reflectivity R. */
export const tauC = (R, P = DEFAULTS) => 1 / (P.trips * (P.loss - Math.log(R)));
/** The inversion N_u − N_lower (atoms) at which gain equals loss: b·ΔN·q = q/τ_c. */
export const thresholdInversion = (R, P = DEFAULTS) => 1 / (P.b * tauC(R, P));

/**
 * The transition rates (per atom, per unit time) out of each level, for pump
 * W and q photons in the cavity: { from: { to: rate } }.
 */
export function rates(scheme, W, q, P = DEFAULTS) {
  const f = 1 / P.tauFast, s = P.b * q;
  if (scheme === 'two') return { g: { u: W + s }, u: { g: 1 + W + s } };
  if (scheme === 'three') return { g: { p: W, u: s }, p: { u: f }, u: { g: 1 + s } };
  return { g: { p: W }, p: { u: f }, u: { l: 1 + s }, l: { g: f, u: s } };
}

/** Steady populations of a small rate network (atoms, adding to NA), by Gaussian elimination. */
function balance(levels, R) {
  const n = levels.length, idx = Object.fromEntries(levels.map((L, i) => [L, i]));
  const A = Array.from({ length: n }, () => new Array(n + 1).fill(0));
  for (const [from, outs] of Object.entries(R)) for (const [to, k] of Object.entries(outs)) {
    A[idx[from]][idx[from]] -= k;            // dN_from/dt ∋ −k N_from
    A[idx[to]][idx[from]] += k;              // dN_to/dt ∋ +k N_from
  }
  // replace the last equation by the total
  for (let j = 0; j < n; j++) A[n - 1][j] = 1;
  A[n - 1][n] = NA;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < n; r++) {
      if (r === c || !A[r][c]) continue;
      const m = A[r][c] / A[c][c];
      for (let k = c; k <= n; k++) A[r][k] -= m * A[c][k];
    }
  }
  return Object.fromEntries(levels.map((L, i) => [L, A[i][n] / A[i][i]]));
}

/** Populations for a fixed photon number q. */
export const populationsAt = (scheme, W, q, P = DEFAULTS) => balance(SCHEMES[scheme].levels, rates(scheme, W, q, P));

/** The net rate of change of the photon number, given populations. */
export function photonRate(scheme, N, q, R, P = DEFAULTS) {
  const S = SCHEMES[scheme];
  return P.b * q * (N[S.upper] - N[S.lower]) + P.beta * N[S.upper] - q / tauC(R, P);
}

/**
 * The steady state for pump W and mirror reflectivity R: { N (atoms per
 * level), q (photons in the cavity), inversion (N_u − N_lower), output (photons
 * leaving through the output mirror per unit time) }.
 */
export function steady(scheme, W, R, P = DEFAULTS) {
  const F = (q) => photonRate(scheme, populationsAt(scheme, W, q, P), q, R, P);
  let lo = 0, hi = 1;
  while (F(hi) > 0 && hi < 1e9) hi *= 2;
  for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (F(m) > 0) lo = m; else hi = m; }
  const q = (lo + hi) / 2, N = populationsAt(scheme, W, q, P), S = SCHEMES[scheme];
  const out = (q / tauC(R, P)) * (-Math.log(R) / (P.loss - Math.log(R)));
  return { N, q, inversion: N[S.upper] - N[S.lower], output: out };
}

/**
 * The pump rate at which the laser reaches threshold (β → 0): the inversion
 * without stimulated emission reaches thresholdInversion. Infinity for the
 * two-level scheme, which can never invert.
 */
export function thresholdPump(scheme, R, P = DEFAULTS) {
  if (scheme === 'two') return Infinity;
  const need = thresholdInversion(R, P), S = SCHEMES[scheme];
  const inv = (W) => { const N = populationsAt(scheme, W, 0, P); return N[S.upper] - N[S.lower]; };
  if (inv(1e6) < need) return Infinity;
  let lo = 0, hi = 1;
  while (inv(hi) < need) hi *= 2;
  for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (inv(m) < need) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/** One RK4 step of the mean-field equations, state { N: {level: atoms}, q }. */
export function rk4(scheme, state, W, R, dt, P = DEFAULTS) {
  const levels = SCHEMES[scheme].levels;
  const deriv = (s) => {
    const r = rates(scheme, W, s.q, P), d = Object.fromEntries(levels.map((L) => [L, 0]));
    for (const [from, outs] of Object.entries(r)) for (const [to, k] of Object.entries(outs)) { d[from] -= k * s.N[from]; d[to] += k * s.N[from]; }
    return { N: d, q: photonRate(scheme, s.N, s.q, R, P) };
  };
  const add = (s, d, h) => ({ N: Object.fromEntries(levels.map((L) => [L, s.N[L] + h * d.N[L]])), q: Math.max(0, s.q + h * d.q) });
  const k1 = deriv(state), k2 = deriv(add(state, k1, dt / 2)), k3 = deriv(add(state, k2, dt / 2)), k4 = deriv(add(state, k3, dt));
  return {
    N: Object.fromEntries(levels.map((L) => [L, state.N[L] + (dt / 6) * (k1.N[L] + 2 * k2.N[L] + 2 * k3.N[L] + k4.N[L])])),
    q: Math.max(0, state.q + (dt / 6) * (k1.q + 2 * k2.q + 2 * k3.q + k4.q)),
  };
}
export const groundState = (scheme) => ({ N: Object.fromEntries(SCHEMES[scheme].levels.map((L) => [L, L === 'g' ? NA : 0])), q: 0 });

/**
 * The stochastic picture: NA atoms, each in one level, and a whole number of
 * cavity photons. step(dt, rng) moves atoms with probability rate × dt and
 * returns the events of the step (for drawing): [{ kind, atom }] with kind
 * 'pump', 'fast', 'spont' (a spontaneous photon, `axial` if it joined the
 * mode), 'stim', 'absorb', and 'out' (a photon through the output mirror).
 */
export class Atoms {
  constructor(scheme, P = DEFAULTS) { this.scheme = scheme; this.P = P; this.reset(); }
  reset() { this.state = Array.from({ length: NA }, () => 'g'); this.q = 0; }
  counts() { const c = Object.fromEntries(SCHEMES[this.scheme].levels.map((L) => [L, 0])); for (const s of this.state) c[s]++; return c; }
  step(dt, W, R, rng) {
    const { scheme, P } = this, S = SCHEMES[scheme], ev = [];
    const r = rates(scheme, W, this.q, P), stimRate = P.b * this.q;
    for (let i = 0; i < NA; i++) {
      const from = this.state[i], outs = Object.entries(r[from] || {});
      const K = outs.reduce((sum, [, k]) => sum + k, 0);
      if (!(K > 0) || rng() >= 1 - Math.exp(-K * dt)) continue;
      // which way, in proportion to the rates
      let x = rng() * K, to = outs[outs.length - 1][0], k = outs[outs.length - 1][1];
      for (const [t, kt] of outs) { if (x < kt) { to = t; k = kt; break; } x -= kt; }
      // and by which process
      let kind = 'fast';
      const y = rng() * k;
      if (from === S.upper && to === S.lower) kind = y < stimRate ? 'stim' : scheme === 'two' && y < stimRate + W ? 'pumpdown' : 'spont';
      else if (from === S.lower && to === S.upper) kind = scheme === 'two' && y >= stimRate ? 'pump' : 'absorb';
      else if (from === S.pump[0] && to === S.pump[1]) kind = 'pump';
      const e = { kind, atom: i, from, to };
      if (kind === 'stim') this.q++;
      if (kind === 'absorb') this.q = Math.max(0, this.q - 1);
      if (kind === 'spont' && rng() < P.beta) { e.axial = true; this.q++; }
      ev.push(e);
      this.state[i] = to;
    }
    // photons leave: through the output mirror, or lost inside
    const leave = 1 - Math.exp(-dt / tauC(R, P)), outShare = -Math.log(R) / (P.loss - Math.log(R));
    const n = this.q;
    for (let j = 0; j < n; j++) if (rng() < leave) { this.q--; if (rng() < outShare) ev.push({ kind: 'out' }); }
    return ev;
  }
}

/** Real lasers the schemes stand for: levels in eV above the ground state, the laser and pump wavelengths in nm. */
export const REAL = {
  two: { name: 'a two-level atom', levels: { g: 0, u: 1.8 }, laser: null, pump: null },
  three: { name: 'ruby (Cr³⁺ in Al₂O₃)', levels: { g: 0, u: 1.786, p: 2.25 }, laser: 694.3, pump: 550, lifetime: '3 ms' },
  four: { name: 'Nd:YAG (Nd³⁺ in Y₃Al₅O₁₂)', levels: { g: 0, l: 0.26, u: 1.43, p: 1.53 }, laser: 1064, pump: 808, lifetime: '0.23 ms' },
};
