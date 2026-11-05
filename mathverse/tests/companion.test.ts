// The Homework Companion's DOM-free logic: the step-recording differentiator
// (checked against the core differentiator), exact row reduction (checked
// against linalg's rref), reading problems, persistence and project files, and
// the worked solutions — the CAS ones run against the real SymPy service in
// Pyodide when it is installed.
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse, derivative, equal, compile, toTeX, freeSymbols } from '../src/core/expr';
import { rref } from '../src/core/numeric/linalg';
import { differentiateWithSteps, recordDiff, rulesUsed, flattenDiff } from '../src/companion/stepdiff';
import { rrefSteps, Q, readLinearSystem, solutionFromRref, detSteps, matrixTeX } from '../src/companion/linsys';
import { analyze, readIntent, readState, newProblem, problemToWorkspace, workspaceToProblem, saveState, loadState, STORAGE_KEY, extraParams, defaultTask } from '../src/companion/model';
import { runTask, readCas, agree, CasLike, RunCtx, workToTeX } from '../src/companion/tasks';
import { readProject, writeProject } from '../src/project/format';
import { cas } from '../src/cas/client';

const P = (s: string) => parse(s);

describe('step-recording differentiator', () => {
  const cases = [
    'x^2 sin(x)', 'sin(x^2)', 'e^(3x) cos(2x)', 'ln(x)/x', '(x^2 + 1)/(x - 3)', 'sqrt(1 - x^2)', 'x^x', '3x^4 - 5x + 7',
    'atan(x/2)', '2^x', 'tan(x)^3', '-cos(x)', 'exp(-x^2/2)', 'asin(2x)', 'x/5', '7/x', 'sinh(x) cosh(x)', 'abs(x)', 'a x^2 + b x + c', 'atan2(x, 2)', 'hypot(x, 3)',
  ];
  it('reproduces the core derivative exactly, for every rule', () => {
    for (const s of cases) {
      const f = parse(s, { names: [] });
      const w = differentiateWithSteps(f, 'x');
      expect(equal(w.result, derivative(f, 'x')), s).toBe(true);
      expect(w.check.matchesEngine, s).toBe(true);
      if (s !== 'abs(x)') expect(w.check.ok, `${s}: ${w.check.text}`).toBe(true);
    }
  });
  it('names the rules a student would name', () => {
    const r = (s: string) => rulesUsed(recordDiff(P(s), 'x'));
    expect(r('x^2 sin(x)')).toEqual(expect.arrayContaining(['Product rule', 'Power rule', 'Derivative of sin']));
    expect(r('sin(x^2)')).toEqual(expect.arrayContaining(['Chain rule (outer: sin)', 'Power rule']));
    expect(r('ln(x)/x')[0]).toBe('Quotient rule');
    expect(r('x^x')).toContain('Logarithmic differentiation');
    expect(r('2^x')).toContain('Exponential rule');
    expect(r('3x^4 - 5x + 7')).toEqual(expect.arrayContaining(['Difference rule', 'Sum rule', 'Constant multiple rule', 'Power rule']));
    expect(r('(x^2+1)^5')).toContain('Power rule with the chain rule');
    expect(r('x/5')[0]).toMatch(/Constant multiple/);
  });
  it('plans, recurses and combines in order, with hints', () => {
    const steps = flattenDiff(recordDiff(P('x^2 sin(x)'), 'x'), 'x');
    expect(steps[0].phase).toBe('plan');
    expect(steps[0].name).toBe('Product rule');
    expect(steps[steps.length - 1].phase).toBe('combine');
    expect(steps.every((s) => s.hint.length > 0)).toBe(true);
    expect(steps.some((s) => s.depth === 1)).toBe(true);
  });
  it('treats other variables as constants in a partial derivative', () => {
    const f = P('x^2 y + sin(x y)');
    const w = differentiateWithSteps(f, 'y', { partial: true });
    expect(equal(w.result, derivative(f, 'y'))).toBe(true);
    expect(w.steps.at(-1)!.tex).toContain('\\partial');
  });
  it('flags a function it cannot differentiate, like the core does', () => {
    expect(() => differentiateWithSteps(P('gamma(x)'), 'x')).toThrow(/no derivative formula/);
  });
  it('a numerical check catches a wrong derivative', () => {
    const w = differentiateWithSteps(P('x^3'), 'x');
    expect(w.check.numericPoints).toBeGreaterThanOrEqual(3);
    expect(w.check.maxRelErr).toBeLessThan(1e-7);
  });
});

