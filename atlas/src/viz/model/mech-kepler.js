// Newtonian orbits of a small body around a much larger one, for the
// mech-kepler simulation and the PHYS 2210 gravitation lessons. DOM-free and
// tested headlessly (test/mech-kepler.test.mjs). SI units throughout.
//
// The large body sits at a focus of a conic, r(ν) = p / (1 + e cos ν), with
// p = h²/GM, h = |r × v| (angular momentum per kilogram) and ν the angle from
// the closest point (the true anomaly). Where the body is at a given time comes
// from Kepler's equation (ellipse), its hyperbolic twin, or Barker's equation
// (parabola). The central mass is held fixed: for the Moon the presets use
// G(M + m), which is what Kepler's third law really contains.

export const C = 299792458;                  // m/s, exact
export const G = 6.6743e-11;                 // m³ kg⁻¹ s⁻² (CODATA 2018 = 2022)
export const AU = 1.495978707e11;            // m, exact (IAU 2012)
export const DAY = 86400;                    // s
export const YEAR = 365.25 * DAY;            // s (Julian year)
export const GM_SUN = 1.32712440018e20;      // m³/s² (IAU 2015 nominal)
export const GM_EARTH = 3.986004418e14;      // m³/s² (WGS 84 / IERS)
export const GM_MOON = 4.9048695e12;         // m³/s²
export const R_EARTH = 6.371e6;              // m, mean radius
export const R_SUN = 6.957e8;                // m, IAU nominal
export const R_MOON = 1.7374e6;              // m
export const M_SGRA = 4.30e6;                // solar masses (GRAVITY 2019–2022 give 4.26–4.30 million)
const GM_SGRA = M_SGRA * GM_SUN;

/** Central bodies: GM, the radius drawn (for Sgr A*, its horizon 2GM/c²), and the names of the two apsides. */
export const BODIES = {
  earth: { name: 'Earth', GM: GM_EARTH, R: R_EARTH, peri: 'perigee', apo: 'apogee', unit: 'km', color: 'teal' },
  sun: { name: 'the Sun', GM: GM_SUN, R: R_SUN, peri: 'perihelion', apo: 'aphelion', unit: 'AU', color: 'gold' },
  sgra: { name: 'Sagittarius A*', GM: GM_SGRA, R: (2 * GM_SGRA) / C ** 2, peri: 'pericentre', apo: 'apocentre', unit: 'AU', color: 'ink', hole: true },
};

/**
 * Real orbits. Each gives its body and enough to fix the ellipse: a and e, or
 * rp and ra, or the period P and e (S2: its size then follows from Kepler's
 * third law with M = 4.30 million Suns). Data: ISS altitude ~420 km; GPS
 * semi-major axis 26 560 km; geostationary radius 42 164 km; a typical
 * geostationary transfer orbit, 250 km × 35 786 km altitude; the Moon
 * a = 384 400 km, e = 0.0549; Earth a = 1 AU, e = 0.0167; Mercury
 * a = 0.3871 AU, e = 0.2056; Halley a = 17.83 AU, e = 0.967; S2 P = 16.05 yr,
 * e = 0.885 (GRAVITY Collaboration 2018–2020).
 */
export const PRESETS = {
  iss: { body: 'earth', name: 'ISS', label: 'ISS', a: R_EARTH + 420e3, e: 0 },
  gps: { body: 'earth', name: 'GPS satellite', label: 'GPS', a: 26560e3, e: 0 },
  geo: { body: 'earth', name: 'geostationary satellite', label: 'Geostationary', a: 42164e3, e: 0 },
  gto: { body: 'earth', name: 'satellite on a transfer orbit', label: 'Transfer orbit', rp: R_EARTH + 250e3, ra: 42164e3 },
  moon: { body: 'earth', name: 'the Moon', label: 'Moon', a: 384400e3, e: 0.0549, GM: GM_EARTH + GM_MOON, R: R_MOON },
  earth: { body: 'sun', name: 'Earth', label: 'Earth', a: AU, e: 0.0167 },
  mercury: { body: 'sun', name: 'Mercury', label: 'Mercury', a: 0.38710 * AU, e: 0.2056 },
  halley: { body: 'sun', name: 'Halley’s comet', label: 'Halley’s comet', a: 17.83 * AU, e: 0.967 },
  s2: { body: 'sgra', name: 'the star S2', label: 'S2', P: 16.05 * YEAR, e: 0.885 },
};

