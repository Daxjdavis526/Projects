// The DOM-free model behind the em-circuit simulation: DC circuits and RC
// transients, solved by modified nodal analysis (MNA). Tested headlessly in
// test/em-circuit.test.mjs.
//
// A circuit is a list of two-terminal elements between numbered nodes:
//   { nodes: N, elements: [{ id, kind, a, b, … }] }      node 0 is ground (0 V)
// Kinds:
//   R  resistor       { R }       current a→b is (V_a − V_b)/R
//   L  lamp           { R }       a resistor drawn as a bulb (fixed R: a real filament’s rises as it heats)
//   G  galvanometer   { R }       a sensitive meter: a resistor that reads its own current
//   B  battery        { emf, r }  a is the − terminal, b the +; V_b − V_a = emf − r·I, I flowing a→b inside
//   W  wire, A ammeter, S switch (when closed: true)      ideal: V_a = V_b
//   C  capacitor      { C }       holds v = V_a − V_b, and C dv/dt = I (I flows a→b: onto plate a)
//   V  voltmeter                  ideal: draws no current; reads V_a − V_b
// An open switch and a voltmeter are not part of the network.
//
// solve(circuit, vC) gives every node voltage and every element's current,
// voltage drop and power, with each capacitor held at the voltage vC[id].
// transient(circuit, v0) gives the exact time evolution from capacitor voltages
// v0. The capacitor currents are affine in the capacitor voltages, I = i0 − Y v,
// and Y is symmetric for a network of resistors, wires and sources
// (reciprocity), so C dv/dt = i0 − Y v is solved exactly by diagonalising
// S = C^(−1/2) Y C^(−1/2): the voltages are a sum of exponentials, one per mode,
// with time constants τ = 1/λ. A node joined only to capacitors keeps its
// charge (a mode with λ = 0). Energies come out exactly too: every current is a
// constant plus a sum of exponentials, so ∫I dt and ∫I² dt are closed forms.
//
// preset(name, opts) builds the fixed layouts the simulation draws (series,
// parallel, combination, ladder, Wheatstone bridge, two-loop, RC and a
// capacitor-discharge firing circuit): node positions on a grid plus the
// element list, with the value keys their sliders set. circuitOf() fills in
// the numbers and the switch positions.

export const E_CHARGE = 1.602176634e-19;   // C, exact (2019 SI)

const BRANCH = new Set(['B', 'W', 'A', 'S', 'C']);      // elements carrying an MNA current variable
const RESIST = new Set(['R', 'L', 'G']);

/** Is the element part of the network right now? */
export const present = (e) => e.kind !== 'V' && !(e.kind === 'S' && !e.closed);

// ─── linear algebra ─────────────────────────────────────────────────────────

