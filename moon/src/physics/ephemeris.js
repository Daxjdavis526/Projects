/* =============================================================================
   EPHEMERIS — where the Sun and the Earth actually are, from the Moon
   -----------------------------------------------------------------------------
   Pure maths, no DOM, no three.js.

   The Sun's direction is the only light in this simulation, and the Earth hangs
   in a fixed part of the sky that depends on where you landed. Both have to come
   from real celestial mechanics or none of it means anything, so:

     * Moon geocentric position from the truncated ELP-2000/82 series published
       in Meeus, *Astronomical Algorithms*, chapter 47 (60 + 60 periodic terms;
       roughly 10 arcseconds in longitude, 20 km in distance).
     * Sun from Meeus chapter 25 (0.01 degrees).
     * Nutation and the mean obliquity from Meeus chapter 22, then precession
       back to J2000 with the IAU 1976 angles.
     * The Moon's orientation from the IAU/WGCCRE rotation model, including all
       thirteen E-terms, which is what produces libration.

   The WGCCRE model is a close approximation of the Mean Earth / Polar Axis (ME)
   frame that LOLA, SLDEM2015 and LROC products use; the residual difference
   between it and the DE421 ME realisation is well under 0.03 degrees, far below
   anything you can see standing on the surface.

   Positions are topocentric: the vector from the observer standing on the
   surface, not from the Moon's centre. That matters for the Earth, which shifts
   by up to a quarter of a degree between the sub-Earth point and the limb.

   Validated against JPL Horizons in test/ephemeris.test.mjs.
   ========================================================================== */

import { R_MOON, R_EARTH, R_SUN, AU } from '../config.js';
import { DEG, RAD, v3, sub, norm, len, dot, cross, azEl, unitToLl,
         matMulVec, matMul, llToUnit } from './frames.js';

/* --- time ------------------------------------------------------------------ */

/** Julian Day from a JS timestamp (ms since the Unix epoch, UTC). */
export function jdFromUnixMs(ms) {
  return ms / 86400000 + 2440587.5;
}

export function unixMsFromJd(jd) {
  return (jd - 2440587.5) * 86400000;
}

/**
 * TT - UTC in seconds. Polynomial fits from Espenak & Meeus for the historical
 * range, held constant outside it. The whole term is worth about 0.01 degrees
 * of lunar motion, so it is included for tidiness rather than necessity.
 */
