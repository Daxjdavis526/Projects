// Fermi's golden rule (Griffiths & Schroeter §11.3; Sakurai §5.7). From the
// first-order probability of M7.2 summed over a continuum of final states:
// the window sin²(Δωt/2)/(Δω/2)² has height t², width ~ 2π/t and area 2πt,
// so the total probability grows ∝ t at the rate Γ = (2π/ħ)|V_fi|²ρ(E_f).
// Conditions: a density of states smooth on the scale ħ/t, t long enough to
// resolve it but short enough that P ≪ 1 (the steady decay that follows is
// Wigner–Weisskopf). A real rate: hydrogen 2p → 1s by spontaneous emission,
// the golden rule with the photon density of states, Γ = ω³|d|²/3πε₀ħc³
// with |⟨1s|r|2p⟩|² = (2¹⁵/3¹⁰)a₀² and the reduced mass: 6.265 × 10⁸ s⁻¹,
// τ = 1.596 ns (the textbook value; measurements agree at 1.60 ns). Z⁴
// scaling for hydrogen-like ions; natural linewidth 1/2πτ = 99.7 MHz.
// Transfer: the natural width of Lyman-α in astrophysical spectra.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, C, ALPHA, A0, RYD, QE, MP_ME, EPS0, r6 } from './_q2b.js';

const t = String.raw;
const MU = 1 / (1 + 1 / MP_ME);                                   // reduced-mass factor μ/mₑ for hydrogen
const R2 = 2 ** 15 / 3 ** 10;                                     // |⟨100|r|21m⟩|² in a₀² (any m)
const W21 = (0.75 * RYD * QE * MU) / HBAR;                       // rad/s, Lyman-α
const A21 = (4 * ALPHA * W21 ** 3 * R2 * (A0 / MU) ** 2) / (3 * C * C);
const TAU = 1 / A21;
const LYA = (2 * Math.PI * C) / W21;                              // m, 121.5 nm (vacuum)
const HB_UEVNS = (HBAR / QE) * 1e6 * 1e9;                         // ħ in μeV ns: 0.658 21…
/** The golden-rule window picture: F(Δω) = sin²(Δωt/2)/((Δω/2)²t), level comb spacing s (rad/ns). */
const windowPic = (tt, s, caption, sliders = false) => ({
  type: 'graph',
  params: {
    x: [-20, 20], y: [-0.4, 10.6], aspect: 'wide', xlabel: 'Δω = ω(f) − ω (rad/ns)', ylabel: 'window ÷ t', axesAt: 'edge', xticks: 8, yticks: 5,
    ...(sliders ? { sliders: [{ key: 'T', label: 'Time $t$', min: 0.3, max: 10, step: 0.1, value: tt, unit: '\\text{ns}', explain: 'How long the perturbation has acted.' }] } : {}),
    curves: [{ fn: `sin(x*${sliders ? 'T' : tt}/2)^2/((x/2)^2*${sliders ? 'T' : tt})`, color: 'accent', width: 2.4, samples: 2000 }],
    points: Array.from({ length: 2 * Math.floor(20 / s) + 1 }, (_, k) => ({ x: r6((k - Math.floor(20 / s)) * s), y: 0, r: 2.6, color: 'gold' })),
    ...(sliders ? { readouts: [{ label: t`central peak’s width $4\pi/t$ (rad/ns)`, expr: '4*pi/T', digits: 3 }, { label: 'final states inside it', expr: `floor(4*pi/T/${s}) + 1`, digits: 3 }] } : {}),
  },
  caption,
});

