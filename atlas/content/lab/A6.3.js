// Covariance and correlated errors — a fit's parameters are not independent:
// the covariance matrix of a straight line (Var a = Sxx/Δ, Var b = S/Δ,
// Cov = −Sx/Δ), the correlation coefficient, the Δχ² = 1 error ellipse, and
// centring the x-data to remove the correlation. Using the covariance:
// a prediction σ_y(x)² = σa² + x²σb² + 2x Cov, and a ratio b/a. Correlated
// errors in the data themselves: a shared calibration error does not average
// away. A Pt100's temperature coefficient (from lab.A5.1), a GPS satellite's
// clock, and a NumPy covariance matrix.
// Every number is computed here (seeded synthetic data, _labf.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { normals, linfit, dataGraph, ellipse, r6, sf, SIMNOTE, table } from './_labf.js';

const t = String.raw;

// ── Explore: six points at x = c + (−5, −3, −1, 1, 3, 5), σ = 1; the slider c moves the data away from x = 0 ──
// σ_b² = 1/70, σ_a² = (c² + 70/6)/70, Cov = −c/70, ρ = −c/√(c² + 70/6)
const SB = '(1/sqrt(70))', SA = '(sqrt((c^2 + 70/6)/70))', RHO = '(-c/sqrt(c^2 + 70/6))';

// ── the worked example: the Pt100 data of lab.A5.1 (seed 11) ──
const PT_T = [0, 20, 40, 60, 80, 100];
const PT_R = (() => { const z = normals(11); return PT_T.map((x) => +(100 * (1 + 0.00385 * x) + 0.05 * z()).toFixed(2)); })();
const PT = linfit(PT_T, PT_R);
const PT_rho = PT.cov / (PT.sa * PT.sb);
const ALPHA = PT.b / PT.a;
const relNo = Math.sqrt((PT.sb / PT.b) ** 2 + (PT.sa / PT.a) ** 2);
const relCov = Math.sqrt((PT.sb / PT.b) ** 2 + (PT.sa / PT.a) ** 2 - (2 * PT.cov) / (PT.a * PT.b));
// centred: R = A + b (T − 50)
const PT_A = PT.a + PT.b * PT.xbar, PT_sA = PT.s / Math.sqrt(PT.n);

