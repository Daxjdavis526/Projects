// Complex eigenvalues: a real matrix whose characteristic polynomial has no
// real roots rotates as it scales; λ = a ± bi = r e^{±iθ} gives the scale r
// and the turn θ per application.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matmul, det2, matTeX, map2d } from './_la.js';
import { unimodular, inv2, trace, decTeX } from './_eig.js';

const t = String.raw;
const DEG = Math.PI / 180;
const round = (M) => M.map((row) => row.map((v) => Math.round(v)));
const atan2d = (b, a) => Math.atan2(b, a) / DEG;

// a static spiral of iterates xₖ = Cᵏx₀ for C = r·(rotation by th degrees), x₀ = (1, 0)
function spiral(r, th, n, { caption, half = 1.6 } = {}) {
  const pts = Array.from({ length: n + 1 }, (_, k) => ({ x: r ** k * Math.cos(k * th * DEG), y: r ** k * Math.sin(k * th * DEG), color: k ? 'gold' : 'good', r: k ? 4 : 5.5, label: k === 0 ? 'x₀' : k === 1 ? 'x₁' : '' }));
  return {
    type: 'graph',
    params: {
      x: [-2 * half, 2 * half], y: [-half, half], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
      curves: [{ param: [`${r}^t*cos(t*${th}*pi/180)`, `${r}^t*sin(t*${th}*pi/180)`], t: [0, n], color: 'ink3', width: 1.2, dash: [4, 4] }, { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 5] }],
      points: pts,
    },
    caption: caption || 'The iterates x₀, x₁, x₂, … (gold), joined by a dashed spiral to guide the eye; dotted: the unit circle.',
  };
}

// a real 2×2 integer matrix with complex eigenvalues a ± bi (b > 0): P·C·P⁻¹, C the rotation–scaling matrix
function complexMat(r) {
  for (let k = 0; k < 500; k++) {
    const a = r.int(-2, 3), b = r.int(1, 3), P = unimodular(r, { range: 2 });
    const A = round(matmul(matmul(P, [[a, -b], [b, a]]), inv2(P)));
    if (A.flat().some((v) => Math.abs(v) > 9) || A[0][1] === -A[1][0] && A[0][0] === A[1][1]) continue;
    return { A, a, b };
  }
  return { A: [[1, -2], [1, 3]], a: 2, b: 1 };
}

