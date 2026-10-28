// Quadric surfaces — the six second-degree surfaces, recognised from their
// traces and sign patterns: a cooling tower, the light cone of relativity,
// Newton's spinning bucket as a telescope mirror.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { pickExpr, is } from './_space.js';

const t = String.raw;
const TAU = 2 * Math.PI;

// The six quadrics, each drawn from (u, v) ∈ [−1, 1] × [0, 2π] with semi-axes a, b, c.
// surf(S): the parametrization (S is 1 when this type is drawn — the two-sheet
// hyperboloid needs a gap at u = 0, made by 0/0 there, and only when it is picked);
// rho(S): the scale of the horizontal trace at height k, x = aρ cos t, y = bρ sin t
// (NaN where there is none — guarded so it is finite when another type is picked);
// vert: the trace in the plane y = 0, for t ∈ [−1, 1], one or two branches.
const QUAD = [
  { name: 'ellipsoid', tex: t`\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} + \dfrac{z^2}{c^2} = 1`,
    surf: () => ['a*sin(pi*(u + 1)/2)*cos(v)', 'b*sin(pi*(u + 1)/2)*sin(v)', 'c*cos(pi*(u + 1)/2)'],
    rho: (S) => `sqrt(${S}*(1 - k^2/c^2) + 1 - ${S})`, vert: [['a*cos(pi*t)', '0', 'c*sin(pi*t)'], null] },
  { name: 'hyperboloid of one sheet', tex: t`\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} - \dfrac{z^2}{c^2} = 1`,
    surf: () => ['a*cosh(1.2*u)*cos(v)', 'b*cosh(1.2*u)*sin(v)', 'c*sinh(1.2*u)'],
    rho: () => 'sqrt(1 + k^2/c^2)', vert: [['a*cosh(1.2*t)', '0', 'c*sinh(1.2*t)'], ['-a*cosh(1.2*t)', '0', 'c*sinh(1.2*t)']] },
  { name: 'hyperboloid of two sheets', tex: t`-\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} + \dfrac{z^2}{c^2} = 1`,
    surf: (S) => ['a*sinh(1.5*abs(u))*cos(v)', 'b*sinh(1.5*abs(u))*sin(v)', `c*cosh(1.5*u)*u/(abs(u) + 1 - ${S})`],
    rho: (S) => `sqrt(${S}*(k^2/c^2 - 1) + 1 - ${S})`, vert: [['a*sinh(1.5*t)', '0', 'c*cosh(1.5*t)'], ['a*sinh(1.5*t)', '0', '-c*cosh(1.5*t)']] },
  { name: 'elliptic cone', tex: t`\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} - \dfrac{z^2}{c^2} = 0`,
    surf: () => ['1.6*a*u*cos(v)', '1.6*b*u*sin(v)', '1.6*c*u'],
    rho: () => 'abs(k)/c', vert: [['1.6*a*t', '0', '1.6*c*t'], ['-1.6*a*t', '0', '1.6*c*t']] },
  { name: 'elliptic paraboloid', tex: t`\dfrac{z}{c} = \dfrac{x^2}{a^2} + \dfrac{y^2}{b^2}`,
    surf: () => ['0.65*a*(u + 1)*cos(v)', '0.65*b*(u + 1)*sin(v)', 'c*(0.65*(u + 1))^2'],
    rho: (S) => `sqrt(${S}*k/c + 1 - ${S})`, vert: [['1.3*a*t', '0', 'c*(1.3*t)^2'], null] },
  { name: 'hyperbolic paraboloid', tex: t`\dfrac{z}{c} = \dfrac{x^2}{a^2} - \dfrac{y^2}{b^2}`,
    surf: () => ['1.5*a*u', '1.5*b*(v/pi - 1)', 'c*(2.25*u^2 - 2.25*(v/pi - 1)^2)'],
    rho: null, vert: [['1.5*a*t', '0', 'c*(1.5*t)^2'], null] },
];
const SEL = (j) => is('q', j);
const NAN_UNLESS = (cond) => `sqrt(${cond} - 1)`;   // NaN unless cond is 1, else 0

