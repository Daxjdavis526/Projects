// The molecular box behind the therm-gas simulation — a gas of hard spheres
// bouncing around a box — and the kinetic-theory formulas the PHYS 2210
// thermal lessons quote. DOM-free; tested headlessly in test/therm-gas.test.mjs.
//
// Model units. The box is 1 unit tall and 1 unit deep and V units wide
// (0 < V ≤ 1: the full box stands for one litre). Time is animation seconds.
// A dot's mass is its molar mass in g/mol. Physical speeds map onto box
// speeds by one fixed factor, SPEED, so a molecule twice as fast in reality
// is twice as fast on screen — the motion is slowed enormously, but all in
// the same proportion. Each dot stands for DOT_MOL moles of real molecules,
// which turns the pressure measured from the dots' impacts on the walls into
// pascals for the litre box.
//
// What is real and what is not. The speeds, the temperature and the pressure
// are real numbers for the gas named; collisions conserve energy and
// momentum exactly (elastic hard spheres, the textbook kinetic-theory
// molecule). The dots are enlarged enormously so that they collide often
// enough to share energy within seconds: their own volume pushes the
// pressure about 2 % above nRT/V at full volume and 4 % at the smallest
// (the van der Waals b effect), inside the gauge's fluctuations. A dot's
// centre bounces where the wall is; the box is drawn one radius larger, so
// the walls' own thickness adds nothing.

import { makeRng } from '../../core/rng.js';

// ─── constants: exact SI values (2019), CODATA 2022 ────────────────────────
export const KB = 1.380649e-23;            // J/K
export const NA = 6.02214076e23;           // 1/mol
export const R = KB * NA;                  // J/(mol K), 8.314 462 618…
export const U = 1.66053906892e-27;        // kg, the atomic mass constant

/** Gases the sim offers: molar mass M (g/mol, IUPAC standard atomic weights) and the formula drawn. */
export const GASES = {
  H2: { label: 'hydrogen', formula: 'H₂', M: 2.01588 },
  He: { label: 'helium', formula: 'He', M: 4.002602 },
  N2: { label: 'nitrogen', formula: 'N₂', M: 28.0134 },
  O2: { label: 'oxygen', formula: 'O₂', M: 31.9988 },
  Ar: { label: 'argon', formula: 'Ar', M: 39.948 },
  CO2: { label: 'carbon dioxide', formula: 'CO₂', M: 44.0095 },
  Xe: { label: 'xenon', formula: 'Xe', M: 131.293 },
};
/** Two-gas mixtures, half and half by number. */
export const MIXES = { 'He+Xe': ['He', 'Xe'], 'He+Ar': ['He', 'Ar'], 'He+N2': ['He', 'N2'] };

/** The species (one or two gases) for a gas name such as 'N2' or 'He+Xe'. */
export function speciesOf(name) {
  const keys = MIXES[name] || [name];
  if (!keys.every((k) => GASES[k])) throw new Error(`unknown gas ${name}`);
  return keys.map((k) => ({ key: k, ...GASES[k] }));
}

// ─── kinetic theory, SI units (T in K, M in g/mol, speeds in m/s) ──────────
const kg = (M) => M / 1000;
/** Mass of one molecule, kg. */
export const molecularMass = (M) => kg(M) / NA;
/** Root-mean-square speed √(3RT/M). */
export const vrms = (T, M) => Math.sqrt((3 * R * T) / kg(M));
/** Mean speed √(8RT/πM). */
export const vmean = (T, M) => Math.sqrt((8 * R * T) / (Math.PI * kg(M)));
/** Most probable speed √(2RT/M), the peak of the Maxwell–Boltzmann curve. */
export const vmp = (T, M) => Math.sqrt((2 * R * T) / kg(M));
/** Speed of sound in an ideal gas, √(γRT/M). */
export const soundSpeed = (T, M, gamma) => Math.sqrt((gamma * R * T) / kg(M));
/** Mean translational kinetic energy of one molecule, (3/2) k_B T, in J. */
export const meanKE = (T) => 1.5 * KB * T;

