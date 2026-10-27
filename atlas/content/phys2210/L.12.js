// Lab 12 (virtual): specific heat by electrical heating — c = VI/(m × slope)
// from a T–t fit; an uncertainty budget where the meters (Type B), not the
// fit (Type A), set the error bar; a heat leak that bends the line, shows in
// the residuals and biases c high — and a linearization (heating rate against
// excess temperature) that extrapolates it away; reporting a result.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;
const V = 12.0, I = 4.2, P = V * I, C_AL = 897;

// the worked example: the lagged block, readings every two minutes (seed 3)
const EX = (() => {
  const rows = B.makeData('heater', { seed: 3 }).rows;
  const an = B.analyse('heater', rows);
  const f = an.series[0].fit, q = an.results[0];
  const pct = q.terms.map((u) => 100 * u.rel);
  return { rows, f, q, pct, tot: Math.hypot(...pct) };
})();

// the bare block (no lagging): the leak bends the line (seed 41)
const BARE = (() => {
  const rows = B.makeData('heater', { seed: 41, sys: 'leak' }).rows;
  const an = B.analyse('heater', rows, { sys: 'leak' });
  return { rows, f: an.series[0].fit, q: an.results[0] };
})();

/** An uncertainty budget drawn as bars, in percent: [{ label, pct }], plus their quadrature sum unless `total` is false. */
function budget(terms, caption, { total = true } = {}) {
  const all = total ? [...terms, { label: 'combined, in quadrature', pct: Math.hypot(...terms.map((q) => q.pct)), color: 'gold' }] : terms;
  const n = all.length, r4 = (x) => +x.toFixed(4);
  const xmax = 1.15 * Math.max(...all.map((q) => q.pct));
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r4(xmax)], y: [0.4, n + 0.75], xlabel: 'relative uncertainty of c (%)', ylabel: ' ', yticks: 0.001,
      alt: 'The uncertainty budget for c as bars: each source’s relative uncertainty and their combination',
      curves: all.map((q, i) => ({ param: [`${r4(q.pct)}*t`, String(n - i)], t: [0, 1], color: q.color || 'accent', width: 9 })),
      points: all.map((q, i) => ({ x: 0, y: n - i, r: 0.01, color: q.color || 'ink2', label: `${q.label}: ${q.pct.toFixed(2)}%`, labelDx: 2, labelDy: -16 })),
    },
    caption,
  };
}
const EX_TERMS = [
  { label: 'slope, from the fit (Type A)', pct: EX.pct[0] },
  { label: 'voltmeter, ±0.1 V (Type B)', pct: EX.pct[1] },
  { label: 'ammeter, ±0.02 A (Type B)', pct: EX.pct[2] },
  { label: 'balance, ±1 g (Type B)', pct: EX.pct[3] },
];

// a seeded run; `ok` can reject runs that would read oddly in a prompt
const heat = (r, sys = null, params = {}, ok = () => true) => {
  for (let k = 0; ; k++) {
    const rows = B.makeData('heater', { seed: r.int(1, 999999), sys, params }).rows;
    const an = B.analyse('heater', rows, { sys, params });
    if (k > 40 || ok(an)) return { rows, an };
  }
};

