// Range, maximum height and the shape of the trajectory — and when the
// textbook answers (45°, complementary angles) stop being true.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, s3, D2R } from './_kinematics.js';

const t = String.raw;

// height as a function of horizontal distance, for a launch at v0 and th degrees with gravity g
const traj = (v0, th, g = G, h = 0) => `${h} + ${Math.tan(th * D2R)}*x - ${g / (2 * (v0 * Math.cos(th * D2R)) ** 2)}*x^2`;
const range = (v0, th, g = G) => (v0 * v0 * Math.sin(2 * th * D2R)) / g;
const height = (v0, th, g = G) => (v0 * Math.sin(th * D2R)) ** 2 / (2 * g);

export default lesson({
  id: 'phys2210.M4.3',
  title: 'Range, height and trajectory shape',
  minutes: 11, difficulty: 2,
  intro: t`Launched from level ground with no air resistance, a projectile’s whole flight is fixed by its launch speed $v_0$ and angle $\theta$:

$$R = \frac{v_0^2\sin 2\theta}{g}, \qquad H = \frac{v_0^2\sin^2\theta}{2g}, \qquad y = x\tan\theta - \frac{g\,x^2}{2v_0^2\cos^2\theta}$$

The range is greatest at **45°**, and complementary angles such as 30° and 60° land at the same spot — the higher one takes longer. Both statements hold **only for level ground and no air**. Launched from above the landing level, or with drag, the best angle is lower than 45°.`,
  symbols: [
    { tex: 'R', text: 'the range: horizontal distance travelled before returning to the launch height, in m' },
    { tex: 'H', text: 'the maximum height above the launch point, in m' },
    { tex: 'v_0,\\ \\theta', text: 'launch speed (m/s) and launch angle above the horizontal' },
    { tex: 'g', text: 'the free-fall acceleration: 9.8 m/s² on Earth, 1.62 m/s² on the Moon, 3.71 m/s² on Mars' },
    { tex: 'y(x)', text: 'the trajectory: height as a function of horizontal distance — a downward parabola. It comes from eliminating $t$ between $x = (v_0\\cos\\theta)t$ and $y = (v_0\\sin\\theta)t - \\tfrac12 gt^2$' },
    { tex: '\\sin 2\\theta', text: 'largest, equal to 1, when $2\\theta = 90^\\circ$; and $\\sin 2\\theta = \\sin(180^\\circ - 2\\theta)$, which is why $\\theta$ and $90^\\circ - \\theta$ give the same range' },
  ],
  why: 'These formulas size everything from fountains to sports throws — and they are the baseline that drag corrections, artillery tables and rocket recovery zones start from.',
  visual: {
    type: 'graph',
    title: 'One speed, two angles',
    lead: t`The solid curve is the path at angle $\theta$; the dashed one is the path at the complementary angle $90^\circ - \theta$, at the same speed. Drag the sliders and watch the readouts.`,
    tasks: [
      'Set θ = 30°: the dashed 60° path lands at exactly the same spot, after a higher and longer flight.',
      'Sweep θ and watch the range readout: it peaks at 45°, where the two paths become one.',
      'Double v₀: the range and the height both grow four times.',
    ],
    params: {
      x: [0, 66], y: [0, 34], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
      sliders: [
        { key: 'v0', label: 'Launch speed $v_0$', min: 5, max: 25, step: 0.5, value: 20, unit: '\\mathrm{m/s}', explain: 'The same for both paths.' },
        { key: 'th', label: 'Launch angle $\\theta$', min: 5, max: 85, step: 1, value: 30, unit: '^\\circ', explain: 'The dashed path uses $90^\\circ - \\theta$.' },
      ],
      curves: [
        { fn: 'x*tan(th*pi/180) - 9.8*x^2/(2*v0^2*cos(th*pi/180)^2)', domain: [0, 'v0^2*sin(2*th*pi/180)/9.8'], color: 'accent' },
        { fn: 'x*tan((90 - th)*pi/180) - 9.8*x^2/(2*v0^2*cos((90 - th)*pi/180)^2)', domain: [0, 'v0^2*sin(2*th*pi/180)/9.8'], color: 'warn', dash: true },
      ],
      points: [{ x: 'v0^2*sin(2*th*pi/180)/9.8', y: 0, color: 'gold' }],
      readouts: [
        { label: 'range $R$', expr: 'v0^2*sin(2*th*pi/180)/9.8', unit: '\\mathrm{m}', digits: 3 },
        { label: 'height $H$ at $\\theta$', expr: '(v0*sin(th*pi/180))^2/(2*9.8)', unit: '\\mathrm{m}', digits: 3 },
        { label: 'flight time at $\\theta$', expr: '2*v0*sin(th*pi/180)/9.8', unit: '\\mathrm{s}', digits: 3 },
        { label: 'flight time at $90^\\circ - \\theta$', expr: '2*v0*cos(th*pi/180)/9.8', unit: '\\mathrm{s}', digits: 3 },
        { label: 'largest possible range $v_0^2/g$', expr: 'v0^2/9.8', unit: '\\mathrm{m}', digits: 3 },
      ],
    },
    caption: 'Level ground, no air resistance, g = 9.8 m/s². With drag the paths would be lower, shorter and lopsided, and the best angle below 45°.',
  },
  example: {
    prompt: t`On the Moon there is no air, so the drag-free formulas are as good as exact for short throws. An astronaut throws a sample bag at 8.0 m/s ($g = 1.62\ \text{m/s}^2$). What is the farthest it can go on level ground? At which two angles does it land 30 m away?`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 33], y: [0, 18], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
        curves: [
          { fn: traj(8, 24.705, 1.62), domain: [0, 30], color: 'accent', label: '24.7°', labelAt: 6 },
          { fn: traj(8, 65.295, 1.62), domain: [0, 30], color: 'warn', label: '65.3°', labelAt: 9 },
        ],
        points: [{ x: 30, y: 0, color: 'gold', label: '30 m' }],
      },
      caption: 'Both throws, to scale, in lunar gravity.',
    },
    steps: [
      { label: 'Farthest', text: t`The range is largest at 45°, where $\sin 2\theta = 1$: $R_\text{max} = \dfrac{v_0^2}{g} = \dfrac{8.0^2}{1.62} = 39.5$ m.` },
      { label: 'Set up', text: t`For $R = 30$ m: $\sin 2\theta = \dfrac{Rg}{v_0^2} = \dfrac{30(1.62)}{64} = 0.759$.` },
      { label: 'Two angles', text: t`$2\theta = 49.4^\circ$ or $180^\circ - 49.4^\circ = 130.6^\circ$, so $\theta = 24.7^\circ$ or $65.3^\circ$ — complementary, adding to 90°.` },
      { label: 'Compare', text: t`Heights $H = v_0^2\sin^2\theta/(2g)$: 3.4 m and 16.3 m. Flight times $2v_0\sin\theta/g$: 4.1 s and 9.0 s. Same landing point, very different trips.` },
      { label: 'Sense check', text: t`On Earth the same throw could go at most $64/9.8 = 6.5$ m: with $g$ six times smaller, ranges are six times larger.` },
    ],
    answer: t`At most 39.5 m (at 45°); it lands 30 m away at 24.7° or at 65.3°.`,
  },
  practice: [
    mcq({
      id: 'complementary', difficulty: 1,
      prompt: 'Two balls are launched from level ground at the same speed, one at 15° and one at 75°. Ignoring air resistance, how do their ranges compare?',
      choices: ['They are equal', 'The 75° ball goes farther, because it stays up longer', 'The 15° ball goes farther, because it moves faster horizontally', 'The 75° ball goes five times farther'],
      answer: 0,
      why: {
        1: 'It does stay up longer — but it moves sideways more slowly. The two effects cancel exactly for complementary angles.',
        2: 'It does move faster sideways, but it lands sooner. Exactly balanced: sin 30° = sin 150°.',
        3: 'Range is not proportional to the angle. It goes as sin 2θ, and sin 30° = sin 150°.',
      },
      hints: [t`$R = v_0^2\sin 2\theta/g$. Compare $\sin 30^\circ$ and $\sin 150^\circ$.`],
      teach: 'On level ground without air, complementary launch angles give equal ranges.',
      explain: t`$\sin(2 \times 15^\circ) = \sin 30^\circ = 0.5$ and $\sin(2 \times 75^\circ) = \sin 150^\circ = 0.5$: same range. The 75° ball rises much higher and takes about 3.7 times as long.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1, 12], y: [-0.5, 7.5], equal: true, xlabel: '', ylabel: '', grid: false, axes: false,
          curves: [{ fn: '0', domain: [-1, 12], color: 'ink3', width: 1.5 }],
          arrows: [{ from: [0, 0], to: [6.76, 1.81], color: 'accent', label: '15°' }, { from: [0, 0], to: [1.81, 6.76], color: 'warn', label: '75°' }],
        },
        caption: 'The two launch velocities: same speed, complementary angles.',
      },
    }),
    num({
      id: 'range', difficulty: 1,
      gen(r) {
        const v0 = r.pick([10, 12, 15, 18, 20]), th = r.pick([20, 25, 35, 40, 50, 55, 65]);
        const R = range(v0, th);
        return {
          prompt: t`A ball is launched from level ground at ${v0} m/s, ${th}° above the horizontal. Ignoring air resistance, what is its range?`,
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (v0 * v0 * Math.sin(th * D2R)) / G, feedback: t`The range has $\sin 2\theta$, not $\sin\theta$.` },
            { value: R / 2, feedback: t`Check the formula: $R = v_0^2\sin 2\theta/g$, with no extra factor of 2.` },
          ],
          hints: [t`$R = \dfrac{v_0^2\sin 2\theta}{g}$.`],
          teach: 'On level ground without air, R = v₀² sin 2θ / g.',
          explain: t`$R = \dfrac{${v0}^2\sin ${2 * th}^\circ}{9.8} = ${s3(R)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, (v0 * v0) / G * 1.05], y: [0, Math.max(height(v0, th) * 1.3, 2)], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ fn: traj(v0, th), domain: [0, R], color: 'accent' }],
            },
            caption: 'The path, to scale.',
          },
        };
      },
    }),
    num({
      id: 'launch-speed', difficulty: 2,
      gen(r) {
        const R = r.pick([20, 30, 40, 50]), th = r.pick([30, 40, 60]);
        const v0 = Math.sqrt((R * G) / Math.sin(2 * th * D2R));
        return {
          prompt: t`A water cannon aimed ${th}° above the horizontal must reach a target ${R} m away at the same height. Ignoring air resistance, how fast must the water leave the nozzle?`,
          answer: v0, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(R * G), feedback: 'That is the speed needed at 45°. At this angle you need more.' },
            { value: (R * G) / Math.sin(2 * th * D2R), feedback: t`You need a square root: $v_0^2 = Rg/\sin 2\theta$.` },
          ].filter((e) => Math.abs(e.value - v0) > 0.02 * v0),
          hints: [t`Rearrange $R = v_0^2\sin 2\theta/g$ for $v_0$.`, t`$v_0 = \sqrt{Rg/\sin 2\theta}$.`],
          teach: 'Solve the range formula for the speed: v₀ = √(Rg / sin 2θ).',
          explain: t`$v_0 = \sqrt{\dfrac{(${R})(9.8)}{\sin ${2 * th}^\circ}} = ${s3(v0)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2, R * 1.15], y: [-1, Math.max(height(v0, th) * 1.3, 4)], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ fn: traj(v0, th), domain: [0, R], color: 'accent' }],
              points: [{ x: 0, y: 0, color: 'ink' }, { x: R, y: 0, color: 'bad', label: 'target' }],
            },
            caption: 'The jet’s path to the target, to scale.',
          },
        };
      },
    }),
    {
      type: 'slider', id: 'best-angle', difficulty: 2, param: 'angle',
      prompt: 'Using the launcher, with air drag off and the launch height at 0, find the launch angle that sends the ball farthest.',
      instruction: 'Set the launch angle, press Launch to test, then check.',
      answer: [43, 47],
      hints: ['Watch the range readout as you change the angle.', t`$R \propto \sin 2\theta$, which is largest when $2\theta = 90^\circ$.`],
      teach: 'Over level ground without air, the range is greatest at a 45° launch.',
      explain: t`$R = v_0^2\sin 2\theta/g$ is largest when $\sin 2\theta = 1$, at $\theta = 45^\circ$. Angles equally far either side of 45° tie.`,
      visual: { type: 'projectile', params: { v0: 20, angle: 20, h0: 0 }, caption: 'Point mass, flat ground, uniform gravity; drag is off unless you switch it on.' },
    },
    mcq({
      id: 'from-height', difficulty: 2,
      prompt: 'A ball is launched from the top of a cliff and lands on the beach far below. Ignoring air resistance, which launch angle gives the greatest horizontal distance?',
      choices: ['Less than 45°', 'Exactly 45°', 'More than 45°', 'It depends on the mass of the ball'],
      answer: 0,
      why: {
        1: '45° is best only when the ball lands at its launch height. Falling the extra height, a flatter throw with more horizontal speed wins.',
        2: 'A steeper throw spends its speed going up; with extra time to fall anyway, horizontal speed matters more.',
        3: 'Mass does not appear anywhere in projectile motion without air.',
      },
      hints: ['With a long drop below, the ball gets extra flight time whatever its angle.', 'What then matters more: vertical speed or horizontal speed?'],
      teach: 'The 45° rule holds only for landing at the launch height; launching from above, the best angle is lower.',
      explain: t`From a height the ball gets flight time from the drop itself, so trading some vertical speed for horizontal speed pays. The best angle falls below 45° — the higher the cliff compared with $v_0^2/g$, the lower it goes.`,
      visual: {
        type: 'graph',
        params: {
          x: [-12, 40], y: [-1, 26], equal: true, xlabel: '', ylabel: '', grid: false, axes: false,
          curves: [
            { param: ['-12 + 12*t', '20'], t: [0, 1], color: 'ink3', width: 2 },
            { param: ['0', '20 - 20*t'], t: [0, 1], color: 'ink3', width: 2 },
            { fn: '0', domain: [0, 40], color: 'ink3', width: 2 },
          ],
          points: [{ x: 0, y: 20, color: 'accent', label: 'launch' }, { x: 26, y: 1.5, r: 0.1, color: 'ink2', label: 'beach' }],
        },
        caption: 'A launch from a cliff top to the beach below (a sketch).',
      },
    }),
    num({
      id: 'wall', difficulty: 3,
      gen(r) {
        const v0 = r.pick([15, 18, 20]), th = r.pick([30, 40, 50]), d = r.pick([10, 12, 15]);
        const y = d * Math.tan(th * D2R) - (G * d * d) / (2 * (v0 * Math.cos(th * D2R)) ** 2);
        const hw = Math.max(1, Math.round(y * 0.7));
        return {
          prompt: t`A ball is kicked at ${v0} m/s, ${th}° above the horizontal. A ${hw} m wall stands ${d} m away. Ignoring air resistance, how high is the ball when it is directly above the wall?`,
          answer: y, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: d * Math.tan(th * D2R) - (G * d * d) / (2 * v0 * v0), feedback: t`You dropped the $\cos^2\theta$: the time to reach the wall is $d/(v_0\cos\theta)$.` },
            { value: d * Math.tan(th * D2R), feedback: 'That is where it would be with no gravity. Subtract the drop.' },
          ].filter((e) => Math.abs(e.value - y) > 0.02 * Math.abs(y)),
          hints: [t`Use the trajectory equation $y = x\tan\theta - \dfrac{g x^2}{2v_0^2\cos^2\theta}$ at $x = ${d}$ m.`, t`Or: time to the wall $t = ${d}/(${v0}\cos ${th}^\circ)$, then $y = (v_0\sin\theta)t - \tfrac12 gt^2$.`],
          teach: 'The trajectory equation gives the height at any horizontal distance directly, without finding the time.',
          explain: t`$y = ${d}\tan ${th}^\circ - \dfrac{9.8(${d})^2}{2(${v0}\cos ${th}^\circ)^2} = ${s3(d * Math.tan(th * D2R))} - ${s3((G * d * d) / (2 * (v0 * Math.cos(th * D2R)) ** 2))} = ${s3(y)}$ m — it clears the ${hw} m wall.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, range(v0, th) * 1.08], y: [0, height(v0, th) * 1.35], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ fn: traj(v0, th), domain: [0, range(v0, th)], color: 'accent' }, { param: [String(d), 't'], t: [0, hw], color: 'warn', width: 4 }],
              points: [{ x: d, y: hw, r: 0.1, color: 'warn', label: 'wall' }],
            },
            caption: 'The ball’s path and the wall, to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'drag-angle', difficulty: 2,
      prompt: 'With air drag, which launch angle gives the longest range over level ground for a typical ball? Try it in the launcher with drag on.',
      choices: ['Less than 45°', 'Exactly 45°: drag slows the ball but does not change the best angle', 'More than 45°, to spend less time in the drag', 'Straight up, 90°'],
      answer: 0,
      why: {
        1: 'Drag does change the best angle: it robs a long, high flight of more speed than a short, flat one.',
        2: 'A steeper flight lasts longer, not shorter — drag acts the whole time.',
        3: 'Straight up has no horizontal motion at all, so it lands where it started.',
      },
      hints: ['Turn on drag and compare the ranges at 35°, 40° and 45°.', 'A long, high flight loses more speed to drag than a flatter one.'],
      teach: 'Air drag lowers the angle for maximum range below 45°.',
      explain: t`With drag the best angle drops below 45° — to about 39° for this dense ball at 30 m/s, and much lower for light, fast objects. The drag-free 45° rule is an idealisation.`,
      visual: { type: 'projectile', params: { v0: 30, angle: 45, h0: 0, drag: true }, caption: 'Quadratic drag with a fixed coefficient for a dense ball; the dashed curve is the same launch without air.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-height', difficulty: 2,
      gen(r) {
        const v0 = r.pick([12, 15, 20, 25]), th = r.pick([30, 40, 50, 60]);
        const H = height(v0, th);
        return {
          prompt: t`A ball is launched at ${v0} m/s, ${th}° above the horizontal. Ignoring air resistance, what maximum height does it reach above the launch point?`,
          answer: H, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (v0 * v0) / (2 * G), feedback: t`That would be a vertical launch. Use the vertical part of the velocity: $H = (v_0\sin\theta)^2/(2g)$.` }, { value: (v0 * v0 * Math.sin(th * D2R)) / (2 * G), feedback: t`Square the sine too: $H = v_0^2\sin^2\theta/(2g)$.` }],
          hints: [t`$H = \dfrac{v_0^2\sin^2\theta}{2g}$.`],
          teach: 'Maximum height depends only on the vertical part of the launch velocity.',
          explain: t`$H = \dfrac{(${v0}\sin ${th}^\circ)^2}{2(9.8)} = ${s3(H)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2, v0 + 3], y: [-1.5, v0 * 0.95], equal: true, xlabel: 'horizontal (m/s)', ylabel: 'vertical',
              arrows: [{ from: [0, 0], to: [v0 * Math.cos(th * D2R), v0 * Math.sin(th * D2R)], color: 'gold', label: `${v0} m/s` }],
              points: [{ x: 1.4, y: -1.2, r: 0.1, color: 'ink2', label: `${th}°` }],
            },
            caption: 'The launch velocity.',
          },
        };
      },
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const v0 = r.pick([10, 12, 15]), th = r.pick([30, 40, 50]);
        const gm = 3.71, R = range(v0, th, gm);
        return {
          prompt: t`A Mars lander ejects a sample canister from level ground at ${v0} m/s, ${th}° above the horizontal. Mars’s gravity is 3.71 m/s², and its air is so thin that drag is small for this short hop. How far away does the canister land?`,
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: range(v0, th), feedback: 'You used Earth’s g. On Mars, g = 3.71 m/s².' }, { value: (v0 * v0 * Math.sin(th * D2R)) / gm, feedback: t`The range has $\sin 2\theta$.` }],
          hints: [t`Same formula, Mars gravity: $R = v_0^2\sin 2\theta/g_\text{Mars}$.`, t`$g_\text{Mars} = 3.71\ \text{m/s}^2$.`],
          teach: 'The range formula works on any planet: only g changes, and R ∝ 1/g.',
          explain: t`$R = \dfrac{${v0}^2\sin ${2 * th}^\circ}{3.71} = ${s3(R)}$ m — about 2.6 times farther than the same launch on Earth.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2, v0 + 3], y: [-1.5, v0 * 0.95], equal: true, xlabel: 'horizontal (m/s)', ylabel: 'vertical',
              arrows: [{ from: [0, 0], to: [v0 * Math.cos(th * D2R), v0 * Math.sin(th * D2R)], color: 'gold', label: `${v0} m/s` }],
              points: [{ x: 1.4, y: -1.2, r: 0.1, color: 'ink2', label: `${th}°` }],
            },
            caption: 'The canister’s launch velocity.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-moon', difficulty: 3,
      prompt: 'An astronaut repeats on the Moon a throw she made on Earth: same speed, same angle. The Moon’s g is about one sixth of Earth’s, and there is no air on either throw. Compared with Earth, the throw goes:',
      choices: ['6 times farther and 6 times higher', 'About 2.4 times farther (√6) and 6 times higher', '6 times farther but no higher', '36 times farther'],
      answer: 0,
      why: {
        1: t`Both $R = v_0^2\sin 2\theta/g$ and $H = v_0^2\sin^2\theta/(2g)$ go as $1/g$, not $1/\sqrt{g}$.`,
        2: t`The height also depends on $g$: $H \propto 1/g$.`,
        3: t`$R \propto 1/g$, not $1/g^2$.`,
      },
      hints: ['How do R and H depend on g?', t`Both $R = v_0^2\sin 2\theta/g$ and $H = v_0^2\sin^2\theta/(2g)$ have $g$ alone in the denominator.`],
      teach: 'Range, height and flight time all scale with gravity: R and H as 1/g, the time as 1/g too.',
      explain: t`$R$ and $H$ are both proportional to $1/g$, so both grow 6 times; the flight time $2v_0\sin\theta/g$ also grows 6 times. The path is the Earth path scaled up by 6 in both directions.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 22], y: [0, 7], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
          curves: [{ fn: traj(10, 40), domain: [0, range(10, 40)], color: 'accent', label: 'on Earth', labelAt: 4 }],
        },
        caption: 'The throw on Earth (10 m/s at 40°), to scale.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §4.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion' }],
});
