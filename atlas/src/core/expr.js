// Math expressions typed by learners and written by authors: parse, evaluate,
// print as TeX.
//
// The grammar is a calculator's, plus the shortcuts people actually type:
// implicit multiplication (2x, x(x+1), mgh), functions applied without
// brackets (sin x, ln 2x), powers on functions (sin^2 x, sin^-1 x), unicode
// (π, √, ·, ×, −, ², θ) and scientific notation (3.0e8). The parser never
// guesses silently: toTeX shows exactly how an input was read, and the lesson
// player displays that preview beside every answer box.
//
// Conventions that differ between textbooks, and the ones chosen here:
//   ln is the natural log, log is base 10 (log2, log10 also exist)
//   a/bc means (a/b)·c, as on a calculator — the preview makes it visible
//   sin x cos x means sin(x)·cos(x); sin 2x means sin(2x); sin x^2 means sin(x²)
//   e is Euler's number unless the item declares a variable named e
// Everything here is DOM-free so the answer checker runs headlessly in Node.

export class ParseError extends Error {
  constructor(message, pos = -1) { super(message); this.pos = pos; }
}

// ─── vocabulary ────────────────────────────────────────────────────────────

const GREEK = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta', 'theta',
  'vartheta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'rho', 'sigma', 'tau', 'upsilon',
  'phi', 'varphi', 'chi', 'psi', 'omega', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma',
  'Upsilon', 'Phi', 'Psi', 'Omega'];
const GREEK_SET = new Set(GREEK);
const UNICODE_GREEK = {
  α: 'alpha', β: 'beta', γ: 'gamma', δ: 'delta', ε: 'epsilon', ϵ: 'epsilon', ζ: 'zeta', η: 'eta',
  θ: 'theta', ϑ: 'vartheta', ι: 'iota', κ: 'kappa', λ: 'lambda', μ: 'mu', µ: 'mu', ν: 'nu', ξ: 'xi',
  ρ: 'rho', σ: 'sigma', τ: 'tau', υ: 'upsilon', φ: 'phi', ϕ: 'varphi', χ: 'chi', ψ: 'psi', ω: 'omega',
  Γ: 'Gamma', Δ: 'Delta', Θ: 'Theta', Λ: 'Lambda', Ξ: 'Xi', Π: 'Pi', Σ: 'Sigma', Φ: 'Phi', Ψ: 'Psi',
  Ω: 'Omega', π: 'pi',
};

const sec = (x) => 1 / Math.cos(x), csc = (x) => 1 / Math.sin(x), cot = (x) => Math.cos(x) / Math.sin(x);

