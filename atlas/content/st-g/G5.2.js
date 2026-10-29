// Actions for fields — relativistic ones. S = ∫𝓛 d⁴x with a Lorentz-scalar
// density; the field Euler–Lagrange equation ∂_μ ∂𝓛/∂(∂_μφ) = ∂𝓛/∂φ. Worked:
// Klein–Gordon, 𝓛 = −½η^{μν}∂_μφ∂_νφ − ½m²φ² in (−,+,+,+), giving □φ = m²φ and
// ω² = k² + m² (explore: phase velocity > 1, group velocity < 1, product 1).
// Practice: the sign of the kinetic term in this signature, dispersion,
// Yukawa range ħ/mc (π⁺: 1.414 fm), Maxwell from −¼F² + A_μJ^μ giving
// ∂_μF^{νμ} = J^ν (Carroll’s convention), natural-unit dimensions of φ in D
// dimensions ((D − 2)/2), Noether’s shift current, minimal coupling
// (√−g, g^{μν}). Transfer: a graviton mass would make Newton a Yukawa law
// (range 2.1 ly for 10⁻²³ eV) and slow gravitational waves (1 − v/c ≈ m²/2E²).
// Overlaps: phys3550 M12.1 (relativistic particle) and M13.1 (string, foundation
// and beam densities), gr S16.d (field stress tensors) are linked, not repeated.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const HBARC_MEV_FM = 197.3269804, HBARC_EV_M = 1.973269804e-7, LY = 9.4607e15, H_EV_S = 4.135667696e-15;

