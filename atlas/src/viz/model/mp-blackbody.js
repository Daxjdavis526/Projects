// Blackbody radiation, DOM-free (tested in test/mp-blackbody.test.mjs):
// Planck’s law and the two classical formulas it replaced — the
// Rayleigh–Jeans law (equipartition) and Wien’s 1896 law — per unit
// wavelength and per unit frequency; Wien’s displacement law and the
// Stefan–Boltzmann law, with their constants computed from h, c and k; the
// share of the emitted power in a band of wavelengths; an approximate
// on-screen colour; and real objects with their (effective) temperatures.
// Used by the mp-blackbody simulation.

export const C = 299792458;                       // m/s, exact
export const H = 6.62607015e-34;                  // J s, exact
export const KB = 1.380649e-23;                   // J/K, exact
export const SIGMA = (2 * Math.PI ** 5 * KB ** 4) / (15 * H ** 3 * C ** 2);   // W m⁻² K⁻⁴

/** The root of x = n(1 − e^(−x)) (fixed-point iteration converges from x = n). */
function wienRoot(n) { let x = n; for (let i = 0; i < 200; i++) x = n * (1 - Math.exp(-x)); return x; }
export const WIEN_X = wienRoot(5);                // 4.965114…: where x⁵/(eˣ − 1) peaks
export const WIEN_NU_X = wienRoot(3);             // 2.821439…: where x³/(eˣ − 1) peaks
export const WIEN_B = (H * C) / (WIEN_X * KB);    // m K: λ_max T
export const WIEN_NU = (WIEN_NU_X * KB) / H;      // Hz/K: ν_max / T

// ---- spectral radiance (power per area per steradian per unit wavelength or frequency) ----
/** Planck’s law per unit wavelength, B_λ in W sr⁻¹ m⁻³ (λ in m, T in K). */
export const planckLambda = (lam, T) => (2 * H * C * C) / lam ** 5 / Math.expm1((H * C) / (lam * KB * T));
/** The Rayleigh–Jeans law, B_λ = 2ckT/λ⁴: classical equipartition, every mode with kT. */
export const rjLambda = (lam, T) => (2 * C * KB * T) / lam ** 4;
/** Wien’s 1896 law, B_λ = (2hc²/λ⁵) e^(−hc/λkT) (written with Planck’s constants): right at short λ, too low at long λ. */
export const wienLambda = (lam, T) => ((2 * H * C * C) / lam ** 5) * Math.exp(-(H * C) / (lam * KB * T));
/** Planck’s law per unit frequency, B_ν in W sr⁻¹ m⁻² Hz⁻¹. */
export const planckNu = (nu, T) => (2 * H * nu ** 3) / (C * C) / Math.expm1((H * nu) / (KB * T));
export const rjNu = (nu, T) => (2 * nu * nu * KB * T) / (C * C);
export const wienNu = (nu, T) => ((2 * H * nu ** 3) / (C * C)) * Math.exp(-(H * nu) / (KB * T));

/** Wavelength (m) where B_λ peaks: b/T. */
export const peakLambda = (T) => WIEN_B / T;
/** Frequency (Hz) where B_ν peaks — not c/λ_max: the two curves peak at different photons. */
export const peakNu = (T) => WIEN_NU * T;
/** The peak values of B_λ and B_ν. */
export const peakBLambda = (T) => planckLambda(peakLambda(T), T);
export const peakBNu = (T) => planckNu(peakNu(T), T);
/** Power per unit area leaving a black surface (the exitance), σT⁴, W/m². */
export const exitance = (T) => SIGMA * T ** 4;
/** Energy density of blackbody radiation, u = 4σT⁴/c, J/m³. */
export const energyDensity = (T) => (4 * SIGMA * T ** 4) / C;
/** Planck’s mean energy of an oscillator (or field mode) of frequency ν at temperature T: hν/(e^(hν/kT) − 1), J. */
export const meanEnergy = (nu, T) => (H * nu) / Math.expm1((H * nu) / (KB * T));

