import { describe, it, expect } from 'vitest';
import { FUNCTIONS } from '../src/core/expr/functions';
import { parse, compile, derivative, toTeX, toText, toSympy, ParseError, simplify, nthDerivative } from '../src/core/expr';

const ev = (s: string, vars: Record<string, number> = {}) => compile(parse(s, { names: Object.keys(vars) }), Object.keys(vars))(Object.values(vars));

describe('parser', () => {
  it('precedence and associativity', () => {
    expect(ev('2+3*4')).toBe(14);
    expect(ev('2^3^2')).toBe(512);
    expect(ev('-2^2')).toBe(-4);
    expect(ev('2^-1')).toBe(0.5);
    expect(ev('10-4-3')).toBe(3);
    expect(ev('12/2/3')).toBe(2);
  });
  it('implicit multiplication and functions without brackets', () => {
    expect(ev('2x', { x: 3 })).toBe(6);
    expect(ev('xy', { x: 2, y: 5 })).toBe(10);
    expect(ev('sin(x)cos(y)', { x: 1, y: 2 })).toBeCloseTo(Math.sin(1) * Math.cos(2), 14);
    expect(ev('sin x cos y', { x: 1, y: 2 })).toBeCloseTo(Math.sin(1) * Math.cos(2), 14);
    expect(ev('sin 2x', { x: 0.3 })).toBeCloseTo(Math.sin(0.6), 14);
    expect(ev('sin^2 x + cos^2 x', { x: 0.7 })).toBeCloseTo(1, 14);
    expect(ev('2(x+1)(x-1)', { x: 3 })).toBe(16);
    expect(ev('x^3 - 4x', { x: 2 })).toBe(0);
  });
  it('unicode, greek, subscripts, abs, factorial, constants', () => {
    expect(ev('x² + 2·x − 1', { x: 3 })).toBe(14);
    expect(ev('α θ', { alpha: 2, theta: 3 })).toBe(6);
    expect(ev('alpha*v_0', { alpha: 2, v_0: 4 })).toBe(8);
    expect(ev('|x - 5|', { x: 2 })).toBe(3);
    expect(ev('5!')).toBe(120);
    expect(ev('2π')).toBeCloseTo(2 * Math.PI, 14);
    expect(ev('e^1')).toBeCloseTo(Math.E, 14);
    expect(ev('√4')).toBe(2);
    expect(ev('(-8)^(1/3)')).toBeCloseTo(-2, 12);
  });
  it('tuples and matrices', () => {
    expect(parse('(cos t, sin t, t)').t).toBe('tuple');
    const m = parse('[[2,1],[1,2]]');
    expect(m.t).toBe('matrix');
  });
  it('friendly errors with positions', () => {
    expect(() => parse('sin(')).toThrow(ParseError);
    expect(() => parse('2 + ')).toThrow(/ended too soon/);
    expect(() => parse('(x+1')).toThrow(/close/);
    expect(() => parse('x)')).toThrow(/no matching/);
    expect(() => parse('x $ 2')).toThrow(/can read/);
    expect(() => parse('atan2(1)')).toThrow(/takes 2 arguments/);
    expect(() => parse('[[1,2],[3]]')).toThrow(/same number/);
  });
  it('security: an accepted formula is only numbers, plain names and whitelisted functions', () => {
    const walk = (n: any): void => {
      expect(['num', 'sym', 'neg', 'add', 'sub', 'mul', 'div', 'pow', 'call', 'tuple', 'matrix']).toContain(n.t);
      if (n.t === 'sym') expect(n.name).toMatch(/^[A-Za-z]+(_[A-Za-z0-9]+)?$/);
      if (n.t === 'call') expect(Object.keys(FUNCTIONS)).toContain(n.fn);
      for (const k of ['a', 'b']) if (n[k]) walk(n[k]);
      for (const c of n.args ?? n.items ?? []) walk(c);
      for (const r of n.rows ?? []) r.forEach(walk);
    };
    for (const bad of ['constructor', 'x.constructor', 'alert(1)', 'process.exit()', '__proto__', 'require("fs")', '`x`', 'x;y', 'import("x")', 'toString', 'valueOf()', 'hasOwnProperty']) {
      let tree: any = null;
      try { tree = parse(bad); } catch { /* rejected outright: fine */ }
      if (tree) walk(tree);
    }
    // even a symbol named like an Object.prototype property has no value unless given one
    expect(() => compile(parse('constructor'), [])([])).toThrow(/has no value/);
  });
});

