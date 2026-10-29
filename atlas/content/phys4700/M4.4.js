// Generalized statistical interpretation (Griffiths & Schroeter §3.4). Any
// observable Q̂: a measurement gives an eigenvalue q_n with probability
// |c_n|² = |⟨f_n|Ψ⟩|², or a value in [z, z + dz] with |c(z)|²dz for a
// continuous spectrum, and leaves the state in the eigenspace of the result.
// Position (|Ψ(x)|²) and momentum (|Φ(p)|²) are the two continuous cases.
// Worked: the δ-well's Φ(p) = √(2/π) p₀^{3/2}/(p² + p₀²), P(|p| > p₀) =
// 1/2 − 1/π. Explore: the infinite well's momentum distribution — the ground
// state's peaks at p = 0, not ±πħ/L. Practice: parity as a degenerate
// observable, Sₓ for spin 1, collapse after a position measurement.
// Transfer: the momentum spread of a trapped ²⁷Al⁺ clock ion. Every number is
// computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, U, C, curvePic, seg, label } from './_qm.js';
import { boxPic, boxFn, r6 } from './_wells.js';

const t = String.raw;
const M_AL27 = 26.981538408 * U;               // kg, aluminium-27 (AME2020)

/** |Φₙ(k)|² for the infinite well of width 1 nm, as a graph expression of x = k (nm⁻¹). */
const boxMom = (n) => `(1/pi)*(${n}*pi)^2*(2 - 2*cos(${n}*pi)*cos(x))/(((${n}*pi)^2 - x^2)^2)`;
/** The δ-well's momentum distribution in units of p₀: (2/π)/(1 + u²)². */
const deltaMom = '(2/pi)/(1 + x^2)^2';
const sq = (q) => (Number.isInteger(Math.sqrt(q)) ? String(Math.sqrt(q)) : `\\sqrt{${q}}`);
const deltaP = (u) => (2 / Math.PI) * (u / (1 + u * u) + Math.atan(u));     // P(|p| < u p₀)