export default lesson({
  id: 'st-g.G5.2',
  title: 'Actions for fields',
  minutes: 16, difficulty: 3,
  intro: t`A field theory is specified by one number-valued functional, the **action**: an integral over spacetime of a **Lagrangian density**. Relativity demands that every observer agree on it, so $\mathcal L$ must be a Lorentz scalar built from the field and its derivatives $\partial_\mu\phi$. Making the action stationary under every variation of the field (which vanishes at the boundary) gives the field equation:

$$\begin{gathered}S[\phi] = \int\mathcal L(\phi, \partial_\mu\phi)\,d^4x \\ \partial_\mu\frac{\partial\mathcal L}{\partial(\partial_\mu\phi)} = \frac{\partial\mathcal L}{\partial\phi}\end{gathered}$$

This is the [functional derivative](#/lesson/st-g.G5.1) $\delta S/\delta\phi = 0$ with time treated like space. A particle’s action is [its proper time](#/lesson/phys3550.M12.1) and a string’s is [a density along it](#/lesson/phys3550.M13.1); here the density fills spacetime. Natural units, $c = \hbar = 1$; signature $(-, +, +, +)$, so $\partial_\mu\phi\,\partial^\mu\phi = -\dot\phi^2 + |\nabla\phi|^2$.`,
  symbols: [
    { tex: 'S[\\phi]', text: t`the action, a single number for each field history; with $\hbar = 1$ it is dimensionless` },
    { tex: '\\phi(x)', text: t`the field, a function of the spacetime point $x = (t, \mathbf x)$` },
    { tex: '\\mathcal L', text: t`the Lagrangian density: action per unit spacetime volume, a Lorentz scalar` },
    { tex: 'd^4x', text: t`the spacetime volume element $dt\,dx\,dy\,dz$ (in curved spacetime, $\sqrt{-g}\,d^4x$)` },
    { tex: '\\partial_\\mu', text: t`the partial derivative $\partial/\partial x^\mu$, with $\mu = 0, 1, 2, 3$ and $x^0 = t$; repeated indices are summed` },
    { tex: '\\frac{\\partial\\mathcal L}{\\partial(\\partial_\\mu\\phi)}', text: t`the derivative of $\mathcal L$ with respect to each of the four first derivatives of $\phi$, treated as independent variables` },
  ],
  why: 'Gravity gets the same treatment in the next lesson: write the one scalar density geometry allows, vary it, and Einstein’s equations come out.',
  visual: {
    type: 'graph',
    title: 'A mass term opens a gap',
    lead: t`The Klein–Gordon field’s plane waves $e^{i(\mathbf k\cdot\mathbf x - \omega t)}$ obey $\omega^2 = k^2 + m^2$ (blue). The light line $\omega = k$ is dashed. At the chosen $k$: the slope of the gold line from the origin is the phase velocity $\omega/k$; the slope of the tangent (violet) is the group velocity $d\omega/dk$, the speed of a wave packet.`,
    tasks: [
      t`Set $m = 0$: the curve is the light line; every wave moves at $1$ (the speed of light) — the massless case is the ordinary wave equation.`,
      t`Raise $m$: no wave has $\omega < m$ — a gap. A quantum of this field needs energy at least $mc^2$.`,
      t`At small $k$ the phase velocity exceeds $1$ while the group velocity is below it: the readouts multiply to exactly $1$. Signals travel at the group velocity, never faster than light.`,
    ],
    params: {
      x: [0, 3], y: [0, 3.6], aspect: 'wide', axesAt: 'edge', xlabel: 'wavenumber k', ylabel: 'frequency ω',
      sliders: [
        { key: 'm', label: 'Mass $m$', min: 0, max: 2, step: 0.05, value: 1, explain: t`The mass term’s coefficient; in ordinary units $mc^2/\hbar$ as a frequency.` },
        { key: 'kk', label: 'Wavenumber $k$', min: 0.2, max: 3, step: 0.05, value: 0.8, explain: 'Which plane wave to read off.' },
      ],
      curves: [
        { fn: 'sqrt(x^2 + m^2)', color: 'accent', width: 2.4, label: 'ω² = k² + m²', labelAt: 2.3, labelDx: -40, labelDy: -14 },
        { fn: 'x', color: 'ink3', width: 1.4, dash: true, label: 'light line', labelAt: 2.9, labelDx: -50, labelDy: 14 },
        { fn: 'x*sqrt(kk^2 + m^2)/kk', color: 'gold', width: 1.6, domain: [0, 3] },
        { fn: 'sqrt(kk^2 + m^2) + (x - kk)*kk/sqrt(kk^2 + m^2)', color: 'violet', width: 1.6, dash: true },
      ],
      points: [{ x: 'kk', y: 'sqrt(kk^2 + m^2)', color: 'accent', r: 5 }],
      readouts: [
        { label: t`phase velocity $\omega/k$`, expr: 'sqrt(kk^2 + m^2)/kk', digits: 3 },
        { label: t`group velocity $d\omega/dk$`, expr: 'kk/sqrt(kk^2 + m^2)', digits: 3 },
      ],
    },
    caption: t`Units with $c = \hbar = 1$: velocities are fractions of $c$, and $m$, $k$, $\omega$ share one unit. Exact dispersion relation of the free Klein–Gordon equation.`,
  },
  example: {
    prompt: t`Derive the field equation and the dispersion relation of the Klein–Gordon action, $\mathcal L = -\tfrac12\eta^{\mu\nu}\partial_\mu\phi\,\partial_\nu\phi - \tfrac12m^2\phi^2$.`,
    visual: { type: 'graph', params: { x: [0, 3], y: [0, 3.6], aspect: 'wide', axesAt: 'edge', xlabel: 'wavenumber k', ylabel: 'frequency ω', curves: [{ fn: 'sqrt(x^2 + 1)', color: 'accent', width: 2.2, label: 'm = 1', labelAt: 2.3, labelDx: -36, labelDy: -12 }, { fn: 'x', color: 'ink3', width: 1.4, dash: true, label: 'm = 0', labelAt: 2.9, labelDx: -40, labelDy: 14 }], hlines: [{ y: 1, color: 'gold', label: 'gap: ω ≥ m' }] }, caption: t`The result: a hyperbola above the light line, with a gap below $\omega = m$.` },
    steps: [
      { label: 'Read the density', text: t`In $(-, +, +, +)$, $-\tfrac12\eta^{\mu\nu}\partial_\mu\phi\,\partial_\nu\phi = \tfrac12\dot\phi^2 - \tfrac12|\nabla\phi|^2$: kinetic minus gradient energy, as for a string. The mass term $-\tfrac12m^2\phi^2$ is a potential holding $\phi$ near $0$.` },
      { label: 'Differentiate', text: t`$\dfrac{\partial\mathcal L}{\partial(\partial_\mu\phi)} = -\eta^{\mu\nu}\partial_\nu\phi = -\partial^\mu\phi$ (the $\tfrac12$ cancels the two identical factors), and $\dfrac{\partial\mathcal L}{\partial\phi} = -m^2\phi$.` },
      { label: 'Field equation', text: t`$\partial_\mu(-\partial^\mu\phi) = -m^2\phi$, so $\Box\phi = m^2\phi$, with $\Box = \partial_\mu\partial^\mu = -\partial_t^2 + \nabla^2$. One equation per spacetime point.` },
      { label: 'Plane waves', text: t`Try $\phi = e^{i(\mathbf k\cdot\mathbf x - \omega t)}$: $\Box \to \omega^2 - k^2$, so $\omega^2 - k^2 = m^2$. Restoring units, $\hbar^2\omega^2 = \hbar^2c^2k^2 + m^2c^4$: $E^2 = p^2c^2 + m^2c^4$ for the field’s quanta.` },
      { label: 'Sense check', text: t`$m = 0$ gives $\Box\phi = 0$, the wave equation at speed $1$. And the Lorentz scalar $\partial_\mu\phi\,\partial^\mu\phi$ guarantees the equation looks the same to every inertial observer.` },
    ],
    answer: t`$\Box\phi = m^2\phi$ (the Klein–Gordon equation), with $\omega^2 = k^2 + m^2$ — relativity’s $E^2 = p^2 + m^2$ for the quanta.`,
  },
  practice: [
    mcq({
      id: 'kinetic-sign', difficulty: 2,
      prompt: t`In signature $(-, +, +, +)$ a student writes $\mathcal L = +\tfrac12\partial_\mu\phi\,\partial^\mu\phi - \tfrac12m^2\phi^2$. What goes wrong?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-2.5, 2.5], aspect: 'wide', axesAt: 'edge', xlabel: 'k', ylabel: 'ω²', curves: [{ fn: 'x^2 + 1', color: 'accent', width: 2.2, label: 'correct sign: ω² = k² + m²', labelAt: 1.1, labelDx: 6, labelDy: -6 }, { fn: 'x^2 - 1', color: 'bad', width: 2.2, dash: true, label: 'flipped sign', labelAt: 1.6, labelDx: 6, labelDy: 12 }] }, caption: t`With the kinetic sign flipped relative to the mass term, $\omega^2 = k^2 - m^2$ goes negative for long waves (dashed).` },
      choices: [
        t`The kinetic term becomes $-\tfrac12\dot\phi^2 + \tfrac12|\nabla\phi|^2$, opposite in sign to the mass term: long waves get $\omega^2 = k^2 - m^2 < 0$ and grow exponentially`,
        t`Nothing: the overall sign of a Lagrangian never matters`,
        t`The equation becomes first order in time`,
        t`The field becomes complex`,
      ],
      answer: 0,
      why: {
        1: t`An overall sign of the **whole** Lagrangian does not change the equations; flipping one term relative to another does.`,
        2: t`The order of the equation is set by the number of derivatives, which is unchanged.`,
        3: t`Signs of real terms cannot make a real field complex; they change the dispersion relation.`,
      },
      hints: [t`Expand $\partial_\mu\phi\,\partial^\mu\phi$ in this signature.`, t`Redo the plane-wave substitution with the flipped kinetic term but the same mass term.`],
      teach: t`In $(-, +, +, +)$ a healthy scalar has $\mathcal L = -\tfrac12\partial_\mu\phi\,\partial^\mu\phi - V$; in $(+, -, -, -)$ textbooks the same physics reads $+\tfrac12\partial_\mu\phi\,\partial^\mu\phi - V$.`,
      explain: t`$\partial_\mu\phi\,\partial^\mu\phi = -\dot\phi^2 + |\nabla\phi|^2$ here, so $+\tfrac12$ of it puts a minus sign on $\dot\phi^2$. Relative to the mass term the field becomes tachyonic: $\omega^2 = k^2 - m^2$. Translating between signature conventions is the subject of [the sign-convention lesson](#/lesson/st-g.G-SIG.1).`,
    }),
    num({
      id: 'group-velocity', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), k = r.pick([0.5, 1, 1.5, 3]);
        const ans = k / Math.sqrt(k * k + m * m);
        return {
          prompt: t`For a Klein–Gordon field of mass $m = ${m}$ (natural units), what is the group velocity $d\omega/dk$ of waves with $k = ${k}$, as a fraction of $c$?`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 4.6], aspect: 'wide', axesAt: 'edge', xlabel: 'k', ylabel: 'ω', curves: [{ fn: `sqrt(x^2 + ${m * m})`, color: 'accent', width: 2.2 }, { fn: 'x', color: 'ink3', width: 1.3, dash: true }], vlines: [{ x: k, color: 'gold', label: `k = ${k}` }] }, caption: t`The dispersion relation; the group velocity is the slope of the blue curve at $k$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k * k + m * m) / k, feedback: t`That is the phase velocity $\omega/k$, which exceeds $1$. A packet moves at the slope $d\omega/dk$.` }, { value: Math.sqrt(k * k + m * m), feedback: t`That is $\omega$ itself.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Differentiate $\omega = \sqrt{k^2 + m^2}$.`, t`$d\omega/dk = k/\sqrt{k^2 + m^2}$.`],
          teach: t`Massive waves have group velocity $k/\omega < 1$: the relativistic $v = p/E$ of the field’s quanta.`,
          explain: t`$${k}/\sqrt{${k * k} + ${m * m}} = ${nice(ans, 4)}$, the same as $v = pc^2/E$ for a particle of mass $m$ and momentum $k$. Phase velocity times group velocity is $1$.`,
        };
      },
    }),
    num({
      id: 'yukawa-range', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['a charged pion', 139.57], ['a neutral pion', 134.98], ['a kaon', 493.68], ['a ρ meson', 775.26]]);
        const ans = HBARC_MEV_FM / m;
        return {
          prompt: t`A static point source of a massive scalar field, $(\nabla^2 - m^2)\phi = -g\,\delta^3(\mathbf x)$, gives the Yukawa potential $\phi = \dfrac{g\,e^{-r/\lambda}}{4\pi r}$ with range $\lambda = \hbar/(mc)$. For ${name} ($mc^2 = ${m}\ \text{MeV}$), what is $\lambda$ in femtometres? Use $\hbar c = 197.327\ \text{MeV fm}$.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'r / λ', ylabel: '', curves: [{ fn: '1/x', color: 'ink3', width: 1.6, dash: true, domain: [0.4, 4], label: 'massless: 1/r', labelAt: 1.5, labelDy: -10 }, { fn: 'e^(-x)/x', color: 'accent', width: 2.2, domain: [0.4, 4], label: 'Yukawa: e^(−r/λ)/r', labelAt: 0.9, labelDx: 6, labelDy: 4 }] }, caption: t`The field of a static source, massless against massive, in units of the range $\lambda$.` },
          answer: ans, units: 'fm', tol: { rel: 0.005 },
          errors: [{ value: m / HBARC_MEV_FM, feedback: t`Inverted: $\lambda = \hbar c/(mc^2)$, a length.` }, { value: (2 * Math.PI * HBARC_MEV_FM) / m, feedback: t`That is the Compton wavelength $h/(mc)$. The Yukawa range is the reduced one, $\hbar/(mc)$.` }],
          hints: [t`$\lambda = \dfrac{\hbar c}{mc^2}$.`, t`$197.327/${m}$.`],
          teach: 'A mass term makes a static field fall off as $e^{-r/\\lambda}/r$ with range ħ/mc: heavier carriers, shorter forces.',
          explain: t`$\lambda = 197.327/${m} = ${nice(ans, 4)}\ \text{fm}$. Yukawa predicted the pion in 1935 from the nuclear force’s range of about $1.4$ fm. A massless carrier — the photon, and as far as anyone can tell the graviton — gives the $1/r$ of Coulomb and Newton.`,
        };
      },
    }),
    mcq({
      id: 'maxwell', difficulty: 3,
      prompt: t`Vary $\mathcal L = -\tfrac14F_{\mu\nu}F^{\mu\nu} + A_\mu J^\mu$, with $F_{\mu\nu} = \partial_\mu A_\nu - \partial_\nu A_\mu$, with respect to $A_\nu$. Using $\dfrac{\partial\mathcal L}{\partial(\partial_\mu A_\nu)} = -F^{\mu\nu}$, which field equation results?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-1.4, 1.4], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', xticks: 0, yticks: 0, arrows: [0, 45, 90, 135, 180, 225, 270, 315].map((d) => { const a = (d * Math.PI) / 180; return { from: [0.3 * Math.cos(a), 0.3 * Math.sin(a)], to: [1.1 * Math.cos(a), 1.1 * Math.sin(a)], color: 'accent' }; }), points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'J⁰ = ρ > 0', labelDx: 10, labelDy: -14 }] }, caption: t`The answer must reduce to Gauss’s law: field lines leaving a positive charge density (natural Heaviside–Lorentz units, $\varepsilon_0 = 1$).` },
      choices: [
        t`$\partial_\mu F^{\nu\mu} = J^\nu$, whose $\nu = 0$ part is $\nabla\cdot\mathbf E = \rho$`,
        t`$\partial_\mu F^{\mu\nu} = J^\nu$`,
        t`$\partial_\mu F^{\mu\nu} = 0$, because the source term has no derivatives of $A$`,
        t`$F^{\mu\nu} = J^\nu$`,
      ],
      answer: 0,
      why: {
        1: t`The Euler–Lagrange equation gives $\partial_\mu(-F^{\mu\nu}) = J^\nu$, i.e. $\partial_\mu F^{\mu\nu} = -J^\nu$: the sign matters, and fixes whether like charges repel.`,
        2: t`$A_\mu J^\mu$ contributes $\partial\mathcal L/\partial A_\nu = J^\nu$ to the right-hand side, even though it has no derivatives.`,
        3: t`The equation must contain derivatives of $F$: index counting alone shows a free index $\nu$ on both sides after one derivative is contracted.`,
      },
      hints: [t`Euler–Lagrange: $\partial_\mu\bigl(\partial\mathcal L/\partial(\partial_\mu A_\nu)\bigr) = \partial\mathcal L/\partial A_\nu$.`, t`Left side: $-\partial_\mu F^{\mu\nu}$. Right side: $J^\nu$. Then use $F^{\mu\nu} = -F^{\nu\mu}$.`],
      teach: 'Maxwell’s inhomogeneous equations are the Euler–Lagrange equations of −¼F² + A·J; the homogeneous ones are identities of F = dA.',
      explain: t`$-\partial_\mu F^{\mu\nu} = J^\nu$, which is $\partial_\mu F^{\nu\mu} = J^\nu$ — Carroll’s form. With $F^{0i} = E^i$ in this signature, $\nu = 0$ gives $\partial_iE^i = J^0 = \rho$. The other two Maxwell equations come free from $F = \partial A - \partial A$.`,
    }),
    num({
      id: 'field-dimension', difficulty: 3,
      gen(r) {
        const D = r.pick([3, 5, 6, 10, 11]);
        const ans = (D - 2) / 2;
        return {
          prompt: t`With $\hbar = c = 1$ the action is dimensionless, lengths are inverse masses, and $d^Dx$ in $D$ spacetime dimensions has mass dimension $-D$. The kinetic term $\partial_\mu\phi\,\partial^\mu\phi$ must therefore have mass dimension $D$. What is the mass dimension of a scalar field $\phi$ in $D = ${D}$?`,
          visual: { type: 'graph', params: { x: [1.5, 11.5], y: [-0.5, 5], aspect: 'wide', axesAt: 'edge', xlabel: 'spacetime dimension D', ylabel: '[φ]', xticks: 10, points: [{ x: 4, y: 1, color: 'gold', label: 'D = 4: [φ] = 1' }, { x: D, y: -0.2, color: 'accent', r: 0, label: `D = ${D}`, labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`In our four dimensions a scalar field has the dimension of a mass. The dimension you want sits above the label.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: D / 2, feedback: t`Each $\partial$ carries dimension $1$: $2[\phi] + 2 = D$.` }, { value: D - 2, feedback: t`Two powers of $\phi$ share the dimension: $2[\phi] = D - 2$.` }],
          hints: [t`$[\partial] = 1$, so $[\partial\phi\,\partial\phi] = 2[\phi] + 2$.`, t`Set $2[\phi] + 2 = ${D}$.`],
          teach: 'Requiring a dimensionless action fixes a field’s units: a scalar has mass dimension (D − 2)/2, which is 1 in four dimensions.',
          explain: t`$[\phi] = (${D} - 2)/2 = ${ans}$. The same counting gives Newton’s constant mass dimension $2 - D$ — in four dimensions $G$ is an inverse mass squared, $1/M_{\text{Pl}}^2$.`,
        };
      },
    }),
    mcq({
      id: 'noether-shift', difficulty: 3,
      prompt: t`The massless action $\mathcal L = -\tfrac12\partial_\mu\phi\,\partial^\mu\phi$ is unchanged by the shift $\phi \to \phi + c$ for any constant $c$. By Noether’s theorem, which current is conserved, and what happens when the mass term is added?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-0.5, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'φ', ylabel: 'potential', curves: [{ fn: '0', color: 'ink2', width: 2, label: 'm = 0: flat — shifting φ costs nothing', labelAt: -1.9, labelDy: -10 }, { fn: '0.5*x^2', color: 'accent', width: 2.2, label: '½m²φ²', labelAt: 1.6, labelDx: -40, labelDy: -6 }] }, caption: t`The potential felt by the field’s value: flat without a mass term, a bowl with one.` },
      choices: [
        t`$j^\mu = \partial^\mu\phi$, with $\partial_\mu j^\mu = \Box\phi = 0$; a mass term breaks the shift symmetry, and indeed $\partial_\mu j^\mu = m^2\phi \ne 0$`,
        t`The energy, which a mass term also destroys`,
        t`$j^\mu = \phi\,\partial^\mu\phi$, conserved with or without mass`,
        t`No current: Noether’s theorem needs a spacetime symmetry`,
      ],
      answer: 0,
      why: {
        1: t`Energy comes from time-translation symmetry, which the mass term keeps.`,
        2: t`Compute $\partial_\mu(\phi\,\partial^\mu\phi) = \partial_\mu\phi\,\partial^\mu\phi + \phi\Box\phi$: not zero in general.`,
        3: t`Noether’s theorem applies to internal symmetries too — charge conservation comes from a phase rotation of a complex field.`,
      },
      hints: [t`Under $\delta\phi = c$, the Noether current is $\dfrac{\partial\mathcal L}{\partial(\partial_\mu\phi)}\,\delta\phi \propto \partial^\mu\phi$.`, t`Take its divergence and use the field equation, with and without mass.`],
      teach: 'Every continuous symmetry of the action gives a conserved current; a term that breaks the symmetry shows up as the current’s divergence.',
      explain: t`$\partial_\mu\partial^\mu\phi = \Box\phi = m^2\phi$: zero only for $m = 0$. Spacetime translations give the conserved stress–energy tensor $T^{\mu\nu}$ — which in general relativity is instead defined by varying the action with respect to the metric.`,
    }),
    mcq({
      id: 'minimal-coupling', difficulty: 2,
      prompt: t`Which is the Klein–Gordon action in a curved spacetime with metric $g_{\mu\nu}$?`,
      visual: { type: 'ten-metric', params: { mode: 'chart', chart: 'sphere', readout: false }, caption: t`A curved chart’s unit ellipses: the metric changes from place to place, so $\eta^{\mu\nu}$ must become $g^{\mu\nu}(x)$ and the volume element must weigh each coordinate cell by its true size.` },
      choices: [
        t`$S = \displaystyle\int\Bigl(-\tfrac12g^{\mu\nu}\partial_\mu\phi\,\partial_\nu\phi - \tfrac12m^2\phi^2\Bigr)\sqrt{-g}\,d^4x$`,
        t`$S = \displaystyle\int\Bigl(-\tfrac12\eta^{\mu\nu}\partial_\mu\phi\,\partial_\nu\phi - \tfrac12m^2\phi^2\Bigr)\sqrt{-g}\,d^4x$`,
        t`$S = \displaystyle\int\Bigl(-\tfrac12g^{\mu\nu}\partial_\mu\phi\,\partial_\nu\phi - \tfrac12m^2\phi^2\Bigr)d^4x$`,
        t`$S = \displaystyle\int\Bigl(-\tfrac12g^{\mu\nu}\nabla_\mu\nabla_\nu\phi - \tfrac12m^2\phi^2\Bigr)\sqrt{-g}\,d^4x$`,
      ],
      answer: 0,
      why: {
        1: t`$\eta^{\mu\nu}$ is the flat metric; in curved spacetime the contraction must use $g^{\mu\nu}$, or the result is not a scalar.`,
        2: t`Without $\sqrt{-g}$, $d^4x$ is not an invariant volume: the action would depend on the coordinates.`,
        3: t`One derivative per factor, squared, as in flat space; a second derivative term would be a total derivative here and give no dynamics.`,
      },
      hints: [t`Two replacements: $\eta \to g$ in contractions, and $d^4x \to \sqrt{-g}\,d^4x$.`],
      teach: 'Minimal coupling: replace η by g and d⁴x by √−g d⁴x (and ∂ by ∇ where it matters): the same scalar action, now on curved spacetime.',
      explain: t`For a scalar, $\nabla_\mu\phi = \partial_\mu\phi$, so partial derivatives suffice. The metric now appears in the matter action, so varying it with respect to $g^{\mu\nu}$ is possible — and that variation is the stress–energy tensor, the source in Einstein’s equations.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-graviton-range', difficulty: 2, transfer: true,
      gen(r) {
        const e = r.pick([22, 23]), mant = r.pick([1, 2, 5]);
        const mg = mant * 10 ** -e, ans = HBARC_EV_M / mg / LY;
        return {
          prompt: t`If the graviton had a mass $m_g$, Newton’s $1/r$ would become a Yukawa law with range $\lambda = \hbar/(m_gc)$. For $m_gc^2 = ${tex(mg)}\ \text{eV}$, what is $\lambda$ in light-years? Use $\hbar c = ${tex(HBARC_EV_M, 4)}\ \text{eV m}$ and $1\ \text{ly} = 9.461\times10^{15}\ \text{m}$.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'r / λ', ylabel: 'gravitational pull (relative)', curves: [{ fn: '1/x^2', domain: [0.6, 4], color: 'ink3', width: 1.6, dash: true, label: 'Newton', labelAt: 1.2, labelDy: -10 }, { fn: 'e^(-x)*(1 + x)/x^2', domain: [0.6, 4], color: 'accent', width: 2.2, label: 'Yukawa', labelAt: 2, labelDy: 10 }] }, caption: t`The force from a Yukawa potential, $e^{-r/\lambda}(1 + r/\lambda)/r^2$, against Newton’s $1/r^2$, in units of the range.` },
          answer: ans, units: 'ly', tol: { rel: 0.005 },
          errors: [{ value: (2 * Math.PI * HBARC_EV_M) / mg / LY, feedback: t`That is the Compton wavelength $h/(m_gc)$, $2\pi$ times the Yukawa range.` }, { value: HBARC_EV_M / mg, feedback: 'That is in metres; convert to light-years.' }],
          hints: [t`$\lambda = \hbar c/(m_gc^2)$ in metres.`, t`$${tex(HBARC_EV_M, 4)}/${tex(mg)}$ m, then divide by $9.461\times10^{15}$.`],
          teach: t`A massive graviton would cut gravity off beyond $\hbar/(m_gc)$; orbits, lensing and gravitational-wave propagation all bound how small that mass must be.`,
          explain: t`$\lambda = ${tex(ans, 3)}$ light-years. Planetary orbits and gravitational-wave dispersion bound the graviton mass far below the scale where everyday gravity would notice; general relativity’s graviton is massless — the counting in [lesson G6.4](#/lesson/st-g.G6.4) shows what a mass would add.`,
        };
      },
    }),
    num({
      id: 'cp-gw-dispersion', difficulty: 3,
      gen(r) {
        const f = r.pick([30, 100, 250]), mg = r.pick([1e-22, 1e-23]);
        const x = mg / (H_EV_S * f), ans = (x * x) / 2;
        return {
          prompt: t`Waves of a massive field travel at $v_g/c = \sqrt{1 - (mc^2/E)^2}$, where $E = hf$ is the quantum’s energy. For a hypothetical graviton mass $m_gc^2 = ${tex(mg)}\ \text{eV}$ and a gravitational wave at $f = ${f}\ \text{Hz}$ ($h = ${tex(H_EV_S, 4)}\ \text{eV s}$), what is $1 - v_g/c$? (For a tiny ratio $x$, $1 - \sqrt{1 - x^2} \approx x^2/2$.)`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 3.6], aspect: 'wide', axesAt: 'edge', xlabel: 'k', ylabel: 'ω', curves: [{ fn: 'sqrt(x^2 + 0.25)', color: 'accent', width: 2.2, label: 'massive', labelAt: 2.2, labelDx: -30, labelDy: -12 }, { fn: 'x', color: 'ink3', width: 1.4, dash: true, label: 'massless', labelAt: 2.8, labelDx: -40, labelDy: 14 }] }, caption: t`Dispersion with a mass (exaggerated enormously): low frequencies would lag, so a chirp’s early, low-frequency part would arrive late relative to its end.` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: x * x, feedback: t`$1 - \sqrt{1 - x^2} \approx x^2/2$: you dropped the $\tfrac12$.` }, { value: x, feedback: t`That is the ratio $x = m_gc^2/hf$ itself; the speed deficit goes as its square.` }],
          hints: [t`$x = m_gc^2/(hf) = ${tex(mg)}/(${tex(H_EV_S, 4)}\times${f})$.`, t`$1 - v_g/c \approx x^2/2$.`],
          teach: 'A graviton mass would make gravitational waves dispersive, with low frequencies slower by about (mc²/hf)²/2 — a deficit that accumulates over cosmological distances.',
          explain: t`$x = ${tex(x, 3)}$, so $1 - v_g/c \approx ${tex(ans, 3)}$. Tiny, but over a billion light-years even $10^{-20}$ adds up to a measurable distortion of the chirp; LIGO–Virgo analyses search for it and find none, bounding $m_g$.`,
        };
      },
    }),
    mcq({
      id: 'cp-gauge', difficulty: 3,
      prompt: t`Under $A_\mu \to A_\mu + \partial_\mu\lambda$, $F_{\mu\nu}$ does not change. Why does Maxwell’s action contain no photon mass term $-\tfrac12m^2A_\mu A^\mu$?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 3.6], aspect: 'wide', axesAt: 'edge', xlabel: 'k', ylabel: 'ω', curves: [{ fn: 'x', color: 'accent', width: 2.2, label: 'photon: ω = k', labelAt: 2.4, labelDx: -50, labelDy: -12 }, { fn: 'sqrt(x^2 + 1)', color: 'ink3', width: 1.6, dash: true, label: 'if it had mass', labelAt: 1, labelDx: 6, labelDy: -10 }] }, caption: t`Measured light shows no gap: photon-mass bounds from the Solar wind’s magnetic field are below $10^{-18}\ \text{eV}$.` },
      choices: [
        t`It is not gauge invariant: $A_\mu A^\mu$ changes under $A \to A + \partial\lambda$, and keeping the symmetry (with its constraint) is what leaves the photon two polarizations`,
        t`It would be gauge invariant but is forbidden by Lorentz invariance`,
        t`Because $A_\mu A^\mu$ is always zero`,
        t`Because the photon is a scalar field`,
      ],
      answer: 0,
      why: {
        1: t`$A_\mu A^\mu$ is a perfectly good Lorentz scalar; the problem is gauge symmetry, not Lorentz symmetry.`,
        2: t`$A_\mu A^\mu = -A_0^2 + |\mathbf A|^2$ need not vanish.`,
        3: t`The photon field $A_\mu$ is a four-vector.`,
      },
      hints: [t`Compute $(A + \partial\lambda)_\mu(A + \partial\lambda)^\mu$.`, 'Which term survives the gauge transformation, and which does not?'],
      teach: 'Gauge symmetry forbids a mass term for the photon; a massive vector (Proca) field keeps three polarizations instead of two.',
      explain: t`$A_\mu A^\mu \to A_\mu A^\mu + 2A^\mu\partial_\mu\lambda + \partial_\mu\lambda\,\partial^\mu\lambda$. Gauge symmetry removes two of $A_\mu$’s four components: $4 - 2 = 2$ polarizations. A mass term breaks it and a third, longitudinal one appears — the counting of [lesson G6.4](#/lesson/st-g.G6.4). The graviton’s masslessness is protected the same way, by diffeomorphism invariance.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley, 2004), §1.10 (classical field theory) and §4.3', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Goldstein, Poole & Safko, Classical Mechanics, 3rd ed., ch. 13 (continuous systems and fields)', url: 'https://openlibrary.org/isbn/9780201657029' },
    { label: 'Particle Data Group, Review of Particle Physics (2024): π, K and ρ masses; photon and graviton mass limits', url: 'https://pdg.lbl.gov/' },
    { label: 'Will, Bounding the mass of the graviton using gravitational-wave observations of inspiralling compact binaries, PRD 57, 2061 (1998)', url: 'https://arxiv.org/abs/gr-qc/9709011' },
  ],
});