export default lesson({
  id: 'phys2210.L.12',
  title: 'Specific heat by calorimetry',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A 1.000 kg aluminium block sits in insulating lagging, with an electric heater and a thermometer in holes drilled into it. A power supply drives the heater at a steady voltage $V$ and current $I$, so it delivers power $P = VI$; you read the temperature every two minutes. The bench computes every reading with realistic scatter.

If no heat leaks away, all the electrical energy warms the block: $VI\,t = mc\,(T - T_0)$, a straight line in time:

$$T = T_0 + \frac{VI}{mc}\,t$$

Fit $T$ against $t$ and $c = VI/(m \times \text{slope})$. This time the fit is not the weak link — the meters are, and the uncertainty budget shows it. (Lab skills trained: a complete uncertainty budget, Type A from the fit and Type B from the instruments’ specifications; finding the dominant term; and spotting heat loss in the residuals.)`,
  symbols: [
    { tex: 'c', text: 'the specific heat, in J/(kg·K): the energy that warms 1 kg by 1 K. Aluminium: 897 J/(kg·K)' },
    { tex: 'm', text: 'the block’s mass: 1.000 kg on a balance good to ±1 g' },
    { tex: 'V,\\ I', text: 'the heater’s voltage and current: 12.0 V and 4.20 A, good to ±0.1 V and ±0.02 A by the meters’ specifications' },
    { tex: 'P = VI', text: 'the heater’s power, in W (joules per second): 50.4 W' },
    { tex: 'T,\\ T_0', text: 'the block’s temperature, in °C, and its value at switch-on — room temperature, 20.0 °C' },
    { tex: 't', text: 'the time since switch-on, in s' },
    { tex: '\\tau', text: 'the time constant of the heat leak to the room, in s: about 8 hours with the lagging on, 40 minutes without. The leak rate is proportional to $T - T_0$' },
  ],
  why: 'Specific heats decide how fast things warm and cool — engine blocks, spacecraft electronics, battery packs — and engineers still measure them this way: a known electrical power, a temperature against time, and an honest uncertainty budget.',
  visual: {
    type: 'lab-bench',
    title: 'Heat a block, read the thermometer',
    lead: t`Six readings, two minutes apart, with the residuals under the plot. The readout turns the slope into $c$, with the meters’ uncertainties folded in.`,
    tasks: [
      'T against t is a straight line; the readout gives c ± σ, close to aluminium’s 897 J/(kg·K).',
      'Take more readings (slide the time and measure): the fit’s share shrinks, but σ for c hardly moves — the meters set the floor.',
      'Turn on the systematic (no lagging): the heating slows as heat leaks away, the residuals arch, χ²/dof soars and c comes out about 12% high.',
    ],
    params: { exp: 'heater', seed: 39, residuals: true },
  },
  example: {
    prompt: t`The block is heated at $12.0 \pm 0.1$ V and $4.20 \pm 0.02$ A; its mass is $1.000 \pm 0.001$ kg. A fit of the six readings gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{K/s}`)}$ with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. Find $c$ with its uncertainty, and say which measurement limits it.`,
    visual: plot('heater', EX.rows, { table: true, residuals: true, caption: 'T against t with ±1σ error bars (smaller than the dots), the least-squares line, and residuals.' }),
    steps: [
      { label: 'Power', text: t`$P = VI = (12.0)(4.20) = 50.4$ W: 50.4 joules into the block every second.` },
      { label: 'Specific heat', text: t`$c = \dfrac{VI}{m\,b} = \dfrac{50.4}{(1.000)(${EX.f.b.toFixed(5)})} = ${EX.q.value.toFixed(0)}$ J/(kg·K).` },
      { label: 'Budget', text: t`Relative uncertainties: slope ${EX.pct[0].toFixed(2)}% (Type A, from the fit); voltage $0.1/12.0$ = ${EX.pct[1].toFixed(2)}%, current $0.02/4.20$ = ${EX.pct[2].toFixed(2)}%, mass ${EX.pct[3].toFixed(2)}% (Type B, from the specifications). In quadrature: $\sqrt{${EX.pct[0].toFixed(2)}^2 + ${EX.pct[1].toFixed(2)}^2 + ${EX.pct[2].toFixed(2)}^2 + ${EX.pct[3].toFixed(2)}^2}$ = ${EX.tot.toFixed(2)}%, so $\sigma_c = ${EX.q.sigma.toFixed(0)}$ J/(kg·K).` },
      { label: 'Dominant term', text: t`The voltmeter: its ${EX.pct[1].toFixed(2)}% alone is most of the total. A hundred more temperature readings would shrink only the ${EX.pct[0].toFixed(2)}%; a better voltmeter is what would help.` },
      { label: 'Compare', text: t`$${pmTeX(EX.q.value, EX.q.sigma)}$ against aluminium’s 897: ${EX.q.z.toFixed(1)}σ apart — consistent. Even lagged, the block leaks a little, which nudges $c$ up by about 1%: inside the error bar, but a bias, not scatter.` },
    ],
    answer: t`$c = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{J/(kg·K)}`)}$, ${EX.q.z.toFixed(1)}σ from aluminium’s 897. The voltmeter’s ±0.1 V dominates the uncertainty; the fit contributes little.`,
  },
  practice: [
    num({
      id: 'two-point', difficulty: 1,
      gen(r) {
        const t1 = r.pick([240, 360, 480, 600]);
        const [T0, T1] = B.makeData('heater', { seed: r.int(1, 999999), settings: [0, t1] }).rows.map((q) => q.R[0]);
        const c = (P * t1) / (T1 - T0);
        return {
          prompt: t`The heater runs at 12.0 V and 4.20 A. The 1.000 kg block reads ${T0.toFixed(1)} °C at switch-on and ${T1.toFixed(1)} °C after ${t1} s. Estimate $c$ from these two readings alone.`,
          answer: c, units: 'J/(kg K)', tol: { rel: 0.005 },
          errors: [{ value: P / (T1 - T0), feedback: t`Multiply by the time: the energy delivered is $VIt$, not $VI$.` }, { value: (P * t1) / T1, feedback: t`Use the temperature *rise*, $T - T_0$, not the final temperature.` }],
          hints: [t`Energy in: $VI\,t$. It warms the block: $mc\,(T - T_0)$.`],
          teach: 'The electrical energy VIt, divided by m(T − T₀), gives c from any two readings — but a fit uses all of them.',
          explain: t`$c = \dfrac{VI\,t}{m\,(T - T_0)} = \dfrac{(50.4)(${t1})}{(1.000)(${(T1 - T0).toFixed(1)})} = ${c.toFixed(0)}$ J/(kg·K). Two readings rounded to 0.1 °C leave this uncertain by about ${((100 * 0.08) / (T1 - T0)).toFixed(1)}% from the thermometer alone; the fit to all six does better.`,
          visual: apparatus('heater', { at: t1, data: [[t1, T1]] }, `The block after ${t1} s, with the power supply’s meters and the thermometer. Not to scale.`),
        };
      },
    }),
    num({
      id: 'c-from-slope', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 0.75, 1.25, 1.5]);
        const { rows, an } = heat(r, null, { m });
        const b = +an.series[0].fit.b.toFixed(5);
        return {
          prompt: t`A ${m.toFixed(3)} kg aluminium block is heated at 12.0 V and 4.20 A. The fitted slope of $T$ against $t$ is $${b.toFixed(5)}$ K/s. What is $c$?`,
          answer: P / (m * b), units: 'J/(kg K)', tol: { rel: 0.003 },
          errors: [{ value: P / b, feedback: t`Divide by the mass too: $c$ is per kilogram.` }, { value: (P * b) / m, feedback: t`Invert: the slope is $VI/(mc)$, so $c = VI/(m \times \text{slope})$.` }],
          hints: [t`$T = T_0 + \dfrac{VI}{mc}\,t$: the slope is $VI/(mc)$.`],
          teach: 'The slope of T against t is VI/(mc), so c = VI/(m × slope).',
          explain: t`$c = \dfrac{50.4}{(${m.toFixed(3)})(${b.toFixed(5)})} = ${(P / (m * b)).toFixed(0)}$ J/(kg·K).`,
          visual: plot('heater', rows, { params: { m }, caption: `T against t for the ${m.toFixed(3)} kg block, with the least-squares line.` }),
        };
      },
    }),
    num({
      id: 'budget', difficulty: 2,
      gen(r) {
        const sV = r.pick([0.05, 0.1, 0.2]), sI = r.pick([0.01, 0.02, 0.05]);
        const pct = [EX.pct[0], (100 * sV) / V, (100 * sI) / I, 0.1].map((x) => +x.toFixed(2));
        const ans = Math.hypot(...pct), lin = pct.reduce((s, x) => s + x, 0), big = Math.max(...pct);
        const errors = [{ value: lin, feedback: 'Independent uncertainties add in quadrature — the square root of the sum of squares — not straight.' }];
        if (Math.abs(big - ans) / ans > 0.05) errors.push({ value: big, feedback: 'The largest term dominates, but the others still add (in quadrature).' });
        return {
          prompt: t`Your uncertainty budget for $c$: slope ${pct[0].toFixed(2)}%, voltmeter ${pct[1].toFixed(2)}% (±${sV} V on 12.0 V), ammeter ${pct[2].toFixed(2)}% (±${sI} A on 4.20 A), balance ${pct[3].toFixed(2)}%. What is the relative uncertainty of $c$, in percent?`,
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors,
          hints: [t`For a product or quotient, relative uncertainties add in quadrature: $\dfrac{\sigma_c}{c} = \sqrt{\sum_i \left(\dfrac{\sigma_i}{x_i}\right)^2}$.`],
          teach: 'For c = VI/(mb), the relative uncertainties of V, I, m and the slope add in quadrature.',
          explain: t`$\sqrt{${pct.map((x) => `${x.toFixed(2)}^2`).join(' + ')}}$ = ${ans.toFixed(2)}%. The biggest term, ${big.toFixed(2)}%, sets most of it.`,
          visual: budget([{ label: 'slope (Type A)', pct: pct[0] }, { label: 'voltmeter (Type B)', pct: pct[1] }, { label: 'ammeter (Type B)', pct: pct[2] }, { label: 'balance (Type B)', pct: pct[3] }], 'The four sources of uncertainty. Combining them is your job.', { total: false }),
        };
      },
    }),
    mcq({
      id: 'dominant', difficulty: 2,
      prompt: t`Here is the uncertainty budget for the worked example’s $c$. Which single upgrade would shrink $\sigma_c$ the most?`,
      choices: ['A voltmeter good to ±0.02 V', 'Twice as many temperature readings', 'A balance good to ±0.1 g', 'A thermometer that reads to 0.01 °C'],
      answer: 0,
      why: {
        1: t`More readings shrink only the fit’s ${EX.pct[0].toFixed(2)}%, and only by $\sqrt2$: the total would barely move, from ${EX.tot.toFixed(2)}% to ${Math.hypot(EX.pct[0] / Math.SQRT2, EX.pct[1], EX.pct[2], EX.pct[3]).toFixed(2)}%.`,
        2: t`The mass term is already the smallest, ${EX.pct[3].toFixed(2)}%: even removing it entirely leaves ${Math.hypot(EX.pct[0], EX.pct[1], EX.pct[2]).toFixed(2)}%.`,
        3: 'Thermometer resolution feeds only the fit term, already the second smallest. The meters dominate.',
      },
      hints: ['Which bar is longest?', 'Quadrature sums are ruled by their largest term: shrinking a small one barely helps.'],
      teach: 'Improve the dominant term of the budget: in quadrature, shrinking the small terms barely changes the total.',
      explain: t`The voltmeter’s ${EX.pct[1].toFixed(2)}% dominates. At ±0.02 V it becomes ${((100 * 0.02) / V).toFixed(2)}%, and the total falls from ${EX.tot.toFixed(2)}% to ${Math.hypot(EX.pct[0], (100 * 0.02) / V, EX.pct[2], EX.pct[3]).toFixed(2)}% — the ammeter is then the largest term. No amount of extra readings could do that.`,
      visual: budget(EX_TERMS, 'The uncertainty budget for c: each source’s relative uncertainty, and their quadrature sum (gold).'),
    }),
    mcq({
      id: 'report', difficulty: 1,
      prompt: t`The calculation gives $c = 905.0337$ J/(kg·K) with $\sigma_c = 8.9471$ J/(kg·K). How should you report it?`,
      choices: [
        t`$c = 905.0 \pm 8.9$ J/(kg·K)`,
        t`$c = 905.0337 \pm 8.9471$ J/(kg·K): keep every digit the calculation gives`,
        t`$c = 905.03 \pm 9$ J/(kg·K)`,
        t`$c = 905$ J/(kg·K): the digits show the precision`,
      ],
      answer: 0,
      why: {
        1: 'Digits beyond the uncertainty are noise: the hundredths of 905.0337 mean nothing when the value is uncertain by 9. More significant figures are not more accuracy.',
        2: 'The value’s last digit should sit where the uncertainty’s does: 905.0 ± 8.9, or 905 ± 9 — not hundredths against units.',
        3: 'Without a stated uncertainty the result cannot be compared with anything, and implied precision is ambiguous: is 905 good to 1, or to 10?',
      },
      hints: ['Round the uncertainty to one or two significant figures first.', 'Then round the value to the same decimal place.'],
      teach: 'Round σ to one or two significant figures, then the value to the same decimal place — and always state σ.',
      explain: t`$\sigma_c = 8.9471 \to 8.9$ (two figures; $9$ with one is equally right), so the value is rounded to tenths: $905.0 \pm 8.9$ J/(kg·K), or $905 \pm 9$. Either says the same thing; what matters is that nothing finer than the uncertainty is claimed.`,
      visual: budget(EX_TERMS, 'Where the 8.9 comes from: the uncertainty budget for c.'),
    }),
    mcq({
      id: 'leak-residuals', difficulty: 2,
      prompt: t`Without its lagging, the block’s $T$–$t$ plot still looks straight at a glance, but the fit has $\chi^2/\text{dof} = ${BARE.f.chi2r.toFixed(0)}$ and the residuals form an arch. What is happening?`,
      choices: [
        'Heat leaks to the room faster as the block warms, so the heating slows: the line bends over, its fitted slope is too low, and c comes out too high',
        'The thermometer is noisy: enlarge the error bars until χ²/dof is 1',
        'The heater’s power is rising during the run',
        'Nothing to worry about: χ²/dof only says the error bars are a little small',
      ],
      answer: 0,
      why: {
        1: 'Noise scatters the points both ways at random; this is a smooth arch, the same shape on every run. Inflating the error bars would hide a real effect.',
        2: 'Rising power would make the heating speed up, bending the curve upward. This one bends down.',
        3: t`$\chi^2/\text{dof} = ${BARE.f.chi2r.toFixed(0)}$ means the residuals are about ${Math.round(Math.sqrt(BARE.f.chi2r))} times the error bars: the straight-line model is wrong, not the error bars.`,
      },
      hints: ['Look at the residual panel: random, or a pattern?', t`Newton’s law of cooling: the loss rate grows with $T - T_0$.`],
      teach: 'Residuals with a smooth pattern and χ²/dof ≫ 1 say the model is wrong — here heat is leaking — and the slope is biased, whatever its error bar says.',
      explain: t`The leak grows with $T - T_0$, so each minute warms the block less than the one before. A straight line through a curve that bends over has too small a slope: here $c = ${BARE.q.value.toFixed(0)}$ J/(kg·K), ${((100 * (BARE.q.value - C_AL)) / C_AL).toFixed(0)}% above 897 — and its small error bar, ±${BARE.q.sigma.toFixed(0)}, is no protection.`,
      visual: plot('heater', BARE.rows, { sys: true, residuals: true, caption: 'The bare block: T against t with the least-squares line, and the residuals.' }),
    }),
    code({
      id: 'leak-correct', difficulty: 3,
      gen(r) {
        const rows = B.makeData('heater', { seed: r.int(1, 999999), sys: 'leak' }).rows;
        const ts = rows.map((q) => q.s), Ts = rows.map((q) => +q.R[0].toFixed(1));
        const rate = [], ex = [];
        for (let i = 0; i < ts.length - 1; i++) { rate.push((Ts[i + 1] - Ts[i]) / (ts[i + 1] - ts[i])); ex.push((Ts[i] + Ts[i + 1]) / 2 - 20.0); }
        const g = B.fitLine(ex, rate), c = P / g.a;
        const naive = B.analyse('heater', rows, { sys: 'leak' }).results[0].value;
        const data = t`import numpy as np