describe('exact row reduction', () => {
  it('rationals', () => {
    expect(Q.of(0.25)!.tex()).toBe('\\frac{1}{4}');
    expect(Q.of(-1.5)!.text()).toBe('-3/2');
    expect(new Q(6n, -4n).text()).toBe('-3/2');
    expect(Q.of(1 / 3)).toBeNull();
  });
  it('agrees with linalg.rref and records every operation', () => {
    for (const A of [[[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]], [[1, 2], [2, 4]], [[0, 1, 2], [1, 0, 3], [4, -3, 8]], [[0.5, 0.25], [1.5, 2]], [[Math.PI, 1], [1, Math.E]]]) {
      const w = rrefSteps(A);
      expect(w.agreesWithEngine).toBe(true);
      expect(w.pivots).toEqual(rref(A).pivots);
      expect(w.steps.length).toBeGreaterThan(0);
    }
    const w = rrefSteps([[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]);
    expect(w.exact).toBe(true);
    expect(w.R.map((r) => r[3])).toEqual(['2', '3', '-1']);
    expect(w.steps.some((s) => s.kind === 'swap')).toBe(true);
    expect(rrefSteps([[1, 3], [2, 1]]).steps.some((s) => /frac/.test(s.matrix.flat().join()))).toBe(true);
    expect(rrefSteps([[Math.PI, 1], [1, Math.E]]).exact).toBe(false);
  });
  it('reads a linear system and solves it, including the singular cases', () => {
    const s = readLinearSystem('x + 2y = 5; 3x - y = 1')!;
    expect(s.vars).toEqual(['x', 'y']);
    expect(s.A).toEqual([[1, 2], [3, -1]]);
    expect(s.b).toEqual([5, 1]);
    const sol = solutionFromRref(rrefSteps(s.A.map((r, i) => [...r, s.b[i]])), s.vars);
    expect(sol.kind).toBe('unique');
    expect(sol.x![0]).toBeCloseTo(1, 12); expect(sol.x![1]).toBeCloseTo(2, 12);
    const none = readLinearSystem('x + y = 1\nx + y = 2')!;
    expect(solutionFromRref(rrefSteps(none.A.map((r, i) => [...r, none.b[i]])), none.vars).kind).toBe('none');
    const inf = readLinearSystem('x + y + z = 1; 2x + 2y + 2z = 2')!;
    const si = solutionFromRref(rrefSteps(inf.A.map((r, i) => [...r, inf.b[i]])), inf.vars);
    expect(si.kind).toBe('infinite');
    expect(si.free).toEqual(['y', 'z']);
    expect(readLinearSystem('x^2 + y = 1; x - y = 0')).toBeNull();               // not linear
    expect(readLinearSystem('dx/dt = y; dy/dt = -x')).toBeNull();                // an ODE system
  });
  it('exact determinants by cofactors', () => {
    expect(detSteps([[1, 2], [3, 4]])!.tex).toBe('-2');
    expect(detSteps([[2, 0, 1], [1, 3, 2], [1, 1, 2]])!.value).toBeCloseTo(6, 12);
    expect(detSteps([[0.5, 1], [1, 4]])!.tex).toBe('1');
    expect(matrixTeX([['1', '2'], ['3', '4']], 1)).toContain('{c|c}');
  });
});

describe('reading a homework problem', () => {
  it('homework phrasings', () => {
    expect(readIntent('d/dx x^2 sin x')).toEqual({ body: 'x^2 sin x', intent: { task: 'diff', var: 'x' } });
    expect(readIntent('∫ x e^x dx').intent).toEqual({ task: 'integral', var: 'x' });
    const def = readIntent('∫_0^pi sin(x) dx');
    expect(def.intent.task).toBe('definite'); expect(def.intent.hi).toBeCloseTo(Math.PI, 12); expect(def.body).toBe('sin(x)');
    expect(readIntent('lim x->0 sin(x)/x')).toEqual({ body: 'sin(x)/x', intent: { task: 'limit', var: 'x', at: '0' } });
    expect(readIntent('lim x→∞ (1+1/x)^x').intent.at).toBe('inf');
  });
  it('classifies and picks the subject', () => {
    const cases: [string, string, string][] = [
      ['x^2 sin(x)', 'function', 'calc1'], ['x^2 - 5x + 6 = 0', 'equation', 'calc1'], ['sin(x) = 1/2', 'equation', 'calc1'],
      ['z = x^2 - y^2', 'surface', 'calc3'], ['[[2,1],[1,2]]', 'matrix', 'linalg'], ['x + 2y = 5; 3x - y = 1', 'system', 'linalg'],
      ['dy/dt = -2y', 'ode1', 'ode'], ["y'' + 4y = 0", 'ode2', 'ode'], ['∂u/∂t = α ∂²u/∂x²', 'pde', 'pde'], ['r(t) = (cos t, sin t, t)', 'curve3d', 'geometry'],
      ['x^2 + y^2 = 1', 'implicit2d', 'calc1'], ['F(x,y) = (-y, x)', 'field2d', 'calc3'], ['∫ x e^x dx', 'function', 'calc1'],
    ];
    for (const [s, kind, subject] of cases) {
      const a = analyze(s);
      expect(a.kind, s).toBe(kind);
      expect(a.guessed, s).toBe(subject);
      expect(a.tasks.length, s).toBeGreaterThan(0);
    }
    expect(analyze('x^2 - 5x + 6 = 0').rearranged!.tex).toContain('= 0');
    expect(defaultTask(analyze('∫ x e^x dx'))).toBe('integral');
    expect(defaultTask(analyze('x^2 sin x', 'calc2'))).toBe('integral');
    expect(defaultTask(analyze('x^2 sin x', 'calc1'))).toBe('diff');
    expect(analyze('a x^2 + b x + c = 0').params.map((p) => p.key)).toEqual(['a', 'b', 'c']);
    expect(analyze('x^2 sin x', 'linalg').warnings.join()).toMatch(/Calculus I/);
    expect(() => analyze('')).toThrow();
  });
  it('task sliders never collide with typed symbols', () => {
    const keys = extraParams(analyze('a sin(b x)'), 'series', 'taylor').map((p) => p.key);
    expect(keys).toEqual(['x0', 'order']);
    // 'x0' typed by a user reads as x·0, never as a symbol named x0
    expect([...freeSymbols(parse('a sin(b x) + x0'))].sort()).toEqual(['a', 'b', 'x']);
  });
});

describe('persistence and project files', () => {
  it('round-trips through storage, validating everything', () => {
    const mem = new Map<string, string>();
    const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); } };
    const p = newProblem('x^2', { notes: 'hw 3 #4', params: { a: 2 }, mode: 'steps', subject: 'calc2', task: 'integral' });
    expect(saveState({ version: 1, tabs: [p], active: 0, saved: [p] }, store)).toBe(true);
    const back = loadState(store);
    expect(back.tabs[0]).toEqual(p);
    expect(back.saved).toHaveLength(1);
    mem.set(STORAGE_KEY, JSON.stringify({ tabs: [{ input: 5, subject: 'evil', params: { __proto__: 1, ok: 3, bad: 'x' }, task: '<script>' }], active: 99 }));
    const v = loadState(store);
    expect(v.tabs[0].input).toBe('');
    expect(v.tabs[0].subject).toBe('auto');
    expect(Object.keys(v.tabs[0].params)).toEqual(['ok']);
    expect(v.tabs[0].task).toBe('');
    expect(v.active).toBe(0);
    expect(readState('not json').tabs).toHaveLength(1);
  });
  it('exports to a .mathverse project and reads it back', () => {
    const p = newProblem('z = x^2 - y^2', { title: 'Saddle', notes: 'saddle at 0', subject: 'calc3', task: 'partials', params: { x0: 0.3 } });
    const proj = { format: 'mathverse' as const, version: 1, name: 'HW', created: '', modified: '', tabs: [problemToWorkspace(p)], active: 0 };
    const back = workspaceToProblem(readProject(writeProject(proj)).tabs[0]);
    expect(back.input).toBe(p.input); expect(back.notes).toBe(p.notes); expect(back.subject).toBe('calc3'); expect(back.task).toBe('partials'); expect(back.params.x0).toBe(0.3);
    expect(readProject(writeProject(proj)).tabs[0].demoId).toBe('explore');
  });
});

