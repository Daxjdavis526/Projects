// Electrostatics around a plane — the DOM-free model behind sims/em-field.js,
// tested headlessly in test/em-field.test.mjs. Everything is in SI units.
//
// The picture is the plane z = 0; the sources are three-dimensional:
//   charges   point charges in the plane                       { x, y, q }
//   rods      uniformly charged segments in the plane          { x1, y1, x2, y2, Q, pieces }
//             (pieces ≥ 1 replaces the rod by that many equal point charges)
//   lines     infinite line charges along z (seen end-on)      { x, y, lambda }
//   sheets    planes containing the z direction (seen edge-on) { x, y, angle, sigma, width }
//             — infinite, or a strip of finite width (still infinite along z)
//   balls     uniformly charged spheres, or thin shells        { x, y, R, Q, shell }
//   uniform   a uniform field                                   [Ex, Ey]
//   conductor at most one conducting sphere, solid or with a spherical cavity
//             { x, y, R, a, Q }, sharing the scene with point charges and a
//             uniform field only. Its equilibrium is exact: Kelvin image
//             charges for the charges in the cavity and outside, a charge at
//             the centre to give the outer surface its total, and the dipole
//             p = 4πε₀R³E₀ that a uniform field induces.
// field() and potential() superpose them anywhere in space. The potential is
// zero at infinity when every source is bounded; with lines, sheets or a
// uniform field it is zero at the reference point `ref` instead.
//
// Gaussian surfaces are real closed surfaces in 3D — a sphere, a cube, a box,
// a cylinder along z, a lumpy blob — and open patches (a square or a disk
// standing on the plane). flux() integrates E·dA over one numerically, by
// adaptive Gauss–Legendre cubature; enclosed() finds the charge inside it by
// geometry alone. Gauss's law is the statement that the two agree.
// Also: field lines in the plane, equipotential contours (marching squares),
// and the motion of a charged particle through the field.

// ─── constants (SI 2019 exact; CODATA 2022 measured values) ───────────────
export const EPS0 = 8.8541878188e-12;                 // F/m
export const K = 1 / (4 * Math.PI * EPS0);            // 8.9875517862e9 N m²/C²
export const E_CHARGE = 1.602176634e-19;              // C, exact
export const M_E = 9.1093837139e-31;                  // kg
export const M_P = 1.67262192595e-27;                 // kg
export const U_AMU = 1.66053906892e-27;               // kg
export const PARTICLES = {
  electron: { q: -E_CHARGE, m: M_E, name: 'electron' },
  proton: { q: E_CHARGE, m: M_P, name: 'proton' },
  alpha: { q: 2 * E_CHARGE, m: 6.6446573450e-27, name: 'alpha particle' },
  xenon: { q: E_CHARGE, m: 131.293 * U_AMU - M_E, name: 'xenon ion Xe⁺' },
};

const TAU = 2 * Math.PI;
const hyp = Math.hypot;
// cos and sin of an angle in degrees, exact at multiples of 90°
const cosd = (a) => (a % 90 === 0 ? [1, 0, -1, 0][(((a / 90) % 4) + 4) % 4] : Math.cos((a * Math.PI) / 180));
const sind = (a) => (a % 90 === 0 ? [0, 1, 0, -1][(((a / 90) % 4) + 4) % 4] : Math.sin((a * Math.PI) / 180));

// ─── the scene ────────────────────────────────────────────────────────────
/** Normalise a scene description (SI units) into the form the model uses. */
export function scene(spec = {}) {
  const S = { charges: [], pieces: [], rods: [], lines: [], sheets: [], balls: [], uniform: [0, 0], conductor: null, problems: [] };
  for (const c of spec.charges || []) S.charges.push({ x: +c.x, y: +c.y, q: +c.q });
  (spec.rods || []).forEach((r, i) => {
    const L = hyp(r.x2 - r.x1, r.y2 - r.y1);
    if (!(L > 0)) { S.problems.push('a rod needs two different end points'); return; }
    const n = Math.max(0, Math.round(+r.pieces || 0));
    const rod = { x1: +r.x1, y1: +r.y1, x2: +r.x2, y2: +r.y2, Q: +r.Q, L, ux: (r.x2 - r.x1) / L, uy: (r.y2 - r.y1) / L, lambda: r.Q / L, pieces: n, exact: n < 1 };
    S.rods.push(rod);
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n;
      S.pieces.push({ x: rod.x1 + f * (rod.x2 - rod.x1), y: rod.y1 + f * (rod.y2 - rod.y1), q: rod.Q / n, rod: i });
    }
  });
  for (const l of spec.lines || []) S.lines.push({ x: +l.x, y: +l.y, lambda: +l.lambda });
  for (const s of spec.sheets || []) {
    const a = +(s.angle ?? 90);
    const w = s.width === undefined || s.width === null || s.width === Infinity ? Infinity : +s.width;
    S.sheets.push({ x: +s.x, y: +s.y, ux: cosd(a), uy: sind(a), nx: -sind(a), ny: cosd(a), sigma: +s.sigma, w });
  }
  for (const b of spec.balls || []) S.balls.push({ x: +b.x, y: +b.y, R: +b.R, Q: +b.Q, shell: !!b.shell });
  if (spec.uniform) S.uniform = [+spec.uniform[0] || 0, +spec.uniform[1] || 0];
  if (spec.conductor) S.conductor = conductor(spec.conductor, S);
  S.unbounded = S.lines.length > 0 || S.sheets.length > 0 || S.uniform[0] !== 0 || S.uniform[1] !== 0;
  S.ref = spec.ref ? [+spec.ref[0], +spec.ref[1]] : [0, 0];
  S.vref = 0;
  if (S.unbounded) {
    const v = rawPotential(S, S.ref[0], S.ref[1], 0);
    if (Number.isFinite(v)) S.vref = v; else S.problems.push('the reference point for the potential sits on a charge');
  }
  return S;
}

function conductor(c, S) {
  const C = { x: +c.x, y: +c.y, R: +c.R, a: Math.max(0, +c.a || 0), Q: +c.Q || 0, inside: [], outside: [], cavImages: [], outImages: [], bad: [] };
  if (!(C.R > 0) || !(C.a < C.R)) S.problems.push('a conductor needs 0 ≤ a < R');
  if (S.rods.length || S.lines.length || S.sheets.length || S.balls.length) S.problems.push('a conductor can share the scene only with point charges and a uniform field');
  S.charges.forEach((q, i) => {
    const d = hyp(q.x - C.x, q.y - C.y);
    if (C.a > 0 && d < C.a) C.inside.push(q);
    else if (d > C.R) C.outside.push(q);
    else C.bad.push(i);
  });
  if (C.bad.length) S.problems.push('a point charge sits inside the conducting material');
  // charges in the cavity: their images (outside the cavity) make the cavity wall an equipotential
  C.vcav = 0;                               // the constant left by images of charges at the very centre
  for (const q of C.inside) {
    const dx = q.x - C.x, dy = q.y - C.y, d = hyp(dx, dy);
    if (d < 1e-9 * C.a) { C.vcav += (-K * q.q) / C.a; continue; }
    const f = (C.a * C.a) / (d * d);
    C.cavImages.push({ x: C.x + f * dx, y: C.y + f * dy, q: (-q.q * C.a) / d });
  }
  C.qin = C.inside.reduce((s, q) => s + q.q, 0);
  C.Qout = C.Q + C.qin;                     // the outer surface carries the rest of the conductor's charge
  for (const q of C.outside) {
    const dx = q.x - C.x, dy = q.y - C.y, d = hyp(dx, dy), f = (C.R * C.R) / (d * d);
    C.outImages.push({ x: C.x + f * dx, y: C.y + f * dy, q: (-q.q * C.R) / d });
  }
  C.qc = C.Qout - C.outImages.reduce((s, q) => s + q.q, 0);
  C.Vs = (K * C.qc) / C.R;                  // the conductor's potential (plus the uniform field's part, zero at its centre)
  return C;
}

// ─── field ────────────────────────────────────────────────────────────────
function addPoint(px, py, q, x, y, z, out) {
  const dx = x - px, dy = y - py, r2 = dx * dx + dy * dy + z * z;
  if (r2 === 0) { out[0] = out[1] = out[2] = NaN; return; }
  const f = (K * q) / (r2 * Math.sqrt(r2));
  out[0] += f * dx; out[1] += f * dy; out[2] += f * z;
}

// a uniformly charged segment (λ = Q/L) from A to B in the plane, at any point in space
function addRod(r, x, y, z, out) {
  const wx = x - r.x1, wy = y - r.y1;
  const t = wx * r.ux + wy * r.uy;                 // the foot of the perpendicular, measured from A
  const px = wx - t * r.ux, py = wy - t * r.uy;    // the perpendicular, from the line to the point
  const d2 = px * px + py * py + z * z;
  const s1 = -t, s2 = r.L - t;                     // the ends, measured from the foot
  const r1 = Math.sqrt(s1 * s1 + d2), r2 = Math.sqrt(s2 * s2 + d2);
  if (r1 === 0 || r2 === 0) { out[0] = out[1] = out[2] = NaN; return; }
  const kl = K * r.lambda;
  const Eu = kl * (1 / r2 - 1 / r1);
  // (s2/r2 − s1/r1)/d², written without cancellation: s/r = sg(1 − d²/(r(r + |s|)))
  const g1 = s1 >= 0 ? 1 : -1, g2 = s2 >= 0 ? 1 : -1;
  let c;
  if (g1 !== g2) {
    if (d2 === 0) { out[0] = out[1] = out[2] = NaN; return; }   // on the rod itself
    c = (g2 - g1) / d2 - g2 / (r2 * (r2 + Math.abs(s2))) + g1 / (r1 * (r1 + Math.abs(s1)));
  } else c = -g2 / (r2 * (r2 + Math.abs(s2))) + g1 / (r1 * (r1 + Math.abs(s1)));
  out[0] += Eu * r.ux + kl * c * px;
  out[1] += Eu * r.uy + kl * c * py;
  out[2] += kl * c * z;
}

