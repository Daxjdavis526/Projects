// Rolling without slipping: v = Rω, the kinetic energy shared between moving
// and spinning, and the ramp race that only the shape factor β = I/MR² decides.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { G, SHAPES, rampPicture, wheelPicture, shapeAt } from './_spin.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const KINDS = ['hoop', 'disk', 'sphere', 'shell'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// the four contestants side by side, each with its moment of inertia
const contestants = (caption, order = KINDS) => {
  const curves = [], shade = [], points = [];
  order.forEach((k, i) => {
    const p = shapeAt(k, 2.3 * i, 0, 0.75);
    curves.push(...p.curves); shade.push(...p.shade);
    points.push({ x: 2.3 * i, y: 1.05, r: 0.01, color: SHAPES[k].color, label: SHAPES[k].name, labelDx: -4 * SHAPES[k].name.length, labelDy: 0 });
    points.push({ x: 2.3 * i, y: -1.15, r: 0.01, color: 'ink2', label: `I = ${{ hoop: 'MR²', disk: '½MR²', sphere: '⅖MR²', shell: '⅔MR²' }[k]}`, labelDx: -26, labelDy: 0 });
  });
  return {
    type: 'graph',
    params: { x: [-1.2, 8.1], y: [-1.6, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', alt: 'Four round objects with their moments of inertia', curves, shade, points },
    caption,
  };
};

// one shape rolling to the right: its centre's velocity, and its clockwise spin
const rolling = (kind, caption) => {
  const p = shapeAt(kind, 0, 1, 1);
  const t0 = 0.45, tip = [1.3 * Math.cos(t0), 1 + 1.3 * Math.sin(t0)], cw = [Math.sin(t0), -Math.cos(t0)];
  const tail = [tip[0] - 0.16 * cw[0], tip[1] - 0.16 * cw[1]].map((v) => +v.toFixed(4));
  return {
    type: 'graph',
    params: {
      x: [-2.2, 2.8], y: [-0.4, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', alt: 'A round object rolling to the right',
      curves: [{ fn: '0', color: 'ink3', width: 2 }, ...p.curves, { param: ['1.3cos(t)', '1 + 1.3sin(t)'], t: [t0, 1.35], color: 'warn', width: 1.8 }],
      shade: p.shade,
      arrows: [{ from: [0, 1], to: [1.6, 1], color: 'gold', label: 'v' }, { from: tail, to: tip.map((v) => +v.toFixed(4)), color: 'warn', label: 'ω', labelDx: 8, labelDy: 4 }],
      points: p.points,
    },
    caption,
  };
};

// two identical ramps, one above the other, each with a cylinder resting at the top
const twoRamps = (() => {
  const W = 6.5, H = 2.6, th = Math.atan2(H, W), rad = 0.42, curves = [], shade = [], points = [];
  [[3.4, 'aluminium cylinder'], [0, 'lead cylinder, 4.2 × the mass']].forEach(([y0, name]) => {
    curves.push({ param: [`${W}t`, `${y0 + H} - ${H}t`], t: [0, 1], color: 'ink', width: 2.4 }, { param: [`${W}t`, `${y0}`], t: [0, 1], color: 'ink3', width: 1.4 });
    const cx0 = 0.55, cy0 = y0 + H - (H / W) * cx0;                      // the contact point on the slope
    const cx = cx0 + rad * Math.sin(th), cy = cy0 + rad * Math.cos(th);
    const p = shapeAt('disk', cx, cy, rad), lead = y0 === 0;
    curves.push(...p.curves.map((c) => (lead ? { ...c, color: 'ink2' } : c))); shade.push(...p.shade.map((sh) => (lead ? { ...sh, color: 'ink2', alpha: 0.7 } : sh)));
    points.push({ x: +(cx + 0.6).toFixed(3), y: +(cy + 0.25).toFixed(3), r: 0.01, color: 'ink2', label: name });
  });
  return {
    type: 'graph',
    params: { x: [-0.6, 7.4], y: [-0.4, 6.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', alt: 'Two identical ramps with a cylinder at the top of each', curves, shade, points },
    caption: 'Two identical ramps (side by side in reality); the cylinders have the same radius and length. Not to scale.',
  };
})();

const EX = { h: 1.5 };
EX.vRoll = Math.sqrt((2 * G * EX.h) / (1 + 0.4));
EX.vSlide = Math.sqrt(2 * G * EX.h);

export default lesson({
  id: 'phys2210.M11.1',
  title: 'Rolling motion',
  minutes: 10, difficulty: 2,
  intro: t`A wheel that **rolls without slipping** turns once for every circumference it moves forward, so the speed of its centre and its spin are locked together. Its kinetic energy then has two parts — the centre moving, and the body spinning about the centre — and writing the moment of inertia as $I_\text{cm} = \beta MR^2$ packs the object's shape into one number $\beta$:

$$v_\text{cm} = R\omega, \qquad K = \tfrac12 Mv_\text{cm}^2 + \tfrac12 I_\text{cm}\,\omega^2 = \tfrac12(1 + \beta)\,Mv_\text{cm}^2$$

Mass and size cancel out of every rolling race: **only the shape factor $\beta$** — how far from the axis the mass sits — decides who wins.`,
  symbols: [
    { tex: 'v_\\text{cm}', text: 'the speed of the centre of mass (the axle), in m/s' },
    { tex: 'R', text: 'the radius of the rolling object, in m' },
    { tex: '\\omega', text: 'the angular speed of the spin, in rad/s' },
    { tex: 'K', text: 'the total kinetic energy, in joules (J): moving plus spinning' },
    { tex: 'M', text: 'the mass, in kg' },
    { tex: 'I_\\text{cm}', text: 'the moment of inertia about an axis through the centre, in kg·m²' },
    { tex: '\\beta = \\dfrac{I_\\text{cm}}{MR^2}', text: 'the shape factor, a pure number: 1 for a thin hoop, ½ for a solid disk or cylinder, ⅖ for a solid sphere, ⅔ for a thin hollow sphere' },
  ],
  why: 'Rolling ties translation and rotation together through one constraint; the same bookkeeping sizes the wheels of a planetary rover and explains why a solid ball beats a hoop down any slope.',
  visual: {
    type: 'graph',
    title: 'What every point of a rolling wheel is doing',
    lead: t`A wheel of radius $R$ rolls to the right at centre speed $v$. Turn it with the slider. Gold arrows are velocities; the dashed gold curve is the path of one point on the rim, and the teal strip is the road the wheel has covered.`,
    tasks: [
      'Turn the wheel: the gold point traces a cycloid, and its speed over the road drops to zero every time it touches down.',
      'Switch to “relative to the centre”: every rim point circles at the same speed v = Rω. Add the centre’s v back and the top moves at 2v while the bottom stops.',
      'Compare the teal strip with the turn: the road covered always equals the length of rim rolled out, Rθ — which is v = Rω.',
    ],
    params: {
      x: [-1.7, 9.3], y: [-0.7, 3.4], equal: true, xlabel: '', ylabel: '', axes: false, grid: false, aspect: 'wide',
      alt: 'A wheel rolling along a road, with velocity arrows at five points and the path traced by one rim point',
      sliders: [{ key: 'phi', label: 'Angle turned, $\\theta$', min: 0, max: 6.2, step: 0.02, value: 2.4, unit: '\\mathrm{rad}', explain: 'The centre has moved $R\\theta$ to the right.' }],
      choices: [{ key: 'f', label: 'Velocities measured', options: [[0, 'Over the road'], [1, 'Relative to the centre']], value: 0, explain: 'Rolling = moving with the centre + spinning about it.' }],
      curves: [
        { fn: '0', color: 'ink3', width: 2 },
        { param: ['t', '-0.13'], t: [0, 'phi'], color: 'teal', width: 4 },
        { param: ['t - sin(t)', '1 - cos(t)'], t: [0, 'phi'], color: 'gold', width: 1.6, dash: true },
        { param: ['phi + cos(t)', '1 + sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.6 },
        ...[0, 1.5708, 3.1416, 4.7124].map((a) => ({ param: [`phi + t*cos(${a} - phi)`, `1 + t*sin(${a} - phi)`], t: [0, 1], color: 'ink3', width: 1.2 })),
      ],
      arrows: [
        { from: ['phi', 2], to: ['phi + 1.1 - 0.55*f', 2], color: 'gold' },
        { from: ['phi', 1], to: ['phi + 0.55*(1 - f)', 1], color: 'ink2' },
        { from: ['phi + 1', 1], to: ['phi + 1 + 0.55*(1 - f)', 0.45], color: 'gold' },
        { from: ['phi - 1', 1], to: ['phi - 1 + 0.55*(1 - f)', 1.55], color: 'gold' },
        { from: ['phi', 0], to: ['phi - 0.55*f', 0], color: 'gold' },
      ],
      points: [
        { x: 'phi', y: 1, r: 3, color: 'ink2' },
        { x: 'phi - sin(phi)', y: '1 - cos(phi)', r: 5.5, color: 'gold' },
        { x: 'phi', y: 0, r: 4, color: 'bad' },
        { x: 'phi + 1.15 - 0.55*f', y: 2, r: 0.01, color: 'gold', label: '2v', when: '1 - f' },
        { x: 'phi + 0.6', y: 2, r: 0.01, color: 'gold', label: 'v', when: 'f' },
        { x: 'phi + 0.6', y: 1, r: 0.01, color: 'ink2', label: 'v', when: '1 - f' },
        { x: 'phi', y: 0, r: 0.01, color: 'bad', label: 'at rest', labelDy: 14, labelDx: 8, when: '1 - f' },
        { x: 'phi - 0.6', y: 0, r: 0.01, color: 'gold', label: 'v', labelDy: 14, labelDx: -4, when: 'f' },
        { x: 0.1, y: -0.13, r: 0.01, color: 'teal', label: 'road covered = Rθ', labelDy: 16 },
      ],
      readouts: [
        { label: 'centre moved, $R\\theta$', expr: 'phi', unit: 'R', digits: 3 },
        { label: 'gold point’s speed over the road', expr: '2*abs(sin(phi/2))', unit: 'v', digits: 3 },
      ],
    },
    caption: 'A wheel of radius R, seen from the side, rolling to the right without slipping. Arrows to scale (0.55 R per unit of v); the dashed curve is a cycloid.',
  },
  example: {
    prompt: t`A solid ball rolls without slipping down a ramp, starting from rest ${EX.h} m above the bottom. How fast is its centre moving at the bottom? Compare a block sliding down a frictionless ramp of the same height. ($g = 9.8\ \text{m/s}^2$)`,
    visual: rampPicture({ angle: 22, shapes: [{ kind: 'sphere', s: 0.1, label: 'ball' }, { kind: 'block', s: 0.3, label: 'block' }], height: `h = ${EX.h} m`, caption: 'Both start from rest at the same height. A sketch, not to scale.' }),
    steps: [
      { label: 'Energy, with a spin term', text: t`Gravity's energy $Mgh$ ends up as kinetic energy of **both** kinds: $Mgh = \tfrac12 Mv^2 + \tfrac12 I\omega^2$.` },
      { label: 'Lock the spin to the speed', text: t`Rolling without slipping: $\omega = v/R$. A solid sphere has $I = \tfrac25 MR^2$, so $\tfrac12 I\omega^2 = \tfrac12\cdot\tfrac25 MR^2\cdot\dfrac{v^2}{R^2} = \tfrac15 Mv^2$.` },
      { label: 'Solve', text: t`$Mgh = \tfrac12 Mv^2 + \tfrac15 Mv^2 = \tfrac{7}{10}Mv^2$, so $v = \sqrt{\tfrac{10}{7}gh} = \sqrt{\tfrac{10}{7}(9.8)(${EX.h})} = ${s3(EX.vRoll)}$ m/s.` },
      { label: 'The sliding block', text: t`With no spin, $Mgh = \tfrac12 Mv^2$ gives $v = \sqrt{2gh} = ${s3(EX.vSlide)}$ m/s. The ball is slower because $\tfrac{2}{7}$ of its energy went into spinning.` },
      { label: 'Sense check', text: t`$M$ and $R$ cancelled: a marble and a bowling ball arrive together. And no energy was lost — the friction that spins the ball acts at a contact point that is momentarily at rest, so it does no work.` },
    ],
    answer: t`Ball: $${s3(EX.vRoll)}$ m/s. Block: $${s3(EX.vSlide)}$ m/s.`,
  },
  practice: [
    mcq({
      id: 'contact-point', difficulty: 1,
      prompt: 'A car drives at a steady 20 m/s on tyres that roll without slipping. At this instant, how fast is the patch of tyre touching the road moving over the road?',
      choices: ['0 m/s: it is momentarily at rest', '20 m/s, like the car', '40 m/s, twice the car’s speed', '10 m/s, half the car’s speed'],
      answer: 0,
      why: {
        1: 'That is the speed of the axle. The contact patch is momentarily at rest on the road — that is what “no slipping” means.',
        2: '40 m/s is the speed of the top of the tyre, where the spin adds to the car’s speed. At the bottom it subtracts.',
        3: 'Relative to the axle every bit of tread moves at Rω = 20 m/s; at the bottom that is backward, so 20 − 20 = 0, not half.',
      },
      hints: ['Relative to the axle, every point of the tread moves at Rω = v. Which way is the bottom point moving relative to the axle?', 'At the bottom, the spin velocity points backward. Add the car’s forward 20 m/s.'],
      teach: 'In rolling without slipping the contact point is instantaneously at rest: the spin velocity Rω cancels the forward velocity v there.',
      explain: t`Relative to the axle, the bottom of the tyre moves backward at $R\omega = 20$ m/s; the axle moves forward at 20 m/s. Together: $0$. (The top moves at $20 + 20 = 40$ m/s.)`,
      visual: wheelPicture({ arrows: 'centre', mark: [{ x: 0, y: 0, r: 0.01, color: 'bad', label: 'contact patch: ?', labelDy: 14, labelDx: 8 }], caption: 'The car’s tyre, rolling to the right; the arrow is the axle’s velocity.' }),
    }),
    num({
      id: 'omega', difficulty: 1,
      gen(r) {
        const R = r.pick([0.3, 0.31, 0.33, 0.34, 0.36]), v = r.pick([5, 6, 7.5, 8, 9]);
        const w = v / R;
        return {
          prompt: t`A bicycle moves at ${v} m/s on wheels of radius ${R} m that roll without slipping. What is a wheel's angular speed?`,
          answer: w, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: v * R, feedback: t`Multiplying gives units of m²/s. From $v = R\omega$, divide: $\omega = v/R$.` }, { value: w / (2 * Math.PI), feedback: 'That is in revolutions per second. One revolution is 2π radians.' }],
          hints: [t`Rolling without slipping: $v = R\omega$.`],
          teach: 'For rolling without slipping the spin and the speed are locked: ω = v/R.',
          explain: t`$\omega = v/R = ${v}/${R} = ${s3(w)}$ rad/s — about ${Math.round((w * 60) / (2 * Math.PI))} revolutions per minute.`,
          visual: wheelPicture({ arrows: 'centre', caption: t`The wheel, radius ${R} m, with the bike’s velocity at the axle (${v} m/s).` }),
        };
      },
    }),
    num({
      id: 'spin-share', difficulty: 2,
      gen(r) {
        const k = r.pick(KINDS), S = SHAPES[k], b = S.beta, share = (100 * b) / (1 + b);
        return {
          prompt: t`${cap(S.long)}, with $I = ${S.I}$, rolls without slipping. What percentage of its kinetic energy is in its spin?`,
          answer: share, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: 100 * b, feedback: t`That compares the spin energy with the translational energy only. Divide by the **total**, $\tfrac12(1 + \beta)Mv^2$.` },
            ...(Math.abs(b - 1) > 1e-9 ? [{ value: 100 / (1 + b), feedback: t`That is the share in moving, $1/(1 + \beta)$. The spin's share is $\beta/(1 + \beta)$.` }] : []),
          ],
          hints: [t`With $\omega = v/R$, the spin energy is $\tfrac12 I\omega^2 = \tfrac12\beta Mv^2$.`, t`Spin share $= \dfrac{\tfrac12\beta Mv^2}{\tfrac12(1+\beta)Mv^2} = \dfrac{\beta}{1+\beta}$ with $\beta = ${S.betaTeX}$.`],
          teach: 'A rolling object’s kinetic energy splits in the ratio 1 : β between moving and spinning.',
          explain: t`$\beta = ${S.betaTeX}$, so the spin holds $\beta/(1 + \beta) = ${s3(share)}\%$ of the kinetic energy, whatever the speed, mass or size.`,
          visual: rolling(k, t`${cap(S.name)}: its centre moves at $v$ while it spins at $\omega = v/R$.`),
        };
      },
    }),
    num({
      id: 'ramp-speed', difficulty: 2,
      gen(r) {
        const k = r.pick(KINDS), S = SHAPES[k], h = r.pick([0.8, 1.2, 1.6, 2.0, 2.5]);
        const v = Math.sqrt((2 * G * h) / (1 + S.beta));
        return {
          prompt: t`${cap(S.long)} ($I = ${S.I}$) starts from rest and rolls without slipping down a ramp ${h} m high. How fast is its centre moving at the bottom? ($g = 9.8\ \text{m/s}^2$)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(2 * G * h), feedback: t`That is $\sqrt{2gh}$, a frictionless slide: you left out the spin energy. With rolling, $Mgh = \tfrac12(1 + \beta)Mv^2$.` }, { value: Math.sqrt((G * h) / (1 + S.beta)), feedback: t`Check the factor of 2: $v^2 = 2gh/(1 + \beta)$.` }],
          hints: [t`$Mgh = \tfrac12 Mv^2 + \tfrac12 I\omega^2$ with $\omega = v/R$.`, t`That is $Mgh = \tfrac12(1 + \beta)Mv^2$ with $\beta = ${S.betaTeX}$, so $v = \sqrt{2gh/(1 + \beta)}$.`],
          teach: 'For rolling from rest down a height h, v = √(2gh/(1 + β)): mass and radius cancel.',
          explain: t`$v = \sqrt{\dfrac{2(9.8)(${h})}{1 + ${nice(S.beta, 3)}}} = ${s3(v)}$ m/s, against $${s3(Math.sqrt(2 * G * h))}$ m/s for a frictionless slide.`,
          visual: rampPicture({ angle: 24, shapes: [{ kind: k, s: 0.1, label: S.name }], height: `h = ${h} m`, caption: 'Starting from rest at the top; a sketch, not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'race', difficulty: 2,
      prompt: 'A hoop, a solid disk, a solid sphere and a thin hollow sphere are released together from rest at the top of the same ramp and roll without slipping. Which reaches the bottom first?',
      choices: ['The solid sphere', 'The hoop', 'The thin hollow sphere', 'All four tie: gravity gives everything the same acceleration'],
      answer: 0,
      why: {
        1: 'The hoop comes last: all its mass is at the rim (β = 1), so half its energy goes into spin.',
        2: 'A hollow sphere keeps its mass far from the axis (β = ⅔); both solid shapes beat it.',
        3: 'That holds for free fall or frictionless sliding. Rolling objects must also spin up, and the share of energy the spin takes depends on the shape.',
      },
      hints: ['The winner keeps the largest share of its energy for moving forward.', t`The acceleration is $g\sin\theta/(1 + \beta)$: the smallest $\beta$ wins.`],
      teach: 'Down the same ramp, the object with the smallest shape factor β = I/MR² rolls fastest.',
      explain: t`Ranked by $\beta$: solid sphere $\tfrac25$, solid disk $\tfrac12$, hollow sphere $\tfrac23$, hoop $1$. That is the finishing order — whatever their masses and sizes.`,
      visual: contestants('The four contestants, with their moments of inertia about their own centres. Sizes and masses may differ.'),
    }),
    mcq({
      id: 'heavy-light', difficulty: 2,
      prompt: 'Two solid cylinders of the same size, one aluminium and one lead (4.2 times the mass), are released together from rest at the tops of two identical ramps and roll without slipping. Which reaches the bottom first?',
      choices: ['They arrive together', 'The lead cylinder: more weight pulls it down harder', 'The aluminium cylinder: less mass is easier to spin up', 'It depends on the angle of the ramps'],
      answer: 0,
      why: {
        1: 'The lead cylinder does feel a larger pull, but it also has proportionally more inertia — in Mgh = ½(1 + β)Mv² the mass cancels.',
        2: 'Less mass is easier to spin, but it is also pulled down less hard, by exactly the same factor.',
        3: t`At any angle, $a = g\sin\theta/(1 + \beta)$ — the same for both, since both have $\beta = \tfrac12$.`,
      },
      hints: [t`Write the energy equation and see whether $M$ survives: $Mgh = \tfrac12(1 + \beta)Mv^2$.`],
      teach: 'Mass cancels from rolling, just as it does from free fall: only the shape factor β matters.',
      explain: t`Both are solid cylinders, $\beta = \tfrac12$, so both reach $v = \sqrt{4gh/3}$ at every height: they stay side by side all the way down.`,
      visual: twoRamps,
    }),
    num({
      id: 'acceleration', difficulty: 3,
      gen(r) {
        const k = r.pick(KINDS), S = SHAPES[k], th = r.pick([10, 15, 20, 25, 30]);
        const sn = Math.sin((th * Math.PI) / 180), a = (G * sn) / (1 + S.beta);
        return {
          prompt: t`${cap(S.long)} ($I = ${S.I}$) rolls without slipping down a slope at ${th}° to the horizontal. What is the acceleration of its centre?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: G * sn, feedback: t`That is $g\sin\theta$, a frictionless slide. Rolling divides it by $1 + \beta$.` }, ...(S.beta < 1 ? [{ value: G * sn * (1 - S.beta), feedback: t`Close, but the factor is $1/(1 + \beta)$, not $1 - \beta$.` }] : [])],
          hints: [
            t`Energy after rolling a distance $d$ down the slope: $Mg\,d\sin\theta = \tfrac12(1 + \beta)Mv^2$.`,
            t`So $v^2 = \dfrac{2g\sin\theta}{1 + \beta}\,d$. Compare with constant acceleration from rest, $v^2 = 2a\,d$.`,
            t`$a = \dfrac{g\sin\theta}{1 + \beta}$ with $\beta = ${S.betaTeX}$.`,
          ],
          teach: 'A rolling object accelerates down a slope at a = g sin θ/(1 + β), slower than a frictionless slide.',
          explain: t`$a = \dfrac{(9.8)\sin ${th}^\circ}{1 + ${nice(S.beta, 3)}} = ${s3(a)}\ \text{m/s}^2$. Friction up the slope supplies the torque that spins it up: $f = \beta Ma$.`,
          solution: t`Forces along the slope: $Mg\sin\theta - f = Ma$. Torque about the centre: $fR = I\alpha = \beta MR^2 (a/R)$, so $f = \beta Ma$. Adding: $Mg\sin\theta = (1 + \beta)Ma$.`,
          visual: rampPicture({ angle: th, shapes: [{ kind: k, s: 0.35, forces: true }], angleLabel: `${th}°`, caption: 'The forces on the rolling object: weight, the normal force and static friction up the slope. Lengths schematic.' }),
        };
      },
    }),
    mcq({
      id: 'friction-work', difficulty: 3, kind: 'error',
      prompt: '“A ball rolling without slipping down a rough ramp loses mechanical energy to friction. That is why it reaches the bottom more slowly than a block sliding down a frictionless ramp.” What is wrong with this reasoning?',
      choices: [
        'Static friction acts at a contact point that is momentarily at rest, so it does no work; the ball is slower because part of its energy goes into spin',
        'Nothing: friction always turns mechanical energy into heat',
        'The ball is not slower: a rolling ball and a sliding block arrive at the same speed',
        'Friction points down the slope, so it speeds the ball up rather than slowing it',
      ],
      answer: 0,
      why: {
        1: 'Kinetic friction on a sliding object does dissipate energy. Static friction at a point that does not move does no work at all.',
        2: t`The ball **is** slower — $\sqrt{10gh/7}$ against $\sqrt{2gh}$ — just not because energy is lost.`,
        3: 'Friction points up the slope at the contact point: it slows the centre’s motion and spins the ball up.',
      },
      hints: ['Work is force times the distance its point of application moves.', 'How far does the contact point move while friction acts on it?'],
      teach: 'For rolling without slipping, static friction does no work: the energy is conserved, just shared with the spin.',
      explain: t`The contact point is at rest at each instant, so friction moves its point of application zero distance: no work, no energy lost. The ball is slower because $Mgh$ is shared between $\tfrac12Mv^2$ and $\tfrac12 I\omega^2$.`,
      visual: rampPicture({ angle: 22, shapes: [{ kind: 'sphere', s: 0.35, forces: true }], caption: 'The ball and the three forces on it. Lengths schematic.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-speed', difficulty: 2,
      gen(r) {
        const k = r.pick(['disk', 'hoop', 'sphere']), S = SHAPES[k], h = r.pick([0.6, 0.9, 1.4, 3.0]);
        const v = Math.sqrt((2 * G * h) / (1 + S.beta));
        const what = { disk: 'A solid cylinder', hoop: 'A thin-walled pipe', sphere: 'A solid ball' }[k];
        return {
          prompt: t`${what} ($I = ${S.I}$) rolls without slipping from rest down a ramp ${h} m high. How fast is its centre moving at the bottom? ($g = 9.8\ \text{m/s}^2$)`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          hints: [t`$Mgh = \tfrac12(1 + \beta)Mv^2$.`],
          teach: 'Rolling from rest down a height h: v = √(2gh/(1 + β)).',
          explain: t`$\beta = ${S.betaTeX}$: $v = \sqrt{2(9.8)(${h})/(1 + ${nice(S.beta, 3)})} = ${s3(v)}$ m/s.`,
          visual: rampPicture({ angle: 18, shapes: [{ kind: k, s: 0.1 }], height: `h = ${h} m`, caption: 'Starting from rest at the top; a sketch, not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'cp-slowest', difficulty: 2,
      prompt: 'Rolling without slipping from rest down the same ramp, which of these is slowest to reach the bottom?',
      choices: ['A thin metal ring', 'A basketball (a thin hollow sphere)', 'A bowling ball (a solid sphere)', 'A can of frozen soup (a solid cylinder)'],
      answer: 0,
      why: {
        1: 'The basketball (β = ⅔) is slow, but the ring (β = 1) is slower still.',
        2: 'The bowling ball, with the smallest β = ⅖, is the fastest of the four.',
        3: 'The frozen soup rolls as a solid cylinder, β = ½ — quicker than both hollow shapes.',
      },
      hints: ['The largest shape factor β = I/MR² is slowest.'],
      teach: 'The more of its mass an object carries far from its axis, the slower it rolls down a slope.',
      explain: t`The ring has $\beta = 1$: half its energy goes into spin, more than any of the others. Its acceleration is $\tfrac12 g\sin\theta$.`,
      visual: contestants('Hoop, disk, solid sphere, hollow sphere: the shapes of the four objects.'),
    }),
    num({
      id: 'cp-rover', difficulty: 2, transfer: true,
      prompt: t`NASA's Perseverance rover rolls on wheels 52.5 cm in diameter. On flat, hard ground its top speed is about 152 metres per hour. Assuming the wheels roll without slipping, what is their angular speed at top speed?`,
      answer: (152 / 3600) / 0.2625, units: 'rad/s', tol: { rel: 0.01 },
      errors: [
        { value: (152 / 3600) / 0.525, feedback: 'Use the radius, half the diameter: R = 0.2625 m.' },
        { value: 152 / 0.2625, feedback: 'Convert the speed to metres per second first: 152 m per 3600 s.' },
      ],
      hints: ['Convert the speed to m/s and the diameter to a radius in metres.', t`$\omega = v/R$ with $v = 152/3600$ m/s and $R = 0.2625$ m.`],
      teach: 'Rolling without slipping fixes the spin from the speed: ω = v/R.',
      explain: t`$v = 152/3600 = 0.0422$ m/s, so $\omega = 0.0422/0.2625 = 0.161$ rad/s — one turn every 39 s. On loose Martian sand the wheels do slip, which is one reason rovers drive so carefully.`,
      visual: wheelPicture({ arrows: 'centre', caption: 'One of the rover’s wheels, 52.5 cm across, rolling to the right; the arrow is the rover’s velocity.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §11.1 Rolling Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/11-1-rolling-motion' },
    { label: 'NASA, Mars 2020 Perseverance rover: wheels and speed', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/' },
  ],
});
