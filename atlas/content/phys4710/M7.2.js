// Time-dependent perturbation theory (Griffiths & Schroeter §11.1.2;
// Sakurai §5.7). The interaction picture amplitudes, the first-order result
// c_f(t) = −(i/ħ)∫V_fi(t′)e^{iω_fi t′}dt′, and its tests: against Rabi's
// exact formula (M7.1) — it is the small-Ω limit, (Ω/Δ)² sin²(Δt/2), and on
// resonance (Ωt/2)², which grows without bound: first order holds only
// while P ≪ 1; a constant perturbation switched on, P = 4|V|²sin²(ωt/2)/ħ²ω²
// (the seed of the golden rule, M7.3); selection rules from V_fi = 0; the
// harmonic oscillator kicked by a Gaussian field pulse,
// P₀→₁ = (qE₀)²/(2mħω)·πτ²·e^{−ω²τ²/2}, largest at ωτ = √2, exponentially
// small for slow (adiabatic) pulses. Worked: a ⁴⁰Ca⁺ ion in a 1 MHz trap.
// Transfer: an electron in a GaAs quantum dot hit by a terahertz pulse.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, QE, ME, r6 } from './_q2b.js';
import { U } from '../phys4700/_qm.js';

const t = String.raw;
/** Kicked oscillator: P(0 → 1) for charge q (C), field E₀ (V/m), mass m (kg), ω (rad/s), τ (s). */
const kick = (q, E0, m, w, tau) => ((q * E0) ** 2 / (2 * m * HBAR * w)) * Math.PI * tau * tau * Math.exp(-((w * tau) ** 2) / 2);
const EX = { m: 39.962591 * U, f: 1e6, E0: 0.05, tau: 0.2e-6 };
EX.w = 2 * Math.PI * EX.f; EX.x0 = Math.sqrt(HBAR / (2 * EX.m * EX.w)); EX.P = kick(QE, EX.E0, EX.m, EX.w, EX.tau);
const pulse = (wt, caption) => ({
  type: 'graph',
  params: { x: [-3, 3], y: [-1.15, 1.15], aspect: 'wide', xlabel: 't / τ', ylabel: '', yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2)', color: 'gold', width: 2.4, label: 'pulse E(t)', labelAt: 0.8, labelDx: 6 }, { fn: `exp(-x^2)*cos(${r6(wt)}*x)`, color: 'accent', width: 1.8, dash: [5, 4], label: 'E(t) cos ωt', labelAt: -2.2, labelDy: 18 }], hlines: [{ y: 0, color: 'ink4' }] },
  caption,
});

