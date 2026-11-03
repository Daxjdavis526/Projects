// The Companion's worked solutions. Every step comes from an engine — the
// step-recording differentiator, linalg's row reduction, SymPy (integrate,
// solve, limit, series, apart, dsolve, eigen) — and every symbolic answer is
// checked numerically by MathVerse's TypeScript core before it is shown:
// substituted back, differentiated back, compared with quadrature or with a
// numerical ODE solution. A result that is numerical says so.
// DOM-free: the CAS is passed in, so this runs in Node under Vitest.

import { Node, parse, toTeX, freeSymbols, compile, derivative, simplify, substitute, toSympy, num, sym, neg, add, sub, mul, div, pow, call, NotDifferentiable, FUNCTIONS, CONSTANTS, evaluate, symbolTeX } from '../core/expr';
import { integrateSymbolic, IntegralResult, CasOut } from '../cas/client';
import { integrate as quad, integrate2 } from '../core/numeric/quad';
import { findRoots, criticalPoints, brent } from '../core/numeric/roots';
import { solveAdaptive } from '../core/numeric/ode';
import { det as detNum, eig, matmul, solve as linSolve, Mat } from '../core/numeric/linalg';
import { differentiateWithSteps, DiffWork, rulesUsed } from './stepdiff';
import { rrefSteps, matrixTeX, solutionFromRref, residualOf, detSteps, fmtNum } from './linsys';
import type { Analysis } from './model';

// ── what a worked solution looks like ──────────────────────────────────────

export type CheckStatus = 'verified' | 'numerical' | 'unverified' | 'failed';
export interface Check { status: CheckStatus; text: string }

/** A picture for a step: curves y = node(x) (with sliders fixed), points, tangent lines, a shaded area. */
export type Visual =
  | { k: 'curves'; x: string; items: { node: Node; label: string; tone?: number; dash?: boolean }[]; points?: { at: [number, number]; label?: string; tone?: number }[]; lines?: { at: [number, number]; m: number; label?: string }[]; shade?: { node: Node; lo: number; hi: number } }
  | { k: 'rows'; rows: number[][]; vars: string[]; solution?: number[] | null }
  | { k: 'matrix'; M: number[][]; vectors?: { v: number[]; label: string }[] };

/** Marks on the problem's default picture. */
export interface Marks {
  points?: { at: number[]; label?: string }[];
  lines?: { at: [number, number]; m: number; label?: string }[];
  arrows?: { from: number[]; vec: number[]; label?: string }[];
  plane?: { at: number[]; normal: number[] };
  curve?: Node;                               // a solution curve y(t) (ODE), drawn on the default picture
  numeric?: [number, number][];               // a numerical solution, for comparison
}

export interface WorkStep {
  title: string;
  rule?: string;
  tex?: string;
  detail?: string;
  depth?: number;
  /** what Explore mode shows before revealing the step */
  hint?: string;
  visual?: Visual;
  check?: Check;
}

export interface Work {
  task: string;
  engine: string;
  steps: WorkStep[];
  answer: { label: string; tex: string } | null;
  check: Check;
  marks?: Marks;
  /** follow-up remarks (periodic solutions, domain, …) */
  notes: string[];
}

export interface CasLike { call<T>(op: string, args: Record<string, unknown>, timeoutMs?: number): Promise<T> }

export interface RunCtx {
  an: Analysis;
  task: string;
  /** every slider value (typed parameters and the task's own) */
  params: Record<string, number>;
  /** a typed point for limits and series */
  at: string;
  cas: CasLike;
  /** integrateSymbolic from src/cas/client.ts (replaceable in tests) */
  integrate?: typeof integrateSymbolic;
}

// ── helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number, d = 6) => fmtNum(v, d);
const T = toTeX;
const namesOf = (...ns: Node[]) => { const s = new Set<string>(); ns.forEach((n) => freeSymbols(n, s)); return [...s]; };
const SAMPLES = [0.37, 0.71, 1.13, 1.68, -0.43, -0.89, 2.21, 0.093, -1.37, 2.9];
const ok = (text: string): Check => ({ status: 'verified', text });
const bad = (text: string): Check => ({ status: 'failed', text });
const unv = (text: string): Check => ({ status: 'unverified', text });
const numerical = (text: string): Check => ({ status: 'numerical', text });

/** The values of the typed parameters (sliders), for numerical checks and pictures. */
export function fixedOf(an: Analysis, params: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of an.params) out[p.key] = params[p.key] ?? p.value;
  return out;
}

/** Parse a plain result from SymPy — only if every name in it is one MathVerse knows; else null (it cannot be checked here). */
export function readCas(o: CasOut | null | undefined, names: string[]): Node | null {
  if (!o) return null;
  const s = o.text;
  if (/\b(I|zoo|nan|oo|Integral|Piecewise|RootOf|CRootOf|Sum|O)\b/.test(s)) return null;
  for (const m of s.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*(\()?/g)) {
    const [, id, paren] = m;
    if (paren && id in FUNCTIONS) continue;
    if (!paren && (names.includes(id) || id in CONSTANTS)) continue;
    return null;
  }
  try { return parse(s, { names }); } catch { return null; }
}

/** Do f and g agree at sample points (other symbols fixed)? */
export function agree(f: Node, g: Node, vars: string[], fixed: Record<string, number>, pts = SAMPLES): { points: number; ok: boolean; maxErr: number } {
  let F, G;
  try { F = compile(f, vars, fixed); G = compile(g, vars, fixed); } catch { return { points: 0, ok: false, maxErr: NaN }; }
  let points = 0, maxErr = 0;
  for (let i = 0; i < pts.length; i++) {
    const v = vars.map((_, k) => pts[(i + 3 * k) % pts.length] * (k ? 0.83 : 1));
    const a = F(v), b = G(v);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    points++;
    maxErr = Math.max(maxErr, Math.abs(a - b) / Math.max(1, Math.abs(a)));
  }
  return { points, ok: points >= 3 && maxErr < 1e-8, maxErr };
}

const tryCompile1 = (n: Node, x: string, fixed: Record<string, number>): ((t: number) => number) | null => {
  try { const f = compile(n, [x], fixed); return (t: number) => f([t]); } catch { return null; }
};

const dTeX = (x: string) => `\\frac{d}{d${symbolTeX(x)}}`;

function diffSteps(w: DiffWork, depth = 0, x?: string): WorkStep[] {
  const xx = x ?? w.variable;
  return w.steps.map((s) => ({
    title: s.title, rule: s.name, tex: s.tex, detail: s.detail, depth: depth + s.depth, hint: s.hint,
    visual: s.expr.t === 'tuple' ? undefined : { k: 'curves', x: xx, items: [{ node: s.expr, label: T(s.expr), tone: 0 }, { node: s.result, label: `\\left(${T(s.expr)}\\right)'`, tone: 1, dash: true }] },
  }));
}

const checkOfDiff = (w: DiffWork): Check => (w.check.ok ? ok(w.check.text) : w.check.matchesEngine ? unv(w.check.text) : bad(w.check.text));

function worst(...cs: Check[]): Check {
  const order: CheckStatus[] = ['failed', 'unverified', 'numerical', 'verified'];
  for (const st of order) { const c = cs.find((k) => k.status === st); if (c) return c; }
  return cs[0];
}

function atPoint(at: string): { node: Node; value: number; infinite: boolean } {
  const s = at.trim().replace(/∞/g, 'inf').replace(/^\+/, '') || '0';
  const node = parse(s);
  const value = evaluate(node);
  return { node, value, infinite: !Number.isFinite(value) };
}

// ── the tasks ───────────────────────────────────────────────────────────────

export async function runTask(ctx: RunCtx): Promise<Work> {
  const t = ctx.task;
  const k = ctx.an.kind;
  switch (t) {
    case 'diff': return taskDiff(ctx);
    case 'extrema': return taskExtrema(ctx);
    case 'solve': return taskSolve(ctx);
    case 'limit': return taskLimit(ctx);
    case 'integral': return taskIntegral(ctx);
    case 'definite': return taskDefinite(ctx);
    case 'series': return taskSeries(ctx);
    case 'apart': return taskApart(ctx);
    case 'partials': return taskPartials(ctx);
    case 'critical': return taskCritical(ctx);
    case 'double': return taskDouble(ctx);
    case 'curvatureK': return taskSurfaceCurvature(ctx);
    case 'velocity': return taskVelocity(ctx);
    case 'curvature': return taskCurvature(ctx);
    case 'arclength': return taskArcLength(ctx);
    case 'divcurl': return taskDivCurl(ctx);
    case 'tangents': return taskTangents(ctx);
    case 'gradient': return taskGradient(ctx);
    case 'rref': return taskRref(ctx);
    case 'det': return taskDet(ctx);
    case 'inverse': return taskInverse(ctx);
    case 'eigen': return taskEigen(ctx);
    case 'system': return taskSystem(ctx);
    case 'dsolve': return taskDsolve(ctx);
    case 'phase': return taskPhase(ctx);
    case 'separate': return taskSeparate(ctx);
    case 'implicit': return taskImplicit(ctx);
    case 'evaluate': return taskEvaluate(ctx);
  }
  throw new Error(`No worked method for “${t}” on ${k}`);
}

// ── Calculus I / II: one variable ───────────────────────────────────────────

function taskDiff(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const f = an.exprs[0], x = an.vars[0];
  const fixed = fixedOf(an, params);
  const w = differentiateWithSteps(f, x, { fixed });
  const steps = diffSteps(w);
  const x0 = params.x0 ?? 1;
  const F = tryCompile1(f, x, fixed), D = tryCompile1(w.result, x, fixed);
  const marks: Marks = {};
  if (F && D) {
    const y0 = F(x0), m = D(x0);
    if (Number.isFinite(y0) && Number.isFinite(m)) {
      steps.push({
        title: `Tangent line at ${x} = ${fmt(x0, 4)}`, rule: 'Point–slope form',
        tex: `y = f(${fmt(x0, 4)}) + f'(${fmt(x0, 4)})\\,(${symbolTeX(x)} - ${fmt(x0, 4)}) = ${fmt(y0)} ${m < 0 ? '-' : '+'} ${fmt(Math.abs(m))}\\,(${symbolTeX(x)} ${x0 < 0 ? '+' : '-'} ${fmt(Math.abs(x0), 4)})`,
        detail: `The derivative is the slope of the tangent: at $${symbolTeX(x)} = ${fmt(x0, 4)}$ the curve rises ${fmt(m, 4)} for every unit to the right. Drag the point $${symbolTeX(x)}_0$ to move it.`,
        hint: 'Evaluate f and f′ at the point; the tangent is y = f(x₀) + f′(x₀)(x − x₀).',
        visual: { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }, { node: w.result, label: "f'", tone: 1, dash: true }], points: [{ at: [x0, y0], tone: 2 }], lines: [{ at: [x0, y0], m }] },
      });
      marks.points = [{ at: [x0, y0] }]; marks.lines = [{ at: [x0, y0], m }];
    }
  }
  return {
    task: 'diff', engine: 'MathVerse step differentiator (mirrors the core differentiator)', steps,
    answer: { label: 'Derivative', tex: `${dTeX(x)}\\left[${T(f)}\\right] = ${T(w.result)}` },
    check: checkOfDiff(w), marks, notes: [`Rules used: ${rulesUsed(w.tree).join(', ')}.`],
  };
}

async function casSolve(ctx: RunCtx, F: Node, x: string): Promise<{ sols: { out: CasOut; node: Node | null }[]; error?: string }> {
  const names = namesOf(F);
  if (!names.includes(x)) names.push(x);
  try {
    const r = await ctx.cas.call<{ solutions: CasOut[] }>('solve', { expr: toSympy(F), names, var: x });
    return { sols: r.solutions.map((o) => ({ out: o, node: readCas(o, names) })) };
  } catch (e) { return { sols: [], error: (e as Error).message }; }
}

