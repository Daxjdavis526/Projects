// Row reduction that shows its work. The pivoting and the row operations are
// those of rref() in src/core/numeric/linalg.ts (partial pivoting, then scale,
// then eliminate above and below), but carried out in exact rational
// arithmetic when every entry is a terminating decimal — so the steps read
// 1/3, not 0.333333 — and every intermediate matrix is kept for display.
// The final matrix is compared with linalg's floating-point rref.

import { rref as rrefFloat, Mat } from '../core/numeric/linalg';
import { Node, freeSymbols, sub } from '../core/expr/ast';
import { derivative } from '../core/expr/diff';
import { compile, evaluate } from '../core/expr/compile';
import { parse } from '../core/expr/parse';
import { symbolTeX } from '../core/expr/print';

// ── exact rationals (bigint) ────────────────────────────────────────────────

const babs = (a: bigint) => (a < 0n ? -a : a);
function gcd(a: bigint, b: bigint): bigint { a = babs(a); b = babs(b); while (b) { [a, b] = [b, a % b]; } return a; }

export class Q {
  readonly n: bigint; readonly d: bigint;
  constructor(n: bigint, d: bigint = 1n) {
    if (d === 0n) throw new Error('division by zero');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    this.n = n / g; this.d = d / g;
  }
  static of(v: number): Q | null {
    if (!Number.isFinite(v)) return null;
    if (Number.isInteger(v)) return new Q(BigInt(v));
    const s = String(v);
    if (/e/i.test(s)) return null;
    const [i, f = ''] = s.replace('-', '').split('.');
    if (f.length > 9) return null;                   // not a short decimal: probably 1/3 typed as 0.3333…
    const q = new Q(BigInt(i + f) * (v < 0 ? -1n : 1n), 10n ** BigInt(f.length));
    return q;
  }
  add(o: Q) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o: Q) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o: Q) { return new Q(this.n * o.n, this.d * o.d); }
  div(o: Q) { return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  isZero() { return this.n === 0n; }
  isOne() { return this.n === this.d; }
  abs() { return new Q(babs(this.n), this.d); }
  cmp(o: Q) { const l = this.n * o.d, r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  value() { return Number(this.n) / Number(this.d); }
  tex(): string {
    if (this.d === 1n) return String(this.n);
    const s = this.n < 0n ? '-' : '';
    return `${s}\\frac{${babs(this.n)}}{${this.d}}`;
  }
  text(): string { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}

// ── one number type for both modes ──────────────────────────────────────────

type Field<T> = { zero: T; one: T; add(a: T, b: T): T; sub(a: T, b: T): T; mul(a: T, b: T): T; div(a: T, b: T): T; abs(a: T): number; isZero(a: T): boolean; isOne(a: T): boolean; tex(a: T): string; value(a: T): number };

const QF: Field<Q> = {
  zero: new Q(0n), one: new Q(1n), add: (a, b) => a.add(b), sub: (a, b) => a.sub(b), mul: (a, b) => a.mul(b), div: (a, b) => a.div(b),
  abs: (a) => Math.abs(a.value()), isZero: (a) => a.isZero(), isOne: (a) => a.isOne(), tex: (a) => a.tex(), value: (a) => a.value(),
};
export const fmtNum = (v: number, digits = 6): string => {
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : v < 0 ? '-\\infty' : '\\text{undefined}';
  if (Math.abs(v) < 1e-12) return '0';
  const s = String(+v.toPrecision(digits));
  const m = /^(-?[\d.]+)e([+-]\d+)$/.exec(s);
  return m ? `${m[1]}\\times 10^{${parseInt(m[2], 10)}}` : s;
};
const FF = (tol: number): Field<number> => ({
  zero: 0, one: 1, add: (a, b) => a + b, sub: (a, b) => a - b, mul: (a, b) => a * b, div: (a, b) => a / b,
  abs: Math.abs, isZero: (a) => Math.abs(a) < tol, isOne: (a) => Math.abs(a - 1) < tol, tex: (a) => fmtNum(a), value: (a) => a,
});

export interface RowStep {
  /** the operation, e.g. R_2 \leftarrow R_2 - 3R_1 (TeX) */
  op: string;
  /** plain words */
  words: string;
  kind: 'swap' | 'scale' | 'eliminate';
  /** the matrix after the operation, TeX entries */
  matrix: string[][];
  /** numeric values after the operation */
  values: number[][];
  /** the pivot being worked on (row, col) */
  pivot: [number, number];
}

export interface RrefWork {
  exact: boolean;
  start: string[][];
  startValues: number[][];
  steps: RowStep[];
  R: string[][];
  Rvalues: number[][];
  pivots: number[];
  /** max |R − rref_linalg(A)| */
  engineDiff: number;
  agreesWithEngine: boolean;
}

function run<T>(F: Field<T>, A: T[][]): { steps: RowStep[]; R: T[][]; pivots: number[] } {
  const R = A.map((r) => r.slice()), m = R.length, n = R[0].length, pivots: number[] = [], steps: RowStep[] = [];
  const snap = (): [string[][], number[][]] => [R.map((r) => r.map(F.tex)), R.map((r) => r.map(F.value))];
  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    let piv = row;
    for (let i = row + 1; i < m; i++) if (F.abs(R[i][col]) > F.abs(R[piv][col])) piv = i;
    if (F.isZero(R[piv][col])) continue;
    if (piv !== row) {
      [R[row], R[piv]] = [R[piv], R[row]];
      const [mt, mv] = snap();
      steps.push({ op: `R_{${row + 1}} \\leftrightarrow R_{${piv + 1}}`, words: `Swap rows ${row + 1} and ${piv + 1}, bringing the largest entry of column ${col + 1} up as the pivot (partial pivoting — by hand, any nonzero pivot will do).`, kind: 'swap', matrix: mt, values: mv, pivot: [row, col] });
    }
    const p = R[row][col];
    if (!F.isOne(p)) {
      R[row] = R[row].map((v) => F.div(v, p));
      const [mt, mv] = snap();
      steps.push({ op: `R_{${row + 1}} \\leftarrow \\frac{1}{${F.tex(p)}}\\,R_{${row + 1}}`, words: `Divide row ${row + 1} by the pivot ${plain(F.tex(p))} so the pivot becomes 1.`, kind: 'scale', matrix: mt, values: mv, pivot: [row, col] });
    }
    for (let i = 0; i < m; i++) {
      if (i === row || F.isZero(R[i][col])) continue;
      const f = R[i][col];
      R[i] = R[i].map((v, j) => F.sub(v, F.mul(f, R[row][j])));
      const [mt, mv] = snap();
      const neg = F.value(f) < 0;
      const mag = neg ? F.sub(F.zero, f) : f;
      const coef = F.isOne(mag) ? '' : F.tex(mag);
      steps.push({ op: `R_{${i + 1}} \\leftarrow R_{${i + 1}} ${neg ? '+' : '-'} ${coef}R_{${row + 1}}`, words: `Clear the entry in row ${i + 1}, column ${col + 1}: ${neg ? 'add' : 'subtract'} ${plain(F.tex(mag))} × row ${row + 1}.`, kind: 'eliminate', matrix: mt, values: mv, pivot: [row, col] });
    }
    pivots.push(col);
    row++;
  }
  return { steps, R, pivots };
}

const plain = (tex: string) => tex.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/-/g, '−');

