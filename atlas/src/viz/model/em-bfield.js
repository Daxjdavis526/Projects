// Magnetic fields of steady currents, in the plane of the page — the physics
// behind the em-bfield simulation (sims/em-bfield.js). DOM-free; tested
// headlessly in test/em-bfield.test.mjs. Lengths in metres, currents in
// amperes, fields in tesla.
//
// Two kinds of scene:
//  • straight wires perpendicular to the page (I > 0 out of the page), plus an
//    optional uniform field: B = μ₀I/(2πr) round each wire, exact; field lines
//    are the contours of A_z = −Σ μ₀I/(2π) ln r (+ B_x y − B_y x);
//  • circular loops sharing one axis — the page's x-axis — seen cut through
//    their axis (a single loop, a pair, a solenoid). Each loop crosses the page
//    twice: out of the page at y = +R and into it at y = −R for I > 0, which
//    makes B point along +x on the axis. The field is exact, from complete
//    elliptic integrals (computed by the arithmetic–geometric mean); field
//    lines are the contours of the flux function ψ = ρA_φ.
// Plus the circulation ∮B·dl round any closed path, the current it encloses
// (Ampère's law: the two agree, times μ₀), and the force per length that each
// wire feels from the others.

export const MU0 = 1.25663706127e-6;          // T·m/A, CODATA 2022 (4π×10⁻⁷ to 9 figures)
const TAU = 2 * Math.PI;

/** Complete elliptic integrals K(m) and E(m), parameter m = k², 0 ≤ m < 1 (AGM). */
export function ellipKE(m) {
  let a = 1, b = Math.sqrt(1 - m), c = Math.sqrt(m), sum = 0.5 * c * c, p = 1;
  for (let i = 0; i < 40 && Math.abs(c) > 1e-16; i++) {
    const an = (a + b) / 2, bn = Math.sqrt(a * b);
    c = (a - b) / 2; p *= 2; sum += p * c * c * 0.5;
    a = an; b = bn;
  }
  const K = Math.PI / (2 * a);
  return [K, K * (1 - sum)];
}

// ─── straight wires ─────────────────────────────────────────────────────────
/** Field of a long straight wire through (x0, y0), current I out of the page. */
export function wireB(I, x0, y0, x, y) {
  const dx = x - x0, dy = y - y0, r2 = dx * dx + dy * dy;
  const k = (MU0 * I) / (TAU * r2);
  return [-k * dy, k * dx];
}
/** Its flux function A_z (field lines are its contours). */
export const wirePsi = (I, x0, y0, x, y) => -((MU0 * I) / TAU) * 0.5 * Math.log((x - x0) ** 2 + (y - y0) ** 2);

// ─── circular loops on the x-axis ──────────────────────────────────────────
/**
 * Field of a circular loop of radius a centred at z0 on the axis, current I
 * (positive: B along +z on the axis), at axial position z and distance ρ ≥ 0
 * from the axis: [B_z, B_ρ].
 */
export function loopB(I, a, z0, z, rho) {
  const dz = z - z0, C = (MU0 * I) / Math.PI;
  if (rho < 1e-9 * a) return [(MU0 * I * a * a) / (2 * (a * a + dz * dz) ** 1.5), 0];
  const al2 = (a - rho) ** 2 + dz * dz, be2 = (a + rho) ** 2 + dz * dz, be = Math.sqrt(be2);
  const m = Math.min(1 - 1e-15, 1 - al2 / be2);
  const [K, E] = ellipKE(m);
  const Bz = (C / (2 * al2 * be)) * ((a * a - rho * rho - dz * dz) * E + al2 * K);
  const Br = ((C * dz) / (2 * al2 * be * rho)) * ((a * a + rho * rho + dz * dz) * E - al2 * K);
  return [Bz, Br];
}
/** Flux function ψ = ρA_φ of the loop: B_z = (1/ρ)∂ψ/∂ρ, B_ρ = −(1/ρ)∂ψ/∂z. */
export function loopPsi(I, a, z0, z, rho) {
  if (rho <= 0) return 0;
  const dz = z - z0, be2 = (a + rho) ** 2 + dz * dz, m = Math.min(1 - 1e-15, (4 * a * rho) / be2);
  const k = Math.sqrt(m);
  // (1 − m/2)K − E, by its series near the axis (where the two terms nearly cancel)
  let f;
  if (m < 1e-3) f = (Math.PI / 32) * m * m * (1 + 0.75 * m);
  else { const [K, E] = ellipKE(m); f = (1 - m / 2) * K - E; }
  return rho * ((MU0 * I) / (Math.PI * k)) * Math.sqrt(a / rho) * f;
}

// ─── scenes ─────────────────────────────────────────────────────────────────
/** A solenoid from x0 to x1: N loops of radius R and current I, each centred in its own slice of length (x1 − x0)/N, so n = N/(x1 − x0). */
export function solenoidLoops({ x0, x1, R, N, I }) {
  return Array.from({ length: N }, (_, k) => ({ x: x0 + ((x1 - x0) * (k + 0.5)) / N, R, I }));
}
/** A toroid cut through its middle: N wires out of the page on radius a, N into it on radius b. */
export function toroidWires({ x = 0, y = 0, a, b, N, I }) {
  const out = [];
  for (let k = 0; k < N; k++) {
    const t = (TAU * (k + 0.5)) / N;
    out.push({ x: x + a * Math.cos(t), y: y + a * Math.sin(t), I }, { x: x + b * Math.cos(t), y: y + b * Math.sin(t), I: -I });
  }
  return out;
}

