// Shared helpers for PHYS 3600 modules M2–M4 (potential, conductors and
// boundary-value problems): Legendre polynomials computed exactly by Bonnet's
// recurrence (coefficients, values, TeX and expression strings), and picture
// builders for em-field, em3-images and em3-relax. Files whose names start
// with "_" are helpers, not lessons.

export { EPS0, KC, sf, th } from './_toolkit.js';

// ── exact rationals, enough for Legendre coefficients ──
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const rat = (n, d = 1) => { const g = gcd(n, d), s = d < 0 ? -1 : 1; return [(s * n) / g, (s * d) / g]; };
const radd = (a, b) => rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const rmul = (a, b) => rat(a[0] * b[0], a[1] * b[1]);

/**
 * The coefficients of P_l(x) as exact fractions [num, den], lowest power first,
 * from Bonnet's recurrence (l+1)P_{l+1} = (2l+1) x P_l − l P_{l−1}.
 */
export function legendreRat(l) {
  let prev = [rat(1)], cur = [rat(0), rat(1)];
  if (l === 0) return prev;
  for (let n = 1; n < l; n++) {
    const next = Array.from({ length: n + 2 }, () => rat(0));
    cur.forEach((c, k) => { next[k + 1] = radd(next[k + 1], rmul(c, rat(2 * n + 1, n + 1))); });
    prev.forEach((c, k) => { next[k] = radd(next[k], rmul(c, rat(-n, n + 1))); });
    prev = cur; cur = next;
  }
  return cur;
}

/** P_l(x) as a number. */
export function P(l, x) {
  let p0 = 1, p1 = x;
  if (l === 0) return 1;
  for (let n = 1; n < l; n++) [p0, p1] = [p1, ((2 * n + 1) * x * p1 - n * p0) / (n + 1)];
  return p1;
}

/** P_l as an Atlas expression in the variable v (e.g. 'cos(t)'): "(3*(v)^2 - 1)/2". */
export function legendreExpr(l, v = 'x') {
  const c = legendreRat(l);
  const terms = c.map(([n, d], k) => (n === 0 ? null : `(${n}/${d})*(${v})^${k}`)).filter(Boolean);
  return terms.join(' + ') || '0';
}

/** P_l as TeX in the variable v (e.g. '\\cos\\theta'): \tfrac12(3x^2 - 1) style, written over a common denominator. */
export function legendreTeX(l, v = 'x') {
  const c = legendreRat(l);
  const D = c.reduce((m, [, d]) => (m * d) / gcd(m, d), 1);
  const ints = c.map(([n, d]) => (n * D) / d);
  let s = '';
  for (let k = ints.length - 1; k >= 0; k--) {
    const a = ints[k];
    if (!a) continue;
    const mag = Math.abs(a), pw = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
    const body = k === 0 ? String(mag) : mag === 1 ? pw : `${mag}${pw}`;
    s += s ? ` ${a < 0 ? '-' : '+'} ${body}` : `${a < 0 ? '-' : ''}${body}`;
  }
  return D === 1 ? s : `\\tfrac{1}{${D}}\\left(${s}\\right)`;
}

/** ∫₋₁¹ f(x) P_l(x) dx by composite Simpson (f a function), for Fourier–Legendre coefficients. */
export function legendreProject(f, l, n = 2000) {
  let s = 0;
  const h = 2 / n;
  for (let k = 0; k <= n; k++) { const x = -1 + k * h, w = k === 0 || k === n ? 1 : k % 2 ? 4 : 2; s += w * f(x) * P(l, x); }
  return (s * h) / 3;
}

// ── pictures ──

/** An em-field picture in cm and nC: static, no readouts, unless overridden. */
export const field = (params, caption) => ({ type: 'em-field', params: { unit: 'cm', qunit: 'nC', static: true, readouts: [], arrows: false, ...params }, caption });

/** An em3-images picture: compact, no panel, no readouts, unless overridden. */
export const images = (params, caption) => ({ type: 'em3-images', params: { readout: false, panel: false, drag: false, controls: false, ...params }, caption });

/** An em3-relax picture: settled, no history, no controls, unless overridden. */
export const relaxPic = (params, caption) => ({ type: 'em3-relax', params: { sweeps: 'converged', history: false, controls: false, play: false, readout: false, ...params }, caption });
