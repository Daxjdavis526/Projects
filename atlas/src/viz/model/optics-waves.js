// Wave optics, DOM-free: the physics behind sims/optics-waves.js, tested
// headlessly in test/optics-waves.test.mjs. Every pattern is a sum of
// phasors — one little arrow e^{iφ} per Huygens source, with φ set by the
// extra path it travels — and the closed forms of the textbooks are checked
// against those sums.
//
//   slits       N slits of width a, centres d apart (N = 1: a single slit),
//               far field (Fraunhofer) at direction θ
//   apertures   a circular aperture of diameter D: the Airy pattern, its first
//               dark ring at sin θ = 1.21967 λ/D (the Rayleigh criterion)
//   films       a single thin layer between two media: reflectance from the
//               Fresnel coefficients summed over all the internal bounces,
//               and the colour it shows in white light
//   Michelson   the brightness at the output as one mirror moves, and the
//               rings seen with a spread of directions
//   polarizers  Malus's law, as Jones vectors projected onto each polarizer
//   colour      CIE 1931 colour matching (the Wyman–Sloan–Shirley fit) and an
//               sRGB display colour for a wavelength

export const TAU = 2 * Math.PI;

/** sin x / x, with its limit 1 at 0. */
export const sinc = (x) => (Math.abs(x) < 1e-8 ? 1 - (x * x) / 6 : Math.sin(x) / x);

// ─── slits ─────────────────────────────────────────────────────────────────
// p = { N, d, a, lambda } in any one length unit; s = sin θ.

/** Centre of slit j (0 … N−1), the array centred on 0. */
export const slitCentre = (j, N, d) => (j - (N - 1) / 2) * d;

/**
 * The complex field at s = sin θ, as an explicit sum of phasors: every slit
 * split into `sub` equal strips, each a Huygens source with phase k·x·s.
 * Normalised so that θ = 0 gives 1. sub → ∞ is the exact Fraunhofer field.
 */
export function slitsFieldSum({ N = 2, d = 0, a = 0, lambda }, s, sub = 64) {
  const k = TAU / lambda;
  let re = 0, im = 0;
  for (let j = 0; j < N; j++) {
    const xc = slitCentre(j, N, d);
    for (let q = 0; q < sub; q++) {
      const ph = k * (xc + ((q + 0.5) / sub - 0.5) * a) * s;
      re += Math.cos(ph); im += Math.sin(ph);
    }
  }
  return [re / (N * sub), im / (N * sub)];
}

/**
 * The same field with each slit's strips already summed — a slit of width a
 * contributes one phasor of length sinc(πa·s/λ) at its centre's phase. This is
 * the sub → ∞ limit of slitsFieldSum, fast enough to draw.
 */
export function slitsField({ N = 2, d = 0, a = 0, lambda }, s) {
  const k = TAU / lambda, env = sinc((Math.PI * a * s) / lambda);
  let re = 0, im = 0;
  for (let j = 0; j < N; j++) { const ph = k * slitCentre(j, N, d) * s; re += Math.cos(ph); im += Math.sin(ph); }
  return [(env * re) / N, (env * im) / N];
}

/** Intensity relative to the centre of the pattern, I(θ)/I(0). */
export function slitsIntensity(p, s) {
  const [re, im] = slitsField(p, s);
  return re * re + im * im;
}

/** The single-slit envelope (sin β/β)², β = πa sin θ/λ. */
export const singleSlit = (a, lambda, s) => sinc((Math.PI * a * s) / lambda) ** 2;

/** N narrow slits: [sin(Nα)/(N sin α)]², α = πd sin θ/λ; 1 at the principal maxima. */
export function multiSlit(N, d, lambda, s) {
  const al = (Math.PI * d * s) / lambda, den = N * Math.sin(al);
  if (Math.abs(den) < 1e-9) return 1;
  return (Math.sin(N * al) / den) ** 2;
}

/** The textbook closed form: envelope × interference factor. */
export const slitsClosed = ({ N, d, a, lambda }, s) => singleSlit(a, lambda, s) * multiSlit(N, d, lambda, s);

/** sin θ of the m-th bright fringe (principal maximum) of slits d apart: d sin θ = mλ (NaN if beyond 90°). */
export const brightSin = (m, d, lambda) => { const s = (m * lambda) / d; return Math.abs(s) <= 1 ? s : NaN; };
/** sin θ of the m-th dark fringe of two slits: d sin θ = (m + ½)λ. */
export const darkSinTwo = (m, d, lambda) => { const s = ((m + 0.5) * lambda) / d; return Math.abs(s) <= 1 ? s : NaN; };
/** sin θ of the m-th minimum of a single slit (m ≠ 0): a sin θ = mλ. */
export const darkSinSingle = (m, a, lambda) => { const s = (m * lambda) / a; return Math.abs(s) <= 1 ? s : NaN; };

