// Turn a tree into a fast numeric function — closures, not generated code, so
// no eval anywhere (Tauri's content-security policy forbids it, rightly).

import { Node, CONSTANTS } from './ast';
import { FUNCTIONS } from './functions';

export type Fn = (vals: ArrayLike<number>) => number;
type C = (v: ArrayLike<number>) => number;

export class EvalError extends Error {}

/**
 * Compile `node` to a function of the values of `vars`, in that order.
 * Symbols not in `vars` must be constants (pi, e) or appear in `fixed`.
 * `userFns` supplies user-defined functions (f in f(x+1)).
 */
export function compile(node: Node, vars: string[], fixed: Record<string, number> = {}, userFns: Record<string, (...a: number[]) => number> = {}): Fn {
  const index = new Map(vars.map((v, i) => [v, i]));
  function c(n: Node): C {
    switch (n.t) {
      case 'num': { const v = n.v; return () => v; }
      case 'sym': {
        const i = index.get(n.name);
        if (i !== undefined) return (v) => v[i];
        if (n.name in fixed) { const k = fixed[n.name]; return () => k; }
        if (n.name in CONSTANTS) { const k = CONSTANTS[n.name].value; return () => k; }
        throw new EvalError(`“${n.name}” has no value — give it one, or make it a slider`);
      }
      case 'neg': { const a = c(n.a); return (v) => -a(v); }
      case 'add': { const a = c(n.a), b = c(n.b); return (v) => a(v) + b(v); }
      case 'sub': { const a = c(n.a), b = c(n.b); return (v) => a(v) - b(v); }
      case 'mul': { const a = c(n.a), b = c(n.b); return (v) => a(v) * b(v); }
      case 'div': { const a = c(n.a), b = c(n.b); return (v) => a(v) / b(v); }
      case 'pow': {
        const a = c(n.a);
        if (n.b.t === 'num') {
          const k = n.b.v;
          if (k === 2) return (v) => { const x = a(v); return x * x; };
          if (k === 3) return (v) => { const x = a(v); return x * x * x; };
          if (k === 0.5) return (v) => Math.sqrt(a(v));
          // odd-denominator rational powers of negatives are real: (−8)^(1/3) = −2
          return (v) => realPow(a(v), k);
        }
        if (n.b.t === 'div' && n.b.a.t === 'num' && n.b.b.t === 'num') {
          const p_ = n.b.a.v, q = n.b.b.v;
          return (v) => ratPow(a(v), p_, q);
        }
        const b = c(n.b);
        return (v) => realPow(a(v), b(v));
      }
      case 'call': {
        const spec = FUNCTIONS[n.fn];
        const args = n.args.map(c);
        const f = spec ? spec.f : userFns[n.fn];
        if (!f) throw new EvalError(`“${n.fn}” is not a known function`);
        if (args.length === 1) { const a = args[0]; return (v) => f(a(v)); }
        if (args.length === 2) { const a = args[0], b = args[1]; return (v) => f(a(v), b(v)); }
        return (v) => f(...args.map((g) => g(v)));
      }
      case 'tuple': throw new EvalError('A vector or point was given where a single number is needed');
      case 'matrix': throw new EvalError('A matrix was given where a single number is needed');
    }
  }
  return c(node);
}

function realPow(x: number, k: number): number {
  if (x < 0 && !Number.isInteger(k)) {
    // a decimal power that is a rational with odd denominator (1/3, 2/3, 0.2): take the real root
    for (const q of [3, 5, 7, 9]) {
      const p = Math.round(k * q);
      if (Math.abs(k * q - p) < 1e-12) return ratPow(x, p, q);
    }
    return NaN;
  }
  return Math.pow(x, k);
}

function ratPow(x: number, p: number, q: number): number {
  if (x >= 0 || q % 2 === 0) return Math.pow(x, p / q);
  const r = Math.pow(-x, 1 / q) * -1;          // the real odd root
  return Math.pow(r, p);
}

/** Compile each component of a tuple (or a single expression as a 1-tuple). */
export function compileVector(node: Node, vars: string[], fixed: Record<string, number> = {}): Fn[] {
  const items = node.t === 'tuple' ? node.items : [node];
  return items.map((it) => compile(it, vars, fixed));
}

/** Evaluate a closed expression (no free variables) to a number. */
export function evaluate(node: Node, fixed: Record<string, number> = {}): number {
  return compile(node, [], fixed)([]);
}
