// Significant figures and uncertainty: a measurement is a range, and a result is no more precise than its inputs.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { ruler, intervals, rectangleBounds } from './_measure.js';

const t = String.raw;

// the worked example: exhaust velocity from a static fire, v = F / mdot
const EX = { F: 1520, dF: 20, m: 0.52, dm: 0.005 };
EX.v = EX.F / EX.m;
EX.rF = EX.dF / EX.F;
EX.rm = EX.dm / EX.m;
EX.dv = (EX.rF + EX.rm) * EX.v;
EX.quad = Math.hypot(EX.rF, EX.rm);
const pct = (x, n = 2) => fmt(100 * x, n);

/** Round an uncertainty to one significant figure (two if it starts with 1), and the value to match. */
function report(value, delta) {
  const p = Math.floor(Math.log10(delta));
  const lead = delta / 10 ** p;
  const place = lead < 1.95 ? p - 1 : p;              // keep two figures when the leading digit is 1
  const d = Math.round(delta / 10 ** place) * 10 ** place;
  const v = Math.round(value / 10 ** place) * 10 ** place;
  const dec = Math.max(0, -place);
  return { v: v.toFixed(dec), d: d.toFixed(dec) };
}

export default lesson({
  id: 'phys2210.M1.3',
  title: 'Significant figures and uncertainty',
  minutes: 10, difficulty: 2,
  intro: t`No measurement is exact. A measured value comes with an **uncertainty** — a range the true value very probably lies in — and an honest result reports both:

$$x = x_\text{best} \pm \delta x, \qquad \text{relative uncertainty} = \frac{\delta x}{|x_\text{best}|}$$

**Significant figures** are the shorthand for this: writing $9.81\ \text{m/s}^2$ claims you know the value to about $\pm 0.01$, while $9.8$ claims only $\pm 0.1$. And a result computed from measurements can never be more precise than the measurements that went into it.`,
  symbols: [
    { tex: 'x_\\text{best}', text: 'your best estimate of the quantity — usually the reading, or the average of repeated readings' },
    { tex: '\\delta x', text: 'the absolute uncertainty, in the same units as $x$: how far the true value could plausibly be from $x_\\text{best}$' },
    { tex: '\\pm', text: '“plus or minus”: the result is the whole range from $x_\\text{best} - \\delta x$ to $x_\\text{best} + \\delta x$' },
    { tex: '\\delta x/|x_\\text{best}|', text: 'the relative (fractional) uncertainty: a pure number, often quoted as a percentage' },
  ],
  why: 'Every lab report, engineering safety margin and discovery claim — LIGO’s first gravitational-wave detection included — comes down to comparing a difference with its uncertainty.',
  visual: {
    type: 'graph',
    title: 'When do two measurements agree?',
    lead: t`Two labs measure the acceleration of free fall, $g$. Each result is a range, not a point. Move lab B’s best value and resize its uncertainty, and watch the two ranges. Two results **agree** when their difference is smaller than the sum of their uncertainties — when the bars overlap.`,
    tasks: [
      'Set B to 9.85 with δ = 0.02: the bars miss each other, so the labs disagree — one of them has a problem to find.',
      'Keep B at 9.85 but widen δ to 0.05: now they agree. A vaguer measurement agrees with more.',
      'Find the smallest δ for which B = 9.88 still agrees with A.',
    ],
    params: {
      aspect: 'wide', x: [9.6, 10], y: [0.02, 1.02], yticks: 0.001, xlabel: 'g (m/s²)', ylabel: ' ',
      alt: 'Two measurement ranges on a number line; the second can be moved and resized',
      sliders: [
        { key: 'b', label: 'Lab B best value', min: 9.65, max: 9.95, step: 0.01, value: 9.83, unit: '\\mathrm{m/s^2}', explain: 'Where the middle of B’s range sits.' },
        { key: 'db', label: 'Lab B uncertainty $\\delta_B$', min: 0.01, max: 0.1, step: 0.01, value: 0.03, unit: '\\mathrm{m/s^2}', explain: 'Half the width of B’s range: a careful timer gives a small δ, a stopwatch a large one.' },
      ],
      shade: [
        { fn: '0.92', lower: '0.58', from: 9.77, to: 9.81, color: 'accent', alpha: 0.5 },
        { fn: '0.42', lower: '0.08', from: 'b - db', to: 'b + db', color: 'warn', alpha: 0.5 },
      ],
      points: [
        { x: 9.79, y: 0.75, r: 4, color: 'accent' }, { x: 9.81, y: 0.81, r: 0.01, color: 'accent', label: 'A: 9.79 ± 0.02 (pendulum)' },
        { x: 'b', y: 0.25, r: 4, color: 'warn' }, { x: 'b + db', y: 0.31, r: 0.01, color: 'warn', label: 'B (light gates)' },
      ],
      readouts: [
        { label: 'difference $|A - B|$', expr: 'abs(9.79 - b)', unit: '\\mathrm{m/s^2}', digits: 2 },
        { label: '$\\delta_A + \\delta_B$', expr: '0.02 + db', unit: '\\mathrm{m/s^2}', digits: 2 },
        { label: 'difference ÷ combined δ', expr: 'abs(9.79 - b)/(0.02 + db)', digits: 2 },
      ],
    },
    caption: 'Each bar runs from best − δ to best + δ; a ratio below 1 means the bars overlap. Hard-edged ranges are the simple rule of introductory labs. In research, δ is usually one standard deviation, and a difference under about two combined uncertainties counts as agreement.',
    explain: t`**Combining uncertainties.** For a sum or a difference, add the absolute uncertainties: $\delta(A - B) = \delta_A + \delta_B$ — the rule behind the readout above. For a product or a quotient, add the relative uncertainties: if $F$ is known to 1% and $m$ to 2%, then $F/m$ is known to about 3%. Both rules are cautious upper bounds; when the errors are independent, labs combine them in quadrature, $\sqrt{a^2 + b^2}$, which gives a smaller total.`,
  },
  example: {
    prompt: t`In a static fire, a load cell measures the thrust as $F = ${EX.F} \pm ${EX.dF}$ N, and a flowmeter measures the propellant flow as $\dot m = ${EX.m.toFixed(3)} \pm ${EX.dm}$ kg/s. The effective exhaust velocity is $v_e = F/\dot m$. Report $v_e$ with its uncertainty.`,
    steps: [
      { label: 'Best value', text: t`$v_e = \dfrac{${EX.F}\ \text{N}}{${EX.m.toFixed(3)}\ \text{kg/s}} = ${Math.round(EX.v)}\ \text{m/s}$ (keep the extra digits for now — round once, at the end).` },
      { label: 'Relative uncertainties', text: t`Thrust: $\dfrac{${EX.dF}}{${EX.F}} = ${pct(EX.rF)}\%$. Flow: $\dfrac{${EX.dm}}{${EX.m.toFixed(3)}} = ${pct(EX.rm)}\%$.` },
      { label: 'Combine', text: t`For a quotient the relative uncertainties add: $${pct(EX.rF)}\% + ${pct(EX.rm)}\% = ${pct(EX.rF + EX.rm)}\%$, so $\delta v_e = ${fmt(EX.rF + EX.rm, 2)}\times${Math.round(EX.v)} \approx ${Math.round(EX.dv)}$ m/s. (Treating the two errors as independent and adding in quadrature gives $\sqrt{${pct(EX.rF)}^2 + ${pct(EX.rm)}^2}\,\% = ${pct(EX.quad)}\%$ — the simple sum is the cautious bound.)` },
      { label: 'Round once', text: t`Round the uncertainty to one significant figure, ${report(EX.v, EX.dv).d} m/s, then round the value to the same decimal place. The significant-figure rules are the quick version of this: a product or quotient keeps the fewest significant figures among its inputs; a sum or difference keeps the fewest decimal places.` },
      { label: 'Sense check', text: t`The thrust measurement contributes more (${pct(EX.rF)}% against ${pct(EX.rm)}%), so a better load cell would improve the result most. And about 2.9 km/s is a typical exhaust velocity for a kerosene–oxygen engine.` },
    ],
    answer: t`$v_e = ${report(EX.v, EX.dv).v} \pm ${report(EX.v, EX.dv).d}\ \text{m/s}$ (a ${pct(EX.rF + EX.rm)}% uncertainty).`,
  },
  practice: [
    num({
      id: 'count-sf', difficulty: 1,
      gen(r) {
        const [shown, n, errs] = r.pick([
          [t`$0.00450\ \text{m}$`, 3, [[6, 'Leading zeros only place the decimal point; they are not significant.'], [2, 'The final zero after the 5 is significant: it says the reading was good to that digit.']]],
          [t`$102.0\ \text{s}$`, 4, [[3, 'A zero after the decimal point, at the end, is significant — it was measured.'], [2, 'Zeros between nonzero digits are always significant.']]],
          [t`$0.070\ \text{kg}$`, 2, [[4, 'Leading zeros only place the decimal point; they are not significant.'], [1, 'The final zero is significant: it says the reading was good to that digit.']]],
          [t`$3.008\ \text{N}$`, 4, [[2, 'Zeros between nonzero digits are always significant.']]],
          [t`$6.0\times10^{3}\ \text{Pa}$`, 2, [[4, 'The power of ten only places the decimal point; count the digits of 6.0.'], [1, 'The zero in 6.0 is significant: it says the value is known to the first decimal.']]],
          [t`$1.20\times10^{-2}\ \text{m}$`, 3, [[2, 'The trailing zero in 1.20 is significant.'], [5, 'The power of ten only places the decimal point; count the digits of 1.20.']]],
        ]);
        return {
          prompt: t`How many significant figures does the measurement ${shown} have?`,
          answer: n, tol: { rel: 0, abs: 0.01 },
          errors: errs.map(([value, feedback]) => ({ value, feedback })),
          hints: ['Start counting at the first nonzero digit. Zeros between digits count; a zero at the end counts if there is a decimal point.'],
          teach: 'Significant figures run from the first nonzero digit to the last digit that was actually measured, including trailing zeros after a decimal point.',
          explain: t`${shown} has ${n} significant figure${n > 1 ? 's' : ''}: leading zeros and powers of ten only locate the decimal point, but every measured digit after the first nonzero one counts.`,
        };
      },
    }),
    mcq({
      id: 'ruler-reading', difficulty: 1,
      gen(r) {
        let v;
        do { v = r.int(362, 488) / 100; } while ([0, 1, 9].includes(Math.round(v * 100) % 10));
        const below = Math.floor(v * 10) / 10;
        const from = Math.floor(v) - 0.5, to = Math.floor(v) + 1;
        return {
          prompt: `Where does the right end of the gold object fall on this millimetre ruler (shown from ${from} cm to ${to} cm)? Choose the best way to record the reading.`,
          choices: [`${v.toFixed(2)} cm`, `${below.toFixed(1)} cm`, `${v.toFixed(4)} cm`, `${Math.round(v)} cm`],
          answer: 0,
          why: {
            1: 'That records only the last millimetre mark passed. You can do better: estimate how far the end sits between two marks.',
            2: 'Four decimal places claims a precision of a micrometre — far beyond what a millimetre ruler can show.',
            3: 'Rounding to the nearest centimetre throws away the millimetres the ruler clearly shows.',
          },
          hints: ['Read the last whole millimetre mark, then estimate the fraction of the next millimetre in tenths.'],
          teach: 'Read an analogue scale to one estimated digit beyond its smallest division — no more, no fewer.',
          explain: t`The end lies between ${below.toFixed(1)} cm and ${(below + 0.1).toFixed(1)} cm, about ${Math.round((v - below) * 100)} tenths of the way, so the reading is ${v.toFixed(2)} cm — say $\pm 0.02$ cm. The last digit is estimated, and that is exactly what makes it significant.`,
          visual: ruler({ from, to, value: v }),
        };
      },
    }),
    num({
      id: 'relative-percent', difficulty: 1,
      gen(r) {
        const [F, dF] = r.pick([[1250, 15], [860, 10], [2400, 30], [455, 5], [3100, 50]]);
        const p = (100 * dF) / F;
        return {
          prompt: t`A load cell reads $F = ${F} \pm ${dF}$ N. What is the relative uncertainty, as a percentage, to 2 significant figures?`,
          answer: p, units: '%', tol: { rel: 0.05 },
          errors: [{ value: dF / F, feedback: 'That is the fraction. The box is in percent: multiply by 100.' }, { value: (100 * F) / dF, feedback: 'Upside down: divide the uncertainty by the value.' }],
          hints: [t`Relative uncertainty $= \delta F/F$; multiply by 100 for a percentage.`],
          teach: 'Relative uncertainty is the absolute uncertainty divided by the value — a pure number, often given in percent.',
          explain: t`$\dfrac{\delta F}{F} = \dfrac{${dF}}{${F}} = ${fmt(dF / F, 3)} = ${fmt(p, 2)}\%$.`,
          visual: intervals([{ best: F, delta: dF, label: `${F} ± ${dF} N`, color: 'accent' }], { x: [F - 6 * dF, F + 6 * dF], xlabel: 'F (N)', caption: 'The reading as a range: the bar is 2δF wide.' }),
        };
      },
    }),
    num({
      id: 'area-uncertainty', difficulty: 2,
      gen(r) {
        const L = r.pick([2.5, 1.8, 3.2]), W = r.pick([1.2, 0.9, 1.5]);
        const dL = r.pick([0.02, 0.01]), dW = r.pick([0.01, 0.02]);
        const A = L * W, rel = dL / L + dW / W, dA = rel * A;
        const quad = Math.hypot(dL / L, dW / W) * A;
        return {
          prompt: t`A rectangular composite panel measures $${L.toFixed(2)} \pm ${dL}$ m by $${W.toFixed(2)} \pm ${dW}$ m. Its area is $${fmt(A, 3)}\ \text{m}^2$. Adding the relative uncertainties of the two sides, what is the absolute uncertainty in the area?`,
          answer: dA, units: 'm^2', tol: { rel: 0.08 },
          errors: [
            { value: dL + dW, feedback: 'For a product, add the relative uncertainties, not the absolute ones — the sides are multiplied, not added.' },
            { value: quad, feedback: 'That is the quadrature sum, which assumes independent errors. This question asks for the simple sum of the relative uncertainties.' },
            { value: rel, feedback: 'That is the relative uncertainty, a pure number. Multiply it by the area to get the uncertainty in m².' },
          ],
          hints: [t`Relative uncertainties: $\delta L/L = ${dL}/${L.toFixed(2)}$ and $\delta W/W = ${dW}/${W.toFixed(2)}$.`, t`$\delta A = A\left(\dfrac{\delta L}{L} + \dfrac{\delta W}{W}\right) = ${fmt(A, 3)}\times(${fmt(dL / L, 3)} + ${fmt(dW / W, 3)})$.`],
          teach: 'For a product, the relative uncertainty of the result is the sum of the relative uncertainties of the factors.',
          explain: t`$\dfrac{\delta A}{A} = ${pct(dL / L)}\% + ${pct(dW / W)}\% = ${pct(rel)}\%$, so $\delta A = ${pct(rel)}\%\times${fmt(A, 3)}\ \text{m}^2 = ${fmt(dA, 2)}\ \text{m}^2$. Report $A = ${report(A, dA).v} \pm ${report(A, dA).d}\ \text{m}^2$.`,
          visual: rectangleBounds({ L, W, dL, dW }),
        };
      },
    }),
    mcq({
      id: 'quotient-sigfigs', difficulty: 2,
      gen(r) {
        const d = r.pick([1523, 2048, 987, 3310]), tt = r.pick([4.2, 6.8, 3.1, 9.5]);
        const v = d / tt;
        const nfig = v.toFixed(1).replace('.', '').replace(/^0+/, '').length;
        const sci = (x, n) => { const [m, e] = x.toExponential(n - 1).split('e'); return t`$${m}\times10^{${+e}}$ m/s`; };
        return {
          prompt: t`A sounding rocket climbs ${d} m in ${tt} s (both measured). Which is the properly reported average speed?`,
          choices: [sci(v, 2), `${v.toFixed(1)} m/s`, `${v.toFixed(4)} m/s`, sci(v, 1)],
          answer: 0,
          why: {
            1: `That keeps ${nfig} figures, but the time, ${tt} s, has only two. The extra digits are noise.`,
            2: 'A calculator’s digits are not measurements. Reporting them claims a precision the data do not have.',
            3: `One figure throws away information the data do support: ${tt} s has two significant figures.`,
          },
          hints: ['In a quotient, the result keeps as many significant figures as the least precise input.', `${d} m has four significant figures; ${tt} s has two.`],
          teach: 'A product or quotient keeps as many significant figures as its least precise factor.',
          visual: (() => {
            const lo = (d - 0.5) / (tt + 0.05), hi = (d + 0.5) / (tt - 0.05), half = Math.max(v - lo, hi - v);
            return intervals([{ best: v, delta: half, label: 'speeds the data allow' }], { x: [v - 3 * half, v + 3.6 * half], xlabel: 'average speed (m/s)', xticks: 5, caption: `Reading ${tt} s as anything from ${(tt - 0.05).toFixed(2)} s to ${(tt + 0.05).toFixed(2)} s, the speed could lie anywhere in this bar — so only its first two figures mean anything.` });
          })(),
          explain: t`$${d}/${tt} = ${fmt(v, 6)}$ on a calculator, but ${tt} s limits the result to two significant figures: ${sci(v, 2)}. Scientific notation makes the two figures unambiguous.`,
        };
      },
    }),
    mcq({
      id: 'sum-decimals', difficulty: 2,
      prompt: t`Three measured lengths are added: $12.52\ \text{m} + 3.1\ \text{m} + 0.256\ \text{m}$. How should the total be reported?`,
      choices: ['15.9 m', '15.876 m', '15.88 m', '16 m'],
      answer: 0,
      why: {
        1: 'Those are the calculator’s digits. The 3.1 m length is known only to the tenth of a metre, so hundredths and thousandths in the total mean nothing.',
        2: 'For a sum, the rule is about decimal places, not significant figures: 3.1 m is known only to 0.1 m.',
        3: 'That throws away a decimal place the data support: every length is known at least to 0.1 m.',
      },
      hints: ['For sums and differences, the rule is about decimal places, not significant figures.', 'Which length has the fewest decimal places?'],
      teach: 'A sum or difference keeps the fewest decimal places among the quantities added.',
      visual: intervals([{ best: 15.876, delta: 0.0555, label: 'the true total lies in here' }], { x: [15.7, 16.08], xlabel: 'total length (m)', xticks: 8, caption: 'Each length is uncertain by half its last digit (±0.005, ±0.05 and ±0.0005 m), so the total is uncertain by about ±0.06 m: a second decimal place would mean nothing.' }),
      explain: 'The exact sum is 15.876 m, but 3.1 m is only known to the nearest 0.1 m, so the total is too: 15.9 m.',
    }),
    mcq({
      id: 'do-they-agree', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[9.79, 9.84], [9.78, 9.83], [9.82, 9.77]]);
        const da = 0.02, db = 0.02;
        return {
          prompt: t`Two labs measure $g$. Lab A finds $${a} \pm ${da}\ \text{m/s}^2$; lab B finds $${b} \pm ${db}\ \text{m/s}^2$. Do the results agree?`,
          choices: [
            t`No: they differ by ${nice(Math.abs(a - b))}, more than the combined uncertainty of ${nice(da + db)}`,
            'Yes: both round to 9.8 m/s²',
            t`Yes: a difference of ${nice(Math.abs(a - b))} is tiny compared with 9.8`,
            'No: two measurements must be identical to agree',
          ],
          answer: 0,
          why: {
            1: 'Rounding both results hides exactly the digits that disagree. Compare them at the precision they were measured to.',
            2: 'The difference must be compared with the uncertainties, not with the size of the value: these labs claim to know g to 0.02.',
            3: 'Measurements never match exactly. They agree when their difference is within the combined uncertainty.',
          },
          hints: ['Find the difference, then compare it with the sum of the two uncertainties.', t`$|A - B| = ${nice(Math.abs(a - b))}$ and $\delta_A + \delta_B = ${nice(da + db)}$.`],
          teach: 'Two results agree when their difference is smaller than their combined uncertainty — compare differences with uncertainties, never with the values themselves.',
          explain: t`The ranges $[${fmt(a - da, 3)}, ${fmt(a + da, 3)}]$ and $[${fmt(b - db, 3)}, ${fmt(b + db, 3)}]$ do not overlap: the difference, ${nice(Math.abs(a - b))} m/s², exceeds $\delta_A + \delta_B = ${nice(da + db)}$ m/s². At least one lab has an error it has not accounted for — worth hunting down.`,
          visual: intervals([{ best: a, delta: da, label: `A: ${a} ± ${da}`, color: 'accent' }, { best: b, delta: db, label: `B: ${b} ± ${db}`, color: 'warn' }], { x: [9.7, 9.9], xlabel: 'g (m/s²)', xticks: 5 }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pendulum-g', difficulty: 3, transfer: true,
      gen(r) {
        const [L, dL, T, dT] = r.pick([[1.0, 0.002, 2.01, 0.01], [0.5, 0.002, 1.42, 0.01], [0.75, 0.003, 1.74, 0.02], [1.2, 0.005, 2.2, 0.02]]);
        const rel = 100 * (dL / L + (2 * dT) / T);
        return {
          prompt: t`You find $g$ in the lab from a pendulum, using $g = 4\pi^2 L/T^2$. You measured the length $L = ${L.toFixed(3)} \pm ${dL}$ m and the period $T = ${T.toFixed(2)} \pm ${dT}$ s. Treating $T^2$ as $T\times T$ and adding relative uncertainties, what is the relative uncertainty in $g$, in percent?`,
          answer: rel, units: '%', tol: { rel: 0.05 },
          errors: [
            { value: 100 * (dL / L + dT / T), feedback: t`$T$ appears squared: $T^2 = T\times T$, so its relative uncertainty counts twice.` },
            { value: (dL / L + (2 * dT) / T), feedback: 'That is the fraction; the box is in percent: multiply by 100.' },
          ],
          hints: [t`$\dfrac{\delta g}{g} = \dfrac{\delta L}{L} + \dfrac{\delta T}{T} + \dfrac{\delta T}{T}$ — the $4\pi^2$ is exact.`, t`$\dfrac{\delta L}{L} = ${pct(dL / L)}\%$ and $\dfrac{\delta T}{T} = ${pct(dT / T)}\%$.`],
          teach: 'A squared quantity contributes twice its relative uncertainty, because x² = x · x.',
          visual: { type: 'oscillator', params: { kind: 'pendulum', L, theta0: 8 }, caption: 'A pendulum of the measured length. The period readout uses g = 9.8 m/s²; the drawing is not to scale.' },
          explain: t`$\dfrac{\delta g}{g} = ${pct(dL / L)}\% + 2\times${pct(dT / T)}\% = ${pct(rel / 100)}\%$. The timing dominates: measuring 10 swings and dividing by 10 is the classic way to shrink $\delta T$.`,
        };
      },
    }),
    mcq({
      id: 'cp-overprecise', difficulty: 2, kind: 'error',
      prompt: 'A test report gives the propellant mass flow as 0.5234 ± 0.03 kg/s. What is wrong with this result?',
      choices: [
        'The value claims more precision than the uncertainty allows: report 0.52 ± 0.03 kg/s',
        'Nothing: extra digits make a result more accurate',
        'The uncertainty should be written 0.0300 kg/s to match the value',
        'An uncertainty must always be given as a percentage',
      ],
      answer: 0,
      why: {
        1: 'Extra digits add no accuracy. With an uncertainty of 0.03, the third and fourth decimals are pure noise.',
        2: 'Padding the uncertainty with zeros claims you know the uncertainty to four figures. Round the value to the uncertainty, not the other way round.',
        3: 'Absolute and relative uncertainties are both fine; the problem is that the value and its uncertainty end at different decimal places.',
      },
      hints: ['To which decimal place is the uncertainty given?'],
      teach: 'Round the uncertainty to one or two significant figures, then round the value to the same decimal place.',
      visual: intervals([{ best: 0.5234, delta: 0.03, label: '± 0.03 kg/s' }], { x: [0.45, 0.62], xlabel: 'mass flow (kg/s)', xticks: 6, caption: 'With an uncertainty of ±0.03 kg/s the true value could be anywhere in this bar — the digits after 0.52 are noise.' }),
      explain: 'The uncertainty, 0.03 kg/s, is in the second decimal place, so the value should end there too: 0.52 ± 0.03 kg/s.',
    }),
    num({
      id: 'cp-sum-uncertainty', difficulty: 2,
      gen(r) {
        const [m1, d1, m2, d2] = r.pick([[12.4, 0.2, 8.1, 0.1], [5.25, 0.05, 3.60, 0.10], [140, 3, 85, 2]]);
        return {
          prompt: t`A payload is assembled from two parts with masses $${m1} \pm ${d1}$ kg and $${m2} \pm ${d2}$ kg. What is the uncertainty in the total mass?`,
          answer: d1 + d2, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: Math.abs(d1 - d2), feedback: 'Uncertainties never cancel: each part could be off in either direction, so the worst cases add.' }, { value: Math.hypot(d1, d2), feedback: 'That is the quadrature sum for independent errors. Here, use the simple rule: absolute uncertainties add for a sum.' }],
          hints: ['For a sum, add the absolute uncertainties.'],
          teach: 'For a sum or a difference, the absolute uncertainties add.',
          visual: (() => {
            const lo = Math.min(m1, m2), hi = Math.max(m1, m2), span = hi - lo;
            return intervals([{ best: m1, delta: d1, label: `${m1} ± ${d1} kg` }, { best: m2, delta: d2, label: `${m2} ± ${d2} kg`, color: 'violet' }], { x: [lo - 0.3 * span, hi + 0.45 * span], xlabel: 'mass (kg)', xticks: 6, caption: 'The two parts as ranges. Each could be off in either direction, independently of the other.' });
          })(),
          explain: t`$\delta m = ${d1} + ${d2} = ${fmt(d1 + d2, 2)}$ kg, so the total is $${report(m1 + m2, d1 + d2).v} \pm ${report(m1 + m2, d1 + d2).d}$ kg.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §1.6', url: 'https://openstax.org/books/university-physics-volume-1/pages/1-6-significant-figures' },
    { label: 'J. R. Taylor, An Introduction to Error Analysis (2nd ed.), ch. 2–3', url: 'https://uscibooks.aip.org/books/an-introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-3rd-edition/' },
  ],
});