function addLine(l, x, y, out) {
  const dx = x - l.x, dy = y - l.y, r2 = dx * dx + dy * dy;
  if (r2 === 0) { out[0] = out[1] = out[2] = NaN; return; }
  const f = (2 * K * l.lambda) / r2;
  out[0] += f * dx; out[1] += f * dy;
}

// a plane containing z: infinite, or a strip of width w (the 2D field of a segment of line charges)
function addSheet(s, x, y, out) {
  const wx = x - s.x, wy = y - s.y, t = wx * s.ux + wy * s.uy, d = wx * s.nx + wy * s.ny;
  if (s.w === Infinity) {
    const En = 2 * Math.PI * K * s.sigma * Math.sign(d);
    out[0] += En * s.nx; out[1] += En * s.ny;
    return;
  }
  const s1 = -s.w / 2 - t, s2 = s.w / 2 - t, ad = Math.abs(d);
  if (ad === 0 && s1 <= 0 && s2 >= 0 && (s1 === 0 || s2 === 0)) { out[0] = out[1] = out[2] = NaN; return; }   // its edge
  const theta = Math.atan2(s2, ad) - Math.atan2(s1, ad);           // the angle the strip subtends, 0…π
  const En = 2 * K * s.sigma * theta * Math.sign(d);
  const Eu = K * s.sigma * Math.log((s1 * s1 + d * d) / (s2 * s2 + d * d));
  out[0] += En * s.nx + Eu * s.ux; out[1] += En * s.ny + Eu * s.uy;
}

function addBall(b, x, y, z, out) {
  const dx = x - b.x, dy = y - b.y, r2 = dx * dx + dy * dy + z * z, r = Math.sqrt(r2);
  let f;
  if (r >= b.R) { if (r2 === 0) return; f = (K * b.Q) / (r2 * r); }
  else f = b.shell ? 0 : (K * b.Q) / (b.R * b.R * b.R);
  out[0] += f * dx; out[1] += f * dy; out[2] += f * z;
}

// the conducting sphere: the field in the cavity, and outside it
function cavityField(C, x, y, z, out) {
  for (const q of C.inside) addPoint(q.x, q.y, q.q, x, y, z, out);
  for (const q of C.cavImages) addPoint(q.x, q.y, q.q, x, y, z, out);
}
function outsideField(S, C, x, y, z, out) {
  for (const q of C.outside) addPoint(q.x, q.y, q.q, x, y, z, out);
  for (const q of C.outImages) addPoint(q.x, q.y, q.q, x, y, z, out);
  addPoint(C.x, C.y, C.qc, x, y, z, out);
  const [E0x, E0y] = S.uniform;
  if (E0x || E0y) {
    const dx = x - C.x, dy = y - C.y, r2 = dx * dx + dy * dy + z * z, r = Math.sqrt(r2);
    const f = (C.R * C.R * C.R) / (r2 * r), er = (E0x * dx + E0y * dy) / r;     // the induced dipole, R³[3(E₀·r̂)r̂ − E₀]/r³
    out[0] += E0x + f * (3 * er * dx / r - E0x);
    out[1] += E0y + f * (3 * er * dy / r - E0y);
    out[2] += f * (3 * er * z / r);
  }
}

/** Where a point is, for a scene with a conductor: 'cavity', 'metal' or 'outside' (or null without one). */
export function region(S, x, y, z = 0) {
  const C = S.conductor;
  if (!C) return null;
  const r = Math.sqrt((x - C.x) ** 2 + (y - C.y) ** 2 + z * z);
  return r < C.a ? 'cavity' : r <= C.R ? 'metal' : 'outside';
}

/** The electric field [Ex, Ey, Ez] in N/C at (x, y, z). */
export function field(S, x, y, z = 0, out = [0, 0, 0]) {
  out[0] = out[1] = out[2] = 0;
  const C = S.conductor;
  if (C) {
    const where = region(S, x, y, z);
    if (where === 'cavity') cavityField(C, x, y, z, out);
    else if (where === 'outside') outsideField(S, C, x, y, z, out);
    return out;
  }
  for (const c of S.charges) addPoint(c.x, c.y, c.q, x, y, z, out);
  for (const c of S.pieces) addPoint(c.x, c.y, c.q, x, y, z, out);
  for (const r of S.rods) if (r.exact) addRod(r, x, y, z, out);
  for (const l of S.lines) addLine(l, x, y, out);
  for (const s of S.sheets) addSheet(s, x, y, out);
  for (const b of S.balls) addBall(b, x, y, z, out);
  out[0] += S.uniform[0]; out[1] += S.uniform[1];
  return out;
}

// ─── potential ────────────────────────────────────────────────────────────
const pointV = (px, py, q, x, y, z) => (K * q) / Math.sqrt((x - px) ** 2 + (y - py) ** 2 + z * z);

function rodV(r, x, y, z) {
  const wx = x - r.x1, wy = y - r.y1, t = wx * r.ux + wy * r.uy;
  const px = wx - t * r.ux, py = wy - t * r.uy, d2 = px * px + py * py + z * z;
  const s1 = -t, s2 = r.L - t, r1 = Math.sqrt(s1 * s1 + d2), r2 = Math.sqrt(s2 * s2 + d2);
  // ∫ ds/√(s² + d²) = ln(s + √(s² + d²)), with s + r = d²/(r + |s|) for s < 0
  let v;
  if (s1 >= 0) v = Math.log((s2 + r2) / (s1 + r1));
  else if (s2 <= 0) v = Math.log((r1 - s1) / (r2 - s2));
  else v = Math.log((s2 + r2) * (r1 - s1) / d2);
  return K * r.lambda * v;
}

function sheetV(s, x, y) {
  const wx = x - s.x, wy = y - s.y, t = wx * s.ux + wy * s.uy, d = wx * s.nx + wy * s.ny;
  if (s.w === Infinity) return -2 * Math.PI * K * s.sigma * Math.abs(d);
  // V = −kσ ∫ ln(s² + d²) ds over the strip; G is an antiderivative
  const ad = Math.abs(d);
  const G = (u) => (u === 0 ? 0 : u * Math.log(u * u + d * d)) - 2 * u + (ad > 0 ? 2 * ad * Math.atan(u / ad) : 0);
  return -K * s.sigma * (G(s.w / 2 - t) - G(-s.w / 2 - t));
}

function ballV(b, x, y, z) {
  const r = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2 + z * z);
  if (r >= b.R) return (K * b.Q) / r;
  return b.shell ? (K * b.Q) / b.R : (K * b.Q * (3 * b.R * b.R - r * r)) / (2 * b.R ** 3);
}

function rawPotential(S, x, y, z) {
  const C = S.conductor;
  if (C) {
    const where = region(S, x, y, z);
    if (where === 'metal') return C.Vs;
    let v = 0;
    if (where === 'cavity') {
      v = C.Vs + C.vcav;
      for (const q of C.inside) v += pointV(q.x, q.y, q.q, x, y, z);
      for (const q of C.cavImages) v += pointV(q.x, q.y, q.q, x, y, z);
      return v;
    }
    for (const q of C.outside) v += pointV(q.x, q.y, q.q, x, y, z);
    for (const q of C.outImages) v += pointV(q.x, q.y, q.q, x, y, z);
    v += pointV(C.x, C.y, C.qc, x, y, z);
    const [E0x, E0y] = S.uniform;
    if (E0x || E0y) {
      const dx = x - C.x, dy = y - C.y, r3 = Math.sqrt(dx * dx + dy * dy + z * z) ** 3;
      v += -(E0x * dx + E0y * dy) * (1 - C.R ** 3 / r3);
    }
    return v;
  }
  let v = 0;
  for (const c of S.charges) v += pointV(c.x, c.y, c.q, x, y, z);
  for (const c of S.pieces) v += pointV(c.x, c.y, c.q, x, y, z);
  for (const r of S.rods) if (r.exact) v += rodV(r, x, y, z);
  for (const l of S.lines) v += -K * l.lambda * Math.log((x - l.x) ** 2 + (y - l.y) ** 2);
  for (const s of S.sheets) v += sheetV(s, x, y);
  for (const b of S.balls) v += ballV(b, x, y, z);
  v += -(S.uniform[0] * x + S.uniform[1] * y);
  return v;
}

/** The potential in volts: zero at infinity, or at S.ref when the scene has unbounded sources. */
export function potential(S, x, y, z = 0) {
  return rawPotential(S, x, y, z) - S.vref;
}

/** The conductor's own potential (V), on the same scale as potential(). */
export function conductorPotential(S) {
  return S.conductor ? S.conductor.Vs - S.vref : NaN;
}

/**
 * Surface charge density (C/m²) on the conductor at the direction (nx, ny, nz)
 * from its centre: on the outer surface, or with inner: true on the cavity wall.
 */
export function sigmaAt(S, nx, ny, nz = 0, inner = false) {
  const C = S.conductor;
  if (!C) return NaN;
  const out = [0, 0, 0];
  if (inner) {
    if (!(C.a > 0)) return 0;
    cavityField(C, C.x + C.a * nx, C.y + C.a * ny, C.a * nz, out);
    return -EPS0 * (out[0] * nx + out[1] * ny + out[2] * nz);    // the metal's outward normal points into the cavity
  }
  outsideField(S, C, C.x + C.R * nx, C.y + C.R * ny, C.R * nz, out);
  return EPS0 * (out[0] * nx + out[1] * ny + out[2] * nz);
}

