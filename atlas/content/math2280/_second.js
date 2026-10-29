// Helpers for the DE-3 (second-order linear equations) and DE-7 (series
// solutions) lessons of MATH 2280: number and term formatting, and Bessel
// functions — computed here for answer keys, and written out as Atlas
// expressions (polynomials) so that graph and surface3d pictures can draw them,
// since the expression language has no Bessel function of its own.

/** Round for a sim parameter: 6 significant figures, as a number. */
export const r6 = (v) => +(+v).toPrecision(6);

/** A number for a canvas label, with a true minus sign. */
export const um = (x) => String(x).replace(/-/g, '−');

/** A coefficient in TeX with 1 silent and −1 as a bare minus: co(3) → "3", co(1) → "", co(-1) → "-". */
export const co = (k) => (k === 1 ? '' : k === -1 ? '-' : String(k));

/** A signed TeX term " + 3t" / " - t" / " - 2" (body '' for a constant); zero gives ''. */
export function sg(c, body = '') {
  if (c === 0) return '';
  const mag = Math.abs(c);
  const m = body && mag === 1 ? '' : String(mag);
  return `${c < 0 ? ' - ' : ' + '}${m}${body}`;
}

/** The leading term of a TeX sum: "3t", "-t", "2" — like sg but without a leading plus. */
export function lead(c, body = '') {
  const mag = Math.abs(c);
  const m = body && mag === 1 ? '' : String(mag);
  return `${c < 0 ? '-' : ''}${m}${body}`;
}

const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
/** An integer as Unicode superscript, for canvas labels: sup(-2) → "⁻²". */
export const sup = (n) => String(n).split('').map((ch) => SUP[ch] ?? ch).join('');

/** tᵃ as a canvas label (t, t², t⁻¹ …). */
export const powLabel = (a, v = 't') => (a === 1 ? v : `${v}${sup(a)}`);

const fact = (n) => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };

/** Bessel function of the first kind J_n(x), integer n ≥ 0, by its power series (accurate for |x| ≲ 25). */
export function besselJ(n, x) {
  const h = x / 2;
  let term = h ** n / fact(n), sum = term;
  for (let m = 1; m < 200; m++) {
    term *= (-h * h) / (m * (m + n));
    sum += term;
    if (Math.abs(term) < 1e-17 * Math.max(1, Math.abs(sum)) && m > h) break;
  }
  return sum;
}

/** Derivative J_n′(x) = (J_{n−1} − J_{n+1})/2, with J₀′ = −J₁. */
export const besselJp = (n, x) => (n === 0 ? -besselJ(1, x) : (besselJ(n - 1, x) - besselJ(n + 1, x)) / 2);

/** The k-th positive zero of f on a scan from `from` with step h, refined by bisection. */
function kthZero(f, k, from = 1e-6, h = 0.01) {
  let a = from, fa = f(a), count = 0;
  for (let b = a + h; b < 200; b += h) {
    const fb = f(b);
    if (fa === 0 || fa * fb < 0) {
      count++;
      if (count === k) {
        let lo = a, hi = b;
        for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; }
        return (lo + hi) / 2;
      }
    }
    a = b; fa = fb;
  }
  return NaN;
}

/** j_{n,k}: the k-th positive zero of J_n (j₀,₁ = 2.4048, j₁,₁ = 3.8317 …). */
export const besselZero = (n, k) => kthZero((x) => besselJ(n, x), k, n === 0 ? 1e-6 : 0.5);

/** j′_{n,k}: the k-th positive zero of J_n′ (j′₁,₁ = 1.8412 …); for n = 0 the zero at x = 0 is not counted. */
export const besselZeroP = (n, k) => kthZero((x) => besselJp(n, x), k, 0.05);

/**
 * J_n(arg) as an Atlas expression: the power series written out as a
 * polynomial in `arg` (itself an expression string), with enough terms to be
 * accurate to about 1e-10 for |arg| ≤ amax.
 */
export function jExpr(n, arg, amax) {
  const h = amax / 2;
  let M = 1;
  for (let m = 1, term = h ** n / fact(n); m < 120; m++) {
    term *= (h * h) / (m * (m + n));
    M = m;
    if (term < 1e-11 && m > h) break;
  }
  const z = `(${arg})`;
  const parts = [];
  for (let m = 0; m <= M; m++) {
    const c = (m % 2 ? -1 : 1) / (fact(m) * fact(m + n) * 2 ** (2 * m + n));
    const p = 2 * m + n;
    const mag = Math.abs(c).toPrecision(15);
    const body = p === 0 ? mag : `${mag}*${z}^${p}`;
    parts.push(parts.length ? `${c < 0 ? ' - ' : ' + '}${body}` : `${c < 0 ? '-' : ''}${body}`);
  }
  return `(${parts.join('')})`;
}

/** Y₀(arg), the Bessel function of the second kind of order 0, as an Atlas expression (valid for 0 < arg ≤ amax). */
export function y0Expr(arg, amax) {
  const GAMMA_E = 0.5772156649015329;
  const h = amax / 2;
  let M = 1;
  for (let m = 1, term = 1; m < 120; m++) { term *= (h * h) / (m * m); M = m; if (term * Math.log(m + 1) < 1e-11 && m > h) break; }
  const z = `(${arg})`;
  const parts = [];
  let H = 0;
  for (let m = 1; m <= M; m++) {
    H += 1 / m;
    const c = (2 / Math.PI) * (m % 2 ? 1 : -1) * H / (fact(m) ** 2 * 4 ** m);
    parts.push(`${c < 0 ? ' - ' : ' + '}${Math.abs(c).toPrecision(15)}*${z}^${2 * m}`);
  }
  return `(${(2 / Math.PI).toPrecision(15)}*(ln(${z}/2) + ${GAMMA_E})*${jExpr(0, arg, amax)}${parts.join('')})`;
}