// ─── simple orbits ─────────────────────────────────────────────────────────
/** Speed of a circular orbit of radius r: √(GM/r). */
export const vCircular = (GM, r) => Math.sqrt(GM / r);
/** Escape speed from radius r: √(2GM/r). */
export const vEscape = (GM, r) => Math.sqrt((2 * GM) / r);
/** Period of an orbit with semi-major axis a (Kepler's third law): 2π√(a³/GM). */
export const period = (GM, a) => 2 * Math.PI * Math.sqrt(a ** 3 / GM);
/** Semi-major axis for a period T: ∛(GM T²/4π²). */
export const axisForPeriod = (GM, T) => Math.cbrt((GM * T * T) / (4 * Math.PI * Math.PI));
/** Speed at distance r on an orbit of semi-major axis a (vis-viva): v² = GM(2/r − 1/a). */
export const visViva = (GM, r, a) => Math.sqrt(GM * (2 / r - 1 / a));

// ─── building an orbit ─────────────────────────────────────────────────────
/**
 * An orbit (any conic) from GM, its eccentricity e and periapsis distance rp.
 * Returns { GM, e, rp, p, h, kind, a, n, T, ra, energy }: a is the semi-major
 * axis (positive) for an ellipse and the semi-transverse axis (also positive)
 * for a hyperbola; n is the mean motion; T and ra exist only for ellipses.
 */
export function conic(GM, e, rp) {
  const p = rp * (1 + e), h = Math.sqrt(GM * p);
  const kind = Math.abs(e - 1) < 1e-9 ? 'parabola' : e < 1 ? 'ellipse' : 'hyperbola';
  const o = { GM, e, rp, p, h, kind, energy: kind === 'parabola' ? 0 : (-GM * (1 - e)) / (2 * rp) };
  if (kind === 'ellipse') { o.a = rp / (1 - e); o.ra = o.a * (1 + e); o.n = Math.sqrt(GM / o.a ** 3); o.T = (2 * Math.PI) / o.n; }
  if (kind === 'hyperbola') { o.a = rp / (e - 1); o.n = Math.sqrt(GM / o.a ** 3); }
  if (kind === 'parabola') o.n = Math.sqrt(GM / p ** 3);
  return o;
}

/** The orbit of a preset (see PRESETS), with its body. */
export function presetOrbit(key) {
  const s = PRESETS[key];
  if (!s) throw new Error(`unknown preset ${key}`);
  const body = BODIES[s.body], GM = s.GM ?? body.GM;
  let a = s.a, e = s.e;
  if (s.rp !== undefined) { a = (s.rp + s.ra) / 2; e = (s.ra - s.rp) / (s.ra + s.rp); }
  if (s.P !== undefined) a = axisForPeriod(GM, s.P);
  return { ...conic(GM, e, a * (1 - e)), body: s.body, preset: key, name: s.name, label: s.label, Rsat: s.R };
}

/**
 * A horizontal launch (velocity perpendicular to the radius) from distance r0
 * at speed v0: Newton's cannon. With k = v0/√(GM/r0), the orbit has e = |k² − 1|;
 * for k ≥ 1 the launch point is the periapsis, for k < 1 the apoapsis.
 * Returns the conic plus { r0, v0, k, launchNu, launchT } — the true anomaly
 * and the time since periapsis at launch.
 */
export function launchOrbit(GM, r0, v0) {
  const k2 = (r0 * v0 * v0) / GM, e = Math.abs(k2 - 1);
  const atPeri = k2 >= 1;
  const rp = atPeri ? r0 : r0 * (1 - e) / (1 + e);
  const o = conic(GM, e, rp);
  o.r0 = r0; o.v0 = v0; o.k = Math.sqrt(k2);
  o.launchNu = atPeri ? 0 : Math.PI;
  o.launchT = atPeri ? 0 : o.T / 2;
  return o;
}

// ─── where it is, and when ─────────────────────────────────────────────────
/** Solve Kepler's equation E − e sin E = M for the eccentric anomaly E (any M, 0 ≤ e < 1). */
export function solveKepler(M, e) {
  const TWO_PI = 2 * Math.PI;
  const k = Math.floor(M / TWO_PI), m = M - k * TWO_PI;          // m in [0, 2π)
  let E = e < 0.8 ? m : Math.PI;
  for (let i = 0; i < 60; i++) {
    const f = E - e * Math.sin(E) - m, d = 1 - e * Math.cos(E);
    const dE = f / d;
    E -= dE;
    if (Math.abs(dE) < 1e-14) break;
  }
  return E + k * TWO_PI;
}

