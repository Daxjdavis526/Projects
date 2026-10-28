// Scientific notation and orders of magnitude — from the proton to the observable universe.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig, tex } from '../../src/core/format.js';
import { N, logLadder, areaModel, thou } from './_m0kit.js';

const t = String.raw;

const C = 2.998e8;            // speed of light, m/s
const YR = 3.156e7;           // one year, s
const LY = 9.4607e15;         // light-year, m
const GM = 3.986004418e14;    // Earth, m³/s²

// lengths in metres: proton charge radius (CODATA 2018), hydrogen atom (twice the Bohr radius), …
const SIZES = {
  proton: [8.4e-16, 'proton', 'a proton’s radius'], atom: [1.06e-10, 'hydrogen atom', 'a hydrogen atom’s diameter'], human: [1.8, 'human', 'a person’s height'],
  earth: [6.371e6, 'Earth radius', 'Earth’s radius'], au: [1.496e11, 'Earth–Sun', 'the Earth–Sun distance'], ly: [LY, 'light-year', 'a light-year'],
  galaxy: [1e21, 'Milky Way', 'the Milky Way’s diameter'], universe: [4.4e26, 'observable universe', 'the radius of the observable universe'],
};
const ladderItems = (keys, color = {}) => keys.map((k) => ({ v: SIZES[k][0], label: SIZES[k][1], color: color[k] }));

