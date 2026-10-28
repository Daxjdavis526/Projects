// e and the natural log — the base whose exponential is its own slope, and time constants.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';

const t = String.raw;
const LN2 = Math.LN2;
// a decay curve e^(−t/τ) with marks at whole multiples of τ (t in units of τ)
const decayTau = (k, caption, label = 'V / V₀') => ({
  type: 'graph',
  params: { x: [-0.2, Math.max(4, k + 1)], y: [-0.06, 1.12], aspect: 'wide', xlabel: 't / τ', ylabel: label, yticks: 0,
    curves: [{ fn: 'e^(-x)', color: 'accent', domain: [0, Math.max(4, k + 1)] }],
    vlines: Array.from({ length: Math.max(4, k + 1) }, (_, i) => ({ x: i + 1, color: 'ink3' })) },
  caption,
});

export default lesson({
  id: 'm0.M0-6.4',
  title: 'e and the natural log',
  minutes: 9, difficulty: 2,
  intro: t`Compound $100\%$ growth more and more often — yearly, monthly, daily, continuously — and the yearly factor $\left(1 + \tfrac1n\right)^n$ creeps up to a limit, the number $e \approx 2.71828$. The exponential $e^x$ is special: **its slope at every point equals its value**, which is why nature’s rates of change produce it. Its inverse is the **natural logarithm**, $\ln x = \log_e x$. Physics writes decay with a **time constant** $\tau$:

$$N(t) = N_0\,e^{-t/\tau}, \qquad t_{1/2} = \tau \ln 2$$

Every $\tau$ the quantity falls to $1/e \approx 37\%$; every half-life $t_{1/2} \approx 0.693\,\tau$ it halves.`,
  symbols: [
    { tex: 'e', text: 'Euler’s number, $2.71828\\ldots$: the limit of $(1 + 1/n)^n$ as $n \\to \\infty$' },
    { tex: 'N_0', text: 'the starting value' },
    { tex: '\\tau', text: 'the **time constant** (mean lifetime), in s: the time to fall by a factor of $e$' },
    { tex: 't_{1/2}', text: 'the **half-life**, in s: the time to fall by a factor of $2$' },
    { tex: '\\ln', text: 'the natural logarithm, base $e$; $\\ln 2 \\approx 0.693$' },
  ],
  why: t`Whenever a rate is proportional to the amount present — charge leaking through a resistor, gas through a leak, nuclei decaying, air thinning with height — the solution is $e^{kt}$. That is the differential equation $y' = ky$, which Calculus II and Differential Equations solve; this lesson is the algebra those courses assume.`,
  visual: {
    type: 'graph',
    title: 'Compounding more often approaches e',
    lead: t`The gold staircase is a quantity growing at rate $r$ per year, compounded $n$ times a year: $\left(1 + \tfrac{r}{n}\right)^{\text{steps}}$. The blue curve is continuous growth, $e^{rt}$. Raise $n$.`,
    tasks: [
      t`With $r = 1$ and $n = 1$: one jump, to $2$ after a year. At $n = 12$: $2.613$. At $n = 50$: $2.692$. The limit is $e = 2.718$.`,
      t`As $n$ grows the steps shrink and the staircase hugs the smooth curve $e^{rt}$ — continuous compounding.`,
      t`Change $r$: after one year the continuous factor is $e^{r}$; at $r = 0.05$ ($5\%$) it is $1.0513$, barely more than $1.05$.`,
    ],
    params: {
      x: [-0.05, 2.05], y: [0.8, 7.6], aspect: 'wide', xlabel: 't (years)', ylabel: 'growth factor',
      sliders: [
        { key: 'n', label: t`Compounding steps per year $n$`, min: 1, max: 50, step: 1, value: 1, explain: t`How many times a year the growth is added on.` },
        { key: 'r', label: t`Growth rate $r$ per year`, min: 0.05, max: 1, step: 0.05, value: 1, explain: t`The yearly rate as a fraction: $1$ means $100\%$.` },
      ],
      curves: [{ fn: '(1 + r/n)^floor(n*x + 1e-9)', color: 'gold', width: 2, domain: [0, 2] }, { fn: 'e^(r*x)', color: 'accent', domain: [0, 2] }],
      vlines: [{ x: 1, color: 'ink3', label: 'one year' }],
      readouts: [{ label: t`after one year, $(1 + r/n)^n$`, expr: '(1 + r/n)^n', digits: 5 }, { label: t`$e^{r}$`, expr: 'e^r', digits: 5 }],
    },
    caption: t`Exact. Vertical risers of the staircase are drawn as lines; the value jumps at each compounding step.`,
  },
  example: {
    prompt: t`In an atmosphere of one uniform temperature, pressure falls with height as $p = p_0\,e^{-z/H}$. For Earth take the scale height $H = 8.5$ km. Below what altitude is half of the air pressure left behind — that is, where is $p = p_0/2$?`,
    visual: { type: 'graph', params: { x: [-1, 30], y: [0, 1.1], aspect: 'wide', xlabel: 'z (km)', ylabel: 'p / p₀', curves: [{ fn: 'e^(-x/8.5)', color: 'accent', domain: [0, 30] }], hlines: [{ y: 0.5, color: 'gold', label: 'half' }, { y: N(1 / Math.E), color: 'ink3', label: '1/e' }], points: [{ x: N(8.5 * LN2), y: 0.5, color: 'gold', r: 5, label: '5.9 km', labelDx: 8, labelDy: -10 }, { x: 8.5, y: N(1 / Math.E), color: 'ink3', r: 4, label: 'H = 8.5 km', labelDx: 8, labelDy: 14 }] }, caption: t`The isothermal model. Pressure halves by $5.9$ km and falls to $1/e$ at one scale height. The real atmosphere’s temperature changes with height, so this is a first approximation.` },
    steps: [
      { label: 'Set up', text: t`$e^{-z/H} = \tfrac12$: the exponential must equal one half.` },
      { label: 'Take ln', text: t`$-\dfrac{z}{H} = \ln\tfrac12 = -\ln 2$, since $\ln$ undoes $e^{(\cdot)}$.` },
      { label: 'Solve', text: t`$z = H\ln 2 = 8.5 \times 0.693 = ${nice(sig(8.5 * LN2, 2))}$ km.` },
      { label: 'Interpret', text: t`That is the “half-life in height”: every $5.9$ km the pressure halves again. It is $\ln 2 \approx 0.69$ of the scale height, just as a half-life is $0.69$ of a time constant.` },
      { label: 'Sense check', text: t`Measured, the pressure at $5.5$ km is about half the sea-level value — and the summit of Everest ($8.8$ km) has about a third. The model is close.` },
    ],
    answer: t`$z = H\ln 2 \approx 5.9$ km.`,
  },
  practice: [
    num({
      id: 'compound-n', difficulty: 1,
      gen(r) {
        const n = r.pick([4, 12, 52, 365]), ans = (1 + 1 / n) ** n;
        const errors = [{ value: Math.E, feedback: t`$e$ is the limit as $n \to \infty$. For $n = ${n}$ the value is a little smaller.` }, { value: 2, feedback: t`That is compounding once a year. With $n = ${n}$ the growth is added in $${n}$ smaller steps that each earn on the last.` }].filter((e) => Math.abs(e.value - ans) > 4e-4 * ans);
        return {
          prompt: t`A quantity grows at $100\%$ a year, compounded $${n}$ times a year. By what factor has it grown after one year? Give 4 significant figures.`,
          answer: ans, tol: { rel: 2e-4 },
          errors,
          hints: [t`Each step multiplies by $1 + \tfrac{1}{${n}}$, and there are $${n}$ steps.`],
          teach: t`$(1 + 1/n)^n$ rises toward $e = 2.71828$ as compounding becomes continuous.`,
          explain: t`$\left(1 + \tfrac{1}{${n}}\right)^{${n}} = ${ans.toFixed(4)}$ — already close to $e = 2.7183$.`,
          visual: { type: 'graph', params: { x: [-0.03, 1.1], y: [0.9, 3], aspect: 'wide', xlabel: 't (years)', ylabel: 'factor', curves: [{ fn: `(1 + 1/${n})^floor(${n}*x + 1e-9)`, color: 'gold', width: 2, domain: [0, 1] }, { fn: 'e^x', color: 'accent', domain: [0, 1.1] }] }, caption: t`The staircase for $n = ${n}$ (gold) and continuous growth $e^t$ (blue).` },
        };
      },
    }),
    num({
      id: 'half-from-tau', difficulty: 1,
      gen(r) {
        const [name, tau, unit, uText] = r.pick([['a free neutron', 878.4, 's', 's'], ['a muon', 2.197, 'us', t`\mu\text{s}`], ['a charged pion', 26.03, 'ns', 'ns']]);
        const ans = tau * LN2;
        return {
          prompt: t`Particle lifetimes are quoted as mean lives $\tau$. ${name[0].toUpperCase() + name.slice(1)} has $\tau = ${tau}\ ${uText}$. What is its half-life?`,
          answer: ans, units: unit, tol: { rel: 0.005 },
          errors: [{ value: tau / LN2, feedback: t`The half-life is *shorter* than the mean life: $t_{1/2} = \tau\ln 2$, and $\ln 2 < 1$.` }, { value: tau / 2, feedback: t`Halving $\tau$ is not the half-life: solve $e^{-t/\tau} = \tfrac12$.` }],
          hints: [t`Set $e^{-t/\tau} = \tfrac12$ and take $\ln$.`, t`$t_{1/2} = \tau\ln 2$.`],
          teach: t`$t_{1/2} = \tau\ln 2 \approx 0.693\,\tau$.`,
          explain: t`$t_{1/2} = ${tau} \times 0.6931 = ${nice(sig(ans, 4))}\ ${uText}$.`,
          visual: decayTau(3, t`The fraction surviving against time in units of $\tau$; the half-life is where it crosses $\tfrac12$.`, 'surviving'),
        };
      },
    }),
    num({
      id: 'rc-fraction', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3, 5]), ans = 100 * Math.exp(-k);
        return {
          prompt: t`A high-voltage capacitor on a test stand is drained through a bleeder resistor, so $V = V_0\,e^{-t/\tau}$. What percentage of the starting voltage is left after $t = ${k}\tau$?`,
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * 2 ** -k, feedback: t`$(\tfrac12)^{${k}}$ is what is left after $${k}$ *half-lives*. A time constant cuts the voltage by $e$, not $2$.` }, ...(k < 5 ? [{ value: 100 * (1 - k / 5), feedback: t`Discharge is not linear: it removes a constant fraction per time constant.` }] : [])],
          hints: [t`$V/V_0 = e^{-${k}}$.`],
          teach: t`After $k$ time constants an exponential decay has $e^{-k}$ left: $37\%$, $14\%$, $5\%$, …, $0.7\%$ after $5\tau$.`,
          explain: t`$e^{-${k}} = ${nice(sig(ans / 100, 3))}$, so $${nice(sig(ans, 3))}\%$ remains. Engineers treat $5\tau$ (under $1\%$ left) as “discharged”.`,
          visual: decayTau(k, t`$V/V_0$ against time in units of $\tau$, with a dashed line at each whole $\tau$. Vertical scale hidden.`),
        };
      },
    }),
    num({
      id: 'mars-height', difficulty: 2,
      gen(r) {
        const [f, word] = r.pick([[0.5, 'half'], [0.25, 'a quarter'], [0.1, 'a tenth']]), H = 11.1, ans = H * Math.log(1 / f);
        return {
          prompt: t`Mars’s atmosphere has a scale height of $H = 11.1$ km: $p = p_0\,e^{-z/H}$. How high above the reference level is the pressure ${word} of its value there?`,
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: H * Math.log10(1 / f), feedback: t`Use the natural log: $e^{-z/H}$ is undone by $\ln$, not $\log_{10}$.` }, { value: H / f, feedback: t`Solve with a logarithm: $z = H\ln(1/${f})$.` }, { value: H * f, feedback: t`Solve with a logarithm: $z = H\ln(1/${f})$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$e^{-z/H} = ${f}$.`, t`$z = -H\ln ${f} = H\ln\dfrac{1}{${f}}$.`],
          teach: t`To solve $e^{-z/H} = f$, take $\ln$: $z = H\ln(1/f)$.`,
          explain: t`$z = 11.1 \times \ln ${nice(1 / f)} = 11.1 \times ${nice(sig(Math.log(1 / f), 3))} = ${nice(sig(ans, 3))}$ km.`,
          visual: { type: 'graph', params: { x: [-1, 40], y: [0, 1.1], aspect: 'wide', xlabel: 'z (km)', ylabel: 'p / p₀', xticks: 0, curves: [{ fn: 'e^(-x/11.1)', color: 'accent', domain: [0, 40] }], hlines: [{ y: f, color: 'gold', label: word }] }, caption: t`Isothermal model of Mars’s lower atmosphere; altitude scale hidden.` },
        };
      },
    }),
    mcq({
      id: 'own-slope', difficulty: 2,
      prompt: t`Which function has a slope equal to its own value at every point?`,
      visual: { type: 'graph', params: { x: [-2, 3.2], y: [-0.5, 8], aspect: 'wide', curves: [{ fn: '2^x', color: 'accent', label: 'y = 2ˣ', labelAt: 2.6, labelDx: -50, labelDy: 0 }], tangent: { fn: '2^x', at: 1.5 }, readouts: [{ label: 'height', expr: 'y0', digits: 4 }, { label: 'slope', expr: 'slope', digits: 4 }, { label: 'slope ÷ height', expr: 'slope/y0', digits: 4 }] }, caption: t`A tangent to $2^x$: drag its point. The ratio of slope to height stays fixed — but it is not $1$.` },
      choices: [t`$e^{x}$`, t`$2^{x}$`, t`$x^{e}$`, t`$e\,x$`],
      answer: 0,
      why: {
        1: t`Drag the tangent: the slope of $2^x$ is always $0.693$ times its height. That factor is $\ln 2$.`,
        2: t`A power function: its slope is $e\,x^{e - 1}$, which is not $x^e$.`,
        3: t`A straight line has the constant slope $e$, while its value changes.`,
      },
      hints: [t`For $b^x$ the slope is $(\ln b)\,b^x$. For which base is $\ln b = 1$?`],
      teach: t`$\dfrac{d}{dx}e^x = e^x$; for any other base, $\dfrac{d}{dx}b^x = (\ln b)\,b^x$.`,
      explain: t`The slope of $b^x$ is $\ln b$ times its height. Only $b = e$ makes that factor $1$ — which is the definition of $e$ a calculus course uses.`,
    }),
    num({
      id: 'base-to-e', difficulty: 3,
      gen(r) {
        const T = r.pick([2, 5, 8, 12]), ans = LN2 / T;
        return {
          prompt: t`A population doubles every $${T}$ hours: $N = N_0 \cdot 2^{t/${T}}$. Write it as $N_0\,e^{kt}$. What is the growth rate $k$, per hour?`,
          answer: ans, units: 'h^-1', tol: { rel: 0.005 },
          errors: [{ value: T * LN2, feedback: t`$2^{t/${T}} = e^{(t/${T})\ln 2}$, so $k = \ln 2 / ${T}$, not $${T}\ln 2$.` }, { value: 1 / T, feedback: t`$2^{t/${T}}$ is not $e^{t/${T}}$: changing the base from $2$ to $e$ brings in a factor $\ln 2$.` }, { value: 1 / (T * LN2), feedback: t`That is the time constant’s reciprocal upside down: $k = \ln 2 / ${T}$.` }],
          hints: [t`$2 = e^{\ln 2}$, so $2^{t/${T}} = e^{(\ln 2)\,t/${T}}$.`, t`Read off $k$ as the coefficient of $t$ in the exponent.`],
          teach: t`Any exponential converts to base $e$: $b^{x} = e^{x\ln b}$.`,
          explain: t`$2^{t/${T}} = e^{t\ln 2/${T}}$, so $k = \dfrac{\ln 2}{${T}} = ${nice(sig(ans, 3))}$ per hour. Conversely the doubling time is $\ln 2/k$.`,
          visual: { type: 'graph', params: { x: [-0.5, 3.2 * T], y: [0, 9.5], aspect: 'wide', xlabel: 't (h)', ylabel: 'N / N₀', curves: [{ fn: `2^(x/${T})`, color: 'accent', domain: [0, 3.2 * T] }], points: [1, 2, 3].map((k) => ({ x: k * T, y: 2 ** k, color: 'gold', r: 4.5 })) }, caption: t`Doubling every $${T}$ hours (gold dots). The same curve is $e^{kt}$ for one particular $k$.` },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-ln-simplify', difficulty: 2,
      prompt: t`Simplify $\ln\!\left(e^{2}\sqrt{e}\right)$.`,
      choices: [t`$\tfrac52$`, t`$e^{5/2}$`, t`$1$`, t`$2\sqrt{e}$`],
      answer: 0,
      why: {
        1: t`$\ln$ undoes $e^{(\cdot)}$: $\ln(e^{5/2}) = \tfrac52$, not $e^{5/2}$.`,
        2: t`Multiplying powers *adds* exponents: $e^2 \cdot e^{1/2} = e^{2 + 1/2}$, not $e^{2 \times 1/2}$.`,
        3: t`$\ln(e^2) = 2$ and $\ln\sqrt e = \tfrac12$; the log of a product is a sum of those, not a product of $2$ and $\sqrt e$.`,
      },
      hints: [t`Write $\sqrt e = e^{1/2}$.`],
      teach: t`$\ln(e^x) = x$: the natural log reads off the exponent of $e$.`,
      explain: t`$e^2\sqrt e = e^{2 + 1/2} = e^{5/2}$, and $\ln(e^{5/2}) = \tfrac52$.`,
    }),
    num({
      id: 'cp-blowdown', difficulty: 3, transfer: true,
      gen(r) {
        const P0 = r.pick([200, 250, 300]), f1 = r.pick([0.8, 0.75]), t1 = r.pick([5, 8, 10]), P1 = P0 * f1, P2 = r.pick([20, 30, 50]);
        const tau = t1 / Math.log(P0 / P1), ans = tau * Math.log(P0 / P2), lin = t1 * (P0 - P2) / (P0 - P1);
        return {
          prompt: t`A cold-gas thruster’s nitrogen tank vents through a stuck-open valve. Its pressure falls from $${P0}$ bar to $${nice(P1)}$ bar in $${t1}$ minutes, and the blowdown is exponential, $p = p_0\,e^{-t/\tau}$. How long after the start does it reach $${P2}$ bar?`,
          answer: ans, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: lin, feedback: t`That extrapolates a straight line. The pressure falls by a constant *factor* per minute, so the time to $${P2}$ bar is longer.` }, { value: tau, feedback: t`That is the time constant $\tau$. Now use it: $t = \tau\ln(${P0}/${P2})$.` }],
          hints: [t`First find $\tau$: $e^{-${t1}/\tau} = ${nice(P1 / P0)}$.`, t`$\tau = \dfrac{${t1}}{\ln(${P0}/${nice(P1)})}$.`, t`Then $t = \tau\ln\dfrac{${P0}}{${P2}}$.`],
          teach: t`Two points fix an exponential: one ratio gives $\tau$, and $\tau$ answers every other “how long”.`,
          explain: t`$\tau = \dfrac{${t1}}{\ln(${P0}/${nice(P1)})} = ${nice(sig(tau, 3))}$ min, so $t = ${nice(sig(tau, 3))} \times \ln\dfrac{${P0}}{${P2}} = ${nice(sig(ans, 3))}$ min. Real blowdowns cool the gas as it expands, which slows the fall a little.`,
          visual: { type: 'graph', params: { x: [-0.05 * ans, 1.2 * ans], y: [0, 1.12 * P0], aspect: 'wide', xlabel: 't (min)', ylabel: 'p (bar)', xticks: 0, points: [{ x: 0, y: P0, color: 'gold', r: 5, label: `${P0} bar`, labelDx: 8, labelDy: -8 }, { x: t1, y: P1, color: 'gold', r: 5, label: `${nice(P1)} bar at ${t1} min`, labelDx: 8, labelDy: -8 }], hlines: [{ y: P2, color: 'bad', label: `${P2} bar` }] }, caption: t`The two readings and the target pressure; time scale hidden.` },
        };
      },
    }),
    num({
      id: 'cp-rc-voltage', difficulty: 2,
      gen(r) {
        const R = r.pick([2.2, 4.7, 10]), C = r.pick([220, 470, 1000]), V0 = 28, tt = r.pick([1, 2, 5]);
        const tau = R * 1e3 * C * 1e-6, ans = V0 * Math.exp(-tt / tau);
        return {
          prompt: t`A $${C}\ \mu\text{F}$ capacitor charged to a spacecraft’s $28$ V bus is discharged through a $${R}\ \text{k}\Omega$ resistor: $V = V_0\,e^{-t/RC}$. What is its voltage after $${tt}$ s?`,
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: V0 * 2 ** (-tt / tau), feedback: t`$RC$ is a time constant, not a half-life: use $e^{-t/RC}$, not $2^{-t/RC}$.` }, { value: V0 * Math.exp(-tt * tau), feedback: t`The exponent is $-t/(RC)$: divide by $RC$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$RC = ${R} \times 10^{3}\ \Omega \times ${C} \times 10^{-6}\ \text{F} = ${nice(sig(tau, 3))}$ s.`, t`$V = 28\,e^{-${tt}/${nice(sig(tau, 3))}}$.`],
          teach: t`The product $RC$ of resistance and capacitance is a time, in seconds: the circuit’s time constant.`,
          explain: t`$\tau = RC = ${nice(sig(tau, 3))}$ s, so $V = 28\,e^{-${tt}/${nice(sig(tau, 3))}} = ${nice(sig(ans, 3))}$ V.`,
          visual: { type: 'em-circuit', params: { circuit: 'rc', opts: { net: 'single' }, values: { E: 28, R: R * 1e3, C: C * 1e-6 }, switches: { mode: 'discharge' }, graph: false, readout: false }, caption: t`The discharge circuit: the capacitor drains through the resistor. Ideal components.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §4.1 Exponential Functions (the number e)', url: 'https://openstax.org/books/precalculus-2e/pages/4-1-exponential-functions' },
    { label: 'Particle Data Group, Review of Particle Physics (neutron, muon and pion mean lives)', url: 'https://pdg.lbl.gov/' },
    { label: 'NASA Earth and Mars Fact Sheets (scale heights)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
