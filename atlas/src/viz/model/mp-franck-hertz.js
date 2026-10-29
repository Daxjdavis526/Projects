// The Franck–Hertz experiment, DOM-free (tested in test/mp-franck-hertz.test.mjs).
// Electrons leave a hot cathode, are accelerated through a gas towards a grid
// by a voltage V, and must then climb a small retarding voltage Vr to reach
// the anode. An electron that has gained the atoms’ first excitation energy
// E₁ can lose exactly E₁ in an inelastic collision; the anode current
// therefore drops each time V passes another multiple of E₁.
//
// The teaching model: an electron gains energy steadily on its way to the
// grid. Once its kinetic energy exceeds E₁ it excites an atom after gaining
// a further random amount δ (gamma-distributed, mean 2·`lambda`,
// standing in for the distance it travels before it meets an atom), keeps
// the excess δ, and carries on. So the n-th excitation happens when the
// field has supplied nE₁ + δₙ, and an electron that excites n atoms reaches
// the grid with U − nE₁. Elastic collisions are ignored (an electron can give
// a mercury atom at most 4m/M ≈ 10⁻⁵ of its energy that way), as are space
// charge, the second excitation level and ionization; a small Gaussian spread
// of starting energies smooths the retarding threshold, and the overall rise of the current
// with V is modelled as proportional to V. Used by the mp-franck-hertz
// simulation and the PHYS 2710 lesson on Franck–Hertz and energy levels.

export const HC_EVNM = 1239.841984;                   // eV nm, exact

export const GASES = {
  // mercury: the 6³P₁ level (NIST ASD), whose decay gives the 253.7 nm ultraviolet line
  hg: { label: 'mercury', symbol: 'Hg', E1: 4.88648, lambda: 0.3, spread: 0.3, Vmax: 30, visible: false },
  // neon: excitation to the 3p levels near 18.4–19.0 eV; they decay through the 3s levels, giving the orange-red glow
  ne: { label: 'neon', symbol: 'Ne', E1: 18.7, lambda: 1.0, spread: 1.0, Vmax: 80, visible: true },
};

/**
 * Probability that the overshoot is below a. The overshoot has a gamma(2)
 * distribution of scale lam (mean 2·lam): its density starts from zero, so an
 * electron is unlikely to excite an atom the instant it has exactly E₁ and
 * the current rounds over smoothly at each peak.
 */
const below = (a, lam) => (a <= 0 ? 0 : 1 - (1 + a / lam) * Math.exp(-a / lam));

/** The error function (Abramowitz & Stegun 7.1.26, good to 1.5 × 10⁻⁷). */
function erf(x) {
  const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
  return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a));
}
/** The fraction of a Gaussian spread of width sg lying above zero, for a margin x: a smoothed step. */
const smoothStep = (x, sg) => (sg > 0 ? 0.5 * (1 + erf(x / (Math.SQRT2 * sg))) : x > 0 ? 1 : 0);

/**
 * The fraction of electrons reaching the anode when the field supplies an
 * energy U (eV) on the way to the grid, for excitation energy E1, retarding
 * voltage Vr, overshoot scale lam and a spread sg of starting energies (which
 * smooths the retarding threshold). An electron that excites n atoms arrives
 * with U − nE₁ and passes if that exceeds Vr.
 */
export function anodeFraction(U, E1, Vr, lam, sg = 0) {
  if (U <= 0) return 0;
  let pAtLeast = 1, frac = 0;                          // P(N ≥ n)
  for (let n = 0; n <= Math.floor(U / E1) + 1; n++) {
    const pNext = pAtLeast * below(U - (n + 1) * E1, lam);   // P(N ≥ n + 1)
    frac += (pAtLeast - pNext) * smoothStep(U - n * E1 - Vr, sg);   // P(N = n) × P(passes)
    pAtLeast = pNext;
    if (pAtLeast < 1e-12) break;
  }
  return frac;
}

/**
 * The anode current (arbitrary units) at accelerating voltage V for a gas.
 * opts: Vr (retarding voltage, V), contact (contact potential, V: subtracted
 * from V before anything else), lambda and spread (override the gas’s).
 */
export function anodeCurrent(V, gas, { Vr = 1.5, contact = 0, lambda, spread } = {}) {
  const G = typeof gas === 'string' ? GASES[gas] : gas;
  const U0 = V - contact;
  return Math.max(0, U0) * anodeFraction(U0, G.E1, Vr, lambda ?? G.lambda, spread ?? G.spread);
}

/** The current on a grid of voltages from 0 to Vmax (n + 1 points): [[V, I], …]. */
export function curve(gas, opts = {}, n = 600) {
  const G = GASES[gas], out = [];
  for (let i = 0; i <= n; i++) { const V = (G.Vmax * i) / n; out.push([V, anodeCurrent(V, gas, opts)]); }
  return out;
}

/** Local maxima of a sampled curve (ignoring tiny wiggles): the voltages of the current peaks. */
export function peaks(pts, minRise = 0.02) {
  const top = Math.max(...pts.map((p) => p[1]));
  const out = [];
  for (let i = 1; i < pts.length - 1; i++) {
    if (pts[i][1] > pts[i - 1][1] && pts[i][1] >= pts[i + 1][1] && pts[i][1] > minRise * top) {
      // a real peak: the current falls by a good fraction soon after it
      const after = pts.slice(i, i + 60).reduce((m, p) => Math.min(m, p[1]), Infinity);
      if (after < 0.8 * pts[i][1]) out.push(pts[i][0]);
    }
  }
  return out;
}

/** Where along the cathode–grid gap (0 at the cathode, 1 at the grid) a typical electron excites atoms: kE₁/U. */
export const excitationPlaces = (U, E1) => { const out = []; for (let k = 1; k * E1 < U; k++) out.push((k * E1) / U); return out; };
/** How many atoms a typical electron excites on its way to the grid. */
export const excitations = (U, E1) => Math.max(0, Math.ceil(U / E1) - 1);
/** The wavelength (nm) of the photon an atom emits returning to the ground state from the level E (eV). */
export const photonNm = (E) => HC_EVNM / E;
/** The largest fraction of its kinetic energy an electron (mass m) can give a resting atom (mass M) in an elastic head-on collision. */
export const elasticShare = (m, M) => (4 * m * M) / (m + M) ** 2;
