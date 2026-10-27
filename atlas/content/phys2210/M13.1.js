// Newton's law of universal gravitation: F = Gm₁m₂/r², equal and opposite on
// the two bodies, G measured by Cavendish, and Newton's own Moon test.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { G, M_EARTH, M_MOON, M_SUN, D_MOON, T_MOON, R_EARTH, GM_EARTH, g0, grp, twoBodies } from './_gravity.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toFixed(4);

const F0 = (G * M_EARTH * M_MOON) / D_MOON ** 2;              // the Earth–Moon pull, N

// the Moon test (worked example)
const MT = { ratio: D_MOON / R_EARTH };
MT.pred = g0 / MT.ratio ** 2;
MT.v = (2 * Math.PI * D_MOON) / T_MOON;
MT.actual = (4 * Math.PI ** 2 * D_MOON) / T_MOON ** 2;

// the inverse-square curve with two marked distances (scaling questions)
const inverseSquare = (k) => ({
  type: 'graph',
  params: {
    x: [0, 5.2], y: [0, 1.25], xlabel: 'distance (in units of the starting distance)', ylabel: 'force ÷ starting force', aspect: 'wide',
    curves: [{ fn: '1/x^2', domain: [0.9, 5.2], color: 'accent' }],
    points: [{ x: 1, y: 1, color: 'gold', label: 'start' }, { x: k, y: r4(1 / (k * k)), color: 'gold', label: `${k}×` }],
  },
  caption: 'Gravity’s inverse-square fall-off for fixed masses: the force at each distance compared with the force at the start.',
});

const PLANETS = [['Earth', 5.972e24, 1.496e11], ['Mars', 6.417e23, 2.279e11], ['Venus', 4.867e24, 1.082e11], ['Jupiter', 1.898e27, 7.785e11]];