describe('derivatives', () => {
  const check = (src: string, x: number, vars: string[] = ['x']) => {
    const n = parse(src);
    const d = compile(derivative(n, 'x'), vars);
    const f = compile(n, vars);
    const h = 1e-5;
    const num = (f([x + h]) - f([x - h])) / (2 * h);
    expect(d([x])).toBeCloseTo(num, 5);
  };
  it('match central differences for a range of functions', () => {
    for (const s of ['x^3 - 4x', 'sin(x)cos(x)', 'exp(-x^2)', 'ln(x^2+1)', 'x^x', 'tan(x)', 'atan(x)', 'sqrt(1+x^2)', 'x/(1+x)', 'asin(x/2)', 'sec(x)', 'cosh(x)^2', 'cbrt(x)', '2^x', 'erf(x)'])
      check(s, 0.7);
  });
  it('simplifies to readable forms', () => {
    expect(toText(derivative(parse('x^3 - 4x'), 'x'))).toBe('3*x^2 - 4');
    expect(toText(derivative(parse('5'), 'x'))).toBe('0');
    expect(toText(derivative(parse('sin(x)'), 'x'))).toBe('cos(x)');
    expect(toText(nthDerivative(parse('x^4'), 'x', 2))).toBe('12*x^2');
  });
  it('partial derivatives treat other variables as constants', () => {
    const n = parse('x^2 y + sin(y)');
    expect(compile(derivative(n, 'x'), ['x', 'y'])([3, 2])).toBe(12);
    expect(compile(derivative(n, 'y'), ['x', 'y'])([3, 2])).toBeCloseTo(9 + Math.cos(2), 14);
  });
});

describe('printing', () => {
  it('LaTeX', () => {
    expect(toTeX(parse('x^2/2'))).toBe('\\frac{x^{2}}{2}');
    expect(toTeX(parse('sin(x)^2'))).toBe('\\sin^{2}\\left(x\\right)');
    expect(toTeX(parse('alpha*x'))).toBe('\\alpha\\,x');
    expect(toTeX(parse('|x|'))).toBe('\\left|x\\right|');
  });
  it('SymPy syntax binds user symbols safely', () => {
    expect(toSympy(parse('gamma*x + pi'))).toBe('((v_gamma*v_x) + pi)');
    expect(toSympy(parse('ln(x)'))).toBe('log(v_x)');
  });
  it('round-trips through text', () => {
    for (const s of ['x^3 - 4*x', 'sin(x)*cos(y)', '(x + 1)/(x - 1)', '-x^2', '2^(x + 1)', 'abs(x - 1)']) {
      const a = parse(s, { names: [] });
      expect(toText(parse(toText(a)))).toBe(toText(a));
    }
  });
  it('simplify leaves values unchanged', () => {
    const n = parse('0*x + 1*y + x^1 + (x + 0)^2 - -z');
    const vals = [1.3, 2.1, -0.4];
    expect(compile(simplify(n), ['x', 'y', 'z'])(vals)).toBeCloseTo(compile(n, ['x', 'y', 'z'])(vals), 14);
  });
});

describe('fraction reduction', () => {
  it('reduces integer fractions in derivatives', () => {
    expect(toText(derivative(parse('x^2/8'), 'x'))).toBe('x/4');
    expect(toText(simplify(parse('6/8')))).toBe('3/4');
    expect(toText(simplify(parse('4x/(-6)')))).toBe('(-2)*x/3');
  });
});

describe('more simplification', () => {
  it('ln e, exp(ln x), a·(1/b)', () => {
    expect(toText(simplify(parse('ln(e)')))).toBe('1');
    expect(toText(simplify(parse('exp(ln(x))')))).toBe('x');
    expect(toText(simplify(parse('x*(1/y)')))).toBe('x/y');
  });
});
