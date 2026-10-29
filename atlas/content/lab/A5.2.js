// Weighted least squares — points with different uncertainties count in
// proportion to 1/σ²: the weighted sums S, Sx, Sy, Sxx, Sxy, the slope and
// intercept with σ_a² = Sxx/Δ and σ_b² = S/Δ when the σ's are known; the
// weighted mean as the zero-slope case; and the commonest source of unequal
// σ's in a lab, transforming the data (σ_lnV = σ_V/V). An RC discharge,
// a point you can make more or less trusted, and deep-space ranging.
// Every number is computed here from seeded synthetic data (_labf.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { normals, linfit, dataGraph, r6, sf, SIMNOTE, table, errbar } from './_labf.js';

const t = String.raw;

// ── Explore: five points with σ = 0.10 and a sixth, 0.6 high, whose σ is a slider ──
const XE = [1, 2, 3, 4, 5, 6];
const YE = (() => { const z = normals(41); return XE.map((x, i) => +(1 + 0.5 * x + 0.1 * z() + (i === 5 ? 0.6 : 0)).toFixed(2)); })();
const base = linfit(XE.slice(0, 5), YE.slice(0, 5), 0.1);
const UN = linfit(XE, YE);
const [x6, y6] = [XE[5], YE[5]];
const W = '(1/s6^2)';
const S = `(${r6(base.S)} + ${W})`, Sx = `(${r6(base.Sx)} + ${x6}*${W})`, Sy = `(${r6(base.Sy)} + ${y6}*${W})`;
const Sxx = `(${r6(base.Sxx)} + ${x6 * x6}*${W})`, Sxy = `(${r6(base.Sxy)} + ${r6(x6 * y6)}*${W})`;
const D = `(${S}*${Sxx} - ${Sx}^2)`;
const BW = `((${S}*${Sxy} - ${Sx}*${Sy})/${D})`, AW = `((${Sxx}*${Sy} - ${Sx}*${Sxy})/${D})`;

// ── the worked example: an RC discharge, V every 10 s with σ_V = 0.020 V (synthetic, τ = RC = 10.0 s) ──
const EX_t = [0, 10, 20, 30];
const EX_V = (() => { const z = normals(25); return EX_t.map((x) => +(10 * Math.exp(-x / 10) + 0.02 * z()).toFixed(3)); })();
const EX_y = EX_V.map(Math.log), EX_s = EX_V.map((v) => 0.02 / v);
const EX = linfit(EX_t, EX_y, EX_s), EXU = linfit(EX_t, EX_y);
const tauW = -1 / EX.b, dtauW = EX.sb / EX.b ** 2, tauU = -1 / EXU.b;

// three points with their own σ's, for the hand calculations
function three(r) {
  const z = normals(r.int(1, 999999));
  const xs = [r.int(1, 2), r.int(4, 5), r.int(7, 9)];
  const a = r.float(1, 3, 0.1), b = r.float(0.5, 1.5, 0.1);
  const sy = r.shuffle([0.1, 0.2, 0.5]);
  const ys = xs.map((x, i) => +(a + b * x + sy[i] * z()).toFixed(2));
  return { xs, ys, sy, f: linfit(xs, ys, sy), u: linfit(xs, ys) };
}

