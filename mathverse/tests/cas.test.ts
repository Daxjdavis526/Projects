// The SymPy service, run for real: Pyodide in Node loads the same cas.py the
// app's worker runs, from the same hash-checked wheels.
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { parse, toSympy, freeSymbols } from '../src/core/expr';
import { verifyAntiderivative } from '../src/cas/client';

const BASE = join(__dirname, '..', 'public', 'pyodide');
const have = existsSync(join(BASE, 'pyodide.mjs'));
let handle: (s: string) => string;

const call = (op: string, args: Record<string, unknown>) => JSON.parse(handle(JSON.stringify({ op, args })));
const names = (s: string) => [...freeSymbols(parse(s))];

describe.skipIf(!have)('SymPy service (Pyodide)', () => {
  beforeAll(async () => {
    const { loadPyodide } = await import(join(BASE, 'pyodide.mjs'));
    const py = await loadPyodide({ indexURL: BASE + '/' });
    const manifest = JSON.parse(readFileSync(join(BASE, 'wheels', 'wheels.json'), 'utf8'));
    for (const pkg of ['mpmath', 'sympy']) {
      const file = Object.keys(manifest).find((f) => f.startsWith(pkg + '-'))!;
      const buf = readFileSync(join(BASE, 'wheels', file));
      expect(createHash('sha256').update(buf).digest('hex')).toBe(manifest[file].sha256);
      py.unpackArchive(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), 'wheel');
    }
    py.runPython(readFileSync(join(__dirname, '..', 'src', 'cas', 'cas.py'), 'utf8'));
    handle = py.globals.get('handle');
  }, 120000);

  it('integrates by parts, with SymPy’s own steps, and the answer differentiates back', () => {
    const f = 'x*exp(x)';
    const r = call('integrate', { expr: toSympy(parse(f)), names: names(f), var: 'x' });
    expect(r.ok).toBe(true);
    expect(r.steps.some((s: { rule: string }) => s.rule === 'Parts')).toBe(true);
    const F = parse(r.antiderivative.text);
    expect(verifyAntiderivative(F, parse(f), 'x', {}).ok).toBe(true);
  });
  it('substitution, trig substitution and partial fractions', () => {
    for (const f of ['2*x*cos(x^2)', 'sqrt(1 - x^2)', '1/(x^2 - 1)', 'sin(x)^2', 'x/(x^2 + 1)']) {
      const r = call('integrate', { expr: toSympy(parse(f)), names: names(f), var: 'x' });
      expect(r.ok, f).toBe(true);
      const F = parse(r.antiderivative.text);
      expect(verifyAntiderivative(F, parse(f), 'x', {}, f.includes('sqrt') ? -0.9 : 1.2, f.includes('sqrt') ? 0.9 : 3).ok, f).toBe(true);
    }
    const pf = call('apart', { expr: toSympy(parse('1/(x^2 - 1)')), names: ['x'], var: 'x' });
    expect(pf.result.text.replace(/\s/g, '')).toMatch(/1\/\(2\*\(x-1\)\)|-1\/\(2\*\(x\+1\)\)/);
  });
  it('definite integrals, exact', () => {
    const r = call('integrate', { expr: toSympy(parse('exp(-x^2)')), names: ['x'], var: 'x', a: '-oo', b: 'oo' });
    expect(r.definite.value).toBeCloseTo(Math.sqrt(Math.PI), 12);
    expect(r.definite.latex).toContain('\\sqrt{\\pi}');
  });
  it('series, limits, solving, ODEs and exact eigenvalues', () => {
    const s = call('series', { expr: toSympy(parse('sin(x)')), names: ['x'], var: 'x', a: '0', n: 6 });
    expect(s.polynomial.text.replace(/\s/g, '')).toBe('x^5/120-x^3/6+x');
    expect(call('limit', { expr: toSympy(parse('sin(x)/x')), names: ['x'], var: 'x', a: '0' }).result.text).toBe('1');
    expect(call('solve', { expr: toSympy(parse('x^2 - 4')), names: ['x'], var: 'x' }).solutions.map((o: { text: string }) => o.text).sort()).toEqual(['-2', '2']);
    const ode = call('dsolve', { rhs: toSympy(parse('-2*y')), names: ['y'], dep: 'y', var: 't', order: 1, ics: { t0: 0, y0: 3 } });
    expect(ode.solution.text.replace(/\s/g, '')).toBe('3*exp(-2*t)');
    const eg = call('eigen', { matrix: toSympy(parse('[[2,1],[1,2]]')), names: [] });
    expect(eg.eigen.map((e: { value: { text: string } }) => e.value.text).sort()).toEqual(['1', '3']);
  });
  it('user symbols named like SymPy functions stay symbols', () => {
    const f = 'gamma*x + lambda';
    const r = call('integrate', { expr: toSympy(parse(f, { names: ['gamma', 'lambda'] })), names: ['gamma', 'lambda', 'x'], var: 'x' });
    expect(r.ok).toBe(true);
    expect(r.antiderivative.text).toContain('gamma');
  });
  it('rejects anything that is not mathematics', () => {
    for (const evil of ['__import__("os").system("x")', 'open("/etc/passwd")', 'v_x.__class__', 'eval("1")']) {
      const r = call('simplify', { expr: evil, names: ['x'] });
      expect(r.ok, evil).toBe(false);
    }
  });
});