// a CAS that refuses: the TS-only tasks must not need it
const noCas: CasLike = { call: () => Promise.reject(new Error('no CAS in this test')) };
const ctxFor = (src: string, task: string, params: Record<string, number> = {}, at = '0', c: CasLike = noCas): RunCtx => {
  const an = analyze(src);
  const all = Object.fromEntries([...an.params, ...extraParams(an, task, '')].map((p) => [p.key, p.value]));
  return { an, task, params: { ...all, ...params }, at, cas: c };
};

describe('worked solutions without the CAS', () => {
  it('derivative with a tangent line', async () => {
    const w = await runTask(ctxFor('x^2 sin(x)', 'diff', { x0: 1 }));
    expect(w.check.status).toBe('verified');
    expect(w.answer!.tex).toContain(toTeX(derivative(P('x^2 sin(x)'), 'x')));
    expect(w.steps.at(-1)!.title).toMatch(/Tangent/);
    expect(w.marks!.lines![0].m).toBeCloseTo(2 * Math.sin(1) + Math.cos(1), 12);
  });
  it('partials, tangent plane, curvature, div/curl, implicit', async () => {
    expect((await runTask(ctxFor('z = x^2 y + sin(y)', 'partials'))).check.status).toBe('verified');
    const crit = await runTask(ctxFor('z = x^3 - 3x + y^2', 'critical'));
    expect(crit.answer!.tex).toMatch(/saddle/); expect(crit.answer!.tex).toMatch(/minimum/);
    const k = await runTask(ctxFor('r(t) = (cos t, sin t)', 'curvature'));
    expect(k.answer!.tex).toContain('\\kappa = 1');
    const h = await runTask(ctxFor('r(t) = (cos t, sin t, t)', 'curvature'));
    expect(h.answer!.tex).toMatch(/\\kappa = 0\.5,\\quad \\tau = 0\.5/);
    const dc = await runTask(ctxFor('F(x,y) = (-y, x)', 'divcurl'));
    expect(dc.answer!.tex).toContain('\\nabla\\cdot\\mathbf F = 0');
    expect(dc.answer!.tex).toContain('= 2');
    const im = await runTask(ctxFor('x^2 + y^2 = 1', 'implicit', { x0: 0.6 }));
    expect(im.check.status).toBe('verified');
    expect(im.marks!.lines![0].m).toBeCloseTo(0.75, 9);                         // at (0.6, −0.8): dy/dx = −x/y
  });
  it('linear algebra: system, rref, inverse, determinant', async () => {
    const s = await runTask(ctxFor('2x + y - z = 8; -3x - y + 2z = -11; -2x + y + 2z = -3', 'system'));
    expect(s.check.status).toBe('verified');
    expect(s.answer!.tex).toBe('x = 2,\\quad y = 3,\\quad z = -1');
    const inv = await runTask(ctxFor('[[2,1],[1,1]]', 'inverse'));
    expect(inv.check.status).toBe('verified');
    expect(inv.answer!.tex).toContain('-1');
    expect((await runTask(ctxFor('[[1,2],[2,4]]', 'inverse'))).answer!.tex).toMatch(/singular/);
    const d = await runTask(ctxFor('[[1,2],[3,4]]', 'det'));
    expect(d.answer!.tex).toBe('\\det A = -2'); expect(d.check.status).toBe('verified');
    expect((await runTask(ctxFor('[[1,2,3],[4,5,6],[7,8,10]]', 'rref'))).check.status).toBe('verified');
  });
  it('PDE product solutions satisfy their equations; phase portraits classify equilibria', async () => {
    for (const s of ['∂u/∂t = α ∂²u/∂x²', '∂²u/∂t² = c^2 ∂²u/∂x²', '∇²u = 0']) expect((await runTask(ctxFor(s, 'separate', { k: 2 }))).check.status, s).toBe('verified');
    const ph = await runTask(ctxFor('dx/dt = y; dy/dt = -x - 0.5y', 'phase'));
    expect(ph.answer!.tex).toMatch(/stable spiral/);
  });
  it('a LaTeX export of the work', async () => {
    const w = await runTask(ctxFor('x^2 sin(x)', 'diff'));
    const tex = workToTeX('Problem 1', 'x^2\\sin x', w);
    expect(tex).toContain('\\begin{document}'); expect(tex).toContain('Product rule');
  });
  it('SymPy results are only trusted when MathVerse can read every name', () => {
    expect(readCas({ latex: '', text: 'x*exp(x) - exp(x)', numeric: false }, ['x'])).not.toBeNull();
    expect(readCas({ latex: '', text: 'erfi(x)', numeric: false }, ['x'])).toBeNull();
    expect(readCas({ latex: '', text: '1 + 2*I', numeric: false }, [])).toBeNull();
    expect(readCas({ latex: '', text: 'C1*exp(t)', numeric: false }, ['t'])).toBeNull();
    expect(agree(P('(x+1)^2'), P('x^2 + 2x + 1'), ['x'], {}).ok).toBe(true);
    expect(agree(P('(x+1)^2'), P('x^2 + 1'), ['x'], {}).ok).toBe(false);
  });
});

