// Ordinary differential equations y' = f(t, y) for systems. Fixed-step Euler,
// improved Euler (Heun) and classical RK4 for teaching comparisons, and the
// adaptive Dormand–Prince 5(4) pair with error control for accurate answers.

export type Rhs = (t: number, y: number[]) => number[];

export interface Trajectory {
  t: number[];
  y: number[][];
  ok: boolean;
  warning?: string;
  steps: number;
  rejected?: number;
}

const axpy = (y: number[], h: number, k: number[]) => y.map((v, i) => v + h * k[i]);

export function eulerStep(f: Rhs, t: number, y: number[], h: number): number[] { return axpy(y, h, f(t, y)); }

export function heunStep(f: Rhs, t: number, y: number[], h: number): number[] {
  const k1 = f(t, y), k2 = f(t + h, axpy(y, h, k1));
  return y.map((v, i) => v + (h / 2) * (k1[i] + k2[i]));
}

export function rk4Step(f: Rhs, t: number, y: number[], h: number): number[] {
  const k1 = f(t, y);
  const k2 = f(t + h / 2, axpy(y, h / 2, k1));
  const k3 = f(t + h / 2, axpy(y, h / 2, k2));
  const k4 = f(t + h, axpy(y, h, k3));
  return y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

/** Fixed-step integration with a chosen method, for comparisons and teaching. */
export function solveFixed(f: Rhs, y0: number[], t0: number, t1: number, n: number, method: 'euler' | 'heun' | 'rk4' = 'rk4'): Trajectory {
  const step = method === 'euler' ? eulerStep : method === 'heun' ? heunStep : rk4Step;
  const h = (t1 - t0) / n;
  const T = [t0], Y = [y0.slice()];
  let y = y0.slice();
  for (let i = 1; i <= n; i++) {
    y = step(f, t0 + (i - 1) * h, y, h);
    if (!y.every(Number.isFinite)) return { t: T, y: Y, ok: false, steps: i, warning: `The solution blew up near t = ${+(t0 + i * h).toPrecision(4)}` };
    T.push(t0 + i * h); Y.push(y);
  }
  return { t: T, y: Y, ok: true, steps: n };
}

// Dormand–Prince 5(4) coefficients
const C = [0, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1];
const A = [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9], [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729],
  [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656], [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]];
const B5 = [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84, 0];
const B4 = [5179 / 57600, 0, 7571 / 16695, 393 / 640, -92097 / 339200, 187 / 2100, 1 / 40];

/**
 * Adaptive Dormand–Prince 5(4). Records every accepted step (dense enough to
 * plot; pass maxStep to cap the spacing). Stops early with a warning if the
 * solution blows up or the step size collapses (a singularity or stiffness).
 */
export function solveAdaptive(f: Rhs, y0: number[], t0: number, t1: number, opts: { rtol?: number; atol?: number; maxStep?: number; maxSteps?: number } = {}): Trajectory {
  const rtol = opts.rtol ?? 1e-8, atol = opts.atol ?? 1e-10;
  const dir = Math.sign(t1 - t0) || 1;
  const span = Math.abs(t1 - t0);
  const hmax = opts.maxStep ?? span / 50;
  const maxSteps = opts.maxSteps ?? 100000;
  let h = dir * Math.min(hmax, span / 100 || 1e-3);
  let t = t0, y = y0.slice();
  const T = [t], Y = [y.slice()];
  let steps = 0, rejected = 0;
  let k1 = f(t, y);
  while (dir * (t1 - t) > 1e-14 * Math.max(1, Math.abs(t1))) {
    if (steps + rejected > maxSteps) return { t: T, y: Y, ok: false, steps, rejected, warning: 'Stopped: too many steps (the equation may be stiff)' };
    // the last step is cut short to land on t1; its size says nothing about the solution
    const hFree = h;
    const truncated = dir * (t + h - t1) > 0;
    if (truncated) h = t1 - t;
    const k: number[][] = [k1];
    for (let s = 1; s < 7; s++) {
      const ys = y.map((v, i) => { let acc = v; for (let j = 0; j < s; j++) acc += h * A[s][j] * k[j][i]; return acc; });
      k.push(f(t + C[s] * h, ys));
    }
    const y5 = y.map((v, i) => { let acc = v; for (let j = 0; j < 7; j++) acc += h * B5[j] * k[j][i]; return acc; });
    let errNorm = 0;
    for (let i = 0; i < y.length; i++) {
      let e = 0; for (let j = 0; j < 7; j++) e += h * (B5[j] - B4[j]) * k[j][i];
      const sc = atol + rtol * Math.max(Math.abs(y[i]), Math.abs(y5[i]));
      errNorm = Math.max(errNorm, Math.abs(e) / sc);
    }
    if (!Number.isFinite(errNorm) || !y5.every(Number.isFinite)) {
      h /= 4; rejected++;
      if (Math.abs(h) < 1e-14 * Math.max(1, Math.abs(t))) return { t: T, y: Y, ok: false, steps, rejected, warning: `The solution blows up near t = ${+t.toPrecision(5)}` };
      continue;
    }
    if (errNorm <= 1) {
      t += h; y = y5; k1 = k[6]; steps++;   // FSAL: the last stage is the next first
      T.push(t); Y.push(y.slice());
      if (y.some((v) => Math.abs(v) > 1e12)) return { t: T, y: Y, ok: false, steps, rejected, warning: `The solution grows without bound near t = ${+t.toPrecision(5)}` };
    } else rejected++;
    const factor = errNorm === 0 ? 5 : Math.min(5, Math.max(0.2, 0.9 * Math.pow(errNorm, -1 / 5)));
    h = dir * Math.min(hmax, Math.abs((truncated && errNorm <= 1 ? hFree : h * factor)));
    if (dir * (t1 - t) <= 1e-14 * Math.max(1, Math.abs(t1))) break;
    if (Math.abs(h) < 1e-12 * Math.max(1, Math.abs(t))) return { t: T, y: Y, ok: false, steps, rejected, warning: `The step size collapsed near t = ${+t.toPrecision(5)} — a singularity or a stiff equation` };
  }
  return { t: T, y: Y, ok: true, steps, rejected };
}

/** Linear interpolation of a trajectory at time t. */
export function sample(tr: Trajectory, t: number): number[] {
  const T = tr.t;
  if (t <= T[0]) return tr.y[0];
  if (t >= T[T.length - 1]) return tr.y[T.length - 1];
  let lo = 0, hi = T.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; }
  const u = (t - T[lo]) / (T[hi] - T[lo]);
  return tr.y[lo].map((v, i) => v + u * (tr.y[hi][i] - v));
}