/**
 * The phasors themselves at s = sin θ, head to tail: `per` arrows for each slit
 * (one per strip), as the list of points the chain passes through, starting at
 * (0, 0). Each arrow has length 1/(N·per), so the chain's end is the field.
 */
export function phasorChain({ N = 2, d = 0, a = 0, lambda }, s, per = 12) {
  const k = TAU / lambda, n = N * per, pts = [[0, 0]];
  let x = 0, y = 0;
  for (let j = 0; j < N; j++) {
    const xc = slitCentre(j, N, d);
    for (let q = 0; q < per; q++) {
      const ph = k * (xc + (a > 0 ? ((q + 0.5) / per - 0.5) * a : 0)) * s;
      x += Math.cos(ph) / n; y += Math.sin(ph) / n;
      pts.push([x, y]);
    }
  }
  return pts;
}

/** The phase difference between neighbouring slits, 2πd sin θ/λ (rad). */
export const slitPhase = (d, lambda, s) => (TAU * d * s) / lambda;

/** Resolving power of a grating, λ/Δλ = mN. */
export const resolvingPower = (m, N) => m * N;

// ─── circular apertures ────────────────────────────────────────────────────

/** Bessel J₁(x) from J₁(x) = (1/π)∫₀^π cos(τ − x sin τ) dτ, by the trapezoid rule (spectrally accurate for this periodic integrand). */
export function besselJ1(x) {
  const n = Math.max(32, Math.ceil(Math.abs(x)) + 32);
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const tau = (Math.PI * i) / n, w = i === 0 || i === n ? 0.5 : 1;
    s += w * Math.cos(tau - x * Math.sin(tau));
  }
  return s / n;
}

/** First zero of J₁ divided by π: the dark ring of the Airy pattern sits at sin θ = 1.21967 λ/D. */
export const AIRY_FIRST_ZERO = 3.831705970207512 / Math.PI;

/** The Airy pattern of a circular aperture of diameter D, I(θ)/I(0) = [2J₁(x)/x]², x = πD sin θ/λ. */
export function airy(D, lambda, s) {
  const x = (Math.PI * D * s) / lambda;
  if (Math.abs(x) < 1e-6) return 1;
  const j = (2 * besselJ1(x)) / x;
  return j * j;
}

/**
 * The same pattern as an explicit sum of phasors: the aperture covered with a
 * grid of n × n cells, those inside the circle each a Huygens source. The
 * field along x at s = sin θ, normalised to 1 at θ = 0.
 */
export function airySum(D, lambda, s, n = 120) {
  const k = TAU / lambda, h = D / n, R2 = (D / 2) ** 2;
  let re = 0, im = 0, count = 0;
  for (let i = 0; i < n; i++) {
    const x = -D / 2 + (i + 0.5) * h;
    for (let j = 0; j < n; j++) {
      const y = -D / 2 + (j + 0.5) * h;
      if (x * x + y * y > R2) continue;
      count++;
      re += Math.cos(k * x * s); im += Math.sin(k * x * s);
    }
  }
  return (re * re + im * im) / (count * count);
}

/** The Rayleigh angle (rad): the first dark ring, θ = asin(1.21967 λ/D) ≈ 1.22 λ/D. */
export const rayleigh = (D, lambda) => Math.asin(Math.min(1, (AIRY_FIRST_ZERO * lambda) / D));

/** Two equally bright incoherent point sources an angle sep apart (rad), seen through aperture D: intensity at angle u along the line joining them. */
export function twoSources(D, lambda, sep, u, ratio = 1) {
  return (airy(D, lambda, Math.sin(u - sep / 2)) + ratio * airy(D, lambda, Math.sin(u + sep / 2))) / (1 + ratio);
}

// a fast J₁ for drawing images: a table on [0, 80] with linear interpolation, built on first use
let J1TAB = null;
const J1_STEP = 0.005, J1_MAX = 80;
export function besselJ1Fast(x) {
  const ax = Math.abs(x);
  if (ax >= J1_MAX) return besselJ1(x);
  if (!J1TAB) { J1TAB = new Float64Array(Math.ceil(J1_MAX / J1_STEP) + 2); for (let i = 0; i < J1TAB.length; i++) J1TAB[i] = besselJ1(i * J1_STEP); }
  const f = ax / J1_STEP, i = Math.floor(f), t = f - i;
  const v = J1TAB[i] * (1 - t) + J1TAB[i + 1] * t;
  return x < 0 ? -v : v;
}
/** [2J₁(x)/x]² with the fast table (x = πD sin θ/λ). */
export function airyX(x) {
  if (Math.abs(x) < 1e-6) return 1;
  const j = (2 * besselJ1Fast(x)) / x;
  return j * j;
}