/** Solve A x = b by Gaussian elimination with partial pivoting; throws on a singular matrix. */
export function linsolve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  let scale = 0;
  for (const row of A) for (const v of row) scale = Math.max(scale, Math.abs(v));
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (!(Math.abs(M[p][c]) > 1e-13 * scale)) throw new Error('singular circuit: a loop of ideal sources and wires (a short circuit), or a floating part');
    if (p !== c) [M[p], M[c]] = [M[c], M[p]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/** Eigenvalues and eigenvectors (columns of Q) of a small symmetric matrix, by cyclic Jacobi rotations. */
export function eigenSym(S0) {
  const n = S0.length;
  const S = S0.map((r) => [...r]);
  const Q = S.map((_, i) => S.map((__, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0, diag = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) (i === j ? (diag += S[i][j] ** 2) : (off += S[i][j] ** 2));
    if (off <= 1e-30 * (diag || 1)) break;
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(S[p][q]) < 1e-300) continue;
      const th = (S[q][q] - S[p][p]) / (2 * S[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) {               // S ← Jᵀ S J
        const a = S[k][p], b = S[k][q];
        S[k][p] = c * a - s * b; S[k][q] = s * a + c * b;
      }
      for (let k = 0; k < n; k++) {
        const a = S[p][k], b = S[q][k];
        S[p][k] = c * a - s * b; S[q][k] = s * a + c * b;
      }
      for (let k = 0; k < n; k++) {               // Q ← Q J
        const a = Q[k][p], b = Q[k][q];
        Q[k][p] = c * a - s * b; Q[k][q] = s * a + c * b;
      }
    }
  }
  return { values: S.map((r, i) => r[i]), vectors: Q };
}

// ─── the instantaneous network ─────────────────────────────────────────────

/**
 * Capacitors wired directly in parallel (joined only by ideal conductors) share
 * one voltage, so they are one state: each group has a representative, and a
 * member carries sigma·(C/C_rep) times the representative's current (sigma = −1
 * when it is connected the other way round). Returns Map id → { rep, sigma, ratio }.
 */
export function capGroups(circuit) {
  const N = circuit.nodes, parent = [...Array(N).keys()];
  const find = (i) => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
  for (const e of circuit.elements) if (present(e) && (e.kind === 'W' || e.kind === 'A' || e.kind === 'S')) { const a = find(e.a), b = find(e.b); if (a !== b) parent[Math.max(a, b)] = Math.min(a, b); }
  const groups = new Map(), byPair = new Map();
  for (const e of circuit.elements) {
    if (e.kind !== 'C') continue;
    const A = find(e.a), B = find(e.b);
    if (A === B) throw new Error(`capacitor ${e.id} is shorted by a wire`);
    const key = A < B ? `${A},${B}` : `${B},${A}`;
    const r = byPair.get(key);
    if (!r) { byPair.set(key, e); groups.set(e.id, { rep: e.id, sigma: 1, ratio: 1 }); }
    else groups.set(e.id, { rep: r.id, sigma: find(r.a) === A ? 1 : -1, ratio: e.C / r.C });
  }
  return groups;
}

/**
 * Node voltages and element currents with every capacitor held at vC[id] volts
 * (a capacitor in a parallel group follows its group's representative).
 * Returns { V: node potentials, I: {id: current a→b}, drop: {id: V_a − V_b}, P: {id: power absorbed} }.
 * A part of the circuit not joined to node 0 is referred to its lowest-numbered node.
 */
export function solve(circuit, vC = {}) {
  const N = circuit.nodes, els = circuit.elements;
  const live = els.filter(present);
  const groups = capGroups(circuit);
  const member = (e) => e.kind === 'C' && groups.get(e.id).rep !== e.id;
  const parent = [...Array(N).keys()];
  const find = (i) => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
  for (const e of live) { const ra = find(e.a), rb = find(e.b); if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb); }
  const idx = new Array(N).fill(-1), seen = new Set();
  let n = 0;
  for (let i = 0; i < N; i++) {
    const r = find(i);
    if (seen.has(r)) idx[i] = n++;
    else seen.add(r);          // the first (lowest) node of each connected piece is its reference: node 0 for the grounded piece
  }
  const branches = live.filter((e) => BRANCH.has(e.kind) && !member(e));
  const bi = new Map(branches.map((e, k) => [e.id, n + k]));
  const size = n + branches.length;
  const A = Array.from({ length: size }, () => new Array(size).fill(0)), rhs = new Array(size).fill(0);
  for (const e of live) {
    const a = idx[e.a], b = idx[e.b];
    if (RESIST.has(e.kind)) {
      const g = 1 / e.R;
      if (a >= 0) A[a][a] += g;
      if (b >= 0) A[b][b] += g;
      if (a >= 0 && b >= 0) { A[a][b] -= g; A[b][a] -= g; }
    } else if (member(e)) {
      // a current tied to its group representative's: I = sigma·(C/C_rep)·I_rep
      const { rep, sigma, ratio } = groups.get(e.id), m = bi.get(rep);
      if (a >= 0) A[a][m] += sigma * ratio;
      if (b >= 0) A[b][m] -= sigma * ratio;
    } else if (BRANCH.has(e.kind)) {
      const m = bi.get(e.id);
      if (a >= 0) { A[a][m] += 1; A[m][a] += 1; }
      if (b >= 0) { A[b][m] -= 1; A[m][b] -= 1; }
      if (e.kind === 'B') { A[m][m] -= e.r || 0; rhs[m] = -e.emf; }
      else if (e.kind === 'C') rhs[m] = vC[e.id] ?? 0;
    }
  }
  const x = size ? linsolve(A, rhs) : [];
  const V = new Array(N).fill(0);
  for (let i = 0; i < N; i++) if (idx[i] >= 0) V[i] = x[idx[i]];
  // the reference node of a floating piece sits at 0 V; its potential is meaningless anyway
  const I = {}, drop = {}, P = {};
  for (const e of els) {
    const d = V[e.a] - V[e.b];
    let i = 0;
    if (present(e)) {
      if (RESIST.has(e.kind)) i = d / e.R;
      else if (member(e)) { const { rep, sigma, ratio } = groups.get(e.id); i = sigma * ratio * x[bi.get(rep)]; }
      else i = x[bi.get(e.id)];
    }
    I[e.id] = i; drop[e.id] = d; P[e.id] = e.kind === 'V' ? 0 : d * i;
  }
  return { V, I, drop, P };
}

