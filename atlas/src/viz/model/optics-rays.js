// Ray optics, DOM-free: the physics behind sims/optics-rays.js, tested
// headlessly in test/optics-rays.test.mjs.
//
//   materials    refractive index against wavelength from Sellmeier formulas
//                (catalogue coefficients: Schott BK7, F2 and SF11 glasses,
//                Malitson's fused silica and sapphire, Daimon & Masumura's
//                water at 20 °C, diamond, MgF₂)
//   interfaces   Snell's law, the critical angle, Brewster's angle and the
//                Fresnel reflectances for s and p light; vector reflection
//                and refraction
//   tracing      exact rays through scenes made of straight and circular
//                boundaries (prisms, slabs, fibres, single spherical surfaces)
//   paraxial     thin lenses and spherical mirrors (1/d_o + 1/d_i = 1/f), a
//                single spherical surface, the lensmaker's formula, systems of
//                thin lenses traced ray by ray, prisms and apparent depth
//
// Sign conventions (the usual introductory ones): a real object has d_o > 0;
// a real image has d_i > 0 (beyond a lens, in front of a mirror); f > 0 for a
// converging lens or a concave mirror; m = −d_i/d_o, negative when inverted.

export const DEG = Math.PI / 180;

// ─── materials ─────────────────────────────────────────────────────────────
// n² = 1 + Σ Bᵢλ²/(λ² − Cᵢ), λ in micrometres.
const SELL = {
  crown: { B: [1.03961212, 0.231792344, 1.01046945], C: [0.00600069867, 0.0200179144, 103.560653] },
  flint: { B: [1.34533359, 0.209073176, 0.937357162], C: [0.00997743871, 0.0470450767, 111.886764] },
  denseflint: { B: [1.73759695, 0.313747346, 1.89878101], C: [0.013188707, 0.0623068142, 155.23629] },
  silica: { B: [0.6961663, 0.4079426, 0.8974794], C: [0.0684043 ** 2, 0.1162414 ** 2, 9.896161 ** 2] },
  water: { B: [5.684027565e-1, 1.726177391e-1, 2.086189578e-2, 1.130748688e-1], C: [5.101829712e-3, 1.821153936e-2, 2.620722293e-2, 1.069792721e1] },
  diamond: { B: [0.3306, 4.3356], C: [0.1750 ** 2, 0.1060 ** 2] },
  sapphire: { B: [1.4313493, 0.65054713, 5.3414021], C: [0.0726631 ** 2, 0.1193242 ** 2, 18.028251 ** 2] },
  mgf2: { B: [0.48755108, 0.39875031, 2.3120353], C: [0.04338408 ** 2, 0.09461442 ** 2, 23.793604 ** 2] },
};

/** Materials by key: a display name and a short one. Air is taken as exactly 1 (really 1.0003). */
export const MATERIALS = {
  air: { name: 'air', short: 'air' },
  water: { name: 'water', short: 'water' },
  crown: { name: 'crown glass (BK7)', short: 'crown glass' },
  flint: { name: 'flint glass (F2)', short: 'flint glass' },
  denseflint: { name: 'dense flint glass (SF11)', short: 'dense flint' },
  silica: { name: 'fused silica', short: 'fused silica' },
  diamond: { name: 'diamond', short: 'diamond' },
  sapphire: { name: 'sapphire', short: 'sapphire' },
  mgf2: { name: 'magnesium fluoride', short: 'MgF₂' },
};

/** Refractive index of a material at a vacuum wavelength in nm (default: the sodium D line, 589.3 nm). */
export function indexOf(mat, lambdaNm = 589.3) {
  if (mat === 'air' || mat === 'vacuum') return 1;
  const s = SELL[mat];
  if (!s) throw new Error(`unknown material ${mat}`);
  const u2 = (lambdaNm / 1000) ** 2;
  let n2 = 1;
  for (let i = 0; i < s.B.length; i++) n2 += (s.B[i] * u2) / (u2 - s.C[i]);
  return Math.sqrt(n2);
}

/** Abbe number V = (n_d − 1)/(n_F − n_C): large means little dispersion. */
export function abbe(mat) {
  return (indexOf(mat, 587.56) - 1) / (indexOf(mat, 486.13) - indexOf(mat, 656.27));
}