async function taskSolve(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const F = an.kind === 'equation' ? an.equation!.F : an.exprs[0];
  const x = an.vars[0];
  const steps: WorkStep[] = [];
  const notes: string[] = [];
  if (an.kind === 'equation') {
    steps.push({ title: 'Move everything to one side', rule: 'Rearrange', tex: `${T(an.equation!.lhs)} = ${T(an.equation!.rhs)} \\iff ${T(F)} = 0`, detail: 'Subtracting the right-hand side from both sides keeps the solutions the same and leaves a single expression to make zero.', hint: 'Get zero on one side.', visual: { k: 'curves', x, items: [{ node: an.equation!.lhs, label: 'lhs', tone: 0 }, { node: an.equation!.rhs, label: 'rhs', tone: 1 }] } });
  } else {
    steps.push({ title: 'Set the function to zero', tex: `${T(F)} = 0`, detail: `The roots are where the graph meets the ${x}-axis.`, hint: 'Write f(x) = 0.' });
  }
  // factor (SymPy) when it changes the form
  try {
    const names = namesOf(F);
    const r = await ctx.cas.call<{ factored: CasOut }>('simplify', { expr: toSympy(F), names });
    const fac = readCas(r.factored, names);
    if (r.factored.latex && fac && T(fac) !== T(F) && /\\left\(|\)\s*\(|\^\{?\d/.test(r.factored.latex)) {
      const a = agree(F, fac, namesOf(F).filter((n) => !(n in fixed)).length ? [x] : [x], fixed);
      steps.push({ title: 'Factor', rule: 'Factorization (SymPy)', tex: `${r.factored.latex} = 0`, detail: `A product is zero exactly when one of its factors is zero. ${a.ok ? 'The factored form agrees with the original at sample points.' : ''}`, hint: 'Can it be factored?', check: a.ok ? ok('Factored form agrees numerically with the original.') : unv('Could not compare the factored form numerically.') });
    }
  } catch { /* factoring is optional */ }
  const { sols, error } = await casSolve(ctx, F, x);
  const Fx = tryCompile1(F, x, fixed);
  const real: number[] = [];
  const checks: Check[] = [];
  if (error) notes.push(`SymPy could not solve it exactly (${error}).`);
  sols.forEach((s, i) => {
    let check: Check;
    if (!s.node) check = /\bI\b/.test(s.out.text) ? unv('A complex solution — not on the real graph.') : unv('MathVerse cannot evaluate this form to check it.');
    else {
      let v = NaN;
      try { v = evaluate(s.node, fixed); } catch { /* */ }
      const r = Fx ? Fx(v) : NaN;
      const scale = Fx ? Math.max(1, ...SAMPLES.map((t) => Math.abs(Fx(t))).filter(Number.isFinite)) : 1;
      if (Number.isFinite(v) && Number.isFinite(r) && Math.abs(r) <= 1e-9 * scale) { check = ok(`Substituted back: the residual is ${fmt(Math.abs(r), 2)}.`); real.push(v); }
      else check = bad(`Substituting ${x} ≈ ${fmt(v)} back leaves ${fmt(r)} — not a solution at the current parameter values.`);
    }
    checks.push(check);
    steps.push({ title: `Solution ${i + 1}`, rule: 'SymPy solve', tex: `${symbolTeX(x)} = ${s.out.latex}${s.node && !s.out.numeric ? ` \\approx ${(() => { try { return fmt(evaluate(s.node!, fixed)); } catch { return '?'; } })()}` : ''}`, detail: 'Substitute it back into the equation to check it.', hint: 'Solve each factor (or use the formula) for the unknown.', check, visual: s.node ? { k: 'curves', x, items: [{ node: F, label: T(F), tone: 0 }], points: real.length ? [{ at: [real[real.length - 1], 0], tone: 2 }] : [] } : undefined });
  });
  // numerical scan on [-10, 10] for comparison
  const scan = Fx ? findRoots(Fx, -10, 10, 2000) : [];
  const missing = scan.filter((r) => !real.some((s) => Math.abs(s - r) < 1e-6 * Math.max(1, Math.abs(r))));
  if (scan.length) {
    steps.push({ title: 'Numerical cross-check', rule: 'Brent’s method on [−10, 10]', tex: scan.slice(0, 12).map((r) => `${symbolTeX(x)} \\approx ${fmt(r, 8)}`).join(',\\ ') + (scan.length > 12 ? ',\\ \\dots' : ''), detail: `MathVerse scanned for sign changes and found ${scan.length} real root${scan.length === 1 ? '' : 's'} in [−10, 10]${missing.length ? `, ${missing.length} of them not in SymPy's list` : ', all of them in SymPy\'s list'}. (Numerical; double roots that touch the axis without crossing it can be missed.)`, check: numerical('Numerical roots, to about 1e−13.'), visual: { k: 'curves', x, items: [{ node: F, label: T(F), tone: 0 }], points: scan.map((r) => ({ at: [r, 0] as [number, number], tone: 2 })) } });
    if (missing.length && sols.length && /sin|cos|tan|sec|csc|cot/.test(T(F))) notes.push('The equation is periodic: SymPy returns the solutions in one period; add whole multiples of the period for the rest (the numerical scan shows them).');
  }
  const answerTeX = sols.length ? sols.map((s) => `${symbolTeX(x)} = ${s.out.latex}`).join(',\\quad ') : scan.length ? scan.map((r) => `${symbolTeX(x)} \\approx ${fmt(r, 10)}`).join(',\\ ') : '\\text{no real solution found}';
  const overall = sols.length ? worst(...checks) : scan.length ? numerical('No exact solution from SymPy; the roots shown are numerical.') : unv('Neither SymPy nor the numerical scan found a solution.');
  return { task: 'solve', engine: 'SymPy solve; checked by substitution in MathVerse’s core', steps, answer: { label: sols.length ? 'Solutions' : 'Solutions (numerical)', tex: answerTeX }, check: overall, marks: { points: (real.length ? real : scan).map((r) => ({ at: [r, 0] })) }, notes };
}

async function taskExtrema(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const f = an.exprs[0], x = an.vars[0];
  const fixed = fixedOf(an, params);
  const w = differentiateWithSteps(f, x, { fixed });
  const d2 = derivative(w.result, x);
  const steps: WorkStep[] = [{
    title: 'Differentiate', rule: rulesUsed(w.tree).join(', '), tex: `f'(${symbolTeX(x)}) = ${T(w.result)}`, detail: `Every rule is shown under **Derivative**. ${w.check.text}`, hint: 'Critical points are where f′ = 0 (or does not exist). Start with f′.', check: checkOfDiff(w),
    visual: { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }, { node: w.result, label: "f'", tone: 1, dash: true }] },
  }];
  const { sols, error } = await casSolve(ctx, w.result, x);
  const F = tryCompile1(f, x, fixed), D1 = tryCompile1(w.result, x, fixed), D2 = tryCompile1(d2, x, fixed);
  const found: { x: number; kind: string }[] = [];
  const checks: Check[] = [checkOfDiff(w)];
  steps.push({ title: 'Solve f′ = 0', rule: 'SymPy solve', tex: sols.length ? sols.map((s) => `${symbolTeX(x)} = ${s.out.latex}`).join(',\\quad ') : '\\text{no exact solutions}', detail: error ? `SymPy: ${error}` : 'These are the candidates.', hint: 'Set f′(x) = 0 and solve.' });
  for (const s of sols) {
    if (!s.node || !F || !D1 || !D2) { checks.push(unv('A solution MathVerse cannot evaluate (complex, or a special function).')); continue; }
    let v = NaN; try { v = evaluate(s.node, fixed); } catch { /* */ }
    const slope = D1(v), curv = D2(v), y = F(v);
    const kind = curv < -1e-9 ? 'local maximum' : curv > 1e-9 ? 'local minimum' : 'second-derivative test inconclusive';
    const c = Number.isFinite(slope) && Math.abs(slope) < 1e-8 * Math.max(1, Math.abs(y)) ? ok(`f′ = ${fmt(slope, 2)} there.`) : bad(`f′ is ${fmt(slope)} there, not 0.`);
    checks.push(c);
    found.push({ x: v, kind });
    steps.push({ title: `Classify ${symbolTeX(x)} = ${fmt(v, 6)}`, rule: 'Second-derivative test', tex: `f''(${fmt(v, 6)}) = ${fmt(curv)}\\ ${curv < 0 ? '< 0' : curv > 0 ? '> 0' : '= 0'} \\Rightarrow \\text{${kind}},\\quad f(${fmt(v, 6)}) = ${fmt(y)}`, detail: curv < 0 ? 'Concave down: the tangent is a horizontal cap — a local maximum.' : curv > 0 ? 'Concave up: a horizontal cup — a local minimum.' : 'f″ = 0: look at the sign of f′ on either side instead.', hint: 'Use the sign of f″ at each candidate.', check: c, visual: { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }, { node: d2, label: "f''", tone: 3, dash: true }], points: [{ at: [v, y], tone: 2 }], lines: [{ at: [v, y], m: 0 }] } });
  }
  const scan = F && D1 && D2 ? criticalPoints(F, D1, D2, -10, 10) : [];
  const missing = scan.filter((c) => !found.some((s) => Math.abs(s.x - c.x) < 1e-6 * Math.max(1, Math.abs(c.x))));
  if (scan.length) steps.push({ title: 'Numerical cross-check', rule: 'Sign changes of f′ on [−10, 10]', tex: scan.slice(0, 10).map((c) => `${fmt(c.x, 7)}\\ (\\text{${c.kind}})`).join(',\\ '), detail: missing.length ? `${missing.length} critical point(s) found numerically are not in SymPy's list (periodic functions have infinitely many).` : 'The numerical scan finds the same critical points in this window.', check: numerical('Brent’s method on f′; classified by the sign of f″.') });
  return {
    task: 'extrema', engine: 'Step differentiator + SymPy solve; checked in MathVerse’s core', steps,
    answer: found.length ? { label: 'Critical points', tex: found.map((c) => `${symbolTeX(x)} = ${fmt(c.x, 8)}\\ \\text{(${c.kind})}`).join(',\\quad ') } : scan.length ? { label: 'Critical points (numerical)', tex: scan.map((c) => `${fmt(c.x, 8)}\\ (\\text{${c.kind}})`).join(',\\ ') } : { label: 'Critical points', tex: '\\text{none found}' },
    check: found.length ? worst(...checks) : scan.length ? numerical('Only numerical critical points were found.') : unv('No critical points found.'),
    marks: { points: (found.length ? found.map((c) => c.x) : scan.map((c) => c.x)).map((v) => ({ at: [v, F ? F(v) : 0] })) }, notes: [],
  };
}

async function taskLimit(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const f = an.exprs[0], x = an.vars[0];
  const fixed = fixedOf(an, params);
  let A: ReturnType<typeof atPoint>;
  try { A = atPoint(an.intent.at ?? ctx.at); } catch { throw new Error(`“${ctx.at}” is not a point MathVerse can read — type a number, pi/2, inf or -inf`); }
  const aTeX = A.infinite ? (A.value > 0 ? '\\infty' : '-\\infty') : T(A.node);
  const F = tryCompile1(f, x, fixed);
  const steps: WorkStep[] = [];
  const lim = `\\lim_{${symbolTeX(x)} \\to ${aTeX}}`;
  if (!A.infinite && F) {
    const v = F(A.value);
    if (Number.isFinite(v)) steps.push({ title: 'Try direct substitution', rule: 'Continuity', tex: `f(${aTeX}) = ${fmt(v)}`, detail: 'If f is continuous at the point, the limit is simply its value there (the numerical table below confirms it).', hint: 'Start by plugging the point in.' });
    else {
      steps.push({ title: 'Direct substitution fails', rule: 'Indeterminate form', tex: `f(${aTeX}) \\text{ is undefined}`, detail: 'The point is not in the domain — look at how f behaves nearby.', hint: 'Plug the point in — what goes wrong?' });
      if (f.t === 'div') {
        const N = tryCompile1(f.a, x, fixed), Dn = tryCompile1(f.b, x, fixed);
        const nv = N ? N(A.value) : NaN, dv = Dn ? Dn(A.value) : NaN;
        if (Math.abs(nv) < 1e-12 && Math.abs(dv) < 1e-12) {
          try {
            const dn = derivative(f.a, x), dd = derivative(f.b, x);
            const r = tryCompile1(div(dn, dd), x, fixed)?.(A.value);
            steps.push({ title: 'L’Hôpital’s rule (0/0)', rule: 'L’Hôpital', tex: `${lim} \\frac{${T(f.a)}}{${T(f.b)}} = ${lim} \\frac{${T(dn)}}{${T(dd)}}${r !== undefined && Number.isFinite(r) ? ` = ${fmt(r)}` : ''}`, detail: 'Numerator and denominator both tend to 0, so the limit equals the limit of the ratio of their derivatives (when that exists). The derivatives are exact, from MathVerse’s differentiator.', hint: 'Both top and bottom go to zero — which rule helps with 0/0?' });
          } catch { /* not differentiable */ }
        }
      }
    }
  }
  const names = namesOf(f); if (!names.includes(x)) names.push(x);
  let L: CasOut | null = null, err = '';
  try { L = (await ctx.cas.call<{ result: CasOut }>('limit', { expr: toSympy(f), names, var: x, a: toSympy(A.node) })).result; } catch (e) { err = (e as Error).message; }
  if (L) steps.push({ title: 'The limit', rule: 'SymPy limit (series expansion / Gruntz algorithm)', tex: `${lim} ${T(f)} = ${L.latex}`, hint: 'What value do the outputs approach?' });
  // numerical table
  const rows: [number, number][] = [];
  if (F) {
    if (A.infinite) for (const e of [1, 2, 3, 4, 6]) { const t = Math.sign(A.value) * 10 ** e; rows.push([t, F(t)]); }
    else for (const e of [1, 2, 3, 4, 5]) { const h = 10 ** -e; rows.push([A.value - h, F(A.value - h)], [A.value + h, F(A.value + h)]); }
  }
  let check: Check = unv(err ? `SymPy: ${err}` : 'Not checked.');
  const Lnode = readCas(L, names);
  let Lv: number | null = null;
  if (L) {
    if (/\\infty/.test(L.latex)) Lv = /^-/.test(L.text) ? -Infinity : Infinity;
    else if (Lnode) { try { Lv = evaluate(Lnode, fixed); } catch { Lv = null; } }
  }
  if (rows.length && Lv !== null) {
    const near = A.infinite ? rows.slice(-2) : rows.slice(-2);
    if (Number.isFinite(Lv)) {
      const err_ = Math.max(...near.map(([, v]) => Math.abs(v - Lv!)));
      check = err_ < 1e-3 * Math.max(1, Math.abs(Lv)) ? ok(`Values of f approach ${fmt(Lv)}: within ${fmt(err_, 2)} at the closest points.`) : unv(`The table does not settle on ${fmt(Lv)} within 1e−3 (closest difference ${fmt(err_, 2)}) — the convergence may be slow or one-sided.`);
    } else check = near.every(([, v]) => Math.abs(v) > 1e3 && Math.sign(v) === Math.sign(Lv!)) ? ok('The values grow without bound with the right sign.') : unv('The table does not clearly grow without bound.');
  } else if (L && !Lnode) check = unv('SymPy’s answer is in a form MathVerse cannot evaluate to check.');
  if (rows.length) steps.push({ title: 'Numerical table', rule: 'Evaluate near the point', tex: `\\begin{array}{r|l} ${symbolTeX(x)} & f(${symbolTeX(x)}) \\\\ \\hline ${rows.map(([t, v]) => `${fmt(t, 8)} & ${fmt(v, 10)}`).join(' \\\\ ')} \\end{array}`, detail: 'Numerical evidence only — a table can suggest a limit but never prove one. (Floating-point cancellation spoils the closest rows of some tables.)', check: numerical('Floating-point evaluation of f.'), hint: 'Evaluate f closer and closer to the point, from both sides.' });
  return { task: 'limit', engine: 'SymPy limit; checked against a numerical table', steps, answer: L ? { label: 'Limit', tex: `${lim} ${T(f)} = ${L.latex}` } : null, check, marks: !A.infinite && Lv !== null && Number.isFinite(Lv) ? { points: [{ at: [A.value, Lv] }] } : {}, notes: [] };
}

