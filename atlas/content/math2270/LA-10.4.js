// Least-squares fitting: the normal equations AᵀA x̂ = Aᵀb as the matrix view
// of the lab strand's straight-line fits, models linear in their parameters
// (a quadratic trajectory), weights 1/σ² and AᵀWA x̂ = AᵀWb, the parameter
// covariance (AᵀWA)⁻¹, and the residual's right angle.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, solve, matTeX, tupleTeX, colTeX } from './_la.js';
import { lsq, fitPic, planePic } from './_ortho.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const r4 = (x) => Math.round(x * 1e4) / 1e4;

// ── the Explore data: a ball tossed upward, tracked frame by frame by a camera ──
// h(t) = 1.20 + 4.00 t − ½(9.81) t², σ = 0.02 m, except the frame at 0.4 s (motion blur: σ = 0.15 m, read 0.18 m high)
const TS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
const NOISE = [0.012, -0.018, 0.02, -0.006, 0.18, 0.015, -0.022, 0.008, -0.01];
const HS = TS.map((t0, i) => r4(1.2 + 4 * t0 - 4.905 * t0 * t0 + NOISE[i]));
const SIG = TS.map((_, i) => (i === 4 ? 0.15 : 0.02));
const W = SIG.map((s) => 1 / (s * s));
const FIT = {};
for (const [m, cols] of [[0, (t0) => [1, t0]], [1, (t0) => [1, t0, t0 * t0]]]) for (const w of [0, 1]) {
  const f = lsq(TS.map(cols), HS, w ? W : null);
  FIT[`${m}${w}`] = { c: f.xhat, ss: f.res.reduce((s, e) => s + e * e, 0) };
}
const poly = (c) => c.map((v, k) => `(${r4(v)})${k === 0 ? '' : k === 1 ? '*x' : '*x^2'}`).join(' + ');
const gOf = (k) => -2 * FIT[k].c[2];

// ── the worked example: a spring, weighted ──
const EXF = [1, 2, 3, 4], EXY = [2.1, 3.9, 6.2, 7.8], EXS = [0.1, 0.1, 0.2, 0.2];
const EXW = EXS.map((s) => 1 / (s * s));
const EXFIT = lsq(EXF.map((f) => [1, f]), EXY, EXW);
const EXD = EXFIT.N[0][0] * EXFIT.N[1][1] - EXFIT.N[0][1] ** 2;

