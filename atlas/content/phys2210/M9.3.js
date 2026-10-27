// Elastic and inelastic collisions: momentum always, kinetic energy sometimes.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { collide1d } from '../../src/viz/model/mech-collide.js';
import { G, lineArrows, seg, massDots } from './_momentum.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const comma = (x) => x.toLocaleString('en-US');
const snaps = (params, caption) => ({ type: 'mech-collide', params: { view: 'snapshots', bars: [], ...params }, caption });

// the height of a dropped ball against time: a fall from h1, then two bounces with restitution e
function bounceGraph(h1, e) {
  const tf = Math.sqrt((2 * h1) / G), v1 = e * Math.sqrt(2 * G * h1), t1 = (2 * v1) / G, v2 = e * v1, t2 = (2 * v2) / G;
  const a = tf, b = tf + t1;
  const r4 = (x) => +x.toFixed(4);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r4(b + t2 + 0.15)], y: [0, r4(h1 * 1.18)], xlabel: 't (s)', ylabel: 'height (m)',
      curves: [
        { fn: `${r4(h1)} - 4.9*x^2`, domain: [0, r4(a)], color: 'accent' },
        { fn: `${r4(v1)}*(x - ${r4(a)}) - 4.9*(x - ${r4(a)})^2`, domain: [r4(a), r4(b)], color: 'accent' },
        { fn: `${r4(v2)}*(x - ${r4(b)}) - 4.9*(x - ${r4(b)})^2`, domain: [r4(b), r4(b + t2)], color: 'accent' },
      ],
      hlines: [{ y: r4(h1), label: 'dropped from here', color: 'ink3' }, { y: r4(e * e * h1), label: 'first bounce', color: 'gold' }],
    },
    caption: 'The ball’s height against time (air resistance ignored). Each bounce is a collision with the floor.',
  };
}

