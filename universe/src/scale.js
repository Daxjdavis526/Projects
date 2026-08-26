/* ============================================================================
   scale.js — units, formatting, coordinate frames, and the scale machinery
   ----------------------------------------------------------------------------
   Everything in the app is positioned in UNIVERSE COORDINATES: heliocentric,
   J2000-ecliptic-oriented, in METERS, stored in JS doubles.  The observable
   universe radius is ~4.4e26 m, comfortably inside double precision.

   Render mapping (done per frame, per object / per vertex):
     rel  = (p - focus) / S          S = camera distance (m)  -> focus is O(1)
     L    = |rel|
     L'   = L                        if L <= R_MAX
          = R_MAX * (1 + log10(L / R_MAX))   otherwise      ("sky compression")
     p'   = rel * (L'/L),  object scale *= L'/L
   Direction and angular size are preserved EXACTLY, so the compressed far
   field is visually identical to a literal rendering — it only tames the
   numeric range so float32 GPUs and the depth buffer stay happy.
   ========================================================================== */

// ---------------------------------------------------------------- units (m)
export const KM  = 1e3;
export const AU  = 1.495978707e11;
export const LY  = 9.4607304726e15;
export const PC  = 3.0856775815e16;
export const KPC = 1e3 * PC;
export const MPC = 1e6 * PC;
export const GPC = 1e9 * PC;
export const R_UNIVERSE = 4.40e26;            // comoving radius, ~46.5 Gly

// ------------------------------------------------------- render compression
export const R_MAX = 1.0e4;                   // render units before compression

export function compressLen(L) {
  return L <= R_MAX ? L : R_MAX * (1 + Math.log10(L / R_MAX));
}

// Same function for the GPU (per-vertex, used by all big point layers).
export const GLSL_COMPRESS = /* glsl */`
  const float R_MAX_C = 1.0e4;
  vec3 compressPos(vec3 rel, out float shrink) {
    float L = length(rel);
    shrink = 1.0;
    if (L > R_MAX_C) {
      float Lc = R_MAX_C * (1.0 + log2(L / R_MAX_C) * 0.30102999566);
      shrink = Lc / L;
      rel *= shrink;
    }
    return rel;
  }
`;

// ------------------------------------------------------------- formatting
const UNITS = [
  { max: 1e7 * 1e3,      div: KM,   suf: ' km'  },
  { max: 0.2 * LY,       div: AU,   suf: ' AU'  },
  { max: 900 * LY,       div: LY,   suf: ' ly'  },
  { max: 900e3 * LY,     div: KPC,  suf: ' kpc' },
  { max: 900e6 * LY,     div: MPC,  suf: ' Mpc' },
  { max: Infinity,       div: GPC,  suf: ' Gpc' },
];

export function fmtLen(m, digits) {
  if (!(m > 0)) return '0 km';
  for (const u of UNITS) {
    if (m < u.max) {
      const v = m / u.div;
      const d = digits !== undefined ? digits : (v >= 100 ? 0 : v >= 10 ? 1 : 2);
      return v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 }) + u.suf;
    }
  }
}

// "nice" round value <= x, of the form {1,2,5}*10^n — for the scale ruler
export function niceFloor(x) {
  const e = Math.floor(Math.log10(x));
  const b = x / 10 ** e;
  const n = b >= 5 ? 5 : b >= 2 ? 2 : 1;
  return n * 10 ** e;
}

export function fmtYears(y) {
  if (y < 1e6) return (y / 1e3).toFixed(0) + ' thousand years';
  if (y < 1e9) return (y / 1e6).toPrecision(3) + ' million years';
  return (y / 1e9).toPrecision(3) + ' billion years';
}

