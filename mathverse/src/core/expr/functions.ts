// The whitelist of functions a formula may use. Anything not here is not a
// function — a typo like "sni(x)" is reported, never looked up anywhere else.

import { Node, num, neg, add, sub, mul, div, pow, call } from './ast';

export interface FnSpec {
  arity: number | [number, number];
  f: (...a: number[]) => number;
  tex: string;                 // LaTeX command, or a template for special forms
  sympy: string;               // the SymPy function name
  /** d/du f(u) as a tree in u (single-argument functions); null when it has no derivative formula here. */
  d?: (u: Node) => Node | null;
  /** a short description for the help panel */
  help: string;
}

const sq = (u: Node) => pow(u, num(2));

function gammaLanczos(x: number): number {
  if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gammaLanczos(1 - x));
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
}

function erf(x: number): number {
  // Abramowitz–Stegun 7.1.26 is only 1e-7; use a series / continued fraction good to ~1e-15
  const ax = Math.abs(x);
  if (ax < 2.5) {
    let sum = x, term = x;
    for (let n = 1; n < 200; n++) { term *= -x * x / n; const add_ = term / (2 * n + 1); sum += add_; if (Math.abs(add_) < 1e-17 * Math.abs(sum)) break; }
    return (2 / Math.sqrt(Math.PI)) * sum;
  }
  // erfc by continued fraction (Lentz)
  const z = ax;
  let f = z, C = z, D = 0;
  for (let k = 1; k < 300; k++) {
    const an = k / 2;
    D = z + an * D; D = D === 0 ? 1e-300 : 1 / D;
    C = z + an / C; if (C === 0) C = 1e-300;
    const delta = C * D; f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  const erfc = Math.exp(-z * z) / (f * Math.sqrt(Math.PI));
  return Math.sign(x) * (1 - erfc);
}

function factorial(n: number): number {
  if (n < 0 && Number.isInteger(n)) return NaN;
  if (Number.isInteger(n) && n <= 170) { let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; }
  return gammaLanczos(n + 1);
}

const TABLE: Record<string, FnSpec> = {
  sin: { arity: 1, f: Math.sin, tex: '\\sin', sympy: 'sin', d: (u) => call('cos', u), help: 'sine' },
  cos: { arity: 1, f: Math.cos, tex: '\\cos', sympy: 'cos', d: (u) => neg(call('sin', u)), help: 'cosine' },
  tan: { arity: 1, f: Math.tan, tex: '\\tan', sympy: 'tan', d: (u) => sq(call('sec', u)), help: 'tangent' },
  sec: { arity: 1, f: (x) => 1 / Math.cos(x), tex: '\\sec', sympy: 'sec', d: (u) => mul(call('sec', u), call('tan', u)), help: 'secant' },
  csc: { arity: 1, f: (x) => 1 / Math.sin(x), tex: '\\csc', sympy: 'csc', d: (u) => neg(mul(call('csc', u), call('cot', u))), help: 'cosecant' },
  cot: { arity: 1, f: (x) => 1 / Math.tan(x), tex: '\\cot', sympy: 'cot', d: (u) => neg(sq(call('csc', u))), help: 'cotangent' },
  asin: { arity: 1, f: Math.asin, tex: '\\arcsin', sympy: 'asin', d: (u) => div(num(1), call('sqrt', sub(num(1), sq(u)))), help: 'inverse sine' },
  acos: { arity: 1, f: Math.acos, tex: '\\arccos', sympy: 'acos', d: (u) => neg(div(num(1), call('sqrt', sub(num(1), sq(u))))), help: 'inverse cosine' },
  atan: { arity: 1, f: Math.atan, tex: '\\arctan', sympy: 'atan', d: (u) => div(num(1), add(num(1), sq(u))), help: 'inverse tangent' },
  sinh: { arity: 1, f: Math.sinh, tex: '\\sinh', sympy: 'sinh', d: (u) => call('cosh', u), help: 'hyperbolic sine' },
  cosh: { arity: 1, f: Math.cosh, tex: '\\cosh', sympy: 'cosh', d: (u) => call('sinh', u), help: 'hyperbolic cosine' },
  tanh: { arity: 1, f: Math.tanh, tex: '\\tanh', sympy: 'tanh', d: (u) => sub(num(1), sq(call('tanh', u))), help: 'hyperbolic tangent' },
  asinh: { arity: 1, f: Math.asinh, tex: '\\operatorname{arsinh}', sympy: 'asinh', d: (u) => div(num(1), call('sqrt', add(sq(u), num(1)))), help: 'inverse hyperbolic sine' },
  acosh: { arity: 1, f: Math.acosh, tex: '\\operatorname{arcosh}', sympy: 'acosh', d: (u) => div(num(1), call('sqrt', sub(sq(u), num(1)))), help: 'inverse hyperbolic cosine' },
  atanh: { arity: 1, f: Math.atanh, tex: '\\operatorname{artanh}', sympy: 'atanh', d: (u) => div(num(1), sub(num(1), sq(u))), help: 'inverse hyperbolic tangent' },
  exp: { arity: 1, f: Math.exp, tex: '\\exp', sympy: 'exp', d: (u) => call('exp', u), help: 'exponential, e^x' },
  ln: { arity: 1, f: Math.log, tex: '\\ln', sympy: 'log', d: (u) => div(num(1), u), help: 'natural logarithm' },
  log: { arity: 1, f: Math.log, tex: '\\ln', sympy: 'log', d: (u) => div(num(1), u), help: 'natural logarithm (as in most university texts; log10 for base 10)' },
  log10: { arity: 1, f: Math.log10, tex: '\\log_{10}', sympy: 'log10', d: (u) => div(num(1), mul(u, call('ln', num(10)))), help: 'base-10 logarithm' },
  log2: { arity: 1, f: Math.log2, tex: '\\log_{2}', sympy: 'log2', d: (u) => div(num(1), mul(u, call('ln', num(2)))), help: 'base-2 logarithm' },
  sqrt: { arity: 1, f: Math.sqrt, tex: '\\sqrt', sympy: 'sqrt', d: (u) => div(num(1), mul(num(2), call('sqrt', u))), help: 'square root' },
  cbrt: { arity: 1, f: Math.cbrt, tex: '\\sqrt[3]', sympy: 'cbrt', d: (u) => div(num(1), mul(num(3), sq(call('cbrt', u)))), help: 'cube root' },
  abs: { arity: 1, f: Math.abs, tex: '|', sympy: 'Abs', d: (u) => call('sign', u), help: 'absolute value |x| (its derivative sign(x) is undefined at 0)' },
  sign: { arity: 1, f: Math.sign, tex: '\\operatorname{sgn}', sympy: 'sign', d: () => num(0), help: 'sign: −1, 0 or 1' },
  floor: { arity: 1, f: Math.floor, tex: '\\lfloor', sympy: 'floor', d: () => num(0), help: 'round down' },
  ceil: { arity: 1, f: Math.ceil, tex: '\\lceil', sympy: 'ceiling', d: () => num(0), help: 'round up' },
  heaviside: { arity: 1, f: (x) => (x > 0 ? 1 : x < 0 ? 0 : 0.5), tex: '\\theta', sympy: 'Heaviside', d: () => null, help: 'step function H(x)' },
  erf: { arity: 1, f: erf, tex: '\\operatorname{erf}', sympy: 'erf', d: (u) => mul(div(num(2), call('sqrt', { t: 'sym', name: 'pi' })), call('exp', neg(sq(u)))), help: 'error function' },
  gamma: { arity: 1, f: gammaLanczos, tex: '\\Gamma', sympy: 'gamma', d: () => null, help: 'gamma function Γ(x)' },
  factorial: { arity: 1, f: factorial, tex: '!', sympy: 'factorial', d: () => null, help: 'n!' },
  atan2: { arity: 2, f: Math.atan2, tex: '\\operatorname{atan2}', sympy: 'atan2', help: 'angle of the point (x, y): atan2(y, x)' },
  min: { arity: [2, 8], f: Math.min, tex: '\\min', sympy: 'Min', help: 'smallest argument' },
  max: { arity: [2, 8], f: Math.max, tex: '\\max', sympy: 'Max', help: 'largest argument' },
  mod: { arity: 2, f: (a, b) => a - b * Math.floor(a / b), tex: '\\bmod', sympy: 'Mod', help: 'remainder, mod(a, b)' },
  hypot: { arity: [2, 4], f: Math.hypot, tex: '\\operatorname{hypot}', sympy: 'hypot', help: 'sqrt of the sum of squares' },
};

// a null-prototype table: "constructor", "valueOf" and friends are never functions
export const FUNCTIONS: Record<string, FnSpec> = Object.assign(Object.create(null) as Record<string, FnSpec>, TABLE);

export const FUNCTION_NAMES = new Set(Object.keys(FUNCTIONS));
export { gammaLanczos, erf, factorial };
