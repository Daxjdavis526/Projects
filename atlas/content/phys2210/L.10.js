// Lab 10 (virtual): the pendulum period — T² against L, with g from the
// slope; a length measured to the wrong point that only moves the intercept
// (unless the fit is forced through the origin); an amplitude effect that no
// straight-line fit can reveal; and np.polyfit on T² against L.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from './_lab.js';

const t = String.raw;
const G = 9.8, K = 4 * Math.PI ** 2;

// the worked example: six lengths, measured to the top of the bob (seed 62)
const EX = (() => {
  const rows = B.makeData('pendulum', { seed: 62, sys: 'knot' }).rows;
  const an = B.analyse('pendulum', rows, { sys: 'knot' });
  const o = B.analyse('pendulum', rows, { sys: 'knot', origin: true });
  const f = an.series[0].fit, q = an.results[0];
  const dL = f.a / f.b, sdL = dL * Math.hypot(f.sa / f.a, f.sb / f.b);
  return { rows, f, q, o: o.results[0], dL, sdL, r3: rows[2] };
})();

// one seeded run; `ok` can reject runs whose fit would read oddly in a prompt
const swings = (r, sys = null, params = {}, ok = () => true) => {
  for (let k = 0; ; k++) {
    const rows = B.makeData('pendulum', { seed: r.int(1, 999999), sys, params }).rows;
    const an = B.analyse('pendulum', rows, { sys, params });
    if (k > 40 || ok(an)) return { rows, an };
  }
};

