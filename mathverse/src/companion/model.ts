// The Homework Companion's model, free of the DOM: problems and tabs, the
// subjects, what a typed problem *is* (via the universal input classifier plus
// a few homework phrasings — "d/dx …", "∫ … dx", "lim x→0 …", a single
// equation to solve, a linear system), which tasks and pictures suit it, local
// persistence, and conversion to and from .mathverse project workspaces.

import { classify, Classified, ParamSpec, paramFor, InputError } from '../core/input/classify';
import { Node, parse, toTeX, freeSymbols, sub, evaluate, ParseError, FUNCTIONS, simplify } from '../core/expr';
import { readLinearSystem, LinearSystem } from './linsys';
import type { Workspace } from '../project/format';
import { emptyWorkspace } from '../project/format';

// ── subjects, modes ─────────────────────────────────────────────────────────

export type Subject = 'auto' | 'calc1' | 'calc2' | 'calc3' | 'linalg' | 'ode' | 'pde' | 'geometry';
export type Mode = 'explore' | 'steps';

export const SUBJECTS: [Subject, string][] = [
  ['auto', 'Auto-detect'], ['calc1', 'Calculus I'], ['calc2', 'Calculus II'], ['calc3', 'Calculus III'],
  ['linalg', 'Linear algebra'], ['ode', 'Differential equations (ODE)'], ['pde', 'Partial differential equations'], ['geometry', 'Geometry'],
];
export const subjectName = (s: Subject) => SUBJECTS.find(([k]) => k === s)?.[1] ?? s;

// ── problems ────────────────────────────────────────────────────────────────

export interface Problem {
  id: string;
  title: string;
  input: string;
  subject: Subject;
  mode: Mode;
  /** the chosen task ('' = the subject's default) */
  task: string;
  /** the chosen picture ('' = default) */
  viz: string;
  /** a point typed for limits and series (a, ∞, π/2 …) */
  at: string;
  params: Record<string, number>;
  ranges: Record<string, [number, number]>;
  notes: string;
  /** steps revealed so far in Explore mode */
  revealed: number;
  created: string;
  modified: string;
}