export function deltaT(jdUtc) {
  const y = 2000 + (jdUtc - 2451545.0) / 365.25;
  let dt;
  if (y < 1900) dt = 62.92 + 0.32217 * (y - 1900) + 0.005589 * (y - 1900) ** 2;
  else if (y < 1941) { const t = y - 1920; dt = 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3; }
  else if (y < 1961) { const t = y - 1950; dt = 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547; }
  else if (y < 1986) { const t = y - 1975; dt = 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
  else if (y < 2005) { const t = y - 2000; dt = 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3
                            + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  else if (y < 2050) { const t = y - 2000; dt = 62.92 + 0.32217 * t + 0.005589 * t * t; }
  else if (y < 2150) dt = -20 + 32 * ((y - 1820) / 100) ** 2 - 0.5628 * (2150 - y);
  else dt = -20 + 32 * ((y - 1820) / 100) ** 2;
  return dt;
}

/** Julian centuries of Terrestrial Time from J2000, given a UTC Julian Day. */
export function centuriesTT(jdUtc) {
  return (jdUtc + deltaT(jdUtc) / 86400 - 2451545.0) / 36525;
}

/* --- Meeus chapter 47: the Moon --------------------------------------------- */
/* Each row is D, M, M', F, then the sine coefficient for longitude (1e-6 deg)
   and the cosine coefficient for distance (1e-3 km). */
const LR = [
  [0,0,1,0,6288774,-20905355],[2,0,-1,0,1274027,-3699111],[2,0,0,0,658314,-2955968],
  [0,0,2,0,213618,-569925],[0,1,0,0,-185116,48888],[0,0,0,2,-114332,-3149],
  [2,0,-2,0,58793,246158],[2,-1,-1,0,57066,-152138],[2,0,1,0,53322,-170733],
  [2,-1,0,0,45758,-204586],[0,1,-1,0,-40923,-129620],[1,0,0,0,-34720,108743],
  [0,1,1,0,-30383,104755],[2,0,0,-2,15327,10321],[0,0,1,2,-12528,0],
  [0,0,1,-2,10980,79661],[4,0,-1,0,10675,-34782],[0,0,3,0,10034,-23210],
  [4,0,-2,0,8548,-21636],[2,1,-1,0,-7888,24208],[2,1,0,0,-6766,30824],
  [1,0,-1,0,-5163,-8379],[1,1,0,0,4987,-16675],[2,-1,1,0,4036,-12831],
  [2,0,2,0,3994,-10445],[4,0,0,0,3861,-11650],[2,0,-3,0,3665,14403],
  [0,1,-2,0,-2689,-7003],[2,0,-1,2,-2602,0],[2,-1,-2,0,2390,10056],
  [1,0,1,0,-2348,6322],[2,-2,0,0,2236,-9884],[0,1,2,0,-2120,5751],
  [0,2,0,0,-2069,0],[2,-2,-1,0,2048,-4950],[2,0,1,-2,-1773,4130],
  [2,0,0,2,-1595,0],[4,-1,-1,0,1215,-3958],[0,0,2,2,-1110,0],
  [3,0,-1,0,-892,3258],[2,1,1,0,-810,2616],[4,-1,-2,0,759,-1897],
  [0,2,-1,0,-713,-2117],[2,2,-1,0,-700,2354],[2,1,-2,0,691,0],
  [2,-1,0,-2,596,0],[4,0,1,0,549,-1423],[0,0,4,0,537,-1117],
  [4,-1,0,0,520,-1571],[1,0,-2,0,-487,-1739],[2,1,0,-2,-399,0],
  [0,0,2,-2,-381,-4421],[1,1,1,0,351,0],[3,0,-2,0,-340,0],
  [4,0,-3,0,330,0],[2,-1,2,0,327,0],[0,2,1,0,-323,1165],
  [1,1,-1,0,299,0],[2,0,3,0,294,0],[2,0,-1,-2,0,8752],
];
/* D, M, M', F, sine coefficient for latitude (1e-6 deg). */
const B = [
  [0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],
  [2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],
  [2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],
  [2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],
  [2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],
  [0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],
  [0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],
  [4,0,0,-1,1021],[4,0,-1,1,833],[0,0,1,-3,777],[4,0,-2,1,671],
  [2,0,0,-3,607],[2,0,2,-1,596],[2,-1,1,-1,491],[2,0,-2,1,-451],
  [0,0,3,-1,439],[2,0,2,1,422],[2,0,-3,-1,421],[2,1,-1,1,-366],
  [2,1,0,1,-351],[4,0,0,1,331],[2,-1,1,1,315],[2,-2,0,-1,302],
  [0,0,1,3,-283],[2,1,1,-1,-229],[1,1,0,-1,223],[1,1,0,1,223],
  [0,1,-2,-1,-220],[2,1,-1,-1,-220],[1,0,1,1,-185],[2,-1,-2,-1,181],
  [0,1,2,1,-177],[4,0,-2,-1,176],[4,-1,-1,-1,166],[1,0,1,-1,-164],
  [4,0,1,-1,132],[1,0,-1,-1,-119],[4,-1,0,-1,115],[2,-2,0,1,107],
];

const sinD = (d) => Math.sin(d * DEG);
const cosD = (d) => Math.cos(d * DEG);

/**
 * Geocentric position of the Moon: apparent ecliptic longitude and latitude of
 * date (degrees) and distance (metres).
 */
export function moonGeocentric(T) {
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
  const D  = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
  const M  = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
  const F  =  93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000;
  const A1 = 119.75 + 131.849 * T;
  const A2 =  53.09 + 479264.290 * T;
  const A3 = 313.45 + 481266.484 * T;
  const E  = 1 - 0.002516 * T - 0.0000074 * T * T;

  let sl = 0, sr = 0, sb = 0;
  for (const [d, m, mp, f, cl, cr] of LR) {
    const arg = d * D + m * M + mp * Mp + f * F;
    const e = m === 0 ? 1 : (Math.abs(m) === 1 ? E : E * E);
    sl += cl * e * sinD(arg);
    sr += cr * e * cosD(arg);
  }
  for (const [d, m, mp, f, cb] of B) {
    const arg = d * D + m * M + mp * Mp + f * F;
    const e = m === 0 ? 1 : (Math.abs(m) === 1 ? E : E * E);
    sb += cb * e * sinD(arg);
  }
  sl += 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2);
  sb += -2235 * sinD(Lp) + 382 * sinD(A3) + 175 * sinD(A1 - F) + 175 * sinD(A1 + F)
      + 127 * sinD(Lp - Mp) - 115 * sinD(Lp + Mp);

  return {
    lon: Lp + sl / 1e6,
    lat: sb / 1e6,
    dist: (385000.56 + sr / 1000) * 1000,   // metres
    args: { Lp, D, M, Mp, F },
  };
}

/** Geocentric apparent ecliptic longitude (deg) and distance (m) of the Sun. */
export function sunGeocentric(T) {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M  = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e  = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M)
           + (0.019993 - 0.000101 * T) * sinD(2 * M)
           + 0.000289 * sinD(3 * M);
  const trueLon = L0 + C, nu = M + C;
  const R = (1.000001018 * (1 - e * e)) / (1 + e * cosD(nu));
  const omega = 125.04 - 1934.136 * T;
  return { lon: trueLon - 0.00569 - 0.00478 * sinD(omega), lat: 0, dist: R * AU };
}

