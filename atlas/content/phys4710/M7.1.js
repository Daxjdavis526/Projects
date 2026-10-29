// Two-level systems driven near resonance: Rabi oscillations with detuning
// and the rotating-wave approximation (Griffiths & Schroeter §11.1–11.2;
// Foot, Atomic Physics §7). phys4700.M6.2 did Larmor precession and the
// spin echo (and the NMR π/2-pulse timing); not repeated. Here: the coupled
// amplitude equations, the RWA (dropping terms at ω + ω₀; the Bloch–Siegert
// shift Ω²/4ω₀ is the price), the rotating-frame Hamiltonian
// (ħ/2)(Ωσₓ − Δσ_z), Rabi's formula P = (Ω²/Ω′²)sin²(Ω′t/2) with
// Ω′ = √(Ω² + Δ²), the Bloch-sphere picture (rotation about (Ω, 0, −Δ)), power
// broadening (FWHM 2Ω of the peak transfer), Ω = dE₀/ħ for an optical
// transition. Transfers: a superconducting qubit's π pulse under a drifted
// frequency (fidelity), and NMR's tipping. Coding: the full (non-RWA)
// Schrödinger equation integrated with RK4 against Rabi's formula.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, rabiBloch, rabiP, r6 } from './_q2b.js';

const t = String.raw;
const EX = { W: 10, D: 5 };
EX.op = Math.hypot(EX.W, EX.D); EX.pmax = EX.W ** 2 / EX.op ** 2; EX.T = 1000 / EX.op;     // ns
/** P_e(t) on a time axis (μs) for given Ω/2π, Δ/2π in MHz, with optional second curve. */
const rabiCurve = (W, D, tmax, caption, { second = null, mark = null } = {}) => ({
  type: 'graph',
  params: {
    x: [0, tmax], y: [0, 1.08], aspect: 'wide', xlabel: 't (μs)', ylabel: 'Pₑ', axesAt: 'edge', xticks: 5, yticks: 4,
    curves: [
      { fn: `${r6(W * W / (W * W + D * D))}*sin(pi*${r6(Math.hypot(W, D))}*x)^2`, color: 'accent', width: 2.4 },
      ...(second ? [{ fn: `${r6(second.W ** 2 / (second.W ** 2 + second.D ** 2))}*sin(pi*${r6(Math.hypot(second.W, second.D))}*x)^2`, color: 'gold', width: 2, dash: [6, 4] }] : []),
    ],
    ...(mark ? { vlines: [{ x: r6(mark), color: 'violet' }] } : {}),
  },
  caption,
});

