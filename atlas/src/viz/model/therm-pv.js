// Ideal-gas processes and cycles for the PV-diagram simulation
// (sims/therm-pv.js): states, the four textbook processes plus a straight line
// and an irreversible free expansion, the work, heat, internal-energy and
// entropy changes along each, and the Carnot, Otto, Brayton and rectangular
// cycles with their efficiencies. DOM-free, SI units throughout (Pa, m³, K, J,
// J/K, mol), tested headlessly in test/therm-pv.test.mjs.
//
// The gas is ideal with constant molar heat capacities: C_V = R/(γ − 1) and
// C_P = γR/(γ − 1). Every process except 'free' is quasi-static.

/** The molar gas constant, J/(mol K): exact since 2019 (k_B N_A). */
export const R = 8.314462618;

/** Gases on offer and their adiabatic index γ = C_P/C_V (constant: no vibration, no dissociation). */
export const GASES = {
  He: { name: 'helium', formula: 'He', gamma: 5 / 3 },
  Ar: { name: 'argon', formula: 'Ar', gamma: 5 / 3 },
  air: { name: 'air', formula: 'air', gamma: 1.4 },
  N2: { name: 'nitrogen', formula: 'N₂', gamma: 1.4 },
  O2: { name: 'oxygen', formula: 'O₂', gamma: 1.4 },
  H2: { name: 'hydrogen', formula: 'H₂', gamma: 1.4 },
  exhaust: { name: 'combustion gas', formula: 'exhaust', gamma: 1.2 },
};

export const KINDS = ['isothermal', 'isobaric', 'isochoric', 'adiabatic', 'line', 'free'];

/** γ of a gas key, or a number passed straight through. */
export const gammaOf = (gas) => (typeof gas === 'number' ? gas : GASES[gas]?.gamma);
/** Molar heat capacities at constant volume and at constant pressure, J/(mol K). */
export const cv = (g) => R / (g - 1);
export const cp = (g) => (g * R) / (g - 1);

/** A full state {P, V, T} from any two of them (P in Pa, V in m³, T in K) for n moles. */
export function state(s, n) {
  const { P, V, T } = s;
  if (P > 0 && V > 0) return { P, V, T: (P * V) / (n * R) };
  if (P > 0 && T > 0) return { P, T, V: (n * R * T) / P };
  if (V > 0 && T > 0) return { V, T, P: (n * R * T) / V };
  throw new Error('a state needs two of P, V and T, all positive');
}

/** Entropy of state s relative to state ref (J/K): n C_V ln(T/T_ref) + n R ln(V/V_ref). */
export const entropy = (s, ref, n, g) => n * cv(g) * Math.log(s.T / ref.T) + n * R * Math.log(s.V / ref.V);

/**
 * The state reached from A along a process, stopping at a target that fixes
 * one more variable: { V } or { P } or { T }. A 'line' or 'free' leg needs a
 * full target state (two of P, V, T).
 */
export function reach(kind, A, target, n, g) {
  const { P, V, T } = target;
  switch (kind) {
    case 'isothermal':
      if (V > 0) return state({ T: A.T, V }, n);
      if (P > 0) return state({ T: A.T, P }, n);
      break;
    case 'isobaric':
      if (V > 0) return state({ P: A.P, V }, n);
      if (T > 0) return state({ P: A.P, T }, n);
      break;
    case 'isochoric':
      if (P > 0) return state({ V: A.V, P }, n);
      if (T > 0) return state({ V: A.V, T }, n);
      break;
    case 'adiabatic':
      if (V > 0) return state({ V, P: A.P * (A.V / V) ** g }, n);
      if (P > 0) return state({ P, V: A.V * (A.P / P) ** (1 / g) }, n);
      if (T > 0) return state({ T, V: A.V * (A.T / T) ** (1 / (g - 1)) }, n);
      break;
    case 'line':
      return state(target, n);
    case 'free':
      // into a vacuum, insulated: no work, no heat, so an ideal gas keeps its temperature
      if (V > 0) return state({ T: A.T, V }, n);
      break;
    default:
      throw new Error(`unknown process “${kind}”`);
  }
  throw new Error(`a ${kind} process cannot stop at ${JSON.stringify(target)}`);
}

/** Does B lie on a process of this kind through A? (relative tolerance tol) */
export function onProcess(kind, A, B, g, tol = 1e-3) {
  const same = (a, b) => Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b));
  switch (kind) {
    case 'isothermal': case 'free': return same(A.T, B.T);
    case 'isobaric': return same(A.P, B.P);
    case 'isochoric': return same(A.V, B.V);
    case 'adiabatic': return same(A.P * A.V ** g, B.P * B.V ** g);
    case 'line': return true;
    default: return false;
  }
}

