// Uniformly magnetized (or polarized) bodies, exactly: a cylinder of radius a
// and length L, or a sphere of radius a, magnetized uniformly along its axis
// (z). Lengths are in units of a; fields in units of the magnetization:
//   B in units of μ₀M,  H and M in units of M     (a magnet), or
//   D in units of P,    ε₀E and P in units of P   (an electret: the same
//                                                   mathematics, ε₀E ↔ H, D ↔ B/μ₀)
// The cylinder's B is the field of its bound surface current K_b = M × n̂ = M φ̂
// — a finite solenoid — in the closed form of Derby & Olbert (Am. J. Phys.
// 78, 229, 2010), which uses Bulirsch's complete elliptic integral cel; the
// sphere's is 2/3 inside and a pure dipole outside. H = B/μ₀ − M. Because a
// polarized body's E comes from bound charge σ_b = P·n̂ exactly as a magnet's H
// comes from the "pole density" M·n̂, ε₀E of an electret is H of the magnet,
// and D = ε₀E + P is μ₀⁻¹B. Field lines are traced by RK4 in the plane
// through the axis (x across, z along). DOM-free; tested in
// test/em3h-magnet.test.mjs.

/** Bulirsch's general complete elliptic integral cel(kc, p, c, s). */
export function cel(kc, p, c, s) {
  if (kc === 0) return NaN;
  const errtol = 1e-12;
  let k = Math.abs(kc), pp = p, cc = c, ss = s, em = 1;
  if (p > 0) { pp = Math.sqrt(p); ss = s / pp; }
  else {
    let f = kc * kc, q = 1 - f;
    const g = 1 - pp;
    f -= pp; q *= ss - c * pp;
    pp = Math.sqrt(f / g); cc = (c - ss) / g; ss = -q / (g * g * pp) + cc * pp;
  }
  let f = cc;
  cc += ss / pp;
  let g = k / pp;
  ss = 2 * (ss + f * g);
  pp += g; g = em; em += k;
  let kk = k;
  for (let i = 0; i < 60 && Math.abs(g - k) > g * errtol; i++) {
    k = 2 * Math.sqrt(kk); kk = k * em;
    f = cc; cc += ss / pp; g = kk / pp; ss = 2 * (ss + f * g); pp += g; g = em; em += k;
  }
  return (Math.PI / 2) * (ss + cc * em) / (em * (em + pp));
}

/**
 * B of a finite solenoid (radius a, half-length b, surface current K) at
 * cylindrical (ρ ≥ 0, z), in units of μ₀K: [B_ρ, B_z].
 */
export function solenoidB(a, b, rho, z) {
  const B0 = 1 / Math.PI;
  const zp = z + b, zm = z - b, sp = a + rho;
  const dp = Math.sqrt(zp * zp + sp * sp), dm = Math.sqrt(zm * zm + sp * sp);
  const ap = a / dp, am = a / dm, bp = zp / dp, bm = zm / dm;
  const gam = (a - rho) / (a + rho);
  const kp = Math.sqrt((zp * zp + (a - rho) ** 2) / (zp * zp + sp * sp));
  const km = Math.sqrt((zm * zm + (a - rho) ** 2) / (zm * zm + sp * sp));
  const Br = B0 * (ap * cel(kp, 1, 1, -1) - am * cel(km, 1, 1, -1));
  const Bz = ((B0 * a) / (a + rho)) * (bp * cel(kp, gam * gam, 1, gam) - bm * cel(km, gam * gam, 1, gam));
  return [Br, Bz];
}

/** A body: { shape: 'cylinder' | 'sphere', ratio: L/D (cylinder) }. Lengths in units of the radius. */
export function body({ shape = 'cylinder', ratio = 1 } = {}) {
  return shape === 'sphere' ? { shape, a: 1, L: 2, half: 1 } : { shape, a: 1, L: 2 * ratio, half: ratio, ratio };
}

/** Is (x, z) inside the body? */
export function inside(S, x, z) {
  if (S.shape === 'sphere') return x * x + z * z < 1;
  return Math.abs(x) < 1 && Math.abs(z) < S.half;
}

/** B / μ₀M at (x, z) in the plane through the axis: [B_x, B_z]. */
export function B(S, x, z) {
  if (S.shape === 'sphere') {
    if (x * x + z * z < 1) return [0, 2 / 3];
    const r2 = x * x + z * z, r5 = r2 ** 2.5;
    // dipole of moment (4/3)π a³ M ẑ: B/μ₀M = (a³/3)(3(ẑ·r̂)r̂ − ẑ)/r³
    return [(x * z) / r5, (3 * z * z - r2) / (3 * r5)];
  }
  const rho = Math.abs(x), [Br, Bz] = solenoidB(1, S.half, rho, z);
  return [x < 0 ? -Br : Br, Bz];
}

/** M / M at (x, z): ẑ inside, 0 outside. */
export const M = (S, x, z) => (inside(S, x, z) ? [0, 1] : [0, 0]);

/** H / M = B/μ₀M − M/M. */
export function H(S, x, z) {
  const b = B(S, x, z), m = M(S, x, z);
  return [b[0] - m[0], b[1] - m[1]];
}

/** The field of a view: B, H or M (a magnet); D, E (ε₀E) or P (an electret) — D ≡ B, E ≡ H, P ≡ M. */
export function field(S, which, x, z) {
  if (which === 'B' || which === 'D') return B(S, x, z);
  if (which === 'H' || which === 'E') return H(S, x, z);
  return M(S, x, z);
}

