// The three-pass method (Keshav 2007) applied to physics papers: a 5–10
// minute first pass ending in the "five Cs" and a decision, a second pass of
// about an hour through the figures and the argument, and a third pass that
// re-creates the work. Practised on the GW150914 discovery letter (PRL 116,
// 061102), whose abstract numbers are quoted with their source; the
// consistency checks (mass budget, energy radiated, chirp mass) are computed.
import { lesson, mcq, num, order, match } from '../../src/core/content.js';
import { timeBars, SRC } from './_rs.js';

const t = String.raw;

const C = 299792458, MSUN = 1.98847e30, TSUN = 6.67430e-11 * MSUN / C ** 3;
const ERAD = 3.0 * MSUN * C ** 2;                                     // J
const MC = (36 * 29) ** 0.6 / 65 ** 0.2;                              // source-frame chirp mass, M☉

// reading time per pass: Keshav's guide (first pass 5–10 min, second up to
// about an hour, third about 4–5 h for a beginner)
const passBars = (caption) => timeBars([
  { y: 3, from: 0, to: 10, color: 'accent', label: 'pass 1: 5–10 min' },
  { y: 2, from: 0, to: 60, color: 'gold', label: 'pass 2: about an hour' },
  { y: 1, from: 0, to: 270, color: 'violet', label: 'pass 3: about 4–5 hours (beginner)' },
], { x: [-8, 300], y: [0.3, 3.8], xlabel: 'minutes per paper', xticks: 6 }, { caption });

// GW150914's mass budget as bars (source frame, solar masses)
const massBars = (caption) => timeBars([
  { y: 4, from: 0, to: 36, color: 'accent', label: 'primary 36' },
  { y: 3, from: 0, to: 29, color: 'accent', label: 'secondary 29' },
  { y: 2, from: 0, to: 65, color: 'gold', label: 'sum of the two: 65' },
  { y: 1, from: 0, to: 62, color: 'violet', label: 'final black hole 62' },
], { x: [-2, 72], y: [0.3, 4.8], xlabel: 'mass (solar masses)', xticks: 7 }, { caption });

// the leading-order chirp: f = K τ^(−3/8) with K for a 30 M☉ (detector-frame) chirp mass
const K30 = (1 / Math.PI) * (5 / 256) ** (3 / 8) * (30 * TSUN) ** (-5 / 8);
const chirpPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.2, 0.005], y: [0, 300], aspect: 'wide', axesAt: 'edge', xlabel: 'time before merger (s)', ylabel: 'GW frequency (Hz)', xticks: 5, yticks: 6,
    curves: [{ fn: `${K30.toFixed(3)}*(-x)^(-3/8)`, domain: [-0.2, -0.0009], color: 'accent' }],
    hlines: [{ y: 35, label: '35 Hz', color: 'ink3' }, { y: 250, label: '250 Hz', color: 'ink3' }],
  },
  caption,
});

