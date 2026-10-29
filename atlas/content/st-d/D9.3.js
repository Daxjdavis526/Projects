// Fourier-type integrals ∫ f(x)e^{ikx} dx. On the upper arc |e^{ikz}| =
// e^{−kR sin θ} ≤ 1 for k > 0, and Jordan's lemma sharpens ML: the arc's
// integral is at most (π/k)·max|f| on it, so f → 0 at all — even like 1/R —
// is enough. Close above for k > 0, below (clockwise, −2πi) for k < 0; for a
// cosine, take the real part of the e^{ikx} integral, never close cos(kz)
// itself (it grows in both half-planes). Indented contours: a simple pole on
// the axis contributes half its residue to the principal value, so
// ∫₀^∞ sin x/x dx = π/2. Transfer: the Dryden gust model's autocorrelation
// from its Lorentzian spectrum.
import { lesson, mcq, num } from '../../src/core/content.js';
import { num as nm, apart } from './_cx.js';
import { contour } from './_cx2.js';
import { D, arc, indented, pole, iPlain, plane, realPic, r4 } from './_cx3.js';

const t = String.raw;
const PI = Math.PI;
const E = Math.exp;
const wave = (fn, x, ymax, caption, extra = {}) => realPic({ fn, x, y: [-ymax, ymax], caption, extra: { ...extra } });

