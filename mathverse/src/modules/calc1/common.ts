// Shared helpers for the Calculus I demonstrations: reading the learner's f(x)
// with exact symbolic derivatives, number formatting, theme-aware ink, and a
// robust automatic view.

import { Node, parse, compile, derivative, simplify, toTeX, freeSymbols, NotDifferentiable, CONSTANTS, numericDerivative } from '../../core/expr';
import type { DemoCtx } from '../types';
import type { Plot2D } from '../../engine/plot2d';

export { SERIES } from '../../engine/colors';

/** A number for display: 4 significant digits by default, ∞ and "undefined" spelled out. */
export const fmt = (v: number, d = 4): string => {
  if (Number.isNaN(v)) return 'undefined';
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
  const s = String(+v.toPrecision(d));
  if (!s.includes('e')) return s.replace('-', '−');
  const [m, e] = (+v).toExponential(Math.max(0, d - 2)).split('e');
  const sup = String(+e).split('').map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c])).join('');
  return `${m.replace('-', '−')}×10${sup}`;
};
/** The same number as TeX (for $…$). */
export const fmtTeX = (v: number, d = 4): string => {
  if (Number.isNaN(v)) return '\\text{undefined}';
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : '-\\infty';
  const s = String(+v.toPrecision(d));
  if (s.includes('e')) { const [m, e] = (+v).toExponential(Math.max(0, d - 2)).split('e'); return `${m}\\times 10^{${+e}}`; }
  return s;
};

