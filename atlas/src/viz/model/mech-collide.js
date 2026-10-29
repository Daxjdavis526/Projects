// Two-body collisions and separations in one and two dimensions: the physics
// behind sims/mech-collide.js. DOM-free; checked by test/mech-collide.test.mjs.
//
// The collision is instantaneous and the bodies are smooth: the only impulse
// acts along the line of centres (the contact normal), with a coefficient of
// restitution e — the speed of separation along the normal divided by the
// speed of approach (1: elastic, 0: perfectly inelastic). Momentum is
// conserved exactly in every case; kinetic energy only when e = 1.

const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const add = (a, b, k = 1) => [a[0] + k * b[0], a[1] + k * b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
export const norm = (a) => Math.hypot(a[0], a[1]);

/** Kinetic energy of a body: ½mv² (v a number or a 2D vector). */
export const kinetic = (m, v) => 0.5 * m * (typeof v === 'number' ? v * v : dot(v, v));

/**
 * 1D collision of body 1 (on the left) with body 2 (on the right).
 * Velocities are signed, positive to the right. They collide only if 1 is
 * catching up with 2 (u1 > u2); otherwise nothing changes.
 */
export function collide1d({ m1, m2, u1, u2, e = 1 }) {
  const M = m1 + m2, mu = (m1 * m2) / M;
  const P = m1 * u1 + m2 * u2, vcm = P / M;
  const hit = u1 > u2;
  const v1 = hit ? vcm - (e * m2 * (u1 - u2)) / M : u1;
  const v2 = hit ? vcm + (e * m1 * (u1 - u2)) / M : u2;
  const K0 = kinetic(m1, u1) + kinetic(m2, u2), K1 = kinetic(m1, v1) + kinetic(m2, v2);
  return { v1, v2, hit, P, vcm, mu, K0, K1, lost: K0 - K1 };
}

/**
 * 1D separation: two bodies moving together at u are pushed apart by a
 * spring (or a charge) that releases energy E into their motion. Body 1 goes
 * to the left of body 2.
 */
export function explode1d({ m1, m2, u = 0, E }) {
  const M = m1 + m2, mu = (m1 * m2) / M;
  const w = Math.sqrt((2 * Math.max(0, E)) / mu);           // relative speed afterwards: E = ½μw²
  const v1 = u - (m2 * w) / M, v2 = u + (m1 * w) / M;
  const K0 = kinetic(M, u), K1 = kinetic(m1, v1) + kinetic(m2, v2);
  return { v1, v2, hit: true, P: M * u, vcm: u, mu, K0, K1, lost: K0 - K1 };
}

/** Coefficient of restitution from the four 1D velocities: separation speed ÷ approach speed. */
export const restitution = (u1, u2, v1, v2) => (v2 - v1) / (u1 - u2);

/**
 * 2D collision of two smooth discs of radii r1, r2. `b` is the impact
 * parameter as a fraction of r1 + r2 (0: head-on; |b| ≥ 1: a miss), measured
 * across the relative velocity, positive to the left of 1's motion relative
 * to 2. `stick` makes them move off together (perfectly inelastic in 2D).
 * Returns the velocities after, the unit normal n (from 1 toward 2 at
 * contact) and rel, the position of 1's centre relative to 2's at contact.
 */
export function collide2d({ m1, m2, r1 = 0.5, r2 = 0.5, u1, u2 = [0, 0], b = 0, e = 1, stick = false }) {
  const M = m1 + m2, R = r1 + r2;
  const P = add(mul(u1, m1), mul(u2, m2)), vcm = mul(P, 1 / M);
  const w = add(u1, u2, -1), W = norm(w);
  const K0 = kinetic(m1, u1) + kinetic(m2, u2);
  const hit = W > 1e-12 && Math.abs(b) < 1;
  if (!hit) return { v1: u1.slice(), v2: u2.slice(), hit, P, vcm, K0, K1: K0, lost: 0, n: null, rel: null };
  const wh = mul(w, 1 / W), sh = [-wh[1], wh[0]];
  const bb = b * R, along = Math.sqrt(R * R - bb * bb);
  const rel = add(mul(sh, bb), mul(wh, -along));
  const n = mul(rel, -1 / R);
  let v1, v2;
  if (stick) { v1 = vcm.slice(); v2 = vcm.slice(); }
  else {
    const a1 = dot(u1, n), a2 = dot(u2, n);
    const c = collide1d({ m1, m2, u1: a1, u2: a2, e });
    v1 = add(u1, n, c.v1 - a1);
    v2 = add(u2, n, c.v2 - a2);
  }
  const K1 = kinetic(m1, v1) + kinetic(m2, v2);
  return { v1, v2, hit, P, vcm, K0, K1, lost: K0 - K1, n, rel };
}

/** Angle between two 2D vectors, in degrees (NaN if either is zero). */
export function angleBetween(a, b) {
  const la = norm(a), lb = norm(b);
  if (la < 1e-12 || lb < 1e-12) return NaN;
  return (Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (la * lb)))) * 180) / Math.PI;
}

