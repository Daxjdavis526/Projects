// Space curves r(t), DOM-free: derivatives by central differences, the
// Frenet frame (T, N, B), curvature and torsion, the split of acceleration
// into tangential and normal parts, arc length, the osculating circle — and
// one curve that has no formula: a rocket's gravity-turn ascent, integrated
// numerically. Used by the c3-curve simulation; tested headlessly in
// test/c3-curve.test.mjs.

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
export { add, sub, mul, dot, cross, len };

/**
 * Derivatives of r at t: r′, r″ and r‴ by central differences with step h
 * (r″ uses h, r‴ a larger step 10h, which keeps rounding error small).
 */
export function derivatives(r, t, h) {
  const p0 = r(t), p1 = r(t + h), m1 = r(t - h);
  const d1 = mul(sub(p1, m1), 1 / (2 * h));
  const d2 = mul(add(sub(p1, mul(p0, 2)), m1), 1 / (h * h));
  const H = 10 * h, q1 = r(t + H), q2 = r(t + 2 * H), n1 = r(t - H), n2 = r(t - 2 * H);
  const d3 = mul(add(sub(q2, mul(q1, 2)), sub(mul(n1, 2), n2)), 1 / (2 * H * H * H));
  // the size of the rounding error in r″: below it, the curve is locally straight
  const noise = (4e-16 * (len(p0) + len(p1) + len(m1))) / (h * h);
  return { p: p0, d1, d2, d3, noise };
}

/**
 * Everything the moving frame needs at one instant, from r′, r″ (and r‴ for the
 * torsion): speed, T, N, B, curvature κ, torsion τ, and the acceleration split
 * a = a_T T + a_N N (with t read as time). On a straight stretch (r′ × r″ = 0,
 * or r″ no bigger than its rounding error `noise`) κ = 0 and N, B are null.
 */
export function frame(d1, d2, d3 = null, noise = 0) {
  const v = len(d1), c = cross(d1, d2), cl = len(c);
  const T = mul(d1, 1 / v);
  const aT = dot(d1, d2) / v, aN = cl / v;
  const straight = !(cl > 0) || len(d2) <= noise || !(aN > 1e-12 * len(d2));
  if (straight) return { speed: v, T, N: null, B: null, kappa: 0, tau: 0, aT, aN: 0 };
  const B = mul(c, 1 / cl), N = cross(B, T);
  return { speed: v, T, N, B, kappa: cl / (v * v * v), tau: d3 ? dot(c, d3) / (cl * cl) : 0, aT, aN };
}

/** Points of the osculating circle at p (centre p + N/κ, radius 1/κ), in the plane of T and N. */
export function osculatingCircle(p, F, n = 96) {
  if (!F.N || !(F.kappa > 0)) return null;
  const R = 1 / F.kappa, c = add(p, mul(F.N, R));
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const u = (2 * Math.PI * k) / n;
    pts.push(add(c, add(mul(F.N, -R * Math.cos(u)), mul(F.T, R * Math.sin(u)))));
  }
  return { centre: c, radius: R, pts };
}

/** Cumulative arc length s(t) on a grid of n steps (Simpson on each step, speeds from central differences). */
export function arcLengthTable(r, t0, t1, n = 600) {
  const h = (t1 - t0) / n, eps = 1e-5 * (t1 - t0) || 1e-6;
  const speed = (t) => len(mul(sub(r(t + eps), r(t - eps)), 1 / (2 * eps)));
  const ts = [t0], ss = [0];
  for (let k = 0; k < n; k++) {
    const a = t0 + k * h, b = a + h;
    ss.push(ss[k] + (h / 6) * (speed(a) + 4 * speed((a + b) / 2) + speed(b)));
    ts.push(b);
  }
  return { ts, ss };
}

/** s at t, linearly interpolated in an arc-length table. */
export function arcLengthAt({ ts, ss }, t) {
  if (t <= ts[0]) return 0;
  const n = ts.length - 1, k = Math.min(n - 1, Math.floor(((t - ts[0]) / (ts[n] - ts[0])) * n));
  const f = (t - ts[k]) / (ts[k + 1] - ts[k]);
  return ss[k] + f * (ss[k + 1] - ss[k]);
}

// ─── a gravity-turn ascent ──────────────────────────────────────────────────
// Flat Earth, constant g, no air, thrust always along the velocity. The thrust
// acceleration grows as propellant burns: A(t) = n0·g / (1 − t/τ) until burnout.
// The rocket climbs vertically, is tipped over by `kick` degrees at t = tk, and
// from then on gravity alone turns it: v dγ/dt = −g cos γ, dv/dt = A − g sin γ.
// Positions in km, time in s, x downrange and z up (y = 0).

export const GRAVITY_TURN = { n0: 1.5, tau: 300, tk: 12, kick: 1.3, tb: 160, g: 9.81e-3, dt: 0.02 };

/** Integrate the ascent (RK4); returns samples { t, r, v, a, gamma } every `every` seconds. */
export function gravityTurn(opts = {}) {
  const { n0, tau, tk, kick, tb, g, dt } = { ...GRAVITY_TURN, ...opts };
  const every = opts.every ?? 0.5;
  const A = (t) => (t < tb ? (n0 * g) / (1 - t / tau) : 0);
  const f = (t, s) => {
    const [, , v, gm] = s;
    return [v * Math.cos(gm), v * Math.sin(gm), A(t) - g * Math.sin(gm), t < tk || v <= 0 ? 0 : (-g * Math.cos(gm)) / v];
  };
  const sample = (t, s) => {
    const [x, z, v, gm] = s, T = [Math.cos(gm), 0, Math.sin(gm)];
    return { t, r: [x, 0, z], v: mul(T, v), a: add(mul(T, A(t)), [0, 0, -g]), gamma: gm };
  };
  let s = [0, 0, 0, Math.PI / 2], t = 0;
  const out = [sample(0, s)], kickStep = Math.round(tk / dt), per = Math.max(1, Math.round(every / dt)), steps = Math.round(tb / dt);
  for (let k = 0; k < steps; k++) {
    if (k === kickStep) s = [s[0], s[1], s[2], Math.PI / 2 - (kick * Math.PI) / 180];
    const k1 = f(t, s), k2 = f(t + dt / 2, s.map((y, i) => y + (dt / 2) * k1[i])), k3 = f(t + dt / 2, s.map((y, i) => y + (dt / 2) * k2[i])), k4 = f(t + dt, s.map((y, i) => y + dt * k3[i]));
    s = s.map((y, i) => y + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t += dt;
    if ((k + 1) % per === 0) out.push(sample(t, s));
  }
  return out;
}

/**
 * Position, velocity and acceleration at time t from samples (cubic Hermite for
 * r using v, and for v using a; linear for a). Clamped to the sampled span.
 */
export function sampleAt(S, t) {
  const t0 = S[0].t, t1 = S[S.length - 1].t;
  t = Math.max(t0, Math.min(t1, t));
  let k = Math.min(S.length - 2, Math.floor(((t - t0) / (t1 - t0)) * (S.length - 1)));
  while (k > 0 && S[k].t > t) k--;
  while (k < S.length - 2 && S[k + 1].t < t) k++;
  const A = S[k], B = S[k + 1], h = B.t - A.t, u = (t - A.t) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const herm = (p0, m0, p1, m1) => add(add(mul(p0, h00), mul(m0, h10 * h)), add(mul(p1, h01), mul(m1, h11 * h)));
  return { r: herm(A.r, A.v, B.r, B.v), v: herm(A.v, A.a, B.v, B.a), a: add(mul(A.a, 1 - u), mul(B.a, u)) };
}