/** Nutation in longitude and obliquity (degrees), plus the true obliquity. */
export function nutationObliquity(T) {
  const omega = 125.04452 - 1934.136261 * T;
  const Ls = 280.4665 + 36000.7698 * T;
  const Lm = 218.3165 + 481267.8813 * T;
  const dPsi = (-17.20 * sinD(omega) - 1.32 * sinD(2 * Ls) - 0.23 * sinD(2 * Lm) + 0.21 * sinD(2 * omega)) / 3600;
  const dEps = (9.20 * cosD(omega) + 0.57 * cosD(2 * Ls) + 0.10 * cosD(2 * Lm) - 0.09 * cosD(2 * omega)) / 3600;
  const eps0 = 23 + 26 / 60 + 21.448 / 3600 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T ** 3) / 3600;
  return { dPsi, dEps, eps: eps0 + dEps };
}

/** Ecliptic (deg, deg, m) -> equatorial cartesian of date (m). */
function eclipticToEquatorial(lon, lat, dist, eps) {
  const sl = sinD(lon), cl = cosD(lon), sb = sinD(lat), cb = cosD(lat);
  const se = sinD(eps), ce = cosD(eps);
  return {
    x: dist * cb * cl,
    y: dist * (cb * sl * ce - sb * se),
    z: dist * (cb * sl * se + sb * ce),
  };
}

/**
 * Precession matrix taking equatorial coordinates of date back to J2000
 * (IAU 1976 angles, Meeus chapter 21).
 */
export function precessionToJ2000(T) {
  const s = 1 / 3600;
  const zeta  = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T ** 3) * s;
  const z     = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T ** 3) * s;
  const theta = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T ** 3) * s;
  const rz = (a) => { const c = cosD(a), s2 = sinD(a); return [c, -s2, 0, s2, c, 0, 0, 0, 1]; };
  const ry = (a) => { const c = cosD(a), s2 = sinD(a); return [c, 0, s2, 0, 1, 0, -s2, 0, c]; };
  // Meeus 21.3 composed this way already carries coordinates of date back to
  // J2000; transposing it would double the precession instead of removing it.
  return matMul(matMul(rz(-z), ry(theta)), rz(-zeta));
}

/* --- IAU/WGCCRE lunar rotation --------------------------------------------- */

/**
 * The matrix that takes an equatorial J2000 vector into the Moon's body-fixed
 * frame, plus the pole and prime meridian it was built from. The thirteen
 * E-terms are the physical and optical libration.
 */
