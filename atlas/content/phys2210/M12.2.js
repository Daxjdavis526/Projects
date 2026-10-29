// Solving equilibrium problems: forces at angles (τ = rF sin θ), hinges with
// unknown directions, ladders that need friction, the forearm's lever, and a
// rocket standing on its pad in the wind.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, scene } from './_statics.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const D = Math.PI / 180;

// a horizontal boom hinged to a wall, held by a cable to the wall above; a load hangs from its end
function boomPicture({ L = 3, th = 35, load = 'load', T = 'T = ?', boomW = '', caption }) {
  const S = scene({ perN: 1 });
  const top = [0, L * Math.tan(th * D)];
  S.surface([0, -0.9], [0, top[1] + 0.5], 'left').bar([0, 0], [L, 0], { width: 6 }).pin([0, 0], { wall: 'left' })
    .line([L, 0], top, { color: 'good', width: 2 })
    .force([L, 0], 1.1, { dir: [-L, top[1]], color: 'good', label: T, labelDx: -50, labelDy: -8 })
    .force([L, -0.05], 0.9, { deg: -90, color: 'ink2', label: load })
    .turn([L, 0], 0.7, 180, 180 - th, { color: 'gold', label: `${th}°` })
    .dim([0, 0], [L, 0], `${L} m`, { off: [0, -1.25] });
  if (boomW) S.force([L / 2, -0.05], 0.6, { deg: -90, color: 'ink2', label: boomW });
  return S.spec(caption ?? 'The boom, hinged to the wall at the left; the cable runs to the wall above. Arrows show directions, not sizes.', { alt: 'A horizontal boom held by an angled cable' });
}

// a ladder leaning on a wall; optional forces
function ladderPicture({ th = 65, L = 5, person = 0.7, forces = false, caption }) {
  const S = scene({ perN: 1 / 400 }), c = Math.cos(th * D), s = Math.sin(th * D);
  S.surface([-0.8, 0], [L * c + 0.4, 0], 'below').surface([L * c, 0], [L * c, L * s + 0.6], 'right')
    .bar([0, 0], [L * c, L * s], { color: 'gold', width: 5 })
    .turn([0, 0], 0.8, 0, th, { color: 'ink2', label: `${th}°` });
  if (person !== null) S.dot([person * L * c, person * L * s + 0.25], 'climber', { color: 'accent', r: 7, dx: -58 });
  if (forces) {
    const Nw = ((147 * L / 2 + 686 * person * L) * c) / (L * s);
    S.force([L * c, L * s], Nw, { deg: 180, color: 'teal', label: 'N (wall)' })
      .force([0, 0], 833, { deg: 90, color: 'teal', label: 'N (floor)' })
      .force([0, 0], Nw, { deg: 0, color: 'bad', label: 'f', labelDy: 14 })
      .force([L * c / 2, L * s / 2], 147, { deg: -90, color: 'ink2' })
      .force([person * L * c, person * L * s], 686, { deg: -90, color: 'ink2' });
  }
  return S.spec(caption ?? 'A ladder resting on a floor, leaning on a smooth wall. A sketch.', { alt: 'A ladder leaning against a wall' });
}

// the worked ladder (also the Explore's starting values)
const LAD = { L: 5, ml: 15, mp: 70, th: 65, d: 3.5 };
LAD.Nw = ((LAD.ml * G * LAD.L / 2 + LAD.mp * G * LAD.d) * Math.cos(LAD.th * D)) / (LAD.L * Math.sin(LAD.th * D));
LAD.Nf = (LAD.ml + LAD.mp) * G;
LAD.mu = LAD.Nw / LAD.Nf;

const NW = '((147*2.5 + 686*5*f)*cos(th*pi/180))/(5*sin(th*pi/180))';

