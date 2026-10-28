// The arithmetic behind the linear-algebra simulations, DOM-free and tested
// headlessly (test/la-linear.test.mjs):
//   - exact rationals, so a reduced matrix shows 3/2, not 1.4999999;
//   - row reduction one operation at a time — forward elimination to row
//     echelon form, Gauss–Jordan to reduced form, or LU with its multipliers —
//     with every operation recorded and written out as TeX;
//   - what a reduced augmented matrix says: rank, consistency, a particular
//     solution and the directions of the solution set;
//   - the 2×2 geometry of la-map2d: products, determinant, inverse, real
//     invariant lines; and the plane two vectors span, for la-vectors.

// ── rationals: [n, d] with d > 0 and gcd(|n|, d) = 1 ─────────────────────
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export function Q(n, d = 1) {
  if (d === 0) throw new Error('rational with zero denominator');
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`rational needs integers (got ${n}/${d})`);
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  n /= g; d /= g;
  if (Math.abs(n) > Number.MAX_SAFE_INTEGER || d > Number.MAX_SAFE_INTEGER) throw new Error('rational overflow');
  return [n === 0 ? 0 : n, n === 0 ? 1 : d];
}
export const qadd = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
export const qsub = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
export const qmul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
export const qdiv = (a, b) => { if (b[0] === 0) throw new Error('division by zero'); return Q(a[0] * b[1], a[1] * b[0]); };
export const qneg = (a) => Q(-a[0], a[1]);
export const qzero = (a) => a[0] === 0;
export const qeq = (a, b) => a[0] === b[0] && a[1] === b[1];
export const qval = (a) => a[0] / a[1];
export const ZERO = [0, 1], ONE = [1, 1];

/** Best rational p/q with q ≤ maxDen (continued fractions). */
function toFraction(x, maxDen = 1e6) {
  let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b), h2 = a * h1 + h0, k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    if (Math.abs(x - h1 / k1) < 1e-12 * Math.max(1, Math.abs(x))) break;
    b = 1 / (b - a);
    if (!Number.isFinite(b)) break;
  }
  return [h1, k1];
}

