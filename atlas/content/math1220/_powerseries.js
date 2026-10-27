// Shared helpers for the power- and Taylor-series lessons (C2-5.x): exact
// factorials and binomial coefficients, and polynomials with rational
// coefficients written both as TeX and as answer-box text, so a printed
// polynomial and its answer key always come from the same numbers.
// Files whose names start with "_" are helpers, not lessons.

import { toFraction } from '../../src/core/format.js';

/** n! for a small non-negative integer. */
export const fact = (n) => { let p = 1; for (let k = 2; k <= n; k++) p *= k; return p; };

/** The generalised binomial coefficient C(r, n) = r(r − 1)…(r − n + 1)/n!, for any real r. */
export function binom(r, n) {
  let p = 1;
  for (let k = 0; k < n; k++) p *= (r - k) / (k + 1);
  return p;
}

/** [p, q] with p/q = x (q ≤ 10⁶, lowest terms), or null if x is not such a fraction. */
export function rational(x) {
  if (Number.isInteger(x)) return [x, 1];
  const [p, q] = toFraction(x, 1e6);
  return Math.abs(p / q - x) <= 1e-12 * Math.max(1, Math.abs(x)) ? [p, q] : null;
}

/** A rational number as TeX: 3, -\tfrac{1}{8}. */
export function ratTeX(x) {
  const f = rational(x);
  if (!f) throw new Error(`${x} is not a simple fraction`);
  const [p, q] = f;
  return q === 1 ? String(p) : `${p < 0 ? '-' : ''}\\tfrac{${Math.abs(p)}}{${q}}`;
}

/**
 * The polynomial Σ coefs[k]·v^k with rational coefficients, as TeX and as
 * answer-box text: ratPoly([1, 2, 1.5]) gives
 *   { tex: '1 + 2x + \tfrac{3}{2}x^{2}', text: '1 + 2*x + 3/2*x^2' }.
 * v may be a bracketed expression such as '(x - 4)'.
 */
export function ratPoly(coefs, v = 'x') {
  let tex = '', text = '';
  coefs.forEach((c, k) => {
    if (!c) return;
    const f = rational(c);
    if (!f) throw new Error(`coefficient ${c} is not a simple fraction`);
    const [p, q] = f, mag = Math.abs(p);
    const powTeX = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
    const powText = k === 0 ? '' : k === 1 ? v : `${v}^${k}`;
    let bt, bx;
    if (q === 1) {
      bt = k > 0 && mag === 1 ? powTeX : `${mag}${powTeX}`;
      bx = k > 0 && mag === 1 ? powText : `${mag}${k > 0 ? '*' : ''}${powText}`;
    } else {
      bt = `\\tfrac{${mag}}{${q}}${powTeX}`;
      bx = `${mag}/${q}${k > 0 ? '*' : ''}${powText}`;
    }
    if (!tex) { tex = (p < 0 ? '-' : '') + bt; text = (p < 0 ? '-' : '') + bx; }
    else { tex += ` ${p < 0 ? '-' : '+'} ${bt}`; text += ` ${p < 0 ? '-' : '+'} ${bx}`; }
  });
  return { tex: tex || '0', text: text || '0' };
}