/**
 * A playable 1D timeline. Bodies are carts of widths w1, w2 on a track; the
 * contact (or the separation) happens at x = 0 at time tc. Positions are in
 * track units and times in matching units, so that a velocity of 1 m/s moves
 * a cart 1 unit per unit time: the picture is zoomed to fit, not to scale,
 * but every motion keeps its proportions. `travel` is the farthest any cart
 * moves before (and after) the event.
 *   spec: { mode: 'collide' | 'explode', m1, m2, u1, u2, e, u, E, after: [v1, v2] (explicit, optional) }
 */
export function timeline1d(spec, { w1 = 0.9, w2 = 0.9, travel = 3.2, gap = 0.7 } = {}) {
  const ex = spec.mode === 'explode';
  const out = ex ? explode1d({ m1: spec.m1, m2: spec.m2, u: spec.u ?? 0, E: spec.E ?? 0 }) : collide1d(spec);
  if (spec.after) { out.v1 = spec.after[0]; out.v2 = spec.after[1]; out.K1 = kinetic(spec.m1, out.v1) + kinetic(spec.m2, out.v2); out.lost = out.K0 - out.K1; }
  const u1 = ex ? spec.u ?? 0 : spec.u1, u2 = ex ? spec.u ?? 0 : spec.u2;
  const vmaxBefore = Math.max(Math.abs(u1), Math.abs(u2)), vmaxAfter = Math.max(Math.abs(out.v1), Math.abs(out.v2));
  let tc, tAfter;
  if (!out.hit) {
    // they never meet: start them apart and let them go
    const T = travel / Math.max(vmaxBefore, 1e-9);
    const c0 = [-w1 / 2 - gap, w2 / 2 + gap];
    return { ...out, tc: null, T: vmaxBefore > 1e-9 ? T : 1, u: [u1, u2], at: (t) => ({ x: [c0[0] + u1 * t, c0[1] + u2 * t], v: [u1, u2], after: false }) };
  }
  tAfter = vmaxAfter > 1e-9 ? travel / vmaxAfter : 0;
  tc = vmaxBefore > 1e-9 ? travel / vmaxBefore : 0;
  if (ex && tc === 0) tc = 0.25 * tAfter;               // at rest before a push: a short pause
  if (!ex && tAfter === 0) tAfter = tc;                 // they stop dead: hold the last frame a while
  if (tAfter > 3 * tc && tc > 0) tAfter = 3 * tc;        // slow leavers: do not wait for ever
  if (tc > 3 * tAfter && tAfter > 0) tc = 3 * tAfter;
  const T = tc + tAfter || 1;
  const xc = [-w1 / 2, w2 / 2];
  const at = (t) => {
    const s = t - tc, after = s > 0;
    const v = after ? [out.v1, out.v2] : [u1, u2];
    return { x: [xc[0] + v[0] * s, xc[1] + v[1] * s], v, after };
  };
  return { ...out, tc, T, u: [u1, u2], at };
}

/**
 * A playable 2D timeline: puck 2's centre passes through the origin at the
 * moment of contact tc. Same units as timeline1d.
 *   spec: { m1, m2, r1, r2, u1: [x, y], u2: [x, y], b, e, stick }
 */
export function timeline2d(spec, { travel = 3.2 } = {}) {
  const out = collide2d(spec);
  const { u1, u2 = [0, 0] } = spec;
  const vb = Math.max(norm(u1), norm(u2)), va = Math.max(norm(out.v1), norm(out.v2));
  if (!out.hit) {
    // a miss: closest approach (at the impact-parameter offset) half-way through
    const R = (spec.r1 ?? 0.5) + (spec.r2 ?? 0.5), w = add(u1, u2, -1), W = norm(w);
    const rel = W > 1e-12 ? mul([-w[1] / W, w[0] / W], (spec.b ?? 0) * R) : [-(R + 0.6), 0];
    const T = vb > 1e-9 ? (2 * travel) / vb : 1;
    return { ...out, tc: null, T, u: [u1, u2], at: (t) => ({ p: [add(rel, u1, t - T / 2), mul(u2, t - T / 2)], v: [u1, u2], after: false }) };
  }
  let tc = vb > 1e-9 ? travel / vb : 1, tAfter = va > 1e-9 ? travel / va : tc;
  if (tAfter > 3 * tc) tAfter = 3 * tc;
  if (tc > 3 * tAfter) tc = 3 * tAfter;
  const c = [out.rel, [0, 0]];
  const at = (t) => {
    const s = t - tc, after = s > 0;
    const v = after ? [out.v1, out.v2] : [u1, u2];
    return { p: [add(c[0], v[0], s), add(c[1], v[1], s)], v, after };
  };
  return { ...out, tc, T: tc + tAfter, u: [u1, u2], at };
}
