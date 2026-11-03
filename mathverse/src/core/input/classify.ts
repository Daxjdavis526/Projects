// The universal input: read one typed statement and decide what it is, which
// picture suits it, and which letters are parameters that deserve sliders.
//   f(x) = x^3 - 4x            → a function of one variable
//   z = A sin(Bx) cos(Cy)      → a surface, with sliders A, B, C
//   r(t) = (cos t, sin t, t)   → a space curve
//   F(x,y,z) = (y, -x, z)      → a vector field
//   A = [[2,1],[1,2]]          → a matrix (a linear transformation)
//   dy/dt = -2y                → a first-order ODE
//   y'' + 0.5y' + 4y = 0       → a second-order ODE
//   ∂u/∂t = α ∂²u/∂x²          → the heat equation
//   x^2 + y^2 = 1              → an implicit curve
//   r = 1 + cos(θ)             → a polar curve

import { Node, parse, freeSymbols, ParseError, sub, num, toTeX, evaluate, derivative } from '../expr';

export type Kind =
  | 'function' | 'surface' | 'curve2d' | 'curve3d' | 'polar' | 'field2d' | 'field3d' | 'paramSurface'
  | 'matrix' | 'vector' | 'ode1' | 'ode2' | 'odeSystem' | 'pde' | 'implicit2d' | 'implicit3d' | 'value';

export interface ParamSpec { key: string; label: string; value: number; min: number; max: number; step: number }

export interface Classified {
  kind: Kind;
  /** independent variables in order (x; x,y; t; u,v; …) */
  vars: string[];
  /** the defining expression(s); for ODEs the right-hand side(s); for implicit, lhs − rhs */
  exprs: Node[];
  params: ParamSpec[];
  /** display form */
  tex: string;
  /** a name the user gave (f, F, r, A …) */
  name?: string;
  /** for ODEs: the dependent variable(s); for PDEs: the family and its coefficient */
  dependent?: string[];
  pde?: { family: 'heat' | 'wave' | 'laplace' | 'poisson' | 'advection'; dims: 1 | 2; coeff: Node; source?: Node };
  value?: number;
  /** what MathVerse will show, in a sentence */
  describe: string;
  warnings: string[];
}

export class InputError extends Error {
  constructor(message: string, public pos = 0) { super(message); }
}

const PREFERRED_VARS = ['x', 'y', 'z', 't', 'u', 'v', 'theta', 's', 'r', 'phi'];

/** A slider for a free parameter, with a range that suits its usual meaning. */
export function paramFor(key: string, value?: number): ParamSpec {
  const positive = /^(alpha|beta|k|m|c|omega|lambda|sigma|mu|kappa|gamma|D|L|R|n|N|a|b)$/.test(key);
  const v = value ?? 1;
  return { key, label: key, value: v, min: positive ? 0 : -5, max: positive ? Math.max(5, v * 2) : 5, step: 0.01 };
}

function paramsOf(nodes: Node[], vars: string[], exclude: string[] = []): ParamSpec[] {
  const s = new Set<string>();
  for (const n of nodes) freeSymbols(n, s);
  return [...s].filter((k) => !vars.includes(k) && !exclude.includes(k)).sort().map((k) => paramFor(k));
}

/** Pick the independent variables of an expression from what appears in it. */
function inferVars(nodes: Node[], max: number, prefer: string[] = PREFERRED_VARS): string[] {
  const s = new Set<string>();
  for (const n of nodes) freeSymbols(n, s);
  const found = prefer.filter((v) => s.has(v));
  return found.slice(0, max);
}

function tryParse(src: string, names: string[] = []): Node {
  try { return parse(src, { names }); } catch (e) {
    if (e instanceof ParseError) throw new InputError(e.message, e.pos);
    throw e;
  }
}

