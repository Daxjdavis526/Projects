// Torque-free rigid-body rotation (PHYS 3550, M7.3–M7.4). DOM-free; tested in
// test/cm4-rigid.test.mjs.
//
// The state is the angular momentum in the body's principal axes, L = (L₁, L₂, L₃),
// plus the body's orientation as a unit quaternion q (body → space). Euler's
// equations with no torque, written for L:
//
//   dL/dt (body) = L × ω,   ω = (L₁/I₁, L₂/I₂, L₃/I₃),   dq/dt = ½ q ⊗ (0, ω)
//
// conserve |L| and the energy E = ½ Σ Lᵢ²/Iᵢ, so the tip of L (seen from the
// body) runs along a polhode: where the sphere |L| = const meets the energy
// ellipsoid. A teaching-model energy sink can be switched on:
//
//   dL/dt (body) = L × ω − κ L × (ω × L)/|L|
//
// The extra term is perpendicular to L, so |L| stays fixed, while
// dE/dt = ω·dL/dt = −κ |ω × L|²/|L| ≤ 0: energy drains at fixed |L| and the
// spin creeps to the axis of largest moment (Explorer 1's fate). It stands in
// for flexing antennas or sloshing fuel; it is not a model of either.

const TAU = 2 * Math.PI;

export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);

/** Principal moments (kg m²) of a uniform box of mass m (kg) with edges a, b, c (m) along axes 1, 2, 3. */
export const boxMoments = (m, a, b, c) => [(m * (b * b + c * c)) / 12, (m * (a * a + c * c)) / 12, (m * (a * a + b * b)) / 12];

/** The edges (a, b, c) of the uniform box of mass m with principal moments I (each Iᵢ ≤ the sum of the others). */
export function boxFromMoments(I, m = 1) {
  const [A, B, C] = I;
  const sq = (v) => Math.sqrt(Math.max(0, (6 * v) / m));
  return [sq(B + C - A), sq(A + C - B), sq(A + B - C)];
}

export const omegaOf = (I, L) => [L[0] / I[0], L[1] / I[1], L[2] / I[2]];
export const energy = (I, L) => 0.5 * (L[0] * L[0] / I[0] + L[1] * L[1] / I[1] + L[2] * L[2] / I[2]);

// quaternions [w, x, y, z]
export const qmul = (a, b) => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
];
/** Rotate the vector v by the unit quaternion q. */
export function qrot(q, v) {
  const r = qmul(qmul(q, [0, v[0], v[1], v[2]]), [q[0], -q[1], -q[2], -q[3]]);
  return [r[1], r[2], r[3]];
}
/** The unit quaternion turning the unit vector a onto the unit vector b by the shortest rotation. */
export function qalign(a, b) {
  const c = dot(a, b);
  if (c < -1 + 1e-12) {           // opposite: turn half a revolution about any perpendicular axis
    const p = Math.abs(a[0]) < 0.9 ? cross(a, [1, 0, 0]) : cross(a, [0, 1, 0]), l = len(p);
    return [0, p[0] / l, p[1] / l, p[2] / l];
  }
  const x = cross(a, b), w = 1 + c, n = Math.hypot(w, x[0], x[1], x[2]);
  return [w / n, x[0] / n, x[1] / n, x[2] / n];
}

/** Right-hand side for the state [L₁, L₂, L₃, q₀, q₁, q₂, q₃]. */
export function rhs(I, kappa = 0) {
  return (s) => {
    const L = [s[0], s[1], s[2]], w = omegaOf(I, L);
    let dL = cross(L, w);
    if (kappa) {
      const d = cross(L, cross(w, L)), l = len(L) || 1;
      dL = [dL[0] - (kappa * d[0]) / l, dL[1] - (kappa * d[1]) / l, dL[2] - (kappa * d[2]) / l];
    }
    const q = [s[3], s[4], s[5], s[6]], dq = qmul(q, [0, w[0], w[1], w[2]]);
    return [dL[0], dL[1], dL[2], 0.5 * dq[0], 0.5 * dq[1], 0.5 * dq[2], 0.5 * dq[3]];
  };
}

