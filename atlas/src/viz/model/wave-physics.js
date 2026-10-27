// The DOM-free physics behind the wave simulations (sims/wave-string.js,
// sims/wave-sound.js, sims/wave-doppler.js): waves on strings, superposition,
// standing waves and a driven, damped string; sound in gases, intensity and
// decibels, air columns, beats; the Doppler effect and the Mach cone.
// Tested headlessly by test/wave-physics.test.mjs.

export const TAU = 2 * Math.PI;
/** Molar gas constant, J/(mol·K): exact in the 2019 SI (N_A k_B). */
export const R_GAS = 8.314462618;
/** Reference intensity for decibels, W/m² (the nominal threshold of hearing at 1 kHz). */
export const I0 = 1e-12;

// ─── strings ───────────────────────────────────────────────────────────────

/** Wave speed on a stretched string, m/s: √(F_T/μ), tension in N, linear density in kg/m. */
export const stringSpeed = (FT, mu) => Math.sqrt(FT / mu);
/** Tension needed for a wave speed v on a string of linear density μ, N. */
export const tensionFor = (v, mu) => mu * v * v;

/**
 * A sinusoidal travelling wave y = A sin(kx − dir·ωt + φ), with k = 2π/λ and ω = 2πf.
 * dir = +1 travels toward +x, −1 toward −x.
 */
export const travelling = (x, t, { A, lambda, f, dir = 1, phi = 0 }) => A * Math.sin(TAU * (x / lambda - dir * f * t) + phi);
/** The string's transverse velocity ∂y/∂t at (x, t) for that wave. */
export const travellingVelocity = (x, t, { A, lambda, f, dir = 1, phi = 0 }) => -dir * A * TAU * f * Math.cos(TAU * (x / lambda - dir * f * t) + phi);
/** The string's transverse acceleration ∂²y/∂t² at (x, t): −ω² y, which the wave equation sets equal to v² ∂²y/∂x². */
export const travellingAcceleration = (x, t, w) => -((TAU * w.f) ** 2) * travelling(x, t, w);

/** A smooth bump in time: the hand's displacement during a flick of duration `dur` (sin² shape), 0 outside it. */
export const bump = (tau, dur) => (tau > 0 && tau < dur ? Math.sin((Math.PI * tau) / dur) ** 2 : 0);

/** A pulse sent from x = 0 at time t0 toward +x at speed v: height h, flick duration dur (its width on the string is v·dur). */
export const pulseRight = (x, t, { h, dur, v, t0 = 0 }) => h * bump(t - t0 - x / v, dur);
/** A pulse sent from x = L at time t0 toward −x. */
export const pulseLeft = (x, t, { h, dur, v, L, t0 = 0 }) => h * bump(t - t0 - (L - x) / v, dur);

/** A continuous wave switched on at x = 0 at t = 0: zero ahead of its front (x > vt). */
export const wavetrain = (x, t, { A, f, v }) => (x <= v * t ? A * Math.sin(TAU * f * (t - x / v)) : 0);

// ─── superposition ─────────────────────────────────────────────────────────

/** Amplitude of the sum of two same-frequency waves with amplitudes A1, A2 and phase difference φ (rad). */
export const resultantAmplitude = (A1, A2, phi) => Math.sqrt(Math.max(0, A1 * A1 + A2 * A2 + 2 * A1 * A2 * Math.cos(phi)));
/** Phase difference (rad) produced by a path difference Δr for waves of wavelength λ that start in phase. */
export const phaseFromPath = (dr, lambda) => (TAU * dr) / lambda;

// ─── standing waves and normal modes ───────────────────────────────────────

/** Normal-mode frequency f_n = n v / 2L: a string fixed at both ends (also an air column open, or closed, at both ends). */
export const harmonic = (n, v, L) => (n * v) / (2 * L);
/** Normal-mode frequency of an air column closed at one end, f_n = n v / 4L, n = 1, 3, 5, … */
export const closedPipeMode = (n, v, L) => (n * v) / (4 * L);
/** Positions of the nodes of mode n on a string of length L fixed at both ends. */
export const nodes = (n, L) => Array.from({ length: n + 1 }, (_, j) => (j * L) / n);