// name → { f, tex, inv?, arity? }
const FUNCS = {
  sin: { f: Math.sin, tex: '\\sin', inv: 'asin' },
  cos: { f: Math.cos, tex: '\\cos', inv: 'acos' },
  tan: { f: Math.tan, tex: '\\tan', inv: 'atan' },
  sec: { f: sec, tex: '\\sec', inv: 'asec' },
  csc: { f: csc, tex: '\\csc', inv: 'acsc' },
  cot: { f: cot, tex: '\\cot', inv: 'acot' },
  asin: { f: Math.asin, tex: '\\arcsin' },
  acos: { f: Math.acos, tex: '\\arccos' },
  atan: { f: Math.atan, tex: '\\arctan' },
  asec: { f: (x) => Math.acos(1 / x), tex: '\\operatorname{arcsec}' },
  acsc: { f: (x) => Math.asin(1 / x), tex: '\\operatorname{arccsc}' },
  acot: { f: (x) => Math.PI / 2 - Math.atan(x), tex: '\\operatorname{arccot}' },
  sinh: { f: Math.sinh, tex: '\\sinh', inv: 'asinh' },
  cosh: { f: Math.cosh, tex: '\\cosh', inv: 'acosh' },
  tanh: { f: Math.tanh, tex: '\\tanh', inv: 'atanh' },
  sech: { f: (x) => 1 / Math.cosh(x), tex: '\\operatorname{sech}' },
  csch: { f: (x) => 1 / Math.sinh(x), tex: '\\operatorname{csch}' },
  coth: { f: (x) => 1 / Math.tanh(x), tex: '\\coth' },
  asinh: { f: Math.asinh, tex: '\\operatorname{arsinh}' },
  acosh: { f: Math.acosh, tex: '\\operatorname{arcosh}' },
  atanh: { f: Math.atanh, tex: '\\operatorname{artanh}' },
  exp: { f: Math.exp, tex: '\\exp' },
  ln: { f: Math.log, tex: '\\ln' },
  log: { f: Math.log10, tex: '\\log' },
  log10: { f: Math.log10, tex: '\\log_{10}' },
  log2: { f: Math.log2, tex: '\\log_{2}' },
  sqrt: { f: Math.sqrt, tex: 'sqrt' },
  cbrt: { f: Math.cbrt, tex: 'cbrt' },
  abs: { f: Math.abs, tex: 'abs' },
  sgn: { f: Math.sign, tex: '\\operatorname{sgn}' },
  // Heaviside: step(a − b) is 1 when a > b and 0 when a < b; ½ at the jump itself, so
  // f·step(x) + g·step(−x) is never doubled there
  step: { f: (x) => (x > 0 ? 1 : x < 0 ? 0 : 0.5), tex: '\\Theta' },
  floor: { f: Math.floor, tex: 'floor' },
  round: { f: Math.round, tex: 'round' },
  ceil: { f: Math.ceil, tex: 'ceil' },
  gamma: { f: gammaFn, tex: '\\Gamma' },
  erf: { f: erf, tex: '\\operatorname{erf}' },
  atan2: { f: Math.atan2, tex: '\\operatorname{atan2}', arity: 2 },
  min: { f: Math.min, tex: '\\min', arity: -1 },
  max: { f: Math.max, tex: '\\max', arity: -1 },
};
const ALIASES = {
  arcsin: 'asin', arccos: 'acos', arctan: 'atan', arcsec: 'asec', arccsc: 'acsc', arccot: 'acot',
  arsinh: 'asinh', arcsinh: 'asinh', arcosh: 'acosh', arccosh: 'acosh', artanh: 'atanh', arctanh: 'atanh',
  sign: 'sgn', Gamma: 'gamma', heaviside: 'step',
};
const CONSTS = {
  pi: { v: Math.PI, tex: '\\pi' },
  e: { v: Math.E, tex: 'e' },
  inf: { v: Infinity, tex: '\\infty' },
  infinity: { v: Infinity, tex: '\\infty' },
  infty: { v: Infinity, tex: '\\infty' },
};

export const FUNCTION_NAMES = Object.keys(FUNCS);

// ─── helpers for special functions ─────────────────────────────────────────

// Lanczos approximation (g = 7, n = 9); good to ~1e-15 relative for real x.
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7];
export function gammaFn(x) {
  if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gammaFn(1 - x));
  if (Number.isInteger(x) && x <= 171) { let p = 1; for (let k = 2; k < x; k++) p *= k; return p; }
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return Math.sqrt(2 * Math.PI) * t ** (x + 0.5) * Math.exp(-t) * a;
}

// Abramowitz & Stegun 7.1.26 is only 1e-7; use a series/continued fraction good to ~1e-14.
export function erf(x) {
  const s = Math.sign(x); x = Math.abs(x);
  if (x < 3) {
    let term = x, sum = x;
    for (let n = 1; n < 200; n++) {
      term *= -x * x / n;
      const add = term / (2 * n + 1);
      sum += add;
      if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
    }
    return s * 2 / Math.sqrt(Math.PI) * sum;
  }
  // erfc continued fraction (Lentz)
  let f = x, C = x, D = 0;
  for (let n = 1; n < 300; n++) {
    const an = n / 2;
    D = x + an * D; D = D === 0 ? 1e-300 : 1 / D;
    C = x + an / C; if (C === 0) C = 1e-300;
    const delta = C * D; f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  return s * (1 - Math.exp(-x * x) / Math.sqrt(Math.PI) / f);
}

// ─── normalisation and tokens ──────────────────────────────────────────────

const SUPERSCRIPT = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };

export function normalise(src) {
  let s = String(src);
  s = s.replace(/[−‒–—]/g, '-')   // minus signs and dashes
    .replace(/[×✕⨯]/g, '*').replace(/[·⋅∙•]/g, '*').replace(/÷/g, '/').replace(/∕/g, '/')
    .replace(/√/g, 'sqrt').replace(/∛/g, 'cbrt').replace(/∞/g, 'inf')
    .replace(/\*\*/g, '^').replace(/[‘’′]/g, "'")
    .replace(/\\left|\\right/g, '').replace(/\\cdot|\\times/g, '*')
    .replace(/[   ]/g, ' ');
  // runs of superscript characters become ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => '^(' + [...m].map((c) => SUPERSCRIPT[c]).join('') + ')');
  // unicode Greek letters become their names
  s = s.replace(/[α-ωΑ-Ωϵϑϕµ]/g, (c) => UNICODE_GREEK[c] ?? c);
  // "3x10^8" or "3 x 10^8" written for scientific notation
  s = s.replace(/(\d)\s*[xX]\s*10\s*\^/g, '$1*10^');
  return s;
}