export default lesson({
  id: 'm0.M0-1.4',
  title: 'Scientific notation and orders of magnitude',
  minutes: 7, difficulty: 1,
  intro: t`Physics spans about 42 powers of ten in length alone, from a proton to the edge of the observable universe. **Scientific notation** writes any number as a mantissa times a power of ten:

$$x = m \times 10^{n}, \qquad 1 \le |m| < 10$$

Multiply two such numbers by multiplying the mantissas and **adding** the exponents; divide by dividing and subtracting. The exponent alone, $n$, tells you the **order of magnitude** — which rung of the ladder a quantity stands on.`,
  symbols: [
    { tex: 'x', text: 'the number being written, with its unit' },
    { tex: 'm', text: 'the **mantissa** (or significand): one non-zero digit before the decimal point, then as many significant figures as the data justify' },
    { tex: 'n', text: 'the exponent, a whole number: how many places the decimal point moved (positive for big numbers, negative for small)' },
    { tex: '10^n', text: 'the power of ten: $10^3 = 1000$, $10^{-3} = 0.001$, $10^0 = 1$' },
  ],
  why: t`An order-of-magnitude check is the fastest error detector in physics: a satellite speed of $10^{5}$ m/s or an atom $10^{-6}$ m wide is wrong before you have found the slip.`,
  visual: {
    type: 'graph',
    title: 'The ladder of lengths',
    lead: t`Each gold dot is a real length, placed by its power of ten: one grid step is a factor of $10$. Slide the marker along the ladder and read its length in scientific notation.`,
    tasks: [
      t`Move from the proton to the hydrogen atom: about five steps — an atom is $10^{5}$ times wider than its nucleus.`,
      t`Put the marker at exponent $0$: one metre, human scale — about 15 steps up from a proton and 27 down from the edge of the observable universe.`,
      t`Count the steps from the Earth–Sun distance to a light-year: almost five. Interstellar distances dwarf the planetary ones.`,
    ],
    params: {
      x: [-17, 28.5], y: [-1, 1], xlog: true, aspect: 'wide', xlabel: 'length (m)', ylabel: '', yticks: 0, xticks: 9,
      sliders: [{ key: 'e', label: t`Exponent $n$ of the marker`, min: -16, max: 27, step: 0.25, value: 0, explain: t`The marker sits at $10^n$ metres; a step of $1$ multiplies the length by ten.` }],
      points: [...ladderItems(Object.keys(SIZES)).map((it, i) => ({ x: N(Math.log10(it.v)), y: 0, label: it.label, color: 'gold', r: 5, labelAlign: i === 7 ? 'right' : 'center', labelDx: i === 7 ? 8 : 0, labelDy: i % 2 ? 22 : -17 })),
        { x: 'e', y: 0.55, label: 'marker', color: 'violet', r: 6, labelAlign: 'center', labelDx: 0, labelDy: -16 }],
      arrows: [{ from: ['e', 0.42], to: ['e', 0.1], color: 'violet', width: 2 }],
      readouts: [{ label: 'marker length', expr: '10^e', unit: t`\text{m}`, digits: 3 }],
    },
    caption: t`Each dot is placed by its power of ten, so equal steps are equal *factors*, not equal distances. The Milky Way’s diameter (about $10^{21}$ m) is a round figure — galaxies have no sharp edge.`,
  },
  example: {
    prompt: t`How long does sunlight take to reach Earth? The distance is $1.496 \times 10^{11}$ m and light travels at $2.998 \times 10^{8}$ m/s.`,
    visual: logLadder({ items: [{ v: C, label: 'light-second' }, { v: 1.496e11, label: 'Earth–Sun' }], x: [6.5, 13], xlabel: 'distance (m)', alternate: false, caption: t`The Sun is between two and three powers of ten farther away than light travels in one second.` }),
    steps: [
      { label: 'Set up', text: t`$t = \dfrac{d}{c} = \dfrac{1.496 \times 10^{11}\ \text{m}}{2.998 \times 10^{8}\ \text{m/s}}$.` },
      { label: 'Split the parts', text: t`Mantissas divide: $1.496 / 2.998 = 0.4990$. Exponents subtract: $10^{11}/10^{8} = 10^{3}$.` },
      { label: 'Normalise', text: t`$0.4990 \times 10^{3}$ has a mantissa below 1, so move the point: $4.990 \times 10^{2}$ s.` },
      { label: 'Convert', text: t`$499.0\ \text{s} / 60 = 8.32$ minutes.` },
      { label: 'Sense check', text: t`The picture agrees: the Sun sits two and a half rungs above one light-second, and $10^{2.7} \approx 500$.` },
    ],
    answer: t`$t = 4.99 \times 10^{2}$ s $\approx 8.3$ minutes.`,
  },
  practice: [
    num({
      id: 'light-time', difficulty: 1,
      gen(r) {
        const [name, d] = r.pick([['the Moon (from Earth)', 3.844e8], ['Jupiter (from the Sun)', 7.785e11], ['Neptune (from the Sun)', 4.495e12], ['Mars at a close approach to Earth', 5.6e10], ['Saturn (from the Sun)', 1.434e12]]);
        const ans = d / C;
        return {
          prompt: t`The distance to ${name} is $${tex(d, 4)}$ m. How long does light, at $2.998 \times 10^{8}$ m/s, take to cover it?`,
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: C / d, feedback: t`That is $c/d$, upside down: time is distance divided by speed.` }, { value: d * C, feedback: t`You multiplied. Time is distance *divided* by speed, so the exponents subtract.` }],
          hints: [t`$t = d/c$: divide the mantissas, subtract the exponents.`],
          teach: t`Dividing in scientific notation: divide the mantissas, subtract the exponents, then renormalise.`,
          explain: t`$\dfrac{${tex(d, 4)}}{2.998 \times 10^{8}} = ${tex(ans, 3)}$ s.`,
          visual: logLadder({ items: [{ v: C, label: 'light-second' }, { v: d, label: name.split(' (')[0].replace(' at a close approach to Earth', ''), color: 'accent' }], x: [6.5, 14], xlabel: 'distance (m)', alternate: false, caption: t`The distance and one light-second, placed by their powers of ten.` }),
        };
      },
    }),
    num({
      id: 'orders-apart', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([['proton', 'atom'], ['atom', 'human'], ['earth', 'au'], ['au', 'ly'], ['ly', 'galaxy']]);
        const va = SIZES[a][0], vb = SIZES[b][0], ans = Math.round(Math.log10(vb / va));
        const naive = Math.floor(Math.log10(vb)) - Math.floor(Math.log10(va));
        return {
          prompt: t`Compare ${SIZES[a][2]}, $${tex(va, 3)}$ m, with ${SIZES[b][2]}, $${tex(vb, 3)}$ m. By how many orders of magnitude do they differ? (Round the ratio to the nearest power of ten and give the exponent.)`,
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: naive !== ans ? [{ value: naive, feedback: t`Subtracting the exponents ignores the mantissas. The ratio is $${tex(vb / va, 2)}$, which is closer to $10^{${ans}}$.` }] : [],
          hints: [t`Divide the larger by the smaller.`, t`Round the ratio to the nearest power of ten: take its $\log_{10}$ and round that.`],
          teach: t`Two quantities differ by $k$ orders of magnitude when their ratio is about $10^k$ — the mantissas can shift the answer by one.`,
          explain: t`$\dfrac{${tex(vb, 3)}}{${tex(va, 3)}} = ${tex(vb / va, 2)}$, and $\log_{10}$ of that is $${nice(sig(Math.log10(vb / va), 2))}$, so about $${ans}$ orders of magnitude.`,
          visual: logLadder({ items: ladderItems([a, b]), x: [Math.floor(Math.log10(va)) - 1.5, Math.ceil(Math.log10(vb)) + 1.5], alternate: false, caption: t`The two lengths on a power-of-ten axis; each grid step is a factor of ten.` }),
        };
      },
    }),
    mcq({
      id: 'km2', difficulty: 2,
      prompt: t`A launch exclusion zone covers $3\ \text{km}^2$. How many square metres is that?`,
      visual: areaModel({ x: [-0.8, 1.8], y: [-0.35, 1.2], rects: [{ x: 0, y: 0, w: 1, h: 1, color: 'teal', alpha: 0.25, label: '1 km²' }], sides: [{ x: 0.5, y: -0.15, label: '1 km = 10³ m' }, { x: 1.4, y: 0.5, label: '1 km = 10³ m' }], caption: t`One square kilometre: a square $10^3$ m on each side.` }),
      choices: [t`$3 \times 10^{6}\ \text{m}^2$`, t`$3 \times 10^{3}\ \text{m}^2$`, t`$9 \times 10^{6}\ \text{m}^2$`, t`$3 \times 10^{9}\ \text{m}^2$`],
      answer: 0,
      why: {
        1: t`That converts only one of the two lengths. $\text{km}^2 = \text{km} \times \text{km}$, and each km is $10^3$ m: $(10^3)^2 = 10^6$.`,
        2: t`The 3 counts how many square kilometres there are; it is not a length and is not squared.`,
        3: t`$10^9$ is the conversion for cubic kilometres, $(10^3)^3$.`,
      },
      hints: [t`$1\ \text{km}^2 = (10^3\ \text{m})^2$.`],
      teach: t`A unit raised to a power carries its conversion factor raised to the same power: $(10^3)^2 = 10^6$.`,
      explain: t`$1\ \text{km}^2 = (10^3\ \text{m})^2 = 10^6\ \text{m}^2$, so $3\ \text{km}^2 = 3 \times 10^6\ \text{m}^2$.`,
    }),
    mcq({
      id: 'normalise', difficulty: 1,
      prompt: t`Which of these is $0.000\,042\,7$ written in normalised scientific notation?`,
      choices: [t`$4.27 \times 10^{-5}$`, t`$42.7 \times 10^{-6}$`, t`$4.27 \times 10^{5}$`, t`$4.27 \times 10^{-4}$`],
      answer: 0,
      why: {
        1: t`It has the right value, but the mantissa $42.7$ is not between 1 and 10, so it is not normalised.`,
        2: t`A positive exponent makes a large number. Moving the point to the *right* to reach $4.27$ gives a negative exponent.`,
        3: t`Count the moves: the point goes past 0, 0, 0, 0, 4 — five places, not four.`,
      },
      hints: [t`Move the decimal point until exactly one non-zero digit is in front of it, counting the moves.`],
      teach: t`The exponent counts how many places the point moved; moving right (for a small number) makes it negative.`,
      explain: t`The point moves five places right to give $4.27$, so the number is $4.27 \times 10^{-5}$.`,
    }),
    num({
      id: 'mass-ratio', difficulty: 2,
      gen(r) {
        const [na, ma, nb, mb] = r.pick([['the Sun', 1.989e30, 'Earth', 5.972e24], ['Earth', 5.972e24, 'the Moon', 7.342e22], ['Jupiter', 1.898e27, 'Earth', 5.972e24], ['the Sun', 1.989e30, 'Jupiter', 1.898e27]]);
        const ans = ma / mb;
        return {
          prompt: t`The mass of ${na} is $${tex(ma, 4)}$ kg and that of ${nb} is $${tex(mb, 4)}$ kg. How many times more massive is ${na}?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: mb / ma, feedback: t`That is the ratio the other way round. Put the larger mass on top.` }],
          hints: [t`Divide the mantissas and subtract the exponents: $${tex(ma, 4)} / ${tex(mb, 4)}$.`],
          teach: t`A ratio of two quantities in scientific notation is a ratio of mantissas times $10$ to the difference of exponents.`,
          explain: t`$\dfrac{${tex(ma, 4)}}{${tex(mb, 4)}} = ${tex(ans, 3)}$.`,
          visual: logLadder({ items: [{ v: mb, label: nb }, { v: ma, label: na, color: 'accent' }], x: [Math.floor(Math.log10(mb)) - 1.5, Math.ceil(Math.log10(ma)) + 1.5], xlabel: 'mass (kg)', alternate: false, caption: t`The two masses, placed by their powers of ten.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-orbital-speed', difficulty: 3,
      gen(r) {
        const h = r.pick([400, 550, 800, 1200]), rr = (6371 + h) * 1e3, v = Math.sqrt(GM / rr);
        return {
          prompt: t`A satellite circles Earth at $${h}$ km altitude, so its orbit radius is $r = ${thou(6371 + h)}$ km. Its speed is $v = \sqrt{GM/r}$ with $GM = ${tex(GM, 4)}\ \text{m}^3/\text{s}^2$. Find $v$ in km/s.`,
          answer: v / 1e3, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(GM / (6371 + h)) / 1e3, feedback: t`The radius must be in metres to match the m³/s² in $GM$: $${thou(6371 + h)}$ km $= ${tex(rr, 4)}$ m.` }],
          hints: [t`Convert $r$ to metres first.`, t`$GM/r$ comes out in m²/s²; write it as a power of ten with an *even* exponent before taking the square root.`],
          teach: t`To take a square root by hand, make the exponent even: $\sqrt{58.9 \times 10^{6}} = \sqrt{58.9} \times 10^{3}$.`,
          explain: t`$GM/r = ${tex(GM / rr, 3)}\ \text{m}^2/\text{s}^2$, so $v = ${tex(v, 3)}$ m/s $= ${nice(sig(v / 1e3, 3))}$ km/s.`,
          visual: { type: 'graph', params: { x: [6, 9], y: [5.5, 8.5], aspect: 'wide', xlabel: 'orbit radius r (thousand km)', ylabel: 'v (km/s)', yticks: 0,
            curves: [{ fn: `sqrt(${N(GM / 1e6)}/x)/1000`, color: 'accent' }], vlines: [{ x: N(rr / 1e6), label: `${h} km up`, color: 'gold' }, { x: 6.371, label: 'Earth’s surface', color: 'ink3' }] },
            caption: t`Circular-orbit speed against radius; the speed scale is hidden. Real orbits in low Earth orbit also feel a little air drag.` },
        };
      },
    }),
    mcq({
      id: 'cp-atoms-mm', difficulty: 2,
      prompt: t`Roughly how many hydrogen atoms, each about $10^{-10}$ m across, laid side by side span $1$ mm?`,
      visual: logLadder({ items: [{ v: 1.06e-10, label: 'hydrogen atom' }, { v: 1e-3, label: '1 mm' }], x: [-11.5, -1.5], alternate: false, caption: t`The two lengths on a power-of-ten axis.` }),
      choices: [t`$10^{7}$`, t`$10^{-7}$`, t`$10^{13}$`, t`$10^{3}$`],
      answer: 0,
      why: {
        1: t`A count of atoms cannot be less than one. You divided the small length by the large one.`,
        2: t`You added the exponents $(-3) + (-10)$ and dropped the sign. A count is a ratio: $10^{-3} / 10^{-10} = 10^{-3 - (-10)}$.`,
        3: t`$1$ mm is $10^{-3}$ m, not $10^{-7}$ m; check the conversion before dividing.`,
      },
      hints: [t`Count $= \dfrac{\text{length to cover}}{\text{length of one atom}}$.`],
      teach: t`“How many fit” is a ratio of two lengths, and dividing powers of ten subtracts their exponents.`,
      explain: t`$\dfrac{10^{-3}\ \text{m}}{10^{-10}\ \text{m}} = 10^{-3 + 10} = 10^{7}$: ten million atoms to the millimetre.`,
    }),
    num({
      id: 'cp-star-light', difficulty: 2, transfer: true,
      gen(r) {
        const [name, lyv] = r.pick([['Proxima Centauri', 4.2465], ['Sirius', 8.6], ['Vega', 25.0]]);
        const d = lyv * LY, s = d / C, yrs = s / YR;
        return {
          prompt: t`${name} is $${tex(d, 3)}$ m away. How many years does its light take to reach us? (Use $c = 2.998 \times 10^{8}$ m/s and $1\ \text{yr} = 3.156 \times 10^{7}$ s.)`,
          answer: yrs, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: s, feedback: t`That is the time in seconds. Divide by $3.156 \times 10^{7}$ s per year.` }],
          hints: [t`Time in seconds: $d/c$.`, t`Then divide by the number of seconds in a year.`],
          teach: t`Chained divisions in scientific notation are just repeated subtraction of exponents, with a renormalisation at the end.`,
          explain: t`$t = \dfrac{${tex(d, 3)}}{2.998 \times 10^{8}} = ${tex(s, 3)}$ s $= \dfrac{${tex(s, 3)}}{3.156 \times 10^{7}} = ${nice(sig(yrs, 3))}$ yr — so the star is $${nice(sig(yrs, 3))}$ light-years away, by definition.`,
          visual: logLadder({ items: ladderItems(['au', 'ly']).concat([{ v: d, label: name, color: 'accent' }]), x: [10, 18.5], xlabel: 'distance (m)', caption: t`Earth–Sun, one light-year and the star’s distance on one power-of-ten axis.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §1.2 Exponents and Scientific Notation', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-2-exponents-and-scientific-notation' },
    { label: 'OpenStax University Physics Vol. 1, §1.3 Unit Conversion and §1.5 Estimates', url: 'https://openstax.org/books/university-physics-volume-1/pages/1-5-estimates-and-fermi-calculations' },
    { label: 'CODATA 2018 recommended values (proton charge radius, Bohr radius)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