/** The Maxwell–Boltzmann speed density f(v), in s/m (its integral over all v is 1). */
export function mbPdf(v, T, M) {
  const a = vmp(T, M);
  return ((4 / Math.sqrt(Math.PI)) * v * v * Math.exp(-(v * v) / (a * a))) / (a * a * a);
}

/** The fraction of molecules faster than v: erfc(x) + (2/√π) x e^(−x²), x = v/v_p. */
export function mbTail(v, T, M) {
  const x = v / vmp(T, M);
  return erfc(x) + (2 / Math.sqrt(Math.PI)) * x * Math.exp(-x * x);
}

/** Complementary error function (Numerical Recipes' erfcc; relative error < 1.2e-7). */
export function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

/** Ideal-gas pressure nRT/V, Pa (n in mol, V in m³). */
export const idealPressure = (n, T, V) => (n * R * T) / V;

// ─── the box ───────────────────────────────────────────────────────────────
/** Box speed (units/s) per physical m/s: nitrogen at 300 K has v_rms ≈ 1.08 box/s. */
export const SPEED = 1 / 480;
/** Each dot stands for this many moles: 200 dots at 300 K in the full litre make 99.8 kPa. */
export const DOT_MOL = 2e-4;
/** The full box, m³ (one litre). */
export const BOX_M3 = 1e-3;
/** Dot diameter, box units. */
export const DIAM = 0.034;
/** Pressure in Pa per model unit of pressure (see the header). */
export const P_SI = DOT_MOL / (SPEED * SPEED);
/** k_B T in model energy units (g/mol × (box/s)²). */
const kTm = (T) => 1000 * R * T * SPEED * SPEED;

/**
 * A new gas.
 *   N        number of dots
 *   T        temperature, K
 *   V        box width = volume as a fraction of the litre (0.2–1)
 *   gas      'N2', 'He', … or a mixture 'He+Xe'
 *   start    'mb' (equilibrium speeds) or 'equal' (every dot at one speed, the same total energy)
 *   seed     for reproducible runs
 *   bins     speed-histogram bins; vmax its top speed in m/s (default fitted to the gas at T,
 *            and refitted when T changes; a vmax given here stays put)
 *   tau      time constant of the running averages (pressure and histogram), animation seconds
 */
export function createGas({ N = 200, T = 300, V = 1, gas = 'N2', start = 'mb', seed = 1, bins = 32, vmax = null, tau = 2.5 } = {}) {
  const species = speciesOf(gas);
  const S = {
    N, T, V, gas, species, rng: makeRng(seed), d: DIAM, time: 0,
    x: new Float64Array(N), y: new Float64Array(N), z: new Float64Array(N),
    vx: new Float64Array(N), vy: new Float64Array(N), vz: new Float64Array(N),
    m: new Float64Array(N), sp: new Uint8Array(N),
    // running averages (exponential, time constant tau): wall impulse and time,
    // and the speed histogram per species
    tau, impAvg: 0, tAvg: 0, hitsRight: [], bins,
    vmax: vmax ?? histTop(species, T), vmaxFixed: vmax != null,
    hist: species.map(() => new Float64Array(bins)), histT: 0,
    // the last frame's impulses, for tests: total over all walls, and the right wall's
    impulse: 0, impulseRight: 0, hits: 0,
  };
  for (let i = 0; i < N; i++) { S.sp[i] = species.length > 1 ? i % 2 : 0; S.m[i] = species[S.sp[i]].M; }
  place(S);
  setSpeeds(S, start);
  return S;
}

/** The histogram's top speed: comfortably past the fastest species' tail at T. */
export function histTop(species, T) {
  const fast = Math.max(...species.map((s) => vmp(T, s.M)));
  return 2.9 * fast;
}

