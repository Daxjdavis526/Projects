// The physics behind every moving picture in the film. Pure: no DOM, no
// canvas — the tests import it directly, and the scenes only ever draw what
// these functions return.
//
// Units: SI unless a function says otherwise. The Schwarzschild functions work
// in units where the Schwarzschild radius r_s = 1 and c = 1, which is how GR
// textbooks write them; the scenes scale the results onto the screen.

export const C = 299792458;                 // m/s, exact
export const GM_SUN = 1.32712440018e20;     // m³/s², IAU
export const GM_EARTH = 3.986004418e14;     // m³/s², WGS 84
export const R_SUN = 6.957e8;               // m, IAU nominal radius
export const R_EARTH = 6.371e6;             // m, mean radius (NASA fact sheet)
export const AU = 1.495978707e11;           // m
export const DAY = 86400;
export const YEAR = 365.25 * DAY;           // Julian year
export const MPC = 3.0856775814913673e22;   // m
export const ARCSEC = Math.PI / (180 * 3600);

// ─── special relativity (c = 1 where noted) ──────────────────────────────

export const gamma = (beta) => 1 / Math.sqrt(1 - beta * beta);

// Lorentz transformation of an event (x, t) into a frame moving at beta
// along x, with c = 1.
export function lorentz(x, t, beta) {
  const g = gamma(beta);
  return [g * (x - beta * t), g * (t - beta * x)];
}

// The invariant interval between two events, c = 1, (− + + +) signature.
export const interval = (dt, dx, dy = 0, dz = 0) => -dt * dt + dx * dx + dy * dy + dz * dz;

// A light clock: a pulse bouncing between mirrors, one round trip per tick.
// P is the tick period in the clock's own frame. Seen from a frame where the
// clock moves at beta, the pulse runs a slanted path at speed c, so its
// vertical speed is c/γ and every tick takes γP. Returns the pulse height as
// a fraction of the mirror gap (0 = bottom), the ticks completed, the period.
export function lightClock(t, P, beta = 0) {
  const period = P * gamma(beta);
  const n = Math.floor(t / period);
  const f = t / period - n;
  return { h: f < 0.5 ? 2 * f : 2 - 2 * f, ticks: n, period };
}

// Times of every tick of that clock in [0, T].
export function clockTicks(T, P, beta = 0) {
  const period = P * gamma(beta);
  const out = [];
  for (let k = 1; k * period <= T + 1e-9; k++) out.push(k * period);
  return out;
}

// Fraction of unstable particles left after proper time tau (mean life tau0).
export const survival = (tau, tau0) => Math.exp(-tau / tau0);

// The twins: one stays at x = 0, the other flies out to distance D at beta
// and straight back (c = 1, so D in light-years gives times in years).
// Returns the event (x, t) at which the traveller's own clock reads tau.
export function travellerAt(tau, D, beta) {
  const g = gamma(beta);
  const half = D / beta / g;            // proper time for each leg
  if (tau <= half) return [beta * g * tau, g * tau];
  const tTurn = D / beta;
  const s = Math.min(tau, 2 * half) - half;
  return [D - beta * g * s, tTurn + g * s];
}
export const travellerProperTime = (D, beta) => (2 * D / beta) / gamma(beta);

// Lightning at x = ±L (t = 0) seen by a platform observer at x = 0 and by a
// passenger at x = beta·t (c = 1). Returns the arrival times in the platform
// frame, and the times the passenger assigns to the strikes themselves.
export function lightning(L, beta) {
  return {
    platform: [L, L],                          // back, front
    passengerSees: [L / (1 - beta), L / (1 + beta)],
    passengerStrikeTimes: [lorentz(-L, 0, beta)[1], lorentz(L, 0, beta)[1]],
  };
}

// ─── gravity near Earth ──────────────────────────────────────────────────

// Fractional rate of a clock h metres higher, weak field: Δτ/τ ≈ gh/c².
export const towerShift = (h, g = 9.80665) => (g * h) / (C * C);

// GPS clock rates (Ashby 2003): the gravitational gain relative to a clock on
// the rotating geoid, the velocity loss, and the net, all in seconds per day.
// phi0 is the geoid's effective potential over c², including rotation.
export function gpsRates(a = 26561750, phi0 = -6.96927e-10) {
  const gm = GM_EARTH / (C * C);
  const gravity = (-gm / a - phi0) * DAY;
  const velocity = -(gm / (2 * a)) * DAY;    // v² = GM/a on a circular orbit
  return { gravity, velocity, net: gravity + velocity, fraction: (gravity + velocity) / DAY };
}

// ─── Schwarzschild (units r_s = 1, c = 1) ─────────────────────────────────

export const PHOTON_SPHERE = 1.5;
export const ISCO = 3;
export const CAPTURE_B = (3 * Math.sqrt(3)) / 2;   // critical impact parameter
export const hoverRate = (r) => Math.sqrt(1 - 1 / r);
export const schwarzschildRadius = (GM) => (2 * GM) / (C * C);

