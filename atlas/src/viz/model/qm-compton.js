// Compton scattering, DOM-free (tested in test/qm-compton.test.mjs): a photon
// of wavelength λ scatters off a free electron at rest through angle θ.
// Energy and momentum conservation give λ′ − λ = (h/m_e c)(1 − cos θ); the
// electron recoils with the missing energy and momentum. Used by the
// qm-compton simulation and the PHYS 2220 lesson on photons.

import { C, H, HC_EVNM } from './qm-light.js';

export const ME = 9.1093837139e-31;                 // kg, electron mass (CODATA 2022)
export const MEC2_KEV = 510.99895069;               // keV, electron rest energy (CODATA 2022)
export const LAMBDA_C = H / (ME * C);               // m, the electron's Compton wavelength
export const LAMBDA_C_PM = LAMBDA_C * 1e12;         // pm: 2.426…
const HC_KEVPM = HC_EVNM;                           // hc in keV pm has the same digits as in eV nm
const DEG = Math.PI / 180;

/** Photon energy (keV) for a wavelength in pm, and back. */
export const keV = (pm) => HC_KEVPM / pm;
export const pmOf = (kev) => HC_KEVPM / kev;
/** The Compton shift (pm) at scattering angle θ (degrees). */
export const shiftPm = (thetaDeg) => LAMBDA_C_PM * (1 - Math.cos(thetaDeg * DEG));

/** Sources of the Explore picture: wavelength in pm and a description. */
export const SOURCES = {
  mo: { pm: 71.07, label: 'X-rays: molybdenum Kα', short: 'Mo Kα X-rays' },
  cs: { pm: pmOf(661.657), label: 'gamma rays: cesium-137', short: 'Cs-137 gamma rays' },
  ann: { pm: pmOf(MEC2_KEV), label: 'gamma rays: 511 keV (annihilation)', short: '511 keV gamma rays' },
  green: { pm: 532e3, label: 'green light, 532 nm', short: 'green light' },
};

/**
 * Everything about one scattering: wavelengths (pm), energies (keV), the
 * electron’s kinetic energy (keV), momentum components (keV/c) of the
 * incoming photon (along +x), the scattered photon (at +θ) and the electron
 * (at −φ below the axis), and φ in degrees.
 */
export function scatter(pm, thetaDeg) {
  const th = thetaDeg * DEG;
  const lam2 = pm + shiftPm(thetaDeg);
  const E = keV(pm), E2 = keV(lam2);
  const p = [E, 0], p2 = [E2 * Math.cos(th), E2 * Math.sin(th)];
  const pe = [p[0] - p2[0], p[1] - p2[1]];                       // momentum conservation
  const peMag = Math.hypot(pe[0], pe[1]);
  const K = E - E2;                                              // energy conservation
  const phi = peMag > 0 ? Math.atan2(-pe[1], pe[0]) / DEG : 90;  // below the axis, in degrees
  return { lam: pm, lam2, dlam: lam2 - pm, E, E2, K, p, p2, pe, peMag, phi, frac: (lam2 - pm) / pm };
}

/** The electron recoil angle from the textbook formula cot φ = (1 + E/mc²) tan(θ/2), in degrees. */
export const recoilAngle = (pm, thetaDeg) => Math.atan2(1, (1 + keV(pm) / MEC2_KEV) * Math.tan((thetaDeg * DEG) / 2)) / DEG;
/** Scattered photon energy straight from E′ = E / (1 + (E/mc²)(1 − cos θ)). */
export const scatteredKeV = (kev, thetaDeg) => kev / (1 + (kev / MEC2_KEV) * (1 - Math.cos(thetaDeg * DEG)));
