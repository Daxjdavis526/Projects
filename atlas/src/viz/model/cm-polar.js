// Plane-polar kinematics, DOM-free, for the cm-polar simulation (PHYS 3550).
// A motion is given as r(t) and θ(t); derivatives are taken numerically by
// central differences. In the rotating basis r̂ = (cos θ, sin θ),
// θ̂ = (−sin θ, cos θ):
//
//   v = ṙ r̂ + rθ̇ θ̂
//   a = (r̈ − rθ̇²) r̂ + (rθ̈ + 2ṙθ̇) θ̂
//
// The four acceleration terms are returned separately, so a picture can draw
// them head to tail. Tested in test/cm-polar.test.mjs against analytic
// motions and against the Cartesian second derivative.

/** First and second central differences of f at t, step h. */
export function diff(f, t, h) {
  const fp = f(t + h), fm = f(t - h), f0 = f(t);
  return [f0, (fp - fm) / (2 * h), (fp - 2 * f0 + fm) / (h * h)];
}

/**
 * Kinematics at time t of the motion (r(t), θ(t)).
 * Returns r, rd, rdd, th, thd, thdd; the unit vectors er, et; position xy; velocity v (Cartesian);
 * the polar components vr, vt, ar, at; the four terms { rdd, cent, tang, cor } (each a signed
 * scalar along r̂ or θ̂); and the Cartesian acceleration a.
 */
export function kin(rf, thf, t, h = 1e-3) {
  const [r, rd, rdd] = diff(rf, t, h);
  const [th, thd, thdd] = diff(thf, t, h);
  const er = [Math.cos(th), Math.sin(th)], et = [-Math.sin(th), Math.cos(th)];
  const terms = { rdd, cent: -r * thd * thd, tang: r * thdd, cor: 2 * rd * thd };
  const ar = terms.rdd + terms.cent, at = terms.tang + terms.cor;
  const vr = rd, vt = r * thd;
  return {
    r, rd, rdd, th, thd, thdd, er, et, terms, vr, vt, ar, at,
    xy: [r * er[0], r * er[1]],
    v: [vr * er[0] + vt * et[0], vr * er[1] + vt * et[1]],
    a: [ar * er[0] + at * et[0], ar * er[1] + at * et[1]],
    speed: Math.hypot(vr, vt), amag: Math.hypot(ar, at),
  };
}

/** Sample the path from t0 to t1 as [[x, y], …]. */
export function path(rf, thf, t0, t1, n = 400) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n, r = rf(t), th = thf(t);
    out.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  return out;
}

/** A square-ish window [x, y] around the path and the origin, with a margin. */
export function fit(pts, margin = 0.15) {
  let x0 = 0, x1 = 0, y0 = 0, y1 = 0;
  for (const [x, y] of pts) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const s = Math.max(x1 - x0, y1 - y0, 1e-6) * margin;
  return { x: [x0 - s, x1 + s], y: [y0 - s, y1 + s] };
}