/** Row-reduce A, exactly when possible, recording every operation. */
export function rrefSteps(A: Mat, tol = 1e-10): RrefWork {
  const qs = A.map((r) => r.map((v) => Q.of(v)));
  const exact = qs.every((r) => r.every((q) => q !== null && q.d < 10n ** 9n && babs(q.n) < 10n ** 12n));
  const ref = rrefFloat(A, tol);
  let steps: RowStep[], Rt: string[][], Rv: number[][], pivots: number[];
  if (exact) {
    const out = run(QF, qs as Q[][]);
    steps = out.steps; pivots = out.pivots; Rt = out.R.map((r) => r.map((q) => q.tex())); Rv = out.R.map((r) => r.map((q) => q.value()));
  } else {
    const F = FF(tol);
    const out = run(F, A.map((r) => r.slice()));
    for (const r of out.R) for (let j = 0; j < r.length; j++) if (Math.abs(r[j]) < tol) r[j] = 0;
    steps = out.steps; pivots = out.pivots; Rt = out.R.map((r) => r.map((v) => fmtNum(v))); Rv = out.R;
  }
  let diff = 0;
  for (let i = 0; i < Rv.length; i++) for (let j = 0; j < Rv[0].length; j++) diff = Math.max(diff, Math.abs(Rv[i][j] - ref.R[i][j]));
  const scale = Math.max(1, ...A.flat().map(Math.abs));
  return {
    exact, start: A.map((r) => r.map((v) => (exact ? Q.of(v)!.tex() : fmtNum(v)))), startValues: A.map((r) => r.slice()), steps, R: Rt, Rvalues: Rv, pivots,
    engineDiff: diff, agreesWithEngine: diff <= 1e-8 * scale && pivots.join() === ref.pivots.join(),
  };
}

