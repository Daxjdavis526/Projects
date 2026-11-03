// A differentiator that shows its work. It mirrors src/core/expr/diff.ts case
// for case — it builds exactly the same unsimplified tree — and records, at
// every node, which rule of calculus it used, what u and v were, and what the
// pieces came to. The result is then checked two ways: simplified, it must be
// identical to MathVerse's own `derivative`, and numerically it must agree with
// a central-difference derivative of the original at sample points.

import { Node, num, neg, add, sub, mul, div, pow, call, freeSymbols, equal, sym } from '../core/expr/ast';
import { FUNCTIONS } from '../core/expr/functions';
import { simplify } from '../core/expr/simplify';
import { derivative, NotDifferentiable } from '../core/expr/diff';
import { toTeX, toText, symbolTeX } from '../core/expr/print';
import { compile } from '../core/expr/compile';

export type DiffRule =
  | 'constant' | 'variable' | 'sum' | 'difference' | 'negation' | 'constantMultiple' | 'product' | 'quotient'
  | 'power' | 'exponential' | 'logDiff' | 'function' | 'chain' | 'atan2' | 'hypot' | 'componentwise';

export const RULE_NAMES: Record<DiffRule, string> = {
  constant: 'Constant rule', variable: 'Identity', sum: 'Sum rule', difference: 'Difference rule', negation: 'Constant multiple (−1)',
  constantMultiple: 'Constant multiple rule', product: 'Product rule', quotient: 'Quotient rule', power: 'Power rule',
  exponential: 'Exponential rule', logDiff: 'Logarithmic differentiation', function: 'Standard derivative', chain: 'Chain rule',
  atan2: 'Derivative of atan2', hypot: 'Derivative of hypot', componentwise: 'Componentwise',
};

/** One recorded application of a rule (a node of the derivation tree). */
export interface DiffNode {
  rule: DiffRule;
  /** the rule's name as shown, e.g. "Chain rule (outer: sin)" */
  name: string;
  expr: Node;
  /** the raw derivative tree, exactly as diff.ts builds it */
  raw: Node;
  /** its simplified form */
  result: Node;
  /** the generic statement of the rule, TeX */
  formula: string;
  /** the parts the rule names: [['u', node], ['v', node]] */
  parts: [string, Node][];
  /** the derivative assembled from the pieces before simplification, TeX */
  assembled: string;
  children: DiffNode[];
  /** constants and the variable itself: shown only on request */
  trivial: boolean;
}

/** A flat, displayable step. */
export interface DiffStep {
  phase: 'plan' | 'combine' | 'leaf' | 'simplify';
  rule: DiffRule | 'simplify';
  name: string;
  depth: number;
  /** headline sentence */
  title: string;
  /** the maths of the step */
  tex: string;
  /** an explanation in prose with $TeX$ */
  detail: string;
  /** what is shown before the step itself in Explore mode */
  hint: string;
  /** the subexpression and its derivative, for the picture */
  expr: Node;
  result: Node;
  trivial: boolean;
}

export interface DiffWork {
  variable: string;
  partial: boolean;
  tree: DiffNode;
  raw: Node;
  result: Node;
  steps: DiffStep[];
  check: DiffCheck;
}

export interface DiffCheck {
  /** simplify(raw) is structurally identical to derivative(f, x) */
  matchesEngine: boolean;
  /** points where a central difference of f was compared with the result */
  numericPoints: number;
  numericAgrees: boolean;
  maxRelErr: number;
  ok: boolean;
  text: string;
}

const hasX = (n: Node, x: string) => freeSymbols(n).has(x);

function dOp(x: string, partial: boolean): string {
  const v = symbolTeX(x);
  return partial ? `\\frac{\\partial}{\\partial ${v}}` : `\\frac{d}{d${v}}`;
}

/** TeX for "the derivative of e": d/dx[e] */
function dOf(e: Node, x: string, partial: boolean): string {
  const t = toTeX(e);
  return `${dOp(x, partial)}\\left[${t}\\right]`;
}

const par = (n: Node) => `\\left(${toTeX(n)}\\right)`;
const atomic = (n: Node) => n.t === 'num' || n.t === 'sym' || n.t === 'call' || (n.t === 'pow' && (n.a.t === 'sym' || n.a.t === 'num'));
const tp = (n: Node) => (atomic(n) && !(n.t === 'num' && n.v < 0) ? toTeX(n) : par(n));