/** Dots on a jittered lattice, never overlapping (centres stay inside the box). */
function place(S) {
  const { N, V, d } = S;
  // the coarsest grid with room for every dot, cells no narrower than 1.15 d
  let nx = 1, ny = 1, nz = 1;
  const room = (n, L) => L / n >= 1.15 * d;
  while (nx * ny * nz < N) {
    const sx = V / nx, sy = 1 / ny, sz = 1 / nz;
    if (sx >= sy && sx >= sz && room(nx + 1, V)) nx++;
    else if (sy >= sz && room(ny + 1, 1)) ny++;
    else if (room(nz + 1, 1)) nz++;
    else if (room(nx + 1, V)) nx++;
    else throw new Error('too many dots for the box');
  }
  const cells = S.rng.shuffle([...Array(nx * ny * nz).keys()]).slice(0, N);
  const sx = V / nx, sy = 1 / ny, sz = 1 / nz;
  cells.forEach((c, i) => {
    const ix = c % nx, iy = Math.floor(c / nx) % ny, iz = Math.floor(c / (nx * ny));
    const j = (s) => (S.rng.next() - 0.5) * Math.max(0, s - 1.1 * d);
    S.x[i] = (ix + 0.5) * sx + j(sx);
    S.y[i] = (iy + 0.5) * sy + j(sy);
    S.z[i] = (iz + 0.5) * sz + j(sz);
  });
}

function gauss(rng) {
  // Box–Muller
  let u = 0;
  while (u < 1e-12) u = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng.next());
}

/**
 * New velocities with total kinetic energy exactly (3/2) N k_B T.
 *   'mb'     each component Gaussian with variance k_B T/m (the Maxwell–Boltzmann state),
 *            the drift of the whole gas removed
 *   'equal'  every dot at the same speed, in a random direction
 */
export function setSpeeds(S, start = 'mb') {
  const { N, rng } = S, kT = kTm(S.T);
  if (start === 'equal') {
    let M = 0;
    for (let i = 0; i < N; i++) M += S.m[i];
    const v = Math.sqrt((3 * N * kT) / M);
    for (let i = 0; i < N; i++) {
      const c = 2 * rng.next() - 1, s = Math.sqrt(1 - c * c), ph = 2 * Math.PI * rng.next();
      S.vx[i] = v * s * Math.cos(ph); S.vy[i] = v * s * Math.sin(ph); S.vz[i] = v * c;
    }
  } else {
    let px = 0, py = 0, pz = 0, M = 0;
    for (let i = 0; i < N; i++) {
      const sd = Math.sqrt(kT / S.m[i]);
      S.vx[i] = sd * gauss(rng); S.vy[i] = sd * gauss(rng); S.vz[i] = sd * gauss(rng);
      px += S.m[i] * S.vx[i]; py += S.m[i] * S.vy[i]; pz += S.m[i] * S.vz[i]; M += S.m[i];
    }
    for (let i = 0; i < N; i++) { S.vx[i] -= px / M; S.vy[i] -= py / M; S.vz[i] -= pz / M; }
    scaleTo(S, S.T);
  }
  resetAverages(S);
}

/** Rescale every velocity so the total kinetic energy is (3/2) N k_B T — an ideal thermostat. */
export function scaleTo(S, T) {
  const k = Math.sqrt((1.5 * S.N * kTm(T)) / kinetic(S));
  for (let i = 0; i < S.N; i++) { S.vx[i] *= k; S.vy[i] *= k; S.vz[i] *= k; }
  S.T = T;
}

/** Change the temperature: every speed scales by √(T_new/T_old), so the distribution keeps its shape. */
export function setTemperature(S, T) {
  scaleTo(S, T);
  if (!S.vmaxFixed) S.vmax = histTop(S.species, T);
  resetAverages(S);
}

/**
 * Change the volume by moving the right wall. Dots are squeezed (or spread)
 * in proportion, their velocities untouched: the gas's energy does not
 * change, so neither does its temperature — as if the move were slow and the
 * gas kept in touch with a bath at T.
 */
