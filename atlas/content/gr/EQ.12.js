// The linearized field equations in Lorenz (harmonic) gauge, dissected:
// g = η + h, h̄ = h − ½ηh, □h̄_μν = −(16πG/c⁴)T_μν with ∂^μ h̄_μν = 0
// (Carroll's signs, (−,+,+,+), x⁰ = ct). Checked: a static point mass gives
// h̄₀₀ = 4GM/(c²r), so h₀₀ = h_ii = 2GM/(c²r) — the weak-field metric
// g₀₀ = −(1 + 2Φ/c²), g_ii = 1 − 2Φ/c². Avoids repeating gr.S28.i (sizes of
// h, superposition, polarization counting, gauge and gravitomagnetism).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C, MPC, sci, round, table4, YEAR } from './_eq.js';

const t = String.raw;
const MAS = Math.PI / 648e6;    // radians per milliarcsecond

const LIN = t`\Box\,\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}\,T_{\mu\nu}`;

// light and a gravitational wave from one event, on a spacetime diagram (c = 1)
const sameCone = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.3, 6.3], y: [-0.3, 4.4], equal: true, xlabel: 'distance (light-years, schematic)', ylabel: 'time (years)',
    curves: [
      { fn: 'x', domain: [0, 4.2], color: 'gold', width: 5, label: 'light', labelAt: 3.3, labelDx: 10, labelDy: 8 },
      { fn: 'x', domain: [0, 4.2], color: 'violet', width: 2, dash: true, label: 'gravitational wave', labelAt: 2.2, labelDx: 10, labelDy: 8 },
    ],
    points: [{ x: 0, y: 0, color: 'bad', r: 6, label: 'merger' }],
  },
  caption: caption ?? 'A spacetime diagram drawn with c = 1: light and a gravitational wave leaving the same event follow the same 45° line — the wave equation’s speed is c.',
});

// the ripple of a static star, h_μν = diag(ε, ε, ε, ε)
const hTable = table4({
  cells: [['ε', '0', '0', '0'], ['0', 'ε', '0', '0'], ['0', '0', 'ε', '0'], ['0', '0', '0', 'ε']],
  colors: [['gold', 'ink4', 'ink4', 'ink4'], ['ink4', 'accent', 'ink4', 'ink4'], ['ink4', 'ink4', 'accent', 'ink4'], ['ink4', 'ink4', 'ink4', 'accent']],
  rowName: 'μ', colName: 'ν', dx: -4,
  caption: t`The ripple $h_{\mu\nu}$ of a star at rest, in its weak field: the same small number $\varepsilon = 2GM/(c^2r)$ on the whole diagonal — time and space are curved by the same amount.`,
});

// T_μν of a star at rest: energy density, and a pressure far smaller
const tStar = table4({
  cells: [['ρc²', '0', '0', '0'], ['0', 'p', '0', '0'], ['0', '0', 'p', '0'], ['0', '0', '0', 'p']],
  colors: [['gold', 'ink4', 'ink4', 'ink4'], ['ink4', 'ink3', 'ink4', 'ink4'], ['ink4', 'ink4', 'ink3', 'ink4'], ['ink4', 'ink4', 'ink4', 'ink3']],
  rowName: 'μ', colName: 'ν', dx: -8,
  caption: t`The stress–energy $T_{\mu\nu}$ of a star at rest. In the Sun the pressure $p$ is at most a few millionths of $\rho c^2$, and nothing flows: $T_{0i} = 0$.`,
});

// h̄₀₀ (∝ −Φ) for a uniform ball of radius R, in units of its value at the surface
const hbarProfile = {
  type: 'graph',
  params: {
    x: [0, 5], y: [0, 1.65], xlabel: 'r / R', ylabel: 'h̄₀₀ ÷ value at the surface',
    curves: [{ fn: '(3 - x^2)/2', domain: [0, 1], color: 'teal' }, { fn: '1/x', domain: [1, 5], color: 'accent' }],
    vlines: [{ x: 1, label: 'surface' }],
  },
  caption: t`The static solution $\bar h_{00}$ for a uniform ball: largest at the centre and falling off as $1/r$ outside — $-4\Phi/c^2$, with $\Phi$ Newton's potential.`,
};

