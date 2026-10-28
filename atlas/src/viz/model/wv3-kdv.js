// The Korteweg–de Vries equation u_t + 6 u u_x + u_xxx = 0, in its standard
// dimensionless form, and its two halves taken apart. DOM-free; tested in
// test/wv3-kdv.test.mjs.
//
//  - soliton: the exact solitary wave u = (c/2) sech²(√c (x − x0 − ct)/2):
//    speed c, height c/2 — taller is faster (and narrower).
//  - twoSoliton: the exact two-soliton solution u = 2 ∂²ₓ ln τ (Hirota), with
//    τ = 1 + e^θ₁ + e^θ₂ + A₁₂ e^(θ₁+θ₂), θᵢ = kᵢ(x − xᵢ) − kᵢ³t and
//    A₁₂ = ((k₁ − k₂)/(k₁ + k₂))². Each soliton has speed kᵢ² and height kᵢ²/2;
//    after they collide the faster one is shifted forward by
//    (2/k₁) ln((k₁ + k₂)/(k₁ − k₂)), the slower one back by (2/k₂) ln(…).
//  - linear: dispersion alone, u_t + u_xxx = 0, solved exactly by Fourier
//    modes (each wavenumber k turns as e^(ik³t), so ω = −k³ and v_g = −3k²:
//    every ripple runs backwards, the shortest fastest).
//  - fold: nonlinearity alone, u_t + 6 u u_x = 0, by characteristics
//    x = ξ + 6 u0(ξ) t (multivalued after the breaking time).

/** sech², safe for large arguments. */
export function sech2(s) {
  const a = Math.abs(s);
  if (a > 350) return 0;
  const e = Math.exp(-2 * a);
  return (4 * e) / ((1 + e) * (1 + e));
}

/** The one-soliton solution: speed c, height c/2, centred at x0 when t = 0. */
export const soliton = (x, t, c, x0 = 0) => (c / 2) * sech2((Math.sqrt(c) * (x - x0 - c * t)) / 2);

/** Full width at half maximum of a soliton of speed c: (4/√c) arccosh(√2). */
export const fwhm = (c) => (4 / Math.sqrt(c)) * Math.acosh(Math.SQRT2);

/** Speed of the soliton of height A (c = 2A), and k = √c. */
export const speedOf = (A) => 2 * A;

/**
 * The exact two-soliton solution. k1 > k2 > 0; xi is where soliton i would be at
 * t = 0 if the other were absent (when the two are far apart).
 */
export function twoSoliton(x, t, k1, k2, x1, x2) {
  const A = ((k1 - k2) / (k1 + k2)) ** 2, lnA = Math.log(A);
  const th1 = k1 * (x - x1) - k1 ** 3 * t, th2 = k2 * (x - x2) - k2 ** 3 * t, th12 = th1 + th2 + lnA;
  const m = Math.max(0, th1, th2, th12);
  const e0 = Math.exp(-m), e1 = Math.exp(th1 - m), e2 = Math.exp(th2 - m), e12 = Math.exp(th12 - m);
  const tau = e0 + e1 + e2 + e12;
  const d1 = k1 * e1 + k2 * e2 + (k1 + k2) * e12;
  const d2 = k1 * k1 * e1 + k2 * k2 * e2 + (k1 + k2) ** 2 * e12;
  return (2 * (tau * d2 - d1 * d1)) / (tau * tau);
}

/** The collision's position shifts [forward shift of the faster, backward shift (negative) of the slower]. */
export function phaseShifts(k1, k2) {
  const L = Math.log((k1 + k2) / Math.abs(k1 - k2));
  return [(2 * L) / k1, (-2 * L) / k2];
}

/** In-place radix-2 FFT (n a power of 2); inverse divides by n. */
export function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

/**
 * Dispersion alone, u_t + u_xxx = 0, on a periodic grid: u0 sampled at n points
 * spaced dx; returns u at time t (real part; the imaginary part is round-off).
 */
export function linear(u0, dx, t) {
  const n = u0.length, re = Float64Array.from(u0), im = new Float64Array(n);
  fft(re, im);
  const L = n * dx;
  for (let j = 0; j < n; j++) {
    const jj = j <= n / 2 ? j : j - n, k = (2 * Math.PI * jj) / L, ph = k * k * k * t;
    const c = Math.cos(ph), s = Math.sin(ph), r = re[j], i = im[j];
    re[j] = r * c - i * s; im[j] = r * s + i * c;
  }
  fft(re, im, true);
  return re;
}

/** Nonlinearity alone, u_t + 6uu_x = 0, by characteristics: [x, u] along ξ (multivalued after breaking). */
export function fold(u0, xi, t) {
  return xi.map((s) => { const u = u0(s); return [s + 6 * u * t, u]; });
}

/** Breaking time of u_t + 6uu_x = 0 for the soliton profile of speed c: 1/(6 · max|u0′|). */
export function breakTime(c) {
  // u0 = (c/2) sech²(√c ξ/2): |u0′| peaks where tanh = 1/√3, at (c/2)(√c/2)(2)(2/3)(1/√3)
  const maxSlope = (c / 2) * Math.sqrt(c) * (2 / 3) / Math.sqrt(3);
  return 1 / (6 * maxSlope);
}