export function setVolume(S, V) {
  const k = V / S.V;
  for (let i = 0; i < S.N; i++) S.x[i] *= k;
  S.V = V;
  resetAverages(S, true);
}

function resetAverages(S, keepHist = false) {
  S.impAvg = 0; S.tAvg = 0; S.hitsRight = [];
  if (!keepHist) { for (const h of S.hist) h.fill(0); S.histT = 0; }
}

/** Total kinetic energy, model units. */
export function kinetic(S) {
  let K = 0;
  for (let i = 0; i < S.N; i++) K += 0.5 * S.m[i] * (S.vx[i] ** 2 + S.vy[i] ** 2 + S.vz[i] ** 2);
  return K;
}

/** Total momentum, model units. */
export function momentum(S) {
  let px = 0, py = 0, pz = 0;
  for (let i = 0; i < S.N; i++) { px += S.m[i] * S.vx[i]; py += S.m[i] * S.vy[i]; pz += S.m[i] * S.vz[i]; }
  return [px, py, pz];
}

/** The fastest dot's speed, box units per second. */
function fastest(S) {
  let v2 = 0;
  for (let i = 0; i < S.N; i++) v2 = Math.max(v2, S.vx[i] ** 2 + S.vy[i] ** 2 + S.vz[i] ** 2);
  return Math.sqrt(v2);
}

// a uniform grid for finding pairs that touch: cells at least one diameter wide
function grid(S) {
  const n = Math.max(1, Math.floor(1 / Math.max(S.d, 0.1))), nx = Math.max(1, Math.floor(S.V / Math.max(S.d, 0.1)));
  const G = S._grid && S._grid.n === n && S._grid.nx === nx && S._grid.head.length === nx * n * n ? S._grid
    : (S._grid = { n, nx, head: new Int32Array(nx * n * n), next: new Int32Array(S.N), cell: new Int32Array(S.N) });
  if (G.next.length !== S.N) { G.next = new Int32Array(S.N); G.cell = new Int32Array(S.N); }
  G.head.fill(-1);
  for (let i = 0; i < S.N; i++) {
    const cx = Math.min(nx - 1, Math.max(0, Math.floor((S.x[i] / S.V) * nx)));
    const cy = Math.min(n - 1, Math.max(0, Math.floor(S.y[i] * n)));
    const cz = Math.min(n - 1, Math.max(0, Math.floor(S.z[i] * n)));
    const c = cx + nx * (cy + n * cz);
    G.cell[i] = c; G.next[i] = G.head[c]; G.head[c] = i;
  }
  return G;
}