/** Solve e sinh H − H = M for the hyperbolic anomaly H (e > 1). */
export function solveHyperbolic(M, e) {
  let H = Math.asinh(M / e);
  for (let i = 0; i < 80; i++) {
    const f = e * Math.sinh(H) - H - M, d = e * Math.cosh(H) - 1;
    const dH = f / d;
    H -= dH;
    if (Math.abs(dH) < 1e-14 * Math.max(1, Math.abs(H))) break;
  }
  return H;
}

/**
 * State at time t after periapsis, in the orbit's own frame (periapsis on +x,
 * motion anticlockwise): { x, y, vx, vy, r, v, nu }.
 */
export function stateAt(o, t) {
  const { e, GM } = o;
  if (o.kind === 'ellipse') {
    const E = solveKepler(o.n * t, e), a = o.a, b = Math.sqrt(1 - e * e);
    const cosE = Math.cos(E), sinE = Math.sin(E), den = 1 - e * cosE;
    const x = a * (cosE - e), y = a * b * sinE;
    const vx = (-a * o.n * sinE) / den, vy = (a * o.n * b * cosE) / den;
    return pack(x, y, vx, vy);
  }
  if (o.kind === 'hyperbola') {
    const H = solveHyperbolic(o.n * t, e), a = o.a, b = Math.sqrt(e * e - 1);
    const ch = Math.cosh(H), sh = Math.sinh(H), den = e * ch - 1;
    const x = a * (e - ch), y = a * b * sh;
    const vx = (-a * o.n * sh) / den, vy = (a * o.n * b * ch) / den;
    return pack(x, y, vx, vy);
  }
  // parabola: Barker's equation, D = tan(ν/2), D³ + 3D = 6 t √(GM/p³)
  const B = 3 * t * Math.sqrt(GM / o.p ** 3), Y = Math.cbrt(B + Math.sqrt(B * B + 1)), D = Y - 1 / Y;
  const dD = (2 * Math.sqrt(GM / o.p ** 3)) / (1 + D * D);
  return pack((o.p / 2) * (1 - D * D), o.p * D, -o.p * D * dD, o.p * dD);
}

function pack(x, y, vx, vy) {
  return { x, y, vx, vy, r: Math.hypot(x, y), v: Math.hypot(vx, vy), nu: Math.atan2(y, x) };
}

/** Distance from the focus at true anomaly ν. */
export const radiusAt = (o, nu) => o.p / (1 + o.e * Math.cos(nu));

/** Time after periapsis at true anomaly ν (ellipse: ν in [0, 2π) gives t in [0, T); open orbits: |ν| < the asymptote). */
export function timeAt(o, nu) {
  const e = o.e;
  if (o.kind === 'ellipse') {
    const TWO_PI = 2 * Math.PI, turns = Math.floor(nu / TWO_PI), w = nu - turns * TWO_PI;
    let E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(w / 2), Math.sqrt(1 + e) * Math.cos(w / 2));
    if (E < 0) E += TWO_PI;
    return (E - e * Math.sin(E)) / o.n + turns * o.T;
  }
  if (o.kind === 'hyperbola') {
    const H = 2 * Math.atanh(Math.sqrt((e - 1) / (e + 1)) * Math.tan(nu / 2));
    return (e * Math.sinh(H) - H) / o.n;
  }
  const D = Math.tan(nu / 2);
  return 0.5 * Math.sqrt(o.p ** 3 / o.GM) * (D + (D * D * D) / 3);
}

/**
 * Where a falling path meets a sphere of radius R: the true anomaly at impact,
 * moving forward from the launch (ν from launchNu up to the next periapsis), or
 * null if the orbit never comes that close.
 */
export function impactNu(o, R) {
  if (o.rp >= R) return null;
  const c = (o.p / R - 1) / o.e;
  if (c > 1 || c < -1) return null;
  return 2 * Math.PI - Math.acos(c);
}

/** Area swept by the radius from the focus between times t1 and t2 (Kepler's second law says h(t2 − t1)/2). */
export function sweptArea(o, t1, t2, steps = 2000) {
  let A = 0, prev = stateAt(o, t1);
  for (let i = 1; i <= steps; i++) {
    const s = stateAt(o, t1 + ((t2 - t1) * i) / steps);
    A += 0.5 * (prev.x * s.y - prev.y * s.x);          // triangle focus–prev–s
    prev = s;
  }
  return A;
}
