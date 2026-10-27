// Forces on simple bodies, DOM-free: the physics behind the mech-fbd,
// mech-frames and mech-drag simulations. Each scene solver takes the scene's
// parameters (SI units, angles in degrees) and returns its bodies — each with
// every force acting on it as a vector in newtons and its acceleration — plus
// the numbers a readout or a lesson quotes. x points right, y points up.
// Idealisations, stated once: point masses, uniform g, massless ropes,
// massless frictionless pulleys, Coulomb friction (f_s ≤ μs N, f_k = μk N).
// Tested in test/mech-forces.test.mjs.

export const G = 9.8;
const D2R = Math.PI / 180;
const TINY = 1e-9;

/** A force { key, kind, label, fx, fy }. kind sets the colour: weight, normal, friction, tension, applied, contact, drag, thrust, lift. */
export const force = (key, kind, label, fx, fy, extra = {}) => ({ key, kind, label, fx, fy, ...extra });
/** Components of a vector of size `mag` at `deg` degrees anticlockwise from +x. */
export const polar = (mag, deg) => [mag * Math.cos(deg * D2R), mag * Math.sin(deg * D2R)];
const keep = (forces) => forces.filter((f) => Math.hypot(f.fx, f.fy) > 1e-7);

/** Vector sum of a body's forces, [Fx, Fy] in N. */
export const netForce = (body) => body.forces.reduce((s, f) => [s[0] + f.fx, s[1] + f.fy], [0, 0]);

/**
 * A block on a level floor. F pulls at phi degrees above the horizontal
 * (negative phi: pushing down and forward). At rest, static friction holds
 * while |F cos phi| ≤ μs N; `moving` means the block is already sliding to the
 * right, so kinetic friction acts whatever F is.
 */
export function floor({ m, F = 0, phi = 0, mus = 0, muk = 0, moving = false, g = G }) {
  const [Fx, Fy] = polar(F, phi);
  let N = m * g - Fy, f = 0, ax = 0, ay = 0, state;
  if (N <= 0) { N = 0; ax = Fx / m; ay = (Fy - m * g) / m; state = 'lifts'; }
  else if (moving) { f = -muk * N; ax = (Fx + f) / m; state = 'sliding'; }
  else if (Math.abs(Fx) <= mus * N + TINY) { f = -Fx; state = Math.abs(Fx) < TINY ? 'rest' : 'static'; }
  else { f = -Math.sign(Fx) * muk * N; ax = (Fx + f) / m; state = 'sliding'; }
  const kinetic = state === 'sliding';
  const forces = keep([
    force('W', 'weight', 'mg', 0, -m * g),
    force('N', 'normal', 'N', 0, N),
    force('f', 'friction', kinetic ? 'fₖ' : 'fₛ', f, 0),
    force('F', 'applied', 'F', Fx, Fy),
  ]);
  return { bodies: [{ key: 'block', label: 'block', m, forces, a: [ax, ay] }], info: { N, f, fsMax: mus * N, a: ax, state, kinetic } };
}

/**
 * A block on a slope rising to the right at theta degrees. F acts along the
 * slope (up-slope positive). moving: +1 sliding up, −1 sliding down, 0 at
 * rest (static friction holds while |F − mg sin θ| ≤ μs N). The acceleration
 * `a` in info is along the slope, up-slope positive.
 */
