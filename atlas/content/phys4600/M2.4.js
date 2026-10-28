// Angular momentum in fields (Griffiths §8.2.4 and Ex. 8.4; Feynman II §17-4
// and §27-6): with momentum density g = ε₀E×B, the fields hold angular
// momentum ℓ = r×g — even static ones. Griffiths's two charged cylindrical
// shells (±Q, radii a < R < b) round a long solenoid: the field holds
// −½μ₀nIQ(R² − a²)ẑ; switch the current off and the induced E torques the
// inner shell to +½μ₀nIQa²ẑ and the outer to −½μ₀nIQR²ẑ, summing exactly to
// what the field held. Feynman's disk paradox, honestly: the disk does turn;
// the angular momentum was in the static field; Feynman left the arithmetic
// as a puzzle, and it balances. The honest caveat for linear momentum:
// a static system's field momentum is cancelled by "hidden" mechanical
// momentum in its magnets' currents (Griffiths Ex. 12.12), so a static
// system does not move off by itself. Also: light's spin (torque P/ω, Beth
// 1936) and the charge–monopole pair, whose field angular momentum does not
// depend on the separation (Dirac's quantization). Transfers: spinning up a
// small satellite with a circularly polarized laser; how fast the shell spins.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, EPS0, C, PI, sf, circle, bare, outOf, tag, circArrows } from './_em4.js';

const t = String.raw;

// the worked example: n = 2000 /m, I = 5 A, R = 5 cm; shells a = 2 cm (+1 μC), b = 10 cm (−1 μC)
const EX = { n: 2000, I: 5, R: 0.05, a: 0.02, b: 0.1, Q: 1e-6 };
EX.k = MU0 * EX.n * EX.I * EX.Q;                 // μ₀nIQ
EX.Lf = 0.5 * EX.k * (EX.R ** 2 - EX.a ** 2);   // magnitude of the field's angular momentum (it points along −z)
EX.La = 0.5 * EX.k * EX.a ** 2;
EX.Lb = 0.5 * EX.k * EX.R ** 2;

/** Griffiths Ex. 8.4 end-on: solenoid (radius 1, B out of the page), inner shell at a (+Q), outer at b (−Q), g circling where E and B overlap. */
function shellsPic(a, b, caption, { g = true } = {}) {
  return {
    type: 'graph',
    params: bare([-2.6, 2.6], [-1.65, 1.65], {
      shade: g ? [{ fn: 'sqrt(max(1 - x^2, 0))', lower: `sqrt(max(${a * a} - x^2, 0))`, from: -1, to: 1, color: 'good', alpha: 0.16 }, { fn: `-sqrt(max(${a * a} - x^2, 0))`, lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'good', alpha: 0.16 }] : [],
      curves: [circle(1, 'accent', { width: 1.4, dash: [5, 4] }), circle(a, 'bad', { width: 2.6 }), circle(b, 'violet', { width: 2.6 })],
      arrows: g ? circArrows((1 + a) / 2, 4, -1, 'good', 0, 0, 0.4, 0.9) : [],
      points: [...outOf(0, 0, 'accent', 5), ...outOf(0.62 * Math.cos(2.4), 0.62 * Math.sin(2.4), 'accent', 5),
        tag(a * 0.7, -a * 0.7, '+Q', 'bad', { labelDx: 4, labelDy: 6 }), tag(b * 0.72, b * 0.72, '−Q', 'violet', { labelDx: 4 }), tag(-2.55, 1.5, 'solenoid (dashed), B out of the page', 'accent'), ...(g ? [tag(-2.55, -1.5, 'g = ε₀E × B circles here', 'good')] : [])],
    }),
    caption,
  };
}

