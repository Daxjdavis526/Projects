// Small formatting helpers shared by the MATH 1220 techniques-of-integration
// lessons (C2-2.2 … C2-2.12). They turn exact rational coefficients into TeX
// fractions and into answer-box text, so a generated answer key and the
// version a learner reads are built from the same numbers.

import { frac, toFraction } from '../../src/core/format.js';

/** A signed term in TeX: fterm(-0.5, 'x^{2}') → ' - \frac{1}{2}x^{2}'; first terms carry no leading '+'. */
export function fterm(c, body = '', first = false) {
  if (c === 0) return '';
  const m = Math.abs(c);
  const mag = body && Math.abs(m - 1) < 1e-12 ? body : `${frac(m)}${body}`;
  if (first) return c < 0 ? `-${mag}` : mag;
  return c < 0 ? ` - ${mag}` : ` + ${mag}`;
}

/** A polynomial with rational coefficients in TeX, highest power first; coefs[k] multiplies v^k. */
export function fpoly(coefs, v = 'x') {
  let out = '';
  for (let k = coefs.length - 1; k >= 0; k--) {
    const c = coefs[k];
    if (!c) continue;
    const pow = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
    out += fterm(c, pow, out === '');
  }
  return out || '0';
}

/** A rational number as answer-box text, bracketed: 0.5 → '(1/2)', -3 → '(-3)'. */
export function q(x) {
  const [p, d] = toFraction(x);
  if (Math.abs(p / d - x) > 1e-12) return `(${x})`;
  return d === 1 ? `(${p})` : `(${p}/${d})`;
}

/** The same polynomial as answer-box text: (1/2)*x^2 + (-1/4)*x + (1/8). */
export function ptext(coefs, v = 'x') {
  const parts = [];
  for (let k = coefs.length - 1; k >= 0; k--) {
    const c = coefs[k];
    if (!c) continue;
    parts.push(k === 0 ? q(c) : `${q(c)}*${k === 1 ? v : `${v}^${k}`}`);
  }
  return parts.length ? parts.join(' + ') : '0';
}

/** TeX for a signed integer or rational shift inside a bracket: shift(-3) → '- 3', shift(2) → '+ 2'. */
export const shift = (c) => (c < 0 ? `- ${frac(-c)}` : `+ ${frac(c)}`);

/** A coefficient times a variable, for TeX or answer text: kx(1) → 'x', kx(-1) → '-x', kx(3) → '3x'. */
export const kx = (k, v = 'x') => (k === 1 ? v : k === -1 ? `-${v}` : `${k}${v}`);
