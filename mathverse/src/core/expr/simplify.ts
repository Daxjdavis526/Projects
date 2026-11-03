// A light algebraic simplifier: constant folding and the identities that make
// derivatives readable (x·1, x+0, x^1, 0·x, −(−x), numeric factors gathered).
// It never changes the value of an expression where it is defined; anything
// heavier (factoring, trig identities) is SymPy's job.

import { Node, num, neg, add, sub, mul, div, pow, equal } from './ast';
import { FUNCTIONS } from './functions';

type Num = { t: 'num'; v: number };
function isNum(n: Node): n is Num;
function isNum(n: Node, v: number): boolean;
function isNum(n: Node, v?: number): boolean { return n.t === 'num' && (v === undefined || n.v === v); }

export function simplify(n: Node): Node {
  let prev = '';
  let cur = n;
  for (let i = 0; i < 8; i++) {
    const s = JSON.stringify(cur);
    if (s === prev) break;
    prev = s;
    cur = step(cur);
  }
  return cur;
}

function step(n: Node): Node {
  switch (n.t) {
    case 'num': case 'sym': return n;
    case 'tuple': return { t: 'tuple', items: n.items.map(simplify) };
    case 'matrix': return { t: 'matrix', rows: n.rows.map((r) => r.map(simplify)) };
    case 'call': {
      const args = n.args.map(step);
      // fold a call on numbers only for exact-valued functions at exact points (keep sin(1) symbolic)
      if (args.every((a) => a.t === 'num')) {
        const v = FUNCTIONS[n.fn]?.f(...args.map((a) => (a as { v: number }).v));
        if (v !== undefined && Number.isFinite(v) && Number.isInteger(v) && Math.abs(v) < 1e12 && ['abs', 'sign', 'floor', 'ceil', 'min', 'max', 'mod', 'factorial'].includes(n.fn)) return num(v);
        if (n.fn === 'ln' || n.fn === 'log') { if (isNum(args[0], 1)) return num(0); }
        if ((n.fn === 'sin' || n.fn === 'tan' || n.fn === 'sinh' || n.fn === 'tanh' || n.fn === 'asin' || n.fn === 'atan') && isNum(args[0], 0)) return num(0);
        if ((n.fn === 'cos' || n.fn === 'cosh' || n.fn === 'exp') && isNum(args[0], 0)) return num(1);
        if (n.fn === 'sqrt' && args[0].t === 'num' && Number.isInteger(Math.sqrt(args[0].v))) return num(Math.sqrt(args[0].v));
      }
      return { t: 'call', fn: n.fn, args };
    }
    case 'neg': {
      const a = step(n.a);
      if (a.t === 'num') return num(-a.v);
      if (a.t === 'neg') return a.a;
      if (a.t === 'mul' && a.a.t === 'num') return mul(num(-a.a.v), a.b);
      return neg(a);
    }
    case 'add': {
      const a = step(n.a), b = step(n.b);
      if (isNum(a) && isNum(b)) return num(a.v + b.v);
      if (isNum(a, 0)) return b;
      if (isNum(b, 0)) return a;
      if (b.t === 'neg') return sub(a, b.a);
      if (isNum(b) && b.v < 0) return sub(a, num(-b.v));
      if (b.t === 'mul' && isNum(b.a) && b.a.v < 0) return sub(a, b.a.v === -1 ? b.b : mul(num(-b.a.v), b.b));
      if (equal(a, b)) return mul(num(2), a);
      return add(a, b);
    }
    case 'sub': {
      const a = step(n.a), b = step(n.b);
      if (isNum(a) && isNum(b)) return num(a.v - b.v);
      if (isNum(b, 0)) return a;
      if (isNum(a, 0)) return neg(b);
      if (b.t === 'neg') return add(a, b.a);
      if (isNum(b) && b.v < 0) return add(a, num(-b.v));
      if (equal(a, b)) return num(0);
      return sub(a, b);
    }
    case 'mul': {
      const a = step(n.a), b = step(n.b);
      if (isNum(a) && isNum(b)) return num(a.v * b.v);
      if (isNum(a, 0) || isNum(b, 0)) return num(0);
      if (isNum(a, 1)) return b;
      if (isNum(b, 1)) return a;
      if (isNum(a, -1)) return neg(b);
      if (isNum(b, -1)) return neg(a);
      if (isNum(b)) return mul(b, a);                                   // numbers first: x·3 → 3x
      if (a.t === 'neg') return neg(mul(a.a, b));
      if (b.t === 'neg') return neg(mul(a, b.a));
      if (isNum(a) && b.t === 'mul' && isNum(b.a)) return mul(num(a.v * b.a.v), b.b);   // 2·(3x) → 6x
      if (a.t === 'mul' && isNum(a.a) && !isNum(b)) return mul(a.a, mul(a.b, b));        // (2x)·y → 2(xy)
      if (b.t === 'mul' && isNum(b.a)) return mul(b.a, mul(a, b.b));                     // x·(2y) → 2(xy)
      if (isNum(a) && b.t === 'div' && isNum(b.a)) return div(num(a.v * b.a.v), b.b);    // 2·(3/x) → 6/x
      if (equal(a, b)) return pow(a, num(2));
      if (a.t === 'pow' && equal(a.a, b) && isNum(a.b)) return pow(b, num(a.b.v + 1));
      if (b.t === 'pow' && equal(b.a, a) && isNum(b.b)) return pow(a, num(b.b.v + 1));
      if (a.t === 'pow' && b.t === 'pow' && equal(a.a, b.a) && isNum(a.b) && isNum(b.b)) return pow(a.a, num(a.b.v + b.b.v));
      return mul(a, b);
    }
    case 'div': {
      const a = step(n.a), b = step(n.b);
      if (isNum(a) && isNum(b) && b.v !== 0 && Number.isInteger(a.v / b.v)) return num(a.v / b.v);
      if (isNum(a, 0) && !isNum(b, 0)) return num(0);
      if (isNum(b, 1)) return a;
      if (isNum(b, -1)) return neg(a);
      if (equal(a, b)) return num(1);
      if (a.t === 'neg') return neg(div(a.a, b));
      if (a.t === 'div') return div(a.a, mul(a.b, b));
      if (b.t === 'div') return div(mul(a, b.b), b.a);
      if (a.t === 'mul' && isNum(a.a) && isNum(b) && Number.isInteger(a.a.v / b.v)) return mul(num(a.a.v / b.v), a.b);
      return div(a, b);
    }
    case 'pow': {
      const a = step(n.a), b = step(n.b);
      if (isNum(a) && isNum(b)) { const v = Math.pow(a.v, b.v); if (Number.isInteger(v) && Math.abs(v) < 1e12) return num(v); }
      if (isNum(b, 0)) return num(1);
      if (isNum(b, 1)) return a;
      if (isNum(a, 1)) return num(1);
      if (a.t === 'pow' && isNum(a.b) && isNum(b) && Number.isInteger(a.b.v) && Number.isInteger(b.v)) return pow(a.a, num(a.b.v * b.v));
      if (isNum(b, -1)) return div(num(1), a);
      return pow(a, b);
    }
  }
}
