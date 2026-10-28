// Time evolution and the Heisenberg picture (Griffiths & Schroeter §3.5.3
// and Problem 3.40; Sakurai §2.2). Û(t) = e^{−iĤt/ħ} for a time-independent
// Ĥ; the Schrödinger picture moves the state, the Heisenberg picture moves the
// operators, Q̂_H(t) = Û†Q̂Û with dQ̂_H/dt = (i/ħ)[Ĥ, Q̂_H] + ∂Q̂/∂t; the
// generalized Ehrenfest theorem; conserved quantities commute with Ĥ.
// Worked: x̂_H(t) for the oscillator and the free particle (where
// [x̂_H(t), x̂_H(0)] = −iħt/m). Explore: a two-state system — ammonia's
// nitrogen tunnelling between two wells — with a bias. Transfer: the NBS
// ammonia clock (1949) and free-fall gravimetry. Every number is computed here.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, QE, r6 } from './_qm.js';

const t = String.raw;
const NU_NH3 = 23.870129e9;        // Hz, the ammonia (J, K) = (3, 3) inversion line used by the first atomic clock

/** Eigen-energies E± = ±(h/2)√(ν₀² + ν_b²) (in GHz × h) against the bias ν_b, with a marker at nb. */
function crossingPic(nu0, nb, caption) {
  return {
    type: 'graph',
    params: {
      x: [-80, 80], y: [-45, 45], aspect: 'wide', xlabel: 'bias between the wells (GHz × h)', ylabel: 'energy (GHz × h)', xticks: 8, yticks: 4, axesAt: 'edge',
      curves: [
        { fn: `sqrt(${nu0}^2 + x^2)/2`, color: 'accent', width: 2.4 }, { fn: `-sqrt(${nu0}^2 + x^2)/2`, color: 'violet', width: 2.4 },
        { fn: 'x/2', color: 'ink3', width: 1.2, dash: [5, 4] }, { fn: '-x/2', color: 'ink3', width: 1.2, dash: [5, 4] },
      ],
      vlines: [{ x: nb, color: 'gold' }],
    },
    caption,
  };
}