// ─── exact transients ──────────────────────────────────────────────────────

/**
 * The exact evolution from capacitor voltages v0 (volts, by id) at t = 0.
 * Returns { caps, tau, lambda, vAt(t), final, state(t), charge(t), energy(t) }:
 *   tau     the time constants 1/λ of the decaying modes, longest first
 *   state   the full solve() result at time t
 *   charge  ∫ I dt over [0, t] for every element (coulombs)
 *   energy  ∫ P dt over [0, t] for every element: the energy it absorbed (J); a battery's is negative
 */
export function transient(circuit, v0 = {}) {
  const els = circuit.elements;
  const allCaps = els.filter((e) => e.kind === 'C');
  const groups = capGroups(circuit);
  const caps = allCaps.filter((c) => groups.get(c.id).rep === c.id);      // one state per parallel group
  const ids = caps.map((c) => c.id), n = caps.length;
  // a group starts at its charge-weighted voltage (ideal wires share the charge at once)
  const vInit = caps.map((c) => {
    let q = 0, Ct = 0;
    for (const m of allCaps) { const g = groups.get(m.id); if (g.rep === c.id) { q += g.sigma * m.C * (v0[m.id] ?? v0[c.id] ?? 0); Ct += m.C; } }
    return q / Ct;
  });
  const capV = (v) => Object.fromEntries(allCaps.map((m) => { const g = groups.get(m.id); return [m.id, g.sigma * v[ids.indexOf(g.rep)]]; }));
  const base = solve(circuit, Object.fromEntries(ids.map((id) => [id, 0])));
  const unit = ids.map((id) => solve(circuit, Object.fromEntries(ids.map((j) => [j, j === id ? 1 : 0]))));
  // every quantity X is affine in the capacitor voltages: X(v) = X0 + Σ_j dX_j v_j
  const dI = unit.map((u) => Object.fromEntries(els.map((e) => [e.id, u.I[e.id] - base.I[e.id]])));
  // the network itself, solved directly at given state voltages (more accurate than summing the unit responses)
  const affine = (v) => solve(circuit, Object.fromEntries(ids.map((id, i) => [id, v[i]])));
  if (!n) {
    const st = affine([]);
    const lin = (t, f) => Object.fromEntries(els.map((e) => [e.id, f(e) * t]));
    return {
      caps: [], tau: [], lambda: [], vAt: () => ({}), final: {}, state: () => st,
      charge: (t) => lin(t, (e) => st.I[e.id]), energy: (t) => lin(t, (e) => st.P[e.id]),
    };
  }
  const i0 = ids.map((id) => base.I[id]);
  const Y = ids.map((_, i) => ids.map((__, j) => -dI[j][ids[i]]));      // I_i = i0_i − Σ_j Y_ij v_j
  const s = caps.map((c) => Math.sqrt(c.C));
  const S = Y.map((row, i) => row.map((y, j) => y / (s[i] * s[j])));
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) S[i][j] = S[j][i] = (S[i][j] + S[j][i]) / 2;
  const { values, vectors: Q } = eigenSym(S);
  const lmax = Math.max(0, ...values);
  const lam = values.map((l) => (l > 1e-9 * lmax ? l : 0));          // λ = 0: charge trapped on a node joined only to capacitors
  const f = i0.map((x, i) => x / s[i]);
  const QT = (u) => Q[0].map((_, k) => u.reduce((acc, ui, i) => acc + Q[i][k] * ui, 0));
  const g = QT(f), z0 = QT(vInit.map((v, i) => v * s[i]));
  const zInf = lam.map((l, k) => (l > 0 ? g[k] / l : z0[k]));
  const fromZ = (z) => s.map((si, i) => z.reduce((acc, zk, k) => acc + Q[i][k] * zk, 0) / si);
  const vAtArr = (t) => fromZ(zInf.map((zi, k) => (lam[k] > 0 ? zi + (z0[k] - zi) * Math.exp(-lam[k] * t) : zi)));
  const vInf = fromZ(zInf);
  // decaying modes: v(t) = v∞ + Σ_k w_k e^(−λ_k t)
  const modes = lam.map((l, k) => ({ l, w: l > 0 ? s.map((si, i) => (Q[i][k] * (z0[k] - zInf[k])) / si) : null })).filter((m) => m.l > 0);
  const stInf = affine(vInf);
  // each element current: α + Σ_k β_k e^(−λ_k t)
  const coef = Object.fromEntries(els.map((e) => [e.id, {
    alpha: stInf.I[e.id],
    beta: modes.map((m) => (present(e) ? m.w.reduce((acc, wi, j) => acc + dI[j][e.id] * wi, 0) : 0)),
  }]));
  const E1 = (x) => -Math.expm1(-x);                                   // 1 − e^(−x), accurate for small x
  const intI = (c, t) => c.alpha * t + modes.reduce((acc, m, k) => acc + (c.beta[k] * E1(m.l * t)) / m.l, 0);
  const intI2 = (c, t) => {
    let r = c.alpha * c.alpha * t;
    modes.forEach((m, k) => { r += (2 * c.alpha * c.beta[k] * E1(m.l * t)) / m.l; });
    modes.forEach((m, k) => modes.forEach((q, j) => { r += (c.beta[k] * c.beta[j] * E1((m.l + q.l) * t)) / (m.l + q.l); }));
    return r;
  };
  const byId = Object.fromEntries(els.map((e) => [e.id, e]));
  return {
    caps: allCaps.map((c) => c.id),
    lambda: modes.map((m) => m.l).sort((a, b) => a - b),
    tau: modes.map((m) => 1 / m.l).sort((a, b) => b - a),
    vAt: (t) => capV(vAtArr(t)),
    final: capV(vInf),
    state: (t) => affine(vAtArr(t)),
    charge: (t) => Object.fromEntries(els.map((e) => [e.id, intI(coef[e.id], t)])),
    energy: (t) => {
      const v = vAtArr(t), out = {};
      for (const e of els) {
        const c = coef[e.id];
        if (RESIST.has(e.kind)) out[e.id] = present(e) ? e.R * intI2(c, t) : 0;
        else if (e.kind === 'B') out[e.id] = -e.emf * intI(c, t) + (e.r || 0) * intI2(c, t);
        else if (e.kind === 'C') { const g = groups.get(e.id), i = ids.indexOf(g.rep); out[e.id] = 0.5 * e.C * (v[i] ** 2 - vInit[i] ** 2); }
        else out[e.id] = 0;
      }
      void byId;
      return out;
    },
  };
}

