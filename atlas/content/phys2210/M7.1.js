// Work done by a constant force: W = F·Δr = F Δr cos θ — only the part of the
// force along the motion counts, and its sign says whether energy goes in or out.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, s3, blockPic, sci, thou } from './_energy.js';

const t = String.raw;
const D2R = Math.PI / 180;
const cosd = (d) => Math.cos(d * D2R), sind = (d) => Math.sin(d * D2R);

// the worked example: a crate dragged at constant velocity by a rope at 30°
const EX = { m: 120, T: 450, th: 30, d: 15.0 };
EX.WT = EX.T * EX.d * cosd(EX.th);                 // 5846 J
EX.f = EX.T * cosd(EX.th);                         // friction balances the forward pull: 389.7 N
EX.N = EX.m * G - EX.T * sind(EX.th);              // 951 N

// a satellite's circular orbit, for the checkpoint picture
const orbitPic = {
  type: 'graph',
  params: {
    x: [-1.9, 1.9], y: [-1.35, 1.35], equal: true, aspect: 'wide', grid: false, axes: false, xlabel: '', ylabel: '',
    alt: 'A satellite on a circular orbit, with its velocity along the orbit and the pull of gravity toward the planet',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true }],
    shade: [],
    points: [{ x: 0, y: 0, r: 16, color: 'accent' }, { x: 0.7071, y: 0.7071, r: 6, color: 'gold' }, { x: -0.25, y: -0.3, r: 0.01, color: 'ink2', label: 'Earth' }],
    arrows: [
      { from: [0.7071, 0.7071], to: [0.2828, 0.2828], color: 'bad', label: 'F (gravity)', labelDx: 10, labelDy: 14 },
      { from: [0.7071, 0.7071], to: [0.0707, 1.3435], color: 'good', label: 'v', labelDx: -16, labelDy: -2 },
    ],
  },
  caption: 'A circular orbit seen from above, not to scale. Gravity points to Earth’s centre; the velocity is along the orbit.',
};

