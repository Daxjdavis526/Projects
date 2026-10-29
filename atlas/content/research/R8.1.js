// Talks and posters. Legibility is geometry: a letter is readable when it
// subtends several times the 1′ detail of normal acuity — a 6/6 (20/20)
// letter subtends 5′ (ISO 8596) — so its height must be h = θd. Converted to
// points (1 pt = 1/72 in; capitals about 0.7 of the font size, a rough
// typographic figure) for posters and projected slides. Structure: one
// message, a result slide whose title is the claim, built backwards from the
// key figure, rehearsed aloud and cut to time; a poster read in seconds from
// metres away; answering questions honestly. Writing the report is R8.2.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { pageBlocks } from './_rs2.js';
import { timeBars } from './_rs.js';

const t = String.raw;
const ARCMIN = Math.PI / (180 * 60);
const ACUITY = 5 * ARCMIN;          // a 6/6 letter's height, radians
const PT = 25.4 / 72;               // mm per point
const CAP = 0.7;                    // capital height ÷ font size (typical sans-serif; varies by typeface)

// sight lines from an eye to a letter; the angle is drawn hugely exaggerated
const sightPic = (d, k, caption) => ({
  type: 'graph',
  params: {
    x: [-0.4, 11], y: [-1.5, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the reader (m)', ylabel: '', yticks: 0, xticks: 6,
    curves: [
      { param: ['t*' + d, `t*${(0.025 * k * d).toFixed(4)}`], t: [0, 1], color: 'ink3', width: 1.4 },
      { param: ['t*' + d, `-t*${(0.025 * k * d).toFixed(4)}`], t: [0, 1], color: 'ink3', width: 1.4 },
      { param: [String(d), `${(0.025 * k * d).toFixed(4)}*(2*t - 1)`], t: [0, 1], color: 'gold', width: 5 },
    ],
    points: [{ x: 0, y: 0, color: 'accent', r: 6, label: 'eye', labelDx: 8, labelDy: 14 }, { x: d, y: +(0.025 * k * d).toFixed(4), r: 0, label: 'letter', color: 'gold', labelDx: 8, labelDy: -6 }],
  },
  caption,
});

// a 4:3 landscape poster
const POSTER = (hl) => [
  { x0: 0, x1: 1.333, y0: 0.84, y1: 1, label: 'title: the result as a sentence', color: 'accent', alpha: hl === 'title' ? 0.6 : 0.3 },
  { x0: 0.02, x1: 0.36, y0: 0.12, y1: 0.82, label: 'question and method', color: 'violet', alpha: 0.22 },
  { x0: 0.38, x1: 0.95, y0: 0.12, y1: 0.82, label: 'the key figure', color: 'gold', alpha: hl === 'fig' ? 0.6 : 0.3 },
  { x0: 0.97, x1: 1.313, y0: 0.12, y1: 0.82, label: 'result vs published', color: 'teal', alpha: hl === 'res' ? 0.6 : 0.22 },
  { x0: 0.02, x1: 1.313, y0: 0.01, y1: 0.1, label: 'references · code link · contact', color: 'ink3', alpha: 0.18 },
];
const posterPic = (hl, caption) => pageBlocks(POSTER(hl), { W: 1.333, H: 1, caption, extra: { aspect: 'wide' } });

// a 12-minute talk plan
const TALK = [
  { y: 4, from: 0, to: 1.5, color: 'violet', label: 'question' },
  { y: 3, from: 1.5, to: 4.5, color: 'accent', label: 'method' },
  { y: 2, from: 4.5, to: 9.5, color: 'gold', label: 'result and comparison' },
  { y: 1, from: 9.5, to: 10.5, color: 'teal', label: 'conclusion' },
  { y: 0, from: 10.5, to: 12, color: 'ink3', label: 'questions' },
];
const talkPic = (caption) => timeBars(TALK, { x: [-0.3, 13], y: [-0.6, 4.6], xlabel: 'minutes', xticks: 6, vlines: [{ x: 12, label: 'slot ends', color: 'bad' }] }, { caption, h: 0.3 });

export default lesson({
  id: 'research.R8.1',
  title: 'Talks and posters',
  minutes: 12, difficulty: 2,
  intro: t`A talk or a poster carries **one result** to people who did not do the work, in minutes or seconds. Build it backwards from that result: the claim, the one figure that shows it, and only what the audience needs to believe that figure. Then make every word and number **legible from where they sit** — which is geometry. A letter is readable when it subtends an angle several times the finest detail the eye resolves; for a letter of height $h$ seen from distance $d$ (small angles),

$$h = \theta\, d$$

A letter that normal (6/6, or “20/20”) vision can *just* read subtends $\theta = 5'$ (five arcminutes); text meant to be read at a glance needs several times that.`,
  symbols: [
    { tex: 'h', text: 'the height of a capital letter, in metres (or millimetres)' },
    { tex: 'd', text: 'the distance from the reader’s eye to the text, in metres' },
    { tex: '\\theta', text: t`the angle the letter subtends at the eye, in radians: $5' = 5/60$ of a degree $= 1.454\times10^{-3}$ rad is the limit of normal acuity` },
  ],
  why: t`PHYS 4900 requires an oral presentation of every project — and a result nobody can read from the third row has not been communicated.`,
  visual: {
    type: 'graph',
    title: 'How big must the letters be?',
    lead: t`The reader’s eye on the left, a letter on the right. The angle it subtends sets whether it can be read. Move the reader back and choose how many times the acuity limit you want; the readouts give the capital-letter height and the font size that makes it.`,
    tasks: ['At 2 m and 1× the limit, letters only 2.9 mm tall are just readable — on an eye chart, not on a poster.', 'Set 3× at 2 m: about 9 mm capitals, a 35-point font. That is a comfortable poster body text.', 'Move to 6 m at 3×: the title must be about three times larger again.'],
    params: {
      x: [-0.4, 11], y: [-1.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the reader (m)', ylabel: '', yticks: 0, xticks: 6,
      sliders: [
        { key: 'd', label: t`distance $d$`, min: 0.5, max: 10, step: 0.5, value: 2, unit: t`\text{m}`, explain: 'How far the reader stands from the text.' },
        { key: 'k', label: 'times the acuity limit', min: 1, max: 5, step: 0.5, value: 1, explain: t`How many times $5'$ the letter subtends: 1 is the bottom line of an eye chart, 3 or more reads at a glance.` },
      ],
      curves: [
        { param: ['t*d', 't*0.03*k*d'], t: [0, 1], color: 'ink3', width: 1.4 },
        { param: ['t*d', '-t*0.03*k*d'], t: [0, 1], color: 'ink3', width: 1.4 },
        { param: ['d', '0.03*k*d*(2*t - 1)'], t: [0, 1], color: 'gold', width: 5 },
      ],
      points: [{ x: 0, y: 0, color: 'accent', r: 6, label: 'eye', labelDx: 8, labelDy: 14 }],
      readouts: [
        { label: 'capital height', expr: `k*d*${(ACUITY * 1000).toFixed(5)}`, unit: '\\text{mm}', digits: 2 },
        { label: 'font size', expr: `k*d*${(ACUITY * 1000 / (CAP * PT)).toFixed(5)}`, unit: '\\text{pt}', digits: 2 },
      ],
    },
    caption: 'The angle is drawn tens of times too wide so that it can be seen. Font size assumes capitals 0.7 of the font size, typical of sans-serif typefaces; 1 pt = 1/72 inch.',
  },
  example: {
    prompt: t`Your poster will be read from about $2\ \text{m}$. How large must the body text be to read at a glance (take $3\times$ the acuity limit), and the title, which should catch people walking past at $6\ \text{m}$?`,
    visual: posterPic('title', 'A poster read in seconds: a title that states the result, one dominant figure, the comparison beside it. Proportions illustrative.'),
    steps: [
      { label: 'Angle', text: t`$\theta = 3 \times 5' = 15' = 15 \times \dfrac{\pi}{180 \times 60} = 4.36\times10^{-3}$ rad.` },
      { label: 'Body text', text: t`$h = \theta d = 4.36\times10^{-3} \times 2\ \text{m} = ${(3 * ACUITY * 2000).toFixed(1)}$ mm for a capital letter.` },
      { label: 'Font size', text: t`Capitals are about $0.7$ of the font size and $1\ \text{pt} = 0.353$ mm, so the font is $${(3 * ACUITY * 2000).toFixed(1)}/(0.7 \times 0.353) \approx ${Math.round(3 * ACUITY * 2000 / (CAP * PT))}$ pt.` },
      { label: 'Title', text: t`At $6$ m everything scales by three: about $${(3 * ACUITY * 6000).toFixed(0)}$ mm capitals, a font near $${Math.round(3 * ACUITY * 6000 / (CAP * PT) / 10) * 10}$ pt.` },
      { label: 'Sense check', text: t`A 12-point paper font held at 40 cm has capitals subtending about $${((12 * CAP * PT) / 400 / ARCMIN).toFixed(0)}'$, five times the limit: comfortable. A poster is a paper read from five times farther away, so it needs letters five times larger.` },
    ],
    answer: t`Body text near ${Math.round(3 * ACUITY * 2000 / (CAP * PT))} pt; title near ${Math.round(3 * ACUITY * 6000 / (CAP * PT) / 10) * 10} pt. A paper figure pasted on unchanged (8-pt labels) is hard to read at a glance beyond about half a metre.`,
  },
  practice: [
    num({
      id: 'acuity-h', difficulty: 1,
      gen(r) {
        const d = r.pick([1.5, 2, 2.5, 3, 4, 5]);
        const ans = ACUITY * d * 1000;
        return {
          prompt: t`What is the height, in millimetres, of a capital letter that subtends exactly the $5'$ acuity limit from ${d} m away?`,
          visual: sightPic(d, 1, 'The sight lines to the top and bottom of the letter; the angle is drawn greatly exaggerated.'),
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: 5 * d * 1000 * Math.PI / 180, feedback: t`$5'$ is five arc*minutes*, $5/60$ of a degree — not five degrees.` }, { value: 5 * d * 1000, feedback: 'Convert the angle to radians before multiplying by the distance.' }],
          hints: [t`$5' = \dfrac{5}{60}$ degree $= \dfrac{5}{60}\cdot\dfrac{\pi}{180}$ rad.`, t`$h = \theta d$, with $d$ in millimetres.`],
          teach: t`Small-angle geometry: height $=$ angle in radians $\times$ distance.`,
          explain: t`$\theta = 1.454\times10^{-3}$ rad, so $h = 1.454\times10^{-3} \times ${d * 1000}\ \text{mm} = ${ans.toFixed(2)}$ mm — the limit, not a comfortable size.`,
        };
      },
    }),
    num({
      id: 'font-pt', difficulty: 2,
      gen(r) {
        const d = r.pick([1.5, 2, 2.5, 3]), k = r.pick([3, 4]);
        const h = k * ACUITY * d * 1000, ans = h / (CAP * PT);
        return {
          prompt: t`Poster text read from ${d} m should subtend ${k} times the $5'$ limit. Its capitals must then be $${h.toFixed(1)}$ mm tall. If capitals are $0.7$ of the font size and $1\ \text{pt} = 0.3528$ mm, what font size is that, in points?`,
          visual: sightPic(d, k, `Reading from ${d} m at ${k}× the acuity limit; the angle is drawn exaggerated.`),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: h / PT, feedback: 'The font size is larger than the capitals: divide by 0.7 as well.' }, { value: h * CAP / PT, feedback: 'Capitals are 0.7 of the font size, so the font size is the capital height ÷ 0.7.' }],
          hints: ['Font size × 0.7 = capital height.', t`Font size in mm $= ${h.toFixed(1)}/0.7$; then divide by 0.3528 mm per point.`],
          teach: 'Typographers measure the font size, not the letters: capitals are only about 70% of it.',
          explain: t`$${h.toFixed(1)}/0.7 = ${(h / CAP).toFixed(1)}$ mm $= ${(h / CAP).toFixed(1)}/0.3528 \approx ${ans.toFixed(0)}$ pt.`,
        };
      },
    }),
    mcq({
      id: 'result-title', difficulty: 2,
      prompt: 'Which is the best title for the result slide of a talk on the GW150914 project?',
      visual: talkPic('A 12-minute slot: the result gets the most time, and the plan leaves room for questions.'),
      choices: [
        'A matched filter finds the synthetic chirp at SNR 12, at the injected chirp mass to within 3%',
        'Results',
        'Matched-filter output for template bank 2, run 4 (see appendix)',
        'Our analysis was very successful',
      ],
      answer: 0,
      why: { 1: 'A topic label wastes the most-read line on the slide; the audience must work out the point themselves.', 2: 'Internal bookkeeping means nothing to the room.', 3: 'An adjective is not a result: say what was found, with numbers.' },
      hints: ['The title is the line everyone reads. What should they leave knowing?'],
      teach: 'Make each slide title the claim the slide supports — a sentence with the number in it.',
      explain: 'A claim as the title lets the figure below be the evidence for it. Anyone who drifted off rejoins at the next title.',
    }),
    order({
      id: 'build-talk', difficulty: 2,
      prompt: 'Put the steps of building a short research talk in order.',
      visual: talkPic('The plan you end up with: time in proportion to what matters.'),
      items: [
        'Write the result as one sentence, with its number and uncertainty',
        'Choose the one figure that shows it, redrawn with large labels',
        'Decide what the audience must know to believe that figure',
        'Draft one slide per idea, titled with its claim',
        'Rehearse aloud with a timer, and cut until it fits with a minute to spare',
      ],
      hints: ['Start from the end: what is the talk for?', 'Rehearsal comes last — and it always runs long.'],
      teach: 'Build a talk backwards from its result, then cut it to time by rehearsing aloud.',
      explain: 'Everything is chosen for the result: the figure shows it, the background makes the figure believable, and rehearsal makes it fit. A talk that runs over loses the questions, which are where you learn the most.',
    }),
    mcq({
      id: 'cut-what', difficulty: 2,
      prompt: 'Your rehearsal of a 10-minute talk takes 13 minutes. What do you cut?',
      visual: talkPic('Every section can shrink — but not equally.'),
      choices: ['Method details the result does not depend on, and any slide not needed to believe the key figure', 'The comparison with the published value', 'The uncertainty on the result', 'Nothing — speak faster'],
      answer: 0,
      why: { 1: 'The comparison is what makes your number mean something to the room.', 2: 'A number without its uncertainty cannot be compared with anything.', 3: 'Speaking 30% faster loses the audience; the content still does not fit.' },
      hints: ['Which parts would a listener miss if they were gone?'],
      teach: 'Cut detail, never the result, its uncertainty or its comparison.',
      explain: 'Detail lives in the report and in answers to questions. The talk keeps the claim, the evidence and the comparison.',
    }),
    mcq({
      id: 'poster-look', difficulty: 2,
      prompt: 'A visitor at a poster session gives each poster about ten seconds before deciding whether to stop. What should those ten seconds deliver?',
      visual: posterPic('fig', 'One dominant figure and a title that states the result. Proportions illustrative.'),
      choices: ['The result: a title stating it, and one large figure showing it', 'The full derivation, so the work looks rigorous', 'A dense abstract in 20-point type at the top left', 'The logos of every institution involved'],
      answer: 0,
      why: { 1: 'Nobody reads a derivation standing up; put it in the report and talk through it if asked.', 2: 'A paragraph is read in a minute, not ten seconds — and 20 pt is small at 2 m.', 3: 'Logos say who, not what.' },
      hints: ['What can be taken in at a glance from two metres?'],
      teach: 'A poster is read at a glance: the title states the result and one figure shows it.',
      explain: 'Title and figure are what a passer-by can take in. The rest of the poster is for those who stop — and for the conversation you have with them.',
    }),
    mcq({
      id: 'question', difficulty: 2,
      prompt: 'After your talk someone asks whether your matched-filter result would survive non-Gaussian noise glitches. You have not tested that. What do you say?',
      visual: talkPic('Questions are part of the slot, and part of the talk.'),
      choices: ['That you have not tested it, how you would (inject glitches into the synthetic noise and redo the search), and what you would expect', 'That glitches are negligible', 'That it is outside the scope, and move on', 'A long answer about something you did test'],
      answer: 0,
      why: { 1: 'A guess stated as fact is the one answer that damages trust — and real LIGO data do contain glitches.', 2: 'Scope is a fair point, but stopping there wastes a good idea for your next step.', 3: 'The audience notices.' },
      hints: ['Honesty, then a plan.'],
      teach: '“I have not tested that — here is how I would” is a strong answer.',
      explain: 'Saying what you did not do, and how you would test it, shows you understand the limits of the result. Questions like this are often the best ideas for the next project.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-screen', difficulty: 3, transfer: true,
      gen(r) {
        const H = r.pick([2, 2.5, 3]), d = r.pick([15, 18, 20, 24]);
        const hcap = 3 * ACUITY * d;             // m, at 3× the limit
        const ans = hcap / (CAP * H) * 540;      // points on a 540-pt-tall slide
        return {
          prompt: t`A launch-readiness review is held in a room whose back row sits $${d}\ \text{m}$ from a screen $${H}\ \text{m}$ tall. Slides are $7.5$ inches $= 540$ pt tall, and the screen shows the whole slide. For a figure label to subtend $3\times$ the $5'$ acuity limit from the back row, what is the smallest font size, in points, on the slide? (Capitals are $0.7$ of the font size.)`,
          visual: sightPic(10, 1.6, 'A projected slide is read from the back of the room: only the angle at the eye matters. Drawn exaggerated.'),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: ans * CAP, feedback: 'Capitals are only 0.7 of the font size, so the font must be larger, not smaller.' }, { value: ans / 3, feedback: 'That is just readable on an eye chart. The question asks for three times the limit.' }],
          hints: [t`Capital height on the screen: $h = 3 \times 1.454\times10^{-3} \times ${d}$ m.`, t`On the slide, a font of $p$ points has capitals $0.7p/540$ of the screen height, so $0.7p/540 \times ${H}\ \text{m} = h$.`],
          teach: 'A projected slide is scaled up, but read from far away: work out the angle at the back row.',
          explain: t`$h = 3 \times 1.454\times10^{-3} \times ${d} = ${(hcap * 1000).toFixed(0)}$ mm on the screen. That is $${(hcap / H).toFixed(4)}$ of its height, so $p = ${(hcap / H).toFixed(4)} \times 540/0.7 \approx ${ans.toFixed(0)}$ pt. A figure pasted from a paper, with 8-pt labels, is unreadable from the back.`,
        };
      },
    }),
    mcq({
      id: 'cp-elevator', difficulty: 2,
      prompt: 'Someone stops at your poster on Kepler-10b and says “Tell me about it.” What is your first sentence?',
      visual: posterPic('title', 'The title already states the result; your first sentence says it aloud.'),
      choices: ['“From the Kepler light curve we measure a transit depth that gives the planet’s radius as about 1.5 Earth radii, matching the published value.”', '“So, I started in September by reading about exoplanets…”', '“It is quite technical — let me start with the background on photometry.”', '“Have you heard of the Kepler mission?”'],
      answer: 0,
      why: { 1: 'A chronology makes the listener wait for the point; many will leave first.', 2: 'Background first buries the result.', 3: 'A question about what they know puts them on the spot and delays the point.' },
      hints: ['What would you want to hear in the first ten seconds?'],
      teach: 'Lead with the result; give the background only if they ask for it.',
      explain: 'Result first, in one sentence with a number. The listener then decides what to ask about — usually the method, which is the conversation you want.',
    }),
  ],
  sources: [
    { label: 'ISO 8596:2017, Ophthalmic optics — Visual acuity testing (the Landolt ring: a 1′ gap in a ring 5′ across at acuity 1.0)', url: 'https://www.iso.org/standard/69042.html' },
    { label: 'M. Alley, The Craft of Scientific Presentations, 2nd ed. (Springer, 2013)', url: 'https://doi.org/10.1007/978-1-4419-8279-7' },
  ],
});