// ─── Gauss–Legendre cubature ──────────────────────────────────────────────
const GX = [-0.9324695142031521, -0.6612093864662645, -0.2386191860831969, 0.2386191860831969, 0.6612093864662645, 0.9324695142031521];
const GW = [0.1713244923791704, 0.3607615730481386, 0.467913934572691, 0.467913934572691, 0.3607615730481386, 0.1713244923791704];

const glCache = new Map();
/** n-point Gauss–Legendre nodes and weights on [−1, 1]. */
export function gaussLegendre(n) {
  if (glCache.has(n)) return glCache.get(n);
  const x = new Array(n), w = new Array(n);
  for (let i = 0; i < n; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5)), dp = 0;
    for (let it = 0; it < 100; it++) {
      let p0 = 1, p1 = z;
      for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * z * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
      dp = (n * (z * p1 - p0)) / (z * z - 1);
      const dz = p1 / dp;
      z -= dz;
      if (Math.abs(dz) < 1e-16) break;
    }
    x[i] = -z; w[i] = 2 / ((1 - z * z) * dp * dp);
  }
  const r = { x, w };
  glCache.set(n, r);
  return r;
}

function glPanel(f, u0, u1, v0, v1, st) {
  const hu = (u1 - u0) / 2, cu = (u0 + u1) / 2, hv = (v1 - v0) / 2, cv = (v0 + v1) / 2;
  let s = 0;
  for (let i = 0; i < 6; i++) {
    const u = cu + hu * GX[i];
    for (let j = 0; j < 6; j++) {
      const val = f(u, cv + hv * GX[j]);
      if (Number.isFinite(val)) s += GW[i] * GW[j] * val; else st.singular = true;
    }
  }
  st.evals += 36;
  return s * hu * hv;
}

function adapt(f, u0, u1, v0, v1, whole, tol, depth, st) {
  const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
  const a = glPanel(f, u0, um, v0, vm, st), b = glPanel(f, um, u1, v0, vm, st);
  const c = glPanel(f, u0, um, vm, v1, st), d = glPanel(f, um, u1, vm, v1, st);
  const sum = a + b + c + d, err = Math.abs(sum - whole);
  if (err <= tol) return sum;
  if (depth >= st.maxDepth || st.evals > st.budget) { st.unconverged = true; st.err += err; return sum; }
  const t2 = tol / 2;
  return adapt(f, u0, um, v0, vm, a, t2, depth + 1, st) + adapt(f, um, u1, v0, vm, b, t2, depth + 1, st)
    + adapt(f, u0, um, vm, v1, c, t2, depth + 1, st) + adapt(f, um, u1, vm, v1, d, t2, depth + 1, st);
}

/**
 * ∫∫ f over a set of parameter rectangles, each given by its break points
 * { us: [...], vs: [...] } (the breaks split it into panels). Adaptive: a panel
 * is split until its four children agree with it to the tolerance.
 */
function cubature(rects, f, o = {}) {
  const st = { evals: 0, budget: o.budget ?? 600000, maxDepth: o.depth ?? 14, unconverged: false, singular: false, err: 0 };
  const panels = [];
  for (const R of rects) for (let i = 0; i + 1 < R.us.length; i++) for (let j = 0; j + 1 < R.vs.length; j++) {
    if (R.us[i + 1] > R.us[i] && R.vs[j + 1] > R.vs[j]) panels.push([R, R.us[i], R.us[i + 1], R.vs[j], R.vs[j + 1]]);
  }
  // a scale for the tolerance: the integral of |f| on the panels as they stand
  let scale = 0;
  const wholes = panels.map(([R, u0, u1, v0, v1]) => {
    const g = (u, v) => f(R, u, v);
    scale += Math.abs(glPanel((u, v) => Math.abs(g(u, v)), u0, u1, v0, v1, st));
    return glPanel(g, u0, u1, v0, v1, st);
  });
  const tol = Math.max((o.tol ?? 1e-9) * scale, 1e-300) / Math.max(1, panels.length);
  let total = 0;
  panels.forEach(([R, u0, u1, v0, v1], k) => { total += adapt((u, v) => f(R, u, v), u0, u1, v0, v1, wholes[k], tol, 0, st); });
  return { value: total, abs: scale, evals: st.evals, converged: !st.unconverged && !st.singular, singular: st.singular, err: st.err };
}

// ─── surfaces ─────────────────────────────────────────────────────────────
// A surface is { shape, closed, cx, cy, inside(x, y, z), rects(S), at(rect, u, v) → [x, y, z, Ax, Ay, Az]
// (the point and the area vector per unit u·v, outward for a closed surface), outline (its trace in
// the plane z = 0, as [[x, y], …] with outward normals `normals`), zLength(x, y), sheetArea(sheet),
// ballFraction(ball) }. Sizes are in metres; `angle` in degrees.

const LUMP = { A: 0.25, B: 0.15 };      // the lumpy blob: ρ = r(1 + A sin³θ cos 3φ′ − B cos²θ)

/** Build a surface from { shape: 'sphere'|'cube'|'box'|'cylinder'|'lumpy'|'square'|'disk', x, y, r, w, h, depth, angle }. */
export function surface(g) {
  const shape = g.shape || 'sphere';
  if (shape === 'sphere') return sphereSurface(g);
  if (shape === 'cube') return boxSurface({ ...g, w: 2 * g.r, h: 2 * g.r, depth: 2 * g.r });
  if (shape === 'box') return boxSurface(g);
  if (shape === 'cylinder') return cylinderSurface(g);
  if (shape === 'lumpy') return lumpySurface(g);
  if (shape === 'square' || shape === 'disk') return patchSurface(g);
  throw new Error(`unknown surface shape “${shape}”`);
}

const uniqSorted = (a) => [...new Set(a.map((v) => +v.toPrecision(15)))].sort((p, q) => p - q);

// where the in-plane traces of rods and sheets cross a segment P→Q (as fractions 0…1)
function crossings(S, px, py, qx, qy) {
  const out = [];
  const seg = (ax, ay, bx, by, infinite) => {
    const rx = qx - px, ry = qy - py, sx = bx - ax, sy = by - ay, den = rx * sy - ry * sx;
    if (Math.abs(den) < 1e-300) return;
    const t = ((ax - px) * sy - (ay - py) * sx) / den, u = ((ax - px) * ry - (ay - py) * rx) / den;
    if (t > 1e-12 && t < 1 - 1e-12 && (infinite || (u >= 0 && u <= 1))) out.push(t);
  };
  for (const r of S.rods) seg(r.x1, r.y1, r.x2, r.y2, false);
  for (const s of S.sheets) {
    if (s.w === Infinity) seg(s.x, s.y, s.x + s.ux, s.y + s.uy, true);
    else seg(s.x - (s.w / 2) * s.ux, s.y - (s.w / 2) * s.uy, s.x + (s.w / 2) * s.ux, s.y + (s.w / 2) * s.uy, false);
  }
  return out;
}

// angles where rods and sheets cross a circle of radius r about (cx, cy)
function circleCrossings(S, cx, cy, r) {
  const out = [];
  const hit = (ax, ay, dx, dy, tmin, tmax) => {
    // |A + t d − c|² = r²
    const fx = ax - cx, fy = ay - cy, a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - r * r, disc = b * b - 4 * a * c;
    if (disc <= 0) return;
    for (const t of [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)]) {
      if (t >= tmin && t <= tmax) out.push(((Math.atan2(ay + t * dy - cy, ax + t * dx - cx) % TAU) + TAU) % TAU);
    }
  };
  for (const rd of S.rods) hit(rd.x1, rd.y1, rd.x2 - rd.x1, rd.y2 - rd.y1, 0, 1);
  for (const s of S.sheets) {
    if (s.w === Infinity) hit(s.x, s.y, s.ux, s.uy, -Infinity, Infinity);
    else hit(s.x - (s.w / 2) * s.ux, s.y - (s.w / 2) * s.uy, s.w * s.ux, s.w * s.uy, 0, 1);
  }
  return out;
}

function circleOutline(cx, cy, r, n = 160) {
  const outline = [], normals = [];
  for (let k = 0; k < n; k++) { const p = (TAU * k) / n; outline.push([cx + r * Math.cos(p), cy + r * Math.sin(p)]); normals.push([Math.cos(p), Math.sin(p)]); }
  return { outline, normals };
}

