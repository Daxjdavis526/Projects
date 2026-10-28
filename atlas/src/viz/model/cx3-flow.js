// Ideal (inviscid, incompressible, irrotational) 2D flow past a circular
// cylinder and past a Joukowski airfoil, DOM-free. Used by sims/cx3-flow.js;
// tested headlessly in test/cx3-flow.test.mjs.
//
// The circle plane z: a cylinder of radius R centred at c₀, in a stream of
// speed U at angle of attack α, with clockwise circulation Γ (Γ > 0 lifts a
// flow running left to right). Its complex potential is
//   W(z) = U[(z − c₀)e^{−iα} + R²e^{iα}/(z − c₀)] + (iΓ/2π) log(z − c₀),
// and u − iv = dW/dz. The stream function ψ = Im W is single-valued (the
// logarithm contributes (Γ/2π) ln|z − c₀|), and the body is the streamline
// ψ = (Γ/2π) ln R.
//
// The airfoil plane ζ = J(z) = z + 1/z (Joukowski). A circle through z = 1,
// the critical point of J, with its centre at c₀ = (−m_x, m_y), maps to an
// airfoil with a cusped trailing edge at ζ = 2: m_x sets the thickness and
// m_y the camber. The flow in ζ is the same potential composed with J⁻¹;
// velocities are dW/dζ = (dW/dz)/J′(z), which is infinite at the trailing
// edge unless dW/dz = 0 there — the Kutta condition, which fixes
//   Γ = 4πUR sin(α + β),   β = atan2(m_y, 1 + m_x).
// The lift per unit span is ρUΓ (Kutta–Joukowski); the drag is zero
// (d'Alembert), which liftAndDrag confirms by Blasius's integral.

const TAU = 2 * Math.PI;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const scale = (a, s) => [a[0] * s, a[1] * s];
export const conj = (a) => [a[0], -a[1]];
export const abs = (a) => Math.hypot(a[0], a[1]);
export const cis = (t) => [Math.cos(t), Math.sin(t)];
export function div(a, b) {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
}
export function csqrt(a) {
  const r = abs(a);
  const re = Math.sqrt(Math.max(0, (r + a[0]) / 2)), im = Math.sqrt(Math.max(0, (r - a[0]) / 2));
  return [re, a[1] < 0 ? -im : im];
}

/** The Joukowski map and its derivative. */
export const J = (z) => add(z, div([1, 0], z));
export const dJ = (z) => sub([1, 0], div([1, 0], mul(z, z)));

/** The circle for an airfoil: centre c₀ = (−mx, my), radius through z = 1, and its angle β (the zero-lift angle is −β). */
export function circleFor(mx, my) {
  const c0 = [-mx, my];
  return { c0, R: Math.hypot(1 + mx, my), beta: Math.atan2(my, 1 + mx) };
}

/** The circulation that satisfies the Kutta condition. */
export const kuttaGamma = (U, R, alpha, beta) => 4 * Math.PI * U * R * Math.sin(alpha + beta);

/**
 * A flow: { U, alpha (radians), c0, R, Gamma, map: 'joukowski' | 'none' }.
 * W, dW (= u − iv in the circle plane) and ψ at a point z of the circle plane.
 */
export function W(z, F) {
  const Z = sub(z, F.c0), e = cis(-F.alpha), ei = cis(F.alpha);
  const uni = scale(add(mul(Z, e), div(scale(ei, F.R * F.R), Z)), F.U);
  const lg = [Math.log(abs(Z)), Math.atan2(Z[1], Z[0])];
  return add(uni, mul([0, F.Gamma / TAU], lg));
}
export function dW(z, F) {
  const Z = sub(z, F.c0), e = cis(-F.alpha), ei = cis(F.alpha);
  const d = scale(sub(e, div(scale(ei, F.R * F.R), mul(Z, Z))), F.U);
  return add(d, div([0, F.Gamma / TAU], Z));
}
export function psi(z, F) {
  const Z = sub(z, F.c0), ei = cis(F.alpha);
  // Im[U(Z e^{−iα} + R² e^{iα}/Z)] + (Γ/2π) ln|Z|
  const r2 = Z[0] * Z[0] + Z[1] * Z[1];
  const a = Z[1] * ei[0] - Z[0] * ei[1];                 // Im(Z e^{−iα})
  const b = (F.R * F.R * (ei[1] * Z[0] - ei[0] * Z[1])) / r2;   // Im(R² e^{iα} Z̄)/|Z|²
  return F.U * (a + b) + (F.Gamma / TAU) * 0.5 * Math.log(r2);
}
export const psiBody = (F) => (F.Gamma / TAU) * Math.log(F.R);

