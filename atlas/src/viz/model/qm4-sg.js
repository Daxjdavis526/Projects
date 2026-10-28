// A chain of ideal Stern–Gerlach analysers acting on spin-½ atoms, DOM-free:
// the model behind sims/qm4-sg.js (PHYS 4700, M1), in the spirit of the
// classic SPINS program. Tested in test/qm4-sg.test.mjs.
//
// An analyser points along n̂(θ, φ) (polar angle θ from +z, azimuth φ from +x,
// both in degrees). It sends an atom out of its + port in the state
// |+n⟩ = cos(θ/2)|+⟩ + e^{iφ} sin(θ/2)|−⟩, or out of its − port in
// |−n⟩ = sin(θ/2)|+⟩ − e^{iφ} cos(θ/2)|−⟩, with the Born-rule probabilities
// |⟨±n|ψ⟩|². Each analyser but the last passes one port on to the next
// ('+' or '−') and stops the other at a block that counts what it absorbs, or
// passes 'both' beams, recombined coherently and unobserved, so the state
// goes on unchanged (an ideal analyser loop, as in McIntyre ch. 2). The last
// analyser's two ports end in counters.
//
// The exact fractions are computed with density matrices (an oven's beam is
// unpolarized, ρ = I/2, which no single ket can describe); the counts come
// from firing atoms one at a time, each as a pure state, with a seeded RNG.
// Complex numbers are [re, im] pairs.

const D = Math.PI / 180;
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const conj = (a) => [a[0], -a[1]];
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const abs2 = (a) => a[0] * a[0] + a[1] * a[1];

/** The analyser axes the sim names; 'n' takes its own θ and φ. */
export const AXES = { z: [0, 0], x: [90, 0], y: [90, 90] };
export const SOURCES = ['oven', 'z+', 'z-', 'x+', 'x-', 'y+', 'y-', 'state'];

/** θ and φ (degrees) of an analyser {axis, theta, phi}. */
export function angles(a) {
  if (a.axis && a.axis !== 'n') return AXES[a.axis];
  return [a.theta ?? 0, a.phi ?? 0];
}

/** The eigenkets |+n⟩ and |−n⟩ of n̂·σ, as complex 2-vectors in the z basis. */
export function kets(theta, phi) {
  const c = Math.cos((theta * D) / 2), s = Math.sin((theta * D) / 2), e = [Math.cos(phi * D), Math.sin(phi * D)];
  return { plus: [[c, 0], [s * e[0], s * e[1]]], minus: [[s, 0], [-c * e[0], -c * e[1]]] };
}

/** ⟨u|v⟩ for complex 2-vectors. */
export const braket = (u, v) => cadd(cmul(conj(u[0]), v[0]), cmul(conj(u[1]), v[1]));

/** The 2×2 matrix n̂·σ for an analyser along (θ, φ). */
export function sigmaN(theta, phi) {
  const nx = Math.sin(theta * D) * Math.cos(phi * D), ny = Math.sin(theta * D) * Math.sin(phi * D), nz = Math.cos(theta * D);
  return [[[nz, 0], [nx, -ny]], [[nx, ny], [-nz, 0]]];
}

/** The source as a density matrix (trace 1). */
export function sourceRho(src, st = 0, sp = 0) {
  if (src === 'oven') return [[[0.5, 0], [0, 0]], [[0, 0], [0.5, 0]]];
  let k;
  if (src === 'state') k = kets(st, sp).plus;
  else { const [th, ph] = AXES[src[0]]; const K = kets(th, ph); k = src[1] === '+' ? K.plus : K.minus; }
  return outer(k, k);
}

/** |u⟩⟨v| */
const outer = (u, v) => u.map((ui) => v.map((vj) => cmul(ui, conj(vj))));
const mm = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => cadd(s, cmul(a, B[k][j])), [0, 0])));
const trace = (A) => A[0][0][0] + A[1][1][0];