export function moonOrientation(jdTT) {
  const d = jdTT - 2451545.0, T = d / 36525;
  const E = [
    125.045 - 0.0529921 * d, 250.089 - 0.1059842 * d, 260.008 + 13.0120009 * d,
    176.625 + 13.3407154 * d, 357.529 + 0.9856003 * d, 311.589 + 26.4057084 * d,
    134.963 + 13.0649930 * d, 276.617 + 0.3287146 * d, 34.226 + 1.7484877 * d,
    15.134 - 0.1589763 * d, 119.743 + 0.0036096 * d, 239.961 + 0.1643573 * d,
    25.053 + 12.9590088 * d,
  ];
  const S = E.map(sinD), C = E.map(cosD);
  const a0 = 269.9949 + 0.0031 * T
    - 3.8787 * S[0] - 0.1204 * S[1] + 0.0700 * S[2] - 0.0172 * S[3]
    + 0.0072 * S[5] - 0.0052 * S[9] + 0.0043 * S[12];
  const d0 = 66.5392 + 0.0130 * T
    + 1.5419 * C[0] + 0.0239 * C[1] - 0.0278 * C[2] + 0.0068 * C[3]
    - 0.0029 * C[5] + 0.0009 * C[6] + 0.0008 * C[9] - 0.0009 * C[12];
  const W = 38.3213 + 13.17635815 * d - 1.4e-12 * d * d
    + 3.5610 * S[0] + 0.1208 * S[1] - 0.0642 * S[2] + 0.0158 * S[3]
    + 0.0252 * S[4] - 0.0066 * S[5] - 0.0047 * S[6] - 0.0046 * S[7]
    + 0.0028 * S[8] + 0.0052 * S[9] + 0.0040 * S[10] + 0.0019 * S[11] - 0.0044 * S[12];

  const ca = cosD(a0), sa = sinD(a0), cd = cosD(d0), sd = sinD(d0);
  const zAxis = { x: cd * ca, y: cd * sa, z: sd };
  const node = { x: -sa, y: ca, z: 0 };              // ascending node on the ICRF equator
  const perp = cross(zAxis, node);
  const cw = cosD(W), sw = sinD(W);
  const xAxis = { x: node.x * cw + perp.x * sw, y: node.y * cw + perp.y * sw, z: node.z * cw + perp.z * sw };
  const yAxis = cross(zAxis, xAxis);
  return {
    a0, d0, W,
    bodyFromJ2000: [xAxis.x, xAxis.y, xAxis.z, yAxis.x, yAxis.y, yAxis.z, zAxis.x, zAxis.y, zAxis.z],
  };
}

/* --- the whole state -------------------------------------------------------- */

/**
 * Everything the renderer, the HUD and the physics need about the sky at one
 * instant. Directions are unit vectors in the Moon's body-fixed (ME) frame.
 *
 * @param {number} jdUtc  Julian Day, UTC
 */
export function ephemerisAt(jdUtc) {
  const T = centuriesTT(jdUtc);
  const jdTT = jdUtc + deltaT(jdUtc) / 86400;
  const { eps } = nutationObliquity(T);

  const m = moonGeocentric(T);
  const s = sunGeocentric(T);
  const moonEq = eclipticToEquatorial(m.lon, m.lat, m.dist, eps);
  const sunEq = eclipticToEquatorial(s.lon, s.lat, s.dist, eps);

  const P = precessionToJ2000(T);
  const moonJ2000 = matMulVec(P, moonEq);
  const sunJ2000 = matMulVec(P, sunEq);

  const orient = moonOrientation(jdTT);
  const M = orient.bodyFromJ2000;

  // Vectors from the Moon's centre, in the body frame.
  const earthFromMoon = matMulVec(M, { x: -moonJ2000.x, y: -moonJ2000.y, z: -moonJ2000.z });
  const sunFromMoon = matMulVec(M, sub(sunJ2000, moonJ2000));
  const earthDist = len(earthFromMoon), sunDist = len(sunFromMoon);

  // Earth's illuminated fraction as seen from the Moon: the phase angle is the
  // Sun-Earth-Moon angle, so a new Moon is a full Earth.
  const eToS = norm(sunJ2000), eToM = norm(moonJ2000);
  const phase = Math.acos(Math.max(-1, Math.min(1, dot(eToS, eToM))));
  const earthIllum = (1 + Math.cos(phase)) / 2;

  /* Earth's body-fixed frame, so the right continents face the Moon.

     Everything above is in the equatorial frame of date, precessed back to
     J2000, so in that frame Earth's rotation axis is simply the z axis, and the
     Greenwich meridian crosses the equator at a right ascension equal to
     Greenwich sidereal time. Rotating those two directions into the Moon's body
     frame gives a complete Earth-fixed basis, which is what the renderer needs
     to point the globe and what the sub-lunar point falls out of. */
  const gmst = greenwichMeanSiderealTime(jdUtc);
  const th = gmst * DEG;
  const toBody = (v) => norm(matMulVec(M, matMulVec(P, v)));
  const earthNorth = toBody({ x: 0, y: 0, z: 1 });
  const earthPrime = toBody({ x: Math.cos(th), y: Math.sin(th), z: 0 });
  const earthEast = norm(cross(earthNorth, earthPrime));     // longitude 90 E
  const earthAxis = earthNorth;

  /* The point on Earth directly beneath the Moon: geographic, positive east. */
  const toMoon = { x: -earthFromMoon.x / earthDist, y: -earthFromMoon.y / earthDist,
                   z: -earthFromMoon.z / earthDist };
  const earthSubLat = Math.asin(Math.max(-1, Math.min(1, dot(toMoon, earthNorth)))) * RAD;
  let earthSubLon = Math.atan2(dot(toMoon, earthEast), dot(toMoon, earthPrime)) * RAD;
  if (earthSubLon < 0) earthSubLon += 360;

  const subEarth = unitToLl(earthFromMoon.x / earthDist, earthFromMoon.y / earthDist, earthFromMoon.z / earthDist);
  const subSolar = unitToLl(sunFromMoon.x / sunDist, sunFromMoon.y / sunDist, sunFromMoon.z / sunDist);

  return {
    jdUtc, jdTT, T,
    sunDir: norm(sunFromMoon), sunDist,
    earthDir: norm(earthFromMoon), earthDist,
    sunFromMoon, earthFromMoon,
    sunAngularRadius: Math.asin(R_SUN / sunDist) * RAD,
    earthAngularRadius: Math.asin(R_EARTH / earthDist) * RAD,
    earthPhaseAngle: phase * RAD,
    earthIllum,
    earthAxis, earthNorth, earthPrime, earthEast, gmst,
    earthSubLat, earthSubLon,
    subEarth, subSolar,
    bodyFromJ2000: M,
    orientation: orient,
    moonGeocentricDist: m.dist,
  };
}

