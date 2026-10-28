// Covectors as stacks of level lines: a linear machine that eats a vector and
// returns a number — the count of lines the vector crosses. No metric needed.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { still, stackCurves, r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;
const SKEW = [[1, 0], [0.5, 0.9]];
const SQ = [[1, 0], [0, 1]];
const comb = (B, c) => [c[0] * B[0][0] + c[1] * B[1][0], c[0] * B[0][1] + c[1] * B[1][1]];
// a still stack picture: covector by its components in the basis, vector by its components
const stackPic = (B, w, Vc, caption, o = {}) => still({ mode: 'covector', basis: B, covector: w, vector: comb(B, Vc).map(r6), crossings: false, construction: false, grid: 'none', ...o }, caption);

export default lesson({
  id: 'st-a.A3.1',
  title: 'Covectors as stacks of level lines',
  minutes: 10, difficulty: 2,
  intro: t`Vectors are not the only objects at a point. A **covector** — also called a dual vector or a one-form — is a **linear machine that eats a vector and returns a number**: $\omega(a\mathbf V + b\mathbf W) = a\,\omega(\mathbf V) + b\,\omega(\mathbf W)$. On a plane it has a picture: a stack of evenly spaced parallel lines labelled $\dots, -1, 0, 1, 2, \dots$, and $\omega(\mathbf V)$ is **the number of lines the arrow crosses**, counted with a sign (positive going up the labels) and with fractions for a gap crossed part-way. A denser stack is a bigger covector. Nothing in this needs a ruler or a protractor.

In a basis, the covector’s components are what it does to the basis arrows, $\omega_i = \omega(\mathbf e_i)$ — count the lines each one crosses — and linearity does the rest:

$$\omega(\mathbf V) = \omega(V^i\mathbf e_i) = V^i\,\omega(\mathbf e_i) = \omega_i\,V^i$$`,
  symbols: [
    { tex: t`\omega`, text: 'a covector: a linear rule turning vectors into numbers. Picture it as a stack of parallel lines (planes, in space)' },
    { tex: t`\omega(\mathbf V)`, text: 'the number it gives: the signed count of lines the arrow crosses' },
    { tex: t`\omega_i = \omega(\mathbf e_i)`, text: t`its components: how many lines each basis arrow crosses. A **lower** index, like the basis arrows themselves (lesson A3.5 says why)` },
    { tex: t`V^i`, text: 'the components of the vector, upper index as before' },
    { tex: t`\omega_iV^i`, text: 'summed over i: one up, one down — the pairing of a covector with a vector' },
  ],
  why: t`Gradients, wavefronts and momenta are covectors in relativity, and an observer’s measured energy is a covector paired with a four-velocity: keeping covectors separate from vectors is what makes such numbers come out right in any coordinates.`,
  visual: {
    type: 'ten-basis',
    title: 'Count the lines',
    lead: t`The teal stack is a covector $\omega$; its lines are labelled with the value $\omega$ takes there. The gold arrow starts on the line 0, and the lines it crosses are drawn bold: $\omega(\mathbf V)$ is their signed count. Set the covector with its components $\omega_1 = \omega(\mathbf e_1)$ and $\omega_2 = \omega(\mathbf e_2)$; drag the arrow’s tip.`,
    tasks: [
      t`Drag the arrow along the lines: it crosses none, so $\omega(\mathbf V) = 0$, however long it is.`,
      t`Double the arrow: the count doubles. Linearity is just counting.`,
      t`Set $\omega_2 = 0$: the lines turn parallel to $\mathbf e_2$, which now crosses none. Then raise $\omega_1$ from 1 to 2: the stack packs twice as tight.`,
    ],
    params: { mode: 'covector', basis: SKEW, covector: [1, 0.5], vector: [2.1, 1.3], readout: ['w', 'V', 'pair'], view: 2.4 },
    caption: t`The stack’s lines are where $\omega$ takes whole-number values; between them it changes evenly. Bold lines are the ones the arrow crosses. Nothing here is measured with a ruler: the count is the same however the picture is stretched or sheared.`,
  },
  example: {
    prompt: t`In the basis shown, a covector’s stack has $\omega(\mathbf e_1) = 1$ and $\omega(\mathbf e_2) = 1$. The arrow is $\mathbf V = 1.5\,\mathbf e_1 + \mathbf e_2$. Find $\omega(\mathbf V)$ by counting and by components.`,
    visual: still({ mode: 'covector', basis: SKEW, covector: [1, 1], vector: comb(SKEW, [1.5, 1]).map(r6), crossings: true, construction: true, grid: 'none' }, t`The stack $\omega$ (teal), the basis and the arrow $1.5\,\mathbf e_1 + \mathbf e_2$. Bold: the lines it crosses.`),
    steps: [
      { label: 'Count', text: t`The arrow starts on line 0, crosses lines 1 and 2, and stops halfway to line 3: $\omega(\mathbf V) = 2.5$.` },
      { label: 'Components of the covector', text: t`$\mathbf e_1$ crosses one line and $\mathbf e_2$ one line, so $\omega_1 = 1$ and $\omega_2 = 1$.` },
      { label: 'Pair them', text: t`$\omega_iV^i = \omega_1V^1 + \omega_2V^2 = 1(1.5) + 1(1) = 2.5$. ✓ The parallelogram shows why: the piece $1.5\,\mathbf e_1$ crosses 1.5 lines and the piece $\mathbf e_2$ crosses one more.` },
      { label: 'What was not used', text: t`No length, no angle: the basis arrows are not perpendicular, nor equally long, and it did not matter.` },
    ],
    answer: t`$\omega(\mathbf V) = \omega_iV^i = 2.5$ — two and a half lines crossed.`,
  },
  practice: [
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const B = r.pick([SQ, SKEW]);
        let w, Vc, val;
        for (let k = 0; k < 40; k++) { w = [r.pick([0.5, 1, 1.5, -1]), r.pick([0.5, 1, -0.5, 1.5])]; Vc = [r.pick([1, 2, -1, 1.5]), r.pick([1, 2, -1])]; val = w[0] * Vc[0] + w[1] * Vc[1]; if (val !== 0 && Math.abs(val) <= 4.5) break; }
        return {
          prompt: t`How many lines of the stack $\omega$ does the arrow cross? Give $\omega(\mathbf V)$, with its sign.`,
          visual: stackPic(B, w, Vc, 'The stack (teal), labelled with the value of ω on each line, and the arrow from the origin, which lies on line 0.'),
          answer: val, tol: { rel: 0, abs: 0.1 },
          hints: ['The arrow’s tail is on the line labelled 0. Which line does its tip land on (or between)?', 'ω(V) is the label at the tip minus the label at the tail.'],
          teach: 'ω(V) is the signed number of lines crossed: the label at the tip minus the label at the tail.',
          explain: t`The tip sits at the level $${nice(val)}$, the tail at 0, so $\omega(\mathbf V) = ${nice(val)}$. In components: $\omega_iV^i = (${w[0]})(${Vc[0]}) + (${w[1]})(${Vc[1]}) = ${nice(val)}$.`,
        };
      },
    }),
    num({
      id: 'pair', difficulty: 1,
      gen(r) {
        const w = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])], V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        if (w[0] * V[0] + w[1] * V[1] === 0) V[1] += V[1] === -1 ? 2 : 1;
        const val = w[0] * V[0] + w[1] * V[1];
        return {
          prompt: t`A covector has components $\omega_i = (${w.join(',\\ ')})$ and a vector has $V^i = (${V.join(',\\ ')})$ in the same basis. What is $\omega(\mathbf V)$?`,
          visual: stackPic(SKEW, w.map((x) => x / 2), V.map((x) => x / 2), t`Half-scale picture: the stack of $\tfrac12\omega$ and the arrow $\tfrac12\mathbf V$ — each halving divides the count by 2, so the drawing shows a quarter of $\omega(\mathbf V)$.`),
          answer: val, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: w[0] * V[1] + w[1] * V[0], feedback: t`Pair matching indices: $\omega_1$ with $V^1$, and $\omega_2$ with $V^2$.` }].filter((e) => e.value !== val),
          hints: [t`$\omega(\mathbf V) = \omega_1V^1 + \omega_2V^2$.`],
          teach: 'The pairing is a sum of products of matching components, one index up and one down.',
          explain: t`$\omega_iV^i = (${w[0]})(${V[0]}) + (${w[1]})(${V[1]}) = ${val}$.`,
        };
      },
    }),
    num({
      id: 'linear', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-3, 3, [0, a]), wV = r.intExcept(-4, 5, [0]), wW = r.intExcept(-4, 5, [0]);
        let val = a * wV + b * wW;
        const B2 = val === 0 ? b + (b === -1 ? 2 : 1) : b;
        val = a * wV + B2 * wW;
        return {
          prompt: t`A covector gives $\omega(\mathbf V) = ${wV}$ and $\omega(\mathbf W) = ${wW}$. What is $\omega(${a === 1 ? '' : a === -1 ? '-' : a}\mathbf V ${B2 < 0 ? '-' : '+'} ${Math.abs(B2) === 1 ? '' : Math.abs(B2)}\mathbf W)$?`,
          visual: still({ mode: 'covector', basis: SQ, covector: [1, 0.6], vector: [1.6, 1.1], arrows: [{ from: [0, 0], to: [-0.6, 1.4], color: 'violet', label: 'W' }], crossings: false, construction: false, grid: 'none' }, 'A covector’s stack with two arrows, V (gold) and W (violet). Counting lines is additive: the crossings of a sum are the sum of the crossings.'),
          answer: val, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: wV + wW, feedback: 'Scale each count by its coefficient before adding.' }].filter((e) => e.value !== val),
          hints: [t`Linearity: $\omega(a\mathbf V + b\mathbf W) = a\,\omega(\mathbf V) + b\,\omega(\mathbf W)$.`],
          teach: 'A covector is linear: it respects sums and multiples of vectors.',
          explain: t`$\omega(${a}\mathbf V + ${B2}\mathbf W) = ${a}(${wV}) + ${B2 < 0 ? `(${B2})` : B2}(${wW}) = ${val}$.`,
        };
      },
    }),
    mcq({
      id: 'denser', difficulty: 2,
      prompt: t`Two covectors have parallel stacks: $\alpha$’s lines are 2 cm apart, $\beta$’s are 0.5 cm apart. For one arrow, $\alpha(\mathbf V) = 3$. What is $\beta(\mathbf V)$?`,
      visual: (() => {
        const c = Math.cos(20 * DEG), s = Math.sin(20 * DEG);
        const A = stackCurves([0.5 * c, 0.5 * s], { x: [-0.5, 7], y: [-0.4, 3], color: 'accent' });
        const Bc = stackCurves([2 * c, 2 * s], { x: [-0.5, 7], y: [-0.4, 3], color: 'teal', width: 1 });
        return { type: 'graph', params: { x: [-0.5, 7], y: [-0.4, 3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [...Bc.curves, ...A.curves.map((q) => ({ ...q, width: 3 }))], arrows: [{ from: [0, 0], to: [r6(6 * c), r6(6 * s)], color: 'gold', label: 'V' }], legend: [{ label: 'α (lines 2 cm apart)', color: 'accent' }, { label: 'β (lines 0.5 cm apart)', color: 'teal' }], legendAt: 'tl' }, caption: 'The two stacks drawn to scale (1 unit = 1 cm) and an arrow crossing them. Count the crossings of each.' };
      })(),
      choices: ['12', '0.75', '3', '6'],
      answer: 0,
      why: {
        1: 'Wider spacing means fewer crossings, not more: a dense stack is the bigger covector.',
        2: 'The same arrow crosses four times as many of β’s more tightly packed lines.',
        3: 'The spacing ratio is 4, not 2.',
      },
      hints: ['Over the same arrow, how many 0.5 cm gaps fit for every 2 cm gap?'],
      teach: 'The closer a covector’s lines, the bigger the covector: it gives larger numbers.',
      explain: 'β’s lines are 4 times denser, so any arrow crosses 4 times as many: β = 4α and β(V) = 12. (Measuring the spacing in cm needed a ruler; the counting itself did not.)',
    }),
    mcq({
      id: 'not-an-arrow', difficulty: 2,
      prompt: 'A student wants to draw a covector as an arrow instead: perpendicular to the stack’s lines, with length 1/(spacing). What does that construction need that the stack itself does not?',
      visual: stackPic(SKEW, [1, 0.5], [1.4, 0.8], 'The stack alone: lines and their labels. Counting crossings uses nothing else.'),
      choices: [
        'A rule for lengths and angles (a metric), to say what “perpendicular” and “spacing” mean',
        'Nothing — the arrow and the stack carry exactly the same information without extra structure',
        'A second covector to define the direction',
        'Three dimensions instead of two',
      ],
      answer: 0,
      why: {
        1: 'Without a metric there is no “perpendicular”: the stack alone does not single out any direction.',
        2: 'One stack is enough; what is missing is a way to measure angles and lengths.',
        3: 'The problem is the same in any dimension.',
      },
      hints: ['Which words in the student’s recipe involve measuring?'],
      teach: 'Turning a covector into an arrow needs a metric; the stack picture does not.',
      explain: 'Perpendicular and spacing are measurements. With a metric you can trade a covector for an arrow (lesson A7, “raising the index”); without one, the stack is the honest picture — and the pairing, counting crossings, never needs it.',
    }),
    num({
      id: 'along-lines', difficulty: 2,
      gen(r) {
        const w = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])], V1 = r.intExcept(-3, 3, [0]);
        const V2 = (-w[0] * V1) / w[1];
        return {
          prompt: t`A covector has components $\omega_i = (${w.join(',\\ ')})$. A vector has $V^1 = ${V1}$. What must $V^2$ be for the vector to run along the stack’s lines, $\omega(\mathbf V) = 0$?`,
          visual: stackPic(SKEW, w.map((x) => x / 2), [0.01, 0.01], t`The stack of $\tfrac12\omega$ in the basis drawn; a vector with $\omega(\mathbf V) = 0$ lies along its lines.`),
          answer: V2, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: (w[0] * V1) / w[1], feedback: 'Sign: you need ω₁V¹ + ω₂V² = 0, so V² = −ω₁V¹/ω₂.' }].filter((e) => Math.abs(e.value - V2) > 1e-9),
          hints: [t`Solve $\omega_1V^1 + \omega_2V^2 = 0$ for $V^2$.`],
          teach: 'Vectors with ω(V) = 0 run along the covector’s lines: they cross none.',
          explain: t`$${w[0]}(${V1}) + ${w[1]}V^2 = 0$ gives $V^2 = ${nice(V2)}$.`,
        };
      },
    }),
    multi({
      id: 'which-are-covectors', difficulty: 2,
      prompt: 'Which of these are naturally covectors — machines that turn a displacement or velocity into a number? Select every one.',
      visual: (() => {
        const S = stackCurves([1.2, 0.4], { x: [-3, 3], y: [-1.6, 1.6], color: 'accent2', labels: false });
        return { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: S.curves, arrows: [{ from: [-1.5, -0.6], to: [0.9, 0.3], color: 'gold', label: 'baseline' }] }, caption: 'Wavefronts of a plane wave (lines of equal phase, one per cycle) and a displacement: the phase difference along it is the number of wavefronts crossed.' };
      })(),
      choices: [
        'The rate of change of temperature with position: it turns a displacement into a temperature change',
        'The wavefronts of a plane wave: they turn a displacement into a number of cycles of phase',
        'The velocity of a satellite',
        'A displacement between two antennas',
        'The rate of change of electric potential with position: it turns a displacement into a voltage',
      ],
      answer: [0, 1, 4],
      why: {
        2: 'A velocity is an arrow — a vector. A covector is what eats it.',
        3: 'A displacement is the archetypal vector.',
      },
      hints: ['Ask of each: is it an arrow, or a rule that turns an arrow into a number?'],
      teach: 'Rates of change of a quantity per unit displacement — gradients, phase per metre — are covectors.',
      explain: 'Temperature, phase and potential all vary over space; their rates of change are stacks of level lines, and a displacement crossing them gives a number (kelvin, cycles, volts). Velocities and displacements are the arrows they act on.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        let w, Vc, val;
        for (let k = 0; k < 40; k++) { w = [r.pick([1, 1.5, 2, -1]), r.pick([0.5, -1, 1])]; Vc = [r.pick([1, 1.5, -1]), r.pick([1, 2, -1.5])]; val = w[0] * Vc[0] + w[1] * Vc[1]; if (val !== 0 && Math.abs(val) <= 4.5 && Math.abs(val * 2 - Math.round(val * 2)) < 1e-9) break; }
        return {
          prompt: t`Count: what is $\omega(\mathbf V)$ for the stack and arrow shown?`,
          visual: stackPic(SKEW, w, Vc, 'The stack ω with its level labels, and an arrow from the origin.'),
          answer: val, tol: { rel: 0, abs: 0.1 },
          hints: ['Read the label at the tip.'],
          teach: 'ω(V) is the label at the arrow’s tip minus the label at its tail.',
          explain: t`The tip lies at level $${nice(val)}$: $\omega(\mathbf V) = ${nice(val)}$ $(= ${w[0]}\cdot${Vc[0]} + ${w[1]}\cdot${Vc[1]})$.`,
        };
      },
    }),
    num({
      id: 'cp-interferometer', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([20, 30, 45]), bE = r.pick([25, 40, 60]), bU = r.pick([0, 1.5, 3]);
        const lam = 0.2110;                                   // the 21 cm hydrogen line: c / 1420.405751 MHz
        const kE = Math.sin(th * DEG) / lam, kU = Math.cos(th * DEG) / lam;   // cycles per metre
        const val = kE * bE + kU * bU;
        return {
          prompt: t`Two radio antennas observe the 21 cm hydrogen line ($\lambda = 0.2110$ m) from a source $${th}^\circ$ from the zenith, toward the east. The incoming wave’s crests form a stack — a covector $k$ with components $(k_E, k_U) = (\sin${th}^\circ, \cos${th}^\circ)/\lambda$ cycles per metre along east and up. The baseline from one antenna to the other is $b^i = (${bE},\ ${bU})$ m (east, up). How many cycles of phase separate the antennas, $k_ib^i$?`,
          visual: (() => {
            const S = stackCurves([Math.sin(th * DEG) * 4, Math.cos(th * DEG) * 4], { x: [-0.5, 6.5], y: [-0.7, 2.6], color: 'accent2' });
            return { type: 'graph', params: { x: [-0.5, 6.5], y: [-0.7, 2.6], equal: true, aspect: 'wide', xlabel: 'east', ylabel: 'up', xticks: 0, yticks: 0, curves: S.curves, arrows: [{ from: [0, 0], to: [5, r6((5 * bU) / bE)], color: 'gold', label: 'baseline b' }], points: [{ x: 0, y: 0, color: 'ink', label: 'A1', labelDx: -6, labelDy: 14 }, { x: 5, y: r6((5 * bU) / bE), color: 'ink', label: 'A2', labelDx: 6, labelDy: 14 }] }, caption: 'Schematic, not to scale: wave crests (blue) far more widely spaced than the real 21 cm, so that a few can be drawn. Each crest crossed by the baseline is one cycle of phase difference.' };
          })(),
          answer: val, tol: { rel: 0.002 },
          errors: [{ value: kE * bE, feedback: t`You left out the height difference: $k_Ub^U$ adds ${nice(kU * bU, 3)} cycles.` }].filter((e) => Math.abs(e.value - val) > 0.003 * val),
          hints: [t`$k_ib^i = k_Eb^E + k_Ub^U$.`, t`$k_E = \sin${th}^\circ/0.2110 = ${nice(kE, 4)}$ and $k_U = \cos${th}^\circ/0.2110 = ${nice(kU, 4)}$ cycles per metre.`],
          teach: 'Phase across a baseline is a covector (the wave’s crests) paired with a vector (the baseline): count the crests crossed.',
          explain: t`$k_ib^i = ${nice(kE, 4)}\times${bE} + ${nice(kU, 4)}\times${bU} = ${nice(val, 5)}$ cycles. A correlator measures only the fractional part, $${nice(val - Math.floor(val), 3)}$ of a cycle, which is why interferometers need many baselines. (Writing the crests’ components as $\sin\theta/\lambda$ and $\cos\theta/\lambda$ used the geometry of the sky; the pairing itself used none.)`,
        };
      },
    }),
    mcq({
      id: 'cp-zero', difficulty: 2,
      prompt: t`For a covector $\omega$ (not zero) and a vector $\mathbf V$ (not zero), $\omega(\mathbf V) = 0$. What does that mean in the stack picture?`,
      visual: stackPic(SQ, [0.8, 0.6], [0.6, -0.8], t`A stack and an arrow with $\omega(\mathbf V) = 0$.`),
      choices: [t`$\mathbf V$ runs along the lines, crossing none`, t`$\mathbf V$ is perpendicular to the lines`, 'The stack has no lines', t`$\mathbf V$ is too short to reach the next line`],
      answer: 0,
      why: {
        1: 'Perpendicular needs a metric, which the stack picture does not have — and look: the arrow lies along a line, not across it.',
        2: 'A zero covector has no lines; this one is not zero.',
        3: 'A short arrow gives a small number, not zero — unless it runs along the lines.',
      },
      hints: ['Count the lines crossed by an arrow that lies inside one line.'],
      teach: 'ω(V) = 0 exactly when V lies along the stack’s lines.',
      explain: t`The arrow starts and ends on the same line, so it crosses none: $\omega(\mathbf V) = 0$ for every arrow along the lines, whatever its length.`,
    }),
  ],
  sources: [
    { label: 'Misner, Thorne & Wheeler, Gravitation, §2.5 (one-forms as surfaces; the bong of a bell)', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §3.3 (one-forms)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (dual vectors)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