function integralSteps(r: IntegralResult): WorkStep[] {
  return r.steps.map((s) => ({ title: s.title, rule: s.rule, tex: s.tex, detail: s.detail, depth: s.depth, hint: `Which technique fits $${s.tex.replace(/^\\int\s*/, '\\int ')}$?` }));
}

async function taskIntegral(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const f = an.exprs[0], x = an.vars[0];
  const fixed = fixedOf(an, params);
  const r = await (ctx.integrate ?? integrateSymbolic)(f, x, fixed);
  const steps = integralSteps(r);
  const notes: string[] = [];
  let check: Check;
  if (r.antiderivative) {
    let dF: Node | null = null;
    try { dF = r.antiderivative.node ? derivative(r.antiderivative.node, x) : null; } catch { dF = null; }
    check = r.antiderivative.verified ? ok('Differentiated back by MathVerse’s own engine: F′ equals the integrand at every sample point.') : r.antiderivative.node ? bad('Differentiating SymPy’s answer back did not reproduce the integrand at the sample points (it may differ on part of the domain, e.g. |x| vs x).') : unv('SymPy’s answer uses a function MathVerse cannot differentiate, so it was not checked.');
    steps.push({ title: 'Verify: differentiate back', rule: 'Fundamental Theorem of Calculus', tex: dF ? `\\frac{d}{d${symbolTeX(x)}}\\left[${r.antiderivative.tex}\\right] = ${T(dF)} \\overset{?}{=} ${T(f)}` : `F' \\overset{?}{=} f`, detail: 'Any antiderivative must differentiate back to the integrand. MathVerse compares F′ with f at sample points.', check, hint: 'How can you be sure? Differentiate your answer.', visual: r.antiderivative.node ? { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }, { node: r.antiderivative.node, label: 'F', tone: 1 }] } : undefined });
  } else {
    check = unv('SymPy found no closed-form antiderivative. A definite integral can still be computed numerically.');
    notes.push('No elementary antiderivative was found — try a definite integral (numerical).');
  }
  return { task: 'integral', engine: 'SymPy (manualintegrate rule tree); verified by MathVerse’s differentiator', steps, answer: r.antiderivative ? { label: 'Antiderivative', tex: `\\int ${T(f)}\\,d${symbolTeX(x)} = ${r.antiderivative.tex} + C` } : null, check, marks: r.antiderivative?.node ? { curve: r.antiderivative.node } : {}, notes };
}

async function taskDefinite(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const f = an.exprs[0], x = an.vars[0];
  const fixed = fixedOf(an, params);
  const a = params.lo ?? 0, b = params.hi ?? 1;
  const r = await (ctx.integrate ?? integrateSymbolic)(f, x, fixed, a, b);
  const steps = integralSteps(r);
  const d = r.definite!;
  const head = `\\int_{${fmt(a, 6)}}^{${fmt(b, 6)}} ${T(f)}\\,d${symbolTeX(x)}`;
  if (r.antiderivative) steps.push({ title: 'Evaluate the antiderivative at the limits', rule: 'Fundamental Theorem of Calculus', tex: `${head} = \\Big[${r.antiderivative.tex}\\Big]_{${fmt(a, 6)}}^{${fmt(b, 6)}}`, detail: `F(b) − F(a), with F′ = f ${r.antiderivative.verified ? '(verified)' : '(not verified)'}.`, hint: 'F(b) − F(a).' });
  const vis: Visual = { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }], shade: { node: f, lo: Math.min(a, b), hi: Math.max(a, b) } };
  steps.push({ title: 'Numerical check', rule: 'Adaptive Gauss–Kronrod quadrature', tex: `${head} \\approx ${fmt(d.numeric, 12)} \\pm ${fmt(d.numericError, 2)}`, detail: d.warning ? `Quadrature warning: ${d.warning}` : 'Signed area: regions below the axis count negative.', check: numerical('Quadrature with an error estimate.'), visual: vis });
  let check: Check;
  if (d.exactTex === null) check = numerical(`SymPy found no exact value; the answer is numerical: ${fmt(d.numeric, 12)} ± ${fmt(d.numericError, 2)}.`);
  else if (d.agrees) check = ok(`The exact value ${d.value !== null ? `(${fmt(d.value, 12)})` : ''} agrees with quadrature (${fmt(d.numeric, 12)} ± ${fmt(d.numericError, 2)}).`);
  else if (d.agrees === null) check = unv('SymPy’s value could not be evaluated to compare.');
  else check = bad(`SymPy’s value ${d.value !== null ? fmt(d.value, 12) : ''} disagrees with quadrature ${fmt(d.numeric, 12)} — the integral may be improper or the integrand singular on the interval.`);
  const decimals = d.exactTex !== null && /\d\.\d/.test(d.exactTex);
  return {
    task: 'definite', engine: 'SymPy; compared with adaptive quadrature', steps,
    answer: d.exactTex !== null ? { label: decimals ? 'Value (SymPy, from decimal limits)' : 'Exact value', tex: `${head} = ${d.exactTex}${d.value !== null ? ` \\approx ${fmt(d.value, 10)}` : ''}` } : { label: 'Value (numerical)', tex: `${head} \\approx ${fmt(d.numeric, 12)}` },
    check, notes: decimals ? ['The limits came from sliders as decimals, so SymPy worked in decimals; type exact limits (∫_0^pi …) for an exact form.'] : [],
  };
}

async function taskSeries(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const f = an.exprs[0], x = an.vars[0];
  const fixed = fixedOf(an, params);
  const n = Math.max(1, Math.min(12, Math.round(params.order ?? 5)));
  let A: ReturnType<typeof atPoint>;
  try { A = atPoint(ctx.at); } catch { throw new Error(`“${ctx.at}” is not a point MathVerse can read`); }
  if (A.infinite) throw new Error('A Taylor series is taken about a finite point — set “at” to a number');
  const a = A.node, av = A.value;
  const X = symbolTeX(x);
  const shift = av === 0 ? sym(x) : sub(sym(x), a);
  const steps: WorkStep[] = [{ title: 'Taylor’s formula', rule: 'Taylor series', tex: `f(${X}) = \\sum_{k=0}^{n} \\frac{f^{(k)}(${T(a)})}{k!}\\,${av === 0 ? `${X}^k` : `(${X} - ${T(a)})^k`} + R_n`, detail: 'Each coefficient needs one more derivative, evaluated at the centre.', hint: 'Taylor coefficients come from derivatives at the centre.' }];
  let partial: Node = num(0);
  let dk: Node = f;
  let fact = 1;
  const coeffs: number[] = [];
  try {
    for (let k = 0; k <= n; k++) {
      if (k > 0) { dk = derivative(dk, x); fact *= k; }
      const atA = simplify(substitute(dk, { [x]: a }));
      let cv = NaN; try { cv = evaluate(atA, fixed) / fact; } catch { /* */ }
      coeffs.push(cv);
      const termNode = simplify(mul(div(atA, num(fact)), k === 0 ? num(1) : pow(shift, num(k))));
      partial = simplify(add(partial, termNode));
      steps.push({ title: `Order ${k}`, rule: k === 0 ? 'Value at the centre' : `${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} derivative`, depth: 1, tex: `f^{(${k})}(${X}) = ${T(dk)},\\quad f^{(${k})}(${T(a)}) = ${T(atA)}${Number.isFinite(cv) ? '' : ''}\\ \\Rightarrow\\ \\text{term } ${T(termNode)}`, detail: '', hint: `Differentiate ${k} time${k === 1 ? '' : 's'} and evaluate at the centre.`, visual: { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }, { node: partial, label: `P_${k}`, tone: 1 }], points: [{ at: [av, tryCompile1(f, x, fixed)?.(av) ?? 0], tone: 2 }] } });
    }
  } catch (e) {
    if (e instanceof NotDifferentiable) steps.push({ title: 'No derivative formula', detail: e.message });
    else throw e;
  }
  const names = namesOf(f); if (!names.includes(x)) names.push(x);
  let P: CasOut | null = null, err = '';
  try { P = (await ctx.cas.call<{ polynomial: CasOut }>('series', { expr: toSympy(f), names, var: x, a: toSympy(a), n: n + 1 })).polynomial; } catch (e) { err = (e as Error).message; }
  let check: Check = unv(err ? `SymPy: ${err}` : 'Not checked.');
  const Pn = readCas(P, names);
  if (P) {
    if (Pn) {
      // the derivatives of SymPy's polynomial at the centre must equal f's
      let worstRel = 0, compared = 0;
      let dp: Node = Pn, df: Node = f;
      for (let k = 0; k <= n; k++) {
        if (k) { dp = derivative(dp, x); df = derivative(df, x); }
        let u = NaN, v = NaN;
        try { u = compile(dp, [x], fixed)([av]); v = compile(df, [x], fixed)([av]); } catch { /* */ }
        if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
        compared++;
        worstRel = Math.max(worstRel, Math.abs(u - v) / Math.max(1, Math.abs(v)));
      }
      check = compared && worstRel < 1e-8 ? ok(`SymPy’s polynomial has the same derivatives as f at the centre, orders 0–${n} (checked by MathVerse’s differentiator).`) : compared ? bad(`SymPy’s polynomial and f differ in a derivative at the centre (relative ${fmt(worstRel, 2)}).`) : unv('No derivative could be compared.');
    } else check = unv('SymPy’s polynomial is in a form MathVerse cannot evaluate.');
    steps.push({ title: 'The Taylor polynomial', rule: 'SymPy series', tex: `P_{${n}}(${X}) = ${P.latex}`, check, detail: 'It matches f and its first n derivatives at the centre; the error near the centre shrinks like (x − a)^(n+1).', visual: Pn ? { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }, { node: Pn, label: `P_${n}`, tone: 1 }] } : undefined });
  }
  return { task: 'series', engine: 'Exact derivatives (MathVerse) + SymPy series, cross-checked', steps, answer: P ? { label: `Taylor polynomial of order ${n} about ${fmt(av, 6)}`, tex: `${T(f)} = ${P.latex} + O\\!\\left(${av === 0 ? X : `(${X} - ${T(a)})`}^{${n + 1}}\\right)` } : { label: 'Taylor polynomial (from MathVerse’s derivatives)', tex: T(partial) }, check, notes: [] };
}

async function taskApart(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const f = an.exprs[0], x = an.vars[0];
  const fixed = fixedOf(an, params);
  const names = namesOf(f); if (!names.includes(x)) names.push(x);
  const steps: WorkStep[] = [];
  if (f.t === 'div') {
    try {
      const r = await ctx.cas.call<{ factored: CasOut }>('simplify', { expr: toSympy(f.b), names });
      steps.push({ title: 'Factor the denominator', rule: 'Factorization', tex: `${T(f.b)} = ${r.factored.latex}`, detail: 'Each linear factor (x − r) gives a term A/(x − r); a repeated one gives A/(x−r) + B/(x−r)² …; an irreducible quadratic gives (Ax + B)/(quadratic).', hint: 'Factor the bottom first.' });
    } catch { /* optional */ }
  }
  const r = await ctx.cas.call<{ result: CasOut }>('apart', { expr: toSympy(f), names, var: x });
  const g = readCas(r.result, names);
  const a = g ? agree(f, g, [x], fixed) : null;
  const check = a ? (a.ok ? ok(`Equal to the original at ${a.points} sample points.`) : bad('The decomposition does not match the original numerically.')) : unv('Not in a form MathVerse can evaluate.');
  steps.push({ title: 'Decompose', rule: 'SymPy apart', tex: `${T(f)} = ${r.result.latex}`, detail: 'Solve for the unknown numerators (cover-up method or comparing coefficients); every term is now integrable by a standard rule.', check, hint: 'Write the fraction as a sum of simpler fractions with unknown numerators.', visual: g ? { k: 'curves', x, items: [{ node: f, label: 'f', tone: 0 }, { node: g, label: 'sum', tone: 1, dash: true }] } : undefined });
  return { task: 'apart', engine: 'SymPy apart; checked numerically', steps, answer: { label: 'Partial fractions', tex: `${T(f)} = ${r.result.latex}` }, check, notes: [] };
}

// ── Calculus III / geometry ─────────────────────────────────────────────────