/** A scene from { wires: [{ x, y, I }], loops: [{ x, R, I }], uniform: [Bx, By] } (SI). */
export function scene({ wires = [], loops = [], uniform = null } = {}) {
  return { wires: wires.map((w) => ({ ...w })), loops: loops.map((l) => ({ ...l })), uniform: uniform ? [...uniform] : null };
}

/** The field at (x, y) in the page. */
export function field(S, x, y) {
  let Bx = 0, By = 0;
  for (const w of S.wires) { const b = wireB(w.I, w.x, w.y, x, y); Bx += b[0]; By += b[1]; }
  if (S.loops.length) {
    const rho = Math.abs(y), s = y < 0 ? -1 : 1;
    for (const l of S.loops) { const [bz, br] = loopB(l.I, l.R, l.x, x, rho); Bx += bz; By += s * br; }
  }
  if (S.uniform) { Bx += S.uniform[0]; By += S.uniform[1]; }
  return [Bx, By];
}
/** The flux function whose contours are the field lines. */
export function psi(S, x, y) {
  let p = 0;
  for (const w of S.wires) p += wirePsi(w.I, w.x, w.y, x, y);
  for (const l of S.loops) p += loopPsi(l.I, l.R, l.x, x, Math.abs(y));
  if (S.uniform) p += S.uniform[0] * y - S.uniform[1] * x;
  return p;
}

/** Points where currents cross the page: [{ x, y, I }] (I > 0 out of the page). */
export function crossings(S) {
  return [...S.wires.map((w) => ({ x: w.x, y: w.y, I: w.I })), ...S.loops.flatMap((l) => [{ x: l.x, y: l.R, I: l.I }, { x: l.x, y: -l.R, I: -l.I }])];
}

// ─── Ampère's law ───────────────────────────────────────────────────────────
/** A closed path, anticlockwise, as n points: a circle, a square or a lumpy blob of size r about (cx, cy). */
export function pathOf(shape, cx, cy, r, n = 720) {
  const pts = [];
  if (shape === 'square') {
    const c = [[r, -r], [r, r], [-r, r], [-r, -r]];
    const per = Math.max(1, Math.floor(n / 4));
    for (let s = 0; s < 4; s++) {
      const [x0, y0] = c[s], [x1, y1] = c[(s + 1) % 4];
      for (let k = 0; k < per; k++) pts.push([cx + x0 + ((x1 - x0) * k) / per, cy + y0 + ((y1 - y0) * k) / per]);
    }
    return pts;
  }
  for (let k = 0; k < n; k++) {
    const t = (TAU * k) / n, rr = shape === 'lumpy' ? r * (1 + 0.22 * Math.sin(3 * t) + 0.12 * Math.cos(5 * t + 0.6)) : r;
    pts.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
  }
  return pts;
}
/** ∮B·dl round a closed polyline (Simpson's rule on each segment). */
export function circulation(S, path) {
  let sum = 0;
  for (let k = 0; k < path.length; k++) {
    const [x0, y0] = path[k], [x1, y1] = path[(k + 1) % path.length];
    const b0 = field(S, x0, y0), bm = field(S, (x0 + x1) / 2, (y0 + y1) / 2), b1 = field(S, x1, y1);
    const dx = x1 - x0, dy = y1 - y0;
    sum += ((b0[0] + 4 * bm[0] + b1[0]) * dx + (b0[1] + 4 * bm[1] + b1[1]) * dy) / 6;
  }
  return sum;
}
/** Is (x, y) inside the closed polyline? */
export function inside(path, x, y) {
  let c = false;
  for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
    const [xi, yi] = path[i], [xj, yj] = path[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
/** The net current through the path (out of the page counts positive for an anticlockwise path). */
export function enclosed(S, path) {
  return crossings(S).reduce((s, c) => s + (inside(path, c.x, c.y) ? c.I : 0), 0);
}
/** The smallest distance from a crossing to the path, so callers can tell when a wire sits on it. */
export function nearest(S, path) {
  let best = Infinity;
  for (const c of crossings(S)) for (const [x, y] of path) best = Math.min(best, Math.hypot(x - c.x, y - c.y));
  return best;
}

// ─── forces between wires ───────────────────────────────────────────────────
/** Force per unit length on wire j from every other source: I_j ẑ × B. */
export function forcePerLength(S, j) {
  const w = S.wires[j];
  const others = scene({ wires: S.wires.filter((_, k) => k !== j), loops: S.loops, uniform: S.uniform });
  const [Bx, By] = field(others, w.x, w.y);
  return [-w.I * By, w.I * Bx];
}
/** Two long parallel wires: F/L = μ₀I₁I₂/(2πd). */
export const parallelForce = (I1, I2, d) => (MU0 * I1 * I2) / (TAU * d);