export default lesson({
  id: 'phys4710.M7.3',
  title: 'Fermi’s golden rule',
  minutes: 18, difficulty: 4,
  intro: t`A perturbation coupling one state to a **continuum** of final states — an excited atom to every possible photon, an electron to every outgoing direction — does not make the system flop back and forth. The many final states dephase, and probability drains away at a constant rate:

$$\begin{gathered} \Gamma_{i\to f} = \frac{2\pi}{\hbar}\,|V_{fi}|^2\,\rho(E_f) \end{gathered}$$

The rate needs two things: the coupling to a typical final state, and **how many final states** there are per unit energy at the energy that conservation picks out.`,
  symbols: [
    { tex: '\\Gamma_{i\\to f}', text: 'the transition rate, in s⁻¹: probability per unit time; its inverse is a lifetime' },
    { tex: 'V_{fi}', text: 'the matrix element ⟨f|V|i⟩ of the perturbation to a final state of the right energy, in joules' },
    { tex: '\\rho(E_f)', text: 'the density of final states: how many states per joule (per unit energy) at the final energy' },
    { tex: 'E_f', text: t`the final energy, fixed by energy conservation: $E_i$ for a constant perturbation, $E_i \pm \hbar\omega$ for one oscillating at $\omega$` },
    { tex: '\\hbar', text: 'the reduced Planck constant' },
  ],
  why: 'Spontaneous emission, beta decay, photo-ionization, scattering rates, conductivities, neutrino cross sections: almost every rate in physics is the golden rule.',
  visual: {
    ...windowPic(1, 2, 'The first-order weight of each final state after time t, divided by t so that its area stays 2π: the central peak narrows as 4π/t and grows as t. Gold dots: final states 2 rad/ns apart (illustrative).', true),
    title: 'Why a constant rate appears',
    lead: t`After a time $t$, each final state at detuning $\Delta\omega$ has been fed with weight $\propto \sin^2(\Delta\omega t/2)/(\Delta\omega/2)^2$. Here that window is divided by $t$, so its area is fixed. The gold dots are the final states.`,
    tasks: [
      'At t = 1 ns the window covers many final states: the total probability is t times a fixed area — a steady rate.',
      'Increase t to 10 ns: the window becomes narrower than the spacing of the levels. Now only one state is fed, and the system just oscillates with it — no rate.',
      'The golden rule lives in between: the window must be wider than the level spacing yet the probability still small.',
    ],
  },
  example: {
    prompt: t`Derive the golden rule from first-order theory, then apply it to spontaneous emission: an excited hydrogen atom in the $2p$ state coupled to the continuum of photon modes. Find the decay rate of $2p \to 1s$ and the lifetime.`,
    visual: windowPic(2, 0.4, 'With final states closely spaced (gold), the window (blue) samples a smooth density of states: the sum becomes an integral.'),
    steps: [
      { label: 'One final state', text: t`For a constant $V$ switched on at $t = 0$ (M7.2): $P_f(t) = \dfrac{|V_{fi}|^2}{\hbar^2}\dfrac{\sin^2(\Delta\omega t/2)}{(\Delta\omega/2)^2}$ with $\Delta\omega = (E_f - E_i)/\hbar$.` },
      { label: 'Many final states', text: t`Sum over states, $\sum_f \to \int\rho(E_f)\,dE_f$. For large $t$ the window is tall and narrow around $\Delta\omega = 0$, with $\displaystyle\int\frac{\sin^2(xt/2)}{(x/2)^2}dx = 2\pi t$; it acts like $2\pi t\,\delta(\Delta\omega)$.` },
      { label: 'Rate', text: t`$P(t) = \dfrac{|V_{fi}|^2}{\hbar^2}\,\rho\,\hbar\cdot2\pi t$, so $\Gamma = dP/dt = \dfrac{2\pi}{\hbar}|V_{fi}|^2\rho(E_i)$.` },
      { label: 'Photon modes', text: t`In a box of volume $\mathcal V$, photons of frequency near $\omega$ have $\rho = \mathcal V\omega^2/\pi^2\hbar c^3$ per unit energy (both polarizations), and each mode couples with $|V|^2 = \dfrac{\hbar\omega}{2\epsilon_0\mathcal V}|\vec d\cdot\hat\varepsilon|^2$. Averaging $|\vec d\cdot\hat\varepsilon|^2$ over directions gives $|\vec d|^2/3$; $\mathcal V$ cancels.` },
      { label: 'Spontaneous rate', text: t`$\Gamma = \dfrac{\omega^3|\vec d|^2}{3\pi\epsilon_0\hbar c^3}$, with $\vec d = e\langle1s|\vec r|2p\rangle$ and $|\langle1s|\vec r|2p\rangle|^2 = \dfrac{2^{15}}{3^{10}}a^2 = ${fmt(R2, 4)}\,a^2$.` },
      { label: 'Numbers', text: t`With the reduced mass ($a = ${fmt(A0 / MU * 1e12, 6)}$ pm, $\hbar\omega = \tfrac34\times13.6057\times${fmt(MU, 6)} = ${fmt((W21 * HBAR) / QE, 5)}$ eV): $\omega = ${tex(W21, 5)}\ \text{s}^{-1}$ and $\Gamma = ${tex(A21, 4)}\ \text{s}^{-1}$.` },
      { label: 'Lifetime', text: t`$\tau = 1/\Gamma = ${fmt(TAU * 1e9, 4)}$ ns, as measured (1.60 ns). The ingredients were a matrix element, the photon density of states and one integral — and the 1/3 from averaging over directions.` },
    ],
    answer: t`$\Gamma = \tfrac{2\pi}{\hbar}|V_{fi}|^2\rho$; for hydrogen $2p \to 1s$, $\Gamma = \omega^3|d|^2/3\pi\epsilon_0\hbar c^3 = ${tex(A21, 4)}\ \text{s}^{-1}$ and $\tau = ${fmt(TAU * 1e9, 4)}$ ns.`,
  },
  practice: [
    num({
      id: 'rate', difficulty: 2,
      gen(r) {
        const V = r.pick([0.5, 1, 2, 4]), rho = r.pick([0.2, 0.5, 2]);          // μeV, states per μeV
        const ans = ((2 * Math.PI) / HB_UEVNS) * V * V * rho;                      // per ns
        return {
          prompt: t`A discrete level couples with $|V_{fi}| = ${V}\ \mu\text{eV}$ to a continuum with $${rho}$ states per μeV at its energy. What is the golden-rule decay rate, in $\text{ns}^{-1}$? ($\hbar = ${fmt(HB_UEVNS, 5)}\ \mu\text{eV ns}$.)`,
          visual: windowPic(1.5, 0.5, 'A discrete level feeding a dense set of final states (gold) through the first-order window (blue).'),
          answer: ans, units: 'ns^-1', tol: { rel: 0.01 },
          errors: [{ value: ans / (2 * Math.PI), feedback: t`The golden rule has $2\pi/\hbar$, not $1/\hbar$.` }, { value: ((2 * Math.PI) / HB_UEVNS) * V * rho, feedback: t`The coupling enters squared: $|V_{fi}|^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\Gamma = \dfrac{2\pi}{\hbar}|V_{fi}|^2\rho$; with $V$ in μeV and $\rho$ in μeV⁻¹, $|V|^2\rho$ is in μeV.`, t`Divide by $\hbar$ in μeV ns to get ns⁻¹.`],
          teach: 'A rate is (2π/ħ)|V|²ρ: energy squared times states per energy gives an energy, and dividing by ħ makes it a rate.',
          explain: t`$|V|^2\rho = ${fmt(V * V * rho, 4)}\ \mu\text{eV}$, so $\Gamma = 2\pi\times${fmt(V * V * rho, 4)}/${fmt(HB_UEVNS, 5)} = ${fmt(ans, 4)}\ \text{ns}^{-1}$ — a lifetime of $${fmt(1 / ans, 3)}$ ns.`,
        };
      },
    }),
    mcq({
      id: 'discrete', difficulty: 2,
      prompt: t`An atom has a ground state coupled resonantly by a laser to *one* excited state. Can the golden rule give its transition rate?`,
      visual: windowPic(10, 3, 'A narrow window and widely spaced final states: only one state is inside.'),
      choices: [
        'No: with a single discrete final state the probability oscillates (Rabi flopping); the golden rule needs a continuum, or a broad line',
        'Yes: the rate is (2π/ħ)|V|² with ρ = 1',
        'Yes, but only on resonance',
        'No: the golden rule applies only to emission, never to absorption',
      ],
      answer: 0,
      why: {
        1: 'ρ is a density per unit energy; for a single sharp level it is a delta function, and the formula breaks down.',
        2: 'On resonance is exactly the Rabi case of M7.1: oscillation, not a rate.',
        3: 'It applies to absorption from a broadband source, or into a broad (decaying) level, just as well.',
      },
      hints: ['What did the window need to cover for a constant rate to appear?'],
      teach: 'The golden rule needs a continuum: either many final states, or a broad source or line that supplies one.',
      explain: t`A rate appears because many final states dephase; with one sharp state there is nothing to dephase against and the amplitude just flops. Laser absorption gets a rate only when the line is broadened (by decay, Doppler motion, or a broadband source) — then $\rho$ is the line shape.`,
    }),
    num({
      id: 'linewidth', difficulty: 2,
      gen(r) {
        const [name, tau] = r.pick([['hydrogen 2p', TAU * 1e9], ['the sodium 3p (D lines)', 16.25], ['the rubidium-87 5P₃/₂ (D2 line)', 26.24], ['the caesium 6P₃/₂ (D2 line)', 30.47]]);
        const ans = 1 / (2 * Math.PI * tau * 1e-9) / 1e6;
        return {
          prompt: t`An excited state decays with lifetime $\tau = ${fmt(tau, 4)}$ ns (${name}). The decay makes its energy uncertain: the emission line is a Lorentzian of full width $\Gamma = 1/\tau$ in angular frequency. What is that natural linewidth $\Gamma/2\pi$, in MHz?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [0, 1.15], aspect: 'wide', xlabel: 'detuning (units of Γ)', ylabel: 'line shape', axesAt: 'edge', curves: [{ fn: '1/(1 + 4*x^2)', color: 'accent', width: 2.4 }], arrows: [{ from: [-0.5, 0.5], to: [0.5, 0.5], color: 'gold', label: 'Γ (FWHM)', labelDx: 8 }, { from: [0.5, 0.5], to: [-0.5, 0.5], color: 'gold' }] }, caption: 'The Lorentzian line shape of a decaying state, with its full width at half maximum.' },
          answer: ans, units: 'MHz', tol: { rel: 0.01 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$\Gamma = 1/\tau$ is in rad/s; divide by $2\pi$ for hertz.` }, { value: ans / 2, feedback: 'The full width is Γ; half of it is the half width.' }],
          hints: [t`$\Gamma/2\pi = \dfrac{1}{2\pi\tau}$.`],
          teach: 'A lifetime τ gives a natural linewidth 1/2πτ in hertz: the energy–time trade-off made quantitative by the golden rule.',
          explain: t`$1/(2\pi\times${fmt(tau, 4)}\ \text{ns}) = ${fmt(ans, 4)}$ MHz. Laser cooling and atomic clocks are built around these widths${name.includes('rubidium') ? ' (Rb’s 6.07 MHz sets its Doppler cooling limit, 146 μK)' : ''}.`,
        };
      },
    }),
    num({
      id: 'z4', difficulty: 3,
      gen(r) {
        const [Z, ion] = r.pick([[2, 'He⁺'], [3, 'Li²⁺'], [6, 'C⁵⁺']]);
        const ans = (TAU * 1e9) / Z ** 4 * 1000;                                       // ps
        return {
          prompt: t`For a hydrogen-like ion of charge $Z$, the transition energy scales as $Z^2$ and the size of the orbit (so the dipole matrix element) as $1/Z$. Using $\Gamma \propto \omega^3|d|^2$ and hydrogen’s $\tau_{2p} = ${fmt(TAU * 1e9, 4)}$ ns, estimate the $2p$ lifetime of ${ion}, in ps. (Ignore the small change in reduced mass.)`,
          visual: { type: 'graph', params: { x: [0.5, 6.5], y: [-3, 0.4], ylog: true, aspect: 'wide', xlabel: 'Z', ylabel: 'τ(2p) (ns)', axesAt: 'edge', xticks: 6, curves: [{ fn: `log10(${r6(TAU * 1e9)}/x^4)`, domain: [1, 6.2], color: 'accent', width: 2.4 }], points: [{ x: 1, y: r6(Math.log10(TAU * 1e9)), color: 'gold', label: 'H' }] }, caption: 'The 2p lifetime of hydrogen-like ions on a log scale against nuclear charge (non-relativistic scaling).' },
          answer: ans, units: 'ps', tol: { rel: 0.01 },
          errors: [{ value: (TAU * 1e9) / Z ** 6 * 1000, feedback: t`The matrix element shrinks as $1/Z$, so $|d|^2 \propto Z^{-2}$: $\Gamma \propto Z^6\cdot Z^{-2} = Z^4$.` }, { value: (TAU * 1e9) / Z ** 2 * 1000, feedback: t`$\omega^3$ alone gives $Z^6$; with $|d|^2 \propto Z^{-2}$ the rate grows as $Z^4$.` }],
          hints: [t`$\omega \propto Z^2$ gives $\omega^3 \propto Z^6$; $|d|^2 \propto Z^{-2}$.`, t`So $\Gamma \propto Z^4$ and $\tau \propto Z^{-4}$.`],
          teach: 'Spontaneous emission rates of hydrogen-like ions grow as Z⁴: highly charged ions radiate fast.',
          explain: t`$\tau = ${fmt(TAU * 1e9, 4)}\ \text{ns}/${Z}^4 = ${fmt(ans, 4)}$ ps. (Measured lifetimes agree once relativistic and reduced-mass corrections, which grow with Z, are included.)`,
        };
      },
    }),
    mcq({
      id: 'linear-t', difficulty: 3,
      prompt: t`For one final state, first-order probability oscillates. For a continuum, the total grows linearly in $t$. Why?`,
      visual: windowPic(3, 0.3, 'The window (÷ t) after 3 ns, over a dense set of final states.'),
      choices: [
        t`The window $\sin^2(\Delta\omega t/2)/(\Delta\omega/2)^2$ has height $t^2$ but width $\propto 1/t$, so its area — the sum over a smooth density of states — grows as $t$`,
        'Each final state’s probability grows linearly in time',
        'The perturbation gets stronger with time',
        'Probability leaks out of the system at a rate set by its energy',
      ],
      answer: 0,
      why: {
        1: t`Each one oscillates; only near $\Delta\omega = 0$ does it grow, as $t^2$.`,
        2: 'The perturbation is constant here.',
        3: 'The rate depends on the coupling and the density of states, not on the energy alone.',
      },
      hints: [t`Height × width of the central peak: $t^2 \times 1/t$.`, 'A smooth ρ can be taken outside the integral over the window.'],
      teach: 'Linear growth (a rate) comes from integrating a sharpening window over a smooth density of states.',
      explain: t`$\int\frac{\sin^2(xt/2)}{(x/2)^2}dx = 2\pi t$. As long as $\rho$ is smooth across the window’s width $\sim 2\pi/t$, the total probability is $2\pi t|V|^2\rho/\hbar$: a constant rate.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lya', difficulty: 3, transfer: true,
      gen(r) {
        const which = r.pick(['pm', 'mhz']);
        const dnu = 1 / (2 * Math.PI * TAU), dl = (LYA * LYA * dnu) / C;
        const ans = which === 'pm' ? dl * 1e12 : dnu / 1e6;
        return {
          prompt: t`Hydrogen’s Lyman-α line ($2p \to 1s$, $\lambda = ${fmt(LYA * 1e9, 5)}$ nm) dominates the ultraviolet spectra of galaxies and the interstellar medium. Its 2p state lives $\tau = ${fmt(TAU * 1e9, 4)}$ ns. What is the line’s natural width ${which === 'pm' ? t`in wavelength, $\Delta\lambda = \lambda^2\Delta\nu/c$, in pm` : 'in frequency, in MHz'}?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [0, 1.15], aspect: 'wide', xlabel: 'detuning (units of the natural width)', ylabel: 'line shape', axesAt: 'edge', curves: [{ fn: '1/(1 + 4*x^2)', color: 'violet', width: 2.4 }] }, caption: 'The natural (Lorentzian) profile of Lyman-α. In real gas clouds Doppler broadening is far larger, but the Lorentzian wings dominate in very thick clouds (damped Lyman-α absorbers).' },
          answer: ans, units: which === 'pm' ? 'pm' : 'MHz', tol: { rel: 0.01 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$\Delta\nu = 1/(2\pi\tau)$, not $1/\tau$.` }],
          hints: [t`$\Delta\nu = 1/(2\pi\tau)$.`, t`$\Delta\lambda = \lambda^2\Delta\nu/c$.`],
          teach: 'The golden-rule lifetime fixes a line’s natural width; for Lyman-α it is about 100 MHz, a few femtometres in wavelength.',
          explain: t`$\Delta\nu = 1/(2\pi\times${fmt(TAU * 1e9, 4)}\ \text{ns}) = ${fmt(dnu / 1e6, 4)}$ MHz${which === 'pm' ? t`; $\Delta\lambda = (${fmt(LYA * 1e9, 5)}\ \text{nm})^2\times${fmt(dnu / 1e6, 4)}\ \text{MHz}/c = ${fmt(dl * 1e12, 3)}$ pm` : ''}. Its wings, though tiny per atom, become broad absorption troughs when column densities reach $10^{20}$ atoms per cm², which is how damped Lyman-α systems are found.`,
        };
      },
    }),
    num({
      id: 'cp-rate', difficulty: 2,
      gen(r) {
        const V = r.pick([3, 6, 10]), rho = r.pick([0.01, 0.05, 0.1]);         // μeV, per μeV
        const G = ((2 * Math.PI) / HB_UEVNS) * V * V * rho, ans = 1 / G;          // ns
        return {
          prompt: t`A quantum-dot level couples to a reservoir with $|V_{fi}| = ${V}\ \mu\text{eV}$ and density of states $${rho}$ per μeV. What lifetime, in ns, does the golden rule predict? ($\hbar = ${fmt(HB_UEVNS, 5)}\ \mu\text{eV ns}$.)`,
          visual: windowPic(1, 0.5, 'A level emptying into a reservoir of dense states.'),
          answer: ans, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: G, feedback: 'That is the rate; the lifetime is its inverse.' }, { value: ans * 2 * Math.PI, feedback: t`Keep the $2\pi$ in $\Gamma = 2\pi|V|^2\rho/\hbar$.` }],
          hints: [t`$\Gamma = 2\pi|V|^2\rho/\hbar$, then $\tau = 1/\Gamma$.`],
          teach: 'Lifetime = 1/Γ, with Γ from the golden rule.',
          explain: t`$\Gamma = 2\pi\times${V * V}\times${rho}/${fmt(HB_UEVNS, 5)} = ${fmt(G, 4)}\ \text{ns}^{-1}$, so $\tau = ${fmt(ans, 4)}$ ns.`,
        };
      },
    }),
    mcq({
      id: 'cp-conditions', difficulty: 2,
      prompt: t`Which condition is *not* needed for the golden rule to hold?`,
      visual: windowPic(1, 0.6, 'The window over a dense set of final states.'),
      choices: [
        'The final states must all have exactly the same coupling and energy',
        'The density of final states is smooth over an energy range ħ/t',
        'The elapsed time is long enough for the window to be narrow compared with how ρ and V vary',
        'The initial state is still nearly full (first order is valid)',
      ],
      answer: 0,
      why: {
        1: 'This is needed: a smooth ρ is what turns the sum into an integral.',
        2: 'This is needed: the window must pick out energy-conserving states.',
        3: 'This is needed: the derivation is first order.',
      },
      hints: ['Only states inside the window matter. What must be true of them, and what need not be?'],
      teach: 'The golden rule needs a smooth continuum, an intermediate time and weak coupling — not identical final states.',
      explain: t`The final states may differ; $|V_{fi}|^2\rho$ is evaluated at the energy-conserving value (an average there). What matters is smoothness on the scale $\hbar/t$, a window narrow compared with how they vary, and weak enough coupling. The exponential decay that continues beyond $P \ll 1$ is the Wigner–Weisskopf extension.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §11.4', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Steck, Sodium, Rubidium 87 and Cesium D Line Data (natural lifetimes)', url: 'https://steck.us/alkalidata/' },
  ],
});