export default lesson({
  id: 'phys2210.M12.2',
  title: 'Solving equilibrium problems',
  minutes: 12, difficulty: 3,
  intro: t`Real equilibrium problems hide two kinds of unknown: forces **at an angle** (a cable, a strut, a wall pushing on a ladder) and contact forces of **unknown direction** (a hinge, a floor with friction). One recipe handles both. Draw every external force where it acts; put the pivot where the most unknowns act, so their torques vanish; write $\sum\tau = 0$, then $\sum F_x = 0$ and $\sum F_y = 0$. A negative answer just means that force points the other way. For a force $F$ applied a distance $r$ from the pivot:

$$\tau = rF\sin\theta = r_\perp F$$`,
  symbols: [
    { tex: '\\tau', text: 'the torque of the force about the pivot, in N·m (anticlockwise positive)' },
    { tex: 'r', text: 'the distance from the pivot to the point where the force acts, in m' },
    { tex: 'F', text: 'the size of the force, in N' },
    { tex: '\\theta', text: 'the angle between the line from the pivot to that point and the force' },
    { tex: 'r_\\perp = r\\sin\\theta', text: 'the lever arm: the perpendicular distance from the pivot to the force’s line of action, in m' },
  ],
  why: 'This is how engineers size the cables of cranes and bridges, how biomechanists find the surprisingly large forces in your muscles, and where the rules for safe ladder angles come from.',
  visual: {
    type: 'graph',
    title: 'What keeps a ladder from sliding',
    lead: t`A 5.0 m, 15 kg ladder rests on a floor and leans on a smooth wall; a 70 kg climber stands on it. Teal arrows are the wall's and floor's pushes, red the friction the floor must supply, grey the weights. Change the angle and climb.`,
    tasks: [
      'Climb: the friction needed grows the higher the climber goes — ladders usually slip with someone near the top.',
      'Lower the angle: the friction needed rises steeply. Steep ladders are safer; the usual rule is about 75°.',
      'Watch the floor’s upward push: it always carries the full 833 N, wherever the climber stands.',
    ],
    params: {
      x: [-1.2, 5.2], y: [-0.6, 5.4], equal: true, xlabel: 'x (m)', ylabel: '', aspect: 'wide',
      alt: 'A ladder leaning on a wall, with the forces on it',
      sliders: [
        { key: 'th', label: 'Angle with the floor, $\\theta$', min: 45, max: 80, step: 1, value: 65, unit: '^\\circ', explain: 'Steeper ladders lean less on the wall.' },
        { key: 'f', label: 'Climber’s height up the ladder', min: 0, max: 1, step: 0.02, value: 0.7, unit: '\\times L', explain: 'As a fraction of the ladder’s length, measured along it from the foot.' },
      ],
      curves: [
        { fn: '0', color: 'ink3', width: 2 },
        { param: ['5*cos(th*pi/180)', 't'], t: [0, 5.3], color: 'ink3', width: 3 },
        { param: ['5*cos(th*pi/180)*t', '5*sin(th*pi/180)*t'], t: [0, 1], color: 'gold', width: 5 },
      ],
      arrows: [
        { from: ['5*cos(th*pi/180)', '5*sin(th*pi/180)'], to: [`5*cos(th*pi/180) - ${NW}/400`, '5*sin(th*pi/180)'], color: 'teal', label: 'N (wall)', labelAlign: 'right', labelDx: -6 },
        { from: [0, 0], to: [0, 833 / 400], color: 'teal', label: 'N (floor)' },
        { from: [0, 0], to: [`${NW}/400`, 0], color: 'bad', label: 'f', labelDy: 14 },
        { from: ['2.5*cos(th*pi/180)', '2.5*sin(th*pi/180)'], to: ['2.5*cos(th*pi/180)', `2.5*sin(th*pi/180) - ${147 / 400}`], color: 'ink2' },
        { from: ['5*f*cos(th*pi/180)', '5*f*sin(th*pi/180)'], to: ['5*f*cos(th*pi/180)', `5*f*sin(th*pi/180) - ${686 / 400}`], color: 'ink2', label: '686 N' },
      ],
      points: [{ x: '5*f*cos(th*pi/180)', y: '5*f*sin(th*pi/180) + 0.25', color: 'accent', r: 7 }],
      readouts: [
        { label: 'wall’s push', expr: NW, unit: '\\mathrm{N}', digits: 3 },
        { label: 'floor’s push', expr: '833', unit: '\\mathrm{N}', digits: 3 },
        { label: 'friction needed', expr: NW, unit: '\\mathrm{N}', digits: 3 },
        { label: 'smallest $\\mu_s$ that holds it', expr: `${NW}/833`, digits: 3 },
      ],
    },
    caption: 'Seen from the side. Forces to scale (1 m of arrow per 400 N), each drawn from where it acts. The wall is frictionless; the floor’s friction is whatever is needed, up to μₛ times its push.',
  },
  example: {
    prompt: t`A uniform ladder, ${LAD.L.toFixed(1)} m long with mass ${LAD.ml} kg, leans against a smooth wall at ${LAD.th}° to the floor. A ${LAD.mp} kg climber stands ${LAD.d} m up it (measured along the ladder). Find the wall's push and the friction the floor must supply. What is the least coefficient of static friction that keeps the ladder from slipping?`,
    visual: ladderPicture({ th: LAD.th, person: LAD.d / LAD.L, forces: true, caption: 'The forces on the ladder, to scale (1 m per 400 N), each drawn from where it acts.' }),
    steps: [
      { label: 'The forces', text: t`Weights $${s3(LAD.ml * G)}$ N (ladder, at its middle) and $${s3(LAD.mp * G)}$ N (climber). The smooth wall pushes horizontally, $N_w$. The floor pushes up, $N_f$, and sideways with friction $f$ toward the wall. Three unknowns.` },
      { label: 'Pivot at the foot', text: t`$N_f$ and $f$ both act at the foot, so about the foot their torques vanish. The lever arms there: the wall's horizontal push acts at height $L\sin\theta$; each weight acts at its horizontal distance from the foot, $d\cos\theta$.` },
      { label: 'Torques about the foot', text: t`$N_w(${LAD.L}\sin${LAD.th}^\circ) = ${s3(LAD.ml * G)}(2.5\cos${LAD.th}^\circ) + ${s3(LAD.mp * G)}(${LAD.d}\cos${LAD.th}^\circ)$, so $N_w = ${s3(LAD.Nw)}$ N.` },
      { label: 'Forces', text: t`Horizontally: $f = N_w = ${s3(LAD.Nw)}$ N. Vertically: $N_f = ${s3(LAD.ml * G)} + ${s3(LAD.mp * G)} = ${s3(LAD.Nf)}$ N.` },
      { label: 'Friction needed', text: t`Static friction can reach $\mu_s N_f$, so the ladder holds if $\mu_s \ge f/N_f = ${s3(LAD.Nw)}/${s3(LAD.Nf)} = ${s3(LAD.mu)}$.` },
      { label: 'Sense check', text: t`Rubber feet on concrete have $\mu_s$ near 0.6 or more, so this is safe. On a polished floor ($\mu_s \approx 0.2$) it would slip — and it gets worse as the climber goes higher.` },
    ],
    answer: t`$N_w = f = ${s3(LAD.Nw)}$ N; $N_f = ${s3(LAD.Nf)}$ N; it needs $\mu_s \ge ${s3(LAD.mu)}$.`,
  },
  practice: [
    num({
      id: 'angled-cable', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 35, 40, 50]), mb = r.pick([10, 15, 20]), mL = r.pick([40, 50, 60]), L = r.pick([2.5, 3.0]);
        const T = (mb * G / 2 + mL * G) / Math.sin(th * D);
        return {
          prompt: t`A uniform ${L} m boom of mass ${mb} kg sticks out horizontally from a wall, on a hinge. A cable from its far end runs to the wall above, making ${th}° with the boom. A ${mL} kg load hangs from the far end. What is the tension in the cable?`,
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: mb * G / 2 + mL * G, feedback: t`The cable pulls at an angle: only $T\sin\theta$ has a lever arm about the hinge. Divide by $\sin ${th}^\circ$.` }, { value: (mb * G / 2 + mL * G) / Math.cos(th * D), feedback: t`The component perpendicular to the boom is $T\sin\theta$, since $\theta$ is measured from the boom.` }],
          hints: [t`Take torques about the hinge: its unknown force drops out.`, t`The cable's torque is $T L\sin ${th}^\circ$; the weights' are $(${mb}g)(L/2)$ and $(${mL}g)L$. $L$ cancels.`],
          teach: 'An angled force’s torque uses only its perpendicular component: τ = rF sin θ.',
          explain: t`$T L\sin${th}^\circ = (${mb})(9.8)\tfrac{L}{2} + (${mL})(9.8)L$, so $T = \dfrac{${s3(mb * G / 2)} + ${s3(mL * G)}}{\sin${th}^\circ} = ${s3(T)}$ N — more than the load's weight, because the cable pulls so shallowly.`,
          visual: boomPicture({ L, th, load: `${mL} kg`, boomW: `${mb} kg`, caption: 'The boom, hinged at the wall; arrows show directions only.' }),
        };
      },
    }),
    mcq({
      id: 'lever-error', difficulty: 2, kind: 'error',
      prompt: 'A cable pulls with 200 N on the end of a 3.0 m boom, at 30° to the boom. A student writes the cable’s torque about the hinge as τ = (200 N)(3.0 m) = 600 N·m. What is wrong?',
      choices: [
        'Only the part of the force perpendicular to the boom turns it: τ = (200)(3.0) sin 30° = 300 N·m',
        'Torque uses the cosine: τ = (200)(3.0) cos 30° = 520 N·m',
        'Nothing: torque is force times distance',
        'The torque should be divided by the boom’s length, not multiplied',
      ],
      answer: 0,
      why: {
        1: 'The cosine gives the component along the boom, which pulls straight at the hinge and has no lever arm.',
        2: 'Force times distance works only when the force is perpendicular to the line from the pivot.',
        3: 'Torque grows with the distance from the pivot — a longer wrench turns a bolt more easily.',
      },
      hints: [t`Split the 200 N into a part along the boom and a part across it. Which part can turn the boom?`],
      teach: 'Torque is r F sin θ: the lever arm is the perpendicular distance to the force’s line of action, not the distance to where it acts.',
      explain: t`$\tau = rF\sin\theta = (3.0)(200)\sin30^\circ = 300$ N·m. Equivalently, the lever arm is $r_\perp = 3.0\sin30^\circ = 1.5$ m.`,
      visual: (() => {
        const S = scene({ perN: 1 }), top = [0, 3 * Math.tan(30 * D)];
        S.surface([0, -0.6], [0, top[1] + 0.4], 'left').bar([0, 0], [3, 0], { width: 6 }).pin([0, 0], { wall: 'left' })
          .line([3, 0], top, { color: 'good', width: 2 }).force([3, 0], 1.0, { dir: [-3, top[1]], color: 'good', label: '200 N', labelDx: -40 })
          .line([0, 0], [0.75, 1.3], { color: 'gold', dash: true }).text([0.4, 0.9], 'r⊥', { color: 'gold', dx: 8 })
          .turn([3, 0], 0.7, 180, 150, { color: 'ink2', label: '30°' }).dim([0, 0], [3, 0], '3.0 m', { off: [0, -0.5] });
        return S.spec('The boom and the cable’s pull. Dashed gold: the perpendicular from the hinge to the cable’s line — the lever arm.');
      })(),
    }),
    num({
      id: 'forearm', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 4, 5]), mf = 1.5;
        const F = (mf * G * 0.15 + m * G * 0.33) / 0.04;
        return {
          prompt: t`You hold a ${m} kg ball in your hand with your forearm horizontal. Your biceps pulls straight up on the forearm 4.0 cm from the elbow; the forearm (1.5 kg) has its centre of gravity 15 cm from the elbow, and the ball sits 33 cm from it. How hard does the biceps pull?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (m * G * 0.33) / 0.04, feedback: 'Include the forearm’s own weight, acting 15 cm from the elbow.' }, { value: m * G + mf * G, feedback: 'The forces are not all at the same place: balance the torques about the elbow.' }],
          hints: [t`Take torques about the elbow joint, where an unknown force acts.`, t`$F(0.04) = (1.5)(9.8)(0.15) + (${m})(9.8)(0.33)$.`],
          teach: 'Muscles attach close to joints, so they work at a large mechanical disadvantage: the biceps pulls many times the weight in your hand.',
          explain: t`$F = \dfrac{(1.5)(9.8)(0.15) + (${m})(9.8)(0.33)}{0.04} = ${s3(F)}$ N — about ${Math.round(F / (m * G))} times the ball's weight. The short lever arm buys speed and range of motion at the cost of force.`,
          visual: (() => {
            const S = scene({ perN: 1 });
            S.bar([0, 0], [0.36, 0], { color: 'ink2', width: 7 }).line([0, 0], [0, 0.32], { color: 'ink3', width: 6 })
              .dot([0, 0], 'elbow', { color: 'ink', r: 5, dx: -40, dy: 12 }).dot([0.33, 0.035], '', { color: 'gold', r: 9 })
              .force([0.04, 0.02], 0.26, { deg: 90, color: 'bad', label: 'F = ?' })
              .force([0.15, -0.02], 0.08, { deg: -90, color: 'ink2', label: '1.5 kg' }).force([0.33, -0.02], 0.12, { deg: -90, color: 'ink2', label: `${m} kg` })
              .dim([0, 0], [0.04, 0], '4 cm', { off: [0, -0.12] }).dim([0, 0], [0.15, 0], '15 cm', { off: [0, -0.2] }).dim([0, 0], [0.33, 0], '33 cm', { off: [0, -0.28] });
            return S.spec('The forearm, horizontal, with the elbow on the left. Arrows show directions, not sizes.');
          })(),
        };
      },
    }),
    mcq({
      id: 'when-slip', difficulty: 2,
      prompt: 'A ladder leans on a smooth wall, its feet on a rough floor. A climber goes up it. When is it most likely to slip?',
      choices: ['With the climber near the top', 'With the climber near the bottom', 'With the climber halfway up', 'It makes no difference where the climber stands'],
      answer: 0,
      why: {
        1: 'Near the bottom the climber’s weight has almost no lever arm about the foot: the wall barely has to push, and little friction is needed.',
        2: 'Halfway is safer than the top: the friction needed keeps growing as the climber rises.',
        3: 'The floor’s upward push is the same everywhere, but the friction needed is not: it grows with the climber’s lever arm about the foot.',
      },
      hints: ['Take torques about the foot. How does the climber’s lever arm change as they climb?', 'The wall’s push balances that torque, and the floor’s friction must balance the wall’s push.'],
      teach: 'The friction a ladder needs grows with the climber’s height, because the climber’s torque about the foot does.',
      explain: t`About the foot, the climber's torque is $mg\,d\cos\theta$, growing as they climb ($d$ up). The wall's push must balance it, and friction must match the wall's push: the higher the climber, the more friction is needed.`,
      visual: ladderPicture({ th: 62, person: 0.5, caption: 'The ladder and the climber partway up. A sketch.' }),
    }),
    num({
      id: 'ladder-mu', difficulty: 3,
      gen(r) {
        const th = r.pick([55, 60, 65, 70]), ml = r.pick([10, 15, 20]), mp = r.pick([60, 70, 80]);
        const mu = ((ml / 2 + mp) / (ml + mp)) / Math.tan(th * D);
        return {
          prompt: t`A uniform ladder of mass ${ml} kg leans on a smooth wall at ${th}° to the floor. A ${mp} kg climber stands at its very top. What is the smallest coefficient of static friction between the ladder's feet and the floor that keeps it from slipping?`,
          answer: mu, tol: { rel: 0.01 },
          errors: [{ value: mu * Math.tan(th * D) ** 2, feedback: t`Check the trig: the weights' lever arms about the foot use $\cos\theta$, the wall's uses $\sin\theta$, so the ratio is $\cot\theta = 1/\tan\theta$.` }, { value: ((ml + mp) / (ml + mp)) / Math.tan(th * D), feedback: t`The ladder's weight acts at its middle: its lever arm is half the climber's.` }],
          hints: [
            t`Pivot at the foot. The ladder's length $L$ will cancel, so call it $L$.`,
            t`$N_w L\sin\theta = m_\ell g\tfrac{L}{2}\cos\theta + m_p g L\cos\theta$, so $N_w = \dfrac{(m_\ell/2 + m_p)g}{\tan\theta}$.`,
            t`Friction must equal $N_w$, and the floor pushes up with $(m_\ell + m_p)g$: $\mu_s \ge f/N_f$.`,
          ],
          teach: 'For a ladder on a smooth wall, the needed friction is the wall’s push; divide by the floor’s push for the minimum μₛ.',
          explain: t`$\mu_\text{min} = \dfrac{m_\ell/2 + m_p}{(m_\ell + m_p)\tan\theta} = \dfrac{${ml / 2} + ${mp}}{(${ml + mp})\tan${th}^\circ} = ${s3(mu)}$. The steeper the ladder, the smaller this is.`,
          visual: ladderPicture({ th, person: 1, caption: 'The ladder with the climber at the top. A sketch.' }),
        };
      },
    }),
    num({
      id: 'hinge-force', difficulty: 3,
      gen(r) {
        const th = r.pick([30, 40, 50]), mL = r.pick([40, 60, 80]);
        const T = (mL * G) / Math.sin(th * D), H = T * Math.cos(th * D);
        return {
          prompt: t`A light horizontal boom (its own mass negligible) is hinged to a wall. A cable from its far end runs to the wall above at ${th}° to the boom, and a ${mL} kg load hangs from the far end. How hard does the hinge push horizontally on the boom?`,
          answer: H, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: T, feedback: 'That is the cable’s tension. The hinge balances only its horizontal component.' }, { value: mL * G * Math.tan(th * D), feedback: t`Check the trig: $H = T\cos\theta$ with $T = mg/\sin\theta$, so $H = mg/\tan\theta$.` }],
          hints: [
            t`First the cable's tension, from torques about the hinge: $T L\sin\theta = mgL$.`,
            t`Then horizontal forces: the hinge's push must balance the cable's horizontal pull, $T\cos\theta$.`,
          ],
          teach: t`A hinge pushes in whatever direction balances the other forces: find its components from $\sum F_x = 0$ and $\sum F_y = 0$.`,
          explain: t`$T = \dfrac{(${mL})(9.8)}{\sin${th}^\circ} = ${s3(T)}$ N; the hinge pushes outward, away from the wall, with $H = T\cos${th}^\circ = ${s3(H)}$ N. Vertically the cable holds up the whole load, so here the hinge pushes only horizontally.`,
          visual: boomPicture({ L: 3, th, load: `${mL} kg`, caption: 'A light boom hinged at the wall, held by the cable. Arrows show directions only.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-boom', difficulty: 2,
      gen(r) {
        const th = r.pick([25, 35, 50]), mb = r.pick([12, 18]), mL = r.pick([30, 45]);
        const T = (mb * G / 2 + mL * G) / Math.sin(th * D);
        return {
          prompt: t`A uniform horizontal boom of mass ${mb} kg is hinged to a wall. A cable from its far end to the wall above makes ${th}° with the boom, and a ${mL} kg sign hangs from the far end. What is the cable's tension?`,
          answer: T, units: 'N', tol: { rel: 0.01 },
          hints: [t`Torques about the hinge: $TL\sin\theta = m_b g\tfrac{L}{2} + m g L$.`],
          teach: 'Take torques about the hinge and use the cable’s perpendicular component, T sin θ.',
          explain: t`$T = \dfrac{(${mb})(9.8)/2 + (${mL})(9.8)}{\sin${th}^\circ} = ${s3(T)}$ N.`,
          visual: boomPicture({ L: 3, th, load: `${mL} kg`, boomW: `${mb} kg` }),
        };
      },
    }),
    num({
      id: 'cp-ladder', difficulty: 3,
      gen(r) {
        const th = r.pick([60, 65, 70]), ml = r.pick([12, 16]), mp = r.pick([65, 75]), f = r.pick([0.5, 0.75]), L = 4;
        const Nw = ((ml * G * L / 2 + mp * G * f * L) * Math.cos(th * D)) / (L * Math.sin(th * D));
        return {
          prompt: t`A uniform ${L} m ladder of mass ${ml} kg leans on a smooth wall at ${th}° to the floor. A ${mp} kg climber stands ${f * L} m up it, measured along the ladder. How hard does the wall push on the ladder?`,
          answer: Nw, units: 'N', tol: { rel: 0.01 },
          hints: [t`Pivot at the foot: $N_w L\sin\theta = m_\ell g\tfrac{L}{2}\cos\theta + m_p g\,d\cos\theta$.`, t`$d = ${f * L}$ m along the ladder.`],
          teach: 'Pivot at the ladder’s foot, where the two unknown floor forces act.',
          explain: t`$N_w = \dfrac{[(${ml})(9.8)(${L / 2}) + (${mp})(9.8)(${f * L})]\cos${th}^\circ}{${L}\sin${th}^\circ} = ${s3(Nw)}$ N — and the floor must supply that much friction.`,
          visual: ladderPicture({ th, L, person: f, caption: 'The ladder and the climber. A sketch.' }),
        };
      },
    }),
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([20, 30, 40]), b = r.pick([1.6, 1.8, 2.4]), h = r.pick([6, 7, 8]);
        const F = (m * 1000 * G * (b / 2)) / h;
        return {
          prompt: t`A ${m}-tonne test rocket stands, unclamped, on a pad on its ${b} m-wide base. A side wind pushes on it with a total force whose line of action is ${h} m above the pad. How large must that wind force be to start tipping it over? (Its weight acts through the centre of the base.)`,
          answer: F / 1000, units: 'kN', tol: { rel: 0.01 },
          errors: [{ value: (m * 1000 * G * b) / h / 1000, feedback: 'The weight’s lever arm about the downwind edge is half the base width, b/2.' }, { value: (m * 1000 * G * h) / (b / 2) / 1000, feedback: 'Upside down: the wind’s torque is F·h, the weight’s is W·(b/2).' }],
          hints: [
            'As it begins to tip, the rocket pivots on the downwind edge of its base, and the pad’s push is concentrated there.',
            t`About that edge: the wind's torque is $F h$, the weight's (resisting) torque is $W\,b/2$.`,
            t`Tipping starts when $Fh = W\tfrac{b}{2}$, with $W = ${m * 1000}\times9.8$ N.`,
          ],
          teach: 'A free-standing object tips about the edge of its base when the overturning torque exceeds its weight times half the base width.',
          explain: t`$F = \dfrac{W\,b/2}{h} = \dfrac{(${m * 1000})(9.8)(${b / 2})}{${h}} = ${s3(F / 1000)}$ kN. Launch pads use hold-down clamps so that no gust — and no engine start-up transient — can tip the vehicle.`,
          visual: (() => {
            const S = scene({ perN: 1 });
            S.surface([-3, 0], [3.5, 0], 'below').box([-b / 2, 0], [b / 2, 12], { color: 'ink2', alpha: 0.3 })
              .force([-b / 2 - 3, h], 2.6, { deg: 0, color: 'warn', label: 'wind' }).line([-b / 2 - 3, h], [b / 2, h], { color: 'warn', dash: true })
              .force([0, 6], 3.2, { deg: -90, color: 'ink2', label: 'W' })
              .dot([b / 2, 0], 'pivot edge', { color: 'bad', r: 5, dx: 8, dy: 12 })
              .dim([b / 2, 0], [b / 2, h], `${h} m`, { off: [1.1, 0], dx: 6, dy: 0 }).dim([-b / 2, 0], [b / 2, 0], `${b} m`, { off: [0, -0.9] });
            return S.spec('The rocket (grey box) on its pad, side view. Arrows show directions; not to scale.');
          })(),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §12.2 Examples of Static Equilibrium', url: 'https://openstax.org/books/university-physics-volume-1/pages/12-2-examples-of-static-equilibrium' },
    { label: 'OSHA, Portable ladder safety (the 4-to-1 rule, about 75°)', url: 'https://www.osha.gov/sites/default/files/publications/portable_ladder_qc.pdf' },
  ],
});
