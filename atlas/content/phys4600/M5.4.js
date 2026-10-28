// Radiation reaction (Griffiths §11.2.2–11.2.3). Energy balance for periodic
// motion gives the Abraham–Lorentz force F = (μ₀q²/6πc) ȧ = mτȧ, with
// τ = μ₀q²/6πmc = 6.27 × 10⁻²⁴ s for an electron (cτ = ⅔rₑ). Honestly
// labelled: with no external force it admits runaway solutions a ∝ e^{t/τ};
// demanding none brings preacceleration, a response that begins about τ
// before the force does — a sign that the classical point electron is not a
// consistent theory (Landau–Lifshitz's reduced form and, finally, QED fix
// it). Explore: a graph of the solutions for a step force, with a slider for
// the free constant. Worked example: radiation damping of a classical
// electron oscillator at 589 nm (γ = ω²τ, a 15.6 ns lifetime against the
// sodium 3p level's 16.2 ns, the agreement explained by its oscillator
// strength). Transfer: cyclotron cooling of an electron in a Penning trap.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, C, QE, ME, MP, PI, sf, tauAL, larmor } from './_em4c.js';

const t = String.raw;
const MMU = 1.883531627e-28;   // muon mass, kg (CODATA 2022)
const RE = 2.8179403205e-15;   // classical electron radius, m (CODATA 2022)
const TAU = tauAL();

// the worked example: a classical electron oscillator at the sodium D line, 589 nm
const EX = { lam: 589e-9 };
EX.w = (2 * PI * C) / EX.lam;
EX.gam = EX.w ** 2 * TAU;
EX.life = 1 / EX.gam;
EX.Q = EX.w / EX.gam;
if (Math.abs((C * TAU) / RE - 2 / 3) > 1e-6) throw new Error('M5.4: cτ = ⅔ r_e');

/** Solutions of a = F/m + τȧ for a step force at t = 0 (graph; time in τ, a in F/m); s fixes the free constant (1: no runaway). */
function stepPic(caption, { live = false, s = 1, mark = null } = {}) {
  const pre = 's*exp(x)', post = '1 + (s - 1)*exp(x)';
  return {
    type: 'graph',
    params: {
      x: [-4, 2.5], y: [-2.6, 3.4], aspect: 'wide', axesAt: 'edge', xlabel: 'time ÷ τ', ylabel: 'acceleration ÷ (F/m)', yticks: 6,
      ...(live ? { sliders: [{ key: 's', label: t`Acceleration at $t = 0$, as a fraction of $F/m$`, min: 0, max: 1.6, step: 0.05, value: s, explain: t`The Abraham–Lorentz equation is third order, so it needs one more starting condition than Newton’s. This slider is that extra number; only the value 1 avoids a runaway.` }] } : { constants: { s } }),
      curves: [
        { fn: 'step(x)', domain: [-4, 2.5], color: 'ink3', width: 1.6, dash: [6, 4], label: 'applied force', labelAt: 1.2, labelDx: 0, labelDy: 14 },
        { fn: pre, domain: [-4, 0], color: 'gold', width: 2.6 },
        { fn: post, domain: [0, 2.5], color: 'gold', width: 2.6 },
      ],
      ...(mark ? { points: mark } : {}),
      ...(live ? { readouts: [{ label: t`$a$ just before the force acts, at $t = -\tau$`, expr: 's*exp(-1)', digits: 3 }, { label: t`$a$ at $t = 2.5\tau$`, expr: '1 + (s - 1)*exp(2.5)', digits: 3 }] } : {}),
    },
    caption,
  };
}

