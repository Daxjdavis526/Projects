// Radioactivity — alpha, beta and gamma decay; each nucleus decays at random
// with a fixed probability per unit time, so N = N₀2^(−t/T½) = N₀e^(−λt);
// activity R = λN in becquerels; half-life without memory; dating with
// carbon-14; the heat of plutonium-238 in a radioisotope power source.
// Half-lives and decay energies from model/qm-nuclear.js (NUBASE2020;
// carbon-14 at its conventional 5730 years).
import { lesson, mcq, match, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as Nu from '../../src/viz/model/qm-nuclear.js';
import { r6 } from './_modern.js';

const t = String.raw;

const MEV_J = 1.602176634e-13;              // J per MeV
const YR_S = 3.156e7;                        // s, the rounded year the problems print
const UNIT_WORD = { d: 'days', h: 'hours', yr: 'years' };
const ISO = Nu.ISOTOPES;

/** A still picture of the model sample at time `at` (in half-lives). */
const sample = (isotope, at, caption, extra = {}) => ({
  type: 'qm-decay', params: { isotope, t: r6(at), N0: 400, controls: false, readout: false, ...extra }, caption,
});

/**
 * Heat against time from a plutonium-238 source: in watts for one that gave
 * 2000 W at launch, or (relative) as a percentage of the launch heat.
 */
function heatCurve({ mark, frac, relative = false, caption } = {}) {
  const P0 = relative ? 100 : 2000, T = ISO.pu238.T, unit = relative ? '%' : ' W';
  const pts = [{ x: r6(T), y: P0 / 2, color: 'accent', r: 4, label: `one half-life: ${P0 / 2}${unit}`, labelDx: 8, labelDy: -12 }];
  if (mark) pts.push({ x: r6(mark), y: r6(P0 * 2 ** (-mark / T)), color: 'gold', r: 6, label: `after ${mark} years: ${fmt(P0 * 2 ** (-mark / T), 3)}${unit}`, labelDx: 8, labelDy: -14 });
  return {
    type: 'graph',
    params: {
      x: [0, 130], y: [0, P0 * 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'years after launch', ylabel: relative ? 'heat (% of launch)' : 'heat output (W)',
      curves: [{ fn: `${P0}*2^(-x/${T})`, color: 'warn', width: 2.4 }],
      hlines: frac ? [{ y: r6(P0 * frac), color: 'gold', label: `${Math.round(frac * 100)}% of the launch heat` }] : [],
      points: pts,
    },
    caption: caption ?? 'Heat from a plutonium-238 source that gave 2000 W at launch: it halves every 87.7 years.',
  };
}

/** The fraction of carbon-14 left against time since death, with a measured level marked. */
function c14Curve(f, caption) {
  const T = ISO.c14.T / 1000;
  return {
    type: 'graph',
    params: {
      x: [0, 25], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'thousands of years since death', ylabel: 'carbon-14 left',
      curves: [{ fn: `2^(-x/${T})`, color: 'accent', width: 2.4 }],
      vlines: [1, 2, 3, 4].map((k) => ({ x: r6(k * T), color: 'ink3', label: k === 1 ? 'T½' : `${k}T½` })),
      hlines: [{ y: r6(f), color: 'gold', label: `measured: ${Math.round(f * 100)}% of the living level` }],
    },
    caption: caption ?? 'The fraction of carbon-14 left in once-living material, against time since death: it halves every 5730 years.',
  };
}

/** Count-rate measurements every hour or two, with the small scatter real counting shows; first and last labelled. */
function countRates({ R0, T, dt }) {
  const scatter = [0, 0.03, -0.025, 0.02, -0.03, 0.015, 0], n = 6, pts = [];
  for (let i = 0; i <= n; i++) {
    const tt = (i * dt) / n, v = R0 * 2 ** (-tt / T) * (1 + scatter[i]);
    const ends = i === 0 || i === n;
    // the first reading labelled above and to the right, the last below and to the left (clear of its neighbour)
    pts.push({ x: r6(tt), y: r6(v), color: ends ? 'gold' : 'accent', r: ends ? 5.5 : 4, ...(ends ? { label: `${Math.round(v)} per minute`, labelDx: i === 0 ? 10 : -4, labelDy: i === 0 ? -14 : 18, labelAlign: i === 0 ? 'left' : 'right' } : {}) });
  }
  return {
    type: 'graph',
    params: { x: [-0.5, dt + 1.5], y: [0, r6(R0 * 1.15)], aspect: 'wide', axesAt: 'edge', xlabel: 'hours after 8:00', ylabel: 'counts per minute', points: pts },
    caption: 'The detector’s readings. They scatter a little about a smooth curve because decay is random; the first and last are the ones in the question.',
  };
}

/** The activity of a sample against time, as a fraction of its starting value, with half-lives marked. */
function activityCurve(T, unit, caption) {
  const marks = [[0, 1, 'R₀ = ?'], [T, 0.5, 'R₀/2'], [2 * T, 0.25, 'R₀/4'], [3 * T, 0.125, 'R₀/8']];
  return {
    type: 'graph',
    params: {
      x: [0, r6(5 * T)], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', yticks: 0, xlabel: unit, ylabel: 'activity',
      curves: [{ fn: `2^(-x/${T})`, color: 'warn', width: 2.4 }],
      points: marks.map(([x, y, s], k) => ({ x: r6(x), y, color: k ? 'accent' : 'gold', r: k ? 4 : 5.5, label: s, labelDx: 8, labelDy: -12 })),
    },
    caption,
  };
}

/**
 * A corner of the chart of nuclides: protons Z across, neutrons N up, one dot
 * per nucleus, a parent (gold) and three numbered decay arrows.
 */
function nzChart() {
  const dots = [];      // 11 columns by 7 rows fills a 16:10 picture with square cells
  for (let Z = 5; Z <= 15; Z++) for (let N = 7; N <= 13; N++) if (!(Z === 10 && N === 10)) dots.push({ x: Z, y: N, color: 'ink3', r: 3 });
  return {
    type: 'graph',
    params: {
      x: [4.5, 15.5], y: [6.5, 13.5], equal: true, axesAt: 'edge', xticks: 12, yticks: 8, xlabel: 'Z (protons)', ylabel: 'N (neutrons)',
      points: [...dots, { x: 10, y: 10, color: 'gold', r: 7, label: 'parent', labelDx: 10, labelDy: -12 }],
      arrows: [
        { from: [10, 10], to: [11, 9], color: 'accent', label: '1', labelDx: 10, labelDy: 6 },
        { from: [10, 10], to: [8, 8], color: 'accent', label: '2', labelDx: -12, labelDy: 6 },
        { from: [10, 10], to: [9, 11], color: 'accent', label: '3', labelDx: -12, labelDy: -6 },
      ],
    },
    caption: 'A corner of the chart of nuclides: each dot is a nucleus with Z protons and N neutrons. Each arrow leads from the parent to the nucleus left after one kind of decay.',
  };
}

// numbers computed once
const I131 = { N: (1e-6 / 130.9) * Nu.NA, lam: Math.LN2 / (8.02 * 86400) };
I131.R = I131.N * I131.lam;
const PU = { N: Nu.NA / 238.05, lam: Math.LN2 / (87.7 * YR_S), Q: 5.59 * MEV_J };
PU.R = PU.N * PU.lam;
PU.P = PU.R * PU.Q;

export default lesson({
  id: 'phys2220.A1.3',
  title: 'Radioactivity',
  minutes: 13, difficulty: 2,
  intro: t`Some nuclei are unstable. Sooner or later each one **decays**, throwing out an alpha particle (a helium-4 nucleus), a beta particle (an electron or a positron) or a gamma-ray photon, and becoming a more stable nucleus. *When* a particular nucleus decays is pure chance. All that is fixed is the probability $\lambda\,dt$ that it decays in the next instant $dt$ — the same however long it has already lasted. Out of $N$ nuclei, $\lambda N\,dt$ decay, so $dN = -\lambda N\,dt$ and

$$N(t) = N_0\,e^{-\lambda t} = N_0\,2^{-t/T_{1/2}}, \qquad T_{1/2} = \frac{\ln 2}{\lambda}$$

Each half-life halves whatever is left: after one, half remains; after two, a quarter — **not none**; after ten, about a thousandth. The **activity** $R = \lambda N$, the number of decays per second, falls in step. Its unit is the becquerel: 1 Bq is one decay per second.

> Continue in [Introductory Modern Physics](#/course/phys2710), whose last module asks why some nuclei decay and others last forever.`,
  symbols: [
    { tex: 'N,\\ N_0', text: 'the number of undecayed nuclei at time $t$, and at $t = 0$' },
    { tex: '\\lambda', text: 'the decay constant: the probability per unit time that any one nucleus decays, in $\\text{s}^{-1}$' },
    { tex: 'T_{1/2}', text: 'the half-life, the time for half the nuclei to decay: $T_{1/2} = \\ln 2/\\lambda = 0.693/\\lambda$' },
    { tex: 'R', text: 'the activity, decays per second: $R = \\lambda N$, in becquerels (Bq)' },
    { tex: '\\alpha,\\ \\beta,\\ \\gamma', text: 'an alpha particle (a ${}^{4}\\text{He}$ nucleus), a beta particle (an electron $e^-$ or a positron $e^+$) and a gamma ray (a high-energy photon)' },
  ],
  why: 'Radioactive decay powers spacecraft far beyond the reach of sunlight, dates bones and rocks, and images and treats disease — and its law, the exponential, is the same one that empties a capacitor through a resistor.',
  visual: {
    type: 'qm-decay',
    title: 'Decay, one nucleus at a time',
    lead: 'Four hundred plutonium-238 nuclei, each with the same chance of decaying in every moment. The staircase counts the survivors; the smooth curve is the exponential law.',
    tasks: [
      'Watch one half-life pass: about half the squares turn grey. After two, about a quarter are still blue — not none.',
      'Press New sample a few times: the staircase wanders around the curve, more for 100 nuclei than for 1600.',
      'Pause and step with +1 half-life: each step halves what is left, however many have gone before.',
      'Switch isotopes: the time axis runs in hours for technetium-99m and in thousands of years for carbon-14, but the shape never changes.',
    ],
    params: { isotope: 'pu238', N0: 400 },
  },
  example: {
    prompt: t`The power source of NASA’s Perseverance rover, a radioisotope thermoelectric generator, holds 4.8 kg of plutonium dioxide that gave about 2000 W of heat at launch. Plutonium-238 has a half-life of 87.7 years. How much heat does it give at the end of its 14-year design life?`,
    visual: heatCurve({ mark: 14, caption: 'Heat from the generator’s plutonium-238 against time: it halves every 87.7 years.' }),
    steps: [
      { label: 'Heat follows the nuclei', text: t`Every decay releases the same energy, so the heat output is proportional to the activity $R = \lambda N$ and falls with the same half-life: $P = P_0\,2^{-t/T_{1/2}}$.` },
      { label: 'Count half-lives', text: t`$t/T_{1/2} = 14/87.7 = ${fmt(14 / 87.7, 3)}$ — a small fraction of one half-life.` },
      { label: 'Apply the law', text: t`$P = 2000\ \text{W}\times2^{-${fmt(14 / 87.7, 3)}} = 2000\times${fmt(2 ** (-14 / 87.7), 3)} = ${fmt(2000 * 2 ** (-14 / 87.7), 3)}$ W.` },
      { label: 'Sense check', text: t`About 10% lost in 14 years: ${fmt(100 * (1 - 2 ** (-1 / 87.7)), 2)}% a year. A short-lived isotope would fade during the mission, while a very long-lived one would give too little heat per gram; 88 years suits a mission of decades.` },
      { label: 'From heat to electricity', text: 'Thermocouples turn about a twentieth of the heat into roughly 110 W of electricity at launch. The electrical output falls faster than the heat, because the thermocouples themselves slowly degrade.' },
    ],
    answer: t`About ${fmt(2000 * 2 ** (-14 / 87.7), 3)} W — ${fmt(100 * 2 ** (-14 / 87.7), 2)}% of the launch heat.`,
  },
  practice: [
    num({
      id: 'fraction-left', difficulty: 1,
      gen(r) {
        const iso = r.pick(['i131', 'tc99m', 'rn222', 'co60']), n = r.pick([2, 3, 4]);
        const { T, unit, label: name } = ISO[iso], word = UNIT_WORD[unit], tt = +(n * T).toFixed(2);
        const note = { i131: 'After ten half-lives — about 80 days — a thousandth would remain.', tc99m: 'Its six-hour half-life suits medical imaging: long enough for a scan, mostly gone within a day.', rn222: 'Radon seeping from the ground keeps replacing what decays, which is why it can build up in basements.', co60: 'Radiotherapy units replace their cobalt-60 sources every several years as the activity falls.' }[iso];
        return {
          prompt: t`The half-life of ${name} is ${T} ${word}. What fraction of a sample is still undecayed after ${fmt(tt, 4)} ${word}?`,
          answer: 2 ** -n, tol: { rel: 0.01 },
          errors: [
            { value: 1 - 2 ** -n, feedback: 'That is the fraction that has decayed. The question asks what is left.' },
            ...(n === 2 ? [{ value: 0, feedback: 'Two half-lives do not use a sample up: the second halves what the first left, leaving a quarter.' }] : []),
          ],
          hints: [t`How many half-lives is ${fmt(tt, 4)} ${word}?`],
          teach: 'Each half-life halves what is left, so after n half-lives the fraction left is (1/2)ⁿ.',
          explain: t`$${fmt(tt, 4)}/${T} = ${n}$ half-lives, so $\left(\tfrac12\right)^{${n}} = ${fmt(2 ** -n, 4)}$ of the sample remains. ${note}`,
          visual: sample(iso, n, `A model sample of ${name}, ${n} half-lives on: blue squares are undecayed nuclei, grey ones have decayed.`, { hide: ['count'] }),
        };
      },
    }),
    mcq({
      id: 'two-half-lives', difficulty: 1,
      prompt: 'Radon-222 has a half-life of 3.82 days. Some radon is sealed in a jar, and after 3.82 days half of it has decayed. How much of the original radon is left after another 3.82 days?',
      choices: [
        'A quarter',
        'None: the other half decays during the second half-life',
        'Half: the nuclei that survived the first half-life are the stable ones',
        'More than a quarter: with fewer nuclei left, the decay slows down',
      ],
      answer: 0,
      why: {
        1: 'Half-lives do not add up to a whole. Each half-life halves whatever is left: the second removes half of the remaining half, leaving a quarter.',
        2: 'Survivors are not tougher: every radon nucleus has the same 50% chance of decaying in the next 3.82 days, however long it has existed.',
        3: 'Fewer nuclei do mean fewer decays per second, but each one left still has a 50% chance of decaying in the next half-life, so the fraction lost stays one half.',
      },
      hints: ['In each half-life, what fraction of the nuclei present at its start decays?'],
      teach: 'Each half-life halves whatever is left — a half, then a quarter, then an eighth — so a sample is not used up after two half-lives.',
      explain: 'The first half-life leaves a half; the second halves that, leaving a quarter; the third leaves an eighth. The amount falls ever more slowly and never reaches zero in a set number of half-lives — a real sample is gone only when, by chance, its last nucleus decays.',
      visual: sample('rn222', 1, 'A model sample of radon-222 after one half-life: about half the nuclei (blue) remain.'),
    }),
    mcq({
      id: 'no-memory', difficulty: 2,
      prompt: t`One particular carbon-14 nucleus in an old bone has survived 20 000 years — about 3.5 half-lives — while ${fmt(100 * (1 - 2 ** (-20000 / 5730)), 2)}% of the carbon-14 nuclei the animal held when it died have decayed. What is the chance that this nucleus decays in the next 5730 years?`,
      choices: [
        '50%, the same as for any carbon-14 nucleus',
        'More than 50%: it is overdue, having outlived most of the others',
        'Less than 50%: having lasted so long, it must be an unusually stable one',
        `About ${fmt(100 * 2 ** (-20000 / 5730), 1)}%: the fraction of the original nuclei still left`,
      ],
      answer: 0,
      why: {
        1: 'A nucleus does not age. Its chance of decaying in the next 5730 years is 50% whether it formed yesterday or 20 000 years ago: nothing inside it keeps track of time.',
        2: 'All carbon-14 nuclei are identical; none is more stable than another. The survivors are simply the ones that, by chance, have not decayed yet.',
        3: 'That percentage describes the whole sample — how many of the original nuclei survive. It says nothing about one survivor’s future.',
      },
      hints: ['Does a nucleus have any way to remember how long it has existed?'],
      teach: 'Decay has no memory: every undecayed nucleus has the same chance of decaying in the next half-life, however old it is.',
      explain: 'Every undecayed carbon-14 nucleus has a 50% chance of decaying in the next 5730 years. That lack of memory is exactly why the half-life is the same at every stage of a sample’s life, and why the decay law is an exponential.',
      visual: sample('c14', 20000 / 5730, 'A model sample of carbon-14 after 3.5 half-lives: the few blue squares are the survivors.'),
    }),
    num({
      id: 'half-life-from-data', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3]), T = r.pick([4, 6, 8]), R0 = r.pick([3200, 4800, 6400]);
        const dt = k * T, R1 = R0 / 2 ** k;
        return {
          prompt: t`A detector beside a sample of a radioactive tracer counts ${R0} decays per minute at 8:00, and ${R1} per minute ${dt} hours later. What is the tracer’s half-life, in hours?`,
          answer: T, units: 'h', tol: { rel: 0.01 },
          errors: [
            { value: dt, feedback: `In those ${dt} hours the count rate fell to 1/${2 ** k} of its start, not to a half: several half-lives passed.` },
            { value: dt / 2 ** k, feedback: `Do not divide the time by the drop factor, ${2 ** k}. Count how many halvings make the drop: those halvings took the whole ${dt} hours.` },
          ],
          hints: [`How many times must ${R0} be halved to reach ${R1}?`, `Those halvings took the whole ${dt} hours.`],
          teach: 'Count the halvings: if the activity falls to 1/2ⁿ of its start, n half-lives have passed.',
          explain: t`$${R0} \to ${R0 / 2} \to ${R0 / 4}${k === 3 ? ` \\to ${R0 / 8}` : ''}$: ${k} halvings in ${dt} hours, so $T_{1/2} = ${dt}/${k} = ${T}$ h. The count rate is proportional to the number of nuclei left, so it halves with the same half-life.${T === 6 ? ' A six-hour half-life matches technetium-99m, the workhorse of medical imaging.' : ''}`,
          visual: countRates({ R0, T, dt }),
        };
      },
    }),
    num({
      id: 'carbon-dating', difficulty: 3,
      gen(r) {
        const f = r.pick([0.3, 0.4, 0.6, 0.7]), T = ISO.c14.T, age = T * Math.log2(1 / f), pct = Math.round(f * 100);
        return {
          prompt: t`While a tree lives, its wood keeps a steady level of carbon-14; once it dies, the carbon-14 decays with a half-life of 5730 years. Charcoal from an ancient campfire holds ${pct}% of the carbon-14 that living wood does. How old is the charcoal, in years?`,
          answer: age, units: 'yr', tol: { rel: 0.01 },
          errors: [
            { value: ((1 - f) / 0.5) * T, feedback: t`That treats the decay as a straight line, losing the same amount each year. Each half-life halves what is left: solve $${f} = 2^{-t/5730}$ with logarithms.` },
            { value: T * Math.log(1 / f), feedback: t`$t = T_{1/2}\log_2(1/f) = T_{1/2}\,\ln(1/f)/\ln 2$: divide by $\ln 2$.` },
          ],
          hints: [t`Solve $${f} = 2^{-t/5730}$ for $t$.`, t`Take logarithms: $t = 5730\times\dfrac{\ln(1/${f})}{\ln 2}$.`],
          teach: 'An age comes from turning the decay law around: t = T½ log₂(N₀/N).',
          explain: t`$t = 5730\,\dfrac{\ln(1/${f})}{\ln 2} = ${fmt(age, 4)}$ years. In practice, radiocarbon laboratories report ages with Willard Libby’s older half-life of 5568 years and then calibrate them against tree rings, because the carbon-14 level of the air has varied over the centuries.`,
          visual: c14Curve(f),
        };
      },
    }),
    num({
      id: 'activity', difficulty: 3,
      prompt: t`Thyroid cancer is treated with iodine-131 (half-life 8.02 days, molar mass 130.9 g/mol), which the thyroid gland absorbs. What is the activity of just 1.00 μg of iodine-131, in becquerels?`,
      answer: I131.R, units: 'Bq', tol: { rel: 0.01 },
      errors: [
        { value: (Math.LN2 / 8.02) * I131.N, feedback: 'That is in decays per day. A becquerel is one decay per second: convert the half-life to seconds.' },
        { value: I131.N / (8.02 * 86400), feedback: t`The decay constant is $\lambda = \ln 2/T_{1/2}$: include the $\ln 2$.` },
      ],
      hints: [t`Number of nuclei: $N = \dfrac{1.00\times10^{-6}\ \text{g}}{130.9\ \text{g/mol}}\times6.022\times10^{23}\ \text{mol}^{-1}$.`, t`$\lambda = \dfrac{\ln 2}{8.02\times86\,400\ \text{s}}$, and $R = \lambda N$.`],
      teach: 'Activity is R = λN: a short half-life and a great many nuclei make even a speck intensely radioactive.',
      explain: t`$N = ${tex(I131.N, 3)}$ and $\lambda = ${tex(I131.lam, 3)}\ \text{s}^{-1}$, so $R = \lambda N = ${tex(I131.R, 3)}$ Bq: billions of decays a second from a millionth of a gram. Treatments use a few gigabecquerels — less than a microgram of iodine-131.`,
      visual: activityCurve(8.02, 'days', 'The activity of the iodine-131 falls with its half-life: to a half after 8.02 days, a quarter after 16.04, an eighth after 24.06.'),
    }),
    match({
      id: 'decay-types', difficulty: 2,
      prompt: t`The chart shows a parent nucleus (gold), with protons $Z$ counted across and neutrons $N$ up. Each numbered arrow leads to the nucleus left after one kind of decay. Match each arrow to its decay.`,
      left: ['Arrow 1', 'Arrow 2', 'Arrow 3'],
      right: ['alpha decay (a ⁴He nucleus leaves)', 'beta-minus decay (an electron leaves)', 'beta-plus decay (a positron leaves)', 'gamma emission (a photon leaves)'],
      answer: [1, 0, 2],
      hints: ['An alpha particle carries away 2 protons and 2 neutrons.', 'In beta-minus decay a neutron turns into a proton; in beta-plus decay a proton turns into a neutron.'],
      teach: 'Alpha decay removes 2 protons and 2 neutrons; beta decay turns a neutron into a proton (β⁻) or a proton into a neutron (β⁺); gamma emission changes neither.',
      explain: t`Arrow 2 goes two steps left and two down — $Z - 2$, $N - 2$: an alpha particle has left. Arrow 1 trades a neutron for a proton ($Z + 1$, $N - 1$): beta-minus, as when carbon-14 becomes nitrogen-14. Arrow 3 trades a proton for a neutron: beta-plus, as when the fluorine-18 used in PET scans becomes oxygen-18. Gamma emission does not move the nucleus on the chart at all; it only sheds energy.`,
      visual: nzChart(),
    }),
    num({
      id: 'tc99m-scan', difficulty: 2, transfer: true,
      gen(r) {
        const h = r.pick([2, 3, 4, 9]), T = ISO.tc99m.T, R = 800 * 2 ** (-h / T);
        return {
          prompt: t`A dose of technetium-99m (half-life ${T} h) for a bone scan measures 800 MBq when it is prepared at 7:00. What is its activity when it is injected ${h} hours later, in MBq?`,
          answer: R, units: 'MBq', tol: { rel: 0.01 },
          errors: [
            { value: 800 * (1 - h / (2 * T)), feedback: t`That assumes a straight-line decline. The activity falls exponentially: $R = R_0\,2^{-t/T_{1/2}}$.` },
            { value: 800 * Math.exp(-h / T), feedback: t`With base $e$ the exponent is $-\lambda t = -t\ln 2/T_{1/2}$, not $-t/T_{1/2}$. Or use base 2: $R = R_0\,2^{-t/T_{1/2}}$.` },
          ],
          hints: [t`$R = 800\ \text{MBq}\times2^{-${h}/${T}}$.`],
          teach: 'The activity falls by the same factor in every equal interval, so $R = R_0\\, 2^{-t/T_{1/2}}$ works for any time, not only whole half-lives.',
          explain: t`$R = 800\times2^{-${h}/${T}} = 800\times${fmt(2 ** (-h / T), 3)} = ${fmt(R, 3)}$ MBq. Technetium-99m’s six-hour half-life is long enough to prepare, inject and scan, and short enough that the dose has mostly decayed within a day.`,
          visual: sample('tc99m', h / T, `A model sample of technetium-99m, ${h} hours (${fmt(h / T, 2)} half-lives) after preparation.`, { hide: ['count'] }),
        };
      },
    }),
    num({
      id: 'pu238-power', difficulty: 3,
      prompt: t`Plutonium-238 decays by alpha emission with a half-life of 87.7 years, and each decay leaves 5.59 MeV of heat in the fuel. How much heat does 1.00 g of plutonium-238 produce, in watts? (Molar mass 238.05 g/mol; $1\ \text{year} = 3.156\times10^{7}$ s.)`,
      answer: PU.P, units: 'W', tol: { rel: 0.01 },
      errors: [
        { value: PU.P / Math.LN2, feedback: t`The decay constant is $\lambda = \ln 2/T_{1/2}$: the factor $\ln 2 = 0.693$ is missing.` },
        { value: PU.P * YR_S, feedback: 'Convert the half-life to seconds, so that the activity comes out in decays per second and the power in watts.' },
      ],
      hints: [t`Nuclei in a gram: $N = 6.022\times10^{23}/238.05$. Decay constant: $\lambda = \ln 2/(87.7\times3.156\times10^{7}\ \text{s})$.`, t`Power $= \lambda N\times(5.59\times10^{6}\times1.602\times10^{-19}\ \text{J})$.`],
      teach: 'A radioisotope’s heat output is its activity times the energy each decay leaves behind: P = λNQ.',
      explain: t`$N = ${tex(PU.N, 3)}$ and $\lambda = ${tex(PU.lam, 3)}\ \text{s}^{-1}$, so $R = \lambda N = ${tex(PU.R, 3)}$ Bq and $P = R\times${tex(PU.Q, 3)}\ \text{J} = ${fmt(PU.P, 3)}$ W. The 2000 W in a Mars rover’s generator therefore needs about ${fmt(2 / PU.P, 2)} kg of plutonium-238.`,
      visual: sample('pu238', 0.6, 'A model sample of plutonium-238. Each decay (an orange flash) sends out an alpha particle, which stops within the fuel and leaves its 5.59 MeV as heat.'),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-decayed', difficulty: 2,
      prompt: 'What fraction of a radioactive sample has decayed after three half-lives?',
      choices: ['Seven-eighths', 'One-eighth', 'All of it', 'Three-quarters'],
      answer: 0,
      why: {
        1: 'One-eighth is what *remains* after three half-lives; seven-eighths has decayed.',
        2: 'A sample is not used up after two half-lives, or three: each half-life halves what is left, so an eighth is still there.',
        3: 'Three-quarters have decayed after *two* half-lives. The third halves the remaining quarter, so seven-eighths are gone.',
      },
      hints: ['Find the fraction left first: a half, then a quarter, then…'],
      teach: 'After n half-lives (1/2)ⁿ remains and 1 − (1/2)ⁿ has decayed.',
      explain: t`What remains is $\left(\tfrac12\right)^3 = \tfrac18$, so $1 - \tfrac18 = \tfrac78$ has decayed.`,
      visual: sample('i131', 3, 'A model sample of 1600 iodine-131 nuclei, three half-lives (about 24 days) on.', { N0: 1600, hide: ['count'] }),
    }),
    num({
      id: 'cp-rtg-life', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.9, 0.8, 0.75, 0.6]), T = ISO.pu238.T, life = T * Math.log2(1 / f), pct = Math.round(f * 100);
        return {
          prompt: t`A space probe bound for the outer solar system is powered by plutonium-238 (half-life ${T} years). Its generator must still give at least ${pct}% of its launch heat at the end of the mission. How long can the mission last, in years?`,
          answer: life, units: 'yr', tol: { rel: 0.01 },
          errors: [
            { value: (1 - f) * 2 * T, feedback: 'That treats the decline as a straight line. The heat falls exponentially: solve the decay law with logarithms.' },
            { value: T * Math.log(1 / f), feedback: t`$t = T_{1/2}\,\ln(1/f)/\ln 2$: divide by $\ln 2$.` },
          ],
          hints: [t`Solve $${f} = 2^{-t/${T}}$ for $t$.`, t`$t = ${T}\times\dfrac{\ln(1/${f})}{\ln 2}$.`],
          teach: 'Turning the decay law around gives the time to fall to any fraction: t = T½ log₂(1/f).',
          explain: t`$t = ${T}\,\dfrac{\ln(1/${f})}{\ln 2} = ${fmt(life, 3)}$ years — longer than the ${fmt(((1 - f) / 0.5) * T, 3)} years a straight-line decline would give. In practice the electrical output falls faster than the heat, because the thermocouples also degrade; even so, Voyager 1 and 2 were still sending data more than 45 years after their 1977 launch.`,
          visual: heatCurve({ frac: f, relative: true, caption: `Heat from a plutonium-238 source as a percentage of its launch heat, with the mission’s ${pct}% requirement marked.` }),
        };
      },
    }),
    num({
      id: 'cp-carbon-activity', difficulty: 3, transfer: true,
      gen(r) {
        const [a, what] = r.pick([[0.18, 'a scrap of parchment'], [0.15, 'linen from an Egyptian tomb'], [0.12, 'charcoal from a Neolithic hearth']]);
        const T = ISO.c14.T, age = T * Math.log2(0.23 / a);
        return {
          prompt: t`Carbon from living things has a carbon-14 activity of 0.23 Bq per gram. Carbon from ${what} has an activity of ${a} Bq per gram. How old is it, in years? (Half-life of carbon-14: 5730 years.)`,
          answer: age, units: 'yr', tol: { rel: 0.01 },
          errors: [
            { value: ((1 - a / 0.23) / 0.5) * T, feedback: 'That treats the decay as a straight line. The activity halves every 5730 years: solve the decay law with logarithms.' },
            { value: T * Math.log(0.23 / a), feedback: t`$t = T_{1/2}\,\ln(R_0/R)/\ln 2$: divide by $\ln 2$.` },
          ],
          hints: [t`The activity is proportional to the number of carbon-14 nuclei, so $R/R_0 = ${a}/0.23 = 2^{-t/5730}$.`, t`$t = 5730\times\dfrac{\ln(0.23/${a})}{\ln 2}$.`],
          teach: 'Activity is proportional to the number of nuclei, so a ratio of activities dates a sample just as a ratio of nuclei does.',
          explain: t`$\dfrac{R}{R_0} = \dfrac{${a}}{0.23} = ${fmt(a / 0.23, 3)}$, so $t = 5730\,\dfrac{\ln(0.23/${a})}{\ln 2} = ${fmt(age, 3)}$ years.`,
          visual: c14Curve(a / 0.23),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §10.3 Radioactive decay', url: 'https://openstax.org/books/university-physics-volume-3/pages/10-3-radioactive-decay' },
    { label: 'Kondev et al. (2021), The NUBASE2020 evaluation of nuclear physics properties, Chinese Physics C 45, 030001 — half-lives', url: 'https://www-nds.iaea.org/amdc/' },
    { label: 'NASA Radioisotope Power Systems program: the Multi-Mission Radioisotope Thermoelectric Generator', url: 'https://rps.nasa.gov/' },
    { label: 'Godwin (1962), Half-life of radiocarbon, Nature 195, 984 — the 5730-year value', url: 'https://doi.org/10.1038/195984a0' },
  ],
});
