// Right-triangle trigonometry — sine, cosine and tangent as ratios of the sides of a right triangle.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { thou } from './_m0kit.js';
import { D2R, triFig, exact } from './_m0trig.js';

const t = String.raw;
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
// a right triangle with the angle θ at the origin: adjacent along x, opposite up
const rightTri = (adj, opp, sides, caption, extra = {}, angleLabel = 'θ') => triFig({ v: [[0, 0], [adj, 0], [adj, opp]], right: 1, angleAt: 0, angleLabel, sides, caption, extra });
const CAM = (() => { const d = 2.0, a = 38, h = d * Math.tan(a * D2R), L = d / Math.cos(a * D2R); return { d, a, h, L }; })();

export default lesson({
  id: 'm0.M0-7.2',
  title: 'Right-triangle trigonometry',
  minutes: 9, difficulty: 1,
  intro: t`In a right triangle, one acute angle $\theta$ fixes the **shape**: every right triangle with that angle is the same triangle scaled up or down. So the ratios of its sides depend only on $\theta$, and they get names:

$$\sin\theta = \frac{\text{opp}}{\text{hyp}}, \qquad \cos\theta = \frac{\text{adj}}{\text{hyp}}, \qquad \tan\theta = \frac{\text{opp}}{\text{adj}}$$

Read them as machines: **opp $=$ hyp $\times \sin\theta$** and **adj $=$ hyp $\times \cos\theta$**. Two triangles give exact values worth knowing by heart: half a square ($45^\circ$–$45^\circ$–$90^\circ$, sides $1, 1, \sqrt2$) and half an equilateral triangle ($30^\circ$–$60^\circ$–$90^\circ$, sides $1, \sqrt3, 2$).`,
  symbols: [
    { tex: '\\theta', text: 'one of the two acute angles of the right triangle (in degrees or radians)' },
    { tex: '\\text{hyp}', text: 'the **hypotenuse**: the longest side, opposite the right angle' },
    { tex: '\\text{opp}', text: 'the side **opposite** $\\theta$ — the one that does not touch it' },
    { tex: '\\text{adj}', text: 'the side **adjacent** to $\\theta$ — the leg that touches it (not the hypotenuse)' },
    { tex: '\\sin,\\ \\cos,\\ \\tan', text: 'sine, cosine and tangent: pure numbers (length over length, no units)' },
  ],
  why: t`Every time a force, velocity or field is split into components — thrust into lift and climb, weight along and across a slope, a wave’s direction into $x$ and $y$ — it is a right triangle with the vector as hypotenuse. Surveying, rangefinding and astronomy measure heights and distances the same way.`,
  visual: {
    type: 'graph',
    title: 'One angle, one shape',
    lead: t`The hypotenuse has length $L$ and makes the angle $\theta$ with the ground. The readouts divide the sides. Change $L$ first, then $\theta$.`,
    tasks: [
      t`Change $L$ with $\theta$ fixed: every side scales, but $\text{opp}/\text{hyp}$, $\text{adj}/\text{hyp}$ and $\text{opp}/\text{adj}$ do not move. They belong to the angle.`,
      t`Set $\theta = 30^\circ$: $\text{opp}/\text{hyp} = 0.5$ exactly — the short side of a half-equilateral triangle.`,
      t`Set $\theta = 45^\circ$: opposite and adjacent are equal, so $\tan 45^\circ = 1$. Push $\theta$ towards $90^\circ$ and watch $\tan\theta$ run away.`,
    ],
    params: {
      x: [-0.4, 5.6], y: [-0.7, 5.2], aspect: 'wide', equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false,
      sliders: [
        { key: 'th', label: t`Angle $\theta$`, min: 5, max: 85, step: 1, value: 35, unit: '^\\circ', explain: t`The angle between the hypotenuse and the ground.` },
        { key: 'L', label: t`Hypotenuse $L$`, min: 1, max: 5, step: 0.1, value: 4, explain: t`The length of the longest side, in any unit.` },
      ],
      curves: [
        { param: ['t*L*cos(th*pi/180)', 't*L*sin(th*pi/180)'], t: [0, 1], color: 'ink', width: 3 },
        { param: ['t*L*cos(th*pi/180)', '0'], t: [0, 1], color: 'accent', width: 4 },
        { param: ['L*cos(th*pi/180)', 't*L*sin(th*pi/180)'], t: [0, 1], color: 'warn', width: 4 },
        { param: ['0.6*cos(t)', '0.6*sin(t)'], t: [0, 'th*pi/180'], color: 'gold', width: 2 },
        { param: ['L*cos(th*pi/180) - 0.22 + 0.22*t', '0.22'], t: [0, 1], color: 'ink3', width: 1.4 },
        { param: ['L*cos(th*pi/180) - 0.22', '0.22*t'], t: [0, 1], color: 'ink3', width: 1.4 },
      ],
      points: [
        { x: 'L*cos(th*pi/180)/2', y: 0, r: 0, label: 'adj', color: 'accent', labelAlign: 'center', labelDx: 0, labelDy: 14 },
        { x: 'L*cos(th*pi/180)', y: 'L*sin(th*pi/180)/2', r: 0, label: 'opp', color: 'warn', labelDx: 8, labelDy: 0 },
        { x: 'L*cos(th*pi/180)/2', y: 'L*sin(th*pi/180)/2', r: 0, label: 'hyp', color: 'ink', labelAlign: 'right', labelDx: -8, labelDy: -8 },
        { x: '0.85*cos(th*pi/360)', y: '0.85*sin(th*pi/360)', r: 0, label: 'θ', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 },
      ],
      readouts: [
        { label: t`$\text{opp}/\text{hyp}$`, expr: 'sin(th*pi/180)', digits: 3 },
        { label: t`$\text{adj}/\text{hyp}$`, expr: 'cos(th*pi/180)', digits: 3 },
        { label: t`$\text{opp}/\text{adj}$`, expr: 'tan(th*pi/180)', digits: 3 },
        { label: 'opp', expr: 'L*sin(th*pi/180)', digits: 3 },
        { label: 'adj', expr: 'L*cos(th*pi/180)', digits: 3 },
      ],
    },
    caption: t`To scale. The ratios are the sine, cosine and tangent of $\theta$; the side lengths depend on $L$ as well.`,
  },
  example: {
    prompt: t`A tracking camera stands $${CAM.d}$ km from a launch pad. When the camera is tilted up $${CAM.a}^\circ$ to follow a sounding rocket climbing straight up from the pad, how high is the rocket, and how far is it from the camera?`,
    visual: rightTri(CAM.d, CAM.h, [`${CAM.d} km`, 'h', 'd'], t`The camera at the left, the pad at the right angle, the rocket at the top; $d$ is the line of sight. To scale; the ground is taken as flat.`, {}, `${CAM.a}°`),
    steps: [
      { label: 'Name the sides', text: t`From the $${CAM.a}^\circ$ angle at the camera: the ground distance is **adjacent**, the height $h$ is **opposite**, the line of sight is the **hypotenuse**.` },
      { label: 'Pick the ratio', text: t`Adjacent is known, opposite wanted: the ratio with both is $\tan\theta = \dfrac{\text{opp}}{\text{adj}}$.` },
      { label: 'Solve', text: t`$h = ${CAM.d}\ \text{km} \times \tan ${CAM.a}^\circ = ${CAM.d} \times ${sig(Math.tan(CAM.a * D2R), 4)} = ${sig(CAM.h, 3)}$ km.` },
      { label: 'Line of sight', text: t`$\cos\theta = \dfrac{\text{adj}}{\text{hyp}}$, so $\text{hyp} = \dfrac{${CAM.d}}{\cos ${CAM.a}^\circ} = \dfrac{${CAM.d}}{${sig(Math.cos(CAM.a * D2R), 4)}} = ${sig(CAM.L, 3)}$ km.` },
      { label: 'Check', text: t`Pythagoras: $\sqrt{${CAM.d}^2 + ${sig(CAM.h, 4)}^2} = ${sig(Math.hypot(CAM.d, CAM.h), 4)}$ ✓. And $38^\circ < 45^\circ$, so the height should be less than the $${CAM.d}$ km ground distance — it is.` },
    ],
    answer: t`$h \approx ${sig(CAM.h, 3)}$ km high, $${sig(CAM.L, 3)}$ km from the camera.`,
  },
  practice: [
    mcq({
      id: 'which-ratio', difficulty: 1,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), f = r.pick(['sin', 'cos', 'tan']), flip = r.bool(0.5);
        const opp = flip ? b : a, adj = flip ? a : b, F = '\\' + f;
        const fr = (p, q) => t`$\dfrac{${p}}{${q}}$`;
        const S = t`That is opposite over hypotenuse: $\sin\theta$.`, C = t`That is adjacent over hypotenuse: $\cos\theta$.`, T = t`That is opposite over adjacent: $\tan\theta$.`, UP = t`Upside down: the hypotenuse belongs in the denominator.`, IT = t`Upside down: adjacent over opposite is $1/\tan\theta$.`;
        const set = {
          sin: [[opp, c], [[adj, c, C], [opp, adj, T], [c, opp, UP]]],
          cos: [[adj, c], [[opp, c, S], [adj, opp, IT], [c, adj, UP]]],
          tan: [[opp, adj], [[adj, opp, IT], [opp, c, S], [adj, c, C]]],
        }[f];
        return {
          prompt: t`In the right triangle shown, what is $${F}\theta$?`,
          visual: rightTri(adj / 4, opp / 4, [`${adj}`, `${opp}`, `${c}`], t`Side lengths in any unit; $\theta$ is at the left corner.`),
          choices: [fr(...set[0]), ...set[1].map(([p, q]) => fr(p, q))],
          answer: 0,
          why: Object.fromEntries(set[1].map((w, i) => [i + 1, w[2]])),
          hints: [t`Stand at $\theta$. The side across the triangle from it is opposite; the leg touching it is adjacent; the longest side is the hypotenuse.`],
          teach: t`SOH CAH TOA: sine is opposite over hypotenuse, cosine adjacent over hypotenuse, tangent opposite over adjacent.`,
          explain: t`Opposite $= ${opp}$, adjacent $= ${adj}$, hypotenuse $= ${c}$, so $${F}\theta = ${set[0][0]}/${set[0][1]}$.`,
        };
      },
    }),
    num({
      id: 'rail-height', difficulty: 1,
      gen(r) {
        const L = r.pick([6, 8, 10, 12]), a = r.pick([60, 70, 75, 80, 84]), ans = L * Math.sin(a * D2R);
        return {
          prompt: t`A model rocket leaves a launch rail $${L}$ m long, tilted $${a}^\circ$ above the horizontal. How high above its foot is the top of the rail?`,
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: L * Math.cos(a * D2R), feedback: t`That is the horizontal reach, the side adjacent to the $${a}^\circ$ angle. The height is opposite it: use $\sin$.` }, { value: L * Math.tan(a * D2R), feedback: t`$\tan$ is opposite over *adjacent*, but $${L}$ m is the hypotenuse. Use $\sin$.` }],
          hints: [t`The rail is the hypotenuse; the height is the side opposite the $${a}^\circ$ angle.`],
          teach: t`Opposite $=$ hypotenuse $\times \sin\theta$.`,
          explain: t`$h = ${L}\sin ${a}^\circ = ${L} \times ${sig(Math.sin(a * D2R), 4)} = ${sig(ans, 3)}$ m.`,
          visual: rightTri(L * Math.cos(a * D2R), L * Math.sin(a * D2R), ['', 'h', `${L} m`], t`The rail as the hypotenuse; to scale.`, {}, `${a}°`),
        };
      },
    }),
    num({
      id: 'radar-elevation', difficulty: 2,
      gen(r) {
        const h = r.pick([3, 5, 8, 10]), d = r.pick([12, 15, 20, 25]), ans = Math.atan(h / d) / D2R;
        return {
          prompt: t`An aircraft flies at an altitude of $${h}$ km, $${d}$ km (measured along the ground) from an air-traffic radar. At what elevation angle above the horizontal must the radar point? Use the $\tan^{-1}$ key: it turns a tangent back into an angle.`,
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: Math.atan(d / h) / D2R, feedback: t`You found the angle at the aircraft: $\tan\theta = \text{opp}/\text{adj}$ with the height *opposite* the radar’s angle, so $\tan\theta = ${h}/${d}$.` }],
          hints: [t`From the radar, the height is opposite and the ground distance adjacent.`, t`$\tan\theta = ${h}/${d}$, so $\theta = \tan^{-1}(${nice(h / d)})$.`],
          teach: t`Two legs known: their ratio is the tangent, and $\tan^{-1}$ gives the angle.`,
          explain: t`$\theta = \tan^{-1}\!\left(\dfrac{${h}}{${d}}\right) = ${sig(ans, 3)}^\circ$. The ground is treated as flat — fine at this range.`,
          visual: rightTri(d, h, [`${d} km`, `${h} km`, ''], t`Radar at the left, aircraft at the top. Drawn to scale; Earth’s curvature ignored.`),
        };
      },
    }),
    mcq({
      id: 'special-values', difficulty: 2,
      gen(r) {
        const OTHER = t`That is the value for the other acute angle: check which side is opposite your angle.`, D45 = t`$\sqrt2/2$ belongs to $45^\circ$, from the half square.`;
        const TABLE = {
          'sin 30': [[t`\frac{\sqrt3}{2}`, OTHER], [t`\frac{\sqrt2}{2}`, D45], ['2', t`Upside down: hypotenuse over opposite. A sine is never more than $1$.`]],
          'sin 60': [[t`\frac12`, OTHER], [t`\sqrt3`, t`$\sqrt3$ is opposite over adjacent, $\tan 60^\circ$. Divide by the hypotenuse, $2$.`], [t`\frac{\sqrt2}{2}`, D45]],
          'cos 30': [[t`\frac12`, OTHER], [t`\sqrt3`, t`$\sqrt3$ is the adjacent side itself; divide by the hypotenuse, $2$.`], [t`\frac{\sqrt2}{2}`, D45]],
          'cos 60': [[t`\frac{\sqrt3}{2}`, OTHER], ['2', t`Upside down: hypotenuse over adjacent. A cosine is never more than $1$.`], [t`\frac{\sqrt2}{2}`, D45]],
          'tan 30': [[t`\sqrt3`, t`That is $\tan 60^\circ$: from $30^\circ$ the opposite side is the short one, $1$.`], [t`\frac12`, t`$\tfrac12$ is opposite over *hypotenuse*: $\sin 30^\circ$.`], [t`\frac{\sqrt3}{2}`, t`That is $\cos 30^\circ$.`]],
          'tan 60': [[t`\frac{1}{\sqrt3}`, t`That is $\tan 30^\circ$: from $60^\circ$ the opposite side is the long leg, $\sqrt3$.`], [t`\frac{\sqrt3}{2}`, t`That is $\sin 60^\circ$, opposite over hypotenuse.`], [t`\frac12`, t`That is $\cos 60^\circ$.`]],
          'sin 45': [['1', t`$1$ is opposite over adjacent, $\tan 45^\circ$. Divide by the hypotenuse, $\sqrt2$.`], [t`\sqrt2`, t`Upside down: hypotenuse over opposite. A sine is never more than $1$.`], [t`\frac12`, t`$\tfrac12$ is $\sin 30^\circ$.`]],
          'tan 45': [[t`\frac{\sqrt2}{2}`, t`That is $\sin 45^\circ$ (and $\cos 45^\circ$): opposite over hypotenuse. Tangent is opposite over adjacent.`], [t`\sqrt2`, t`$\sqrt2$ is the hypotenuse of the half square, not a ratio of its legs.`], [t`\frac{1}{\sqrt3}`, t`$1/\sqrt3$ is $\tan 30^\circ$.`]],
        };
        const k = r.pick(Object.keys(TABLE)), [f, ds] = k.split(' '), d = +ds, F = '\\' + f, key = exact(f, d);
        return {
          prompt: t`What is the exact value of $${F} ${d}^\circ$?`,
          visual: d === 45 ? triFig({ v: [[0, 0], [1, 0], [1, 1]], right: 1, angleAt: 0, angleLabel: '45°', sides: ['1', '1', '√2'], caption: t`Half a square: legs $1$ and $1$, hypotenuse $\sqrt2$.` }) : triFig({ v: [[0, 0], [Math.sqrt(3), 0], [Math.sqrt(3), 1]], right: 1, angleAt: 0, angleLabel: '30°', sides: ['√3', '1', '2'], caption: t`Half an equilateral triangle of side $2$: the $60^\circ$ angle is at the top.`, extra: { points: [{ x: 1.52, y: 0.62, r: 0, label: '60°', color: 'gold', labelDx: 0, labelDy: 0 }] } }),
          choices: [t`$\displaystyle ${key}$`, ...TABLE[k].map(([v]) => t`$\displaystyle ${v}$`)],
          answer: 0,
          why: Object.fromEntries(TABLE[k].map(([, w], i) => [i + 1, w])),
          hints: [t`Find the $${d}^\circ$ angle in the triangle and name its opposite and adjacent sides.`],
          teach: t`The $1, \sqrt3, 2$ and $1, 1, \sqrt2$ triangles give every exact value at $30^\circ$, $45^\circ$ and $60^\circ$.`,
          explain: t`From the triangle, $${F} ${d}^\circ = ${key}$ ($\approx ${sig(Math[f](d * D2R), 3)}$).`,
        };
      },
    }),
    num({
      id: 'tan-to-cos', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), ans = b / c;
        return {
          prompt: t`An acute angle has $\tan\theta = \dfrac{${a}}{${b}}$. What is $\cos\theta$, as a decimal?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a / c, feedback: t`That is $\sin\theta$: opposite over hypotenuse. Cosine uses the adjacent side, $${b}$.` }, { value: b / a, feedback: t`That is $1/\tan\theta$. Cosine needs the hypotenuse: find it with Pythagoras.` }],
          hints: [t`Draw a right triangle with opposite $${a}$ and adjacent $${b}$.`, t`The hypotenuse is $\sqrt{${a}^2 + ${b}^2} = ${c}$.`],
          teach: t`Given one ratio, sketch the triangle, complete it with Pythagoras, and read off the others.`,
          explain: t`Hypotenuse $\sqrt{${a * a} + ${b * b}} = ${c}$, so $\cos\theta = ${b}/${c} = ${sig(ans, 4)}$.`,
          visual: rightTri(b / 5, a / 5, [`${b}`, `${a}`, '?'], t`The triangle with opposite $${a}$ and adjacent $${b}$; the hypotenuse is for you to find.`),
        };
      },
    }),
    num({
      id: 'glide-slope', difficulty: 2,
      gen(r) {
        const d = r.pick([3, 4, 5, 6, 8]), ans = d * 1000 * Math.tan(3 * D2R);
        return {
          prompt: t`An airliner on final approach follows the standard $3.0^\circ$ glide slope. When it is $${d}$ km from the touchdown point, measured along the ground, how high is it, in metres?`,
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: d * 1000 * Math.cos(3 * D2R), feedback: t`$\cos 3^\circ \approx 1$: that is nearly the ground distance itself. The height is opposite the angle, the ground distance adjacent: use $\tan$.` }, { value: d * 1000 * Math.tan(3), feedback: t`That is $\tan$ of $3$ *radians*. Put the calculator in degree mode, or convert: $3^\circ = 0.0524$ rad.` }],
          hints: [t`Height opposite, ground distance adjacent: $h = d\tan 3^\circ$.`, t`Work in metres: $d = ${d * 1000}$ m.`],
          teach: t`Opposite $=$ adjacent $\times \tan\theta$.`,
          explain: t`$h = ${d * 1000}\ \text{m} \times \tan 3^\circ = ${d * 1000} \times ${sig(Math.tan(3 * D2R), 4)} = ${Math.round(ans)}$ m — roughly $50$ m of height per kilometre, the pilot’s rule of thumb of $300$ ft per nautical mile.`,
          visual: rightTri(10, 10 * Math.tan(9 * D2R), [`${d} km`, 'h', ''], t`Not to scale: the angle is drawn three times steeper than $3^\circ$ so that the triangle is visible.`),
        };
      },
    }),
    num({
      id: 'thrust-vertical', difficulty: 3,
      gen(r) {
        const T = r.pick([760, 900, 1200, 1800]), a = r.pick([15, 20, 25, 35, 40]), ans = T * Math.cos(a * D2R);
        return {
          prompt: t`During its pitch-over after launch, a rocket’s $${T}$ kN of thrust acts along its axis, which is now tilted $${a}^\circ$ away from the **vertical**. What is the vertical component of the thrust?`,
          answer: ans, units: 'kN', tol: { rel: 0.01 },
          errors: [{ value: T * Math.sin(a * D2R), feedback: t`That is the horizontal component. The angle is measured from the vertical, so the vertical side is *adjacent* to it: use $\cos$.` }, { value: T * Math.cos(a), feedback: t`That is the cosine of $${a}$ radians: check your calculator is in degree mode.` }],
          hints: [t`Draw the thrust as the hypotenuse with the vertical as one leg. Which leg touches the $${a}^\circ$ angle?`, t`The vertical leg is adjacent to the angle: $T\cos${a}^\circ$.`],
          teach: t`The component *along* the line the angle is measured from uses cosine; the component across it uses sine.`,
          explain: t`Vertical $= ${T}\cos ${a}^\circ = ${T} \times ${sig(Math.cos(a * D2R), 4)} = ${sig(ans, 3)}$ kN. The rest of the thrust, $${T}\sin ${a}^\circ = ${sig(T * Math.sin(a * D2R), 3)}$ kN, pushes the rocket downrange.`,
          visual: triFig({ v: [[0, 0], [0, Math.cos(a * D2R)], [Math.sin(a * D2R), Math.cos(a * D2R)]], right: 1, angleAt: 0, angleLabel: `${a}°`, sides: ['vertical', 'horizontal', `${T} kN`], caption: t`The thrust (the hypotenuse) and its two components; to scale. Gravity and drag are not drawn.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-guy-wire', difficulty: 2,
      gen(r) {
        const h = r.pick([12, 18, 24, 30]), a = r.pick([50, 55, 60, 65]), ans = h / Math.sin(a * D2R);
        return {
          prompt: t`A guy wire steadies a launch tower. It is fixed to the tower $${h}$ m above the ground and meets the ground at $${a}^\circ$. How long is the wire?`,
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: h * Math.sin(a * D2R), feedback: t`The wire is the hypotenuse, so it is *longer* than $${h}$ m: divide by $\sin${a}^\circ$, do not multiply.` }, { value: h / Math.cos(a * D2R), feedback: t`The height is opposite the $${a}^\circ$ angle at the ground: use $\sin$, not $\cos$.` }],
          hints: [t`The height is opposite the angle at the ground; the wire is the hypotenuse.`, t`$\sin${a}^\circ = ${h}/L$, so $L = ${h}/\sin${a}^\circ$.`],
          teach: t`When the unknown is the hypotenuse, it ends up in the denominator: $\text{hyp} = \text{opp}/\sin\theta$.`,
          explain: t`$L = \dfrac{${h}}{\sin ${a}^\circ} = \dfrac{${h}}{${sig(Math.sin(a * D2R), 4)}} = ${sig(ans, 3)}$ m.`,
          visual: rightTri(h / Math.tan(a * D2R), h, ['', `${h} m`, 'wire'], t`The wire as the hypotenuse, the tower as the vertical leg; to scale.`, {}, `${a}°`),
        };
      },
    }),
    num({
      id: 'cp-crater', difficulty: 3, transfer: true,
      gen(r) {
        const s = r.pick([1.6, 2.4, 3.2, 4.0]), e = r.pick([8, 10, 12, 15]), ans = s * Math.tan(e * D2R) * 1000;
        return {
          prompt: t`Near sunrise on the Moon, the Sun stands $${e}^\circ$ above the horizon. In an orbiter’s image, the rim of a crater casts a shadow $${s}$ km long across its flat floor. How deep is the crater, in metres?`,
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: s * Math.sin(e * D2R) * 1000, feedback: t`The shadow lies along the floor: it is the *adjacent* side, not the hypotenuse. Use $\tan$.` }, { value: (s / Math.tan(e * D2R)) * 1000, feedback: t`Upside down: depth $=$ shadow $\times \tan(\text{Sun’s elevation})$.` }].filter((x) => Math.abs(x.value - ans) > 0.02 * ans),
          hints: [t`The Sun’s ray grazing the rim is the hypotenuse; the shadow along the floor is adjacent to the $${e}^\circ$ angle; the depth is opposite it.`, t`Depth $= ${s}\ \text{km} \times \tan ${e}^\circ$.`],
          teach: t`Shadow lengths turn heights into horizontal distances: height $=$ shadow $\times \tan(\text{Sun’s elevation})$.`,
          explain: t`$d = ${s} \times \tan ${e}^\circ = ${s} \times ${sig(Math.tan(e * D2R), 4)} = ${sig(ans / 1000, 3)}$ km $\approx ${Math.round(ans)}$ m. Galileo estimated the heights of lunar mountains from their shadows in 1610; orbiters still do.`,
          visual: triFig({ v: [[0, 0], [10, 0], [0, 10 * Math.tan(e * D2R)]], right: 0, angleAt: 1, angleLabel: `${e}°`, sides: [`shadow ${s} km`, 'sunlight', 'depth'], caption: t`The rim at the top left, the shadow’s tip at the right. Drawn to scale for the Sun’s elevation; the floor is taken as flat.` }),
        };
      },
    }),
    mcq({
      id: 'cp-306090', difficulty: 2,
      gen(r) {
        const H = r.pick([4, 6, 10, 14]);
        return {
          prompt: t`A right triangle has a $60^\circ$ angle and a hypotenuse of $${H}$ cm. How long is the side opposite the $60^\circ$ angle?`,
          visual: triFig({ v: [[0, 0], [1, 0], [1, Math.sqrt(3)]], right: 1, angleAt: 0, angleLabel: '60°', sides: ['', '?', `${H} cm`], caption: t`Not labelled to scale: the shape is right, the sizes are yours to find.` }),
          choices: [t`$${H / 2}\sqrt3$ cm`, t`$${H / 2}$ cm`, t`$${H}\sqrt3$ cm`, t`$${H / 2}\sqrt2$ cm`],
          answer: 0,
          why: { 1: t`$${H / 2}$ cm is the side opposite the $30^\circ$ angle (the short leg, half the hypotenuse).`, 2: t`The legs are shorter than the hypotenuse; $${H}\sqrt3$ is longer.`, 3: t`$\sqrt2/2$ belongs to $45^\circ$, not $60^\circ$.` },
          hints: [t`Opposite $=$ hypotenuse $\times \sin 60^\circ$, and $\sin 60^\circ = \sqrt3/2$.`],
          teach: t`In a $30^\circ$–$60^\circ$–$90^\circ$ triangle the sides are in the ratio $1 : \sqrt3 : 2$.`,
          explain: t`$${H}\sin 60^\circ = ${H} \times \dfrac{\sqrt3}{2} = ${H / 2}\sqrt3 \approx ${sig((H / 2) * Math.sqrt(3), 3)}$ cm.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §5.4 Right Triangle Trigonometry', url: 'https://openstax.org/books/precalculus-2e/pages/5-4-right-triangle-trigonometry' },
  ],
});
void thou;
