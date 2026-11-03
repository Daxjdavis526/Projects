import { describe, it, expect } from 'vitest';
import { classify, InputError } from '../src/core/input/classify';

const k = (s: string) => classify(s);

describe('universal input', () => {
  it('recognizes every example from the brief', () => {
    expect(k('f(x) = x³ - 4x').kind).toBe('function');
    const s = k('z = A sin(Bx) cos(Cy)');
    expect(s.kind).toBe('surface');
    expect(s.params.map((p) => p.key)).toEqual(['A', 'B', 'C']);
    expect(k('r(t) = (cos(t), sin(t), t)').kind).toBe('curve3d');
    expect(k('F(x,y,z) = (y, -x, z)').kind).toBe('field3d');
    expect(k('A = [[2,1],[1,2]]').kind).toBe('matrix');
    const o = k('dy/dt = -2y');
    expect(o.kind).toBe('ode1'); expect(o.dependent).toEqual(['y']);
    const p = k('∂u/∂t = α∂²u/∂x²');
    expect(p.kind).toBe('pde'); expect(p.pde!.family).toBe('heat'); expect(p.params.map((q) => q.key)).toEqual(['alpha']);
  });
  it('more forms', () => {
    expect(k('x^2 + y^2 = 1').kind).toBe('implicit2d');
    expect(k('r = 1 + cos(θ)').kind).toBe('polar');
    expect(k('y = x^2').kind).toBe('function');
    expect(k('sin(x)/x').kind).toBe('function');
    expect(k('x^2 - y^2').kind).toBe('surface');
    expect(k('r(u,v) = (cos u sin v, sin u sin v, cos v)').kind).toBe('paramSurface');
    expect(k('F(x,y) = (-y, x)').kind).toBe('field2d');
    expect(k('2+3').value).toBe(5);
    const sys = k('dx/dt = y; dy/dt = -x - 0.2y');
    expect(sys.kind).toBe('odeSystem'); expect(sys.dependent).toEqual(['x', 'y']);
    const second = k("y'' + c y' + k y = 0");
    expect(second.kind).toBe('ode2'); expect(second.params.map((q) => q.key)).toEqual(['c', 'k']);
    expect(k('∂²u/∂t² = c²∇²u').pde!.family).toBe('wave');
    expect(k('∇²u = 0').pde!.family).toBe('laplace');
    expect(k('u_t = 0.1 u_xx').pde!.dims).toBe(1);
  });
  it('explains mistakes', () => {
    expect(() => k('f(x) = sin(')).toThrow(InputError);
    expect(() => k('x = 1 = 2')).toThrow(/one “=”/);
    expect(() => k('')).toThrow(/Type something/);
  });
});
