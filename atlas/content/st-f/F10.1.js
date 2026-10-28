// Leapfrog and velocity Verlet — kick, drift, kick: second order from one
// force evaluation per step; the same trajectory as Störmer's two-step
// x₍ₙ₊₁₎ − 2xₙ + x₍ₙ₋₁₎ = h²a(xₙ) and as leapfrog with staggered velocities;
// exactly time-reversible; symplectic — its one-step map preserves phase-
// space area (det = 1 for the oscillator's matrix, against Euler's 1 + (hω)²),
// shown on a pendulum with a blob of starting states; stable for hω < 2
// (trace 2 − (hω)²). Transfer: the molecular-dynamics time step. The long-run
// energy comparison with RK4 is prog P11.3; why the energy stays bounded is
// the next lesson.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { verlet, symEuler, eulerXV, n12 } from './_ode.js';
import { seg } from './_num.js';

const t = String.raw;

// ── the Explore: a pendulum θ″ = −sin θ (time in units of √(L/g)) ──
const acc = (x) => [-Math.sin(x[0])];
const En = (x, v) => v[0] ** 2 / 2 - Math.cos(x[0]);
const area = (P) => Math.abs(P.reduce((s, [x1, y1], i) => { const [x2, y2] = P[(i + 1) % P.length]; return s + x1 * y2 - x2 * y1; }, 0)) / 2;
const METH = [[1, eulerXV, 'Euler'], [2, symEuler, 'symplectic Euler'], [3, verlet, 'velocity Verlet']];
const HS = [[1, 0.1, '0.1'], [2, 0.3, '0.3'], [3, 0.6, '0.6']];
const TBLOB = 6, NB = 96;
const BLOB0 = Array.from({ length: NB }, (_, k) => [0.8 + 0.25 * Math.cos((2 * Math.PI * k) / NB), 0.25 * Math.sin((2 * Math.PI * k) / NB)]);
const A0 = area(BLOB0);
const RUNS = METH.map(([, st]) => HS.map(([, h]) => {
  let x = [1.2], v = [0];
  const E0 = En(x, v), traj = [[x[0], v[0]]];
  let de = 0;
  for (let i = 0; i < Math.round(30 / h); i++) { [x, v] = st(acc, x, v, h); traj.push([x[0], v[0]]); de = Math.max(de, Math.abs(En(x, v) - E0)); }
  const N = Math.round(TBLOB / h);
  const blob = BLOB0.map(([p, q]) => { let X = [p], V = [q]; for (let i = 0; i < N; i++) [X, V] = st(acc, X, V, h); return [X[0], V[0]]; });
  return { traj, de, blob, ratio: area(blob) / A0 };
}));
const wh = (a, b) => `step(0.5 - abs(mt - ${a}))*step(0.5 - abs(hh - ${b}))`;
const inWin = ([p, q]) => Math.abs(p) < 3.3 && Math.abs(q) < 2.5;

// ── the worked example: x″ = −ω²x, ω = 2 rad/s, h = 0.1 s ──
const W = 2, H = 0.1, HW = W * H;
const VH = 0 + (H / 2) * (-W * W * 1), X1 = 1 + H * VH, V1 = VH + (H / 2) * (-W * W * X1);
// time reversal: 1000 Verlet steps forward, flip v, 1000 back
const REV = (() => {
  let x = [1.2], v = [0];
  for (let i = 0; i < 1000; i++) [x, v] = verlet(acc, x, v, 0.1);
  v = [-v[0]];
  for (let i = 0; i < 1000; i++) [x, v] = verlet(acc, x, v, 0.1);
  let xe = [1.2], ve = [0];
  for (let i = 0; i < 1000; i++) [xe, ve] = eulerXV(acc, xe, ve, 0.01);
  ve = [-ve[0]];
  for (let i = 0; i < 1000; i++) [xe, ve] = eulerXV(acc, xe, ve, 0.01);
  return { verlet: Math.hypot(x[0] - 1.2, v[0]), euler: Math.hypot(xe[0] - 1.2, ve[0]) };
})();

// a phase-plane picture of a blob before and after
const blobCurves = (P, color) => P.map((p, i) => seg(p[0], p[1], P[(i + 1) % P.length][0], P[(i + 1) % P.length][1], { color, width: 2, samples: 10 }));

