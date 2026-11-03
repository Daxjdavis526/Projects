// Exact rational arithmetic, polynomials with rational coefficients, and
// partial-fraction decomposition by solving the coefficient equations exactly.
// Numerators and denominators are JavaScript integers; every operation reduces
// by the gcd, and an operation whose result would leave the exactly
// representable range (|n| > 2^53) throws instead of rounding silently.

export interface Frac { n: number; d: number }

const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const SAFE = Number.MAX_SAFE_INTEGER;

export function fr(n: number, d = 1): Frac {
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error('fr: integers only');
  if (d === 0) throw new Error('fr: zero denominator');
  if (Math.abs(n) > SAFE || Math.abs(d) > SAFE) throw new Error('fr: integer too large to be exact');
  const g = gcd(n, d), s = d < 0 ? -1 : 1;
  return { n: (s * n) / g || 0, d: (s * d) / g };
}
export const ZERO = fr(0), ONE = fr(1);
export const fadd = (a: Frac, b: Frac) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
export const fsub = (a: Frac, b: Frac) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
export const fmul = (a: Frac, b: Frac) => fr(a.n * b.n, a.d * b.d);
export const fdiv = (a: Frac, b: Frac) => { if (b.n === 0) throw new Error('division by zero'); return fr(a.n * b.d, a.d * b.n); };
export const fneg = (a: Frac) => fr(-a.n, a.d);
export const fnum = (a: Frac) => a.n / a.d;
export const fzero = (a: Frac) => a.n === 0;
export const feq = (a: Frac, b: Frac) => a.n === b.n && a.d === b.d;

/** LaTeX for a fraction: 3, -2, \tfrac{3}{2}, -\tfrac{1}{4}. */
export function fracTeX(a: Frac, small = true): string {
  if (a.d === 1) return String(a.n);
  const f = small ? '\\tfrac' : '\\frac';
  return `${a.n < 0 ? '-' : ''}${f}{${Math.abs(a.n)}}{${a.d}}`;
}

// ── polynomials: coefficient arrays, index = power ─────────────────────────
export type Poly = Frac[];
export const ptrim = (p: Poly): Poly => { const q = p.slice(); while (q.length > 1 && fzero(q[q.length - 1])) q.pop(); return q.length ? q : [ZERO]; };
export const pdeg = (p: Poly) => { const q = ptrim(p); return q.length === 1 && fzero(q[0]) ? -Infinity : q.length - 1; };
export function padd(a: Poly, b: Poly): Poly { const n = Math.max(a.length, b.length); const out: Poly = []; for (let i = 0; i < n; i++) out.push(fadd(a[i] ?? ZERO, b[i] ?? ZERO)); return ptrim(out); }
export function pscale(a: Poly, k: Frac): Poly { return ptrim(a.map((c) => fmul(c, k))); }
export function pmul(a: Poly, b: Poly): Poly {
  const out: Poly = Array.from({ length: a.length + b.length - 1 }, () => ZERO);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] = fadd(out[i + j], fmul(a[i], b[j]));
  return ptrim(out);
}
export function ppow(a: Poly, k: number): Poly { let r: Poly = [ONE]; for (let i = 0; i < k; i++) r = pmul(r, a); return r; }
export function peval(p: Poly, x: number): number { let s = 0; for (let i = p.length - 1; i >= 0; i--) s = s * x + fnum(p[i]); return s; }
/** a = q·b + r with deg r < deg b. */
export function pdivmod(a: Poly, b: Poly): { q: Poly; r: Poly } {
  const B = ptrim(b), db = B.length - 1, lead = B[db];
  let r = ptrim(a).slice();
  const q: Poly = Array.from({ length: Math.max(1, r.length - db) }, () => ZERO);
  while (pdeg(r) >= db && !(r.length === 1 && fzero(r[0]))) {
    const k = r.length - 1 - db, c = fdiv(r[r.length - 1], lead);
    q[k] = c;
    const sub: Poly = Array.from({ length: k }, () => ZERO).concat(B.map((x) => fmul(x, c)));
    r = ptrim(padd(r, sub.map(fneg)));
    if (r.length - 1 < db) break;
  }
  return { q: ptrim(q), r };
}
export const polyFromInts = (c: number[]): Poly => ptrim(c.map((v) => fr(v)));