export function incline({ m, theta, mus = 0, muk = 0, F = 0, moving = 0, g = G }) {
  const th = theta * D2R, u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
  const N = m * g * Math.cos(th);
  const S = F - m * g * Math.sin(th);            // along-slope force without friction
  let f, a, state;
  if (moving > 0) { f = -muk * N; a = (S + f) / m; state = 'up'; }
  else if (moving < 0) { f = muk * N; a = (S + f) / m; state = 'down'; }
  else if (Math.abs(S) <= mus * N + TINY) { f = -S; a = 0; state = 'static'; }
  else { f = -Math.sign(S) * muk * N; a = (S + f) / m; state = S > 0 ? 'up' : 'down'; }
  const kinetic = state !== 'static';
  const forces = keep([
    force('W', 'weight', 'mg', 0, -m * g),
    force('N', 'normal', 'N', N * n[0], N * n[1]),
    force('f', 'friction', kinetic ? 'fₖ' : 'fₛ', f * u[0], f * u[1]),
    force('F', 'applied', 'F', F * u[0], F * u[1]),
  ]);
  return {
    bodies: [{ key: 'block', label: 'block', m, forces, a: [a * u[0], a * u[1]] }],
    info: { N, f, fsMax: mus * N, a, state, kinetic, Wpar: m * g * Math.sin(th), Wperp: m * g * Math.cos(th), repose: Math.atan(mus) / D2R },
  };
}

/**
 * A mass hanging still (or moving with vertical acceleration a, up positive).
 * ropes 1: one vertical rope. ropes 2: rope 1 rises to the upper left at th1
 * degrees above the horizontal, rope 2 to the upper right at th2 (th2 = 0 is
 * a horizontal pull).
 */
export function hang({ m, th1 = 45, th2 = 45, a = 0, ropes = 2, g = G }) {
  const Wa = m * (g + a);
  if (ropes === 1) {
    const T = Wa;
    return { bodies: [{ key: 'mass', label: 'mass', m, forces: [force('T', 'tension', 'T', 0, T), force('W', 'weight', 'mg', 0, -m * g)], a: [0, a] }], info: { T, T1: T, T2: 0 } };
  }
  const s = Math.sin((th1 + th2) * D2R);
  const T1 = (Wa * Math.cos(th2 * D2R)) / s, T2 = (Wa * Math.cos(th1 * D2R)) / s;
  const forces = keep([
    force('T1', 'tension', 'T₁', ...polar(T1, 180 - th1)),
    force('T2', 'tension', 'T₂', ...polar(T2, th2)),
    force('W', 'weight', 'mg', 0, -m * g),
  ]);
  return { bodies: [{ key: 'mass', label: 'mass', m, forces, a: [0, a] }], info: { T1, T2, T: T1 } };
}

/** A load hung from a block and tackle with n supporting rope segments (ideal): T = m(g + a)/n. */
export function pulley({ m, n = 2, a = 0, g = G }) {
  const T = (m * (g + a)) / n;
  const forces = [...Array(n)].map((_, k) => force(`T${k + 1}`, 'tension', 'T', 0, T));
  forces.push(force('W', 'weight', 'mg', 0, -m * g));
  return { bodies: [{ key: 'load', label: 'load', m, forces, a: [0, a] }], info: { T, n } };
}

/** A person standing on a scale in an elevator with acceleration a (up positive): the scale reads N = m(g + a). */
export function elevator({ m, a = 0, g = G }) {
  const N = Math.max(0, m * (g + a));
  const ay = N > 0 ? a : -g;
  return {
    bodies: [{ key: 'person', label: 'person', m, forces: keep([force('N', 'normal', 'N', 0, N), force('W', 'weight', 'mg', 0, -m * g)]), a: [0, ay] }],
    info: { N, gs: N / (m * g), reading: N / g, floats: N === 0 },
  };
}

/** Atwood machine: m1 hangs on the left, m2 on the right. a > 0 means m2 descends. */
export function atwood({ m1, m2, g = G }) {
  const a = ((m2 - m1) * g) / (m1 + m2), T = (2 * m1 * m2 * g) / (m1 + m2);
  return {
    bodies: [
      { key: 'm1', label: 'm₁', m: m1, forces: [force('T', 'tension', 'T', 0, T), force('W', 'weight', 'm₁g', 0, -m1 * g)], a: [0, a] },
      { key: 'm2', label: 'm₂', m: m2, forces: [force('T', 'tension', 'T', 0, T), force('W', 'weight', 'm₂g', 0, -m2 * g)], a: [0, -a] },
    ],
    info: { a, T },
  };
}