/**
 * Exact fractions of the atoms leaving the source.
 * Returns { blocked: [p at analyser 1, … (null where nothing is blocked)],
 *           plus, minus (the last analyser's counters),
 *           beams: [{ i, sign, p, fate }] for every port: fate 'next', 'blocked' or 'counter',
 *           into: [fraction entering analyser 1, 2, …] }.
 */
export function exact(src, analysers, st = 0, sp = 0) {
  let rho = sourceRho(src, st, sp);
  const blocked = [], beams = [], into = [];
  analysers.forEach((a, i) => {
    into.push(trace(rho));
    const [th, ph] = angles(a), K = kets(th, ph);
    const Pp = outer(K.plus, K.plus), Pm = outer(K.minus, K.minus);
    const pp = trace(mm(Pp, rho)), pm = trace(mm(Pm, rho));
    const last = i === analysers.length - 1;
    if (last) {
      beams.push({ i, sign: '+', p: pp, fate: 'counter' }, { i, sign: '-', p: pm, fate: 'counter' });
      blocked.push(null);
      return;
    }
    if (a.pass === 'both') {
      beams.push({ i, sign: '+', p: pp, fate: 'next' }, { i, sign: '-', p: pm, fate: 'next' });
      blocked.push(null);
      return;                                   // recombined unobserved: ρ goes on unchanged
    }
    const keep = a.pass === '-' ? Pm : Pp;
    beams.push({ i, sign: '+', p: pp, fate: a.pass === '-' ? 'blocked' : 'next' }, { i, sign: '-', p: pm, fate: a.pass === '-' ? 'next' : 'blocked' });
    blocked.push(a.pass === '-' ? pp : pm);
    rho = mm(mm(keep, rho), keep);
  });
  const lastBeams = beams.filter((b) => b.fate === 'counter');
  return { blocked, plus: lastBeams[0].p, minus: lastBeams[1].p, beams, into };
}

/** A small seeded generator (mulberry32): uniform numbers in [0, 1). */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One atom through the chain. Returns { end: i (the analyser where it stopped
 * or was counted), sign: '+' | '-', counted: bool, path: [signs taken] }.
 */
export function fireOne(src, analysers, rand, st = 0, sp = 0) {
  let psi;
  if (src === 'oven') psi = rand() < 0.5 ? [[1, 0], [0, 0]] : [[0, 0], [1, 0]];   // I/2 as an equal mixture of |±z⟩
  else if (src === 'state') psi = kets(st, sp).plus;
  else { const [th, ph] = AXES[src[0]]; const K = kets(th, ph); psi = src[1] === '+' ? K.plus : K.minus; }
  const path = [];
  for (let i = 0; i < analysers.length; i++) {
    const a = analysers[i], [th, ph] = angles(a), K = kets(th, ph);
    const last = i === analysers.length - 1;
    if (!last && a.pass === 'both') { path.push('both'); continue; }
    const pp = abs2(braket(K.plus, psi));
    const sign = rand() < pp ? '+' : '-';
    path.push(sign);
    if (last) return { end: i, sign, counted: true, path };
    if (sign !== a.pass) return { end: i, sign, counted: false, path };
    psi = sign === '+' ? K.plus : K.minus;
  }
  return { end: analysers.length - 1, sign: '+', counted: true, path };   // not reached
}

/** Fire n atoms; counts = { blocked: [per analyser], plus, minus, sent }. */
export function fire(src, analysers, n, rand, counts = null, st = 0, sp = 0) {
  const c = counts || { blocked: analysers.map(() => 0), plus: 0, minus: 0, sent: 0 };
  for (let k = 0; k < n; k++) {
    const r = fireOne(src, analysers, rand, st, sp);
    c.sent++;
    if (!r.counted) c.blocked[r.end]++;
    else if (r.sign === '+') c.plus++;
    else c.minus++;
  }
  return c;
}

/** Short names for an analyser's axis (plain text, for the canvas). */
export function axisName(a) {
  if (a.axis && a.axis !== 'n') return a.axis.toUpperCase();
  const [th, ph] = angles(a);
  return ph ? `n̂ ${Math.round(th)}°, ${Math.round(ph)}°` : `n̂ ${Math.round(th)}°`;
}