function rk4(y, x, h, f) {
  const k1 = f(x, y);
  const k2 = f(x + h / 2, y.map((v, i) => v + (h / 2) * k1[i]));
  const k3 = f(x + h / 2, y.map((v, i) => v + (h / 2) * k2[i]));
  const k4 = f(x + h, y.map((v, i) => v + h * k3[i]));
  return y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

// A light ray coming in from the left at height b (impact parameter), moving
// in +x past a black hole at the origin. Integrates the photon orbit equation
//   d²u/dφ² + u = (3/2) u²,   u = 1/r,
// and returns the path as [x, y] points, whether it fell in, and how far it
// was bent. Rays with b below 3√3/2 ≈ 2.598 are captured.
export function photonPath(b, { start = 40, maxR = 60, step = 0.004 } = {}) {
  const x0 = -start;
  const r0 = Math.hypot(x0, b);
  const phi0 = Math.atan2(b, x0);
  const u0 = 1 / r0;
  const du0 = Math.sqrt(Math.max(0, 1 / (b * b) - u0 * u0 * (1 - u0)));
  let y = [u0, du0];
  let psi = 0;
  const pts = [[x0, b]];
  const f = (_, [u, du]) => [du, -u + 1.5 * u * u];
  let captured = false;
  for (let i = 0; i < 200000; i++) {
    const h = step * Math.min(1, 0.25 / Math.max(y[0], 0.02));
    y = rk4(y, psi, h, f);
    psi += h;
    if (y[0] >= 1) { captured = true; pts.push([Math.cos(phi0 - psi), Math.sin(phi0 - psi)]); break; }
    if (y[0] <= 1 / maxR && y[1] < 0) break;
    const r = 1 / y[0];
    pts.push([r * Math.cos(phi0 - psi), r * Math.sin(phi0 - psi)]);
  }
  let deflection = null;
  if (!captured) {
    const [xa, ya] = pts[pts.length - 2], [xb, yb] = pts[pts.length - 1];
    deflection = -Math.atan2(yb - ya, xb - xa);   // downward turn, toward the hole
  }
  return { pts, captured, deflection, swept: psi };
}

// A bound orbit between periapsis rp and apoapsis ra (in r_s). Uses the exact
// Schwarzschild constants of motion and integrates
//   d²u/dφ² + u = 1/(2ℓ²) + (3/2) u²,
// returning samples of φ, r and the coordinate time t of a distant observer,
// over the given number of radial periods.
export function orbit(rp, ra, { orbits = 3, step = 0.002 } = {}) {
  const L2 = (1 / rp - 1 / ra) / ((1 - 1 / rp) / (rp * rp) - (1 - 1 / ra) / (ra * ra));
  const L = Math.sqrt(L2);
  const E = Math.sqrt((1 - 1 / rp) * (1 + L2 / (rp * rp)));
  const f = (_, [u, du]) => [du, -u + 1 / (2 * L2) + 1.5 * u * u];
  const dtdphi = (u) => (E / (1 - u)) / (L * u * u);    // dt/dτ · dτ/dφ
  let y = [1 / rp, 0];
  let phi = 0, t = 0, turns = 0;
  const samples = [{ phi, r: rp, t }];
  const periapses = [0];
  while (turns < 2 * orbits && samples.length < 2e6) {
    const next = rk4(y, phi, step, f);
    t += 0.5 * (dtdphi(y[0]) + dtdphi(next[0])) * step;
    // du/dφ changes sign at every turning point; + to − is a periapsis
    if (Math.sign(next[1]) !== Math.sign(y[1]) && y[1] !== 0) {
      turns++;
      if (y[1] > 0) periapses.push(phi + step * (y[1] / (y[1] - next[1])));
    }
    phi += step;
    y = next;
    samples.push({ phi, r: 1 / y[0], t });
  }
  return { samples, L, E, periapses };
}

// Weak-field perihelion advance per orbit: Δφ = 6πGM / (c² a (1 − e²)).
export const perihelionAdvance = (GM, a, e) => (6 * Math.PI * GM) / (C * C * a * (1 - e * e));

// Weak-field light deflection at closest approach R: δ = 4GM / (c² R).
export const lightDeflection = (GM, R) => (4 * GM) / (C * C * R);

// Accretion efficiency at the ISCO: 1 − E_ISCO.
export const efficiencySchwarzschild = 1 - (2 * Math.sqrt(2)) / 3;
export const efficiencyMaxKerr = 1 - 1 / Math.sqrt(3);

// Hawking temperature T = ħc³ / (8πGMk_B), in kelvin.
export const hawkingTemperature = (M) =>
  (1.054571817e-34 * C ** 3) / (8 * Math.PI * 6.6743e-11 * M * 1.380649e-23);

// ─── gravitational waves ─────────────────────────────────────────────────

export const chirpMass = (m1, m2) => (m1 * m2) ** 0.6 / (m1 + m2) ** 0.2;
export const MSUN_SECONDS = GM_SUN / C ** 3;   // GM☉/c³ ≈ 4.925 μs

// Leading-order (quadrupole) inspiral, with Mc in seconds (GMc/c³) and tau
// the time left before coalescence. Frequency is the wave's, twice the orbit's.
export const chirpFrequency = (tau, Mc) =>
  (1 / Math.PI) * (5 / 256) ** 0.375 * Mc ** -0.625 * tau ** -0.375;
export const chirpPhase = (tau, Mc) => -2 * (5 * Mc) ** -0.625 * tau ** 0.625;
export const timeToMerge = (f, Mc) => (5 / 256) * Mc ** (-5 / 3) * (Math.PI * f) ** (-8 / 3);

// Strain shape of a binary's wave at time t (s) with coalescence at tc:
// leading-order inspiral (amplitude ∝ f^(2/3)) up to fMax, then a damped
// ringdown at fRing. The merger itself is not modelled — it needs numerical
// relativity — so the two pieces are simply joined in phase.
export function chirpWave(t, { tc = 0, Mc = 30 * MSUN_SECONDS, fMax = 150, fRing = 250, tauRing = 0.004 } = {}) {
  const join = timeToMerge(fMax, Mc);     // inspiral hands over this long before tc
  const tau = tc - t;
  if (tau > join) {
    const f = chirpFrequency(tau, Mc);
    return { h: (f / fMax) ** (2 / 3) * Math.cos(chirpPhase(tau, Mc)), f };
  }
  // merger (sketched): frequency climbs linearly from fMax to fRing over the
  // same interval, amplitude swells a quarter; then the ringdown decays
  const s = join - tau;                    // time since the hand-over
  const sm = Math.min(s, join);
  const sweep = fMax * sm + (0.5 * (fRing - fMax) * sm * sm) / join + (s > join ? fRing * (s - join) : 0);
  const ph = chirpPhase(join, Mc) + 2 * Math.PI * sweep;
  const f = s < join ? fMax + (fRing - fMax) * (s / join) : fRing;
  const amp = s < join ? 1 + 0.25 * (s / join) : 1.25 * Math.exp(-(s - join) / tauRing);
  return { h: amp * Math.cos(ph), f };
}

// A ring of free particles in the plane of the page, a wave travelling into
// it: (x, y) → displaced position, amplitude h, phase ph. 'plus' stretches x
// while squeezing y; 'cross' does the same along the diagonals.
export function waveDisplace(x, y, h, ph, pol = 'plus') {
  const s = 0.5 * h * Math.cos(ph);
  if (pol === 'plus') return [x * (1 + s), y * (1 - s)];
  return [x + s * y, y + s * x];
}

// ─── cosmology (flat ΛCDM) ───────────────────────────────────────────────

// Planck 2018 (TT,TE,EE+lowE+lensing+BAO), radiation including neutrinos.
export const COSMO = { H0: 67.66, Om: 0.3111, OL: 0.6889, Or: 9.1e-5 };
const H0si = (H0) => (H0 * 1000) / MPC;

export function hubbleRate(a, p = COSMO) {
  return H0si(p.H0) * Math.sqrt(p.Or / a ** 4 + p.Om / a ** 3 + p.OL);
}

// Cosmic time at scale factor a (seconds), t = ∫ da / (a H). Substituting
// a = s² keeps the integrand smooth at the Big Bang.
export function ageAt(a, p = COSMO, n = 4000) {
  const smax = Math.sqrt(a);
  const g = (s) => { if (s === 0) return 0; const A = s * s; return (2 * s) / (A * hubbleRate(A, p)); };
  let sum = g(0) + g(smax);
  const h = smax / n;
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * g(i * h);
  return (sum * h) / 3;
}

// Scale factor at cosmic time t (seconds), by bisection.
export function scaleFactorAt(t, p = COSMO) {
  let lo = 1e-6, hi = 10;
  for (let i = 0; i < 80; i++) {
    const mid = Math.sqrt(lo * hi);
    if (ageAt(mid, p, 600) < t) lo = mid; else hi = mid;
  }
  return Math.sqrt(lo * hi);
}

// Deceleration parameter q(a): positive while expansion is slowing.
export function deceleration(a, p = COSMO) {
  const E2 = p.Or / a ** 4 + p.Om / a ** 3 + p.OL;
  return (p.Or / a ** 4 + 0.5 * p.Om / a ** 3 - p.OL) / E2;
}

// ─── gravitational lensing by a point mass (angles in Einstein radii) ─────

// The two images of a point source at angular offset beta.
export function lensImages(beta) {
  const r = Math.sqrt(beta * beta + 4);
  return [(beta + r) / 2, (beta - r) / 2];
}

// A ball thrown straight up at v0 and caught at launch height after 2v0/g,
// along the path h(t) = k·(v0·t − g·t²/2) between the same two events. Its
// clock gains on a ground clock Δτ = (1/c²)∫(g·h − v²/2) dt (weak field,
// slow motion), which works out to (2/3)(v0³/(g c²))(k − k²/2): largest for
// the free-fall path, k = 1, where it is v0³/(3 g c²).
export const thrownBallGain = (k, v0 = 10, g = 9.81) => (2 / 3) * (v0 ** 3 / (g * C * C)) * (k - (k * k) / 2);
