// Parabolas — every point equally far from a focus and a directrix; (x − h)² = 4p(y − k); the reflector property.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig, frac } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { seg, plane, dot, note, ptTeX } from './_m0geo.js';

const t = String.raw;
// the parabola (x − h)² = 4p(y − k), optionally with focus and directrix
const parabPic = ({ h = 0, k = 0, p, xr = 4.5, caption, focus = true, directrix = true, ticks = true, extra = {}, rays = [] }) => {
  const yTop = k + (xr * xr) / (4 * Math.abs(p)) * Math.sign(p);
  const ys = [k, yTop, k + p, k - p];
  const pad = Math.min(0.8, 0.25 * xr), y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad, half = Math.max(xr + pad, (y1 - y0));
  const curves = [{ fn: `${N(k)} + (x - (${N(h)}))^2/${N(4 * p)}`, domain: [N(h - xr), N(h + xr)], color: 'accent', width: 2.6 }];
  for (const xr0 of rays) {
    const yP = k + (xr0 - h) ** 2 / (4 * p);
    curves.push(seg([xr0, p > 0 ? y1 : y0], [xr0, yP], { color: 'gold', width: 1.8, dash: true }));
  }
  return plane({
    x: [h - half, h + half], y: [(y0 + y1) / 2 - half / 2, (y0 + y1) / 2 + half / 2], ticks, curves,
    points: focus ? [dot([h, k + p], 'F', { color: 'warn' })] : [],
    caption, extra: { ...(directrix ? { hlines: [{ y: N(k - p), color: 'teal', label: 'directrix' }] } : {}), ...extra },
  });
};