/** The map from the circle plane to the plane the flow is shown in. */
export const mapOf = (F) => (F.map === 'joukowski' ? J : (z) => z);
export const dmapOf = (F) => (F.map === 'joukowski' ? dJ : () => [1, 0]);

/** The velocity (u, v) in the shown plane at the image of z: conj(dW/dz ÷ map′). */
export function velocity(z, F) {
  const w = div(dW(z, F), dmapOf(F)(z));
  return [w[0], -w[1]];
}

/**
 * The preimage z (outside the body circle) of a point ζ of the shown plane.
 * For J, z = (ζ ± √(ζ² − 4))/2: the two roots multiply to 1, and the one
 * outside the circle is the flow's.
 */
export function inverse(zeta, F) {
  if (F.map !== 'joukowski') return zeta;
  const s = csqrt(sub(mul(zeta, zeta), [4, 0]));
  const a = scale(add(zeta, s), 0.5), b = scale(sub(zeta, s), 0.5);
  const da = abs(sub(a, F.c0)), db = abs(sub(b, F.c0));
  return da >= db ? a : b;
}
/** Whether the point ζ of the shown plane lies inside the body. */
export const inside = (zeta, F) => abs(sub(inverse(zeta, F), F.c0)) < F.R * (1 - 1e-9);

/**
 * Stagnation points: the zeros of dW/dz outside (or on) the circle, as
 * circle-plane points. U e^{−iα} Z² + (iΓ/2π) Z − U R² e^{iα} = 0.
 */
export function stagnation(F) {
  const a = scale(cis(-F.alpha), F.U), b = [0, F.Gamma / TAU], c = scale(cis(F.alpha), -F.U * F.R * F.R);
  const disc = csqrt(sub(mul(b, b), scale(mul(a, c), 4)));
  const roots = [div(add(scale(b, -1), disc), scale(a, 2)), div(sub(scale(b, -1), disc), scale(a, 2))];
  return roots.filter((Z) => abs(Z) >= F.R * (1 - 1e-7)).map((Z) => add(Z, F.c0));
}

/** The body's outline in the shown plane (n + 1 points, closed). */
export function body(F, n = 360) {
  const m = mapOf(F), out = [];
  for (let k = 0; k <= n; k++) out.push(m(add(F.c0, scale(cis((TAU * k) / n), F.R))));
  return out;
}

/** The chord of the shown body: from the trailing edge to the farthest point of the outline (the cylinder's diameter). */
export function chord(F) {
  if (F.map !== 'joukowski') return 2 * F.R;
  const te = [2, 0];
  return Math.max(...body(F, 2000).map((p) => abs(sub(p, te))));
}

/** The speed on the body (in the shown plane) at the circle point at angle θ. */
export function surfaceSpeed(theta, F) {
  const z = add(F.c0, scale(cis(theta), F.R * (1 + 1e-9)));
  return abs(velocity(z, F));
}

/**
 * Streamlines as polylines in the circle plane: ψ = ψ_body + kΔψ for
 * k = −n … n, traced by marching squares on a grid in (ln ρ, θ) about c₀, so
 * cells are small near the body where the flow bends most. Each polyline is
 * returned with its level index k.
 */
export function streamlines(F, { n = 9, dpsi = 0.35, rmax = 9, nr = 90, nth = 200 } = {}) {
  const s0 = Math.log(F.R), s1 = Math.log(rmax * F.R);
  const grid = [];
  for (let i = 0; i <= nr; i++) {
    const s = s0 + ((s1 - s0) * i) / nr, rho = Math.exp(s), row = [];
    for (let j = 0; j <= nth; j++) row.push(psi(add(F.c0, scale(cis(-Math.PI + (TAU * j) / nth), rho)), F));
    grid.push(row);
  }
  const g = { x0: s0, x1: s1, y0: -Math.PI, y1: Math.PI, nx: nr, ny: nth, z: grid };
  const base = psiBody(F), out = [];
  for (let k = -n; k <= n; k++) {
    // the body streamline itself is drawn as the body; nudge k = 0 off the wall so the dividing streamline shows
    const c = base + (k === 0 ? 1e-6 * F.U * F.R : k * dpsi * F.U * F.R);
    for (const line of joinSegs(segments(g, c))) out.push({ k, pts: line.map(([s, th]) => add(F.c0, scale(cis(th), Math.exp(s)))) });
  }
  return out;
}

