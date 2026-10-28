// Unitary matrices: UᴴU = I keeps every inner product, so it keeps total
// probability. Time evolution e^{-iHt/ħ} of a Hermitian H is unitary; the
// plane rotation is the simplest unitary; beam splitters, Rabi flips and the
// spin-½ sign under a full turn.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { cx, cmul, cexp, abs2, cmatvec, cmatmul, cmatTeX, cTeX, bloch, machZehnder } from './_cplx.js';
import { map2d } from './_la.js';

const t = String.raw;
const H = t`^{\mathsf H}`;
const DEG = Math.PI / 180;
const PAIRS = [[0.6, 0.8], [0.8, 0.6], [0.28, 0.96], [0.96, 0.28], [-0.6, 0.8], [-0.8, 0.6], [-0.28, 0.96]];
const RS2 = t`\tfrac{1}{\sqrt2}`;
const BS = [[cx(Math.SQRT1_2), cx(0, Math.SQRT1_2)], [cx(0, Math.SQRT1_2), cx(Math.SQRT1_2)]];

// one beam splitter: light in from the left, transmitted on, reflected up
const splitter = (caption) => ({
  type: 'graph',
  params: {
    x: [-4.2, 4.8], y: [-1.2, 3.3], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-3.6 + 3.6*t', '0'], t: [0, 1], color: 'gold', width: 2.6 },
      { param: ['3.4*t', '0'], t: [0, 1], color: 'gold', width: 2 },
      { param: ['0', '2.5*t'], t: [0, 1], color: 'gold', width: 2 },
      { param: ['-0.38 + 0.76*t', '-0.38 + 0.76*t'], t: [0, 1], color: 'accent', width: 4 },
    ],
    arrows: [{ from: [2.6, 0], to: [3.6, 0], color: 'gold', width: 2.2, label: 'transmitted: amplitude t', labelDx: -60, labelDy: 22 }, { from: [0, 1.9], to: [0, 2.9], color: 'gold', width: 2.2, label: 'reflected: amplitude i r', labelDx: 10, labelDy: 6 }],
    points: [{ x: -3.5, y: 0, r: 0, label: 'light in', labelDx: 0, labelDy: -12, color: 'ink2' }, { x: 0.35, y: -0.3, r: 0, label: 'beam splitter', labelDx: 4, labelDy: 16, color: 'accent' }],
  },
  caption: caption || 'A lossless beam splitter (schematic): part of the light goes straight on, part is reflected. The reflected amplitude picks up a factor i, a quarter-turn of phase.',
});