// ─── formulas the lessons quote ────────────────────────────────────────────

export const seriesR = (...R) => R.reduce((a, b) => a + b, 0);
export const parallelR = (...R) => 1 / R.reduce((a, b) => a + 1 / b, 0);
export const seriesC = (...C) => 1 / C.reduce((a, b) => a + 1 / b, 0);
export const parallelC = (...C) => C.reduce((a, b) => a + b, 0);

/** Conductors at 20 °C: resistivity ρ (Ω·m), temperature coefficient α (1/K), free-electron density n (m⁻³). */
export const MATERIALS = {
  copper: { label: 'copper', rho: 1.68e-8, alpha: 0.0039, n: 8.47e28 },
  aluminium: { label: 'aluminium', rho: 2.65e-8, alpha: 0.0039, n: 18.1e28 },
  tungsten: { label: 'tungsten', rho: 5.6e-8, alpha: 0.0045, n: 6.3e28 },
  nichrome: { label: 'nichrome', rho: 1.0e-6, alpha: 0.0004, n: null },
};

/** Resistance of a round wire: R = ρL/A with A = πd²/4. */
export const wireR = (rho, L, d) => (rho * L) / ((Math.PI * d * d) / 4);
/** Drift speed of carriers: v_d = I/(n q A). */
export const driftSpeed = (I, n, A, q = E_CHARGE) => I / (n * q * A);

