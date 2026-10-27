// The conditions for static equilibrium: ΣF = 0 and Στ = 0, the torque sum
// taken about any point once the forces balance; the centre of gravity.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, scene } from './_statics.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);

// the Explore plank: 4 m long, 20 kg, on sawhorses at 0.6 m and 3.4 m; a person of mass m stands at s
const NB = '(196*1.4 + 9.8*m*(s - 0.6))/2.8';
const NA = `(196 + 9.8*m - ${NB})`;
const K = 1 / 500;                              // metres of arrow per newton

// a plank on two supports with a crate (practice and checkpoint pictures)
function beamOnSupports({ Lp, xc, labels = {}, crateW = 0.7, ask = 'R', caption }) {
  const S = scene({ perN: 1 });
  S.bar([0, 0], [Lp, 0], { width: 7 })
    .pin([0, -0.05]).pin([Lp, -0.05])
    .box([xc - crateW / 2, 0.05], [xc + crateW / 2, 0.05 + crateW], { color: 'gold', alpha: 0.35 })
    .dim([0, 0], [xc, 0], labels.xc ?? `${xc} m`, { off: [0, -0.6] })
    .dim([0, 0], [Lp, 0], labels.L ?? `${Lp} m`, { off: [0, -1.05] })
    .force([0, 0.05], 0.75, { deg: 90, label: ask === 'L' ? 'N (left) = ?' : 'N (left)', color: 'teal' })
    .force([Lp, 0.05], 0.75, { deg: 90, label: ask === 'R' ? 'N (right) = ?' : 'N (right)', color: 'teal' })
    .text([xc, 0.05 + crateW + 0.15], 'crate', { dx: -14 })
    .include([Lp + 0.9, 0], [-0.5, 1.2]);
  return S.spec(caption ?? 'The beam on its two supports; arrows show directions only.', { alt: 'A beam on two supports with a crate on it' });
}

// aircraft on its landing gear: nose wheel, main wheels and the centre of gravity
function aircraftPicture(dCG, dMain) {
  const S = scene({ perN: 1 });
  S.surface([-0.8, -0.35], [dMain + 1.2, -0.35], 'below')
    .line([-0.3, 0.6], [dMain + 0.9, 0.75], { color: 'ink2', width: 9 })
    .line([0, 0.55], [0, -0.2], { color: 'ink3', width: 2 }).line([dMain, 0.6], [dMain, -0.2], { color: 'ink3', width: 2 })
    .dot([0, -0.2], '', { color: 'ink2', r: 6 }).dot([dMain, -0.2], '', { color: 'ink2', r: 6 })
    .dot([dCG, 0.68], 'CG', { color: 'gold', dy: -14 })
    .dim([0, -0.35], [dCG, -0.35], `${dCG} m`, { off: [0, -0.4] })
    .dim([0, -0.35], [dMain, -0.35], `${dMain} m`, { off: [0, -0.85] })
    .text([0, 0.95], 'nose gear', { dx: -26 }).text([dMain, 1.1], 'main gear', { dx: -26 });
  return S.spec('A light aircraft on its landing gear, seen from the side (a sketch; not to scale).', { alt: 'An aircraft on its nose gear and main gear' });
}

const EX = { s: 3.0, m: 60 };
EX.NB = (196 * 1.4 + G * EX.m * (EX.s - 0.6)) / 2.8;
EX.NA = 196 + G * EX.m - EX.NB;

