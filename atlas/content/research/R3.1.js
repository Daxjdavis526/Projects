// Questions that can be answered: a research question names an observable,
// the competing predictions, and whether the data can tell them apart —
// the expected effect divided by the uncertainty you can reach. Worked
// through the deflection of light by the Sun and Jupiter (4GM/c²b, computed
// with NASA fact-sheet GM values and radii), the 1919 eclipse results (Dyson, Eddington &
// Davidson 1920), and averaging down noise as σ/√N.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { gaussFn, dataPlot, timeBars, SRC } from './_rs.js';

const t = String.raw;
const C = 299792458, MAS = 180 / Math.PI * 3600e3;
// GM (m³/s²) and equatorial radius (m)
const BODIES = {
  Sun: { gm: 1.32712440018e20, R: 6.957e8 },
  Jupiter: { gm: 1.26686534e17, R: 7.1492e7 },
  Saturn: { gm: 3.7931187e16, R: 6.0268e7 },
  Earth: { gm: 3.986004418e14, R: 6.3781e6 },
};
const limbMas = (b) => 4 * b.gm / (C * C * b.R) * MAS;           // GR deflection at the limb, mas
const JUP = limbMas(BODIES.Jupiter);

// deflection against impact parameter (in body radii), GR and the Newtonian half
const deflPic = (name, caption, { newton = false } = {}) => {
  const a0 = limbMas(BODIES[name]);
  const unit = a0 > 1000 ? 1000 : 1, u = unit === 1000 ? 'arcsec' : 'mas';
  const top = +(a0 / unit * 1.2).toPrecision(2);
  return {
    type: 'graph',
    params: {
      x: [0, 10.5], y: [0, top], aspect: 'wide', axesAt: 'edge', xlabel: `impact parameter (${name} radii)`, ylabel: `deflection (${u})`, xticks: 5, yticks: 4,
      curves: [{ fn: `${(a0 / unit).toPrecision(5)}/x`, domain: [1, 10.5], color: 'accent', label: 'GR: 4GM/c²b', labelAt: 2.2, labelDx: 8, labelDy: -6 },
        ...(newton ? [{ fn: `${(a0 / unit / 2).toPrecision(5)}/x`, domain: [1, 10.5], color: 'gold', dash: [6, 4], label: 'Newtonian: 2GM/c²b', labelAt: 4, labelDx: 4, labelDy: 14 }] : [])],
      vlines: [{ x: 1, label: 'limb', color: 'ink3' }],
    },
    caption,
  };
};

// two sampling distributions: no effect, and the predicted effect
const twoHyp = (D, s, caption, { names = ['no effect', 'predicted effect'], unit = '' } = {}) => ({
  type: 'graph',
  params: {
    x: [+(-4 * s).toPrecision(3), +(D + 4 * s).toPrecision(3)], y: [0, +(1.25 / (s * Math.sqrt(2 * Math.PI))).toPrecision(3)], aspect: 'wide', axesAt: 'edge', xlabel: unit, ylabel: '', yticks: 0, xticks: 6,
    curves: [{ fn: gaussFn(0, s), color: 'ink3' }, { fn: gaussFn(D, s), color: 'accent' }],
    legend: [{ label: names[0], color: 'ink3' }, { label: names[1], color: 'accent' }], legendAt: 'tr',
  },
  caption,
});

// Dyson, Eddington & Davidson (1920): Sobral 4-inch lens and Principe
const ECLIPSE = [{ site: 'Sobral (4-inch lens)', v: 1.98, s: 0.12 }, { site: 'Príncipe', v: 1.61, s: 0.30 }];
const SUNLIMB = limbMas(BODIES.Sun) / 1000;     // arcsec