export default lesson({
  id: 'phys2210.L.10',
  title: 'The pendulum period',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A small heavy bob hangs from a string whose length you set; for each length you time ten small swings with a stopwatch. The bench computes each time with realistic reaction scatter — the same ±0.05 s per timing as in the first lab.

For small swings the period is $T = 2\pi\sqrt{L/g}$. Square it, and the law becomes a straight line through the origin:

$$T^2 = \frac{4\pi^2}{g}\,L$$

Plot $T^2$ against $L$, fit, and $g = 4\pi^2/\text{slope}$. The intercept is a free check: anything other than zero means the lengths are offset — and keeping it free keeps that offset out of $g$. (Lab skills trained: linearizing a law, and separating a systematic offset from the result.)`,
  symbols: [
    { tex: 'T', text: 'the period of one full swing, in s: the stopwatch time for ten swings, $t_{10}$, divided by 10' },
    { tex: 'L', text: 'the length from the pivot to the centre of the bob, in m' },
    { tex: 'g', text: 'the free-fall acceleration, 9.80 m/s² at this bench' },
    { tex: '4\\pi^2/g', text: 'the slope of $T^2$ against $L$, in s²/m: about 4.03 s²/m on Earth' },
    { tex: '\\theta_0', text: 'the amplitude — how far the bob is pulled aside. The formula assumes it is small; at 40° the real period is about 3% longer' },
  ],
  why: 'Pendulums were the world’s most precise clocks for three centuries and the standard way to map g across the Earth — the gravity data that first showed our planet is not a perfect sphere.',
  visual: {
    type: 'lab-bench',
    title: 'Time ten swings at six lengths',
    lead: t`Six lengths are in the table, with the time for ten swings at each. Choose the axes: $T^2$ against $L$ should be a straight line through the origin.`,
    tasks: [
      'On T² against L the points line up through the origin; the readout gives g = 4π²/slope, close to 9.80 m/s².',
      'Turn on the length error (lengths measured to the top of the bob): the line rises by about 0.1 s², but its slope — and g — stay put.',
      'Switch to ln T against ln L: a straight line of slope ½, the power in T ∝ √L.',
    ],
    params: { exp: 'pendulum', seed: 33 },
  },
  example: {
    prompt: t`Six lengths and the time for ten swings at each are in the table. A least-squares fit of $T^2$ against $L$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{s}^2/\text{m}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{s}^2`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. Find $g$, and explain the intercept.`,
    visual: plot('pendulum', EX.rows, { sys: true, table: true, residuals: true, caption: 'T² against L with ±1σ error bars, the least-squares line, and residuals.' }),
    steps: [
      { label: 'One point', text: t`At $L = ${EX.r3.s.toFixed(2)}$ m, $t_{10} = ${EX.r3.R[0].toFixed(2)}$ s, so $T = ${(EX.r3.R[0] / 10).toFixed(3)}$ s and $T^2 = ${((EX.r3.R[0] / 10) ** 2).toFixed(3)}\ \text{s}^2$. Its error bar: $\sigma_{T^2} = 2T\sigma_T = 2(${(EX.r3.R[0] / 10).toFixed(3)})(0.005) = ${(2 * (EX.r3.R[0] / 10) * 0.005).toFixed(3)}\ \text{s}^2$.` },
      { label: 'Free-fall acceleration', text: t`$g = \dfrac{4\pi^2}{\text{slope}} = \dfrac{39.48}{${EX.f.b.toFixed(4)}} = ${EX.q.value.toFixed(3)}\ \text{m/s}^2$, with $\sigma_g = g\,\sigma_b/b = ${EX.q.sigma.toFixed(3)}$: $g = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{m/s}^2`)}$, right on 9.80.` },
      { label: 'The intercept', text: t`$${EX.f.a.toFixed(3)} \pm ${EX.f.sa.toFixed(3)}\ \text{s}^2$ — about ${Math.round(EX.f.a / EX.f.sa)} standard errors from zero, so the lengths are offset. If $T^2 = \text{slope}\times(L + \Delta L)$, then $\Delta L = \text{intercept}/\text{slope} = ${EX.dL.toFixed(4)}$ m, uncertain by about ${EX.sdL.toFixed(4)} m: the 2.5 cm radius of the bob. The lengths were measured to the top of the bob, not its centre.` },
      { label: 'Keep it free', text: t`Forcing the line through the origin would have given $g = ${EX.o.value.toFixed(2)}\ \text{m/s}^2$ — ${((G - EX.o.value) / EX.q.sigma).toFixed(0)} standard errors too low. The free intercept absorbed the offset harmlessly.` },
      { label: 'Sense check', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$ and the residuals show no curve, so the swings were small enough for the formula: no sign of an amplitude effect.` },
    ],
    answer: t`$g = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{m/s}^2`)}$; the intercept reveals a ${(100 * EX.dL).toFixed(1)} cm offset in the lengths (measured to the top of the bob), which the free fit kept out of $g$.`,
  },
  practice: [
    num({
      id: 'T-squared', difficulty: 1,
      gen(r) {
        const L = r.pick([0.4, 0.6, 0.8, 1.0, 1.2]);
        const row = B.makeData('pendulum', { seed: r.int(1, 999999), settings: [L] }).rows[0];
        const T = row.R[0] / 10;
        return {
          prompt: t`At $L = ${L.toFixed(2)}$ m the stopwatch reads $t_{10} = ${row.R[0].toFixed(2)}$ s for ten swings. What value of $T^2$ goes on the plot?`,
          answer: T * T, units: 's^2', tol: { rel: 0.003 },
          errors: [{ value: T, feedback: t`That is $T$. The plot needs its square.` }, { value: row.R[0] ** 2 / 10, feedback: t`Divide by 10 *before* squaring: $T = t_{10}/10$, then $T^2$.` }],
          hints: [t`$T = t_{10}/10$, then square.`],
          teach: 'Ten swings timed together give the period as t₁₀/10; the plot needs T².',
          explain: t`$T = ${row.R[0].toFixed(2)}/10 = ${T.toFixed(3)}$ s, so $T^2 = ${(T * T).toFixed(3)}\ \text{s}^2$.`,
          visual: apparatus('pendulum', { at: L, data: [[L, row.R[0]]] }, `The pendulum at L = ${L.toFixed(2)} m and the stopwatch reading. Not to scale.`),
        };
      },
    }),
    num({
      id: 'g-from-slope', difficulty: 2,
      gen(r) {
        const { rows, an } = swings(r);
        const b = +an.series[0].fit.b.toFixed(3);
        return {
          prompt: t`The least-squares slope of $T^2$ against $L$ is $${b.toFixed(3)}\ \text{s}^2/\text{m}$. What is $g$?`,
          answer: K / b, units: 'm/s^2', tol: { rel: 0.002 },
          errors: [{ value: b * K, feedback: t`Invert: slope $= 4\pi^2/g$, so $g = 4\pi^2/\text{slope}$.` }, { value: (2 * Math.PI) / b, feedback: t`The slope of $T^2$ carries $(2\pi)^2 = 4\pi^2$, not $2\pi$.` }],
          hints: [t`$T^2 = \dfrac{4\pi^2}{g}L$: the slope is $4\pi^2/g$.`],
          teach: 'The slope of T² against L is 4π²/g, so g = 4π²/slope.',
          explain: t`$g = 39.478/${b.toFixed(3)} = ${(K / b).toFixed(3)}\ \text{m/s}^2$.`,
          visual: plot('pendulum', rows, { caption: 'T² against L with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'offset', difficulty: 3,
      gen(r) {
        const { rows, an } = swings(r, 'knot');
        const f = an.series[0].fit;
        const b = +f.b.toFixed(3), a = +f.a.toFixed(3);
        return {
          prompt: t`A fit of $T^2$ against $L$ gives slope $${b.toFixed(3)}\ \text{s}^2/\text{m}$ and intercept $${a.toFixed(3)}\ \text{s}^2$. If the recorded lengths are all short by the same amount $\Delta L$, how large is $\Delta L$, in cm?`,
          answer: (100 * a) / b, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: 100 * a, feedback: t`The intercept is in s², not metres: divide by the slope to turn it into a length.` }, { value: 100 * a * b, feedback: t`Divide by the slope: $T^2 = b(L + \Delta L)$ means intercept $= b\,\Delta L$.` }],
          hints: [t`If the true length is $L + \Delta L$: $T^2 = b(L + \Delta L) = bL + b\,\Delta L$.`, t`So the intercept is $b\,\Delta L$: $\Delta L = \text{intercept}/\text{slope}$.`],
          teach: 'An offset in the horizontal variable appears as an intercept equal to slope × offset.',
          explain: t`$\Delta L = ${a.toFixed(3)}/${b.toFixed(3)} = ${(a / b).toFixed(4)}$ m $= ${((100 * a) / b).toFixed(1)}$ cm — about the radius of the bob: the lengths were measured to its top, not its centre.`,
          visual: plot('pendulum', rows, { sys: true, caption: 'T² against L with the least-squares line. Where does it cross L = 0?' }),
        };
      },
    }),
    mcq({
      id: 'amplitude', difficulty: 2,
      gen(r) {
        const { rows, an } = swings(r, 'amplitude', {}, (a) => a.series[0].fit.chi2r > 0.4 && a.series[0].fit.chi2r < 1.8);
        const q = an.results[0];
        return {
          prompt: t`A group released their pendulum at 40° every time. Their $T^2$–$L$ plot is a fine straight line through the origin ($\chi^2/\text{dof} = ${an.series[0].fit.chi2r.toFixed(2)}$), but gives $g = ${pmTeX(q.value, q.sigma, t`\text{m/s}^2`)}$. Why is it low?`,
          choices: [
            t`At 40° the period is about 3% longer than $2\pi\sqrt{L/g}$, at every length: $T^2$ is about 6% too large everywhere, the slope too steep, and $g$ too low — with nothing in the fit to show it`,
            t`The bob’s mass was too large`,
            'Random scatter: more lengths would fix it',
            t`$T^2$ is not proportional to $L$ for a pendulum`,
          ],
          answer: 0,
          why: {
            1: t`The period does not depend on the bob’s mass — mass cancels in the pendulum’s equation of motion.`,
            2: t`The bias is the same at every length; more lengths shrink the error bar on the same wrong slope.`,
            3: t`For small swings it is — that is exactly the formula. The trouble is that 40° is not small.`,
          },
          hints: [t`The formula uses $\sin\theta \approx \theta$. Is that good at 40° (0.70 rad)?`, 'If every T is longer by the same factor, what happens to the line on T²–L axes?'],
          teach: 'A systematic error that scales every point by the same factor changes the slope but leaves the line straight and through the origin — invisible to the fit.',
          explain: t`At 40° the restoring force $mg\sin\theta$ falls behind $mg\theta$, so the swing is slower: about 3% at 40°. Every $T^2$ grows by 6%, the slope too, so $g = 4\pi^2/\text{slope}$ comes out about 6% low. Test for it by timing one length at several amplitudes.`,
          visual: plot('pendulum', rows, { sysKind: 'amplitude', sys: true, expected: true, caption: 'T² against L for 40° swings (gold), against the small-angle line for g = 9.80 (dashed).' }),
        };
      },
    }),
    mcq({
      id: 'forced', difficulty: 2,
      prompt: t`With lengths measured to the top of the bob, a student forces the $T^2$–$L$ line through the origin. Compared with the true value, the $g$ from that fit is:`,
      choices: ['Too low: the forced line must tilt steeper to reach points that sit above it', 'Too high', 'Unchanged: forcing the origin only removes the intercept', 'Unpredictable: it varies at random'],
      answer: 0,
      why: {
        1: t`Steeper slope means larger $4\pi^2/g$, which means *smaller* $g$.`,
        2: 'With no intercept, the slope is the line’s only freedom, so the offset ends up in the slope.',
        3: 'The bias always has the same sign as the offset: here the points sit above the origin line, every time.',
      },
      hints: [t`The data follow $T^2 = b(L + \Delta L)$ with $\Delta L > 0$. Where do they sit relative to the line $T^2 = bL$?`, t`A steeper slope $4\pi^2/g$ means a smaller $g$.`],
      teach: 'Forcing a line through the origin when the data are offset pushes the offset into the slope — and into the result.',
      explain: t`For the worked example: free fit $g = ${EX.q.value.toFixed(2)}$, forced fit $g = ${EX.o.value.toFixed(2)}\ \text{m/s}^2$. The free intercept is the cheap insurance.`,
      visual: plot('pendulum', EX.rows, { sys: true, origin: true, caption: 'The free fit (gold) and the fit forced through the origin (dashed).' }),
    }),
    num({
      id: 'sigma-g', difficulty: 2,
      gen(r) {
        const { rows, an } = swings(r);
        const f = an.series[0].fit;
        const b = +f.b.toFixed(3), sbS = f.sb.toPrecision(2), sb = +sbS, g = K / b;
        return {
          prompt: t`The slope is $${b.toFixed(3)} \pm ${sbS}\ \text{s}^2/\text{m}$, so $g = ${g.toFixed(3)}\ \text{m/s}^2$. What is $\sigma_g$?`,
          answer: +(g * sb / b).toPrecision(3), units: 'm/s^2', tol: { rel: 0.03 },
          errors: [{ value: sb, feedback: t`That is the slope’s uncertainty in s²/m. Since $g \propto 1/\text{slope}$, the *relative* uncertainty carries over: $\sigma_g = g\,\sigma_b/b$.` }, { value: (2 * g * sb) / b, feedback: t`$g \propto b^{-1}$ — the power is 1, not 2.` }],
          hints: [t`For $g = 4\pi^2 b^{-1}$: $\sigma_g/g = \sigma_b/b$.`],
          teach: 'A reciprocal keeps the relative uncertainty of the quantity it inverts.',
          explain: t`$\sigma_g = ${g.toFixed(3)}\times${sbS}/${b.toFixed(3)} = ${(g * sb / b).toFixed(3)}\ \text{m/s}^2$ — about ${(100 * sb / b).toFixed(1)}%, from ten-swing timings.`,
          visual: plot('pendulum', rows, { caption: 'T² against L with the least-squares line.' }),
        };
      },
    }),
    code({
      id: 'polyfit-g', difficulty: 2,
      gen(r) {
        const { rows } = swings(r, 'knot');
        const Ls = rows.map((q) => q.s), t10 = rows.map((q) => q.R[0]);
        const f = B.fitLine(Ls, t10.map((x) => (x / 10) ** 2));
        const data = t`import numpy as np