/** One small step h: move, bounce off the walls (recording impulses), then collide touching pairs. */
function substep(S, h, rec) {
  const { N, d, V } = S;
  for (let i = 0; i < N; i++) {
    S.x[i] += S.vx[i] * h; S.y[i] += S.vy[i] * h; S.z[i] += S.vz[i] * h;
    // walls (where the centres turn): x = 0 and x = V (the movable wall, drawn on the right), y and z = 0 and 1
    if (S.x[i] < 0 && S.vx[i] < 0) { S.x[i] = -S.x[i]; S.vx[i] = -S.vx[i]; rec.imp += 2 * S.m[i] * S.vx[i]; rec.hits++; }
    else if (S.x[i] > V && S.vx[i] > 0) {
      S.x[i] = 2 * V - S.x[i]; rec.imp += 2 * S.m[i] * S.vx[i]; rec.right += 2 * S.m[i] * S.vx[i]; rec.hits++;
      S.vx[i] = -S.vx[i];
      if (S.hitsRight.length < 400) S.hitsRight.push({ y: S.y[i], z: S.z[i], age: 0, sp: S.sp[i] });
    }
    if (S.y[i] < 0 && S.vy[i] < 0) { S.y[i] = -S.y[i]; S.vy[i] = -S.vy[i]; rec.imp += 2 * S.m[i] * S.vy[i]; rec.hits++; }
    else if (S.y[i] > 1 && S.vy[i] > 0) { S.y[i] = 2 - S.y[i]; rec.imp += 2 * S.m[i] * S.vy[i]; S.vy[i] = -S.vy[i]; rec.hits++; }
    if (S.z[i] < 0 && S.vz[i] < 0) { S.z[i] = -S.z[i]; S.vz[i] = -S.vz[i]; rec.imp += 2 * S.m[i] * S.vz[i]; rec.hits++; }
    else if (S.z[i] > 1 && S.vz[i] > 0) { S.z[i] = 2 - S.z[i]; rec.imp += 2 * S.m[i] * S.vz[i]; S.vz[i] = -S.vz[i]; rec.hits++; }
  }
  const G = grid(S), { n, nx } = G, d2 = d * d;
  for (let i = 0; i < N; i++) {
    const c = G.cell[i], cx = c % nx, cy = Math.floor(c / nx) % n, cz = Math.floor(c / (nx * n));
    for (let dz = -1; dz <= 1; dz++) {
      const zz = cz + dz; if (zz < 0 || zz >= n) continue;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = cy + dy; if (yy < 0 || yy >= n) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = cx + dx; if (xx < 0 || xx >= nx) continue;
          for (let j = G.head[xx + nx * (yy + n * zz)]; j >= 0; j = G.next[j]) {
            if (j <= i) continue;
            const ex = S.x[j] - S.x[i], ey = S.y[j] - S.y[i], ez = S.z[j] - S.z[i];
            const q = ex * ex + ey * ey + ez * ez;
            if (q >= d2 || q === 0) continue;
            const dist = Math.sqrt(q), nxu = ex / dist, nyu = ey / dist, nzu = ez / dist;
            const vn = (S.vx[j] - S.vx[i]) * nxu + (S.vy[j] - S.vy[i]) * nyu + (S.vz[j] - S.vz[i]) * nzu;
            if (vn >= 0) continue;                      // already separating
            // elastic collision of hard spheres: exchange impulse along the line of centres
            const mi = S.m[i], mj = S.m[j], J = (2 * mi * mj * vn) / (mi + mj);
            S.vx[i] += (J / mi) * nxu; S.vy[i] += (J / mi) * nyu; S.vz[i] += (J / mi) * nzu;
            S.vx[j] -= (J / mj) * nxu; S.vy[j] -= (J / mj) * nyu; S.vz[j] -= (J / mj) * nzu;
            rec.collisions++;
          }
        }
      }
    }
  }
}

/**
 * Advance the gas by dt animation seconds, in steps small enough that no
 * pair can pass through each other unseen. Updates the running averages and
 * returns { impulse, right, hits, collisions, steps } for this stretch.
 */
export function advance(S, dt, { maxSteps = 400 } = {}) {
  const v = Math.max(fastest(S), 1e-9);
  const steps = Math.min(maxSteps, Math.max(1, Math.ceil((v * dt) / (0.22 * S.d))));
  const h = dt / steps;
  const rec = { imp: 0, right: 0, hits: 0, collisions: 0 };
  for (let k = 0; k < steps; k++) substep(S, h, rec);
  S.time += dt;
  // running averages: impulse per time on all the walls, and the speed histogram
  const w = Math.exp(-dt / S.tau);
  S.impAvg = S.impAvg * w + rec.imp;
  S.tAvg = S.tAvg * w + dt;
  const counts = speedCounts(S);
  S.hist.forEach((hh, s) => { for (let b = 0; b < hh.length; b++) hh[b] = hh[b] * w + counts[s][b] * dt; });
  S.histT = S.histT * w + dt;
  for (const hit of S.hitsRight) hit.age += dt;
  S.hitsRight = S.hitsRight.filter((hit) => hit.age < 0.35);
  S.impulse = rec.imp; S.impulseRight = rec.right; S.hits = rec.hits;
  return { impulse: rec.imp, right: rec.right, hits: rec.hits, collisions: rec.collisions, steps };
}

