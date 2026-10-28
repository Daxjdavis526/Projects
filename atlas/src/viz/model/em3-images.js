// The method of images — the DOM-free model behind sims/em3-images.js,
// tested headlessly in test/em3-images.test.mjs. Everything is in SI units.
//
// Two conductors, each with one real point charge q outside it:
//   plane   the grounded plane y = 0, the charge at (x₀, d) with d > 0.
//           Image: −q at (x₀, −d).
//   sphere  a sphere of radius R centred at the origin, the charge at
//           distance a > R. Grounded: image q′ = −qR/a at distance R²/a
//           along the same line (Kelvin). Isolated and neutral: add +qR/a at
//           the centre, so the total induced charge is zero; isolated with
//           total charge Q: add Q + qR/a at the centre.
// The real charge plus its images give the potential and field everywhere
// outside the conductor — and nowhere else: inside the metal the true field
// is zero, and the images are bookkeeping, not charges. Points are in 3D
// (x, y, z); the pictures are the plane z = 0, which contains the charge and
// the axis of symmetry.

export const EPS0 = 8.8541878188e-12;
export const K = 1 / (4 * Math.PI * EPS0);

/** Build a scene. spec: { geometry, q, x, y, R, ground: 'grounded'|'neutral'|'charged', Q } (SI). */
export function scene({ geometry = 'plane', q = 1e-9, x = 0, y = 0.03, R = 0.03, ground = 'grounded', Q = 0 } = {}) {
  const S = { geometry, q, x, y, R, ground, Q, images: [] };
  if (geometry === 'plane') {
    S.images.push({ x, y: -y, q: -q });
  } else {
    const a = Math.hypot(x, y), f = (R * R) / (a * a);
    S.a = a;
    S.images.push({ x: f * x, y: f * y, q: (-q * R) / a });
    const qc = ground === 'grounded' ? 0 : ground === 'neutral' ? (q * R) / a : Q + (q * R) / a;
    if (qc) S.images.push({ x: 0, y: 0, q: qc, centre: true });
  }
  return S;
}

/** Is (x, y, z) in the region where the image solution holds (outside the metal)? */
export function outside(S, x, y, z = 0) {
  return S.geometry === 'plane' ? y >= 0 : x * x + y * y + z * z >= S.R * S.R;
}

const charges = (S) => [{ x: S.x, y: S.y, q: S.q }, ...S.images];

/** Potential (V) of the real charge plus its images at (x, y, z). Meaningful outside the metal only. */
export function potential(S, x, y, z = 0) {
  let v = 0;
  for (const c of charges(S)) v += (K * c.q) / Math.hypot(x - c.x, y - c.y, z);
  return v;
}

/** Field [Ex, Ey, Ez] (V/m) of the real charge plus its images. Pass real = false for the images alone. */
export function field(S, x, y, z = 0, { real = true } = {}) {
  const out = [0, 0, 0];
  for (const c of real ? charges(S) : S.images) {
    const dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy + z * z, f = (K * c.q) / (r2 * Math.sqrt(r2));
    out[0] += f * dx; out[1] += f * dy; out[2] += f * z;
  }
  return out;
}

/** The conductor's potential (V): zero when grounded; for an isolated sphere, that of its centre charge. */
export function conductorV(S) {
  if (S.geometry === 'plane' || S.ground === 'grounded') return 0;
  const c = S.images.find((i) => i.centre);
  return c ? (K * c.q) / S.R : 0;
}

/**
 * Surface charge density (C/m²). Plane: at the point (u, 0, w) of the plane.
 * Sphere: at the point R·n̂ of its surface, n̂ = (nx, ny, nz) a unit vector.
 */
export function sigma(S, u, w = 0, nz = 0) {
  if (S.geometry === 'plane') {
    const r2 = (u - S.x) ** 2 + w * w + S.y * S.y;
    return (-S.q * S.y) / (2 * Math.PI * r2 ** 1.5);
  }
  const nx = u, ny = w, a = S.a, R = S.R;
  const cosg = (nx * S.x + ny * S.y) / a;                 // angle between n̂ and the charge's direction
  const d2 = R * R + a * a - 2 * a * R * cosg;
  let s = (-S.q * (a * a - R * R)) / (4 * Math.PI * R * d2 ** 1.5);
  const c = S.images.find((i) => i.centre);
  if (c) s += c.q / (4 * Math.PI * R * R);
  return s;
}