/**
 * Block m1 on a surface (level, or a slope at theta rising toward the
 * pulley), tied over a pulley at its edge to a hanging mass m2. a > 0: m2
 * descends and m1 moves toward the pulley. At rest, static friction holds
 * while |m2 g − m1 g sin θ| ≤ μs N; `moving` means already sliding toward the pulley.
 */
export function table({ m1, m2, mus = 0, muk = 0, theta = 0, moving = false, g = G }) {
  const th = theta * D2R, u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
  const N = m1 * g * Math.cos(th);
  const D = m2 * g - m1 * g * Math.sin(th);
  let f, a, state;
  if (moving) { f = -muk * N; a = (D + f) / (m1 + m2); state = 'sliding'; }
  else if (Math.abs(D) <= mus * N + TINY) { f = -D; a = 0; state = 'static'; }
  else { f = -Math.sign(D) * muk * N; a = (D + f) / (m1 + m2); state = 'sliding'; }
  const T = m2 * (g - a);
  const kinetic = state === 'sliding';
  return {
    bodies: [
      { key: 'm1', label: 'm₁', m: m1, forces: keep([force('W', 'weight', 'm₁g', 0, -m1 * g), force('N', 'normal', 'N', N * n[0], N * n[1]), force('f', 'friction', kinetic ? 'fₖ' : 'fₛ', f * u[0], f * u[1]), force('T', 'tension', 'T', T * u[0], T * u[1])]), a: [a * u[0], a * u[1]] },
      { key: 'm2', label: 'm₂', m: m2, forces: [force('T', 'tension', 'T', 0, T), force('W', 'weight', 'm₂g', 0, -m2 * g)], a: [0, -a] },
    ],
    info: { a, T, N, f, fsMax: mus * N, state, kinetic },
  };
}

/**
 * Two blocks sliding to the right on a level floor (kinetic friction μk on
 * both, possibly 0). link 'push': F pushes the rear block m1, which pushes the
 * front block m2 with contact force P — a third-law pair. link 'pull': F pulls
 * the front block m2, and a rope between them pulls the rear block m1 with T.
 */
export function pair({ m1, m2, F, muk = 0, link = 'push', g = G }) {
  const M = m1 + m2, a = F / M - muk * g;
  const fr = (m) => force('f', 'friction', 'fₖ', -muk * m * g, 0);
  const base = (m, lab) => [force('W', 'weight', `${lab}g`, 0, -m * g), force('N', 'normal', 'N', 0, m * g), fr(m)];
  let b1, b2, P = 0, T = 0;
  if (link === 'push') {
    P = (m2 * F) / M;
    b1 = [...base(m1, 'm₁'), force('F', 'applied', 'F', F, 0), force('P', 'contact', 'P', -P, 0, { pair: 'P' })];
    b2 = [...base(m2, 'm₂'), force('P', 'contact', 'P', P, 0, { pair: 'P' })];
  } else {
    T = (m1 * F) / M;
    b1 = [...base(m1, 'm₁'), force('T', 'tension', 'T', T, 0)];
    b2 = [...base(m2, 'm₂'), force('F', 'applied', 'F', F, 0), force('T', 'tension', 'T', -T, 0)];
  }
  return {
    bodies: [{ key: 'm1', label: 'm₁', m: m1, forces: keep(b1), a: [a, 0] }, { key: 'm2', label: 'm₂', m: m2, forces: keep(b2), a: [a, 0] }],
    info: { a, P, T },
  };
}

/**
 * A car on a banked curve, seen from behind: the road rises at theta toward
 * the outside of the turn, and the centre of the circle is to the left. The
 * friction a car needs (up-slope positive) is m(g sin θ − (v²/R) cos θ); it
 * holds if that is at most μs N. When it does not, friction is shown at its
 * maximum and the car slides.
 */
