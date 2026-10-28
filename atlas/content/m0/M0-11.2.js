// Ellipses and hyperbolas — the sum (or difference) of distances to two foci held fixed; a, b, c and the asymptotes.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { D2R, deg, seg, ell, hyp, plane, dot, note } from './_m0geo.js';

const t = String.raw;
// an axis-aligned ellipse (a along x, b along y; vertical if b > a) with optional foci
const ellPic = (a, b, caption, { foci = true, ticks = true, extra = {}, pins = false } = {}) => {
  const c = Math.sqrt(Math.abs(a * a - b * b)), F = a >= b ? [[c, 0], [-c, 0]] : [[0, c], [0, -c]], H = 1.15 * Math.max(b, a / 2);
  return plane({
    x: [-2 * H, 2 * H], y: [-H, H], ticks, curves: [ell([0, 0], a, b, { width: 2.6 })],
    points: foci ? F.map((f, i) => dot(f, pins ? '' : `F${'₁₂'[i]}`, { color: 'warn', r: pins ? 4 : 5 })) : [],
    caption, extra,
  });
};

export default lesson({
  id: 'm0.M0-11.2',
  title: 'Ellipses and hyperbolas',
  minutes: 10, difficulty: 2,
  intro: t`Pin a loop of string at two points, the **foci**, pull it taut with a pencil and draw: the pencil keeps the **sum** of its distances to the foci fixed, and traces an **ellipse**. Keep the **difference** fixed instead and you get a **hyperbola**. Centred at the origin with the foci on the $x$-axis,

$$\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1 \ \ (c^2 = a^2 - b^2), \qquad \frac{x^2}{a^2} - \frac{y^2}{b^2} = 1 \ \ (c^2 = a^2 + b^2)$$

For the ellipse $a$ is the **semi-major** axis (the long half), $b$ the semi-minor, and the sum of distances is $2a$. **The larger denominator belongs to the long axis**: $\tfrac{x^2}{9} + \tfrac{y^2}{25} = 1$ is tall, with its foci on the $y$-axis. For the hyperbola the difference of distances is $2a$, the vertices are at $x = \pm a$, and far out it hugs its **asymptotes** $y = \pm\tfrac{b}{a}x$. In both, $c$ is the centre-to-focus distance — but the minus sign and the plus sign are swapped.`,
  symbols: [
    { tex: 'a', text: 'ellipse: the semi-major axis (half the longest width); hyperbola: the centre-to-vertex distance' },
    { tex: 'b', text: 'ellipse: the semi-minor axis; hyperbola: sets the asymptotes’ slope $b/a$' },
    { tex: 'c', text: 'the centre-to-focus distance: $\\sqrt{a^2 - b^2}$ (ellipse) or $\\sqrt{a^2 + b^2}$ (hyperbola)' },
    { tex: 'F_1,\\ F_2', text: 'the two **foci**, at $(\\pm c, 0)$' },
  ],
  why: t`Planets, moons and satellites move on ellipses with the central body at **one focus** (Kepler’s first law); a spacecraft swinging past a planet faster than escape speed follows one branch of a hyperbola. The focus properties are used in hardware too: an elliptical mirror sends light from one focus to the other, and hyperbolic surfaces sit in Cassegrain telescopes. [Calculus II](#/lesson/math1220.C2-6.5) adds rotated conics.`,
  visual: {
    type: 'graph',
    title: 'Two foci, one fixed total',
    lead: t`Slide $P$ round the curve and watch the distances to the two foci (orange and blue). On the ellipse their **sum** never changes; switch to the hyperbola and their **difference** never changes. Both equal $2a$.`,
    tasks: [
      t`Ellipse, $a = 5$, $b = 4$: the foci sit at $\pm 3$, and $PF_1 + PF_2 = 10$ wherever $P$ is.`,
      t`Shrink $b$ toward $0.5$: the foci slide out toward the ends, and the ellipse flattens.`,
      t`Switch to the hyperbola: now $|PF_1 - PF_2| = 2a$, the foci are outside the vertices at $\pm\sqrt{a^2 + b^2}$, and the dashed asymptotes have slope $\pm b/a$.`,
    ],
    params: {
      x: [-10, 10], y: [-5, 5], equal: true, aspect: 'wide',
      choices: [{ key: 'kind', label: 'Curve', options: [[0, 'Ellipse'], [1, 'Hyperbola']], value: 0, explain: 'Sum of distances fixed, or difference fixed.' }],
      sliders: [
        { key: 'a', label: '$a$', min: 2, max: 5, step: 0.1, value: 5, explain: 'Semi-major axis (ellipse) or centre-to-vertex distance (hyperbola).' },
        { key: 'b', label: '$b$', min: 0.5, max: 2, step: 0.1, value: 2, explain: 'Semi-minor axis (ellipse) or the asymptotes’ rise per a (hyperbola).' },
        { key: 'u', label: t`Position of $P$`, min: -3.1, max: 3.1, step: 0.01, value: 1.1, explain: 'Moves P round the ellipse, or along the right branch of the hyperbola.' },
      ],
      curves: [
        { param: ['a*cos(t)', 'b*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.6, when: '1 - kind' },
        { param: ['a*cosh(t)', 'b*sinh(t)'], t: [-2.5, 2.5], color: 'accent', width: 2.6, when: 'kind' },
        { param: ['-a*cosh(t)', 'b*sinh(t)'], t: [-2.5, 2.5], color: 'accent', width: 2.6, when: 'kind' },
        { fn: 'b/a*x', color: 'ink3', width: 1.2, dash: true, when: 'kind' },
        { fn: '-b/a*x', color: 'ink3', width: 1.2, dash: true, when: 'kind' },
        { param: ['sqrt(a^2 - b^2 + 2*kind*b^2) + t*((1 - kind)*a*cos(u) + kind*a*cosh(u/1.5) - sqrt(a^2 - b^2 + 2*kind*b^2))', 't*((1 - kind)*b*sin(u) + kind*b*sinh(u/1.5))'], t: [0, 1], color: 'warn', width: 2.2 },
        { param: ['-sqrt(a^2 - b^2 + 2*kind*b^2) + t*((1 - kind)*a*cos(u) + kind*a*cosh(u/1.5) + sqrt(a^2 - b^2 + 2*kind*b^2))', 't*((1 - kind)*b*sin(u) + kind*b*sinh(u/1.5))'], t: [0, 1], color: 'accent2', width: 2.2 },
      ],
      points: [
        { x: 'sqrt(a^2 - b^2 + 2*kind*b^2)', y: 0, r: 5, color: 'warn', label: 'F₁', labelDx: 4, labelDy: 14 },
        { x: '-sqrt(a^2 - b^2 + 2*kind*b^2)', y: 0, r: 5, color: 'accent2', label: 'F₂', labelDx: -18, labelDy: 14 },
        { x: '(1 - kind)*a*cos(u) + kind*a*cosh(u/1.5)', y: '(1 - kind)*b*sin(u) + kind*b*sinh(u/1.5)', r: 6, color: 'gold', label: 'P' },
      ],
      readouts: [
        { label: t`$PF_1 + PF_2$`, expr: 'sqrt(((1 - kind)*a*cos(u) + kind*a*cosh(u/1.5) - sqrt(a^2 - b^2 + 2*kind*b^2))^2 + ((1 - kind)*b*sin(u) + kind*b*sinh(u/1.5))^2) + sqrt(((1 - kind)*a*cos(u) + kind*a*cosh(u/1.5) + sqrt(a^2 - b^2 + 2*kind*b^2))^2 + ((1 - kind)*b*sin(u) + kind*b*sinh(u/1.5))^2)', digits: 4 },
        { label: t`$|PF_1 - PF_2|$`, expr: 'abs(sqrt(((1 - kind)*a*cos(u) + kind*a*cosh(u/1.5) - sqrt(a^2 - b^2 + 2*kind*b^2))^2 + ((1 - kind)*b*sin(u) + kind*b*sinh(u/1.5))^2) - sqrt(((1 - kind)*a*cos(u) + kind*a*cosh(u/1.5) + sqrt(a^2 - b^2 + 2*kind*b^2))^2 + ((1 - kind)*b*sin(u) + kind*b*sinh(u/1.5))^2))', digits: 4 },
        { label: t`$2a$`, expr: '2*a', digits: 4 },
        { label: t`$c$`, expr: 'sqrt(a^2 - b^2 + 2*kind*b^2)', digits: 4 },
      ],
    },
    caption: t`To scale. The sliders keep $b \le a$, so this ellipse always lies along the $x$-axis; the hyperbola shows only its right branch moving $P$ (the left branch is its mirror image).`,
  },
  example: {
    prompt: t`Find $a$, $b$, the foci, and the sum of focal distances for the ellipse $16x^2 + 25y^2 = 400$.`,
    visual: ellPic(5, 4, t`The ellipse and its foci, to scale. The gold point $(0, 4)$ is used in the check.`, { extra: { arrows: [{ from: [0, 4], to: [3, 0], color: 'warn', width: 1.6, dash: true }, { from: [0, 4], to: [-3, 0], color: 'accent2', width: 1.6, dash: true }] } }),
    steps: [
      { label: 'Standard form', text: t`Divide by $400$: $\dfrac{x^2}{25} + \dfrac{y^2}{16} = 1$.` },
      { label: 'Which is a', text: t`The larger denominator, $25$, is under $x^2$: the long axis is horizontal, $a = 5$ and $b = 4$. (Swap them and you put the foci on the wrong axis.)` },
      { label: 'Foci', text: t`$c^2 = a^2 - b^2 = 25 - 16 = 9$, so $c = 3$: foci at $(\pm 3, 0)$.` },
      { label: 'Sum', text: t`Every point has $PF_1 + PF_2 = 2a = 10$.` },
      { label: 'Check', text: t`At the top, $(0, 4)$: each focal distance is $\sqrt{3^2 + 4^2} = 5$, and $5 + 5 = 10$ ✓.` },
    ],
    answer: t`$a = 5$, $b = 4$, foci $(\pm 3, 0)$, $PF_1 + PF_2 = 10$.`,
  },
  practice: [
    mcq({
      id: 'vertical-foci', difficulty: 2,
      gen(r) {
        const [A, B] = r.pick([[9, 25], [16, 25], [5, 9], [7, 16], [12, 16]]), c = Math.sqrt(B - A), cT = Number.isInteger(c) ? `${c}` : t`\sqrt{${B - A}}`;
        return {
          prompt: t`Where are the foci of $\dfrac{x^2}{${A}} + \dfrac{y^2}{${B}} = 1$?`,
          choices: [t`$(0,\ \pm ${cT})$`, t`$(\pm ${cT},\ 0)$`, t`$(0,\ \pm\sqrt{${A + B}})$`, t`$(0,\ \pm${Math.sqrt(B) % 1 ? t`\sqrt{${B}}` : Math.sqrt(B)})$`],
          answer: 0,
          why: {
            1: t`$a$ and $b$ swapped: the larger denominator, $${B}$, is under $y^2$, so the long axis — and the foci — are vertical.`,
            2: t`$c^2 = a^2 + b^2$ is the **hyperbola** rule. For an ellipse the foci are inside it: $c^2 = a^2 - b^2$.`,
            3: t`Those are the ends of the long axis (the vertices), not the foci; the foci are inside.`,
          },
          hints: [t`Which denominator is larger? That axis is the long one, and holds the foci.`, t`$c^2 = ${B} - ${A}$.`],
          teach: t`The larger denominator marks the major axis; $c^2 = (\text{larger}) - (\text{smaller})$.`,
          explain: t`$a^2 = ${B}$ (under $y^2$), $b^2 = ${A}$: $c = \sqrt{${B - A}}${Number.isInteger(c) ? ` = ${c}` : ''}$, foci $(0, \pm ${cT})$.`,
          visual: ellPic(Math.sqrt(A), Math.sqrt(B), t`The ellipse on a square grid (foci not shown).`, { foci: false }),
        };
      },
    }),
    num({
      id: 'whisper', difficulty: 2,
      gen(r) {
        const L = r.pick([30, 40, 46, 60]), W = r.pick([18, 22, 26]), a = L / 2, b = W / 2, ans = Math.sqrt(a * a - b * b);
        return {
          prompt: t`A “whispering gallery” has an elliptical floor $${L}$ m long and $${W}$ m wide. A whisper at one focus is heard clearly at the other. How far from the centre of the room is each focus, in metres?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(a * a + b * b), feedback: t`$\sqrt{a^2 + b^2}$ is the hyperbola’s rule. An ellipse’s foci are inside it: $c = \sqrt{a^2 - b^2}$.` }, { value: Math.sqrt(L * L - W * W), feedback: t`Use the **semi**-axes: $a = ${a}$ m and $b = ${b}$ m, half the length and width.` }, { value: a - b, feedback: t`$c$ is not $a - b$: it comes from $c^2 = a^2 - b^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$a = ${a}$ m and $b = ${b}$ m.`, t`$c = \sqrt{a^2 - b^2}$.`],
          teach: t`For an ellipse, $c^2 = a^2 - b^2$ with $a$, $b$ the semi-axes.`,
          explain: t`$c = \sqrt{${a * a} - ${b * b}} = ${sig(ans, 4)}$ m from the centre, along the long axis.`,
          visual: ellPic(a, b, t`The floor plan to scale (metres), foci not shown.`, { foci: false }),
        };
      },
    }),
    num({
      id: 'asymptote', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [4, 3], [2, 5], [5, 2], [1, 3]]), ans = deg(Math.atan(b / a));
        return {
          prompt: t`At what angle to the $x$-axis do the asymptotes of $\dfrac{x^2}{${a * a}} - \dfrac{y^2}{${b * b}} = 1$ run? Give degrees, between $0^\circ$ and $90^\circ$.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: deg(Math.atan(a / b)), feedback: t`$a$ and $b$ swapped: the asymptotes are $y = \pm\tfrac{b}{a}x$ with $a^2 = ${a * a}$ under $x^2$.` }, { value: deg(Math.atan((b * b) / (a * a))), feedback: t`Use $b/a = ${b}/${a}$, not $b^2/a^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.3),
          hints: [t`Far out the $1$ is negligible: $\tfrac{x^2}{a^2} \approx \tfrac{y^2}{b^2}$, so $y \approx \pm\tfrac{b}{a}x$.`],
          teach: t`The asymptotes of $\tfrac{x^2}{a^2} - \tfrac{y^2}{b^2} = 1$ are $y = \pm\tfrac{b}{a}x$, at angle $\tan^{-1}(b/a)$.`,
          explain: t`Slope $\pm\tfrac{${b}}{${a}}$, angle $\tan^{-1}\tfrac{${b}}{${a}} = ${sig(ans, 4)}^\circ$.`,
          visual: plane({ x: [-12, 12], y: [-6, 6], ticks: false, curves: hyp([0, 0], a, b, { width: 2.6 }, Math.acosh(11 / a)), caption: t`The hyperbola (asymptotes not drawn).` }),
        };
      },
    }),
    num({
      id: 'string', difficulty: 3,
      gen(r) {
        const d = r.pick([6, 8, 10]), L = r.pick([12, 14, 16, 20]), a = L / 2, c = d / 2, ans = Math.sqrt(a * a - c * c);
        return {
          prompt: t`Two pins are pushed into a board $${d}$ cm apart. A loop of string makes $${L}$ cm of path from one pin to the pencil to the other pin, and the pencil is dragged round with the string taut. How far from the centre is the top of the curve — the semi-minor axis $b$, in cm?`,
          answer: ans, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(L * L - d * d), feedback: t`That is $2b$: the sum of focal distances is $2a = ${L}$ and the pins are $2c = ${d}$ apart — halve both first.` }, { value: a, feedback: t`$${a}$ cm is $a$, the semi-major axis (half the length). At the top, $b^2 = a^2 - c^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The string length is $PF_1 + PF_2 = 2a$; the pin separation is $2c$.`, t`At the top of the ellipse each piece of string is $a$ long, the hypotenuse of a right triangle with legs $c$ and $b$.`],
          teach: t`At the end of the minor axis, $a$, $b$ and $c$ form a right triangle: $a^2 = b^2 + c^2$.`,
          explain: t`$a = ${a}$, $c = ${c}$, so $b = \sqrt{${a * a} - ${c * c}} = ${sig(ans, 4)}$ cm.`,
          visual: ellPic(a, ans, t`The curve the pencil draws, with the two pins (orange). To scale; axis numbers hidden.`, { pins: true, ticks: false }),
        };
      },
    }),
    mcq({
      id: 'identify', difficulty: 2,
      gen(r) {
        const kind = r.int(0, 3), [A, B] = r.pick([[4, 9], [3, 7], [5, 2]]), C = r.pick([36, 63, 70]);
        const eq = [t`${A}x^2 + ${B}y^2 = ${C}`, t`${A}x^2 - ${B}y^2 = ${C}`, t`${A}x^2 + ${A}y^2 = ${C}`, t`${A}x^2 + ${B}y = ${C}`][kind];
        const names = ['An ellipse', 'A hyperbola', 'A circle', 'A parabola'];
        const whyOf = [t`An ellipse needs both squares with the same sign and different coefficients.`, t`A hyperbola needs the two squares with opposite signs.`, t`A circle needs both squares with the same coefficient (after dividing through).`, t`A parabola has only one variable squared.`];
        return {
          prompt: t`What curve is $${eq}$?`,
          choices: names, fixedOrder: true, answer: kind,
          why: Object.fromEntries([0, 1, 2, 3].filter((j) => j !== kind).map((j) => [j, whyOf[j]])),
          hints: [t`Look at the squared terms: how many are there, and do their signs and coefficients match?`],
          teach: t`Both squares, same sign: ellipse (circle if equal); opposite signs: hyperbola; one square: parabola.`,
          explain: t`${whyOf[kind].replace('needs', 'has')} $${eq}$ fits that pattern: it is ${names[kind].toLowerCase()}.`,
        };
      },
    }),
    {
      type: 'point', id: 'drag-focus', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[5, 3], [5, 4], [3, 5], [4, 5]]), c = Math.sqrt(Math.abs(a * a - b * b)), ans = a > b ? { x: c, y: 0 } : { x: 0, y: c };
        const v = ellPic(a, b, t`The ellipse $\tfrac{x^2}{${a * a}} + \tfrac{y^2}{${b * b}} = 1$ on a square grid. Drag the ring.`, { foci: false });
        v.params.drag = [{ key: 'q', x: -1, y: -1, snap: 0.25 }];
        return {
          prompt: t`Drag the ring to the focus of $\dfrac{x^2}{${a * a}} + \dfrac{y^2}{${b * b}} = 1$ that lies on the positive ${a > b ? '$x$' : '$y$'}-axis.`,
          visual: v, answer: ans, tol: { x: 0.2, y: 0.2 },
          instruction: 'Drag the ring to the focus, then check.',
          hints: [t`The long axis is along ${a > b ? '$x$' : '$y$'}; $c^2 = (\text{larger}) - (\text{smaller})$.`, t`$c = \sqrt{${Math.max(a, b) ** 2} - ${Math.min(a, b) ** 2}} = ${c}$.`],
          teach: t`The foci lie on the major axis, $c = \sqrt{a^2 - b^2}$ from the centre.`,
          explain: t`$c = ${c}$: the focus is at $(${ans.x}, ${ans.y})$, inside the ellipse on its long axis.`,
        };
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-flyby', difficulty: 3, transfer: true,
      gen(r) {
        const [a, b] = r.pick([[2, 3], [3, 2], [1, 2], [4, 3], [2, 5]]), phi = deg(Math.atan(b / a)), ans = 180 - 2 * phi, c = Math.hypot(a, b);
        return {
          prompt: t`A spacecraft flies past a planet on the right branch of $\dfrac{x^2}{${a * a}} - \dfrac{y^2}{${b * b}} = 1$ (in thousands of km), with the planet at the focus $(${sig(c, 3)},\ 0)$. Far away it travels along the asymptotes: it arrives along one and leaves along the other. Through what angle does the flyby turn its direction of travel, in degrees?`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 2 * phi, feedback: t`$2\tan^{-1}(b/a)$ is the angle between the asymptotes measured across the $y$-axis side. The craft comes in along one and leaves along the other, turning through $180^\circ$ minus that.` }, { value: 180 - 2 * deg(Math.atan(a / b)), feedback: t`$a$ and $b$ swapped: the asymptotes have slope $\pm b/a = \pm ${b}/${a}$.` }, { value: phi, feedback: t`That is one asymptote’s angle to the axis. The turn involves both.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`The asymptotes make angles $\pm\varphi$ with the $x$-axis, $\varphi = \tan^{-1}(b/a)$.`, t`Incoming along one asymptote toward the planet, outgoing along the other away from it: the direction turns by $180^\circ - 2\varphi$.`],
          teach: t`A hyperbolic flyby bends the path by $180^\circ - 2\tan^{-1}(b/a)$: a small $b/a$ (slow, close pass) turns it most.`,
          explain: t`$\varphi = \tan^{-1}(${b}/${a}) = ${sig(phi, 4)}^\circ$, so the turn is $180^\circ - 2(${sig(phi, 4)}^\circ) = ${sig(ans, 4)}^\circ$. Gravity assists use exactly this bend to redirect a spacecraft without fuel.`,
          visual: plane({ x: [-3 * c, 3 * c], y: [-1.5 * c, 1.5 * c], ticks: false, curves: [hyp([0, 0], a, b, { width: 2.6 }, Math.acosh((2.8 * c) / a))[0], { fn: `${N(b / a)}*x`, color: 'ink3', width: 1.2, dash: true }, { fn: `${N(-b / a)}*x`, color: 'ink3', width: 1.2, dash: true }], points: [dot([c, 0], 'planet', { color: 'teal', labelDy: 14 })], caption: t`The flyby path (one branch) and its asymptotes (dashed); the planet is at the focus. Two-body Newtonian motion, planet’s own motion ignored.` }),
        };
      },
    }),
    num({
      id: 'cp-orbit-b', difficulty: 2, transfer: true,
      gen(r) {
        const a = r.pick([7000, 8000, 9500]), c = r.pick([1200, 1500, 2000]), ans = Math.sqrt(a * a - c * c);
        return {
          prompt: t`A satellite’s elliptical orbit has semi-major axis $${thou(a)}$ km, and the Earth’s centre (a focus) is $${thou(c)}$ km from the ellipse’s centre. What is the semi-minor axis $b$, in km?`,
          answer: ans, units: 'km', tol: { rel: 0.002 },
          errors: [{ value: Math.sqrt(a * a + c * c), feedback: t`For an ellipse $b^2 = a^2 - c^2$; $a$ is the longest semi-axis.` }, { value: a - c, feedback: t`$a - c$ is the closest approach to the focus (the perigee radius), not $b$.` }, { value: Math.sqrt(a * a - 4 * c * c), feedback: t`$c$ is the centre-to-focus distance itself, not half of the focus separation.` }].filter((e) => Math.abs(e.value - ans) > 0.002 * ans),
          hints: [t`$a^2 = b^2 + c^2$ for an ellipse.`],
          teach: t`Ellipse: $b = \sqrt{a^2 - c^2}$, always shorter than $a$.`,
          explain: t`$b = \sqrt{${thou(a)}^2 - ${thou(c)}^2} = ${thou(ans)}$ km — only $${sig((1 - ans / a) * 100, 2)}\%$ less than $a$: real orbits look nearly circular even when the focus is well off-centre.`,
          visual: ellPic(a / 1000, ans / 1000, t`The orbit to scale (thousands of km) with the Earth’s centre at a focus (orange); axis numbers hidden.`, { ticks: false }),
        };
      },
    }),
    num({
      id: 'cp-hyp-c', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [5, 12], [6, 8], [2, 3]]), ans = Math.hypot(a, b);
        return {
          prompt: t`How far apart are the two foci of the hyperbola $\dfrac{x^2}{${a * a}} - \dfrac{y^2}{${b * b}} = 1$?`,
          answer: 2 * ans, tol: { rel: 0.005 },
          errors: [{ value: ans, feedback: t`That is $c$, the centre-to-focus distance. The foci are at $\pm c$: $2c$ apart.` }, { value: 2 * Math.sqrt(Math.abs(a * a - b * b)), feedback: t`$c^2 = a^2 - b^2$ is the ellipse’s rule. For a hyperbola, $c^2 = a^2 + b^2$.` }].filter((e) => Math.abs(e.value - 2 * ans) > 0.01 * ans),
          hints: [t`Hyperbola: $c^2 = a^2 + b^2$; foci at $(\pm c, 0)$.`],
          teach: t`A hyperbola’s foci lie outside its vertices: $c = \sqrt{a^2 + b^2} > a$.`,
          explain: t`$c = \sqrt{${a * a} + ${b * b}} = ${sig(ans, 4)}$, so the foci are $${sig(2 * ans, 4)}$ apart.`,
          visual: plane({ x: [-2.4 * ans, 2.4 * ans], y: [-1.2 * ans, 1.2 * ans], ticks: false, curves: hyp([0, 0], a, b, { width: 2.6 }, Math.acosh((2.3 * ans) / a)), caption: t`Both branches of the hyperbola (foci not shown).` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §10.1 The Ellipse', url: 'https://openstax.org/books/precalculus-2e/pages/10-1-the-ellipse' },
    { label: 'OpenStax Precalculus 2e, §10.2 The Hyperbola', url: 'https://openstax.org/books/precalculus-2e/pages/10-2-the-hyperbola' },
  ],
});
void D2R; void seg; void note;
