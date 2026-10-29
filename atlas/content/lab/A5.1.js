// Fitting a straight line — the unweighted least-squares line derived from
// scratch: the normal equations, the centred formulas for slope and
// intercept, the residual scatter s with N − 2 degrees of freedom, and the
// standard uncertainties of slope and intercept (the slope as a weighted sum
// of the y's). A platinum resistance thermometer's calibration, design for
// leverage, and a solid-propellant burn-rate law as the transfer.
// Every number is computed here from seeded synthetic data (_labf.js).
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { normals, linfit, dataGraph, resGraph, seg, r6, sf, SIMNOTE, table } from './_labf.js';

const t = String.raw;

// ── the worked example: a Pt100 thermometer in a stirred bath (synthetic: R = 100 Ω (1 + 0.00385 T) + 0.05 Ω noise) ──
const EX_T = [0, 20, 40, 60, 80, 100];
const EX_R = (() => { const z = normals(11); return EX_T.map((x) => +(100 * (1 + 0.00385 * x) + 0.05 * z()).toFixed(2)); })();
const EX = linfit(EX_T, EX_R);
const EX_dev = EX_T.map((x) => x - EX.xbar), EX_dy = EX_R.map((y) => y - EX.ybar);
const EX_Sxy = EX_dev.reduce((s, d, i) => s + d * EX_dy[i], 0);
const EX_SSR = EX.res.reduce((s, r) => s + r * r, 0);

// a small data set of five points for the hand-calculation problems
function five(r) {
  const z = normals(r.int(1, 999999));
  const step = r.pick([1, 2, 5]);
  const xs = [1, 2, 3, 4, 5].map((k) => k * step);
  const a = r.float(1, 4, 0.1), b = r.float(0.6, 2.4, 0.1) / step;
  const ys = xs.map((x) => +(a + b * x + 0.15 * z()).toFixed(1));
  return { xs, ys, f: linfit(xs, ys) };
}

// residual-segment picture: data, line and the vertical misfits that least squares squares and adds
function misfitPicture(xs, ys, f, caption, opts = {}) {
  return {
    type: 'graph',
    params: dataGraph({
      xs, ys, fit: f, xlabel: opts.xlabel || 'x', ylabel: opts.ylabel || 'y',
      curves: xs.map((x, i) => seg(x, ys[i], x, f.a + f.b * x, { color: 'warn', width: 1.6, dash: [4, 3] })),
      legend: [{ label: 'data', color: 'accent', point: true }, { label: 'least-squares line', color: 'gold' }, { label: 'vertical misfit', color: 'warn', dash: [4, 3] }],
      legendAt: 'tl',
    }),
    caption,
  };
}

// Saint Robert's burn-rate law r = a pⁿ for the transfer problem (synthetic strand-burner data)
function strands(r) {
  const z = normals(r.int(1, 999999));
  const n = r.float(0.30, 0.55, 0.01), a = r.float(3.5, 6.0, 0.1);      // r in mm/s with p in MPa
  const p = [2, 4, 6, 8, 10, 12];
  const rate = p.map((pp) => +(a * pp ** n * Math.exp(0.012 * z())).toFixed(2));
  const lx = p.map(Math.log), ly = rate.map(Math.log);
  return { p, rate, lx, ly, f: linfit(lx, ly), n };
}