export default lesson({
  id: 'research.R2.1',
  title: 'The three-pass method',
  minutes: 12, difficulty: 2,
  intro: t`You will meet far more papers than you can read closely. Keshav’s **three-pass method** reads each one only as deeply as it deserves. **Pass 1** (5–10 minutes): title, abstract, introduction, section headings, conclusions, a glance at the references — then answer the *five Cs* (category, context, correctness, contributions, clarity) and decide whether to go on. **Pass 2** (about an hour): the figures, the argument and the evidence, skipping proofs. **Pass 3** (hours): re-create the work yourself and find its hidden assumptions. Most papers stop after pass 1, so the time a literature review costs is

$$T = n_1 t_1 + n_2 t_2 + n_3 t_3$$`,
  symbols: [
    { tex: 'n_1,\\ n_2,\\ n_3', text: 'how many papers get a first, second and third pass ($n_1 \\ge n_2 \\ge n_3$)' },
    { tex: 't_1,\\ t_2,\\ t_3', text: 'the time each pass takes per paper: roughly 10 minutes, an hour, and 4–5 hours for a beginner' },
    { tex: 'T', text: 'the total reading time' },
  ],
  why: t`Reading is the cheapest experiment in research: an hour with the right paper can save a month of rediscovering it.`,
  visual: {
    type: 'graph',
    title: 'Where the reading time goes',
    lead: t`Set how many papers get each pass. The bars are total hours per pass, using 10 minutes, 1 hour and 4.5 hours per paper.`,
    tasks: ['Give 40 papers a first pass, 8 a second, 2 a third: the two third passes cost more than all 40 first passes.', 'Try giving every one of 40 papers a second pass: about a week of full-time reading.', 'Set the third pass to 0: cheap, but you would build on a result you have never checked.'],
    params: {
      x: [-1, 45], y: [0.3, 3.9], aspect: 'wide', axesAt: 'edge', xlabel: 'hours', ylabel: '', yticks: 0, xticks: 9,
      sliders: [
        { key: 'n1', label: t`first passes $n_1$`, min: 0, max: 60, step: 1, value: 40, explain: 'Papers you skim for 10 minutes each.' },
        { key: 'n2', label: t`second passes $n_2$`, min: 0, max: 40, step: 1, value: 8, explain: 'Papers you read properly, about an hour each.' },
        { key: 'n3', label: t`third passes $n_3$`, min: 0, max: 6, step: 1, value: 2, explain: 'Papers you re-create, about 4.5 hours each.' },
      ],
      shade: [
        { fn: '3.3', lower: '2.7', from: 0, to: 'n1/6', color: 'accent', alpha: 0.6 },
        { fn: '2.3', lower: '1.7', from: 0, to: 'n2', color: 'gold', alpha: 0.6 },
        { fn: '1.3', lower: '0.7', from: 0, to: '4.5*n3', color: 'violet', alpha: 0.6 },
      ],
      points: [{ x: 0, y: 3.3, r: 0, label: 'pass 1', color: 'ink', labelDy: -9 }, { x: 0, y: 2.3, r: 0, label: 'pass 2', color: 'ink', labelDy: -9 }, { x: 0, y: 1.3, r: 0, label: 'pass 3', color: 'ink', labelDy: -9 }],
      readouts: [{ label: t`total $T$`, expr: 'n1/6 + n2 + 4.5*n3', unit: t`\text{h}`, digits: 3 }],
    },
    caption: 'Times per pass are Keshav’s rough guide; a dense theory paper can take far longer, a short letter less.',
  },
  example: {
    prompt: t`Give the GW150914 discovery letter (Abbott et al. 2016, *Phys. Rev. Lett.* 116, 061102) a first pass and the start of a second. Its abstract says, in part: the signal "sweeps upwards in frequency from 35 to 250 Hz with a peak gravitational-wave strain of $1.0\times10^{-21}$", was observed "with a matched-filter signal-to-noise ratio of 24 and a false alarm rate estimated to be less than 1 event per 203 000 years, equivalent to a significance greater than $5.1\sigma$", and that "the initial black hole masses are $36^{+5}_{-4}\,M_\odot$ and $29^{+4}_{-4}\,M_\odot$, and the final black hole mass is $62^{+4}_{-4}\,M_\odot$, with $3.0^{+0.5}_{-0.5}\,M_\odot c^2$ radiated in gravitational waves."`,
    visual: massBars('The masses quoted in the abstract (source frame, central values). The final black hole is lighter than the two that merged.'),
    steps: [
      { label: 'Category', text: t`A short observational letter: a detection, with parameters estimated by fitting general-relativistic waveforms.` },
      { label: 'Context', text: t`It tests a 1916 prediction of general relativity, with detectors built over decades; the references point to the instrument, search and parameter-estimation companion papers.` },
      { label: 'Correctness', text: t`The headline rests on two assumptions to check later: that the background (how often noise mimics a signal) is estimated correctly, and that the waveform models are accurate.` },
      { label: 'Contributions', text: t`The first direct detection of gravitational waves and the first observed merger of two black holes.` },
      { label: 'Clarity', text: t`Figure-led and clearly structured — and the decision is easy: this one gets a second pass.` },
      { label: 'Pass 2: a consistency check', text: t`The masses do not add up — on purpose. $36 + 29 = 65\,M_\odot$, but the remnant is $62\,M_\odot$. The missing $3\,M_\odot$ is the $3.0\,M_\odot c^2$ radiated. The abstract is internally consistent, and you have learned what the uncertainties are (about 10–15%).` },
    ],
    answer: t`Five Cs: an observational letter; a test of GR built on decades of detectors; correctness hinges on the background estimate and the waveforms; contribution: the first GW detection and the first binary black hole; clear. Pass 2 confirms the mass budget: $65 - 62 \approx 3\,M_\odot$ radiated.`,
  },
  practice: [
    order({
      id: 'pass-steps', difficulty: 1,
      prompt: 'Put these reading activities in the order the three-pass method does them.',
      visual: passBars('The time each pass takes per paper (Keshav’s rough guide).'),
      items: [
        'Read the title, abstract and introduction',
        'Skim the section headings and read the conclusions',
        'Answer the five Cs and decide whether to go on',
        'Study every figure: axes, units, error bars',
        'Mark the references you have not read',
        'Re-derive the key result yourself, under the paper’s assumptions',
      ],
      hints: ['The decision to continue ends the first pass.', 'Re-creating the work is the deepest step, so it comes last.'],
      teach: 'Pass 1 is a skim ending in a decision, pass 2 a careful read of figures and argument, pass 3 a re-creation.',
      explain: 'Pass 1: title, abstract, introduction, headings, conclusions, then the five Cs. Pass 2: figures and the evidence, noting unread references. Pass 3: rebuild the result and hunt for hidden assumptions.',
    }),
    mcq({
      id: 'which-pass', difficulty: 2,
      prompt: t`Your project will use a paper’s published chirp mass as the starting point for a matched-filter search. How deeply should you read it?`,
      visual: passBars('Deeper passes cost much more time per paper.'),
      choices: ['A third pass: re-create how the number was obtained and under which assumptions', 'A first pass is enough: the number is in the abstract', 'A second pass, skipping the figures', 'None: published numbers are peer reviewed'],
      answer: 0,
      why: { 1: 'The abstract gives the number, not its frame (source or detector), its definition or its uncertainty.', 2: 'The figures are the heart of a second pass; skipping them skips the evidence.', 3: 'Peer review lowers the error rate; it does not tell you how a number was defined.' },
      hints: ['How much does your project depend on this one number?', 'You build on it, so you must know exactly what it means.'],
      teach: 'Read a paper as deeply as your work depends on it: a paper you build on deserves a third pass.',
      explain: 'A paper you build on gets the third pass: you need the number’s definition, frame, uncertainty and the assumptions behind it — the things an abstract leaves out.',
    }),
    match({
      id: 'five-cs', difficulty: 2,
      prompt: 'Match each first-pass note on the GW150914 letter to the "C" it answers.',
      visual: massBars('The masses from the abstract (source frame).'),
      left: [
        'A short observational letter with parameter estimation',
        'It tests a prediction of general relativity and builds on decades of detector development',
        'Its significance depends on the noise background being estimated correctly',
        'The first direct detection of gravitational waves, and of a black-hole merger',
        'Short, figure-led and easy to follow',
      ],
      right: ['Category', 'Context', 'Correctness', 'Contributions', 'Clarity', 'Citation count'],
      answer: [0, 1, 2, 3, 4],
      hints: ['Category is what kind of paper; context is what it builds on.', 'Correctness is about assumptions that might fail.'],
      teach: 'The five Cs — category, context, correctness, contributions, clarity — are the output of a first pass.',
      explain: 'Category (kind of paper), context (what it relates to), correctness (assumptions that could fail), contributions (what is new), clarity (how well it is written). Citation count is not one of them: it measures attention, not content.',
    }),
    num({
      id: 'energy', difficulty: 2,
      prompt: t`Pass-2 check: the abstract says $3.0\,M_\odot c^2$ was radiated. With $M_\odot = 1.988\,47\times10^{30}$ kg and $c = 2.997\,924\,58\times10^{8}$ m/s, how much energy is that, in joules?`,
      visual: massBars('Before and after: the gap between the summed masses and the remnant is what went into gravitational waves.'),
      answer: ERAD, units: 'J', tol: { rel: 0.01 },
      errors: [{ value: 3.0 * MSUN * C, feedback: t`Square the speed of light: $E = mc^2$.` }, { value: MSUN * C ** 2, feedback: 'That is one solar mass; the abstract says three.' }],
      hints: [t`$E = mc^2$ with $m = 3.0\,M_\odot$.`, t`$3.0 \times 1.988\times10^{30} \times (2.998\times10^{8})^2$.`],
      teach: t`A mass written as $M_\odot c^2$ is an energy: multiply by $c^2$.`,
      explain: t`$E = 3.0 \times ${(MSUN / 1e30).toFixed(3)}\times10^{30} \times (${(C / 1e8).toFixed(3)}\times10^{8})^2 = ${(ERAD / 1e47).toFixed(2)}\times10^{47}$ J — radiated in about a tenth of a second.`,
    }),
    num({
      id: 'chirp-mass', difficulty: 3,
      prompt: t`Pass-3 check. The chirp mass, which sets how fast the frequency sweeps, is $\mathcal M = \dfrac{(m_1 m_2)^{3/5}}{(m_1 + m_2)^{1/5}}$. Compute it from the abstract’s source-frame masses, $m_1 = 36\,M_\odot$ and $m_2 = 29\,M_\odot$. (The letter’s own Newtonian estimate from the frequency sweep is about $30\,M_\odot$, a detector-frame value larger by a factor $1 + z$.)`,
      visual: chirpPic(t`The leading-order chirp for a detector-frame chirp mass of $30\,M_\odot$: $f \propto \tau^{-3/8}$, where $\tau$ is the time left before merger. It sweeps from 35 to 250 Hz in under 0.2 s. Real waveforms add higher-order and merger physics.`),
      answer: MC, units: 'Msun', tol: { rel: 0.01 },
      errors: [{ value: (36 * 29) ** 0.5, feedback: 'That is the geometric mean, not the chirp mass: use powers 3/5 and 1/5.' }, { value: (36 * 29) ** 0.6, feedback: t`You forgot to divide by $(m_1 + m_2)^{1/5}$.` }],
      hints: [t`$m_1 m_2 = 1044$ and $m_1 + m_2 = 65$.`, t`$1044^{0.6} \approx 64.8$ and $65^{0.2} \approx 2.30$.`],
      teach: 'Re-deriving one number from the paper’s own inputs is the cheapest form of a third pass.',
      explain: t`$\mathcal M = 1044^{3/5}/65^{1/5} = ${MC.toFixed(1)}\,M_\odot$. Times $1 + z \approx 1.09$ that is $${(MC * 1.09).toFixed(1)}\,M_\odot$ in the detector frame, consistent with the letter’s "about 30". The numbers hang together.`,
    }),
    mcq({
      id: 'evidence', difficulty: 2,
      prompt: t`Which number in the GW150914 abstract states directly how unlikely it is that noise alone produced the signal?`,
      visual: { type: 'sg2-matched', params: { Mc: 30, tpl: 30, amp: 1.2, seed: 3, panels: ['data', 'snr'], controls: false, readout: false }, caption: 'A matched filter on simulated white noise with a chirp hidden in it: a loud peak in ρ(t). How often noise alone makes such a peak is a separate question, answered by measuring the background.' },
      choices: ['A false alarm rate below 1 per 203 000 years (significance above 5.1σ)', 'A matched-filter signal-to-noise ratio of 24', 'A peak strain of 1.0 × 10⁻²¹', 'A final mass of 62 solar masses'],
      answer: 0,
      why: { 1: 'An SNR says how loud the signal is relative to the noise level; how often noise reaches that loudness depends on non-Gaussian glitches and must be measured.', 2: 'The strain is the size of the signal, not its significance.', 3: 'Masses describe the source once you accept it is real.' },
      hints: ['Significance is about how often noise mimics a signal this loud.', 'Look for a rate or a σ.'],
      teach: 'Separate a paper’s claim, its evidence and the strength of the evidence: here the strength is the false alarm rate.',
      explain: 'The false alarm rate is measured from the detectors’ own noise (by time-shifting one detector’s data against the other). It, not the SNR alone, is what turns "a loud peak" into "a detection".',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-budget', difficulty: 2, transfer: true,
      gen(r) {
        const n1 = r.int(12, 30), n2 = r.int(3, 8), n3 = r.int(1, 2);
        const ans = (n1 * 10 + n2 * 60 + n3 * 270) / 60;
        return {
          prompt: t`For a project on a cold-gas thruster’s nozzle, you plan first passes on ${n1} papers (10 min each), second passes on ${n2} (60 min each) and third passes on ${n3} (4.5 h each). How many hours of reading is that?`,
          visual: passBars('Time per paper for each pass.'),
          answer: ans, units: 'h', tol: { rel: 0.01 },
          errors: [{ value: (n1 + n2 + n3) * 10 / 60, feedback: 'Each deeper pass takes longer: use 10 min, 60 min and 4.5 h.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$T = n_1 t_1 + n_2 t_2 + n_3 t_3$, all in the same unit.`, t`In minutes: $${n1}\times10 + ${n2}\times60 + ${n3}\times270$.`],
          teach: 'Budget reading time pass by pass: the few deep reads dominate.',
          explain: t`$${n1 * 10} + ${n2 * 60} + ${n3 * 270} = ${n1 * 10 + n2 * 60 + n3 * 270}$ min $= ${ans.toFixed(1)}$ h. The ${n3} third pass${n3 > 1 ? 'es' : ''} alone take ${(n3 * 4.5).toFixed(1)} h.`,
        };
      },
    }),
    mcq({
      id: 'cp-lost', difficulty: 2,
      prompt: 'After a first pass on a theory paper you cannot follow the argument at all. What does the three-pass method suggest?',
      visual: passBars('Passes get longer; going deeper into a paper you cannot follow wastes the most expensive time.'),
      choices: [
        'Set it aside, read background material on the unfamiliar ideas first, then return',
        'Go straight to a third pass so you understand every line',
        'Conclude the paper is wrong',
        'Cite it anyway without reading further',
      ],
      answer: 0,
      why: { 1: 'A third pass without the background is the slowest way to learn the background.', 2: 'Not following a paper is evidence about your background, not about the paper.', 3: 'Citing a paper you have not understood is how errors spread.' },
      hints: ['Ask why the first pass failed.', 'Maybe the paper assumes something you have not learned yet.'],
      teach: 'A failed first pass is information: either the paper is out of scope or you need background first.',
      explain: 'Keshav suggests that if a paper is hard to follow, the cause may be unfamiliar material: read the background (often a review or textbook) and come back. Many papers rightly stop at pass 1.',
    }),
    mcq({
      id: 'cp-third', difficulty: 3,
      prompt: t`What is the **aim** of a third pass?`,
      visual: chirpPic(t`The leading-order chirp you might re-create from the GW150914 letter: frequency against time before merger, for a $30\,M_\odot$ detector-frame chirp mass.`),
      choices: [
        'To re-create the work under the paper’s own assumptions, so you can see its hidden assumptions and judge its claims',
        'To memorize every equation in order',
        'To check the grammar and the reference formatting',
        'To count how many times each reference is cited',
      ],
      answer: 0,
      why: { 1: 'Memorizing is not understanding; re-creating is.', 2: 'That is copy-editing, not reading for content.', 3: 'Citation counts say nothing about a paper’s content.' },
      hints: ['Keshav describes it as virtually re-implementing the paper.', 'Re-implementing means making the same assumptions and checking you reach the same result.'],
      teach: 'The third pass rebuilds the paper; what you cannot rebuild, you do not yet understand.',
      explain: 'By rebuilding the result — the chirp, the mass budget, the key fit — you find where the authors made choices, which assumptions carry the weight, and what you could do differently.',
    }),
  ],
  sources: [SRC.keshav, SRC.gw150914],
});
