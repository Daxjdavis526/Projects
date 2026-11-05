import { describe, it, expect } from 'vitest';
import {
  parseMatrix, parseMatrices, rot2, rotAxis, axisAngle, rotationPower, properSvd, polarPath, linearPath, pathMatrix, svdPath, cond,
  rrefSteps, solveSystem, nullBasis, diagonalize, gramSchmidtSteps, leastSquares, projectionMatrix, inertiaPoints, inertiaBox, rotateTensor,
  normalModes, modalCoefficients,
} from '../src/core/numeric/linmap';
import { det, matmul, transpose, identity, rref, matvec, dot, eigSymmetric, Mat } from '../src/core/numeric/linalg';

const close = (A: Mat, B: Mat, d = 10) => A.forEach((r, i) => r.forEach((v, j) => expect(v).toBeCloseTo(B[i][j], d)));
const diagM = (d: number[]) => d.map((v, i) => d.map((_, j) => (i === j ? v : 0)));

describe('reading matrices', () => {
  it('accepts names, expressions and several matrices', () => {
    const p = parseMatrix('A = [[2, 1], [1, 2]]');
    expect(p.ok && p.value.name).toBe('A');
    expect(p.ok && p.value.M).toEqual([[2, 1], [1, 2]]);
    const q = parseMatrix('[[cos(pi/3), -sin(pi/3)], [sin(pi/3), cos(pi/3)]]');
    expect(q.ok).toBe(true);
    if (q.ok) close(q.value.M, rot2(Math.PI / 3), 14);
    const r = parseMatrices('A = [[1,2],[3,4]]; B=[[0,1],[1,0]]');
    expect(r.ok && r.value.map((x) => x.name)).toEqual(['A', 'B']);
  });
  it('rejects non-matrices, ragged rows and symbols with a message', () => {
    expect(parseMatrix('x^2').ok).toBe(false);
    expect(parseMatrix('[[1,2],[3]]').ok).toBe(false);
    const s = parseMatrix('[[a, 1], [1, 2]]');
    expect(s.ok).toBe(false);
    if (!s.ok) expect(s.error.length).toBeGreaterThan(5);
    expect(parseMatrix('[[1/0, 1], [1, 2]]').ok).toBe(false);
  });
});

describe('rotations', () => {
  it('Rodrigues and axis–angle are inverse, including the angle-π case', () => {
    for (const [axis, ang] of [[[1, 2, 3], 0.7], [[0, 0, 1], 2.5], [[1, -1, 0.5], Math.PI], [[0, 1, 0], 1e-3]] as [number[], number][]) {
      const R = rotAxis(axis, ang);
      close(matmul(R, transpose(R)), identity(3), 12);
      expect(det(R)).toBeCloseTo(1, 12);
      const { axis: a, angle } = axisAngle(R);
      expect(angle).toBeCloseTo(ang, 8);
      close(rotAxis(a, angle), R, 8);
    }
  });
  it('fractional powers compose: (R^½)² = R, R⁰ = I', () => {
    const R = rotAxis([1, 1, 1], 2 * Math.PI / 3);              // cyclic permutation of axes
    close(R, [[0, 0, 1], [1, 0, 0], [0, 1, 0]], 12);
    const h = rotationPower(R, 0.5);
    close(matmul(h, h), R, 12);
    close(rotationPower(R, 0), identity(3), 12);
    close(rotationPower(rot2(1.2), 0.25), rot2(0.3), 14);
  });
});