// ------------------------------------------------------- seeded randomness
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function gauss(rnd) {         // Box–Muller
  const u = Math.max(rnd(), 1e-12), v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------------------------------------------------- coordinate transforms
// Math frames are right-handed z-up; the render frame is three.js y-up.
// mathToRender: (x, y, z) -> (x, z, -y)
const DEG = Math.PI / 180;

function matMul(A, B) {
  const C = [[0,0,0],[0,0,0],[0,0,0]];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
    C[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + A[i][2]*B[2][j];
  return C;
}
function matVec(A, v) {
  return [
    A[0][0]*v[0] + A[0][1]*v[1] + A[0][2]*v[2],
    A[1][0]*v[0] + A[1][1]*v[1] + A[1][2]*v[2],
    A[2][0]*v[0] + A[2][1]*v[1] + A[2][2]*v[2],
  ];
}
function transpose(A) {
  return [[A[0][0],A[1][0],A[2][0]],[A[0][1],A[1][1],A[2][1]],[A[0][2],A[1][2],A[2][2]]];
}

// Equatorial (J2000) -> ecliptic: rotation about x by +obliquity
const EPS = 23.4392911 * DEG;
const EQ2ECL = [
  [1, 0, 0],
  [0,  Math.cos(EPS), Math.sin(EPS)],
  [0, -Math.sin(EPS), Math.cos(EPS)],
];

// Galactic -> equatorial (J2000), standard IAU matrix (transpose of eq->gal)
const GAL2EQ = transpose([
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [ 0.4941094279, -0.4448296300,  0.7469822445],
  [-0.8676661490, -0.1980763734,  0.4559837762],
]);
const GAL2ECL = matMul(EQ2ECL, GAL2EQ);

// Supergalactic -> galactic (de Vaucouleurs): SG north pole at l=47.37 b=+6.32,
// SG longitude origin toward l=137.37 b=0.
const SG2GAL = (() => {
  const lp = 47.37 * DEG, bp = 6.32 * DEG, l0 = 137.37 * DEG;
  const zg = [Math.cos(bp)*Math.cos(lp), Math.cos(bp)*Math.sin(lp), Math.sin(bp)];
  const xg = [Math.cos(l0), Math.sin(l0), 0];
  // orthonormalize x against z, y = z cross x
  const d = xg[0]*zg[0] + xg[1]*zg[1] + xg[2]*zg[2];
  const x = [xg[0]-d*zg[0], xg[1]-d*zg[1], xg[2]-d*zg[2]];
  const xl = Math.hypot(...x); x[0]/=xl; x[1]/=xl; x[2]/=xl;
  const y = [zg[1]*x[2]-zg[2]*x[1], zg[2]*x[0]-zg[0]*x[2], zg[0]*x[1]-zg[1]*x[0]];
  return [[x[0],y[0],zg[0]],[x[1],y[1],zg[1]],[x[2],y[2],zg[2]]];
})();
const SG2ECL = matMul(GAL2ECL, SG2GAL);

function sph(lonDeg, latDeg, r) {
  const l = lonDeg * DEG, b = latDeg * DEG;
  return [r*Math.cos(b)*Math.cos(l), r*Math.cos(b)*Math.sin(l), r*Math.sin(b)];
}
const toRender = v => [v[0], v[2], -v[1]];

/** RA/dec (deg, J2000) + distance (m) -> render-frame heliocentric [x,y,z] m */
export function radecToXYZ(raDeg, decDeg, dist) {
  return toRender(matVec(EQ2ECL, sph(raDeg, decDeg, dist)));
}
/** Galactic l/b (deg) + distance (m) -> render-frame heliocentric [x,y,z] m */
export function galToXYZ(l, b, dist) {
  return toRender(matVec(GAL2ECL, sph(l, b, dist)));
}
/** Supergalactic SGL/SGB (deg) + distance (m) -> render frame [x,y,z] m */
export function sgToXYZ(sgl, sgb, dist) {
  return toRender(matVec(SG2ECL, sph(sgl, sgb, dist)));
}
/** Unit vector (render frame) toward the galactic center */
export const GC_DIR = (() => { const v = galToXYZ(0, 0, 1); return v; })();
/** Rotation basis for the galactic plane in the render frame:
    returns {x,y,z} unit axes where z = galactic north, x = toward l=0 */
export function galacticBasis() {
  const x = galToXYZ(0, 0, 1);
  const y = galToXYZ(90, 0, 1);
  const z = galToXYZ(0, 90, 1);
  return { x, y, z };
}
export function sgBasis() {
  const x = sgToXYZ(0, 0, 1);
  const y = sgToXYZ(90, 0, 1);
  const z = sgToXYZ(0, 90, 1);
  return { x, y, z };
}

// --------------------------------------------------------------- misc math
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** 0..1 fade for a layer band in log10-scale space, with soft edges */
export function bandFade(logS, lo, hi, edge = 0.5) {
  return smoothstep(lo - edge, lo, logS) * (1 - smoothstep(hi, hi + edge, logS));
}