/** LaTeX of a polynomial in x (highest power first). */
export function polyTeX(p: Poly, x = 'x'): string {
  const q = ptrim(p);
  const parts: string[] = [];
  for (let i = q.length - 1; i >= 0; i--) {
    const c = q[i];
    if (fzero(c)) continue;
    const mag = fr(Math.abs(c.n), c.d), one = mag.n === 1 && mag.d === 1;
    const coef = i === 0 ? fracTeX(mag) : one ? '' : fracTeX(mag);
    const mono = i === 0 ? '' : i === 1 ? x : `${x}^{${i}}`;
    parts.push(`${c.n < 0 ? '-' : parts.length ? '+' : ''}${coef}${mono}`);
  }
  return parts.length ? parts.join(' ').replace(/^\+/, '') : '0';
}

// ── solving linear systems exactly ─────────────────────────────────────────
/** Solve A x = b over the rationals (Gauss–Jordan). Returns null when singular. */
export function solveExact(A: Frac[][], b: Frac[]): Frac[] | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = -1;
    for (let r = c; r < n; r++) if (!fzero(M[r][c])) { p = r; break; }
    if (p < 0) return null;
    [M[c], M[p]] = [M[p], M[c]];
    const piv = M[c][c];
    for (let j = c; j <= n; j++) M[c][j] = fdiv(M[c][j], piv);
    for (let r = 0; r < n; r++) if (r !== c && !fzero(M[r][c])) {
      const k = M[r][c];
      for (let j = c; j <= n; j++) M[r][j] = fsub(M[r][j], fmul(k, M[c][j]));
    }
  }
  return M.map((row) => row[n]);
}

// ── partial fractions ───────────────────────────────────────────────────────
/** (x − r)^k with integer r, or (x² + p x + q)^k irreducible (p² < 4q). */
export type Factor = { kind: 'linear'; r: number; k: number } | { kind: 'quad'; p: number; q: number; k: number };

export interface PFTerm {
  factor: number;          // index into factors
  power: number;           // j in 1..k
  /** linear: A/(x − r)^j uses A; quadratic: (B x + C)/(x² + p x + q)^j uses B and C */
  A?: Frac; B?: Frac; C?: Frac;
}

export const factorPoly = (f: Factor): Poly => (f.kind === 'linear' ? polyFromInts([-f.r, 1]) : polyFromInts([f.q, f.p, 1]));
export function denominatorPoly(fs: Factor[]): Poly { return fs.reduce<Poly>((acc, f) => pmul(acc, ppow(factorPoly(f), f.k)), [ONE]); }

export interface PartialFractions { quotient: Poly; remainder: Poly; denominator: Poly; terms: PFTerm[] }

/**
 * N(x) / Π factors = quotient(x) + Σ terms, exactly. The unknown coefficients
 * are found by clearing denominators and matching coefficients of each power
 * of x — a square linear system, solved over the rationals.
 */
export function partialFractions(N: Poly, fs: Factor[]): PartialFractions {
  for (const f of fs) if (f.kind === 'quad' && f.p * f.p - 4 * f.q >= 0) throw new Error('quadratic factor is reducible');
  const D = denominatorPoly(fs);
  const { q, r } = pdivmod(N, D);
  const n = D.length - 1;
  // columns: each unknown's polynomial multiplier D / factor^j (and x·that for B)
  const cols: { poly: Poly; term: number; slot: 'A' | 'B' | 'C' }[] = [];
  const terms: PFTerm[] = [];
  fs.forEach((f, fi) => {
    for (let j = 1; j <= f.k; j++) {
      const others = denominatorPoly(fs.map((g, gi) => (gi === fi ? { ...g, k: g.k - j } : g)).filter((g) => g.k > 0) as Factor[]);
      const ti = terms.length;
      terms.push({ factor: fi, power: j });
      if (f.kind === 'linear') cols.push({ poly: others, term: ti, slot: 'A' });
      else { cols.push({ poly: pmul(others, [ZERO, ONE]), term: ti, slot: 'B' }); cols.push({ poly: others, term: ti, slot: 'C' }); }
    }
  });
  if (cols.length !== n) throw new Error('internal: unknown count mismatch');
  const A: Frac[][] = Array.from({ length: n }, (_, row) => cols.map((c) => c.poly[row] ?? ZERO));
  const b: Frac[] = Array.from({ length: n }, (_, row) => r[row] ?? ZERO);
  const sol = solveExact(A, b);
  if (!sol) throw new Error('singular system — factors repeated or not coprime');
  cols.forEach((c, i) => { terms[c.term][c.slot] = sol[i]; });
  return { quotient: q, remainder: r, denominator: D, terms };
}

