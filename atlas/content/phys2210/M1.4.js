// Order-of-magnitude (Fermi) estimates: a chain of guessed factors, kept to the nearest power of ten.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { staircase, logAxis, logLadder } from './_measure.js';

const t = String.raw;
const MIN_PER_YEAR = 60 * 24 * 365.25;    // 525 960
const sciTeX = (x, n = 2) => { const [m, e] = x.toExponential(n - 1).split('e'); return t`${m}\times10^{${+e}}`; };

// the worked example: jet fuel burned by the world's airlines in a year
const FUEL = { flights: 1e5, hours: 2, burn: 3e3, days: 365 };
FUEL.total = FUEL.flights * FUEL.hours * FUEL.burn * FUEL.days;
const IATA_2019 = 3.6e11;                  // litres (about 95 billion US gallons), IATA via Statista

/** A numeric Fermi item graded on log₁₀ of the estimate, accepting anything within a factor of about 3. */
function fermi({ id, difficulty = 2, prompt, value, unitWord, hints, teach, explain, errors = [], visual }) {
  return num({
    id, difficulty,
    prompt: t`${prompt} Enter $\log_{10}$ of your estimate${unitWord ? ` in ${unitWord}` : ''} — for example, type 9.5 for $3\times10^{9}$. Anything within a factor of about 3 (±0.5 in the logarithm) counts.`,
    answer: +Math.log10(value).toFixed(3), tol: { abs: 0.5, rel: 0 },
    errors, hints, teach, explain, visual,
  });
}

/** Four guesses, each wrong by up to a factor of 2: the worst case against three typical random walks on the log scale. */
function errorWalks() {
  const walks = [
    { steps: [0.3, 0.3, 0.3, 0.3], color: 'bad' },
    { steps: [0.25, -0.2, 0.3, -0.1], color: 'accent' },
    { steps: [-0.15, -0.25, 0.3, -0.25], color: 'teal' },
    { steps: [0.1, 0.3, -0.15, 0.2], color: 'violet' },
  ];
  const arrows = [];
  for (const w of walks) {
    let y = 0;
    w.steps.forEach((d, k) => { arrows.push({ from: [k, +y.toFixed(3)], to: [k + 1, +(y + d).toFixed(3)], color: w.color }); y += d; });
  }
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.2, 5.6], y: [-1.4, 1.5], xticks: 6, xlabel: 'factors multiplied so far', ylabel: 'log₁₀ of the error',
      shade: [{ fn: '0.48', lower: '-0.48', from: 0, to: 4, color: 'good', alpha: 0.13 }],
      arrows,
      points: [{ x: 4, y: 1.2, r: 0.01, color: 'bad', label: 'all too high: ×16' }, { x: 4.05, y: 0.06, r: 0.01, color: 'good', label: 'within ×3' }],
    },
    caption: 'Each arrow is one guess, off by up to a factor of 2 (±0.3 on the log scale). Red: the worst case, every guess too high. The others are typical: errors in both directions partly cancel, ending inside the green band — within a factor of 3.',
  };
}

/** One turn of a rolling tyre moves the car one circumference, drawn to scale for a 0.65 m tyre. */
function rollingWheel() {
  const R = 0.325, C = +(2 * Math.PI * R).toFixed(4);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.45, 2.75], y: [-0.15, 0.85], equal: true, xlabel: 'm', ylabel: 'm',
      curves: [
        { fn: '0', domain: [-0.4, 2.7], color: 'ink3', width: 1.5 },
        { fn: '0', domain: [0, C], color: 'gold', width: 4 },
        { param: [`${R}*cos(t)`, `${R} + ${R}*sin(t)`], t: [0, '2*pi'], color: 'accent', width: 2.4 },
        { param: [`${C} + ${R}*cos(t)`, `${R} + ${R}*sin(t)`], t: [0, '2*pi'], color: 'accent', width: 2.4, dash: true },
        { param: ['0', 't'], t: [0, 2 * R], color: 'ink2', width: 1.2, dash: true },
      ],
      points: [
        { x: 0, y: 0, r: 4, color: 'gold' }, { x: C, y: 0, r: 4, color: 'gold' },
        { x: 0.75, y: 0.06, r: 0.01, color: 'gold', label: 'one turn = πd ≈ 2.0 m' },
        { x: 0, y: 2 * R, r: 0.01, color: 'ink2', label: 'd = 0.65 m' },
      ],
    },
    caption: 'A tyre rolling without slipping moves forward one circumference, πd, each time it turns once. Drawn to scale.',
  };
}