/** Signed bars for the three components of a spin-1 state in the Sz basis. */
function spin1Bars(c, caption) {
  const cols = ['gold', 'accent', 'violet'];
  const lab = ['m = +1', 'm = 0', 'm = −1'];
  return {
    type: 'graph',
    params: {
      x: [0, 4], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'component along |1, m⟩ (z basis)', ylabel: 'amplitude', xticks: 0, yticks: 4, axesAt: 'edge',
      curves: [seg(0, 0, 4, 0, 'ink3', 1), ...c.map((v, k) => seg(k + 1, 0, k + 1, v, cols[k], 10))],
      points: c.map((v, k) => label(k + 1, v >= 0 ? v : 0, lab[k], cols[k], 0, -14, 'center')),
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M4.4',
  title: 'Generalized statistical interpretation',
  minutes: 16, difficulty: 3,
  intro: t`Born’s rule for position is one case of a rule for **every** observable. Expand the state in the eigenfunctions $f_n$ of the observable’s Hermitian operator $\hat Q$. A measurement of $Q$ gives one of the eigenvalues $q_n$, with probability equal to the squared size of that component; afterwards the state **is** that eigenfunction (or, for a degenerate eigenvalue, the state’s projection onto its eigenspace). For a continuous spectrum, sums become integrals and probabilities become densities:

$$\begin{gathered} P(q_n) = |c_n|^2 = |\langle f_n|\Psi\rangle|^2 \\ \Phi(p, t) = \frac{1}{\sqrt{2\pi\hbar}}\int e^{-ipx/\hbar}\,\Psi(x, t)\,dx \end{gathered}$$

$|\Phi(p, t)|^2dp$ is the probability that a momentum measurement gives a value in $[p, p + dp]$, exactly as $|\Psi(x, t)|^2dx$ is for position: $\Phi$ is the same state written in the momentum basis.`,
  symbols: [
    { tex: '\\hat Q', text: 'the Hermitian operator of the observable being measured' },
    { tex: 'f_n,\\ q_n', text: t`its orthonormal eigenfunctions and their eigenvalues: $\hat Qf_n = q_nf_n$` },
    { tex: 'c_n = \\langle f_n|\\Psi\\rangle', text: t`the component of the state along $f_n$; $\sum_n|c_n|^2 = 1$ because $\Psi$ is normalized` },
    { tex: '\\Phi(p, t)', text: t`the momentum-space wave function, in $(\text{kg m/s})^{-1/2}$: the components $\langle f_p|\Psi\rangle$ along the momentum eigenfunctions $f_p = e^{ipx/\hbar}/\sqrt{2\pi\hbar}$` },
    { tex: 'p', text: 'a possible momentum value, in kg m/s (any real number)' },
    { tex: '\\hbar', text: t`the reduced Planck constant, $${tex(HBAR, 5)}$ J s` },
  ],
  why: 'Every prediction quantum mechanics makes — spin, energy, momentum, position, parity — is this one recipe: components of the state along the eigenbasis of what you measure, squared.',
  visual: {
    type: 'graph',
    title: 'What momentum does a particle in a box have?',
    lead: t`The momentum distribution $|\Phi_n(p)|^2$ of the infinite well’s $n$th state, for a well $L = 1$ nm wide, plotted against $k = p/\hbar$. A classical particle bouncing between the walls would have only $k = \pm n\pi/L$ (dashed lines).`,
    tasks: [
      'Start at n = 1: the most likely result is k = 0, not ±π/L. The ground state is not “bouncing with momentum ±πħ/L”.',
      'Step n up to 8: two peaks grow near ±nπ/L, each about 2π/L wide — the classical picture returns only for large n.',
      'Every allowed k is possible, including values far outside the dashed lines: the momentum spectrum is continuous even though the energy spectrum is discrete.',
    ],
    params: {
      x: [-32, 32], y: [0, 0.14], aspect: 'wide', xlabel: 'k = p/ħ (nm⁻¹)', ylabel: '|Φ|² (nm)', xticks: 8, yticks: 3, axesAt: 'edge',
      sliders: [{ key: 'n', label: 'State $n$', min: 1, max: 8, step: 1, value: 1, explain: t`The well’s energy eigenstate $\psi_n = \sqrt{2/L}\sin(n\pi x/L)$, with energy $n^2\pi^2\hbar^2/2mL^2$.` }],
      curves: [{ fn: '(1/pi)*(n*pi)^2*(2 - 2*cos(n*pi)*cos(x))/(((n*pi)^2 - x^2)^2 + 1e-12)', color: 'accent', width: 2.4, samples: 3000 }],
      shade: [{ fn: '(1/pi)*(n*pi)^2*(2 - 2*cos(n*pi)*cos(x))/(((n*pi)^2 - x^2)^2 + 1e-12)', from: -32, to: 32, color: 'accent', alpha: 0.15 }],
      vlines: [{ x: 'n*pi', color: 'gold' }, { x: '-n*pi', color: 'gold' }],
      readouts: [
        { label: t`$\pm n\pi/L$ (nm⁻¹)`, expr: 'n*pi', digits: 3 },
        { label: t`$\langle p^2\rangle/\hbar^2 = (n\pi/L)^2$ (nm⁻²)`, expr: '(n*pi)^2', digits: 3 },
      ],
    },
    caption: t`Exact: $|\Phi_n|^2 = \dfrac{L}{\pi}\,\dfrac{(n\pi)^2\,[2 - 2(-1)^n\cos kL]}{[(n\pi)^2 - (kL)^2]^2}$ per unit $k$, whose area is 1. The dashed gold lines mark $k = \pm n\pi/L$. Although no single result has $p^2 = (n\pi\hbar/L)^2$ for certain, the **average** of $p^2$ is exactly that.`,
  },
  example: {
    prompt: t`A particle of mass $m$ sits in the bound state of the delta-function well $V = -\alpha\,\delta(x)$: $\psi(x) = \sqrt{\kappa}\,e^{-\kappa|x|}$ with $\kappa = m\alpha/\hbar^2$. Find its momentum-space wave function $\Phi(p)$, and the probability that a momentum measurement gives $|p| > p_0 \equiv \hbar\kappa$.`,
    visual: curvePic({ fn: deltaMom, x: [-4, 4], y: [0, 0.75], xlabel: 'p / p₀', ylabel: '|Φ|² (per p₀)', shade: null, curves: [], extra: { shade: [{ fn: deltaMom, from: -4, to: -1, color: 'gold', alpha: 0.45 }, { fn: deltaMom, from: 1, to: 4, color: 'gold', alpha: 0.45 }], xticks: 8, yticks: 3 }, caption: t`$|\Phi(p)|^2$ for the delta well’s bound state, with $|p| > p_0$ shaded. The tails fall as $1/p^4$ and run beyond the frame.` }),
    steps: [
      { label: 'Write the component', text: t`$\Phi(p) = \langle f_p|\psi\rangle = \dfrac{\sqrt\kappa}{\sqrt{2\pi\hbar}}\displaystyle\int_{-\infty}^{\infty}e^{-ipx/\hbar}e^{-\kappa|x|}\,dx$ — the generalized rule with $f_p = e^{ipx/\hbar}/\sqrt{2\pi\hbar}$.` },
      { label: 'Integrate', text: t`Split at $x = 0$: the two halves give $\dfrac{1}{\kappa + ip/\hbar} + \dfrac{1}{\kappa - ip/\hbar} = \dfrac{2\kappa}{\kappa^2 + p^2/\hbar^2}$. So $\Phi(p) = \sqrt{\dfrac{2}{\pi}}\,\dfrac{p_0^{3/2}}{p^2 + p_0^2}$, real and even.` },
      { label: 'Check normalization', text: t`With $u = p/p_0$: $\int|\Phi|^2dp = \tfrac{2}{\pi}\int\tfrac{du}{(1 + u^2)^2} = \tfrac{2}{\pi}\cdot\tfrac{\pi}{2} = 1$. ✓ Plancherel’s theorem guarantees it: the state is normalized in either basis.` },
      { label: 'The inside', text: t`$P(|p| < p_0) = \tfrac{2}{\pi}\displaystyle\int_{-1}^{1}\tfrac{du}{(1 + u^2)^2}$ $= \tfrac{2}{\pi}\Big[\tfrac{u}{2(1 + u^2)} + \tfrac{\arctan u}{2}\Big]_{-1}^{1}$ $= \tfrac{2}{\pi}\Big(\tfrac12 + \tfrac{\pi}{4}\Big)$.` },
      { label: 'Answer', text: t`$P(|p| > p_0) = 1 - \tfrac{1}{\pi} - \tfrac12 = ${fmt(1 - deltaP(1), 4)}$. A measurement gives a definite value of $p$ — never “$p$ is spread out” — and just under one time in five, that value lies beyond $\pm p_0$.` },
      { label: 'Sense check', text: t`$\langle p^2\rangle = \int p^2|\Phi|^2dp = p_0^2$, so $\langle p^2\rangle/2m = \hbar^2\kappa^2/2m = -E$: the kinetic energy is $|E|$ and the potential energy $2E$, as the virial theorem for a delta well demands.` },
    ],
    answer: t`$\Phi(p) = \sqrt{2/\pi}\,p_0^{3/2}/(p^2 + p_0^2)$ with $p_0 = m\alpha/\hbar$; $P(|p| > p_0) = \tfrac12 - \tfrac1\pi \approx ${fmt(1 - deltaP(1), 3)}$.`,
  },
  practice: [
    mcq({
      id: 'ground-p', difficulty: 2,
      prompt: t`An electron is in the ground state $\psi_1 = \sqrt{2/L}\sin(\pi x/L)$ of an infinite well. Its momentum is measured once. What can you say about the result?`,
      visual: boxPic({ L: 1, curves: [{ n: 1, label: 'ψ₁' }], caption: t`The ground state of a well 1 nm wide. It is a standing wave, $\sin kx = (e^{ikx} - e^{-ikx})/2i$ — but only inside the box.` }),
      choices: [
        t`Any real value is possible; values near $p = 0$ are the most likely`,
        t`Exactly $+\pi\hbar/L$ or $-\pi\hbar/L$, each with probability $\tfrac12$`,
        t`Exactly $p = 0$, since $\langle p\rangle = 0$`,
        t`It cannot be measured: $\psi_1$ is not a momentum eigenfunction`,
      ],
      answer: 0,
      why: {
        1: t`That would be true of $\sin kx$ on the whole line. Cut off at the walls, it contains every $k$; its momentum distribution has one peak, at zero.`,
        2: t`The average is zero, but the average is not a result. $\langle p^2\rangle = (\pi\hbar/L)^2 \ne 0$, so results scatter on both sides.`,
        3: t`Any state can be expanded in momentum eigenfunctions; a measurement then gives one of their eigenvalues.`,
      },
      hints: [t`The probabilities come from $\Phi(p) = \langle f_p|\psi_1\rangle$, a Fourier transform over the box only.`, 'Look at the Explore picture at n = 1.'],
      teach: 'A momentum measurement on a bound state can give any value, with probability density |Φ(p)|²; a standing wave in a box is not two momentum eigenstates.',
      explain: t`$|\Phi_1(p)|^2$ is a single broad peak centred on $p = 0$, about $2\pi\hbar/L$ wide. The “two travelling waves” picture holds only for large $n$, where two peaks near $\pm n\pi\hbar/L$ emerge.`,
    }),
    num({
      id: 'parity', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[1, 1, 1], [2, 1, 1], [1, 2, 1], [1, 1, 2], [3, 1, 1], [1, 3, 2], [2, 2, 1], [1, 2, 3]]);
        const N2 = a * a + b * b + c * c, ans = (a * a + c * c) / N2;
        const fn = `(${boxFn(1, 1, a)} + ${boxFn(2, 1, b)} + ${boxFn(3, 1, c)})/${r6(Math.sqrt(N2))}`;
        return {
          prompt: t`The parity operator $\hat\Pi$ reflects a function about the centre of an infinite well: $\hat\Pi\psi(x) = \psi(L - x)$. Its eigenvalues are $+1$ (states symmetric about the centre) and $-1$ (antisymmetric). A particle is in $\Psi = \tfrac{1}{${sq(N2)}}\big(${a === 1 ? '' : a}\psi_1 + ${b === 1 ? '' : b}\psi_2 + ${c === 1 ? '' : c}\psi_3\big)$. What is the probability that a parity measurement gives $+1$?`,
          visual: boxPic({ L: 1, curves: [{ fn, color: 'accent', label: 'Ψ' }], vlines: [{ x: 0.5, color: 'ink3', label: 'centre' }], y: [-2.6, 2.6], caption: t`The state in the question (a well 1 nm wide), with the centre marked. $\psi_1$ and $\psi_3$ are symmetric about it; $\psi_2$ is antisymmetric.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a * a / N2, feedback: t`$\psi_3$ is symmetric about the centre too: the eigenvalue $+1$ is degenerate, and its probability is the sum over every component in its eigenspace.` }, { value: b * b / N2, feedback: t`That is the probability of $-1$: $\psi_2$ is the antisymmetric one.` }, { value: (a + c) / (a + b + c), feedback: t`Probabilities are squared components, normalized: $|c_n|^2/\sum|c_k|^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Which of $\psi_1, \psi_2, \psi_3$ are eigenfunctions of $\hat\Pi$ with eigenvalue $+1$?`, t`Add the squared components of every eigenfunction with eigenvalue $+1$: $P(+1) = (|c_1|^2 + |c_3|^2)/\sum|c_n|^2$.`],
          teach: 'For a degenerate eigenvalue, the probability is the squared length of the state’s projection onto the whole eigenspace.',
          explain: t`$P(+1) = (${a * a} + ${c * c})/${N2} = ${fmt(ans, 4)}$ and $P(-1) = ${b * b}/${N2}$. After a result of $+1$, the state is the normalized projection $(${a === 1 ? '' : a}\psi_1 + ${c === 1 ? '' : c}\psi_3)/\sqrt{${a * a + c * c}}$, not $\psi_1$ or $\psi_3$ alone.`,
        };
      },
    }),
    num({
      id: 'delta-momentum', difficulty: 3,
      gen(r) {
        const u = r.pick([0.5, 2, 3, 0.25, 1.5]);
        const ans = deltaP(u);
        return {
          prompt: t`For the delta-well bound state of the worked example, $|\Phi(p)|^2 = \dfrac{2}{\pi}\dfrac{p_0^3}{(p^2 + p_0^2)^2}$. What is the probability that a momentum measurement gives $|p| < ${u}\,p_0$?`,
          visual: curvePic({ fn: deltaMom, x: [-4, 4], y: [0, 0.75], xlabel: 'p / p₀', ylabel: '|Φ|² (per p₀)', extra: { shade: [{ fn: deltaMom, from: -u, to: u, color: 'gold', alpha: 0.45 }], xticks: 8, yticks: 3 }, caption: t`The momentum distribution, with $|p| < ${u}\,p_0$ shaded.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: deltaP(u) / 2, feedback: t`Count both signs of $p$: integrate from $-${u}p_0$ to $+${u}p_0$.` }, { value: 1 - ans, feedback: 'That is the probability of the outside, |p| > u p₀.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`With $u = p/p_0$, $P = \tfrac{2}{\pi}\int_{-${u}}^{${u}}\tfrac{du}{(1 + u^2)^2}$.`, t`$\int\tfrac{du}{(1 + u^2)^2} = \tfrac{u}{2(1 + u^2)} + \tfrac12\arctan u$, so $P = \tfrac{2}{\pi}\Big[\tfrac{u}{1 + u^2} + \arctan u\Big]$ at $u = ${u}$.`],
          teach: 'For a continuous spectrum, a probability is the area under |Φ(p)|² over the range of results asked about.',
          explain: t`$P = \tfrac{2}{\pi}\big[\tfrac{${u}}{1 + ${u * u}} + \arctan ${u}\big] = ${fmt(ans, 4)}$. The $1/p^4$ tails are fat: even $|p| > 3p_0$ happens ${fmt(100 * (1 - deltaP(3)), 2)}% of the time, a sign of the kink in $\psi$ at the origin.`,
        };
      },
    }),
    num({
      id: 'spin1-x', difficulty: 3,
      gen(r) {
        const s = r.pick([[1, 1, 0], [2, 1, 0], [1, 2, 2], [0, 1, 1], [2, 0, 1], [1, 1, 1], [1, 2, 0], [2, 1, -2], [1, -1, 1]]);
        const N = Math.hypot(...s), [a, b, c] = s.map((v) => v / N);
        const P = { '+': (a + Math.SQRT2 * b + c) ** 2 / 4, 0: (a - c) ** 2 / 2, '-': (a - Math.SQRT2 * b + c) ** 2 / 4 };
        const opts = ['+', '0', '-'].filter((k) => P[k] > 0.03);
        const which = r.pick(opts), ans = P[which];
        const val = which === '+' ? t`+\hbar` : which === '-' ? t`-\hbar` : '0';
        const ket = s.map((v, k) => (v === 0 ? '' : t`${v < 0 ? '-' : '+'}${Math.abs(v) === 1 ? '' : Math.abs(v)}|${['1', '0', '{-1}'][k]}\rangle`)).join('').replace(/^\+/, '');
        return {
          prompt: t`A spin-1 particle is in the state $|\psi\rangle = \tfrac{1}{${sq(s.reduce((q, v) => q + v * v, 0))}}\big(${ket}\big)$, written in the eigenstates $|m\rangle$ of $\hat S_z$. The eigenvectors of $\hat S_x$ in that basis are $\tfrac12(1, \sqrt2, 1)$ for $+\hbar$, $\tfrac{1}{\sqrt2}(1, 0, -1)$ for $0$, and $\tfrac12(1, -\sqrt2, 1)$ for $-\hbar$. What is the probability that a measurement of $S_x$ gives $${val}$?`,
          visual: spin1Bars([a, b, c], t`The state’s components along the $S_z$ eigenstates. A measurement of $S_x$ needs its components along a different basis.`),
          answer: ans, tol: { rel: 0.005, abs: 1e-4 },
          errors: [{ value: [a, b, c][which === '+' ? 0 : which === '0' ? 1 : 2] ** 2, feedback: t`That is a component along an $S_z$ eigenstate. For $S_x$ you need $\langle f|\psi\rangle$ with $f$ the $S_x$ eigenvector.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$c = \langle f|\psi\rangle$: the dot product of the (real) $S_x$ eigenvector with the normalized components of $|\psi\rangle$.`, t`Square it: $P = |\langle f|\psi\rangle|^2$.`],
          teach: 'To predict a measurement, expand the state in the eigenbasis of the observable being measured — not in the basis it happens to be written in.',
          explain: t`The three probabilities are $${tex(P['+'], 3)}$, $${tex(P[0], 3)}$ and $${tex(P['-'], 3)}$ for $+\hbar$, $0$ and $-\hbar$; they add to 1. The one asked for is $${fmt(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'after-position', difficulty: 2,
      prompt: t`A particle is in the ground state $\psi_1$ of an infinite well. A precise position measurement finds it within a few picometres of $x = L/4$. Immediately afterwards its energy is measured. What results are possible?`,
      visual: boxPic({ L: 1, curves: [{ n: 1, color: 'ink3', dash: [5, 4] }, { fn: '6*exp(-(x - 0.25)^2/(2*0.0004))', color: 'accent' }], y: [-1, 6.6], extra: { legend: [{ label: 'ψ₁ before', color: 'ink3', dash: [5, 4] }, { label: 'just after', color: 'accent' }], legendAt: 'tr' }, ylabel: 'ψ (nm⁻½, scaled)', caption: 'The state before (dashed) and just after (a narrow spike) the position measurement. Schematic heights.' }),
      choices: [
        t`Many energies $E_n$, including very high ones: the spike is a superposition of many $\psi_n$`,
        t`Only $E_1$: the particle was in the ground state`,
        t`Only $E_1$ or $E_2$, the two lowest`,
        t`The energy at $x = L/4$, $E_1\sin^2(\pi/4)$`,
      ],
      answer: 0,
      why: {
        1: t`The position measurement changed the state. Afterwards $\psi$ is a narrow spike, and its components $c_n = \langle\psi_n|\text{spike}\rangle$ are spread over many $n$.`,
        2: t`A narrow spike needs many sine waves to build; the first two cannot make it.`,
        3: t`Energy measurements give eigenvalues $E_n$, not a local value of anything.`,
      },
      hints: ['What does a measurement do to the state?', t`Expand a narrow spike in $\psi_n = \sqrt{2/L}\sin(n\pi x/L)$: how many terms does it need?`],
      teach: 'A measurement leaves the state in an eigenstate of what was measured — and a position eigenstate is a superposition of very many energy eigenstates.',
      explain: t`For a spike of width $w$ at $x_0$, $|c_n|^2 \approx (2w/L)\sin^2(n\pi x_0/L)$ until $n$ approaches $L/w$: hundreds of levels share the probability. Measuring position *prepares* a state of very uncertain energy — the price of collapse onto a sharp position.`,
    }),
    mcq({
      id: 'phi-time', difficulty: 2,
      prompt: t`A free particle’s wave packet spreads as time passes: $|\Psi(x, t)|^2$ gets wider. What happens to its momentum distribution $|\Phi(p, t)|^2$?`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [0, 0.45], aspect: 'wide', xlabel: 'x (arbitrary units)', ylabel: '|Ψ|²', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/2)/sqrt(2*pi)', color: 'accent', width: 2.4 }, { fn: 'exp(-x^2/8)/sqrt(8*pi)', color: 'violet', width: 2.2, dash: [6, 4] }], legend: [{ label: 't = 0', color: 'accent' }, { label: 'later', color: 'violet', dash: [6, 4] }], legendAt: 'tr' }, caption: 'A free Gaussian packet now and later, in position. Schematic widths.' },
      choices: [
        t`It does not change: each momentum component only gains a phase $e^{-ip^2t/2m\hbar}$`,
        t`It narrows, so that $\sigma_x\sigma_p$ stays fixed`,
        t`It widens along with $|\Psi|^2$`,
        t`It shifts toward $p = 0$ as the packet slows down`,
      ],
      answer: 0,
      why: {
        1: t`The uncertainty principle is an inequality: $\sigma_x\sigma_p$ can grow, and for a spreading packet it does.`,
        2: t`Momentum is conserved for a free particle, so the probabilities of each momentum cannot change.`,
        3: t`With no force, $d\langle p\rangle/dt = 0$; nothing slows the packet.`,
      },
      hints: [t`The momentum eigenfunctions are also energy eigenfunctions of a free particle, with $E = p^2/2m$.`, t`$\Phi(p, t) = \Phi(p, 0)\,e^{-iEt/\hbar}$. What is its modulus?`],
      teach: 'For a free particle, momentum eigenstates are stationary states, so |Φ(p, t)|² is constant while |Ψ(x, t)|² spreads.',
      explain: t`$\Phi(p, t) = \Phi(p, 0)e^{-ip^2t/2m\hbar}$: a phase that differs from one $p$ to the next. In position space those phases reshuffle the interference and the packet spreads, but $|\Phi(p, t)|^2$ — the probability of each momentum — never changes.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-collapse', difficulty: 2,
      prompt: t`A particle in an infinite well is in $\Psi = \tfrac{1}{\sqrt6}(\psi_1 + \psi_2 + 2\psi_3)$. A parity measurement gives $+1$ (symmetric about the centre). What is the state immediately afterwards?`,
      visual: boxPic({ L: 1, curves: [{ fn: `(${boxFn(1, 1)} + ${boxFn(2, 1)} + ${boxFn(3, 1, 2)})/${r6(Math.sqrt(6))}`, color: 'accent', label: 'Ψ' }], vlines: [{ x: 0.5, color: 'ink3', label: 'centre' }], y: [-2.6, 2.6], caption: 'The state before the measurement, in a well 1 nm wide.' }),
      choices: [
        t`$\tfrac{1}{\sqrt5}(\psi_1 + 2\psi_3)$`,
        t`$\psi_3$, the largest symmetric component`,
        t`$\tfrac{1}{\sqrt6}(\psi_1 + 2\psi_3)$`,
        t`Unchanged: parity is not energy, so the energy components stay as they were`,
      ],
      answer: 0,
      why: {
        1: t`The eigenvalue $+1$ is degenerate: the measurement keeps every symmetric component, in its original proportion.`,
        2: t`Projected, but not renormalized: its length is $\sqrt{5/6}$, and a state must have length 1.`,
        3: t`A measurement of parity removes the antisymmetric component $\psi_2$, whatever basis you describe the state in.`,
      },
      hints: ['Project onto the eigenspace of the result, then normalize.', t`The symmetric part is $\tfrac{1}{\sqrt6}(\psi_1 + 2\psi_3)$; what is its length?`],
      teach: 'After a result with a degenerate eigenvalue, the state is the normalized projection onto that eigenspace.',
      explain: t`Projecting removes $\psi_2$ and leaves $\tfrac{1}{\sqrt6}(\psi_1 + 2\psi_3)$, of squared length $\tfrac56$; dividing by $\sqrt{5/6}$ gives $\tfrac{1}{\sqrt5}(\psi_1 + 2\psi_3)$. That outcome had probability $\tfrac56$.`,
    }),
    num({
      id: 'cp-ion-clock', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([1, 2, 3, 4, 5]);                   // MHz
        const w = 2 * Math.PI * f * 1e6, sv = Math.sqrt((HBAR * w) / (2 * M_AL27));
        const ans = sv * 100;                               // cm/s
        return {
          prompt: t`In an aluminium-ion optical clock — accurate enough to sense a height change of a few tens of centimetres through gravitational time dilation — a single $^{27}\text{Al}^+$ ion ($m = ${tex(M_AL27, 5)}$ kg) is cooled to the ground state of its trap, a harmonic well with $\omega/2\pi = ${f}$ MHz along the probe laser. The ground state’s momentum distribution is a Gaussian with $\sigma_p = \sqrt{m\hbar\omega/2}$. What is the spread $\sigma_v$ of its velocity along that axis, in cm/s?`,
          visual: curvePic({ fn: 'exp(-x^2/2)/sqrt(2*pi)', x: [-4, 4], y: [0, 0.45], xlabel: 'p / σₚ', ylabel: '|Φ|² (per σₚ)', extra: { xticks: 8, yticks: 3 }, caption: 'The oscillator ground state’s momentum distribution: a Gaussian centred on zero. Its width, in m/s, is what the question asks.' }),
          answer: ans, units: 'cm/s', tol: { rel: 0.01 },
          errors: [{ value: ans * Math.SQRT2, feedback: t`$\sigma_p^2 = m\hbar\omega/2$ has a factor $\tfrac12$: $\sigma_v = \sqrt{\hbar\omega/2m}$.` }, { value: ans / Math.sqrt(2 * Math.PI), feedback: t`Use the angular frequency $\omega = 2\pi f$.` }],
          hints: [t`$\sigma_v = \sigma_p/m = \sqrt{\hbar\omega/2m}$.`, t`$\omega = 2\pi\times${f}\times10^6\ \text{s}^{-1}$; convert m/s to cm/s.`],
          teach: 'Even in its motional ground state a trapped ion has a momentum spread, fixed by the shape of the ground-state wave function.',
          explain: t`$\sigma_v = \sqrt{\hbar\omega/2m} = ${fmt(sv, 3)}$ m/s $= ${fmt(ans, 3)}$ cm/s. From this axis alone the clock’s second-order Doppler shift is $\langle v^2\rangle/2c^2 \approx ${tex((sv * sv) / (2 * C * C), 2)}$ of its frequency — small beside the clock’s $10^{-18}$ uncertainty, and impossible to cool away, because it is the ground state’s own zero-point motion.`,
        };
      },
    }),
    mcq({
      id: 'cp-exact-value', difficulty: 2,
      prompt: t`For the delta-well state, what is the probability that a momentum measurement gives **exactly** $p = 0$?`,
      visual: curvePic({ fn: deltaMom, x: [-4, 4], y: [0, 0.75], xlabel: 'p / p₀', ylabel: '|Φ|² (per p₀)', extra: { xticks: 8, yticks: 3 }, caption: t`$|\Phi(p)|^2$ for the delta well’s bound state, highest at $p = 0$.` }),
      choices: [
        t`Zero: only ranges of $p$ have nonzero probability, $|\Phi|^2dp$`,
        t`$2/\pi$, the peak height`,
        t`$|\Phi(0)|^2\,p_0 = 2/\pi$`,
        t`The largest of any single value, because $|\Phi|^2$ peaks there`,
      ],
      answer: 0,
      why: {
        1: t`The peak height is a density: probability **per unit momentum**. Multiplied by a range of width zero it gives zero.`,
        2: t`Multiplying by $p_0$ assumes a window of width $p_0$, which no one asked about.`,
        3: t`The peak makes $p = 0$ the most probable **neighbourhood**, but any single exact value has probability zero.`,
      },
      hints: [t`$|\Phi(p)|^2$ has units of 1/momentum. What must multiply it to give a probability?`],
      teach: 'For a continuous spectrum, |Φ(p)|² is a probability density: only intervals of p carry probability.',
      explain: t`$P(p_a < p < p_b) = \int_{p_a}^{p_b}|\Phi|^2dp$, which vanishes as the interval shrinks to a point. Real instruments always resolve a window of momenta, and it is that window’s probability you compare with experiment.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.4', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Brewer et al., “²⁷Al⁺ quantum-logic clock with a systematic uncertainty below 10⁻¹⁸”, Phys. Rev. Lett. 123, 033201 (2019)', url: 'https://doi.org/10.1103/PhysRevLett.123.033201' },
    { label: 'AME2020 atomic mass evaluation', url: 'https://doi.org/10.1088/1674-1137/abddaf' },
  ],
});
