// The photoelectric effect, DOM-free (tested in test/qm-photoelectric.test.mjs).
// Einstein's equation K_max = hf − φ, the stopping potential V₀ = K_max/e,
// threshold frequencies and wavelengths, and a simple model of the
// photocurrent against the retarding voltage. Used by the qm-photoelectric
// simulation and the PHYS 2220 lesson on the photoelectric effect.

import { H_EVS, HC_EVNM, photonEV, freqHz } from './qm-light.js';

/**
 * Work functions of clean polycrystalline surfaces, in eV: the values
 * Michaelson recommended (J. Appl. Phys. 48, 4729, 1977), as tabulated in the
 * CRC Handbook. Real surfaces differ by a few tenths of an eV with the crystal
 * face, contamination and the method of measurement.
 */
export const METALS = {
  cesium: { label: 'cesium', symbol: 'Cs', phi: 2.14 },
  potassium: { label: 'potassium', symbol: 'K', phi: 2.30 },
  sodium: { label: 'sodium', symbol: 'Na', phi: 2.75 },
  zinc: { label: 'zinc', symbol: 'Zn', phi: 4.33 },
  copper: { label: 'copper', symbol: 'Cu', phi: 4.65 },
  gold: { label: 'gold', symbol: 'Au', phi: 5.1 },
  platinum: { label: 'platinum', symbol: 'Pt', phi: 5.65 },
};

/** Maximum kinetic energy (eV) of electrons ejected by light of wavelength nm from a surface of work function phi (eV); 0 below threshold. */
export const kmax = (nm, phi) => Math.max(0, photonEV(nm) - phi);
/** Einstein's line without the cut-off: hf − φ (negative below threshold). */
export const einstein = (fHz, phi) => H_EVS * fHz - phi;
/** Stopping potential (V): the retarding voltage that just stops the fastest electrons. Numerically equal to K_max in eV. */
export const stoppingV = (nm, phi) => kmax(nm, phi);
/** Threshold frequency (Hz) and wavelength (nm): the photon energy equals the work function. */
export const thresholdHz = (phi) => phi / H_EVS;
export const thresholdNm = (phi) => HC_EVNM / phi;
/** Whether light of wavelength nm ejects electrons at all. */
export const emits = (nm, phi) => photonEV(nm) > phi;

/**
 * The photocurrent, as a fraction of the saturation current, against the
 * retarding voltage V (volts; positive retards, negative accelerates). For a
 * flat electrode at low temperature the fraction of electrons whose
 * motion toward the collector exceeds eV falls as (1 − eV/K_max)² (after
 * DuBridge, 1933); every electron is collected once V ≤ 0. Real tubes add
 * contact potentials, thermal tails and collection losses.
 */
export function currentFraction(V, K) {
  if (!(K > 0)) return 0;
  if (V <= 0) return 1;
  const x = 1 - V / K;
  return x > 0 ? x * x : 0;
}

/**
 * Draw the “normal” kinetic energy (eV) of one emitted electron, consistent
 * with currentFraction: P(K > E) = (1 − E/K_max)², so K = K_max(1 − √u).
 */
export const sampleK = (Kmax, u) => Kmax * (1 - Math.sqrt(u));

/** Everything the simulation shows, for light of wavelength nm on a metal of work function phi. */
export function state({ nm, phi, intensity = 1, V = 0 }) {
  const E = photonEV(nm), f = freqHz(nm), K = kmax(nm, phi);
  return { E, f, K, V0: K, emits: E > phi, fraction: currentFraction(V, K), current: intensity * currentFraction(V, K), f0: thresholdHz(phi), lambda0: thresholdNm(phi) };
}
