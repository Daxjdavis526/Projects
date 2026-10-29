// Completing the square — the missing corner that turns x² + bx into a perfect square.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig, frac } from '../../src/core/format.js';
import { N, sgn, areaModel, bothSides, thou } from './_m0kit.js';

const t = String.raw;

// x² + bx drawn as a square plus two strips, with the corner (b/2)² that completes it
function cornerFig(b, caption, { corner = '?', X = 3 } = {}) {
  const hb = Math.abs(b) / 2, s = Math.min(0.5, 2.4 / hb), w = hb * s;   // the strips are drawn at a fixed scale
  const half = Number.isInteger(hb) ? String(hb) : `${Math.abs(b)}/2`, strip = hb === 1 ? "x" : Number.isInteger(hb) ? `${hb}x` : `(${half})x`;
  return areaModel({
    x: [-0.9, X + w + 0.5], y: [-0.7, X + w + 0.3],
    rects: [
      { x: 0, y: 0, w: X, h: X, color: 'accent', label: 'x²' },
      { x: X, y: 0, w, h: X, color: 'gold', label: strip },
      { x: 0, y: X, w: X, h: w, color: 'gold', label: strip },
      { x: X, y: X, w, h: w, color: 'ink4', alpha: 0.06, dashed: true, label: corner },
    ],
    sides: [{ x: X / 2, y: -0.35, label: 'x' }, { x: X + w / 2, y: -0.35, label: half }, { x: -0.45, y: X / 2, label: 'x' }, { x: -0.45, y: X + w / 2, label: half }],
    caption,
  });
}