function sphereSurface(g) {
  const cx = g.x, cy = g.y, r = g.r;
  const phiBreaks = (S) => uniqSorted([0, TAU, ...Array.from({ length: 7 }, (_, k) => (TAU * (k + 1)) / 8), ...circleCrossings(S, cx, cy, r)]);
  return {
    shape: 'sphere', closed: true, cx, cy, r, ...circleOutline(cx, cy, r),
    inside: (x, y, z) => (x - cx) ** 2 + (y - cy) ** 2 + z * z < r * r,
    rects(S) {
      // where the sphere cuts the surface of a charged ball, the field has a kink (or, for a shell,
      // a jump) along a circle: turn the poles toward that ball so the circle is a line θ = θ*
      for (const b of S.balls) {
        const dx = b.x - cx, dy = b.y - cy, d = hyp(dx, dy);
        if (!(d > Math.abs(r - b.R) && d < r + b.R) || d < 1e-12 * r) continue;
        const th = Math.acos(Math.max(-1, Math.min(1, (r * r + d * d - b.R * b.R) / (2 * r * d))));
        const e3 = [dx / d, dy / d, 0], e1 = [0, 0, 1], e2 = [e3[1], -e3[0], 0];
        return [{ frame: [e1, e2, e3], us: uniqSorted([0, th / 2, th, (th + Math.PI) / 2, Math.PI]), vs: [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, 1.25 * Math.PI, 1.5 * Math.PI, 1.75 * Math.PI, TAU] }];
      }
      return [{ us: [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI], vs: phiBreaks(S) }];
    },
    at(R, th, ph) {
      const st = Math.sin(th), a = st * Math.cos(ph), b = st * Math.sin(ph), c = Math.cos(th), w = r * r * st;
      let nx = a, ny = b, nz = c;
      if (R.frame) { const [e1, e2, e3] = R.frame; nx = a * e1[0] + b * e2[0] + c * e3[0]; ny = a * e1[1] + b * e2[1] + c * e3[1]; nz = a * e1[2] + b * e2[2] + c * e3[2]; }
      return [cx + r * nx, cy + r * ny, r * nz, w * nx, w * ny, w * nz];
    },
    zLength: (x, y) => { const d2 = (x - cx) ** 2 + (y - cy) ** 2; return d2 < r * r ? 2 * Math.sqrt(r * r - d2) : 0; },
    sheetArea(s) {
      const d = (cx - s.x) * s.nx + (cy - s.y) * s.ny, rho2 = r * r - d * d;
      if (rho2 <= 0) return 0;
      const rho = Math.sqrt(rho2), t0 = (cx - s.x) * s.ux + (cy - s.y) * s.uy;     // the disc of radius ρ in the sheet, centred at t0
      if (s.w === Infinity) return Math.PI * rho2;
      const lo = Math.max(-rho, -s.w / 2 - t0), hi = Math.min(rho, s.w / 2 - t0);
      if (hi <= lo) return 0;
      const F = (t) => t * Math.sqrt(Math.max(0, rho2 - t * t)) + rho2 * Math.asin(Math.max(-1, Math.min(1, t / rho)));
      return F(hi) - F(lo);
    },
    ballFraction(b) {
      const d = hyp(b.x - cx, b.y - cy);
      if (b.shell) {
        if (d < 1e-15) return b.R < r ? 1 : 0;
        const c0 = (b.R * b.R + d * d - r * r) / (2 * b.R * d);      // the shell's points with cos θ > c0 lie inside
        return c0 >= 1 ? 0 : c0 <= -1 ? 1 : (1 - c0) / 2;
      }
      return lensVolume(r, b.R, d) / ((4 / 3) * Math.PI * b.R ** 3);
    },
  };
}

/** The volume common to two spheres of radii r1 and r2 whose centres are d apart. */
export function lensVolume(r1, r2, d) {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return (4 / 3) * Math.PI * Math.min(r1, r2) ** 3;
  return (Math.PI * (r1 + r2 - d) ** 2 * (d * d + 2 * d * r2 - 3 * r2 * r2 + 2 * d * r1 + 6 * r1 * r2 - 3 * r1 * r1)) / (12 * d);
}

function boxSurface(g) {
  const cx = g.x, cy = g.y, a1 = g.w / 2, a2 = g.h / 2, a3 = (g.depth ?? Math.max(g.w, g.h)) / 2;
  const al = +(g.angle || 0), e1 = [cosd(al), sind(al)], e2 = [-sind(al), cosd(al)];
  const P = (s1, s2) => [cx + s1 * e1[0] + s2 * e2[0], cy + s1 * e1[1] + s2 * e2[1]];
  // the four side faces as in-plane edges (from, to, outward normal), extruded along z; then top and bottom
  const sides = [[P(a1, -a2), P(a1, a2), e1], [P(a1, a2), P(-a1, a2), e2], [P(-a1, a2), P(-a1, -a2), [-e1[0], -e1[1]]], [P(-a1, -a2), P(a1, -a2), [-e2[0], -e2[1]]]];
  const corners = [P(a1, -a2), P(a1, a2), P(-a1, a2), P(-a1, -a2)];
  const outline = [], normals = [];
  for (const [A, B, n] of sides) for (let k = 0; k < 40; k++) { const f = k / 40; outline.push([A[0] + f * (B[0] - A[0]), A[1] + f * (B[1] - A[1])]); normals.push(n); }
  const local = (x, y) => { const dx = x - cx, dy = y - cy; return [dx * e1[0] + dy * e1[1], dx * e2[0] + dy * e2[1]]; };
  const inPlane = (x, y) => { const [s1, s2] = local(x, y); return Math.abs(s1) < a1 && Math.abs(s2) < a2; };
  return {
    shape: g.shape === 'cube' ? 'cube' : 'box', closed: true, cx, cy, corners, outline, normals, a1, a2, a3, e1, e2,
    inside: (x, y, z) => inPlane(x, y) && Math.abs(z) < a3,
    rects(S) {
      const rs = sides.map(([A, B], k) => ({ face: k, us: uniqSorted([0, 0.5, 1, ...crossings(S, A[0], A[1], B[0], B[1])]), vs: [-a3, 0, a3] }));
      rs.push({ face: 4, us: [-a1, 0, a1], vs: [-a2, 0, a2] }, { face: 5, us: [-a1, 0, a1], vs: [-a2, 0, a2] });
      return rs;
    },
    at(R, u, v) {
      if (R.face < 4) {
        const [A, B, n] = sides[R.face], L = hyp(B[0] - A[0], B[1] - A[1]);
        return [A[0] + u * (B[0] - A[0]), A[1] + u * (B[1] - A[1]), v, n[0] * L, n[1] * L, 0];
      }
      const [x, y] = P(u, v), sz = R.face === 4 ? 1 : -1;
      return [x, y, sz * a3, 0, 0, sz];
    },
    zLength: (x, y) => (inPlane(x, y) ? 2 * a3 : 0),
    sheetArea: (s) => 2 * a3 * chordInPolygon(corners, s),
  };
}

// the length of a sheet's (or strip's) trace inside a convex polygon
function chordInPolygon(corners, s) {
  let lo = -Infinity, hi = Infinity;
  const n = corners.length;
  // clip the line s.x + t u against each edge's half-plane (corners counter-clockwise)
  for (let k = 0; k < n; k++) {
    const A = corners[k], B = corners[(k + 1) % n];
    const ex = B[0] - A[0], ey = B[1] - A[1];
    const inx = -ey, iny = ex;                                     // the inward normal of a counter-clockwise edge
    const c0 = (s.x - A[0]) * inx + (s.y - A[1]) * iny, c1 = s.ux * inx + s.uy * iny;
    if (Math.abs(c1) < 1e-300) { if (c0 < 0) return 0; continue; }
    const t = -c0 / c1;
    if (c1 > 0) lo = Math.max(lo, t); else hi = Math.min(hi, t);
  }
  if (s.w !== Infinity) { lo = Math.max(lo, -s.w / 2); hi = Math.min(hi, s.w / 2); }
  return hi > lo ? hi - lo : 0;
}

function cylinderSurface(g) {
  const cx = g.x, cy = g.y, r = g.r, a3 = (g.depth ?? 2 * g.r) / 2;
  return {
    shape: 'cylinder', closed: true, cx, cy, r, a3, ...circleOutline(cx, cy, r),
    inside: (x, y, z) => (x - cx) ** 2 + (y - cy) ** 2 < r * r && Math.abs(z) < a3,
    rects: (S) => [
      { face: 0, us: uniqSorted([0, TAU, ...Array.from({ length: 7 }, (_, k) => (TAU * (k + 1)) / 8), ...circleCrossings(S, cx, cy, r)]), vs: [-a3, 0, a3] },
      { face: 1, us: [0, r / 2, r], vs: [0, Math.PI / 2, Math.PI, 1.5 * Math.PI, TAU] },
      { face: 2, us: [0, r / 2, r], vs: [0, Math.PI / 2, Math.PI, 1.5 * Math.PI, TAU] },
    ],
    at(R, u, v) {
      if (R.face === 0) return [cx + r * Math.cos(u), cy + r * Math.sin(u), v, r * Math.cos(u), r * Math.sin(u), 0];
      const sz = R.face === 1 ? 1 : -1;
      return [cx + u * Math.cos(v), cy + u * Math.sin(v), sz * a3, 0, 0, sz * u];
    },
    zLength: (x, y) => ((x - cx) ** 2 + (y - cy) ** 2 < r * r ? 2 * a3 : 0),
    sheetArea(s) {
      const d = (cx - s.x) * s.nx + (cy - s.y) * s.ny;
      if (Math.abs(d) >= r) return 0;
      const half = Math.sqrt(r * r - d * d), t0 = (cx - s.x) * s.ux + (cy - s.y) * s.uy;
      let lo = t0 - half, hi = t0 + half;
      if (s.w !== Infinity) { lo = Math.max(lo, -s.w / 2); hi = Math.min(hi, s.w / 2); }
      return hi > lo ? 2 * a3 * (hi - lo) : 0;
    },
  };
}

