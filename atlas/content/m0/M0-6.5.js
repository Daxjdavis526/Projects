// Log scales and log–log plots — power laws become straight lines whose slope is the exponent.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';

const t = String.raw;
const L10 = Math.log10;
// planets: semi-major axis (AU), period (yr) — NASA planetary fact sheets
const PLANETS = [['Mercury', 0.387, 0.2408], ['Venus', 0.723, 0.6152], ['Earth', 1, 1], ['Mars', 1.524, 1.8808], ['Jupiter', 5.203, 11.862], ['Saturn', 9.537, 29.457], ['Uranus', 19.19, 84.01], ['Neptune', 30.07, 164.8]];
// Galilean moons: semi-major axis (thousand km), period (days) — NASA/JPL
const MOONS = [['Io', 421.8, 1.769], ['Europa', 671.1, 3.551], ['Ganymede', 1070.4, 7.155], ['Callisto', 1882.7, 16.689]];
// TRAPPIST-1 planets: period (d), semi-major axis (AU) — Agol et al. 2021
const TRAPPIST = { b: [1.510826, 0.01154], c: [2.421937, 0.01580], d: [4.049219, 0.02227], e: [6.101013, 0.02925], f: [9.20754, 0.03849], g: [12.352446, 0.04683], h: [18.772866, 0.06189] };
const sup = (n) => String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);