/** A rational from a number (integer or short decimal), 'p/q', or [n, d]. */
export function qparse(x) {
  if (Array.isArray(x) && x.length === 2) return Q(x[0], x[1]);
  if (typeof x === 'number') {
    if (!Number.isFinite(x)) throw new Error(`not a finite number: ${x}`);
    if (Number.isInteger(x)) return Q(x, 1);
    const [p, q] = toFraction(x, 1e4);       // decimals with up to four places, and fractions like 1/3
    if (Math.abs(p / q - x) > 1e-9 * Math.max(1, Math.abs(x))) throw new Error(`${x} is not a simple fraction`);
    return Q(p, q);
  }
  const s = String(x).trim().replace('−', '-');
  const m = /^(-?\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?$/.exec(s);
  if (!m) throw new Error(`cannot read “${x}” as a number or fraction`);
  const a = qparse(+m[1]);
  return m[2] === undefined ? a : qdiv(a, qparse(+m[2]));
}

/** TeX for a rational: 3, -2, \tfrac{3}{2}, -\tfrac{1}{2}. */
export function qtex(a, { frac = '\\tfrac' } = {}) {
  const [n, d] = a;
  if (d === 1) return String(n);
  return `${n < 0 ? '-' : ''}${frac}{${Math.abs(n)}}{${d}}`;
}
/** Plain text (for canvas labels): 3, −2, 3/2, −1/2. */
export const qtext = (a) => `${a[0] < 0 ? '−' : ''}${Math.abs(a[0])}${a[1] === 1 ? '' : `/${a[1]}`}`;

export const qmatrix = (M) => M.map((row) => row.map(qparse));
export const toNumbers = (M) => M.map((row) => row.map(qval));
const copy = (M) => M.map((row) => row.slice());

// ── row operations ───────────────────────────────────────────────────────
// ops: { kind: 'add', target, source, factor }   R_target ← R_target + factor·R_source
//      { kind: 'swap', target, source }          R_target ↔ R_source
//      { kind: 'scale', target, factor }         R_target ← factor·R_target  (factor ≠ 0)
// rows are 0-based here; TeX and text name them from 1.

export function apply(M, op) {
  const R = copy(M);
  if (op.kind === 'add') R[op.target] = R[op.target].map((v, k) => qadd(v, qmul(op.factor, M[op.source][k])));
  else if (op.kind === 'swap') [R[op.target], R[op.source]] = [R[op.source], R[op.target]];
  else if (op.kind === 'scale') {
    if (qzero(op.factor)) throw new Error('scaling a row by 0 is not a row operation');
    R[op.target] = R[op.target].map((v) => qmul(op.factor, v));
  } else throw new Error(`unknown row operation ${op.kind}`);
  return R;
}

/** A coefficient in front of R_j: '' for 1, '2', '\tfrac{1}{2}'. */
const coefTeX = (a) => (qeq(a, ONE) ? '' : qtex(a));
export function opTeX(op) {
  const R = (i) => `R_{${i + 1}}`;
  if (!op) return '';
  if (op.kind === 'swap') return `${R(op.target)} \\leftrightarrow ${R(op.source)}`;
  if (op.kind === 'scale') {
    const neg = op.factor[0] < 0, mag = neg ? qneg(op.factor) : op.factor;
    return `${R(op.target)} \\leftarrow ${neg ? '-' : ''}${coefTeX(mag)}${R(op.target)}`;
  }
  const neg = op.factor[0] < 0, mag = neg ? qneg(op.factor) : op.factor;
  return `${R(op.target)} \\leftarrow ${R(op.target)} ${neg ? '-' : '+'} ${coefTeX(mag)}${R(op.source)}`;
}
/** The same in plain words, for screen readers and canvas text: R2 ← R2 − 2·R1. */
export function opText(op) {
  if (!op) return 'the starting matrix';
  const R = (i) => `R${i + 1}`;
  if (op.kind === 'swap') return `${R(op.target)} ↔ ${R(op.source)}`;
  const neg = op.factor[0] < 0, mag = neg ? qneg(op.factor) : op.factor, c = qeq(mag, ONE) ? '' : `${qtext(mag)}·`;
  if (op.kind === 'scale') return `${R(op.target)} ← ${neg ? '−' : ''}${c}${R(op.target)}`;
  return `${R(op.target)} ← ${R(op.target)} ${neg ? '−' : '+'} ${c}${R(op.source)}`;
}

/** An author's explicit operation: ['add', 2, 1, '-2'] (R₂ ← R₂ − 2R₁), ['swap', 1, 3], ['scale', 2, '1/4']; rows from 1. */
export function readOp(a) {
  const [kind, i, j, c] = a;
  if (kind === 'swap') return { kind, target: i - 1, source: j - 1 };
  if (kind === 'scale') return { kind, target: i - 1, factor: qparse(j) };
  if (kind === 'add') return { kind, target: i - 1, source: j - 1, factor: qparse(c) };
  throw new Error(`unknown row operation “${kind}” (use add, swap or scale)`);
}

// ── elimination ──────────────────────────────────────────────────────────
/**
 * Row reduction as a list of steps. M: rows of rationals; nvar: how many
 * columns hold coefficients (the rest are right-hand sides; nvar = the
 * column count for a plain matrix). Modes:
 *   'ref'  forward elimination: clear below each pivot, swapping rows only
 *          when a pivot position holds 0 (as by hand — not partial pivoting);
 *   'rref' then, from the last pivot back to the first, scale it to 1 and
 *          clear above it (Gauss–Jordan);
 *   'lu'   forward elimination with no swaps, recording each multiplier ℓᵢⱼ
 *          in L; it stops (stuck) at a zero pivot that needs a row exchange.
 * Right-hand-side columns are carried along but never chosen as pivots, so an
 * inconsistent row stays readable as 0 = c.
 * Returns { steps: [{ op, M, changed, pivot, L }], pivots: [[row, col]], stuck }.
 * steps[0] is the start, with op null.
 */
export function reduce(M0, { nvar, mode = 'ref' } = {}) {
  let M = copy(M0);
  const rows = M.length, cols = M[0].length, nv = nvar ?? cols;
  const lu = mode === 'lu';
  // L starts as I with its multipliers unknown (null) until elimination fills them
  const L = lu ? Array.from({ length: rows }, (_, i) => Array.from({ length: rows }, (_, j) => (i === j ? ONE : j > i ? ZERO : null))) : null;
  const steps = [{ op: null, M: copy(M), changed: null, pivot: null, L: L && L.map((r) => r.slice()) }];
  const push = (op, pivot) => { M = apply(M, op); steps.push({ op, M: copy(M), changed: op.target, pivot, L: L && L.map((r) => r.slice()) }); };
  const pivots = [];
  let r = 0, stuck = null;
  for (let c = 0; c < nv && r < rows; c++) {
    let p = r;
    while (p < rows && qzero(M[p][c])) p++;
    if (p === rows) continue;                         // no pivot in this column: a free column
    if (p !== r) {
      if (lu) { stuck = { row: r, col: c }; break; }
      push({ kind: 'swap', target: r, source: p }, [r, c]);
    }
    for (let i = r + 1; i < rows; i++) {
      if (qzero(M[i][c])) { if (lu) L[i][r] = ZERO; continue; }
      const ell = qdiv(M[i][c], M[r][c]);
      if (lu) L[i][r] = ell;
      push({ kind: 'add', target: i, source: r, factor: qneg(ell) }, [r, c]);
    }
    pivots.push([r, c]);
    r++;
  }
  if (lu && !stuck) for (let i = 0; i < rows; i++) for (let j = 0; j < i; j++) if (L[i][j] === null) L[i][j] = ZERO;
  if (lu && steps.length) steps[steps.length - 1].L = L.map((row) => row.slice());
  if (mode === 'rref') {
    for (let k = pivots.length - 1; k >= 0; k--) {
      const [pr, pc] = pivots[k];
      if (!qeq(M[pr][pc], ONE)) push({ kind: 'scale', target: pr, factor: qdiv(ONE, M[pr][pc]) }, [pr, pc]);
      for (let i = 0; i < pr; i++) if (!qzero(M[i][pc])) push({ kind: 'add', target: i, source: pr, factor: qneg(M[i][pc]) }, [pr, pc]);
    }
  }
  return { steps, pivots, stuck, L };
}

/** Steps from an author's explicit operations. */
export function replay(M0, ops) {
  let M = copy(M0);
  const steps = [{ op: null, M: copy(M), changed: null, pivot: null, L: null }];
  for (const a of ops) { const op = Array.isArray(a) ? readOp(a) : a; M = apply(M, op); steps.push({ op, M: copy(M), changed: op.target, pivot: null, L: null }); }
  return { steps, pivots: [], stuck: null, L: null };
}

// ── what a matrix says ───────────────────────────────────────────────────
/** Reduced row echelon form (rationals). */
export const rref = (M, nvar) => { const s = reduce(M, { nvar, mode: 'rref' }).steps; return s[s.length - 1].M; };

/**
 * The solution set of the augmented system [A | b] (nvar coefficient columns,
 * one right-hand side): rank, consistency, pivot and free columns, a particular
 * solution (free variables 0) and one direction per free variable, so that
 * every solution is particular + Σ tₖ·directions[k].
 */
export function solutionSet(M, nvar) {
  const nv = nvar ?? M[0].length - 1;
  const R = rref(M, nv);
  const pivotCols = [], rowOf = {};
  R.forEach((row, i) => { const c = row.slice(0, nv).findIndex((v) => !qzero(v)); if (c >= 0) { pivotCols.push(c); rowOf[c] = i; } });
  const consistent = R.every((row) => row.slice(0, nv).some((v) => !qzero(v)) || row.slice(nv).every(qzero));
  const freeCols = [...Array(nv).keys()].filter((c) => !pivotCols.includes(c));
  const particular = Array.from({ length: nv }, (_, c) => (pivotCols.includes(c) && M[0].length > nv ? R[rowOf[c]][nv] : ZERO));
  const directions = freeCols.map((f) => Array.from({ length: nv }, (_, c) => (c === f ? ONE : pivotCols.includes(c) ? qneg(R[rowOf[c]][f]) : ZERO)));
  return { R, rank: pivotCols.length, consistent, pivotCols, freeCols, particular: consistent ? particular : null, directions: consistent ? directions : [] };
}

/** Matrix product of rational matrices. */
export function qmatmul(A, B) {
  return A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => qadd(s, qmul(v, B[k][j])), ZERO)));
}