// ---- how the power is shared out ----
const PI4_15 = Math.PI ** 4 / 15;                 // ∫₀^∞ t³/(eᵗ − 1) dt
/** ∫ₓ^∞ t³/(eᵗ − 1) dt: a fast series for x ≥ 1, the complement of a Simpson integral below. */
function tail(x) {
  if (!(x > 0)) return PI4_15;
  if (x >= 1) {
    let s = 0;
    for (let n = 1; n <= 80; n++) {
      const e = Math.exp(-n * x);
      if (e < 1e-18) break;
      s += e * (x ** 3 / n + (3 * x * x) / n ** 2 + (6 * x) / n ** 3 + 6 / n ** 4);
    }
    return s;
  }
  const N = 200, h = x / N, f = (t) => (t === 0 ? 0 : t ** 3 / Math.expm1(t));
  let s = f(0) + f(x);
  for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * f(i * h);
  return PI4_15 - (s * h) / 3;
}
/** Fraction of all the emitted power at wavelengths shorter than λ (m). */
export const fractionBelow = (lam, T) => tail((H * C) / (lam * KB * T)) / PI4_15;
/** Fraction of all the emitted power between two wavelengths (m). */
export const bandFraction = (l1, l2, T) => Math.abs(fractionBelow(Math.max(l1, l2), T) - fractionBelow(Math.min(l1, l2), T));
/** The share that falls in the visible band, 380–750 nm. */
export const visibleFraction = (T) => bandFraction(380e-9, 750e-9, T);

// ---- an approximate screen colour ----
// The CIE 1931 2° colour-matching functions, from the multi-lobe Gaussian fit
// of Wyman, Sloan & Shirley (2013, JCGT 2(2)); good to a few per cent.
const g = (l, mu, s1, s2) => { const t = (l - mu) / (l < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
export const cmfX = (nm) => 1.056 * g(nm, 599.8, 37.9, 31.0) + 0.362 * g(nm, 442.0, 16.0, 26.7) - 0.065 * g(nm, 501.1, 20.4, 26.2);
export const cmfY = (nm) => 0.821 * g(nm, 568.8, 46.9, 40.5) + 0.286 * g(nm, 530.9, 16.3, 31.1);
export const cmfZ = (nm) => 1.217 * g(nm, 437.0, 11.8, 36.0) + 0.681 * g(nm, 459.0, 26.0, 13.8);
/** CIE XYZ of a blackbody at T (arbitrary scale). */
export function blackbodyXYZ(T) {
  let X = 0, Y = 0, Z = 0;
  for (let nm = 380; nm <= 780; nm += 2.5) {
    const B = planckLambda(nm * 1e-9, T);
    X += B * cmfX(nm); Y += B * cmfY(nm); Z += B * cmfZ(nm);
  }
  return [X, Y, Z];
}
/** Chromaticity (x, y) of a blackbody at T: the Planckian locus. */
export function chromaticity(T) { const [X, Y, Z] = blackbodyXYZ(T); const s = X + Y + Z; return [X / s, Y / s]; }
const gammaEncode = (u) => (u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055);
/**
 * The colour of a blackbody at T as [r, g, b] in 0–255, normalised so the
 * brightest channel is full: hue only, not brightness. sRGB primaries with a
 * D65 white, so a 6500 K body comes out nearly white. A teaching
 * approximation: what the eye perceives also depends on brightness and on
 * what it has adapted to (the Sun looks white, not slightly yellow-green).
 */
export function blackbodyRGB(T) {
  const [X, Y, Z] = blackbodyXYZ(T);
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z].map((v) => Math.max(0, v));
  const m = Math.max(...lin) || 1;
  return lin.map((v) => Math.round(255 * gammaEncode(v / m)));
}

// ---- real objects ----
// Effective temperatures: the temperature of the blackbody that emits the
// same power per unit area. Stars are not perfect blackbodies (their
// spectra carry absorption lines and their surfaces are not uniform); the
// CMB is the most perfect blackbody ever measured.
export const OBJECTS = {
  cmb: { label: 'CMB', name: 'the cosmic microwave background', T: 2.72548, note: 'COBE/FIRAS, Fixsen 2009' },
  body: { label: 'person', name: 'human skin', T: 306, note: 'about 33 °C' },
  lava: { label: 'lava', name: 'molten basalt lava', T: 1400, note: 'about 1100 °C' },
  lamp: { label: 'lamp', name: 'a tungsten lamp filament', T: 2800, note: 'typical' },
  betelgeuse: { label: 'Betelgeuse', name: 'Betelgeuse, a red supergiant', T: 3600, note: 'about' },
  sun: { label: 'Sun', name: 'the Sun', T: 5772, note: 'IAU 2015 nominal' },
  sirius: { label: 'Sirius', name: 'Sirius A', T: 9940, note: 'about' },
  rigel: { label: 'Rigel', name: 'Rigel, a blue supergiant', T: 12100, note: 'about' },
};