/** Greenwich mean sidereal time in degrees (Meeus 12.4). */
export function greenwichMeanSiderealTime(jdUtc) {
  const T = (jdUtc - 2451545.0) / 36525;
  let g = 280.46061837 + 360.98564736629 * (jdUtc - 2451545.0)
        + 0.000387933 * T * T - T ** 3 / 38710000;
  g %= 360;
  return g < 0 ? g + 360 : g;
}

/**
 * Topocentric sky for an observer standing on the surface.
 *
 * The Earth is only 384 000 km away and the Moon is 1737 km in radius, so an
 * observer at the limb sees the Earth up to a quarter of a degree away from
 * where the centre of the Moon would. Standing under the sub-Earth point it is
 * overhead; from the far side it never rises at all.
 */
export function skyAt(eph, latDeg, lonDeg, height = 0) {
  const obs = llToUnit(latDeg, lonDeg);
  const r = R_MOON + height;
  const op = { x: obs.x * r, y: obs.y * r, z: obs.z * r };

  const sunTopo = norm(sub(eph.sunFromMoon, op));
  const earthTopo = norm(sub(eph.earthFromMoon, op));
  const earthDist = len(sub(eph.earthFromMoon, op));

  const sun = azEl(latDeg, lonDeg, sunTopo);
  const earth = azEl(latDeg, lonDeg, earthTopo);
  return {
    sunDir: sunTopo, sunAz: sun.az, sunEl: sun.el,
    earthDir: earthTopo, earthAz: earth.az, earthEl: earth.el, earthDist,
    earthAngularRadius: Math.asin(R_EARTH / earthDist) * RAD,
    earthIllum: eph.earthIllum,
    /* Earth is visible from the near side and never from the far side; near the
       limb libration swings it above and below the horizon over a month. */
    earthVisible: earth.el > -eph.earthAngularRadius,
    /* Whether it will EVER be, which is a different question. The mean
       sub-Earth point is 0 N 0 E; optical libration in longitude and latitude
       together carry the true one about ten degrees away from it at the
       extreme. So ninety degrees from the mean point is the nominal limb, and
       only beyond a hundred is a place out of the Earth's reach for good.
       Between the two the Earth sits on the horizon and rises and sets over a
       month, which is what it does at the lunar south pole: Shackleton is
       90.2 degrees from the mean sub-Earth point and is emphatically not the
       far side. */
    farSide: Math.acos(Math.max(-1, Math.min(1,
      Math.cos(latDeg / RAD) * Math.cos(lonDeg / RAD)))) * RAD > 100,
  };
}

/**
 * Local solar time as a fraction of the lunar day, 0 = midnight, 0.5 = noon.
 * A lunar day is a synodic month, so "an hour after sunrise" is about 14 hours.
 */
export function localSolarTime(eph, latDeg, lonDeg) {
  let h = lonDeg - eph.subSolar.lon;
  h = ((h + 180) % 360 + 360) % 360 - 180;
  return ((h / 360) + 0.5 + 1) % 1;
}

/** Sub-solar latitude tells you the season; it never exceeds about 1.6 degrees. */
export function solarDeclination(eph) {
  return eph.subSolar.lat;
}