// ─── preset layouts ────────────────────────────────────────────────────────

const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
/** 'R1' → 'R₁', 'Rc' → 'Rc' (a canvas label, plain text). */
export const nameOf = (id) => id.replace(/(\D)(\d+)$/, (m, a, d) => a + [...d].map((c) => SUB[c]).join(''));

function builder() {
  const nodes = [], elements = [];
  let w = 0;
  const B = {
    nodes, elements,
    node: (x, y) => nodes.push([x, y]) - 1,
    el: (id, kind, a, b, o = {}) => { elements.push({ id, kind, a, b, name: o.name ?? (BRANCH.has(kind) && kind !== 'B' && kind !== 'C' && kind !== 'S' && kind !== 'A' ? '' : nameOf(id)), ...o }); return id; },
    wire: (a, b) => B.el(`w${++w}`, 'W', a, b, { name: '' }),
    /** Elements in series along the straight segment a→b, each spanning an equal share; a plain wire if there are none. */
    run: (a, b, items) => {
      const list = items.filter(Boolean);
      if (!list.length) return B.wire(a, b);
      const [x0, y0] = nodes[a], [x1, y1] = nodes[b];
      let prev = a;
      list.forEach((it, k) => {
        const next = k === list.length - 1 ? b : B.node(x0 + ((x1 - x0) * (k + 1)) / list.length, y0 + ((y1 - y0) * (k + 1)) / list.length);
        B.el(it.id, it.kind, prev, next, it);
        prev = next;
      });
      return null;
    },
  };
  return B;
}

const R = (id, o = {}) => ({ id, kind: o.lamp ? 'L' : 'R', ...o });

/**
 * A preset layout. Options by preset:
 *   single    { sw, amm, volt, lamp, wire }       a battery and one resistor (or bulb)
 *   series    { n: 2|3, sw, amm, lamp }            n in series; amm puts ammeters before and after
 *   parallel  { n: 2|3, sw, line, bsw, lamp }      n branches; line: a resistor in the feed; bsw: a switch per branch
 *   combo     { sw, lamp }                         R1 in series with R2 ∥ R3
 *   ladder    {}                                   R1, R2 shunt, R3, R4 shunt
 *   bridge    { det: 'volt'|'galv', sw }           Wheatstone bridge: R1/R2 left, R3/R4 right
 *   twoloop   { flip }                             E1–R1, R3 in the middle, R2–E2 (flip: E2 reversed)
 *   rc        { net: 'single'|'series'|'parallel'|'combo' }   battery, two-way switch, R, capacitor network
 *   firing    {}                                   bus, arm switch, charging resistor, capacitor bank, fire switch, igniter
 * Every battery has an internal resistance key (r, r1, r2), default 0.
 */