export default lesson({
  id: 'm0.M0-11.1',
  title: 'Parabolas',
  minutes: 9, difficulty: 2,
  intro: t`A **parabola** is every point that is as far from a fixed point, the **focus**, as from a fixed line, the **directrix**. Put the vertex at $(h, k)$, the focus a distance $p$ above it and the directrix $p$ below, and that one condition becomes

$$(x - h)^2 = 4p\,(y - k)$$

$|p|$ is the **focal length**; $p > 0$ opens upward, $p < 0$ downward (swap $x$ and $y$ for a sideways parabola). In the form $y = ax^2$ the focal length is $p = \tfrac{1}{4a}$: a flat, wide parabola has a distant focus. The definition hides a gift: a ray travelling parallel to the axis reflects off the parabola **straight through the focus** — every one of them. That is why dish antennas, telescope mirrors and car headlights are paraboloids.`,
  symbols: [
    { tex: '(h, k)', text: 'the **vertex**: the turning point, halfway between focus and directrix' },
    { tex: 'p', text: 'the **focal length**, signed: the distance from the vertex to the focus (in the axes’ unit)' },
    { tex: 'F = (h, k + p)', text: 'the **focus**' },
    { tex: 'y = k - p', text: 'the **directrix**, a line as far below the vertex as the focus is above' },
  ],
  why: t`Every thrown object without air resistance flies a parabola (you eliminated $t$ to get one in [parametric motion](#/lesson/m0.M0-9.3)); a spacecraft at exactly escape speed leaves on a parabolic orbit; and every radio telescope and satellite dish uses the focus property. The [conics lesson in Calculus II](#/lesson/math1220.C2-6.5) puts parabolas beside ellipses and hyperbolas in one family.`,
  visual: {
    type: 'graph',
    title: 'Focus, directrix and a reflecting ray',
    lead: t`Slide the point $P$ along the parabola. Its distance to the focus $F$ (orange) always equals its distance to the directrix (teal). The gold ray comes straight down, parallel to the axis, and reflects at $P$ — through $F$, wherever $P$ is.`,
    tasks: [
      t`Move $P$ anywhere: the two readouts stay equal. That equality **is** the parabola.`,
      t`Increase $p$: the focus rises, the directrix drops, and the parabola opens wider — a long focal length means a shallow dish.`,
      t`Move $P$ out to the rim and back to the middle: every incoming ray parallel to the axis passes through $F$ after reflecting.`,
    ],
    params: {
      x: [-8, 8], y: [-2.5, 5.5], equal: true, aspect: 'wide',
      sliders: [
        { key: 'p', label: 'Focal length $p$', min: 0.4, max: 2, step: 0.05, value: 1, explain: 'The distance from the vertex to the focus (and to the directrix).' },
        { key: 's', label: t`Position of $P$ ($x$)`, min: -4.5, max: 4.5, step: 0.05, value: 2.6, explain: t`Where on the parabola $P$ sits.` },
      ],
      curves: [
        { fn: 'x^2/(4*p)', color: 'accent', width: 2.6 },
        { param: ['s', '5.5 - t*(5.5 - s^2/(4*p))'], t: [0, 1], color: 'gold', width: 2, dash: true },
        { param: ['s*(1 - t)', 's^2/(4*p) + t*(p - s^2/(4*p))'], t: [0, 1], color: 'warn', width: 2.4 },
        { param: ['s', 's^2/(4*p) - t*(s^2/(4*p) + p)'], t: [0, 1], color: 'teal', width: 2.4, dash: true },
      ],
      hlines: [{ y: '-p', color: 'teal', label: 'directrix' }],
      points: [
        { x: 0, y: 'p', r: 5, color: 'warn', label: 'F', labelDx: -16, labelDy: -8 },
        { x: 's', y: 's^2/(4*p)', r: 5.5, color: 'gold', label: 'P' },
      ],
      readouts: [
        { label: t`$PF$`, expr: 'sqrt(s^2 + (s^2/(4*p) - p)^2)', digits: 4 },
        { label: t`distance to directrix`, expr: 's^2/(4*p) + p', digits: 4 },
      ],
    },
    caption: t`To scale: $y = x^2/(4p)$ with the vertex at the origin. The orange segment is both $PF$ and the reflected ray; a real dish is this curve spun about its axis (a paraboloid).`,
  },
  example: {
    prompt: t`A parabola has focus $(3, 1)$ and directrix $y = -3$. Find its vertex, its focal length and its equation, and check one point.`,
    visual: parabPic({ h: 3, k: -1, p: 2, xr: 5, caption: t`The focus $F$, the directrix (teal) and the parabola they define. To scale.`, extra: { points: [dot([3, 1], 'F', { color: 'warn' }), dot([7, 1], 'Q(7, 1)', { color: 'gold' }), dot([3, -1], 'vertex', { color: 'ink2', labelDy: 14 })] } }),
    steps: [
      { label: 'Vertex', text: t`Halfway between the focus and the directrix, straight below the focus: $x = 3$, $y = \tfrac{1 + (-3)}{2} = -1$. Vertex $(3, -1)$.` },
      { label: 'Focal length', text: t`From the vertex up to the focus: $p = 1 - (-1) = 2$. Positive, so it opens upward.` },
      { label: 'Equation', text: t`$(x - 3)^2 = 4(2)(y + 1)$, i.e. $(x - 3)^2 = 8(y + 1)$.` },
      { label: 'Check a point', text: t`At $x = 7$: $16 = 8(y + 1)$ gives $y = 1$, so $Q(7, 1)$ is on it. Its distance to $F$ is $\sqrt{4^2 + 0^2} = 4$; its distance to the directrix is $1 - (-3) = 4$ ✓.` },
    ],
    answer: t`Vertex $(3, -1)$, $p = 2$, $(x - 3)^2 = 8(y + 1)$.`,
  },
  practice: [
    num({
      id: 'focal-from-a', difficulty: 1,
      gen(r) {
        const a = r.pick([1 / 8, 1 / 4, 1 / 12, 1 / 2, 2, 1 / 16]), ans = 1 / (4 * a);
        return {
          prompt: t`How far above the vertex is the focus of $y = ${frac(a)}x^2$?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 4 * a, feedback: t`Upside down: $y = ax^2$ is $x^2 = \tfrac1a y = 4py$, so $p = \tfrac{1}{4a}$.` }, { value: 1 / a, feedback: t`$\tfrac1a$ is $4p$; divide by $4$.` }, { value: a / 4, feedback: t`Match $x^2 = 4py$: $4p = 1/a$, so $p = 1/(4a)$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Rewrite as $x^2 = \text{(something)}\,y$ and match with $x^2 = 4py$.`],
          teach: t`$y = ax^2$ has focal length $p = \tfrac{1}{4a}$: the flatter the parabola, the farther its focus.`,
          explain: t`$x^2 = ${frac(1 / a)}\,y = 4py$ gives $p = ${frac(ans)}$.`,
          visual: parabPic({ p: ans, xr: Math.min(4.5, 3 * Math.sqrt(ans) + 1), focus: false, directrix: false, caption: t`$y = ${frac(a)}x^2$; the focus is somewhere on the axis above the vertex.` }),
        };
      },
    }),
    mcq({
      id: 'which-focus', difficulty: 2,
      gen(r) {
        const c = r.pick([8, 12, 16, 20]), s = r.sign(), p = (s * c) / 4;
        return {
          prompt: t`Where is the focus of $x^2 = ${s < 0 ? '-' : ''}${c}y$?`,
          choices: [t`$(0,\ ${p})$`, t`$(0,\ ${-p})$`, t`$(0,\ ${s * c})$`, t`$(${p},\ 0)$`],
          answer: 0,
          why: {
            1: t`Sign: $4p = ${s * c}$ makes $p ${s < 0 ? '< 0' : '> 0'}$ — the parabola opens ${s < 0 ? 'downward' : 'upward'} and the focus is ${s < 0 ? 'below' : 'above'} the vertex.`,
            2: t`$${s * c}$ is $4p$, not $p$: divide by $4$.`,
            3: t`$x^2 = 4py$ is symmetric about the $y$-axis, so the focus is on the $y$-axis.`,
          },
          hints: [t`Match $x^2 = 4py$: $4p = ${s * c}$.`],
          teach: t`In $x^2 = 4py$ the focus is $(0, p)$; the sign of $p$ says which way it opens.`,
          explain: t`$p = ${s * c}/4 = ${p}$: focus $(0, ${p})$, directrix $y = ${-p}$.`,
          visual: parabPic({ p, xr: 5, focus: false, directrix: false, ticks: false, caption: t`$x^2 = ${s < 0 ? '-' : ''}${c}y$ (axis numbers hidden).` }),
        };
      },
    }),
    {
      type: 'point', id: 'drag-focus', difficulty: 2,
      gen(r) {
        const h = r.intExcept(-2, 2, [0]), k = r.int(-2, 1), p = r.pick([0.5, 1, 1.5]);
        const v = parabPic({ h, k, p, xr: 3.5, focus: false, directrix: false, caption: t`The parabola $y = ${k === 0 ? '' : `${k} + `}\dfrac{(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2}{${N(4 * p)}}$ on a square grid. Drag the ring.` });
        v.params.drag = [{ key: 'q', x: h + 2.5, y: k - 1, snap: 0.25 }];
        return {
          prompt: t`Drag the ring to the focus of $y = ${k === 0 ? '' : `${k} + `}\dfrac{(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2}{${N(4 * p)}}$.`,
          visual: v, answer: { x: h, y: k + p }, tol: { x: 0.15, y: 0.15 },
          instruction: 'Drag the ring to the focus, then check.',
          hints: [t`The vertex is $(${h}, ${k})$. Compare the denominator with $4p$.`, t`$4p = ${N(4 * p)}$, so the focus is $${N(p)}$ above the vertex.`],
          teach: t`Focus = vertex + $p$ along the axis, with $4p$ read off the equation.`,
          explain: t`Vertex $(${h}, ${k})$, $p = ${N(p)}$: focus $${ptTeX([h, k + p])}$.`,
        };
      },
    },
    expr({
      id: 'from-focus', difficulty: 3,
      gen(r) {
        const h = r.intExcept(-3, 3, [0]), k = r.intExcept(-2, 2, [0]), p = r.pick([1, 2, -1, -2]);
        return {
          prompt: t`Write the equation of the parabola with focus $${ptTeX([h, k + p])}$ and directrix $y = ${k - p}$.`,
          answer: `(x - (${h}))^2 = ${4 * p}*(y - (${k}))`, answerTeX: t`(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 = ${4 * p}(y ${k < 0 ? '+' : '-'} ${Math.abs(k)})`, mode: 'equation',
          vars: { x: [-5, 5], y: [-5, 5] },
          errors: [
            { answer: `(x - (${h}))^2 = ${8 * p}*(y - (${k}))`, feedback: t`You took $p$ as the whole focus-to-directrix distance, $${Math.abs(2 * p)}$. The focal length is half of it: vertex to focus.` },
            { answer: `(x - (${h}))^2 = ${4 * p}*(y - (${k + p}))`, feedback: t`The vertex is not the focus: it lies halfway between the focus and the directrix, at $y = ${k}$.` },
            { answer: `(x - (${h}))^2 = ${-4 * p}*(y - (${k}))`, feedback: t`The parabola opens toward the focus: the focus is ${p > 0 ? 'above' : 'below'} the directrix, so $p ${p > 0 ? '> 0' : '< 0'}$.` },
          ],
          hints: [t`The vertex is halfway between focus and directrix: $(${h},\ ${k})$.`, t`$p$ = vertex to focus $= ${p}$. Use $(x - h)^2 = 4p(y - k)$.`],
          teach: t`Vertex halfway between focus and directrix; $p$ from vertex to focus, signed.`,
          explain: t`Vertex $(${h}, ${k})$, $p = ${p}$: $(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 = ${4 * p}(y ${k < 0 ? '+' : '-'} ${Math.abs(k)})$.`,
          visual: plane({ x: [h - 6, h + 6], y: [k - 3, k + 3], points: [dot([h, k + p], 'F', { color: 'warn' })], extra: { hlines: [{ y: k - p, color: 'teal', label: 'directrix' }] }, caption: t`The focus and the directrix on a square grid.` }),
        };
      },
    }),
    num({
      id: 'dish-depth', difficulty: 2,
      gen(r) {
        const D = r.pick([0.6, 1.2, 2.4, 3.7]), f = r.pick([0.25, 0.45, 0.8, 1.3]), R = D / 2, ans = (R * R) / (4 * f);
        return {
          prompt: t`A dish antenna $${D}$ m across has its feed at the focus, $${f}$ m in front of the vertex. Its cross-section is $y = x^2/(4p)$ with $p = ${f}$ m. How deep is the dish at its rim, in metres?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (D * D) / (4 * f), feedback: t`The rim is at $x = \pm${R}$ m — half the diameter, not all of it.` }, { value: R / (4 * f), feedback: t`Square the rim’s $x$: $y = x^2/(4p)$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The rim is at $x = D/2 = ${R}$ m.`],
          teach: t`Depth at radius $R$: $y = R^2/(4p)$ — a long focal length makes a shallow dish.`,
          explain: t`$y = ${R}^2/(4 \times ${f}) = ${sig(ans, 3)}$ m.`,
          visual: parabPic({ p: f, xr: R, directrix: false, ticks: true, caption: t`The dish’s cross-section to scale (metres), with the feed at the focus $F$.` }),
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-reflect', difficulty: 2, transfer: true,
      prompt: t`Signals from a distant spacecraft arrive at a parabolic dish travelling parallel to its axis. One strikes near the rim, another near the centre. Where do they go after reflecting?`,
      choices: ['Both pass through the focus', 'Each reflects straight back along its own path', 'The one near the rim passes through the focus; the one near the centre goes back out', 'They cross at the vertex'],
      answer: 0,
      why: {
        1: 'Only a ray hitting a surface head-on bounces straight back; the dish is tilted to the rays everywhere except at the vertex.',
        2: 'The focus property holds for every ray parallel to the axis, near the centre as well as near the rim.',
        3: 'The vertex is on the dish itself; the reflected rays meet in front of it, at the focus.',
      },
      hints: [t`The focus property does not depend on where along the dish the ray lands.`],
      teach: t`A parabola sends every ray parallel to its axis through its focus — that is what the dish is for.`,
      explain: t`Every axis-parallel ray reflects through $F$, which is why the receiver (or the feed horn) sits there; run backwards, a source at $F$ makes a parallel beam.`,
      visual: parabPic({ p: 1.2, xr: 4, directrix: false, rays: [3.6, 0.9], caption: t`A dish’s cross-section, its focus, and two incoming rays parallel to the axis (gold dashed).` }),
    }),
    num({
      id: 'cp-focus-y', difficulty: 3,
      gen(r) {
        const h = r.intExcept(-4, 4, [0]), k = r.intExcept(-3, 3, [0]), p = r.pick([1, 2, 3]), A = 4 * p, B = -2 * h, C = h * h + 4 * p * k, ans = k + p;
        return {
          prompt: t`Find the $y$-coordinate of the focus of $y = \dfrac{x^2 ${B < 0 ? '-' : '+'} ${Math.abs(B)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)}}{${A}}$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: k, feedback: t`That is the vertex’s height. The focus is $p = ${p}$ above it.` }, { value: k + A, feedback: t`$${A}$ is $4p$; the focus is $p = ${p}$ above the vertex.` }, { value: k - p, feedback: t`That is the directrix. The focus is on the inside of the curve, above the vertex for an upward parabola.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Complete the square in the numerator: $x^2 ${B < 0 ? '-' : '+'} ${Math.abs(B)}x = (x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 - ${h * h}$.`, t`So $y = \dfrac{(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2}{${A}} ${k < 0 ? '-' : '+'} ${Math.abs(k)}$: vertex $(${h}, ${k})$, $4p = ${A}$.`],
          teach: t`Complete the square to reach vertex form; then the focus is $p$ above the vertex.`,
          explain: t`$y - (${k}) = \tfrac{1}{${A}}(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2$: vertex $(${h}, ${k})$, $p = ${p}$, focus $(${h}, ${ans})$.`,
          visual: parabPic({ h, k, p, xr: 4, focus: false, directrix: false, ticks: false, caption: t`The parabola (axis numbers hidden).` }),
        };
      },
    }),
    num({
      id: 'cp-hga', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.6, 0.9, 1.1]), d = r.pick([0.2, 0.3, 0.35]), R = Math.sqrt(4 * f * d), ans = 2 * R;
        return {
          prompt: t`A spacecraft’s high-gain antenna is a paraboloid whose feed sits $${f}$ m in front of the vertex (the focal length). The dish is $${d}$ m deep at its rim. What is its diameter, in metres?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: R, feedback: t`That is the rim’s radius; the diameter is twice it.` }, { value: 2 * Math.sqrt(f * d), feedback: t`$x^2 = 4py$: the factor $4$ goes inside the root.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The rim is where $y = ${d}$ on $x^2 = 4py$ with $p = ${f}$.`, t`$x = \sqrt{4 \times ${f} \times ${d}}$ is the radius.`],
          teach: t`$x^2 = 4py$ links a dish’s focal length, depth and radius: any two give the third.`,
          explain: t`$R = \sqrt{4(${f})(${d})} = ${sig(R, 3)}$ m, so the diameter is $${sig(ans, 3)}$ m.`,
          visual: parabPic({ p: f, xr: R, directrix: false, caption: t`The antenna’s cross-section to scale (metres), feed at $F$.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §10.3 The Parabola', url: 'https://openstax.org/books/precalculus-2e/pages/10-3-the-parabola' },
  ],
});
void note;
