// Exponent rules and roots — with Kepler's third law as the running example.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig, tex, frac } from '../../src/core/format.js';
import { N, logLadder, thou } from './_m0kit.js';

const t = String.raw;

const GM = 3.986004418e14;                    // Earth's gravitational parameter, m³/s² (IERS)
const orbitA = (T) => Math.cbrt(GM * T * T / (4 * Math.PI ** 2));   // semi-major axis (m) from period (s)
// period in hours against orbit radius in thousands of km: T = k a^{3/2}
const KT = 2 * Math.PI * (1e6) ** 1.5 / Math.sqrt(GM) / 3600;
const T_GEO = 86164.1, GMT2 = GM * T_GEO ** 2, A3 = GMT2 / (4 * Math.PI ** 2), A_GEO = orbitA(T_GEO);

const keplerFig = (extra, caption) => ({
  type: 'graph',
  params: { x: [0, 48], y: [0, 30], aspect: 'wide', xlabel: 'orbit radius a (thousand km)', ylabel: 'period T (h)',
    curves: [{ fn: `${N(KT)}*x^1.5`, color: 'accent', domain: [0, 48], label: 'T² ∝ a³', labelAt: 30, labelDy: -14, labelDx: -40 }],
    vlines: [{ x: 6.371, label: 'Earth’s surface', color: 'ink3' }], ...extra },
  caption,
});

// y = x^p on x > 0, with tick numbers optionally hidden
const powerFig = (fn, x, y, caption, extra = {}) => ({
  type: 'graph',
  params: { x, y, aspect: 'wide', curves: [{ fn, color: 'accent', domain: [Math.max(x[0], 0.001), x[1]] }], ...extra },
  caption,
});