function partialBlock(f: Node, v: string, fixed: Record<string, number>, label: string): { steps: WorkStep[]; w: DiffWork } {
  const w = differentiateWithSteps(f, v, { partial: true, fixed });
  const steps: WorkStep[] = [{ title: label, rule: 'Partial derivative', tex: `\\frac{\\partial}{\\partial ${symbolTeX(v)}}\\left[${T(f)}\\right]`, detail: `Differentiate with respect to $${symbolTeX(v)}$, holding every other variable fixed.`, hint: `Treat every variable except ${v} as a constant.`, check: checkOfDiff(w) }];
  steps.push(...w.steps.map((s) => ({ title: s.title, rule: s.name, tex: s.tex, detail: s.detail, depth: 1 + s.depth, hint: s.hint })));
  return { steps, w };
}

function taskPartials(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const f = an.exprs[0];
  const [x, y] = an.vars;
  const fixed = fixedOf(an, params);
  const bx = partialBlock(f, x, fixed, `∂f/∂${x}`), by = partialBlock(f, y, fixed, `∂f/∂${y}`);
  const steps = [...bx.steps, ...by.steps];
  const x0 = params.x0 ?? 0.5, y0 = params.y0 ?? 0.5;
  const val = (n: Node) => { try { return compile(n, [x, y], fixed)([x0, y0]); } catch { return NaN; } };
  const z0 = val(f), fx = val(bx.w.result), fy = val(by.w.result);
  steps.push({ title: `Gradient and tangent plane at (${fmt(x0, 3)}, ${fmt(y0, 3)})`, rule: 'Linearization', tex: `\\nabla f = \\left(${fmt(fx)},\\ ${fmt(fy)}\\right),\\quad z = ${fmt(z0)} ${fx < 0 ? '-' : '+'} ${fmt(Math.abs(fx))}(${x} - ${fmt(x0, 3)}) ${fy < 0 ? '-' : '+'} ${fmt(Math.abs(fy))}(${y} - ${fmt(y0, 3)})`, detail: `The gradient points uphill, steepest, with slope $|\\nabla f| = ${fmt(Math.hypot(fx, fy))}$; the tangent plane is the best linear approximation. Move $x_0, y_0$ to explore.`, hint: 'Evaluate both partials at the point.' });
  return {
    task: 'partials', engine: 'MathVerse step differentiator (partial derivatives)', steps,
    answer: { label: 'Partial derivatives', tex: `f_{${x}} = ${T(bx.w.result)},\\quad f_{${y}} = ${T(by.w.result)}` },
    check: worst(checkOfDiff(bx.w), checkOfDiff(by.w)),
    marks: { points: [{ at: [x0, y0, z0] }], arrows: [{ from: [x0, y0, z0], vec: [fx, fy, 0] }], plane: { at: [x0, y0, z0], normal: [-fx, -fy, 1] } }, notes: [],
  };
}

/** Newton's method for F(p) = 0 in n dimensions with an exact Jacobian; multi-start, deduplicated. */
function newtonAll(Fs: Node[], vars: string[], fixed: Record<string, number>, box = 4, per = 7): number[][] {
  const n = vars.length;
  const F = Fs.map((e) => compile(e, vars, fixed));
  const J = Fs.map((e) => vars.map((v) => compile(derivative(e, v), vars, fixed)));
  const found: number[][] = [];
  const seeds: number[][] = [];
  const rec = (pre: number[]) => { if (pre.length === n) { seeds.push(pre); return; } for (let i = 0; i < per; i++) rec([...pre, -box + (2 * box * (i + 0.5)) / per]); };
  rec([]);
  for (const s of seeds) {
    let p = s.slice();
    for (let it = 0; it < 40; it++) {
      const r = F.map((g) => g(p));
      if (!r.every(Number.isFinite)) break;
      if (Math.max(...r.map(Math.abs)) < 1e-12) break;
      const Jm = J.map((row) => row.map((g) => g(p)));
      const d = linSolve(Jm, r.map((v) => -v));
      if (!d) break;
      p = p.map((v, i) => v + d[i]);
    }
    const r = F.map((g) => g(p));
    if (r.every((v) => Number.isFinite(v) && Math.abs(v) < 1e-10) && p.every((v) => Math.abs(v) < 3 * box) && !found.some((q) => q.every((v, i) => Math.abs(v - p[i]) < 1e-7))) found.push(p.map((v) => (Math.abs(v) < 1e-13 ? 0 : v)));
  }
  return found;
}

function taskCritical(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const f = an.exprs[0];
  const [x, y] = an.vars;
  const fixed = fixedOf(an, params);
  const fx = derivative(f, x), fy = derivative(f, y);
  const fxx = derivative(fx, x), fyy = derivative(fy, y), fxy = derivative(fx, y);
  const steps: WorkStep[] = [
    { title: 'Set the gradient to zero', rule: 'Critical points', tex: `f_{${x}} = ${T(fx)} = 0,\\qquad f_{${y}} = ${T(fy)} = 0`, detail: 'Both partial derivatives (exact; see **Partial derivatives** for the rules) must vanish.', hint: 'Where is the tangent plane horizontal?' },
    { title: 'The Hessian', rule: 'Second partial derivatives', tex: `f_{${x}${x}} = ${T(fxx)},\\quad f_{${y}${y}} = ${T(fyy)},\\quad f_{${x}${y}} = ${T(fxy)}`, detail: 'D = f_xx f_yy − f_xy² decides: D > 0 and f_xx > 0 a minimum, D > 0 and f_xx < 0 a maximum, D < 0 a saddle, D = 0 inconclusive.', hint: 'Second derivatives decide the type.' },
  ];
  const pts = newtonAll([fx, fy], [x, y], fixed);
  const H = [fxx, fyy, fxy].map((e) => compile(e, [x, y], fixed));
  const F = compile(f, [x, y], fixed);
  const classes = pts.map((p) => {
    const [a, b, c] = H.map((h) => h(p));
    const D = a * b - c * c;
    const kind = D > 1e-9 ? (a > 0 ? 'local minimum' : 'local maximum') : D < -1e-9 ? 'saddle point' : 'inconclusive (D = 0)';
    steps.push({ title: `(${fmt(p[0], 6)}, ${fmt(p[1], 6)})`, rule: 'Second-derivative test', depth: 1, tex: `D = (${fmt(a, 5)})(${fmt(b, 5)}) - (${fmt(c, 5)})^2 = ${fmt(D, 5)} \\Rightarrow \\text{${kind}},\\quad f = ${fmt(F(p))}`, check: numerical('Location found by Newton’s method (|∇f| < 1e−10); the Hessian is exact, evaluated there.') });
    return { p, kind };
  });
  if (!pts.length) steps.push({ title: 'No critical points found', detail: 'Newton’s method from 49 starting points in [−4, 4]² found none (numerical: there may be some outside that box).' });
  return {
    task: 'critical', engine: 'Exact derivatives; Newton’s method for the locations (numerical)', steps,
    answer: { label: 'Critical points (numerical locations)', tex: classes.length ? classes.map((c) => `(${fmt(c.p[0], 6)}, ${fmt(c.p[1], 6)})\\ \\text{${c.kind}}`).join(',\\ ') : '\\text{none in } [-4, 4]^2' },
    check: numerical('The locations are numerical (Newton, multi-start in [−4, 4]²); derivatives and the test are exact.'),
    marks: { points: classes.map((c) => ({ at: [c.p[0], c.p[1], F(c.p)], label: c.kind })) }, notes: [],
  };
}

async function taskDouble(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const f = an.exprs[0];
  const [x, y] = an.vars;
  const fixed = fixedOf(an, params);
  const a = params.lo ?? 0, b = params.hi ?? 1, c = params.ylo ?? 0, d = params.yhi ?? 1;
  const names = [...new Set([...namesOf(f), x, y])];
  const steps: WorkStep[] = [{ title: 'Set up the iterated integral', rule: 'Fubini’s theorem', tex: `\\iint_R ${T(f)}\\,dA = \\int_{${fmt(c)}}^{${fmt(d)}}\\left(\\int_{${fmt(a)}}^{${fmt(b)}} ${T(f)}\\,d${x}\\right) d${y}`, detail: 'Over a rectangle a continuous integrand can be integrated one variable at a time, in either order.', hint: 'Integrate in x first, holding y fixed.' }];
  const q = integrate2((u, v) => compile(f, [x, y], fixed)([u, v]), a, b, () => c, () => d, 1e-9);
  let exact: CasOut | null = null, inner: CasOut | null = null, err = '';
  try {
    const r1 = await ctx.cas.call<{ definite: CasOut | null }>('integrate', { expr: toSympy(f), names, var: x, a: String(a), b: String(b) });
    inner = r1.definite;
    const g = readCas(inner, names);
    if (inner) steps.push({ title: 'Inner integral', rule: 'SymPy integrate', tex: `\\int_{${fmt(a)}}^{${fmt(b)}} ${T(f)}\\,d${x} = ${inner.latex}`, detail: `Treat ${y} as a constant.` });
    if (g) {
      const r2 = await ctx.cas.call<{ definite: CasOut | null }>('integrate', { expr: toSympy(g), names, var: y, a: String(c), b: String(d) });
      exact = r2.definite;
      if (exact) steps.push({ title: 'Outer integral', rule: 'SymPy integrate', tex: `\\int_{${fmt(c)}}^{${fmt(d)}} \\left(${inner!.latex}\\right) d${y} = ${exact.latex}` });
    }
  } catch (e) { err = (e as Error).message; }
  steps.push({ title: 'Numerical check', rule: 'Nested adaptive quadrature', tex: `\\iint_R ${T(f)}\\,dA \\approx ${fmt(q.value, 12)} \\pm ${fmt(q.error, 2)}`, check: numerical('Gauss–Kronrod in each variable.') });
  const ev = exact?.value ?? null;
  const agreeQ = ev !== null && ev !== undefined && Math.abs(ev - q.value) <= Math.max(1e-6 * Math.abs(q.value), 10 * q.error, 1e-9);
  const check = exact ? (ev === null || ev === undefined ? unv('The exact value could not be evaluated to compare.') : agreeQ ? ok(`Exact value agrees with quadrature (${fmt(q.value, 12)}).`) : bad('SymPy’s value disagrees with quadrature.')) : numerical(`No exact value${err ? ` (${err})` : ''}; the answer is numerical.`);
  return { task: 'double', engine: 'SymPy, inner then outer; compared with 2D quadrature', steps, answer: exact ? { label: 'Double integral', tex: `${exact.latex}${ev !== null && ev !== undefined ? ` \\approx ${fmt(ev, 10)}` : ''}` } : { label: 'Double integral (numerical)', tex: `\\approx ${fmt(q.value, 12)}` }, check, notes: ['Limits come from sliders as decimals, so SymPy works with decimal limits.'] };
}

function taskSurfaceCurvature(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const f = an.exprs[0];
  const [x, y] = an.vars;
  const fixed = fixedOf(an, params);
  const fx = derivative(f, x), fy = derivative(f, y), fxx = derivative(fx, x), fyy = derivative(fy, y), fxy = derivative(fx, y);
  const p = [params.x0 ?? 0.5, params.y0 ?? 0.5];
  const v = (n: Node) => compile(n, [x, y], fixed)(p);
  const [a, b, A, B, C] = [fx, fy, fxx, fyy, fxy].map(v);
  const W = 1 + a * a + b * b;
  const K = (A * B - C * C) / (W * W);
  const H = ((1 + b * b) * A - 2 * a * b * C + (1 + a * a) * B) / (2 * Math.pow(W, 1.5));
  const steps: WorkStep[] = [
    { title: 'Partial derivatives (exact)', rule: 'Step differentiator', tex: `f_{${x}} = ${T(fx)},\\ f_{${y}} = ${T(fy)},\\ f_{${x}${x}} = ${T(fxx)},\\ f_{${y}${y}} = ${T(fyy)},\\ f_{${x}${y}} = ${T(fxy)}`, hint: 'Curvature of a graph needs first and second partials.' },
    { title: 'Gaussian curvature of a graph', rule: 'Monge patch formula', tex: `K = \\frac{f_{xx}f_{yy} - f_{xy}^2}{(1 + f_x^2 + f_y^2)^2} = \\frac{(${fmt(A, 5)})(${fmt(B, 5)}) - (${fmt(C, 5)})^2}{(${fmt(W, 5)})^2} = ${fmt(K)}`, detail: K > 0 ? 'K > 0: the surface curves the same way in every direction here (like a bowl or a dome).' : K < 0 ? 'K < 0: it curves opposite ways in different directions — a saddle.' : 'K = 0: flat in at least one direction (a cylinder or a plane).', hint: 'K = (f_xx f_yy − f_xy²)/(1 + f_x² + f_y²)².' },
    { title: 'Mean curvature', rule: 'Monge patch formula', tex: `H = \\frac{(1+f_y^2)f_{xx} - 2f_xf_yf_{xy} + (1+f_x^2)f_{yy}}{2(1+f_x^2+f_y^2)^{3/2}} = ${fmt(H)}`, detail: 'H = 0 everywhere is a minimal surface — a soap film.' },
  ];
  return { task: 'curvatureK', engine: 'Exact partial derivatives, evaluated in floating point', steps, answer: { label: `Curvature at (${fmt(p[0], 3)}, ${fmt(p[1], 3)})`, tex: `K = ${fmt(K)},\\quad H = ${fmt(H)}` }, check: ok('The formulas use exact derivatives; only the final evaluation is floating-point.'), marks: { points: [{ at: [p[0], p[1], v(f)] }] }, notes: [] };
}

