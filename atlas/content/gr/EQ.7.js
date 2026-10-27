// The perfect-fluid stress–energy tensor, dissected:
// T^μν = (ρ + p/c²) u^μ u^ν + p g^μν, with x⁰ = ct, u·u = −c², signature
// (−,+,+,+). Verified with sympy: rest frame diag(ρc², p, p, p); boosted
// T⁰⁰ = γ²(ρc² + p) − p; trace T = −ρc² + 3p. Avoids repeating gr.S16.i
// (which entry is what, sunlight, dust boosted, pressure shares).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { sci, round, table4, dustBall } from './_eq.js';

const t = String.raw;

const PF = t`T^{\mu\nu} = \left(\rho + \frac{p}{c^2}\right)u^\mu u^\nu + p\,g^{\mu\nu}`;

// entries of T^μν (÷ ρc²) for a fluid moving at β = v/c along x, with w = p/ρc²
const T00 = (w) => `(1 + ${w})/(1 - x^2) - ${w}`;
const boostGraph = ({ w, b, sliders = false, caption }) => ({
  type: 'graph',
  params: {
    x: [0, 0.95], y: [-1.3, 9], xlabel: 'speed of the fluid past you, v/c', ylabel: '÷ ρc²',
    ...(sliders ? {
      sliders: [
        { key: 'w', label: 'Pressure, $w = p/\\rho c^2$', min: -1, max: 0.34, step: 0.01, value: 0, explain: '0: dust. ⅓: a gas of light. −1: vacuum energy, with negative pressure.' },
        { key: 'b', label: 'Speed past you, $v/c$', min: 0, max: 0.9, step: 0.01, value: 0.6, explain: 'The fluid streams along $x$; you are at rest.' },
      ],
      points: [
        { x: 'b', y: '(1 + w)/(1 - b^2) - w', color: 'gold' },
        { x: 'b', y: '(1 + w)*b/(1 - b^2)', color: 'accent' },
        { x: 'b', y: '(1 + w)*b^2/(1 - b^2) + w', color: 'violet' },
      ],
      readouts: [
        { label: '$T^{00}/\\rho c^2$', expr: '(1 + w)/(1 - b^2) - w', digits: 4 },
        { label: '$T^{0x}/\\rho c^2$', expr: '(1 + w)*b/(1 - b^2)', digits: 4 },
        { label: '$T^{xx}/\\rho c^2$', expr: '(1 + w)*b^2/(1 - b^2) + w', digits: 4 },
        { label: '$T^{yy}/\\rho c^2 = T^{zz}/\\rho c^2$', expr: 'w', digits: 4 },
      ],
      curves: [
        { fn: '(1 + w)/(1 - x^2) - w', color: 'gold' },
        { fn: '(1 + w)*x/(1 - x^2)', color: 'accent' },
        { fn: '(1 + w)*x^2/(1 - x^2) + w', color: 'violet' },
        { fn: 'w', color: 'ink3', dash: true },
      ],
    } : {
      curves: [{ fn: T00(w), color: 'gold', label: 'T⁰⁰ ÷ ρc²', labelAt: 0.15, labelDy: -12 }],
      vlines: [{ x: b, label: `v = ${b}c`, color: 'accent' }],
    }),
  },
  caption: caption ?? t`Entries of $T^{\mu\nu}$ for a perfect fluid streaming past you at speed $v$ along $x$, in units of its rest-frame energy density $\rho c^2$ (flat spacetime). Gold: $T^{00}$, the energy density. Blue: $T^{0x}$, the energy flow along $x$. Violet: $T^{xx}$, the flow of $x$-momentum. Dashed: $T^{yy} = T^{zz} = p$. The rest, such as $T^{0y}$, are zero.`,
});

