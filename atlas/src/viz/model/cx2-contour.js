// Contour integrals in the complex plane, DOM-free: a small compiler for
// complex expressions written by authors ("1/(z^2 + 1)", "exp(z)/(z - a)"),
// contours built from circles, arcs, segments, polygons and parametrised
// curves, the integral ∮ f(z) dz by composite Gauss–Legendre quadrature, the
// Riemann sum Σ f(zₖ)Δzₖ as a chain of arrows laid head to tail, the winding
// number of a contour round a point, and the length L and maximum M of |f|
// along a contour (the ML bound). Used by the cx2-contour simulation and
// tested by test/cx2-contour.test.mjs.

const TAU = 2 * Math.PI;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const scale = (a, s) => [a[0] * s, a[1] * s];
export const abs = (a) => Math.hypot(a[0], a[1]);
export const arg = (a) => Math.atan2(a[1], a[0]);
export function div(a, b) {
  const d = b[0] * b[0] + b[1] * b[1];
  if (d === 0) return [Infinity, Infinity];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
}
export const cexp = (a) => { const r = Math.exp(a[0]); return [r * Math.cos(a[1]), r * Math.sin(a[1])]; };
export const clog = (a) => [Math.log(abs(a)), arg(a)];
function cpow(a, b) {
  if (Math.abs(b[1]) < 1e-15 && Number.isInteger(b[0]) && Math.abs(b[0]) <= 64) {
    let n = Math.abs(b[0]), p = [1, 0], q = a;
    while (n) { if (n & 1) p = mul(p, q); q = mul(q, q); n >>= 1; }
    return b[0] < 0 ? div([1, 0], p) : p;
  }
  if (a[0] === 0 && a[1] === 0) return b[0] > 0 ? [0, 0] : [Infinity, Infinity];
  return cexp(mul(b, clog(a)));
}
const csin = (a) => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])];
const ccos = (a) => [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])];
const csinh = (a) => [Math.sinh(a[0]) * Math.cos(a[1]), Math.cosh(a[0]) * Math.sin(a[1])];
const ccosh = (a) => [Math.cosh(a[0]) * Math.cos(a[1]), Math.sinh(a[0]) * Math.sin(a[1])];
const csqrt = (a) => { const r = Math.sqrt(abs(a)), t = arg(a) / 2; return [r * Math.cos(t), r * Math.sin(t)]; };

/** The functions an expression may call: each takes and returns [re, im]. */
export const FUNCS = {
  exp: cexp, log: clog, ln: clog, sqrt: csqrt, sin: csin, cos: ccos,
  tan: (a) => div(csin(a), ccos(a)), cot: (a) => div(ccos(a), csin(a)),
  sinh: csinh, cosh: ccosh, tanh: (a) => div(csinh(a), ccosh(a)),
  conj: (a) => [a[0], -a[1]], re: (a) => [a[0], 0], im: (a) => [a[1], 0],
  abs: (a) => [abs(a), 0], arg: (a) => [arg(a), 0],
};

// ── the expression compiler ──
function tokenize(src) {
  const out = [];
  const s = String(src);
  let k = 0;
  while (k < s.length) {
    const c = s[k];
    if (/\s/.test(c)) { k++; continue; }
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(k));
    if (num) { out.push({ t: 'n', v: parseFloat(num[0]) }); k += num[0].length; continue; }
    const id = /^[A-Za-z_][A-Za-z_0-9]*/.exec(s.slice(k));
    if (id) { out.push({ t: 'id', v: id[0] }); k += id[0].length; continue; }
    if ('+-*/^(),'.includes(c)) { out.push({ t: c }); k++; continue; }
    throw new Error(`unexpected “${c}”`);
  }
  return out;
}

/**
 * Compile a complex expression of z (and of real parameters `keys`) into a
 * function (z, env) → [re, im]. Syntax: + − * / ^, brackets, implicit
 * multiplication (2z, 3i, 2(z + 1)), i, pi, e, x = Re z, y = Im z, and the
 * functions in FUNCS (principal branches of log and sqrt; ^ with a whole
 * exponent is exact, otherwise e^{b Log a}).
 */
