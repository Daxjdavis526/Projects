// Composite quadrature rules for teaching numerical integration: trapezoid,
// Simpson, and m-point Gauss–Legendre on n panels — with the nodes and weights
// they use (to draw them) and a least-squares slope for log-log error plots.
// The library's production integrator is the adaptive one in quad.ts.

/** Nodes and weights of m-point Gauss–Legendre on [−1, 1] (Newton on P_m). */
export function gaussLegendre(m: number): { x: number[]; w: number[] } {
  const x: number[] = [], w: number[] = [];
  for (let i = 1; i <= m; i++) {
    let t = Math.cos((Math.PI * (i - 0.25)) / (m + 0.5)), dp = 0;
    for (let it = 0; it < 100; it++) {
      let p0 = 1, p1 = t;
      for (let k = 2; k <= m; k++) { const p2 = ((2 * k - 1) * t * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
      const pm = m === 1 ? t : p1, pm1 = m === 1 ? 1 : p0;
      dp = (m * (t * pm - pm1)) / (t * t - 1);
      const dt = pm / dp;
      t -= dt;
      if (Math.abs(dt) < 1e-16) break;
    }
    x.push(t); w.push(2 / ((1 - t * t) * dp * dp));
  }
  // ascending order
  const idx = x.map((_, i) => i).sort((a, b) => x[a] - x[b]);
  return { x: idx.map((i) => x[i]), w: idx.map((i) => w[i]) };
}

export type Rule = 'trap' | 'simpson' | 'gauss2' | 'gauss3' | 'mid';

export interface RuleResult { value: number; evals: number; nodes: number[]; weights: number[] }

/** Composite rule on n panels of [a, b]. Simpson uses each panel as one parabola (3 points per panel). */
export function compositeRule(f: (x: number) => number, a: number, b: number, n: number, rule: Rule): RuleResult {
  const h = (b - a) / n;
  const nodes: number[] = [], weights: number[] = [];
  const addNode = (x: number, w: number) => {
    // merge shared panel endpoints so evals counts distinct points
    const last = nodes.length - 1;
    if (last >= 0 && Math.abs(nodes[last] - x) < 1e-15 * Math.max(1, Math.abs(x))) weights[last] += w; else { nodes.push(x); weights.push(w); }
  };
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h, x1 = x0 + h;
    if (rule === 'trap') { addNode(x0, h / 2); addNode(x1, h / 2); }
    else if (rule === 'mid') addNode(x0 + h / 2, h);
    else if (rule === 'simpson') { addNode(x0, h / 6); addNode(x0 + h / 2, (4 * h) / 6); addNode(x1, h / 6); }
    else {
      const g = gaussLegendre(rule === 'gauss2' ? 2 : 3);
      for (let k = 0; k < g.x.length; k++) addNode(x0 + (h * (g.x[k] + 1)) / 2, (h * g.w[k]) / 2);
    }
  }
  let s = 0;
  for (let k = 0; k < nodes.length; k++) s += weights[k] * f(nodes[k]);
  return { value: s, evals: nodes.length, nodes, weights };
}

/** The asymptotic order p (error ∝ n^−p) of each rule for smooth integrands. */
export const RULE_ORDER: Record<Rule, number> = { mid: 2, trap: 2, simpson: 4, gauss2: 4, gauss3: 6 };

/** Least-squares slope of log10(y) against log10(x), skipping non-finite or zero values. */
export function logLogSlope(xs: number[], ys: number[]): number {
  const X: number[] = [], Y: number[] = [];
  xs.forEach((x, i) => { const y = ys[i]; if (x > 0 && y > 0 && Number.isFinite(y)) { X.push(Math.log10(x)); Y.push(Math.log10(y)); } });
  if (X.length < 2) return NaN;
  const mx = X.reduce((s, v) => s + v, 0) / X.length, my = Y.reduce((s, v) => s + v, 0) / Y.length;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < X.length; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; }
  return sxx > 0 ? sxy / sxx : NaN;
}