export default lesson({
  id: 'm0.M0-6.5',
  title: 'Log scales and log–log plots',
  minutes: 10, difficulty: 3,
  intro: t`On a **logarithmic axis** equal distances are equal *factors*: $1 \to 10 \to 100$ are evenly spaced. Take logs of a power law and it becomes a straight line:

$$y = C\,x^{p} \iff \log y = \log C + p\,\log x$$

So data that follow a power law fall on a straight line on **log–log** axes, and the line’s **slope is the exponent** $p$ — read it as decades of $y$ per decade of $x$. An exponential, $y = A\,e^{kx}$, is straight on **semi-log** axes instead ($\log y$ against plain $x$). Logs also make scales: the decibel, $L = 10\log_{10}(I/I_0)$, turns a factor of $10$ in intensity into a step of $10$ dB.`,
  symbols: [
    { tex: 'x,\\ y', text: 'the two measured quantities, each with its units (the logs are taken of their numerical values in fixed units)' },
    { tex: 'C', text: 'the coefficient: the value of $y$ at $x = 1$; it sets the line’s height' },
    { tex: 'p', text: 'the **exponent**: the slope of the line on log–log axes, a pure number' },
    { tex: '\\log', text: 'a logarithm in any one base (the slope is the same in every base)' },
  ],
  why: t`Nature is full of power laws — Kepler’s third law, inverse-square fields, drag rising as $v^2$, stellar luminosity — and a log–log plot is how you find them and measure their exponents from data. It is also how you read any graph whose axes say $10$, $100$, $1000$.`,
  visual: {
    type: 'graph',
    title: 'Kepler’s third law on log–log axes',
    lead: t`The eight planets, placed by $\log_{10}$ of their orbit size $a$ (in AU) and period $T$ (in years). The dashed line is $T = a^{p}$; tilt it with the slope $p$ until it fits.`,
    tasks: [
      t`At $p = 1$ the line misses the outer planets badly. At $p = 1.5$ it threads all eight: $T \propto a^{3/2}$, Kepler’s $T^2 \propto a^3$.`,
      t`Neptune is $30$ times farther out than Earth: $1.48$ decades. At slope $1.5$ that is $2.22$ decades of period: $10^{2.22} \approx 165$ years.`,
      t`Every planet spans the same plot whether it is $0.4$ or $30$ AU out: log axes make factors visible across scales.`,
    ],
    params: {
      x: [-0.6, 1.7], y: [-0.9, 2.5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'a (AU)', ylabel: 'T (years)',
      sliders: [{ key: 'p', label: t`Slope $p$ of the line`, min: 0.5, max: 2.5, step: 0.05, value: 1, explain: t`The exponent in $T = a^p$: decades of period per decade of distance.` }],
      curves: [{ fn: 'p*x', color: 'gold', dash: true }],
      points: PLANETS.map(([name, a, T], i) => ({ x: N(L10(a)), y: N(L10(T)), color: 'accent', r: 5, label: name, labelDx: i % 2 ? 8 : -60, labelDy: i % 2 ? 14 : -8 })),
      readouts: [{ label: t`slope $p$`, expr: 'p', digits: 3 }, { label: t`predicted Neptune period (yr)`, expr: '30.07^p', digits: 3 }],
    },
    caption: t`Real orbital data (NASA fact sheets). Kepler’s law holds this well because the planets are far lighter than the Sun.`,
  },
  example: {
    prompt: t`Io orbits Jupiter at $421\,800$ km with a period of $1.769$ days; Callisto at $1\,882\,700$ km with $16.689$ days. Assuming $T = C\,a^{p}$, find the exponent $p$.`,
    visual: { type: 'graph', params: { x: [2.5, 3.4], y: [0.1, 1.35], xlog: true, ylog: true, aspect: 'wide', xlabel: 'a (thousand km)', ylabel: 'T (days)', curves: [{ fn: `${N(L10(MOONS[0][2]))} + 1.5*(x - ${N(L10(MOONS[0][1]))})`, color: 'gold', dash: true }], points: MOONS.map(([name, a, T]) => ({ x: N(L10(a)), y: N(L10(T)), color: 'accent', r: 5, label: name, labelDx: 8, labelDy: 12 })) }, caption: t`Jupiter’s four large moons on log–log axes, with a line of slope $1.5$ through Io (dashed). Data: NASA/JPL.` },
    steps: [
      { label: 'Take logs', text: t`$\log T = \log C + p\log a$: on log–log axes the moons lie on a line of slope $p$.` },
      { label: 'Slope from two points', text: t`$p = \dfrac{\log T_2 - \log T_1}{\log a_2 - \log a_1} = \dfrac{\log(T_2/T_1)}{\log(a_2/a_1)}$ — only ratios matter, so the units drop out.` },
      { label: 'Ratios', text: t`$T_2/T_1 = 16.689/1.769 = ${nice(sig(MOONS[3][2] / MOONS[0][2], 4))}$ and $a_2/a_1 = 1\,882\,700/421\,800 = ${nice(sig(MOONS[3][1] / MOONS[0][1], 4))}$.` },
      { label: 'Divide', text: t`$p = \dfrac{\log ${nice(sig(MOONS[3][2] / MOONS[0][2], 4))}}{\log ${nice(sig(MOONS[3][1] / MOONS[0][1], 4))}} = \dfrac{${nice(sig(L10(MOONS[3][2] / MOONS[0][2]), 4))}}{${nice(sig(L10(MOONS[3][1] / MOONS[0][1]), 4))}} = ${nice(sig(Math.log(MOONS[3][2] / MOONS[0][2]) / Math.log(MOONS[3][1] / MOONS[0][1]), 4))}$.` },
      { label: 'Sense check', text: t`$p = 1.5$ again: Kepler’s third law holds for moons around Jupiter just as for planets around the Sun. Only $C$ differs, because it depends on the central mass.` },
    ],
    answer: t`$p \approx 1.500$, so $T \propto a^{3/2}$.`,
  },
  practice: [
    num({
      id: 'slope-two-points', difficulty: 2,
      gen(r) {
        const c = r.pick([
          { p: 2, what: t`A wind-tunnel balance measures the drag on a rocket model`, x: 'v', xu: t`\text{m/s}`, y: 'F', yu: t`\text{N}`, per: 'newtons per m/s', xs: [20, 60], C: 0.008 },
          { p: 3, what: t`A small wind turbine’s power output is logged`, x: 'v', xu: t`\text{m/s}`, y: 'P', yu: t`\text{W}`, per: 'watts per m/s', xs: [4, 10], C: 1.2 },
          { p: 0.5, what: t`Pendulums of different lengths are timed`, x: 'L', xu: t`\text{m}`, y: 'T', yu: t`\text{s}`, per: 'seconds per metre', xs: [0.25, 4], C: 2.006 },
          { p: -2, what: t`A radiometer measures a lamp’s intensity at two distances`, x: 'r', xu: t`\text{m}`, y: 'I', yu: t`\text{W/m}^2`, per: 'W/m² per metre', xs: [0.5, 2], C: 12 },
        ]);
        const [x1, x2] = c.xs, y1 = sig(c.C * x1 ** c.p, 3), y2 = sig(c.C * x2 ** c.p, 3), ans = Math.log(y2 / y1) / Math.log(x2 / x1);
        return {
          prompt: t`${c.what}: $${c.y} = ${y1}\ ${c.yu}$ at $${c.x} = ${x1}\ ${c.xu}$, and $${c.y} = ${y2}\ ${c.yu}$ at $${c.x} = ${x2}\ ${c.xu}$. If $${c.y} \propto ${c.x}^{p}$, what is $p$?`,
          answer: c.p, tol: { rel: 0, abs: 0.03 },
          errors: [{ value: (y2 - y1) / (x2 - x1), feedback: t`That is the slope on *linear* axes, in ${c.per}. The exponent is the slope of $\log ${c.y}$ against $\log ${c.x}$.` }, { value: (y2 / y1) / (x2 / x1), feedback: t`Take logs of the two ratios before dividing: $p = \log(${c.y}_2/${c.y}_1)/\log(${c.x}_2/${c.x}_1)$.` }].filter((e) => Math.abs(e.value - c.p) > 0.05),
          hints: [t`$p = \dfrac{\log(${c.y}_2/${c.y}_1)}{\log(${c.x}_2/${c.x}_1)}$.`, t`The ratios are $${nice(sig(y2 / y1, 4))}$ and $${nice(x2 / x1)}$.`],
          teach: t`The exponent of a power law is the slope on log–log axes: $\log$ of the $y$ ratio over $\log$ of the $x$ ratio.`,
          explain: t`$p = \dfrac{\log ${nice(sig(y2 / y1, 4))}}{\log ${nice(x2 / x1)}} = ${nice(sig(ans, 3))}$, so $${c.y} \propto ${c.x}^{${c.p}}$.`,
          visual: { type: 'graph', params: { x: [L10(x1) - 0.4, L10(x2) + 0.4], y: [Math.min(L10(y1), L10(y2)) - 0.6, Math.max(L10(y1), L10(y2)) + 0.6], xlog: true, ylog: true, aspect: 'wide', xlabel: c.x, ylabel: c.y, points: [{ x: N(L10(x1)), y: N(L10(y1)), color: 'gold', r: 5 }, { x: N(L10(x2)), y: N(L10(y2)), color: 'gold', r: 5 }] }, caption: t`The two measurements on log–log axes; the exponent is the slope of the line through them.` },
        };
      },
    }),
    mcq({
      id: 'which-axes', difficulty: 1,
      prompt: t`A radioactive sample’s count rate is recorded every hour, and it decays exponentially. On which axes would the data fall on a straight line?`,
      visual: { type: 'graph', params: { x: [-0.3, 10.5], y: [0, 1100], aspect: 'wide', xlabel: 't (h)', ylabel: 'counts/s', points: Array.from({ length: 11 }, (_, k) => ({ x: k, y: N(1000 * Math.exp(-0.35 * k)), color: 'gold', r: 4.5 })) }, caption: t`The data on ordinary linear axes: clearly curved.` },
      choices: ['log of the count rate against plain time (semi-log)', 'log of the count rate against log of time (log–log)', 'plain count rate against log of time', 'none: exponential data are never straight'],
      answer: 0,
      why: {
        1: t`Log–log straightens *power laws*, $y = Cx^p$. Here $\ln y = \ln A - kt$ is linear in $t$ itself, not in $\log t$.`,
        2: t`That straightens a logarithm, $y = a + b\log t$, not an exponential.`,
        3: t`Taking the log of the count rate does straighten it: $\ln N = \ln N_0 - kt$.`,
      },
      hints: [t`Take $\ln$ of $N = N_0\,e^{-kt}$. What is $\ln N$ a linear function of?`],
      teach: t`Exponentials are straight on semi-log axes; power laws are straight on log–log axes.`,
      explain: t`$\ln N = \ln N_0 - kt$: a straight line in $t$ with slope $-k$. That is why decay data are plotted with a logarithmic vertical axis and a linear time axis.`,
    }),
    num({
      id: 'decibels', difficulty: 2,
      gen(r) {
        const dL = r.pick([10, 20, 30, 3, 6]), ans = 10 ** (dL / 10);
        return {
          prompt: t`A microphone $1$ km from a rocket test stand reads $${dL}$ dB higher when the engine throttles up. Since $L = 10\log_{10}(I/I_0)$, by what factor did the sound intensity $I$ increase?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: dL / 10, feedback: t`$${dL}/10 = ${nice(dL / 10)}$ is the change in $\log_{10} I$. Undo the log: $10^{${nice(dL / 10)}}$.` }, { value: dL, feedback: t`Decibels are a logarithmic scale: $${dL}$ dB is not $${dL}$ times.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\Delta L = 10\log_{10}\dfrac{I_2}{I_1}$, so $\log_{10}\dfrac{I_2}{I_1} = \dfrac{${dL}}{10}$.`],
          teach: t`Every $10$ dB is a factor of $10$ in intensity; $3$ dB is about a factor of $2$.`,
          explain: t`$\dfrac{I_2}{I_1} = 10^{${dL}/10} = ${nice(sig(ans, 3))}$.${dL === 3 || dL === 6 ? t` That is why $3$ dB is called a doubling.` : ''}`,
          visual: { type: 'graph', params: { x: [-0.2, 3.2], y: [-3, 33], xlog: true, aspect: 'wide', xlabel: 'intensity ratio I / I₀', ylabel: 'L (dB)', curves: [{ fn: '10*x', color: 'accent' }] }, caption: t`Sound level against intensity ratio, on a logarithmic intensity axis: a straight line, $10$ dB per factor of ten.` },
        };
      },
    }),
    mcq({
      id: 'log-midpoint', difficulty: 2,
      gen(r) {
        const a = r.int(1, 2), b = a + 2 * r.int(1, 2), m = (a + b) / 2;
        const fmt = (k) => (k === 0 ? '1' : k === 1 ? '10' : t`10^{${k}}`);
        return {
          prompt: t`On a logarithmic axis, which number sits exactly halfway between $${fmt(a)}$ and $${fmt(b)}$?`,
          visual: { type: 'graph', params: { x: [a - 0.5, b + 0.5], y: [-1, 1], xlog: true, aspect: 'wide', xlabel: '', ylabel: '', yticks: 0, points: [{ x: a, y: 0, color: 'accent', r: 5 }, { x: b, y: 0, color: 'accent', r: 5 }, { x: m, y: 0, color: 'violet', r: 6, label: '?', labelAlign: 'center', labelDx: 0, labelDy: -18 }] }, caption: t`The two numbers on a logarithmic axis, and the point halfway between them.` },
          choices: [t`$${fmt(m)}$`, t`$${thou((10 ** a + 10 ** b) / 2)}$`, t`$${fmt((b - a) / 2)}$`, t`$${fmt(a + b)}$`],
          answer: 0,
          why: {
            1: t`That is the ordinary average, the midpoint on a *linear* axis. On a log axis the midpoint averages the exponents: the geometric mean.`,
            2: t`Half the *distance* is $${(b - a) / 2}$ decades, but it is measured from $${fmt(a)}$, not from $1$.`,
            3: t`$10^{${a + b}}$ is the product of the two numbers — far beyond both.`,
          },
          hints: [t`Positions on a log axis are the exponents: $${a}$ and $${b}$.`],
          teach: t`Halfway on a log axis is the geometric mean, $\sqrt{xy}$: average the logarithms, not the numbers.`,
          explain: t`The exponents $${a}$ and $${b}$ average to $${m}$, so the midpoint is $10^{${m}}$ $= \sqrt{${fmt(a)} \times ${fmt(b)}}$. Reading a log axis as if it were linear is a classic misreading.`,
        };
      },
    }),
    num({
      id: 'semilog-half-life', difficulty: 3,
      gen(r) {
        const T = r.pick([2.5, 4, 6, 8]), N1 = r.pick([5000, 8000, 12000]), t1 = 1, dt = r.pick([5, 8, 10]);
        const t2 = t1 + dt, N2 = Math.round(N1 * 2 ** (-dt / T));
        const ans = dt * Math.LN2 / Math.log(N1 / N2);
        return {
          prompt: t`Counts from a short-lived isotope, plotted on semi-log axes, fall on a straight line passing through $${N1}$ counts/s at $t = ${t1}$ h and $${N2}$ counts/s at $t = ${t2}$ h. What is the half-life?`,
          answer: ans, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: dt / Math.log(N1 / N2), feedback: t`That is the time constant $\tau = 1/k$. The half-life is $\tau\ln 2$.` }, { value: dt * (N2 / N1) * 2, feedback: t`Find the decay constant from the logs: $k = \ln(N_1/N_2)/\Delta t$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The slope of $\ln N$ against $t$ is $-k = \dfrac{\ln N_2 - \ln N_1}{t_2 - t_1}$.`, t`$k = \dfrac{\ln(${N1}/${N2})}{${dt}\ \text{h}}$.`, t`$t_{1/2} = \dfrac{\ln 2}{k}$.`],
          teach: t`On semi-log axes the slope of an exponential decay gives its rate $k$, and $t_{1/2} = \ln 2/k$.`,
          explain: t`$k = \dfrac{\ln(${N1}/${N2})}{${dt}} = ${nice(sig(Math.log(N1 / N2) / dt, 3))}\ \text{h}^{-1}$, so $t_{1/2} = \dfrac{0.693}{k} = ${nice(sig(ans, 3))}$ h.`,
          visual: { type: 'graph', params: { x: [0, t2 + 2], y: [L10(N2) - 0.5, L10(N1) + 0.5], ylog: true, aspect: 'wide', xlabel: 't (h)', ylabel: 'counts/s', curves: [{ fn: `${N(L10(N1))} - ${N(L10(2) / T)}*(x - ${t1})`, color: 'accent', domain: [0, t2 + 2] }], points: [{ x: t1, y: N(L10(N1)), color: 'gold', r: 5, label: `${N1}`, labelDx: 8, labelDy: -8 }, { x: t2, y: N(L10(N2)), color: 'gold', r: 5, label: `${N2}`, labelDx: 8, labelDy: -8 }] }, caption: t`Count rate on a logarithmic axis against time: exponential decay is a straight line.` },
        };
      },
    }),
    mcq({
      id: 'read-exponent', difficulty: 2,
      gen(r) {
        const [dy, dx] = r.pick([[3, 2], [2, 4], [1, 2], [4, 2]]), s = -1, p = s * dy / dx;
        return {
          prompt: t`On log–log axes a straight line falls ${dy} decade${dy > 1 ? 's' : ''} in $y$ over ${dx} decades in $x$. So $y \propto x^{p}$ with $p = $`,
          visual: { type: 'graph', params: { x: [-0.3, dx + 0.3], y: [-0.3, dy + 0.3], xlog: true, ylog: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ fn: `${dy} - ${N(dy / dx)}*x`, color: 'accent', domain: [0, dx] }] }, caption: t`The line on log–log axes; each grid step is a factor of $10$.` },
          choices: [t`$${nice(p)}$`, t`$${nice(-dx / dy)}$`, t`$${nice(-p)}$`, t`$${nice(-(10 ** dy) / 10 ** dx)}$`],
          answer: 0,
          why: {
            1: t`Slope is rise over run: decades of $y$ over decades of $x$, $${dy}/${dx}$, not $${dx}/${dy}$.`,
            2: t`The line falls, so $y$ shrinks as $x$ grows: the exponent is negative.`,
            3: t`That divides the raw factors $10^{${dy}}/10^{${dx}}$. On log axes the slope is a ratio of *exponents*.`,
          },
          hints: [t`The slope on log–log axes is $\Delta\log y / \Delta\log x$, counted in decades.`],
          teach: t`Read a log–log slope in decades: decades of $y$ per decade of $x$ is the exponent.`,
          explain: t`$p = -${dy}/${dx} = ${nice(p)}$.${p === -2 ? ' An inverse-square law.' : ''}`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-exponent', difficulty: 3,
      gen(r) {
        const c = r.pick([
          { p: 3.5, what: t`For Sun-like main-sequence stars, luminosity roughly follows a power of mass. A star of $1.5$ solar masses is about $${nice(sig(1.5 ** 3.5, 3))}$ times as luminous as the Sun; one of $6$ solar masses about $${nice(sig(6 ** 3.5, 3))}$ times.`, x1: 1.5, x2: 6, y1: sig(1.5 ** 3.5, 3), y2: sig(6 ** 3.5, 3), q: t`L \propto M^{p}` },
          { p: -0.5, what: t`Escape speed from Earth scales as a power of the distance from its centre: $11.2$ km/s at the surface ($1$ Earth radius) and $${nice(sig(11.2 / 2, 3))}$ km/s at $4$ Earth radii.`, x1: 1, x2: 4, y1: 11.2, y2: sig(11.2 / 2, 3), q: t`v \propto r^{p}` },
          { p: 1.5, what: t`A satellite at orbit radius $7000$ km has a period of $${nice(sig(2 * Math.PI * Math.sqrt(7e6 ** 3 / 3.986e14) / 60, 3))}$ min; one at $42\,000$ km has $${nice(sig(2 * Math.PI * Math.sqrt(4.2e7 ** 3 / 3.986e14) / 60, 4))}$ min.`, x1: 7000, x2: 42000, y1: sig(2 * Math.PI * Math.sqrt(7e6 ** 3 / 3.986e14) / 60, 3), y2: sig(2 * Math.PI * Math.sqrt(4.2e7 ** 3 / 3.986e14) / 60, 4), q: t`T \propto a^{p}` },
        ]);
        const ans = Math.log(c.y2 / c.y1) / Math.log(c.x2 / c.x1);
        return {
          prompt: t`${c.what} Assuming $${c.q}$, find $p$.`,
          answer: ans, tol: { rel: 0, abs: 0.03 },
          errors: [{ value: (c.y2 - c.y1) / (c.x2 - c.x1), feedback: t`That is a linear slope. The exponent is $\log(y_2/y_1)/\log(x_2/x_1)$.` }].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: [t`$p = \log(y_2/y_1) / \log(x_2/x_1)$.`, t`The ratios: $${nice(sig(c.y2 / c.y1, 4))}$ and $${nice(c.x2 / c.x1)}$.`],
          teach: t`Two points on a power law fix its exponent: the log of one ratio over the log of the other.`,
          explain: t`$p = \dfrac{\log ${nice(sig(c.y2 / c.y1, 4))}}{\log ${nice(c.x2 / c.x1)}} = ${nice(sig(ans, 3))}$.${c.p === 3.5 ? ' The real mass–luminosity relation bends: this exponent is a fit for a limited range of masses.' : ''}`,
          visual: { type: 'graph', params: { x: [L10(c.x1) - 0.4, L10(c.x2) + 0.4], y: [Math.min(L10(c.y1), L10(c.y2)) - 0.5, Math.max(L10(c.y1), L10(c.y2)) + 0.5], xlog: true, ylog: true, aspect: 'wide', xlabel: '', ylabel: '', points: [{ x: N(L10(c.x1)), y: N(L10(c.y1)), color: 'gold', r: 5 }, { x: N(L10(c.x2)), y: N(L10(c.y2)), color: 'gold', r: 5 }] }, caption: t`The two data points on log–log axes.` },
        };
      },
    }),
    num({
      id: 'cp-trappist', difficulty: 3, transfer: true,
      gen(r) {
        const [i, j] = r.pick([['b', 'h'], ['c', 'g'], ['b', 'f'], ['d', 'h']]);
        const [P1, a1] = TRAPPIST[i], [P2, a2] = TRAPPIST[j], ans = Math.log(P2 / P1) / Math.log(a2 / a1);
        return {
          prompt: t`The seven planets of TRAPPIST-1, a cool dwarf star $40$ light-years away, were found by the dips they make crossing its face. Planet ${i} orbits at $a = ${a1}$ AU with period $${P1}$ days; planet ${j} at $${a2}$ AU with $${P2}$ days. Find the exponent $p$ in $P \propto a^{p}$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: Math.log(a2 / a1) / Math.log(P2 / P1), feedback: t`Upside down: the exponent is $\log$ of the period ratio over $\log$ of the distance ratio.` }, { value: (P2 - P1) / (a2 - a1), feedback: t`That is a linear slope, in days per AU. Use the logs of the ratios.` }],
          hints: [t`$p = \dfrac{\log(P_2/P_1)}{\log(a_2/a_1)}$.`, t`$P_2/P_1 = ${nice(sig(P2 / P1, 4))}$, $a_2/a_1 = ${nice(sig(a2 / a1, 4))}$.`],
          teach: t`Kepler’s third law gives $p = 3/2$ for any system of light bodies orbiting one heavy one.`,
          explain: t`$p = \dfrac{\log ${nice(sig(P2 / P1, 4))}}{\log ${nice(sig(a2 / a1, 4))}} = ${nice(sig(ans, 4))}$ — Kepler’s $3/2$, around a star about $11$ times lighter than the Sun and in orbits smaller than Mercury’s.`,
          visual: { type: 'graph', params: { x: [-2.05, -1.1], y: [0, 1.4], xlog: true, ylog: true, aspect: 'wide', xlabel: 'a (AU)', ylabel: 'P (days)', points: Object.entries(TRAPPIST).map(([k, [P, a]]) => ({ x: N(L10(a)), y: N(L10(P)), color: k === i || k === j ? 'gold' : 'accent', r: k === i || k === j ? 6 : 4.5, label: k, labelDx: -14, labelDy: -8 })) }, caption: t`All seven TRAPPIST-1 planets on log–log axes (Agol et al. 2021); the two in the question are gold.` },
        };
      },
    }),
    mcq({
      id: 'cp-semilog-rise', difficulty: 2,
      gen(r) {
        const s = r.pick([2, 4, 5]);
        return {
          prompt: t`On semi-log axes ($\log_{10} y$ against plain $x$), data rise along a straight line, climbing one decade for every $${s}$ units of $x$. Which function fits?`,
          visual: { type: 'graph', params: { x: [-0.5, 3 * s + 0.5], y: [-0.3, 3.3], ylog: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ fn: `x/${s}`, color: 'accent', domain: [0, 3 * s] }] }, caption: t`A straight line on a logarithmic $y$ axis and a linear $x$ axis.` },
          choices: [t`$y = A \cdot 10^{x/${s}}$`, t`$y = A\,x^{${s}}$`, t`$y = A\,x^{1/${s}}$`, t`$y = A + x/${s}$`],
          answer: 0,
          why: {
            1: t`A power law is straight on log–log axes. Here $x$ is on a plain axis, so the line means $\log y$ is linear in $x$ itself.`,
            2: t`Also a power law, and it would rise ever more slowly. A straight line on semi-log axes is an exponential.`,
            3: t`That is straight on *linear* axes. On a log axis it would bend over.`,
          },
          hints: [t`A straight line here says $\log_{10} y = \log_{10} A + x/${s}$. Undo the log.`],
          teach: t`Straight on semi-log axes means exponential: $\log y$ linear in $x$.`,
          explain: t`$\log_{10} y = \log_{10} A + \tfrac{x}{${s}}$ gives $y = A \cdot 10^{x/${s}}$: a factor of $10$ every $${s}$ units of $x$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §4.8 Fitting Exponential Models to Data', url: 'https://openstax.org/books/precalculus-2e/pages/4-8-fitting-exponential-models-to-data' },
    { label: 'NASA Planetary Fact Sheet (orbital semi-major axes and periods)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    { label: 'Agol et al. (2021), Refining the transit-timing and photometric analysis of TRAPPIST-1, Planet. Sci. J. 2, 1', url: 'https://doi.org/10.3847/PSJ/abd022' },
  ],
});
