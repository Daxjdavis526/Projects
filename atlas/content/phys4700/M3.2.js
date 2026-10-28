// The infinite square well (Griffiths & Schroeter §2.2): the stationary
// states as an orthonormal, complete set, Fourier's trick for the cₙ, energy
// probabilities, ⟨H⟩ two ways, and the revival time h/E₁. phys2710.MP7.2 met
// the levels themselves (and a quantum dot's ground state); this lesson
// expands states in them. Checked here by quadrature: for Ax(L − x),
// cₙ = 8√15/(nπ)³ (odd n), P(E₁) = 960/π⁶ = 0.998 56, ⟨H⟩ = 5ħ²/mL²; for the
// tent, cₙ = 4√6 sin(nπ/2)/(nπ)², P(E₁) = 96/π⁴. Constants: CODATA 2022 via
// model/mp-schrodinger.js. CdSe values (bulk gap 1.74 eV, effective masses
// 0.13 and 0.45 mₑ) are those of phys2710.MP7.2.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { En, T0, H_EVFS, boxPic, boxFn, r6 } from './_wells.js';
import { HBARC_EVNM } from './_qm.js';

const t = String.raw;
const PI = Math.PI;
const HC = 2 * PI * HBARC_EVNM;                      // eV nm
const cPar = (n) => (n % 2 ? (8 * Math.sqrt(15)) / (n * PI) ** 3 : 0);
const cTent = (n) => (4 * Math.sqrt(6) * Math.sin((n * PI) / 2)) / (n * PI) ** 2;
const cHalf = (n) => (2 * (1 - Math.cos((n * PI) / 2))) / (n * PI);
const SUB = '₀₁₂₃₄₅₆₇₈₉';