export default lesson({
  id: 'phys4710.M7.1',
  title: 'Two-level systems and Rabi oscillations',
  minutes: 18, difficulty: 3,
  intro: t`Drive a two-level system — an atom, a nuclear spin, a qubit — with an oscillating field near its transition frequency, and it does not simply absorb: it **flops** back and forth between the two levels, a Rabi oscillation. Off resonance the flopping is faster but incomplete:

$$\begin{gathered} P_{g\to e}(t) = \frac{\Omega^2}{\Omega^2 + \Delta^2}\,\sin^2\!\Bigl(\frac{\Omega' t}{2}\Bigr) \\ \Omega' = \sqrt{\Omega^2 + \Delta^2} \end{gathered}$$

This one formula is how NMR tips spins, how atomic clocks find their frequency, and how every single-qubit gate in a quantum computer is made.`,
  symbols: [
    { tex: 'P_{g\\to e}(t)', text: 'the probability of finding the system in the excited state after driving for time t, starting in the ground state' },
    { tex: '\\Omega', text: t`the Rabi frequency, in rad/s: the coupling strength. For an electric-dipole transition $\Omega = dE_0/\hbar$; for a spin, $\gamma B_1$` },
    { tex: '\\Delta', text: 'the detuning ω − ω₀, in rad/s: drive frequency minus transition frequency' },
    { tex: '\\omega_0', text: t`the transition’s angular frequency, $(E_e - E_g)/\hbar$` },
    { tex: '\\Omega\'', text: 'the generalized Rabi frequency, the rate of flopping off resonance' },
    { tex: 't', text: 'the time the drive has been on' },
  ],
  why: 'Rabi oscillations are the control knob of quantum technology: π pulses for qubit gates and clock interrogation, π/2 pulses for NMR and Ramsey interferometry.',
  visual: {
    ...rabiBloch({ W: 1, D: 0, tt: 0.25, sliders: true, readouts: true }),
    title: 'Rabi flopping on the Bloch sphere',
    lead: t`In the frame rotating with the drive, the state’s Bloch vector (gold) simply turns about the effective field $\vec\Omega = (\Omega, 0, -\Delta)$ (blue) at the rate $\Omega'$. Ground state at the top, excited state at the bottom. Run time forward.`,
    tasks: [
      'On resonance (Δ = 0) the vector swings through the excited state at the bottom: at t = 0.5 μs with Ω/2π = 1 MHz it is there, a π pulse.',
      'Set Δ/2π = 1 MHz: the axis tilts, the circle no longer reaches the bottom, and the largest Pₑ is Ω²/(Ω² + Δ²) = 0.5.',
      'Make the detuning large (5 MHz): the vector wobbles quickly in a small circle near the top. A far-detuned drive barely moves the system.',
    ],
  },
  example: {
    prompt: t`A qubit with transition frequency $\omega_0$ is driven by $\hat H = \tfrac{\hbar\omega_0}{2}\sigma_z + \hbar\Omega\cos(\omega t)\,\sigma_x$. Derive Rabi’s formula in the rotating-wave approximation, then evaluate it for $\Omega/2\pi = ${EX.W}$ MHz and $\Delta/2\pi = ${EX.D}$ MHz.`,
    visual: rabiCurve(EX.W, EX.D, 0.25, `Pₑ(t) for Ω/2π = ${EX.W} MHz: on resonance (gold, dashed) and detuned by ${EX.D} MHz (blue). Rotating-wave approximation.`, { second: { W: EX.W, D: 0 } }),
    steps: [
      { label: 'Amplitudes', text: t`Write $|\psi\rangle = c_g e^{i\omega_0t/2}|g\rangle + c_e e^{-i\omega_0t/2}|e\rangle$, removing the free evolution. Then $i\dot c_e = \Omega\cos(\omega t)\,e^{i\omega_0t}c_g$ and $i\dot c_g = \Omega\cos(\omega t)\,e^{-i\omega_0t}c_e$.` },
      { label: 'Two kinds of term', text: t`$\cos\omega t\,e^{i\omega_0t} = \tfrac12\bigl(e^{-i\Delta t} + e^{i(\omega + \omega_0)t}\bigr)$ with $\Delta = \omega - \omega_0$: one slow term and one oscillating at nearly $2\omega_0$.` },
      { label: 'Rotating-wave approximation', text: t`When $\Omega, |\Delta| \ll \omega_0$ the fast term averages away: drop it. Then $i\dot c_e = \tfrac\Omega2e^{-i\Delta t}c_g$ and $i\dot c_g = \tfrac\Omega2e^{i\Delta t}c_e$ — the drive looks static in a frame rotating with it.` },
      { label: 'Solve', text: t`Eliminating $c_g$: $\ddot c_e + i\Delta\dot c_e + \tfrac{\Omega^2}{4}c_e = 0$, with roots of the form $e^{-i\Delta t/2}e^{\pm i\Omega't/2}$. With $c_e(0) = 0$: $|c_e|^2 = \dfrac{\Omega^2}{\Omega'^2}\sin^2\dfrac{\Omega't}{2}$.` },
      { label: 'Numbers', text: t`$\Omega'/2\pi = \sqrt{${EX.W}^2 + ${EX.D}^2} = ${fmt(EX.op, 4)}$ MHz. The largest transfer is $${EX.W ** 2}/${EX.W ** 2 + EX.D ** 2} = ${fmt(EX.pmax, 3)}$, reached first after half a period, $t = 1/(2\times${fmt(EX.op, 4)}\ \text{MHz}) = ${fmt(EX.T / 2, 3)}$ ns.` },
      { label: 'Sense check', text: t`On resonance, a π pulse ($\Omega t = \pi$) takes $1/(2\times${EX.W}\ \text{MHz}) = ${fmt(1000 / (2 * EX.W), 3)}$ ns and transfers everything. For a 5 GHz superconducting qubit, $\Omega/\omega_0 = 0.002$: the dropped terms shift the resonance by only about $\Omega^2/4\omega_0$ (the Bloch–Siegert shift), a few kHz.` },
    ],
    answer: t`$P_e = \dfrac{\Omega^2}{\Omega'^2}\sin^2\dfrac{\Omega't}{2}$; here $\Omega'/2\pi = ${fmt(EX.op, 4)}$ MHz, at most ${fmt(EX.pmax, 3)} transferred, first after $${fmt(EX.T / 2, 3)}$ ns.`,
  },
  practice: [
    num({
      id: 'pi-pulse', difficulty: 1,
      gen(r) {
        const W = r.pick([2, 5, 12.5, 20, 40]), which = r.pick(['π', 'π/2']);
        const ans = (which === 'π' ? 1 : 0.5) * 1000 / (2 * W);
        return {
          prompt: t`A qubit is driven exactly on resonance with Rabi frequency $\Omega/2\pi = ${W}$ MHz. How long, in ns, is a ${which} pulse ($\Omega t = ${which === 'π' ? '\\pi' : '\\pi/2'}$)${which === 'π' ? ', which flips the ground state to the excited state' : ', which makes an equal superposition'}?`,
          visual: rabiBloch({ W: 1, D: 0, tt: which === 'π' ? 0.5 : 0.25 }),
          answer: ans, units: 'ns', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$\Omega/2\pi$ is given in MHz, so $\Omega = 2\pi\times${W}$ MHz: $t = \pi/\Omega = 1/(2\times${W}\ \text{MHz})$.` }, { value: which === 'π' ? ans / 2 : ans * 2, feedback: which === 'π' ? 'A π pulse turns the Bloch vector by 180°: Ωt = π.' : 'A π/2 pulse is half a π pulse: Ωt = π/2.' }],
          hints: [t`$\Omega t = ${which === 'π' ? '\\pi' : '\\pi/2'}$ with $\Omega = 2\pi\times${W}\times10^6\ \text{s}^{-1}$.`],
          teach: 'On resonance the Bloch vector turns at Ω: a π pulse lasts π/Ω, half a Rabi period.',
          explain: t`$t = ${which === 'π' ? '\\pi' : '\\pi/2'}/(2\pi\times${W}\ \text{MHz}) = ${fmt(ans, 4)}$ ns.`,
        };
      },
    }),
    num({
      id: 'pmax', difficulty: 2,
      gen(r) {
        const W = r.pick([1, 2, 3]), D = r.pick([0.5, 1, 2, 4]);
        const ans = (W * W) / (W * W + D * D);
        return {
          prompt: t`A two-level atom is driven with $\Omega/2\pi = ${W}$ MHz but the laser is detuned by $\Delta/2\pi = ${D}$ MHz. What is the largest excited-state probability it ever reaches?`,
          visual: rabiBloch({ W, D, tt: 0.05, path: false }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: W / Math.hypot(W, D), feedback: t`The amplitude ratio must be squared: $P_{\max} = \Omega^2/(\Omega^2 + \Delta^2)$.` }, { value: 1, feedback: 'Off resonance the transfer is never complete.' }],
          hints: [t`$P_{\max} = \dfrac{\Omega^2}{\Omega^2 + \Delta^2}$; the factors of $2\pi$ cancel.`],
          teach: 'Detuning tilts the rotation axis, so the Bloch vector cannot reach the excited state: the peak transfer is Ω²/(Ω² + Δ²).',
          explain: t`$${W * W}/(${W * W} + ${D * D}) = ${fmt(ans, 4)}$. On the Bloch sphere, the axis $(\Omega, 0, -\Delta)$ is tilted from the equator, and the circle the vector traces around it reaches only down to $z = 1 - 2P_{\max}$.`,
        };
      },
    }),
    num({
      id: 'p-at-t', difficulty: 2,
      gen(r) {
        const W = r.pick([1, 2]), D = r.pick([1, 1.5]), tt = r.pick([0.15, 0.2, 0.3]);
        const ans = rabiP(W, D, tt);
        return {
          prompt: t`With $\Omega/2\pi = ${W}$ MHz and $\Delta/2\pi = ${D}$ MHz, starting in the ground state, what is the excited-state probability after $t = ${tt}\ \mu\text{s}$?`,
          visual: rabiCurve(W, D, 1, 'Pₑ(t) for these parameters (the time asked for is not marked).'),
          answer: ans, tol: { rel: 0.01, abs: 0.003 },
          errors: [{ value: (W * W) / (W * W + D * D) * Math.sin(2 * Math.PI * Math.hypot(W, D) * tt) ** 2, feedback: t`The argument is $\Omega't/2$, half the angle turned: $\sin^2(\pi\,f't)$ with $f' = \Omega'/2\pi$.` }, { value: Math.sin(Math.PI * W * tt) ** 2, feedback: 'Off resonance use Ω′ = √(Ω² + Δ²) in the sine and the prefactor Ω²/Ω′².' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\Omega'/2\pi = \sqrt{${W}^2 + ${D}^2}$ MHz.`, t`$P = \dfrac{\Omega^2}{\Omega'^2}\sin^2\bigl(\pi\,(\Omega'/2\pi)\,t\bigr)$ with $t$ in μs and frequencies in MHz.`],
          teach: 'Rabi’s formula has the generalized frequency Ω′ in the sine and the ratio Ω²/Ω′² in front.',
          explain: t`$\Omega'/2\pi = ${fmt(Math.hypot(W, D), 4)}$ MHz; $\sin^2(\pi\times${fmt(Math.hypot(W, D), 4)}\times${tt}) = ${fmt(Math.sin(Math.PI * Math.hypot(W, D) * tt) ** 2, 4)}$; times $${fmt((W * W) / (W * W + D * D), 4)}$ gives $${fmt(ans, 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'rwa', difficulty: 2,
      prompt: t`What does the rotating-wave approximation throw away, and when is that safe?`,
      visual: rabiBloch({ W: 1, D: 0.6, tt: 0.4 }),
      choices: [
        t`The terms oscillating at $\omega + \omega_0$, which average out when $\Omega$ and $|\Delta|$ are much smaller than $\omega_0$`,
        'The decay of the excited state, which is safe for short times',
        t`The terms oscillating at $\Delta$, which are slow and therefore negligible`,
        'The magnetic part of the light’s field',
      ],
      answer: 0,
      why: {
        1: 'Decay is a separate omission (no spontaneous emission here); the RWA is about the drive’s two rotating components.',
        2: t`Those are the terms kept: slow terms accumulate, fast ones cancel.`,
        3: 'The coupling here is the electric dipole; the RWA concerns its time dependence.',
      },
      hints: [t`$\cos\omega t = \tfrac12(e^{i\omega t} + e^{-i\omega t})$: one part co-rotates with the system’s phase $e^{-i\omega_0t}$ and one counter-rotates.`],
      teach: 'A linearly oscillating drive is two counter-rotating fields; near resonance only the co-rotating one matters.',
      explain: t`The counter-rotating part oscillates at nearly $2\omega_0$ in the interaction frame, so its effect averages to almost nothing over a Rabi cycle. Its residue is the Bloch–Siegert shift $\sim\Omega^2/4\omega_0$: measurable in strongly driven NMR and qubits, negligible in optics, where $\omega_0$ is $10^{15}\ \text{s}^{-1}$.`,
    }),
    num({
      id: 'dipole', difficulty: 3,
      gen(r) {
        const d = r.pick([2.5, 3.0, 3.6]), E0 = r.pick([100, 300, 1000, 3000]);       // ×10⁻²⁹ C m, V/m
        const ans = (d * 1e-29 * E0) / HBAR / (2 * Math.PI) / 1e6;
        return {
          prompt: t`An alkali atom’s optical transition has a dipole matrix element $d = ${d}\times10^{-29}$ C m. A laser beam drives it with field amplitude $E_0 = ${E0}$ V/m. What is the Rabi frequency $\Omega/2\pi = dE_0/(2\pi\hbar)$, in MHz?`,
          visual: rabiCurve(5, 0, 0.4, 'Rabi flopping on resonance, Pₑ against time (illustrative frequency).'),
          answer: ans, units: 'MHz', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$dE_0/\hbar$ is the angular frequency $\Omega$; divide by $2\pi$ for $\Omega/2\pi$.` }],
          hints: [t`$\Omega = dE_0/\hbar$ with $\hbar = ${tex(HBAR, 5)}$ J s.`, t`Then divide by $2\pi$ and by $10^6$ for MHz.`],
          teach: 'The Rabi frequency is the dipole energy dE₀ in units of ħ: stronger fields flop faster, in proportion to the field (the square root of the intensity).',
          explain: t`$\Omega = ${d}\times10^{-29}\times${E0}/${tex(HBAR, 4)} = ${tex(ans * 2 * Math.PI * 1e6, 4)}\ \text{s}^{-1}$, so $\Omega/2\pi = ${fmt(ans, 4)}$ MHz. Doubling the laser power multiplies $E_0$, and so $\Omega$, by $\sqrt2$.`,
        };
      },
    }),
    mcq({
      id: 'broadening', difficulty: 3,
      prompt: t`An experimenter scans the drive frequency across a resonance and records the peak excited-state probability $\Omega^2/(\Omega^2 + \Delta^2)$ at each detuning. What sets the width of this resonance curve?`,
      visual: { type: 'graph', params: { x: [-5, 5], y: [0, 1.1], aspect: 'wide', xlabel: 'Δ/2π (MHz)', ylabel: 'peak Pₑ', axesAt: 'edge', curves: [{ fn: '1/(1 + x^2)', color: 'accent', width: 2.4, label: 'Ω/2π = 1 MHz', labelAt: 1.2, labelDy: -6 }, { fn: '4/(4 + x^2)', color: 'gold', width: 2, dash: [6, 4], label: 'Ω/2π = 2 MHz', labelAt: 2.6, labelDy: -6 }] }, caption: 'The peak transfer against detuning for two drive strengths. Rotating-wave approximation, no decay.' },
      choices: [
        t`The Rabi frequency itself: the curve has full width $2\Omega$ at half maximum, so a stronger drive gives a broader resonance (power broadening)`,
        'Only the lifetime of the excited state',
        'The transition frequency ω₀',
        'Nothing: the curve is infinitely narrow without decay',
      ],
      answer: 0,
      why: {
        1: 'Decay adds width, but this curve has none and is still broad.',
        2: t`$\omega_0$ sets where the resonance is, not how wide.`,
        3: t`$\Omega^2/(\Omega^2 + \Delta^2)$ falls to ½ at $\Delta = \pm\Omega$.`,
      },
      hints: [t`Where does $\Omega^2/(\Omega^2 + \Delta^2)$ equal ½?`, 'Compare the two curves in the picture.'],
      teach: 'Power broadening: a strong drive resonates over a range of detunings about as wide as its Rabi frequency, so precision spectroscopy uses weak, long pulses.',
      explain: t`Half maximum at $\Delta = \pm\Omega$: a Lorentzian of full width $2\Omega$. To find a clock transition precisely you drive gently for a long time — a π pulse of length $T$ has $\Omega = \pi/T$, and the line narrows as $1/T$, the time–frequency trade-off.`,
    }),
    code({
      id: 'rabi-rk4', difficulty: 3,
      prompt: t`Integrate the full Schrödinger equation $i\dot c = H(t)c$ for a qubit with $H = \tfrac{\omega_0}{2}\sigma_z + \Omega\cos(\omega t)\,\sigma_x$ ($\hbar = 1$; times in ns, $\omega_0 = 2\pi\times1$ GHz, $\Omega = 2\pi\times20$ MHz), *without* the rotating-wave approximation. Write \`deriv(t, c)\` returning $-iH(t)c$, and \`evolve(T, n)\`, which takes $n$ RK4 steps from $c = (0, 1)$ (the ground state is the second component) and returns the times and the excited-state probability $|c_0|^2$ at every step. The program compares the result with Rabi’s formula.`,
      starter: t`import numpy as np

w0 = 2 * np.pi * 1.0       # transition angular frequency, 1/ns (a 1 GHz qubit)
W = 2 * np.pi * 0.02       # Rabi frequency, 20 MHz
dw = 0.0                   # detuning
w = w0 + dw
sx = np.array([[0, 1], [1, 0]], complex)
sz = np.array([[1, 0], [0, -1]], complex)

def H(t):
    return 0.5 * w0 * sz + W * np.cos(w * t) * sx

def deriv(t, c):
    pass

def evolve(T, n):
    pass

ts, P = evolve(np.pi / W, 5000)
P_rwa = (W**2 / (W**2 + dw**2)) * np.sin(np.sqrt(W**2 + dw**2) * ts / 2)**2
print("after a pi pulse:", P[-1])
print("largest difference from Rabi's formula:", np.max(np.abs(P - P_rwa)))
`,
      answer: t`import numpy as np

w0 = 2 * np.pi * 1.0       # transition angular frequency, 1/ns (a 1 GHz qubit)
W = 2 * np.pi * 0.02       # Rabi frequency, 20 MHz
dw = 0.0                   # detuning
w = w0 + dw
sx = np.array([[0, 1], [1, 0]], complex)
sz = np.array([[1, 0], [0, -1]], complex)

def H(t):
    return 0.5 * w0 * sz + W * np.cos(w * t) * sx

def deriv(t, c):
    return -1j * H(t) @ c

def evolve(T, n):
    h = T / n
    c = np.array([0, 1], complex)
    ts = np.linspace(0, T, n + 1)
    P = np.zeros(n + 1)
    t = 0.0
    for i in range(n):
        k1 = deriv(t, c)
        k2 = deriv(t + h / 2, c + h / 2 * k1)
        k3 = deriv(t + h / 2, c + h / 2 * k2)
        k4 = deriv(t + h, c + h * k3)
        c = c + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        t += h
        P[i + 1] = abs(c[0])**2
    return ts, P

ts, P = evolve(np.pi / W, 5000)
P_rwa = (W**2 / (W**2 + dw**2)) * np.sin(np.sqrt(W**2 + dw**2) * ts / 2)**2
print("after a pi pulse:", P[-1])
print("largest difference from Rabi's formula:", np.max(np.abs(P - P_rwa)))
`,
      tests: [
        { name: t`\`deriv\` returns $-iH(t)c$`, code: 'np.allclose(deriv(0.3, np.array([1, 0], complex)), -1j * H(0.3) @ np.array([1, 0], complex))' },
        { name: 'a π pulse transfers more than 99.9% to the excited state', code: 'P[-1] > 0.999' },
        { name: 'P stays within 0.01 of Rabi’s formula throughout', code: 'np.max(np.abs(P - P_rwa)) < 0.01' },
        { name: t`\`evolve(T, n)\` returns $n + 1$ times and probabilities, starting from 0`, code: 'len(evolve(5.0, 100)[0]) == 101 and len(evolve(5.0, 100)[1]) == 101 and evolve(5.0, 100)[1][0] == 0' },
        { name: 'the probability never exceeds 1 (the evolution stays unitary)', code: 'np.max(P) < 1 + 1e-6' },
      ],
      hints: [t`\`deriv\` is one line: \`-1j * H(t) @ c\`.`, t`Classic RK4: \`k1 = deriv(t, c)\`, \`k2 = deriv(t + h/2, c + h/2*k1)\`, \`k3 = deriv(t + h/2, c + h/2*k2)\`, \`k4 = deriv(t + h, c + h*k3)\`, then \`c += h/6*(k1 + 2*k2 + 2*k3 + k4)\`.`],
      teach: 'The rotating-wave approximation is excellent when Ω ≪ ω₀: the exact evolution follows Rabi’s formula with small, fast wiggles on top.',
      explain: t`The full evolution follows Rabi’s formula to within about 0.005: the counter-rotating terms add small wiggles at $2\omega_0$ of relative size $\sim\Omega/4\omega_0 = 0.005$. Push $W$ up toward $w_0$ and the RWA visibly fails — the regime of “ultrastrong” coupling.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-qubit', difficulty: 3, transfer: true,
      gen(r) {
        const W = r.pick([20, 25, 40]), D = r.pick([1, 2, 4]);                 // MHz
        const tp = 1 / (2 * W), ans = rabiP(W, D, tp);
        return {
          prompt: t`A superconducting qubit’s π pulse is calibrated on resonance with $\Omega/2\pi = ${W}$ MHz. Overnight its frequency drifts by $${D}$ MHz, but the same pulse (same length, same drive frequency) is applied. What is the probability it now flips the qubit?`,
          visual: rabiBloch({ W, D, tt: tp }),
          answer: ans, tol: { rel: 0, abs: 0.0005 },
          errors: [{ value: (W * W) / (W * W + D * D), feedback: t`That is the most the detuned drive could ever transfer; the pulse length is fixed at $\pi/\Omega$, so evaluate $\sin^2(\Omega't/2)$ too.` }, { value: 1, feedback: 'A detuned π pulse no longer reaches the excited state exactly.' }].filter((e) => Math.abs(e.value - ans) > 0.001),
          hints: [t`$t = \pi/\Omega$, i.e. $1/(2\times${W}\ \text{MHz})$.`, t`$P = \dfrac{\Omega^2}{\Omega'^2}\sin^2\Bigl(\dfrac{\pi}{2}\dfrac{\Omega'}{\Omega}\Bigr)$.`],
          teach: 'Gate errors from small detunings are second order in Δ/Ω: drifts must stay well below the Rabi frequency.',
          explain: t`$\Omega'/\Omega = \sqrt{1 + (${D}/${W})^2} = ${fmt(Math.hypot(W, D) / W, 6)}$; $P = ${fmt((W * W) / (W * W + D * D), 5)}\times\sin^2(\tfrac\pi2\times${fmt(Math.hypot(W, D) / W, 5)}) = ${fmt(ans, 5)}$. An error of $${tex(1 - ans, 2)}$ per gate — tolerable once, ruinous after thousands of gates, which is why qubit frequencies are recalibrated routinely.`,
        };
      },
    }),
    mcq({
      id: 'cp-axis', difficulty: 2,
      prompt: t`In the rotating frame, which picture describes the drive?`,
      visual: rabiBloch({ W: 1, D: 1, tt: 0.3 }),
      choices: [
        t`A static field $\vec\Omega = (\Omega, 0, -\Delta)$ about which the Bloch vector precesses at $\Omega'$; on resonance it lies in the equatorial plane`,
        'A field along z that never changes the populations',
        'An oscillating field that pumps the populations up monotonically',
        'A field that rotates the Bloch vector about z at the drive frequency ω',
      ],
      answer: 0,
      why: {
        1: 'Only the Δ part lies along z; the Ω part is transverse and changes the populations.',
        2: 'Populations oscillate (Rabi flopping); they do not grow steadily without decay.',
        3: 'That rotation at ω is what the rotating frame removes.',
      },
      hints: [t`In the rotating frame the Hamiltonian is time-independent: $\tfrac\hbar2(\Omega\sigma_x - \Delta\sigma_z)$.`],
      teach: 'In the rotating frame a driven two-level system is a spin in a static field: Rabi oscillation is precession about a tilted axis.',
      explain: t`$\hat H' = \tfrac\hbar2(\Omega\sigma_x - \Delta\sigma_z)$ is the Hamiltonian of a spin in a static field $(\Omega, 0, -\Delta)$, so the Bloch vector precesses about it at $\Omega'$ — the same Larmor precession as in QM I, now in a moving frame.`,
    }),
    num({
      id: 'cp-period', difficulty: 2,
      gen(r) {
        const W = r.pick([3, 4, 6]), D = r.pick([4, 8]);
        const ans = 1000 / Math.hypot(W, D);
        return {
          prompt: t`Driven with $\Omega/2\pi = ${W}$ MHz and detuned by $\Delta/2\pi = ${D}$ MHz, how long, in ns, is one full period of the population oscillation?`,
          visual: rabiCurve(W, D, 0.5, 'Pₑ(t) for these parameters.'),
          answer: ans, units: 'ns', tol: { rel: 0.005 },
          errors: [{ value: 1000 / W, feedback: 'Off resonance the flopping runs at the generalized frequency Ω′ = √(Ω² + Δ²).' }, { value: 500 / Math.hypot(W, D), feedback: t`$\sin^2(\Omega't/2)$ repeats when $\Omega't = 2\pi$: the period is $1/(\Omega'/2\pi)$.` }],
          hints: [t`$P \propto \sin^2(\Omega't/2)$ returns to zero when $\Omega't = 2\pi$.`],
          teach: 'Detuning speeds the flopping up while shrinking it: the period is 2π/Ω′.',
          explain: t`$\Omega'/2\pi = \sqrt{${W * W} + ${D * D}} = ${fmt(Math.hypot(W, D), 4)}$ MHz, so the period is $${fmt(ans, 4)}$ ns.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §11.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Rabi, “Space quantization in a gyrating magnetic field”, Phys. Rev. 51, 652 (1937)', url: 'https://doi.org/10.1103/PhysRev.51.652' },
  ],
});
