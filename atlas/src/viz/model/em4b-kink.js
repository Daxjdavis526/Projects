// The field of a point charge moving along x — uniformly, stopping, or
// starting — from the Liénard–Wiechert formula, DOM-free (tested in
// test/em4b-kink.test.mjs; drawn by sims/em4b-kink.js). Units: c = 1 and
// q/4πε₀ = 1, so lengths and times share one unit and a charge at rest has
// E = 1/r². The field point is in the x–y plane (z = 0); by symmetry E has no
// z component there.
//
//   uniform  x(t) = βt for all t;
//   stop     x(t) = βt until t = 0, then a uniform deceleration to rest at
//            t = τ (at x = βτ/2), at rest afterwards;
//   start    at rest at x = 0 until t = 0, then a uniform acceleration to
//            speed β at t = τ, uniform afterwards.
//
// Liénard–Wiechert (Griffiths eq. 10.72), with 𝓻 from the retarded position
// to the field point and u = 𝓻̂ − v (c = 1):
//   E = 𝓻/(𝓻·u)³ [ (1 − v²) u + 𝓻 × (u × a) ],
// the first term the velocity field (∝ 1/𝓻², pointing from where the charge
// would be now had it kept its velocity), the second the acceleration field
// (∝ 1/𝓻, transverse: the radiation). Field lines are traced by integrating
// along E at one instant from near the charge's present position.

/** The worldline: { x(t), v(t), a(t) } for a mode, speed β (|β| < 1) and duration τ > 0. */
export function worldline(mode, beta, tau) {
  if (mode === 'stop') return {
    x: (t) => (t < 0 ? beta * t : t < tau ? beta * t - (beta * t * t) / (2 * tau) : (beta * tau) / 2),
    v: (t) => (t < 0 ? beta : t < tau ? beta * (1 - t / tau) : 0),
    a: (t) => (t < 0 || t >= tau ? 0 : -beta / tau),
  };
  if (mode === 'start') return {
    x: (t) => (t < 0 ? 0 : t < tau ? (beta * t * t) / (2 * tau) : (beta * tau) / 2 + beta * (t - tau)),
    v: (t) => (t < 0 ? 0 : t < tau ? (beta * t) / tau : beta),
    a: (t) => (t < 0 || t >= tau ? 0 : beta / tau),
  };
  return { x: (t) => beta * t, v: () => beta, a: () => 0 };
}

/**
 * The retarded time t_r for the field point (X, Y) at time T: the root of
 * (T − t_r) = |(X − x(t_r), Y)|. Safeguarded Newton from the guess g (the
 * left side falls faster than the right whenever |v| < 1, so the root is unique).
 */
export function retardedTime(W, T, X, Y, g = null) {
  const f = (s) => T - s - Math.hypot(X - W.x(s), Y);
  let hi = T, lo = T - Math.max(1, Math.hypot(X - W.x(T), Y)) * 2 - 1;
  while (f(lo) < 0) lo = T - (T - lo) * 2;
  let s = g !== null && g < hi && g > lo ? g : (lo + hi) / 2;
  for (let k = 0; k < 100; k++) {
    const fs = f(s);
    if (fs > 0) lo = s; else hi = s;
    if (Math.abs(fs) < 1e-12 || hi - lo < 1e-13) break;
    const dx = X - W.x(s), R = Math.hypot(dx, Y);
    const d = -1 + (R > 0 ? (dx * W.v(s)) / R : 0);   // f′(s) = −(1 − 𝓻̂·v)
    let n = s - fs / d;
    if (!(n > lo && n < hi)) n = (lo + hi) / 2;
    s = n;
  }
  return s;
}

/** The electric field at (X, Y), time T: { Ex, Ey, tr, xr, vr, ar } (retarded time, position, velocity, acceleration). */
export function field(W, T, X, Y, g = null) {
  const tr = retardedTime(W, T, X, Y, g);
  const xr = W.x(tr), v = W.v(tr), a = W.a(tr);
  const rx = X - xr, ry = Y, R = Math.hypot(rx, ry);
  const ux = rx / R - v, uy = ry / R;
  const ru = rx * ux + ry * uy, k = R / ru ** 3;
  // 𝓻 × (u × a) = u(𝓻·a) − a(𝓻·u), with a along x
  const ra = rx * a;
  const Ex = k * ((1 - v * v) * ux + ux * ra - a * ru), Ey = k * ((1 - v * v) * uy + uy * ra);
  return { Ex, Ey, tr, xr, vr: v, ar: a };
}

/** The velocity field of a charge moving uniformly at β, present position x₀ (Heaviside): magnitude and direction from the present position. */
export function uniformField(beta, x0, X, Y) {
  const dx = X - x0, R2 = dx * dx + Y * Y, R = Math.sqrt(R2), s2 = (Y * Y) / R2;
  const m = (1 - beta * beta) / (R2 * (1 - beta * beta * s2) ** 1.5);
  return { Ex: (m * dx) / R, Ey: (m * Y) / R };
}

/**
 * A field line at time T, starting a distance eps from the charge's present
 * position at rest-frame angle th0 from the +x axis (mapped to the lab by
 * tan θ = γ tan θ₀ for the present speed), traced outward along E by
 * midpoint steps of length h until it leaves the box |x − cx| ≤ bx, |y| ≤ by.
 * Returns [[x, y], …].
 */
export function fieldLine(W, T, th0, { eps = 0.05, h = 0.04, cx = 0, bx = 6, by = 4, maxSteps = 1500 } = {}) {
  const v = W.v(T), gam = 1 / Math.sqrt(1 - v * v);
  const th = Math.atan2(gam * Math.sin(th0), Math.cos(th0));
  let x = W.x(T) + eps * Math.cos(th), y = eps * Math.sin(th);
  const pts = [[W.x(T), 0], [x, y]];
  let g = null;
  const dir = (px, py) => {
    const E = field(W, T, px, py, g);
    g = E.tr;
    const m = Math.hypot(E.Ex, E.Ey) || 1;
    return [E.Ex / m, E.Ey / m];
  };
  for (let k = 0; k < maxSteps; k++) {
    const [d1x, d1y] = dir(x, y);
    const [d2x, d2y] = dir(x + (h / 2) * d1x, y + (h / 2) * d1y);
    x += h * d2x; y += h * d2y;
    pts.push([x, y]);
    if (Math.abs(x - cx) > bx || Math.abs(y) > by) break;
  }
  return pts;
}

/** The "news" shells at time T: the sphere centred where the change began (radius T) and where it ended (radius T − τ). */
export function shells(mode, W, T, tau) {
  if (mode === 'uniform') return [];
  const out = [];
  if (T > 0) out.push({ cx: W.x(0), r: T });
  if (T > tau) out.push({ cx: W.x(tau), r: T - tau });
  return out;
}
