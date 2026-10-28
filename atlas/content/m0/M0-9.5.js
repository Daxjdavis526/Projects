// Adding and resolving vectors — tip to tail, component by component; and splitting a vector along any pair of perpendicular directions.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { D2R, deg, wrap360, seg, circ, plane, dot, note, fit } from './_m0geo.js';

const t = String.raw;
const pol = (m, a) => [m * Math.cos(a * D2R), m * Math.sin(a * D2R)];
const cl = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
// A from the origin, B from A's tip, and (optionally) the resultant R
const tipToTail = (A, B, caption, { R = true, names = ['A', 'B', 'R'], extra = {}, margin } = {}) => {
  const S = [A[0] + B[0], A[1] + B[1]], L = Math.max(Math.hypot(...A), Math.hypot(...B), 1);
  const arrows = [
    { from: [0, 0], to: [N(A[0]), N(A[1])], color: 'accent', width: 2.6, label: names[0] },
    { from: [N(A[0]), N(A[1])], to: [N(S[0]), N(S[1])], color: 'warn', width: 2.6, label: names[1] },
  ];
  if (R) arrows.push({ from: [0, 0], to: [N(S[0]), N(S[1])], color: 'gold', width: 3, label: names[2], labelDx: 8, labelDy: 14 });
  return plane({ ...fit([[0, 0], A, S], margin ?? 0.25 * L, 1), arrows, caption, extra });
};

