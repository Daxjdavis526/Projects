// Lab 4 of PHYS 2225 (virtual): the magnetic field of a flat coil, measured
// with a Hall probe. B at the centre against I is a straight line of slope
// μ₀N/2R, which measures μ₀ (with a budget ruled by the probe's calibration
// and the radius); a probe zeroed away from the coil adds a background that
// does not reverse with the current — it sits in the intercept, ruins single
// readings, and cancels in (B₊ − B₋)/2. Along the axis, B plotted against the
// Biot–Savart shape (1 + z²/R²)^(−3/2) is straight, the background again the
// intercept; far out it bends a log–log plot.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';
import { run, apart, budget } from './_lab2225.js';

const t = String.raw;
const P0 = B.EXPERIMENTS.coil.defaults;
const MU0 = B.MU0;
const Bc = (N, R, I) => (MU0 * N * I) / (2 * R);         // T, at the centre

// the worked example: the probe zeroed in the stockroom (seed 9)
const EX = (() => {
  const rows = B.makeData('coil', { seed: 9, sys: 'background' }).rows;
  const an = B.analyse('coil', rows, { sys: 'background' });
  const f = an.series[0].fit, q = an.results[0];
  const pct = q.terms.map((u) => 100 * u.rel);
  const top = rows[rows.length - 1], bot = rows[0];        // +1.5 A and −1.5 A
  const one = (2 * P0.R * top.R[0] * 1e-3) / (P0.N * top.s) * 1e6;
  return { rows, f, q, pct, top, bot, one };
})();

/** The axial profile B(z)/B(0) as a graph, z in units of R. */
const profile = (extra = {}, caption) => ({
  type: 'graph',
  params: { aspect: 'wide', x: [-3, 3], y: [0, 1.15], xlabel: 'z / R', ylabel: 'B / B(0)', curves: [{ fn: '(1 + x^2)^(-1.5)', color: 'accent', width: 2.4 }], ...extra },
  caption,
});