// ─── thin films ────────────────────────────────────────────────────────────

/** Fresnel amplitude reflection coefficient from index na to nb, for cosines ca, cb of the angles there. */
const rS = (na, nb, ca, cb) => (na * ca - nb * cb) / (na * ca + nb * cb);
const rP = (na, nb, ca, cb) => (nb * ca - na * cb) / (nb * ca + na * cb);

/**
 * Reflectance of a film of index n1 and thickness t between n0 (where the
 * light comes from) and n2, at vacuum wavelength lambda (same unit as t) and
 * incidence angle theta0 (rad). Exact for one non-absorbing layer: the
 * reflections from both faces and all the bounces in between,
 * r = (r₀₁ + r₁₂e^{iδ})/(1 + r₀₁r₁₂e^{iδ}), δ = 4πn₁t cos θ₁/λ.
 * pol: 's', 'p' or 'u' (unpolarized, the average).
 */
export function filmReflectance({ n0 = 1, n1, n2, t, lambda, theta0 = 0, pol = 'u' }) {
  if (pol === 'u') return (filmReflectance({ n0, n1, n2, t, lambda, theta0, pol: 's' }) + filmReflectance({ n0, n1, n2, t, lambda, theta0, pol: 'p' })) / 2;
  const s0 = Math.sin(theta0), c0 = Math.cos(theta0);
  const s1 = (n0 * s0) / n1, s2 = (n0 * s0) / n2;
  if (s1 >= 1 || s2 >= 1) return 1;
  const c1 = Math.sqrt(1 - s1 * s1), c2 = Math.sqrt(1 - s2 * s2);
  const r01 = pol === 's' ? rS(n0, n1, c0, c1) : rP(n0, n1, c0, c1);
  const r12 = pol === 's' ? rS(n1, n2, c1, c2) : rP(n1, n2, c1, c2);
  const delta = (2 * TAU * n1 * t * c1) / lambda;
  const cr = Math.cos(delta), ci = Math.sin(delta);
  // numerator r01 + r12 e^{iδ}; denominator 1 + r01 r12 e^{iδ}
  const nr = r01 + r12 * cr, ni = r12 * ci, dr = 1 + r01 * r12 * cr, di = r01 * r12 * ci;
  return (nr * nr + ni * ni) / (dr * dr + di * di);
}

/** The bare surface's reflectance at normal incidence, ((n₀ − n₂)/(n₀ + n₂))². */
export const bareReflectance = (n0, n2) => ((n0 - n2) / (n0 + n2)) ** 2;

/** Quarter-wave anti-reflection coating: the ideal index √(n₀n₂) and thickness λ/(4n). */
export const quarterWave = (lambda, n) => lambda / (4 * n);
export const idealCoatingIndex = (n0, n2) => Math.sqrt(n0 * n2);

/**
 * How many of the two reflections (top face, bottom face) flip the phase by
 * half a cycle: a reflection going toward a higher index does. 1 means the
 * two-beam condition for bright reflection is 2n₁t = (m + ½)λ; 0 or 2 means 2n₁t = mλ.
 */
export const phaseFlips = (n0, n1, n2) => (n1 > n0 ? 1 : 0) + (n2 > n1 ? 1 : 0);

/** The brightest possible reflection for these three indices (over all thicknesses), from the Airy formula. */
export function filmMaxReflectance(n0, n1, n2) {
  const a = Math.abs((n0 - n1) / (n0 + n1)), b = Math.abs((n1 - n2) / (n1 + n2));
  const hi = ((a + b) / (1 + a * b)) ** 2, lo = ((a - b) / (1 - a * b)) ** 2;
  return Math.max(hi, lo);
}

// ─── colour ────────────────────────────────────────────────────────────────

const lobe = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
/** CIE 1931 2° colour matching functions x̄, ȳ, z̄ at λ (nm): the Wyman–Sloan–Shirley (2013) multi-lobe fit. */
export function cmf(l) {
  return [
    1.056 * lobe(l, 599.8, 37.9, 31.0) + 0.362 * lobe(l, 442.0, 16.0, 26.7) - 0.065 * lobe(l, 501.1, 20.4, 26.2),
    0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1),
    1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8),
  ];
}
const XYZ2RGB = [[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]];
const lin2srgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const toLinRGB = ([X, Y, Z]) => XYZ2RGB.map((r) => r[0] * X + r[1] * Y + r[2] * Z);
const STEP = 5, L0 = 380, L1 = 780;
let WHITE = null;
function spectrumXYZ(R) {
  let X = 0, Y = 0, Z = 0;
  for (let l = L0; l <= L1; l += STEP) { const [x, y, z] = cmf(l), r = R(l); X += r * x; Y += r * y; Z += r * z; }
  return [X, Y, Z];
}
/**
 * The display colour (sRGB, 0–255) of light reflected with spectral
 * reflectance R(λ) from equal-energy white light: white-balanced so that
 * R = 1 is pure white, and brightened by `gain` (reflections are weak).
 */
