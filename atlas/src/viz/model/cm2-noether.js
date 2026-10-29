// Noether's theorem, numerically (PHYS 3550, M4.4–M4.5). DOM-free; tested in
// test/cm2-var.test.mjs. A 1 kg puck moves in a plane under a potential with
// one symmetry, which a parameter ε breaks:
//
//   rotation     U = ½k(x² + (1 + ε)y²)          rotations about O   ↔ angular momentum L = m(xẏ − yẋ)
//   translation  U = ½k y² + ε(x + 3)             sliding along x    ↔ momentum p_x = mẋ
//   time         U = ½k(1 + ε sin Ωt)(x² + y²)    shifting the clock ↔ energy E = ½mv² + U
//
// (k = 1 N/m, Ω = 2 rad/s — twice the natural frequency, so a breathing spring
// pumps energy in or out; the tilt's zero sits at x = −3, so E stays positive.) Each case keeps the OTHER symmetries, so with ε ≠ 0
// exactly one quantity stops being conserved: the rotation case still
// conserves E, the translation case E, the time case L.

import { rk4 } from './numeric.js';

export const KINDS = ['rotation', 'translation', 'time'];
const K = 1, M = 1, OMEGA = 2;

/** The potential energy U(t, x, y) (J). */
export function potential(kind, eps) {
  if (kind === 'rotation') return (t, x, y) => 0.5 * K * (x * x + (1 + eps) * y * y);
  if (kind === 'translation') return (t, x, y) => 0.5 * K * y * y + eps * (x + 3);
  if (kind === 'time') return (t, x, y) => 0.5 * K * (1 + eps * Math.sin(OMEGA * t)) * (x * x + y * y);
  throw new Error(`unknown kind ${kind}`);
}

/** The force −∇U (N). */
function force(kind, eps) {
  if (kind === 'rotation') return (t, x, y) => [-K * x, -K * (1 + eps) * y];
  if (kind === 'translation') return (t, x, y) => [-eps, -K * y];
  return (t, x, y) => { const k = K * (1 + eps * Math.sin(OMEGA * t)); return [-k * x, -k * y]; };
}

/** Default starts [x, y, vx, vy]: an off-centre ellipse; a puck sliding along a valley; a circular-ish orbit. */
export const START = { rotation: [1, 0, 0, 0.6], translation: [-2.5, 0.8, 1, 0], time: [1, 0, 0, 0.8] };

/** Conserved-quantity candidates on a state. */
export const quantities = (kind, eps) => {
  const U = potential(kind, eps);
  return {
    E: (t, s) => 0.5 * M * (s[2] * s[2] + s[3] * s[3]) + U(t, s[0], s[1]),
    L: (t, s) => M * (s[0] * s[3] - s[1] * s[2]),
    px: (t, s) => M * s[2],
    py: (t, s) => M * s[3],
  };
};

/** Integrate from `start` over [0, T] in `steps` RK4 steps: { t[], s[][], q: { E[], L[], px[], py[] } }. */
export function run(kind, eps, { T = 20, steps = 4000, start = START[kind] } = {}) {
  const f = force(kind, eps);
  const rhs = (t, s) => { const [ax, ay] = f(t, s[0], s[1]); return [s[2], s[3], ax / M, ay / M]; };
  const Q = quantities(kind, eps);
  const ts = [0], ss = [start.slice()], q = { E: [Q.E(0, start)], L: [Q.L(0, start)], px: [Q.px(0, start)], py: [Q.py(0, start)] };
  let s = start.slice(), t = 0;
  const h = T / steps;
  for (let i = 0; i < steps; i++) {
    s = rk4(rhs, t, s, h); t += h;
    ts.push(t); ss.push(s);
    for (const k of Object.keys(q)) q[k].push(Q[k](t, s));
  }
  return { t: ts, s: ss, q };
}

/** The quantity each symmetry protects. */
export const PROTECTS = { rotation: 'L', translation: 'px', time: 'E' };