/** Record the derivation of n with respect to x. Throws NotDifferentiable like diff.ts. */
export function recordDiff(n: Node, x: string, partial = false): DiffNode {
  const D = (e: Node) => recordDiff(e, x, partial);
  const mk = (rule: DiffRule, raw: Node, o: Partial<DiffNode> = {}): DiffNode => ({
    rule, name: o.name ?? RULE_NAMES[rule], expr: n, raw, result: simplify(raw), formula: o.formula ?? '', parts: o.parts ?? [],
    assembled: o.assembled ?? toTeX(raw), children: o.children ?? [], trivial: o.trivial ?? false,
  });
  const xv = symbolTeX(x);
  switch (n.t) {
    case 'num': return mk('constant', num(0), { formula: `${dOp(x, partial)}\\,c = 0`, trivial: true });
    case 'sym':
      if (n.name === x) return mk('variable', num(1), { formula: `${dOp(x, partial)}\\,${xv} = 1`, trivial: true });
      return mk('constant', num(0), { formula: `${dOp(x, partial)}\\,c = 0`, trivial: true, name: partial && /^[a-z]$/.test(n.name) && ['x', 'y', 'z', 't'].includes(n.name) ? `Constant rule (${n.name} is held fixed)` : RULE_NAMES.constant });
    case 'neg': {
      const a = D(n.a);
      return mk('negation', neg(a.raw), { formula: `(-u)' = -u'`, parts: [['u', n.a]], children: [a], assembled: `-${tp(a.result)}` });
    }
    case 'add': case 'sub': {
      const a = D(n.a), b = D(n.b);
      const raw = n.t === 'add' ? add(a.raw, b.raw) : sub(a.raw, b.raw);
      const s = n.t === 'add' ? '+' : '-';
      return mk(n.t === 'add' ? 'sum' : 'difference', raw, { formula: `(u ${s} v)' = u' ${s} v'`, parts: [['u', n.a], ['v', n.b]], children: [a, b], assembled: `${toTeX(a.result)} ${s} ${tp(b.result)}` });
    }
    case 'mul': {
      const a = D(n.a), b = D(n.b);
      const raw = add(mul(a.raw, n.b), mul(n.a, b.raw));
      const ca = !hasX(n.a, x), cb = !hasX(n.b, x);
      if (ca || cb) {
        const [c, u, du] = ca ? [n.a, n.b, b] : [n.b, n.a, a];
        return mk('constantMultiple', raw, { formula: `(c\\,u)' = c\\,u'`, parts: [['c', c], ['u', u]], children: ca ? [a, b] : [a, b], assembled: `${tp(c)} \\cdot ${tp(du.result)}` });
      }
      return mk('product', raw, { formula: `(u\\,v)' = u'\\,v + u\\,v'`, parts: [['u', n.a], ['v', n.b]], children: [a, b], assembled: `${tp(a.result)} \\cdot ${tp(n.b)} + ${tp(n.a)} \\cdot ${tp(b.result)}` });
    }
    case 'div': {
      const a = D(n.a), b = D(n.b);
      const raw = div(sub(mul(a.raw, n.b), mul(n.a, b.raw)), pow(n.b, num(2)));
      if (!hasX(n.b, x)) return mk('constantMultiple', raw, { name: 'Constant multiple rule (division by a constant)', formula: `\\left(\\frac{u}{c}\\right)' = \\frac{u'}{c}`, parts: [['u', n.a], ['c', n.b]], children: [a, b], assembled: `\\frac{${toTeX(a.result)}}{${toTeX(n.b)}}` });
      return mk('quotient', raw, { formula: `\\left(\\frac{u}{v}\\right)' = \\frac{u'\\,v - u\\,v'}{v^2}`, parts: [['u', n.a], ['v', n.b]], children: [a, b], assembled: `\\frac{${tp(a.result)} \\cdot ${tp(n.b)} - ${tp(n.a)} \\cdot ${tp(b.result)}}{${tp(n.b)}^{2}}` });
    }
    case 'pow': {
      const baseHasX = hasX(n.a, x), expHasX = hasX(n.b, x);
      if (!baseHasX && !expHasX) return mk('constant', num(0), { formula: `${dOp(x, partial)}\\,c = 0`, trivial: true });
      if (!expHasX) {
        const k = n.b;
        const km1 = k.t === 'num' ? num(k.v - 1) : sub(k, num(1));
        const a = D(n.a);
        const raw = mul(mul(k, pow(n.a, km1)), a.raw);
        const chain = !(n.a.t === 'sym' && n.a.name === x);
        return mk('power', raw, {
          name: chain ? 'Power rule with the chain rule' : 'Power rule',
          formula: chain ? `(u^{k})' = k\\,u^{k-1}\\,u'` : `(${xv}^{k})' = k\\,${xv}^{k-1}`,
          parts: chain ? [['u', n.a], ['k', k]] : [['k', k]], children: [a],
          assembled: chain ? `${tp(k)} \\cdot ${tp(n.a)}^{${toTeX(simplify(km1))}} \\cdot ${tp(a.result)}` : toTeX(simplify(raw)),
        });
      }
      if (!baseHasX) {
        const b = D(n.b);
        const raw = mul(mul(n, call('ln', n.a)), b.raw);
        const chain = !(n.b.t === 'sym' && n.b.name === x);
        const isE = n.a.t === 'sym' && n.a.name === 'e';
        return mk('exponential', raw, {
          name: chain ? 'Exponential rule with the chain rule' : 'Exponential rule',
          formula: isE ? `(e^{v})' = e^{v}\\,v'` : `(a^{v})' = a^{v}\\ln a\\;v'`, parts: [['a', n.a], ['v', n.b]], children: [b],
          assembled: `${toTeX(n)} \\cdot ${toTeX(call('ln', n.a))} \\cdot ${tp(b.result)}`,
        });
      }
      const a = D(n.a), b = D(n.b);
      const raw = mul(n, add(mul(b.raw, call('ln', n.a)), div(mul(n.b, a.raw), n.a)));
      return mk('logDiff', raw, {
        formula: `(u^{v})' = u^{v}\\left(v'\\ln u + \\frac{v\\,u'}{u}\\right)`, parts: [['u', n.a], ['v', n.b]], children: [b, a],
        assembled: `${toTeX(n)}\\left(${tp(b.result)} \\ln ${tp(n.a)} + \\frac{${tp(n.b)} \\cdot ${tp(a.result)}}{${toTeX(n.a)}}\\right)`,
      });
    }
    case 'call': {
      if (n.args.every((a) => !hasX(a, x))) return mk('constant', num(0), { formula: `${dOp(x, partial)}\\,c = 0`, trivial: true });
      const spec = FUNCTIONS[n.fn];
      if (n.fn === 'atan2') {
        const [y, xx] = n.args;
        const dy = D(y), dx = D(xx);
        const raw = div(sub(mul(xx, dy.raw), mul(y, dx.raw)), add(pow(xx, num(2)), pow(y, num(2))));
        return mk('atan2', raw, { formula: `\\operatorname{atan2}(v, u)' = \\frac{u\\,v' - v\\,u'}{u^2 + v^2}`, parts: [['v', y], ['u', xx]], children: [dy, dx] });
      }
      if (n.fn === 'hypot') {
        const kids = n.args.map(D);
        const s = n.args.reduce<Node>((acc, a, i) => (i ? add(acc, mul(a, kids[i].raw)) : mul(a, kids[i].raw)), num(0));
        return mk('hypot', div(s, n), { formula: `\\left(\\sqrt{\\textstyle\\sum u_i^2}\\right)' = \\frac{\\sum u_i\\,u_i'}{\\sqrt{\\sum u_i^2}}`, children: kids });
      }
      if (!spec || !spec.d || n.args.length !== 1) throw new NotDifferentiable(`MathVerse has no derivative formula for ${n.fn}; a numerical derivative is used instead`);
      const outer = spec.d(n.args[0]);
      if (!outer) throw new NotDifferentiable(`MathVerse has no derivative formula for ${n.fn}; a numerical derivative is used instead`);
      const u = n.args[0];
      const a = D(u);
      const raw = mul(outer, a.raw);
      const U = sym('u');
      const generic = toTeX(spec.d(U) ?? num(0));
      const fTeX = toTeX(call(n.fn, U));
      const chain = !(u.t === 'sym' && u.name === x);
      if (!chain) return mk('function', raw, { name: `Derivative of ${n.fn}`, formula: `${dOp(x, partial)}\\,${toTeX(call(n.fn, sym(x)))} = ${toTeX(spec.d(sym(x)) ?? num(0))}`, children: [a], assembled: toTeX(simplify(raw)) });
      return mk('chain', raw, {
        name: `Chain rule (outer: ${n.fn})`,
        formula: `\\frac{d}{d${xv}}\\,f(u) = f'(u)\\,u', \\quad ${fTeX}' = ${generic}`,
        parts: [['u', u]], children: [a],
        assembled: `${tp(outer)} \\cdot ${tp(a.result)}`,
      });
    }
    case 'tuple': {
      const kids = n.items.map(D);
      return mk('componentwise', { t: 'tuple', items: kids.map((k) => k.raw) }, { formula: `(f_1, f_2, \\dots)' = (f_1', f_2', \\dots)`, children: kids });
    }
    case 'matrix': {
      const kids = n.rows.map((r) => r.map(D));
      return mk('componentwise', { t: 'matrix', rows: kids.map((r) => r.map((k) => k.raw)) }, { formula: `[a_{ij}]' = [a_{ij}']`, children: kids.flat() });
    }
  }
}

