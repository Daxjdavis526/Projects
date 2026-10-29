// Exponential growth and decay — equal steps in time multiply by equal factors.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, bars, thou } from './_m0kit.js';

const t = String.raw;
// a few real half-lives (NNDC NuDat)
const ISOTOPES = [
  { name: 'iodine-131', T: 8.02, unit: 'd', word: 'days' },
  { name: 'cobalt-60', T: 5.27, unit: 'yr', word: 'years' },
  { name: 'strontium-90', T: 28.8, unit: 'yr', word: 'years' },
  { name: 'radon-222', T: 3.82, unit: 'd', word: 'days' },
];
// a decay curve with half-life marks (time axis in the isotope's unit)
const decayFig = (A0, T, n, xlabel, caption) => ({
  type: 'graph',
  params: { x: [-0.2 * T, (n + 1.3) * T], y: [-0.06 * A0, 1.15 * A0], aspect: 'wide', xlabel, ylabel: 'activity', yticks: 0,
    curves: [{ fn: `${A0}*2^(-x/${T})`, color: 'accent', domain: [0, (n + 1.3) * T] }],
    vlines: Array.from({ length: n }, (_, k) => ({ x: N((k + 1) * T), color: 'ink3' })) },
  caption,
});

export default lesson({
  id: 'm0.M0-6.1',
  title: 'Exponential growth and decay',
  minutes: 8, difficulty: 2,
  intro: t`A quantity grows or decays **exponentially** when every equal step in time multiplies it by the same factor. Linear change adds the same *amount* each step; exponential change multiplies by the same *ratio*:

$$N(t) = N_0\, b^{\,t/T}$$

After one step $T$ the quantity is $N_0 b$, after two $N_0 b^2$, and so on. With $b = 2$ and $T$ the **doubling time** it grows; with $b = \tfrac12$ and $T$ the **half-life** it decays. A growth of $r$ per cent per year is $b = 1 + r/100$ with $T = 1$ year.`,
  symbols: [
    { tex: 'N(t)', text: 'the quantity at time $t$: atoms, satellites, pascals, volts — in its own units' },
    { tex: 'N_0', text: 'the starting value, $N(0)$' },
    { tex: 'b', text: 'the **growth factor** per step: $b > 1$ grows, $0 < b < 1$ decays' },
    { tex: 'T', text: 'the length of one step: the doubling time, the half-life, or one year — the time it takes to multiply by $b$' },
    { tex: 't', text: 'elapsed time, in the same units as $T$; $t/T$ counts the steps' },
  ],
  why: t`Radioactive decay, a discharging capacitor, the thinning of an atmosphere with height, compound interest and the spread of a fleet of satellites all multiply by constant factors. Recognising that pattern is what lets you predict them — and the fact that exponentials outrun every straight line is why they surprise people.`,
  visual: {
    type: 'graph',
    title: 'Multiplying versus adding',
    lead: t`The blue curve is $N(t) = N_0\,b^{\,t/T}$, starting from $N_0 = 100$ when doubling and $800$ when halving; the gold dots mark each step $T$. The dashed line is a linear model that matches the first step and then keeps adding the same amount.`,
    tasks: [
      t`Doubling: $100 \to 200 \to 400 \to 800$. The dashed line adds $100$ per step and falls further behind every time.`,
      t`Switch to halving: $800 \to 400 \to 200 \to 100$. The linear model hits zero after two steps; the exponential never reaches zero.`,
      t`Change $T$: the shape does not change, it only stretches sideways — $b^{t/T}$ is the same curve with time measured in steps.`,
    ],
    params: {
      x: [-0.3, 10], y: [-60, 1000], aspect: 'wide', xlabel: 't', ylabel: 'N',
      choices: [{ key: 'b', label: t`Factor per step $b$`, options: [[2, 'doubling, b = 2'], [0.5, 'halving, b = ½']], value: 2, explain: 'What one step does to the quantity.' }],
      sliders: [{ key: 'T', label: t`Step length $T$`, min: 1, max: 4, step: 0.1, value: 2.5, explain: t`The doubling time or half-life: how long one multiplication by $b$ takes.` }],
      curves: [{ fn: '(100 + 700*step(1 - b))*b^(x/T)', color: 'accent', domain: [0, 10] }, { fn: '(100 + 700*step(1 - b))*(1 + (b - 1)*x/T)', color: 'ink3', dash: true, domain: [0, 10] }],
      points: [0, 1, 2, 3].map((k) => ({ x: `${k}*T`, y: `(100 + 700*step(1 - b))*b^${k}`, color: 'gold', r: 5 })),
      readouts: [{ label: t`$N(3T)$`, expr: '(100 + 700*step(1 - b))*b^3', digits: 4 }, { label: t`linear model at $3T$`, expr: '(100 + 700*step(1 - b))*(1 + 3*(b - 1))', digits: 4 }],
    },
    caption: t`Exact curves. A negative value from the linear model, as for halving at $3T$, is the model failing: a quantity cannot drop below zero.`,
  },
  example: {
    prompt: t`A broadband satellite constellation has $1200$ satellites in orbit and grows by $35\%$ a year. If that rate held, how many would it have after $5$ years?`,
    visual: bars({ values: [0, 1, 2, 3, 4, 5].map((n) => 1200 * 1.35 ** n), k0: 0, labels: [0, 1, 2, 3, 4, 5].map((n) => String(Math.round(1200 * 1.35 ** n))), xlabel: 'year', ylabel: 'satellites', colors: ['accent'], extra: { axesAt: 'edge' }, caption: t`The fleet year by year: each bar is $1.35$ times the one before. The growth rate is illustrative.` }),
    steps: [
      { label: 'Identify', text: t`$N_0 = 1200$, and “grows by $35\%$ a year” means each year multiplies by $b = 1.35$, with $T = 1$ year.` },
      { label: 'Model', text: t`$N(t) = 1200 \times 1.35^{\,t}$, with $t$ in years.` },
      { label: 'Evaluate', text: t`$N(5) = 1200 \times 1.35^5 = 1200 \times ${nice(sig(1.35 ** 5, 4))} \approx ${thou(Math.round(1200 * 1.35 ** 5))}$ satellites.` },
      { label: 'Compare', text: t`A linear model adding $35\%$ of the *original* $1200$ — $420$ a year — would give only $1200 + 5 \times 420 = 3300$. Compounding adds $35\%$ of a growing number.` },
      { label: 'Sense check', text: t`The fleet roughly doubles every $2.3$ years ($1.35^{2.3} \approx 2$), so $5$ years is a bit over two doublings: $1200 \to 2400 \to 4800 \to$ about $5400$ ✓.` },
    ],
    answer: t`About $${thou(Math.round(1200 * 1.35 ** 5))}$ satellites.`,
  },
  practice: [
    mcq({
      id: 'which-exponential', difficulty: 1,
      prompt: t`Measurements are taken at equal time intervals. Which sequence is exponential?`,
      visual: { type: 'graph', params: { x: [-0.4, 3.6], y: [0, 36], aspect: 'wide', xlabel: 'step', ylabel: 'value', xticks: 4,
        points: [[8, 12, 18, 27, 'accent'], [8, 12, 16, 20, 'gold'], [8, 12, 18, 26, 'violet'], [8, 16, 24, 32, 'teal']].flatMap((s) => [0, 1, 2, 3].map((k) => ({ x: k, y: s[k], color: s[4], r: 4.5 }))),
        legend: [{ label: '8, 12, 18, 27', color: 'accent', point: true }, { label: '8, 12, 16, 20', color: 'gold', point: true }, { label: '8, 12, 18, 26', color: 'violet', point: true }, { label: '8, 16, 24, 32', color: 'teal', point: true }], legendAt: 'tl' }, caption: t`The four sequences plotted against the step number.` },
      choices: ['8, 12, 18, 27', '8, 12, 16, 20', '8, 12, 18, 26', '8, 16, 24, 32'],
      answer: 0,
      why: {
        1: t`Equal *differences* ($+4$ each step): that is linear.`,
        2: t`The ratios are $1.5$, $1.5$, then $26/18 = 1.44$: close, but not constant. The differences $4, 6, 8$ grow by $2$ — a quadratic pattern.`,
        3: t`Equal differences ($+8$ each step): that is linear. The first step happens to double, but the ratios then fall: $2$, $1.5$, $1.33$.`,
      },
      hints: [t`Divide each value by the one before. Which sequence has a constant ratio?`],
      teach: t`Exponential data have constant ratios between equally spaced values; linear data have constant differences.`,
      explain: t`$12/8 = 18/12 = 27/18 = 1.5$: every step multiplies by $1.5$, so $N = 8 \times 1.5^{\,n}$.`,
    }),
    num({
      id: 'half-lives', difficulty: 1,
      gen(r) {
        const iso = r.pick(ISOTOPES), n = r.int(2, 5), A0 = r.pick([800, 1600, 3200, 640]);
        const ans = A0 / 2 ** n, tt = n * iso.T;
        const errors = 2 * n === 2 ** n ? [] : [{ value: A0 / (2 * n), feedback: t`$${n}$ half-lives halve it $${n}$ times — divide by $2^{${n}} = ${2 ** n}$, not by $2 \times ${n}$.` }];
        if (n === 2) errors.push({ value: 0, feedback: t`Two half-lives do not use up two halves: the second removes half of what is *left*.` });
        return {
          prompt: t`A sealed sample of ${iso.name} (half-life $${iso.T}$ ${iso.word}) has an activity of $${A0}$ kBq. What is its activity after $${nice(sig(tt, 4))}$ ${iso.word}?`,
          answer: ans, units: 'kBq', tol: { rel: 0.005 },
          errors,
          hints: [t`How many half-lives is $${nice(sig(tt, 4))}$ ${iso.word}?`, t`Each half-life multiplies the activity by $\tfrac12$.`],
          teach: t`After $n$ half-lives a fraction $(\tfrac12)^n$ remains.`,
          explain: t`$${nice(sig(tt, 4))} / ${iso.T} = ${n}$ half-lives, so $A = ${A0} \times (\tfrac12)^{${n}} = ${nice(ans)}$ kBq.`,
          visual: decayFig(A0, iso.T, n + 1, `t (${iso.word})`, t`Activity against time; the dashed lines are spaced one half-life apart. Activity scale hidden.`),
        };
      },
    }),
    num({
      id: 'mars-pressure', difficulty: 2,
      gen(r) {
        const [z, site] = r.pick([[21.9, 'the summit of Olympus Mons'], [17.8, 'the summit of Arsia Mons'], [-7.2, 'the floor of Hellas Planitia'], [-4.5, 'the floor of Gale crater, where Curiosity landed']]);
        const ans = 610 * 0.5 ** (z / 7.7), wrong = 610 * 0.5 ** (7.7 / z);
        return {
          prompt: t`In Mars’s lower atmosphere the pressure roughly halves every $7.7$ km of height, from about $610$ Pa at the planet’s reference level: $p(z) = 610 \cdot (\tfrac12)^{z/7.7}$, with $z$ in km. Estimate the pressure at ${site}, $z = ${z}$ km.`,
          answer: ans, units: 'Pa', tol: { rel: 0.02 },
          errors: Number.isFinite(wrong) ? [{ value: wrong, feedback: t`The exponent counts halvings: $z / 7.7$, not $7.7 / z$.` }] : [],
          hints: [t`Count the halvings: $${z} / 7.7$.`, ...(z < 0 ? [t`Below the reference level the exponent is negative, so the pressure is *higher* than $610$ Pa.`] : [t`Then multiply $610$ by $\tfrac12$ raised to that power.`])],
          teach: t`A constant halving distance makes pressure an exponential function of height; a fractional or negative number of halvings is fine.`,
          explain: t`$${z}/7.7 = ${nice(sig(z / 7.7, 3))}$ halvings, so $p = 610 \times 0.5^{${nice(sig(z / 7.7, 3))}} \approx ${Math.round(ans)}$ Pa.`,
          visual: { type: 'graph', params: { x: [-10, 28], y: [0, 1500], aspect: 'wide', xlabel: 'z (km)', ylabel: 'p (Pa)', yticks: 0, curves: [{ fn: '610*0.5^(x/7.7)', color: 'accent' }], vlines: [{ x: z, color: 'gold' }, { x: 0, color: 'ink3', label: 'reference level' }] }, caption: t`The model, pressure scale hidden. It treats the atmosphere as one uniform temperature; real Mars pressure also swings by about $25\%$ with the seasons.` },
        };
      },
    }),
    expr({
      id: 'write-model', difficulty: 2,
      gen(r) {
        const Q0 = r.pick([50, 200, 500]), b = r.pick([3, 10]), T = r.pick([2, 4, 5]);
        return {
          prompt: t`A quantity starts at $${Q0}$ and is multiplied by $${b}$ every $${T}$ hours. Write it as a function of the time $t$ in hours.`,
          lhs: 'Q(t)',
          answer: `${Q0}*${b}^(t/${T})`, answerTeX: t`${Q0} \cdot ${b}^{\,t/${T}}`,
          vars: { t: [0, 8] },
          errors: [{ answer: `${Q0}*${b}^(${T}t)`, feedback: t`The exponent must be $1$ after one step, at $t = ${T}$: use $t/${T}$, not $${T}t$.` }, { answer: `${Q0}*${b}^t`, feedback: t`That multiplies by $${b}$ every *hour*. Count steps of $${T}$ hours: $t/${T}$.` }, { answer: `${Q0} + ${Q0 * (b - 1)}t/${T}`, feedback: t`That adds the same amount each step — linear growth. The quantity is *multiplied*.` }],
          hints: [t`$Q(t) = Q_0\, b^{\,t/T}$.`, t`Check: $Q(${T})$ should be $${Q0 * b}$.`],
          teach: t`To multiply by $b$ every $T$, raise $b$ to the number of steps, $t/T$.`,
          explain: t`$Q(t) = ${Q0} \cdot ${b}^{\,t/${T}}$: $Q(0) = ${Q0}$, $Q(${T}) = ${Q0 * b}$, $Q(${2 * T}) = ${Q0 * b * b}$ ✓.`,
          visual: { type: 'graph', params: { x: [-0.5, 2.4 * T], y: [0, Q0 * b * b * 1.15], aspect: 'wide', xlabel: 't (h)', ylabel: 'Q', points: [{ x: 0, y: Q0, color: 'gold', r: 5, label: `${Q0}`, labelDx: 8, labelDy: -10 }, { x: T, y: Q0 * b, color: 'gold', r: 5, label: `${Q0 * b}`, labelDx: 8, labelDy: -10 }, { x: 2 * T, y: Q0 * b * b, color: 'gold', r: 5, label: `${Q0 * b * b}`, labelDx: -30, labelDy: -12 }] }, caption: t`Three values the model must hit; the curve through them is yours to write.` },
        };
      },
    }),
    mcq({
      id: 'two-half-lives', difficulty: 2, kind: 'error',
      prompt: t`Radon-222 has a half-life of $3.82$ days. A student says a sealed sample is gone after $7.64$ days, “because half decays in each half-life, and two halves make a whole”. What fraction actually remains?`,
      visual: { type: 'graph', params: { x: [-0.3, 12], y: [-0.08, 1.15], aspect: 'wide', xlabel: 't (days)', ylabel: 'fraction left', yticks: 0, curves: [{ fn: '2^(-x/3.82)', color: 'accent', domain: [0, 12], label: 'exponential', labelAt: 9, labelDx: 0, labelDy: -12 }, { fn: '1 - x/7.64', color: 'bad', dash: true, domain: [0, 7.64], label: 'the student’s straight line', labelAt: 6.6, labelDx: 10, labelDy: 2 }], vlines: [{ x: 3.82, color: 'ink3' }, { x: 7.64, color: 'ink3' }] }, caption: t`The student’s model (dashed) against the exponential law. Dashed verticals: one and two half-lives. Vertical scale hidden.` },
      choices: [t`$\tfrac14$`, t`none`, t`$\tfrac12$`, t`$\tfrac18$`],
      answer: 0,
      why: {
        1: t`The second half-life halves what is *left*, not the original amount. Decay removes a fraction, not a fixed quantity.`,
        2: t`$\tfrac12$ remains after *one* half-life; $7.64$ days is two.`,
        3: t`$\tfrac18$ is three half-lives, $11.46$ days.`,
      },
      hints: [t`After one half-life, $\tfrac12$ remains. What does the second half-life do to that?`],
      teach: t`Each half-life halves what is left, so the amount never reaches zero in any finite number of half-lives.`,
      explain: t`$(\tfrac12)^2 = \tfrac14$ remains. After $n$ half-lives, $(\tfrac12)^n$: a quarter, an eighth, a sixteenth… never exactly zero (though eventually no atoms are left, since atoms come in whole numbers).`,
    }),
    num({
      id: 'percent-per-hour', difficulty: 2,
      gen(r) {
        const p = r.pick([10, 20, 25, 30]), n = r.int(3, 6), f = 1 - p / 100, ans = 100 * f ** n;
        const lin = 100 * (1 - n * p / 100);
        return {
          prompt: t`A propellant tank’s pressurant leaks so that it loses $${p}\%$ of its remaining pressure each hour. What percentage of the starting pressure is left after $${n}$ hours?`,
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [lin > 0 ? { value: lin, feedback: t`That subtracts $${p}\%$ of the *starting* pressure each hour. Each hour removes $${p}\%$ of what is left: multiply by $${nice(f)}$ each time.` } : null, { value: 100 * (p / 100) ** n, feedback: t`$${nice(p / 100)}$ is the fraction *lost* each hour; the fraction kept is $${nice(f)}$.` }].filter(Boolean),
          hints: [t`Losing $${p}\%$ means keeping $${100 - p}\%$: a factor of $${nice(f)}$ per hour.`, t`$${nice(f)}^{${n}}$.`],
          teach: t`A constant percentage loss per step is exponential decay with factor $1 - r/100$.`,
          explain: t`$100\% \times ${nice(f)}^{${n}} = ${nice(sig(ans, 3))}\%$.`,
          visual: bars({ values: Array.from({ length: n }, (_, k) => 100 * f ** k), k0: 0, labels: Array.from({ length: n }, (_, k) => `${nice(sig(100 * f ** k, 3))}%`), xlabel: 'hour', ylabel: 'pressure (% of start)', colors: ['accent'], y: [0, 118], x: [-0.8, n + 0.8], extra: { axesAt: 'edge' }, caption: t`The first hours; the bar for hour $${n}$ is for you to find. Simplified: real leak rates depend on pressure in more complicated ways.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-constellation', difficulty: 2, transfer: true,
      gen(r) {
        const N0 = r.pick([300, 650, 1200, 2400]), pct = r.pick([20, 25, 40, 50]), n = r.int(3, 6), b = 1 + pct / 100;
        const ans = N0 * b ** n, lin = N0 * (1 + n * pct / 100);
        return {
          prompt: t`A satellite operator has $${N0}$ spacecraft in orbit and launches enough to grow the fleet by $${pct}\%$ a year. At that rate, how many will it have after $${n}$ years?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: lin, feedback: t`That adds $${pct}\%$ of the original fleet each year. Growth compounds: multiply by $${nice(b)}$ each year.` }, { value: N0 * b * n, feedback: t`Multiply by $${nice(b)}$ once per year — that is a power, $${nice(b)}^{${n}}$, not $${nice(b)} \times ${n}$.` }],
          hints: [t`$N = N_0\,(1 + r)^{t}$.`],
          teach: t`Growth by a fixed percentage compounds: $N_0 (1 + r)^t$.`,
          explain: t`$${N0} \times ${nice(b)}^{${n}} \approx ${thou(Math.round(ans))}$ spacecraft.`,
          visual: { type: 'graph', params: { x: [-0.4, n + 0.6], y: [0, ans * 1.15], aspect: 'wide', xlabel: 'year', ylabel: 'spacecraft', yticks: 0, points: [{ x: 0, y: N0, color: 'gold', r: 5, label: `${N0}`, labelDx: 8, labelDy: -10 }, { x: 1, y: N0 * b, color: 'gold', r: 5, label: `${nice(N0 * b)}`, labelDx: 8, labelDy: -10 }], vlines: [{ x: n, color: 'ink3', label: `year ${n}` }] }, caption: t`The fleet now and after one year; vertical scale hidden. Real launch rates are not this steady.` },
        };
      },
    }),
    num({
      id: 'cp-half-life-count', difficulty: 2,
      gen(r) {
        const [frac, word, ans] = r.pick([[1e-2, 'one-hundredth', 7], [1e-3, 'one-thousandth', 10], [1e-6, 'one-millionth', 20]]);
        return {
          prompt: t`How many whole half-lives must pass before a radioactive source’s activity falls below ${word} of its starting value?`,
          answer: ans, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: ans - 1, feedback: t`$2^{${ans - 1}} = ${thou(2 ** (ans - 1))}$ is not yet enough: you need $2^n$ to exceed $${thou(1 / frac)}$.` }],
          hints: [t`After $n$ half-lives the fraction left is $1/2^n$.`, t`Find the smallest $n$ with $2^n > ${thou(1 / frac)}$. Note $2^{10} = 1024$.`],
          teach: t`Every $10$ half-lives cut a quantity by about a factor of $1000$, since $2^{10} = 1024$.`,
          explain: t`$2^{${ans}} = ${thou(2 ** ans)} > ${thou(1 / frac)}$ while $2^{${ans - 1}} = ${thou(2 ** (ans - 1))}$ is not: $${ans}$ half-lives.`,
          visual: decayFig(1, 1, 7, 'half-lives', t`The fraction left against time in half-lives, for the first few; scale hidden.`),
        };
      },
    }),
    num({
      id: 'cp-next-reading', difficulty: 2,
      gen(r) {
        const V0 = r.pick([24, 28, 36]), b = r.pick([0.5, 0.6, 0.75, 0.8]);
        const v = [0, 1, 2, 3].map((k) => V0 * b ** k), ans = V0 * b ** 4;
        const shown = v.map((x) => nice(sig(x, 3)));
        const lin = v[3] - (v[2] - v[3]);
        return {
          prompt: t`A capacitor discharging through a resistor is read every $2$ s: $${shown.join('$, $')}$ volts. What will the next reading be?`,
          answer: ans, units: 'V', tol: { rel: 0.02 },
          errors: lin > 0 ? [{ value: lin, feedback: t`That subtracts the last *difference* again — a linear extrapolation. The *ratio* between readings is constant here.` }] : [],
          hints: [t`Divide each reading by the one before.`, t`Multiply the last reading by that ratio.`],
          teach: t`Discharge is exponential: equal time steps multiply the voltage by the same factor.`,
          explain: t`Each reading is $${nice(b)}$ of the one before, so the next is $${shown[3]} \times ${nice(b)} \approx ${nice(sig(ans, 3))}$ V.`,
          visual: { type: 'graph', params: { x: [-0.5, 9], y: [0, V0 * 1.15], aspect: 'wide', xlabel: 't (s)', ylabel: 'V (volts)', points: v.map((x, k) => ({ x: 2 * k, y: x, color: 'gold', r: 5 })), vlines: [{ x: 8, color: 'ink3', label: 'next reading' }] }, caption: t`The four readings against time.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §4.1 Exponential Functions', url: 'https://openstax.org/books/precalculus-2e/pages/4-1-exponential-functions' },
    { label: 'NNDC NuDat 3: nuclear half-lives', url: 'https://www.nndc.bnl.gov/nudat3/' },
    { label: 'NASA Mars Fact Sheet (surface pressure, scale height)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html' },
  ],
});