/** Speed of light in a medium of index n, m/s. */
export const C_LIGHT = 299792458;
export const speedIn = (n) => C_LIGHT / n;

// ─── one interface ─────────────────────────────────────────────────────────

/** Refraction angle (rad) from n₁ sin θ₁ = n₂ sin θ₂, or NaN beyond the critical angle. */
export function snell(n1, n2, th1) {
  const s = (n1 * Math.sin(th1)) / n2;
  return Math.abs(s) > 1 ? NaN : Math.asin(s);
}

/** The critical angle (rad) going from n₁ into n₂, or NaN when n₁ ≤ n₂ (no total internal reflection). */
export function criticalAngle(n1, n2) {
  return n1 > n2 ? Math.asin(n2 / n1) : NaN;
}

/** Brewster's angle (rad): reflected light is purely s-polarized, tan θ_B = n₂/n₁. */
export const brewster = (n1, n2) => Math.atan(n2 / n1);

/**
 * Fresnel coefficients at a plane interface for incidence angle θ₁ (rad).
 * Amplitudes r, t (Hecht's sign convention for p) and power fractions R, T
 * for s (E perpendicular to the plane of incidence) and p (E in it); R and T
 * are their averages, for unpolarized light. Beyond the critical angle the
 * reflection is total: R = 1, T = 0.
 */
export function fresnel(n1, n2, th1) {
  const s2 = (n1 * Math.sin(th1)) / n2;
  if (Math.abs(s2) >= 1) return { rs: 1, rp: 1, ts: 0, tp: 0, Rs: 1, Rp: 1, R: 1, Ts: 0, Tp: 0, T: 0, tir: true };
  const c1 = Math.cos(th1), c2 = Math.sqrt(1 - s2 * s2);
  const rs = (n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2);
  const rp = (n2 * c1 - n1 * c2) / (n2 * c1 + n1 * c2);
  const ts = (2 * n1 * c1) / (n1 * c1 + n2 * c2);
  const tp = (2 * n1 * c1) / (n2 * c1 + n1 * c2);
  const k = (n2 * c2) / (n1 * c1);
  const Rs = rs * rs, Rp = rp * rp, Ts = k * ts * ts, Tp = k * tp * tp;
  return { rs, rp, ts, tp, Rs, Rp, R: (Rs + Rp) / 2, Ts, Tp, T: (Ts + Tp) / 2, tir: false };
}

/** Reflectance for a polarization: 's', 'p' or 'u' (unpolarized). */
export function reflectance(n1, n2, th1, pol = 'u') {
  const f = fresnel(n1, n2, th1);
  return pol === 's' ? f.Rs : pol === 'p' ? f.Rp : f.R;
}

// ─── vectors ───────────────────────────────────────────────────────────────
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const norm = (a) => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; };

/** Mirror a direction d in a surface with unit normal nrm. */
export function reflectDir(d, nrm) {
  const k = 2 * dot(d, nrm);
  return [d[0] - k * nrm[0], d[1] - k * nrm[1]];
}

/** Refract a unit direction d at a surface with unit normal nrm (either side), from n₁ into n₂; null on total internal reflection. */
export function refractDir(d, nrm, n1, n2) {
  let n = nrm, cosi = -dot(d, n);
  if (cosi < 0) { n = [-n[0], -n[1]]; cosi = -cosi; }
  const eta = n1 / n2, k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return null;
  const a = eta * cosi - Math.sqrt(k);
  return norm([eta * d[0] + a * n[0], eta * d[1] + a * n[1]]);
}

// ─── exact tracing through a scene ─────────────────────────────────────────
// A scene is { boundaries, indexAt(x, y) }. A boundary is a segment
// { a: [x, y], b: [x, y] } or a circular arc { c: [x, y], r, ok(x, y) } where
// ok says whether a point of the full circle belongs to the arc. indexAt gives
// the refractive index at a point not on a boundary.

const EPS = 1e-9;

function hitSegment(o, d, s) {
  const ex = s.b[0] - s.a[0], ey = s.b[1] - s.a[1];
  const den = d[0] * ey - d[1] * ex;
  if (Math.abs(den) < 1e-14) return null;
  const wx = s.a[0] - o[0], wy = s.a[1] - o[1];
  const t = (wx * ey - wy * ex) / den, u = (wx * d[1] - wy * d[0]) / den;
  if (t <= EPS || u < -1e-12 || u > 1 + 1e-12) return null;
  const nrm = norm([ey, -ex]);
  return { t, p: [o[0] + t * d[0], o[1] + t * d[1]], nrm };
}

