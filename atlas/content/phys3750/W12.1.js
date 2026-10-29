// Maxwell's equations in vacuum: the four laws without charges or currents,
// and how two of them — Faraday's and Ampère–Maxwell's — feed each other.
// Take the curl of one, use the identity of W11.1 and ∇·E = 0, and both
// fields obey the wave equation with c = 1/√(μ₀ε₀). Maxwell's displacement
// current is what makes the waves possible. Then W9.2's conservation law for
// the field: Poynting's theorem, energy flowing into a resistor from the
// space around it. Contexts: coaxial cable, a cable-fault reflectometer, a
// charging capacitor, a heating element.
import { lesson, mcq, num, multi, order } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const MU0 = 1.25663706127e-6, EPS0 = 8.8541878188e-12, C = 299792458;

// the worked example: c from the two constants, as Maxwell did
const EX = (() => ({ c: 1 / Math.sqrt(MU0 * EPS0), ratio: MU0 / (4 * Math.PI * 1e-7) }))();

/** A resistive wire with E along it and the Poynting vector pointing in from the sides (schematic). */
function wirePic(caption) {
  const sArrows = [-1.6, -0.4, 0.8].flatMap((x) => [{ from: [x, 1.25], to: [x, 0.42], color: 'accent', width: 2 }, { from: [x, -1.25], to: [x, -0.42], color: 'accent', width: 2 }]);
  return {
    type: 'graph',
    params: {
      x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      shade: [{ fn: '0.3', lower: '-0.3', from: -2.6, to: 2.6, color: 'warn', alpha: 0.35 }],
      arrows: [{ from: [-2.4, 0], to: [-1.1, 0], color: 'gold', width: 2.4, label: 'E', labelDx: 4 }, { from: [1.1, 0], to: [2.4, 0], color: 'gold', width: 2.4, label: 'E', labelDx: 4 }, ...sArrows],
      points: [{ x: 2.0, y: 0.75, r: 0, label: 'B out of page', color: 'teal', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 2.0, y: -0.75, r: 0, label: 'B into page', color: 'teal', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 0.2, y: 1.38, r: 0, label: 'S', color: 'accent', labelDx: 6 }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys3750.W12.1',
  title: 'Maxwell’s equations in vacuum',
  minutes: 16, difficulty: 3,
  intro: t`Far from charges and currents, Maxwell’s four equations read

$$\begin{aligned}\nabla\cdot\vec E &= 0 \\ \nabla\cdot\vec B &= 0 \\ \nabla\times\vec E &= -\frac{\partial\vec B}{\partial t} \\ \nabla\times\vec B &= \mu_0\varepsilon_0\frac{\partial\vec E}{\partial t}\end{aligned}$$

The last two feed each other: a changing $\vec B$ curls $\vec E$, and a changing $\vec E$ — Maxwell’s **displacement current** — curls $\vec B$. Take the curl of Faraday’s law, use [the identity](#/lesson/phys3750.W11.1) $\nabla\times(\nabla\times\vec E) = \nabla(\nabla\cdot\vec E) - \nabla^2\vec E$ and $\nabla\cdot\vec E = 0$, and each component of $\vec E$ (and of $\vec B$) obeys the three-dimensional wave equation of [plane waves](#/lesson/phys3750.W7.1), with a speed fixed by two constants measured on a bench: $c = 1/\sqrt{\mu_0\varepsilon_0}$.`,
  equation: t`\nabla^2\vec E = \mu_0\varepsilon_0\,\frac{\partial^2\vec E}{\partial t^2}`,
  symbols: [
    { tex: '\\vec E', text: 'the electric field, in V/m' },
    { tex: '\\vec B', text: 'the magnetic field, in T; it obeys the same wave equation' },
    { tex: '\\varepsilon_0', text: 'the vacuum permittivity, $8.854\\times10^{-12}$ F/m, set by the force between charges' },
    { tex: '\\mu_0', text: 'the vacuum permeability, $1.2566\\times10^{-6}$ N/A², set by the force between currents' },
    { tex: '\\nabla^2', text: 'the Laplacian, $\\partial_x^2 + \\partial_y^2 + \\partial_z^2$, acting on each Cartesian component' },
    { tex: 'c = 1/\\sqrt{\\mu_0\\varepsilon_0}', text: 'the speed of the waves, $299\\,792\\,458$ m/s — the speed of light' },
  ],
  why: t`This is the equation that showed light to be electromagnetic, and it is the template for the gravitational waves of W14: a field theory whose waves travel at $c$.`,
  visual: {
    type: 'em-gap',
    title: 'The term that makes light',
    lead: t`A capacitor charging through a wire. Ampère’s law counts the current through a surface spanning the loop — but which surface? Between the plates no charge flows, yet the field grows.`,
    tasks: [
      t`Put the loop round the wire and switch between the flat disc and the bag that bulges between the plates. The conduction current through the bag is zero, but the displacement current $\varepsilon_0\,d\Phi_E/dt$ makes up exactly the difference.`,
      t`Move the loop into the gap: $\vec B$ circles there too, produced by nothing but a changing $\vec E$.`,
      t`That changing-E-makes-B term, with Faraday’s changing-B-makes-E, is the pair that sustains a wave in empty space.`,
    ],
    params: { I: 2, R: 5, at: 'wire', r: 3, surface: 'flat' },
    caption: t`Circular plates, fringing ignored; ⊙ and ⊗ mark $\vec B$ out of and into the page, sized by strength. The picture loops every 8 s.`,
  },
  example: {
    prompt: t`Derive the wave equation for $\vec E$ in empty space and find its speed from $\mu_0 = ${tn(MU0, 9)}$ N/A² and $\varepsilon_0 = ${tn(EPS0, 9)}$ F/m (CODATA 2022).`,
    steps: [
      { label: 'Curl of Faraday', text: t`$\nabla\times(\nabla\times\vec E) = -\dfrac{\partial}{\partial t}(\nabla\times\vec B)$ — space and time derivatives commute.` },
      { label: 'Feed in Ampère', text: t`With $\nabla\times\vec B = \mu_0\varepsilon_0\,\partial_t\vec E$, the right side is $-\mu_0\varepsilon_0\,\partial_t^2\vec E$.` },
      { label: 'The identity', text: t`The left side is $\nabla(\nabla\cdot\vec E) - \nabla^2\vec E = -\nabla^2\vec E$, because $\nabla\cdot\vec E = 0$ in empty space. So $\nabla^2\vec E = \mu_0\varepsilon_0\,\partial_t^2\vec E$.` },
      { label: 'Read off c', text: t`Compare $\nabla^2u = \dfrac{1}{v^2}u_{tt}$: $v = 1/\sqrt{\mu_0\varepsilon_0} = ${tn(EX.c, 9)}$ m/s.` },
      { label: 'Same for B', text: t`The curl of the Ampère–Maxwell law, with Faraday’s law and $\nabla\cdot\vec B = 0$, gives $\nabla^2\vec B = \mu_0\varepsilon_0\,\partial_t^2\vec B$: the same speed.` },
      { label: 'History and SI', text: t`In 1862 Maxwell found about $3.1\times10^{8}$ m/s from electrical measurements alone, within a few per cent of Fizeau’s measured speed of light. Today it runs the other way: $c$ is exact by definition, $\mu_0$ is measured ($\mu_0/4\pi\times10^{-7} = ${EX.ratio.toFixed(11).replace(/(?<=\.\d*)(\d{3})(?=\d)/g, '$1\\,')}$), and $\varepsilon_0 = 1/\mu_0c^2$.` },
    ],
    answer: t`$\nabla^2\vec E = \mu_0\varepsilon_0\,\partial_t^2\vec E$ and likewise for $\vec B$, with $c = 1/\sqrt{\mu_0\varepsilon_0} = ${tn(EX.c, 9)}$ m/s.`,
    visual: { type: 'em-wave', params: { phase: 40, controls: false, readout: false }, caption: 'What the equation allows: a plane wave, E (violet) and B (teal) at right angles, travelling at c. Field strengths not to scale.' },
  },
  practice: [
    order({
      id: 'derive-B', difficulty: 2,
      prompt: t`Put in order the derivation of the wave equation for $\vec B$ in empty space.`,
      visual: { type: 'em-wave', params: { phase: 0, controls: false, readout: false, hide: ['E'] }, caption: 'The magnetic half of a plane wave alone (not to scale).' },
      items: [
        t`Take the curl of $\nabla\times\vec B = \mu_0\varepsilon_0\,\partial_t\vec E$`,
        t`Use Faraday: $\nabla\times(\nabla\times\vec B) = -\mu_0\varepsilon_0\,\partial_t^2\vec B$`,
        t`Expand: $\nabla(\nabla\cdot\vec B) - \nabla^2\vec B$`,
        t`Use $\nabla\cdot\vec B = 0$`,
        t`$\nabla^2\vec B = \mu_0\varepsilon_0\,\partial_t^2\vec B$`,
      ],
      hints: [t`It mirrors the derivation for $\vec E$, with the roles of Faraday and Ampère–Maxwell swapped.`, 'The identity comes after both curls are in place; the divergence law kills one of its terms.'],
      teach: 'Curl one curl equation, feed in the other, and the divergence law reduces the identity to a Laplacian: a wave equation.',
      explain: t`$\nabla\times(\nabla\times\vec B) = \mu_0\varepsilon_0\,\partial_t(\nabla\times\vec E) = -\mu_0\varepsilon_0\,\partial_t^2\vec B$, and the left side is $-\nabla^2\vec B$ since $\nabla\cdot\vec B = 0$.`,
    }),
    num({
      id: 'cable-speed', difficulty: 2, transfer: true,
      gen(r) {
        const [what, er] = r.pick([['solid polyethylene', 2.25], ['PTFE (Teflon)', 2.1], ['polyethylene foam', 1.5]]), L = r.pick([10, 25, 60]);
        const v = C / Math.sqrt(er), dt = (L / v) * 1e9;
        return {
          prompt: t`Inside a coaxial cable the fields fill ${what}, so Maxwell’s equations hold with $\varepsilon_0$ replaced by $\varepsilon_r\varepsilon_0$, $\varepsilon_r = ${er}$ (the material is not magnetic). How long does a signal take to travel ${L} m of cable, in ns?`,
          visual: curvesPic([{ fn: 'e^(-((x - 3)^2)/0.4)', color: 'accent', width: 2.4 }], [0, 10], [-0.2, 1.3], t`A pulse travelling along the cable (shape illustrative).`, { xlabel: 'position along the cable', ylabel: 'V', xticks: 0, yticks: 0, arrows: [{ from: [3.6, 0.9], to: [5, 0.9], color: 'gold', label: 'v' }] }),
          answer: dt, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: (L / C) * 1e9, feedback: t`That is the time in vacuum. The dielectric slows the wave to $c/\sqrt{\varepsilon_r}$.` }, { value: ((L * er) / C) * 1e9, feedback: t`The speed is $1/\sqrt{\mu_0\varepsilon_r\varepsilon_0} = c/\sqrt{\varepsilon_r}$ — a square root, not $c/\varepsilon_r$.` }],
          hints: [t`$v = 1/\sqrt{\mu_0\varepsilon_r\varepsilon_0} = c/\sqrt{\varepsilon_r}$.`, t`Time $= L/v = L\sqrt{\varepsilon_r}/c$.`],
          teach: t`In a dielectric the same derivation gives $v = c/\sqrt{\varepsilon_r}$: the velocity factor of a cable.`,
          explain: t`$v = c/\sqrt{${er}} = ${tn(v)}$ m/s (a velocity factor of $${tn(1 / Math.sqrt(er))}$), so ${L} m takes $${tn(dt)}$ ns.`,
        };
      },
    }),
    num({
      id: 'displacement', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 5]), dE = r.pick([2, 5, 8]) * 1e12;
        const Id = EPS0 * Math.PI * (R / 100) ** 2 * dE;
        return {
          prompt: t`Between the circular plates of a capacitor (radius ${R} cm) the electric field is uniform and rising at $${tn(dE)}$ V/(m s). What is the displacement current $I_d = \varepsilon_0\,d\Phi_E/dt$ between the plates, in mA? (Ignore fringing.)`,
          visual: { type: 'em-gap', params: { at: 'gap', r: 3, readout: false, controls: false, labels: false, t: 2 }, caption: 'A loop between the plates of a charging capacitor: B circles it though no charge crosses the gap. Fringing ignored.' },
          answer: Id * 1000, units: 'mA', tol: { rel: 0.01 },
          errors: [{ value: EPS0 * dE * 1000, feedback: t`$\Phi_E$ is the field times the plate area, $\pi R^2$.` }, { value: EPS0 * Math.PI * R * R * dE * 1000, feedback: 'Convert the radius to metres before squaring.' }],
          hints: [t`$\Phi_E = E\cdot\pi R^2$, so $d\Phi_E/dt = \pi R^2\,dE/dt$.`, t`$I_d = \varepsilon_0\pi R^2\,dE/dt$ with $R = ${R / 100}$ m.`],
          teach: t`The displacement current $\varepsilon_0\,d\Phi_E/dt$ continues the wire’s current across the gap.`,
          explain: t`$I_d = (8.854\times10^{-12})\,\pi(${R / 100})^2(${tn(dE)}) = ${tn(Id * 1000)}$ mA — equal to the current in the wires charging the plates.`,
        };
      },
    }),
    mcq({
      id: 'without-maxwell', difficulty: 3,
      prompt: t`Before Maxwell, Ampère’s law in empty space read $\nabla\times\vec B = 0$ (no current, no displacement term). What would that do to the derivation of the wave equation?`,
      visual: { type: 'em-gap', params: { at: 'gap', r: 3, readout: false, controls: false, t: 3 }, caption: 'The capacitor gap, where the displacement term is the only source of B. Fringing ignored.' },
      choices: [
        t`Curling Faraday’s law would give $\nabla^2\vec E = 0$: no time dependence, no waves — fields could not leave their sources`,
        t`The waves would still exist but travel infinitely fast, since $\mu_0\varepsilon_0$ would be zero`,
        t`Only $\vec B$ would stop waving; $\vec E$ would still obey the wave equation on its own`,
        t`Nothing: the displacement current only matters inside capacitors, not in empty space`,
      ],
      answer: 0,
      why: {
        1: t`$\mu_0$ and $\varepsilon_0$ are still there; what disappears is the time derivative. Laplace’s equation, $\nabla^2\vec E = 0$, describes no propagation at all, not instant propagation.`,
        2: t`The two fields feed each other through both curl equations. Remove one link and neither waves.`,
        3: t`In empty space there is no conduction current, so the displacement term is the only thing on the right of Ampère’s law: it is all there is.`,
      },
      hints: [t`Redo the curl of Faraday: $\nabla\times(\nabla\times\vec E) = -\partial_t(\nabla\times\vec B)$.`, t`With $\nabla\times\vec B = 0$ the right side vanishes.`],
      teach: 'Without the displacement current a changing E makes no B, the feedback loop breaks, and there are no electromagnetic waves.',
      explain: t`$-\nabla^2\vec E = -\partial_t(0) = 0$. Maxwell added $\mu_0\varepsilon_0\,\partial_t\vec E$ to make charge conservation consistent (a charging capacitor has $\nabla\cdot\vec J \ne 0$); the wave equation and light came with it.`,
    }),
    num({
      id: 'poynting-wire', difficulty: 3,
      gen(r) {
        const I = r.pick([2, 4, 8]), Rl = r.pick([5, 12, 25]), a = r.pick([0.25, 0.4, 0.6]);   // resistance per metre (Ω/m), radius in mm
        const E = I * Rl, B = (MU0 * I) / (2 * Math.PI * (a / 1000)), S = (E * B) / MU0;
        return {
          prompt: t`A nichrome heating wire of radius ${a} mm carries ${I} A and has resistance ${Rl} Ω per metre. At its surface, $E = IR/\ell$ along the wire and $B = \mu_0I/2\pi a$ around it. How large is the Poynting vector $S = EB/\mu_0$ there, in W/m²?`,
          visual: wirePic(t`A wire carrying current: E along it, B circling it, so $\vec S = \vec E\times\vec B/\mu_0$ points into the wire from every side. Schematic, not to scale.`),
          answer: S, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: E * B, feedback: t`Divide by $\mu_0$: $\vec S = \vec E\times\vec B/\mu_0$.` }, { value: S * 1000, feedback: 'Convert the radius to metres.' }],
          hints: [t`$E = ${I}\times${Rl} = ${E}$ V/m and $B = \mu_0I/2\pi a$.`, t`$S = EB/\mu_0 = EI/2\pi a$ — $\mu_0$ cancels.`],
          teach: t`Poynting’s theorem: the energy a resistor turns into heat flows into it from the field around it, at $S = EB/\mu_0$.`,
          explain: t`$S = \dfrac{E}{\mu_0}\cdot\dfrac{\mu_0I}{2\pi a} = \dfrac{EI}{2\pi a} = ${tn(S)}$ W/m². Times the surface area $2\pi a$ per metre this is $EI = I^2R/\ell = ${tn(I * I * Rl)}$ W/m: exactly the Joule heating. This is the $-\vec J\cdot\vec E$ sink that [conservation laws for fields](#/lesson/phys3750.W9.2) promised.`,
        };
      },
    }),
    multi({
      id: 'vacuum-facts', difficulty: 2,
      prompt: t`Which of these follow from Maxwell’s equations in vacuum? (Select all that apply.)`,
      visual: { type: 'em-spectrum', params: {}, caption: 'Radio to gamma rays: all solutions of the same equation.' },
      choices: [
        t`Every Cartesian component of $\vec E$ obeys the three-dimensional wave equation`,
        'Waves of every frequency travel at the same speed — empty space does not disperse',
        t`$\vec E$ and $\vec B$ cannot be chosen independently: each wave in one carries a wave in the other`,
        'The waves need a medium, the aether, whose motion changes their measured speed',
        'Waves of higher frequency travel faster, as on the chain of masses',
      ],
      answer: [0, 1, 2],
      why: {
        3: t`Nothing in the equations refers to a medium: $\mu_0$ and $\varepsilon_0$ are properties of empty space. Michelson and Morley found no aether wind, and relativity makes $c$ the same for every inertial observer.`,
        4: t`$\nabla^2\vec E = c^{-2}\partial_t^2\vec E$ gives $\omega = ck$: a straight line, no dispersion. Dispersion appears in matter (glass, plasma), not in vacuum.`,
      },
      hints: [t`Put $e^{i(\vec k\cdot\vec r - \omega t)}$ into the wave equation: what is $\omega(k)$?`, 'Faraday’s law ties a changing E to B: one cannot exist without the other.'],
      teach: t`Vacuum electromagnetism: every component waves, $\omega = ck$ exactly, and $\vec E$ and $\vec B$ come as a linked pair.`,
      explain: t`The wave equation holds for each component; its dispersion relation $\omega = ck$ is linear, so radio, light and gamma rays all travel at $c$ (pulsar and gamma-ray-burst timing confirm it to high precision); Faraday’s law fixes $\vec B$ once $\vec E$ is known. There is no medium.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tdr', difficulty: 3, transfer: true,
      gen(r) {
        const er = r.pick([2.1, 2.25]), dt = r.pick([180, 320, 540]);
        const v = C / Math.sqrt(er), d = (v * dt * 1e-9) / 2;
        return {
          prompt: t`An avionics technician hunts for a break in an aircraft’s coaxial antenna cable with a time-domain reflectometer: it sends a pulse in and times the echo from the fault. The cable’s dielectric has $\varepsilon_r = ${er}$, and the echo returns ${dt} ns after the pulse leaves. How far along the cable is the break, in m?`,
          visual: curvesPic([{ fn: 'e^(-((x - 1.2)^2)/0.08) + 0.55*e^(-((x - 7.5)^2)/0.12)', color: 'accent', width: 2.2 }], [0, 10], [-0.15, 1.25], t`The reflectometer’s trace (illustrative): the outgoing pulse and, later, its echo from the fault.`, { xlabel: 'time', ylabel: 'V', xticks: 0, yticks: 0, points: [{ x: 1.2, y: 1, r: 0, label: 'pulse', labelDx: 8 }, { x: 7.5, y: 0.55, r: 0, label: 'echo', labelDx: 8 }] }),
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: 2 * d, feedback: 'The echo goes out and back: the break is at half the round-trip distance.' }, { value: (C * dt * 1e-9) / 2, feedback: t`Inside the cable the pulse travels at $c/\sqrt{\varepsilon_r}$, not $c$.` }],
          hints: [t`Speed in the cable: $v = c/\sqrt{\varepsilon_r}$.`, t`Distance to the fault $= v\,\Delta t/2$.`],
          teach: t`Signals in cable travel at $c/\sqrt{\varepsilon_r}$; an echo’s delay is the round trip.`,
          explain: t`$v = ${tn(v)}$ m/s, so $d = v\Delta t/2 = ${tn(d)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'cp-where-energy', difficulty: 3,
      prompt: t`A battery drives a steady current through a long resistor. According to Poynting’s theorem, $\partial_tu + \nabla\cdot\vec S = -\vec J\cdot\vec E$, how does the energy that heats the resistor get into it?`,
      visual: wirePic(t`The resistor with its E and B fields. Schematic, not to scale; arrows show directions only.`),
      choices: [
        t`It flows in through the resistor’s sides from the field in the surrounding space, along $\vec S = \vec E\times\vec B/\mu_0$`,
        'It is carried along the inside of the wire by the moving electrons’ kinetic energy',
        t`It travels along the wire’s axis, parallel to the current, at the speed of light`,
        t`It is created inside the resistor by $\vec J\cdot\vec E$, which is a source term`,
      ],
      answer: 0,
      why: {
        1: 'The electrons drift at fractions of a millimetre per second and their kinetic energy is tiny and unchanged in a steady current; they do not carry the power.',
        2: t`$\vec E$ is along the wire and $\vec B$ circles it, so $\vec E\times\vec B$ points radially inward, not along the axis.`,
        3: t`$-\vec J\cdot\vec E$ is a sink for the field’s energy: it converts field energy into heat; it does not create energy.`,
      },
      hints: [t`At the surface, $\vec E$ points along the wire and $\vec B$ circles it. Which way is $\vec E\times\vec B$?`, t`$S\times(2\pi a\ell) = I^2R$.`],
      teach: 'In circuits, energy travels through the fields around the wires and enters the resistor from outside.',
      explain: t`$\vec S$ points radially inward at the surface, and its flux over the resistor’s surface is exactly $I^2R$. The wires guide the fields; the energy itself travels through the space around them.`,
    }),
    num({
      id: 'cp-epsilon', difficulty: 2,
      gen(r) {
        const [what, v] = r.pick([['a hypothetical world where light travels at $2.00\\times10^{8}$ m/s', 2e8], ['a hypothetical world where light travels at $1.50\\times10^{8}$ m/s', 1.5e8], ['a hypothetical world where light travels at $4.00\\times10^{8}$ m/s', 4e8]]);
        const eps = 1 / (MU0 * v * v);
        return {
          prompt: t`The SI fixes $c$ exactly (since 1983) and, since 2019, measures $\mu_0 = 1.2566\times10^{-6}$ N/A²; $\varepsilon_0$ follows from $c = 1/\sqrt{\mu_0\varepsilon_0}$. In ${what}, with the same $\mu_0$, what would $\varepsilon_0$ be, in units of $10^{-12}$ F/m?`,
          visual: curvesPic([{ fn: '1/x^2', color: 'accent', width: 2.4, domain: [0.6, 3] }], [0.5, 3], [0, 3], t`$\varepsilon_0 \propto 1/c^2$ at fixed $\mu_0$ (relative units).`, { xlabel: 'c (relative)', ylabel: 'ε₀ (relative)' }),
          answer: eps * 1e12, tol: { rel: 0.01 },
          errors: [{ value: (1 / (MU0 * v)) * 1e12, feedback: t`$c^2 = 1/\mu_0\varepsilon_0$: square the speed.` }],
          hints: [t`$\varepsilon_0 = 1/(\mu_0c^2)$.`, t`$1/(1.2566\times10^{-6}\times(${tn(v)})^2)$ F/m.`],
          teach: t`$c^2 = 1/\mu_0\varepsilon_0$: two bench constants fix the speed of light.`,
          explain: t`$\varepsilon_0 = 1/(\mu_0c^2) = ${tn(eps * 1e12)}\times10^{-12}$ F/m. In our world, $8.854\times10^{-12}$ F/m.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 17–18: Maxwell equations; the electromagnetic wave equation (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Griffiths, Introduction to Electrodynamics, 4th ed., §7.3 and §8.1: Maxwell’s equations; Poynting’s theorem', url: 'https://doi.org/10.1017/9781108333511' },
    { label: 'CODATA 2022 recommended values (NIST): μ₀ and ε₀', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