export default lesson({
  id: 'st-f.F10.1',
  title: 'Leapfrog and velocity Verlet',
  minutes: 14, difficulty: 3,
  intro: t`For $x'' = a(x)$ — any force that depends on position, from springs to gravity — there is a method simpler than RK4 that does better over long times. **Velocity Verlet** gives the velocity half a kick, lets the position drift a full step at that mid-step velocity, then gives the second half kick with the new force:

$$\begin{gathered} v_{n+\frac12} = v_n + \tfrac{h}{2}\,a(x_n) \\ x_{n+1} = x_n + h\,v_{n+\frac12} \\ v_{n+1} = v_{n+\frac12} + \tfrac{h}{2}\,a(x_{n+1}) \end{gathered}$$

The force at $x_{n+1}$ is reused for the next step’s first kick, so each step costs **one** force evaluation, and the method is second order. Two structural properties matter more than the order: run it backwards ($h \to -h$) and it retraces its path exactly — it is **time-reversible** — and its step maps any patch of starting states $(x, v)$ to a patch of exactly the same area — it is **symplectic**. Euler’s method does neither.`,
  symbols: [
    { tex: 'x_n,\\ v_n', text: 'position and velocity after $n$ steps (in general vectors: every particle, every coordinate)' },
    { tex: 'a(x)', text: 'the acceleration, force over mass, depending on position only (velocity-dependent forces such as drag or magnetism need a variant)' },
    { tex: 'h', text: 'the time step, fixed' },
    { tex: 'v_{n+\\frac12}', text: 'the velocity at mid-step: in the **leapfrog** form velocities live at half steps and positions at whole steps, leaping over each other' },
  ],
  why: 'Velocity Verlet (leapfrog) is the integrator of molecular dynamics, N-body astrophysics and plasma particle codes, because its errors stay bounded over billions of steps — and the reason is a geometric property, area preservation, that you can see in a phase portrait.',
  visual: {
    type: 'graph',
    title: 'A blob of pendulums',
    lead: t`A pendulum $\theta'' = -\sin\theta$ in its phase plane (angle $\theta$, angular velocity $\omega$; time in units of $\sqrt{L/g}$). Dots: one swing from $\theta = 1.2$ rad followed for 30 time units. Gold ring: a disc of starting states; red ring: the same states after 6 time units. A symplectic method may stretch and shear the disc, but never changes its area.`,
    tasks: [
      `Euler at h = 0.1: the dots spiral outwards (energy grows), and the disc’s area grows by a factor ${RUNS[0][0].ratio.toFixed(2)}.`,
      'Switch to symplectic Euler or Verlet: the dots stay on a closed curve and the area ratio is 1.0000, at every step size.',
      `Compare the energy errors: Verlet’s is ${(RUNS[1][0].de / RUNS[2][0].de).toFixed(0)} times smaller than symplectic Euler’s at h = 0.1 — same structure, one order higher.`,
    ],
    params: {
      x: [-3.3, 3.3], y: [-2.5, 2.5], aspect: 'wide', axesAt: 'edge', xlabel: 'θ (rad)', ylabel: 'ω',
      choices: [
        { key: 'mt', label: 'Method', options: METH.map(([k, , l]) => [k, l]), value: 1, explain: 'Euler moves both θ and ω with old values; symplectic Euler kicks ω first, then drifts θ with the new ω; Verlet splits the kick in halves around the drift.' },
        { key: 'hh', label: 'Step $h$', options: HS.map(([k, , l]) => [k, l]), value: 1, explain: 'In units of √(L/g); a small-swing period is 2π ≈ 6.3.' },
      ],
      curves: [
        ...blobCurves(BLOB0, 'gold'),
        ...METH.flatMap(([a], i) => HS.flatMap(([b], j) => RUNS[i][j].blob.filter(inWin).length === NB ? blobCurves(RUNS[i][j].blob, 'bad').map((c) => ({ ...c, when: wh(a, b) })) : [])),
      ],
      points: METH.flatMap(([a], i) => HS.flatMap(([b], j) => RUNS[i][j].traj.filter(inWin).map(([p, q]) => ({ x: n12(p), y: n12(q), r: 2.2, color: 'accent', when: wh(a, b) })))),
      readouts: [
        { label: 'area after / before', expr: METH.flatMap(([a], i) => HS.map(([b], j) => `${wh(a, b)}*${n12(RUNS[i][j].ratio)}`)).join(' + '), digits: 5 },
        { label: 'largest energy error', expr: METH.flatMap(([a], i) => HS.map(([b], j) => `${wh(a, b)}*${n12(RUNS[i][j].de)}`)).join(' + '), digits: 3 },
      ],
    },
    caption: 'Exact runs in float64. The disc is 96 starting states on a circle of radius 0.25 about (0.8, 0); its area is measured by the polygon through them. Points that leave the window (Euler swinging over the top) are not drawn, nor is a disc that leaves it.',
  },
  example: {
    prompt: t`A spring–mass oscillator $x'' = -\omega^2x$ with $\omega = ${W}$ rad/s starts at $x = 1$ m, $v = 0$. Take one Verlet step with $h = ${H}$ s by hand. Then write the step as a matrix acting on $(x, v)$ and use it to show that Verlet preserves area, and to find its stability limit.`,
    visual: {
      type: 'graph',
      params: { x: [-1.25, 1.25], y: [-2.6, 2.6], aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: 'v (m/s)',
        curves: [{ param: ['cos(t)', '-2*sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 2 }],
        points: [{ x: 1, y: 0, r: 5, color: 'gold', label: 'start', labelDx: -46, labelDy: -10 }, { x: n12(X1), y: n12(V1), r: 5, color: 'accent', label: 'after one step', labelDx: -110, labelDy: 12 }] },
      caption: 'The exact phase-space ellipse x² + v²/ω² = 1 and the state after one Verlet step (barely moved: one step is a fifth of a radian of phase).',
    },
    steps: [
      { label: 'Half kick', text: t`$a(x_0) = -\omega^2x_0 = -4\ \text{m/s}^2$, so $v_{1/2} = 0 + 0.05\times(-4) = ${VH.toFixed(3)}$ m/s.` },
      { label: 'Drift', text: t`$x_1 = 1 + 0.1\times(${VH.toFixed(3)}) = ${X1.toFixed(3)}$ m.` },
      { label: 'Half kick', text: t`$a(x_1) = -4\times${X1.toFixed(3)} = ${(-W * W * X1).toFixed(3)}$, so $v_1 = ${VH.toFixed(3)} + 0.05\times(${(-W * W * X1).toFixed(3)}) = ${V1.toFixed(3)}$ m/s. (Exact: $x = \cos 0.2 = ${Math.cos(0.2).toFixed(4)}$, $v = -2\sin0.2 = ${(-2 * Math.sin(0.2)).toFixed(4)}$.)` },
      { label: 'As a matrix', text: t`Composing the three linear steps, with $\theta = h\omega$:
$$\begin{pmatrix}x_{n+1}\\ v_{n+1}\end{pmatrix} = \begin{pmatrix}1 - \tfrac12\theta^2 & h\\ -h\omega^2\left(1 - \tfrac14\theta^2\right) & 1 - \tfrac12\theta^2\end{pmatrix}\begin{pmatrix}x_n\\ v_n\end{pmatrix}$$
Here $\theta = ${HW}$: entries $${(1 - HW * HW / 2).toFixed(2)},\ ${H},\ ${(-H * W * W * (1 - HW * HW / 4)).toFixed(3)},\ ${(1 - HW * HW / 2).toFixed(2)}$ — and they reproduce the step above.` },
      { label: 'Area', text: t`The determinant is $\left(1 - \tfrac12\theta^2\right)^2 + \theta^2\left(1 - \tfrac14\theta^2\right) = 1$ **exactly**, for every $h$: a linear map with determinant 1 preserves area. Euler’s matrix $\begin{pmatrix}1 & h\\ -h\omega^2 & 1\end{pmatrix}$ has determinant $1 + \theta^2$, so it inflates every patch of phase space by $${(1 + HW * HW).toFixed(2)}$ per step.` },
      { label: 'Stability', text: t`With determinant 1 the two eigenvalues multiply to 1; they lie on the unit circle (bounded motion) when $\lvert\text{trace}\rvert = \lvert2 - \theta^2\rvert < 2$, that is $h\omega < 2$. Beyond it one eigenvalue exceeds 1 in size and the solution explodes. Here $h\omega = ${HW}$: comfortably stable.` },
    ],
    answer: t`$x_1 = ${X1.toFixed(3)}$ m, $v_1 = ${V1.toFixed(3)}$ m/s; the step matrix has determinant exactly 1 (area preserved, Euler’s is $1 + h^2\omega^2$) and is stable for $h\omega < 2$.`,
  },
  practice: [
    order({
      id: 'kdk-order', difficulty: 1,
      prompt: t`Put one velocity Verlet step in order (the force $a(x_n)$ is already known from the previous step).`,
      items: [t`$v \leftarrow v + \tfrac{h}{2}a(x)$`, t`$x \leftarrow x + h\,v$`, t`compute the new force $a(x)$ at the new position`, t`$v \leftarrow v + \tfrac{h}{2}a(x)$ with that new force`],
      visual: {
        type: 'graph',
        params: { x: [-0.2, 2.4], y: [-0.4, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 't (steps)', ylabel: '', yticks: 0,
          points: [{ x: 0, y: 0, r: 5, color: 'accent', label: 'x₀', labelDy: 14 }, { x: 1, y: 0, r: 5, color: 'accent', label: 'x₁', labelDy: 14 }, { x: 2, y: 0, r: 5, color: 'accent', label: 'x₂', labelDy: 14 }, { x: 0.5, y: 1, r: 5, color: 'gold', label: 'v½', labelDy: -14 }, { x: 1.5, y: 1, r: 5, color: 'gold', label: 'v₃⸝₂', labelDy: -14 }],
          arrows: [{ from: [0, 0], to: [0.45, 0.95], color: 'ink3' }, { from: [0.5, 1], to: [0.95, 0.05], color: 'ink3' }, { from: [1, 0], to: [1.45, 0.95], color: 'ink3' }, { from: [1.5, 1], to: [1.95, 0.05], color: 'ink3' }] },
        caption: 'The leapfrog picture: positions at whole steps (blue), velocities at half steps (gold), each updated from the other.',
      },
      hints: ['The position is moved with the half-step velocity.', 'Kick, drift, (new force), kick.'],
      teach: 'Kick–drift–kick: half a velocity update, a full position update, then the other half with the force at the new position.',
      explain: t`Half kick, drift, new force, half kick. The new force is kept for the next step’s first half kick, so the force is computed once per step. Merging the second half kick of one step with the first of the next gives **leapfrog**: $v_{n+\frac12} = v_{n-\frac12} + h\,a(x_n)$, $x_{n+1} = x_n + h\,v_{n+\frac12}$.`,
    }),
    num({
      id: 'one-step', difficulty: 2,
      gen(r) {
        const w = r.pick([1, 2, 3]), h = r.pick([0.05, 0.1, 0.2]), x0 = r.pick([0.5, 1, 2]), v0 = r.pick([0, 0.4, -0.6]);
        const vh = v0 + (h / 2) * (-w * w * x0), x1 = x0 + h * vh, v1 = vh + (h / 2) * (-w * w * x1);
        return {
          prompt: t`Take one velocity Verlet step for $x'' = -${w * w}x$ from $x_0 = ${x0}$, $v_0 = ${v0}$ with $h = ${h}$. What is $v_1$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.3 * Math.hypot(x0, v0 / w), 1.3 * Math.hypot(x0, v0 / w)], y: [-1.3 * w * Math.hypot(x0, v0 / w), 1.3 * w * Math.hypot(x0, v0 / w)], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'v',
              curves: [{ param: [`${n12(Math.hypot(x0, v0 / w))}*cos(t)`, `${n12(w * Math.hypot(x0, v0 / w))}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink3', width: 2 }],
              points: [{ x: x0, y: v0, r: 5, color: 'gold', label: 'start' }] },
            caption: 'The exact phase-space ellipse through the starting state.',
          },
          answer: v1, tol: { rel: 0.002, abs: 1e-4 },
          errors: [{ value: v0 + h * (-w * w * x0), feedback: 'That is Euler’s velocity update. Verlet averages the old and new forces: half a kick with each.' }, { value: vh, feedback: 'That is only the half-step velocity v½. Finish with the second half kick using a(x₁).' }].filter((e) => Math.abs(e.value - v1) > 0.003 * Math.max(Math.abs(v1), 0.05)),
          hints: [t`$v_{1/2} = v_0 + \tfrac{h}{2}(-${w * w}x_0) = ${n12(vh)}$; then $x_1 = x_0 + hv_{1/2} = ${n12(x1)}$.`, t`$v_1 = v_{1/2} + \tfrac{h}{2}(-${w * w}x_1)$.`],
          teach: 'The velocity update averages the force at the start and the end of the step: that symmetry is what makes Verlet second order and reversible.',
          explain: t`$v_{1/2} = ${n12(vh)}$, $x_1 = ${n12(x1)}$, $v_1 = ${n12(+v1.toFixed(6))}$. The exact values are $x = ${(x0 * Math.cos(w * h) + (v0 / w) * Math.sin(w * h)).toFixed(5)}$, $v = ${(-x0 * w * Math.sin(w * h) + v0 * Math.cos(w * h)).toFixed(5)}$.`,
        };
      },
    }),
    num({
      id: 'euler-area', difficulty: 2,
      gen(r) {
        const hw = r.pick([0.05, 0.1, 0.2]), n = r.pick([50, 100, 300]), ans = (1 + hw * hw) ** n;
        const B = BLOB0.map(([p, q]) => [p - 0.8, q]);
        return {
          prompt: t`Explicit Euler on $x'' = -\omega^2x$ has step matrix $\begin{pmatrix}1 & h\\ -h\omega^2 & 1\end{pmatrix}$. With $h\omega = ${hw}$, by what factor has the area of a patch of starting states $(x, v/\omega)$ grown after $${n}$ steps?`,
          visual: {
            type: 'graph',
            params: { x: [-1.4, 1.4], y: [-0.9, 0.9], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'v/ω',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink4', width: 1.4 }, ...blobCurves(B.map(([p, q]) => [p + 0.75, q]), 'gold')] },
            caption: 'A patch of starting states (gold) on the phase circle of the exact motion. Euler’s map rotates it and inflates it every step.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 + n * hw * hw, feedback: 'The factor compounds: (1 + h²ω²) per step, raised to the number of steps.' }, { value: (1 + hw * hw) ** (n / 2), feedback: 'That is the growth of the amplitude (lengths). Area grows by the determinant itself.' }].filter((e) => Math.abs(e.value - ans) > 0.025 * ans),
          hints: ['A linear map multiplies areas by its determinant.', t`$\det = 1 + (h\omega)^2$ per step; raise it to the power $${n}$.`],
          teach: 'Area in phase space is multiplied by the determinant of the step’s Jacobian: 1 for a symplectic method, more than 1 for Euler.',
          explain: t`$(1 + ${hw}^2)^{${n}} = ${tex(ans, 4)}$. The energy grows by the same factor per step (amplitude by its square root): an undamped oscillator steadily gaining energy. Verlet’s determinant is exactly 1.`,
        };
      },
    }),
    num({
      id: 'verlet-limit', difficulty: 2,
      gen(r) {
        const k = r.pick([2e3, 8e3, 5e4]), m = r.pick([0.5, 2, 10]), w = Math.sqrt(k / m), ans = 2 / w;
        return {
          prompt: t`A model of a rocket-engine mount includes a mass $m = ${m}$ kg on a spring of stiffness $k = ${tex(k)}$ N/m. What is the largest step velocity Verlet can take without the vibration blowing up?`,
          visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', z: [0, 2], drag: false, panels: ['plane'], x: [-3.6, 1.2], y: [-3.2, 3.2], controls: false, readout: false, legend: false, marks: [{ z: [0, 2], label: 'Verlet’s limit: hω = 2', color: 'gold' }, { z: [0, -2], label: '', color: 'gold' }] },
            caption: 'For comparison, RK4’s stability region (shaded). Verlet is stable for an undamped oscillation up to hω = 2 (gold), slightly less than RK4’s 2√2 — at a quarter of the cost per step.' },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: 2 / (k / m), feedback: 'Use ω = √(k/m), not k/m.' }, { value: (2 * Math.PI) / w, feedback: 'That is the period. The limit is hω < 2, about a third of a period.' }],
          hints: [t`$\omega = \sqrt{k/m}$.`, t`Stable when $h\omega < 2$: $h < 2/\omega$.`],
          teach: 'Verlet is stable for an oscillation only while hω < 2, a little under a third of a period per step.',
          explain: t`$\omega = \sqrt{${tex(k)}/${m}} = ${w.toFixed(2)}$ rad/s, so $h < 2/\omega = ${tex(ans, 3)}$ s. Accurate phases need ten or more steps per period, far below the limit.`,
        };
      },
    }),
    mcq({
      id: 'reversible', difficulty: 3,
      prompt: t`A pendulum is integrated 1000 steps forward with $h = 0.1$, then its velocity is reversed and it is integrated 1000 more steps. With velocity Verlet it ends $${tex(REV.verlet, 1)}$ from its starting state. With explicit Euler ($h = 0.01$) it ends $${tex(REV.euler, 2)}$ away. Why the difference?`,
      visual: {
        type: 'graph',
        params: { x: [-1.5, 1.5], y: [-1.5, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'θ', ylabel: 'ω',
          curves: [{ param: ['1.2*cos(t)', `${n12(Math.sqrt(2 * (1 - Math.cos(1.2))))}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', width: 1.6 }],
          points: [{ x: 1.2, y: 0, r: 5, color: 'gold', label: 'start and (Verlet) finish', labelDx: -170, labelDy: -12 }] },
        caption: 'The pendulum’s phase curve (approximate shape) and its starting state.',
      },
      choices: [
        'Verlet is time-reversible: a step with −h exactly undoes a step with h, so only round-off is left; Euler’s backward step is not the inverse of its forward step',
        'Verlet is fourth order, so its error is too small to see',
        'Euler’s step was ten times smaller, so it accumulated ten times more round-off',
        'Reversing the velocity removes the error of any method',
      ],
      answer: 0,
      why: {
        1: 'Verlet is second order; the return is exact because of symmetry, not accuracy.',
        2: 'Euler’s miss is truncation error from an asymmetric step, far larger than round-off.',
        3: 'Only for a reversible method; Euler’s forward errors and its backward errors add rather than cancel.',
      },
      hints: ['Write a Verlet step with −h: does it undo a step with +h?', 'Euler uses the slope at the start of each step — at the start going forward, at the other end going back.'],
      teach: 'A symmetric method retraces its path when time is reversed; that is a structural property, independent of its accuracy.',
      explain: t`Kick–drift–kick is symmetric: the step with $-h$ from $(x_{n+1}, v_{n+1})$ returns $(x_n, v_n)$ exactly in exact arithmetic, so the run comes back to within round-off ($${tex(REV.verlet, 1)}$). Euler evaluates the slope at the beginning of each step in both directions, so the two journeys’ errors add. Reversibility is one reason Verlet’s energy does not drift — see [the next lesson](#/lesson/st-f.F10.2).`,
    }),
    mcq({
      id: 'cost', difficulty: 2,
      prompt: t`An N-body code spends almost all its time computing forces. At equal cost — the same number of force evaluations — how do velocity Verlet and RK4 compare?`,
      visual: {
        type: 'graph',
        params: { x: [-0.3, 4.3], y: [-0.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 't (in units of one RK4 step)', ylabel: '', yticks: 0,
          points: [...[0, 1, 2, 3, 4].map((k) => ({ x: k, y: 1, r: 4.5, color: 'accent' })), ...Array.from({ length: 17 }, (_, k) => ({ x: k / 4, y: 0, r: 3, color: 'gold' }))],
          hlines: [{ y: 1, color: 'ink4', label: 'RK4: 4 forces per step' }, { y: 0, color: 'ink4', label: 'Verlet: 1 force per step' }] },
        caption: 'Step boundaries at equal cost: four Verlet steps for every RK4 step.',
      },
      choices: [
        'Verlet takes four steps for each RK4 step; RK4 is more accurate over short times, but Verlet’s energy error stays bounded over long ones',
        'RK4 is better in every respect, since fourth order beats second order',
        'They are identical, since both are explicit Runge–Kutta methods',
        'Verlet is better in every respect, because it is symplectic',
      ],
      answer: 0,
      why: {
        1: 'Order wins over short times; over long times RK4’s energy drifts linearly while Verlet’s oscillates without growing.',
        2: 'Verlet is a partitioned method that treats x and v differently, not an ordinary RK method, and it is symplectic where RK4 is not.',
        3: 'Symplectic does not mean accurate: Verlet’s phase error still grows, and at short times RK4 is more accurate.',
      },
      hints: ['How many force evaluations per step does each method need?', 'Which error grows with time, and which stays bounded?'],
      teach: 'Choose an integrator for the error that matters: RK4 for short, accurate trajectories, a symplectic method for long runs where energy must not drift.',
      explain: t`At equal cost Verlet steps four times as often. [prog P11.3](#/lesson/prog.P11.3) measures the crossover on an orbit: RK4 wins for a few hundred orbits, then its drifting energy overtakes Verlet’s bounded oscillation.`,
    }),
    code({
      id: 'verlet-pendulum', difficulty: 3,
      prompt: t`Write \`verlet(x, v, h, n)\` that takes $n$ velocity Verlet steps of the pendulum $\theta'' = -\sin\theta$ and returns the arrays of $\theta$ and $\omega$ (including the start). The program measures the largest energy error $\max\lvert E - E_0\rvert$, $E = \tfrac12\omega^2 - \cos\theta$, over 200 time units from $\theta = 1.2$ at $h = 0.1$ and $h = 0.05$.`,
      starter: t`import numpy as np

def verlet(x, v, h, n):
    xs, vs = [x], [v]
    # half kick, drift, half kick with the new force; record each state
    return np.array(xs), np.array(vs)

def max_energy_error(h, T=200.0):
    th, om = verlet(1.2, 0.0, h, round(T / h))
    E = 0.5 * om**2 - np.cos(th)
    return np.max(np.abs(E - E[0]))

e1, e2 = max_energy_error(0.1), max_energy_error(0.05)
print(e1, e2, e1 / e2)
`,
      answer: t`import numpy as np

def verlet(x, v, h, n):
    xs, vs = [x], [v]
    a = -np.sin(x)
    for i in range(n):
        v = v + h / 2 * a
        x = x + h * v
        a = -np.sin(x)
        v = v + h / 2 * a
        xs.append(x)
        vs.append(v)
    return np.array(xs), np.array(vs)

def max_energy_error(h, T=200.0):
    th, om = verlet(1.2, 0.0, h, round(T / h))
    E = 0.5 * om**2 - np.cos(th)
    return np.max(np.abs(E - E[0]))

e1, e2 = max_energy_error(0.1), max_energy_error(0.05)
print(e1, e2, e1 / e2)`,
      tests: [
        { name: t`one step from $\theta = 1$, $\omega = 0$ with $h = 0.1$ matches kick–drift–kick`, code: 'abs(verlet(1.0, 0.0, 0.1, 1)[1][1] - (-0.05*np.sin(1) - 0.05*np.sin(1 - 0.005*np.sin(1)))) < 1e-14' },
        { name: 'the energy error stays below 0.002 over 200 time units at h = 0.1', code: 'e1 < 2e-3' },
        { name: 'halving h divides it by about 4 (second order)', code: '3.6 < e1 / e2 < 4.4' },
      ],
      hints: ['Compute a = −sin(x) once before the loop.', 'In the loop: v += h/2·a; x += h·v; a = −sin(x); v += h/2·a; append x and v.'],
      teach: 'Keeping the force from the end of one step for the start of the next makes Verlet cost one force evaluation per step.',
      explain: t`The energy error stays near $${tex(RUNS[2][0].de, 2)}$ for the whole run instead of growing, and falls fourfold when $h$ halves: bounded, and second order. The next lesson explains why it stays bounded.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-md', difficulty: 3, transfer: true,
      gen(r) {
        const [bond, nu] = r.pick([['C–H stretch', 2950], ['O–H stretch', 3650], ['C=O stretch', 1715], ['N≡N stretch', 2330]]);
        const f = 2.99792458e10 * nu, w = 2 * Math.PI * f, ans = (2 / w) * 1e15;
        return {
          prompt: t`A molecular-dynamics simulation of a propellant uses velocity Verlet. Its fastest motion is the ${bond}, at wavenumber $${nu}\ \text{cm}^{-1}$ (frequency $f = c\tilde\nu$). Above what time step, in femtoseconds, does Verlet become unstable for that vibration?`,
          visual: {
            type: 'graph',
            params: { x: [0, 30], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (fs)', ylabel: 'bond stretch', yticks: 0,
              curves: [{ fn: `cos(${n12(w * 1e-15)}*x)`, color: 'accent', width: 2, domain: [0, 30] }] },
            caption: 'The bond’s vibration over 30 fs (harmonic approximation).',
          },
          answer: ans, units: 'fs', tol: { rel: 0.01 },
          errors: [{ value: 1e15 / f, feedback: 'That is the period. Verlet’s limit is hω < 2, i.e. h < P/π.' }, { value: (2 / f) * 1e15, feedback: 'Use the angular frequency ω = 2πf.' }],
          hints: [t`$f = c\tilde\nu$ with $c = 2.998\times10^{10}$ cm/s; $\omega = 2\pi f$.`, t`Limit: $h = 2/\omega = P/\pi$.`],
          teach: 'In molecular dynamics the fastest bond vibration sets Verlet’s stability limit — which is why such codes freeze those bonds or use femtosecond steps.',
          explain: t`$f = ${tex(f, 3)}$ Hz, period $${(1e15 / f).toFixed(1)}$ fs, so $h < ${ans.toFixed(2)}$ fs. Production MD uses 0.5–2 fs with bonds to hydrogen constrained, for accuracy as much as for stability.`,
        };
      },
    }),
    mcq({
      id: 'cp-nbody', difficulty: 2, transfer: true,
      prompt: t`Simulations of the Solar System over billions of years use symplectic leapfrog-type integrators with a fixed step. Which reason is right?`,
      visual: {
        type: 'graph',
        params: { x: [-1.7, 1.7], y: [-1.1, 1.1], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0,
          curves: [0.39, 0.72, 1, 1.52].map((a, i) => ({ param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [0, 2 * Math.PI], color: ['ink3', 'gold', 'accent', 'bad'][i], width: 1.6 })),
          points: [{ x: 0, y: 0, r: 6, color: 'gold' }] },
        caption: 'The inner planets’ orbits (circles of the right radii, AU; eccentricities ignored).',
      },
      choices: [
        'Their energy error stays bounded instead of drifting, so after 10¹⁰ steps the orbits have not spuriously spiralled in or out',
        'They are more accurate than any Runge–Kutta method at every step size',
        'They need no force evaluations',
        'They make the trajectories exact for any step size',
      ],
      answer: 0,
      why: {
        1: 'Over a few orbits a high-order RK method is more accurate; the advantage is in the long-run behaviour.',
        2: 'They need one force evaluation per step, like any method.',
        3: 'Phase errors (where on its orbit a planet is) still accumulate.',
      },
      hints: ['What happens to a small energy drift over ten billion steps?', 'Symplectic methods preserve phase-space structure, not the exact trajectory.'],
      teach: 'Over very long runs a bounded energy error matters more than a small one that drifts; that is the case for symplectic integrators.',
      explain: t`A drift of even $10^{-12}$ of the energy per step would move a planet’s semi-major axis noticeably over $10^{10}$ steps. A symplectic map keeps the energy oscillating within a fixed band. The positions along the orbits still drift in phase, so astronomers check results by changing the step and comparing ([F13](#/lesson/st-f.F13.1)).`,
    }),
    num({
      id: 'cp-euler-energy', difficulty: 3,
      gen(r) {
        const N = r.pick([20, 50, 63]), P = r.pick([5, 10, 20]), hw = (2 * Math.PI) / N, ans = (1 + hw * hw) ** (N * P);
        return {
          prompt: t`Explicit Euler multiplies an undamped oscillator’s energy by $1 + (h\omega)^2$ every step. With $${N}$ steps per period, by what factor has the energy grown after $${P}$ periods?`,
          visual: {
            type: 'graph',
            params: { x: [0, P], y: [0, Math.log10(ans) * 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'periods', ylabel: 'log₁₀(E/E₀)',
              curves: [{ fn: `x*${n12(N * Math.log10(1 + hw * hw))}`, color: 'bad', width: 2.2, domain: [0, P] }] },
            caption: 'Euler’s energy on a log scale: a straight line, exponential growth.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (1 + hw * hw) ** ((N * P) / 2), feedback: 'That is the amplitude factor. The energy grows by the full 1 + (hω)² per step.' }],
          hints: [t`$h\omega = 2\pi/${N}$, and there are $${N * P}$ steps.`, t`$\left(1 + (2\pi/${N})^2\right)^{${N * P}}$.`],
          teach: 'A per-step factor slightly above 1 compounds over a long run into exponential growth.',
          explain: t`$h\omega = ${hw.toFixed(4)}$, factor per step $${(1 + hw * hw).toFixed(5)}$, after $${N * P}$ steps $${tex(ans, 3)}$ — close to $e^{4\pi^2P/N} = ${tex(Math.exp((4 * Math.PI ** 2 * P) / N), 3)}$. Verlet with the same step keeps the energy within a fraction $(h\omega)^2/4 = ${tex((hw * hw) / 4, 2)}$ of its true value forever.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hairer, Lubich & Wanner (2003), Geometric numerical integration illustrated by the Störmer–Verlet method, Acta Numerica 12, 399', url: 'https://doi.org/10.1017/S0962492902000144' },
    { label: 'Verlet (1967), Computer “experiments” on classical fluids, Phys. Rev. 159, 98', url: 'https://doi.org/10.1103/PhysRev.159.98' },
    { label: 'Leimkuhler & Reich, Simulating Hamiltonian Dynamics (Cambridge 2004), ch. 2–4', url: 'https://doi.org/10.1017/CBO9780511614118' },
  ],
});
