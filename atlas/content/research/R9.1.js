// Writing a short proposal: one page that argues a question is worth
// answering and can be answered. Its quantitative heart is the feasibility
// estimate: to see an effect Δ at k standard deviations with single-measurement
// scatter σ₁, the mean of N measurements must have σ₁/√N ≤ Δ/k, so
// N = (kσ₁/Δ)². Running case: the amplitude dependence of a pendulum's period
// (T/T₀ − 1 = 1.907 × 10⁻³ at 10°, from the exact elliptic-integral period),
// hopeless with a stopwatch, easy with a photogate; Poisson counting
// (N = 1/ε² counts) for a muon detector; Kepler-10b's 159 ppm transit as the
// transfer. Sections, a testable hypothesis, risks with a fallback, and what
// a reviewer checks. Builds on research.R3 (questions, scoping) and R8.2.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { pageBlocks, SRC2 } from './_rs2.js';

const t = String.raw;
const L10 = Math.log10;
// T/T₀ for a pendulum released at θ₀, from the arithmetic–geometric mean: T/T₀ = 1/AGM(1, cos(θ₀/2))
function agm(a, b) { for (let i = 0; i < 40; i++) { const m = (a + b) / 2; b = Math.sqrt(a * b); a = m; } return a; }
const ratio = (deg) => 1 / agm(1, Math.cos(deg * Math.PI / 360));
const T0 = 2.0, DT10 = T0 * (ratio(10) - 1);       // seconds, for a 2 s pendulum at 10°

// N against the precision of the mean, on log axes
const nPic = (s1, D, k, caption, { mark = true } = {}) => {
  const xc = 2 * L10(k * s1 / D);
  return {
    type: 'graph',
    params: {
      x: [0, 5], y: [-1, 2.5], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'number of measurements N', ylabel: 'σ of the mean (ms)', xticks: 5, yticks: 4,
      curves: [{ fn: `${L10(s1).toFixed(4)} - x/2`, color: 'accent', width: 2.2, label: 'σ₁/√N', labelAt: 0.4, labelDy: -12 }],
      hlines: [{ y: +L10(D / k).toFixed(4), label: `Δ/${k}`, color: 'gold' }],
      ...(mark ? { vlines: [{ x: +xc.toFixed(4), color: 'good' }] } : {}),
    },
    caption,
  };
};

const PAGE = (hl) => [
  ['question and hypothesis', 0.12], ['why it matters', 0.12], ['approach', 0.18], ['feasibility: the error budget', 0.18], ['plan and milestones', 0.14], ['risks and fallback', 0.12], ['what you will deliver', 0.1],
].reduce((acc, [name, h], i) => { const y1 = acc.y; acc.blocks.push({ x0: 0.06, x1: 0.94, y0: y1 - h + 0.006, y1: y1 - 0.006, label: name, color: i === hl ? 'gold' : 'accent', alpha: i === hl ? 0.55 : 0.22 }); acc.y -= h; return acc; }, { y: 0.98, blocks: [] }).blocks;
const pagePic = (hl, caption) => pageBlocks(PAGE(hl), { W: 1, H: 1, caption, extra: { aspect: 'wide' } });

