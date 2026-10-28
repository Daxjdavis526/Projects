// Gauge transformations: Coulomb and Lorenz (Griffiths §10.1.2–10.1.3). The
// potentials are not unique: A → A + ∇λ, V → V − ∂λ/∂t leaves E and B
// untouched for any function λ(r, t). Shown with two potentials for one
// uniform field (V = −E₀x, A = 0, or V = 0, A = −E₀t x̂: λ = −E₀xt), and with
// Griffiths's odd pair V = 0, A = −(qt/4πε₀r²) r̂, which is a point charge at
// rest in disguise. The freedom is spent on a condition: the Coulomb gauge
// ∇·A = 0 makes V the instantaneous Coulomb potential of the present charge
// (yet E stays causal — the instantaneous parts cancel against A); the
// Lorenz gauge ∇·A = −μ₀ε₀∂V/∂t decouples the equations into wave
// equations □²V = −ρ/ε₀, □²A = −μ₀J, and is ∂_μA^μ = 0, the same in every
// frame. Residual freedom (□²λ = 0). Transfer: the harmonic (Lorenz) gauge of
// linearized gravity, □²h̄ = −16πG T/c⁴, which LIGO's waveforms are written in.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { sf } from './_em4b.js';

const t = String.raw;
const XS = [-1.6, -0.8, 0, 0.8, 1.6];

/** The gauge picture, static: V(x) as a curve, A as arrows, E as arrows, for mix s and time tt. */
function gaugePic(s, tt, caption) {
  return {
    type: 'graph',
    params: {
      x: [-2.2, 2.2], y: [-2.3, 2.7], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ fn: '1.4', domain: [-2.2, 2.2], color: 'ink4', dash: [3, 4], width: 1 }, { fn: `1.4 - ${0.5 * (1 - s)}*x`, domain: [-2.2, 2.2], color: 'accent', width: 2.4 }],
      arrows: [
        ...(s * tt > 0.01 ? XS.map((x) => ({ from: [x + 0.25 * s * tt, -0.3], to: [x - 0.25 * s * tt, -0.3], color: 'teal', width: 2.2 })) : []),
        ...XS.map((x) => ({ from: [x - 0.3, -1.7], to: [x + 0.3, -1.7], color: 'violet', width: 2.4 })),
      ],
      points: [
        { x: -2.15, y: 2.45, r: 0, label: 'V(x)', color: 'accent' },
        { x: -2.15, y: 0.25, r: 0, label: s * tt > 0.01 ? 'A (points along −x)' : 'A = 0', color: 'teal' },
        { x: -2.15, y: -1.15, r: 0, label: 'E', color: 'violet' },
      ],
    },
    caption,
  };
}

/** A radial field −r̂/r² in a plane slice (field2d, no readouts): Griffiths's odd vector potential. */
const radialPic = (caption) => ({ type: 'field2d', params: { P: '-x/(x^2 + y^2)^1.5', Q: '-y/(x^2 + y^2)^1.5', x: [-2, 2], y: [-2, 2], density: 13, particles: false, readout: false, probe: false }, caption });