/** The demagnetizing (depolarizing) factor at the centre: H(0) = −N M. Cylinder: 1 − L/√(L² + D²); sphere: 1/3. */
export function centreN(S) {
  if (S.shape === 'sphere') return 1 / 3;
  return 1 - S.L / Math.sqrt(S.L * S.L + 4);
}

/** B/μ₀M on the axis of the cylinder at height z (closed form, for checks). */
export function axisB(S, z) {
  if (S.shape === 'sphere') return Math.abs(z) < 1 ? 2 / 3 : 2 / (3 * Math.abs(z) ** 3);
  const h = S.half, u = z + h, v = z - h;
  return 0.5 * (u / Math.sqrt(u * u + 1) - v / Math.sqrt(v * v + 1));
}

/** Flux of B/μ₀M up through the disc of radius ρ in the plane z (by Gauss–Legendre on ρ). */
export function fluxUp(S, rho, z = 0) {
  const n = 48;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const r = ((i + 0.5) / n) * rho;
    s += B(S, r, z)[1] * 2 * Math.PI * r * (rho / n);
  }
  return s;
}

/**
 * Seeds for field lines in the right half (x ≥ 0, the first on the axis),
 * mirrored by the caller: B (or D) lines start on the midplane inside the
 * body, spaced by equal flux in 3D; H (or E) lines start on the north face
 * (or hemisphere), spaced by equal pole density M·n̂.
 */
export function seeds(S, which, n) {
  const out = [];
  if (which === 'B' || which === 'D') {
    // equal flux through the midplane disc: invert Φ(ρ) by bisection
    const tot = fluxUp(S, 1);
    for (let i = 0; i < n; i++) {
      if (i === 0) { out.push([0, 0]); continue; }
      const target = (i / n) * tot;
      let lo = 0, hi = 1;
      for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (fluxUp(S, mid) < target) lo = mid; else hi = mid; }
      out.push([(lo + hi) / 2, 0]);
    }
  } else if (S.shape === 'sphere') {
    // σ_m = M cos θ on the northern hemisphere: equal charge in each band, ∫ cos θ sin θ dθ ∝ sin²θ
    for (let i = 0; i < n; i++) { const s2 = i / n, th = Math.asin(Math.sqrt(s2)); out.push([Math.sin(th), Math.cos(th)]); }
  } else {
    // uniform σ_m = M on the flat face: equal charge in each ring, ρ ∝ √
    for (let i = 0; i < n; i++) out.push([Math.sqrt(i / n), S.half]);
  }
  return out;
}

/**
 * Trace a field line from (x0, z0) along sign × the field `which`, by RK4 on
 * the unit direction with step ds, inside box [x0, x1, z0, z1]. Stops when it
 * leaves the box, returns to its start (closed), or — for H/E lines — when it
 * reaches a face carrying the opposite pole density. Returns { pts, end }.
 */
export function trace(S, which, x0, z0, sign, box, { ds = 0.02, max = 4000 } = {}) {
  const pts = [[x0, z0]];
  const dir = (x, z) => {
    const f = field(S, which, x, z), m = Math.hypot(f[0], f[1]);
    return m > 1e-14 ? [(sign * f[0]) / m, (sign * f[1]) / m] : [0, 0];
  };
  const hLine = which === 'H' || which === 'E';
  let x = x0, z = z0, travelled = 0, end = 'max';
  // does the step (x, z) → (px, pz) reach the south pole density (where H lines end)?
  const southCross = (px, pz) => {
    if (S.shape === 'sphere') return inside(S, x, z) !== inside(S, px, pz) && (z + pz) / 2 < 0;
    return (Math.abs(z) < S.half) !== (Math.abs(pz) < S.half) && Math.min(Math.abs(x), Math.abs(px)) < 1 && (z + pz) / 2 < 0;
  };
  for (let i = 0; i < max; i++) {
    const k1 = dir(x, z);
    if (k1[0] === 0 && k1[1] === 0) { end = 'stall'; break; }
    // an H line ends on the south face (cylinder) or southern hemisphere (sphere); H flips there, so test the
    // plain Euler step before RK4 averages directions from both sides of the jump
    if (hLine && i > 2 && southCross(x + ds * k1[0], z + ds * k1[1])) { pts.push([x + ds * k1[0], z + ds * k1[1]]); end = 'pole'; break; }
    const k2 = dir(x + (ds / 2) * k1[0], z + (ds / 2) * k1[1]);
    const k3 = dir(x + (ds / 2) * k2[0], z + (ds / 2) * k2[1]), k4 = dir(x + ds * k3[0], z + ds * k3[1]);
    const nx = x + (ds / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), nz = z + (ds / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (hLine && i > 2 && southCross(nx, nz)) { pts.push([nx, nz]); end = 'pole'; break; }
    x = nx; z = nz; travelled += ds;
    pts.push([x, z]);
    if (x < box[0] || x > box[1] || z < box[2] || z > box[3]) { end = 'box'; break; }
    if (travelled > 4 * ds && Math.hypot(x - x0, z - z0) < 0.75 * ds) { pts.push([x0, z0]); end = 'closed'; break; }
  }
  return { pts, end };
}

/** Physical constants for readouts. */
export const MU0 = 1.25663706127e-6;   // N/A², CODATA 2022
export const EPS0 = 8.8541878188e-12;  // F/m, CODATA 2022