const partsTeX = (parts: [string, Node][]) => parts.map(([k, v]) => `${k} = ${toTeX(v)}`).join(',\\quad ');

function describeOp(n: Node, x: string): string {
  switch (n.t) {
    case 'add': return 'a sum'; case 'sub': return 'a difference'; case 'neg': return 'a negative';
    case 'mul': return hasX(n.a, x) && hasX(n.b, x) ? 'a product of two factors that both depend on ' + x : 'a constant times a function';
    case 'div': return hasX(n.b, x) ? 'a quotient whose denominator depends on ' + x : 'a function divided by a constant';
    case 'pow': return hasX(n.b, x) ? (hasX(n.a, x) ? 'a variable raised to a variable power' : 'a constant raised to a power that depends on ' + x) : 'a power with a constant exponent';
    case 'call': return `the function ${n.fn} applied to ${n.args[0] && n.args[0].t === 'sym' ? x : 'an inner expression'}`;
    case 'tuple': return 'a vector of components';
    default: return 'a basic term';
  }
}

/** Flatten a derivation into steps: plan (outer rule and its parts), the pieces, then combine. */
export function flattenDiff(t: DiffNode, x: string, partial = false, depth = 0, out: DiffStep[] = []): DiffStep[] {
  const lhs = dOf(t.expr, x, partial);
  const resultTeX = toTeX(t.result);
  const nontrivialKids = t.children.filter((c) => !c.trivial);
  const base = { rule: t.rule, name: t.name, depth, expr: t.expr, result: t.result, trivial: t.trivial };
  if (!t.children.length || !nontrivialKids.length) {
    // a leaf: one step does it (constants, x itself, x^n, sin x, c·x …)
    out.push({
      ...base, phase: 'leaf', title: t.trivial ? (t.rule === 'variable' ? `The variable itself` : 'A constant') : `Differentiate ${short(t.expr)}`,
      tex: `${lhs} = ${t.assembled === resultTeX || t.trivial ? resultTeX : `${t.assembled} = ${resultTeX}`}`,
      detail: t.formula ? `Rule: $${t.formula}$${t.parts.length ? `, with $${partsTeX(t.parts)}$` : ''}.` : '',
      hint: `Look at $${toTeX(t.expr)}$: it is ${describeOp(t.expr, x)}. Which rule applies?`,
    });
    return out;
  }
  out.push({
    ...base, phase: 'plan', title: cap(describeOp(t.expr, x)),
    tex: t.formula,
    detail: `$${toTeX(t.expr)}$ is ${describeOp(t.expr, x)}${t.parts.length ? `, so take $${partsTeX(t.parts)}$` : ''}. ${planNeeds(t, x, partial)}`,
    hint: `The outermost operation in $${toTeX(t.expr)}$ is ${describeOp(t.expr, x)}. Which rule handles it?`,
  });
  for (const c of t.children) flattenDiff(c, x, partial, depth + 1, out);
  out.push({
    ...base, phase: 'combine', title: `Combine the pieces of ${short(t.expr)}`,
    tex: `${lhs} = ${t.assembled}${t.assembled === resultTeX ? '' : ` = ${resultTeX}`}`,
    detail: 'Substitute the derivatives just found into the rule, then simplify.',
    hint: 'Put the pieces back into the rule and simplify.',
  });
  return out;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** a short plain-text form of an expression for a step title */
function short(n: Node): string { const s = toText(n).replace(/\*/g, '·'); return s.length > 28 ? s.slice(0, 26) + '…' : s; }

function planNeeds(t: DiffNode, x: string, partial: boolean): string {
  const needs = t.children.filter((c) => !c.trivial).map((c) => `$${dOp(x, partial)}\\left[${toTeX(c.expr)}\\right]$`);
  return needs.length ? `It needs ${needs.join(' and ')}.` : '';
}

/** Sample points that avoid integers (where many functions are special) and stay inside common domains. */
const SAMPLES = [0.37, 0.71, 1.13, 1.57 + 0.11, -0.43, -0.89, 2.21, 0.093, -1.37];

/** Compare a symbolic derivative with a central difference of f at sample points (other symbols fixed). */
export function numericCheck(f: Node, df: Node, x: string, fixed: Record<string, number> = {}): { points: number; agrees: boolean; maxRelErr: number } {
  let F: (v: ArrayLike<number>) => number, G: (v: ArrayLike<number>) => number;
  const others: Record<string, number> = { ...fixed };
  for (const s of freeSymbols(f)) if (s !== x && !(s in others)) others[s] = 0.7 + 0.13 * s.length;
  try { F = compile(f, [x], others); G = compile(df, [x], others); } catch { return { points: 0, agrees: false, maxRelErr: NaN }; }
  let points = 0, maxRel = 0;
  for (const t of SAMPLES) {
    const g = G([t]);
    const h = 1e-5 * Math.max(1, Math.abs(t));
    // Richardson-extrapolated central difference: error O(h^4)
    const d1 = (F([t + h]) - F([t - h])) / (2 * h), d2 = (F([t + 2 * h]) - F([t - 2 * h])) / (4 * h);
    const nd = (4 * d1 - d2) / 3;
    if (![g, nd, F([t])].every(Number.isFinite) || Math.abs(g) > 1e8) continue;
    points++;
    const rel = Math.abs(g - nd) / Math.max(1, Math.abs(g));
    maxRel = Math.max(maxRel, rel);
  }
  return { points, agrees: points >= 3 && maxRel < 1e-5, maxRelErr: maxRel };
}

/** Differentiate with every step recorded and the answer verified. */
export function differentiateWithSteps(f: Node, x: string, opts: { partial?: boolean; fixed?: Record<string, number>; showTrivial?: boolean } = {}): DiffWork {
  const partial = !!opts.partial;
  const tree = recordDiff(f, x, partial);
  const raw = tree.raw;
  const result = simplify(raw);
  const engine = derivative(f, x);
  const matchesEngine = equal(result, engine);
  const nc = f.t === 'tuple' || f.t === 'matrix' ? { points: 0, agrees: true, maxRelErr: 0 } : numericCheck(f, result, x, opts.fixed);
  const ok = matchesEngine && (nc.agrees || nc.points === 0);
  const text = !matchesEngine ? 'The recorded steps do not reproduce MathVerse’s differentiator — treat this result with suspicion.'
    : nc.points === 0 ? 'Identical to MathVerse’s rule-based differentiator (no numerical check possible here).'
      : nc.agrees ? `Identical to MathVerse’s differentiator, and agrees with a numerical derivative at ${nc.points} points (largest relative difference ${nc.maxRelErr.toExponential(1)}).`
        : `Identical to MathVerse’s differentiator, but a numerical derivative disagrees (relative difference ${nc.maxRelErr.toExponential(1)}) — the function may not be differentiable at the sample points.`;
  let steps = flattenDiff(tree, x, partial);
  if (!opts.showTrivial) steps = steps.filter((s) => !s.trivial || s.depth === 0);
  const rawTeX = toTeX(raw), resTeX = toTeX(result);
  if (rawTeX !== resTeX && steps.length > 1) {
    steps.push({ phase: 'simplify', rule: 'simplify', name: 'Simplify', depth: 0, title: 'Simplify', tex: `${dOf(f, x, partial)} = ${resTeX}`, detail: 'Collect constants and remove factors of 1 and terms equal to 0.', hint: 'Tidy up: multiply out constants, drop zeros and ones.', expr: f, result, trivial: false });
  }
  return { variable: x, partial, tree, raw, result, steps, check: { matchesEngine, numericPoints: nc.points, numericAgrees: nc.agrees, maxRelErr: nc.maxRelErr, ok, text } };
}

/** The rules used, in order of first use (for a summary line). */
export function rulesUsed(t: DiffNode): string[] {
  const seen: string[] = [];
  const walk = (n: DiffNode) => { if (!n.trivial && !seen.includes(n.name)) seen.push(n.name); n.children.forEach(walk); };
  walk(t);
  return seen;
}