export function compile(src, keys = []) {
  const T = tokenize(src);
  let p = 0;
  const peek = () => T[p], next = () => T[p++];
  const expect = (t) => { const x = next(); if (!x || x.t !== t) throw new Error(`expected “${t}”`); };
  const known = new Set(keys);
  function expr() {
    let a = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = next().t, b = term(), l = a;
      a = op === '+' ? (z, E) => add(l(z, E), b(z, E)) : (z, E) => sub(l(z, E), b(z, E));
    }
    return a;
  }
  const startsAtom = (x) => x && (x.t === 'n' || x.t === 'id' || x.t === '(');
  function term() {
    let a = unary();
    for (;;) {
      const x = peek();
      if (x && (x.t === '*' || x.t === '/')) {
        next();
        const b = unary(), l = a;
        a = x.t === '*' ? (z, E) => mul(l(z, E), b(z, E)) : (z, E) => div(l(z, E), b(z, E));
      } else if (startsAtom(x)) {
        const b = power(), l = a;
        a = (z, E) => mul(l(z, E), b(z, E));
      } else return a;
    }
  }
  function unary() {
    const x = peek();
    if (x && x.t === '-') { next(); const a = unary(); return (z, E) => scale(a(z, E), -1); }
    if (x && x.t === '+') { next(); return unary(); }
    return power();
  }
  function power() {
    const a = atom();
    if (peek() && peek().t === '^') { next(); const b = unary(); return (z, E) => cpow(a(z, E), b(z, E)); }
    return a;
  }
  function atom() {
    const x = next();
    if (!x) throw new Error('unexpected end');
    if (x.t === 'n') { const v = [x.v, 0]; return () => v; }
    if (x.t === '(') { const a = expr(); expect(')'); return a; }
    if (x.t !== 'id') throw new Error(`unexpected “${x.t}”`);
    const name = x.v;
    if (peek() && peek().t === '(' && FUNCS[name]) {
      next(); const a = expr(); expect(')');
      const F = FUNCS[name];
      return (z, E) => F(a(z, E));
    }
    if (FUNCS[name]) throw new Error(`${name} needs brackets: ${name}(…)`);
    if (name === 'z') return (z) => z;
    if (name === 'i') return () => [0, 1];
    if (name === 'pi') return () => [Math.PI, 0];
    if (name === 'e' && !known.has('e')) return () => [Math.E, 0];
    if (name === 'x' && !known.has('x')) return (z) => [z[0], 0];
    if (name === 'y' && !known.has('y')) return (z) => [z[1], 0];
    if (known.has(name)) return (z, E) => [+E[name], 0];
    throw new Error(`unknown name “${name}”`);
  }
  const f = expr();
  if (p < T.length) throw new Error(`unexpected “${T[p].t === 'id' || T[p].t === 'n' ? T[p].v : T[p].t}”`);
  return (z, E = {}) => f(z, E);
}

// ── contours ──
// A contour is a list of pieces, each { z(u), dz(u) } for u in [0, 1].
// Specs (all numbers already evaluated):
//   { kind: 'circle', c: [x, y], r, ccw = true, start = 0 }   (start: the angle where it begins)
//   { kind: 'arc', c, r, from, to }                           (angles in radians; from > to runs clockwise)
//   { kind: 'segment', from: [x, y], to: [x, y] }
//   { kind: 'poly', pts: [[x, y], …], closed = true }
//   { kind: 'rect', x: [a, b], y: [c, d], ccw = true }
//   { kind: 'param', z(t) → [x, y], t: [a, b] }               (derivative by central differences)
//   { kind: 'path', parts: [spec, …] }                        (pieces joined in order)
export function pieces(spec) {
  if (!spec) return [];
  switch (spec.kind) {
    case 'circle': {
      const s = spec.ccw === false ? -1 : 1, a0 = spec.start || 0;
      return pieces({ kind: 'arc', c: spec.c, r: spec.r, from: a0, to: a0 + s * TAU });
    }
    case 'arc': {
      const [cx, cy] = spec.c, r = spec.r, a = spec.from, d = spec.to - spec.from;
      return [{ z: (u) => [cx + r * Math.cos(a + d * u), cy + r * Math.sin(a + d * u)], dz: (u) => [-r * d * Math.sin(a + d * u), r * d * Math.cos(a + d * u)], closed: Math.abs(Math.abs(d) - TAU) < 1e-12 }];
    }
    case 'segment': {
      const [a, b] = [spec.from, spec.to], d = sub(b, a);
      return [{ z: (u) => [a[0] + d[0] * u, a[1] + d[1] * u], dz: () => d }];
    }
    case 'poly': {
      const P = spec.pts, closed = spec.closed !== false, out = [];
      for (let k = 0; k < P.length - (closed ? 0 : 1); k++) out.push(...pieces({ kind: 'segment', from: P[k], to: P[(k + 1) % P.length] }));
      return out;
    }
    case 'rect': {
      const [a, b] = spec.x, [c, d] = spec.y;
      const pts = [[a, c], [b, c], [b, d], [a, d]];
      return pieces({ kind: 'poly', pts: spec.ccw === false ? pts.reverse() : pts });
    }
    case 'param': {
      const [t0, t1] = spec.t, Z = spec.z, h = 1e-5;
      const z = (u) => Z(t0 + (t1 - t0) * u);
      return [{ z, dz: (u) => scale(sub(z(Math.min(1, u + h)), z(Math.max(0, u - h))), 1 / (Math.min(1, u + h) - Math.max(0, u - h))) }];
    }
    case 'path': return spec.parts.flatMap(pieces);
    default: throw new Error(`unknown contour kind “${spec.kind}”`);
  }
}

