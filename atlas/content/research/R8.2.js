// Writing a research report: the paper built around one claim. Sections and
// what each must do (title, abstract, introduction, methods, results,
// discussion, conclusions, data and code availability, references); the
// uncertainty budget as the table a referee reads first, σ = √(Σσᵢ²), and
// why its largest entry decides where to spend effort; a result written to
// its uncertainty's precision; tension stated in σ, not adjectives. Running
// case: Kepler-10b's radius from a transit fit, R_p = k R★, against
// Dumusque et al. (2014), R_p = 1.47 R⊕ (k = 0.01261, R★ = 1.065 R☉).
// The lab-report version (abstract, figures) is lab.A11.2; agreement tests
// are lab.A4.1.
import { lesson, mcq, num, order, match } from '../../src/core/content.js';
import { pageBlocks, SRC2 } from './_rs2.js';
import { timeBars } from './_rs.js';

const t = String.raw;
const RSUN_REARTH = 6.957e8 / 6.3781e6;          // IAU 2015 nominal solar and equatorial Earth radii
// the worked example: your fit k = 0.0126 ± 0.0004; R★ = 1.065 ± 0.009 R☉ (Dumusque et al. 2014)
const K = 0.0126, SK = 0.0004, RS = 1.065, SRS = 0.009;
const RP = K * RS * RSUN_REARTH, REL = Math.hypot(SK / K, SRS / RS), SRP = RP * REL;

// an uncertainty budget as horizontal bars (relative, in per cent)
const budgetPic = (rows, caption, total = true) => {
  const tot = Math.hypot(...rows.map((r) => r[1]));
  const bars = rows.map(([label, v], i) => ({ y: rows.length - i + (total ? 1 : 0), from: 0, to: v, color: 'accent', label: `${label}: ${v}%` }));
  if (total) bars.push({ y: 1, from: 0, to: +tot.toFixed(3), color: 'gold', label: 'total, in quadrature' });
  return timeBars(bars, { x: [-0.1, Math.max(tot, ...rows.map((r) => r[1])) * 1.35], y: [0.4, rows.length + (total ? 1 : 0) + 0.7], xlabel: 'relative uncertainty (%)', xticks: 5 }, { caption, h: 0.28 });
};

// a paper's anatomy, one band per section
const SECTIONS = [['title', 0.06], ['abstract', 0.1], ['introduction', 0.14], ['methods', 0.2], ['results', 0.18], ['discussion', 0.16], ['conclusions', 0.06], ['data, code, references', 0.1]];
const paperPic = (hl, caption) => {
  let y = 1;
  const blocks = SECTIONS.map(([name, h], i) => { const b = { x0: 0.05, x1: 0.95, y0: y - h + 0.005, y1: y - 0.005, label: name, color: i === hl ? 'gold' : 'accent', alpha: i === hl ? 0.55 : 0.22 }; y -= h; return b; });
  return pageBlocks(blocks, { W: 1, H: 1, caption, extra: { aspect: 'wide' } });
};

