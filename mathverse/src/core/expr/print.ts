// Printing trees: LaTeX for display (KaTeX), a canonical plain form for
// storage, and Python syntax for SymPy (re-emitted from the tree, never the
// user's raw text).

import { Node, CONSTANTS, GREEK } from './ast';
import { FUNCTIONS } from './functions';

const PREC: Record<string, number> = { add: 1, sub: 1, mul: 2, div: 2, neg: 3, pow: 4, call: 5, num: 6, sym: 6, tuple: 6, matrix: 6 };

function fmtNum(v: number): string {
  if (Number.isInteger(v)) return String(v);
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : v < 0 ? '-\\infty' : '\\text{NaN}';
  const s = String(+v.toPrecision(10));
  const m = /^(-?[\d.]+)e([+-]\d+)$/.exec(s);
  return m ? `${m[1]}\\times 10^{${parseInt(m[2], 10)}}` : s;
}

export function symbolTeX(name: string): string {
  if (name in CONSTANTS) return CONSTANTS[name].tex;
  const [base, ...subs] = name.split('_');
  const b = base in GREEK ? `\\${base}` : base.length > 1 ? `\\mathrm{${base}}` : base;
  return subs.length ? `${b}_{${subs.join('')}}` : b;
}

export function toTeX(n: Node, parentPrec = 0): string {
  const wrap = (s: string, prec: number) => (prec < parentPrec ? `\\left(${s}\\right)` : s);
  switch (n.t) {
    case 'num': return n.v < 0 ? wrap(fmtNum(n.v), 3) : fmtNum(n.v);
    case 'sym': return symbolTeX(n.name);
    case 'neg': return wrap(`-${toTeX(n.a, 3)}`, 3);
    case 'add': return wrap(`${toTeX(n.a, 1)} + ${toTeX(n.b, 1)}`, 1);
    case 'sub': return wrap(`${toTeX(n.a, 1)} - ${toTeX(n.b, 2)}`, 1);
    case 'mul': {
      const a = toTeX(n.a, 2), b = toTeX(n.b, 2);
      // a visible dot between two numbers, or before a number; otherwise juxtapose
      const dot = n.b.t === 'num' || (n.b.t === 'pow' && n.b.a.t === 'num') || n.b.t === 'neg' || /^-/.test(b);
      return wrap(dot ? `${a} \\cdot ${b}` : `${a}\\,${b}`, 2);
    }
    case 'div': return `\\frac{${toTeX(n.a)}}{${toTeX(n.b)}}`;
    case 'pow': {
      if (n.a.t === 'call' && FUNCTIONS[n.a.fn] && n.a.args.length === 1 && n.b.t === 'num' && n.b.v > 0 && /^\\[a-z]+$/.test(FUNCTIONS[n.a.fn].tex)) {
        return wrap(`${FUNCTIONS[n.a.fn].tex}^{${toTeX(n.b)}}\\left(${toTeX(n.a.args[0])}\\right)`, 4);
      }
      if (n.b.t === 'div' && n.b.a.t === 'num' && n.b.a.v === 1 && n.b.b.t === 'num' && n.b.b.v === 2) return `\\sqrt{${toTeX(n.a)}}`;
      return wrap(`${toTeX(n.a, 5)}^{${toTeX(n.b)}}`, 4);
    }
    case 'call': {
      const spec = FUNCTIONS[n.fn];
      const args = n.args.map((a) => toTeX(a));
      if (!spec) return `${symbolTeX(n.fn)}\\left(${args.join(', ')}\\right)`;
      switch (n.fn) {
        case 'abs': return `\\left|${args[0]}\\right|`;
        case 'sqrt': return `\\sqrt{${args[0]}}`;
        case 'cbrt': return `\\sqrt[3]{${args[0]}}`;
        case 'floor': return `\\left\\lfloor ${args[0]}\\right\\rfloor`;
        case 'ceil': return `\\left\\lceil ${args[0]}\\right\\rceil`;
        case 'factorial': return `${toTeX(n.args[0], 5)}!`;
        case 'exp': return n.args[0].t === 'num' || n.args[0].t === 'sym' || PREC[n.args[0].t] >= 2 ? `e^{${args[0]}}` : `\\exp\\left(${args[0]}\\right)`;
        case 'mod': return `${toTeX(n.args[0], 2)} \\bmod ${toTeX(n.args[1], 2)}`;
        default: {
          const simple = n.args.length === 1 && (n.args[0].t === 'sym' || n.args[0].t === 'num');
          return simple && /^\\(sin|cos|tan|sec|csc|cot|sinh|cosh|tanh|ln)$/.test(spec.tex) ? `${spec.tex} ${args[0]}` : `${spec.tex}\\left(${args.join(', ')}\\right)`;
        }
      }
    }
    case 'tuple': return `\\left(${n.items.map((i) => toTeX(i)).join(',\\ ')}\\right)`;
    case 'matrix': return `\\begin{bmatrix}${n.rows.map((r) => r.map((i) => toTeX(i)).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;
  }
}

/** A canonical plain-text form, re-parseable by parse(). */
export function toText(n: Node, parentPrec = 0): string {
  const wrap = (s: string, prec: number) => (prec < parentPrec ? `(${s})` : s);
  switch (n.t) {
    case 'num': return n.v < 0 ? `(${n.v})` : String(n.v);
    case 'sym': return n.name;
    case 'neg': return wrap(`-${toText(n.a, 3)}`, 3);
    case 'add': return wrap(`${toText(n.a, 1)} + ${toText(n.b, 1)}`, 1);
    case 'sub': return wrap(`${toText(n.a, 1)} - ${toText(n.b, 2)}`, 1);
    case 'mul': return wrap(`${toText(n.a, 2)}*${toText(n.b, 2)}`, 2);
    case 'div': return wrap(`${toText(n.a, 2)}/${toText(n.b, 3)}`, 2);
    case 'pow': return wrap(`${toText(n.a, 5)}^${toText(n.b, 4)}`, 4);
    case 'call': return `${n.fn}(${n.args.map((a) => toText(a)).join(', ')})`;
    case 'tuple': return `(${n.items.map((i) => toText(i)).join(', ')})`;
    case 'matrix': return `[${n.rows.map((r) => `[${r.map((i) => toText(i)).join(', ')}]`).join(', ')}]`;
  }
}

/** Python/SymPy syntax for the tree. */
export function toSympy(n: Node): string {
  switch (n.t) {
    case 'num': return Number.isInteger(n.v) ? String(n.v) : `Rational(${JSON.stringify(String(n.v))})`;
    // user symbols are emitted as v_<name> (the SymPy worker binds each to Symbol('<name>')),
    // so a variable called gamma, lambda or E can never collide with a SymPy name or keyword
    case 'sym': return n.name === 'pi' ? 'pi' : n.name === 'e' ? 'E' : n.name === 'inf' ? 'oo' : `v_${n.name}`;
    case 'neg': return `(-${toSympy(n.a)})`;
    case 'add': return `(${toSympy(n.a)} + ${toSympy(n.b)})`;
    case 'sub': return `(${toSympy(n.a)} - ${toSympy(n.b)})`;
    case 'mul': return `(${toSympy(n.a)}*${toSympy(n.b)})`;
    case 'div': return `(${toSympy(n.a)}/${toSympy(n.b)})`;
    case 'pow': return `(${toSympy(n.a)})**(${toSympy(n.b)})`;
    case 'call': {
      if (n.fn === 'hypot') return `sqrt(${n.args.map((a) => `(${toSympy(a)})**2`).join(' + ')})`;
      const spec = FUNCTIONS[n.fn];
      return `${spec ? spec.sympy : n.fn}(${n.args.map(toSympy).join(', ')})`;
    }
    case 'tuple': return `(${n.items.map(toSympy).join(', ')},)`;
    case 'matrix': return `Matrix([${n.rows.map((r) => `[${r.map(toSympy).join(', ')}]`).join(', ')}])`;
  }
}