export default lesson({
  id: 'math2270.LA-13.2',
  title: 'Unitary matrices',
  minutes: 13, difficulty: 3,
  intro: t`A square complex matrix is **unitary** when its conjugate transpose is its inverse — equivalently, its columns are orthonormal in the complex inner product. Then it keeps every inner product, and so every length:
$$U${H}U = I \quad\Longrightarrow\quad \langle U\mathbf u, U\mathbf v\rangle = \mathbf u${H}U${H}U\mathbf v = \langle\mathbf u, \mathbf v\rangle, \qquad \|U\psi\| = \|\psi\|$$
In quantum mechanics $\|\psi\|^2$ is the total probability, so **whatever happens to a state between measurements must be unitary** — probability can be moved between outcomes but never created or lost. That is why time evolution is $\psi(t) = U(t)\psi(0)$ with $U(t) = e^{-iHt/\hbar}$, which is unitary exactly because the energy matrix $H$ is Hermitian. The eigenvalues of a unitary matrix all lie on the unit circle, $\lambda = e^{i\theta}$. A real unitary matrix is an orthogonal one ($Q^{\mathsf T}Q = I$, LA-10.3), and the plane rotation of [LA-9.4](#/lesson/math2270.LA-9.4) is the simplest example: its eigenvalues $e^{\pm i\theta}$ sit on that circle.`,
  symbols: [
    { tex: 'U', text: t`a unitary $n\times n$ complex matrix` },
    { tex: t`U${H}`, text: t`its conjugate transpose ($U^\dagger$ in physics); for a unitary matrix it is also $U^{-1}$` },
    { tex: 'I', text: 'the identity matrix' },
    { tex: t`\langle\mathbf u, \mathbf v\rangle`, text: t`the complex inner product $\mathbf u${H}\mathbf v$ of LA-13.1` },
    { tex: t`\psi`, text: 'a quantum state: a unit vector whose squared components are probabilities' },
    { tex: t`H,\ \hbar`, text: t`the Hamiltonian (energy matrix, Hermitian) and the reduced Planck constant, $1.0546\times10^{-34}$ J s` },
    { tex: t`e^{-iHt/\hbar}`, text: t`the matrix exponential $\sum_k (-iHt/\hbar)^k/k!$, the time-evolution matrix $U(t)$` },
  ],
  why: 'Every gate in a quantum computer, every beam splitter in LIGO, and every tick of the evolution of a quantum state is a unitary matrix — the rule that keeps total probability equal to 1.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Turn a spin, keep its length',
    lead: t`A spin-½ state drawn on the Bloch sphere (gold). The unitary $U = e^{-i\alpha\,\sigma_n/2}$ turns it through the angle $\alpha$ about the violet axis — $z$ or $x$. The readouts give the probabilities of spin-up along $z$ and along $x$, the length of the state, and $\tfrac12\operatorname{tr}U$.`,
    tasks: [
      'Axis z: turn α. P(up along z) never changes — a z-turn only shifts the relative phase — while P(up along x) swings between its extremes.',
      'Axis x, start tilt 0°: at α = 180° spin-up has become spin-down. That is a π pulse, the NOT gate of a quantum computer.',
      'Take α to 360°: the arrow is back where it started, yet ½ tr U = −1 — the matrix is −I. Only at 720° is U = I again.',
    ],
    params: {
      range: 1.35,
      sliders: [
        { key: 'th', label: 'start tilt from +z', min: 0, max: 180, step: 5, value: 60, unit: t`^\circ`, explain: t`The starting state’s angle from spin-up along $z$ on the Bloch sphere.` },
        { key: 'al', label: t`turn $\alpha$`, min: 0, max: 720, step: 5, value: 90, unit: t`^\circ`, explain: t`The rotation angle of $U = e^{-i\alpha\sigma_n/2}$. On the Bloch sphere the arrow turns by $\alpha$; the state vector’s phases turn by $\alpha/2$.` },
      ],
      choices: [{ key: 'ax', label: 'Axis', options: [[0, 'z'], [1, 'x']], value: 0, explain: t`The axis $\mathbf n$ the spin is turned about: $z$ (a magnetic field along $z$) or $x$ (a resonant drive).` }],
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }],
      lines: [{ point: [0, 0, 0], dir: [0, 0, 1], t: [-1.3, 1.3], color: 'violet', when: '1 - ax' }, { point: [0, 0, 0], dir: [1, 0, 0], t: [-1.3, 1.3], color: 'violet', when: 'ax' }],
      curves: [
        { param: ['sin(th*pi/180)*cos(t)', 'sin(th*pi/180)*sin(t)', 'cos(th*pi/180)'], t: [0, 6.2832], color: 'gold', when: '1 - ax' },
        { param: ['sin(th*pi/180)', '-cos(th*pi/180)*sin(t)', 'cos(th*pi/180)*cos(t)'], t: [0, 6.2832], color: 'gold', when: 'ax' },
      ],
      points: [{ at: [0, 0, 1], label: '\\uparrow', color: 'accent' }, { at: [0, 0, -1], label: '\\downarrow', color: 'accent' }, { at: [1, 0, 0], label: '+x', color: 'warn' }],
      vectors: [
        { to: ['sin(th*pi/180)', 0, 'cos(th*pi/180)'], color: 'ink3', label: '\\psi_0' },
        { to: ['(1 - ax)*sin(th*pi/180)*cos(al*pi/180) + ax*sin(th*pi/180)', '(1 - ax)*sin(th*pi/180)*sin(al*pi/180) - ax*cos(th*pi/180)*sin(al*pi/180)', '(1 - ax)*cos(th*pi/180) + ax*cos(th*pi/180)*cos(al*pi/180)'], color: 'gold', label: 'U\\psi_0' },
      ],
      readouts: [
        { label: t`$P(\uparrow_z)$`, expr: '(1 + (1 - ax)*cos(th*pi/180) + ax*cos(th*pi/180)*cos(al*pi/180))/2', digits: 3 },
        { label: t`$P(+x)$`, expr: '(1 + (1 - ax)*sin(th*pi/180)*cos(al*pi/180) + ax*sin(th*pi/180))/2', digits: 3 },
        { label: t`$\|U\psi_0\|$`, expr: '1', digits: 3 },
        { label: t`$\tfrac12\operatorname{tr}U = \cos(\alpha/2)$`, expr: 'cos(al*pi/360)', digits: 3 },
      ],
    },
    caption: 'The Bloch sphere (three great circles): a picture of spin states, each point one state up to an overall phase. Grey: the starting state; gold: after the turn, with the circle it sweeps. Drag to rotate the view.',
  },
  example: {
    prompt: t`A resonant microwave drive acts on a spin with $H = \tfrac{\hbar\Omega}{2}\sigma_x$, where $\sigma_x = ${cmatTeX([[cx(0), cx(1)], [cx(1), cx(0)]])}$ and the Rabi frequency is $\Omega = 2\pi\times250$ kHz. Find $U(t) = e^{-iHt/\hbar}$, check that it is unitary, and find the probability that a spin starting up, $\psi(0) = (1, 0)$, is found down at $t = 0.5\ \mu\text{s}$.`,
    visual: bloch({ state: [0, -Math.SQRT1_2, Math.SQRT1_2], stateLabel: '\\psi(t)', marks: ['z'], axis: [1, 0, 0], path: { axis: [1, 0, 0], from: [0, 0, 1] }, caption: 'The drive turns the Bloch arrow about the x-axis (violet) at the rate Ω, from spin-up at the top down the gold circle. Shown at t = 0.5 μs, a turn of 45°. Drag to rotate.' }),
    steps: [
      { label: 'Exponential', text: t`Write $\varphi = \Omega t/2$, so $-iHt/\hbar = -i\varphi\,\sigma_x$. Since $\sigma_x^2 = I$, the series $\sum_k(-i\varphi\sigma_x)^k/k!$ splits into even powers (multiples of $I$) and odd powers (multiples of $\sigma_x$): $U = \cos\varphi\,I - i\sin\varphi\,\sigma_x = \begin{bmatrix} \cos\varphi & -i\sin\varphi \\ -i\sin\varphi & \cos\varphi \end{bmatrix}$.` },
      { label: 'Unitary', text: t`$U${H} = \begin{bmatrix} \cos\varphi & i\sin\varphi \\ i\sin\varphi & \cos\varphi \end{bmatrix}$, and $U${H}U$ has diagonal entries $\cos^2\varphi + \sin^2\varphi = 1$ and off-diagonal entries $-i\cos\varphi\sin\varphi + i\sin\varphi\cos\varphi = 0$. ✓ It is $I$.` },
      { label: 'Evolve', text: t`$\psi(t) = U(t)(1, 0) = (\cos\varphi,\ -i\sin\varphi)$, so $P(\text{down}) = |{-i}\sin\varphi|^2 = \sin^2(\Omega t/2)$ and $P(\text{up}) = \cos^2(\Omega t/2)$. They add to 1 at every instant — unitarity at work.` },
      { label: 'Numbers', text: t`$\Omega t/2 = \tfrac12(2\pi\times250\times10^3\ \text{s}^{-1})(0.5\times10^{-6}\ \text{s}) = \pi/8$, so $P(\text{down}) = \sin^2(\pi/8) = 0.146$.` },
      { label: 'Sense check', text: t`At $\Omega t = \pi$ ($t = 2\ \mu\text{s}$) the spin is fully flipped: a π pulse. At $\Omega t = 2\pi$ the probabilities are back where they began but $U = \cos\pi\,I = -I$: the state has changed sign. Only after $\Omega t = 4\pi$ is $U = I$ again.` },
    ],
    answer: t`$U = \cos(\Omega t/2)\,I - i\sin(\Omega t/2)\,\sigma_x$, unitary; $P(\text{down}) = \sin^2(\Omega t/2) = 0.146$ at $0.5\ \mu\text{s}$.`,
  },
  practice: [
    mcq({
      id: 'which-unitary', difficulty: 1,
      prompt: t`Which matrix is unitary?`,
      choices: [
        t`$${RS2}${cmatTeX([[cx(1), cx(0, 1)], [cx(0, 1), cx(1)]])}$`,
        t`$${cmatTeX([[cx(1), cx(0, 1)], [cx(0, 1), cx(1)]])}$`,
        t`$${RS2}${cmatTeX([[cx(1), cx(1)], [cx(1), cx(1)]])}$`,
        t`$${RS2}${cmatTeX([[cx(1), cx(0, 1)], [cx(0, -1), cx(1)]])}$`,
      ],
      answer: 0,
      why: {
        1: t`Its columns are orthogonal but have length $\sqrt2$: $U${H}U = 2I$. It doubles every probability.`,
        2: t`Its two columns are equal, so they cannot be orthogonal; it is not even invertible.`,
        3: t`This one is Hermitian, not unitary: $\langle\mathbf c_1, \mathbf c_2\rangle = \tfrac12(1\cdot i + \overline{(-i)}\cdot1) = i \ne 0$. Its eigenvalues are $0$ and $\sqrt2$, off the unit circle.`,
      },
      hints: [t`Unitary means the columns are orthonormal: each of length 1, and $\langle\mathbf c_1, \mathbf c_2\rangle = \bar c_{11}c_{12} + \bar c_{21}c_{22} = 0$.`],
      teach: 'A matrix is unitary exactly when its columns are orthonormal in the complex inner product.',
      explain: t`For the first matrix, each column has length $\sqrt{\tfrac12 + \tfrac12} = 1$, and $\langle\mathbf c_1, \mathbf c_2\rangle = \tfrac12(\bar1\cdot i + \bar i\cdot1) = \tfrac12(i - i) = 0$. It is the matrix of a 50:50 beam splitter.`,
    }),
    mcq({
      id: 'rotation', difficulty: 2,
      prompt: t`The rotation $R(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$ is real and orthogonal, so as a complex matrix it is unitary. For $0 < \theta < 180^\circ$ its eigenvectors are $\mathbf v_1 = ${RS2}(1, -i)$ (eigenvalue $e^{i\theta}$) and $\mathbf v_2 = ${RS2}(1, i)$ (eigenvalue $e^{-i\theta}$). What is true of them?`,
      choices: [
        t`They are orthonormal in $\mathbb C^2$: $\langle\mathbf v_1, \mathbf v_2\rangle = 0$ and each has length 1`,
        t`They are parallel: their dot product without conjugation, $\tfrac12\big(1\cdot1 + (-i)\cdot i\big)$, is 1`,
        t`They cannot be eigenvectors: a rotation turns every vector`,
        t`They are orthogonal only for $\theta = 90^\circ$`,
      ],
      answer: 0,
      why: {
        1: t`Without the conjugate the “dot product” is meaningless for complex vectors. With it, $\langle\mathbf v_1, \mathbf v_2\rangle = \tfrac12(\bar1\cdot1 + \overline{(-i)}\cdot i) = \tfrac12(1 + i^2) = 0$.`,
        2: t`A rotation turns every *real* vector. These complex vectors are only multiplied by $e^{\pm i\theta}$, a phase.`,
        3: t`The eigenvectors $(1, \mp i)$ do not depend on $\theta$ at all; they are orthogonal for every rotation.`,
      },
      hints: [t`Compute $\langle\mathbf v_1, \mathbf v_2\rangle = \bar v_{11}v_{21} + \bar v_{12}v_{22}$ — conjugate the first vector.`, t`$\overline{(-i)}\cdot i = i\cdot i = -1$.`],
      teach: 'A unitary matrix, like a Hermitian one, has orthonormal eigenvectors; its eigenvalues lie on the unit circle.',
      explain: t`$\langle\mathbf v_1, \mathbf v_2\rangle = \tfrac12(1 + i\cdot i) = 0$ and $\|\mathbf v_k\|^2 = \tfrac12(1 + 1) = 1$. In optics these are circular polarizations: a rotation of the polarizer axes only shifts their phases.`,
      visual: map2d([[`cos(th*pi/180)`, `-sin(th*pi/180)`], [`sin(th*pi/180)`, `cos(th*pi/180)`]], { shape: 'circle', view: 1.6, sliders: [{ key: 'th', label: t`$\theta$`, min: 0, max: 180, step: 5, value: 40, unit: t`^\circ`, explain: 'The rotation angle.' }], caption: 'R(θ) acting on the real plane: the unit circle goes to itself — lengths are kept — and no real direction survives.' }),
    }),
    num({
      id: 'rabi', difficulty: 2,
      gen(r) {
        let f, tm, P;
        for (let k = 0; k < 100; k++) {
          f = r.pick([100, 125, 200, 250, 400, 500]); tm = r.pick([0.3, 0.4, 0.6, 0.7, 0.8, 1.2, 1.5]);
          P = Math.sin(Math.PI * f * 1e3 * tm * 1e-6) ** 2;
          if (P > 0.05 && P < 0.95 && Math.abs(Math.sin(2 * Math.PI * f * 1e3 * tm * 1e-6) ** 2 - P) > 0.03) break;
        }
        const ph = Math.PI * f * 1e3 * tm * 1e-6;
        return {
          prompt: t`A spin starts up, $\psi(0) = (1, 0)$, and is driven with $H = \tfrac{\hbar\Omega}{2}\sigma_x$ at Rabi frequency $\Omega = 2\pi\times${f}$ kHz. Then $U(t) = \cos(\Omega t/2)\,I - i\sin(\Omega t/2)\,\sigma_x$. What is the probability of finding it down after $t = ${tm}\ \mu\text{s}$?`,
          answer: P, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: Math.sin(2 * ph) ** 2, feedback: t`That is $\sin^2(\Omega t)$. The matrix holds half-angles: $P(\text{down}) = \sin^2(\Omega t/2)$.` }, { value: Math.abs(Math.sin(ph)), feedback: t`That is the amplitude’s size $|\sin(\Omega t/2)|$; the probability is its square.` }].filter((e) => Math.abs(e.value - P) > 0.005),
          hints: [t`$U(t)(1, 0) = (\cos(\Omega t/2),\ -i\sin(\Omega t/2))$; the probability of down is $|\psi_2|^2$.`, t`$\Omega t/2 = \pi\times${f}\times10^{3}\times${tm}\times10^{-6} = ${nice(ph, 4)}$ rad.`],
          teach: t`A resonant drive moves probability between up and down as $\sin^2(\Omega t/2)$, always keeping the total at 1.`,
          explain: t`$\Omega t/2 = ${nice(ph, 4)}$ rad, so $P(\text{down}) = \sin^2(${nice(ph, 4)}) = ${nice(P, 3)}$ and $P(\text{up}) = ${nice(1 - P, 3)}$.`,
          visual: bloch({ state: [0, 0, 1], stateLabel: '\\psi(0)', marks: ['z'], axis: [1, 0, 0], path: { axis: [1, 0, 0], from: [0, 0, 1] }, caption: 'The drive turns the state about the x-axis (violet) along the gold circle, starting from spin-up. One full circle takes 2π/Ω. Drag to rotate.' }),
        };
      },
    }),
    num({
      id: 'beat', difficulty: 3,
      gen(r) {
        let w1, w2, tm, P;
        for (let k = 0; k < 200; k++) {
          w1 = r.int(1, 6); w2 = r.intExcept(1, 9, [w1]); tm = r.pick([0.2, 0.3, 0.4, 0.5, 0.7, 0.9]);
          P = Math.cos(((w2 - w1) * tm) / 2) ** 2;
          if (P > 0.05 && P < 0.95 && Math.abs(Math.cos(((w1 + w2) * tm) / 2) ** 2 - P) > 0.03) break;
        }
        const d = ((w2 - w1) * tm) / 2;
        return {
          prompt: t`In the energy basis, $U(t) = \begin{bmatrix} e^{-i\omega_1 t} & 0 \\ 0 & e^{-i\omega_2 t} \end{bmatrix}$ with $\omega_1 = ${w1}$ rad/μs and $\omega_2 = ${w2}$ rad/μs. The system starts in $\psi_0 = ${RS2}(1, 1)$. Find the probability $|\langle\psi_0, U(t)\psi_0\rangle|^2$ that it is still found in $\psi_0$ at $t = ${tm}\ \mu\text{s}$.`,
          answer: P, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: Math.cos(((w1 + w2) * tm) / 2) ** 2, feedback: t`Only the **difference** of the frequencies matters: $e^{-i\omega_1 t} + e^{-i\omega_2 t} = e^{-i\omega_1 t}\big(1 + e^{-i(\omega_2 - \omega_1)t}\big)$, and an overall phase drops out of $|\cdot|^2$.` }, { value: Math.abs(Math.cos(d)), feedback: 'That is the modulus of the amplitude; square it.' }].filter((e) => Math.abs(e.value - P) > 0.005),
          hints: [t`$\langle\psi_0, U\psi_0\rangle = \tfrac12\big(e^{-i\omega_1 t} + e^{-i\omega_2 t}\big)$.`, t`Factor out $e^{-i\omega_1 t}$ (modulus 1): $|\tfrac12(1 + e^{-i\Delta})|^2 = \cos^2(\Delta/2)$ with $\Delta = (\omega_2 - \omega_1)t$.`],
          teach: 'An overall phase is unobservable; only relative phases between components change probabilities.',
          explain: t`$|\langle\psi_0, U\psi_0\rangle|^2 = \cos^2\big((\omega_2 - \omega_1)t/2\big) = \cos^2(${nice(d, 4)}) = ${nice(P, 3)}$. The state precesses round the Bloch sphere at the rate $\omega_2 - \omega_1$ — a quantum beat, the principle of every atomic clock.`,
          visual: bloch({ state: [1, 0, 0], stateLabel: '\\psi_0', marks: ['z'], axis: [0, 0, 1], path: { axis: [0, 0, 1], from: [1, 0, 0] }, caption: 'A diagonal U turns the Bloch arrow about the z-axis (violet), along the gold equator from ψ₀. Drag to rotate.' }),
        };
      },
    }),
    num({
      id: 'bs-amplitude', difficulty: 2,
      gen(r) {
        const T = r.pick([0.5, 0.6, 0.64, 0.7, 0.8, 0.9, 0.36]), rr = Math.sqrt(1 - T);
        return {
          prompt: t`A lossless beam splitter transmits ${Math.round(T * 100)}% of the light power. Its matrix is $B = \begin{bmatrix} t & ir \\ ir & t \end{bmatrix}$ with $t, r \ge 0$ real. For $B$ to be unitary, what must the reflection amplitude $r$ be?`,
          answer: rr, tol: { rel: 0.004 },
          errors: [{ value: 1 - T, feedback: t`That is the reflected *power*, $r^2$. The matrix holds amplitudes: $r = \sqrt{1 - t^2}$.` }, { value: Math.sqrt(T), feedback: t`That is the transmission amplitude $t = \sqrt{${T}}$.` }].filter((e) => Math.abs(e.value - rr) > 0.005),
          hints: [t`Powers are squared amplitudes: $t^2 = ${T}$.`, t`A unit column needs $|t|^2 + |ir|^2 = t^2 + r^2 = 1$.`],
          teach: 'Unitarity of a beam splitter is energy conservation: the squared amplitudes of its outputs add to 1.',
          explain: t`$r = \sqrt{1 - ${T}} = ${nice(rr, 4)}$. Then the columns are orthogonal too: $\bar t\,(ir) + \overline{(ir)}\,t = irt - irt = 0$ — that is what the factor $i$ on reflection is for.`,
          visual: splitter(),
        };
      },
    }),
    num({
      id: 'eig-angle', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick(PAIRS), th = Math.atan2(q, p) / DEG;
        const U = [[cx(p), cx(0, q)], [cx(0, q), cx(p)]];
        const errors = [{ value: 90 - th, feedback: t`That angle is measured from the imaginary axis. $\theta$ is measured from the positive real axis: $\tan\theta = \operatorname{Im}\lambda/\operatorname{Re}\lambda$.` }];
        if (p < 0) errors.push({ value: Math.atan(q / p) / DEG, feedback: t`The real part is negative, so $\lambda$ is in the second quadrant: add $180^\circ$ to $\arctan(\operatorname{Im}/\operatorname{Re})$.` });
        return {
          prompt: t`$U = ${cmatTeX(U)}$ is unitary, with eigenvectors $(1, 1)$ and $(1, -1)$. Its eigenvalue for $(1, 1)$ is $\lambda = e^{i\theta}$. Find $\theta$ in degrees, between $0^\circ$ and $180^\circ$.`,
          answer: th, units: 'deg', tol: { rel: 0.003, abs: 0.2 }, errors: errors.filter((e) => Math.abs(e.value - th) > 0.5),
          hints: [t`$U(1, 1) = (${cTeX([p, q])},\ ${cTeX([p, q])})$, so $\lambda = ${cTeX([p, q])}$.`, t`$|\lambda| = 1$, and $\theta$ is its angle: $\theta = \operatorname{atan2}(${nice(q)}, ${nice(p)})$.`],
          teach: t`The eigenvalues of a unitary matrix are pure phases $e^{i\theta}$: they turn an eigenvector without stretching it.`,
          explain: t`$\lambda = ${cTeX([p, q])}$ has modulus $\sqrt{${nice(p * p)} + ${nice(q * q)}} = 1$ and angle $\theta = ${nice(th)}^\circ$. The other eigenvalue is its conjugate, $e^{-i\theta}$, for $(1, -1)$.`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.2, 1.2], aspect: 'wide', equal: true, xlabel: 'Re λ', ylabel: 'Im λ', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.8, label: '|λ| = 1', labelAt: 0.6, labelDx: 6, labelDy: -4 }] }, caption: 'The complex plane with the unit circle, where every eigenvalue of a unitary matrix lies.' },
        };
      },
    }),
    mcq({
      id: 'spin-720', difficulty: 3,
      prompt: t`Turning a spin-½ through an angle $\alpha$ about $z$ is $U(\alpha) = e^{-i\alpha\sigma_z/2} = \begin{bmatrix} e^{-i\alpha/2} & 0 \\ 0 & e^{i\alpha/2} \end{bmatrix}$. What is $U$ for one full turn, $\alpha = 360^\circ$?`,
      choices: [t`$-I$: every state is multiplied by $-1$`, t`$I$: a full turn changes nothing`, t`$\operatorname{diag}(-1, 1)$: only the up component changes sign`, t`$\sigma_z$`],
      answer: 0,
      why: {
        1: t`The Bloch arrow is back where it started, but the matrix is $\operatorname{diag}(e^{-i\pi}, e^{i\pi}) = \operatorname{diag}(-1, -1)$. A spin-½ needs two full turns to get back to $I$.`,
        2: t`$e^{i\pi} = -1$ too: both entries are $-1$.`,
        3: t`$\sigma_z = \operatorname{diag}(1, -1)$ is what you get at $\alpha = 180^\circ$, up to the factor $-i$.`,
      },
      hints: [t`Put $\alpha = 2\pi$: the entries are $e^{-i\pi}$ and $e^{i\pi}$.`, t`$e^{\pm i\pi} = \cos\pi \pm i\sin\pi = -1$.`],
      teach: 'A full turn multiplies a spin-½ state by −1: invisible on its own, since an overall phase does not change any probability, but measurable by interference.',
      explain: t`$U(360^\circ) = -I$. The overall sign cannot be seen in one beam, but it can be seen by splitting a beam, turning one half, and recombining: neutron interferometers did exactly that in 1975 (Rauch et al.; Werner et al.) and saw the interference flip after a $360^\circ$ turn and recover after $720^\circ$.`,
      visual: bloch({ state: [Math.sin(60 * DEG), 0, Math.cos(60 * DEG)], marks: ['z'], axis: [0, 0, 1], path: { axis: [0, 0, 1], from: [Math.sin(60 * DEG), 0, Math.cos(60 * DEG)] }, caption: 'Turning about z sweeps the Bloch arrow round the gold circle. After a full turn it is back where it began — yet the state vector has changed. Drag to rotate.' }),
    }),
    code({
      id: 'expm', difficulty: 3,
      prompt: t`Check numerically that a Hermitian Hamiltonian gives unitary evolution. With $\hbar = 1$, write \`U(t)\` returning $e^{-iHt}$ for the given \`H\` (use \`scipy.linalg.expm\`, the matrix exponential), and \`is_unitary(M)\`, true when $M${H}M = I$ to rounding. Then evolve \`psi0 = (1, 0)\` to $t = 1.2$ and set \`p_flip\` to the probability of finding the state $(0, 1)$.`,
      starter: t`import numpy as np
from scipy.linalg import expm

H = np.array([[1, 0.5 - 0.5j],
              [0.5 + 0.5j, -1]])      # Hermitian

def U(t):
    # exp(-i H t), with hbar = 1
    return np.eye(2, dtype=complex)

def is_unitary(M):
    # True when M^H M = I (to rounding)
    return False

psi0 = np.array([1, 0], dtype=complex)
p_flip = None
print(p_flip)
`,
      answer: t`import numpy as np
from scipy.linalg import expm

H = np.array([[1, 0.5 - 0.5j],
              [0.5 + 0.5j, -1]])      # Hermitian

def U(t):
    return expm(-1j * H * t)

def is_unitary(M):
    M = np.asarray(M)
    return np.allclose(M.conj().T @ M, np.eye(len(M)))

psi0 = np.array([1, 0], dtype=complex)
psi = U(1.2) @ psi0
p_flip = abs(psi[1])**2
print(p_flip)
`,
      tests: [
        { name: t`\`U(t)\` is $e^{-iHt}$`, code: 'np.allclose(U(0.5), expm(-0.5j * H))' },
        { name: t`\`U(t)\` is unitary at $t = 0.7$ and $t = 5$`, code: 'is_unitary(U(0.7)) and is_unitary(U(5.0))' },
        { name: t`\`is_unitary\` rejects $2I$ and $e^{-iN}$ for the non-Hermitian $N = \begin{bmatrix} 0 & 1 \\ 0 & 0 \end{bmatrix}$`, code: 'not is_unitary(2 * np.eye(2)) and not is_unitary(expm(-1j * np.array([[0, 1], [0, 0]])))' },
        { name: 'the evolved state keeps length 1', code: 'abs(np.linalg.norm(U(3.3) @ np.array([0.6, 0.8j])) - 1) < 1e-9' },
        { name: t`\`p_flip\` at $t = 1.2$ is right`, code: 'p_flip is not None and abs(p_flip - np.sin(np.sqrt(1.5) * 1.2)**2 / 3) < 1e-9' },
      ],
      hints: [t`\`expm(-1j * H * t)\` is the whole of \`U\`. For \`is_unitary\`, compare \`M.conj().T @ M\` with \`np.eye(2)\` using \`np.allclose\`.`, t`\`psi = U(1.2) @ psi0\`; the probability of $(0, 1)$ is \`abs(psi[1])**2\`.`],
      teach: t`If $H$ is Hermitian, $e^{-iHt}$ is unitary for every $t$; numerically, check $U${H}U$ against $I$ with a tolerance.`,
      explain: t`$H = \mathbf B\cdot\boldsymbol\sigma$ with $\mathbf B = (0.5, 0.5, 1)$, so the state precesses about $\mathbf B$ at the rate $2|\mathbf B| = 2\sqrt{1.5}$ and $P_{\text{flip}}(t) = \tfrac{B_x^2 + B_y^2}{|\mathbf B|^2}\sin^2(|\mathbf B|t) = \tfrac13\sin^2(\sqrt{1.5}\,t)$ — never more than $\tfrac13$, because the precession axis is tilted only partway. A non-Hermitian generator, like the $N$ in the tests, breaks unitarity: probability would not be conserved.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mz', difficulty: 3, transfer: true,
      gen(r) {
        let dL, P;
        for (let k = 0; k < 100; k++) {
          dL = r.int(1, 14) * 50; P = Math.sin((Math.PI * dL) / 1550) ** 2;
          if (P > 0.06 && P < 0.94) break;
        }
        const phi = (2 * Math.PI * dL) / 1550;
        const M = cmatmul(BS, cmatmul([[cx(1), cx(0)], [cx(0), cexp(phi)]], BS)), out = cmatvec(M, [cx(1), cx(0)]);
        const Pd1 = abs2(out[0]);
        return {
          prompt: t`A fibre-optic Mach–Zehnder strain sensor is bonded to the flexure of a rocket-engine thrust stand. Light of wavelength $\lambda = 1550$ nm enters the first input. Both beam splitters are $B = ${RS2}${cmatTeX([[cx(1), cx(0, 1)], [cx(0, 1), cx(1)]])}$, and between them the sensing arm (second component) is delayed by $\varphi = 2\pi\,\Delta L/\lambda$ relative to the reference arm, so the whole device is $M = B\,\operatorname{diag}(1, e^{i\varphi})\,B$. Under load the optical path difference is $\Delta L = ${dL}$ nm. What fraction of the light reaches detector D1, which reads the first output component?`,
          answer: Pd1, tol: { rel: 0.005, abs: 0.003 },
          errors: [{ value: 1 - Pd1, feedback: 'That is the fraction at the other detector, D2. Follow the first component of M(1, 0).' }, { value: Math.sin(phi) ** 2, feedback: t`That is $\sin^2\varphi$; the two arms interfere with half the phase: $\sin^2(\varphi/2)$.` }, { value: Math.abs(Math.sin(phi / 2)), feedback: 'That is the amplitude’s size; the fraction of light is its square.' }].filter((e) => Math.abs(e.value - Pd1) > 0.01),
          hints: [t`$B(1, 0) = ${RS2}(1, i)$; the delay makes it $${RS2}(1, ie^{i\varphi})$; apply $B$ again and take the first component.`, t`The first component is $\tfrac12(1 - e^{i\varphi})$, whose squared modulus is $\sin^2(\varphi/2)$.`],
          teach: 'An interferometer is a product of unitary matrices; its outputs share the light, and the phase difference decides the split.',
          explain: t`$\varphi = 2\pi\times${dL}/1550 = ${nice(phi, 4)}$ rad, and the first output amplitude is $\tfrac12(1 - e^{i\varphi})$, so D1 receives $\sin^2(\varphi/2) = ${nice(Pd1, 3)}$ of the light and D2 the remaining $${nice(1 - Pd1, 3)}$ — they always add to 1, because $M$ is unitary. LIGO’s detectors use the same mathematics with kilometre-long arms.`,
          visual: machZehnder({ caption: 'The interferometer, schematic and not to scale: beam splitters BS1 and BS2, two mirrors, and the delay φ in the sensing arm. The fibre version replaces the free-space arms with optical fibre.' }),
        };
      },
    }),
    num({
      id: 'cp-pi', difficulty: 2,
      gen(r) {
        const f = r.pick([0.5, 1, 2, 2.5, 4, 5]), tp = 1e3 / (2 * f);
        return {
          prompt: t`A qubit is driven with $H = \tfrac{\hbar\Omega}{2}\sigma_x$ at Rabi frequency $\Omega = 2\pi\times${f}$ MHz, so $P(\text{down}) = \sin^2(\Omega t/2)$ for a qubit starting up. How long must the pulse last to flip it from up to down with certainty (a π pulse), in nanoseconds?`,
          answer: tp, units: 'ns', tol: { rel: 0.005 },
          errors: [{ value: 2 * tp, feedback: t`That is a $2\pi$ pulse, $\Omega t = 2\pi$: it brings the qubit all the way back to up (times $-1$).` }, { value: tp / 2, feedback: t`That is a $\pi/2$ pulse: it leaves the qubit in an equal superposition, $P(\text{down}) = \tfrac12$.` }, { value: tp / Math.PI, feedback: t`Watch the $2\pi$ in $\Omega = 2\pi\times${f}$ MHz: solve $\Omega t = \pi$.` }],
          hints: [t`$\sin^2(\Omega t/2) = 1$ first when $\Omega t/2 = \pi/2$, that is $\Omega t = \pi$.`],
          teach: 'A π pulse turns the Bloch arrow through 180°: Ωt = π.',
          explain: t`$t = \pi/\Omega = \dfrac{1}{2\times${f}\ \text{MHz}} = ${nice(tp)}$ ns. Superconducting and trapped-ion quantum computers calibrate exactly this pulse as their NOT gate.`,
          visual: bloch({ state: [0, 0, 1], stateLabel: '\\psi(0)', marks: ['z'], axis: [1, 0, 0], path: { axis: [1, 0, 0], from: [0, 0, 1] }, caption: 'The drive turns the state about the x-axis (violet) along the gold circle, from spin-up towards spin-down. Drag to rotate.' }),
        };
      },
    }),
    mcq({
      id: 'cp-decay', difficulty: 2,
      prompt: t`An unstable state is sometimes modelled with a complex energy, $H = E - i\Gamma/2$ (a $1\times1$ matrix with $\Gamma > 0$, not Hermitian), so $\psi(t) = e^{-iHt/\hbar}\psi(0)$. What happens to $|\psi(t)|^2$?`,
      choices: [
        t`It decays as $e^{-\Gamma t/\hbar}$: the evolution is not unitary, and probability leaks away`,
        t`It stays 1: $e^{-iHt/\hbar}$ always has modulus 1`,
        t`It oscillates at the frequency $E/\hbar$`,
        t`It grows as $e^{\Gamma t/\hbar}$`,
      ],
      answer: 0,
      why: {
        1: t`$|e^{-ix}| = 1$ only for real $x$. Here the exponent is $-iEt/\hbar - \Gamma t/2\hbar$, and the real part shrinks the modulus.`,
        2: t`$E$ only turns the phase, which $|\psi|^2$ cannot see.`,
        3: t`Check the sign: $-i\cdot(-i\Gamma/2) = -\Gamma/2$, a decaying exponent.`,
      },
      hints: [t`Split the exponent: $-iHt/\hbar = -iEt/\hbar - \Gamma t/(2\hbar)$.`, t`$|e^{a + ib}| = e^{a}$.`],
      teach: 'Evolution is unitary exactly when the Hamiltonian is Hermitian; a non-Hermitian one gains or loses probability.',
      explain: t`$|\psi(t)|^2 = |e^{-iEt/\hbar}|^2 e^{-\Gamma t/\hbar}|\psi(0)|^2 = e^{-\Gamma t/\hbar}$: the exponential decay law, with lifetime $\hbar/\Gamma$. The probability has not vanished — it has gone into decay products that this one-state model leaves out. A complete description, including them, is unitary.`,
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), unitary matrices', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Nielsen & Chuang, Quantum Computation and Quantum Information, §2.1–2.2 and §4.2', url: 'https://doi.org/10.1017/CBO9780511976667' },
    { label: 'Werner, Colella, Overhauser & Eagen, Observation of the phase shift of a neutron due to precession in a magnetic field, PRL 35, 1053 (1975)', url: 'https://doi.org/10.1103/PhysRevLett.35.1053' },
  ],
});