// ── with the real SymPy service ─────────────────────────────────────────────
const BASE = join(__dirname, '..', 'public', 'pyodide');
const have = existsSync(join(BASE, 'pyodide.mjs'));

describe.skipIf(!have)('worked solutions with SymPy (Pyodide)', () => {
  let py: CasLike;
  beforeAll(async () => {
    const { loadPyodide } = await import(join(BASE, 'pyodide.mjs'));
    const pyo = await loadPyodide({ indexURL: BASE + '/' });
    const manifest = JSON.parse(readFileSync(join(BASE, 'wheels', 'wheels.json'), 'utf8'));
    for (const pkg of ['mpmath', 'sympy']) {
      const file = Object.keys(manifest).find((f) => f.startsWith(pkg + '-'))!;
      const buf = readFileSync(join(BASE, 'wheels', file));
      pyo.unpackArchive(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), 'wheel');
    }
    pyo.runPython(readFileSync(join(__dirname, '..', 'src', 'cas', 'cas.py'), 'utf8'));
    const handle = pyo.globals.get('handle');
    py = { call: async <T,>(op: string, args: Record<string, unknown>) => { const r = JSON.parse(handle(JSON.stringify({ op, args }))); if (!r.ok) throw new Error(r.error); return r as T; } };
    // integrateSymbolic goes through the app's CAS client: route it to this Pyodide
    (cas as unknown as { call: CasLike['call'] }).call = py.call;
  }, 180000);

  it('integrates with SymPy’s steps and verifies by differentiating back', async () => {
    const w = await runTask(ctxFor('x e^x', 'integral', {}, '0', py));
    expect(w.check.status).toBe('verified');
    expect(w.steps.some((s) => s.rule === 'Parts')).toBe(true);
    const d = await runTask(ctxFor('∫_0^pi sin(x)^2 dx', 'definite', {}, '0', py));
    expect(d.check.status).toBe('verified');
    expect(d.answer!.tex).toContain('\\frac{\\pi}{2}');                          // typed limits stay exact
    expect(d.answer!.label).toBe('Exact value');
  }, 60000);
  it('solves, factors and checks each root', async () => {
    const w = await runTask(ctxFor('x^2 - 5x + 6 = 0', 'solve', {}, '0', py));
    expect(w.check.status).toBe('verified');
    expect(w.answer!.tex).toMatch(/x = 2/); expect(w.answer!.tex).toMatch(/x = 3/);
    expect(w.steps.some((s) => s.title === 'Factor')).toBe(true);
    const c = await runTask(ctxFor('x^2 + 1 = 0', 'solve', {}, '0', py));
    expect(c.check.status).toBe('unverified');                                    // complex roots: honest, not "verified"
  }, 60000);
  it('limits (with L’Hôpital), series, partial fractions, extrema', async () => {
    const l = await runTask(ctxFor('sin(x)/x', 'limit', {}, '0', py));
    expect(l.answer!.tex).toContain('= 1'); expect(l.check.status).toBe('verified');
    expect(l.steps.some((s) => /L’Hôpital/.test(s.title))).toBe(true);
    const s = await runTask(ctxFor('cos(x)', 'series', { order: 6 }, '0', py));
    expect(s.check.status).toBe('verified');
    const pf = await runTask(ctxFor('1/(x^2 - 1)', 'apart', {}, '0', py));
    expect(pf.check.status).toBe('verified');
    const ex = await runTask(ctxFor('x^3 - 3x', 'extrema', {}, '0', py));
    expect(ex.check.status).toBe('verified');
    expect(ex.answer!.tex).toMatch(/maximum/); expect(ex.answer!.tex).toMatch(/minimum/);
  }, 90000);
  it('ODEs: dsolve, substitution check and numerical comparison', async () => {
    const w = await runTask(ctxFor('dy/dt = -2y', 'dsolve', { t0: 0, icY: 3 }, '0', py));
    expect(w.check.status).toBe('verified');
    expect(w.answer!.tex).toContain('3');
    const o2 = await runTask(ctxFor("y'' + 4y = 0", 'dsolve', { t0: 0, icY: 1, icV: 0 }, '0', py));
    expect(o2.check.status).toBe('verified');
    expect(compile(o2.marks!.curve!, ['t'])([1])).toBeCloseTo(Math.cos(2), 10);
  }, 90000);
  it('exact eigenvalues checked against Av = λv and the QR algorithm', async () => {
    const w = await runTask(ctxFor('[[2,1],[1,2]]', 'eigen', {}, '0', py));
    expect(w.check.status).toBe('verified');
    const r = await runTask(ctxFor('[[0,-1],[1,0]]', 'eigen', {}, '0', py));
    expect(r.check.status).toBe('verified');                                     // ±i, compared as a complex pair
  }, 60000);
});