function hitArc(o, d, s) {
  const fx = o[0] - s.c[0], fy = o[1] - s.c[1];
  const b = fx * d[0] + fy * d[1], c = fx * fx + fy * fy - s.r * s.r;
  const disc = b * b - c;
  if (disc < 0) return null;
  const q = Math.sqrt(disc);
  for (const t of [-b - q, -b + q]) {
    if (t <= EPS) continue;
    const p = [o[0] + t * d[0], o[1] + t * d[1]];
    if (s.ok && !s.ok(p[0], p[1])) continue;
    return { t, p, nrm: norm([p[0] - s.c[0], p[1] - s.c[1]]) };
  }
  return null;
}

/** The nearest boundary a ray from o along unit d meets, or null. */
export function firstHit(scene, o, d) {
  let best = null;
  for (const s of scene.boundaries) {
    const h = s.c ? hitArc(o, d, s) : hitSegment(o, d, s);
    if (h && (!best || h.t < best.t)) best = { ...h, boundary: s };
  }
  return best;
}

/**
 * Follow one ray through a scene. At each boundary it refracts, or reflects
 * totally when it cannot refract; partial reflections are not followed (their
 * power is reported). Returns { points, legs, end } where legs are
 * [{ a, b, n, power }] and power is the fraction left after the Fresnel
 * losses (unpolarized light).
 */
export function trace(scene, o, d, { maxHits = 16, length = 1e3 } = {}) {
  let p = o, dir = norm(d), power = 1;
  const points = [p], legs = [];
  for (let k = 0; k <= maxHits; k++) {
    const n1 = scene.indexAt(p[0] + dir[0] * 1e-6, p[1] + dir[1] * 1e-6);
    const h = k < maxHits ? firstHit(scene, p, dir) : null;
    if (!h) {
      const q = [p[0] + dir[0] * length, p[1] + dir[1] * length];
      legs.push({ a: p, b: q, n: n1, power, open: true });
      points.push(q);
      return { points, legs, end: { p: q, dir, power } };
    }
    legs.push({ a: p, b: h.p, n: n1, power });
    points.push(h.p);
    const n2 = scene.indexAt(h.p[0] + dir[0] * 1e-6, h.p[1] + dir[1] * 1e-6);
    const cosi = Math.abs(dot(dir, h.nrm));
    const out = Math.abs(n1 - n2) < 1e-12 ? dir : refractDir(dir, h.nrm, n1, n2);
    if (out) { power *= 1 - fresnel(n1, n2, Math.acos(Math.min(1, cosi))).R; dir = out; }
    else dir = norm(reflectDir(dir, h.nrm));
    p = h.p;
  }
  return { points, legs, end: { p, dir, power } };
}

/** A convex polygon scene: index n inside the polygon [[x, y], …] (either winding), n0 outside. */
export function polygonScene(verts, n, n0 = 1) {
  const boundaries = verts.map((a, i) => ({ a, b: verts[(i + 1) % verts.length] }));
  const inside = (x, y) => {
    let sgn = 0;
    for (let i = 0; i < verts.length; i++) {
      const a = verts[i], b = verts[(i + 1) % verts.length];
      const c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
      if (Math.abs(c) < 1e-15) continue;
      const s = Math.sign(c);
      if (sgn && s !== sgn) return false;
      sgn = s;
    }
    return true;
  };
  return { boundaries, indexAt: (x, y) => (inside(x, y) ? n : n0), inside };
}

/** An isosceles prism with apex angle A (rad), apex at (0, h), base on y = 0 of half-width h·tan(A/2). */
export function prismVerts(A, h = 1) {
  const w = h * Math.tan(A / 2);
  return [[-w, 0], [w, 0], [0, h]];
}

/**
 * A single spherical refracting surface: vertex at the origin, axis along x,
 * radius R (R > 0: centre on the right, the surface bulging toward the left;
 * R = ±Infinity: flat). Index n1 to the left, n2 to the right; the surface
 * is cut off at heights |y| ≤ aperture.
 */
