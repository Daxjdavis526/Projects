// Adding vectors: tip to tail in pictures, component by component in numbers.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { vectorPicture, polar, DEG } from './_vectors.js';

const t = String.raw;
const deg = (x) => (x * 180) / Math.PI;
const add = (...vs) => vs.reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
const mag = (v) => Math.hypot(v[0], v[1]);

// the worked example: a rover's three drives
const LEGS = [[120, 30], [80, 150], [50, 270]].map(([L, a]) => ({ L, a, v: polar(L, a) }));
const R = add(...LEGS.map((l) => l.v));
const tips = LEGS.reduce((acc, l) => [...acc, add(acc[acc.length - 1], l.v)], [[0, 0]]);

export default lesson({
  id: 'phys2210.M2.2',
  title: 'Adding vectors',
  minutes: 9, difficulty: 2,
  intro: t`To add vectors, place them **tip to tail**: the sum — the *resultant* — runs from the first tail to the last tip. In components it is plain arithmetic: add the $x$ parts and add the $y$ parts.

$$\vec R = \vec A + \vec B \quad\Longleftrightarrow\quad R_x = A_x + B_x, \qquad R_y = A_y + B_y$$

**Magnitudes do not simply add**: 3 km east and then 4 km north leaves you 5 km from where you started, not 7. Subtracting is adding the opposite: $\vec A - \vec B = \vec A + (-\vec B)$.`,
  symbols: [
    { tex: '\\vec R', text: 'the resultant: the single vector with the same effect as $\\vec A$ followed by $\\vec B$' },
    { tex: '\\vec A,\\ \\vec B', text: 'the vectors being added — displacements, velocities or forces, but always of the same kind and units' },
    { tex: 'R_x,\\ R_y', text: 'the components of the resultant: the sums of the matching components' },
    { tex: '-\\vec B', text: 'the same length as $\\vec B$, pointing the opposite way: every component changes sign' },
  ],
  why: 'Net force, relative velocity, a pilot’s wind correction and every orbital Δv are vector sums — and in components they are just two (or three) ordinary additions.',
  visual: {
    type: 'graph',
    title: 'Tip to tail',
    lead: t`Drag the tips of $\vec A$ and $\vec B$. A copy of $\vec B$ rides on the tip of $\vec A$, and the gold resultant $\vec R$ runs from the origin to the end of the chain. Compare $|\vec R|$ with $|\vec A| + |\vec B|$.`,
    tasks: [
      'Point B the same way as A: |R| = |A| + |B| — the only time magnitudes simply add.',
      'Point B against A: R shrinks to the difference of their lengths.',
      'Switch to A − B: the copy flips to −B. A − B is the arrow that would carry the tip of B to the tip of A.',
    ],
    params: {
      x: [-6, 8], y: [-4, 6], equal: true, xlabel: 'x', ylabel: 'y',
      alt: 'Two draggable vectors added tip to tail, with their resultant',
      drag: [{ key: 'a', x: 4, y: 1, snap: 0.5 }, { key: 'b', x: 1, y: 3, snap: 0.5 }],
      choices: [{ key: 's', label: 'Operation', options: [[1, 'A + B'], [-1, 'A − B']], value: 1 }],
      curves: [{ param: ['s*bx + t*ax', 's*by + t*ay'], t: [0, 1], color: 'ink3', width: 1.2, dash: true }, { param: ['t*s*bx', 't*s*by'], t: [0, 1], color: 'ink3', width: 1.2, dash: true, when: '1 - s' }],
      arrows: [
        { from: [0, 0], to: ['ax', 'ay'], color: 'accent', label: 'A' },
        { from: [0, 0], to: ['bx', 'by'], color: 'violet', label: 'B' },
        { from: ['ax', 'ay'], to: ['ax + s*bx', 'ay + s*by'], color: 'violet' },
        { from: [0, 0], to: ['ax + s*bx', 'ay + s*by'], color: 'gold', label: 'R' },
      ],
      points: [
        { x: 'ax + s*bx/2 + 0.2', y: 'ay + s*by/2', r: 0.01, color: 'violet', label: 'B moved', when: '1 + s' },
        { x: 'ax + s*bx/2 + 0.2', y: 'ay + s*by/2', r: 0.01, color: 'violet', label: '−B', when: '1 - s' },
      ],
      readouts: [
        { label: '$R_x$', expr: 'ax + s*bx', digits: 3 },
        { label: '$R_y$', expr: 'ay + s*by', digits: 3 },
        { label: '$|\\vec R|$', expr: 'sqrt((ax + s*bx)^2 + (ay + s*by)^2)', digits: 3 },
        { label: '$|\\vec A| + |\\vec B|$', expr: 'sqrt(ax^2 + ay^2) + sqrt(bx^2 + by^2)', digits: 3 },
      ],
    },
    caption: 'Drag either tip; both snap to half-units. The dashed path adds the vectors in the other order — it reaches the same point, because vector addition does not care about order.',
  },
  example: {
    prompt: t`A Mars rover drives ${LEGS[0].L} m at ${LEGS[0].a}°, then ${LEGS[1].L} m at ${LEGS[1].a}°, then ${LEGS[2].L} m at ${LEGS[2].a}° (all angles anticlockwise from east). How far from its start does it end up, and in which direction?`,
    visual: vectorPicture({
      arrows: [
        ...LEGS.map((l, k) => ({ from: tips[k], to: tips[k + 1], color: 'accent', label: `leg ${k + 1}`, mid: true })),
        { to: R, color: 'gold', label: 'R' },
      ],
      xlabel: 'east (m)', ylabel: 'north (m)', caption: 'The three legs tip to tail (blue) and the resultant displacement (gold), drawn to scale.',
    }),
    steps: [
      { label: 'Components of each leg', text: t`$x = L\cos\theta$, $y = L\sin\theta$:

- leg 1: $(${fmt(LEGS[0].v[0], 4)},\ ${fmt(LEGS[0].v[1], 3)})$ m
- leg 2: $(${fmt(LEGS[1].v[0], 4)},\ ${fmt(LEGS[1].v[1], 3)})$ m
- leg 3: $(0,\ ${fmt(LEGS[2].v[1], 3)})$ m` },
      { label: 'Add like with like', text: t`$R_x = ${fmt(LEGS[0].v[0], 4)} - ${fmt(-LEGS[1].v[0], 4)} + 0 = ${fmt(R[0], 3)}$ m, and $R_y = ${fmt(LEGS[0].v[1], 3)} + ${fmt(LEGS[1].v[1], 3)} - ${fmt(-LEGS[2].v[1], 3)} = ${fmt(R[1], 3)}$ m.` },
      { label: 'Back to a length and an angle', text: t`$|\vec R| = \sqrt{${fmt(R[0], 3)}^2 + ${fmt(R[1], 3)}^2} = ${fmt(mag(R), 3)}$ m, at $\theta = \tan^{-1}(${fmt(R[1], 3)}/${fmt(R[0], 3)}) = ${fmt(deg(Math.atan2(R[1], R[0])), 3)}°$ — both components are positive, so no quadrant correction is needed.` },
      { label: 'Sense check', text: t`The rover drove ${LEGS.reduce((s, l) => s + l.L, 0)} m in all but ends only ${fmt(mag(R), 2)} m from its start: the legs partly cancel. The resultant can never be longer than the total distance driven.` },
    ],
    answer: t`$|\vec R| \approx ${fmt(mag(R), 3)}$ m, at about ${fmt(deg(Math.atan2(R[1], R[0])), 2)}° north of east.`,
  },
  practice: [
    mcq({
      id: 'tip-to-tail', difficulty: 1,
      prompt: 'Two displacements are drawn as arrows. How do you find their sum on paper?',
      choices: [
        'Put the tail of the second at the tip of the first; the sum runs from the first tail to the second tip',
        'Put the two tails together; the sum runs from one tip to the other',
        'Add their lengths and keep the direction of the longer one',
        'Put the two tips together; the sum runs between the tails',
      ],
      answer: 0,
      why: {
        1: 'With the tails together, the arrow from one tip to the other is a difference, u − v, not a sum.',
        2: 'Lengths only add when the arrows point the same way; in general the sum is shorter.',
        3: 'Meeting tip to tip reverses one of the arrows, which again gives a difference.',
      },
      hints: ['A displacement is a trip: do the first one, then start the second where the first ended.'],
      visual: vectorPicture({
        arrows: [{ to: [3, 1.2], label: 'u' }, { from: [4.2, -1.4], to: [5.4, 1.4], color: 'violet', label: 'v' }],
        numbers: false,
        caption: 'Two displacements, drawn apart. An arrow may be slid anywhere, as long as it is not turned or stretched: it is still the same vector.',
      }),
      teach: 'Vectors add tip to tail: start each one where the previous one ends.',
      explain: 'Walking along u and then along v takes you from u’s tail to v’s tip, so that arrow is u + v. (The other diagonal of the parallelogram, from tip to tip, is u − v.)',
    }),
    num({
      id: 'sum-from-components', difficulty: 1,
      gen(r) {
        const A = [r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])];
        let B;
        do { B = [r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])]; } while (mag(add(A, B)) < 0.5 || mag(A) + mag(B) < 1.03 * mag(add(A, B)));
        const S = add(A, B);
        return {
          prompt: t`Two displacements are $\vec A = (${A[0]},\ ${A[1]})$ m and $\vec B = (${B[0]},\ ${B[1]})$ m. What is the magnitude of $\vec A + \vec B$?`,
          answer: mag(S), units: 'm', tol: { rel: 0.005 },
          errors: [{ value: mag(A) + mag(B), feedback: 'You added the magnitudes. Add the components first, then take the magnitude of the result.' }],
          hints: [t`Add the components: $R_x = ${A[0]} + (${B[0]})$ and $R_y = ${A[1]} + (${B[1]})$.`, t`Then $|\vec R| = \sqrt{R_x^2 + R_y^2}$.`],
          teach: 'Add vectors component by component; take the magnitude only at the end.',
          explain: t`$\vec R = (${S[0]},\ ${S[1]})$ m, so $|\vec R| = \sqrt{${S[0] * S[0]} + ${S[1] * S[1]}} = ${fmt(mag(S), 3)}$ m.`,
          visual: vectorPicture({ arrows: [{ to: A, label: 'A' }, { from: A, to: S, color: 'violet', label: 'B' }], numbers: false, caption: 'A, then B placed at its tip. The resultant is left for you.' }),
        };
      },
    }),
    num({
      id: 'two-legs', difficulty: 1,
      gen(r) {
        const n = r.pick([1.2, 2.5, 3, 4.5]), e = r.pick([0.8, 1.6, 2, 4]);
        return {
          prompt: t`A survey drone flies ${n} km north, then ${e} km east. How far is it, in a straight line, from where it started?`,
          answer: Math.hypot(n, e), units: 'km', tol: { rel: 0.005 },
          errors: [{ value: n + e, feedback: 'That is the distance flown. The displacement is the straight line from start to finish — the hypotenuse.' }],
          hints: ['The two legs are perpendicular, so they form the two short sides of a right triangle.'],
          teach: 'Perpendicular displacements combine by Pythagoras: |R| = √(a² + b²).',
          explain: t`$|\vec R| = \sqrt{${n}^2 + ${e}^2} = ${fmt(Math.hypot(n, e), 3)}$ km — less than the ${fmt(n + e, 3)} km flown.`,
          visual: vectorPicture({ arrows: [{ to: [0, n], label: 'north leg' }, { from: [0, n], to: [e, n], color: 'violet', label: 'east leg' }], numbers: false, xlabel: 'east', ylabel: 'north' }),
        };
      },
    }),
    num({
      id: 'two-forces', difficulty: 2,
      gen(r) {
        const F1 = r.pick([80, 120, 150]), F2 = r.pick([50, 80, 100]), a = r.pick([40, 60, 75, 110, 130]);
        const S = add([F1, 0], polar(F2, a));
        const diff = Math.sqrt(F1 * F1 + F2 * F2 - 2 * F1 * F2 * Math.cos(a * DEG));
        return {
          prompt: t`Two forces pull on a satellite’s mounting bracket: ${F1} N along the $+x$ axis and ${F2} N at ${a}° to it (anticlockwise). What is the magnitude of the net force?`,
          answer: mag(S), units: 'N', tol: { rel: 0.005 },
          errors: [
            { value: F1 + F2, feedback: 'Magnitudes only add when the forces point the same way. Add components instead.' },
            { value: diff, feedback: 'That is the size of the difference of the two forces. Check the signs as you add the x-components.' },
          ],
          hints: [t`Components of the second force: $(${F2}\cos ${a}^\circ,\ ${F2}\sin ${a}^\circ)$.`, t`$R_x = ${F1} + ${F2}\cos ${a}^\circ$ and $R_y = ${F2}\sin ${a}^\circ$; then $|\vec R| = \sqrt{R_x^2 + R_y^2}$.`],
          teach: 'To add vectors given as magnitudes and angles, convert each to components, add, then convert back.',
          explain: t`$R_x = ${F1} + ${F2}\cos ${a}^\circ = ${fmt(S[0], 4)}$ N and $R_y = ${F2}\sin ${a}^\circ = ${fmt(S[1], 4)}$ N, so $|\vec R| = ${fmt(mag(S), 3)}$ N.`,
          visual: vectorPicture({ arrows: [{ to: [F1, 0], label: `${F1} N` }, { to: polar(F2, a), color: 'violet', label: `${F2} N` }], arc: { from: 0, to: a, label: `${a}°` }, numbers: false }),
        };
      },
    }),
    num({
      id: 'turn-delta-v', difficulty: 2,
      gen(r) {
        const v = r.pick([150, 200, 250]), turn = r.pick([60, 90, 120]);
        const v1 = [v, 0], v2 = polar(v, turn), dv = [v2[0] - v1[0], v2[1] - v1[1]];
        return {
          prompt: t`An aircraft flying east at ${v} m/s turns through ${turn}° to the left and carries on at the same speed. What is the magnitude of its change in velocity, $\Delta\vec v = \vec v_\text{after} - \vec v_\text{before}$?`,
          answer: mag(dv), units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: 'The speed did not change, but the velocity did: a vector changes when its direction does.' }, { value: 2 * v, feedback: 'That would be a full reversal. Subtract the components to find the actual change.' }],
          hints: [t`Write both velocities in components: before $(${v},\ 0)$, after $(${v}\cos ${turn}^\circ,\ ${v}\sin ${turn}^\circ)$.`, 'Subtract component by component, then take the magnitude.'],
          teach: 'A change of direction is a change of velocity, even at constant speed — that is why turning requires a force.',
          explain: t`$\Delta\vec v = (${fmt(dv[0], 4)},\ ${fmt(dv[1], 4)})$ m/s, so $|\Delta\vec v| = ${fmt(mag(dv), 3)}$ m/s — although the speed never changed. In general $|\Delta\vec v| = 2v\sin(\text{turn}/2)$.`,
          visual: vectorPicture({ arrows: [{ to: v1, label: 'before' }, { to: v2, color: 'violet', label: 'after' }, { from: v1, to: v2, color: 'gold', label: 'Δv', mid: true }], arc: { from: 0, to: turn, label: `${turn}°` }, numbers: false, caption: 'Both velocities drawn from one point; the change Δv runs from the tip of the old velocity to the tip of the new one.' }),
        };
      },
    }),
    mcq({
      id: 'impossible-resultant', difficulty: 2,
      prompt: 'Forces of 6 N and 8 N act on the same point, in directions you are free to choose. Which net force is impossible?',
      choices: ['15 N', '2 N', '10 N', '14 N'],
      answer: 0,
      why: {
        1: 'Point the forces in opposite directions: 8 − 6 = 2 N.',
        2: 'Put them at right angles: √(6² + 8²) = 10 N.',
        3: 'Point them the same way: 6 + 8 = 14 N.',
      },
      hints: ['What are the largest and smallest resultants two forces can make?'],
      visual: vectorPicture({
        arrows: [{ to: [8, 0] }, { from: [8, 0], to: polar(6, 60).map((c, i) => c + [8, 0][i]), color: 'violet', label: '6 N' }, { to: polar(6, 60).map((c, i) => c + [8, 0][i]), color: 'gold' }],
        points: [{ x: 3.4, y: -1, r: 0.01, color: 'accent', label: '8 N' }, { x: 2.2, y: 3.2, r: 0.01, color: 'gold', label: 'resultant' }],
        curves: [{ param: ['8 + 6*cos(t)', '6*sin(t)'], t: [0, '2*pi'], color: 'ink4', width: 1.2, dash: true }],
        extent: [[2, -6], [14, 6]], numbers: false, pad: 0.12,
        caption: 'One arrangement, tip to tail. Swing the 6 N arrow round and its tip traces the dashed circle: the resultant always runs from the start to a point on that circle.',
      }),
      teach: 'Two vectors add to anything between the difference and the sum of their magnitudes — never more, never less.',
      explain: 'The resultant of 6 N and 8 N lies between 8 − 6 = 2 N (opposed) and 8 + 6 = 14 N (aligned). 15 N is out of reach.',
    }),
    num({
      id: 'heading-correction', difficulty: 3,
      gen(r) {
        const va = r.pick([180, 220, 250, 300]), w = r.pick([40, 50, 60, 80]);
        const ang = deg(Math.asin(w / va));
        const head = polar(va, 90 + ang);
        return {
          prompt: t`A pilot wants to fly due north. The aircraft’s airspeed (its speed through the air) is ${va} km/h, and the wind blows toward the east at ${w} km/h. How many degrees west of north must the pilot point the aircraft so that the ground track is due north?`,
          answer: ang, units: '°', tol: { rel: 0.005 },
          errors: [{ value: deg(Math.atan(w / va)), feedback: t`That uses $\tan$, which would be right if ${va} km/h were the ground speed. But ${va} km/h is the airspeed — the hypotenuse of the triangle — so use $\sin$.` }],
          hints: ['The air velocity plus the wind must point due north: their east–west components must cancel.', t`The westward part of the air velocity must cancel the wind: $${va}\sin\theta = ${w}$.`],
          teach: 'Ground velocity = air velocity + wind; to hold a track, the air velocity’s sideways component must cancel the wind.',
          explain: t`$\sin\theta = ${w}/${va}$, so $\theta = ${fmt(ang, 3)}°$ west of north. The ground speed is then $${va}\cos\theta = ${fmt(va * Math.cos(Math.asin(w / va)), 3)}$ km/h — slower than the airspeed, because part of the effort goes into fighting the wind.`,
          visual: vectorPicture({
            arrows: [{ to: head }, { from: head, to: [0, head[1]], color: 'teal' }, { to: [0, head[1]], color: 'gold' }],
            points: [
              { x: head[0] / 2 - 0.42 * head[1], y: head[1] / 2, r: 0.01, color: 'accent', label: 'air velocity' },
              { x: head[0] * 0.75, y: head[1] * 1.07, r: 0.01, color: 'teal', label: 'wind' },
              { x: 0.03 * head[1], y: head[1] / 2, r: 0.01, color: 'gold', label: 'ground track' },
            ],
            numbers: false, xlabel: 'east', ylabel: 'north', caption: 'The wind triangle: air velocity + wind = ground velocity. Drawn to scale.',
          }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ground-speed', difficulty: 3, transfer: true,
      gen(r) {
        const va = r.pick([180, 220, 250, 300]), w = r.pick([40, 50, 60, 80]);
        return {
          prompt: t`An aircraft points due north with an airspeed of ${va} km/h while the wind blows toward the east at ${w} km/h. What is its speed over the ground?`,
          answer: Math.hypot(va, w), units: 'km/h', tol: { rel: 0.005 },
          errors: [{ value: va + w, feedback: 'The wind is perpendicular to the heading: the velocities add as vectors, not as numbers.' }, { value: va - w, feedback: 'A crosswind neither adds to nor subtracts from the speed directly; the two velocities are perpendicular.' }],
          hints: ['Ground velocity = air velocity + wind velocity.', 'The two are perpendicular.'],
          visual: vectorPicture({
            arrows: [{ to: [0, va], label: 'air velocity' }, { to: [w, 0], color: 'teal', label: 'wind' }],
            points: [{ x: 0, y: 0, r: 5, color: 'ink2' }],
            numbers: false, xlabel: 'east', ylabel: 'north',
            caption: 'The aircraft’s velocity through the air, and the velocity of the air itself, both drawn to scale from the aircraft.',
          }),
          teach: 'Velocities add as vectors: an aircraft’s ground velocity is its air velocity plus the wind’s.',
          explain: t`$v_\text{ground} = \sqrt{${va}^2 + ${w}^2} = ${fmt(Math.hypot(va, w), 4)}$ km/h, drifting ${fmt(deg(Math.atan(w / va)), 3)}° east of north.`,
        };
      },
    }),
    num({
      id: 'cp-three-ropes', difficulty: 3,
      gen(r) {
        const set = r.pick([[[200, 0], [150, 90], [120, 225]], [[180, 0], [100, 120], [90, 250]], [[250, 30], [160, 150], [140, 270]]]);
        const S = add(...set.map(([F, a]) => polar(F, a)));
        return {
          prompt: t`Three ropes pull on a ring: ${set.map(([F, a]) => `${F} N at ${a}°`).join(', ')} (angles anticlockwise from $+x$). What is the magnitude of the net force on the ring?`,
          answer: mag(S), units: 'N', tol: { rel: 0.01 },
          errors: [{ value: set.reduce((s, [F]) => s + F, 0), feedback: 'You added the magnitudes. Resolve each force into components first.' }],
          hints: ['Resolve each force into x- and y-components.', 'Add the three x-components, add the three y-components, then use Pythagoras.'],
          visual: vectorPicture({
            arrows: set.map(([F, a], i) => ({ to: polar(F, a), color: ['accent', 'violet', 'teal'][i], label: `${F} N, ${a}°`, left: Math.cos(a * DEG) < -0.2 })),
            points: [{ x: 0, y: 0, r: 5, color: 'ink2' }],
            numbers: false,
            caption: 'The three pulls on the ring, drawn to scale.',
          }),
          teach: 'Any number of vectors add the same way: resolve each, add the components, then recombine.',
          explain: t`$R_x = ${fmt(S[0], 4)}$ N and $R_y = ${fmt(S[1], 4)}$ N, so $|\vec R| = ${fmt(mag(S), 3)}$ N.`,
        };
      },
    }),
    mcq({
      id: 'cp-sum-zero', difficulty: 2,
      prompt: t`Two nonzero vectors satisfy $\vec A + \vec B = \vec 0$. What can you conclude?`,
      choices: [t`$\vec B$ has the same magnitude as $\vec A$ and points the opposite way`, t`$\vec A$ and $\vec B$ are perpendicular`, t`$\vec A$ and $\vec B$ point the same way`, 'Nothing: any two vectors can add to zero'],
      answer: 0,
      why: {
        1: 'Perpendicular vectors add to something at least as long as either of them.',
        2: 'Vectors pointing the same way add to something longer than either.',
        3: 'Only exact opposites cancel: every component must sum to zero.',
      },
      hints: [t`Write it in components: $A_x + B_x = 0$ and $A_y + B_y = 0$.`],
      teach: 'Two vectors cancel only when they are equal in size and opposite in direction: B = −A.',
      explain: t`$\vec B = -\vec A$: every component of $\vec B$ is the negative of $\vec A$’s, so it has the same length and points the opposite way — like two balanced forces.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §2.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/2-3-algebra-of-vectors' },
  ],
});