/** The oscillator's phase plane: the classical ellipse through (x₀, p₀/mω), with the start marked. */
function phasePic(x0, q0, caption) {
  const R = Math.hypot(x0, q0), M = Math.max(2.5, R * 1.25);
  return {
    type: 'graph',
    params: {
      x: [r6(-M), r6(M)], y: [r6(-M), r6(M)], aspect: 'wide', equal: true, xlabel: '⟨x⟩ (nm)', ylabel: '⟨p⟩/mω (nm)', xticks: 6, yticks: 4,
      curves: [{ param: [`${r6(R)}*cos(t)`, `${r6(R)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2, dash: [5, 4] }],
      points: [{ x: x0, y: q0, color: 'gold', label: 'start', r: 5 }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M4.7',
  title: 'Time evolution and the Heisenberg picture',
  minutes: 17, difficulty: 3,
  intro: t`For a Hamiltonian that does not change, the Schrödinger equation is solved once and for all by the **time-evolution operator** $\hat U(t) = e^{-i\hat Ht/\hbar}$: $|\Psi(t)\rangle = \hat U(t)|\Psi(0)\rangle$. It is unitary, so lengths and probabilities are preserved. Every prediction is an inner product like $\langle\Psi(t)|\hat Q|\Psi(t)\rangle$, so you may equally keep the state fixed and let the **operators** evolve — the **Heisenberg picture**:

$$\hat Q_H(t) = \hat U^\dagger\hat Q\,\hat U, \qquad \frac{d\hat Q_H}{dt} = \frac{i}{\hbar}\big[\hat H, \hat Q_H\big] + \Big(\frac{\partial\hat Q}{\partial t}\Big)_H$$

Taking the expectation value gives the generalized **Ehrenfest theorem**, $d\langle Q\rangle/dt = \tfrac{i}{\hbar}\langle[\hat H, \hat Q]\rangle + \langle\partial\hat Q/\partial t\rangle$: anything that commutes with $\hat H$ is conserved, and averages obey equations that look like Newton’s.`,
  symbols: [
    { tex: '\\hat U(t)', text: t`the time-evolution operator $e^{-i\hat Ht/\hbar}$: unitary, $\hat U^\dagger\hat U = \hat 1$` },
    { tex: '\\hat Q_H(t)', text: t`the Heisenberg-picture operator: the observable $\hat Q$ carried forward in time, while the state stays $|\Psi(0)\rangle$` },
    { tex: '\\hat H', text: 'the Hamiltonian, assumed independent of time' },
    { tex: '[\\hat H, \\hat Q_H]', text: t`the commutator $\hat H\hat Q_H - \hat Q_H\hat H$: zero for a conserved quantity` },
    { tex: '\\partial\\hat Q/\\partial t', text: t`any explicit time dependence written into the operator itself (zero for $\hat x$, $\hat p$, $\hat S_z$ …)` },
    { tex: '\\hbar', text: 'the reduced Planck constant, in J s' },
  ],
  why: 'Conservation laws, the classical limit and every quantum gate or clock transition are read off from commutators with the Hamiltonian.',
  visual: {
    type: 'graph',
    title: 'A two-state system: the ammonia molecule',
    lead: t`In ammonia the nitrogen atom can sit on either side of the plane of hydrogens: states $|L\rangle$ and $|R\rangle$. Tunnelling couples them, $\hat H = -A\big(|L\rangle\langle R| + |R\rangle\langle L|\big)$, and an electric field adds a bias between the sides. Start in $|L\rangle$: this is the probability of finding the nitrogen on the right.`,
    tasks: [
      'With no bias the nitrogen tunnels completely across and back, at ν₀ = 2A/h = 23.87 GHz — the molecule’s inversion frequency.',
      'Add a bias: the transfer becomes incomplete, ν₀²/(ν₀² + ν_b²) at most, and faster. Energy eigenstates no longer straddle both wells evenly.',
      'Halve ν₀: the flip takes twice as long. Nothing about the oscillation is put in by hand — it is e^{−iĤt/ħ} acting on |L⟩.',
    ],
    params: {
      x: [0, 100], y: [0, 1.1], aspect: 'wide', xlabel: 't (ps)', ylabel: 'P(nitrogen on the right)', xticks: 5, yticks: 2, axesAt: 'edge',
      sliders: [
        { key: 'nu', label: t`Inversion frequency $\nu_0 = 2A/h$`, min: 5, max: 40, step: 0.01, value: 23.87, unit: '\\text{GHz}', explain: t`The tunnelling splitting of the two lowest states, $2A$, in frequency units. Ammonia’s is about 23.87 GHz.` },
        { key: 'nb', label: t`Bias $\nu_b$`, min: 0, max: 60, step: 1, value: 0, unit: '\\text{GHz}', explain: t`The energy difference between nitrogen-left and nitrogen-right that an electric field adds, in frequency units.` },
      ],
      curves: [{ fn: 'nu^2/(nu^2 + nb^2)*sin(pi*sqrt(nu^2 + nb^2)*x/1000)^2', color: 'accent', width: 2.4, samples: 1500 }],
      hlines: [{ y: 'nu^2/(nu^2 + nb^2)', color: 'gold' }],
      readouts: [
        { label: t`peak transfer $\nu_0^2/(\nu_0^2 + \nu_b^2)$`, expr: 'nu^2/(nu^2 + nb^2)', digits: 3 },
        { label: 'time to the first peak (ps)', expr: '500/sqrt(nu^2 + nb^2)', digits: 3 },
      ],
    },
    caption: t`Exact for the two-state model $\hat H = -A\,\hat\sigma_x + \tfrac12h\nu_b\,\hat\sigma_z$ in the $|L\rangle, |R\rangle$ basis: $P_R(t) = \dfrac{\nu_0^2}{\nu_0^2 + \nu_b^2}\sin^2\!\big(\pi\sqrt{\nu_0^2 + \nu_b^2}\,t\big)$. A real molecule also rotates and vibrates; only the two lowest inversion states are kept.`,
  },
  example: {
    prompt: t`Find the Heisenberg-picture operators $\hat x_H(t)$ and $\hat p_H(t)$ for (a) the harmonic oscillator $\hat H = \hat p^2/2m + \tfrac12m\omega^2\hat x^2$ and (b) the free particle. What do they say about $\langle x\rangle$ and about how a free packet spreads?`,
    visual: phasePic(2, 1, t`For the oscillator, $(\langle x\rangle, \langle p\rangle/m\omega)$ turns clockwise round a circle at the angular frequency $\omega$ — exactly the classical motion.`),
    steps: [
      { label: 'Heisenberg equation', text: t`Differentiate $\hat Q_H = \hat U^\dagger\hat Q\hat U$ with $d\hat U/dt = -\tfrac{i}{\hbar}\hat H\hat U$ and $\hat U$ commuting with $\hat H$: $\dfrac{d\hat Q_H}{dt} = \dfrac{i}{\hbar}\hat U^\dagger[\hat H, \hat Q]\hat U = \dfrac{i}{\hbar}[\hat H, \hat Q_H]$.` },
      { label: 'Commutators', text: t`$[\hat H, \hat x] = \tfrac{1}{2m}[\hat p^2, \hat x] = -\tfrac{i\hbar}{m}\hat p$ and $[\hat H, \hat p] = \tfrac12m\omega^2[\hat x^2, \hat p] = i\hbar m\omega^2\hat x$. So $\dot{\hat x}_H = \hat p_H/m$ and $\dot{\hat p}_H = -m\omega^2\hat x_H$ — Hamilton’s equations, for operators.` },
      { label: 'Solve', text: t`$\hat x_H(t) = \hat x\cos\omega t + \dfrac{\hat p}{m\omega}\sin\omega t$ and $\hat p_H(t) = \hat p\cos\omega t - m\omega\,\hat x\sin\omega t$, with $\hat x$, $\hat p$ the operators at $t = 0$.` },
      { label: 'Ehrenfest', text: t`Take the expectation value in the fixed state: $\langle x\rangle(t) = \langle x\rangle_0\cos\omega t + \tfrac{\langle p\rangle_0}{m\omega}\sin\omega t$, the classical orbit of the picture. Exact, because the force $-m\omega^2x$ is linear in $x$.` },
      { label: 'Free particle', text: t`Now $[\hat H, \hat p] = 0$: $\hat p_H = \hat p$ (conserved) and $\hat x_H(t) = \hat x + \hat pt/m$. Then $\sigma_x^2(t) = \sigma_x^2(0) + \tfrac{t}{m}\big(\langle\hat x\hat p + \hat p\hat x\rangle - 2\langle x\rangle\langle p\rangle\big) + \tfrac{\sigma_p^2t^2}{m^2}$: the $t^2$ term is spreading, set by the momentum spread.` },
      { label: 'Positions at two times', text: t`$[\hat x_H(t), \hat x_H(0)] = \tfrac{t}{m}[\hat p, \hat x] = -\tfrac{i\hbar t}{m}$. Positions at different times do not commute, so $\sigma_{x(0)}\sigma_{x(t)} \ge \hbar t/2m$: pinning the packet down now guarantees a spread later.` },
    ],
    answer: t`Oscillator: $\hat x_H = \hat x\cos\omega t + (\hat p/m\omega)\sin\omega t$, $\hat p_H = \hat p\cos\omega t - m\omega\hat x\sin\omega t$, so $\langle x\rangle$ moves classically. Free: $\hat x_H = \hat x + \hat pt/m$, $\hat p_H = \hat p$, and $\sigma_x$ grows as $\sigma_pt/m$ at late times.`,
  },
  practice: [
    multi({
      id: 'conserved', difficulty: 2,
      prompt: t`A particle moves in a central potential, $\hat H = \hat p^2/2m + V(r)$. Which observables are conserved — that is, commute with $\hat H$? Select all.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [-1.2, 0.6], aspect: 'wide', xlabel: 'r (arbitrary units)', ylabel: 'V(r)', xticks: 5, yticks: 0, axesAt: 'edge', curves: [{ fn: '-1/x', color: 'accent', width: 2.4, domain: [0.6, 5] }] }, caption: 'A central potential: it depends only on the distance from the centre, the same in every direction. Schematic.' },
      choices: [t`$\hat H$`, t`$\hat L_z$`, t`$\hat L^2$`, t`$\hat p_x$`, t`$\hat x$`, t`$\hat p^2$`],
      answer: [0, 1, 2],
      why: {
        3: t`$[\hat H, \hat p_x] = i\hbar\,\partial V/\partial x \ne 0$: the central force changes the momentum.`,
        4: t`$[\hat H, \hat x] = -i\hbar\hat p_x/m$: the particle moves.`,
        5: t`$\hat p^2$ commutes with the kinetic energy but not with $V(r)$: kinetic energy trades with potential energy.`,
      },
      hints: [t`A rotation about any axis leaves $V(r)$ unchanged; what does that imply for $\hat L$?`, t`$[\hat H, \hat Q] = 0$ means $d\langle Q\rangle/dt = 0$ in every state.`],
      teach: 'An observable is conserved exactly when it commutes with the Hamiltonian; symmetries of H supply such observables.',
      explain: t`$\hat H$ commutes with itself; rotational symmetry makes every component of $\hat L$, and so $\hat L^2$, commute with $\hat H$. These are what label hydrogen’s states, $n$, $l$ and $m$, in the next module.`,
    }),
    num({
      id: 'flip-prob', difficulty: 2,
      gen(r) {
        const nu = r.pick([23.87, 22.69, 25.06, 20]), tps = r.pick([5, 8, 12, 15]);
        const ans = Math.sin(Math.PI * nu * tps / 1000) ** 2;
        return {
          prompt: t`A two-state system — the nitrogen in an ammonia-like molecule — has $\hat H = -A\big(|L\rangle\langle R| + |R\rangle\langle L|\big)$, with $2A/h = ${nu}$ GHz and no bias. It starts in $|L\rangle$. Then $|\Psi(t)\rangle = \cos(At/\hbar)|L\rangle + i\sin(At/\hbar)|R\rangle$. What is the probability of finding it in $|R\rangle$ after $${tps}$ ps?`,
          visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'double', L: 2, V0: 0.6, w: 0.3, n: 1, show: 'psi', controls: false, readout: false, top: 2, panels: ['energy'], hide: ['energy'] }, caption: 'A symmetric double well with its two lowest levels, split by tunnelling. A schematic stand-in for ammonia’s inversion potential, not its true shape or scale.' },
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: Math.sin(2 * Math.PI * nu * tps / 1000) ** 2, feedback: t`$A/\hbar = \pi\nu_0$, not $2\pi\nu_0$: the splitting $2A$ corresponds to $\nu_0$.` }, { value: Math.sin(Math.PI * nu * tps / 1000), feedback: 'Square the amplitude.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$A/\hbar = \tfrac12\cdot2\pi\nu_0 = \pi\nu_0$.`, t`$P_R = \sin^2(\pi\nu_0t)$ with $\nu_0$ in GHz and $t$ in ns.`],
          teach: 'Two degenerate states coupled by A oscillate completely between each other at the frequency 2A/h.',
          explain: t`$P_R = \sin^2(\pi\times${nu}\times${tps / 1000}) = ${fmt(ans, 3)}$. The full flip takes $1/2\nu_0 = ${fmt(500 / nu, 3)}$ ps. The energy eigenstates are $(|L\rangle \pm |R\rangle)/\sqrt2$; $|L\rangle$ is their sum, and the beat between their phases moves the nitrogen.`,
        };
      },
    }),
    num({
      id: 'ho-heisenberg', difficulty: 2,
      gen(r) {
        const [x0, q0] = r.pick([[2, 1], [1, 2], [2, -1], [-1, 2], [1.5, 0.5], [0, 2]]);
        const wt = r.pick([30, 60, 90, 120, 150]);
        const ans = x0 * Math.cos(wt * Math.PI / 180) + q0 * Math.sin(wt * Math.PI / 180);
        return {
          prompt: t`An electron in a harmonic trap starts with $\langle x\rangle_0 = ${x0}$ nm and $\langle p\rangle_0/m\omega = ${q0}$ nm. Using $\hat x_H(t) = \hat x\cos\omega t + (\hat p/m\omega)\sin\omega t$, what is $\langle x\rangle$, in nm, when $\omega t = ${wt}^\circ$?`,
          visual: phasePic(x0, q0, 'The starting point in the phase plane and the circle the averages follow. Not marked: where it is at the time asked.'),
          answer: ans, units: 'nm', tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: x0 * Math.cos(wt * Math.PI / 180) - q0 * Math.sin(wt * Math.PI / 180), feedback: t`$\hat x_H$ gains $+(\hat p/m\omega)\sin\omega t$: a positive momentum carries $x$ forward.` }, { value: x0 * Math.cos(wt * Math.PI / 180), feedback: t`Include the momentum term $(\langle p\rangle_0/m\omega)\sin\omega t$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`The state is fixed, so $\langle x\rangle(t) = \langle x\rangle_0\cos\omega t + \tfrac{\langle p\rangle_0}{m\omega}\sin\omega t$.`, t`$\cos ${wt}^\circ = ${fmt(Math.cos(wt * Math.PI / 180), 4)}$, $\sin ${wt}^\circ = ${fmt(Math.sin(wt * Math.PI / 180), 4)}$.`],
          teach: 'In the Heisenberg picture the oscillator’s operators rotate in phase space, and so do their averages — exactly as a classical oscillator moves.',
          explain: t`$\langle x\rangle = ${x0}\cos ${wt}^\circ + ${q0}\sin ${wt}^\circ = ${fmt(ans, 4)}$ nm, whatever the shape of the wave packet: for a quadratic potential Ehrenfest’s theorem is exact.`,
        };
      },
    }),
    mcq({
      id: 'quartic', difficulty: 3,
      prompt: t`In the potential $V = \lambda x^4$, a broad wave packet sits off-centre. Does its average position obey Newton’s law with the force evaluated at the average, $m\,d^2\langle x\rangle/dt^2 = -4\lambda\langle x\rangle^3$?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [0, 4.2], aspect: 'wide', xlabel: 'x', ylabel: 'V, |ψ|²', xticks: 4, yticks: 0, axesAt: 'edge', curves: [{ fn: 'x^4', color: 'ink2', width: 2 }, { fn: '2.4*exp(-(x - 0.9)^2/(2*0.16))', color: 'accent', width: 2.2 }], vlines: [{ x: 0.9, color: 'gold', label: '⟨x⟩' }] }, caption: 'A quartic well and a wide packet (scaled), with its average position marked. Schematic.' },
      choices: [
        t`No: Ehrenfest gives $m\,d^2\langle x\rangle/dt^2 = -4\lambda\langle x^3\rangle$, and $\langle x^3\rangle \ne \langle x\rangle^3$ for a spread-out packet`,
        t`Yes: Ehrenfest’s theorem says expectation values obey classical mechanics`,
        t`Yes, but only if the packet is a Gaussian`,
        t`No: in the Heisenberg picture there is no force at all`,
      ],
      answer: 0,
      why: {
        1: t`Ehrenfest’s theorem is $d\langle p\rangle/dt = -\langle V'(x)\rangle$ — the **average force**, not the force at the average.`,
        2: t`A Gaussian centred at $x_0$ with width $\sigma$ has $\langle x^3\rangle = x_0^3 + 3x_0\sigma^2$, still not $x_0^3$.`,
        3: t`$\dot{\hat p}_H = \tfrac{i}{\hbar}[\hat H, \hat p_H] = -V'(\hat x_H)$: the force operator is right there.`,
      },
      hints: [t`Compute $[\hat H, \hat p]$ for $V = \lambda x^4$.`, t`Is the average of $x^3$ the cube of the average of $x$?`],
      teach: 'Averages follow the average force, ⟨−V′(x)⟩; that equals the classical force at ⟨x⟩ only when V′ is linear, or when the packet is much narrower than the scale on which the force changes.',
      explain: t`$\dot{\hat p}_H = -4\lambda\hat x_H^3$, so $d\langle p\rangle/dt = -4\lambda\langle x^3\rangle$. For a packet of width $\sigma$ about $x_0$ this is $-4\lambda(x_0^3 + 3x_0\sigma^2)$: the extra term is purely quantum (a spread), and it vanishes in the classical limit of narrow packets.`,
    }),
    mcq({
      id: 'two-times', difficulty: 3,
      prompt: t`For a free particle, $\hat x_H(t) = \hat x + \hat pt/m$. What is the commutator $[\hat x_H(t), \hat x_H(0)]$, and what does it imply?`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [0, 0.45], aspect: 'wide', xlabel: 'x (arbitrary units)', ylabel: '|Ψ|²', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/(2*0.36))/sqrt(2*pi*0.36)*0.55', color: 'accent', width: 2.4 }, { fn: 'exp(-x^2/(2*4))/sqrt(8*pi)', color: 'violet', width: 2.2, dash: [6, 4] }], legend: [{ label: 'now: narrow', color: 'accent' }, { label: 'later: wide', color: 'violet', dash: [6, 4] }], legendAt: 'tr' }, caption: 'A packet squeezed now spreads later. Schematic heights.' },
      choices: [
        t`$-i\hbar t/m$: positions at different times are incompatible, so $\sigma_{x(0)}\,\sigma_{x(t)} \ge \hbar t/2m$`,
        t`$0$: position commutes with itself`,
        t`$i\hbar$, the same as $[\hat x, \hat p]$`,
        t`$-i\hbar t/m$, which matters only for relativistic particles`,
      ],
      answer: 0,
      why: {
        1: t`$\hat x_H(t)$ contains $\hat p$, which does not commute with $\hat x$. At different times, "position" is a different operator.`,
        2: t`The $\hat x$ parts commute; only $[\hat pt/m, \hat x] = -i\hbar t/m$ survives, and it grows with $t$.`,
        3: t`Nothing relativistic entered: $\hat H = \hat p^2/2m$.`,
      },
      hints: [t`$[\hat x + \hat pt/m, \hat x] = \tfrac{t}{m}[\hat p, \hat x]$.`, t`Then apply Robertson’s inequality to $\hat x_H(0)$ and $\hat x_H(t)$.`],
      teach: 'In the Heisenberg picture the same observable at two times can fail to commute — which is the spreading of a free packet in another guise.',
      explain: t`$[\hat x_H(t), \hat x_H(0)] = \tfrac{t}{m}[\hat p, \hat x] = -i\hbar t/m$, a multiple of the identity. Robertson then gives $\sigma_{x(0)}\sigma_{x(t)} \ge \hbar t/2m$: the narrower the packet now, the wider it must be at time $t$.`,
    }),
    num({
      id: 'detuned', difficulty: 3,
      gen(r) {
        const nu = r.pick([20, 24, 30]), nb = r.pick([10, 20, 30, 40]);
        const ans = (nu * nu) / (nu * nu + nb * nb);
        return {
          prompt: t`The two-state system now has a bias: $\hat H = -A\,\hat\sigma_x + \tfrac12h\nu_b\,\hat\sigma_z$ in the $|L\rangle, |R\rangle$ basis, with $2A/h = ${nu}$ GHz and $\nu_b = ${nb}$ GHz. Starting from $|L\rangle$, what is the **largest** probability of ever finding it in $|R\rangle$?`,
          visual: crossingPic(nu, nb, t`The two energy levels against the bias: an avoided crossing of minimum gap $h\nu_0$. The dashed lines are the uncoupled energies of $|L\rangle$ and $|R\rangle$; gold marks the bias in the question.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: nu / Math.sqrt(nu * nu + nb * nb), feedback: t`That is an amplitude; the probability is its square, $\nu_0^2/(\nu_0^2 + \nu_b^2)$.` }, { value: 1, feedback: 'With a bias the transfer is incomplete: the energy eigenstates no longer split |L⟩ evenly.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Write $\hat H = \tfrac{h}{2}(-\nu_0\hat\sigma_x + \nu_b\hat\sigma_z)$: a spin in a “field” pointing at an angle $\theta$ from $-x$ toward $z$, with $\tan\theta = \nu_b/\nu_0$.`, t`$P_R(t) = \dfrac{\nu_0^2}{\nu_0^2 + \nu_b^2}\sin^2\!\big(\pi\sqrt{\nu_0^2 + \nu_b^2}\,t\big)$.`],
          teach: 'A bias between two coupled states caps the transfer at ν₀²/(ν₀² + ν_b²) and speeds the oscillation to √(ν₀² + ν_b²).',
          explain: t`$P_{\max} = ${nu}^2/(${nu}^2 + ${nb}^2) = ${fmt(ans, 4)}$, reached every $1/\sqrt{\nu_0^2 + \nu_b^2} = ${fmt(1000 / Math.sqrt(nu * nu + nb * nb), 3)}$ ps. The same formula (Rabi’s) governs a spin driven off resonance and an atom driven by a detuned laser.`,
        };
      },
    }),
    code({
      id: 'propagate', difficulty: 3,
      prompt: t`Build $\hat U(t) = e^{-i\hat Ht/\hbar}$ from the eigen-decomposition $\hat H = \sum_n E_n|n\rangle\langle n|$, so $\hat U = \sum_n e^{-iE_nt/\hbar}|n\rangle\langle n|$. Units: energies in GHz × $h$ and times in ns, so $E/\hbar \to 2\pi E$. Write \`U(H, t)\` using \`np.linalg.eigh\`, and \`evolve(H, psi0, t)\`. For the two-state ammonia model \`H2\` the probability of $|R\rangle$ must be $\sin^2(\pi\nu_0t)$; check also that $\hat U$ is unitary and that $\langle H\rangle$ does not change for a three-level system.`,
      starter: t`import numpy as np

nu0 = 23.87                                    # GHz
H2 = -nu0 / 2 * np.array([[0, 1], [1, 0]])     # A = h nu0 / 2, in GHz x h

def U(H, t):
    pass

def evolve(H, psi0, t):
    pass

L = np.array([1, 0], dtype=complex)
print(abs(evolve(H2, L, 0.01)[1])**2)
`,
      answer: t`import numpy as np

nu0 = 23.87                                    # GHz
H2 = -nu0 / 2 * np.array([[0, 1], [1, 0]])     # A = h nu0 / 2, in GHz x h

def U(H, t):
    E, V = np.linalg.eigh(H)
    return V @ np.diag(np.exp(-2j * np.pi * E * t)) @ V.conj().T

def evolve(H, psi0, t):
    return U(H, t) @ psi0

L = np.array([1, 0], dtype=complex)
print(abs(evolve(H2, L, 0.01)[1])**2)`,
      tests: [
        { name: t`$P_R(t) = \sin^2(\pi\nu_0t)$ at several times`, code: 'all(abs(abs(evolve(H2, np.array([1, 0], dtype=complex), t)[1])**2 - np.sin(np.pi * nu0 * t)**2) < 1e-9 for t in [0.003, 0.01, 0.0209, 0.05])' },
        { name: t`$\hat U^\dagger\hat U = \hat 1$`, code: 'np.allclose(U(H2, 0.037).conj().T @ U(H2, 0.037), np.eye(2))' },
        { name: t`$\hat U(t_1)\hat U(t_2) = \hat U(t_1 + t_2)$`, code: 'np.allclose(U(H2, 0.01) @ U(H2, 0.02), U(H2, 0.03))' },
        { name: t`$\langle H\rangle$ is constant for a 3-level system`, code: '(lambda H3, p: np.isclose(np.vdot(evolve(H3, p, 0.7), H3 @ evolve(H3, p, 0.7)).real, np.vdot(p, H3 @ p).real))(np.array([[1, 2, 0], [2, 3, 1], [0, 1, 5]], dtype=float), np.array([1, 1j, 0]) / np.sqrt(2))' },
      ],
      hints: ['`E, V = np.linalg.eigh(H)` gives the energies and the eigenvectors as columns of V.', 'Then U = V · diag(exp(−2πi E t)) · V†.'],
      teach: 'For a constant Hamiltonian, time evolution is diagonal in the energy basis: each component just turns its phase at its own rate.',
      explain: t`Changing to the energy basis, multiplying each component by $e^{-iE_nt/\hbar}$, and changing back is the whole of $\hat U(t)$ — the matrix form of “expand in stationary states and attach the phases”. Unitarity guarantees conserved probability; $[\hat H, \hat U] = 0$ guarantees conserved $\langle H\rangle$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ammonia-clock', difficulty: 2, transfer: true,
      prompt: t`The first atomic clock, built at the US National Bureau of Standards in 1949, was locked to ammonia’s inversion line at $\nu_0 = 23.870$ GHz — the frequency at which the nitrogen tunnels through the plane of hydrogens. Modelling the two inversion states as $\hat H = -A\big(|L\rangle\langle R| + |R\rangle\langle L|\big)$, what is the tunnelling energy $A$, in μeV?`,
      visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'double', L: 2, V0: 0.6, w: 0.3, n: 2, show: 'psi', controls: false, readout: false, top: 2, panels: ['energy', 'wave'], hide: ['energy', 'axis'] }, caption: 'A schematic double well: the two lowest levels and the upper one’s wave function, odd across the barrier. Not ammonia’s real potential or scale.' },
      answer: (H * NU_NH3) / 2 / QE * 1e6, units: 'μeV', tol: { rel: 0.005 },
      errors: [{ value: (H * NU_NH3) / QE * 1e6, feedback: t`The splitting $2A$ equals $h\nu_0$, so $A$ is half of $h\nu_0$.` }],
      hints: [t`The energy eigenvalues are $\mp A$: their difference is $2A = h\nu_0$.`, t`$h = ${tex(H / QE, 6)}$ eV s.`],
      teach: 'Two coupled degenerate states split into a pair 2A apart, and the system oscillates between them at the frequency 2A/h.',
      explain: t`$A = h\nu_0/2 = ${fmt((H * NU_NH3) / 2 / QE * 1e6, 4)}$ μeV, a hundred-thousandth of a chemical bond energy. The clock’s accuracy was limited by the molecules’ motion and collisions; caesium beams soon took over, and since 1967 the second has been defined by caesium’s hyperfine transition.`,
    }),
    mcq({
      id: 'cp-commute', difficulty: 2,
      prompt: t`An observable $\hat Q$ with no explicit time dependence satisfies $[\hat H, \hat Q] = 0$. Which statement is true for **every** state of the system?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 1.1], aspect: 'wide', xlabel: 't', ylabel: 'probability', xticks: 0, yticks: 2, axesAt: 'edge', curves: [{ fn: '0.6', color: 'gold', width: 2.4 }, { fn: '0.3', color: 'accent', width: 2.4 }, { fn: '0.1', color: 'violet', width: 2.4 }] }, caption: 'Probabilities of the possible results of measuring a conserved quantity, against time. Schematic.' },
      choices: [
        t`The probability of each result of measuring $Q$ is constant in time`,
        t`The state is an eigenstate of $\hat Q$`,
        t`$\langle Q\rangle$ is constant, but its spread $\sigma_Q$ may change`,
        t`The state does not change in time`,
      ],
      answer: 0,
      why: {
        1: t`Conservation does not force the state into an eigenstate: a superposition of $Q$-eigenstates stays one, with the same weights.`,
        2: t`$\hat H$ commutes with every power of $\hat Q$, so $\langle Q^2\rangle$ and all higher moments are constant too.`,
        3: t`The state may still evolve (other observables can change); only the distribution of $Q$ is frozen.`,
      },
      hints: [t`If $[\hat H, \hat Q] = 0$, then $\hat H$ and $\hat Q$ share eigenvectors; how does each component evolve?`],
      teach: 'A conserved observable has a frozen probability distribution, not just a frozen average.',
      explain: t`Expand in common eigenvectors of $\hat H$ and $\hat Q$: each component only gains a phase $e^{-iE_nt/\hbar}$, so the weight on each eigenvalue $q$ never changes. That is the full meaning of “$Q$ is conserved”.`,
    }),
    mcq({
      id: 'cp-gravimeter', difficulty: 3, transfer: true,
      prompt: t`An atom-interferometer gravimeter — flown in prototype on parabolic flights and proposed for gravity-mapping satellites — drops a cloud of atoms whose wave packets are far from point-like. In a uniform field, $\hat H = \hat p^2/2m + mg\hat z$ (add a tidal gradient term $\tfrac12m\Gamma\hat z^2$ if you like). How does the centre $\langle z\rangle$ of a packet move?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-5, 0.6], aspect: 'wide', xlabel: 't (s)', ylabel: 'height (m)', xticks: 5, yticks: 5, axesAt: 'edge', curves: [{ fn: '-4.9*x^2', color: 'accent', width: 2.4 }] }, caption: 'The classical free-fall curve z = −gt²/2 for g = 9.8 m/s². The question is whether a quantum packet’s centre follows it.' },
      choices: [
        t`Exactly as a classical particle: the force is at most linear in $z$, so $\langle V'(z)\rangle = V'(\langle z\rangle)$`,
        t`Approximately, with corrections of order $\hbar$ that the interferometer must subtract`,
        t`It does not fall until it is measured`,
        t`It falls faster than $g$ because it spreads`,
      ],
      answer: 0,
      why: {
        1: t`For $V$ at most quadratic, $V'$ is linear and $\langle V'(z)\rangle = V'(\langle z\rangle)$ exactly: no correction of any order.`,
        2: t`$\langle z\rangle$ obeys $m\,d^2\langle z\rangle/dt^2 = -\langle V'(z)\rangle$ whether or not anyone looks.`,
        3: t`Spreading is symmetric about the centre; it changes $\sigma_z$, not $\langle z\rangle$.`,
      },
      hints: [t`Heisenberg: $\dot{\hat z}_H = \hat p_H/m$, $\dot{\hat p}_H = -mg - m\Gamma\hat z_H$.`, t`Take expectation values: is anything other than $\langle z\rangle$ and $\langle p\rangle$ involved?`],
      teach: 'For potentials no more than quadratic, Ehrenfest’s theorem makes expectation values follow classical trajectories exactly.',
      explain: t`The Heisenberg equations are linear, so $\langle z\rangle(t) = z_0 + v_0t - \tfrac12gt^2$ (plus the gradient’s correction) exactly. What the interferometer actually reads is the phase difference between two packets, $k_{\text{eff}}gT^2$, which follows from the same linear dynamics.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.5.3 and Problem 3.40', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Feynman Lectures on Physics, Vol. III, ch. 8–9: the ammonia molecule', url: 'https://www.feynmanlectures.caltech.edu/III_09.html' },
    { label: 'NIST: the first atomic clock (ammonia, 1949)', url: 'https://www.nist.gov/time-distribution/radio-station-wwv/atomic-clocks' },
  ],
});