/** TeX for a matrix of TeX entries; `bar` draws the augmented-matrix line before that column. */
export function matrixTeX(m: string[][], bar?: number, highlight?: [number, number]): string {
  const cols = m[0]?.length ?? 0;
  const spec = bar !== undefined && bar > 0 && bar < cols ? `${'c'.repeat(bar)}|${'c'.repeat(cols - bar)}` : 'c'.repeat(cols);
  const body = m.map((r, i) => r.map((e, j) => (highlight && highlight[0] === i && highlight[1] === j ? `\\boxed{${e}}` : e)).join(' & ')).join(' \\\\ ');
  // \\dfrac keeps fractions legible inside the array, with a little extra row spacing for them
  const roomy = /\\frac/.test(body) ? '\\def\\arraystretch{1.85}' : '';
  return `${roomy}\\left[\\begin{array}{${spec}}${body.replace(/\\frac/g, '\\dfrac')}\\end{array}\\right]`;
}

// ── linear systems typed as equations ───────────────────────────────────────

export interface LinearSystem {
  vars: string[];
  /** coefficient rows (numeric) */
  A: number[][];
  b: number[];
  /** the equations as parsed, lhs − rhs */
  residuals: Node[];
}

const SYSTEM_VARS = ['x', 'y', 'z', 'w', 'x_1', 'x_2', 'x_3', 'x_4', 'u', 'v'];

/**
 * Read lines like "x + 2y = 5; 3x − y = 1" as a linear system. Each equation
 * must be linear: every coefficient (the exact partial derivative) must be a
 * constant. Returns null when the input is not such a system.
 */