export default lesson({
  id: 'math2270.LA-10.4',
  title: 'Least-squares fitting',
  minutes: 15, difficulty: 3,
  intro: t`Nine video frames of a tossed ball give nine equations $c_0 + c_1t_i + c_2t_i^2 = h_i$ for three unknowns. No parabola passes through all nine noisy points, so $A\mathbf c = \mathbf h$ has no solution. **Least squares** chooses the $\hat{\mathbf c}$ that makes the length of the residual $\mathbf h - A\hat{\mathbf c}$ as small as possible — and the shortest residual is the perpendicular one (LA-10.2): $A\hat{\mathbf c}$ is the projection of the data onto the column space. That right angle is the **normal equations**:

$$A${T}A\,\hat{\mathbf c} = A${T}\mathbf h$$

The model need only be linear in its *parameters*: a parabola in $t$ is fine, because its columns $1, t, t^2$ are just numbers. When the readings have different uncertainties $\sigma_i$, weight each equation by $w_i = 1/\sigma_i^2$: $A${T}WA\,\hat{\mathbf c} = A${T}W\mathbf h$. This is exactly the fit the lab strand's bench has been doing all along ([graphing and linearizing data](#/lesson/phys2210.L.2)), written as matrices.`,
  symbols: [
    { tex: 'A', text: t`the design matrix: one row per measurement, one column per parameter. For $h = c_0 + c_1t + c_2t^2$, row $i$ is $(1, t_i, t_i^2)$` },
    { tex: t`\mathbf h`, text: t`the measurements (here heights $h_i$, in m), one per row` },
    { tex: t`\hat{\mathbf c}`, text: t`the best-fit parameters: they minimize $\sum_i (h_i - (A\hat{\mathbf c})_i)^2$` },
    { tex: t`A${T}A`, text: t`a small square symmetric matrix (parameters × parameters) of sums such as $\sum t_i$ and $\sum t_i^2$` },
    { tex: t`A${T}\mathbf h`, text: t`the data summarized by sums such as $\sum h_i$ and $\sum t_ih_i$` },
    { tex: 'W', text: t`with uncertainties: the diagonal matrix of weights $w_i = 1/\sigma_i^2$. Then $(A${T}WA)^{-1}$ is the covariance of the parameters; its diagonal holds their variances` },
  ],
  why: 'Every calibration curve, every measured g or spring constant, every orbit determined from tracking data and every pulsar’s spin-down rate is a least-squares solution — and the uncertainty a fit reports comes from the same matrix AᵀWA.',
  visual: {
    type: 'graph',
    title: 'A toss, a blurred frame, and four fits',
    lead: t`Heights of a tossed ball read from nine video frames (error bars $\pm\sigma$). The frame at $t = 0.4$ s is blurred: read high, and with a large error bar. Switch the model between a line and a parabola, and the weights between equal and $1/\sigma^2$. Red dashes are the residuals.`,
    tasks: [
      'Line, equal weights: the residuals form an arch — a pattern in the residuals means the model is wrong.',
      'Parabola, equal weights: much better, but the blurred frame drags the curve up; read g in the readout.',
      'Parabola, weighted by 1/σ²: the blurred point counts 56 times less, and g comes out close to 9.81 m/s².',
    ],
    params: {
      x: [-0.05, 0.85], y: [0.9, 2.45], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'height h (m)',
      choices: [
        { key: 'm', label: 'Model', options: [[0, t`line $c_0 + c_1t$`], [1, t`parabola $c_0 + c_1t + c_2t^2$`]], value: 0, explain: t`The columns of $A$: $(1, t)$ or $(1, t, t^2)$.` },
        { key: 'w', label: 'Weights', options: [[0, 'equal'], [1, t`$w_i = 1/\sigma_i^2$`]], value: 0, explain: 'Equal weights trust every frame the same; 1/σ² trusts sharp frames more.' },
      ],
      curves: [
        ...['00', '01', '10', '11'].map((k) => ({ fn: poly(FIT[k].c), color: 'gold', width: 2.4, when: `step(0.5 - abs(m - ${k[0]}))*step(0.5 - abs(w - ${k[1]}))` })),
        ...TS.map((t0, i) => ({ param: [`${t0}`, `${HS[i]} + ${SIG[i]}*t`], t: [-1, 1], color: 'ink3', width: 1.4 })),
        ...['00', '01', '10', '11'].flatMap((k) => TS.map((t0, i) => {
          const c = FIT[k].c, fit = c.reduce((s, v, j) => s + v * t0 ** j, 0);
          return { param: [`${t0}`, `${HS[i]} + t*(${r4(fit - HS[i])})`], t: [0, 1], color: 'bad', width: 1.6, dash: [4, 3], when: `step(0.5 - abs(m - ${k[0]}))*step(0.5 - abs(w - ${k[1]}))` };
        })),
      ],
      points: TS.map((t0, i) => ({ x: t0, y: HS[i], color: i === 4 ? 'warn' : 'accent', r: 5 })),
      readouts: [
        { label: t`$g = -2c_2$ (parabola)`, expr: `m*((1 - w)*(${gOf('10')}) + w*(${gOf('11')}))`, unit: '\\text{m/s}^2', digits: 3 },
        { label: 'sum of squared residuals', expr: `(1 - m)*(1 - w)*(${FIT['00'].ss}) + (1 - m)*w*(${FIT['01'].ss}) + m*(1 - w)*(${FIT['10'].ss}) + m*w*(${FIT['11'].ss})`, unit: '\\text{m}^2', digits: 3 },
      ],
    },
    caption: 'The data are simulated from h = 1.20 + 4.00t − 4.905t² with 2 cm scatter; the orange point (the blurred frame) has σ = 15 cm and was read 18 cm high. With the line model the g readout shows 0 (a line has no t² term). Air drag is ignored.',
  },
  example: {
    prompt: t`A spring is loaded with $F = 1, 2, 3, 4$ N and stretches $y = 2.1, 3.9, 6.2, 7.8$ cm. The first two readings are good to $\sigma = 0.1$ cm, the last two only to $0.2$ cm. Fit $y = c_0 + c_1F$ by weighted least squares, find the spring constant $k = 1/c_1$, and the uncertainty of $c_1$.`,
    visual: fitPic(EXF, EXY, { sy: EXS, fn: `${r4(EXFIT.xhat[0])} + ${r4(EXFIT.xhat[1])}*x`, at: (f) => EXFIT.xhat[0] + EXFIT.xhat[1] * f, x: [0, 5], y: [0, 9.5], xlabel: 'load F (N)', ylabel: 'extension y (cm)', caption: 'The four readings and the weighted least-squares line. Their error bars (±0.1 and ±0.2 cm) and the residuals are too small to see at this scale.' }),
    steps: [
      { label: 'Design matrix', text: t`One row $(1, F_i)$ per reading: $A = ${matTeX(EXF.map((f) => [1, f]))}$, $\mathbf y = \begin{bmatrix} ${EXY.join(' \\\\ ')} \end{bmatrix}$, and $W = \operatorname{diag}(100, 100, 25, 25)$ from $w_i = 1/\sigma_i^2$ (in cm⁻²).` },
      { label: 'Form A-transpose-W-A', text: t`$A${T}WA = \begin{bmatrix} \sum w_i & \sum w_iF_i \\ \sum w_iF_i & \sum w_iF_i^2 \end{bmatrix} = ${matTeX(EXFIT.N)}$. These are the bench's sums $S$, $S_x$, $S_{xx}$.` },
      { label: 'Form A-transpose-W-y', text: t`$A${T}W\mathbf y = \big(\sum w_iy_i,\ \sum w_iF_iy_i\big) = ${tupleTeX(EXFIT.rhs.map(r4))}$.` },
      { label: 'Solve', text: t`$\det = ${r4(EXFIT.N[0][0])}\cdot${r4(EXFIT.N[1][1])} - ${r4(EXFIT.N[0][1])}^2 = ${r4(EXD)}$, so $c_1 = \dfrac{${r4(EXFIT.N[0][0])}\cdot${r4(EXFIT.rhs[1])} - ${r4(EXFIT.N[0][1])}\cdot${r4(EXFIT.rhs[0])}}{${r4(EXD)}} \approx ${nice(EXFIT.xhat[1], 4)}$ cm/N and $c_0 \approx ${nice(EXFIT.xhat[0], 3)}$ cm.` },
      { label: 'Uncertainty', text: t`The covariance is $(A${T}WA)^{-1} = \tfrac1{${r4(EXD)}}${matTeX([[EXFIT.N[1][1], -EXFIT.N[0][1]], [-EXFIT.N[0][1], EXFIT.N[0][0]]])}$, so $\sigma_{c_1} = \sqrt{${r4(EXFIT.N[0][0])}/${r4(EXD)}} \approx ${nice(Math.sqrt(EXFIT.N[0][0] / EXD), 2)}$ cm/N — the slope uncertainty the lab bench reports, from the same formula.` },
      { label: 'Result', text: t`$k = 1/c_1 \approx ${nice(1 / EXFIT.xhat[1], 3)}$ N/cm $= ${nice(100 / EXFIT.xhat[1], 3)}$ N/m, with relative uncertainty $\sigma_{c_1}/c_1 \approx ${nice((100 * Math.sqrt(EXFIT.N[0][0] / EXD)) / EXFIT.xhat[1], 2)}\%$. Sense check: an unweighted fit gives $c_1 = ${nice(lsq(EXF.map((f) => [1, f]), EXY).xhat[1], 4)}$ cm/N; the weights moved it slightly toward the slope of the two precise points, $1.8$ cm/N.` },
    ],
    answer: t`$c_1 \approx ${nice(EXFIT.xhat[1], 4)} \pm ${nice(Math.sqrt(EXFIT.N[0][0] / EXD), 2)}$ cm/N, $c_0 \approx ${nice(EXFIT.xhat[0], 2)}$ cm, so $k \approx ${nice(100 / EXFIT.xhat[1], 3)}$ N/m.`,
  },
  practice: [
    num({
      id: 'build-AtA', difficulty: 1,
      gen(r) {
        const xs = r.pick([[0, 1, 2, 3], [1, 2, 3, 4], [0, 2, 4, 6], [1, 3, 4, 6], [-1, 0, 1, 2]]);
        const ys = xs.map(() => r.int(1, 9)), ask = r.pick(['n', 'Sx', 'Sxx', 'Sy', 'Sxy']);
        const vals = { n: xs.length, Sx: xs.reduce((s, x) => s + x, 0), Sxx: xs.reduce((s, x) => s + x * x, 0), Sy: ys.reduce((s, y) => s + y, 0), Sxy: xs.reduce((s, x, i) => s + x * ys[i], 0) };
        const where = { n: t`the entry of $A${T}A$ in row 1, column 1`, Sx: t`the off-diagonal entry of $A${T}A$`, Sxx: t`the entry of $A${T}A$ in row 2, column 2`, Sy: t`the first entry of $A${T}\mathbf y$`, Sxy: t`the second entry of $A${T}\mathbf y$` }[ask];
        const what = { n: t`$\sum 1 = n$`, Sx: t`$\sum x_i$`, Sxx: t`$\sum x_i^2$`, Sy: t`$\sum y_i$`, Sxy: t`$\sum x_iy_i$` }[ask];
        return {
          prompt: t`To fit $y = c_0 + c_1x$ to the points $${xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ')}$, the design matrix has rows $(1, x_i)$. Find ${where}.`,
          answer: vals[ask], tol: { rel: 0, abs: 0.01 },
          hints: [t`$A${T}A = \begin{bmatrix} n & \sum x_i \\ \sum x_i & \sum x_i^2 \end{bmatrix}$ and $A${T}\mathbf y = \begin{bmatrix} \sum y_i \\ \sum x_iy_i \end{bmatrix}$.`, t`This entry is ${what}.`],
          teach: 'For a straight-line fit, AᵀA and Aᵀy are just the five sums n, Σx, Σx², Σy and Σxy.',
          explain: t`${what} $= ${vals[ask]}$. In full, $A${T}A = ${matTeX([[vals.n, vals.Sx], [vals.Sx, vals.Sxx]])}$ and $A${T}\mathbf y = ${tupleTeX([vals.Sy, vals.Sxy])}$ — every column of $A$ dotted with every column, and with the data.`,
          visual: fitPic(xs, ys, { caption: 'The four data points.' }),
        };
      },
    }),
    num({
      id: 'line-fit', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const xs = [0, 1, 2, 3], b0 = r.int(-2, 3), b1 = r.intExcept(-2, 3, [0]), ys = xs.map((x) => b0 + b1 * x + r.int(-1, 1));
          const f = lsq(xs.map((x) => [1, x]), ys), slope = f.xhat[1], ends = (ys[3] - ys[0]) / 3, ask = r.int(0, 1);
          if (Math.abs(slope - ends) < 0.05 || f.ss < 0.1) continue;
          const ans = f.xhat[1 - ask];
          return {
            prompt: t`Fit $y = c_0 + c_1x$ by least squares to $${xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ')}$. What is the ${ask ? 'intercept $c_0$' : 'slope $c_1$'}?`,
            answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
            errors: ask ? [] : [{ value: ends, feedback: 'That is the slope through the first and last points only. Least squares uses all four, through the normal equations.' }],
            hints: [t`$A${T}A = ${matTeX(f.N)}$ and $A${T}\mathbf y = ${tupleTeX(f.rhs)}$.`, t`Solve $${f.N[0][0]}c_0 + ${f.N[0][1]}c_1 = ${f.rhs[0]}$ and $${f.N[1][0]}c_0 + ${f.N[1][1]}c_1 = ${f.rhs[1]}$.`],
            teach: 'The least-squares line comes from the 2 × 2 normal equations built from all the data.',
            explain: t`$\hat{\mathbf c} = (${nice(f.xhat[0])}, ${nice(f.xhat[1])})$: the line $y = ${nice(f.xhat[0])} + ${nice(f.xhat[1])}x$. Its residuals $${tupleTeX(f.res.map((e) => Math.round(e * 1000) / 1000))}$ add up to 0 and are perpendicular to $(0, 1, 2, 3)$ as well.`,
            visual: fitPic(xs, ys, { caption: 'The four data points. The best line misses each a little rather than one a lot.' }),
          };
        }
        return { prompt: t`Fit $y = c_0 + c_1x$ to $(0, 0), (1, 1), (2, 1), (3, 3)$: slope?`, answer: 0.9, hints: ['Normal equations.'], teach: 'Normal equations.', explain: t`$c_1 = 0.9$.` };
      },
    }),
    {
      type: 'slider', id: 'hooke-origin', difficulty: 2, param: 'k',
      gen(r) {
        const xs = [0.02, 0.04, 0.06, 0.08, 0.1], kTrue = r.pick([15, 20, 25, 30]), noise = [r.pick([-0.05, 0.05]), r.pick([0.08, -0.06]), r.pick([-0.1, 0.07]), r.pick([0.06, -0.09]), r.pick([-0.04, 0.1])];
        const Fs = xs.map((x, i) => Math.round((kTrue * x + noise[i]) * 100) / 100);
        const kh = dot(xs, Fs) / dot(xs, xs);
        const lo = Math.max(5, kTrue - 10), hi = kTrue + 10;
        return {
          prompt: t`A spring is stretched by $x = ${xs.join(',\\ ')}$ m under forces $F = ${Fs.join(',\\ ')}$ N. Hooke's law $F = kx$ has no intercept, so the design matrix is the single column $\mathbf x$. Slide $k$ until the sum of squared residuals is as small as it can be.`,
          answer: [kh - 0.25, kh + 0.25],
          visual: {
            type: 'graph',
            params: {
              x: [0, 0.11], y: [0, Math.max(...Fs) * 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'extension x (m)', ylabel: 'force F (N)',
              sliders: [{ key: 'k', label: t`Spring constant $k$`, min: lo, max: hi, step: 0.1, value: lo + 1, unit: '\\text{N/m}', explain: t`The slope of the line $F = kx$ through the origin.` }],
              curves: [{ fn: 'k*x', color: 'gold', width: 2.4 }, ...xs.map((x, i) => ({ param: [`${x}`, `${Fs[i]} + t*(k*${x} - ${Fs[i]})`], t: [0, 1], color: 'bad', width: 1.6, dash: [4, 3] }))],
              points: xs.map((x, i) => ({ x, y: Fs[i], color: 'accent', r: 5 })),
              readouts: [{ label: 'sum of squared residuals', expr: xs.map((x, i) => `(${Fs[i]} - k*${x})^2`).join(' + '), unit: '\\text{N}^2', digits: 3 }],
            },
            caption: 'The data, the line F = kx (gold) and the residuals (red). The readout is Σ(Fᵢ − kxᵢ)².',
          },
          instruction: 'Move the slider to make the sum of squared residuals smallest, then check.',
          hints: ['The sum falls, bottoms out, then rises again. Find the bottom.', t`With one column, the normal equation is a single number: $(\mathbf x\cdot\mathbf x)\,\hat k = \mathbf x\cdot\mathbf F$.`],
          teach: 'Least squares minimizes the sum of squared residuals; for a line through the origin the minimum is at k̂ = Σxᵢ Fᵢ / Σxᵢ².',
          explain: t`$\hat k = \dfrac{\mathbf x\cdot\mathbf F}{\mathbf x\cdot\mathbf x} = \dfrac{${nice(dot(xs, Fs), 4)}}{${nice(dot(xs, xs), 4)}} \approx ${nice(kh, 4)}$ N/m. It is the projection of $\mathbf F$ onto the line through $\mathbf x$ — LA-10.2 with a single column. The sum of squares is a parabola in $k$ whose bottom is where its derivative $-2\,\mathbf x\cdot(\mathbf F - k\mathbf x)$ vanishes: the residual is perpendicular to $\mathbf x$.`,
        };
      },
    },
    num({
      id: 'quad-g', difficulty: 3,
      gen(r) {
        const g0 = r.pick([9.81, 1.62, 3.71]), v = r.pick([2, 3, 4]), h0 = r.pick([1, 2, 5]), dt = 0.1;
        const us = [-2, -1, 0, 1, 2], noise = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)].map((n) => n / 1000);
        const hs = us.map((u, i) => Math.round((h0 + v * u * dt - 0.5 * g0 * (u * dt) ** 2 + noise[i]) * 1000) / 1000);
        const f = lsq(us.map((u) => [1, u, u * u]), hs), c2 = f.xhat[2], g = (-2 * c2) / (dt * dt);
        const place = { 9.81: 'on Earth', 1.62: 'on the Moon', 3.71: 'on Mars' }[g0];
        return {
          prompt: t`A camera ${place} films a falling instrument package at frames $u = -2, -1, 0, 1, 2$, taken $0.1$ s apart ($t = 0.1u$ s), and reads heights $h = ${hs.join(',\\ ')}$ m. Fit $h = c_0 + c_1u + c_2u^2$ by least squares. Since $h = h_0 + v_0t - \tfrac12gt^2$ with $t = 0.1u$, $c_2 = -\tfrac12g(0.1)^2$. What is $g$, in m/s²?`,
          answer: g, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: -c2 / (dt * dt), feedback: t`$c_2 = -\tfrac12 g(0.1)^2$, so $g = -2c_2/(0.1)^2$ — you dropped the factor 2.` }, { value: -2 * c2, feedback: t`That is $g$ in units per frame²: divide by $(0.1\text{ s})^2$ to get m/s².` }],
          hints: [t`With $u$ symmetric about 0, $A${T}A = \begin{bmatrix} 5 & 0 & 10 \\ 0 & 10 & 0 \\ 10 & 0 & 34 \end{bmatrix}$: $c_1$ decouples, and $c_0, c_2$ solve $5c_0 + 10c_2 = \sum h_i$, $10c_0 + 34c_2 = \sum u_i^2h_i$.`, t`$\sum h_i = ${nice(f.rhs[0], 5)}$ and $\sum u_i^2h_i = ${nice(f.rhs[2], 5)}$, so $c_2 = \dfrac{5\cdot${nice(f.rhs[2], 5)} - 10\cdot${nice(f.rhs[0], 5)}}{70}$.`],
          teach: 'A parabola is linear in its coefficients, so its fit is ordinary least squares with columns 1, u, u².',
          explain: t`$c_2 \approx ${nice(c2, 4)}$ m, so $g = -2c_2/0.01 \approx ${nice(g, 3)}$ m/s² (the data were made with $${g0}$ m/s² plus millimetre noise). Centring the times ($u$ symmetric about 0) is what made $A${T}A$ half empty.`,
          visual: fitPic(us.map((u) => u * dt), hs, { xlabel: 't (s)', ylabel: 'height h (m)', caption: 'The five readings. The fitted parabola is not drawn: finding it is the question.' }),
        };
      },
    }),
    mcq({
      id: 'weights', difficulty: 2,
      prompt: t`Four readings have $\sigma = 1$ mm and a fifth has $\sigma = 5$ mm. In a fit weighted by $w_i = 1/\sigma_i^2$, how much does the fifth reading count, compared with each of the others?`,
      choices: [t`$1/25$ as much`, t`$1/5$ as much`, 'The same: weights only change the error bars', 'Not at all: a reading with a large error is discarded'],
      answer: 0,
      why: {
        1: t`The weight is $1/\sigma^2$, not $1/\sigma$: a reading 5 times less precise counts 25 times less. That is what maximizes the likelihood for Gaussian errors.`,
        2: t`Weights change the fit itself: they appear in $A${T}WA$ and $A${T}W\mathbf y$, so a heavily weighted point pulls the line toward it.`,
        3: 'It still counts, just less. Discarding data because it is imprecise throws away information (and invites cherry-picking).',
      },
      hints: [t`$w_i = 1/\sigma_i^2$. Compute it for $\sigma = 1$ and for $\sigma = 5$.`],
      teach: 'Weighted least squares counts each equation by 1/σ², so precision matters quadratically.',
      explain: t`$w = 1$ for the precise readings and $1/25$ for the imprecise one. Equivalently, divide each row of $A$ and each $y_i$ by $\sigma_i$ and do ordinary least squares: every equation then has unit uncertainty.`,
      visual: fitPic([1, 2, 3, 4, 5], [1.1, 2.0, 2.9, 4.1, 5.8], { sy: [0.1, 0.1, 0.1, 0.1, 0.5], x: [0.4, 5.6], y: [0, 6.6], caption: 'Five readings with ±σ error bars; the last one is five times less certain.' }),
    }),
    mcq({
      id: 'residual-sum', difficulty: 2,
      prompt: t`For any least-squares line $y = c_0 + c_1x$ (unweighted, with an intercept), which is always true of the residuals $e_i = y_i - c_0 - c_1x_i$?`,
      choices: [t`$\sum e_i = 0$ and $\sum x_ie_i = 0$`, t`Every $e_i = 0$`, t`$\sum |e_i|$ is as small as possible`, t`Half of them are positive`],
      answer: 0,
      why: {
        1: t`Only if the points happen to lie on a line. Least squares makes the residual *short*, not zero: $A\hat{\mathbf c}$ is the projection of $\mathbf y$, and $\mathbf y$ itself is usually outside $C(A)$.`,
        2: t`That is a different fit (least absolute deviations). Least squares minimizes $\sum e_i^2$, which is what makes the solution a projection with linear equations.`,
        3: t`Not necessarily: one large positive residual can balance several small negative ones. What is guaranteed is $\sum e_i = 0$.`,
      },
      hints: [t`The residual vector $\mathbf e$ is perpendicular to every column of $A$.`, t`The columns are $(1, 1, \dots, 1)$ and $(x_1, x_2, \dots)$.`],
      teach: 'The normal equations say Aᵀe = 0: the residual is perpendicular to every column, so it sums to zero against each.',
      explain: t`$A${T}\mathbf e = \mathbf 0$ with columns $\mathbf 1$ and $\mathbf x$ reads $\sum e_i = 0$ and $\sum x_ie_i = 0$. So the line passes through the centroid $(\bar x, \bar y)$ of the data.`,
      visual: fitPic([0, 1, 2, 3, 4], [1.0, 2.6, 2.4, 4.1, 4.3], { fn: '1.26 + 0.81*x', at: (x) => 1.26 + 0.81 * x, caption: 'Five points, their least-squares line and the residuals (red): the ones above and below the line balance.' }),
    }),
    code({
      id: 'lstsq-code', difficulty: 3,
      prompt: t`A camera tracks a tossed ball; the frame at 0.4 s is blurred (larger $\sigma$). Build the design matrix \`A\` with columns $1, t, t^2$. Set \`c_normal\` by solving the **weighted** normal equations $A${T}WA\,\mathbf c = A${T}W\mathbf h$ with \`np.linalg.solve\`, and \`c_lstsq\` with \`np.linalg.lstsq\` applied to the rows scaled by $1/\sigma_i$ (so each equation has unit uncertainty). Set \`g\` to $-2c_2$ and \`sigma_g\` to $2\sqrt{C_{22}}$, where $C = (A${T}WA)^{-1}$ is the parameter covariance.`,
      starter: t`import numpy as np

t = np.array([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8])
h = np.array([${HS.join(', ')}])
sigma = np.array([${SIG.join(', ')}])

A = None          # TODO: columns 1, t, t^2
c_normal = None   # TODO: solve A^T W A c = A^T W h
c_lstsq = None    # TODO: np.linalg.lstsq on A / sigma[:, None] and h / sigma
g = None
sigma_g = None

print(c_normal, c_lstsq, g, sigma_g)
`,
      answer: t`import numpy as np

t = np.array([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8])
h = np.array([${HS.join(', ')}])
sigma = np.array([${SIG.join(', ')}])

A = np.column_stack([np.ones_like(t), t, t**2])
W = np.diag(1 / sigma**2)
N = A.T @ W @ A
c_normal = np.linalg.solve(N, A.T @ W @ h)
c_lstsq = np.linalg.lstsq(A / sigma[:, None], h / sigma, rcond=None)[0]
C = np.linalg.inv(N)
g = -2 * c_normal[2]
sigma_g = 2 * np.sqrt(C[2, 2])

print(c_normal, c_lstsq, g, sigma_g)
`,
      tests: [
        { name: '`A` is 9 × 3 with columns 1, t, t²', code: 'A.shape == (9, 3) and np.allclose(A[:, 2], t**2) and np.allclose(A[:, 0], 1)' },
        { name: 'the normal equations and lstsq agree', code: 'np.allclose(c_normal, c_lstsq, atol=1e-9)' },
        { name: 'the residual is perpendicular to every column (in the weighted inner product)', code: 'np.allclose(A.T @ ((h - A @ c_normal) / sigma**2), 0, atol=1e-6)' },
        { name: `g is about ${nice(gOf('11'), 3)} m/s²`, code: `abs(g - ${gOf('11')}) < 1e-6` },
        { name: '`sigma_g` comes from the covariance matrix', code: '(lambda N: abs(sigma_g - 2*np.sqrt(np.linalg.inv(N)[2, 2])) < 1e-9)((A / sigma[:, None]).T @ (A / sigma[:, None]))' },
      ],
      hints: [t`\`A = np.column_stack([np.ones_like(t), t, t**2])\`, \`W = np.diag(1 / sigma**2)\`, then \`np.linalg.solve(A.T @ W @ A, A.T @ W @ h)\`.`, t`\`np.linalg.lstsq(A / sigma[:, None], h / sigma, rcond=None)[0]\`; and \`C = np.linalg.inv(A.T @ W @ A)\`, \`sigma_g = 2 * np.sqrt(C[2, 2])\`.`],
      teach: 'Weighted least squares is ordinary least squares on rows divided by σ; lstsq (via QR or the SVD) and the normal equations give the same answer on a well-conditioned problem.',
      explain: t`Both routes give $g \approx ${nice(gOf('11'), 3)}$ m/s². \`lstsq\` never forms $A${T}A$ (it uses the SVD), which is safer when the columns are nearly dependent — with $t$ in seconds, $1, t, t^2$ already are somewhat. Unweighted, the blurred frame would pull $g$ to $${nice(gOf('10'), 3)}$ m/s².`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-slope', difficulty: 2,
      gen(r) {
        const xs = [1, 2, 3, 4], ys = xs.map((x) => r.int(0, 2) + 2 * x + r.int(-1, 1));
        const f = lsq(xs.map((x) => [1, x]), ys);
        return {
          prompt: t`Find the slope of the least-squares line through $${xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ')}$.`,
          answer: f.xhat[1], tol: { rel: 1e-3, abs: 1e-3 },
          hints: [t`$A${T}A = ${matTeX(f.N)}$, $A${T}\mathbf y = ${tupleTeX(f.rhs)}$.`],
          teach: 'Solve the normal equations.',
          explain: t`$\hat{\mathbf c} = (${nice(f.xhat[0])}, ${nice(f.xhat[1])})$, so the slope is $${nice(f.xhat[1])}$.`,
          visual: fitPic(xs, ys, { caption: 'The four data points.' }),
        };
      },
    }),
    num({
      id: 'cp-thrust', difficulty: 3, transfer: true,
      gen(r) {
        const base = r.int(400, 460), s = r.pick([[1, 2, 4], [0.5, 1, 2], [1, 3, 5]]), m = s.map((x) => Math.round((base + r.float(-1.2, 1.2, 0.1) * x) * 10) / 10);
        const w = s.map((x) => 1 / (x * x)), mean = dot(w, m) / w.reduce((a, b) => a + b, 0), plain = m.reduce((a, b) => a + b, 0) / 3;
        return {
          prompt: t`Three test-stand firings measure the same engine's vacuum thrust as $${m[0]} \pm ${s[0]}$ kN, $${m[1]} \pm ${s[1]}$ kN and $${m[2]} \pm ${s[2]}$ kN. Treat it as the least-squares problem $A\,F = \mathbf b$ with $A = (1, 1, 1)${T}$ (one unknown $F$, three equations) and weights $w_i = 1/\sigma_i^2$. What is the best estimate of $F$, in kN?`,
          answer: mean, units: 'kN', tol: { rel: 1e-4, abs: 0.01 },
          errors: [{ value: plain, feedback: t`That is the plain average — equal weights. Solve $A${T}WA\,F = A${T}W\mathbf b$, which weights each firing by $1/\sigma_i^2$.` }].filter((e) => Math.abs(e.value - mean) > 0.1),
          hints: [t`$A${T}WA = \sum w_i$ and $A${T}W\mathbf b = \sum w_ib_i$ — both single numbers.`, t`$w = (${w.map((x) => nice(x)).join(', ')})\ \text{kN}^{-2}$.`],
          teach: 'With a single column of ones, weighted least squares is the weighted mean Σwᵢbᵢ / Σwᵢ.',
          explain: t`$F = \dfrac{\sum w_ib_i}{\sum w_i} \approx ${nice(mean, 5)}$ kN, with uncertainty $1/\sqrt{\sum w_i} \approx ${nice(1 / Math.sqrt(w.reduce((a, b) => a + b, 0)), 2)}$ kN — smaller than any single firing's. Combining is honest only if the firings agree within their errors; if they do not, something systematic differs between them, and a weighted mean hides it.`,
          visual: fitPic([1, 2, 3], m, { sy: s, x: [0.4, 3.6], xlabel: 'firing', ylabel: 'thrust (kN)', caption: 'The three measurements with ±σ error bars. The estimate is a horizontal line — a model with one parameter.' }),
        };
      },
    }),
    mcq({
      id: 'cp-exact', difficulty: 2,
      prompt: t`$A$ is $20\times3$ with independent columns and $\hat{\mathbf x}$ solves $A${T}A\hat{\mathbf x} = A${T}\mathbf b$. What is $A\hat{\mathbf x}$?`,
      choices: [t`The projection of $\mathbf b$ onto the column space of $A$`, t`$\mathbf b$ itself: least squares solves $A\mathbf x = \mathbf b$ exactly`, t`The vector $\mathbf b - A\hat{\mathbf x}$`, t`The projection of $\mathbf b$ onto the null space of $A$`],
      answer: 0,
      why: {
        1: t`Only when $\mathbf b$ already lies in $C(A)$ — 20 noisy readings almost never fit 3 parameters exactly. Least squares finds the closest vector $A\hat{\mathbf x}$, not an exact solution.`,
        2: t`That is the residual $\mathbf e$, which is perpendicular to $C(A)$.`,
        3: t`The null space of $A$ lives in $\mathbb R^3$ (inputs), $\mathbf b$ in $\mathbb R^{20}$ (outputs); with independent columns $N(A) = \{\mathbf 0\}$ anyway.`,
      },
      hints: ['The normal equations say the residual b − Ax̂ is perpendicular to every column of A.'],
      teach: 'The fitted values Ax̂ are the orthogonal projection of the data onto the column space.',
      explain: t`$A\hat{\mathbf x} = A(A${T}A)^{-1}A${T}\mathbf b = P\mathbf b$: least squares *is* projection. The picture shows it with three readings and two parameters.`,
      visual: planePic([1, 1, 1], [0, 1, 2], [1, 3, 2], { names: ['\\mathbf 1', '\\mathbf x'], caption: 'Three readings b, two columns (1, 1, 1) and (0, 1, 2): the fitted values p are the projection of b onto their plane, and the residual e is perpendicular to it. Drag to rotate.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §4.3: Least squares approximations', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Taylor, An Introduction to Error Analysis (2nd ed.), ch. 7–8: weighted averages and least-squares fitting', url: 'https://uscibooks.aip.org/books/introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-2nd-ed/' },
    { label: 'NumPy documentation: numpy.linalg.lstsq', url: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html' },
  ],
});