function lumpySurface(g) {
  const cx = g.x, cy = g.y, r = g.r, ph0 = ((g.angle || 0) * Math.PI) / 180, { A, B } = LUMP;
  const rho = (th, ph) => r * (1 + A * Math.sin(th) ** 3 * Math.cos(3 * (ph - ph0)) - B * Math.cos(th) ** 2);
  const outline = [], normals = [];
  for (let k = 0; k < 240; k++) {
    const ph = (TAU * k) / 240, p = rho(Math.PI / 2, ph), dp = -3 * r * A * Math.sin(3 * (ph - ph0));
    outline.push([cx + p * Math.cos(ph), cy + p * Math.sin(ph)]);
    // the outward normal of the curve (ρ cos φ, ρ sin φ): rotate the tangent (ρ′cos φ − ρ sin φ, ρ′ sin φ + ρ cos φ) clockwise
    const tx = dp * Math.cos(ph) - p * Math.sin(ph), ty = dp * Math.sin(ph) + p * Math.cos(ph), tl = hyp(tx, ty);
    normals.push([ty / tl, -tx / tl]);
  }
  const zext = r * (1 + A);
  const inside = (x, y, z) => {
    const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy + z * z);
    if (d === 0) return true;
    return d < rho(Math.acos(Math.max(-1, Math.min(1, z / d))), Math.atan2(dy, dx));
  };
  return {
    shape: 'lumpy', closed: true, cx, cy, r, zext, outline, normals, inside,
    rects(S) {
      const ph = [];
      const n = outline.length;
      for (let k = 0; k < n; k++) {
        const P = outline[k], Q = outline[(k + 1) % n];
        for (const t of crossings(S, P[0], P[1], Q[0], Q[1])) ph.push((TAU * (k + t)) / n);
      }
      return [{ us: [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI], vs: uniqSorted([0, TAU, ...Array.from({ length: 11 }, (_, k) => (TAU * (k + 1)) / 12), ...ph]) }];
    },
    at(_, th, ph) {
      const st = Math.sin(th), ct = Math.cos(th), sp = Math.sin(ph), cp = Math.cos(ph);
      const p = rho(th, ph);
      const pth = r * (3 * A * st * st * ct * Math.cos(3 * (ph - ph0)) + 2 * B * ct * st);
      const pph = -3 * r * A * st ** 3 * Math.sin(3 * (ph - ph0));
      // dA = ρ² sin θ e_r − ρ ρ_θ sin θ e_θ − ρ ρ_φ e_φ
      const er = [st * cp, st * sp, ct], et = [ct * cp, ct * sp, -st], ep = [-sp, cp, 0];
      const a = p * p * st, b = -p * pth * st, c = -p * pph;
      return [cx + p * er[0], cy + p * er[1], p * er[2], a * er[0] + b * et[0] + c * ep[0], a * er[1] + b * et[1] + c * ep[1], a * er[2] + b * et[2]];
    },
  };
}

// an open patch standing on the plane: a square of side `size`, or a disc of diameter `size`,
// whose trace is a segment through (x, y) and whose normal makes `angle` (deg) with the x axis
function patchSurface(g) {
  const cx = g.x, cy = g.y, h = g.size / 2, al = +(g.angle || 0);
  const n = [cosd(al), sind(al)], t = [-sind(al), cosd(al)];
  const A = [cx - h * t[0], cy - h * t[1]], B = [cx + h * t[0], cy + h * t[1]];
  const disk = g.shape === 'disk';
  return {
    shape: g.shape, closed: false, cx, cy, n, t, ends: [A, B], outline: [A, B], normals: [n, n], area: disk ? Math.PI * h * h : 4 * h * h,
    inside: () => false,
    rects(S) {
      const cut = crossings(S, A[0], A[1], B[0], B[1]).map((f) => -h + 2 * h * f);
      return disk ? [{ us: [0, h / 2, h], vs: [0, Math.PI / 2, Math.PI, 1.5 * Math.PI, TAU] }] : [{ us: uniqSorted([-h, 0, h, ...cut]), vs: [-h, 0, h] }];
    },
    at(_, u, v) {
      if (disk) return [cx + u * Math.cos(v) * t[0], cy + u * Math.cos(v) * t[1], u * Math.sin(v), n[0] * u, n[1] * u, 0];
      return [cx + u * t[0], cy + u * t[1], v, n[0], n[1], 0];
    },
  };
}

// ─── flux and enclosed charge ─────────────────────────────────────────────
/**
 * The flux ∫E·dA (N·m²/C) through a surface, by adaptive cubature.
 * Returns { flux, abs (∫|E·dA|), converged, singular, evals }.
 */
export function flux(S, surf, o = {}) {
  const E = [0, 0, 0];
  const r = cubature(surf.rects(S), (R, u, v) => {
    const p = surf.at(R, u, v);
    field(S, p[0], p[1], p[2], E);
    return E[0] * p[3] + E[1] * p[4] + E[2] * p[5];
  }, o);
  return { flux: r.value, abs: r.abs, converged: r.converged, singular: r.singular, evals: r.evals };
}

