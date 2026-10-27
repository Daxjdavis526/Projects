// Constraints and evolution: why simulating gravity is hard — Intuition Mode.
// Sliced into moments, Einstein's ten equations split into 4 constraints (no
// second time derivatives: what every slice must satisfy) and 6 evolution
// equations, with the lapse and shift (4 functions) left free. Per point:
// 12 numbers (space's metric and its rate) − 4 constraints − 4 coordinate
// choices = 4 = two polarizations × (value, rate). Exact evolution keeps the
// constraints (the Einstein tensor's automatic balance, as charge conservation
// keeps Gauss's law); a computer's does not, and adding λ × the constraint to
// the evolution equations decides whether violations grow or die away. Shown on
// a toy — a flat dust universe, whose Friedmann equation is the energy
// constraint — integrated by RK4 below. At a moment of time symmetry the energy
// constraint is ⁽³⁾R = 16πGρ/c²: Feynman's excess radius GM/(3c²), 1.48 mm for a
// uniform Earth (2.0 mm for a two-layer one). In weak fields it is Poisson's
// equation: Newton's gravity is all constraint and no evolution, hence
// instantaneous. Cost: refining a 3D grid f-fold costs f⁴ (Courant condition).
// Transfer: incompressible CFD, where ∇·u = 0 is the constraint.
import { lesson, mcq, num } from '../../src/core/content.js';
import { G, C, GM_SUN, GM_EARTH, GM_MOON, M_EARTH, R_EARTH, AU, sci, round, stressTable } from './_curvature.js';

const t = String.raw;
const R3 = '{}^{(3)}\\!R';                                      // the curvature of space on one slice

// ── the energy constraint at a moment of time symmetry: ⁽³⁾R = 16πGρ/c² ──
const curv = (rho) => (16 * Math.PI * G * rho) / (C * C);       // m⁻²
const sphereRadius = (r3) => Math.sqrt(6 / r3);                  // a three-sphere of radius a has ⁽³⁾R = 6/a²
const RHO_EARTH = 5514;                                          // kg/m³: the Earth as a uniform ball
const R3_EARTH = curv(RHO_EARTH), A_EARTH = sphereRadius(R3_EARTH);
const EXCESS_EARTH = R_EARTH ** 3 / (6 * A_EARTH ** 2);          // = GM/(3c²) for a uniform ball
const H_EARTH = (2 * GM_EARTH) / (R_EARTH * C * C);              // step 28's ripple at the surface
// the excess radius ∫(1/√(1 − 2Gm(r)/(rc²)) − 1) dr of a two-layer Earth (core: 3,480 km, 1.94 × 10²⁴ kg)
const EXCESS_2LAYER = (() => {
  const Rc = 3.48e6, Mc = 1.94e24;
  const rhoC = Mc / ((4 / 3) * Math.PI * Rc ** 3), rhoM = (M_EARTH - Mc) / ((4 / 3) * Math.PI * (R_EARTH ** 3 - Rc ** 3));
  const m = (r) => (r < Rc ? (4 / 3) * Math.PI * rhoC * r ** 3 : Mc + (4 / 3) * Math.PI * rhoM * (r ** 3 - Rc ** 3));
  const N = 20000;
  let s = 0;
  for (let i = 0; i < N; i++) {
    const r = ((i + 0.5) / N) * R_EARTH;
    s += (1 / Math.sqrt(1 - (2 * G * m(r)) / (r * C * C)) - 1) * (R_EARTH / N);
  }
  return s;
})();
const mm = (x) => round(x * 1e3, 3);

// ── the toy: a flat universe of dust (step 31), stepped forward by RK4 ──
// Units: the starting Hubble rate is 1 and q = 8πGρ/3 starts at 1, so the energy
// constraint (the Friedmann equation) is H² − q = 0. The code steps
//   dH/dt = −H² − q/2 + λ(H² − q),   dq/dt = −3Hq
// — the acceleration and continuity equations plus λ × the constraint, which is
// zero for every true solution: λ changes only how the computer's errors behave.
const T_END = 20, EVERY = 0.4;
function drift(lam, dt) {
  const f = (H, q) => [-H * H - q / 2 + lam * (H * H - q), -3 * H * q];
  let H = 1, q = 1;
  const pts = [], n = Math.round(T_END / dt), every = Math.round(EVERY / dt);
  for (let i = 1; i <= n; i++) {
    const k1 = f(H, q), k2 = f(H + (dt / 2) * k1[0], q + (dt / 2) * k1[1]);
    const k3 = f(H + (dt / 2) * k2[0], q + (dt / 2) * k2[1]), k4 = f(H + dt * k3[0], q + dt * k3[1]);
    H += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    q += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (!Number.isFinite(H) || !Number.isFinite(q) || Math.abs(H) > 1e3) return { pts, crash: i * dt };
    if (i % every === 0) pts.push([round(i * dt, 6), Math.abs(1 - q / (H * H))]);   // |violation| = |fake Ω_k|
  }
  return { pts, crash: null };
}
const LAMS = [0, 2, -2];
const STEPS = [[0.2, 'warn'], [0.1, 'gold'], [0.05, 'accent']];
const RUNS = LAMS.flatMap((lam) => STEPS.map(([dt, color]) => ({ lam, dt, color, ...drift(lam, dt) })));
const runOf = (lam, dt) => RUNS.find((u) => u.lam === lam && u.dt === dt);
const first = (u) => u.pts[0][1], last = (u) => u.pts[u.pts.length - 1][1];
const CRASH_T = Math.round(runOf(2, 0.2).crash);
// plain equations: each halving of the step cuts the final violation by at least this (rounded down to tens)
const CONVERGE = Math.floor(Math.min(last(runOf(0, 0.2)) / last(runOf(0, 0.1)), last(runOf(0, 0.1)) / last(runOf(0, 0.05))) / 10) * 10;
// λ = +2: growth of the two smaller steps' violation over the run (at least)
const GROWTH = Math.min(last(runOf(2, 0.1)) / first(runOf(2, 0.1)), last(runOf(2, 0.05)) / first(runOf(2, 0.05)));
const isF = (lam) => `1 - abs(sgn(f - (${lam})))`;

