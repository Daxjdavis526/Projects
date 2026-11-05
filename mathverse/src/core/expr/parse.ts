// A safe parser for typed mathematics. It understands what a student writes:
// implicit multiplication (2x, x y, sin(x)cos(y)), functions without brackets
// (sin x, sin 2x), powers of functions (sin^2 x), |x|, n!, Greek letters by name
// or by character, subscripts (v_0), superscript digits (x²), and vectors,
// tuples and matrices. The result is a tree; nothing is ever evaluated as code.

import { Node, num, sym, neg, add, sub, mul, div, pow, call, CONSTANTS, GREEK, GREEK_FROM_CHAR } from './ast';
import { FUNCTIONS } from './functions';

export class ParseError extends Error {
  constructor(message: string, public pos: number, public input: string) { super(message); }
}

export interface ParseOptions {
  /** Multi-letter names to keep whole (declared variables and parameters, user functions). */
  names?: string[];
  /** Names of user-defined functions that may be called, e.g. f in f(2). */
  userFunctions?: string[];
}

type Tok =
  | { k: 'num'; v: number; text: string; pos: number }
  | { k: 'id'; v: string; pos: number }
  | { k: 'op'; v: string; pos: number }
  | { k: 'end'; pos: number };

const SUPERSCRIPT: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
const SUBSCRIPT: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

/** Normalize Unicode and typographic variants into the parser's plain alphabet. */
export function normalize(src: string): string {
  let s = src
    .replace(/[−–—]/g, '-').replace(/[×·⋅∙]/g, '*').replace(/÷/g, '/')
    .replace(/π/g, ' pi ').replace(/∞/g, ' inf ').replace(/√/g, ' sqrt ')
    .replace(/\*\*/g, '^').replace(/[   ]/g, ' ');
  // superscript runs: x²³ → x^(23); x⁻¹ → x^(-1)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => `^(${[...m].map((c) => SUPERSCRIPT[c]).join('')})`);
  s = s.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (m) => `_${[...m].map((c) => SUBSCRIPT[c]).join('')}`);
  return s;
}

function lex(src: string): Tok[] {
  const s = normalize(src);
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (!m) throw new ParseError(`“${c}” cannot start a number`, i, src);
      // "2e" followed by a letter is 2·e, not an exponent
      out.push({ k: 'num', v: parseFloat(m[0]), text: m[0], pos: i });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-zͰ-Ͽ]/.test(c)) {
      // a name: letters, then an optional subscript _x / _12 / _{ab}
      // a function whose name ends in digits (log10, log2, atan2) is one name
      const fnDigits = /^(log10|log2|atan2)(?![A-Za-z0-9])/.exec(s.slice(i));
      if (fnDigits) { out.push({ k: 'id', v: fnDigits[1], pos: i }); i += fnDigits[1].length; continue; }
      const m = /^[A-Za-zͰ-Ͽ]+(?:_(?:\{[A-Za-z0-9]+\}|[A-Za-z0-9]+))?/.exec(s.slice(i))!;
      let name = m[0].replace(/[{}]/g, '');
      name = [...name].map((ch) => GREEK_FROM_CHAR[ch] ?? ch).join('');
      out.push({ k: 'id', v: name, pos: i });
      i += m[0].length;
      continue;
    }
    if ('+-*/^(),[]|!='.includes(c)) { out.push({ k: 'op', v: c, pos: i }); i++; continue; }
    throw new ParseError(`“${c}” is not something MathVerse can read here`, i, src);
  }
  out.push({ k: 'end', pos: s.length });
  return out;
}