export default lesson({
  id: 'math2270.LA-9.4',
  title: 'Complex eigenvalues and rotations',
  minutes: 12, difficulty: 3,
  intro: t`A rotation of the plane turns **every** direction, so it has no real eigenvectors — and its characteristic polynomial $\lambda^2 - 2\cos\theta\,\lambda + 1$ has no real roots. Its roots are complex, $\cos\theta \pm i\sin\theta = e^{\pm i\theta}$, and that is the general story: the **rotation–scaling** matrix
$$C = \begin{bmatrix} a & -b \\ b & a \end{bmatrix} = r\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}, \qquad \lambda = a \pm bi = r\,e^{\pm i\theta}$$
turns the plane through $\theta$ and stretches it by $r = |\lambda|$. Every real $2\times2$ matrix with complex eigenvalues is $C$ in disguise: $A = PCP^{-1}$ for a suitable real $P$ — a rotation–scaling seen in a skewed basis. So repeated application spirals: **outward if $|\lambda| > 1$, inward if $|\lambda| < 1$, round and round if $|\lambda| = 1$**, turning $\theta$ per step. Complex eigenvalues of a real matrix always come in conjugate pairs. In differential equations the same pair $a \pm bi$ means oscillation at angular frequency $b$ with growth or decay $e^{at}$ (DE-4).`,
  symbols: [
    { tex: t`a, b`, text: t`the real and imaginary parts of the eigenvalue $\lambda = a \pm bi$ (here $b \ne 0$)` },
    { tex: 'r', text: t`the modulus $|\lambda| = \sqrt{a^2 + b^2}$: the factor by which each application scales lengths (in the right basis)` },
    { tex: t`\theta`, text: t`the argument of $\lambda$: the angle turned per application, $\tan\theta = b/a$ (in the quadrant of $(a, b)$)` },
    { tex: 'i', text: t`the imaginary unit, $i^2 = -1$` },
    { tex: 'C', text: t`the rotation–scaling matrix built from $a$ and $b$` },
  ],
  why: 'Complex eigenvalues are how linear algebra describes anything that oscillates or circulates: a pendulum, an LC circuit, a precessing gyroscope, an orbit perturbed about a Lagrange point.',
  visual: {
    type: 'graph',
    title: 'One step: turn by θ, stretch by r',
    lead: t`Each gold point is the previous one multiplied by $C = r\,R(\theta)$: turned through $\theta$, then stretched by $r$. The readout gives the eigenvalue $\lambda = a + bi$ of $C$ — its modulus is $r$, its angle $\theta$.`,
    tasks: [
      'Set r = 1: the points march round the unit circle, θ at a time. |λ| = 1.',
      'Set r = 0.9 and then r = 1.1: the same turning, spiralling in or out. The modulus of λ decides.',
      'Set θ = 45°: the eighth point is back on the positive x-axis — eight steps per turn.',
    ],
    params: {
      x: [-3.4, 3.4], y: [-1.9, 1.9], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
      sliders: [
        { key: 'r', label: t`Scale $r = |\lambda|$`, min: 0.8, max: 1.15, step: 0.01, value: 0.95, explain: t`How much each step stretches (or shrinks) lengths.` },
        { key: 'th', label: t`Turn $\theta$ per step`, min: 5, max: 90, step: 5, value: 30, unit: t`^\circ`, explain: t`The angle of the eigenvalue $\lambda$ in the complex plane.` },
      ],
      curves: [
        { param: ['r^t*cos(t*th*pi/180)', 'r^t*sin(t*th*pi/180)'], t: [0, 16], color: 'ink3', width: 1.2, dash: [4, 4] },
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 5] },
      ],
      points: Array.from({ length: 17 }, (_, k) => ({ x: `r^${k}*cos(${k}*th*pi/180)`, y: `r^${k}*sin(${k}*th*pi/180)`, color: k ? 'gold' : 'good', r: k ? 4 : 5.5, label: k === 0 ? 'x₀' : k === 1 ? 'x₁' : k === 8 ? 'x₈' : '' })),
      readouts: [
        { label: t`$a = \operatorname{Re}\lambda$`, expr: 'r*cos(th*pi/180)', digits: 3 },
        { label: t`$b = \operatorname{Im}\lambda$`, expr: 'r*sin(th*pi/180)', digits: 3 },
        { label: t`$|\lambda|$`, expr: 'r', digits: 3 },
        { label: 'steps per turn', expr: '360/th', digits: 3 },
      ],
    },
    caption: 'Sixteen applications of C = r·R(θ) to x₀ = (1, 0). The dashed spiral joins them to guide the eye; the dotted circle has radius 1.',
  },
  example: {
    prompt: t`Find the eigenvalues of $A = ${matTeX([[1, -2], [1, 3]])}$ and say what repeated application of $A$ does.`,
    visual: map2d([[1, -2], [1, 3]], { eigen: true, view: 3.2, shape: 'F', caption: 'A turns the F and stretches it; no violet lines appear, because no direction is left unturned.' }),
    steps: [
      { label: 'Polynomial', text: t`$\operatorname{tr}A = 4$, $\det A = 3 + 2 = 5$: $\lambda^2 - 4\lambda + 5 = 0$.` },
      { label: 'Roots', text: t`$\lambda = \dfrac{4 \pm \sqrt{16 - 20}}{2} = 2 \pm i$. The discriminant is negative: no real eigenvalues, so no real eigenvectors.` },
      { label: 'Modulus and angle', text: t`$r = |2 + i| = \sqrt5 \approx 2.236$ and $\theta = \arctan\tfrac12 \approx 26.57^\circ$.` },
      { label: 'In disguise', text: t`$A = PCP^{-1}$ with $C = ${matTeX([[2, -1], [1, 2]])}$ and $P = ${matTeX([[-1, -1], [1, 0]])}$ (the real and imaginary parts of the eigenvector $(-1 - i, 1)$ of $\lambda = 2 - i$). Check: $PCP^{-1} = ${matTeX([[1, -2], [1, 3]])}$. ✓` },
      { label: 'Meaning', text: t`In the skewed coordinates of $P$, each application turns by $26.57^\circ$ and stretches by $\sqrt5$: about $13.5$ steps per turn, spiralling outward, the size growing like $5^{k/2}$. Sense check: $(2 + i)(2 - i) = 5 = \det A$ and $(2 + i) + (2 - i) = 4 = \operatorname{tr}A$. ✓` },
    ],
    answer: t`$\lambda = 2 \pm i$: a rotation by about $26.6^\circ$ combined with a stretch by $\sqrt5$ — the iterates spiral outward.`,
  },
  practice: [
    num({
      id: 'modulus', difficulty: 1,
      gen(r) {
        const [p, q] = r.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6], [1, 1], [1, 2]]), sa = r.sign(), sb = r.sign();
        const a = (sa * p) / 10, b = (sb * q) / 10, mod = Math.hypot(a, b);
        return {
          prompt: t`What is the modulus $|\lambda|$ of the eigenvalues of $C = ${decTeX([[a, -b], [b, a]])}$?`,
          answer: mod, tol: { rel: 0.003 },
          errors: [{ value: a * a + b * b, feedback: t`That is $a^2 + b^2 = |\lambda|^2$; take the square root.` }, { value: Math.abs(a) + Math.abs(b), feedback: t`Moduli do not add: $|a + bi| = \sqrt{a^2 + b^2}$.` }].filter((e) => Math.abs(e.value - mod) > 0.005),
          hints: [t`$C$ has eigenvalues $a \pm bi$ with $a = ${nice(a)}$ and $b = ${nice(b)}$.`, t`$|\lambda| = \sqrt{a^2 + b^2}$ (also $=\sqrt{\det C}$).`],
          teach: t`For a rotation–scaling matrix, $|\lambda| = \sqrt{a^2 + b^2} = \sqrt{\det C}$ is the stretch per step.`,
          explain: t`$|\lambda| = \sqrt{${nice(a * a)} + ${nice(b * b)}} = ${nice(mod)}$. ${mod > 1.0001 ? 'Greater than 1: repeated application spirals outward.' : mod < 0.9999 ? 'Less than 1: repeated application spirals inward.' : 'Exactly 1: a pure rotation.'}`,
          visual: map2d([[a, -b], [b, a]], { view: 1.8, shape: 'F', caption: 'C applied once to the plane: the F is turned and rescaled.' }),
        };
      },
    }),
    num({
      id: 'angle', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 1], [-1, 1], [1, 2], [-1, 2], [2, 1], [-2, 1], [1, 3], [-3, 1], [0.5, 1.5]]);
        const th = atan2d(b, a), naive = Math.atan(b / a) / DEG;
        const errors = [{ value: 90 - th, feedback: t`That is $\arctan(a/b)$, measured from the wrong axis: $\tan\theta = b/a$.` }];
        if (a < 0) errors.push({ value: naive, feedback: t`$a < 0$, so $\lambda = ${nice(a)} + ${nice(b)}i$ lies in the second quadrant: add $180^\circ$ to $\arctan(b/a)$.` });
        return {
          prompt: t`Through what angle $\theta$ (in degrees, between $0^\circ$ and $180^\circ$) does each application of $C = ${decTeX([[a, -b], [b, a]])}$ turn the plane?`,
          answer: th, units: 'deg', tol: { rel: 0.004, abs: 0.2 }, errors: errors.filter((e) => Math.abs(e.value - th) > 0.5),
          hints: [t`The eigenvalue $\lambda = ${nice(a)} + ${nice(b)}i$ is the point $(${nice(a)}, ${nice(b)})$ in the complex plane; $\theta$ is its angle.`, t`$\tan\theta = b/a$ — but check the quadrant: ${a < 0 ? 'here a is negative' : 'here both are positive'}.`],
          teach: 'The turn per step is the angle of the eigenvalue a + bi in the complex plane.',
          explain: t`$\theta = \operatorname{atan2}(${nice(b)}, ${nice(a)}) = ${nice(th)}^\circ$. ${a < 0 ? 'A negative real part means a turn of more than 90° each step.' : ''}`,
          visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-0.4, 3.2], aspect: 'wide', equal: true, xlabel: 'Re', ylabel: 'Im', arrows: [{ from: [0, 0], to: [a, b], color: 'gold', width: 2.5, label: 'λ = a + bi' }] }, caption: 'The eigenvalue λ = a + bi drawn as a point (arrow) in the complex plane.' },
        };
      },
    }),
    num({
      id: 'im-part', difficulty: 2,
      gen(r) {
        const { A, a, b } = complexMat(r), tr = trace(A), d = det2(A);
        return {
          prompt: t`$A = ${matTeX(A)}$ has complex eigenvalues $\lambda = \alpha \pm \beta i$. Find $\beta > 0$.`,
          answer: b, tol: { rel: 0.003, abs: 0.002 },
          errors: [{ value: Math.sqrt(Math.abs(d - tr * tr)), feedback: t`The quadratic formula has $\sqrt{4\det A - (\operatorname{tr}A)^2}/2$: halve it after taking the root.` }, { value: a, feedback: t`That is the real part, $\alpha = \operatorname{tr}A/2$.` }].filter((e) => Math.abs(e.value - b) > 0.01),
          hints: [t`$\operatorname{tr}A = ${tr}$ and $\det A = ${d}$; solve $\lambda^2 - ${tr < 0 ? `(${tr})` : tr}\lambda + ${d} = 0$.`, t`$\lambda = \dfrac{${tr} \pm \sqrt{${tr * tr} - ${4 * d}}}{2}$: the square root of a negative number gives the imaginary part.`],
          teach: t`For complex eigenvalues of a $2\times2$: $\alpha = \operatorname{tr}A/2$ and $\beta = \sqrt{\det A - \alpha^2}$.`,
          explain: t`$\lambda = \tfrac12\big(${tr} \pm \sqrt{${tr * tr - 4 * d}}\big) = ${nice(a)} \pm ${nice(b)}i$, so $\beta = ${nice(b)}$. Check: $\alpha^2 + \beta^2 = ${nice(a * a + b * b)} = \det A$. ✓`,
          visual: map2d(A, { eigen: true, view: 3, caption: 'The map A: no violet eigenvector lines — it turns every direction.' }),
        };
      },
    }),
    mcq({
      id: 'which-complex', difficulty: 2,
      prompt: 'Which matrix has complex (non-real) eigenvalues?',
      choices: [t`$${matTeX([[1, -2], [3, 1]])}$`, t`$${matTeX([[1, 2], [3, 1]])}$`, t`$${matTeX([[2, 0], [0, -3]])}$`, t`$${matTeX([[0, 1], [1, 0]])}$`],
      answer: 0,
      why: {
        1: t`$\operatorname{tr} = 2$, $\det = 1 - 6 = -5 < 0$: a negative determinant always means two real eigenvalues of opposite sign.`,
        2: 'A diagonal matrix has its eigenvalues on the diagonal: 2 and −3, both real.',
        3: t`A reflection: eigenvalues $1$ and $-1$.`,
      },
      hints: [t`Eigenvalues are complex exactly when the discriminant $(\operatorname{tr}A)^2 - 4\det A$ is negative.`],
      teach: t`A real $2\times2$ has complex eigenvalues exactly when $(\operatorname{tr}A)^2 < 4\det A$ — the point $(\tau, \Delta)$ lies above the parabola.`,
      explain: t`For $${matTeX([[1, -2], [3, 1]])}$: $\operatorname{tr} = 2$, $\det = 1 + 6 = 7$, and $4 - 28 < 0$. Its eigenvalues are $1 \pm i\sqrt6$.`,
      visual: { type: 'de-tracedet', params: { tau: 2, Delta: 7, drag: false, panels: 'map', readout: false, labels: false, map: { tau: [-4, 4], Delta: [-6, 9] } }, caption: 'The trace–determinant plane. Above the parabola τ² = 4Δ the eigenvalues are complex. The dot is one of the four matrices.' },
    }),
    num({
      id: 'shrink', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[0.6, 0.6], [0.8, 0.4], [0.5, 0.7], [0.9, 0.3], [0.7, 0.5], [0.4, 0.8]]);
        const m = Math.hypot(a, b), k = Math.ceil(Math.log(0.5) / Math.log(m)), th = atan2d(b, a);
        return {
          prompt: t`Each application of $C = ${decTeX([[a, -b], [b, a]])}$ turns a vector and shrinks it. Starting from $\mathbf x_0$, after how many applications is $|\mathbf x_k|$ first less than half of $|\mathbf x_0|$?`,
          answer: k, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: k - 1, feedback: t`After $${k - 1}$ steps the length is still $${nice(m ** (k - 1), 3)}$ of the start, just above one half.` }],
          hints: [t`Each step multiplies the length by $|\lambda| = \sqrt{a^2 + b^2} = ${nice(m, 4)}$ (a rotation–scaling matrix scales every vector equally).`, t`Find the smallest $k$ with $${nice(m, 4)}^k < 0.5$: $k > \ln 0.5/\ln ${nice(m, 4)}$.`],
          teach: 'For a rotation–scaling matrix every vector’s length is multiplied by |λ| per step, whatever its direction.',
          explain: t`$|\lambda| = ${nice(m, 4)}$, and $\ln 0.5/\ln ${nice(m, 4)} = ${nice(Math.log(0.5) / Math.log(m))}$, so $k = ${k}$. Meanwhile the vector has turned $${k}\times${nice(th)}^\circ = ${nice(k * th)}^\circ$.`,
          visual: spiral(m, th, 8, { half: 1.3 }),
        };
      },
    }),
    mcq({
      id: 'eigvec-i', difficulty: 3,
      prompt: t`$R = ${matTeX([[0, -1], [1, 0]])}$ (a quarter turn) has eigenvalues $\pm i$. Which vector is an eigenvector for $\lambda = i$?`,
      choices: [t`$(1,\ -i)$`, t`$(1,\ i)$`, t`$(1,\ 0)$`, t`$(i,\ i)$`],
      answer: 0,
      why: {
        1: t`$R(1, i) = (-i, 1) = -i\,(1, i)$: an eigenvector, but for $\lambda = -i$, the conjugate.`,
        2: t`$R(1, 0) = (0, 1)$, not a multiple of $(1, 0)$: a quarter turn moves every real direction.`,
        3: t`$R(i, i) = (-i, i)$, which is not a multiple of $(i, i)$.`,
      },
      hints: [t`Compute $R\mathbf v$ for each candidate and compare with $i\mathbf v$.`, t`$R(1, -i) = (i, 1)$, and $i\cdot(1, -i) = (i, -i^2) = (i, 1)$.`],
      teach: 'Complex eigenvalues come with complex eigenvectors, in conjugate pairs; no real vector is an eigenvector of a rotation.',
      explain: t`$R(1, -i) = (0\cdot1 - 1\cdot(-i),\ 1\cdot1 + 0) = (i, 1) = i(1, -i)$. ✓ The conjugate vector $(1, i)$ goes with $\bar\lambda = -i$. Quantum mechanics lives on such complex vectors: circular polarization of light is exactly $(1, \pm i)$.`,
      visual: map2d([[0, -1], [1, 0]], { eigen: true, view: 1.8, caption: 'The quarter turn R: no real direction is kept, so no violet lines appear.' }),
    }),
    mcq({
      id: 'oscillation', difficulty: 2,
      prompt: t`The system $\mathbf x' = A\mathbf x$ has $A = ${decTeX([[-0.1, -2], [2, -0.1]])}$, with eigenvalues $-0.1 \pm 2i$. What does a typical solution do?`,
      choices: [
        t`Oscillates at angular frequency $2$ rad/s while decaying like $e^{-0.1t}$`,
        t`Decays without oscillating, like $e^{-0.1t}$ and $e^{-2t}$`,
        t`Oscillates at angular frequency $0.1$ rad/s while decaying like $e^{-2t}$`,
        t`Grows without bound, because the eigenvalues are complex`,
      ],
      answer: 0,
      why: {
        1: 'Only real eigenvalues give pure exponential decay. Here the imaginary part makes the solution turn.',
        2: t`Swapped: the real part sets growth or decay ($e^{at}$), the imaginary part the angular frequency ($b$).`,
        3: t`Complex is not unstable: the real part, $-0.1$, is negative, so solutions decay.`,
      },
      hints: [t`For $\lambda = a \pm bi$, solutions are combinations of $e^{at}\cos bt$ and $e^{at}\sin bt$.`],
      teach: t`For $\mathbf x' = A\mathbf x$, complex eigenvalues $a \pm bi$ mean oscillation at angular frequency $b$ with amplitude $e^{at}$.`,
      explain: t`$e^{(-0.1 + 2i)t} = e^{-0.1t}(\cos 2t + i\sin 2t)$: a spiral into the origin, turning at $2$ rad/s (period $\pi$ s) and shrinking by $e^{-0.1}$ per second — a lightly damped oscillator. [DE-4.3](#/lesson/math2280.DE-4.3) builds the real solutions from the complex eigenvectors.`,
      visual: { type: 'de-plane', params: { matrix: [[-0.1, -2], [2, -0.1]], x: [-2, 2], y: [-2, 2], seeds: [{ x: 1.8, y: 0, color: 'gold', dir: 'forward' }], T: 20, readout: false, aspect: 'wide' }, caption: 'Trajectories of x′ = Ax: one solution (gold) spirals in. Arrows show the direction of motion.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-angle', difficulty: 2,
      gen(r) {
        const { A, a, b } = complexMat(r), th = atan2d(b, a);
        return {
          prompt: t`$A = ${matTeX(A)}$ has complex eigenvalues $\alpha \pm \beta i$ with $\beta > 0$. Find the angle $\theta$ of $\alpha + \beta i$, in degrees between $0^\circ$ and $180^\circ$.`,
          answer: th, units: 'deg', tol: { rel: 0.004, abs: 0.2 },
          hints: [t`$\alpha = \operatorname{tr}A/2$ and $\beta = \sqrt{\det A - \alpha^2}$; then $\theta = \operatorname{atan2}(\beta, \alpha)$.`],
          teach: 'The angle of a complex eigenvalue is the turn per step.',
          explain: t`$\lambda = ${nice(a)} \pm ${nice(b)}i$, so $\theta = ${nice(th)}^\circ$.`,
          visual: map2d(A, { eigen: true, view: 3 }),
        };
      },
    }),
    num({
      id: 'cp-spin', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([10, 12, 15, 18, 20, 24, 30]), dt = r.pick([0.5, 1, 2]);
        const c = +Math.cos(th * DEG).toFixed(4), s = +Math.sin(th * DEG).toFixed(4);
        const rpm = th / dt / 6;
        return {
          prompt: t`A star tracker on a spinning satellite records its attitude every $${dt}$ s. In the spin plane, the attitude at one sample is the previous one times a matrix whose eigenvalues are $\lambda = ${c} \pm ${s}i$. What is the spin rate, in revolutions per minute?`,
          answer: rpm, units: 'rpm', tol: { rel: 0.01 },
          errors: [{ value: th / dt, feedback: t`That is the rate in degrees per second. One revolution per minute is $360^\circ/60\ \text{s} = 6^\circ/\text{s}$.` }, { value: th, feedback: t`That is the angle per sample, $${th}^\circ$. Divide by the sampling interval, then convert to rpm.` }].filter((e) => Math.abs(e.value - rpm) > 0.02 * rpm),
          hints: [t`$|\lambda| = 1$, so the matrix is a pure rotation; the angle of $\lambda$ is the turn per sample: $\theta = \operatorname{atan2}(${s}, ${c})$.`, t`Turn per second $= \theta/${dt}\ \text{s}$; and $1$ rpm $= 6^\circ/\text{s}$.`],
          teach: 'The angle of a unit-modulus eigenvalue is the rotation per step; dividing by the step time gives the angular velocity.',
          explain: t`$\theta = \operatorname{atan2}(${s}, ${c}) = ${th}^\circ$ per sample, so $${nice(th / dt)}^\circ$/s $= ${nice(rpm)}$ rpm. (Sampling must be fast enough: if the satellite turned more than $180^\circ$ between samples, the eigenvalue angle could not tell a fast spin from a slow one going the other way — aliasing.)`,
          visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.25, 1.25], aspect: 'wide', equal: true, xlabel: 'Re', ylabel: 'Im', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1, dash: [3, 4] }], points: [{ x: c, y: s, color: 'gold', r: 5.5, label: 'λ' }, { x: c, y: -s, color: 'gold', r: 5.5, label: 'λ̄', labelDy: 14 }] }, caption: 'The two eigenvalues in the complex plane, on the unit circle (dashed): a pure rotation.' },
        };
      },
    }),
    mcq({
      id: 'cp-real', difficulty: 2,
      prompt: 'Which statement is true for every real matrix?',
      choices: [
        t`A real $3\times3$ matrix has at least one real eigenvalue`,
        'A real matrix has only real eigenvalues',
        'A complex eigenvalue of a real matrix can occur without its complex conjugate',
        t`A rotation of three-dimensional space has no real eigenvalue`,
      ],
      answer: 0,
      why: {
        1: t`A plane rotation is a real matrix with eigenvalues $e^{\pm i\theta}$.`,
        2: t`The characteristic polynomial has real coefficients, so its non-real roots come in conjugate pairs $a \pm bi$.`,
        3: t`Its axis is a real eigenvector with $\lambda = 1$: the axis is the one line a rotation does not move.`,
      },
      hints: ['A real 3×3 has a cubic characteristic polynomial with real coefficients. How many of its roots can be non-real?'],
      teach: 'Non-real eigenvalues of a real matrix come in conjugate pairs, so an odd-sized real matrix always has a real eigenvalue.',
      explain: t`A cubic with real coefficients has 3 roots and the non-real ones pair up, so at least one is real. For a rotation of space that real eigenvector is the rotation axis (Euler's theorem): its eigenvalues are $1$ and $e^{\pm i\theta}$.`,
      visual: { type: 'calc-vectors3d', params: { range: 2, lines: [{ point: [0, 0, 0], dir: [0.3, 0.2, 1], t: [-1.8, 1.8], color: 'warn', label: t`\text{axis: }\lambda = 1` }], curves: [{ param: ['cos(t)', 'sin(t)', '-0.3*cos(t) - 0.2*sin(t)'], t: [0, 6.2832], color: 'accent' }] }, caption: 'A rotation of space turns everything around its axis (orange), which it leaves fixed: a real eigenvector with λ = 1. Drag to rotate.' },
    }),
  ],
  sources: [
    { label: 'Lay, Lay & McDonald, Linear Algebra and Its Applications (6th ed.), complex eigenvalues', url: 'https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235' },
    { label: 'MIT OCW 18.06SC, Lecture 21–22: Eigenvalues, complex eigenvalues', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
