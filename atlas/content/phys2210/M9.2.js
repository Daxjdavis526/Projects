// Conservation of momentum: internal forces cancel in pairs, so an isolated
// system's total momentum never changes.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { collide1d } from '../../src/viz/model/mech-collide.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const comma = (x) => x.toLocaleString('en-US');

// a static before/after picture of two carts from the collision simulation
const snaps = (params, caption) => ({ type: 'mech-collide', params: { view: 'snapshots', bars: [], ...params }, caption });

// the force each cart feels during a collision: one pulse up, its mirror image down
const PAIR = '90*sin(pi*x/10)';

export default lesson({
  id: 'phys2210.M9.2',
  title: 'Conservation of momentum',
  minutes: 10, difficulty: 2,
  intro: t`Add up the momenta of every body in a **system**. Forces between members of the system come in Newton’s-third-law pairs — equal, opposite, and acting for exactly the same time — so their impulses cancel and leave the total untouched. Only an **external** force can change it. So whenever the net external force is zero, or too brief to matter, as in a collision:

$$\vec P = m_1\vec v_{1i} + m_2\vec v_{2i} = m_1\vec v_{1f} + m_2\vec v_{2f}$$

This is **conservation of momentum**. You do not need to know anything about the forces inside the collision, the explosion or the push — only the motion before and after.`,
  symbols: [
    { tex: '\\vec P', text: 'the total momentum of the system: the vector sum of every member’s momentum, in kg·m/s' },
    { tex: 'm_1,\\ m_2', text: 'the masses of the two bodies, in kg' },
    { tex: '\\vec v_{1i},\\ \\vec v_{2i}', text: 'their velocities before the interaction (i for initial), in m/s — in one dimension, numbers with signs' },
    { tex: '\\vec v_{1f},\\ \\vec v_{2f}', text: 'their velocities after it (f for final)' },
    { tex: '\\vec F_\\text{ext}', text: 'the net external force on the system — from anything outside it. $\\vec P$ is constant when this is zero' },
  ],
  why: 'Momentum conservation solves collisions, recoil, explosions and stage separations without knowing the forces involved — and, applied to exhaust, it is the rocket equation.',
  visual: {
    type: 'mech-collide',
    title: 'The total never moves',
    lead: t`Two carts on a frictionless track. Set their masses and velocities and press **Play**, or switch to **Push apart**: a compressed spring between the carts shoves them away from each other. The bars show each cart’s momentum and the gold total, before and after.`,
    tasks: [
      'Change anything — masses, velocities, the restitution — and play it: the two carts’ bars change, but the gold total is the same before and after, every time.',
      'Switch to Push apart with the carts at rest: the total is zero before, so afterwards the momenta are equal and opposite, and the lighter cart is the faster one.',
      'Watch the CM marker on the track: it glides at a steady speed straight through the collision.',
    ],
    params: {
      modes: true, cmFrame: true, m1: 2, m2: 1, u1: 3, u2: -1, e: 0.6, E: 6,
      sliders: ['m1', 'm2', 'u1', 'u2', 'e', { key: 'E', explain: 'Used by Push apart: the energy the compressed spring releases into the carts’ motion.' }],
    },
  },
  example: {
    prompt: t`On the International Space Station, an 80 kg astronaut (with her suit), at rest relative to the station, throws a 4.0 kg tool bag away from her at 3.0 m/s. With what velocity does she recoil?`,
    visual: snaps({ mode: 'explode', m1: 80, m2: 4, u: 0, after: [-0.15, 3], names: ['astronaut', 'bag'], unknown: ['v1'] }, 'Before and after the throw, relative to the station. Masses drawn bigger for heavier bodies; not to scale.'),
    steps: [
      { label: 'Choose the system', text: t`Astronaut **plus** bag. The forces of the throw act between them — internal. Floating in the station, nothing outside pushes along the line of the throw, so the system’s momentum cannot change.` },
      { label: 'Before', text: t`Both at rest relative to the station: $P_i = 0$.` },
      { label: 'After', text: t`Take the bag’s direction as positive: $m_a v_a + m_b v_b = 0$, so $v_a = -\dfrac{m_b v_b}{m_a} = -\dfrac{(4.0)(3.0)}{80} = -0.15$ m/s.` },
      { label: 'Sense check', text: t`She is 20 times heavier, so she moves 20 times slower, the other way: 9 m in a minute, enough to need a handrail. Their momenta, $\mp 12$ kg·m/s, cancel. Kinetic energy was *not* conserved — $18.9$ J appeared from her muscles — and nothing says it should be.` },
    ],
    answer: t`$v_a = -0.15$ m/s: 15 cm/s, opposite to the bag.`,
  },
  practice: [
    num({
      id: 'couple', difficulty: 1,
      gen(r) {
        const m1 = r.pick([12000, 15000]), m2 = r.pick([8000, 10000, 20000]), u = r.pick([2, 2.5, 3, 4]);
        const v = (m1 * u) / (m1 + m2);
        return {
          prompt: t`A ${comma(m1)} kg railway wagon rolling at ${u} m/s runs into a ${comma(m2)} kg wagon at rest, and they couple together. How fast do they move off? (Ignore friction.)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: u / 2, feedback: 'Coupled wagons do not simply average their speeds: momentum is conserved, so weight each speed by its mass.' },
            { value: (m1 * u) / m2, feedback: 'After coupling, both wagons move together: divide the momentum by their total mass.' },
          ],
          hints: ['The momentum before is all in the moving wagon.', t`After coupling: $(m_1 + m_2)\,v = m_1 u$.`],
          teach: 'When bodies stick together, they share the total momentum: v = P / (total mass).',
          explain: t`$v = \dfrac{m_1 u}{m_1 + m_2} = \dfrac{${comma(m1)}\times${u}}{${comma(m1 + m2)}} = ${s3(v)}$ m/s.`,
          visual: snaps({ m1, m2, u1: u, u2: 0, e: 0, show: 'before', names: ['1', '2'] }, 'The wagons just before they meet.'),
        };
      },
    }),
    num({
      id: 'recoil', difficulty: 2,
      gen(r) {
        const mA = r.pick([45, 50, 55, 60]), mB = r.pick([70, 75, 80, 90]), vA = r.pick([2.4, 3, 3.6]);
        const vB = (mA * vA) / mB;
        return {
          prompt: t`Two ice skaters stand face to face, at rest. Skater A (${mA} kg) and skater B (${mB} kg) push off each other, and A glides away at ${vA} m/s. How fast does B move?`,
          answer: vB, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: vA, feedback: 'Equal and opposite are the momenta, not the speeds: the heavier skater moves more slowly.' },
            { value: (mB * vA) / mA, feedback: t`The ratio is upside down: the heavier skater gets the smaller speed, $v_B = m_A v_A/m_B$.` },
          ],
          hints: ['The total momentum is zero before the push, so it is zero after it.', t`$m_A v_A = m_B v_B$ in size, with the velocities opposite.`],
          teach: 'Starting from rest, the pieces of a push or an explosion have equal and opposite momenta.',
          explain: t`$m_A v_A + m_B v_B = 0 \Rightarrow |v_B| = \dfrac{${mA}\times${vA}}{${mB}} = ${s3(vB)}$ m/s, opposite to A.`,
          visual: snaps({ mode: 'explode', m1: mA, m2: mB, u: 0, after: [-vA, vB], names: ['A', 'B'], unknown: ['v2'] }, 'Before and after the push.'),
        };
      },
    }),
    mcq({
      id: 'system', difficulty: 2,
      prompt: 'A ball is dropped and falls toward the ground (ignore air). Whose momentum stays constant while it falls?',
      choices: ['The ball and the Earth together', 'The ball alone', 'Nothing’s: momentum is lost as the ball speeds up', 'The Earth alone'],
      answer: 0,
      why: {
        1: 'Gravity is an outside force on the ball alone, so the ball’s momentum grows as it falls.',
        2: 'The ball gains downward momentum, but the Earth gains exactly as much upward: the pair’s total is unchanged.',
        3: 'The ball pulls the Earth up as hard as the Earth pulls the ball down, so the Earth’s momentum changes too — by an equal and opposite amount.',
      },
      hints: ['Which forces act? Gravity is an interaction between two bodies.', 'Momentum is conserved for a system with no net external force. Which system contains both ends of the gravitational interaction?'],
      teach: 'Momentum is conserved for a system that contains both partners of every force acting — choose the system to make the forces internal.',
      explain: 'The gravitational pull is an interaction between ball and Earth: equal and opposite forces for the same time. For the ball alone it is external, and its momentum changes; for ball + Earth it is internal, and the total stays put. (The Earth’s change in velocity is unmeasurably small, because its mass is 10²⁴ kg.)',
      visual: {
        type: 'graph',
        params: {
          x: [-4, 4], y: [-2.8, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          shade: [{ fn: 'sqrt(max(0, 49 - x^2)) - 9', lower: '-2.8', from: -3.24, to: 3.24, color: 'teal', alpha: 0.35 }],
          points: [{ x: 0, y: 1.6, r: 9, color: 'accent', label: 'ball', labelDx: 14 }],
          arrows: [{ from: [0, 1.25], to: [0, 0.3], color: 'bad', label: 'Earth’s pull on the ball', labelDx: 10, labelDy: 0 }, { from: [0, -2.05], to: [0, -1.1], color: 'warn', label: 'ball’s pull on the Earth', labelDx: 10, labelDy: 0 }],
        },
        caption: 'Not to scale. The two forces of one gravitational interaction: equal in size, opposite in direction, acting on different bodies.',
      },
    }),
    num({
      id: 'find-v', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1, 1.5, 2, 3]), m2 = r.pick([1, 2, 3, 4]), u1 = r.pick([2, 3, 4]), e = r.pick([0.3, 0.5, 0.7]);
        const v1 = Math.round(collide1d({ m1, m2, u1, u2: 0, e }).v1 * 10) / 10;    // as measured, to 0.1 m/s
        const v2 = (m1 * u1 - m1 * v1) / m2;
        const after = v1 > 0 ? t`cart 1 carries on at ${v1} m/s` : v1 < 0 ? t`cart 1 bounces back at ${nice(-v1)} m/s` : 'cart 1 stops dead';
        const errors = [];
        if (v1 !== 0) errors.push({ value: (m1 * u1) / m2, feedback: 'Cart 1 still has momentum after the collision: the momentum before is shared, m₁u₁ = m₁v₁ + m₂v₂.' });
        if (v1 < 0) errors.push({ value: (m1 * (u1 - Math.abs(v1))) / m2, feedback: 'Cart 1 bounced back, so its velocity after is negative: m₁v₁ must be subtracted from the other side — it adds to cart 2’s share.' });
        return {
          prompt: t`Cart 1 (${m1} kg) rolls at ${u1} m/s into cart 2 (${m2} kg), which is at rest. After the collision ${after}. What is cart 2’s velocity? (Positive: cart 1’s original direction.)`,
          answer: v2, units: 'm/s', tol: { rel: 0.01 },
          errors,
          hints: ['Total momentum before = total momentum after.', t`$m_1u_1 = m_1v_1 + m_2v_2$, with $v_1$ negative if cart 1 bounced back.`],
          teach: 'With one velocity after the collision known, momentum conservation gives the other.',
          explain: t`$v_2 = \dfrac{m_1u_1 - m_1v_1}{m_2} = \dfrac{${m1}(${u1}) - ${m1}(${v1})}{${m2}} = ${s3(v2)}$ m/s.`,
          visual: snaps({ m1, m2, u1, u2: 0, after: [v1, v2], unknown: ['v2'] }, 'Before and after; the arrows share one scale.'),
        };
      },
    }),
    mcq({
      id: 'why', difficulty: 2,
      prompt: 'Two carts collide on a frictionless track. Why is their total momentum exactly the same afterward?',
      choices: [
        'The forces they exert on each other are equal and opposite and act for the same time, so their impulses cancel',
        'No forces act on the carts during the collision',
        'Their kinetic energy is conserved, and momentum follows from it',
        'The heavier cart’s push is larger, and balances the lighter cart’s larger speed',
      ],
      answer: 0,
      why: {
        1: 'Large forces act during the collision — they are what change each cart’s velocity. They are simply internal to the pair.',
        2: 'Kinetic energy is usually not conserved in a collision, yet momentum always is: the two laws are independent.',
        3: 'By Newton’s third law the two pushes are exactly equal in size, whatever the masses.',
      },
      hints: ['Compare the force of cart 1 on cart 2 with the force of cart 2 on cart 1.', 'Impulse is force × time. What is the total impulse of a third-law pair?'],
      teach: 'Internal forces come in third-law pairs whose impulses cancel; only external forces can change a system’s momentum.',
      explain: t`By the third law, $\vec F_{12} = -\vec F_{21}$ at every instant of the contact, so the impulses $\int\vec F_{12}\,dt$ and $\int\vec F_{21}\,dt$ are equal and opposite: what one cart gains, the other loses.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 12], y: [-110, 110], xlabel: 't (ms)', ylabel: 'F (N)',
          curves: [{ fn: PAIR, domain: [0, 10], color: 'violet', label: 'force on cart 2', labelAt: 5, labelDy: -14 }, { fn: `-${PAIR}`, domain: [0, 10], color: 'accent', label: 'force on cart 1', labelAt: 5, labelDy: 16 }],
          shade: [{ fn: PAIR, from: 0, to: 10, color: 'violet', alpha: 0.22 }, { fn: `-${PAIR}`, from: 0, to: 10, color: 'accent', alpha: 0.22 }],
        },
        caption: 'The two contact forces during a 10 ms collision (an idealised pulse). Positive: cart 1’s direction of travel.',
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A 2.0 kg cart moving right at 3.0 m/s hits a 1.0 kg cart moving left at 2.0 m/s, and they stick together. A student writes

$$(2.0)(3.0) + (1.0)(2.0) = (3.0)\,v \quad\Rightarrow\quad v = 2.7\ \text{m/s}.$$

What is wrong?`,
      choices: [
        'The 1.0 kg cart’s velocity must enter as −2.0 m/s, giving v = 1.3 m/s to the right',
        'Kinetic energy, not momentum, must be conserved when carts stick',
        'Stuck-together carts move at the average of their speeds, 2.5 m/s',
        'Nothing: the answer is right',
      ],
      answer: 0,
      why: {
        1: 'Carts that stick lose kinetic energy, so energy cannot be conserved here; momentum is.',
        2: 'Speeds do not average; momenta add — with signs.',
        3: 'Momenta in opposite directions must partly cancel, so the result cannot be bigger than the faster cart’s share alone suggests.',
      },
      hints: ['Momentum is a vector. In one dimension, direction is a sign.', 'Taking right as positive, what is the velocity of the cart moving left?'],
      teach: 'In one dimension, momentum conservation is a signed sum: a body moving the other way contributes a negative momentum.',
      explain: t`With right positive: $(2.0)(3.0) + (1.0)(-2.0) = (3.0)\,v$, so $v = 4.0/3.0 = 1.3$ m/s, to the right. The student added the magnitudes as if both carts moved right.`,
      visual: snaps({ m1: 2, m2: 1, u1: 3, u2: -2, e: 0, show: 'before' }, 'The two carts just before they meet.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dock', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([8000, 12000, 15000]), v = r.pick([0.05, 0.08, 0.1]), M = 420000;
        const dv = (m * v) / (m + M);
        return {
          prompt: t`A ${comma(m)} kg cargo capsule closes on the ${comma(M)} kg space station at ${v} m/s (relative to the station) and latches on. By how much does the station’s velocity change? Give your answer in mm/s.`,
          answer: dv * 1000, units: 'mm/s', tol: { rel: 0.01 },
          errors: [
            { value: ((m * v) / M) * 1000, feedback: 'After latching, capsule and station move together: divide the momentum by their combined mass.' },
            { value: v * 1000, feedback: 'The station is 30 or more times heavier: the shared velocity is far smaller than the capsule’s approach speed.' },
          ],
          hints: ['Work in the station’s frame: before docking only the capsule moves.', t`They move off together: $(m + M)\,v' = m v$.`],
          teach: 'A docking is a perfectly inelastic collision: the pair shares the capsule’s momentum.',
          explain: t`$v' = \dfrac{m v}{m + M} = \dfrac{${comma(m)}\times${v}}{${comma(m + M)}} = ${s3(dv)}$ m/s $= ${s3(dv * 1000)}$ mm/s. The station’s thrusters later trim this out.`,
          visual: snaps({ m1: m, m2: M, u1: v, u2: 0, e: 0, show: 'before', names: ['capsule', 'station'] }, 'Just before docking, in the station’s frame (sizes not to scale).'),
        };
      },
    }),
    num({
      id: 'cp-separation', difficulty: 3, transfer: true,
      gen(r) {
        const ms = r.pick([250, 400, 600]), mu = r.pick([900, 1200, 1500]), rel = r.pick([0.5, 0.6, 0.8]);
        const dStage = (ms * rel) / (ms + mu), dSat = (mu * rel) / (ms + mu);
        return {
          prompt: t`Coasting in orbit, an upper stage (${comma(mu)} kg) releases a ${ms} kg satellite: springs push them apart, and afterwards the satellite moves away from the stage at ${rel} m/s. By how much did the **stage’s** velocity change?`,
          answer: dStage, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: rel, feedback: `${rel} m/s is the speed of the two relative to each other. Each piece changes velocity by part of it — the lighter piece by more.` },
            { value: dSat, feedback: 'That is the satellite’s share. The heavier stage takes the smaller change.' },
            { value: (ms * rel) / mu, feedback: 'Close — but the satellite does not take the whole relative speed: the stage moves back too. Use Δv(satellite) − Δv(stage) = the relative speed.' },
          ],
          hints: ['Work in the frame that moved with the pair before the release: there the total momentum is zero, before and after.', t`$m_s\,\Delta v_s + m_u\,\Delta v_u = 0$ and $\Delta v_s - \Delta v_u = ${rel}$ m/s. Solve the pair.`, t`$\Delta v_u = -\dfrac{m_s}{m_s + m_u}\times${rel}$ m/s.`],
          teach: 'In the frame moving with the pair, separation is an explosion from rest: the relative speed is shared in inverse proportion to mass.',
          explain: t`Momentum: $m_s\Delta v_s = -m_u\Delta v_u$, and $\Delta v_s - \Delta v_u = ${rel}$. So $\Delta v_u = -\dfrac{${ms}}{${ms + mu}}(${rel}) = -${s3(dStage)}$ m/s and $\Delta v_s = +${s3(dSat)}$ m/s. Orbital speed (some 7,600 m/s) is common to both and never enters.`,
          visual: snaps({ mode: 'explode', m1: mu, m2: ms, u: 0, after: [-dStage, dSat], names: ['stage', 'satellite'], unknown: ['v1', 'v2'] }, 'Seen from the frame that moved with the pair before release (orbital motion subtracted).'),
        };
      },
    }),
    mcq({
      id: 'cp-shell', difficulty: 2,
      prompt: 'A firework shell bursts into pieces at the top of its flight. Just after the burst, the total momentum of all the pieces is…',
      choices: ['the same as the shell’s momentum just before the burst', 'zero, because an explosion pushes pieces apart equally in all directions', 'larger, because the explosion adds energy', 'impossible to say, because gravity acts on the pieces'],
      answer: 0,
      why: {
        1: 'Zero only if the shell was at rest. At the top of its arc it is still moving sideways, and the pieces keep that momentum between them.',
        2: 'The explosion adds kinetic energy, but its forces are internal: they cannot change the total momentum.',
        3: 'Gravity does act, but over the few milliseconds of the burst its impulse is negligible. (Afterwards the pieces’ centre of mass follows the shell’s old parabola.)',
      },
      hints: ['Are the forces of the explosion internal or external to the set of pieces?', 'Over the brief burst, how big is gravity’s impulse compared with the explosion’s?'],
      teach: 'Explosion forces are internal, so total momentum just after equals total momentum just before.',
      explain: 'The burst’s forces act between pieces of the same system, so they cancel in pairs; gravity’s impulse over a few milliseconds is negligible. The pieces fly apart, but their momenta still add up to the shell’s.',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.4, 4.6], y: [-0.15, 3.4], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [
            { fn: '0', domain: [-0.4, 4.6], color: 'ink3', width: 1.5 },
            { fn: 'x*(4 - x)*0.7', domain: [0, 2], color: 'ink3', width: 2, dash: true },
            ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ param: [`2 + t*cos(${(k * Math.PI) / 4 + 0.3})`, `2.8 + t*sin(${(k * Math.PI) / 4 + 0.3})`], t: [0.12, 0.42], color: 'warn', width: 2 })),
          ],
          arrows: [{ from: [1.05, 2.25], to: [1.75, 2.75], color: 'accent', label: 'shell’s velocity', labelDx: -128, labelDy: -6 }],
          points: [{ x: 2, y: 2.8, r: 5, color: 'gold' }],
        },
        caption: 'The shell’s arc (dashed) and the burst at its top. A sketch.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §9.3 Conservation of linear momentum', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-3-conservation-of-linear-momentum' }],
});
