// Angular momentum of systems: L = Σ r × p, dL/dt = Γ_ext when the internal
// forces are central (the strong third law); L splits into the orbit of the
// centre of mass plus the spin about it, and torque about the CM governs the
// spin even when the CM accelerates. Kepler's second law, a tossed wrench,
// a contracting tethered pair, a rolling wheel, reaction wheels and a binary.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { sci, r6, pl, gpic, seg, lab, distinct } from './_cm.js';

const t = String.raw;
const AU = 1.495978707e8;   // km

// the worked example: a spinning dumbbell whose centre drifts past the origin
const EX = (() => {
  const m = 2, d = 0.5, w = 3, V = 4, b = 2, M = 2 * m;
  const Lorb = -M * b * V, Lspin = 2 * m * d * d * w;
  return { m, d, w, V, b, M, Lorb, Lspin, L: Lorb + Lspin };
})();

// the dumbbell explore: masses 1 kg each, 0.5 m from the CM, which starts at x = −4 m
const D = 0.5;
const x1 = `(-4 + V*tm + ${D}*cos(w*tm))`, y1 = `(b + ${D}*sin(w*tm))`, x2 = `(-4 + V*tm - ${D}*cos(w*tm))`, y2 = `(b - ${D}*sin(w*tm))`;
const vx1 = `(V - ${D}*w*sin(w*tm))`, vy1 = `(${D}*w*cos(w*tm))`, vx2 = `(V + ${D}*w*sin(w*tm))`, vy2 = `(-${D}*w*cos(w*tm))`;