export default lesson({
  id: 'phys2210.M7.1',
  title: 'Work done by a constant force',
  minutes: 10, difficulty: 2,
  intro: t`A force does **work** on an object when the object moves while the force acts. Work is how a force puts energy into an object — or takes it out. For a constant force and a straight-line displacement, only the part of the force **along the motion** counts:

$$W = \vec F\cdot\Delta\vec r = F\,\Delta r\cos\theta$$

A force with a component along the motion does positive work; one with a component against it does negative work; and a force at right angles to the motion — the normal force on a sliding crate, gravity on a satellite in a circular orbit — does no work at all, however large it is.`,
  symbols: [
    { tex: 'W', text: 'the work done **by one particular force** on the object, in joules (J). A scalar, and it can be negative' },
    { tex: '\\vec F', text: 'that force, constant in size and direction, in newtons (N)' },
    { tex: '\\Delta\\vec r', text: 'the displacement of the object while the force acts, in metres (m)' },
    { tex: 'F,\\ \\Delta r', text: 'the magnitudes of the force and of the displacement (both positive)' },
    { tex: '\\theta', text: 'the angle between $\\vec F$ and $\\Delta\\vec r$ drawn tail to tail, from 0° to 180°: below 90° the work is positive, above 90° negative, at exactly 90° zero' },
    { tex: '1\\ \\mathrm{J}', text: 'one joule, the work done by 1 N acting along 1 m of motion: 1 J = 1 N·m = 1 kg·m²/s²' },
  ],
  why: 'Work is the currency of energy: the next lessons turn “force along a distance” into a change of speed, and every engine, brake and rocket stage is accounted for in joules.',
  visual: {
    type: 'graph',
    title: 'Pull at an angle and watch the work change',
    lead: t`A constant force $\vec F$ (blue) acts on a block while it slides a distance $\Delta r$ to the right (green). Only the gold part of the force, $F\cos\theta$, lies along the motion — and only that part does work. Change the angle and read the work.`,
    tasks: [
      'Set θ = 90°: the force has no component along the motion and W = 0, however large F is.',
      'Swing θ past 90°: the gold component points backwards and W turns negative — the force now takes energy away, as a brake does.',
      'At θ = 0, double the distance: W doubles. Double the force: W doubles too.',
    ],
    params: {
      x: [-2.2, 5.6], y: [-1.15, 2.95], equal: true, grid: false, axes: false, xlabel: '', ylabel: '',
      alt: 'A block on a floor pulled by a force at an adjustable angle, with the force’s component along the motion and the displacement',
      sliders: [
        { key: 'F', label: 'Force $F$', min: 0, max: 100, step: 1, value: 60, unit: '\\mathrm{N}', explain: 'The size of the constant force.' },
        { key: 'th', label: 'Angle $\\theta$', min: 0, max: 180, step: 5, value: 30, unit: '^\\circ', explain: 'Between the force and the direction of motion (here, +x).' },
        { key: 'd', label: 'Distance $\\Delta r$', min: 0.5, max: 5, step: 0.1, value: 4, unit: '\\mathrm{m}', explain: 'How far the block slides while the force acts.' },
      ],
      shade: [{ fn: '0.9', lower: '0', from: -0.5, to: 0.5, color: 'accent', alpha: 0.5 }],
      curves: [
        { fn: '0', domain: [-2.2, 5.6], color: 'ink3', width: 2 },
        { param: ['F/40*sin((90 - th)*pi/180)', '0.45 + t*F/40*sin(th*pi/180)'], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
        { param: ['0.55*cos(t)', '0.45 + 0.55*sin(t)'], t: [0, 'th*pi/180'], color: 'gold', width: 1.6 },
      ],
      arrows: [
        { from: [0, 0.45], to: ['F/40*sin((90 - th)*pi/180)', '0.45 + F/40*sin(th*pi/180)'], color: 'accent', label: 'F' },
        { from: [0, 0.45], to: ['F/40*sin((90 - th)*pi/180)', 0.45], color: 'gold', label: 'F cos θ', labelDy: 14 },
        { from: [0, -0.55], to: ['d', -0.55], color: 'good', label: 'Δr' },
      ],
      points: [{ x: '0.8*cos(th*pi/360)', y: '0.45 + 0.8*sin(th*pi/360)', r: 0.01, color: 'gold', label: 'θ', labelDx: -2, labelDy: 0 }],
      readouts: [
        { label: 'component along the motion $F\\cos\\theta$', expr: 'F*sin((90 - th)*pi/180)', unit: '\\mathrm{N}', digits: 3 },
        { label: 'work $W = F\\,\\Delta r\\cos\\theta$', expr: 'F*d*sin((90 - th)*pi/180)', unit: '\\mathrm{J}', digits: 3 },
      ],
    },
    caption: 'The force arrow is drawn at 40 N per unit of the picture and the displacement in metres, so the two scales differ. The dashed part of the force, perpendicular to the motion, does no work.',
  },
  example: {
    prompt: t`A crew drags a ${EX.m} kg equipment crate ${EX.d.toFixed(1)} m across a level hangar floor **at constant velocity**, with a rope pulling at ${EX.th}.0° above the horizontal. The tension in the rope is ${EX.T} N. Find the work done on the crate by (a) the rope, (b) friction, (c) gravity and the normal force, and (d) all the forces together.`,
    visual: {
      type: 'mech-fbd',
      params: {
        scene: 'body', icon: 'block', ground: true, v: [1, 0], values: true,
        forces: [
          { label: 'T', mag: EX.T, dir: EX.th, kind: 'tension' },
          { label: 'f', mag: +EX.f.toFixed(1), dir: 180, kind: 'friction' },
          { label: 'N', mag: Math.round(EX.N), dir: 90, kind: 'normal' },
          { label: 'mg', mag: Math.round(EX.m * G), dir: 270, kind: 'weight' },
        ],
      },
      caption: 'The crate and its free-body diagram. The velocity is constant, so the forces balance.',
    },
    steps: [
      { label: 'The rope', text: t`The rope’s force makes $\theta = ${EX.th}°$ with the displacement: $W_T = T\,\Delta r\cos\theta = (${EX.T}\ \text{N})(${EX.d.toFixed(1)}\ \text{m})\cos ${EX.th}° = ${sci(EX.WT, 3)}\ \text{J}$. Only the forward part of the pull, $${EX.T}\cos${EX.th}° = ${fmt(EX.f, 4)}$ N, does work; the upward part just lightens the load on the floor.` },
      { label: 'Friction', text: t`Constant velocity means zero net force, so friction exactly balances the forward pull: $f = ${fmt(EX.f, 4)}$ N, pointing backwards ($\theta = 180°$, $\cos\theta = -1$). $W_f = -(${fmt(EX.f, 4)}\ \text{N})(${EX.d.toFixed(1)}\ \text{m}) = -${sci(EX.WT, 3)}\ \text{J}$ — **negative work**: friction takes energy out of the crate’s motion.` },
      { label: 'Gravity and the floor', text: t`Both are vertical and the motion is horizontal: $\theta = 90°$, so $W_g = W_N = 0$. The floor pushes up with ${Math.round(EX.N)} N, and that large force still does no work.` },
      { label: 'All together', text: t`$W_\text{net} = ${sci(EX.WT, 3)} - ${sci(EX.WT, 3)} + 0 + 0 = 0$. The crate’s speed does not change, and in the next lesson you will see why that is no coincidence: the net work equals the change in kinetic energy.` },
      { label: 'Sense check', text: t`About 5.8 kJ — roughly the energy needed to lift the crate 5 m. The rope’s energy does not vanish: it ends up as thermal energy in the crate and the floor.` },
    ],
    answer: t`(a) $W_T = +${sci(EX.WT, 3)}$ J; (b) $W_f = -${sci(EX.WT, 3)}$ J; (c) $W_g = W_N = 0$; (d) $W_\text{net} = 0$.`,
  },
  practice: [
    mcq({
      id: 'carry-level', difficulty: 1,
      prompt: 'A courier carries a 12 kg parcel 8.0 m along a level corridor at constant velocity, holding it at the same height. How much work does the courier’s upward force on the parcel do?',
      choices: ['0 J', '941 J', '−941 J', 'It depends on how fast the courier walks'],
      answer: 0,
      why: {
        1: t`That multiplies the force ($mg = 118$ N) by a distance it does not act along. The parcel moves sideways and the force points up: $\cos 90° = 0$.`,
        2: 'Negative work needs a force with a component *against* the motion. This force has no component along the motion at all.',
        3: 'Work depends on the force and the displacement, not on the speed. (Speed matters for power, two lessons on.)',
      },
      hints: ['Draw the force and the displacement as arrows, tail to tail. What is the angle between them?'],
      teach: 'A force perpendicular to the motion does no work, however large it is.',
      explain: t`The upward force (118 N) is at 90° to the horizontal displacement, so $W = F\,\Delta r\cos 90° = 0$. The parcel’s energy does not change. (Your arm muscles do get tired — but that is chemistry inside you, not work on the parcel.)`,
      visual: blockPic({ forces: [{ deg: 90, label: 'F (hand)', len: 1.5 }], d: 'Δr = 8.0 m', floor: false, caption: 'The parcel, the courier’s upward force and the parcel’s displacement. Not to scale.' }),
    }),
    num({
      id: 'strap-pull', difficulty: 2,
      gen(r) {
        const F = r.pick([80, 95, 110, 125, 140]), th = r.pick([20, 25, 30, 35, 40, 50]), d = r.pick([8, 10, 12, 15, 20, 25]);
        const W = F * d * cosd(th);
        return {
          prompt: t`A field team drags an instrument sledge ${d} m across level snow. The strap pulls with a constant ${F} N at ${th}° above the horizontal. How much work does the strap do on the sledge?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: F * d, feedback: t`That treats the whole force as if it pointed along the motion. Only $F\cos\theta$ does work.` },
            { value: F * d * sind(th), feedback: t`The angle is measured from the motion, so the component along it is $F\cos\theta$, not $F\sin\theta$.` },
          ],
          hints: [t`$W = F\,\Delta r\cos\theta$, with $\theta$ the angle between the strap and the direction of motion.`],
          teach: 'Only the component of a force along the displacement does work: W = F Δr cos θ.',
          explain: t`$W = (${F}\ \text{N})(${d}\ \text{m})\cos ${th}° = ${s3(W)}$ J. The upward part of the pull, $${F}\sin${th}° = ${s3(F * sind(th))}$ N, does none.`,
          visual: blockPic({ forces: [{ deg: th, label: `${F} N` }], d: `${d} m`, angle: `${th}°`, caption: 'The sledge, the strap’s force and the displacement. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'friction-work', difficulty: 2,
      gen(r) {
        const m = r.pick([25, 30, 40, 50, 60]), mu = r.pick([0.15, 0.2, 0.25, 0.3, 0.35]), d = r.pick([3, 4, 5, 6, 8]);
        const f = mu * m * G, W = -f * d;
        return {
          prompt: t`A ${m} kg crate slides ${d} m across a level floor. The coefficient of kinetic friction is ${mu}. How much work does friction do on the crate? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: f * d, feedback: t`Friction points against the motion ($\theta = 180°$), so its work is negative.` },
            { value: -mu * m * d, feedback: t`Friction is $\mu_k N$, and on a level floor $N = mg$: include $g$.` },
          ],
          hints: [t`Kinetic friction has size $f = \mu_k mg$ on a level floor and points opposite the motion.`, t`$W_f = f\,\Delta r\cos 180° = -\mu_k m g\,\Delta r$.`],
          teach: 'Kinetic friction always opposes the sliding, so the work it does on the sliding object is negative.',
          explain: t`$f = ${mu}(${m})(9.8) = ${s3(f)}$ N, opposite the motion, so $W_f = -(${s3(f)}\ \text{N})(${d}\ \text{m}) = ${s3(W)}$ J.`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'block', ground: true, v: [1, 0], forces: [{ label: 'f', mag: +f.toFixed(1), dir: 180, kind: 'friction' }, { label: 'N', mag: +(m * G).toFixed(1), dir: 90, kind: 'normal' }, { label: 'mg', mag: +(m * G).toFixed(1), dir: 270, kind: 'weight' }] }, caption: 'The sliding crate (moving right) and its free-body diagram, forces to scale.' },
        };
      },
    }),
    mcq({
      id: 'lowered-load', difficulty: 2,
      prompt: t`A crane lowers a 500 kg engine 3.0 m at constant speed. How much work does the cable do on the engine? ($g = 9.8\ \text{m/s}^2$.)`,
      choices: [t`$-14.7$ kJ`, t`$+14.7$ kJ`, '0 J, because the speed is constant', 'It cannot be found without the time the lowering takes'],
      answer: 0,
      why: {
        1: 'The cable is doing a job, but it pulls up while the engine moves down: θ = 180°, so its work is negative.',
        2: 'Constant speed makes the *net* work zero. Each force on its own still does work: the cable negative, gravity positive.',
        3: 'Work needs only the force and the displacement. Time would matter for the power.',
      },
      hints: ['At constant speed the cable’s tension equals the weight, mg = 4900 N.', 'The tension points up; the displacement points down. What is cos θ?'],
      teach: 'A force opposite to the displacement does negative work, even if it is the force “doing the job”.',
      explain: t`$T = mg = 4900$ N upward; the displacement is 3.0 m downward, so $W_T = (4900)(3.0)\cos 180° = -14\,700$ J. Gravity does $+14\,700$ J, and the net work is zero — the speed stays constant.`,
      visual: blockPic({ forces: [{ deg: 90, label: 'T', color: 'good', len: 1.5 }, { deg: 270, label: 'mg', color: 'ink2', len: 1.5 }], d: 'Δr', dDeg: -90, floor: false, caption: 'The engine, its two forces and its displacement (down). Not to scale.' }),
    }),
    num({
      id: 'ramp-gravity', difficulty: 3,
      gen(r) {
        const m = r.pick([8, 10, 12, 15, 20]), d = r.pick([2.5, 3, 4, 5, 6]), th = r.pick([20, 25, 30, 35, 40, 50]);
        const W = m * G * d * sind(th);
        return {
          prompt: t`A ${m} kg box slides ${d} m down a ramp inclined at ${th}° to the horizontal. How much work does gravity do on the box? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: m * G * d * cosd(th), feedback: t`${th}° is the ramp’s angle, not the angle between gravity and the displacement. Gravity is vertical; the motion runs down the slope, at $90° - ${th}°$ to it.` },
            { value: m * G * d, feedback: 'Gravity is not along the ramp: only its component down the slope does work.' },
          ],
          hints: [
            t`In $W = F\,\Delta r\cos\varphi$, $\varphi$ is the angle between the force and the displacement. Gravity points straight down; the box moves down the slope.`,
            t`That angle is $90° - ${th}°$, and $\cos(90° - \theta) = \sin\theta$, so $W = mg\,\Delta r\sin\theta$.`,
          ],
          teach: 'Gravity’s work depends only on how far the object drops: W = mg Δr sin θ = mgh.',
          explain: t`$W = mg\,\Delta r\sin ${th}° = (${m})(9.8)(${d})\sin ${th}° = ${s3(W)}$ J. Notice $\Delta r\sin\theta = ${s3(d * sind(th))}$ m is the height the box drops: $W = mgh$, whatever the slope.`,
          visual: { type: 'diagram', params: { kind: 'incline', angle: th, mass: m, forces: [{ dir: 'down', label: 'mg', size: 0.9 }, { dir: 'down-slope', label: 'Δr', size: 0.8, color: 'good' }] }, caption: 'The box on the ramp: gravity (grey) and the displacement down the slope (green). Not to scale.' },
        };
      },
    }),
    num({
      id: 'net-work', difficulty: 2,
      gen(r) {
        const m = r.pick([20, 30, 40, 50]), mu = r.pick([0.2, 0.25, 0.3]), d = r.pick([4, 5, 6, 8]);
        const F = Math.round(mu * m * G + r.pick([30, 40, 50, 60]));
        const f = mu * m * G, W = (F - f) * d;
        return {
          prompt: t`A ${m} kg crate is pushed ${d} m across a level floor by a horizontal ${F} N force. The coefficient of kinetic friction is ${mu}. What is the **net** work done on the crate by all the forces? ($g = 9.8\ \text{m/s}^2$.)`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: F * d, feedback: 'That is the work done by the push alone. Friction does negative work at the same time.' },
            { value: (F + f) * d, feedback: 'Friction opposes the motion: its work is negative, so it subtracts.' },
          ],
          hints: ['Find the work done by each force — the push, friction, gravity and the normal force — and add them.', t`Gravity and the normal force are perpendicular to the motion. $W_\text{net} = (F - \mu_k mg)\,\Delta r$.`],
          teach: 'The net work is the sum of the works done by every force — equivalently, the net force times the displacement.',
          explain: t`$W_\text{push} = ${F}\times${d} = ${F * d}$ J; $W_f = -${s3(f)}\times${d} = -${s3(f * d)}$ J; $W_g = W_N = 0$. Net: $${s3(W)}$ J, the same as $F_\text{net}\,\Delta r = (${F} - ${s3(f)})(${d})$.`,
          visual: { type: 'diagram', params: { kind: 'block', mass: m, forces: [{ dir: 0, label: `${F} N`, size: 1 }, { dir: 180, label: 'f', size: f / F }, { dir: 90, label: 'N', size: 0.75 }, { dir: 270, label: 'mg', size: 0.75 }] }, caption: 'The crate’s free-body diagram; it slides to the right. Arrows show directions; the push and friction are to scale with each other.' },
        };
      },
    }),
    mcq({
      id: 'normal-error', difficulty: 3, kind: 'error',
      prompt: t`A block of mass $m$ slides a distance $d$ down a frictionless ramp inclined at $\theta$. A student finds the work done by the normal force:

$$W_N = N\,d\cos\theta = (mg\cos\theta)\,d\cos\theta = mg\,d\cos^2\theta$$

What is wrong?`,
      choices: [
        t`The normal force is perpendicular to the ramp, so it is at 90° to the motion and $W_N = 0$`,
        t`$N$ should be $mg$, not $mg\cos\theta$`,
        t`The cosine should be a sine: $W_N = mg\,d\cos\theta\sin\theta$`,
        'Nothing is wrong except the sign: it should be negative',
      ],
      answer: 0,
      why: {
        1: t`On a ramp $N = mg\cos\theta$ is right — but the size of $N$ does not matter here: its work is zero.`,
        2: t`Any non-zero answer has the same flaw: the angle that matters is between $\vec N$ and $\Delta\vec r$, and it is 90°.`,
        3: 'The normal force neither helps nor resists motion along the surface; its work is zero, not negative.',
      },
      hints: ['Which angle goes into W = F d cos θ?', 'The normal force is perpendicular to the surface; the block moves along the surface.'],
      teach: 'The angle in W = F Δr cos θ is between the force and the displacement — not the incline’s angle.',
      explain: t`The student used the ramp’s angle. The normal force is perpendicular to the surface and the block moves along it, so the angle between them is 90° and $W_N = 0$. Only gravity does work here: $W_g = mg\,d\sin\theta$.`,
      visual: { type: 'diagram', params: { kind: 'incline', angle: 30, forces: [{ dir: 'normal', label: 'N', size: 0.75 }, { dir: 'down', label: 'mg', size: 0.85 }, { dir: 'down-slope', label: 'Δr', size: 0.8, color: 'good' }] }, caption: 'Forces on the block and its displacement down the slope (green). Not to scale.' },
    }),
    multi({
      id: 'parachute', difficulty: 2,
      prompt: 'A skydiver descends at constant speed under an open parachute. Which forces on the skydiver do **negative** work during the descent? Select all that apply.',
      choices: ['The pull of the parachute lines on her harness', 'Gravity', 'Air drag on her body', 'None of them: her speed is constant, so no force does work'],
      answer: [0, 2],
      why: {
        1: 'Gravity points down, along the motion: its work is positive.',
        3: 'Constant speed means the *net* work is zero. The individual forces still do work — positive and negative amounts that cancel.',
      },
      hints: ['For each force, compare its direction with the displacement (down).', 'Forces pointing up while she moves down do negative work.'],
      teach: 'Each force does its own work; constant speed only says the works add up to zero.',
      explain: 'The motion is downward. Gravity (down) does positive work; the line tension and the air drag (both up) do negative work, and together they cancel gravity’s work exactly.',
      visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'skydiver', chute: true, v: [0, -1], forces: [{ label: 'mg', mag: 700, dir: 270, kind: 'weight' }, { label: 'T (lines)', mag: 640, dir: 90, kind: 'tension' }, { label: 'D (drag)', mag: 60, dir: 90, kind: 'drag' }] }, caption: 'The skydiver under her canopy, and her own free-body diagram; she moves down at constant speed. Forces to scale; values illustrative.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tow', difficulty: 2,
      gen(r) {
        const F = r.pick([600, 750, 900, 1200]), th = r.pick([10, 15, 20, 25]), d = r.pick([40, 50, 60, 80]);
        const W = F * d * cosd(th);
        return {
          prompt: t`A ground crew tows a glider ${d} m along a runway. The tow rope pulls with a constant ${F} N at ${th}° above the horizontal. How much work does the rope do on the glider?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: F * d, feedback: t`Only the component along the motion, $F\cos\theta$, does work.` }, { value: F * d * sind(th), feedback: t`The component along the motion is $F\cos\theta$, not $F\sin\theta$.` }],
          hints: [t`$W = F\,\Delta r\cos\theta$.`],
          teach: 'Work by a constant force is F Δr cos θ.',
          explain: t`$W = (${F})(${d})\cos ${th}° = ${s3(W)}$ J.`,
          visual: blockPic({ forces: [{ deg: th, label: `${F} N` }], d: `${d} m`, angle: `${th}°`, caption: 'The glider (drawn as a block), the rope’s pull and the displacement. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-orbit', difficulty: 2, transfer: true,
      prompt: 'A satellite moves at constant speed on a circular orbit. How much work does Earth’s gravity do on it during one quarter of an orbit?',
      choices: ['Zero', 'A positive amount: gravity pulls on it the whole way', 'A negative amount: gravity holds it back', 'Its weight times a quarter of the circumference'],
      answer: 0,
      why: {
        1: 'A large force acting for a long way is not enough: the force must have a component along the motion. Here it is always perpendicular.',
        2: 'Gravity points to Earth’s centre, at 90° to the velocity at every instant — it neither speeds the satellite up nor slows it down.',
        3: 'That is force times distance with the angle left out. Along a circle, the angle between gravity and each bit of displacement is 90°.',
      },
      hints: ['At each instant, what is the angle between the gravitational force and the satellite’s displacement?'],
      teach: 'Gravity on a circular orbit is always perpendicular to the motion, so it does no work and the speed stays constant.',
      explain: 'On a circular orbit gravity points straight at Earth’s centre, while each small displacement is along the circle — at 90°. Every piece of the path contributes zero work, so the total is zero, and the satellite’s speed stays constant. (On an elliptical orbit the angle is not 90°, and the speed changes.)',
      visual: orbitPic,
    }),
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([300, 450, 600]), T = r.pick([8, 9, 12, 15]) * 1000, h = r.pick([1.0, 1.5, 2.0]) * 1000;
        const W = (T - m * G) * h;
        return {
          prompt: t`A ${m} kg sounding rocket climbs straight up through ${fmt(h / 1000, 2)} km while its motor gives a steady ${T / 1000} kN of thrust. Ignoring air resistance and treating the mass as constant, how much **net** work is done on the rocket over the climb?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: T * h, feedback: 'That is the thrust’s work alone. Gravity does negative work at the same time.' },
            { value: (T + m * G) * h, feedback: 'Gravity points down while the rocket climbs: its work is negative, so it subtracts.' },
          ],
          hints: ['Two forces act: thrust up and gravity down. Find the work of each over the climb.', t`$W_\text{net} = T h - mgh = (T - mg)\,h$.`],
          teach: 'The net work on a climbing rocket is the thrust’s work minus the work against gravity.',
          explain: t`$W_\text{thrust} = (${thou(T)}\ \text{N})(${thou(h)}\ \text{m}) = ${sci(T * h)}$ J; $W_g = -mgh = -${sci(m * G * h)}$ J. Net: $${sci(W)}$ J. (A real sounding rocket burns a large share of its mass and fights drag, so this is only a first estimate.)`,
          visual: { type: 'mech-fbd', params: { scene: 'body', icon: 'rocket', flame: true, v: [0, 1], forces: [{ label: 'thrust', mag: T, dir: 90, kind: 'thrust' }, { label: 'mg', mag: Math.round(m * G), dir: 270, kind: 'weight' }] }, caption: 'The climbing rocket’s free-body diagram, forces to scale. Air resistance ignored.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §7.1 Work', url: 'https://openstax.org/books/university-physics-volume-1/pages/7-1-work' },
  ],
});