export default lesson({
  id: 'research.R8.2',
  title: 'Writing a research report',
  minutes: 14, difficulty: 2,
  intro: t`A research report is an argument for **one claim**: a number with its uncertainty, compared with what was known before. Every section serves it. The **title** and **abstract** state it; the **introduction** says why it matters and what others found; the **methods** let someone reproduce it; the **results** give it; the **discussion** says how far to trust it and what it means. The table a careful reader turns to first is the **uncertainty budget**: every source of error, and their total. For independent sources, the errors add in quadrature,

$$\sigma_{\text{tot}} = \sqrt{\sigma_1^2 + \sigma_2^2 + \dots + \sigma_n^2}$$

so the largest entry dominates. [Writing a lab report and abstract](#/lesson/lab.A11.2) covers the shorter lab version; this lesson is about the research paper.`,
  symbols: [
    { tex: '\\sigma_{\\text{tot}}', text: 'the total standard uncertainty of the result, in its units' },
    { tex: '\\sigma_i', text: 'the standard uncertainty contributed by source $i$ — statistical scatter, a calibration, a model choice — in the same units' },
    { tex: 'n', text: 'the number of independent sources in the budget' },
  ],
  why: t`PHYS 4900 asks for a written report on every project, and the report is what outlives the project.`,
  visual: {
    type: 'graph',
    title: 'An uncertainty budget',
    lead: t`Three independent sources of error on a planet’s radius, in per cent. The gold bar is their total in quadrature. Shrink each in turn and watch which one the total cares about.`,
    tasks: ['Halve the stellar-radius term: the total barely moves.', 'Halve the transit-depth term (to 1.6%): the total falls from 3.45% to about 2.0%.', 'Set the two small terms to zero: the total is hardly smaller than the largest term alone.'],
    params: {
      x: [-0.1, 6.5], y: [0.4, 4.7], aspect: 'wide', axesAt: 'edge', xlabel: 'relative uncertainty (%)', ylabel: '', yticks: 0, xticks: 6,
      sliders: [
        { key: 'a', label: 'transit depth (statistical)', min: 0, max: 5, step: 0.1, value: 3.2, unit: t`\%`, explain: 'The scatter of the light curve, propagated through the fit to the radius ratio.' },
        { key: 'b', label: 'stellar radius', min: 0, max: 5, step: 0.1, value: 0.8, unit: t`\%`, explain: 'The star’s radius, taken from asteroseismology; the planet’s radius scales with it.' },
        { key: 'c', label: 'limb darkening (model)', min: 0, max: 5, step: 0.1, value: 1, unit: t`\%`, explain: 'How the assumed darkening of the star’s edge changes the fitted depth.' },
      ],
      shade: [
        { fn: '4.28', lower: '3.72', from: 0, to: 'a', color: 'accent', alpha: 0.55 },
        { fn: '3.28', lower: '2.72', from: 0, to: 'b', color: 'accent', alpha: 0.55 },
        { fn: '2.28', lower: '1.72', from: 0, to: 'c', color: 'accent', alpha: 0.55 },
        { fn: '1.28', lower: '0.72', from: 0, to: 'sqrt(a^2 + b^2 + c^2)', color: 'gold', alpha: 0.6 },
      ],
      points: [
        { x: 0, y: 4.28, r: 0, label: 'transit depth', color: 'ink', labelDx: 2, labelDy: -9 },
        { x: 0, y: 3.28, r: 0, label: 'stellar radius', color: 'ink', labelDx: 2, labelDy: -9 },
        { x: 0, y: 2.28, r: 0, label: 'limb darkening', color: 'ink', labelDx: 2, labelDy: -9 },
        { x: 0, y: 1.28, r: 0, label: 'total, in quadrature', color: 'ink', labelDx: 2, labelDy: -9 },
      ],
      readouts: [{ label: 'total', expr: 'sqrt(a^2 + b^2 + c^2)', unit: t`\%`, digits: 3 }, { label: 'simple sum (wrong for independent errors)', expr: 'a + b + c', unit: t`\%`, digits: 3 }],
    },
    caption: 'Illustrative sizes for a transit radius. Quadrature holds only for independent sources; a correlated pair must be combined with its covariance.',
  },
  example: {
    prompt: t`Your transit fit gives a radius ratio $k = R_p/R_\star = 0.0126 \pm 0.0004$. The star’s radius is $R_\star = 1.065 \pm 0.009\ R_\odot$ (Dumusque et al. 2014). Write the result sentence of the report, with its budget and its comparison with the published $R_p = 1.47^{+0.03}_{-0.02}\ R_\oplus$.`,
    visual: budgetPic([['radius ratio k', +(100 * SK / K).toFixed(2)], ['stellar radius', +(100 * SRS / RS).toFixed(2)]], 'The budget of the worked example: the transit fit dominates.'),
    steps: [
      { label: 'The value', text: t`$R_p = k R_\star = 0.0126 \times 1.065\ R_\odot \times ${RSUN_REARTH.toFixed(2)}\ R_\oplus/R_\odot = ${RP.toFixed(4)}\ R_\oplus$ (with the IAU nominal solar and Earth radii).` },
      { label: 'The budget', text: t`Relative errors: $k$ contributes $0.0004/0.0126 = ${(100 * SK / K).toFixed(1)}\%$, $R_\star$ contributes $0.009/1.065 = ${(100 * SRS / RS).toFixed(1)}\%$. For a product they add in quadrature: $\sqrt{${(100 * SK / K).toFixed(2)}^2 + ${(100 * SRS / RS).toFixed(2)}^2} = ${(100 * REL).toFixed(1)}\%$.` },
      { label: 'Round', text: t`$\sigma = ${(100 * REL).toFixed(1)}\% \times ${RP.toFixed(3)} = ${SRP.toFixed(3)}\ R_\oplus$. Quote the uncertainty to one or two figures and the value to match: $R_p = ${RP.toFixed(2)} \pm ${SRP.toFixed(2)}\ R_\oplus$.` },
      { label: 'Compare', text: t`The difference from $1.47$ is $${(1.47 - RP).toFixed(2)}\ R_\oplus$, a fraction of either uncertainty: consistent. Say so in numbers, not adjectives.` },
      { label: 'Say what dominates', text: t`The transit fit contributes almost all of the error, so the discussion should say how more transits would shrink it — and that a better stellar radius would not help.` },
    ],
    answer: t`“We find $R_p = ${RP.toFixed(2)} \pm ${SRP.toFixed(2)}\ R_\oplus$, dominated by the uncertainty of the transit depth, consistent with the $1.47^{+0.03}_{-0.02}\ R_\oplus$ of Dumusque et al. (2014).”`,
  },
  practice: [
    num({
      id: 'quadrature', difficulty: 1,
      gen(r) {
        const a = r.pick([1.2, 1.5, 2.0, 2.4]), b = r.pick([0.5, 0.7, 0.9]), c = r.pick([0.3, 0.4, 0.6]);
        const ans = Math.hypot(a, b, c);
        return {
          prompt: t`A measurement of $g$ has three independent error sources: timing ${a} parts per thousand, length ${b}, and the amplitude correction ${c}. What is the total, in parts per thousand?`,
          visual: budgetPic([['timing', a / 10], ['length', b / 10], ['amplitude', c / 10]], 'The three terms (here in per cent) and their quadrature total.', false),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a + b + c, feedback: 'Independent errors do not simply add: they partly cancel. Add their squares.' }],
          hints: ['Square each, add, take the square root.'],
          teach: 'Independent uncertainties add in quadrature, so the largest one dominates.',
          explain: t`$\sqrt{${a}^2 + ${b}^2 + ${c}^2} = ${ans.toFixed(2)}$ parts per thousand — barely more than the timing term alone.`,
        };
      },
    }),
    mcq({
      id: 'which-to-improve', difficulty: 2,
      prompt: 'Your budget for a planet’s radius: transit depth 3.2%, stellar radius 0.8%, limb darkening 1.0%. You have one month left. What is worth doing?',
      visual: budgetPic([['transit depth', 3.2], ['stellar radius', 0.8], ['limb darkening', 1.0]], 'The budget as bars, with the quadrature total.'),
      choices: ['Add more transits to the fit, to shrink the 3.2% term', 'Find a better stellar radius', 'Refine the limb-darkening model', 'Nothing: 3.5% is good enough'],
      answer: 0,
      why: { 1: t`Even a perfect stellar radius leaves $\sqrt{3.2^2 + 1.0^2} = 3.35\%$.`, 2: t`Removing it entirely leaves $\sqrt{3.2^2 + 0.8^2} = 3.30\%$.`, 3: 'Maybe — but the question is where the month helps most, and the budget answers it.' },
      hints: ['The total is the square root of the sum of squares. Which term, halved, moves it most?'],
      teach: 'The budget tells you where effort pays: shrink the largest term first.',
      explain: t`Halving the transit-depth term takes the total from $${Math.hypot(3.2, 0.8, 1).toFixed(2)}\%$ to $${Math.hypot(1.6, 0.8, 1).toFixed(2)}\%$; halving either other term trims it by only about a tenth of a percentage point (to $${Math.hypot(3.2, 0.4, 1).toFixed(2)}\%$ or $${Math.hypot(3.2, 0.8, 0.5).toFixed(2)}\%$). Since the statistical error falls as $1/\sqrt{N}$, four times as many transits halve it.`,
    }),
    order({
      id: 'sections', difficulty: 1,
      prompt: 'Put the parts of a research paper in their usual order.',
      visual: paperPic(-1, 'A paper’s anatomy; the heights are a rough guide to length, not a rule.'),
      items: ['Title', 'Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusions', 'Data and code availability, then references'],
      hints: ['The abstract summarizes everything after it.', 'Discussion interprets the results, so it follows them.'],
      teach: 'Title, abstract, introduction, methods, results, discussion, conclusions, then availability and references.',
      explain: 'Readers skip about: most read the title, the abstract and the figures, and only some read the methods. The order lets each kind of reader find what they want.',
    }),
    match({
      id: 'where-sentence', difficulty: 2,
      prompt: 'Which section does each sentence belong in?',
      visual: paperPic(4, 'Results (gold) give numbers; discussion interprets them.'),
      left: [
        'Kepler-10b was the first planet with a measured density showing it to be rocky.',
        'We fold the light curve on the period found by a box least-squares search.',
        t`The fitted transit depth is $159 \pm 10$ parts per million.`,
        'Our radius agrees with the published value; the limb-darkening model is the largest remaining systematic.',
      ],
      right: ['Introduction', 'Methods', 'Results', 'Discussion', 'Abstract only'],
      answer: [0, 1, 2, 3],
      hints: ['Background → introduction; what you did → methods; what you found → results; what it means → discussion.'],
      teach: 'Each section has one job: why, how, what, and what it means.',
      explain: 'Keeping interpretation out of the results section lets a reader separate what you measured from what you think it means.',
    }),
    mcq({
      id: 'format', difficulty: 2,
      prompt: t`Your code prints $R_p = 1.463\,74$ and $\sigma = 0.048\,12$ (Earth radii). How do you write the result?`,
      visual: budgetPic([['radius ratio k', 3.17], ['stellar radius', 0.85]], 'A 3.3% total: the second decimal of the radius is already uncertain.'),
      choices: [t`$R_p = 1.464 \pm 0.048\ R_\oplus$ (or $1.46 \pm 0.05$)`, t`$R_p = 1.463\,74 \pm 0.048\,12\ R_\oplus$`, t`$R_p = 1.5 \pm 0.048\ R_\oplus$`, t`$R_p = 1.46374\ R_\oplus$, accurate to 0.3%`],
      answer: 0,
      why: { 1: 'Digits beyond the uncertainty’s first two are noise; they claim a precision you do not have.', 2: 'The value must be rounded to the same decimal place as the uncertainty.', 3: 'A result without its uncertainty cannot be compared with anything — and 0.3% is not its uncertainty.' },
      hints: ['Round the uncertainty to one or two significant figures first.', 'Then round the value to the same decimal place.'],
      teach: 'Round the uncertainty to one or two figures, and the value to the same decimal place.',
      explain: t`$0.048$ (two figures) sets the third decimal place, so $1.464 \pm 0.048$; or $1.46 \pm 0.05$ with one figure. The extra digits from the code describe the arithmetic, not the planet.`,
    }),
    mcq({
      id: 'abstract', difficulty: 2,
      prompt: 'Which abstract sentence does the most work?',
      visual: paperPic(1, 'The abstract (gold) is read many times more often than the rest.'),
      choices: [
        t`“We measure Kepler-10b’s radius as $1.46 \pm 0.05\ R_\oplus$ from Kepler photometry, consistent with the published $1.47^{+0.03}_{-0.02}\ R_\oplus$.”`,
        '“Exoplanets are a rapidly growing field of great interest.”',
        '“We analysed Kepler data using Python and found interesting results.”',
        '“The radius of Kepler-10b is discussed in Section 4.”',
      ],
      answer: 0,
      why: { 1: 'True of half the papers on arXiv; it tells the reader nothing about yours.', 2: '“Interesting results” is a promise, not a result.', 3: 'An abstract that points elsewhere makes the reader do its job.' },
      hints: ['Which sentence could a reader quote?'],
      teach: 'An abstract states the result with its uncertainty and its comparison.',
      explain: 'Method in a phrase, the number with its uncertainty, and how it compares: a reader who stops there still has your result.',
    }),
    mcq({
      id: 'availability', difficulty: 2,
      prompt: 'What should the data-and-code availability statement of your report contain?',
      visual: paperPic(7, 'The last section: where to find everything needed to reproduce the paper.'),
      choices: ['Where the data are archived (with identifiers), the repository and tagged commit of the analysis code, and the software versions used', '“Data available on reasonable request.”', 'A thank-you to the people who helped', 'The full code, pasted into the text'],
      answer: 0,
      why: { 1: 'Requests to authors go unanswered surprisingly often; a public archive is checkable.', 2: 'That is the acknowledgements.', 3: 'Code belongs in a repository, where it can be run and versioned; the paper points to it.' },
      hints: ['What would someone need to reproduce your number? (Module R7.)'],
      teach: 'An availability statement lets a reader reproduce the result: data identifiers, code commit, versions.',
      explain: 'This is R7 written down: the archive and identifiers of the data, the tagged commit, and the environment. With them, “reproduce the paper” is a procedure.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thrust', difficulty: 2, transfer: true,
      gen(r) {
        const cal = r.pick([0.4, 0.5, 0.6]), drift = r.pick([0.2, 0.3]), stat = r.pick([0.1, 0.15, 0.2]), F = r.pick([22.4, 31.7, 45.2]);
        const rel = Math.hypot(cal, drift, stat), ans = F * rel / 100;
        return {
          prompt: t`A hot-fire report gives a mean thrust of $${F}$ kN. Its budget lists the load-cell calibration ($${cal}\%$), thermal drift of the load cell during the burn ($${drift}\%$) and the scatter of the thrust samples ($${stat}\%$), all independent. What total uncertainty, in kN, belongs in the abstract?`,
          visual: budgetPic([['calibration', cal], ['thermal drift', drift], ['statistical', stat]], 'The thrust budget: calibration dominates, as on most test stands.'),
          answer: ans, units: 'kN', tol: { rel: 0.02 },
          errors: [{ value: F * (cal + drift + stat) / 100, feedback: 'Independent errors add in quadrature, not linearly.' }, { value: F * stat / 100, feedback: 'That is only the statistical part; the systematic terms are larger.' }],
          hints: ['Combine the three percentages in quadrature first.', `Then take that percentage of ${F} kN.`],
          teach: 'The abstract quotes the whole budget, systematic terms included — not just the scatter.',
          explain: t`$\sqrt{${cal}^2 + ${drift}^2 + ${stat}^2} = ${rel.toFixed(2)}\%$ of $${F}$ kN $= ${ans.toFixed(2)}$ kN. Quoting only the statistical scatter would understate it by a factor of ${(rel / stat).toFixed(1)}.`,
        };
      },
    }),
    mcq({
      id: 'cp-tension', difficulty: 2,
      prompt: t`Your $H_0$ from a supernova fit differs from the published value by $2.6$ combined standard deviations. Which discussion sentence is right?`,
      visual: paperPic(5, 'The discussion (gold) is where a difference is weighed.'),
      choices: [
        t`“Our value is in mild ($2.6\sigma$) tension with the published one; the largest systematic in our budget, the calibration, could account for it.”`,
        '“Our value disproves the published one.”',
        '“The values agree, since both have error bars.”',
        '“The difference is probably due to human error.”',
      ],
      answer: 0,
      why: { 1: t`A $2.6\sigma$ difference happens by chance about once in a hundred comparisons of two consistent results; it suggests, it does not disprove.`, 2: 'Having error bars is not agreeing: the difference must be compared with them.', 3: '“Human error” names no mechanism, so it cannot be tested.' },
      hints: ['State the size of the difference in σ, then say what in your budget could explain it.'],
      teach: 'State a tension in σ, and name the mechanism that could explain it.',
      explain: t`Numbers, not adjectives: the size in $\sigma$ (see [agreement within uncertainty](#/lesson/lab.A4.1)), then the specific budget entry that could cause it — something a reader could check.`,
    }),
    order({
      id: 'cp-results-para', difficulty: 2,
      prompt: 'Put the sentences of a results-and-discussion paragraph in order.',
      visual: paperPic(4, 'Results first, then their interpretation.'),
      items: [
        'State the measured value with its total uncertainty',
        'Say which term of the budget dominates it',
        'Compare with the published value, in σ',
        'Say what would shrink the uncertainty next',
      ],
      hints: ['A comparison needs the value and its uncertainty first.'],
      teach: 'Value, budget, comparison, next step.',
      explain: 'The reader first needs the number, then how far to trust it, then how it relates to what was known, and finally what would improve it.',
    }),
  ],
  sources: [SRC2.dumusque, SRC2.batalha, SRC2.iau2015, { label: 'JCGM 100:2008, Evaluation of measurement data — Guide to the expression of uncertainty in measurement (GUM)', url: 'https://www.bipm.org/en/committees/jc/jcgm/publications' }],
});
