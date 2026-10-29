// Function families a physicist meets daily — exponential decay, power laws,
// sinusoids and Gaussians, each recognised by its signature in data.
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';

const t = String.raw;

// selectors for the Explore graph's family choice
const is = (k) => `step(0.5 - abs(fam - ${k}))`;

// data points on a graph (no labels)
const dots = (xs, ys, color = 'gold') => xs.map((x, i) => ({ x, y: ys[i], color }));

export default lesson({
  id: 'math1210.C1-1.2',
  title: 'Function families a physicist meets daily',
  minutes: 10, difficulty: 2,
  intro: t`Most curves in physics belong to a handful of families, and each family has a **signature** you can spot in data before you fit anything:

$$\begin{gathered} y = A\,e^{-t/\tau} \qquad\quad y = C\,x^{p} \\[2pt] y = A\sin(\omega t + \varphi) \qquad\quad y = A\,e^{-(x-\mu)^2/(2\sigma^2)} \end{gathered}$$

**Exponential decay** loses the same *fraction* in equal times (radioactivity, capacitor discharge). A **power law** changes by the same factor every time $x$ *doubles*, and is a straight line on log–log axes (gravity, radiation spreading out, Kepler’s third law). A **sinusoid** repeats (oscillators, AC power). A **Gaussian** is the bell of measurement scatter and thermal motion. A **linear** function has constant *differences*.`,
  symbols: [
    { tex: 'A', text: 'the amplitude or starting value: the size of the curve, in the units of $y$' },
    { tex: '\\tau', text: 'the **decay time** (time constant), in s: every $\\tau$ the curve falls to $1/e \\approx 37\\%$; the half-life is $\\tau\\ln 2$' },
    { tex: 'C,\\ p', text: 'a power law’s coefficient and its **exponent** (dimensionless); inverse-square means $p = -2$' },
    { tex: '\\omega', text: 'the **angular frequency**, in rad/s; the period is $2\\pi/\\omega$ and the frequency $f = \\omega/2\\pi$ in Hz' },
    { tex: '\\varphi', text: 'the **phase**, in rad: where in its cycle the sinusoid starts' },
    { tex: '\\mu', text: 'the centre of the Gaussian (its mean), in the units of $x$' },
    { tex: '\\sigma', text: 'the Gaussian’s **standard deviation**: its width; the full width at half maximum is $2\\sqrt{2\\ln 2}\\,\\sigma \\approx 2.355\\,\\sigma$' },
  ],
  why: t`Recognising the family is half of every model: it tells you which derivative rule, which linearising plot and which physical law you are dealing with.`,
  visual: {
    type: 'graph',
    title: 'Four families and their signatures',
    lead: t`Pick a family. The slider $A$ sets its size and the slider $s$ its shape: $s$ is the decay time $\tau$, the power $-p$, the angular frequency $\omega$ or the width $\sigma$. The gold marks show each family’s signature.`,
    tasks: [
      t`Exponential decay: the marks sit at $0$, one half-life and two half-lives — the height halves each time, whatever $s$ is.`,
      t`Power law: the marks sit at $x = 1, 2, 4$. Each doubling of $x$ multiplies $y$ by the same factor $2^{-s}$.`,
      t`Gaussian: raise $s$ and the bell widens; the arrow at half height is the FWHM, always $2.355\,s$.`,
    ],
    params: {
      x: [-0.4, 8.4], y: [-2.3, 2.5], aspect: 'wide',
      choices: [{ key: 'fam', label: 'Family', options: [[0, 'exponential decay'], [1, 'power law'], [2, 'sinusoid'], [3, 'Gaussian']], value: 0, explain: 'Which family of functions to draw.' }],
      sliders: [
        { key: 'A', label: 'Size $A$', min: 0.5, max: 2, step: 0.05, value: 1.6, explain: 'The amplitude, or the value at the reference point: it stretches the curve vertically.' },
        { key: 's', label: 'Shape $s$', min: 0.3, max: 3, step: 0.05, value: 1.2, explain: t`The shape parameter: the decay time $\tau$, the power $-p$, the angular frequency $\omega$, or the width $\sigma$, depending on the family.` },
      ],
      curves: [
        { fn: 'A*e^(-x/s)', color: 'accent', domain: [0, 8.4], when: is(0) },
        { fn: 'A*x^(-s)', color: 'accent', domain: [0.12, 8.4], when: is(1) },
        { fn: 'A*sin(s*x)', color: 'accent', domain: [0, 8.4], when: is(2) },
        { fn: 'A*e^(-(x - 4)^2/(2*s^2))', color: 'accent', when: is(3) },
      ],
      points: [
        { x: 0, y: 'A', color: 'gold', when: is(0), label: 'A' },
        { x: 's*ln(2)', y: 'A/2', color: 'gold', when: is(0), label: 'A/2' },
        { x: '2*s*ln(2)', y: 'A/4', color: 'gold', when: is(0), label: 'A/4' },
        { x: 1, y: 'A', color: 'gold', when: is(1) },
        { x: 2, y: 'A*2^(-s)', color: 'gold', when: is(1) },
        { x: 4, y: 'A*4^(-s)', color: 'gold', when: is(1) },
      ],
      vlines: [{ x: '2*pi/s', label: 'one period', color: 'gold', when: `${is(2)}*step(8.3 - 2*pi/s)` }],
      arrows: [
        { from: ['4 - 1.1774*s', 'A/2'], to: ['4 + 1.1774*s', 'A/2'], color: 'gold', width: 1.6, label: 'FWHM', when: is(3) },
        { from: ['4 + 1.1774*s', 'A/2'], to: ['4 - 1.1774*s', 'A/2'], color: 'gold', width: 1.6, when: is(3) },
      ],
      readouts: [
        { label: t`half-life $s\ln 2$`, expr: 's*ln(2)', digits: 3 },
        { label: t`factor per doubling $2^{-s}$`, expr: '2^(-s)', digits: 3 },
        { label: t`period $2\pi/s$`, expr: '2*pi/s', digits: 3 },
        { label: t`FWHM $2.355\,s$`, expr: '2*sqrt(2*ln(2))*s', digits: 3 },
      ],
    },
    caption: t`Each family drawn with one size and one shape parameter; the phase of the sinusoid and the centre of the Gaussian are fixed. The power law blows up at $x = 0$, so it is drawn from $x = 0.12$. Units are left off: the shapes are what matter.`,
  },
  example: {
    prompt: t`Technetium-99m, the workhorse of medical imaging, is measured in a well counter:

$$\begin{array}{c|c|c|c|c} t\ (\text{h}) & 0 & 6 & 12 & 18 \\ \hline R\ (\text{counts/s}) & 800 & 400 & 200 & 100 \end{array}$$

Which family fits? Write the model and predict the count rate at $t = 24$ h.`,
    visual: { type: 'graph', params: { x: [-1, 26], y: [-40, 880], aspect: 'wide', xlabel: 't (h)', ylabel: 'R (counts/s)', curves: [{ fn: '800*2^(-x/6)', color: 'accent', dash: true, domain: [0, 26] }], points: dots([0, 6, 12, 18], [800, 400, 200, 100]) }, caption: t`The four readings and the exponential through them. Real counts scatter by about $\sqrt{N}$; these are rounded.` },
    steps: [
      { label: 'Try differences', text: t`$400 - 800 = -400$, then $-200$, then $-100$. The differences are not constant, so the data are not linear.` },
      { label: 'Try ratios', text: t`$400/800 = 200/400 = 100/200 = \tfrac12$. Equal time steps, equal *ratios*: that is the signature of an exponential.` },
      { label: 'Read the half-life', text: t`The rate halves every $6$ h, so the half-life is $t_{1/2} = 6.0$ h (the accepted value for Tc-99m is $6.01$ h).` },
      { label: 'Write the model', text: t`$R(t) = 800\cdot 2^{-t/6}$, or with base $e$: $R = 800\,e^{-t/\tau}$ with $\tau = t_{1/2}/\ln 2 = 6/0.693 = 8.66$ h.` },
      { label: 'Predict', text: t`$R(24) = 800 \cdot 2^{-4} = 50$ counts/s. Check with $\tau$: $800\,e^{-24/8.66} = 800\,e^{-2.77} = 50$. ✓` },
    ],
    answer: t`Exponential decay: $R(t) = 800\cdot 2^{-t/6\ \text{h}}$, so $R(24\ \text{h}) = 50$ counts/s.`,
  },
  practice: [
    mcq({
      id: 'which-family', difficulty: 2,
      prompt: t`A quantity is measured at four values of $x$:

$$\begin{array}{c|c|c|c|c} x & 1 & 2 & 4 & 8 \\ \hline y & 3 & 12 & 48 & 192 \end{array}$$

Which formula fits all four points?`,
      visual: { type: 'graph', params: { x: [-0.4, 9], y: [-12, 215], aspect: 'wide', points: dots([1, 2, 4, 8], [3, 12, 48, 192]) }, caption: 'The four data points. Note that the x-values double each time — they are not equally spaced.' },
      choices: [t`$y = 3x^2$`, t`$y = 3\cdot 4^{\,x-1}$`, t`$y = 3x^4$`, t`$y = 9x - 6$`],
      answer: 0,
      why: {
        1: t`$y$ is multiplied by 4 each step, but the steps double $x$ rather than add 1 to it. At $x = 4$ this formula gives $192$, not $48$.`,
        2: t`Multiplying by 4 per doubling means $2^p = 4$, so $p = 2$, not 4: $3\cdot 2^4 = 48 \ne 12$.`,
        3: t`That line passes through the first two points only; at $x = 4$ it gives $30$.`,
      },
      hints: ['Look at how y changes each time x doubles.', t`A power law $y = Cx^p$ multiplies $y$ by $2^p$ every time $x$ doubles.`],
      teach: 'Constant ratio per doubling of x is a power law; constant ratio per equal step of x is an exponential.',
      explain: t`Each doubling of $x$ multiplies $y$ by $4 = 2^2$, so $y = Cx^2$; $x = 1$ gives $C = 3$. Check: $3\cdot 8^2 = 192$. ✓`,
    }),
    num({
      id: 'rc-1pct', difficulty: 2,
      gen(r) {
        const R = r.pick([2.2, 4.7, 10, 22]), C = r.pick([10, 47, 100]);
        const tau = R * C;            // kΩ × μF = ms
        const ans = tau * Math.log(100);
        return {
          prompt: t`A capacitor of $${C}\,\mu\text{F}$ discharges through a $${R}\ \text{k}\Omega$ resistor, so its voltage is $V = V_0\,e^{-t/\tau}$ with $\tau = RC$. How long until the voltage is down to $1\%$ of $V_0$?`,
          answer: ans, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: tau * 2, feedback: t`That used $\log_{10} 100 = 2$. Solving $e^{-t/\tau} = 0.01$ needs the natural log: $t = \tau\ln 100$.` }, { value: tau * 0.01, feedback: t`The voltage does not fall in proportion to time: solve $e^{-t/\tau} = 0.01$ for $t$.` }],
          hints: [t`$\tau = RC = (${R}\times 10^{3}\ \Omega)(${C}\times 10^{-6}\ \text{F}) = ${nice(tau)}$ ms.`, t`Set $e^{-t/\tau} = 0.01$ and take the natural log: $t = \tau \ln 100 \approx 4.6\,\tau$.`],
          teach: t`An exponential decay reaches a fraction $q$ of its start after $t = \tau\ln(1/q)$: about $0.69\tau$ for a half, $2.3\tau$ for a tenth, $4.6\tau$ for a hundredth.`,
          explain: t`$t = \tau\ln 100 = ${nice(tau)}\ \text{ms} \times 4.605 = ${fmt(ans)}$ ms.`,
          visual: { type: 'graph', params: { x: [-0.2 * tau, 6 * tau], y: [-0.08, 1.12], aspect: 'wide', xlabel: 't (ms)', ylabel: 'V / V₀', curves: [{ fn: `e^(-x/${tau})`, color: 'accent', domain: [0, 6 * tau] }], hlines: [{ y: 0.01, label: '1%', color: 'gold' }] }, caption: t`The fraction of the starting voltage left after time $t$, for $\tau = ${nice(tau)}$ ms. The 1% line is very close to the axis — read the time from the equation, not the picture.` },
        };
      },
    }),
    num({
      id: 'sunlight', difficulty: 2,
      gen(r) {
        const [name, a] = r.pick([['Venus', 0.723], ['Mars', 1.524], ['Ceres', 2.77], ['Jupiter', 5.20]]);
        const S = 1361, ans = S / (a * a);
        return {
          prompt: t`Sunlight spreads over a sphere, so its intensity falls as an inverse-square power law: $I(r) = I_\oplus\,(r/1\ \text{AU})^{-2}$, with $I_\oplus = 1361\ \text{W/m}^2$ at Earth. What is the intensity at ${name}, $${a}$ AU from the Sun?`,
          answer: ans, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: S / a, feedback: t`That falls off as $1/r$. Light spreads over the area of a sphere, $4\pi r^2$: square the distance ratio.` }, { value: S * a * a, feedback: t`The exponent is $-2$: the intensity falls with distance, so divide by $(${a})^2$.` }],
          hints: [t`$I = 1361 / (${a})^2$.`],
          teach: 'An inverse-square law divides by the square of the distance ratio: twice as far, a quarter as bright.',
          explain: t`$I = 1361/(${a})^2 = 1361/${nice(a * a)} = ${fmt(ans)}\ \text{W/m}^2$.`,
          visual: { type: 'graph', params: { x: [0, 5.8], y: [-150, 3000], aspect: 'wide', xlabel: 'r (AU)', ylabel: 'I (W/m²)', curves: [{ fn: '1361/x^2', color: 'accent', domain: [0.6, 5.8] }], points: [{ x: 1, y: 1361, color: 'gold', label: 'Earth' }] }, caption: 'The inverse-square law for sunlight above the atmosphere, with Earth marked. Orbits are taken as circles at their mean distance.' },
        };
      },
    }),
    num({
      id: 'ac-frequency', difficulty: 2,
      gen(r) {
        const [f, A, where] = r.pick([[50, 325, 'a European wall socket'], [60, 170, 'a North American wall socket'], [400, 163, 'an airliner’s AC power bus']]);
        const w = 2 * Math.PI * f;
        return {
          prompt: t`The voltage from ${where} is $V(t) = ${A}\sin(${nice(Math.round(w * 10) / 10)}\,t)$ volts, with $t$ in seconds. What is its frequency $f$ in hertz?`,
          answer: f, units: 'Hz', tol: { rel: 0.003 },
          errors: [{ value: Math.round(w * 10) / 10, feedback: t`That is the angular frequency $\omega$, in rad/s. Cycles per second are $f = \omega/2\pi$.` }, { value: 1 / f, feedback: t`That is the period $T = 1/f$, in seconds — not the frequency.` }],
          hints: [t`The number multiplying $t$ is $\omega$, in rad/s.`, t`One cycle is $2\pi$ radians, so $f = \omega/2\pi$.`],
          teach: t`In $A\sin(\omega t)$, $\omega$ counts radians per second; divide by $2\pi$ to count cycles per second.`,
          explain: t`$f = \dfrac{\omega}{2\pi} = \dfrac{${nice(Math.round(w * 10) / 10)}}{2\pi} \approx ${f}$ Hz, a period of $${nice(1000 / f)}$ ms. (The amplitude $${A}$ V is the peak; the quoted mains voltage is the rms value, $${A}/\sqrt2$.)`,
          visual: { type: 'graph', params: { x: [0, 2.5 * 1000 / f], y: [-A * 1.25, A * 1.25], aspect: 'wide', xlabel: 't (ms)', ylabel: 'V (volts)', curves: [{ fn: `${A}*sin(${2 * Math.PI * f / 1000}*x)`, color: 'accent' }] }, caption: t`Two and a half cycles of the supply voltage. Real mains is close to, but not exactly, a pure sinusoid.` },
        };
      },
    }),
    num({
      id: 'fwhm', difficulty: 2,
      gen(r) {
        const s = r.pick([1.2, 1.5, 2.0, 2.4, 3.0, 3.6]);
        const ans = 2 * Math.sqrt(2 * Math.LN2) * s;
        return {
          prompt: t`A Doppler-broadened spectral line has a Gaussian profile, $I(\lambda) = I_0\,e^{-(\lambda-\lambda_0)^2/(2\sigma^2)}$, with $\sigma = ${s}$ pm. What is its full width at half maximum (FWHM)?`,
          answer: ans, units: 'pm', tol: { rel: 0.005 },
          errors: [{ value: 2 * s, feedback: t`$2\sigma$ is the width between the points where the height is $e^{-1/2} \approx 61\%$, not $50\%$.` }, { value: Math.sqrt(2 * Math.LN2) * s, feedback: t`That is the *half* width at half maximum. The full width is twice it.` }],
          hints: [t`Set $e^{-(\lambda-\lambda_0)^2/(2\sigma^2)} = \tfrac12$ and solve for $\lambda - \lambda_0$.`, t`$(\lambda - \lambda_0)^2 = 2\sigma^2\ln 2$, so $\lambda - \lambda_0 = \pm\sigma\sqrt{2\ln 2}$; the full width is twice that.`],
          teach: t`A Gaussian’s full width at half maximum is $2\sqrt{2\ln 2}\,\sigma \approx 2.355\,\sigma$.`,
          explain: t`$\text{FWHM} = 2\sqrt{2\ln 2}\,\sigma = 2.355 \times ${s}\ \text{pm} = ${fmt(ans)}$ pm.`,
          visual: { type: 'graph', params: { x: [-4.5 * s, 4.5 * s], y: [-0.08, 1.15], aspect: 'wide', xlabel: 'λ − λ₀ (pm)', ylabel: 'I / I₀', curves: [{ fn: `e^(-x^2/(2*${s * s}))`, color: 'accent' }], hlines: [{ y: 0.5, label: 'half maximum', color: 'gold' }] }, caption: 'The line profile, centred on its rest wavelength. Real lines also have a Lorentzian part from collisions and the natural linewidth; this one is pure Doppler.' },
        };
      },
    }),
    match({
      id: 'laws', difficulty: 2,
      prompt: 'Match each physical relationship to its family of functions.',
      left: [
        t`the count rate $R(t)$ of a radioactive sample`,
        t`an orbit’s period $T$ against its semi-major axis $a$ (Kepler’s third law)`,
        t`the position $x(t)$ of an undamped mass on a spring`,
        t`the spread of one velocity component $v_x$ among gas molecules`,
        t`a spring’s force $F$ against its stretch $x$ (Hooke’s law)`,
      ],
      right: ['exponential', 'power law', 'sinusoid', 'Gaussian', 'linear', 'logarithmic'],
      answer: [0, 1, 2, 3, 4],
      visual: { type: 'graph', params: { x: [0, 10], y: [-1.3, 3.4], aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [
        { fn: '2.8*e^(-x/1.2)', color: 'accent', domain: [0, 2.6], label: 'exponential', labelAt: 1.2 },
        { fn: '0.3*(x - 3)^1.5', color: 'good', domain: [3, 5.2], label: 'power law', labelAt: 4.3, labelDx: -50 },
        { fn: '0.6*sin(3*(x - 5.6)) - 0.7', color: 'violet', domain: [5.6, 7.7], label: 'sinusoid', labelAt: 6.1, labelDy: 18 },
        { fn: '2.6*e^(-(x - 8.9)^2/(2*0.25))', color: 'gold', domain: [7.9, 9.9], label: 'Gaussian', labelAt: 8.45, labelAlign: 'right', labelDx: -6 },
      ] }, caption: 'Four of the family shapes side by side, not to any common scale.' },
      hints: ['Ask what each quantity does: decay by a constant fraction, scale with a power, repeat, or cluster around a centre.', t`Kepler’s third law says $T^2 \propto a^3$, so $T \propto a^{3/2}$.`],
      teach: 'Each law of physics comes with a family, and the family tells you how the quantity behaves.',
      explain: t`Decay loses a constant fraction per time (exponential); $T \propto a^{3/2}$ (power law); $x = A\cos(\omega t + \varphi)$ (sinusoid); the Maxwell–Boltzmann distribution of one component is $\propto e^{-mv_x^2/2kT}$ (Gaussian); $F = -kx$ (linear). Nothing here is logarithmic.`,
    }),
    mcq({
      id: 'loglog', difficulty: 3,
      prompt: t`Plotted on log–log axes — $\log y$ against $\log x$ — a set of data falls on a straight line of slope $-2$. Which family is it?`,
      visual: { type: 'graph', params: { x: [-0.2, 2.2], y: [-0.5, 4.4], aspect: 'wide', xlog: true, ylog: true, xlabel: 'x', ylabel: 'y', curves: [{ fn: '4 - 2*x', color: 'accent', dash: true, domain: [0, 2] }], points: dots([0.2, 0.6, 1.0, 1.4, 1.8], [3.6, 2.8, 2.0, 1.2, 0.4]) }, caption: 'Both axes logarithmic: each grid step is a factor of 10. The points are illustrative.' },
      choices: [t`a power law, $y = Cx^{-2}$`, t`an exponential decay, $y = Ce^{-2x}$`, t`a straight line, $y = -2x + b$`, t`a logarithm, $y = b - 2\log x$`],
      answer: 0,
      why: {
        1: t`An exponential is straight on *semi-log* axes ($\log y$ against $x$), not log–log: $\log y = \log C - 2x\log e$.`,
        2: t`A line is straight on ordinary axes. Taking logs of both coordinates bends it.`,
        3: t`$y = b - 2\log x$ is straight when $y$ is plotted against $\log x$ — only one axis logarithmic.`,
      },
      hints: [t`Take the log of $y = Cx^p$.`, t`$\log y = \log C + p\log x$: a straight line in $(\log x, \log y)$ with slope $p$.`],
      teach: 'A power law is a straight line on log–log axes, and the slope is the exponent.',
      explain: t`$\log y = \log C + p\log x$ is a line of slope $p$ in log–log coordinates, so $p = -2$: an inverse-square law.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rtg', difficulty: 2, transfer: true,
      gen(r) {
        const P0 = r.pick([2000, 2400, 4400]), yrs = r.pick([10, 14, 20, 46]);
        const half = 87.7, ans = P0 * 2 ** (-yrs / half);
        return {
          prompt: t`A spacecraft’s radioisotope power source holds plutonium-238 (half-life $87.7$ years) that produces $${P0}$ W of heat at launch. Counting radioactive decay only, how much heat does it produce $${yrs}$ years later?`,
          answer: ans, units: 'W', tol: { rel: 0.005 },
          errors: [{ value: P0 * Math.exp(-yrs / half), feedback: t`You used the half-life as the time constant $\tau$. With a half-life, the factor is $2^{-t/t_{1/2}}$ (or $e^{-t/\tau}$ with $\tau = t_{1/2}/\ln 2 = 126.5$ yr).` }, { value: P0 * (1 - yrs / (2 * half)), feedback: t`Decay is not linear: it removes a constant *fraction* per year, not a constant amount.` }],
          hints: [t`$P(t) = P_0\cdot 2^{-t/t_{1/2}}$.`],
          teach: t`After $t$, a decaying quantity has been halved $t/t_{1/2}$ times: multiply by $2^{-t/t_{1/2}}$.`,
          explain: t`$P = ${P0}\cdot 2^{-${yrs}/87.7} = ${P0} \times ${nice(2 ** (-yrs / half))} = ${fmt(ans, 4)}$ W. A real generator’s *electrical* output falls faster, because its thermocouples also age.`,
          visual: { type: 'graph', params: { x: [-5, 200], y: [-0.06 * P0, 1.12 * P0], aspect: 'wide', xlabel: 't (years)', ylabel: 'heat (W)', curves: [{ fn: `${P0}*2^(-x/87.7)`, color: 'accent', domain: [0, 200] }], points: [{ x: 0, y: P0, color: 'gold', label: 'launch' }, { x: 87.7, y: P0 / 2, color: 'gold', label: 'one half-life' }] }, caption: 'Heat from plutonium-238 decay alone, over two centuries.' },
        };
      },
    }),
    mcq({
      id: 'cp-atmosphere', difficulty: 2,
      prompt: t`The International Standard Atmosphere gives these pressures:

$$\begin{array}{c|c|c|c|c} z\ (\text{km}) & 0 & 5 & 10 & 15 \\ \hline p\ (\text{kPa}) & 101.3 & 54.0 & 26.4 & 12.1 \end{array}$$

Which family describes $p(z)$ best?`,
      visual: { type: 'graph', params: { x: [-1, 17], y: [-5, 112], aspect: 'wide', xlabel: 'z (km)', ylabel: 'p (kPa)', points: dots([0, 5, 10, 15], [101.3, 54.0, 26.4, 12.1]) }, caption: 'Tabulated values of the standard atmosphere, a model of average conditions.' },
      choices: ['approximately exponential decay', 'linear', 'a power law in z', 'a sinusoid'],
      answer: 0,
      why: {
        1: t`The differences are $-47$, $-28$ and $-14$ kPa: far from constant.`,
        2: t`A power law $Cz^p$ is $0$ or infinite at $z = 0$, but the pressure there is finite.`,
        3: 'Nothing repeats: the pressure falls steadily.',
      },
      hints: ['Compute the ratio between successive pressures.'],
      teach: 'Nearly constant ratios over equal steps mark an exponential.',
      explain: t`The ratios are $0.53$, $0.49$, $0.46$ — nearly constant, so $p \approx p_0 e^{-z/H}$ with a scale height $H \approx 7$ km. The ratio drifts because the air temperature changes with height; an exactly isothermal atmosphere would be exactly exponential.`,
    }),
    expr({
      id: 'cp-model', difficulty: 2,
      gen(r) {
        const R0 = r.pick([500, 1000, 2400]), T = r.pick([5, 8, 12]);
        return {
          prompt: t`A source starts at $${R0}$ counts/s and has a half-life of $${T}$ h. Write its count rate $R$ as a function of $t$ in hours.`,
          lhs: 'R(t)',
          answer: `${R0}*2^(-t/${T})`, answerTeX: t`${R0}\cdot 2^{-t/${T}}`,
          vars: { t: [0, 20] },
          errors: [{ answer: `${R0}*e^(-t/${T})`, feedback: t`With base $e$ the time constant is $\tau = t_{1/2}/\ln 2$, not the half-life itself. Use base 2 with the half-life.` }, { answer: `${R0}*2^(-${T}*t)`, feedback: t`The exponent is $t$ *divided* by the half-life, so it equals 1 after one half-life.` }],
          hints: [t`After one half-life the rate must be $${R0 / 2}$.`],
          teach: t`With a half-life $t_{1/2}$, the model is $R_0\cdot 2^{-t/t_{1/2}}$.`,
          explain: t`$R(t) = ${R0}\cdot 2^{-t/${T}}$; at $t = ${T}$ h it gives $${R0 / 2}$. Equivalent: $${R0}\,e^{-t\ln 2/${T}}$.`,
          visual: { type: 'graph', params: { x: [-0.5, 3.2 * T], y: [-0.05 * R0, 1.12 * R0], aspect: 'wide', xlabel: 't (h)', ylabel: 'R (counts/s)', points: [{ x: 0, y: R0, color: 'gold', label: 'start' }, { x: T, y: R0 / 2, color: 'gold', label: 'one half-life' }] }, caption: 'Two facts the model must reproduce.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §1.2 Basic classes of functions', url: 'https://openstax.org/books/calculus-volume-1/pages/1-2-basic-classes-of-functions' },
    { label: 'OpenStax Calculus Vol. 1, §1.5 Exponential and logarithmic functions', url: 'https://openstax.org/books/calculus-volume-1/pages/1-5-exponential-and-logarithmic-functions' },
    { label: 'NNDC NuDat: Tc-99m half-life', url: 'https://www.nndc.bnl.gov/nudat3/' },
  ],
});
