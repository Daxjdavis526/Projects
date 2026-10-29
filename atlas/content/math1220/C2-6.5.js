// Conic sections: the focus–directrix definition PF = e·PD, standard forms of
// the ellipse, parabola and hyperbola, eccentricity, and the general
// second-degree equation (the discriminant and rotation of axes).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

const cart = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'cartesian', aspect: 'wide', x, y, ...params }, caption });
const round = (v, d = 4) => +v.toFixed(d);

// the Explore: a point P on each conic, joined to its foci and its directrix
const ELL = { b: 'a*sqrt(1 - e^2)', c: 'a*e' };
const HYP = { b: 'a*sqrt(eh^2 - 1)', c: 'a*eh' };
const EXPLORE_PRESETS = [
  {
    label: 'Ellipse', show: ['a', 'e', 'se'], x: [-6.5, 6.5], y: [-4, 4],
    curves: [{ param: ['a*cos(t)', `${ELL.b}*sin(t)`], t: [0, '2*pi'], color: 'accent' }],
    vlines: [{ x: 'a/e', color: 'teal', label: 'directrix' }, { x: '-a/e', color: 'teal' }],
    tangents: [{ param: ['a*cos(t)', `${ELL.b}*sin(t)`], at: 'se', line: false, color: 'ink', label: 'P' }],
    segments: [
      { from: ['tx', 'ty'], to: [`-${ELL.c}`, 0], color: 'gold', width: 2.2 },
      { from: ['tx', 'ty'], to: [ELL.c, 0], color: 'violet', width: 2.2 },
      { from: ['tx', 'ty'], to: ['a/e', 'ty'], color: 'teal', width: 1.8, dash: true },
    ],
    points: [{ x: `-${ELL.c}`, y: 0, color: 'gold', label: 'F₁', labelDy: 14 }, { x: ELL.c, y: 0, color: 'violet', label: 'F₂', labelDy: 14 }],
    readouts: [
      { label: t`$PF_1 + PF_2$`, expr: `sqrt((tx + ${ELL.c})^2 + ty^2) + sqrt((tx - ${ELL.c})^2 + ty^2)`, digits: 4 },
      { label: '$2a$', expr: '2*a', digits: 4 },
      { label: t`$PF_2 / PD$`, expr: `sqrt((tx - ${ELL.c})^2 + ty^2)/(a/e - tx)`, digits: 4 },
      { label: t`$b = a\sqrt{1 - e^2}$`, expr: ELL.b, digits: 3 },
    ],
  },
  {
    label: 'Hyperbola', show: ['a', 'eh', 'sh'], x: [-7.5, 7.5], y: [-4.6, 4.6],
    curves: [
      { param: ['a*cosh(t)', `${HYP.b}*sinh(t)`], t: [-3, 3], color: 'accent' },
      { param: ['-a*cosh(t)', `${HYP.b}*sinh(t)`], t: [-3, 3], color: 'accent' },
      { param: ['t', `${HYP.b}/a*t`], t: [-9, 9], color: 'ink3', width: 1.2, dash: true },
      { param: ['t', `-${HYP.b}/a*t`], t: [-9, 9], color: 'ink3', width: 1.2, dash: true },
    ],
    vlines: [{ x: 'a/eh', color: 'teal', label: 'directrix' }, { x: '-a/eh', color: 'teal' }],
    tangents: [{ param: ['a*cosh(t)', `${HYP.b}*sinh(t)`], at: 'sh', line: false, color: 'ink', label: 'P' }],
    segments: [
      { from: ['tx', 'ty'], to: [`-${HYP.c}`, 0], color: 'gold', width: 2.2 },
      { from: ['tx', 'ty'], to: [HYP.c, 0], color: 'violet', width: 2.2 },
      { from: ['tx', 'ty'], to: ['a/eh', 'ty'], color: 'teal', width: 1.8, dash: true },
    ],
    points: [{ x: `-${HYP.c}`, y: 0, color: 'gold', label: 'F₁', labelDy: 14 }, { x: HYP.c, y: 0, color: 'violet', label: 'F₂', labelDy: 14 }],
    readouts: [
      { label: t`$|PF_1 - PF_2|$`, expr: `abs(sqrt((tx + ${HYP.c})^2 + ty^2) - sqrt((tx - ${HYP.c})^2 + ty^2))`, digits: 4 },
      { label: '$2a$', expr: '2*a', digits: 4 },
      { label: t`$PF_2 / PD$`, expr: `sqrt((tx - ${HYP.c})^2 + ty^2)/(tx - a/eh)`, digits: 4 },
      { label: t`asymptote slope $b/a$`, expr: `${HYP.b}/a`, digits: 3 },
    ],
  },
  {
    label: 'Parabola', show: ['p', 'sp'], x: [-3.5, 7], y: [-4.6, 4.6],
    curves: [{ param: ['p*t^2', '2*p*t'], t: [-4, 4], color: 'accent' }],
    vlines: [{ x: '-p', color: 'teal', label: 'directrix' }],
    tangents: [{ param: ['p*t^2', '2*p*t'], at: 'sp', line: false, color: 'ink', label: 'P' }],
    segments: [
      { from: ['tx', 'ty'], to: ['p', 0], color: 'violet', width: 2.2 },
      { from: ['tx', 'ty'], to: ['-p', 'ty'], color: 'teal', width: 1.8, dash: true },
    ],
    points: [{ x: 'p', y: 0, color: 'violet', label: 'F', labelDy: 14 }],
    readouts: [
      { label: '$PF$', expr: 'sqrt((tx - p)^2 + ty^2)', digits: 4 },
      { label: '$PD$', expr: 'tx + p', digits: 4 },
      { label: t`$PF / PD$`, expr: 'sqrt((tx - p)^2 + ty^2)/(tx + p)', digits: 4 },
    ],
  },
];