/**
 * One leg from state A to state B (B must lie on the process through A).
 * Returns the work done BY the gas W, the heat INTO it Q, the change in its
 * internal energy dU (= Q − W), its entropy change dS, and the heat split into
 * the part taken in (Qin ≥ 0) and the part given out (Qout ≥ 0) — which differ
 * from max(±Q, 0) only on a straight line, where the heat can change sign part-way.
 */
export function leg(kind, A, B, n, g) {
  const Cv = cv(g), Cp = cp(g);
  const dU = n * Cv * (B.T - A.T);
  const dS = n * Cv * Math.log(B.T / A.T) + n * R * Math.log(B.V / A.V);
  let W = 0, Q = 0, Qin = null, Qout = null;
  switch (kind) {
    case 'isothermal': W = n * R * A.T * Math.log(B.V / A.V); Q = W; break;
    case 'isobaric': W = A.P * (B.V - A.V); Q = n * Cp * (B.T - A.T); break;
    case 'isochoric': W = 0; Q = dU; break;
    case 'adiabatic': W = (A.P * A.V - B.P * B.V) / (g - 1); Q = 0; break;
    case 'free': W = 0; Q = 0; break;
    case 'line': {
      const dV = B.V - A.V, dP = B.P - A.P;
      W = 0.5 * (A.P + B.P) * dV;
      Q = dU + W;
      // along V = V_A + t ΔV, P = P_A + t ΔP the heat rate dQ/dt = a + b t is linear in t
      const k = Cv / R;
      const a = k * (dP * A.V + A.P * dV) + A.P * dV, b = dP * dV * (2 * k + 1);
      const pos = (lo, hi) => { const q0 = a + b * lo, q1 = a + b * hi; return Math.max(0, 0.5 * (q0 + q1) * (hi - lo)); };
      const t0 = b !== 0 ? -a / b : -1;
      if (t0 > 0 && t0 < 1) {
        const p1 = pos(0, t0), p2 = pos(t0, 1);
        const n1 = Math.max(0, -0.5 * (a + (a + b * t0)) * t0), n2 = Math.max(0, -0.5 * ((a + b * t0) + (a + b)) * (1 - t0));
        Qin = p1 + p2; Qout = n1 + n2;
      }
      break;
    }
    default: throw new Error(`unknown process “${kind}”`);
  }
  if (Qin === null) { Qin = Math.max(Q, 0); Qout = Math.max(-Q, 0); }
  return { kind, A, B, W, Q, dU, dS, Qin, Qout, reversible: kind !== 'free' };
}

/**
 * Points along a leg for drawing: [{P, V, T}], N + 1 of them. A free expansion
 * has no path through equilibrium states, so it gives just its two ends.
 */
export function sampleLeg(L, n, g, N = 96) {
  const { kind, A, B } = L;
  if (kind === 'free') return [A, B];
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let P, V;
    if (kind === 'isochoric') { V = A.V; P = A.P + t * (B.P - A.P); }
    else if (kind === 'line') { V = A.V + t * (B.V - A.V); P = A.P + t * (B.P - A.P); }
    else {
      // isothermal and adiabatic curves are spaced evenly in ln V; isobaric evenly in V
      V = kind === 'isobaric' ? A.V + t * (B.V - A.V) : A.V * (B.V / A.V) ** t;
      P = kind === 'isobaric' ? A.P : kind === 'isothermal' ? (n * R * A.T) / V : A.P * (A.V / V) ** g;
    }
    pts.push({ P, V, T: (P * V) / (n * R) });
  }
  return pts;
}

/** The pressure on a process curve through A at volume V (not for isochoric). */
export function pressureOn(kind, A, V, n, g) {
  if (kind === 'isothermal' || kind === 'free') return (n * R * A.T) / V;
  if (kind === 'isobaric') return A.P;
  if (kind === 'adiabatic') return A.P * (A.V / V) ** g;
  return NaN;
}

/** A path: a start state and legs [{ kind, B }], each B a full state. */
export function path(start, legs, n, g) {
  const out = [];
  let A = start;
  for (const { kind, B } of legs) { out.push(leg(kind, A, B, n, g)); A = B; }
  return out;
}

/**
 * Totals over legs: net work and heat, heat taken in and given out, the
 * extreme temperatures reached, and — for a closed cycle — efficiency (an
 * engine, W > 0) or coefficients of performance (a refrigerator, W < 0),
 * beside the Carnot limits between the extreme temperatures.
 */