export default lesson({
  id: 'lab.A6.3',
  title: 'Covariance and correlated errors',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`The slope and intercept of a fitted line come from the **same** data, so their errors are linked. Tilt the line a little steeper about the centre of the data and its intercept drops: when the data sit to the right of $x = 0$, a too-large slope goes with a too-small intercept. The **covariance matrix** records this. For a weighted straight line,

$$\begin{pmatrix} \sigma_a^2 & \operatorname{cov}(a,b) \\ \operatorname{cov}(a,b) & \sigma_b^2 \end{pmatrix} = \frac{1}{\Delta}\begin{pmatrix} S_{xx} & -S_x \\ -S_x & S \end{pmatrix}$$

and the **correlation coefficient** $\rho = \operatorname{cov}(a,b)/(\sigma_a\sigma_b)$ runs from $-1$ to $+1$. The jointly allowed $(a, b)$ form a tilted **error ellipse**. Any quantity built from both — the line's value at some $x$, the ratio $b/a$ — needs the covariance term in its propagation. Measure $x$ from the centre of the data ($x - \bar x$) and the correlation vanishes.`,
  symbols: [
    { tex: '\\sigma_a^2,\\ \\sigma_b^2', text: 'the variances (squared standard uncertainties) of the intercept and slope' },
    { tex: '\\operatorname{cov}(a,b)', text: 'their covariance, in units of $a$ times units of $b$: negative when a larger slope goes with a smaller intercept' },
    { tex: '\\rho', text: 'the correlation coefficient $\\operatorname{cov}(a,b)/(\\sigma_a\\sigma_b)$, dimensionless, between $-1$ and $1$' },
    { tex: 'S,\\ S_x,\\ S_{xx}', text: 'the weighted sums $\\sum w_i$, $\\sum w_ix_i$, $\\sum w_ix_i^2$ with $w_i = 1/\\sigma_i^2$' },
    { tex: '\\Delta', text: 'the determinant $S\\,S_{xx} - S_x^2$' },
  ],
  why: t`Every extrapolation — a clock’s offset next week, a sensor at a temperature you did not calibrate at, an orbit propagated forward — is wrong in its error bar if it ignores the covariance.`,
  visual: {
    type: 'graph',
    title: 'The error ellipse, and how to untilt it',
    lead: t`Six points, each with $\sigma = 1$, spread over 10 units of $x$ around a centre $c$. The ellipse is the set of (slope, intercept) pairs within $\Delta\chi^2 = 1$ of the best fit, drawn relative to the best values; the dashed box is what you would draw if you ignored the covariance. Slide the centre of the data away from $x = 0$.`,
    tasks: [
      'At c = 0 the ellipse is upright: slope and intercept are uncorrelated.',
      'Slide c to 20: the ellipse tilts into a long, thin diagonal (ρ ≈ −0.99) and the intercept’s uncertainty grows, while the slope’s does not change at all.',
      'Look at how much of the dashed box lies outside the ellipse: those (slope, intercept) pairs are not allowed together. Ignoring ρ treats them as allowed.',
    ],
    params: {
      aspect: 'wide', x: [-0.22, 0.22], y: [-3, 3], xlabel: 'slope − best slope', ylabel: 'intercept − best intercept', axesAt: 'edge',
      sliders: [{ key: 'c', label: t`Centre of the data $c$`, min: -20, max: 20, step: 0.5, value: 8, unit: '', explain: t`Where the middle of the six $x$ values sits relative to $x = 0$, where the intercept is read.` }],
      curves: [
        { param: [`${SB}*cos(t)`, `${SA}*(${RHO}*cos(t) + sqrt(1 - ${RHO}^2)*sin(t))`], t: [0, '2*pi'], color: 'accent', width: 2.4 },
        { param: [`-${SB} + 2*${SB}*t`, SA], t: [0, 1], color: 'ink3', dash: [5, 4], width: 1.4 },
        { param: [`-${SB} + 2*${SB}*t`, `-${SA}`], t: [0, 1], color: 'ink3', dash: [5, 4], width: 1.4 },
        { param: [SB, `-${SA} + 2*${SA}*t`], t: [0, 1], color: 'ink3', dash: [5, 4], width: 1.4 },
        { param: [`-${SB}`, `-${SA} + 2*${SA}*t`], t: [0, 1], color: 'ink3', dash: [5, 4], width: 1.4 },
      ],
      readouts: [
        { label: '$\\rho$', expr: RHO, digits: 3, zero: 1e-9 },
        { label: '$\\sigma_a$', expr: SA, digits: 3 },
        { label: '$\\sigma_b$', expr: SB, digits: 3 },
      ],
    },
    caption: 'Exact formulas for six equally weighted points at c ± 1, ± 3, ± 5. The ellipse’s shadow on each axis is exactly ±1σ of that parameter; the ellipse is drawn about the best fit, whatever the data.',
  },
  example: {
    prompt: t`The Pt100 fit of [the first fitting lesson](#/lesson/lab.A5.1) gave $a = ${PT.a.toFixed(4)} \pm ${PT.sa.toFixed(4)}\ \Omega$ and $b = ${PT.b.toFixed(6)} \pm ${tex(PT.sb, 3)}\ \Omega/^\circ\text{C}$ from six points at $T = 0, 20, \ldots, 100\ ^\circ\text{C}$ with residual scatter $s = ${PT.s.toFixed(4)}\ \Omega$. Find the uncertainty of the temperature coefficient $\alpha = b/a$.`,
    visual: { type: 'graph', params: { aspect: 'wide', x: [r6(PT.b - 2.6 * PT.sb), r6(PT.b + 2.6 * PT.sb)], y: [r6(PT.a - 2.6 * PT.sa), r6(PT.a + 2.6 * PT.sa)], xlabel: 'slope b (Ω/°C)', ylabel: 'intercept a (Ω)', axesAt: 'edge', xticks: 5, curves: [ellipse(PT.b, PT.a, PT.sb, PT.sa, PT_rho, 1, { color: 'accent' }), { fn: `${r6(PT.a)}*x/${r6(PT.b)}`, color: 'gold', width: 1.4, dash: [6, 4] }], points: [{ x: r6(PT.b), y: r6(PT.a), r: 4, color: 'accent' }] }, caption: t`The $1\sigma$ ellipse of $(b, a)$. The dashed gold line is a line of constant $\alpha = b/a$ through the best fit: the ellipse lies *across* it, not along it, which is why the covariance matters here. Synthetic data. ${SIMNOTE}` },
    steps: [
      { label: 'The covariance', text: t`For an unweighted fit, $\operatorname{cov}(a,b) = -\bar T s^2/S_{xx} = -50 \times ${PT.s.toFixed(4)}^2/7000 = ${tex(PT.cov, 3)}\ \Omega^2/^\circ\text{C}$.` },
      { label: 'Correlation', text: t`$\rho = ${tex(PT.cov, 3)}/(${PT.sa.toFixed(4)} \times ${tex(PT.sb, 3)}) = ${PT_rho.toFixed(3)}$: strongly negative, because the data sit well to the right of $T = 0$.` },
      { label: 'Propagate with covariance', text: t`For $\alpha = b/a$: $\left(\dfrac{\sigma_\alpha}{\alpha}\right)^2 = \left(\dfrac{\sigma_b}{b}\right)^2 + \left(\dfrac{\sigma_a}{a}\right)^2 - \dfrac{2\operatorname{cov}(a,b)}{ab}$ (the general formula of [propagation](#/lesson/lab.A3.2), with the cross term kept).` },
      { label: 'Numbers', text: t`$(${tex(PT.sb / PT.b, 3)})^2 + (${tex(PT.sa / PT.a, 3)})^2 + ${tex((-2 * PT.cov) / (PT.a * PT.b), 3)}$, so $\sigma_\alpha/\alpha = ${tex(relCov, 3)}$ and $\sigma_\alpha = ${tex(ALPHA * relCov, 2)}$ per °C.` },
      { label: 'Without it', text: t`Dropping the covariance gives $\sigma_\alpha/\alpha = ${tex(relNo, 3)}$ — too small by a factor ${(relCov / relNo).toFixed(2)}. With $\rho < 0$ and a ratio, the cross term *adds*: a too-steep slope comes with a too-low intercept, and both push $b/a$ the same way.` },
      { label: 'Centre instead', text: t`Refit as $R = A + b\,(T - 50)$: $A = ${PT_A.toFixed(4)}\ \Omega$ with $\sigma_A = s/\sqrt6 = ${PT_sA.toFixed(4)}\ \Omega$, uncorrelated with $b$. Then $a = A - 50b$, and propagating from $(A, b)$ needs no covariance term — the same answer, by an easier road.` },
    ],
    answer: t`$\alpha = ${tex(ALPHA, 4)} \pm ${tex(ALPHA * relCov, 2)}$ per °C (ignoring the covariance would claim $\pm ${tex(ALPHA * relNo, 2)}$).`,
  },
  practice: [
    num({
      id: 'rho-line', difficulty: 2,
      gen(r) {
        const N = r.int(5, 8), x0 = r.int(2, 30), step = r.pick([1, 2, 5]);
        const xs = Array.from({ length: N }, (_, k) => x0 + step * k);
        const f = linfit(xs, xs.map(() => 0), 1);
        const ans = f.rho;
        return {
          prompt: t`${N} points with equal uncertainties sit at $x = ${xs.join(',\\ ')}$. What is the correlation coefficient $\rho$ between the fitted intercept and slope?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-3, xs[N - 1] + 3], y: [-1, 1], xlabel: 'x', ylabel: '', yticks: 0, axesAt: 'edge', vlines: [{ x: 0, label: 'x = 0', color: 'warn' }], points: xs.map((x) => ({ x, y: 0, r: 4, color: 'accent' })) }, caption: 'Where the data sit relative to x = 0, where the intercept is read.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: -ans, feedback: t`Sign: with all $x > 0$, a steeper line through the centroid crosses $x = 0$ lower, so $\rho < 0$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`With equal weights, $\rho = -S_x/\sqrt{S\,S_{xx}} = -\bar x/\sqrt{\overline{x^2}}$, where $\overline{x^2}$ is the mean of the squares.`, t`$\bar x = ${r6(f.xbar)}$ and $\overline{x^2} = ${r6(f.Sxx / N)}$.`],
          teach: 'The farther the data sit from x = 0, the more strongly the intercept and slope are (negatively) correlated.',
          explain: t`$\rho = -${r6(f.xbar)}/\sqrt{${r6(f.Sxx / N)}} = ${ans.toFixed(3)}$. Notice the $y$ values and $\sigma$ do not matter: correlation is set by where you measured.`,
        };
      },
    }),
    num({
      id: 'predict', difficulty: 3,
      gen(r) {
        const sa = r.float(0.2, 0.8, 0.01), sb = r.float(0.02, 0.08, 0.001), rho = -r.float(0.80, 0.97, 0.01);
        const cov = rho * sa * sb, x0 = r.int(15, 30);
        const v = sa * sa + x0 * x0 * sb * sb + 2 * x0 * cov;
        const ans = Math.sqrt(v), no = Math.sqrt(sa * sa + x0 * x0 * sb * sb);
        return {
          prompt: t`A line fit gives $\sigma_a = ${sa}$, $\sigma_b = ${sb}$ and $\operatorname{cov}(a, b) = ${tex(cov, 4)}$ ($\rho = ${rho.toFixed(2)}$). What is the standard uncertainty of the line’s predicted value $y = a + bx$ at $x = ${x0}$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [r6(-1.6 * sb), r6(1.6 * sb)], y: [r6(-1.6 * sa), r6(1.6 * sa)], xlabel: 'slope − best slope', ylabel: 'intercept − best intercept', axesAt: 'edge', xticks: 5, curves: [ellipse(0, 0, sb, sa, rho, 1, { color: 'accent' })] }, caption: 'The fit’s 1σ error ellipse: a and b are strongly anticorrelated.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: no, feedback: t`You dropped the covariance term $2x\operatorname{cov}(a,b)$. With $\rho < 0$ it is large and negative here.` }, { value: Math.sqrt(Math.max(0, sa * sa + x0 * x0 * sb * sb + x0 * cov)), feedback: t`The cross term is $2x\operatorname{cov}$: the factor 2 comes from expanding $(\delta a + x\,\delta b)^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_y^2 = \sigma_a^2 + x^2\sigma_b^2 + 2x\operatorname{cov}(a, b)$.`, t`$\sigma_a^2 = ${r6(sa * sa)}$, $x^2\sigma_b^2 = ${r6(x0 * x0 * sb * sb)}$, $2x\operatorname{cov} = ${r6(2 * x0 * cov)}$.`],
          teach: 'A prediction from a fitted line propagates both parameters — and their covariance.',
          explain: t`$\sigma_y^2 = ${r6(sa * sa)} + ${r6(x0 * x0 * sb * sb)} ${2 * x0 * cov < 0 ? '-' : '+'} ${r6(Math.abs(2 * x0 * cov))} = ${r6(v)}$, so $\sigma_y = ${ans.toPrecision(3)}$, against $${no.toPrecision(3)}$ without the covariance. Near the centre of the data, the line is pinned down far better than $a$ and $b$ separately suggest.`,
        };
      },
    }),
    mcq({
      id: 'centre', difficulty: 2,
      prompt: t`You refit $y = A + b\,(x - \bar x)$ instead of $y = a + bx$. Which statement is true?`,
      visual: (() => { const z = normals(5); const xs = [21, 23, 25, 27, 29, 31]; const ys = xs.map((x) => +(3 + 0.5 * x + 0.4 * z()).toFixed(2)); const f = linfit(xs, ys, 0.4); return { type: 'graph', params: dataGraph({ xs, ys, sy: 0.4, fit: f, xlabel: 'x', ylabel: 'y', vlines: [{ x: r6(f.xbar), label: 'mean x', color: 'gold' }] }), caption: 'Data far from x = 0. Read at the mean x, the line is pinned down best.' }; })(),
      choices: [t`$b$ is unchanged, $A$ is the line’s value at $\bar x$, and $\operatorname{cov}(A, b) = 0$`, t`Both $b$ and its uncertainty change`, t`$A$ equals $a$, only better determined`, t`Centring removes the need to know $\sigma_b$`],
      answer: 0,
      why: { 1: 'Shifting x by a constant does not change slopes.', 2: t`$A = a + b\bar x$: a different quantity, the height at the centre, not at zero.`, 3: t`$\sigma_b$ is untouched; only the intercept’s meaning and its correlation with $b$ change.` },
      hints: [t`With $x' = x - \bar x$, what is $S_{x'}$ — the weighted sum of the $x'$?`],
      teach: 'Centring the x-data decorrelates intercept and slope: cov ∝ −Sx, which centring makes zero.',
      explain: t`$\operatorname{cov} = -S_x/\Delta$ and $\sum w_i(x_i - \bar x_w) = 0$, so the covariance vanishes. $A$ is the best-determined point of the line, with $\sigma_A = 1/\sqrt{S}$ — for equal weights, $\sigma/\sqrt N$. Report $(A, b)$ and nobody downstream needs your covariance.`,
    }),
    mcq({
      id: 'tilt', difficulty: 2,
      prompt: t`The picture shows the $1\sigma$ error ellipse of a fit’s intercept $a$ against its slope $b$. What does its tilt say?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [1.7, 2.3], y: [3, 7], xlabel: 'slope b', ylabel: 'intercept a', axesAt: 'edge', curves: [ellipse(2, 5, 0.1, 0.8, -0.93, 1, { color: 'accent' })], points: [{ x: 2, y: 5, r: 4, color: 'accent' }] }, caption: 'A 1σ error ellipse (ρ = −0.93).' },
      choices: ['A larger slope goes with a smaller intercept: the data lie at positive x, far from x = 0', 'The slope and intercept are independent', 'The intercept is known better than the slope', 'The fit is bad'],
      answer: 0,
      why: { 1: 'Independent parameters give an ellipse with its axes along the coordinate axes.', 2: t`The ellipse’s half-widths are $\sigma_b$ and $\sigma_a$, each in its own parameter’s units; the tilt says nothing about which is “better”.`, 3: 'The ellipse shows parameter uncertainties, not goodness of fit (that is χ²).' },
      hints: ['Follow the ellipse’s long axis: as b increases, what does a do?'],
      teach: 'An ellipse tilted down to the right means negative correlation — typical when the data sit at positive x.',
      explain: t`The long axis runs down to the right: steeper lines pivot about the centre of the data and cross $x = 0$ lower. Strong correlation ($\rho = -0.93$) means $a$ alone is poorly known, yet combinations like $a + b\bar x$ are known well.`,
    }),
    num({
      id: 'common-error', difficulty: 3,
      gen(r) {
        const sr = r.float(0.2, 0.6, 0.01), sc = r.float(0.10, 0.30, 0.01), N = r.pick([4, 9, 16, 25, 100]);
        const ans = Math.sqrt(sr * sr / N + sc * sc);
        return {
          prompt: t`A thermocouple reads a furnace ${N} times. Each reading has a random error of $${sr}$ K, and all share the thermocouple’s calibration uncertainty of $${sc}$ K (the same unknown offset in every reading). What is the standard uncertainty of the mean?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 101], y: [0, r6(1.15 * Math.sqrt(sr * sr + sc * sc))], xlabel: 'number of readings N', ylabel: 'σ of the mean (K)', axesAt: 'edge', curves: [{ fn: `sqrt(${r6(sr * sr)}/x + ${r6(sc * sc)})`, color: 'accent', domain: [1, 101] }, { fn: `${sr}/sqrt(x)`, color: 'ink3', dash: [6, 4], domain: [1, 101] }], hlines: [{ y: sc, label: 'calibration floor', color: 'warn' }] }, caption: 'The uncertainty of the mean against N (solid) and what it would be with no shared error (dashed).' },
          answer: ans, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((sr * sr + sc * sc) / N), feedback: 'You divided the shared error by √N too. A common offset is the same in every reading: averaging cannot reduce it.' }, { value: sr / Math.sqrt(N) + sc, feedback: 'Independent contributions add in quadrature, not linearly.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The random part averages down as $1/\sqrt N$; the shared part does not.`, t`$\sigma^2 = \sigma_r^2/N + \sigma_c^2$.`],
          teach: 'Errors shared by every reading are perfectly correlated: they do not average away.',
          explain: t`$\sqrt{${sr}^2/${N} + ${sc}^2} = ${ans.toFixed(3)}$ K. However many readings you take, you never beat $${sc}$ K: only a better calibration can. (The covariance between any two readings is $\sigma_c^2$; that is what “correlated errors” means.)`,
        };
      },
    }),
    code({
      id: 'covmat', difficulty: 3,
      prompt: t`For a weighted straight line the covariance matrix is $(A^\mathsf{T}WA)^{-1}$, where the **design matrix** $A$ has rows $(1, x_i)$ and $W$ is diagonal with entries $1/\sigma_i^2$. Write \`covmat(x, sigma)\` returning that $2\times2$ matrix, and \`rho(C)\` returning the correlation coefficient. The program compares the raw and the centred $x$.`,
      starter: t`import numpy as np

def covmat(x, sigma):
    x, sigma = np.asarray(x, float), np.asarray(sigma, float)
    # your code: the design matrix, W, and the inverse of A^T W A
    return C

def rho(C):
    return 0.0

x = np.array([21., 23, 25, 27, 29, 31])
sigma = np.full(6, 0.4)
print("raw:     ", rho(covmat(x, sigma)))
print("centred: ", rho(covmat(x - x.mean(), sigma)))`,
      answer: t`import numpy as np

def covmat(x, sigma):
    x, sigma = np.asarray(x, float), np.asarray(sigma, float)
    A = np.column_stack([np.ones_like(x), x])
    W = np.diag(1 / sigma**2)
    return np.linalg.inv(A.T @ W @ A)

def rho(C):
    return C[0, 1] / np.sqrt(C[0, 0] * C[1, 1])

x = np.array([21., 23, 25, 27, 29, 31])
sigma = np.full(6, 0.4)
print("raw:     ", rho(covmat(x, sigma)))
print("centred: ", rho(covmat(x - x.mean(), sigma)))`,
      tests: [
        { name: t`the diagonal holds $\sigma_a^2 = S_{xx}/\Delta$ and $\sigma_b^2 = S/\Delta$`, code: `np.allclose(np.diag(covmat(x, sigma)), [${linfit([21, 23, 25, 27, 29, 31], [0, 0, 0, 0, 0, 0], 0.4).sa ** 2}, ${linfit([21, 23, 25, 27, 29, 31], [0, 0, 0, 0, 0, 0], 0.4).sb ** 2}], rtol=1e-9)` },
        { name: t`the raw data give $\rho = ${linfit([21, 23, 25, 27, 29, 31], [0, 0, 0, 0, 0, 0], 0.4).rho.toFixed(4)}$`, code: `abs(rho(covmat(x, sigma)) - (${linfit([21, 23, 25, 27, 29, 31], [0, 0, 0, 0, 0, 0], 0.4).rho})) < 1e-9` },
        { name: 'centring the x-data makes ρ zero', code: 'abs(rho(covmat(x - x.mean(), sigma))) < 1e-9' },
        { name: 'unequal σ: covmat matches the weighted sums', code: `abs(covmat([1, 2, 4], [0.1, 0.2, 0.5])[0, 1] - (${linfit([1, 2, 4], [0, 0, 0], [0.1, 0.2, 0.5]).cov})) < 1e-9` },
      ],
      hints: [t`\`A = np.column_stack([np.ones_like(x), x])\`; \`W = np.diag(1 / sigma**2)\`.`, t`\`np.linalg.inv(A.T @ W @ A)\`, and \`rho = C[0, 1] / np.sqrt(C[0, 0] * C[1, 1])\`.`],
      teach: 'The covariance matrix of any linear least-squares fit is (AᵀWA)⁻¹ — for a line it reproduces the Sxx/Δ, −Sx/Δ, S/Δ formulas.',
      explain: t`The raw $x$ give $\rho = ${linfit([21, 23, 25, 27, 29, 31], [0, 0, 0, 0, 0, 0], 0.4).rho.toFixed(3)}$; centred, $\rho = 0$ exactly. The same \`A.T @ W @ A\` works for any model linear in its parameters (a polynomial, sines and cosines); for nonlinear fits $A$ becomes the Jacobian. (Solving the normal equations by inverting is fine for a 2×2; for big or ill-conditioned problems see [normal equations versus QR](#/lesson/st-f.F8.1).)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const z = normals(r.int(1, 999999));
        const days = [1, 2, 3, 4, 5, 6, 7], s = 0.8;
        const a0 = r.float(5, 20, 0.1), drift = r.float(1.5, 4.5, 0.01);
        const ys = days.map((d) => +(a0 + drift * d + s * z()).toFixed(1));
        const f = linfit(days, ys, s);
        const x0 = r.pick([10, 12, 14]);
        const v = f.sa ** 2 + x0 * x0 * f.sb ** 2 + 2 * x0 * f.cov, ans = Math.sqrt(v);
        const no = Math.sqrt(f.sa ** 2 + x0 * x0 * f.sb ** 2);
        return {
          prompt: t`A GPS satellite’s clock offset from system time is estimated once a day, each to $\pm 0.8$ ns: ${ys.map((y) => `$${y}$`).join(', ')} ns on days 1 to 7. A straight-line fit (known $\sigma$) predicts the offset on day ${x0}. What is the standard uncertainty of that prediction?`,
          visual: { type: 'graph', params: dataGraph({ xs: days, ys, sy: s, fit: f, xlabel: 'day', ylabel: 'clock offset (ns)', x: [0, x0 + 1], y: [r6(Math.min(...ys) - 3), r6(f.a + f.b * (x0 + 1) + 3)], vlines: [{ x: x0, label: `day ${x0}`, color: 'warn' }] }), caption: 'Seven daily offsets with ±0.8 ns bars and the fitted drift, extrapolated. Synthetic data; real clock predictions also model frequency drift and use many more measurements.' },
          answer: ans, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: no, feedback: t`You left out $2x\operatorname{cov}(a, b)$. Here the data sit at positive $x$, so the covariance is negative and the true uncertainty is smaller.` }, { value: s, feedback: 'That is one measurement’s uncertainty. The prediction’s comes from the fitted line’s uncertainties, extrapolated.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_y(x)^2 = \sigma_a^2 + x^2\sigma_b^2 + 2x\operatorname{cov}(a,b)$, with $\sigma_a^2 = S_{xx}/\Delta$, $\sigma_b^2 = S/\Delta$, $\operatorname{cov} = -S_x/\Delta$.`, t`Equivalently, centre: $\sigma_y(x)^2 = \sigma^2/N + (x - \bar x)^2\sigma_b^2$ with $\bar x = 4$ and $\sigma_b^2 = \sigma^2/S_{xx,\text{centred}} = 0.64/28$.`],
          teach: t`Extrapolating a fit: $\sigma_y(x)^2 = \sigma^2/N + (x - \bar x)^2\sigma_b^2$ — the covariance is what makes the two forms agree.`,
          explain: t`Centred: $\sigma_y^2 = 0.64/7 + (${x0} - 4)^2 \times 0.64/28 = ${r6(v)}\ \text{ns}^2$, so $\sigma_y = ${ans.toFixed(3)}$ ns. Ignoring the covariance in the $(a, b)$ form would give $${no.toFixed(3)}$ ns.`,
        };
      },
    }),
    mcq({
      id: 'cp-ruler', difficulty: 2,
      prompt: t`Two lengths, $L_1$ and $L_2$, are measured with the same steel tape, which reads $0.3\%$ long because it is warm. Which result is unaffected by the tape’s error?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 3], xlabel: 'm', ylabel: '', yticks: 0, axesAt: 'edge', curves: [{ param: ['1 + 5*t', '2'], t: [0, 1], color: 'accent', width: 6 }, { param: ['1 + 7.5*t', '1'], t: [0, 1], color: 'gold', width: 6 }], points: [{ x: 6.2, y: 2, r: 0, label: 'L₁', labelDy: 0 }, { x: 8.7, y: 1, r: 0, label: 'L₂', labelDy: 0 }] }, caption: 'Two lengths, one tape.' },
      choices: [t`The ratio $L_1/L_2$`, t`The sum $L_1 + L_2$`, t`The difference $L_2 - L_1$`, t`The product $L_1L_2$`],
      answer: 0,
      why: { 1: 'Both read 0.3% long, so their sum does too.', 2: 'The difference is also scaled by 1.003.', 3: 'The product is 0.6% too large: the errors add.' },
      hints: ['A scale error multiplies every reading by the same factor 1.003. Which combination makes that factor cancel?'],
      teach: 'Fully correlated errors cancel in some combinations (ratios) and add in others (products) — the covariance term decides.',
      explain: t`$L_1/L_2 = (1.003\,\ell_1)/(1.003\,\ell_2) = \ell_1/\ell_2$. In the propagation formula for a ratio, the covariance term $-2\operatorname{cov}/(L_1L_2)$ exactly cancels the two scale terms. Treating the two readings as independent would wrongly give the ratio a $0.3\sqrt2\% \approx 0.42\%$ uncertainty from the tape.`,
    }),
  ],
  sources: [
    { label: 'JCGM 100:2008 (GUM), §5.2: correlated input quantities', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
    { label: 'J. R. Taylor, An Introduction to Error Analysis, 2nd ed., ch. 9 (covariance and correlation)', url: 'https://uscibooks.aip.org/books/introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-2nd-edition/' },
  ],
});