export default lesson({
  id: 'research.R3.1',
  title: 'Questions that can be answered',
  minutes: 12, difficulty: 2,
  intro: t`"How do black holes bend light?" is a fine interest and a poor research question: no measurement could ever finish it. An **answerable** question names an observable, says what each competing idea predicts for it, and asks whether the data you can get will tell the predictions apart. That last test is a number — the predicted difference divided by the uncertainty you can reach:

$$S = \frac{|\Delta|}{\sigma}, \qquad \sigma = \frac{\sigma_1}{\sqrt{N}}$$

If $S$ comes out below about 3, the question cannot be answered with that data, however hard you work. Compute it **before** you start.`,
  symbols: [
    { tex: '\\Delta', text: 'the difference between the competing predictions for the observable (for a search: the predicted effect against zero), in the observable’s units' },
    { tex: '\\sigma_1', text: 'the uncertainty of one measurement' },
    { tex: 'N', text: 'the number of independent measurements averaged' },
    { tex: '\\sigma', text: 'the uncertainty you can reach: $\\sigma_1/\\sqrt{N}$ for independent random errors (systematic errors do not average down)' },
    { tex: 'S', text: 'the expected separation in units of $\\sigma$ — about 3 to claim evidence, 5 for a discovery' },
  ],
  why: t`Most failed projects fail here: the question was interesting, but no data that could be had would ever have answered it.`,
  visual: {
    type: 'graph',
    title: 'Can the data tell the predictions apart?',
    lead: t`Grey: where your averaged result would land if there were no effect. Blue: where it would land if the predicted effect $\Delta$ is real. Each curve has width $\sigma_1/\sqrt{N}$. The question is answerable when the curves barely overlap.`,
    tasks: ['Start at Δ = 1, σ₁ = 4, N = 4: S = 0.5, hopeless.', 'Raise N: S grows only as √N — 64 measurements for S = 2.', 'Instead improve one measurement (σ₁ = 1): far cheaper than averaging, when it is possible.'],
    params: {
      x: [-3, 5], y: [0, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'averaged result', ylabel: '', yticks: 0, xticks: 8,
      sliders: [
        { key: 'D', label: t`effect $\Delta$`, min: 0.2, max: 3, step: 0.1, value: 1, explain: 'The predicted difference you hope to detect.' },
        { key: 's1', label: t`one measurement $\sigma_1$`, min: 0.5, max: 6, step: 0.1, value: 4, explain: 'The scatter of a single measurement.' },
        { key: 'N', label: t`measurements $N$`, min: 1, max: 400, step: 1, value: 4, explain: 'How many independent measurements are averaged.' },
      ],
      curves: [
        { fn: 'exp(-(x^2)/(2*(s1/sqrt(N))^2))/((s1/sqrt(N))*sqrt(2*pi))', color: 'ink3' },
        { fn: 'exp(-((x - D)^2)/(2*(s1/sqrt(N))^2))/((s1/sqrt(N))*sqrt(2*pi))', color: 'accent' },
      ],
      legend: [{ label: 'no effect', color: 'ink3' }, { label: 'effect Δ', color: 'accent' }], legendAt: 'tr',
      readouts: [{ label: t`$\sigma = \sigma_1/\sqrt{N}$`, expr: 's1/sqrt(N)', digits: 3 }, { label: t`$S = \Delta/\sigma$`, expr: 'D*sqrt(N)/s1', digits: 3 }],
    },
    caption: 'Independent Gaussian errors are assumed. Real data also carry systematic errors that no amount of averaging removes — they put a floor under σ.',
  },
  example: {
    prompt: t`You are interested in "how gravity bends light". Turn that into a question a radio-astrometry campaign could answer, using a quasar seen close to Jupiter.`,
    visual: deflPic('Jupiter', t`Light deflection by Jupiter against impact parameter $b$: GR’s $4GM/c^2b$ and the "Newtonian" $2GM/c^2b$ you get by treating light as a fast particle. Computed with Jupiter’s GM and equatorial radius.`, { newton: true }),
    steps: [
      { label: 'Pick an observable', text: t`The angle by which a background quasar’s position shifts as its line of sight passes Jupiter.` },
      { label: 'State the predictions', text: t`General relativity: $\alpha = 4GM/c^2 b$. Light as a Newtonian particle: half that. At Jupiter’s limb, GR gives $\alpha = ${JUP.toFixed(1)}$ mas; the Newtonian value is $${(JUP / 2).toFixed(1)}$ mas.` },
      { label: 'The difference', text: t`$\Delta = ${(JUP / 2).toFixed(1)}$ mas at the limb — but a quasar is rarely that close. At $b = 10$ radii, $\Delta = ${(JUP / 20).toFixed(2)}$ mas.` },
      { label: 'Is it reachable?', text: t`For $S = 5$ at 10 radii you need $\sigma \le ${(JUP / 20).toFixed(2)}/5 = ${(JUP / 100).toFixed(2)}$ mas. Differential VLBI astrometry routinely does better than that, so the question can be answered.` },
      { label: 'The sharpened question', text: t`"Does the deflection of quasar light passing within 10 Jupiter radii follow GR’s $4GM/c^2b$, rather than half of it, at better than $5\sigma$?" — specific, with an observable, two predictions, a precision target and a decision rule.` },
    ],
    answer: t`An answerable version: measure the quasar’s shift near Jupiter and test $4GM/c^2b$ against $2GM/c^2b$; with $\Delta \approx ${(JUP / 20).toFixed(1)}$ mas at 10 radii, a precision of $${(JUP / 100).toFixed(2)}$ mas gives $S = 5$.`,
  },
  practice: [
    mcq({
      id: 'sharpen', difficulty: 1,
      prompt: 'Which is an answerable research question?',
      visual: deflPic('Sun', t`Deflection of starlight by the Sun against impact parameter (GR). At the limb it is $${SUNLIMB.toFixed(2)}''$.`),
      choices: [
        'Does starlight passing the Sun’s limb bend by GR’s 1.75 arcseconds rather than the Newtonian 0.87, given eclipse plates measured to 0.1 arcsecond?',
        'How does gravity affect light?',
        'Prove that general relativity is correct.',
        'Simulate everything about gravitational lensing.',
      ],
      answer: 0,
      why: { 1: 'A topic, not a question: no observation could ever finish it.', 2: 'No measurement proves a theory; it can only test a prediction within an uncertainty.', 3: 'A task with no question in it: what would the simulation decide?' },
      hints: ['Look for an observable, competing predictions and a precision.', 'Could you tell, at the end, whether the question had been answered?'],
      teach: 'An answerable question names an observable, the competing predictions, and the precision that would separate them.',
      explain: 'Only the first says what to measure (the shift at the limb), what each idea predicts (1.75″ against 0.87″) and the precision available (0.1″ is several times smaller than the 0.87″ difference).',
    }),
    num({
      id: 'limb', difficulty: 2,
      gen(r) {
        const name = r.pick(['Sun', 'Jupiter', 'Saturn', 'Earth']), B = BODIES[name];
        const ans = limbMas(B);
        return {
          prompt: t`General relativity predicts that light grazing a body of mass $M$ at impact parameter $b$ is deflected by $\alpha = 4GM/(c^2 b)$. For light grazing ${name === 'Sun' ? 'the Sun' : name}’s limb ($GM = ${(B.gm / 10 ** Math.floor(Math.log10(B.gm))).toFixed(4)}\times10^{${Math.floor(Math.log10(B.gm))}}\ \text{m}^3\,\text{s}^{-2}$, $R = ${(B.R / 10 ** Math.floor(Math.log10(B.R))).toFixed(4)}\times10^{${Math.floor(Math.log10(B.R))}}$ m), what is $\alpha$ in milliarcseconds?`,
          visual: deflPic(name, t`Deflection against impact parameter in units of the body’s radius; the value at the limb ($b = R$) is the question.`),
          answer: ans, units: 'mas', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`That is the Newtonian half, $2GM/c^2b$. GR doubles it.` }, { value: ans / MAS * 180 / Math.PI * 3600, feedback: 'That is in arcseconds — the answer asks for milliarcseconds.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\alpha$ comes out in radians: $4GM/(c^2R)$ with $c = 2.998\times10^{8}$ m/s.`, t`Then 1 rad $= 206\,265''$ $= 2.063\times10^{8}$ mas.`],
          teach: 'Estimate the size of the effect before asking whether it can be measured.',
          explain: t`$\alpha = 4GM/(c^2R) = ${(ans / MAS).toExponential(3).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad $= ${ans >= 100 ? ans.toFixed(0) : ans.toPrecision(3)}$ mas.`,
        };
      },
    }),
    num({
      id: 'eclipse', difficulty: 2,
      gen(r) {
        const E = r.pick(ECLIPSE);
        const ans = (SUNLIMB - SUNLIMB / 2) / E.s;
        return {
          prompt: t`In 1919, the ${E.site} eclipse plates gave a deflection at the Sun’s limb of $${E.v.toFixed(2)}'' \pm ${E.s.toFixed(2)}''$ (Dyson, Eddington & Davidson 1920). GR predicts $${SUNLIMB.toFixed(2)}''$; the Newtonian value is half that. How many of this measurement’s σ separate the two **predictions**?`,
          visual: dataPlot([[1, E.v, E.s]], { x: [0, 2], y: [0, 2.6], xlabel: '', xticks: 0, ylabel: 'deflection at limb (arcsec)', yticks: 5, hlines: [{ y: +SUNLIMB.toFixed(3), label: 'GR', color: 'accent' }, { y: +(SUNLIMB / 2).toFixed(3), label: 'Newtonian', color: 'gold' }] }, { cap: 0.05, caption: `The ${E.site} result with its quoted uncertainty, between the two predictions.` }),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: SUNLIMB / E.s, feedback: 'The question asks how far apart the two predictions are, not how far GR is from zero.' }],
          hints: [t`The predictions differ by $\Delta = ${SUNLIMB.toFixed(2)} - ${(SUNLIMB / 2).toFixed(2)}$ arcsec.`, t`$S = \Delta/\sigma$ with $\sigma = ${E.s.toFixed(2)}''$.`],
          teach: 'Before measuring, check that the competing predictions are several σ apart — otherwise no result can choose between them.',
          explain: t`$S = ${(SUNLIMB / 2).toFixed(3)}/${E.s.toFixed(2)} = ${ans.toFixed(1)}$. ${ans > 5 ? 'Comfortably decisive — if the quoted σ captures all the errors, which for 1919 plates has been debated ever since.' : 'Under 3σ: by itself this plate set could only lean toward one prediction.'}`,
        };
      },
    }),
    num({
      id: 'how-many', difficulty: 3,
      gen(r) {
        const D = r.pick([0.02, 0.03, 0.05]), s1 = r.pick([0.2, 0.3, 0.5]), S = r.pick([3, 5]);
        const N = Math.ceil((S * s1 / D) ** 2);
        return {
          prompt: t`You want to detect a change of $${D}\ \text{m/s}^2$ in a measured acceleration (constructed setting). One measurement scatters by $\sigma_1 = ${s1}\ \text{m/s}^2$. How many independent measurements must you average to reach $S = ${S}$?`,
          visual: twoHyp(D, s1 / Math.sqrt(N), t`At the answer, the averaged result’s distributions for "no change" and "a ${D} m/s² change" separate by ${S}σ.`, { unit: 'change in acceleration (m/s²)' }),
          answer: N, tol: { rel: 0.02, abs: 1 },
          errors: [{ value: Math.ceil(S * s1 / D), feedback: 'σ falls as 1/√N, so N grows as the square of the ratio.' }].filter((e) => Math.abs(e.value - N) > 0.05 * N),
          hints: [t`You need $\sigma_1/\sqrt{N} \le \Delta/S$.`, t`So $N \ge (S\sigma_1/\Delta)^2 = (${S}\times${s1}/${D})^2$.`],
          teach: 'Averaging gains only √N: halving σ costs four times the measurements.',
          explain: t`$N \ge (${S} \times ${s1}/${D})^2 = ${N}$. Before booking that much time, ask whether a better single measurement, or a systematic floor, changes the plan.`,
        };
      },
    }),
    multi({
      id: 'good-question', difficulty: 2,
      prompt: 'Which belong in a well-posed research question? Choose all that apply.',
      visual: twoHyp(1, 0.25, 'The goal: data whose result under one idea lands far from where it would land under the other.', { names: ['prediction A', 'prediction B'], unit: 'observable' }),
      choices: [
        'A specific observable you can actually measure or compute',
        'What each competing idea predicts for it',
        'The precision needed to tell those predictions apart, and a check that it is reachable',
        'A decision rule fixed before looking at the data',
        'An answer chosen in advance, to keep the project on track',
      ],
      answer: [0, 1, 2, 3],
      why: { 4: 'Deciding the answer first is how bias enters; the decision rule is fixed in advance, the answer is not.' },
      hints: ['Think about what you need to decide, at the end, whether the question was answered.', 'One option confuses a decision rule with a conclusion.'],
      teach: 'Observable, competing predictions, reachable precision, and a decision rule fixed in advance.',
      explain: 'With all four, the project ends with a clear answer either way — including "no effect larger than X", which is still an answer.',
    }),
    mcq({
      id: 'null', difficulty: 2,
      prompt: t`Your question: "Is there an extra perihelion advance of Mercury beyond GR’s?" What is the natural **null hypothesis** to test against?`,
      visual: twoHyp(1, 0.3, 'Where a measured extra advance would land if there is none (grey) and if there is one of a given size (blue). Schematic units.', { names: ['null: no extra advance', 'an extra advance'], unit: 'extra advance (arbitrary units)' }),
      choices: ['The extra advance is zero: GR alone describes the orbit', 'The extra advance is exactly 43 arcseconds per century', 'GR is wrong', 'The measurement has no errors'],
      answer: 0,
      why: { 1: 'About 43″ per century is GR’s own contribution, which the question already includes; the extra part is what is tested.', 2: 'A null hypothesis is a definite prediction you can compute with; "GR is wrong" predicts no particular number.', 3: 'Every measurement has errors; the null concerns nature, not the instrument.' },
      hints: ['A null hypothesis predicts a definite value for the observable.', 'The observable here is the advance beyond GR.'],
      teach: 'A null hypothesis is a definite, computable prediction — usually "no effect" for the quantity your question names.',
      explain: 'The null predicts zero extra advance. A measurement either finds a value many σ from zero or sets an upper limit on any extra advance — both answer the question.',
    }),
    order({
      id: 'funnel', difficulty: 2,
      prompt: 'Put the steps from an interest to an answerable question in order.',
      visual: timeBars([{ y: 4, from: 0, to: 10, color: 'accent', alpha: 0.35 }, { y: 3, from: 1.5, to: 8.5, color: 'accent', alpha: 0.5 }, { y: 2, from: 3, to: 7, color: 'accent', alpha: 0.65 }, { y: 1, from: 4.2, to: 5.8, color: 'accent', alpha: 0.85 }], { x: [-0.5, 10.5], y: [0.4, 4.6], xlabel: '', xticks: 0, axes: false, grid: false }, { caption: 'From a broad interest to one sharp question: each step narrows the scope.' }),
      items: [
        'Choose a topic you care about (light bending, say)',
        'Find a gap or disagreement in the literature',
        'Name one observable that bears on it',
        'Write down what each idea predicts for that observable',
        'Compute the precision needed to tell them apart',
        'Check that data or computing at that precision is within reach',
      ],
      hints: ['The literature comes before the observable: you need to know what is already settled.', 'Reachability is the last check — it can send you back up the list.'],
      teach: 'Topic → gap → observable → predictions → required precision → reachability.',
      explain: 'Each step narrows the question until it ends in a number, S = Δ/σ, that says whether the project can succeed. If it cannot, go back and pick another observable.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-isp', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([0.5, 0.8, 1.0]), s1 = r.pick([1.0, 1.2, 1.5]), S = 3;
        const N = Math.ceil(2 * (S * s1 / D) ** 2);
        return {
          prompt: t`A new injector should raise a thruster’s specific impulse by $${D}\%$. Firing to firing, the measured value scatters by $${s1}\%$. You will fire the old and the new injector $N$ times each and compare the two means, whose difference has uncertainty $\sigma_1\sqrt{2/N}$. What is the smallest $N$ for $S = 3$?`,
          visual: twoHyp(D, s1 * Math.sqrt(2 / N), 'At the answer: the difference of the two means under "no improvement" and under the predicted improvement.', { names: ['no improvement', `+${D}%`], unit: 'difference of means (%)' }),
          answer: N, tol: { rel: 0.03, abs: 1 },
          errors: [{ value: Math.ceil((S * s1 / D) ** 2), feedback: 'Comparing two means: each carries error, so the difference has σ₁√(2/N), not σ₁/√N.' }].filter((e) => Math.abs(e.value - N) > 0.05 * N),
          hints: [t`Require $\sigma_1\sqrt{2/N} \le \Delta/S$.`, t`$N \ge 2(S\sigma_1/\Delta)^2$.`],
          teach: 'A comparison of two means needs twice as many measurements per side as a comparison with a known value.',
          explain: t`$N \ge 2(3 \times ${s1}/${D})^2 = ${(2 * (S * s1 / D) ** 2).toFixed(1)}$, so $N = ${N}$ firings each. If that is unaffordable, the question as posed cannot be answered — reduce the scatter or test a larger change.`,
        };
      },
    }),
    mcq({
      id: 'cp-reach', difficulty: 2,
      prompt: t`Which of these questions **cannot** be answered with the stated resources, by the $S = \Delta/\sigma$ test?`,
      visual: timeBars([
        { y: 3, from: 0, to: Math.log10(3.84 / 1e-3), color: 'accent', label: 'Earth’s GR perihelion advance: 3.8″ per century' },
        { y: 2, from: 0, to: Math.log10(1 / 1e-3), color: 'gold', label: 'one amateur astrometric position: about 1″' },
        { y: 1, from: 0, to: Math.log10(16.3e-3 / 1e-3), color: 'violet', label: 'Jupiter’s limb deflection: 16 mas' },
      ], { x: [-0.1, 4.3], y: [0.4, 3.8], xlabel: 'log₁₀ (angle in mas)', xticks: 5 }, { caption: 'Sizes of the effects and of one measurement’s precision, on a logarithmic scale.' }),
      choices: [
        'Measure Earth’s general-relativistic perihelion advance (3.8″ per century) from a year of backyard telescope positions good to about 1″ each',
        'Test GR’s light deflection at the Sun’s limb with modern VLBI (precision far below a milliarcsecond)',
        'Detect Jupiter’s light deflection near its limb with differential VLBI',
        'Compare two test stands’ thrust readings that differ by 10 standard uncertainties',
      ],
      answer: 0,
      why: { 1: 'Δ = 0.87″ between GR and the Newtonian half against σ well below 0.001″: enormous S.', 2: 'Δ ≈ 8 mas between the predictions against sub-mas precision: answerable.', 3: 'S = 10 already.' },
      hints: ['Compare the size of each effect with the precision available.', 'In one year Earth’s perihelion moves only 0.04″.'],
      teach: 'If the effect over your observing span is far below your precision, no analysis can rescue the question.',
      explain: 'In one year the advance is 3.84″/100 ≈ 0.04″, while each position is good to about 1″, and the perihelion direction is far harder to pin down than a position. S ≪ 1: unanswerable with these resources.',
    }),
    mcq({
      id: 'cp-criterion', difficulty: 3,
      prompt: t`A student plans to "search a year of gravitational-wave data for anything unusual" and report whatever looks most significant. What is the main flaw?`,
      visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 24, amp: 0, seed: 5, panels: ['snr', 'scan'], controls: false, readout: false }, caption: 'Pure noise, no signal: the filter output still has a highest peak, and across many templates one of them always looks best.' },
      choices: [
        'With no observable or decision rule fixed in advance, the most extreme of countless looks will always seem significant',
        'A year of data is too short for any search',
        'Gravitational-wave data cannot be searched by students',
        'Unusual events are not interesting',
      ],
      answer: 0,
      why: { 1: 'Plenty of real detections come from far less data.', 2: 'The data are public (GWOSC); the issue is the question, not access.', 3: 'They are very interesting — if the search can say how often noise would produce them.' },
      hints: ['How many different things could count as "unusual"?', 'In pure noise, is there always a largest value?'],
      teach: 'Fix the observable and the decision rule before looking, or correct for every look you take.',
      explain: 'Without a defined observable and threshold, the search tries effectively unlimited hypotheses, and the best of them is always impressive by chance — the look-elsewhere effect. Real searches fix templates and thresholds first and measure the background.',
    }),
  ],
  sources: [SRC.will,
    { label: 'F. W. Dyson, A. S. Eddington & C. Davidson, “A determination of the deflection of light by the Sun’s gravitational field…”, Phil. Trans. R. Soc. A 220, 291–333 (1920)', url: 'https://doi.org/10.1098/rsta.1920.0009' },
    { label: 'NASA Goddard Space Flight Center, Planetary and Sun Fact Sheets (GM and radii)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' }],
});