export function analyse(legs, n, g) {
  const sum = (f) => legs.reduce((s, L) => s + f(L), 0);
  const W = sum((L) => L.W), Q = sum((L) => L.Q), dU = sum((L) => L.dU), dS = sum((L) => L.dS);
  const Qin = sum((L) => L.Qin), Qout = sum((L) => L.Qout);
  let Tmin = Infinity, Tmax = -Infinity;
  for (const L of legs) for (const s of sampleLeg(L, n, g, 64)) { Tmin = Math.min(Tmin, s.T); Tmax = Math.max(Tmax, s.T); }
  const first = legs[0]?.A, last = legs[legs.length - 1]?.B;
  const closed = !!first && Math.abs(first.P - last.P) <= 1e-9 * first.P && Math.abs(first.V - last.V) <= 1e-9 * first.V;
  const res = { W, Q, dU, dS, Qin, Qout, Tmin, Tmax, closed };
  if (closed) {
    res.carnot = 1 - Tmin / Tmax;
    if (W > 0) res.e = W / Qin;
    else if (W < 0) { res.copRef = Qin / -W; res.copHP = Qout / -W; res.copRefMax = Tmin / (Tmax - Tmin); res.copHPMax = Tmax / (Tmax - Tmin); }
  }
  return res;
}

// ─── cycles ──────────────────────────────────────────────────────────────────
// Each preset returns { names, states, kinds }: leg k runs from states[k] to
// states[k + 1] (the last back to the first), as a process of kinds[k].

/** Carnot: isothermal expansion A→B at Th (by `ratio`), adiabatic B→C to Tc, isothermal C→D, adiabatic D→A. */
export function carnot({ Th, Tc, VA, ratio, n, g }) {
  const k = (Th / Tc) ** (1 / (g - 1));
  return {
    names: ['A', 'B', 'C', 'D'],
    states: [state({ T: Th, V: VA }, n), state({ T: Th, V: VA * ratio }, n), state({ T: Tc, V: VA * ratio * k }, n), state({ T: Tc, V: VA * k }, n)],
    kinds: ['isothermal', 'adiabatic', 'isothermal', 'adiabatic'],
  };
}

/** Otto: intake state 1 (P1, V1, T1), adiabatic compression by r, heat at constant volume to T3, adiabatic expansion, heat out at constant volume. */
export function otto({ T1, P1, V1, r, T3, g }) {
  const n = (P1 * V1) / (R * T1);
  const s1 = { P: P1, V: V1, T: T1 };
  const s2 = reach('adiabatic', s1, { V: V1 / r }, n, g);
  const s3 = state({ V: V1 / r, T: T3 }, n);
  const s4 = reach('adiabatic', s3, { V: V1 }, n, g);
  return { n, names: ['1', '2', '3', '4'], states: [s1, s2, s3, s4], kinds: ['adiabatic', 'isochoric', 'adiabatic', 'isochoric'] };
}

/** Brayton: compressor inlet 1 (P1, T1), adiabatic compression by pressure ratio rp, heat at constant pressure to T3, adiabatic expansion to P1, heat out at constant pressure. */
export function brayton({ T1, P1, rp, T3, n, g }) {
  const s1 = state({ P: P1, T: T1 }, n);
  const s2 = reach('adiabatic', s1, { P: P1 * rp }, n, g);
  const s3 = state({ P: P1 * rp, T: T3 }, n);
  const s4 = reach('adiabatic', s3, { P: P1 }, n, g);
  return { names: ['1', '2', '3', '4'], states: [s1, s2, s3, s4], kinds: ['adiabatic', 'isobaric', 'adiabatic', 'isobaric'] };
}

/** A rectangle: A (V1, P1) up to B (V1, P2), across to C (V2, P2), down to D (V2, P1), back to A. Clockwise when P2 > P1 and V2 > V1. */
export function rect({ V1, V2, P1, P2, n }) {
  return {
    names: ['A', 'B', 'C', 'D'],
    states: [state({ V: V1, P: P1 }, n), state({ V: V1, P: P2 }, n), state({ V: V2, P: P2 }, n), state({ V: V2, P: P1 }, n)],
    kinds: ['isochoric', 'isobaric', 'isochoric', 'isobaric'],
  };
}

/** The same cycle run backwards: A→D→C→B→A. */
export function reversed(c) {
  const m = c.states.length;
  const idx = [0, ...Array.from({ length: m - 1 }, (_, k) => m - 1 - k)];
  return { ...c, names: idx.map((i) => c.names[i]), states: idx.map((i) => c.states[i]), kinds: idx.map((_, k) => c.kinds[(m - 1 - k + m) % m]) };
}

/** The legs of a preset cycle. */
export function cycleLegs(c, n, g) {
  return c.states.map((A, k) => leg(c.kinds[k], A, c.states[(k + 1) % c.states.length], n, g));
}

// closed forms, for checks and for lessons
export const carnotEfficiency = (Tc, Th) => 1 - Tc / Th;
export const ottoEfficiency = (r, g) => 1 - r ** (1 - g);
export const braytonEfficiency = (rp, g) => 1 - rp ** (-(g - 1) / g);
/** Temperature after an adiabatic change of volume by V1/V2 = r (compression r > 1). */
export const adiabaticT = (T1, r, g) => T1 * r ** (g - 1);
/** Temperature after an adiabatic change of pressure by P2/P1 = rp. */
export const adiabaticTp = (T1, rp, g) => T1 * rp ** ((g - 1) / g);
