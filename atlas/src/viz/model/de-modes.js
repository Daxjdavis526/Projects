// Normal modes of a small chain of masses and springs, DOM-free — the model
// behind sims/de-modes.js. The equations of motion are M x″ = −K x with M the
// diagonal matrix of masses and K the stiffness matrix. With S = M^{−1/2} K M^{−1/2}
// (symmetric) diagonalized by Jacobi rotations, every motion is a sum of modes
// x = Σ φₖ (aₖ cos ωₖt + bₖ sin ωₖt), and that sum is evaluated exactly here,
// so the animation never drifts. Tested in test/de-plane.test.mjs.

/** Eigenvalues and orthonormal eigenvectors of a small symmetric matrix by cyclic Jacobi rotations: { values, vectors } (vectors[k] is the k-th eigenvector), ascending. */
export function symEig(S0) {
  const n = S0.length;
  const S = S0.map((r) => r.slice());
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += S[p][q] * S[p][q];
    if (off < 1e-30) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(S[p][q]) < 1e-300) continue;
      const th = (S[q][q] - S[p][p]) / (2 * S[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const a = S[k][p], b = S[k][q]; S[k][p] = c * a - s * b; S[k][q] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = S[p][k], b = S[q][k]; S[p][k] = c * a - s * b; S[q][k] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => S[i][i] - S[j][j]);
  return { values: order.map((i) => S[i][i]), vectors: order.map((i) => V.map((row) => row[i])) };
}

/**
 * The stiffness matrix of masses in a line joined by springs: springs[0]
 * ties mass 1 to the left wall, springs[k] joins mass k to mass k+1, and
 * springs[n] ties mass n to the right wall (0 for a free end).
 */
export function chainK(springs) {
  const n = springs.length - 1;
  const K = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    K[i][i] = springs[i] + springs[i + 1];
    if (i + 1 < n) { K[i][i + 1] = -springs[i + 1]; K[i + 1][i] = -springs[i + 1]; }
  }
  return K;
}

/**
 * Normal modes of M x″ = −K x, M = diag(masses): [{ omega, shape, q }] in order
 * of frequency. shape is the mode in displacement coordinates, scaled so its
 * largest entry has size 1 and its first nonzero entry is positive; q is the unit
 * eigenvector of S = M^{−1/2} K M^{−1/2}. A frequency that is zero to rounding
 * (a free chain sliding as a whole) is returned as exactly 0.
 */
export function modes(masses, K) {
  const n = masses.length, r = masses.map((m) => 1 / Math.sqrt(m));
  const S = K.map((row, i) => row.map((k, j) => k * r[i] * r[j]));
  const { values, vectors } = symEig(S);
  const top = Math.max(...values.map(Math.abs), 1e-300);
  return values.map((w2, k) => {
    const q = vectors[k];
    let shape = q.map((v, i) => v * r[i]);
    const big = shape.reduce((b, v) => (Math.abs(v) > Math.abs(b) + 1e-12 ? v : b), 0);
    shape = shape.map((v) => v / big);
    const first = shape.find((v) => Math.abs(v) > 1e-9);
    if (first < 0) shape = shape.map((v) => -v);
    for (let i = 0; i < n; i++) if (Math.abs(shape[i]) < 1e-12) shape[i] = 0;
    return { omega: Math.abs(w2) < 1e-10 * top ? 0 : Math.sqrt(Math.max(0, w2)), shape, q: q.slice() };
  });
}

/**
 * The exact motion from x(0) = x0, x′(0) = v0: a function t ↦ { x, v } (arrays),
 * by modal superposition in the coordinates q = M^{1/2} x.
 */
export function motion(masses, K, x0, v0) {
  const ms = modes(masses, K), sq = masses.map(Math.sqrt);
  const q0 = x0.map((x, i) => x * sq[i]), p0 = v0.map((v, i) => v * sq[i]);
  const coef = ms.map((m) => ({ w: m.omega, a: m.q.reduce((s, qi, i) => s + qi * q0[i], 0), b: m.q.reduce((s, qi, i) => s + qi * p0[i], 0), q: m.q }));
  return (t) => {
    const qx = Array(masses.length).fill(0), qv = Array(masses.length).fill(0);
    for (const { w, a, b, q } of coef) {
      const c = w > 0 ? Math.cos(w * t) : 1, s = w > 0 ? Math.sin(w * t) : 0;
      const amp = w > 0 ? a * c + (b / w) * s : a + b * t;
      const vel = w > 0 ? -a * w * s + b * c : b;
      for (let i = 0; i < q.length; i++) { qx[i] += q[i] * amp; qv[i] += q[i] * vel; }
    }
    return { x: qx.map((v, i) => v / sq[i]), v: qv.map((v, i) => v / sq[i]) };
  };
}

/** Kinetic energy of each mass and potential energy of each spring for a chain: { kinetic: [...], springs: [...] }. */
export function energies(masses, springs, x, v) {
  const n = masses.length;
  const kinetic = masses.map((m, i) => 0.5 * m * v[i] * v[i]);
  const stretch = springs.map((k, j) => (j === 0 ? x[0] : j === n ? -x[n - 1] : x[j] - x[j - 1]));
  return { kinetic, springs: springs.map((k, j) => 0.5 * k * stretch[j] * stretch[j]) };
}