/** Ink colours that read on the current theme. */
export const ink = (ctx: DemoCtx) => (ctx.dark ? '#e6e9ef' : '#1b1f2a');
export const muted = (ctx: DemoCtx) => (ctx.dark ? '#9aa3b5' : '#5b6375');
/** A series colour made readable as text: unchanged on dark, darkened on the light theme. */
export const txt = (ctx: DemoCtx, c: string): string => {
  if (ctx.dark || !/^#[0-9a-f]{6}$/i.test(c)) return c;
  const k = 0.62, h = (i: number) => Math.round(parseInt(c.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0');
  return `#${h(1)}${h(3)}${h(5)}`;
};
export const FONT = '600 13px Inter, system-ui, sans-serif';
export const SMALL = '12px Inter, system-ui, sans-serif';

/** A small tidy-up after symbolic differentiation (ln e = 1, a·(1/b) = a/b) before display. */
export function tidy(n: Node): Node {
  const t = (m: Node): Node => {
    switch (m.t) {
      case 'call': {
        const args = m.args.map(t);
        if ((m.fn === 'ln' || m.fn === 'log') && args[0].t === 'sym' && args[0].name === 'e') return { t: 'num', v: 1 };
        return { t: 'call', fn: m.fn, args };
      }
      case 'mul': {
        const a = t(m.a), b = t(m.b);
        if (b.t === 'div' && b.a.t === 'num' && b.a.v === 1) return { t: 'div', a, b: b.b };
        if (a.t === 'div' && a.a.t === 'num' && a.a.v === 1) return { t: 'div', a: b, b: a.b };
        return { t: 'mul', a, b };
      }
      case 'div': {
        const a = t(m.a), b = t(m.b);
        // reduce integer coefficients: 12x²/16 → 3x²/4
        const coef = a.t === 'num' ? a.v : a.t === 'mul' && a.a.t === 'num' ? a.a.v : NaN;
        if (b.t === 'num' && Number.isInteger(coef) && Number.isInteger(b.v) && b.v !== 0) {
          const g = gcd(Math.abs(coef), Math.abs(b.v)) * Math.sign(b.v);
          const c = coef / g, den = b.v / g;
          const top: Node = a.t === 'num' ? { t: 'num', v: c } : c === 1 ? (a as { b: Node }).b : { t: 'mul', a: { t: 'num', v: c }, b: (a as { b: Node }).b };
          return den === 1 ? top : { t: 'div', a: top, b: { t: 'num', v: den } };
        }
        return { t: 'div', a, b };
      }
      case 'neg': return { t: 'neg', a: t(m.a) };
      case 'add': case 'sub': case 'pow': return { t: m.t, a: t(m.a), b: t(m.b) } as Node;
      default: return m;
    }
  };
  return simplify(t(simplify(n)));
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a || 1);

/** A coordinate for display: values within rounding of zero print as 0. */
export const fmtc = (v: number, d = 4, scale = 1): string => fmt(Math.abs(v) < 1e-10 * Math.max(1, scale) ? 0 : v, d);

/** d/dx, tidied; null when MathVerse has no formula (then callers use a labelled numerical derivative). */
export function dx(n: Node, v: string): Node | null {
  try { return tidy(derivative(n, v)); } catch (e) { if (e instanceof NotDifferentiable) return null; throw e; }
}

/** TeX for display, or null when it would be too long to read. */
export function shortTeX(n: Node | null, max = 160): string | null {
  if (!n) return null;
  const s = toTeX(n);
  return s.length <= max ? s : null;
}

export interface Fx {
  src: string;
  v: string;                          // the variable name
  node: Node;
  tex: string;
  f: (x: number) => number;
  d1: Node | null; d2: Node | null;
  D1: (x: number) => number;
  D2: (x: number) => number;
  exact1: boolean; exact2: boolean;
}

/** Strip "f(x) =", "y =" and return [variable, expression text]. */
function splitDefinition(src: string, v: string): [string, string] {
  const m = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*\(\s*([A-Za-z][A-Za-z0-9_]*)\s*\)\s*=(.*)$/s.exec(src);
  if (m) return [m[2], m[3]];
  const y = /^\s*([A-Za-z])\s*=(.*)$/s.exec(src);
  if (y && y[1] !== v) return [v, y[2]];
  if (src.includes('=')) throw new Error('Type a function such as  x^3 − 3x  or  f(x) = sin(x)/x');
  return [v, src];
}

/** Parse the learner's f(v) and build its exact derivatives. Throws a readable Error. */
export function readFx(src: string, v = 'x', params: Record<string, number> = {}): Fx {
  const [vv, body] = splitDefinition(src, v);
  if (!body.trim()) throw new Error('Type a function of ' + vv);
  const node = parse(body, { names: [vv, ...Object.keys(params)] });
  const stray = [...freeSymbols(node)].filter((s) => s !== vv && !(s in params) && !(s in CONSTANTS));
  if (stray.length) throw new Error(`“${stray[0]}” has no value here — write the function in ${vv} alone`);
  const fc = compile(node, [vv], params);
  const f = (x: number) => fc([x]);
  const d1 = dx(node, vv), d2 = d1 ? dx(d1, vv) : null;
  const c1 = d1 ? compile(d1, [vv], params) : null, c2 = d2 ? compile(d2, [vv], params) : null;
  return {
    src, v: vv, node, tex: toTeX(node), f, d1, d2,
    D1: c1 ? (x) => c1([x]) : (x) => numericDerivative(f, x, 1),
    D2: c2 ? (x) => c2([x]) : (x) => numericDerivative(f, x, 2),
    exact1: !!c1, exact2: !!c2,
  };
}

/** Keeps the last function that parsed, so a typo mid-edit never blanks the picture. */
export class FxInput {
  cur: Fx | null = null;
  /** the current parse error ('' when the input is fine) */
  error = '';
  private last = '';
  constructor(private fallback: string, private v = 'x') {}
  /** returns [fx, changed]; warns through ctx on a parse error */
  read(ctx: DemoCtx): [Fx, boolean] {
    const src = ctx.input || this.fallback;
    if (src === this.last && this.cur) return [this.cur, false];
    try {
      this.cur = readFx(src, this.v);
      this.last = src;
      this.error = '';
      return [this.cur, true];
    } catch (e) {
      this.error = `${(e as Error).message}. Showing the last function that worked.`;
      ctx.warn(this.error);
      if (!this.cur) { this.cur = readFx(this.fallback, this.v); this.last = this.fallback; return [this.cur, true]; }
      return [this.cur, false];
    }
  }
  /** warn, letting a parse error take precedence over the demo's own message */
  warn(ctx: DemoCtx, msg: string) { ctx.warn(this.error || msg); }
}

/**
 * Where f is singular on [a, b] (not finite, or a pole: a sign change between
 * huge values), sampled on n points — null if nothing is found. Numerical: a
 * singularity narrower than the spacing can be missed.
 */
export function singularity(f: (x: number) => number, a: number, b: number, n = 2000): number | null {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  if (hi - lo <= 0) return null;
  const ys: number[] = [];
  for (let i = 0; i <= n; i++) { const x = lo + ((hi - lo) * i) / n, y = f(x); if (!Number.isFinite(y)) return x; ys.push(y); }
  const med = [...ys].map(Math.abs).sort((p, q) => p - q)[Math.floor(n / 2)] || 1;
  for (let i = 0; i < n; i++) {
    const y0 = ys[i], y1 = ys[i + 1];
    if (y0 * y1 < 0 && Math.min(Math.abs(y0), Math.abs(y1)) > 20 * med) {
      // refine: a pole keeps growing as we close in, a steep root does not
      let p = lo + ((hi - lo) * i) / n, q = p + (hi - lo) / n;
      for (let k = 0; k < 40; k++) { const m = (p + q) / 2; if (f(m) * y0 > 0) p = m; else q = m; }
      const m = (p + q) / 2;
      if (Math.abs(f(p)) > 1e6 * med || !Number.isFinite(f(m))) return m;
    }
  }
  return null;
}

/** A y-range that shows the function well: robust to poles (percentiles), padded, never degenerate. */
export function yRange(fs: ((x: number) => number)[], x0: number, x1: number, opts: { include0?: boolean; pad?: number; q?: number } = {}): [number, number] {
  const ys: number[] = [];
  for (const f of fs) for (let i = 0; i <= 400; i++) { const y = f(x0 + ((x1 - x0) * i) / 400); if (Number.isFinite(y)) ys.push(y); }
  if (!ys.length) return [-1, 1];
  ys.sort((a, b) => a - b);
  const q = opts.q ?? 0.06;
  let lo = ys[Math.floor(ys.length * q)], hi = ys[Math.ceil(ys.length * (1 - q)) - 1];
  if (opts.include0 !== false) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  const span = Math.max(hi - lo, 1e-3 * Math.max(1, Math.abs(hi)), 0.5);
  const pad = (opts.pad ?? 0.18) * span;
  return [lo - pad, hi + pad];
}

/** Frame [x0, x1] and the functions on it. */
export function fitView(plot: Plot2D, fs: ((x: number) => number)[], x0: number, x1: number, opts: { include0?: boolean; pad?: number; q?: number } = {}) {
  const [y0, y1] = yRange(fs, x0, x1, opts);
  plot.setView({ x0, x1, y0, y1 });
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