function driftGraph({ f = null, caption } = {}) {
  const points = [];
  for (const u of RUNS) {
    if (f !== null && u.lam !== f) continue;
    u.pts.forEach(([x, v], k) => {
      const end = k === u.pts.length - 1;
      points.push({
        x, y: round(Math.log10(v), 4), color: u.color, r: 2.3,
        ...(f === null ? { when: isF(u.lam) } : {}),
        ...(end ? { label: u.crash ? `Δt = ${u.dt}: crashes` : `Δt = ${u.dt}`, ...(u.crash ? { labelDy: -16 } : {}) } : {}),
      });
    });
  }
  return {
    type: 'graph',
    params: {
      x: [0, 24.5], y: [-8, 1], xlabel: 'time (starting Hubble times)', ylabel: 'log₁₀ of the constraint violation', grid: false,
      hlines: [{ y: 0, color: 'bad', label: '100%' }, { y: -2, color: 'ink3', label: '1%' }],
      points,
      ...(f === null ? {
        choices: [{ key: 'f', label: 'Add λ × the constraint', options: [[0, 'λ = 0: plain'], [2, 'λ = +2'], [-2, 'λ = −2: damping']], value: 0, explain: 'The added term is zero for every true solution.' }],
        readouts: STEPS.map(([dt]) => ({
          label: `violation at the end, Δt = ${dt}`,
          expr: LAMS.map((lam) => `(${isF(lam)})*${round(last(runOf(lam, dt)) * 100, 3)}`).join(' + '),
          digits: 3, unit: '\\%',
        })),
      } : { constants: { f } }),
    },
    caption: caption ?? 'Three time steps (in starting Hubble times), on a scale of powers of ten. The violation |1 − 8πGρ/(3H²)| is exactly the fake curvature Ω_k the errors have slipped in (step 31): the computed universe drifts away from flat. Every choice of λ has the same exact solution.',
  };
}

// ── pictures ──
// Space around a static star at one instant, as an embedding diagram in profile. Exaggerated: radius
// R = 4GM/c², twice its horizon radius; lengths in GM/c². Inside, a piece of a three-sphere of radius
// a = √(R³/2); outside, Flamm's paraboloid z = √(8(r − 2)) + z₀, joined smoothly at the surface.
const EMB_R = 4, EMB_A = Math.sqrt(EMB_R ** 3 / 2);
const EMB_ZR = EMB_A - Math.sqrt(EMB_A ** 2 - EMB_R ** 2), EMB_Z0 = EMB_ZR - Math.sqrt(8 * (EMB_R - 2));
const EMB_S = EMB_A * Math.asin(EMB_R / EMB_A);                  // the radius measured inside
const embedPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-8.2, 8.2], y: [-1.9, 5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { fn: `${round(EMB_A, 7)} - sqrt(${round(EMB_A ** 2, 7)} - x^2)`, domain: [-EMB_R, EMB_R], color: 'gold', width: 3.2 },
      { fn: `sqrt(8*(x - 2)) + ${round(EMB_Z0, 7)}`, domain: [EMB_R, 8], color: 'accent', width: 2.4 },
      { fn: `sqrt(8*(-x - 2)) + ${round(EMB_Z0, 7)}`, domain: [-8, -EMB_R], color: 'accent', width: 2.4 },
      { fn: '-1.1', domain: [0, EMB_R], color: 'ink3', width: 1.6, dash: true, label: `circumference ÷ 2π: ${EMB_R}`, labelAt: 0, labelDy: 14 },
    ],
    points: [
      { x: 0, y: 0, color: 'gold', r: 4 },
      { x: EMB_R, y: round(EMB_ZR, 4), color: 'gold', r: 4, label: 'surface', labelDx: 10, labelDy: 12 },
      { x: -3.7, y: 3.6, r: 0.01, color: 'gold', label: `gold: the radius measured inside, ${round(EMB_S, 3)}` },
      { x: -3.7, y: 2.85, r: 0.01, color: 'accent', label: 'blue: space outside the star' },
    ],
  },
  caption: caption ?? 'Space around a star at one instant, drawn as a surface (an embedding diagram, in profile). The up–down direction is not real: it only lets the curvature show, and nothing rolls in it. Distances along the curve are true distances, so the radius measured inside beats circumference ÷ 2π. Hugely exaggerated: a star twice its horizon radius, lengths in GM/c².',
});

// two ways to measure a ball's radius
const rodPic = {
  type: 'graph',
  params: {
    x: [-2.4, 2.4], y: [-1.35, 1.35], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(1 - x^2)', lower: '-sqrt(1 - x^2)', from: -1, to: 1, color: 'teal', alpha: 0.12 }],
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4, dash: true, label: 'string round the equator', labelAt: 0.75, labelDx: 8, labelDy: -6 }],
    arrows: [{ from: [0, 0], to: [0.98, 0], color: 'gold' }],
    points: [{ x: 0, y: 0, color: 'gold', r: 4 }, { x: 0.22, y: 0, r: 0.01, color: 'gold', label: 'rod from the centre', labelDx: 0, labelDy: 13 }],
  },
  caption: 'Two ways to measure a ball’s radius: a rod from the centre to the surface, or a string round the equator divided by 2π. In flat space they agree. Inside matter space is curved, and the rod comes out longer.',
};