/** The components of a curve; polar r(θ) becomes (r cos θ, r sin θ). */
function curveComponents(an: Analysis): { comps: Node[]; t: string; polar: boolean } {
  const t = an.vars[0];
  if (an.kind === 'polar') { const r = an.exprs[0]; return { comps: [mul(r, call('cos', sym(t))), mul(r, call('sin', sym(t)))], t, polar: true }; }
  return { comps: an.exprs, t, polar: false };
}

function taskVelocity(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const { comps, t, polar } = curveComponents(an);
  const L = ['x', 'y', 'z'];
  const steps: WorkStep[] = [];
  if (polar) steps.push({ title: 'Convert to Cartesian form', rule: 'Polar coordinates', tex: `x = r\\cos\\theta = ${T(comps[0])},\\quad y = r\\sin\\theta = ${T(comps[1])}`, hint: 'x = r cos θ, y = r sin θ.' });
  const ws = comps.map((c, i) => {
    const w = differentiateWithSteps(c, t, { fixed });
    steps.push({ title: `${L[i]}′(${t})`, rule: 'Differentiate the component', tex: `${L[i]}'(${symbolTeX(t)}) = ${dTeX(t)}\\left[${T(c)}\\right]`, hint: 'Velocity is differentiated component by component.', check: checkOfDiff(w) });
    steps.push(...diffSteps(w, 1, t));
    return w;
  });
  const t0 = params.x0 ?? 1;
  const P = comps.map((c) => compile(c, [t], fixed)([t0]));
  const Vv = ws.map((w) => compile(w.result, [t], fixed)([t0]));
  const speed = Math.hypot(...Vv);
  steps.push({ title: `At ${t} = ${fmt(t0, 4)}`, rule: 'Velocity and speed', tex: `\\mathbf r'(${fmt(t0, 4)}) = \\left(${Vv.map((v) => fmt(v)).join(',\\ ')}\\right),\\quad |\\mathbf r'| = ${fmt(speed)}`, detail: 'The velocity is tangent to the curve; its length is the speed.' });
  return { task: 'velocity', engine: 'MathVerse step differentiator, component by component', steps, answer: { label: 'Velocity', tex: `\\mathbf r'(${symbolTeX(t)}) = \\left(${ws.map((w) => T(w.result)).join(',\\ ')}\\right)` }, check: worst(...ws.map(checkOfDiff)), marks: { points: [{ at: P }], arrows: [{ from: P, vec: Vv }] }, notes: [] };
}

function taskCurvature(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const { comps, t } = curveComponents(an);
  const d1 = comps.map((c) => derivative(c, t)), d2 = d1.map((c) => derivative(c, t)), d3 = d2.map((c) => derivative(c, t));
  const t0 = params.x0 ?? 1;
  const ev = (ns: Node[]) => ns.map((n) => compile(n, [t], fixed)([t0]));
  const [r1, r2, r3] = [ev(d1), ev(d2), ev(d3)];
  const P = ev(comps);
  const steps: WorkStep[] = [
    { title: 'First and second derivatives (exact)', rule: 'Step differentiator', tex: `\\mathbf r' = \\left(${d1.map(T).join(',\\ ')}\\right),\\quad \\mathbf r'' = \\left(${d2.map(T).join(',\\ ')}\\right)`, hint: 'Curvature needs r′ and r″.' },
  ];
  let kappa: number, tau: number | null = null;
  if (comps.length === 2) {
    const num_ = r1[0] * r2[1] - r1[1] * r2[0], sp = Math.hypot(r1[0], r1[1]);
    kappa = Math.abs(num_) / sp ** 3;
    steps.push({ title: `Curvature at ${t} = ${fmt(t0, 4)}`, rule: 'Plane curve formula', tex: `\\kappa = \\frac{|x'y'' - y'x''|}{(x'^2 + y'^2)^{3/2}} = \\frac{|${fmt(num_, 5)}|}{${fmt(sp, 5)}^3} = ${fmt(kappa)}`, detail: `The osculating circle has radius $1/\\kappa = ${fmt(1 / kappa)}$.` });
  } else {
    const c = [r1[1] * r2[2] - r1[2] * r2[1], r1[2] * r2[0] - r1[0] * r2[2], r1[0] * r2[1] - r1[1] * r2[0]];
    const cn = Math.hypot(...c), sp = Math.hypot(...r1);
    kappa = cn / sp ** 3;
    tau = cn > 1e-14 ? (c[0] * r3[0] + c[1] * r3[1] + c[2] * r3[2]) / (cn * cn) : 0;
    steps.push({ title: `Curvature at ${t} = ${fmt(t0, 4)}`, rule: 'Space curve formula', tex: `\\kappa = \\frac{|\\mathbf r' \\times \\mathbf r''|}{|\\mathbf r'|^3} = \\frac{${fmt(cn, 5)}}{${fmt(sp, 5)}^3} = ${fmt(kappa)}`, detail: 'How fast the tangent direction turns per unit length.' });
    steps.push({ title: 'Torsion', rule: 'Space curve formula', tex: `\\tau = \\frac{(\\mathbf r' \\times \\mathbf r'')\\cdot \\mathbf r'''}{|\\mathbf r' \\times \\mathbf r''|^2} = ${fmt(tau)}`, detail: 'How fast the curve twists out of its osculating plane.' });
  }
  return { task: 'curvature', engine: 'Exact derivatives, evaluated in floating point', steps, answer: { label: `At ${t} = ${fmt(t0, 4)}`, tex: `\\kappa = ${fmt(kappa)}${tau !== null ? `,\\quad \\tau = ${fmt(tau)}` : ''}` }, check: ok('The formulas use exact derivatives; only the evaluation is floating-point.'), marks: { points: [{ at: P }], arrows: [{ from: P, vec: r1 }] }, notes: [] };
}

async function taskArcLength(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const { comps, t } = curveComponents(an);
  const lo = params.lo ?? 0, hi = params.hi ?? 1;
  const d1 = comps.map((c) => derivative(c, t));
  const speed = call('sqrt', d1.map((d) => pow(d, num(2))).reduce((s, v) => add(s, v)));
  const S = compile(speed, [t], fixed);
  const q = quad((u) => S([u]), lo, hi, 1e-10);
  const steps: WorkStep[] = [
    { title: 'Speed', rule: 'Arc length element', tex: `|\\mathbf r'(${symbolTeX(t)})| = ${T(simplify(speed))}`, detail: 'Arc length adds up speed × time.', hint: 'L = ∫ |r′(t)| dt.' },
    { title: 'Numerical value', rule: 'Adaptive Gauss–Kronrod', tex: `L = \\int_{${fmt(lo, 4)}}^{${fmt(hi, 4)}} |\\mathbf r'|\\,d${symbolTeX(t)} \\approx ${fmt(q.value, 12)} \\pm ${fmt(q.error, 2)}`, check: numerical('Quadrature with an error estimate.') },
  ];
  let check: Check = numerical('Numerical (quadrature); arc-length integrals rarely have closed forms.');
  let answer = { label: 'Arc length (numerical)', tex: `L \\approx ${fmt(q.value, 12)}` };
  try {
    const r = await (ctx.integrate ?? integrateSymbolic)(simplify(speed), t, fixed, lo, hi);
    if (r.definite?.exactTex && r.definite.agrees) {
      steps.push({ title: 'Exact value', rule: 'SymPy integrate', tex: `L = ${r.definite.exactTex}`, check: ok('Agrees with quadrature.') });
      check = ok('SymPy’s exact value agrees with quadrature.');
      answer = { label: 'Arc length', tex: `L = ${r.definite.exactTex} \\approx ${fmt(q.value, 10)}` };
    }
  } catch { /* numerical answer stands */ }
  return { task: 'arclength', engine: 'Quadrature; SymPy where a closed form exists', steps, answer, check, notes: [] };
}

function taskDivCurl(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const comps = an.exprs;
  const vars = an.vars.length >= comps.length ? an.vars.slice(0, comps.length) : ['x', 'y', 'z'].slice(0, comps.length);
  const L = ['P', 'Q', 'R'];
  const steps: WorkStep[] = [];
  const D: Record<string, DiffWork> = {};
  const need: [number, number][] = comps.length === 2 ? [[0, 0], [1, 1], [1, 0], [0, 1]] : [[0, 0], [1, 1], [2, 2], [2, 1], [1, 2], [0, 2], [2, 0], [1, 0], [0, 1]];
  for (const [i, j] of need) {
    const w = differentiateWithSteps(comps[i], vars[j], { partial: true, fixed });
    D[`${i}${j}`] = w;
    steps.push({ title: `∂${L[i]}/∂${vars[j]}`, rule: 'Partial derivative', tex: `\\frac{\\partial ${L[i]}}{\\partial ${symbolTeX(vars[j])}} = \\frac{\\partial}{\\partial ${symbolTeX(vars[j])}}\\left[${T(comps[i])}\\right] = ${T(w.result)}`, detail: w.steps.length > 1 ? `Rules: ${rulesUsed(w.tree).join(', ')}.` : '', hint: `Differentiate ${L[i]} with respect to ${vars[j]}, others fixed.`, check: checkOfDiff(w) });
  }
  const r = (i: number, j: number) => D[`${i}${j}`].result;
  const divN = simplify(comps.length === 2 ? add(r(0, 0), r(1, 1)) : add(add(r(0, 0), r(1, 1)), r(2, 2)));
  const curlN: Node[] = comps.length === 2 ? [simplify(sub(r(1, 0), r(0, 1)))] : [simplify(sub(r(2, 1), r(1, 2))), simplify(sub(r(0, 2), r(2, 0))), simplify(sub(r(1, 0), r(0, 1)))];
  const p = [params.x0 ?? 1, params.y0 ?? 0.5, params.z0 ?? 0.5].slice(0, vars.length);
  const at = (n: Node) => compile(n, vars, fixed)(p);
  steps.push({ title: 'Divergence', rule: 'Sum of the diagonal partials', tex: `\\nabla\\cdot\\mathbf F = ${T(divN)}\\quad (= ${fmt(at(divN))} \\text{ at the point})`, detail: 'Net outflow per unit volume (area): positive is a source, negative a sink.' });
  steps.push({ title: 'Curl', rule: comps.length === 2 ? 'Scalar curl Q_x − P_y' : 'The curl determinant', tex: comps.length === 2 ? `\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = ${T(curlN[0])}\\quad (= ${fmt(at(curlN[0]))})` : `\\nabla\\times\\mathbf F = \\left(${curlN.map(T).join(',\\ ')}\\right)`, detail: 'Twice the local angular velocity of the flow; zero curl on a simply connected region means F is a gradient.' });
  return { task: 'divcurl', engine: 'MathVerse step differentiator (partial derivatives)', steps, answer: { label: 'Divergence and curl', tex: `\\nabla\\cdot\\mathbf F = ${T(divN)},\\quad ${comps.length === 2 ? `\\operatorname{curl}\\mathbf F = ${T(curlN[0])}` : `\\nabla\\times\\mathbf F = \\left(${curlN.map(T).join(',\\ ')}\\right)`}` }, check: worst(...Object.values(D).map(checkOfDiff)), marks: { points: [{ at: p }] }, notes: [] };
}

function taskTangents(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const [u, v] = an.vars;
  const ru = an.exprs.map((c) => differentiateWithSteps(c, u, { partial: true, fixed }));
  const rv = an.exprs.map((c) => differentiateWithSteps(c, v, { partial: true, fixed }));
  const p = [params.x0 ?? 1, params.y0 ?? 1];
  const at = (n: Node) => compile(n, [u, v], fixed)(p);
  const Ru = ru.map((w) => at(w.result)), Rv = rv.map((w) => at(w.result));
  const N = [Ru[1] * Rv[2] - Ru[2] * Rv[1], Ru[2] * Rv[0] - Ru[0] * Rv[2], Ru[0] * Rv[1] - Ru[1] * Rv[0]];
  const E = Ru.reduce((s, a) => s + a * a, 0), F = Ru.reduce((s, a, i) => s + a * Rv[i], 0), G = Rv.reduce((s, a) => s + a * a, 0);
  const P = an.exprs.map(at);
  const steps: WorkStep[] = [
    { title: `\\mathbf r_${u}`, rule: 'Partial derivatives', tex: `\\mathbf r_{${symbolTeX(u)}} = \\left(${ru.map((w) => T(w.result)).join(',\\ ')}\\right)`, detail: `Rules: ${[...new Set(ru.flatMap((w) => rulesUsed(w.tree)))].join(', ')}.`, check: worst(...ru.map(checkOfDiff)), hint: `Differentiate each component in ${u}.` },
    { title: `\\mathbf r_${v}`, rule: 'Partial derivatives', tex: `\\mathbf r_{${symbolTeX(v)}} = \\left(${rv.map((w) => T(w.result)).join(',\\ ')}\\right)`, detail: `Rules: ${[...new Set(rv.flatMap((w) => rulesUsed(w.tree)))].join(', ')}.`, check: worst(...rv.map(checkOfDiff)), hint: `Differentiate each component in ${v}.` },
    { title: 'Normal vector at the point', rule: 'Cross product', tex: `\\mathbf r_{${symbolTeX(u)}}\\times\\mathbf r_{${symbolTeX(v)}} = \\left(${N.map((x) => fmt(x)).join(',\\ ')}\\right)`, detail: N.every((x) => Math.abs(x) < 1e-12) ? 'Zero: the parametrization is singular here (like the poles of a sphere).' : 'Perpendicular to the surface; its length is the area-scaling factor dA = |r_u × r_v| du dv.' },
    { title: 'First fundamental form', rule: 'Metric', tex: `E = ${fmt(E)},\\ F = ${fmt(F)},\\ G = ${fmt(G)},\\quad ds^2 = E\\,du^2 + 2F\\,du\\,dv + G\\,dv^2`, detail: 'Lengths and angles on the surface, measured from inside it.' },
  ];
  return { task: 'tangents', engine: 'MathVerse step differentiator', steps: steps.map((s) => ({ ...s, title: s.title.replace(/\\mathbf r_/, 'r_') })), answer: { label: 'Tangent vectors', tex: `\\mathbf r_{${symbolTeX(u)}} = \\left(${ru.map((w) => T(w.result)).join(',\\ ')}\\right),\\ \\mathbf r_{${symbolTeX(v)}} = \\left(${rv.map((w) => T(w.result)).join(',\\ ')}\\right)` }, check: worst(...ru.map(checkOfDiff), ...rv.map(checkOfDiff)), marks: { points: [{ at: P }], arrows: [{ from: P, vec: N.map((x) => x / (Math.hypot(...N) || 1)) }] }, notes: [] };
}

