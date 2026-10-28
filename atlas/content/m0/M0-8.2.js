// Sum, difference and double-angle formulas — sin(a + b) = sin a cos b + cos a sin b, never sin a + sin b.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { PI, D2R, circleFig, trigGraph } from './_m0trig.js';

const t = String.raw;
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
const HOP = { v: 20, g: 1.62 };

export default lesson({
  id: 'm0.M0-8.2',
  title: 'Sum, difference and double-angle formulas',
  minutes: 10, difficulty: 3,
  intro: t`Sine is not linear: $\sin(30^\circ + 60^\circ) = \sin 90^\circ = 1$, while $\sin 30^\circ + \sin 60^\circ \approx 1.37$ — more than any sine can be. The correct rule mixes sines and cosines:

$$\sin(a \pm b) = \sin a\cos b \pm \cos a\sin b$$

and its partner $\cos(a \pm b) = \cos a\cos b \mp \sin a\sin b$ (note the flipped sign). Both come from rotating the point at angle $a$ on the unit circle by a further $b$. Put $b = a$ and you get the **double-angle formulas**: $\sin 2a = 2\sin a\cos a$ and $\cos 2a = \cos^2 a - \sin^2 a = 1 - 2\sin^2 a = 2\cos^2 a - 1$. Turned around, the last two are the **power-reduction** formulas, $\sin^2 a = \tfrac12(1 - \cos 2a)$ and $\cos^2 a = \tfrac12(1 + \cos 2a)$.`,
  symbols: [
    { tex: 'a,\\ b', text: 'any two angles (radians or degrees, the same in both)' },
    { tex: '\\pm,\\ \\mp', text: 'read the top signs together or the bottom signs together: $\\cos(a + b)$ takes the minus' },
    { tex: '2a', text: 'twice the angle $a$ — the double angle' },
  ],
  why: t`Rotating a vector by an angle (attitude changes, coordinate frames), adding two oscillations, the beat between two tuning forks, the range of a projectile, $v^2\sin 2\theta/g$, and the integral $\int\sin^2 x\,dx$ in Calculus II all run on these formulas.`,
  visual: {
    type: 'graph',
    title: 'Rotate by a, then by b',
    lead: t`The blue ray is at angle $a$, the gold ray at $a + b$. The gold point’s height is $\sin(a + b)$. The violet dashed line is at the height $\sin a + \sin b$ that the tempting wrong rule predicts.`,
    tasks: [
      t`Set $a = 30^\circ$, $b = 60^\circ$: the gold point is at the top, height $1$; the violet line is at $1.37$ — above the circle, impossible.`,
      t`Compare the readouts: $\sin a\cos b + \cos a\sin b$ always equals $\sin(a + b)$, whatever you do.`,
      t`Set $b = a$: the gold angle is $2a$, and $2\sin a\cos a$ is its sine.`,
    ],
    params: {
      x: [-1.6, 1.6], y: [-1.25, 2.15], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false,
      sliders: [
        { key: 'a', label: t`Angle $a$`, min: 0, max: 180, step: 1, value: 30, unit: '^\\circ', explain: t`The first rotation, from the positive $x$-axis.` },
        { key: 'b', label: t`Angle $b$`, min: 0, max: 180, step: 1, value: 45, unit: '^\\circ', explain: t`The second rotation, added on top of $a$.` },
      ],
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, N(2 * PI)], color: 'ink3', width: 1.5 },
        { param: ['t*cos(a*pi/180)', 't*sin(a*pi/180)'], t: [0, 1], color: 'accent', width: 2.6 },
        { param: ['t*cos((a + b)*pi/180)', 't*sin((a + b)*pi/180)'], t: [0, 1], color: 'gold', width: 2.6 },
        { param: ['0.35*cos(t)', '0.35*sin(t)'], t: [0, 'a*pi/180'], color: 'accent', width: 1.8 },
        { param: ['0.5*cos(t)', '0.5*sin(t)'], t: ['a*pi/180', '(a + b)*pi/180'], color: 'gold', width: 1.8 },
        { param: ['cos((a + b)*pi/180)', 't*sin((a + b)*pi/180)'], t: [0, 1], color: 'gold', width: 1.4, dash: true },
      ],
      hlines: [{ y: 'sin(a*pi/180) + sin(b*pi/180)', color: 'violet', label: 'sin a + sin b' }],
      points: [
        { x: 'cos(a*pi/180)', y: 'sin(a*pi/180)', color: 'accent', r: 4.5 },
        { x: 'cos((a + b)*pi/180)', y: 'sin((a + b)*pi/180)', color: 'gold', r: 5.5, label: 'a + b', labelDx: 8, labelDy: -10 },
      ],
      readouts: [
        { label: t`$\sin(a + b)$`, expr: 'sin((a + b)*pi/180)', digits: 4 },
        { label: t`$\sin a\cos b + \cos a\sin b$`, expr: 'sin(a*pi/180)*cos(b*pi/180) + cos(a*pi/180)*sin(b*pi/180)', digits: 4 },
        { label: t`$\sin a + \sin b$`, expr: 'sin(a*pi/180) + sin(b*pi/180)', digits: 4 },
      ],
    },
    caption: t`To scale on a unit circle. The gold dashed drop shows the height $\sin(a + b)$.`,
  },
  example: {
    prompt: t`Find the exact value of $\sin 75^\circ$.`,
    visual: circleFig({ th: 75 * D2R, legs: true, legLabels: false, pLabel: '75°', caption: t`$75^\circ = 45^\circ + 30^\circ$: two angles whose sines and cosines are known exactly.`, extra: { curves: [{ param: [`t*${N(Math.cos(PI / 4))}`, `t*${N(Math.sin(PI / 4))}`], t: [0, 1], color: 'accent', width: 1.4, dash: true }] } }),
    steps: [
      { label: 'Split the angle', text: t`$75^\circ = 45^\circ + 30^\circ$, two special angles.` },
      { label: 'Apply the formula', text: t`$\sin 75^\circ = \sin 45^\circ\cos 30^\circ + \cos 45^\circ\sin 30^\circ$.` },
      { label: 'Substitute', text: t`$= \dfrac{\sqrt2}{2}\cdot\dfrac{\sqrt3}{2} + \dfrac{\sqrt2}{2}\cdot\dfrac12 = \dfrac{\sqrt6 + \sqrt2}{4}$.` },
      { label: 'Check', text: t`$\dfrac{2.449 + 1.414}{4} = ${sig((Math.sqrt(6) + Math.sqrt(2)) / 4, 4)}$, and a calculator gives $\sin 75^\circ = ${sig(Math.sin(75 * D2R), 4)}$ ✓. The wrong rule, $\sin 45^\circ + \sin 30^\circ = 1.207$, is more than $1$.` },
    ],
    answer: t`$\sin 75^\circ = \dfrac{\sqrt6 + \sqrt2}{4} \approx ${sig(Math.sin(75 * D2R), 4)}$.`,
  },
  practice: [
    mcq({
      id: 'sum-myth', difficulty: 1,
      prompt: t`What is $\sin(30^\circ + 60^\circ)$?`,
      visual: circleFig({ th: PI / 2, legs: false, pLabel: '90°', caption: t`$30^\circ + 60^\circ$ is a quarter turn.`, extra: { curves: [{ param: [`t*${N(Math.cos(PI / 6))}`, `t*${N(Math.sin(PI / 6))}`], t: [0, 1], color: 'accent', width: 1.4, dash: true }] } }),
      choices: [t`$1$`, t`$\dfrac{1 + \sqrt3}{2}$`, t`$\dfrac{\sqrt3}{4}$`, t`$\dfrac12$`],
      answer: 0,
      why: {
        1: t`That is $\sin 30^\circ + \sin 60^\circ \approx 1.37$ — more than $1$, which no sine can be. Sine does not distribute over a sum.`,
        2: t`That is $\sin 30^\circ\sin 60^\circ$. The sum formula multiplies a sine by a *cosine*: $\sin a\cos b + \cos a\sin b$.`,
        3: t`$\tfrac12$ is $\sin 30^\circ$ alone.`,
      },
      hints: [t`Add the angles first.`],
      teach: t`$\sin(a + b) \neq \sin a + \sin b$: add the angles, or use $\sin a\cos b + \cos a\sin b$.`,
      explain: t`$\sin 90^\circ = 1$. By the formula: $\tfrac12\cdot\tfrac12 + \tfrac{\sqrt3}{2}\cdot\tfrac{\sqrt3}{2} = \tfrac14 + \tfrac34 = 1$ ✓.`,
    }),
    num({
      id: 'cos-diff', difficulty: 2,
      gen(r) {
        const [p, q, s] = r.pick(TRIPLES), [u, v, w] = r.pick(TRIPLES.filter((x) => x[2] !== s));
        const ca = q / s, sa = p / s, cb = v / w, sb = u / w, ans = ca * cb + sa * sb;
        return {
          prompt: t`Acute angles $a$ and $b$ have $\sin a = \tfrac{${p}}{${s}}$ and $\sin b = \tfrac{${u}}{${w}}$. Find $\cos(a - b)$, as a decimal.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ca * cb - sa * sb, feedback: t`That is $\cos(a + b)$. For a *difference* the sign flips: $\cos(a - b) = \cos a\cos b + \sin a\sin b$.` }, { value: ca - cb, feedback: t`Cosine does not distribute: $\cos(a - b) \neq \cos a - \cos b$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`First $\cos a = \sqrt{1 - \sin^2 a}$ and $\cos b = \sqrt{1 - \sin^2 b}$ (both positive: the angles are acute).`, t`$\cos(a - b) = \cos a\cos b + \sin a\sin b$.`],
          teach: t`$\cos(a \mp b) = \cos a\cos b \pm \sin a\sin b$ — the sign is opposite to the one inside.`,
          explain: t`$\cos a = \tfrac{${q}}{${s}}$, $\cos b = \tfrac{${v}}{${w}}$, so $\cos(a - b) = \tfrac{${q}}{${s}}\cdot\tfrac{${v}}{${w}} + \tfrac{${p}}{${s}}\cdot\tfrac{${u}}{${w}} = \tfrac{${q * v + p * u}}{${s * w}} = ${sig(ans, 4)}$.`,
          visual: circleFig({ th: Math.asin(sa), legs: false, pLabel: 'a', caption: t`The two angles on the unit circle: $a$ (solid) and $b$ (dashed).`, extra: { curves: [{ param: [`t*${N(cb)}`, `t*${N(sb)}`], t: [0, 1], color: 'violet', width: 2, dash: true }], points: [{ x: N(cb), y: N(sb), color: 'violet', r: 4.5, label: 'b', labelDx: 8, labelDy: 8 }] } }),
        };
      },
    }),
    num({
      id: 'double-sin', difficulty: 2,
      gen(r) {
        const [p, q, s] = r.pick(TRIPLES), sa = p / s, ca = q / s, ans = 2 * sa * ca;
        return {
          prompt: t`An acute angle has $\sin\theta = \tfrac{${p}}{${s}}$. Find $\sin 2\theta$, as a decimal.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * sa, feedback: t`$\sin 2\theta \neq 2\sin\theta$ — that can exceed $1$. Use $\sin 2\theta = 2\sin\theta\cos\theta$.` }, { value: sa * ca, feedback: t`Missing the factor $2$: $\sin 2\theta = 2\sin\theta\cos\theta$.` }],
          hints: [t`$\cos\theta = \sqrt{1 - \sin^2\theta} = \tfrac{${q}}{${s}}$.`, t`$\sin 2\theta = 2\sin\theta\cos\theta$.`],
          teach: t`$\sin 2\theta = 2\sin\theta\cos\theta$: doubling the angle does not double the sine.`,
          explain: t`$\sin 2\theta = 2\cdot\tfrac{${p}}{${s}}\cdot\tfrac{${q}}{${s}} = \tfrac{${2 * p * q}}{${s * s}} = ${sig(ans, 4)}$.`,
          visual: circleFig({ th: 2 * Math.asin(sa), legs: true, legLabels: false, pLabel: '2θ', caption: t`The doubled angle $2\theta$ (gold arc); its sine is the orange leg.`, extra: { curves: [{ param: [`t*${N(ca)}`, `t*${N(sa)}`], t: [0, 1], color: 'accent', width: 1.4, dash: true }], points: [{ x: N(ca), y: N(sa), color: 'accent', r: 4, label: 'θ', labelDx: 8, labelDy: 6 }] } }),
        };
      },
    }),
    num({
      id: 'double-cos', difficulty: 2,
      gen(r) {
        const s = r.pick([0.2, 0.3, 0.6, 0.8, 0.9]), ans = 1 - 2 * s * s;
        return {
          prompt: t`If $\sin\theta = ${s}$, what is $\cos 2\theta$? (No need to know the quadrant.)`,
          answer: ans, tol: { rel: 0.005, abs: 1e-9 },
          errors: [{ value: 1 - s * s, feedback: t`That is $\cos^2\theta$. The double angle subtracts *twice* $\sin^2\theta$: $\cos 2\theta = 1 - 2\sin^2\theta$.` }, { value: 2 * Math.sqrt(1 - s * s), feedback: t`$\cos 2\theta \neq 2\cos\theta$. Use $\cos 2\theta = 1 - 2\sin^2\theta$.` }, { value: 1 - 2 * s, feedback: t`Square the sine: $1 - 2\sin^2\theta = 1 - 2(${s})^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Of the three forms of $\cos 2\theta$, use the one with only $\sin\theta$ in it.`],
          teach: t`$\cos 2\theta = 1 - 2\sin^2\theta$ needs only the sine — and its sign does not matter.`,
          explain: t`$\cos 2\theta = 1 - 2(${s})^2 = 1 - ${sig(2 * s * s, 4)} = ${sig(ans, 4)}$. Both quadrants with $\sin\theta = ${s}$ give the same answer, because $\sin^2$ ignores the sign of the cosine.`,
          visual: trigGraph({ curves: [{ fn: 'sin(x)', color: 'warn', label: 'sin x', labelAt: N(PI / 2), labelDx: -14, labelDy: -12 }, { fn: 'cos(2*x)', color: 'accent', label: 'cos 2x', labelAt: 0.05, labelDx: 4, labelDy: -12 }], extra: { hlines: [{ y: s, color: 'gold' }] }, caption: t`$\sin x$ (orange), $\cos 2x$ (blue) and the level $\sin x = ${s}$: at both crossings $\cos 2x$ has the same value.` }),
        };
      },
    }),
    expr({
      id: 'power-reduce', difficulty: 3,
      gen(r) {
        const k = r.pick(['sq', 'prod']);
        if (k === 'sq') {
          return {
            prompt: t`Write $\sin^2 x$ in terms of $\cos 2x$ (no sines allowed).`,
            lhs: '\\sin^2 x', answer: '(1 - cos(2x))/2', answerTeX: t`\tfrac12(1 - \cos 2x)`, vars: { x: [-2, 2] }, forbid: ['sin'],
            errors: [{ answer: '(1 + cos(2x))/2', feedback: t`That is $\cos^2 x$. At $x = 0$, $\sin^2 x = 0$, so the bracket must vanish there: $1 - \cos 0 = 0$.` }, { answer: 'cos(2x)', feedback: t`$\cos 2x$ swings between $-1$ and $1$, but a square never goes negative. Start from $\cos 2x = 1 - 2\sin^2 x$ and solve for $\sin^2 x$.` }],
            hints: [t`Start from $\cos 2x = 1 - 2\sin^2 x$.`, t`Solve it for $\sin^2 x$.`],
            teach: t`$\sin^2 x = \tfrac12(1 - \cos 2x)$: the square of a sinusoid is a sinusoid of twice the frequency about a midline of $\tfrac12$.`,
            explain: t`From $\cos 2x = 1 - 2\sin^2 x$: $\sin^2 x = \tfrac12(1 - \cos 2x)$. This is how $\int \sin^2 x\,dx$ is done in Calculus II.`,
            visual: trigGraph({ curves: [{ fn: 'sin(x)^2', color: 'accent', label: 'sin²x', labelAt: N(PI / 2), labelDx: 6, labelDy: -12 }, { fn: 'cos(2*x)', color: 'ink3', dash: true, width: 1.3, label: 'cos 2x', labelAt: N(PI), labelDx: 6, labelDy: -12 }], y: [-1.3, 1.4], caption: t`$\sin^2 x$ (blue) is a wave of twice the frequency, swinging about $y = \tfrac12$ — like $\cos 2x$ (dashed) turned over, shrunk and lifted.` }),
          };
        }
        return {
          prompt: t`Write $\sin x\cos x$ in terms of $\sin 2x$ (no cosines allowed).`,
          lhs: '\\sin x\\cos x', answer: 'sin(2x)/2', answerTeX: t`\tfrac12\sin 2x`, vars: { x: [-2, 2] }, forbid: ['cos'],
          errors: [{ answer: 'sin(2x)', feedback: t`$\sin 2x = 2\sin x\cos x$, so $\sin x\cos x$ is **half** of it.` }, { answer: '2sin(2x)', feedback: t`Divide by $2$, do not multiply: $\sin x\cos x = \tfrac12\sin 2x$.` }],
          hints: [t`Start from $\sin 2x = 2\sin x\cos x$.`, t`Divide both sides by $2$.`],
          teach: t`$\sin x\cos x = \tfrac12\sin 2x$: a product of sine and cosine is one sine of twice the frequency.`,
          explain: t`$\sin 2x = 2\sin x\cos x$ gives $\sin x\cos x = \tfrac12\sin 2x$ — which is why it peaks at only $\tfrac12$.`,
          visual: trigGraph({ curves: [{ fn: 'sin(x)*cos(x)', color: 'accent', label: 'sin x cos x', labelAt: N(PI / 4), labelDx: 6, labelDy: -12 }, { fn: 'sin(2*x)', color: 'ink3', dash: true, width: 1.3, label: 'sin 2x', labelAt: N(1.2 * PI), labelDx: 6, labelDy: -12 }], y: [-1.3, 1.4], caption: t`The product (blue) and $\sin 2x$ (dashed): same shape, half the height.` }),
        };
      },
    }),
    num({
      id: 'rotate-point', difficulty: 3,
      gen(r) {
        const [x, y] = r.pick([[3, 4], [4, 1], [2, 5], [5, 2]]), d = r.pick([30, 45, 60, 90, 120]), b = d * D2R, cB = +Math.cos(b).toFixed(12), sB = +Math.sin(b).toFixed(12);
        const want = r.pick(['x', 'y']), ans = want === 'x' ? x * cB - y * sB : x * sB + y * cB;
        const wrong = want === 'x' ? x * cB + y * sB : -x * sB + y * cB;
        return {
          prompt: t`A marker on a turntable carrying a tracking antenna sits at $(${x}, ${y})$ m from the axis. The turntable turns $\beta = ${d}^\circ$ anticlockwise, carrying the marker to $(x', y')$ with $x' = x\cos\beta - y\sin\beta$ and $y' = x\sin\beta + y\cos\beta$ — the sum formulas in disguise. Find $${want}'$, in metres.`,
          answer: ans, units: 'm', tol: { rel: 0.005, abs: 1e-6 },
          errors: [{ value: wrong, feedback: t`A sign is flipped — that rotates the other way (clockwise). Anticlockwise: $x' = x\cos\beta - y\sin\beta$, $y' = x\sin\beta + y\cos\beta$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\cos ${d}^\circ = ${sig(cB, 4)}$, $\sin ${d}^\circ = ${sig(sB, 4)}$.`, t`Substitute $x = ${x}$, $y = ${y}$ into the formula for $${want}'$.`],
          teach: t`Writing the point as $r(\cos a, \sin a)$, rotation by $\beta$ gives $r(\cos(a + \beta), \sin(a + \beta))$; the sum formulas expand that into the rotation formulas.`,
          explain: want === 'x' ? t`$x' = ${x}\cos ${d}^\circ - ${y}\sin ${d}^\circ = ${sig(ans, 4)}$.` : t`$y' = ${x}\sin ${d}^\circ + ${y}\cos ${d}^\circ = ${sig(ans, 4)}$.`,
          visual: { type: 'graph', params: { x: [-6.5, 6.5], y: [-1.5, 6.5], equal: true, aspect: 'wide', xticks: 7, yticks: 4, curves: [{ param: [`${N(Math.hypot(x, y))}*cos(t)`, `${N(Math.hypot(x, y))}*sin(t)`], t: [N(Math.atan2(y, x)), N(Math.atan2(y, x) + b)], color: 'gold', width: 2, dash: true }], arrows: [{ from: [0, 0], to: [x, y], color: 'accent', label: `(${x}, ${y})`, labelDx: 6, labelDy: -8 }] }, caption: t`The point before rotation; the dashed arc shows it turning through $${d}^\circ$ (its end is for you to find).` },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: t`Which expression equals $\sin 2x$ for every $x$?`,
      visual: trigGraph({ curves: [{ fn: 'sin(2*x)', color: 'accent', label: 'sin 2x', labelAt: N(PI / 4), labelDx: 4, labelDy: -12 }, { fn: '2*sin(x)', color: 'ink3', dash: true, width: 1.3, label: '2 sin x', labelAt: N(PI / 2), labelDx: 4, labelDy: -10 }], y: [-2.3, 2.3], caption: t`$\sin 2x$ (blue) against $2\sin x$ (dashed): different curves.` }),
      choices: [t`$2\sin x\cos x$`, t`$2\sin x$`, t`$\sin^2 x$`, t`$\sin x\cos x$`],
      answer: 0,
      why: {
        1: t`$2\sin x$ reaches $2$; $\sin 2x$ never exceeds $1$. Doubling the angle is not doubling the sine — the picture shows two different curves.`,
        2: t`$\sin^2 x = \sin x \cdot \sin x$ is never negative, but $\sin 2x$ is negative for $\pi/2 < x < \pi$.`,
        3: t`Half right: $\sin x\cos x$ peaks at $\tfrac12$. It needs the factor $2$.`,
      },
      hints: [t`Put $b = a$ in $\sin(a + b) = \sin a\cos b + \cos a\sin b$.`],
      teach: t`$\sin 2x = 2\sin x\cos x$.`,
      explain: t`$\sin(x + x) = \sin x\cos x + \cos x\sin x = 2\sin x\cos x$.`,
    }),
    num({
      id: 'cp-hop', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([20, 25, 30, 35, 40]), R = (HOP.v ** 2 * Math.sin(2 * d * D2R)) / HOP.g, ans = 90 - d;
        return {
          prompt: t`A small lunar hopper jumps at $${HOP.v}$ m/s, $${d}^\circ$ above the horizontal. With no air and $g = ${HOP.g}\ \text{m/s}^2$, its range is $R = \dfrac{v^2\sin 2\theta}{g} = ${Math.round(R)}$ m. At what other launch angle would the same speed give the same range?`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 180 - d, feedback: t`$\sin(180^\circ - \theta) = \sin\theta$, but here the sine is of $2\theta$: you need $2\theta' = 180^\circ - 2\theta$.` }, { value: 2 * d, feedback: t`Doubling the angle changes $\sin 2\theta$. Find $\theta'$ with $\sin 2\theta' = \sin ${2 * d}^\circ$.` }].filter((e) => Math.abs(e.value - ans) > 1),
          hints: [t`You need $\sin 2\theta' = \sin ${2 * d}^\circ$ with $\theta' \neq ${d}^\circ$.`, t`$\sin\alpha = \sin(180^\circ - \alpha)$, so $2\theta' = 180^\circ - ${2 * d}^\circ$.`],
          teach: t`Because $\sin 2\theta = \sin(180^\circ - 2\theta)$, the launch angles $\theta$ and $90^\circ - \theta$ give equal ranges.`,
          explain: t`$2\theta' = 180^\circ - ${2 * d}^\circ = ${180 - 2 * d}^\circ$, so $\theta' = ${ans}^\circ$ — the complementary angle. The steeper hop flies higher and longer, but lands in the same place.`,
          visual: { type: 'graph', params: { x: [-10, Math.round(R * 1.15)], y: [-0.1 * (HOP.v * Math.sin(d * D2R)) ** 2 / (2 * HOP.g), 1.9 * (HOP.v * Math.sin(d * D2R)) ** 2 / (2 * HOP.g)], aspect: 'wide', xlabel: 'x (m)', ylabel: 'height (m)', curves: [{ param: [`${N(HOP.v * Math.cos(d * D2R))}*t`, `${N(HOP.v * Math.sin(d * D2R))}*t - ${HOP.g / 2}*t^2`], t: [0, N((2 * HOP.v * Math.sin(d * D2R)) / HOP.g)], color: 'accent' }], points: [{ x: N(R), y: 0, color: 'gold', r: 5, label: `R = ${Math.round(R)} m`, labelDx: -20, labelDy: -14 }] }, caption: t`The $${d}^\circ$ hop on airless ground; the other trajectory is for you to find.` },
        };
      },
    }),
    num({
      id: 'cp-sum', difficulty: 3,
      gen(r) {
        const [p, q, s] = r.pick(TRIPLES), [u, v, w] = r.pick(TRIPLES.filter((x) => x[2] !== s));
        const sa = p / s, ca = -q / s, sb = u / w, cb = v / w, ans = sa * cb + ca * sb;
        return {
          prompt: t`Angle $a$ is in the second quadrant with $\sin a = \tfrac{${p}}{${s}}$; angle $b$ is acute with $\cos b = \tfrac{${v}}{${w}}$. Find $\sin(a + b)$, as a decimal.`,
          answer: ans, tol: { rel: 0.005, abs: 1e-6 },
          errors: [{ value: sa * cb + (q / s) * sb, feedback: t`In the second quadrant $\cos a$ is **negative**: $\cos a = -\tfrac{${q}}{${s}}$.` }, { value: sa + sb, feedback: t`Sine does not distribute over a sum.` }, { value: sa * cb - ca * sb, feedback: t`That is $\sin(a - b)$: the sum takes a plus.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\cos a = -\sqrt{1 - \sin^2 a}$ (second quadrant) and $\sin b = \sqrt{1 - \cos^2 b}$.`, t`$\sin(a + b) = \sin a\cos b + \cos a\sin b$.`],
          teach: t`Find each missing sine or cosine with its quadrant’s sign, then expand.`,
          explain: t`$\cos a = -\tfrac{${q}}{${s}}$, $\sin b = \tfrac{${u}}{${w}}$: $\sin(a + b) = \tfrac{${p}}{${s}}\cdot\tfrac{${v}}{${w}} - \tfrac{${q}}{${s}}\cdot\tfrac{${u}}{${w}} = \tfrac{${p * v - q * u}}{${s * w}} = ${sig(ans, 4)}$.`,
          visual: circleFig({ th: PI - Math.asin(sa), legs: false, pLabel: 'a', caption: t`Angle $a$ in the second quadrant (solid) and the acute angle $b$ (dashed).`, extra: { curves: [{ param: [`t*${N(cb)}`, `t*${N(sb)}`], t: [0, 1], color: 'violet', width: 2, dash: true }], points: [{ x: N(cb), y: N(sb), color: 'violet', r: 4.5, label: 'b', labelDx: 8, labelDy: 8 }] } }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §7.2 Sum and Difference Identities', url: 'https://openstax.org/books/precalculus-2e/pages/7-2-sum-and-difference-identities' },
    { label: 'OpenStax Precalculus 2e, §7.3 Double-Angle, Half-Angle, and Reduction Formulas', url: 'https://openstax.org/books/precalculus-2e/pages/7-3-double-angle-half-angle-and-reduction-formulas' },
  ],
});
