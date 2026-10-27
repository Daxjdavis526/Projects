// Coordinates on a flat plane and the lengths a metric gives. The same point
// can be labelled (x, y), polar (r, θ) or skewed (u, v); a curve’s length is
// the same in all of them provided each uses its own metric:
//   Cartesian  ds² = dx² + dy²
//   polar      ds² = dr² + r² dθ²
//   skewed     ds² = du² + dv² + 2 cos α du dv   (axes at angle α)
// Adding up √(dr² + dθ²) instead — treating coordinate differences as
// distances — gives a number that is not a length. DOM-free; tested in
// test/gr-foundations.test.mjs.

export const toPolar = (x, y) => [Math.hypot(x, y), Math.atan2(y, x)];
export const fromPolar = (r, th) => [r * Math.cos(th), r * Math.sin(th)];

/** Skewed axes: u along x, v along a direction at angle α (radians) from it. */
export const fromSkew = (u, v, a) => [u + v * Math.cos(a), v * Math.sin(a)];
export const toSkew = (x, y, a) => { const v = y / Math.sin(a); return [x - v * Math.cos(a), v]; };

/** The signed difference b − a of two angles, in (−π, π]. */
export function dAngle(a, b) {
  let d = (b - a) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d <= -Math.PI) d += 2 * Math.PI;
  return d;
}

/** A circle as a closed polyline (last point = first). */
export function circle(cx, cy, R, n = 720) {
  return Array.from({ length: n + 1 }, (_, k) => { const a = (2 * Math.PI * k) / n; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
}

/** A straight segment as a polyline. */
export function segment([x0, y0], [x1, y1], n = 240) {
  return Array.from({ length: n + 1 }, (_, k) => [x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
}

/**
 * The length of a polyline measured five ways: with the Cartesian, polar and
 * skewed metrics (which agree), and naively as √(dr² + dθ²) and √(du² + dv²)
 * (which do not). Chords that turn quickly around the origin are subdivided,
 * so the polar sum converges even for a path passing close to r = 0.
 */
export function lengths(pts, alpha = Math.PI / 3) {
  const out = { cart: 0, polar: 0, naivePolar: 0, skew: 0, naiveSkew: 0, winding: 0 };
  const ca = Math.cos(alpha);
  for (let k = 0; k + 1 < pts.length; k++) {
    const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
    out.cart += Math.hypot(x1 - x0, y1 - y0);
    const turn = Math.abs(dAngle(Math.atan2(y0, x0), Math.atan2(y1, x1)));
    const m = Math.max(1, Math.ceil(turn / 0.02));
    for (let j = 0; j < m; j++) {
      const ax = x0 + ((x1 - x0) * j) / m, ay = y0 + ((y1 - y0) * j) / m;
      const bx = x0 + ((x1 - x0) * (j + 1)) / m, by = y0 + ((y1 - y0) * (j + 1)) / m;
      const [r0, t0] = toPolar(ax, ay), [r1, t1] = toPolar(bx, by);
      const dr = r1 - r0, dt = dAngle(t0, t1), rm = (r0 + r1) / 2;
      out.polar += Math.sqrt(dr * dr + rm * rm * dt * dt);
      out.naivePolar += Math.sqrt(dr * dr + dt * dt);
      out.winding += dt;
    }
    const [u0, v0] = toSkew(x0, y0, alpha), [u1, v1] = toSkew(x1, y1, alpha);
    const du = u1 - u0, dv = v1 - v0;
    out.skew += Math.sqrt(Math.max(0, du * du + dv * dv + 2 * ca * du * dv));
    out.naiveSkew += Math.hypot(du, dv);
  }
  return out;
}

/** Components (along r̂, along θ̂) of a unit arrow pointing at angle α, at a point whose polar angle is θ. */
export const polarComponents = (alpha, theta) => [Math.cos(alpha - theta), Math.sin(alpha - theta)];

/** The unit arrows of the polar grid at polar angle θ: r̂ (outward) and θ̂ (anticlockwise around). */
export const polarBasis = (theta) => ({ rhat: [Math.cos(theta), Math.sin(theta)], thetahat: [-Math.sin(theta), Math.cos(theta)] });