// ellipses with integer a, b, c
const TRIPLES = [[5, 3, 4], [5, 4, 3], [13, 5, 12], [10, 6, 8], [17, 8, 15], [25, 7, 24]];

// rotated ellipses x′²/p² + y′²/q² = 1 written as A x² + B xy + C y² = R
const ROTATED = [
  { deg: 60, eq: t`7x^2 + 6\sqrt3\,xy + 13y^2 = 16`, A: 7, B: t`6\sqrt3`, C: 13, p: 1, q: 2 },
  { deg: 30, eq: t`13x^2 + 6\sqrt3\,xy + 7y^2 = 16`, A: 13, B: t`6\sqrt3`, C: 7, p: 1, q: 2 },
  { deg: 45, eq: t`2x^2 + 2xy + 2y^2 = 3`, A: 2, B: '2', C: 2, p: 1, q: Math.sqrt(3) },
];

// general second-degree equations with an xy-term, and the same equation without it
const MIXED = [
  { eq: t`3x^2 + 10xy + 3y^2 = 8`, A: 3, B: 10, C: 3, type: 'hyperbola', drop: { param: ['1.633*cos(t)', '1.633*sin(t)'], t: [0, '2*pi'] }, dropName: t`$3x^2 + 3y^2 = 8$, a circle` },
  { eq: t`x^2 + 4xy + 4y^2 + x = 3`, A: 1, B: 4, C: 4, type: 'parabola', drop: { param: ['-0.5 + 1.803*cos(t)', '0.9014*sin(t)'], t: [0, '2*pi'] }, dropName: t`$x^2 + 4y^2 + x = 3$, an ellipse` },
  { eq: t`2x^2 + 5xy + 2y^2 = 4`, A: 2, B: 5, C: 2, type: 'hyperbola', drop: { param: ['1.4142*cos(t)', '1.4142*sin(t)'], t: [0, '2*pi'] }, dropName: t`$2x^2 + 2y^2 = 4$, a circle` },
];

// the worked example: 9x² + 25y² = 225 and a point on it
const EX = (() => { const s = 1, X = 5 * Math.cos(s), Y = 3 * Math.sin(s); return { X: round(X), Y: round(Y), PF: Math.hypot(X - 4, Y), PD: 6.25 - X }; })();