export default lesson({
  id: 'lab.A5.2',
  title: 'Weighted least squares',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`When the points have different standard uncertainties $\sigma_i$, a good point should count for more than a poor one. **Weighted least squares** minimizes

$$\chi^2(a, b) = \sum_i \frac{(y_i - a - bx_i)^2}{\sigma_i^2}$$

so each misfit is measured in units of its own uncertainty, and each point carries the weight $w_i = 1/\sigma_i^2$. Halving a point's error bar makes it count four times as much. The solution has the same shape as the unweighted one, with every sum weighted: $b = (S\,S_{xy} - S_xS_y)/\Delta$ and $a = (S_{xx}S_y - S_xS_{xy})/\Delta$, where $\Delta = S\,S_{xx} - S_x^2$. When the $\sigma_i$ are known — from the instrument, not from the scatter — the uncertainties follow directly: $\sigma_b^2 = S/\Delta$ and $\sigma_a^2 = S_{xx}/\Delta$.`,
  symbols: [
    { tex: '\\sigma_i', text: 'the standard uncertainty of the $i$-th measured value $y_i$, in units of $y$ (its error bar)' },
    { tex: 'w_i', text: 'the weight of point $i$, $1/\\sigma_i^2$' },
    { tex: '\\chi^2', text: 'chi-squared: the sum of the squared misfits, each divided by its own $\\sigma_i^2$ (dimensionless)' },
    { tex: 'S,\\ S_x,\\ S_y', text: 'the weighted sums $\\sum w_i$, $\\sum w_ix_i$, $\\sum w_iy_i$' },
    { tex: 'S_{xx},\\ S_{xy}', text: 'the weighted sums $\\sum w_ix_i^2$ and $\\sum w_ix_iy_i$' },
    { tex: '\\Delta', text: 'the determinant $S\\,S_{xx} - S_x^2$; it is $S$ times the weighted spread of the $x$’s about their weighted mean' },
    { tex: 'a,\\ b', text: 'the fitted intercept and slope, with standard uncertainties $\\sigma_a$ and $\\sigma_b$' },
  ],
  why: t`Real data sets mix good and poor points — a long count and a short one, a reading near a meter’s full scale and one near zero, logarithms of big and small voltages — and an unweighted fit lets the poor ones drag the answer around.`,
  visual: {
    type: 'graph',
    title: 'How much should one point count?',
    lead: t`Five points have error bars of $\pm 0.10$. The sixth, at $x = 6$, sits high, and the slider sets its uncertainty $\sigma_6$. The gold line is the weighted fit; the dashed grey line is the unweighted one, which treats all six alike whatever their error bars.`,
    tasks: [
      'Slide σ₆ down to 0.05: the weighted line swings to pass almost through the sixth point, because it now outweighs any two others put together.',
      'Slide σ₆ up to 2: the weighted line ignores it and follows the other five, and σ of the slope settles at the five-point value.',
      'Set σ₆ = 0.10, the same as the others: the weighted and unweighted lines coincide. Equal weights are the unweighted fit.',
    ],
    params: {
      aspect: 'wide', x: [0.3, 6.7], y: [0.8, 5.2], xlabel: 'x', ylabel: 'y', axesAt: 'edge',
      sliders: [{ key: 's6', label: t`Uncertainty of the sixth point $\sigma_6$`, min: 0.05, max: 2, step: 0.01, value: 0.4, logScale: true, unit: '', explain: t`The error bar of the point at $x = 6$; its weight is $1/\sigma_6^2$.` }],
      curves: [
        { fn: `${r6(UN.a)} + ${r6(UN.b)}*x`, color: 'ink3', width: 1.6, dash: [6, 5] },
        { fn: `${AW} + ${BW}*x`, color: 'gold', width: 2.2 },
        ...XE.slice(0, 5).flatMap((x, i) => errbar(x, YE[i], 0.1, 0.07, { color: 'accent' })),
        { param: [`${x6}`, `${y6} + s6*(2*t - 1)`], t: [0, 1], color: 'warn', width: 1.6 },
        { param: [`${x6 - 0.07} + 0.14*t`, `${y6} + s6`], t: [0, 1], color: 'warn', width: 1.6 },
        { param: [`${x6 - 0.07} + 0.14*t`, `${y6} - s6`], t: [0, 1], color: 'warn', width: 1.6 },
      ],
      points: [...XE.slice(0, 5).map((x, i) => ({ x, y: YE[i], r: 3.5, color: 'accent' })), { x: x6, y: y6, r: 4, color: 'warn' }],
      legend: [{ label: 'weighted fit', color: 'gold' }, { label: 'unweighted fit', color: 'ink3', dash: [6, 5] }], legendAt: 'tl',
      readouts: [
        { label: 'weight of point 6, relative to the others', expr: '0.01/s6^2', digits: 2 },
        { label: 'weighted slope $b$', expr: BW, digits: 3 },
        { label: '$\\sigma_b = \\sqrt{S/\\Delta}$', expr: `sqrt(${S}/${D})`, digits: 2 },
      ],
    },
    caption: t`Synthetic points from $y = 1 + 0.5x$ with Gaussian noise, the sixth deliberately set 0.6 high. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A $10.0\ \mu\text{F}$ capacitor discharges through a $1.00\ \text{M}\Omega$ resistor. A data logger reads its voltage every 10 s, each reading with $\sigma_V = 0.020$ V:

${table([[t`t\ (\text{s})`, ...EX_t.map(String)], [t`V\ (\text{V})`, ...EX_V.map((v) => v.toFixed(3))]])}

Since $V = V_0e^{-t/\tau}$, $\ln V = \ln V_0 - t/\tau$ is a straight line. Fit it with the right weights and find the time constant $\tau$.`,
    visual: { type: 'graph', params: dataGraph({ xs: EX_t, ys: EX_y.map(r6), sy: EX_s, fit: EX, xlabel: 't (s)', ylabel: 'ln(V / 1 V)', x: [-2, 32], y: [-1, 2.6], curves: [{ fn: `${r6(EXU.a)} + (${r6(EXU.b)})*x`, color: 'ink3', width: 1.5, dash: [6, 5] }], legend: [{ label: 'weighted fit', color: 'gold' }, { label: 'unweighted', color: 'ink3', dash: [6, 5] }], legendAt: 'tr' }), caption: t`The same $\pm 0.020$ V on every reading becomes an error bar $0.020/V$ in $\ln V$: tiny at 10 V, twenty times bigger at 0.5 V. Synthetic data, true $\tau = RC = 10.0$ s. ${SIMNOTE}` },
    steps: [
      { label: 'Transform the errors too', text: t`For $y = \ln V$, $\sigma_y = \left|\dfrac{dy}{dV}\right|\sigma_V = \dfrac{\sigma_V}{V}$: ${EX_s.map((s) => `$${s.toFixed(4)}$`).join(', ')}. Taking logs turned equal error bars into very unequal ones.` },
      { label: 'Weights', text: t`$w_i = 1/\sigma_i^2$: ${EX_s.map((s) => `$${tex(1 / s ** 2, 3)}$`).join(', ')}. The first reading counts about ${Math.round(EX_s[3] ** 2 / EX_s[0] ** 2)} times as much as the last.` },
      { label: 'Weighted sums', text: t`$S = ${tex(EX.S, 4)}$, $S_x = ${tex(EX.Sx, 4)}$ s, $S_y = ${tex(EX.Sy, 4)}$, $S_{xx} = ${tex(EX.Sxx, 4)}\ \text{s}^2$, $S_{xy} = ${tex(EX.Sxy, 4)}$ s.` },
      { label: 'Slope', text: t`$\Delta = S\,S_{xx} - S_x^2 = ${tex(EX.D, 4)}\ \text{s}^2$, and $b = (S\,S_{xy} - S_xS_y)/\Delta = ${EX.b.toFixed(5)}\ \text{s}^{-1}$.` },
      { label: 'Its uncertainty', text: t`The $\sigma_V$ is known from the logger, so $\sigma_b = \sqrt{S/\Delta} = ${tex(EX.sb, 2)}\ \text{s}^{-1}$.` },
      { label: 'Time constant', text: t`$\tau = -1/b = ${tauW.toFixed(3)}$ s, and $\sigma_\tau = \sigma_b/b^2 = ${dtauW.toFixed(3)}$ s.` },
      { label: 'Compare unweighted', text: t`An unweighted fit of the same four logs gives $\tau = ${tauU.toFixed(2)}$ s — ${(Math.abs(tauU - 10) / dtauW).toFixed(0)} standard uncertainties from the true 10.00 s, dragged by the noisy last point, whose log is far less certain than it looks.` },
      { label: 'Sense check', text: t`$\chi^2 = ${EX.chi2.toFixed(2)}$ for $4 - 2 = 2$ degrees of freedom: the misfits are the size the error bars promise. ([χ² and reduced χ²](#/lesson/lab.A6.1) makes that test precise.)` },
    ],
    answer: t`$\tau = ${tauW.toFixed(2)} \pm ${dtauW.toFixed(2)}$ s (weighted), against $RC = 10.0$ s.`,
  },
  practice: [
    mcq({
      id: 'weight', difficulty: 1,
      prompt: t`In a weighted least-squares fit, a point with standard uncertainty $\sigma_i$ carries the weight…`,
      visual: (() => { const z = normals(14); const xs = [1, 2, 3, 4, 5]; const sy = [0.1, 0.4, 0.1, 0.8, 0.2]; const ys = xs.map((x, i) => +(0.5 + 0.7 * x + sy[i] * z()).toFixed(2)); return { type: 'graph', params: dataGraph({ xs, ys, sy, fit: linfit(xs, ys, sy), xlabel: 'x', ylabel: 'y' }), caption: 'Five points with different error bars and their weighted line.' }; })(),
      choices: [t`$1/\sigma_i^2$`, t`$1/\sigma_i$`, t`$\sigma_i^2$`, t`$1/\sqrt{\sigma_i}$`],
      answer: 0,
      why: { 1: t`The misfit is divided by $\sigma_i$ before squaring, so the weight on the squared misfit is $1/\sigma_i^2$. (Some software asks for $1/\sigma_i$ as its “weight” argument and squares it inside — read the documentation.)`, 2: 'That would give the worst points the most say.', 3: t`No — the weight comes from $\chi^2 = \sum (\text{misfit}/\sigma_i)^2$, which divides each squared misfit by $\sigma_i^2$.` },
      hints: [t`Expand one term of $\chi^2$: $(y_i - a - bx_i)^2/\sigma_i^2$.`],
      teach: t`The weight is the inverse variance, $1/\sigma_i^2$: halving an error bar quadruples the weight.`,
      explain: t`$\chi^2 = \sum w_i (y_i - a - bx_i)^2$ with $w_i = 1/\sigma_i^2$. This is also the weight that makes the fitted parameters as precise as possible when the errors are independent and Gaussian (the maximum-likelihood choice).`,
    }),
    num({
      id: 'log-sigma', difficulty: 2,
      gen(r) {
        const V = r.float(0.3, 9, 0.01), sV = r.pick([0.005, 0.01, 0.02]);
        const ans = sV / V;
        return {
          prompt: t`A reading $V = ${V.toFixed(2)}$ V has $\sigma_V = ${sV}$ V. You will fit $y = \ln(V/1\ \text{V})$. What error bar $\sigma_y$ belongs on this point?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [-1.5, 2.5], xlabel: 'V (V)', ylabel: 'ln V', axesAt: 'edge', curves: [{ fn: 'ln(x)', color: 'accent', domain: [0.2, 10] }], points: [{ x: V, y: r6(Math.log(V)), r: 4, color: 'gold' }] }, caption: t`$y = \ln V$ is steep at small $V$: there a fixed $\sigma_V$ becomes a large $\sigma_y$.` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.log(sV), feedback: t`$\ln\sigma_V$ is not an uncertainty. Propagate: $\sigma_y = |dy/dV|\,\sigma_V$.` }, { value: sV * V, feedback: t`The derivative of $\ln V$ is $1/V$, so divide by $V$.` }, { value: sV, feedback: t`The uncertainty does not carry over unchanged: $\ln$ squeezes large values and stretches small ones.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_y = \left|\dfrac{dy}{dV}\right|\sigma_V$.`, t`$\dfrac{d}{dV}\ln V = \dfrac1V$.`],
          teach: t`Transforming data transforms its error bars: for $\ln V$, $\sigma_{\ln V} = \sigma_V/V$, the *relative* uncertainty.`,
          explain: t`$\sigma_y = ${sV}/${V.toFixed(2)} = ${tex(ans, 3)}$ — the fractional uncertainty of $V$. (Propagation itself is [A3.2](#/lesson/lab.A3.2).)`,
        };
      },
    }),
    num({
      id: 'w-slope', difficulty: 3,
      gen(r) {
        const { xs, ys, sy, f, u } = three(r);
        return {
          prompt: t`Fit a weighted straight line to these three points. What is the slope $b$? Give three significant figures.

${table([['x', ...xs.map(String)], ['y', ...ys.map((v) => v.toFixed(2))], [t`\sigma`, ...sy.map(String)]])}`,
          visual: { type: 'graph', params: dataGraph({ xs, ys, sy, xlabel: 'x', ylabel: 'y', x: [0, 10] }), caption: 'The three points and their error bars.' },
          answer: f.b, tol: { rel: 0.005 },
          errors: [{ value: u.b, feedback: 'That is the unweighted slope: every point counted equally. Weight each by 1/σ² first.' }].filter((e) => Math.abs(e.value - f.b) > 0.01 * Math.abs(f.b)),
          hints: [t`Weights $w = 1/\sigma^2$: ${sy.map((s) => `$${r6(1 / s ** 2)}$`).join(', ')}. Then form $S, S_x, S_y, S_{xx}, S_{xy}$.`, t`$S = ${r6(f.S)}$, $S_x = ${r6(f.Sx)}$, $S_y = ${r6(f.Sy)}$, $S_{xx} = ${r6(f.Sxx)}$, $S_{xy} = ${r6(f.Sxy)}$. Now $b = (S\,S_{xy} - S_xS_y)/(S\,S_{xx} - S_x^2)$.`],
          teach: 'A weighted fit is the unweighted recipe with every sum weighted by 1/σ².',
          explain: t`$\Delta = ${r6(f.D)}$ and $b = (${r6(f.S)} \times ${r6(f.Sxy)} - ${r6(f.Sx)} \times ${r6(f.Sy)})/${r6(f.D)} = ${f.b.toFixed(4)}$. The unweighted slope would be $${u.b.toFixed(4)}$.`,
        };
      },
    }),
    num({
      id: 'w-sigma-b', difficulty: 2,
      gen(r) {
        const { xs, sy, f } = three(r);
        const ans = Math.sqrt(f.S / f.D);
        return {
          prompt: t`Three points at $x = ${xs.join(',\\ ')}$ have known uncertainties $\sigma = ${sy.join(',\\ ')}$. What is the standard uncertainty of the weighted slope? (You do not need the $y$ values.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [-1, 1], xlabel: 'x', ylabel: '', yticks: 0, axesAt: 'edge', curves: xs.flatMap((x, i) => errbar(x, 0, sy[i], 0.12, { color: 'accent' })), points: xs.map((x) => ({ x, y: 0, r: 3.5, color: 'accent' })) }, caption: 'Where the points are and how big their error bars are: that is all σ of the slope depends on.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(f.Sxx / f.D), feedback: t`$\sqrt{S_{xx}/\Delta}$ is the intercept’s uncertainty. The slope’s is $\sqrt{S/\Delta}$.` }, { value: f.S / f.D, feedback: 'That is the variance. Take its square root.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_b = \sqrt{S/\Delta}$ with $\Delta = S\,S_{xx} - S_x^2$.`, t`$S = ${r6(f.S)}$, $S_x = ${r6(f.Sx)}$, $S_{xx} = ${r6(f.Sxx)}$.`],
          teach: t`With known $\sigma$’s the parameter uncertainties depend only on the design — where the points are and how good they are — not on the values measured.`,
          explain: t`$\Delta = ${r6(f.S)} \times ${r6(f.Sxx)} - ${r6(f.Sx)}^2 = ${r6(f.D)}$, so $\sigma_b = \sqrt{${r6(f.S)}/${r6(f.D)}} = ${ans.toPrecision(3)}$. You can work it out before taking any data — which is how experiments are planned.`,
        };
      },
    }),
    mcq({
      id: 'pulled', difficulty: 2,
      prompt: t`One point in a data set has an error bar ten times smaller than the rest. What does a weighted fit do with it?`,
      visual: (() => { const xs = [1, 2, 3, 4, 5, 6]; const ys = [1.6, 2.0, 2.4, 3.3, 3.6, 4.0]; const sy = [0.3, 0.3, 0.3, 0.03, 0.3, 0.3]; return { type: 'graph', params: dataGraph({ xs, ys, sy, fit: linfit(xs, ys, sy), xlabel: 'x', ylabel: 'y', curves: [{ fn: `${r6(linfit(xs, ys).a)} + ${r6(linfit(xs, ys).b)}*x`, color: 'ink3', dash: [6, 5], width: 1.5 }] }), caption: 'The point at x = 4 has σ = 0.03; the others 0.3. Gold: weighted. Dashed: unweighted.' }; })(),
      choices: ['It forces the line to pass very close to that point, and the others only set the slope around it', 'It ignores that point, since one point cannot matter', 'It gives the point ten times the weight of each other point', 'It treats it like the others, because weights only matter for large data sets'],
      answer: 0,
      why: { 1: 'The opposite: its weight is 100 times any other point’s.', 2: t`The weight goes as $1/\sigma^2$: ten times smaller $\sigma$ is a hundred times the weight.`, 3: 'Weights matter for any number of points.' },
      hints: [t`Compare $1/\sigma^2$ for $\sigma = 0.03$ and $\sigma = 0.3$.`],
      teach: 'A very precise point pins the line where it is; the rest decide only the direction through it.',
      explain: t`Its weight is $(0.3/0.03)^2 = 100$ times each other point’s — more than all five others together. That is right **if** its tiny $\sigma$ is honest. If it is not (a mis-stated error, a systematic error that $\sigma$ omits), it corrupts the whole fit: check the point’s residual against its own error bar ([residual analysis](#/lesson/lab.A6.2)).`,
    }),
    num({
      id: 'w-mean', difficulty: 2,
      gen(r) {
        const v = [r.float(9.79, 9.83, 0.001), r.float(9.79, 9.83, 0.001), r.float(9.79, 9.83, 0.001)];
        const s = r.shuffle([0.004, 0.01, 0.02]);
        const w = s.map((q) => 1 / q ** 2), S0 = w.reduce((a, b) => a + b, 0);
        const ans = w.reduce((a, wi, i) => a + wi * v[i], 0) / S0;
        const plain = v.reduce((a, b) => a + b, 0) / 3;
        return {
          prompt: t`Fitting a constant, $y = a$ (a line with zero slope), by weighted least squares gives the **weighted mean**. Three measurements of $g$ are $${v[0].toFixed(3)} \pm ${s[0]}$, $${v[1].toFixed(3)} \pm ${s[1]}$ and $${v[2].toFixed(3)} \pm ${s[2]}$ m/s². What is the best estimate of $g$? Give four decimal places.`,
          visual: { type: 'graph', params: dataGraph({ xs: [1, 2, 3], ys: v, sy: s, xlabel: 'measurement', ylabel: 'g (m/s²)', x: [0.4, 3.6] }), caption: 'Three results with their ±1σ bars.' },
          answer: ans, units: 'm/s^2', tol: { rel: 0, abs: 0.00006 },
          errors: Math.abs(plain - ans) > 0.0002 ? [{ value: plain, feedback: 'That is the ordinary mean: it lets the poorest measurement count as much as the best.' }] : [],
          hints: [t`$\hat a = \sum w_iy_i / \sum w_i$ with $w_i = 1/\sigma_i^2$.`, t`The weights are ${s.map((q) => `$${(1 / q ** 2).toFixed(0)}$`).join(', ')}.`],
          teach: t`The weighted mean is the weighted fit of a constant: $\hat a = \sum w_iy_i/\sum w_i$, with $\sigma_{\hat a} = 1/\sqrt{\sum w_i}$.`,
          explain: t`$\hat g = ${ans.toFixed(5)}$ m/s², with $\sigma = 1/\sqrt{${S0.toFixed(0)}} = ${tex(1 / Math.sqrt(S0), 2)}$ m/s². This is the same formula as in [weighted means](#/lesson/lab.A4.3) — a fit of the simplest model.`,
        };
      },
    }),
    code({
      id: 'wfit', difficulty: 3,
      prompt: t`Write \`wfit(x, y, sigma)\` that returns \`a, b, sa, sb, chi2\` for a weighted straight-line fit with **known** uncertainties, from the weighted sums $S, S_x, S_y, S_{xx}, S_{xy}$. The program then fits the RC data of the worked example in $\ln V$.`,
      starter: t`import numpy as np

def wfit(x, y, sigma):
    x, y, sigma = (np.asarray(v, float) for v in (x, y, sigma))
    w = 1 / sigma**2
    # your code: the weighted sums, Delta, a, b, sa, sb and chi2
    return a, b, sa, sb, chi2

t = np.array([${EX_t.join(', ')}], float)
V = np.array([${EX_V.join(', ')}])
a, b, sa, sb, chi2 = wfit(t, np.log(V), 0.020 / V)
print(f"tau = {-1 / b:.3f} ± {sb / b**2:.3f} s,  chi2 = {chi2:.2f}")`,
      answer: t`import numpy as np

def wfit(x, y, sigma):
    x, y, sigma = (np.asarray(v, float) for v in (x, y, sigma))
    w = 1 / sigma**2
    S, Sx, Sy = w.sum(), (w * x).sum(), (w * y).sum()
    Sxx, Sxy = (w * x * x).sum(), (w * x * y).sum()
    D = S * Sxx - Sx**2
    b = (S * Sxy - Sx * Sy) / D
    a = (Sxx * Sy - Sx * Sxy) / D
    sa, sb = np.sqrt(Sxx / D), np.sqrt(S / D)
    chi2 = np.sum(w * (y - a - b * x)**2)
    return a, b, sa, sb, chi2

t = np.array([${EX_t.join(', ')}], float)
V = np.array([${EX_V.join(', ')}])
a, b, sa, sb, chi2 = wfit(t, np.log(V), 0.020 / V)
print(f"tau = {-1 / b:.3f} ± {sb / b**2:.3f} s,  chi2 = {chi2:.2f}")`,
      tests: [
        { name: 'the slope of the RC data matches the worked example', code: `abs(wfit(t, np.log(V), 0.02 / V)[1] - (${EX.b})) < 1e-9` },
        { name: t`$\sigma_b = \sqrt{S/\Delta}$ and $\sigma_a = \sqrt{S_{xx}/\Delta}$, not rescaled by the scatter`, code: `abs(wfit(t, np.log(V), 0.02 / V)[3] - ${EX.sb}) < 1e-10 and abs(wfit(t, np.log(V), 0.02 / V)[2] - ${EX.sa}) < 1e-9` },
        { name: t`$\chi^2$ is the weighted sum of squared misfits`, code: `abs(wfit(t, np.log(V), 0.02 / V)[4] - ${EX.chi2}) < 1e-6` },
        { name: 'equal sigmas give the unweighted line', code: `abs(wfit([1, 2, 3, 4], [1.1, 2.3, 2.8, 4.2], [0.3] * 4)[1] - np.polyfit([1, 2, 3, 4], [1.1, 2.3, 2.8, 4.2], 1)[0]) < 1e-9` },
      ],
      hints: [t`\`S, Sx, Sy = w.sum(), (w * x).sum(), (w * y).sum()\`, and the same for \`Sxx\`, \`Sxy\`.`, t`\`D = S * Sxx - Sx**2\`; \`b = (S * Sxy - Sx * Sy) / D\`; \`sb = np.sqrt(S / D)\`; \`chi2 = np.sum(w * (y - a - b * x)**2)\`.`],
      teach: 'Five weighted sums are all a weighted straight-line fit needs.',
      explain: t`It prints $\tau = ${tauW.toFixed(3)} \pm ${dtauW.toFixed(3)}$ s with $\chi^2 = ${EX.chi2.toFixed(2)}$. Because the $\sigma$’s are known, $\sigma_b$ is **not** rescaled by the scatter — unlike \`np.polyfit\`’s default, which estimates the noise afresh (the software side of this is [A12.1](#/lesson/lab.A12.1)).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ranging', difficulty: 3, transfer: true,
      gen(r) {
        const z = normals(r.int(1, 999999));
        const v = r.float(2.5, 4.5, 0.01);                 // km/s, range rate
        const d0 = r.int(100, 400);                         // thousand km
        const ts = [0, 20, 40, 60];                         // minutes
        const sig = r.pick([[0.001, 0.02, 0.001, 0.02], [0.02, 0.001, 0.02, 0.001], [0.001, 0.001, 0.02, 0.02]]); // thousand km
        const ds = ts.map((tt, i) => +(d0 + v * 60 * tt / 1000 + sig[i] * z()).toFixed(3));
        const f = linfit(ts, ds, sig), u = linfit(ts, ds);
        const ans = f.b * 1000 / 60;                        // km/s
        return {
          prompt: t`Two ground stations track a spacecraft leaving Earth. The big dish measures its distance to $\pm 1$ km; a small station to $\pm 20$ km. The four ranges (in thousands of km) are:

${table([[t`t\ (\text{min})`, ...ts.map(String)], [t`d\ (10^3\ \text{km})`, ...ds.map((x) => x.toFixed(3))], [t`\sigma\ (10^3\ \text{km})`, ...sig.map(String)]])}

Fit a straight line with the right weights. What is the spacecraft’s range rate, in km/s?`,
          visual: { type: 'graph', params: dataGraph({ xs: ts, ys: ds, sy: sig, xlabel: 't (min)', ylabel: 'd (thousand km)' }), caption: 'The four ranges. Even the small station’s ±20 km error bars are smaller than the dots at this scale. Synthetic data; real ranging also corrects for light time and the station’s motion with the turning Earth.' },
          answer: ans, units: 'km/s', tol: { rel: 0.002 },
          errors: [{ value: u.b * 1000 / 60, feedback: 'You weighted all four equally. The big dish’s points carry 400 times the weight.' }, { value: f.b, feedback: 'That is the slope in thousand km per minute. Convert: × 1000 km, ÷ 60 s.' }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`Weights $1/\sigma^2$: the $\pm 0.001$ points count $400$ times as much as the $\pm 0.02$ ones.`, t`Compute the weighted slope in $10^3$ km/min, then multiply by $1000/60$.`],
          teach: 'Precise and crude measurements belong in one fit — with weights 1/σ².',
          explain: t`The weighted slope is $${f.b.toFixed(5)}\times10^{3}$ km/min $= ${ans.toFixed(3)}$ km/s, uncertainty $${tex(f.sb * 1000 / 60, 2)}$ km/s. With only two big-dish points the answer is almost the line through them; the small station’s ranges barely move it.`,
        };
      },
    }),
    mcq({
      id: 'cp-equal', difficulty: 2,
      prompt: t`Every point in a data set has the same known $\sigma$. Compared with the unweighted fit, the weighted fit gives…`,
      visual: (() => { const z = normals(31); const xs = [1, 2, 3, 4, 5, 6]; const ys = xs.map((x) => +(2 + 0.4 * x + 0.15 * z()).toFixed(2)); return { type: 'graph', params: dataGraph({ xs, ys, sy: 0.15, fit: linfit(xs, ys), xlabel: 'x', ylabel: 'y' }), caption: 'Six points, all with σ = 0.15.' }; })(),
      choices: [t`the same line; its $\sigma_b$ uses the known $\sigma$, where the unweighted fit estimates it from the scatter`, 'a different line, closer to the outermost points', 'the same line and exactly the same uncertainties, always', 'a line forced through the origin'],
      answer: 0,
      why: { 1: 'A common factor in every weight cancels from b = (S Sxy − Sx Sy)/Δ, so the line cannot change.', 2: t`The lines agree, but $\sigma/\sqrt{S_{xx}}$ and $s/\sqrt{S_{xx}}$ differ whenever the scatter $s$ differs from the stated $\sigma$ — which by chance it always does a little.`, 3: 'Weighting has nothing to do with the intercept.' },
      hints: ['Multiply every weight by the same constant: what happens to b?'],
      teach: 'Equal weights give the unweighted line; only the source of the uncertainty differs.',
      explain: t`The common $1/\sigma^2$ cancels from the slope and intercept. The uncertainties do not: the weighted fit uses the $\sigma$ you know; the unweighted one estimates it as $s$ from the residuals. Comparing the two is exactly what $\chi^2/\nu$ does.`,
    }),
  ],
  sources: [
    { label: 'P. R. Bevington & D. K. Robinson, Data Reduction and Error Analysis for the Physical Sciences, 3rd ed., ch. 6', url: 'https://www.mheducation.com/highered/product/data-reduction-error-analysis-physical-sciences-bevington-robinson/M9780072472271.html' },
    { label: 'I. G. Hughes & T. P. A. Hase, Measurements and their Uncertainties, ch. 6', url: 'https://global.oup.com/academic/product/measurements-and-their-uncertainties-9780199566334' },
  ],
});
