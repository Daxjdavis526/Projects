// Photons, DOM-free: exact constants of the 2019 SI, photon energy and
// frequency from wavelength, the band a wavelength falls in, and an
// approximate on-screen colour for a wavelength. Shared by the qm-*
// simulations (photoelectric effect, Compton scattering, hydrogen spectra)
// and tested in test/qm-photoelectric.test.mjs.

export const C = 299792458;                     // m/s, exact
export const H = 6.62607015e-34;                // J s, exact
export const QE = 1.602176634e-19;              // C, exact (so 1 eV = 1.602176634e-19 J)
export const HBAR = H / (2 * Math.PI);          // J s
export const H_EVS = H / QE;                    // Planck's constant in eV s: 4.135667696…e-15
export const HC_EVNM = (H * C / QE) * 1e9;      // hc in eV nm: 1239.841984…

/** Photon energy in eV for a vacuum wavelength in nm. */
export const photonEV = (nm) => HC_EVNM / nm;
/** Frequency in Hz for a vacuum wavelength in nm. */
export const freqHz = (nm) => C / (nm * 1e-9);
/** Vacuum wavelength in nm of a photon of energy E (eV). */
export const lambdaNm = (eV) => HC_EVNM / eV;

/** The conventional band of a vacuum wavelength (nm). Edges are conventions, not physics. */
export function bandOf(nm) {
  if (nm < 0.01) return 'gamma ray';
  if (nm < 10) return 'X-ray';
  if (nm < 380) return 'ultraviolet';
  if (nm <= 750) return 'visible';
  if (nm < 1e6) return 'infrared';
  return 'radio';
}
export const isVisible = (nm) => nm >= 380 && nm <= 750;

/**
 * An approximate display colour for a wavelength (nm), as [r, g, b] in 0–255.
 * A piecewise-linear fit to the eye’s hues (after D. Bruton’s widely used
 * scheme), dimmed toward the ends of vision. Screens cannot show pure
 * spectral colours, so this is a teaching approximation. Outside 380–750 nm
 * the light is invisible: ultraviolet is returned as a dim violet-grey and
 * infrared as a dim red-grey, for drawing only.
 */
export function wavelengthToRGB(nm) {
  if (nm < 380) return [120, 100, 160];
  if (nm > 750) return [130, 70, 70];
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else r = 1;
  const f = nm < 420 ? 0.35 + (0.65 * (nm - 380)) / 40 : nm > 700 ? 0.35 + (0.65 * (750 - nm)) / 50 : 1;
  const ch = (x) => Math.round(255 * Math.pow(Math.max(0, x) * f, 0.8));
  return [ch(r), ch(g), ch(b)];
}
/** The same colour as a CSS string, with optional alpha. */
export const wavelengthCSS = (nm, alpha = 1) => { const [r, g, b] = wavelengthToRGB(nm); return `rgba(${r}, ${g}, ${b}, ${alpha})`; };
