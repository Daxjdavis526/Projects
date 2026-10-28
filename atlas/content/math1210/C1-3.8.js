// Derivatives of exponentials and logarithms — e^x is its own slope, ln x
// has slope 1/x, and the rocket equation differentiates into thrust over mass.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { curveFig, fitY } from './_c1kit.js';

const t = String.raw;
const LN10 = Math.log(10), LN2 = Math.log(2);

// the rocket of C1-3.6, now seen through the rocket equation (F = v_e ṁ)
const VE = 3600, M0 = 50000, MDOT = 250;

export default lesson({
  id: 'math1210.C1-3.8',
  title: 'Derivatives of exponentials and logarithms',
  minutes: 10, difficulty: 2,
  intro: t`The number $e \approx 2.71828$ is chosen so that the exponential is its own derivative, and the natural logarithm, its inverse, has the simplest slope of all:

$$\frac{d}{dx}e^{x} = e^{x}, \qquad \frac{d}{dx}\ln x = \frac{1}{x}$$

Any other base costs a constant factor: $\dfrac{d}{dx}a^{x} = a^{x}\ln a$ and $\dfrac{d}{dx}\log_a x = \dfrac{1}{x\ln a}$. Whatever grows or decays in proportion to its own size — charge leaking off a capacitor, a radioactive sample, the pressure of the atmosphere with height — is an exponential, and its rate of change is proportional to the quantity itself.`,
  symbols: [
    { tex: 'e', text: 'Euler’s number, $2.71828\\ldots$, the base whose exponential has slope $1$ at $x = 0$' },
    { tex: '\\ln x', text: 'the natural logarithm, $\\log_e x$, defined for $x > 0$' },
    { tex: 'a', text: 'any other positive base ($a \\ne 1$), such as $2$ or $10$' },
    { tex: '\\ln a', text: 'the constant factor a base $a$ costs: $\\ln 2 \\approx 0.693$, $\\ln 10 \\approx 2.303$' },
  ],
  why: t`The rocket equation, radioactive decay, RC circuits, the barometric law and the Boltzmann factor are all exponentials or logarithms, and their derivatives are where the physics — a thrust, an activity, a current — comes from.`,
  visual: {
    type: 'graph',
    title: 'Slope in proportion to height',
    lead: t`The curve is $y = a^x$. Drag the gold point and change the base: the readouts compare the tangent’s slope with the height of the curve. For an exponential, their ratio does not depend on where you are — only on the base.`,
    tasks: [
      t`With $a = 2$, drag the point anywhere: slope ÷ height stays at $0.693 = \ln 2$.`,
      t`Find the base for which slope ÷ height is exactly $1$: it is $e \approx 2.72$, where the curve is its own slope.`,
      t`Set $a$ below $1$: the curve decays, the ratio is negative, and it still equals $\ln a$.`,
    ],
    params: {
      x: [-3, 3], y: [-0.6, 8], aspect: 'wide',
      sliders: [{ key: 'a', label: t`Base $a$`, min: 0.3, max: 4, step: 0.01, value: 2, explain: t`The base of the exponential $a^x$; $a = e \approx 2.718$ is the natural one.` }],
      curves: [{ fn: 'a^x', color: 'accent' }],
      tangent: { fn: 'a^x', at: 1 },
      readouts: [
        { label: t`height $a^x$`, expr: 'a^x0', digits: 4 },
        { label: 'slope of the tangent', expr: 'slope', digits: 4 },
        { label: 'slope ÷ height', expr: 'slope/a^x0', digits: 4 },
        { label: t`$\ln a$`, expr: 'ln(a)', digits: 4 },
      ],
    },
    caption: t`The slope is measured numerically from the curve. An exponential is the only kind of function whose slope is a fixed multiple of its height everywhere.`,
  },
  example: {
    prompt: t`A rocket’s speed gain after burning for $t$ seconds is $\Delta v(t) = v_e\ln\dfrac{m_0}{m_0 - \dot m t}$ (the rocket equation, with no gravity or drag), where $v_e = 3600$ m/s is the exhaust speed, $m_0 = 50\,000$ kg the starting mass and $\dot m = 250$ kg/s the propellant flow. Find its acceleration at $t = 100$ s.`,
    visual: curveFig({ fn: `${VE}*ln(${M0}/(${M0} - ${MDOT}*x))`, x: [-8, 175], y: [-300, 6200], xlabel: 't (s)', ylabel: 'Δv (m/s)', domain: [0, 165], at: 100, f: (x) => VE * Math.log(M0 / (M0 - MDOT * x)), df: (x) => VE * MDOT / (M0 - MDOT * x), span: 40, caption: t`The speed gained grows faster and faster as the rocket lightens. The tangent at $t = 100$ s has slope $36\ \text{m/s}^2$. No gravity, no drag.` }),
    steps: [
      { label: 'Split the logarithm', text: t`$\ln\dfrac{m_0}{m} = \ln m_0 - \ln m$, so $\Delta v = v_e\big(\ln m_0 - \ln(m_0 - \dot m t)\big)$. The first term is a constant.` },
      { label: 'Differentiate', text: t`$\dfrac{d}{dt}\ln(m_0 - \dot m t) = \dfrac{1}{m_0 - \dot m t}\cdot(-\dot m)$ — the chain rule, with inner derivative $-\dot m$.` },
      { label: 'Combine', text: t`$\dfrac{d\,\Delta v}{dt} = -v_e\cdot\dfrac{-\dot m}{m_0 - \dot m t} = \dfrac{v_e\dot m}{m(t)}$.` },
      { label: 'Substitute', text: t`At $t = 100$ s the mass is $25\,000$ kg: $\dfrac{3600\times 250}{25\,000} = 36\ \text{m/s}^2$.` },
      { label: 'Read the physics', text: t`$v_e\dot m$ is the thrust ($9.0\times10^5$ N, the $900$ kN of C1-3.6), so the result says acceleration $=$ thrust ÷ mass: Newton’s second law, recovered by differentiating a logarithm.` },
    ],
    answer: t`$\dfrac{d\,\Delta v}{dt} = \dfrac{v_e\dot m}{m_0 - \dot m t} = 36\ \text{m/s}^2$ at $t = 100$ s.`,
  },
  practice: [
    mcq({
      id: 'two-to-x', difficulty: 1,
      prompt: t`What is $\dfrac{d}{dx}2^{x}$?`,
      visual: curveFig({ fn: '2^x', x: [-3, 3.2], y: [-0.5, 8.5], at: 1, f: (x) => 2 ** x, df: (x) => 2 ** x * LN2, span: 1, caption: t`$y = 2^x$ and its tangent at $x = 1$, where the height is $2$ and the slope is a little under $1.4$.` }),
      choices: [t`$2^{x}\ln 2$`, t`$x\cdot 2^{x - 1}$`, t`$2^{x}$`, t`$\dfrac{2^{x}}{\ln 2}$`],
      answer: 0,
      why: {
        1: t`That is the power rule, which is for $x^n$ with a fixed exponent. Here the variable is *in* the exponent.`,
        2: t`Only base $e$ is its own derivative. At $x = 1$ the curve has height $2$ but the tangent’s slope is only about $1.39$.`,
        3: t`The factor $\ln 2 \approx 0.693$ multiplies, it does not divide: $2^x = e^{x\ln 2}$, and the chain rule brings out $\ln 2$.`,
      },
      hints: [t`Write $2^x = e^{x\ln 2}$ and use the chain rule.`],
      teach: t`$\frac{d}{dx}a^x = a^x\ln a$: the variable is in the exponent, so the power rule does not apply.`,
      explain: t`$\dfrac{d}{dx}e^{x\ln 2} = e^{x\ln 2}\cdot\ln 2 = 2^x\ln 2$. At $x = 1$: $2\ln 2 = 1.386$, the tangent in the picture.`,
    }),
    expr({
      id: 'ln-kx', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5, 10]);
        return {
          prompt: t`Find $\dfrac{d}{dx}\ln(${k}x)$ for $x > 0$.`,
          lhs: t`\frac{d}{dx}\ln(${k}x)`,
          answer: '1/x', answerTeX: t`\frac{1}{x}`,
          vars: { x: [0.3, 4] }, derivativeOf: `ln(${k}*x)`,
          errors: [{ answer: `${k}/x`, feedback: t`The chain rule gives $\dfrac{1}{${k}x}\cdot ${k}$ — the $${k}$ cancels.` }, { answer: `1/(${k}x)`, feedback: t`Multiply by the inner derivative, $${k}$.` }],
          hints: [t`Either use the chain rule, or first write $\ln(${k}x) = \ln ${k} + \ln x$.`],
          teach: t`$\ln(kx) = \ln k + \ln x$: a constant factor inside a logarithm only shifts the graph, so the slope is still $1/x$.`,
          explain: t`$\dfrac{1}{${k}x}\cdot ${k} = \dfrac1x$. In the picture the two curves are vertical shifts of each other by $\ln ${k} = ${nice(Math.log(k), 3)}$, so they have the same slope at every $x$.`,
          visual: { type: 'graph', params: { x: [-0.2, 5], y: [-2.4, 4.2], aspect: 'wide', curves: [{ fn: 'ln(x)', color: 'ink3', dash: true, width: 1.6, domain: [0.08, 5], label: 'ln x', labelAt: 4.2, labelDy: 16 }, { fn: `ln(${k}*x)`, color: 'accent', domain: [0.02, 5], label: `ln(${k}x)`, labelAt: 4.2 }] }, caption: t`$y = \ln(${k}x)$ (blue) and $y = \ln x$ (dashed): the same shape, shifted up.` },
        };
      },
    }),
    expr({
      id: 'rc-current', difficulty: 2,
      gen(r) {
        const Q0 = r.pick([50, 80, 100, 200]), tau = r.pick([2, 4, 5]);
        const I0 = Q0 / tau;
        return {
          prompt: t`A capacitor discharging through a resistor holds charge $Q(t) = ${Q0}\,e^{-t/${tau}}$ μC, with $t$ in ms. Find $\dfrac{dQ}{dt}$, in μC/ms (that is, mA).`,
          lhs: t`\frac{dQ}{dt}`,
          answer: `-${I0}*e^(-t/${tau})`, answerTeX: t`-${I0}\,e^{-t/${tau}}`,
          vars: { t: [0, 6] }, derivativeOf: `${Q0}*e^(-t/${tau})`,
          errors: [{ answer: `${Q0}*e^(-t/${tau})`, feedback: t`The inside, $-t/${tau}$, has derivative $-\tfrac{1}{${tau}}$: multiply by it.` }, { answer: `-${Q0 * tau}*e^(-t/${tau})`, feedback: t`The inner derivative is $-1/${tau}$, so divide by $${tau}$, do not multiply.` }],
          hints: [t`$\dfrac{d}{dt}e^{u} = e^{u}\dfrac{du}{dt}$ with $u = -t/${tau}$.`],
          teach: t`$\frac{d}{dt}e^{-t/\tau} = -\frac1\tau e^{-t/\tau}$: the rate of decay is the amount left divided by the time constant.`,
          explain: t`$\dfrac{dQ}{dt} = ${Q0}\cdot\left(-\tfrac{1}{${tau}}\right)e^{-t/${tau}} = -${I0}\,e^{-t/${tau}}$ mA. The current starts at $${I0}$ mA and decays with the same time constant as the charge.`,
          visual: curveFig({ fn: `${Q0}*e^(-x/${tau})`, x: [-0.4, 5 * tau], y: [-0.06 * Q0, 1.12 * Q0], xlabel: 't (ms)', ylabel: 'Q (μC)', domain: [0, 5 * tau], caption: t`The charge decays by a factor $e$ every $${tau}$ ms. An ideal resistor and capacitor are assumed.` }),
        };
      },
    }),
    num({
      id: 'barometric', difficulty: 2,
      gen(r) {
        const h = r.pick([5, 8, 10, 12, 15]), v = r.pick([0.3, 0.5, 0.8]);
        const p = 101.3 * Math.exp(-h / 8.5), ans = -(p / 8.5) * v;
        return {
          prompt: t`Model the air pressure as $p(h) = 101.3\,e^{-h/8.5}$ kPa, with altitude $h$ in km. A rocket passes $h = ${h}$ km climbing at $${v}$ km/s. How fast is the outside pressure changing, in kPa/s?`,
          answer: ans, units: 'kPa/s', tol: { rel: 0.005 },
          errors: [{ value: -(p / 8.5), feedback: t`That is $dp/dh$, per kilometre. Multiply by the climb rate, $${v}$ km/s.` }, { value: -p * v, feedback: t`The exponent is $-h/8.5$, so its derivative carries a factor $1/8.5$.` }],
          hints: [t`$\dfrac{dp}{dh} = -\dfrac{101.3}{8.5}e^{-h/8.5} = -\dfrac{p}{8.5}$ kPa/km.`, t`$\dfrac{dp}{dt} = \dfrac{dp}{dh}\cdot\dfrac{dh}{dt}$.`],
          teach: t`For an exponential profile the slope is the value divided by the scale height: $\frac{dp}{dh} = -\frac{p}{H}$.`,
          explain: t`$p(${h}) = ${nice(p, 4)}$ kPa, so $\dfrac{dp}{dh} = -\dfrac{${nice(p, 4)}}{8.5} = ${nice(-p / 8.5, 3)}$ kPa/km, and $\dfrac{dp}{dt} = ${nice(-p / 8.5, 3)}\times ${v} = ${nice(ans, 3)}$ kPa/s.`,
          visual: curveFig({ fn: '101.3*e^(-x/8.5)', x: [-1, 31], y: [-5, 112], xlabel: 'h (km)', ylabel: 'p (kPa)', domain: [0, 31], points: [{ x: h, y: p, color: 'gold', label: `${h} km` }], caption: t`An isothermal atmosphere with a scale height of $8.5$ km. The real atmosphere’s temperature changes with height, so its scale height varies between about $6$ and $8.5$ km.` }),
        };
      },
    }),
    expr({
      id: 'log-diff', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3]);
        return {
          prompt: t`Use logarithmic differentiation to find $\dfrac{d}{dx}\,x^{${k}x}$ for $x > 0$.`,
          lhs: t`\frac{d}{dx}x^{${k}x}`,
          answer: `x^(${k}x)*${k}*(ln(x) + 1)`, answerTeX: t`${k}\,x^{${k}x}(\ln x + 1)`,
          vars: { x: [0.4, 1.8] }, derivativeOf: `x^(${k}*x)`,
          errors: [{ answer: `${k}x*x^(${k}x - 1)`, feedback: t`The power rule needs a fixed exponent; here the exponent $${k}x$ varies. Take logarithms first.` }, { answer: `x^(${k}x)*ln(x)`, feedback: t`That treats the base as fixed. Both the base and the exponent vary.` }],
          hints: [t`Let $y = x^{${k}x}$ and take logarithms: $\ln y = ${k}x\ln x$.`, t`Differentiate both sides: $\dfrac{y'}{y} = ${k}\ln x + ${k}x\cdot\dfrac1x$.`, t`Multiply by $y$: $y' = x^{${k}x}\cdot ${k}(\ln x + 1)$.`],
          teach: t`When the variable is in both the base and the exponent, take $\ln$ of both sides first, then differentiate implicitly.`,
          explain: t`$\ln y = ${k}x\ln x \Rightarrow \dfrac{y'}{y} = ${k}(\ln x + 1) \Rightarrow y' = ${k}x^{${k}x}(\ln x + 1)$. It vanishes at $x = 1/e \approx 0.368$, the minimum in the picture.`,
          visual: curveFig({ fn: `x^(${k}*x)`, x: [-0.05, 1.6], y: fitY((x) => x ** (k * x), 0.02, 1.45), domain: [0.01, 1.6], caption: t`$y = x^{${k}x}$ for $x > 0$: it dips below $1$ before climbing steeply.` }),
        };
      },
    }),
    num({
      id: 'decibels', difficulty: 2,
      gen(r) {
        const pct = r.pick([1, 2, 5]);
        const ans = 10 / LN10 * pct / 100;
        return {
          prompt: t`A sound level is $L = 10\log_{10}(I/I_0)$ dB, where $I$ is the intensity and $I_0$ a fixed reference. Use $\dfrac{dL}{dI}$ to estimate how many decibels a ${pct}% rise in intensity adds.`,
          answer: ans, units: 'dB', tol: { rel: 0.01 },
          errors: [{ value: 10 * pct / 100, feedback: t`$\frac{d}{dI}\log_{10} I = \frac{1}{I\ln 10}$ — base 10 costs a factor $1/\ln 10$.` }],
          hints: [t`$\dfrac{dL}{dI} = \dfrac{10}{I\ln 10}$.`, t`A ${pct}% rise is $\Delta I = ${nice(pct / 100)}\,I$, so $\Delta L \approx \dfrac{10}{I\ln 10}\cdot ${nice(pct / 100)}\,I$.`],
          teach: t`$\frac{d}{dx}\log_a x = \frac{1}{x\ln a}$; on a logarithmic scale, equal *fractional* changes give equal steps.`,
          explain: t`$\Delta L \approx \dfrac{10}{\ln 10}\times ${nice(pct / 100)} = 4.343\times ${nice(pct / 100)} = ${nice(ans, 3)}$ dB. The $I$ cancelled: the answer is the same at any loudness.`,
          visual: curveFig({ fn: '10*log(x)', x: [-0.3, 10.5], y: [-3, 11.5], xlabel: 'I / I₀', ylabel: 'L (dB)', domain: [0.5, 10.5], at: 5, f: (x) => 10 * Math.log10(x), df: (x) => 10 / (x * LN10), span: 2.5, caption: t`$L = 10\log_{10}(I/I_0)$ over one factor of ten in intensity. The curve flattens as $I$ grows: each extra watt adds fewer decibels.` }),
        };
      },
    }),
    mcq({
      id: 'find-error-gauss', difficulty: 3, kind: 'error',
      prompt: t`A student writes

$$\frac{d}{dx}\,e^{-x^2/2} = e^{-x^2/2},$$

“because $e^{u}$ is its own derivative.” What is wrong?`,
      visual: curveFig({ fn: 'e^(-x^2/2)', x: [-3.2, 3.2], y: [-0.25, 1.25], at: 1, f: (x) => Math.exp(-x * x / 2), df: (x) => -x * Math.exp(-x * x / 2), span: 0.7, caption: t`The bell curve $e^{-x^2/2}$ and its tangent at $x = 1$, where the curve is falling. The student’s formula gives a positive slope there.` }),
      choices: [
        t`The chain rule’s inner factor is missing: the derivative is $-x\,e^{-x^2/2}$`,
        t`The exponent should be differentiated as a power: $-\tfrac{x^2}{2}\,e^{-x^2/2 - 1}$`,
        t`Nothing — $e^u$ is its own derivative for any $u$`,
        t`The derivative is $\dfrac{1}{e^{-x^2/2}}$`,
      ],
      answer: 0,
      why: {
        1: t`The power rule moves a fixed exponent down; here $e$ is fixed and the exponent varies.`,
        2: t`$\frac{d}{du}e^u = e^u$, but this is a derivative with respect to $x$. The student’s formula is positive everywhere, yet the curve falls for $x > 0$.`,
        3: t`That is the reciprocal, not a derivative.`,
      },
      hints: [t`Which way does the curve slope at $x = 1$? Which sign does the student’s formula give?`, t`$\dfrac{d}{dx}e^{u} = e^{u}\dfrac{du}{dx}$ with $u = -x^2/2$.`],
      teach: t`$e^{u(x)}$ differentiates to $e^{u}u'(x)$ — its own value times the derivative of the exponent.`,
      explain: t`$u = -x^2/2$ gives $u' = -x$, so the derivative is $-x\,e^{-x^2/2}$: positive left of the peak, zero at it, negative to the right — the bell curve’s shape.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-x2lnx', difficulty: 2,
      prompt: t`Differentiate $f(x) = x^2\ln x$.`,
      lhs: t`f'(x)`,
      answer: '2x ln(x) + x', answerTeX: t`2x\ln x + x`,
      vars: { x: [0.3, 3] }, derivativeOf: 'x^2*ln(x)',
      errors: [{ answer: '2', feedback: t`You multiplied the derivatives, $2x\cdot\frac1x$. Use the product rule.` }, { answer: '2x ln(x)', feedback: t`The second term of the product rule is missing: $x^2\cdot\frac1x = x$.` }],
      hints: [t`Product rule with $u = x^2$, $v = \ln x$.`],
      teach: t`$\ln x$ enters the product rule like any other factor, with derivative $1/x$.`,
      explain: t`$f'(x) = 2x\ln x + x^2\cdot\dfrac1x = 2x\ln x + x = x(2\ln x + 1)$, which is zero at $x = e^{-1/2} \approx 0.61$ — the dip in the picture.`,
      visual: curveFig({ fn: 'x^2*ln(x)', x: [-0.1, 2.2], y: [-0.4, 3.2], domain: [0.01, 2.2], caption: t`$y = x^2\ln x$ for $x > 0$.` }),
    }),
    num({
      id: 'cp-rtg', difficulty: 3, transfer: true,
      gen(r) {
        const yrs = r.pick([0, 10, 20, 30, 40]);
        const k = LN2 / 87.7, P = 470 * Math.exp(-k * yrs), ans = -k * P;
        return {
          prompt: t`Voyager’s radioisotope generators delivered about $470$ W at launch. If their output simply followed the decay of plutonium-238 (half-life $87.7$ years), it would be $P(t) = 470\,e^{-t\ln 2/87.7}$ W, $t$ in years. At what rate would the power be changing $${yrs}$ years after launch, in W/yr?`,
          answer: ans, units: 'W/yr', tol: { rel: 0.01 },
          errors: [{ value: -470 * k, feedback: t`That is the rate at launch. Evaluate the derivative at $t = ${yrs}$ years, where less plutonium is left.` }].filter(() => yrs !== 0),
          hints: [t`$\dfrac{d}{dt}e^{-kt} = -k\,e^{-kt}$ with $k = \dfrac{\ln 2}{87.7}\ \text{yr}^{-1}$.`, t`So $\dfrac{dP}{dt} = -k\,P(t)$: find $P(${yrs})$ first.`],
          teach: t`An exponential decay loses power at a rate equal to $k$ times the power still there.`,
          explain: t`$k = 0.693/87.7 = ${nice(k, 3)}\ \text{yr}^{-1}$; $P(${yrs}) = ${nice(P, 4)}$ W; $\dfrac{dP}{dt} = -${nice(k, 3)}\times ${nice(P, 4)} = ${nice(ans, 3)}$ W/yr.`,
          visual: curveFig({ fn: `470*e^(-x*${LN2}/87.7)`, x: [-2, 52], y: [0, 520], xlabel: 't (years)', ylabel: 'P (W)', domain: [0, 52], points: [{ x: yrs, y: P, color: 'gold' }], caption: t`Decay alone. The real generators lost about $4$ W a year, faster than this, because their thermocouples also degrade.` }),
        };
      },
    }),
    mcq({
      id: 'cp-ln-abs', difficulty: 2,
      prompt: t`For $x < 0$, what is $\dfrac{d}{dx}\ln|x|$?`,
      visual: curveFig({ fn: 'ln(abs(x))', x: [-4, 4], y: [-2.6, 1.8], at: -2, f: (x) => Math.log(Math.abs(x)), df: (x) => 1 / x, span: 0.9, caption: t`$y = \ln|x|$ has a branch on each side of $0$. At $x = -2$ the left branch is falling.` }),
      choices: [t`$\dfrac{1}{x}$`, t`$-\dfrac{1}{x}$`, t`$\dfrac{1}{|x|}$`, 'It is undefined, because ln is only defined for positive numbers'],
      answer: 0,
      why: {
        1: t`For $x < 0$, $\ln|x| = \ln(-x)$, and the chain rule gives $\frac{1}{-x}\cdot(-1) = \frac1x$. The two minus signs cancel.`,
        2: t`$1/|x|$ is positive, but the left branch is falling. The slope there is negative.`,
        3: t`$|x|$ is positive, so $\ln|x|$ is defined for every $x \ne 0$.`,
      },
      hints: [t`For $x < 0$, $|x| = -x$.`],
      teach: t`$\frac{d}{dx}\ln|x| = \frac1x$ on both branches — which is why $\int\frac{dx}{x} = \ln|x| + C$.`,
      explain: t`$\dfrac{d}{dx}\ln(-x) = \dfrac{-1}{-x} = \dfrac{1}{x}$. At $x = -2$ the slope is $-\tfrac12$, the tangent in the picture.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §3.9 Derivatives of exponential and logarithmic functions', url: 'https://openstax.org/books/calculus-volume-1/pages/3-9-derivatives-of-exponential-and-logarithmic-functions' }],
});