export function reflectedColor(R, gain = 1) {
  WHITE ??= toLinRGB(spectrumXYZ(() => 1));
  const lin = toLinRGB(spectrumXYZ(R)).map((c, i) => Math.max(0, (gain * c) / WHITE[i]));
  const m = Math.max(1, ...lin);                 // keep the hue when a channel saturates
  return lin.map((c) => Math.round(255 * lin2srgb(Math.min(1, c / m))));
}

/** The colour a film shows in reflected white light, scaled so that its brightest possible reflection is white. */
export function filmColor({ n0 = 1, n1, n2, t, theta0 = 0 }) {
  const gain = 1 / Math.max(1e-6, filmMaxReflectance(n0, n1, n2));
  return reflectedColor((l) => filmReflectance({ n0, n1, n2, t, lambda: l, theta0 }), gain);
}

/**
 * A display colour for monochromatic light of wavelength λ (nm), sRGB 0–255:
 * the usual piecewise approximation (no screen can show spectral colours
 * exactly), dimmed toward the ends of the visible range; outside 380–780 nm,
 * null.
 */
export function wavelengthRGB(l) {
  if (!(l >= 380 && l <= 780)) return null;
  let r = 0, g = 0, b = 0;
  if (l < 440) { r = -(l - 440) / 60; b = 1; }
  else if (l < 490) { g = (l - 440) / 50; b = 1; }
  else if (l < 510) { g = 1; b = -(l - 510) / 20; }
  else if (l < 580) { r = (l - 510) / 70; g = 1; }
  else if (l < 645) { r = 1; g = -(l - 645) / 65; }
  else r = 1;
  const f = l < 420 ? 0.3 + (0.7 * (l - 380)) / 40 : l > 700 ? 0.3 + (0.7 * (780 - l)) / 80 : 1;
  return [r, g, b].map((c) => Math.round(255 * (c * f) ** 0.8));
}

// ─── the Michelson interferometer ──────────────────────────────────────────

/** Output brightness (0–1) when one mirror sits dL farther than the balanced position: the path difference is 2·dL. */
export const michelson = (dL, lambda) => Math.cos((TAU * dL) / lambda) ** 2;

/** Bright fringes passing the detector as a mirror moves by dL: N = 2dL/λ. */
export const fringeCount = (dL, lambda) => (2 * dL) / lambda;

/** With the arms differing by d and light arriving at angle θ (rad), the path difference is 2d cos θ: the rings. */
export const michelsonRing = (d, lambda, theta) => Math.cos((TAU * d * Math.cos(theta)) / lambda) ** 2;

/** Fringes counted when a gas cell of length Lc in one arm changes its index by Δn: N = 2·Lc·Δn/λ. */
export const gasFringes = (Lc, dn, lambda) => (2 * Lc * dn) / lambda;

// ─── polarizers ────────────────────────────────────────────────────────────

/** Malus's law: polarized light of intensity I meeting a polarizer at angle θ (rad) to its plane leaves with I cos²θ. */
export const malus = (I, th) => I * Math.cos(th) ** 2;

/**
 * Light through a chain of ideal polarizers with transmission axes at angles
 * (rad). input: 'unpolarized', or an angle (rad) for linearly polarized
 * light. Done with Jones vectors — the field is projected onto each axis —
 * and averaged over all input directions when unpolarized. Returns the
 * intensity after each polarizer, as fractions of I₀.
 */
export function polarizerChain(angles, input = 'unpolarized') {
  const through = (phi) => {
    let ex = Math.cos(phi), ey = Math.sin(phi);
    return angles.map((a) => {
      const c = Math.cos(a), s = Math.sin(a), amp = ex * c + ey * s;
      ex = amp * c; ey = amp * s;
      return ex * ex + ey * ey;
    });
  };
  if (input !== 'unpolarized') return through(input);
  const n = 360, sum = angles.map(() => 0);
  for (let i = 0; i < n; i++) through((Math.PI * i) / n).forEach((v, k) => { sum[k] += v / n; });
  return sum;
}