export default lesson({
  id: 'm0.M0-2.4',
  title: 'Completing the square',
  minutes: 8, difficulty: 2,
  intro: t`Any quadratic can be rewritten so that $x$ appears only once, inside a square:

$$x^2 + bx + c = \left(x + \tfrac{b}{2}\right)^2 + c - \tfrac{b^2}{4}$$

The picture explains it: $x^2 + bx$ is a square with two strips of width $b/2$ attached — a big square missing one **corner of area $(b/2)^2$**. Add the corner and subtract it again. The completed form tells you a parabola’s vertex, solves the equation, and prepares integrals like $\int \frac{dx}{x^2 + 2x + 5}$.`,
  symbols: [
    { tex: 'b', text: 'the coefficient of $x$; half of it, $b/2$, is the width of each strip' },
    { tex: 'c', text: 'the constant term' },
    { tex: '\\left(\\tfrac{b}{2}\\right)^2', text: 'the missing corner that completes the square' },
    { tex: 'c - \\tfrac{b^2}{4}', text: 'what is left over: the value at the vertex, the minimum of $x^2 + bx + c$' },
  ],
  why: t`Vertex form gives a projectile’s peak height without calculus, the centre and radius of a circle, and the quadratic formula itself — which is just completing the square once, in general.`,
  visual: {
    type: 'graph',
    title: 'The missing corner',
    lead: t`The blue square is $x^2$ and the two gold strips are $\tfrac b2 x$ each, so together they are $x^2 + bx$. The dashed corner is what is missing from a perfect square of side $x + \tfrac b2$. Slide $b$.`,
    tasks: [
      t`Set $b = 6$: the strips are $3x$ each and the corner is $9$, so $x^2 + 6x + 9 = (x + 3)^2$.`,
      t`Double $b$: the corner’s area quadruples — it goes as $(b/2)^2$.`,
      t`With $b = 6$, $x^2 + 6x + 5$ is the square $(x + 3)^2$ less $4$: the corner holds $9$ but only $5$ was there.`,
    ],
    params: {
      x: [-0.8, 6.5], y: [-0.6, 6.4], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      sliders: [{ key: 'b', label: t`Coefficient $b$`, min: 1, max: 6, step: 0.5, value: 4, explain: t`The coefficient of $x$ in $x^2 + bx$; each strip is $b/2$ wide.` }],
      shade: [
        { fn: '3', lower: '0', from: 0, to: 3, color: 'accent', alpha: 0.35 },
        { fn: '3', lower: '0', from: 3, to: '3 + b/2', color: 'gold', alpha: 0.35 },
        { fn: '3 + b/2', lower: '3', from: 0, to: 3, color: 'gold', alpha: 0.35 },
        { fn: '3 + b/2', lower: '3', from: 3, to: '3 + b/2', color: 'teal', alpha: 0.12 },
      ],
      curves: [
        { fn: '0', domain: [0, '3 + b/2'], color: 'ink3', width: 1.4 }, { fn: '3', domain: [0, '3 + b/2'], color: 'ink3', width: 1.4 },
        { fn: '3 + b/2', domain: [0, 3], color: 'ink3', width: 1.4 }, { fn: '3 + b/2', domain: [3, '3 + b/2'], color: 'teal', width: 1.6, dash: true },
        { param: ['0', 't'], t: [0, '3 + b/2'], color: 'ink3', width: 1.4 }, { param: ['3', 't'], t: [0, '3 + b/2'], color: 'ink3', width: 1.4 },
        { param: ['3 + b/2', 't'], t: [0, 3], color: 'ink3', width: 1.4 }, { param: ['3 + b/2', 't'], t: [3, '3 + b/2'], color: 'teal', width: 1.6, dash: true },
      ],
      points: [
        { x: 1.5, y: 1.5, r: 0, label: 'x²', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: '3 + b/4', y: 1.5, r: 0, label: '(b/2)x', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 1.5, y: '3 + b/4', r: 0, label: '(b/2)x', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: '3 + b/4', y: '3 + b/4', r: 0, label: '(b/2)²', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'teal' },
        { x: 1.5, y: -0.35, r: 0, label: 'x', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
        { x: '3 + b/4', y: -0.35, r: 0, label: 'b/2', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
      ],
      readouts: [{ label: t`strip width $b/2$`, expr: 'b/2', digits: 3 }, { label: t`missing corner $(b/2)^2$`, expr: '(b/2)^2', digits: 3 }],
    },
    caption: t`The side $x$ is drawn at a fixed length; only $b$ changes. For negative $b$ the strips are “subtracted”, which a picture of areas cannot show, but the algebra is the same.`,
  },
  example: {
    prompt: t`A model rocket coasting upward has height $h(t) = -4.9t^2 + 19.6t + 1.5$ (metres, seconds). Complete the square to find its peak height and when it is reached.`,
    visual: { type: 'graph', params: { x: [-0.2, 4.4], y: [-2, 25], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: '-4.9x^2 + 19.6x + 1.5', color: 'accent', domain: [0, 4.07] }], points: [{ x: 2, y: 21.1, label: 'vertex (2, 21.1)', color: 'gold' }], hlines: [{ y: 21.1, color: 'ink4' }] }, caption: t`The height against time. No air resistance — a real model rocket peaks lower.` },
    steps: [
      { label: 'Factor the leading coefficient', text: t`Take $-4.9$ out of the $t$ terms only: $h = -4.9\,(t^2 - 4t) + 1.5$.` },
      { label: 'Complete the square', text: t`Half of $-4$ is $-2$, and $(-2)^2 = 4$: $\;t^2 - 4t = (t - 2)^2 - 4$.` },
      { label: 'Put it back', text: t`$h = -4.9\big[(t - 2)^2 - 4\big] + 1.5 = -4.9\,(t - 2)^2 + 19.6 + 1.5$. The $-4$ inside the bracket is multiplied by $-4.9$ too.` },
      { label: 'Read the vertex', text: t`$h = 21.1 - 4.9\,(t - 2)^2$. The squared term is never negative, so $h$ is largest when it is zero: at $t = 2$ s, $h = 21.1$ m.` },
      { label: 'Sense check', text: t`At $t = 2$ s the velocity $19.6 - 9.8t$ is zero — the rocket stops rising — exactly what calculus would say.` },
    ],
    answer: t`$h = 21.1 - 4.9\,(t - 2)^2$: peak $21.1$ m at $t = 2$ s.`,
  },
  practice: [
    num({
      id: 'complete-q', difficulty: 1,
      gen(r) {
        const b = r.sign() * r.pick([2, 4, 6, 8, 10]), c = r.intExcept(-5, 12, [0]);
        const q = c - b * b / 4;
        const errors = [];
        for (const [v, f] of [[c + b * b / 4, t`The corner is *added* to make the square, so it must be *subtracted* again: $c - (b/2)^2$.`], [c - b * b, t`The corner is $(b/2)^2 = ${b * b / 4}$, not $b^2$: each strip is half of $b$ wide.`], [c - Math.abs(b) / 2, t`The corner’s area is $(b/2)^2$, the square of the strip width.`]]) {
          if (v !== q && !errors.some((e) => e.value === v)) errors.push({ value: v, feedback: f });
        }
        return {
          prompt: t`Write $x^2 ${sgn(b, 'x')} ${sgn(c)}$ as $\left(x ${sgn(b / 2)}\right)^2 + q$. What is $q$?`,
          answer: q, tol: { rel: 0, abs: 1e-9 },
          errors,
          hints: [t`$\left(x ${sgn(b / 2)}\right)^2 = x^2 ${sgn(b, 'x')} + ${b * b / 4}$.`, t`So $q$ is whatever is left: $${c} - ${b * b / 4}$.`],
          teach: t`Completing the square adds the corner $(b/2)^2$ and subtracts it again, so $q = c - (b/2)^2$.`,
          explain: t`$x^2 ${sgn(b, 'x')} ${sgn(c)}$ $= \left(x ${sgn(b / 2)}\right)^2 - ${b * b / 4} ${sgn(c)}$ $= \left(x ${sgn(b / 2)}\right)^2 ${sgn(q)}$.`,
          visual: cornerFig(b, t`$x^2 + ${Math.abs(b)}x$ as a square and two strips; the dashed corner completes it.${b < 0 ? ' Drawn for $+' + Math.abs(b) + 'x$; the sign only changes the sign inside the bracket.' : ''}`),
        };
      },
    }),
    num({
      id: 'vertex-min', difficulty: 2,
      gen(r) {
        const h = r.int(1, 5), k = r.intExcept(-6, 8, [0]);
        const B = -2 * h, C = h * h + k;
        const errors = [];
        for (const [v, f] of [[C, t`That is the value at $x = 0$, the $y$-intercept. Complete the square to find the lowest point.`], [h, t`That is *where* the minimum is, $x = ${h}$. The question asks for the minimum value of $y$.`]]) if (v !== k && !errors.some((e) => e.value === v)) errors.push({ value: v, feedback: f });
        return {
          prompt: t`What is the minimum value of $y = x^2 ${sgn(B, 'x')} ${sgn(C)}$?`,
          answer: k, tol: { rel: 0, abs: 1e-9 },
          errors,
          hints: [t`Half of $${B}$ is $${-h}$; $(x - ${h})^2 = x^2 ${sgn(B, 'x')} + ${h * h}$.`, t`$y = (x - ${h})^2 + (${C} - ${h * h})$, and a square is never negative.`],
          teach: t`In $y = (x - h)^2 + k$ the square is at least zero, so the minimum value is $k$, reached at $x = h$.`,
          explain: t`$y = (x - ${h})^2 ${sgn(k)}$: the minimum is $${k}$, at $x = ${h}$.`,
          visual: { type: 'graph', params: { x: [h - 4, h + 4], y: [k - 3, k + 14], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: `x^2 + (${B})*x + ${C}`, color: 'accent' }] }, caption: t`$y = x^2 ${sgn(B, 'x')} ${sgn(C)}$, with the scale hidden: the lowest point is what you are after.` },
        };
      },
    }),
    mcq({
      id: 'leading-coef', difficulty: 3,
      prompt: t`Complete the square: $2x^2 + 8x + 3 = \;?$`,
      visual: { type: 'graph', params: { x: [-5, 1], y: [-6.5, 8], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: '2x^2 + 8x + 3', color: 'accent' }] }, caption: t`$y = 2x^2 + 8x + 3$, scale hidden. The completed form should name its vertex.` },
      choices: [t`$2(x + 2)^2 - 5$`, t`$2(x + 2)^2 - 1$`, t`$2(x + 4)^2 - 29$`, t`$(2x + 2)^2 - 1$`],
      answer: 0,
      why: {
        1: t`Inside the bracket you added $4$, but the bracket is multiplied by $2$, so you actually added $8$; subtract $8$, not $4$.`,
        2: t`Factor the $2$ first: $2(x^2 + 4x)$. Half of $4$ is $2$; $(x + 4)^2$ uses the whole of $8$ instead of half of $4$.`,
        3: t`$(2x + 2)^2 = 4x^2 + 8x + 4$: the leading coefficient is $4$, not $2$.`,
      },
      hints: [t`Factor $2$ out of the $x$ terms: $2(x^2 + 4x) + 3$.`, t`$x^2 + 4x = (x + 2)^2 - 4$, and that $-4$ is multiplied by $2$.`],
      teach: t`With a leading coefficient, factor it out of the $x$ terms first, and remember it multiplies the corner you subtract.`,
      explain: t`$2(x^2 + 4x) + 3$ $= 2\big[(x + 2)^2 - 4\big] + 3$ $= 2(x + 2)^2 - 8 + 3$ $= 2(x + 2)^2 - 5$. Vertex $(-2, -5)$.`,
    }),
    num({
      id: 'cts-root', difficulty: 2,
      gen(r) {
        const r1 = r.int(-6, 3); let r2 = r1 + 2 * r.int(1, 4);
        if (r1 + r2 === 0) r2 += 2;   // keep b nonzero
        const b = -(r1 + r2), c = r1 * r2, hb = b / 2, D = hb * hb - c;
        const errors = [];
        if (-r1 !== r2) errors.push({ value: -r1, feedback: t`Check the sign of the shift: $(x ${sgn(hb)})^2 = ${D}$ gives $x = ${-hb} \pm ${Math.sqrt(D)}$.` });
        if (r1 !== r2 && D !== r2) errors.push({ value: D, feedback: t`$${D}$ is $(x ${sgn(hb)})^2$; take its square root, then undo the shift.` });
        return {
          prompt: t`Solve $x^2 ${b === 0 ? '' : sgn(b, 'x')} ${sgn(c)} = 0$ by completing the square. Give the larger solution.`,
          answer: r2, tol: { rel: 0, abs: 1e-6 },
          errors,
          hints: [t`Move $c$ across: $x^2 ${b === 0 ? '' : sgn(b, 'x')} = ${-c}$, then add the corner $(${hb})^2 = ${hb * hb}$ to both sides.`, t`$(x ${sgn(hb)})^2 = ${D}$, so $x ${sgn(hb)} = \pm ${Math.sqrt(D)}$.`],
          teach: t`Completing the square turns a quadratic equation into “square = number”, which a square root solves.`,
          explain: t`$(x ${sgn(hb)})^2 = ${D}$, so $x = ${-hb} \pm ${Math.sqrt(D)}$: the solutions are $${r1}$ and $${r2}$.`,
          visual: bothSides({ lhs: `(x + (${hb}))^2`, rhs: `${D}`, x: [-hb - 2.2 * Math.sqrt(D), -hb + 2.2 * Math.sqrt(D)], y: [-0.15 * D, 2.4 * D], lhsLabel: `y = (x ${hb < 0 ? '−' : '+'} ${Math.abs(hb)})²`, rhsLabel: `y = ${D}`, legendAt: 'tr', caption: t`The completed square and the number it must equal: the solutions are where they meet. Scale hidden on $x$.` }),
        };
      },
    }),
    mcq({
      id: 'circle', difficulty: 2,
      prompt: t`Find the centre and radius of the circle $x^2 + y^2 - 4x + 6y = 3$.`,
      choices: ['centre (2, −3), radius 4', 'centre (−2, 3), radius 4', 'centre (2, −3), radius √3', 'centre (2, −3), radius 16'],
      answer: 0,
      why: {
        1: t`$(x - 2)^2$ expands to $x^2 - 4x$, so the centre has $x = +2$; the sign inside the bracket is the opposite of the coordinate.`,
        2: t`Completing both squares adds $4$ and $9$ to the left; add them to the right as well: $3 + 4 + 9 = 16$.`,
        3: t`$16$ is $r^2$; the radius is its square root.`,
      },
      hints: [t`Group: $(x^2 - 4x) + (y^2 + 6y) = 3$, and complete each square.`, t`$(x - 2)^2 - 4 + (y + 3)^2 - 9 = 3$.`],
      teach: t`Completing the square in $x$ and in $y$ turns a circle’s equation into $(x - a)^2 + (y - b)^2 = r^2$.`,
      explain: t`$(x - 2)^2 + (y + 3)^2 = 16$: centre $(2, -3)$, radius $4$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-odd-b', difficulty: 2,
      gen(r) {
        const b = r.sign() * r.pick([1, 3, 5, 7]), c = r.intExcept(-4, 9, [0]);
        const q = c - b * b / 4;
        return {
          prompt: t`Write $x^2 ${sgn(b, 'x')} ${sgn(c)}$ as $\left(x ${b < 0 ? '-' : '+'} \tfrac{${Math.abs(b)}}{2}\right)^2 + q$. What is $q$? (A decimal is fine.)`,
          answer: q, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: c + b * b / 4, feedback: t`The corner $\tfrac{${b * b}}{4}$ is subtracted, not added.` }],
          hints: [t`The corner is $\left(\tfrac{${Math.abs(b)}}{2}\right)^2 = \tfrac{${b * b}}{4}$.`],
          teach: t`An odd $b$ just makes the corner a fraction: $(b/2)^2 = b^2/4$.`,
          explain: t`$q = ${c} - \tfrac{${b * b}}{4} = ${frac(q)} = ${nice(q)}$.`,
          visual: cornerFig(b, t`$x^2 + ${Math.abs(b)}x$ and its missing corner, with strips $\tfrac{${Math.abs(b)}}{2}$ wide.`),
        };
      },
    }),
    mcq({
      id: 'cp-integral-prep', difficulty: 2,
      prompt: t`To integrate $\dfrac{1}{x^2 + 4x + 13}$ you first rewrite the denominator. Which is correct?`,
      visual: { type: 'graph', params: { x: [-7, 3], y: [-2, 30], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: 'x^2 + 4x + 13', color: 'accent' }], hlines: [{ y: 0, color: 'ink3' }] }, caption: t`$y = x^2 + 4x + 13$ never reaches zero — the completed square shows why. Scale hidden.` },
      choices: [t`$(x + 2)^2 + 9$`, t`$(x + 2)^2 + 13$`, t`$(x + 4)^2 - 3$`, t`$(x + 2)^2 + 17$`],
      answer: 0,
      why: {
        1: t`$(x + 2)^2$ already contains $+4$; keep only $13 - 4$ outside.`,
        2: t`The bracket takes half of $b$: $(x + 2)$, not $(x + 4)$.`,
        3: t`The corner $4$ is subtracted from $13$, not added.`,
      },
      hints: [t`Half of $4$ is $2$, and $2^2 = 4$.`],
      teach: t`$x^2 + bx + c = (x + b/2)^2 + (c - b^2/4)$; with a positive remainder it fits $\int \frac{du}{u^2 + a^2}$.`,
      explain: t`$x^2 + 4x + 13 = (x + 2)^2 + 9$, so the integral becomes $\tfrac13 \arctan\tfrac{x + 2}{3} + C$.`,
    }),
    num({
      id: 'cp-coast', difficulty: 3, transfer: true,
      gen(r) {
        const v0 = r.pick([120, 150, 200, 250]), h0 = r.pick([800, 1200, 1500, 2000]);
        const H = h0 + v0 * v0 / 19.6, tp = v0 / 9.8;
        return {
          prompt: t`At burnout a sounding rocket is at $${thou(h0)}$ m, climbing at $${v0}$ m/s. Coasting without drag, its height is $h(t) = ${thou(h0)} + ${v0}t - 4.9t^2$. Complete the square to find its peak height.`,
          answer: H, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: v0 * v0 / 19.6, feedback: t`That is the height gained while coasting; add the $${thou(h0)}$ m it already had.` }, { value: h0 + v0 * v0 / 9.8, feedback: t`Twice too much coast: the corner is $4.9\,(${v0}/9.8)^2$, i.e. $v_0^2/(2g)$.` }],
          hints: [t`Factor $-4.9$ from the $t$ terms: $-4.9\left(t^2 - \tfrac{${v0}}{4.9}t\right)$.`, t`Half of $\tfrac{${v0}}{4.9}$ is $\tfrac{${v0}}{9.8}$; the vertex is at $t = ${nice(sig(tp, 4))}$ s.`, t`The peak is $${thou(h0)} + 4.9 \left(\tfrac{${v0}}{9.8}\right)^2 = ${thou(h0)} + \tfrac{${v0}^2}{19.6}$.`],
          teach: t`For $h = h_0 + v_0 t - \tfrac12 g t^2$, completing the square gives the peak $h_0 + v_0^2/(2g)$ at $t = v_0/g$.`,
          explain: t`$h = ${thou(h0)} + \tfrac{${v0}^2}{19.6} - 4.9\left(t - ${nice(sig(tp, 4))}\right)^2$, so the peak is $${thou(Math.round(H))}$ m at $t = ${nice(sig(tp, 3))}$ s.`,
          visual: { type: 'graph', params: { x: [0, 2.15 * tp], y: [0, H * 1.15], aspect: 'wide', xlabel: 't (s, from burnout)', ylabel: 'h (m)', yticks: 0, curves: [{ fn: `${h0} + ${v0}x - 4.9x^2`, color: 'accent', domain: [0, 2.1 * tp] }] }, caption: t`Height after burnout, height scale hidden. Real sounding rockets lose a large share of this to drag.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §2.5 Quadratic Equations (completing the square)', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations' },
  ],
});