function tokenize(s) {
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
    if (num) {
      toks.push({ k: 'num', v: parseFloat(num[0]), text: num[0], pos: i });
      i += num[0].length; continue;
    }
    const id = /^[A-Za-z][A-Za-z0-9]*(?:_\{?[A-Za-z0-9]+\}?)?/.exec(s.slice(i));
    if (id) { toks.push({ k: 'id', text: id[0], pos: i }); i += id[0].length; continue; }
    if ('+-*/^(),!|'.includes(c)) { toks.push({ k: c, pos: i }); i++; continue; }
    if (c === '[' || c === '{') { toks.push({ k: '(', pos: i }); i++; continue; }
    if (c === ']' || c === '}') { toks.push({ k: ')', pos: i }); i++; continue; }
    if (c === '\\') {   // a stray TeX command: accept \sin, \pi, \theta, \frac is not supported
      const cmd = /^\\([A-Za-z]+)/.exec(s.slice(i));
      if (cmd) { toks.push({ k: 'id', text: cmd[1], pos: i }); i += cmd[0].length; continue; }
    }
    throw new ParseError(`Unexpected character “${c}”`, i);
  }
  return toks;
}

// Canonical spelling of a symbol name: v_0, v_{0} and v0 are the same variable.
export const canon = (name) => String(name)
  .replace(/[α-ωΑ-Ωϵϑϕµ]/g, (c) => UNICODE_GREEK[c] ?? c).replace(/[_{}\s\\]/g, '');

// ─── parser ────────────────────────────────────────────────────────────────

/**
 * Parse an expression.
 * @param {string} src
 * @param {object} [opts]
 * @param {string[]} [opts.vars] names the expression may use (canonicalised)
 * @param {boolean} [opts.allowUnknown] treat unknown letters as variables instead of failing
 * @returns AST node
 */