export default lesson({
  id: 'st-d.D9.3',
  title: 'Jordan’s lemma and Fourier-type integrals',
  minutes: 15, difficulty: 3,
  intro: t`Integrals like $\int_{-\infty}^{\infty} \frac{\cos kx}{x^2 + a^2}\,dx$ — a function times a wave — are everywhere in physics: they are Fourier transforms. Write the wave as $e^{ikx}$ and close in the half-plane where it **dies**. With $z = x + iy$, $|e^{ikz}| = e^{-ky}$: for $k > 0$ that is tiny in the upper half-plane. **Jordan’s lemma** then says the arc costs almost nothing:

$$\left|\int_{C_R} f(z)\,e^{ikz}\,dz\right| \le \frac{\pi}{k}\,\max_{C_R}|f|,\qquad k > 0$$

So $f$ need only tend to zero on the arc — even as slowly as $1/R$ — and $\int_{-\infty}^{\infty} f(x)e^{ikx}\,dx = 2\pi i\sum_{\text{upper}}\operatorname{Res}\big[f(z)e^{ikz}\big]$. For $k < 0$ close **below**, walking clockwise: $-2\pi i$ times the lower residues. A cosine or sine is the real or imaginary part of the $e^{ikx}$ answer.`,
  symbols: [
    { tex: 'k', text: t`the wavenumber or angular frequency of the oscillating factor; its sign picks the half-plane` },
    { tex: 'f', text: t`a function analytic in the closed upper half-plane except for finitely many poles, with $\max_{C_R}|f| \to 0$ as $R \to \infty$` },
    { tex: 'C_R', text: t`the semicircle $|z| = R$ in the half-plane where $e^{ikz}$ decays` },
    { tex: t`e^{ikz}`, text: t`$= e^{ikx}e^{-ky}$: a wave along $x$ that decays like $e^{-ky}$ away from the real axis` },
  ],
  why: t`Fourier integrals carry signals, spectra and wave packets; closing them in the right half-plane is how a spectrum becomes a correlation, a transfer function an impulse response — and, in the next module, how causality is written into physics.`,
  visual: {
    type: 'cx2-contour',
    title: 'Why the arc dies',
    lead: t`Just the arc $C_R$, with the arrows of $f(z)e^{ikz}\,dz$ and their chain. The readout gives the arc’s integral, its length $L$, the largest size $M$ of the integrand on it, and the plain ML bound. Slide $R$ and $k$, and compare the two integrands.`,
    tasks: [
      t`With $e^{ikz}/(z^2 + 1)$ and $k = 1$, raise $R$: the arc’s integral and its ML bound both fall toward $0$ — the integrand already falls like $1/R^2$.`,
      t`Switch to $z\,e^{ikz}/(z^2 + 1)$: $|f|$ falls only like $1/R$ and the ML bound stalls near $\pi$, yet the integral still sinks to $0$. That is Jordan’s lemma: $e^{-kR\sin\theta}$ is tiny everywhere on the arc except near its two ends.`,
      t`Drag $k$ below $0$: now $e^{ikz}$ grows in the upper half-plane and the arc’s integral explodes as $R$ grows. For $k < 0$, close below.`,
    ],
    params: {
      fns: [
        { f: 'exp(i*k*z)/(z^2 + 1)', label: t`$\frac{e^{ikz}}{z^2 + 1}$`, marks: [pole(0, 1, 'i'), pole(0, -1, '−i')] },
        { f: 'z*exp(i*k*z)/(z^2 + 1)', label: t`$\frac{z\,e^{ikz}}{z^2 + 1}$`, marks: [pole(0, 1, 'i'), pole(0, -1, '−i')] },
      ],
      sliders: [
        { key: 'R', label: 'arc radius $R$', min: 1.5, max: 8, step: 0.1, value: 3, explain: t`The radius of the upper semicircle $C_R$, walked from $R$ to $-R$.` },
        { key: 'k', label: 'wavenumber $k$', min: -0.6, max: 3, step: 0.05, value: 1, explain: t`The $k$ in $e^{ikz}$. Positive: the wave decays upward. Negative: it grows upward.` },
      ],
      contour: { kind: 'arc', c: [0, 0], r: 'R', from: 0, to: PI }, x: [-8.6, 8.6], y: [-1.6, 8.8], n: 40, readout: ['I', 'L', 'M', 'ML'],
    },
    caption: t`The arrows are drawn longer than true, all by one factor; the chain is to scale and its window rescales. $M$ is the largest $|f(z)e^{ikz}|$ on the arc, found by sampling — for $k > 0$ it sits at the arc’s ends, where $e^{ikz}$ has size 1.`,
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{\cos 2x}{x^2 + 1}\,dx$.`,
    visual: contour({ f: 'exp(2*i*z)/(z^2 + 1)', contour: D(3), marks: [pole(0, 1, 'i'), pole(0, -1, '−i')], x: [-3.6, 3.6], y: [-1.6, 3.6], n: 40, readout: ['I'] }, t`The D contour for $e^{2iz}/(z^2 + 1)$: the chain ends at $\pi e^{-2} \approx 0.425$, and the arc’s orange arrows have almost vanished already at $R = 3$.`),
    steps: [
      { label: 'Use the exponential', text: t`$\cos 2x = \operatorname{Re} e^{2ix}$, so the integral is $\operatorname{Re}\displaystyle\int_{-\infty}^{\infty}\frac{e^{2ix}}{x^2 + 1}\,dx$. Do **not** use $\cos 2z$: it grows like $\tfrac12 e^{2|y|}$ in both half-planes.` },
      { label: 'Choose the half', text: t`$|e^{2iz}| = e^{-2y}$ dies for $y > 0$: close in the upper half-plane. (Here even ML would do: $|f| \le 1/(R^2 - 1)$.)` },
      { label: 'Residue', text: t`One pole inside, at $i$: $\operatorname{Res} = \dfrac{e^{2i\cdot i}}{2i} = \dfrac{e^{-2}}{2i}$.` },
      { label: 'Theorem', text: t`$\displaystyle\int_{-\infty}^{\infty}\frac{e^{2ix}}{x^2 + 1}\,dx = 2\pi i\cdot\frac{e^{-2}}{2i} = \pi e^{-2}$ — already real, so the sine part $\int \sin 2x/(x^2 + 1)\,dx$ is $0$ (it is odd).` },
      { label: 'Sense check', text: t`At $k = 0$ the formula $\pi e^{-k}$ gives $\pi$, the integral of $1/(x^2 + 1)$. As $k$ grows the cosine wiggles faster and its positive and negative lobes cancel more: the answer falls **exponentially**, because the integrand is smooth (its poles are a distance $1$ from the real axis).` },
    ],
    answer: t`$\pi e^{-2} \approx 0.4252$`,
  },
  practice: [
    mcq({
      id: 'which-half', difficulty: 2,
      prompt: t`To evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{e^{-3ix}}{x^2 + 4}\,dx$, which way should you close the real line?`,
      visual: { type: 'graph', params: { x: [-1.2, 1.2], y: [0, 8], aspect: 'wide', xlabel: 'height y = Im z', ylabel: 'size of the wave', axesAt: 'edge', curves: [{ fn: 'e^(3x)', color: 'bad', width: 2.4, label: '|e⁻³ⁱᶻ| = e³ʸ', labelAt: 0.62, labelDx: 10, labelDy: 0 }, { fn: 'e^(-3x)', color: 'accent', width: 2, dash: [6, 4], label: '|e³ⁱᶻ| = e⁻³ʸ', labelAt: -0.6, labelDx: 10 }], vlines: [{ x: 0, color: 'ink3' }] },
        caption: t`How big each wave is at height $y$ above the real axis (it does not depend on $x$).` },
      choices: [
        t`Below, with the lower semicircle walked clockwise, picking up $-2\pi i$ times the residue at $-2i$`,
        t`Above, picking up $2\pi i$ times the residue at $2i$`,
        t`Either way: the arc vanishes in both half-planes because $|f| \sim 1/R^2$`,
        t`Neither: write $e^{-3ix} = \cos 3x - i\sin 3x$ and close $\cos 3z$ above`,
      ],
      answer: 0,
      why: {
        1: t`Above, $|e^{-3iz}| = e^{3y}$ grows exponentially and swamps the $1/R^2$: the arc does not die.`,
        2: t`The $1/R^2$ of $f$ loses to the $e^{3R\sin\theta}$ of the wave on the upper arc. Only the lower arc dies.`,
        3: t`$\cos 3z$ grows like $\tfrac12e^{3|y|}$ in **both** half-planes: no arc would die.`,
      },
      hints: [t`With $z = x + iy$, $|e^{-3iz}| = |e^{-3ix}|\,|e^{3y}| = e^{3y}$.`, 'Close where that is small, and mind the direction you walk.'],
      teach: t`$e^{ikz}$ dies above for $k > 0$ and below for $k < 0$; closing below runs clockwise, so the theorem gives $-2\pi i\sum\operatorname{Res}$.`,
      explain: t`Below, $|e^{-3iz}| = e^{3y} \le 1$. The enclosed pole is $-2i$, residue $\frac{e^{-3i(-2i)}}{-4i} = \frac{e^{-6}}{-4i}$, and $-2\pi i\cdot\frac{e^{-6}}{-4i} = \frac{\pi}{2}e^{-6}$ — the same as with $e^{+3ix}$, as it must be: the integrand’s even part is the cosine.`,
    }),
    num({
      id: 'cos-k', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3, 0.5]), a = r.pick([1, 2, 0.5]);
        const ans = (PI / a) * E(-k * a);
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{\cos(${nm(k, 3)}x)}{x^2 + ${nm(a * a, 3)}}\,dx$. (3 significant figures.)`,
          visual: wave(`cos(${k}x)/(x^2 + ${a * a})`, [-12, 12], 1.15 / (a * a), 'The integrand: a cosine under a bell. Its lobes mostly cancel; the residues say exactly how much survives.'),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [
            { value: PI / a, feedback: t`That is the $k = 0$ answer. The residue of $e^{ikz}/(z^2 + a^2)$ at $ai$ carries $e^{ik\cdot ai} = e^{-ka}$.` },
            { value: (PI / a) * Math.cosh(k * a), feedback: t`That comes from closing $\cos kz$ itself, which grows in both half-planes. Use $e^{ikz}$ and take the real part.` },
            { value: (PI / a) * E(k * a), feedback: t`$e^{ik(ai)} = e^{-ka}$: the $i^2 = -1$ makes the exponent negative.` },
          ]),
          hints: [t`Write $\cos kx = \operatorname{Re} e^{ikx}$ and close above. The only enclosed pole is $${iPlain(a)}$.`, t`$\operatorname{Res} = \dfrac{e^{ik(${iPlain(a)})}}{2\cdot ${iPlain(a)}} = \dfrac{e^{-${nm(k * a, 3)}}}{${nm(2 * a, 3)}i}$.`],
          teach: t`$\int_{-\infty}^{\infty}\frac{\cos kx}{x^2 + a^2}\,dx = \frac{\pi}{a}e^{-ka}$ for $k \ge 0$: the pole’s height $a$ sets the exponential fall-off.`,
          explain: t`$2\pi i\cdot\dfrac{e^{-${nm(k * a, 3)}}}{${nm(2 * a, 3)}i} = \dfrac{\pi}{${nm(a, 3)}}e^{-${nm(k * a, 3)}} = ${nm(ans, 4)}$. Checked by numerical quadrature in the course’s check script.`,
        };
      },
    }),
    num({
      id: 'x-sin', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 0.5, 3]), a = r.pick([1, 2, 0.5]);
        const ans = PI * E(-k * a);
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{x\sin(${nm(k, 3)}x)}{x^2 + ${nm(a * a, 3)}}\,dx$. (3 significant figures.)`,
          visual: wave(`x*sin(${k}x)/(x^2 + ${a * a})`, [-25, 25], 0.9 / a, 'The integrand: its envelope falls only like 1/|x|, so the integral converges only because the lobes alternate.'),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: PI * Math.cosh(k * a), feedback: t`Closing $\sin kz$ directly fails: it grows like $\tfrac12e^{k|y|}$. Take the imaginary part of the $e^{ikx}$ integral.` }, { value: PI, feedback: t`The residue at $${iPlain(a)}$ carries $e^{-${nm(k * a, 3)}}$.` }]),
          hints: [t`$\sin kx = \operatorname{Im} e^{ikx}$. Here $|f| = |z|/|z^2 + a^2| \sim 1/R$, too slow for ML — but Jordan’s lemma only needs $\max|f| \to 0$.`, t`$\operatorname{Res}_{${iPlain(a)}}\dfrac{z\,e^{ikz}}{z^2 + a^2} = \dfrac{${iPlain(a)}\,e^{-${nm(k * a, 3)}}}{2\cdot ${iPlain(a)}} = \tfrac12e^{-${nm(k * a, 3)}}$. Multiply by $2\pi i$ and take the imaginary part.`],
          teach: 'When f falls only like 1/R, ML fails but Jordan’s lemma still kills the arc.',
          explain: t`$\displaystyle\int\frac{xe^{ikx}}{x^2 + a^2}\,dx = 2\pi i\cdot\tfrac12e^{-ka} = i\pi e^{-ka}$, whose imaginary part is $\pi e^{-${nm(k * a, 3)}} = ${nm(ans, 4)}$. (The real part, $\int x\cos kx/(x^2 + a^2)$, is $0$ because that integrand is odd.)`,
        };
      },
    }),
    mcq({
      id: 'cos-z', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “$\cos z/(z^2 + 1)$ has one pole above the axis, at $i$, with residue $\cos(i)/(2i)$. So $\displaystyle\int_{-\infty}^{\infty}\frac{\cos x}{x^2 + 1}\,dx = 2\pi i\cdot\frac{\cos i}{2i} = \pi\cosh 1 \approx 4.85$.” The true value is $\pi/e \approx 1.156$. What went wrong?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 10.5], aspect: 'wide', xlabel: 'height y above the real axis', ylabel: 'size', axesAt: 'edge', curves: [{ fn: 'cosh(x)', color: 'bad', width: 2.4, label: 'size of cos z: cosh y', labelAt: 2.2, labelDx: -160, labelDy: -6 }, { fn: 'e^(-x)', color: 'accent', width: 2.4, label: 'size of eⁱᶻ: e⁻ʸ', labelAt: 1.2, labelDx: 8, labelDy: -12 }] },
        caption: t`On the imaginary axis, $\cos z$ grows like $\tfrac12 e^{y}$ while $e^{iz}$ decays like $e^{-y}$.` },
      choices: [
        t`$\cos z$ grows exponentially in the upper half-plane, so the arc does not vanish; close $e^{iz}/(z^2 + 1)$ instead and take the real part`,
        t`The residue at $i$ should be $\cos(i)/i$`,
        t`The pole at $-i$ must be included too`,
        t`$\cos x/(x^2 + 1)$ cannot be integrated by residues at all`,
      ],
      answer: 0,
      why: {
        1: t`$h'(i) = 2i$, so $\cos i/(2i)$ is the right residue — the trouble is the arc, not the residue.`,
        2: t`The lower pole is outside the upper contour. Adding it would not repair the arc either.`,
        3: t`It can — with $e^{iz}$ in place of $\cos z$.`,
      },
      hints: [t`Every step is right except the assumption that the arc’s integral vanishes. Check $|\cos z|$ at $z = iR$.`, t`$\cos(iR) = \cosh R$, which grows like $\tfrac12e^R$.`],
      teach: t`Never close $\cos kz$ or $\sin kz$: each is half $e^{ikz}$, which dies above, and half $e^{-ikz}$, which dies below.`,
      explain: t`On the arc, $\cos z = \tfrac12(e^{iz} + e^{-iz})$ contains $e^{-iz}$, which grows like $e^{y}$. With $e^{iz}$: $2\pi i\cdot\frac{e^{-1}}{2i} = \pi/e$, whose real part is the answer.`,
    }),
    num({
      id: 'two-cos', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 3]]), k = r.pick([1, 0.5, 2]);
        const ans = (PI / (b * b - a * a)) * (E(-k * a) / a - E(-k * b) / b);
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{\cos(${nm(k, 3)}x)}{(x^2 + ${a * a})(x^2 + ${b * b})}\,dx$. (3 significant figures.)`,
          visual: plane({ f: `exp(${k}*i*z)/((z^2 + ${a * a})*(z^2 + ${b * b}))`, contour: D(1.6 * b), marks: [pole(0, a, iPlain(a)), pole(0, b, iPlain(b)), pole(0, -a, iPlain(-a)), pole(0, -b, iPlain(-b))], x: [-2.2 * b, 2.2 * b], y: [-1.3 * b, 2 * b] }, t`The D contour encloses the two upper poles of $e^{${nm(k, 3)}iz}/((z^2 + ${a * a})(z^2 + ${b * b}))$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [
            { value: (PI / (b * b - a * a)) * (E(-k * a) / a), feedback: t`Include the residue at $${iPlain(b)}$ too.` },
            { value: (PI / (b * b - a * a)) * (1 / a - 1 / b), feedback: t`That is the $k = 0$ value: each residue carries $e^{-k\cdot\text{height}}$.` },
          ]),
          hints: [t`Close $e^{ikz}$ above; poles $${iPlain(a)}$ and $${iPlain(b)}$.`, t`$\operatorname{Res}_{${iPlain(a)}} = \dfrac{e^{-${nm(k * a, 3)}}}{${2 * a}i\,(${b * b} - ${a * a})}$ and $\operatorname{Res}_{${iPlain(b)}} = \dfrac{e^{-${nm(k * b, 3)}}}{${2 * b}i\,(${a * a} - ${b * b})}$.`],
          teach: 'Each upper pole contributes its own exponential $e^{-k\\cdot\\text{height}}$: the nearest one dominates at large k.',
          explain: t`$2\pi i(\operatorname{Res}_1 + \operatorname{Res}_2) = \dfrac{\pi}{${b * b - a * a}}\left(\dfrac{e^{-${nm(k * a, 3)}}}{${a}} - \dfrac{e^{-${nm(k * b, 3)}}}{${b}}\right) = ${nm(ans, 4)}$. Checked by quadrature in the course’s check script.`,
        };
      },
    }),
    num({
      id: 'shifted', difficulty: 3,
      gen(r) {
        const c = r.pick([1, 2, -1]), q = r.pick([1, 2]), k = r.pick([1, 0.5]);
        const ans = (PI / q) * E(-k * q) * Math.cos(k * c);
        const den = t`(x ${c < 0 ? '+' : '-'} ${Math.abs(c)})^2 + ${q * q}`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{\cos(${nm(k, 3)}x)}{${den}}\,dx$. (3 significant figures.)`,
          visual: wave(`cos(${k}x)/((x - (${c}))^2 + ${q * q})`, [-14, 14], 1.15 / (q * q), 'The integrand: the bell is centred off the origin, so the cosine meets it at a different phase.', { vlines: [{ x: c, color: 'ink3' }] }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (PI / q) * E(-k * q), feedback: t`The pole is at $${c} + ${q === 1 ? '' : q}i$, and $e^{ik(${c} + ${q === 1 ? '' : q}i)}$ carries the phase $e^{${nm(k * c, 3)}i}$: take its real part.` }, { value: (PI / q) * E(-k * q) * Math.sin(k * c), feedback: 'That is the imaginary part — the integral with sin in place of cos.' }]),
          hints: [t`Poles at $${c} \pm ${q === 1 ? '' : q}i$; close $e^{ikz}$ above. $\operatorname{Res} = \dfrac{e^{ik(${c} + ${q === 1 ? '' : q}i)}}{${2 * q}i}$.`, t`$2\pi i\cdot\operatorname{Res} = \dfrac{\pi}{${q}}e^{-${nm(k * q, 3)}}e^{${nm(k * c, 3)}i}$; the cosine integral is its real part.`],
          teach: 'A pole off the imaginary axis adds a phase $e^{ikc}$: the cosine and sine integrals are its real and imaginary parts.',
          explain: t`$\dfrac{\pi}{${q}}e^{-${nm(k * q, 3)}}\cos(${nm(k * c, 3)}) = ${nm(ans, 4)}$. Shifting the bell by $${c}$ multiplies its Fourier transform by the phase $e^{${nm(k * c, 3)}i}$ — the shift theorem.`,
        };
      },
    }),
    mcq({
      id: 'half-residue', difficulty: 3,
      prompt: t`To find $\int_0^\infty \frac{\sin x}{x}\,dx$, integrate $e^{iz}/z$ round the indented contour in the picture: the real line with a small semicircle of radius $\varepsilon$ stepping **over** the pole at $0$, closed by a big arc. In the limit $\varepsilon \to 0$, what does the small semicircle (walked clockwise, from $-\varepsilon$ to $\varepsilon$) contribute?`,
      visual: contour({ f: 'exp(i*z)/z', contour: indented(4, 0.6), marks: [pole(0, 0, '0')], x: [-4.6, 4.6], y: [-1.4, 4.6], n: 48, readout: false, arrowsOn: false }, t`The indented contour for $e^{iz}/z$, with $\varepsilon = 0.6$ and $R = 4$ (drawn large to be seen). It encloses no pole, so its chain closes up: the total is $0$.`),
      choices: [
        t`$-\pi i\operatorname{Res}(e^{iz}/z, 0) = -\pi i$: half a turn the wrong way round a simple pole`,
        t`$-2\pi i$: a full residue`,
        t`$0$: a small semicircle has a tiny length`,
        t`$+\pi i$`,
      ],
      answer: 0,
      why: {
        1: t`It is only half a turn, so only half of $2\pi i$.`,
        2: t`The length shrinks like $\pi\varepsilon$, but $|f| \approx 1/\varepsilon$ grows: the product stays finite, $\pi$.`,
        3: t`Clockwise (over the top from $-\varepsilon$ to $+\varepsilon$) gives the minus sign.`,
      },
      hints: [t`Near $0$, $e^{iz}/z \approx 1/z$. On $z = \varepsilon e^{i\phi}$, $\int dz/z = i\int d\phi$.`, t`$\phi$ runs from $\pi$ down to $0$.`],
      teach: t`A small semicircle round a simple pole contributes $\mp\pi i\operatorname{Res}$ — half the full turn — in the limit; this gives principal values.`,
      explain: t`$\int_\pi^0 i\,d\phi = -\pi i$. The closed contour encloses nothing, so $\text{PV}\!\int_{-\infty}^\infty\frac{e^{ix}}{x}dx - \pi i = 0$; its imaginary part gives $\int_{-\infty}^\infty\frac{\sin x}{x}dx = \pi$, and by evenness $\int_0^\infty\frac{\sin x}{x}dx = \frac{\pi}{2}$.`,
    }),
    num({
      id: 'indented', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 0.5]), b = r.pick([1, 2]);
        const ans = (PI * (1 - E(-a * b))) / (2 * b * b);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\infty}\frac{\sin(${nm(a, 3)}x)}{x\,(x^2 + ${b * b})}\,dx$. (3 significant figures.)`,
          visual: plane({ f: `exp(${a}*i*z)/(z*(z^2 + ${b * b}))`, contour: indented(2.4 * b, 0.25 * b), marks: [pole(0, 0, '0'), pole(0, b, iPlain(b)), pole(0, -b, iPlain(-b))], x: [-2.8 * b, 2.8 * b], y: [-1.5 * b, 2.8 * b] }, t`The indented contour for $e^{${nm(a, 3)}iz}/(z(z^2 + ${b * b}))$: it steps over the pole at $0$ and encloses the one at $${iPlain(b)}$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [
            { value: PI / (2 * b * b), feedback: t`That is the half-residue at $0$ alone; the pole at $${iPlain(b)}$ is inside the contour and contributes too.` },
            { value: (PI * (1 - E(-a * b))) / (b * b), feedback: 'That is the integral over the whole line; the integrand is even, so halve it.' },
          ]),
          hints: [t`Integrate $\dfrac{e^{${nm(a, 3)}iz}}{z(z^2 + ${b * b})}$ round the indented contour. Residues: at $0$, $\dfrac{1}{${b * b}}$; at $${iPlain(b)}$, $-\dfrac{e^{-${nm(a * b, 3)}}}{${2 * b * b}}$.`, t`$\text{PV}\!\int_{-\infty}^{\infty} = \pi i\operatorname{Res}_0 + 2\pi i\operatorname{Res}_{${iPlain(b)}}$ (the small semicircle hands back half a residue). Take the imaginary part, then halve.`],
          teach: 'A pole on the path counts half: PV∫ = 2πi Σ(inside) + πi Σ(on the axis).',
          explain: t`$\text{PV}\!\int_{-\infty}^{\infty}\frac{e^{iax}}{x(x^2 + b^2)}dx = \frac{\pi i}{b^2}\left(1 - e^{-ab}\right)$; its imaginary part is the sine integral over the whole line, and half of it is $\frac{\pi(1 - e^{-${nm(a * b, 3)}})}{${2 * b * b}} = ${nm(ans, 4)}$. As $a \to \infty$ it tends to $\frac{\pi}{2b^2}$: rapid oscillation makes $\int_0^\infty\frac{\sin ax}{x}g(x)\,dx$ pick out $\frac{\pi}{2}g(0)$, here with $g = 1/(x^2 + b^2)$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-half-line', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 0.5, 3]), a = r.pick([1, 2, 3]);
        const ans = (PI / (2 * a)) * E(-k * a);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\infty}\frac{\cos(${nm(k, 3)}x)}{x^2 + ${a * a}}\,dx$. (3 significant figures.)`,
          visual: realPic({ fn: `cos(${k}x)/(x^2 + ${a * a})`, x: [-12, 12], y: [-0.4 / (a * a), 1.15 / (a * a)], shade: false, caption: 'The integrand is even: the half line carries half the area. The asked-for half is shaded.', extra: { shade: [{ fn: `cos(${k}x)/(x^2 + ${a * a})`, from: 0, to: 12, color: 'accent', alpha: 0.2 }] } }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (PI / a) * E(-k * a), feedback: 'That is the whole line. The integrand is even: halve it.' }]),
          hints: ['The integrand is even, so the half line gives half the whole-line integral.', t`The whole line gives $\frac{\pi}{a}e^{-ka}$.`],
          teach: 'For an even integrand, close over the whole line and halve.',
          explain: t`$\frac{\pi}{${2 * a}}e^{-${nm(k * a, 3)}} = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-shift-sin', difficulty: 3,
      gen(r) {
        const c = r.pick([1, 2, -1, 3]), q = r.pick([1, 2]), k = r.pick([1, 0.5]);
        const ans = (PI / q) * E(-k * q) * Math.sin(k * c);
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\frac{\sin(${nm(k, 3)}x)}{(x ${c < 0 ? '+' : '-'} ${Math.abs(c)})^2 + ${q * q}}\,dx$. (3 significant figures.)`,
          visual: plane({ f: `exp(${k}*i*z)/((z - (${c}))^2 + ${q * q})`, contour: D(Math.abs(c) + 2.2 * q), marks: [pole(c, q), pole(c, -q)], x: [-(Math.abs(c) + 3 * q), Math.abs(c) + 3 * q], y: [-1.5 * q, Math.abs(c) + 3 * q] }, t`Poles at $${c} \pm ${q === 1 ? '' : q}i$ and the D contour.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (PI / q) * E(-k * q) * Math.cos(k * c), feedback: 'That is the real part — the cosine integral. The sine integral is the imaginary part.' }, { value: 0, feedback: 'The integrand is not odd: the bell is centred at c, not 0.' }]),
          hints: [t`Close $e^{ikz}$ above; the upper pole is $${c} + ${q === 1 ? '' : q}i$.`, t`$2\pi i\operatorname{Res} = \dfrac{\pi}{q}e^{-kq}e^{ikc}$; take the imaginary part.`],
          teach: 'The sine integral is the imaginary part of the $e^{ikx}$ integral.',
          explain: t`$\dfrac{\pi}{${q}}e^{-${nm(k * q, 3)}}\sin(${nm(k * c, 3)}) = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-dryden', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([60, 120, 200, 240]), [L, alt] = r.pick([[305, 'about 300 m'], [533, 'above 600 m']]), sig = r.pick([1.5, 2, 3]), tau = r.pick([1, 2, 3, 5]);
        const a = V / L, ans = sig * sig * E(-a * tau);
        return {
          prompt: t`An aircraft flies at $V = ${V}$ m/s through turbulence ${alt} up. The Dryden model gives the along-track gust speed a spectral density, over angular frequency $-\infty < \omega < \infty$, $$S(\omega) = \frac{\sigma^2}{\pi}\,\frac{\lambda}{\lambda^2 + \omega^2},\qquad \lambda = \frac{V}{L},$$ with gust intensity $\sigma = ${sig}$ m/s and scale length $L = ${L}$ m. The correlation between the gust now and a time $\tau$ later is $R(\tau) = \int_{-\infty}^{\infty} S(\omega)\cos(\omega\tau)\,d\omega$. Find $R$ at $\tau = ${tau}$ s, in $\text{m}^2/\text{s}^2$.`,
          visual: realPic({ fn: `${r4((sig * sig * a) / PI)}/(${r4(a * a)} + x^2)`, x: [-6 * a, 6 * a], y: [0, 1.15 * (sig * sig) / (PI * a)], xlabel: 'ω (rad/s)', caption: t`The gust spectrum $S(\omega)$: a Lorentzian of half-width $\lambda = V/L$. Its total area is $\sigma^2$, the gusts’ mean square.` }),
          answer: ans, units: 'm^2/s^2', tol: { rel: 0.005 },
          errors: apart(ans, [
            { value: sig * sig, feedback: t`$\sigma^2$ is $R(0)$, the correlation with no delay. The residue at $i\lambda$ brings $e^{-\lambda\tau}$.` },
            { value: sig * sig * E(-tau / a), feedback: t`The decay rate is $\lambda = V/L$ (per second), so the exponent is $-V\tau/L$, not $-L\tau/V$.` },
            { value: sig * E(-a * tau), feedback: t`$S$ carries $\sigma^2$, so $R$ is in $\text{m}^2/\text{s}^2$: square the intensity.` },
          ]),
          hints: [t`$R(\tau) = \operatorname{Re}\displaystyle\int S(\omega)e^{i\omega\tau}\,d\omega$; for $\tau > 0$ close above. The pole is at $\omega = i\lambda$.`, t`$\operatorname{Res} = \dfrac{\sigma^2\lambda}{\pi}\cdot\dfrac{e^{-\lambda\tau}}{2i\lambda}$, so $R = \sigma^2e^{-\lambda\tau}$.`, t`$\lambda = ${V}/${L} = ${nm(a, 3)}\ \text{s}^{-1}$.`],
          teach: t`A Lorentzian spectrum is the Fourier transform of an exponential correlation: the pole at $i\lambda$ becomes the decay $e^{-\lambda|\tau|}$.`,
          explain: t`$R(\tau) = \sigma^2e^{-V\tau/L} = ${sig * sig}\,e^{-${nm(a * tau, 3)}} = ${nm(ans, 4)}\ \text{m}^2/\text{s}^2$. The gusts forget themselves after about $L/V = ${nm(1 / a, 3)}$ s — the time to fly one scale length. This is the model flight simulators and gust-load analyses feed into the equations of motion (MIL-HDBK-1797); real turbulence is not exactly Lorentzian, and the von Kármán spectrum fits it better at high frequency.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§87–92 (Jordan’s lemma, indented paths)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 9', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Hoblit, Gust Loads on Aircraft: Concepts and Applications (AIAA, 1988) — the Dryden and von Kármán spectra', url: 'https://openlibrary.org/search?q=Hoblit+Gust+Loads+on+Aircraft' },
  ],
});
