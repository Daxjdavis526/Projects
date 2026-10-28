// The vector potential (Griffiths §5.4.1): ∇·B = 0 lets B = ∇×A; gauge
// freedom A → A + ∇λ and the Coulomb gauge ∇·A = 0, giving ∇²A = −μ₀J
// (three Poisson equations, solved like V); Stokes's ∮A·dl = Φ; the long
// solenoid's A, which circles like the current and is NOT zero outside,
// where B is — the seed of the Aharonov–Bohm effect (phys4700.M7); the flux
// through a rectangle beside a wire from A alone; the misconception that A
// is parallel to B. Transfer: the magnetic flux an electron interferometer
// needs to shift its fringes.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { pickExpr } from './_toolkit.js';
import { MU0, QE, H, PI, sf, bare } from './_mag.js';

const t = String.raw;
const S2 = '(x^2 + y^2)';
const SOL = [`step(R^2 - ${S2})*(-y/2) + step(${S2} - R^2)*(-y)*R^2/(2*${S2})`, `step(R^2 - ${S2})*(x/2) + step(${S2} - R^2)*x*R^2/(2*${S2})`];
const PHI0 = H / QE;     // h/e, the flux that shifts an electron interference pattern by one fringe

/** A static field2d picture of a vector potential (no probe, no numbers). */
const still = (P, Q, caption, extra = {}) => ({ type: 'field2d', params: { P, Q, x: [-2.5, 2.5], y: [-2.5, 2.5], probe: false, readout: false, density: 15, ...extra }, caption });
/** A solenoid in 3D (calc-vectors3d): a helix of wire and its field along the axis. */
const solenoid3 = (caption, extra = {}) => ({
  type: 'calc-vectors3d',
  params: { range: 2.2, curves: [{ param: ['cos(t)', 'sin(t)', '-1.6 + 3.2*t/(16*pi)'], t: [0, 16 * PI], color: 'warn' }], vectors: [{ from: [0, 0, -1.2], to: [0, 0, 1.4], color: 'teal', label: '\\vec B' }], ...extra },
  caption,
});