export function banked({ m, v, R, theta = 0, mus = 0, g = G }) {
  const th = theta * D2R, c = Math.cos(th), s = Math.sin(th);
  const u = [c, s], n = [-s, c];
  const ac = (v * v) / R;
  let N = m * (g * c + ac * s), f = m * (g * s - ac * c);
  const fMax = mus * N, holds = Math.abs(f) <= fMax + TINY;
  const v0 = Math.sqrt(R * g * Math.tan(th));
  const den = c - mus * s, num = s - mus * c;
  const vmax = den > TINY ? Math.sqrt((R * g * (s + mus * c)) / den) : Infinity;
  const vmin = num > 0 ? Math.sqrt((R * g * num) / (c + mus * s)) : 0;
  let a = [-ac, 0];
  if (!holds) {
    // sliding: friction at its maximum, opposing the slip; N still balances the motion perpendicular to the road
    N = m * g * c + m * ac * s;            // the car stays on the road surface; this is an approximation for the picture only
    f = Math.sign(f) * mus * N;
    const Fx = -N * s + f * c, Fy = N * c + f * s - m * g;
    a = [Fx / m, Fy / m];
  }
  const forces = keep([force('W', 'weight', 'mg', 0, -m * g), force('N', 'normal', 'N', N * n[0], N * n[1]), force('f', 'friction', 'fₛ', f * u[0], f * u[1])]);
  return { bodies: [{ key: 'car', label: 'car', m, forces, a }], info: { N, f, fMax, holds, v0, vmax, vmin, ac, need: m * ac } };
}

/**
 * A car on a vertical circle of radius R at speed v: on top of a hill
 * ('hill'), at the bottom of a dip ('dip'), or inside a loop at its top
 * ('loop-top') or bottom ('loop-bottom'). N = 0 means the car has left the
 * road (hill) or is falling away from the track (loop top).
 */
export function crest({ m, v, R, where = 'hill', g = G }) {
  const ac = (v * v) / R;
  let N, ay;
  if (where === 'hill') { N = Math.max(0, m * (g - ac)); ay = N > 0 ? -ac : -g; }
  else if (where === 'loop-top') { N = Math.max(0, m * (ac - g)); ay = N > 0 ? -ac : -g; }
  else { N = m * (g + ac); ay = ac; }
  const down = where === 'loop-top';
  return {
    bodies: [{ key: 'car', label: 'car', m, forces: keep([force('W', 'weight', 'mg', 0, -m * g), force('N', 'normal', 'N', 0, down ? -N : N)]), a: [0, ay] }],
    info: { N, ac, vcrit: Math.sqrt(g * R), apparent: N / (m * g) },
  };
}

/**
 * A level turn at speed v with the lift (an aircraft) or the string (a
 * conical pendulum) tilted phi degrees from vertical toward the centre, which
 * is to the left: L cos φ = mg and L sin φ = mv²/R, so R = v²/(g tan φ).
 */
export function turn({ m, v, phi, g = G }) {
  const L = (m * g) / Math.cos(phi * D2R), R = (v * v) / (g * Math.tan(phi * D2R));
  return {
    bodies: [{ key: 'craft', label: 'aircraft', m, forces: [force('L', 'lift', 'L', ...polar(L, 90 + phi)), force('W', 'weight', 'mg', 0, -m * g)], a: [-(v * v) / R, 0] }],
    info: { L, R, n: 1 / Math.cos(phi * D2R), ac: (v * v) / R },
  };
}

/** A body with forces given directly: [{ label, mag (N), dir (deg), kind }]. */
export function body({ forces = [], m, a, label = 'body' }) {
  const list = forces.map((f, k) => force(f.key || `F${k}`, f.kind || 'applied', f.label ?? '', ...polar(f.mag, f.dir), f.pair ? { pair: f.pair } : {}));
  return { bodies: [{ key: 'body', label, m, forces: list, a: a || null }], info: {} };
}

export const SCENES = { floor, incline, hang, pulley, elevator, atwood, table, pair, banked, crest, turn, body };

// ─── drag ──────────────────────────────────────────────────────────────────