/** Value of one partial-fraction term at x. */
export function termValue(t: PFTerm, f: Factor, x: number): number {
  if (f.kind === 'linear') return fnum(t.A!) / Math.pow(x - f.r, t.power);
  return (fnum(t.B!) * x + fnum(t.C!)) / Math.pow(x * x + f.p * x + f.q, t.power);
}

/**
 * An antiderivative of one term (real logarithms, so valid on each interval
 * free of poles). Quadratic factors are supported to the first power.
 */
export function termAntiderivative(t: PFTerm, f: Factor, x: number): number {
  if (f.kind === 'linear') {
    const A = fnum(t.A!);
    return t.power === 1 ? A * Math.log(Math.abs(x - f.r)) : -A / ((t.power - 1) * Math.pow(x - f.r, t.power - 1));
  }
  if (t.power !== 1) return NaN;
  const B = fnum(t.B!), C = fnum(t.C!), m = f.q - (f.p * f.p) / 4, s = Math.sqrt(m);
  return (B / 2) * Math.log(x * x + f.p * x + f.q) + ((C - (B * f.p) / 2) / s) * Math.atan((x + f.p / 2) / s);
}

/** LaTeX for the factor (x − r) or (x² + p x + q). */
export function factorTeX(f: Factor): string {
  if (f.kind === 'linear') return f.r === 0 ? 'x' : `(x ${f.r > 0 ? '-' : '+'} ${Math.abs(f.r)})`;
  return `(${polyTeX(polyFromInts([f.q, f.p, 1]))})`;
}
const powTeX = (base: string, k: number) => (k === 1 ? base : `${base}^{${k}}`);

/** LaTeX of one term, e.g. \frac{3}{x-1} or \frac{2x+1}{x^2+1}. */
export function termTeX(t: PFTerm, f: Factor): string {
  const den = powTeX(factorTeX(f), t.power);
  const numTeX = f.kind === 'linear' ? fracTeX(t.A!) : polyTeX([t.C!, t.B!]);
  return `\\frac{${numTeX}}{${den}}`;
}

/** LaTeX of the antiderivative of one term. */
export function termAntiderivativeTeX(t: PFTerm, f: Factor): string {
  const k = (c: Frac, rest: string) => (fzero(c) ? '' : `${c.n < 0 ? '-' : '+'}${feq(fr(Math.abs(c.n), c.d), ONE) ? '' : fracTeX(fr(Math.abs(c.n), c.d))}${rest}`);
  if (f.kind === 'linear') {
    const base = f.r === 0 ? 'x' : `x ${f.r > 0 ? '-' : '+'} ${Math.abs(f.r)}`;
    if (t.power === 1) return k(t.A!, `\\ln\\left|${base}\\right|`);
    const c = fdiv(fneg(t.A!), fr(t.power - 1));
    return k(c, `\\frac{1}{${powTeX(`(${base})`, t.power - 1)}}`);
  }
  if (t.power !== 1) return '\\cdots';
  const B = t.B!, C = t.C!, half = fr(1, 2);
  const m = fsub(fr(f.q), fr(f.p * f.p, 4));
  const coef = fsub(C, fmul(B, fr(f.p, 2)));
  const quad = polyTeX(polyFromInts([f.q, f.p, 1]));
  const sq = m.d === 1 && Number.isInteger(Math.sqrt(m.n)) ? String(Math.sqrt(m.n)) : `\\sqrt{${fracTeX(m)}}`;
  const shift = f.p === 0 ? 'x' : `x ${f.p > 0 ? '+' : '-'} ${fracTeX(fr(Math.abs(f.p), 2))}`;
  const atanArg = sq === '1' ? shift : `\\frac{${shift}}{${sq}}`;
  const atanCoef = sq === '1' ? coef : null;
  return k(fmul(B, half), `\\ln(${quad})`) + (atanCoef ? k(atanCoef, `\\arctan ${f.p === 0 ? 'x' : `(${shift})`}`) : fzero(coef) ? '' : `${coef.n < 0 ? '-' : '+'}\\frac{${fracTeX(fr(Math.abs(coef.n), coef.d))}}{${sq}}\\arctan${atanArg}`);
}
