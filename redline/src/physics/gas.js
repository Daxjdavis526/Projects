/* Ideal-gas properties and compressible orifice flow.

   Every restriction in a gas feed system — a valve seat, a filter element, a
   regulator poppet, a nozzle throat — is modelled as an isentropic orifice
   with an effective area CdA. Mass flow through it depends only on the
   upstream stagnation state and the pressure ratio across it:

       mdot = CdA · P0/√(R·T0) · f(Pr),     Pr = P_down / P_up

   with f constant once the flow chokes (Pr below the critical ratio, 0.528
   for nitrogen) and falling to zero as Pr → 1. This is the one equation that
   drives most of the cold-gas simulator, and most of what a test engineer
   reads off a cold-gas stand follows from it: a choked throat makes mass flow
   proportional to chamber pressure; an unchoked valve makes the drop across
   it depend on flow squared.

   One numerical concession: f(Pr) has an infinite slope at Pr = 1, which
   makes an explicit integrator ring when two volumes nearly equalise. Within
   LIN of equal pressure the curve is replaced by a straight line through
   zero. Physically this is the regime where real small-ΔP flow turns
   viscous-dominated anyway, so the linear piece is not a worse model than
   the isentropic one it replaces. */

export const GASES = {
  N2: { id: 'N2', name: 'Nitrogen', R: 296.80, gamma: 1.400,
        /* Effective Joule–Thomson coefficient across a regulator, K/Pa.
           Real N2 near room temperature is ~0.22 K/bar at 1 bar falling to
           ~0.12 K/bar at 150 bar; 0.14 K/bar is a pressure-averaged value
           for a 150 → 10 bar throttle. Ideal gases have none; this is the one
           real-gas effect the simulator keeps, because a cold regulator
           outlet is something a test engineer actually sees. */
        muJT: 0.14e-5 },
  He: { id: 'He', name: 'Helium', R: 2077.1, gamma: 1.667, muJT: -0.006e-5 },
  AIR: { id: 'AIR', name: 'Air', R: 287.05, gamma: 1.400, muJT: 0.2e-5 },
};

const LIN = 0.04;

/* Fill in the derived constants once per gas. */
export function prepareGas(g) {
  if (g._ready) return g;
  const k = g.gamma;
  g.cp = k * g.R / (k - 1);
  g.cv = g.R / (k - 1);
  g.prCrit = Math.pow(2 / (k + 1), k / (k - 1));
  g.fChoke = Math.sqrt(k) * Math.pow(2 / (k + 1), (k + 1) / (2 * (k - 1)));
  g._e1 = 2 / k;
  g._e2 = (k + 1) / k;
  g._c = 2 * k / (k - 1);
  g.fLin = fSubsonic(1 - LIN, g);
  g.slopeMax = g.fLin / LIN;        // the steepest df/dPr anywhere, used for step-size control
  g._ready = true;
  return g;
}

function fSubsonic(pr, g) {
  const d = Math.pow(pr, g._e1) - Math.pow(pr, g._e2);
  return d > 0 ? Math.sqrt(g._c * d) : 0;
}

/* Dimensionless mass flux f(Pr) for 0 ≤ Pr ≤ 1. */
export function flowFunction(pr, g) {
  if (pr <= g.prCrit) return g.fChoke;
  if (pr >= 1) return 0;
  if (pr > 1 - LIN) return g.fLin * (1 - pr) / LIN;
  return fSubsonic(pr, g);
}

/* Signed mass flow from side 1 to side 2 (negative means 2 → 1), kg/s.
   Uses the upstream side's temperature, whichever side that is. */
export function orificeFlow(CdA, P1, T1, P2, T2, g) {
  if (CdA <= 0) return 0;
  if (P1 >= P2) {
    if (P1 <= 0) return 0;
    return CdA * P1 * flowFunction(P2 / P1, g) / Math.sqrt(g.R * T1);
  }
  if (P2 <= 0) return 0;
  return -CdA * P2 * flowFunction(P1 / P2, g) / Math.sqrt(g.R * T2);
}

/* Upper bound on dmdot/dΔP for an element of effective area CdA at
   temperature T — the linearised conductance in the steepest part of the
   flow curve. The integrator uses it to pick a stable step. */
export function maxConductance(CdA, T, g) {
  return CdA * g.slopeMax / Math.sqrt(g.R * T) ;
}

/* Characteristic velocity c* of a gas at stagnation temperature T:
   the chamber-pressure-to-mass-flux ratio of a choked throat. */
export function cStar(T, g) {
  return Math.sqrt(g.R * T) / g.fChoke;
}

/* Static-to-stagnation pressure ratio at Mach M, and its inverse. */
export function prOfMach(M, g) {
  return Math.pow(1 + 0.5 * (g.gamma - 1) * M * M, -g.gamma / (g.gamma - 1));
}
export function machOfPr(pr, g) {
  const k = g.gamma;
  const x = Math.pow(pr, -(k - 1) / k) - 1;
  return x > 0 ? Math.sqrt(2 * x / (k - 1)) : 0;
}

/* Area ratio A/A* at Mach M. */
export function areaRatio(M, g) {
  const k = g.gamma;
  return (1 / M) * Math.pow((2 / (k + 1)) * (1 + 0.5 * (k - 1) * M * M), (k + 1) / (2 * (k - 1)));
}

/* Mach number at area ratio eps, subsonic or supersonic branch (bisection:
   robust, and only ever called when a nozzle is built). */
export function machOfArea(eps, supersonic, g) {
  if (eps <= 1) return 1;
  let lo = supersonic ? 1 : 1e-6, hi = supersonic ? 50 : 1;
  for (let i = 0; i < 200; i++) {
    const mid = 0.5 * (lo + hi);
    const a = areaRatio(mid, g);
    // area ratio falls with M on the subsonic branch, rises on the supersonic
    if ((a > eps) === supersonic) hi = mid; else lo = mid;
  }
  return 0.5 * (lo + hi);
}

/* Ideal exhaust velocity for isentropic expansion from (Pc, Tc) to pressure
   ratio pr = p/Pc. */
export function exhaustVelocity(Tc, pr, g) {
  const k = g.gamma;
  const x = 1 - Math.pow(pr, (k - 1) / k);
  return x > 0 ? Math.sqrt(2 * g.cp * Tc * x) : 0;
}

for (const g of Object.values(GASES)) prepareGas(g);