export default lesson({
  id: 'm0.M0-1.3',
  title: 'Exponent rules and roots',
  minutes: 8, difficulty: 2,
  intro: t`An exponent counts repeated multiplication, and every rule follows from counting factors: $a^m a^n$ has $m + n$ factors of $a$, and $(a^m)^n$ has $mn$. Negative exponents divide, and fractional exponents are roots:

$$a^{m/n} = \sqrt[n]{a^m} = \big(\sqrt[n]{a}\big)^m, \qquad a^{-n} = \frac{1}{a^n}$$

Physics is full of them: Kepler’s third law $T \propto a^{3/2}$, the inverse-square law $r^{-2}$, the fourth power in a star’s luminosity.`,
  symbols: [
    { tex: 'a', text: 'the **base**, a positive real number here (fractional powers of negative numbers need care)' },
    { tex: 'm,\\ n', text: 'exponents: whole numbers here, though the rules hold for any real exponents when $a > 0$' },
    { tex: '\\sqrt[n]{a}', text: 'the $n$-th root: the positive number whose $n$-th power is $a$' },
    { tex: 'a^{-n}', text: 'one over $a^n$: a negative exponent divides rather than multiplies' },
  ],
  why: t`The rules $a^m a^n = a^{m+n}$, $(a^m)^n = a^{mn}$ and $(ab)^n = a^n b^n$ are what turn a scaling law into a one-line answer: double an orbit’s radius and its period grows by $2^{3/2} \approx 2.83$.`,
  visual: {
    type: 'graph',
    title: 'The family of power functions',
    lead: t`The curve is $y = x^p$ for $x > 0$. Slide the exponent $p$ through negative, fractional and whole values. The readout shows $2^p$, the value at $x = 2$.`,
    tasks: [
      t`Set $p = 0.5$: the curve is $\sqrt{x}$, and the readout shows $\sqrt2 \approx 1.414$.`,
      t`Set $p = -1$, then $p = 1$: the readouts $0.5$ and $2$ are reciprocals — that is all a negative exponent does.`,
      t`Set $p = 0$: a flat line at $1$. Every curve in the family passes through $(1, 1)$, because $1^p = 1$.`,
    ],
    params: {
      x: [0, 3.2], y: [0, 4.2],
      sliders: [{ key: 'p', label: t`Exponent $p$`, min: -2, max: 3, step: 0.25, value: 1.5, explain: t`The power on $x$: whole values multiply, fractions take roots, negative values divide.` }],
      curves: [{ fn: 'x^p', color: 'accent', domain: [0.01, 3.2] }, { fn: 'x', color: 'ink4', dash: true, domain: [0, 3.2] }],
      points: [{ x: 1, y: 1, label: '(1, 1)', color: 'gold' }, { x: 2, y: '2^p', color: 'violet' }],
      vlines: [{ x: 2, color: 'ink4' }],
      readouts: [{ label: t`$2^p$`, expr: '2^p', digits: 4 }],
    },
    caption: t`The dashed line is $y = x$ ($p = 1$) for reference. For $x > 1$, a bigger exponent means a bigger value; for $0 < x < 1$ it is the other way round.`,
  },
  example: {
    prompt: t`Kepler’s third law for an orbit around Earth reads $T^2 = \dfrac{4\pi^2}{GM}\,a^3$, with $GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$. A geostationary satellite has period $T = ${thou(T_GEO, 1)}$ s, one sidereal day. Find its orbit radius $a$.`,
    visual: keplerFig({ points: [{ x: N(A_GEO / 1e6), y: N(T_GEO / 3600), label: 'geostationary', color: 'gold' }] }, t`Period against orbit radius for circular orbits of Earth. The curve is $T \propto a^{3/2}$; Earth’s oblateness and the Moon’s pull are neglected.`),
    steps: [
      { label: 'Isolate the cube', text: t`Multiply both sides by $GM/(4\pi^2)$: $a^3 = \dfrac{GM\,T^2}{4\pi^2}$.` },
      { label: 'Undo the cube', text: t`Raise both sides to the power $\tfrac13$, since $(a^3)^{1/3} = a^{3 \cdot 1/3} = a$: $\;a = \left(\dfrac{GM\,T^2}{4\pi^2}\right)^{1/3}$.` },
      { label: 'Numbers', text: t`$GM\,T^2 = ${tex(GMT2, 4)}\ \text{m}^3$, and dividing by $4\pi^2 = 39.48$ gives $${tex(A3, 4)}\ \text{m}^3$.` },
      { label: 'Cube root by hand', text: t`Make the power of ten divisible by 3: $${tex(A3, 4)} = ${nice(sig(A3 / 1e21, 4))} \times 10^{21}$, so the cube root is $\sqrt[3]{${nice(sig(A3 / 1e21, 4))}} \times 10^{7} = ${nice(sig(A_GEO / 1e7, 5))} \times 10^{7}$ m.` },
      { label: 'Sense check', text: t`$a \approx 42\,160$ km is about $6.6$ Earth radii — the familiar geostationary altitude of $35\,790$ km plus Earth’s radius. Units: $(\text{m}^3\text{s}^{-2} \cdot \text{s}^2)^{1/3} = \text{m}$ ✓.` },
    ],
    answer: t`$a = \left(GM\,T^2/4\pi^2\right)^{1/3} \approx ${thou(Math.round(A_GEO / 1e3))}$ km from Earth’s centre.`,
  },
  practice: [
    expr({
      id: 'simplify-power', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), b = r.int(2, 3), c = r.int(2, 3), d = r.int(1, 4);
        const n = a + b * c - d;
        const errors = [];
        if (a + b + c - d !== n) errors.push({ answer: `x^(${a + b + c - d})`, feedback: t`A power of a power multiplies: $(x^{${b}})^{${c}} = x^{${b * c}}$, not $x^{${b + c}}$.` });
        if (a * b * c - d !== n && a * b * c - d !== a + b + c - d) errors.push({ answer: `x^(${a * b * c - d})`, feedback: t`A product of powers adds exponents: $x^{${a}} \cdot x^{${b * c}} = x^{${a + b * c}}$, not $x^{${a * b * c}}$.` });
        return {
          prompt: t`Simplify $\dfrac{x^{${a}}\,(x^{${b}})^{${c}}}{x^{${d}}}$ to a single power of $x$.`,
          answer: `x^(${n})`, answerTeX: t`x^{${n}}`,
          vars: { x: [0.5, 1.8] },
          errors,
          hints: [t`$(x^{${b}})^{${c}} = x^{${b} \cdot ${c}}$.`, t`Multiplying adds exponents and dividing subtracts them: $${a} + ${b * c} - ${d}$.`],
          teach: t`Multiply powers by adding exponents, raise a power by multiplying them, divide by subtracting.`,
          explain: t`$x^{${a}} \cdot x^{${b * c}} / x^{${d}} = x^{${a} + ${b * c} - ${d}} = x^{${n}}$.`,
          visual: powerFig(`x^${a}*(x^${b})^${c}/x^${d}`, [0, 1.6], [0, 4], t`The expression as written, for $x > 0$. Your single power must draw exactly this curve.`),
        };
      },
    }),
    num({
      id: 'frac-power', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3]), b = n === 2 ? r.pick([3, 4, 5, 6, 7]) : r.pick([2, 3, 4]);
        const m = r.pick([2, 3, -1, -2].filter((v) => v !== n)), base = b ** n, ans = b ** m;
        const errors = [{ value: base * m / n, feedback: t`An exponent is not a multiplier: $${base}^{${m}/${n}}$ means take the ${n === 2 ? 'square' : 'cube'} root, then raise to the power $${m}$.` }];
        if (m < 0) errors.push({ value: -(b ** -m), feedback: t`A negative exponent means a reciprocal, not a negative number: $a^{-k} = 1/a^k$.` });
        return {
          prompt: t`Evaluate $${base}^{${m}/${n}}$ without a calculator.`,
          answer: ans, tol: { rel: 0.002 },
          errors,
          hints: [t`$${base}^{${m}/${n}} = \left(\sqrt[${n}]{${base}}\right)^{${m}}$ — take the root first, while the number is small.`, t`$\sqrt[${n}]{${base}} = ${b}$.`],
          teach: t`In $a^{m/n}$ the denominator is a root and the numerator is a power; doing the root first keeps the numbers small.`,
          explain: t`$\sqrt[${n}]{${base}} = ${b}$, and $${b}^{${m}} = ${frac(ans)}$.`,
          visual: powerFig(`x^(${m}/${n})`, [0, base * 1.25], m > 0 ? [0, ans * 1.6] : [0, 1.4], t`$y = x^{${m}/${n}}$ with $x = ${base}$ marked. The height there is the answer; the scale is hidden so you work it out exactly.`, { yticks: 0, vlines: [{ x: base, label: `x = ${base}`, color: 'gold' }] }),
        };
      },
    }),
    mcq({
      id: 'pythag-speed', difficulty: 1,
      gen(r) {
        const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]);
        const s = r.pick([1, 0.1]);
        const A = nice(a * s), B = nice(b * s), C = nice(c * s);
        const unit = s === 1 ? t`\text{m/s}` : t`\text{km/s}`;
        return {
          prompt: t`A probe’s velocity has components $v_x = ${A}\ ${unit}$ and $v_y = ${B}\ ${unit}$ at right angles. Its speed is $v = \sqrt{v_x^2 + v_y^2}$. What is it?`,
          choices: [t`$${C}\ ${unit}$`, t`$${nice((a + b) * s)}\ ${unit}$`, t`$\sqrt{${nice((a + b) * s)}}\ ${unit}$`, t`$${nice((a * a + b * b) * s * s)}\ ${unit}$`],
          answer: 0,
          why: {
            1: t`That is $v_x + v_y$. A square root does not split over a sum: $\sqrt{a^2 + b^2} \ne a + b$. The two sides of a triangle are always longer than the third.`,
            2: t`You added the components before squaring. Square each one first, then add, then take the root.`,
            3: t`That is $v^2$. You still need the square root.`,
          },
          hints: [t`Square each component, add, then take the square root.`],
          teach: t`$\sqrt{a^2 + b^2}$ does not simplify to $a + b$; the hypotenuse is shorter than the two legs together.`,
          explain: t`$\sqrt{${A}^2 + ${B}^2} = \sqrt{${nice((a * a + b * b) * s * s)}} = ${C}\ ${unit}$, less than $${A} + ${B}$, as the triangle demands.`,
          visual: { type: 'graph', params: { x: [-0.15 * b, 1.6 * b], y: [-0.08 * b, 1.08 * b], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false,
            arrows: [{ from: [0, 0], to: [a, 0], color: 'accent', label: 'vₓ', labelDx: 6, labelDy: 14 }, { from: [a, 0], to: [a, b], color: 'gold', label: 'vᵧ', labelDx: 8, labelDy: 10 }, { from: [0, 0], to: [a, b], color: 'violet', dash: true, label: 'v = ?', labelAlign: 'right', labelDx: -40, labelDy: 40 }] },
            caption: t`The components tip to tail, to scale, and the velocity they add up to (dashed).` },
        };
      },
    }),
    mcq({
      id: 'sqrt-square', difficulty: 2,
      prompt: t`Which expression equals $\sqrt{x^2}$ for **every** real number $x$?`,
      choices: [t`$|x|$`, t`$x$`, t`$\pm x$`, t`$x^2$`],
      answer: 0,
      why: {
        1: t`Try $x = -3$: $\sqrt{(-3)^2} = \sqrt9 = 3$, not $-3$. The square root symbol always means the non-negative root.`,
        2: t`$\sqrt{\ }$ returns one number, the non-negative one. The $\pm$ appears when you *solve* $y^2 = x^2$, which has two solutions.`,
        3: t`Squaring and square-rooting undo each other (up to sign); they do not leave the square behind.`,
      },
      hints: [t`Test a negative value, such as $x = -3$.`],
      teach: t`$\sqrt{x^2} = |x|$: squaring forgets the sign and the root cannot bring it back.`,
      explain: t`$\sqrt{x^2}$ is the non-negative number whose square is $x^2$: that is $x$ when $x \ge 0$ and $-x$ when $x < 0$ — in one symbol, $|x|$.`,
    }),
    num({
      id: 'kepler-scale', difficulty: 2,
      gen(r) {
        const [k, kt] = r.pick([[4, '4'], [9, '9'], [16, '16'], [0.25, t`\tfrac14`], [2.25, '2.25']]);
        const ans = k ** 1.5;
        const errors = [];
        for (const [v, f] of [[k ** 3, t`That is $k^3$: you cubed the radius factor but did not take the square root that the law $T^2 \propto a^3$ requires.`], [k ** (2 / 3), t`That is $k^{2/3}$, the exponent upside down. $T \propto a^{3/2}$: square root, then cube.`], [k, t`The period does not scale in proportion to the radius; it goes as $a^{3/2}$.`]]) {
          if (Math.abs(v - ans) > 0.01 * ans) errors.push({ value: v, feedback: f });
        }
        return {
          prompt: t`For orbits around the same body, Kepler’s third law gives $T \propto a^{3/2}$. One orbit’s radius is $${kt}$ times another’s. How many times longer is its period?`,
          answer: ans, tol: { rel: 0.002 },
          errors,
          hints: [t`The ratio of periods is $(\text{ratio of radii})^{3/2}$.`, t`$k^{3/2} = (\sqrt{k})^3$: take the square root of $${kt}$ first.`],
          teach: t`A power law $y \propto x^p$ turns a factor $k$ in $x$ into a factor $k^p$ in $y$, whatever the constant of proportionality.`,
          explain: t`$\left(${kt}\right)^{3/2} = \left(\sqrt{${kt}}\right)^3 = ${nice(Math.sqrt(k))}^3 = ${nice(ans)}$.`,
          visual: { type: 'graph', params: { x: [0, Math.max(1, k) * 1.25], y: [0, Math.max(1, ans) * 1.25], aspect: 'wide', xlabel: 'radius (in units of the first orbit)', ylabel: 'period', yticks: 0,
            curves: [{ fn: 'x^1.5', color: 'accent' }], vlines: [{ x: 1, label: 'first', color: 'ink3' }, { x: k, label: 'second', color: 'gold' }] },
            caption: t`$T \propto a^{3/2}$ with both radii marked. The period scale is hidden on purpose.` },
        };
      },
    }),
    mcq({
      id: 'product-error', difficulty: 2, kind: 'error',
      prompt: t`A student estimates a number of atoms as $10^{3} \times 10^{4} = 10^{12}$. What is the error?`,
      visual: logLadder({ items: [{ v: 1e3, label: '10³' }, { v: 1e4, label: '10⁴' }, { v: 1e12, label: '10¹² (claimed)', color: 'bad' }], x: [-0.5, 13.5], xlabel: 'power of ten', alternate: false, caption: t`Each factor placed by its power of ten. On this scale, multiplying numbers adds their distances from $10^0 = 1$.` }),
      choices: [t`Same base: add the exponents, so the product is $10^{7}$`, t`There is none: multiplying powers multiplies the exponents`, t`The bases multiply too, so it is $100^{7}$`, t`Divide the exponents: it is $10^{3/4}$`],
      answer: 0,
      why: {
        1: t`$(10^3)^4$ would be $10^{12}$: multiplying exponents is the rule for a power *of* a power, not a product of powers.`,
        2: t`$10^3 \times 10^4$ is three tens times four more tens, all multiplied: $10^{7}$. Multiplying the bases double-counts — $100^7 = 10^{14}$.`,
        3: t`Dividing exponents has no rule behind it here; $10^{3/4} \approx 5.6$ is smaller than either factor.`,
      },
      hints: [t`Write the factors out: $10^3 = 10 \cdot 10 \cdot 10$.`, t`How many tens are multiplied altogether?`],
      teach: t`$a^m a^n = a^{m+n}$; $(a^m)^n = a^{mn}$ — sums for products, products for powers.`,
      explain: t`$10^3 \times 10^4$ is seven factors of ten: $10^{7}$. The student’s answer is too big by a factor of $10^5$ — a hundred thousand.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-root-product', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[2, 3], [2, 5], [3, 4], [2, 4], [3, 5]]);
        return {
          prompt: t`Write $\sqrt[${p}]{x}\;\sqrt[${q}]{x}$ as a single power of $x$.`,
          answer: `x^(${p + q}/${p * q})`, answerTeX: t`x^{${p + q}/${p * q}}`,
          vars: { x: [0.3, 3] },
          errors: [{ answer: `x^(1/${p * q})`, feedback: t`You multiplied the exponents $\tfrac1{${p}}$ and $\tfrac1{${q}}$. A product of powers adds them.` }, { answer: `x^(1/${p + q})`, feedback: t`$\tfrac1{${p}} + \tfrac1{${q}} \ne \tfrac{1}{${p + q}}$: use a common denominator.` }],
          hints: [t`$\sqrt[${p}]{x} = x^{1/${p}}$.`, t`Add $\tfrac1{${p}} + \tfrac1{${q}}$ over the denominator $${p * q}$.`],
          teach: t`Roots are fractional exponents, and fractional exponents follow the same rules as whole ones.`,
          explain: t`$x^{1/${p}} \cdot x^{1/${q}} = x^{1/${p} + 1/${q}} = x^{${p + q}/${p * q}}$.`,
          visual: powerFig(`x^(1/${p})*x^(1/${q})`, [0, 3.2], [0, 3.2], t`$y = \sqrt[${p}]{x}\,\sqrt[${q}]{x}$ for $x \ge 0$.`),
        };
      },
    }),
    num({
      id: 'cp-luminosity', difficulty: 2,
      gen(r) {
        const kR = r.pick([2, 3, 10, 0.5]), kT = r.pick([2, 0.5, 1.5]);
        const ans = kR ** 2 * kT ** 4;
        const errors = [];
        for (const [v, f] of [[kR * kT, t`You multiplied the factors without their powers. $L \propto R^2T^4$: square one, raise the other to the fourth.`], [kR ** 2 * kT ** 2, t`Temperature enters to the fourth power, not the second.`]]) if (Math.abs(v - ans) > 0.01 * ans) errors.push({ value: v, feedback: f });
        return {
          prompt: t`A star’s luminosity is $L = 4\pi R^2 \sigma T^4$. Star 2 has $${kR}$ times the radius and $${kT}$ times the surface temperature of star 1. What is $L_2 / L_1$?`,
          answer: ans, tol: { rel: 0.002 },
          errors,
          hints: [t`$4\pi\sigma$ cancels in the ratio: $L_2/L_1 = (R_2/R_1)^2 (T_2/T_1)^4$.`],
          teach: t`$(ab)^n = a^n b^n$: in a ratio, every factor scales by its own power and the constants cancel.`,
          explain: t`$${kR}^2 \times ${kT}^4 = ${nice(kR ** 2)} \times ${nice(kT ** 4)} = ${nice(ans)}$.`,
          visual: { type: 'graph', params: { x: [0, 2.3], y: [0, 6], aspect: 'wide', xlabel: 'ratio of star 2 to star 1', ylabel: 'factor in L', curves: [{ fn: 'x^4', color: 'gold', label: 'temperature: (T₂/T₁)⁴', labelAt: 1.45, labelDx: 8 }, { fn: 'x^2', color: 'accent', dash: true, label: 'radius: (R₂/R₁)²', labelAt: 2.05, labelDx: -120, labelDy: -4 }] },
            caption: t`The factor each ratio contributes to the luminosity: the fourth power amplifies a change far more than the square. Real stars are not perfect black bodies; $L \propto R^2T^4$ is the black-body idealization.` },
        };
      },
    }),
    num({
      id: 'cp-navsat', difficulty: 3, transfer: true,
      gen(r) {
        const [name, T, Tt] = r.pick([['GPS', 43082, t`11\ \text{h}\ 58\ \text{min} = 43\,082\ \text{s}`], ['Galileo', 50682, t`14\ \text{h}\ 4\ \text{min} = 50\,682\ \text{s}`], ['GLONASS', 40544, t`11\ \text{h}\ 16\ \text{min} = 40\,544\ \text{s}`]]);
        const a = orbitA(T);
        return {
          prompt: t`A ${name} satellite orbits Earth once every $${Tt}$. Using $a = \left(\dfrac{GM\,T^2}{4\pi^2}\right)^{1/3}$ with $GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$, find its orbit radius in km.`,
          answer: a / 1e3, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(GM * T * T / (4 * Math.PI ** 2)) / 1e3, feedback: t`You took a square root. $a^3$ is on the left, so the inverse is a cube root: the power $\tfrac13$.` }],
          hints: [t`Compute $GM\,T^2/(4\pi^2)$ first; it comes out in m³.`, t`Then take the cube root, e.g. by rewriting the power of ten as a multiple of 3.`, t`Divide by 1000 to convert m to km.`],
          teach: t`To undo a power $n$, raise to the power $1/n$; the units follow the same rule.`,
          explain: t`$GM\,T^2/4\pi^2 = ${tex(a ** 3, 4)}\ \text{m}^3$, whose cube root is $${tex(a, 4)}$ m $\approx ${thou(Math.round(a / 1e3))}$ km — about $${nice(sig(a / 6.371e6, 2))}$ Earth radii.`,
          visual: keplerFig({ vlines: [{ x: 6.371, label: 'Earth’s surface', color: 'ink3' }], hlines: [{ y: N(T / 3600), label: `T for ${name}`, color: 'gold' }] }, t`The ${name} period as a horizontal line on $T \propto a^{3/2}$. Circular orbit assumed; the real orbits are nearly circular.`),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §1.2 Exponents and Scientific Notation', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-2-exponents-and-scientific-notation' },
    { label: 'OpenStax Algebra and Trigonometry 2e, §1.3 Radicals and Rational Exponents', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-3-radicals-and-rational-exponents' },
    { label: 'OpenStax University Physics Vol. 1, §13.5 Kepler’s Laws of Planetary Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/13-5-keplers-laws-of-planetary-motion' },
  ],
});