// marching squares (a small copy, so this model has no dependencies)
function segments(grid, c) {
  const { x0, x1, y0, y1, nx, ny, z } = grid, dx = (x1 - x0) / nx, dy = (y1 - y0) / ny, segs = [];
  const E = [[0, 1], [1, 2], [2, 3], [3, 0]];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
    const v = q.map(([a, b]) => (z[a][b] === c ? c + 1e-12 : z[a][b]));
    if (v.some((w) => !Number.isFinite(w))) continue;
    const cross = [];
    for (const [a0, b0] of E) {
      if ((v[a0] - c) * (v[b0] - c) < 0) {
        const [a, b] = q[a0][0] + q[a0][1] < q[b0][0] + q[b0][1] ? [a0, b0] : [b0, a0];
        const s = (c - v[a]) / (v[b] - v[a]);
        cross.push([x0 + (q[a][0] + (q[b][0] - q[a][0]) * s) * dx, y0 + (q[a][1] + (q[b][1] - q[a][1]) * s) * dy]);
      }
    }
    if (cross.length === 2) segs.push(cross);
    else if (cross.length === 4) {
      const centre = (v[0] + v[1] + v[2] + v[3]) / 4;
      if ((centre - c) * (v[0] - c) > 0) segs.push([cross[0], cross[1]], [cross[2], cross[3]]);
      else segs.push([cross[0], cross[3]], [cross[1], cross[2]]);
    }
  }
  return segs;
}
function joinSegs(segs) {
  const key = (p) => `${p[0]},${p[1]}`, ends = new Map(), used = new Array(segs.length).fill(false);
  segs.forEach((s, k) => { for (const p of s) { const kk = key(p); if (!ends.has(kk)) ends.set(kk, []); ends.get(kk).push(k); } });
  const next = (p) => (ends.get(key(p)) || []).find((k) => !used[k]);
  const lines = [];
  for (let k = 0; k < segs.length; k++) {
    if (used[k]) continue;
    used[k] = true;
    const line = [segs[k][0], segs[k][1]];
    for (const dir of [1, -1]) for (;;) {
      const end = dir === 1 ? line[line.length - 1] : line[0], m = next(end);
      if (m === undefined) break;
      used[m] = true;
      const p = key(segs[m][0]) === key(end) ? segs[m][1] : segs[m][0];
      if (dir === 1) line.push(p); else line.unshift(p);
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Advance a fluid parcel, tracked by its circle-plane point z, through time
 * dt (RK4). In the shown plane it moves with velocity V = conj(dW/dζ), so
 * dz/dt = V / map′(z) as complex numbers.
 */
export function advect(z, F, dt) {
  const rate = (p) => { const m = dmapOf(F)(p), V = conj(div(dW(p, F), m)); return div(V, m); };
  const k1 = rate(z), k2 = rate(add(z, scale(k1, dt / 2))), k3 = rate(add(z, scale(k2, dt / 2))), k4 = rate(add(z, scale(k3, dt)));
  const next = add(z, scale(add(add(k1, scale(k2, 2)), add(scale(k3, 2), k4)), dt / 6));
  // a parcel may not cross into the body (round-off near a stagnation point)
  const Z = sub(next, F.c0), r = abs(Z);
  return r < F.R * 1.0005 ? add(F.c0, scale(Z, (F.R * 1.0005) / r)) : next;
}

/**
 * The force per unit span on the body by Blasius's theorem,
 * F_x − iF_y = (iρ/2) ∮ (dW/dζ)² dζ, evaluated on the circle |z − c₀| = kR
 * of the circle plane (dζ = map′ dz). Returns { lift, drag } relative to the
 * stream: drag along the free stream, lift perpendicular to it (positive
 * to the stream's left).
 */
export function liftAndDrag(F, rho = 1, n = 4000, k = 1.7) {
  let I = [0, 0];
  for (let j = 0; j < n; j++) {
    const th = (TAU * (j + 0.5)) / n, z = add(F.c0, scale(cis(th), k * F.R));
    const dz = scale(mul([0, 1], cis(th)), (k * F.R * TAU) / n);
    const m = dmapOf(F)(z), w = div(dW(z, F), m);
    I = add(I, mul(mul(w, w), mul(m, dz)));
  }
  const Fc = mul([0, rho / 2], I);          // F_x − iF_y
  const Fx = Fc[0], Fy = -Fc[1];
  const ex = [Math.cos(F.alpha), Math.sin(F.alpha)];
  return { drag: Fx * ex[0] + Fy * ex[1], lift: -Fx * ex[1] + Fy * ex[0] };
}