export function preset(name, o = {}) {
  const B = builder();
  const P = { name, defaults: {}, loops: {}, tags: [], switches: [], junction: null };
  const bat = (id, a, b, rKey, extra = {}) => B.el(id, 'B', a, b, { rKey, lab: 'l', ...extra });
  if (name === 'single') {
    const g = B.node(0, 0), p = B.node(0, 4), q = B.node(7, 4), s = B.node(7, 0);
    bat('E', g, p, 'r');
    B.run(p, q, [o.sw && { id: 'S', kind: 'S', lab: 't' }, o.amm && { id: 'A1', kind: 'A', lab: 't' }]);
    B.el('R1', o.lamp ? 'L' : 'R', q, s, { lab: 'r', wire: !!o.wire, name: o.lamp ? 'bulb' : 'R' });
    B.wire(s, g);
    if (o.volt) B.el('V1', 'V', q, s, { lab: 'r', name: 'V', off: 1.6 });
    Object.assign(P.defaults, { E: 12, r: 0, R1: 6 });
    P.tags = [{ n: p, at: 'tl' }, { n: g, at: 'bl' }];
    if (o.sw) P.switches.push('S');
  } else if (name === 'series') {
    const n = o.n ?? 2;
    const g = B.node(0, 0), p = B.node(0, 4), q = B.node(8, 4), s = B.node(8, 0);
    bat('E', g, p, 'r');
    B.run(p, q, [o.sw && { id: 'S', kind: 'S', lab: 't' }, o.amm && { id: 'A1', kind: 'A', lab: 't' }, R('R1', { lamp: o.lamp, lab: 't' })]);
    B.el('R2', o.lamp ? 'L' : 'R', q, s, { lab: 'r' });
    B.run(s, g, [n === 3 && R('R3', { lamp: o.lamp, lab: 'b' }), o.amm && { id: 'A2', kind: 'A', lab: 'b' }]);
    Object.assign(P.defaults, { E: 12, r: 0, R1: 4, R2: 8, R3: 12 });
    if (n !== 3) delete P.defaults.R3;
    P.tags = [{ n: p, at: 'tl' }, { n: q, at: 'tr' }, { n: g, at: 'bl' }];
    if (n === 3) P.tags.push({ n: s, at: 'br' });
    if (o.sw) P.switches.push('S');
  } else if (name === 'parallel') {
    const n = o.n ?? 2;
    const xs = n === 3 ? [3.6, 6.1, 8.6] : [4.2, 7.4];
    const g = B.node(0, 0), p = B.node(0, 4);
    bat('E', g, p, 'r');
    const t = xs.map((x) => B.node(x, 4)), u = xs.map((x) => B.node(x, 0));
    B.run(p, t[0], [o.sw && { id: 'S', kind: 'S', lab: 't' }, o.line && R('Rw', { lab: 't', name: o.lineName ?? 'R_line' })]);
    for (let k = 1; k < n; k++) B.wire(t[k - 1], t[k]);
    for (let k = 0; k < n; k++) {
      const id = `R${k + 1}`;
      if (o.bsw) { const m = B.node(xs[k], 2.6); B.el(`S${k + 1}`, 'S', t[k], m, { lab: 'r' }); B.el(id, o.lamp ? 'L' : 'R', m, u[k], { lab: 'r' }); P.switches.push(`S${k + 1}`); }
      else B.el(id, o.lamp ? 'L' : 'R', t[k], u[k], { lab: 'r' });
    }
    for (let k = n - 1; k > 0; k--) B.wire(u[k], u[k - 1]);
    B.wire(u[0], g);
    Object.assign(P.defaults, { E: 12, r: 0, R1: 4, R2: 12, ...(n === 3 ? { R3: 6 } : {}), ...(o.line ? { Rw: 0.5 } : {}) });
    P.tags = [{ n: p, at: 'tl' }, { n: g, at: 'bl' }];
    if (o.line) P.tags.push({ n: t[0], at: 'tr' });
    if (o.sw) P.switches.unshift('S');
  } else if (name === 'combo') {
    const g = B.node(0, 0), p = B.node(0, 4), t0 = B.node(4.6, 4), t1 = B.node(7.8, 4), u0 = B.node(4.6, 0), u1 = B.node(7.8, 0);
    bat('E', g, p, 'r');
    B.run(p, t0, [o.sw && { id: 'S', kind: 'S', lab: 't' }, R('R1', { lamp: o.lamp, lab: 't' })]);
    B.wire(t0, t1);
    B.el('R2', o.lamp ? 'L' : 'R', t0, u0, { lab: 'r' });
    B.el('R3', o.lamp ? 'L' : 'R', t1, u1, { lab: 'r' });
    B.wire(u1, u0); B.wire(u0, g);
    Object.assign(P.defaults, { E: 12, r: 0, R1: 2, R2: 6, R3: 3 });
    P.tags = [{ n: p, at: 'tl' }, { n: t0, at: 'tr' }, { n: g, at: 'bl' }];
    P.junction = t0;
    if (o.sw) P.switches.push('S');
  } else if (name === 'ladder') {
    const g = B.node(0, 0), p = B.node(0, 4), t1 = B.node(4, 4), t2 = B.node(8, 4), u1 = B.node(4, 0), u2 = B.node(8, 0);
    bat('E', g, p, 'r');
    B.el('R1', 'R', p, t1, { lab: 't' });
    B.el('R3', 'R', t1, t2, { lab: 't' });
    B.el('R2', 'R', t1, u1, { lab: 'r' });
    B.el('R4', 'R', t2, u2, { lab: 'r' });
    B.wire(u2, u1); B.wire(u1, g);
    Object.assign(P.defaults, { E: 12, r: 0, R1: 2, R2: 4, R3: 2, R4: 2 });
    P.tags = [{ n: p, at: 'tl' }, { n: t1, at: 'tr' }, { n: t2, at: 'tr' }, { n: g, at: 'bl' }];
  } else if (name === 'bridge') {
    const g = B.node(0, 0), p = B.node(0, 5), tL = B.node(3.6, 5), tR = B.node(8.4, 5);
    const mL = B.node(3.6, 2.5), mR = B.node(8.4, 2.5), uL = B.node(3.6, 0), uR = B.node(8.4, 0);
    bat('E', g, p, 'r');
    B.run(p, tL, [o.sw && { id: 'S', kind: 'S', lab: 't' }]);
    B.wire(tL, tR);
    B.el('R1', 'R', tL, mL, { lab: 'l' }); B.el('R2', 'R', mL, uL, { lab: 'l' });
    B.el('R3', 'R', tR, mR, { lab: 'r' }); B.el('R4', 'R', mR, uR, { lab: 'r' });
    if (o.det === 'galv') B.el('Rg', 'G', mL, mR, { lab: 't', name: 'G' });
    else B.el('Vout', 'V', mR, mL, { lab: 't', name: 'Vout' });
    B.wire(uR, uL); B.wire(uL, g);
    Object.assign(P.defaults, { E: 10, r: 0, R1: 120, R2: 120, R3: 120, R4: 120, ...(o.det === 'galv' ? { Rg: 50 } : {}) });
    P.tags = [{ n: tL, at: 'tl' }, { n: mL, at: 'bl' }, { n: mR, at: 'br' }, { n: g, at: 'bl' }];
    if (o.sw) P.switches.push('S');
  } else if (name === 'twoloop') {
    const a = B.node(0, 0), b = B.node(0, 4), c = B.node(4.5, 4), d = B.node(9, 4), e = B.node(9, 0), f = B.node(4.5, 0);
    bat('E1', a, b, 'r1');
    B.el('R1', 'R', b, c, { lab: 't' });
    B.el('R2', 'R', c, d, { lab: 't' });
    B.el('R3', 'R', c, f, { lab: 'r' });
    if (o.flip) bat('E2', d, e, 'r2', { lab: 'r' }); else bat('E2', e, d, 'r2', { lab: 'r' });   // + at the top unless flipped
    B.wire(e, f); B.wire(f, a);
    Object.assign(P.defaults, { E1: 12, r1: 0, E2: 6, r2: 0, R1: 4, R2: 2, R3: 6 });
    P.loops = { left: [a, b, c, f], right: [c, d, e, f], outer: [a, b, c, d, e, f] };
    P.tags = [{ n: b, at: 'tl' }, { n: c, at: 'tc' }, { n: d, at: 'tr' }, { n: a, at: 'bl' }];
    P.junction = c;
  } else if (name === 'rc') {
    const net = o.net ?? 'single';
    const g = B.node(0, 0), p = B.node(0, 4);
    bat('E', g, p, 'r');
    const X = B.node(1.9, 4), Pv = B.node(3.1, 4), Yc = B.node(1.9, 2.75), Yg = B.node(1.9, 0);
    B.wire(p, X);
    B.el('Sc', 'S', X, Pv, { spdt: 'charge', name: '' });
    B.el('Sd', 'S', Yc, Pv, { spdt: 'discharge', name: '' });
    B.wire(Yc, Yg);
    const k = B.node(6.4, 4), kb = B.node(6.4, 0);
    B.el('R', 'R', Pv, k, { lab: 't' });
    if (net === 'single') { B.el('C', 'C', k, kb, { lab: 'r' }); Object.assign(P.defaults, { C: 1e-3 }); }
    else if (net === 'series') { const m = B.node(6.4, 2); B.el('C1', 'C', k, m, { lab: 'r' }); B.el('C2', 'C', m, kb, { lab: 'r' }); Object.assign(P.defaults, { C1: 1e-3, C2: 2e-3 }); P.tags.push({ n: m, at: 'r' }); }
    else if (net === 'parallel') { const k2 = B.node(8.8, 4), kb2 = B.node(8.8, 0); B.el('C1', 'C', k, kb, { lab: 'r' }); B.wire(k, k2); B.el('C2', 'C', k2, kb2, { lab: 'r' }); B.wire(kb2, kb); Object.assign(P.defaults, { C1: 1e-3, C2: 2e-3 }); }
    else if (net === 'combo') {
      // R ends at k; C1 across the top; C2 ∥ C3 down to the rail
      const m = B.node(8.6, 4), m2 = B.node(10.6, 4), mb = B.node(8.6, 0), mb2 = B.node(10.6, 0);
      B.el('C1', 'C', k, m, { lab: 't' }); B.el('C2', 'C', m, mb, { lab: 'r' }); B.wire(m, m2); B.el('C3', 'C', m2, mb2, { lab: 'r' }); B.wire(mb2, mb); B.wire(mb, kb);
      Object.assign(P.defaults, { C1: 2e-3, C2: 1e-3, C3: 1e-3 });
      P.tags.push({ n: m, at: 'tr' });
    }
    B.wire(kb, Yg); B.wire(Yg, g);
    Object.assign(P.defaults, { E: 12, r: 0, R: 1000 });
    P.tags.unshift({ n: p, at: 'tl' }, { n: k, at: 'tr' }, { n: g, at: 'bl' });
    P.switches.push('mode');
    P.net = net;
  } else if (name === 'firing') {
    const g = B.node(0, 0), p = B.node(0, 4), k = B.node(5.2, 4), q = B.node(9, 4), kb = B.node(5.2, 0), qb = B.node(9, 0);
    bat('E', g, p, 'r', { name: 'bus' });
    B.run(p, k, [{ id: 'S1', kind: 'S', lab: 't', name: 'arm' }, R('Rc', { lab: 't', name: 'Rc' })]);
    B.el('C', 'C', k, kb, { lab: 'r', name: 'C' });
    B.run(k, q, [{ id: 'S2', kind: 'S', lab: 't', name: 'fire' }]);
    B.el('Rb', 'L', q, qb, { lab: 'r', name: 'igniter', igniter: true });
    B.wire(qb, kb); B.wire(kb, g);
    Object.assign(P.defaults, { E: 28, r: 0, Rc: 1000, C: 4.7e-3, Rb: 1 });
    P.tags = [{ n: p, at: 'tl' }, { n: k, at: 'tr' }, { n: g, at: 'bl' }];
    P.switches.push('S1', 'S2');
  } else throw new Error(`unknown circuit preset “${name}”`);
  return { ...P, nodes: B.nodes, elements: B.elements };
}