// the rest-frame stress–energy tensor
const restTable = table4({
  cells: [['ρc²', '0', '0', '0'], ['0', 'p', '0', '0'], ['0', '0', 'p', '0'], ['0', '0', '0', 'p']],
  colors: [['gold', 'ink4', 'ink4', 'ink4'], ['ink4', 'accent', 'ink4', 'ink4'], ['ink4', 'ink4', 'accent', 'ink4'], ['ink4', 'ink4', 'ink4', 'accent']],
  rowName: 'μ', colName: 'ν', dx: -8,
  caption: t`A perfect fluid's $T^{\mu\nu}$ in its own rest frame: energy density $\rho c^2$ in the corner, the same pressure $p$ in every space direction, nothing else.`,
});

// the trace (÷ ρc²) against w
const traceLine = {
  type: 'graph',
  params: {
    x: [-1.1, 1.1], y: [-4.5, 2.5], xlabel: 'w = p/(ρc²)', ylabel: 'T ÷ ρc²',
    curves: [{ fn: '-1 + 3x', domain: [-1, 1], color: 'accent' }],
    hlines: [{ y: 0 }],
  },
  caption: t`The trace $T = g_{\mu\nu}T^{\mu\nu} = -\rho c^2 + 3p$, in units of $\rho c^2$, against the pressure ratio $w$.`,
};

// a fluid element pushed harder on one side than the other (schematic)
const pushPicture = {
  type: 'graph',
  params: {
    x: [-3.2, 3.2], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['-1 + 2*min(max(4*t, 0), 1) - 2*min(max(4*t - 2, 0), 1)', '-0.7 + 1.4*min(max(4*t - 1, 0), 1) - 1.4*min(max(4*t - 3, 0), 1)'], t: [0, 1], color: 'teal', width: 2.4 }],
    arrows: [
      { from: [-2.7, 0], to: [-1.05, 0], color: 'warn', label: 'p + Δp', labelDx: -10, labelDy: -14 },
      { from: [2.2, 0], to: [1.05, 0], color: 'warn', label: 'p', labelDx: 6, labelDy: -14 },
      { from: [0, -1.0], to: [0.9, -1.0], color: 'gold', label: 'acceleration', labelDx: 8, labelDy: 0 },
    ],
  },
  caption: 'Schematic: a small element of fluid pushed harder from the left than from the right accelerates to the right. What resists the push — its inertia per unit volume — is the question.',
};

// four-velocities on a spacetime diagram (c = 1): all tips on the hyperbola t² − x² = 1
const uHyperbola = (() => {
  const tips = [0, 0.55, 1.05, -0.8].map((eta) => [round(Math.sinh(eta), 4), round(Math.cosh(eta), 4)]);
  return {
    type: 'graph',
    params: {
      x: [-2.2, 2.2], y: [0, 2.2], equal: true, xlabel: 'x (c = 1)', ylabel: 't',
      curves: [{ fn: 'sqrt(1 + x^2)', domain: [-2.2, 2.2], color: 'ink3', width: 1.6 }, { fn: 'abs(x)', domain: [-2.2, 2.2], color: 'warn', dash: true, width: 1.2 }],
      arrows: tips.map(([x, y]) => ({ from: [0, 0], to: [x, y], color: 'accent' })),
    },
    caption: 'Four-velocities of particles moving at different speeds, on a spacetime diagram with c = 1. Every tip lands on the same hyperbola: all four-velocities have the same spacetime length. Dashed: light.',
  };
})();

// T⁰⁰ ÷ ρc² for a gas of light against the Lorentz factor, both in powers of ten
const jetGraph = (g) => ({
  type: 'graph',
  params: {
    x: [0, 2.6], y: [-0.3, 5.6], xlabel: 'log₁₀ γ', ylabel: 'log₁₀(T⁰⁰ ÷ ρc²)',
    curves: [{ fn: 'log10((4/3)*10^(2*x) - 1/3)', color: 'gold' }],
    vlines: [{ x: round(Math.log10(g), 4), label: `γ = ${g}`, color: 'accent' }],
  },
  caption: 'How much denser in energy a blob of radiation-like plasma looks as it rushes toward you, against its Lorentz factor γ, both in powers of ten.',
});

