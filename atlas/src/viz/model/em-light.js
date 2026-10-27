// Light as an electromagnetic wave (DOM-free; tested headlessly in
// test/em-light.test.mjs): the speed of light from ε₀ and μ₀, the fields,
// intensity and radiation pressure of a plane wave, wavelength and photon
// energy, and the electromagnetic spectrum — its conventional bands, real
// sources at their measured frequencies, and objects the size of a wavelength.
// Used by the em-wave and em-spectrum simulations.

export const C = 299792458;               // m/s, exact
export const EPS0 = 8.8541878188e-12;     // F/m (CODATA 2022)
export const MU0 = 1.25663706127e-6;      // T·m/A (CODATA 2022)
export const H = 6.62607015e-34;          // J·s, exact
export const E_CHARGE = 1.602176634e-19;  // C, exact
export const K_B = 1.380649e-23;          // J/K, exact
export const SOLAR_CONSTANT = 1361;       // W/m², total solar irradiance at 1 AU (Kopp & Lean 2011)

/** λ = c/f and back. */
export const lambdaOf = (f) => C / f;
export const freqOf = (lambda) => C / lambda;
/** Photon energy hf, in electronvolts. */
export const photonEV = (f) => (H * f) / E_CHARGE;

/**
 * A plane wave in vacuum of electric amplitude E0 (V/m): magnetic amplitude
 * B0 = E0/c, time-averaged energy density u = ½ε₀E0², intensity I = cu, the
 * pressure on a perfect absorber I/c and on a perfect reflector 2I/c (normal
 * incidence), and the rms field.
 */
export function plane(E0) {
  const B0 = E0 / C, u = 0.5 * EPS0 * E0 * E0, I = C * u;
  return { E0, B0, u, uE: u / 2, uB: u / 2, I, pAbs: I / C, pRef: (2 * I) / C, Erms: E0 / Math.SQRT2 };
}
/** The electric amplitude of a plane wave of intensity I (W/m²): E0 = √(2I/cε₀). */
export const E0ofI = (I) => Math.sqrt((2 * I) / (C * EPS0));

/**
 * The bands, as conventionally divided (frequencies in Hz). The edges are
 * conventions, not physics; X-rays and gamma rays overlap in energy and are
 * really named for their source (electrons versus nuclei) — here they are
 * split at 30 EHz (about 124 keV) only so every frequency has one name.
 */
export const BANDS = [
  { id: 'radio', name: 'radio', from: 3e3, to: 3e8, color: '#5c7cfa' },
  { id: 'microwave', name: 'microwave', from: 3e8, to: 3e11, color: '#3bc9db' },
  { id: 'infrared', name: 'infrared', from: 3e11, to: 4e14, color: '#e8590c' },
  { id: 'visible', name: 'visible', from: 4e14, to: 7.5e14, color: '#ffd43b' },
  { id: 'ultraviolet', name: 'ultraviolet', from: 7.5e14, to: 3e16, color: '#9775fa' },
  { id: 'xray', name: 'X-ray', from: 3e16, to: 3e19, color: '#20c997' },
  { id: 'gamma', name: 'gamma ray', from: 3e19, to: 3e24, color: '#f06595' },
];
export function bandOf(f) {
  return BANDS.find((b) => f >= b.from && f < b.to) || (f < BANDS[0].from ? { id: 'below', name: 'very long radio waves' } : { id: 'above', name: 'gamma ray' });
}

const fromLambda = (l) => C / l;
const fromKeV = (keV) => (keV * 1e3 * E_CHARGE) / H;
/**
 * Real sources at their measured (or defining) frequencies. `band` is where
 * the frequency falls in BANDS; `short` is a label for a crowded picture.
 */