// Gauss's law: a condition on each moment
const gaussPic = {
  type: 'graph',
  params: {
    x: [-2.4, 2.4], y: [-1.9, 1.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ polar: '1.25 + 0.28sin(3theta) + 0.12cos(2theta)', theta: [0, 6.2832], color: 'gold', width: 2, dash: true, label: 'any closed surface', labelAt: -0.5, labelDx: 8, labelDy: 8 }],
    arrows: Array.from({ length: 12 }, (_, k) => {
      const a = (k * Math.PI) / 6 + 0.26;
      return { from: [round(0.3 * Math.cos(a), 4), round(0.3 * Math.sin(a), 4)], to: [round(1.8 * Math.cos(a), 4), round(1.8 * Math.sin(a), 4)], color: 'accent' };
    }),
    points: [{ x: 0, y: 0, color: 'bad', r: 6, label: 'charge', labelDx: -22, labelDy: 16 }],
  },
  caption: 'Gauss’s law: the electric field’s total outflow through any closed surface equals the charge inside ÷ ε₀, at every instant. No time derivative appears in it: it is a condition on each moment, not a rule for change.',
};

// what a simulation stores at each point: space's metric γ and its rate of change K (both symmetric 3 × 3)
const SUB = ['₁', '₂', '₃'];
const slotTables = (() => {
  const shade = [], points = [];
  [['γ', 0, 'accent'], ['K', 4.2, 'violet']].forEach(([name, x0, color]) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const on = j >= i, x = x0 + j, y = -i;
        shade.push({ fn: `${y - 0.04}`, lower: `${y - 0.96}`, from: x + 0.04, to: x + 0.96, color: on ? color : 'ink4', alpha: on ? 0.32 : 0.1 });
        points.push({ x: x + 0.5, y: y - 0.5, r: 0.01, color: on ? 'ink' : 'ink3', label: `${name}${SUB[i]}${SUB[j]}`, labelDx: -10, labelDy: 0 });
      }
    }
  });
  points.push({ x: 0, y: 0.42, r: 0.01, color: 'accent', label: 'distances in space: 6', labelDx: 0, labelDy: 0 });
  points.push({ x: 4.2, y: 0.42, r: 0.01, color: 'violet', label: 'rates of change: 6', labelDx: 0, labelDy: 0 });
  return {
    type: 'graph',
    params: { x: [-0.2, 7.4], y: [-3.2, 0.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade, points },
    caption: 'What a simulation stores at each point of a slice: the metric of space, γ (symmetric, so the faint cells repeat others: 6 numbers), and its rate of change, K (6 more).',
  };
})();

// Einstein's ten equations, sorted into constraints and evolution equations
const gTable = stressTable([['G⁰⁰', 'G⁰¹', 'G⁰²', 'G⁰³'], ['G¹⁰', 'G¹¹', 'G¹²', 'G¹³'], ['G²⁰', 'G²¹', 'G²²', 'G²³'], ['G³⁰', 'G³¹', 'G³²', 'G³³']], {
  colors: [['gold', 'teal', 'teal', 'teal'], ['teal', 'violet', 'violet', 'violet'], ['teal', 'violet', 'violet', 'violet'], ['teal', 'violet', 'violet', 'violet']],
  caption: 'Einstein’s ten equations as a symmetric table, rows and columns t, x, y, z. The time row holds no second time derivatives: the energy constraint (gold) and three momentum constraints (teal). The six in violet evolve the slice.',
});

// a collapse and the light cone of its news, on a stack of slices
const conePic = {
  type: 'graph',
  params: {
    x: [-4, 4], y: [0, 3.4], xlabel: 'distance from the star (light-hours)', ylabel: 'time (hours)', grid: false, yticks: 3,
    shade: [{ fn: '3.4', lower: 'abs(x)', from: -3.4, to: 3.4, color: 'warn', alpha: 0.14 }],
    curves: [
      { fn: '1', color: 'ink3', width: 1.2, dash: true },
      { fn: '2', color: 'ink3', width: 1.2, dash: true },
      { fn: '3', color: 'ink3', width: 1.2, dash: true, label: 'a slice', labelAt: -3.95, labelDy: -10 },
      { fn: 'abs(x)', domain: [-3.4, 3.4], color: 'gold', width: 2 },
    ],
    points: [
      { x: 0, y: 0.06, color: 'bad', r: 6, label: 'a star collapses' },
      { x: -0.95, y: 2.55, r: 0.01, color: 'warn', label: 'news has arrived' },
      { x: 1.75, y: 0.75, r: 0.01, color: 'ink2', label: 'no news yet' },
    ],
  },
  caption: 'Spacetime as a stack of slices (dashed). Changes from the collapse spread no faster than light (gold): only inside the shaded cone has anything changed. The constraints hold on every slice, inside and outside it.',
};

