// Conservation of angular momentum: with no net external torque, L stays
// constant — the skater, the collapsing star, the putty and the pivot, and
// Kepler's second law, which is the same law for a planet.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { presetOrbit, stateAt, AU } from '../../src/viz/model/mech-kepler.js';
import { circle, line, disk } from './_spin.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);

// a skater seen from above: arms out (dashed, before) and in (solid, after)
function skaterPicture({ r1 = 0.9, r2 = 0.3, caption, labels = true } = {}) {
  const arm = (r, ang, color, width, dash) => line([0.18 * Math.cos(ang), 0.18 * Math.sin(ang)], [r * Math.cos(ang), r * Math.sin(ang)], color, width, dash);
  return {
    type: 'graph',
    params: {
      x: [-1.6, 1.6], y: [-1.1, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      alt: 'A skater seen from above with arms out and arms in',
      shade: [disk(0, 0, 0.18, 'accent', 0.5)],
      curves: [
        arm(r1, 0, 'ink3', 1.6, true), arm(r1, Math.PI, 'ink3', 1.6, true),
        arm(r2, 0.6, 'accent', 3, false), arm(r2, 0.6 + Math.PI, 'accent', 3, false),
        { param: ['0.95cos(t)', '0.95sin(t)'], t: [0.9, 2.2], color: 'warn', width: 1.8 },
      ],
      arrows: [{ from: [r4(0.95 * Math.cos(1.9)), r4(0.95 * Math.sin(1.9))], to: [r4(0.95 * Math.cos(2.3)), r4(0.95 * Math.sin(2.3))], color: 'warn', label: 'ω', labelDx: -18 }],
      points: [
        { x: r1, y: 0, color: 'ink3', r: 5 }, { x: -r1, y: 0, color: 'ink3', r: 5 },
        { x: r4(r2 * Math.cos(0.6)), y: r4(r2 * Math.sin(0.6)), color: 'accent', r: 5 }, { x: r4(-r2 * Math.cos(0.6)), y: r4(-r2 * Math.sin(0.6)), color: 'accent', r: 5 },
        ...(labels ? [{ x: r1, y: 0, r: 0.01, color: 'ink3', label: 'arms out (before)', labelDy: 16, labelDx: -50 }, { x: 0.25, y: -0.45, r: 0.01, color: 'accent', label: 'arms in (after)' }] : []),
      ],
    },
    caption: caption ?? 'Seen from above. Dashed: arms out, before; solid: arms pulled in, after. A sketch, not to scale.',
  };
}

// a diver: the centre of mass follows a parabola while the body turns
const diverPicture = (() => {
  const X = (tt) => 1.3 * tt, Y = (tt) => 3 + 4.4 * tt - 4.9 * tt * tt;
  const curves = [{ param: ['1.3t', '3 + 4.4t - 4.9t^2'], t: [0, 1.35], color: 'ink3', width: 1.2, dash: true }, line([-1.4, 3], [0, 3], 'ink2', 3), { fn: '0', color: 'teal', width: 2 }];
  for (const tt of [0.05, 0.35, 0.65, 0.95, 1.25]) {
    const a = 1.4 + 3.2 * tt, cx = X(tt), cy = Y(tt), h = 0.42;
    curves.push(line([cx - h * Math.cos(a), cy - h * Math.sin(a)], [cx + h * Math.cos(a), cy + h * Math.sin(a)], 'accent', 3));
  }
  return {
    type: 'graph',
    params: {
      x: [-1.6, 2.6], y: [-0.3, 4.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      alt: 'A diver tumbling through the air', curves,
      arrows: [{ from: [r4(X(0.65)), r4(Y(0.65))], to: [r4(X(0.65)), r4(Y(0.65) - 0.9)], color: 'ink2', label: 'Mg' }],
      points: [{ x: r4(X(0.65)), y: r4(Y(0.65)), color: 'gold', r: 4 }, { x: -0.7, y: 3, r: 0.01, color: 'ink2', label: 'board', labelDy: -12 }],
    },
    caption: 'A diver after leaving the board: the centre of mass (dashed) follows a parabola while the body turns. Gravity acts at the centre of mass.',
  };
})();

// putty hitting the free end of a pivoted rod, seen from above
const puttyPicture = (Lr, labels = true) => ({
  type: 'graph',
  params: {
    x: [r4(-0.4 * Lr), r4(1.5 * Lr)], y: [r4(-0.75 * Lr), r4(0.45 * Lr)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
    alt: 'A rod pivoted at one end and a ball of putty about to hit its other end',
    curves: [line([0, 0], [Lr, 0], 'accent', 5)],
    arrows: [{ from: [Lr, r4(-0.6 * Lr)], to: [Lr, r4(-0.25 * Lr)], color: 'gold', label: labels ? 'v' : '' }],
    points: [{ x: 0, y: 0, color: 'ink', r: 6, label: 'pivot', labelDy: 14, labelDx: -14 }, { x: Lr, y: r4(-0.6 * Lr), color: 'warn', r: 6, label: labels ? 'putty' : '', labelDx: 10, labelDy: 4 }],
  },
  caption: 'Seen from above, on a frictionless table. The putty moves perpendicular to the rod and sticks to its end.',
});

// a rotating platform with a child stepping onto its rim, seen from above
const platformPicture = (R) => ({
  type: 'graph',
  params: {
    x: [r4(-1.7 * R), r4(1.9 * R)], y: [r4(-1.25 * R), r4(1.3 * R)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
    alt: 'A rotating platform seen from above, with a child at its rim',
    shade: [disk(0, 0, R, 'accent', 0.22)],
    curves: [circle(0, 0, R, 'accent', 2), { param: [`${r4(1.15 * R)}cos(t)`, `${r4(1.15 * R)}sin(t)`], t: [0.4, 1.4], color: 'warn', width: 1.8 }],
    arrows: [{ from: [r4(1.15 * R * Math.cos(1.2)), r4(1.15 * R * Math.sin(1.2))], to: [r4(1.15 * R * Math.cos(1.5)), r4(1.15 * R * Math.sin(1.5))], color: 'warn', label: 'ω', labelDx: -18 }],
    points: [{ x: 0, y: 0, color: 'ink2', r: 3 }, { x: R, y: 0, color: 'gold', r: 7, label: 'child', labelDx: 10, labelDy: 4 }],
  },
  caption: 'The platform from above. The child steps on at the rim, moving with no sideways speed.',
});

// apsides of real orbits, from the same model the simulation uses
const APSIDES = ['mercury', 'earth', 'moon'].map((key) => {
  const o = presetOrbit(key), vp = stateAt(o, 0).v, va = stateAt(o, o.T / 2).v;
  return { key, o, vp, va };
});
const NAMES = { mercury: ['Mercury', 'the Sun', 'perihelion', 'aphelion'], earth: ['Earth', 'the Sun', 'perihelion', 'aphelion'], moon: ['The Moon', 'Earth', 'perigee', 'apogee'] };
const km = (m) => Math.round(m / 1e3).toLocaleString('en-US').replace(/,/g, '{,}');
const mkm = (m) => (m / 1e9).toFixed(1);                                        // millions of km

const EX = { I1: 3.0, I2: 1.0, f1: 1.5 };
EX.f2 = (EX.f1 * EX.I1) / EX.I2;
EX.K1 = 0.5 * EX.I1 * (2 * Math.PI * EX.f1) ** 2;
EX.K2 = 0.5 * EX.I2 * (2 * Math.PI * EX.f2) ** 2;

export default lesson({
  id: 'phys2210.M11.3',
  title: 'Conservation of angular momentum',
  minutes: 11, difficulty: 3,
  intro: t`Torque is what changes angular momentum. So when the **net external torque** on a system is zero, its angular momentum cannot change, however its parts rearrange themselves:

$$\vec\tau_\text{ext} = 0 \;\Longrightarrow\; \vec L = \text{constant},\qquad I_1\omega_1 = I_2\omega_2$$

A skater pulling in her arms, a diver tucking, a collapsing star spinning up into a pulsar, a planet speeding up as it nears the Sun — one law covers them all. **The condition is the whole point**: an axle's friction, a motor or an off-centre thruster supplies torque, and then $\vec L$ changes.`,
  symbols: [
    { tex: '\\vec\\tau_\\text{ext}', text: 'the net torque from outside the system, about the point (or axis) you measure $\\vec L$ from, in N·m — forces between the system’s own parts cancel in pairs' },
    { tex: '\\vec L', text: 'the system’s total angular momentum about that point, in kg·m²/s' },
    { tex: 'I_1,\\ \\omega_1', text: 'moment of inertia (kg·m²) and angular speed (rad/s) before the change' },
    { tex: 'I_2,\\ \\omega_2', text: 'the same, after: if $I$ shrinks, $\\omega$ grows in proportion' },
  ],
  why: 'It is one of physics’ three great conservation laws (with energy and momentum): it explains why pulsars spin hundreds of times a second, why planets obey Kepler’s second law, and how a spacecraft can turn without any propellant.',
  visual: {
    type: 'mech-kepler',
    title: 'Equal areas: a planet’s angular momentum at work',
    lead: t`Gravity pulls each body straight toward the central mass, so about that mass it exerts **no torque**: $\vec r\times\vec v$ cannot change. Watch the last readout while the body swings in and out.`,
    tasks: [
      'Choose Halley’s comet: it crawls far out and whips round the Sun, yet |r × v| in the readout never changes.',
      'Each coloured sector takes the same time to sweep, and all have the same area — Kepler’s second law is conservation of angular momentum.',
      'Pause at the closest and the farthest points and multiply r by v: the products agree, because there the velocity is perpendicular to r.',
    ],
    params: { presets: ['halley', 'mercury', 's2', 'gto', 'moon'], preset: 'halley', readout: ['r', 'v', 'h'], autoplay: true, orbitSeconds: 10, t: 0.03 },
  },
  example: {
    prompt: t`A figure skater spins at ${EX.f1} revolutions per second with her arms out ($I_1 = ${EX.I1.toFixed(1)}\ \text{kg·m}^2$). She pulls her arms in, cutting her moment of inertia to $I_2 = ${EX.I2.toFixed(1)}\ \text{kg·m}^2$. How fast does she spin now, and what happens to her kinetic energy?`,
    visual: skaterPicture(),
    steps: [
      { label: 'Is L conserved?', text: t`The ice pushes up and gravity pulls down, both along the vertical spin axis: no torque about it. Friction from the skate is tiny over a second or two. So $L$ about the axis is conserved.` },
      { label: 'Conserve it', text: t`$I_1\omega_1 = I_2\omega_2 \Rightarrow \omega_2 = \omega_1\dfrac{I_1}{I_2} = ${EX.f1}\times\dfrac{${EX.I1.toFixed(1)}}{${EX.I2.toFixed(1)}} = ${s3(EX.f2)}$ rev/s. (Revolutions per second are fine here: the conversion factor $2\pi$ cancels.)` },
      { label: 'Energy before and after', text: t`$K = \tfrac12 I\omega^2$ with $\omega$ in rad/s: $K_1 = \tfrac12(${EX.I1.toFixed(1)})(2\pi\times${EX.f1})^2 = ${s3(EX.K1)}$ J, $K_2 = \tfrac12(${EX.I2.toFixed(1)})(2\pi\times${s3(EX.f2)})^2 = ${s3(EX.K2)}$ J.` },
      { label: 'Where did the energy come from?', text: t`From her muscles. Pulling each hand inward against its tendency to fly outward does work. Angular momentum is conserved; kinetic energy is not — it grows by the factor $I_1/I_2 = ${s3(EX.I1 / EX.I2)}$.` },
    ],
    answer: t`$\omega_2 = ${s3(EX.f2)}$ rev/s; her kinetic energy rises from $${s3(EX.K1)}$ J to $${s3(EX.K2)}$ J.`,
  },
  practice: [
    num({
      id: 'spin-up', difficulty: 1,
      gen(r) {
        const I1 = r.pick([2.4, 3.0, 3.6, 4.0]), f = r.pick([2, 2.5, 3, 4]), w1 = r.pick([1, 1.2, 1.5, 2]);
        const I2 = I1 / f, w2 = w1 * f;
        return {
          prompt: t`A skater spinning at ${w1} rev/s with $I = ${I1}\ \text{kg·m}^2$ pulls in her arms until $I = ${s3(I2)}\ \text{kg·m}^2$. Ignoring friction, what is her new spin rate?`,
          answer: w2, units: 'rev/s', tol: { rel: 0.01 },
          errors: [{ value: w1 / f, feedback: t`Smaller $I$ means **faster** spin: $\omega_2 = \omega_1 I_1/I_2$.` }, { value: w1 * Math.sqrt(f), feedback: t`That would conserve kinetic energy. It is angular momentum, $I\omega$, that is conserved.` }],
          hints: [t`$I_1\omega_1 = I_2\omega_2$.`],
          teach: 'With no external torque, Iω is constant: halve the moment of inertia and the spin rate doubles.',
          explain: t`$\omega_2 = \omega_1 I_1/I_2 = ${w1}\times${I1}/${s3(I2)} = ${s3(w2)}$ rev/s.`,
          visual: skaterPicture({ caption: 'Seen from above: arms out before (dashed), in after (solid). A sketch, not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'energy', difficulty: 2,
      prompt: 'When a spinning skater pulls in her arms and speeds up, what happens to her rotational kinetic energy?',
      choices: ['It increases: her muscles do work pulling her arms in', 'It stays the same, like her angular momentum', 'It decreases, because her moment of inertia decreases', 'It increases, because her angular momentum increases'],
      answer: 0,
      why: {
        1: 'Angular momentum and kinetic energy are different quantities: with L fixed, K = L²/2I grows as I shrinks.',
        2: 'I falls, but ω² rises faster: K = ½Iω² = L²/2I goes up.',
        3: 'Her angular momentum does not change at all — no external torque acts. The kinetic energy rises because she does work.',
      },
      hints: [t`Write the kinetic energy in terms of $L$: $K = \tfrac12 I\omega^2 = \dfrac{L^2}{2I}$.`],
      teach: 'With no external torque L stays fixed but K = L²/2I does not: pulling mass inward takes work, and that work becomes spin energy.',
      explain: t`$K = L^2/2I$ with $L$ fixed, so halving $I$ doubles $K$. The extra energy is the work her arms do pulling her hands inward.`,
      visual: skaterPicture({ labels: false, caption: 'Seen from above: arms out (dashed) and in (solid).' }),
    }),
    num({
      id: 'apsides', difficulty: 2,
      gen(r) {
        const A = r.pick(APSIDES), [name, centre, near, far] = NAMES[A.key];
        const rp = A.o.rp, ra = A.o.ra, vp = +(A.vp / 1e3).toFixed(A.key === 'moon' ? 3 : 2), va = (vp * rp) / ra;
        const dist = (m) => (A.key === 'moon' ? `${km(m)}\\ \\text{km}` : `${mkm(m)}\\times10^{6}\\ \\text{km}`);
        return {
          prompt: t`${name} moves at ${vp} km/s at ${near}, $${dist(rp)}$ from the centre of ${centre}. At ${far} it is $${dist(ra)}$ away. How fast is it moving there?`,
          answer: va, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: (vp * ra) / rp, feedback: t`Upside down: farther out means **slower**. $r_pv_p = r_av_a$ gives $v_a = v_p r_p/r_a$.` }, { value: vp, feedback: t`The speed changes around an elliptical orbit; what stays fixed is $r\times v$.` }],
          hints: [t`Gravity points at ${centre}'s centre, so it exerts no torque about it: $mvr_\perp$ is conserved.`, t`At ${near} and ${far} the velocity is perpendicular to the radius, so there $r_\perp = r$: $r_pv_p = r_av_a$.`],
          teach: 'A central force exerts no torque about its centre, so an orbiting body’s r × v is constant: it moves fastest where it is closest.',
          explain: t`$v_a = v_p\dfrac{r_p}{r_a} = ${vp}\times\dfrac{${dist(rp)}}{${dist(ra)}} = ${s3(va)}$ km/s.`,
          visual: { type: 'mech-kepler', params: { presets: [A.key], readout: false, play: false, time: false, t: 0.5, sweep: false }, caption: `${name}’s orbit to scale, with twelve sectors swept in equal times; the body is drawn at ${far}.` },
        };
      },
    }),
    mcq({
      id: 'torque-free', difficulty: 2,
      prompt: 'In which of these is the angular momentum of the named object conserved (about the point given)?',
      choices: [
        'A diver in the air after leaving the board, about her centre of mass',
        'A satellite firing a thruster that points along its edge, about its centre',
        'A bicycle wheel being spun up by a hand pushing on its tyre, about its axle',
        'A car wheel slowing as the brakes squeeze it, about its axle',
      ],
      answer: 0,
      why: {
        1: 'A thrust along the edge has a lever arm about the centre: it is a torque, and the satellite’s spin changes. That is how thrusters turn spacecraft.',
        2: 'The hand pushes tangentially at the rim, a lever arm R from the axle: that torque is what spins the wheel up.',
        3: 'The brake pads’ friction acts at a distance from the axle: a torque that removes angular momentum.',
      },
      hints: ['Look for a force from outside the object that acts with a lever arm about the point.', 'Gravity acts at the centre of mass. What is its lever arm about that point?'],
      teach: 'Angular momentum is conserved only if the net external torque about the chosen point is zero — check every outside force’s lever arm.',
      explain: 'The only external force on the diver (ignoring air) is gravity, acting at her centre of mass, so it has no lever arm about that point: her angular momentum about it is fixed, and tucking makes her spin faster. In the other three an outside force acts with a lever arm.',
      visual: diverPicture,
    }),
    num({
      id: 'platform', difficulty: 2,
      gen(r) {
        const I = r.pick([180, 240, 300]), R = r.pick([1.5, 2.0]), m = r.pick([25, 30, 40]), w1 = r.pick([0.8, 1.0, 1.5]);
        const w2 = (I * w1) / (I + m * R * R);
        return {
          prompt: t`A playground platform ($I = ${I}\ \text{kg·m}^2$, radius ${R} m) turns freely at ${w1} rad/s. A ${m} kg child steps onto its rim, moving with no sideways speed. Treating the child as a point mass, what is the new angular speed?`,
          answer: w2, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: w1, feedback: 'The child adds rotational inertia, m R², so the platform must slow down to keep Iω fixed.' }, { value: (I * w1) / (I + m * R), feedback: t`A point mass at distance $R$ adds $mR^2$ to the moment of inertia, not $mR$.` }],
          hints: [t`The child's feet exert forces on the platform, but these are internal to the platform-plus-child system: no external torque about the axle.`, t`$I\omega_1 = (I + mR^2)\,\omega_2$.`],
          teach: 'Adding mass far from the axis raises the moment of inertia, so with L conserved the spin slows.',
          explain: t`$\omega_2 = \dfrac{I\omega_1}{I + mR^2} = \dfrac{(${I})(${w1})}{${I} + (${m})(${R})^2} = ${s3(w2)}$ rad/s.`,
          visual: platformPicture(R),
        };
      },
    }),
    num({
      id: 'putty-rod', difficulty: 3,
      gen(r) {
        const m = r.pick([0.04, 0.05, 0.08]), v = r.pick([6, 8, 10]), Lr = r.pick([0.8, 1.0, 1.2]), M = r.pick([0.4, 0.6, 0.9]);
        const L0 = m * v * Lr, I = (M * Lr * Lr) / 3 + m * Lr * Lr, w = L0 / I;
        return {
          prompt: t`A ${m * 1000} g ball of putty moving at ${v} m/s strikes the free end of a uniform ${M} kg rod, ${Lr} m long, at right angles and sticks. The rod can turn freely about a pivot at its other end, on a frictionless table. What is the rod's angular speed just afterwards? ($I_\text{rod} = \tfrac13 ML^2$ about its end.)`,
          answer: w, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: (m * v * Lr) / ((M * Lr * Lr) / 3), feedback: 'The putty also turns with the rod after it sticks: add its m L² to the moment of inertia.' }, { value: (m * v) / ((M + m) * Lr), feedback: 'Linear momentum is not conserved here: the pivot pushes on the rod during the impact. Use angular momentum about the pivot.' }],
          hints: [
            t`During the impact the pivot pushes on the rod, so linear momentum is **not** conserved. But that force acts at the pivot: about the pivot it has no lever arm.`,
            t`Before: only the putty moves, with $L = mvL_\text{rod}$ (its velocity is perpendicular to the rod).`,
            t`After: $L = \left(\tfrac13 ML_\text{rod}^2 + mL_\text{rod}^2\right)\omega$. Set the two equal.`,
          ],
          teach: 'Choose the point to take angular momentum about wisely: about a pivot, the pivot’s force has no torque, so L is conserved even though momentum is not.',
          explain: t`$L = (${m})(${v})(${Lr}) = ${s3(L0)}\ \text{kg·m}^2/\text{s}$ and $I = \tfrac13(${M})(${Lr})^2 + (${m})(${Lr})^2 = ${s3(I)}\ \text{kg·m}^2$, so $\omega = L/I = ${s3(w)}$ rad/s.`,
          visual: puttyPicture(Lr),
        };
      },
    }),
    num({
      id: 'collapse', difficulty: 3,
      gen(r) {
        const R2 = r.pick([10, 12, 14]);
        const R1 = 696000, P1 = 25.4 * 86400, P2 = P1 * (R2 / R1) ** 2;
        return {
          prompt: t`**A toy model.** The Sun (radius $696\,000$ km) turns once every 25.4 days. Suppose it collapsed to a neutron star of radius ${R2} km, keeping its mass, its angular momentum and its shape factor $\beta$ in $I = \beta MR^2$. What would its rotation period be, in milliseconds?`,
          answer: P2 * 1000, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: P1 * (R2 / R1) * 1000, feedback: t`$I$ goes as $R^2$, so the period shrinks by the **square** of the radius ratio.` }, { value: P1 * 1000 * (R1 / R2) ** 2, feedback: 'The star spins up, so its period must get shorter, not longer.' }],
          hints: [t`$I_1\omega_1 = I_2\omega_2$ with $I = \beta MR^2$: $\beta$ and $M$ cancel, leaving $R_1^2\omega_1 = R_2^2\omega_2$.`, t`Period is $2\pi/\omega$, so $P_2 = P_1(R_2/R_1)^2$. Put $P_1$ in seconds.`],
          teach: 'Collapse shrinks I as R², so the spin rate climbs as 1/R²: the reason neutron stars spin so fast.',
          explain: t`$P_2 = (25.4 \times 86\,400\ \text{s})\left(\dfrac{${R2}}{696\,000}\right)^2 = ${s3(P2 * 1000)}$ ms. Real pulsars spin with periods from about 1.4 ms to several seconds — slower than this, because real collapses shed angular momentum and real stars are not uniform. The model shows why they spin fast at all.`,
          visual: {
            type: 'graph',
            params: {
              x: [2.6, 6.4], y: [-2.2, 3.6], xlabel: 'log₁₀(radius in km)', ylabel: 'log₁₀(turns per day)', aspect: 'wide',
              curves: [{ fn: `${r4(Math.log10(1 / 25.4) + 2 * Math.log10(R1))} - 2x`, domain: [2.7, r4(Math.log10(R1))], color: 'accent' }],
              points: [{ x: r4(Math.log10(R1)), y: r4(Math.log10(1 / 25.4)), color: 'gold', label: 'the Sun today', labelDx: -90 }, { x: r4(Math.log10(6371)), y: r4(Math.log10(1 / 25.4) + 2 * Math.log10(R1 / 6371)), color: 'ink3', label: 'Earth-sized', labelDx: 10 }],
            },
            caption: 'The toy model on logarithmic axes: with L fixed, the spin rate goes as 1/R², a straight line of slope −2. A 12 km neutron star lies far off to the left.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-chair', difficulty: 2,
      gen(r) {
        const I1 = r.pick([4.8, 5.4, 6.0]), I2 = r.pick([1.8, 2.0, 2.4]), w1 = r.pick([1.5, 2.0, 2.5]);
        const w2 = (I1 * w1) / I2;
        return {
          prompt: t`A student on a frictionless spinning stool holds two dumbbells at arm's length; the system's moment of inertia is ${I1} kg·m² and it turns at ${w1} rad/s. She pulls the dumbbells to her chest, reducing it to ${I2} kg·m². What is the new angular speed?`,
          answer: w2, units: 'rad/s', tol: { rel: 0.01 },
          hints: [t`$I_1\omega_1 = I_2\omega_2$.`],
          teach: 'With no external torque, I₁ω₁ = I₂ω₂.',
          explain: t`$\omega_2 = (${I1})(${w1})/${I2} = ${s3(w2)}$ rad/s.`,
          visual: skaterPicture({ r1: 0.9, r2: 0.35, caption: 'The student and dumbbells seen from above: arms out (dashed), then in (solid). Not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-halley', difficulty: 2, transfer: true,
      prompt: t`Halley's comet passes the Sun at 0.588 AU, moving at 54.5 km/s. At the far end of its orbit it is 35.1 AU from the Sun. How fast is it moving there?`,
      answer: (54.5 * 0.588) / 35.1, units: 'km/s', tol: { rel: 0.01 },
      errors: [{ value: (54.5 * 35.1) / 0.588, feedback: 'Farther from the Sun means slower: v_a = v_p r_p / r_a.' }],
      hints: [t`Gravity exerts no torque about the Sun, so $r_\perp v$ is the same at both ends, where $\vec v\perp\vec r$.`],
      teach: 'At the two ends of an orbit, r_p v_p = r_a v_a: angular momentum conservation for a central force.',
      explain: t`$v_a = 54.5\times0.588/35.1 = ${s3((54.5 * 0.588) / 35.1)}$ km/s — slower than a cyclist, sixty times slower than at perihelion.`,
      visual: { type: 'mech-kepler', params: { presets: ['halley'], readout: false, play: false, time: false, t: 0.5, sweep: false }, caption: 'Halley’s orbit to scale, with twelve sectors swept in equal times; the comet is drawn at its farthest point. The Sun is a dot.' },
    }),
    mcq({
      id: 'cp-momentum', difficulty: 3,
      prompt: 'In the putty-and-rod collision (the rod pivoted at one end on a frictionless table), which quantities are conserved during the impact?',
      choices: ['Angular momentum about the pivot only', 'Linear momentum only', 'Both linear momentum and angular momentum about the pivot', 'Kinetic energy and angular momentum about the pivot'],
      answer: 0,
      why: {
        1: 'The pivot pushes on the rod during the impact — an external force — so linear momentum changes.',
        2: 'Angular momentum about the pivot survives, but linear momentum does not: the pivot’s force is external.',
        3: 'The putty sticks: a perfectly inelastic collision loses kinetic energy to heat and deformation.',
      },
      hints: ['List the external forces during the impact. Where does each act?', 'A force acting at the pivot changes momentum but has no torque about the pivot.'],
      teach: 'An external force through the chosen point spoils momentum conservation but not angular momentum conservation about that point.',
      explain: 'The pivot exerts a large force during the impact, so linear momentum is not conserved; but that force acts at the pivot, with no lever arm, so angular momentum about the pivot is. The collision is inelastic, so kinetic energy is lost.',
      visual: puttyPicture(1.0, false),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §11.3 Conservation of Angular Momentum', url: 'https://openstax.org/books/university-physics-volume-1/pages/11-3-conservation-of-angular-momentum' },
    { label: 'NASA planetary fact sheets (orbits of Mercury, Earth and the Moon)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    { label: 'ATNF Pulsar Catalogue (pulsar periods)', url: 'https://www.atnf.csiro.au/research/pulsar/psrcat/' },
  ],
});