describe('SVD as rotation–stretch–rotation', () => {
  const cases: Mat[] = [[[3, 1], [1, 2]], [[1, 2], [3, 4]], [[0, -2], [1, 0]], [[1, 2, 0], [0, 1, 1], [1, 0, 3]], [[1, 0, 0], [0, 1, 0], [0, 0, -2]], [[1, 2, 3], [2, 4, 6], [1, 1, 1]]];
  it('U and V are proper rotations and U Σ Vᵀ = A (the sign of det A sits in Σ)', () => {
    for (const A of cases) {
      const { U, S, V } = properSvd(A);
      expect(det(U)).toBeCloseTo(1, 10);
      expect(det(V)).toBeCloseTo(1, 10);
      close(matmul(matmul(U, diagM(S)), transpose(V)), A, 9);
      expect(Math.sign(S.reduce((p, s) => p * s, 1)) || 0).toBe(Math.sign(Math.round(det(A) * 1e9)) || 0);
    }
  });
  it('the SVD motion starts at I, passes Σ Vᵀ and ends at A', () => {
    for (const A of cases) {
      const f = properSvd(A);
      close(svdPath(A, 0, f), identity(A.length), 12);
      close(svdPath(A, 2, f), matmul(diagM(f.S), transpose(f.V)), 10);
      close(svdPath(A, 3, f), A, 9);
    }
  });
  it('polar path: a rotation turns at constant speed instead of shrinking', () => {
    const R = rot2(1.4);
    close(polarPath(R, 0.5)!, rot2(0.7), 10);
    const A = [[2, 1], [0.5, 1.5]];
    close(polarPath(A, 1)!, A, 10);
    close(polarPath(A, 0)!, identity(2), 10);
    expect(polarPath([[1, 0], [0, -1]], 0.5)).toBeNull();           // a reflection cannot be reached by rotating
    close(pathMatrix([[1, 0], [0, -1]], 0.5, 'polar'), linearPath([[1, 0], [0, -1]], 0.5), 14);
  });
  it('condition number', () => {
    expect(cond([[2, 0], [0, 0.5]])).toBeCloseTo(4, 10);
    expect(cond([[1, 2], [2, 4]])).toBe(Infinity);
  });
});

