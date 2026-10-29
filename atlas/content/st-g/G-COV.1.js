// What "covariant" means — three meanings, kept apart. (1) Covariant
// components (lower index) change like the basis vectors, contravariant
// (upper) the opposite way; their pairing is invariant. (2) A covariant
// equation has both sides transform the same way, so it holds in every
// coordinate system (form invariance); "invariant" is stronger: unchanged.
// (3) The covariant derivative ∇ repairs ∂_μV^ν, which is not a tensor (a
// constant field has ∂_θV^r = −sin θ in polar coordinates) because Γ is not one
// (Γ^r_θθ = −r, though Γ = 0 in Cartesian). Worked example: the wave equation
// is Lorentz covariant but not Galilean covariant. Transfers: the ether's
// Michelson–Morley prediction ½(v/c)², and comma → semicolon.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const C = 299792458;

export default lesson({
  id: 'st-g.G-COV.1',
  title: 'What “covariant” means',
  minutes: 13, difficulty: 3,
  intro: t`“Covariant” is used in three different senses, and confusing them causes real errors. **Covariant components** — written with a lower index — change under a change of coordinates *the way the basis vectors do*; contravariant (upper-index) components change the opposite way:

$$V'^\mu = \frac{\partial x'^\mu}{\partial x^\nu}V^\nu, \qquad \omega'_\mu = \frac{\partial x^\nu}{\partial x'^\mu}\,\omega_\nu$$

so the pairing $\omega_\mu V^\mu$ comes out the same in every chart: it is **invariant**. A **covariant equation** is one whose two sides are tensors of the same type; then if it holds in one coordinate system it holds in all — it keeps its *form*. And the **covariant derivative** $\nabla$ is the derivative that makes such equations possible, because the plain $\partial_\mu V^\nu$ is not a tensor. Full lessons: [why covector components carry lower indices](#/lesson/st-a.A3.5) and [the Jacobian as the transformation rule](#/lesson/st-a.A4.2).`,
  symbols: [
    { tex: 'V^\\mu', text: 'contravariant components of a vector (upper index): they scale opposite to the basis' },
    { tex: '\\omega_\\mu', text: 'covariant components of a covector (lower index): they scale with the basis' },
    { tex: 'x^\\mu, x\'^\\mu', text: 'old and new coordinates' },
    { tex: '\\partial x\'^\\mu/\\partial x^\\nu', text: 'the Jacobian matrix of the coordinate change; its inverse carries the lower indices' },
    { tex: '\\nabla_\\mu', text: t`the covariant derivative, $\partial_\mu$ corrected by Christoffel symbols so the result is a tensor` },
  ],
  why: 'General relativity is written so that its equations are covariant — true in every coordinate system — and reading Einstein, Carroll or a GR paper requires knowing which of the three meanings is in play.',
  visual: {
    type: 'graph',
    title: 'Light signals in a moving frame',
    lead: t`Two light signals leave the origin, one each way, at speed $1$ ($c = 1$). Here they are drawn in the coordinates of an observer moving at $v$, transformed two ways: by a Galilean transformation (dashed) and by a Lorentz transformation (solid). The wave equation $\partial_t^2\phi - \partial_x^2\phi = 0$ says light moves at $\pm1$: does it still say so in the new coordinates?`,
    tasks: [
      t`Slide $v$: the Lorentz-transformed signals stay on $x' = \pm t'$. The wave equation keeps its form: it is **Lorentz covariant**.`,
      t`The Galilean signals move at $1 - v$ and $-1 - v$: in the new coordinates the equation has changed form (a cross term $\partial_{t'}\partial_{x'}$ appears). It is **not** Galilean covariant.`,
      t`Newton’s $F = ma$ is the other way round: Galilean covariant, not Lorentz covariant. Covariance is always *under some group* of transformations.`,
    ],
    params: {
      x: [-3, 3], y: [0, 2.6], equal: true, aspect: 'wide', xlabel: 'x′', ylabel: 't′',
      sliders: [{ key: 'v', label: t`Observer speed $v$`, min: -0.8, max: 0.8, step: 0.02, value: 0.4, explain: 'The new frame moves at v along x relative to the old one.' }],
      curves: [{ fn: 'x', domain: [0, 3], color: 'accent', width: 2.4, label: 'Lorentz', labelAt: 2.2, labelDx: 6, labelDy: 10 }, { fn: '-x', domain: [-3, 0], color: 'accent', width: 2.4 }, { param: ['(1 - v)*t', 't'], t: [0, 2.6], color: 'gold', dash: true, width: 2, label: 'Galilean', labelAt: 2.2, labelDx: 6 }, { param: ['(-1 - v)*t', 't'], t: [0, 2.6], color: 'gold', dash: true, width: 2 }],
      readouts: [{ label: 'Lorentz, right-moving signal', expr: '1', digits: 3 }, { label: 'Lorentz, left-moving', expr: '-1', digits: 3 }, { label: 'Galilean, right-moving', expr: '1 - v', digits: 3 }, { label: 'Galilean, left-moving', expr: '-1 - v', digits: 3 }],
    },
    caption: t`Exact: Galilean $x' = x - vt$, $t' = t$; Lorentz $x' = \gamma(x - vt)$, $t' = \gamma(t - vx)$. Experiment (Michelson–Morley onward) chooses Lorentz.`,
  },
  example: {
    prompt: t`Show that the 1+1 wave equation $\partial_t^2\phi - \partial_x^2\phi = 0$ ($c = 1$) changes form under the Galilean transformation $x' = x - vt$, $t' = t$, but keeps it under a Lorentz boost.`,
    visual: { type: 'graph', params: { x: [-3, 3], y: [0, 2.6], equal: true, aspect: 'wide', xlabel: 'x′', ylabel: 't′', curves: [{ fn: 'x', domain: [0, 3], color: 'accent', width: 2.4 }, { fn: '-x', domain: [-3, 0], color: 'accent', width: 2.4 }, { param: ['0.5*t', 't'], t: [0, 2.6], color: 'gold', dash: true, width: 2 }, { param: ['-1.5*t', 't'], t: [0, 2.6], color: 'gold', dash: true, width: 2 }] }, caption: t`$v = 0.5$: the light signals in the new coordinates, Lorentz (solid) and Galilean (dashed).` },
    steps: [
      { label: 'Chain rule', text: t`Under Galilean: $\partial_t = \partial_{t'} - v\,\partial_{x'}$ and $\partial_x = \partial_{x'}$ (from $\partial_t = \tfrac{\partial t'}{\partial t}\partial_{t'} + \tfrac{\partial x'}{\partial t}\partial_{x'}$).` },
      { label: 'Galilean result', text: t`$\partial_t^2 - \partial_x^2 = \partial_{t'}^2 - 2v\,\partial_{t'}\partial_{x'} + (v^2 - 1)\,\partial_{x'}^2$. A new cross term and a changed coefficient: the equation does not keep its form, and its waves travel at $\pm1 - v$.` },
      { label: 'Lorentz', text: t`Now $\partial_t = \gamma(\partial_{t'} - v\,\partial_{x'})$, $\partial_x = \gamma(\partial_{x'} - v\,\partial_{t'})$. Then $\partial_t^2 - \partial_x^2 = \gamma^2(1 - v^2)(\partial_{t'}^2 - \partial_{x'}^2) = \partial_{t'}^2 - \partial_{x'}^2$: the cross terms cancel.` },
      { label: 'Tensor form', text: t`$\partial_t^2 - \partial_x^2 = -\eta^{\mu\nu}\partial_\mu\partial_\nu$, and $\eta^{\mu\nu}\partial_\mu\partial_\nu\phi$ is a scalar under Lorentz transformations, because $\eta$ is invariant under them. Written that way, covariance is visible at a glance.` },
      { label: 'Sense check', text: t`$\phi$ is a scalar (invariant); the operator is invariant; so the equation is covariant — and so is its physics: light at $c$ in every inertial frame.` },
    ],
    answer: t`Galilean: $\partial_{t'}^2 - 2v\,\partial_{t'}\partial_{x'} - (1 - v^2)\partial_{x'}^2$, a different equation. Lorentz: $\partial_{t'}^2 - \partial_{x'}^2$, the same one — the wave equation $\eta^{\mu\nu}\partial_\mu\partial_\nu\phi = 0$ is Lorentz covariant.`,
  },
  practice: [
    num({
      id: 'components', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 0.5, 4]), V = r.pick([3, 6, 1.5]), w = r.pick([1, 2, 5]), which = r.pick(['vector', 'covector']);
        const ans = which === 'vector' ? V / k : w * k;
        return {
          prompt: t`Rescale the first basis vector: $e'_1 = ${k}\,e_1$ (for example, measuring in a unit ${k} times larger). A vector has component $V^1 = ${V}$ and a covector has $\omega_1 = ${w}$ in the old basis. What is the new ${which === 'vector' ? t`vector component $V'^1$` : t`covector component $\omega'_1$`}?`,
          visual: { type: 'graph', params: { x: [-1, 7], y: [-0.8, 1.6], aspect: 'wide', xlabel: '', ylabel: '', yticks: 0, arrows: [{ from: [0, 0], to: [1, 0], color: 'ink3', width: 2, label: 'e₁', labelDy: 14 }, { from: [0, 0.5], to: [k, 0.5], color: 'gold', width: 2.4, label: 'e′₁', labelDy: -8 }, { from: [0, 1.1], to: [Math.min(V, 6.8), 1.1], color: 'accent', width: 2.4, label: 'V', labelDy: -8 }] }, caption: t`The old basis vector, the new one, and the vector $V$ (its length fixed; only the labels change).` },
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: which === 'vector' ? V * k : w / k, feedback: which === 'vector' ? t`Upper-index components change *opposite* to the basis: a longer ruler gives a smaller number. $V = V^1e_1 = V'^1e'_1$.` : t`Lower-index components change *with* the basis: $\omega'_1 = \omega(e'_1) = ${k}\,\omega(e_1)$.` }].filter((e) => Math.abs(e.value - ans) > 0.001 * ans),
          hints: [which === 'vector' ? t`The arrow is unchanged: $V^1e_1 = V'^1e'_1 = V'^1\cdot${k}\,e_1$.` : t`A covector’s component is its value on the basis vector: $\omega'_1 = \omega(e'_1)$.`],
          teach: 'Covariant (lower) components change like the basis vectors; contravariant (upper) components change inversely — so their pairing does not change.',
          explain: t`${which === 'vector' ? t`$V'^1 = ${V}/${k} = ${nice(ans)}$` : t`$\omega'_1 = ${k}\cdot${w} = ${nice(ans)}$`}. The pairing $\omega_1V^1$ is the same before and after: $\omega'_1V'^1 = (${k}\omega_1)(V^1/${k})$.`,
        };
      },
    }),
    multi({
      id: 'tensors', difficulty: 3,
      prompt: t`Under a general change of coordinates on a curved manifold, which of these transform as tensors (so that an equation built from them holds in every chart)?`,
      visual: { type: 'gr-coordinates', params: { mode: 'measure', grid: 'polar', shape: 'circle', centre: [2, 1], radius: 1.5, readout: false }, caption: 'One flat plane under a polar grid and its coordinate chart: the same circle, very different coordinate pictures.' },
      choices: [t`$\partial_\mu\phi$ for a scalar field $\phi$`, t`$V^\mu W_\mu$`, t`$\nabla_\mu V^\nu$`, t`$\partial_\mu V^\nu$`, t`$\Gamma^\lambda{}_{\mu\nu}$`, t`the coordinates $x^\mu$ themselves`],
      answer: [0, 1, 2],
      why: {
        3: t`Differentiating $V'^\nu = \tfrac{\partial x'^\nu}{\partial x^\rho}V^\rho$ also differentiates the Jacobian: an extra term $\tfrac{\partial^2x'^\nu}{\partial x^\mu\partial x^\rho}V^\rho$ spoils the tensor law.`,
        4: t`The Christoffel symbols vanish in Cartesian coordinates on flat space but not in polar ones; a tensor that vanishes in one chart vanishes in all.`,
        5: t`Coordinates are labels; under $x \to x^2$ they do not change by a Jacobian. Only their differentials $dx^\mu$ (and displacements in flat space) behave like vectors.`,
      },
      hints: [t`Test each by asking: does it pick up second derivatives of the coordinate change?`, t`$\partial_\mu\phi$: chain rule only. $V^\mu W_\mu$: a scalar. $\nabla_\mu V^\nu$: built to be a tensor.`],
      teach: 'Tensors are objects whose components change by Jacobians alone; partial derivatives of vector components and Christoffel symbols pick up second derivatives and are not tensors.',
      explain: t`Gradients, contractions and covariant derivatives are tensors; $\partial_\mu V^\nu$ and $\Gamma$ are not — but their combination $\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}V^\lambda$ is, because the two bad terms cancel.`,
    }),
    num({
      id: 'polar-partial', difficulty: 3,
      gen(r) {
        const thDeg = r.pick([30, 60, 120, 150, 210]), th = (thDeg * Math.PI) / 180;
        const ans = -Math.sin(th);
        return {
          prompt: t`The constant field $\vec V = \hat x$ has polar components $V^r = \cos\theta$, $V^\theta = -\sin\theta/r$. At $\theta = ${thDeg}^\circ$, compute $\partial_\theta V^r$ — the plain partial derivative of a component of a field that does not change at all.`,
          visual: { type: 'gr-coordinates', params: { mode: 'field', readout: false }, caption: 'A constant field of arrows on a polar grid: the arrows never change, their polar components do.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.cos(th), feedback: t`That is $V^r$ itself; differentiate it with respect to $\theta$.` }, { value: 0, feedback: t`The *field* is constant, but its *components* in a turning basis are not: $\partial_\theta\cos\theta \ne 0$. That is why $\partial_\mu V^\nu$ is not a tensor.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * Math.abs(ans)),
          hints: [t`$V^r = \cos\theta$ depends on $\theta$ even though the arrows do not change: differentiate it.`, t`$\partial_\theta\cos\theta = -\sin\theta$.`],
          teach: 'Partial derivatives of components mix up change of the field with change of the basis; ∇ subtracts the second with Christoffel symbols.',
          explain: t`$\partial_\theta V^r = -\sin${thDeg}^\circ = ${nice(ans, 4)}$, yet $\nabla_\theta V^r = \partial_\theta V^r + \Gamma^r{}_{\theta\theta}V^\theta$, $= -\sin\theta + (-r)(-\sin\theta/r) = 0$, as it must for a constant field.`,
        };
      },
    }),
    num({
      id: 'christoffel', difficulty: 2,
      gen(r) {
        const rr = r.pick([0.5, 2, 3.5, 6]);
        const ans = -rr;
        return {
          prompt: t`In polar coordinates on the flat plane, $\Gamma^r{}_{\theta\theta} = -r$ (it describes how $\partial_\theta$ turns and grows as you move round). Evaluate it at $r = ${rr}$ — and note that in Cartesian coordinates every Christoffel symbol of the same plane is $0$.`,
          visual: { type: 'gr-coordinates', params: { mode: 'basis', readout: false }, caption: 'The polar grid’s own basis arrows: r̂ turns, and the step for a fixed Δθ grows with r.' },
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: rr, feedback: t`Sign: $\Gamma^r{}_{\theta\theta} = -r$; moving along $\theta$, the basis vector $\partial_\theta$ turns *inward*.` }, { value: 1 / rr, feedback: t`That is $\Gamma^\theta{}_{r\theta} = 1/r$, a different component.` }].filter((e) => Math.abs(e.value - ans) > 0.001 * Math.abs(ans)),
          hints: [t`Substitute $r = ${rr}$ into $-r$.`],
          teach: 'Christoffel symbols are zero in one chart and not in another for the same flat plane — so they are not tensors.',
          explain: t`$\Gamma^r{}_{\theta\theta} = ${nice(ans)}$. A tensor that vanishes in one coordinate system vanishes in all; $\Gamma$ does not, so $\Gamma$ is coordinate bookkeeping, not geometry. Curvature, built from $\Gamma$’s derivatives, is a tensor — and it is zero here in every chart.`,
        };
      },
    }),
    mcq({
      id: 'newton', difficulty: 2,
      prompt: t`Under a Galilean boost $x' = x - vt$, $t' = t$, which law keeps its form?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [0, 2.6], aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ param: ['0.4*t^2', 't'], t: [0, 2.6], color: 'accent', width: 2.2, label: 'x(t), frame S', labelAt: 2.3, labelDx: 6 }, { param: ['0.4*t^2 - 0.8*t', 't'], t: [0, 2.6], color: 'gold', width: 2.2, label: 'x′(t), frame S′', labelAt: 2.3, labelDx: -30, labelDy: -10 }] }, caption: t`One accelerating particle in two frames related by a Galilean boost ($v = 0.8$): the curves differ by a straight-line shear, so their curvature — the acceleration — is the same.` },
      choices: [t`Newton’s second law, $\vec F = m\vec a$: accelerations are unchanged`, t`The wave equation for light, $\partial_t^2\phi - c^2\partial_x^2\phi = 0$`, t`Maxwell’s equations`, t`The law that light moves at $c$ in every frame`],
      answer: 0,
      why: {
        1: t`Under Galilean boosts it gains a cross term $-2v\,\partial_{t'}\partial_{x'}$: not covariant.`,
        2: t`Maxwell’s equations predict waves at $c$; under a Galilean boost they change form. They are Lorentz covariant — that is how special relativity was found.`,
        3: t`Galilean velocities add: light would move at $c - v$ ahead and $c + v$ behind.`,
      },
      hints: [t`$x' = x - vt$ gives $\ddot x' = \ddot x$.`, 'Forces and masses are taken to be the same in both frames.'],
      teach: 'Covariance is relative to a group: Newton’s laws are Galilean covariant, Maxwell’s are Lorentz covariant, and they cannot both be exact.',
      explain: t`$\ddot x' = \ddot x$, so $F = ma$ holds in both frames. Einstein kept Maxwell and changed mechanics; general relativity then asks for covariance under *all* coordinate changes.`,
    }),
    mcq({
      id: 'invariant-or-covariant', difficulty: 3,
      prompt: t`A particle has four-momentum $p^\mu$ and mass $m$. Which statement uses the words correctly?`,
      visual: { type: 'graph', params: { x: [-1.5, 3.5], y: [0, 3.5], equal: true, aspect: 'wide', xlabel: 'momentum', ylabel: 'energy', curves: [{ fn: 'abs(x)', color: 'warn', dash: true, width: 1 }, { fn: 'sqrt(1 + x^2)', color: 'ink3', dash: true, width: 1.4 }], arrows: [{ from: [0, 0], to: [0.75, 1.25], color: 'gold', width: 2.4, label: 'p (frame S)' }, { from: [0, 0], to: [2.4, 2.6], color: 'accent', width: 2.4, label: 'p (frame S′)', labelDx: -60 }] }, caption: t`The same particle’s four-momentum seen from two frames, $c = 1$, $m = 1$: different components, the same mass shell.` },
      choices: [t`$m^2 = -p_\mu p^\mu$ is invariant; $E = p^0$ is not; $p^\mu = mu^\mu$ is a covariant equation`, t`$E$ is invariant, because energy is conserved`, t`$p^\mu$ is invariant, because it is a four-vector`, t`$m^2 = -p_\mu p^\mu$ is covariant but not invariant`],
      answer: 0,
      why: {
        1: t`Conserved (in time) and invariant (between frames) are different ideas: the energy is conserved in each frame but differs between frames.`,
        2: t`The *vector* is frame-independent as a geometric object, but its components $p^\mu$ change; “invariant” usually means a number every frame agrees on.`,
        3: t`A scalar is the special case of a covariant quantity that does not change at all: “invariant” is the stronger word, and it applies to $m^2$.`,
      },
      hints: ['Invariant: the same number in every frame. Covariant: transforms by the tensor rules, so equations between such objects hold in every frame.', 'In the picture, what do the two arrows share, and what do they not?'],
      teach: 'Invariant means unchanged; covariant means transforming by the tensor rules so that equations keep their form; conserved means constant in time — three different ideas.',
      explain: t`Both arrows end on the same hyperbola: $m^2$ is invariant. Their $E$ components differ. And $p^\mu = mu^\mu$ is covariant: both sides are four-vectors, so it holds in every frame.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ether', difficulty: 3, transfer: true,
      gen(r) {
        const [what, v] = r.pick([['the Earth’s orbital speed round the Sun', 29780], ['the Sun’s speed relative to the cosmic microwave background', 369820], ['a GPS satellite’s orbital speed', 3874]]);
        const b = v / C, ans = (b * b) / 2;
        return {
          prompt: t`If light obeyed a Galilean-covariant law (speed $c$ only in an “ether” frame), a Michelson interferometer moving through the ether at $v$ would see the round trip along its arm parallel to the motion take longer than the perpendicular one by the fraction $\Delta T/T \approx \tfrac12(v/c)^2$. For $v$ = ${what}, $${v / 1000}\ \text{km/s}$, what is that fraction?`,
          visual: { type: 'graph', params: { x: [-1, 3.4], y: [-0.4, 1.6], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, arrows: [{ from: [0, 0], to: [2.4, 0], color: 'accent', width: 2.4, label: 'arm along v' }, { from: [0, 0], to: [0, 1.3], color: 'gold', width: 2.4, label: 'perpendicular arm' }, { from: [2.6, 1.1], to: [3.3, 1.1], color: 'ink3', width: 2, label: 'v' }] }, caption: 'The two equal arms of a Michelson interferometer and the supposed motion through the ether (schematic).' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: b, feedback: t`That is $v/c$; the round-trip effect is second order, $\tfrac12(v/c)^2$.` }, { value: b * b, feedback: 'Close: the parallel arm’s factor 1/(1 − β²) and the perpendicular arm’s 1/√(1 − β²) differ by ½β².' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$v/c = ${tex(b, 4)}$.`, t`Square it and halve.`],
          teach: 'An ether — a Galilean-covariant light law — predicts a second-order anisotropy; Michelson and Morley’s null result is one of the experiments that chose Lorentz covariance instead.',
          explain: t`$\tfrac12(${tex(b, 4)})^2 = ${tex(ans, 3)}$. Michelson–Morley (1887) could see about a fortieth of the Earth-orbit value and saw nothing; modern versions bound the anisotropy below about $10^{-17}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-comma', difficulty: 3,
      prompt: t`In a freely falling frame, where the Christoffel symbols vanish at a point, energy–momentum conservation reads $\partial_\mu T^{\mu\nu} = 0$. What is the generally covariant equation, and why?`,
      choices: [t`$\nabla_\mu T^{\mu\nu} = 0$: it is a tensor equation that reduces to the local one where $\Gamma = 0$, so it holds in every chart`, t`$\partial_\mu T^{\mu\nu} = 0$ in every chart, since it holds in one`, t`$\nabla_\mu T^{\mu\nu} = \Gamma^\nu{}_{\mu\lambda}T^{\mu\lambda}$`, t`There is none: conservation fails in curved spacetime`],
      answer: 0,
      why: {
        1: t`$\partial_\mu T^{\mu\nu}$ is not a tensor, so “zero in one chart” does not carry over to others.`,
        2: t`Where $\Gamma = 0$ this would read $\partial_\mu T^{\mu\nu} = 0$ — fine there, but the right side is not a tensor, so the equation is not covariant.`,
        3: t`Local conservation survives as $\nabla_\mu T^{\mu\nu} = 0$; what fails in general is a *global* conserved total energy.`,
      },
      hints: ['A tensor equation true in one chart is true in all.', 'Replace each partial derivative by a covariant one: the comma-to-semicolon rule.'],
      teach: 'The comma-to-semicolon rule: write the flat-space law, replace ∂ by ∇, and the result is a tensor equation valid in every chart — usually the right one.',
      explain: t`$\nabla_\mu T^{\mu\nu} = 0$ is a tensor equation and agrees with the local law where $\Gamma = 0$. “Usually” matters: when second derivatives appear, the rule is ambiguous — see [general covariance and its limits](#/lesson/st-g.G-COV.2).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley, 2004), §§1.4–1.6, 3.1–3.2, 4.1', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Norton, General covariance and the foundations of general relativity, Rep. Prog. Phys. 56, 791 (1993)', url: 'https://doi.org/10.1088/0034-4885/56/7/001' },
    { label: 'Michelson & Morley, On the relative motion of the Earth and the luminiferous ether, Am. J. Sci. 34, 333 (1887)', url: 'https://doi.org/10.2475/ajs.s3-34.203.333' },
  ],
});