export default lesson({
  id: 'phys4600.M4.2',
  title: 'Gauge transformations: Coulomb and Lorenz',
  minutes: 16, difficulty: 3,
  equation: t`\vec A \to \vec A + \nabla\lambda,\qquad V \to V - \frac{\partial\lambda}{\partial t}`,
  intro: t`$\vec B = \nabla\times\vec A$ does not fix $\vec A$: adding the gradient of any function $\lambda$ leaves the curl unchanged, because $\nabla\times\nabla\lambda = 0$. But then $\vec E = -\nabla V - \partial\vec A/\partial t$ would pick up $-\nabla(\partial\lambda/\partial t)$ — unless $V$ changes at the same time by $-\partial\lambda/\partial t$, which cancels it exactly. That pair of changes is a **gauge transformation**, and $\lambda(\vec r, t)$ is the gauge function. Every gauge gives the same $\vec E$ and $\vec B$, so the same forces and the same physics: the extra freedom in the potentials is redundancy, not information. You spend it on a condition that makes the equations easier. The **Coulomb gauge**, $\nabla\cdot\vec A = 0$, makes $V$ the Coulomb potential of the charges as they are now. The **Lorenz gauge**, $\nabla\cdot\vec A = -\mu_0\varepsilon_0\,\partial V/\partial t$, turns Maxwell’s equations into four separate wave equations with sources.`,
  symbols: [
    { tex: '\\vec A', text: t`the vector potential, in T·m` },
    { tex: 'V', text: 'the scalar potential, in volts' },
    { tex: '\\lambda', text: t`the gauge function, any (differentiable) function of position and time, in V·s (= T·m²)` },
    { tex: '\\nabla\\lambda', text: t`its gradient, added to $\vec A$; it has no curl, so $\vec B$ is unchanged` },
    { tex: '\\partial\\lambda/\\partial t', text: t`its rate of change, taken from $V$; it cancels the change in $\partial\vec A/\partial t$, so $\vec E$ is unchanged` },
  ],
  why: t`Gauge freedom is the founding idea of the Standard Model, and its gravitational twin — the freedom to relabel coordinates — is why gravitational waves have exactly two polarizations.`,
  visual: {
    type: 'graph',
    title: 'Two potentials, one field',
    lead: t`A uniform electric field $E_0\hat x$ (violet, bottom), described by potentials. Top: $V(x)$. Middle: $\vec A$. The gauge slider runs through $\lambda = -sE_0xt$: at $s = 0$, $V = -E_0x$ and $\vec A = 0$; at $s = 1$, $V = 0$ and $\vec A = -E_0t\,\hat x$, growing with time. Change the gauge and the time, and watch $\vec E$.`,
    tasks: [
      t`Move $s$ from 0 to 1: the slope of $V$ disappears while $\vec A$ appears, and $\vec E$ never changes.`,
      t`At $s = 1$, advance the time: $\vec A$ keeps growing, but at a steady rate, so $-\partial\vec A/\partial t$ — and $\vec E$ — stays the same.`,
      t`Read off the two contributions: $-\partial V/\partial x$ and $-\partial A_x/\partial t$ trade places, always adding to $E_0$.`,
    ],
    params: {
      x: [-2.2, 2.2], y: [-2.3, 2.7], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 's', label: t`Gauge: $\lambda = -sE_0xt$`, min: 0, max: 1, step: 0.05, value: 0.4, explain: t`$s = 0$: all scalar potential. $s = 1$: all vector potential. In between, a mixture — every one of them correct.` },
        { key: 'tt', label: t`Time $t$`, min: 0, max: 2, step: 0.1, value: 1, explain: t`In units where $E_0 = 1$. Only $\vec A$ depends on time.` },
      ],
      curves: [{ fn: '1.4', domain: [-2.2, 2.2], color: 'ink4', dash: [3, 4], width: 1 }, { fn: '1.4 - 0.5*(1 - s)*x', domain: [-2.2, 2.2], color: 'accent', width: 2.4 }],
      arrows: [
        ...XS.map((x) => ({ from: [`${x} + 0.25*s*tt`, -0.3], to: [`${x} - 0.25*s*tt`, -0.3], color: 'teal', width: 2.2, when: 's*tt - 0.01' })),
        ...XS.map((x) => ({ from: [x - 0.3, -1.7], to: [x + 0.3, -1.7], color: 'violet', width: 2.4 })),
      ],
      points: [
        { x: -2.15, y: 2.45, r: 0, label: 'V(x)', color: 'accent' },
        { x: -2.15, y: 0.25, r: 0, label: 'A', color: 'teal' },
        { x: 0, y: -0.3, r: 0, label: 'A = 0 everywhere', color: 'teal', labelAlign: 'center', labelDx: 0, labelDy: 0, when: '0.01 - s*tt' },
        { x: -2.15, y: -1.15, r: 0, label: 'E', color: 'violet' },
      ],
      readouts: [
        { label: t`$-\partial V/\partial x$`, expr: '1 - s', digits: 3, unit: 'E_0', zero: 1e-9 },
        { label: t`$-\partial A_x/\partial t$`, expr: 's', digits: 3, unit: 'E_0', zero: 1e-9 },
        { label: t`$E_x$`, expr: '1', digits: 3, unit: 'E_0' },
      ],
    },
    caption: t`Units with $E_0 = 1$. The potentials are drawn on separate strips: $V$ as a curve against $x$ (dashed line: $V = 0$), $\vec A$ and $\vec E$ as arrows (uniform in space). The arrows of $\vec A$ grow with time; their length is to scale with $t$ and $s$.`,
  },
  example: {
    prompt: t`Griffiths’s puzzle: the potentials $V = 0$, $\vec A = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{qt}{r^2}\hat r$. What fields do they describe? Find a gauge function that removes $\vec A$, and say which gauge conditions each pair satisfies.`,
    visual: radialPic(t`The vector potential $\vec A \propto -\hat r/r^2$ in a plane through the origin, growing in time. Arrow lengths compressed.`),
    steps: [
      { label: 'The fields', text: t`$\vec E = -\nabla V - \partial\vec A/\partial t = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q}{r^2}\hat r$: the Coulomb field of a charge $q$ at rest at the origin. And $\vec B = \nabla\times(f(r)\hat r) = 0$ for any radial $f$.` },
      { label: 'Gauge function', text: t`To cancel $\vec A$ we need $\nabla\lambda = \dfrac{1}{4\pi\varepsilon_0}\dfrac{qt}{r^2}\hat r$, so $\lambda = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{qt}{r}$. Then $\vec A' = 0$ and $V' = V - \dfrac{\partial\lambda}{\partial t} = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q}{r}$ — the familiar Coulomb potential.` },
      { label: 'Old gauge', text: t`$\nabla\cdot(\hat r/r^2) = 4\pi\delta^3(\vec r)$, so the original $\nabla\cdot\vec A = -qt\,\delta^3(\vec r)/\varepsilon_0$: zero everywhere except the origin, where it fails. Neither Coulomb nor Lorenz (since $\partial V/\partial t = 0$ there too).` },
      { label: 'New gauge', text: t`$\vec A' = 0$ and $V'$ is static: $\nabla\cdot\vec A' = 0$ and $\partial V'/\partial t = 0$, so the new pair satisfies **both** the Coulomb and the Lorenz conditions.` },
      { label: 'Sense check', text: t`A charge sitting still should have a static potential and no vector potential, and in a sensible gauge it does. The odd pair was the same physics wearing a time-dependent disguise.` },
    ],
    answer: t`A point charge at rest; $\lambda = -\dfrac{qt}{4\pi\varepsilon_0r}$ turns the pair into $V' = \dfrac{q}{4\pi\varepsilon_0r}$, $\vec A' = 0$, which satisfies both gauge conditions.`,
  },
  practice: [
    mcq({
      id: 'invariant', difficulty: 1,
      prompt: t`Under a gauge transformation $\vec A \to \vec A + \nabla\lambda$, $V \to V - \partial\lambda/\partial t$, which quantities are unchanged?`,
      visual: gaugePic(0.5, 1, t`A uniform field halfway between two gauges: half its $\vec E$ from $V$, half from $\vec A$.`),
      choices: [
        t`$\vec E$ and $\vec B$, and with them every force and every measurement`,
        t`$V$ and $\vec A$, but not $\vec E$`,
        t`$\vec B$ only; $\vec E$ changes by $-\nabla(\partial\lambda/\partial t)$`,
        t`Nothing: the transformation changes the physical situation`,
      ],
      answer: 0,
      why: {
        1: t`The potentials are what change; that is what a gauge transformation is.`,
        2: t`That change in $\vec E$ is exactly cancelled by the change in $V$: $-\nabla(-\partial\lambda/\partial t) - \partial(\nabla\lambda)/\partial t = 0$.`,
        3: t`$\vec E$ and $\vec B$ are what charges feel; they are untouched, so the physics is too.`,
      },
      hints: [t`Substitute the new potentials into $\vec B = \nabla\times\vec A$ and $\vec E = -\nabla V - \partial\vec A/\partial t$.`, t`$\nabla\times\nabla\lambda = 0$, and the order of $\nabla$ and $\partial/\partial t$ can be swapped.`],
      teach: 'A gauge transformation changes the potentials and nothing physical: E and B are untouched.',
      explain: t`$\nabla\times(\vec A + \nabla\lambda) = \vec B$, and $-\nabla(V - \partial_t\lambda) - \partial_t(\vec A + \nabla\lambda) = \vec E$. Classically only $\vec E$ and $\vec B$ act on charges, so gauge freedom is pure redundancy.`,
    }),
    expr({
      id: 'new-V', difficulty: 2,
      gen(r) {
        const a = r.int(2, 6), b = r.int(2, 5), p = r.pick([2, 3]);
        return {
          prompt: t`The potentials are $V = ${a}xt$ and $\vec A = 0$. Apply the gauge transformation with $\lambda = ${b}x^2t^${p}$. Find the new $V'(x, t)$.`,
          visual: gaugePic(0, 1, t`The starting gauge: here $V$ carries the whole electric field and $\vec A = 0$ (shapes schematic).`),
          answer: `${a}x t - ${b * p}x^2 t^${p - 1}`,
          answerTeX: t`${a}xt - ${b * p}x^2t${p - 1 > 1 ? `^${p - 1}` : ''}`,
          vars: { x: [-2, 2], t: [0.2, 2] },
          errors: [{ answer: `${a}x t + ${b * p}x^2 t^${p - 1}`, feedback: t`$V' = V - \partial\lambda/\partial t$: subtract.` }, { answer: `${a}x t - ${2 * b}x t^${p}`, feedback: t`That is $\partial\lambda/\partial x$, which belongs to $\vec A'$. $V$ changes by the **time** derivative.` }],
          hints: [t`$V' = V - \partial\lambda/\partial t$.`, t`$\partial\lambda/\partial t = ${b * p}x^2t${p - 1 > 1 ? `^${p - 1}` : ''}$.`],
          teach: 'V changes by minus the time derivative of λ; A changes by its gradient.',
          explain: t`$V' = ${a}xt - ${b * p}x^2t${p - 1 > 1 ? `^${p - 1}` : ''}$, and $\vec A' = \nabla\lambda = ${2 * b}xt^${p}\,\hat x$. The electric field is the same: check $-\partial V'/\partial x - \partial A'_x/\partial t = -${a}t$ in both.`,
        };
      },
    }),
    expr({
      id: 'kill-V', difficulty: 3,
      gen(r) {
        const a = r.int(2, 9), w = r.int(2, 6);
        return {
          prompt: t`In some region $\vec A = 0$ and $V = ${a}x\cos(${w}t)$ (SI units). Find a gauge function $\lambda(x, t)$ that makes the new scalar potential zero everywhere. (Any function of $x$ alone may be added to yours.)`,
          visual: gaugePic(0, 1, t`Before: all of the field comes from $V$. After the transformation it will all come from $\vec A$ (schematic).`),
          answer: `${a}x sin(${w}t)/${w}`,
          answerTeX: t`\frac{${a}x\sin(${w}t)}{${w}}`,
          vars: { t: [0, 2], x: [-2, 2] },
          mode: 'constant', integrand: `${a}*x*cos(${w}*t)`,
          errors: [{ answer: `-${a}x sin(${w}t)/${w}`, feedback: t`You need $\partial\lambda/\partial t = V$ (so that $V - \partial\lambda/\partial t = 0$): check the sign.` }, { answer: `${a * w}x sin(${w}t)`, feedback: t`Integrating $\cos(${w}t)$ divides by ${w}; it does not multiply.` }],
          hints: [t`You need $V' = V - \partial\lambda/\partial t = 0$, i.e. $\partial\lambda/\partial t = V$.`, t`Integrate $V$ over time: $\lambda = \int ${a}x\cos(${w}t)\,dt$.`],
          teach: 'Any V can be gauged away by λ = ∫V dt — the price is a vector potential ∇λ.',
          explain: t`$\lambda = \dfrac{${a}x\sin(${w}t)}{${w}}$ gives $V' = 0$ and $\vec A' = \nabla\lambda = \dfrac{${a}\sin(${w}t)}{${w}}\hat x$, so $\vec E = -\partial\vec A'/\partial t = -${a}\cos(${w}t)\,\hat x$ — the same as $-\nabla V$ before. (This is the “temporal gauge”, $V = 0$.)`,
        };
      },
    }),
    expr({
      id: 'coulomb-fix', difficulty: 3,
      gen(r) {
        const k = r.int(2, 6);
        return {
          prompt: t`The vector potential $\vec A = ${k}x\,\hat x$ (SI units) has $\nabla\cdot\vec A = ${k}$. Find a gauge function $\lambda(x)$ of $x$ alone, with $\lambda(0) = 0$ and $\lambda'(0) = 0$, that puts it in the Coulomb gauge.`,
          visual: { type: 'field2d', params: { P: `${k}*x`, Q: '0', x: [-2, 2], y: [-2, 2], density: 11, particles: false, readout: false, probe: false }, caption: t`$\vec A = ${k}x\,\hat x$ in the $xy$-plane: it spreads out from the line $x = 0$, so it has a divergence.` },
          answer: `-${k}x^2/2`,
          answerTeX: t`-\frac{${k}}{2}x^2`,
          vars: { x: [-2, 2] },
          errors: [{ answer: `${k}x^2/2`, feedback: t`You need $\nabla^2\lambda = -\nabla\cdot\vec A = -${k}$: the sign is negative.` }, { answer: `-${k}x`, feedback: t`That is $\lambda'$; you need $\lambda$ itself, with $\lambda'' = -${k}$.` }],
          hints: [t`The new divergence is $\nabla\cdot\vec A + \nabla^2\lambda$; set it to zero: $\lambda''(x) = -${k}$.`, t`Integrate twice, using $\lambda(0) = \lambda'(0) = 0$.`],
          teach: 'Reaching the Coulomb gauge means solving Poisson’s equation for λ: ∇²λ = −∇·A.',
          explain: t`$\lambda = -\tfrac{${k}}{2}x^2$ gives $\vec A' = ${k}x\,\hat x - ${k}x\,\hat x = 0$, which is divergence-free. (This $\vec A$ had no curl, so it was pure gauge all along.) In general $\nabla^2\lambda = -\nabla\cdot\vec A$ always has a solution — Poisson’s equation — so the Coulomb gauge can always be reached.`,
        };
      },
    }),
    multi({
      id: 'lorenz-check', difficulty: 3,
      prompt: t`Which of these pairs satisfy the Lorenz condition $\nabla\cdot\vec A + \dfrac{1}{c^2}\dfrac{\partial V}{\partial t} = 0$? ($A_0$, $\alpha$, $\beta$ constants; $\omega = ck$.)`,
      visual: { type: 'em-wave', params: { controls: false, readout: false, phase: 30 }, caption: t`A plane wave: one choice of its potentials is $V = 0$ with $\vec A$ along $\vec E$.` },
      choices: [
        t`$V = 0$, $\vec A = A_0\cos(kz - \omega t)\,\hat x$`,
        t`$V = cA_0\cos(kz - \omega t)$, $\vec A = A_0\cos(kz - \omega t)\,\hat z$`,
        t`$V = \dfrac{q}{4\pi\varepsilon_0r}$, $\vec A = 0$`,
        t`$V = \alpha xt$, $\vec A = 0$`,
        t`$V = 0$, $\vec A = \beta x\,\hat x$`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`$\partial V/\partial t = \alpha x \ne 0$ and there is no $\vec A$ to balance it.`,
        4: t`$\nabla\cdot\vec A = \beta \ne 0$ with nothing to balance it.`,
      },
      hints: [t`Compute $\nabla\cdot\vec A$ and $\partial V/\partial t$ for each pair.`, t`For the second pair: $\nabla\cdot\vec A = -kA_0\sin(kz - \omega t)$ and $\tfrac{1}{c^2}\partial_tV = \tfrac{\omega}{c}A_0\sin(kz - \omega t)$.`],
      teach: 'Lorenz: the divergence of A must balance (1/c²)∂V/∂t — automatically true for static V with A = 0, or transverse A with V = 0.',
      explain: t`The first is transverse ($\nabla\cdot\vec A = 0$) with $V = 0$; the third is static with $\vec A = 0$; in the second the two terms cancel because $\omega/c = k$. (That second pair has $\vec E = 0$ and $\vec B = 0$: it is pure gauge — $\lambda = (A_0/k)\sin(kz - \omega t)$ — a reminder that potentials can describe nothing at all.)`,
    }),
    mcq({
      id: 'why-lorenz', difficulty: 2,
      prompt: t`Why is the Lorenz gauge the natural choice in relativity and radiation problems?`,
      visual: { type: 'spacetime', params: { beta: 0.4, events: [[2.5, 0.5]], names: ['P'], simultaneity: false, hyperbolae: false, range: 4 }, caption: t`A spacetime diagram with two observers’ axes (light cone dashed). The Lorenz condition reads the same on both sets of axes.` },
      choices: [
        t`It gives each potential its own wave equation, $\Box^2V = -\rho/\varepsilon_0$ and $\Box^2\vec A = -\mu_0\vec J$, and the condition $\partial_\mu A^\mu = 0$ holds in every inertial frame`,
        'It is the only gauge in which the potentials are unique',
        'It makes the scalar potential instantaneous, which simplifies radiation problems',
        'It is the only gauge in which E and B come out correctly',
      ],
      answer: 0,
      why: {
        1: t`Lorenz potentials are not unique: any $\lambda$ with $\Box^2\lambda = 0$ can still be added.`,
        2: t`That is the Coulomb gauge. In the Lorenz gauge $V$ is retarded, like $\vec A$.`,
        3: t`Every gauge gives the correct $\vec E$ and $\vec B$; that is what gauge freedom means.`,
      },
      hints: [t`Substitute $\nabla\cdot\vec A = -\mu_0\varepsilon_0\partial_tV$ into the two potential equations of M4.1.`, t`With $A^\mu = (V/c, \vec A)$, the condition is $\partial_\mu A^\mu = 0$ — a four-divergence.`],
      teach: 'The Lorenz gauge decouples the equations into wave equations and is itself Lorentz invariant.',
      explain: t`The Lorenz condition cancels the cross terms, leaving $\Box^2 A^\mu = -\mu_0J^\mu$ with $\Box^2 = \nabla^2 - \frac{1}{c^2}\partial_t^2$: four copies of one wave equation, solved by retarded potentials (next lesson), all inside one four-vector equation that looks the same to every observer.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-causal', difficulty: 3,
      prompt: t`In the Coulomb gauge, $V(\vec r, t)$ is the Coulomb potential of the charges **as they are at time $t$**, however far away. If a charge on the Moon suddenly moves, $V$ on Earth changes at once. Does this let a signal travel faster than light?`,
      visual: { type: 'spacetime', params: { beta: 0, events: [[1, 0], [1, 3]], names: ['P', 'Q'], simultaneity: true, hyperbolae: false, range: 4 }, caption: t`Two events at the same time, outside each other’s light cones (dashed).` },
      choices: [
        t`No: $V$ cannot be measured on its own. In this gauge $\vec A$ carries a compensating instantaneous part, and the electric field, $-\nabla V - \partial\vec A/\partial t$, changes only when the news arrives at $c$`,
        'Yes: the Coulomb gauge is unphysical and must not be used for changing fields',
        'Yes, but only for static charges',
        t`No, because $V$ in the Coulomb gauge is always zero far from the charges`,
      ],
      answer: 0,
      why: {
        1: t`The Coulomb gauge is perfectly valid; it gives exactly the same $\vec E$ and $\vec B$ as any other gauge.`,
        2: 'A static charge sends no signal at all.',
        3: t`$V$ is the full Coulomb potential of the present charge distribution, not zero.`,
      },
      hints: ['What can a detector on Earth actually measure: V, or the force on a charge?', t`Gauge freedom means only $\vec E$ and $\vec B$ are physical.`],
      teach: 'Gauge-dependent quantities can change instantly; physical fields cannot — causality lives in E and B.',
      explain: t`The instantaneous change in $-\nabla V$ is cancelled by an instantaneous part of $-\partial\vec A/\partial t$ (the Coulomb-gauge $\vec A$ obeys a wave equation whose source contains a non-local piece). Their sum, $\vec E$, is the retarded field. A potential that jumps instantly is bookkeeping, not a signal.`,
    }),
    mcq({
      id: 'cp-gw', difficulty: 3, transfer: true,
      prompt: t`In weak gravity the metric is $g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}$, and relabelling coordinates, $x^\mu \to x^\mu + \xi^\mu$, changes $h_{\mu\nu}$ by $-(\partial_\mu\xi_\nu + \partial_\nu\xi_\mu)$ without changing any curvature. LIGO’s analyses use the **Lorenz (harmonic) gauge** $\partial^\mu\bar h_{\mu\nu} = 0$ (with $\bar h$ the trace-reversed $h$). What does it buy?`,
      visual: { type: 'gr-chirp', params: {}, caption: t`A gravitational-wave chirp and its effect on a detector’s arms: the waves travel at $c$, as the gauge-fixed wave equation says.` },
      choices: [
        t`As in electromagnetism, the field equations decouple into wave equations, $\Box^2\bar h_{\mu\nu} = -16\pi GT_{\mu\nu}/c^4$, solved by retarded potentials; leftover freedom with $\Box^2\xi^\mu = 0$ then strips the wave to two polarizations`,
        'It makes the gravitational potential instantaneous, so the waves arrive at once',
        'It is required for the curvature to be correct; other gauges give wrong predictions',
        'It removes the gravitational waves entirely, leaving only the Newtonian field',
      ],
      answer: 0,
      why: {
        1: t`That would be the analogue of the Coulomb gauge. In the Lorenz gauge everything is retarded and travels at $c$.`,
        2: t`Curvature is gauge-invariant, like $\vec E$ and $\vec B$; every gauge predicts the same measurements.`,
        3: t`Gauge choices cannot remove physical waves; the waves’ curvature is real and LIGO measured it.`,
      },
      hints: [t`Compare $\partial_\mu A^\mu = 0$ giving $\Box^2A^\mu = -\mu_0J^\mu$.`, t`In EM, $\Box^2\lambda = 0$ leftover freedom removes the unphysical parts of a wave’s $A^\mu$. The gravity version does the same to $h_{\mu\nu}$.`],
      teach: 'Linearized gravity is gauge theory again: the harmonic gauge gives wave equations, and residual freedom leaves two physical polarizations.',
      explain: t`The structure is the same as $\partial_\mu A^\mu = 0 \Rightarrow \Box^2A^\mu = -\mu_0J^\mu$. In electromagnetism the leftover freedom leaves light two transverse polarizations; in gravity it leaves the two polarizations $h_+$ and $h_\times$ that LIGO and Virgo measure. The derivation is in [the Road to Einstein](#/lesson/gr.S27.d).`,
    }),
    expr({
      id: 'cp-coulomb-away', difficulty: 3,
      gen(r) {
        const k = r.int(2, 9);
        return {
          prompt: t`A static potential $V = ${k}/r$, with $\vec A = 0$, is transformed with $\lambda = ${k}t/r$, so that $V' = 0$. Find the radial component $A'_r(r, t)$ of the new vector potential.`,
          visual: radialPic(t`A radial field pointing inward and falling as $1/r^2$ (a plane slice; arrow lengths compressed).`),
          answer: `-${k}t/r^2`,
          answerTeX: t`-\frac{${k}t}{r^2}`,
          vars: { r: [0.5, 3], t: [0.1, 3] },
          errors: [{ answer: `${k}t/r^2`, feedback: t`$\partial(1/r)/\partial r = -1/r^2$.` }, { answer: `-${k}/r^2`, feedback: t`$\lambda$ contains $t$: $\nabla\lambda = t\,\nabla(${k}/r)$.` }],
          hints: [t`$\vec A' = \vec A + \nabla\lambda$ with $\vec A = 0$.`, t`In spherical coordinates $(\nabla\lambda)_r = \partial\lambda/\partial r$.`],
          teach: 'A static Coulomb potential can be traded for a vector potential that grows linearly in time — the same field either way.',
          explain: t`$A'_r = \partial\lambda/\partial r = -${k}t/r^2$, and $V' = ${k}/r - \partial\lambda/\partial t = 0$ ✓. Then $\vec E = -\partial\vec A'/\partial t = (${k}/r^2)\hat r$, as before — the worked example run backwards.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §10.1.2–10.1.3 and Problem 10.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Jackson, From Lorenz to Coulomb and other explicit gauge transformations, Am. J. Phys. 70, 917 (2002)', url: 'https://doi.org/10.1119/1.1491265' },
  ],
});
