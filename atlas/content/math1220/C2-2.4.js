// Trigonometric integrals: powers of tangent and secant (and the Mercator map).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { kx, fgraph } from './_integration.js';

const t = String.raw;
// '\tan^{3}(2x)' or '\sec x' for TeX; 'tan(2x)^3' for answer text
const F = (name, k, p = 1) => `${name}${p === 1 ? '' : `^{${p}}`}${k === 1 ? ' x' : `(${kx(k)})`}`;
const T = (name, k, p = 1) => `${name}(${kx(k)})${p === 1 ? '' : `^${p}`}`;
const TAN = t`\tan`, SEC = t`\sec`;
const over = (k) => (k === 1 ? '' : t`\frac{1}{${k}}`);

export default lesson({
  id: 'math1220.C2-2.4',
  title: 'Trigonometric integrals: tangents and secants',
  minutes: 10, difficulty: 3,
  intro: t`Powers of tangent and secant yield to the same idea as sines and cosines: save one factor to be $du$, and convert the rest with an identity. Three facts do all the work:

$$\frac{d}{dx}\tan x = \sec^2 x, \qquad \frac{d}{dx}\sec x = \sec x\tan x, \qquad 1 + \tan^2 x = \sec^2 x$$

**If the secant’s power is even**, save $\sec^2 x$ and let $u = \tan x$. **If the tangent’s power is odd**, save $\sec x\tan x$ and let $u = \sec x$. Two results are worth knowing by heart: $\int\tan x\,dx = \ln\lvert\sec x\rvert + C$ and $\int\sec x\,dx = \ln\lvert\sec x + \tan x\rvert + C$ — the integral behind the Mercator map.`,
  symbols: [
    { tex: t`\tan x`, text: t`the tangent, $\sin x/\cos x$; it blows up where $\cos x = 0$` },
    { tex: t`\sec x`, text: t`the secant, $1/\cos x$; never smaller than 1 in size` },
    { tex: t`\sec^2 x`, text: t`the square of the secant — the derivative of $\tan x$, so it pairs with $u = \tan x$` },
    { tex: t`\sec x\tan x`, text: t`the derivative of $\sec x$, so it pairs with $u = \sec x$` },
    { tex: t`1 + \tan^2 x = \sec^2 x`, text: t`the Pythagorean identity divided by $\cos^2 x$; it trades even powers of one function for the other` },
  ],
  why: t`Whichever function you choose as $u$, its derivative must be sitting in the integrand; the identity converts everything else.`,
  visual: {
    type: 'graph',
    title: 'The integral that draws the Mercator map',
    lead: t`On a Mercator map the parallel of latitude $\varphi$ is drawn a distance $y = R\int_0^{\varphi}\sec\theta\,d\theta$ above the equator, where $R$ is the radius of the globe being mapped. The blue area under $\sec\theta$ is $y/R$; the amber curve is the formula $\ln\lvert\sec\varphi + \tan\varphi\rvert$.`,
    tasks: [
      'Set the latitude to 60°: the area is ln(2 + √3) ≈ 1.317.',
      'Push towards 85°: the area grows without limit — a Mercator map can never show the poles.',
      'Near the equator sec θ ≈ 1, so the area is almost exactly the latitude in radians: the map is nearly undistorted there.',
    ],
    params: {
      x: [0, 1.6], y: [0, 5],
      xlabel: 'θ (rad)',
      sliders: [{ key: 'lat', label: t`Latitude $\varphi$`, min: 0, max: 85, step: 1, value: 50, unit: t`^\circ`, explain: t`Degrees north of the equator; the axis below is in radians.` }],
      curves: [
        { fn: 'sec(x)', color: 'accent', label: 'sec θ', labelAt: 1.25 },
        { fn: 'ln(sec(x) + tan(x))', color: 'warn', label: 'ln|sec θ + tan θ|', labelAt: 1.3 },
      ],
      shade: [{ fn: 'sec(x)', from: 0, to: 'lat*pi/180', color: 'accent', alpha: 0.28 }],
      vlines: [{ x: 'lat*pi/180' }],
      points: [{ x: 'lat*pi/180', y: 'ln(sec(lat*pi/180) + tan(lat*pi/180))', color: 'warn' }],
      readouts: [
        { label: t`$\varphi$ in radians`, expr: 'lat*pi/180' },
        { label: t`area $= y/R$`, expr: 'ln(sec(lat*pi/180) + tan(lat*pi/180))' },
        { label: t`stretch $\sec\varphi$`, expr: 'sec(lat*pi/180)' },
      ],
    },
    caption: t`Exact curves for a spherical globe. Mercator’s map (1569) was built by hand; the formula $\ln\lvert\sec\varphi + \tan\varphi\rvert$ for its spacing was found about a century later.`,
  },
  example: {
    prompt: t`Find $\displaystyle\int \tan^3 x\,\sec^3 x\,dx$.`,
    steps: [
      { label: 'Choose the route', text: t`The secant’s power, 3, is odd, so the even-secant route is closed. The tangent’s power, 3, is odd: save $\sec x\tan x$ for $du$ and use $u = \sec x$.` },
      { label: 'Rewrite', text: t`$$\tan^3 x\sec^3 x = \tan^2 x\,\sec^2 x\,(\sec x\tan x) = (\sec^2 x - 1)\sec^2 x\,(\sec x\tan x).$$` },
      { label: 'Substitute', text: t`With $u = \sec x$, $du = \sec x\tan x\,dx$: $$\int (u^2 - 1)\,u^2\,du = \int (u^4 - u^2)\,du = \tfrac15u^5 - \tfrac13u^3 + C.$$` },
      { label: 'Back-substitute', text: t`$\tfrac15\sec^5 x - \tfrac13\sec^3 x + C$.` },
      { label: 'Check', text: t`$\dfrac{d}{dx}\Big[\tfrac15\sec^5 x - \tfrac13\sec^3 x\Big] = \sec^5 x\tan x - \sec^3 x\tan x = \sec^3 x\tan x\,(\sec^2 x - 1) = \tan^3 x\sec^3 x.$ ✓` },
    ],
    answer: t`$\displaystyle\int \tan^3 x\sec^3 x\,dx = \tfrac15\sec^5 x - \tfrac13\sec^3 x + C$`,
  },
  practice: [
    mcq({
      id: 'route', difficulty: 1,
      gen(r) {
        const [m, n] = r.pick([[2, 4], [4, 2], [6, 4], [3, 1], [1, 3], [5, 3]]);
        const tanRoute = n % 2 === 0;
        const a = t`$u = \tan x$, saving $\sec^2 x$ for $du$`, b = t`$u = \sec x$, saving $\sec x\tan x$ for $du$`;
        return {
          prompt: t`Which substitution finishes $\displaystyle\int \tan^{${m}} x\,\sec^{${n}} x\,dx$ in one step?`,
          choices: [tanRoute ? a : b, tanRoute ? b : a, t`$u = \cos x$, after rewriting in sines and cosines`, t`Integration by parts with $u = \tan^{${m}} x$`],
          answer: 0,
          why: {
            1: tanRoute
              ? t`That needs a spare $\sec x\tan x$, leaving $\tan^{${m - 1}} x$ — an odd power, which becomes a square root of $u^2 - 1$.`
              : t`That needs a spare $\sec^2 x$, but the secant’s power ${n} is odd, so a lone $\sec x$ would be left over.`,
            2: 'It can be made to work, but it turns a two-line problem into a messy one.',
            3: 'Parts does not lower these powers; you get another product just as hard.',
          },
          hints: ['Is the secant’s power even? Is the tangent’s power odd?', t`Even secant power → $u = \tan x$; odd tangent power → $u = \sec x$.`],
          teach: t`Even power of secant: $u = \tan x$. Odd power of tangent: $u = \sec x$.`,
          explain: tanRoute
            ? (n === 2 ? t`Save $\sec^2 x$ as $du$; what is left, $\tan^{${m}} x$, is already a power of $u = \tan x$.` : t`Save $\sec^2 x$; the remaining $\sec^{${n - 2}} x = (1 + \tan^2 x)^{${(n - 2) / 2}}$ is a polynomial in $u = \tan x$.`)
            : (m === 1 ? t`Save $\sec x\tan x$ as $du$; what is left, $\sec^{${n - 1}} x$, is already a power of $u = \sec x$.` : t`Save $\sec x\tan x$; the remaining $\tan^{${m - 1}} x = (\sec^2 x - 1)^{${(m - 1) / 2}}$ is a polynomial in $u = \sec x$.`),
          visual: fgraph({ f: `tan(x)^${m}*sec(x)^${n}`, x: [-1.3, 1.3], trim: 0.06, caption: t`The integrand $\tan^{${m}}x\sec^{${n}}x$. It blows up at $x = \pm\tfrac{\pi}{2}$, where $\cos x = 0$ (the curve is cut off there).` }),
        };
      },
    }),
    expr({
      id: 'tan-squared', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3);
        return {
          prompt: t`Find $\displaystyle\int ${F(TAN, k, 2)}\,dx$.`,
          answer: `${T('tan', k)}/${k} - x`,
          answerTeX: k === 1 ? t`\tan x - x` : t`\frac{1}{${k}}\tan(${kx(k)}) - x`,
          integrand: T('tan', k, 2),
          vars: { x: [-1.2 / k, 1.2 / k] }, mode: 'constant',
          errors: [
            { answer: `${T('tan', k)}/${k} + x`, feedback: t`$\tan^2\theta = \sec^2\theta - 1$, so the $x$ is subtracted.` },
            { answer: `${T('tan', k, 3)}/${3 * k}`, feedback: t`Differentiate that: you get $\tan^2\cdot\sec^2$, not $\tan^2$. The power rule needs $\sec^2$ present as $du$.` },
          ],
          hints: [t`Use the identity: $\tan^2\theta = \sec^2\theta - 1$.`, t`$\int \sec^2(${kx(k)})\,dx = ${over(k)}\tan(${kx(k)})$ and $\int 1\,dx = x$.`],
          teach: t`A lone $\tan^2$ becomes $\sec^2 - 1$, and both pieces integrate at once.`,
          explain: t`$\int\big(\sec^2(${kx(k)}) - 1\big)\,dx = ${k === 1 ? t`\tan x` : t`\tfrac{1}{${k}}\tan(${kx(k)})`} - x + C$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.45 / k, 1.45 / k], y: [-0.3, 4.5],
              curves: [{ fn: `sec(${k}x)^2`, color: 'warn', dash: true, label: 'sec²', labelAt: 1.05 / k }, { fn: `tan(${k}x)^2`, color: 'accent', label: 'tan²', labelAt: -1.05 / k }],
              hlines: [{ y: 1 }],
            },
            caption: t`$\tan^2$ (blue) is $\sec^2$ (dashed) lowered by exactly 1 everywhere — the identity $\tan^2 = \sec^2 - 1$ in a picture.`,
          },
        };
      },
    }),
    expr({
      id: 'sec-fourth', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3);
        const tn = T('tan', k);
        return {
          prompt: t`Find $\displaystyle\int ${F(SEC, k, 4)}\,dx$.`,
          answer: `(${tn} + ${tn}^3/3)/${k}`,
          answerTeX: k === 1 ? t`\tan x + \tfrac13\tan^3 x` : t`\tfrac{1}{${k}}\tan(${kx(k)}) + \tfrac{1}{${3 * k}}\tan^3(${kx(k)})`,
          integrand: T('sec', k, 4),
          vars: { x: [-1.2 / k, 1.2 / k] }, mode: 'constant',
          errors: [{ answer: `${T('sec', k, 5)}/${5 * k}`, feedback: t`Differentiate that: $\sec^4\cdot\sec\tan$, not $\sec^4$. The power rule needs the inside derivative.` }],
          hints: [t`The secant’s power is even: save $\sec^2(${kx(k)})$ and write the other $\sec^2 = 1 + \tan^2$.`, t`With $u = \tan(${kx(k)})$, $du = ${k === 1 ? '' : k}\sec^2(${kx(k)})\,dx$, the integral is $${over(k)}\int (1 + u^2)\,du$.`],
          teach: t`Even secant power: keep $\sec^2$ as $du$, convert the rest to tangents, and integrate a polynomial in $\tan$.`,
          explain: t`With $u = ${k === 1 ? t`\tan x` : t`\tan(${kx(k)})`}$ the integral is $${over(k)}\int(1 + u^2)\,du = ${over(k)}\big(u + \tfrac13u^3\big)$, so the answer is $${k === 1 ? t`\tan x + \tfrac13\tan^3 x` : t`\tfrac{1}{${k}}\tan(${kx(k)}) + \tfrac{1}{${3 * k}}\tan^3(${kx(k)})`} + C$.`,
          visual: fgraph({ f: `sec(${kx(k)})^4`, F: `(${tn} + ${tn}^3/3)/${k}`, x: [-1.3 / k, 1.3 / k], trim: 0.06 }),
        };
      },
    }),
    expr({
      id: 'odd-tan', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 5]);
        // ∫ tan³ secⁿ = ∫ (u² − 1) u^{n−1} du, u = sec x  →  u^{n+2}/(n+2) − u^n/n
        return {
          prompt: t`Find $\displaystyle\int \tan^3 x\,${n === 1 ? t`\sec x` : t`\sec^{${n}} x`}\,dx$.`,
          answer: `sec(x)^${n + 2}/${n + 2} - sec(x)^${n}/${n}`,
          answerTeX: n === 1 ? t`\tfrac13\sec^3 x - \sec x` : t`\tfrac{1}{${n + 2}}\sec^{${n + 2}} x - \tfrac{1}{${n}}\sec^{${n}} x`,
          integrand: `tan(x)^3*sec(x)^${n}`,
          vars: { x: [-1.2, 1.2] }, mode: 'constant',
          errors: [{ answer: `sec(x)^${n + 2}/${n + 2} + sec(x)^${n}/${n}`, feedback: t`$\tan^2 x = \sec^2 x - 1$: the second term carries a minus sign.` }],
          hints: [
            t`The secant’s power is odd, so save $\sec x\tan x$ and use $u = \sec x$.`,
            n === 1 ? t`What is left is $\tan^2 x = \sec^2 x - 1$.` : t`What is left is $\tan^2 x\,\sec^{${n - 1}} x = (\sec^2 x - 1)\sec^{${n - 1}} x$.`,
            n === 1 ? t`So the integral is $\int (u^2 - 1)\,du$.` : t`So the integral is $\int (u^2 - 1)\,u^{${n - 1}}\,du$.`,
          ],
          teach: t`Odd tangent power: keep $\sec x\tan x$ as $du$ and turn the remaining even power of tangent into secants.`,
          explain: n === 1
            ? t`$\int (u^2 - 1)\,du = \tfrac13u^3 - u$ with $u = \sec x$: $\;\tfrac13\sec^3 x - \sec x + C$.`
            : t`$\int (u^{${n + 1}} - u^{${n - 1}})\,du = \tfrac{u^{${n + 2}}}{${n + 2}} - \tfrac{u^{${n}}}{${n}}$ with $u = \sec x$.`,
          visual: fgraph({ f: `tan(x)^3*sec(x)^${n}`, F: `sec(x)^${n + 2}/${n + 2} - sec(x)^${n}/${n}`, x: [-1.2, 1.2], trim: 0.06 }),
        };
      },
    }),
    expr({
      id: 'tan-cubed', difficulty: 3,
      gen(r) {
        const k = r.int(1, 2);
        const tn = T('tan', k), c = T('cos', k);
        return {
          prompt: t`Find $\displaystyle\int ${F(TAN, k, 3)}\,dx$.`,
          answer: `(${tn}^2/2 + ln(abs(${c})))/${k}`,
          answerTeX: k === 1 ? t`\tfrac12\tan^2 x + \ln\lvert\cos x\rvert` : t`\tfrac14\tan^2(2x) + \tfrac12\ln\lvert\cos(2x)\rvert`,
          integrand: T('tan', k, 3),
          keys: [['tan', 'tan('], ['sec', 'sec('], ['|x|', 'abs(']],
          vars: { x: [-1.2 / k, 1.2 / k] }, mode: 'constant',
          errors: [{ answer: `(${tn}^2/2 - ln(abs(${c})))/${k}`, feedback: t`$\int\tan\theta\,d\theta = -\ln\lvert\cos\theta\rvert$, so subtracting it gives $+\ln\lvert\cos\theta\rvert$.` }],
          hints: [
            t`Split off $\tan^2 = \sec^2 - 1$: $\;\tan^3\theta = \tan\theta\sec^2\theta - \tan\theta$.`,
            t`$\int \tan\theta\sec^2\theta\,d\theta = \tfrac12\tan^2\theta$ (let $u = \tan\theta$), and $\int\tan\theta\,d\theta = -\ln\lvert\cos\theta\rvert$.`,
          ],
          teach: t`With no secant at all, peel off $\tan^2 = \sec^2 - 1$ and remember $\int \tan\theta\,d\theta = \ln\lvert\sec\theta\rvert$.`,
          explain: k === 1
            ? t`$\int\tan^3 x\,dx = \tfrac12\tan^2 x - \ln\lvert\sec x\rvert + C = \tfrac12\tan^2 x + \ln\lvert\cos x\rvert + C$.`
            : t`$\int\tan^3\theta\,d\theta = \tfrac12\tan^2\theta + \ln\lvert\cos\theta\rvert$; with $\theta = 2x$, $d\theta = 2\,dx$, so divide by 2: $\tfrac14\tan^2(2x) + \tfrac12\ln\lvert\cos(2x)\rvert + C$.`,
          visual: fgraph({ f: `tan(${kx(k)})^3`, F: `(${tn}^2/2 + ln(abs(${c})))/${k}`, x: [-1.3 / k, 1.3 / k], trim: 0.06 }),
        };
      },
    }),
    mcq({
      id: 'two-routes', difficulty: 3,
      prompt: t`For $\displaystyle\int \tan^3 x\sec^4 x\,dx$, Ana uses $u = \tan x$ and gets $\tfrac14\tan^4 x + \tfrac16\tan^6 x + C$. Ben uses $u = \sec x$ and gets $\tfrac16\sec^6 x - \tfrac14\sec^4 x + C$. Who is right?`,
      choices: ['Both: their answers differ by a constant', 'Only Ana', 'Only Ben', t`Neither: the answer must contain $\ln\lvert\sec x\rvert$`],
      answer: 0,
      why: {
        1: t`Ben’s route is legitimate too: the tangent’s power is odd, so $u = \sec x$ works.`,
        2: t`Ana’s route is legitimate too: the secant’s power is even, so $u = \tan x$ works.`,
        3: t`A logarithm appears only when an odd power of tangent is left with no secant to pair with; here every piece becomes a polynomial.`,
      },
      hints: ['Both routes are allowed here — why?', t`Write $\tan^2 x = \sec^2 x - 1$ in Ana’s answer and simplify.`],
      teach: 'Two correct antiderivatives may look different; they can differ only by a constant.',
      explain: t`With $s = \sec^2 x$, Ana’s answer is $\tfrac14(s-1)^2 + \tfrac16(s-1)^3 = \tfrac16s^3 - \tfrac14s^2 + \tfrac1{12}$, which is Ben’s plus $\tfrac1{12}$. Both are right.`,
      visual: fgraph({ f: 'tan(x)^4/4 + tan(x)^6/6', x: [-1, 1], extra: [{ fn: 'sec(x)^6/6 - sec(x)^4/4', color: 'warn', dash: true, width: 2 }], caption: t`Ana’s answer (blue) and Ben’s (dashed). Compare their shapes, and where each one crosses the vertical axis.` }),
    }),
    num({
      id: 'definite', difficulty: 2,
      gen(r) {
        const [f, Ftex, fs, ub, ubTeX, val, anti, at] = r.pick([
          ['sec(x)^4', t`\sec^4 x`, 'sec⁴ x', Math.PI / 4, t`\tfrac{\pi}{4}`, 4 / 3, t`\Big[\tan x + \tfrac13\tan^3 x\Big]_0^{\pi/4} = 1 + \tfrac13`, 0.72],
          ['tan(x)', t`\tan x`, 'tan x', Math.PI / 3, t`\tfrac{\pi}{3}`, Math.log(2), t`\Big[\ln\lvert\sec x\rvert\Big]_0^{\pi/3} = \ln 2 - \ln 1`, 1.12],
          ['tan(x)^2', t`\tan^2 x`, 'tan² x', Math.PI / 4, t`\tfrac{\pi}{4}`, 1 - Math.PI / 4, t`\Big[\tan x - x\Big]_0^{\pi/4} = 1 - \tfrac{\pi}{4}`, 1.0],
          ['sec(x)', t`\sec x`, 'sec x', Math.PI / 4, t`\tfrac{\pi}{4}`, Math.log(Math.SQRT2 + 1), t`\Big[\ln\lvert\sec x + \tan x\rvert\Big]_0^{\pi/4} = \ln(\sqrt2 + 1)`, 1.12],
        ]);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${ubTeX}} ${Ftex}\,dx$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: f, limits: [0, ub],
          hints: [t`Find an antiderivative of $${Ftex}$ first (identity or substitution).`, t`Evaluate it at $${ubTeX}$ and at 0; note $\tan\tfrac{\pi}{4} = 1$, $\sec\tfrac{\pi}{4} = \sqrt2$, $\sec\tfrac{\pi}{3} = 2$.`],
          teach: 'Find the antiderivative with the tan–sec rules, then evaluate at both limits.',
          explain: t`$${anti} \approx ${fmt(val, 4)}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.25], y: [0, 4.2], xlabel: 'x (rad)', curves: [{ fn: f, color: 'accent', label: fs, labelAt: at }], shade: [{ fn: f, from: 0, to: ub }], vlines: [{ x: ub }] },
            caption: t`The shaded area is the integral. The integrand grows without bound as $x \to \pi/2 \approx 1.57$.`,
          },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-tan-fourth', difficulty: 3,
      prompt: t`Find $\displaystyle\int \tan^4 x\,dx$.`,
      answer: 'tan(x)^3/3 - tan(x) + x',
      answerTeX: t`\tfrac13\tan^3 x - \tan x + x`,
      integrand: 'tan(x)^4',
      vars: { x: [-1.2, 1.2] }, mode: 'constant',
      hints: [t`$\tan^4 x = \tan^2 x\,(\sec^2 x - 1) = \tan^2 x\sec^2 x - \tan^2 x$.`, t`Then $\tan^2 x = \sec^2 x - 1$ once more.`],
      teach: t`Peel off $\tan^2 = \sec^2 - 1$ repeatedly until every piece is $\tan^n\sec^2$ or a constant.`,
      explain: t`$\int\tan^2 x\sec^2 x\,dx - \int(\sec^2 x - 1)\,dx = \tfrac13\tan^3 x - \tan x + x + C$.`,
      visual: fgraph({ f: 'tan(x)^4', F: 'tan(x)^3/3 - tan(x) + x', x: [-1.25, 1.25], trim: 0.06 }),
    }),
    expr({
      id: 'cp-sec-sixth', difficulty: 3,
      prompt: t`Find $\displaystyle\int \sec^6 x\,dx$.`,
      answer: 'tan(x) + 2tan(x)^3/3 + tan(x)^5/5',
      answerTeX: t`\tan x + \tfrac23\tan^3 x + \tfrac15\tan^5 x`,
      integrand: 'sec(x)^6',
      vars: { x: [-1.2, 1.2] }, mode: 'constant',
      hints: [t`Save $\sec^2 x$; write $\sec^4 x = (1 + \tan^2 x)^2$.`, t`With $u = \tan x$: $\int (1 + u^2)^2\,du = \int(1 + 2u^2 + u^4)\,du$.`],
      teach: 'Even secant power: one sec² for du, the rest as powers of (1 + tan²).',
      explain: t`$\int(1 + 2u^2 + u^4)\,du = u + \tfrac23u^3 + \tfrac15u^5$ with $u = \tan x$.`,
      visual: fgraph({ f: 'sec(x)^6', F: 'tan(x) + 2tan(x)^3/3 + tan(x)^5/5', x: [-1.1, 1.1], trim: 0.06 }),
    }),
    num({
      id: 'cp-mercator', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([8, 10, 12, 15]), deg = r.pick([30, 45, 55, 60, 70]);
        const phi = (deg * Math.PI) / 180, y = R * Math.log(1 / Math.cos(phi) + Math.tan(phi));
        return {
          prompt: t`An aeronautical chart uses the Mercator projection with an equatorial scale of $R = ${R}\ \text{cm}$ (the radius of the globe it maps). The parallel at latitude $\varphi$ is drawn at height $y = R\int_0^{\varphi}\sec\theta\,d\theta$ above the equator. How far up the chart is latitude ${deg}°, to 3 significant figures?`,
          answer: y, units: 'cm', tol: { rel: 0.005 },
          integrand: `${R}*sec(x)`, limits: [0, phi],
          errors: [{ value: R * phi, feedback: t`That is $R\varphi$, the distance on the globe itself. Mercator stretches each band by $\sec\theta$, so integrate $\sec\theta$.` }, { value: R * Math.tan(phi), feedback: t`$\tan\varphi$ is not an antiderivative of $\sec\theta$; you need $\ln\lvert\sec\theta + \tan\theta\rvert$.` }],
          hints: [t`$\int\sec\theta\,d\theta = \ln\lvert\sec\theta + \tan\theta\rvert$.`, t`Convert ${deg}° to radians if your calculator needs it, then evaluate $R\ln(\sec\varphi + \tan\varphi)$.`],
          teach: t`The Mercator spacing is $R\ln\lvert\sec\varphi + \tan\varphi\rvert$ — the integral of the secant.`,
          explain: t`$y = ${R}\ln\big(\sec ${deg}^\circ + \tan ${deg}^\circ\big) = ${R}\ln(${fmt(1 / Math.cos(phi) + Math.tan(phi), 4)}) = ${fmt(y, 3)}$ cm, against $R\varphi = ${fmt(R * phi, 3)}$ cm on the globe.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.6], y: [0, 4], xlabel: 'θ (rad)', curves: [{ fn: 'sec(x)', color: 'accent' }], shade: [{ fn: 'sec(x)', from: 0, to: phi }], vlines: [{ x: phi, label: `${deg}°` }] },
            caption: t`$\sec\theta$ from the equator to ${deg}° (in radians on the axis); the shaded area is $y/R$. The Earth is treated as a sphere.`,
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.2', url: 'https://openstax.org/books/calculus-volume-2/pages/3-2-trigonometric-integrals' }],
});
