// Centre of mass: the mass-weighted average position, which moves as if all
// the mass and all the external force were there.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { massDots, seg } from './_momentum.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const r4 = (x) => +x.toFixed(4);

// a filled rectangle [x0, x1] × [y0, y1] as a graph shade
const box = (x0, x1, y0, y1, color = 'accent', alpha = 0.35) => ({ fn: String(y1), lower: String(y0), from: x0, to: x1, color, alpha });
const outline = (x0, x1, y0, y1, color = 'accent') => [seg([x0, y0], [x1, y0], color, 1.6), seg([x1, y0], [x1, y1], color, 1.6), seg([x1, y1], [x0, y1], color, 1.6), seg([x0, y1], [x0, y0], color, 1.6)];

export default lesson({
  id: 'phys2210.M9.5',
  title: 'Centre of mass',
  minutes: 11, difficulty: 2,
  intro: t`The **centre of mass** of a system is its mass-weighted average position:

$$x_\text{cm} = \frac{\sum_i m_i x_i}{M} = \frac{1}{M}\int x\,dm, \qquad M = \sum_i m_i$$

and the same for $y$ and $z$. It is the point that moves **as if all the mass were concentrated there and every external force acted on it**: $M\vec a_\text{cm} = \vec F_\text{ext}$, and $M\vec v_\text{cm} = \vec P$. So when no external force acts, the centre of mass glides at constant velocity, whatever the parts do — through collisions, explosions and stage separations. And it **need not lie inside the body**: a ring’s is in its empty middle.`,
  symbols: [
    { tex: 'x_\\text{cm}', text: 'the $x$-coordinate of the centre of mass, in metres' },
    { tex: 'm_i,\\ x_i', text: 'the mass (kg) and position (m) of the $i$-th particle' },
    { tex: 'M', text: 'the total mass, kg' },
    { tex: 'dm = \\lambda\\,dx', text: 'for a continuous body, a sliver of mass: the linear density $\\lambda$ (kg/m) times a sliver of length $dx$' },
    { tex: '\\vec v_\\text{cm} = \\vec P/M', text: 'the velocity of the centre of mass: total momentum over total mass — constant when no external force acts' },
  ],
  why: 'Every orbit is really two bodies circling their common centre of mass — the wobble that reveals exoplanets — and every spacecraft must fire its engines through its centre of mass, or it will spin.',
  visual: {
    type: 'graph',
    title: 'A mass-weighted average',
    lead: t`Three point masses on a plane. **Drag** them around and change their masses; the gold dot is the centre of mass. Equal masses put it at the average position; a heavy mass pulls it close.`,
    tasks: [
      'Make one mass much heavier than the others: the centre of mass moves toward it.',
      'Drag the three masses into a straight line: the centre of mass lies on that line.',
      'Set all three masses equal: the centre of mass sits at the triangle’s centroid, the plain average of the three positions.',
    ],
    params: {
      x: [-4, 4], y: [-2.6, 2.6], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
      sliders: [
        { key: 'ma', label: 'Mass $m_A$', min: 0.5, max: 10, step: 0.5, value: 2, unit: '\\mathrm{kg}', explain: 'The blue mass.' },
        { key: 'mb', label: 'Mass $m_B$', min: 0.5, max: 10, step: 0.5, value: 4, unit: '\\mathrm{kg}', explain: 'The violet mass.' },
        { key: 'mc', label: 'Mass $m_C$', min: 0.5, max: 10, step: 0.5, value: 1, unit: '\\mathrm{kg}', explain: 'The green mass.' },
      ],
      drag: [{ key: 'a', x: -2.5, y: -1.2 }, { key: 'b', x: 2, y: -0.8 }, { key: 'c', x: 0, y: 1.8 }],
      curves: [
        { param: ['ax + t*(bx - ax)', 'ay + t*(by - ay)'], t: [0, 1], color: 'ink4', width: 1.2, dash: true },
        { param: ['bx + t*(cx - bx)', 'by + t*(cy - by)'], t: [0, 1], color: 'ink4', width: 1.2, dash: true },
        { param: ['cx + t*(ax - cx)', 'cy + t*(ay - cy)'], t: [0, 1], color: 'ink4', width: 1.2, dash: true },
      ],
      points: [
        { x: 'ax', y: 'ay', color: 'accent', r: 7, label: 'A' },
        { x: 'bx', y: 'by', color: 'violet', r: 7, label: 'B' },
        { x: 'cx', y: 'cy', color: 'good', r: 7, label: 'C' },
        { x: '(ma*ax + mb*bx + mc*cx)/(ma + mb + mc)', y: '(ma*ay + mb*by + mc*cy)/(ma + mb + mc)', color: 'gold', r: 6, label: 'CM' },
      ],
      readouts: [
        { label: '$x_\\text{cm}$', expr: '(ma*ax + mb*bx + mc*cx)/(ma + mb + mc)', unit: '\\mathrm{m}', digits: 3 },
        { label: '$y_\\text{cm}$', expr: '(ma*ay + mb*by + mc*cy)/(ma + mb + mc)', unit: '\\mathrm{m}', digits: 3 },
      ],
    },
    caption: 'Point masses joined by dashed guide lines (massless). The gold centre of mass is computed from the formula above.',
  },
  example: {
    prompt: t`The Moon (mass $7.342\times10^{22}$ kg) orbits $384{,}400$ km from Earth’s centre (Earth: $5.972\times10^{24}$ kg). Where is the centre of mass of the Earth–Moon system?`,
    visual: {
      type: 'graph',
      params: {
        aspect: 'wide', x: [-30, 410], y: [-60, 60], equal: true, xlabel: 'distance from Earth’s centre (thousands of km)', ylabel: '', yticks: 0.001,
        curves: [{ param: ['6.371*cos(t)', '6.371*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['384.4 + 1.737*cos(t)', '1.737*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2 }],
        points: [{ x: 0, y: 0, r: 2, color: 'accent', label: 'Earth', labelDy: -18 }, { x: 384.4, y: 0, r: 2, color: 'ink2', label: 'Moon', labelDy: -14 }, { x: 4.668, y: 0, r: 3, color: 'gold' }],
      },
      caption: 'Earth and Moon with their sizes and distance to scale. The gold dot, inside Earth’s circle, is the centre of mass.',
    },
    steps: [
      { label: 'Set up', text: t`Put the origin at Earth’s centre and the $x$-axis toward the Moon: $x_E = 0$, $x_M = 384{,}400$ km.` },
      { label: 'Average', text: t`$x_\text{cm} = \dfrac{m_E(0) + m_M x_M}{m_E + m_M} = 384{,}400\ \text{km}\times\dfrac{7.342\times10^{22}}{6.045\times10^{24}} = 4{,}670$ km.` },
      { label: 'Interpret', text: t`Earth’s radius is 6,371 km, so the centre of mass lies **inside Earth**, about 1,700 km below the surface. Earth and Moon both circle this point once a month: Earth’s centre swings round a circle 4,670 km in radius.` },
      { label: 'Sense check', text: t`The centre of mass sits closer to the heavier body, with distances in inverse ratio to the masses: $4{,}670 : 379{,}730 = 1 : 81.3$, and Earth is 81.3 times the Moon’s mass. ✓` },
    ],
    answer: t`About 4,670 km from Earth’s centre, toward the Moon — inside Earth.`,
  },
  practice: [
    num({
      id: 'two-masses', difficulty: 1,
      gen(r) {
        const m1 = r.pick([1, 2, 3]), m2 = r.pick([4, 5, 6]), L = r.pick([0.6, 0.8, 1.2, 1.5]);
        const x = (m2 * L) / (m1 + m2);
        return {
          prompt: t`A ${m1} kg mass and a ${m2} kg mass sit at the ends of a light rod ${L} m long. How far from the ${m1} kg mass is the centre of mass?`,
          answer: x, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: L / 2, feedback: 'The midpoint is the centre of mass only for equal masses: weight each position by its mass.' },
            { value: (m1 * L) / (m1 + m2), feedback: 'That is its distance from the heavier mass. The centre of mass lies closer to the heavier one.' },
          ],
          hints: [t`Put the ${m1} kg mass at $x = 0$ and the other at $x = ${L}$ m.`, t`$x_\text{cm} = \dfrac{m_1(0) + m_2(${L})}{m_1 + m_2}$.`],
          teach: 'The centre of mass of two bodies lies on the line between them, closer to the heavier one.',
          explain: t`$x_\text{cm} = \dfrac{(${m2})(${L})}{${m1 + m2}} = ${s3(x)}$ m from the ${m1} kg mass — nearer the heavier ${m2} kg mass.`,
          visual: massDots([{ x: 0, m: m1, label: `${m1} kg` }, { x: L, m: m2, label: `${m2} kg`, color: 'violet' }], { caption: 'Dot areas grow with mass; the light rod joins them.' }),
        };
      },
    }),
    num({
      id: 'three-line', difficulty: 2,
      gen(r) {
        const xs = [r.pick([-3, -2]), r.pick([0, 1]), r.pick([3, 4])], ms = [r.pick([1, 2]), r.pick([3, 4]), r.pick([1, 2, 5])];
        const M = ms[0] + ms[1] + ms[2], x = (ms[0] * xs[0] + ms[1] * xs[1] + ms[2] * xs[2]) / M;
        return {
          prompt: t`Three small masses lie on the $x$-axis: ${ms[0]} kg at $x = ${xs[0]}$ m, ${ms[1]} kg at $x = ${xs[1]}$ m and ${ms[2]} kg at $x = ${xs[2]}$ m. Where is their centre of mass?`,
          answer: x, units: 'm', tol: { rel: 0.01, abs: 0.01 },
          errors: Math.abs((xs[0] + xs[1] + xs[2]) / 3 - x) > 0.02 ? [{ value: (xs[0] + xs[1] + xs[2]) / 3, feedback: 'That is the plain average of the positions. Weight each one by its mass.' }] : [],
          hints: [t`$x_\text{cm} = \dfrac{\sum m_i x_i}{\sum m_i}$ — keep the sign of the negative position.`],
          teach: 'The centre of mass is a mass-weighted average; positions on the negative side count negatively.',
          explain: t`$x_\text{cm} = \dfrac{(${ms[0]})(${xs[0]}) + (${ms[1]})(${xs[1]}) + (${ms[2]})(${xs[2]})}{${M}} = \dfrac{${nice(M * x)}}{${M}} = ${s3(x)}$ m.`,
          visual: massDots(xs.map((xx, i) => ({ x: xx, m: ms[i], label: `${ms[i]} kg`, color: ['accent', 'violet', 'good'][i] })), { caption: 'The three masses on the x-axis (dot areas grow with mass).' }),
        };
      },
    }),
    {
      type: 'point', id: 'drag-cm', difficulty: 2,
      gen(r) {
        const pts = r.pick([[[0, 0], [4, 0], [0, 3]], [[0, 0], [4, 1], [1, 3]], [[0, 1], [4, 0], [2, 3]]]);
        const ms = r.pick([[2, 1, 1], [1, 2, 1], [1, 1, 2], [3, 1, 2]]);
        const M = ms[0] + ms[1] + ms[2];
        const cx = (ms[0] * pts[0][0] + ms[1] * pts[1][0] + ms[2] * pts[2][0]) / M, cy = (ms[0] * pts[0][1] + ms[1] * pts[1][1] + ms[2] * pts[2][1]) / M;
        return {
          prompt: t`Three point masses lie on a light frame: ${ms[0]} kg at (${pts[0][0]}, ${pts[0][1]}), ${ms[1]} kg at (${pts[1][0]}, ${pts[1][1]}) and ${ms[2]} kg at (${pts[2][0]}, ${pts[2][1]}), in metres. Place the hollow marker on their centre of mass.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.6, 4.6], y: [-0.6, 3.6], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', xticks: 6, yticks: 5,
              points: pts.map((p, i) => ({ x: p[0], y: p[1], r: 5 + 3 * ms[i], color: ['accent', 'violet', 'good'][i], label: `${ms[i]} kg` })),
              drag: [{ key: 'p', x: 2.2, y: 3.3, snap: 0.05 }],
            },
            caption: 'Dot sizes grow with mass. Drag the hollow marker.',
          },
          answer: { x: r4(cx), y: r4(cy) }, tol: { x: 0.12, y: 0.12 },
          instruction: 'Drag the hollow marker to the centre of mass, then check.',
          hints: [t`Find $x_\text{cm}$ and $y_\text{cm}$ separately: each is a mass-weighted average.`, t`$x_\text{cm} = \dfrac{\sum m_i x_i}{\sum m_i}$, and the same with $y$.`],
          teach: 'In two dimensions, find each coordinate of the centre of mass separately.',
          explain: t`$x_\text{cm} = \dfrac{${ms.map((m, i) => `${m}(${pts[i][0]})`).join(' + ')}}{${M}} = ${s3(cx)}$ m and $y_\text{cm} = \dfrac{${ms.map((m, i) => `${m}(${pts[i][1]})`).join(' + ')}}{${M}} = ${s3(cy)}$ m.`,
        };
      },
    },
    mcq({
      id: 'outside', difficulty: 1,
      prompt: 'A uniform flat L-shaped bracket is drawn below. Which marked point is its centre of mass?',
      choices: ['A — in the open corner, off the metal', 'B — at the corner where the two arms meet', 'C — in the middle of the longer arm', 'D — in the middle of the shorter arm'],
      answer: 0,
      why: {
        1: 'The centre of mass need not be on the material. Each arm’s mass pulls it toward that arm’s middle, so it ends up between them — in the empty corner.',
        2: 'The long arm has more mass, but the short arm still pulls the average toward itself.',
        3: 'The short arm has less mass, so the average lies nearer the long arm — but between the two, not on either.',
      },
      hints: ['Treat each arm as a rectangle with all its mass at its own centre.', 'The centre of mass of the whole lies on the line joining the two arms’ centres, closer to the heavier arm.'],
      teach: 'A centre of mass need not lie inside the material: for an L, a ring or a boomerang it sits in empty space.',
      explain: t`Long arm: area 4 with centre (2, 0.5); short arm: area 3 with centre (0.5, 2.5). So $x_\text{cm} = y_\text{cm} = \dfrac{4(2) + 3(0.5)}{7} = 1.36$ — point A, off the metal. Hang the bracket from any point and A will sit straight below it.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.7, 4.7], y: [-0.5, 4.4], equal: true, xlabel: '', ylabel: '', xticks: 0.001, yticks: 0.001, axes: false,
          shade: [box(0, 4, 0, 1), box(0, 1, 1, 4)],
          curves: [seg([0, 0], [4, 0], 'accent', 1.6), seg([4, 0], [4, 1], 'accent', 1.6), seg([4, 1], [1, 1], 'accent', 1.6), seg([1, 1], [1, 4], 'accent', 1.6), seg([1, 4], [0, 4], 'accent', 1.6), seg([0, 4], [0, 0], 'accent', 1.6)],
          points: [{ x: 1.357, y: 1.357, r: 4, color: 'gold', label: 'A' }, { x: 0.5, y: 0.5, r: 4, color: 'gold', label: 'B' }, { x: 2.6, y: 0.5, r: 4, color: 'gold', label: 'C' }, { x: 0.5, y: 2.5, r: 4, color: 'gold', label: 'D' }],
        },
        caption: 'A uniform flat bracket: arms 4 × 1 and 3 × 1 (the corner square belongs to the long arm).',
      },
    }),
    num({
      id: 'rod-density', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2]), b = r.pick([1, 2, 4]), L = r.pick([1, 2]);
        const M = a * L + (b * L * L) / 2, x = ((a * L * L) / 2 + (b * L ** 3) / 3) / M;
        return {
          prompt: t`A rod lies along the $x$-axis from $x = 0$ to $x = ${L}$ m. It gets denser toward one end: its mass per unit length is $\lambda(x) = ${a} + ${b}x$ kg/m. Where is its centre of mass?`,
          answer: x, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: L / 2, feedback: 'The middle is the centre of mass only for a uniform rod. The heavier end pulls it over.' }],
          hints: [t`$x_\text{cm} = \dfrac{\int x\,dm}{\int dm}$ with $dm = \lambda\,dx$.`, t`$M = \int_0^{${L}}(${a} + ${b}x)\,dx$ and $\int_0^{${L}} x(${a} + ${b}x)\,dx$.`, t`$M = ${a}L + \tfrac{${b}}{2}L^2$; the top integral is $\tfrac{${a}}{2}L^2 + \tfrac{${b}}{3}L^3$, with $L = ${L}$.`],
          teach: 'For a continuous body, sum x dm with an integral: x_cm = ∫x λ dx / ∫λ dx.',
          explain: t`$M = ${a}(${L}) + \tfrac{${b}}{2}(${L})^2 = ${nice(M)}$ kg and $\int_0^{${L}}x\lambda\,dx = \tfrac{${a}}{2}(${L})^2 + \tfrac{${b}}{3}(${L})^3 = ${s3(M * x)}$ kg·m, so $x_\text{cm} = ${s3(x)}$ m — past the midpoint ${L / 2} m, toward the dense end.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-0.1 * L, 1.1 * L], y: [0, (a + b * L) * 1.2], xlabel: 'x (m)', ylabel: 'λ (kg/m)',
              curves: [{ fn: `${a} + ${b}*x`, domain: [0, L], color: 'accent' }],
              shade: [{ fn: `${a} + ${b}*x`, from: 0, to: L, color: 'accent', alpha: 0.25 }],
              vlines: [{ x: L / 2, label: 'midpoint' }],
            },
            caption: 'The rod’s mass per unit length along its length; the shaded area is its mass.',
          },
        };
      },
    }),
    mcq({
      id: 'burst', difficulty: 2,
      prompt: 'A shell is fired across flat ground and bursts into two pieces at the top of its arc. Ignoring air resistance, what does the pieces’ centre of mass do afterwards (until a piece lands)?',
      choices: ['It carries on along the original parabola', 'It drops straight down from the burst point', 'It moves toward the larger piece', 'It is pushed forward by the explosion'],
      answer: 0,
      why: {
        1: 'The pieces keep the shell’s horizontal momentum between them, so their centre of mass keeps moving sideways.',
        2: 'The centre of mass is a weighted average position: it moves as one particle, not toward either piece.',
        3: 'The explosion’s forces are internal, so they cannot accelerate the centre of mass. Only gravity, an external force, does.',
      },
      hints: [t`$M\vec a_\text{cm} = \vec F_\text{ext}$. What external forces act after the burst?`, 'Only gravity — the same total gravity as before the burst.'],
      teach: 'Internal forces cannot move the centre of mass: it follows the path set by the external forces alone.',
      explain: t`After the burst the only external force is gravity, $Mg$ downward — just as before. So $\vec a_\text{cm} = \vec g$ and the centre of mass continues along the original parabola, as if nothing had happened, until one piece hits the ground and the ground adds a new external force.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.3, 8.3], y: [-0.2, 3.6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [
            { fn: '0', domain: [-0.3, 8.3], color: 'ink3', width: 1.5 },
            { fn: '0.2*x*(8 - x)', domain: [0, 4], color: 'accent', width: 2.4 },
            { fn: '0.2*x*(8 - x)', domain: [4, 8], color: 'ink4', width: 1.6, dash: true },
            { param: ['4 + 1.5*t', '3.2 + 0.9*t - 1.6*t^2'], t: [0, 1.8], color: 'violet', width: 2 },
            { param: ['4 + 0.25*t', '3.2 - 0.3*t - 1.6*t^2'], t: [0, 1.2], color: 'good', width: 2 },
          ],
          points: [{ x: 4, y: 3.2, r: 5, color: 'gold', label: 'burst' }],
        },
        caption: 'A sketch: the shell’s path (blue), the burst, and two possible paths of the pieces. The dashed line is the rest of the original parabola.',
      },
    }),
    num({
      id: 'boat', difficulty: 3,
      gen(r) {
        const mp = r.pick([60, 70, 80]), mb = r.pick([120, 150, 200]), L = r.pick([3, 4, 5]);
        const d = (mp * L) / (mp + mb);
        return {
          prompt: t`A ${mp} kg person stands at one end of a ${mb} kg boat floating at rest on still water. She walks ${L} m to the other end of the boat. How far does the boat move? (Ignore the water’s drag.)`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (mp * L) / mb, feedback: 'She does not move the full boat length relative to the water — the boat slides back under her. Use her displacement relative to the water, (L − d).' },
            { value: L, feedback: 'The boat is heavier than she is, so it moves less than she does.' },
          ],
          hints: ['No horizontal external force acts on person + boat, so their centre of mass stays put.', t`If the boat moves back a distance $d$, she moves forward $${L} - d$ relative to the water.`, t`$m_p(${L} - d) = m_b\,d$.`],
          teach: 'With no external force, the centre of mass of an isolated system stays put, so parts can only move in opposite directions, in inverse proportion to their masses.',
          explain: t`The centre of mass cannot move: $m_p(L - d) = m_b d \Rightarrow d = \dfrac{m_p L}{m_p + m_b} = \dfrac{${mp}\times${L}}{${mp + mb}} = ${s3(d)}$ m, opposite to her walk. (Water drag would let it drift slowly back.)`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-1.2, L + 1.6], y: [-0.9, 1.6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              shade: [{ fn: '0', lower: `-0.45 + 0.45*max(0, max(-x, x - ${L}))/0.6`, from: -0.6, to: L + 0.6, color: 'warn', alpha: 0.55 }, { fn: '-0.25', lower: '-0.9', from: -1.2, to: L + 1.6, color: 'accent', alpha: 0.12 }],
              points: [{ x: 0, y: 0.45, r: 7, color: 'violet', label: 'she starts here' }, { x: L, y: 0.3, r: 3, color: 'ink3', label: 'and walks to here' }],
              arrows: [{ from: [0.3, 0.9], to: [L - 0.2, 0.9], color: 'violet', label: `${L} m along the boat`, labelDx: -80, labelDy: -12 }],
            },
            caption: 'The boat (amber) on still water, before she walks. A sketch, not to scale.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-jupiter', difficulty: 3, transfer: true,
      prompt: t`Jupiter ($1.898\times10^{27}$ kg) orbits the Sun ($1.989\times10^{30}$ kg) at an average distance of $7.785\times10^{8}$ km. How far is their centre of mass from the Sun’s centre, in units of the Sun’s radius, $6.96\times10^{5}$ km? (Astronomers find exoplanets by spotting stars that circle such points.)`,
      answer: (7.785e8 * 1.898e27) / (1.989e30 + 1.898e27) / 6.96e5, tol: { rel: 0.01 },
      errors: [
        { value: (7.785e8 * 1.898e27) / 1.989e30 / 6.96e5 / 1e3, feedback: 'Check the powers of ten: keep the distance in km and divide by the Sun’s radius in km.' },
        { value: 7.785e8 / 6.96e5 / 2, feedback: 'The centre of mass is not half-way: weight each position by its mass. The Sun is a thousand times heavier.' },
      ],
      hints: ['Put the Sun’s centre at the origin: x_cm = m_J d / (m_S + m_J).', 'Then divide by the Sun’s radius.'],
      teach: 'A planet and its star circle their common centre of mass; for Jupiter and the Sun it lies just outside the Sun.',
      explain: t`$x_\text{cm} = 7.785\times10^{8}\ \text{km}\times\dfrac{1.898\times10^{27}}{1.991\times10^{30}} = 7.42\times10^{5}$ km $= 1.07$ solar radii — just outside the Sun’s surface. The Sun circles that point every 11.9 years at about 12.5 m/s: the kind of wobble that has revealed hundreds of planets around other stars.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-2.2, 4.2], y: [-1.5, 1.5], equal: true, xlabel: 'distance from the Sun’s centre (solar radii)', ylabel: '', yticks: 0.001,
          shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'gold', alpha: 0.45 }],
          arrows: [{ from: [1.4, 0.95], to: [3.9, 0.95], color: 'warn', label: 'to Jupiter, 1,119 solar radii away', labelDx: -232, labelDy: -14 }],
          points: [{ x: 0, y: 0, r: 3, color: 'ink', label: 'Sun’s centre', labelDy: 14 }],
        },
        caption: 'The Sun, to scale on this axis. Jupiter itself would be over a hundred screens to the right.',
      },
    }),
    num({
      id: 'cp-vcm', difficulty: 2,
      gen(r) {
        const m1 = r.pick([2, 3, 4]), m2 = r.pick([1, 2, 5]), u1 = r.pick([3, 4, 6]), u2 = -r.pick([1, 2]);
        const v = (m1 * u1 + m2 * u2) / (m1 + m2);
        return {
          prompt: t`On a frictionless track, a ${m1} kg cart moving at ${u1} m/s and a ${m2} kg cart moving at ${-u2} m/s the other way are about to collide. What will the velocity of their centre of mass be **after** the collision? (Positive: the ${m1} kg cart’s direction.)`,
          answer: v, units: 'm/s', tol: { rel: 0.01, abs: 0.005 },
          errors: [{ value: (m1 * u1 - m2 * u2) / (m1 + m2), feedback: 'The second cart moves the other way: its momentum enters with a negative sign.' }],
          hints: [t`$\vec v_\text{cm} = \vec P/M$.`, 'The collision’s forces are internal: they cannot change P, so v_cm is the same before and after — whatever kind of collision it is.'],
          teach: 'The centre-of-mass velocity is P/M, which no internal force can change.',
          explain: t`$v_\text{cm} = \dfrac{(${m1})(${u1}) + (${m2})(${u2})}{${m1 + m2}} = ${s3(v)}$ m/s — before, during and after the collision, elastic or not.`,
          visual: { type: 'mech-collide', params: { view: 'snapshots', show: 'before', m1, m2, u1, u2, e: 0.5, bars: [] }, caption: 'The carts before they meet.' },
        };
      },
    }),
    num({
      id: 'cp-panel', difficulty: 3, transfer: true,
      gen(r) {
        const mb = r.pick([400, 500, 650]), mp = r.pick([40, 60, 80]), d = r.pick([3, 3.5, 4]);
        const x = (mp * d) / (mb + mp);
        return {
          prompt: t`A satellite is a ${mb} kg box with a single ${mp} kg solar array sticking out to one side; the array’s centre of mass is ${d} m from the box’s. Where is the whole satellite’s centre of mass, measured from the centre of the box? (Its thrusters must push through this point, or firing them will set it spinning.)`,
          answer: x, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: d / 2, feedback: 'Half-way would need equal masses: the box is far heavier.' }, { value: (mp * d) / mb, feedback: 'Divide by the total mass, box plus array.' }],
          hints: ['Treat box and array as two point masses at their own centres of mass.', t`$x_\text{cm} = \dfrac{m_b(0) + m_a d}{m_b + m_a}$.`],
          teach: 'For a composite body, treat each part as a point mass at its own centre of mass.',
          explain: t`$x_\text{cm} = \dfrac{(${mp})(${d})}{${mb + mp}} = ${s3(x)}$ m from the box’s centre, toward the array. Burning a main engine aimed through the box’s centre would put a torque on the craft — the subject of lesson M10.4.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-1.4, d + 2.4], y: [-1.3, 1.3], equal: true, xlabel: 'x (m)', ylabel: '', yticks: 0.001,
              shade: [box(-0.75, 0.75, -0.75, 0.75, 'ink3', 0.5), box(d - 1.6, d + 1.6, -0.35, 0.35, 'accent', 0.45)],
              curves: [...outline(-0.75, 0.75, -0.75, 0.75, 'ink2'), ...outline(d - 1.6, d + 1.6, -0.35, 0.35, 'accent'), seg([0.75, 0], [d - 1.6, 0], 'ink3', 2)],
              points: [{ x: 0, y: 0, r: 4, color: 'ink', label: 'box’s centre' }, { x: d, y: 0, r: 4, color: 'accent', label: 'array’s centre' }],
            },
            caption: 'The satellite seen from above: the box (grey) and its solar array (blue), with each part’s own centre of mass. Sizes roughly to scale.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §9.6 Center of mass', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-6-center-of-mass' },
    { label: 'NASA Earth and Moon fact sheets (masses, distance)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' },
  ],
});