describe('row reduction with intermediate matrices', () => {
  const systems: Mat[] = [[[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]], [[0, 2, 4], [1, 1, 1], [2, 4, 6]], [[1, 2, 3], [2, 4, 6]], [[1, 1, 1, 1], [1, 1, 1, 2], [0, 0, 1, 0]]];
  it('takes exactly the operations of linalg.rref and ends at its R', () => {
    for (const A of systems) {
      const a = rref(A), b = rrefSteps(A);
      expect(b.steps.map((s) => s.op)).toEqual(a.ops);
      close(b.R, a.R, 12);
      expect(b.pivots).toEqual(a.pivots);
      if (b.steps.length) close(b.steps[b.steps.length - 1].M, a.R, 12);
    }
  });
  it('classifies solution sets', () => {
    const u = solveSystem([[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]);
    expect(u.kind).toBe('unique');
    u.x!.forEach((v, i) => expect(v).toBeCloseTo([2, 3, -1][i], 12));
    const inf = solveSystem([[1, 1, 1, 3], [1, -1, 0, 0]]);
    expect(inf.kind).toBe('infinite');
    expect(inf.dirs.length).toBe(1);
    expect(matvec([[1, 1, 1], [1, -1, 0]], inf.dirs[0]).every((v) => Math.abs(v) < 1e-12)).toBe(true);
    expect(solveSystem([[1, 1, 1], [1, 1, 2]]).kind).toBe('none');
  });
  it('null basis with a relative tolerance', () => {
    const N = nullBasis([[1e-6, 2e-6], [2e-6, 4e-6]]);
    expect(N.length).toBe(1);
  });
});

describe('diagonalization', () => {
  it('real distinct eigenvalues: A = P D P⁻¹', () => {
    const A = [[2, 1], [1, 2]];
    const d = diagonalize(A);
    expect(d.ok).toBe(true);
    if (d.ok) { close(matmul(matmul(d.P, diagM(d.D)), d.Pinv), A, 10); expect(d.D.slice().sort()).toEqual([1, 3]); }
    const B = [[4, 1, 0], [0, 2, 0], [1, 0, 3]];
    const e = diagonalize(B);
    expect(e.ok).toBe(true);
    if (e.ok) close(matmul(matmul(e.P, diagM(e.D)), e.Pinv), B, 8);
  });
  it('a repeated eigenvalue with a full eigenspace is diagonalizable; a shear is not; a rotation is complex', () => {
    expect(diagonalize([[2, 0], [0, 2]]).ok).toBe(true);
    const s = diagonalize([[1, 1], [0, 1]]);
    expect(!s.ok && s.reason).toBe('defective');
    const r = diagonalize(rot2(0.5));
    expect(!r.ok && r.reason).toBe('complex');
  });
});

describe('Gram–Schmidt steps', () => {
  it('produces orthonormal Q with A = Q R', () => {
    const vs = [[1, 1, 0], [1, 0, 1], [0, 1, 1]];
    const { Q, R, steps } = gramSchmidtSteps(vs);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(dot(Q[i], Q[j])).toBeCloseTo(i === j ? 1 : 0, 12);
    close(matmul(transpose(Q), R), transpose(vs), 12);
    expect(steps.map((s) => s.kind)).toEqual(['normalize', 'project', 'normalize', 'project', 'project', 'normalize']);
  });
  it('flags a dependent vector instead of dividing by zero', () => {
    const { dependent } = gramSchmidtSteps([[1, 0, 0], [0, 1, 0], [1, 1, 0]]);
    expect(dependent).toEqual([2]);
  });
});

describe('least squares and projection', () => {
  it('the best line through three points, and e ⟂ the column space', () => {
    const xs = [0, 1, 2], ys = [6, 0, 0];                    // Strang's example: y = 5 − 3x
    const A = xs.map((x) => [1, x]);
    const r = leastSquares(A, ys)!;
    expect(r.x[0]).toBeCloseTo(5, 12); expect(r.x[1]).toBeCloseTo(-3, 12);
    expect(dot(r.e, [1, 1, 1])).toBeCloseTo(0, 12);
    expect(dot(r.e, xs)).toBeCloseTo(0, 12);
    const P = projectionMatrix(A)!;
    close(matmul(P, P), P, 12);
    close(P, transpose(P), 12);
    expect(P[0][0] + P[1][1] + P[2][2]).toBeCloseTo(2, 12);  // trace = rank
  });
});

describe('physics', () => {
  it('inertia tensor of point masses and a box; principal axes come back after rotation', () => {
    const I = inertiaPoints([{ m: 1, r: [1, 0, 0] }, { m: 1, r: [-1, 0, 0] }]);   // a dumbbell on x
    close(I, diagM([0, 2, 2]), 14);
    const box = inertiaBox(12, 1, 2, 3);
    close(box, diagM([13, 10, 5]), 14);
    const R = rotAxis([1, 2, 2], 0.8);
    const { values, vectors } = eigSymmetric(rotateTensor(box, R));
    expect(values.map((v) => +v.toFixed(9))).toEqual([13, 10, 5]);
    // the principal axis of the largest moment is R e_x (up to sign)
    expect(Math.abs(dot(vectors[0], R.map((r) => r[0])))).toBeCloseTo(1, 9);
  });
  it('normal modes of two equal masses, three equal springs: ω = √(k/m), √(3k/m)', () => {
    const k = 2, m = 0.5;
    const { omega, modes } = normalModes([[2 * k, -k], [-k, 2 * k]], [m, m]);
    expect(omega[0]).toBeCloseTo(Math.sqrt(k / m), 12);
    expect(omega[1]).toBeCloseTo(Math.sqrt(3 * k / m), 12);
    expect(modes[0][0]).toBeCloseTo(modes[0][1], 12);         // in phase
    expect(modes[1][0]).toBeCloseTo(-modes[1][1], 12);        // out of phase
    const c = modalCoefficients(modes, [m, m], [1, 0]);
    const x0 = [0, 1].map((k2) => c[0] * modes[0][k2] + c[1] * modes[1][k2]);
    expect(x0[0]).toBeCloseTo(1, 12); expect(x0[1]).toBeCloseTo(0, 12);
  });
  it('unequal masses: modes are M-orthogonal and satisfy K φ = ω² M φ', () => {
    const K = [[5, -2], [-2, 3]], ms = [1, 3];
    const { omega, modes } = normalModes(K, ms);
    expect(modes[0][0] * ms[0] * modes[1][0] + modes[0][1] * ms[1] * modes[1][1]).toBeCloseTo(0, 12);
    modes.forEach((phi, i) => matvec(K, phi).forEach((v, k2) => expect(v).toBeCloseTo(omega[i] ** 2 * ms[k2] * phi[k2], 10)));
  });
});
