// Hydrogen’s energy levels and spectrum, DOM-free (tested in
// test/qm-hydrogen.test.mjs). The Bohr energies E_n = −R∞hc·(μ/mₑ)/n² with
// the reduced-mass correction, transition wavelengths in vacuum and in air,
// the named series, and — for the picture that replaces Bohr’s orbits — the
// radial probability of the state with the most angular momentum for each n.
// Fine structure and the Lamb shift (parts in 10⁵) are ignored.

export const RINF = 10973731.568157;           // m⁻¹, Rydberg constant (CODATA 2022)
export const RYD_EV = 13.605693122990;         // eV, Rydberg energy R∞hc (CODATA 2022)
export const MP_ME = 1836.152673426;           // proton–electron mass ratio (CODATA 2022)
export const MU = 1 / (1 + 1 / MP_ME);         // hydrogen’s reduced mass in units of mₑ
export const RH = RINF * MU;                   // m⁻¹, Rydberg constant for hydrogen
export const A0 = 5.29177210544e-11;           // m, Bohr radius (CODATA 2022)

export const SERIES = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett' };

/** Energy of level n of hydrogen, eV (reduced mass included). */
export const energy = (n) => (-RYD_EV * MU) / (n * n);
/** Energy of level n of a one-electron ion of charge Z, eV, for an infinitely heavy nucleus (good to 0.05%). */
export const energyIon = (n, Z) => (-RYD_EV * Z * Z) / (n * n);
/** Vacuum wavelength (nm) of the photon emitted in the jump ni → nf (ni > nf; ni = Infinity gives the series limit). */
export const lineNm = (ni, nf) => 1e9 / (RH * (1 / (nf * nf) - (Number.isFinite(ni) ? 1 / (ni * ni) : 0)));
/** Photon energy (eV) of the jump ni → nf. */
export const lineEV = (ni, nf) => (Number.isFinite(ni) ? energy(ni) : 0) - energy(nf);

/**
 * Wavelength in standard air (nm) for a vacuum wavelength (nm), from Edlén’s
 * 1966 dispersion formula for dry air at 15 °C and 101 325 Pa. Spectroscopists
 * quote visible lines in air: Hα is 656.28 nm in air, 656.47 nm in vacuum.
 */
export function airNm(vac) {
  const s2 = (1000 / vac) ** 2;                  // (1/λ in μm⁻¹)²
  const n = 1 + 1e-8 * (8342.13 + 2406030 / (130 - s2) + 15997 / (38.9 - s2));
  return vac / n;
}

/** The radius (m) of Bohr’s orbit n, with the reduced-mass correction. */
export const bohrRadius = (n) => (n * n * A0) / MU;
/**
 * Radial probability density, scaled to 1 at its peak, of the state n with l = n − 1,
 * P(r) ∝ r^(2n) e^(−2r/(n a)), r in units of a = a₀/μ. Its peak, the most
 * probable distance, is at r = n² a — where Bohr put his orbit — but the
 * electron has no path: it can be found at any distance with this probability.
 */
export const radialP = (r, n) => Math.exp(2 * n * Math.log(Math.max(r, 1e-12)) - (2 * r) / n - (2 * n * Math.log(n * n) - 2 * n));
/** All lines of a series (nf) from upper levels nf+1 … top, with the series limit. */
export function seriesLines(nf, top = 7) {
  const out = [];
  for (let ni = nf + 1; ni <= top; ni++) out.push({ ni, nf, nm: lineNm(ni, nf), eV: lineEV(ni, nf) });
  return out;
}