export function parse(src, opts = {}) {
  const vars = new Set((opts.vars || []).map(canon));
  // a declared name with a subscript ("r_s", "k_B", "omega_0") keeps it for display
  const labels = {};
  for (const v of opts.vars || []) if (/_/.test(v)) labels[canon(v)] = v;
  const text = normalise(src);
  if (!text.trim()) throw new ParseError('Empty expression');
  const raw = tokenize(text);
  const toks = [];
  for (const t of raw) {
    if (t.k !== 'id') { toks.push(t); continue; }
    for (const piece of resolveIdent(t, vars, opts.allowUnknown)) toks.push(piece);
  }
  let p = 0;
  let absDepth = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const expect = (k) => {
    const t = next();
    if (!t || t.k !== k) throw new ParseError(k === ')' ? 'Missing a closing bracket' : `Expected “${k}”`, t ? t.pos : text.length);
    return t;
  };

  function startsPrimary(t) {
    if (!t) return false;
    if (t.k === 'num' || t.k === 'var' || t.k === 'const' || t.k === 'fn' || t.k === '(') return true;
    if (t.k === '|') return absDepth === 0;
    return false;
  }

  function parseAdditive() {
    let node = parseTerm();
    for (;;) {
      const t = peek();
      if (t && (t.k === '+' || t.k === '-')) { next(); node = { t: t.k, a: node, b: parseTerm() }; }
      else return node;
    }
  }
  function parseTerm() {
    let node = parseUnary();
    for (;;) {
      const t = peek();
      if (t && (t.k === '*' || t.k === '/')) { next(); node = { t: t.k, a: node, b: parseUnary() }; }
      else if (startsPrimary(t)) node = { t: '*', a: node, b: parsePower(), implicit: true };
      else return node;
    }
  }
  function parseUnary() {
    const t = peek();
    if (t && t.k === '-') { next(); return { t: 'neg', a: parseUnary() }; }
    if (t && t.k === '+') { next(); return parseUnary(); }
    return parsePower();
  }
  function parsePower() {
    const base = parsePostfix();
    const t = peek();
    if (t && t.k === '^') { next(); return { t: '^', a: base, b: parseUnary() }; }
    return base;
  }
  function parsePostfix() {
    let node = parsePrimary();
    while (peek() && peek().k === '!') { next(); node = { t: 'fn', name: 'fact', args: [node] }; }
    return node;
  }
  function parsePrimary() {
    const t = next();
    if (!t) throw new ParseError('The expression ends too early', text.length);
    switch (t.k) {
      case 'num': return { t: 'num', v: t.v, text: t.text };
      case 'var': return labels[t.name] ? { t: 'var', name: t.name, label: labels[t.name] } : { t: 'var', name: t.name };
      case 'const': return { t: 'const', name: t.name };
      case '(': { const e = parseAdditive(); expect(')'); return { t: 'group', a: e }; }
      case '|': {
        absDepth++;
        const e = parseAdditive();
        absDepth--;
        expect('|');
        return { t: 'fn', name: 'abs', args: [e] };
      }
      case 'fn': return parseCall(t);
      default:
        throw new ParseError(t.k === ')' ? 'Unbalanced closing bracket' : `Unexpected “${t.k}”`, t.pos);
    }
  }
  function parseCall(t) {
    let name = t.name;
    let power = null;
    if (peek() && peek().k === '^') {          // sin^2 x, sin^-1 x
      next();
      let neg = false;
      if (peek() && peek().k === '-') { next(); neg = true; }
      const n = next();
      if (!n || n.k !== 'num') throw new ParseError(`Put the power after the brackets: (${name} x)^n`, n ? n.pos : text.length);
      const v = neg ? -n.v : n.v;
      if (v === -1 && FUNCS[name].inv) name = FUNCS[name].inv;
      else power = { t: 'num', v, text: (neg ? '-' : '') + n.text };
    }
    const spec = FUNCS[name];
    let args;
    if (peek() && peek().k === '(') {
      next();
      args = [parseAdditive()];
      while (peek() && peek().k === ',') { next(); args.push(parseAdditive()); }
      expect(')');
    } else {
      // implicit argument: a run of factors, stopping at the next function name
      if (!startsPrimary(peek()) || peek().k === 'fn') throw new ParseError(`${name} needs an argument`, t.pos);
      let arg = parsePower();
      while (startsPrimary(peek()) && peek().k !== 'fn') arg = { t: '*', a: arg, b: parsePower(), implicit: true };
      args = [arg];
    }
    const arity = spec.arity ?? 1;
    if (arity > 0 && args.length !== arity) throw new ParseError(`${name} takes ${arity} argument${arity > 1 ? 's' : ''}`, t.pos);
    let node = { t: 'fn', name, args };
    if (power) node = { t: '^', a: node, b: power, fnPower: true };
    return node;
  }

  const ast = parseAdditive();
  if (p < toks.length) {
    const t = toks[p];
    throw new ParseError(t.k === ')' ? 'Unbalanced closing bracket' : `Unexpected “${t.k === 'num' ? t.text : t.k}”`, t.pos);
  }
  return ast;
}

// Turn one identifier token into variables, constants and functions. Unknown
// runs of letters are split greedily into known names (mgh → m·g·h,
// sinx → sin x); anything left over is an unknown symbol.
function resolveIdent(t, vars, allowUnknown) {
  const s = t.text;
  const c = canon(s);
  const one = resolveName(c, vars);
  if (one) return [{ ...one, pos: t.pos }];
  // try to split; names may carry digits only if declared (v0, x1)
  const known = [...vars, ...Object.keys(FUNCS), ...Object.keys(ALIASES), ...Object.keys(CONSTS), ...GREEK];
  const out = [];
  let i = 0;
  while (i < c.length) {
    let best = '';
    for (const n of known) if (n.length > best.length && c.startsWith(n, i)) best = n;
    if (!best) {
      const rest = c.slice(i);
      const digits = /^\d+/.exec(rest);
      if (digits) {
        // a number at the end of a run of letters (x2) is ambiguous; inside
        // one (sin2x) it is a coefficient
        if (digits[0].length === rest.length) {
          throw new ParseError(`“${s}” is ambiguous — write ${s.replace(/(\d+)$/, '^$1')} or ${s.replace(/(\d+)$/, '*$1')}`, t.pos);
        }
        out.push({ k: 'num', v: parseInt(digits[0], 10), text: digits[0], pos: t.pos + i });
        i += digits[0].length;
        continue;
      }
      const ch = rest[0];
      if (allowUnknown) { out.push({ k: 'var', name: ch, pos: t.pos + i }); i += 1; continue; }
      throw new ParseError(`Unknown symbol “${ch}”${vars.size ? ` — this answer uses ${[...vars].join(', ')}` : ''}`, t.pos + i);
    }
    const r = resolveName(best, vars);
    if (!r) {
      if (allowUnknown) { out.push({ k: 'var', name: best, pos: t.pos + i }); i += best.length; continue; }
      throw new ParseError(`Unknown symbol “${best}”${vars.size ? ` — this answer uses ${[...vars].join(', ')}` : ''}`, t.pos + i);
    }
    out.push({ ...r, pos: t.pos + i });
    i += best.length;
  }
  return out;
}

