// The MATH 2270 boss, "The Basis Change Challenge": the commissioning of
// Kittiwake, an imagined 150 kg Earth-observation satellite, as its guidance,
// navigation and control team meets it. A redundant set of four thrusters
// shares a manoeuvre (elimination, a null space of idle firings and the
// constraint that thrusters only push), and a cheaper three-thruster layout
// turns out to have a left null space (thrust lines through one point cannot
// make a couple); two test commands calibrate the reaction wheels (a linear map
// known by its action on a basis); a star-tracker head's survey matrix is
// checked for handedness (the determinant's sign) and another's is used to
// carry a star into the tracker's frame (change of basis by an orthogonal
// matrix); a boom tilts the principal axes (the spectral theorem), a spin is
// judged by the signature of a conserved quadratic form, and a two-node
// thermal model is diagonalized; the orbit is fitted to ranging residuals
// (least squares with orthogonal columns) and a factorization is chosen for
// the solve; and on the downlink a star-tracker window is compressed by its
// SVD and two antennas are combined through a Hermitian covariance matrix.
// Every item names the lesson whose skill it measures; every number comes from
// its generator. The case functions are exported so a script can check the
// keys independently.
import { boss, mcq, num } from '../../src/core/content.js';
import { tex, nice } from '../../src/core/format.js';
import { matvec, matmul, transpose, dot, norm, solve, tupleTeX } from './_la.js';
import { spaces } from './_spaces.js';
import { eigSym2, lsq } from './_ortho.js';
import { cTeX, cmatTeX, phasors } from './_cplx.js';
import { svd, rng as parkMiller } from '../../src/viz/model/la-svd.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const DEG = 180 / Math.PI;
const r4 = (v) => +(+v).toFixed(4);
const r6 = (v) => +(+v).toPrecision(6);
const tn = (x, n = 3) => tex(x, n);
/** A number for TeX with a real minus sign handled by TeX itself. */
const nv = (x) => nice(r6(x));
/** A matrix of decimals as a bmatrix (no fractions). */
const mt = (A, f = nv) => `\\begin{bmatrix} ${A.map((row) => row.map(f).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
/** A column of decimals. */
const ct = (v, f = nv) => `\\begin{bmatrix} ${v.map(f).join(' \\\\ ')} \\end{bmatrix}`;
/** A tuple of decimals: (1.5,\ -2,\ 0). */
const tt = (v, f = nv) => `(${v.map(f).join(',\\ ')})`;
/** A number as plain canvas text with a real minus sign. */
const pl = (x) => String(nv(x)).replace('-', '−');

/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) {
    if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  }
  return kept;
}

// ── picture pieces (graph curves and labels) ────────────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: [5, 4] } : {}) });
const poly = (pts, color, width, dash) => pts.slice(1).map((p, k) => seg(pts[k], p, color, width, dash));
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0, align) => ({ x: r4(x), y: r4(y), r: 0, color, label, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });
const dot2 = (x, y, color = 'gold', r = 5) => ({ x: r4(x), y: r4(y), r, color });
const picture = (params, caption) => ({ type: 'graph', params: { equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', xticks: 0, yticks: 0, ...params }, caption });

// ── round 1: thrusters ──────────────────────────────────────────────────────
const BUS = [1, 0.5];   // half-length and half-width of the bus, m (top view)
/** A thruster's column of the allocation matrix: its force (dₓ, d_y) and torque x d_y − y dₓ at 1 N. */
const colOf = ({ p, d }) => [d[0], d[1], r4(p[0] * d[1] - p[1] * d[0])];
const allocation = (thr) => [0, 1, 2].map((i) => thr.map((th) => colOf(th)[i]));

/** The bus from above, its centre of mass, and each thruster as a dot with the push it gives (arrow) and its plume. */
function busPic(thr, { caption, extraArrows = [], extraPoints = [] } = {}) {
  const [W, H] = BUS;
  const curves = [...poly([[-W, -H], [W, -H], [W, H], [-W, H], [-W, -H]], 'ink2', 2.2)];
  const arrows = [
    { from: [-1.85, -0.9], to: [-1.45, -0.9], color: 'ink3', width: 1.6, label: 'x', labelDx: 4, labelDy: 4 },
    { from: [-1.85, -0.9], to: [-1.85, -0.5], color: 'ink3', width: 1.6, label: 'y', labelDx: 4, labelDy: 0 },
    ...extraArrows,
  ];
  const points = [dot2(0, 0, 'ink2', 4), tag(0, 0, 'CM', 'ink2', 6, 14), ...extraPoints];
  thr.forEach((th, j) => {
    const [x, y] = th.p, [dx, dy] = th.d;
    curves.push(seg([x, y], [x - 0.28 * dx, y - 0.28 * dy], 'ink3', 5));            // the nozzle, pointing out
    arrows.push({ from: [x, y], to: [x + 0.42 * dx, y + 0.42 * dy], color: 'warn', width: 2.6 });
    points.push(dot2(x, y, 'gold', 5), tag(x - 0.5 * dx + 0.12 * dy, y - 0.5 * dy - 0.12 * dx, String(j + 1), 'gold', 0, 0, 'center'));
  });
  return picture({ x: [-2, 2], y: [-1, 1], curves, arrows, points, alt: 'Top view of a rectangular satellite bus with thrusters at its edges' }, caption);
}

// four-thruster layouts (positions on the 2 m × 1 m bus, push directions) whose
// null space is spanned by a vector of positive integers — the set can cancel itself
const LAYOUTS = [
  [[[-1, -0.5], [1, 0]], [[-1, -0.5], [0, 1]], [[0, 0.5], [0, -1]], [[1, 0], [-1, 0]]],
  [[[-1, -0.5], [1, 0]], [[-0.5, -0.5], [0, 1]], [[0, 0.5], [0, -1]], [[1, 0.5], [-1, 0]]],
  [[[-1, 0.5], [1, 0]], [[-1, 0.5], [0, -1]], [[0.5, -0.5], [0, 1]], [[1, 0], [-1, 0]]],
  [[[-1, -0.5], [0, 1]], [[0, 0.5], [0, -1]], [[1, 0.5], [-1, 0]], [[-1, 0], [1, 0]]],
  [[[0, -0.5], [0, 1]], [[1, 0.5], [-1, 0]], [[1, 0.5], [0, -1]], [[-1, 0], [1, 0]]],
  [[[-1, 0.5], [1, 0]], [[-0.5, 0.5], [0, -1]], [[0.5, -0.5], [0, 1]], [[1, -0.5], [-1, 0]]],
  [[[-0.5, -0.5], [0, 1]], [[1, 0.5], [-1, 0]], [[1, 0.5], [0, -1]], [[-1, 0], [1, 0]]],
  [[[-1, 0.5], [0, -1]], [[0, -0.5], [0, 1]], [[1, -0.5], [-1, 0]], [[-1, 0], [1, 0]]],
].map((L) => L.map(([p, d]) => ({ p, d })));

/** The positive integer null vector of a 3×4 allocation matrix of rank 3. */
function positiveNull(B) {
  const s = spaces(B);
  let n = s.null[0];
  if (n[0] < 0) n = n.map((x) => -x);
  const m = Math.min(...n.map(Math.abs));
  return n.map((x) => Math.round(x / m));
}

export function redundantCase(r) {
  const L = LAYOUTS[r.int(0, LAYOUTS.length - 1)], perm = r.perm(4);
  const thr = perm.map((i) => L[i]);
  const B = allocation(thr), n = positiveNull(B);
  const z = r.int(0, 3);
  const u = [0, 1, 2, 3].map((j) => (j === z ? 0 : r.int(1, 6)));
  const w = matvec(B, u).map(r4);
  const others = [0, 1, 2, 3].filter((j) => j !== z);
  const k = r.pick(others);
  return { thr, B, n, z, u, w, k };
}

/** A three-thruster layout whose thrust lines all pass through Q = (a, b)/10 m. */
const DIRS345 = [[0.6, 0.8], [0.8, 0.6], [-0.6, 0.8], [-0.8, 0.6], [0.6, -0.8], [0.8, -0.6], [-0.6, -0.8], [-0.8, -0.6]];
export function concurrentCase(r) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const a = r.pick([-6, -4, -2, 2, 4, 6]), b = r.pick([-3, -2, -1, 1, 2, 3]);
    const Q = [a / 10, b / 10];
    const sy = r.sign(), sx = r.sign();
    const T1 = { p: [Q[0], sy * BUS[1]], d: [0, -sy] };      // on the top or bottom edge, pushing across the bus
    const T2 = { p: [sx * BUS[0], Q[1]], d: [-sx, 0] };      // on a side edge, pushing along the bus
    // the canted thruster: P = Q − s d on an edge (s > 0), so its exhaust leaves outward
    const opts = [];
    for (const d of DIRS345) {
      for (const [axis, val] of [[1, 0.5], [1, -0.5], [0, 1], [0, -1]]) {
        const s = (Q[axis] - val) / d[axis];
        if (!(s > 0.25)) continue;
        const P = [Q[0] - s * d[0], Q[1] - s * d[1]];
        const other = 1 - axis, lim = axis === 1 ? 0.88 : 0.4;
        if (Math.abs(P[other]) > lim) continue;
        if (Math.hypot(P[0] - T1.p[0], P[1] - T1.p[1]) < 0.35 || Math.hypot(P[0] - T2.p[0], P[1] - T2.p[1]) < 0.35) continue;
        opts.push({ p: P.map(r4), d });
      }
    }
    if (!opts.length) continue;
    const T3 = r.pick(opts);
    const thr = r.shuffle([T1, T2, T3]);
    const B = allocation(thr);
    const y = [b, -a, 10];                                    // yᵀB = 0, scaled to integers
    // a pure torque is out of reach; three wrenches that are not
    const tau0 = r.pick([0.2, 0.3, 0.4, 0.5]) * r.sign();
    const reach = [];
    // a pure force (torques cancel) with nonnegative thrusts, if one exists
    let pure = null;
    for (let i = 0; i <= 4 && !pure; i++) for (let j = 0; j <= 4 && !pure; j++) for (let k = 0; k <= 4 && !pure; k++) {
      const u = [i, j, k];
      if (u.filter((x) => x > 0).length < 2) continue;
      const w = matvec(B, u).map(r4);
      if (Math.abs(w[2]) < 1e-9 && Math.hypot(w[0], w[1]) > 0.5) pure = { u, w, kind: 'pure' };
    }
    if (pure) reach.push(pure);
    for (let tries = 0; tries < 60 && reach.length < 3; tries++) {
      const u = [r.int(1, 4), r.int(1, 4), r.int(0, 3)];
      const w = matvec(B, u).map(r4);
      if (Math.abs(w[2]) < 0.25) continue;
      if (reach.some((q) => q.w.every((x, m) => Math.abs(x - w[m]) < 1e-9))) continue;
      reach.push({ u, w, kind: 'mixed' });
    }
    if (reach.length < 3) continue;
    return { Q, a, b, thr, B, y, tau0, reach };
  }
  throw new Error('concurrentCase: no layout');
}

// ── round 2: frames ─────────────────────────────────────────────────────────
// test commands with determinant ±1 (so a command splits into whole multiples of them)
const TESTS = [[[2, 1], [1, 1]], [[1, 1], [1, 2]], [[3, 1], [2, 1]], [[1, 2], [1, 3]], [[2, 3], [1, 2]], [[1, -1], [1, 0]], [[1, 1], [-1, 0]], [[2, 1], [-1, 0]]];
export function wheelsCase(r) {
  const A = [[r.int(40, 70), r.sign() * r.int(2, 9)], [r.sign() * r.int(2, 9), r.int(40, 70)]];
  const [t1, t2] = r.pick(TESTS);
  const p = matvec(A, t1), q = matvec(A, t2);
  for (let k = 0; k < 200; k++) {
    const c = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
    const u = [c[0] * t1[0] + c[1] * t2[0], c[0] * t1[1] + c[1] * t2[1]];
    if (u.some((x) => x === 0) || u.some((x) => Math.abs(x) > 5)) continue;
    if ((u[0] === t1[0] && u[1] === t1[1]) || (u[0] === t2[0] && u[1] === t2[1])) continue;
    const i = r.int(0, 1);
    const alpha = matvec(A, u);
    if (Math.abs(alpha[i]) < 20) continue;
    return { A, t1, t2, p, q, c, u, i, alpha };
  }
  return { A, t1, t2, p, q, c: [1, 1], u: [t1[0] + t2[0], t1[1] + t2[1]], i: 0, alpha: matvec(A, [t1[0] + t2[0], t1[1] + t2[1]]) };
}

/** Rotations with entries in ninths: from integer quaternions of norm 9 with no zero entry in the matrix. */
const rotQ = ([a, b, c, d]) => [[a * a + b * b - c * c - d * d, 2 * (b * c - a * d), 2 * (b * d + a * c)], [2 * (b * c + a * d), a * a - b * b + c * c - d * d, 2 * (c * d - a * b)], [2 * (b * d - a * c), 2 * (c * d + a * b), a * a - b * b - c * c + d * d]];
const NINTHS = [];
for (let a = 0; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++) for (let d = -3; d <= 3; d++) {
  if (a * a + b * b + c * c + d * d !== 9) continue;
  const R = rotQ([a, b, c, d]);
  if (R.flat().some((v) => v === 0)) continue;
  if (NINTHS.some((S) => S.every((row, i) => row.every((v, j) => v === R[i][j])))) continue;
  NINTHS.push(R);
}
const det3 = (A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
const ninthTeX = (N) => t`\tfrac19${mt(N, String)}`;
const colsOf = (M) => [0, 1, 2].map((j) => M.map((row) => row[j]));

export function handedCase(r) {
  const N = r.pick(NINTHS).map((row) => row.slice());
  const flip = r.bool(0.5) ? r.int(0, 2) : -1;
  if (flip >= 0) for (const row of N) row[flip] = -row[flip];
  const d9 = det3(N);                     // ±729
  return { N, flip, d9, proper: d9 > 0 };
}

export function trackerCase(r) {
  const N = r.pick(NINTHS), M = N.map((row) => row.map((v) => v / 9));
  const f = r.pick([25, 35, 50]);
  let x, y;
  do { x = r.float(-0.14, 0.14, 0.01); y = r.float(-0.14, 0.14, 0.01); } while (Math.abs(x) < 0.04 || Math.abs(y) < 0.04);
  const sT = [x, y, 1].map((v) => v / Math.hypot(x, y, 1));
  const sB = matvec(M, sT).map((v) => +v.toFixed(5));
  const i = r.int(0, 1);
  const sT2 = matvec(transpose(M), sB);           // from the printed (rounded) body components
  const ans = (f * sT2[i]) / sT2[2];
  return { N, M, f, sB, i, sT2, ans };
}

// ── round 3: spin and heat ──────────────────────────────────────────────────
export function axesCase(r) {
  for (let k = 0; k < 400; k++) {
    const I0 = [r.int(18, 26), r.int(24, 32), r.int(28, 36)];
    const m1 = r.pick([1, 2]), p1 = [r.pick([2, 3]) * r.sign(), r.pick([1, 2]) * r.sign()];     // magnetometer at the end of its boom
    const m2 = r.pick([2, 3]), p2 = [r.pick([1, 2]) * (p1[0] > 0 ? -1 : 1), r.pick([-1, 1, 2]) * r.sign()];   // the antenna, on the other side
    const ms = [[m1, p1], [m2, p2]];
    const Ixx = I0[0] + ms.reduce((s, [m, p]) => s + m * p[1] * p[1], 0);
    const Iyy = I0[1] + ms.reduce((s, [m, p]) => s + m * p[0] * p[0], 0);
    const Ixy = -ms.reduce((s, [m, p]) => s + m * p[0] * p[1], 0);
    const Izz = I0[2] + ms.reduce((s, [m, p]) => s + m * (p[0] * p[0] + p[1] * p[1]), 0);
    if (Ixy === 0 || Math.abs(Ixx - Iyy) < 2) continue;
    const th = 0.5 * Math.atan2(2 * Ixy, Ixx - Iyy) * DEG;
    if (Math.abs(th) < 4 || Math.abs(th) > 80 || Math.abs(Math.abs(th) - 45) < 3) continue;
    return { I0, m1, p1, m2, p2, Ixx, Iyy, Ixy, Izz, th };
  }
  throw new Error('axesCase');
}

export function stableCase(r) {
  const kind = r.pick(['disguise', 'disguise', 'major', 'minor']);
  for (let k = 0; k < 2000; k++) {
    const a = r.int(20, 60), c = r.int(20, 60), b = r.sign() * r.int(3, 14);
    const m = (a + c) / 2, R = Math.hypot((a - c) / 2, b), l1 = m + R, l2 = m - R;
    let e;
    if (kind === 'disguise') {
      // the diagonal entries say "largest" (or "smallest"); the eigenvalues say "in between"
      if (r.bool(0.5)) { const lo = Math.max(a, c) + 1, hi = Math.floor(l1 - 1.5); if (hi < lo) continue; e = r.int(lo, hi); }
      else { const lo = Math.ceil(l2 + 1.5), hi = Math.min(a, c) - 1; if (hi < lo) continue; e = r.int(lo, hi); }
    } else if (kind === 'major') { e = Math.ceil(l1 + 2) + r.int(0, 8); }
    else { e = Math.floor(l2 - 2) - r.int(0, 6); }
    // a real body: each principal moment is at most the sum of the other two
    if (!(e > 5 && l1 <= l2 + e && e <= l1 + l2 && l2 > 5)) continue;
    const verdict = e > l1 ? 0 : e < l2 ? 1 : 2;
    return { a, b, c, e, l1, l2, verdict, kind };
  }
  throw new Error('stableCase');
}

export function thermalCase(r) {
  for (let k = 0; k < 200; k++) {
    const a = r.pick([0.1, 0.15, 0.2, 0.25]), b = r.pick([0.1, 0.15, 0.2, 0.3]);
    if (a === b) continue;
    const lam = r6(1 - a - b);
    const T1 = r.pick([25, 30, 35]), T2 = r.pick([-20, -15, -10, -5]);
    const n = r.int(3, 7);
    const Tinf = (b * T1 + a * T2) / (a + b);       // C₁T₁ + C₂T₂ is conserved, with C₁ ∝ 1/a and C₂ ∝ 1/b
    const ans = Tinf + (T1 - Tinf) * lam ** n;
    if (Math.abs(ans) < 3) continue;
    return { a, b, lam, T1, T2, n, Tinf, ans, A: [[r6(1 - a), a], [b, r6(1 - b)]] };
  }
  throw new Error('thermalCase');
}

// ── round 4: orbit determination ────────────────────────────────────────────
export function rangingCase(r) {
  const D = r.pick([800, 1000, 1200, 1500]);        // km, the slant range at closest approach
  const ts = [-6, -4, -2, 2, 4, 6];                   // min
  const hs = ts.map((tm) => +((450 * tm) / Math.hypot(450 * tm, D)).toFixed(3));
  const s0 = r.int(100, 400) * r.sign(), v = r.int(6, 30) * r.sign();
  const drho = ts.map((tm, i) => Math.round(hs[i] * (s0 + v * tm) + r.float(-3, 3, 0.1)));
  const rows = ts.map((tm, i) => [hs[i], r4(hs[i] * tm)]);
  const fit = lsq(rows, drho);
  const P = r.pick([95, 97, 99]);
  const ans = fit.xhat[0] + fit.xhat[1] * P;
  const line = lsq(ts.map((tm) => [1, tm]), drho);
  return { D, ts, hs, drho, rows, fit, P, ans, line, s0, v };
}

export function factorCase(r) {
  const kind = r.pick(['qr', 'qr', 'svd', 'lu']);
  const m = r.pick([400, 600, 900]), n = r.pick([7, 8, 9]);
  if (kind === 'qr') {
    const p = r.pick([5, 6, 7]);
    const d = r.int(16 - 2 * p + 2, 16 - p - 1);
    return { kind, m, n, p, d, answer: 1 };
  }
  if (kind === 'lu') {
    const p = r.pick([1, 2]);
    const d = r.int(6, Math.min(10, 16 - 2 * p - 2));
    return { kind, m, n, p, d, answer: 0 };
  }
  return { kind, m, n, p: null, d: null, answer: 3 };
}

// ── round 5: downlink ───────────────────────────────────────────────────────
export function compressCase(r) {
  const mm = 24, nn = 32;
  for (let attempt = 0; attempt < 50; attempt++) {
    const S = r.int(2, 4);
    const st = [];
    for (let k = 0; k < 200 && st.length < S; k++) {
      const s = { x: r.float(3, nn - 4, 0.1), y: r.float(3, mm - 4, 0.1), a: r.float(0.3, 1, 0.01) };
      if (st.every((o) => Math.abs(o.x - s.x) > 3 && Math.abs(o.y - s.y) > 3)) st.push(s);
    }
    if (st.length < S) continue;
    const g = parkMiller(r.int(1, 2e9)), sigN = 0.004, w = 1.2;
    const A = Array.from({ length: mm }, (_, i) => Array.from({ length: nn }, (_, j) => {
      let v = 0;
      for (const s of st) v += s.a * Math.exp(-((i - s.y) ** 2 + (j - s.x) ** 2) / (2 * w * w));
      const z = Math.sqrt(-2 * Math.log(g())) * Math.cos(2 * Math.PI * g());
      return v + sigN * z;
    }));
    const sv = svd(A).s;
    const shown = sv.slice(0, 6).map((x) => +x.toPrecision(3));
    const tail = +Math.sqrt(sv.slice(6).reduce((s, x) => s + x * x, 0)).toPrecision(3);
    const tot2 = shown.reduce((s, x) => s + x * x, 0) + tail * tail;
    const err = (k) => Math.sqrt(shown.slice(k).reduce((s, x) => s + x * x, 0) + tail * tail) / Math.sqrt(tot2);
    const eS = err(S), eS1 = err(S - 1);
    const budget = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30].map((x) => x / 100).filter((x) => x > 1.25 * eS && x < eS1 / 1.25);
    if (!budget.length) continue;
    const X = r.pick(budget);
    const k = [1, 2, 3, 4, 5, 6].find((q) => err(q) <= X);
    if (k !== S) continue;
    const kSpec = [1, 2, 3, 4, 5].find((q) => shown[q] / shown[0] <= X) ?? 6;
    return { mm, nn, S, st, sv, shown, tail, X, k, kSpec, errs: [0, 1, 2, 3, 4, 5, 6].map(err), ans: k * (mm + nn + 1) };
  }
  throw new Error('compressCase');
}

export function arrayCase(r) {
  for (let k = 0; k < 400; k++) {
    const P1 = r.int(4, 15), P2 = r.int(4, 15), x = r.intExcept(-5, 5, [0]), y = r.intExcept(-5, 5, [0]);
    if (P1 === P2 || x * x + y * y > 0.8 * P1 * P2 || Math.abs(Math.abs(x) - Math.abs(y)) < 1) continue;
    const m = (P1 + P2) / 2, d = (P1 - P2) / 2;
    const lmax = m + Math.sqrt(d * d + x * x + y * y);
    return { P1, P2, x, y, m, d, lmax };
  }
  throw new Error('arrayCase');
}

const SYM = '₁₂₃₄';
const DECOMP = [
  t`Form the normal equations $A${T}A\hat{\mathbf x} = A${T}\mathbf b$ and solve them by LU (Cholesky, for this symmetric matrix)`,
  t`QR: factor $A = QR$ and back-substitute $R\hat{\mathbf x} = Q${T}\mathbf b$`,
  t`Eigen-decompose $A${T}A = V\Lambda V${T}$ and solve in that basis`,
  t`SVD: $A = U\Sigma V${T}$, then $\hat{\mathbf x} = \sum \frac{\mathbf u_i${T}\mathbf b}{\sigma_i}\mathbf v_i$ over the nonzero $\sigma_i$`,
];

export default boss({
  title: 'The Basis Change Challenge',
  intro: t`*Kittiwake* is an imagined 150 kg Earth-observation satellite, two weeks into commissioning. Before its camera starts work, the guidance, navigation and control team has a checklist, and every item on it is linear algebra: share a manoeuvre among redundant thrusters, trust a star tracker’s frame, find the axes the satellite can safely spin about, pin down its orbit from ranging data, and get pictures and signals to the ground. You sit in for the team. Five rounds, twelve problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'Four thrusters, or three',
      story: t`Kittiwake keeps its orbit with small cold-gas thrusters in the plane of its bus. Each thruster gives a force and a torque about the centre of mass, so a firing is a vector of thrusts and what it does is a matrix times that vector. The flight layout has one thruster more than it strictly needs — and a cheaper layout has been proposed for the next satellite.`,
      items: [
        num({
          id: 'r1-redundant', skill: 'math2270.LA-2.3', difficulty: 4,
          gen(r) {
            const C = redundantCase(r);
            const { thr, B, n, z, u, w, k } = C;
            const nn = dot(n, n), cmn = dot(u, n) / nn;
            const umn = u.map((x, j) => x - cmn * n[j]);
            const slips = [0, 1, 2, 3].filter((j) => j !== z).map((j) => {
              const s = -u[j] / n[j], v = u.map((x, m) => x + s * n[m]);
              return { value: r6(v[k]), feedback: t`That firing switches thruster ${j + 1} off, but then thruster ${z + 1} would need $u_${z + 1} = ${nv(v[z])}$ N — a negative thrust, a pull no thruster can give. Lower the multiple of $\mathbf n$ only until the *first* thrust reaches 0.` };
            });
            return {
              prompt: t`Kittiwake’s four thrusters sit on its $2\ \text{m}\times1\ \text{m}$ bus as in the picture. A thrust $u_j$ (in N) on thruster $j$ pushes the bus with a force $(F_x, F_y)$ and turns it with a torque $\tau$ about the centre of mass, and the allocation matrix $B$ sends the firing $\mathbf u = (u_1, u_2, u_3, u_4)$ to $(F_x, F_y, \tau) = B\mathbf u$ (newtons and newton-metres) — its column $j$ is what thruster $j$ does at 1 N: $$B = ${mt(B)}.$$ For a station-keeping burn, guidance asks for $(F_x, F_y, \tau) = ${tt(w)}$. A thruster can only push ($u_j \ge 0$), and the cheapest firing is the one with the smallest total thrust $u_1 + u_2 + u_3 + u_4$. In the cheapest firing that delivers exactly this, what is $u_${k + 1}$?`,
              answer: u[k], units: 'N', tol: { rel: 0, abs: 0.05 },
              errors: apart([
                ...slips,
                { value: r6(umn[k]), feedback: t`That is the minimum-length solution — the one in the row space, which a pseudo-inverse returns. It asks thruster ${z + 1} for $${nv(umn[z])}$ N, a pull. Among the solutions $\mathbf u_p + s\,\mathbf n$, keep every thrust $\ge 0$.` },
              ], u[k], 0.03, 0.01),
              hints: [
                t`Row-reduce $[B\,|\,\mathbf w]$. Four unknowns and only three independent equations leave one free variable, so every solution is $\mathbf u = \mathbf u_p + s\,\mathbf n$ with $B\mathbf n = \mathbf 0$.`,
                t`Here $\mathbf n = ${tt(n)}$: firing all four in these proportions gives no force and no torque. Check $B\mathbf n = \mathbf 0$.`,
                t`All of $\mathbf n$’s entries are positive, so the total thrust grows with $s$. Lower $s$ until the first thrust reaches 0 — that is the cheapest firing that never pulls.`,
              ],
              teach: t`The solutions of an underdetermined system are one particular solution plus the null space; a physical constraint such as $u_j \ge 0$ then picks the one to fly.`,
              explain: t`Elimination leaves one free variable, and the solution set is the line $\mathbf u = ${tt(u)} + s\,${tt(n)}$. The direction $\mathbf n$ spans the null space: fired together in that ratio, the four thrusters cancel — force, torque and all — and only waste propellant. Its entries are all positive, so the total thrust $${u.reduce((s, x) => s + x, 0)} + ${n.reduce((s, x) => s + x, 0)}s$ is least for the smallest $s$ that keeps every thrust $\ge 0$; thruster ${z + 1} reaches 0 first, at $s = 0$. So $\mathbf u = ${tt(u)}$ and $u_${k + 1} = ${u[k]}$ N. Check: $B\mathbf u = ${tt(w)}$ ✓. Real allocation software solves a small linear program like this every control cycle, with maximum thrusts and minimum pulse widths as further constraints.`,
              visual: busPic(thr, { caption: 'Top view of Kittiwake’s bus (2 m × 1 m) with its centre of mass. Gold dots: the thrusters, numbered beside their nozzles (grey); orange arrows: the direction each one pushes the bus. Arrow lengths do not show thrust.' }),
            };
          },
        }),
        mcq({
          id: 'r1-concurrent', skill: 'math2270.LA-5.4', difficulty: 3,
          gen(r) {
            const C = concurrentCase(r);
            const { B, y, tau0, reach, thr, Q } = C;
            const yT = t`(${y.join(',\\ ')})`;
            const choices = [tt([0, 0, tau0]), ...reach.map((q) => tt(q.w))];
            const why = {};
            reach.forEach((q, i) => {
              why[i + 1] = (q.kind === 'pure'
                ? t`A pure force is reachable: $\mathbf u = ${tt(q.u)}$ N gives exactly $${tt(q.w)}$, the thrusters’ torques cancelling. `
                : t`Reachable: $\mathbf u = ${tt(q.u)}$ N gives exactly $${tt(q.w)}$ — a large torque is no obstacle. `) + t`Every wrench in the column space passes the left-null-space test $${yT}\cdot\mathbf w = 0$, and this one does.`;
            });
            return {
              prompt: t`To save mass, the structures team proposes giving the next satellite only three thrusters, laid out as in the picture. Its allocation matrix (columns: what each thruster does at 1 N, as $(F_x, F_y, \tau)$ in newtons and newton-metres) is $$B = ${mt(B)}.$$ Allow, for the moment, thrusts of either sign. Which of these wrenches $(F_x, F_y, \tau)$ can **no** firing produce — which is outside the column space of $B$?`,
              choices, answer: 0, why,
              hints: [
                t`Three columns in $\mathbb R^3$ need not span it. Find the rank of $B$: is one column a combination of the other two?`,
                t`Find the left null space: a vector $\mathbf y$ with $\mathbf y${T}B = \mathbf 0${T}$. Every reachable wrench has $\mathbf y\cdot\mathbf w = 0$ — the column space is the plane perpendicular to $\mathbf y$.`,
                t`Try $\mathbf y = (y_1, y_2, 10)$ and make it perpendicular to two of the columns; then test each wrench.`,
              ],
              teach: t`A wrench is reachable exactly when it lies in the column space, and the left null space is the test: $\mathbf y${T}\mathbf w$ must vanish for every $\mathbf y$ in $N(B${T})$.`,
              explain: t`$B$ has rank 2, and its left null space is spanned by $\mathbf y = ${yT}$: $\mathbf y${T}B = \mathbf 0${T}$. So the reachable wrenches form the plane $${y[0]}F_x ${y[1] < 0 ? '-' : '+'} ${Math.abs(y[1])}F_y + 10\tau = 0$. Divided by 10 this reads $\tau - \big(${nv(Q[0])}\,F_y - (${nv(Q[1])})\,F_x\big) = 0$: the torque about the point $Q = ${tt(Q)}$ m is always zero, because all three thrust lines pass through $Q$. A pure torque $${tt([0, 0, tau0])}$ has $\mathbf y\cdot\mathbf w = ${nv(10 * tau0)} \ne 0$, and since a couple turns the bus equally about every point, no firing of these three can give one. The flight layout’s fourth thruster is there to break exactly this concurrency.`,
              visual: busPic(thr, { caption: 'The proposed three-thruster layout, top view: gold dots are the thrusters (numbered by their nozzles), orange arrows the direction each pushes the bus. Arrow lengths do not show thrust.' }),
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Frames of reference',
      story: t`Attitude control turns on the frames everything is measured in. The reaction wheels’ real mounting is known only from tests, and two star-tracker heads each report stars in their own axes — which must be the right way round before anyone trusts them.`,
      items: [
        num({
          id: 'r2-wheels', skill: 'math2270.LA-4.2', difficulty: 3,
          gen(r) {
            const C = wheelsCase(r);
            const { A, t1, t2, p, q, c, u, i, alpha } = C;
            const ax = i ? 'y' : 'x';
            const naive = p[i] * u[0] + q[i] * u[1];
            const sc = 2.6 / Math.max(...[...p, ...q, ...alpha].map(Math.abs));
            const X0 = 5.6;
            const lim = 2.9;
            const arrowsL = [
              { from: [0, 0], to: t1, color: 'accent', width: 2.6, label: 't₁' },
              { from: [0, 0], to: t2, color: 'warn', width: 2.6, label: 't₂' },
              { from: [0, 0], to: u, color: 'gold', width: 2.8, label: 'u', dash: [6, 4] },
              { from: [X0, 0], to: [X0 + sc * p[0], sc * p[1]], color: 'accent', width: 2.6, label: 'α(t₁)' },
              { from: [X0, 0], to: [X0 + sc * q[0], sc * q[1]], color: 'warn', width: 2.6, label: 'α(t₂)' },
            ].map((a) => ({ ...a, from: a.from.map(r4), to: a.to.map(r4) }));
            const curves = [seg([-lim, 0], [lim, 0], 'ink4', 1), seg([0, -lim], [0, lim], 'ink4', 1), seg([X0 - lim, 0], [X0 + lim, 0], 'ink4', 1), seg([X0, -lim], [X0, lim], 'ink4', 1)];
            return {
              prompt: t`Kittiwake’s two in-plane reaction wheels sit a little off their nominal axes, so the matrix $A$ that turns commanded wheel torques $\mathbf u = (u_1, u_2)$ (in mN·m) into the bus’s angular acceleration $\boldsymbol\alpha = A\mathbf u$ (in µrad/s², about body $x$ and $y$) is not the design one. Two test commands during commissioning gave $$\mathbf t_1 = ${tupleTeX(t1)} \mapsto ${tupleTeX(p)},\qquad \mathbf t_2 = ${tupleTeX(t2)} \mapsto ${tupleTeX(q)}.$$ Predict $\alpha_${ax}$ for the command $\mathbf u = ${tupleTeX(u)}$.`,
              answer: alpha[i], units: 'urad/s^2', tol: { rel: 0.002, abs: 0.05 },
              errors: apart([
                { value: naive, feedback: t`That treats the measured responses as the columns of $A$. They are the images of $\mathbf t_1$ and $\mathbf t_2$, not of $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (0, 1)$: first write $\mathbf u$ as a combination of $\mathbf t_1$ and $\mathbf t_2$.` },
                { value: alpha[1 - i], feedback: t`That is the other component, $\alpha_${i ? 'x' : 'y'}$.` },
                { value: c[1] * p[i] + c[0] * q[i], feedback: t`The weights are swapped: $\mathbf u = ${c[0]}\,\mathbf t_1 ${c[1] < 0 ? '-' : '+'} ${Math.abs(c[1])}\,\mathbf t_2$, so the response is $${c[0]}\,A\mathbf t_1 ${c[1] < 0 ? '-' : '+'} ${Math.abs(c[1])}\,A\mathbf t_2$.` },
              ], alpha[i]),
              hints: [
                t`A linear map is fixed by what it does to any basis. Write $\mathbf u = c_1\mathbf t_1 + c_2\mathbf t_2$ and solve for $c_1, c_2$.`,
                t`Then $A\mathbf u = c_1\,A\mathbf t_1 + c_2\,A\mathbf t_2$ — combine the measured responses with the same weights.`,
              ],
              teach: t`A linear map is known once you know its action on a basis — any basis, not only the standard one: split the input in that basis and combine the outputs with the same weights.`,
              explain: t`Solving $c_1\mathbf t_1 + c_2\mathbf t_2 = \mathbf u$ gives $c_1 = ${c[0]}$, $c_2 = ${c[1]}$. By linearity $A\mathbf u = ${c[0]}\,${tupleTeX(p)} ${c[1] < 0 ? '-' : '+'} ${Math.abs(c[1])}\,${tupleTeX(q)} = ${tupleTeX(alpha)}$, so $\alpha_${ax} = ${alpha[i]}$ µrad/s². (The standard matrix is $A = [A\mathbf t_1\ A\mathbf t_2]\,[\mathbf t_1\ \mathbf t_2]^{-1} = ${mt(A)}$: the off-diagonal entries are the cross-coupling the mounting error causes.) Two tests in independent directions are the least that pins down a map of the plane; real calibrations use many and fit them by least squares.`,
              visual: picture({ x: [-3.2, X0 + 3.2], y: [-3.1, 3.1], curves, arrows: arrowsL,
                points: [tag(-3, 2.9, 'commands (mN·m)', 'ink2', 0, 4), tag(X0 - 2.9, 2.9, 'responses (scaled)', 'ink2', 0, 4)],
                alt: 'Two test commands and the command to predict on the left; the two measured responses on the right' },
              'Left: the test commands t₁, t₂ and the new command u (dashed). Right: the measured responses to t₁ and t₂, shrunk to fit. The response to u is not drawn — that is the question.'),
            };
          },
        }),
        mcq({
          id: 'r2-handed', skill: 'math2270.LA-8.1', difficulty: 3,
          gen(r) {
            const C = handedCase(r);
            const { N, proper, d9, flip } = C;
            const cols = colsOf(N);
            const lab = ['x_{\\mathrm B}', 'y_{\\mathrm B}', 'z_{\\mathrm B}'];
            const crossOK = t`$\mathbf x_{\mathrm B}\times\mathbf y_{\mathrm B} = ${proper ? '' : '-'}\mathbf z_{\mathrm B}$`;
            const why = proper
              ? { 1: t`Orthonormal columns allow $\det M = \pm1$, but here $\det(9M) = 9^3\det M = ${d9}$, so $\det M = +1$ (and ${crossOK}). This frame is right-handed.` }
              : { 0: t`Orthonormal columns are not enough — a mirror image has them too. Here $\det(9M) = 9^3\det M = ${d9}$, so $\det M = -1$: ${crossOK}, a left-handed frame.` };
            why[2] = t`Check it: each column has length 1 (for the first, $(${cols[0].map((v) => `${v < 0 ? `(${v})` : v}^2`).join(' + ')})/81 = 1$) and the columns’ dot products are 0, so $M${T}M = I$. Orthogonality is fine; the question is orientation.`;
            why[3] = t`An orthogonal matrix keeps every length, so $|\det M| = 1$; it can never be 0.`;
            return {
              prompt: t`Kittiwake carries two star-tracker heads. The alignment survey of head B returns its **mounting matrix**, whose columns are the head’s axes $\mathbf x_{\mathrm B}, \mathbf y_{\mathrm B}, \mathbf z_{\mathrm B}$ written in body components: $$M = ${ninthTeX(N)}.$$ Before it is uploaded to the flight computer, it must be checked. What is $M$?`,
              choices: [
                t`A rotation ($\det M = +1$): a right-handed frame, safe to upload`,
                t`A reflection ($\det M = -1$): a left-handed frame, so one axis is flipped`,
                t`Not orthogonal ($M${T}M \ne I$): the survey numbers are inconsistent`,
                t`Singular ($\det M = 0$): the head’s axes lie in one plane`,
              ],
              answer: proper ? 0 : 1, why,
              hints: [
                t`A mounting matrix must be orthogonal, and an orthogonal matrix has $\det = \pm1$. Check $M${T}M = I$ first: column lengths and dot products.`,
                t`Then the sign. $\det(9M) = 9^3\det M = \pm729$ — work with the integer matrix. Or check whether column 1 × column 2 is $+$column 3.`,
              ],
              teach: t`The determinant’s sign is orientation: an orthogonal matrix with $\det = +1$ is a rotation, and one with $\det = -1$ includes a mirror, turning a right-handed frame into a left-handed one.`,
              explain: proper
                ? t`The columns are orthonormal, so $M$ is orthogonal, and $\det(9M) = ${d9}$ gives $\det M = +1$: ${crossOK}, a proper rotation. Upload it. Flight software checks this sign before accepting a frame: a mirror-image attitude solution would look healthy star by star while every manoeuvre went the wrong way.`
                : t`The columns are orthonormal, so $M$ is orthogonal — but $\det(9M) = ${d9}$ gives $\det M = -1$: ${crossOK}. The frame is left-handed, a mirror image of a rotation; most likely the sign of one axis (here the ${['first', 'second', 'third'][flip]}) was entered or wired backwards. Flipping that column restores $\det M = +1$. Flight software checks this sign before accepting a frame: a mirror-image attitude solution would look healthy star by star while every manoeuvre went the wrong way.`,
              visual: {
                type: 'calc-vectors3d',
                params: {
                  range: 1.3,
                  vectors: [
                    ...cols.map((v, j) => ({ to: v.map((x) => r4(x / 9)), color: ['accent', 'warn', 'good'][j], label: `\\mathbf ${lab[j]}` })),
                  ],
                  yaw: 0.6, pitch: 0.35,
                },
                caption: 'The three columns of M as arrows in the body frame (drawn axes). Judging handedness by eye from a turning 3D picture is unreliable — compute it.',
              },
            };
          },
        }),
        num({
          id: 'r2-tracker', skill: 'math2270.LA-7.2', difficulty: 4,
          gen(r) {
            const C = trackerCase(r);
            const { N, M, f, sB, i, sT2, ans } = C;
            const wrong = matvec(M, sB);
            const ax = i ? 'y' : 'x';
            const cols = colsOf(N);
            return {
              prompt: t`Kittiwake’s star-tracker head A has the verified mounting matrix $$M = ${ninthTeX(N)},$$ whose columns are the head’s axes $\mathbf x_{\mathrm A}, \mathbf y_{\mathrm A}, \mathbf z_{\mathrm A}$ (the boresight) in body components. The onboard catalogue and the current attitude estimate say a guide star lies along the unit vector $$\mathbf s = ${ct(sB)}$$ in body components. Through the head’s lens of focal length $f = ${f}$ mm, a star with head components $(s_x', s_y', s_z')$ lands on the detector at $\big(f\,s_x'/s_z',\ f\,s_y'/s_z'\big)$. Where should the star appear: what is its $${ax}$ position on the detector, in mm?`,
              answer: ans, units: 'mm', tol: { rel: 0.01, abs: 0.01 },
              errors: apart([
                ...(wrong[2] > 0.3 ? [{ value: (f * wrong[i]) / wrong[2], feedback: t`That multiplies by $M$. $M$ turns head components into body ones; to go from body to head, use $M^{-1}$, which for an orthogonal matrix is $M${T}$.` }] : []),
                ...(sB[2] > 0.3 ? [{ value: (f * sB[i]) / sB[2], feedback: t`Those are the body components. The detector sees the star in the head’s own axes: change basis first, $\mathbf s' = M${T}\mathbf s$.` }] : []),
              ], ans),
              hints: [
                t`$\mathbf s = M\mathbf s'$: the head components $\mathbf s'$ weight the columns of $M$. So $\mathbf s' = M^{-1}\mathbf s$.`,
                t`$M$ is orthogonal, so $M^{-1} = M${T}$: each head component is a dot product, $s_x' = \mathbf x_{\mathrm A}\cdot\mathbf s$, $s_z' = \mathbf z_{\mathrm A}\cdot\mathbf s$.`,
                t`Compute $s_${ax}'$ and $s_z'$, then $f\,s_${ax}'/s_z'$.`,
              ],
              teach: t`Coordinates change against the basis: if the new axes are the columns of $M$, new components are $M^{-1}$ times old — and for an orthonormal frame $M^{-1}$ is simply $M${T}$.`,
              explain: t`In head components $\mathbf s' = M${T}\mathbf s = ${ct(sT2, (v) => v.toFixed(4))}$: each entry is the dot product of $\mathbf s$ with one of the head’s axes, $(${cols[0].join(',\\ ')})/9$ and so on. The star is $${tn(Math.acos(Math.min(1, sT2[2])) * DEG, 3)}^\circ$ off the boresight, well inside a star tracker’s field of view, and it lands at $${ax} = ${f}\times${sT2[i].toFixed(4)}/${sT2[2].toFixed(4)} = ${tn(ans, 3)}$ mm. Matching predicted against measured positions star by star is how the tracker computes its attitude. (A pinhole camera model; real optics add distortion, calibrated on the ground.)`,
              visual: {
                type: 'calc-vectors3d',
                params: {
                  range: 1.3,
                  vectors: [
                    ...cols.map((v, j) => ({ to: v.map((x) => r4(x / 9)), color: ['accent', 'warn', 'good'][j], label: `\\mathbf ${['x', 'y', 'z'][j]}_{\\mathrm A}` })),
                    { to: sB.map((x) => r4(1.2 * x)), color: 'gold', label: '\\mathbf s' },
                  ],
                  yaw: 0.6, pitch: 0.35,
                },
                caption: 'The body frame (drawn axes), the head’s three axes (the columns of M) and the direction to the star, s (gold, drawn a little longer). Drag to rotate.',
              },
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Spin and heat',
      story: t`With its magnetometer boom and antenna deployed, Kittiwake’s mass is no longer symmetric, and its products of inertia are not zero. The team needs the axes it can spin about — for itself and for its sister satellite — and a forecast for a star-tracker head cooling inside its blanket.`,
      items: [
        num({
          id: 'r3-axes', skill: 'math2270.LA-11.1', difficulty: 3,
          gen(r) {
            const C = axesCase(r);
            const { m1, p1, m2, p2, Ixx, Iyy, Ixy, Izz, th } = C;
            const I = [[Ixx, Ixy, 0], [Ixy, Iyy, 0], [0, 0, Izz]];
            const { l } = eigSym2([[Ixx, Ixy], [Ixy, Iyy]]);
            const wrap = (x) => { let y = x; while (y > 90) y -= 180; while (y <= -90) y += 180; return y; };
            const twice = 2 * th, minor = wrap(th + 90);
            const ext = Math.max(Math.abs(p1[0]), Math.abs(p2[0])) + 0.6, eyt = Math.max(Math.abs(p1[1]), Math.abs(p2[1])) + 0.6;
            const h = Math.max(eyt, ext / 2, 1.5);
            return {
              prompt: t`With its booms deployed, Kittiwake’s mass model (picture) gives the inertia tensor about its centre of mass $$I = ${mt(I)}\ \text{kg m}^2.$$ Body $z$ is already a principal axis; the other two lie in the $x$–$y$ plane. At what angle from $+x$ (towards $+y$) does the principal axis with the **larger** of those two moments lie? Give the angle in degrees, between $-90^\circ$ and $90^\circ$.`,
              answer: th, units: 'deg', tol: { rel: 0.01, abs: 0.2 },
              errors: apart([
                ...(Math.abs(twice) < 180 ? [{ value: twice, feedback: t`That is $2\theta$: $\tan2\theta = \dfrac{2I_{xy}}{I_{xx} - I_{yy}}$ gives twice the angle. Halve it.` }] : []),
                { value: minor, feedback: t`That is the other principal axis, the one with the smaller moment $${tn(l[1], 4)}$ kg m². The two are perpendicular; check which eigenvalue your direction belongs to.` },
                { value: -th, feedback: t`Check the sign: the off-diagonal entry here is $I_{xy} = ${Ixy}$ kg m², and the eigenvector $(\cos\theta, \sin\theta)$ must satisfy $(I_{xx} - \lambda)\cos\theta + I_{xy}\sin\theta = 0$.` },
              ], th, 0.03, 0.01),
              hints: [
                t`The principal axes are the eigenvectors of the symmetric tensor; in the $x$–$y$ plane that is the $2\times2$ block $\begin{bmatrix} ${Ixx} & ${Ixy} \\ ${Ixy} & ${Iyy} \end{bmatrix}$.`,
                t`Find the larger eigenvalue $\lambda_1$, then an eigenvector $(\cos\theta, \sin\theta)$ from $(I_{xx} - \lambda_1)\cos\theta + I_{xy}\sin\theta = 0$.`,
                t`Or directly: $\tan2\theta = \dfrac{2I_{xy}}{I_{xx} - I_{yy}}$, taking the branch that gives the larger moment.`,
              ],
              teach: t`By the spectral theorem a symmetric inertia tensor has real principal moments along perpendicular principal axes — its eigenvalues and orthonormal eigenvectors.`,
              explain: t`The $x$–$y$ block has eigenvalues $\lambda = ${tn((Ixx + Iyy) / 2, 4)} \pm ${tn(Math.hypot((Ixx - Iyy) / 2, Ixy), 4)}$, that is $${tn(l[0], 4)}$ and $${tn(l[1], 4)}$ kg m². For the larger, $(I_{xx} - \lambda_1)\cos\theta + I_{xy}\sin\theta = 0$ gives $\tan\theta = ${tn((l[0] - Ixx) / Ixy, 4)}$, so $\theta = ${tn(th, 3)}^\circ$ — the same as $\tfrac12\operatorname{atan2}(2I_{xy},\ I_{xx} - I_{yy})$. The other principal axis is perpendicular, at $${tn(minor, 3)}^\circ$. In these axes $I = Q\Lambda Q${T}$ with no products of inertia: spun about either, the free satellite turns without wobbling. The ${m1} kg magnetometer and the ${m2} kg antenna, off the bus’s symmetry axes, are what tilted them.`,
              visual: picture({
                x: [-2 * h, 2 * h], y: [-h, h],
                curves: [...poly([[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]], 'ink2', 2.2), seg([0, 0], p1, 'ink3', 1.6), seg([0, 0], p2, 'ink3', 1.6)],
                arrows: [
                  { from: [-2 * h + 0.3, -h + 0.3], to: [-2 * h + 1.1, -h + 0.3], color: 'ink3', width: 1.6, label: 'x', labelDx: 4, labelDy: 4 },
                  { from: [-2 * h + 0.3, -h + 0.3], to: [-2 * h + 0.3, -h + 1.1], color: 'ink3', width: 1.6, label: 'y', labelDx: 4, labelDy: 0 },
                ],
                points: [dot2(0, 0, 'ink2', 4), dot2(p1[0], p1[1], 'gold', 7), dot2(p2[0], p2[1], 'violet', 7),
                  tag(p1[0], p1[1], `magnetometer, ${m1} kg`, 'gold', p1[0] > 0 ? -70 : -40, -12), tag(p2[0], p2[1], `antenna, ${m2} kg`, 'violet', -30, p2[1] > 0 ? -12 : 22)],
                alt: 'Top view of the bus with a magnetometer on a boom and an antenna on another',
              }, `Top view of the mass model: the bus (its centre of mass at the centre), the magnetometer at (${pl(p1[0])}, ${pl(p1[1])}) m and the antenna at (${pl(p2[0])}, ${pl(p2[1])}) m, treated as point masses on massless booms. Positions to scale.`),
            };
          },
        }),
        mcq({
          id: 'r3-stable', skill: 'math2270.LA-11.3', difficulty: 4,
          gen(r) {
            const C = stableCase(r);
            const { a, b, c, e, l1, l2, verdict } = C;
            const I = [[a, b, 0], [b, c, 0], [0, 0, e]];
            const L1 = tn(l1, 4), L2 = tn(l2, 4);
            const diagSays = e > Math.max(a, c) ? 0 : e < Math.min(a, c) ? 1 : 2;
            const sgn = verdict === 2 ? 'indefinite' : verdict === 0 ? 'negative definite' : 'positive definite';
            const why = {};
            const eig = t`The principal moments in the $x$–$y$ plane are the eigenvalues of $\begin{bmatrix} ${a} & ${b} \\ ${b} & ${c} \end{bmatrix}$, $${L1}$ and $${L2}$ kg m²`;
            const trap = (k) => (diagSays === k && verdict !== k ? t` — comparing $I_{zz} = ${e}$ with the diagonal entries ${a} and ${c} is the trap: they are not principal moments.` : '.');
            if (verdict !== 0) why[0] = t`${eig}, and $I_{zz} = ${e}$ is not above both${trap(0)}`;
            if (verdict !== 1) why[1] = t`${eig}, and $I_{zz} = ${e}$ is not below both${trap(1)}`;
            if (verdict !== 2) why[2] = t`${eig}, so $I_{zz} = ${e}$ is ${verdict === 0 ? 'the largest' : 'the smallest'} moment, not the intermediate one: the form is definite.`;
            why[3] = t`The products of inertia $I_{xz}$ and $I_{yz}$ are 0, so $z$ *is* a principal axis; $I_{xy} \ne 0$ only tilts the other two axes within the $x$–$y$ plane.`;
            return {
              prompt: t`Kittiwake’s sister satellite, Petrel, will spin about its body $z$ axis in safe mode. Its inertia tensor is $$I = ${mt(I)}\ \text{kg m}^2.$$ For a torque-free rigid body spinning about a principal axis $z$, the quantity $|\mathbf L|^2 - 2E\,I_{zz}$ (angular momentum and kinetic energy, both conserved) depends only on the small cross-axis rates $\boldsymbol\omega_\perp = (\omega_x, \omega_y)$: $$|\mathbf L|^2 - 2E\,I_{zz} = \boldsymbol\omega_\perp${T}\,G\,\boldsymbol\omega_\perp,\qquad G = J\,(J - I_{zz}\,\mathbb 1),\quad J = \begin{bmatrix} ${a} & ${b} \\ ${b} & ${c} \end{bmatrix}.$$ If this quadratic form is definite, $\boldsymbol\omega_\perp$ stays as small as it starts and the spin is stable; if it is indefinite it can grow. Which is true of the spin about $z$?`,
              choices: [
                t`Stable: $I_{zz}$ is the largest principal moment, and the form is definite`,
                t`Stable: $I_{zz}$ is the smallest principal moment, and the form is definite`,
                t`Unstable: $I_{zz}$ is the intermediate principal moment, and the form is indefinite`,
                t`Unstable: with $I_{xy} \ne 0$, $z$ is not a principal axis at all`,
              ],
              answer: verdict, why,
              hints: [
                t`$J$ and $J - I_{zz}\mathbb 1$ have the same eigenvectors, so $G$’s eigenvalues are $\lambda(\lambda - I_{zz})$ for each eigenvalue $\lambda$ of $J$. Its signature decides.`,
                t`$\lambda > 0$ always (a moment of inertia), so the sign of each of $G$’s eigenvalues is the sign of $\lambda - I_{zz}$. Or use $\det G = \det J\cdot\det(J - I_{zz}\mathbb 1)$: negative means indefinite.`,
                t`Find $J$’s eigenvalues — not its diagonal entries — and compare $I_{zz}$ with them.`,
              ],
              teach: t`Stability can hang on the signature of a quadratic form: a definite conserved form traps the motion near equilibrium, an indefinite one lets it escape along the directions where the form can stay fixed while the motion grows.`,
              explain: t`$J$ has eigenvalues $${L1}$ and $${L2}$ kg m², so $G$’s eigenvalues are $${L1}(${L1} - ${e}) = ${tn(l1 * (l1 - e), 3)}$ and $${L2}(${L2} - ${e}) = ${tn(l2 * (l2 - e), 3)}$: $G$ is ${sgn}. ${verdict === 2 ? t`Its level curves are hyperbolas, and the cross-axis rates can run off along them: $I_{zz} = ${e}$ is the intermediate moment, and the spin tumbles — the “tennis-racket” instability.` : t`Its level curves are ellipses, so the cross-axis rates stay as small as they start: $I_{zz} = ${e}$ is the ${verdict === 0 ? 'largest' : 'smallest'} principal moment, and the rigid spin is stable.`}${diagSays !== verdict ? t` The diagonal entries ${a} and ${c} would have suggested otherwise; only the eigenvalues are principal moments.` : ''} The rigid-body model is honest only so far: a real satellite flexes and sloshes and loses energy, and then only a spin about the axis of **largest** moment lasts — Explorer 1, spun about its long minor axis in 1958, went into a flat spin within hours.`,
              visual: {
                type: 'c3-contour',
                params: {
                  f: `${a}*x^2 + ${2 * b}*x*y + ${c}*y^2`, x: [-4, 4], y: [-2, 2], levels: 7, labels: false, aspect: 'wide', xlabel: 'ω (x)', ylabel: 'ω (y)',
                  arrows: eigSym2([[a, b], [b, c]]).q.map((v, k) => ({ from: [0, 0], to: v.map((x) => r4(1.6 * x)), color: k ? 'warn' : 'good', label: `q${SYM[k]}` })),
                },
                caption: 'Level curves of the cross-axis kinetic energy ωᵀJω, with J’s eigenvector directions q₁ (larger moment) and q₂ — the principal axes in the x–y plane. This form is always definite; the question is about G.',
              },
            };
          },
        }),
        num({
          id: 'r3-thermal', skill: 'math2270.LA-9.3', difficulty: 3,
          gen(r) {
            const C = thermalCase(r);
            const { a, b, lam, T1, T2, n, Tinf, ans, A } = C;
            const avg = (T1 + T2) / 2;
            const lo = Math.min(T1, T2) - 8, hi = Math.max(T1, T2) + 8;
            const pts = [[T1, T2]];
            for (let k = 0; k < 2; k++) { const [x, y] = pts[pts.length - 1]; pts.push([(1 - a) * x + a * y, b * x + (1 - b) * y]); }
            return {
              prompt: t`Inside its multilayer-insulation blanket, Kittiwake’s star-tracker head A and its mounting bracket swap heat with each other and, to a first approximation, with nothing else. Their temperatures $(T_1, T_2)$ in °C, sampled once an orbit, obey $\mathbf T_{k+1} = A\mathbf T_k$ with $$A = ${mt(A)}.$$ The head’s heater has just switched off with $\mathbf T_0 = (${T1}, ${T2})$ °C. What is the head’s temperature $T_1$ after $${n}$ orbits? Give 3 significant figures.`,
              answer: ans, units: '°C', tol: { rel: 0.005, abs: 0.02 },
              errors: apart([
                { value: avg + (T1 - avg) * lam ** n, feedback: t`The plain average $${nv(avg)}$ °C is not where they settle: the head and bracket have different heat capacities. The settling point is set by the eigenvector for $\lambda = 1$ together with the starting vector.` },
                { value: Tinf + (T1 - Tinf) * lam ** (n - 1), feedback: t`Count the steps: after $k$ orbits the decaying part has been multiplied by $\lambda_2^{\,k}$, so use $\lambda_2^{${n}}$.` },
                { value: Tinf, feedback: t`That is the long-run temperature. After ${n} orbits the decaying mode is still $${nv(lam)}^{${n}} \approx ${tn(lam ** n, 2)}$ of its starting size.` },
                { value: Tinf + (T1 - Tinf) * (1 - a) ** n, feedback: t`$1 - ${a} = ${nv(1 - a)}$ is a diagonal entry, not an eigenvalue. The decaying mode shrinks by $\lambda_2 = \operatorname{tr}A - 1 = ${nv(lam)}$ each orbit.` },
              ], ans),
              hints: [
                t`Diagonalize: each row of $A$ sums to 1, so $(1, 1)$ is an eigenvector with $\lambda_1 = 1$. The other eigenvalue is $\lambda_2 = \operatorname{tr}A - 1$.`,
                t`Write $\mathbf T_0 = c_1(1, 1) + c_2\mathbf v_2$ with $\mathbf v_2$ the eigenvector for $\lambda_2$. Then $\mathbf T_k = c_1(1, 1) + c_2\lambda_2^{\,k}\mathbf v_2$.`,
                t`$\mathbf v_2 = (${a}, -${b})$ (check $A\mathbf v_2 = \lambda_2\mathbf v_2$).`,
              ],
              teach: t`$A^k = PD^kP^{-1}$: in the eigenvector basis each mode just multiplies by its own eigenvalue every step — here one mode stays (the shared equilibrium) and one decays.`,
              explain: t`$A$ has eigenvalues $\lambda_1 = 1$ with eigenvector $(1, 1)$ and $\lambda_2 = ${nv(lam)}$ with eigenvector $(${a}, -${b})$. Splitting $\mathbf T_0 = c_1(1, 1) + c_2(${a}, -${b})$ gives $c_1 = ${tn(Tinf, 4)}$ °C — the common temperature they approach, weighted by heat capacity — and $c_2 = ${tn((T1 - Tinf) / a, 4)}$. So $T_1(k) = ${tn(Tinf, 4)} + ${tn(T1 - Tinf, 4)}\,(${nv(lam)})^k$, and after ${n} orbits $T_1 = ${tn(ans, 3)}$ °C. A teaching model: two lumped nodes, a fixed conductance and no loss through the blanket; a real thermal model has hundreds of nodes and radiation to space.`,
              visual: picture({
                x: [lo, hi], y: [lo, hi], aspect: 'wide', axes: true, xticks: 6, yticks: 5, xlabel: 'T₁, head (°C)', ylabel: 'T₂, bracket (°C)', axesAt: 'edge',
                curves: [
                  { fn: 'x', color: 'ink3', width: 1.4, dash: [5, 4], label: 'T₁ = T₂', labelAt: lo + 0.15 * (hi - lo) },
                  { param: [`${T1} + t*${a}`, `${T2} - t*${b}`], t: [r4((lo - T1) / a), r4((hi - T1) / a)], color: 'violet', width: 1.4, dash: [2, 4] },
                ],
                points: [...pts.map(([x, y], k) => ({ x: r4(x), y: r4(y), r: k ? 4 : 6, color: k ? 'accent' : 'gold' })), tag(T1, T2, 'start', 'gold', 8, 16)],
              }, 'The state (T₁, T₂) as a point: the start (gold) and the first two orbits (blue). Grey dashes: every equal-temperature state, the eigenvector line for λ = 1. The states move along the violet dotted line, the other eigenvector’s direction, toward it.'),
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Where exactly is it?',
      story: t`A ground station ranges Kittiwake on every pass. The predicted orbit is good, but not good enough to point the camera: the range residuals carry a small, growing along-track error, and a fit must find it — with an algorithm that will not lose the answer in round-off.`,
      items: [
        num({
          id: 'r4-ranging', skill: 'math2270.LA-10.4', difficulty: 4,
          gen(r) {
            const C = rangingCase(r);
            const { ts, hs, drho, rows, fit, P, ans, line } = C;
            const [s0h, vh] = fit.xhat;
            const sh2 = hs.reduce((s, h) => s + h * h, 0), sht2 = rows.reduce((s, row) => s + row[1] * row[1], 0);
            const shr = hs.reduce((s, h, i) => s + h * drho[i], 0), shtr = rows.reduce((s, row, i) => s + row[1] * drho[i], 0);
            const tab = t`\begin{array}{c|${ts.map(() => 'r').join('')}} t_i\ (\text{min}) & ${ts.join(' & ')} \\ \hline h_i & ${hs.join(' & ')} \\ \delta\rho_i\ (\text{m}) & ${drho.join(' & ')} \end{array}`;
            const ylo = Math.min(...drho), yhi = Math.max(...drho), pad = 0.15 * (yhi - ylo || 50);
            return {
              prompt: t`On one pass the ground station measures Kittiwake’s range six times. Linearized about the predicted orbit, each **range residual** (measured minus predicted) is $$\delta\rho_i = h_i\,\delta s(t_i),\qquad \delta s(t) = \delta s_0 + \delta v\,t,$$ where $\delta s(t)$ is how far Kittiwake is ahead of its predicted position along its track, $t$ is the time from closest approach, and $h_i$ is the along-track component of the unit line-of-sight vector from the station (it comes from the pass geometry): $$${tab}$$ Fit $\delta s_0$ (m) and $\delta v$ (m/min) by least squares. Then predict the along-track error at the next pass, $t = ${P}$ min, in metres.`,
              answer: ans, units: 'm', tol: { rel: 0.01, abs: 1 },
              errors: apart([
                { value: s0h, feedback: t`That is $\delta s_0$ alone — the error now. The drift $\delta v$ keeps adding for ${P} minutes: $\delta s(${P}) = \delta s_0 + ${P}\,\delta v$.` },
                { value: s0h - vh * P, feedback: t`Check the sign of the drift term: $\delta s(t) = \delta s_0 + \delta v\,t$ with $t = +${P}$ min.` },
                { value: line.xhat[0] + line.xhat[1] * P, feedback: t`That fits a straight line to $\delta\rho$ against $t$, ignoring the geometry. The station sees only the along-track component $h_i$ of the error, so the design matrix has rows $(h_i,\ h_it_i)$.` },
              ], ans),
              hints: [
                t`Unknowns $\mathbf x = (\delta s_0, \delta v)$; the design matrix $A$ has rows $(h_i,\ h_it_i)$ and the data vector is $\boldsymbol{\delta\rho}$. Solve $A${T}A\hat{\mathbf x} = A${T}\boldsymbol{\delta\rho}$.`,
                t`Look at $A${T}A$ before grinding: the off-diagonal entry $\sum h_i^2t_i$ is 0 here ($h$ and $t$ are both odd in $t$), so the two columns are orthogonal and the unknowns decouple.`,
                t`$\delta s_0 = \dfrac{\sum h_i\,\delta\rho_i}{\sum h_i^2}$ and $\delta v = \dfrac{\sum h_it_i\,\delta\rho_i}{\sum h_i^2t_i^2}$; then $\delta s_0 + ${P}\,\delta v$.`,
              ],
              teach: t`Least squares projects the data onto the column space of the design matrix; when the columns are orthogonal, the normal equations decouple and each unknown is one projection.`,
              explain: t`The columns $\mathbf h$ and $(h_it_i)$ are orthogonal: $\sum h_i^2t_i = 0$ because the pass is symmetric about closest approach. So $$\delta s_0 = \frac{\sum h_i\delta\rho_i}{\sum h_i^2} = \frac{${tn(shr, 5)}}{${tn(sh2, 5)}} = ${tn(s0h, 4)}\ \text{m},\qquad \delta v = \frac{\sum h_it_i\delta\rho_i}{\sum h_i^2t_i^2} = \frac{${tn(shtr, 5)}}{${tn(sht2, 5)}} = ${tn(vh, 4)}\ \text{m/min}.$$ At the next pass, $\delta s(${P}) = ${tn(s0h, 4)} ${vh < 0 ? '-' : '+'} ${P}\times${tn(Math.abs(vh), 4)} = ${tn(ans, 4)}$ m. The along-track error grows by tens of metres a minute because a slightly wrong orbital period accumulates — which is why orbits are re-determined every pass. Notice that the station is blind to along-track error at closest approach ($h \approx 0$ there), and sees it best far from it. A linearized one-pass teaching model; real orbit determination fits six orbital elements, drag and station biases to many passes at once.`,
              visual: {
                type: 'graph',
                params: {
                  x: [-7, 7], y: [r4(Math.min(0, ylo) - pad), r4(Math.max(0, yhi) + pad)], aspect: 'wide', xlabel: 't from closest approach (min)', ylabel: 'δρ (m)',
                  points: ts.map((tm, i) => ({ x: tm, y: drho[i], color: 'accent', r: 5 })),
                  vlines: [{ x: 0, label: 'closest approach', color: 'ink3' }],
                },
                caption: 'The six range residuals of the pass, measured minus predicted. Each carries about ±3 m of noise; no fit is drawn.',
              },
            };
          },
        }),
        mcq({
          id: 'r4-factor', skill: 'math2270.LA-10.3', difficulty: 3,
          gen(r) {
            const C = factorCase(r);
            const { kind, m, n, p, d, answer } = C;
            const cost = t`Costs for an $m\times n$ matrix with $m \gg n$: normal equations about $mn^2$ operations, QR about $2mn^2$, SVD about $4mn^2$ or more; eigen-decomposing $A${T}A$ costs forming it ($mn^2$) plus a little.`;
            let prompt, why;
            const mid = t`In double precision (about 16 significant digits), the normal equations deliver about $16 - 2p$ correct digits when $\kappa(A) \approx 10^p$, because $A${T}A$ has condition number $\kappa^2$; QR and the SVD work on $A$ itself and deliver about $16 - p$.`;
            if (kind === 'qr') {
              prompt = t`Kittiwake’s full orbit determination is a least-squares problem $A\mathbf x \approx \mathbf b$ with $A$ of size $${m}\times${n}$ (${m} ranges; ${n} parameters: the orbit, a drag factor, a solar-pressure factor and a station bias). Its condition number is $\kappa(A) \approx 10^{${p}}$, and the answer needs ${d} correct significant digits. ${mid} ${cost} Which method should the ground software use?`;
              why = {
                0: t`The cheapest — but $\kappa(A${T}A) \approx 10^{${2 * p}}$ leaves only about $16 - ${2 * p} = ${16 - 2 * p}$ correct digits, fewer than the ${d} needed.`,
                2: t`Forming $A${T}A$ already squares the condition number to about $10^{${2 * p}}$; its eigenvectors inherit the loss, leaving about ${16 - 2 * p} digits.`,
                3: t`Accurate enough (about $16 - ${p} = ${16 - p}$ digits), but about twice the work of QR. Keep the SVD for a matrix that is rank-deficient or nearly so.`,
              };
            } else if (kind === 'lu') {
              prompt = t`A quick-look orbit fit on the ground solves a least-squares problem $A\mathbf x \approx \mathbf b$ with $A$ of size $${m}\times${n}$, after every pass. Its columns are far from dependent: $\kappa(A) \approx 10^{${p}}$, and ${d} correct significant digits are plenty. ${mid} ${cost} Which method gives the answer with the fewest operations?`;
              why = {
                1: t`Accurate, but twice the work: with $\kappa(A${T}A) \approx 10^{${2 * p}}$ the normal equations still give about ${16 - 2 * p} digits, more than the ${d} needed, at half the cost.`,
                2: t`It works on the same $A${T}A$ as the normal equations, then does an iterative eigen-solve on top — more work for nothing.`,
                3: t`Accurate, but about four times the cost of the normal equations, and nothing here needs it: the columns are far from dependent.`,
              };
            } else {
              prompt = t`The orbit determination is extended to estimate a delay inside Kittiwake’s transponder as well as the station’s range bias. Every range measurement depends on the two only through their **sum**, so two columns of the $${m}\times${n}$ design matrix $A$ are identical. The team wants the minimum-length least-squares solution and an explicit statement of which combination of parameters the data cannot see. ${cost} Which method should it use?`;
              why = {
                0: t`$A${T}A$ is singular when two columns of $A$ are equal, so LU (or Cholesky) meets a zero pivot and stops.`,
                1: t`Plain QR produces an $R$ with a zero on its diagonal, so back-substitution divides by zero. (QR with column pivoting can cope, but it does not hand you the unobservable direction as cleanly.)`,
                2: t`In exact arithmetic it would find the null direction — but forming $A${T}A$ squares every singular value, so a small genuine $\sigma$ such as $10^{-8}$ becomes $10^{-16}$, lost in round-off and impossible to tell from a true zero.`,
              };
            }
            return {
              prompt, choices: DECOMP.slice(), answer, why,
              hints: [
                t`Ask two questions: is $A$ of full rank, and how many digits does each method keep? Only then compare costs.`,
                t`$\kappa(A${T}A) = \kappa(A)^2$: anything that forms $A${T}A$ loses twice as many digits as a method working on $A$. A rank-deficient $A$ needs a method that reveals the rank.`,
              ],
              teach: t`Pick the cheapest factorization that is accurate enough: normal equations (LU or Cholesky) for well-conditioned problems, QR when the condition number matters, the SVD when the matrix is rank-deficient or nearly so.`,
              explain: kind === 'qr'
                ? t`With $\kappa \approx 10^{${p}}$ the normal equations keep only about ${16 - 2 * p} digits — not enough — while QR keeps about ${16 - p}, enough for ${d}, at half the SVD’s cost. Householder QR is what most least-squares solvers use by default for exactly this reason.`
                : kind === 'lu'
                  ? t`With $\kappa \approx 10^{${p}}$ even the squared condition number $10^{${2 * p}}$ leaves about ${16 - 2 * p} digits — more than the ${d} required — so the cheapest route, the normal equations solved by Cholesky (LU for a symmetric positive-definite matrix), is the right one. Accuracy you do not need is not worth paying twice for.`
                  : t`Only the SVD handles a rank-deficient $A$ gracefully: one singular value is (numerically) zero, its right singular vector $\mathbf v \propto$ (transponder delay $-$ station bias) is exactly the combination the data cannot see, and dropping that $\sigma$ gives the minimum-length solution. That is the pseudo-inverse, $A^+ = V\Sigma^+U${T}$.`,
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Downlink',
      story: t`Last, the data must reach the ground. The optics team wants raw star-tracker windows to check the focus, over a thin link — and at the ground station, two antennas must be combined to catch Kittiwake’s faint signal.`,
      items: [
        num({
          id: 'r5-compress', skill: 'math2270.LA-12.2', difficulty: 4,
          gen(r) {
            const C = compressCase(r);
            const { mm, nn, S, shown, tail, X, k, kSpec, errs, ans } = C;
            const pct = Math.round(X * 100);
            const sv = C.sv;
            const pts = sv.slice(0, 16).map((s, j) => ({ x: j + 1, y: r4(Math.log10(s)), color: j < 6 ? 'accent' : 'ink3', r: 4.5 }));
            return {
              prompt: t`A $${mm}\times${nn}$ window from star-tracker head A (each pixel a brightness, 0 to 1) is to be sent as a rank-$k$ SVD truncation $A_k = \sigma_1\mathbf u_1\mathbf v_1${T} + \dots + \sigma_k\mathbf u_k\mathbf v_k${T}$. Its largest singular values are $$\sigma_1, \dots, \sigma_6 = ${shown.join(',\\ ')},$$ and all the rest together have $\sqrt{\sigma_7^2 + \sigma_8^2 + \cdots} = ${tail}$. The optics team accepts a relative error $\|A - A_k\|_F/\|A\|_F$ of at most ${pct}%. How many numbers must Kittiwake downlink for the smallest $k$ that meets it?`,
              answer: ans, tol: { rel: 0, abs: 0.5 },
              errors: apart([
                { value: k * (mm + nn), feedback: t`Each layer needs $\mathbf u_i$ (${mm} numbers), $\mathbf v_i$ (${nn}) **and** $\sigma_i$: $${mm} + ${nn} + 1 = ${mm + nn + 1}$ numbers per layer.` },
                { value: (k + 1) * (mm + nn + 1), feedback: t`The error of $A_k$ is $\sqrt{\sigma_{k+1}^2 + \sigma_{k+2}^2 + \cdots}$: the layers *after* $k$. Check $k = ${k}$ — it already meets ${pct}%.` },
                { value: (k - 1) * (mm + nn + 1), feedback: t`With $k = ${k - 1}$ the relative error is $${tn(100 * errs[k - 1], 3)}\%$, over the ${pct}% budget.` },
                ...(kSpec !== k ? [{ value: kSpec * (mm + nn + 1), feedback: t`That uses the largest stretch $\sigma_{k+1}/\sigma_1$ as the error. The budget is on the Frobenius norm, $\sqrt{\sigma_{k+1}^2 + \cdots}/\sqrt{\sigma_1^2 + \cdots}$.` }] : []),
                { value: mm * nn, feedback: t`That is the raw window, ${mm} × ${nn} pixels. The point of the truncation is to send far fewer.` },
              ], ans, 0.005, 0.005),
              hints: [
                t`Eckart–Young: $\|A - A_k\|_F = \sqrt{\sigma_{k+1}^2 + \sigma_{k+2}^2 + \cdots}$ and $\|A\|_F = \sqrt{\sigma_1^2 + \sigma_2^2 + \cdots}$. The tail beyond $\sigma_6$ is given as one number.`,
                t`Compute the relative error for $k = 1, 2, 3, \dots$ until it is at most ${pct}%.`,
                t`Storing $A_k$ takes $k(m + n + 1)$ numbers: $k$ columns $\mathbf u_i$, $k$ rows $\mathbf v_i$ and $k$ singular values.`,
              ],
              teach: t`The best rank-$k$ approximation keeps the $k$ largest SVD layers, its Frobenius error is the root-sum-square of the singular values left out, and it costs $k(m + n + 1)$ numbers.`,
              explain: t`$\|A\|_F = ${tn(Math.sqrt(shown.reduce((s, x) => s + x * x, 0) + tail * tail), 4)}$, and the relative errors for $k = 1, 2, 3, 4$ are $${[1, 2, 3, 4].map((q) => tn(100 * errs[q], 3) + '\\%').join(',\\ ')}$. The first at or below ${pct}% is $k = ${k}$, so Kittiwake sends $${k}\times(${mm} + ${nn} + 1) = ${ans}$ numbers instead of $${mm * nn}$. Why does $k = ${k}$ suffice? The window holds ${S} stars, and a star’s image is very nearly a Gaussian spot $e^{-(x^2 + y^2)/2w^2} = e^{-x^2/2w^2}\,e^{-y^2/2w^2}$ — a column profile times a row profile, a matrix of rank 1. ${S} stars make a matrix of rank ${S}, and everything after $\sigma_${S}$ is the sensor’s noise; dropping it even cleans the picture. (A simulated window: Gaussian spots of width 1.2 pixels on a dark sky with Gaussian noise. Real trackers downlink star positions, not windows; raw windows are for checking the optics.)`,
              visual: {
                type: 'graph',
                params: {
                  x: [0, 17], y: [-2, 1], aspect: 'wide', ylog: true, xlabel: 'index j', ylabel: 'σⱼ', xticks: 8,
                  points: pts,
                },
                caption: 'The window’s first 16 singular values on a log scale (blue: the six listed). Read the numbers from the problem, not the plot.',
              },
            };
          },
        }),
        num({
          id: 'r5-array', skill: 'math2270.LA-13.1', difficulty: 3,
          gen(r) {
            const C = arrayCase(r);
            const { P1, P2, x, y, m, d, lmax } = C;
            const rho = [x, y], rhoC = [x, -y];
            const R = [[[P1, 0], rho], [rhoC, [P2, 0]]];
            const reOnly = m + Math.sqrt(d * d + x * x);
            const sq = d * d + x * x - y * y;
            return {
              prompt: t`At the ground station, two antennas a few metres apart both receive Kittiwake’s downlink. The sample covariance of their complex baseband signals, in units of one receiver’s noise power, is the Hermitian matrix $$R = ${cmatTeX(R)}.$$ Combining the two signals with complex weights $\mathbf w$ ($\|\mathbf w\| = 1$) gives output power $\mathbf w^{\mathsf H}R\,\mathbf w$. What is the largest output power any choice of weights can reach? Give 3 significant figures.`,
              answer: lmax, tol: { rel: 0.005 },
              errors: apart([
                { value: reOnly, feedback: t`That keeps only the real part of $R_{12} = ${cTeX(rho)}$. The phase difference between the antennas is information too: the eigenvalues of a Hermitian matrix use $|R_{12}|^2 = ${x * x + y * y}$.` },
                ...(sq >= 0 ? [{ value: m + Math.sqrt(sq), feedback: t`That squares $R_{12}$ as if it were real, $(${cTeX(rho)})^2$. The characteristic polynomial has $R_{12}R_{21} = R_{12}\overline{R_{12}} = |R_{12}|^2 = ${x * x + y * y}$.` }] : []),
                { value: P1 + P2, feedback: t`That would need the two signals to be perfectly correlated ($|R_{12}|^2 = R_{11}R_{22}$). Here they are only partly correlated: find the largest eigenvalue of $R$.` },
                { value: Math.max(P1, P2), feedback: t`That is the better antenna alone. Weighting both — with the right phase — collects more.` },
              ], lmax),
              hints: [
                t`For a Hermitian $R$, the largest value of $\mathbf w^{\mathsf H}R\mathbf w$ over unit vectors is its largest eigenvalue, reached at the matching eigenvector.`,
                t`$\det(R - \lambda I) = (${P1} - \lambda)(${P2} - \lambda) - R_{12}R_{21}$, and $R_{21} = \overline{R_{12}}$, so $R_{12}R_{21} = |R_{12}|^2$.`,
                t`$\lambda_{\max} = \dfrac{R_{11} + R_{22}}{2} + \sqrt{\left(\dfrac{R_{11} - R_{22}}{2}\right)^2 + |R_{12}|^2}$.`,
              ],
              teach: t`A Hermitian matrix has real eigenvalues and orthonormal eigenvectors, and its largest eigenvalue is the maximum of $\mathbf w^{\mathsf H}R\mathbf w$ over unit vectors — the best a weighted combination can do.`,
              explain: t`$|R_{12}|^2 = ${x}^2 + ${y}^2 = ${x * x + y * y}$, so $$\lambda_{\max} = ${nv(m)} + \sqrt{${nv(d)}^2 + ${x * x + y * y}} = ${tn(lmax, 3)}.$$ The weights are the matching eigenvector: they shift one antenna’s phase to line its signal up with the other’s and weight each by how much signal it carries — maximum-ratio combining. That gives $${tn(lmax, 3)}$ against $${Math.max(P1, P2)}$ for the better antenna alone. (A teaching model: a real receiver separates signal from noise before combining, and the covariance is estimated from finitely many samples.)`,
              visual: phasors([{ name: 'R', v: [rho, rhoC], color: 'gold' }], { names: ['R₁₂', 'R₂₁'], labels: false, caption: 'The two off-diagonal entries of R as arrows in the complex plane (real part across, imaginary part up): R₂₁ is the mirror image of R₁₂ — its complex conjugate — as it must be in a Hermitian matrix.' }),
            };
          },
        }),
      ],
    },
  ],
});