L = np.array([${Ls.map((v) => v.toFixed(2)).join(', ')}])          # m, measured to the top of the bob
t10 = np.array([${t10.map((v) => v.toFixed(2)).join(', ')}])   # s, ten swings
`;
        return {
          prompt: t`Fit $T^2$ against $L$ with \`np.polyfit\` and set \`g\` from the slope. Then set \`dL\` to the length offset, intercept ÷ slope, in metres.`,
          starter: t`${data}
T = t10 / 10
# fit T**2 against L; then set g and dL
g = 0.0
dL = 0.0
print(g, dL)
`,
          answer: t`${data}
T = t10 / 10
slope, intercept = np.polyfit(L, T**2, 1)
g = 4 * np.pi**2 / slope
dL = intercept / slope
print(f"g = {g:.3f} m/s², length offset = {100 * dL:.1f} cm")
`,
          tests: [
            { name: `g is 4π²/slope (${(K / f.b).toFixed(3)} m/s²)`, code: `abs(g - ${K / f.b}) < 1e-6` },
            { name: `dL is intercept/slope (${(100 * f.a / f.b).toFixed(1)} cm)`, code: `abs(dL - ${f.a / f.b}) < 1e-9` },
          ],
          hints: [t`\`slope, intercept = np.polyfit(L, T**2, 1)\`.`, t`\`g = 4 * np.pi**2 / slope\` and \`dL = intercept / slope\`.`],
          teach: 'np.polyfit on the linearized data gives g from the slope and a length offset from the intercept.',
          explain: t`$g = ${(K / f.b).toFixed(3)}\ \text{m/s}^2$ and the offset is ${(100 * f.a / f.b).toFixed(1)} cm — the bob’s radius, since these lengths were measured to its top.`,
          visual: plot('pendulum', rows, { sys: true, fit: false, caption: 'The data your program fits.' }),
        };
      },
    }),
    num({
      id: 'power', difficulty: 2,
      gen(r) {
        const rows = B.makeData('pendulum', { seed: r.int(1, 999999), settings: [0.3, 1.2] }).rows;
        const [T1, T2] = rows.map((q) => q.R[0] / 10);
        const n = Math.log(T2 / T1) / Math.log(4);
        return {
          prompt: t`Without assuming the formula, find the power $n$ in $T \propto L^n$ from two lengths: $T = ${T1.toFixed(3)}$ s at $L = 0.30$ m and $T = ${T2.toFixed(3)}$ s at $L = 1.20$ m.`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: T2 / T1, feedback: t`That is the ratio of periods. The power is the ratio of the logarithms: $n = \ln(T_2/T_1)/\ln(L_2/L_1)$.` }, { value: (T2 - T1) / 0.9, feedback: 'That is the slope on ordinary axes. Use logarithms.' }],
          hints: [t`$n = \dfrac{\ln(T_2/T_1)}{\ln(L_2/L_1)}$, and $L_2/L_1 = 4$.`],
          teach: 'The log–log slope between two well-separated points measures a power law’s exponent.',
          explain: t`$n = \ln(${(T2 / T1).toFixed(4)})/\ln 4 = ${n.toFixed(3)}$ — one half: $T \propto \sqrt L$.`,
          visual: plot('pendulum', B.makeData('pendulum', { seed: 33 }).rows, { axes: 'loglog', fit: false, caption: 'ln T against ln L for a full set of lengths.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars-clock', difficulty: 3, transfer: true,
      gen(r) {
        const [planet, g] = r.pick([['Mars', 3.71], ['the Moon', 1.62], ['Titan', 1.35]]);
        const T = r.pick([1.0, 2.0]);
        const L = (g * T * T) / K;
        return {
          prompt: t`A future habitat on ${planet} ($g = ${g}\ \text{m/s}^2$) wants a pendulum that ticks with period $T = ${T.toFixed(1)}$ s. How long must it be?`,
          answer: L, units: 'm', tol: { rel: 0.004 },
          errors: [{ value: (9.8 * T * T) / K, feedback: `That is the length on Earth. Use ${planet}’s g.` }, { value: (g * T) / (2 * Math.PI), feedback: t`Square the period: $L = gT^2/4\pi^2$.` }],
          hints: [t`Rearrange $T = 2\pi\sqrt{L/g}$ for $L$.`, t`$L = gT^2/4\pi^2$.`],
          teach: 'The pendulum law works on any world: L = gT²/(4π²).',
          explain: t`$L = ${g}\times${T.toFixed(1)}^2/39.48 = ${L.toFixed(3)}$ m — ${(L / ((9.8 * T * T) / K)).toFixed(2)} of the Earth length, because gravity there is weaker.`,
          visual: (() => {
            const Le = (9.8 * T * T) / K, r4 = (x) => +x.toFixed(4);
            return {
              type: 'graph',
              params: {
                aspect: 'wide', x: [0, r4(1.4 * Le)], y: [0, r4(1.6 * T * T)], xlabel: 'L (m)', ylabel: 'T² (s²)',
                alt: `T squared against L for a pendulum on Earth and on ${planet}`,
                curves: [
                  { fn: `${r4(K / 9.8)}*x`, color: 'accent', label: 'Earth, g = 9.80', labelAt: r4(0.55 * Le), labelDy: 18 },
                  { fn: `${r4(K / g)}*x`, color: 'gold', label: `${planet[0].toUpperCase()}${planet.slice(1)}, g = ${g}`, labelAt: r4((1.25 * T * T * g) / K), labelDx: 10, labelDy: 4 },
                ],
                hlines: [{ y: T * T, label: `T² = ${(T * T).toFixed(2)} s²`, color: 'good' }],
              },
              caption: `T² = 4π²L/g: the weaker the gravity, the steeper the line — and the shorter the pendulum that gives the same period.`,
            };
          })(),
        };
      },
    }),
    mcq({
      id: 'cp-amplitude-test', difficulty: 2,
      prompt: 'You suspect your swings are too wide for the small-angle formula. What test settles it?',
      choices: [
        'Time the same length at several amplitudes: if T grows with amplitude, extrapolate back to small swings or use smaller ones',
        'Fit T² against L again with more lengths',
        'Check that χ²/dof is near 1',
        'Use a heavier bob',
      ],
      answer: 0,
      why: {
        1: 'A too-wide swing lengthens every period by nearly the same factor, so the T²–L line stays straight: more lengths cannot reveal it.',
        2: 'The fit stays good: the error scales all points alike.',
        3: 'The period does not depend on the bob’s mass, at any amplitude.',
      },
      hints: ['Vary the suspected cause and hold everything else fixed.'],
      teach: 'To test for a suspected systematic, vary the suspected cause on purpose.',
      explain: 'Hold L fixed and time 5°, 10°, 20° and 30° swings. A real amplitude effect shows as T rising roughly as 1 + θ₀²/16; below about 10° it is under 0.2%.',
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 60], y: [0.99, 1.08], xlabel: 'amplitude θ₀ (°)', ylabel: 'T ÷ T(small)', curves: [{ fn: '1 + (x*pi/180)^2/16 + 11*(x*pi/180)^4/3072', color: 'accent', domain: [0, 60] }], points: [5, 10, 20, 30, 40].map((a) => ({ x: a, y: +B.amplitudeFactor((a * Math.PI) / 180).toFixed(5), r: 4, color: 'gold' })) }, caption: 'The exact period of a pendulum relative to the small-angle formula, against amplitude.' },
    }),
    num({
      id: 'cp-predict', difficulty: 2,
      gen(r) {
        const { an } = swings(r, 'knot');
        const f = an.series[0].fit;
        const b = +f.b.toFixed(3), a = +f.a.toFixed(3), L = r.pick([0.45, 0.65, 1.05, 1.45]);
        const T = Math.sqrt(a + b * L);
        return {
          prompt: t`The fit (lengths measured the same way as before) is $T^2 = ${a.toFixed(3)} + ${b.toFixed(3)}L$, in s² with $L$ in m. Predict the period at a recorded length of ${L.toFixed(2)} m.`,
          answer: T, units: 's', tol: { rel: 0.003 },
          errors: [{ value: Math.sqrt(b * L), feedback: 'Keep the intercept: it carries the length offset, which is present at every length.' }, { value: a + b * L, feedback: t`That is $T^2$. Take the square root.` }],
          hints: [t`Evaluate the fitted line at $L = ${L.toFixed(2)}$ m, then take the square root.`],
          teach: 'A fitted line predicts with both its parameters; drop the intercept only if it is zero.',
          explain: t`$T = \sqrt{${a.toFixed(3)} + ${b.toFixed(3)}\times${L.toFixed(2)}} = ${T.toFixed(3)}$ s.`,
          visual: apparatus('pendulum', { at: L, sys: true }, `The pendulum at a recorded length of ${L.toFixed(2)} m. Not to scale.`),
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 8 (least squares) and ch. 3'),
    SOURCES.openstax('15.4', '15-4-pendulums', 'Pendulums'),
    SOURCES.polyfit,
    SOURCES.aapt,
  ],
});
