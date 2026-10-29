// Shared bits for the special-function lessons of st-e (E6–E12) and the boss:
// polynomial coefficients by recurrence (as Atlas expressions and TeX), picture
// builders, sources. Every value comes from src/viz/model/fa2-special.js or
// from the recurrences here — nothing is typed from a table.
import { legendreExpr, legendreTeX, legendreRat } from '../phys3600/_bvp.js';
import * as SF from '../../src/viz/model/fa2-special.js';
import { r3, r4 } from './_fa.js';

export { SF, legendreExpr, legendreTeX, legendreRat, r3, r4 };

export const PI = Math.PI;
export const SQPI = Math.sqrt(Math.PI);

// polynomial coefficient arrays, lowest power first
const padd = (a, b) => Array.from({ length: Math.max(a.length, b.length) }, (_, k) => (a[k] || 0) + (b[k] || 0));
const pscale = (a, s) => a.map((c) => c * s);
const pshift = (a) => [0, ...a];            // multiply by x

/** Physicists' Hermite coefficients: H_{n+1} = 2xHₙ − 2nH_{n−1}. */
export function hermiteCoef(n) {
  let a = [1], b = [0, 2];
  if (n === 0) return a;
  for (let k = 1; k < n; k++) [a, b] = [b, padd(pscale(pshift(b), 2), pscale(a, -2 * k))];
  return b;
}
/** Laguerre coefficients (α = 0): (k+1)L_{k+1} = (2k+1−x)L_k − kL_{k−1}. */
export function laguerreCoef(n) {
  let a = [1], b = [1, -1];
  if (n === 0) return a;
  for (let k = 1; k < n; k++) [a, b] = [b, pscale(padd(padd(pscale(b, 2 * k + 1), pscale(pshift(b), -1)), pscale(a, -k)), 1 / (k + 1))];
  return b;
}
/** Chebyshev Tₙ coefficients. */
export function chebCoef(n) {
  let a = [1], b = [0, 1];
  if (n === 0) return a;
  for (let k = 1; k < n; k++) [a, b] = [b, padd(pscale(pshift(b), 2), pscale(a, -1))];
  return b;
}
const num12 = (c) => String(+c.toPrecision(12));
/** An Atlas expression from coefficients, in variable v. */
export function polyExpr(c, v = 'x') {
  const t = c.map((a, k) => (Math.abs(a) < 1e-14 ? null : k === 0 ? `(${num12(a)})` : `(${num12(a)})*(${v})^${k}`)).filter(Boolean);
  return t.join(' + ') || '0';
}
/** TeX from integer-or-simple-fraction coefficients, highest power first. */
export function polyTeXDesc(c, v = 'x', fracs = false) {
  let s = '';
  for (let k = c.length - 1; k >= 0; k--) {
    const a = c[k];
    if (Math.abs(a) < 1e-14) continue;
    const mag = Math.abs(a);
    let m = String(+mag.toPrecision(10));
    if (fracs && !Number.isInteger(mag)) { const d = [2, 3, 4, 6, 8, 12, 24, 120, 720].find((q) => Math.abs(mag * q - Math.round(mag * q)) < 1e-9); if (d) m = `\\tfrac{${Math.round(mag * d)}}{${d}}`; }
    const pw = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
    const body = k === 0 ? m : mag === 1 ? pw : `${m}${pw}`;
    s += s ? ` ${a < 0 ? '-' : '+'} ${body}` : `${a < 0 ? '-' : ''}${body}`;
  }
  return s || '0';
}

export const hermiteExpr = (n, v = 'x') => polyExpr(hermiteCoef(n), v);
export const laguerreExpr = (n, v = 'x') => polyExpr(laguerreCoef(n), v);
export const chebExpr = (n, v = 'x') => polyExpr(chebCoef(n), v);

/** A static graph picture. */
export const gpic = (params, caption) => ({ type: 'graph', params: { aspect: 'wide', axesAt: 'edge', ylabel: '', ...params }, caption });

/** Gauss–Legendre on [a, b] with many panels: the lessons’ quadrature for checking numbers. */
export const quad = (f, a, b, panels = 40) => SF.integrate(f, a, b, panels);

export const SRC = {
  dlmf18: { label: 'NIST Digital Library of Mathematical Functions, ch. 18 (orthogonal polynomials)', url: 'https://dlmf.nist.gov/18' },
  dlmf14: { label: 'NIST Digital Library of Mathematical Functions, §14.30 (spherical harmonics)', url: 'https://dlmf.nist.gov/14.30' },
  dlmf10: { label: 'NIST Digital Library of Mathematical Functions, ch. 10 (Bessel functions)', url: 'https://dlmf.nist.gov/10' },
  dlmf5: { label: 'NIST Digital Library of Mathematical Functions, ch. 5 (the Gamma function)', url: 'https://dlmf.nist.gov/5' },
  arfken: { label: 'G. B. Arfken, H. J. Weber & F. E. Harris, Mathematical Methods for Physicists, 7th ed. (Academic Press, 2013), ch. 12–15', url: 'https://openlibrary.org/isbn/9780123846549' },
  boas: { label: 'M. L. Boas, Mathematical Methods in the Physical Sciences, 3rd ed. (Wiley, 2006), ch. 9, 11–13', url: 'https://openlibrary.org/isbn/9780471198260' },
  rhb: { label: 'K. F. Riley, M. P. Hobson & S. J. Bence, Mathematical Methods for Physics and Engineering, 3rd ed. (Cambridge, 2006), ch. 18, 22', url: 'https://doi.org/10.1017/CBO9780511810763' },
  watson: { label: 'G. N. Watson, A Treatise on the Theory of Bessel Functions, 2nd ed. (Cambridge, 1944)', url: 'https://openlibrary.org/search?q=Watson+Treatise+Theory+of+Bessel+Functions' },
  trefethen: { label: 'L. N. Trefethen, Approximation Theory and Approximation Practice (SIAM, 2013), ch. 3, 7, 8', url: 'https://people.maths.ox.ac.uk/trefethen/ATAP/' },
  boyd: { label: 'J. P. Boyd, Chebyshev and Fourier Spectral Methods, 2nd ed. (Dover, 2001), ch. 2', url: 'https://openlibrary.org/isbn/9780486411835' },
  gelfand: { label: 'I. M. Gelfand & S. V. Fomin, Calculus of Variations (Prentice-Hall, 1963; Dover 2000), ch. 1–2', url: 'https://openlibrary.org/isbn/9780486414485' },
  hurwitz: { label: 'A. Hurwitz, “Sur le problème des isopérimètres”, C. R. Acad. Sci. Paris 132, 401 (1901)', url: 'https://gallica.bnf.fr/ark:/12148/bpt6k3086n/f401.item' },
  stakgold: { label: 'I. Stakgold & M. Holst, Green’s Functions and Boundary Value Problems, 3rd ed. (Wiley, 2011), ch. 3', url: 'https://doi.org/10.1002/9780470906538' },
};
