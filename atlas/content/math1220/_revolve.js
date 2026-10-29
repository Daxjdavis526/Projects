// Solids of revolution for the surface3d simulation, built from a 2D region.
//
// A region is described by its boundary, traced once around in order, as a
// list of pieces. Each piece maps s ∈ [0, 1] to a point [x, y] and is written
// as a JS function from an expression string for s to two expression strings
// (Atlas syntax, which may use slider keys). boundary() glues the pieces into
// one closed curve of u ∈ [0, pieces], and revolve() sweeps that curve about a
// horizontal line y = k or a vertical line x = h through an angle set by a
// slider (degrees), giving one parametric surface (u, v) ↦ (x, y, z) — the
// whole surface of the solid, end caps included.
//
// 3D coordinates: the region starts in the vertical x–z plane (its y becomes
// the 3D height z) and sweeps out of it toward +y, away from the default
// camera, so a part-way sweep leaves the opening facing the viewer; z is up. `shift` moves the drawing
// so the solid sits near the camera's target (the origin); the 3D axes are
// then hidden and the axis of rotation is drawn as a line instead.

/** A piece along y = f(x) from x = a to x = b (a, b numbers or expressions; f maps an x-expression to a y-expression). */
export const along = (f, a, b) => (s) => { const x = `((${a}) + ((${b}) - (${a}))*${s})`; return [x, f(x)]; };

/** A straight piece from (x0, y0) to (x1, y1); coordinates may be expressions. */
export const seg = (x0, y0, x1, y1) => (s) => [`((${x0}) + ((${x1}) - (${x0}))*${s})`, `((${y0}) + ((${y1}) - (${y0}))*${s})`];

/** The region between y = top(x) above and y = bottom(x) below, for a ≤ x ≤ b, traced clockwise. */
export const between = (top, bottom, a, b) => [
  along(top, a, b),
  seg(b, top(`(${b})`), b, bottom(`(${b})`)),
  along(bottom, b, a),
  seg(a, bottom(`(${a})`), a, top(`(${a})`)),
];

/** The closed boundary as two expressions of u ∈ [0, pieces.length]. */
export function boundary(pieces) {
  const P = pieces.length;
  const W = `min(floor(u), ${P - 1})`;
  const S = `(u - ${W})`;
  const sel = (j) => (P === 1 ? '1' : `max(0, 1 - abs(${W} - ${j}))`);
  const parts = pieces.map((p) => p(S));
  return [0, 1].map((k) => parts.map((xy, j) => `${sel(j)}*${xy[k]}`).join(' + '));
}

/**
 * The surface of revolution.
 * @param pieces  boundary pieces (see above)
 * @param o.axis  'x' (a horizontal line y = at) or 'y' (a vertical line x = at)
 * @param o.at    where that line is (number)
 * @param o.sweep slider key holding the sweep angle in degrees
 * @param o.shift [dx, dy, dz] added to every 3D point
 */
export function revolve(pieces, { axis = 'x', at = 0, sweep = 'sw', shift = [0, 0, 0] } = {}) {
  const [X, Y] = boundary(pieces);
  const ang = `(${sweep})*v*pi/180`;
  const [dx, dy, dz] = shift;
  const add = (e, d) => (d ? `${e} + (${d})` : e);
  if (axis === 'x') {
    const rho = `((${Y}) - (${at}))`;
    return [add(`(${X})`, dx), add(`${rho}*sin(${ang})`, dy), add(`(${at}) + ${rho}*cos(${ang})`, dz)];
  }
  const rho = `((${X}) - (${at}))`;
  return [add(`(${at}) + ${rho}*cos(${ang})`, dx), add(`${rho}*sin(${ang})`, dy), add(`(${Y})`, dz)];
}

/**
 * The region's boundary drawn flat where it sits after turning through
 * `angle` degrees (a number or an expression, e.g. the sweep slider key), as a
 * surface3d curve over t ∈ [0, pieces]. With angle 0 it is the starting region.
 */
