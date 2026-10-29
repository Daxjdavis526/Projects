// The Lorentz force law (Griffiths §5.1): F = Q(E + v × B); magnetic forces
// do no work (Griffiths Ex. 5.3, the "crane" — the work comes from whatever
// drives the current); the full cycloid in crossed E and B solved from the
// equations of motion (Ex. 5.2), with the energy the electric field supplies;
// the frame moving at E/B, in which the motion is a plain circle; the
// general drift v = F × B/(qB²) — gravity's drift depends on the charge's
// sign, E × B's does not. Transfer: why a Hall thruster traps its electrons
// but not its ions (Larmor radii against the channel). The intro version
// (circles, helices, selectors, the drift's direction) is phys2220.B1.1–B1.2.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { QE, ME, MP, AMU, PI, sf, bare } from './_mag.js';

const t = String.raw;
// CODATA 2022 masses (kg)
const M_D = 3.3435837768e-27, M_A = 6.6446573450e-27;
const IONS = [['proton', MP, 1], ['deuteron', M_D, 1], ['alpha particle', M_A, 2]];
const M_XE = 131.293 * AMU - ME, M_O = 15.9994 * AMU - ME;

/** A cycloid (in units of its wheel radius) drawn with the fields that make it. */
function cycloidPic(caption, { arches = 2, marks = [], extra = {} } = {}) {
  const X = 2 * PI * arches;
  return {
    type: 'graph',
    params: bare([-0.8, X + 0.8], [-0.6, 2.9], {
      curves: [{ param: ['t - sin(t)', '1 - cos(t)'], t: [0, X], color: 'warn', width: 2.6 }, { fn: '0', domain: [-0.5, X + 0.5], color: 'ink4', dash: [3, 5], width: 1 }],
      arrows: [{ from: [-0.45, 0.4], to: [-0.45, 1.9], color: 'gold', width: 2.4, label: 'E', labelDx: 6, labelDy: 0 }, { from: [X / 2 - 1.2, 2.55], to: [X / 2 + 1.2, 2.55], color: 'good', width: 2.4, label: 'drift', labelDx: 6, labelDy: 0 }],
      points: [{ x: 0, y: 0, r: 5, color: 'warn', label: 'start, at rest', labelDx: 8, labelDy: 14 }, { x: X + 0.5, y: 2.6, r: 0, label: 'B out of the page', labelDx: -116, labelDy: 0, color: 'teal' }, ...marks],
      ...extra,
    }),
    caption,
  };
}