function resolveName(c, vars) {
  if (vars.has(c)) return { k: 'var', name: c };
  if (FUNCS[c]) return { k: 'fn', name: c };
  if (ALIASES[c]) return { k: 'fn', name: ALIASES[c] };
  if (CONSTS[c]) return { k: 'const', name: c };
  return null;
}

// ─── evaluation ────────────────────────────────────────────────────────────

/** Compile an AST to a function env → number (NaN where undefined). */
export function compile(node) {
  switch (node.t) {
    case 'num': { const v = node.v; return () => v; }
    case 'var': { const n = node.name; return (env) => { const v = env[n]; return v === undefined ? NaN : v; }; }
    case 'const': { const v = CONSTS[node.name].v; return () => v; }
    case 'group': return compile(node.a);
    case 'neg': { const a = compile(node.a); return (env) => -a(env); }
    case '+': { const a = compile(node.a), b = compile(node.b); return (env) => a(env) + b(env); }
    case '-': { const a = compile(node.a), b = compile(node.b); return (env) => a(env) - b(env); }
    case '*': { const a = compile(node.a), b = compile(node.b); return (env) => a(env) * b(env); }
    case '/': { const a = compile(node.a), b = compile(node.b); return (env) => a(env) / b(env); }
    case '^': { const a = compile(node.a), b = compile(node.b); return (env) => realPow(a(env), b(env)); }
    case 'fn': {
      if (node.name === 'fact') { const a = compile(node.args[0]); return (env) => gammaFn(a(env) + 1); }
      const f = FUNCS[node.name].f;
      const args = node.args.map(compile);
      if (args.length === 1) { const a = args[0]; return (env) => f(a(env)); }
      return (env) => f(...args.map((g) => g(env)));
    }
    default: throw new Error('bad node ' + node.t);
  }
}

// x^(p/q) for negative x with odd q is real (the cube root of −8 is −2).
function realPow(x, y) {
  const r = Math.pow(x, y);
  if (!Number.isNaN(r) || x >= 0) return r;
  // try to recognise y as a fraction with an odd denominator
  for (const q of [3, 5, 7, 9]) {
    const p = Math.round(y * q);
    if (Math.abs(p / q - y) < 1e-12) {
      const mag = Math.pow(-x, Math.abs(y));
      const sign = p % 2 === 0 ? 1 : -1;
      return y < 0 ? sign / mag : sign * mag;
    }
  }
  return NaN;
}

export function evaluate(src, env = {}, opts = {}) {
  const ast = typeof src === 'string' ? parse(src, { vars: Object.keys(env), ...opts }) : src;
  return compile(ast)(canonEnv(env));
}

export const canonEnv = (env) => Object.fromEntries(Object.entries(env).map(([k, v]) => [canon(k), v]));

export function freeVars(node, out = new Set()) {
  if (node.t === 'var') out.add(node.name);
  for (const k of ['a', 'b']) if (node[k]) freeVars(node[k], out);
  if (node.args) for (const a of node.args) freeVars(a, out);
  return out;
}

export function countNodes(node, pred) {
  let n = pred(node) ? 1 : 0;
  for (const k of ['a', 'b']) if (node[k]) n += countNodes(node[k], pred);
  if (node.args) for (const a of node.args) n += countNodes(a, pred);
  return n;
}

// ─── printing ──────────────────────────────────────────────────────────────

const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3, '^': 4, fn: 5, num: 6, var: 6, const: 6, group: 6 };