let idCounter = 0;
export const newId = () => `p${Date.now().toString(36)}${(idCounter++).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;

export function newProblem(input = '', patch: Partial<Problem> = {}): Problem {
  const now = new Date().toISOString();
  return { id: newId(), title: '', input, subject: 'auto', mode: 'explore', task: '', viz: '', at: '0', params: {}, ranges: {}, notes: '', revealed: 0, created: now, modified: now, ...patch };
}

export const problemTitle = (p: Problem) => p.title.trim() || p.input.trim().slice(0, 32) || 'New problem';

// ── persistence (localStorage key mathverse:companion), validated like project files ──

export const STORAGE_KEY = 'mathverse:companion';
export interface CompanionState { version: 1; tabs: Problem[]; active: number; saved: Problem[] }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max: number, d = '') => (typeof v === 'string' && v.length <= max ? v : d);
const NAME = /^[A-Za-z_][A-Za-z0-9_]{0,40}$/;
const BAD = new Set(['__proto__', 'constructor', 'prototype']);
function numRec(v: unknown): Record<string, number> {
  const out: Record<string, number> = Object.create(null);
  if (!isObj(v)) return out;
  for (const [k, x] of Object.entries(v).slice(0, 200)) if (NAME.test(k) && !BAD.has(k) && typeof x === 'number' && Number.isFinite(x)) out[k] = x;
  return out;
}
function rangeRec(v: unknown): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = Object.create(null);
  if (!isObj(v)) return out;
  for (const [k, x] of Object.entries(v).slice(0, 200)) if (NAME.test(k) && !BAD.has(k) && Array.isArray(x) && x.length === 2 && x.every((y) => typeof y === 'number' && Number.isFinite(y)) && x[0] < x[1]) out[k] = [x[0], x[1]];
  return out;
}
const SUBJECT_IDS = new Set(SUBJECTS.map(([k]) => k));

/** Validate one stored problem; anything malformed is replaced by a default. */
export function readProblem(v: unknown): Problem | null {
  if (!isObj(v)) return null;
  const p = newProblem();
  return {
    id: /^[A-Za-z0-9]{1,40}$/.test(str(v.id, 40)) ? str(v.id, 40) : p.id,
    title: str(v.title, 200), input: str(v.input, 4000),
    subject: SUBJECT_IDS.has(v.subject as Subject) ? (v.subject as Subject) : 'auto',
    mode: v.mode === 'steps' ? 'steps' : 'explore',
    task: /^[a-z0-9]{0,30}$/i.test(str(v.task, 30)) ? str(v.task, 30) : '',
    viz: /^[a-z0-9]{0,30}$/i.test(str(v.viz, 30)) ? str(v.viz, 30) : '',
    at: str(v.at, 100, '0') || '0',
    params: numRec(v.params), ranges: rangeRec(v.ranges),
    notes: str(v.notes, 200000),
    revealed: typeof v.revealed === 'number' && Number.isInteger(v.revealed) && v.revealed >= 0 && v.revealed < 10000 ? v.revealed : 0,
    created: str(v.created, 40, p.created), modified: str(v.modified, 40, p.modified),
  };
}

export function readState(text: string | null): CompanionState {
  const fresh = (): CompanionState => ({ version: 1, tabs: [newProblem('f(x) = x^2 sin(x)')], active: 0, saved: [] });
  if (!text) return fresh();
  let data: unknown;
  try { data = JSON.parse(text); } catch { return fresh(); }
  if (!isObj(data)) return fresh();
  const tabs = (Array.isArray(data.tabs) ? data.tabs.slice(0, 30) : []).map(readProblem).filter((p): p is Problem => !!p);
  const saved = (Array.isArray(data.saved) ? data.saved.slice(0, 500) : []).map(readProblem).filter((p): p is Problem => !!p);
  if (!tabs.length) tabs.push(newProblem(''));
  const a = typeof data.active === 'number' && Number.isInteger(data.active) ? data.active : 0;
  return { version: 1, tabs, active: Math.min(tabs.length - 1, Math.max(0, a)), saved };
}

export function loadState(storage: Pick<Storage, 'getItem'> | null = typeof localStorage !== 'undefined' ? localStorage : null): CompanionState {
  try { return readState(storage?.getItem(STORAGE_KEY) ?? null); } catch { return readState(null); }
}
export function saveState(s: CompanionState, storage: Pick<Storage, 'setItem'> | null = typeof localStorage !== 'undefined' ? localStorage : null): boolean {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(s)); return true; } catch { return false; }
}

// ── .mathverse workspaces ───────────────────────────────────────────────────

/** A problem as a project workspace: it opens in MathVerse as the typed-input demo, with notes. */
export function problemToWorkspace(p: Problem): Workspace {
  const w = emptyWorkspace('explore', problemTitle(p));
  const choices: Record<string, string> = { companion: '1', subject: p.subject, mode: p.mode };
  if (p.task) choices.task = p.task;
  if (p.viz) choices.viz = p.viz;
  if (p.at) choices.at = p.at.slice(0, 99);
  return { ...w, input: p.input, params: { ...p.params }, paramRanges: { ...p.ranges }, choices, notes: p.notes };
}

export function workspaceToProblem(w: Workspace): Problem {
  const c = w.choices ?? {};
  return readProblem({
    title: w.title, input: w.input, subject: c.subject, mode: c.mode, task: c.task, viz: c.viz, at: c.at ?? '0',
    params: w.params, ranges: w.paramRanges, notes: w.notes,
  })!;
}

// ── what the problem is ─────────────────────────────────────────────────────

export type Kind =
  | 'function' | 'equation' | 'surface' | 'curve2d' | 'polar' | 'curve3d' | 'paramSurface' | 'field2d' | 'field3d'
  | 'matrix' | 'vector' | 'system' | 'ode1' | 'ode2' | 'odeSystem' | 'pde' | 'implicit2d' | 'implicit3d' | 'value';

export interface TaskDef { id: string; label: string; cas: boolean; subjects: Subject[]; blurb: string }
export interface VizDef { id: string; label: string; dim: 2 | 3 }

/** The typed intent of a homework phrasing ("d/dx", "∫ … dx", "lim"). */
export interface Intent { task?: string; var?: string; lo?: number; hi?: number; at?: string; /** the limits as typed (pi, 1/2 …), kept exact */ loText?: string; hiText?: string }

export interface Analysis {
  kind: Kind;
  classified: Classified | null;
  /** the main expression(s) */
  exprs: Node[];
  /** independent variable(s) */
  vars: string[];
  /** ODE dependent variable(s) */
  dependent?: string[];
  system?: LinearSystem;
  equation?: { lhs: Node; rhs: Node; F: Node; x: string };
  intent: Intent;
  /** sliders for free parameters */
  params: ParamSpec[];
  /** subject guessed from the input */
  guessed: Subject;
  /** the subject in effect (the user's choice, or the guess) */
  subject: Subject;
  originalTeX: string;
  rearranged?: { label: string; tex: string };
  describe: string;
  tasks: TaskDef[];
  vizes: VizDef[];
  /** the explore demo can show this input full-screen */
  demoInput: string | null;
  warnings: string[];
}

const T = (id: string, label: string, cas: boolean, subjects: Subject[], blurb: string): TaskDef => ({ id, label, cas, subjects, blurb });

export const TASKS: Record<string, TaskDef> = {
  diff: T('diff', 'Derivative', false, ['calc1', 'geometry'], 'Differentiate rule by rule (sum, product, quotient, chain, power …), then the tangent line.'),
  extrema: T('extrema', 'Critical points', true, ['calc1'], 'Solve f′(x) = 0 exactly and classify each point with f″.'),
  solve: T('solve', 'Solve f = 0', true, ['calc1'], 'Exact solutions from SymPy, each substituted back and checked.'),
  limit: T('limit', 'Limit', true, ['calc1'], 'Direct substitution, L’Hôpital where it applies, SymPy’s limit and a numerical table.'),
  integral: T('integral', 'Antiderivative', true, ['calc1', 'calc2'], 'SymPy’s own rule tree (substitution, parts, partial fractions …), differentiated back to verify.'),
  definite: T('definite', 'Definite integral', true, ['calc1', 'calc2'], 'Exact value from SymPy, compared with adaptive quadrature.'),
  series: T('series', 'Taylor series', true, ['calc2'], 'Taylor coefficients from exact derivatives, matched against SymPy’s series.'),
  apart: T('apart', 'Partial fractions', true, ['calc2'], 'Split a rational function; checked numerically at sample points.'),
  partials: T('partials', 'Partial derivatives', false, ['calc3', 'geometry'], '∂f/∂x and ∂f/∂y rule by rule, the gradient and the tangent plane.'),
  critical: T('critical', 'Critical points', false, ['calc3'], 'Where ∇f = 0 (numerical), classified by the exact Hessian.'),
  double: T('double', 'Double integral', true, ['calc3'], 'An iterated integral over a rectangle, inner then outer, compared with 2D quadrature.'),
  curvatureK: T('curvatureK', 'Surface curvature', false, ['geometry'], 'Gaussian and mean curvature of the graph from exact partial derivatives.'),
  velocity: T('velocity', 'Velocity & speed', false, ['calc2', 'calc3', 'geometry'], 'Differentiate each component; speed and direction at a time.'),
  curvature: T('curvature', 'Curvature', false, ['geometry', 'calc3'], 'κ (and τ in space) from exact derivatives.'),
  arclength: T('arclength', 'Arc length', true, ['calc2', 'calc3', 'geometry'], '∫|r′(t)|dt — exactly when SymPy can, always numerically.'),
  divcurl: T('divcurl', 'Divergence & curl', false, ['calc3'], 'Every partial derivative rule by rule, then div F and curl F.'),
  tangents: T('tangents', 'Tangent vectors & normal', false, ['geometry', 'calc3'], 'r_u, r_v, the normal r_u × r_v and the first fundamental form.'),
  gradient: T('gradient', 'Gradient', false, ['calc3'], 'All partial derivatives, rule by rule; the normal to the level set.'),
  rref: T('rref', 'Row reduce (RREF)', false, ['linalg'], 'Gauss–Jordan elimination, every row operation shown, in exact fractions.'),
  det: T('det', 'Determinant', true, ['linalg'], 'Cofactor expansion (exact), and what the number means geometrically.'),
  inverse: T('inverse', 'Inverse', false, ['linalg'], 'Row-reduce [A | I] to [I | A⁻¹], then check A·A⁻¹ = I.'),
  eigen: T('eigen', 'Eigenvalues & vectors', true, ['linalg'], 'Characteristic polynomial and exact eigenpairs from SymPy, checked against Av = λv.'),
  system: T('system', 'Solve the system', false, ['linalg'], 'Row-reduce the augmented matrix; read off and check the solution.'),
  dsolve: T('dsolve', 'Solve the ODE', true, ['ode'], 'SymPy’s dsolve with its method, verified by substitution and against a numerical solution.'),
  phase: T('phase', 'Equilibria & stability', false, ['ode'], 'Equilibria (numerical) and their type from the exact Jacobian’s eigenvalues.'),
  separate: T('separate', 'Separation of variables', false, ['pde'], 'Product solutions, checked by substituting into the PDE.'),
  implicit: T('implicit', 'Implicit differentiation', false, ['calc1', 'calc3'], 'dy/dx = −F_x/F_y, with the partial derivatives rule by rule.'),
  evaluate: T('evaluate', 'Evaluate', true, ['calc1'], 'An exact form from SymPy beside the floating-point value.'),
};

const V = (id: string, label: string, dim: 2 | 3): VizDef => ({ id, label, dim });

const KIND_TASKS: Record<Kind, string[]> = {
  function: ['diff', 'extrema', 'solve', 'limit', 'integral', 'definite', 'series', 'apart'],
  equation: ['solve'],
  surface: ['partials', 'critical', 'double', 'curvatureK'],
  curve2d: ['velocity', 'curvature', 'arclength'], polar: ['velocity', 'curvature', 'arclength'], curve3d: ['velocity', 'curvature', 'arclength'],
  paramSurface: ['tangents'], field2d: ['divcurl'], field3d: ['divcurl'],
  matrix: ['rref', 'det', 'inverse', 'eigen'], vector: ['evaluate'], system: ['system'],
  ode1: ['dsolve'], ode2: ['dsolve'], odeSystem: ['phase'], pde: ['separate'],
  implicit2d: ['implicit'], implicit3d: ['gradient'], value: ['evaluate'],
};

const KIND_VIZ: Record<Kind, VizDef[]> = {
  function: [V('graph', 'Graph & tangent', 2), V('area', 'Area', 2), V('taylor', 'Taylor polynomial', 2)],
  equation: [V('sides', 'Both sides', 2), V('zero', 'lhs − rhs', 2)],
  surface: [V('surface', 'Surface (3D)', 3), V('contour', 'Contours & gradient', 2)],
  curve2d: [V('curve', 'Curve', 2)], polar: [V('curve', 'Curve', 2)], curve3d: [V('curve3', 'Space curve', 3)],
  paramSurface: [V('psurface', 'Surface (3D)', 3)], field2d: [V('field', 'Field & divergence', 2)], field3d: [V('field3', 'Field (3D)', 3)],
  matrix: [V('transform', 'Transformation', 2)], vector: [V('vector', 'Vector', 2)], system: [V('lines', 'Lines / planes', 2)],
  ode1: [V('slope', 'Direction field', 2)], ode2: [V('time', 'Solution y(t)', 2), V('phaseplane', 'Phase plane', 2)], odeSystem: [V('phaseplane', 'Phase portrait', 2)],
  pde: [V('profile', 'Profile u(x, t)', 2)], implicit2d: [V('implicit', 'Curve & tangent', 2)], implicit3d: [V('none', 'Level surface', 2)], value: [],
};

const KIND_SUBJECT: Record<Kind, Subject> = {
  function: 'calc1', equation: 'calc1', surface: 'calc3', curve2d: 'calc2', polar: 'calc2', curve3d: 'geometry', paramSurface: 'geometry',
  field2d: 'calc3', field3d: 'calc3', matrix: 'linalg', vector: 'linalg', system: 'linalg', ode1: 'ode', ode2: 'ode', odeSystem: 'ode', pde: 'pde',
  implicit2d: 'calc1', implicit3d: 'calc3', value: 'calc1',
};

/** Peel homework phrasings off the front: d/dx …, ∫ … dx, ∫_a^b … dx, lim x→a …, solve … */
export function readIntent(src: string): { body: string; intent: Intent } {
  let s = src.trim();
  const intent: Intent = {};
  const num_ = (t: string): number | undefined => { try { const v = evaluate(parse(t)); return Number.isFinite(v) ? v : undefined; } catch { return undefined; } };
  let m = /^(?:d\/d([a-z])|derivative(?:\s+of)?|differentiate)\s*(.+)$/i.exec(s);
  if (m) { intent.task = 'diff'; intent.var = m[1]; s = m[2]; }
  m = /^(?:∫|int(?:egrate)?\b)\s*(?:_\s*\{?([^}^\s]+)\}?\s*\^\s*\{?([^}\s]+)\}?)?\s*(.+?)\s*d([a-z])\s*$/i.exec(s);
  if (!intent.task && m) {
    intent.var = m[4]; s = m[3];
    if (m[1] !== undefined && m[2] !== undefined) { intent.task = 'definite'; intent.lo = num_(m[1]); intent.hi = num_(m[2]); intent.loText = m[1]; intent.hiText = m[2]; } else intent.task = 'integral';
  }
  m = /^lim(?:it)?\s*_?\s*\{?\s*([a-z])\s*(?:->|→|to)\s*([^\s}]+)\s*\}?\s*(.+)$/i.exec(s);
  if (!intent.task && m) { intent.task = 'limit'; intent.var = m[1]; intent.at = m[2].replace(/∞/g, 'inf'); s = m[3]; }
  m = /^solve\s+(.+?)(?:\s+for\s+([a-z]))?$/i.exec(s);
  if (!intent.task && m) { intent.task = 'solve'; s = m[1]; if (m[2]) intent.var = m[2]; }
  m = /^(?:taylor|series)\s+(?:of\s+)?(.+)$/i.exec(s);
  if (!intent.task && m) { intent.task = 'series'; s = m[1]; }
  // strip enclosing brackets left from "d/dx (x^2 sin x)" or "d/dx [ … ]"
  if (/^\[.*\]$/.test(s) && !/^\[\s*\[/.test(s)) s = s.slice(1, -1);
  return { body: s.trim(), intent };
}

const ONE_VAR_PREF = ['x', 't', 'theta', 'u', 's', 'r', 'z', 'y'];

/** Understand a typed problem. Throws InputError with a readable message. */
export function analyze(src: string, chosen: Subject = 'auto'): Analysis {
  const raw = src.trim();
  if (!raw) throw new InputError('Type the problem you are working on — e.g. x^2 sin(x), ∫ x e^x dx, x^2 − 5x + 6 = 0, [[2,1],[1,2]], dy/dt = −2y');
  const { body, intent } = readIntent(raw);
  const finish = (a: Omit<Analysis, 'subject' | 'tasks' | 'vizes' | 'intent' | 'guessed'> & { guessed?: Subject }): Analysis => {
    const guessed = a.guessed ?? KIND_SUBJECT[a.kind];
    const subject = chosen === 'auto' ? guessed : chosen;
    const ids = KIND_TASKS[a.kind];
    // the chosen subject's tasks first, keeping the kind's natural order otherwise
    const tasks = ids.map((id) => TASKS[id]).sort((p, q) => Number(q.subjects.includes(subject)) - Number(p.subjects.includes(subject)));
    const warnings = [...a.warnings];
    if (chosen !== 'auto' && chosen !== guessed && !tasks.some((t) => t.subjects.includes(chosen))) {
      warnings.push(`This reads as ${a.describe.replace(/\.$/, '').toLowerCase()} — the ${subjectName(guessed)} tools apply.`);
    }
    return { ...a, intent, guessed, subject, tasks, vizes: KIND_VIZ[a.kind], warnings };
  };

  // a linear system typed as equations, one per line or separated by ';'
  const sys = readLinearSystem(body);
  if (sys) {
    const V_ = sys.vars;
    const eqTeX = sys.residuals.map((r) => `${toTeX(r)} = 0`);
    return finish({
      kind: 'system', classified: null, exprs: sys.residuals, vars: V_, system: sys, params: [],
      originalTeX: body.split(/\s*[;\n]\s*/).filter(Boolean).map((l) => { const [a, b] = l.split('='); try { return `${toTeX(parse(a))} = ${toTeX(parse(b))}`; } catch { return l; } }).join(' \\\\ '),
      rearranged: { label: 'Matrix form  A x = b', tex: `\\left[\\begin{array}{${'c'.repeat(V_.length)}|c}${sys.A.map((r, i) => [...r.map(fmt), fmt(sys.b[i])].join(' & ')).join(' \\\\ ')}\\end{array}\\right]` },
      describe: `A linear system of ${sys.A.length} equations in ${V_.length} unknowns.`, demoInput: null, warnings: eqTeX.length ? [] : [],
    });
  }

  // one equation in one unknown: x^2 − 5x + 6 = 0, sin x = 1/2, e^x = 5
  const eqParts = body.split('=');
  if (eqParts.length === 2 && !/[;\n]/.test(body) && !/^\s*d[A-Za-z]\s*\/\s*d[A-Za-z]/.test(body) && !/'|′|∂|∇/.test(body)) {
    const [l, r] = eqParts.map((s) => s.trim());
    const head = /^([A-Za-z][A-Za-z0-9_]*)\s*(\([^)]*\))?$/.exec(l);
    const isDef = !!head && !(head[1] in FUNCTIONS);
    if (!isDef || /^[a-z]$/.test(l) && l !== 'y' && l !== 'z' && l !== 'r' && intent.task === 'solve') {
      let L: Node | null = null, R: Node | null = null;
      try { L = parse(l); R = parse(r); } catch (e) { if (!(e instanceof ParseError)) throw e; }
      if (L && R) {
        const F = sub(L, R);
        const free = [...freeSymbols(F)];
        const x = intent.var && free.includes(intent.var) ? intent.var : ONE_VAR_PREF.find((v) => free.includes(v) && v !== 'y') ?? (free.length === 1 ? free[0] : undefined);
        if (x && !(free.includes('y') && x === 'x' && !intent.var)) {
          const params = free.filter((s) => s !== x).sort().map((k) => paramFor(k));
          return finish({
            kind: 'equation', classified: null, exprs: [F], vars: [x], equation: { lhs: L, rhs: R, F, x }, params,
            originalTeX: `${toTeX(L)} = ${toTeX(R)}`,
            rearranged: { label: 'Rearranged (everything on one side)', tex: `${toTeX(F)} = 0` },
            describe: `An equation to solve for ${x}.`, demoInput: `f(${x}) = ${l} - (${r})`, warnings: [],
          });
        }
      }
    }
  }

  // everything else: the universal input classifier
  let c: Classified;
  try { c = classify(body); } catch (e) {
    if (e instanceof InputError) throw e;
    throw new InputError((e as Error).message);
  }
  const kind = c.kind as Kind;
  // the classifier solves y'' + a y' + b y = g for y'' literally (−(0 + a y' + …)/1); tidy it — same values
  if (kind === 'ode2') c = { ...c, exprs: [simplify(c.exprs[0])] };
  let vars = c.vars;
  if (kind === 'function' && intent.var && vars[0] !== intent.var && freeSymbols(c.exprs[0]).has(intent.var)) vars = [intent.var];
  const params = c.params.filter((p) => !vars.includes(p.key));
  if (kind === 'function' && vars[0] !== c.vars[0] && freeSymbols(c.exprs[0]).has(c.vars[0])) params.push(paramFor(c.vars[0]));
  let rearranged: Analysis['rearranged'];
  if (kind === 'ode2') rearranged = { label: 'Solved for the highest derivative', tex: `${c.dependent![0]}'' = ${toTeX(c.exprs[0]).replace(new RegExp(`${c.dependent![0]}_\\{p\\}`, 'g'), `${c.dependent![0]}'`)}` };
  if (kind === 'implicit2d') rearranged = { label: 'Rearranged as F(x, y) = 0', tex: `${toTeX(c.exprs[0])} = 0` };
  return finish({
    kind, classified: c, exprs: c.exprs, vars, dependent: c.dependent, params,
    originalTeX: intent.task === 'diff' ? `\\frac{d}{d${vars[0] ?? 'x'}}\\left[${toTeX(c.exprs[0])}\\right]`
      : intent.task === 'integral' ? `\\int ${toTeX(c.exprs[0])}\\,d${vars[0] ?? 'x'}`
        : intent.task === 'definite' ? `\\int_{${limTeX(intent.loText, intent.lo ?? 0)}}^{${limTeX(intent.hiText, intent.hi ?? 1)}} ${toTeX(c.exprs[0])}\\,d${vars[0] ?? 'x'}`
          : intent.task === 'limit' ? `\\lim_{${vars[0] ?? 'x'} \\to ${intent.at === 'inf' ? '\\infty' : intent.at === '-inf' ? '-\\infty' : intent.at}} ${toTeX(c.exprs[0])}`
            : c.tex,
    rearranged, describe: c.describe, demoInput: kind === 'value' ? null : body, warnings: c.warnings,
  });
}

const fmt = (v: number) => String(+v.toPrecision(6));
const limTeX = (text: string | undefined, v: number) => { if (text) { try { return toTeX(parse(text)); } catch { /* fall through */ } } return fmt(v); };

// ── task parameters (sliders a task or picture adds) ────────────────────────

/** Extra sliders for a task/picture; keys never collide with typed symbols (which are single letters, Greek names or subscripted). */
export function extraParams(an: Analysis, task: string, viz: string): ParamSpec[] {
  const P = (key: string, label: string, value: number, min: number, max: number, step = 0.01): ParamSpec => ({ key, label, value, min, max, step });
  const out: ParamSpec[] = [];
  const v = an.vars[0] ?? 'x';
  const add = (p: ParamSpec) => { if (!out.some((q) => q.key === p.key)) out.push(p); };
  switch (an.kind) {
    case 'function':
      add(P('x0', `point ${v}₀`, 1, -10, 10));
      if (task === 'definite' || viz === 'area') { add(P('lo', 'lower limit', an.intent.lo ?? 0, -10, 10)); add(P('hi', 'upper limit', an.intent.hi ?? 2, -10, 10)); }
      if (task === 'series' || viz === 'taylor') add(P('order', 'order n', 5, 1, 12, 1));
      break;
    case 'surface':
      add(P('x0', 'x₀', 0.5, -3, 3)); add(P('y0', 'y₀', 0.5, -3, 3));
      if (task === 'double') { add(P('lo', 'x from', 0, -5, 5)); add(P('hi', 'x to', 1, -5, 5)); add(P('ylo', 'y from', 0, -5, 5)); add(P('yhi', 'y to', 1, -5, 5)); }
      break;
    case 'curve2d': case 'curve3d':
      add(P('x0', `${v}₀ (a point on the curve)`, 1, -10, 10)); add(P('lo', `${v} from`, an.kind === 'curve3d' ? 0 : -Math.PI, -20, 20)); add(P('hi', `${v} to`, an.kind === 'curve3d' ? 4 * Math.PI : Math.PI, -20, 20));
      break;
    case 'polar':
      add(P('x0', 'θ₀', 1, -10, 10)); add(P('lo', 'θ from', 0, -20, 20)); add(P('hi', 'θ to', 2 * Math.PI, -20, 20));
      break;
    case 'field2d': case 'field3d': case 'implicit3d':
      add(P('x0', 'x₀', 1, -5, 5)); add(P('y0', 'y₀', 0.5, -5, 5)); if (an.kind !== 'field2d') add(P('z0', 'z₀', 0.5, -5, 5));
      break;
    case 'paramSurface':
      add(P('x0', 'u₀', 1, -10, 10)); add(P('y0', 'v₀', 1, -10, 10));
      break;
    case 'implicit2d':
      add(P('x0', 'x₀', 0.6, -5, 5));
      break;
    case 'ode1': case 'ode2': case 'odeSystem':
      add(P('t0', 'initial time t₀', 0, -5, 5)); add(P('icY', `initial value ${an.dependent?.[0] ?? 'y'}(t₀)`, 1, -5, 5));
      if (an.kind === 'ode2') add(P('icV', `initial slope ${an.dependent?.[0] ?? 'y'}′(t₀)`, 0, -5, 5));
      if (an.kind === 'odeSystem') add(P('icV', `initial ${an.dependent?.[1] ?? 'y'}(t₀)`, 0, -5, 5));
      add(P('T', 'solve until t =', 8, 1, 40, 0.1));
      break;
    case 'pde':
      add(P('k', 'mode number k', 1, 1, 6, 1)); add(P('tt', 'time t', 0.2, 0, 5));
      break;
  }
  return out;
}

/** Default task for an analysis: the typed intent, else the first task of the subject. */
export function defaultTask(an: Analysis): string {
  if (an.intent.task && an.tasks.some((t) => t.id === an.intent.task)) return an.intent.task;
  if (an.kind === 'equation' || an.kind === 'system') return an.tasks[0].id;
  return (an.tasks.find((t) => t.subjects.includes(an.subject)) ?? an.tasks[0])?.id ?? '';
}

/** The task sliders each task's answer depends on (other sliders only move the picture). */
export const TASK_KEYS: Record<string, string[]> = {
  diff: ['x0'], definite: ['lo', 'hi'], series: ['order'], partials: ['x0', 'y0'], double: ['lo', 'hi', 'ylo', 'yhi'], curvatureK: ['x0', 'y0'],
  velocity: ['x0'], curvature: ['x0'], arclength: ['lo', 'hi'], divcurl: ['x0', 'y0', 'z0'], tangents: ['x0', 'y0'], gradient: ['x0', 'y0', 'z0'],
  dsolve: ['t0', 'icY', 'icV', 'T'], separate: ['k'], implicit: ['x0'],
};

/** Example problems for an empty workspace, by subject. */
export const EXAMPLES: [string, string[]][] = [
  ['Calculus I', ['x^2 sin(x)', 'lim x->0 sin(x)/x', 'x^3 - 3x', 'x^2 - 5x + 6 = 0']],
  ['Calculus II', ['∫ x e^x dx', '∫_0^pi sin(x)^2 dx', '1/(x^2 - 1)', 'taylor cos(x)']],
  ['Calculus III', ['z = x^2 - y^2', 'z = x^3 - 3x + y^2', 'F(x,y) = (x y, -y^2)']],
  ['Linear algebra', ['[[2,1],[1,2]]', 'x + 2y - z = 1; 2x - y + z = 3; x + y + z = 6', 'x + 2y = 5; 3x - y = 1']],
  ['ODE', ['dy/dt = -2y + sin(t)', "y'' + 0.5y' + 4y = 0", 'dx/dt = y; dy/dt = -x - 0.3y']],
  ['PDE', ['∂u/∂t = α ∂²u/∂x²', '∂²u/∂t² = c^2 ∂²u/∂x²']],
  ['Geometry', ['r(t) = (cos t, sin t, t/3)', 'x^2/4 + y^2 = 1', 'r = 1 + cos(theta)']],
];