export function outline(pieces, { axis = 'x', at = 0, angle = 0, shift = [0, 0, 0], color = 'violet', width = 2.2 } = {}) {
  const [X, Y] = boundary(pieces).map((e) => e.replace(/\bu\b/g, 't'));
  const [dx, dy, dz] = shift;
  const a = `(${angle})*pi/180`;
  const add = (e, d) => (d ? `${e} + (${d})` : e);
  if (axis === 'x') {
    const rho = `((${Y}) - (${at}))`;
    return { param: [add(`(${X})`, dx), add(`${rho}*sin(${a})`, dy), add(`(${at}) + ${rho}*cos(${a})`, dz)], t: [0, pieces.length], color, width };
  }
  const rho = `((${X}) - (${at}))`;
  return { param: [add(`(${at}) + ${rho}*cos(${a})`, dx), add(`${rho}*sin(${a})`, dy), add(`(${Y})`, dz)], t: [0, pieces.length], color, width };
}

/**
 * A circle of the solid: the path of the point (x, y) of the region as it sweeps
 * (radius = its distance from the axis). x and y may be expressions.
 */
export function ring(x, y, { axis = 'x', at = 0, sweep = 'sw', shift = [0, 0, 0], color = 'gold', width = 2.6, full = false } = {}) {
  const [dx, dy, dz] = shift;
  const end = full ? '2*pi' : `(${sweep})*pi/180`;
  const add = (e, d) => (d ? `${e} + (${d})` : e);
  if (axis === 'x') {
    const rho = `((${y}) - (${at}))`;
    return { param: [add(`(${x})`, dx), add(`${rho}*sin(t)`, dy), add(`(${at}) + ${rho}*cos(t)`, dz)], t: [0, end], color, width };
  }
  const rho = `((${x}) - (${at}))`;
  return { param: [add(`(${at}) + ${rho}*cos(t)`, dx), add(`${rho}*sin(t)`, dy), add(`(${y})`, dz)], t: [0, end], color, width };
}

/** A straight 3D segment as a surface3d curve (coordinates may be expressions). */
export const line3 = (p, q, { color = 'ink2', width = 1.6 } = {}) => ({
  param: [0, 1, 2].map((k) => `(${p[k]}) + ((${q[k]}) - (${p[k]}))*t`), t: [0, 1], color, width,
});

/** The axis of rotation drawn as a line from `from` to `to` along it (all may be expressions). */
export function axisLine({ axis = 'x', at = 0, from, to, shift = [0, 0, 0], color = 'bad', width = 2 } = {}) {
  const [dx, dy, dz] = shift.map((d) => `(${d})`);
  return axis === 'x'
    ? line3([`(${from}) + ${dx}`, dy, `(${at}) + ${dz}`], [`(${to}) + ${dx}`, dy, `(${at}) + ${dz}`], { color, width })
    : line3([`(${at}) + ${dx}`, dy, `(${from}) + ${dz}`], [`(${at}) + ${dx}`, dy, `(${to}) + ${dz}`], { color, width });
}

/**
 * The straight sides of a cylindrical shell about a vertical axis x = at: `count`
 * vertical lines at x (distance x − at from the axis) from height y0 to y1,
 * spread evenly over the swept angle. Together with ring() at both heights they
 * draw the shell as a cage.
 */
export function shellSides(x, y0, y1, { at = 0, sweep = 'sw', shift = [0, 0, 0], count = 6, color = 'gold', width = 1.6 } = {}) {
  const [dx, dy, dz] = shift.map((d) => `(${d})`);
  const rho = `((${x}) - (${at}))`;
  return Array.from({ length: count + 1 }, (_, k) => {
    const a = `(${sweep})*pi/180*${k / count}`;
    const px = `(${at}) + ${rho}*cos(${a}) + ${dx}`, py = `${rho}*sin(${a}) + ${dy}`;
    return line3([px, py, `(${y0}) + ${dz}`], [px, py, `(${y1}) + ${dz}`], { color, width });
  });
}

/**
 * The slanted sides of a thin band of a surface of revolution about the
 * x-axis (y = 0): `count` straight lines from (x0, f(x0)) to (x1, f(x1)) on the
 * surface, spread evenly over the swept angle. f maps an x-expression to a
 * radius expression. Together with ring() at x0 and x1 they draw a frustum.
 */
export function bandSides(f, x0, x1, { sweep = 'sw', shift = [0, 0, 0], count = 6, color = 'gold', width = 1.6 } = {}) {
  const [dx, dy, dz] = shift.map((d) => `(${d})`);
  return Array.from({ length: count + 1 }, (_, k) => {
    const a = `(${sweep})*pi/180*${k / count}`;
    const end = (x) => [`(${x}) + ${dx}`, `${f(x)}*sin(${a}) + ${dy}`, `${f(x)}*cos(${a}) + ${dz}`];
    return line3(end(x0), end(x1), { color, width });
  });
}