export default lesson({
  id: 'phys2210.M1.4',
  title: 'Order-of-magnitude estimates',
  minutes: 9, difficulty: 2,
  intro: t`An **order-of-magnitude estimate** — a *Fermi estimate*, after Enrico Fermi, who was famous for them — gets a number right to within a factor of a few using nothing but reasoning. Break the unknown into a chain of factors you can guess, multiply, and keep the power of ten:

$$N = f_1 \times f_2 \times \cdots \times f_n, \qquad \text{order of magnitude of } N = 10^{\,\text{round}(\log_{10} N)}$$

It works better than it has any right to, because some of your guesses come out too high and others too low, and the errors partly cancel. Engineers use estimates to sanity-check every calculation; physicists use them to decide whether an effect is worth computing at all.`,
  symbols: [
    { tex: 'N', text: 'the quantity you want — a count, a mass, an energy — with its unit' },
    { tex: 'f_1, \\dots, f_n', text: 'the factors of the chain: each one something you can guess, look up or reason out (flights per day, hours per flight, litres per hour…)' },
    { tex: '\\log_{10} N', text: 'the power of ten $N$ sits at on a logarithmic scale: $\\log_{10}(3\\times10^{9}) = 9.5$' },
    { tex: '\\text{round}(\\log_{10} N)', text: 'the nearest whole power of ten: 800 has order of magnitude $10^3$, because $\\log_{10} 800 = 2.9$ is closer to 3 than to 2' },
  ],
  why: 'Before any detailed calculation, an estimate tells you what answer to expect — so a slipped power of ten shows up immediately instead of on the launch pad.',
  visual: {
    type: 'graph',
    title: 'How many times will your heart beat?',
    lead: t`On a logarithmic axis, multiplying by a factor adds a step of height $\log_{10}(\text{factor})$, so a Fermi chain becomes a staircase and its top is $\log_{10} N$. Change the two guesses — heart rate and lifetime — and watch how little the top moves.`,
    tasks: [
      'Double the heart rate: the top rises by only log₁₀ 2 ≈ 0.3 — the same order of magnitude.',
      'Swing both sliders from one extreme to the other: from the slowest heart and shortest life to the fastest and longest, N changes by a factor of 7.5 — still less than one power of ten.',
      'Read the top of the staircase: about 9.5, so N ≈ 3 × 10⁹ beats.',
    ],
    params: {
      aspect: 'wide', x: [0.4, 7.2], y: [0, 11], xticks: 0.001, yticks: 12, xlabel: ' ', ylabel: 'log₁₀ of the running product',
      alt: 'A staircase on a logarithmic scale whose steps are the factors of a Fermi estimate',
      sliders: [
        { key: 'r', label: 'Heart rate', min: 40, max: 120, step: 1, value: 70, unit: '\\text{beats/min}', explain: 'A resting adult heart beats about 60–100 times a minute; exercise raises it.' },
        { key: 'life', label: 'Lifetime', min: 40, max: 100, step: 1, value: 80, unit: '\\text{years}', explain: 'Typical lifespans are 70–85 years in much of the world.' },
      ],
      arrows: [
        { from: [1, 0], to: [1, 'log10(r)'], color: 'accent' },
        { from: [2, 'log10(r)'], to: [2, 'log10(60*r)'], color: 'accent' },
        { from: [3, 'log10(60*r)'], to: [3, 'log10(1440*r)'], color: 'accent' },
        { from: [4, 'log10(1440*r)'], to: [4, 'log10(525960*r)'], color: 'accent' },
        { from: [5, 'log10(525960*r)'], to: [5, 'log10(525960*r*life)'], color: 'gold' },
      ],
      curves: [
        { fn: 'log10(r)', domain: [1, 2], color: 'ink3', width: 1, dash: true },
        { fn: 'log10(60*r)', domain: [2, 3], color: 'ink3', width: 1, dash: true },
        { fn: 'log10(1440*r)', domain: [3, 4], color: 'ink3', width: 1, dash: true },
        { fn: 'log10(525960*r)', domain: [4, 5], color: 'ink3', width: 1, dash: true },
      ],
      points: [
        { x: 1.1, y: 'log10(r)/2', r: 0.01, color: 'ink', label: '× beats per minute' },
        { x: 2.1, y: 'log10(r) + log10(60)/2', r: 0.01, color: 'ink', label: '× 60 min/h' },
        { x: 3.1, y: 'log10(60*r) + log10(24)/2', r: 0.01, color: 'ink', label: '× 24 h/day' },
        { x: 4.1, y: 'log10(1440*r) + log10(365.25)/2', r: 0.01, color: 'ink', label: '× 365 days/yr' },
        { x: 5.1, y: 'log10(525960*r) + log10(life)/2', r: 0.01, color: 'ink', label: '× years' },
        { x: 5, y: 'log10(525960*r*life)', r: 4.5, color: 'gold', label: 'N' },
      ],
      readouts: [
        { label: 'beats in a lifetime, $N$', expr: '525960*r*life', digits: 2 },
        { label: '$\\log_{10} N$', expr: 'log10(525960*r*life)', digits: 3 },
        { label: 'order of magnitude', expr: '10^floor(log10(525960*r*life) + 0.5)', digits: 1 },
      ],
    },
    caption: 'Logarithmic scale: each step’s height is log₁₀ of its factor, and the steps add. Resting heart rate and lifespan vary from person to person; the point is how little the order of magnitude cares.',
  },
  example: {
    prompt: 'Estimate how many litres of jet fuel the world’s airlines burn in a year.',
    visual: staircase([
      { factor: FUEL.flights, label: '10⁵ flights a day' },
      { factor: FUEL.hours, label: '× 2 h each' },
      { factor: FUEL.burn, label: '× 3000 L/h' },
      { factor: FUEL.days, label: '× 365 days' },
    ], { unit: 'L', reference: { value: IATA_2019, label: 'airline data, 2019: 3.6 × 10¹¹ L' }, top: 13 }),
    steps: [
      { label: 'Build the chain', text: t`Litres per year = (flights per day) × (hours per flight) × (litres burned per hour) × (days per year). Each factor is something you can reason about.` },
      { label: 'Guess each factor', text: t`A busy airport handles about a thousand flights a day and there are a few hundred busy airports: say $10^5$ flights a day. Most flights are short: about 2 hours. A single-aisle airliner burns about 2.5 tonnes of fuel an hour, about 3000 litres — wide-bodies burn more, regional jets less, so take $3\times10^{3}$ L/h. And 365 days.` },
      { label: 'Multiply the powers of ten', text: t`$$10^{5}\times2\times(3\times10^{3})\times365 \approx ${sciTeX(FUEL.total)}\ \text{litres per year}$$ That is $\log_{10} N = ${fmt(Math.log10(FUEL.total), 3)}$: order of magnitude $10^{11}$ litres.` },
      { label: 'Check against data', text: t`The airline industry’s own figure for 2019 is about 95 billion US gallons, $3.6\times10^{11}$ L. The estimate is low by a factor of only ${fmt(IATA_2019 / FUEL.total, 2)} — the same order of magnitude, from four guesses.` },
      { label: 'Why it worked', text: 'Each guess could easily be off by a factor of 2, but they were not all off in the same direction. Errors in a product add on the logarithmic scale like steps of a random walk, so they grow far more slowly than the worst case.' },
    ],
    answer: t`About $2\times10^{11}$ litres a year, order of magnitude $10^{11}$ — the measured value is $3.6\times10^{11}$ L.`,
  },
  practice: [
    match({
      id: 'nearest-power', difficulty: 1,
      prompt: t`Match each number to its order of magnitude — the power of ten nearest to it on a logarithmic scale, $10^{\text{round}(\log_{10} x)}$.`,
      left: ['800', '0.0042', t`$6.0\times10^{23}$`, '45', '0.25', t`$2.0\times10^{6}$`],
      right: ['10³', '10⁻²', '10²⁴', '10²', '10⁻¹', '10⁶', '10⁻³', '10²³'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: [t`Write each number in scientific notation, $a\times10^k$. If $a$ is below $\sqrt{10} \approx 3.16$ the order is $10^k$; if it is above, round up to $10^{k+1}$.`, t`$800 = 8\times10^2$ and $8 > 3.16$, so it rounds up to $10^3$; $\log_{10} 800 = 2.90$.`],
      teach: 'The order of magnitude is the nearest power of ten on a logarithmic scale: round log₁₀ x to the nearest whole number.',
      visual: logAxis({ from: 1, to: 6, examples: [[2.0e3, '2.0 × 10³ → 10³'], [3.5e4, '3.5 × 10⁴ → 10⁵']] }),
      explain: 'log₁₀ 800 = 2.90 → 10³; log₁₀ 0.0042 = −2.38 → 10⁻²; log₁₀(6.0 × 10²³) = 23.78 → 10²⁴; log₁₀ 45 = 1.65 → 10²; log₁₀ 0.25 = −0.60 → 10⁻¹; log₁₀(2.0 × 10⁶) = 6.30 → 10⁶. Whenever the leading figure is above √10 ≈ 3.16, round up.',
    }),
    fermi({
      id: 'breaths', difficulty: 2,
      prompt: 'Estimate how many breaths a person takes in a lifetime.',
      value: 15 * MIN_PER_YEAR * 80,
      errors: [{ value: +Math.log10(15 * MIN_PER_YEAR).toFixed(3), feedback: 'That is about one year of breathing. Multiply by a lifetime of years.' }],
      hints: ['At rest you breathe roughly 12 to 20 times a minute.', t`Breaths per minute × minutes per year × years: $15\times(5.3\times10^{5})\times80$.`],
      teach: 'Chain rates and durations: (events per minute) × (minutes per year) × (years).',
      visual: staircase([{ factor: 70, label: '70 beats/min' }, { factor: 60, label: '× 60 min/h' }, { factor: 24, label: '× 24 h/day' }, { factor: 365.25, label: '× 365 days/yr' }, { factor: 80, label: '× 80 yr' }], { unit: 'beats', top: 11, caption: 'For comparison, the heartbeat estimate from Explore as a staircase. Build the breathing estimate the same way: only the first step changes.' }),
      explain: t`$15\ \text{min}^{-1}\times5.3\times10^{5}\ \text{min/yr}\times80\ \text{yr} \approx ${sciTeX(15 * MIN_PER_YEAR * 80)}$ breaths, so $\log_{10} N \approx ${fmt(Math.log10(15 * MIN_PER_YEAR * 80), 2)}$ — between $10^{8}$ and $10^{9}$, closer to $10^{9}$.`,
    }),
    fermi({
      id: 'airliner-energy', difficulty: 2,
      prompt: 'Estimate the kinetic energy, in joules, of a single-aisle airliner (an A320 or a 737, a few tens of tonnes) at cruising speed.',
      value: 0.5 * 7e4 * 250 * 250,
      errors: [{ value: +Math.log10(7e4 * 250).toFixed(3), feedback: t`That is $mv$, a momentum. Kinetic energy is $\tfrac12 mv^2$.` }, { value: +Math.log10(0.5 * 7e4 * 250 * 250 * 3.6 * 3.6).toFixed(3), feedback: 'Use the speed in m/s, not km/h, so that the energy comes out in joules.' }],
      hints: [t`Kinetic energy is $\tfrac12 mv^2$. A single-aisle airliner in flight has a mass of about $7\times10^{4}$ kg.`, 'Airliners cruise at about 900 km/h, which is 250 m/s.'],
      teach: 'Estimate each input to within a factor of 2, convert to SI, then compute with powers of ten.',
      visual: logLadder([
        { label: 'a sprinter, 70 kg at 10 m/s', value: 0.5 * 70 * 10 * 10 },
        { label: 'a car, 1500 kg at 30 m/s', value: 0.5 * 1500 * 30 * 30 },
        { label: '1 litre of jet fuel, burned', value: 3.4e7 },
      ], { from: 2, to: 11, unit: 'J', caption: 'Energies to compare your estimate with, on a logarithmic scale: ½mv² for the runner and the car; about 34 MJ for a litre of jet fuel. Labels sit just above their dots.' }),
      explain: t`$\tfrac12 mv^2 \approx \tfrac12(7\times10^{4}\ \text{kg})(250\ \text{m/s})^2 \approx ${sciTeX(0.5 * 7e4 * 250 * 250)}$ J, so $\log_{10} \approx ${fmt(Math.log10(0.5 * 7e4 * 250 * 250), 2)}$. A couple of gigajoules — the chemical energy in only about ${Math.round((0.5 * 7e4 * 250 * 250) / 34e6 / 10) * 10} litres of jet fuel (at about 34 MJ per litre).`,
    }),
    fermi({
      id: 'walk-to-moon', difficulty: 2,
      prompt: 'If you could walk to the Moon without stopping, how many seconds would it take?',
      unitWord: 'seconds',
      value: 3.84e8 / 1.4,
      errors: [{ value: +Math.log10(3.84e5 / 1.4).toFixed(3), feedback: 'The Moon is about 384 000 kilometres away — convert that to metres before dividing by a speed in m/s.' }],
      hints: [t`The Moon is about $3.8\times10^{8}$ m away.`, t`A brisk walk is about 5 km/h, or 1.4 m/s; time = distance ÷ speed.`],
      teach: 'Time is distance divided by speed — with both in SI units first.',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-20000, 405000], y: [-30000, 30000], equal: true, axes: false, grid: false,
          alt: 'Earth and the Moon drawn to scale',
          curves: [
            { param: ['6371*cos(t)', '6371*sin(t)'], t: [0, '2*pi'], color: 'teal', width: 2 },
            { param: ['384400 + 1737*cos(t)', '1737*sin(t)'], t: [0, '2*pi'], color: 'ink2', width: 2 },
            { fn: '0', domain: [6371, 382663], color: 'ink4', width: 1, dash: true },
          ],
          points: [{ x: -9000, y: 9000, r: 0.01, color: 'teal', label: 'Earth' }, { x: 378000, y: 6000, r: 0.01, color: 'ink2', label: 'Moon' }, { x: 150000, y: 4000, r: 0.01, color: 'ink3', label: '384 000 km' }],
        },
        caption: 'Earth and the Moon to scale: about thirty Earth-diameters apart.',
      },
      explain: t`$t = \dfrac{3.8\times10^{8}\ \text{m}}{1.4\ \text{m/s}} \approx ${sciTeX(3.84e8 / 1.4)}$ s, so $\log_{10} t \approx ${fmt(Math.log10(3.84e8 / 1.4), 2)}$ — about ${Math.round(3.84e8 / 1.4 / 3.156e7)} years of non-stop walking.`,
    }),
    mcq({
      id: 'errors-cancel', difficulty: 2,
      prompt: 'You make a Fermi estimate from four factors, and each guess could be off by up to a factor of 2 in either direction. How far off is the product, typically?',
      choices: ['About a factor of 2 or 3 — high and low guesses partly cancel', 'A factor of 16, because 2⁴ = 16', 'Exactly a factor of 2, the same as each guess', 'So far off that the estimate is meaningless'],
      answer: 0,
      why: {
        1: 'That is the worst case, when every guess errs in the same direction. Independent errors rarely conspire like that.',
        2: 'Errors in a product compound — but only partly, because some cancel. The typical error grows, just slowly.',
        3: 'Fermi estimates routinely land within a factor of a few of measured values; the jet-fuel example landed within a factor of 2.',
      },
      hints: ['On a logarithmic scale each error is a step of up to ±0.3 (log₁₀ 2). Are four such steps likely to all point the same way?'],
      teach: 'Independent errors add like a random walk on the logarithmic scale, so n factors give an error that grows roughly like √n, not n.',
      explain: 'Each error is a step of up to ±0.3 on the log scale. Four random steps typically add to about ±0.35 — a factor of about 2 — and only rarely to the worst case, ±1.2 (a factor of 16).',
      visual: errorWalks(),
    }),
    fermi({
      id: 'tyre-turns', difficulty: 3,
      prompt: 'Estimate how many times a car tyre turns over in its working life.',
      value: 6e7 / 2.0,
      errors: [{ value: +Math.log10(6e4 / 2.0).toFixed(3), feedback: 'Convert the distance to metres first: tens of thousands of kilometres is tens of millions of metres.' }, { value: +Math.log10(6e7 / 0.33).toFixed(3), feedback: t`One turn moves the car one circumference, $\pi d \approx 2$ m, not one radius.` }],
      hints: ['A tyre lasts for something like 50 000 to 80 000 km.', t`A car tyre is about 0.65 m across, so one turn covers $\pi d \approx 2$ m of road.`, t`Turns $= \dfrac{6\times10^{7}\ \text{m}}{2\ \text{m}}$.`],
      teach: 'Count repetitions by dividing the total distance by the distance covered in one repetition.',
      visual: rollingWheel(),
      explain: t`$\dfrac{6\times10^{7}\ \text{m}}{\pi\times0.65\ \text{m}} \approx 3\times10^{7}$ turns, $\log_{10} \approx 7.5$.`,
    }),
    fermi({
      id: 'humanity-mass', difficulty: 2,
      prompt: 'Estimate the total mass, in kilograms, of all the people on Earth.',
      unitWord: 'kilograms',
      value: 8e9 * 60,
      errors: [{ value: +Math.log10(8e9).toFixed(3), feedback: 'That is the number of people. Multiply by a typical mass per person.' }],
      hints: ['There are about 8 billion people.', 'Including children, a typical body mass is about 60 kg.'],
      visual: logLadder([
        { label: 'one adult, about 70 kg', value: 70 },
        { label: 'an A380 airliner at take-off, 575 t', value: 5.75e5 },
        { label: 'the Great Pyramid of Giza, about 6 million t', value: 6e9 },
      ], { from: 1, to: 13, unit: 'kg', caption: 'Masses to compare your estimate with, on a logarithmic scale (1 t = 1000 kg). Labels sit just above their dots.' }),
      teach: 'An estimate of a total is (how many) × (typical size of each).',
      explain: t`$8\times10^{9}\times60\ \text{kg} \approx 5\times10^{11}$ kg, so $\log_{10} \approx 11.7$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ligo-strain', difficulty: 3, transfer: true,
      prompt: t`LIGO’s detector arms are 4 km long. When the first gravitational wave ever detected, GW150914, passed through in 2015, it changed the arm lengths by about $4\times10^{-18}$ m — a few thousandths of the diameter of a proton. What is the order of magnitude of the fractional change $\Delta L/L$? Enter the power of ten (type −5 for $10^{-5}$).`,
      answer: -21, tol: { abs: 0.5, rel: 0 },
      errors: [{ value: -17.4, feedback: 'That is ΔL itself, in metres. Divide by the arm length, 4000 m.' }, { value: -18, feedback: 'That is ΔL itself, in metres. Divide by the arm length, 4000 m.' }],
      hints: [t`Convert the arm length to metres: $L = 4\times10^{3}$ m.`, t`$\Delta L/L = \dfrac{4\times10^{-18}}{4\times10^{3}}$.`],
      teach: 'Fractional changes are ratios of like quantities, so their order of magnitude is just the difference of the exponents.',
      visual: logLadder([
        { label: 'LIGO arm · 4 km', value: 4e3 },
        { label: 'width of a hair · 0.08 mm', value: 8e-5 },
        { label: 'an atom · 0.1 nm', value: 1e-10 },
        { label: 'a proton · 1.7 fm', value: 1.7e-15 },
        { label: 'the arm’s change · 4 × 10⁻¹⁸ m', value: 4e-18, color: 'gold' },
      ], { from: -18, to: 4, rungs: false, caption: 'Lengths on a logarithmic scale, one dashed rung per power of ten. Labels sit just above their dots.' }),
      explain: t`$\Delta L/L = \dfrac{4\times10^{-18}\ \text{m}}{4\times10^{3}\ \text{m}} = 10^{-21}$. This ratio is the gravitational-wave *strain*, $h$; GW150914 peaked at $h \approx 1.0\times10^{-21}$, which is why LIGO had to be the most precise length-measuring machine ever built.`,
    }),
    fermi({
      id: 'cp-airliner-hours', difficulty: 2,
      prompt: 'An airline keeps each of its airliners in service for about 25 years. Estimate the total number of hours one airliner spends in the air over its career.',
      unitWord: 'hours',
      value: 9 * 365 * 25,
      errors: [{ value: +Math.log10(9 * 365 * 25 * 3600).toFixed(3), feedback: 'That is the time in seconds; the question asks for hours.' }, { value: +Math.log10(9 * 25).toFixed(3), feedback: 'You left out the days: hours per day × days per year × years.' }],
      hints: ['An airliner only earns money while it flies, so airlines keep them in the air for much of each day — perhaps 8 to 10 hours.', 'Hours per day × days per year × years.'],
      teach: 'Chain a daily rate, the days in a year and the number of years — the same structure as the heartbeat estimate.',
      explain: t`$9\ \text{h/day}\times365\ \text{days/yr}\times25\ \text{yr} \approx 8\times10^{4}$ hours, $\log_{10} \approx 4.9$. Retired airliners typically have logged several tens of thousands of flight hours, so the estimate is the right order of magnitude.`,
    }),
    mcq({
      id: 'cp-seconds-per-day', difficulty: 1,
      prompt: 'What is the order of magnitude of the number of seconds in a day?',
      choices: ['10⁵', '10⁴', '10³', '10⁶'],
      answer: 0,
      why: {
        1: 'A day is 86 400 s = 8.64 × 10⁴ s, but 8.64 is past √10 ≈ 3.16, so on a logarithmic scale it is nearer 10⁵.',
        2: 'There are 3600 seconds in an hour, and 24 hours in a day — about 9 × 10⁴ in all.',
        3: 'That is more than ten days’ worth of seconds.',
      },
      hints: ['24 h × 3600 s/h = ?', 'Is 86 400 nearer to 10⁴ or to 10⁵ on a logarithmic scale? Compare log₁₀ 86 400 with 4.5.'],
      teach: 'Round the logarithm, not the leading digit: a number like 8.6 × 10⁴ has order of magnitude 10⁵.',
      visual: logAxis({ from: 2, to: 7 }),
      explain: 'A day has 24 × 3600 = 86 400 s, and log₁₀ 86 400 = 4.94, which rounds to 5: order of magnitude 10⁵.',
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §1.1 and §1.5', url: 'https://openstax.org/books/university-physics-volume-1/pages/1-5-estimates-and-fermi-calculations' },
    { label: 'IATA, airline industry fuel consumption, 2019 (via Statista)', url: 'https://www.statista.com/statistics/655057/fuel-consumption-of-airlines-worldwide/' },
    { label: 'LIGO Scientific Collaboration, “Observation of Gravitational Waves from a Binary Black Hole Merger” (2016)', url: 'https://arxiv.org/abs/1602.03837' },
  ],
});
