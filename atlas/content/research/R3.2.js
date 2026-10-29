// Scoping a project: size the effect first (Mercury's general-relativistic
// perihelion advance, 6πGM/(c²a(1−e²)) per orbit — computed here for four
// planets), define the minimum viable result, put the riskiest step first,
// plan with contingency, and keep a must/should/could list against scope
// creep. Points forward to the miniature project research.P.4.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { timeBars, SRC } from './_rs.js';

const t = String.raw;
const GM = 1.32712440018e20, C = 299792458, AU = 1.495978707e11, ARC = 180 / Math.PI * 3600;
// semi-major axis (AU), eccentricity, sidereal period (days): NASA fact sheet
const PL = { Mercury: [0.387098, 0.20563, 87.969], Venus: [0.723332, 0.006772, 224.701], Earth: [1.0, 0.016709, 365.256], Mars: [1.523679, 0.0934, 686.98] };
const dphi = ([a, e]) => 6 * Math.PI * GM / (C * C * a * AU * (1 - e * e));     // rad per orbit
const MERC = dphi(PL.Mercury), MERC_AS = MERC * ARC, NORB = 36525 / PL.Mercury[2];

// a ten-week project plan with a slip factor k and a deadline D
const PLAN = [
  { y: 6, a: 0, b: 2, color: 'accent', label: 'must: verify the integrator on a Kepler orbit' },
  { y: 5, a: 2, b: 4, color: 'accent', label: 'must: reproduce 42.98″ per century' },
  { y: 4, a: 4, b: 5, color: 'accent', label: 'must: write up the minimum result' },
  { y: 3, a: 5, b: 7.5, color: 'gold', label: 'should: add Venus and Jupiter' },
  { y: 2, a: 7.5, b: 9, color: 'violet', label: 'could: compare two integrators' },
  { y: 1, a: 9, b: 10, color: 'violet', label: 'could: test a modified-gravity term' },
];
const ganttStatic = (caption) => timeBars(PLAN.map((p) => ({ y: p.y, from: p.a, to: p.b, color: p.color, label: p.label })), { x: [-0.3, 13], y: [0.4, 6.8], xlabel: 'week', xticks: 6, vlines: [{ x: 10, label: 'end of term', color: 'bad' }] }, { caption, h: 0.28 });

const orbitPic = (caption) => ({ type: 'cm3-orbit', params: { force: 'gr', delta: 0.01, L: 1, E: -0.3, sliders: [], turns: 6, panels: ['orbit'], readouts: [], play: false, dragE: false, labels: false }, caption });

