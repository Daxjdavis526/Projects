// Charge conservation and continuity (Griffiths §8.1.1, with §7.3.1 and
// §9.4.1's relaxation time): the continuity equation ∂ρ/∂t + ∇·J = 0 as
// LOCAL conservation (global conservation is not enough once simultaneity is
// relative); its integral form dQ/dt = −∮J·da; that Maxwell's equations
// contain it (divergence of Ampère–Maxwell plus Gauss); the steady case
// ∇·J = 0 (Kirchhoff's junction rule, a beam whose density falls as it
// speeds up); free charge inside an ohmic conductor dying away as
// e^(−σt/ε) everywhere at once, ending up on the surface — with an honest
// note that for good metals the formula's 10⁻¹⁹ s is shorter than the
// collision time, so it fails there. The density–flux–source template that
// energy (M2.2) and momentum (M2.3) will follow. Transfer: the ion density in
// a gridded ion thruster's beam. Uses c3-flux.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, QE, PI, SIGMA, sf, bare, tag } from './_em4.js';
import { AMU } from '../phys3600/_mag.js';

const t = String.raw;
const M_XE = 131.293;   // xenon's standard atomic weight, u

// the worked example: distilled water (σ ≈ 5.5 μS/m, ε_r ≈ 80) and seawater
const EX = { sigW: 5.5e-6, sigS: SIGMA.seawater.sigma, er: 80 };
EX.tauW = (EX.er * EPS0) / EX.sigW;
EX.tauS = (EX.er * EPS0) / EX.sigS;
EX.tauCu = EPS0 / SIGMA.copper.sigma;