/** The total charge induced on the conductor (C). */
export function induced(S) {
  if (S.geometry === 'plane') return -S.q;
  return S.ground === 'grounded' ? (-S.q * S.R) / S.a : S.ground === 'neutral' ? 0 : S.Q;
}

/** The force on the real charge (N), from its images: [Fx, Fy]. */
export function force(S) {
  const E = field(S, S.x, S.y, 0, { real: false });
  return [S.q * E[0], S.q * E[1]];
}

/** Work (J) to bring the charge in from infinity to where it is (plane: −q²/(16πε₀d), half the image pair's energy). */
export function workIn(S) {
  if (S.geometry === 'plane') return (-K * S.q * S.q) / (4 * S.y);
  if (S.ground === 'grounded') { const a = S.a, R = S.R; return (-K * S.q * S.q * R) / (2 * (a * a - R * R)); }
  return NaN;
}

/**
 * A field line in the plane z = 0, from (x, y) in direction sign (+1 along E,
 * −1 against it), traced by RK4 with steps shrinking near charges. Stops on
 * the conductor (unless through: true), at the box [x0, x1] × [y0, y1], or
 * near a charge. Returns { pts, end: 'conductor' | 'out' | 'charge' | 'steps' }.
 */
export function line(S, x, y, sign, box, { through = false, ds = 0.002, max = 4000 } = {}) {
  const pts = [[x, y]];
  const stops = through ? charges(S) : [{ x: S.x, y: S.y, q: S.q }];
  const dir = (px, py) => { const E = field(S, px, py); const m = Math.hypot(E[0], E[1]) || 1; return [(sign * E[0]) / m, (sign * E[1]) / m]; };
  let px = x, py = y, end = 'steps';
  for (let k = 0; k < max; k++) {
    let near = Infinity;
    for (const c of charges(S)) near = Math.min(near, Math.hypot(px - c.x, py - c.y));
    const h = Math.max(ds * 0.05, Math.min(ds, near * 0.2));
    const k1 = dir(px, py), k2 = dir(px + (h * k1[0]) / 2, py + (h * k1[1]) / 2), k3 = dir(px + (h * k2[0]) / 2, py + (h * k2[1]) / 2), k4 = dir(px + h * k3[0], py + h * k3[1]);
    let nx = px + (h * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])) / 6, ny = py + (h * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])) / 6;
    if (!through && !outside(S, nx, ny)) {
      // land on the surface
      if (S.geometry === 'plane') { const t = py / (py - ny); nx = px + t * (nx - px); ny = 0; }
      else { const m = Math.hypot(nx, ny); nx = (nx * S.R) / m; ny = (ny * S.R) / m; }
      pts.push([nx, ny]); end = 'conductor'; break;
    }
    px = nx; py = ny; pts.push([px, py]);
    if (px < box[0] || px > box[1] || py < box[2] || py > box[3]) { end = 'out'; break; }
    if (k > 5 && stops.some((c) => Math.hypot(px - c.x, py - c.y) < ds * 0.4)) { end = 'charge'; break; }
  }
  return { pts, end };
}

/**
 * Starting directions for n field lines per side leaving the real charge,
 * spaced by equal flux in 3D (equal solid angle about the symmetry axis), so
 * the number of lines landing on the conductor follows the induced charge.
 * Returns unit vectors in the plane z = 0.
 */
export function starts(S, n) {
  // the axis: from the charge toward the plane's foot or the sphere's centre
  const ax = S.geometry === 'plane' ? [0, -1] : [-S.x / S.a, -S.y / S.a];
  const out = [];
  for (let k = 0; k < n; k++) {
    const c = 1 - (2 * (k + 0.5)) / n, s = Math.sqrt(1 - c * c);
    for (const side of [1, -1]) out.push([c * ax[0] - side * s * ax[1], c * ax[1] + side * s * ax[0]]);
  }
  return out;
}
