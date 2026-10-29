// From homework to open questions — the first lesson of Research in Physics.
// What changes when nobody knows the answer: the result is a claim with an
// uncertainty that others can check, and an open question usually shows up
// as two careful results that disagree by more than their uncertainties.
// Worked through the Hubble tension (SH0ES against Planck 2018), the neutron
// lifetime (beam against bottle), the binary pulsar and Mercury.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { gaussFn, errorBars, SRC } from './_rs.js';

const t = String.raw;

// two measurements as normal curves (each result's 68% band is its ±σ)
const twoBells = (A, B, xr, caption, { unit = '', names = true } = {}) => {
  const peak = Math.max(1 / (A.s * Math.sqrt(2 * Math.PI)), 1 / (B.s * Math.sqrt(2 * Math.PI)));
  return {
    type: 'graph',
    params: {
      x: xr, y: [0, +(peak * 1.3).toPrecision(3)], aspect: 'wide', axesAt: 'edge', xlabel: unit, ylabel: '', yticks: 0, xticks: 6,
      curves: [{ fn: gaussFn(A.m, A.s), color: 'accent' }, { fn: gaussFn(B.m, B.s), color: 'gold' }],
      vlines: [{ x: A.m, color: 'accent' }, { x: B.m, color: 'gold' }],
      ...(names ? { legend: [{ label: A.name, color: 'accent' }, { label: B.name, color: 'gold' }], legendAt: 'tr' } : {}),
    },
    caption,
  };
};

const H0 = { shoes: { m: 73.04, s: 1.04, name: 'SH0ES 2022 (Cepheids + SNe Ia)' }, planck: { m: 67.4, s: 0.5, name: 'Planck 2018 (CMB, ΛCDM)' }, trgb: { m: 69.8, s: Math.hypot(0.8, 1.7), name: 'Freedman 2019 (TRGB + SNe Ia)' } };
const TAU = { beam: { m: 887.7, s: Math.hypot(1.2, 1.9), name: 'beam (Yue 2013)' }, bottle: { m: 877.75, s: Math.hypot(0.28, 0.22), name: 'bottle (UCNτ 2021)' } };
const nsig = (A, B) => Math.abs(A.m - B.m) / Math.hypot(A.s, B.s);
const EX = { n: nsig(H0.shoes, H0.planck), d: H0.shoes.m - H0.planck.m, s: Math.hypot(H0.shoes.s, H0.planck.s) };

// GR's prediction for the binary pulsar's cumulative shift of periastron time:
// ΔT = ½ (Ṗ/P) t², with P = 27 906.98 s and Ṗ = −2.40 × 10⁻¹² (dimensionless)
const PULSAR_K = (0.5 * 2.40e-12 / 27906.98) * 3.15576e7 ** 2;   // s per yr²
const pulsarPic = {
  type: 'graph',
  params: {
    x: [1972, 2018], y: [-75, 6], aspect: 'wide', axesAt: 'edge', xlabel: 'year', ylabel: 'shift (s)', xticks: 5, yticks: 4,
    curves: [{ fn: `-${+PULSAR_K.toPrecision(4)}*(x - 1975)^2`, domain: [1975, 2015], color: 'accent', label: 'GR prediction', labelAt: 2000, labelDx: -40, labelDy: 16 }],
    hlines: [{ y: 0, color: 'ink3' }],
  },
  caption: t`General relativity’s prediction for the cumulative shift in the binary pulsar PSR B1913+16’s periastron time, from its orbital decay $\dot P_b \approx -2.40\times10^{-12}$. Weisberg & Huang (2016) plot 35 years of timing data on this curve; the data are not drawn here.`,
};