export default lesson({
  id: 'research.R3.2',
  title: 'Scoping a project',
  minutes: 12, difficulty: 2,
  intro: t`A well-scoped project is one that can **finish**. Scoping starts with the size of the effect, because that sets every requirement downstream. Mercury’s orbit, for example, turns by a tiny angle each revolution because of general relativity:

$$\Delta\phi = \frac{6\pi G M_\odot}{c^2\,a\,(1 - e^2)} \quad \text{per orbit}$$

That is about $0.1''$ — so an integrator must keep its own angular error far below $10^{-7}$ radians per orbit, or the effect must be exaggerated in a controlled way. From the size of the effect follow the **minimum viable result** (the smallest finished thing worth reporting), the order of the work (riskiest step first), a schedule with **contingency**, and a list of what you will *not* do unless time remains.`,
  symbols: [
    { tex: '\\Delta\\phi', text: 'the advance of the perihelion direction per orbit, in radians' },
    { tex: 'G M_\\odot', text: 'the Sun’s gravitational parameter, $1.327\\times10^{20}\\ \\text{m}^3\\,\\text{s}^{-2}$' },
    { tex: 'c', text: 'the speed of light, $2.998\\times10^{8}$ m/s' },
    { tex: 'a', text: 'the orbit’s semi-major axis, in metres' },
    { tex: 'e', text: 'the orbit’s eccentricity (a pure number)' },
  ],
  why: t`An unfinished ambitious project teaches less, and convinces nobody, compared with a finished modest one that can be extended.`,
  visual: {
    type: 'graph',
    title: 'A plan meets reality',
    lead: t`A ten-week plan for the Mercury project: **must** tasks (blue) make the minimum viable result; **should** (gold) and **could** (violet) are extensions. Tasks often take longer than planned: the slip factor stretches every task. The red line is the end of term.`,
    tasks: ['Set the slip to 1.5: the "could" tasks fall off the end — but the minimum result still finishes.', 'Imagine the order reversed, extensions first: at slip 1.5, the minimum result would not exist at the deadline.', 'Find the largest slip at which the "should" task still finishes.'],
    params: {
      x: [-0.3, 16], y: [0.4, 6.8], aspect: 'wide', axesAt: 'edge', xlabel: 'week', ylabel: '', yticks: 0, xticks: 8,
      sliders: [{ key: 'k', label: 'slip factor', min: 1, max: 2, step: 0.05, value: 1, explain: 'How much longer every task takes than planned (1.5 = 50% longer).' }],
      shade: PLAN.map((p) => ({ fn: String(p.y + 0.28), lower: String(p.y - 0.28), from: `${p.a}*k`, to: `${p.b}*k`, color: p.color, alpha: 0.55 })),
      points: PLAN.map((p) => ({ x: `${p.a}*k`, y: p.y + 0.28, r: 0, label: p.label, color: 'ink', labelDx: 2, labelDy: -9 })),
      vlines: [{ x: 10, label: 'end of term', color: 'bad' }],
      readouts: [{ label: 'minimum result done in week', expr: '5*k', digits: 3 }, { label: '"should" done in week', expr: '7.5*k', digits: 3 }],
    },
    caption: 'An illustrative plan, not a recommended schedule. Tasks rarely all slip by the same factor; the point is the order.',
  },
  example: {
    prompt: t`Scope a ten-week project: "measure Mercury’s general-relativistic perihelion advance by numerical integration". Mercury has $a = 0.387\,098$ AU, $e = 0.205\,63$ and a period of 87.969 days.`,
    visual: orbitPic('A precessing orbit under Newton plus a GR term, enormously exaggerated so that the turning is visible.'),
    steps: [
      { label: 'Size the effect', text: t`$\Delta\phi = \dfrac{6\pi GM_\odot}{c^2 a (1 - e^2)} = ${MERC.toExponential(3).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad $= ${MERC_AS.toFixed(4)}''$ per orbit. With $36\,525/87.969 = ${NORB.toFixed(1)}$ orbits per century, that is $${(MERC_AS * NORB).toFixed(2)}''$ per century.` },
      { label: 'What that demands', text: t`Measuring $5\times10^{-7}$ rad per orbit to 1% needs angular errors below about $5\times10^{-9}$ rad per orbit. Possible with a high-order integrator at tight tolerance — and risky. A safer route: multiply the GR term by a factor $\lambda$ (say 100 or 1000), check the advance scales as $\lambda$, and divide.` },
      { label: 'Minimum viable result', text: t`"Our integrator reproduces $42.98''$ per century to 1%, via exaggerated runs extrapolated to $\lambda = 1$." Small, finished, checkable — and the base for any extension.` },
      { label: 'Riskiest first', text: t`The step most likely to sink the project is finding the perihelion precisely enough. Test it in week 1 on a pure Kepler orbit, where the advance must be zero.` },
      { label: 'Contingency and cuts', text: t`Plan the minimum result for about half the term; then **should** (other planets’ pull) and **could** (comparing integrators, a modified-gravity term). If time runs short, cut from the bottom.` },
    ],
    answer: t`Effect: $${MERC_AS.toFixed(4)}''$ per orbit, $${(MERC_AS * NORB).toFixed(2)}''$ per century. Minimum viable result: reproduce it to 1% with a verified integrator, using controlled exaggeration. Riskiest step first; extensions only after the minimum result is written up.`,
  },
  practice: [
    num({
      id: 'per-orbit', difficulty: 2,
      gen(r) {
        const name = r.pick(['Mercury', 'Venus', 'Earth', 'Mars']), [a, e] = PL[name];
        const ans = dphi(PL[name]) * ARC;
        return {
          prompt: t`For ${name} ($a = ${a}$ AU, $e = ${e}$; $1\ \text{AU} = 1.496\times10^{11}$ m, $GM_\odot = 1.327\times10^{20}\ \text{m}^3\,\text{s}^{-2}$), what is the general-relativistic perihelion advance per orbit, in arcseconds?`,
          visual: orbitPic(t`An exaggerated precessing orbit. For the real planets, $\Delta\phi$ is a fraction of an arcsecond per orbit.`),
          answer: ans, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: 6 * Math.PI * GM / (C * C * a * AU) * ARC, feedback: t`You left out the $1/(1 - e^2)$ factor.` }, { value: dphi(PL[name]), feedback: 'That is in radians. Multiply by 206 265 for arcseconds.' }].filter((x) => Math.abs(x.value - ans) > 0.015 * ans),
          hints: [t`Convert $a$ to metres first: $a = ${a} \times 1.496\times10^{11}$ m.`, t`The formula gives radians; $1\ \text{rad} = 206\,265''$.`],
          teach: 'Size the effect before planning the method: it decides the precision everything else must reach.',
          explain: t`$\Delta\phi = ${dphi(PL[name]).toExponential(3).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad $= ${ans.toFixed(4)}''$ per orbit.`,
        };
      },
    }),
    num({
      id: 'per-century', difficulty: 2,
      gen(r) {
        const name = r.pick(['Mercury', 'Venus', 'Earth', 'Mars']), P = PL[name][2];
        const per = +(dphi(PL[name]) * ARC).toFixed(4), ans = per * 36525 / P;
        return {
          prompt: t`${name}’s perihelion advances by $${per}''$ per orbit and its period is $${P}$ days. How many arcseconds is that per Julian century (36 525 days)?`,
          visual: ganttStatic('The Mercury project’s plan: the second must-task is to reproduce this kind of number.'),
          answer: ans, units: 'arcsec', tol: { rel: 0.005 },
          errors: [{ value: per * 100, feedback: 'A century is 100 years, not 100 orbits: count orbits per century first.' }].filter((x) => Math.abs(x.value - ans) > 0.01 * ans),
          hints: [t`Orbits per century $= 36\,525/${P}$.`],
          teach: 'Turn a per-orbit effect into the per-century number that the literature quotes, and you have a target to reproduce.',
          explain: t`$36\,525/${P} = ${(36525 / P).toFixed(1)}$ orbits, so $${per} \times ${(36525 / P).toFixed(1)} = ${ans.toFixed(2)}''$ per century.${name === 'Mercury' ? ' The famous 43″.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'mvr', difficulty: 2,
      prompt: 'Which is the best **minimum viable result** for the ten-week Mercury project?',
      visual: ganttStatic('The plan: must (blue), should (gold), could (violet). The minimum result is the end of the blue tasks.'),
      choices: [
        'A verified integrator that reproduces 42.98″ per century to 1%, written up',
        'A full N-body model of the Solar System with every planet and asteroid',
        'A new test of a modified theory of gravity',
        'A literature review of the perihelion problem since 1859',
      ],
      answer: 0,
      why: { 1: 'A worthy end point, but if it slips, nothing is finished.', 2: 'Only meaningful after the code is known to reproduce GR.', 3: 'Useful background, but not a result of this project.' },
      hints: ['The minimum result must be small enough to finish and worth reporting on its own.', 'Every extension depends on it.'],
      teach: 'The minimum viable result is the smallest finished, checkable thing worth reporting — and the foundation for every extension.',
      explain: 'Reproducing the known number is small, checkable against the literature, and the base for everything else. The other options are extensions or background.',
    }),
    order({
      id: 'scope-steps', difficulty: 2,
      prompt: 'Put the steps of scoping a project in order.',
      visual: ganttStatic('The outcome of scoping: an ordered plan with a deadline and tiers.'),
      items: [
        'State the question and estimate the size of the effect',
        'Define the minimum viable result',
        'List the tasks and estimate each one',
        'Put the riskiest task first',
        'Add contingency and sort extras into should and could',
        'Set dates to review progress and cut scope',
      ],
      hints: ['The size of the effect decides what the minimum result can be.', 'Review dates come last: they act on the plan.'],
      teach: 'Effect size → minimum result → tasks → risk first → contingency and tiers → review points.',
      explain: 'Each step depends on the one before. The review dates are where you decide, early, to cut the "could" list instead of losing the minimum result.',
    }),
    num({
      id: 'slip', difficulty: 2,
      gen(r) {
        const weeks = r.int(8, 14), k = r.pick([1.3, 1.5, 1.8]);
        const ans = weeks / k;
        return {
          prompt: t`Your past projects took ${k}× as long as planned. You have ${weeks} weeks. How many weeks of **planned** work should your plan contain? (Give the number of weeks.)`,
          visual: ganttStatic(`Plans stretch: at a slip factor of ${k}, a task planned for 2 weeks takes ${(2 * k).toFixed(1)}.`),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: weeks * k, feedback: 'That is how long the plan would take. Divide the time you have by the slip factor.' }],
          hints: ['Planned work × slip = real time.', t`So planned work $= ${weeks}/${k}$.`],
          teach: 'Plan to fill the time you have divided by your realistic slip factor, not the whole calendar.',
          explain: t`$${weeks}/${k} = ${ans.toFixed(1)}$ weeks of planned work. Put the minimum viable result well inside that.`,
        };
      },
    }),
    mcq({
      id: 'risk-first', difficulty: 3,
      prompt: 'In week 1, which task should come first?',
      visual: orbitPic('The perihelion turns by a tiny angle each orbit; finding it precisely is the crux.'),
      choices: [
        'Check that your perihelion-finding recovers zero advance on a pure Kepler orbit, to below 10⁻⁸ rad per orbit',
        'Make publication-quality plots of the orbit',
        'Add Jupiter’s perturbations',
        'Write the introduction',
      ],
      answer: 0,
      why: { 1: 'Polish can wait; if the method fails, the plots are of nothing.', 2: 'An extension, which multiplies the effects you must disentangle.', 3: 'Writing early helps, but it cannot rescue a method that does not work.' },
      hints: ['What is most likely to make the whole project impossible?', 'The effect is 5 × 10⁻⁷ rad per orbit.'],
      teach: 'De-risk early: do first the step most likely to show the plan cannot work.',
      explain: 'If the perihelion cannot be located to far below 5 × 10⁻⁷ rad, the direct method fails and you need the exaggeration route — better to know in week 1 than in week 8.',
    }),
    mcq({
      id: 'creep', difficulty: 2,
      prompt: 'In week 4, before the minimum result is written up, you read that the Sun’s rotation adds a tiny frame-dragging (Lense–Thirring) contribution to Mercury’s perihelion. What do you do?',
      visual: ganttStatic('The plan at week 4: the minimum result is due in week 5.'),
      choices: [
        'Note it on the "could" list and finish the minimum result first',
        'Stop and add it now: completeness matters most',
        'Drop the original goal and switch to frame dragging',
        'Ignore it permanently, since it was not in the plan',
      ],
      answer: 0,
      why: { 1: 'That is scope creep: the finished minimum result is what protects the project.', 2: 'Switching goals mid-project usually ends with two unfinished projects.', 3: 'Plans change; the idea belongs in the extension list or the write-up’s outlook.' },
      hints: ['What protects the project from ending with nothing finished?'],
      teach: 'New ideas go on the could-list; the minimum viable result is finished first.',
      explain: 'Frame dragging from the Sun is tiny compared with the 43″ (well under 0.1″ per century), so it fits naturally as an extension or in the outlook — after the core result exists.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pulsar', difficulty: 2, transfer: true,
      prompt: t`The binary pulsar PSR B1913+16 has an orbital period of 0.322 997 days, and its periastron advances by about $4.23^\circ$ per year (Weisberg & Huang 2016). How many **arcseconds per orbit** is that?`,
      visual: orbitPic('An exaggerated precessing orbit. For the pulsar the advance per orbit is over a hundred times Mercury’s.'),
      answer: 4.23 * 3600 / (365.25 / 0.322997), units: 'arcsec', tol: { rel: 0.01 },
      errors: [{ value: 4.23 * 3600, feedback: 'That is per year. Divide by the number of orbits in a year.' }, { value: 4.23 / (365.25 / 0.322997), feedback: 'That is in degrees; multiply by 3600 for arcseconds.' }],
      hints: [t`Orbits per year $= 365.25/0.322\,997$.`, t`$1^\circ = 3600''$.`],
      teach: 'Comparing effect sizes across systems shows which projects are easy and which are hard.',
      explain: t`$365.25/0.322\,997 = ${(365.25 / 0.322997).toFixed(0)}$ orbits per year, so $4.23 \times 3600/${(365.25 / 0.322997).toFixed(0)} = ${(4.23 * 3600 / (365.25 / 0.322997)).toFixed(1)}''$ per orbit — about ${Math.round(4.23 * 3600 / (365.25 / 0.322997) / MERC_AS)} times Mercury’s. The pulsar is a much stronger-field laboratory.`,
    }),
    num({
      id: 'cp-budget', difficulty: 3,
      gen(r) {
        const lam = r.pick([1, 10, 100, 1000]);
        const ans = 0.01 * lam * MERC;
        return {
          prompt: t`To measure Mercury’s advance to 1%, the integrator’s angular error per orbit must stay below 1% of the advance it is measuring. If the GR term is exaggerated by $\lambda = ${lam}$ (so the advance per orbit is $\lambda$ times $${MERC.toExponential(3).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad), what is that error budget, in radians per orbit?`,
          visual: orbitPic('An exaggerated GR term makes the advance per orbit larger, and the precision needed proportionally looser.'),
          answer: ans, units: 'rad', tol: { rel: 0.01 },
          errors: [{ value: 0.01 * MERC, feedback: 'Exaggerating the effect by λ also loosens the budget by λ.' }].filter((x) => Math.abs(x.value - ans) > 0.02 * ans),
          hints: ['The advance per orbit is λ times the real one.', t`Budget $= 0.01 \times \lambda \times \Delta\phi$.`],
          teach: 'An exaggeration you can undo exactly trades physics realism for numerical slack — and it must be checked to scale linearly.',
          explain: t`$0.01 \times ${lam} \times ${MERC.toExponential(3).replace(/e(-?\d+)/, '\\times10^{$1}')} = ${ans.toExponential(2).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad per orbit. ${lam > 1 ? 'The exaggeration is only valid if the advance really scales as λ — a check you must run (the next module shows it).' : 'Without exaggeration, that is a demanding budget for any integrator.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-fallback', difficulty: 2,
      prompt: 'Week 3: the direct method cannot locate the perihelion precisely enough. Which response keeps the project on track?',
      visual: ganttStatic('The plan at week 3, with the minimum result due in week 5.'),
      choices: [
        'Switch to the planned fallback: exaggerate the GR term by λ, verify that the advance scales as λ, and extrapolate',
        'Keep tuning the direct method until it works, however long it takes',
        'Report the number the formula gives, without the simulation',
        'Abandon the project',
      ],
      answer: 0,
      why: { 1: 'Open-ended tuning is how a ten-week project becomes a twenty-week one.', 2: 'That reports the input as the output — no test at all.', 3: 'A known fallback exists; that is why it was planned.' },
      hints: ['What did the scoping plan say to do if the riskiest step failed?'],
      teach: 'A plan names a fallback for its riskiest step, and switches to it at a set review date.',
      explain: 'The exaggerate-and-extrapolate route was the planned fallback. With a linearity check it gives the same physics with a far looser numerical budget, and the minimum result survives.',
    }),
  ],
  sources: [SRC.will, SRC.pulsar, { label: 'NASA Goddard Space Flight Center, Planetary Fact Sheet (orbital elements)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' }],
});
