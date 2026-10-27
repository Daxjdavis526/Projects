// Number formatting for question text and solutions: significant figures,
// scientific notation in TeX, and tidy fractions. Authors build every number
// a learner reads with these, so a computed answer and its printed version
// can never disagree.

/** Round to n significant figures, returning a number. */
export function sig(x, n = 3) {
  if (x === 0 || !Number.isFinite(x)) return x;
  const p = Math.floor(Math.log10(Math.abs(x)));
  const f = 10 ** (n - 1 - p);
  return Math.round(x * f) / f;
}

/**
 * Plain-text number with n significant figures. Large and small magnitudes
 * switch to e-notation, which the answer box also accepts ("3.00e8").
 */
export function fmt(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = x.toExponential(n - 1).split('e');
    return `${m}e${parseInt(e, 10)}`;
  }
  return trimFixed(x, n);
}

function trimFixed(x, n) {
  const p = Math.floor(Math.log10(Math.abs(x)));
  const decimals = Math.max(0, n - 1 - p);
  return sig(x, n).toFixed(decimals);
}

/** TeX for a number with n significant figures: 3.00 \times 10^{8}. */
export function tex(x, n = 3) {
  if (!Number.isFinite(x)) return x > 0 ? '\\infty' : x < 0 ? '-\\infty' : '\\text{undefined}';
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = x.toExponential(n - 1).split('e');
    return `${m} \\times 10^{${parseInt(e, 10)}}`;
  }
  return trimFixed(x, n);
}

/** A number as an exact integer or decimal if it is one, otherwise n sig figs. */
export function nice(x, n = 4) {
  if (Number.isInteger(x)) return String(x);
  const r = Math.round(x * 1e6) / 1e6;
  if (Math.abs(r - x) < 1e-12 && String(r).length <= 8) return String(r);
  return fmt(x, n);
}

/** Best rational approximation p/q with q ≤ maxDen (continued fractions). */
export function toFraction(x, maxDen = 1000) {
  let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0, k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    if (Math.abs(x - h1 / k1) < 1e-12) break;
    b = 1 / (b - a);
    if (!Number.isFinite(b)) break;
  }
  return [h1, k1];
}

/** TeX fraction for a rational number: 3/4 → \frac{3}{4}, −2 → -2. */
export function frac(x, maxDen = 1000) {
  const [p, q] = toFraction(x, maxDen);
  if (Math.abs(p / q - x) > 1e-9) return tex(x, 4);
  if (q === 1) return String(p);
  return `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}`;
}

/** Signed term for building expressions: coef(3,'x') → "+ 3x", coef(-1,'x') → "- x". */
export function term(c, v = '', first = false) {
  if (c === 0) return '';
  const sign = c < 0 ? '-' : first ? '' : '+';
  const mag = Math.abs(c);
  const body = v && mag === 1 ? v : `${nice(mag)}${v}`;
  return `${first ? sign : ` ${sign} `}${body}`.replace(/^ \+ /, first ? '' : ' + ');
}

/** A polynomial in TeX from coefficients [a0, a1, a2, ...]. */
export function polyTeX(coefs, v = 'x') {
  let out = '';
  for (let k = coefs.length - 1; k >= 0; k--) {
    const c = coefs[k];
    if (!c) continue;
    const pow = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
    const mag = Math.abs(c);
    const body = k > 0 && mag === 1 ? pow : `${nice(mag)}${pow}`;
    out += out ? (c < 0 ? ` - ${body}` : ` + ${body}`) : (c < 0 ? `-${body}` : body);
  }
  return out || '0';
}

/** The same polynomial as answer-box text: 3x^2 - x + 2. */
export function polyText(coefs, v = 'x') {
  let out = '';
  for (let k = coefs.length - 1; k >= 0; k--) {
    const c = coefs[k];
    if (!c) continue;
    const pow = k === 0 ? '' : k === 1 ? v : `${v}^${k}`;
    const mag = Math.abs(c);
    const body = k > 0 && mag === 1 ? pow : `${nice(mag)}${k > 0 ? '*' : ''}${pow}`;
    out += out ? (c < 0 ? ` - ${body}` : ` + ${body}`) : (c < 0 ? `-${body}` : body);
  }
  return out || '0';
}

export const deg = (rad) => rad * 180 / Math.PI;
export const rad = (d) => d * Math.PI / 180;