export default lesson({
  id: 'phys3600.M6.1',
  title: 'The Lorentz force law',
  minutes: 15, difficulty: 3,
  equation: t`\vec F = Q\left(\vec E + \vec v\times\vec B\right)`,
  intro: t`A charge $Q$ moving with velocity $\vec v$ feels the electric force $Q\vec E$ and the magnetic force $Q\vec v\times\vec B$. The magnetic part is always perpendicular to $\vec v$, so it does **no work**: $dW = Q(\vec v\times\vec B)\cdot\vec v\,dt = 0$. A magnetic field can bend a path but never speed it up — any energy a charge gains in fields comes from $\vec E$. You met the circles, helices and the velocity selector in [Physics II](#/lesson/phys2220.B1.2). Here the equations of motion are solved outright: crossed fields make a **cycloid** that drifts at $E/B$, and every steady force $\vec F$ across $\vec B$ makes a drift $\vec F\times\vec B/QB^2$ — the starting point of plasma physics.`,
  symbols: [
    { tex: 'Q', text: 'the charge, in C (negative for an electron)' },
    { tex: '\\vec E', text: 'the electric field at the charge, in V/m' },
    { tex: '\\vec v', text: 'the charge’s velocity, in m/s' },
    { tex: '\\vec B', text: t`the magnetic field, in tesla ($1\ \text{T} = 1\ \text{N/(A·m)}$)` },
    { tex: '\\vec F', text: 'the force on the charge, in N' },
  ],
  why: t`Every plasma device — tokamaks, Hall thrusters, Earth’s radiation belts and ring current — runs on these drifts; and the Lorentz force is where special relativity first showed that $\vec E$ and $\vec B$ are one field seen from different frames.`,
  visual: {
    type: 'em-lorentz',
    title: 'Crossed fields: the cycloid',
    lead: t`Looking along $\vec B$ (out of the page), with $\vec E$ pointing up. The upper proton starts **at rest**; the lower one is launched to the right at the speed you set. Press Play.`,
    tasks: [
      t`The proton from rest: $\vec E$ pushes it up, $\vec B$ bends it right and back down, and it stops on the line it started from — then repeats. A cycloid, drifting right at $E/B$.`,
      t`Set the launch speed equal to the drift speed $E/B$ (read it below): the lower proton goes straight — the forces balance. Faster or slower, it loops round the drift.`,
      t`Double $B$: the arches shrink four times (their size goes as $E/B^2$) while the drift halves.`,
    ],
    params: {
      view: 'top', species: 'proton', B: 0.1, E: 1e4, v: 1e5, unit: 'cm',
      particles: [{ species: 'proton', v: 0, at: [0, 1.5], label: 'from rest' }, { species: 'proton', v: 'v', dir: 0, at: [0, -3], label: 'launched' }],
      arrowsOn: [0, 1], sliders: ['E', 'B', 'v'], readouts: ['drift', 'T'], turns: 3,
    },
    caption: t`Exact non-relativistic motion in uniform fields. Arrows: velocity (green) and total force (violet), lengths in proportion to their sizes, not to the axes.`,
  },
  example: {
    prompt: t`A proton starts from rest where $\vec E = 5.0\ \text{kV/m}$ points up and $\vec B = 0.10$ T points out of the page. Solve for its motion: the height it reaches, how far it moves along per arch, and its greatest speed and energy.`,
    visual: cycloidPic(t`The path (orange) in units of $R = mE/QB^2$: a point on the rim of a wheel of radius $R$ rolling along at $E/B$. Not to scale with the numbers.`),
    steps: [
      { label: 'Equations of motion', text: t`With $\vec E = E\hat y$ and $\vec B = B\hat z$, $\vec v\times\vec B = (v_yB, -v_xB, 0)$. Newton: $m\dot v_x = QBv_y$ and $m\dot v_y = QE - QBv_x$. Write $\omega = QB/m$, the cyclotron frequency.` },
      { label: 'Solve', text: t`Differentiate the first and use the second: $\ddot v_x = -\omega^2\left(v_x - \dfrac EB\right)$ — a simple-harmonic oscillation about $E/B$. Starting from rest: $v_x = \dfrac EB(1 - \cos\omega t)$, $v_y = \dfrac EB\sin\omega t$.` },
      { label: 'Path', text: t`Integrate: $x = R(\omega t - \sin\omega t)$, $y = R(1 - \cos\omega t)$ with $R = \dfrac{E}{\omega B} = \dfrac{mE}{QB^2}$. A cycloid: a point on a wheel of radius $R$ rolling at $u = E/B$.` },
      { label: 'Numbers', text: t`$\omega = ${tex((QE * 0.1) / MP, 4)}\ \text{s}^{-1}$, $u = E/B = ${tex(5e3 / 0.1, 2)}$ m/s, $R = ${nice(sf(((MP * 5e3) / (QE * 0.01)) * 1e3, 3))}$ mm. Height $2R = ${nice(sf(((2 * MP * 5e3) / (QE * 0.01)) * 100, 3))}$ cm; advance per arch $2\pi R = ${nice(sf(((2 * PI * MP * 5e3) / (QE * 0.01)) * 100, 3))}$ cm, every $2\pi/\omega = ${nice(sf(((2 * PI) / ((QE * 0.1) / MP)) * 1e6, 3))}\ \mu\text{s}$.` },
      { label: 'Energy', text: t`Fastest at the top: $v = 2u = ${tex(1e5, 2)}$ m/s, so $K = \tfrac12m(2u)^2 \approx ${nice(sf((2 * MP * 5e4 ** 2) / QE, 3))}$ eV. Check: the electric field’s work, $QE\cdot2R$, is the same ✓. $\vec B$ did no work; it only turned the motion.` },
    ],
    answer: t`A cycloid: height $${nice(sf(((2 * MP * 5e3) / (QE * 0.01)) * 100, 3))}$ cm, advancing $${nice(sf(((2 * PI * MP * 5e3) / (QE * 0.01)) * 100, 3))}$ cm per arch at an average $5.0\times10^{4}$ m/s; top speed $1.0\times10^{5}$ m/s, $K \approx ${nice(sf((2 * MP * 5e4 ** 2) / QE, 3))}$ eV.`,
  },
  practice: [
    num({
      id: 'height', difficulty: 2,
      gen(r) {
        const [name, m, z] = r.pick(IONS), E = r.pick([2, 5, 10]), B = r.pick([0.05, 0.1, 0.2]);
        const h = (2 * m * E * 1e3) / (z * QE * B * B);
        return {
          prompt: t`${name === 'alpha particle' ? 'An' : 'A'} ${name} (charge $${z === 1 ? '' : '2'}e$) is released from rest where an electric field of ${E} kV/m crosses a magnetic field of ${B} T at right angles. How far does it get from the line it started on?`,
          visual: cycloidPic(t`The path from rest: a cycloid (in units of its wheel radius; the scale is for you to find).`),
          answer: h * 1e3, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (h / 2) * 1e3, feedback: t`$R = mE/QB^2$ is the radius of the rolling wheel. The point on its rim rises to $2R$.` }, { value: ((m * (E * 1e3)) / (z * QE * B)) * 1e3, feedback: 'Check the powers of B: R = E/(ωB) = mE/(QB²).' }],
          hints: [t`The path is a cycloid of wheel radius $R = \dfrac{mE}{QB^2}$.`, t`The highest point is the top of the wheel: $2R$.`],
          teach: 'From rest in crossed fields, a charge rises to 2mE/(QB²) — the diameter of the rolling wheel that traces its cycloid.',
          explain: t`$2R = \dfrac{2mE}{QB^2} = \dfrac{2(${tex(m, 4)})(${E * 1e3})}{(${z === 1 ? '' : '2\\times'}${tex(QE, 4)})(${B})^2} \approx ${nice(sf(h * 1e3, 3))}$ mm.`,
        };
      },
    }),
    num({
      id: 'top-energy', difficulty: 3,
      gen(r) {
        const elec = r.bool(0.5), E = elec ? r.pick([100, 200, 500]) : r.pick([2, 5, 10]) * 1e3, B = elec ? r.pick([1, 2, 5]) * 1e-3 : r.pick([0.05, 0.1]);
        const m = elec ? ME : MP, u = E / B, K = (2 * m * u * u) / QE;
        return {
          prompt: t`${elec ? 'An electron' : 'A proton'} starts from rest in crossed fields, $E = ${E >= 1e3 ? `${E / 1e3}\\ \\text{kV/m}` : `${E}\\ \\text{V/m}`}$ and $B = ${B >= 0.01 ? `${B}\\ \\text{T}` : `${B * 1e3}\\ \\text{mT}`}$. What is its kinetic energy at the top of each arch?`,
          visual: cycloidPic(t`The cycloid, with the top of an arch marked. The particle rolls like a point on a wheel.`, { marks: [{ x: PI, y: 2, r: 5, color: 'violet', label: 'top', labelDx: 8, labelDy: -6 }] }),
          answer: K, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: K / 4, feedback: t`$\tfrac12mu^2$ uses the drift speed. At the top the rim of the wheel moves at twice the hub’s speed: $2u$.` }, { value: 0, feedback: 'The magnetic force does no work, but the electric force does: the particle rises along E.' }],
          hints: [t`At the top of the cycloid the speed is $2u$, with $u = E/B$.`, t`$K = \tfrac12m(2u)^2 = 2mE^2/B^2$; divide by $e$ for electronvolts.`],
          teach: 'In crossed fields the speed swings between 0 and 2E/B; the energy comes from the electric field, never from B.',
          explain: t`$u = ${tex(u, 3)}$ m/s, so $K = 2mu^2 \approx ${tex(K * QE, 3)}$ J $\approx ${nice(sf(K, 3))}$ eV — exactly the work $QE\cdot2R$ that $\vec E$ did while the charge climbed $2R$.`,
        };
      },
    }),
    mcq({
      id: 'crane', difficulty: 3,
      prompt: t`A rectangular loop of wire hangs with its lower edge in a magnetic field, carrying a current that makes the magnetic force on that edge point up. Turn up the current and the loop rises, lifting a weight. Magnetic forces do no work — so what does the work of lifting?`,
      visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '-0.1', lower: '-1.25', from: -2.6, to: 2.6, color: 'teal', alpha: 0.12 }], curves: [...[[-0.9, -0.6, 0.9, -0.6], [0.9, -0.6, 0.9, 1.0], [0.9, 1.0, -0.9, 1.0], [-0.9, 1.0, -0.9, -0.6]].map(([a, b, c, d]) => ({ param: [`${a} + t*(${c - a})`, `${b} + t*(${d - b})`], t: [0, 1], color: 'warn', width: 3 }))], arrows: [{ from: [-0.6, -0.6], to: [0.4, -0.6], color: 'warn', width: 3, label: 'I', labelDx: 4, labelDy: 14 }, { from: [0, -0.6], to: [0, 0.2], color: 'violet', width: 2.6, label: 'magnetic force', labelDx: 8, labelDy: 4 }, { from: [1.5, 0.3], to: [1.5, -0.5], color: 'ink2', width: 2.4, label: 'weight', labelDx: 8, labelDy: 6 }], points: [{ x: -2.5, y: -1.05, r: 0, label: 'field region: B out of the page', labelDx: 0, labelDy: 0, color: 'teal' }] }), caption: 'The loop (orange) with only its lower edge in the field (shaded). The magnetic force on that edge (violet) holds up the loop and its load (grey). Not to scale.' },
      choices: [
        'The battery: once the loop moves up, the charges in the wire get an upward velocity, the magnetic force tilts against the current, and the battery must push charges against it',
        'The magnetic field: here it does do work, since the loop rises',
        'Nobody: the weight rises with no energy supplied',
        'The magnetic field’s stored energy, which drops as the loop rises',
      ],
      answer: 0,
      why: {
        1: t`$Q(\vec v\times\vec B)\cdot\vec v = 0$ always, for each charge. The total velocity of a charge — along the wire and upward with the loop — is what matters.`,
        2: 'Energy is conserved: the work must come from somewhere, and the circuit is the only source.',
        3: 'With the current held steady by the battery, the field’s energy does not supply it; the battery does (Griffiths, Example 5.3).',
      },
      hints: [t`Once the loop rises at speed $u$, a charge in the bottom edge moves with velocity $\vec w$ along the wire **plus** $\vec u$ upward. What is $\vec v\times\vec B$ now?`, 'The force tilts backward: its upward part does work +, its part along the wire does exactly the same work −, against the current.'],
      teach: 'Magnetic forces redirect; when a magnet seems to do work, the energy comes from whatever keeps the current flowing.',
      explain: t`With the loop rising at $u$, each charge’s velocity is $\vec w + \vec u$, so its magnetic force tilts back from the vertical. The upward part, $QwB$, lifts; the backward part, $QuB$, opposes the current. Their works cancel exactly — the force is still perpendicular to the motion — and the battery, pushing charges against $QuB$, supplies the energy. The magnetic force only redirects the battery’s work into lifting.`,
    }),
    num({
      id: 'gravity-drift', difficulty: 3,
      gen(r) {
        const [name, m] = r.pick([['proton (H⁺)', MP], ['oxygen ion (O⁺)', M_O]]), B = r.pick([25, 30, 40]), g = 8.94;
        const v = (m * g) / (QE * B * 1e-6);
        return {
          prompt: t`In the ionosphere 300 km up, gravity is $g = 8.94\ \text{m/s}^2$ and Earth’s field near the magnetic equator is horizontal, about ${B} μT. A steady force $\vec F$ across $\vec B$ makes a charge drift at $\vec v = \dfrac{\vec F\times\vec B}{QB^2}$. How fast does gravity make a ${name} drift?`,
          visual: { type: 'graph', params: bare([-0.8, 13.4], [-1.4, 2.6], { curves: [{ param: ['11.6 - 0.55*t + 0.8*sin(t)', '0.8*cos(t)'], t: [0, 6 * PI], color: 'warn', width: 2.2 }], arrows: [{ from: [12.9, 2.3], to: [12.9, 1.0], color: 'ink2', width: 2.4, label: 'gravity', labelDx: -56, labelDy: 6 }, { from: [3.4, 2.1], to: [0.6, 2.1], color: 'good', width: 2.4, label: 'drift (positive ion)', labelDx: 8, labelDy: -10 }], points: [{ x: 13.2, y: -1.2, r: 0, label: 'B out of the page (north)', labelDx: -168, color: 'teal' }] }), caption: t`A positive ion gyrating round the field while gravity (grey) pulls it down: its circles drift sideways, along $\vec F\times\vec B$. Sizes are wildly exaggerated: real gyrations are centimetres and the drift is very slow.` },
          answer: v * 1e3, units: 'mm/s', tol: { rel: 0.01 },
          errors: [{ value: ((QE * B * 1e-6) / (m * g)) * 1e3, feedback: 'Upside down: the drift is F/(QB), with F = mg.' }],
          hints: [t`$\vec F = m\vec g$ is perpendicular to $\vec B$, so $|\vec F\times\vec B| = mgB$ and $v = \dfrac{mg}{QB}$.`, t`Use $m = ${tex(m, 4)}$ kg and $B = ${B}\times10^{-6}$ T.`],
          teach: 'A steady force F across B makes a charge drift at F/(QB), perpendicular to both — whatever the force is.',
          explain: t`$v = \dfrac{mg}{QB} = \dfrac{(${tex(m, 4)})(8.94)}{(${tex(QE, 4)})(${B}\times10^{-6})} \approx ${nice(sf(v * 1e3, 3))}$ mm/s, **eastward** for a positive ion ($m\vec g\times\vec B$ with $\vec g$ down and $\vec B$ north; in the picture, where north points out of the page, east is to the left). Tiny — but the electrons drift west, so ions and electrons together carry an eastward current, the seed of the plasma bubbles that disturb GPS signals near the equator after sunset.`,
        };
      },
    }),
    mcq({
      id: 'signs', difficulty: 2,
      prompt: t`Protons and electrons sit in the same uniform magnetic field. Compare their drifts (a) when an electric field crosses $\vec B$, and (b) when gravity does.`,
      visual: { type: 'em-lorentz', params: { view: 'top', species: 'proton', B: 0.1, E: 1e3, v: 1e4, unit: 'cm', particles: [{ species: 'proton', v: 0, at: [0, 0.6], label: 'proton' }, { species: 'electron', v: 0, at: [0, -0.6], label: 'electron' }], arrows: [], readouts: [], play: false, t: 1, turns: 1, path: 'full' }, caption: t`Case (a): a proton and an electron released from rest in crossed $\vec E$ (up) and $\vec B$ (out of the page). The electron’s arches are far too small to see at this scale.` },
      choices: [
        '(a) the same direction for both; (b) opposite directions',
        '(a) opposite directions; (b) the same direction',
        'Opposite directions in both cases',
        'The same direction in both cases',
      ],
      answer: 0,
      why: {
        1: t`In (a) the force $Q\vec E$ flips with the charge **and** so does the bending; the two flips cancel in $Q\vec E\times\vec B/QB^2 = \vec E\times\vec B/B^2$.`,
        2: t`For gravity $\vec F = m\vec g$ does not flip with the charge, but the $1/Q$ does: $m\vec g\times\vec B/QB^2$.`,
        3: t`The electric drift $\vec E\times\vec B/B^2$ has no $Q$ in it; the gravitational one does.`,
      },
      hints: [t`Write each drift as $\vec F\times\vec B/QB^2$ and see where $Q$ survives.`],
      teach: 'E × B drift moves every charge the same way (no current); a charge-independent force like gravity drives opposite drifts (a current).',
      explain: t`(a) $\vec v = \vec E\times\vec B/B^2$: no $Q$, so plasma drifts as a whole — no current. (b) $\vec v = m\vec g\times\vec B/QB^2$: ions and electrons go opposite ways, and a current flows. The same sign logic makes the gradient and curvature drifts of Earth’s radiation-belt particles carry the westward **ring current**.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hall', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([250, 300, 400]), B = r.pick([10, 15, 20]);
        const v = Math.sqrt((2 * QE * V) / M_XE), rx = (M_XE * v) / (QE * B * 1e-3);
        const ve = Math.sqrt((2 * QE * 20) / ME), re = (ME * ve) / (QE * B * 1e-3);
        return {
          prompt: t`A Hall thruster crosses an axial electric field with a radial magnetic field of about ${B} mT in a channel only about 2.5 cm long. Its xenon ions (Xe⁺, mass $${tex(M_XE, 4)}$ kg) leave having fallen through ${V} V. What is the radius of the circle the field would bend such an ion into, at that speed?`,
          visual: { type: 'graph', params: bare([-2.8, 2.8], [-1.35, 1.35], { shade: [{ fn: '0.45', lower: '-0.45', from: -1.6, to: 0.9, color: 'teal', alpha: 0.18 }], curves: [{ fn: '0.45', domain: [-1.6, 0.9], color: 'ink2', width: 3 }, { fn: '-0.45', domain: [-1.6, 0.9], color: 'ink2', width: 3 }, { param: ['-1.3 + 0.08*cos(9*t)', '0.08*sin(9*t) + 0.25 - 0.012*t'], t: [0, 2 * PI], color: 'accent', width: 1.5 }, { fn: '-0.15', domain: [-1.4, 2.6], color: 'warn', width: 2.4 }], arrows: [{ from: [-1.2, -0.95], to: [0.6, -0.95], color: 'gold', width: 2.4, label: 'E (axial)', labelDx: 8, labelDy: 4 }, { from: [1.5, -0.6], to: [1.5, 0.6], color: 'teal', width: 2.4, label: 'B (radial)', labelDx: 8, labelDy: 0 }, { from: [1.9, -0.15], to: [2.6, -0.15], color: 'warn', width: 2.4 }], points: [{ x: -1.3, y: 0.62, r: 0, label: 'electrons trapped', labelDx: -40, color: 'accent' }, { x: 2.0, y: 0.1, r: 0, label: 'Xe⁺ out', labelDx: 0, color: 'warn' }, { x: -1.6, y: -0.62, r: 0, label: 'channel', labelDx: 0, color: 'ink2' }] }), caption: t`A slice through the thruster’s channel (teal): electrons (blue) gyrate tightly and drift round the annulus; ions (orange) shoot straight out. Schematic, not to scale.` },
          answer: rx, units: 'm', tol: { rel: 0.02 },
          errors: [{ value: (ME * Math.sqrt((2 * QE * V) / ME)) / (QE * B * 1e-3), feedback: 'That uses the electron’s mass. The ion is about 240 000 times heavier.' }],
          hints: [t`Speed after falling through $V$: $v = \sqrt{2eV/m}$.`, t`Radius $r = \dfrac{mv}{eB}$, with $B = ${B}\times10^{-3}$ T.`],
          teach: 'A Hall thruster works because electrons gyrate in a millimetre while ions would need metres: the field traps the electrons and lets the ions fly.',
          explain: t`$v = \sqrt{2eV/m} \approx ${tex(v, 3)}$ m/s and $r = mv/eB \approx ${nice(sf(rx, 3))}$ m — far larger than the 2.5 cm channel, so the ions barely bend and leave as thrust. An electron with 20 eV gyrates in $r \approx ${nice(sf(re * 1e3, 2))}$ mm and is trapped, drifting round the annulus at $E/B$ as the Hall current. That is the design principle; see [the drift problem in Physics II](#/lesson/phys2220.B1.2) for the direction.`,
        };
      },
    }),
    mcq({
      id: 'cp-frame', difficulty: 3,
      prompt: t`A proton starts from rest in crossed fields $\vec E \perp \vec B$. Seen by an observer moving at $\vec u = \vec E\times\vec B/B^2$, what does it do? (At speeds far below $c$, the moving observer measures the electric field $\vec E' = \vec E + \vec u\times\vec B$.)`,
      visual: { type: 'em-lorentz', params: { view: 'top', species: 'proton', B: 0.1, E: 5e3, v: 5e4, unit: 'cm', particles: [{ species: 'proton', v: 0, at: [0, 0], label: 'lab frame' }], arrows: [], readouts: [], play: false, t: 1.4, turns: 2, path: 'full' }, caption: t`The cycloid in the lab frame, $\vec E$ up and $\vec B$ out of the page.` },
      choices: [
        t`It circles at constant speed $u$: in that frame $\vec E' = 0$ and only $\vec B$ acts`,
        'It stands still, since the observer moves with it',
        'It traces the same cycloid, shifted along',
        t`It moves in a straight line at speed $u$`,
      ],
      answer: 0,
      why: {
        1: t`The proton moves at $u$ only on average; its speed swings from 0 to $2u$. Relative to the moving observer it still turns.`,
        2: t`In the moving frame the electric field vanishes, so nothing can make an arch: the motion is a circle.`,
        3: t`A straight line needs zero net force; in that frame there is a magnetic force on a charge moving at $u$.`,
      },
      hints: [t`Compute $\vec E + \vec u\times\vec B$ with $\vec u = \vec E\times\vec B/B^2$.`, t`In that frame the proton starts with velocity $-\vec u$, in a pure magnetic field.`],
      teach: 'The E × B drift is the velocity of the frame in which the electric field disappears; there, the motion is plain gyration.',
      explain: t`$\vec u\times\vec B = (\vec E\times\vec B)\times\vec B/B^2 = -\vec E$ for $\vec E \perp \vec B$, so $\vec E' = 0$. The proton starts with velocity $-\vec u$ and circles at speed $u$, radius $mu/QB = mE/QB^2$ — the wheel of the cycloid. Adding back the frame’s motion rolls the wheel. Electric and magnetic fields mix when you change frame: the first hint of relativity in electromagnetism.`,
    }),
    num({
      id: 'cp-advance', difficulty: 3,
      gen(r) {
        const elec = r.bool(0.5), E = elec ? r.pick([100, 300]) : r.pick([1, 3]) * 1e3, B = elec ? r.pick([1, 2]) * 1e-3 : r.pick([0.1, 0.2]);
        const m = elec ? ME : MP, d = (2 * PI * m * E) / (QE * B * B);
        return {
          prompt: t`${elec ? 'An electron' : 'A proton'} starts from rest where $E = ${E >= 1e3 ? `${E / 1e3}\\ \\text{kV/m}` : `${E}\\ \\text{V/m}`}$ crosses $B = ${B >= 0.01 ? `${B}\\ \\text{T}` : `${B * 1e3}\\ \\text{mT}`}$. How far along does it move during each arch of its cycloid?`,
          visual: cycloidPic(t`The cycloid; each arch is one turn of the rolling wheel.`),
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ((m * E) / (QE * B * B)) * 100, feedback: t`That is the wheel’s radius $R$. One arch is one full turn of the wheel: it rolls $2\pi R$.` }, { value: (d / PI) * 100, feedback: t`$2R$ is the height. The advance per arch is the wheel’s circumference, $2\pi R$.` }],
          hints: [t`Each arch takes one cyclotron period $T = 2\pi m/QB$, at the average speed $E/B$.`, t`Advance $= \dfrac EB\cdot\dfrac{2\pi m}{QB} = 2\pi R$.`],
          teach: 'One arch of the cycloid takes one cyclotron period and advances 2πmE/(QB²).',
          explain: t`$2\pi R = \dfrac{2\pi mE}{QB^2} \approx ${nice(sf(d * 100, 3))}$ cm per arch, covered in $T = ${tex((2 * PI * m) / (QE * B), 3)}$ s.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.1, Examples 5.2–5.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Goebel & Katz, Fundamentals of Electric Propulsion: Ion and Hall Thrusters (JPL, 2008), ch. 7', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
    { label: 'Chen, Introduction to Plasma Physics and Controlled Fusion (3rd ed.), ch. 2: single-particle drifts', url: 'https://doi.org/10.1007/978-3-319-22309-4' },
  ],
});