// the fraction-free length of {s : inside} along a parametrised path, by sampling and bisection
function measureInside(test, a, b, n = 240) {
  let total = 0, prev = test(a), start = prev ? a : null;
  const edge = (lo, hi, inLo) => {
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (test(m) === inLo) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  for (let i = 1; i <= n; i++) {
    const s = a + ((b - a) * i) / n, cur = test(s);
    if (cur !== prev) {
      const e = edge(a + ((b - a) * (i - 1)) / n, s, prev);
      if (cur) start = e; else { total += e - start; start = null; }
      prev = cur;
    }
  }
  if (prev && start !== null) total += b - start;
  return total;
}

/** The charge (C) inside a closed surface, found from the geometry of the sources. */
export function enclosed(S, surf) {
  let Q = 0;
  for (const c of S.charges) if (surf.inside(c.x, c.y, 0)) Q += c.q;
  for (const c of S.pieces) if (surf.inside(c.x, c.y, 0)) Q += c.q;
  for (const r of S.rods) {
    if (!r.exact) continue;
    Q += r.lambda * measureInside((s) => surf.inside(r.x1 + s * r.ux, r.y1 + s * r.uy, 0), 0, r.L);
  }
  for (const l of S.lines) {
    const len = surf.zLength ? surf.zLength(l.x, l.y) : measureInside((z) => surf.inside(l.x, l.y, z), -surf.zext * 1.01, surf.zext * 1.01);
    Q += l.lambda * len;
  }
  for (const s of S.sheets) Q += s.sigma * (surf.sheetArea ? surf.sheetArea(s) : sheetAreaNumeric(surf, s));
  for (const b of S.balls) Q += b.Q * (surf.ballFraction ? surf.ballFraction(b) : ballFractionNumeric(surf, b));
  if (S.conductor) Q += inducedInside(S, surf);
  return Q;
}

function sheetAreaNumeric(surf, s) {
  const zx = surf.zext || 10, span = s.w === Infinity ? 4 * zx : s.w;
  const t0 = s.w === Infinity ? (surf.cx - s.x) * s.ux + (surf.cy - s.y) * s.uy : 0;
  const { x: gx, w: gw } = gaussLegendre(64);
  let area = 0;
  for (let i = 0; i < 64; i++) {
    const z = zx * gx[i];
    area += gw[i] * zx * measureInside((t) => surf.inside(s.x + t * s.ux, s.y + t * s.uy, z), t0 - span / 2, t0 + span / 2, 120);
  }
  return area;
}

function ballFractionNumeric(surf, b) {
  const nt = 48, np = 96, { x: gx, w: gw } = gaussLegendre(nt);
  let f = 0;
  for (let i = 0; i < nt; i++) {
    const ct = gx[i], st = Math.sqrt(1 - ct * ct);
    for (let j = 0; j < np; j++) {
      const ph = (TAU * (j + 0.5)) / np, dx = st * Math.cos(ph), dy = st * Math.sin(ph);
      const w = (gw[i] * TAU) / np / (4 * Math.PI);
      if (b.shell) { if (surf.inside(b.x + b.R * dx, b.y + b.R * dy, b.R * ct)) f += w; continue; }
      // ∫ r² dr over the inside part of the ray, as a fraction of R³/3
      let lo = null, acc = 0, prev = surf.inside(b.x, b.y, 0);
      if (prev) lo = 0;
      const n = 64;
      for (let k = 1; k <= n; k++) {
        const rr = (b.R * k) / n, cur = surf.inside(b.x + rr * dx, b.y + rr * dy, rr * ct);
        if (cur !== prev) {
          let a = (b.R * (k - 1)) / n, c = rr;
          for (let it = 0; it < 50; it++) { const m = (a + c) / 2; if (surf.inside(b.x + m * dx, b.y + m * dy, m * ct) === prev) a = m; else c = m; }
          const e = (a + c) / 2;
          if (cur) lo = e; else { acc += e ** 3 - lo ** 3; lo = null; }
          prev = cur;
        }
      }
      if (prev && lo !== null) acc += b.R ** 3 - lo ** 3;
      f += (w * acc) / b.R ** 3;
    }
  }
  return f;
}

// the conductor's surface charge inside a closed surface: each of its surfaces counts fully when it
// lies wholly inside, not at all when wholly outside, and is integrated over when the surface cuts it
function inducedInside(S, surf) {
  const C = S.conductor;
  let Q = 0;
  const part = (R, inner, total) => {
    if (!(R > 0)) return 0;
    const nt = 40, np = 80, { x: gx, w: gw } = gaussLegendre(nt);
    let ins = 0, all = 0, sum = 0;
    for (let i = 0; i < nt; i++) {
      const ct = gx[i], st = Math.sqrt(1 - ct * ct);
      for (let j = 0; j < np; j++) {
        const ph = (TAU * (j + 0.5)) / np, nx = st * Math.cos(ph), ny = st * Math.sin(ph);
        all++;
        if (surf.inside(C.x + R * nx, C.y + R * ny, R * ct)) { ins++; sum += sigmaAt(S, nx, ny, ct, inner) * R * R * gw[i] * (TAU / np); }
      }
    }
    return ins === all ? total : ins === 0 ? 0 : sum;
  };
  Q += part(C.a, true, -C.qin);
  Q += part(C.R, false, C.Qout);
  return Q;
}

// ─── field lines ──────────────────────────────────────────────────────────
/**
 * Field lines in the plane z = 0 within box { x0, x1, y0, y1 }: each a list of
 * points running along E (from + toward −). Point charges and balls send out
 * lines in proportion to their charge (n for the largest); lines, sheets and a
 * uniform field in proportion to their two-dimensional flux; lines that should
 * end on a negative source but are not reached by any are traced backward from it.
 * Returns [{ pts: [[x, y], …], from, to }].
 */
export function fieldLines(S, box, o = {}) {
  const N0 = o.n ?? 12;
  const diag = hyp(box.x1 - box.x0, box.y1 - box.y0);
  const rHit = o.rHit ?? diag * 0.012;
  const h0 = o.step ?? diag / 300;
  const margin = diag * 0.02;
  const C = S.conductor;
  const E = [0, 0, 0];

  // point-like sources: charges, balls, end-on lines
  const pts = [];
  S.charges.forEach((c, i) => pts.push({ kind: 'charge', i, x: c.x, y: c.y, s: c.q, rad: rHit, d3: true }));
  S.balls.forEach((b, i) => pts.push({ kind: 'ball', i, x: b.x, y: b.y, s: b.Q, rad: b.R + rHit * 0.3, d3: true }));
  S.lines.forEach((l, i) => pts.push({ kind: 'line', i, x: l.x, y: l.y, s: l.lambda, rad: rHit, d3: false }));

  // extended sources: closed curves just off them, with outward normals
  const curves = extendedCurves(S, box, rHit * 0.6);

  // the 2D flux of every curve and its positive and negative parts
  for (const cv of curves) {
    cv.f = cv.p.map(([x, y], k) => { field(S, x, y, 0, E); return (E[0] * cv.n[k][0] + E[1] * cv.n[k][1]) * cv.ds[k]; });
    cv.plus = cv.f.reduce((s, v) => s + Math.max(0, v), 0);
    cv.minus = cv.f.reduce((s, v) => s + Math.max(0, -v), 0);
  }

  // scales: lines per unit of 3D charge, and 2D flux per line
  const charge3 = [...pts.filter((p) => p.d3).map((p) => Math.abs(p.s)), ...S.rods.map((r) => Math.abs(r.Q))];
  const useUniform = S.uniform[0] !== 0 || S.uniform[1] !== 0;
  if (C) {
    C.Qplus = surfaceChargeSplit(S, false);
    C.Qinner = surfaceChargeSplit(S, true);
    if (!useUniform) charge3.push(C.Qplus.plus, C.Qplus.minus, C.Qinner.plus, C.Qinner.minus);
  }
  const qmax = Math.max(0, ...charge3);
  const wperp = useUniform ? perpExtent(box, S.uniform) : 0;
  const flux2 = [...S.lines.map((l) => Math.abs(l.lambda) / EPS0), ...S.sheets.map((s) => (Math.abs(s.sigma) * (s.w === Infinity ? sheetSpan(s, box) : s.w)) / EPS0)];
  if (useUniform) flux2.push(hyp(...S.uniform) * wperp);
  const phiLine = Math.max(0, ...flux2) / N0;

  const count3 = (q) => (qmax > 0 ? Math.round((N0 * Math.abs(q)) / qmax) : 0);
  const lines = [];
  const arrivals = new Map();      // source key → list of arrival positions

  // trace one line from (x, y): dir = +1 along E, −1 against it
  const trace = (x, y, dir, from) => {
    const line = [[x, y]];
    let px = x, py = y, prevDx = 0, prevDy = 0, end = 'steps';
    const maxSteps = o.maxSteps ?? 3000;
    const dirAt = (qx, qy) => {
      field(S, qx, qy, 0, E);
      const m = hyp(E[0], E[1]);
      return m > 0 && Number.isFinite(m) ? [(dir * E[0]) / m, (dir * E[1]) / m] : null;
    };
    for (let step = 0; step < maxSteps; step++) {
      // a smaller step close to point-like sources
      let h = h0;
      for (const s of pts) h = Math.min(h, Math.max(h0 / 25, 0.3 * (hyp(px - s.x, py - s.y) - s.rad * 0.5)));
      const k1 = dirAt(px, py); if (!k1) { end = 'stall'; break; }
      // does this step reach a rod or a sheet? Check with the Euler predictor first: RK4's
      // intermediate points would sample the far side, where the field turns back
      let hitX = crossExtended(S, px, py, px + 1.5 * h * k1[0], py + 1.5 * h * k1[1]);
      if (hitX) {
        // carry on through only if the field beyond still points onward
        const bx = hitX.x + k1[0] * rHit * 0.3, by = hitX.y + k1[1] * rHit * 0.3, k = dirAt(bx, by);
        if (!k || k[0] * k1[0] + k[1] * k1[1] <= 0) { line.push([hitX.x, hitX.y]); end = hitX.key; addArrival(arrivals, hitX.key, [hitX.x, hitX.y]); return { pts: line, from, to: end }; }
        line.push([bx, by]); prevDx = bx - px; prevDy = by - py; px = bx; py = by;
        continue;
      }
      const k2 = dirAt(px + (h / 2) * k1[0], py + (h / 2) * k1[1]); if (!k2) { end = 'stall'; break; }
      const k3 = dirAt(px + (h / 2) * k2[0], py + (h / 2) * k2[1]); if (!k3) { end = 'stall'; break; }
      const k4 = dirAt(px + h * k3[0], py + h * k3[1]); if (!k4) { end = 'stall'; break; }
      const dx = (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), dy = (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (step > 0 && dx * prevDx + dy * prevDy < -0.3 * h * h) { end = 'stall'; break; }   // turned back: a null point
      let nx = px + dx, ny = py + dy;
      hitX = crossExtended(S, px, py, nx, ny);
      if (hitX) { line.push([hitX.x, hitX.y]); end = hitX.key; addArrival(arrivals, hitX.key, [hitX.x, hitX.y]); return { pts: line, from, to: end }; }
      if (C) {
        const w = region(S, nx, ny, 0);
        if (w === 'metal') {
          // stop on the conductor's surface
          let lo = 0, hi = 1;
          for (let it = 0; it < 40; it++) { const m = (lo + hi) / 2; if (region(S, px + m * dx, py + m * dy, 0) === 'metal') hi = m; else lo = m; }
          nx = px + lo * dx; ny = py + lo * dy;
          line.push([nx, ny]);
          const key = hyp(nx - C.x, ny - C.y) < (C.a + C.R) / 2 ? 'cond-in' : 'cond-out';
          addArrival(arrivals, key, [nx, ny]);
          return { pts: line, from, to: key };
        }
      }
      line.push([nx, ny]);
      prevDx = dx; prevDy = dy; px = nx; py = ny;
      if (px < box.x0 - margin || px > box.x1 + margin || py < box.y0 - margin || py > box.y1 + margin) { end = 'out'; break; }
      let done = null;
      for (const s of pts) {
        if (hyp(px - s.x, py - s.y) < s.rad) { done = s; break; }
      }
      if (done) {
        const key = `${done.kind}:${done.i}`;
        if (done.kind !== 'ball') line.push([done.x, done.y]);
        if (Math.sign(done.s) === -dir) addArrival(arrivals, key, [px, py]);
        end = key;
        break;
      }
    }
    return { pts: line, from, to: end };
  };

  const angleTo = (p) => {
    // the direction to the nearest other source, so that pairs look symmetric
    let best = Infinity, ang = 0;
    for (const q of pts) if (q !== p) { const d = hyp(q.x - p.x, q.y - p.y); if (d < best) { best = d; ang = Math.atan2(q.y - p.y, q.x - p.x); } }
    for (const r of S.rods) { const mx = (r.x1 + r.x2) / 2, my = (r.y1 + r.y2) / 2, d = hyp(mx - p.x, my - p.y); if (d < best) { best = d; ang = Math.atan2(my - p.y, mx - p.x); } }
    if (C) { const d = hyp(C.x - p.x, C.y - p.y); if (d < best) { best = d; ang = Math.atan2(C.y - p.y, C.x - p.x); } }
    return ang;
  };
  const countOf = (p) => (p.d3 ? count3(p.s) : phiLine > 0 ? Math.round(Math.abs(p.s) / EPS0 / phiLine) : 0);

  // 1. forward from positive point-like sources
  for (const p of pts) {
    if (!(p.s > 0)) continue;
    const n = countOf(p), a0 = angleTo(p);
    for (let k = 0; k < n; k++) { const a = a0 + (TAU * k) / n; lines.push(trace(p.x + p.rad * 1.02 * Math.cos(a), p.y + p.rad * 1.02 * Math.sin(a), 1, `${p.kind}:${p.i}`)); }
  }
  // 2. forward from the positive parts of extended sources
  const expected = (cv, sign) => {
    const amount = sign > 0 ? cv.plus : cv.minus;
    if (cv.kind === 'rod') return Math.sign(cv.Q) === sign ? count3(cv.Q) : 0;
    if (cv.kind === 'cond-out' || cv.kind === 'cond-in') {
      if (!useUniform) { const split = cv.kind === 'cond-out' ? C.Qplus : C.Qinner; return count3(sign > 0 ? split.plus : split.minus); }
      return phiLine > 0 ? Math.round(amount / phiLine) : 0;
    }
    return phiLine > 0 ? Math.round(amount / phiLine) : 0;
  };
  const seedsOn = (cv, sign, n, skipBins) => {
    // n seeds at equal steps of the cumulative flux of one sign
    const vals = cv.f.map((v) => Math.max(0, sign * v)), total = vals.reduce((s, v) => s + v, 0);
    if (!(total > 0) || n <= 0) return [];
    const out = [];
    let acc = 0, k = 0;
    for (let b = 0; b < n; b++) {
      if (skipBins && skipBins.has(b)) continue;
      const target = ((b + 0.5) / n) * total;
      while (k < vals.length - 1 && acc + vals[k] < target) { acc += vals[k]; k++; }
      out.push(k);
    }
    return out;
  };
  for (const cv of curves) {
    const n = expected(cv, 1);
    for (const k of seedsOn(cv, 1, n)) lines.push(trace(cv.p[k][0], cv.p[k][1], 1, cv.key));
  }
  // 3. a uniform field: lines from the edge of the box where the field comes in
  if (useUniform && phiLine > 0) {
    const n = Math.max(1, Math.round((hyp(...S.uniform) * wperp) / phiLine));
    for (const [x, y] of inflowSeeds(box, S.uniform, n)) lines.push(trace(x, y, 1, 'edge'));
  }
  // 4. backward from the negative sources that are short of lines
  for (const p of pts) {
    if (!(p.s < 0)) continue;
    const key = `${p.kind}:${p.i}`, n = countOf(p), got = (arrivals.get(key) || []).map(([x, y]) => Math.atan2(y - p.y, x - p.x));
    for (const a of fillAngles(got, n, angleTo(p))) lines.push(reverse(trace(p.x + p.rad * 1.02 * Math.cos(a), p.y + p.rad * 1.02 * Math.sin(a), -1, key)));
  }
  for (const cv of curves) {
    const n = expected(cv, -1);
    if (n <= 0) continue;
    // bins of equal negative flux; those already reached by a line are full
    const vals = cv.f.map((v) => Math.max(0, -v)), total = vals.reduce((s, v) => s + v, 0);
    if (!(total > 0)) continue;
    const cum = [];
    vals.reduce((acc, v, k) => { cum[k] = acc + v / 2; return acc + v; }, 0);
    const binOf = (k) => Math.min(n - 1, Math.floor((cum[k] / total) * n));
    const full = new Set();
    for (const [x, y] of arrivals.get(cv.key) || []) {
      let best = 0, bd = Infinity;
      cv.p.forEach(([qx, qy], k) => { const d = hyp(qx - x, qy - y); if (d < bd) { bd = d; best = k; } });
      if (vals[best] > 0) full.add(binOf(best));
    }
    for (const k of seedsOn(cv, -1, n, full)) lines.push(reverse(trace(cv.p[k][0], cv.p[k][1], -1, cv.key)));
  }
  return lines.filter((l) => l.pts.length > 2);
}

/**
 * The field line through (x, y), traced both ways until it leaves the box, reaches a source
 * or a conductor, or stalls. Returns [[x, y], …] running along E.
 */
export function lineThrough(S, x, y, box, o = {}) {
  const diag = hyp(box.x1 - box.x0, box.y1 - box.y0), h = o.step ?? diag / 400, rHit = o.rHit ?? diag * 0.012, E = [0, 0, 0];
  const half = (dir) => {
    const out = [];
    let px = x, py = y;
    for (let k = 0; k < (o.maxSteps ?? 4000); k++) {
      const d = (qx, qy) => { field(S, qx, qy, 0, E); const m = hyp(E[0], E[1]); return m > 0 && Number.isFinite(m) ? [(dir * E[0]) / m, (dir * E[1]) / m] : null; };
      const k1 = d(px, py); if (!k1) break;
      const hit = crossExtended(S, px, py, px + 1.5 * h * k1[0], py + 1.5 * h * k1[1]);
      if (hit) { out.push([hit.x, hit.y]); break; }
      const k2 = d(px + (h / 2) * k1[0], py + (h / 2) * k1[1]); if (!k2) break;
      const k3 = d(px + (h / 2) * k2[0], py + (h / 2) * k2[1]); if (!k3) break;
      const k4 = d(px + h * k3[0], py + h * k3[1]); if (!k4) break;
      px += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); py += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (S.conductor && region(S, px, py, 0) === 'metal') break;
      out.push([px, py]);
      if (px < box.x0 || px > box.x1 || py < box.y0 || py > box.y1) break;
      if (S.charges.some((c) => hyp(c.x - px, c.y - py) < rHit) || S.lines.some((l) => hyp(l.x - px, l.y - py) < rHit) || S.balls.some((b) => hyp(b.x - px, b.y - py) < b.R)) break;
    }
    return out;
  };
  return [...half(-1).reverse(), [x, y], ...half(1)];
}

const reverse = (l) => ({ pts: l.pts.slice().reverse(), from: l.to, to: l.from });
function addArrival(map, key, p) { if (!map.has(key)) map.set(key, []); map.get(key).push(p); }

// A source of n lines has n evenly spaced slots, the first pointing at a0. Lines that already
// arrive take the slot nearest to them; the empty slots are returned, at most n − arrivals.
// For a mirror-symmetric pair (a dipole) the arrivals land exactly on slots, so the lines
// traced back from the empty ones are the mirror images of those that left the picture.
function fillAngles(taken, n, a0) {
  if (n <= 0) return [];
  const slots = Array.from({ length: n }, (_, k) => a0 + (TAU * k) / n), used = new Set();
  const wrap = (a) => Math.abs(((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI);
  for (const a of taken) {
    let best = -1, bd = Infinity;
    slots.forEach((s, k) => { if (used.has(k)) return; const d = wrap(a - s); if (d < bd) { bd = d; best = k; } });
    if (best >= 0) used.add(best);
  }
  return slots.filter((_, k) => !used.has(k)).slice(0, Math.max(0, n - taken.length));
}

function perpExtent(box, [ex, ey]) {
  const m = hyp(ex, ey), px = -ey / m, py = ex / m;
  const ws = [[box.x0, box.y0], [box.x1, box.y0], [box.x0, box.y1], [box.x1, box.y1]].map(([x, y]) => x * px + y * py);
  return Math.max(...ws) - Math.min(...ws);
}

// evenly spaced points (across the field) on the edge of the box where a uniform field enters it
function inflowSeeds(box, [ex, ey], n) {
  const m = hyp(ex, ey), ux = ex / m, uy = ey / m, px = -uy, py = ux;
  const corners = [[box.x0, box.y0], [box.x1, box.y0], [box.x0, box.y1], [box.x1, box.y1]];
  const ws = corners.map(([x, y]) => x * px + y * py), lo = Math.min(...ws), hi = Math.max(...ws);
  const out = [];
  for (let k = 0; k < n; k++) {
    const w = lo + ((k + 0.5) / n) * (hi - lo), ox = w * px, oy = w * py;
    // where the line {o + s u} enters the box (slabs)
    let s0 = -Infinity, s1 = Infinity;
    for (const [o, u, a, b] of [[ox, ux, box.x0, box.x1], [oy, uy, box.y0, box.y1]]) {
      if (Math.abs(u) < 1e-15) { if (o < a || o > b) { s0 = Infinity; } continue; }
      const t1 = (a - o) / u, t2 = (b - o) / u;
      s0 = Math.max(s0, Math.min(t1, t2)); s1 = Math.min(s1, Math.max(t1, t2));
    }
    if (s0 < s1) { const s = s0 + (s1 - s0) * 1e-6; out.push([ox + s * ux, oy + s * uy]); }
  }
  return out;
}

function sheetSpan(s, box) {
  // the length of an infinite sheet's trace inside the box
  const corners = [[box.x0, box.y0], [box.x1, box.y0], [box.x1, box.y1], [box.x0, box.y1]];
  return chordInPolygon(corners, s);
}

// closed curves just off each extended source: rods and strips (a thin capsule), infinite sheets
// (both faces, inside the box), the conductor's surfaces
function extendedCurves(S, box, eps) {
  const curves = [];
  const capsule = (ax, ay, bx, by, key, extra) => {
    const L = hyp(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L, nx = -uy, ny = ux;
    const p = [], n = [], ds = [], m = 70, mc = 12;
    for (let k = 0; k < m; k++) { const f = (k + 0.5) / m; p.push([ax + f * L * ux + eps * nx, ay + f * L * uy + eps * ny]); n.push([nx, ny]); ds.push(L / m); }
    for (let k = 0; k < mc; k++) { const a = Math.PI / 2 - (Math.PI * (k + 0.5)) / mc; const dx = Math.cos(a) * ux - Math.sin(a) * nx, dy = Math.cos(a) * uy - Math.sin(a) * ny; p.push([bx + eps * dx, by + eps * dy]); n.push([dx, dy]); ds.push((Math.PI * eps) / mc); }
    for (let k = 0; k < m; k++) { const f = 1 - (k + 0.5) / m; p.push([ax + f * L * ux - eps * nx, ay + f * L * uy - eps * ny]); n.push([-nx, -ny]); ds.push(L / m); }
    for (let k = 0; k < mc; k++) { const a = -Math.PI / 2 - (Math.PI * (k + 0.5)) / mc; const dx = Math.cos(a) * ux - Math.sin(a) * nx, dy = Math.cos(a) * uy - Math.sin(a) * ny; p.push([ax + eps * dx, ay + eps * dy]); n.push([dx, dy]); ds.push((Math.PI * eps) / mc); }
    curves.push({ key, p, n, ds, ...extra });
  };
  S.rods.forEach((r, i) => capsule(r.x1, r.y1, r.x2, r.y2, `rod:${i}`, { kind: 'rod', Q: r.Q }));
  S.sheets.forEach((s, i) => {
    if (s.w !== Infinity) { capsule(s.x - (s.w / 2) * s.ux, s.y - (s.w / 2) * s.uy, s.x + (s.w / 2) * s.ux, s.y + (s.w / 2) * s.uy, `sheet:${i}`, { kind: 'strip' }); return; }
    const corners = [[box.x0, box.y0], [box.x1, box.y0], [box.x1, box.y1], [box.x0, box.y1]];
    const span = chordInPolygon(corners, s);
    if (!(span > 0)) return;
    // the visible stretch: clip t to the box
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 400; i++) {
      const t = -2 * hyp(box.x1 - box.x0, box.y1 - box.y0) + (4 * hyp(box.x1 - box.x0, box.y1 - box.y0) * i) / 400;
      const x = s.x + t * s.ux, y = s.y + t * s.uy;
      if (x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1) { lo = Math.min(lo, t); hi = Math.max(hi, t); }
    }
    const p = [], n = [], ds = [], m = 90;
    for (const side of [1, -1]) for (let k = 0; k < m; k++) { const t = lo + ((k + 0.5) / m) * (hi - lo); p.push([s.x + t * s.ux + side * eps * s.nx, s.y + t * s.uy + side * eps * s.ny]); n.push([side * s.nx, side * s.ny]); ds.push((hi - lo) / m); }
    curves.push({ key: `sheet:${i}`, kind: 'sheet', p, n, ds });
  });
  const C = S.conductor;
  if (C) {
    const ring = (rad, sgn, key) => {
      const p = [], n = [], ds = [], m = 240;
      for (let k = 0; k < m; k++) { const a = (TAU * (k + 0.5)) / m; p.push([C.x + rad * Math.cos(a), C.y + rad * Math.sin(a)]); n.push([sgn * Math.cos(a), sgn * Math.sin(a)]); ds.push((TAU * rad) / m); }
      curves.push({ key, kind: key, p, n, ds });
    };
    ring(C.R + eps, 1, 'cond-out');
    if (C.a > 0) ring(Math.max(C.a - eps, C.a * 0.5), -1, 'cond-in');
  }
  return curves;
}

// the first extended source a step P→Q crosses: { x, y, key }
function crossExtended(S, px, py, qx, qy) {
  let best = null, bt = Infinity;
  const seg = (ax, ay, bx, by, infinite, key) => {
    const rx = qx - px, ry = qy - py, sx = bx - ax, sy = by - ay, den = rx * sy - ry * sx;
    if (Math.abs(den) < 1e-300) return;
    const t = ((ax - px) * sy - (ay - py) * sx) / den, u = ((ax - px) * ry - (ay - py) * rx) / den;
    if (t >= 0 && t <= 1 && (infinite || (u >= 0 && u <= 1)) && t < bt) { bt = t; best = { x: px + t * rx, y: py + t * ry, key }; }
  };
  S.rods.forEach((r, i) => seg(r.x1, r.y1, r.x2, r.y2, false, `rod:${i}`));
  S.sheets.forEach((s, i) => {
    if (s.w === Infinity) seg(s.x, s.y, s.x + s.ux, s.y + s.uy, true, `sheet:${i}`);
    else seg(s.x - (s.w / 2) * s.ux, s.y - (s.w / 2) * s.uy, s.x + (s.w / 2) * s.ux, s.y + (s.w / 2) * s.uy, false, `sheet:${i}`);
  });
  return best;
}

/** The conductor's surface charge split into its positive and negative parts: { plus, minus } in C. */
export function surfaceChargeSplit(S, inner = false) {
  const C = S.conductor;
  if (!C) return { plus: 0, minus: 0 };
  const R = inner ? C.a : C.R;
  if (!(R > 0)) return { plus: 0, minus: 0 };
  const nt = 32, np = 64, { x: gx, w: gw } = gaussLegendre(nt);
  let plus = 0, minus = 0;
  for (let i = 0; i < nt; i++) {
    const ct = gx[i], st = Math.sqrt(1 - ct * ct);
    for (let j = 0; j < np; j++) {
      const ph = (TAU * (j + 0.5)) / np, s = sigmaAt(S, st * Math.cos(ph), st * Math.sin(ph), ct, inner) * R * R * gw[i] * (TAU / np);
      if (s > 0) plus += s; else minus -= s;
    }
  }
  return { plus, minus };
}

// ─── equipotentials ───────────────────────────────────────────────────────
/** V on an (nx + 1) × (ny + 1) grid over the box: { v: Float64Array (row-major in x), nx, ny, box }. */
export function potentialGrid(S, box, nx, ny) {
  const v = new Float64Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    v[j * (nx + 1) + i] = potential(S, box.x0 + ((box.x1 - box.x0) * i) / nx, box.y0 + ((box.y1 - box.y0) * j) / ny, 0);
  }
  return { v, nx, ny, box };
}

/** Marching squares: the segments [[x0, y0, x1, y1], …] of the contour V = level. */
export function contour(grid, level) {
  const { v, nx, ny, box } = grid, segs = [];
  const X = (i) => box.x0 + ((box.x1 - box.x0) * i) / nx, Y = (j) => box.y0 + ((box.y1 - box.y0) * j) / ny;
  const at = (i, j) => v[j * (nx + 1) + i];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const c = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
    if (!c.every(Number.isFinite)) continue;
    const xy = [[X(i), Y(j)], [X(i + 1), Y(j)], [X(i + 1), Y(j + 1)], [X(i), Y(j + 1)]];
    const cut = [];
    for (let k = 0; k < 4; k++) {
      const a = c[k] - level, b = c[(k + 1) % 4] - level;
      if ((a < 0) !== (b < 0)) {
        const t = a / (a - b), P = xy[k], Q = xy[(k + 1) % 4];
        cut.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1]), k]);
      }
    }
    if (cut.length === 2) segs.push([cut[0][0], cut[0][1], cut[1][0], cut[1][1]]);
    else if (cut.length === 4) {
      // a saddle: decide by the value at the centre
      const mid = (c[0] + c[1] + c[2] + c[3]) / 4 - level, first = c[0] - level;
      if ((mid < 0) === (first < 0)) { segs.push([cut[0][0], cut[0][1], cut[1][0], cut[1][1]], [cut[2][0], cut[2][1], cut[3][0], cut[3][1]]); }
      else { segs.push([cut[0][0], cut[0][1], cut[3][0], cut[3][1]], [cut[1][0], cut[1][1], cut[2][0], cut[2][1]]); }
    }
  }
  return segs;
}