function taskGradient(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const f = an.exprs[0];
  const vars = an.vars;
  const steps: WorkStep[] = [];
  const ws = vars.map((v) => { const b = partialBlock(f, v, fixed, `∂F/∂${v}`); steps.push(...b.steps); return b.w; });
  const p = [params.x0 ?? 1, params.y0 ?? 0.5, params.z0 ?? 0.5].slice(0, vars.length);
  const g = ws.map((w) => compile(w.result, vars, fixed)(p));
  steps.push({ title: 'Gradient at the point', rule: 'Normal to the level set', tex: `\\nabla F = \\left(${g.map((x) => fmt(x)).join(',\\ ')}\\right)`, detail: 'The gradient is perpendicular to the level surface F = const through the point.' });
  return { task: 'gradient', engine: 'MathVerse step differentiator', steps, answer: { label: 'Gradient', tex: `\\nabla F = \\left(${ws.map((w) => T(w.result)).join(',\\ ')}\\right)` }, check: worst(...ws.map(checkOfDiff)), notes: [] };
}

// ── linear algebra ──────────────────────────────────────────────────────────

function matrixOf(an: Analysis, params: Record<string, number>): number[][] {
  const m = an.exprs[0];
  if (m.t !== 'matrix') throw new Error('Not a matrix');
  const fixed = fixedOf(an, params);
  return m.rows.map((r) => r.map((e) => evaluate(e, fixed)));
}

function rrefWorkSteps(A: Mat, bar?: number, vars?: string[]): { steps: WorkStep[]; work: ReturnType<typeof rrefSteps> } {
  const work = rrefSteps(A);
  const steps: WorkStep[] = [{ title: 'Start', rule: bar !== undefined ? 'Augmented matrix' : 'The matrix', tex: matrixTeX(work.start, bar), detail: work.exact ? 'Exact fractions throughout.' : 'Entries are not short decimals, so arithmetic is floating-point (shown to 6 digits).', hint: 'Write the matrix down; work column by column.', visual: vars && bar !== undefined ? { k: 'rows', rows: work.startValues, vars } : undefined }];
  for (const s of work.steps) {
    steps.push({ title: s.kind === 'swap' ? 'Swap rows' : s.kind === 'scale' ? 'Scale the pivot row' : 'Eliminate', rule: s.kind === 'swap' ? 'Row interchange' : s.kind === 'scale' ? 'Row scaling' : 'Row replacement', tex: `${s.op}:\\quad ${matrixTeX(s.matrix, bar, s.pivot)}`, detail: s.words + (vars && bar !== undefined && s === work.steps[0] ? ' Row operations never change the solution set: click a step — the lines (planes) move, but still meet in the same place.' : ''), hint: s.kind === 'eliminate' ? `Make the entry below/above the pivot in column ${s.pivot[1] + 1} zero.` : s.kind === 'scale' ? 'Make the pivot 1.' : 'Choose a pivot for the next column.', visual: vars && bar !== undefined ? { k: 'rows', rows: s.values, vars } : undefined });
  }
  return { steps, work };
}

function taskRref(ctx: RunCtx): Work {
  const A = matrixOf(ctx.an, ctx.params);
  const { steps, work } = rrefWorkSteps(A);
  const rank = work.pivots.length;
  steps.push({ title: 'Reduced row echelon form', rule: 'RREF', tex: matrixTeX(work.R), detail: `Pivot columns: ${work.pivots.map((p) => p + 1).join(', ') || 'none'}. Rank ${rank}; nullity ${A[0].length - rank}.`, check: work.agreesWithEngine ? ok('Identical to linalg.ts’s rref (floating point) to 1e−8.') : bad('Differs from linalg.ts’s rref.') });
  return { task: 'rref', engine: 'Gauss–Jordan elimination (as linalg.ts), exact fractions', steps, answer: { label: `RREF (rank ${rank})`, tex: matrixTeX(work.R) }, check: work.agreesWithEngine ? ok('The exact reduction agrees with MathVerse’s floating-point rref.') : bad('Disagrees with the floating-point rref.'), notes: [] };
}

async function taskDet(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const m = an.exprs[0];
  if (m.t !== 'matrix' || m.rows.length !== m.rows[0].length) throw new Error('The determinant needs a square matrix');
  const A = matrixOf(an, params);
  const steps: WorkStep[] = [];
  const nd = detNum(A);
  let answerTeX: string, check: Check;
  const exact = an.params.length ? null : detSteps(A);
  if (exact) {
    steps.push(...exact.steps.map((s) => ({ title: s.title, rule: 'Cofactor expansion', tex: s.tex, hint: A.length === 2 ? 'ad − bc.' : 'Expand along a row: alternate signs, multiply by minors.' })));
    answerTeX = `\\det A = ${exact.tex}`;
    check = Math.abs(exact.value - nd) <= 1e-9 * Math.max(1, Math.abs(nd)) ? ok(`Agrees with LU factorization (${fmt(nd, 12)}).`) : bad(`LU gives ${fmt(nd)}.`);
  } else {
    const names = namesOf(m);
    const r = await ctx.cas.call<{ det: CasOut }>('eigen', { matrix: toSympy(m), names });
    const dn = readCas(r.det, names);
    let dv = NaN; try { dv = dn ? evaluate(dn, fixedOf(an, params)) : NaN; } catch { /* */ }
    steps.push({ title: 'Symbolic determinant', rule: 'SymPy', tex: `\\det A = ${r.det.latex}` });
    answerTeX = `\\det A = ${r.det.latex}`;
    check = Number.isFinite(dv) && Math.abs(dv - nd) <= 1e-9 * Math.max(1, Math.abs(nd)) ? ok(`At the current parameter values it equals LU’s ${fmt(nd)}.`) : unv('Could not compare with LU.');
  }
  steps.push({ title: 'What it means', rule: 'Geometry', tex: `|\\det A| = ${fmt(Math.abs(nd))}`, detail: nd === 0 ? 'Zero: A squashes space flat — it is not invertible.' : `A scales ${A.length === 2 ? 'areas' : 'volumes'} by ${fmt(Math.abs(nd))}${nd < 0 ? ' and flips orientation (a mirror image)' : ''}.`, visual: A.length === 2 ? { k: 'matrix', M: A } : undefined });
  return { task: 'det', engine: 'Exact cofactor expansion; LU check', steps, answer: { label: 'Determinant', tex: answerTeX }, check, notes: [] };
}

function taskInverse(ctx: RunCtx): Work {
  const A = matrixOf(ctx.an, ctx.params);
  const n = A.length;
  if (n !== A[0].length) throw new Error('Only a square matrix can have an inverse');
  const aug = A.map((r, i) => [...r, ...r.map((_, j) => (i === j ? 1 : 0))]);
  const { steps, work } = rrefWorkSteps(aug, n);
  steps[0].title = 'Augment with the identity';
  steps[0].detail = 'Row-reduce [A | I]. If the left half becomes I, the right half is A⁻¹.';
  if (work.pivots.length < n || work.pivots.some((p, i) => p !== i)) {
    steps.push({ title: 'Not invertible', tex: matrixTeX(work.R, n), detail: 'The left half cannot become I: A has rank ' + work.pivots.filter((p) => p < n).length + '.' });
    return { task: 'inverse', engine: 'Gauss–Jordan', steps, answer: { label: 'Inverse', tex: '\\text{A is singular — no inverse}' }, check: ok(`det A = ${fmt(detNum(A))} (LU).`), notes: [] };
  }
  const inv = work.R.map((r) => r.slice(n)), invV = work.Rvalues.map((r) => r.slice(n));
  const I = matmul(A, invV);
  const err = Math.max(...I.flatMap((r, i) => r.map((v, j) => Math.abs(v - (i === j ? 1 : 0)))));
  const check = err < 1e-9 ? ok(`A·A⁻¹ = I to ${fmt(err, 2)}.`) : bad(`A·A⁻¹ differs from I by ${fmt(err, 2)}.`);
  steps.push({ title: 'Read off the inverse', rule: 'Right half', tex: `A^{-1} = ${matrixTeX(inv)}`, check });
  return { task: 'inverse', engine: 'Gauss–Jordan on [A | I], exact fractions', steps, answer: { label: 'Inverse', tex: `A^{-1} = ${matrixTeX(inv)}` }, check, notes: [] };
}

/** Evaluate a SymPy number that may contain I (a + b·I), linear in I. */
function complexOf(o: CasOut, names: string[], fixed: Record<string, number>): [number, number] | null {
  const s = o.text.replace(/\bI\b/g, 'iunit');
  let n: Node;
  try { n = parse(s, { names: [...names, 'iunit'] }); } catch { return null; }
  try {
    const re = evaluate(substitute(n, { iunit: num(0) }), fixed);
    const im = evaluate(substitute(derivative(n, 'iunit'), { iunit: num(0) }), fixed);
    if (freeSymbols(derivative(derivative(n, 'iunit'), 'iunit')).size || !Number.isFinite(re) || !Number.isFinite(im)) return Number.isFinite(re) && Number.isFinite(im) ? [re, im] : null;
    return [re, im];
  } catch { return null; }
}

async function taskEigen(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const m = an.exprs[0];
  if (m.t !== 'matrix' || m.rows.length !== m.rows[0].length) throw new Error('Eigenvalues need a square matrix');
  const A = matrixOf(an, params);
  const fixed = fixedOf(an, params);
  const names = namesOf(m);
  const r = await ctx.cas.call<{ eigen: { value: CasOut; multiplicity: number; vectors: CasOut[][] }[]; charpoly: CasOut; det: CasOut }>('eigen', { matrix: toSympy(m), names });
  const steps: WorkStep[] = [
    { title: 'Characteristic polynomial', rule: 'det(A − λI) = 0', tex: `p(\\lambda) = \\det(A - \\lambda I) = ${r.charpoly.latex}`, detail: 'λ is an eigenvalue exactly when A − λI is singular.', hint: 'Eigenvalues make A − λI singular: set its determinant to zero.' },
  ];
  const numeric = eig(A);
  const checks: Check[] = [];
  const vecsForPic: { v: number[]; label: string }[] = [];
  for (const e of r.eigen) {
    const c = complexOf(e.value, names, fixed);
    let check: Check;
    if (!c) check = unv('Not evaluable here.');
    else {
      const match = numeric.some((q) => Math.abs(q.re - c[0]) < 1e-7 * Math.max(1, Math.abs(c[0])) && Math.abs(q.im - c[1]) < 1e-7 * Math.max(1, Math.abs(c[1])));
      if (Math.abs(c[1]) > 1e-12) check = match ? ok('Matches MathVerse’s QR eigenvalues (complex pair).') : bad('Not among MathVerse’s numerical eigenvalues.');
      else {
        // A v = λ v for each exact eigenvector
        let worst_ = 0, okv = true;
        for (const vec of e.vectors) {
          const v = vec.map((o) => { const n = readCas(o, names); try { return n ? evaluate(n, fixed) : NaN; } catch { return NaN; } });
          if (!v.every(Number.isFinite)) { okv = false; continue; }
          const Av = A.map((row) => row.reduce((s, a, j) => s + a * v[j], 0));
          worst_ = Math.max(worst_, ...Av.map((x, i) => Math.abs(x - c[0] * v[i])));
          if (v.length === 2) vecsForPic.push({ v, label: `λ = ${fmt(c[0], 4)}` });
        }
        check = match && okv && worst_ < 1e-9 * Math.max(1, ...A.flat().map(Math.abs)) ? ok(`Av = λv holds (residual ${fmt(worst_, 2)}) and λ matches MathVerse’s QR eigenvalues.`) : !match ? bad('Not among MathVerse’s numerical eigenvalues.') : unv('An eigenvector could not be evaluated.');
      }
    }
    checks.push(check);
    steps.push({ title: `λ = ${e.value.text}${e.multiplicity > 1 ? ` (multiplicity ${e.multiplicity})` : ''}`, rule: 'Null space of A − λI', tex: `\\lambda = ${e.value.latex}:\\quad ${e.vectors.map((v) => `\\mathbf v = \\begin{bmatrix}${v.map((o) => o.latex).join(' \\\\ ')}\\end{bmatrix}`).join(',\\ ')}`, detail: e.vectors.length < e.multiplicity ? 'Fewer independent eigenvectors than the multiplicity: A is not diagonalizable.' : 'Solve (A − λI)v = 0; any nonzero multiple of v works.', check, hint: 'Solve (A − λI)v = 0 for each eigenvalue.', visual: A.length === 2 ? { k: 'matrix', M: A, vectors: vecsForPic.slice() } : undefined });
  }
  return { task: 'eigen', engine: 'SymPy eigenvects; checked against Av = λv and MathVerse’s QR algorithm', steps, answer: { label: 'Eigenvalues', tex: r.eigen.map((e) => `\\lambda = ${e.value.latex}${e.multiplicity > 1 ? `\\ (\\times ${e.multiplicity})` : ''}`).join(',\\quad ') }, check: checks.length ? worst(...checks) : unv('No eigenvalues returned.'), notes: [] };
}

