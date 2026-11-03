import { describe, it, expect } from 'vitest';
import { cumulativeIntegral, sampleCumulative, partitionSum, uniformPartition } from '../src/core/numeric/accumulation';
import { riemann } from '../src/core/numeric/quad';

describe('cumulative integral A(x) = ∫_a^x f', () => {
  it('matches exact antiderivatives on the whole grid, either side of a', () => {
    const c = cumulativeIntegral(Math.cos, 0.3, -4, 5, 180);
    let worst = 0;
    for (let i = 0; i < c.xs.length; i++) worst = Math.max(worst, Math.abs(c.A[i] - (Math.sin(c.xs[i]) - Math.sin(0.3))));
    expect(worst).toBeLessThan(1e-12);
    expect(c.badAt).toBeNull();
    const p = cumulativeIntegral((x) => x * x, -1, -3, 3, 60);
    for (let i = 0; i < p.xs.length; i++) expect(p.A[i]).toBeCloseTo((p.xs[i] ** 3 + 1) / 3, 11);
  });
  it('works when a lies outside the grid', () => {
    const c = cumulativeIntegral(Math.exp, -10, 0, 1, 20);
    expect(c.A[0]).toBeCloseTo(1 - Math.exp(-10), 12);
    expect(c.A[20]).toBeCloseTo(Math.E - Math.exp(-10), 12);
  });
  it('A′ = f: the slope of the table is the integrand (FTC, numerically)', () => {
    const f = (x: number) => Math.exp(-x * x);
    const c = cumulativeIntegral(f, 0, -2, 2, 4000);
    for (const x of [-1.3, 0, 0.7, 1.9]) {
      const h = 1e-3;
      const slope = (sampleCumulative(c, x + h) - sampleCumulative(c, x - h)) / (2 * h);
      expect(slope).toBeCloseTo(f(x), 4);
    }
  });
  it('stops at a non-integrable singularity', () => {
    const c = cumulativeIntegral((x) => 1 / (x - 1), 0, -1, 3, 40);
    expect(c.badAt).not.toBeNull();
    expect(Number.isNaN(c.A[40])).toBe(true);
    expect(c.A[0]).toBeCloseTo(Math.log(2), 10);   // ∫_0^{-1} 1/(x−1) = ln 2
  });
});

describe('Riemann sums on a partition', () => {
  it('agree with the uniform rules', () => {
    const f = (x: number) => Math.sin(x) + x * x;
    const pts = uniformPartition(0, 2, 37);
    for (const tag of ['left', 'right', 'mid', 'trap'] as const) expect(partitionSum(f, pts, tag).sum).toBeCloseTo(riemann(f, 0, 2, 37, tag), 12);
  });
  it('lower ≤ any tagged sum ≤ upper, and all converge to the integral', () => {
    const f = (x: number) => Math.exp(x) * Math.cos(3 * x), exact = (Math.exp(2) * (Math.cos(6) + 3 * Math.sin(6)) - 1) / 10;
    const pts = [0, 0.1, 0.35, 0.4, 0.9, 1.2, 1.25, 1.7, 2];
    const lo = partitionSum(f, pts, 'lower').sum, hi = partitionSum(f, pts, 'upper').sum;
    for (const tag of ['left', 'right', 'mid', 'trap'] as const) { const s = partitionSum(f, pts, tag).sum; expect(s).toBeGreaterThanOrEqual(lo - 1e-12); expect(s).toBeLessThanOrEqual(hi + 1e-12); }
    const fine = uniformPartition(0, 2, 4000);
    expect(Math.abs(partitionSum(f, fine, 'upper').sum - partitionSum(f, fine, 'lower').sum)).toBeLessThan(0.01);
    expect(partitionSum(f, fine, 'mid').sum).toBeCloseTo(exact, 6);
  });
  it('a non-uniform partition: left sums of an increasing function are lower sums', () => {
    const pts = [0, 0.05, 0.5, 0.55, 1];
    expect(partitionSum((x) => x * x, pts, 'left').sum).toBeCloseTo(partitionSum((x) => x * x, pts, 'lower').sum, 12);
    expect(partitionSum((x) => x * x, pts, 'left').sum).toBeCloseTo(0.05 * 0 + 0.45 * 0.0025 + 0.05 * 0.25 + 0.45 * 0.3025, 14);
  });
});