export default lesson({
  id: 'lab.A5.1',
  title: 'Fitting a straight line',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`You have $N$ points $(x_i, y_i)$ that should lie on a line $y = a + bx$, and they scatter. **Least squares** picks the line that makes the sum of the squared vertical misfits, $S = \sum_i (y_i - a - bx_i)^2$, as small as it can be. Setting $\partial S/\partial a = 0$ and $\partial S/\partial b = 0$ gives a closed form:

$$b = \frac{\sum_i (x_i - \bar x)(y_i - \bar y)}{\sum_i (x_i - \bar x)^2}, \qquad a = \bar y - b\,\bar x$$

The scatter about the line, $s = \sqrt{\sum_i r_i^2/(N-2)}$ with residuals $r_i = y_i - a - bx_i$, estimates the size of one point's error. It gives the slope's standard uncertainty $\sigma_b = s/\sqrt{S_{xx}}$ and the intercept's $\sigma_a = s\sqrt{1/N + \bar x^2/S_{xx}}$, where $S_{xx} = \sum_i(x_i - \bar x)^2$. This is the **unweighted** fit: it assumes every $y_i$ has the same uncertainty and the $x_i$ are exact.`,
  symbols: [
    { tex: 'x_i,\\ y_i', text: 'the $i$-th point: the quantity you set (taken as exact) and the one you measured; $i$ runs from 1 to $N$' },
    { tex: '\\bar x,\\ \\bar y', text: 'the means of the $x$’s and of the $y$’s: the least-squares line always passes through $(\\bar x, \\bar y)$' },
    { tex: 'b', text: 'the slope, in units of $y$ per unit of $x$' },
    { tex: 'a', text: 'the intercept: the line’s value at $x = 0$, in units of $y$' },
    { tex: 'S_{xx}', text: 'the spread of the $x$’s, $\\sum_i (x_i - \\bar x)^2$, in units of $x^2$: the bigger it is, the better the slope is pinned down' },
    { tex: 'r_i', text: 'the residual of point $i$: measured minus fitted, $y_i - a - bx_i$' },
    { tex: 's', text: 'the residual scatter $\\sqrt{\\sum r_i^2/(N-2)}$: an estimate of one point’s standard uncertainty. It divides by $N - 2$ because two numbers, $a$ and $b$, were fitted from the same data' },
    { tex: '\\sigma_b,\\ \\sigma_a', text: 'the standard uncertainties of the slope and the intercept' },
  ],
  why: t`Nearly every lab result is a slope — of $T^2$ against $L$, of $V$ against $I$, of a sensor’s output against a known input — and the slope is only as good as its uncertainty.`,
  visual: {
    type: 'lab-bench',
    title: 'The bench: resistance against length for a copper wire',
    lead: t`A sliding clip sets the length $L$ of wire between the meter’s probes, and a four-wire meter reads $R$. The gold line is the least-squares fit; the panel below shows each residual, $R_i$ minus the line. The readout gives the slope (resistance per metre) and the intercept, each with its uncertainty.`,
    tasks: [
      'Press Run the series twice more: with three times the points, the slope’s ± shrinks by about √3.',
      'Clear the table, set the clip to 0.25 m and to 1.75 m only, and take four readings at each: the slope’s ± is as small as with an even spread of twice as many points. Spread in x is what pins a slope down.',
      'Turn on the systematic error: every point shifts up by the same 0.25 Ω. The intercept moves, the slope does not — and the scatter gives no hint that anything is wrong.',
    ],
    params: { exp: 'resistivity', residuals: true, seed: 51, axesChoice: false },
    caption: t`Simulated readings: the true resistance plus Gaussian noise of $0.003\ \Omega$ and a $\pm 1$ mm clip position, rounded as the meter would. The bench fits each point with its stated $\sigma$ — all equal here, so the line is the unweighted one. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A platinum resistance thermometer (a Pt100) sits in a stirred bath beside a reference thermometer. You read its resistance at six bath temperatures:

${table([[t`T\ (^\circ\text{C})`, ...EX_T.map(String)], [t`R\ (\Omega)`, ...EX_R.map((v) => v.toFixed(2))]])}

Fit $R = a + bT$ by unweighted least squares, and give the slope and intercept with their standard uncertainties.`,
    visual: { type: 'graph', params: dataGraph({ xs: EX_T, ys: EX_R, fit: EX, xlabel: 'T (°C)', ylabel: 'R (Ω)', x: [-8, 108], y: [96, 142] }), caption: t`Synthetic data: a true line $R = 100\ \Omega\,(1 + 0.00385\,T)$ plus Gaussian noise of $0.05\ \Omega$. The misfits are far too small to see at this scale — look at the residuals instead.` },
    steps: [
      { label: 'Centre the data', text: t`$\bar T = ${sf(EX.xbar, 3)}\ ^\circ\text{C}$ and $\bar R = ${EX.ybar.toFixed(4)}\ \Omega$. Working with deviations from the means keeps the numbers small and the formulas short.` },
      { label: 'Spread of x', text: t`$S_{xx} = \sum (T_i - \bar T)^2 = 2500 + 900 + 100 + 100 + 900 + 2500 = ${EX.Sxxc.toFixed(0)}\ (^\circ\text{C})^2$.` },
      { label: 'Slope', text: t`$\sum (T_i - \bar T)(R_i - \bar R) = ${EX_Sxy.toFixed(2)}\ \Omega\,^\circ\text{C}$, so $b = ${EX_Sxy.toFixed(2)}/${EX.Sxxc.toFixed(0)} = ${EX.b.toFixed(6)}\ \Omega/^\circ\text{C}$.` },
      { label: 'Intercept', text: t`The line passes through $(\bar T, \bar R)$: $a = \bar R - b\bar T = ${EX.ybar.toFixed(4)} - ${EX.b.toFixed(6)} \times 50 = ${EX.a.toFixed(4)}\ \Omega$.` },
      { label: 'Residual scatter', text: t`The six residuals are ${EX.res.map((v) => `$${(1000 * v).toFixed(1)}$`).join(', ')} mΩ. Their squares add to $${tex(EX_SSR, 3)}\ \Omega^2$, so $s = \sqrt{${tex(EX_SSR, 3)}/(6 - 2)} = ${EX.s.toFixed(4)}\ \Omega$ — close to the $0.05\ \Omega$ the noise really had.` },
      { label: 'Why sigma b is s over root Sxx', text: t`The slope is a weighted sum of the readings, $b = \sum_i c_i R_i$ with $c_i = (T_i - \bar T)/S_{xx}$. Independent errors of size $s$ add in quadrature: $\sigma_b^2 = s^2\sum_i c_i^2 = s^2/S_{xx}$.` },
      { label: 'Uncertainties', text: t`$\sigma_b = ${EX.s.toFixed(4)}/\sqrt{${EX.Sxxc.toFixed(0)}} = ${tex(EX.sb, 2)}\ \Omega/^\circ\text{C}$ and $\sigma_a = ${EX.s.toFixed(4)}\sqrt{\tfrac16 + \tfrac{50^2}{${EX.Sxxc.toFixed(0)}}} = ${EX.sa.toFixed(3)}\ \Omega$.` },
      { label: 'Sense check', text: t`The ratio $b/a = ${tex(EX.b / EX.a, 4)}$ per °C is the thermometer’s temperature coefficient; the IEC 60751 standard value is $0.00385$ per °C. Its uncertainty needs the *covariance* of $a$ and $b$ — see [covariance and correlated errors](#/lesson/lab.A6.3).` },
    ],
    answer: t`$b = ${EX.b.toFixed(5)} \pm ${tex(EX.sb, 2)}\ \Omega/^\circ\text{C}$, $a = ${EX.a.toFixed(3)} \pm ${EX.sa.toFixed(3)}\ \Omega$.`,
  },
  practice: [
    mcq({
      id: 'what-min', difficulty: 1,
      prompt: 'Ordinary least squares chooses the line that minimizes which quantity?',
      visual: (() => { const z = normals(5); const xs = [1, 2, 3, 4, 5, 6]; const ys = xs.map((x) => +(1 + 0.8 * x + 0.5 * z()).toFixed(2)); return misfitPicture(xs, ys, linfit(xs, ys), 'Six points, their least-squares line, and the vertical misfit of each point.'); })(),
      choices: ['The sum of the squared vertical distances from the points to the line', 'The sum of the squared perpendicular distances from the points to the line', 'The sum of the signed vertical distances from the points to the line', 'The sum of the squared horizontal distances from the points to the line'],
      answer: 0,
      why: {
        1: 'That is orthogonal (total) least squares, a different method for when both coordinates are uncertain. Ordinary least squares treats x as exact and puts all the error in y.',
        2: 'Signed misfits cancel: every line through the centroid of the data makes their sum zero, however badly it fits.',
        3: 'Horizontal misfits would treat y as exact and x as uncertain — the opposite of the usual assumption, and a different line.',
      },
      hints: ['Which coordinate does an ordinary fit assume is exact?', 'The misfits are squared so that positive and negative ones cannot cancel.'],
      teach: 'Ordinary least squares puts all the error in y and minimizes the sum of squared vertical misfits.',
      explain: t`$S(a, b) = \sum (y_i - a - bx_i)^2$ is a sum of squared vertical distances. Squaring stops misfits of opposite sign cancelling and makes $S$ a smooth bowl in $(a, b)$ with a single bottom, which is why the answer has a closed form.`,
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: t`Put the derivation of the least-squares slope in order.`,
      visual: misfitPicture([1, 2, 3, 4, 5], [2.1, 2.6, 3.9, 4.2, 5.3], linfit([1, 2, 3, 4, 5], [2.1, 2.6, 3.9, 4.2, 5.3]), t`The quantity being minimized is the sum of the squares of the dashed lengths.`),
      items: [
        t`Write the sum of squared misfits $S = \sum (y_i - a - bx_i)^2$.`,
        t`Set $\partial S/\partial a = -2\sum(y_i - a - bx_i) = 0$.`,
        t`Divide by $N$: $\bar y = a + b\bar x$, so $a = \bar y - b\bar x$.`,
        t`Set $\partial S/\partial b = -2\sum x_i(y_i - a - bx_i) = 0$.`,
        t`Substitute $a$ and rearrange: $b = \dfrac{\sum (x_i - \bar x)(y_i - \bar y)}{\sum (x_i - \bar x)^2}$.`,
      ],
      hints: ['Start from the quantity being minimized.', 'The a-equation is the simpler one: it says the line passes through the centroid. Use it before tackling b.'],
      teach: t`Two conditions, $\partial S/\partial a = 0$ and $\partial S/\partial b = 0$ (the normal equations), fix the two parameters.`,
      explain: t`The first condition says the residuals sum to zero, so the line passes through $(\bar x, \bar y)$. Putting $a = \bar y - b\bar x$ into the second gives $\sum x_i[(y_i - \bar y) - b(x_i - \bar x)] = 0$; since $\sum \bar x(\ldots) = 0$ too, $x_i$ can be replaced by $x_i - \bar x$, giving the centred formula.`,
    }),
    num({
      id: 'slope-five', difficulty: 2,
      gen(r) {
        const { xs, ys, f } = five(r);
        const Sxy0 = xs.reduce((s, x, i) => s + x * ys[i], 0), Sxx0 = xs.reduce((s, x) => s + x * x, 0);
        const slips = [{ value: Sxy0 / Sxx0, feedback: t`You used $\sum x_iy_i/\sum x_i^2$ — the slope of a line forced through the origin. Subtract the means first.` }, { value: f.ybar / f.xbar, feedback: t`$\bar y/\bar x$ is the slope of the line from the origin to the centroid, not the best-fit slope.` }]
          .filter((e) => Math.abs(e.value - f.b) > 0.03 * Math.abs(f.b));
        return {
          prompt: t`Fit a straight line to these five points by least squares. What is the slope $b$? Give three significant figures.

${table([['x', ...xs.map(String)], ['y', ...ys.map((v) => v.toFixed(1))]])}`,
          visual: { type: 'graph', params: dataGraph({ xs, ys, xlabel: 'x', ylabel: 'y' }), caption: 'The five points, unfitted.' },
          answer: f.b, tol: { rel: 0.005 },
          errors: slips,
          hints: [t`Find $\bar x$ and $\bar y$ first; then tabulate $x_i - \bar x$ and $y_i - \bar y$.`, t`$\bar x = ${f.xbar}$ and $S_{xx} = \sum (x_i - \bar x)^2 = ${f.Sxxc.toFixed(1)}$. Now find $\sum (x_i - \bar x)(y_i - \bar y)$ and divide.`],
          teach: 'The slope is the covariance of x and y divided by the spread of x — both measured from the means.',
          explain: t`$\bar x = ${f.xbar}$, $\bar y = ${f.ybar.toFixed(2)}$, $S_{xx} = ${f.Sxxc.toFixed(1)}$ and $\sum(x_i - \bar x)(y_i - \bar y) = ${(f.b * f.Sxxc).toFixed(3)}$, so $b = ${f.b.toFixed(4)}$.`,
        };
      },
    }),
    num({
      id: 'intercept', difficulty: 2,
      gen(r) {
        const { xs, ys, f } = five(r);
        const slips = [{ value: f.ybar + f.b * f.xbar, feedback: t`Sign slip: the line passes through $(\bar x, \bar y)$, so $\bar y = a + b\bar x$ and $a = \bar y - b\bar x$.` }, { value: ys[0] - f.b * xs[0], feedback: 'You put the line through the first data point. The least-squares line goes through the centroid of all the points, not through any one of them.' }]
          .filter((e) => Math.abs(e.value - f.a) > 0.03 * Math.abs(f.a) + 0.02);
        return {
          prompt: t`For the five points below, the least-squares slope is $b = ${f.b.toFixed(4)}$. What is the intercept $a$? Give two decimal places.

${table([['x', ...xs.map(String)], ['y', ...ys.map((v) => v.toFixed(1))]])}`,
          visual: { type: 'graph', params: dataGraph({ xs, ys, xlabel: 'x', ylabel: 'y', x: [-0.3 * xs[4], 1.1 * xs[4]] }), caption: t`The data; the intercept is where the fitted line would cross $x = 0$, at the left.` },
          answer: f.a, tol: { rel: 0, abs: 0.012 },
          errors: slips,
          hints: [t`The least-squares line always passes through $(\bar x, \bar y)$.`, t`$\bar x = ${f.xbar}$, $\bar y = ${f.ybar.toFixed(3)}$; solve $\bar y = a + b\bar x$ for $a$.`],
          teach: t`The intercept follows from the slope and the centroid: $a = \bar y - b\bar x$.`,
          explain: t`$a = ${f.ybar.toFixed(3)} - ${f.b.toFixed(4)} \times ${f.xbar} = ${f.a.toFixed(3)}$.`,
        };
      },
    }),
    num({
      id: 'resid-s', difficulty: 2,
      gen(r) {
        const { xs, ys, f } = five(r);
        const rr = f.res.map((v) => +v.toFixed(3));
        const ssr = rr.reduce((s, v) => s + v * v, 0);
        const ans = Math.sqrt(ssr / 3);
        return {
          prompt: t`A straight-line fit to five points leaves the residuals ${rr.map((v) => `$${v.toFixed(3)}$`).join(', ')}. Estimate the standard uncertainty $s$ of a single point from them.`,
          visual: { type: 'graph', params: resGraph({ xs, res: rr, xlabel: 'x', ylabel: 'residual' }), caption: 'The residuals: data minus the fitted line. They sum to zero, as least-squares residuals always do (up to rounding).' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(ssr / 5), feedback: t`Dividing by $N = 5$ ignores that the line was fitted to these same points: two parameters used up two degrees of freedom, so divide by $N - 2 = 3$.` }, { value: Math.sqrt(ssr / 4), feedback: t`$N - 1$ is right for scatter about a mean (one fitted number). A line has two fitted numbers: divide by $N - 2$.` }, { value: ssr / 3, feedback: 'That is s², the variance. Take the square root.' }]
            .filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$s = \sqrt{\sum r_i^2/(N - 2)}$.`, t`$\sum r_i^2 = ${tex(ssr, 3)}$; $N - 2 = 3$.`],
          teach: t`The residual scatter divides by $N - 2$: every fitted parameter uses up one degree of freedom.`,
          explain: t`$\sum r_i^2 = ${tex(ssr, 3)}$, so $s = \sqrt{${tex(ssr, 3)}/3} = ${ans.toFixed(3)}$. A line fitted to the very points it is judged by always sits closer to them than the true line does, which is why dividing by $N$ would underestimate the scatter.`,
        };
      },
    }),
    num({
      id: 'sigma-b', difficulty: 2,
      gen(r) {
        const step = r.pick([0.5, 1, 2]), N = r.int(5, 8);
        const xs = Array.from({ length: N }, (_, k) => step * k);
        const s = r.float(0.02, 0.2, 0.01);
        const xbar = xs.reduce((a, b) => a + b, 0) / N;
        const Sxx = xs.reduce((a, x) => a + (x - xbar) ** 2, 0);
        const ans = s / Math.sqrt(Sxx);
        return {
          prompt: t`A line is fitted to ${N} points at $x = ${xs.join(',\\ ')}$ s. The residual scatter is $s = ${s}$ m. What is the standard uncertainty of the slope, in m/s?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.6 * step, step * (N - 0.4)], y: [-1, 1], xlabel: 't (s)', ylabel: '', yticks: 0, axesAt: 'edge', vlines: [{ x: r6(xbar), label: 'mean x', color: 'gold' }], points: xs.map((x) => ({ x, y: 0, r: 4, color: 'accent' })) }, caption: 'Where the measurements were taken. Only their spread about the mean matters for the slope’s uncertainty.' },
          answer: ans, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: s / Sxx, feedback: t`You divided by $S_{xx}$ itself; the formula takes its square root, $\sigma_b = s/\sqrt{S_{xx}}$.` }, { value: s / Math.sqrt(N), feedback: t`$s/\sqrt N$ is the uncertainty of a mean. A slope’s depends on how widely the $x$’s are spread: $s/\sqrt{S_{xx}}$.` }, { value: s / Math.sqrt(xs.reduce((a, x) => a + x * x, 0)), feedback: t`Measure the spread from the mean: $S_{xx} = \sum (x_i - \bar x)^2$, not $\sum x_i^2$.` }]
            .filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_b = s/\sqrt{S_{xx}}$ with $S_{xx} = \sum (x_i - \bar x)^2$.`, t`$\bar x = ${r6(xbar)}$ s; $S_{xx} = ${r6(Sxx)}\ \text{s}^2$.`],
          teach: t`A slope’s uncertainty falls as the spread of the $x$’s grows: $\sigma_b = s/\sqrt{S_{xx}}$.`,
          explain: t`$S_{xx} = ${r6(Sxx)}\ \text{s}^2$, so $\sigma_b = ${s}/\sqrt{${r6(Sxx)}} = ${tex(ans, 3)}$ m/s.`,
        };
      },
    }),
    mcq({
      id: 'leverage', difficulty: 3,
      prompt: t`You may take six readings anywhere in $0 \le x \le 10$, each with the same uncertainty. Which plan gives the **smallest uncertainty in the slope**?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, 13.5], y: [0.3, 4.7], xlabel: 'x', ylabel: '', yticks: 0, axesAt: 'edge',
        points: [
          ...[0, 2, 4, 6, 8, 10].map((x) => ({ x, y: 4, r: 4, color: 'accent' })), { x: 10.6, y: 4, r: 0, label: 'even', labelDy: 0 },
          ...[0, 0, 0, 10, 10, 10].map((x, i) => ({ x, y: 3 + (i % 3 - 1) * 0.16, r: 4, color: 'accent' })), { x: 10.6, y: 3, r: 0, label: 'ends', labelDy: 0 },
          ...[4, 4.4, 4.8, 5.2, 5.6, 6].map((x) => ({ x, y: 2, r: 4, color: 'accent' })), { x: 10.6, y: 2, r: 0, label: 'middle', labelDy: 0 },
          ...[0, 0.4, 0.8, 1.2, 1.6, 10].map((x) => ({ x, y: 1, r: 4, color: 'accent' })), { x: 10.6, y: 1, r: 0, label: 'one far', labelDy: 0 },
        ] }, caption: 'Four plans for six readings (stacked dots are repeats at the same x).' },
      choices: ['Three readings at each end (“ends”)', 'Evenly spaced from 0 to 10 (“even”)', 'All six near the middle (“middle”)', 'Five near zero and one at 10 (“one far”)'],
      answer: 0,
      why: {
        1: t`Even spacing gives $S_{xx} = 70$; the ends plan gives $150$, so its $\sigma_b$ is $\sqrt{70/150} \approx 0.68$ times as big. Even spacing has another virtue — it can reveal curvature — but not the smallest $\sigma_b$.`,
        2: t`Clustered $x$’s barely spread at all: $S_{xx} = 2.8$, so $\sigma_b$ is about 7 times the ends plan’s. A slope needs leverage.`,
        3: t`$S_{xx} \approx 72$ here, close to even spacing, and the slope then hangs on a single point: one bad reading at $x = 10$ and nothing will show it.`,
      },
      hints: [t`$\sigma_b = s/\sqrt{S_{xx}}$: which plan makes $\sum (x_i - \bar x)^2$ largest?`, t`For the ends plan, every point is 5 from the mean: $S_{xx} = 6 \times 25 = 150$.`],
      teach: t`The slope is pinned by leverage: put the $x$’s as far from their mean as the range allows — and keep some in between if you need to test for curvature.`,
      explain: t`$S_{xx}$ is 150 (ends), 70 (even), about 72 (one far) and 2.8 (middle). The ends plan wins on $\sigma_b$ but cannot tell a line from a curve, which is why real plans spread most points to the ends and keep a few in the middle. (More on choosing $x$ in [choosing what to vary](#/lesson/lab.A10.1).)`,
    }),
    code({
      id: 'fit-line', difficulty: 3,
      prompt: t`Write \`fit_line(x, y)\` that returns \`a, b, sa, sb\` — the unweighted least-squares intercept and slope and their standard uncertainties, using the centred formulas of this lesson and $s$ with $N - 2$ degrees of freedom. Use NumPy, not a fitting library. The program then fits the Pt100 data from the worked example.`,
      starter: t`import numpy as np

def fit_line(x, y):
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    # your code: a, b from the centred sums; s from the residuals; sa, sb
    return a, b, sa, sb

T = np.array([${EX_T.join(', ')}], float)
R = np.array([${EX_R.join(', ')}])
a, b, sa, sb = fit_line(T, R)
print(f"a = {a:.4f} ± {sa:.4f} ohm,  b = {b:.6f} ± {sb:.6f} ohm/°C")`,
      answer: t`import numpy as np

def fit_line(x, y):
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    N = x.size
    xbar, ybar = x.mean(), y.mean()
    Sxx = np.sum((x - xbar)**2)
    b = np.sum((x - xbar) * (y - ybar)) / Sxx
    a = ybar - b * xbar
    r = y - (a + b * x)
    s = np.sqrt(np.sum(r**2) / (N - 2))
    sb = s / np.sqrt(Sxx)
    sa = s * np.sqrt(1 / N + xbar**2 / Sxx)
    return a, b, sa, sb

T = np.array([${EX_T.join(', ')}], float)
R = np.array([${EX_R.join(', ')}])
a, b, sa, sb = fit_line(T, R)
print(f"a = {a:.4f} ± {sa:.4f} ohm,  b = {b:.6f} ± {sb:.6f} ohm/°C")`,
      tests: [
        { name: t`slope and intercept of the Pt100 data match the worked example`, code: `abs(fit_line(T, R)[1] - ${EX.b}) < 1e-9 and abs(fit_line(T, R)[0] - ${EX.a}) < 1e-7` },
        { name: t`the slope uncertainty is $s/\sqrt{S_{xx}}$ with $N - 2$ degrees of freedom`, code: `abs(fit_line(T, R)[3] - ${EX.sb}) < 1e-10` },
        { name: 'the intercept uncertainty includes the 1/N and the mean-squared-x terms', code: `abs(fit_line(T, R)[2] - ${EX.sa}) < 1e-8` },
        { name: 'it agrees with numpy.polyfit (whose covariance is scaled the same way) on other data', code: `(lambda x, y: all(abs(u - v) < 1e-8 for u, v in zip(fit_line(x, y), (np.polyfit(x, y, 1, cov=True)[0][1], np.polyfit(x, y, 1, cov=True)[0][0], np.sqrt(np.polyfit(x, y, 1, cov=True)[1][1, 1]), np.sqrt(np.polyfit(x, y, 1, cov=True)[1][0, 0])))))(np.array([1., 2, 4, 7, 8]), np.array([2.2, 2.9, 5.3, 7.4, 8.9]))` },
      ],
      hints: [t`\`xbar = x.mean()\`, \`Sxx = np.sum((x - xbar)**2)\`; the slope is \`np.sum((x - xbar) * (y - ybar)) / Sxx\`.`, t`Residuals \`r = y - (a + b * x)\`; \`s = np.sqrt(np.sum(r**2) / (N - 2))\`; then \`sb = s / np.sqrt(Sxx)\` and \`sa = s * np.sqrt(1/N + xbar**2/Sxx)\`.`],
      teach: 'Four lines of NumPy are the whole of the unweighted straight-line fit — knowing them lets you check what any fitting library hands you.',
      explain: t`The function reproduces the worked example: $b = ${EX.b.toFixed(6)}$, $\sigma_b = ${tex(EX.sb, 3)}$. \`np.polyfit(x, y, 1, cov=True)\` agrees because by default it scales its covariance by $\chi^2/(N - 2)$ — exactly the $s^2$ estimate used here. (When the uncertainties are known in advance, that scaling is a trap: see [weighted least squares](#/lesson/lab.A5.2).)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-burn-rate', difficulty: 3, transfer: true,
      gen(r) {
        const S = strands(r);
        return {
          prompt: t`A strand burner measures the burn rate $r$ of a solid propellant at six chamber pressures $p$. Saint Robert’s law, $r = a\,p^{n}$, becomes a straight line in $\ln r$ against $\ln p$ with slope $n$, the **pressure exponent**. Fit it (unweighted) and give $n$ to two decimal places.

${table([[t`p\ (\text{MPa})`, ...S.p.map(String)], [t`r\ (\text{mm/s})`, ...S.rate.map((v) => v.toFixed(2))]])}`,
          visual: { type: 'graph', params: dataGraph({ xs: S.lx.map(r6), ys: S.ly.map(r6), xlabel: 'ln(p / 1 MPa)', ylabel: 'ln(r / 1 mm/s)' }), caption: 'The six strands on log–log axes (natural logs). Synthetic data with about 1% scatter; real strand-burner rates also depend on the initial grain temperature.' },
          answer: S.f.b, tol: { rel: 0, abs: 0.006 },
          errors: [{ value: linfit(S.p, S.rate).b, feedback: t`That is the slope of $r$ against $p$ itself. Take logarithms of both first: the law is a straight line only in $\ln r$ against $\ln p$.` }].filter((e) => Math.abs(e.value - S.f.b) > 0.02),
          hints: [t`Make the columns $X = \ln p$ and $Y = \ln r$, then use $b = \sum (X_i - \bar X)(Y_i - \bar Y)/\sum (X_i - \bar X)^2$.`, t`$\bar X = ${S.f.xbar.toFixed(4)}$ and $S_{XX} = ${S.f.Sxxc.toFixed(4)}$.`],
          teach: 'A power law is a straight line on log–log axes; its exponent is the slope.',
          explain: t`With $X = \ln p$ and $Y = \ln r$: $\bar X = ${S.f.xbar.toFixed(4)}$, $\bar Y = ${S.f.ybar.toFixed(4)}$, $S_{XX} = ${S.f.Sxxc.toFixed(4)}$ and $b = ${S.f.b.toFixed(4)} = n$. The intercept gives $\ln a = ${S.f.a.toFixed(3)}$, so $a = ${Math.exp(S.f.a).toFixed(2)}$ mm/s at 1 MPa. Motor designers want small $n$: the chamber pressure is then less sensitive to anything that changes the burning area. (Fitting logs treats the scatter as a fixed *percentage* — right for these data, but see [weighted least squares](#/lesson/lab.A5.2) for when it is not.)`,
        };
      },
    }),
    num({
      id: 'cp-sigma-a', difficulty: 3,
      gen(r) {
        const N = r.int(5, 7), x0 = r.pick([10, 20, 30]), step = r.pick([2, 5]);
        const xs = Array.from({ length: N }, (_, k) => x0 + step * k);
        const s = r.float(0.05, 0.3, 0.01);
        const xbar = xs.reduce((a, b) => a + b, 0) / N, Sxx = xs.reduce((a, x) => a + (x - xbar) ** 2, 0);
        const ans = s * Math.sqrt(1 / N + xbar * xbar / Sxx);
        return {
          prompt: t`A line is fitted to ${N} points at $x = ${xs.join(',\\ ')}$, and the residual scatter is $s = ${s}$. What is the standard uncertainty of the intercept $a$ (the line’s value at $x = 0$)?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-4, xs[N - 1] + 4], y: [-1, 1], xlabel: 'x', ylabel: '', yticks: 0, axesAt: 'edge', vlines: [{ x: 0, label: 'x = 0', color: 'warn' }], points: xs.map((x) => ({ x, y: 0, r: 4, color: 'accent' })) }, caption: 'The data sit far from x = 0, where the intercept is read: the fitted line must be extrapolated back.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: s / Math.sqrt(N), feedback: t`$s/\sqrt N$ is the uncertainty of the line at $\bar x$. At $x = 0$, far from the data, the slope’s uncertainty adds the term $\bar x^2/S_{xx}$.` }, { value: s / Math.sqrt(Sxx), feedback: t`That is $\sigma_b$, the slope’s uncertainty. The intercept’s is $s\sqrt{1/N + \bar x^2/S_{xx}}$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_a = s\sqrt{1/N + \bar x^2/S_{xx}}$.`, t`$\bar x = ${r6(xbar)}$ and $S_{xx} = ${r6(Sxx)}$.`],
          teach: t`The intercept is an extrapolation to $x = 0$: the farther the data sit from zero, the larger its uncertainty.`,
          explain: t`$\sigma_a = ${s}\sqrt{1/${N} + ${r6(xbar)}^2/${r6(Sxx)}} = ${ans.toPrecision(3)}$ — about ${(ans / (s / Math.sqrt(N))).toFixed(0)} times the uncertainty of the line at the centre of the data.`,
        };
      },
    }),
    mcq({
      id: 'cp-assume', difficulty: 2,
      prompt: 'The unweighted least-squares formulas, with s estimated from the residuals, give honest uncertainties only if…',
      visual: (() => { const z = normals(9); const xs = [1, 2, 3, 4, 5, 6, 7]; const ys = xs.map((x) => +(2 + 0.5 * x + 0.2 * z()).toFixed(2)); return { type: 'graph', params: dataGraph({ xs, ys, sy: 0.2, fit: linfit(xs, ys), xlabel: 'x', ylabel: 'y' }), caption: 'The textbook case: every point the same error bar, no error in x, a straight line the right model.' }; })(),
      choices: ['the x’s are exact, every y has the same uncertainty, the errors are independent, and a straight line is the right model', 'the points are evenly spaced in x', 'there are at least ten points', 'the line passes through the origin'],
      answer: 0,
      why: {
        1: 'Spacing affects how small the uncertainties are, not whether they are honest.',
        2: 'Few points make s itself uncertain (and call for Student’s t), but the formulas still hold for N ≥ 3.',
        3: 'The fit has an intercept for exactly this reason: no origin is assumed.',
      },
      hints: ['Every step of the derivation squared vertical misfits with equal importance — what does that assume about each point?'],
      teach: 'Least-squares uncertainties rest on assumptions about the errors: exact x, equal and independent y errors, and the right model.',
      explain: t`Unequal uncertainties need weights ([the next lesson](#/lesson/lab.A5.2)); errors in $x$ need the effective-variance method; correlated errors need the covariance ([A6.3](#/lesson/lab.A6.3)); and a wrong model shows up in the residuals ([residual analysis](#/lesson/lab.A6.2)).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, An Introduction to Error Analysis, 2nd ed., ch. 8 (least-squares fitting)', url: 'https://uscibooks.aip.org/books/introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-2nd-edition/' },
    { label: 'JCGM 100:2008 (GUM), Annex H.3: calibration of a thermometer by a least-squares line', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
  ],
});