export default lesson({
  id: 'phys2210.M13.1',
  title: 'Newton’s law of gravitation',
  minutes: 10, difficulty: 2,
  intro: t`Every two masses attract each other. Newton's law gives the size of the pull on **each** of them: proportional to both masses and inversely proportional to the square of the distance between their centres,

$$F = \frac{G\,m_1 m_2}{r^2}$$

directed along the line joining them. The two pulls are equal and opposite — the Earth pulls the Moon exactly as hard as the Moon pulls the Earth. $G$ is tiny: two people a metre apart attract each other with less than a millionth of a newton, so gravity matters only when at least one of the masses is enormous.`,
  symbols: [
    { tex: 'F', text: 'the size of the attractive force on each body, in newtons (N), pointing toward the other body' },
    { tex: 'G', text: 'the gravitational constant, $6.674\\times10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$ — first measured by Henry Cavendish in 1798; the same everywhere and for every material' },
    { tex: 'm_1,\\ m_2', text: 'the two masses, in kg' },
    { tex: 'r', text: 'the distance between their centres, in m. For round bodies the law holds outside them, as if each mass sat at its centre (the shell theorem, next lesson)' },
  ],
  why: 'One short law explains falling apples, the Moon’s orbit, the tides and the paths of planets and spacecraft — and where it begins to fail is where Einstein’s theory begins.',
  visual: {
    type: 'graph',
    title: 'Equal pulls, unequal pushes into motion',
    lead: t`Two bodies like the Earth (A) and the Moon (B). The red arrows are the gravitational forces on each, drawn to scale. Change the masses and the distance, then switch to accelerations.`,
    tasks: [
      'Double A’s mass: both arrows double. The forces on A and on B are always equal and opposite.',
      'Double the distance: both forces drop to a quarter — the inverse-square law.',
      'Switch to accelerations: B’s arrow is 81 times longer than A’s. The same force moves the small mass far more.',
    ],
    params: {
      x: [-5.5, 5.5], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      alt: 'Two bodies with arrows showing the gravitational force on each',
      sliders: [
        { key: 'mA', label: 'Mass of A', min: 0.5, max: 2, step: 0.05, value: 1, unit: 'M_\\oplus', explain: 'In Earth masses, $5.972\\times10^{24}$ kg.' },
        { key: 'mB', label: 'Mass of B', min: 0.5, max: 2, step: 0.05, value: 1, unit: 'M_\\text{Moon}', explain: 'In Moon masses, $7.342\\times10^{22}$ kg.' },
        { key: 'd', label: 'Distance between centres', min: 1, max: 2.5, step: 0.05, value: 1, unit: 'D', explain: 'In units of the Earth–Moon distance, $D = 384\\,400$ km.' },
      ],
      choices: [{ key: 'v', label: 'Arrows show', options: [[0, 'Forces'], [1, 'Accelerations']], value: 0, explain: 'Acceleration = force ÷ mass.' }],
      shade: [
        { fn: 'sqrt(max(0, 0.3025*mA^(2/3) - (x + 1.4 + 1.3*d)^2))', lower: '-sqrt(max(0, 0.3025*mA^(2/3) - (x + 1.4 + 1.3*d)^2))', from: '-1.4 - 1.3*d - 0.55*mA^(1/3)', to: '-1.4 - 1.3*d + 0.55*mA^(1/3)', color: 'teal', alpha: 0.5 },
        { fn: 'sqrt(max(0, 0.0225*mB^(2/3) - (x - 1.4 - 1.3*d)^2))', lower: '-sqrt(max(0, 0.0225*mB^(2/3) - (x - 1.4 - 1.3*d)^2))', from: '1.4 + 1.3*d - 0.15*mB^(1/3)', to: '1.4 + 1.3*d + 0.15*mB^(1/3)', color: 'ink2', alpha: 0.7 },
      ],
      arrows: [
        { from: ['-1.4 - 1.3*d + 0.55*mA^(1/3)', 0], to: ['-1.4 - 1.3*d + 0.55*mA^(1/3) + (1 - v)*0.45*mA*mB/d^2 + v*0.6*(mB/d^2)/81.3', 0], color: 'bad', label: 'on A', labelDy: -14 },
        { from: ['1.4 + 1.3*d - 0.15*mB^(1/3)', 0], to: ['1.4 + 1.3*d - 0.15*mB^(1/3) - (1 - v)*0.45*mA*mB/d^2 - v*0.6*mA/d^2', 0], color: 'bad', label: 'on B', labelDy: -14, labelAlign: 'right', labelDx: -8 },
      ],
      points: [{ x: '-1.4 - 1.3*d', y: '-0.55*mA^(1/3) - 0.3', r: 0.01, color: 'teal', label: 'A', labelDx: -4 }, { x: '1.4 + 1.3*d', y: '-0.15*mB^(1/3) - 0.3', r: 0.01, color: 'ink2', label: 'B', labelDx: -4 }],
      readouts: [
        { label: 'force on each, $F$', expr: `${F0.toPrecision(5)}*mA*mB/d^2`, unit: '\\mathrm{N}', digits: 3 },
        { label: 'acceleration of A', expr: `${F0.toPrecision(5)}*mB/d^2/${M_EARTH}`, unit: '\\mathrm{m/s^2}', digits: 3 },
        { label: 'acceleration of B', expr: `${F0.toPrecision(5)}*mA/d^2/${M_MOON}`, unit: '\\mathrm{m/s^2}', digits: 3 },
      ],
    },
    caption: 'Forces drawn to one scale; accelerations to another. Body sizes grow with the cube root of the mass; the distance between them is drawn several times too short, so that both fit.',
  },
  example: {
    prompt: t`**Newton's Moon test.** Is the force that makes an apple fall the same one that holds the Moon in orbit? The Moon is $3.844\times10^{8}$ m from Earth's centre — ${s3(MT.ratio)} Earth radii — and goes round once every 27.32 days. If gravity weakens as $1/r^2$, what acceleration should the Moon have? Compare it with the acceleration its orbit actually requires. ($g = ${g0}\ \text{m/s}^2$ at the surface, $R = 6371$ km.)`,
    visual: {
      type: 'graph',
      params: {
        x: [-70, 70], y: [-62, 62], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
        shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'teal', alpha: 0.8 }],
        curves: [{ param: [`${r4(MT.ratio)}*cos(t)`, `${r4(MT.ratio)}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true }],
        arrows: [{ from: [r4(MT.ratio * Math.cos(0.7)), r4(MT.ratio * Math.sin(0.7))], to: [r4((MT.ratio - 12) * Math.cos(0.7)), r4((MT.ratio - 12) * Math.sin(0.7))], color: 'bad', label: 'a' }],
        points: [{ x: 0, y: 0, r: 0.01, color: 'teal', label: 'Earth', labelDx: 6, labelDy: 12 }, { x: r4(MT.ratio * Math.cos(0.7)), y: r4(MT.ratio * Math.sin(0.7)), color: 'ink2', r: 4, label: 'Moon' }],
      },
      caption: 'The Moon’s orbit drawn to scale in Earth radii (the Earth is the small teal dot). Its acceleration points at Earth’s centre; the arrow is not to scale.',
    },
    steps: [
      { label: 'The inverse-square prediction', text: t`At ${s3(MT.ratio)} times the distance, gravity should be $${s3(MT.ratio)}^2 = ${grp(Math.round(MT.ratio ** 2))}$ times weaker: $a = \dfrac{9.81}{${s3(MT.ratio)}^2} = ${tex(MT.pred)}\ \text{m/s}^2$.` },
      { label: 'What the orbit needs', text: t`A circular orbit needs a centripetal acceleration $a = \dfrac{4\pi^2 r}{T^2}$, with $T = 27.32 \times 86\,400 = ${grp(Math.round(T_MOON))}$ s: $a = \dfrac{4\pi^2 (3.844\times10^{8})}{(${tex(T_MOON, 4)})^2} = ${tex(MT.actual)}\ \text{m/s}^2$.` },
      { label: 'Compare', text: t`They agree to ${s3(Math.abs(MT.actual / MT.pred - 1) * 100)}%. One law covers the apple and the Moon. (Most of the small difference is because the Earth also moves: both orbit their common centre of mass.)` },
      { label: 'Sense check', text: t`In one second the Moon moves ${s3(MT.v / 1000)} km along its orbit and falls $\tfrac12 at^2 = ${s3(0.5 * MT.actual * 1000)}$ mm toward Earth — just enough to keep missing it.` },
    ],
    answer: t`Predicted $${tex(MT.pred)}$; required $${tex(MT.actual)}\ \text{m/s}^2$ — the same, to about 1%.`,
  },
  practice: [
    num({
      id: 'people', difficulty: 1,
      gen(r) {
        const m1 = r.pick([60, 70, 80]), m2 = r.pick([55, 65, 75]), d = r.pick([0.5, 1.5, 2]);
        const F = (G * m1 * m2) / (d * d);
        return {
          prompt: t`Two people of masses ${m1} kg and ${m2} kg stand with their centres ${d} m apart. Treating them as points, how hard do they attract each other? ($G = 6.674\times10^{-11}\ \text{N·m}^2/\text{kg}^2$)`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (G * m1 * m2) / d, feedback: 'Divide by the distance squared, r².' }],
          hints: [t`$F = Gm_1m_2/r^2$, all in SI units.`],
          teach: 'Between everyday objects, gravity is fantastically weak: G is about 10⁻¹⁰ in SI units.',
          explain: t`$F = \dfrac{(6.674\times10^{-11})(${m1})(${m2})}{${d}^2} = ${tex(F)}$ N — about the weight of a grain of dust. Earth's pull on each person is a billion times stronger.`,
          visual: twoBodies({ names: [`${m1} kg`, `${m2} kg`], radii: [0.35, 0.35], colors: ['accent', 'ink2'], caption: 'Each person pulls the other with the same tiny force. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'sun-planet', difficulty: 1,
      gen(r) {
        const [name, m, a] = r.pick(PLANETS);
        const F = (G * M_SUN * m) / (a * a);
        return {
          prompt: t`How hard does the Sun ($M = 1.989\times10^{30}$ kg) pull on ${name} ($m = ${tex(m, 4)}$ kg), ${tex(a, 4)} m away?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (G * M_SUN * m) / a, feedback: 'Square the distance.' }],
          hints: [t`$F = GMm/r^2$ with $G = 6.674\times10^{-11}$.`],
          teach: 'Newton’s law gives the force between any two bodies from their masses and separation.',
          explain: t`$F = \dfrac{(6.674\times10^{-11})(1.989\times10^{30})(${tex(m, 4)})}{(${tex(a, 4)})^2} = ${tex(F)}$ N. ${name} pulls back on the Sun with exactly the same force.`,
          visual: twoBodies({ names: ['Sun', name], radii: [0.6, 0.18], colors: ['gold', 'ink2'], caption: `The Sun and ${name}: equal and opposite pulls. Not to scale.` }),
        };
      },
    }),
    mcq({
      id: 'third-law', difficulty: 1,
      prompt: 'Which pulls harder: the Earth on the Moon, or the Moon on the Earth?',
      choices: ['Neither: the two forces are equal in size and opposite in direction', 'The Earth on the Moon, because the Earth is 81 times more massive', 'The Moon on the Earth, because the Moon is the one that moves', 'The Earth on the Moon, but only while the Moon is in orbit'],
      answer: 0,
      why: {
        1: t`The Earth's larger mass is in the formula, but so is the Moon's: $F = Gm_1m_2/r^2$ is the same number for both. The Earth's bigger mass shows up in its **smaller acceleration**.`,
        2: 'Both bodies move — they orbit their common centre of mass, about 4700 km from Earth’s centre. The forces on them are equal.',
        3: 'Newton’s third law holds always: the pair of forces is equal and opposite at every moment.',
      },
      hints: ['Write Newton’s law for the force on the Moon, then for the force on the Earth. What changes?'],
      teach: 'Gravitational forces come in equal and opposite pairs (Newton’s third law); the lighter body accelerates more.',
      explain: t`Both forces are $GM_\oplus m/r^2 \approx ${tex(F0)}$ N. The Moon's acceleration is 81 times the Earth's because its mass is 81 times smaller.`,
      visual: twoBodies({ names: ['Earth', 'Moon'], radii: [0.55, 0.15], caption: 'Earth and Moon (not to scale) and the gravitational force on each.' }),
    }),
    num({
      id: 'scaling', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]), f = r.pick([2, 3]), F = r.pick([120, 240, 360, 480]);
        const Fn = (F * f) / (k * k);
        return {
          prompt: t`Two asteroids attract each other with a force of ${F} N. One of them is replaced by an asteroid ${f} times as massive, and they drift until they are ${k} times as far apart. What is the force now?`,
          answer: Fn, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (F * f) / k, feedback: 'The distance enters squared: k times farther gives 1/k² of the force.' }, { value: F * f * k * k, feedback: 'Farther apart means weaker, not stronger: divide by the square of the distance factor.' }],
          hints: [t`$F \propto m_1m_2/r^2$: multiply by ${f} for the mass, divide by ${k}^2 for the distance.`],
          teach: 'Gravity grows in proportion to each mass and falls with the square of the distance.',
          explain: t`$F' = ${F}\times\dfrac{${f}}{${k}^2} = ${s3(Fn)}$ N.`,
          visual: inverseSquare(k),
        };
      },
    }),
    num({
      id: 'cavendish', difficulty: 2,
      prompt: t`In Cavendish's 1798 experiment, a small lead ball of 0.73 kg hung near a large lead ball of 158 kg, their centres 0.23 m apart. What force did the large ball exert on the small one? ($G = 6.674\times10^{-11}$ SI)`,
      answer: (G * 0.73 * 158) / 0.23 ** 2, units: 'N', tol: { rel: 0.01 },
      errors: [{ value: (G * 0.73 * 158) / 0.23, feedback: 'Square the distance between the centres.' }],
      hints: [t`$F = Gm_1m_2/r^2$ with $r = 0.23$ m.`],
      teach: 'Gravity between laboratory masses is about a ten-millionth of a newton — measurable only with a very delicate torsion balance.',
      explain: t`$F = \dfrac{(6.674\times10^{-11})(0.73)(158)}{0.23^2} = ${tex((G * 0.73 * 158) / 0.23 ** 2)}$ N — the weight of about 15 micrograms. Cavendish measured it from the slow twist of a fibre holding the small balls, and so found $G$; with $g$ and Earth's radius, that gave the first measurement of Earth's mass.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.6, 2.6], y: [-1.3, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          curves: [{ param: ['1.6t', '0'], t: [-1, 1], color: 'ink2', width: 2 }],
          shade: [
            { fn: 'sqrt(max(0, 0.0144 - (x - 1.6)^2))', lower: '-sqrt(max(0, 0.0144 - (x - 1.6)^2))', from: 1.48, to: 1.72, color: 'ink2', alpha: 0.8 },
            { fn: 'sqrt(max(0, 0.0144 - (x + 1.6)^2))', lower: '-sqrt(max(0, 0.0144 - (x + 1.6)^2))', from: -1.72, to: -1.48, color: 'ink2', alpha: 0.8 },
            { fn: '0.55 + sqrt(max(0, 0.16 - (x - 1.6)^2))', lower: '0.55 - sqrt(max(0, 0.16 - (x - 1.6)^2))', from: 1.2, to: 2.0, color: 'accent', alpha: 0.45 },
            { fn: '-0.55 + sqrt(max(0, 0.16 - (x + 1.6)^2))', lower: '-0.55 - sqrt(max(0, 0.16 - (x + 1.6)^2))', from: -2.0, to: -1.2, color: 'accent', alpha: 0.45 },
          ],
          arrows: [{ from: [1.6, 0.12], to: [1.6, 0.4], color: 'bad' }, { from: [-1.6, -0.12], to: [-1.6, -0.4], color: 'bad' }],
          points: [{ x: 0, y: 0, color: 'ink', r: 4, label: 'fibre', labelDy: 14 }, { x: 1.6, y: 0.55, r: 0.01, color: 'accent', label: '158 kg', labelDx: 26 }, { x: 1.6, y: 0, r: 0.01, color: 'ink2', label: '0.73 kg', labelDx: 14, labelDy: 14 }],
        },
        caption: 'Cavendish’s torsion balance seen from above: small balls on a rod hung from a fibre, large balls nearby. The tiny pulls (red) twist the fibre. Not to scale.',
      },
    }),
    mcq({
      id: 'fall-together', difficulty: 2,
      prompt: 'Earth pulls a 7 kg bowling ball with a far larger force than a 0.06 kg tennis ball. Dropped together in a vacuum, which hits the ground first?',
      choices: ['They land together: the force is larger in exact proportion to the mass, so the accelerations are equal', 'The bowling ball: the larger force wins', 'The tennis ball: it has less inertia to overcome', 'The bowling ball, but only by a tiny amount'],
      answer: 0,
      why: {
        1: t`The larger force is matched by a larger inertia: $a = F/m = GM/r^2$, the same for both.`,
        2: 'Less inertia, but also a proportionally smaller pull: the two effects cancel exactly.',
        3: 'No measurable difference exists: the equality of gravitational and inertial mass has been checked to about one part in 10¹⁵.',
      },
      hints: [t`Compute the acceleration: $a = F/m = \dfrac{GMm/r^2}{m}$.`],
      teach: 'Every body falls with the same acceleration g = GM/r², whatever its mass — the mass it is pulled by and the mass that resists cancel.',
      explain: t`$a = \dfrac{GM_\oplus m/r^2}{m} = \dfrac{GM_\oplus}{r^2}$: the ball's own mass cancels. The same cancellation means a heavy and a light satellite on the same path orbit identically. Why the two masses are equal was a mystery to Newton; it is the starting point of Einstein's theory.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2, 2], y: [-0.4, 3.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          curves: [{ fn: '0', color: 'ink3', width: 2 }],
          shade: [{ fn: '2.5 + sqrt(max(0, 0.09 - (x + 0.8)^2))', lower: '2.5 - sqrt(max(0, 0.09 - (x + 0.8)^2))', from: -1.1, to: -0.5, color: 'ink2', alpha: 0.85 }, { fn: '2.5 + sqrt(max(0, 0.01 - (x - 0.8)^2))', lower: '2.5 - sqrt(max(0, 0.01 - (x - 0.8)^2))', from: 0.7, to: 0.9, color: 'good', alpha: 0.9 }],
          arrows: [{ from: [-0.8, 2.15], to: [-0.8, 0.6], color: 'bad', label: 'mg (big)' }, { from: [0.8, 2.35], to: [0.8, 2.1], color: 'bad', label: 'mg (small)' }],
          points: [{ x: -0.8, y: 2.95, r: 0.01, color: 'ink2', label: 'bowling ball', labelDx: -40 }, { x: 0.8, y: 2.8, r: 0.01, color: 'good', label: 'tennis ball', labelDx: -32 }],
        },
        caption: 'The forces on the two balls (red) differ enormously. What about their accelerations?',
      },
    }),
    num({
      id: 'neutral-point', difficulty: 3,
      gen(r) {
        const [when, d] = r.pick([['at its average distance', 384400], ['at its closest (perigee)', 363300], ['at its farthest (apogee)', 405500]]);
        const x = d / (1 + Math.sqrt(M_MOON / M_EARTH));
        return {
          prompt: t`On the way to the Moon, Apollo spacecraft crossed a point where the Earth's and the Moon's pulls cancel. With the Moon ${when}, ${d.toLocaleString('en-US')} km from Earth's centre, how far from Earth's centre is that point? ($M_\oplus = 5.972\times10^{24}$ kg, $M_\text{Moon} = 7.342\times10^{22}$ kg)`,
          answer: x, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: d / 2, feedback: 'Halfway would need equal masses. The Moon is 81 times lighter, so the balance point is much nearer the Moon.' }, { value: (d * M_EARTH) / (M_EARTH + M_MOON), feedback: 'That balances the masses, not the pulls. Gravity falls as the square of the distance, so the mass ratio enters under a square root: x/(d − x) = √(M⊕/M_Moon).' }],
          hints: [
            t`At distance $x$ from Earth's centre, the pulls are equal when $\dfrac{GM_\oplus m}{x^2} = \dfrac{GM_\text{Moon}m}{(d - x)^2}$.`,
            t`Take square roots: $\dfrac{x}{d - x} = \sqrt{M_\oplus/M_\text{Moon}}$.`,
            t`So $x = \dfrac{d}{1 + \sqrt{M_\text{Moon}/M_\oplus}}$.`,
          ],
          teach: 'Gravity’s inverse-square law puts the balance point between two bodies where x/(d − x) = √(M₁/M₂) — close to the smaller body.',
          explain: t`$\sqrt{M_\text{Moon}/M_\oplus} = ${s3(Math.sqrt(M_MOON / M_EARTH))}$, so $x = ${grp(d)}/${s3(1 + Math.sqrt(M_MOON / M_EARTH))} = ${grp(Math.round(x))}$ km — about 90% of the way to the Moon. (The Sun's pull, and the craft's own motion, shift where the crossing really happens, but not by much.)`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.08, 1.08], y: [-0.18, 0.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              shade: [{ fn: 'sqrt(max(0, 0.0003 - x^2))', lower: '-sqrt(max(0, 0.0003 - x^2))', from: -0.0173, to: 0.0173, color: 'teal', alpha: 0.9 }],
              curves: [{ param: ['t', '0'], t: [0, 1], color: 'ink4', width: 1, dash: true }],
              points: [{ x: 0, y: 0, r: 0.01, color: 'teal', label: 'Earth', labelDy: 18, labelDx: -14 }, { x: 1, y: 0, color: 'ink2', r: 3, label: 'Moon', labelDy: 18, labelDx: -14 }, { x: 0.5, y: 0.06, r: 0.01, color: 'ink3', label: 'where do the pulls cancel?', labelDx: -80 }],
            },
            caption: 'The Earth and the Moon to scale, with the line between them.',
          },
        };
      },
    }),
    num({
      id: 'weigh-earth', difficulty: 2,
      prompt: t`Once Cavendish had measured $G$, the Earth could be "weighed". At the surface, $g = GM/R^2$ with $g = 9.82\ \text{m/s}^2$ (allowing for Earth's spin) and $R = 6.371\times10^{6}$ m. What is Earth's mass?`,
      answer: (9.82 * 6.371e6 ** 2) / G, units: 'kg', tol: { rel: 0.01 },
      errors: [{ value: (9.82 * 6.371e6) / G, feedback: 'Square the radius: M = gR²/G.' }],
      hints: [t`Rearrange $g = GM/R^2$: $M = gR^2/G$.`],
      teach: 'Measuring G turns the familiar g into the mass of the Earth: M = gR²/G.',
      explain: t`$M = \dfrac{(9.82)(6.371\times10^{6})^2}{6.674\times10^{-11}} = ${tex((9.82 * 6.371e6 ** 2) / G, 4)}$ kg. Dividing by Earth's volume gives an average density of 5.5 g/cm³ — twice that of surface rock, the first hint of a dense iron core.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.4, 2.4], y: [-1.25, 1.35], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'teal', alpha: 0.4 }],
          arrows: [{ from: [0, 0], to: [0.97, 0], color: 'ink2', label: 'R' }, { from: [0, 1.32], to: [0, 1.05], color: 'bad', label: 'g', labelDx: 8 }],
          points: [{ x: 0, y: 1.0, color: 'gold', r: 4 }],
        },
        caption: 'The Earth and a test mass on its surface. Not to scale.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-iss-weight', difficulty: 2, transfer: true,
      prompt: t`The International Space Station (mass $4.2\times10^{5}$ kg) orbits 420 km up, $6.791\times10^{6}$ m from Earth's centre. How large is Earth's gravitational pull on it there? ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$)`,
      answer: (GM_EARTH * 4.2e5) / 6.791e6 ** 2, units: 'N', tol: { rel: 0.01 },
      errors: [{ value: 0, feedback: 'There is plenty of gravity in orbit: the station is falling around the Earth, which is why its crew float.' }, { value: (GM_EARTH * 4.2e5) / 4.2e5 ** 2, feedback: 'Measure the distance from Earth’s centre, not from the ground.' }],
      hints: [t`$F = \dfrac{GM_\oplus m}{r^2}$ with $r$ from Earth's centre.`],
      teach: 'In low orbit, gravity is nearly as strong as on the ground; orbiting is falling, not escaping gravity.',
      explain: t`$F = \dfrac{(3.986\times10^{14})(4.2\times10^{5})}{(6.791\times10^{6})^2} = ${tex((GM_EARTH * 4.2e5) / 6.791e6 ** 2)}$ N — about 88% of the station's weight on the ground. The crew float because the station and everything in it fall together.`,
      visual: twoBodies({ names: ['Earth', 'ISS'], radii: [0.75, 0.07], gap: 2.0, caption: 'Earth and the station (not to scale): the pull on the station points at Earth’s centre.' }),
    }),
    mcq({
      id: 'cp-pull', difficulty: 2,
      prompt: 'A 70 kg astronaut stands on the Moon, where the Moon pulls her with 113 N. How hard does she pull on the Moon?',
      choices: ['113 N', 'Nothing measurable: a person cannot pull a moon', '113 N divided by the ratio of the masses', '686 N, her weight on Earth'],
      answer: 0,
      why: {
        1: 'Her pull on the Moon is real and equal to the Moon’s pull on her; it simply cannot accelerate something so massive noticeably.',
        2: 'The forces are equal; it is the accelerations that differ in the ratio of the masses.',
        3: 'Her weight on Earth is the Earth’s pull. On the Moon the pair of forces is between her and the Moon.',
      },
      hints: ['Gravitational forces come in equal and opposite pairs.'],
      teach: 'Whatever the masses, the two gravitational forces of a pair are equal and opposite.',
      explain: t`Newton's third law: she pulls the Moon with 113 N, toward herself. The Moon's acceleration from that is $113/(7.3\times10^{22}) \approx 2\times10^{-21}\ \text{m/s}^2$ — real, but immeasurable.`,
      visual: twoBodies({ names: ['Moon', 'astronaut'], radii: [0.8, 0.08], colors: ['ink2', 'ink2'], gap: 2.4, caption: 'The Moon and the astronaut (not to scale), each pulled toward the other.' }),
    }),
    num({
      id: 'cp-scaling', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5]), F = r.pick([800, 900, 1000]);
        return {
          prompt: t`A spacecraft feels a ${F} N pull from a planet when it is 1 planetary radius above the surface (2 radii from the centre). What pull does it feel at ${2 * k} radii from the centre?`,
          answer: F / (k * k), units: 'N', tol: { rel: 0.01 },
          hints: [t`The distance from the centre grows ${k}-fold.`],
          teach: 'Distances in Newton’s law are measured from the centre; the force scales as 1/r².',
          explain: t`From the centre, the distance grows from 2 to ${2 * k} radii, a factor of ${k}: $F = ${F}/${k}^2 = ${s3(F / (k * k))}$ N.`,
          visual: inverseSquare(k),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §13.1 Newton’s Law of Universal Gravitation', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation' },
    { label: 'CODATA 2018/2022: Newtonian constant of gravitation, G = 6.674 30(15) × 10⁻¹¹', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bg' },
    { label: 'Touboul et al. (2022), MICROSCOPE mission: final results on the equivalence principle', url: 'https://arxiv.org/abs/2209.15487' },
  ],
});