export default lesson({
  id: 'gr.EQ.7',
  kind: 'dissection',
  title: 'The perfect-fluid stress–energy tensor',
  minutes: 8, difficulty: 3,
  badges: ['est-der'],
  equation: t`\part{1}{T^{\mu\nu}} = \left(\part{2}{\rho} + \part{3}{\frac{p}{c^2}}\right)\part{4}{u^\mu u^\nu} + \part{5}{p\,g^{\mu\nu}}`,
  intro: t`A **perfect fluid** — no viscosity, no heat flow — is described completely by three things: its density $\rho$ and pressure $p$ measured in its own rest frame, and its four-velocity $u^\mu$. This formula turns them into the stress–energy tensor, the right-hand side of Einstein's equations, valid in any frame and any coordinates. Stars, neutron stars and the cosmic fluids of matter, radiation and dark energy are all modelled this way.

Conventions are Carroll's: signature $(-,+,+,+)$, $x^0 = ct$, indices $0$–$3$. Here $\rho$ is a **mass** density, so $\rho c^2$ is the energy density. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`T^{\mu\nu}`, name: 'the stress–energy tensor', badge: 'est-der', units: t`$\text{J/m}^3 = \text{Pa}$`,
      text: t`A symmetric $4\times4$ array with both indices **up**: $T^{\mu\nu}$ is the flow of the $\mu$-component of four-momentum across a surface of constant $x^\nu$. So $T^{00}$ is the **energy density**, $T^{0i}$ the energy flowing in direction $i$ (divided by $c$), and $T^{ij}$ the flow of $i$-momentum in direction $j$ — pressure on the diagonal, shear stress off it.

For a perfect fluid in its rest frame this collapses to $\operatorname{diag}(\rho c^2, p, p, p)$. In any other frame, the formula tells you every entry.`,
      more: t`Lowering both indices with the metric gives $T_{\mu\nu}$, the form in Einstein's equations: $T_{\mu\nu} = (\rho + p/c^2)\,u_\mu u_\nu + p\,g_{\mu\nu}$. Energy–momentum conservation is $\nabla_\mu T^{\mu\nu} = 0$: for this fluid it is the relativistic continuity and Euler equations.`,
    },
    {
      tex: t`\rho`, name: 'the rest-frame density', badge: 'est-der', units: t`$\text{kg/m}^3$`,
      text: t`The mass density measured by an observer moving with the fluid — **all** of its energy, divided by $c^2$: rest mass, plus heat, plus binding energy. A hot gas has a larger $\rho$ than the same gas cold. It is a scalar: every observer agrees on the value in the fluid's own frame, even though each measures a different $T^{00}$.`,
    },
    {
      tex: t`\frac{p}{c^2}`, name: 'pressure as inertia', badge: 'est-der', units: t`$\text{kg/m}^3$`,
      text: t`The rest-frame pressure $p$ (in pascals), divided by $c^2$ to make it a mass density. Added to $\rho$ it gives the fluid's **inertia** per unit volume: in the fluid's frame a pressure gradient accelerates it as $(\rho + p/c^2)\,\vec a = -\nabla p$. A fluid under pressure is harder to accelerate.

For air $p/(\rho c^2) \approx 10^{-12}$ and the correction is invisible; in a neutron star's core it is tens of percent; for light, $p = \rho c^2/3$.`,
    },
    {
      tex: t`u^\mu u^\nu`, name: 'the four-velocity, twice', badge: 'est-der', units: t`$\text{m}^2/\text{s}^2$`,
      text: t`$u^\mu = dx^\mu/d\tau$ is the fluid's four-velocity, normalised as $g_{\mu\nu}u^\mu u^\nu = -c^2$. The product $u^\mu u^\nu$ is a $4\times4$ array pointing along the flow: in the rest frame $u^\mu = (c, 0, 0, 0)$, so only its $00$ entry, $c^2$, is non-zero.

Seen from a frame where the fluid moves at $v$, $u^\mu = (\gamma c, \gamma v, 0, 0)$ with $\gamma = 1/\sqrt{1 - v^2/c^2}$: the energy density picks up $\gamma^2$, and energy and momentum start to flow ($T^{0x}$, $T^{xx}$).`,
    },
    {
      tex: t`p\,g^{\mu\nu}`, name: 'isotropic pressure', badge: 'est-der', units: t`$\text{Pa}$`,
      text: t`The pressure times the **inverse metric**: the same push in every direction, written in a form valid in any frame. In flat spacetime $g^{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$, so in the rest frame this term adds $+p$ to each space entry and $-p$ to $T^{00}$ — exactly cancelling the $p/c^2$ in the first term, so the energy density stays $\rho c^2$.

When $p = -\rho c^2$ (vacuum energy) the first term vanishes and $T^{\mu\nu} = -\rho c^2 g^{\mu\nu}$: proportional to the metric, the same for every observer — the form of a cosmological constant.`,
    },
  ],
  readAloud: t`The stress–energy of a perfect fluid is its rest-frame inertia — density plus pressure over c² — carried along its four-velocity, plus the same pressure pushing equally in every direction.`,
  why: t`Stars, neutron stars and the universe as a whole are modelled as perfect fluids: this formula is the source in nearly every solution of Einstein's equations beyond empty space.`,
  visual: {
    title: 'A fluid streaming past you',
    lead: t`A perfect fluid streams past you along $x$ at speed $v$. The curves are the entries of its $T^{\mu\nu}$ that you measure, divided by its rest-frame energy density $\rho c^2$; $w = p/(\rho c^2)$ sets its pressure. Move both sliders.`,
    tasks: [
      'Dust (w = 0) at v = 0.6c: T⁰⁰ = 1.5625 = γ² — one γ from each grain’s energy, one from the length-contracted volume.',
      'Light (w = ⅓): energy flow and momentum flow grow faster with speed than for dust — pressure adds inertia.',
      'Vacuum energy (w = −1): every curve goes flat. It looks the same at every speed: no rest frame can be singled out.',
    ],
    ...boostGraph({ sliders: true }),
  },
  practice: [
    mcq({
      id: 'rest-frame', difficulty: 1,
      prompt: t`$$T^{\mu\nu} = \left(\rho + \frac{p}{c^2}\right)u^\mu u^\nu + \underbrace{p\,g^{\mu\nu}}_{\text{?}}$$ In the fluid's rest frame, $u^\mu = (c, 0, 0, 0)$, and in flat spacetime $g^{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$. What does the marked term contribute?`,
      choices: [
        t`$-p$ to $T^{00}$ and $+p$ to each of $T^{xx}$, $T^{yy}$, $T^{zz}$`,
        t`$+p$ to $T^{xx}$, $T^{yy}$ and $T^{zz}$ only`,
        t`$p$ to every one of the 16 entries`,
        t`$p$ to $T^{00}$ only`,
      ],
      answer: 0,
      why: {
        1: t`$g^{00} = -1$ is not zero, so the term also adds $-p$ to $T^{00}$ — which cancels the $p/c^2 \times c^2$ from the first term.`,
        2: t`$g^{\mu\nu}$ is diagonal here: the off-diagonal entries get nothing.`,
        3: t`The space diagonal of $g^{\mu\nu}$ is $+1$: that is where the pressure shows up.`,
      },
      hints: [t`Multiply $p$ by each entry of $\operatorname{diag}(-1, 1, 1, 1)$.`],
      teach: 'The pressure term gives +p to each space direction and −p to the energy density, cancelling the pressure’s share of the first term.',
      explain: t`$p\,g^{\mu\nu} = \operatorname{diag}(-p, p, p, p)$. The first term gives $(\rho + p/c^2)c^2 = \rho c^2 + p$ in the corner and nothing else, so the total is $\operatorname{diag}(\rho c^2, p, p, p)$.`,
      visual: restTable,
    }),
    mcq({
      id: 'trace', difficulty: 2,
      prompt: t`Using $g_{\mu\nu}u^\mu u^\nu = -c^2$ and $g_{\mu\nu}g^{\mu\nu} = 4$, the trace of the perfect-fluid tensor is $T = g_{\mu\nu}T^{\mu\nu} = -(\rho c^2 + p) + 4p = -\rho c^2 + 3p$. For which fluid is the trace zero?`,
      choices: [t`A gas of light (radiation), $p = \rho c^2/3$`, t`Dust, $p = 0$`, t`Vacuum energy, $p = -\rho c^2$`, t`A "stiff" fluid with $p = \rho c^2$`],
      answer: 0,
      why: {
        1: t`Dust gives $T = -\rho c^2$: its trace is its energy density, with a minus sign.`,
        2: t`Vacuum energy gives $T = -\rho c^2 - 3\rho c^2 = -4\rho c^2$.`,
        3: t`$p = \rho c^2$ gives $T = +2\rho c^2$.`,
      },
      hints: [t`Set $-\rho c^2 + 3p = 0$ and solve for $p$.`],
      teach: 'The trace of a perfect fluid’s stress–energy is −ρc² + 3p, zero for radiation.',
      explain: t`$T = 0$ needs $p = \rho c^2/3$: radiation. A traceless source also makes the Ricci scalar zero ($R = -\kappa T$ when $\Lambda = 0$) — one reason the radiation era of the early universe is simpler than it looks.`,
      visual: traceLine,
    }),
    num({
      id: 'boost-pressure', difficulty: 3,
      gen(r) {
        const [what, w, wTeX] = r.pick([['a gas of light, with $p = \\rho c^2/3$', 1 / 3, '1/3'], ['neutron-star matter, if $p = 0.2\\,\\rho c^2$', 0.2, '0.2'], ['a hot plasma with $p = 0.1\\,\\rho c^2$', 0.1, '0.1']]);
        const b = r.pick([0.6, 0.8]);
        const g2 = 1 / (1 - b * b), val = g2 * (1 + w) - w;
        return {
          prompt: t`A perfect fluid — ${what} — streams past you at $v = ${b}c$. With $u^0 = \gamma c$ and $g^{00} = -1$, the formula gives $T^{00} = \gamma^2(\rho c^2 + p) - p$. By what factor is the energy density you measure larger than $\rho c^2$?`,
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: g2, feedback: 'That is γ², the answer for dust. Here the pressure adds: γ²(1 + w) − w with w = p/ρc².' }, { value: g2 * (1 + w), feedback: 'Do not forget the −p from the pressure term, p g⁰⁰.' }],
          hints: [t`$\gamma^2 = 1/(1 - v^2/c^2) = ${fmt(g2, 4)}$.`, t`Divide by $\rho c^2$: $T^{00}/\rho c^2 = \gamma^2(1 + w) - w$ with $w = ${wTeX}$.`],
          teach: 'Moving pressure counts as energy: a fluid with pressure gains more energy density under a boost than dust does.',
          explain: t`$${fmt(g2, 4)}\times(1 + ${wTeX}) - ${wTeX} = ${fmt(val, 4)}$, against $${fmt(g2, 4)}$ for dust. The pressure's share, multiplied by $\gamma^2$, is energy you measure because the fluid moves.`,
          visual: boostGraph({ w: round(w, 6), b, caption: t`$T^{00}/\rho c^2$ for this fluid against its speed past you; the line marks $v = ${b}c$.` }),
        };
      },
    }),
    mcq({
      id: 'inertia', difficulty: 3,
      prompt: t`In the combination $\left(\rho + \dfrac{p}{c^2}\right)$, what does the $p/c^2$ do?`,
      choices: [
        t`It adds to the fluid's inertia: in the fluid's frame a pressure gradient accelerates it as $(\rho + p/c^2)\,\vec a = -\nabla p$, so a fluid under pressure is harder to accelerate`,
        'It adds to the rest mass of each particle in the fluid',
        'It is the weight of the pressure, pulling the fluid downward',
        'It only converts pressure into mass units, and drops out of the physics in the rest frame',
      ],
      answer: 0,
      why: {
        1: t`The particles' rest masses are inside $\rho$ already; $p/c^2$ is a property of the fluid as a whole, not of any particle.`,
        2: t`Weight would need a gravitational field. The effect is there in flat spacetime: it is inertia, not weight.`,
        3: t`In the rest frame it cancels in $T^{00}$ against the $-p$ of the pressure term, but it survives in the equations of motion and in every moving frame.`,
      },
      hints: ['Think of the relativistic version of F = ma for a small element of fluid.', t`Conservation, $\nabla_\mu T^{\mu\nu} = 0$, gives $(\rho + p/c^2)\,\vec a = -\nabla p$ in the fluid's frame. Which quantity multiplies the acceleration?`],
      teach: 'In relativity pressure has inertia: a fluid’s resistance to acceleration is ρ + p/c² per unit volume.',
      explain: t`The space part of $\nabla_\mu T^{\mu\nu} = 0$ is the relativistic Euler equation: $(\rho + p/c^2)\,\vec a = -\nabla p$ in the fluid's frame. In a neutron star, where $p/c^2$ is a sizable fraction of $\rho$, this extra inertia — together with the extra gravity of pressure — enters the equation of hydrostatic balance and helps set the maximum mass such a star can have.`,
      visual: pushPicture,
    }),
    mcq({
      id: 'vacuum', difficulty: 2,
      prompt: t`$$${PF}$$ For vacuum energy the pressure is $p = -\rho c^2$. What does the formula give?`,
      choices: [
        t`$T^{\mu\nu} = -\rho c^2\,g^{\mu\nu}$: proportional to the metric, so it has the same form for every observer, whatever their speed`,
        t`$T^{\mu\nu} = 0$: the vacuum carries no energy`,
        t`$T^{\mu\nu} = \rho\,u^\mu u^\nu$, like dust at rest`,
        'An energy density that grows with the observer’s speed, like any other fluid',
      ],
      answer: 0,
      why: {
        1: t`Only the first term vanishes. The pressure term remains, with $T^{00} = -\rho c^2 g^{00} = +\rho c^2$.`,
        2: t`With $\rho + p/c^2 = 0$ it is the $u^\mu u^\nu$ term that disappears, not the pressure term.`,
        3: t`The metric looks the same to every observer in flat spacetime, so a $T^{\mu\nu}$ proportional to it cannot grow with speed: moving through vacuum energy changes nothing.`,
      },
      hints: [t`Compute $\rho + p/c^2$ first.`],
      teach: 'Vacuum energy has T^μν ∝ g^μν: the same in every frame, which is exactly the form of a cosmological constant.',
      explain: t`$\rho + p/c^2 = 0$ removes the four-velocity term, leaving $T^{\mu\nu} = -\rho c^2 g^{\mu\nu}$. Moved to the other side of Einstein's equations it is indistinguishable from $\Lambda g_{\mu\nu}$ — and its gravity is repulsive, since $\rho + 3p/c^2 = -2\rho < 0$.`,
      visual: dustBall({ mode: 'matter', rho: 1000, w: -1, t: 0.6 }, 'A ball of test grains released inside vacuum energy (p = −ρc²): it grows, equally in every direction — repulsive gravity.'),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-uu', difficulty: 1,
      prompt: t`What is $g_{\mu\nu}u^\mu u^\nu$ for the four-velocity of any massive particle or fluid element, with signature $(-,+,+,+)$?`,
      choices: [t`$-c^2$, whatever its speed`, t`$+c^2$`, t`$0$`, t`$-c^2\gamma^2$: it grows with speed`],
      answer: 0,
      why: {
        1: t`That is the value in the opposite signature, $(+,-,-,-)$, used by some particle physicists. Same physics, opposite sign.`,
        2: 'Zero is for light: its four-velocity is null. A massive body always moves slower than light.',
        3: t`$u^0 = \gamma c$ does grow, but so do the space components; the combination $-(\gamma c)^2 + (\gamma v)^2 = -c^2$ does not.`,
      },
      teach: 'Every massive four-velocity has g_μν u^μ u^ν = −c² in the (−,+,+,+) signature: the same spacetime length at every speed.',
      hints: [t`Try the rest frame: $u^\mu = (c, 0, 0, 0)$.`],
      explain: t`In the rest frame $g_{00}c^2 = -c^2$, and a scalar has the same value in every frame: $-(\gamma c)^2 + (\gamma v)^2 = -\gamma^2(c^2 - v^2) = -c^2$. That is what makes the rest-frame $T^{00}$ come out as $\rho c^2$.`,
      visual: uHyperbola,
    }),
    num({
      id: 'cp-jet', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([10, 30, 100]);
        const val = (4 / 3) * g * g - 1 / 3;
        return {
          prompt: t`Gamma-ray bursts launch narrow jets of plasma at enormous speeds; we see the ones aimed at us. Treat a blob of the jet as a gas of light ($p = \rho c^2/3$) moving toward us with Lorentz factor $\gamma = ${g}$. By what factor is its energy density $T^{00}$ in our frame larger than $\rho c^2$ in its own rest frame?`,
          answer: val, tol: { rel: 0.01 },
          errors: [{ value: g * g, feedback: 'That is γ², the result for dust. A gas of light has pressure: γ²(1 + w) − w with w = ⅓.' }],
          hints: [t`$T^{00}/\rho c^2 = \gamma^2(1 + w) - w$ with $w = 1/3$.`, t`$= \tfrac43\gamma^2 - \tfrac13$ with $\gamma^2 = ${g * g}$.`],
          teach: 'For relativistic outflows the energy density we see grows as γ² — larger still when the plasma has the pressure of light.',
          explain: t`$\tfrac43\times${g * g} - \tfrac13 = ${sci(val, 4)}$. Factors like this (and the matching boost in the energy flow, $T^{0x}$) are why jets aimed at us can outshine everything else in the sky.`,
          visual: jetGraph(g),
        };
      },
    }),
    mcq({
      id: 'cp-dust', difficulty: 3,
      prompt: t`For dust ($p = 0$) the tensor is $T^{\mu\nu} = \rho\,u^\mu u^\nu$. Einstein's equations, through the Bianchi identity, demand $\nabla_\mu T^{\mu\nu} = 0$. What does that say about the dust?`,
      choices: [
        'Its mass is conserved and every grain moves on a geodesic: the equation of motion comes out of the field equations',
        'Nothing: it holds automatically for any density and any flow',
        'The dust must be at rest',
        'Its density must be the same everywhere',
      ],
      answer: 0,
      why: {
        1: t`It is a real restriction: an arbitrary $\rho(x)$ and $u^\mu(x)$ violate it. Only the Einstein tensor's divergence vanishes automatically.`,
        2: 'Dust can flow and fall; the condition only says how its flow and density must change together.',
        3: 'Dust can clump — galaxies did — as long as the density changes in step with the flow.',
      },
      hints: [t`Expand $\nabla_\mu(\rho u^\mu u^\nu)$ into a part along $u^\nu$ and a part across it.`, t`The part along $u$ is a continuity equation; the part across it is $u^\mu\nabla_\mu u^\nu = 0$. Where have you seen that?`],
      teach: 'For dust, energy–momentum conservation is mass conservation plus the geodesic equation: in general relativity the field equations tell matter how to move.',
      explain: t`$\nabla_\mu(\rho u^\mu u^\nu) = u^\nu\,\nabla_\mu(\rho u^\mu) + \rho\,u^\mu\nabla_\mu u^\nu = 0$. The two pieces must vanish separately: $\nabla_\mu(\rho u^\mu) = 0$ (no dust created or destroyed) and $u^\mu\nabla_\mu u^\nu = 0$ — the geodesic equation. Einstein's equations already contain the law of motion.`,
      visual: dustBall({ mode: 'matter', rho: 1000, w: 0, t: 0.6 }, 'Grains of dust released at rest inside uniform matter: each falls freely, on a geodesic, toward the others.'),
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §1.9 and §4.6 (perfect fluids)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Misner, Thorne & Wheeler, Gravitation (1973), §22.3 (hydrodynamics)', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
  ],
});