function taskSystem(ctx: RunCtx): Work {
  const sys = ctx.an.system!;
  const aug = sys.A.map((r, i) => [...r, sys.b[i]]);
  const { steps, work } = rrefWorkSteps(aug, sys.vars.length, sys.vars);
  const sol = solutionFromRref(work, sys.vars);
  let check: Check;
  if (sol.kind === 'none') check = ok('The reduced matrix has a row 0 = nonzero: the equations contradict each other.');
  else {
    const res = residualOf(sys.A, sys.b, sol.x!);
    const sub_ = sys.residuals.map((e) => compile(e, sys.vars)(sol.x!));
    const worst_ = Math.max(res, ...sub_.map(Math.abs));
    check = worst_ < 1e-9 * Math.max(1, ...aug.flat().map(Math.abs)) ? ok(`Substituted into every original equation: residual ${fmt(worst_, 2)}.${work.agreesWithEngine ? ' The reduction matches linalg.ts’s rref.' : ''}`) : bad(`Substituting back leaves ${fmt(worst_)}.`);
  }
  steps.push({ title: sol.kind === 'unique' ? 'Read off the solution' : sol.kind === 'none' ? 'Inconsistent' : 'Infinitely many solutions', rule: 'Back-substitution (already done by RREF)', tex: sol.tex, detail: sol.kind === 'infinite' ? 'Free variables can take any value; the pivot variables follow.' : '', check, visual: { k: 'rows', rows: work.Rvalues, vars: sys.vars, solution: sol.x } });
  return { task: 'system', engine: 'Gauss–Jordan elimination (as linalg.ts), exact fractions', steps, answer: { label: sol.kind === 'unique' ? 'Solution' : sol.kind === 'none' ? 'No solution' : 'Solutions', tex: sol.tex }, check, marks: sol.x ? { points: [{ at: sol.x }] } : {}, notes: [] };
}

// ── differential equations ──────────────────────────────────────────────────

const ODE_METHODS: Record<string, string> = {
  separable: 'Separable: move all y to one side, all t to the other, and integrate both.',
  '1st_linear': 'First-order linear: multiply by the integrating factor e^{∫p dt}.',
  Bernoulli: 'Bernoulli: the substitution v = y^{1−n} makes it linear.',
  '1st_exact': 'Exact: M dt + N dy = 0 with M_y = N_t is the differential of a potential.',
  Riccati_special_minus2: 'A special Riccati equation.',
  '1st_homogeneous_coeff_best': 'Homogeneous coefficients: substitute y = u·t.',
  nth_linear_constant_coeff_homogeneous: 'Linear with constant coefficients: try y = e^{rt}; the characteristic equation gives r.',
  nth_linear_constant_coeff_undetermined_coefficients: 'Constant coefficients with a forcing term: homogeneous solution plus a particular solution by undetermined coefficients.',
  nth_linear_constant_coeff_variation_of_parameters: 'Constant coefficients with forcing: variation of parameters.',
  nth_linear_euler_eq_homogeneous: 'Cauchy–Euler: try y = t^r.',
  factorable: 'The equation factors into simpler ones.',
  nth_algebraic: 'Solved algebraically for the derivative, then integrated.',
  almost_linear: 'Almost linear: a substitution makes it linear.',
  '1st_power_series': 'Power series.', lie_group: 'Lie symmetry method.',
  nth_order_reducible: 'The dependent variable is missing: reduce the order.',
};

const METHOD_ORDER = ['nth_linear_constant_coeff_homogeneous', 'nth_linear_constant_coeff_undetermined_coefficients', 'nth_linear_constant_coeff_variation_of_parameters',
  'nth_linear_euler_eq_homogeneous', 'separable', '1st_linear', 'Bernoulli', '1st_exact', '1st_homogeneous_coeff_best', 'Riccati_special_minus2', 'nth_order_reducible', 'almost_linear', 'nth_algebraic', 'factorable'];

