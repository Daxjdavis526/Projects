// Sequences and series computed term by term, for sims/calc-series.js.
// DOM-free and tested headlessly: node atlas/test/calc-series.test.mjs

/**
 * The terms a_n for n = n0, n0+1, … (count of them), either from a formula
 * term(n) or from a recursion a_{n+1} = rec(a_n, n) started at a1.
 * @returns {{n:number, a:number}[]}
 */
export function terms({ term, rec, a1 = 1, n0 = 1 }, count) {
  const out = [];
  if (rec) {
    let a = a1;
    for (let i = 0; i < count; i++) { const n = n0 + i; out.push({ n, a }); a = rec(a, n); }
  } else {
    for (let i = 0; i < count; i++) { const n = n0 + i; out.push({ n, a: term(n) }); }
  }
  return out;
}

/** Running totals S_n = a_{n0} + … + a_n, added in order (so rearrangements are not hidden). */
export function partialSums(ts) {
  let s = 0;
  return ts.map(({ n, a }) => ({ n, a, s: (s += a) }));
}

/**
 * The first index n from which every listed value stays strictly within eps
 * of L, or null if the last value is outside. It can only check the values
 * it is given — a finite stretch of an infinite sequence.
 */
export function settleIndex(list, L, eps, key = 'a') {
  let idx = null;
  for (let i = list.length - 1; i >= 0; i--) {
    if (Math.abs(list[i][key] - L) < eps) idx = list[i].n;
    else break;
  }
  return idx;
}

/** The ratio-test sequence |a_{n+1} / a_n|, indexed by n. */
export function ratios(ts) {
  const out = [];
  for (let i = 0; i + 1 < ts.length; i++) out.push({ n: ts[i].n, r: Math.abs(ts[i + 1].a / ts[i].a) });
  return out;
}

/** The root-test sequence |a_n|^(1/n). */
export function roots(ts) {
  return ts.map(({ n, a }) => ({ n, r: Math.abs(a) ** (1 / n) }));
}

/**
 * The cobweb path of a recursion: from (a1, 0) up to (a1, a2) on the curve
 * y = f(x), across to (a2, a2) on the line y = x, up to (a2, a3), and so on.
 */
export function cobweb(ts) {
  if (!ts.length) return [];
  const p = [[ts[0].a, 0]];
  for (let i = 0; i + 1 < ts.length; i++) {
    const a = ts[i].a, b = ts[i + 1].a;
    p.push([a, b], [b, b]);
  }
  return p;
}

/**
 * Integral-test rectangles for terms a_k = f(k), k = n0 … N, all of width 1.
 * upper: [k, k+1] with height a_k (above a decreasing f; total S_N);
 * lower: [k−1, k] with height a_k for k > n0 (below a decreasing f; total S_N − a_{n0}).
 */
export function integralRects(ts) {
  return {
    upper: ts.map(({ n, a }) => ({ x0: n, x1: n + 1, h: a })),
    lower: ts.slice(1).map(({ n, a }) => ({ x0: n - 1, x1: n, h: a })),
  };
}