/** A closed sphere in a radial current field on c3-flux, as a still picture. */
const sphere = (caption, extra = {}) => ({ type: 'c3-flux', params: { F: ['x', 'y', 'z'], surfaces: [{ label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'], volume: { kind: 'ball', c: [0, 0, 0], r: 1 } }], readouts: [], normals: false, ...extra }, caption });

/** ρ(t)/ρ₀ = e^(−t/τ) against t/τ. */
const decayPic = (caption) => ({ type: 'graph', params: { x: [0, 5], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'time / τ', ylabel: 'ρ / ρ₀', curves: [{ fn: 'exp(-x)', color: 'accent', width: 2.6 }], hlines: [{ y: 0.3679, color: 'ink3' }], points: [{ x: 1, y: 0.3679, r: 4, color: 'gold', label: '1/e at t = τ' }] }, caption });

/** An ion beam leaving a thruster's grids. */
const beamPic = (caption) => ({
  type: 'graph',
  params: bare([-3, 3], [-1.4, 1.4], {
    shade: [{ fn: '0.75 + 0.08*(x + 2.2)', lower: '-0.75 - 0.08*(x + 2.2)', from: -2.2, to: 2.9, color: 'violet', alpha: 0.22 }, { fn: '1.1', lower: '-1.1', from: -2.6, to: -2.35, color: 'ink3', alpha: 0.9 }],
    arrows: [-0.5, 0, 0.5].map((y) => ({ from: [-1.6, y], to: [0.2, y], color: 'violet', width: 2 })),
    points: [tag(-2.48, 1.25, 'grids', 'ink2', { labelAlign: 'center', labelDx: 0, labelDy: 0 }), tag(0.6, 0.95, 'Xe⁺ beam, J = ρv', 'violet')],
  }),
  caption,
});

export default lesson({
  id: 'phys4600.M2.1',
  title: 'Charge conservation and continuity',
  minutes: 13, difficulty: 2,
  equation: t`\frac{\partial\rho}{\partial t} + \nabla\cdot\vec J = 0`,
  intro: t`The total charge of the universe is constant — but that **global** statement is too weak. Charge vanishing in one place while the same amount appeared at the same instant a light-year away would keep the total fixed, yet “the same instant” means different things to different observers. What nature obeys is **local** conservation: charge leaves a region only by flowing out through its surface. For any volume, $dQ/dt = -\oint\vec J\cdot d\vec a$, and with the divergence theorem that becomes the **continuity equation** for each point. Maxwell’s equations contain it: the divergence of the Ampère–Maxwell law, with Gauss’s law, gives it in one line — that was the point of Maxwell’s term. The form density + divergence of flux = source is the template for everything in this module: energy next, then momentum.`,
  symbols: [
    { tex: '\\rho', text: t`charge density, in $\text{C/m}^3$` },
    { tex: '\\vec J', text: t`current density, in $\text{A/m}^2$: the flux of charge, charge per second per unit area` },
    { tex: '\\partial\\rho/\\partial t', text: 'how fast the charge density at a fixed point changes, in C/(m³ s)' },
    { tex: '\\nabla\\cdot\\vec J', text: 'the net outflow of current per unit volume at a point, in A/m³' },
  ],
  why: t`Every conservation law in physics — energy in Poynting’s theorem, momentum in the stress tensor, probability in quantum mechanics, energy–momentum in general relativity’s $\nabla_\mu T^{\mu\nu} = 0$ — is written in exactly this form.`,
  visual: {
    type: 'c3-flux',
    title: 'Current leaving a sphere',
    lead: t`A current density $\vec J = a(x, y, z)$ — charge streaming radially outward, faster the farther out, like an expanding cloud. The sphere is tinted by $\vec J\cdot\hat n$; the readouts give the outflow $\oint\vec J\cdot d\vec a$ and the integral of $\nabla\cdot\vec J$ over the ball. By continuity, the charge inside falls at exactly that rate.`,
    tasks: [
      t`The two readouts agree: the divergence theorem. With $\nabla\cdot\vec J = 3a$ everywhere, the charge density falls at the rate $3a$ at every point inside.`,
      t`Make $a$ negative: current flows in, the tint turns red, and the charge inside grows.`,
      t`Double the sphere’s radius: the outflow grows eightfold, as the volume does — the loss is spread through the ball, not concentrated at its surface.`,
    ],
    params: {
      F: ['a*x', 'a*y', 'a*z'], divF: '3*a',
      surfaces: [{ label: 'Sphere', x: 'R*sin(u)*cos(v)', y: 'R*sin(u)*sin(v)', z: 'R*cos(u)', u: [0, 'pi'], v: [0, '2*pi'], volume: { kind: 'ball', c: [0, 0, 0], r: 'R' } }],
      sliders: [
        { key: 'a', label: 'Outflow rate $a$', min: -1, max: 1, step: 0.1, value: 0.5, unit: '\\mathrm{A/m^3}', explain: t`$\vec J = a\vec r$: positive streams outward.` },
        { key: 'R', label: 'Sphere radius $R$', min: 0.5, max: 1.5, step: 0.1, value: 1, unit: '\\mathrm{m}', explain: 'The surface the outflow is counted through.' },
      ],
      readouts: ['flux', 'volume'], normals: false, range: 2,
    },
    caption: t`A made-up current density chosen so that its divergence is uniform; the integrals are computed numerically. Arrows show the field on the surface, scaled for visibility.`,
  },
  example: {
    prompt: t`A blob of free charge is put inside a block of material with conductivity $\sigma$ and permittivity $\varepsilon$. How fast does it disappear from the inside? Compare distilled water ($\sigma \approx ${tex(EX.sigW, 2)}$ S/m), seawater ($\sigma \approx ${EX.sigS}$ S/m), both with $\varepsilon \approx ${EX.er}\varepsilon_0$, and copper.`,
    visual: decayPic(t`The free charge density at any point inside, falling exponentially with time constant $\tau = \varepsilon/\sigma$.`),
    steps: [
      { label: 'Three laws', text: t`Ohm: $\vec J = \sigma\vec E$. Gauss, in a linear medium: $\nabla\cdot\vec E = \rho/\varepsilon$. Continuity: $\partial\rho/\partial t = -\nabla\cdot\vec J$.` },
      { label: 'Combine', text: t`$\dfrac{\partial\rho}{\partial t} = -\sigma\nabla\cdot\vec E = -\dfrac{\sigma}{\varepsilon}\rho$, so $\rho(\vec r, t) = \rho(\vec r, 0)\,e^{-t/\tau}$ with $\tau = \varepsilon/\sigma$ — at every point at once, whatever the blob’s shape.` },
      { label: 'Water', text: t`Distilled water: $\tau \approx ${nice(sf(EX.tauW * 1e6, 3))}$ μs. Seawater: $\tau \approx ${nice(sf(EX.tauS * 1e12, 3))}$ ps.` },
      { label: 'Copper', text: t`The formula gives $\varepsilon_0/\sigma \approx ${tex(EX.tauCu, 2)}$ s — shorter than the time between an electron’s collisions (about $10^{-14}$ s), so Ohm’s law, which assumes many collisions, does not hold there. Real metals neutralize internal charge in roughly a collision time, by plasma oscillations. Either way: fast.` },
      { label: 'Where it goes', text: t`The charge is conserved: it flows out to the surface, where it settles. A conductor in equilibrium carries its charge on its surface — now as a consequence of continuity, with a time scale attached.` },
    ],
    answer: t`$\rho$ falls as $e^{-\sigma t/\varepsilon}$: $\tau \approx ${nice(sf(EX.tauW * 1e6, 3))}$ μs for distilled water and $${nice(sf(EX.tauS * 1e12, 3))}$ ps for seawater; for copper far faster than the formula can be trusted.`,
  },
  practice: [
    num({
      id: 'dqdt', difficulty: 1,
      gen(r) {
        const R = r.pick([0.5, 1, 2]), J = r.pick([2, 5, 10]);
        const rate = -4 * PI * R * R * J;
        return {
          prompt: t`Current flows straight out through the whole surface of a sphere of radius ${R} cm, with $J = ${J}\ \text{A/m}^2$ everywhere on it. At what rate does the charge inside change? (Negative if it falls.)`,
          visual: sphere(t`Current leaving a sphere through every patch (blue: outward). Arrows not to scale.`),
          answer: rate * 1e-4 * 1e3, units: 'mA', tol: { rel: 0.01 },
          errors: [{ value: -rate * 1e-4 * 1e3, feedback: t`Outflow **lowers** the charge inside: $dQ/dt = -\oint\vec J\cdot d\vec a$.` }],
          hints: [t`$\dfrac{dQ}{dt} = -\oint\vec J\cdot d\vec a$.`, t`The flux is $J$ times the area $4\pi R^2$, with $R$ in metres.`],
          teach: 'Charge inside a closed surface changes only by what flows through it: dQ/dt = −∮J·da.',
          explain: t`$\oint\vec J\cdot d\vec a = J\cdot4\pi R^2 = ${nice(sf(-rate * 1e-4 * 1e3, 3))}$ mA, so $dQ/dt \approx ${nice(sf(rate * 1e-4 * 1e3, 3))}$ mC/s: the charge inside falls by that much each second.`,
        };
      },
    }),
    expr({
      id: 'drho', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), b = r.int(1, 5), c = r.intExcept(-3, 3, [0]);
        const cz = `${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}z^2`, dz = `${c < 0 ? '-' : '+'} ${2 * Math.abs(c)}z`;
        return {
          prompt: t`In some region the current density is $\vec J = ${a}x^2\,\hat x + ${b}y\,\hat y ${cz}\,\hat z$ (SI units). Find $\partial\rho/\partial t$.`,
          visual: { type: 'c3-flux', params: { F: [`${a}*x^2`, `${b}*y`, `${c}*z^2`], surfaces: [{ label: 'Sphere', x: '0.8*sin(u)*cos(v)', y: '0.8*sin(u)*sin(v)', z: '0.8*cos(u)', u: [0, 'pi'], v: [0, '2*pi'] }], readouts: [], normals: false }, caption: t`The current density on a small sphere, tinted by its outward flux. Arrows scaled for visibility.` },
          answer: `-(${2 * a}x + ${b} ${dz})`,
          answerTeX: t`-(${2 * a}x + ${b} ${dz})`,
          lhs: '\\partial\\rho/\\partial t',
          vars: { x: [-2, 2], y: [-2, 2], z: [-2, 2] },
          errors: [{ answer: `${2 * a}x + ${b} ${dz}`, feedback: t`Continuity has a minus sign: $\partial\rho/\partial t = -\nabla\cdot\vec J$. Where current spreads out, charge drains away.` }],
          hints: [t`$\dfrac{\partial\rho}{\partial t} = -\nabla\cdot\vec J = -\left(\dfrac{\partial J_x}{\partial x} + \dfrac{\partial J_y}{\partial y} + \dfrac{\partial J_z}{\partial z}\right)$.`, t`$\partial(${a}x^2)/\partial x = ${2 * a}x$, and so on.`],
          teach: 'Point by point, the charge density falls at the rate current diverges: ∂ρ/∂t = −∇·J.',
          explain: t`$\nabla\cdot\vec J = ${2 * a}x + ${b} ${dz}$, so $\partial\rho/\partial t = -(${2 * a}x + ${b} ${dz})$. Where the divergence is positive, charge is draining; where it is negative, piling up.`,
        };
      },
    }),
    num({
      id: 'relax', difficulty: 2,
      gen(r) {
        const [mat, sig, er] = r.pick([['tap water', 0.05, 80], ['wet soil', 0.01, 20], ['fused quartz', 1.3e-18, 3.8], ['silicon (intrinsic)', 4.3e-4, 11.7]]);
        const tau = (er * EPS0) / sig;
        const [u, f] = tau > 1e3 ? ['yr', 3.156e7] : tau > 1e-3 ? ['s', 1] : tau > 1e-6 ? ['μs', 1e-6] : tau > 1e-9 ? ['ns', 1e-9] : ['ps', 1e-12];
        return {
          prompt: t`What is the charge relaxation time $\tau = \varepsilon/\sigma$ of ${mat} ($\sigma \approx ${tex(sig, 2)}$ S/m, $\varepsilon_r \approx ${er}$)?`,
          visual: decayPic(t`Free charge inside a conductor dies away as $e^{-t/\tau}$.`),
          answer: tau / f, units: u, tol: { rel: 0.01 },
          errors: [{ value: EPS0 / sig / f, feedback: t`Include the permittivity of the material: $\varepsilon = \varepsilon_r\varepsilon_0$.` }],
          hints: [t`$\tau = \varepsilon_r\varepsilon_0/\sigma$.`, t`$\varepsilon_0 = 8.854\times10^{-12}$ F/m; F/m divided by S/m is seconds.`],
          teach: 'Free charge inside an ohmic material dies away with τ = ε/σ: picoseconds in salt water, days or years in a good insulator.',
          explain: t`$\tau = \dfrac{${er}\times${tex(EPS0, 4)}}{${tex(sig, 2)}} \approx ${tex(tau / f, 3)}$ ${u}. ${tau > 1e3 ? 'Charge put inside an excellent insulator stays put — which is why insulators can be charged by rubbing, and why charge buried in a spacecraft’s dielectrics by energetic electrons can build up until it discharges.' : 'Short: such a material behaves as a conductor for anything slower.'}`,
        };
      },
    }),
    mcq({
      id: 'built-in', difficulty: 2,
      prompt: t`Is charge conservation an extra assumption that must be added to Maxwell’s equations?`,
      visual: { type: 'em-gap', params: { at: 'wire', surface: 'bag', r: 3, controls: false, readout: false, t: 3 }, caption: t`A charging capacitor: charge piles up on the plate exactly as fast as the current brings it. Fringing ignored.` },
      choices: [
        t`No: the divergence of the Ampère–Maxwell law, with Gauss’s law, gives $\partial\rho/\partial t + \nabla\cdot\vec J = 0$`,
        'Yes: Maxwell’s equations say nothing about how charge moves',
        t`No: it follows from Faraday’s law`,
        t`Yes, because Maxwell’s equations allow $\nabla\cdot\vec J \ne 0$`,
      ],
      answer: 0,
      why: {
        1: t`They constrain it: $\nabla\cdot(\nabla\times\vec B) = 0$ forces $\nabla\cdot(\mu_0\vec J + \mu_0\varepsilon_0\partial\vec E/\partial t) = 0$.`,
        2: t`Faraday’s law involves no charge or current; the divergence of its curl gives $\partial(\nabla\cdot\vec B)/\partial t = 0$.`,
        3: t`They allow $\nabla\cdot\vec J \ne 0$ only where $\partial\rho/\partial t$ balances it — which **is** charge conservation.`,
      },
      hints: [t`Take the divergence of $\nabla\times\vec B = \mu_0\vec J + \mu_0\varepsilon_0\partial\vec E/\partial t$.`, t`Then use $\varepsilon_0\nabla\cdot\vec E = \rho$.`],
      teach: 'Maxwell’s equations contain charge conservation: you cannot feed them sources that violate it.',
      explain: t`$0 = \nabla\cdot(\nabla\times\vec B) = \mu_0\nabla\cdot\vec J + \mu_0\varepsilon_0\dfrac{\partial}{\partial t}\nabla\cdot\vec E = \mu_0\left(\nabla\cdot\vec J + \dfrac{\partial\rho}{\partial t}\right)$. Any $\rho$ and $\vec J$ you put into Maxwell’s equations must conserve charge locally, or there is no solution.`,
    }),
    mcq({
      id: 'local', difficulty: 2,
      prompt: t`Why is **local** conservation (the continuity equation) required, rather than just a constant total charge?`,
      visual: { type: 'spacetime', params: { beta: 0.5, events: [[0, -2], [0, 2]], names: ['P', 'Q'] }, caption: t`Two events simultaneous in one frame (horizontal line) are not simultaneous in a moving frame (tilted axes).` },
      choices: [
        'Because “at the same instant” depends on the observer: charge vanishing at P while it appears at Q would, in another frame, leave the total changed for a while',
        'Because charge is quantized',
        'Because the total charge of the universe is zero',
        'It is not required; global conservation is all experiments test',
      ],
      answer: 0,
      why: {
        1: 'Quantization (charge comes in multiples of e) is a separate fact; it does not say where charge can go.',
        2: 'Whether or not the total is zero, it could stay constant while charge jumped from place to place.',
        3: 'Experiments see charge move only by flowing; and relativity makes the jump impossible to describe consistently.',
      },
      hints: ['Picture charge disappearing at P and reappearing at Q at the same moment.', 'Would every observer agree that the two happen at the same moment?'],
      teach: 'Relativity turns conservation into local conservation: what leaves a region must flow through its boundary.',
      explain: t`If charge vanished at P and appeared at Q simultaneously in one frame, a moving observer would see the two events at different times — and the total charge would be wrong in between. Only flow through surfaces keeps the books in every frame. In four-vector language (M6), $\partial_\mu J^\mu = 0$.`,
    }),
    mcq({
      id: 'where-charge', difficulty: 3,
      prompt: t`A small blob of free charge is placed at the centre of a large ohmic block, and the surrounding material is initially neutral. Using $\rho(\vec r, t) = \rho(\vec r, 0)e^{-t/\tau}$, what is the charge density, part-way out, while the blob decays?`,
      visual: decayPic(t`The charge density at any point decays as $e^{-t/\tau}$.`),
      choices: [
        'Zero throughout: the charge flows out as a current whose divergence vanishes there, and reappears only on the surface',
        'A spreading shell of charge moving outward from the centre',
        'A uniform density that fills the block and then fades',
        'The same as at the centre, delayed by the travel time',
      ],
      answer: 0,
      why: {
        1: t`The solution $\rho(\vec r, 0)e^{-t/\tau}$ keeps zero density zero: no shell ever forms.`,
        2: t`That would need $\rho$ to grow where it was zero, but $\partial\rho/\partial t = -\rho/\tau$ there is zero.`,
        3: 'In the ohmic model the field reaches the surface quasistatically; the result has no travel delay.',
      },
      hints: [t`$\partial\rho/\partial t = -(\sigma/\varepsilon)\rho$ at every point. What does that say where $\rho = 0$?`, t`Between the blob and the surface, the current is radial with $\nabla\cdot\vec J = 0$, like the field of a point charge.`],
      teach: 'Charge leaving the inside of a conductor flows through as a divergence-free current and appears only at the surface.',
      explain: t`Where $\rho = 0$ it stays zero. The blob’s field drives a current $\sigma\vec E$ outward, and outside the blob that current has no divergence — like a point charge’s field — so charge passes through without accumulating, and piles up only where $\sigma$ drops to zero: the surface.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion-beam', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([0.5, 1, 1.76, 3]), V = r.pick([1000, 1100, 1500]), D = r.pick([20, 30, 40]);
        const v = Math.sqrt((2 * QE * V) / (M_XE * AMU)), A = (PI * (D / 100) ** 2) / 4, n = I / (QE * A * v);
        return {
          prompt: t`A gridded ion thruster emits a beam of singly charged xenon ions (${M_XE} u) accelerated through ${V} V. The beam carries ${I} A spread evenly over a circle ${D} cm across. In steady state, what is the number density of ions in the beam just outside the grids?`,
          visual: beamPic(t`Xenon ions leaving the thruster’s grids. In steady state the current through every cross-section is the same. Not to scale.`),
          answer: n, units: 'm^-3', tol: { rel: 0.01 },
          errors: [{ value: (I / (QE * A * Math.sqrt((QE * V) / (M_XE * AMU)))), feedback: t`Kinetic energy is $\tfrac12mv^2 = eV$: $v = \sqrt{2eV/m}$.` }],
          hints: [t`$J = I/A$, and $J = \rho v = nev$.`, t`$v = \sqrt{2eV/m}$ with $m = ${M_XE}\times${tex(AMU, 4)}$ kg.`],
          teach: 'A steady beam obeys ∇·J = 0: J = nqv is fixed, so where the ions are faster they are sparser.',
          explain: t`$v = \sqrt{2eV/m} \approx ${nice(sf(v / 1e3, 3))}$ km/s, $J = I/A \approx ${nice(sf(I / A, 3))}\ \text{A/m}^2$, so $n = J/ev \approx ${nice(sf(n / 1e15, 3))}\times10^{15}\ \text{m}^{-3}$. Inside the grids, where the ions are slower, the density is higher — that space charge is what limits how much current the grids can pull (the Child–Langmuir law). A neutralizer adds electrons at the same rate so the spacecraft does not charge up.`,
        };
      },
    }),
    num({
      id: 'cp-percent', difficulty: 2,
      gen(r) {
        const [mat, sig, er] = r.pick([['seawater', 4.8, 80], ['tap water', 0.05, 80], ['wet soil', 0.01, 20]]), p = r.pick([1, 0.1]);
        const tau = (er * EPS0) / sig, tt = tau * Math.log(100 / p);
        const [u, f] = tt > 1e-6 ? ['μs', 1e-6] : tt > 1e-9 ? ['ns', 1e-9] : ['ps', 1e-12];
        return {
          prompt: t`Free charge is injected inside a block of ${mat} ($\sigma \approx ${sig}$ S/m, $\varepsilon_r \approx ${er}$). How long until only ${p}% of it remains inside?`,
          visual: decayPic(t`The free charge inside falls as $e^{-t/\tau}$.`),
          answer: tt / f, units: u, tol: { rel: 0.01 },
          errors: [{ value: tau / f, feedback: t`That is one time constant, when $1/e$ (37%) remains. Solve $e^{-t/\tau} = ${p / 100}$.` }],
          hints: [t`$\tau = \varepsilon_r\varepsilon_0/\sigma$.`, t`$e^{-t/\tau} = ${p / 100}$ gives $t = \tau\ln(${100 / p})$.`],
          teach: 'Free charge decays exponentially from a conductor’s inside: each time constant τ = ε/σ cuts it by e.',
          explain: t`$\tau \approx ${tex(tau, 3)}$ s and $t = \tau\ln ${100 / p} \approx ${nice(sf(tt / f, 3))}$ ${u}.`,
        };
      },
    }),
    mcq({
      id: 'cp-template', difficulty: 2,
      prompt: t`In the next lesson, energy obeys $\dfrac{\partial u}{\partial t} + \nabla\cdot\vec S = -\vec J\cdot\vec E$. Comparing with the continuity equation for charge, what does the right-hand side mean?`,
      visual: sphere(t`A closed surface with flux leaving it: what is inside changes by what crosses, plus what is made or destroyed inside.`),
      choices: [
        t`Energy is taken out of the fields at the rate $\vec J\cdot\vec E$ per unit volume — handed to the charges — so field energy alone is not conserved`,
        'Energy is not conserved in electromagnetism',
        t`It is the energy flux through the surface`,
        t`It is the rate at which charge is created`,
      ],
      answer: 0,
      why: {
        1: 'Total energy is conserved: the field’s loss is the charges’ gain (heat in a resistor, kinetic energy of a beam).',
        2: t`The flux is $\vec S$, inside the divergence. The right side is a **source** term, acting inside the volume.`,
        3: 'Charge is never created; the right side has units of power per volume.',
      },
      hints: [t`Charge’s equation has zero on the right: nothing creates or destroys charge.`, t`What does the electric field do to a current per unit volume, per second?`],
      teach: 'A continuity equation with a source term: what the field loses (J·E) the charges gain.',
      explain: t`For charge the right side is zero; for field energy it is $-\vec J\cdot\vec E$, the power per unit volume the field delivers to moving charges. Add the charges’ energy and the total is conserved. M2.2 makes this Poynting’s theorem.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.1.3, §7.3.1, §8.1.1 and §9.4.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Goebel and Katz, Fundamentals of Electric Propulsion (JPL, 2008), ch. 5: ion beams and space charge', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
  ],
});
