// The driven damped oscillator in Taylor's notation, DOM-free, for the
// cm-resonance and cm-fourier simulations (PHYS 3550, module M2):
//
//   ẍ + 2βẋ + ω₀²x = f(t),   f = F/m (force per unit mass, m/s²)
//
// For f = f₀ cos ωt the steady state is A cos(ωt − δ) with
//   A² = f₀² / [(ω₀² − ω²)² + 4β²ω²],   tan δ = 2βω / (ω₀² − ω²),
// and near resonance A² is close to the Lorentzian
//   A² ≈ (f₀²/4ω₀²) / [(ω − ω₀)² + β²],
// whose full width at half maximum is 2β. A periodic f is a Fourier series
// f = a₀/2 + Σ aₙ cos nωt + bₙ sin nωt; by superposition each harmonic gets
// its own steady response. Tested in test/cm-osc.test.mjs.

/** Steady amplitude for drive f₀ cos ωt. */
export const amp = (w, w0, beta, f0 = 1) => f0 / Math.sqrt((w0 * w0 - w * w) ** 2 + 4 * beta * beta * w * w);

/** Phase lag δ in [0, π]: how far the response trails the drive. */
export const phase = (w, w0, beta) => Math.atan2(2 * beta * w, w0 * w0 - w * w);

/** The Lorentzian approximation to A², valid for β ≪ ω₀ and ω near ω₀. */
export const lorentzA2 = (w, w0, beta, f0 = 1) => (f0 * f0) / (4 * w0 * w0) / ((w - w0) ** 2 + beta * beta);

/** Quality factor Q = ω₀/2β. */
export const Q = (w0, beta) => w0 / (2 * beta);

/** Angular frequency of free damped oscillation ω₁ = √(ω₀² − β²) (NaN when not underdamped). */
export const w1 = (w0, beta) => (beta < w0 ? Math.sqrt(w0 * w0 - beta * beta) : NaN);

/** The drive frequency where A peaks: √(ω₀² − 2β²) (0 when β² ≥ ω₀²/2: no peak away from 0). */
export const wPeak = (w0, beta) => Math.sqrt(Math.max(0, w0 * w0 - 2 * beta * beta));

/**
 * Average power absorbed from the drive (equal to the power dissipated) per unit mass,
 * in W/kg: ⟨P⟩/m = β ω² A² — since ⟨P⟩ = b⟨ẋ²⟩ = 2mβ · ½ω²A².
 */
export const power = (w, w0, beta, f0 = 1) => beta * w * w * amp(w, w0, beta, f0) ** 2;

/** The exact full width at half maximum of A²(ω) (equivalently of the power curve near resonance), found numerically. */
export function fwhmA2(w0, beta) {
  const wp = wPeak(w0, beta);
  if (!(wp > 0)) return NaN;
  const half = amp(wp, w0, beta) ** 2 / 2;
  const g = (w) => amp(w, w0, beta) ** 2 - half;
  const lo = g(0) < 0 ? bisect(g, 0, wp) : 0, hi = bisect(g, wp, wp + 50 * (beta + w0));
  return hi - lo;
}

/** The exact full width at half maximum of the power curve ⟨P⟩(ω): exactly 2β, for any damping. */
export function fwhmPower(w0, beta) {
  const pmax = power(w0, w0, beta);
  const g = (w) => power(w, w0, beta) - pmax / 2;
  return bisect(g, w0, w0 + 50 * (beta + w0)) - bisect(g, 1e-12, w0);
}

function bisect(f, a, b) {
  let fa = f(a);
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2, fm = f(m);
    if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m;
  }
  return (a + b) / 2;
}

/** Free damped motion from x(0) = x0, ẋ(0) = v0 (underdamped only): returns x(t). */
export function ringdown(w0, beta, x0 = 1, v0 = 0) {
  const W = w1(w0, beta);
  return (t) => Math.exp(-beta * t) * (x0 * Math.cos(W * t) + ((v0 + beta * x0) / W) * Math.sin(W * t));
}

/** Mechanical energy per unit mass, ½ẋ² + ½ω₀²x². */
export const energy = (x, v, w0) => 0.5 * v * v + 0.5 * w0 * w0 * x * x;

// ── periodic forcing ────────────────────────────────────────────────────────

export const WAVES = ['pulse', 'square', 'sawtooth', 'triangle'];