/** A damped oscillation: the radiating oscillator's displacement and its energy envelope (graph, time in units of the energy lifetime). */
function decayPic(caption) {
  return {
    type: 'graph',
    params: {
      x: [0, 3], y: [-1.15, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'time ÷ lifetime 1/γ', ylabel: 'displacement', yticks: 0,
      curves: [
        { fn: 'exp(-x/2)*cos(40*x)', domain: [0, 3], color: 'accent', width: 1.4, samples: 3000 },
        { fn: 'exp(-x/2)', domain: [0, 3], color: 'gold', width: 2, dash: [6, 4], label: 'amplitude ∝ exp(−γt/2)', labelAt: 1.7, labelDx: 4, labelDy: -12 },
        { fn: '-exp(-x/2)', domain: [0, 3], color: 'gold', width: 2, dash: [6, 4] },
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4600.M5.4',
  title: 'Radiation reaction',
  minutes: 17, difficulty: 4,
  equation: t`\vec F_{\text{rad}} = \frac{\mu_0q^2}{6\pi c}\,\dot{\vec a} = m\tau\,\dot{\vec a}, \qquad \tau = \frac{\mu_0q^2}{6\pi mc}`,
  intro: t`A charge that radiates loses energy, so something must push back on it: the **radiation reaction**. Demand that over a stretch of motion that starts and ends in the same state (a whole cycle, say) the work done by this force equals minus the energy Larmor says was radiated. Integrating $a^2$ by parts turns it into $-\vec v\cdot\dot{\vec a}$ plus a boundary term that vanishes, and out comes the **Abraham–Lorentz force**, proportional to the rate of change of acceleration, $\dot{\vec a}$ (the jerk). For an electron $\tau = 6.27\times10^{-24}$ s, the time light takes to cross $\tfrac23$ of a femtometre: the force matters only for changes that fast. Be warned: this force is **not** a fully consistent piece of physics. It makes Newton’s law third order, it allows electrons that accelerate by themselves, and avoiding that makes them respond **before** a force arrives. Classical electrodynamics breaks down here; quantum electrodynamics takes over.`,
  symbols: [
    { tex: '\\vec F_{\\text{rad}}', text: 'the radiation-reaction (Abraham–Lorentz) force on the charge, in N' },
    { tex: '\\dot{\\vec a}', text: t`the rate of change of the charge’s acceleration, in $\text{m/s}^3$` },
    { tex: 'q,\\ m', text: 'the charge (C) and mass (kg) of the particle' },
    { tex: '\\tau', text: t`the characteristic time, $6.27\times10^{-24}$ s for an electron` },
    { tex: '\\mu_0,\\ c', text: 'the permeability of free space and the speed of light' },
  ],
  why: t`Radiation damping sets the natural width of spectral lines, cools electrons in particle traps and storage rings, and its paradoxes — runaways and acausal responses — mark exactly where the classical picture of a point electron stops working.`,
  visual: {
    ...stepPic(t`Solutions of $a = F/m + \tau\dot a$ when a constant force switches on at $t = 0$ (dashed), with time in units of $\tau$ (about $6\times10^{-24}$ s for an electron) and acceleration in units of $F/m$. Exact solutions of the Abraham–Lorentz equation; which one nature would choose is the problem.`, { live: true, s: 0 }),
    title: 'Runaways and preacceleration',
    lead: t`A force $F$ switches on at $t = 0$ and stays on. Newton would give a jump to $a = F/m$. The Abraham–Lorentz equation is third order and needs one more starting value: the slider sets the acceleration at $t = 0$. Watch what each choice does.`,
    tasks: [
      t`Slider at 0 — a causal start, nothing before the force: after $t = 0$ the acceleration heads off toward $-\infty$ exponentially. A **runaway**.`,
      t`Slider above 1: a runaway the other way, even though the force is constant.`,
      t`Slider at exactly 1: no runaway — but now the charge starts accelerating **before** the force arrives, as $e^{t/\tau}$. That is **preacceleration**.`,
    ],
  },
  example: {
    prompt: t`Model a sodium atom’s valence electron as a classical charge on a spring oscillating at the frequency of the yellow light it emits, $\lambda = ${EX.lam * 1e9}$ nm. Radiation reaction damps it. How long does its energy take to fall by a factor of $e$?`,
    visual: decayPic('A radiating oscillator (blue) losing amplitude (gold envelope). The real oscillation is far faster: about 50 million radians per lifetime, not 40 as drawn.'),
    steps: [
      { label: 'The equation', text: t`$m\ddot x = -m\omega_0^2x + m\tau\dddot x$. The radiation term is tiny, so evaluate it on the undamped motion, where $\dddot x = -\omega_0^2\dot x$.` },
      { label: 'A damping force', text: t`Then $m\tau\dddot x \approx -m\tau\omega_0^2\,\dot x$: an ordinary drag force, with damping rate $\gamma = \omega_0^2\tau$. The energy decays as $e^{-\gamma t}$.` },
      { label: 'Numbers', text: t`$\omega_0 = 2\pi c/\lambda = ${tex(EX.w, 3)}$ rad/s, so $\gamma = \omega_0^2\tau = ${tex(EX.gam, 3)}\ \text{s}^{-1}$ and the lifetime $1/\gamma \approx ${nice(sf(EX.life * 1e9, 3))}$ ns.` },
      { label: 'Was the shortcut fair?', text: t`$\gamma/\omega_0 = \omega_0\tau \approx ${tex(1 / EX.Q, 2)}$: the oscillator swings about $${tex(EX.Q, 2)}$ radians while its energy drains. A very lightly damped oscillator, so evaluating the small term on the undamped motion is fine.` },
      { label: 'Against experiment', text: t`Sodium’s 3p level lives 16.2 ns. The quantum rate is the classical one times $3f\,g_{\text{lower}}/g_{\text{upper}}$, and for this line the oscillator strength $f \approx 0.96$ with $g$ ratio $2/6$ makes that factor nearly 1 — a happy case. For most transitions classical damping is only an order-of-magnitude guide.` },
    ],
    answer: t`$\gamma = \omega_0^2\tau \approx ${tex(EX.gam, 3)}\ \text{s}^{-1}$, a lifetime of about ${nice(sf(EX.life * 1e9, 3))} ns.`,
  },
  practice: [
    num({
      id: 'tau', difficulty: 1,
      gen(r) {
        const [name, m] = r.pick([['an electron', ME], ['a muon', MMU], ['a proton', MP]]);
        const tau = (MU0 * QE * QE) / (6 * PI * m * C);
        return {
          prompt: t`Compute the Abraham–Lorentz time $\tau = \mu_0q^2/6\pi mc$ for ${name}, in units of $10^{-24}$ s.`,
          visual: stepPic(t`On this graph time is measured in units of $\tau$ — the particle’s whole radiation-reaction story happens within a few of them.`, { s: 1 }),
          answer: tau / 1e-24, tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * QE * QE) / (4 * PI * m * C)) / 1e-24, feedback: t`The factor is $6\pi$, from Larmor’s $\mu_0q^2a^2/6\pi c$.` }],
          hints: [t`$q = e = 1.602\times10^{-19}$ C for all three.`, t`$\tau = \dfrac{\mu_0e^2}{6\pi mc}$: only the mass changes.`],
          teach: 'The radiation-reaction time μ₀q²/6πmc is about 10⁻²³ s or less — heavier particles have smaller τ.',
          explain: t`$\tau \approx ${tex(tau, 3)}$ s. ${m === ME ? t`Light crosses $c\tau = \tfrac23r_e \approx 1.9$ fm in that time.` : 'Smaller than the electron’s by the mass ratio: heavier particles feel radiation reaction even less.'}`,
        };
      },
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: t`Put the steps of the energy-balance derivation of the Abraham–Lorentz force in order.`,
      visual: decayPic('The energy a radiating charge loses over time must come from the work done on it by the radiation-reaction force.'),
      items: [
        t`Require $\int_{t_1}^{t_2}\vec F_{\text{rad}}\cdot\vec v\,dt = -\int_{t_1}^{t_2}\dfrac{\mu_0q^2a^2}{6\pi c}\,dt$`,
        t`Write $a^2 = \dot{\vec v}\cdot\dot{\vec v}$ and integrate by parts`,
        t`Get $\bigl[\vec v\cdot\vec a\bigr]_{t_1}^{t_2} - \int\vec v\cdot\dot{\vec a}\,dt$`,
        t`Drop the boundary term: the motion is periodic, or $\vec v\cdot\vec a = 0$ at both ends`,
        t`Read off $\vec F_{\text{rad}} = \dfrac{\mu_0q^2}{6\pi c}\dot{\vec a}$`,
      ],
      hints: [t`Start from the energy bookkeeping, end with the force.`, t`The integration by parts produces a boundary term, which must be disposed of before reading off the force.`],
      teach: 'The Abraham–Lorentz force comes from energy balance plus an integration by parts whose boundary term must vanish.',
      explain: t`Equating the integrands is a choice: the derivation only fixes the force **on average** over motions that repeat. That is the first hint that the result is not a law in the same sense as Larmor’s formula.`,
    }),
    mcq({
      id: 'runaway', difficulty: 2,
      prompt: t`With no external force, the Abraham–Lorentz equation $a = \tau\dot a$ has the solution $a = a_0e^{t/\tau}$. What does that mean?`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 60], aspect: 'wide', axesAt: 'edge', xlabel: 'time ÷ τ', ylabel: 'acceleration ÷ a₀', yticks: 4, curves: [{ fn: 'exp(x)', domain: [0, 5], color: 'gold', width: 2.6 }], hlines: [{ y: 1, label: 'a₀', color: 'ink3' }] } , caption: t`The solution $a = a_0e^{t/\tau}$ with no force at all, time in units of $\tau$: after five $\tau$ — about $3\times10^{-23}$ s for an electron — it has grown 150-fold.` },
      choices: [
        'It is a runaway: an isolated charge accelerating ever faster by itself. Unphysical, so it must be excluded — and excluding it causes other trouble',
        t`It describes an electron slowly losing energy to radiation`,
        t`It is harmless, because $\tau$ is so small that $e^{t/\tau}$ stays close to 1`,
        'It describes how a charge reaches its terminal velocity',
      ],
      answer: 0,
      why: {
        1: t`Losing energy would mean slowing down; $e^{t/\tau}$ grows, and with it the kinetic energy and the radiated power.`,
        2: t`The opposite: $\tau$ is small, so after a mere $10^{-21}$ s the factor is $e^{160}$.`,
        3: 'There is no terminal state: the acceleration itself grows without limit.',
      },
      hints: [t`What happens to $e^{t/\tau}$ after a few hundred $\tau$?`, 'Is energy conserved if an isolated charge speeds up while also radiating?'],
      teach: 'The Abraham–Lorentz equation allows self-accelerating runaways; they are excluded by hand.',
      explain: t`The runaway gains kinetic energy and radiates at the same time, with nothing supplying either. It is excluded by demanding $a \to 0$ as $t \to \infty$, which leads to preacceleration instead.`,
    }),
    num({
      id: 'pre', difficulty: 3,
      gen(r) {
        const N = r.pick([1, 2, 3, 5]);
        return {
          prompt: t`In the runaway-free solution, a force $F$ switches on at $t = 0$, and before that the acceleration is $a = (F/m)e^{t/\tau}$. What fraction of its final value $F/m$ does the acceleration already have at $t = -${N}\tau$?`,
          visual: stepPic(t`The runaway-free solution: the acceleration (gold) begins rising before the force (dashed) switches on. Time in units of $\tau$.`, { s: 1 }),
          answer: Math.exp(-N), tol: { rel: 0.01 },
          errors: [{ value: 1 - Math.exp(-N), feedback: t`At $t < 0$ the acceleration is $e^{t/\tau}$ itself, small and growing, not $1 - e^{t/\tau}$.` }],
          hints: [t`Before the force acts, the solution is $a = (F/m)e^{t/\tau}$; divide by $F/m$.`, t`Put $t = -${N}\tau$ into $e^{t/\tau}$.`],
          teach: 'The runaway-free solution preaccelerates: a response τ or so before the cause.',
          explain: t`$e^{-${N}} \approx ${nice(sf(Math.exp(-N), 3))}$. The charge “knows” about the force a few $\tau$ — a few $10^{-24}$ s — before it acts: an acausal response, too small to see but a clear sign that the theory is incomplete.`,
        };
      },
    }),
    num({
      id: 'lifetime', difficulty: 2,
      gen(r) {
        const [lam, what] = r.pick([[121.6, 'hydrogen’s Lyman-alpha ultraviolet line'], [656.3, 'hydrogen’s red H-alpha line'], [1064, 'a neodymium laser’s infrared line'], [500, 'green light']]);
        const w = (2 * PI * C) / (lam * 1e-9), life = 1 / (w * w * TAU);
        return {
          prompt: t`A classical electron oscillator radiates at ${lam} nm (${what}). Radiation reaction damps its energy at the rate $\gamma = \omega_0^2\tau$. What is its lifetime $1/\gamma$, in ns?`,
          visual: decayPic('A radiating classical oscillator losing energy; its envelope decays at γ/2 in amplitude, γ in energy. Oscillations not drawn to scale.'),
          answer: life * 1e9, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: (1 / ((C / (lam * 1e-9)) ** 2 * TAU)) * 1e9, feedback: t`Use the angular frequency $\omega_0 = 2\pi c/\lambda$, not $c/\lambda$.` }],
          hints: [t`$\omega_0 = 2\pi c/\lambda$; $\tau = ${tex(TAU, 3)}$ s.`, t`$1/\gamma = 1/(\omega_0^2\tau)$.`],
          teach: 'Classical radiation damping gives optical lifetimes of nanoseconds, scaling as λ².',
          explain: t`$\omega_0 = ${tex(w, 3)}$ rad/s, so $1/\gamma \approx ${nice(sf(life * 1e9, 3))}$ ns. The lifetime grows as $\lambda^2$: infrared transitions are slow, ultraviolet ones fast.`,
        };
      },
    }),
    mcq({
      id: 'when', difficulty: 2,
      prompt: t`When can radiation reaction safely be ignored in calculating a charge’s motion?`,
      visual: stepPic(t`Radiation reaction acts on a timescale $\tau$; anything that changes more slowly barely notices it.`, { s: 1 }),
      choices: [
        t`When the forces change slowly compared with $\tau$ — for an electron, anything slower than about $10^{-23}$ s — and the energy radiated is small compared with the work the forces do`,
        t`Only when the charge moves slowly compared with $c$`,
        'Never: it always dominates the motion of an electron',
        'Only when the charge is in a magnetic field',
      ],
      answer: 0,
      why: {
        1: t`Fast charges can still have negligible radiation reaction (a straight-line linac); what matters is how fast the acceleration changes and how much energy is radiated.`,
        2: t`For almost every motion $\tau$ is far shorter than any timescale of the forces, so it is a tiny correction.`,
        3: 'It acts on any accelerated charge, in any field.',
      },
      hints: [t`Compare the reaction force $m\tau\dot a$ with the applied force $ma$: their ratio is $\tau\dot a/a$.`, t`If the force varies on a timescale $T$, then $\dot a/a \sim 1/T$.`],
      teach: 'Radiation reaction is a correction of relative size τ/T: negligible unless forces change on ~10⁻²³ s or the radiation adds up, as in a storage ring.',
      explain: t`$F_{\text{rad}}/F \sim \tau/T$. Even an optical field ($T \sim 10^{-15}$ s) gives $10^{-8}$. It still matters when small effects accumulate over many cycles — damping an atom’s oscillation, or a storage-ring beam — and in ultra-intense laser fields.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-trap', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([1, 3, 5.4, 6]);
        const wc = (QE * B) / ME, T = 1 / (2 * TAU * wc * wc);
        return {
          prompt: t`A Penning trap holds a single electron in a ${B} T field, circling at the cyclotron frequency $\omega_c = eB/m_e$. Its circular motion radiates, and radiation reaction damps it: with $P = m\tau\omega_c^2v^2$ and kinetic energy $K = \tfrac12mv^2$, the energy decays as $e^{-t/T}$. Find $T$, in seconds.`,
          visual: decayPic('The cyclotron motion’s energy draining away as the electron radiates — the trap’s “cooling”. Oscillations not to scale (there are tens of billions of turns per second).'),
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 2 * T, feedback: t`$dK/dt = -m\tau\omega_c^2v^2 = -2\tau\omega_c^2K$: the rate is $2\tau\omega_c^2$.` }],
          hints: [t`Larmor with $a = \omega_cv$: $P = \dfrac{\mu_0e^2\omega_c^2v^2}{6\pi c} = m\tau\omega_c^2v^2$.`, t`$dK/dt = -P = -2\tau\omega_c^2K$, so $T = 1/(2\tau\omega_c^2)$.`],
          teach: t`Radiation reaction cools a trapped electron’s cyclotron motion in a fraction of a second to seconds — slow, because $\tau\omega_c$ is tiny.`,
          explain: t`$\omega_c = ${tex(wc, 3)}$ rad/s, so $T = 1/(2\tau\omega_c^2) \approx ${nice(sf(T, 3))}$ s. Free-space cooling like this lets the electron settle into its lowest cyclotron states; in the precision measurements of the electron’s magnetic moment the trap’s metal walls change the rate, and the physicists tune them to make it slower still.`,
        };
      },
    }),
    mcq({
      id: 'cp-status', difficulty: 3,
      prompt: t`What is the best description of the Abraham–Lorentz equation’s status?`,
      visual: stepPic(t`The two pathologies on one graph: a causal start that runs away ($s = 0$ in the Explore graph) — the only cure is preacceleration.`, { s: 0 }),
      choices: [
        t`A useful approximation for slow, gentle motion, derived from energy balance; as an exact law for a point charge it fails (runaways, preacceleration), and quantum electrodynamics replaces it`,
        'An exact law of nature, confirmed in detail by experiment',
        'A mistake in Griffiths that has since been corrected and plays no role in physics',
        'Proof that electrons have a finite classical radius of 2.8 fm',
      ],
      answer: 0,
      why: {
        1: 'Its runaway and acausal solutions are not seen; no experiment confirms the equation as an exact law.',
        2: 'Its weak-damping consequences (line widths, cooling of trapped particles, storage-ring damping) are real and used daily.',
        3: t`$r_e$ is a length built from constants, not a measured size; experiments find the electron pointlike down to below $10^{-18}$ m.`,
      },
      hints: ['Which of its predictions are seen, and which are not?', 'Where does a classical point charge stop being a good model?'],
      teach: 'Radiation reaction is real; the Abraham–Lorentz equation is an approximate classical description that breaks down at its own timescale τ.',
      explain: t`Used perturbatively — evaluate $\tau\dot a$ on the motion without it, as in the worked example (the Landau–Lifshitz form) — it works, with no runaways. Taken as exact for a point charge it fails, at timescales $\sim\tau$ and lengths $\sim c\tau$ where quantum effects (the electron’s reduced Compton wavelength is about 200 times $c\tau$) have long since taken over.`,
    }),
    num({
      id: 'cp-ratio', difficulty: 3, transfer: true,
      gen(r) {
        const [lam, what] = r.pick([[800, 'a titanium–sapphire laser at 800 nm'], [1064, 'a neodymium laser at 1064 nm'], [10600, 'a carbon-dioxide laser at 10.6 μm'], [515, 'a frequency-doubled laser at 515 nm']]);
        const w = (2 * PI * C) / (lam * 1e-9), ratio = w * TAU;
        return {
          prompt: t`An electron is shaken by ${what}. Estimate the size of the radiation-reaction force compared with the laser’s own force on it, $F_{\text{rad}}/F \approx \omega\tau$ for a slow electron, in units of $10^{-8}$.`,
          visual: decayPic('An electron oscillating in a light wave. The damping from radiation reaction is drawn far stronger than it is.'),
          answer: ratio / 1e-8, units: '', tol: { rel: 0.01 },
          errors: [{ value: (ratio / (2 * PI)) / 1e-8, feedback: t`Use the angular frequency, $\omega = 2\pi c/\lambda$.` }],
          hints: [t`For $x = x_0\cos\omega t$, $\dot a = \omega a$ in size, so $F_{\text{rad}}/F = m\tau\omega a/ma$.`, t`Give the answer in units of $10^{-8}$.`],
          teach: 'For a slow electron in light, radiation reaction is ωτ ~ 10⁻⁸ of the driving force.',
          explain: t`$\omega\tau \approx ${tex(ratio, 3)}$ — a few parts in $10^{8}$. In ultra-intense lasers the electron becomes relativistic and radiation reaction grows steeply, until it can rival the laser’s force: experiments at the most powerful lasers have begun to see it, a test of exactly the physics this lesson flags as uncertain.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §11.2.2–11.2.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Landau & Lifshitz, The Classical Theory of Fields (4th ed.), §75: radiation damping', url: 'https://www.sciencedirect.com/book/9780080250724/the-classical-theory-of-fields' },
    { label: 'NIST Atomic Spectra Database: sodium 3s–3p transition probabilities', url: 'https://www.nist.gov/pml/atomic-spectra-database' },
    { label: 'Cole et al. 2018, Experimental evidence of radiation reaction in the collision of a high-intensity laser pulse with a laser-wakefield accelerated electron beam, Phys. Rev. X 8, 011020', url: 'https://doi.org/10.1103/PhysRevX.8.011020' },
  ],
});
