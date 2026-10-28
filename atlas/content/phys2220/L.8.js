// Lab 8 of PHYS 2225 (virtual): standing waves on a string driven by a
// vibrator. The resonances f_n = n·v/2L lie on a straight line against n,
// whose slope gives the wave speed v; f² against the tension at three loops
// is a straight line whose slope gives the mass per unit length μ. The
// systematic is an elastic string: stretched, its μ is less than the slack
// value weighed on the bench, so v disagrees with √(T/μ) while f against n
// stays perfectly straight — and the second method, f² against T, bends.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';
import { run, apart } from './_lab2225.js';

const t = String.raw;
const P0 = B.EXPERIMENTS.string.defaults;
const L0 = P0.L, T0 = P0.M * P0.g, MU0 = P0.mu, V0 = Math.sqrt(T0 / MU0);

// the worked example: the elastic string, f against n (seed 23)
const EX = (() => {
  const rows = B.makeData('string', { seed: 23, sys: 'stretch' }).rows;
  const an = B.analyse('string', rows, { sys: 'stretch' });
  const f = an.series[0].fit, q = an.results[0];
  const T = B.analyse('string-T', B.makeData('string-T', { seed: 23, sys: 'stretch' }).rows, { sys: 'stretch' });
  return { rows, f, q, T, muEff: (T0 / q.value ** 2) * 1e3 };
})();

/** A string's n-th mode as a graph: the two extremes of the shape, the nodes optional. */
function mode({ n, nodes = false, caption, label = true }) {
  const pts = nodes ? Array.from({ length: n + 1 }, (_, k) => ({ x: +(k / n).toFixed(4), y: 0, r: 4, color: 'warn' })) : [];
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-0.05, 1.05], y: [-1.4, 1.4], xlabel: 'position along the string (fraction of L)', ylabel: ' ', yticks: 0.001,
      curves: [{ fn: `sin(${n}*pi*x)`, domain: [0, 1], color: 'accent', width: 2.4, ...(label ? { label: `${n} loop${n > 1 ? 's' : ''}`, labelAt: 0.5 / n, labelDy: -14 } : {}) }, { fn: `-sin(${n}*pi*x)`, domain: [0, 1], color: 'accent', width: 1.6, dash: true }],
      hlines: [{ y: 0, color: 'ink4' }], points: pts,
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.L.8',
  title: 'Standing waves on a string',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A string runs from a mechanical vibrator, driven by a signal generator, over a pulley to a hanging mass that sets its tension. At most frequencies the string barely moves; at certain ones it swings in large, steady **loops** — a standing wave. You tune for each resonance and read the frequency. The bench computes each reading with realistic scatter.

A resonance fits a whole number $n$ of half-wavelengths between the vibrator and the pulley, and the waves travel at a speed set by the tension and the string’s mass per unit length:

$$f_n = \frac{n\,v}{2L}, \qquad v = \sqrt{\frac{T}{\mu}}$$

