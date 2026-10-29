// A uniform chain of N equal masses m joined by equal springs k, spacing a —
// the linear chain of PHYS 3750 (Torre ch. 4, Georgi ch. 4), DOM-free. The
// model behind sims/wv-chain.js, tested in test/wv-chain.test.mjs.
//
// Mass j (j = 1 … N) obeys m ẍⱼ = k (xⱼ₊₁ − 2xⱼ + xⱼ₋₁). Three kinds of end:
//   fixed     x₀ = x_{N+1} = 0 (walls one spacing beyond each end mass);
//             modes n = 1 … N: shape sin(n j π/(N+1)), q = nπ/((N+1)a)
//   free      the end masses have a spring on one side only;
//             modes n = 0 … N−1: shape cos(n (j − ½) π/N), q = nπ/(N a)
//   periodic  a ring: mass N is joined to mass 1;
//             q = 2πp/(N a); real standing modes cos and sin(2π p j/N),
//             a degenerate pair for 0 < p < N/2
// Every mode obeys the one dispersion relation ω = 2√(k/m) |sin(qa/2)|; the
// long-wave limit is ω = v q with v = a√(k/m).
// Shapes are returned as orthonormal vectors (Σⱼ sⱼ² = 1), so the motion from
// any start is an exact sum over modes, x(t) = Σ s (a cos ωt + (b/ω) sin ωt).

export const BCS = ['fixed', 'free', 'periodic'];

/** ω/ω₀ for wavenumber q (rad/m) and spacing a (m): 2|sin(qa/2)|. */
export const omegaOf = (q, a = 1) => 2 * Math.abs(Math.sin((q * a) / 2));

/** The mode numbers a chain admits, as the sim's `n` uses them. */
export function modeRange(N, bc) {
  if (bc === 'fixed') return [1, N];
  if (bc === 'free') return [0, N - 1];
  return [0, Math.floor(N / 2)];
}

/**
 * All normal modes, in order of frequency: [{ n, q, w, shape, part }] with q
 * in rad per spacing (multiply by 1/a for rad/m), w = ω/ω₀ (ω₀ = √(k/m)) and
 * shape the unit eigenvector. For a ring, the pair with the same p is listed
 * as part 'cos' and 'sin' (p = 0 and p = N/2 have only 'cos').
 */
export function chainModes(N, bc = 'fixed') {
  const out = [];
  if (bc === 'fixed') {
    const s = Math.sqrt(2 / (N + 1));
    for (let n = 1; n <= N; n++) {
      const q = (n * Math.PI) / (N + 1);
      out.push({ n, q, w: omegaOf(q), part: 'sin', shape: Array.from({ length: N }, (_, i) => s * Math.sin((i + 1) * q)) });
    }
  } else if (bc === 'free') {
    for (let n = 0; n < N; n++) {
      const q = (n * Math.PI) / N, s = n === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
      out.push({ n, q, w: omegaOf(q), part: 'cos', shape: Array.from({ length: N }, (_, i) => s * Math.cos((i + 0.5) * q)) });
    }
  } else {
    for (let p = 0; p <= Math.floor(N / 2); p++) {
      const q = (2 * Math.PI * p) / N, edge = p === 0 || 2 * p === N;
      const s = edge ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
      out.push({ n: p, q, w: omegaOf(q), part: 'cos', shape: Array.from({ length: N }, (_, i) => s * Math.cos((i + 1) * q)) });
      if (!edge) out.push({ n: p, q, w: omegaOf(q), part: 'sin', shape: Array.from({ length: N }, (_, i) => s * Math.sin((i + 1) * q)) });
    }
  }
  for (const m of out) for (let i = 0; i < N; i++) if (Math.abs(m.shape[i]) < 1e-14) m.shape[i] = 0;
  return out;
}

/** The stiffness matrix K/k of the chain (so m ẍ = −k (K/k) x). */
export function stiffness(N, bc = 'fixed') {
  const K = Array.from({ length: N }, () => Array(N).fill(0));
  const link = (i, j) => { K[i][i] += 1; K[j][j] += 1; K[i][j] -= 1; K[j][i] -= 1; };
  for (let i = 0; i + 1 < N; i++) link(i, i + 1);
  if (bc === 'fixed') { K[0][0] += 1; K[N - 1][N - 1] += 1; }
  if (bc === 'periodic' && N > 2) link(N - 1, 0);
  if (bc === 'periodic' && N === 2) link(1, 0);      // a ring of two: two springs between the same pair
  return K;
}

/** Projections of a displacement vector onto the modes: [aₖ] with x = Σ aₖ shapeₖ. */
export function project(modes, x) {
  return modes.map((m) => m.shape.reduce((s, v, i) => s + v * x[i], 0));
}

/**
 * The exact motion from x(0) = x0, ẋ(0) = v0 (v0 in units of ω₀·length), as a
 * function of τ = ω₀ t: τ ↦ { x, v } with v = dx/dτ.
 */
export function motion(modes, x0, v0 = null) {
  const N = x0.length;
  const a = project(modes, x0), b = v0 ? project(modes, v0) : modes.map(() => 0);
  return (tau) => {
    const x = Array(N).fill(0), v = Array(N).fill(0);
    modes.forEach((m, k) => {
      const w = m.w;
      let c, dc;
      if (w < 1e-12) { c = a[k] + b[k] * tau; dc = b[k]; }     // a free chain or a ring sliding as a whole
      else { c = a[k] * Math.cos(w * tau) + (b[k] / w) * Math.sin(w * tau); dc = -a[k] * w * Math.sin(w * tau) + b[k] * Math.cos(w * tau); }
      for (let i = 0; i < N; i++) { x[i] += c * m.shape[i]; v[i] += dc * m.shape[i]; }
    });
    return { x, v };
  };
}

/** Where mass j (1-based) sits along the chain, in spacings, and the chain's length L (in spacings). */
export function layout(N, bc) {
  if (bc === 'fixed') return { pos: Array.from({ length: N }, (_, i) => i + 1), L: N + 1 };
  if (bc === 'free') return { pos: Array.from({ length: N }, (_, i) => i + 0.5), L: N };
  return { pos: Array.from({ length: N }, (_, i) => i + 1), L: N };
}

/** The continuum shape that a mode samples, as a function of position s (in spacings). */
export function continuumShape(N, bc, n, part = 'sin') {
  if (bc === 'fixed') return (s) => Math.sin((n * Math.PI * s) / (N + 1));
  if (bc === 'free') return (s) => Math.cos((n * Math.PI * s) / N);
  return part === 'sin' ? (s) => Math.sin((2 * Math.PI * n * s) / N) : (s) => Math.cos((2 * Math.PI * n * s) / N);
}

/** A Gaussian pulse of width w (spacings) centred at c (spacings), moving right at the long-wave speed: { x0, v0 } (v0 per unit τ). */
export function pulse(N, bc, c, w, dir = 1) {
  const { pos } = layout(N, bc);
  const f = (s) => Math.exp(-(((s - c) / w) ** 2));
  const fp = (s) => (-2 * (s - c) / (w * w)) * f(s);
  // a right-mover f(s − τ) (speed 1 spacing per unit τ, the long-wave speed a ω₀) has ẋ = −f′
  return { x0: pos.map(f), v0: pos.map((s) => -dir * fp(s)) };
}
