// Small formatting helpers shared by the MATH 1220 techniques-of-integration
// lessons (C2-2.2 … C2-2.12). They turn exact rational coefficients into TeX
// fractions and into answer-box text, so a generated answer key and the
// version a learner reads are built from the same numbers.

import { frac, toFraction } from '../../src/core/format.js';
import { parse, compile } from '../../src/core/expr.js';

const t = String.raw;

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

// ─── small static graphs for questions ────────────────────────────────────

const compiled = (src) => compile(parse(String(src), { vars: ['x'] }));

/** A y-range that fits the given curves on [x0, x1], ignoring the extreme tails near asymptotes. */
export function fitY(srcs, [x0, x1], { zero = true, trim = 0 } = {}) {
  const vals = [];
  for (const src of srcs) {
    const g = compiled(src);
    for (let i = 0; i <= 240; i++) { const v = g({ x: x0 + ((x1 - x0) * i) / 240 }); if (Number.isFinite(v)) vals.push(v); }
  }
  if (!vals.length) return [-1, 1];
  vals.sort((a, b) => a - b);
  let lo = vals[Math.floor(trim * (vals.length - 1))], hi = vals[Math.ceil((1 - trim) * (vals.length - 1))];
  if (zero) { lo = Math.min(0, lo); hi = Math.max(0, hi); }
  const pad = 0.12 * (hi - lo || 1);
  return [lo - pad, hi + pad];
}

/** An antiderivative shifted to pass through 0 at the reference point (the first finite one of x0, mid, x1). */
function anchored(F, [x0, x1]) {
  const g = compiled(F);
  for (const xr of [x0 <= 0 && x1 >= 0 ? 0 : x0, (x0 + x1) / 2, x1]) {
    const v = g({ x: xr });
    if (Number.isFinite(v)) return Math.abs(v) < 1e-12 ? `${F}` : `(${F}) - (${v})`;
  }
  return `${F}`;
}

/**
 * A question graph: the integrand f (solid blue), optionally an antiderivative F (dashed
 * amber, shifted through 0), extra curves, shading under f, and h/v lines and points.
 * Pass trim (e.g. 0.03) to ignore the extreme values next to a vertical asymptote.
 */
export function fgraph({ f, F, x = [-2, 2], y, extra = [], shade, vlines, hlines, points, caption, xlabel, ylabel, equal, trim = 0 }) {
  const curves = [{ fn: f, color: 'accent', width: 2.4 }];
  const Fs = F ? anchored(F, x) : null;
  if (Fs) curves.push({ fn: Fs, color: 'warn', dash: true, width: 2 });
  curves.push(...extra);
  const params = { x, y: y || fitY([f, Fs, ...extra.map((c) => c.fn)].filter(Boolean), x, { trim }), curves };
  if (shade) params.shade = (Array.isArray(shade) ? shade : [shade]).map((s) => ({ fn: f, color: 'accent', alpha: 0.25, ...s }));
  if (vlines) params.vlines = vlines;
  if (hlines) params.hlines = hlines;
  if (points) params.points = points;
  if (xlabel !== undefined) params.xlabel = xlabel;
  if (ylabel !== undefined) params.ylabel = ylabel;
  if (equal) params.equal = true;
  return {
    type: 'graph', params,
    caption: caption ?? (F ? t`The integrand (blue) and one antiderivative (dashed): the dashed curve’s slope at every $x$ equals the blue curve’s height.` : 'The integrand.'),
  };
}

