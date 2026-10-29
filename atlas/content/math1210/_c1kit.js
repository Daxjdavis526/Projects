// Small figure builders for the derivative-rule and application lessons
// (C1-3.5 to C1-4.3). Every number spliced into an expression goes through
// N(), so a computed value can never break the expression parser.

const t = String.raw;

/** A number as text an expression can hold (no -0, at most 10 significant figures). */
export const N = (v) => { const s = String(Number(v.toPrecision(10))); return s === '-0' ? '0' : s; };

/** The straight line through (x0, y0) with slope m, as an expression of x. */
export const lineAt = (x0, y0, m) => `(${N(y0)}) + (${N(m)})*(x - (${N(x0)}))`;

/** A sign-aware TeX term: (3, 'x') → "+ 3x", (-1, 'x') → "- x". */
export const sgn = (c, v = '') => `${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 && v ? '' : Math.abs(c)}${v}`;

/**
 * A function on a 'graph' with an optional static tangent line and marked points.
 *   fn         the curve (expression of x)
 *   at         x of the tangent point, with f and df (functions) to place it; omit for no tangent
 *   span       half-width of the drawn tangent segment (default: a fifth of the x range)
 *   points     extra points; curves: extra curves (drawn after the main one)
 */
export function curveFig({ fn, x, y, xlabel, ylabel, at, f, df, span, domain, label, labelAt, points = [], curves = [], extra = {}, caption, aspect = 'wide', tangentLabel, color = 'accent', ...rest }) {
  const cs = [{ fn, color, domain, label, labelAt }];
  const ps = [...points];
  if (at !== undefined) {
    const y0 = f(at), m = df(at), w = span ?? (x[1] - x[0]) / 5;
    cs.push({ fn: lineAt(at, y0, m), color: 'gold', width: 1.8, dash: true, domain: [at - w, at + w] });
    ps.push({ x: at, y: y0, color: 'gold', label: tangentLabel });
  }
  return { type: 'graph', params: { x, y, aspect, xlabel, ylabel, curves: [...cs, ...curves], points: ps, ...rest, ...extra }, caption };   // other graph params (xticks, …) pass straight through
}

/** y-range [lo, hi] that fits f over [a, b] with a margin. */
export function fitY(f, a, b, pad = 0.12, n = 200) {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i <= n; i++) { const v = f(a + (b - a) * i / n); if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
  const d = (hi - lo) || 1;
  return [lo - pad * d, hi + pad * d];
}

/** TeX for a degree angle: 30 → 30^\circ. */
export const degTeX = (d) => t`${d}^\circ`;

/** TeX for a number with thin-space thousands separators: 32500 → 32\,500 (decimals kept as given). */
export const thou = (v, digits = 0) => {
  const [i, f] = Math.abs(v).toFixed(digits).split('.');
  return `${v < 0 ? '-' : ''}${i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')}${f ? '.' + f : ''}`;
};