export default lesson({
  id: 'phys3550.M1.4',
  title: 'Angular momentum of systems',
  minutes: 15, difficulty: 3,
  intro: t`The angular momentum of a system about a point O is $\vec L = \sum\vec r_\alpha\times\vec p_\alpha$. Differentiate and the internal forces drop out — but only if each pair acts **along the line joining the particles** (the strong form of the third law), so that their torques cancel too. Then only external torques change $\vec L$. Two refinements make it useful. $\vec L$ splits into the centre of mass's orbit, $\vec R\times M\vec V$, plus the **spin** about the centre of mass. And $\dot{\vec L}_\text{cm} = \vec\Gamma_\text{cm}$ holds about the centre of mass even when it accelerates. This builds on [angular momentum](#/lesson/phys2210.M11.2) and [its conservation](#/lesson/phys2210.M11.3) in PHYS 2210.`,
  equation: t`\dot{\vec L} = \vec\Gamma_\text{ext}, \qquad \vec L = \vec R\times M\vec V + \vec L_\text{cm}`,
  symbols: [
    { tex: '\\vec L', text: 'total angular momentum about a fixed point O, $\\sum\\vec r_\\alpha\\times m_\\alpha\\dot{\\vec r}_\\alpha$, in kg·m²/s' },
    { tex: '\\vec\\Gamma_\\text{ext}', text: 'the total external torque about O, $\\sum\\vec r_\\alpha\\times\\vec F^\\text{ext}_\\alpha$, in N·m (Taylor writes $\\Gamma$; many books use $\\tau$)' },
    { tex: '\\vec R,\\ \\vec V,\\ M', text: 'the centre of mass’s position (m) and velocity (m/s), and the total mass (kg)' },
    { tex: '\\vec L_\\text{cm}', text: 'the **spin**: angular momentum about the centre of mass, measured with positions and velocities relative to it, in kg·m²/s' },
  ],
  why: t`Spacecraft attitude, Kepler's equal areas and every spinning rigid body (M7) run on $\dot{\vec L} = \vec\Gamma$ — and the spin–orbit split is how planets and binaries keep their books.`,
  visual: {
    type: 'graph',
    title: 'A spinning dumbbell drifting past the origin',
    lead: t`Two 1 kg masses on a light 1 m rod spin about their centre of mass while it drifts at speed $V$ along the line $y = b$. Slide the time: the readouts give $L_z$ about the origin O, computed directly from the two masses, and split into orbit and spin.`,
    tasks: [
      t`Move the time slider: the masses' own angular momenta change all the time, but the total stays fixed — no external torque.`,
      t`Set $b = 0$: the centre of mass passes through O, the orbital part vanishes, and only the spin is left.`,
      t`Reverse the spin by making $\omega$ negative: orbit and spin can add or cancel.`,
    ],
    params: {
      aspect: 'wide', x: [-5, 5], y: [-2.5, 3], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
      sliders: [
        { key: 'tm', label: 'Time $t$', min: 0, max: 8, step: 0.02, value: 2, unit: '\\mathrm{s}', explain: 'Seconds since the centre of mass passed x = −4 m.' },
        { key: 'V', label: 'Drift speed $V$', min: 0, max: 1, step: 0.05, value: 0.8, unit: '\\mathrm{m/s}', explain: 'Speed of the centre of mass, along +x.' },
        { key: 'b', label: 'Offset $b$', min: -1.5, max: 2, step: 0.1, value: 1.2, unit: '\\mathrm{m}', explain: 'How far the centre of mass’s line passes from O.' },
        { key: 'w', label: 'Spin $\\omega$', min: -3, max: 3, step: 0.1, value: 1.5, unit: '\\mathrm{rad/s}', explain: 'Angular velocity of the rod about the centre of mass (anticlockwise positive).' },
      ],
      curves: [{ param: [`-4 + V*t + ${D}*cos(w*t)`, `b + ${D}*sin(w*t)`], t: [0, 'tm'], color: 'accent', width: 1.2, dash: true }, { param: [`-4 + V*t - ${D}*cos(w*t)`, `b - ${D}*sin(w*t)`], t: [0, 'tm'], color: 'violet', width: 1.2, dash: true }, { param: [`${x1} + t*(${x2} - ${x1})`, `${y1} + t*(${y2} - ${y1})`], t: [0, 1], color: 'ink2', width: 2.5 }],
      hlines: [{ y: 'b', color: 'gold' }],
      points: [{ x: x1, y: y1, color: 'accent', r: 7, label: '1' }, { x: x2, y: y2, color: 'violet', r: 7, label: '2' }, { x: '-4 + V*tm', y: 'b', color: 'gold', r: 4 }, { x: 0, y: 0, color: 'ink', r: 4, label: 'O', labelDx: -16, labelDy: 10 }],
      arrows: [{ from: [x1, y1], to: [`${x1} + 0.4*${vx1}`, `${y1} + 0.4*${vy1}`], color: 'accent' }, { from: [x2, y2], to: [`${x2} + 0.4*${vx2}`, `${y2} + 0.4*${vy2}`], color: 'violet' }],
      readouts: [
        { label: 'L, mass 1', expr: `${x1}*${vy1} - ${y1}*${vx1}`, unit: '\\mathrm{kg\\,m^2/s}', digits: 3 },
        { label: 'L, mass 2', expr: `${x2}*${vy2} - ${y2}*${vx2}`, unit: '\\mathrm{kg\\,m^2/s}', digits: 3 },
        { label: 'total', expr: `${x1}*${vy1} - ${y1}*${vx1} + ${x2}*${vy2} - ${y2}*${vx2}`, unit: '\\mathrm{kg\\,m^2/s}', digits: 3 },
        { label: 'orbit −MbV', expr: '-2*b*V', unit: '\\mathrm{kg\\,m^2/s}', digits: 3 },
        { label: 'spin 2md²ω', expr: `2*${D * D}*w`, unit: '\\mathrm{kg\\,m^2/s}', digits: 3 },
      ],
    },
    caption: t`Free space, no external force: the centre of mass (gold) moves in a straight line at constant speed and the rod spins steadily. Velocity arrows to scale (0.4 m per m/s); dashed: each mass's path so far.`,
  },
  example: {
    prompt: t`Two ${EX.m}.0 kg masses on a light rod ${2 * EX.d}.0 m long spin at $\omega = ${EX.w}.0$ rad/s (anticlockwise) about their centre of mass, which moves at ${EX.V}.0 m/s in the $+x$ direction along the line $y = ${EX.b}.0$ m. Find their total angular momentum about the origin, and say how it changes in time.`,
    visual: gpic({
      x: [-3.5, 3.5], y: [-0.6, 3.2], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
      curves: [seg([-1.4 - 0.5 * Math.cos(0.6), 2 - 0.5 * Math.sin(0.6)], [-1.4 + 0.5 * Math.cos(0.6), 2 + 0.5 * Math.sin(0.6)], 'ink2', 2.5), seg([-3.5, 2], [3.5, 2], 'gold', 1, true)],
      points: [{ x: r6(-1.4 + 0.5 * Math.cos(0.6)), y: r6(2 + 0.5 * Math.sin(0.6)), color: 'accent', r: 7 }, { x: r6(-1.4 - 0.5 * Math.cos(0.6)), y: r6(2 - 0.5 * Math.sin(0.6)), color: 'accent', r: 7 }, { x: -1.4, y: 2, color: 'gold', r: 4, label: 'CM', labelDx: -8, labelDy: 16 }, { x: 0, y: 0, color: 'ink', r: 4, label: 'O', labelDx: -14, labelDy: 8 }],
      arrows: [{ from: [-1.4, 2], to: [0.2, 2], color: 'good', label: 'V', labelDx: 4, labelDy: -8 }],
    }, t`The dumbbell at one instant: centre of mass on the line $y = 2$ m (dashed), moving right. To scale except the velocity arrow.`, 'A spinning dumbbell whose centre moves along a line above the origin'),
    steps: [
      { label: 'Split the sum', text: t`Write $\vec r_\alpha = \vec R + \vec r'_\alpha$. Then $\vec L = \vec R\times M\vec V + \sum\vec r'_\alpha\times m_\alpha\dot{\vec r}'_\alpha$: the cross terms vanish because $\sum m_\alpha\vec r'_\alpha = 0$.` },
      { label: 'Orbital part', text: t`$\vec R = (X, ${EX.b})$, $M\vec V = (${EX.M}\times${EX.V}, 0)$: $L_z = X\cdot0 - ${EX.b}\times${EX.M * EX.V} = ${EX.Lorb}$ kg·m²/s — the same for every $X$, since the line's distance from O is fixed.` },
      { label: 'Spin part', text: t`Each mass is $d = ${EX.d}$ m from the centre, moving at $d\omega$ perpendicular to the rod: $L_\text{cm} = 2md^2\omega = 2(${EX.m})(${EX.d})^2(${EX.w}) = ${EX.Lspin}$ kg·m²/s.` },
      { label: 'Total', text: t`$L_z = ${EX.Lorb} + ${EX.Lspin} = ${EX.L}$ kg·m²/s: clockwise overall, though the rod spins anticlockwise.` },
      { label: 'In time', text: t`No external force, no torque: $\vec L$ is constant. Each part is constant on its own too — the centre moves in a straight line and nothing acts on the spin.` },
      { label: 'Sense check', text: t`Toss the dumbbell in uniform gravity instead: the orbital part changes ($\vec R\times M\vec g \ne 0$), but gravity acts at the centre of mass, so $\vec\Gamma_\text{cm} = 0$ and the spin stays $${EX.Lspin}$ kg·m²/s.` },
    ],
    answer: t`$L_z = -MbV + 2md^2\omega = ${EX.Lorb} + ${EX.Lspin} = ${EX.L}$ kg·m²/s, constant in time.`,
  },
  practice: [
    num({
      id: 'two-L', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1, 2, 3]), m2 = r.pick([1, 2, 4]);
        const P1 = [r.pick([1, 2, 3]), r.pick([-1, 1, 2])], V1 = [r.pick([-2, 1, 3]), r.pick([2, 4])];
        const P2 = [r.pick([-3, -2, -1]), r.pick([1, 2, 3])], V2 = [r.pick([1, 2, 4]), r.pick([-3, -1, 2])];
        let L1 = m1 * (P1[0] * V1[1] - P1[1] * V1[0]), L2 = m2 * (P2[0] * V2[1] - P2[1] * V2[0]);
        if (L1 + L2 === 0) { V2[0] += 1; L2 = m2 * (P2[0] * V2[1] - P2[1] * V2[0]); }      // never a zero answer
        const L = L1 + L2;
        const naive = m1 * Math.hypot(...P1) * Math.hypot(...V1) + m2 * Math.hypot(...P2) * Math.hypot(...V2);
        return {
          prompt: t`Particle 1 (${m1} kg) is at $(${P1[0]},\ ${P1[1]})$ m with velocity $(${V1[0]},\ ${V1[1]})$ m/s; particle 2 (${m2} kg) is at $(${P2[0]},\ ${P2[1]})$ m with velocity $(${V2[0]},\ ${V2[1]})$ m/s. What is the $z$-component of their total angular momentum about the origin?`,
          answer: L, units: 'kg m^2/s', tol: { rel: 0.01, abs: 0.01 },
          errors: distinct([{ value: naive, feedback: t`$|\vec r||\vec p|$ ignores the angle between them: use $L_z = m(xv_y - yv_x)$.` }, { value: -L, feedback: t`Sign: $L_z = xp_y - yp_x$, not $yp_x - xp_y$.` }], L),
          hints: [t`For each particle $L_z = m(xv_y - yv_x)$.`, t`Add the two: angular momenta about the same point add like any other $z$-components.`],
          teach: t`Angular momentum about a point adds over particles; in the plane $L_z = m(xv_y - yv_x)$.`,
          explain: t`$L_1 = ${m1}\big((${P1[0]})(${V1[1]}) - (${P1[1]})(${V1[0]})\big) = ${L1}$ and $L_2 = ${m2}\big((${P2[0]})(${V2[1]}) - (${P2[1]})(${V2[0]})\big) = ${L2}$, so $L_z = ${L}$ kg·m²/s.`,
          visual: gpic({
            x: [-6, 6], y: [-4, 6], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
            points: [{ x: P1[0], y: P1[1], color: 'accent', r: 6, label: '1' }, { x: P2[0], y: P2[1], color: 'violet', r: 6, label: '2' }, { x: 0, y: 0, color: 'ink', r: 3.5, label: 'O', labelDx: -14, labelDy: 8 }],
            arrows: [{ from: P1, to: [P1[0] + 0.5 * V1[0], P1[1] + 0.5 * V1[1]], color: 'accent' }, { from: P2, to: [P2[0] + 0.5 * V2[0], P2[1] + 0.5 * V2[1]], color: 'violet' }],
            curves: [seg([0, 0], P1, 'ink3', 1, true), seg([0, 0], P2, 'ink3', 1, true)],
          }, t`The two particles, their position vectors (dashed) and velocities (0.5 m per m/s).`, 'Two particles with velocity arrows'),
        };
      },
    }),
    mcq({
      id: 'strong', difficulty: 2,
      prompt: t`The internal torques of a system cancel in pairs, $\vec r_1\times\vec F_{12} + \vec r_2\times\vec F_{21} = 0$, provided what?`,
      visual: gpic({
        x: [-3, 3], y: [-1.4, 1.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [seg([-1.8, 0.2], [1.6, 0.8], 'ink4', 1, true)],
        points: [{ x: -1.8, y: 0.2, color: 'accent', r: 7, label: '1', labelDx: -14 }, { x: 1.6, y: 0.8, color: 'accent', r: 7, label: '2', labelDx: 10 }, { x: 0, y: -1.1, color: 'ink', r: 3.5, label: 'O', labelDx: 8 }],
        arrows: [{ from: [-1.8, 0.2], to: [-0.8, 0.376], color: 'good', label: 'F₁₂', labelDx: -4, labelDy: -12 }, { from: [1.6, 0.8], to: [0.6, 0.624], color: 'good', label: 'F₂₁', labelDx: -10, labelDy: -12 }],
      }, t`A pair of internal forces acting along the line joining the particles (dashed).`, 'Two particles pulling on each other along the line joining them'),
      choices: [
        t`The forces are equal and opposite **and** act along the line joining the particles`,
        t`The forces are equal and opposite — that is all`,
        t`The particles are at equal distances from O`,
        t`The system is rigid`,
      ],
      answer: 0,
      why: {
        1: t`Equal and opposite but offset forces form a **couple**, whose torque is not zero. The sum is $(\vec r_1 - \vec r_2)\times\vec F_{12}$, which vanishes only when $\vec F_{12}$ is parallel to $\vec r_1 - \vec r_2$.`,
        2: t`The pair's torque does not depend on where O is; its distances from the particles are irrelevant.`,
        3: t`Rigidity is not required: a cloud of gas or a planetary system conserves angular momentum too, if its forces are central.`,
      },
      hints: [t`Use $\vec F_{21} = -\vec F_{12}$ and simplify $\vec r_1\times\vec F_{12} + \vec r_2\times\vec F_{21}$.`],
      teach: t`Momentum needs only the weak third law; angular momentum needs the strong one: internal forces along the line between the particles.`,
      explain: t`The sum is $(\vec r_1 - \vec r_2)\times\vec F_{12}$, zero exactly when the force lies along $\vec r_1 - \vec r_2$. Gravity, springs and contact forces between smooth bodies qualify. (Magnetic forces between moving charges need not, which is resolved by the field's own momentum.)`,
    }),
    num({
      id: 'areal', difficulty: 2,
      gen(r) {
        const [name, rp, vp, unit] = r.pick([['Halley’s comet', 0.586 * AU, 54.55, 'its perihelion, 0.586 AU from the Sun'], ['Mercury', 46.0e6, 58.98, 'perihelion, 46.0 million km from the Sun'], ['the ISS', 6778, 7.66, 'a near-circular orbit 6778 km from Earth’s centre']]);
        const dA = 0.5 * rp * vp;
        return {
          prompt: t`${name.charAt(0).toUpperCase() + name.slice(1)} moves at ${vp} km/s at ${unit}, where its velocity is perpendicular to the radius. At what rate does the line from the central body to it sweep out area? Give km²/s.`,
          answer: dA, units: 'km^2/s', tol: { rel: 0.01 },
          errors: [{ value: rp * vp, feedback: t`The swept region is a thin triangle: $dA = \tfrac12 r\,(v\,dt)$. Keep the $\tfrac12$.` }],
          hints: [t`In time $dt$ the radius sweeps a thin triangle of base $r$ and height $v_\perp\,dt$.`, t`$\dfrac{dA}{dt} = \tfrac12 rv_\perp = \dfrac{L}{2m}$.`],
          teach: t`Kepler's second law is conservation of angular momentum: $dA/dt = L/2m$ is the same all round the orbit.`,
          explain: t`$\dfrac{dA}{dt} = \tfrac12 r v_\perp = \tfrac12(${sci(rp, 4)}\ \text{km})(${vp}\ \text{km/s}) = ${sci(dA)}$ km²/s, the same at every point of the orbit, because the Sun's (or Earth's) pull is central.`,
          visual: { type: 'calc-polar', params: { x: [-3.2, 1.6], y: [-1.5, 1.5], grid: 'none', kepler: { e: 0.6, p: 0.64, n: 8, at: 0.3, play: false } }, caption: t`Equal areas in equal times on a sample orbit (eccentricity 0.6, not ${name}'s): each sector takes the same time to sweep.` },
        };
      },
    }),
    mcq({
      id: 'wrench', difficulty: 2,
      prompt: t`A wrench is thrown spinning across a room. Ignoring air, what happens to its spin rate about its centre of mass while it flies?`,
      visual: gpic({
        x: [0, 10], y: [0, 4.5], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
        curves: [{ fn: '1 + 1.2*x - 0.13*x^2', color: 'gold', width: 1.4, dash: true, domain: [0, 10] }, ...[1.5, 4.5, 7.5].map((x, i) => { const y = 1 + 1.2 * x - 0.13 * x * x, a = 0.4 + 1.9 * i; return seg([x - 0.55 * Math.cos(a), y - 0.55 * Math.sin(a)], [x + 0.55 * Math.cos(a), y + 0.55 * Math.sin(a)], 'accent', 4); })],
        points: [1.5, 4.5, 7.5].map((x) => ({ x, y: r6(1 + 1.2 * x - 0.13 * x * x), color: 'gold', r: 3.5 })),
      }, t`Three snapshots of the wrench at equal time intervals: its centre of mass (gold) follows a parabola while it turns.`, 'A spinning wrench at three points along a parabolic flight'),
      choices: ['It stays constant: gravity exerts no torque about the centre of mass', 'It slows down, because gravity pulls the handle down', 'It speeds up on the way down as the wrench gains speed', 'It changes, because the centre of mass accelerates, so the CM frame is not inertial'],
      answer: 0,
      why: { 1: 'Uniform gravity acts on every part in proportion to its mass, which is the same as one force at the centre of mass: zero lever arm about it.', 2: 'The centre of mass speeds up and slows down, but that is the orbital part of the motion; the spin is a separate account.', 3: t`$\dot{\vec L}_\text{cm} = \vec\Gamma_\text{cm}$ holds even when the centre of mass accelerates — a special property of the CM.` },
      hints: [t`Where does uniform gravity effectively act, and what is its torque about that point?`],
      teach: t`About the centre of mass, $\dot{\vec L}_\text{cm} = \vec\Gamma_\text{cm}$ even in an accelerating CM; uniform gravity gives $\vec\Gamma_\text{cm} = 0$.`,
      explain: t`Gravity's total torque about the centre of mass is $\sum\vec r'_\alpha\times m_\alpha\vec g = (\sum m_\alpha\vec r'_\alpha)\times\vec g = 0$. So $\vec L_\text{cm}$ — and, for a rigid body turning about a fixed axis through its CM, the spin rate — is constant. Divers and astronauts use the same fact.`,
    }),
    num({
      id: 'pull-in', difficulty: 3,
      gen(r) {
        const m = r.pick([5, 10, 20]), r1 = r.pick([10, 20, 30]), w1 = r.pick([0.2, 0.5, 1.0]), f = r.pick([2, 3]);
        const r2 = r1 / f, w2 = w1 * f * f;
        const K1 = m * r1 * r1 * w1 * w1, K2 = m * r2 * r2 * w2 * w2, W = K2 - K1;
        return {
          prompt: t`Two ${m} kg satellites joined by a tether spin about their common centre, each $${r1}$ m from it, at ${w1} rad/s. A winch on one reels in the tether until each is $${sci(r2, 3)}$ m from the centre. How much work does the winch do? (Free space; treat them as particles.)`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: m * r2 * r2 * w1 * w1 - K1, feedback: t`The spin rate does not stay at ${w1} rad/s: with no external torque, $L = 2mr^2\omega$ is fixed, so $\omega \propto 1/r^2$.` }, { value: 0, feedback: 'The winch pulls inward while each satellite moves inward: it does positive work, and the kinetic energy rises.' }],
          hints: [t`Angular momentum $2mr^2\omega$ is conserved: the tether's forces are internal and central.`, t`$\omega_2 = \omega_1(r_1/r_2)^2$; the work equals the change in kinetic energy $2\cdot\tfrac12m r^2\omega^2$.`],
          teach: t`Internal central forces conserve $\vec L$ but not kinetic energy: pulling inward spins a system up, and the puller does the work.`,
          explain: t`$\omega_2 = ${w1}\times${f}^2 = ${sci(w2)}$ rad/s. $K = mr^2\omega^2$ for the pair: $K_1 = ${sci(K1)}$ J, $K_2 = ${sci(K2)}$ J, so the winch does $${sci(W)}$ J — $K$ grows by a factor $(r_1/r_2)^2 = ${f * f}$.`,
          visual: gpic({
            x: [-1.6 * r1, 1.6 * r1], y: [-0.9 * r1, 0.9 * r1], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
            curves: [seg([-r1, 0], [r1, 0], 'ink3', 1.6), { param: [`${r1}*cos(t)`, `${r1}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }, { param: [`${r6(r2)}*cos(t)`, `${r6(r2)}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }],
            points: [{ x: r1, y: 0, color: 'accent', r: 6 }, { x: -r1, y: 0, color: 'accent', r: 6 }, { x: 0, y: 0, color: 'gold', r: 3, label: 'centre', labelDx: -20, labelDy: 14 }],
            arrows: [{ from: [r1, 0], to: [r1, 0.5 * r1], color: 'good', label: 'v' }, { from: [-r1, 0], to: [-r1, -0.5 * r1], color: 'good' }],
          }, t`The pair at the start, on the outer dashed circle; the inner circle is where the winch stops. Not to scale in time.`, 'Two satellites on a tether spinning about their centre'),
        };
      },
    }),
    num({
      id: 'rolling', difficulty: 3,
      gen(r) {
        const [shape, k] = r.pick([['hoop', 1], ['uniform disk', 0.5]]), M = r.pick([2, 5, 8]), a = r.pick([0.3, 0.4, 0.5]), v = r.pick([2, 3, 4]);
        const L = M * a * v * (1 + k);
        return {
          prompt: t`A ${shape} of mass ${M} kg and radius ${a} m rolls without slipping to the right at ${v} m/s along level ground. What is the magnitude of its angular momentum about a fixed point O on the ground?`,
          answer: L, units: 'kg m^2/s', tol: { rel: 0.01 },
          errors: [{ value: M * a * v, feedback: t`That is only the orbital part $\vec R\times M\vec V$. The wheel also spins about its centre: add $I_\text{cm}\omega$.` }, { value: k * M * a * v, feedback: t`That is only the spin $I_\text{cm}\omega$. The centre of mass also moves past O at height $a$: add $MaV$.` }, ...(k === 1 ? [] : [{ value: M * a * v * (1 - k), feedback: t`Rolling to the right turns the wheel clockwise, and so does its centre's motion past O: the two parts add, they do not cancel.` }])].filter((e, i, all) => e.value > 0 && all.findIndex((f) => Math.abs(f.value - e.value) < 1e-9) === i),
          hints: [t`$\vec L = \vec R\times M\vec V + I_\text{cm}\vec\omega$. The centre is at height $a$ moving at $v$; the wheel turns at $\omega = v/a$.`, t`Both parts point into the page (clockwise). $I_\text{cm} = ${k === 1 ? 'Ma^2' : '\\tfrac12Ma^2'}$.`],
          teach: t`Orbit plus spin: a rolling wheel's angular momentum about a point on the ground is $Mav + I_\text{cm}v/a$.`,
          explain: t`Orbital part: $MaV = ${M}(${a})(${v}) = ${sci(M * a * v)}$; spin: $I_\text{cm}\omega = ${k === 1 ? '' : '\\tfrac12'}Ma^2(v/a) = ${sci(k * M * a * v)}$; both clockwise, so $|L| = ${sci(L)}$ kg·m²/s — the same about every point on the ground.`,
          visual: gpic({
            x: [-2.4, 2.8], y: [-0.3, 1.6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
            curves: [seg([-2.4, 0], [2.8, 0], 'ink2', 2), { param: ['0.6 + 0.6*cos(t)', '0.6 + 0.6*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.4 }, { param: ['0.6 + 0.3*cos(t)', '0.6 + 0.3*sin(t)'], t: [0.4, 2.4], color: 'violet', width: 1.4 }],
            points: [{ x: 0.6, y: 0.6, color: 'gold', r: 3.5 }, { x: -1.8, y: 0, color: 'ink', r: 4, label: 'O', labelDx: -6, labelDy: 14 }],
            arrows: [{ from: [0.6, 0.6], to: [1.7, 0.6], color: 'good', label: 'v', labelDx: 4, labelDy: -6 }, { from: [0.6 + 0.3 * Math.cos(0.6), 0.6 + 0.3 * Math.sin(0.6)], to: [0.6 + 0.3 * Math.cos(0.4), 0.6 + 0.3 * Math.sin(0.4)], color: 'violet' }],
          }, t`The ${shape} rolling right; it turns clockwise (violet). O is a fixed point on the ground. Not to scale.`, 'A wheel rolling along the ground with a fixed point marked'),
        };
      },
    }),
    order({
      id: 'derive', difficulty: 2,
      prompt: t`Order the steps that prove $\dot{\vec L} = \vec\Gamma_\text{ext}$ for a system of particles.`,
      visual: gpic({
        x: [-3, 3], y: [-1.4, 1.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [seg([-1.8, 0.2], [1.6, 0.8], 'ink4', 1, true)],
        points: [{ x: -1.8, y: 0.2, color: 'accent', r: 7, label: 'α', labelDx: -14 }, { x: 1.6, y: 0.8, color: 'accent', r: 7, label: 'β', labelDx: 10 }, { x: 0, y: -1.1, color: 'ink', r: 3.5, label: 'O', labelDx: 8 }],
        arrows: [{ from: [-1.8, 0.2], to: [-0.8, 0.376], color: 'good' }, { from: [1.6, 0.8], to: [0.6, 0.624], color: 'good' }, { from: [-1.8, 0.2], to: [-1.8, -0.7], color: 'warn', label: 'external', labelDx: 6 }],
      }, t`Two of the particles: an internal pair along the line joining them (green), and an external force on one (orange).`, 'Two particles with internal and external forces'),
      items: [
        t`Differentiate: $\dot{\vec L} = \sum(\dot{\vec r}_\alpha\times\vec p_\alpha + \vec r_\alpha\times\dot{\vec p}_\alpha)$.`,
        t`The first term vanishes: $\dot{\vec r}_\alpha\times m_\alpha\dot{\vec r}_\alpha = 0$.`,
        t`Use the second law: $\dot{\vec p}_\alpha = \vec F^\text{ext}_\alpha + \sum_\beta\vec F_{\alpha\beta}$.`,
        t`Group internal torques in pairs: $(\vec r_\alpha - \vec r_\beta)\times\vec F_{\alpha\beta}$.`,
        t`Central forces make each pair zero, leaving $\sum\vec r_\alpha\times\vec F^\text{ext}_\alpha = \vec\Gamma_\text{ext}$.`,
      ],
      hints: [t`Start from the definition $\vec L = \sum\vec r_\alpha\times\vec p_\alpha$ and the product rule.`, t`The third law enters only after the second law has brought the forces in.`],
      teach: t`Product rule, second law, then the strong third law: the same three moves as for momentum, plus one more condition.`,
      explain: t`The proof needs both halves of the strong third law: equal and opposite (to pair the terms) and along the joining line (to kill $(\vec r_\alpha - \vec r_\beta)\times\vec F_{\alpha\beta}$).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-wheel', difficulty: 2, transfer: true,
      gen(r) {
        const Is = r.pick([800, 1200, 2000]), Iw = r.pick([0.05, 0.08, 0.12]), rpm = r.pick([2000, 3000, 4000]);
        const ww = (rpm * 2 * Math.PI) / 60, ws = (Iw * ww) / Is, degs = (ws * 180) / Math.PI;
        return {
          prompt: t`A spacecraft (moment of inertia $${sci(Is, 4)}$ kg·m² about its axis, wheel excluded) holds a reaction wheel ($I_w = ${Iw}$ kg·m²) on the same axis. Both start at rest; the wheel is spun up to ${rpm} rpm. How fast does the spacecraft turn, in degrees per second?`,
          answer: degs, units: 'deg/s', tol: { rel: 0.01 },
          errors: [{ value: ws, feedback: t`That is in rad/s; convert to degrees per second.` }, { value: (Iw * rpm) / Is, feedback: t`Convert rpm to rad/s first: $\omega = 2\pi\times\text{rpm}/60$.` }],
          hints: [t`The motor's torque on the wheel and the wheel's on the craft are internal: total $L$ stays 0.`, t`$I_w\omega_w + I_s\omega_s = 0$, with $\omega_w = 2\pi\times${rpm}/60$ rad/s.`],
          teach: t`A reaction wheel changes a spacecraft's attitude without any external torque: the body turns the opposite way so that $L$ stays zero.`,
          explain: t`$\omega_w = ${sci(ww, 4)}$ rad/s, so $\omega_s = -I_w\omega_w/I_s = -${sci(ws)}$ rad/s, about $${sci(degs)}^\circ$/s the other way. Stopping the wheel stops the turn — how telescopes like Hubble are pointed.`,
          visual: gpic({
            x: [-2.6, 2.6], y: [-1.5, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [seg([-1.6, -1], [1.6, -1], 'ink2', 2.4), seg([1.6, -1], [1.6, 1], 'ink2', 2.4), seg([1.6, 1], [-1.6, 1], 'ink2', 2.4), seg([-1.6, 1], [-1.6, -1], 'ink2', 2.4), { param: ['0.5*cos(t)', '0.5*sin(t)'], t: [0, 6.2832], color: 'accent', width: 3 }, { param: ['0.75*cos(t)', '0.75*sin(t)'], t: [0.3, 2.2], color: 'accent', width: 1.4 }, { param: ['2.0*cos(t)', '1.35*sin(t)'], t: [3.5, 5.6], color: 'warn', width: 1.4 }],
            arrows: [{ from: [0.75 * Math.cos(2.0), 0.75 * Math.sin(2.0)], to: [0.75 * Math.cos(2.2), 0.75 * Math.sin(2.2)], color: 'accent', label: 'wheel', labelDx: -30, labelDy: -10 }, { from: [2.0 * Math.cos(5.4), 1.35 * Math.sin(5.4)], to: [2.0 * Math.cos(5.6), 1.35 * Math.sin(5.6)], color: 'warn', label: 'craft', labelDx: 6, labelDy: 8 }],
          }, t`The craft (box) and its wheel (blue), seen along their common axis: the wheel spins one way, the body turns slowly the other.`, 'A spacecraft body and a reaction wheel turning opposite ways'),
        };
      },
    }),
    num({
      id: 'cp-binary', difficulty: 3, transfer: true,
      gen(r) {
        const [name, m1, m2, a, Pd] = r.pick([['Pluto and Charon', 1.303e22, 1.586e21, 1.9596e7, 6.387], ['Earth and the Moon', 5.972e24, 7.342e22, 3.844e8, 27.32]]);
        const w = (2 * Math.PI) / (Pd * 86400), M = m1 + m2;
        const L = ((m1 * m2) / M) * a * a * w;
        return {
          prompt: t`${name} circle their common centre of mass once every ${Pd} days, $${sci(a / 1e3, 4)}$ km apart (masses $${sci(m1, 4)}$ kg and $${sci(m2, 4)}$ kg). Treating both as particles in circular orbits, what is their total **orbital** angular momentum about the centre of mass? Give the number in units of $10^{30}$ kg·m²/s.`,
          answer: L / 1e30, tol: { rel: 0.01 },
          errors: [{ value: (m2 * a * a * w) / 1e30, feedback: t`That puts the lighter body at distance $a$ from a fixed heavier one. Both circle the centre of mass: $r_1 = am_2/M$, $r_2 = am_1/M$.` }],
          hints: [t`The centre of mass sits at $r_1 = a\,m_2/M$ from body 1 and $r_2 = a\,m_1/M$ from body 2; both turn at $\omega = 2\pi/T$.`, t`$L = (m_1r_1^2 + m_2r_2^2)\,\omega = \dfrac{m_1m_2}{M}a^2\omega$.`],
          teach: t`About the centre of mass, a pair's orbital angular momentum is $\mu a^2\omega$ with the reduced mass $\mu = m_1m_2/(m_1 + m_2)$ — the start of the two-body problem (M5).`,
          explain: t`$\omega = 2\pi/(${Pd}\times86\,400\ \text{s}) = ${sci(w)}$ rad/s and $\mu = m_1m_2/M = ${sci((m1 * m2) / M)}$ kg, so $L = \mu a^2\omega = ${sci(L)}$ kg·m²/s.`,
          visual: gpic({
            x: [-1.4, 1.4], y: [-1, 1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [{ param: [`${r6(m2 / M)}*cos(t)`, `${r6(m2 / M)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1, dash: true }, { param: [`${r6(m1 / M)}*cos(t)`, `${r6(m1 / M)}*sin(t)`], t: [0, 6.2832], color: 'violet', width: 1, dash: true }, seg([-r6(m2 / M), 0], [r6(m1 / M), 0], 'ink4', 1)],
            points: [{ x: -r6(m2 / M), y: 0, color: 'accent', r: 9 }, { x: r6(m1 / M), y: 0, color: 'violet', r: 5 }, { x: 0, y: 0, color: 'gold', r: 3, label: 'CM', labelDx: -8, labelDy: 14 }],
          }, t`Both bodies circle the centre of mass (gold) on opposite sides; distances to scale with the separation set to 1. Dot sizes are not to scale.`, 'Two bodies orbiting their common centre of mass'),
        };
      },
    }),
    mcq({
      id: 'cp-orbit-spin', difficulty: 2,
      prompt: t`An asteroid tumbles as it orbits the Sun. Treating the Sun's gravity on it as uniform across the asteroid, which statement is right?`,
      visual: { type: 'calc-polar', params: { x: [-3.2, 1.6], y: [-1.5, 1.5], grid: 'none', kepler: { e: 0.6, p: 0.64, n: 8, at: 0.3, play: false } }, caption: t`A sample Keplerian orbit with equal-time sectors; the asteroid's tumbling is too small to draw.` },
      choices: [
        t`Its orbital angular momentum about the Sun and its spin about its own centre are each conserved separately`,
        t`Only the total is conserved; spin and orbit trade angular momentum all the time`,
        t`Neither is conserved, because the Sun's force is not constant`,
        t`The spin is conserved, but the orbital part is not, because the asteroid accelerates`,
      ],
      answer: 0,
      why: {
        1: t`Trading needs a torque about the centre of mass, and a uniform field gives none. (Real gravity is slightly non-uniform: tidal torques do trade them, very slowly — which is how the Moon came to keep one face to Earth.)`,
        2: t`A force that changes in size and direction can still be central: it exerts no torque about the Sun.`,
        3: t`Acceleration is not torque: the Sun's pull points at the Sun, so it has no torque about the Sun and $\vec R\times M\vec V$ stays fixed.`,
      },
      hints: [t`Find the torque about the Sun on the orbital part, and about the asteroid's centre of mass on the spin.`],
      teach: t`Torque about the Sun is zero for a central force; torque about the centre of mass is zero for uniform gravity — so orbit and spin are separately conserved.`,
      explain: t`$\dot{\vec L}_\text{orbit} = \vec R\times\vec F = 0$ for a central force, and $\dot{\vec L}_\text{cm} = \vec\Gamma_\text{cm} = 0$ for a uniform field. Only the small non-uniformity of real gravity — tides — couples them.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 3: angular momentum of several particles', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'NASA Space Science Data Coordinated Archive: Pluto and Moon fact sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html' },
  ],
});