// complex arithmetic, just enough for the driven string
const cx = (re, im = 0) => ({ re, im });
const cmul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a, b) => { const d = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const csqrt = (a) => { const r = Math.hypot(a.re, a.im), th = Math.atan2(a.im, a.re) / 2; return cx(Math.sqrt(r) * Math.cos(th), Math.sqrt(r) * Math.sin(th)); };
const csin = (a) => cx(Math.sin(a.re) * Math.cosh(a.im), Math.cos(a.re) * Math.sinh(a.im));

/**
 * The steady motion of a string of length L whose end x = 0 is shaken as a·cos ωt and whose
 * end x = L is fixed, with light damping (μ y_tt + b y_t = F_T y_xx, γ = b/μ in 1/s).
 * Returns the complex amplitude Y(x) = a sin(κ(L − x)) / sin(κL), κ² = (ω/v)²(1 − iγ/ω), so that
 * y(x, t) = Re[Y(x) e^{iωt}] = |Y| cos(ωt + arg Y).
 */
export function drivenString(x, { f, v, L, gamma, a = 1 }) {
  const w = TAU * f;
  if (w === 0) return cx(a * (1 - x / L));                  // a static shove: a straight line to the fixed end
  const kappa = cmul(cx(w / v), csqrt(cx(1, -gamma / w)));
  const num = csin(cmul(kappa, cx(L - x))), den = csin(cmul(kappa, cx(L)));
  const Y = cdiv(num, den);
  return cx(a * Y.re, a * Y.im);
}
/** The largest |Y(x)|/a along the driven string (sampled), its response at frequency f. */
export function drivenGain(p, samples = 240) {
  let best = 0;
  for (let i = 0; i <= samples; i++) {
    const Y = drivenString((p.L * i) / samples, { ...p, a: 1 });
    best = Math.max(best, Math.hypot(Y.re, Y.im));
  }
  return best;
}
/** The damping rate γ that makes every resonance of the driven string reach a gain G: γ = 2v/(G L). */
export const dampingForGain = (G, v, L) => (2 * v) / (G * L);

// ─── sound ─────────────────────────────────────────────────────────────────

/** Gases used in the lessons: adiabatic index γ and molar mass M (kg/mol). */
export const GASES = {
  air: { gamma: 1.4, M: 0.0289647, name: 'air' },
  helium: { gamma: 5 / 3, M: 0.0040026, name: 'helium' },
  co2: { gamma: 1.289, M: 0.04401, name: 'carbon dioxide' },
};
/** Speed of sound in an ideal gas, √(γRT/M), T in K. */
export const soundSpeed = (gamma, T, M) => Math.sqrt((gamma * R_GAS * T) / M);
/** Speed of sound in air at a Celsius temperature. */
export const soundSpeedAir = (celsius) => soundSpeed(GASES.air.gamma, celsius + 273.15, GASES.air.M);
/** Density of an ideal gas, kg/m³: PM/(RT). */
export const gasDensity = (P, T, M) => (P * M) / (R_GAS * T);

/** Pressure amplitude of a sound wave from its displacement amplitude: Δp_max = ρ v ω s_max. */
export const pressureAmplitude = (rho, v, f, smax) => rho * v * TAU * f * smax;
/** Intensity from the pressure amplitude: I = Δp_max² / (2ρv). */
export const intensityFromPressure = (dp, rho, v) => (dp * dp) / (2 * rho * v);
/** Pressure amplitude from intensity: Δp_max = √(2ρvI). */
export const pressureFromIntensity = (I, rho, v) => Math.sqrt(2 * rho * v * I);
/** Intensity at distance r from a point source of acoustic power P radiating equally in all directions. */
export const intensityAt = (P, r) => P / (4 * Math.PI * r * r);

/** Sound intensity level, dB: 10 log₁₀(I/I₀). */
export const decibels = (I) => 10 * Math.log10(I / I0);
/** Intensity, W/m², from a level in dB. */
export const intensityFromDecibels = (beta) => I0 * 10 ** (beta / 10);
/** The level of several incoherent sources together: add intensities, not decibels. */
export const addLevels = (...betas) => decibels(betas.reduce((s, b) => s + intensityFromDecibels(b), 0));
/** Sound power level of a source, dB re 1 pW: 10 log₁₀(P / 10⁻¹² W). */
export const powerLevel = (P) => 10 * Math.log10(P / 1e-12);

// ─── air columns: displacement and pressure in mode n ──────────────────────

/**
 * Standing-wave shapes in a pipe of length L for ends 'open-open', 'closed-open' (closed at x = 0)
 * or 'closed-closed'. Returns { f, lambda, s(x), p(x) }: s is the displacement envelope and p the
 * pressure-variation envelope (each with peak 1). For 'closed-open', n must be odd.
 */
export function pipeMode(ends, n, v, L) {
  if (ends === 'closed-open') {
    const k = (n * Math.PI) / (2 * L);
    return { f: closedPipeMode(n, v, L), lambda: (4 * L) / n, s: (x) => Math.sin(k * x), p: (x) => Math.cos(k * x) };
  }
  const k = (n * Math.PI) / L;
  if (ends === 'closed-closed') return { f: harmonic(n, v, L), lambda: (2 * L) / n, s: (x) => Math.sin(k * x), p: (x) => Math.cos(k * x) };
  return { f: harmonic(n, v, L), lambda: (2 * L) / n, s: (x) => Math.cos(k * x), p: (x) => Math.sin(k * x) };
}
/** The modes a pipe allows: mode numbers 1, 2, 3, … (both ends alike) or 1, 3, 5, … (closed-open). */
export const allowedModes = (ends, count) => Array.from({ length: count }, (_, j) => (ends === 'closed-open' ? 2 * j + 1 : j + 1));

// ─── beats ─────────────────────────────────────────────────────────────────

/** Beat frequency: how many times per second the loudness swells. */
export const beatFrequency = (f1, f2) => Math.abs(f1 - f2);
/** Two equal tones added: A cos 2πf₁t + A cos 2πf₂t. */
export const twoTones = (t, f1, f2, A = 1) => A * (Math.cos(TAU * f1 * t) + Math.cos(TAU * f2 * t));
/** Their envelope, 2A |cos π(f₁ − f₂)t|. */
export const beatEnvelope = (t, f1, f2, A = 1) => 2 * A * Math.abs(Math.cos(Math.PI * (f1 - f2) * t));

// ─── the Doppler effect ────────────────────────────────────────────────────

/**
 * Frequency heard from a source of frequency f in still air with sound speed v. vo is the
 * observer's speed toward the source, vs the source's speed toward the observer (negative
 * for away). Valid for |vs| < v.
 */
export const doppler = (f, v, vo, vs) => (f * (v + vo)) / (v - vs);
/** The source speed from the frequencies heard approaching and receding (observer at rest). */
export const sourceSpeedFromShift = (fUp, fDown, v) => (v * (fUp - fDown)) / (fUp + fDown);
/** Half-angle of the Mach cone, rad: sin θ = 1/M, for M ≥ 1. */
export const machAngle = (M) => Math.asin(1 / M);
/**
 * Delay between a supersonic aircraft passing directly over a ground observer at height h and
 * the boom arriving, for a uniform atmosphere (straight rays): the cone meets the ground a
 * distance h / tan θ behind the aircraft, so Δt = h / (u tan θ) with u = M v.
 */
export const boomDelay = (h, M, v) => h / (M * v * Math.tan(machAngle(M)));

/**
 * The wavefronts in flight at time t from a source moving along +x at speed u = M v, which
 * passes x = 0 at t = 0 and emits one front every 1/f seconds. Returns [{ x, r }] centres and
 * radii (oldest first), for fronts emitted since tStart.
 */
export function wavefronts(t, { M, v, f, tStart }) {
  const u = M * v, out = [];
  const first = Math.ceil(tStart * f - 1e-9);
  for (let i = first; i / f <= t + 1e-12; i++) {
    const te = i / f;
    out.push({ x: u * te, r: v * (t - te), te });
  }
  return out;
}
/**
 * The frequency heard by an observer at rest at (X, Y), from fronts emitted when the source
 * was at (u te, 0): f / (1 − M cos θ_e), where θ_e is the angle at emission between the
 * source's velocity and the line to the observer. Returns null when no sound can reach it.
 */
export function heardFrequency(X, Y, t, { M, v, f }) {
  const u = M * v;
  // the emission time te whose front reaches (X, Y) at time t: v(t − te) = |(X − u te, Y)|
  // ⇒ (v² − u²) te² − 2(v² t − u X) te + (v² t² − X² − Y²) = 0
  const A = v * v - u * u, B = -2 * (v * v * t - u * X), C = v * v * t * t - X * X - Y * Y;
  let te;
  if (Math.abs(A) < 1e-12) te = -C / B;
  else {
    const disc = B * B - 4 * A * C;
    if (disc < 0) return null;
    const r1 = (-B - Math.sqrt(disc)) / (2 * A), r2 = (-B + Math.sqrt(disc)) / (2 * A);
    const ok = [r1, r2].filter((r) => r <= t + 1e-12).sort((a, b) => b - a);
    if (!ok.length) return null;
    te = ok[0];
  }
  if (!Number.isFinite(te) || te > t + 1e-12) return null;
  const dx = X - u * te, dy = Y, d = Math.hypot(dx, dy);
  if (d < 1e-12) return null;
  const cos = dx / d;
  const den = 1 - M * cos;
  return Math.abs(den) < 1e-9 ? Infinity : f / Math.abs(den);
}