/**
 * Fourier coefficients of a periodic force per unit mass, period τ, fundamental ω = 2π/τ.
 *   pulse     height h for a fraction d of each period, centred on t = 0 (0 the rest of the time):
 *             a₀/2 = hd, aₙ = (2h/nπ) sin(nπd), bₙ = 0
 *   square    ±h, +h for |t| < τ/4 (a pulse with d = ½, less its mean): aₙ = (4h/nπ) sin(nπ/2)
 *   sawtooth  rising linearly from −h to +h over (−τ/2, τ/2): bₙ = (2h/nπ)(−1)ⁿ⁺¹
 *   triangle  h at t = 0 falling linearly to −h at ±τ/2: aₙ = (8h/n²π²) for odd n, 0 for even
 * Returns { c0, a: [a₁…a_N], b: [b₁…b_N] } with c0 = a₀/2 (the mean).
 */
export function coeffs(wave, N, h = 1, d = 0.5) {
  const a = [], b = [];
  let c0 = 0;
  if (wave === 'pulse') c0 = h * d;
  for (let n = 1; n <= N; n++) {
    let an = 0, bn = 0;
    if (wave === 'pulse') an = ((2 * h) / (n * Math.PI)) * Math.sin(n * Math.PI * d);
    else if (wave === 'square') an = ((4 * h) / (n * Math.PI)) * Math.sin((n * Math.PI) / 2);
    else if (wave === 'sawtooth') bn = ((2 * h) / (n * Math.PI)) * (n % 2 ? 1 : -1);
    else if (wave === 'triangle') an = n % 2 ? (8 * h) / (n * n * Math.PI * Math.PI) : 0;
    a.push(Math.abs(an) < 1e-15 ? 0 : an);
    b.push(Math.abs(bn) < 1e-15 ? 0 : bn);
  }
  return { c0, a, b };
}

/** The waveform itself at time t (period tau). */
export function wave(waveName, t, tau, h = 1, d = 0.5) {
  let u = ((t / tau) % 1 + 1.5) % 1 - 0.5;            // phase in [−½, ½)
  if (waveName === 'pulse') return Math.abs(u) < d / 2 ? h : Math.abs(Math.abs(u) - d / 2) < 1e-12 ? h / 2 : 0;
  if (waveName === 'square') return Math.abs(u) < 0.25 ? h : Math.abs(Math.abs(u) - 0.25) < 1e-12 ? 0 : -h;
  if (waveName === 'sawtooth') return Math.abs(u + 0.5) < 1e-12 ? 0 : 2 * h * u;
  if (waveName === 'triangle') return h * (1 - 4 * Math.abs(u));
  return NaN;
}

/** The N-term partial sum of the series at time t. */
export function partial(C, t, tau, N = C.a.length) {
  const w = (2 * Math.PI) / tau;
  let s = C.c0;
  for (let n = 1; n <= Math.min(N, C.a.length); n++) s += C.a[n - 1] * Math.cos(n * w * t) + C.b[n - 1] * Math.sin(n * w * t);
  return s;
}

/** The steady response to the series: each harmonic through the oscillator. Returns harmonics [{ n, w, f, A, delta }] and x(t). */
export function response(C, tau, w0, beta, N = C.a.length) {
  const w = (2 * Math.PI) / tau;
  const harm = [];
  for (let n = 1; n <= Math.min(N, C.a.length); n++) {
    const f = Math.hypot(C.a[n - 1], C.b[n - 1]);
    harm.push({ n, w: n * w, f, A: amp(n * w, w0, beta, f), delta: phase(n * w, w0, beta) });
  }
  const x0 = C.c0 / (w0 * w0);
  const x = (t) => {
    let s = x0;
    for (let n = 1; n <= harm.length; n++) {
      const g = amp(n * w, w0, beta), dl = phase(n * w, w0, beta), arg = n * w * t - dl;
      s += g * (C.a[n - 1] * Math.cos(arg) + C.b[n - 1] * Math.sin(arg));
    }
    return s;
  };
  return { harm, x0, x };
}

/** Parseval: the mean square of a periodic f equals c0² + ½Σ(aₙ² + bₙ²). */
export const meanSquare = (C) => C.c0 * C.c0 + 0.5 * C.a.reduce((s, an, i) => s + an * an + C.b[i] * C.b[i], 0);