export function symbolTeX(name, label) {
  if (label) {
    // "r_s" → r_{s}, "omega_0" → \omega_{0}, "k_{B}" → k_{B}
    const [base, ...sub] = label.replace(/[{}\\]/g, '').split('_');
    const b = canon(base);
    return `${GREEK_SET.has(b) ? '\\' + b : b.length > 1 ? `\\mathrm{${b}}` : b}_{${sub.join('')}}`;
  }
  const m = /^([A-Za-z]+?)(\d+)$/.exec(name);
  if (m && !FUNCS[name]) return `${symbolTeX(m[1])}_{${m[2]}}`;
  if (GREEK_SET.has(name)) return '\\' + name;
  if (name.length > 1) return `\\mathrm{${name}}`;
  return name;
}

/** TeX for an AST, with the minimum brackets needed to show the structure. */
export function toTeX(node) {
  switch (node.t) {
    case 'num': return numTeX(node);
    case 'var': return symbolTeX(node.name, node.label);
    case 'const': return CONSTS[node.name].tex;
    case 'group': return toTeX(node.a);
    case 'neg': return '-' + wrap(node.a, PREC.neg, true);
    case '+': return `${toTeX(node.a)} + ${wrap(node.b, 1, false)}`;
    case '-': return `${toTeX(node.a)} - ${wrap(node.b, 1, true)}`;
    case '*': return mulTeX(node);
    case '/': return `\\frac{${toTeX(node.a)}}{${toTeX(node.b)}}`;
    case '^': {
      if (node.fnPower) {
        const fn = node.a;
        const spec = FUNCS[fn.name];
        if (spec.tex.startsWith('\\') && !['sqrt', 'cbrt'].includes(spec.tex)) {
          return `${spec.tex}^{${toTeX(node.b)}}\\!${fnArgTeX(fn)}`;
        }
      }
      const base = node.a.t === 'fn' && !['sqrt', 'cbrt', 'abs', 'floor', 'ceil'].includes(FUNCS[node.a.name]?.tex)
        ? `\\left(${toTeX(node.a)}\\right)` : wrap(node.a, PREC['^'], true);
      return `${base}^{${toTeX(node.b)}}`;
    }
    case 'fn': return fnTeX(node);
    default: return '?';
  }
}

function numTeX(node) {
  const s = node.text ?? String(node.v);
  const m = /^(\d*\.?\d*)[eE]([+-]?\d+)$/.exec(s);
  if (m) return `${m[1]}\\times 10^{${parseInt(m[2], 10)}}`;
  return s;
}

function wrap(node, prec, strict) {
  const p = PREC[node.t] ?? 6;
  const tex = toTeX(node);
  return p < prec || (strict && p === prec && node.t !== 'fn') ? `\\left(${tex}\\right)` : tex;
}

function mulTeX(node) {
  const a = node.a, b = node.b;
  const left = wrap(a, 2, false);
  const right = wrap(b, 2, true);
  // a number followed by a number needs a visible dot; otherwise juxtapose
  const startsWithDigit = /^[-\d.]/.test(right);
  const needDot = startsWithDigit || (b.t === 'neg');
  return needDot ? `${left} \\cdot ${right}` : `${left}\\,${right}`;
}

function fnArgTeX(fn) {
  return `\\left(${fn.args.map(toTeX).join(', ')}\\right)`;
}

function fnTeX(node) {
  if (node.name === 'fact') return `${wrap(node.args[0], 6, true)}!`;
  const spec = FUNCS[node.name];
  const a = node.args.map(toTeX);
  switch (spec.tex) {
    case 'sqrt': return `\\sqrt{${a[0]}}`;
    case 'cbrt': return `\\sqrt[3]{${a[0]}}`;
    case 'abs': return `\\left|${a[0]}\\right|`;
    case 'floor': return `\\left\\lfloor ${a[0]}\\right\\rfloor`;
    case 'ceil': return `\\left\\lceil ${a[0]}\\right\\rceil`;
    default: return `${spec.tex}${fnArgTeX(node)}`;
  }
}

/** A plain-text rendering that parses back to the same AST. */
export function toText(node) {
  switch (node.t) {
    case 'num': return node.text ?? String(node.v);
    case 'var': return node.name;
    case 'const': return node.name;
    case 'group': return `(${toText(node.a)})`;
    case 'neg': return `-${node.a.t === 'num' || node.a.t === 'var' || node.a.t === 'group' ? toText(node.a) : '(' + toText(node.a) + ')'}`;
    case 'fn': return node.name === 'fact' ? `(${toText(node.args[0])})!` : `${node.name}(${node.args.map(toText).join(', ')})`;
    default: return `(${toText(node.a)}${node.t}${toText(node.b)})`;
  }
}
