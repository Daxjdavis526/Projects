// The DOM-free model behind the em-capacitor simulation: a parallel-plate
// capacitor (plate area A, gap d), optionally with a dielectric slab of
// constant κ that fills the whole gap over a fraction f of the plate area,
// either connected to a battery (V fixed) or isolated (Q fixed). Tested
// headlessly in test/em-capacitor.test.mjs.
//
// Fringing at the plate edges is ignored, so the field between the plates is
// uniform. With the slab filling the full gap over part of the area, the two
// parts are capacitors in parallel at the same voltage, so the field E = V/d
// is the same in both; the dielectric part simply holds κ times the free
// charge per area. Its molecules polarize, leaving bound surface charge
// σ_b = σ_f(1 − 1/κ) of the opposite sign against each plate.

export const EPS0 = 8.8541878188e-12;     // F/m (CODATA 2022)

/** Dielectric constants and dielectric strengths (V/m) at room temperature — typical textbook values. */
export const DIELECTRICS = {
  vacuum: { label: 'vacuum', kappa: 1, strength: null },
  air: { label: 'air', kappa: 1.00059, strength: 3.0e6 },
  teflon: { label: 'Teflon', kappa: 2.1, strength: 60e6 },
  polystyrene: { label: 'polystyrene', kappa: 2.56, strength: 24e6 },
  mylar: { label: 'Mylar', kappa: 3.2, strength: 7e6 },
  nylon: { label: 'nylon', kappa: 3.4, strength: 14e6 },
  paper: { label: 'paper', kappa: 3.7, strength: 16e6 },
  pyrex: { label: 'Pyrex glass', kappa: 5.6, strength: 14e6 },
  neoprene: { label: 'neoprene rubber', kappa: 6.7, strength: 12e6 },
  water: { label: 'water', kappa: 80, strength: null },
  srtio3: { label: 'strontium titanate', kappa: 233, strength: 8e6 },
};

/** C = κε₀A/d. */
export const parallelPlate = (A, d, kappa = 1) => (kappa * EPS0 * A) / d;
/** A full-thickness slab over a fraction f of the area: two capacitors in parallel, C = (ε₀A/d)(1 − f + κf). */
export const partialFill = (A, d, kappa, f) => ((EPS0 * A) / d) * (1 - f + kappa * f);
/** A slab of thickness t < d over the whole area: in series with the empty gap, C = ε₀A/(d − t + t/κ). */
export const slabOfThickness = (A, d, kappa, t) => (EPS0 * A) / (d - t + t / kappa);
/** Energy density of a field E in a material: u = ½κε₀E² (J/m³). */
export const energyDensity = (E, kappa = 1) => 0.5 * kappa * EPS0 * E * E;

/**
 * Everything about the capacitor in one state.
 *   { A, d, kappa = 1, f = 0, mode: 'battery' | 'isolated', V (battery), Q (isolated) }
 * Returns C, Q, V, E (the same everywhere in the gap), the free charge densities on the
 * empty and filled parts of the plates, the bound charge density on the slab's faces,
 * the energy U and the energy densities in each part.
 */
export function state({ A, d, kappa = 1, f = 0, mode = 'battery', V = 0, Q = 0 }) {
  const C = partialFill(A, d, kappa, f);
  const q = mode === 'isolated' ? Q : C * V;
  const v = mode === 'isolated' ? Q / C : V;
  const E = v / d;
  const sigmaVac = EPS0 * E, sigmaDiel = kappa * EPS0 * E;
  const sigmaBound = sigmaDiel * (1 - 1 / kappa);
  return {
    C, Q: q, V: v, E, sigmaVac, sigmaDiel, sigmaBound,
    U: 0.5 * q * v, uVac: energyDensity(E, 1), uDiel: energyDensity(E, kappa),
  };
}