// ── the plane's linear maps (floats) ─────────────────────────────────────
export const mul2 = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
export const apply2 = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
export const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
export const I2 = [[1, 0], [0, 1]];
/** The inverse, or null when the determinant is (numerically) zero. */
export function inv2(A, eps = 1e-12) {
  const d = det2(A), scaleA = Math.max(...A.flat().map(Math.abs), 1e-300);
  if (Math.abs(d) <= eps * scaleA * scaleA) return null;
  return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
}
/** (1 − t)I + tA: the straight-line blend from doing nothing to doing A. */
export const blend2 = (A, t) => [[1 - t + t * A[0][0], t * A[0][1]], [t * A[1][0], 1 - t + t * A[1][1]]];
/** Composition of maps applied first to last: the product M_last ⋯ M_2 M_1. */
export const compose2 = (maps) => maps.reduce((P, M) => mul2(M, P), I2);

/**
 * Real invariant lines of A: [{ lambda, dir }] with unit directions (none for
 * complex eigenvalues; 'all' when A is a multiple of I, so every line is one).
 */
export function eigen2(A, eps = 1e-9) {
  const [[a, b], [c, d]] = A, tr = a + d, dt = a * d - b * c, disc = tr * tr - 4 * dt;
  const size = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d), 1e-300);
  if (Math.abs(b) <= eps * size && Math.abs(c) <= eps * size && Math.abs(a - d) <= eps * size) return 'all';
  if (disc < -eps * size * size) return [];
  const root = Math.sqrt(Math.max(0, disc)), lams = root <= eps * size ? [tr / 2] : [(tr + root) / 2, (tr - root) / 2];
  const out = [];
  for (const L of lams) {
    // (A − λI)v = 0: v is perpendicular to a nonzero row of A − λI
    const r1 = [a - L, b], r2 = [c, d - L];
    const row = Math.hypot(...r1) >= Math.hypot(...r2) ? r1 : r2;
    let v = [-row[1], row[0]];
    const n = Math.hypot(...v);
    if (n < eps * size) continue;
    v = [v[0] / n, v[1] / n];
    out.push({ lambda: L, dir: v });
  }
  return out;
}

// ── the plane two vectors span (any n) ───────────────────────────────────
export const dotN = (u, v) => u.reduce((s, x, k) => s + x * v[k], 0);
export const normN = (u) => Math.sqrt(dotN(u, u));
/**
 * Coordinates of u and v in the plane they span, with u along the first axis:
 * u ↦ (|u|, 0), v ↦ (v·û, |v − (v·û)û|) — lengths and the angle are exact.
 * null if u is the zero vector.
 */
export function planeOf(u, v) {
  const nu = normN(u);
  if (!(nu > 0)) return null;
  const along = dotN(u, v) / nu, perp2 = Math.max(0, dotN(v, v) - along * along);
  return { u: [nu, 0], v: [along, Math.sqrt(perp2)] };
}
/** The angle between u and v in radians, or NaN if either is zero (the cosine clamped against rounding). */
export function angleN(u, v) {
  const nu = normN(u), nv = normN(v);
  if (!(nu > 0 && nv > 0)) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, dotN(u, v) / (nu * nv))));
}
export const centred = (u) => { const m = u.reduce((s, x) => s + x, 0) / u.length; return u.map((x) => x - m); };