export default lesson({
  id: 'phys4710.M7.2',
  title: 'Time-dependent perturbation theory',
  minutes: 17, difficulty: 3,
  intro: t`Most time-dependent problems cannot be solved exactly, but if the perturbation $V(t)$ is weak the system barely leaves its starting state $|i\rangle$, and the amplitude to have jumped to $|f\rangle$ is one integral:

$$\begin{gathered} c_f(t) \approx -\frac{i}{\hbar}\int_0^t V_{fi}(t')\,e^{i\omega_{fi}t'}\,dt' \\ P_{i\to f} = |c_f(t)|^2 \end{gathered}$$

It is a **Fourier transform**: the system responds to the part of the perturbation that oscillates at its own transition frequency $\omega_{fi}$. Slow perturbations do almost nothing; resonant ones do the most.`,
  symbols: [
    { tex: 'c_f(t)', text: t`the amplitude of the final state $|f\rangle$ at time $t$ (with its free phase $e^{-iE_ft/\hbar}$ removed)` },
    { tex: 'V_{fi}(t\')', text: 'the matrix element ⟨f|V(t′)|i⟩ of the perturbation between the two states, in joules' },
    { tex: '\\omega_{fi}', text: t`the transition’s angular frequency $(E_f - E_i)/\hbar$` },
    { tex: 't\'', text: 'the integration time, from switch-on (t′ = 0) up to t' },
    { tex: 'P_{i\\to f}', text: 'the transition probability; the approximation needs it small' },
    { tex: '\\hbar', text: 'the reduced Planck constant' },
  ],
  why: 'First-order time-dependent perturbation theory gives every transition rate in atomic, molecular and nuclear physics — absorption, emission, photo-ionization — through Fermi’s golden rule.',
  visual: {
    type: 'graph',
    title: 'First order against exact',
    lead: t`A two-level system driven at Rabi frequency $\Omega$ and detuning $\Delta$: the exact Rabi result (blue) against first-order perturbation theory (gold, dashed), $P^{(1)} = (\Omega/\Delta)^2\sin^2(\Delta t/2)$.`,
    tasks: [
      'With Ω/2π = 0.3 MHz and Δ/2π = 0.6 MHz the curves are close but not identical: first order peaks at 0.25 instead of 0.2 and drifts out of step. Raise Δ to 2 MHz: they become indistinguishable — and tiny.',
      'Now set Δ to 0: first order predicts (Ωt/2)², which grows without limit and passes 1 — nonsense. It is only the start of the exact sin².',
      'Keep Δ = 0 and make Ω small: the agreement lasts longer. First order holds as long as P ≪ 1.',
    ],
    params: {
      x: [0, 3], y: [0, 1.3], aspect: 'wide', xlabel: 't (μs)', ylabel: 'Pₑ', axesAt: 'edge', xticks: 6, yticks: 4,
      sliders: [
        { key: 'W', label: t`Rabi frequency $\Omega/2\pi$`, min: 0.05, max: 1, step: 0.05, value: 0.3, unit: '\\text{MHz}', explain: 'The strength of the perturbation, as the rate it would flop the system on resonance.' },
        { key: 'D', label: t`Detuning $\Delta/2\pi$`, min: 0, max: 3, step: 0.05, value: 0.6, unit: '\\text{MHz}', explain: 'How far the drive is from the transition frequency.' },
      ],
      curves: [
        { fn: 'W^2/(W^2 + D^2)*sin(pi*sqrt(W^2 + D^2)*x)^2', color: 'accent', width: 2.6, label: 'exact', labelAt: 2.7, labelDy: -10 },
        { fn: '(pi*W*x)^2*(sin(pi*(D + 1e-9)*x)/(pi*(D + 1e-9)*x))^2', color: 'gold', width: 2, dash: [6, 4], label: 'first order', labelAt: 0.4, labelDy: -12 },
      ],
      hlines: [{ y: 1, color: 'ink4' }],
    },
    caption: 'Rotating-wave approximation, no decay. First-order theory is the exact result expanded to lowest order in Ω; probabilities above 1 (grey line) show where it has failed.',
  },
  example: {
    prompt: t`A $^{40}\text{Ca}^+$ ion sits in the ground state of a trap with $\omega/2\pi = 1$ MHz. A stray electric-field pulse $E(t) = E_0e^{-t^2/\tau^2}$ along the trap axis, with $E_0 = ${EX.E0}$ V/m and $\tau = ${fmt(EX.tau * 1e6, 3)}\ \mu\text{s}$, passes. What is the probability it is left in the first excited state?`,
    visual: pulse(EX.w * EX.tau, `The Gaussian pulse (gold) and the same multiplied by cos ωt (blue, dashed) for ωτ = ${fmt(EX.w * EX.tau, 3)}: the transition amplitude is the area under the blue curve.`),
    steps: [
      { label: 'Perturbation', text: t`$V(t) = -qE(t)\,x$, so $V_{10}(t) = -qE(t)\langle1|x|0\rangle$ with $\langle1|x|0\rangle = \sqrt{\hbar/2m\omega} = ${tex(EX.x0, 3)}$ m for this ion.` },
      { label: 'Integral', text: t`Extend the pulse over all time: $\displaystyle\int_{-\infty}^{\infty}e^{-t^2/\tau^2}e^{i\omega t}dt = \sqrt\pi\,\tau\,e^{-\omega^2\tau^2/4}$, the Fourier transform of a Gaussian.` },
      { label: 'Probability', text: t`$P_{0\to1} = \dfrac{q^2E_0^2}{\hbar^2}\cdot\dfrac{\hbar}{2m\omega}\cdot\pi\tau^2e^{-\omega^2\tau^2/2}$.` },
      { label: 'Numbers', text: t`$\omega\tau = ${fmt(EX.w * EX.tau, 4)}$, so $e^{-\omega^2\tau^2/2} = ${fmt(Math.exp(-((EX.w * EX.tau) ** 2) / 2), 4)}$, and $P_{0\to1} = ${fmt(EX.P, 3)}$ — small enough for first order to be trusted.` },
      { label: 'Limits', text: t`A slow pulse ($\omega\tau \gg 1$) gives an exponentially small $P$: the ion follows adiabatically and stays in its ground state. With $E_0$ fixed, a very short pulse carries little impulse, so $P \to 0$ as $\tau \to 0$ as well. In between, $P$ is largest at $\omega\tau = \sqrt2$.` },
      { label: 'Selection rule', text: t`$\langle2|x|0\rangle = 0$: to first order a uniform field cannot lift the oscillator two levels at once. Higher levels need second order — two steps through $|1\rangle$.` },
    ],
    answer: t`$P_{0\to1} = \dfrac{q^2E_0^2}{2m\hbar\omega}\pi\tau^2e^{-\omega^2\tau^2/2} = ${fmt(EX.P, 3)}$.`,
  },
  practice: [
    num({
      id: 'resonant-short', difficulty: 2,
      gen(r) {
        const W = r.pick([0.1, 0.2, 0.25]), tt = r.pick([0.2, 0.4, 0.6]);       // MHz, μs
        const ans = (Math.PI * W * tt) ** 2, ex = Math.sin(Math.PI * W * tt) ** 2;
        return {
          prompt: t`On resonance, first-order perturbation theory gives $P \approx (\Omega t/2)^2$ for a two-level system. With $\Omega/2\pi = ${W}$ MHz, what does it predict after $t = ${tt}\ \mu\text{s}$?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 1.3], aspect: 'wide', xlabel: 't (μs)', ylabel: 'Pₑ', axesAt: 'edge', curves: [{ fn: `sin(pi*${W}*x)^2`, color: 'accent', width: 2.4 }, { fn: `(pi*${W}*x)^2`, color: 'gold', width: 2, dash: [6, 4] }], hlines: [{ y: 1, color: 'ink4' }] }, caption: 'Exact (blue) and first-order (gold, dashed) excitation on resonance for this drive.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI * W * tt) ** 2, feedback: t`$\Omega t/2 = \pi\times(\Omega/2\pi)\times t$: you dropped the factor ½.` }, { value: ex, feedback: 'That is the exact Rabi value; the question asks for the first-order prediction.' }].filter((e) => Math.abs(e.value - ans) > 0.012 * ans),
          hints: [t`$\Omega t/2 = \pi\times${W}\times${tt}$ (MHz × μs is a pure number).`],
          teach: t`First order gives the start of Rabi’s $\sin^2(\Omega t/2)$: $(\Omega t/2)^2$, reliable only while it is small.`,
          explain: t`$(\pi\times${W}\times${tt})^2 = ${fmt(ans, 3)}$. The exact answer is $\sin^2(${fmt(Math.PI * W * tt, 3)}) = ${fmt(ex, 3)}$: ${ans < 0.1 ? 'close, because P is small.' : 'already noticeably different, because P is no longer small.'}`,
        };
      },
    }),
    num({
      id: 'step-on', difficulty: 3,
      gen(r) {
        const V = r.pick([2, 5, 10]), dE = r.pick([100, 200, 400]), tns = r.pick([3, 7, 12]);    // μeV, μeV, ns
        const w = (dE * 1e-6 * QE) / HBAR, ans = ((4 * (V / dE) ** 2) * Math.sin((w * tns * 1e-9) / 2) ** 2);
        return {
          prompt: t`A constant perturbation with matrix element $V_{fi} = ${V}\ \mu\text{eV}$ is switched on at $t = 0$ between two levels $${dE}\ \mu\text{eV}$ apart. First-order theory gives $P = \dfrac{4|V_{fi}|^2}{\hbar^2\omega_{fi}^2}\sin^2\dfrac{\omega_{fi}t}{2}$. What is $P$ after $${tns}$ ns?`,
          visual: { type: 'graph', params: { x: [0, 20], y: [0, r6(4 * (V / dE) ** 2 * 1.2)], aspect: 'wide', xlabel: 't (ns)', ylabel: 'P', axesAt: 'edge', curves: [{ fn: `${r6(4 * (V / dE) ** 2)}*sin(${r6(w * 1e-9 / 2)}*x)^2`, color: 'accent', width: 2.4 }] }, caption: 'The first-order transition probability after a sudden switch-on: it oscillates, never growing past 4|V|²/(ħω)².' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 4 * (V / dE) ** 2, feedback: t`That is the largest value; at this time evaluate $\sin^2(\omega_{fi}t/2)$ as well.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\hbar\omega_{fi} = ${dE}\ \mu\text{eV}$, so $\dfrac{4|V|^2}{\hbar^2\omega_{fi}^2} = 4(${V}/${dE})^2$.`, t`$\omega_{fi} = ${dE}\ \mu\text{eV}/\hbar = ${tex(w, 4)}\ \text{s}^{-1}$.`],
          teach: 'A non-resonant perturbation switched on suddenly makes a small probability that oscillates at the transition frequency; it never accumulates.',
          explain: t`$4(${V}/${dE})^2 = ${tex(4 * (V / dE) ** 2, 3)}$ and $\omega_{fi}t/2 = ${fmt((w * tns * 1e-9) / 2, 4)}$ rad, so $P = ${tex(ans, 3)}$. When many final states share the same $V$ the oscillations at different $\omega$ wash out and leave a steady growth $\propto t$ — the golden rule of the next lesson.`,
        };
      },
    }),
    mcq({
      id: 'grows', difficulty: 2,
      prompt: t`On resonance, the first-order probability $(\Omega t/2)^2$ grows without bound. What is the right conclusion?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 1.6], aspect: 'wide', xlabel: 't (μs)', ylabel: 'P', axesAt: 'edge', curves: [{ fn: 'sin(pi*0.5*x)^2', color: 'accent', width: 2.4, label: 'exact', labelAt: 2.5, labelDy: -10 }, { fn: '(pi*0.5*x)^2', color: 'gold', width: 2, dash: [6, 4], label: 'first order', labelAt: 0.75, labelDx: 8 }], hlines: [{ y: 1, color: 'ink4' }] }, caption: 'Resonant drive at Ω/2π = 0.5 MHz: exact (blue) and first order (gold).' },
      choices: [
        'First order is valid only while the probability it predicts is small; after that, use the exact (or a higher-order) solution',
        'Probability is not conserved in a driven system',
        'The system is certain to have made the transition once P passes 1',
        'Resonant perturbations are always too strong for perturbation theory',
      ],
      answer: 0,
      why: {
        1: 'The exact evolution is unitary and conserves probability; the approximation does not.',
        2: 'The exact probability oscillates (Rabi flopping); it never exceeds 1.',
        3: 'A weak resonant drive is perfectly described by first order for short times.',
      },
      hints: [t`First order assumed $c_i \approx 1$ throughout. When does that stop being true?`],
      teach: 'Perturbation theory is valid while the system has barely left its initial state.',
      explain: t`Deriving the formula set $c_i = 1$ inside the integral. Once $P$ is no longer small the initial state is depleted and that step fails. The exact result $\sin^2(\Omega t/2)$ agrees at small $t$ and then turns over.`,
    }),
    num({
      id: 'best-tau', difficulty: 3,
      gen(r) {
        const f = r.pick([0.5, 1, 2, 5]);                                   // MHz
        const ans = Math.SQRT2 / (2 * Math.PI * f * 1e6) * 1e9;               // ns
        return {
          prompt: t`A Gaussian field pulse $E_0e^{-t^2/\tau^2}$ with fixed $E_0$ kicks a charged oscillator of frequency $\omega/2\pi = ${f}$ MHz. The first-order excitation is $P \propto \tau^2e^{-\omega^2\tau^2/2}$. Which $\tau$, in ns, excites it most?`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 0.85], aspect: 'wide', xlabel: 'ωτ', ylabel: 'P (relative)', axesAt: 'edge', curves: [{ fn: 'x^2*exp(-x^2/2)', color: 'accent', width: 2.4 }] }, caption: 'The excitation against pulse length (in units of 1/ω): zero for very short and very long pulses.' },
          answer: ans, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: 1 / (2 * Math.PI * f * 1e6) * 1e9, feedback: t`Maximize $x^2e^{-x^2/2}$ with $x = \omega\tau$: the derivative vanishes at $x = \sqrt2$, not 1.` }, { value: Math.SQRT2 / (f * 1e6) * 1e9, feedback: t`$\omega = 2\pi f$: divide by $2\pi$.` }],
          hints: [t`Let $x = \omega\tau$ and maximize $x^2e^{-x^2/2}$.`, t`$\dfrac{d}{dx}\bigl(x^2e^{-x^2/2}\bigr) = (2x - x^3)e^{-x^2/2} = 0$ at $x = \sqrt2$.`],
          teach: 'A pulse excites a transition best when its duration is about the period: too short and it carries little impulse, too long and it is adiabatic.',
          explain: t`$\omega\tau = \sqrt2$ gives $\tau = \sqrt2/(2\pi\times${f}\ \text{MHz}) = ${fmt(ans, 4)}$ ns.`,
        };
      },
    }),
    mcq({
      id: 'zero-element', difficulty: 2,
      prompt: t`A uniform electric field pulse acts on a charged harmonic oscillator in its ground state. Why does first-order theory give no transition to $|2\rangle$?`,
      visual: pulse(1.4, 'A Gaussian pulse; the perturbation is −qE(t)x.'),
      choices: [
        t`$\langle2|x|0\rangle = 0$: $x \propto a + a^\dagger$ changes $n$ by exactly one`,
        'The energy of level 2 is too high for any pulse',
        'Level 2 has the wrong parity for any perturbation',
        'The pulse is too short',
      ],
      answer: 0,
      why: {
        1: 'Fourier components exist at every frequency for a short pulse; the obstacle is the matrix element.',
        2: t`$|2\rangle$ has the same parity as $|0\rangle$; an even perturbation such as $x^2$ would connect them.`,
        3: 'Pulse length changes how big an allowed transition is, not whether it is allowed.',
      },
      hints: [t`Write $x = \sqrt{\hbar/2m\omega}\,(a + a^\dagger)$.`],
      teach: 'A transition is forbidden in first order when its matrix element vanishes — the origin of selection rules.',
      explain: t`$x|0\rangle \propto |1\rangle$, so $\langle2|x|0\rangle = 0$. Reaching $|2\rangle$ needs two steps — second order, with probability $\propto E_0^4$.`,
    }),
    mcq({
      id: 'adiabatic', difficulty: 2,
      prompt: t`A perturbation is switched on very slowly, over a time much longer than $1/\omega_{fi}$. What does first-order theory say about the transition probability?`,
      visual: pulse(5, 'A long pulse (ωτ = 5): E(t) cos ωt (blue) oscillates many times under the envelope, and its area nearly cancels.'),
      choices: [
        t`It is tiny: the integrand $V(t)e^{i\omega_{fi}t}$ oscillates many times while $V$ barely changes, so the integral nearly cancels`,
        'It is large, because the perturbation acts for a long time',
        'It equals the time-averaged perturbation squared',
        'It is exactly zero for any finite switching time',
      ],
      answer: 0,
      why: {
        1: t`Duration helps only for the frequency component at $\omega_{fi}$; a slow switch has almost none.`,
        2: t`Only the Fourier component at $\omega_{fi}$ matters, not the average.`,
        3: 'It is exponentially small for a smooth (Gaussian) switch, not exactly zero.',
      },
      hints: [t`The amplitude is the Fourier transform of $V(t)$ at $\omega_{fi}$. What is the Fourier transform of a smooth, slow function at high frequency?`],
      teach: 'Slow changes do not cause transitions — the adiabatic theorem (lesson M7.5) in first-order form.',
      explain: t`For a Gaussian switch the amplitude carries $e^{-\omega^2\tau^2/4}$, falling faster than any power of $\tau$. The system stays in the instantaneous eigenstate: adiabatic following.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dot', difficulty: 3, transfer: true,
      gen(r) {
        const hw = r.pick([2, 3, 5]), E0 = r.pick([500, 1000, 2000]), tau = r.pick([0.2, 0.3, 0.5]);   // meV, V/m, ps
        const m = 0.067 * ME, w = (hw * 1e-3 * QE) / HBAR, ans = kick(QE, E0, m, w, tau * 1e-12);
        return {
          prompt: t`An electron in a GaAs quantum dot (effective mass $0.067\,m_e$) is confined in a harmonic potential with $\hbar\omega = ${hw}$ meV, the basis of a terahertz detector. A unipolar terahertz pulse with a Gaussian profile, $E_0e^{-t^2/\tau^2}$ with $E_0 = ${E0}$ V/m and $\tau = ${tau}$ ps passes. Using $P_{0\to1} = \dfrac{(eE_0)^2}{2m\hbar\omega}\pi\tau^2e^{-\omega^2\tau^2/2}$, find the excitation probability.`,
          visual: pulse(w * tau * 1e-12, `The pulse and its overlap with the dot’s oscillation (ωτ = ${fmt(w * tau * 1e-12, 3)}).`),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: kick(QE, E0, ME, w, tau * 1e-12), feedback: 'Use the effective mass, 0.067 mₑ.' }, { value: ans / Math.exp(-((w * tau * 1e-12) ** 2) / 2), feedback: t`Include the Fourier factor $e^{-\omega^2\tau^2/2}$.` }],
          hints: [t`$\omega = ${hw}\ \text{meV}/\hbar = ${tex(w, 4)}\ \text{s}^{-1}$, so $\omega\tau = ${fmt(w * tau * 1e-12, 4)}$.`, t`$m = 0.067\times${tex(ME, 5)}$ kg; put everything in SI.`],
          teach: 'The kicked-oscillator formula sets a detector’s response: largest when the pulse lasts about one oscillation period.',
          explain: t`$\dfrac{(eE_0)^2}{2m\hbar\omega}\pi\tau^2 = ${tex(ans / Math.exp(-((w * tau * 1e-12) ** 2) / 2), 3)}$ and $e^{-\omega^2\tau^2/2} = ${tex(Math.exp(-((w * tau * 1e-12) ** 2) / 2), 3)}$, so $P = ${tex(ans, 3)}$ — small, as first order requires.`,
        };
      },
    }),
    mcq({
      id: 'cp-fourier', difficulty: 2,
      prompt: t`To first order, what property of $V(t)$ decides whether it causes the transition $i \to f$?`,
      visual: pulse(1.4, t`A pulse and its product with $\cos\omega_{fi}t$.`),
      choices: [
        t`The Fourier component of $V_{fi}(t)$ at the transition frequency $\omega_{fi}$`,
        t`Its peak value only`,
        t`Its time average`,
        t`How long it lasts, regardless of its shape`,
      ],
      answer: 0,
      why: {
        1: 'A huge but slowly varying perturbation can cause almost no transitions.',
        2: t`A perturbation with zero average (a pure oscillation at $\omega_{fi}$) is the most effective.`,
        3: 'Shape matters: a smooth long pulse is far less effective than a sharp one of the same duration.',
      },
      hints: [t`Look at the formula: $\int V_{fi}(t')e^{i\omega_{fi}t'}dt'$.`],
      teach: 'First-order transition amplitudes are Fourier transforms of the perturbation at the transition frequency.',
      explain: t`$c_f \propto \tilde V_{fi}(\omega_{fi})$. This is why spectroscopy works: a field drives a transition only through its spectral content at that transition’s frequency.`,
    }),
    num({
      id: 'cp-short', difficulty: 2,
      gen(r) {
        const W = r.pick([0.05, 0.1, 0.15]), D = r.pick([0.5, 1, 2]), tt = r.pick([0.3, 0.7, 1.1]);   // MHz, MHz, μs
        const ans = (W / D) ** 2 * Math.sin(Math.PI * D * tt) ** 2;
        return {
          prompt: t`A weak drive ($\Omega/2\pi = ${W}$ MHz) is detuned by $\Delta/2\pi = ${D}$ MHz. First order gives $P = (\Omega/\Delta)^2\sin^2(\Delta t/2)$. What is $P$ after $${tt}\ \mu\text{s}$?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, r6(1.25 * (W / D) ** 2)], aspect: 'wide', xlabel: 't (μs)', ylabel: 'P', axesAt: 'edge', curves: [{ fn: `${r6((W / D) ** 2)}*sin(pi*${D}*x)^2`, color: 'accent', width: 2.4 }] }, caption: 'The first-order probability for this weak, detuned drive.' },
          answer: ans, tol: { rel: 0.01, abs: 1e-5 },
          errors: [{ value: (W / D) ** 2 * Math.sin(2 * Math.PI * D * tt) ** 2, feedback: t`$\Delta t/2 = \pi\times(\Delta/2\pi)\times t$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans + 1e-5),
          hints: [t`$\Delta t/2 = \pi\times${D}\times${tt}$.`],
          teach: 'Off resonance a weak drive makes only small, oscillating excitation of size (Ω/Δ)².',
          explain: t`$(${W}/${D})^2 = ${tex((W / D) ** 2, 3)}$ and $\sin^2(\pi\times${D}\times${tt}) = ${fmt(Math.sin(Math.PI * D * tt) ** 2, 3)}$, so $P = ${tex(ans, 3)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §11.1', url: 'https://www.cambridge.org/9781316995433' },
  ],
});
