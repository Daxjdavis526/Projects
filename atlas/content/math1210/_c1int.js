// Figure builders for the last Calculus I lessons (C1-4.4 to C1-5.6): a curve
// with a chord, and a curve with its signed area shaded. Numbers spliced into
// expressions go through N() from _c1kit.js, so a computed value cannot break
// the expression parser.
import { N } from './_c1kit.js';

/** The chord of the curve f (a JS function) from x = a to x = b, as an expression of x. */
export const chordAt = (f, a, b) => {
  const m = (f(b) - f(a)) / (b - a);
  return `(${N(f(a))}) + (${N(m)})*(x - (${N(a)}))`;
};

/**
 * A curve with the area between it and the axis shaded from `from` to `to`:
 * blue above the axis, red below (a definite integral counts the red as negative).
 *   fn      the curve, an expression of x
 *   domain  where the curve is drawn (default: everywhere)
 *   more    extra graph params merged in (points, vlines, curves appended)
 */
export function areaFig({ fn, x, y, from, to, caption, xlabel, ylabel, domain, label, labelAt, more = {}, aspect = 'wide', color = 'accent', signed = true }) {
  const { curves = [], ...rest } = more;
  const shade = signed
    ? [{ fn: `max(${fn}, 0)`, from, to, color: 'accent', alpha: 0.24 }, { fn: `min(${fn}, 0)`, from, to, color: 'bad', alpha: 0.24 }]
    : [{ fn, from, to, color: 'accent', alpha: 0.24 }];
  return {
    type: 'graph',
    params: { x, y, aspect, xlabel, ylabel, curves: [{ fn, color, domain, label, labelAt }, ...curves], shade, ...rest },
    caption,
  };
}

/** An integer as TeX with thin-space thousands separators: 30587 → 30\,587 (for use inside $…$). */
export const thou = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