export function surfaceScene(R, n1, n2, aperture) {
  const flat = !Number.isFinite(R);
  const xs = (y) => (flat ? 0 : R - Math.sign(R) * Math.sqrt(Math.max(0, R * R - y * y)));
  const boundaries = flat ? [{ a: [0, -aperture], b: [0, aperture] }]
    : [{ c: [R, 0], r: Math.abs(R), ok: (x, y) => Math.abs(y) <= aperture && Math.sign(x - R) === -Math.sign(R) }];
  return { boundaries, indexAt: (x, y) => (Math.abs(y) > aperture ? n1 : x < xs(y) ? n1 : n2), xs };
}

/** A slab waveguide (a fibre in cross-section): core |y| < a from x = 0 to L, cladding a < |y| < b, air elsewhere. */
export function fibreScene({ nCore, nClad, a, b, L }) {
  const boundaries = [
    { a: [0, -b], b: [0, b] },                                     // the end face
    { a: [0, a], b: [L, a] }, { a: [0, -a], b: [L, -a] },        // core–cladding
    { a: [0, b], b: [L, b] }, { a: [0, -b], b: [L, -b] },        // cladding–air
    { a: [L, -b], b: [L, b] },                                     // the far end
  ];
  const indexAt = (x, y) => (x < 0 || x > L || Math.abs(y) > b ? 1 : Math.abs(y) < a ? nCore : nClad);
  return { boundaries, indexAt };
}

// ─── fibres ────────────────────────────────────────────────────────────────

/** Numerical aperture √(n_core² − n_clad²) and the largest launch angle from a medium of index n0 (rad; π/2 when NA ≥ n0). */
export function fibreAcceptance(nCore, nClad, n0 = 1) {
  const NA = Math.sqrt(Math.max(0, nCore * nCore - nClad * nClad));
  return { NA, thetaMax: NA >= n0 ? Math.PI / 2 : Math.asin(NA / n0), critical: criticalAngle(nCore, nClad) };
}

// ─── prisms ────────────────────────────────────────────────────────────────

/**
 * A ray through a prism of apex angle A (rad) and index n (surrounded by n0),
 * entering at θ₁ to the first face's normal, measured toward the base as
 * positive. Returns the angles inside (θ₂ at face 1, θ₃ at face 2), the exit
 * angle θ₄ and the deviation δ = θ₁ + θ₄ − A, or tir: true when the ray
 * cannot leave through the second face.
 */
export function prism(A, n, th1, n0 = 1) {
  const th2 = snell(n0, n, th1);
  const th3 = A - th2;
  const th4 = snell(n, n0, th3);
  if (Number.isNaN(th4)) return { th2, th3, th4: NaN, delta: NaN, tir: true };
  return { th2, th3, th4, delta: th1 + th4 - A, tir: false };
}

/** Minimum deviation of a prism: δ_min = 2 asin(n sin(A/2)) − A (the symmetric passage). */
export const minDeviation = (A, n, n0 = 1) => 2 * Math.asin(Math.min(1, ((n / n0) * Math.sin(A / 2)))) - A;

// ─── paraxial imaging ──────────────────────────────────────────────────────

/**
 * The thin-lens (and spherical-mirror) equation 1/d_o + 1/d_i = 1/f with
 * m = −d_i/d_o. d_o = Infinity is an object at infinity (image at the focal
 * point); d_o = f gives an image at infinity.
 */
export function thinLens(f, dO) {
  if (!Number.isFinite(dO)) return { dI: f, m: 0, real: f > 0 };
  const den = dO - f;
  if (Math.abs(den) < 1e-12 * Math.max(1, Math.abs(f))) return { dI: Infinity, m: Infinity, real: false };
  const dI = (dO * f) / den;
  return { dI, m: -dI / dO, real: dI > 0 };
}
export const mirrorImage = thinLens;

/** Focal length of a spherical mirror of radius of curvature R: f = R/2 (concave R > 0). */
export const mirrorFocal = (R) => R / 2;

/** Lensmaker's formula 1/f = (n/n_m − 1)(1/R₁ − 1/R₂): R > 0 when the centre lies beyond the surface. */
export function lensmaker(n, R1, R2, nm = 1) {
  const inv = (n / nm - 1) * ((Number.isFinite(R1) ? 1 / R1 : 0) - (Number.isFinite(R2) ? 1 / R2 : 0));
  return inv === 0 ? Infinity : 1 / inv;
}

