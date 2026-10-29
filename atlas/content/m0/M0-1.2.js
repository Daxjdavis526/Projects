// Fractions, ratios and percentages — read through propellant mixture ratios.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, bars, areaModel, numberLine, thou } from './_m0kit.js';

const t = String.raw;

// a propellant load as one bar split into oxidizer and fuel by the mixture ratio r = O/F
function splitBar(r, caption, { names = true } = {}) {
  const fo = r / (1 + r);
  return areaModel({
    x: [-0.05, 1.05], y: [-0.08, 0.42], aspect: 'wide',
    rects: [
      { x: 0, y: 0.1, w: fo, h: 0.2, color: 'accent', label: names ? 'oxidizer' : '' },
      { x: fo, y: 0.1, w: 1 - fo, h: 0.2, color: 'warn', label: names && 1 - fo > 0.09 ? 'fuel' : '' },
    ],
    sides: [{ x: 0, y: 0.36, label: '0' }, { x: 1, y: 0.36, label: 'whole load' }],
    caption,
  });
}

// LOX and LH2 densities at their normal boiling points (NIST), in kg/m³
const RHO_LOX = 1141, RHO_LH2 = 70.8;

export default lesson({
  id: 'm0.M0-1.2',
  title: 'Fractions, ratios and percentages',
  minutes: 7, difficulty: 1,
  intro: t`A **ratio** compares two parts; a **fraction** compares a part with the whole. A rocket engine’s mixture ratio $r = \dot m_{\text{ox}}/\dot m_{\text{fuel}}$ is a ratio, and turning it into “what fraction of the propellant is oxidizer” is the single most common move in this lesson:

$$f_{\text{ox}} = \frac{r}{1 + r}$$

Out of every $1 + r$ kilograms, $r$ are oxidizer and $1$ is fuel. A percentage is a fraction with denominator 100, and a percentage *change* is always measured against the starting value.`,
  symbols: [
    { tex: 'r', text: 'the mixture ratio O/F: mass of oxidizer per unit mass of fuel (no unit; kg/kg)' },
    { tex: '\\dot m_{\\text{ox}},\\ \\dot m_{\\text{fuel}}', text: 'mass flow rates of oxidizer and fuel, in kg/s (the dot means “per second”)' },
    { tex: 'f_{\\text{ox}}', text: 'the fraction of the total propellant mass that is oxidizer, between 0 and 1 (multiply by 100 for a percentage)' },
    { tex: '1 + r', text: 'the number of equal mass “parts” in the whole: $r$ parts oxidizer plus $1$ part fuel' },
  ],
  why: t`Every rate, density, efficiency and mass fraction in physics is a fraction, and most arithmetic slips with them come from adding parts that do not share a whole.`,
  visual: {
    type: 'graph',
    title: 'One propellant load, split by the mixture ratio',
    lead: t`The bar is the whole propellant load. Slide the mixture ratio $r$ and watch the split: the oxidizer share is $r/(1+r)$, which climbs toward the whole but never reaches it.`,
    tasks: [
      t`Set $r = 1$: equal masses, so the oxidizer share is one half, not one.`,
      t`Set $r = 6$, the RS-25’s hydrogen–oxygen ratio: six parts in seven, about 86%, is oxygen.`,
      t`Go from $r = 3$ to $r = 6$: the ratio doubles, but the oxidizer share only rises from 75% to 86%.`,
    ],
    params: {
      x: [-0.05, 1.05], y: [0.02, 0.46], xlabel: 'fraction of the propellant mass', ylabel: '', yticks: 0, grid: false, axesAt: 'edge',
      sliders: [{ key: 'r', label: t`Mixture ratio $r$ (O/F)`, min: 0.5, max: 8, step: 0.05, value: 2.4, explain: t`Kilograms of oxidizer burned per kilogram of fuel.` }],
      shade: [{ fn: '0.4', lower: '0.2', from: 0, to: 'r/(1 + r)', color: 'accent', alpha: 0.4 }, { fn: '0.4', lower: '0.2', from: 'r/(1 + r)', to: 1, color: 'warn', alpha: 0.4 }],
      points: [{ x: 'r/(1 + r)/2', y: 0.3, r: 0, label: 'oxidizer', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' }, { x: '(1 + r/(1 + r))/2', y: 0.3, r: 0, label: 'fuel', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink', when: 'step(1/(1 + r) - 0.09)' },
        { x: N(2.36 / 3.36), y: 0.17, label: 'kerosene 2.4', color: 'gold', r: 4, labelAlign: 'right', labelDx: 4, labelDy: 18 },
        { x: N(3.6 / 4.6), y: 0.17, label: 'methane 3.6', color: 'gold', r: 4, labelAlign: 'center', labelDx: 0, labelDy: 38 },
        { x: N(6 / 7), y: 0.17, label: 'hydrogen 6.0', color: 'gold', r: 4, labelAlign: 'left', labelDx: -4, labelDy: 18 }],
      readouts: [{ label: t`oxidizer share $r/(1+r)$`, expr: '100 r/(1 + r)', unit: t`\%`, digits: 3 }, { label: t`fuel share $1/(1+r)$`, expr: '100/(1 + r)', unit: t`\%`, digits: 3 }],
    },
    caption: t`Gold dots: oxidizer shares of real engine families with LOX — kerosene (the Merlin, about 2.4), methane (Raptor, about 3.6), hydrogen (the RS-25, 6.0). Engines run off the ideal chemical ratio on purpose, and each engine’s exact ratio varies with throttle.`,
  },
  example: {
    prompt: t`An engine burns liquid oxygen and liquid hydrogen at $r = 6.0$ with a total propellant flow of $500$ kg/s. Find the oxidizer and fuel flows, and what percentage of the flow is hydrogen.`,
    visual: splitBar(6, t`Seven equal parts: six oxygen, one hydrogen. The bar shows mass, not volume — by volume the hydrogen would dominate.`),
    steps: [
      { label: 'Count the parts', text: t`$r = 6.0$ means 6 kg of oxygen per 1 kg of hydrogen: $6 + 1 = 7$ equal parts in the whole.` },
      { label: 'Share out the whole', text: t`Oxidizer: $\tfrac67 \times 500 = 428.6$ kg/s. Fuel: $\tfrac17 \times 500 = 71.4$ kg/s.` },
      { label: 'Percentage', text: t`Hydrogen is $\tfrac17 = 0.143$ of the flow, i.e. $14.3\%$.` },
      { label: 'Check both ways', text: t`$428.6 + 71.4 = 500$ kg/s ✓ and $428.6 / 71.4 = 6.0$ ✓. A common slip is to take $\tfrac16$ of the total for the fuel; that treats the ratio as a fraction of the whole.` },
    ],
    answer: t`$\dot m_{\text{ox}} = 428.6$ kg/s, $\dot m_{\text{fuel}} = 71.4$ kg/s; hydrogen is $14.3\%$ of the mass flow.`,
  },
  practice: [
    num({
      id: 'ox-load', difficulty: 1,
      gen(r) {
        const [ratio, prop] = r.pick([[2.4, 'kerosene'], [3.6, 'methane'], [6, 'hydrogen'], [2.6, 'kerosene'], [3.5, 'methane']]);
        const M = r.pick([120, 200, 250, 360, 400, 450]);
        const ans = ratio * M / (1 + ratio);
        return {
          prompt: t`A stage carries $${M}$ t of liquid oxygen and ${prop} in total, loaded at a mixture ratio $r = ${ratio}$. How many tonnes of it are oxygen?`,
          answer: ans, units: 't', tol: { rel: 0.005 },
          errors: [{ value: M / (1 + ratio), feedback: t`That is the fuel, $1$ part in $1 + r$. The oxygen is the other $r$ parts.` }, { value: M / ratio, feedback: t`Dividing the whole by $r$ treats the ratio as a fraction of the whole. Out of every $1 + r = ${nice(1 + ratio)}$ tonnes, $${ratio}$ are oxygen.` }],
          hints: [t`The whole contains $1 + r = ${nice(1 + ratio)}$ equal parts.`, t`Oxygen fraction $= r/(1+r) = ${ratio}/${nice(1 + ratio)}$.`],
          teach: t`A ratio $r$ of two parts becomes fractions of the whole by dividing each part by $1 + r$.`,
          explain: t`$\dfrac{${ratio}}{${nice(1 + ratio)}} \times ${M}\ \text{t} = ${nice(sig(ans, 4))}$ t of oxygen, leaving $${nice(sig(M - ans, 4))}$ t of ${prop}.`,
          visual: splitBar(ratio, t`The load as one bar, split $${ratio} : 1$ by mass.`),
        };
      },
    }),
    num({
      id: 'parallel', difficulty: 2,
      gen(r) {
        const [R1, R2] = r.pick([[12, 6], [30, 20], [10, 40], [60, 30], [15, 10], [24, 8], [36, 12], [20, 5]]);
        const G1 = 1 / R1, G2 = 1 / R2, R = 1 / (G1 + G2);
        const top = (G1 + G2) * 1.25;
        return {
          prompt: t`Two heater elements on a satellite, $R_1 = ${R1}\ \Omega$ and $R_2 = ${R2}\ \Omega$, are wired in parallel, so $\dfrac{1}{R} = \dfrac{1}{R_1} + \dfrac{1}{R_2}$. Find the combined resistance $R$.`,
          answer: R, units: 'ohm', tol: { rel: 0.005 },
          errors: [{ value: R1 + R2, feedback: t`That is the series combination. In parallel the *reciprocals* add, and the result is smaller than either resistor.` }, { value: G1 + G2, feedback: t`That is $1/R$, the combined conductance in siemens. Take its reciprocal to get $R$.` }],
          hints: [t`Common denominator: $\dfrac1{${R1}} + \dfrac1{${R2}} = \dfrac{${R2} + ${R1}}{${R1 * R2}}$.`, t`Then flip the fraction: $R = \dfrac{${R1 * R2}}{${R1 + R2}}$.`],
          teach: t`$\tfrac1a + \tfrac1b = \tfrac{a+b}{ab}$, which is not $\tfrac{1}{a+b}$: reciprocals add, then you invert.`,
          explain: t`$\dfrac1R = \dfrac{${R1 + R2}}{${R1 * R2}}$, so $R = \dfrac{${R1 * R2}}{${R1 + R2}} = ${nice(R)}\ \Omega$ — less than the smaller resistor, as a parallel path must be.`,
          visual: numberLine({ x: [-0.004, top], xlabel: 'conductance 1/R (S)', points: [],
            arrows: [{ from: [0, 0.3], to: [G1, 0.3], color: 'accent', label: `1/${R1}`, labelDx: -24, labelDy: -14 }, { from: [G1, 0.3], to: [G1 + G2, 0.3], color: 'gold', label: `1/${R2}`, labelDx: -24, labelDy: -14 }],
            caption: t`Conductances (reciprocals of resistance) add tip to tail for parallel paths. The combined resistance is the reciprocal of the total length.` }),
        };
      },
    }),
    num({
      id: 'percent-change', difficulty: 2,
      gen(r) {
        const m1 = r.pick([4000, 4500, 5000, 6000, 8000]), cut = r.pick([200, 300, 450, 600, 750]);
        const m2 = m1 - cut, ans = 100 * cut / m1;
        return {
          prompt: t`A redesign cuts an upper stage’s dry mass from $${thou(m1)}$ kg to $${thou(m2)}$ kg. By what percentage did the dry mass fall?`,
          answer: ans, units: '%', tol: { rel: 0.005 },
          errors: [{ value: 100 * cut / m2, feedback: t`You divided by the *new* mass. A percentage change is measured against the starting value, $${thou(m1)}$ kg.` }],
          hints: [t`Percentage change $= \dfrac{\text{change}}{\text{original}} \times 100\%$.`],
          teach: t`A percentage change divides the change by the original value, not the new one.`,
          explain: t`$\dfrac{${cut}}{${thou(m1)}} \times 100\% = ${nice(sig(ans, 3))}\%$.`,
          visual: bars({ values: [m1, m2], labels: [`${m1} kg (before)`, `${m2} kg (after)`], xlabel: '', colors: ['ink3', 'accent'], y: [0, m1 * 1.22], caption: t`Dry mass before and after the redesign.` }),
        };
      },
    }),
    mcq({
      id: 'up-down', difficulty: 2,
      prompt: t`An engine throttles up by 20%, then down by 20% of its new thrust. Compared with where it started, its thrust is now:`,
      visual: bars({ values: [100, 120], labels: ['100% (start)', '120% (after +20%)'], xlabel: '', colors: ['ink3', 'accent'], y: [0, 145], x: [0.2, 3.8], caption: t`The first two settings. Where does the third bar end?` }),
      choices: ['4% lower', 'the same', '4% higher', '20% lower'],
      answer: 0,
      why: {
        1: t`The two 20%s are of different wholes: the cut is 20% of the *larger* thrust, so it removes more than was added.`,
        2: t`The cut is bigger than the increase, not smaller: $0.2 \times 120 = 24$ comes off after $20$ went on.`,
        3: t`That would mean the increase never happened. The two steps nearly cancel: $1.2 \times 0.8 = 0.96$.`,
      },
      hints: [t`Start from 100 units. After +20%: $120$.`, t`Now take 20% of 120 off.`],
      teach: t`Successive percentage changes multiply: $1.2 \times 0.8 = 0.96$.`,
      explain: t`$100 \times 1.2 = 120$, then $120 \times 0.8 = 96$: the thrust ends $4\%$ below where it started.`,
    }),
    mcq({
      id: 'add-fractions', difficulty: 2, kind: 'error',
      prompt: t`A student adds $\tfrac12 + \tfrac13$ and gets $\tfrac25$. What went wrong?`,
      visual: areaModel({
        x: [-0.3, 1.25], y: [-0.05, 0.95],
        rects: [
          { x: 0, y: 0.66, w: 0.5, h: 0.2, color: 'accent', label: '1/2' }, { x: 0.5, y: 0.66, w: 0.5, h: 0.2, color: 'ink4', alpha: 0.08 },
          { x: 0, y: 0.38, w: 1 / 3, h: 0.2, color: 'gold', label: '1/3' }, { x: 1 / 3, y: 0.38, w: 2 / 3, h: 0.2, color: 'ink4', alpha: 0.08 },
          { x: 0, y: 0.1, w: 0.4, h: 0.2, color: 'bad', label: '2/5' }, { x: 0.4, y: 0.1, w: 0.6, h: 0.2, color: 'ink4', alpha: 0.08 },
        ],
        sides: [{ x: -0.16, y: 0.76, label: 'one half' }, { x: -0.16, y: 0.48, label: 'one third' }, { x: -0.16, y: 0.2, label: 'their “sum”' }],
        caption: t`Each strip is one whole. The student’s answer is shorter than one of the two pieces it claims to add.`,
      }),
      choices: [
        t`Fractions add over a common denominator: $\tfrac36 + \tfrac26 = \tfrac56$`,
        t`Nothing: add the tops, add the bottoms`,
        t`The answer should be $\tfrac26$: denominators multiply, numerators add`,
        t`The answer should be $\tfrac15$: add the denominators only`,
      ],
      answer: 0,
      why: {
        1: t`Then $\tfrac12 + \tfrac12$ would be $\tfrac24 = \tfrac12$ — adding a half to a half would leave a half.`,
        2: t`$\tfrac26 = \tfrac13$, which is again smaller than one of the pieces. Only the denominators were made common; the numerators must be rescaled too.`,
        3: t`$\tfrac15$ is smaller still. A sum of positive numbers is larger than each of them.`,
      },
      hints: [t`Is $\tfrac25$ bigger or smaller than $\tfrac12$?`, t`Rewrite both in sixths before adding.`],
      teach: t`Only fractions with the same denominator — pieces of the same size — can have their numerators added.`,
      explain: t`$\tfrac12 = \tfrac36$ and $\tfrac13 = \tfrac26$, so the sum is $\tfrac56$. Adding tops and bottoms computes something else (the “mediant”), which always lies *between* the two fractions.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mass-fraction', difficulty: 2,
      gen(r) {
        const m0 = r.pick([550, 600, 420, 300, 800]), md = r.pick([0.06, 0.08, 0.1, 0.12]) * m0;
        const mp = m0 - md, ans = 100 * mp / m0;
        return {
          prompt: t`A stage has a liftoff mass of $${m0}$ t, of which $${nice(md)}$ t is dry structure, engines and avionics; the rest is propellant. What percentage of the liftoff mass is propellant?`,
          answer: ans, units: '%', tol: { rel: 0.003 },
          errors: [{ value: 100 * mp / md, feedback: t`That compares propellant with the dry mass — a ratio of parts. The question asks for a fraction of the whole liftoff mass.` }, { value: 100 * md / m0, feedback: t`That is the dry-mass share. Propellant is everything else.` }],
          hints: [t`Propellant mass $= ${m0} - ${nice(md)}$ t.`],
          teach: t`A fraction compares a part with the whole; a ratio compares two parts.`,
          explain: t`$\dfrac{${nice(mp)}}{${m0}} \times 100\% = ${nice(sig(ans, 3))}\%$ — typical of a launch-vehicle stage, which is mostly propellant.`,
          visual: areaModel({ x: [-0.05, 1.05], y: [-0.08, 0.42], rects: [{ x: 0, y: 0.1, w: md / m0, h: 0.2, color: 'ink3' }, { x: md / m0, y: 0.1, w: 1 - md / m0, h: 0.2, color: 'teal', label: 'propellant' }], sides: [{ x: md / m0 / 2, y: 0.36, label: 'dry' }, { x: 1, y: 0.36, label: 'liftoff mass' }], caption: t`The stage’s liftoff mass as one bar, to scale.` }),
        };
      },
    }),
    num({
      id: 'cp-isp', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[311, 330], [282, 311], [300, 348], [348, 380], [330, 363]]);
        const ans = 100 * (b - a) / a;
        return {
          prompt: t`Fitting a larger nozzle raises an engine’s specific impulse from $${a}$ s to $${b}$ s. What is the percentage increase?`,
          answer: ans, units: '%', tol: { rel: 0.005 },
          errors: [{ value: 100 * (b - a) / b, feedback: t`You divided by the new value. Measure the change against where it started, $${a}$ s.` }],
          hints: [t`Change $= ${b} - ${a} = ${b - a}$ s. Divide by the original.`],
          teach: t`Percentage change $= (\text{new} - \text{old})/\text{old} \times 100\%$.`,
          explain: t`$\dfrac{${b - a}}{${a}} \times 100\% = ${nice(sig(ans, 3))}\%$.`,
          visual: bars({ values: [a, b], labels: [`${a} s`, `${b} s`], xlabel: '', colors: ['ink3', 'accent'], y: [0, b * 1.22], caption: t`Specific impulse before and after; the bars start at zero so their lengths compare honestly.` }),
        };
      },
    }),
    num({
      id: 'cp-hydrogen-volume', difficulty: 3, transfer: true,
      gen(r) {
        const ratio = r.pick([5.5, 6, 6.5, 5]);
        const ans = (1 / ratio) * (RHO_LOX / RHO_LH2);
        return {
          prompt: t`A hydrogen–oxygen stage is loaded at mixture ratio $r = ${ratio}$ by mass. Liquid oxygen has density $${RHO_LOX}$ kg/m³ and liquid hydrogen $${RHO_LH2}$ kg/m³. What is the ratio of the hydrogen tank’s volume to the oxygen tank’s, $V_{\text{H}_2}/V_{\text{O}_2}$?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 / ratio, feedback: t`That is the mass ratio, fuel to oxidizer. Volume is mass divided by density, and hydrogen is very light.` }, { value: ratio * RHO_LH2 / RHO_LOX, feedback: t`That is upside down: oxygen volume over hydrogen volume.` }],
          hints: [t`For 1 kg of hydrogen there are $${ratio}$ kg of oxygen.`, t`Volume = mass / density: $V_{\text{H}_2} = 1/${RHO_LH2}$ and $V_{\text{O}_2} = ${ratio}/${RHO_LOX}$ (in m³ per kg of hydrogen).`, t`Divide the two: the kilograms cancel.`],
          teach: t`Unit ratios chain: a mass ratio times a density ratio gives a volume ratio, with the units cancelling at each step.`,
          explain: t`$\dfrac{V_{\text{H}_2}}{V_{\text{O}_2}} = \dfrac{1/${RHO_LH2}}{${ratio}/${RHO_LOX}} = \dfrac{${RHO_LOX}}{${ratio} \times ${RHO_LH2}} = ${nice(sig(ans, 3))}$. The hydrogen has $1/${ratio}$ of the oxygen’s mass but about ${nice(sig(ans, 2))} times its volume — which is why the hydrogen tank dominates a cryogenic stage.`,
          visual: bars({ values: [ratio, 1], labels: [`oxygen: ${ratio} kg`, 'hydrogen: 1 kg'], xlabel: '', ylabel: 'mass (kg)', colors: ['accent', 'warn'], y: [0, ratio * 1.25], caption: t`Masses per kilogram of hydrogen. Densities are at each liquid’s normal boiling point (90 K and 20 K); tanks also hold ullage gas, ignored here.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Prealgebra 2e, §4.5 Add and Subtract Fractions with Different Denominators', url: 'https://openstax.org/books/prealgebra-2e/pages/4-5-add-and-subtract-fractions-with-different-denominators' },
    { label: 'NIST Chemistry WebBook: thermophysical properties of oxygen and hydrogen (saturated liquid densities)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
  ],
});