function rk4(f, s, h) {
  const k1 = f(s);
  const k2 = f(s.map((v, i) => v + 0.5 * h * k1[i]));
  const k3 = f(s.map((v, i) => v + 0.5 * h * k2[i]));
  const k4 = f(s.map((v, i) => v + h * k3[i]));
  return s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

/**
 * The starting angular velocity (body axes): |ω| = w about the chosen axis (1, 2 or 3),
 * tilted by `tilt` degrees toward the next axis (1 → 2, 2 → 3, 3 → 1), plus a whisker
 * (0.1 of the tilt) toward the third, so a start is never exactly on a separatrix.
 */
export function startOmega(axis = 3, tilt = 5, w = 1) {
  const k = axis - 1, j = (k + 1) % 3, i = (k + 2) % 3, a = (tilt * Math.PI) / 180;
  const v = [0, 0, 0];
  v[k] = Math.cos(a); v[j] = Math.sin(a); v[i] = 0.1 * Math.sin(a);
  const l = len(v);
  return v.map((x) => (w * x) / l);
}

/**
 * Integrate from ω₀ (body axes) for T seconds in `steps` RK4 steps. The body starts
 * turned so that its angular momentum points along space +z.
 * Returns { t[], L[][], q[][], w[][], E[], Lmag[] }.
 */
export function run(I, { w0 = startOmega(3, 5, 1), kappa = 0, T = 40, steps = 4000 } = {}) {
  const L0 = [I[0] * w0[0], I[1] * w0[1], I[2] * w0[2]], l0 = len(L0);
  const q0 = qalign([L0[0] / l0, L0[1] / l0, L0[2] / l0], [0, 0, 1]);
  let s = [...L0, ...q0];
  const f = rhs(I, kappa), h = T / steps;
  const out = { t: [0], L: [L0], q: [q0], w: [w0.slice()], E: [energy(I, L0)], Lmag: [l0] };
  for (let n = 1; n <= steps; n++) {
    s = rk4(f, s, h);
    const qn = Math.hypot(s[3], s[4], s[5], s[6]);
    for (let i = 3; i < 7; i++) s[i] /= qn;
    const L = [s[0], s[1], s[2]];
    out.t.push(n * h); out.L.push(L); out.q.push([s[3], s[4], s[5], s[6]]);
    out.w.push(omegaOf(I, L)); out.E.push(energy(I, L)); out.Lmag.push(len(L));
  }
  return out;
}

/**
 * The orientation used for drawing at sample n: the body's quaternion, turned so that
 * its angular momentum points straight up (it already does without damping; with the
 * teaching-model sink the small drift of L's direction is taken out).
 */
export function displayQuat(r, n) {
  const q = r.q[n], L = r.L[n], l = len(L) || 1, Ls = qrot(q, [L[0] / l, L[1] / l, L[2] / l]);
  return qmul(qalign(Ls, [0, 0, 1]), q);
}

/** Stability of a spin about principal axis a (1, 2, 3) at rate w: { stable, rate } (rad/s: wobble frequency, or growth rate if unstable). */
export function axisStability(I, a, w = 1) {
  const k = a - 1, Ia = I[k], Ib = I[(k + 1) % 3], Ic = I[(k + 2) % 3];
  const s = ((Ia - Ib) * (Ia - Ic)) / (Ib * Ic);
  return { stable: s > 0, rate: Math.abs(w) * Math.sqrt(Math.abs(s)) };
}

/** Body-frame precession rate of ω about the symmetry axis of a body with I₁ = I₂ (= I1) and I₃ (= I3): Ω = (I₃ − I₁)ω₃/I₁. */
export const bodyPrecession = (I1, I3, w3) => ((I3 - I1) * w3) / I1;

/**
 * Polhodes: the curves where the sphere |L| = Lm meets the energy ellipsoid ΣLᵢ²/Iᵢ = h Lm²
 * (h between 1/I_max and 1/I_min). Returns closed curves as arrays of [L₁, L₂, L₃]
 * (two of them, one on each side, unless h is the separatrix value 1/I_mid, when it
 * returns the two great circles through the middle axis).
 */
export function polhode(I, h, Lm = 1, n = 160) {
  const idx = [0, 1, 2].sort((p, q) => I[p] - I[q]);
  const [lo, mid, hi] = idx, inv = (k) => 1 / I[k];
  const curves = [];
  if (Math.abs(h - inv(mid)) < 1e-12 * inv(lo)) {
    // separatrix: L_lo²(1/I_lo − 1/I_mid) = L_hi²(1/I_mid − 1/I_hi), with the mid axis free
    const r = Math.sqrt((inv(mid) - inv(hi)) / (inv(lo) - inv(mid)));    // L_lo/L_hi along the plane
    for (const sg of [1, -1]) {
      const c = [];
      const e = [0, 0, 0]; e[lo] = r; e[hi] = sg;
      const el = len(e);
      for (let k = 0; k <= n; k++) {
        const th = (TAU * k) / n, v = [0, 0, 0];
        v[mid] = Lm * Math.sin(th);
        v[lo] = (Lm * Math.cos(th) * e[lo]) / el; v[hi] = (Lm * Math.cos(th) * e[hi]) / el;
        c.push(v);
      }
      curves.push(c);
    }
    return curves;
  }
  // circulating round the axis whose moment is extreme: lo (high energy) or hi (low energy)
  const ax = h > inv(mid) ? lo : hi, [p, q] = [mid, ax === lo ? hi : lo];
  const A = Math.sqrt(Math.max(0, (inv(ax) - h) / (inv(ax) - inv(p)))), B = Math.sqrt(Math.max(0, (inv(ax) - h) / (inv(ax) - inv(q))));
  for (const sg of [1, -1]) {
    const c = [];
    for (let k = 0; k <= n; k++) {
      const th = (TAU * k) / n, v = [0, 0, 0];
      v[p] = Lm * A * Math.cos(th); v[q] = Lm * B * Math.sin(th);
      v[ax] = sg * Lm * Math.sqrt(Math.max(0, 1 - (A * Math.cos(th)) ** 2 - (B * Math.sin(th)) ** 2));
      c.push(v);
    }
    curves.push(c);
  }
  return curves;
}

/** The time between successive flips of a spin started near the middle axis: measured from a run, as the mean spacing of sign changes of ω_mid. */
export function flipTimes(r, I) {
  const mid = [0, 1, 2].sort((p, q) => I[p] - I[q])[1];
  const ts = [];
  for (let n = 1; n < r.t.length; n++) {
    const a = r.w[n - 1][mid], b = r.w[n][mid];
    if (a === 0 || (a > 0) !== (b > 0)) ts.push(r.t[n - 1] + (r.t[n] - r.t[n - 1]) * (a / (a - b)));
  }
  return ts;
}