export default lesson({
  id: 'm0.M0-9.5',
  title: 'Adding and resolving vectors',
  minutes: 10, difficulty: 2,
  intro: t`To add vectors, draw them **tip to tail**: the sum $\vec R$ runs from the first tail to the last tip. On paper that is a triangle; in numbers it is the easiest thing in the lesson — **add the components**:

$$\vec R = \vec A + \vec B = (A_x + B_x,\ \ A_y + B_y), \qquad R = \sqrt{R_x^2 + R_y^2}$$

The magnitudes do **not** add: $|\vec A + \vec B|$ is anything from $\big||\vec A| - |\vec B|\big|$ (opposite) to $|\vec A| + |\vec B|$ (same direction). The reverse job is **resolving**: splitting one vector into parts along two perpendicular directions you choose — along a runway and across it, along a slope and into it. A vector of size $F$ at angle $\varphi$ to a direction has a part $F\cos\varphi$ along it and $F\sin\varphi$ across it.`,
  symbols: [
    { tex: '\\vec A,\\ \\vec B', text: 'the vectors being added (same kind and unit: two forces, two velocities…)' },
    { tex: '\\vec R', text: 'the **resultant**: their sum, the single vector with the same effect' },
    { tex: 'A_x,\\ B_x,\\ R_x', text: 'the $x$-components (and likewise $y$), with signs' },
    { tex: 'R', text: 'the magnitude of the resultant, $|\\vec R|$' },
    { tex: '\\varphi', text: 'when resolving: the angle between the vector and the direction you resolve along' },
  ],
  why: t`Newton’s second law uses the **net** force — the vector sum of every force on a body — and a pilot, a navigator or a mission planner adds velocities all day: airspeed plus wind, orbital velocity plus a burn’s $\Delta v$. Resolving along the right axes (along a slope, along an orbit) is how most mechanics problems become easy. [Physics I](#/lesson/phys2210.M2.2) does it in three dimensions.`,
  visual: {
    type: 'graph',
    title: 'Tip to tail',
    lead: t`$\vec A$ (blue) starts at the origin; $\vec B$ (orange) starts at $\vec A$’s tip; the gold resultant $\vec R$ closes the triangle. Compare $|\vec A| + |\vec B|$ with $|\vec R|$ as you turn $\vec B$.`,
    tasks: [
      t`Set $|\vec A| = 3$ at $0^\circ$ and $|\vec B| = 4$ at $90^\circ$: $|\vec R| = 5$, not $7$.`,
      t`Turn $\vec B$ to $0^\circ$ (same direction as $\vec A$): now $|\vec R| = |\vec A| + |\vec B|$ — the only case where magnitudes add.`,
      t`Turn $\vec B$ to $180^\circ$: $|\vec R| = 1$. Every angle in between gives a length between $1$ and $7$.`,
    ],
    params: {
      x: [-21, 21], y: [-10.5, 10.5], equal: true, aspect: 'wide',
      sliders: [
        { key: 'a', label: t`$|\vec A|$`, min: 0, max: 5, step: 0.1, value: 4, explain: 'The length of the blue vector.' },
        { key: 'p', label: t`direction of $\vec A$`, min: 0, max: 360, step: 1, value: 20, unit: '^\\circ', explain: 'Anticlockwise from the positive x-axis.' },
        { key: 'b', label: t`$|\vec B|$`, min: 0, max: 5, step: 0.1, value: 3, explain: 'The length of the orange vector.' },
        { key: 'q', label: t`direction of $\vec B$`, min: 0, max: 360, step: 1, value: 110, unit: '^\\circ', explain: 'Anticlockwise from the positive x-axis.' },
      ],
      curves: [{ param: ['a*cos(p*pi/180) + b*cos(t)', 'a*sin(p*pi/180) + b*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }],
      arrows: [
        { from: [0, 0], to: ['a*cos(p*pi/180)', 'a*sin(p*pi/180)'], color: 'accent', width: 2.8, label: 'A' },
        { from: ['a*cos(p*pi/180)', 'a*sin(p*pi/180)'], to: ['a*cos(p*pi/180) + b*cos(q*pi/180)', 'a*sin(p*pi/180) + b*sin(q*pi/180)'], color: 'warn', width: 2.8, label: 'B' },
        { from: [0, 0], to: ['a*cos(p*pi/180) + b*cos(q*pi/180)', 'a*sin(p*pi/180) + b*sin(q*pi/180)'], color: 'gold', width: 3.2, label: 'R', labelDx: 8, labelDy: 14 },
      ],
      readouts: [
        { label: t`$R_x = A_x + B_x$`, expr: 'a*cos(p*pi/180) + b*cos(q*pi/180)', digits: 3 },
        { label: t`$R_y = A_y + B_y$`, expr: 'a*sin(p*pi/180) + b*sin(q*pi/180)', digits: 3 },
        { label: t`$|\vec R|$`, expr: 'sqrt((a*cos(p*pi/180) + b*cos(q*pi/180))^2 + (a*sin(p*pi/180) + b*sin(q*pi/180))^2)', digits: 3 },
        { label: t`$|\vec A| + |\vec B|$`, expr: 'a + b', digits: 3 },
      ],
    },
    caption: t`To scale. The faint dashed circle is every place $\vec B$’s tip could reach at its present length: the resultant’s tip always lies on it.`,
  },
  example: {
    prompt: t`An airliner lands toward the $+x$ direction along the runway at an airspeed of $140$ knots. The wind is $25$ kn, blowing toward a direction $130^\circ$ anticlockwise from the landing direction. Resolve the wind along and across the runway, then find how far the pilot must turn the nose into the wind (the **crab angle**) to track straight down the centreline, and the resulting ground speed.`,
    visual: (() => {
      const w = pol(25, 130), d = Math.asin(w[1] / 140), air = [140 * Math.cos(d), -140 * Math.sin(d)], g = [air[0] + w[0], 0];
      return plane({
        x: [-10, 160], y: [-42.5, 42.5], xlabel: 'along runway (kn)', ylabel: 'across (kn)',
        curves: [seg([-10, -3], [160, -3], { color: 'ink4', width: 1 }), seg([-10, 3], [160, 3], { color: 'ink4', width: 1 })],
        arrows: [
          { from: [0, 0], to: [N(air[0]), N(air[1])], color: 'accent', width: 2.6, label: 'airspeed 140', labelDx: -60, labelDy: 16 },
          { from: [N(air[0]), N(air[1])], to: [N(g[0]), 0], color: 'warn', width: 2.6, label: 'wind 25', labelDx: -20, labelDy: -12 },
          { from: [0, 0], to: [N(g[0]), 0], color: 'gold', width: 3, label: 'ground', labelDx: -40, labelDy: -12 },
        ],
        caption: t`To scale: the aircraft’s velocity through the air (blue, crabbed into the wind) plus the wind (orange) gives its velocity over the ground (gold), straight along the runway (grey lines).`,
      });
    })(),
    steps: [
      { label: 'Resolve the wind', text: t`Along the runway: $25\cos 130^\circ = ${sig(25 * Math.cos(130 * D2R), 4)}$ kn — negative, so a **headwind** of $${sig(-25 * Math.cos(130 * D2R), 3)}$ kn. Across: $25\sin 130^\circ = ${sig(25 * Math.sin(130 * D2R), 4)}$ kn of **crosswind**, pushing toward $+y$.` },
      { label: 'Cancel the drift', text: t`To stay on the centreline the across-runway parts must add to zero: the aircraft’s own velocity through the air needs $-${sig(25 * Math.sin(130 * D2R), 4)}$ kn across. With the nose turned by $\delta$: $140\sin\delta = ${sig(25 * Math.sin(130 * D2R), 4)}$.` },
      { label: 'Crab angle', text: t`$\delta = \sin^{-1}\dfrac{${sig(25 * Math.sin(130 * D2R), 4)}}{140} = ${sig(deg(Math.asin((25 * Math.sin(130 * D2R)) / 140)), 3)}^\circ$, nose turned toward the side the wind comes from.` },
      { label: 'Add along', text: t`Along the runway: $140\cos ${sig(deg(Math.asin((25 * Math.sin(130 * D2R)) / 140)), 3)}^\circ + (${sig(25 * Math.cos(130 * D2R), 4)}) = ${sig(140 * Math.cos(Math.asin((25 * Math.sin(130 * D2R)) / 140)), 4)} - ${sig(-25 * Math.cos(130 * D2R), 4)} = ${sig(140 * Math.cos(Math.asin((25 * Math.sin(130 * D2R)) / 140)) + 25 * Math.cos(130 * D2R), 4)}$ kn over the ground.` },
      { label: 'Sense check', text: t`Ground speed is less than airspeed (a headwind helps a landing: less runway used), and $|$airspeed$| - |$wind$| = 115 < ${sig(140 * Math.cos(Math.asin((25 * Math.sin(130 * D2R)) / 140)) + 25 * Math.cos(130 * D2R), 3)} < 165$ ✓.` },
    ],
    answer: t`Headwind $${sig(-25 * Math.cos(130 * D2R), 3)}$ kn, crosswind $${sig(25 * Math.sin(130 * D2R), 3)}$ kn; crab angle $${sig(deg(Math.asin((25 * Math.sin(130 * D2R)) / 140)), 3)}^\circ$; ground speed $${sig(140 * Math.cos(Math.asin((25 * Math.sin(130 * D2R)) / 140)) + 25 * Math.cos(130 * D2R), 3)}$ kn.`,
  },
  practice: [
    num({
      id: 'sum-mag', difficulty: 1,
      gen(r) {
        const R = r.pick([[3, 4], [5, 12], [-6, 8], [8, -15], [-12, -5]]), A = [r.int(-4, 6), r.int(-4, 6)], B = [R[0] - A[0], R[1] - A[1]], ans = Math.hypot(...R);
        const sumMag = Math.hypot(...A) + Math.hypot(...B);
        return {
          prompt: t`$\vec A = (${A[0]},\ ${A[1]})$ and $\vec B = (${B[0]},\ ${B[1]})$. Find $|\vec A + \vec B|$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: sumMag, feedback: t`You added the magnitudes, $|\vec A| + |\vec B| = ${sig(sumMag, 4)}$. They add only for vectors pointing the same way; add the **components** first.` }, { value: Math.hypot(A[0] - B[0], A[1] - B[1]), feedback: t`That is $|\vec A - \vec B|$: add the components, do not subtract them.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\vec A + \vec B = (${A[0]} + (${B[0]}),\ ${A[1]} + (${B[1]}))$.`],
          teach: t`Add vectors component by component; take the magnitude at the end.`,
          explain: t`$\vec R = (${R[0]},\ ${R[1]})$, so $|\vec R| = \sqrt{${R[0] * R[0]} + ${R[1] * R[1]}} = ${sig(ans, 4)}$ — less than $|\vec A| + |\vec B| = ${sig(sumMag, 4)}$.`,
          visual: tipToTail(A, B, t`$\vec A$ (blue) and $\vec B$ (orange) tip to tail; the resultant (gold) closes the triangle. One grid unit each way.`),
        };
      },
    }),
    mcq({
      id: 'possible-sum', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[30, 40], [12, 5], [20, 15], [8, 6]]), lo = Math.abs(a - b), hi = a + b, mid = Math.hypot(a, b);
        const bad = hi + r.pick([5, 10]);
        return {
          prompt: t`Two forces of $${a}$ N and $${b}$ N act on a bracket. Which of these **cannot** be the size of their sum?`,
          choices: [t`$${bad}$ N`, t`$${lo}$ N`, t`$${sig(mid, 3)}$ N`, t`$${hi}$ N`],
          answer: 0,
          why: {
            1: t`$${lo}$ N is possible: the forces pull in opposite directions and partly cancel.`,
            2: t`$${sig(mid, 3)}$ N is possible: it is $\sqrt{${a}^2 + ${b}^2}$, the sum when the forces are at right angles.`,
            3: t`$${hi}$ N is possible: both forces pull the same way, the one case where the sizes simply add.`,
          },
          hints: [t`What is the largest the sum can be? The smallest?`],
          teach: t`$\big||\vec A| - |\vec B|\big| \le |\vec A + \vec B| \le |\vec A| + |\vec B|$: the triangle inequality.`,
          explain: t`The sum ranges from $${lo}$ N (opposite) to $${hi}$ N (together); $${bad}$ N is more than both forces could ever give.`,
          visual: plane({
            ...fit([[0, 0], [a + b, 0], [a - b, 0], [a, b], [a, -b]], 0.12 * (a + b), 1), ticks: false,
            curves: [circ([a, 0], b, { color: 'warn', width: 1.4, dash: true })],
            arrows: [{ from: [0, 0], to: [a, 0], color: 'accent', width: 2.6, label: `${a} N` }, { from: [a, 0], to: [N(a + b * Math.cos(1)), N(b * Math.sin(1))], color: 'warn', width: 2.4, label: `${b} N` }, { from: [0, 0], to: [N(a + b * Math.cos(1)), N(b * Math.sin(1))], color: 'gold', width: 2.2, dash: true }],
            caption: t`The second force can point any way, so its tip lies on the dashed circle; the sum (gold dashed) runs from the origin to that tip. To scale.`,
          }),
        };
      },
    }),
    num({
      id: 'polar-sum', difficulty: 3,
      gen(r) {
        const a = r.pick([40, 60, 80]), al = r.pick([0, 20, 30]), b = r.pick([30, 50, 70]), be = al + r.pick([50, 70, 110, 130]);
        const A = pol(a, al), B = pol(b, be), R = [A[0] + B[0], A[1] + B[1]], ans = Math.hypot(...R);
        return {
          prompt: t`A spacecraft’s first burn changes its velocity by $${a}$ m/s at $${al}^\circ$; a second burn adds $${b}$ m/s at $${be}^\circ$ (angles in the orbital plane, anticlockwise from $+x$). What is the size of the total change in velocity?`,
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: a + b, feedback: t`Adding the sizes assumes both burns point the same way. They are $${be - al}^\circ$ apart: add components.` },
            { value: Math.hypot(a, b), feedback: t`$\sqrt{a^2 + b^2}$ is right only for burns at $90^\circ$; these are $${be - al}^\circ$ apart.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Resolve each: $(${a}\cos ${al}^\circ,\ ${a}\sin ${al}^\circ)$ and $(${b}\cos ${be}^\circ,\ ${b}\sin ${be}^\circ)$.`, t`Add the $x$-parts and the $y$-parts, then take $\sqrt{R_x^2 + R_y^2}$.`],
          teach: t`Vectors given by size and angle: resolve, add the components, recombine.`,
          explain: t`$\vec R = (${sig(cl(R[0]), 4)},\ ${sig(cl(R[1]), 4)})$ m/s, so $|\vec R| = ${sig(ans, 4)}$ m/s. (Total change in velocity is what matters for the orbit; the propellant cost depends on $${a} + ${b} = ${a + b}$ m/s, the sum of the burns.)`,
          visual: tipToTail(A, B, t`The two burns tip to tail, to scale (m/s). The total is the arrow from the first tail to the last tip.`, { R: false, names: ['Δv₁', 'Δv₂'] }),
        };
      },
    }),
    num({
      id: 'slope-resolve', difficulty: 2,
      gen(r) {
        const al = r.pick([8, 12, 15, 20]), W = 3803, along = r.bool(0.5), ans = along ? W * Math.sin(al * D2R) : W * Math.cos(al * D2R);
        const c = Math.cos(al * D2R), s = Math.sin(al * D2R), Lg = 4;
        return {
          prompt: t`A Mars rover weighs $3\,803$ N there (mass $1\,025$ kg, $g = 3.71\ \text{m/s}^2$). It is parked on a slope tilted $${al}^\circ$. What is the component of its weight ${along ? '**along** the slope (the part its brakes must hold)' : '**into** the slope (pressing on the wheels)'}?`,
          answer: ans, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: along ? W * c : W * s, feedback: t`That is the ${along ? 'part into the slope' : 'part along the slope'}. On a slope tilted $\alpha$, the weight makes angle $\alpha$ with the line **into** the slope: along $= W\sin\alpha$, into $= W\cos\alpha$.` }, { value: W, feedback: t`The whole weight is shared between the two directions; you need one part of it.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Choose axes along the slope and perpendicular to it. The weight points straight down.`, t`The angle between “straight down” and “into the slope” equals the slope’s tilt, $${al}^\circ$.`],
          teach: t`On a slope of angle $\alpha$, weight resolves into $W\sin\alpha$ along it and $W\cos\alpha$ into it.`,
          explain: t`${along ? t`$W\sin ${al}^\circ = 3\,803 \times ${sig(s, 4)} = ${thou(ans)}$ N` : t`$W\cos ${al}^\circ = 3\,803 \times ${sig(c, 4)} = ${thou(ans)}$ N`}. Check: the two parts, $${thou(W * s)}$ and $${thou(W * c)}$ N, combine by Pythagoras to $3\,803$ N.`,
          visual: plane({
            x: [-5.4, 5.4], y: [-2.6, 2.8], ticks: false, grid: false, extra: { axes: false },
            curves: [seg([-5, -2.4 + 0], [5, -2.4 + 10 * Math.tan(al * D2R)].map((v, i) => (i ? Math.min(v, 2.6) : v)), { color: 'ink3', width: 2 }), seg([-5, -2.4], [5, -2.4], { color: 'ink4', width: 1 })],
            arrows: [
              { from: [0, N(-2.4 + 5 * Math.tan(al * D2R) + 0.3)], to: [0, N(-2.4 + 5 * Math.tan(al * D2R) + 0.3 - Lg)], color: 'gold', width: 2.8, label: 'W' },
              { from: [0, N(-2.4 + 5 * Math.tan(al * D2R) + 0.3)], to: [N(-Lg * s * c), N(-2.4 + 5 * Math.tan(al * D2R) + 0.3 - Lg * s * s)], color: 'accent', width: 2.2, dash: true, label: 'along' },
              { from: [0, N(-2.4 + 5 * Math.tan(al * D2R) + 0.3)], to: [N(Lg * c * s), N(-2.4 + 5 * Math.tan(al * D2R) + 0.3 - Lg * c * c)], color: 'warn', width: 2.2, dash: true, label: 'into' },
            ],
            points: [note([-3.2, -2.1], `${al}°`, { color: 'ink2' })],
            caption: t`The weight (gold) and its two parts along and into the slope (dashed). The slope angle is drawn true; the arrows are not to the slope’s scale.`,
          }),
        };
      },
    }),
    num({
      id: 'balance-dir', difficulty: 3,
      gen(r) {
        const F1 = r.pick([[6, 2], [4, -3], [5, 5]]), F2 = r.pick([[-2, 6], [3, 4], [-1, 3]]), S = [F1[0] + F2[0], F1[1] + F2[1]], ans = wrap360(deg(Math.atan2(-S[1], -S[0])));
        return {
          prompt: t`Two thrusters on a satellite push with $\vec F_1 = (${F1[0]},\ ${F1[1]})$ N and $\vec F_2 = (${F2[0]},\ ${F2[1]})$ N. A third thruster must cancel them so the net force is zero. In which direction must it push, in degrees anticlockwise from $+x$ ($0^\circ$ to $360^\circ$)?`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: wrap360(deg(Math.atan2(S[1], S[0]))), feedback: t`That is the direction of $\vec F_1 + \vec F_2$. To cancel it, push the **opposite** way: add $180^\circ$.` }, { value: deg(Math.atan(S[1] / S[0])), feedback: t`$\tan^{-1}$ alone loses the quadrant. $\vec F_3 = (${-S[0]},\ ${-S[1]})$ N: place its angle by the signs.` }].filter((e) => Math.abs(e.value - ans) > 0.5 && Math.abs(e.value - ans + 360) > 0.5),
          hints: [t`$\vec F_1 + \vec F_2 + \vec F_3 = \vec 0$, so $\vec F_3 = -(\vec F_1 + \vec F_2)$.`, t`$\vec F_3 = (${-S[0]},\ ${-S[1]})$ N. Find its quadrant, then its angle.`],
          teach: t`Equilibrium: the forces form a closed tip-to-tail polygon, so the last force is minus the sum of the others.`,
          explain: t`$\vec F_1 + \vec F_2 = (${S[0]},\ ${S[1]})$ N, so $\vec F_3 = (${-S[0]},\ ${-S[1]})$ N, of size $${sig(Math.hypot(...S), 3)}$ N, pointing at $${sig(ans, 4)}^\circ$.`,
          visual: plane({ ...fit([[0, 0], F1, F2, S, [-S[0], -S[1]]], 1.2, 2), arrows: [{ from: [0, 0], to: F1, color: 'accent', width: 2.6, label: 'F₁' }, { from: [0, 0], to: F2, color: 'warn', width: 2.6, label: 'F₂' }], points: [dot([0, 0], 'satellite', { color: 'ink2', labelDx: 8, labelDy: 14 })], caption: t`The two thrusters’ forces on the satellite, to scale (newtons). The third force is not drawn.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-crosswind', difficulty: 2, transfer: true,
      gen(r) {
        const w = r.pick([18, 22, 28, 35]), phi = r.pick([25, 40, 55, 70]), ans = w * Math.sin(phi * D2R);
        return {
          prompt: t`A light aircraft is cleared to land. The wind is $${w}$ kn, blowing at $${phi}^\circ$ to the runway’s direction. Its maximum demonstrated crosswind is $15$ kn. What is the crosswind component — the part of the wind across the runway?`,
          answer: ans, units: 'kn', tol: { rel: 0.005 },
          errors: [{ value: w * Math.cos(phi * D2R), feedback: t`That is the part **along** the runway (head- or tailwind). The part across is opposite the angle: $w\sin\varphi$.` }, { value: w * Math.sin(phi), feedback: t`Radian mode: $${phi}$ rad is not $${phi}^\circ$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Resolve the wind along and across the runway; the angle is measured from the runway.`],
          teach: t`Across a direction: $w\sin\varphi$; along it: $w\cos\varphi$, with $\varphi$ the angle between the vector and that direction.`,
          explain: t`$${w}\sin ${phi}^\circ = ${sig(ans, 3)}$ kn — ${ans > 15 ? 'more than the 15 kn limit: divert to a runway better aligned with the wind' : 'within the 15 kn limit'}.`,
          visual: plane({ x: [-10, 40], y: [-12.5, 12.5], ticks: false, grid: false, extra: { axes: false }, curves: [seg([-8, -2], [38, -2], { color: 'ink4', width: 1 }), seg([-8, 2], [38, 2], { color: 'ink4', width: 1 })], arrows: [{ from: [0, 0], to: [N(w * Math.cos(phi * D2R) * 0.8), N(w * Math.sin(phi * D2R) * 0.4)], color: 'warn', width: 2.6, label: 'wind' }], points: [note([30, -4.5], 'runway →', { color: 'ink3' })], caption: t`The runway (grey) and the wind (orange). Directions only — the arrow is not to the stated angle or scale.` }),
        };
      },
    }),
    num({
      id: 'cp-groundspeed', difficulty: 2, transfer: true,
      gen(r) {
        const A = r.pick([[0, 220], [180, 120], [-150, 160]]), W = r.pick([[40, -30], [-35, 20], [30, 40]]), R = [A[0] + W[0], A[1] + W[1]], ans = Math.hypot(...R);
        const sumMag = Math.hypot(...A) + Math.hypot(...W);
        return {
          prompt: t`An aircraft’s velocity through the air is $(${A[0]},\ ${A[1]})$ km/h (east, north) and the wind’s is $(${W[0]},\ ${W[1]})$ km/h. What is its speed over the ground?`,
          answer: ans, units: 'km/h', tol: { rel: 0.005 },
          errors: [{ value: sumMag, feedback: t`Airspeed plus wind speed would be right only with a pure tailwind. Add the velocity **components**, then find the length.` }, { value: Math.hypot(...A), feedback: t`That is the airspeed alone: the wind adds to the velocity.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Ground velocity = air velocity + wind velocity, component by component.`],
          teach: t`Velocities add as vectors: ground = air + wind.`,
          explain: t`$(${A[0]} + (${W[0]}),\ ${A[1]} + (${W[1]})) = (${R[0]},\ ${R[1]})$ km/h, of length $${sig(ans, 4)}$ km/h.`,
          visual: tipToTail(A, W, t`Air velocity (blue) plus wind (orange), to scale in km/h; the ground velocity closes the triangle (gold).`, { names: ['air', 'wind', 'ground'] }),
        };
      },
    }),
    mcq({
      id: 'cp-when-add', difficulty: 2,
      prompt: t`For two nonzero vectors, when is $|\vec A + \vec B| = |\vec A| + |\vec B|$?`,
      choices: ['Only when they point in the same direction', 'When they are perpendicular', 'Always — that is how vector addition works', 'When they point in opposite directions'],
      answer: 0,
      why: {
        1: t`Perpendicular vectors give $\sqrt{A^2 + B^2}$, which is less than $A + B$.`,
        2: t`Magnitudes add only in one special case; in general the tip-to-tail triangle has its third side shorter than the other two together.`,
        3: t`Opposite vectors partly cancel: $|\vec A + \vec B| = \big|A - B\big|$, the smallest possible.`,
      },
      hints: [t`Picture the tip-to-tail triangle. When does it flatten into a straight line with no doubling back?`],
      teach: t`The sides of a triangle obey $|\vec A + \vec B| \le |\vec A| + |\vec B|$, with equality only when the triangle is flat and the vectors line up.`,
      explain: t`Only when $\vec B$ continues straight on from $\vec A$ does the resultant run the full length of both.`,
      visual: tipToTail([4, 1], [1, 3], t`A general case: the gold resultant is shorter than the blue and orange arrows laid end to end.`),
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.8 Vectors', url: 'https://openstax.org/books/precalculus-2e/pages/8-8-vectors' },
    { label: 'OpenStax University Physics Vol. 1, §2.1 Scalars and Vectors (graphical addition)', url: 'https://openstax.org/books/university-physics-volume-1/pages/2-1-scalars-and-vectors' },
    { label: 'NASA Mars 2020 Perseverance rover: mass 1,025 kg', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' },
  ],
});
