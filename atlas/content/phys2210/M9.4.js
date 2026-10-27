// Collisions in two dimensions: conserve each component of momentum separately.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { vectorPicture } from './_vectors.js';
import { seg } from './_momentum.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const comma = (x) => x.toLocaleString('en-US');
const DEG = Math.PI / 180;
const r4 = (x) => +x.toFixed(4);

// two momenta, tip to tail (or both from the origin), optionally with their sum
function momenta(p1, p2, { sum = false, tipToTail = true, labels = ['p₁', 'p₂'], caption, arc } = {}) {
  const from2 = tipToTail ? p1 : [0, 0];
  // with a sum drawn, the second arrow and the sum share a tip: label the second arrow at its middle
  const arrows = [{ to: p1, label: labels[0], color: 'accent' }, { from: from2, to: [from2[0] + p2[0], from2[1] + p2[1]], label: labels[1], color: 'violet', mid: sum }];
  if (sum) arrows.push({ to: [p1[0] + p2[0], p1[1] + p2[1]], label: 'total', color: 'gold' });
  return vectorPicture({ arrows, numbers: false, xlabel: 'east (x)', ylabel: 'north (y)', arc, caption: caption ?? 'Momentum vectors, drawn to scale.' });
}

export default lesson({
  id: 'phys2210.M9.4',
  title: 'Collisions in two dimensions',
  minutes: 11, difficulty: 3,
  intro: t`Momentum is a vector, so when bodies collide in a plane its conservation is **two equations, one for each component**:

$$m_1v_{1i,x} + m_2v_{2i,x} = m_1v_{1f,x} + m_2v_{2f,x}$$
$$m_1v_{1i,y} + m_2v_{2i,y} = m_1v_{1f,y} + m_2v_{2f,y}$$

Choose axes, split every momentum into components, and conserve each sum on its own. One striking result falls out: when two **equal masses** collide **elastically** and one was at rest, they fly apart **at right angles** — unless they hit dead centre.`,
  symbols: [
    { tex: 'v_{1i,x}', text: 'the $x$-component of body 1’s velocity before (i) the collision, in m/s; $f$ marks after' },
    { tex: 'm_1v_{1,x}', text: 'the $x$-component of body 1’s momentum: $m_1v_1\\cos\\theta_1$ if it moves at angle $\\theta_1$ to the $x$-axis' },
    { tex: 'm_1v_{1,y}', text: 'the $y$-component: $m_1v_1\\sin\\theta_1$' },
    { tex: '\\theta', text: 'a direction, measured from the $x$-axis' },
    { tex: '\\textstyle\\sum p_x,\\ \\sum p_y', text: 'the totals of the components: each one separately the same before and after' },
  ],
  why: 'Real collisions are rarely head-on: accident reconstruction, billiards, particle tracks in a detector and fragments of a satellite breakup all need momentum conserved as a vector.',
  visual: {
    type: 'mech-collide',
    title: 'Glancing collisions on an air table',
    lead: t`Puck 1 slides toward puck 2, at rest, aimed off-centre by the **impact parameter** $b$. The panel below adds the momenta tip to tail: before, and after. Press **Play**, then change $b$, the masses and the restitution $e$.`,
    tasks: [
      'Equal masses, e = 1: set b anywhere but 0 — the angle between the paths afterwards is always 90°.',
      'Lower e: the angle closes below 90°, and kinetic energy is lost. The gold total momentum is untouched.',
      'Make puck 2 heavier than puck 1 and aim nearly head-on: puck 1 bounces backward.',
    ],
    params: { dim: 2, sliders: true, cmFrame: true, m1: 1, m2: 1, u1: 3, b: 0.5, e: 1, time: 0.85 },
  },
  example: {
    prompt: t`At an icy intersection a 1400 kg car heading east at 18 m/s collides with a 2200 kg van heading north at 14 m/s. They lock together. Find the velocity of the wreck just after the crash.`,
    visual: momenta([25.2, 0], [0, 30.8], { sum: true, labels: ['car: 25.2', 'van: 30.8'], arc: { from: 0, to: 50.7, r: 7, label: 'θ' }, caption: 'Momenta in thousands of kg·m/s, tip to tail; the gold sum is the wreck’s momentum. Drawn to scale.' }),
    steps: [
      { label: 'Components before', text: t`Take $x$ east and $y$ north. Car: $(1400\times18,\ 0) = (25{,}200,\ 0)$ kg·m/s. Van: $(0,\ 2200\times14) = (0,\ 30{,}800)$ kg·m/s.` },
      { label: 'Conserve x', text: t`$(1400 + 2200)\,v_x = 25{,}200 \Rightarrow v_x = 7.00$ m/s.` },
      { label: 'Conserve y', text: t`$3600\,v_y = 30{,}800 \Rightarrow v_y = 8.56$ m/s.` },
      { label: 'Combine', text: t`$v = \sqrt{7.00^2 + 8.56^2} = 11.1$ m/s, at $\theta = \tan^{-1}(8.56/7.00) = 50.7°$ north of east.` },
      { label: 'Sense check', text: t`The wreck heads more north than east because the van carried more momentum, though it was slower. Accident investigators run this calculation backwards, from the skid marks to the speeds before the crash.` },
    ],
    answer: t`$11.1$ m/s at $50.7°$ north of east.`,
  },
  practice: [
    num({
      id: 'total-p', difficulty: 1,
      gen(r) {
        const m1 = r.pick([2, 3, 4]), v1 = r.pick([3, 4, 5]), m2 = r.pick([1, 2, 5]), v2 = r.pick([2, 3, 6]);
        const p1 = m1 * v1, p2 = m2 * v2, P = Math.hypot(p1, p2);
        return {
          prompt: t`On an air table, a ${m1} kg puck slides east at ${v1} m/s and a ${m2} kg puck slides north at ${v2} m/s. What is the size of their total momentum?`,
          answer: P, units: 'kg m/s', tol: { rel: 0.01 },
          errors: [{ value: p1 + p2, feedback: 'Perpendicular momenta do not add like numbers: add them as vectors, with Pythagoras.' }],
          hints: ['Find each puck’s momentum: they are perpendicular vectors.', t`$|\vec P| = \sqrt{p_1^2 + p_2^2}$.`],
          teach: 'Total momentum is a vector sum: perpendicular momenta combine by Pythagoras.',
          explain: t`$p_1 = ${p1}$ kg·m/s east, $p_2 = ${p2}$ kg·m/s north, so $|\vec P| = \sqrt{${p1}^2 + ${p2}^2} = ${s3(P)}$ kg·m/s.`,
          visual: momenta([p1, 0], [0, p2]),
        };
      },
    }),
    num({
      id: 'stick-angle', difficulty: 2,
      gen(r) {
        const m1 = r.pick([1000, 1200, 1500]), v1 = r.pick([12, 15, 20]), m2 = r.pick([1800, 2000, 2500]), v2 = r.pick([8, 10, 12]);
        const ang = Math.atan2(m2 * v2, m1 * v1) / DEG;
        return {
          prompt: t`A ${comma(m1)} kg car heading east at ${v1} m/s and a ${comma(m2)} kg car heading north at ${v2} m/s collide and stick together. In what direction does the wreck move, in degrees north of east?`,
          answer: ang, units: 'deg', tol: { rel: 0.01 },
          errors: [
            { value: Math.atan2(v2, v1) / DEG, feedback: 'Use the momenta, not the velocities: the heavier car counts for more.' },
            ...(Math.abs(90 - 2 * ang) > 2 ? [{ value: 90 - ang, feedback: t`That angle is measured from north. The question asks for degrees north of east: $\tan\theta = p_\text{north}/p_\text{east}$.` }] : []),
          ],
          hints: ['The wreck’s momentum is the vector sum of the two cars’ momenta.', t`$\tan\theta = \dfrac{p_\text{north}}{p_\text{east}} = \dfrac{m_2v_2}{m_1v_1}$.`],
          teach: 'The direction of a stuck-together wreck is the direction of the total momentum.',
          explain: t`$\tan\theta = \dfrac{${comma(m2)}\times${v2}}{${comma(m1)}\times${v1}} = ${s3((m2 * v2) / (m1 * v1))}$, so $\theta = ${s3(ang)}°$ north of east.`,
          visual: momenta([m1 * v1, 0], [0, m2 * v2], { tipToTail: false, caption: 'The two momenta before the crash, tails together, to scale.' }),
        };
      },
    }),
    mcq({
      id: 'ninety', difficulty: 2,
      prompt: 'A billiard ball hits an identical ball at rest, off-centre. Treat the collision as elastic and the balls as frictionless. What is the angle between their paths afterwards?',
      choices: ['90°', '45°', '180°: they go opposite ways', 'Anything from 0° to 180°, depending on the aim'],
      answer: 0,
      why: {
        1: '45° would be each ball’s deflection only for one particular aim; the angle between the two paths is the same for every aim.',
        2: 'Opposite paths would need momentum backward; the total momentum points forward, along the first ball’s path.',
        3: 'The aim sets how the speed is shared, but for equal masses and an elastic collision the opening angle is always 90° (except head-on).',
      },
      hints: [t`Momentum: $\vec v_{1i} = \vec v_{1f} + \vec v_{2f}$ (equal masses cancel). Energy: $v_{1i}^2 = v_{1f}^2 + v_{2f}^2$.`, 'Three vectors, one the sum of the other two, and the squares of their lengths add like Pythagoras: what kind of triangle is that?'],
      teach: 'Equal masses, elastic, one at rest: the paths afterwards are perpendicular.',
      explain: t`Momentum says $\vec v_{1i} = \vec v_{1f} + \vec v_{2f}$; energy says $v_{1i}^2 = v_{1f}^2 + v_{2f}^2$. Squaring the first gives $v_{1i}^2 = v_{1f}^2 + v_{2f}^2 + 2\,\vec v_{1f}\cdot\vec v_{2f}$, so $\vec v_{1f}\cdot\vec v_{2f} = 0$: perpendicular. (Real billiard balls spin and lose a little energy, so the angle is a few degrees less.)`,
      visual: { type: 'mech-collide', params: { dim: 2, view: 'snapshots', show: 'before', m1: 0.17, m2: 0.17, u1: 3, b: 0.55, values: false, bars: [] }, caption: 'The moment of contact, seen from above; the dashed line joins the centres.' },
    }),
    num({
      id: 'find-p2', difficulty: 3,
      gen(r) {
        const u = r.pick([2, 3, 4]), th = r.pick([30, 40, 50, 60]), f = r.pick([0.8, 0.9, 1]);
        const v1 = Math.round(f * u * Math.cos(th * DEG) * 100) / 100;
        const vx = u - v1 * Math.cos(th * DEG), vy = -v1 * Math.sin(th * DEG), v2 = Math.hypot(vx, vy);
        const errors = [{ value: u - v1, feedback: 'Speeds do not subtract like that in two dimensions: conserve the x and y components separately.' }];
        if (f < 1) errors.push({ value: Math.sqrt(u * u - v1 * v1), feedback: 'That assumes kinetic energy is conserved. Nothing says this collision is elastic: use momentum components.' });
        return {
          prompt: t`A pool ball moving at ${u} m/s along $+x$ hits an identical ball at rest. Afterwards the first ball moves at ${nice(v1)} m/s at ${th}° above the $x$-axis. How fast does the second ball move?`,
          answer: v2, units: 'm/s', tol: { rel: 0.01 },
          errors,
          hints: ['Equal masses cancel from the momentum equations: work with velocities.', t`$x$: $${u} = ${nice(v1)}\cos ${th}° + v_{2x}$. $y$: $0 = ${nice(v1)}\sin ${th}° + v_{2y}$.`, t`Then $v_2 = \sqrt{v_{2x}^2 + v_{2y}^2}$.`],
          teach: 'With one body’s velocity afterwards known, each momentum component gives one component of the other’s.',
          explain: t`$v_{2x} = ${u} - ${nice(v1)}\cos ${th}° = ${s3(vx)}$ m/s; $v_{2y} = -${nice(v1)}\sin ${th}° = ${s3(vy)}$ m/s; so $v_2 = ${s3(v2)}$ m/s, at ${s3(Math.abs(Math.atan2(vy, vx) / DEG))}° below the $x$-axis.${f === 1 ? ' (The angle between the paths is 90°: this one was elastic.)' : ''}`,
          visual: vectorPicture({ arrows: [{ to: [u, 0], label: 'ball 1 before', color: 'accent' }, { to: [r4(v1 * Math.cos(th * DEG)), r4(v1 * Math.sin(th * DEG))], label: 'ball 1 after', color: 'violet' }], numbers: false, caption: 'Ball 1’s velocity before and after (equal masses, so these are its momenta too, in proportion). Drawn to scale.' }),
        };
      },
    }),
    mcq({
      id: 'wall', difficulty: 2,
      prompt: 'A puck slides across frictionless ice and bounces off a smooth, straight wall. Which part of its momentum is unchanged by the bounce?',
      choices: ['The component parallel to the wall', 'The component perpendicular to the wall', 'Both components', 'Neither: the wall changes the whole vector'],
      answer: 0,
      why: {
        1: 'The wall pushes perpendicular to itself: that is exactly the component it changes (it reverses it).',
        2: 'The puck’s direction changes, so its momentum vector changes. Only one component survives.',
        3: 'A smooth wall can only push straight out from its surface, so the parallel component feels no force at all.',
      },
      hints: ['In which direction can a smooth (frictionless) wall push?', 'A force changes momentum only along its own direction.'],
      teach: 'Momentum is conserved component by component: a force along one direction leaves the perpendicular component alone.',
      explain: 'A smooth wall pushes only perpendicular to its surface, so the impulse is perpendicular to the wall: the perpendicular component reverses, the parallel component is untouched. The same idea makes the x-equation hold even when gravity acts in y.',
      visual: {
        type: 'graph',
        params: {
          x: [-3.2, 3.2], y: [-2.2, 2.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          shade: [{ fn: '2.2', lower: '-2.2', from: 2, to: 2.4, color: 'ink3', alpha: 0.5 }],
          arrows: [{ from: [-1.6, -1.8], to: [1.85, -0.05], color: 'accent', label: 'before', labelDx: -64, labelDy: -14 }, { from: [1.85, 0.05], to: [-1.6, 1.8], color: 'violet', label: 'after', labelDx: -46, labelDy: 0 }],
        },
        caption: 'Seen from above: the puck’s velocity before and after hitting the wall (grey).',
      },
    }),
    num({
      id: 'explode3', difficulty: 3,
      gen(r) {
        const m1 = r.pick([0.5, 1, 1.5]), v1 = r.pick([6, 8, 10]), m2 = r.pick([0.5, 1, 2]), v2 = r.pick([4, 6, 9]), m3 = r.pick([1, 1.5, 2.5]);
        const p1 = m1 * v1, p2 = m2 * v2, v3 = Math.hypot(p1, p2) / m3;
        return {
          prompt: t`A ${nice(m1 + m2 + m3)} kg object at rest in deep space bursts into three pieces. A ${m1} kg piece flies off east at ${v1} m/s and a ${m2} kg piece north at ${v2} m/s. How fast does the third piece (${m3} kg) move?`,
          answer: v3, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: (p1 + p2) / m3, feedback: 'The first two momenta are perpendicular: their sum has size √(p₁² + p₂²), not p₁ + p₂.' },
            ...(Math.abs(Math.hypot(v1, v2) - v3) > 0.02 * v3 ? [{ value: Math.hypot(v1, v2), feedback: 'Momentum, not velocity, is conserved: weight each velocity by its mass, then divide by the third mass.' }] : []),
          ],
          hints: ['Total momentum is zero before, so the three momenta add to zero after.', t`$\vec p_3 = -(\vec p_1 + \vec p_2)$, so $|\vec p_3| = \sqrt{p_1^2 + p_2^2}$.`, 'Divide by the third mass.'],
          teach: 'For an explosion from rest, the last piece’s momentum balances the vector sum of all the others.',
          explain: t`$|\vec p_3| = \sqrt{(${nice(p1)})^2 + (${nice(p2)})^2} = ${s3(Math.hypot(p1, p2))}$ kg·m/s, pointing south-west; $v_3 = ${s3(Math.hypot(p1, p2))}/${m3} = ${s3(v3)}$ m/s.`,
          visual: momenta([p1, 0], [0, p2], { tipToTail: false, labels: ['piece 1', 'piece 2'], caption: 'The momenta of the first two pieces, to scale. The third must cancel their sum.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-intersection', difficulty: 2,
      gen(r) {
        const m1 = r.pick([900, 1100, 1300]), v1 = r.pick([14, 16, 20]), m2 = r.pick([1600, 2100, 2400]), v2 = r.pick([9, 11, 13]);
        const vx = (m1 * v1) / (m1 + m2), vy = (m2 * v2) / (m1 + m2), v = Math.hypot(vx, vy);
        return {
          prompt: t`A ${comma(m1)} kg car going east at ${v1} m/s and a ${comma(m2)} kg pickup going north at ${v2} m/s collide and lock together. How fast does the wreck move just after the collision?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: (m1 * v1 + m2 * v2) / (m1 + m2), feedback: 'The two momenta are perpendicular: conserve x and y separately, then combine with Pythagoras.' },
            { value: Math.hypot(v1, v2), feedback: 'Momentum, not velocity, is conserved: divide each momentum by the total mass.' },
          ],
          hints: ['Conserve x and y separately.'],
          teach: 'Two-dimensional momentum conservation is two one-dimensional problems, recombined at the end.',
          explain: t`$v_x = \dfrac{${comma(m1 * v1)}}{${comma(m1 + m2)}} = ${s3(vx)}$ m/s, $v_y = \dfrac{${comma(m2 * v2)}}{${comma(m1 + m2)}} = ${s3(vy)}$ m/s, so $v = ${s3(v)}$ m/s.`,
          visual: momenta([m1 * v1, 0], [0, m2 * v2], { tipToTail: false, labels: ['car', 'pickup'], caption: 'The momenta before the crash, to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-protons', difficulty: 3, transfer: true,
      gen(r) {
        const u = r.pick([2000, 3000, 4000]), th = r.pick([25, 35, 50, 65]);
        const v1 = u * Math.cos(th * DEG), c = Math.cos(th * DEG), s = Math.sin(th * DEG), c2 = Math.cos((90 - th) * DEG), s2 = Math.sin((90 - th) * DEG);
        return {
          prompt: t`A bubble-chamber photograph shows a proton moving at ${comma(u)} km/s — about ${nice(u / 3000)}% of the speed of light, slow enough for Newton’s mechanics — hitting a proton at rest. The two tracks afterwards leave at ${th}° and ${90 - th}° on either side of the incoming track. Treat the collision as elastic. How fast is the proton on the ${th}° track moving?`,
          answer: v1, units: 'km/s', tol: { rel: 0.01 },
          errors: [
            { value: u / 2, feedback: 'They do not share the speed equally unless both leave at 45°.' },
            { value: u * s, feedback: 'That is the speed on the other track. A smaller deflection keeps more of the speed: v = u cos θ.' },
          ],
          hints: ['Equal masses: momentum conservation reads u = v₁ cos θ₁ + v₂ cos θ₂ (along the track) and 0 = v₁ sin θ₁ − v₂ sin θ₂ (across it).', `With θ₁ = ${th}° and θ₂ = ${90 - th}°: the second equation gives v₂ = v₁ tan ${th}°.`, 'Substitute: u = v₁ (cos²θ₁ + sin²θ₁)/cos θ₁, so v₁ = u cos θ₁.'],
          teach: 'For equal masses colliding elastically, the paths are perpendicular and each speed is the incoming speed times the cosine of its own deflection.',
          explain: t`Across the track: $v_1\sin${th}° = v_2\sin${90 - th}°$; along it: $u = v_1\cos${th}° + v_2\cos${90 - th}°$. Together: $v_1 = u\cos${th}° = ${comma(Math.round(v1))}$ km/s (and $v_2 = u\sin${th}° = ${comma(Math.round(u * s))}$ km/s). The 90° opening angle is how physicists in the 1950s recognised proton–proton elastic scattering at a glance.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3.4, 3.4], y: [-2.6, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [seg([-3.2, 0], [0, 0], 'accent', 2.4), seg([0, 0], [r4(3 * c), r4(3 * s)], 'violet', 2.4), seg([0, 0], [r4(3 * c2), r4(-3 * s2)], 'good', 2.4), seg([0, 0], [3, 0], 'ink4', 1, true)],
              points: [{ x: 0, y: 0, r: 4, color: 'gold' }, { x: -2.6, y: 0.3, r: 0.01, color: 'accent', label: 'incoming proton' }, { x: r4(3 * c), y: r4(3 * s), r: 0.01, color: 'violet', label: `${th}° track` }, { x: r4(3 * c2), y: r4(-3 * s2), r: 0.01, color: 'good', label: `${90 - th}° track` }],
            },
            caption: 'The tracks, drawn as straight lines (the real chamber’s magnetic field curves them slightly). The struck proton was at the gold dot.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-scalar', difficulty: 2, kind: 'error',
      prompt: t`A 2.0 kg puck moving east at 3.0 m/s collides with a 2.0 kg puck moving north at 4.0 m/s, and they stick. A student writes: “Momentum before: $(2.0)(3.0) + (2.0)(4.0) = 14$ kg·m/s, so $v = 14/4.0 = 3.5$ m/s.” What went wrong?`,
      choices: [
        'The momenta are perpendicular and must be added as vectors: |P| = 10 kg·m/s, so v = 2.5 m/s',
        'Momentum is not conserved when the pucks stick',
        'The total mass should be 2.0 kg, since the pucks are identical',
        'Nothing: 3.5 m/s is right',
      ],
      answer: 0,
      why: {
        1: 'Momentum is conserved whether or not they stick; it is kinetic energy that is lost.',
        2: 'After sticking, both pucks move together: the moving mass is 4.0 kg.',
        3: 'Adding the sizes of perpendicular vectors overcounts: 6 east and 8 north make 10, not 14.',
      },
      hints: ['Draw the two momenta. Can perpendicular arrows be added like numbers?', 'Conserve east and north separately.'],
      teach: 'In two dimensions, conserve each component; never add the sizes of momenta pointing different ways.',
      explain: t`East: $6.0$ kg·m/s; north: $8.0$ kg·m/s; $|\vec P| = \sqrt{6.0^2 + 8.0^2} = 10$ kg·m/s. So $v = 10/4.0 = 2.5$ m/s, at $53°$ north of east.`,
      visual: momenta([6, 0], [0, 8], { caption: 'The two momenta tip to tail, to scale (6 east, 8 north).' }),
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §9.5 Collisions in multiple dimensions', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-5-collisions-in-multiple-dimensions' }],
});