export default lesson({
  id: 'phys4700.M3.2',
  title: 'The infinite square well',
  minutes: 16, difficulty: 3,
  intro: t`A particle between two impenetrable walls, $0 < x < L$, has stationary states $\psi_n(x) = \sqrt{2/L}\,\sin(n\pi x/L)$ with energies $E_n = n^2\pi^2\hbar^2/2mL^2$ ([the first look](#/lesson/phys2710.MP7.2) found these by fitting half-wavelengths). What makes them powerful is that they are **orthonormal** and **complete**: $\int_0^L\psi_m\psi_n\,dx = \delta_{mn}$, and every reasonable starting state is a sum of them. Multiply by $\psi_n$ and integrate — **Fourier’s trick** — to read off each coefficient:

$$c_n = \int_0^L \psi_n(x)\,\Psi(x, 0)\,dx, \qquad \Psi(x, t) = \sum_n c_n\,\psi_n(x)\,e^{-iE_nt/\hbar}$$`,
  symbols: [
    { tex: '\\psi_n(x)', text: t`the $n$-th stationary state, in $\text{m}^{-1/2}$; it has $n - 1$ nodes inside the well` },
    { tex: 'L', text: 'the width of the well, in metres (nm in the examples)' },
    { tex: 'n', text: t`the quantum number, $1, 2, 3, \dots$ ($n = 0$ would give $\psi = 0$, no particle at all)` },
    { tex: 'E_n', text: t`the energy of state $n$: $n^2$ times the ground-state energy $E_1 = \pi^2\hbar^2/2mL^2$` },
    { tex: 'c_n', text: t`how much of $\psi_n$ the state contains; $|c_n|^2$ is the probability of measuring $E_n$` },
    { tex: '\\Psi(x, 0)', text: 'the starting state, which may have any shape that vanishes at the walls' },
    { tex: '\\delta_{mn}', text: t`the Kronecker delta: 1 if $m = n$, 0 otherwise` },
  ],
  why: 'Expanding in a complete orthonormal set is the core move of quantum mechanics; the box is where it is exactly a Fourier sine series, and where every later expansion is rehearsed.',
  visual: {
    type: 'graph',
    title: 'Building a state from stationary states',
    lead: t`Pick a starting state (dashed) and add stationary states one at a time, each weighted by its Fourier coefficient $c_n$. The gold curve is the partial sum $\sum_{n\le N} c_n\psi_n$.`,
    tasks: [
      'Parabola: with N = 1 the sum is already almost indistinguishable — P(E₁) = 0.9986. The parabola is nearly a pure ground state.',
      'Tent: its corner needs more terms. Raise N and watch the corner sharpen as odd-n terms arrive; the even ones contribute nothing.',
      'Half box: the jump never quite fits. At N = 25 the partial sum still overshoots next to the jump by about 9% of the jump’s height (Gibbs’s phenomenon), though the mismatch in area keeps shrinking.',
    ],
    params: {
      x: [0, 1], y: [-0.5, 2.1], aspect: 'wide', xlabel: 'x / L', ylabel: 'Ψ(x, 0) (units of L⁻½)', axesAt: 'edge', xticks: 5, yticks: 5,
      choices: [{ key: 'f', label: 'Starting state', options: [[1, 'parabola $Ax(L - x)$'], [2, 'tent'], [3, 'half box']], value: 1, explain: 'Each is normalized; all vanish at the walls except the half box, which jumps at the centre.' }],
      sliders: [{ key: 'N', label: 'Terms $N$', min: 1, max: 25, step: 1, value: 1, explain: 'How many stationary states are added up.' }],
      curves: [
        { fn: 'sqrt(30)*x*(1 - x)', color: 'ink2', width: 2, dash: [6, 4], when: 'step(0.5 - abs(f - 1))' },
        { fn: 'sqrt(12)*min(x, 1 - x)', color: 'ink2', width: 2, dash: [6, 4], when: 'step(0.5 - abs(f - 2))' },
        { fn: 'sqrt(2)*step(0.5 - x)', color: 'ink2', width: 2, dash: [6, 4], when: 'step(0.5 - abs(f - 3))', samples: 2000 },
        { sum: '4*sqrt(15)*(1 - cos(k*pi))/(k*pi)^3*sqrt(2)*sin(k*pi*x)', k: [1, 'N'], color: 'gold', width: 2.6, when: 'step(0.5 - abs(f - 1))' },
        { sum: '4*sqrt(6)*sin(k*pi/2)/(k*pi)^2*sqrt(2)*sin(k*pi*x)', k: [1, 'N'], color: 'gold', width: 2.6, when: 'step(0.5 - abs(f - 2))' },
        { sum: '2*(1 - cos(k*pi/2))/(k*pi)*sqrt(2)*sin(k*pi*x)', k: [1, 'N'], color: 'gold', width: 2.6, when: 'step(0.5 - abs(f - 3))', samples: 2000 },
      ],
      legend: [{ label: 'starting state', color: 'ink2', dash: [6, 4] }, { label: 'sum of N stationary states', color: 'gold' }], legendAt: 'tr',
      readouts: [{ label: '$P(E_1) = |c_1|^2$', expr: `${r6(cPar(1) ** 2)}*step(0.5 - abs(f - 1)) + ${r6(cTent(1) ** 2)}*step(0.5 - abs(f - 2)) + ${r6(cHalf(1) ** 2)}*step(0.5 - abs(f - 3))`, digits: 4 }],
    },
    caption: t`Exact coefficients, drawn in units where $L = 1$. The half box is a legitimate state (its $|\Psi|^2$ integrates to 1), but its jump gives it an infinite mean energy.`,
  },
  example: {
    prompt: t`A particle in an infinite well starts in $\Psi(x, 0) = A\,x(L - x)$. Normalize it, find every $c_n$, the probability of measuring $E_1$, and $\langle H\rangle$.`,
    visual: boxPic({
      L: 1, y: [-0.3, 1.8], ylabel: 'Ψ(x, 0) (units of L⁻½)',
      curves: [{ fn: 'sqrt(30)*x*(1 - x)', color: 'gold', width: 2.6, label: 'A x(L − x)', labelAt: 0.62, labelDy: -14 }, { n: 1, color: 'accent', dash: [6, 4], label: 'ψ₁', labelAt: 0.15, labelDy: -16 }],
      caption: 'The parabola and the ground state, both normalized (L = 1). They almost coincide; the difference is made of ψ₃, ψ₅, … .',
    }),
    steps: [
      { label: 'Normalize', text: t`$1 = |A|^2\int_0^L x^2(L - x)^2\,dx = |A|^2\dfrac{L^5}{30}$, so $A = \sqrt{30/L^5}$.` },
      { label: 'Fourier’s trick', text: t`Multiply $\Psi(x, 0) = \sum c_m\psi_m$ by $\psi_n$ and integrate: orthonormality kills every term but $m = n$, leaving $c_n = \int_0^L\psi_n\Psi(x, 0)\,dx$.` },
      { label: 'Do the integral', text: t`$c_n = \sqrt{\tfrac2L}\sqrt{\tfrac{30}{L^5}}\int_0^L x(L - x)\sin\tfrac{n\pi x}{L}\,dx = \dfrac{4\sqrt{15}}{(n\pi)^3}\big(1 - \cos n\pi\big)$: $\dfrac{8\sqrt{15}}{(n\pi)^3}$ for odd $n$, and $0$ for even $n$.` },
      { label: 'Why the even ones vanish', text: t`The parabola is symmetric about $x = L/2$; every even-$n$ state is antisymmetric about it. Their product is odd about the centre and integrates to zero.` },
      { label: 'Probabilities', text: t`$P(E_1) = |c_1|^2 = 960/\pi^6 = ${fmt(cPar(1) ** 2, 5)}$; $P(E_3) = ${fmt(cPar(3) ** 2, 3)}$. Completeness checks it: $\sum|c_n|^2 = \tfrac{960}{\pi^6}\sum_{\text{odd}}\tfrac{1}{n^6} = \tfrac{960}{\pi^6}\cdot\tfrac{\pi^6}{960} = 1$.` },
      { label: 'Mean energy', text: t`Directly, $\langle H\rangle = \int\Psi^*\big(-\tfrac{\hbar^2}{2m}\Psi''\big)dx = \tfrac{\hbar^2}{2m}\cdot 2A^2\int_0^L x(L - x)\,dx = \dfrac{5\hbar^2}{mL^2}$. That is $\tfrac{10}{\pi^2} = ${fmt(10 / PI ** 2, 4)}$ times $E_1$: just above the ground state, as a state that is 99.86% ground state should be.` },
    ],
    answer: t`$A = \sqrt{30/L^5}$; $c_n = 8\sqrt{15}/(n\pi)^3$ for odd $n$, 0 for even; $P(E_1) = ${fmt(cPar(1) ** 2, 4)}$; $\langle H\rangle = 5\hbar^2/mL^2 = 1.013\,E_1$.`,
  },
  practice: [
    mcq({
      id: 'orthogonal', difficulty: 1,
      prompt: t`For the infinite well, what is $\displaystyle\int_0^L \psi_2(x)\,\psi_3(x)\,dx$?`,
      visual: boxPic({ L: 1, y: [-2.2, 2.2], ylabel: 'ψ₂ψ₃ (nm⁻¹)', curves: [{ fn: `(${boxFn(2, 1)})*(${boxFn(3, 1)})`, color: 'gold', width: 2.4 }], shade: [{ fn: `(${boxFn(2, 1)})*(${boxFn(3, 1)})`, from: 0, to: 1, color: 'gold', alpha: 0.3 }], caption: 'The product ψ₂ψ₃ across a 1 nm well. Shaded: the signed area the integral adds up.' }),
      choices: ['0', '1', t`$\tfrac12$`, t`$2/L$`],
      answer: 0,
      why: {
        1: t`The integral is 1 only for $m = n$: that is normalization, not this overlap.`,
        2: t`$\tfrac12$ would be the average of $\sin^2$; here two different sines multiply, and their product averages to zero.`,
        3: t`$2/L$ is the square of the normalization constant. The integral of a product of two different states has no leftover $L$.`,
      },
      hints: ['Look at the shaded areas above and below the axis.', t`$\sin a\sin b = \tfrac12[\cos(a - b) - \cos(a + b)]$; both cosines integrate to zero over the well.`],
      teach: 'Stationary states with different energies are orthogonal: their overlap integral is zero.',
      explain: t`$\tfrac{2}{L}\int_0^L\sin\tfrac{2\pi x}{L}\sin\tfrac{3\pi x}{L}dx = \tfrac1L\int_0^L\big[\cos\tfrac{\pi x}{L} - \cos\tfrac{5\pi x}{L}\big]dx = 0$. The areas cancel exactly. Together with $\int\psi_n^2 = 1$: $\int\psi_m\psi_n = \delta_{mn}$.`,
    }),
    num({
      id: 'half-box', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, 5, 6]);
        const ans = cHalf(n) ** 2;
        return {
          prompt: t`A particle starts spread evenly over the left half of an infinite well: $\Psi(x, 0) = \sqrt{2/L}$ for $0 < x < L/2$, and 0 elsewhere. What is the probability that a measurement of its energy gives $E_{${n}}$?`,
          visual: boxPic({ L: 1, y: [-1.7, 1.8], ylabel: 'ψ (units of L⁻½)', curves: [{ fn: 'sqrt(2)*step(0.5 - x)', color: 'gold', width: 2.6, label: 'Ψ(x, 0)', labelAt: 0.05, labelDy: -12 }, { n, color: 'accent', dash: [6, 4], label: `ψ${SUB[n]}`, labelAt: 0.62 + 0.3 / n, labelDy: 16 }], extra: { xlabel: 'x / L' }, caption: 'The starting state and the stationary state in question. Their overlap is the coefficient.' }),
          answer: ans, tol: { rel: 0.005, abs: 1e-4 },
          errors: [
            { value: Math.abs(cHalf(n)), feedback: t`That is $|c_${n}|$. The probability is its square.` },
            { value: (2 / (n * PI)) ** 2, feedback: t`The integral is over the left half only: $\int_0^{L/2}\sin\tfrac{n\pi x}{L}dx = \tfrac{L}{n\pi}\big(1 - \cos\tfrac{n\pi}{2}\big)$. Check the cosine at the half-way point.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$c_n = \int_0^{L/2}\sqrt{\tfrac2L}\sin\tfrac{n\pi x}{L}\cdot\sqrt{\tfrac2L}\,dx$.`, t`$c_n = \dfrac{2}{n\pi}\big(1 - \cos\tfrac{n\pi}{2}\big)$; square it.`],
          teach: t`Fourier’s trick: $c_n$ is the overlap of the starting state with $\psi_n$, and $P(E_n) = |c_n|^2$.`,
          explain: t`$c_${n} = \tfrac{2}{${n}\pi}\big(1 - \cos\tfrac{${n}\pi}{2}\big) = ${fmt(cHalf(n), 4)}$, so $P(E_${n}) = ${fmt(ans, 4)}$. Every fourth state ($n = 4, 8, \dots$) is missing entirely.`,
        };
      },
    }),
    num({
      id: 'parabola-pn', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 5, 7]);
        const ans = cPar(n) ** 2;
        return {
          prompt: t`A particle starts in $\Psi(x, 0) = \sqrt{30/L^5}\,x(L - x)$, whose coefficients are $c_n = 8\sqrt{15}/(n\pi)^3$ for odd $n$. What is the probability of measuring $E_{${n}}$? Give it to 3 significant figures.`,
          visual: boxPic({ L: 1, y: [-1.7, 1.8], ylabel: 'ψ (units of L⁻½)', curves: [{ fn: 'sqrt(30)*x*(1 - x)', color: 'gold', width: 2.6, label: 'Ψ(x, 0)', labelAt: 0.3, labelDy: -14 }, { n, color: 'accent', dash: [6, 4], label: `ψ${SUB[n]}`, labelAt: 0.88, labelDy: 18 }], extra: { xlabel: 'x / L' }, caption: 'The parabola is smooth and close to ψ₁, so it holds very little of the wigglier states.' }),
          answer: ans, tol: { rel: 0.005 }, sigfigs: 3,
          errors: [{ value: cPar(n), feedback: t`Square the coefficient: $P = |c_n|^2$.` }, { value: 960 / (n * PI) ** 3, feedback: t`$|c_n|^2 = 960/(n\pi)^6$: the sixth power, not the third.` }],
          hints: [t`$|c_n|^2 = \dfrac{64\times15}{(n\pi)^6}$.`, t`$(${n}\pi)^6 = ${tex((n * PI) ** 6, 4)}$.`],
          teach: t`Smooth starting states have coefficients that fall fast with $n$: here as $1/n^3$, so probabilities as $1/n^6$.`,
          explain: t`$P(E_${n}) = 960/(${n}\pi)^6 = ${tex(ans, 3)}$. The probabilities fall as $n^{-6}$, so nearly everything sits in $n = 1$.`,
        };
      },
    }),
    num({
      id: 'parabola-H', difficulty: 3,
      gen(r) {
        const L = r.pick([0.5, 1, 2, 5]);
        const E1 = En(1, L), ans = (10 / PI ** 2) * E1;
        return {
          prompt: t`An electron in an infinite well $L = ${L}$ nm wide starts in $\Psi(x, 0) = A\,x(L - x)$. What is $\langle H\rangle$, in eV? (For an electron, $\hbar^2/2m_e = ${fmt(T0, 5)}$ eV nm².)`,
          visual: boxPic({ L, y: [-0.4, r6(1.9 / Math.sqrt(L))], ylabel: 'Ψ(x, 0) (nm⁻½)', curves: [{ fn: `sqrt(30/${r6(L ** 5)})*x*(${r6(L)} - x)`, color: 'gold', width: 2.6 }], caption: 'The starting state. Inside the well its second derivative is a constant, −2A.' }),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [
            { value: E1, feedback: t`That is $E_1$. The state is 99.86% ground state, but the rest pushes $\langle H\rangle$ about 1.3% higher: $5\hbar^2/mL^2 = (10/\pi^2)E_1$.` },
            { value: ans / 2, feedback: t`$\hbar^2/m = 2\times(\hbar^2/2m)$: $\langle H\rangle = 5\hbar^2/mL^2 = 10\,(\hbar^2/2m)/L^2$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$\langle H\rangle = -\tfrac{\hbar^2}{2m}\int_0^L\Psi\,\Psi''\,dx$, with $\Psi'' = -2A$ and $A^2 = 30/L^5$.`, t`The integral gives $\langle H\rangle = 5\hbar^2/mL^2 = 10\times(\hbar^2/2m)/L^2$.`],
          teach: t`$\langle H\rangle$ can be computed directly as $\int\Psi^*\hat H\Psi\,dx$ or as $\sum|c_n|^2E_n$; the two must agree.`,
          explain: t`$\langle H\rangle = \tfrac{\hbar^2}{2m}\cdot2A^2\cdot\tfrac{L^3}{6} = \tfrac{5\hbar^2}{mL^2} = 10\times${fmt(T0, 4)}/${L}^2 = ${fmt(ans, 4)}$ eV, against $E_1 = ${fmt(E1, 4)}$ eV.`,
        };
      },
    }),
    mcq({
      id: 'even-zero', difficulty: 2,
      prompt: t`For the starting state $\Psi(x, 0) = A\,x(L - x)$, which energies can **never** be measured?`,
      visual: boxPic({ L: 1, y: [-1.7, 1.8], ylabel: 'ψ (units of L⁻½)', curves: [{ fn: 'sqrt(30)*x*(1 - x)', color: 'gold', width: 2.6, label: 'Ψ(x, 0)', labelAt: 0.3, labelDy: -14 }, { n: 2, color: 'accent', dash: [6, 4], label: 'ψ₂', labelAt: 0.75, labelDy: 18 }], vlines: [{ x: 0.5, color: 'ink3' }], extra: { xlabel: 'x / L' }, caption: 'The state and ψ₂, with the centre of the well marked.' }),
      choices: [t`$E_2, E_4, E_6, \dots$: the even-$n$ states are antisymmetric about the centre`, t`$E_3, E_5, E_7, \dots$: only the ground state fits a parabola`, t`None: every $c_n$ is nonzero for a state that is not an eigenstate`, t`All but $E_1$, since $\Psi(x, 0)$ has no nodes`],
      answer: 0,
      why: {
        1: t`$c_3 = 8\sqrt{15}/(3\pi)^3 \neq 0$: small, but present, so $E_3$ turns up 0.14% of the time.`,
        2: 'Symmetry can force coefficients to zero: here the overlap of a symmetric and an antisymmetric function vanishes.',
        3: 'Having no nodes does not make a state an eigenstate; it only means it overlaps strongly with ψ₁.',
      },
      hints: ['Is the parabola symmetric about x = L/2? Is ψ₂?', 'An odd function integrated over a symmetric interval gives zero.'],
      teach: 'Symmetry selects: a state symmetric about the centre has no component along antisymmetric stationary states.',
      explain: t`About $x = L/2$, $x(L - x)$ is even and $\sin(n\pi x/L)$ is odd for every even $n$. Their product integrates to zero, so $c_2 = c_4 = \dots = 0$, and those energies never appear.`,
    }),
    num({
      id: 'revival', difficulty: 2,
      gen(r) {
        const P = r.pick([{ name: 'an electron', m: 1, L: r.pick([0.5, 1, 2, 5]) }, { name: 'an electron', m: 1, L: 10 }, { name: 'a muon (mass 206.77 mₑ)', m: 206.768283, L: 0.05 }]);
        const E1 = En(1, P.L, P.m), ans = H_EVFS / E1;
        return {
          prompt: t`${P.name[0].toUpperCase() + P.name.slice(1)} in an infinite well $L = ${P.L}$ nm wide starts in any state at all. After what time does $\Psi$ return exactly to its starting form (the **revival time**), in fs? ($E_1 = ${fmt(E1, 4)}$ eV here; $h = ${fmt(H_EVFS, 6)}$ eV fs.)`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 26], aspect: 'wide', xlabel: 'time (in units of h/E₁)', ylabel: 'phase turns of each term', xticks: 4, yticks: 5, axesAt: 'edge', curves: [1, 4, 9, 16, 25].map((k, j) => ({ fn: `${k}*x`, color: ['accent', 'violet', 'teal', 'warn', 'good'][j], width: 2, label: `n = ${j + 1}`, labelAt: 0.88, labelDy: -10 })) }, caption: 'How many full turns the phase of each term has made: n² turns per h/E₁. Revival needs every one to be a whole number at once.' },
          answer: ans, units: 'fs', tol: { rel: 0.005 },
          errors: [{ value: ans / (2 * PI), feedback: t`Use $h$, not $\hbar$: a whole turn of $e^{-iE_1t/\hbar}$ takes $2\pi\hbar/E_1 = h/E_1$.` }, { value: H_EVFS / (3 * E1), feedback: t`That is the $\psi_1$–$\psi_2$ beat. A general state contains every $n$; all phases agree again only after $h/E_1$.` }],
          hints: [t`Each term carries $e^{-in^2E_1t/\hbar}$. When is $n^2E_1t/\hbar$ a multiple of $2\pi$ for every $n$ at once?`, t`At $t = 2\pi\hbar/E_1 = h/E_1$, each phase is $e^{-2\pi in^2} = 1$.`],
          teach: t`Because $E_n = n^2E_1$ are integer multiples of $E_1$, every state in the well revives after $h/E_1 = 4mL^2/\pi\hbar$.`,
          explain: t`$T_{\text{rev}} = h/E_1 = ${fmt(H_EVFS, 5)}/${fmt(E1, 4)} = ${fmt(ans, 3)}$ fs. Real wells are not perfectly square, so their levels are not exact multiples and revivals are only partial — but they are seen, in Rydberg atoms and molecular vibrations.`,
        };
      },
    }),
    code({
      id: 'fourier-code', difficulty: 3,
      prompt: t`Fourier’s trick by quadrature, with $L = 1$. Write \`coeffs(f, nmax)\`: sample \`f\` on the grid \`x\` given, normalize it, and return the array $c_1, \dots, c_{n_{\max}}$ with $c_n = \int_0^1\psi_n f\,dx$ (use \`np.trapezoid\`). Then write \`mean_energy(f, nmax)\`, which returns $\sum|c_n|^2E_n$ in units of $E_1$ (so $E_n = n^2$).`,
      starter: t`import numpy as np

x = np.linspace(0, 1, 20001)

def psi(n):
    return np.sqrt(2) * np.sin(n * np.pi * x)

def coeffs(f, nmax):
    pass

def mean_energy(f, nmax):
    pass

print(coeffs(x * (1 - x), 5))
`,
      answer: t`import numpy as np

x = np.linspace(0, 1, 20001)

def psi(n):
    return np.sqrt(2) * np.sin(n * np.pi * x)

def coeffs(f, nmax):
    f = f / np.sqrt(np.trapezoid(np.abs(f) ** 2, x))
    return np.array([np.trapezoid(psi(n) * f, x) for n in range(1, nmax + 1)])

def mean_energy(f, nmax):
    c = coeffs(f, nmax)
    n = np.arange(1, nmax + 1)
    return np.sum(np.abs(c) ** 2 * n ** 2)

print(coeffs(x * (1 - x), 5))`,
      tests: [
        { name: t`the parabola’s $c_1$ is $8\sqrt{15}/\pi^3$`, code: 'abs(coeffs(x * (1 - x), 3)[0] - 8 * np.sqrt(15) / np.pi**3) < 1e-6' },
        { name: 'its even coefficients vanish', code: 'np.allclose(coeffs(x * (1 - x), 6)[1::2], 0, atol=1e-9)' },
        { name: 'a pure ψ₃ gives c = (0, 0, 1, 0)', code: 'np.allclose(coeffs(np.sin(3 * np.pi * x), 4), [0, 0, 1, 0], atol=1e-6)' },
        { name: t`the probabilities of the tent add up to 1 (within $10^{-4}$ by $n = 60$)`, code: 'abs(np.sum(coeffs(np.minimum(x, 1 - x), 60) ** 2) - 1) < 1e-4' },
        { name: t`the parabola’s $\langle H\rangle$ is $10/\pi^2$ in units of $E_1$`, code: 'abs(mean_energy(x * (1 - x), 41) - 10 / np.pi**2) < 1e-5' },
      ],
      hints: ['Normalize first: divide f by √(∫|f|²dx).', 'A list comprehension over n = 1 … nmax of `np.trapezoid(psi(n) * f, x)` gives the coefficients.'],
      teach: 'Projecting onto each basis function with one integral gives every coefficient; their squares are the energy probabilities.',
      explain: t`The parabola gives $c_1 = 0.99964$, $c_3 = 0.0370$, … ; the sum $\sum n^2|c_n|^2$ converges to $10/\pi^2$ because $|c_n|^2 \propto n^{-6}$. Try the half box: there $|c_n|^2 \propto n^{-2}$, and $\sum n^2|c_n|^2$ grows without limit — its mean energy is infinite.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tent', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 3, 5]);
        const ans = cTent(n) ** 2;
        return {
          prompt: t`A particle starts in the tent $\Psi(x, 0) = \sqrt{12/L^3}\,\min(x,\ L - x)$, whose coefficients are $c_n = \dfrac{4\sqrt6\,\sin(n\pi/2)}{(n\pi)^2}$. What is the probability of measuring $E_{${n}}$?`,
          visual: boxPic({ L: 1, y: [-1.7, 1.9], ylabel: 'ψ (units of L⁻½)', curves: [{ fn: 'sqrt(12)*min(x, 1 - x)', color: 'gold', width: 2.6, label: 'Ψ(x, 0)', labelAt: 0.22, labelDy: -14 }, { n, color: 'accent', dash: [6, 4], label: `ψ${SUB[n]}`, labelAt: 0.88, labelDy: 18 }], extra: { xlabel: 'x / L' }, caption: 'The tent and the stationary state in question.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(cTent(n)), feedback: t`Square $c_n$ for the probability.` }, { value: 96 / (n * PI) ** 2, feedback: t`$|c_n|^2 = 96/(n\pi)^4$: square the whole denominator.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\sin^2(n\pi/2) = 1$ for odd $n$.`, t`$|c_n|^2 = 96/(n\pi)^4$.`],
          teach: t`A corner makes the coefficients fall more slowly ($1/n^2$) than a smooth shape ($1/n^3$).`,
          explain: t`$|c_${n}|^2 = 96/(${n}\pi)^4 = ${fmt(ans, 4)}$. The tent is $${fmt(cTent(1) ** 2 * 100, 3)}$% ground state, a little less than the smooth parabola’s 99.86%.`,
        };
      },
    }),
    mcq({
      id: 'cp-infinite-H', difficulty: 3,
      prompt: t`For the half-box state ($\Psi = \sqrt{2/L}$ on the left half, 0 on the right), $|c_n|^2$ falls only as $1/n^2$. What is its mean energy $\langle H\rangle = \sum|c_n|^2E_n$?`,
      visual: boxPic({ L: 1, y: [-0.5, 2.1], ylabel: 'Ψ (units of L⁻½)', curves: [{ fn: 'sqrt(2)*step(0.5 - x)', color: 'ink2', width: 2, dash: [6, 4] }, { sum: '2*(1 - cos(k*pi/2))/(k*pi)*sqrt(2)*sin(k*pi*x)', k: [1, 15], color: 'gold', width: 2.4, samples: 2000 }], extra: { xlabel: 'x / L' }, caption: 'The half box (dashed) and the sum of its first 15 stationary states.' }),
      choices: [
        t`Infinite: $|c_n|^2E_n$ tends to a constant times $E_1$ for the states that are present, so the sum diverges`,
        t`Zero, because $\Psi'' = 0$ wherever $\Psi$ is flat`,
        t`About $E_1$, since $P(E_1) \approx 0.4$ dominates`,
        t`$\tfrac12E_1$, the average over the half of the well the particle occupies`,
      ],
      answer: 0,
      why: {
        1: t`$\Psi''$ is zero on each side, but the jump at $L/2$ makes $\Psi'$ a step and $\Psi''$ a delta function there: the naive integral misses it.`,
        2: t`$P(E_1)$ is only 0.41, and the high-$n$ terms do not die away: every odd $n$ adds $4E_1/\pi^2$ to the sum, and there are infinitely many.`,
        3: t`Energies below $E_1$ do not exist in this well; $\langle H\rangle \ge E_1$ for every state.`,
      },
      hints: [t`$E_n = n^2E_1$. Multiply by $|c_n|^2 \sim 1/n^2$: what does each term tend to?`, 'Is the sum of a constant over infinitely many n finite?'],
      teach: 'A discontinuous state is allowed in Hilbert space, but its energy coefficients fall too slowly for a finite mean energy.',
      explain: t`$|c_n|^2E_n = \tfrac{4}{\pi^2}(1 - \cos\tfrac{n\pi}{2})^2E_1$ does not shrink as $n$ grows, so the sum diverges. A physical preparation would round the edge off, making $\langle H\rangle$ large but finite.`,
    }),
    num({
      id: 'cp-dot', difficulty: 3, transfer: true,
      gen(r) {
        const [lam, col] = r.pick([[470, 'blue'], [520, 'green'], [560, 'yellow-green'], [600, 'orange'], [620, 'red']]);
        const conf = HC / lam - 1.74;
        const ans = PI * Math.sqrt((T0 * (1 / 0.13 + 1 / 0.45)) / conf);
        return {
          prompt: t`Quantum-dot displays use CdSe nanocrystals whose colour is set by their size. In the simplest model, a dot of radius $R$ emits at the bulk gap, 1.74 eV, plus the ground-state confinement energies of the electron (effective mass $0.13\,m_e$) and the hole ($0.45\,m_e$), each $\hbar^2\pi^2/2mR^2$ — the infinite spherical well, whose ground state matches a box of width $R$. What radius makes a ${col} dot, emitting at ${lam} nm? ($hc = ${fmt(HC, 6)}$ eV nm, $\hbar^2/2m_e = ${fmt(T0, 5)}$ eV nm².)`,
          visual: { type: 'graph', params: { x: [1.5, 5], y: [1.7, 3], aspect: 'wide', xlabel: 'dot radius R (nm)', ylabel: 'photon energy (eV)', xticks: 7, yticks: 5, axesAt: 'edge', curves: [{ fn: `1.74 + ${r6(PI * PI * T0 * (1 / 0.13 + 1 / 0.45))}/x^2`, color: 'accent', width: 2.4, label: 'model', labelAt: 4.3, labelDy: -12 }], hlines: [{ y: 1.74, color: 'ink3', label: 'bulk CdSe gap' }] }, caption: 'The model’s emission energy against radius: smaller dots, bluer light. It ignores the electron–hole attraction and the finite walls, so real sizes differ by tens of percent.' },
          answer: ans, units: 'nm', tol: { rel: 0.01 },
          errors: [
            { value: PI * Math.sqrt((T0 / 0.13) / conf), feedback: 'Both carriers are confined: add the hole’s energy, with its own effective mass.' },
            { value: PI * Math.sqrt((T0 * (1 / 0.13 + 1 / 0.45)) / (HC / lam)), feedback: 'The confinement energy is the photon energy minus the bulk gap, 1.74 eV.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Confinement energy needed: $hc/\lambda - 1.74$ eV $= \dfrac{\hbar^2\pi^2}{2R^2}\Big(\dfrac{1}{m_e^*} + \dfrac{1}{m_h^*}\Big)$.`, t`$R = \pi\sqrt{\dfrac{(\hbar^2/2m_e)(1/0.13 + 1/0.45)}{hc/\lambda - 1.74\ \text{eV}}}$.`],
          teach: 'Confinement energy grows as 1/R², so the colour of a nanocrystal is tuned by its size alone.',
          explain: t`$hc/\lambda = ${fmt(HC / lam, 4)}$ eV, so the confinement must supply $${fmt(conf, 3)}$ eV. Then $R = \pi\sqrt{${fmt(T0, 4)}\times${fmt(1 / 0.13 + 1 / 0.45, 4)}/${fmt(conf, 3)}} = ${fmt(ans, 3)}$ nm — a crystal of a few thousand atoms. The trend (smaller is bluer) is robust; the exact size needs a better model.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §2.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Brus, “Electron–electron and electron–hole interactions in small semiconductor crystallites”, J. Chem. Phys. 80, 4403 (1984)', url: 'https://doi.org/10.1063/1.447218' },
  ],
});