// one plane of a 3D grid, before and after refinement
const gridLines = (x0, step, color) => {
  const out = [];
  for (let v = 0; v <= 4 + 1e-9; v += step) {
    out.push({ param: [`${round(x0 + v, 6)}`, 't'], t: [0, 4], color, width: 1.2 });
    out.push({ param: ['t', `${round(v, 6)}`], t: [x0, x0 + 4], color, width: 1.2 });
  }
  return out;
};
const gridPic = {
  type: 'graph',
  params: {
    x: [-0.3, 9.3], y: [-0.4, 4.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [...gridLines(0, 1, 'accent'), ...gridLines(5, 0.5, 'teal')],
    points: [{ x: 0, y: 4.42, r: 0.01, color: 'accent', label: 'spacing Δx', labelDx: 0, labelDy: 0 }, { x: 5, y: 4.42, r: 0.01, color: 'teal', label: 'spacing Δx ÷ 2', labelDx: 0, labelDy: 0 }],
  },
  caption: 'One plane of a 3D grid, before and after refining it. The time step must shrink with the spacing: a signal at speed c may cross at most about one cell per step (the Courant condition).',
};

// two slicings of the same spacetime
const slicingsPic = {
  type: 'graph',
  params: {
    x: [-5, 5], y: [0, 4.6], xlabel: 'space', ylabel: 'time (schematic)', grid: false,
    curves: [
      ...[1, 2, 3, 4].map((n) => ({ fn: `${n}`, color: 'accent', width: 1.8 })),
      ...[1, 2, 3, 4].map((n) => ({ fn: `${n}*(1 - 0.65*exp(-x^2/1.5))`, color: 'violet', width: 1.8, dash: true })),
    ],
    points: [{ x: 0, y: 0.08, color: 'bad', r: 6, label: 'black hole' }],
  },
  caption: 'Two ways to slice the same spacetime into moments (schematic): evenly (blue), or holding back near a black hole (violet, dashed). Einstein’s equations allow both. The coordinates differ; the physics does not.',
};

// ideal incompressible flow past a cylinder of radius 1: streamlines (r − 1/r) sin θ = k
function streamline(k, xmax = 3.4) {
  const rr = (th) => (k + Math.sqrt(k * k + 4 * Math.sin(th) ** 2)) / (2 * Math.sin(th));
  let lo = 1e-4, hi = Math.PI / 2;                              // x = r cos θ falls from +∞ to 0 on (0, π/2]
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (rr(mid) * Math.cos(mid) > xmax) lo = mid; else hi = mid;
  }
  const r = `(${k} + sqrt(${round(k * k, 6)} + 4*sin(t)^2))/(2*sin(t))`, range = [round(hi, 7), round(Math.PI - hi, 7)];
  return [
    { param: [`(${r})*cos(t)`, `(${r})*sin(t)`], t: range, color: 'accent', width: 1.6 },
    { param: [`(${r})*cos(t)`, `-(${r})*sin(t)`], t: range, color: 'accent', width: 1.6 },
  ];
}
const flowPic = {
  type: 'graph',
  params: {
    x: [-3.6, 3.6], y: [-2.8, 2.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(1 - x^2)', lower: '-sqrt(1 - x^2)', from: -1, to: 1, color: 'ink3', alpha: 0.35 }],
    curves: [
      ...[0.25, 0.7, 1.3, 2].flatMap((k) => streamline(k)),
      { fn: '0', domain: [-3.4, -1], color: 'accent', width: 1.6 },
      { fn: '0', domain: [1, 3.4], color: 'accent', width: 1.6 },
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.4 },
    ],
    arrows: [{ from: [-3.3, -2.6], to: [-2.2, -2.6], color: 'teal', label: 'flow' }],
  },
  caption: 'Ideal incompressible flow past a cylinder (streamlines). Whatever a flow solver computes must keep ∇·u = 0 at every instant: no fluid appears or vanishes anywhere.',
};

