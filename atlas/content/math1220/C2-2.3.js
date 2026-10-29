// Trigonometric integrals: powers of sine and cosine.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, frac } from '../../src/core/format.js';
import { fterm, kx, fgraph } from './_integration.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-2.3',
  title: 'Trigonometric integrals: sines and cosines',
  minutes: 10, difficulty: 2,
  intro: t`To integrate $\sin^m x\cos^n x$, look at the two powers. **If one power is odd**, split off one factor of that function to become part of $du$, rewrite the even power left over with $\sin^2 x + \cos^2 x = 1$, and substitute. **If both powers are even**, lower them with the half-angle identities:

$$\sin^2 x = \tfrac12\,(1 - \cos 2x), \qquad \cos^2 x = \tfrac12\,(1 + \cos 2x)$$

These identities are why the square of a sine wave averages to exactly one half — the reason an AC voltage’s RMS value is its peak divided by $\sqrt2$, and why a vibrating spring’s kinetic energy averages to half its total energy.`,
  symbols: [
    { tex: 'x', text: 'the angle, in radians' },
    { tex: t`\sin^2 x`, text: t`shorthand for $(\sin x)^2$, the **square of the sine** — not $\sin(x^2)$` },
    { tex: t`\cos 2x`, text: t`the cosine of the doubled angle: it oscillates twice as fast as $\cos x$` },
    { tex: t`\tfrac12`, text: t`the average value of both $\sin^2 x$ and $\cos^2 x$ over a full period` },
    { tex: 'm,\\ n', text: t`the whole-number powers in $\int \sin^m x\cos^n x\,dx$; which one is odd decides the method` },
  ],
  why: t`Power reduction trades a square for a cosine of double frequency, which integrates at once: $\int \sin^2 x\,dx = \tfrac{x}{2} - \tfrac{\sin 2x}{4} + C$.`,
  visual: {
    type: 'graph',
    title: 'A squared sine is a lifted cosine',
    lead: t`The blue curve is $\sin^2 x$. The violet curve is $-\tfrac12\cos 2x$: lift it by $\tfrac12$ and it lands exactly on the blue one — the half-angle identity in a picture. The shaded area is $\int_0^T \sin^2 x\,dx$.`,
    tasks: [
      'Set T near 3.14 (π): the area is π/2 and the average is exactly ½.',
      'Stop T halfway up a hump: the average misses ½ — only whole half-periods give exactly ½.',
      'Push T to the right edge: the average closes in on ½ whatever you do.',
    ],
    params: {
      x: [0, 12.6], y: [-0.65, 1.25],
      sliders: [{ key: 'T', label: 'Upper limit $T$', min: 0.2, max: 12.5, step: 0.01, value: 3.14, explain: t`The integral runs from $0$ to $T$ (radians); one period of $\sin^2 x$ is $\pi \approx 3.14$.` }],
      curves: [
        { fn: '-cos(2x)/2', color: 'violet', width: 1.6, label: '−½ cos 2x', labelAt: 6.28 },
        { fn: 'sin(x)^2', color: 'accent', label: 'sin² x', labelAt: 1.2 },
      ],
      shade: [{ fn: 'sin(x)^2', from: 0, to: 'T', color: 'accent', alpha: 0.25 }],
      hlines: [{ y: 0.5, color: 'ink3', label: 'y = ½' }],
      vlines: [{ x: 'T' }],
      readouts: [
        { label: t`area $\tfrac{T}{2} - \tfrac{\sin 2T}{4}$`, expr: 'T/2 - sin(2T)/4' },
        { label: 'average = area ÷ T', expr: '(T/2 - sin(2T)/4)/T' },
      ],
    },
    caption: t`Exact curves; the area readout is the antiderivative evaluated, not a numerical estimate. Angles are in radians.`,
  },
  example: {
    prompt: t`Find $\displaystyle\int \sin^3 x\cos^2 x\,dx$.`,
    steps: [
      { label: 'Spot the odd power', text: t`The sine’s power, 3, is odd. Save one $\sin x$ to go with $dx$ and turn the remaining $\sin^2 x$ into cosines: $$\sin^3 x\cos^2 x = (1 - \cos^2 x)\cos^2 x\,\sin x.$$` },
      { label: 'Substitute', text: t`Let $u = \cos x$, so $du = -\sin x\,dx$: $$\int (1 - u^2)\,u^2\,(-du) = \int (u^4 - u^2)\,du.$$` },
      { label: 'Integrate', text: t`$\int (u^4 - u^2)\,du = \tfrac15 u^5 - \tfrac13 u^3 + C$.` },
      { label: 'Back-substitute', text: t`$\tfrac15\cos^5 x - \tfrac13\cos^3 x + C$.` },
      { label: 'Check', text: t`$\dfrac{d}{dx}\Big[\tfrac15\cos^5 x - \tfrac13\cos^3 x\Big] = -\cos^4 x\sin x + \cos^2 x\sin x = \cos^2 x\sin x\,(1 - \cos^2 x) = \sin^3 x\cos^2 x.$ ✓` },
    ],
    answer: t`$\displaystyle\int \sin^3 x\cos^2 x\,dx = \tfrac15\cos^5 x - \tfrac13\cos^3 x + C$`,
  },
  practice: [
    mcq({
      id: 'which-sub', difficulty: 1,
      gen(r) {
        const [m, n] = r.pick([[5, 2], [3, 4], [3, 2], [2, 3], [4, 3], [2, 5]]);
        const sinOdd = m % 2 === 1;
        const subCos = t`$u = \cos x$, saving one $\sin x$ for $du$`;
        const subSin = t`$u = \sin x$, saving one $\cos x$ for $du$`;
        return {
          prompt: t`What is the most efficient first move for $\displaystyle\int \sin^{${m}} x\,\cos^{${n}} x\,dx$?`,
          choices: [sinOdd ? subCos : subSin, sinOdd ? subSin : subCos, 'Lower every power with the half-angle identities', t`Integration by parts with $u = \sin^{${m}} x$`],
          answer: 0,
          why: {
            1: sinOdd
              ? t`Then you need a spare $\cos x$ for $du$, leaving $\cos^{${n - 1}} x$ — an odd power, which becomes a square root of $1 - u^2$.`
              : t`Then you need a spare $\sin x$ for $du$, leaving $\sin^{${m - 1}} x$ — an odd power, which becomes a square root of $1 - u^2$.`,
            2: 'That works only slowly here: with an odd power present, a substitution finishes in one step.',
            3: 'Parts does not shrink the powers; each round leaves another trig product just as hard.',
          },
          hints: ['Which power is odd?', 'Save one factor of the function with the odd power — it becomes du — and convert the even power that is left.'],
          teach: 'When one power is odd, peel off one factor of that function for du and substitute the other function.',
          explain: sinOdd
            ? t`$\sin^{${m}}x = (1 - \cos^2 x)^{${(m - 1) / 2}}\sin x$, so $u = \cos x$, $du = -\sin x\,dx$ turns the integral into a polynomial in $u$.`
            : t`$\cos^{${n}}x = (1 - \sin^2 x)^{${(n - 1) / 2}}\cos x$, so $u = \sin x$, $du = \cos x\,dx$ turns the integral into a polynomial in $u$.`,
          visual: fgraph({ f: `sin(x)^${m}*cos(x)^${n}`, x: [-3.2, 3.2], caption: t`The integrand $\sin^{${m}}x\cos^{${n}}x$. Its antiderivative turns out to be a polynomial in $\cos x$ or $\sin x$ — whichever one the odd power lets you substitute.` }),
        };
      },
    }),
    expr({
      id: 'cos-cubed', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3);
        const S = t`\sin(${kx(k)})`, s = `sin(${kx(k)})`;
        const errors = [{ answer: `(${s} + ${s}^3/3)/${k}`, feedback: t`$\cos^2 = 1 - \sin^2$, so the cubic term is subtracted.` }];
        if (k > 1) errors.push({ answer: `${s} - ${s}^3/3`, feedback: t`Divide by ${k}: the derivative of $${S}$ is $${k}\cos(${kx(k)})$ (chain rule).` });
        return {
          prompt: t`Find $\displaystyle\int \cos^3(${kx(k)})\,dx$.`,
          answer: `(${s} - ${s}^3/3)/${k}`,
          answerTeX: k === 1 ? t`\sin x - \tfrac13\sin^3 x` : t`\tfrac{1}{${k}}${S} - \tfrac{1}{${3 * k}}\sin^3(${kx(k)})`,
          integrand: `cos(${kx(k)})^3`,
          vars: { x: [-2, 2] }, mode: 'constant', errors,
          hints: [t`The power 3 is odd: write $\cos^3(${kx(k)}) = \big(1 - \sin^2(${kx(k)})\big)\cos(${kx(k)})$.`, t`Let $u = ${S}$, so $du = ${k === 1 ? '' : k}\cos(${kx(k)})\,dx$.`],
          teach: t`An odd power of cosine: keep one $\cos$ for $du$, convert the rest to sines with $\cos^2 = 1 - \sin^2$.`,
          explain: t`With $u = ${S}$: $\tfrac{1}{${k}}\int (1 - u^2)\,du = \tfrac{1}{${k}}\big(u - \tfrac13u^3\big)$, so the answer is ${k === 1 ? t`$\sin x - \tfrac13\sin^3 x + C$` : t`$\tfrac{1}{${k}}${S} - \tfrac{1}{${3 * k}}\sin^3(${kx(k)}) + C$`}.`,
          visual: fgraph({ f: `cos(${kx(k)})^3`, F: `(sin(${kx(k)}) - sin(${kx(k)})^3/3)/${k}`, x: [-3.2, 3.2] }),
        };
      },
    }),
    expr({
      id: 'sin-squared', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3);
        const two = kx(2 * k);
        return {
          prompt: t`Find $\displaystyle\int \sin^2(${kx(k)})\,dx$.`,
          answer: `x/2 - sin(${two})/${4 * k}`,
          answerTeX: t`\frac{x}{2} - \frac{\sin(${two})}{${4 * k}}`,
          integrand: `sin(${kx(k)})^2`,
          vars: { x: [-2, 2] }, mode: 'constant',
          errors: [
            { answer: `x/2 + sin(${two})/${4 * k}`, feedback: t`That is $\int\cos^2(${kx(k)})\,dx$. For the sine, $\sin^2\theta = \tfrac12(1 - \cos 2\theta)$ — with a minus sign.` },
            { answer: `sin(${kx(k)})^3/${3 * k}`, feedback: t`Differentiate that: you get $\sin^2(${kx(k)})\cos(${kx(k)})$. The power rule needs the cosine factor to be there already.` },
          ],
          hints: [t`Both powers are even (the cosine’s power is 0): use $\sin^2\theta = \tfrac12(1 - \cos 2\theta)$ with $\theta = ${kx(k)}$.`, t`$\int \tfrac12\big(1 - \cos(${two})\big)\,dx = \tfrac{x}{2} - \tfrac12\cdot\tfrac{\sin(${two})}{${2 * k}}$.`],
          teach: 'An even power of sine or cosine alone: lower it with the half-angle identity, then integrate the double-angle cosine.',
          explain: t`$\sin^2(${kx(k)}) = \tfrac12 - \tfrac12\cos(${two})$, so $\int \sin^2(${kx(k)})\,dx = \tfrac{x}{2} - \tfrac{\sin(${two})}{${4 * k}} + C$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 2 * Math.PI], y: [-0.15, 1.2], curves: [{ fn: `sin(${k}*x)^2`, color: 'accent' }], hlines: [{ y: 0.5, label: 'y = ½' }] },
            caption: t`The integrand oscillates between 0 and 1 around its average $\tfrac12$ — which is why the answer starts with $\tfrac{x}{2}$.`,
          },
        };
      },
    }),
    expr({
      id: 'odd-mixed', difficulty: 3,
      gen(r) {
        const p = r.pick([2, 4]), oddSin = r.bool(0.5);
        // ∫ sin^p cos^3 = sin^{p+1}/(p+1) − sin^{p+3}/(p+3);  ∫ sin^3 cos^p = −cos^{p+1}/(p+1) + cos^{p+3}/(p+3)
        const prompt = oddSin ? t`\sin^3 x\cos^{${p}} x` : t`\sin^{${p}} x\cos^3 x`;
        const answer = oddSin ? `-cos(x)^${p + 1}/${p + 1} + cos(x)^${p + 3}/${p + 3}` : `sin(x)^${p + 1}/${p + 1} - sin(x)^${p + 3}/${p + 3}`;
        const answerTeX = oddSin ? t`-\frac{\cos^{${p + 1}} x}{${p + 1}} + \frac{\cos^{${p + 3}} x}{${p + 3}}` : t`\frac{\sin^{${p + 1}} x}{${p + 1}} - \frac{\sin^{${p + 3}} x}{${p + 3}}`;
        return {
          prompt: t`Find $\displaystyle\int ${prompt}\,dx$.`,
          answer, answerTeX,
          integrand: oddSin ? `sin(x)^3*cos(x)^${p}` : `sin(x)^${p}*cos(x)^3`,
          vars: { x: [-2, 2] }, mode: 'constant',
          errors: [{ answer: oddSin ? `cos(x)^${p + 1}/${p + 1} - cos(x)^${p + 3}/${p + 3}` : `-sin(x)^${p + 1}/${p + 1} + sin(x)^${p + 3}/${p + 3}`, feedback: oddSin ? t`The sign is flipped: $du = -\sin x\,dx$ brings a minus sign.` : 'Every sign is flipped — check du = cos x dx and the expansion of 1 − u².' }],
          hints: [
            oddSin ? t`The sine’s power is odd: save one $\sin x$ and write $\sin^2 x = 1 - \cos^2 x$.` : t`The cosine’s power is odd: save one $\cos x$ and write $\cos^2 x = 1 - \sin^2 x$.`,
            oddSin ? t`With $u = \cos x$, $du = -\sin x\,dx$: $\;-\int (1 - u^2)\,u^{${p}}\,du = -\int (u^{${p}} - u^{${p + 2}})\,du$.` : t`With $u = \sin x$, $du = \cos x\,dx$: $\;\int u^{${p}}(1 - u^2)\,du = \int (u^{${p}} - u^{${p + 2}})\,du$.`,
          ],
          teach: t`Peel one factor off the odd power for $du$; everything else becomes a polynomial in $u$.`,
          explain: oddSin
            ? t`With $u = \cos x$: $\;-\int (u^{${p}} - u^{${p + 2}})\,du = -\frac{u^{${p + 1}}}{${p + 1}} + \frac{u^{${p + 3}}}{${p + 3}}$, so the answer is $${answerTeX} + C$.`
            : t`With $u = \sin x$: $\;\int (u^{${p}} - u^{${p + 2}})\,du = \frac{u^{${p + 1}}}{${p + 1}} - \frac{u^{${p + 3}}}{${p + 3}}$, so the answer is $${answerTeX} + C$.`,
          visual: fgraph({ f: oddSin ? `sin(x)^3*cos(x)^${p}` : `sin(x)^${p}*cos(x)^3`, F: answer, x: [-3.2, 3.2] }),
        };
      },
    }),
    num({
      id: 'def-fourth-power', difficulty: 3,
      gen(r) {
        const [fn, F, ub, ubTeX] = r.pick([
          ['sin', t`\sin^4 x`, Math.PI, t`\pi`], ['cos', t`\cos^4 x`, Math.PI, t`\pi`],
          ['sin', t`\sin^4 x`, Math.PI / 2, t`\tfrac{\pi}{2}`], ['cos', t`\cos^4 x`, Math.PI / 2, t`\tfrac{\pi}{2}`], ['sin', t`\sin^4 x`, 2 * Math.PI, t`2\pi`],
        ]);
        const val = (3 / 8) * ub;   // the cos 2x and cos 4x terms vanish at these limits
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{${ubTeX}} ${F}\,dx$ to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          integrand: `${fn}(x)^4`, limits: [0, ub],
          errors: [{ value: ub / 4, feedback: t`Squaring $\tfrac12(1 \mp \cos 2x)$ gives a $\cos^2 2x$ term — lower it a second time; it contributes $\tfrac18$, not 0.` }, { value: ub / 2, feedback: t`That is the integral of $${fn === 'sin' ? t`\sin^2 x` : t`\cos^2 x`}$. Square the identity: the fourth power averages $\tfrac38$, not $\tfrac12$.` }],
          hints: [
            t`Square the half-angle identity: $${F} = \tfrac14\big(1 ${fn === 'sin' ? '-' : '+'} 2\cos 2x + \cos^2 2x\big)$.`,
            t`Lower $\cos^2 2x = \tfrac12(1 + \cos 4x)$ too: $${F} = \tfrac38 ${fn === 'sin' ? '-' : '+'} \tfrac12\cos 2x + \tfrac18\cos 4x$.`,
            t`Over $[0, ${ubTeX}]$ the $\cos 2x$ and $\cos 4x$ terms integrate to 0, leaving $\tfrac38\cdot ${ubTeX}$.`,
          ],
          teach: 'A fourth power needs the half-angle identity twice; over these limits the cosine terms integrate to zero, leaving only the constant.',
          explain: t`$${F} = \tfrac38 ${fn === 'sin' ? '-' : '+'} \tfrac12\cos 2x + \tfrac18\cos 4x$, and only the constant survives: $\tfrac38\cdot ${ubTeX} = ${fmt(val, 4)}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 2 * Math.PI], y: [-0.1, 1.15], curves: [{ fn: `${fn}(x)^4`, color: 'accent' }], shade: [{ fn: `${fn}(x)^4`, from: 0, to: ub }], hlines: [{ y: 0.375, label: 'y = 3/8' }] },
            caption: t`The shaded area is the integral. The dashed line marks $\tfrac38$, the average of a fourth power of sine or cosine over whole half-periods.`,
          },
        };
      },
    }),
    mcq({
      id: 'orthogonal', difficulty: 2,
      gen(r) {
        const m = r.int(1, 4), n = r.intExcept(m + 1, 6, []);
        return {
          prompt: t`What is $\displaystyle\int_0^{2\pi} \sin(${kx(m)})\,\sin(${kx(n)})\,dx$?`,
          choices: ['0', t`$\pi$`, t`$2\pi$`, t`$\tfrac{\pi}{2}$`],
          answer: 0,
          why: {
            1: t`That is the value when the two frequencies are equal: $\int_0^{2\pi}\sin^2(${kx(m)})\,dx = \pi$. Here they differ.`,
            2: 'That would need the product to average 1 over the interval; a product of sines with different frequencies averages 0.',
            3: t`That is $\int_0^{\pi}\sin^2 x\,dx$. Here the frequencies differ, and the product averages to zero.`,
          },
          hints: [t`Use the product-to-sum identity $\sin A\sin B = \tfrac12\big[\cos(A - B) - \cos(A + B)\big]$.`, t`Both $\cos(${kx(n - m)})$ and $\cos(${kx(n + m)})$ run through whole periods on $[0, 2\pi]$.`],
          teach: t`Sines of different whole-number frequencies are orthogonal on $[0, 2\pi]$ — the fact Fourier series are built on.`,
          explain: t`$\sin(${kx(m)})\sin(${kx(n)}) = \tfrac12\big[\cos(${kx(n - m)}) - \cos(${kx(n + m)})\big]$, and each cosine completes whole periods on $[0, 2\pi]$, so the integral is $0$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 2 * Math.PI], y: [-1.1, 1.1], curves: [{ fn: `sin(${m}*x)*sin(${n}*x)`, color: 'accent' }], shade: [{ fn: `sin(${m}*x)*sin(${n}*x)`, from: 0, to: 2 * Math.PI }] },
            caption: 'The product over one full turn. Count the shaded lobes above and below the axis.',
          },
        };
      },
    }),
    mcq({
      id: 'power-rule-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes $\displaystyle\int \sin^2 x\,dx = \frac{\sin^3 x}{3} + C$. What is wrong?`,
      choices: [
        t`The power rule needs the inside derivative: $\frac{d}{dx}\frac{\sin^3 x}{3} = \sin^2 x\cos x$, not $\sin^2 x$.`,
        t`It should be $-\frac{\cos^3 x}{3} + C$.`,
        t`It should be $\frac{\sin^3 x}{3} + x + C$.`,
        t`Nothing: it is correct.`,
      ],
      answer: 0,
      why: {
        1: t`Differentiate that: $\cos^2 x\sin x$, still not $\sin^2 x$.`,
        2: t`Its derivative is $\sin^2 x\cos x + 1$ — nothing like $\sin^2 x$.`,
        3: t`Differentiate it: $\sin^2 x\cos x \ne \sin^2 x$.`,
      },
      hints: ['Check the answer by differentiating it.', t`The power rule $\int u^2\,du = u^3/3$ needs $du = \cos x\,dx$ in the integrand.`],
      teach: t`$\int u^n\,du$ needs $du$: a power of $\sin x$ integrates by the power rule only when a $\cos x$ factor is there to be $du$.`,
      explain: t`With no $\cos x$ to act as $du$, use the half-angle identity: $\int \sin^2 x\,dx = \tfrac{x}{2} - \tfrac{\sin 2x}{4} + C$.`,
      visual: fgraph({ f: 'sin(x)^2', x: [-3.2, 3.2], extra: [{ fn: 'sin(x)^2*cos(x)', color: 'bad', dash: true, width: 2 }], caption: t`The integrand $\sin^2 x$ (blue) and the derivative of the student’s answer, $\sin^2 x\cos x$ (red, dashed). They are different functions, so $\tfrac13\sin^3 x$ is not an antiderivative.` }),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-sin-cubed', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3);
        const c = `cos(${kx(k)})`, C = t`\cos(${kx(k)})`;
        return {
          prompt: t`Find $\displaystyle\int \sin^3(${kx(k)})\,dx$.`,
          answer: `(-${c} + ${c}^3/3)/${k}`,
          answerTeX: k === 1 ? t`-\cos x + \tfrac13\cos^3 x` : t`-\tfrac{1}{${k}}${C} + \tfrac{1}{${3 * k}}\cos^3(${kx(k)})`,
          integrand: `sin(${kx(k)})^3`,
          vars: { x: [-2, 2] }, mode: 'constant',
          hints: [t`$\sin^3\theta = (1 - \cos^2\theta)\sin\theta$; let $u = \cos(${kx(k)})$.`],
          teach: 'An odd power of sine: keep one sine for du, convert the rest to cosines.',
          explain: t`$u = ${C}$, $du = -${k === 1 ? '' : k}\sin(${kx(k)})\,dx$: $\;-\tfrac{1}{${k}}\int (1 - u^2)\,du = -\tfrac{1}{${k}}\big(u - \tfrac{u^3}{3}\big) + C$.`,
          visual: fgraph({ f: `sin(${kx(k)})^3`, F: `(-${c} + ${c}^3/3)/${k}`, x: [-3.2, 3.2] }),
        };
      },
    }),
    expr({
      id: 'cp-cos-squared', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4);
        return {
          prompt: t`Find $\displaystyle\int \cos^2(${kx(k)})\,dx$.`,
          answer: `x/2 + sin(${kx(2 * k)})/${4 * k}`,
          answerTeX: t`\frac{x}{2} + \frac{\sin(${kx(2 * k)})}{${4 * k}}`,
          integrand: `cos(${kx(k)})^2`,
          vars: { x: [-2, 2] }, mode: 'constant',
          hints: [t`$\cos^2\theta = \tfrac12(1 + \cos 2\theta)$.`],
          teach: 'An even power alone: lower it with the half-angle identity.',
          explain: t`$\int \tfrac12\big(1 + \cos(${kx(2 * k)})\big)\,dx = \tfrac{x}{2} + \tfrac{\sin(${kx(2 * k)})}{${4 * k}} + C$.`,
          visual: fgraph({ f: `cos(${kx(k)})^2`, F: `x/2 + sin(${kx(2 * k)})/${4 * k}`, x: [-2, 2], hlines: [{ y: 0.5 }] }),
        };
      },
    }),
    num({
      id: 'cp-isolator', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([0.4, 0.8, 1.2, 2.5]), A = r.pick([2, 3, 5]), w = r.pick([40, 60, 80]);   // A in mm
        const Am = A / 1000, avg = 0.25 * m * Am * Am * w * w;            // ⟨K⟩ = ¼ m A² ω²
        const avgmJ = avg * 1000;
        return {
          prompt: t`A ${m} kg avionics box on vibration-isolation springs oscillates as $x(t) = A\cos(\omega t)$ with $A = ${A}$ mm and $\omega = ${w}$ rad/s. What is its kinetic energy averaged over one period, in millijoules?`,
          answer: avgmJ, units: 'mJ', tol: { rel: 0.01 },
          integrand: `${1000 * w / (2 * Math.PI)}*0.5*${m}*(${Am * w}*sin(${w}*x))^2`, limits: [0, (2 * Math.PI) / w],
          errors: [{ value: 0.5 * m * Am * Am * w * w * 1000, feedback: t`That is the *maximum* kinetic energy. Averaging $\sin^2$ over a period gives a factor $\tfrac12$.` }],
          hints: [
            t`The velocity is $v = -A\omega\sin(\omega t)$, so $K = \tfrac12 m A^2\omega^2\sin^2(\omega t)$.`,
            t`The average over one period $T = 2\pi/\omega$ is $\tfrac1T\int_0^T K\,dt$, and $\sin^2$ averages to $\tfrac12$ over a period.`,
          ],
          teach: t`Over a whole period $\sin^2$ averages to $\tfrac12$, so the mean kinetic energy of a harmonic oscillator is half its maximum.`,
          explain: t`$\langle K\rangle = \tfrac12 m A^2\omega^2\cdot\tfrac12 = \tfrac14(${m})(${Am})^2(${w})^2 = ${fmt(avgmJ, 3)}$ mJ.`,
          visual: {
            type: 'graph',
            params: { x: [0, (2 * Math.PI) / w], y: [-0.05 * avgmJ * 2, avgmJ * 2.3], xlabel: 't (s)', ylabel: 'K (mJ)', curves: [{ fn: `${2 * avgmJ}*sin(${w}*x)^2`, color: 'accent' }], shade: [{ fn: `${2 * avgmJ}*sin(${w}*x)^2`, from: 0, to: (2 * Math.PI) / w }] },
            caption: 'Kinetic energy over one period. The average is the shaded area divided by the period. Ideal undamped springs; real isolators also dissipate energy.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.2', url: 'https://openstax.org/books/calculus-volume-2/pages/3-2-trigonometric-integrals' }],
});