export function readLinearSystem(src: string, params: Record<string, number> = {}): LinearSystem | null {
  const lines = src.split(/\s*[;\n]\s*/).map((s) => s.trim()).filter(Boolean);
  if (lines.length < 2 || lines.some((l) => (l.match(/=/g) ?? []).length !== 1)) return null;
  if (lines.some((l) => /^\s*d[A-Za-z]\s*\/\s*d[A-Za-z]/.test(l) || /'/.test(l))) return null;
  const names = SYSTEM_VARS.filter((v) => v.includes('_'));
  let eqs: Node[];
  try { eqs = lines.map((l) => { const [a, b] = l.split('='); return sub(parse(a, { names }), parse(b, { names })); }); } catch { return null; }
  const all = new Set<string>();
  eqs.forEach((e) => freeSymbols(e, all));
  const vars = SYSTEM_VARS.filter((v) => all.has(v));
  if (!vars.length || vars.length > 6) return null;
  const fixed = { ...params };
  for (const s of all) if (!vars.includes(s) && !(s in fixed)) return null;      // an unknown letter: not a numeric system
  const A: number[][] = [], b: number[] = [];
  for (const e of eqs) {
    const row: number[] = [];
    for (const v of vars) {
      const c = derivative(e, v);
      const free = freeSymbols(c);
      if ([...free].some((s) => vars.includes(s))) return null;                  // not linear
      try { row.push(evaluate(c, fixed)); } catch { return null; }
    }
    let c0: number;
    try { c0 = compile(e, vars, fixed)(vars.map(() => 0)); } catch { return null; }
    if (!row.every(Number.isFinite) || !Number.isFinite(c0)) return null;
    A.push(row); b.push(-c0);
  }
  return { vars, A, b, residuals: eqs };
}

export interface SystemSolution {
  kind: 'unique' | 'none' | 'infinite';
  /** unique: the values; infinite: a particular solution with free variables 0 */
  x: number[] | null;
  /** TeX of the solution: x = 1, y = 2 or a parametric description */
  tex: string;
  /** largest |A x − b| for the solution found */
  residual: number;
  free: string[];
}

/** Read the solution of A x = b from the reduced augmented matrix. */
export function solutionFromRref(work: RrefWork, vars: string[]): SystemSolution {
  const R = work.Rvalues, n = vars.length;
  const pivots = work.pivots;
  if (pivots.includes(n)) return { kind: 'none', x: null, tex: '\\text{no solution: a row reads } 0 = 1', residual: NaN, free: [] };
  const free = vars.filter((_, j) => !pivots.includes(j));
  const x = new Array(n).fill(0);
  pivots.forEach((pc, i) => { x[pc] = R[i][n]; });
  const V = vars.map(symbolTeX);
  if (!free.length) {
    return { kind: 'unique', x, tex: vars.map((_, j) => `${V[j]} = ${work.R[pivots.indexOf(j)][n]}`).join(',\\quad '), residual: 0, free };
  }
  const parts = pivots.map((pc, i) => {
    let s = `${V[pc]} = ${work.R[i][n]}`;
    vars.forEach((_, j) => {
      if (pivots.includes(j) || Math.abs(R[i][j]) < 1e-12) return;
      const c = work.R[i][j];
      const negC = c.startsWith('-') ? c.slice(1) : `-${c}`;
      s += ` ${negC.startsWith('-') ? '-' : '+'} ${negC.replace(/^-/, '') === '1' ? '' : negC.replace(/^-/, '')}${V[j]}`;
    });
    return s;
  });
  return { kind: 'infinite', x, tex: `${parts.join(',\\quad ')}\\quad (${free.map(symbolTeX).join(', ')}\\ \\text{free})`, residual: 0, free };
}

/** Max |A x − b|. */
export function residualOf(A: number[][], b: number[], x: number[]): number {
  return Math.max(...A.map((r, i) => Math.abs(r.reduce((s, a, j) => s + a * x[j], 0) - b[i])));
}

/** Exact determinant by cofactor expansion (n ≤ 4) with its steps, or null for non-exact entries. */
export function detSteps(A: Mat): { value: number; tex: string; steps: { title: string; tex: string }[] } | null {
  const qs = A.map((r) => r.map((v) => Q.of(v)));
  if (!qs.every((r) => r.every((q) => q !== null)) || A.length !== A[0].length || A.length > 4) return null;
  const M = qs as Q[][];
  const steps: { title: string; tex: string }[] = [];
  const det = (m: Q[][]): Q => {
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return m[0][0].mul(m[1][1]).sub(m[0][1].mul(m[1][0]));
    let s = new Q(0n);
    m[0].forEach((a, j) => { const minor = m.slice(1).map((r) => r.filter((_, k) => k !== j)); const t = a.mul(det(minor)); s = j % 2 ? s.sub(t) : s.add(t); });
    return s;
  };
  const n = M.length;
  if (n === 2) {
    const [[a, b], [c, d]] = M;
    steps.push({ title: 'The 2×2 formula', tex: `\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix} = ad - bc = (${a.tex()})(${d.tex()}) - (${b.tex()})(${c.tex()}) = ${det(M).tex()}` });
  } else {
    const terms = M[0].map((a, j) => {
      const minor = M.slice(1).map((r) => r.filter((_, k) => k !== j));
      return { a, j, minor, md: det(minor) };
    });
    steps.push({ title: 'Cofactor expansion along the first row', tex: `\\det A = ${terms.map((t) => `${t.j % 2 ? '-' : t.j ? '+' : ''}\\,${t.a.tex().startsWith('-') ? `(${t.a.tex()})` : t.a.tex()}\\,${matrixTeX(t.minor.map((r) => r.map((q) => q.tex()))).replace(/\\left\[/, '\\left|').replace(/\\right\]/, '\\right|')}`).join(' ')}` });
    steps.push({ title: 'Evaluate the minors', tex: `= ${terms.map((t) => `${t.j % 2 ? '-' : t.j ? '+' : ''}\\,(${t.a.tex()})(${t.md.tex()})`).join(' ')} = ${det(M).tex()}` });
  }
  const v = det(M);
  return { value: v.value(), tex: v.tex(), steps };
}
