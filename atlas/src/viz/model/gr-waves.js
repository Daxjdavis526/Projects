// Gravitational waves from a compact binary, DOM-free: the leading-order
// (Newtonian, quadrupole) inspiral of two point masses on a circular orbit —
// chirp mass, frequency sweep, time and phase to coalescence, strain — plus
// the orbital decay of an eccentric binary pulsar (Peters–Mathews), the power
// radiated by a circular orbit, and the fundamental ringing (ℓ = m = 2, n = 0
// quasinormal mode) of a non-spinning remnant. Masses are in solar masses
// unless a name says kg; everything else is SI. Tested in test/gr-waves.test.mjs.
//
// The leading-order formulas are accurate early in an inspiral and only
// rough in the last orbits; the merger itself needs numerical relativity.

export const G = 6.674e-11, C = 2.998e8, M_SUN = 1.989e30;
export const MPC = 3.0857e22, YEAR = 365.25 * 86400;
/** GM☉/c³ in s and GM☉/c² in m: the Sun's mass as a time and as a length. */
export const T_SUN = (G * M_SUN) / C ** 3, L_SUN = (G * M_SUN) / C ** 2;

/** Chirp mass (m₁m₂)^(3/5)/(m₁+m₂)^(1/5), in the units of m₁ and m₂: it alone sets the inspiral's frequency sweep. */
export const chirpMass = (m1, m2) => (m1 * m2) ** 0.6 / (m1 + m2) ** 0.2;

/** Time left until coalescence (s) when the gravitational-wave frequency is f (Hz), for chirp mass Mc (M☉). */
export const tauOfF = (f, Mc) => (5 / 256) * (Mc * T_SUN) ** (-5 / 3) * (Math.PI * f) ** (-8 / 3);

/** Gravitational-wave frequency (Hz) a time tau (s) before coalescence. */
export const fOfTau = (tau, Mc) => (1 / Math.PI) * (5 / (256 * tau)) ** (3 / 8) * (Mc * T_SUN) ** (-5 / 8);

/** Rate of frequency increase df/dt (Hz/s) at frequency f. */
export const fdot = (f, Mc) => (96 / 5) * Math.PI ** (8 / 3) * (Mc * T_SUN) ** (5 / 3) * f ** (11 / 3);

/** Chirp mass (M☉) read from a measured frequency f and its rate of change fd — how LIGO weighs a binary. */
export const chirpMassFromFdot = (f, fd) => ((5 / 96) * Math.PI ** (-8 / 3) * f ** (-11 / 3) * fd) ** (3 / 5) / T_SUN;

/** Gravitational-wave phase (rad) still to come before coalescence, tau seconds out (twice the orbital phase). */
export const phaseOfTau = (tau, Mc) => 2 * (tau / (5 * Mc * T_SUN)) ** (5 / 8);

/** Inverse of phaseOfTau: the time before coalescence at which phi radians remain. */
export const tauOfPhase = (phi, Mc) => 5 * Mc * T_SUN * (phi / 2) ** (8 / 5);

/** Number of wave cycles as the frequency sweeps from f1 to f2 (Hz). */
export const cyclesBetween = (f1, f2, Mc) => (phaseOfTau(tauOfF(f1, Mc), Mc) - phaseOfTau(tauOfF(f2, Mc), Mc)) / (2 * Math.PI);

/** Strain amplitude at frequency f for a source face-on and directly overhead, at distance D (m): 4(G𝓜/c²)^(5/3)(πf/c)^(2/3)/D. */
export const strain = (f, Mc, D) => (4 / D) * (Mc * L_SUN) ** (5 / 3) * ((Math.PI * f) / C) ** (2 / 3);

/** Gravitational-wave frequency (twice Kepler's orbital frequency) when the separation is r (m), total mass Mtot (M☉). */
export const fKepler = (r, Mtot) => Math.sqrt((G * Mtot * M_SUN) / r ** 3) / Math.PI;

/** …when the separation equals the sum of the two Schwarzschild radii, 2G(m₁+m₂)/c²: the horizons touch. */
export const fContact = (Mtot) => fKepler(2 * Mtot * L_SUN, Mtot);

/** …at the innermost stable circular orbit of the total mass, 6GM/c²: a rough end of the inspiral. */
export const fISCO = (Mtot) => fKepler(6 * Mtot * L_SUN, Mtot);

/** Power (W) radiated by two masses (kg) on a circular orbit of separation a (m): (32/5)G⁴(m₁m₂)²(m₁+m₂)/(c⁵a⁵). */
export const powerCircular = (m1, m2, a) => ((32 / 5) * G ** 4 * (m1 * m2) ** 2 * (m1 + m2)) / (C ** 5 * a ** 5);

/** Peters–Mathews enhancement of the radiated power for orbital eccentricity e. */
export const petersF = (e) => (1 + (73 / 24) * e * e + (37 / 96) * e ** 4) / (1 - e * e) ** 3.5;

/** Rate of change of the orbital period, dP_b/dt (s per s), of a binary of masses m1, m2 (M☉), period Pb (s), eccentricity e. */
export const pbDot = (Pb, m1, m2, e) => -((192 * Math.PI) / 5) * ((2 * Math.PI * chirpMass(m1, m2) * T_SUN) / Pb) ** (5 / 3) * petersF(e);

/** The ℓ = m = 2, n = 0 quasinormal mode of a Schwarzschild black hole: Mω = 0.37367 − 0.08896i (G = c = 1). */
export const QNM22 = [0.37367, 0.08896];

/** Ringing of a non-spinning remnant of mass Mf (M☉): frequency (Hz) and e-folding time (s). Spin raises the frequency. */
export const ringdown = (Mf) => ({ f: QNM22[0] / (2 * Math.PI * Mf * T_SUN), tau: (Mf * T_SUN) / QNM22[1] });