export default lesson({
  id: 'phys3600.M6.4',
  title: 'The vector potential',
  minutes: 16, difficulty: 3,
  equation: t`\vec B = \nabla\times\vec A, \qquad \nabla^2\vec A = -\mu_0\vec J \quad (\nabla\cdot\vec A = 0)`,
  intro: t`Because $\nabla\times\vec E = 0$, electrostatics has a scalar potential. Because $\nabla\cdot\vec B = 0$, magnetostatics has a **vector potential**: $\vec B = \nabla\times\vec A$ (the divergence of a curl is always zero, and Helmholtz’s theorem of [M0.5](#/lesson/phys3600.M0.5) guarantees such an $\vec A$ exists). It is not unique: add any gradient, $\vec A \to \vec A + \nabla\lambda$, and $\vec B$ is unchanged — **gauge freedom**. Choosing $\nabla\cdot\vec A = 0$ (the **Coulomb gauge**) turns Ampère’s law into $\nabla^2\vec A = -\mu_0\vec J$: three copies of Poisson’s equation, solved as for $V$, $\vec A = \dfrac{\mu_0}{4\pi}\displaystyle\int\frac{\vec J}{\mathcal R}d\tau'$ — so $\vec A$ tends to run **along** the current. And Stokes gives a quick route to it: $\oint\vec A\cdot d\vec l = \int\vec B\cdot d\vec a = \Phi$, the flux through the loop.`,
  symbols: [
    { tex: '\\vec A', text: t`the vector potential, in T·m (= Wb/m = V·s/m)` },
    { tex: '\\nabla\\times\\vec A', text: 'its curl, which is the magnetic field B, in T' },
    { tex: '\\lambda', text: 'any scalar function (a gauge function), in T·m²; adding ∇λ to A changes nothing physical' },
    { tex: '\\vec J', text: t`the current density, in $\text{A/m}^2$` },
    { tex: '\\Phi = \\oint\\vec A\\cdot d\\vec l', text: t`the magnetic flux through a loop, in webers ($1\ \text{Wb} = 1\ \text{T·m}^2$)` },
  ],
  why: t`In quantum mechanics a charge’s momentum enters as $\vec p - q\vec A$, and electrons passing **outside** a solenoid — where $\vec B = 0$ but $\vec A \ne 0$ — have their interference shifted: the Aharonov–Bohm effect, met again in [QM II](#/lesson/phys4700.M7.1). Gauge freedom is the seed of every gauge theory in physics, gravity’s included.`,
  visual: {
    type: 'field2d',
    title: 'One field, many potentials',
    lead: t`Arrows show $\vec A$ in a plane; the field it makes, $B_z = (\nabla\times\vec A)_z$, points out of the page. Drag the probe: the curl readout is $B$. The gold circle (radius 1.5) compares $\oint\vec A\cdot d\vec l$ with the flux $\iint B\,da$.`,
    tasks: [
      t`The first three are the **same uniform field** $B = 1$ in three gauges. The arrows look nothing alike — swirling, sliding left, sliding up — but the curl reads 1 everywhere and the circulation is $\pi(1.5)^2 \approx 7.07$ in all three.`,
      t`The **solenoid**: inside, $\vec A$ swirls and $B = 1$; outside, the curl reads 0 — no field — yet $\vec A$ still circles, falling as $1/s$. The circulation is $\pi R^2$, the flux trapped inside, however big the loop.`,
      t`In every case the divergence reads 0: these are all Coulomb-gauge potentials. Add a gradient and they would stay correct but lose that property.`,
    ],
    params: {
      P: pickExpr('g', ['-y/2', '-y', '0', SOL[0]]),
      Q: pickExpr('g', ['x/2', '0', 'x', SOL[1]]),
      x: [-2.5, 2.5], y: [-2.5, 2.5], probe: [1.2, 0.6], density: 17,
      loop: { r: 1.5, c: [0, 0] },
      choices: [{ key: 'g', label: t`$\vec A$`, options: [[0, t`Uniform $B$: $\tfrac B2\langle -y, x\rangle$`], [1, t`Uniform $B$: $B\langle -y, 0\rangle$`], [2, t`Uniform $B$: $B\langle 0, x\rangle$`], [3, 'Long solenoid, radius R']], value: 0, explain: 'Three gauges for one uniform field, and the potential of a solenoid seen end-on.' }],
      sliders: [{ key: 'R', label: t`Solenoid radius $R$`, min: 0.3, max: 1.2, step: 0.05, value: 0.8, explain: 'Used by the solenoid only: the field B = 1 fills the inside.' }],
    },
    caption: t`Exact potentials in units where $B = 1$ inside. A plane slice: the solenoid’s axis and the uniform field both point out of the page. The probe’s divergence and curl are computed numerically; arrow lengths are compressed.`,
  },
  example: {
    prompt: t`A long solenoid of radius $R = 2.0$ cm has 2000 turns per metre carrying 3.0 A. Find $\vec A$ inside and outside, its value 5.0 cm from the axis, and how many flux quanta $h/e$ thread the solenoid.`,
    visual: solenoid3(t`The solenoid (orange) and its uniform field inside (teal). Drag to rotate. Outside it, $\vec B = 0$.`),
    steps: [
      { label: 'Field and symmetry', text: t`Inside $B = \mu_0nI = (${tex(MU0, 5)})(2000)(3.0) \approx ${nice(sf(MU0 * 6000 * 1e3, 4))}$ mT, along the axis; outside $B = 0$. $\vec A$ must circle the axis like the current: $\vec A = A(s)\hat\phi$.` },
      { label: 'Stokes inside', text: t`A circle of radius $s < R$: $\oint\vec A\cdot d\vec l = 2\pi sA = \Phi = \pi s^2B$, so $A = \dfrac{\mu_0nI}{2}s$.` },
      { label: 'Stokes outside', text: t`For $s > R$ the loop holds all the flux, $\pi R^2B$: $A = \dfrac{\mu_0nIR^2}{2s}$ — **not zero**, although $B$ is. At 5.0 cm: $A \approx ${nice(sf(((MU0 * 6000 * 0.02 ** 2) / (2 * 0.05)) * 1e6, 3))}\ \mu\text{T·m}$.` },
      { label: 'Check the curl', text: t`$(\nabla\times\vec A)_z = \dfrac1s\dfrac{d}{ds}(sA)$: inside $\dfrac1s\dfrac{d}{ds}\left(\tfrac12\mu_0nIs^2\right) = \mu_0nI$ ✓; outside $sA$ is constant, so 0 ✓. And $\nabla\cdot\vec A = 0$: Coulomb gauge.` },
      { label: 'Flux quanta', text: t`$\Phi = \pi R^2B \approx ${tex(PI * 0.02 ** 2 * MU0 * 6000, 3)}$ Wb. An electron passing one side of the solenoid rather than the other gains a quantum phase $e\Phi/\hbar = 2\pi\Phi/(h/e)$; with $h/e = ${tex(PHI0, 4)}$ Wb that is $${tex((PI * 0.02 ** 2 * MU0 * 6000) / PHI0, 3)}$ whole fringes.` },
    ],
    answer: t`$\vec A = \tfrac12\mu_0nIs\,\hat\phi$ inside, $\dfrac{\mu_0nIR^2}{2s}\hat\phi$ outside: $${nice(sf(((MU0 * 6000 * 0.02 ** 2) / (2 * 0.05)) * 1e6, 3))}\ \mu\text{T·m}$ at 5.0 cm; about $${tex((PI * 0.02 ** 2 * MU0 * 6000) / PHI0, 2)}$ flux quanta.`,
  },
  practice: [
    num({
      id: 'A-outside', difficulty: 2,
      gen(r) {
        const n = r.pick([1000, 2000, 5000]), I = r.pick([1, 2, 5]), R = r.pick([1, 2]), s = r.pick([3, 4, 6]);
        const B = MU0 * n * I, A = (B * (R / 100) ** 2) / (2 * (s / 100));
        return {
          prompt: t`A long solenoid of radius ${R} cm has ${n} turns per metre carrying ${I} A. What is the size of its vector potential ${s} cm from the axis (outside the windings), in the Coulomb gauge?`,
          visual: still(SOL[0].replaceAll('R^2', `${(R / 2.5) ** 2}`), SOL[1].replaceAll('R^2', `${(R / 2.5) ** 2}`), t`The solenoid end-on and its vector potential, which circles the axis inside and out. Lengths compressed.`),
          answer: A * 1e6, units: 'uT m', tol: { rel: 0.01 },
          errors: [
            { value: 0, feedback: t`$\vec B$ is zero outside an ideal solenoid, but $\vec A$ is not: $\oint\vec A\cdot d\vec l$ still equals the flux trapped inside.` },
            { value: ((B * (s / 100)) / 2) * 1e6, feedback: t`$\tfrac12Bs$ holds inside. Outside, the loop encloses only the flux $\pi R^2B$, so $A = BR^2/2s$.` },
          ],
          hints: [t`Stokes: $\oint\vec A\cdot d\vec l = 2\pi sA = \Phi$, the flux through the circle.`, t`Outside, $\Phi = \pi R^2\mu_0nI$, so $A = \dfrac{\mu_0nIR^2}{2s}$.`],
          teach: 'Outside a solenoid B = 0 but A = Φ/(2πs) ≠ 0: the potential remembers the flux it encircles.',
          explain: t`$B = \mu_0nI \approx ${nice(sf(B * 1e3, 3))}$ mT inside, so $A = \dfrac{BR^2}{2s} \approx ${nice(sf(A * 1e6, 3))}\ \mu\text{T·m}$, circling the axis like the current.`,
        };
      },
    }),
    num({
      id: 'flux-from-A', difficulty: 3,
      gen(r) {
        const R = r.pick([1, 1.5, 2]), s = r.pick([4, 5, 8]), A = r.pick([10, 20, 40]);
        const B = (2 * (s / 100) * A * 1e-6) / (R / 100) ** 2;
        return {
          prompt: t`Around a long solenoid of radius ${R} cm, the vector potential at ${s} cm from the axis is measured (in the Coulomb gauge) to be $${A}\ \mu\text{T·m}$, circling the axis. What is the field inside the solenoid?`,
          visual: still(SOL[0].replaceAll('R^2', '0.36'), SOL[1].replaceAll('R^2', '0.36'), t`The circling potential of a solenoid, end-on (not to these dimensions). Lengths compressed.`),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((A * 1e-6) / (s / 100)) * 1e3, feedback: t`$A/s$ treats $A$ as if it were $B$ times a length. Use $2\pi sA = \pi R^2B$.` }, { value: ((2 * A * 1e-6) / (s / 100)) * 1e3, feedback: t`That would be the field if the solenoid filled the whole circle of radius $s$. The flux sits inside radius $R$.` }],
          hints: [t`$\oint\vec A\cdot d\vec l = 2\pi sA$ equals the flux through the circle, which is all inside the solenoid.`, t`$\pi R^2B = 2\pi sA$, so $B = 2sA/R^2$.`],
          teach: 'The circulation of A round any loop is the magnetic flux through it — a way to find B from A without differentiating.',
          explain: t`$B = \dfrac{2sA}{R^2} = \dfrac{2(${s / 100})(${A}\times10^{-6})}{(${R / 100})^2} \approx ${nice(sf(B * 1e3, 3))}$ mT.`,
        };
      },
    }),
    mcq({
      id: 'parallel', difficulty: 2,
      prompt: t`Which way does the vector potential point, near a long solenoid?`,
      visual: solenoid3(t`A long solenoid (orange) with its field along the axis (teal). Drag to rotate.`),
      choices: [t`Round the axis, along $\hat\phi$, like the current in the windings — perpendicular to $\vec B$`, t`Along the axis, parallel to $\vec B$`, t`Radially outward, away from the axis`, t`It has no direction: it is zero outside, where $B = 0$`],
      answer: 0,
      why: {
        1: t`$\vec B = \nabla\times\vec A$: $\vec A$ is to $\vec B$ as a current is to its field. $\vec B$ along the axis needs $\vec A$ circling it, just as the currents do.`,
        2: t`A radial $\vec A(s)\hat s$ is a gradient: its curl is zero, so it makes no field.`,
        3: t`Outside, $\vec A = \dfrac{\Phi}{2\pi s}\hat\phi$ — not zero, though its curl is.`,
      },
      hints: [t`In the Coulomb gauge $\vec A = \dfrac{\mu_0}{4\pi}\displaystyle\int\frac{\vec J}{\mathcal R}d\tau'$: which way does $\vec J$ point in the windings?`],
      teach: 'In the Coulomb gauge A tends to follow the current that makes it, so it is often perpendicular to B, not parallel.',
      explain: t`Each piece of current contributes to $\vec A$ along itself, so $\vec A$ circles like the windings, $\vec A = A(s)\hat\phi$. “$\vec A$ is parallel to $\vec B$” is a documented misconception; here they are at right angles everywhere.`,
    }),
    expr({
      id: 'gauge-fn', difficulty: 3,
      prompt: t`A uniform field $\vec B = B\hat z$ has the potential $\vec A_1 = \tfrac B2\langle -y, x, 0\rangle$ and also $\vec A_2 = \langle -By, 0, 0\rangle$. Find a gauge function $\lambda(x, y)$ with $\vec A_2 = \vec A_1 + \nabla\lambda$.`,
      visual: still('-y', '0', t`The second potential, $\langle -By, 0, 0\rangle$: it slides left above the axis and right below. Same curl as the swirling $\vec A_1$. Lengths compressed.`),
      answer: '-B*x*y/2', answerTeX: t`-\tfrac12Bxy`, lhs: t`\lambda`,
      vars: { x: [-2, 2], y: [-2, 2], B: [0.5, 2] }, mode: 'constant', wrt: '*',
      errors: [{ answer: 'B*x*y/2', feedback: t`Check the sign: $\nabla\lambda = \vec A_2 - \vec A_1 = \langle -\tfrac B2y, -\tfrac B2x\rangle$.` }, { answer: '-B*x*y', feedback: t`$\partial_x(-Bxy) = -By$, twice too much: the difference is $-\tfrac B2y$.` }],
      hints: [t`$\nabla\lambda = \vec A_2 - \vec A_1 = \left\langle -\tfrac B2y,\ -\tfrac B2x,\ 0\right\rangle$.`, t`Which function has $\partial_x\lambda = -\tfrac B2y$ and $\partial_y\lambda = -\tfrac B2x$?`],
      teach: 'Two vector potentials for the same B differ by a gradient; find it as you would a scalar potential.',
      explain: t`$\lambda = -\tfrac12Bxy$ (plus any constant): $\nabla\lambda = \langle -\tfrac B2y, -\tfrac B2x\rangle$ ✓. Both potentials have zero divergence, so here even the Coulomb gauge does not pin $\vec A$ down: $\nabla^2\lambda = 0$ leaves room.`,
    }),
    num({
      id: 'wire-flux', difficulty: 3,
      gen(r) {
        const I = r.pick([10, 20, 50]), L = r.pick([20, 50]), s1 = r.pick([1, 2]), s2 = r.pick([5, 10]);
        const Phi = ((MU0 * I * (L / 100)) / (2 * PI)) * Math.log(s2 / s1);
        return {
          prompt: t`A long straight wire carries ${I} A. In the Coulomb gauge its vector potential runs along the wire, $A_z(s) = -\dfrac{\mu_0I}{2\pi}\ln\dfrac{s}{s_0}$ (any constant $s_0$). Use $\oint\vec A\cdot d\vec l$ to find the flux through a rectangle in the plane of the wire, ${L} cm long, with its near side ${s1} cm and far side ${s2} cm from the wire.`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: [{ param: ['-2.2', 't'], t: [-1.2, 1.2], color: 'warn', width: 4 }, { param: [`${-2.2 + s1 * 0.4}`, 't'], t: [-0.8, 0.8], color: 'violet', width: 2 }, { param: [`${-2.2 + s2 * 0.4}`, 't'], t: [-0.8, 0.8], color: 'violet', width: 2 }, { fn: '0.8', domain: [-2.2 + s1 * 0.4, -2.2 + s2 * 0.4], color: 'violet', width: 2 }, { fn: '-0.8', domain: [-2.2 + s1 * 0.4, -2.2 + s2 * 0.4], color: 'violet', width: 2 }], arrows: [{ from: [-2.2, -0.6], to: [-2.2, 0.4], color: 'warn', width: 3, label: 'I', labelDx: 8 }], points: [{ x: -2.2 + s2 * 0.4, y: 0.8, r: 0, label: `${s1} cm to ${s2} cm out, ${L} cm long`, labelDx: 6, labelDy: -8, color: 'violet' }] }), caption: 'The wire (orange) and the rectangle (violet) in its plane. Only the sides parallel to the wire contribute to ∮A·dl, since A runs along the wire. Not to scale.' },
          answer: Phi * 1e6, units: 'uWb', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I * (L / 100)) / (2 * PI)) * Math.log10(s2 / s1) * 1e6, feedback: 'The logarithm is natural: ln, not log₁₀.' }, { value: ((MU0 * I) / (2 * PI * (((s1 + s2) / 2) / 100))) * ((L / 100) * ((s2 - s1) / 100)) * 1e6, feedback: 'B at the middle times the area assumes B is uniform across the rectangle; it falls as 1/s.' }],
          hints: [t`The two sides parallel to the wire give $\ell A_z(s_1)$ and $-\ell A_z(s_2)$ (they are walked in opposite directions); the short sides are perpendicular to $\vec A$.`, t`$\Phi = \ell\left[A_z(s_1) - A_z(s_2)\right] = \dfrac{\mu_0I\ell}{2\pi}\ln\dfrac{s_2}{s_1}$ — the constant $s_0$ cancels.`],
          teach: 'With A known, the flux through any loop is one line integral, ∮A·dl — no surface integral needed.',
          explain: t`$\Phi = \dfrac{\mu_0I\ell}{2\pi}\ln\dfrac{s_2}{s_1} = \dfrac{(${tex(MU0, 5)})(${I})(${L / 100})}{2\pi}\ln ${nice(s2 / s1)} \approx ${nice(sf(Phi * 1e6, 3))}\ \mu\text{Wb}$, the same as integrating $\mu_0I/2\pi s$ across the rectangle. The arbitrary $s_0$ is a gauge constant and drops out, as anything physical must.`,
        };
      },
    }),
    mcq({
      id: 'coulomb-gauge', difficulty: 3,
      prompt: t`Why can you always choose a vector potential with $\nabla\cdot\vec A = 0$?`,
      visual: still('-y/2', 'x/2', t`A Coulomb-gauge potential for a uniform field: it swirls without spreading out anywhere. Lengths compressed.`),
      choices: [
        t`Given any $\vec A_0$, add $\nabla\lambda$ with $\nabla^2\lambda = -\nabla\cdot\vec A_0$ — a Poisson equation, which always has a solution`,
        t`Because $\nabla\cdot\vec B = 0$ forces $\nabla\cdot\vec A = 0$`,
        t`Because $\vec A$ is only defined up to a constant`,
        t`Because the curl of a divergence is zero`,
      ],
      answer: 0,
      why: {
        1: t`$\nabla\cdot\vec B = 0$ is what lets $\vec A$ exist at all; it says nothing about $\nabla\cdot\vec A$, which $\vec B$ does not fix.`,
        2: t`The freedom is much bigger than a constant: any gradient can be added.`,
        3: t`“The curl of a divergence” is not defined (the divergence is a scalar). The identity used is that the curl of a **gradient** is zero.`,
      },
      hints: [t`Adding $\nabla\lambda$ to $\vec A$ leaves $\vec B$ alone. What does it do to $\nabla\cdot\vec A$?`, t`$\nabla\cdot(\vec A_0 + \nabla\lambda) = \nabla\cdot\vec A_0 + \nabla^2\lambda$.`],
      teach: 'Gauge freedom lets you add any gradient to A; choosing it to solve a Poisson equation sets ∇·A = 0.',
      explain: t`$\nabla\cdot(\vec A_0 + \nabla\lambda) = \nabla\cdot\vec A_0 + \nabla^2\lambda$, which vanishes if $\nabla^2\lambda = -\nabla\cdot\vec A_0$ — the same equation as $\nabla^2V = -\rho/\varepsilon_0$, solved by the same integral. Then $\nabla\times(\nabla\times\vec A) = \nabla(\nabla\cdot\vec A) - \nabla^2\vec A = -\nabla^2\vec A$, and Ampère’s law becomes $\nabla^2\vec A = -\mu_0\vec J$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ab', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([0.5, 1, 2]), [frac, name] = r.pick([[0.5, 'half a fringe'], [0.25, 'a quarter of a fringe'], [1, 'one whole fringe']]);
        const B = (frac * PHI0) / (PI * (R * 1e-6) ** 2);
        return {
          prompt: t`In an electron interferometer, electron waves pass on either side of a tiny shielded solenoid of radius ${R} μm and recombine; they never enter the field. Their interference pattern shifts by one whole fringe for every $h/e = ${tex(PHI0, 4)}$ Wb of flux enclosed between the paths. What field inside the solenoid shifts the pattern by ${name}?`,
          visual: { type: 'graph', params: bare([-2.8, 2.8], [-1.35, 1.35], { shade: [{ fn: 'sqrt(max(0.09 - x^2, 0))', lower: '-sqrt(max(0.09 - x^2, 0))', from: -0.3, to: 0.3, color: 'teal', alpha: 0.5 }], curves: [circle03(), { param: ['-2.6 + 5.2*t', '0.9*sin(pi*t)'], t: [0, 1], color: 'accent', width: 2.2 }, { param: ['-2.6 + 5.2*t', '-0.9*sin(pi*t)'], t: [0, 1], color: 'accent', width: 2.2 }], points: [{ x: -2.6, y: 0, r: 5, color: 'accent', label: 'source', labelDx: -10, labelDy: 18 }, { x: 2.6, y: 0, r: 5, color: 'accent', label: 'screen', labelDx: -30, labelDy: 18 }, { x: 0.35, y: 0.25, r: 0, label: 'B inside only', labelDx: 6, color: 'teal' }] }), caption: t`Two electron paths (blue) round a solenoid seen end-on (teal). Outside it $\vec B = 0$, but $\vec A$ circles it, and the two paths together enclose its flux. Not to scale.` },
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((frac * PHI0) / (2 * PI * (R * 1e-6) ** 2)) * 1e3, feedback: t`The flux is $\pi R^2B$, not $2\pi R^2B$.` }, { value: (((frac * PHI0) / 2) / (PI * (R * 1e-6) ** 2)) * 1e3, feedback: t`For electrons a whole fringe is $h/e$; $h/2e$ is the flux quantum of superconductors, whose carriers are electron pairs.` }],
          hints: [t`Shifting by ${name} needs $\Phi = ${frac === 1 ? '' : frac === 0.5 ? '\\tfrac12' : '\\tfrac14'}\,h/e$.`, t`$\Phi = \pi R^2B$, with $R = ${R}\times10^{-6}$ m.`],
          teach: 'The Aharonov–Bohm phase is eΦ/ħ: electrons that never touch B still feel the flux it encloses, through A.',
          explain: t`$B = \dfrac{${frac === 1 ? '' : frac === 0.5 ? '0.5' : '0.25'}(h/e)}{\pi R^2} \approx ${nice(sf(B * 1e3, 3))}$ mT. Tonomura’s team confirmed the effect in 1986 with a toroidal magnet sealed in a superconductor so that no field could leak: classically nothing acts on the electrons, yet the phase $e\oint\vec A\cdot d\vec l/\hbar$ is measured.`,
        };
      },
    }),
    num({
      id: 'cp-A-inside', difficulty: 2,
      gen(r) {
        const B = r.pick([5, 10, 20]), R = r.pick([2, 3]), s = r.pick([0.5, 1, 1.5]);
        const A = (B * 1e-3 * (s / 100)) / 2;
        return {
          prompt: t`A long solenoid of radius ${R} cm has a uniform field of ${B} mT inside. What is the size of the Coulomb-gauge vector potential ${s} cm from its axis?`,
          visual: solenoid3(t`The solenoid and its field. Drag to rotate.`),
          answer: A * 1e6, units: 'uT m', tol: { rel: 0.01 },
          errors: [{ value: (B * 1e-3 * (s / 100)) * 1e6, feedback: t`$2\pi sA = \pi s^2B$ gives $A = \tfrac12Bs$: keep the ½.` }, { value: ((B * 1e-3 * (R / 100) ** 2) / (2 * (s / 100))) * 1e6, feedback: t`That is the outside formula; ${s} cm is inside the windings.` }],
          hints: [t`A circle of radius $s$ inside encloses flux $\pi s^2B$.`, t`$2\pi sA = \pi s^2B$.`],
          teach: 'Inside a uniform field, A = ½Bs in the symmetric (Coulomb) gauge.',
          explain: t`$A = \tfrac12Bs = \tfrac12(${B}\times10^{-3})(${s / 100}) = ${nice(sf(A * 1e6, 3))}\ \mu\text{T·m}$, circling the axis.`,
        };
      },
    }),
    multi({
      id: 'cp-gauges', difficulty: 3,
      prompt: t`Which of these vector potentials give the same uniform field $\vec B = B\hat z$ as $\vec A = \tfrac B2\langle -y, x, 0\rangle$?`,
      visual: still('-y/2', 'x/2', t`The symmetric potential $\tfrac B2\langle -y, x\rangle$. Lengths compressed.`),
      choices: [t`$B\langle -y, 0, 0\rangle$`, t`$B\langle 0, x, 0\rangle$`, t`$\tfrac B2\langle -y, x, 0\rangle + \langle 3, 0, 5\rangle$`, t`$\tfrac B2\langle y, -x, 0\rangle$`, t`$B\langle -y, x, 0\rangle$`],
      answer: [0, 1, 2],
      why: {
        3: t`Its curl is $-B\hat z$: the field reversed.`,
        4: t`Its curl is $2B\hat z$: twice the field.`,
      },
      hints: [t`Compute $(\nabla\times\vec A)_z = \partial_xA_y - \partial_yA_x$ for each.`, t`Equivalently: does each differ from $\tfrac B2\langle -y, x, 0\rangle$ by a gradient?`],
      teach: 'Any two potentials whose difference is a gradient (including a constant) give the same B.',
      explain: t`$\partial_xA_y - \partial_yA_x$ is $B$ for the first three: they differ from the symmetric potential by $\nabla(-\tfrac12Bxy)$, $\nabla(\tfrac12Bxy)$ and a constant vector $\nabla(3x + 5z)$. The last two give $-B$ and $2B$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.4.1 and Example 5.12', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Tonomura et al., Evidence for Aharonov–Bohm effect with magnetic field completely shielded from electron wave, Phys. Rev. Lett. 56, 792 (1986)', url: 'https://doi.org/10.1103/PhysRevLett.56.792' },
  ],
});

function circle03() { return { param: ['0.3*cos(t)', '0.3*sin(t)'], t: [0, 2 * PI], color: 'teal', width: 2 }; }