export default lesson({
  id: 'phys2210.M9.3',
  title: 'Elastic and inelastic collisions',
  minutes: 11, difficulty: 2,
  intro: t`**Momentum is conserved in every collision** (as long as outside forces are negligible while it lasts). Kinetic energy is another matter: some of it usually goes into heat, sound and bent metal. One number, the **coefficient of restitution** $e$, captures how much bounce there is:

$$m_1v_{1i} + m_2v_{2i} = m_1v_{1f} + m_2v_{2f}, \qquad e = \frac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}}$$

**Elastic**: $e = 1$, no kinetic energy lost. **Inelastic**: $0 < e < 1$. **Perfectly inelastic**: $e = 0$ — the bodies stick together and lose as much kinetic energy as momentum conservation allows. For an elastic collision with body 2 at rest, the two equations give $v_{1f} = \frac{m_1 - m_2}{m_1 + m_2}v_{1i}$ and $v_{2f} = \frac{2m_1}{m_1 + m_2}v_{1i}$.`,
  symbols: [
    { tex: 'm_1,\\ m_2', text: 'the masses, in kg' },
    { tex: 'v_{1i},\\ v_{2i}', text: 'velocities before the collision, in m/s, with signs (positive one way along the line)' },
    { tex: 'v_{1f},\\ v_{2f}', text: 'velocities after it' },
    { tex: 'e', text: 'the coefficient of restitution: the speed at which they separate divided by the speed at which they approached. Between 0 and 1' },
    { tex: 'K = \\tfrac12 mv^2', text: 'kinetic energy, in joules: conserved only when $e = 1$' },
  ],
  why: 'Collisions are everywhere — crash tests, particle detectors, neutrons slowing in a reactor, spacecraft swinging past planets — and in every one, momentum is the law and kinetic energy the variable.',
  visual: {
    type: 'mech-collide',
    title: 'Momentum always, energy sometimes',
    lead: t`Change the masses, the velocities and the **restitution** $e$, and press **Play**. The momentum bars always balance; the kinetic-energy bars only balance when $e = 1$. The red dashed box is the kinetic energy that went into deforming and heating the carts.`,
    tasks: [
      'Equal masses, cart 2 at rest, e = 1: the carts swap velocities, like the balls of a Newton’s cradle.',
      'Set e = 0: the carts stick, and the most kinetic energy is lost that momentum conservation allows.',
      'With e = 1, make cart 1 much heavier: cart 2 shoots off at nearly twice cart 1’s speed. Make it much lighter: cart 1 bounces back.',
      'Turn on the centre-of-mass frame with e = 0: both carts end at rest. All the kinetic energy you see in that frame is lost.',
    ],
    params: { sliders: true, cmFrame: true, m1: 2, m2: 1, u1: 3, u2: 0, e: 1 },
  },
  example: {
    prompt: t`A 1200 kg car moving at 20 m/s runs into the back of an 1800 kg car moving at 10 m/s the same way. Their bumpers lock. How fast do they move just after the crash, and how much kinetic energy is lost?`,
    visual: snaps({ m1: 1200, m2: 1800, u1: 20, u2: 10, e: 0, bars: ['p', 'K'] }, 'Before and after, with momentum and kinetic energy. Friction with the road acts too, but over the brief crash its impulse is negligible.'),
    steps: [
      { label: 'Momentum', text: t`$(1200)(20) + (1800)(10) = 42{,}000$ kg·m/s $= (3000)\,v$, so $v = 14.0$ m/s.` },
      { label: 'Energy before', text: t`$\tfrac12(1200)(20)^2 + \tfrac12(1800)(10)^2 = 240{,}000 + 90{,}000 = 330{,}000$ J.` },
      { label: 'Energy after', text: t`$\tfrac12(3000)(14)^2 = 294{,}000$ J.` },
      { label: 'Lost', text: t`$330{,}000 - 294{,}000 = 36{,}000$ J, 10.9% — into crumpled metal, heat and sound.` },
      { label: 'Sense check', text: t`Only the energy of the cars’ *relative* motion can be lost: $\tfrac12\mu(v_{1i} - v_{2i})^2$ with $\mu = \frac{m_1m_2}{m_1 + m_2} = 720$ kg gives $\tfrac12(720)(10)^2 = 36{,}000$ J. ✓ The 294 kJ that remain belong to the motion of the centre of mass, which no internal force can touch.` },
    ],
    answer: t`$v = 14.0$ m/s; $36$ kJ (10.9%) of kinetic energy is lost.`,
  },
  practice: [
    mcq({
      id: 'classify', difficulty: 1, fixedOrder: true,
      gen(r) {
        const [m1, m2, u1] = r.pick([[2, 1, 3], [1, 1, 4], [3, 1, 2], [1, 3, 4]]);
        const e = r.pick([1, 0.5, 0]);
        const c = collide1d({ m1, m2, u1, u2: 0, e });
        const v1 = +c.v1.toFixed(3), v2 = +c.v2.toFixed(3);
        const K0 = 0.5 * m1 * u1 * u1, K1 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
        const KT = t`Kinetic energy before: $\tfrac12(${m1})(${u1})^2 = ${nice(K0)}$ J; after: $${nice(+K1.toFixed(3))}$ J.`;
        return {
          prompt: t`Cart 1 (${m1} kg) hits cart 2 (${m2} kg), at rest, at ${u1} m/s. Afterwards cart 1 moves at ${nice(v1)} m/s and cart 2 at ${nice(v2)} m/s (positive: cart 1’s original direction). What kind of collision was it?`,
          choices: ['Elastic: no kinetic energy is lost', 'Inelastic: some kinetic energy is lost, but they separate', 'Perfectly inelastic: they move off together', 'Impossible: kinetic energy would increase'],
          answer: e === 1 ? 0 : e === 0 ? 2 : 1,
          why: {
            0: t`${KT} Some was lost, so it is not elastic.`,
            1: e === 1 ? t`${KT} None was lost.` : t`They do not separate: both move at ${nice(v1)} m/s afterwards.`,
            2: t`Their velocities afterwards differ, so they did not stick together.`,
            3: t`${KT} It did not increase.`,
          },
          hints: ['Momentum is conserved in all of these. Compare the kinetic energy before and after.', 'If the velocities after are equal, they stuck together.'],
          teach: 'Elastic: kinetic energy conserved; inelastic: some lost; perfectly inelastic: they stick, and the most is lost.',
          explain: t`${KT} ${e === 1 ? 'None lost: elastic.' : e === 0 ? 'They move together, losing the most energy allowed: perfectly inelastic.' : 'Some lost, but they separate: inelastic.'} (Momentum: $${m1}\times${u1} = ${nice(m1 * u1)}$ kg·m/s before and after.)`,
          visual: snaps({ m1, m2, u1, u2: 0, after: [v1, v2] }, 'Before and after; the arrows share one scale.'),
        };
      },
    }),
    num({
      id: 'stick-v', difficulty: 1,
      gen(r) {
        const m1 = r.pick([2, 3, 4]), m2 = r.pick([1, 2, 5]), u1 = r.pick([3, 4, 5]), u2 = -r.pick([1, 2, 3]);
        let v = (m1 * u1 + m2 * u2) / (m1 + m2);
        if (Math.abs(v) < 1e-9) v = 0;
        return {
          prompt: t`Two lumps of modelling clay fly straight at each other: ${m1} kg at ${u1} m/s and ${m2} kg at ${-u2} m/s the other way. They collide and stick. What is their velocity afterwards? (Positive: the ${m1} kg lump’s direction.)`,
          answer: v, units: 'm/s', tol: { rel: 0.01, abs: 0.005 },
          errors: Math.abs(v) < 1e-9 ? [] : [{ value: (m1 * u1 - m2 * u2) / (m1 + m2), feedback: 'The lumps move in opposite directions, so their momenta have opposite signs: the second one is negative.' }],
          hints: ['Momentum is conserved; take the first lump’s direction as positive.', t`$m_1u_1 + m_2u_2 = (m_1 + m_2)\,v$, with $u_2 = ${u2}$ m/s.`],
          teach: 'Bodies that stick move off with the total momentum divided by the total mass — signs included.',
          explain: t`$v = \dfrac{(${m1})(${u1}) + (${m2})(${u2})}{${m1 + m2}} = ${s3(v)}$ m/s${v < 0 ? ' — in the second lump’s direction' : ''}.`,
          visual: snaps({ m1, m2, u1, u2, e: 0, show: 'before' }, 'The two lumps just before they meet.'),
        };
      },
    }),
    num({
      id: 'ke-lost', difficulty: 2,
      gen(r) {
        const m1 = r.pick([0.5, 1, 2]), m2 = r.pick([1.5, 3, 4]), u = r.pick([2, 3, 5]);
        const pct = (100 * m2) / (m1 + m2);
        return {
          prompt: t`A ${m1} kg ball of putty moving at ${u} m/s hits a ${m2} kg cart at rest and sticks to it. What percentage of the kinetic energy is lost? (Ignore friction.)`,
          answer: pct, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (100 * m1) / (m1 + m2), feedback: 'That is the percentage that survives, not the percentage lost.' }],
          hints: [t`First the common velocity: $v = \dfrac{m_1u}{m_1 + m_2}$.`, t`Compare $\tfrac12(m_1 + m_2)v^2$ with $\tfrac12 m_1u^2$ — the ratio simplifies to $\dfrac{m_1}{m_1 + m_2}$.`],
          teach: 'When a body sticks to one at rest, the fraction of kinetic energy kept is m₁/(m₁ + m₂); the rest is lost.',
          explain: t`$v = \dfrac{${m1}\times${u}}{${m1 + m2}}$; kept fraction $\dfrac{K_f}{K_i} = \dfrac{m_1}{m_1 + m_2} = ${s3(m1 / (m1 + m2))}$, so ${s3(pct)}% is lost — whatever the speed. The heavier the target, the more is lost.`,
          visual: snaps({ m1, m2, u1: u, u2: 0, e: 0, show: 'before', names: ['putty', 'cart'] }, 'Just before the putty hits.'),
        };
      },
    }),
    num({
      id: 'elastic-rest', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1, 2, 3]), m2 = r.pick([2, 4, 5].filter((x) => x !== m1)), u = r.pick([2, 3, 4, 6]);
        const v1 = ((m1 - m2) * u) / (m1 + m2);
        return {
          prompt: t`A ${m1} kg glider moving at ${u} m/s on an air track hits a ${m2} kg glider at rest. The collision is elastic. What is the first glider’s velocity afterwards? (Positive: its original direction.)`,
          answer: v1, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: -v1, feedback: 'Check the sign: a lighter glider hitting a heavier one bounces back (negative); a heavier one carries on (positive).' }, { value: 0, feedback: 'Stopping dead is what happens only with equal masses.' }],
          hints: [t`For an elastic collision with the target at rest, $v_{1f} = \dfrac{m_1 - m_2}{m_1 + m_2}\,v_{1i}$.`, 'If m₁ < m₂ the answer is negative: the glider bounces back.'],
          teach: 'In an elastic collision with a target at rest, v₁f = (m₁ − m₂)/(m₁ + m₂) v₁i: a light body bounces back, a heavy one carries on.',
          explain: t`$v_{1f} = \dfrac{${m1} - ${m2}}{${m1} + ${m2}}\times${u} = ${s3(v1)}$ m/s. (And $v_{2f} = \dfrac{2(${m1})}{${m1 + m2}}\times${u} = ${s3((2 * m1 * u) / (m1 + m2))}$ m/s: check that both momentum and kinetic energy balance.)`,
          visual: snaps({ m1, m2, u1: u, u2: 0, e: 1, show: 'before' }, 'Just before the collision.'),
        };
      },
    }),
    mcq({
      id: 'clay-stop', difficulty: 2,
      prompt: 'Two identical lumps of clay fly straight at each other at the same speed, collide and stick. What happens?',
      choices: [
        'They stop dead: momentum is conserved (it was zero), and all the kinetic energy is lost',
        'They stop, so momentum was lost in the collision',
        'They must bounce apart at their original speeds, to conserve kinetic energy',
        'They keep moving together, since kinetic energy is turned into momentum',
      ],
      answer: 0,
      why: {
        1: 'The total momentum was zero before — equal and opposite momenta — and it is zero after. Nothing was lost.',
        2: 'Kinetic energy is conserved only in elastic collisions. Clay that sticks is the opposite extreme.',
        3: 'Energy and momentum are different quantities and cannot turn into each other. The total momentum is zero, so they cannot move off together.',
      },
      hints: ['What is the total momentum before? Add two equal and opposite vectors.', 'Momentum after must be the same — what does that say about the stuck-together lump?'],
      teach: 'Momentum is conserved even when every joule of kinetic energy disappears into heat and deformation.',
      explain: 'Total momentum before: m v + m(−v) = 0. After: the lump has total momentum zero, so it is at rest. Every joule of kinetic energy went into deforming and warming the clay — while momentum was conserved exactly.',
      visual: snaps({ m1: 1, m2: 1, u1: 3, u2: -3, e: 0, show: 'before', names: ['A', 'B'] }, 'The two lumps just before they meet.'),
    }),
    num({
      id: 'bounce-e', difficulty: 2,
      gen(r) {
        const h1 = r.pick([1, 1.5, 2]), e0 = r.pick([0.6, 0.7, 0.8, 0.9]);
        const h2 = Math.round(e0 * e0 * h1 * 100) / 100, e = Math.sqrt(h2 / h1);
        return {
          prompt: t`A ball dropped from ${h1} m onto a hard floor bounces back up to ${h2} m. What is the coefficient of restitution between ball and floor? (Ignore air resistance.)`,
          answer: e, tol: { rel: 0.01 },
          errors: [{ value: h2 / h1, feedback: t`Heights go with the square of speed ($h = v^2/2g$): $e$ is the ratio of speeds, so take the square root.` }],
          hints: [t`$e$ = speed leaving the floor ÷ speed arriving (the floor does not move).`, t`Free fall: $v = \sqrt{2gh}$, so $e = \sqrt{2gh_2}/\sqrt{2gh_1} = \sqrt{h_2/h_1}$.`],
          teach: 'For a bounce off a fixed floor, e = √(h₂/h₁): speeds go with the square root of heights.',
          explain: t`$e = \sqrt{h_2/h_1} = \sqrt{${h2}/${h1}} = ${s3(e)}$. Each bounce keeps $e^2 = ${s3(h2 / h1)}$ of the energy.`,
          visual: bounceGraph(h1, e),
        };
      },
    }),
    num({
      id: 'golf', difficulty: 3,
      gen(r) {
        const m1 = r.pick([0.19, 0.2, 0.21]), u = r.pick([40, 45, 50]), m2 = 0.046, e = 0.83;
        const v2 = ((1 + e) * m1 * u) / (m1 + m2);
        return {
          prompt: t`A ${m1} kg golf-club head moving at ${u} m/s strikes a 46 g ball head-on. The coefficient of restitution between them is 0.83 (the most the rules allow for a driver). How fast does the ball leave? (Treat the club head as a free body during the brief impact.)`,
          answer: v2, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: (2 * m1 * u) / (m1 + m2), feedback: 'That is the elastic result (e = 1). With e = 0.83 the ball leaves a little slower.' },
            { value: (e * m1 * u) / (m1 + m2), feedback: 'Close: momentum gives one equation, restitution the other. Solving them gives v₂ = (1 + e) m₁u / (m₁ + m₂).' },
          ],
          hints: [t`Momentum: $m_1u = m_1v_1 + m_2v_2$. Restitution: $v_2 - v_1 = e\,u$.`, t`Eliminate $v_1$: $v_1 = v_2 - eu$, so $m_1u = m_1(v_2 - eu) + m_2v_2$.`, t`$v_2 = \dfrac{(1 + e)\,m_1u}{m_1 + m_2}$.`],
          teach: 'Momentum conservation plus the restitution equation give both velocities after any 1D collision.',
          explain: t`$v_2 = \dfrac{(1.83)(${m1})(${u})}{${m1} + 0.046} = ${s3(v2)}$ m/s — about ${fmt(v2 / u, 3)} times the club’s speed. Golfers call that ratio the smash factor; the best drives get close to 1.5.`,
          visual: snaps({ m1, m2: 0.046, u1: u, u2: 0, e, show: 'before', names: ['club head', 'ball'] }, 'Just before impact (a one-dimensional idealisation).'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-slingshot', difficulty: 3, transfer: true,
      gen(r) {
        const U = 13.1, v = r.pick([8, 10, 12]);
        const vf = v + 2 * U;
        return {
          prompt: t`A probe flies toward Jupiter head-on at ${v} km/s (relative to the Sun), while Jupiter moves toward it at ${U} km/s. Jupiter’s gravity swings the probe right round, a full 180°, and it leaves moving the way Jupiter moves. Treat the encounter as an elastic collision with a body of enormous mass. How fast is the probe moving afterwards, relative to the Sun?`,
          answer: vf, units: 'km/s', tol: { rel: 0.01 },
          errors: [
            { value: v, feedback: 'That is true in Jupiter’s frame, where the planet is (almost) at rest. Back in the Sun’s frame, add Jupiter’s velocity.' },
            { value: v + U, feedback: 'In Jupiter’s frame the probe approaches at v + U and leaves at v + U. Then add Jupiter’s U once more to return to the Sun’s frame.' },
          ],
          hints: ['Work in Jupiter’s frame: there the planet is at rest and, being enormously heavy, sends the probe back at the speed it arrived.', `In Jupiter’s frame the probe arrives at ${v} + ${U} km/s. Afterwards it moves at that speed the other way — then add Jupiter’s velocity back.`],
          teach: 'A gravity assist is an elastic “collision” with a moving planet: speed is unchanged in the planet’s frame, but in the Sun’s frame the probe can gain up to twice the planet’s speed.',
          explain: t`Jupiter’s frame: in at ${s3(v + U)} km/s, out at ${s3(v + U)} km/s (elastic, and Jupiter’s mass is about $10^{24}$ times the probe’s). Sun’s frame: $${s3(v + U)} + ${U} = ${s3(vf)}$ km/s. The energy comes from Jupiter’s orbital motion, which slows imperceptibly. Real flybys bend the path by less than 180° and gain less — but enough to send Voyager 2 on to Saturn, Uranus and Neptune.`,
          visual: lineArrows([{ to: U, label: `Jupiter: +${U} km/s`, color: 'warn' }, { to: -v, label: `probe before: −${v} km/s`, color: 'accent' }], { xlabel: 'velocity (km/s)', caption: 'Velocities relative to the Sun, along the line of the encounter (an idealised head-on flyby).' }),
        };
      },
    }),
    num({
      id: 'cp-ballistic', difficulty: 3,
      gen(r) {
        const m = r.pick([5, 8, 10]) / 1000, M = r.pick([1, 1.5, 2]), h = r.pick([5, 8, 10, 12]) / 100;
        const vb = Math.sqrt(2 * G * h), v = ((m + M) / m) * vb;
        const r4 = (x) => +x.toFixed(4);
        const ang = Math.acos(1 - h / 1.02);            // a 1.02 m string, so the drawing is to scale
        return {
          prompt: t`A ballistic pendulum: a ${nice(m * 1000)} g bullet buries itself in a ${M} kg wooden block hanging from light strings, and the block swings up until it is ${nice(h * 100)} cm higher. How fast was the bullet moving? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: vb, feedback: 'That is the block’s speed just after the impact. The bullet was much faster: use momentum to go back through the collision.' },
            { value: Math.sqrt((2 * (m + M) * G * h) / m), feedback: 'Kinetic energy is not conserved when the bullet embeds itself — most of it becomes heat. Use momentum for the collision, energy only for the swing.' },
          ],
          hints: ['Two stages: a perfectly inelastic collision (momentum conserved), then a swing (mechanical energy conserved).', t`Swing: $\tfrac12 V^2 = gh$, so $V = \sqrt{2gh}$.`, t`Collision: $mv = (m + M)V$.`],
          teach: 'Split it: momentum through the collision (energy is not conserved there), then energy through the swing.',
          explain: t`$V = \sqrt{2(9.8)(${nice(h)})} = ${s3(vb)}$ m/s, then $v = \dfrac{m + M}{m}\,V = \dfrac{${nice(m + M)}}{${nice(m)}}(${s3(vb)}) = ${s3(v)}$ m/s. Over 99% of the bullet’s kinetic energy became heat in the wood.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-1.3, 1.3], y: [-0.25, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [
                seg([-0.3, 1.2], [0.3, 1.2], 'ink2', 3),
                seg([0, 1.2], [0, 0.18], 'ink3', 1.4),
                seg([0, 1.2], [r4(1.02 * Math.sin(ang)), r4(1.2 - 1.02 * Math.cos(ang))], 'ink3', 1.4, true),
                seg([-0.2, -0.06], [r4(1.02 * Math.sin(ang) + 0.42), -0.06], 'ink4', 1, true),
                seg([0.2, r4(h - 0.06)], [r4(1.02 * Math.sin(ang) + 0.42), r4(h - 0.06)], 'ink4', 1, true),
              ],
              shade: [{ fn: '0.18', lower: '-0.06', from: -0.14, to: 0.14, color: 'warn', alpha: 0.75 }, { fn: `${r4(h + 0.18)}`, lower: `${r4(h - 0.06)}`, from: r4(1.02 * Math.sin(ang) - 0.14), to: r4(1.02 * Math.sin(ang) + 0.14), color: 'warn', alpha: 0.35 }],
              arrows: [{ from: [-1.15, 0.06], to: [-0.2, 0.06], color: 'accent', label: 'bullet', labelDy: -12, labelDx: -46 }, { from: [r4(1.02 * Math.sin(ang) + 0.34), -0.06], to: [r4(1.02 * Math.sin(ang) + 0.34), r4(h - 0.06)], color: 'gold', label: 'h', labelDx: 6, labelDy: 4 }],
            },
            caption: 'The block at rest and at the top of its swing (faded), roughly to scale for a 1 m string.',
          },
        };
      },
    }),
    num({
      id: 'cp-neutron', difficulty: 3, transfer: true,
      gen(r) {
        const [A, what] = r.pick([[2, 'deuterium (in heavy water)'], [9, 'beryllium'], [12, 'carbon (graphite)']]);
        const kept = 100 * ((A - 1) / (A + 1)) ** 2;
        return {
          prompt: t`In a nuclear reactor (or a nuclear-thermal rocket engine) fast neutrons are slowed by collisions with the nuclei of a moderator. A neutron (mass 1 u) hits a ${what} nucleus (mass ${A} u), at rest, head-on and elastically. What percentage of its kinetic energy does the neutron keep?`,
          answer: kept, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: (100 * (A - 1)) / (A + 1), feedback: 'That is the ratio of speeds. Kinetic energy goes with the square of speed.' },
            { value: 100 - kept, feedback: 'That is the percentage handed to the nucleus. The neutron keeps the rest.' },
          ],
          hints: [t`Elastic, target at rest: $v_{1f} = \dfrac{m_1 - m_2}{m_1 + m_2}v_{1i} = \dfrac{1 - ${A}}{1 + ${A}}v_{1i}$.`, 'The fraction of kinetic energy kept is (v₁f/v₁i)².'],
          teach: 'A light particle loses the most energy to a target close to its own mass — which is why moderators use light nuclei.',
          explain: t`$\dfrac{v_{1f}}{v_{1i}} = \dfrac{1 - ${A}}{1 + ${A}} = ${s3((1 - A) / (1 + A))}$, so it keeps $(${s3((1 - A) / (1 + A))})^2 = ${s3(kept)}\%$ of its energy (it bounces back). Light nuclei moderate best; a hydrogen nucleus, of equal mass, can take it all in one head-on hit.`,
          visual: massDots([{ x: 0, m: 1, label: 'neutron, 1 u' }, { x: 3, m: A, label: `nucleus, ${A} u`, color: 'violet' }], { rod: false, numbers: false, axes: false, xlabel: '', x: [-0.8, 4], extra: { arrows: [{ from: [0.25, 0], to: [1.3, 0], color: 'accent', label: 'v' }] }, caption: 'Head-on, just before the collision. Dot areas grow with mass.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §9.4 Types of collisions', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-4-types-of-collisions' },
    { label: 'Gravity assist (overview)', url: 'https://en.wikipedia.org/wiki/Gravity_assist' },
  ],
});