export default lesson({
  id: 'gr.S29.i',
  title: 'Constraints and evolution: why simulating gravity is hard',
  minutes: 10, difficulty: 3, mode: 'intuition', badges: ['est-der'],
  intro: t`Einstein's equation $G_{\mu\nu} = (8\pi G/c^4)\,T_{\mu\nu}$ (step 18) is ten equations at every event. To *predict* with it — start from the universe as it is now and march forward, as a weather or flow code does — you cut spacetime into **slices**: space at one moment, then the next. Asked that way, the ten equations split in two:

- **4 constraints**, with no second derivatives in time. They cannot say how a slice changes, only what every slice must satisfy. The **energy constraint** fixes how curved space is by the energy density in it — the equation above, at an instant when nothing moves. Three **momentum constraints** tie how the slice is changing to the momentum density.
- **6 evolution equations**, which carry the slice's geometry — 6 numbers at each point — forward in time.

Electromagnetism splits the same way: Gauss's law, $\nabla\cdot\mathbf E = \rho_q/\varepsilon_0$, must hold on every slice, while Faraday's and Ampère's laws evolve the fields — and charge conservation keeps Gauss's law true. For gravity the guarantee is the Einstein tensor's automatic balance (step 17) — but only for *exact* solutions. A computer's small errors break the constraints, and written the wrong way the violations grow until the code crashes. Add four functions the equations leave free — the **lapse** and **shift**, which say how to slice and how to lay coordinates on each slice — singularities inside black holes, and a huge range of scales, and you have why two black holes were first simulated orbiting and merging only in 2005 (step 32).`,
  equation: t`{}^{(3)}\!R = \frac{16\pi G}{c^2}\,\rho`,
  symbols: [
    { tex: R3, text: 'the curvature of space itself, on one slice (its *scalar curvature*), in m⁻². Zero for flat space; $6/a^2$ for the three-dimensional “surface” of a four-dimensional ball of radius $a$. The (3) means: of space alone, not of spacetime' },
    { tex: '\\rho', text: 'the mass density there (energy density ÷ $c^2$), in kg/m³, measured by observers at rest on the slice' },
    { tex: 'G', text: 'Newton’s gravitational constant, $6.674\\times10^{-11}\\ \\text{m}^3\\,\\text{kg}^{-1}\\,\\text{s}^{-2}$' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: '16\\pi', text: 'twice the $8\\pi$ of Einstein’s equation: the energy constraint is twice its time–time part. This form holds at an instant when nothing moves (and always for a body at rest); otherwise a term for how fast the slice is changing joins the left side' },
  ],
  why: 'Every simulation of merging black holes or neutron stars — behind the waveforms LIGO, Virgo and KAGRA compare their data with — first solves the four constraints, then marches the six evolution equations forward, watching the constraint violation as a gauge of its own error.',
  visual: {
    ...driftGraph(),
    title: 'Constraint drift in a toy universe',
    lead: t`A real calculation on a toy: a flat universe of dust, the simplest solution of Einstein's equations, whose Friedmann equation $H^2 = 8\pi G\rho/3$ (step 31) is its energy constraint. The code steps the expansion rate $H$ and the density $\rho$ forward by RK4, as many real codes do, adding $\lambda$ times the constraint:

$$\dot H = -H^2 - \tfrac{4\pi G}{3}\rho + \lambda\left(H^2 - \tfrac{8\pi G}{3}\rho\right), \qquad \dot\rho = -3H\rho$$

The vertical axis counts powers of ten: $-2$ is a 1% violation, $-4$ is 0.01%.`,
    tasks: [
      t`With $\lambda = 0$, compare the three runs: each halving of the time step cuts the violation by ${CONVERGE} times or more. Errors break the constraint a little, and finer steps break it less — the code converges.`,
      t`Choose $\lambda = +2$. For every true solution the added term is exactly zero — yet now the violation of the two smaller steps grows more than ${Math.floor(GROWTH / 1000) * 1000}-fold, and with $\Delta t = 0.2$ the code crashes at $t \approx ${CRASH_T}$. Smaller steps only postpone the failure.`,
      t`Choose $\lambda = -2$: the violation dies away as the run goes on. Adding the constraints with the right sign — **constraint damping** — was one ingredient of the first stable black-hole simulations (step 32).`,
    ],
  },
  example: {
    prompt: t`At an instant when nothing moves, the energy constraint above says space inside matter is curved. Treat the Earth as a ball of uniform density $\rho = 5{,}514\ \text{kg/m}^3$ whose circumference $\div\,2\pi$ is $6{,}371$ km. How curved is the space inside it — and by how much does its radius, measured with a rod from the centre, exceed circumference $\div\,2\pi$?`,
    visual: embedPic(),
    steps: [
      { label: 'The curvature', text: t`$${R3} = \dfrac{16\pi G\rho}{c^2} = \dfrac{16\pi\times6.674\times10^{-11}\times5{,}514}{(2.998\times10^{8})^2} = ${sci(R3_EARTH)}\ \text{m}^{-2}$.` },
      { label: 'A sphere in disguise', text: t`Inside a uniform ball, space is exactly a piece of a **three-sphere**, whose curvature is $6/a^2$. So $a = \sqrt{6/${R3}} = ${sci(A_EARTH)}$ m — about ${round(A_EARTH / AU, 2)} AU, a little more than the radius of the Earth’s orbit.` },
      { label: 'The excess radius', text: t`On such a sphere a rod from the centre to a circle of circumference $2\pi r$ measures $a\arcsin(r/a) \approx r + r^3/(6a^2)$. With $r = 6.371\times10^{6}$ m the excess is $r^3/(6a^2) = ${mm(EXCESS_EARTH)}$ mm.` },
      { label: 'Feynman’s rule', text: t`Since $a^2 = 3c^2/(8\pi G\rho)$ and $M = \tfrac43\pi\rho r^3$, the excess is $GM/(3c^2) = 3.986\times10^{14}/(3\times8.988\times10^{16}) = ${mm(GM_EARTH / (3 * C * C))}$ mm for any uniform ball — the “excess radius” of Feynman’s lectures.` },
      { label: 'Sense check', text: t`As a fraction of the radius that is $${sci(EXCESS_EARTH / R_EARTH, 3)}$, one sixth of the ripple $h = 2GM/(rc^2) = ${sci(H_EARTH, 3)}$ of step 28 — weak gravity, as it should be. The real Earth, denser at its core, gives about ${round(EXCESS_2LAYER * 1e3, 2)} mm.` },
    ],
    answer: t`$${R3} = ${sci(R3_EARTH)}\ \text{m}^{-2}$, the curvature of a three-sphere of radius $${sci(A_EARTH)}$ m; the measured radius beats circumference $\div\,2\pi$ by $GM/(3c^2) = ${mm(EXCESS_EARTH)}$ mm (about ${round(EXCESS_2LAYER * 1e3, 2)} mm for the real, centrally dense Earth).`,
  },
  practice: [
    mcq({
      id: 'gauss', difficulty: 1,
      prompt: 'Which law of electromagnetism is a constraint — true at every instant, with no time derivative in it — rather than an evolution equation?',
      visual: gaussPic,
      choices: [
        t`Gauss’s law, $\nabla\cdot\mathbf E = \rho_q/\varepsilon_0$`,
        'Faraday’s law: a changing magnetic field drives the electric field',
        'The Ampère–Maxwell law: currents and a changing electric field drive the magnetic field',
        t`The Lorentz force law, $\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B)$`,
      ],
      answer: 0,
      why: {
        1: 'Faraday’s law contains the rate of change of B: it says how B changes — an evolution equation.',
        2: 'It contains the rate of change of E: it marches the electric field forward — an evolution equation.',
        3: 'That tells charges how to move in the fields; it is not a condition the fields on a slice must meet.',
      },
      hints: ['Which one has no rate of change, ∂/∂t, in it?'],
      teach: 'Gauss’s law has no time derivative, so it constrains every moment while Faraday’s and Ampère’s laws evolve the fields — the split Einstein’s equations share.',
      explain: t`Gauss's law ties $\mathbf E$ at one instant to the charge at that instant: a condition on each slice ($\nabla\cdot\mathbf B = 0$ is the other one). Faraday's and Ampère's laws give the rates of change of $\mathbf B$ and $\mathbf E$: they march the fields forward. Charge conservation guarantees that fields evolved this way go on obeying Gauss's law.`,
    }),
    num({
      id: 'count', difficulty: 3,
      prompt: 'At every point of a slice a simulation stores the 6 numbers of space’s metric and their 6 rates of change: 12 numbers. The 4 constraints tie some of them together, and 4 more only reflect how the slice and its coordinates were chosen. How many numbers per point are genuinely free?',
      visual: slotTables,
      answer: 4, tol: { rel: 1e-6 },
      errors: [
        { value: 8, feedback: 'Remove both: 4 fixed by the constraints and 4 that are only coordinate choices.' },
        { value: 2, feedback: 'Two is the number of polarizations (step 28) — but each needs a value and a rate of change, like a string’s position and speed.' },
      ],
      hints: ['Start from 12; remove what the constraints fix and what the choice of coordinates fixes.', 'Each of those removes 4.'],
      teach: 'Gravity has two free polarizations, each with a value and a rate: 12 numbers − 4 constraints − 4 coordinate choices = 4 per point.',
      explain: '12 − 4 − 4 = 4: the two polarizations of step 28, each needing a value and a rate of change, just as a vibrating string needs a starting shape and a starting speed. Everything else on the slice is either forced by the constraints or a matter of labelling.',
    }),
    num({
      id: 'excess', difficulty: 2,
      gen(r) {
        const [body, name, GM, gmText, more] = r.pick([
          ['the Moon', 'Moon', GM_MOON, t`4.905\times10^{12}`, 'a little more'],
          ['Mars', 'Mars', 4.283e13, t`4.283\times10^{13}`, 'somewhat more'],
          ['Jupiter', 'Jupiter', 1.267e17, t`1.267\times10^{17}`, 'somewhat more'],
          ['the Sun', 'Sun', GM_SUN, t`1.327\times10^{20}`, 'several times more'],
        ]);
        const ex = GM / (3 * C * C);
        const friendly = ex < 1 ? `${round(ex * 1e3, 3)} mm` : `${round(ex, 3)} m`;
        return {
          prompt: t`Treat ${body} as a ball of uniform density, with $GM = ${gmText}\ \text{m}^3/\text{s}^2$. By how much does its radius measured with a rod from the centre exceed its circumference $\div\,2\pi$? Use the excess radius $GM/(3c^2)$.`,
          answer: ex, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: GM / (C * C), feedback: 'Divide by 3 as well: the excess is GM/(3c²).' }, { value: GM / (3 * C), feedback: 'Divide by c², not c.' }],
          hints: [t`$c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: 'Inside matter space is curved: a uniform ball’s measured radius exceeds its circumference ÷ 2π by GM/(3c²).',
          explain: t`$GM/(3c^2) = ${sci(ex)}$ m, that is ${friendly}. The real ${name}, ${name === 'Sun' ? 'far denser at its core' : 'denser toward its centre'}, has ${more}.`,
          visual: rodPic,
        };
      },
    }),
    mcq({
      id: 'instant', difficulty: 2,
      prompt: t`For weak gravity the energy constraint becomes Poisson's equation, $\nabla^2\Phi = 4\pi G\rho$ (step 19) — and like every constraint it must hold everywhere on each slice at once. When a star collapses, is the change felt instantly everywhere?`,
      visual: conePic,
      choices: [
        'No: the evolution equations carry the change outward at the speed of light. Far away the constraint sees only the total mass-energy inside, which cannot change suddenly',
        'Yes: constraints act instantly, so gravity does too',
        'Yes, but the effect is too small ever to measure',
        'No: the constraints hold only on the first slice',
      ],
      answer: 0,
      why: {
        1: 'Gravity travels at c: the gravitational waves and light of GW170817 arrived together after 130 million years (step 19). Only Newton’s theory, a constraint with no evolution equations, acts instantly.',
        2: 'It is not a matter of size: changes in gravity travel at c, and LIGO measures those travelling changes directly.',
        3: 'They hold on every slice; they simply never demand a faster-than-light update.',
      },
      hints: ['When the star collapses, does the total mass-energy inside a huge sphere around it change?'],
      teach: 'Newton’s gravity is a constraint with no evolution, hence instantaneous; Einstein’s adds evolution equations that carry every change at c.',
      explain: t`Far away, the energy constraint sees only the total mass-energy inside — which is conserved, so nothing there has to change at once. The details travel outward through the evolution equations at $c$, as a changing near field and gravitational waves. Newton's theory keeps Poisson's equation but has no evolution equations, so in it every change is felt everywhere immediately.`,
    }),
    mcq({
      id: 'bianchi', difficulty: 2,
      prompt: 'A simulation starts from a slice that satisfies all four constraints. If its six evolution equations were then solved exactly, would every later slice still satisfy the constraints?',
      visual: driftGraph({ f: 0, caption: 'The toy universe with λ = 0. The computed violation is never zero, but it shrinks fast as the time step shrinks: it measures the numerical error, not the physics.' }),
      choices: [
        'Yes: the Einstein tensor’s automatic balance (step 17) guarantees it, as charge conservation guarantees Gauss’s law',
        'Only if the code solves the constraints again at every step',
        'No: the constraints matter only on the first slice',
        'Only far from all matter',
      ],
      answer: 0,
      why: {
        1: 'Re-solving them every step is one numerical strategy, but exact evolution needs no help: it carries satisfied constraints along by itself.',
        2: 'They must hold on every slice; the point is that exact evolution keeps them true automatically.',
        3: 'The guarantee holds everywhere, matter included, because energy and momentum are conserved there too (step 18).',
      },
      hints: ['What keeps Gauss’s law true as the fields evolve in electromagnetism?'],
      teach: 'Exact evolution preserves the constraints, so the violation a simulation measures is a direct readout of its numerical error.',
      explain: 'The Einstein tensor balances automatically (the Bianchi identity) and energy–momentum is conserved. Together they make the rate of change of the constraints depend only on the constraints themselves: zero stays zero. That is why codes track the violation: it shows how far their own errors have pushed them off Einstein’s equations.',
    }),
    mcq({
      id: 'formulation', difficulty: 2,
      prompt: t`In the toy universe, $\lambda$ times the energy constraint was added to the evolution equation. With $\lambda = +2$ the violation exploded; with $\lambda = -2$ it died away. Yet for every true solution the added term is exactly zero. What does this show?`,
      visual: driftGraph({ f: 2, caption: `λ = +2: the same exact solution as λ = 0, yet every run drifts away from it, and the largest step crashes at t ≈ ${CRASH_T}.` }),
      choices: [
        'How the equations are written — which multiples of the constraints are added — decides whether a computer’s errors die out or grow',
        'The λ = +2 equations describe a different universe',
        'With λ = −2 the computed universe has no error at all',
        'Smaller time steps would have cured the λ = +2 version',
      ],
      answer: 0,
      why: {
        1: 'The added term vanishes for every true solution, so both versions have exactly the same solutions. They differ only near them — which is where a computer always is.',
        2: 'Damping removes the constraint violation, not all error: the computed expansion still carries truncation error, which only smaller steps reduce.',
        3: 'They only postpone the failure: the errors start smaller but grow just as fast.',
      },
      hints: ['What is the added term equal to for an exact solution?'],
      teach: 'Versions of Einstein’s equations that differ by multiples of the constraints share every exact solution but behave very differently on a computer.',
      explain: 'Off the true solution — where every computation sits, slightly — the added term feeds the violation back: growth for one sign, decay for the other. Choosing such additions well is much of what the BSSN formulation and constraint damping did, and they are why black-hole codes finally ran stably in 2005 (step 32).',
    }),
    num({
      id: 'cfl-cost', difficulty: 2,
      gen(r) {
        const f = r.pick([2, 3, 4]);
        const say = f === 2 ? 'halve the grid spacing' : `make the grid spacing ${f} times finer`;
        return {
          prompt: t`A 3D simulation's time step must shrink with its grid spacing: a signal moving at $c$ may cross at most about one grid cell per step (the Courant condition). If you ${say} everywhere, how many times more computing does the same stretch of simulated time take?`,
          answer: f ** 4, tol: { rel: 1e-6 },
          errors: [{ value: f ** 3, feedback: 'That counts the extra grid points, but each run also needs more time steps.' }, { value: f, feedback: 'That counts only the extra time steps; every step also has more points to update.' }],
          hints: [`Grid points: ${f} times more along each of the 3 directions.`, `Time steps: ${f} times as many. Multiply the two.`],
          teach: 'Refining a 3D grid f-fold costs f³ more points and f more steps — f⁴ in all — which is why codes refine only near the black holes.',
          explain: t`$${f}^3 = ${f ** 3}$ times the points, times $${f}$ times the steps: $${f}^4 = ${f ** 4}$. So codes refine only where they must — nested boxes, finest around each black hole (mesh refinement) — while the waves are followed far out on coarse grids.`,
          visual: gridPic,
        };
      },
    }),
    mcq({
      id: 'gauge-compare', difficulty: 2,
      prompt: 'Two groups simulate the same black-hole merger with different lapse and shift — different slicings and coordinates. At the same coordinate point and coordinate time, their metric numbers differ. Which result is right?',
      visual: slicingsPic,
      choices: [
        'Both can be: coordinates are labels the equations leave open. Compare what does not depend on them — the wave far away, the final mass and spin',
        'The one whose slices are flat',
        'Neither: Einstein’s equations fix the coordinates, so at least one code has a bug',
        'The one with the smaller metric numbers',
      ],
      answer: 0,
      why: {
        1: 'No slicing is preferred by the equations: flat slices are one choice among many, no more correct than the rest.',
        2: 'Einstein’s equations leave the lapse and shift free — four functions with no equation of their own to obey.',
        3: 'The size of the metric numbers depends on the coordinates, like the distortions of a map projection.',
      },
      hints: ['Recall step 7: what do coordinates mean physically?'],
      teach: 'The lapse and shift are free choices, so codes are compared through results that do not depend on coordinates, such as the waveform far away.',
      explain: 'Einstein’s equations fix the geometry, not the labels on it. Each code’s lapse and shift decide how its coordinates are laid down, so raw metric numbers differ. The waveform extracted far away, and the final black hole’s mass and spin, do not depend on these choices — which is how codes are checked against each other.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-curv', difficulty: 2,
      gen(r) {
        const [body, rho, rhoText, size] = r.pick([
          ['a white dwarf', 1e9, t`1.0\times10^{9}`, 'a white dwarf’s radius of several thousand kilometres: mildly curved'],
          ['a white dwarf', 3e9, t`3.0\times10^{9}`, 'a white dwarf’s radius of several thousand kilometres: mildly curved'],
          ['a neutron star', 4e17, t`4.0\times10^{17}`, 'a neutron star’s radius of about 12 km: strongly curved'],
          ['a neutron star', 6e17, t`6.0\times10^{17}`, 'a neutron star’s radius of about 12 km: strongly curved'],
        ]);
        const R = curv(rho), a = sphereRadius(R);
        return {
          prompt: t`At an instant when nothing moves, how curved is space inside ${body} of uniform density $${rhoText}\ \text{kg/m}^3$? Give $${R3} = 16\pi G\rho/c^2$.`,
          answer: R, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: R / 2, feedback: 'It is 16πG, not 8πG: the energy constraint is twice the time–time part of Einstein’s equation.' }, { value: R * C, feedback: 'Divide by c², not c.' }],
          hints: [t`$16\pi G/c^2 = ${sci((16 * Math.PI * G) / (C * C))}$ m/kg.`],
          teach: 'The energy constraint ties space’s curvature to the density at each instant — exactly, even in strong gravity.',
          explain: t`$${R3} = ${sci(R)}\ \text{m}^{-2}$, the curvature of a three-sphere of radius $a = \sqrt{6/${R3}} = ${sci(a / 1e3)}$ km. Compare ${size}.`,
          visual: embedPic(),
        };
      },
    }),
    mcq({
      id: 'cp-plugin', difficulty: 2,
      prompt: 'A colleague says: “Give me the matter’s stress–energy T, and I’ll solve Einstein’s equations for the metric — the way you solve Poisson’s equation for Φ given ρ.” What is missing?',
      visual: gTable,
      choices: [
        'It is an evolution problem: you need a starting slice that obeys the constraints and a choice of lapse and shift, and then matter and metric are stepped forward together, each steering the other',
        'Nothing: the metric follows from T alone, just as Φ follows from ρ',
        'Only the cosmological constant Λ must be added',
        'T must first be measured more precisely',
      ],
      answer: 0,
      why: {
        1: 'Even where T = 0, spacetime can carry gravitational waves: T alone does not fix the metric. Initial data and a gauge choice are needed too.',
        2: 'Λ is a single constant; adding it does not turn an evolution problem into a Poisson-like one.',
        3: 'Precision is not the issue. The structure is: data on a slice, then evolution.',
      },
      hints: ['Can there be curvature where T = 0?'],
      teach: 'Einstein’s equations are not “plug in T and solve”: they need constraint-satisfying initial data and a gauge choice, then matter and geometry evolve together.',
      explain: 'Poisson’s equation is all constraint: ρ now fixes Φ now. Einstein’s equations also carry gravity’s own free part — gravitational waves — so T alone cannot fix the metric. A simulation needs initial data obeying the 4 constraints, chosen lapse and shift, and then it evolves matter and metric together, each moving the other (step 18).',
    }),
    mcq({
      id: 'cp-cfd', difficulty: 2, transfer: true,
      prompt: t`An aerospace code for incompressible flow — low-speed air or water — steps the velocity $\mathbf u$ forward with the momentum equation, but must also keep $\nabla\cdot\mathbf u = 0$ (no compression) at every instant. Which statement fits?`,
      visual: flowPic,
      choices: [
        t`$\nabla\cdot\mathbf u = 0$ is a constraint, like Gauss’s law: each step the code solves a Poisson equation for the pressure, which projects the velocity back onto $\nabla\cdot\mathbf u = 0$`,
        t`The momentum equation is the constraint, and $\nabla\cdot\mathbf u = 0$ is stepped forward in time`,
        t`Nothing needs enforcing: the momentum equation keeps $\nabla\cdot\mathbf u = 0$ by itself, whatever the pressure`,
        t`Small enough time steps make $\nabla\cdot\mathbf u = 0$ automatic`,
      ],
      answer: 0,
      why: {
        1: 'It has no time derivative in it, so it cannot step anything forward: it is the constraint.',
        2: 'Only the right pressure keeps the flow divergence-free, and the pressure has no evolution equation of its own: it must be solved for at every step.',
        3: 'Numerical errors break the constraint at any step size; it has to be enforced.',
      },
      hints: ['Which of the two equations has no time derivative in it?'],
      teach: 'Incompressible-flow solvers face a constraint too: ∇·u = 0, enforced each step through a Poisson equation for the pressure.',
      explain: t`Like Gauss's law and Einstein's energy constraint, $\nabla\cdot\mathbf u = 0$ holds at each instant with no time derivative. The pressure adjusts instantly to keep it, found every step from a Poisson equation — the projection method (Chorin, 1968). Numerical relativity mostly does the opposite: it solves its constraints once, at the start, and then monitors them as the evolution runs.`,
    }),
  ],
  sources: [
    { label: 'Gourgoulhon, “3+1 formalism and bases of numerical relativity” (2007), lecture notes', url: 'https://arxiv.org/abs/gr-qc/0703035' },
    { label: 'Baumgarte & Shapiro, “On the numerical integration of Einstein’s field equations”, Phys. Rev. D 59, 024007 (1998)', url: 'https://arxiv.org/abs/gr-qc/9810065' },
    { label: 'Gundlach, Calabrese, Hinder & Martín-García, “Constraint damping in the Z4 formulation and harmonic gauge”, Class. Quantum Grav. 22, 3767 (2005)', url: 'https://arxiv.org/abs/gr-qc/0504114' },
    { label: 'Feynman, Leighton & Sands, The Feynman Lectures on Physics, Vol. II, ch. 42: Curved Space (the excess radius)', url: 'https://www.feynmanlectures.caltech.edu/II_42.html' },
  ],
});
