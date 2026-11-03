import { describe, it, expect } from 'vitest';
import { oneSidedLimit, classifyPoint, largestDelta } from '../src/core/numeric/limits';

describe('one-sided limits (numerical)', () => {
  it('removable singularities converge to the exact limit', () => {
    const cases: [(x: number) => number, number, number][] = [
      [(x) => (x * x - 1) / (x - 1), 1, 2],
      [(x) => Math.sin(x) / x, 0, 1],
      [(x) => (1 - Math.cos(x)) / (x * x), 0, 0.5],
      [(x) => (Math.exp(x) - 1) / x, 0, 1],
      [(x) => (Math.sin(x) - x) / (x * x * x), 0, -1 / 6],   // cancellation-heavy
      [(x) => (Math.sqrt(x + 4) - 2) / x, 0, 0.25],
      [(x) => Math.pow(1 + x, 1 / x), 0, Math.E],
    ];
    for (const [f, a, L] of cases) for (const side of [1, -1] as const) {
      const r = oneSidedLimit(f, a, side);
      expect(r.kind).toBe('finite');
      expect(Math.abs(r.value - L)).toBeLessThan(1e-6);
      expect(Math.abs(r.value - L)).toBeLessThanOrEqual(Math.max(r.error * 10, 1e-9));
    }
  });
  it('power-law approach (√h) is accelerated, not just sampled', () => {
    const r = oneSidedLimit((x) => 3 + Math.sqrt(x), 0, 1);
    expect(r.kind).toBe('finite');
    expect(Math.abs(r.value - 3)).toBeLessThan(1e-6);
  });
  it('infinite limits get the right sign', () => {
    expect(oneSidedLimit((x) => 1 / x, 0, 1).kind).toBe('+inf');
    expect(oneSidedLimit((x) => 1 / x, 0, -1).kind).toBe('-inf');
    expect(oneSidedLimit((x) => 1 / (x * x), 0, -1).kind).toBe('+inf');
    expect(oneSidedLimit(Math.log, 0, 1).kind).toBe('-inf');
    expect(oneSidedLimit(Math.tan, Math.PI / 2, -1).kind).toBe('+inf');
  });
  it('oscillation is reported, not averaged', () => {
    expect(oneSidedLimit((x) => Math.sin(1 / x), 0, 1).kind).toBe('oscillates');
    const damped = oneSidedLimit((x) => x * Math.sin(1 / x), 0, 1);
    expect(damped.kind).toBe('finite');
    expect(Math.abs(damped.value)).toBeLessThan(1e-6);
  });
  it('a side where f is undefined has no limit', () => {
    expect(oneSidedLimit(Math.sqrt, 0, -1).kind).toBe('undefined');
    expect(oneSidedLimit(Math.sqrt, 0, 1).kind).toBe('finite');
  });
});

describe('classifying a point', () => {
  it('continuous, removable, jump, infinite, oscillating', () => {
    expect(classifyPoint((x) => x * x, 2).kind).toBe('continuous');
    expect(classifyPoint((x) => (x * x - 4) / (x - 2), 2).kind).toBe('removable');
    const jump = classifyPoint(Math.floor, 1);
    expect(jump.kind).toBe('jump');
    expect(jump.left.value).toBeCloseTo(0, 12);
    expect(jump.right.value).toBeCloseTo(1, 12);
    expect(classifyPoint((x) => x / Math.abs(x), 0).kind).toBe('jump');
    expect(classifyPoint((x) => 1 / (x - 3), 3).kind).toBe('infinite');
    expect(classifyPoint((x) => Math.sin(1 / x), 0).kind).toBe('oscillating');
    // a point moved off the curve is removable even though f(a) is defined
    expect(classifyPoint((x) => (x === 1 ? 5 : x + 1), 1).kind).toBe('removable');
    // √x at 0 is (one-sidedly) continuous
    expect(classifyPoint(Math.sqrt, 0).kind).toBe('continuous');
  });
});

describe('largest δ for a given ε', () => {
  it('matches the exact δ for a line and a parabola', () => {
    // f = 3x at a = 1, L = 3: |3x − 3| < ε ⇔ |x − 1| < ε/3
    expect(largestDelta((x) => 3 * x, 1, 3, 0.3, 2)).toBeCloseTo(0.1, 8);
    // f = x² at a = 1, L = 1: the binding side is the right: (1+δ)² − 1 = ε ⇒ δ = √(1+ε) − 1
    expect(largestDelta((x) => x * x, 1, 1, 0.5, 2)).toBeCloseTo(Math.sqrt(1.5) - 1, 8);
    expect(largestDelta((x) => x * x, 1, 1, 0.5, 2, 'left')).toBeCloseTo(1 - Math.sqrt(0.5), 8);
  });
  it('no δ works across a jump when ε is small', () => {
    expect(largestDelta(Math.floor, 1, 0.5, 0.2, 1)).toBeLessThan(1e-9);
  });
});
