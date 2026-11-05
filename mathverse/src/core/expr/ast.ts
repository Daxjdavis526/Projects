// Expression trees. Every typed formula becomes one of these; nothing a user
// types is ever executed as code.

export type Node =
  | { t: 'num'; v: number }
  | { t: 'sym'; name: string }                        // a variable, parameter or constant
  | { t: 'neg'; a: Node }
  | { t: 'add'; a: Node; b: Node }
  | { t: 'sub'; a: Node; b: Node }
  | { t: 'mul'; a: Node; b: Node }
  | { t: 'div'; a: Node; b: Node }
  | { t: 'pow'; a: Node; b: Node }
  | { t: 'call'; fn: string; args: Node[] }
  | { t: 'tuple'; items: Node[] }                     // (a, b, c): points, vectors, vector fields
  | { t: 'matrix'; rows: Node[][] };                  // [[a, b], [c, d]]

export const num = (v: number): Node => ({ t: 'num', v });
export const sym = (name: string): Node => ({ t: 'sym', name });
export const neg = (a: Node): Node => ({ t: 'neg', a });
export const add = (a: Node, b: Node): Node => ({ t: 'add', a, b });
export const sub = (a: Node, b: Node): Node => ({ t: 'sub', a, b });
export const mul = (a: Node, b: Node): Node => ({ t: 'mul', a, b });
export const div = (a: Node, b: Node): Node => ({ t: 'div', a, b });
export const pow = (a: Node, b: Node): Node => ({ t: 'pow', a, b });
export const call = (fn: string, ...args: Node[]): Node => ({ t: 'call', fn, args });

/** Named constants (a symbol with one of these names is the constant, unless declared a variable). */
export const CONSTANTS: Record<string, { value: number; tex: string }> = Object.assign(Object.create(null), {
  pi: { value: Math.PI, tex: '\\pi' },
  e: { value: Math.E, tex: 'e' },
  tau: { value: 2 * Math.PI, tex: '\\tau' },
  phi_golden: { value: (1 + Math.sqrt(5)) / 2, tex: '\\varphi' },
  inf: { value: Infinity, tex: '\\infty' },
});

/** Greek letters accepted by name or as the Unicode character. */
export const GREEK: Record<string, string> = Object.assign(Object.create(null), {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ',
  iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο', rho: 'ρ',
  sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
});
export const GREEK_FROM_CHAR: Record<string, string> = Object.assign(Object.create(null), Object.fromEntries(Object.entries(GREEK).map(([k, v]) => [v, k])));

/** Free symbols of a tree (constants excluded unless `keepConstants`). */
export function freeSymbols(n: Node, out = new Set<string>(), keepConstants = false): Set<string> {
  switch (n.t) {
    case 'num': break;
    case 'sym': if (keepConstants || !(n.name in CONSTANTS)) out.add(n.name); break;
    case 'neg': freeSymbols(n.a, out, keepConstants); break;
    case 'call': n.args.forEach((a) => freeSymbols(a, out, keepConstants)); break;
    case 'tuple': n.items.forEach((a) => freeSymbols(a, out, keepConstants)); break;
    case 'matrix': n.rows.forEach((r) => r.forEach((a) => freeSymbols(a, out, keepConstants))); break;
    default: freeSymbols(n.a, out, keepConstants); freeSymbols(n.b, out, keepConstants);
  }
  return out;
}

export function equal(a: Node, b: Node): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Replace symbols by trees. */
export function substitute(n: Node, map: Record<string, Node>): Node {
  switch (n.t) {
    case 'num': return n;
    case 'sym': return map[n.name] ?? n;
    case 'neg': return neg(substitute(n.a, map));
    case 'call': return { t: 'call', fn: n.fn, args: n.args.map((a) => substitute(a, map)) };
    case 'tuple': return { t: 'tuple', items: n.items.map((a) => substitute(a, map)) };
    case 'matrix': return { t: 'matrix', rows: n.rows.map((r) => r.map((a) => substitute(a, map))) };
    default: return { t: n.t, a: substitute(n.a, map), b: substitute(n.b, map) } as Node;
  }
}