/** Lens power in dioptres (m⁻¹) from f in metres. */
export const power = (fMetres) => 1 / fMetres;

/** A single spherical surface, paraxial: n₁/d_o + n₂/d_i = (n₂ − n₁)/R, m = −n₁d_i/(n₂d_o). Flat: R = Infinity. */
export function surfaceImage(n1, n2, R, dO) {
  const P = Number.isFinite(R) ? (n2 - n1) / R : 0;
  const rhs = P - n1 / dO;
  if (Math.abs(rhs) < 1e-15) return { dI: Infinity, m: Infinity };
  const dI = n2 / rhs;
  return { dI, m: -(n1 * dI) / (n2 * dO) };
}

/** Apparent depth looking straight down (paraxial): d′ = d·n_observer/n_object. */
export const apparentDepth = (d, nObj, nObs = 1) => (d * nObs) / nObj;

/**
 * Where an object at depth d below a flat surface appears to an eye looking
 * along a pencil of rays that leaves the surface at angle β (rad) from the
 * vertical: the meeting point of the backward extensions of neighbouring
 * rays (the tangential image). Returns { x, y } with the object at (0, −d),
 * the surface y = 0 and the eye on the +x side; and the ray's surface point.
 */
export function apparentPoint(d, nObj, nObs, beta) {
  const alphaOf = (b) => Math.asin((nObs * Math.sin(b)) / nObj);
  const line = (b) => { const a = alphaOf(b); return { x0: d * Math.tan(a), dir: [Math.sin(b), Math.cos(b)] }; };
  const h = 1e-5;
  const L1 = line(beta - h), L2 = line(beta + h);
  // backward extensions: (x0, 0) − t·dir; solve L1(t1) = L2(t2)
  const ax = -L1.dir[0], ay = -L1.dir[1], bx = -L2.dir[0], by = -L2.dir[1];
  const den = ax * by - ay * bx;
  const t1 = ((L2.x0 - L1.x0) * by) / den;
  const L0 = line(beta);
  return { x: L1.x0 + t1 * ax, y: t1 * ay, surface: L0.x0, alpha: alphaOf(beta) };
}

/**
 * Trace a paraxial ray through thin lenses (or unfolded mirrors) at positions
 * x with focal lengths f: { x, f }[] sorted along the axis. The ray starts at
 * (x0, y0) with slope s. Returns the points where it meets each element and
 * its final slope: a ray at height y leaves a lens with slope s − y/f.
 */
export function paraxialTrace(elements, x0, y0, s) {
  let x = x0, y = y0, slope = s;
  const pts = [[x, y]];
  for (const e of elements) {
    if (e.x < x) continue;
    y += slope * (e.x - x); x = e.x;
    pts.push([x, y]);
    if (Number.isFinite(e.f)) slope -= y / e.f;
  }
  return { pts, slope, x, y };
}

/**
 * Two thin lenses: f₁ at x = 0, f₂ at x = sep. Object d_o before the first
 * (Infinity: a star). Images in turn — the first image is the second lens's
 * object, virtual (negative distance) when it lies beyond the second lens.
 */
export function twoLens(f1, f2, sep, dO) {
  const i1 = thinLens(f1, dO);
  const o2 = Number.isFinite(i1.dI) ? sep - i1.dI : -Infinity;
  const i2 = Number.isFinite(o2) ? thinLens(f2, o2) : { dI: f2, m: 0 };
  return { i1, o2, i2, m: Number.isFinite(dO) ? i1.m * i2.m : NaN };
}

/**
 * Angular magnification of two lenses for a star at a small angle α: trace a
 * ray through the centre of the first lens and read its slope after the
 * second. Afocal (sep = f₁ + f₂): exactly −f₁/f₂ for every α.
 */
export function angularMagnification(f1, f2, sep, alpha = 1e-3) {
  const r = paraxialTrace([{ x: 0, f: f1 }, { x: sep, f: f2 }], 0, 0, alpha);
  return r.slope / alpha;
}

/** The near point used for angular magnification of eyepieces and magnifiers, m. */
export const NEAR_POINT = 0.25;
