// Pure helpers: math, easing, deterministic randomness, colour.
// No DOM, no canvas — the tests import this directly.

export const W = 1920;
export const H = 1080;
export const TAU = Math.PI * 2;

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, k) => a + (b - a) * k;
export const invlerp = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
export const smoother = (k) => { k = clamp(k); return k * k * k * (k * (k * 6 - 15) + 10); };
export const easeIn = (k) => { k = clamp(k); return k * k * k; };
export const easeOut = (k) => { k = clamp(k); return 1 - (1 - k) ** 3; };
export const easeInOut = (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2; };
export const easeOutBack = (k) => { k = clamp(k); const c = 1.4; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };

// 0 before a, 1 after b, eased between.
export const ramp = (t, a, b, e = smooth) => e(invlerp(a, b, t));
// Rises over [a, a+fi], holds, falls over [b-fo, b].
export const win = (t, a, b, fi = 1, fo = fi) =>
  Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));

// Interpolate a keyframe list [[t, v], ...] (numbers or arrays), eased per segment.
export function keys(t, list, e = smooth) {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i][0]) {
      const [t0, a] = list[i - 1];
      const [t1, b] = list[i];
      const k = e((t - t0) / (t1 - t0));
      if (Array.isArray(a)) return a.map((v, j) => lerp(v, b[j], k));
      return lerp(a, b, k);
    }
  }
  return list[list.length - 1][1];
}

// Deterministic hash of an integer (and optional seed) to [0, 1).
export function hash(n, seed = 0) {
  let x = (Math.imul(n | 0, 0x27d4eb2d) ^ Math.imul(seed | 0, 0x165667b1)) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) >>> 0;
  x = Math.imul(x ^ (x >>> 12), 0x297a2d39) >>> 0;
  x = (x ^ (x >>> 15)) >>> 0;
  return x / 4294967296;
}

// mulberry32
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 1-D value noise in [-1, 1].
export function noise1(x, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed), hash(i + 1, seed), u) * 2 - 1;
}
export function fbm1(x, seed = 0, oct = 4) {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let o = 0; o < oct; o++) { s += a * noise1(x * f, seed + o * 17); n += a; a *= 0.5; f *= 2.03; }
  return s / n;
}

// Colour. Colours are '#rrggbb' strings or [r, g, b] arrays.
export function rgb(c) {
  if (Array.isArray(c)) return c;
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a, b, k) {
  const A = rgb(a), B = rgb(b);
  return [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)];
}
export function css(c, alpha = 1) {
  const [r, g, b] = rgb(c);
  return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
}

export const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// 'C#4' -> 61
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function note(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