/** Split an unknown multi-letter name into a product of single letters (xy → x·y), keeping known names whole. */
function splitName(name: string, keep: Set<string>): string[] | null {
  if (keep.has(name) || name in CONSTANTS || name in GREEK || name in FUNCTIONS) return [name];
  const base = name.split('_')[0];
  const subscript = name.includes('_') ? name.slice(name.indexOf('_')) : '';
  if (keep.has(base) || base in GREEK) return [name];
  // longest-match scan for embedded known names (e.g. "xsin" → x, sin)
  const parts: string[] = [];
  let i = 0;
  while (i < base.length) {
    let hit = '';
    for (const known of [...keep, ...Object.keys(GREEK), ...Object.keys(FUNCTIONS), 'pi']) {
      if (known.length > hit.length && base.startsWith(known, i)) hit = known;
    }
    if (hit) { parts.push(hit); i += hit.length; } else { parts.push(base[i]); i++; }
  }
  if (subscript) parts[parts.length - 1] += subscript;
  return parts;
}

export function parse(src: string, opts: ParseOptions = {}): Node {
  const keep = new Set([...(opts.names ?? []), ...(opts.userFunctions ?? [])]);
  const userFns = new Set(opts.userFunctions ?? []);
  const toks = lex(src);
  let p = 0;
  let absDepth = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => { const t = toks[p]; return t.k === 'op' && t.v === v; };
  const expect = (v: string, what: string) => {
    if (!isOp(v)) {
      const t = toks[p];
      throw new ParseError(t.k === 'end' ? `${what} — the formula ended too soon` : `${what}, but found “${t.k === 'op' ? t.v : t.k === 'num' ? t.text : t.v}”`, t.pos, src);
    }
    p++;
  };
  // a pending queue of names produced by splitting (xy → x, y)
  const pendingNames: string[] = [];

  function parseExpr(): Node {
    let left = parseTerm();
    while (isOp('+') || isOp('-')) {
      const op = (toks[p] as { v: string }).v; p++;
      const right = parseTerm();
      left = op === '+' ? add(left, right) : sub(left, right);
    }
    return left;
  }

  // can the next token begin a factor (for implicit multiplication)?
  function startsFactor(): boolean {
    if (pendingNames.length) return true;
    const t = peek();
    if (t.k === 'num' || t.k === 'id') return true;
    if (t.k === 'op' && (t.v === '(' || t.v === '[')) return true;
    if (t.k === 'op' && t.v === '|' && absDepth === 0) return true;
    return false;
  }

  function parseTerm(): Node {
    let left = parseUnary();
    for (;;) {
      if (isOp('*')) { p++; left = mul(left, parseUnary()); continue; }
      if (isOp('/')) { p++; left = div(left, parseUnary()); continue; }
      if (startsFactor()) { left = mul(left, parsePower()); continue; }
      return left;
    }
  }

  function parseUnary(): Node {
    if (!pendingNames.length && isOp('-')) { p++; return neg(parseUnary()); }
    if (!pendingNames.length && isOp('+')) { p++; return parseUnary(); }
    return parsePower();
  }

  function parsePower(): Node {
    let base = parsePostfix();
    if (!pendingNames.length && isOp('^')) {
      p++;
      const exp = parseUnary();          // right-associative; allows x^-2
      base = pow(base, exp);
    }
    return base;
  }

  function parsePostfix(): Node {
    let n = parsePrimary();
    while (!pendingNames.length && isOp('!')) { p++; n = call('factorial', n); }
    return n;
  }

  function parseArgs(): Node[] {
    expect('(', 'Expected “(”');
    const args: Node[] = [];
    if (isOp(')')) { p++; return args; }
    args.push(parseExpr());
    while (isOp(',')) { p++; args.push(parseExpr()); }
    expect(')', 'Expected “)” to close the brackets');
    return args;
  }

  function applyFunction(name: string, pos: number): Node {
    const spec = FUNCTIONS[name];
    // sin^2 x  →  (sin x)^2 ; sin^-1 x → asin x
    let power: Node | null = null;
    if (isOp('^')) {
      p++;
      power = parseUnary();
      if (power.t === 'neg' && power.a.t === 'num' && power.a.v === 1 && ['sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'].includes(name)) {
        name = (name.endsWith('h') ? 'a' : 'a') + name;
        power = null;
      }
    }
    let args: Node[];
    if (isOp('(')) args = parseArgs();
    else {
      // no brackets: the argument is the following product of non-function factors (sin 2x = sin(2x))
      if (!startsFactor()) throw new ParseError(`${name} needs an argument, like ${name}(x)`, pos, src);
      let a = parsePower();
      while (startsFactor() && !(peek().k === 'id' && (FUNCTIONS[(peek() as { v: string }).v] || userFns.has((peek() as { v: string }).v)))) a = mul(a, parsePower());
      args = [a];
    }
    const want = FUNCTIONS[name].arity;
    const [lo, hi] = Array.isArray(want) ? want : [want, want];
    if (args.length < lo || args.length > hi) {
      throw new ParseError(`${name} takes ${lo === hi ? lo : `${lo} to ${hi}`} argument${hi === 1 ? '' : 's'}, not ${args.length}`, pos, src);
    }
    void spec;
    const f = call(name, ...args);
    return power ? pow(f, power) : f;
  }

  function parseName(name: string, pos: number): Node {
    // gamma is both a Greek letter and Γ(x): it is the function only when called with brackets,
    // and a declared variable name always wins over a function of the same name
    if (name in FUNCTIONS && ((name in GREEK && !isOp('(')) || (keep.has(name) && !isOp('(')))) return sym(name);
    if (name in FUNCTIONS) return applyFunction(name, pos);
    if (userFns.has(name) && isOp('(')) return { t: 'call', fn: name, args: parseArgs() };
    return sym(name);
  }

  function parsePrimary(): Node {
    if (pendingNames.length) {
      const name = pendingNames.shift()!;
      return parseName(name, peek().pos);
    }
    const t = peek();
    if (t.k === 'num') { p++; return num(t.v); }
    if (t.k === 'id') {
      p++;
      const parts = splitName(t.v, keep);
      if (!parts) return sym(t.v);
      const [first, ...rest] = parts;
      pendingNames.unshift(...rest);
      return parseName(first, t.pos);
    }
    if (t.k === 'op' && t.v === '(') {
      p++;
      const first = parseExpr();
      if (isOp(',')) {
        const items = [first];
        while (isOp(',')) { p++; items.push(parseExpr()); }
        expect(')', 'Expected “)” to close the tuple');
        return { t: 'tuple', items };
      }
      expect(')', 'Expected “)” to close the brackets');
      return first;
    }
    if (t.k === 'op' && t.v === '[') {
      p++;
      if (isOp('[')) {
        // a matrix [[a, b], [c, d]]
        const rows: Node[][] = [];
        do {
          if (rows.length) p++;            // the comma between rows
          expect('[', 'Expected “[” to start a matrix row');
          const row = [parseExpr()];
          while (isOp(',')) { p++; row.push(parseExpr()); }
          expect(']', 'Expected “]” to end the matrix row');
          rows.push(row);
        } while (isOp(','));
        expect(']', 'Expected “]” to close the matrix');
        const w = rows[0].length;
        if (rows.some((r) => r.length !== w)) throw new ParseError('Every row of a matrix needs the same number of entries', t.pos, src);
        return { t: 'matrix', rows };
      }
      const items = [parseExpr()];
      while (isOp(',')) { p++; items.push(parseExpr()); }
      expect(']', 'Expected “]” to close the vector');
      return { t: 'tuple', items };
    }
    if (t.k === 'op' && t.v === '|') {
      p++; absDepth++;
      const inner = parseExpr();
      absDepth--;
      expect('|', 'Expected a closing “|” for the absolute value');
      return call('abs', inner);
    }
    if (t.k === 'end') throw new ParseError('The formula ended too soon — something is missing at the end', t.pos, src);
    throw new ParseError(`Unexpected “${t.v}”`, t.pos, src);
  }

  if (toks[0].k === 'end') throw new ParseError('Type a formula', 0, src);
  const tree = parseExpr();
  if (peek().k !== 'end') {
    const t = peek();
    const what = t.k === 'op' ? t.v : t.k === 'num' ? t.text : t.k === 'id' ? t.v : '';
    throw new ParseError(what === ')' ? 'There is a “)” with no matching “(”' : `Unexpected “${what}”`, t.pos, src);
  }
  return tree;
}
