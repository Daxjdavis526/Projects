// Exact symbolic differentiation by the rules of calculus (sum, product,
// quotient, power, chain), simplified afterwards. Used live: the derivative
// curve, tangent planes, gradients, Jacobians, Taylor coefficients, curvature.
// Functions without a derivative formula here (Γ, H(x)) raise NotDifferentiable;
// callers then fall back to a labelled numerical derivative.

import { Node, num, neg, add, sub, mul, div, pow, call, freeSymbols } from './ast';
import { FUNCTIONS } from './functions';
import { simplify } from './simplify';

export class NotDifferentiable extends Error {}

function d(n: Node, x: string): Node {
  switch (n.t) {
    case 'num': return num(0);
    case 'sym': return num(n.name === x ? 1 : 0);
    case 'neg': return neg(d(n.a, x));
    case 'add': return add(d(n.a, x), d(n.b, x));
    case 'sub': return sub(d(n.a, x), d(n.b, x));
    case 'mul': return add(mul(d(n.a, x), n.b), mul(n.a, d(n.b, x)));
    case 'div': return div(sub(mul(d(n.a, x), n.b), mul(n.a, d(n.b, x))), pow(n.b, num(2)));
    case 'pow': {
      const baseHasX = freeSymbols(n.a).has(x), expHasX = freeSymbols(n.b).has(x);
      if (!baseHasX && !expHasX) return num(0);
      if (!expHasX) {
        // power rule with the chain rule: (u^k)' = k u^(k−1) u'
        const k = n.b;
        return mul(mul(k, pow(n.a, k.t === 'num' ? num(k.v - 1) : sub(k, num(1)))), d(n.a, x));
      }
      if (!baseHasX) return mul(mul(n, call('ln', n.a)), d(n.b, x));            // (a^v)' = a^v ln a · v'
      // general: (u^v)' = u^v (v' ln u + v u'/u)
      return mul(n, add(mul(d(n.b, x), call('ln', n.a)), div(mul(n.b, d(n.a, x)), n.a)));
    }
    case 'call': {
      if (n.args.every((a) => !freeSymbols(a).has(x))) return num(0);
      const spec = FUNCTIONS[n.fn];
      if (n.fn === 'atan2') {
        const [y, xx] = n.args;
        return div(sub(mul(xx, d(y, x)), mul(y, d(xx, x))), add(pow(xx, num(2)), pow(y, num(2))));
      }
      if (n.fn === 'hypot') {
        const s = n.args.reduce<Node>((acc, a, i) => (i ? add(acc, mul(a, d(a, x))) : mul(a, d(a, x))), num(0));
        return div(s, n);
      }
      if (!spec || !spec.d || n.args.length !== 1) throw new NotDifferentiable(`MathVerse has no derivative formula for ${n.fn}; a numerical derivative is used instead`);
      const outer = spec.d(n.args[0]);
      if (!outer) throw new NotDifferentiable(`MathVerse has no derivative formula for ${n.fn}; a numerical derivative is used instead`);
      return mul(outer, d(n.args[0], x));
    }
    case 'tuple': return { t: 'tuple', items: n.items.map((it) => d(it, x)) };
    case 'matrix': return { t: 'matrix', rows: n.rows.map((r) => r.map((it) => d(it, x))) };
  }
}

/** d/dx of an expression, simplified. */
export function derivative(n: Node, x: string): Node {
  return simplify(d(n, x));
}

/** The n-th derivative. */
export function nthDerivative(n: Node, x: string, order: number): Node {
  let cur = n;
  for (let k = 0; k < order; k++) cur = derivative(cur, x);
  return cur;
}

/** Gradient (∂f/∂x₁, …) as a list of trees. */
export function gradient(n: Node, vars: string[]): Node[] {
  return vars.map((v) => derivative(n, v));
}

/** Jacobian matrix ∂Fᵢ/∂xⱼ of a tuple of expressions. */
export function jacobian(components: Node[], vars: string[]): Node[][] {
  return components.map((c) => vars.map((v) => derivative(c, v)));
}

/** Numerical derivative (central difference, step scaled to x), for functions without a formula. */
export function numericDerivative(f: (x: number) => number, x: number, order = 1): number {
  const h = 1e-4 * Math.max(1, Math.abs(x));
  if (order === 1) return (f(x + h) - f(x - h)) / (2 * h);
  const h2 = 1e-3 * Math.max(1, Math.abs(x));
  return (f(x + h2) - 2 * f(x) + f(x - h2)) / (h2 * h2);
}
