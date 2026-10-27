// Capacitors in series and parallel. Parallel: one voltage, charges add, so
// capacitances add. Series: one charge (the middle conductor is isolated, so
// its charge stays zero), voltages add, so reciprocals add — the opposite of
// resistors, and the classic slip is to add series capacitors like resistors.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { sf, apart, circuit } from './_circuits.js';

const t = String.raw;
const ser = (...C) => 1 / C.reduce((a, c) => a + 1 / c, 0);
const fmtC = (x) => nice(sf(x, 3));

/** A capacitor network being charged (still, long after the switch closed). */
const net = (kind, caps, E, caption, extra = {}) => {
  const values = { E, R: 1000, ...Object.fromEntries(caps.map((c, i) => [`C${i + 1}`, c * 1e-6])) };
  const Ceq = kind === 'series' ? ser(...caps) : kind === 'parallel' ? caps.reduce((a, b) => a + b, 0) : ser(caps[0], caps[1] + caps[2]);
  return circuit('rc', { opts: { net: kind, nc: caps.length }, values, t: 12 * 1000 * Ceq * 1e-6, caption, ...extra });
};

export default lesson({
  id: 'phys2220.E5.2',
  title: 'Capacitors in series and parallel',
  minutes: 10, difficulty: 2,
  intro: t`Wire capacitors **side by side** (in parallel) and each one sits across the same voltage, so each holds its own $C_iV$: the charges add, and so do the capacitances — it is like making the plates bigger. Wire them **end to end** (in series) and the conductor between two of them is cut off from everything else: it started neutral and must stay neutral, so the charge pushed onto one plate is matched by the same charge on the next. Every capacitor in a series chain carries **the same charge**, and their voltages add up to the total. That makes reciprocals add:

$$C_\text{par} = C_1 + C_2 + \cdots \qquad\qquad \frac{1}{C_\text{ser}} = \frac{1}{C_1} + \frac{1}{C_2} + \cdots$$

Notice that this is **the reverse of the rules for resistors**. Capacitors in series do not add up; their combination is smaller than the smallest of them.`,
  symbols: [
    { tex: 'C_\\text{par}', text: 'the equivalent capacitance of capacitors in parallel: the single capacitor that would hold the same total charge at the same voltage' },
    { tex: 'C_\\text{ser}', text: 'the equivalent capacitance of capacitors in series: always smaller than the smallest one in the chain' },
    { tex: 'C_1, C_2', text: 'the individual capacitances, in farads (here mostly µF)' },
    { tex: 'Q = CV', text: 'for each capacitor and for the combination: in parallel the $V$ is shared and the $Q$s add; in series the $Q$ is shared and the $V$s add' },
  ],
  why: 'Real capacitor banks — in power supplies, pulsed lasers and pyrotechnic firing units — are built from many identical parts: parallel for more capacitance, series to stand a higher voltage than one part could.',
  visual: {
    type: 'em-circuit',
    title: 'Two capacitors charging, in series or in parallel',
    lead: t`A battery charges two capacitors through a resistor. Switch between series and parallel, and watch the charge $Q$ and voltage $\Delta V$ beside each capacitor while the current dies away.`,
    tasks: [
      'In series, Q₁ and Q₂ stay equal at every instant — while the smaller capacitor takes the larger share of the voltage.',
      'Switch to parallel: both reach the full 12 V and the charges split in proportion to C.',
      'Compare the time constants: parallel charges slowly (a bigger total C), series quickly (a smaller one).',
    ],
    params: { circuit: 'rc', opts: { net: 'series' }, netChoice: true, values: { E: 12, R: 1000, C1: 1e-3, C2: 3e-3 }, sliders: ['C1', 'C2'], show: { I: true, drop: true, V: true } },
  },
  example: {
    prompt: t`A 4.0 µF and a 12 µF capacitor are connected across a 24 V battery, first in parallel, then in series. In each case find the equivalent capacitance and each capacitor’s charge and voltage.`,
    visual: net('series', [4, 12], 24, 'The series connection, fully charged. The node voltages are marked: the 4.0 µF capacitor holds 24 − 6 = 18 V, the 12 µF one 6 V.', { show: { V: true } }),
    steps: [
      { label: 'Parallel: shared voltage', text: t`Each capacitor sits across the battery: $V_1 = V_2 = 24$ V. Then $Q_1 = (4.0\ \mu\text{F})(24\ \text{V}) = 96\ \mu$C and $Q_2 = (12\ \mu\text{F})(24\ \text{V}) = 288\ \mu$C.` },
      { label: 'Parallel: equivalent', text: t`$C_\text{par} = 4.0 + 12 = 16\ \mu$F. Check: $(16\ \mu\text{F})(24\ \text{V}) = 384\ \mu\text{C} = 96 + 288$. ✓` },
      { label: 'Series: shared charge', text: t`$\dfrac{1}{C_\text{ser}} = \dfrac{1}{4.0} + \dfrac{1}{12} = \dfrac{3 + 1}{12}$, so $C_\text{ser} = 3.0\ \mu$F — smaller than either. The battery moves $Q = (3.0\ \mu\text{F})(24\ \text{V}) = 72\ \mu$C, and each capacitor carries that same 72 µC.` },
      { label: 'Series: split voltage', text: t`$V_1 = Q/C_1 = 72/4.0 = 18$ V and $V_2 = 72/12 = 6.0$ V. They add to 24 V. ✓ The smaller capacitor takes the larger voltage: to hold the same charge, it needs more volts.` },
    ],
    answer: t`Parallel: $C = 16\ \mu$F, 24 V on each, $Q = 96$ and $288\ \mu$C. Series: $C = 3.0\ \mu$F, $72\ \mu$C on each, $V = 18$ V and $6.0$ V.`,
  },
  practice: [
    num({
      id: 'par-sum', difficulty: 1,
      gen(r) {
        const n = r.pick([2, 3]);
        const caps = Array.from({ length: n }, () => r.pick([2.2, 4.7, 10, 22, 33, 47]));
        const C = caps.reduce((a, b) => a + b, 0);
        return {
          prompt: t`Capacitors of ${caps.map((c) => `${c} µF`).join(n === 3 ? ', ' : ' and ').replace(/, ([^,]*)$/, ' and $1')} are connected in parallel. What is their equivalent capacitance?`,
          answer: C, units: 'µF', tol: { rel: 0.005 },
          errors: apart([{ value: ser(...caps), feedback: 'That is the series rule. Side by side, the capacitors share one voltage and their charges add, so the capacitances add.' }], C),
          hints: ['In parallel every capacitor has the same voltage; the total charge is the sum of the charges.'],
          teach: t`Capacitances in parallel add: $C_\text{par} = C_1 + C_2 + \cdots$.`,
          explain: t`$C_\text{par} = ${caps.join(' + ')} = ${fmtC(C)}\ \mu$F — bigger than any one of them, as if the plates were joined into one larger pair.`,
          visual: net('parallel', caps, 12, 'The capacitors side by side across one voltage, charged through a resistor.'),
        };
      },
    }),
    num({
      id: 'ser-pair', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 6], [4, 12], [10, 15], [20, 30], [6, 12], [2, 8], [8, 24]]);
        const C = ser(a, b);
        return {
          prompt: t`A ${a} µF and a ${b} µF capacitor are connected in series. What is the equivalent capacitance?`,
          answer: C, units: 'µF', tol: { rel: 0.005 },
          errors: [
            { value: a + b, feedback: 'That adds them like resistors in series. In series the capacitors share a charge and their voltages add, so their reciprocals add: the result is smaller than either.' },
            { value: 1 / a + 1 / b, feedback: t`You found $1/C_\text{ser}$ (in 1/µF). Take its reciprocal.` },
          ],
          hints: [t`$\dfrac{1}{C_\text{ser}} = \dfrac{1}{C_1} + \dfrac{1}{C_2}$; for two, $C_\text{ser} = \dfrac{C_1 C_2}{C_1 + C_2}$.`, 'The answer must be smaller than the smaller capacitor.'],
          teach: t`Series capacitors combine by reciprocals: $C_\text{ser} = C_1C_2/(C_1 + C_2)$ for two.`,
          explain: t`$C_\text{ser} = \dfrac{(${a})(${b})}{${a} + ${b}} = \dfrac{${a * b}}{${a + b}} = ${fmtC(C)}\ \mu$F, below the smaller one, ${Math.min(a, b)} µF.`,
          visual: net('series', [a, b], 12, 'The two capacitors end to end, charged through a resistor.'),
        };
      },
    }),
    mcq({
      id: 'twin', difficulty: 1,
      prompt: t`Two identical 10 µF capacitors are connected in series. Their equivalent capacitance is:`,
      choices: ['5 µF', '20 µF', '10 µF', '0.2 µF'],
      answer: 0,
      why: {
        1: 'Capacitors in series do not add like resistors in series: the chain is like one capacitor with a gap twice as wide, so its capacitance halves.',
        2: 'Adding a second capacitor in series does change things: the same charge now needs twice the voltage.',
        3: t`$1/10 + 1/10 = 0.2$ is $1/C_\text{ser}$ in 1/µF; the reciprocal is 5 µF.`,
      },
      hints: ['Each capacitor carries the same charge Q; the battery’s voltage is split between them.'],
      teach: 'Two equal capacitors in series act as one with half the capacitance: twice the gap, same plate area.',
      explain: t`$1/C = 1/10 + 1/10 = 1/5$, so $C = 5\ \mu$F. Picture the two gaps in a row: the same charge needs twice the voltage, so $Q/V$ halves.`,
      visual: net('series', [10, 10], 12, 'Two identical capacitors in series.'),
    }),
    num({
      id: 'ser-voltage', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 6], [3, 6], [4, 12], [5, 20], [10, 40], [6, 18]]);
        const E = r.pick([9, 12, 18, 24]);
        const Q = ser(a, b) * E, Va = Q / a;   // across the smaller one
        return {
          prompt: t`A ${a} µF and a ${b} µF capacitor in series are charged by a ${E} V battery. What is the voltage across the ${a} µF capacitor?`,
          answer: Va, units: 'V', tol: { rel: 0.005 },
          errors: apart([
            { value: E, feedback: 'In series the capacitors share the battery’s voltage; neither gets all of it.' },
            { value: Q / b, feedback: `That is the voltage across the ${b} µF capacitor. The smaller capacitor takes the larger share.` },
            { value: E / 2, feedback: 'The voltage does not split equally unless the capacitances are equal.' },
          ], Va),
          hints: [t`Find the charge first: $Q = C_\text{ser} E$, the same on both.`, t`Then $V_1 = Q/C_1$.`],
          teach: 'In series the charge is shared, so each capacitor’s voltage is Q/C: the smaller capacitor takes the bigger voltage.',
          explain: t`$C_\text{ser} = \dfrac{${a}\times${b}}{${a + b}} = ${fmtC(ser(a, b))}\ \mu$F, so $Q = ${fmtC(ser(a, b))}\times${E} = ${fmtC(Q)}\ \mu$C on each. Then $V = Q/C = ${fmtC(Q)}/${a} = ${fmtC(Va)}$ V (and ${fmtC(Q / b)} V across the other; together ${E} V).`,
          visual: net('series', [a, b], E, 'The pair fully charged; no current flows any more.'),
        };
      },
    }),
    mcq({
      id: 'bound', difficulty: 2,
      prompt: t`Capacitors of 2 µF, 5 µF and 10 µF are connected in series. Without calculating, their equivalent capacitance must be:`,
      choices: ['Less than 2 µF', '17 µF', 'Between 2 µF and 10 µF', 'Exactly 2 µF'],
      answer: 0,
      why: {
        1: 'Adding them gives the parallel combination. In series the reciprocals add.',
        2: t`The series combination is below every one of them: $1/C_\text{ser}$ is bigger than $1/C_i$ for each $i$.`,
        3: 'Only if the other two were infinite. Each extra capacitor in series lowers C further.',
      },
      hints: [t`$1/C_\text{ser} = 1/2 + 1/5 + 1/10$ is larger than $1/2$ on its own.`],
      teach: 'A series combination is smaller than its smallest member; a parallel one is larger than its largest.',
      explain: t`$1/C_\text{ser} = 0.5 + 0.2 + 0.1 = 0.8\ \mu\text{F}^{-1}$, so $C_\text{ser} = 1.25\ \mu$F, below the smallest. On the graph: one capacitor $C_1$ combined with a second, $C_2$ — the series curve creeps up toward $C_1$ but never reaches it.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 30], y: [0, 16], aspect: 'wide', axesAt: 'edge', xlabel: 'C₂ (µF)', ylabel: 'C_eq (µF)',
          curves: [{ fn: '5 + x', color: 'accent', label: 'parallel: C₁ + C₂', labelAt: 6.5, labelDx: 8, labelDy: 6 }, { fn: '5*x/(5 + x)', color: 'warn', label: 'series: C₁C₂/(C₁ + C₂)', labelAt: 18, labelDy: 14 }],
          hlines: [{ y: 5, label: 'C₁ = 5 µF', color: 'ink3' }],
        },
        caption: 'One capacitor, C₁ = 5 µF, combined with a second of capacitance C₂. In parallel the result is always above C₁; in series it is always below both.',
      },
    }),
    num({
      id: 'combo', difficulty: 3,
      gen(r) {
        const [c1, c2, c3] = r.pick([[6, 2, 4], [4, 1, 3], [12, 2, 4], [3, 1, 2], [10, 4, 6], [8, 3, 5]]);
        const C = ser(c1, c2 + c3);
        return {
          prompt: t`A ${c1} µF capacitor $C_1$ is in series with a parallel pair, $C_2 = ${c2}$ µF and $C_3 = ${c3}$ µF, as drawn. What is the equivalent capacitance of the three?`,
          answer: C, units: 'µF', tol: { rel: 0.005 },
          errors: apart([
            { value: c1 + c2 + c3, feedback: 'Not all three are in parallel: C₁ is in series with the pair.' },
            { value: ser(c1, c2, c3), feedback: 'C₂ and C₃ are side by side (in parallel): combine them by adding first.' },
            { value: c1 + ser(c2, c3), feedback: 'The series/parallel rules are swapped: add the parallel pair, then combine with C₁ by reciprocals.' },
          ], C),
          hints: ['Reduce the network in steps, starting with the innermost group.', t`$C_2 \parallel C_3 = C_2 + C_3 = ${c2 + c3}\ \mu$F.`, t`Then that ${c2 + c3} µF is in series with $C_1$: $\dfrac{C_1 \cdot ${c2 + c3}}{C_1 + ${c2 + c3}}$.`],
          teach: 'Reduce a network step by step: replace each series or parallel group by its equivalent, innermost first.',
          explain: t`The pair: $${c2} + ${c3} = ${c2 + c3}\ \mu$F. In series with $C_1$: $\dfrac{(${c1})(${c2 + c3})}{${c1} + ${c2 + c3}} = ${fmtC(C)}\ \mu$F.`,
          visual: net('combo', [c1, c2, c3], 12, 'C₁ across the top, then C₂ and C₃ side by side down to the bottom rail.'),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A 2.0 µF and a 6.0 µF capacitor are connected in series across a 12 V battery. A student writes:

“Each capacitor is connected to the battery, so each has 12 V: $Q_1 = (2.0)(12) = 24\ \mu$C and $Q_2 = (6.0)(12) = 72\ \mu$C.”

What is wrong?`,
      choices: [
        'In series they share the 12 V and carry the same charge: 18 µC each, with 9 V and 3 V',
        'The charges are right but they should be added: 96 µC on each',
        'The 2.0 µF capacitor should get the smaller voltage',
        'Capacitors in series carry no charge until the battery is disconnected',
      ],
      answer: 0,
      why: {
        1: 'In series the charge on each capacitor is the same; it is the voltages that add.',
        2: 'Backwards: with equal charges, the smaller capacitor needs the larger voltage, V = Q/C.',
        3: 'They charge as soon as the circuit is closed, like any capacitor.',
      },
      hints: ['Is either capacitor connected directly across the battery?', 'The plate between them belongs to an isolated conductor: its charges must cancel.'],
      teach: 'In series the capacitors share the battery’s voltage and carry equal charges.',
      explain: t`$C_\text{ser} = \dfrac{2.0\times6.0}{8.0} = 1.5\ \mu$F, so $Q = 1.5\times12 = 18\ \mu$C on each. Then $V_1 = 18/2.0 = 9.0$ V and $V_2 = 18/6.0 = 3.0$ V, adding to 12 V. ✓ The student’s charges (24 and 72 µC) would leave the middle conductor with a net charge of 48 µC that came from nowhere.`,
      visual: net('series', [2, 6], 12, 'The two capacitors end to end across the battery.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bank', difficulty: 2, transfer: true,
      gen(r) {
        const n = r.pick([3, 4]), C = r.pick([470, 1000, 2200]), V = r.pick([24, 28, 32]);
        const Q = n * C * 1e-6 * V;   // C
        return {
          prompt: t`A pyrotechnic firing unit stores its energy in a bank of ${n} identical ${C} µF capacitors wired in parallel, charged from the ${V} V vehicle bus. How much charge does the bank hold in total?`,
          answer: Q * 1e3, units: 'mC', tol: { rel: 0.005 },
          errors: [{ value: (C * 1e-6 * V) * 1e3, feedback: `That is one capacitor's charge. In parallel the ${n} capacitors each hold that much.` }, { value: (C / n) * 1e-6 * V * 1e3, feedback: 'That treats them as in series. Side by side, the capacitances add.' }],
          hints: [t`In parallel: $C_\text{bank} = ${n}\times${C}\ \mu$F, all at the bus voltage.`, t`$Q = C_\text{bank} V$.`],
          teach: 'Identical capacitors in parallel make a bank of n times the capacitance, all at one voltage.',
          explain: t`$C_\text{bank} = ${n}\times${C} = ${n * C}\ \mu$F, so $Q = (${n * C}\times10^{-6}\ \text{F})(${V}\ \text{V}) = ${nice(sf(Q * 1e3))}$ mC. Banks are built of parallel parts because one large capacitor of that value would be bulky and a single point of failure.`,
          visual: net('parallel', Array(n).fill(C), V, `The bank: ${n} capacitors side by side on the bus, charged through a resistor.`),
        };
      },
    }),
    num({
      id: 'cp-series-rating', difficulty: 3, transfer: true,
      gen(r) {
        const C = r.pick([220, 470, 1000]), rating = r.pick([35, 50]);
        return {
          prompt: t`A power-supply designer needs a capacitor that will stand ${2 * rating - 10} V, but the qualified parts are ${C} µF electrolytics rated for only ${rating} V. She puts two of them in series (with balancing resistors so the voltage splits evenly). What capacitance does the pair have?`,
          answer: C / 2, units: 'µF', tol: { rel: 0.005 },
          errors: [{ value: 2 * C, feedback: 'Doubling is the parallel rule. In series, two equal capacitors make half the capacitance.' }, { value: C, feedback: 'The pair is not the same as one capacitor: the same charge now needs twice the voltage.' }],
          hints: ['Two equal capacitors in series: each takes half the voltage, and both carry the same charge.', t`$C_\text{ser} = \dfrac{C\cdot C}{C + C} = C/2$.`],
          teach: 'Putting equal capacitors in series halves the capacitance but doubles the voltage the combination can stand.',
          explain: t`$C_\text{ser} = ${C}/2 = ${nice(C / 2)}\ \mu$F. Each part sees only half of the ${2 * rating - 10} V, ${nice((2 * rating - 10) / 2)} V, within its ${rating} V rating: the price of the higher voltage is half the capacitance (and the energy stored at a given voltage).`,
          visual: net('series', [C, C], 2 * rating - 10, 'Two identical capacitors in series share the voltage equally. (The balancing resistors that keep the split even in a real supply are not drawn.)'),
        };
      },
    }),
    num({
      id: 'cp-recover', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[6, 3], [12, 4], [10, 15], [6, 12], [20, 5]]);
        const S = a + b, P = ser(a, b), big = Math.max(a, b);
        return {
          prompt: t`Two capacitors have an equivalent capacitance of ${S} µF in parallel and ${fmtC(P)} µF in series. What is the capacitance of the larger one?`,
          answer: big, units: 'µF', tol: { rel: 0.005 },
          errors: [{ value: Math.min(a, b), feedback: 'That is the smaller of the two.' }],
          hints: [t`Parallel: $C_1 + C_2 = ${S}$. Series: $C_1C_2/(C_1 + C_2) = ${fmtC(P)}$, so $C_1C_2 = ${fmtC(P)}\times${S}$.`, t`$C_1$ and $C_2$ are the roots of $x^2 - ${S}x + ${nice(sf(P * S, 6))} = 0$.`],
          teach: 'The parallel combination gives the sum of two capacitances and the series one their product over the sum.',
          explain: t`$C_1 + C_2 = ${S}$ and $C_1C_2 = ${fmtC(P)}\times${S} = ${nice(sf(a * b, 6))}$, so they solve $x^2 - ${S}x + ${a * b} = 0$: $x = ${a}$ or $${b}$. The larger is ${big} µF.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, S], y: [0, Math.ceil(S * S / 4 * 1.15)], aspect: 'wide', axesAt: 'edge', xlabel: 'C₁ (µF), with C₂ = sum − C₁', ylabel: 'C₁C₂ (µF²)',
              curves: [{ fn: `x*(${S} - x)`, color: 'accent', domain: [0, S] }],
              hlines: [{ y: a * b, label: 'C₁C₂ = C_ser × C_par', color: 'gold' }],
            },
            caption: `Every pair adding to ${S} µF lies on the blue curve; the series value fixes their product (gold line). The two crossings are the same pair, swapped.`,
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 2, §8.2 Capacitors in Series and in Parallel', url: 'https://openstax.org/books/university-physics-volume-2/pages/8-2-capacitors-in-series-and-in-parallel' }],
});