export const SOURCES = [
  { id: 'am', f: 1.0e6, band: 'radio', short: 'AM radio', text: 'AM radio (540–1700 kHz)' },
  { id: 'fm', f: 1.0e8, band: 'radio', short: 'FM radio', text: 'FM radio (88–108 MHz)' },
  { id: 'h21', f: 1.420405751768e9, band: 'microwave', short: 'H 21 cm', text: 'hydrogen’s 21 cm line, 1420.4 MHz' },
  { id: 'gps', f: 1.57542e9, band: 'microwave', short: 'GPS L1', text: 'GPS L1 carrier, 1575.42 MHz' },
  { id: 'oven', f: 2.45e9, band: 'microwave', short: 'microwave oven', text: 'microwave oven, 2.45 GHz' },
  { id: 'dsn', f: 8.4e9, band: 'microwave', short: 'deep-space link', text: 'deep-space X-band downlink, 8.4 GHz' },
  { id: 'cmb', f: 160.2e9, band: 'microwave', short: 'CMB peak', text: 'peak of the cosmic microwave background, 160 GHz' },
  { id: 'body', f: fromLambda(2.897771955e-3 / 310), band: 'infrared', short: 'your body', text: 'peak of a 37 °C body’s thermal glow, 9.3 µm' },
  { id: 'halpha', f: fromLambda(656.28e-9), band: 'visible', short: 'H-alpha', text: 'hydrogen-alpha line, 656 nm (red)' },
  { id: 'green', f: fromLambda(532e-9), band: 'visible', short: 'green laser', text: 'green laser pointer, 532 nm' },
  { id: 'uvc', f: fromLambda(253.7e-9), band: 'ultraviolet', short: 'germicidal lamp', text: 'germicidal mercury lamp, 254 nm (UV-C)' },
  { id: 'cuka', f: fromKeV(8.048), band: 'xray', short: 'Cu Kα X-ray', text: 'copper Kα X-ray, 8.05 keV (crystallography)' },
  { id: 'e511', f: fromKeV(511), band: 'gamma', short: '511 keV', text: 'electron–positron annihilation, 511 keV' },
  { id: 'co60', f: fromKeV(1332.5), band: 'gamma', short: 'cobalt-60', text: 'cobalt-60 gamma ray, 1.33 MeV' },
];

/** Things about one wavelength across, for a sense of scale (λ in metres). */
export const SIZES = [
  { l: 100, text: 'a football pitch' },
  { l: 1, text: 'a person' },
  { l: 1e-2, text: 'a bee' },
  { l: 1e-3, text: 'a pinhead' },
  { l: 1e-5, text: 'a cell' },
  { l: 1e-6, text: 'a bacterium' },
  { l: 1e-7, text: 'a virus' },
  { l: 1e-9, text: 'a large molecule' },
  { l: 1e-10, text: 'an atom' },
  { l: 1e-14, text: 'an atomic nucleus' },
];
/** The size comparison nearest λ (within a factor of 4), or null. */
export function sizeOf(lambda) {
  let best = null, err = Infinity;
  for (const s of SIZES) { const e = Math.abs(Math.log10(lambda / s.l)); if (e < err) { err = e; best = s; } }
  return err <= Math.log10(4) ? best : null;
}

/** Wien’s law in frequency: a blackbody at T radiates most power per unit frequency at f = 2.821 kT/h. */
export const wienFreq = (T) => (2.821439372 * K_B * T) / H;
/** Wien’s law in wavelength: λ_max = b/T, b = 2.897771955×10⁻³ m·K. */
export const wienLambda = (T) => 2.897771955e-3 / T;

/**
 * Ampère–Maxwell for a parallel-plate capacitor of circular plates (radius R,
 * metres) charging with current I (A), fringing ignored: the field between the
 * plates grows at dE/dt = I/(ε₀πR²), so the displacement current through a
 * disc of radius r centred on the axis between the plates is I·min(1, r²/R²),
 * and the magnetic field at distance r from the axis is μ₀I_enc/(2πr) — the
 * same outside the plates as around the wire.
 */
export function chargingGap({ I, R }) {
  const dEdt = I / (EPS0 * Math.PI * R * R);
  const Id = (r) => I * Math.min(1, (r * r) / (R * R));
  return {
    dEdt,
    Id,
    Bgap: (r) => (MU0 * Id(r)) / (2 * Math.PI * r),
    Bwire: (r) => (MU0 * I) / (2 * Math.PI * r),
  };
}