export default lesson({
  id: 'math1220.C2-6.5',
  title: 'Conic sections',
  minutes: 12, difficulty: 3,
  intro: t`Slice a double cone with a plane and the cut is a **conic**: an ellipse, a parabola or a hyperbola (a circle is the special ellipse). All of them share one definition. Fix a point $F$, the *focus*, and a line, the *directrix*. The conic is every point $P$ whose distance to the focus is a fixed multiple $e$ of its distance to the line:

$$PF = e \cdot PD$$

The **eccentricity** $e$ decides the shape: $0 < e < 1$ gives an ellipse, $e = 1$ a parabola, $e > 1$ a hyperbola. Orbits, satellite dishes and telescope mirrors are all built from these curves.`,
  symbols: [
    { tex: 'P', text: 'any point on the conic' },
    { tex: 'F', text: 'the **focus**: a fixed point (for an orbit, the Sun)' },
    { tex: 'PD', text: 'the distance from $P$ to the **directrix**, a fixed line' },
    { tex: 'e', text: 'the **eccentricity**, a pure number: how far from round the curve is' },
    { tex: 'a,\\ b', text: 'the **semi-axes** of an ellipse $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ (or of a hyperbola $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$)' },
    { tex: 'c', text: 'the centre-to-focus distance: $c^2 = a^2 - b^2$ for an ellipse, $c^2 = a^2 + b^2$ for a hyperbola, and $e = c/a$' },
  ],
  why: t`Newton proved that every orbit under an inverse-square force is a conic with the attracting body at a focus — the next lesson writes them in polar form. Reflectors use the focus too: a parabolic dish sends every ray arriving along its axis through its focus.`,
  visual: {
    type: 'calc-polar',
    title: 'The defining distances, live',
    lead: t`Move the point $P$ round each conic. Gold and violet join it to the two foci; the dashed teal line runs to the directrix. Watch which combinations of lengths stay fixed.`,
    tasks: [
      t`**Ellipse:** $PF_1 + PF_2$ never changes — it is always $2a$ (the “string” of a gardener’s ellipse). Drag $e$ towards $0$: the foci merge and the ellipse becomes a circle; the directrices run off to infinity.`,
      t`**Hyperbola:** now the *difference* $|PF_1 - PF_2|$ is fixed at $2a$. The dashed lines are the asymptotes; raise $e$ and they open out.`,
      t`**All three:** $PF_2/PD$ (for the parabola $PF/PD$) stays exactly equal to $e$ — that is the definition. For the parabola it is $1$: every point is as far from the focus as from the directrix.`,
    ],
    params: {
      grid: 'cartesian', aspect: 'wide', x: [-6.5, 6.5], y: [-4, 4],
      presetLabel: 'Conic',
      presets: EXPLORE_PRESETS,
      sliders: [
        { key: 'a', label: 'Semi-axis $a$', min: 1, max: 4, step: 0.1, value: 3, explain: t`Half the distance between the vertices (the points of the curve on the axis through the foci).` },
        { key: 'e', label: 'Eccentricity $e$', min: 0.05, max: 0.95, step: 0.01, value: 0.6, explain: t`For an ellipse, $0 < e < 1$; the foci sit at $\pm ae$.` },
        { key: 'eh', label: 'Eccentricity $e$', min: 1.05, max: 3, step: 0.01, value: 1.5, explain: t`For a hyperbola, $e > 1$; the foci sit at $\pm ae$.` },
        { key: 'p', label: 'Focal distance $p$', min: 0.25, max: 2, step: 0.05, value: 1, explain: t`$y^2 = 4px$: the focus is at $(p, 0)$ and the directrix is $x = -p$.` },
        { key: 'se', label: 'Move $P$', min: 0, max: 6.28, step: 0.01, value: 1.1, explain: t`$P = (a\cos s,\ b\sin s)$.` },
        { key: 'sh', label: 'Move $P$', min: -2, max: 2, step: 0.01, value: 0.8, explain: t`$P = (a\cosh s,\ b\sinh s)$ on the right-hand branch.` },
        { key: 'sp', label: 'Move $P$', min: -2.2, max: 2.2, step: 0.01, value: 1.1, explain: t`$P = (ps^2,\ 2ps)$.` },
      ],
    },
    caption: t`Exact curves; the readouts are computed from the drawn point. The hyperbola’s left branch has its own focus and directrix (the mirror images), not drawn as segments here.`,
  },
  example: {
    prompt: t`Find the foci, the eccentricity and the directrices of the ellipse $9x^2 + 25y^2 = 225$.`,
    visual: cart([-7.5, 7.5], [-3.8, 3.8], {
      curves: [{ param: ['5*cos(t)', '3*sin(t)'], t: [0, '2*pi'], color: 'accent' }],
      vlines: [{ x: 6.25, color: 'teal', label: 'x = 25/4' }, { x: -6.25, color: 'teal', label: 'x = −25/4' }],
      points: [{ x: -4, y: 0, color: 'violet', label: '(−4, 0)', labelDy: 14 }, { x: 4, y: 0, color: 'violet', label: '(4, 0)', labelDy: 14 }, { x: EX.X, y: EX.Y, color: 'gold', label: 'P' }],
      segments: [{ from: [EX.X, EX.Y], to: [4, 0], color: 'violet', label: `PF ≈ ${fmt(EX.PF)}`, labelDx: 8, labelDy: 6 }, { from: [EX.X, EX.Y], to: [6.25, EX.Y], color: 'teal', dash: true, label: `PD ≈ ${fmt(EX.PD)}`, labelDx: -20, labelDy: -10 }],
    }, t`The ellipse with its foci (violet) and directrices (teal), and a point $P$ that checks the definition.`),
    steps: [
      { label: 'Standard form', text: t`Divide by 225: $\dfrac{x^2}{25} + \dfrac{y^2}{9} = 1$. So $a = 5$ (along $x$, the larger) and $b = 3$.` },
      { label: 'Foci', text: t`$c^2 = a^2 - b^2 = 25 - 9 = 16$, so $c = 4$: the foci are $(\pm4, 0)$, on the long axis.` },
      { label: 'Eccentricity', text: t`$e = c/a = 4/5 = 0.8$.` },
      { label: 'Directrices', text: t`For an ellipse they are the lines $x = \pm a/e = \pm 25/4 = \pm6.25$, outside the curve.` },
      { label: 'Check the definition', text: t`Take $P = (5\cos 1,\ 3\sin 1) \approx (${fmt(EX.X)},\ ${fmt(EX.Y)})$. Its distance to the focus $(4, 0)$ is $${fmt(EX.PF)}$; to the line $x = 6.25$ it is $${fmt(EX.PD)}$. The ratio is $${fmt(EX.PF / EX.PD)} = e$ ✓.` },
    ],
    answer: t`Foci $(\pm4, 0)$, $e = 0.8$, directrices $x = \pm\tfrac{25}{4}$.`,
  },
  practice: [
    num({
      id: 'ellipse-foci', difficulty: 1,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), s = 4 / a;
        return {
          prompt: t`How far from the centre are the foci of the ellipse $\dfrac{x^2}{${a * a}} + \dfrac{y^2}{${b * b}} = 1$?`,
          visual: cart([-1.4 * a, 1.4 * a], [-1.25 * b - 0.1 * a, 1.25 * b + 0.1 * a], {
            curves: [{ param: [`${a}*cos(t)`, `${b}*sin(t)`], t: [0, '2*pi'], color: 'accent' }],
            arrows: [{ from: [0, 0], to: [a, 0], color: 'warn', label: `a = ${a}`, labelDx: -40, labelDy: -10 }, { from: [0, 0], to: [0, b], color: 'teal', label: `b = ${b}`, labelDx: 6, labelDy: 10 }],
          }, 'The ellipse with its semi-axes. The foci lie on the long axis, inside the curve.'),
          answer: c, tol: { rel: 0.002 },
          errors: [{ value: Math.hypot(a, b), feedback: t`$c^2 = a^2 + b^2$ is the hyperbola’s rule. For an ellipse $c^2 = a^2 - b^2$ — the foci are inside, so $c < a$.` }, { value: a - b, feedback: t`Subtract the squares, then take the root: $c = \sqrt{a^2 - b^2}$.` }],
          hints: [t`For an ellipse, $c^2 = a^2 - b^2$, with $a$ the larger semi-axis.`],
          teach: 'An ellipse’s foci sit at distance c = √(a² − b²) from the centre, along the long axis.',
          explain: t`$c = \sqrt{${a * a} - ${b * b}} = \sqrt{${c * c}} = ${c}$, so the foci are $(\pm${c}, 0)$.`,
        };
      },
    }),
    mcq({
      id: 'shape-not-size', difficulty: 2,
      prompt: t`Which statement about the eccentricity $e$ is true?`,
      visual: cart([-5, 1.4], [-2.1, 2.1], {
        curves: [{ conic: [0.5, 1.5], color: 'accent' }, { conic: [0.5, 0.75], color: 'accent', dash: true }, { conic: [0.8, 0.9], color: 'warn' }],
        points: [{ x: 0, y: 0, color: 'gold', label: 'shared focus', labelDx: 8, labelDy: -12 }],
        texts: [{ text: 'e = 0.5', x: -1, y: 1.95, color: 'accent' }, { text: 'e = 0.5', x: -0.5, y: 0.55, color: 'accent', size: 11.5 }, { text: 'e = 0.8', x: -3.6, y: 1.15, color: 'warn' }],
      }, t`Three ellipses sharing a focus. The two with $e = 0.5$ are scaled copies of each other; $e = 0.8$ is more stretched.`),
      choices: [
        'It sets the shape, not the size: two ellipses with the same e are scaled copies of each other',
        'A larger e means a larger ellipse',
        'An orbit with e = 1.2 is a very long ellipse',
        'e = 1 gives a circle',
      ],
      answer: 0,
      why: {
        1: 'Size is set by a (or p); e only sets how stretched the curve is. The two e = 0.5 ellipses in the picture differ in size.',
        2: 'Any e > 1 gives a hyperbola: an open curve that never comes back. An orbit with e = 1.2 escapes.',
        3: 'e = 1 is a parabola. A circle is the limit e → 0, where the foci merge.',
      },
      hints: [t`$e = c/a$ is a ratio of two lengths. What happens to it if you scale the whole picture by 2?`],
      teach: 'Eccentricity is a ratio, so it measures shape alone: 0 circle, between 0 and 1 ellipse, 1 parabola, above 1 hyperbola.',
      explain: t`Scaling an ellipse multiplies $a$ and $c$ by the same factor, leaving $e = c/a$ unchanged. So $e$ is pure shape; size needs a length such as $a$.`,
    }),
    num({
      id: 'ellipse-e', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), vertical = r.bool(0.5);
        const [P, Q] = vertical ? [a * a, b * b] : [b * b, a * a];     // P x² + Q y² = a²b²
        const R = a * a * b * b;
        const [ex, ey] = vertical ? [b, a] : [a, b];
        return {
          prompt: t`Find the eccentricity of the ellipse $${P}x^2 + ${Q}y^2 = ${R}$. Give 3 significant figures.`,
          visual: cart([-1.5 * ex - 0.3 * ey, 1.5 * ex + 0.3 * ey], [-1.2 * ey, 1.2 * ey], { curves: [{ param: [`${ex}*cos(t)`, `${ey}*sin(t)`], t: [0, '2*pi'], color: 'accent' }] }, t`The ellipse. ${vertical ? 'Its long axis is vertical.' : 'Its long axis is horizontal.'}`),
          answer: c / a, tol: { rel: 0.005 },
          errors: [{ value: b / a, feedback: t`$b/a$ is the ratio of the axes, not the eccentricity. Find $c = \sqrt{a^2 - b^2}$ first, then $e = c/a$.` }, { value: c / b, feedback: t`Divide by the **larger** semi-axis: $e = c/a$, with $a = ${a}$.` }],
          hints: [t`Divide by ${R}: $\dfrac{x^2}{${ex * ex}} + \dfrac{y^2}{${ey * ey}} = 1$. The larger denominator is $a^2$.`, t`$c = \sqrt{a^2 - b^2}$ and $e = c/a$.`],
          teach: 'Put the ellipse in standard form, take a as the larger semi-axis, then e = √(a² − b²)/a.',
          explain: t`Standard form $\tfrac{x^2}{${ex * ex}} + \tfrac{y^2}{${ey * ey}} = 1$: $a = ${a}$, $b = ${b}$, $c = \sqrt{${a * a} - ${b * b}} = ${c}$, so $e = \tfrac{${c}}{${a}} \approx ${fmt(c / a)}$.`,
        };
      },
    }),
    num({
      id: 'dish-focus', difficulty: 2,
      gen(r) {
        const [D, h] = r.pick([[0.6, 0.08], [1.2, 0.15], [2.4, 0.3], [3.0, 0.25], [0.9, 0.1]]);
        const p = (D * D) / (16 * h), R = D / 2;
        return {
          prompt: t`A satellite dish is a paraboloid whose cross-section is $y = \dfrac{x^2}{4p}$, with the receiver at the focus $(0, p)$. The dish is ${D} m across and ${h} m deep. How far above the centre of the dish must the receiver sit? Give 3 significant figures.`,
          visual: cart([-0.75 * D, 0.75 * D], [-0.12 * D, Math.max(0.55 * D, 1.4 * p)], {
            xlabel: 'x (m)', ylabel: 'y (m)',
            curves: [{ fn: `x^2/(4*${round(p, 6)})`, domain: [-R, R], color: 'accent', width: 3 }],
            segments: [{ from: [-R, h], to: [R, h], color: 'ink3', dash: true, label: `${D} m across`, labelDx: -30, labelDy: -10 }, { from: [R + 0.06 * D, 0], to: [R + 0.06 * D, h], color: 'warn', label: `${h} m deep`, labelDx: 6, labelDy: 0 }],
            arrows: [{ from: [-0.6 * R, 1.4 * p > 0.55 * D ? 0.5 * D : 1.3 * p], to: [-0.6 * R, (0.36 * R * R) / (4 * p)], color: 'ink3' }, { from: [0.6 * R, 1.4 * p > 0.55 * D ? 0.5 * D : 1.3 * p], to: [0.6 * R, (0.36 * R * R) / (4 * p)], color: 'ink3' }],
          }, 'Cross-section of the dish, to scale. Signals arrive parallel to the axis (grey arrows) and reflect through the focus.'),
          answer: p, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (D * D) / (4 * h), feedback: t`Use the radius, not the diameter: the rim is at $x = ${R}$ m.` }],
          hints: [t`The rim is at $x = ${R}$, $y = ${h}$. It lies on the parabola.`, t`$${h} = \dfrac{${R}^2}{4p}$, so $p = \dfrac{${R}^2}{4(${h})}$.`],
          teach: 'One point on a parabola y = x²/(4p) fixes p, the focal distance.',
          explain: t`$p = \dfrac{${R}^2}{4 \times ${h}} = ${fmt(p)}$ m above the vertex.`,
        };
      },
    }),
    num({
      id: 'hyperbola-foci', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10]]);
        const m = 1.7 * c;
        return {
          prompt: t`Find the distance from the centre to each focus of the hyperbola $\dfrac{x^2}{${a * a}} - \dfrac{y^2}{${b * b}} = 1$.`,
          visual: cart([-m, m], [-0.62 * m, 0.62 * m], {
            curves: [
              { param: [`${a}*cosh(t)`, `${b}*sinh(t)`], t: [-2.6, 2.6], color: 'accent' }, { param: [`-${a}*cosh(t)`, `${b}*sinh(t)`], t: [-2.6, 2.6], color: 'accent' },
              { param: ['t', `${b / a}*t`], t: [-2 * m, 2 * m], color: 'ink3', width: 1.2, dash: true }, { param: ['t', `-${b / a}*t`], t: [-2 * m, 2 * m], color: 'ink3', width: 1.2, dash: true },
            ],
            segments: [{ from: [a, -b], to: [a, b], color: 'ink4', dash: true }, { from: [-a, -b], to: [-a, b], color: 'ink4', dash: true }, { from: [-a, b], to: [a, b], color: 'ink4', dash: true }, { from: [-a, -b], to: [a, -b], color: 'ink4', dash: true }],
          }, t`The hyperbola, its asymptotes $y = \pm\tfrac{${b}}{${a}}x$, and the box $2a \times 2b$ whose diagonals they are.`),
          answer: c, tol: { rel: 0.002 },
          errors: a > b ? [{ value: Math.sqrt(a * a - b * b), feedback: t`$c^2 = a^2 - b^2$ is the ellipse’s rule. A hyperbola’s foci lie beyond its vertices: $c^2 = a^2 + b^2$.` }] : [],
          hints: [t`For a hyperbola, $c^2 = a^2 + b^2$ — half the diagonal of the box in the picture.`],
          teach: 'A hyperbola’s foci sit at c = √(a² + b²): farther out than the vertices, at the corners’ distance of the a-by-b box.',
          explain: t`$c = \sqrt{${a * a} + ${b * b}} = ${c}$: the foci are $(\pm${c}, 0)$, outside the vertices $(\pm${a}, 0)$.`,
        };
      },
    }),
    mcq({
      id: 'classify-xy', difficulty: 3,
      gen(r) {
        const M = r.pick(MIXED), D = M.B * M.B - 4 * M.A * M.C;
        const types = ['hyperbola', 'ellipse', 'parabola', 'circle'];
        const answer = types.indexOf(M.type);
        const why = {};
        if (M.type !== 'hyperbola') why[0] = t`A hyperbola needs $B^2 - 4AC > 0$; here it is $${D}$.`;
        if (M.type !== 'ellipse') why[1] = t`${M.dropName}: that is what the equation would be **without** its $xy$-term. The $xy$-term does not just rotate it — here $B^2 - 4AC = ${D}$.`;
        if (M.type !== 'parabola') why[2] = t`A parabola needs $B^2 - 4AC = 0$; here it is $${D}$.`;
        why[3] = t`A circle needs no $xy$-term at all ($B = 0$) and equal coefficients of $x^2$ and $y^2$.`;
        return {
          prompt: t`Which conic is $${M.eq}$?`,
          visual: cart([-3, 3], [-2, 2], { curves: [{ ...M.drop, color: 'ink3', dash: true }] }, t`Dashed: ${M.dropName} — the same equation with the $xy$-term deleted. It is not the answer.`),
          choices: types.map((s) => (s === 'ellipse' ? 'an ellipse' : `a ${s}`)),
          answer,
          why,
          hints: [t`For $Ax^2 + Bxy + Cy^2 + \dots = 0$, compute the discriminant $B^2 - 4AC$.`, t`$B^2 - 4AC < 0$: ellipse; $= 0$: parabola; $> 0$: hyperbola. (OpenStax writes the same test as $4AC - B^2$, with the signs flipped.)`],
          teach: 'The discriminant B² − 4AC classifies a second-degree curve without rotating it: negative ellipse, zero parabola, positive hyperbola.',
          explain: t`$A = ${M.A}$, $B = ${M.B}$, $C = ${M.C}$: $B^2 - 4AC = ${M.B * M.B} - ${4 * M.A * M.C} = ${D}$, so it is ${M.type === 'ellipse' ? 'an' : 'a'} ${M.type}. Rotating the axes would remove the $xy$-term but cannot change the sign of the discriminant.`,
        };
      },
    }),
    num({
      id: 'rotation-angle', difficulty: 3,
      gen(r) {
        const R = r.pick(ROTATED), th = (R.deg * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
        const X = `${R.p}*cos(t)*${round(c, 6)} - ${round(R.q, 6)}*sin(t)*${round(s, 6)}`, Y = `${R.p}*cos(t)*${round(s, 6)} + ${round(R.q, 6)}*sin(t)*${round(c, 6)}`;
        return {
          prompt: t`The ellipse $${R.eq}$ is tilted. Through what angle $\theta$ ($0^\circ < \theta < 90^\circ$) must the axes be rotated to remove the $xy$-term? Give $\theta$ in degrees.`,
          visual: cart([-2.6, 2.6], [-2.2, 2.2], {
            curves: [{ param: [X, Y], t: [0, '2*pi'], color: 'accent' }, { param: [`t*${round(c, 6)}`, `t*${round(s, 6)}`], t: [-3, 3], color: 'gold', width: 1.4, dash: true }, { param: [`-t*${round(s, 6)}`, `t*${round(c, 6)}`], t: [-3, 3], color: 'gold', width: 1.4, dash: true }],
            texts: [{ text: 'x′', x: 2.25 * c + 0.12, y: 2.25 * s - 0.1, color: 'gold' }, { text: 'y′', x: -2.1 * s - 0.12, y: 2.1 * c, color: 'gold' }],
          }, t`The ellipse and the rotated axes $x'$, $y'$ (gold) along which its equation has no $xy$-term.`),
          answer: R.deg, tol: { abs: 0.5 },
          errors: [{ value: 2 * R.deg, feedback: t`That is $2\theta$. The formula gives $\cot 2\theta$; halve the angle.` }],
          hints: [t`Rotating by $\theta$ removes the $xy$-term when $\cot 2\theta = \dfrac{A - C}{B}$.`, t`Here $A = ${R.A}$, $B = ${R.B}$, $C = ${R.C}$, so $\cot 2\theta = \dfrac{${R.A - R.C}}{${R.B}}$.`],
          teach: 'The rotation that removes the xy-term satisfies cot 2θ = (A − C)/B.',
          explain: t`$\cot 2\theta = \dfrac{${R.A} - ${R.C}}{${R.B}}$ gives $2\theta = ${2 * R.deg}^\circ$, so $\theta = ${R.deg}^\circ$. In the rotated axes the equation becomes $\dfrac{x'^2}{${nice(R.p * R.p)}} + \dfrac{y'^2}{${nice(R.q * R.q)}} = 1$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hyperbola-e', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 6, 10]]);
        const m = 1.6 * c;
        return {
          prompt: t`Find the eccentricity of the hyperbola $\dfrac{x^2}{${a * a}} - \dfrac{y^2}{${b * b}} = 1$. Give 3 significant figures.`,
          visual: cart([-m, m], [-0.6 * m, 0.6 * m], {
            curves: [{ param: [`${a}*cosh(t)`, `${b}*sinh(t)`], t: [-2.5, 2.5], color: 'accent' }, { param: [`-${a}*cosh(t)`, `${b}*sinh(t)`], t: [-2.5, 2.5], color: 'accent' }],
            points: [{ x: c, y: 0, color: 'violet' }, { x: -c, y: 0, color: 'violet' }],
          }, 'The hyperbola and its foci.'),
          answer: c / a, tol: { rel: 0.005 },
          errors: [{ value: a / c, feedback: t`Upside down: $e = c/a$, and for a hyperbola $e > 1$.` }],
          hints: [t`$c = \sqrt{a^2 + b^2}$, then $e = c/a$.`],
          teach: 'For a hyperbola e = c/a with c² = a² + b², so e > 1.',
          explain: t`$c = \sqrt{${a * a} + ${b * b}} = ${c}$ and $e = ${c}/${a} \approx ${fmt(c / a)}$ — greater than 1, as every hyperbola’s is.`,
        };
      },
    }),
    num({
      id: 'cp-planet-e', difficulty: 3, transfer: true,
      gen(r) {
        const [name, q, Q] = r.pick([['Earth', 147.1, 152.1], ['Mars', 206.65, 249.26], ['Mercury', 46.0, 69.82], ['Jupiter', 740.6, 816.4]]);
        const a = (q + Q) / 2, c = a - q, e = c / a;
        const s = 3 / a;    // draw with a = 3
        return {
          prompt: t`${name}’s orbit is an ellipse with the Sun at one focus. Its closest approach to the Sun (perihelion) is ${q} million km and its farthest (aphelion) ${Q} million km. Find the eccentricity of the orbit. Give 3 significant figures.`,
          visual: cart([-4.6, 4.6], [-3.4, 3.4], {
            curves: [{ param: ['3*cos(t)', `${round(3 * Math.sqrt(1 - e * e), 5)}*sin(t)`], t: [0, '2*pi'], color: 'accent' }],
            points: [{ x: round(c * s), y: 0, color: 'gold', label: 'Sun', labelDy: 14, size: 6 }, { x: 0, y: 0, color: 'ink3', size: 3, label: 'centre', labelDx: -46, labelDy: -12 }],
            segments: [{ from: [round(c * s), -0.3], to: [3, -0.3], color: 'warn', label: 'perihelion', labelDx: -30, labelDy: 14 }, { from: [-3, 0.3], to: [round(c * s), 0.3], color: 'teal', label: 'aphelion', labelDx: -30, labelDy: -10 }],
          }, t`${name}’s orbit to scale. Its eccentricity is small${e < 0.1 ? ' — the orbit is almost a circle, and the Sun sits just off-centre' : ''}.`),
          answer: e, tol: { rel: 0.005 },
          errors: [{ value: q / Q, feedback: 'That is the ratio of the distances. The eccentricity is c/a: the Sun’s offset from the centre over the semi-major axis.' }],
          hints: [t`Perihelion $= a - c$ and aphelion $= a + c$, where $a$ is the semi-major axis and $c$ the centre-to-focus distance.`, t`So $a = \tfrac12(${q} + ${Q})$ and $c = \tfrac12(${Q} - ${q})$.`],
          teach: 'From the closest and farthest distances: a is their average, c half their difference, and e = c/a.',
          explain: t`$a = ${nice(a)}$ million km, $c = ${nice(c)}$ million km, so $e = c/a \approx ${fmt(e)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-focus-directrix', difficulty: 2,
      gen(r) {
        const [pf, pd] = r.pick([[3, 2], [2, 3], [4, 4], [5, 4], [3, 5]]);
        const e = pf / pd, type = e > 1 ? 'hyperbola' : e < 1 ? 'ellipse' : 'parabola';
        const choices = ['a hyperbola', 'an ellipse', 'a parabola', 'a circle'];
        const answer = ['hyperbola', 'ellipse', 'parabola'].indexOf(type);
        const why = {
          0: t`A hyperbola has $e = PF/PD > 1$; here $e = ${pf}/${pd}$.`,
          1: t`An ellipse has $e = PF/PD < 1$; here $e = ${pf}/${pd}$.`,
          2: 'A parabola has PF = PD exactly.',
          3: 'A circle has no directrix; it is the limit e → 0.',
        };
        delete why[answer];
        const fx = round(pd + pf * 0.6), fy = round(2 - pf * 0.8);
        return {
          prompt: t`A point $P$ on a conic is ${pf} cm from the focus and ${pd} cm from the directrix. What kind of conic is it?`,
          visual: cart([-1.5, 8], [-2.4, 3.6], {
            vlines: [{ x: 0, color: 'teal', label: 'directrix' }],
            points: [{ x: pd, y: 2, color: 'ink', label: 'P' }, { x: fx, y: fy, color: 'violet', label: 'F', labelDy: 14 }],
            segments: [{ from: [pd, 2], to: [0, 2], color: 'teal', dash: true, label: `PD = ${pd}`, labelDx: -24, labelDy: -10 }, { from: [pd, 2], to: [fx, fy], color: 'violet', label: `PF = ${pf}`, labelDx: 8, labelDy: 0 }],
          }, 'The two distances that define the conic, for one of its points.'),
          choices, answer, why,
          hints: [t`The eccentricity is $e = PF/PD$, the same for every point of the conic.`],
          teach: 'e = PF/PD classifies the conic: below 1 ellipse, 1 parabola, above 1 hyperbola.',
          explain: t`$e = PF/PD = ${pf}/${pd}${pf === pd ? '' : t` \approx ${nice(pf / pd, 3)}`}$, so it is ${choices[answer]}.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §7.5 Conic Sections', url: 'https://openstax.org/books/calculus-volume-2/pages/7-5-conic-sections' },
    { label: 'NASA Planetary Fact Sheet (perihelion and aphelion)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