// a ray grazing a body (angle hugely exaggerated)
const grazing = (name) => ({
  type: 'graph',
  params: {
    x: [-4.2, 4.2], y: [-1.6, 2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.4 },
      { param: ['t', '1.08 - 0.12*(sqrt(1 + t^2) - 1)'], t: [-4.2, 4.2], color: 'accent', width: 2.2 },
      { param: ['t', '1.2 + 0.12*t'], t: [-1, 4.2], color: 'ink3', width: 1.2, dash: true },
    ],
    points: [{ x: 0, y: 0, r: 0.01, color: 'gold', label: name, labelDx: -18, labelDy: 0 }],
  },
  caption: 'Not to scale: a ray of starlight grazing a body bends toward it; dashed, the straight line it arrived on. The real angle is far too small to draw.',
});

// two stars orbiting each other
const binary = {
  type: 'graph',
  params: {
    x: [-2.4, 2.4], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', dash: true, width: 1.2 }],
    points: [{ x: 1, y: 0, color: 'gold', r: 7, label: 'star' }, { x: -1, y: 0, color: 'accent', r: 7, label: 'star' }],
    arrows: [{ from: [1, 0], to: [1, 0.7], color: 'gold' }, { from: [-1, 0], to: [-1, -0.7], color: 'accent' }],
  },
  caption: 'Two stars in orbit: each one’s path bends because of the other’s gravity.',
};