So $f$ against $n$ is a straight line of slope $v/2L$; and at a fixed $n$, $f^2$ against $T$ is a straight line of slope $n^2/(4L^2\mu)$. (Lab skills trained: two independent methods for the same physics, and using one to test the other.)`,
  symbols: [
    { tex: 'f_n', text: 'the frequency of the resonance with $n$ loops, in Hz' },
    { tex: 'n', text: 'the number of loops (half-wavelengths) between the vibrator and the pulley' },
    { tex: 'v', text: 'the speed of waves along the string, in m/s' },
    { tex: 'L', text: 'the vibrating length, from the vibrator to the top of the pulley: 1.200 m' },
    { tex: 'T', text: 'the tension, in N: the hanging mass times $g$ (0.500 kg gives 4.90 N)' },
    { tex: '\\mu', text: 'the string’s mass per unit length, in kg/m: weighed slack, 1.30 g/m' },
  ],
  why: 'Every guitar, piano and violin is tuned by f = (n/2L)√(T/μ) — and so are the cables that stay launch towers and antennas, whose resonances the wind can excite.',
  visual: {
    type: 'lab-bench',
    title: 'Tune the vibrator, count the loops',
    lead: t`Eight resonances, from one loop to eight, are in the table. The plot shows $f$ against $n$ with the least-squares line; the readout turns the slope into $v = 2L\times\text{slope}$ and compares it with $\sqrt{T/\mu}$ for the slack string’s $\mu$. The Method switch changes to $f^2$ against $T$ at three loops.`,
    tasks: [
      'f against n is a straight line through the origin: every resonance is a whole-number multiple of the fundamental, about 25.6 Hz, and v comes out at 61.4 m/s.',
      'Turn on the systematic (an elastic string): the line stays perfectly straight, but v rises to 62.6 m/s, about 8σ from √(T/μ). Nothing in this plot says why.',
      'Switch the Method to f² against T, systematic still on: now the points bend upward and the residuals arch — μ is falling as the tension stretches the string.',
    ],
    params: { exp: ['string', 'string-T'], seed: 25, residuals: true },
  },
  example: {
    prompt: t`With 0.500 kg hanging ($T = 4.90$ N), the eight resonances are in the table, each to about ±(0.15 Hz + 0.2%). A weighted fit of $f$ against $n$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{Hz}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{Hz}`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. The vibrating length is 1.200 m, and the slack string weighs 1.30 g/m. Find the wave speed and compare it with $\sqrt{T/\mu}$.`,
    visual: plot('string', EX.rows, { sys: true, table: true, residuals: true, expected: true, caption: 'f against n with ±1σ error bars, the least-squares line (gold) and, dashed, the line √(T/μ) predicts for the slack string’s μ.' }),
    steps: [
      { label: 'Check the fit', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$, residuals without a pattern, intercept consistent with zero: every resonance is a whole-number multiple of one fundamental, as $f_n = nv/2L$ says.` },
      { label: 'Wave speed', text: t`The slope is $v/2L$, so $v = 2L\times\text{slope} = 2(1.200)(${EX.f.b.toFixed(3)}) = ${EX.q.value.toFixed(2)}$ m/s; with the slope’s uncertainty and $L$’s ±2 mm, $v = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{m/s}`)}$.` },
      { label: 'Predict', text: t`$\sqrt{T/\mu} = \sqrt{4.90\ \text{N}/(1.30\times10^{-3}\ \text{kg/m})} = ${V0.toFixed(2)}$ m/s. The measurement is ${EX.q.z.toFixed(1)}σ higher: not chance.` },
      { label: 'Suspects', text: t`A vibrator end that is not quite a node would make the effective length longer than 1.200 m — and $v = 2L\times\text{slope}$ too *low*, the wrong way. A generator dial reading 2% high would fit. So would a string lighter than 1.30 g/m *while stretched*: $v^2 = T/\mu$ gives $\mu = T/v^2 = ${EX.muEff.toFixed(3)}$ g/m, 4% less.` },
      { label: 'Second method', text: t`Hanging different masses and tuning for three loops, $f^2$ against $T$ should be straight with slope $9/(4L^2\mu)$. It is not: the residuals arch, $\chi^2/\text{dof} = ${EX.T.series[0].fit.chi2r.toFixed(1)}$, because $\mu$ falls as $T$ rises — the string stretches. A dial error would scale every $f$ and keep that line straight. The culprit is the stretch.` },
      { label: 'Sense check', text: t`A stretch of 4% spreads the same mass over 4% more length, so $\mu$ falls 4% and $v = \sqrt{T/\mu}$ rises by about 2% — exactly the gap. Weigh, or mark and measure, the string *under tension*.` },
    ],
    answer: t`$v = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{m/s}`)}$, ${EX.q.z.toFixed(1)}σ above $\sqrt{T/\mu} = ${V0.toFixed(1)}$ m/s for the slack $\mu$. The string stretches under tension (shown by the curved $f^2$–$T$ plot), so its $\mu$ is really about ${EX.muEff.toFixed(2)} g/m.`,
  },
  practice: [
    num({
      id: 'v-from-slope', difficulty: 1,
      gen(r) {
        const { rows, f } = run(r, 'string');
        const b = +f.b.toFixed(3);
        return {
          prompt: t`The least-squares slope of the resonant frequency against the number of loops is $${b.toFixed(3)}$ Hz per loop, on a string 1.200 m long. What is the wave speed?`,
          answer: 2 * L0 * b, units: 'm/s', tol: { rel: 0.002 },
          errors: [{ value: L0 * b, feedback: t`One loop is half a wavelength: $f_1 = v/2L$, so $v = 2L\times\text{slope}$.` }],
          hints: [t`$f_n = n\,v/2L$: the slope is $v/2L$.`],
          teach: 'The slope of f against n is the fundamental frequency v/2L.',
          explain: t`$v = 2(1.200\ \text{m})(${b.toFixed(3)}\ \text{Hz}) = ${(2 * L0 * b).toFixed(2)}$ m/s.`,
          visual: plot('string', rows, { caption: 'f against n with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'predict-f', difficulty: 1,
      gen(r) {
        const M = r.pick([0.2, 0.3, 0.8]), n = r.pick([1, 2, 3]);
        const T = M * P0.g, f = (n / (2 * L0)) * Math.sqrt(T / MU0);
        return {
          prompt: t`With ${M.toFixed(1)} kg hanging (hanger included), at what frequency should the string — 1.200 m long, 1.30 g/m — show ${n} loop${n > 1 ? 's' : ''}? Take $g = 9.80\ \text{m/s}^2$.`,
          answer: f, units: 'Hz', tol: { rel: 0.004 },
          errors: apart([
            { value: (n / (2 * L0)) * Math.sqrt(M / MU0), feedback: t`The tension is the hanging *weight*, $Mg$ in newtons, not the mass.` },
            { value: (n / L0) * Math.sqrt(T / MU0), feedback: t`$n$ loops is $n$ *half*-wavelengths: $\lambda = 2L/n$, so $f = nv/2L$.` },
          ], f),
          hints: [t`$v = \sqrt{T/\mu}$ with $T = Mg$ and $\mu$ in kg/m.`, t`$f_n = n v/(2L)$.`],
          teach: 'Tension and mass per length set the speed, the length and loop count set the wavelength, and f = v/λ.',
          explain: t`$T = ${M.toFixed(1)}\times9.80 = ${T.toFixed(2)}$ N, $v = \sqrt{${T.toFixed(2)}/0.00130} = ${Math.sqrt(T / MU0).toFixed(1)}$ m/s, $f_{${n}} = ${n}(${Math.sqrt(T / MU0).toFixed(1)})/2.400 = ${f.toFixed(1)}$ Hz.`,
          visual: apparatus('string-T', { at: M }, `The string under ${M.toFixed(1)} kg, drawn with three loops. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'four-times-T', difficulty: 2,
      prompt: 'At one frequency the string shows four loops. You quadruple the hanging mass and keep the frequency. How many loops now?',
      choices: ['Two', 'Eight', 'One', 'Still four'],
      answer: 0,
      why: {
        1: t`More tension makes the waves *faster*, so at the same frequency the wavelength is *longer* — fewer loops, not more.`,
        2: t`The speed goes as $\sqrt{T}$, not $T$: four times the tension doubles $v$, which halves the loop count rather than quartering it.`,
        3: t`The loop count is set by the wavelength $\lambda = v/f$, and $v$ depends on the tension.`,
      },
      hints: [t`$v = \sqrt{T/\mu}$: what does quadrupling $T$ do to $v$?`, t`At fixed $f$, $\lambda = v/f$, and the number of loops is $2L/\lambda$.`],
      teach: 'At a fixed frequency the loop count is 2Lf/v: quadrupling the tension doubles v and halves the loops.',
      explain: t`$v \propto \sqrt T$, so $v$ doubles and $\lambda = v/f$ doubles: only $2L/\lambda = 2$ loops fit. (If the new count were not a whole number, the string would not resonate at all at that frequency.)`,
      visual: mode({ n: 4, caption: 'The string at the start: four loops between the vibrator (left) and the pulley (right). Amplitude exaggerated.' }),
    }),
    mcq({
      id: 'amplitude', difficulty: 2,
      prompt: 'You turn up the vibrator’s amplitude so that the string swings twice as wide. What happens to the resonant frequencies?',
      choices: [
        'Nothing: they depend on the length, the tension and μ, not on how hard the string is driven',
        'They double',
        'They rise a little, because a wider swing means faster waves',
        'They fall, because a wider swing takes longer',
      ],
      answer: 0,
      why: {
        1: t`The frequencies $f_n = (n/2L)\sqrt{T/\mu}$ contain no amplitude at all.`,
        2: 'For small swings the wave speed is set by tension and μ alone. (Very large swings do stretch the string and raise T slightly — a real but tiny effect here.)',
        3: 'A wider swing is covered at a higher speed: the time for a cycle stays the same, just as for a pendulum swinging a few degrees.',
      },
      hints: [t`Look for the amplitude in $f_n = (n/2L)\sqrt{T/\mu}$.`],
      teach: 'Resonant frequencies are set by the string, not by how hard it is driven: a harder push makes bigger loops at the same frequencies.',
      explain: 'The drive amplitude sets how big the loops get, not where the resonances are. That is why a guitar string sounds the same note whether plucked softly or hard.',
      visual: mode({ n: 3, caption: 'The string resonating with three loops. Amplitude exaggerated.' }),
    }),
    num({
      id: 'mu-from-f2T', difficulty: 2,
      gen(r) {
        const { rows, f } = run(r, 'string-T');
        const b = +f.b.toPrecision(4), mu = (9 / (4 * L0 * L0 * b)) * 1e3;
        return {
          prompt: t`At three loops on the 1.200 m string, a fit of $f^2$ against $T$ has slope $${b.toPrecision(4)}\ \text{Hz}^2/\text{N}$. What mass per unit length does that give, in g/m?`,
          answer: mu, units: 'g/m', tol: { rel: 0.003 },
          errors: apart([{ value: mu / 9, feedback: t`Square the loop count: $f^2 = n^2T/(4L^2\mu)$ with $n = 3$, so $n^2 = 9$.` }, { value: mu * 4, feedback: t`$f = nv/2L$, so $f^2 = n^2T/(4L^2\mu)$ — the 4 comes from squaring the 2.` }], mu),
          hints: [t`$f_3^2 = \dfrac{9\,T}{4L^2\mu}$: the slope is $9/(4L^2\mu)$.`, t`So $\mu = 9/(4L^2\times\text{slope})$.`],
          teach: 'At a fixed loop count, f² is proportional to T, with slope n²/(4L²μ).',
          explain: t`$\mu = \dfrac{9}{4(1.200)^2(${b.toPrecision(4)})} = ${(mu / 1e3).toFixed(6)}$ kg/m $= ${mu.toFixed(3)}$ g/m.`,
          visual: plot('string-T', rows, { caption: 'f² against T at three loops, with the least-squares line.' }),
        };
      },
    }),
    mcq({
      id: 'which-test', difficulty: 3,
      ...(() => {
        const rows = B.makeData('string-T', { seed: 41, sys: 'stretch' }).rows;
        return {
          prompt: t`Your $f$-against-$n$ fit is perfect, but $v$ is 2% above $\sqrt{T/\mu}$. Either the string stretches under tension (so its $\mu$ is less than the slack value), or the generator’s dial reads 2% high. Which observation would point to the stretching?`,
          choices: [
            t`$f^2$ against $T$ at three loops curves upward instead of being straight`,
            t`$f$ against $n$ passes through the origin`,
            t`$f$ against $n$ is a straight line`,
            'The loops look sharp and steady at each resonance',
          ],
          answer: 0,
          why: {
            1: 'A dial error scales every frequency by the same factor: the line through the origin stays a line through the origin. Both suspects predict it.',
            2: 'Both suspects keep f proportional to n at a fixed tension, so both give a straight line.',
            3: 'Sharp resonances say the string is lightly damped; they say nothing about μ or the dial.',
          },
          hints: ['What does each suspect do when you change the tension?', t`Stretching grows with tension, so $\mu$ changes along the series; a dial error is the same factor everywhere.`],
          teach: 'Two suspects with the same fingerprint in one experiment can differ in another: vary the quantity only one of them depends on.',
          explain: t`If the string stretches more under more tension, $\mu$ falls as $T$ rises, so $f^2 = 9T/(4L^2\mu)$ grows faster than $T$: the plot bends upward. A miscalibrated dial multiplies every $f^2$ by the same 1.04 and keeps the line straight. Here it bends — the string stretches.`,
          visual: plot('string-T', rows, { sys: true, residuals: true, caption: 'f² against T at three loops, the least-squares line and its residuals.' }),
        };
      })(),
    }),
    num({
      id: 'stretched', difficulty: 2,
      gen(r) {
        const s = r.pick([1.030, 1.040, 1.050]), mu0 = r.pick([1.30, 1.50]);
        const mu = mu0 / s, v = Math.sqrt(T0 / (mu * 1e-3));
        return {
          prompt: t`Two ink marks 1.000 m apart on the slack string are ${s.toFixed(3)} m apart once it carries 4.90 N. The slack string weighs ${mu0.toFixed(2)} g/m. What wave speed should the stretched string have?`,
          answer: v, units: 'm/s', tol: { rel: 0.003 },
          errors: apart([{ value: Math.sqrt(T0 / (mu0 * 1e-3)), feedback: 'That uses the slack string’s μ. The same mass now spreads over more length, so μ is smaller.' }, { value: Math.sqrt(T0 / (mu0 * s * 1e-3)), feedback: 'Stretching spreads the mass out: divide μ by the stretch factor, do not multiply.' }], v, 0.006),
          hints: [t`The mass between the marks is unchanged, so $\mu_{\text{stretched}} = \mu_{\text{slack}}/${s.toFixed(3)}$.`, t`$v = \sqrt{T/\mu_{\text{stretched}}}$.`],
          teach: 'Stretching spreads a string’s mass over more length: μ falls by the stretch factor and v rises by its square root.',
          explain: t`$\mu = ${mu0.toFixed(2)}/${s.toFixed(3)} = ${mu.toFixed(3)}$ g/m, so $v = \sqrt{4.90/(${(mu / 1e3).toFixed(6)})} = ${v.toFixed(1)}$ m/s — ${(100 * (Math.sqrt(s) - 1)).toFixed(1)}% faster than the slack-string prediction.`,
          visual: apparatus('string', { sys: true, at: 3 }, 'The elastic string under 4.90 N (amber). Not to scale.'),
        };
      },
    }),
    code({
      id: 'fit-string', difficulty: 2,
      gen(r) {
        const rows = B.makeData('string', { seed: r.int(1, 999999), sys: r.bool() ? 'stretch' : null }).rows;
        const ns = rows.map((q) => q.s), fs = rows.map((q) => q.R[0]);
        const g = B.fitLine(ns, fs), v = 2 * L0 * g.b, mu = (T0 / v ** 2) * 1e3;
        const data = t`import numpy as np

n = np.array([${ns.join(', ')}])   # loops
f = np.array([${fs.map((v1) => v1.toFixed(1)).join(', ')}])   # Hz
L, T = 1.200, 4.90                 # m, N
`;
        return {
          prompt: t`Fit $f$ against $n$ with \`np.polyfit\`. Set \`v\` to the wave speed in m/s, and \`mu\` to the mass per unit length the string must have under this tension, in g/m.`,
          starter: t`${data}
v = 0.0
mu = 0.0
print(v, mu)
`,
          answer: t`${data}
slope, intercept = np.polyfit(n, f, 1)
v = 2 * L * slope
mu = T / v**2 * 1000      # kg/m to g/m
print(f"v = {v:.2f} m/s, mu = {mu:.3f} g/m")
`,
          tests: [
            { name: t`\`v\` is 2L × slope (${v.toFixed(2)} m/s)`, code: `abs(v - ${v}) < 1e-6 * ${v}` },
            { name: t`\`mu\` is T/v² in g/m (${mu.toFixed(3)} g/m)`, code: `abs(mu - ${mu}) < 1e-6 * ${mu}` },
          ],
          hints: [t`\`slope, intercept = np.polyfit(n, f, 1)\`; the slope is $v/2L$.`, t`\`v = 2 * L * slope\`, then \`mu = T / v**2 * 1000\`.`],
          teach: 'The slope of f against n gives v; with the tension known, v gives the μ the string really has under tension.',
          explain: t`$v = ${v.toFixed(2)}$ m/s, so the string under 4.90 N has $\mu = ${mu.toFixed(3)}$ g/m — ${Math.abs(mu - 1.3) < 0.02 ? 'the slack string’s 1.30 g/m: this string does not stretch' : 'less than the slack string’s 1.30 g/m: this string stretches under tension'}.`,
          visual: plot('string', rows, { fit: false, caption: 'The resonances your program fits.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-guy-cable', difficulty: 3, transfer: true,
      gen(r) {
        const Lc = r.pick([30, 40, 55]), mu = r.pick([0.8, 1.2, 1.6]), TkN = r.pick([20, 30, 45]);
        const f1 = (1 / (2 * Lc)) * Math.sqrt((TkN * 1e3) / mu);
        return {
          prompt: t`A steel guy cable steadying the lightning mast of a launch pad is ${Lc} m long between its anchors, weighs ${mu.toFixed(1)} kg per metre and is tensioned to ${TkN} kN. Wind blowing across it sheds vortices at a frequency that can lock onto one of its modes. What is its fundamental frequency?`,
          answer: f1, units: 'Hz', tol: { rel: 0.005 },
          errors: apart([{ value: (1 / Lc) * Math.sqrt((TkN * 1e3) / mu), feedback: t`The fundamental is one loop — half a wavelength: $\lambda = 2L$, so $f_1 = v/2L$.` }, { value: (1 / (2 * Lc)) * Math.sqrt(TkN / mu), feedback: 'Convert the tension to newtons: 1 kN = 1000 N.' }], f1),
          hints: [t`$v = \sqrt{T/\mu}$ with $T$ in newtons.`, t`$f_1 = v/(2L)$.`],
          teach: t`Any taut cable, from a guitar string to a guy line, has modes at $f_n = (n/2L)\sqrt{T/\mu}$.`,
          explain: t`$v = \sqrt{${TkN * 1000}/${mu.toFixed(1)}} = ${Math.sqrt((TkN * 1e3) / mu).toFixed(1)}$ m/s, so $f_1 = ${Math.sqrt((TkN * 1e3) / mu).toFixed(1)}/(2\times${Lc}) = ${f1.toFixed(2)}$ Hz, with higher modes at whole-number multiples. Engineers add dampers or adjust the tension so that no mode sits where the wind drives it.`,
          visual: mode({ n: 1, caption: 'The cable’s fundamental mode: one loop between its anchors. Amplitude exaggerated; the cable’s sag is not drawn.' }),
        };
      },
    }),
    num({
      id: 'cp-nodes', difficulty: 1,
      gen(r) {
        const n = r.pick([5, 6, 7, 9]);
        return {
          prompt: t`The string resonates with ${n} loops. How many nodes does it have, counting the two ends?`,
          answer: n + 1, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n, feedback: 'Nodes sit at both ends of every loop: one more node than loops.' }, { value: n - 1, feedback: 'That counts only the nodes between the ends. The vibrator end and the pulley end are nodes too.' }],
          hints: ['Draw it: where are the points that never move?'],
          teach: 'n loops have n + 1 nodes, counting the fixed ends.',
          explain: t`${n} loops have ${n + 1} nodes: ${n - 1} between them and one at each end. (Counting nodes instead of loops by mistake would shift every $n$ by one — the slope of $f$ against $n$ would survive, but the intercept would not be zero.)`,
          visual: mode({ n: 3, nodes: true, caption: 'For comparison: three loops and their four nodes (amber), ends included.' }),
        };
      },
    }),
    num({
      id: 'cp-mass-for', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 4, 5]), f = r.pick([80, 100, 120]);
        const T = MU0 * (2 * L0 * f / n) ** 2, M = T / P0.g;
        return {
          prompt: t`What hanging mass (hanger included) makes the 1.200 m string of 1.30 g/m resonate with ${n} loops at ${f} Hz? Take $g = 9.80\ \text{m/s}^2$.`,
          answer: M, units: 'kg', tol: { rel: 0.005 },
          errors: apart([{ value: T, feedback: t`That is the tension in newtons. The mass is $T/g$.` }, { value: MU0 * (L0 * f / n) ** 2 / P0.g, feedback: t`$n$ loops means $\lambda = 2L/n$, so $v = f\lambda = 2Lf/n$.` }], M),
          hints: [t`The wavelength is $2L/n$, so the speed must be $v = 2Lf/n$.`, t`Then $T = \mu v^2$ and $M = T/g$.`],
          teach: 'Work backwards: the loop count and frequency fix v = 2Lf/n, and T = μv² fixes the tension.',
          explain: t`$v = 2(1.200)(${f})/${n} = ${(2 * L0 * f / n).toFixed(1)}$ m/s, $T = (0.00130)(${(2 * L0 * f / n).toFixed(1)})^2 = ${T.toFixed(2)}$ N, $M = ${T.toFixed(2)}/9.80 = ${M.toFixed(3)}$ kg.`,
          visual: mode({ n, caption: `The ${n}-loop resonance wanted. Amplitude exaggerated.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §16.6 Standing Waves and Resonance', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance' },
    { label: 'OpenStax University Physics Vol. 1, §16.3 Wave Speed on a Stretched String', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-3-wave-speed-on-a-stretched-string' },
    SOURCES.taylor('ch. 8 (least squares)'),
    SOURCES.aapt,
  ],
});