export default lesson({
  id: 'research.R9.1',
  title: 'Writing a short proposal',
  minutes: 12, difficulty: 2,
  intro: t`A proposal asks for time, equipment or money to answer a question, and it must convince a reader of two things in one page: that the answer **matters**, and that you **can get it**. The second is a calculation. If one measurement scatters by $\sigma_1$, the mean of $N$ scatters by $\sigma_1/\sqrt{N}$; to see an effect of size $\Delta$ at $k$ standard deviations you need $\sigma_1/\sqrt{N} \le \Delta/k$, so

$$N = \left(\frac{k\,\sigma_1}{\Delta}\right)^2$$

A proposal that shows this number — and that it fits the time available — has answered the reviewer’s first question before it is asked.`,
  symbols: [
    { tex: 'N', text: 'the number of independent measurements needed' },
    { tex: 'k', text: 'the significance wanted, in standard deviations (3 for “evidence”, 5 for a discovery claim)' },
    { tex: '\\sigma_1', text: 'the scatter of a single measurement, in the units of the effect' },
    { tex: '\\Delta', text: 'the size of the effect you want to detect, in the same units' },
  ],
  why: t`Every telescope proposal, beam-time request and thesis plan is judged first on whether the measurement can work — and this is the line that shows it.`,
  visual: {
    type: 'graph',
    title: 'How many measurements?',
    lead: t`The blue line is the scatter of a mean of $N$ measurements, falling as $1/\sqrt{N}$; the gold line is the effect divided by the significance you want. Where they cross is the $N$ you must propose. Start with a stopwatch timing a pendulum’s swings to see the 10° amplitude effect.`,
    tasks: ['With a stopwatch (σ₁ = 50 ms) the 3.8 ms effect needs about 1600 timed swings at 3σ.', 'Switch to a photogate (σ₁ = 1 ms): a single swing would already do — the instrument decided the project.', 'Ask for 5σ instead of 3σ: N grows by (5/3)², nearly three times.'],
    params: {
      x: [-0.5, 5], y: [-1, 2.5], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'number of measurements N', ylabel: 'σ of the mean (ms)', xticks: 5, yticks: 4,
      sliders: [
        { key: 's', label: t`single-measurement scatter $\sigma_1$`, min: 1, max: 100, step: 1, value: 50, unit: t`\text{ms}`, explain: 'About 50 ms for a hand-held stopwatch (reaction time); about 1 ms or better for a photogate.' },
        { key: 'D', label: t`effect $\Delta$`, min: 1, max: 20, step: 0.1, value: +(DT10 * 1000).toFixed(1), unit: t`\text{ms}`, explain: 'The change you want to detect: here, how much longer a 2 s pendulum’s period is at 10° than at small amplitude.' },
        { key: 'k', label: t`significance $k$`, min: 1, max: 5, step: 1, value: 3, unit: t`\sigma`, explain: 'How many standard deviations the effect should stand above the noise.' },
      ],
      curves: [{ fn: 'log10(s) - x/2', color: 'accent', width: 2.2, label: 'σ₁/√N', labelAt: 0.2, labelDy: -12 }],
      hlines: [{ y: 'log10(D/k)', label: 'Δ/k', color: 'gold' }],
      vlines: [{ x: '2*log10(k*s/D)', color: 'good', when: 'step(2*log10(k*s/D) + 0.5)' }],
      readouts: [{ label: 'N needed', expr: 'max(1, (k*s/D)^2)', digits: 3 }],
    },
    caption: 'Both axes logarithmic. It assumes independent measurements with Gaussian scatter and no systematic error — which no averaging removes, so a proposal must budget for it separately.',
  },
  example: {
    prompt: t`Propose to measure how a pendulum’s period grows with amplitude. For a $2.000$ s pendulum, the exact period at $10^\circ$ is longer by $${(DT10 * 1000).toFixed(2)}$ ms. How many timed swings does a 3σ detection need with a stopwatch ($\sigma_1 = 50$ ms) and with a photogate ($\sigma_1 = 0.5$ ms)? What goes in the feasibility paragraph?`,
    visual: nPic(50, DT10 * 1000, 3, 'The stopwatch case: the crossing sits near N = 1600.'),
    steps: [
      { label: 'The effect', text: t`The exact period exceeds $2\pi\sqrt{L/g}$ by the factor $T/T_0 = ${ratio(10).toFixed(6)}$ at $10^\circ$ (project [P.5](#/lesson/research.P.5) derives it). So $\Delta = ${(DT10 * 1000).toFixed(2)}$ ms.` },
      { label: 'Stopwatch', text: t`$N = (3 \times 50/${(DT10 * 1000).toFixed(2)})^2 = ${Math.round((3 * 50 / (DT10 * 1000)) ** 2)}$ swings — and as many again at small amplitude for the comparison. Over an hour of timing, with a human’s drifting reaction time: not credible.` },
      { label: 'Photogate', text: t`$N = (3 \times 0.5/${(DT10 * 1000).toFixed(2)})^2 = ${((3 * 0.5 / (DT10 * 1000)) ** 2).toFixed(2)}$: a handful of swings is plenty. The **instrument** makes the project feasible.` },
      { label: 'Systematics', text: t`Averaging does not remove systematic error: the amplitude itself decays during timing, and the length must stay fixed between runs. The paragraph names these and how they are controlled.` },
      { label: 'The paragraph', text: t`“With a photogate ($\sigma_1 \approx 0.5$ ms per period), 20 periods at each of six amplitudes measure the $${(DT10 * 1000).toFixed(1)}$ ms difference between $10^\circ$ and small amplitude at over $${Math.floor(DT10 * 1000 / (0.5 * Math.sqrt(2 / 20)))}\sigma$; the dominant systematic, amplitude decay, is measured and corrected.”` },
    ],
    answer: t`Stopwatch: about $${Math.round((3 * 50 / (DT10 * 1000)) ** 2)}$ swings — infeasible. Photogate: a few swings. Propose the photogate, and budget the systematics separately.`,
  },
  practice: [
    num({
      id: 'n-needed', difficulty: 2,
      gen(r) {
        const s1 = r.pick([5, 8, 10, 20]), D = r.pick([1, 1.5, 2, 2.5]), k = r.pick([3, 5]);
        const ans = (k * s1 / D) ** 2;
        return {
          prompt: t`A single measurement scatters by $\sigma_1 = ${s1}$ units. To detect an effect of $\Delta = ${D}$ units at $${k}\sigma$, how many independent measurements must you average?`,
          visual: nPic(s1, D, k, 'The scatter of the mean against N, with the target Δ/k; the crossing is not marked.', { mark: false }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: k * s1 / D, feedback: t`The scatter of the mean falls as $1/\sqrt{N}$, so $N$ is the **square** of $k\sigma_1/\Delta$.` }, { value: (s1 / D) ** 2, feedback: `That gives a 1σ effect. Multiply σ₁ by k = ${k} first.` }],
          hints: [t`Solve $\sigma_1/\sqrt{N} = \Delta/k$ for $N$.`, t`$N = (k\sigma_1/\Delta)^2$.`],
          teach: t`The scatter of a mean falls only as $1/\sqrt{N}$, so precision is expensive: $N = (k\sigma_1/\Delta)^2$.`,
          explain: t`$N = (${k} \times ${s1}/${D})^2 = ${ans.toFixed(0)}$.`,
        };
      },
    }),
    num({
      id: 'counts', difficulty: 2,
      gen(r) {
        const eps = r.pick([1, 2, 3, 5]), rate = r.pick([12, 15, 18, 25]);
        const N = 1 / (eps / 100) ** 2, ans = N / rate;
        return {
          prompt: t`A desktop muon detector counts about ${rate} muons per minute. Counts are Poisson, so $N$ counts have a fractional uncertainty $1/\sqrt{N}$. How many **minutes** of counting give the rate to ${eps}%?`,
          visual: { type: 'graph', params: { x: [1, 5], y: [-2.6, 0], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'counts N', ylabel: 'fractional uncertainty 1/√N', xticks: 4, yticks: 3, curves: [{ fn: '-x/2', color: 'accent', width: 2.2 }], hlines: [{ y: +L10(eps / 100).toFixed(4), label: `${eps}%`, color: 'gold' }] }, caption: 'The fractional uncertainty of a count falls as one over its square root.' },
          answer: ans, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: N, feedback: 'That is the number of counts. Divide by the counting rate to get the time.' }, { value: 1 / (eps / 100) / rate, feedback: t`The fractional uncertainty is $1/\sqrt{N}$, so $N = 1/\varepsilon^2$, not $1/\varepsilon$.` }],
          hints: [t`$1/\sqrt{N} = ${eps / 100}$ gives $N$.`, `Then time = N ÷ ${rate} per minute.`],
          teach: t`For counting, $N = 1/\varepsilon^2$ counts give fractional precision $\varepsilon$; the rate turns that into time.`,
          explain: t`$N = 1/${eps / 100}^2 = ${N.toFixed(0)}$ counts, which at ${rate} per minute take $${ans.toFixed(0)}$ minutes${ans > 120 ? ` — about ${(ans / 60).toFixed(1)} hours` : ''}. See [counting statistics](#/lesson/lab.A2.3).`,
        };
      },
    }),
    mcq({
      id: 'hypothesis', difficulty: 2,
      prompt: 'Which is the best one-sentence objective for a proposal?',
      visual: pagePic(0, 'A one-page proposal; the gold block is the question and hypothesis.'),
      choices: [
        'Measure the pendulum period at six amplitudes from 5° to 40° and test whether it follows the exact elliptic-integral law to 0.05%',
        'Investigate pendulums',
        'Prove that the small-angle formula is wrong',
        'Gain experience with data analysis',
      ],
      answer: 0,
      why: { 1: 'A topic, not an objective: there is no way to tell when it is done.', 2: 'The small-angle formula is an approximation known to fail at large amplitude; nothing needs proving — and “prove” presumes the result.', 3: 'A good outcome for you, but not a question the reviewer is paying to see answered.' },
      hints: ['A good objective names what is measured, over what range, and what result would count as success or failure.'],
      teach: 'An objective is testable: it names the measurement, the model and the precision that decides.',
      explain: 'The first choice says what will be measured, which model is tested, and at what precision — so a reviewer can judge feasibility and anyone can tell, afterwards, whether it was achieved.',
    }),
    order({
      id: 'page', difficulty: 1,
      prompt: 'Put the parts of a one-page proposal in order.',
      visual: pagePic(-1, 'One page, seven parts; the sizes are a rough guide.'),
      items: ['Question and hypothesis', 'Why it matters', 'Approach', 'Feasibility: the uncertainty budget', 'Plan and milestones', 'Risks and fallback', 'What you will deliver'],
      hints: ['The reader must know what you ask before why, and why before how.', 'Risks refer to the plan, so they come after it.'],
      teach: 'Question, importance, approach, feasibility, plan, risks, deliverables.',
      explain: 'Each part answers the question the previous one raises: what? why? how? will it work? when? what if not? what will exist at the end?',
    }),
    num({
      id: 'k-ratio', difficulty: 2,
      gen(r) {
        const [k1, k2] = r.pick([[2, 3], [3, 5], [2, 5], [3, 4]]);
        const ans = (k2 / k1) ** 2;
        return {
          prompt: t`Your proposal planned enough measurements for a $${k1}\sigma$ detection. A reviewer asks for $${k2}\sigma$. By what factor must the number of measurements grow?`,
          visual: nPic(10, 2, k2, `Raising k lowers the gold line, pushing the crossing to larger N.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: k2 / k1, feedback: t`$N \propto k^2$: square the ratio.` }],
          hints: [t`$N = (k\sigma_1/\Delta)^2$, and only $k$ changes.`],
          teach: t`Significance is expensive: $N$ grows as $k^2$.`,
          explain: t`$(${k2}/${k1})^2 = ${ans.toFixed(2)}$ times as many measurements.`,
        };
      },
    }),
    mcq({
      id: 'risk', difficulty: 2,
      prompt: 'Which risk-and-fallback line belongs in the proposal for the pendulum project?',
      visual: pagePic(5, 'Risks and fallback (gold): what could stop the project, and what you would do.'),
      choices: [
        `If the photogate is unavailable, a phone’s video at 240 frames per second (about 4 ms per frame) still measures the 40° point, where the effect is ${(T0 * (ratio(40) - 1) * 1000).toFixed(0)} ms`,
        'There are no risks',
        'If anything goes wrong we will work harder',
        'Risk: the result might disagree with theory',
      ],
      answer: 0,
      why: { 1: 'Every project has risks; saying otherwise tells the reviewer you have not looked.', 2: 'Effort is not a plan.', 3: 'A disagreement would be a result, not a risk to the project.' },
      hints: ['A fallback is specific, and it is checked against the size of the effect.'],
      teach: 'Name the likeliest failure and a specific fallback that still delivers part of the result.',
      explain: t`At $40^\circ$ the period is longer by $${(T0 * (ratio(40) - 1) * 1000).toFixed(0)}$ ms, so a camera’s few-millisecond frames still resolve it after averaging. A fallback that keeps part of the result is what a reviewer looks for.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-transit', difficulty: 3, transfer: true,
      gen(r) {
        const s1 = r.pick([600, 800, 1000, 1200]), k = r.pick([5, 7, 10]);
        const D = 159, ans = (k * s1 / D) ** 2;
        return {
          prompt: t`A proposal asks for photometry of Kepler-10 to recover the transit of Kepler-10b, whose depth is $(R_p/R_\star)^2 \approx 159$ parts per million. Each 2-minute brightness measurement scatters by $${s1}$ ppm. How many in-transit measurements are needed to detect the transit at $${k}\sigma$?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-260, 80], aspect: 'wide', axesAt: 'edge', xlabel: 'time from mid-transit (h)', ylabel: 'brightness change (ppm)', xticks: 6, yticks: 4, curves: [{ fn: '-159*step(0.9 - abs(x))', color: 'accent', width: 2.2, samples: 2000 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'An idealized box-shaped transit 159 ppm deep; real transits have rounded edges (limb darkening). The duration is illustrative.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: k * s1 / D, feedback: t`Square it: the mean’s scatter falls as $1/\sqrt{N}$.` }, { value: (s1 / D) ** 2, feedback: `That gives 1σ; the proposal asks for ${k}σ.` }],
          hints: [t`Here $\Delta = 159$ ppm and $\sigma_1 = ${s1}$ ppm.`, t`$N = (k\sigma_1/\Delta)^2$.`],
          teach: 'A transit search proposal is a feasibility calculation: depth against per-point noise, then the number of points.',
          explain: t`$N = (${k} \times ${s1}/159)^2 = ${ans.toFixed(0)}$ in-transit points. Each transit gives a fixed number of them, so this sets how many transits — and how long an observing run — to request.`,
        };
      },
    }),
    mcq({
      id: 'cp-feasible', difficulty: 2,
      prompt: 'A reviewer writes: “The proposal does not show that the measurement can reach the precision claimed.” What fixes it?',
      visual: pagePic(3, 'Feasibility (gold): the uncertainty budget that shows the measurement can work.'),
      choices: ['An a-priori uncertainty budget: the effect’s size, each error source with its estimated size, and the N and time that bring the total below the effect', 'A longer introduction on why the question matters', 'A statement of the team’s experience', 'A promise to publish the result'],
      answer: 0,
      why: { 1: 'The reviewer has not questioned the importance, only the feasibility.', 2: 'Experience helps, but it does not replace the numbers.', 3: 'Publication is an outcome, not evidence that the measurement works.' },
      hints: ['What would show, with numbers, that the measurement can work?'],
      teach: 'Feasibility is shown with an a-priori budget, not asserted.',
      explain: 'The same budget as a report’s (R8.2), written before the measurement: it shows the reviewer the precision is reachable, and shows you which part of the setup matters most.',
    }),
  ],
  sources: [SRC2.batalha, SRC2.dumusque, { label: 'J. R. Taylor, An Introduction to Error Analysis, 2nd ed. (University Science Books, 1997), ch. 4–5 (the standard deviation of the mean)', url: 'https://uscibooks.aip.org/books/introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-2nd-ed/' }],
});
