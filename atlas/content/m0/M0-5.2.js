// Rational functions and asymptotes — where the denominator vanishes, and what happens far away.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { lab } from './_m0kit.js';

const t = String.raw;
const fx = (r) => (r === 0 ? 'x' : `(x ${r > 0 ? '-' : '+'} ${Math.abs(r)})`);
const R_E = 6371;   // km

// numerator (blue) and denominator (gold) of a rational function, drawn as two curves
const parts = (num, den, x, y, caption, numLabel = 'numerator', denLabel = 'denominator') => ({
  type: 'graph', params: { x, y, aspect: 'wide', curves: [{ fn: num, color: 'accent' }, { fn: den, color: 'gold' }], legend: [{ label: numLabel, color: 'accent' }, { label: denLabel, color: 'gold' }], legendAt: 'tl' }, caption,
});

export default lesson({
  id: 'm0.M0-5.2',
  title: 'Rational functions and asymptotes',
  minutes: 9, difficulty: 2,
  intro: t`A **rational function** is one polynomial divided by another:

$$r(x) = \frac{p(x)}{q(x)}$$

Where the denominator is zero, $r$ is not defined. If the numerator is **not** zero there, the graph shoots off to $\pm\infty$: a **vertical asymptote**. If the numerator is zero there too — a factor common to both — the factor cancels and leaves only a missing point, a **hole**. Far from the origin the leading terms take over: equal degrees give a **horizontal asymptote** at the ratio of the leading coefficients, a lower degree on top gives $y = 0$, and a top degree one higher gives a **slant asymptote**.`,
  symbols: [
    { tex: 'p(x)', text: 'the numerator polynomial; its zeros (not cancelled) are the zeros of $r$' },
    { tex: 'q(x)', text: 'the denominator polynomial; its zeros are excluded from the domain' },
    { tex: 'r(x)', text: 'the rational function; defined wherever $q(x) \\ne 0$' },
  ],
  why: t`Inverse-square forces, lens and mirror equations, resonance curves and transfer functions are all rational. Their asymptotes are physics: a pole is a resonance or an object at the focal point, and the horizontal asymptote is the far-field or high-frequency limit.`,
  visual: {
    type: 'graph',
    title: 'Poles, holes and the far field',
    lead: t`The curve is $r(x) = \dfrac{(x - a)(x + 2)}{(x - c)(x - 1)}$. The dashed lines are its asymptotes. Slide the numerator zero $a$ and the denominator zero $c$.`,
    tasks: [
      t`Slide $a$ onto $c$: the factors cancel, the vertical asymptote at $x = c$ vanishes, and a single hollow point is left.`,
      t`Far to the left and right the curve hugs $y = 1$, the ratio of the leading coefficients $1/1$ — whatever $a$ and $c$ are.`,
      t`The curve may cross its horizontal asymptote (it describes the far field only), but it never crosses a vertical one.`,
    ],
    params: {
      x: [-6, 6], y: [-6, 7], aspect: 'wide',
      sliders: [
        { key: 'a', label: t`Numerator zero $a$`, min: -4, max: 4, step: 0.5, value: 3, explain: t`The factor $(x - a)$ on top: the curve crosses zero at $x = a$ unless the factor cancels.` },
        { key: 'c', label: t`Denominator zero $c$`, min: -4, max: 4, step: 0.5, value: -3, explain: t`The factor $(x - c)$ on the bottom: a vertical asymptote at $x = c$, or a hole if $a = c$.` },
      ],
      curves: [{ fn: '(x - a)*(x + 2)/((x - c)*(x - 1))', color: 'accent' }],
      vlines: [{ x: 'c', color: 'bad', when: 'step(abs(a - c) - 0.01)' }, { x: 1, color: 'bad', when: 'step(abs(a - 1) - 0.01)' }],
      hlines: [{ y: 1, color: 'ink3', label: 'y = 1' }],
      points: [
        { x: 'c', y: '(c + 2)/(c - 1)', hollow: true, color: 'accent', r: 5.5, label: 'hole', when: 'step(0.01 - abs(a - c))' },
        { x: 1, y: '3/(1 - c)', hollow: true, color: 'accent', r: 5.5, label: 'hole', when: 'step(0.01 - abs(a - 1))' },
      ],
    },
    caption: t`Exact graph. When $c = 1$ the denominator has a double zero and both sides of the asymptote go the same way.`,
  },
  example: {
    prompt: t`Find the zeros, holes and asymptotes of $r(x) = \dfrac{x^2 - 1}{x^2 - x}$.`,
    visual: { type: 'graph', params: { x: [-5, 5], y: [-5, 6], aspect: 'wide', curves: [{ fn: '(x^2 - 1)/(x^2 - x)', color: 'accent' }], vlines: [{ x: 0, color: 'bad', label: 'x = 0' }], hlines: [{ y: 1, color: 'ink3', label: 'y = 1' }], points: [{ x: 1, y: 2, hollow: true, color: 'accent', r: 5.5, label: 'hole (1, 2)', labelDx: 10, labelDy: -10 }, { x: -1, y: 0, color: 'gold', r: 5, label: 'zero', labelDx: -12, labelDy: 18 }] }, caption: t`The graph is the curve $y = (x + 1)/x$ with the point at $x = 1$ removed.` },
    steps: [
      { label: 'Factor both', text: t`$r(x) = \dfrac{(x - 1)(x + 1)}{x(x - 1)}$. The domain excludes the zeros of the original denominator: $x \ne 0$ and $x \ne 1$.` },
      { label: 'Cancel', text: t`The common factor $(x - 1)$ cancels: $r(x) = \dfrac{x + 1}{x}$ for $x \ne 1$. At $x = 1$ there is a **hole**, at height $\dfrac{1 + 1}{1} = 2$.` },
      { label: 'Vertical asymptote', text: t`What is left of the denominator, $x$, vanishes at $x = 0$ while the numerator is $1$: a vertical asymptote $x = 0$.` },
      { label: 'Zero', text: t`The remaining numerator $x + 1$ vanishes at $x = -1$: the graph crosses the axis there.` },
      { label: 'Far field', text: t`Equal degrees ($2$ and $2$), leading coefficients $1$ and $1$: horizontal asymptote $y = 1$. Check at $x = 100$: $r = 1.01$ ✓.` },
    ],
    answer: t`Zero at $x = -1$; hole at $(1, 2)$; vertical asymptote $x = 0$; horizontal asymptote $y = 1$.`,
  },
  practice: [
    mcq({
      id: 'va-vs-hole', difficulty: 2,
      gen(r) {
        const a = r.int(-3, 0), b = r.int(1, 3), m = r.intExcept(-3, 3, [-a, -b, 0]);
        return {
          prompt: t`Where does $r(x) = \dfrac{${fx(a)}${fx(-m)}}{${fx(a)}${fx(b)}}$ have a vertical asymptote?`,
          visual: parts(`${fx(a)}*${fx(-m)}`, `${fx(a)}*${fx(b)}`, [-5, 5], [-6, 10], t`The numerator (blue) and denominator (gold) as separate curves. Where is the gold one zero, and is the blue one zero there too?`),
          choices: [t`only at $x = ${b}$ (with a hole at $x = ${a}$)`, t`at $x = ${a}$ and $x = ${b}$`, t`only at $x = ${a}$ (with a hole at $x = ${b}$)`, t`at $x = ${-m}$`],
          answer: 0,
          why: {
            1: t`At $x = ${a}$ the numerator is zero too: the factor $${fx(a)}$ cancels, leaving a hole, not an asymptote.`,
            2: t`The factor that cancels is $${fx(a)}$, so the hole is at $x = ${a}$. At $x = ${b}$ only the denominator vanishes.`,
            3: t`$x = ${-m}$ is a zero of the numerator: there $r = 0$ and the graph crosses the axis.`,
          },
          hints: [t`Cancel any factor common to top and bottom first.`, t`A vertical asymptote needs the denominator zero and the numerator non-zero.`],
          teach: t`A zero of the denominator gives a vertical asymptote only if it is not cancelled by the numerator; a cancelled one is a hole.`,
          explain: t`$r(x) = \dfrac{${fx(-m)}}{${fx(b)}}$ for $x \ne ${a}$: a hole at $x = ${a}$ and a vertical asymptote at $x = ${b}$.`,
        };
      },
    }),
    num({
      id: 'ha-value', difficulty: 1,
      gen(r) {
        const A = r.pick([2, 3, 4, 6]), D = r.intExcept(2, 5, [A]), B = r.int(1, 9), C = r.int(1, 9), E = r.int(1, 9);
        const ans = A / D;
        const errors = [{ value: C / E, feedback: t`That is the ratio of the constant terms — what $r(0)$ is, not the far field. For large $|x|$ the $x^2$ terms dominate.` }, { value: A, feedback: t`Divide by the denominator’s leading coefficient too: $${A}/${D}$.` }, { value: 0, feedback: t`$y = 0$ is the asymptote only when the top has the *lower* degree. Here the degrees are equal.` }]
          .filter((e) => Math.abs(e.value - ans) > 0.01 * ans);
        return {
          prompt: t`What is the horizontal asymptote of $r(x) = \dfrac{${A}x^2 + ${B}x + ${C}}{${D}x^2 + ${E}}$? Give its $y$ value.`,
          answer: ans, tol: { rel: 0.005 },
          errors,
          hints: [t`For large $|x|$, keep only the leading terms: $\dfrac{${A}x^2}{${D}x^2}$.`],
          teach: t`With equal degrees, the horizontal asymptote is the ratio of the leading coefficients.`,
          explain: t`$r(x) \approx \dfrac{${A}x^2}{${D}x^2} = ${nice(sig(ans, 4))}$ for large $|x|$, so $y = ${nice(sig(ans, 4))}$.`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-1, Math.max(4, C / E + 2)], aspect: 'wide', yticks: 0, curves: [{ fn: `(${A}x^2 + ${B}x + ${C})/(${D}x^2 + ${E})`, color: 'accent' }] }, caption: t`The graph near the origin only; vertical scale hidden. The far field is off the edges.` },
        };
      },
    }),
    num({
      id: 'hole-height', difficulty: 2,
      gen(r) {
        const k = r.intExcept(-4, 4, [0]), m = r.intExcept(-4, 4, [0, -k, k]);
        const B = m - k, C = -m * k, ans = k + m;
        const quadTeX = t`x^2 ${B === 0 ? '' : B > 0 ? `+ ${B === 1 ? '' : B}x` : `- ${B === -1 ? '' : -B}x`} ${C > 0 ? '+' : '-'} ${Math.abs(C)}`;
        return {
          prompt: t`The graph of $r(x) = \dfrac{${quadTeX}}{${fx(k)}}$ has a hole. At what height $y$ is it?`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: 0, feedback: t`At $x = ${k}$ the formula gives $0/0$, which is not $0$: it is undetermined. Cancel the common factor and evaluate what remains.` }, ...(k !== ans ? [{ value: k, feedback: t`$x = ${k}$ is where the hole is; its height is the value of the simplified function there.` }] : [])].filter((e) => e.value !== ans),
          hints: [t`Factor the numerator: one factor is $${fx(k)}$.`, t`After cancelling, $r(x) = x ${m > 0 ? '+' : '-'} ${Math.abs(m)}$ for $x \ne ${k}$.`],
          teach: t`A hole sits where a cancelled factor vanishes, at the height of the simplified function there.`,
          explain: t`$${quadTeX} = ${fx(k)}${fx(-m)}$, so $r(x) = x ${m > 0 ? '+' : '-'} ${Math.abs(m)}$ with $x \ne ${k}$. The hole is at $(${k}, ${ans})$.`,
          visual: { type: 'graph', params: { x: [-7, 7], y: [-9, 9], aspect: 'wide', yticks: 0, curves: [{ fn: `x + (${m})`, color: 'accent' }], points: [{ x: k, y: ans, hollow: true, color: 'accent', r: 5.5 }] }, caption: t`The graph, vertical scale hidden: a straight line with one point missing.` },
        };
      },
    }),
    mcq({
      id: 'slant', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-4, 4, [0, -a, -2 * a]), c = r.intExcept(-6, 6, [-a * (a + b)]);
        const q = a + b;
        const numTeX = t`x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
        const line = (k) => t`$y = x ${k === 0 ? '' : k > 0 ? `+ ${k}` : `- ${-k}`}$`;
        return {
          prompt: t`What is the slant asymptote of $r(x) = \dfrac{${numTeX}}{${fx(a)}}$?`,
          visual: { type: 'graph', params: { x: [-8, 8], y: [-10, 10], aspect: 'wide', curves: [{ fn: `(x^2 + (${b})x + (${c}))/(x - (${a}))`, color: 'accent' }], vlines: [{ x: a, color: 'bad' }] }, caption: t`The graph and its vertical asymptote; the slant line is for you to find.` },
          choices: [line(q), line(b), line(-a), t`$y = 1$`],
          answer: 0,
          why: {
            1: t`Dropping the divisor’s constant: dividing by $${fx(a)}$ gives the quotient $x ${q === 0 ? '' : q > 0 ? `+ ${q}` : `- ${-q}`}$, not $x ${b > 0 ? '+' : '-'} ${Math.abs(b)}$.`,
            2: t`That borrows the divisor’s constant. Do the division: $x \cdot ${fx(a)}$ leaves $${a + b}x$, which gives the second term of the quotient.`,
            3: t`$y = 1$ would need equal degrees. The top is one degree higher, so the far field is a slanted line.`,
          },
          hints: [t`Divide $${numTeX}$ by $${fx(a)}$; the quotient (ignoring the remainder) is the asymptote.`, t`$x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x = x${fx(a)} + ${a + b}x$.`],
          teach: t`When the top’s degree is one more than the bottom’s, the quotient of the division is the slant asymptote.`,
          explain: t`$${numTeX} = ${fx(a)}\,(x ${q === 0 ? '' : q > 0 ? `+ ${q}` : `- ${-q}`}) + ${c + a * q}$, so $r(x) = x ${q === 0 ? '' : q > 0 ? `+ ${q}` : `- ${-q}`} + \dfrac{${c + a * q}}{${fx(a)}}$. The fraction dies away for large $|x|$, leaving ${line(q)}.`,
        };
      },
    }),
    mcq({
      id: 'not-asymptote', difficulty: 2, kind: 'error',
      prompt: t`A student says $r(x) = \dfrac{x^2 - 4}{x - 2}$ has a vertical asymptote at $x = 2$, because the denominator is zero there. What is wrong?`,
      visual: { type: 'graph', params: { x: [-5, 5], y: [-3, 7], aspect: 'wide', curves: [{ fn: 'x + 2', color: 'accent' }], points: [{ x: 2, y: 4, hollow: true, color: 'accent', r: 5.5, label: '(2, 4)', labelDx: 10, labelDy: 12 }] }, caption: t`The graph of $r$, with scales.` },
      choices: [t`The numerator is zero at $x = 2$ too; the factor cancels, leaving a hole at $(2, 4)$`, t`Nothing: every zero of a denominator is a vertical asymptote`, t`The asymptote is at $x = -2$`, t`$r$ is defined at $x = 2$, with $r(2) = 4$`],
      answer: 0,
      why: {
        1: t`Only when the numerator is *not* zero there. Here $x^2 - 4 = (x - 2)(x + 2)$ shares the factor.`,
        2: t`At $x = -2$ the numerator is zero and the denominator is $-4$: $r(-2) = 0$, a zero of $r$.`,
        3: t`$r(2)$ is $0/0$ — not defined. The simplified line has height $4$ there, but the point itself is missing.`,
      },
      hints: [t`Factor $x^2 - 4$.`],
      teach: t`Check the numerator at each zero of the denominator: a shared factor gives a hole, not an asymptote.`,
      explain: t`$\dfrac{(x - 2)(x + 2)}{x - 2} = x + 2$ for $x \ne 2$: the line $y = x + 2$ with one point, $(2, 4)$, removed.`,
    }),
    num({
      id: 'gravity-pole', difficulty: 2,
      prompt: t`Gravity at altitude $h$ above Earth is $g(h) = \dfrac{g_0 R_E^2}{(R_E + h)^2}$, with $R_E = 6371$ km. Where does the formula have its vertical asymptote? Give $h$ in km.`,
      answer: -R_E, units: 'km', tol: { rel: 0.001 },
      errors: [{ value: 0, feedback: t`At $h = 0$ the denominator is $R_E^2$, not zero: $g(0) = g_0$.` }],
      hints: [t`Set the denominator to zero: $(R_E + h)^2 = 0$.`],
      teach: t`A rational formula’s vertical asymptote can lie outside its physical domain, where the model no longer describes anything real.`,
      explain: t`$R_E + h = 0$ at $h = -6371$ km: Earth’s centre. The formula assumes all the mass lies below you, so it fails as soon as $h < 0$ — inside a uniform Earth gravity actually falls to zero at the centre. The pole is a property of the formula, not of the planet. Its horizontal asymptote, $g \to 0$ as $h \to \infty$, is real.`,
      visual: { type: 'graph', params: { x: [-9000, 20000], y: [0, 25], aspect: 'wide', xlabel: 'h (km)', ylabel: 'g (m/s²)', curves: [{ fn: `9.81*${R_E}^2/(${R_E} + x)^2`, color: 'ink3', dash: true, domain: [-9000, 0] }, { fn: `9.81*${R_E}^2/(${R_E} + x)^2`, color: 'accent', domain: [0, 20000] }], vlines: [{ x: 0, label: 'surface', color: 'ink3' }] }, caption: t`The formula above the surface (solid) and continued below it (dashed), where it no longer applies.` },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ha', difficulty: 2,
      gen(r) {
        const lower = r.bool(0.4), A = r.int(2, 6), D = r.intExcept(2, 5, [A]), C = r.int(1, 9);
        const ans = lower ? 0 : A / D;
        const top = lower ? t`${A}x^2 + ${C}` : t`${A}x^3 + ${C}`;
        const errors = lower ? [{ value: A / D, feedback: t`The top has the lower degree ($2 < 3$), so the fraction dies away: $y = 0$.` }] : [{ value: C / 1, feedback: t`That is the ratio of the constant terms, which is $r(0)$. Compare the leading terms.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans);
        return {
          prompt: t`Give the $y$ value of the horizontal asymptote of $r(x) = \dfrac{${top}}{${D}x^3 - x + 1}$.`,
          answer: ans, tol: { rel: 0.005, abs: 1e-6 },
          errors,
          hints: [t`Compare degrees, then leading terms.`],
          teach: t`Lower degree on top: $y = 0$. Equal degrees: the ratio of leading coefficients.`,
          explain: lower ? t`Degree $2$ over degree $3$: $r(x) \approx \dfrac{${A}}{${D}x} \to 0$, so $y = 0$.` : t`Equal degrees: $y = ${A}/${D} = ${nice(sig(ans, 4))}$.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-4, 4], aspect: 'wide', yticks: 0, curves: [{ fn: lower ? `(${A}x^2 + ${C})/(${D}x^3 - x + 1)` : `(${A}x^3 + ${C})/(${D}x^3 - x + 1)`, color: 'accent' }] }, caption: t`The graph over a modest window, vertical scale hidden.` },
        };
      },
    }),
    num({
      id: 'cp-lens-travel', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([35, 50, 85]), D = r.pick([0.5, 1, 2]);
        const dO = D * 1000, dI = f * dO / (dO - f), ans = dI - f;
        return {
          prompt: t`A rover camera’s lens obeys the thin-lens equation, so the image forms at $d_i(d_o) = \dfrac{f\,d_o}{d_o - f}$ behind it, for an object $d_o$ in front. With $f = ${f}$ mm it is focused on the far horizon, where $d_i$ sits at its horizontal asymptote. How far must the lens move away from the sensor to focus on a rock $${D}$ m away? Give the answer in mm.`,
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: dI, feedback: t`That is the new image distance. The lens moves by the *change*: subtract the infinity setting, $d_i = f = ${f}$ mm.` }],
          hints: [t`At infinity the image is at the horizontal asymptote, $d_i = f$.`, t`Compute $d_i$ for $d_o = ${dO}$ mm, then subtract $${f}$ mm.`, t`$d_i = \dfrac{${f} \times ${dO}}{${dO} - ${f}}$.`],
          teach: t`The horizontal asymptote of $d_i(d_o)$ is the focal length: objects at infinity image at $f$, and nearer ones image farther back.`,
          explain: t`$d_i = \dfrac{${f} \times ${dO}}{${dO - f}} = ${nice(sig(dI, 4))}$ mm, so the lens moves $${nice(sig(ans, 3))}$ mm. The vertical asymptote, $d_o = f$, is an object at the focal point, whose image is at infinity.`,
          visual: { type: 'graph', params: { x: [0, 8 * f], y: [0, 4 * f], aspect: 'wide', xlabel: 'dₒ (mm)', ylabel: 'dᵢ (mm)', curves: [{ fn: `${f}*x/(x - ${f})`, color: 'accent', domain: [f * 1.05, 8 * f] }], vlines: [{ x: f, color: 'bad' }], hlines: [{ y: f, color: 'ink3' }], points: [{ x: f, y: 3.6 * f, r: 0, color: 'bad', label: 'dₒ = f', labelAlign: 'right', labelDx: -8, labelDy: 0 }, { x: 0.05 * f, y: f, r: 0, color: 'ink3', label: 'dᵢ = f', labelDx: 0, labelDy: -12 }] }, caption: t`Image distance against object distance, ideal thin lens. Real camera lenses are thick, but focus the same way.` },
        };
      },
    }),
    mcq({
      id: 'cp-hole-or-pole', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), b = r.intExcept(-3, 3, [0, a, -a]);
        return {
          prompt: t`Describe $r(x) = \dfrac{x^2 - ${a * a}}{${fx(a)}${fx(b)}}$ at the zeros of its denominator.`,
          visual: parts(`x^2 - ${a * a}`, `${fx(a)}*${fx(b)}`, [-5, 5], [-6, 12], t`Numerator (blue) and denominator (gold), drawn separately.`),
          choices: [t`a hole at $x = ${a}$ and a vertical asymptote at $x = ${b}$`, t`vertical asymptotes at $x = ${a}$ and $x = ${b}$`, t`a hole at $x = ${b}$ and a vertical asymptote at $x = ${a}$`, t`a vertical asymptote at $x = -${a}$`],
          answer: 0,
          why: {
            1: t`$x^2 - ${a * a} = (x - ${a})(x + ${a})$ shares the factor $(x - ${a})$ with the denominator, so $x = ${a}$ is a hole.`,
            2: t`At $x = ${b}$ the numerator is $${b * b - a * a}$, not zero: that zero of the denominator survives as an asymptote.`,
            3: t`$x = -${a}$ is a zero of the numerator, where $r = 0$. The denominator is not zero there.`,
          },
          hints: [t`Factor the numerator as a difference of squares.`],
          teach: t`Factor both, cancel common factors: what cancels is a hole, what remains in the denominator is an asymptote.`,
          explain: t`$r(x) = \dfrac{(x - ${a})(x + ${a})}{(x - ${a})${fx(b)}} = \dfrac{x + ${a}}{${fx(b)}}$ for $x \ne ${a}$: hole at $x = ${a}$, asymptote at $x = ${b}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §3.7 Rational Functions', url: 'https://openstax.org/books/precalculus-2e/pages/3-7-rational-functions' },
    { label: 'OpenStax University Physics Vol. 3, §2.4 Thin Lenses', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses' },
  ],
});