export default lesson({
  id: 'gr.EQ.12',
  kind: 'dissection',
  title: 'The linearized field equations',
  minutes: 9, difficulty: 3,
  badges: ['est-der'],
  equation: t`\begin{gathered}\part{1}{g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}} \qquad\quad \part{2}{\bar h_{\mu\nu} \equiv h_{\mu\nu} - \tfrac12\eta_{\mu\nu}h} \\[6pt] \part{3}{\Box}\,\part{2}{\bar h_{\mu\nu}} = \part{4}{-\frac{16\pi G}{c^4}}\,\part{5}{T_{\mu\nu}} \qquad\quad \part{6}{\partial^\mu\bar h_{\mu\nu} = 0}\end{gathered}`,
  intro: t`Almost everywhere gravity is weak: the metric is flat spacetime plus a small ripple. Keep only what is first order in the ripple and Einstein's equations become **linear** — ripples add — and, with the trace reversed and the coordinates chosen well, every component obeys a **wave equation** sourced by matter, just as Maxwell's equations do in electromagnetism. Their solutions are the weak-field metric of stars and planets and the gravitational waves LIGO detects.

Conventions: Carroll's signs, signature $(-,+,+,+)$, $x^0 = ct$; indices run over $0$–$3$ and are raised and lowered with the flat $\eta_{\mu\nu}$. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}`, name: 'flat spacetime plus a ripple', badge: 'est-der',
      text: t`$\eta_{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$ is the flat Minkowski metric; $h_{\mu\nu}$ is the small departure from it, $|h_{\mu\nu}| \ll 1$ — about $10^{-9}$ at the Earth's surface, $10^{-6}$ at the Sun's, $10^{-21}$ for a gravitational wave passing the Earth.

Dropping every term of second order in $h$ is what makes the theory linear. It fails where $h$ is not small: at neutron stars, near black holes, in a merger.`,
    },
    {
      tex: t`\bar h_{\mu\nu} \equiv h_{\mu\nu} - \tfrac12\eta_{\mu\nu}h`, name: 'the trace-reversed ripple', badge: 'est-der',
      text: t`$h = \eta^{\mu\nu}h_{\mu\nu}$ is the trace of the ripple ($\mu$ and $\nu$ summed, with $\eta^{00} = -1$). Subtracting $\tfrac12\eta_{\mu\nu}h$ **reverses** the trace: in four dimensions $\eta^{\mu\nu}\bar h_{\mu\nu} = h - 2h = -h$, and the same step undoes it, $h_{\mu\nu} = \bar h_{\mu\nu} - \tfrac12\eta_{\mu\nu}\bar h$.

It carries the same information as $h$, repackaged so that the field equations separate into ten wave equations, one per component.`,
    },
    {
      tex: t`\Box`, name: 'the wave operator', badge: 'est-obs', units: t`$\text{m}^{-2}$`,
      text: t`$\Box = \eta^{\alpha\beta}\partial_\alpha\partial_\beta = -\dfrac{1}{c^2}\dfrac{\partial^2}{\partial t^2} + \nabla^2$, the d'Alembertian. Where there is no matter the equation is $\Box\bar h_{\mu\nu} = 0$: ripples travel at exactly the speed of light — **gravity is not instantaneous**.

Tested in 2017: gravitational waves and gamma rays from the neutron-star merger GW170817 arrived 1.7 s apart after 130 million years of travel. For static fields $\Box$ becomes $\nabla^2$, and the equation becomes Poisson's.`,
    },
    {
      tex: t`-\frac{16\pi G}{c^4}`, name: 'the coupling', badge: 'est-der', units: t`$\text{N}^{-1}$`,
      text: t`Twice Einstein's $8\pi G/c^4$: in this gauge the linearized Einstein tensor is $G_{\mu\nu} = -\tfrac12\Box\bar h_{\mu\nu}$, so $G_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$ becomes this. ($G$ is Newton's constant, $c$ the speed of light.)

The minus sign makes gravity attract: for a static mass $\nabla^2\bar h_{00} = -16\pi G\rho/c^2$, whose solution is $\bar h_{00} = 4GM/(c^2r)$ — that is, $-4\Phi/c^2$ with Newton's potential $\Phi = -GM/r$.`,
    },
    {
      tex: t`T_{\mu\nu}`, name: 'the source', badge: 'est-der', units: t`$\text{J/m}^3$`,
      text: t`The stress–energy of the matter, computed as though spacetime were flat. Each component sources its own $\bar h_{\mu\nu}$. For a star at rest only $T_{00} = \rho c^2$ matters, so only $\bar h_{00}$ is switched on; converting back gives $h_{00} = h_{ii} = 2GM/(c^2r)$ — space curved as much as time, which is why light bends twice the Newtonian amount.

Moving masses add $T_{0i}$ and with it gravitomagnetism; a changing distribution of $T_{00}$ radiates gravitational waves.`,
    },
    {
      tex: t`\partial^\mu\bar h_{\mu\nu} = 0`, name: 'the Lorenz (harmonic) gauge', badge: 'est-der', units: t`$\text{m}^{-1}$`,
      text: t`Four conditions, one for each $\nu$ ($\partial^\mu = \eta^{\mu\alpha}\partial_\alpha$, with $\mu$ summed). They choose the coordinates, using the freedom to relabel spacetime by $x^\mu \to x^\mu + \xi^\mu$, which shifts $h_{\mu\nu}$ by $\partial_\mu\xi_\nu + \partial_\nu\xi_\mu$ without changing anything physical. It is gravity's twin of the Lorenz gauge $\partial_\mu A^\mu = 0$, which turns Maxwell's equations into $\Box A^\mu = -\mu_0J^\mu$.

A choice, not a law — but taking the divergence of the field equation shows it needs $\partial^\mu T_{\mu\nu} = 0$: the source must conserve its energy and momentum.`,
    },
  ],
  readAloud: t`Treat the metric as flat spacetime plus a small ripple; reverse its trace and choose the coordinates well, and every component of the ripple obeys a wave equation sourced by the matter's stress–energy with coupling 16πG/c⁴ — so gravity spreads at the speed of light.`,
  why: t`This is where gravitational waves come from, and how Einstein's equations give the weak-field metric of stars and planets — including the factor of two in light bending.`,
  visual: {
    type: 'gr-dustball',
    title: 'A solution of □h̄ = 0',
    lead: t`Far from its source, a gravitational wave is a solution of $\Box\bar h_{\mu\nu} = 0$ travelling at $c$. In suitable coordinates only two combinations survive, $h_+$ and $h_\times$. Here one passes through a ring of free particles, straight out of the screen. Press **Play**.`,
    tasks: [
      'Watch the ring stretch one way while it squeezes the other, then swap — the + polarization.',
      'Switch to × : the same pattern, turned by 45°.',
      'The drawn strain is about 10²⁰ times the real one; LIGO senses strains near 10⁻²¹.',
    ],
    params: { mode: 'wave', modes: ['wave'], pol: 'plus', pols: true, h: 0.5, t: 0 },
  },
  practice: [
    mcq({
      id: 'wave-op', difficulty: 1,
      prompt: t`$$\underbrace{\Box}_{\text{?}}\,\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}\,T_{\mu\nu}, \qquad \Box = -\frac{1}{c^2}\frac{\partial^2}{\partial t^2} + \nabla^2$$ In empty space $T_{\mu\nu} = 0$. What does the marked operator then tell you about gravity?`,
      choices: [
        'Changes in the field travel as waves at the speed of light: gravity is not instantaneous',
        'Gravity acts instantaneously, as in Newton’s theory',
        'Gravitational waves travel at a speed set by the source’s mass',
        'There is no gravity at all in empty space',
      ],
      answer: 0,
      why: {
        1: t`Newton's $\nabla^2\Phi = 4\pi G\rho$ has no time derivatives and acts instantly; the $-\partial_t^2/c^2$ in $\Box$ is exactly what replaces that.`,
        2: t`The speed in $\Box$ is $c$, the same for every source.`,
        3: t`$\Box\bar h = 0$ has wave solutions, and static ones too — such as the field outside a star.`,
      },
      hints: [t`$-\dfrac{1}{c^2}\dfrac{\partial^2 f}{\partial t^2} + \nabla^2 f = 0$ is the equation of waves moving at what speed?`],
      teach: 'Linearized gravity obeys a wave equation with speed c: gravity propagates, it does not act instantly.',
      explain: t`$\Box\bar h_{\mu\nu} = 0$ is the wave equation with speed $c$. In 2017 the neutron-star merger GW170817 sent both gravitational waves and light; they arrived 1.7 s apart after 130 million years, so the two speeds agree to about one part in $10^{15}$.`,
      visual: sameCone(),
    }),
    mcq({
      id: 'trace-reverse', difficulty: 2,
      prompt: t`Outside a star at rest the ripple is $h_{\mu\nu} = \operatorname{diag}(\varepsilon, \varepsilon, \varepsilon, \varepsilon)$, with $\varepsilon = 2GM/(c^2r)$, so its trace is $h = \eta^{\mu\nu}h_{\mu\nu} = -\varepsilon + 3\varepsilon = 2\varepsilon$. What are $\bar h_{00}$ and $\bar h_{xx}$?`,
      choices: [
        t`$\bar h_{00} = 2\varepsilon$ and $\bar h_{xx} = 0$`,
        t`$\bar h_{00} = \varepsilon$ and $\bar h_{xx} = \varepsilon$ — trace reversal changes nothing here`,
        t`$\bar h_{00} = 0$ and $\bar h_{xx} = 2\varepsilon$`,
        t`$\bar h_{00} = -\varepsilon$ and $\bar h_{xx} = \varepsilon$`,
      ],
      answer: 0,
      why: {
        1: t`The trace $h = 2\varepsilon$ is not zero, so subtracting $\tfrac12\eta_{\mu\nu}h$ does change the components.`,
        2: t`Mind the sign of $\eta_{00} = -1$: $\bar h_{00} = \varepsilon - \tfrac12(-1)(2\varepsilon) = 2\varepsilon$.`,
        3: t`That forgets the subtraction for $\bar h_{xx}$: $\varepsilon - \tfrac12(+1)(2\varepsilon) = 0$.`,
      },
      hints: [t`$\bar h_{00} = h_{00} - \tfrac12\eta_{00}h$ with $\eta_{00} = -1$.`, t`$\bar h_{xx} = h_{xx} - \tfrac12\eta_{xx}h$ with $\eta_{xx} = +1$.`],
      teach: 'Trace reversal concentrates a static star’s field in the single component h̄₀₀, which is sourced by its energy density alone.',
      explain: t`$\bar h_{00} = \varepsilon + \tfrac12(2\varepsilon) = 2\varepsilon = 4GM/(c^2r)$ and $\bar h_{xx} = \varepsilon - \tfrac12(2\varepsilon) = 0$. So the whole static field sits in $\bar h_{00}$, the one component sourced by $T_{00} = \rho c^2$.`,
      visual: hTable,
    }),
    mcq({
      id: 'coupling', difficulty: 3,
      prompt: t`Einstein's equations have the coupling $8\pi G/c^4$. Why does $-16\pi G/c^4$ appear in the linearized equation?`,
      choices: [
        t`In the Lorenz gauge the linearized Einstein tensor is $G_{\mu\nu} = -\tfrac12\Box\bar h_{\mu\nu}$, so $G_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$ turns into $\Box\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}T_{\mu\nu}$`,
        'Gravity is twice as strong when it is weak',
        'The factor 2 counts the two polarizations of gravitational waves',
        t`It is a different convention for Newton's constant $G$`,
      ],
      answer: 0,
      why: {
        1: 'The physics is the same; only the variable has changed — h̄ instead of the curvature tensor.',
        2: 'The polarizations come from the solutions in empty space; the coupling is fixed before any solution is chosen.',
        3: t`$G$ is the same measured constant; with this coupling the static solution reproduces Newton's $\nabla^2\Phi = 4\pi G\rho$ exactly.`,
      },
      hints: [t`Work out the linearized Einstein tensor in this gauge: it is a multiple of $\Box\bar h_{\mu\nu}$.`, t`If $G_{\mu\nu} = -\tfrac12\Box\bar h_{\mu\nu}$, multiply both sides of $G_{\mu\nu} = \kappa T_{\mu\nu}$ by $-2$.`],
      teach: 'The linearized Einstein tensor in Lorenz gauge is −½□h̄, which turns the coupling 8πG/c⁴ into −16πG/c⁴.',
      explain: t`$-\tfrac12\Box\bar h_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$ gives $\Box\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}T_{\mu\nu}$. Check with a static mass: $\nabla^2\bar h_{00} = -16\pi G\rho/c^2$ means $\bar h_{00} = -4\Phi/c^2$ with $\nabla^2\Phi = 4\pi G\rho$ — Newton, exactly.`,
      visual: hbarProfile,
    }),
    mcq({
      id: 'lorenz', difficulty: 2,
      prompt: t`What is the condition $\partial^\mu\bar h_{\mu\nu} = 0$?`,
      choices: [
        t`A choice of coordinates (gauge): four conditions, possible because relabelling spacetime by $x^\mu \to x^\mu + \xi^\mu$ shifts $h_{\mu\nu}$ without changing any physics — gravity's version of the Lorenz gauge of electromagnetism`,
        'A new law of physics, discovered by experiment',
        'The conservation of energy and momentum of the matter',
        'The condition that no gravitational waves are present',
      ],
      answer: 0,
      why: {
        1: 'No experiment tests it: any weak field can be put into this form by choosing coordinates.',
        2: t`That is $\partial^\mu T_{\mu\nu} = 0$, a condition on the source. The gauge condition is about $\bar h$ — though the two must be consistent, as taking the divergence of the field equation shows.`,
        3: t`Waves exist in this gauge — it is the gauge in which they obey $\Box\bar h_{\mu\nu} = 0$.`,
      },
      hints: [t`In electromagnetism, $\partial_\mu A^\mu = 0$ is not a law either. What is it?`],
      teach: 'The Lorenz gauge is a choice of coordinates that turns the linearized equations into wave equations; it is not a physical law.',
      explain: t`Ten components of $h_{\mu\nu}$, four coordinate functions $\xi^\mu$: the gauge spends the coordinate freedom to make the equations simple. Physical predictions — what a detector measures — do not depend on it.`,
    }),
    num({
      id: 'grazing', difficulty: 2,
      gen(r) {
        const [name, GM, R, gmTeX, rTeX] = r.pick([
          ['the Sun', 1.327e20, 6.957e8, t`1.327\times10^{20}`, t`6.957\times10^{8}`],
          ['Jupiter', 1.267e17, 6.991e7, t`1.267\times10^{17}`, t`6.991\times10^{7}`],
          ['the Earth', 3.986e14, 6.371e6, t`3.986\times10^{14}`, t`6.371\times10^{6}`],
        ]);
        const a = (4 * GM) / (C * C * R);
        return {
          prompt: t`A ray of starlight grazing a body is bent by $\alpha = \dfrac{4GM}{c^2b}$ — exactly the value of $\bar h_{00} = 4GM/(c^2r)$ at the closest approach $b$. For a ray grazing ${name} ($GM = ${gmTeX}\ \text{m}^3/\text{s}^2$, $b = ${rTeX}$ m), what is $\alpha$ in milliarcseconds? (1 mas $= 4.848\times10^{-9}$ rad)`,
          answer: a / MAS, units: 'mas', tol: { rel: 0.01 },
          errors: [{ value: a / 2 / MAS, feedback: 'That is half: the factor 4 includes space curving as much as time ($h_{00} = h_{ii}$).' }, { value: a, feedback: 'That is in radians. Divide by 4.848 × 10⁻⁹ to get milliarcseconds.' }],
          hints: [t`$\alpha = 4GM/(c^2b)$ in radians.`, t`$\alpha = 4\times${gmTeX}/(8.988\times10^{16}\times${rTeX})$; then divide by $4.848\times10^{-9}$.`],
          teach: 'Light bending, 4GM/(c²b), is twice what the time part of the metric alone would give: the linear solution curves space as much as time.',
          explain: t`$\alpha = ${sci(a)}$ rad $= ${sci(a / MAS)}$ mas. ${name === 'the Sun' ? 'That is the famous 1.75 arcseconds of 1919.' : name === 'Jupiter' ? 'Radio astronomers have measured Jupiter’s deflection of a quasar’s light with very-long-baseline interferometry.' : 'Too small to measure for the Earth, but real.'} Half of it comes from $h_{00}$, half from $h_{ii}$.`,
          visual: grazing(name.replace('the ', '').replace(/^\w/, (c) => c.toUpperCase())),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gw170817', difficulty: 3, transfer: true,
      prompt: t`On 17 August 2017 LIGO and Virgo detected gravitational waves from two merging neutron stars about 40 Mpc away; the Fermi satellite caught a burst of gamma rays 1.74 s later. Suppose both left at the same moment. By what fraction could the speed of the waves, set by the wave operator $\Box$, differ from the speed of light? (1 Mpc $= 3.086\times10^{22}$ m)`,
      answer: 1.74 / ((40 * MPC) / C), tol: { rel: 0.02 },
      errors: [{ value: 1.74 / (40 * MPC), feedback: 'Divide the delay by the travel time (distance ÷ c), not by the distance.' }],
      hints: [t`Travel time: $40\times3.086\times10^{22}\ \text{m} / (2.998\times10^{8}\ \text{m/s})$.`, 'The fractional speed difference is the delay divided by the travel time.'],
      teach: 'GW170817 showed gravitational waves travel at the speed of light to about one part in 10¹⁵, as the wave equation says.',
      explain: t`Travel time $= ${sci((40 * MPC) / C)}$ s, about ${Math.round((40 * MPC) / C / YEAR / 1e6)} million years; $1.74/${sci((40 * MPC) / C)} = ${sci(1.74 / ((40 * MPC) / C), 2)}$. The published bound, which allows for the gamma rays leaving a few seconds after the merger, is between $-3\times10^{-15}$ and $+7\times10^{-16}$.`,
      visual: sameCone('GW170817 on a spacetime diagram (schematic, c = 1): the waves and the light left the same event and arrived 1.74 s apart after about 130 million years.'),
    }),
    mcq({
      id: 'cp-source', difficulty: 3,
      prompt: t`Take the divergence $\partial^\mu$ of both sides of $\Box\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}T_{\mu\nu}$. With the gauge condition $\partial^\mu\bar h_{\mu\nu} = 0$, what must the source satisfy — and what does that mean for two stars in orbit?`,
      choices: [
        t`$\partial^\mu T_{\mu\nu} = 0$ as if spacetime were flat: the stars' motion cannot be bent by their own gravity at this order, so orbits need higher-order corrections`,
        'Nothing: the divergence of a wave equation is always zero',
        'The source must be at rest',
        'The source must have zero mass',
      ],
      answer: 0,
      why: {
        1: t`The left side's divergence is $\Box(\partial^\mu\bar h_{\mu\nu}) = 0$ by the gauge condition, so the right side's must vanish too: a real constraint on $T_{\mu\nu}$.`,
        2: 'Moving sources are allowed — waves come from them — provided their energy and momentum are conserved in the flat-space sense.',
        3: 'A massless source would produce no field at all; the condition is about conservation, not about the amount.',
      },
      hints: [t`$\partial^\mu$ commutes with $\Box$.`, t`Then $\Box(\partial^\mu\bar h_{\mu\nu}) = -\frac{16\pi G}{c^4}\partial^\mu T_{\mu\nu}$, and the left side is zero.`],
      teach: 'At first order the source must be conserved in flat spacetime, so self-gravitating motion — a binary’s orbit — needs higher-order (post-Newtonian) corrections.',
      explain: t`$\partial^\mu T_{\mu\nu} = 0$ means free, unaccelerated matter in flat spacetime. Two stars accelerating each other violate it at this order, so the linear theory alone cannot describe a binary self-consistently; post-Newtonian theory adds the corrections — and still predicts the waves well while the orbit is wide.`,
      visual: binary,
    }),
    mcq({
      id: 'cp-static', difficulty: 2,
      prompt: t`For a star at rest, which components of $\bar h_{\mu\nu}$ does the linear equation switch on (to good accuracy)?`,
      choices: [
        t`Only $\bar h_{00} = 4GM/(c^2r)$, because only $T_{00} = \rho c^2$ is significant; converting back gives $h_{00} = h_{ii} = 2GM/(c^2r)$`,
        t`All ten, equally`,
        t`Only the space components $\bar h_{ij}$, because a star pushes outward with its pressure`,
        t`$\bar h_{0i}$, because the star's light flows outward`,
      ],
      answer: 0,
      why: {
        1: t`Each component of $\bar h$ is sourced by the same component of $T$, and most of a static star's $T_{\mu\nu}$ is zero or tiny.`,
        2: t`The pressure terms $T_{ij} = p\,\delta_{ij}$ are at most a few parts in a million of $T_{00}$ in the Sun: negligible here.`,
        3: t`Sunlight's energy flux is a minute fraction of the Sun's $\rho c^2$; for a star at rest $T_{0i}$ is effectively zero.`,
      },
      hints: [t`Each $\bar h_{\mu\nu}$ is sourced by the matching $T_{\mu\nu}$. Which entries of a static star's $T_{\mu\nu}$ are large?`],
      teach: 'A static star switches on only h̄₀₀; reversing the trace spreads it equally over h₀₀ and the space diagonal.',
      explain: t`With only $T_{00}$ significant, only $\bar h_{00}$ is sourced. Reversing the trace gives $h_{00} = h_{xx} = h_{yy} = h_{zz} = 2GM/(c^2r)$: the weak-field metric $-(1 + 2\Phi/c^2)c^2dt^2 + (1 - 2\Phi/c^2)(dx^2 + dy^2 + dz^2)$.`,
      visual: tStar,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, ch. 7 (perturbation theory, gravitational radiation)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'LIGO/Virgo/Fermi/INTEGRAL, “Gravitational waves and gamma-rays from a binary neutron star merger” (2017)', url: 'https://arxiv.org/abs/1710.05834' },
  ],
});