const DERIV_TIME = /^\s*d([A-Za-z])\s*\/\s*d([A-Za-z])\s*$/;                     // dy/dt
const PRIME = /^([A-Za-z])('{1,2}|′{1,2}|″)$/;                                       // y', y''

/** Classify one statement (several ODE equations may be separated by ';' or new lines). */
export function classify(raw: string): Classified {
  const src = raw.trim();
  if (!src) throw new InputError('Type something to visualize, e.g. f(x) = x^3 - 4x');
  const lines = src.split(/\s*[;\n]\s*/).filter(Boolean);
  if (lines.length > 1) return classifySystem(lines);

  // PDEs: ∂u/∂t = …, u_t = …, u_tt = …, ∇²u = 0, u_xx + u_yy = 0
  if (/∂|∇|\bu_(t|tt|xx|yy|x|y)\b|laplacian/i.test(src)) return classifyPDE(src);

  const eq = splitEquals(src);
  if (!eq) {
    const n = tryParse(src);
    return fromExpression(n, undefined, src);
  }
  const [lhs, rhs] = eq;

  // derivatives on the left: dy/dt = f(t, y)
  const dm = DERIV_TIME.exec(lhs);
  if (dm) {
    const [, y, t] = dm;
    const f = tryParse(rhs, [y, t]);
    return {
      kind: 'ode1', vars: [t], dependent: [y], exprs: [f], params: paramsOf([f], [t, y]),
      tex: `\\frac{d${y}}{d${t}} = ${toTeX(f)}`, describe: `A first-order differential equation: its direction field, and solution curves you place by clicking.`, warnings: [],
    };
  }
  // second order with primes: y'' = …, or y'' + a y' + b y = g(t)
  if (/''|″|′′/.test(src)) return classifySecondOrder(src);
  const pm = PRIME.exec(lhs.replace(/\s/g, ''));
  if (pm) {
    const y = pm[1];
    const f = tryParse(rhs.replace(new RegExp(`${y}'`, 'g'), `${y}_p`), [y, 't']);
    return { kind: 'ode1', vars: ['t'], dependent: [y], exprs: [f], params: paramsOf([f], ['t', y]), tex: `${y}' = ${toTeX(f)}`, describe: 'A first-order differential equation and its direction field.', warnings: [] };
  }

  // a named definition: f(x) = …, F(x,y) = (…), r(t) = (…), r(u,v) = (…), A = [[…]], z = …, r = f(θ)
  const head = /^([A-Za-z][A-Za-z0-9_]*)\s*(?:\(\s*([A-Za-z_][A-Za-z0-9_]*(?:\s*,\s*[A-Za-z_][A-Za-z0-9_]*)*)\s*\))?$/.exec(lhs);
  if (head) {
    const name = head[1];
    const declared = head[2] ? head[2].split(/\s*,\s*/) : null;
    const body = tryParse(rhs, declared ?? []);
    if (declared) return fromDefinition(name, declared, body);
    // z = f(x, y): a surface; y = f(x): a function; r = f(θ): polar
    if (name === 'z' && body.t !== 'tuple') return fromDefinition('z', inferVars([body], 2, ['x', 'y']).length === 2 ? ['x', 'y'] : ['x', 'y'], body);
    if (name === 'y' && body.t !== 'tuple' && !freeSymbols(body).has('y')) return fromDefinition('y', ['x'], body);
    if (name === 'r' && body.t !== 'tuple' && (freeSymbols(body).has('theta') || freeSymbols(body).has('phi'))) {
      const th = freeSymbols(body).has('theta') ? 'theta' : 'phi';
      return { kind: 'polar', name: 'r', vars: [th], exprs: [body], params: paramsOf([body], [th]), tex: `r = ${toTeX(body)}`, describe: 'A polar curve r(θ), traced as θ sweeps.', warnings: [] };
    }
    if (body.t === 'matrix' || body.t === 'tuple' || freeSymbols(body).size === 0 || !freeSymbols(body).has(name)) {
      const out = fromExpression(body, name, rhs);
      if (out.kind !== 'implicit2d' && out.kind !== 'implicit3d') return out;
    }
  }
  // otherwise an equation between expressions: an implicit curve or surface
  const L = tryParse(lhs), R = tryParse(rhs);
  const F = sub(L, R);
  const vs = inferVars([F], 3, ['x', 'y', 'z']);
  if (vs.length === 3) return { kind: 'implicit3d', vars: ['x', 'y', 'z'], exprs: [F], params: paramsOf([F], vs), tex: `${toTeX(L)} = ${toTeX(R)}`, describe: 'An implicit surface F(x, y, z) = 0.', warnings: [] };
  return { kind: 'implicit2d', vars: ['x', 'y'], exprs: [F], params: paramsOf([F], ['x', 'y']), tex: `${toTeX(L)} = ${toTeX(R)}`, describe: 'An implicit curve: every point where both sides agree.', warnings: [] };
}

function splitEquals(src: string): [string, string] | null {
  const i = src.indexOf('=');
  if (i < 0) return null;
  if (src.indexOf('=', i + 1) >= 0) throw new InputError('Only one “=” is allowed in a statement', src.indexOf('=', i + 1));
  return [src.slice(0, i).trim(), src.slice(i + 1).trim()];
}

function fromDefinition(name: string, vars: string[], body: Node): Classified {
  const params = paramsOf([body], vars);
  const lhsTeX = name === 'z' || name === 'y' ? name : `${name}(${vars.join(', ')})`;
  const base = { name, vars, params, warnings: [] as string[] };
  if (body.t === 'matrix') return { ...base, kind: 'matrix', exprs: [body], tex: `${name} = ${toTeX(body)}`, describe: 'A matrix, seen as a transformation of the plane or space.' };
  if (body.t === 'tuple') {
    const n = body.items.length;
    if (vars.length === 1 && n === 2) return { ...base, kind: 'curve2d', exprs: body.items, tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A parametric curve in the plane, traced as the parameter moves.' };
    if (vars.length === 1 && n === 3) return { ...base, kind: 'curve3d', exprs: body.items, tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A space curve, with its tangent, normal and binormal (the Frenet frame).' };
    if (vars.length === 2 && n === 3 && !(vars[0] === 'x' && vars[1] === 'y')) return { ...base, kind: 'paramSurface', exprs: body.items, tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A parametric surface — its tangent plane, normal and curvature at any point.' };
    if (vars.length === 2 && n === 2) return { ...base, kind: 'field2d', exprs: body.items, tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A vector field in the plane, with particles carried by the flow.' };
    if (vars.length === 3 && n === 3) return { ...base, kind: 'field3d', exprs: body.items, tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A vector field in space, with its divergence and curl.' };
    if (vars.length === 2 && n === 3) return { ...base, kind: 'field3d', vars: ['x', 'y', 'z'], params: paramsOf([body], ['x', 'y', 'z']), exprs: body.items, tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A vector field in space.' };
    throw new InputError(`${name}(${vars.join(', ')}) has ${n} components — MathVerse draws curves (2 or 3 components of one parameter), surfaces (3 of two) and fields (2 of x, y or 3 of x, y, z)`);
  }
  if (vars.length === 1) return { ...base, kind: 'function', exprs: [body], tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A function of one variable, with its derivatives, tangent line and area.' };
  if (vars.length === 2) return { ...base, kind: 'surface', exprs: [body], tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A surface z = f(x, y) — rotate it, and drag a point to see its tangent plane and gradient.' };
  if (vars.length === 3) return { ...base, kind: 'implicit3d', exprs: [body], tex: `${lhsTeX} = ${toTeX(body)}`, describe: 'A scalar field of three variables, drawn as level surfaces.' };
  throw new InputError('MathVerse can draw functions of up to three variables');
}

function fromExpression(n: Node, name: string | undefined, src: string): Classified {
  void src;
  if (n.t === 'matrix') return { kind: 'matrix', name: name ?? 'A', vars: [], exprs: [n], params: paramsOf([n], []), tex: `${name ? name + ' = ' : ''}${toTeX(n)}`, describe: 'A matrix, seen as a transformation of the plane or space.', warnings: [] };
  const free = freeSymbols(n);
  if (n.t === 'tuple') {
    const vs = inferVars([n], 3);
    if (vs.length === 0) return { kind: 'vector', name, vars: [], exprs: n.items, params: [], tex: `${name ? name + ' = ' : ''}${toTeX(n)}`, describe: 'A vector — drag its tip.', warnings: [] };
    if (vs.length === 1 && (vs[0] === 't' || vs[0] === 's')) return fromDefinition(name ?? 'r', vs, n);
    if (vs.includes('u') && vs.includes('v')) return fromDefinition(name ?? 'r', ['u', 'v'], n);
    return fromDefinition(name ?? 'F', n.items.length === 3 ? ['x', 'y', 'z'] : ['x', 'y'], n);
  }
  if (free.size === 0) {
    const value = evaluate(n);
    return { kind: 'value', vars: [], exprs: [n], params: [], value, tex: `${toTeX(n)} = ${+value.toPrecision(12)}`, describe: 'A number.', warnings: [] };
  }
  const vs = inferVars([n], 3, ['x', 'y', 'z']);
  if (vs.length >= 2) return fromDefinition(name ?? 'f', vs.length === 3 ? ['x', 'y', 'z'] : ['x', 'y'], n);
  if (free.has('theta')) return { kind: 'polar', name: 'r', vars: ['theta'], exprs: [n], params: paramsOf([n], ['theta']), tex: `r = ${toTeX(n)}`, describe: 'A polar curve r(θ).', warnings: [] };
  const v = vs[0] ?? (free.has('t') ? 't' : [...free].sort()[0]);
  return fromDefinition(name ?? 'f', [v], n);
}

function classifySecondOrder(src: string): Classified {
  // write every y'' as y_pp and y' as y_p, then solve the (linear in y'') equation for y''
  const m = /([A-Za-z])(?:''|″|′′)/.exec(src)!;
  const y = m[1];
  const s = src.replace(new RegExp(`${y}(''|″|′′)`, 'g'), `${y}_pp`).replace(new RegExp(`${y}('|′)`, 'g'), `${y}_p`);
  const eq = splitEquals(s);
  if (!eq) throw new InputError(`Write it as an equation, e.g. ${y}'' + 0.5${y}' + 4${y} = 0`);
  const F = sub(tryParse(eq[0], [`${y}_pp`, `${y}_p`, y, 't']), tryParse(eq[1], [`${y}_pp`, `${y}_p`, y, 't']));
  // F is linear in y_pp: y_pp = −(F with y_pp=0) / (∂F/∂y_pp)
  const a = derivative(F, `${y}_pp`);
  if (freeSymbols(a).has(`${y}_pp`)) throw new InputError(`MathVerse needs ${y}'' to appear linearly`);
  const F0 = substituteZero(F, `${y}_pp`);
  const rhs = { t: 'div', a: { t: 'neg', a: F0 }, b: a } as Node;
  return {
    kind: 'ode2', vars: ['t'], dependent: [y], exprs: [rhs], params: paramsOf([rhs], ['t', y, `${y}_p`]),
    tex: src.replace(/''/g, "''"), describe: 'A second-order equation: its solution, its phase portrait (y, y′), and a mass on a spring that moves as it says.', warnings: [],
  };
}

function substituteZero(n: Node, name: string): Node {
  return JSON.parse(JSON.stringify(n), (_k, v) => (v && v.t === 'sym' && v.name === name ? { t: 'num', v: 0 } : v));
}

function classifySystem(lines: string[]): Classified {
  const deps: string[] = [], rhs: Node[] = [];
  let t = 't';
  for (const line of lines) {
    const eq = splitEquals(line);
    const dm = eq && DERIV_TIME.exec(eq[0]);
    if (!eq || !dm) throw new InputError(`Each line of a system should look like dx/dt = …  (“${line}” does not)`);
    deps.push(dm[1]); t = dm[2];
  }
  for (const line of lines) rhs.push(tryParse(splitEquals(line)![1], [...deps, t]));
  return {
    kind: 'odeSystem', vars: [t], dependent: deps, exprs: rhs, params: paramsOf(rhs, [t, ...deps]),
    tex: lines.map((l, i) => `\\frac{d${deps[i]}}{d${t}} = ${toTeX(rhs[i])}`).join(',\\quad '),
    describe: deps.length === 2 ? 'A system in the plane: its phase portrait, with trajectories from any starting point you click.' : 'A system of ODEs, solved from your starting point.', warnings: [],
  };
}

function classifyPDE(src: string): Classified {
  const s = src.replace(/\s/g, '')
    .replace(/∂²u\/∂t²|∂\^2u\/∂t\^2|u_tt/g, 'UTT').replace(/∂u\/∂t|u_t/g, 'UT')
    .replace(/∂²u\/∂x²|∂\^2u\/∂x\^2|u_xx/g, 'UXX').replace(/∂²u\/∂y²|∂\^2u\/∂y\^2|u_yy/g, 'UYY')
    .replace(/∂u\/∂x|u_x/g, 'UX').replace(/∇²u|∇\^2u|laplacian\(u\)/gi, 'LAP');
  const coeffOf = (expr: string, term: string): Node => {
    const m = new RegExp(`^(.*?)\\*?${term}$`).exec(expr);
    if (!m) throw new InputError('MathVerse recognizes the heat, wave, Laplace, Poisson and advection equations in their standard forms');
    const c = m[1].replace(/\*$/, '');
    return c === '' ? num(1) : c === '-' ? num(-1) : tryParse(c);
  };
  const eq = splitEquals(s);
  if (!eq) throw new InputError('Write the PDE as an equation, e.g. ∂u/∂t = α ∂²u/∂x²');
  const [l, r] = eq;
  const mk = (family: 'heat' | 'wave' | 'laplace' | 'poisson' | 'advection', dims: 1 | 2, coeff: Node, tex: string, describe: string, source?: Node): Classified =>
    ({ kind: 'pde', vars: dims === 1 ? ['x', 't'] : ['x', 'y', 't'], exprs: [coeff], params: paramsOf([coeff, ...(source ? [source] : [])], ['x', 'y', 't']), pde: { family, dims, coeff, source }, tex, describe, warnings: [] });
  if (l === 'UT' && /UXX/.test(r) && /UYY/.test(r)) {
    const c = coeffOf(r.replace(/\(UXX\+UYY\)/, 'LAP2').replace(/LAP2/, 'UXX'), 'UXX');
    return mk('heat', 2, c, `\\frac{\\partial u}{\\partial t} = ${toTeX(c)}\\,\\nabla^2 u`, 'The heat equation on a plate: a temperature surface that diffuses as you watch.');
  }
  if (l === 'UT' && /LAP$/.test(r)) { const c = coeffOf(r, 'LAP'); return mk('heat', 2, c, `\\frac{\\partial u}{\\partial t} = ${toTeX(c)}\\,\\nabla^2 u`, 'The heat equation on a plate.'); }
  if (l === 'UT' && /UXX$/.test(r)) { const c = coeffOf(r, 'UXX'); return mk('heat', 1, c, `\\frac{\\partial u}{\\partial t} = ${toTeX(c)}\\,\\frac{\\partial^2 u}{\\partial x^2}`, 'The heat equation on a rod: u(x, t) as a surface over space and time, and as a moving profile.'); }
  if (l === 'UT' && /UX$/.test(r)) { const c = coeffOf(r.replace(/^-/, ''), 'UX'); return mk('advection', 1, c, `\\frac{\\partial u}{\\partial t} = ${r.startsWith('-') ? '-' : ''}${toTeX(c)}\\,\\frac{\\partial u}{\\partial x}`, 'The advection equation: a profile carried along at constant speed.'); }
  if (l === 'UTT' && /LAP$/.test(r)) { const c = coeffOf(r, 'LAP'); return mk('wave', 2, c, `\\frac{\\partial^2 u}{\\partial t^2} = ${toTeX(c)}\\,\\nabla^2 u`, 'The wave equation on a membrane: a vibrating drum.'); }
  if (l === 'UTT' && /UXX$/.test(r)) { const c = coeffOf(r, 'UXX'); return mk('wave', 1, c, `\\frac{\\partial^2 u}{\\partial t^2} = ${toTeX(c)}\\,\\frac{\\partial^2 u}{\\partial x^2}`, 'The wave equation on a string.'); }
  if ((l === 'LAP' || l === 'UXX+UYY') && r === '0') return mk('laplace', 2, num(1), '\\nabla^2 u = 0', 'Laplace’s equation: the steady state, set by the boundary values you choose.');
  if (l === 'LAP' || l === 'UXX+UYY') { const f = tryParse(r); return mk('poisson', 2, num(1), `\\nabla^2 u = ${toTeX(f)}`, 'Poisson’s equation: the potential of the source you typed.', f); }
  throw new InputError('MathVerse recognizes ∂u/∂t = α ∂²u/∂x² (heat), ∂²u/∂t² = c² ∂²u/∂x² (wave), ∇²u = 0 (Laplace), ∇²u = f (Poisson) and ∂u/∂t = −c ∂u/∂x (advection), in one or two space dimensions');
}