/** A tidy step for equipotentials: about `target` levels across the values in the grid (ignoring the extremes). */
export function niceStep(grid, target = 12) {
  const vals = Array.from(grid.v).filter(Number.isFinite).sort((a, b) => a - b);
  if (!vals.length) return 1;
  const lo = vals[Math.floor(vals.length * 0.04)], hi = vals[Math.floor(vals.length * 0.96)];
  const span = Math.max(hi - lo, 1e-30), raw = span / target, mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= target) || 10 * mag;
}

// ─── a charged particle ───────────────────────────────────────────────────
/**
 * The path of a particle { x, y, vx, vy, q, m } (SI) through the field, by RK4
 * with steps short in space and in speed change. It stops on leaving the box,
 * on reaching a source, or after tmax. Returns { t: [], pts: [[x, y]], v: [[vx, vy]], end }.
 */
export function trajectory(S, p, o = {}) {
  const box = o.box;
  const diag = box ? hyp(box.x1 - box.x0, box.y1 - box.y0) : 1;
  const ds = o.ds ?? diag / 1500, rHit = o.rHit ?? diag * 0.012, tmax = o.tmax ?? Infinity, maxSteps = o.maxSteps ?? 40000;
  const qm = p.q / p.m, E = [0, 0, 0];
  const acc = (x, y) => { field(S, x, y, 0, E); return [qm * E[0], qm * E[1]]; };
  let x = p.x, y = p.y, vx = p.vx || 0, vy = p.vy || 0, t = 0, end = 'steps';
  const out = { t: [0], pts: [[x, y]], v: [[vx, vy]], end };
  // one RK4 step of (x, y, vx, vy)
  const f = (sx, sy, svx, svy) => { const [qx, qy] = acc(sx, sy); return [svx, svy, qx, qy]; };
  const rk = (dt) => {
    const k1 = f(x, y, vx, vy);
    const k2 = f(x + (dt / 2) * k1[0], y + (dt / 2) * k1[1], vx + (dt / 2) * k1[2], vy + (dt / 2) * k1[3]);
    const k3 = f(x + (dt / 2) * k2[0], y + (dt / 2) * k2[1], vx + (dt / 2) * k2[2], vy + (dt / 2) * k2[3]);
    const k4 = f(x + dt * k3[0], y + dt * k3[1], vx + dt * k3[2], vy + dt * k3[3]);
    return [0, 1, 2, 3].map((i) => [x, y, vx, vy][i] + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };
  for (let step = 0; step < maxSteps; step++) {
    const [ax, ay] = acc(x, y), a = hyp(ax, ay), v = hyp(vx, vy);
    if (!Number.isFinite(a)) { end = 'hit'; break; }
    let dt = Math.min(v > 0 ? ds / v : Infinity, a > 0 ? Math.sqrt((2 * ds) / a) : Infinity, a > 0 && v > 0 ? (0.02 * v) / a + 1e-300 : Infinity);
    if (!Number.isFinite(dt)) { end = 'rest'; break; }
    if (t + dt > tmax) dt = tmax - t;
    const [nx, ny, nvx, nvy] = rk(dt);
    if (![nx, ny, nvx, nvy].every(Number.isFinite)) { end = 'hit'; break; }
    if (crossExtended(S, x, y, nx, ny)) {
      // a rod or a sheet in the way: shorten the step until it just reaches it
      let lo = 0, hi = dt;
      for (let it = 0; it < 50; it++) { const m = (lo + hi) / 2, q = rk(m); if (crossExtended(S, x, y, q[0], q[1])) hi = m; else lo = m; }
      // the step that stops just short of it (every RK4 stage on this side) gives the velocity
      const q = rk(lo), hit = crossExtended(S, x, y, ...rk(hi).slice(0, 2)) || { x: q[0], y: q[1] };
      out.t.push(t + lo); out.pts.push([hit.x, hit.y]); out.v.push([q[2], q[3]]);
      end = 'hit'; break;
    }
    x = nx; y = ny; vx = nvx; vy = nvy; t += dt;
    out.t.push(t); out.pts.push([x, y]); out.v.push([vx, vy]);
    if (S.conductor && region(S, x, y, 0) === 'metal') { end = 'hit'; break; }
    if (S.charges.some((c) => hyp(c.x - x, c.y - y) < rHit) || S.balls.some((b) => hyp(b.x - x, b.y - y) < b.R) || S.lines.some((l) => hyp(l.x - x, l.y - y) < rHit)) { end = 'hit'; break; }
    if (box && (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1)) { end = 'out'; break; }
    if (t >= tmax) { end = 'time'; break; }
  }
  out.end = end;
  return out;
}