t = np.array([${ts.join(', ')}])                # s
T = np.array([${Ts.map((x) => x.toFixed(1)).join(', ')}])     # °C, the bare block; the room is at 20.0 °C
P, m = 12.0 * 4.20, 1.000                     # W, kg
`;
        return {
          prompt: t`The leak makes the heating rate fall in a straight line as the block warms: $\dfrac{dT}{dt} = \dfrac{P}{mc} - \dfrac{T - T_0}{\tau}$. So find the rate between successive readings (\`np.diff\`), fit it against the excess temperature $T - 20.0$ at each interval’s midpoint, and set \`c\` from the intercept — the rate with no leak.`,
          starter: t`${data}
rate = None     # K/s between successive readings
excess = None   # midpoint temperature minus 20.0
c = 0.0
print(c)
`,
          answer: t`${data}
rate = np.diff(T) / np.diff(t)
excess = (T[:-1] + T[1:]) / 2 - 20.0
slope, intercept = np.polyfit(excess, rate, 1)
c = P / (m * intercept)
print(f"c = {c:.0f} J/(kg K); leak time constant {-1 / slope:.0f} s")
`,
          tests: [{ name: `c from the zero-excess rate (${c.toFixed(0)} J/(kg·K))`, code: `abs(c - ${c}) < 1e-6 * ${c}` }],
          hints: [t`\`rate = np.diff(T) / np.diff(t)\` and \`excess = (T[:-1] + T[1:]) / 2 - 20.0\`.`, t`\`slope, intercept = np.polyfit(excess, rate, 1)\`, then \`c = P / (m * intercept)\`.`],
          teach: 'Plotting the heating rate against the excess temperature makes the leak a straight line; its intercept is the rate with no leak.',
          explain: t`The rate falls from ${rate[0].toFixed(4)} to ${rate[rate.length - 1].toFixed(4)} K/s as the block warms. Extrapolated to zero excess it is ${g.a.toFixed(5)} K/s, so $c = ${c.toFixed(0)}$ J/(kg·K) — against ${naive.toFixed(0)} from a straight line through $T$ against $t$, and 897 in the tables. The slope gives the leak’s time constant, about ${(-1 / g.b).toFixed(0)} s.`,
          visual: plot('heater', rows, { sys: true, fit: false, caption: 'The bare block’s readings: your program fits their rate of rise.' }),
        };
      },
    }),
    num({
      id: 'lag-bias', difficulty: 2,
      gen(r) {
        const L = r.pick([300, 600, 900, 1200]);
        const f = L / 60000;
        return {
          prompt: t`Even lagged, the block leaks a little: $\tau = 30\,000$ s. For a straight-line fit to readings spread evenly over a run of length $L$, the slope comes out low by the fraction $L/2\tau$. After a ${L} s run, by what percentage is $c$ too high?`,
          answer: 100 * f, units: '%', tol: { rel: 0.03 },
          errors: [{ value: 200 * f, feedback: t`The fraction is $L/2\tau$, half of $L/\tau$: the fit averages over the run.` }],
          hints: [t`$c = VI/(m \times \text{slope})$: a slope low by a small fraction makes $c$ high by about the same fraction.`],
          teach: 'Lagging slows a heat leak but does not stop it: over a run of length L it biases c high by about L/2τ, growing with the run.',
          explain: t`$L/2\tau = ${L}/60\,000 = ${(100 * f).toFixed(2)}$%, so $c$ is about ${(100 * f).toFixed(1)}% high. For the 600 s runs here that is 1% — the size of the whole uncertainty budget, and always in the same direction. A shorter run shrinks it, at the price of fewer readings.`,
          visual: plot('heater', EX.rows, { expected: true, caption: 'The lagged run (gold) against the line with no leak at all (dashed): the leak hides in plain sight.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-battery', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([8, 12, 16]), c0 = r.pick([950, 1000, 1050]), Vb = r.pick([24, 48]), Ib = r.pick([5, 10]);
        const Pb = Vb * Ib, rateS = sf(Pb / (m * c0), 3), rate = +rateS, c = Pb / (m * rate);
        const tau = 3600, tmax = 1800, r4 = (x) => +x.toPrecision(5);
        const top = 20 + rate * tmax;
        return {
          prompt: t`Battery engineers measure a module’s heat capacity the same way. A ${m}.0 kg module in an insulated box has a built-in heater, run at ${Vb}.0 V and ${Ib}.0 A. At the start, while the module is still at room temperature, it warms at ${rateS} K/s. What is its average specific heat?`,
          answer: c, units: 'J/(kg K)', tol: { rel: 0.01 },
          errors: [{ value: Pb / rate, feedback: 'That is the whole module’s heat capacity, in J/K. Divide by its mass for J/(kg·K).' }, { value: Vb / (m * rate), feedback: 'The heater’s power is V × I.' }],
          hints: [t`At room temperature nothing leaks yet, so all the power warms the module: $VI = mc\,\dfrac{dT}{dt}$.`, t`$c = \dfrac{VI}{m\,(dT/dt)}$.`],
          teach: 'The heating rate at the start, before any leak builds up, gives c = VI/(m dT/dt) for any object.',
          explain: t`$c = \dfrac{(${Vb})(${Ib})}{(${m})(${rateS})} = ${c.toFixed(0)}$ J/(kg·K) — typical of lithium-ion cells, which run about 800–1100 J/(kg·K). Taking the rate at the start, before the module is warmer than the room, keeps the leak out.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, tmax], y: [18, r4(20 + 1.08 * (top - 20))], xlabel: 't (s)', ylabel: 'T (°C)',
              alt: 'The module’s temperature rising and bending over as heat leaks, with the straight tangent at the start',
              curves: [
                { fn: `20 + ${r4(rate * tau)}*(1 - exp(-x/${tau}))`, color: 'accent', label: 'T(t)', labelAt: r4(0.8 * tmax), labelDy: 18 },
                { fn: `20 + ${r4(rate)}*x`, color: 'gold', dash: true, label: 'initial slope', labelAt: r4(0.55 * tmax), labelDx: -10, labelDy: -14, labelAlign: 'right' },
              ],
              hlines: [{ y: 20, label: 'room, 20 °C', color: 'ink3' }],
            },
            caption: 'As the module warms it starts to leak heat and the curve bends over; the slope at the very start is the leak-free rate.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-symmetric', difficulty: 3,
      prompt: 'To make heat exchange with the room cancel out over a run, a classic trick is to start the block below room temperature. Where should the run start and stop?',
      choices: [
        'As far below room temperature at the start as it will be above it at the end: it gains heat from the room early and loses about as much late',
        'As far below room temperature as possible: a cold block cannot leak',
        'At room temperature: then there is no leak',
        'It does not matter: heat leaks average out over any run',
      ],
      answer: 0,
      why: {
        1: 'A cold block leaks too — inward. Heat flows from the room into it, so the heater seems more effective and c comes out low.',
        2: 'Only at the first moment. As the block warms above the room it loses heat, faster and faster, all one way.',
        3: 'Leaks in one direction add up. They cancel only if the block spends as long, as far below room temperature as above it.',
      },
      hints: ['By Newton’s law of cooling the heat flow is proportional to the block’s temperature difference from the room — and its sign follows that difference.', 'What run makes the differences add up to zero?'],
      teach: 'Heat exchange with the room follows the block’s temperature difference from the room in sign as well as size: a run symmetric about room temperature cancels it.',
      explain: 'Below room temperature the block gains heat from the room; above, it loses heat. Starting as far below as it will finish above, with steady heating so the times match, makes the gain and the loss nearly equal — the error cancels instead of being fought.',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 600], y: [0, 40], xlabel: 't (s)', ylabel: 'T (°C)',
          alt: 'A block heated from 5 °C to 35 °C, crossing room temperature, 20 °C, halfway',
          curves: [{ fn: '5 + 0.05*x', color: 'accent' }],
          hlines: [{ y: 20, label: 'room, 20 °C', color: 'good' }],
          points: [
            { x: 10, y: 20, r: 0.01, color: 'violet', label: 'below the room: gains heat', labelDx: 4, labelDy: 18 },
            { x: 10, y: 20, r: 0.01, color: 'warn', label: 'above the room: loses heat', labelDx: 4, labelDy: -14 },
          ],
        },
        caption: 'A run that starts 15 °C below room temperature and ends 15 °C above it.',
      },
    }),
    num({
      id: 'cp-fittings', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 0.75, 1.5, 2]), Cx = r.pick([20, 30, 45]);
        return {
          prompt: t`The heater and the thermometer sit inside the block and warm with it; together their heat capacity is ${Cx} J/K, which $c = VI/(mb)$ ignores. By how much does that make $c$ too high for a ${m.toFixed(3)} kg block, in J/(kg·K)?`,
          answer: Cx / m, units: 'J/(kg K)', tol: { rel: 0.01 },
          errors: [{ value: Cx, feedback: 'Per kilogram of block: divide the fittings’ heat capacity by the block’s mass.' }, { value: Cx * m, feedback: 'Divide by the mass, do not multiply.' }],
          hints: [t`All the power warms block and fittings together: $VI = (mc + C_x)\,b$, with $C_x$ the fittings’ heat capacity.`],
          teach: 'Anything that warms along with the sample adds its heat capacity C: c = VI/(mb) overestimates by C/m.',
          explain: t`$VI = (mc + C_x)\,b$, so $\dfrac{VI}{mb} = c + \dfrac{C_x}{m} = c + ${(Cx / m).toFixed(1)}$ J/(kg·K) — ${((100 * Cx) / m / C_AL).toFixed(1)}% of aluminium’s 897, as big as the whole uncertainty budget or bigger. A real calorimeter measures this correction and subtracts it.`,
          visual: apparatus('heater', { params: { m } }, 'The heater and the thermometer sit inside the block, and warm with it.'),
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 3 (propagation of uncertainties)'),
    SOURCES.gum,
    { label: 'OpenStax University Physics Vol. 2, §1.4 Heat Transfer, Specific Heat, and Calorimetry', url: 'https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry' },
    SOURCES.polyfit,
    SOURCES.aapt,
  ],
});