export default lesson({
  id: 'phys2220.L.4',
  title: 'Magnetic field of a coil',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A flat coil of $N = 200$ turns and radius $R = 10.00$ cm carries a current $I$, and a Hall probe — a small semiconductor chip whose voltage is proportional to the field through it — measures the magnetic field on the coil’s axis. The bench computes each reading with realistic noise.

The Biot–Savart law gives the field on the axis, a distance $z$ from the centre:

$$B = \frac{\mu_0 N I}{2R}\left(1 + \frac{z^2}{R^2}\right)^{-3/2}$$

At the centre ($z = 0$) the field is proportional to $I$, so $B$ against $I$ is a straight line of slope $\mu_0 N/2R$, and the slope measures $\mu_0$. (Lab skills trained: fitting with a background field, cancelling it by reversing the current, and linearizing against a predicted shape.)`,
  symbols: [
    { tex: 'B', text: 'the magnetic field along the axis, in tesla (the probe reads millitesla, mT)' },
    { tex: '\\mu_0', text: 'the magnetic constant: $1.25663706127\\times10^{-6}$ N/A² (CODATA 2022)' },
    { tex: 'N', text: 'the number of turns: 200' },
    { tex: 'I', text: 'the current in the coil, in A; negative means the other way round' },
    { tex: 'R', text: 'the coil’s mean radius, $10.00 \\pm 0.05$ cm, its turns treated as one circle' },
    { tex: 'z', text: 'the distance along the axis from the coil’s centre, in m' },
  ],
  why: 'Spacecraft magnetometers are calibrated inside coils like this one, and every magnetic measurement on Earth must first get rid of Earth’s own field — the reversal trick here is how.',
  visual: {
    type: 'lab-bench',
    title: 'Drive the coil, read the Hall probe',
    lead: t`Six readings at currents from −1.5 A to +1.5 A are in the table. The plot shows $B$ against $I$ with the least-squares line; the readout turns the slope into $\mu_0 = 2R \times \text{slope}/N$, its uncertainty including the probe’s 1% calibration and the radius.`,
    tasks: [
      'B against I is a straight line through the origin, and μ₀ comes out at 1.257 μN/A² — the field really is proportional to the current, and reverses with it.',
      'Turn on the systematic (the probe zeroed in the stockroom): every reading rises by 0.040 mT. The line misses the origin, but its slope — and μ₀ — do not change. The intercept is the background field.',
      'Switch to B along the axis: B against z falls steeply, but plotted against u = (1 + z²/R²)^(−3/2) the points fall on a straight line whose slope is the field at the centre.',
    ],
    params: { exp: ['coil', 'coil-axis'], seed: 23, residuals: true },
  },
  example: {
    prompt: t`The probe was zeroed in the stockroom, not at the coil. Readings at six currents are in the table, each uncertain by 0.003 mT. A fit of $B$ against $I$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{mT/A}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{mT}`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. Find $\mu_0$ with its uncertainty (radius $\pm0.05$ cm, probe calibration 1%), and say what the intercept is.`,
    visual: plot('coil', EX.rows, { sys: true, table: true, residuals: true, expected: true, caption: 'B against I with ±1σ error bars (smaller than the dots), the least-squares line (gold) and, dashed, μ₀NI/2R. Residuals below.' }),
    steps: [
      { label: 'Check the fit', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$, residuals without a pattern: $B$ is linear in $I$ for both directions of the current. The line misses the origin by $${EX.f.a.toFixed(3)}$ mT.` },
      { label: 'Magnetic constant', text: t`The slope is $\mu_0N/2R$, so $\mu_0 = 2R \times \text{slope}/N = 2(0.1000\ \text{m})(${EX.f.b.toFixed(4)}\times10^{-3}\ \text{T/A})/200 = ${EX.q.value.toFixed(4)}\times10^{-6}$ N/A². (A T·m/A is a N/A².)` },
      { label: 'Budget', text: t`Fit ${EX.pct[0].toFixed(2)}% (Type A), radius ${EX.pct[1].toFixed(2)}% and probe calibration ${EX.pct[2].toFixed(2)}% (Type B). In quadrature ${Math.hypot(...EX.pct).toFixed(2)}%: $\mu_0 = (${pmTeX(EX.q.value, EX.q.sigma)})\times10^{-6}$ N/A². The calibration dominates; the scatter hardly matters.` },
      { label: 'Compare', text: t`CODATA: $1.25664\times10^{-6}$ N/A². The difference is ${EX.q.z.toFixed(1)}σ — agreement. The background did not spoil it, because it sits in the intercept.` },
      { label: 'The intercept', text: t`With no current the probe still reads $${EX.f.a.toFixed(3)}$ mT = ${(1000 * EX.f.a).toFixed(0)} µT: the field that was not there when it was zeroed — Earth’s (about 50 µT in all, here about 20 µT along the axis) plus the bench’s magnetised steel. It does not reverse when the current does.` },
      { label: 'One reading alone', text: t`$\mu_0$ from the +1.5 A reading alone, $2RB/(NI)$, would be $${EX.one.toFixed(4)}\times10^{-6}$ N/A², ${(100 * (EX.one / 1.25664 - 1)).toFixed(1)}% high. Reverse the current and take half the difference: $(B_+ - B_-)/2 = (${EX.top.R[0].toFixed(3)} - (${EX.bot.R[0].toFixed(3)}))/2 = ${((EX.top.R[0] - EX.bot.R[0]) / 2).toFixed(3)}$ mT — the background cancels.` },
    ],
    answer: t`$\mu_0 = (${pmTeX(EX.q.value, EX.q.sigma)})\times10^{-6}$ N/A², agreeing with CODATA; the $${EX.f.a.toFixed(3)}$ mT intercept is the background field the probe was not zeroed against.`,
  },
  practice: [
    num({
      id: 'mu0-from-slope', difficulty: 1,
      gen(r) {
        const N = r.pick([100, 150, 250, 300]), R = r.pick([0.075, 0.125, 0.150]);
        const { rows, f } = run(r, 'coil', { params: { N, R } });
        const b = +f.b.toFixed(4), mu = ((2 * R * b * 1e-3) / N) * 1e6;
        return {
          prompt: t`A coil of ${N} turns with a mean radius of ${(R * 100).toFixed(1)} cm gives a slope of $${b.toFixed(4)}$ mT/A for $B$ at its centre against $I$. What value of $\mu_0$ does that give?`,
          answer: mu, units: 'μN/A^2', tol: { rel: 0.003 },
          errors: [{ value: mu / 2, feedback: t`The centre field is $\mu_0NI/(2R)$, so $\mu_0 = 2R\times\text{slope}/N$ — keep the 2.` }],
          hints: [t`Match $B = \dfrac{\mu_0N}{2R}\,I$ to $B = \text{slope}\times I$.`, t`$\mu_0 = 2R\times\text{slope}/N$, with the slope in T/A (1 mT/A = $10^{-3}$ T/A).`],
          teach: 'The slope of B against I at a coil’s centre is μ₀N/2R; solve it for μ₀.',
          explain: t`$\mu_0 = \dfrac{2(${R.toFixed(3)})(${b.toFixed(4)}\times10^{-3})}{${N}} = ${mu.toFixed(4)}\times10^{-6}$ N/A² — CODATA’s 1.2566 within the scatter.`,
          visual: plot('coil', rows, { params: { N, R }, caption: 'B at the centre against I, with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'predict-B', difficulty: 1,
      gen(r) {
        const N = r.pick([50, 100, 200, 400]), R = r.pick([0.05, 0.08, 0.10, 0.15]), I = r.pick([0.5, 1.0, 1.5, 2.0]);
        const B0 = Bc(N, R, I) * 1e3;
        return {
          prompt: t`Predict the field at the centre of a flat coil of ${N} turns, radius ${(R * 100).toFixed(0)} cm, carrying ${I.toFixed(1)} A.`,
          answer: B0, units: 'mT', tol: { rel: 0.005 },
          errors: apart([
            { value: (MU0 * N * I) / (2 * Math.PI * R) * 1e3, feedback: t`$\mu_0I/(2\pi r)$ is the field of a long *straight* wire. At the centre of a circular loop every piece of wire is the same distance $R$ away and pushes the same way: $\mu_0 I/(2R)$ per turn.` },
            { value: (MU0 * I) / (2 * R) * 1e3, feedback: 'That is one turn. Every turn adds the same field: multiply by N.' },
          ], B0),
          hints: [t`$B = \dfrac{\mu_0 N I}{2R}$ with $\mu_0 = 1.2566\times10^{-6}$ N/A².`],
          teach: 'Each turn of a flat coil adds μ₀I/2R at the centre: N turns give μ₀NI/2R.',
          explain: t`$B = \dfrac{(1.2566\times10^{-6})(${N})(${I.toFixed(1)})}{2(${R.toFixed(2)})} = ${B0.toFixed(3)}$ mT — ${(B0 * 1000 / 50).toFixed(0)} times Earth’s field.`,
          visual: apparatus('coil', { at: I, params: { N, R } }, `A ${N}-turn coil with the Hall probe at its centre; arrows show the field along the axis. Not to scale.`),
        };
      },
    }),
    num({
      id: 'reverse', difficulty: 2,
      gen(r) {
        const I = r.pick([1.0, 1.5]);
        const rows = B.makeData('coil', { seed: r.int(1, 999999), sys: 'background', settings: [-I, I] }).rows;
        const [Bm, Bp] = rows.map((q) => q.R[0]);
        const bg = ((Bp + Bm) / 2) * 1000;
        return {
          prompt: t`An unzeroed probe at the coil’s centre reads ${Bp.toFixed(3)} mT at $+${I.toFixed(1)}$ A and ${Bm.toFixed(3)} mT at $-${I.toFixed(1)}$ A. What background field, in µT, is it reading along the axis?`,
          answer: bg, units: 'uT', tol: { rel: 0.02, abs: 0.6 },
          errors: [{ value: ((Bp - Bm) / 2) * 1000, feedback: t`Half the *difference* is the coil’s own field, which reverses with the current. The background is what does not reverse: half the *sum*.` }],
          hints: [t`$B_\pm = \pm B_{\text{coil}} + B_{\text{bg}}$.`, t`Add the two readings: the coil’s field cancels and $2B_{\text{bg}}$ is left.`],
          teach: 'Reversing the current reverses the coil’s field but not the background: half the sum is the background, half the difference the coil’s field.',
          explain: t`$B_{\text{bg}} = (B_+ + B_-)/2 = (${Bp.toFixed(3)} + (${Bm.toFixed(3)}))/2 = ${(bg / 1000).toFixed(4)}$ mT ≈ ${bg.toFixed(0)} µT, and the coil gives $(B_+ - B_-)/2 = ${((Bp - Bm) / 2).toFixed(3)}$ mT.`,
          visual: plot('coil', rows, { sys: true, fit: false, caption: 'The two readings, at +I and −I.' }),
        };
      },
    }),
    mcq({
      id: 'intercept', difficulty: 2,
      gen(r) {
        const { rows, f } = run(r, 'coil', { sys: 'background' });
        return {
          prompt: t`Your fit of $B$ against $I$ has intercept $${pmTeX(f.a, f.sa, t`\text{mT}`)}$ — many standard errors from zero. What is it?`,
          choices: [
            'A background field — Earth’s plus the bench’s — that the probe reads at any current and that does not reverse with it',
            'The copper coil’s own permanent magnetism',
            'A fault in the slope that the intercept is compensating',
            'Random scatter in the readings',
          ],
          answer: 0,
          why: {
            1: 'Copper is not magnetic: with no current, the coil makes no field at all.',
            2: 'The slope is set by how B changes with I; a constant added to every reading shifts the line without tilting it.',
            3: t`$${(f.a / f.sa).toFixed(0)}$ standard errors from zero is not scatter.`,
          },
          hints: ['What does the probe read with the current switched off?'],
          teach: 'An intercept that is many σ from zero is a measurement too: here, the field present with no current.',
          explain: t`With $I = 0$ the coil makes no field, so the $${(1000 * f.a).toFixed(0)}$ µT is whatever else is there: Earth’s field (about 20 µT along a north-pointing axis) and magnetised steel nearby. Zero the probe at the coil with the current off, or let the fit carry it in the intercept.`,
          visual: plot('coil', rows, { sys: true, caption: 'B against I with the least-squares line. Where does it cross I = 0?' }),
        };
      },
    }),
    num({
      id: 'single-point', difficulty: 2,
      gen(r) {
        const I = r.pick([0.5, 1.0]);
        const row = B.makeData('coil', { seed: r.int(1, 999999), sys: 'background', settings: [I] }).rows[0];
        const mu = ((2 * P0.R * row.R[0] * 1e-3) / (P0.N * I)) * 1e6;
        return {
          prompt: t`With the unzeroed probe, the reading at $+${I.toFixed(1)}$ A is ${row.R[0].toFixed(3)} mT. What value of $\mu_0$ does this one reading give, from $\mu_0 = 2RB/(NI)$ with $N = 200$ and $R = 0.1000$ m?`,
          answer: mu, units: 'μN/A^2', tol: { rel: 0.003 },
          hints: [t`$\mu_0 = \dfrac{2RB}{NI}$, with $B$ in tesla.`],
          teach: 'A single reading carries any background straight into the answer; the smaller the coil’s field, the worse.',
          explain: t`$\mu_0 = \dfrac{2(0.1000)(${row.R[0].toFixed(3)}\times10^{-3})}{200(${I.toFixed(1)})} = ${mu.toFixed(3)}\times10^{-6}$ N/A² — ${(100 * (mu / 1.25664 - 1)).toFixed(0)}% above CODATA, because 0.040 mT of background rides on a coil field of only ${(1e3 * Bc(200, 0.1, I)).toFixed(3)} mT. The fit over ±1.5 A, or one reversal, removes it.`,
          visual: apparatus('coil', { at: I, sys: true, data: [[I, row.R[0]]] }, 'The probe at the coil’s centre, not zeroed. Not to scale.'),
        };
      },
    }),
    num({
      id: 'axis-shape', difficulty: 2,
      gen(r) {
        const [zr, txt] = r.pick([[1, 'R'], [0.5, 'R/2'], [2, '2R'], [1.5, '1.5R']]);
        const B0 = r.pick([1.2, 1.885, 2.5]);
        const Bz = B0 * (1 + zr * zr) ** -1.5;
        return {
          prompt: t`The field at the coil’s centre is ${B0.toFixed(3)} mT. What is it on the axis at $z = ${txt}$?`,
          answer: Bz, units: 'mT', tol: { rel: 0.005 },
          errors: apart([
            { value: B0 / (1 + zr * zr), feedback: t`The power is $-3/2$: $(1 + z^2/R^2)^{-3/2}$, not $(1 + z^2/R^2)^{-1}$.` },
            { value: B0 / zr ** 3, feedback: t`$(R/z)^3$ is the far-field (dipole) limit, good only for $z \gg R$. Use the full $(1 + z^2/R^2)^{-3/2}$.` },
          ], Bz),
          hints: [t`$B(z) = B(0)\left(1 + z^2/R^2\right)^{-3/2}$.`, t`Here $z^2/R^2 = ${zr * zr}$.`],
          teach: 'Along the axis the field falls as (1 + z²/R²)^(−3/2): gently near the coil, as 1/z³ far away.',
          explain: t`$B = ${B0.toFixed(3)}\times(1 + ${zr * zr})^{-3/2} = ${B0.toFixed(3)}\times${((1 + zr * zr) ** -1.5).toFixed(4)} = ${Bz.toFixed(3)}$ mT.`,
          visual: profile({ points: [{ x: zr, y: 0, r: 4, color: 'violet', label: `z = ${txt}`, labelDy: 14 }] }, 'The field along the axis as a fraction of its centre value, z in units of the radius. Biot–Savart for a single circle.'),
        };
      },
    }),
    mcq({
      id: 'far-bend', difficulty: 3,
      prompt: t`Far from the coil the field should fall as $1/z^3$, like a magnet’s, so $\ln B$ against $\ln z$ should have slope $-3$. Your far-out readings follow that line at first but level off beyond about 30 cm. The probe was zeroed in the stockroom. Why?`,
      choices: [
        'A constant background of about 0.04 mT: once the coil’s field falls to that size, the background dominates and B stops falling',
        'The 1/z³ law fails far from the coil',
        'The Hall probe saturates at small fields',
        'The coil’s turns are spread over a finite width',
      ],
      answer: 0,
      why: {
        1: t`The dipole law gets *better* with distance: it is the far-field limit of $(1 + z^2/R^2)^{-3/2}$.`,
        2: 'A sensor saturates at large fields, not small ones; small fields only get noisier.',
        3: 'The winding’s width matters close to the coil, where the turns are at noticeably different distances — not far away.',
      },
      hints: [t`How big is the coil’s field at $z = 3R$ compared with 0.04 mT?`, 'On a log scale, what does adding a constant do once it is larger than what it is added to?'],
      teach: 'A log–log plot exposes a constant background: the curve flattens where the background overtakes the signal.',
      explain: t`At $z = 30$ cm $= 3R$ the coil gives $1.885\,(1 + 9)^{-3/2} = 0.060$ mT at 1.5 A — comparable to the 0.040 mT background. Beyond that, $\ln(B_{\text{coil}} + B_{\text{bg}})$ flattens toward $\ln B_{\text{bg}}$. Zeroing the probe at the coil, or fitting the background as a parameter, restores the $-3$ slope.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [2.9, 4.2], y: [-5.2, -1.0], xlabel: 'ln(z / 1 cm)', ylabel: 'ln(B / 1 mT)', xticks: 6,
          curves: [
            { fn: 'ln(1.885*(1 + (e^x/10)^2)^(-1.5))', color: 'ink4', dash: true, width: 1.6, label: 'coil alone', labelAt: 4.05, labelDy: 16 },
            { fn: 'ln(1.885*(1 + (e^x/10)^2)^(-1.5) + 0.04)', color: 'accent', width: 2.4, label: 'what the probe reads', labelAt: 3.95, labelDy: -14 },
          ],
          points: [20, 25, 30, 40, 50, 60].map((zz) => ({ x: +Math.log(zz).toFixed(4), y: +Math.log(1.885 * (1 + (zz / 10) ** 2) ** -1.5 + 0.04).toFixed(4), r: 4, color: 'accent' })),
        },
        caption: 'ln B against ln z far from the coil at 1.5 A: the coil’s own field (dashed) and the readings with a 0.040 mT background (dots on the solid curve).',
      },
    }),
    code({
      id: 'fit-shape', difficulty: 3,
      gen(r) {
        const rows = B.makeData('coil-axis', { seed: r.int(1, 999999), sys: 'background' }).rows;
        const zs = rows.map((q) => q.s), Bs = rows.map((q) => q.R[0]);
        const u = zs.map((zz) => (1 + (zz / 10) ** 2) ** -1.5);
        const f = B.fitLine(u, Bs);
        const data = t`import numpy as np

z = np.array([${zs.join(', ')}])   # cm from the centre
B = np.array([${Bs.map((v) => v.toFixed(3)).join(', ')}])   # mT
R = 10.0                             # cm
`;
        return {
          prompt: t`These readings run along the coil’s axis (probe not zeroed). Compute the Biot–Savart shape $u = (1 + z^2/R^2)^{-3/2}$, fit $B$ against $u$ with \`np.polyfit\`, and set \`B_centre\` to the coil’s own field at its centre and \`B_bg\` to the background, both in mT.`,
          starter: t`${data}
B_centre = 0.0
B_bg = 0.0
print(B_centre, B_bg)
`,
          answer: t`${data}
u = (1 + (z / R)**2) ** -1.5
slope, intercept = np.polyfit(u, B, 1)
B_centre = slope
B_bg = intercept
print(f"centre field {B_centre:.3f} mT, background {B_bg:.3f} mT")
`,
          tests: [
            { name: t`\`B_centre\` is the slope against $u$ (${f.b.toFixed(3)} mT)`, code: `abs(B_centre - ${f.b}) < 1e-6` },
            { name: t`\`B_bg\` is the intercept (${f.a.toFixed(3)} mT)`, code: `abs(B_bg - ${f.a}) < 1e-6` },
          ],
          hints: [t`\`u = (1 + (z / R)**2) ** -1.5\` — $z$ and $R$ both in cm, so their ratio is a pure number.`, t`\`slope, intercept = np.polyfit(u, B, 1)\`: the slope is the field at $u = 1$ (the centre) without the background, the intercept the field where $u \to 0$ (far away).`],
          teach: 'Plotting against the predicted shape turns any profile into a straight line: the slope is its size, the intercept the background.',
          explain: t`The fit gives $B(0) = ${f.b.toFixed(3)}$ mT for the coil alone — $\mu_0NI/2R = 1.885$ mT at 1.5 A — and a background of $${f.a.toFixed(3)}$ mT, the 0.040 mT the probe was never zeroed against.`,
          visual: plot('coil-axis', rows, { sys: true, fit: false, caption: 'The readings your program fits, plotted against u.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-helmholtz', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([50, 100, 150]), R = r.pick([0.5, 0.75, 1.0]), Be = r.pick([45, 48, 52]);
        const I = (Be * 1e-6 * R) / ((4 / 5) ** 1.5 * MU0 * N);
        return {
          prompt: t`A spacecraft magnetometer is tested inside a Helmholtz pair: two coaxial coils of ${N} turns and radius ${R.toFixed(2)} m, a distance $R$ apart. Midway between them the field is $B = (4/5)^{3/2}\mu_0 N I/R$, uniform over a large region. What current cancels Earth’s ${Be} µT field along the axis?`,
          answer: I, units: 'A', tol: { rel: 0.005 },
          errors: apart([
            { value: (2 * Be * 1e-6 * R) / (MU0 * N), feedback: t`That uses one coil’s centre field, $\mu_0NI/2R$. Midway between two coils each is $R/2$ away along the axis, and the two add to $(4/5)^{3/2}\mu_0NI/R$.` },
            { value: (Be * 1e-6 * R) / (MU0 * N), feedback: t`Keep the factor $(4/5)^{3/2} = 0.7155$: each coil is $R/2$ from the middle, where its field has fallen to $(1 + 1/4)^{-3/2}$ of its centre value.` },
          ], I),
          hints: [t`Set $(4/5)^{3/2}\mu_0NI/R = ${Be}\times10^{-6}$ T and solve for $I$.`, t`$(4/5)^{3/2} = 0.7155$.`],
          teach: 'Two coils a radius apart make a nearly uniform field between them, (4/5)^(3/2)·μ₀NI/R: the standard way to cancel Earth’s field.',
          explain: t`$I = \dfrac{BR}{(4/5)^{3/2}\mu_0N} = \dfrac{(${Be}\times10^{-6})(${R.toFixed(2)})}{0.7155(1.2566\times10^{-6})(${N})} = ${I.toFixed(3)}$ A, flowing so that the coils’ field opposes Earth’s. Each coil alone would give $(1 + 1/4)^{-3/2} = 0.716$ of $\mu_0NI/2R$ at the midpoint; the pair adds to the formula.`,
          visual: { type: 'em-bfield', params: { unit: 'cm', x: [-200 * R, 200 * R], y: [-130 * R, 130 * R], loops: [{ x: -50 * R, R: 100 * R, I: 1 }, { x: 50 * R, R: 100 * R, I: 1 }], static: true, readouts: [], labels: false, density: 1.2 }, caption: 'A Helmholtz pair cut through its axis: the field lines run nearly straight and evenly spaced between the coils. Earth’s field not drawn.' },
        };
      },
    }),
    mcq({
      id: 'cp-reversal', difficulty: 2,
      prompt: t`Why does reversing the current and taking $(B_+ - B_-)/2$ remove a background field?`,
      choices: [
        'The coil’s field reverses with the current but the background does not, so subtracting the two readings cancels the background and doubles the coil’s field',
        'Reversing the current also reverses Earth’s field',
        'Taking two readings averages the background down by √2',
        'The background is random, so it averages to zero over two readings',
      ],
      answer: 0,
      why: {
        1: 'Earth’s field has nothing to do with the coil’s current: it stays put.',
        2: 'Averaging shrinks random error. The background is the same in both readings, and it cancels exactly in the difference — not by √2.',
        3: 'The background is steady, not random: that is exactly why it cancels in a difference.',
      },
      hints: [t`Write $B_+ = B_c + B_{\text{bg}}$ and $B_- = -B_c + B_{\text{bg}}$.`],
      teach: 'Reverse what you control: the part of the signal that follows the reversal is yours; the part that does not is the background.',
      explain: t`$B_+ - B_- = (B_c + B_{\text{bg}}) - (-B_c + B_{\text{bg}}) = 2B_c$. The same trick removes thermoelectric voltages in resistance measurements and offsets in Hall-effect experiments.`,
      visual: plot('coil', B.makeData('coil', { seed: 9, sys: 'background' }).rows, { sys: true, expected: true, caption: 'B against I with the background (gold) and without it (dashed): parallel lines, 0.040 mT apart.' }),
    }),
    num({
      id: 'cp-half', difficulty: 2,
      gen(r) {
        const Rcm = r.pick([8, 10, 12, 15]);
        const x = Math.sqrt(2 ** (2 / 3) - 1), z = x * Rcm;
        return {
          prompt: t`How far along the axis from the centre of a coil of radius ${Rcm} cm has the field fallen to half its centre value?`,
          answer: z, units: 'cm', tol: { rel: 0.005 },
          errors: apart([
            { value: Rcm, feedback: t`At $z = R$ the field is $(1 + 1)^{-3/2} = 0.354$ of its centre value — already below half.` },
            { value: Rcm * Math.sqrt(2 - 1), feedback: t`Raise to the $2/3$ power first: $(1 + z^2/R^2)^{3/2} = 2$ gives $1 + z^2/R^2 = 2^{2/3}$.` },
          ], z),
          hints: [t`Solve $(1 + z^2/R^2)^{-3/2} = 1/2$.`, t`$1 + z^2/R^2 = 2^{2/3} = 1.587$, so $z = R\sqrt{0.587}$.`],
          teach: 'The axial field halves at z = 0.766R: the coil’s field is concentrated within about one radius of it.',
          explain: t`$z = R\sqrt{2^{2/3} - 1} = 0.766R = ${z.toFixed(2)}$ cm.`,
          visual: profile({ hlines: [{ y: 0.5, label: 'half', color: 'violet' }] }, 'The field along the axis as a fraction of its centre value, z in units of the radius.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §12.4 Magnetic Field of a Current Loop', url: 'https://openstax.org/books/university-physics-volume-2/pages/12-4-magnetic-field-of-a-current-loop' },
    { label: 'NIST CODATA 2022: vacuum magnetic permeability μ₀', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?mu0' },
    { label: 'NOAA National Centers for Environmental Information: magnetic field calculators (Earth’s field)', url: 'https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml' },
    SOURCES.taylor('ch. 8 (least squares)'),
    SOURCES.aapt,
  ],
});