export const PRESETS = ['single', 'series', 'parallel', 'combo', 'ladder', 'bridge', 'twoloop', 'rc', 'firing'];

/** The value key each element reads (its id, except batteries: emf by id and r by rKey). */
export const keysOf = (pre) => pre.elements.flatMap((e) => (e.kind === 'B' ? [e.id, e.rKey] : RESIST.has(e.kind) || e.kind === 'C' ? [e.id] : []));

/**
 * The circuit for the solver: values filled in (SI units) and switches set.
 *   values  { E: 12, r: 0.5, R1: 4, C: 1e-3, … }   (defaults from the preset)
 *   sw      { S: true, S1: false, mode: 'charge', … }   switch states (default: closed; mode 'charge')
 */
export function circuitOf(pre, values = {}, sw = {}) {
  const v = { ...pre.defaults, ...values };
  const elements = pre.elements.map((e) => {
    const x = { id: e.id, kind: e.kind, a: e.a, b: e.b };
    if (RESIST.has(e.kind)) x.R = v[e.id];
    if (e.kind === 'B') { x.emf = v[e.id]; x.r = v[e.rKey] ?? 0; }
    if (e.kind === 'C') x.C = v[e.id];
    if (e.kind === 'S') x.closed = e.spdt ? (sw.mode ?? 'charge') === e.spdt : sw[e.id] ?? true;
    return x;
  });
  return { nodes: pre.nodes.length, elements };
}