export default lesson({
  id: 'research.R0.1',
  title: 'From homework to open questions',
  minutes: 10, difficulty: 1,
  intro: t`In homework, three things are given: the question, the method, and an answer that exists somewhere. In research **none of them is given**. You choose the question, you choose (or invent) the method, and what you produce is not "the answer" but a **claim with an uncertainty**, made so that someone else can check it.

An open question often first appears as two careful results that disagree by more than their uncertainties allow. The size of a disagreement is measured in units of the combined uncertainty:

$$n_\sigma = \frac{|x_1 - x_2|}{\sqrt{\sigma_1^2 + \sigma_2^2}}$$`,
  symbols: [
    { tex: 'x_1,\\ x_2', text: 'two independent results for the same quantity, in the same units' },
    { tex: '\\sigma_1,\\ \\sigma_2', text: 'their standard uncertainties (1σ), in those units: about 68% of repeated, honest measurements would land within $\\pm\\sigma$ of the true value' },
    { tex: 'n_\\sigma', text: 'the **tension**: how many combined standard uncertainties apart the two results are (a pure number). It assumes independent, roughly Gaussian errors' },
  ],
  why: t`Every later lesson — finding papers, reading them, framing a question, modelling, simulating, inferring — serves one goal: a result other people can check and believe.`,
  visual: {
    type: 'graph',
    title: 'The Hubble tension',
    lead: t`Two measurements of the Hubble constant $H_0$, the expansion rate today, in km/s per megaparsec: one from the distance ladder (Cepheids and supernovae, **SH0ES**), one inferred from the cosmic microwave background assuming the standard model of cosmology (**Planck**). Each curve is a normal distribution centred on the result with width $\sigma$. The readout is $n_\sigma$.`,
    tasks: [
      'Halve the SH0ES uncertainty: the tension grows although neither central value moved.',
      'Slide the SH0ES value to 70: the curves overlap and the tension falls below 3σ.',
      'Double the Planck uncertainty: a larger error bar on either side weakens the tension.',
    ],
    params: {
      x: [62, 80], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'H₀ (km/s/Mpc)', ylabel: '', yticks: 0, xticks: 6,
      sliders: [
        { key: 'm1', label: t`SH0ES $H_0$`, min: 66, max: 78, step: 0.02, value: 73.04, unit: t`\mathrm{km\,s^{-1}\,Mpc^{-1}}`, explain: 'The distance-ladder central value (published: 73.04).' },
        { key: 's1', label: t`SH0ES $\sigma$`, min: 0.3, max: 3, step: 0.02, value: 1.04, unit: t`\mathrm{km\,s^{-1}\,Mpc^{-1}}`, explain: 'Its standard uncertainty (published: 1.04).' },
        { key: 's2', label: t`Planck $\sigma$`, min: 0.3, max: 3, step: 0.02, value: 0.5, unit: t`\mathrm{km\,s^{-1}\,Mpc^{-1}}`, explain: 'The CMB inference’s standard uncertainty (published: 0.5, central value fixed at 67.4).' },
      ],
      curves: [
        { fn: 'exp(-((x - m1)^2)/(2*s1^2))/(s1*sqrt(2*pi))', color: 'accent' },
        { fn: 'exp(-((x - 67.4)^2)/(2*s2^2))/(s2*sqrt(2*pi))', color: 'gold' },
      ],
      vlines: [{ x: 'm1', color: 'accent' }, { x: 67.4, color: 'gold' }],
      legend: [{ label: 'SH0ES (distance ladder)', color: 'accent' }, { label: 'Planck (CMB + ΛCDM)', color: 'gold' }], legendAt: 'tr',
      readouts: [{ label: t`$n_\sigma$`, expr: 'abs(m1 - 67.4)/sqrt(s1^2 + s2^2)', digits: 3 }],
    },
    caption: t`Published values: SH0ES $73.04 \pm 1.04$ (Riess et al. 2022) and Planck 2018 $67.4 \pm 0.5$. Drawing each result as a Gaussian is an approximation of its real error distribution, and $n_\sigma$ is only meaningful if both error budgets are complete — which is exactly what is in dispute.`,
  },
  example: {
    prompt: t`SH0ES measures $H_0 = 73.04 \pm 1.04\ \text{km s}^{-1}\,\text{Mpc}^{-1}$; Planck 2018 infers $67.4 \pm 0.5$ in the same units. How large is the tension, and what kind of question does it raise?`,
    visual: twoBells(H0.shoes, H0.planck, [63, 78], 'The two published results as normal curves of width σ.', { unit: 'H₀ (km/s/Mpc)' }),
    steps: [
      { label: 'Difference', text: t`$|x_1 - x_2| = 73.04 - 67.4 = ${EX.d.toFixed(2)}$ km/s/Mpc.` },
      { label: 'Combined uncertainty', text: t`The two measurements are independent, so their variances add: $\sqrt{1.04^2 + 0.5^2} = ${EX.s.toFixed(2)}$ km/s/Mpc.` },
      { label: 'Tension', text: t`$n_\sigma = ${EX.d.toFixed(2)} / ${EX.s.toFixed(2)} = ${EX.n.toFixed(1)}$. If both error budgets were right and the errors Gaussian, a gap this large by chance would happen about once in a million tries.` },
      { label: 'What it does not say', text: t`The number does not say **which** result is off, nor **why**. Either one method has a systematic error nobody has found, or the standard cosmological model used to turn the CMB into an $H_0$ is incomplete.` },
      { label: 'The open question', text: t`Homework would stop at $${EX.n.toFixed(1)}\sigma$. Research starts there: *which assumption in which chain is wrong, and what measurement could tell?* — a question with no answer at the back of the book.` },
    ],
    answer: t`$n_\sigma \approx ${EX.n.toFixed(1)}$: far too large to be chance if the error budgets are complete, so either a hidden systematic or new physics — an open question.`,
  },
  practice: [
    mcq({
      id: 'which-research', difficulty: 1,
      prompt: t`Which of these is a **research** question rather than an exercise or a look-up?`,
      visual: pulsarPic,
      choices: [
        t`Using the 35 years of timing data, how well does the orbital decay of PSR B1913+16 agree with general relativity, and which correction limits the test?`,
        t`Use the quadrupole formula to compute the orbital decay of a binary with given masses, period and eccentricity.`,
        t`Look up the orbital decay of PSR B1913+16 in Weisberg & Huang (2016).`,
        t`Explain in words why a binary pulsar’s orbit shrinks.`,
      ],
      answer: 0,
      why: {
        1: 'Every input and the method are given: that is an exercise, however hard the algebra.',
        2: 'Finding a published number is a necessary skill, but the answer already exists.',
        3: 'A textbook explanation — useful, but it asks for nothing unknown.',
      },
      hints: ['Ask of each: is the answer already known, and is the method already fixed?', 'A research question needs data, a judgement about corrections, and an answer that comes with an uncertainty.'],
      teach: 'A research question is one whose answer is not known in advance and whose method, data and uncertainties you must choose and defend.',
      explain: t`Only the first needs real data, a choice of method, and an honest accounting of what limits the comparison (for this pulsar, the correction for the Galaxy’s acceleration). Weisberg & Huang found the ratio of measured to predicted decay to be $0.9983 \pm 0.0016$.`,
    }),
    num({
      id: 'tension', difficulty: 2,
      gen(r) {
        const pairs = [
          { A: H0.planck, B: H0.trgb, what: t`the Hubble constant from Planck 2018 ($67.4 \pm 0.5$) and from the tip of the red-giant branch, Freedman et al. 2019 ($69.8 \pm 0.8_{\text{stat}} \pm 1.7_{\text{sys}}$, in km/s/Mpc)`, unit: 'H₀ (km/s/Mpc)', xr: [63, 76], split: true },
          { A: H0.shoes, B: H0.trgb, what: t`the Hubble constant from SH0ES 2022 ($73.04 \pm 1.04$) and from the tip of the red-giant branch, Freedman et al. 2019 ($69.8 \pm 0.8_{\text{stat}} \pm 1.7_{\text{sys}}$, in km/s/Mpc)`, unit: 'H₀ (km/s/Mpc)', xr: [63, 79], split: true },
          { A: TAU.beam, B: TAU.bottle, what: t`the neutron lifetime from a beam experiment, Yue et al. 2013 ($887.7 \pm 1.2_{\text{stat}} \pm 1.9_{\text{sys}}$ s), and from a magnetic bottle, UCNτ 2021 ($877.75 \pm 0.28_{\text{stat}} \pm 0.22_{\text{sys}}$ s, taking the larger side of its systematic error)`, unit: 'neutron lifetime (s)', xr: [872, 896], split: true },
        ];
        const P = r.pick(pairs);
        const ans = nsig(P.A, P.B);
        const d = Math.abs(P.A.m - P.B.m);
        return {
          prompt: t`Compute the tension between ${P.what}. Combine each result’s statistical and systematic parts in quadrature first.`,
          visual: twoBells(P.A, P.B, P.xr, 'Each published result as a normal curve with its total (statistical and systematic) standard uncertainty.', { unit: P.unit }),
          answer: ans, tol: { rel: 0.03 },
          errors: [
            { value: d / (P.A.s + P.B.s), feedback: t`You added the uncertainties. Independent uncertainties add **in quadrature**: $\sqrt{\sigma_1^2 + \sigma_2^2}$.` },
            { value: d / Math.max(P.A.s, P.B.s), feedback: 'You divided by only one uncertainty. Both results carry error; combine them.' },
            { value: d / Math.min(P.A.s, P.B.s), feedback: 'You divided by only the smaller uncertainty. Both results carry error; combine them.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.05 * ans),
          hints: [t`First each result’s total: $\sigma = \sqrt{\sigma_{\text{stat}}^2 + \sigma_{\text{sys}}^2}$.`, t`Then $n_\sigma = |x_1 - x_2| / \sqrt{\sigma_1^2 + \sigma_2^2}$, with $|x_1 - x_2| = ${d.toFixed(2)}$.`],
          teach: 'Independent uncertainties add in quadrature, both within one result and between two.',
          explain: t`$\sigma_1 = ${P.A.s.toFixed(2)}$, $\sigma_2 = ${P.B.s.toFixed(2)}$, so $n_\sigma = ${d.toFixed(2)} / ${Math.hypot(P.A.s, P.B.s).toFixed(2)} = ${ans.toFixed(2)}$. ${ans > 3 ? 'Above 3σ, a statistical fluke is an unlikely explanation — this disagreement is a live research problem.' : 'Below 2σ: these two results are consistent; nothing here demands an explanation.'}`,
        };
      },
    }),
    mcq({
      id: 'null-result', difficulty: 2,
      prompt: t`A team searches for an extra perihelion advance of Mercury **beyond** general relativity and finds $(0.4 \pm 0.6)$ milliarcseconds per year (constructed numbers, for illustration). What have they found?`,
      visual: {
        type: 'graph',
        params: { x: [-2, 2], y: [-1.5, 2.5], aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'extra advance (mas/yr)', yticks: 5, hlines: [{ y: 0, color: 'ink3', label: 'GR alone' }], curves: errorBars([[0, 0.4, 0.6]], { color: 'accent', cap: 0.08 }), points: [{ x: 0, y: 0.4, color: 'accent', r: 4 }] },
        caption: 'The measured extra advance with its 1σ error bar, against zero (GR with nothing added). Constructed numbers.',
      },
      choices: [
        t`A result: no extra advance is detected, and any real one is probably smaller than about $0.4 + 2 \times 0.6 = 1.6$ mas/yr.`,
        t`Nothing: the search failed because it did not find an effect.`,
        t`Evidence for an extra advance of 0.4 mas/yr, since the central value is positive.`,
        t`Proof that GR is exact for Mercury.`,
      ],
      answer: 0,
      why: {
        1: 'An upper limit is a real result: it rules out every theory that predicts a larger effect.',
        2: t`The value is less than $1\sigma$ from zero: no evidence for anything.`,
        3: 'A measurement can only bound an effect, never prove it is exactly zero.',
      },
      hints: ['How many σ is 0.4 from 0?', 'What does the measurement exclude?'],
      teach: 'A null result with a stated uncertainty is an upper limit, and an upper limit is a result: it rules out models.',
      explain: t`$0.4/0.6 \approx 0.7\sigma$ — consistent with zero. What the search did achieve is a bound: at roughly 95% confidence any extra advance is below about 1.6 mas/yr, which kills every alternative theory predicting more.`,
    }),
    multi({
      id: 'features', difficulty: 2,
      prompt: t`The two neutron-lifetime methods below have disagreed by about $4\sigma$ for over a decade. Which statements are true of working on a question like this? Choose all that apply.`,
      visual: twoBells(TAU.beam, TAU.bottle, [872, 896], 'Beam (Yue et al. 2013) and bottle (UCNτ 2021) neutron lifetimes as normal curves of their total uncertainties.', { unit: 'neutron lifetime (s)' }),
      choices: [
        'Nobody knows the answer yet, including the experts.',
        'The method itself may have to be invented, or an old one questioned.',
        'Whatever you find must come with an uncertainty, or nobody can use it.',
        'A careful result is right if it agrees with the textbook value.',
        'Once you have a good method, the uncertainty can be left out.',
      ],
      answer: [0, 1, 2],
      why: {
        3: 'Here the "textbook value" is itself in dispute; agreeing with one camp proves nothing.',
        4: 'A number without an uncertainty cannot be compared with anything — the disagreement itself is measured in uncertainties.',
      },
      hints: ['Ask what the beam and bottle teams actually do differently from a homework solver.', 'Two of the five statements are habits from homework that research breaks.'],
      teach: 'Research is work on questions without known answers, where the method is part of the problem and the uncertainty part of the result.',
      explain: 'The beam experiment counts decay protons; the bottle counts surviving neutrons. Whether one has a hidden systematic or some neutrons decay unseen is open — and every new result is useful only with its uncertainty.',
    }),
    order({
      id: 'loop', difficulty: 2,
      prompt: t`You decide to work on a disagreement like the Hubble tension. Put the stages of a research project in their usual order.`,
      visual: twoBells(H0.shoes, H0.planck, [63, 78], 'The starting point: two published H₀ results that disagree.', { unit: 'H₀ (km/s/Mpc)' }),
      items: [
        'Read what is known and where the results disagree',
        'Pose one specific question with a measurable answer',
        'Build the simplest model that predicts what you will measure',
        'Check your code or method on a case with a known answer',
        'Compare with the data, uncertainty included',
        'Write it up so someone else can check it',
      ],
      hints: ['You cannot pose a sharp question before you know what is already known.', 'Testing the method on a known case comes before trusting it on the unknown one.'],
      teach: 'The research loop runs literature → question → model → verification → comparison with data → communication, and often round again.',
      explain: 'This course follows the same order: literature (R1–R2), questions (R3), models (R4), simulation and verification (R5), inference (R6), reproducibility and presenting (R7–R8). In practice you loop: a comparison often sends you back to the question.',
    }),
    mcq({
      id: 'reproduce-first', difficulty: 2,
      prompt: t`You start a project on Mercury’s perihelion: you want to test a modified theory of gravity with your own orbit integrator. What should your **first** milestone be?`,
      visual: { type: 'cm3-orbit', params: { force: 'gr', delta: 0.01, L: 1, E: -0.3, sliders: [], turns: 6, panels: ['orbit'], readouts: [], play: false, dragE: false, labels: false }, caption: 'A precessing orbit under Newton plus a general-relativistic term, hugely exaggerated: the real advance is 0.1 arcseconds per orbit.' },
      choices: [
        t`Reproduce the known general-relativistic result, $42.98''$ per century, with your own code.`,
        'Add the modified-gravity term straight away, since that is the new part.',
        'Write the introduction of the paper first, so the goal is fixed.',
        'Collect new observations of Mercury before writing any code.',
      ],
      answer: 0,
      why: {
        1: 'If your code then gives a strange number, you cannot tell new physics from a bug.',
        2: 'Writing helps, but a claim needs a working, checked tool first.',
        3: 'Decades of radar and spacecraft ranging already exist; the bottleneck is a trusted model.',
      },
      hints: ['How will you know your integrator is right?', 'Find a case with a known answer and match it first.'],
      teach: 'Reproduce a known result before you claim a new one: it is the only way to separate discovery from bug.',
      explain: t`Matching $42.98''$/century verifies the integrator and your perihelion-finding on a case with a known answer. Only then does a deviation under the modified theory mean something. You will do exactly this in [Mercury’s perihelion by numerical integration](#/lesson/research.P.4).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-isp', difficulty: 2, transfer: true,
      gen(r) {
        const a = r.float(308, 316, 0.1), sa = r.float(0.8, 1.6, 0.1);
        const b = +(a - r.float(2.5, 7, 0.1)).toFixed(1), sb = r.float(1.0, 2.2, 0.1);
        const ans = Math.abs(a - b) / Math.hypot(sa, sb);
        return {
          prompt: t`Two test stands fire the same thruster model. Stand 1 measures a specific impulse of $${a.toFixed(1)} \pm ${sa.toFixed(1)}$ s; stand 2 measures $${b.toFixed(1)} \pm ${sb.toFixed(1)}$ s (constructed numbers). How many combined standard uncertainties apart are they?`,
          visual: twoBells({ m: a, s: sa, name: 'stand 1' }, { m: b, s: sb, name: 'stand 2' }, [Math.floor(b - 4 * sb), Math.ceil(a + 4 * sa)], 'Each stand’s result as a normal curve of its standard uncertainty.', { unit: 'specific impulse (s)' }),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: Math.abs(a - b) / (sa + sb), feedback: t`Independent uncertainties add in quadrature, $\sqrt{\sigma_1^2 + \sigma_2^2}$, not linearly.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: ['Difference first, then the combined uncertainty.', t`$n_\sigma = |x_1 - x_2|/\sqrt{\sigma_1^2 + \sigma_2^2}$.`],
          teach: 'The tension between two independent results is their difference in units of the quadrature-combined uncertainty.',
          explain: t`$n_\sigma = ${Math.abs(a - b).toFixed(1)}/\sqrt{${sa.toFixed(1)}^2 + ${sb.toFixed(1)}^2} = ${ans.toFixed(2)}$. ${ans > 3 ? 'That is too large to blame on scatter: look for a systematic difference between the stands (thrust calibration, propellant temperature, flow-meter offset).' : 'That could plausibly be scatter; more firings, or a shared calibration, would sharpen it.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: t`The Hubble tension is about $${EX.n.toFixed(1)}\sigma$. Which statement is justified by that number alone?`,
      visual: twoBells(H0.shoes, H0.planck, [63, 78], 'SH0ES and Planck 2018 as normal curves.', { unit: 'H₀ (km/s/Mpc)' }),
      choices: [
        'If both error budgets are complete, a statistical fluke is a very unlikely explanation.',
        'The standard cosmological model is wrong.',
        'The distance-ladder measurement has a mistake in it.',
        t`There is a $${EX.n.toFixed(1)}\%$ chance that the two results agree.`,
      ],
      answer: 0,
      why: {
        1: 'New physics is one possibility; an unrecognized systematic in either measurement is another. The number cannot choose.',
        2: 'Equally possible is a problem on the CMB side — or no problem in either, only an incomplete error budget.',
        3: t`$n_\sigma$ is not a percentage, and it is not the probability that a hypothesis is true.`,
      },
      hints: ['What assumptions go into computing nσ?', 'nσ measures how surprising the gap is if both error bars are right — nothing more.'],
      teach: 'A tension says the gap is unlikely to be chance given the stated errors; it never says which result is wrong or why.',
      explain: 'nσ assumes independent, Gaussian, complete uncertainties. Under those assumptions the gap is very unlikely to be a fluctuation. Deciding between a missed systematic and new physics is the open research question.',
    }),
    mcq({
      id: 'cp-claim', difficulty: 3,
      prompt: t`A student evaluates the general-relativistic formula for Mercury, gets $42.98''$ per century, and writes "I have confirmed general relativity". What is missing for this to count as a test?`,
      visual: { type: 'cm3-orbit', params: { force: 'gr', delta: 0.01, L: 1, E: -0.3, sliders: [], turns: 6, panels: ['orbit'], readouts: [], play: false, dragE: false, labels: false }, caption: 'An exaggerated precessing orbit. The formula predicts the advance; it does not measure it.' },
      choices: [
        'A comparison with an independent measurement of the advance, with its uncertainty.',
        'More significant figures in the computed value.',
        'A numerical integration that gives the same 42.98.',
        'A citation of Einstein’s 1915 paper.',
      ],
      answer: 0,
      why: {
        1: 'Precision of a prediction says nothing about whether nature agrees with it.',
        2: 'That verifies the formula or the code — a valuable check, but still a prediction, not a test against nature.',
        3: 'Authority is not evidence.',
      },
      hints: ['A test needs two things to compare.', 'Where would the second number come from?'],
      teach: 'A prediction becomes a test only when compared with an independent measurement and its uncertainty.',
      explain: 'The observed advance comes from decades of planetary ranging, after subtracting the much larger effects of the other planets. Agreement within the measurement’s uncertainty — not the computation itself — is the test (Will 2014 reviews it).',
    }),
  ],
  sources: [SRC.shoes, SRC.planck, SRC.pulsar, SRC.will,
    { label: 'W. L. Freedman et al., “The Carnegie–Chicago Hubble Program VIII…”, ApJ 882, 34 (2019), arXiv:1907.05922', url: 'https://arxiv.org/abs/1907.05922' },
    { label: 'A. T. Yue et al., “Improved determination of the neutron lifetime”, PRL 111, 222501 (2013)', url: 'https://doi.org/10.1103/PhysRevLett.111.222501' },
    { label: 'F. M. Gonzalez et al. (UCNτ), “Improved neutron lifetime measurement with UCNτ”, PRL 127, 162501 (2021)', url: 'https://doi.org/10.1103/PhysRevLett.127.162501' }],
});