/** Quadratic drag ½ρ C_D A v², N. CdA is C_D times the frontal area, m². */
export const dragForce = (v, CdA, rho) => 0.5 * rho * CdA * v * v;
/** Terminal speed for quadratic drag, where drag equals weight: √(2mg/(ρ C_D A)), m/s. */
export const terminalSpeed = (m, CdA, rho, g = G) => Math.sqrt((2 * m * g) / (rho * CdA));
/** Speed after falling from rest for time t with quadratic drag: v_t tanh(g t / v_t). */
export const fallSpeed = (t, vt, g = G) => vt * Math.tanh((g * t) / vt);
/** Distance fallen from rest in time t with quadratic drag: (v_t²/g) ln cosh(g t / v_t). */
export function fallDistance(t, vt, g = G) {
  const x = (g * t) / vt;
  // ln cosh x, stable for large x
  return ((vt * vt) / g) * (x > 20 ? x - Math.LN2 : Math.log(Math.cosh(x)));
}
/** Time to reach a fraction q (< 1) of terminal speed with quadratic drag: (v_t/g) artanh q. */
export const timeToFraction = (q, vt, g = G) => (vt / g) * Math.atanh(q);
/** Speed after time t with linear drag (force b v, terminal speed v_t = mg/b): v_t(1 − e^(−g t/v_t)). */
export const fallSpeedLinear = (t, vt, g = G) => vt * (1 - Math.exp((-g * t) / vt));

/**
 * Air density of the 1976 US Standard Atmosphere at a few altitudes (km →
 * kg/m³), interpolated exponentially in between.
 */
export const ATMOSPHERE = [[0, 1.225], [2, 1.007], [5, 0.7364], [10, 0.4135], [15, 0.1948], [20, 0.08891], [25, 0.04008], [30, 0.01841], [35, 0.008463], [40, 0.003996]];
export function airDensity(km) {
  const A = ATMOSPHERE;
  if (km <= A[0][0]) return A[0][1];
  for (let k = 1; k < A.length; k++) {
    if (km <= A[k][0]) {
      const [h0, r0] = A[k - 1], [h1, r1] = A[k];
      return r0 * Math.exp((Math.log(r1 / r0) * (km - h0)) / (h1 - h0));
    }
  }
  return A[A.length - 1][1];
}

// ─── frames ────────────────────────────────────────────────────────────────

/**
 * A train car seen from the ground: 'speed-up' from rest at A, 'steady' at
 * v0, or 'brake' from v0 at A until it stops. Returns its position, velocity
 * and acceleration at time t (m, m/s, m/s²).
 */
export function trainAt(mode, A, v0, t) {
  if (mode === 'speed-up') return { x: 0.5 * A * t * t, v: A * t, a: A };
  if (mode === 'steady') return { x: v0 * t, v: v0, a: 0 };
  const ts = v0 / A;                       // braking: stops at ts
  if (t >= ts) return { x: (v0 * v0) / (2 * A), v: 0, a: 0 };
  return { x: v0 * t - 0.5 * A * t * t, v: v0 - A * t, a: -A };
}

/**
 * A ball resting on the train's frictionless floor at xb (from the car's back
 * wall; the car is `len` long) when the motion starts. Nothing horizontal acts
 * on it until a wall reaches it, so in the ground frame it keeps the train's
 * starting velocity. Returns its ground position and velocity, its position in
 * the car, and whether a wall is pushing it.
 */
export function ballAt(mode, A, v0, t, xb, len) {
  const vStart = mode === 'speed-up' ? 0 : v0;
  const tr = trainAt(mode, A, v0, t);
  const free = xb + vStart * t;                  // ground frame, back wall of the car at x = 0 when t = 0
  let inCar = free - tr.x;
  if (inCar >= 0 && inCar <= len) return { x: free, v: vStart, inCar, pushed: false };
  inCar = Math.min(len, Math.max(0, inCar));     // a wall has caught it: from then on it moves with the car
  return { x: tr.x + inCar, v: tr.v, inCar, pushed: true };
}

/** Steady tilt of a pendulum hanging in a car with horizontal acceleration a: atan(a/g), degrees, bob trailing. */
export const pendulumTilt = (a, g = G) => Math.atan(a / g) / D2R;