/** Physical speed of dot i, m/s. */
export const speedOf = (S, i) => Math.sqrt(S.vx[i] ** 2 + S.vy[i] ** 2 + S.vz[i] ** 2) / SPEED;

/** Dots per histogram bin, per species, at this instant. */
export function speedCounts(S) {
  const out = S.species.map(() => new Float64Array(S.bins));
  const bw = S.vmax / S.bins;
  for (let i = 0; i < S.N; i++) {
    const b = Math.floor(speedOf(S, i) / bw);
    if (b < S.bins) out[S.sp[i]][b]++;
  }
  return out;
}

/** The running speed histogram of species s as a density (per m/s), comparable with mbPdf. */
export function histDensity(S, s = 0) {
  let n = 0;
  for (let i = 0; i < S.N; i++) if (S.sp[i] === s) n++;
  const bw = S.vmax / S.bins;
  const scale = S.histT > 0 ? 1 / (S.histT * n * bw) : 0;
  return Array.from(S.hist[s], (c) => c * scale);
}

/** Wall area, box units²: two 1 × 1 faces and four V × 1 faces. */
export const wallArea = (V) => 2 + 4 * V;

/** Moles of real gas the dots stand for. */
export const moles = (S) => S.N * DOT_MOL;

/** Volume, m³. */
export const volumeM3 = (S) => S.V * BOX_M3;

/** The pressure measured from the impacts on all six walls (running average), Pa; null until there is data. */
export function measuredPressure(S) {
  if (S.tAvg < 0.3) return null;
  return (S.impAvg / (S.tAvg * wallArea(S.V))) * P_SI;
}

/** Temperature from the dots' mean kinetic energy, K: T = (2/3)⟨½mv²⟩/k_B. */
export function kineticTemperature(S, s = null) {
  let K = 0, n = 0;
  for (let i = 0; i < S.N; i++) {
    if (s !== null && S.sp[i] !== s) continue;
    K += 0.5 * S.m[i] * (S.vx[i] ** 2 + S.vy[i] ** 2 + S.vz[i] ** 2); n++;
  }
  return n ? (2 / 3) * (K / n) / (1000 * R * SPEED * SPEED) : 0;
}

/** Mean translational kinetic energy per real molecule of species s (or all), J. */
export const meanKineticEnergy = (S, s = null) => 1.5 * KB * kineticTemperature(S, s);

/** Root-mean-square speed of the dots of species s, m/s. */
export function measuredVrms(S, s = 0) {
  let v2 = 0, n = 0;
  for (let i = 0; i < S.N; i++) if (S.sp[i] === s) { v2 += S.vx[i] ** 2 + S.vy[i] ** 2 + S.vz[i] ** 2; n++; }
  return n ? Math.sqrt(v2 / n) / SPEED : 0;
}

/** Mean of ½ m v_x², ½ m v_y², ½ m v_z² per real molecule, J — equipartition says each is ½ k_B T. */
export function componentKE(S) {
  const out = [0, 0, 0];
  for (let i = 0; i < S.N; i++) { out[0] += 0.5 * S.m[i] * S.vx[i] ** 2; out[1] += 0.5 * S.m[i] * S.vy[i] ** 2; out[2] += 0.5 * S.m[i] * S.vz[i] ** 2; }
  const toJ = KB / (1000 * R * SPEED * SPEED);
  return out.map((k) => (k / S.N) * toJ);
}

/** The hard-sphere packing fraction η = N (π/6) d³ / V and the Carnahan–Starling Z = PV/(Nk_BT). */
export function hardSphereZ(S) {
  const eta = (S.N * (Math.PI / 6) * S.d ** 3) / S.V;
  return { eta, Z: (1 + eta + eta * eta - eta ** 3) / (1 - eta) ** 3 };
}