// 8-point Gauss–Legendre nodes and weights on [0, 1]
const GX = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363].map((x) => (x + 1) / 2);
const GW = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763].map((w) => w / 2);

/** ∫ f(z) dz along the contour (composite Gauss–Legendre, `panels` panels per piece). */
export function integrate(f, spec, panels = 96) {
  let s = [0, 0];
  for (const P of pieces(spec)) {
    for (let j = 0; j < panels; j++) {
      for (let q = 0; q < 8; q++) {
        const u = (j + GX[q]) / panels;
        s = add(s, scale(mul(f(P.z(u)), P.dz(u)), GW[q] / panels));
      }
    }
  }
  return s;
}

/** Points along the whole contour, n per piece (n + 1 with the end). */
export function sample(spec, n = 200) {
  const out = [];
  for (const P of pieces(spec)) for (let k = 0; k <= n; k++) out.push(P.z(k / n));
  return out;
}

/** Arc length of the contour. */
export function length(spec, panels = 64) {
  let L = 0;
  for (const P of pieces(spec)) for (let j = 0; j < panels; j++) for (let q = 0; q < 8; q++) L += abs(P.dz((j + GX[q]) / panels)) * GW[q] / panels;
  return L;
}

/**
 * The Riemann sum Σ f(zₖ)Δzₖ over N pieces of equal parameter (spread over the
 * contour's pieces in proportion to their lengths), with f at each piece's
 * midpoint. Returns { arrows: [{ z, dz, fz, a }] (a = f·Δz), chain: partial sums from 0 }.
 */
export function riemann(f, spec, N = 24) {
  const PS = pieces(spec);
  const lens = PS.map((P) => pieceLength(P));
  const total = lens.reduce((x, y) => x + y, 0) || 1;
  const counts = lens.map((l) => Math.max(1, Math.round((N * l) / total)));
  const arrows = [], chain = [[0, 0]];
  PS.forEach((P, i) => {
    const n = counts[i];
    for (let k = 0; k < n; k++) {
      const z0 = P.z(k / n), z1 = P.z((k + 1) / n), zm = P.z((k + 0.5) / n);
      const dz = sub(z1, z0), fz = f(zm), a = mul(fz, dz);
      arrows.push({ z: zm, z0, z1, dz, fz, a });
      chain.push(add(chain[chain.length - 1], a));
    }
  });
  return { arrows, chain };
}
function pieceLength(P, panels = 32) {
  let L = 0;
  for (let j = 0; j < panels; j++) for (let q = 0; q < 8; q++) L += abs(P.dz((j + GX[q]) / panels)) * GW[q] / panels;
  return L;
}

/** How many times the contour winds anticlockwise round p (rounded; NaN if it passes through p). */
export function winding(spec, p, n = 600) {
  const pts = sample(spec, n);
  let turn = 0;
  for (let k = 1; k < pts.length; k++) {
    const a = sub(pts[k - 1], p), b = sub(pts[k], p);
    if (abs(a) < 1e-9 || abs(b) < 1e-9) return NaN;
    turn += Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]);
  }
  return turn / TAU;
}

/** The largest |f| on the contour, and where: { M, at }. */
export function maxAbs(f, spec, n = 800) {
  let M = -Infinity, at = null;
  for (const z of sample(spec, n)) { const v = abs(f(z)); if (!(v <= M)) { M = v; at = z; } }
  return { M, at };
}

/** True when f blows up (or is undefined) somewhere on the contour, sampled finely. */
export function hitsSingularity(f, spec, n = 800, big = 1e6) {
  return sample(spec, n).some((z) => { const v = abs(f(z)); return !(v < big); });
}