async function taskDsolve(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const y = an.dependent![0], t = an.vars[0];
  const order = an.kind === 'ode2' ? 2 : 1;
  const rhs = an.exprs[0];
  const yp = `${y}_p`;
  const names = [...new Set([...namesOf(rhs), y, t])];
  const t0 = params.t0 ?? 0, y0 = params.icY ?? 1, v0 = params.icV ?? 0, T1 = t0 + (params.T ?? 8);
  const Y = symbolTeX(y), Tt = symbolTeX(t);
  const rhsTeX = T(rhs).replace(new RegExp(`${y}_\\{p\\}`, 'g'), `${Y}'`);
  const steps: WorkStep[] = [{ title: 'Standard form', rule: order === 1 ? 'Solve for the derivative' : 'Solve for the highest derivative', tex: `${Y}${order === 1 ? "'" : "''"} = ${rhsTeX}`, hint: 'Isolate the highest derivative.' }];
  const call_ = (ics: Record<string, number> | null) => ctx.cas.call<{ solution: CasOut; classification: string[] }>('dsolve', { rhs: toSympy(rhs), names, dep: y, var: t, order, ics });
  const general = await call_(null);
  const methods = general.classification.filter((m) => !/_Integral$/.test(m));
  // the method a course would name: prefer the textbook ones over SymPy's generic 'factorable'
  const main = METHOD_ORDER.find((m) => methods.includes(m)) ?? methods[0];
  steps.push({ title: 'Classify', rule: 'SymPy classify_ode', tex: methods.slice(0, 3).map((m) => `\\text{${m.replace(/_/g, ' ')}}`).join(',\\ '), detail: (main && ODE_METHODS[main]) || 'SymPy recognizes the type and picks a method.', hint: 'What type of equation is it? (separable, linear, constant coefficients …)' });
  steps.push({ title: 'General solution', rule: `SymPy dsolve${main ? ` (${main.replace(/_/g, ' ')})` : ''}`, tex: `${Y}(${Tt}) = ${general.solution.latex}`, detail: `$C_1${order === 2 ? ', C_2' : ''}$ ${order === 2 ? 'are' : 'is an'} arbitrary constant${order === 2 ? 's' : ''}: one per order.`, hint: 'Solve; keep the constants.' });
  const ics: Record<string, number> = order === 2 ? { t0, y0, v0 } : { t0, y0 };
  let part: CasOut | null = null, err = '';
  try { part = (await call_(ics)).solution; } catch (e) { err = (e as Error).message; }
  // numerical solution from the same initial condition
  const f = order === 1 ? compile(rhs, [t, y], fixed) : compile(rhs, [t, y, yp], fixed);
  const tr = solveAdaptive(order === 1 ? (s, u) => [f([s, u[0]])] : (s, u) => [u[1], f([s, u[0], u[1]])], order === 1 ? [y0] : [y0, v0], t0, T1, { maxStep: (T1 - t0) / 200 });
  const numericPts: [number, number][] = tr.t.map((s, i) => [s, tr.y[i][0]]);
  let check: Check = unv(err ? `SymPy could not apply the initial condition: ${err}` : 'Not checked.');
  const marks: Marks = { numeric: numericPts };
  if (part) {
    const Ys = readCas(part, names.filter((n) => n !== y));
    steps.push({ title: 'Apply the initial condition', rule: 'Solve for the constants', tex: `${Y}(${fmt(t0, 4)}) = ${fmt(y0, 4)}${order === 2 ? `,\\ ${Y}'(${fmt(t0, 4)}) = ${fmt(v0, 4)}` : ''}\\ \\Rightarrow\\ ${Y}(${Tt}) = ${part.latex}`, hint: 'Plug in t₀ and solve for the constants.' });
    if (Ys) {
      // substitute back into the ODE
      const d1 = derivative(Ys, t), d2 = order === 2 ? derivative(d1, t) : null;
      const lhs = order === 1 ? d1 : d2!;
      const rs = substitute(rhs, { [y]: Ys, [yp]: d1 });
      const resid = agree(lhs, rs, [t], fixed, Array.from({ length: 9 }, (_, i) => t0 + ((T1 - t0) * (i + 0.31)) / 9));
      const Yf = compile(Ys, [t], fixed);
      let maxDiff = 0, scale = 1;
      for (const [s, v] of numericPts) { const e = Yf([s]); if (Number.isFinite(e) && Number.isFinite(v)) { maxDiff = Math.max(maxDiff, Math.abs(e - v)); scale = Math.max(scale, Math.abs(v)); } }
      const icOk = Math.abs(Yf([t0]) - y0) < 1e-9 * Math.max(1, Math.abs(y0));
      steps.push({ title: 'Verify by substitution', rule: 'Differentiate the answer (MathVerse)', tex: `${Y}${order === 1 ? "'" : "''"} = ${T(lhs)}`, detail: `Substituted into the equation, the two sides agree at ${resid.points} times between t₀ and t₀ + T${resid.ok ? '' : ' — NOT within tolerance'}; the initial condition ${icOk ? 'holds' : 'does not hold'}.`, check: resid.ok && icOk ? ok('The solution satisfies the ODE and the initial condition.') : bad('The solution failed the substitution check.') });
      steps.push({ title: 'Compare with a numerical solution', rule: 'Dormand–Prince 5(4)', tex: `\\max_{t} |${Y}_{\\text{exact}} - ${Y}_{\\text{numerical}}| = ${fmt(maxDiff, 2)}`, detail: `A numerical solution from the same initial condition, ${tr.t.length} steps, relative tolerance 1e−8${tr.warning ? ` (${tr.warning})` : ''}.`, check: numerical('Numerical ODE solution.') });
      check = resid.ok && icOk && maxDiff <= 1e-5 * scale ? ok(`Satisfies the ODE and the initial condition, and matches the numerical solution to ${fmt(maxDiff, 2)}.`) : resid.ok && icOk ? unv(`Satisfies the ODE, but differs from the numerical solution by ${fmt(maxDiff, 2)} (stiffness or blow-up?).`) : bad('The solution did not pass the substitution check.');
      marks.curve = Ys;
    } else check = unv('SymPy’s solution uses a form MathVerse cannot evaluate (implicit, special functions) — compare with the numerical curve.');
  }
  return { task: 'dsolve', engine: 'SymPy dsolve; verified by substitution and a numerical solution', steps, answer: { label: part ? 'Solution of the initial-value problem' : 'General solution', tex: `${Y}(${Tt}) = ${(part ?? general.solution).latex}` }, check, marks, notes: [] };
}

function taskPhase(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const deps = an.dependent!;
  const t = an.vars[0];
  const fixedT = { ...fixed, [t]: 0 };
  const eqs = an.exprs;
  const steps: WorkStep[] = [{ title: 'Equilibria: set every rate to zero', rule: 'Fixed points', tex: eqs.map((e, i) => `${T(e)} = 0`).join(',\\quad '), hint: 'Where does nothing change?' }];
  const J = eqs.map((e) => deps.map((d) => derivative(e, d)));
  steps.push({ title: 'The Jacobian (exact)', rule: 'Linearization', tex: `J = \\begin{bmatrix}${J.map((r) => r.map(T).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`, detail: 'Near an equilibrium the system behaves like its linearization u′ = J u.' });
  const pts = newtonAll(eqs, deps, fixedT, 4, deps.length <= 2 ? 9 : 5);
  const out: string[] = [];
  for (const p of pts) {
    const Jm = J.map((r) => r.map((e) => compile(e, deps, fixedT)(p)));
    const ev = eig(Jm);
    const reMax = Math.max(...ev.map((e) => e.re)), reMin = Math.min(...ev.map((e) => e.re)), cx = ev.some((e) => Math.abs(e.im) > 1e-10);
    const kind = deps.length === 2 ? (reMax > 1e-10 && reMin < -1e-10 ? 'saddle (unstable)' : cx ? (Math.abs(reMax) < 1e-10 ? 'center (linearization inconclusive)' : reMax < 0 ? 'stable spiral' : 'unstable spiral') : reMax < -1e-10 ? 'stable node' : reMin > 1e-10 ? 'unstable node' : 'degenerate (inconclusive)') : reMax < -1e-10 ? 'asymptotically stable' : reMax > 1e-10 ? 'unstable' : 'inconclusive';
    out.push(kind);
    steps.push({ title: `(${p.map((v) => fmt(v, 5)).join(', ')})`, rule: 'Eigenvalues of J', depth: 1, tex: `\\lambda = ${ev.map((e) => (Math.abs(e.im) > 1e-12 ? `${fmt(e.re, 5)} ${e.im < 0 ? '-' : '+'} ${fmt(Math.abs(e.im), 5)}i` : fmt(e.re, 5))).join(',\\ ')} \\Rightarrow \\text{${kind}}`, check: numerical('Equilibrium located by Newton’s method; eigenvalues by QR.') });
  }
  if (!pts.length) steps.push({ title: 'No equilibria found in [−4, 4]ⁿ', detail: 'Numerical search (Newton, multi-start).' });
  return { task: 'phase', engine: 'Exact Jacobian; numerical equilibria and eigenvalues', steps, answer: { label: 'Equilibria (numerical)', tex: pts.length ? pts.map((p, i) => `(${p.map((v) => fmt(v, 5)).join(', ')})\\ \\text{${out[i]}}`).join(',\\ ') : '\\text{none found}' }, check: numerical('Locations and eigenvalues are numerical; the Jacobian is exact.'), marks: { points: pts.map((p) => ({ at: p })) }, notes: [] };
}

function taskSeparate(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const c = an.classified!;
  const pde = c.pde!;
  const fixed = fixedOf(an, params);
  const k = Math.max(1, Math.round(params.k ?? 1));
  const K = num(k);
  const X = sym('x'), Y = sym('y'), Tm = sym('t');
  const coeff = pde.coeff;
  let u: Node, residual: (u: Node) => Node, steps: WorkStep[];
  const dxx = (n: Node) => derivative(derivative(n, 'x'), 'x'), dyy = (n: Node) => derivative(derivative(n, 'y'), 'y');
  const dt = (n: Node) => derivative(n, 't'), dtt = (n: Node) => derivative(derivative(n, 't'), 't');
  const kk = k === 1 ? '' : String(k);
  switch (pde.family) {
    case 'heat':
      u = pde.dims === 1 ? mul(call('exp', neg(mul(mul(coeff, pow(K, num(2))), Tm))), call('sin', mul(K, X)))
        : mul(call('exp', neg(mul(mul(coeff, num(2 * k * k)), Tm))), mul(call('sin', mul(K, X)), call('sin', mul(K, Y))));
      residual = (n) => sub(dt(n), mul(coeff, pde.dims === 1 ? dxx(n) : add(dxx(n), dyy(n))));
      steps = [
        { title: 'Assume a product', rule: 'Separation of variables', tex: pde.dims === 1 ? 'u(x,t) = X(x)\\,T(t)' : 'u = X(x)\\,Y(y)\\,T(t)', hint: 'Try u = X(x)T(t).' },
        { title: 'Separate', rule: 'Divide by u', tex: pde.dims === 1 ? `\\frac{T'}{${T(coeff)}\\,T} = \\frac{X''}{X} = -k^2` : `\\frac{T'}{${T(coeff)}\\,T} = \\frac{X''}{X} + \\frac{Y''}{Y} = -2k^2`, detail: 'A function of t alone equals a function of x alone, so both are the same constant; a negative constant gives oscillation in space and decay in time.' },
        { title: 'Solve the two ODEs', rule: 'Constant-coefficient ODEs', tex: `X = \\sin(k x),\\quad T = e^{-${T(coeff)}\\,${pde.dims === 1 ? '' : '2'}k^2 t}`, detail: 'With u = 0 at x = 0 and x = π, k must be a whole number.' },
      ];
      break;
    case 'wave': {
      const w = mul(call('sqrt', coeff), K);
      u = pde.dims === 1 ? mul(call('sin', mul(K, X)), call('cos', mul(w, Tm))) : mul(mul(call('sin', mul(K, X)), call('sin', mul(K, Y))), call('cos', mul(mul(w, call('sqrt', num(2))), Tm)));
      residual = (n) => sub(dtt(n), mul(coeff, pde.dims === 1 ? dxx(n) : add(dxx(n), dyy(n))));
      steps = [
        { title: 'Assume a product', rule: 'Separation of variables', tex: 'u = X(x)\\,T(t)', hint: 'Try u = X(x)T(t).' },
        { title: 'Separate', rule: 'Divide by u', tex: `\\frac{T''}{${T(coeff)}\\,T} = \\frac{X''}{X} = -k^2`, detail: 'Both sides equal a constant; a negative one gives standing waves.' },
        { title: 'Solve the two ODEs', rule: 'Simple harmonic motion', tex: `X = \\sin(kx),\\quad T = \\cos(\\sqrt{${T(coeff)}}\\,k${pde.dims === 2 ? '\\sqrt2' : ''}\\,t)`, detail: 'A standing wave: the mode shape sin(kx) oscillates in time.' },
      ];
      break;
    }
    case 'laplace':
      u = mul(call('sin', mul(K, X)), call('sinh', mul(K, Y)));
      residual = (n) => add(dxx(n), dyy(n));
      steps = [
        { title: 'Assume a product', rule: 'Separation of variables', tex: 'u = X(x)\\,Y(y)', hint: 'Try u = X(x)Y(y).' },
        { title: 'Separate', rule: 'Divide by u', tex: `\\frac{X''}{X} = -\\frac{Y''}{Y} = -k^2`, detail: 'Oscillating in x forces exponential (sinh, cosh) behaviour in y.' },
        { title: 'Solve', rule: 'Constant-coefficient ODEs', tex: 'X = \\sin(kx),\\quad Y = \\sinh(ky)' },
      ];
      break;
    case 'advection': {
      const negSign = /=\s*-/.test(c.tex);
      const cs = negSign ? coeff : neg(coeff);
      u = call('sin', mul(K, sub(X, mul(cs, Tm))));
      residual = (n) => add(dt(n), mul(cs, derivative(n, 'x')));
      steps = [{ title: 'Characteristics', rule: 'Method of characteristics', tex: `u(x,t) = g(x - ${T(cs)}\\,t)`, detail: 'Any profile g is carried along unchanged at speed c.', hint: 'Look for solutions that are constant along lines x − ct = const.' }];
      break;
    }
    default:
      return { task: 'separate', engine: '—', steps: [{ title: 'Poisson’s equation', detail: 'A particular solution depends on the source; open the PDE demonstration for the numerical solution.' }], answer: null, check: unv('No closed form here.'), notes: [] };
  }
  const vars = pde.dims === 1 || pde.family === 'laplace' ? (pde.family === 'laplace' ? ['x', 'y'] : ['x', 't']) : ['x', 'y', 't'];
  const R = simplify(residual(u));
  const zero = agree(R, num(0), vars, fixed);
  const check = zero.ok ? ok(`Substituted into the PDE (exact derivatives): the residual vanishes at ${zero.points} sample points.`) : bad(`The residual is not zero (relative ${fmt(zero.maxErr, 2)}).`);
  steps.push({ title: `Product solution, k = ${k}`, rule: 'Superposition builds the rest', tex: `u = ${T(u)}`, detail: 'Any finite (or convergent infinite) sum of these with different k is also a solution — the Fourier series fixes the coefficients from the initial data.', check });
  return { task: 'separate', engine: 'Separation of variables; verified with MathVerse’s exact derivatives', steps, answer: { label: `A product solution (mode ${kk || '1'})`, tex: `u = ${T(u)}` }, check, marks: { curve: u }, notes: [] };
}

function taskImplicit(ctx: RunCtx): Work {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  const F = an.exprs[0];
  const bx = partialBlock(F, 'x', fixed, '∂F/∂x'), by = partialBlock(F, 'y', fixed, '∂F/∂y');
  const dydx = simplify(neg(div(bx.w.result, by.w.result)));
  const steps: WorkStep[] = [
    { title: 'Differentiate both sides in x', rule: 'Implicit differentiation', tex: `\\frac{d}{dx}F(x, y(x)) = F_x + F_y\\,\\frac{dy}{dx} = 0`, detail: 'Along the curve F stays 0, so its total derivative is zero (the chain rule, with y a function of x).', hint: 'Differentiate F(x, y(x)) = 0 with the chain rule.' },
    ...bx.steps, ...by.steps,
    { title: 'Solve for dy/dx', rule: 'Rearrange', tex: `\\frac{dy}{dx} = -\\frac{F_x}{F_y} = ${T(dydx)}`, detail: 'Valid wherever F_y ≠ 0 (where the curve is not vertical).' },
  ];
  const x0 = params.x0 ?? 0.6;
  const Fc = compile(F, ['x', 'y'], fixed);
  const roots = findRoots((yy) => Fc([x0, yy]), -10, 10, 1000);
  const marks: Marks = {};
  let check = worst(checkOfDiff(bx.w), checkOfDiff(by.w));
  if (roots.length) {
    const y0 = roots.reduce((b, r) => (Math.abs(r) < Math.abs(b) ? r : b), roots[0]);
    const m = compile(dydx, ['x', 'y'], fixed)([x0, y0]);
    // numerical check: follow the curve a little left and right
    const h = 1e-5;
    const yAt = (xx: number) => brent((yy) => Fc([xx, yy]), y0 - 0.05, y0 + 0.05);
    const yl = yAt(x0 - h), yr = yAt(x0 + h);
    const nd = yl !== null && yr !== null ? (yr - yl) / (2 * h) : NaN;
    const agrees = Number.isFinite(nd) && Math.abs(nd - m) < 1e-4 * Math.max(1, Math.abs(m));
    steps.push({ title: `At the point (${fmt(x0, 4)}, ${fmt(y0, 6)})`, rule: 'Tangent line', tex: `\\frac{dy}{dx} = ${fmt(m)},\\quad y = ${fmt(y0)} ${m < 0 ? '-' : '+'} ${fmt(Math.abs(m))}(x - ${fmt(x0, 4)})`, detail: `The point was found on the curve numerically (y by Brent’s method). Following the curve ±${h} gives slope ${fmt(nd)}.`, check: agrees ? ok('The exact slope matches the numerical slope along the curve.') : unv('Could not follow the curve numerically here (a vertical tangent or a branch point?).') });
    if (!agrees) check = worst(check, unv('Numerical slope check failed at this point.'));
    marks.points = [{ at: [x0, y0] }]; marks.lines = [{ at: [x0, y0], m }];
  } else steps.push({ title: 'No point of the curve above this x', detail: 'Move x₀ until the vertical line meets the curve.' });
  return { task: 'implicit', engine: 'MathVerse step differentiator (partial derivatives)', steps, answer: { label: 'Slope of the curve', tex: `\\frac{dy}{dx} = ${T(dydx)}` }, check, marks, notes: [] };
}

async function taskEvaluate(ctx: RunCtx): Promise<Work> {
  const { an, params } = ctx;
  const fixed = fixedOf(an, params);
  if (an.kind === 'vector') {
    const v = an.exprs.map((e) => evaluate(e, fixed));
    const L = Math.hypot(...v);
    return { task: 'evaluate', engine: 'MathVerse core', steps: [{ title: 'Length', rule: 'Pythagoras', tex: `|\\mathbf v| = \\sqrt{${v.map((x) => `${fmt(x)}^2`).join(' + ')}} = ${fmt(L)}` }, { title: 'Direction', rule: 'Unit vector', tex: `\\hat{\\mathbf v} = \\left(${v.map((x) => fmt(x / L)).join(',\\ ')}\\right)` }], answer: { label: 'Length', tex: `|\\mathbf v| = ${fmt(L)}` }, check: ok('Floating-point evaluation.'), notes: [] };
  }
  const e = an.exprs[0];
  const v = evaluate(e, fixed);
  const names = namesOf(e);
  let exact: CasOut | null = null;
  try { exact = (await ctx.cas.call<{ simplified: CasOut }>('simplify', { expr: toSympy(e), names })).simplified; } catch { /* */ }
  const en = readCas(exact, names);
  let ev = NaN; try { ev = en ? evaluate(en, fixed) : NaN; } catch { /* */ }
  const check = exact && Number.isFinite(ev) && Math.abs(ev - v) <= 1e-12 * Math.max(1, Math.abs(v)) ? ok('SymPy’s exact form evaluates to the same number.') : exact ? unv('Could not compare.') : numerical('Floating-point value only.');
  return { task: 'evaluate', engine: 'SymPy simplify + MathVerse evaluation', steps: [{ title: 'Exact form', rule: 'SymPy simplify', tex: exact ? `${T(e)} = ${exact.latex}` : T(e) }, { title: 'Decimal value', rule: 'Floating point', tex: `\\approx ${fmt(v, 15)}`, check: numerical('Double precision.') }], answer: { label: 'Value', tex: `${T(e)} = ${exact?.latex ?? ''}${exact ? ' \\approx ' : ''}${fmt(v, 12)}` }, check, notes: [] };
}

/** Turn a work into LaTeX source (for export). */
export function workToTeX(title: string, originalTeX: string, w: Work): string {
  const esc = (s: string) => s.replace(/\$([^$]+)\$/g, '\\($1\\)').replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}').replace(/[&%#_]/g, (c) => (c === '_' ? '\\_' : `\\${c}`));
  const lines = [
    '\\documentclass{article}', '\\usepackage{amsmath,amssymb}', '\\begin{document}', `\\section*{${esc(title)}}`, `\\[ ${originalTeX} \\]`, '\\begin{enumerate}',
    ...w.steps.map((s) => `  \\item \\textbf{${esc(s.title)}}${s.rule ? ` (${esc(s.rule)})` : ''}${s.tex ? `\n    \\[ ${s.tex} \\]` : ''}${s.detail ? `\n    ${esc(s.detail)}` : ''}${s.check ? `\n    \\emph{Check: ${esc(s.check.text)}}` : ''}`),
    '\\end{enumerate}',
    ...(w.answer ? [`\\paragraph{${esc(w.answer.label)}} \\[ ${w.answer.tex} \\]`] : []),
    `\\paragraph{Verification (${w.check.status})} ${esc(w.check.text)}`, '\\end{document}', '',
  ];
  return lines.join('\n');
}