// the Explore's surface, traces and their guards, all as one set of expressions in q
const SURF = [0, 1, 2].map((k) => pickExpr('q', QUAD.map((Q, j) => Q.surf(SEL(j))[k])));
const RHO = `${pickExpr('q', QUAD.slice(0, 5).map((Q, j) => Q.rho(SEL(j))))} + sqrt(-${SEL(5)})`;
const K = 'k/c', SADDLE = SEL(5);
const hyper = (sgn) => [   // a branch of the saddle's horizontal trace x²/a² − y²/b² = k/c
  `step(${K})*(${sgn}*a*sqrt(abs(${K}))*cosh(t)) + (1 - step(${K}))*(a*sqrt(abs(${K}))*sinh(t)) + ${NAN_UNLESS(SADDLE)}`,
  `step(${K})*(b*sqrt(abs(${K}))*sinh(t)) + (1 - step(${K}))*(${sgn}*b*sqrt(abs(${K}))*cosh(t))`, 'k'];
const cross0 = (sgn) => [`a*t + ${NAN_UNLESS(`${SADDLE}*step(0.03 - abs(k))`)}`, `${sgn}*b*t`, 'k'];   // its two lines at k = 0
const VERT = [0, 1].map((br) => [0, 1, 2].map((k) => pickExpr('q', QUAD.map((Q) => (Q.vert[br] || Q.vert[0])[k])) + (br && k === 0 ? ` + sqrt(-(${SEL(0)} + ${SEL(4)} + ${SEL(5)}))` : '')));

// a still picture of one quadric, with optional horizontal trace at z = k (gold)
function picture(j, { a = 1, b = 1, c = 1, k = null, vert = false, caption, ...view } = {}) {
  const Q = QUAD[j], curves = [];
  if (k !== null && Q.rho) curves.push({ param: [`a*(${Q.rho(1)})*cos(t)`, `b*(${Q.rho(1)})*sin(t)`, 'k'], t: [0, TAU], color: 'gold' });
  if (vert) Q.vert.forEach((br) => br && curves.push({ param: br, t: [-1, 1], color: 'violet' }));
  return {
    type: 'surface3d',
    params: { surface: Q.surf(1), domain: [[-1, 1], [0, TAU]], constants: { a, b, c, k: k ?? 0 }, curves, ...view },
    caption: caption || 'Drag to rotate. The surface is cut off at a finite size.',
  };
}

// why a wrong name does not fit: the sign pattern each surface needs
const SIGNS = [
  'an ellipsoid has all three squares with plus signs and a positive constant',
  'a hyperboloid of one sheet has two plus squares and one minus square, equal to +1',
  'a hyperboloid of two sheets has one plus square and two minus squares, equal to +1',
  'a cone has squares of both signs equal to 0',
  'an elliptic paraboloid has one variable to the first power and the other two squared with the same sign',
  'a hyperbolic paraboloid has one variable to the first power and the other two squared with opposite signs',
];
// a random standard-form equation of type j, with denominators A, B, C (as TeX), z as the special axis
function eqTeX(j, A, B, C) {
  const sq = (v, d) => (d === 1 ? `${v}^2` : t`\dfrac{${v}^2}{${d}}`);
  switch (j) {
    case 0: return t`${sq('x', A)} + ${sq('y', B)} + ${sq('z', C)} = 1`;
    case 1: return t`${sq('x', A)} + ${sq('y', B)} - ${sq('z', C)} = 1`;
    case 2: return t`${sq('z', C)} - ${sq('x', A)} - ${sq('y', B)} = 1`;
    case 3: return t`${sq('x', A)} + ${sq('y', B)} = ${sq('z', C)}`;
    case 4: return t`z = ${sq('x', A)} + ${sq('y', B)}`;
    default: return t`z = ${sq('x', A)} - ${sq('y', B)}`;
  }
}
// the commonest confusions for each type
const CONFUSE = [[1, 4, 3], [2, 0, 3], [1, 3, 0], [1, 2, 4], [5, 3, 0], [4, 1, 3]];