export default lesson({
  id: 'phys4600.M2.4',
  title: 'Angular momentum in fields',
  minutes: 16, difficulty: 4,
  equation: t`\vec\ell_{\text{em}} = \vec r\times\vec g = \varepsilon_0\,\vec r\times\left(\vec E\times\vec B\right)`,
  intro: t`If the fields carry momentum density $\vec g = \varepsilon_0\vec E\times\vec B$ ([M2.3](#/lesson/phys4600.M2.3)), they carry angular momentum density $\vec r\times\vec g$ about any origin. That holds even for **static** fields: put a charge where a magnetic field is and $\vec E\times\vec B$ circulates, nothing moves, and yet the field holds angular momentum. Change the fields and it comes out. Feynman posed the puzzle: a disk carrying charges round its rim and a coil of steady current sits on a frictionless axle; let the current die away. The changing flux induces an electric field that circles the axle and torques the charges, so the disk spins up — from rest, with no outside torque. Angular momentum is conserved only if the static field held exactly what the disk acquires. It did.`,
  symbols: [
    { tex: '\\vec\\ell_{\\text{em}}', text: t`the angular momentum density of the field, in $\text{kg/(m s)}$ (angular momentum per unit volume)` },
    { tex: '\\vec g', text: t`the momentum density of the field, $\varepsilon_0\vec E\times\vec B = \vec S/c^2$, in $\text{kg/(m}^2\text{s)}$` },
    { tex: '\\vec r', text: 'the position, measured from the chosen origin (here, on the axis), in m' },
    { tex: '\\vec E,\\ \\vec B', text: 'the electric and magnetic fields, in V/m and T' },
  ],
  why: t`Light carries spin — a circularly polarized beam twists what absorbs it — and the angular momentum of a charge beside a magnetic monopole is the classical root of charge quantization.`,
  visual: {
    type: 'graph',
    title: 'Angular momentum stored in a static field',
    lead: t`Griffiths’s version of Feynman’s disk, end-on: a long solenoid (dashed, radius $R$, field out of the page) runs through two long charged cylindrical shells, $+Q$ at radius $a$ inside it and $-Q$ at radius $b$ outside it. Between the shells $\vec E$ points outward; inside the solenoid $\vec B$ points out of the page. Where both exist — the green ring — $\vec g = \varepsilon_0\vec E\times\vec B$ circles clockwise and holds angular momentum.`,
    tasks: [
      t`Read the field’s angular momentum (in units of $\mu_0nIQR^2$): $-\tfrac12(1 - a^2/R^2)$. Grow the inner shell: the green ring thins and the stored amount falls.`,
      t`Now switch the current off (in your head): the induced $\vec E$ spins the inner shell to $+\tfrac12a^2/R^2$ and the outer to $-\tfrac12$. Their sum, in the last readout, equals what the field held.`,
      t`The outer shell’s radius $b$ never enters: outside the solenoid $\vec B = 0$, so no field momentum lives there.`,
    ],
    params: {
      x: [-2.6, 2.6], y: [-1.65, 1.65], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'a', label: t`Inner shell radius $a/R$`, min: 0.1, max: 0.95, step: 0.05, value: 0.4, unit: '', explain: 'The positive shell, inside the solenoid.' },
        { key: 'b', label: t`Outer shell radius $b/R$`, min: 1.1, max: 1.55, step: 0.05, value: 1.4, unit: '', explain: 'The negative shell, outside the solenoid.' },
      ],
      shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: 'sqrt(max(a^2 - x^2, 0))', from: -1, to: 1, color: 'good', alpha: 0.16 }, { fn: '-sqrt(max(a^2 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'good', alpha: 0.16 }],
      curves: [circle(1, 'accent', { width: 1.4, dash: [5, 4] }), { param: ['a*cos(t)', 'a*sin(t)'], t: [0, 2 * PI], color: 'bad', width: 2.6 }, { param: ['b*cos(t)', 'b*sin(t)'], t: [0, 2 * PI], color: 'violet', width: 2.6 }],
      arrows: [{ from: ['((1 + a)/2)*0.6216 - 0.2*0.7833', '((1 + a)/2)*0.7833 + 0.2*0.6216'], to: ['((1 + a)/2)*0.6216 + 0.2*0.7833', '((1 + a)/2)*0.7833 - 0.2*0.6216'], color: 'good', width: 2 }, { from: ['((1 + a)/2)*-0.7833 - 0.2*0.6216', '((1 + a)/2)*0.6216 + 0.2*-0.7833'], to: ['((1 + a)/2)*-0.7833 + 0.2*0.6216', '((1 + a)/2)*0.6216 - 0.2*-0.7833'], color: 'good', width: 2 }, { from: ['((1 + a)/2)*-0.6216 - 0.2*-0.7833', '((1 + a)/2)*-0.7833 + 0.2*-0.6216'], to: ['((1 + a)/2)*-0.6216 + 0.2*-0.7833', '((1 + a)/2)*-0.7833 - 0.2*-0.6216'], color: 'good', width: 2 }, { from: ['((1 + a)/2)*0.7833 - 0.2*-0.6216', '((1 + a)/2)*-0.6216 + 0.2*0.7833'], to: ['((1 + a)/2)*0.7833 + 0.2*-0.6216', '((1 + a)/2)*-0.6216 - 0.2*0.7833'], color: 'good', width: 2 }],
      points: [...outOf(0, 0, 'accent', 5), { x: 'a*0.71', y: '-a*0.71', r: 0, label: '+Q', color: 'bad', labelDx: 4, labelDy: 6 }, { x: 'b*0.71', y: 'b*0.71', r: 0, label: '−Q', color: 'violet', labelDx: 4 }, tag(-2.55, 1.5, 'solenoid (dashed), B out of the page', 'accent'), tag(-2.55, -1.5, 'g circles clockwise in the green ring', 'good')],
      readouts: [
        { label: t`field’s $L_z$ before`, expr: '-(1 - a^2)/2', digits: 3 },
        { label: t`inner shell’s $L_z$ after`, expr: 'a^2/2', digits: 3 },
        { label: t`outer shell’s $L_z$ after`, expr: '-0.5', digits: 3 },
        { label: 'shells’ total after', expr: 'a^2/2 - 0.5', digits: 3 },
      ],
    },
    caption: t`Long, ideal solenoid and shells of equal length, quasistatic switch-off; angular momenta in units of $\mu_0nIQR^2$, along the solenoid’s field. The shells’ own magnetic fields as they spin are neglected (slow rotation).`,
  },
  example: {
    prompt: t`A long solenoid (${EX.n} turns per metre, ${EX.I} A, radius ${EX.R * 100} cm) runs along the axis of two long cylindrical shells: $+${EX.Q * 1e6}\ \mu\text{C}$ at radius ${EX.a * 100} cm, inside the solenoid, and $-${EX.Q * 1e6}\ \mu\text{C}$ at ${EX.b * 100} cm, outside it. How much angular momentum do the static fields hold, and where does it go when the current is switched off?`,
    visual: shellsPic(EX.a / EX.R, 1.5, t`The set-up end-on: the solenoid (dashed), the inner shell $+Q$ (red), the outer shell $-Q$ (violet), and the ring where $\vec g$ circles (green). Not to scale.`),
    steps: [
      { label: 'The fields', text: t`Between the shells, $E = \dfrac{Q}{2\pi\varepsilon_0\ell s}$ outward (for shells of length $\ell$). Inside the solenoid, $B = \mu_0nI$ along $\hat z$. Both exist only for $a < s < R$.` },
      { label: 'Momentum density', text: t`$\vec g = \varepsilon_0\vec E\times\vec B = -\dfrac{\mu_0nIQ}{2\pi\ell s}\hat\phi$: circling clockwise. Its angular momentum density about the axis is $sg_\phi = -\dfrac{\mu_0nIQ}{2\pi\ell}$ — the same everywhere in the ring.` },
      { label: 'Total', text: t`Times the ring’s volume $\pi(R^2 - a^2)\ell$: $L_z = -\tfrac12\mu_0nIQ(R^2 - a^2) \approx ${tex(-EX.Lf, 3)}$ kg m²/s.` },
      { label: 'Switch off', text: t`As $I$ falls, Faraday gives $E_\phi = -\tfrac{s}{2}\mu_0n\dot I$ inside the solenoid and $-\tfrac{R^2}{2s}\mu_0n\dot I$ outside. The torque on the inner shell is $aQE_\phi$; integrated, it gains $+\tfrac12\mu_0nIQa^2 \approx ${tex(EX.La, 3)}$. The outer shell ($-Q$) gains $-\tfrac12\mu_0nIQR^2 \approx ${tex(-EX.Lb, 3)}$.` },
      { label: 'Balance', text: t`Sum: $\tfrac12\mu_0nIQ(a^2 - R^2)$ — exactly the field’s angular momentum ✓. The shells spin opposite ways, and the field’s share has been handed to matter.` },
    ],
    answer: t`The field holds $L_z = -\tfrac12\mu_0nIQ(R^2 - a^2) \approx ${tex(-EX.Lf, 3)}$ kg m²/s; switching off gives the inner shell $${tex(EX.La, 3)}$ and the outer $${tex(-EX.Lb, 3)}$, which sum to it.`,
  },
  practice: [
    num({
      id: 'field-L', difficulty: 3,
      gen(r) {
        const n = r.pick([1000, 5000]), I = r.pick([2, 10]), R = r.pick([3, 5]), a = r.pick([1, 2]), Q = r.pick([0.5, 2, 5]);
        const L = 0.5 * MU0 * n * I * Q * 1e-6 * ((R / 100) ** 2 - (a / 100) ** 2);
        return {
          prompt: t`A long solenoid (${n} turns/m, ${I} A, radius ${R} cm) passes through a long shell of charge $+${Q}\ \mu\text{C}$ (radius ${a} cm) inside it, with $-${Q}\ \mu\text{C}$ on a shell outside it. What is the size of the angular momentum stored in the static fields?`,
          visual: shellsPic(a / R, 1.45, t`End-on: the solenoid (dashed) between the two shells; $\vec g$ circles in the green ring. Not to scale.`),
          answer: L * 1e12, units: 'pJ s', tol: { rel: 0.01 },
          errors: [
            { value: 0.5 * MU0 * n * I * Q * 1e-6 * (R / 100) ** 2 * 1e12, feedback: t`$\vec E$ is zero inside the inner shell: the field momentum lives only where $a < s < R$.` },
            { value: MU0 * n * I * Q * 1e-6 * ((R / 100) ** 2 - (a / 100) ** 2) * 1e12, feedback: t`Integrate $\int_a^R 2\pi s\,ds$: that gives $\pi(R^2 - a^2)$, and the $\tfrac{1}{2\pi}$ in $\vec g$ leaves a half.` },
          ],
          hints: [t`In $a < s < R$, $sg_\phi = -\dfrac{\mu_0nIQ}{2\pi\ell}$: uniform.`, t`Multiply by the volume $\pi(R^2 - a^2)\ell$: $|L| = \tfrac12\mu_0nIQ(R^2 - a^2)$.`],
          teach: 'A static charge distribution inside a magnetic field holds angular momentum in the field: here ½μ₀nIQ(R² − a²).',
          explain: t`$|L| = \tfrac12\mu_0nIQ(R^2 - a^2) \approx ${nice(sf(L * 1e12, 3))}\times10^{-12}$ J·s (kg m²/s). Tiny — but it is exactly what the shells will have between them when the current stops.`,
        };
      },
    }),
    num({
      id: 'inner-shell', difficulty: 3,
      gen(r) {
        const n = r.pick([2000, 4000]), I = r.pick([3, 8]), a = r.pick([1, 2, 3]), Q = r.pick([1, 4]);
        const L = 0.5 * MU0 * n * I * Q * 1e-6 * (a / 100) ** 2;
        return {
          prompt: t`In the set-up of the picture the inner shell (radius ${a} cm, charge $+${Q}\ \mu\text{C}$) is free to turn. The solenoid (${n} turns/m) carries ${I} A, which is then switched off. Using Faraday’s law for the field at the shell, what angular momentum does the shell end up with?`,
          visual: shellsPic(0.45, 1.45, t`End-on: the inner shell (red) inside the solenoid (dashed). Not to scale.`, { g: false }),
          answer: L * 1e12, units: 'pJ s', tol: { rel: 0.01 },
          errors: [{ value: MU0 * n * I * Q * 1e-6 * (a / 100) ** 2 * 1e12, feedback: t`Round a circle of radius $a$, $E\cdot2\pi a = \pi a^2|\dot B|$: the induced field is $\tfrac{a}{2}|\dot B|$, with a half.` }],
          hints: [t`At the shell, $E_\phi = \tfrac{a}{2}\mu_0n|\dot I|$, and the torque is $aQE_\phi$.`, t`Integrate over the switch-off: $L = \tfrac12\mu_0nQa^2\int|\dot I|\,dt = \tfrac12\mu_0nIQa^2$.`],
          teach: 'The induced E of a dying solenoid current torques a charged shell to ½μ₀nIQa², however fast the current dies.',
          explain: t`$L = \tfrac12\mu_0nIQa^2 \approx ${nice(sf(L * 1e12, 3))}\times10^{-12}$ kg m²/s. Note what drops out: how fast the current is switched off. A fast switch-off gives a big torque for a short time; the angular impulse is the same.`,
        };
      },
    }),
    mcq({
      id: 'disk-turns', difficulty: 2,
      prompt: t`Feynman’s disk: a disk on a frictionless axle carries a ring of charges round its rim and a small superconducting coil at its centre, carrying a steady current. Everything is at rest. The coil warms up and its current dies. What happens?`,
      visual: shellsPic(0.6, 1.4, t`The charges of the rim (here a shell) sit in the changing flux of the coil at the centre (dashed). A schematic stand-in for Feynman’s disk.`, { g: false }),
      choices: [
        'The disk starts to turn: the dying flux induces an electric field that circles the axle and torques the charges, and the angular momentum comes from the static field',
        'Nothing: with no external torque, angular momentum conservation forbids the disk to turn',
        'The disk turns, violating angular momentum conservation, which only holds for mechanical systems',
        'It turns, but only while the current is changing, then stops',
      ],
      answer: 0,
      why: {
        1: t`The argument forgets the field’s angular momentum. Before, the static fields held $\int\vec r\times\vec g\,d\tau \ne 0$; the disk ends up with exactly that.`,
        2: 'Conservation holds — for matter plus field. That is the point of the puzzle.',
        3: 'No torque acts once the current has stopped, so the disk keeps the angular momentum it gained.',
      },
      hints: [t`What does a changing magnetic flux through the disk induce round the rim?`, t`Before the switch-off, was $\int\vec r\times(\varepsilon_0\vec E\times\vec B)\,d\tau$ zero?`],
      teach: 'Feynman’s disk turns: the static field held angular momentum, and the induced E hands it to the charges.',
      explain: t`Faraday’s law guarantees an electric field circling the axle while the flux falls, and it torques the charges, so the disk must turn. Total angular momentum is conserved because the static field — charge’s $\vec E$ crossed with the coil’s $\vec B$ — held it all along. Feynman posed this in his Lectures (vol. II, §17-4) and pointed to field angular momentum (§27-6); worked out in detail, the two balance exactly.`,
    }),
    num({
      id: 'photon-torque', difficulty: 2,
      gen(r) {
        const P = r.pick([0.1, 1, 10]), lam = r.pick([532, 1064, 1550]);
        const w = (2 * PI * C) / (lam * 1e-9), tq = P / w;
        return {
          prompt: t`A circularly polarized laser beam of ${P} W at ${lam} nm is completely absorbed by a small disk. Each photon carries spin angular momentum $\hbar$ and energy $\hbar\omega$. What torque does the beam exert on the disk?`,
          visual: { type: 'em-wave', params: { theta: 0, controls: false, readout: false, phase: 30 }, caption: t`A plane light wave. In circularly polarized light, $\vec E$ rotates as it travels and the wave carries angular momentum. Not to scale.` },
          answer: tq * 1e15, units: 'fN m', tol: { rel: 0.01 },
          errors: [{ value: (P / (C / (lam * 1e-9))) * 1e15, feedback: t`Use the angular frequency $\omega = 2\pi c/\lambda$, not $c/\lambda$.` }],
          hints: [t`Angular momentum arrives at $\hbar$ per photon; photons arrive at $P/\hbar\omega$ per second.`, t`Torque $= \hbar\cdot\dfrac{P}{\hbar\omega} = \dfrac{P}{\omega}$, with $\omega = 2\pi c/\lambda$.`],
          teach: 'Circularly polarized light delivers angular momentum at the rate P/ω — a classical field result, though easiest to count with photons.',
          explain: t`$\omega = 2\pi c/\lambda \approx ${tex(w, 3)}$ rad/s, so the torque is $P/\omega \approx ${nice(sf(tq * 1e15, 3))}$ fN·m. Classically, the rotating $\vec E$ of the beam has a circulating $\vec E\times\vec B$ near the beam’s edge; Richard Beth measured the effect on a quarter-wave plate in 1936. Optical tweezers use it to spin microscopic particles.`,
        };
      },
    }),
    num({
      id: 'ell-density', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 5, 20]), B = r.pick([0.1, 0.5, 2]), s = r.pick([1, 2, 5]);
        const l = EPS0 * s * 1e-2 * E * 1e5 * B;
        return {
          prompt: t`At a point ${s} cm from an axis, the electric field points radially away from the axis with $E = ${E}\times10^{5}$ V/m and the magnetic field points along the axis with $B = ${B}$ T. What is the size of the field’s angular momentum density about the axis there, in units of $10^{-9}$ kg/(m s)?`,
          visual: shellsPic(0.35, 1.4, t`Radial $\vec E$ and axial $\vec B$ overlapping: $\vec g$ circles the axis (green). Not to scale.`),
          answer: l * 1e9, units: '', tol: { rel: 0.01 },
          errors: [{ value: (l / EPS0) * 1e9, feedback: t`The momentum density is $\varepsilon_0\vec E\times\vec B$: do not forget $\varepsilon_0$.` }],
          hints: [t`$\vec g = \varepsilon_0\vec E\times\vec B$: radial × axial is azimuthal, size $\varepsilon_0EB$.`, t`$\ell_z = s\,g_\phi = \varepsilon_0sEB$.`],
          teach: 'Where a radial E meets an axial B the field’s momentum circles the axis, with angular momentum density ε₀sEB.',
          explain: t`$|\ell_z| = \varepsilon_0sEB \approx ${nice(sf(l * 1e9, 3))}\times10^{-9}$ kg/(m s). Multiply by a volume to get angular momentum.`,
        };
      },
    }),
    mcq({
      id: 'monopole', difficulty: 3,
      prompt: t`A point charge $q$ sits a distance $d$ from a (hypothetical) magnetic monopole. Their static fields hold angular momentum about the line joining them. How does its size depend on $d$?`,
      visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', charges: [{ q: 1, x: -2, y: 0 }, { q: 1, x: 2, y: 0 }], fieldLines: true, static: true, readouts: [], arrows: false, labels: false, x: [-6, 6], y: [-3.5, 3.5] }, caption: t`Two radial fields from two points — one electric, one (for the monopole) magnetic, drawn here alike. Field lines exact for two like point sources.` },
      choices: [
        t`It does not depend on $d$ at all — so if angular momentum is quantized, the product of the two charges must be too`,
        t`It falls as $1/d^2$, like the fields`,
        t`It grows as $d$, since the lever arm grows`,
        'It is zero, since both fields are radial',
      ],
      answer: 0,
      why: {
        1: t`The fields fall as $1/r^2$, but the volume they overlap in grows; the integral of $\vec r\times\vec g$ comes out independent of $d$.`,
        2: 'Both effects are present; they cancel exactly.',
        3: t`Each field is radial from its own source, so $\vec E\times\vec B \ne 0$ off the axis: the momentum circles the axis.`,
      },
      hints: [t`Dimensional check: $\varepsilon_0\vec r\times(\vec E\times\vec B)$ with $E \propto q/r^2$ and $B \propto g_m/r^2$, integrated over volume $\propto r^3$.`, t`Powers of length: $r\cdot r^{-2}\cdot r^{-2}\cdot r^3 = r^0$.`],
      teach: 'A charge and a monopole hold field angular momentum μ₀qg/4π whatever their distance — Dirac’s classical root of charge quantization.',
      explain: t`The integral gives $|\vec L| = \mu_0qq_m/4\pi$ (with $q_m$ the magnetic charge in A·m), pointing along the line joining them, independent of $d$. If angular momentum comes in units of $\hbar/2$, then $qq_m$ is quantized — Dirac’s argument that a single monopole anywhere would explain why all electric charge is a multiple of $e$. No monopole has been found.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-laser', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([1, 5, 10]), lam = r.pick([1064, 1550]), Iz = r.pick([0.01, 0.05]), w1 = r.pick([0.01, 0.1]);
        const w = (2 * PI * C) / (lam * 1e-9), tq = (P * 1e3) / w, T = (Iz * w1) / tq;
        return {
          prompt: t`A ground station beams a ${P} kW, ${lam} nm circularly polarized laser at a small satellite, whose black panel absorbs all of it. The satellite’s moment of inertia about the beam axis is ${Iz} kg m². Ignoring every other torque, how many days would the light’s angular momentum take to spin it up to ${w1} rad/s?`,
          visual: { type: 'em-wave', params: { theta: 30, controls: false, readout: false, phase: 60 }, caption: t`Light travelling toward the satellite; circular polarization means $\vec E$ turns as it travels. Not to scale.` },
          answer: T / 86400, units: 'day', tol: { rel: 0.01 },
          errors: [{ value: (Iz * w1) / ((P * 1e3) / (C / (lam * 1e-9))) / 86400, feedback: t`The light’s angular frequency is $\omega = 2\pi c/\lambda$.` }],
          hints: [t`Torque $= P/\omega$ with $\omega = 2\pi c/\lambda$.`, t`Time $= I\omega_{\text{spin}}/\tau$; divide by 86 400 s per day.`],
          teach: 'Light’s spin delivers torque P/ω: real, but at optical frequencies minute — kilowatts give piconewton-metres.',
          explain: t`$\tau = P/\omega \approx ${tex(tq, 3)}$ N·m, so $t = I\omega_{\text{spin}}/\tau \approx ${tex(T, 3)}$ s, about ${nice(sf(T / 86400, 3))} days. Light’s **linear** momentum would push the satellite far more noticeably ($P/c$ of force); its spin is a delicate effect, used to rotate microscopic particles in optical tweezers rather than spacecraft.`,
        };
      },
    }),
    num({
      id: 'cp-spin-rate', difficulty: 3,
      gen(r) {
        const n = r.pick([5000, 10000]), I = r.pick([10, 20]), Q = r.pick([10, 50]), m = r.pick([1, 5]);
        const w = (0.5 * MU0 * n * I * Q * 1e-6) / (m * 1e-3);
        return {
          prompt: t`In the set-up of the picture the inner shell is a thin cylinder of mass ${m} g carrying $+${Q}\ \mu\text{C}$, free to turn. The solenoid (${n} turns/m) carries ${I} A, which is switched off. How fast does the shell turn afterwards, in rad/s? (Its moment of inertia is $ma^2$.)`,
          visual: shellsPic(0.5, 1.45, t`End-on: the inner shell (red) inside the solenoid (dashed). Not to scale.`, { g: false }),
          answer: w, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: (MU0 * n * I * Q * 1e-6) / (m * 1e-3), feedback: t`The shell gains $\tfrac12\mu_0nIQa^2$ — with the half from the induced field $\tfrac{a}{2}\dot B$.` }],
          hints: [t`The shell gains $L = \tfrac12\mu_0nIQa^2$.`, t`$\omega = L/ma^2 = \dfrac{\mu_0nIQ}{2m}$: the radius cancels.`],
          teach: 'A charged shell inside a solenoid spins up to ω = μ₀nIQ/2m when the current stops, whatever its radius: the cyclotron-like ratio qB/2m.',
          explain: t`$\omega = \dfrac{\mu_0nIQ}{2m} = \dfrac{QB}{2m} \approx ${tex(w, 3)}$ rad/s — slow, because a microcoulomb on a gram is a tiny charge-to-mass ratio. It is half the cyclotron frequency $QB/m$: Larmor’s theorem in disguise.`,
        };
      },
    }),
    mcq({
      id: 'cp-hidden', difficulty: 4,
      prompt: t`A charge sits at rest beside a permanent magnet, so $\vec E\times\vec B \ne 0$ and the field holds **linear** momentum. Yet the whole system, isolated and static, does not start to move. Why not?`,
      visual: { type: 'em3h-magnet', params: { ratio: 1.2, show: 'B', controls: false, readout: false, probe: false, inset: false }, caption: t`A magnet’s $\vec B$ lines; a charge beside it makes $\vec E\times\vec B$ circulate. Exact field of a uniformly magnetized cylinder.` },
      choices: [
        t`The magnet’s circulating currents carry an equal and opposite “hidden” mechanical momentum (a relativistic effect), so the total is zero`,
        'The field’s momentum is not real; it is only bookkeeping',
        'The momentum is real but too small to move anything',
        'The system does move, slowly, until the field momentum is used up',
      ],
      answer: 0,
      why: {
        1: t`Field momentum is real: Feynman’s disk turns when it is released. In a static system it is balanced, not fictitious.`,
        2: 'Size is not the issue: a static isolated system cannot have a moving centre of energy, whatever the numbers.',
        3: 'An isolated static system’s centre of energy stays put; nothing moves.',
      },
      hints: ['In an electric field, the charges carrying a magnet’s current speed up on one side of their loop and slow down on the other.', 'Relativistically, their momentum does not average to zero round the loop.'],
      teach: 'In a static system, field momentum is cancelled by hidden mechanical momentum in magnetic dipoles — a relativistic effect that keeps the centre of energy at rest.',
      explain: t`In the charge’s field, the carriers of the magnet’s current gain energy on one side of each current loop and lose it on the other; relativistically their momentum $\gamma mv$ then fails to cancel round the loop, leaving a “hidden momentum” $\vec m\times\vec E/c^2$ — exactly minus the field’s. The total momentum of a static system is zero, as it must be. Angular momentum, as in Feynman’s disk, is a different matter: it really is stored in the field and released when the field changes.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §8.2.4, Ex. 8.4 and Ex. 12.12', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Feynman, Leighton and Sands, The Feynman Lectures on Physics, vol. II, §17-4: a paradox', url: 'https://www.feynmanlectures.caltech.edu/II_17.html' },
    { label: 'Feynman, Leighton and Sands, The Feynman Lectures on Physics, vol. II, §27-6: field momentum', url: 'https://www.feynmanlectures.caltech.edu/II_27.html' },
    { label: 'Beth, Mechanical detection and measurement of the angular momentum of light, Phys. Rev. 50, 115 (1936)', url: 'https://doi.org/10.1103/PhysRev.50.115' },
  ],
});