export default lesson({
  id: 'phys2210.M12.1',
  title: 'Conditions for equilibrium',
  minutes: 9, difficulty: 2,
  intro: t`An extended object stays at rest only if two things are true: the forces on it add to zero, so its centre of mass does not accelerate, **and** the torques add to zero, so it does not start to turn. For forces in a plane:

$$\sum F_x = 0,\qquad \sum F_y = 0,\qquad \sum \tau = 0\ \ \text{(about any point)}$$

Once the forces balance, the torque sum comes out the same about every point — so **you choose the pivot** that makes the algebra easiest. Gravity acts at the **centre of gravity**, which in uniform gravity is the centre of mass.`,
  symbols: [
    { tex: '\\sum F_x,\\ \\sum F_y', text: 'the sums of the $x$- and $y$-components of every external force on the object, in newtons (N)' },
    { tex: '\\tau', text: 'the torque of one force about the chosen point: the force times its lever arm, $\\tau = r_\\perp F$, in N·m; count anticlockwise turns as positive, clockwise as negative' },
    { tex: 'r_\\perp', text: 'the lever arm: the perpendicular distance from the chosen point to the force’s line of action, in m' },
  ],
  why: 'Every bridge, crane, launch tower and aircraft standing on its landing gear is sized with these three equations: they decide how much load each support carries.',
  visual: {
    type: 'graph',
    title: 'Two balances, and a pivot you can put anywhere',
    lead: t`A 4.0 m, 20 kg plank rests on two sawhorses, A and B. Move the person with the sliders; the teal arrows are the sawhorses' upward pushes, the grey ones the weights. Then **drag the gold point**: the readout adds up every torque about it.`,
    tasks: [
      t`Walk the person from A to B: $N_B$ grows as $N_A$ shrinks, and together they always carry the full $196\ \text{N} + mg$.`,
      'Drag the gold point anywhere — on the plank, above it, far off to the side: each torque changes, but their sum stays zero.',
      t`Walk past B to the end of the plank: $N_A$ goes negative. Sawhorse A would have to pull down; in reality the plank tips about B.`,
    ],
    params: {
      x: [-0.6, 4.6], y: [-1.6, 2.4], equal: true, xlabel: 'x (m)', ylabel: '', aspect: 'wide',
      alt: 'A plank on two sawhorses with a person standing on it, and the forces on the plank',
      sliders: [
        { key: 's', label: 'Person’s position $x$', min: 0, max: 4, step: 0.05, value: 2.6, unit: '\\mathrm{m}', explain: 'Measured from the plank’s left end; A is at 0.6 m, B at 3.4 m.' },
        { key: 'm', label: 'Person’s mass $m$', min: 40, max: 100, step: 1, value: 60, unit: '\\mathrm{kg}', explain: 'Their weight is $mg$, with $g = 9.8\\ \\mathrm{m/s^2}$.' },
      ],
      drag: [{ key: 'p', x: 1.0, y: 1.6, snap: 0.05 }],
      shade: [{ fn: '0.1', lower: '0', from: 0, to: 4, color: 'accent', alpha: 0.45 }],
      curves: [
        { param: ['0.6 - 0.18t', '-0.35t'], t: [0, 1], color: 'ink3', width: 2 }, { param: ['0.6 + 0.18t', '-0.35t'], t: [0, 1], color: 'ink3', width: 2 },
        { param: ['3.4 - 0.18t', '-0.35t'], t: [0, 1], color: 'ink3', width: 2 }, { param: ['3.4 + 0.18t', '-0.35t'], t: [0, 1], color: 'ink3', width: 2 },
        { param: ['s', '0.1 + 0.55t'], t: [0, 1], color: 'gold', width: 3 },
        { param: ['s + 0.09cos(t)', '0.75 + 0.09sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 },
      ],
      arrows: [
        { from: [0.6, 0.1], to: [0.6, `0.1 + ${K}*${NA}`], color: 'teal', label: 'N (A)' },
        { from: [3.4, 0.1], to: [3.4, `0.1 + ${K}*${NB}`], color: 'teal', label: 'N (B)' },
        { from: [2, 0], to: [2, -196 * K], color: 'ink2', label: 'plank, 196 N' },
        { from: ['s', 0], to: ['s', `-${K}*9.8*m`], color: 'ink2', label: 'mg' },
      ],
      points: [{ x: 0.6, y: -0.35, r: 0.01, color: 'ink3', label: 'A', labelDx: -4, labelDy: 14 }, { x: 3.4, y: -0.35, r: 0.01, color: 'ink3', label: 'B', labelDx: -4, labelDy: 14 }],
      readouts: [
        { label: '$N_A$', expr: NA, unit: '\\mathrm{N}', digits: 3 },
        { label: '$N_B$', expr: NB, unit: '\\mathrm{N}', digits: 3 },
        { label: 'torque of $N_B$ about the gold point', expr: `(3.4 - px)*${NB}`, unit: '\\mathrm{N\\,m}', digits: 3 },
        // the sum is exactly zero; adding and removing 10⁶ wipes out floating-point dust of order 10⁻¹³
        { label: '$\\sum\\tau$ about the gold point', expr: `((0.6 - px)*${NA} + (3.4 - px)*${NB} - (2 - px)*196 - (s - px)*9.8*m + 1000000) - 1000000`, unit: '\\mathrm{N\\,m}', digits: 3 },
      ],
    },
    caption: 'Seen from the side. Force arrows are drawn to scale, 1 m per 500 N, along their lines of action. Torques are counted positive anticlockwise.',
  },
  example: {
    prompt: t`A 4.0 m plank of mass 20 kg rests on sawhorses 0.6 m from each end. A ${EX.m} kg painter stands 1.0 m from the right end. How hard does each sawhorse push up? ($g = 9.8\ \text{m/s}^2$)`,
    visual: (() => {
      const S = scene({ perN: 1 / 500 });
      S.bar([0, 0.05], [4, 0.05], { width: 7 }).pin([0.6, -0.02]).pin([3.4, -0.02])
        .force([0.6, 0.1], EX.NA, { deg: 90, label: 'N (A)', color: 'teal' }).force([3.4, 0.1], EX.NB, { deg: 90, label: 'N (B)', color: 'teal' })
        .force([2, 0], 196, { deg: -90, label: '196 N', color: 'ink2' }).force([EX.s, 0], G * EX.m, { deg: -90, label: `${s3(G * EX.m)} N`, color: 'ink2' })
        .dim([0.6, 0], [2, 0], '1.4 m', { off: [0, -0.9] }).dim([0.6, 0], [EX.s, 0], '2.4 m', { off: [0, -1.35] }).dim([0.6, 0], [3.4, 0], '2.8 m', { off: [0, -1.8] })
        .text([0.6, -0.25], 'A', { dx: -4, dy: 10 }).text([3.4, -0.25], 'B', { dx: -4, dy: 10 });
      return S.spec('The plank’s free-body diagram, forces to scale (1 m per 500 N); distances measured from A.');
    })(),
    steps: [
      { label: 'Free-body diagram', text: t`Four vertical forces act on the plank: $N_A$ and $N_B$ up; its weight, $196$ N at the middle; the painter's weight, $${EX.m}\times9.8 = ${s3(G * EX.m)}$ N, at 3.0 m from the left end.` },
      { label: 'Pick the pivot', text: t`Take torques about A: then $N_A$ has no lever arm and drops out, leaving one unknown. Distances from A: plank's centre 1.4 m, painter 2.4 m, B 2.8 m.` },
      { label: 'Torques about A', text: t`$N_B(2.8) - 196(1.4) - ${s3(G * EX.m)}(2.4) = 0 \Rightarrow N_B = \dfrac{274.4 + ${s3(G * EX.m * 2.4)}}{2.8} = ${s3(EX.NB)}$ N.` },
      { label: 'Forces', text: t`$N_A + N_B = 196 + ${s3(G * EX.m)} = ${s3(196 + G * EX.m)}$ N, so $N_A = ${s3(EX.NA)}$ N.` },
      { label: 'Check about B', text: t`Anticlockwise positive: $-N_A(2.8) + 196(1.4) + ${s3(G * EX.m)}(0.4) = ${Math.abs(-EX.NA * 2.8 + 274.4 + G * EX.m * 0.4) < 1e-6 ? 0 : s3(-EX.NA * 2.8 + 274.4 + G * EX.m * 0.4)}$ N·m. ✓ Any pivot works once the forces balance — and the sawhorse nearer the painter carries more.` },
    ],
    answer: t`$N_A = ${s3(EX.NA)}$ N, $N_B = ${s3(EX.NB)}$ N.`,
  },
  practice: [
    mcq({
      id: 'couple', difficulty: 1,
      prompt: 'Two forces of the same size act on a ruler lying on frictionless ice: one at each end, at right angles to the ruler and in opposite directions (as drawn). What happens?',
      choices: ['It starts to spin, but its centre of mass stays put', 'Nothing: the two forces cancel', 'It slides sideways without turning', 'It spins and its centre slides off sideways'],
      answer: 0,
      why: {
        1: 'The forces cancel, so the centre of mass does not accelerate — but their torques add. ΣF = 0 is not enough for equilibrium.',
        2: 'Sliding needs a net force, and here ΣF = 0.',
        3: 'With ΣF = 0 the centre of mass cannot accelerate; only turning remains.',
      },
      hints: ['Check the two conditions separately: ΣF and Στ.', 'About the centre, does each force try to turn the ruler the same way or opposite ways?'],
      teach: 'Equilibrium needs both ΣF = 0 and Στ = 0: a pair of equal, opposite forces along different lines (a couple) gives a torque with no net force.',
      explain: t`$\sum F = F - F = 0$, so the centre of mass stays put. About the centre, both forces turn the ruler anticlockwise: $\sum\tau = 2\cdot F\cdot\tfrac{L}{2} = FL \neq 0$. It spins.`,
      visual: (() => {
        const S = scene({ perN: 1 });
        S.bar([-1.5, 0], [1.5, 0], { width: 6 }).force([1.5, 0], 1, { deg: 90, label: 'F', color: 'bad' }).force([-1.5, 0], 1, { deg: -90, label: 'F', color: 'bad' }).dot([0, 0], 'centre', { color: 'ink2', r: 3, dy: 14 });
        return S.spec('The ruler seen from above, with the two forces. Arrows show directions only.');
      })(),
    }),
    num({
      id: 'seesaw', difficulty: 1,
      gen(r) {
        const m1 = r.pick([20, 24, 28, 32]), d1 = r.pick([1.2, 1.5, 1.8]), m2 = r.pick([40, 45, 50]);
        const d2 = (m1 * d1) / m2;
        return {
          prompt: t`A ${m1} kg child sits ${d1} m from the pivot of a seesaw. How far from the pivot, on the other side, must a ${m2} kg child sit to balance it? (Treat the seesaw itself as balanced on its own.)`,
          answer: d2, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (m2 * d1) / m1, feedback: 'The heavier child must sit closer to the pivot, not farther: m₁gd₁ = m₂gd₂.' }],
          hints: [t`Torques about the pivot must cancel: $m_1 g\,d_1 = m_2 g\,d_2$.`],
          teach: 'Balance means equal and opposite torques about the pivot: the heavier weight needs the shorter lever arm.',
          explain: t`$d_2 = \dfrac{m_1 d_1}{m_2} = \dfrac{(${m1})(${d1})}{${m2}} = ${s3(d2)}$ m. ($g$ cancels.)`,
          visual: (() => {
            const S = scene({ perN: 1 / 400 });
            S.bar([-2.2, 0], [2.2, 0], { width: 6 }).pin([0, -0.04])
              .force([-d1, 0.05], m1 * G, { deg: -90, label: `${m1} kg`, color: 'ink2' }).force([1.1, 0.05], m2 * G, { deg: -90, label: `${m2} kg`, color: 'ink2' })
              .dim([0, 0], [-d1, 0], `${d1} m`, { off: [0, 0.6] }).dim([0, 0], [1.1, 0], '?', { off: [0, 0.6] });
            return S.spec('The seesaw and the two children’s weights. A sketch: the second child’s distance is the unknown, not drawn to scale.');
          })(),
        };
      },
    }),
    num({
      id: 'support', difficulty: 2,
      gen(r) {
        const Lp = r.pick([4, 5, 6]), mb = r.pick([30, 40, 50]), mc = r.pick([150, 200, 250]), f = r.pick([0.25, 0.3, 0.4]);
        const xc = f * Lp, NR = (mb * G * (Lp / 2) + mc * G * xc) / Lp;
        return {
          prompt: t`A uniform ${Lp} m beam of mass ${mb} kg rests on supports at its two ends. A ${mc} kg crate sits with its centre ${s3(xc)} m from the left end. How hard does the right-hand support push up?`,
          answer: NR, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (mc * G * xc) / Lp, feedback: 'Include the beam’s own weight, acting at its middle.' }, { value: (mb * G * (Lp / 2) + mc * G * (Lp - xc)) / Lp, feedback: 'That is the left-hand support’s force. The crate is nearer the left end, so the right support carries less of it.' }],
          hints: [t`Take torques about the **left** support, so its unknown force drops out.`, t`$N_R\,(${Lp}) = (${mb}g)(${Lp / 2}) + (${mc}g)(${s3(xc)})$.`],
          teach: 'Taking torques about one support removes its unknown force and gives the other support’s force directly.',
          explain: t`About the left end: $N_R = \dfrac{(${mb})(9.8)(${Lp / 2}) + (${mc})(9.8)(${s3(xc)})}{${Lp}} = ${s3(NR)}$ N. The left support carries the rest: $${s3((mb + mc) * G - NR)}$ N.`,
          visual: beamOnSupports({ Lp, xc: r4(xc), labels: { xc: `${s3(xc)} m` } }),
        };
      },
    }),
    mcq({
      id: 'any-point', difficulty: 2,
      prompt: 'An object is at rest, and you have checked that the forces on it add to zero. About which point must the torques add to zero?',
      choices: ['About every point: pick whichever makes the algebra easiest', 'Only about its centre of mass', 'Only about the pivot or support it rests on', 'Only about the point where the largest force acts'],
      answer: 0,
      why: {
        1: 'The centre of mass is one good choice, but not the only one: when ΣF = 0 the torque sum is the same about every point.',
        2: 'Nothing special happens at the support. Choosing it is often handy — its force drops out — but any point works.',
        3: 'Choosing a point where an unknown force acts is clever (that force drops out), but the torques also balance about any other point.',
      },
      hints: [t`Move the pivot by $\vec d$: each torque changes by $-\vec d\times\vec F$. What does that add up to when $\sum\vec F = 0$?`],
      teach: 'When the forces balance, the net torque is the same about every point, so equilibrium can be checked about any point you like.',
      explain: t`Shifting the pivot by $\vec d$ changes the total torque by $-\vec d\times\sum\vec F = 0$. So if the torques cancel about one point they cancel about all of them — choose the point where the most unknown forces act.`,
      visual: (() => {
        const S = scene({ perN: 1 / 500 });
        S.bar([0, 0.05], [4, 0.05], { width: 7 }).pin([0.6, -0.02]).pin([3.4, -0.02])
          .force([0.6, 0.1], 196 + 588 - (274.4 + 588 * 2) / 2.8, { deg: 90, label: 'N (A)', color: 'teal' }).force([3.4, 0.1], (274.4 + 588 * 2) / 2.8, { deg: 90, label: 'N (B)', color: 'teal' })
          .force([2, 0], 196, { deg: -90, color: 'ink2' }).force([2.6, 0], 588, { deg: -90, color: 'ink2' })
          .dot([0.6, 0.05], 'P₁', { color: 'gold', dx: -20 }).dot([2, 0.05], 'P₂', { color: 'gold', dy: 14, dx: 8 }).dot([3.2, 1.3], 'P₃', { color: 'gold' });
        return S.spec('A plank in equilibrium and three possible pivot points (gold). Forces to scale, 1 m per 500 N.');
      })(),
    }),
    num({
      id: 'balance-point', difficulty: 2,
      gen(r) {
        const Lp = r.pick([1.5, 1.8, 2.0]), mp = r.pick([2, 3, 4]), ml = r.pick([1.5, 2, 2.5]);
        const x = (mp * (Lp / 2)) / (mp + ml);
        return {
          prompt: t`A uniform ${Lp} m pole of mass ${mp} kg has a ${ml} kg lamp fixed to one end. How far from the lamp end should you hold it so that it balances?`,
          answer: x, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: Lp / 2, feedback: 'The middle balances the bare pole; the lamp pulls the balance point toward its end.' }, ...(mp !== ml ? [{ value: (ml * (Lp / 2)) / (mp + ml), feedback: 'Weight each position by the mass that sits there: the pole’s mass at its middle, the lamp’s at x = 0.' }] : [])],
          hints: [t`The balance point is the centre of gravity: $x_\text{cg} = \dfrac{\sum m_i x_i}{\sum m_i}$.`, t`Measure from the lamp end: the lamp is at $0$, the pole's own centre at ${Lp / 2} m.`],
          teach: 'An object balances when supported directly under its centre of gravity, where the torques of all the weights cancel.',
          explain: t`$x_\text{cg} = \dfrac{(${ml})(0) + (${mp})(${Lp / 2})}{${ml} + ${mp}} = ${s3(x)}$ m from the lamp end.`,
          visual: (() => {
            const S = scene({ perN: 1 / 80 });
            S.bar([0, 0], [Lp, 0], { width: 5 }).dot([0, 0], 'lamp', { color: 'gold', r: 9, dy: -16 })
              .force([0, -0.05], ml * G, { deg: -90, color: 'ink2', label: `${ml} kg` }).force([Lp / 2, -0.05], mp * G, { deg: -90, color: 'ink2', label: `${mp} kg` })
              .dim([0, 0], [Lp, 0], `${Lp} m`, { off: [0, 0.45] });
            return S.spec('The pole and lamp with their weights (to scale, 1 m per 80 N).');
          })(),
        };
      },
    }),
    num({
      id: 'tip-slope', difficulty: 2,
      gen(r) {
        const w = r.pick([1.8, 2.0, 2.4]), h = r.pick([1.3, 1.5, 1.8, 2.2]);
        const th = Math.atan(w / 2 / h) * (180 / Math.PI);
        return {
          prompt: t`A loaded truck's wheels are ${w} m apart, and its centre of gravity sits midway between them, ${h} m above the road. Parked across a slope, at what slope angle does it start to tip over? (Its springs and tyres are stiff; it does not slide.)`,
          answer: th, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: Math.atan(w / h) * (180 / Math.PI), feedback: 'The tipping edge is half the track width from the centre of gravity, not the full width.' }, { value: Math.atan(h / (w / 2)) * (180 / Math.PI), feedback: 'Upside down: tan θ = (half the track width) ÷ (height of the centre of gravity).' }],
          hints: ['It tips once the vertical line through the centre of gravity passes outside the downhill wheels.', t`At that moment the line from the downhill wheel to the centre of gravity is vertical: $\tan\theta = \dfrac{w/2}{h}$.`],
          teach: 'A body tips when its centre of gravity passes over the edge of its base: a low, wide vehicle tolerates steeper slopes.',
          explain: t`$\theta = \arctan\dfrac{${w / 2}}{${h}} = ${s3(th)}$°. Beyond that, the weight's line of action falls outside the base, and its torque about the downhill wheels turns the truck over.`,
          visual: (() => {
            const S = scene({ perN: 1 }), th0 = 18 * Math.PI / 180, c = Math.cos(th0), sn = Math.sin(th0);
            const P = (u, v) => [u * c - v * sn, u * sn + v * c];             // (along the slope, up from it) → world
            S.line(P(-2.2, 0), P(2.2, 0), { color: 'ink3', width: 2 })
              .bar(P(-w / 2, 0.45), P(w / 2, 0.45), { color: 'ink2', width: 3 }).bar(P(-w / 2, 0.45), P(-w / 2, 2 * h - 0.45), { color: 'ink2', width: 3 }).bar(P(w / 2, 0.45), P(w / 2, 2 * h - 0.45), { color: 'ink2', width: 3 }).bar(P(-w / 2, 2 * h - 0.45), P(w / 2, 2 * h - 0.45), { color: 'ink2', width: 3 })
              .dot(P(-w / 2, 0.2), '', { color: 'ink', r: 7 }).dot(P(w / 2, 0.2), '', { color: 'ink', r: 7 })
              .dot(P(0, h), 'CG', { color: 'gold', dx: 8 })
              .force(P(0, h), 1.2, { deg: -90, color: 'ink2', label: 'W' });
            return S.spec('The truck seen from behind, parked across a slope (the slope here is not the tipping angle). A sketch.');
          })(),
        };
      },
    }),
    num({
      id: 'hinged-rod', difficulty: 3,
      gen(r) {
        const Lr = r.pick([2.0, 2.4]), mr = r.pick([4, 6]), f = r.pick([0.75, 0.8]), mL = r.pick([8, 10, 12]);
        const ds = f * Lr, T = (mr * G * (Lr / 2) + mL * G * Lr) / ds;
        return {
          prompt: t`A uniform ${Lr} m rod of mass ${mr} kg sticks out horizontally from a wall, on a hinge. A vertical rope ${s3(ds)} m from the hinge holds it up, and a ${mL} kg load hangs from its far end. What is the tension in the rope?`,
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (mL * G * Lr) / ds, feedback: t`The rod’s own weight also has a torque about the hinge: $(m_\text{rod}\,g)(L/2)$.` }, { value: (mr * G * (Lr / 2) + mL * G * Lr) / Lr, feedback: 'The rope’s lever arm is its distance from the hinge, not the rod’s length.' }],
          hints: [
            t`The hinge pushes on the rod with an unknown force. Take torques about the hinge so that force drops out.`,
            t`Lever arms about the hinge: rope ${s3(ds)} m, rod's weight ${Lr / 2} m, load ${Lr} m.`,
            t`$T(${s3(ds)}) = (${mr})(9.8)(${Lr / 2}) + (${mL})(9.8)(${Lr})$.`,
          ],
          teach: 'Put the pivot at the hinge: its unknown force then has no torque, and one torque equation gives the rope’s tension.',
          explain: t`$T = \dfrac{(${mr})(9.8)(${Lr / 2}) + (${mL})(9.8)(${Lr})}{${s3(ds)}} = ${s3(T)}$ N. Then $\sum F_y = 0$ gives the hinge's force: $T - (${mr} + ${mL})(9.8) = ${s3(T - (mr + mL) * G)}$ N, so the hinge pulls the rod **down** that much.`,
          visual: (() => {
            const S = scene({ perN: 1 / 150 });
            S.surface([0, -1.2], [0, 1.4], 'left').bar([0, 0], [Lr, 0], { width: 6 }).pin([0, 0], { wall: 'left' })
              .line([ds, 0], [ds, 1.3], { color: 'good', width: 2 }).force([ds, 0.04], 1.0 / (1 / 150), { deg: 90, color: 'good', label: 'T = ?' })
              .force([Lr / 2, -0.04], mr * G, { deg: -90, color: 'ink2', label: `${mr * G} N` }).force([Lr, -0.04], mL * G, { deg: -90, color: 'ink2', label: `${s3(mL * G)} N` })
              .dim([0, 0], [ds, 0], `${s3(ds)} m`, { off: [0, -1.25] }).dim([0, 0], [Lr, 0], `${Lr} m`, { off: [0, -1.6] });
            return S.spec('The rod, hinged to the wall at the left. Weights to scale (1 m per 150 N); the rope’s arrow shows direction only.');
          })(),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-support', difficulty: 2,
      gen(r) {
        const Lp = r.pick([3, 4, 5]), mb = r.pick([20, 25, 30]), mc = r.pick([80, 100, 120]), f = r.pick([0.2, 0.3]);
        const xc = f * Lp, NL = (mb * G * (Lp / 2) + mc * G * (Lp - xc)) / Lp;
        return {
          prompt: t`A uniform ${Lp} m plank of mass ${mb} kg rests on supports at its ends. A ${mc} kg load sits ${s3(xc)} m from the left end. How hard does the **left** support push up?`,
          answer: NL, units: 'N', tol: { rel: 0.01 },
          hints: [t`Take torques about the right-hand support.`],
          teach: 'Taking torques about one support gives the other support’s force in one step.',
          explain: t`About the right end: $N_L(${Lp}) = (${mb})(9.8)(${Lp / 2}) + (${mc})(9.8)(${s3(Lp - xc)})$, so $N_L = ${s3(NL)}$ N.`,
          visual: beamOnSupports({ Lp, xc: r4(xc), ask: 'L', labels: { xc: `${s3(xc)} m` } }),
        };
      },
    }),
    mcq({
      id: 'cp-tip', difficulty: 2,
      prompt: 'A person walks along a plank that rests on two supports, past the right-hand support toward the plank’s free end. The plank is just about to tip when:',
      choices: ['The left support’s upward force falls to zero', 'The right support’s upward force falls to zero', 'The person’s weight equals the plank’s weight', 'The person reaches the very end, whatever the masses'],
      answer: 0,
      why: {
        1: 'The right support carries more and more as the person approaches it and beyond; it is the left one that is being unloaded.',
        2: 'Tipping depends on the torques about the right support — weights times lever arms — not on the weights alone.',
        3: 'A heavy enough plank never tips; a light one tips well before the end.',
      },
      hints: ['About which support does the plank tip?', 'A support can push but not pull: what does that say about its force just before tipping?'],
      teach: 'An object resting on supports tips when one support’s force falls to zero: supports can push but cannot pull.',
      explain: 'The plank tips about the right-hand support. Before it does, the left support’s push falls steadily; at zero, the person’s torque about the right support just matches the plank’s, and any farther step tips it.',
      visual: (() => {
        const S = scene({ perN: 1 });
        S.bar([0, 0.05], [5, 0.05], { width: 7 }).pin([0.5, -0.02]).pin([3.5, -0.02]).dot([4.3, 0.45], 'person', { color: 'gold', r: 6 })
          .text([0.5, -0.3], 'left', { dx: -10, dy: 10 }).text([3.5, -0.3], 'right', { dx: -12, dy: 10 });
        return S.spec('The plank on its two supports, with the person past the right-hand one.');
      })(),
    }),
    num({
      id: 'cp-aircraft', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([1100, 1200, 1500]), dMain = r.pick([2.0, 2.2]), dCG = r.pick([1.6, 1.7, 1.8]);
        const Nn = (m * G * (dMain - dCG)) / dMain;
        return {
          prompt: t`**Weight and balance.** A ${m.toLocaleString('en-US')} kg light aircraft stands on its nose wheel and its main wheels, which are ${dMain} m behind the nose wheel. Its centre of gravity is ${dCG} m behind the nose wheel. How much force does the nose wheel carry?`,
          answer: Nn, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (m * G * dCG) / dMain, feedback: 'That is the main wheels’ share. The centre of gravity is near the main wheels, so the nose wheel carries less.' }],
          hints: [t`Take torques about the main wheels: the nose-wheel force has lever arm ${dMain} m; the weight has lever arm ${s3(dMain - dCG)} m.`],
          teach: 'Pilots locate the centre of gravity from the loads on the wheels — the same torque balance in reverse.',
          explain: t`About the main wheels: $N_\text{nose}(${dMain}) = (${m})(9.8)(${s3(dMain - dCG)})$, so $N_\text{nose} = ${s3(Nn)}$ N — ${Math.round((100 * (dMain - dCG)) / dMain)}% of the weight. Move the centre of gravity too far back and the nose wheel lifts off.`,
          visual: aircraftPicture(dCG, dMain),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §12.1 Conditions for Static Equilibrium', url: 'https://openstax.org/books/university-physics-volume-1/pages/12-1-conditions-for-static-equilibrium' },
    { label: 'FAA, Aircraft Weight and Balance Handbook (FAA-H-8083-1B)', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/weight_balance_handbook' },
  ],
});