export default lesson({
  id: 'math2210.C3-1.4',
  title: 'Quadric surfaces',
  minutes: 12, difficulty: 3,
  intro: t`A **quadric surface** is the graph of a second-degree equation in $x$, $y$ and $z$. Once it is shifted and turned to sit on the axes, every one (apart from cylinders and flat cases) is one of six types, and each is recognised by its **traces**: the curves cut by planes parallel to the coordinate planes. The sign pattern of the standard form tells you which:

$$\frac{x^2}{a^2} + \frac{y^2}{b^2} + \frac{z^2}{c^2} = 1,\quad \frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 1,\quad \frac{z^2}{c^2} - \frac{x^2}{a^2} - \frac{y^2}{b^2} = 1,\quad \frac{x^2}{a^2} + \frac{y^2}{b^2} = \frac{z^2}{c^2},\quad \frac{z}{c} = \frac{x^2}{a^2} \pm \frac{y^2}{b^2}$$

— the ellipsoid, the hyperboloids of one and two sheets, the cone, and the elliptic (+) and hyperbolic (−) paraboloids. **The odd one out — the variable with the different sign, or the one not squared — is the axis.**`,
  symbols: [
    { tex: 'a,\\ b,\\ c', text: t`the scales along $x$, $y$ and $z$ (semi-axes of an ellipsoid): stretch one and the surface stretches that way. With $a = b$ the surface is round about the $z$-axis` },
    { tex: '\\text{trace}', text: t`the curve where a plane $z = k$ (or $x = k$, $y = k$) cuts the surface: an ellipse, hyperbola, parabola, a pair of lines, a point, or nothing` },
    { tex: '\\pm 1,\\ 0', text: t`the constant decides between one sheet ($+1$ with one minus sign), two sheets ($+1$ with two minus signs) and the cone between them ($0$)` },
  ],
  why: t`Antenna dishes and telescope mirrors are paraboloids, cooling towers are hyperboloids of one sheet, Earth is close to an ellipsoid, a saddle point (C3-3.7) looks locally like a hyperbolic paraboloid — and in relativity the light cone is a cone, and the events a fixed proper time from you form a hyperboloid of two sheets.`,
  visual: {
    type: 'surface3d',
    title: 'Six quadrics and their traces',
    lead: t`Pick a quadric and drag to turn it. The gold curve is its trace in the horizontal plane $z = k$ — slide $k$ to move the plane up and down. The violet curve is its trace in the vertical plane $y = 0$. Change $a$, $b$ and $c$ to stretch it.`,
    tasks: [
      t`**One sheet**: slide $k$ — every horizontal trace is an ellipse, smallest at the waist $k = 0$, while the violet trace is a hyperbola.`,
      t`**Two sheets**: for $|k| < c$ there is no gold trace at all — that gap is what separates the sheets.`,
      t`**Saddle**: the horizontal traces are hyperbolas opening along $x$ for $k > 0$ and along $y$ for $k < 0$; at $k = 0$ they become two crossing lines.`,
    ],
    params: {
      surface: SURF, domain: [[-1, 1], [0, TAU]], n: 36,
      choices: [{ key: 'q', label: 'Quadric', options: [[0, 'Ellipsoid'], [1, 'One sheet'], [2, 'Two sheets'], [3, 'Cone'], [4, 'Paraboloid'], [5, 'Saddle']], value: 1, explain: 'One sheet and two sheets are the two hyperboloids; Paraboloid is the elliptic paraboloid and Saddle the hyperbolic one.' }],
      sliders: [
        { key: 'k', label: 'Trace height $k$', min: -2, max: 2, step: 0.05, value: 0.6, explain: 'The gold curve is where the plane $z = k$ cuts the surface.' },
        { key: 'a', label: '$a$', min: 0.5, max: 1.6, step: 0.05, value: 1.2, explain: 'The scale along $x$.' },
        { key: 'b', label: '$b$', min: 0.5, max: 1.6, step: 0.05, value: 0.8, explain: 'The scale along $y$.' },
        { key: 'c', label: '$c$', min: 0.5, max: 1.6, step: 0.05, value: 1, explain: 'The scale along $z$.' },
      ],
      curves: [
        { param: [`a*(${RHO})*cos(t)`, `b*(${RHO})*sin(t)`, 'k'], t: [0, TAU], color: 'gold' },
        { param: hyper(1), t: [-1.4, 1.4], color: 'gold' }, { param: hyper(-1), t: [-1.4, 1.4], color: 'gold' },
        { param: cross0(1), t: [-1.5, 1.5], color: 'gold' }, { param: cross0(-1), t: [-1.5, 1.5], color: 'gold' },
        { param: VERT[0], t: [-1, 1], color: 'violet' }, { param: VERT[1], t: [-1, 1], color: 'violet' },
      ],
    },
    caption: t`Drag to rotate; scroll or pinch to zoom. Every surface is cut off at a finite size — all but the ellipsoid go on without end. Gold: the trace in $z = k$. Violet: the trace in $y = 0$.`,
  },
  example: {
    prompt: t`The concrete shell of a power-station cooling tower follows $4x^2 + 4y^2 - z^2 + 160z = 10\,000$, with $z$ the height above the ground in metres. What kind of surface is it, how narrow is it at its waist, and how wide at the ground?`,
    visual: {
      type: 'surface3d',
      params: {
        surface: ['cosh(u)*cos(v)', 'cosh(u)*sin(v)', '(80 + 60*sinh(u))/30'], domain: [[-1.0986, 0.6251], [0, TAU]], n: 32, axisLen: 2.2, target: [0, 0, 2], dist: 10,
        curves: [{ param: ['cos(t)', 'sin(t)', '8/3'], t: [0, TAU], color: 'gold', width: 3 }, ...[0, 1, 2, 3, 4, 5].map((m) => ({ param: [`cos(${m}*pi/3) - t*sin(${m}*pi/3)`, `sin(${m}*pi/3) + t*cos(${m}*pi/3)`, '8/3 + 2*t'], t: [-4 / 3, 2 / 3], color: 'violet', width: 1.6 }))],
      },
      caption: 'Drag to rotate. The tower to scale, in units of 30 m (ground to 120 m). Gold: the waist, 80 m up. Violet: straight lines that lie entirely on the curved shell.',
    },
    steps: [
      { label: 'Complete the square', text: t`Group the $z$ terms: $-(z^2 - 160z) = -(z - 80)^2 + 6400$. So $4x^2 + 4y^2 - (z - 80)^2 = 10\,000 - 6400 = 3600$.` },
      { label: 'Standard form', text: t`Divide by $3600$: $\dfrac{x^2}{900} + \dfrac{y^2}{900} - \dfrac{(z - 80)^2}{3600} = 1$. Two plus squares, one minus square, constant $+1$: a **hyperboloid of one sheet**. The odd one out is $z$, so its axis is vertical, centred 80 m up.` },
      { label: 'Horizontal traces', text: t`At height $h$: $x^2 + y^2 = 900\left(1 + \frac{(h - 80)^2}{3600}\right)$, a circle. It is smallest where the bracket is smallest, at $h = 80$ m: radius $\sqrt{900} = 30$ m — the waist.` },
      { label: 'At the ground', text: t`$h = 0$: $x^2 + y^2 = 900\left(1 + \frac{6400}{3600}\right) = 2500$, radius $50$ m. (At a top height of 120 m the radius is $36$ m.)` },
      { label: 'Why builders like it', text: t`A hyperboloid of one sheet contains two families of straight lines (violet in the picture). The curved shell can be built from straight reinforcing bars, and the double curvature makes it stiff for its thickness.` },
    ],
    answer: t`A hyperboloid of one sheet about the vertical axis, $\frac{x^2 + y^2}{30^2} - \frac{(z - 80)^2}{60^2} = 1$: 30 m in radius at its waist, 80 m up, and 50 m at the ground.`,
  },
  practice: [
    mcq({
      id: 'name-it', difficulty: 2,
      gen(r) {
        const j = r.int(0, 5), [A, B, C] = [r.pick([1, 4, 9]), r.pick([4, 9, 16, 25]), r.pick([1, 4, 9])];
        const opts = [j, ...CONFUSE[j]];
        const why = {};
        const art = (n) => (/^[aeiou]/.test(n) ? 'an' : 'a');
        CONFUSE[j].forEach((w, i) => { why[i + 1] = t`Not ${art(QUAD[w].name)} ${QUAD[w].name}: ${SIGNS[w]}. Here ${SIGNS[j].replace(/^an? [a-z ]+ has /, 'the equation has ')}.`; });
        return {
          prompt: t`What surface is $${eqTeX(j, A, B, C)}$?`,
          choices: opts.map((k) => `${/^[aeiou]/.test(QUAD[k].name) ? 'An' : 'A'} ${QUAD[k].name}`),
          answer: 0, why,
          hints: ['Count the squared variables and their signs, and look at the constant.', t`${SIGNS.map((s) => s[0].toUpperCase() + s.slice(1)).join('; ')}.`],
          teach: 'Read a quadric from its standard form: which variables are squared, with which signs, and whether the constant is 1 or 0.',
          explain: t`${SIGNS[j][0].toUpperCase() + SIGNS[j].slice(1)} — so this is ${/^[aeiou]/.test(QUAD[j].name) ? 'an' : 'a'} ${QUAD[j].name}, with $z$ as its axis.`,
        };
      },
    }),
    mcq({
      id: 'which-axis', difficulty: 2,
      prompt: 'Which equation describes the surface in the picture? Turn it to see which axis it is built around.',
      choices: [t`$-x^2 + y^2 + z^2 = 1$`, t`$x^2 - y^2 - z^2 = 1$`, t`$x^2 + y^2 - z^2 = 1$`, t`$x^2 - y^2 + z^2 = 1$`],
      answer: 0,
      why: {
        1: t`Two minus signs and $+1$ make two sheets, with a gap between them; this surface is one connected tube.`,
        2: t`That tube is built around the $z$-axis (the odd sign is on $z$). This one runs along the $x$-axis.`,
        3: t`The odd sign is on $y$, so that tube runs along the $y$-axis.`,
      },
      hints: ['One connected tube with a waist is a hyperboloid of one sheet: two plus signs, one minus, = 1.', 'The variable with the minus sign is the axis the tube runs along.'],
      teach: 'In a hyperboloid the variable with the odd sign is the axis.',
      explain: t`The picture is a single tube with a waist — a hyperboloid of one sheet — running along the $x$-axis. Its cross-sections $x = k$ are the circles $y^2 + z^2 = 1 + k^2$, so the minus sign goes on $x$: $-x^2 + y^2 + z^2 = 1$.`,
      visual: { type: 'surface3d', params: { surface: ['sinh(1.1*u)', 'cosh(1.1*u)*cos(v)', 'cosh(1.1*u)*sin(v)'], domain: [[-1, 1], [0, TAU]] }, caption: 'Drag to rotate. The surface is cut off at a finite size.' },
    }),
    mcq({
      id: 'trace-shape', difficulty: 2,
      prompt: t`What is the trace of the saddle $z = \dfrac{x^2}{4} - \dfrac{y^2}{9}$ in the plane $z = 1$?`,
      choices: [t`A hyperbola opening along the $x$-axis, $\frac{x^2}{4} - \frac{y^2}{9} = 1$`, 'An ellipse', 'A parabola', 'Two crossing lines'],
      answer: 0,
      why: {
        1: t`An ellipse needs both squares with the same sign: $\frac{x^2}{4} + \frac{y^2}{9} = 1$. Here they have opposite signs.`,
        2: t`Parabolas are the **vertical** traces: fixing $y$ leaves $z = \frac{x^2}{4} - \text{const}$. A horizontal plane fixes $z$ instead.`,
        3: t`Crossing lines are the trace at $z = 0$ only, where $\frac{x^2}{4} = \frac{y^2}{9}$.`,
      },
      hints: [t`Set $z = 1$: what equation in $x$ and $y$ is left?`, 'Two squares with opposite signs, equal to a positive number, make a hyperbola; it opens along the variable with the plus sign.'],
      teach: 'Fix the variable that defines the plane and read the curve that is left.',
      explain: t`With $z = 1$: $\frac{x^2}{4} - \frac{y^2}{9} = 1$, a hyperbola whose branches cross the $x$-axis at $x = \pm2$. At negative heights the trace opens along $y$ instead.`,
      visual: picture(5, { a: 1, b: 1, c: 0.7, caption: 'Drag to rotate. The saddle (scales not to the numbers in the question).' }),
    }),
    num({
      id: 'ellipsoid-trace', difficulty: 2,
      gen(r) {
        const [c, k, s] = r.pick([[5, 3, 0.8], [5, 4, 0.6], [13, 5, 12 / 13], [13, 12, 5 / 13], [10, 6, 0.8], [10, 8, 0.6]]);
        const a = r.pick([2, 3, 4, 6]), b = r.pick([3, 5, 7].filter((x) => x !== a)), ans = a * s;
        const S = 1.6 / c;
        return {
          prompt: t`The plane $z = ${k}$ cuts the ellipsoid $\dfrac{x^2}{${a * a}} + \dfrac{y^2}{${b * b}} + \dfrac{z^2}{${c * c}} = 1$ in an ellipse. How far does that ellipse reach along the $x$-direction — what is its semi-axis in $x$?`,
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: a, feedback: t`That is the ellipsoid’s own semi-axis, the trace at $z = 0$. Higher up the trace is smaller.` }, { value: a * (1 - (k * k) / (c * c)), feedback: t`The scale factor is the square root, $\sqrt{1 - k^2/c^2}$.` }],
          hints: [t`Put $z = ${k}$: $\dfrac{x^2}{${a * a}} + \dfrac{y^2}{${b * b}} = 1 - \dfrac{${k * k}}{${c * c}}$.`, t`Divide through so the right side is 1: each semi-axis shrinks by $\sqrt{1 - ${k * k}/${c * c}}$.`],
          teach: 'A horizontal slice of an ellipsoid is a smaller copy of its equator, scaled by √(1 − k²/c²).',
          explain: t`$1 - \frac{${k * k}}{${c * c}} = ${nice(s * s, 4)}$, so the trace is $\frac{x^2}{(${a}\cdot${nice(s, 4)})^2} + \frac{y^2}{(${b}\cdot${nice(s, 4)})^2} = 1$: its semi-axis in $x$ is $${a}\times${nice(s, 4)} = ${nice(ans, 4)}$.`,
          visual: picture(0, { a: a * S, b: b * S, c: c * S, k: k * S, caption: 'Drag to rotate. The ellipsoid, scaled down to fit, and in gold its trace in the plane z = k.' }),
        };
      },
    }),
    num({
      id: 'vertex', difficulty: 3,
      gen(r) {
        const p = r.intExcept(-3, 3, [0]), q = r.intExcept(-3, 3, [0]), zmin = r.int(-4, 5), s = zmin + p * p + q * q;
        const lin = `${p > 0 ? '-' : '+'} ${2 * Math.abs(p)}x ${q > 0 ? '-' : '+'} ${2 * Math.abs(q)}y`;
        return {
          prompt: t`The paraboloid $z = x^2 + y^2 ${lin} ${s < 0 ? '-' : '+'} ${Math.abs(s)}$ is a bowl. How high is its lowest point?`,
          answer: zmin, tol: { rel: 1e-9, abs: 1e-9 },
          errors: [{ value: s, feedback: 'The constant term is the height above the origin, not at the bottom of the bowl: complete the squares first.' }, { value: s + p * p + q * q, feedback: t`Completing the square subtracts: $x^2 - 2px = (x - p)^2 - p^2$.` }].filter((e) => e.value !== zmin),
          hints: [t`Complete the square in $x$ and in $y$ separately.`, t`$x^2 ${p > 0 ? '-' : '+'} ${2 * Math.abs(p)}x = (x ${p > 0 ? '-' : '+'} ${Math.abs(p)})^2 - ${p * p}$, and likewise for $y$.`],
          teach: 'Completing the square moves a quadric’s centre or vertex into view.',
          explain: t`$z = (x ${p > 0 ? '-' : '+'} ${Math.abs(p)})^2 + (y ${q > 0 ? '-' : '+'} ${Math.abs(q)})^2 + ${s} - ${p * p} - ${q * q}$, so the bottom is at $(${p}, ${q})$ with $z = ${zmin}$.`,
          visual: { type: 'surface3d', params: { surface: [`${p} + 2.2*u*cos(v)`, `${q} + 2.2*u*sin(v)`, `0.35*(2.2*u)^2 + 0.35*${zmin}`], domain: [[0, 1], [0, TAU]], target: [p, q, 0.5], axisLen: 4.5, dist: 13 }, caption: 'Drag to rotate. The bowl, heights shrunk to fit (the axes start at the origin).' },
        };
      },
    }),
    mcq({
      id: 'from-traces', difficulty: 2,
      prompt: 'A surface has been drawn as a wire frame of its traces: horizontal ellipses that grow steadily the farther they are from the floor, a single point at the floor itself, and two straight lines crossing there in each vertical plane through the z-axis. What surface is it?',
      choices: ['An elliptic cone', 'A hyperboloid of one sheet', 'An elliptic paraboloid', 'A hyperboloid of two sheets'],
      answer: 0,
      why: {
        1: 'A hyperboloid of one sheet has a waist: its smallest horizontal trace is an ellipse, not a point, and its vertical traces are hyperbolas.',
        2: 'A paraboloid exists on one side of its vertex only, and its vertical traces are parabolas, not straight lines.',
        3: 'Two sheets leave a gap with no traces at all around the floor; here there is a point at z = 0.',
      },
      hints: ['Which quadric has straight lines through one point?', 'Ellipses growing in proportion to |z| mean x²/a² + y²/b² = z²/c².'],
      teach: 'A cone is the borderline between the two hyperboloids: its traces shrink to a point and its vertical sections are straight lines.',
      explain: t`Ellipses whose size grows in proportion to $|z|$, a point at $z = 0$ and straight lines through it: the elliptic cone $\frac{x^2}{a^2} + \frac{y^2}{b^2} = \frac{z^2}{c^2}$, the borderline case between the hyperboloids of one and two sheets.`,
      visual: { type: 'calc-vectors3d', params: { range: 2.4, curves: [-1.6, -1.1, -0.6, 0.6, 1.1, 1.6].map((h) => ({ param: [`${1.2 * Math.abs(h)}*cos(t)`, `${0.8 * Math.abs(h)}*sin(t)`, `${h}`], t: [0, TAU], color: 'gold' })), segments: [[1.2, 0], [-1.2, 0], [0, 0.8], [0, -0.8]].map(([x, y]) => ({ from: [-1.7 * x, -1.7 * y, -1.7], to: [1.7 * x, 1.7 * y, 1.7], color: 'violet' })), points: [{ at: [0, 0, 0], color: 'gold', r: 4 }] }, caption: 'Drag to rotate. The traces: gold horizontal ones, violet ones in the planes x = 0 and y = 0.' },
    }),
    mcq({
      id: 'light-cone', difficulty: 3,
      prompt: t`In relativity, draw two space dimensions and time, in units with $c = 1$. The **light cone** of the origin event is $x^2 + y^2 - t^2 = 0$. What surface is $x^2 + y^2 - t^2 = -1$ — every event that a clock moving at constant velocity from the origin reaches after a proper time of 1?`,
      choices: ['A hyperboloid of two sheets, one inside the future cone and one inside the past cone', 'A hyperboloid of one sheet wrapped around the cone', 'A sphere of radius 1', 'A second, wider cone'],
      answer: 0,
      why: {
        1: t`That is $x^2 + y^2 - t^2 = +1$: events a proper **distance** 1 away, outside the cone. With $-1$, the equation reads $t^2 = 1 + x^2 + y^2$, so $|t| \ge 1$.`,
        2: t`A sphere needs all three squares with the same sign. Time enters with the opposite sign — that minus is what makes spacetime geometry different from space geometry.`,
        3: 'A cone has 0 on the right-hand side; a nonzero constant opens it into a hyperboloid.',
      },
      hints: [t`Rearrange: $t^2 = 1 + x^2 + y^2$. Can $t$ be between $-1$ and $1$?`, 'One plus square and two minus squares (in the form t² − x² − y² = 1) give two sheets.'],
      teach: 'Flip the sign pattern of a cone’s constant and it opens into a hyperboloid: one sheet outside it, two sheets inside it.',
      explain: t`$t^2 - x^2 - y^2 = 1$ has two sheets, $t \ge 1$ and $t \le -1$, sitting inside the future and past light cones and approaching them far from the axis. They are the 3D version of the invariant hyperbolae of special relativity: every inertial observer agrees on them.`,
      visual: picture(3, { a: 1, b: 1, c: 1, axisLabels: ['x', 'y', 't'], caption: t`Drag to rotate. The light cone $x^2 + y^2 = t^2$ (with $c = 1$), cut off at a finite size; time runs up.` }),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-identify', difficulty: 2,
      prompt: 'Which equation describes the surface in the picture?',
      choices: [t`$z^2 - x^2 - y^2 = 1$`, t`$x^2 + y^2 - z^2 = 1$`, t`$x^2 + y^2 - z^2 = 0$`, t`$z = x^2 + y^2$`],
      answer: 0,
      why: { 1: 'That is one connected tube; the picture has two separate pieces.', 2: 'A cone is a single connected surface through the origin.', 3: 'A paraboloid is a single bowl.' },
      hints: ['Count the pieces.', 'Two pieces separated by a gap: two minus signs and = 1.'],
      teach: 'Two separate sheets mean a hyperboloid of two sheets: one plus square, two minus squares, equal to 1.',
      explain: t`Two separate bowls, opening up and down along the $z$-axis with a gap between $z = -1$ and $z = 1$: $z^2 - x^2 - y^2 = 1$.`,
      visual: picture(2, { caption: 'Drag to rotate. The surface, cut off at a finite size.' }),
    }),
    num({
      id: 'cp-waist', difficulty: 2,
      gen(r) {
        const [a2, c2, k] = r.pick([[9, 16, 4], [4, 9, 3], [16, 9, 3], [25, 4, 2], [9, 4, 6]]);
        const R = Math.sqrt(a2 * (1 + (k * k) / c2));
        return {
          prompt: t`How large is the radius of the trace of $\dfrac{x^2 + y^2}{${a2}} - \dfrac{z^2}{${c2}} = 1$ in the plane $z = ${k}$? Give 3 significant figures.`,
          answer: R, tol: { rel: 0.003 },
          errors: [{ value: Math.sqrt(a2), feedback: 'That is the radius of the waist, at z = 0.' }, { value: Math.sqrt(a2 * Math.abs(1 - (k * k) / c2)), feedback: t`The $z^2$ term has a minus sign: moving it across makes the right-hand side $1 + \frac{z^2}{${c2}}$.` }],
          hints: [t`Put $z = ${k}$ and solve for $x^2 + y^2$.`],
          teach: 'Fix z and solve for x² + y²: the trace of a hyperboloid of one sheet grows away from its waist.',
          explain: t`$x^2 + y^2 = ${a2}\left(1 + \frac{${k * k}}{${c2}}\right) = ${nice(R * R, 4)}$, so the radius is $${nice(R, 4)}$.`,
          visual: picture(1, { a: Math.sqrt(a2) / 3, b: Math.sqrt(a2) / 3, c: Math.sqrt(c2) / 3, k: k / 3, caption: 'Drag to rotate. The hyperboloid (scaled by one third) and, in gold, its trace at the given height.' }),
        };
      },
    }),
    num({
      id: 'cp-liquid-mirror', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([6, 7, 8.5, 10]), g = 9.81, w = (2 * Math.PI) / T, f = g / (2 * w * w);
        return {
          prompt: t`Spin a dish of liquid about a vertical axis at angular speed $\omega$ and its surface settles into the paraboloid $z = \dfrac{\omega^2}{2g}(x^2 + y^2)$ — Newton’s bucket. A paraboloid $z = \dfrac{x^2 + y^2}{4f}$ focuses light at height $f$ above its vertex. What is the focal length of a liquid-mercury telescope mirror that turns once every ${T} s? ($g = 9.81$ m/s².)`,
          answer: f, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: g / (w * w), feedback: t`Match the coefficients: $\frac{1}{4f} = \frac{\omega^2}{2g}$ gives $f = \frac{g}{2\omega^2}$.` }, { value: g / (2 * (1 / T) ** 2), feedback: t`$\omega$ is an angular speed: $\omega = 2\pi/T$ rad/s, not $1/T$.` }],
          hints: [t`$\omega = \dfrac{2\pi}{${T}\ \text{s}}$.`, t`Compare $\dfrac{\omega^2}{2g}$ with $\dfrac{1}{4f}$.`],
          teach: 'Two paraboloids are the same surface when their coefficients of x² + y² match.',
          explain: t`$\omega = 2\pi/${T} = ${nice(w, 4)}$ rad/s, and $\frac{1}{4f} = \frac{\omega^2}{2g}$ gives $f = \frac{g}{2\omega^2} = ${fmt(f, 3)}$ m. The 6 m Large Zenith Telescope in Canada used exactly this trick: mercury spinning once every 8.5 s, focal length 9.0 m. It can only point straight up — tilt it and the paraboloid spills.`,
          visual: picture(4, { a: 1, b: 1, c: 0.6, caption: 'Drag to rotate. A spinning liquid’s surface: a paraboloid about the spin axis (shape only, not to scale).' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.6 Quadric Surfaces', url: 'https://openstax.org/books/calculus-volume-3/pages/2-6-quadric-surfaces' },
    { label: 'Hickson et al., The Large Zenith Telescope: a 6 m liquid-mirror telescope (PASP 119, 444, 2007)', url: 'https://doi.org/10.1086/517619' },
  ],
});
