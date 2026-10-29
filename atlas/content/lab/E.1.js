// The charge-to-mass ratio of the electron — the lab view of Thomson's
// measurement as teaching labs run it: an electron beam accelerated through V
// and bent into a circle by Helmholtz coils. The data: beam diameters against
// coil current; the analysis: 1/r against I, a weighted straight line whose
// slope gives e/m and whose intercept is the ambient field (the systematic
// that biases a point-by-point average); field reversal; a Type B budget
// (the coil radius); the result against CODATA 2022. A xenon ion's gyroradius
// in a Hall thruster as the transfer. Every number is computed here from the
// seeded model the labe-rig simulation draws with (_labe.js).
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, f, tex, table, SIMNOTE, SRC } from './_labe.js';
import { budget } from './_unc.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.em.defaults;
const K0 = M.helmholtzK(P0);                    // T per A
const CODATA = M.K.em;

// ── the worked example: six currents, seed 11 ──
const EX = M.run('em', { seed: 11 });
const EXr = EX.R;
const EXem = EX.results[0], EXB = EX.results[1];
const relStat = EXem.sigma / EXem.value, relR = 2 * (1 / 150);
const relTot = Math.hypot(relStat, relR);

// a seeded run for the problems
const runEm = (seed, flags = {}, axes = null) => M.run('em', { seed, flags, axes });
// the point-by-point factor (1 + Bₐ/kI)² with the ambient field
const TF = (I) => (1 + P0.Be / (K0 * I)) ** 2;
const TR1 = (100 * (1 - TF(1))).toFixed(0), TR2 = (100 * (1 - TF(2))).toFixed(0);
const em1 = (P, I, r) => (2 * P.V) / (M.helmholtzK(P) * I * r) ** 2;

export default lesson({
  id: 'lab.E.1',
  title: 'The charge-to-mass ratio of the electron (e/m)',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`In 1897 J. J. Thomson bent cathode rays with electric and magnetic fields and found their charge-to-mass ratio was about a thousand times the hydrogen ion’s: the rays were particles far lighter than any atom. The teaching version accelerates electrons through a voltage $V$, so $\tfrac12 mv^2 = eV$, and bends them into a circle in the nearly uniform field of a pair of Helmholtz coils, where $evB = mv^2/r$. Together, $e/m = 2V/(B^2r^2)$. **A steady stray field adds to the coils’ field**, so you do not average that formula point by point: you plot $1/r$ against the coil current, a straight line whose slope carries $e/m$ and whose intercept is the stray field.`,
  equation: t`\frac{1}{r} = \sqrt{\frac{e}{2mV}}\,\bigl(kI + B_a\bigr), \qquad k = \Bigl(\frac45\Bigr)^{3/2}\frac{\mu_0 N}{R}`,
  symbols: [
    { tex: 'r', text: 'the radius of the beam’s circle, in m — measured as half the diameter $D$ read on a scale' },
    { tex: 'e/m', text: 'the electron’s charge-to-mass ratio, in C/kg; CODATA 2022 gives $1.758\\,820\\,008\\,38(55)\\times10^{11}$ C/kg' },
    { tex: 'V', text: 'the accelerating voltage, in V: each electron arrives with kinetic energy $eV$' },
    { tex: 'I', text: 'the current through the two coils (in series), in A — the knob you turn' },
    { tex: 'k', text: 'the field per ampere at the centre of a Helmholtz pair, in T/A' },
    { tex: 'B_a', text: 'the ambient field’s component along the coils’ axis (the Earth’s, the building’s), in T — the systematic' },
    { tex: '\\mu_0', text: 'the magnetic constant, $1.256\\,637\\,061\\,27\\times10^{-6}$ N/A² (CODATA 2022)' },
    { tex: 'N,\\ R', text: 'the turns on each coil and the coils’ radius (equal to their separation, which is what makes them a Helmholtz pair), in m' },
  ],
  why: t`Fitting a line so that a nuisance lands in the intercept and the physics in the slope is the most useful single trick of the teaching lab — it returns in the photoelectric effect, Franck–Hertz and the speed of light.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: an electron beam in Helmholtz coils',
    lead: t`Set a coil current and press Take a reading: the beam’s circle appears above, its diameter is read to the nearest half millimetre, and the point joins the plot of $1/r$ against $I$. The gold line is the weighted fit; the readout turns its slope into $e/m$ and its intercept into the ambient field, and compares $e/m$ with CODATA.`,
    tasks: [
      'Switch Plot to “e/m point by point”: with the ambient field on, the values climb with current and the weighted mean sits several σ below CODATA.',
      'Turn the ambient field off: the point-by-point values flatten, while the slope of 1/r against I hardly moves — it never cared.',
      'Press Run the series twice more: three times the data shrinks σ of e/m by about √3, but the ambient field’s σ stays large — the intercept is a long extrapolation from 1 A to 0.',
    ],
    params: { exp: 'em', seed: 5, residuals: true, expected: true },
    caption: t`Simulated readings: $V = 200$ V, $N = 130$ turns, $R = 0.150$ m (illustrative, typical of teaching apparatus), an axial ambient field of $25\ \mu\text{T}$ against the coils’ field, and each diameter read with $\sigma = 1$ mm. Dashed green: the line CODATA’s $e/m$ predicts with no ambient field. ${SIMNOTE}`,
  },
  example: {
    prompt: t`At $V = 200$ V, with $N = 130$ and $R = 0.150$ m, you read the beam’s diameter at six coil currents, each to $\sigma_D = 1.0$ mm:

${table([[t`I\ (\text{A})`, ...EXr.map((q) => q.I.toFixed(1))], [t`D\ (\text{mm})`, ...EXr.map((q) => q.D.toFixed(1))]])}

Find $e/m$ with its uncertainty, and the ambient field, and compare $e/m$ with CODATA.`,
    visual: rigPlot('em', { seed: 11, expected: true }, t`The six points as $1/r$ against $I$ with ±1σ bars, the weighted fit (gold) and the line CODATA predicts with no ambient field (dashed). The residuals sit below. ${SIMNOTE}`),
    steps: [
      { label: 'Linearize', text: t`With $B = kI + B_a$, the circle condition $r = \sqrt{2mV/e}\,/B$ turns over to $1/r = \sqrt{e/2mV}\,(kI + B_a)$: a straight line in $I$. The slope is $b = k\sqrt{e/2mV}$; the intercept is $a = B_a\sqrt{e/2mV}$.` },
      { label: 'Error bars', text: t`$r = D/2$, so $\sigma_r = 0.5$ mm, and $\sigma_{1/r} = \sigma_r/r^2$: the smallest circles (highest currents) carry the biggest bars in $1/r$. At $I = ${EXr[5].I.toFixed(1)}$ A, $r = ${(100 * EXr[5].r).toFixed(2)}$ cm and $\sigma_{1/r} = ${(EXr[5].sr / EXr[5].r ** 2).toFixed(2)}\ \text{m}^{-1}$. Unequal bars call for the weighted fit ([weighted least squares](#/lesson/lab.A5.2)).` },
      { label: 'Fit', text: t`The weighted line gives $b = ${pmT(EX.fit.b, EX.fit.sb)}\ \text{m}^{-1}\text{A}^{-1}$ and $a = ${pmT(EX.fit.a, EX.fit.sa)}\ \text{m}^{-1}$, with $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ for $\nu = 4$ — the scatter matches the stated bars.` },
      { label: 'Coil constant', text: t`$k = (4/5)^{3/2}\mu_0N/R = 0.7155 \times ${tex(M.K.mu0, 6)} \times 130/0.150 = ${tex(K0, 4)}$ T/A.` },
      { label: 'e over m', text: t`Square the slope: $e/m = 2Vb^2/k^2 = ${tex(EXem.value, 4)}$ C/kg. A square doubles a relative uncertainty, so $\sigma_{e/m}/(e/m) = 2\sigma_b/b = ${(100 * relStat).toFixed(1)}\%$: $e/m = (${resT(EXem)})\times10^{11}$ C/kg.` },
      { label: 'Ambient field', text: t`$B_a = ka/b = ${resT(EXB)}\ \mu\text{T}$. Its uncertainty is as big as the field itself: the intercept is an extrapolation from 1 A down to 0, far outside the data. Reversing the coil current measures it far better (below).` },
      { label: 'Type B', text: t`The coils’ radius is known to $\pm 1$ mm (a standard uncertainty, say). Since $e/m \propto 1/k^2 \propto R^2$, that adds $2 \times 1/150 = ${(100 * relR).toFixed(1)}\%$ in quadrature: $${(100 * relTot).toFixed(1)}\%$ in all, $\sigma = ${tex(relTot * EXem.value, 2)}$ C/kg.` },
      { label: 'Compare', text: t`$z = (${tex(EXem.value, 4)} - ${tex(CODATA, 6)})/${tex(relTot * EXem.value, 2)} = ${((EXem.value - CODATA) / (relTot * EXem.value)).toFixed(2)}$: agreement ([agreement within uncertainty](#/lesson/lab.A4.1)). A result good to about 4% is typical of this apparatus — and the slope did not need the ambient field to be known at all.` },
    ],
    answer: t`$e/m = (${pmT(EXem.value / 1e11, (relTot * EXem.value) / 1e11)})\times10^{11}$ C/kg (statistical and coil radius combined), within $${Math.abs((EXem.value - CODATA) / (relTot * EXem.value)).toFixed(1)}\sigma$ of CODATA; ambient field $${resT(EXB)}\ \mu\text{T}$.`,
  },
  practice: [
    mcq({
      id: 'why-line', difficulty: 2,
      prompt: t`Why fit $1/r$ against $I$, rather than work out $e/m = 2V/(B^2r^2)$ for each reading and average?`,
      visual: rigPlot('em', { seed: 4, axes: 'pp', expected: true, residuals: false }, t`$e/m$ worked out point by point from $B = kI$, with the ambient field present; the gold line is their weighted mean, the dashed line CODATA. ${SIMNOTE}`),
      choices: [
        t`A steady extra field adds a constant to $kI$; on the $1/r$ line it moves only the intercept, so the slope — and $e/m$ — is untouched`,
        'A fit has a smaller statistical uncertainty than a weighted mean of the same readings, by about a factor of two',
        'A fit averages away the random scatter of the diameter readings, which a weighted mean cannot do',
        t`Plotting $1/r$ makes every error bar the same size, which least squares requires`,
      ],
      answer: 0,
      why: {
        1: 'Both use the same readings and both average the random scatter. The problem with the point-by-point average is not its size but its bias.',
        2: 'A weighted mean averages random scatter just as well. What it cannot do is notice that every value is pulled by the same unknown field.',
        3: t`The bars of $1/r$ are $\sigma_r/r^2$, not equal at all — a weighted fit handles that. Equal bars are not the reason.`,
      },
      hints: [t`Write $B$ as $kI + B_a$ and put it into $1/r$.`, t`Which coefficient of the straight line does a constant $B_a$ change?`],
      teach: 'Arrange the analysis so an unknown constant offset lands in the intercept, and the physics you want in the slope.',
      explain: t`With $B = kI + B_a$, $1/r = \sqrt{e/2mV}\,(kI + B_a)$: $B_a$ shifts the line without tilting it. Point by point, $2V/(k^2I^2r^2) = (e/m)(1 + B_a/kI)^2$, wrong by a factor that is worst at low current — the climbing pattern in the picture.`,
    }),
    num({
      id: 'field', difficulty: 1,
      gen(r) {
        const N = r.pick([120, 130, 140]), R = r.pick([0.140, 0.150, 0.160]), I = r.float(1.2, 2.0, 0.1);
        const B = M.helmholtzK({ N, R }) * I;
        const single = (M.K.mu0 * N * I) / (2 * R);
        return {
          prompt: t`Each coil of a Helmholtz pair has $N = ${N}$ turns and radius $R = ${R.toFixed(3)}$ m. What field does a current of $${I.toFixed(1)}$ A make at the centre? Answer in mT.`,
          visual: rigRaw('em', { seed: r.int(1, 999), settings: [I], params: { N, R } }, t`The beam in the field of these coils at $${I.toFixed(1)}$ A (simulated, $V = 200$ V).`),
          answer: B * 1000, units: 'mT', tol: { rel: 0.005 },
          errors: [
            { value: single * 1000, feedback: t`$\mu_0NI/2R$ is the field at the centre of one coil alone. The Helmholtz pair’s centre is a distance $R/2$ from each coil, where each gives $\mu_0NIR^2/2(R^2 + R^2/4)^{3/2}$; the two together make $(4/5)^{3/2}\mu_0NI/R$.` },
            { value: (M.K.mu0 * N * I) / R * 1000, feedback: t`You left out the factor $(4/5)^{3/2} = 0.716$: each coil is $R/2$ from the centre, not in its plane.` },
          ].filter((e) => Math.abs(e.value - B * 1000) > 0.03 * B * 1000),
          hints: [t`The field at the centre of a Helmholtz pair is $B = (4/5)^{3/2}\mu_0NI/R$.`, t`$(4/5)^{3/2} = 0.7155$ and $\mu_0 = 1.2566\times10^{-6}$ N/A².`],
          teach: t`A Helmholtz pair’s centre field is $(4/5)^{3/2}\mu_0NI/R$ — about 0.72 of what one coil alone would give at its own centre, times two.`,
          explain: t`$B = 0.7155 \times ${tex(M.K.mu0, 5)} \times ${N} \times ${I.toFixed(1)}/${R.toFixed(3)} = ${tex(B * 1000, 4)}$ mT — about fifty times the Earth’s field, which is why the Earth’s 2–5% still matters.`,
        };
      },
    }),
    num({
      id: 'one-point', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), I = r.pick([1.2, 1.4, 1.6, 1.8]), V = r.pick([150, 200, 250]);
        const rows = M.makeRows('em', { seed, settings: [I], params: { V } });
        const q = M.readRows('em', rows, { params: { V }, flags: { earth: false } })[0];
        const P = { ...P0, V };
        const ans = em1(P, I, q.r);
        return {
          prompt: t`At $V = ${V}$ V and $I = ${I.toFixed(1)}$ A (coil constant $k = ${tex(K0, 4)}$ T/A, no ambient field), the beam’s circle measures $D = ${q.D.toFixed(1)}$ mm across. What $e/m$ does this one reading give? Answer in C/kg.`,
          visual: rigRaw('em', { seed, settings: [I], params: { V }, flags: { earth: false } }, 'The beam’s circle at this reading, drawn to scale against the bulb.'),
          answer: ans, units: 'C/kg', tol: { rel: 0.01 },
          errors: [
            { value: ans / 4, feedback: t`You used the diameter as the radius: $r = D/2$, and $e/m \propto 1/r^2$ — a factor of 4.` },
            { value: (2 * V) / (K0 * I * q.r), feedback: t`Both $B$ and $r$ are squared: $e/m = 2V/(B^2r^2)$.` },
          ],
          hints: [t`$B = kI$, and $r = D/2$ in metres.`, t`$e/m = 2V/(B^2r^2)$ — from $\tfrac12mv^2 = eV$ and $r = mv/(eB)$.`],
          teach: t`Eliminate the speed between $\tfrac12mv^2 = eV$ and $r = mv/eB$: $e/m = 2V/(B^2r^2)$.`,
          explain: t`$B = ${tex(K0, 4)} \times ${I.toFixed(1)} = ${tex(K0 * I, 4)}$ T and $r = ${(q.r * 1000).toFixed(2)}$ mm, so $e/m = 2(${V})/[(${tex(K0 * I, 4)})^2(${tex(q.r, 4)})^2] = ${tex(ans, 4)}$ C/kg. One reading’s σ: $2\sigma_r/r = ${(100 * (2 * q.sr) / q.r).toFixed(1)}\%$ from the diameter alone.`,
        };
      },
    }),
    num({
      id: 'from-slope', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = runEm(seed);
        const b = +A.fit.b.toFixed(3);
        const ans = (2 * P0.V * b * b) / K0 ** 2;
        return {
          prompt: t`A run at $V = 200$ V gives the weighted fit $1/r = a + bI$ with slope $b = ${b.toFixed(3)}\ \text{m}^{-1}\text{A}^{-1}$. The coil constant is $k = ${tex(K0, 4)}$ T/A. What is $e/m$? Answer in C/kg.`,
          visual: rigPlot('em', { seed }, t`The run: $1/r$ against $I$ with the weighted fit and its residuals. ${SIMNOTE}`),
          answer: ans, units: 'C/kg', tol: { rel: 0.005 },
          errors: [
            { value: (2 * P0.V * b) / K0, feedback: t`The slope is $k\sqrt{e/2mV}$: solve for $e/m$ and the slope comes out squared, $e/m = 2Vb^2/k^2$.` },
            { value: (b * b) / (2 * P0.V * K0 ** 2), feedback: t`Upside down: $b^2 = k^2 e/(2mV)$ gives $e/m = 2Vb^2/k^2$.` },
          ],
          hints: [t`The slope of $1/r$ against $I$ is $b = k\sqrt{e/(2mV)}$.`, t`Square it: $b^2 = k^2 (e/m)/(2V)$.`],
          teach: t`The slope of $1/r$ against $I$ is $k\sqrt{e/2mV}$, so $e/m = 2Vb^2/k^2$.`,
          explain: t`$e/m = 2(200)(${b.toFixed(3)})^2/(${tex(K0, 4)})^2 = ${tex(ans, 4)}$ C/kg (CODATA: $${tex(CODATA, 6)}$).`,
        };
      },
    }),
    num({
      id: 'sigma-em', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = runEm(seed);
        const b = +A.fit.b.toFixed(3), sb = +A.fit.sb.toFixed(2);
        const em = (2 * P0.V * b * b) / K0 ** 2, ans = 2 * (sb / b) * em;
        return {
          prompt: t`The same kind of fit gives $b = ${b.toFixed(3)} \pm ${sb.toFixed(2)}\ \text{m}^{-1}\text{A}^{-1}$, so $e/m = ${tex(em, 4)}$ C/kg. Taking $V$ and $k$ as exact, what is the standard uncertainty of $e/m$? Answer in C/kg.`,
          visual: rigPlot('em', { seed }, t`The fitted run. Its slope’s uncertainty comes from the scatter of the points about the line and the spread of the currents. ${SIMNOTE}`),
          answer: ans, units: 'C/kg', tol: { rel: 0.02 },
          errors: [{ value: ans / 2, feedback: t`$e/m \propto b^2$: a power multiplies the relative uncertainty by the power, so $\sigma_{e/m}/(e/m) = 2\sigma_b/b$.` }, { value: ans / 2 / em * 1e2, feedback: 'That is half the relative uncertainty in percent. Double it, then multiply by e/m to get C/kg.' }],
          hints: [t`$e/m = 2Vb^2/k^2$: only $b$ carries uncertainty here.`, t`For $y = x^2$, $\sigma_y/y = 2\sigma_x/x$ ([powers](#/lesson/lab.A3.1)).`],
          teach: t`A squared quantity doubles the relative uncertainty: $\sigma_{e/m}/(e/m) = 2\sigma_b/b$.`,
          explain: t`$\sigma_b/b = ${(sb / b * 100).toFixed(2)}\%$, so $\sigma_{e/m} = 2 \times ${(sb / b).toFixed(4)} \times ${tex(em, 4)} = ${tex(ans, 2)}$ C/kg.`,
        };
      },
    }),
    num({
      id: 'ambient', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), A = runEm(seed);
        const a = +A.fit.a.toFixed(3), b = +A.fit.b.toFixed(3);
        const ans = (K0 * a) / b * 1e6;
        return {
          prompt: t`A fit of $1/r$ against $I$ gives intercept $a = ${a.toFixed(3)}\ \text{m}^{-1}$ and slope $b = ${b.toFixed(3)}\ \text{m}^{-1}\text{A}^{-1}$, with $k = ${tex(K0, 4)}$ T/A. What axial ambient field $B_a$ does the intercept imply? Answer in μT (negative if it opposes the coils).`,
          visual: rigPlot('em', { seed, expected: true }, t`The fit (gold) against the line with no ambient field (dashed): the gap at $I = 0$ is the intercept. ${SIMNOTE}`),
          answer: ans, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: (a / b) * 1e6, feedback: t`$a/b$ is the intercept on the current axis, $B_a/k$, in amperes: multiply by $k$ to get a field.` }, { value: (a * b) * 1e6, feedback: t`Divide, do not multiply: $a/b = B_a/k$.` }].filter((e) => Math.abs(e.value - ans) > 0.05 * Math.abs(ans)),
          hints: [t`$a = B_a\sqrt{e/2mV}$ and $b = k\sqrt{e/2mV}$: the unknown square root cancels in a ratio.`, t`$B_a = k\,a/b$.`],
          teach: t`The intercept divided by the slope is the ambient field in amperes of coil current, $B_a/k$.`,
          explain: t`$B_a = ${tex(K0, 4)} \times ${a.toFixed(3)}/${b.toFixed(3)} = ${ans.toFixed(1)}\ \mu\text{T}$. Its uncertainty is typically 20 μT here — a long extrapolation to $I = 0$ — so this measures the ambient field only roughly.`,
        };
      },
    }),
    mcq({
      id: 'reverse', difficulty: 3,
      prompt: t`You repeat each reading with the coil current reversed, so the beam curls the other way (the tube can be turned so it still circles inside the bulb). The coils’ field flips; the ambient field does not. What does averaging $1/r$ for the two directions at each current give you?`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 2.2], y: [0, 40], xlabel: 'I (A)', ylabel: '1/r (m⁻¹)', axesAt: 'edge',
          curves: [{ fn: '16.35*(x - 0.32)', color: 'accent', label: 'with the ambient field', labelAt: 1.25, labelDx: 10, labelDy: 10 }, { fn: '16.35*(x + 0.32)', color: 'violet', label: 'current reversed', labelAt: 0.35, labelDx: -4, labelDy: -14 }, { fn: '16.35*x', color: 'good', dash: true }],
        },
        caption: t`Illustrative lines: the two directions straddle the line through the origin (dashed). The gap between them is drawn ten times larger than a 25 μT field would make it.`,
      },
      choices: [
        t`$\sqrt{e/2mV}\,kI$ exactly: the ambient field cancels, and half the difference measures $B_a$ directly`,
        'The same as one direction: the ambient field is part of the beam’s field and cannot be separated',
        'Twice the ambient field, so the average must be divided by two before fitting',
        t`A value with half the random scatter, but the ambient field still biased the same way`,
      ],
      answer: 0,
      why: {
        1: t`It can be separated precisely because only the coils’ part reverses: $|{-kI} + B_a| = kI - B_a$ while the other direction gives $kI + B_a$.`,
        2: 'The average of kI + Bₐ and kI − Bₐ is kI: the ambient field drops out instead of doubling.',
        3: 'The scatter does shrink by √2, but the bias does not survive: it enters the two directions with opposite signs.',
      },
      hints: [t`Write the field magnitude for each direction: $kI + B_a$ and $kI - B_a$.`, t`$1/r$ is proportional to the field magnitude. Add the two and halve.`],
      teach: 'A reversal measurement cancels any effect that does not reverse with the knob you flip — and their difference measures it.',
      explain: t`$1/r_\pm = \sqrt{e/2mV}\,(kI \pm B_a)$, so the average is $\sqrt{e/2mV}\,kI$ and half the difference is $\sqrt{e/2mV}\,B_a$ — measured at every current, not extrapolated to zero. The same move cancels thermocouple offsets and Hall-probe zeros ([calibration and systematic error](#/lesson/lab.A7.1)).`,
    }),
    num({
      id: 'budget', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), A = runEm(seed);
        const stat = A.results[0].sigma / A.results[0].value;
        const dR = r.pick([0.5, 1, 2]), R = 150;
        const rad = (2 * dR) / R;
        const ans = 100 * Math.hypot(stat, rad);
        return {
          prompt: t`A fit gives $e/m$ with a statistical relative uncertainty of $${(100 * stat).toFixed(2)}\%$. The coils’ radius, $R = ${R}$ mm, is known to a standard uncertainty of $${dR}$ mm, and nothing else matters. What is the combined relative uncertainty of $e/m$, in percent?`,
          visual: budget([{ label: 'statistical (the fit)', u: 100 * stat }, { label: `coil radius (±${dR} mm)`, u: 100 * rad }], { unit: '%', caption: 'The two contributions to scale, and their quadrature sum.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: 100 * (stat + rad), feedback: 'Independent uncertainties add in quadrature, not linearly.' },
            { value: 100 * Math.hypot(stat, dR / R), feedback: t`$e/m = 2Vb^2/k^2$ and $k \propto 1/R$, so $e/m \propto R^2$: the radius’s relative uncertainty counts twice.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$k = (4/5)^{3/2}\mu_0N/R$, so $e/m = 2Vb^2/k^2 \propto R^2$.`, t`The radius contributes $2\,\sigma_R/R$; combine it with the statistical part as $\sqrt{s^2 + r^2}$.`],
          teach: t`Every input of the measurement model gets an uncertainty; independent ones add in quadrature, each weighted by how strongly the result depends on it.`,
          explain: t`The radius gives $2 \times ${dR}/${R} = ${(100 * rad).toFixed(2)}\%$; in quadrature with $${(100 * stat).toFixed(2)}\%$, $\sqrt{${(100 * stat).toFixed(2)}^2 + ${(100 * rad).toFixed(2)}^2} = ${ans.toFixed(2)}\%$. Real coils add more: the field is only uniform near the centre, and the beam’s energy is not exactly $eV$ (the filament’s potential, contact potentials).`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), A = runEm(seed);
        const em = A.results[0].value, s = A.results[0].sigma;
        const ans = (em - CODATA) / s;
        return {
          prompt: t`A run gives $e/m = ${tex(em, 4)} \pm ${tex(s, 2)}$ C/kg (statistical only). How many standard uncertainties is it from the CODATA value, $${tex(CODATA, 6)}$ C/kg? Give $z$ with its sign.`,
          visual: rigPlot('em', { seed, expected: true }, t`The run, with the line CODATA predicts if there were no ambient field (dashed). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.06 },
          errors: [{ value: (100 * (em - CODATA)) / CODATA, feedback: 'That is the percentage difference. A difference only means something in units of its uncertainty: divide by σ.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['Subtract CODATA from your value.', t`$z = (x - x_\text{ref})/\sigma$; CODATA’s own uncertainty is negligible here.`],
          teach: t`Agreement is judged by $z = \Delta/\sigma$, not by a percentage.`,
          explain: t`$z = (${tex(em, 4)} - ${tex(CODATA, 6)})/${tex(s, 2)} = ${ans.toFixed(2)}$. ${Math.abs(ans) < 2 ? 'Within 2σ: consistent.' : 'Beyond 2σ: look for a systematic before believing it.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-trend', difficulty: 3,
      prompt: t`A lab partner works out $e/m$ point by point from $B = kI$ and finds the values rising steadily with coil current, from about ${TR1}% below CODATA at 1 A to about ${TR2}% below at 2 A. Which explanation fits?`,
      visual: rigPlot('em', { seed: 9, axes: 'pp', expected: true }, t`Point-by-point $e/m$ against current with a weighted mean (gold) and CODATA (dashed). ${SIMNOTE}`),
      choices: [
        t`A steady ambient field opposes the coils’: $B$ is really $kI - |B_a|$, a bigger fraction of $kI$ at low current`,
        t`The diameter readings are too noisy at low current, and noise biases $e/m$ low`,
        'The accelerating voltage drifts upward during the run',
        t`The electrons slow down in the gas, so the circle shrinks more at high current`,
      ],
      answer: 0,
      why: {
        1: 'Random noise scatters points both ways; it does not make a smooth trend with current.',
        2: 'A drift with time shows against reading order, not neatly against current — and the readings need not be taken in order of current.',
        3: t`Losing energy would curl the beam tighter at every current alike; it does not make $e/m$ depend on $I$ in this way.`,
      },
      hints: [t`Point by point, the calculation gives $(e/m)(1 + B_a/kI)^2$.`, 'For which sign of Bₐ is that factor below 1, and where is it furthest from 1?'],
      teach: 'A trend in a quantity that should be constant points at a systematic that depends on the knob — here, a fixed field that matters less as the coils’ field grows.',
      explain: t`$(1 + B_a/kI)^2$ with $B_a = -25\ \mu\text{T}$ is $${TF(1).toFixed(3)}$ at 1 A ($kI = ${(K0 * 1000).toFixed(3)}$ mT) and $${TF(2).toFixed(3)}$ at 2 A — exactly the climb. Fitting $1/r$ against $I$ puts $B_a$ in the intercept and removes it from $e/m$.`,
    }),
    num({
      id: 'cp-xenon', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([250, 300, 350]), B = r.pick([0.010, 0.015, 0.020]);
        const mXe = 131.293 * 1.66053906892e-27;
        const ans = Math.sqrt((2 * mXe * V) / M.K.e) / B;
        const re = Math.sqrt((2 * M.K.me * 20) / M.K.e) / B;
        return {
          prompt: t`In a Hall thruster, singly charged xenon ions (mass $131.29$ u, with $1\ \text{u} = 1.6605\times10^{-27}$ kg) are accelerated through about $${V}$ V across a radial magnetic field of about $${(B * 1000).toFixed(0)}$ mT (illustrative values). Using the same relation as the $e/m$ tube, $r = \sqrt{2mV/q}\,/B$, what is an ion’s radius of curvature in that field? Answer in m.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 400], y: [0, 6], xlabel: 'energy of an electron (eV)', ylabel: 'electron radius (mm)', axesAt: 'edge', curves: [{ fn: `${(Math.sqrt((2 * M.K.me) / M.K.e) / B * 1000).toFixed(6)}*sqrt(x)`, color: 'accent' }], points: [{ x: 20, y: +(re * 1000).toFixed(4), label: 'a 20 eV electron', color: 'gold' }] }, caption: t`The same formula for electrons in this field: their circles are millimetres across, so the field traps them. Compute the ion’s yourself.` },
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: ans / Math.sqrt(131.293), feedback: 'You used the mass of one atomic mass unit: multiply by 131.29.' }, { value: Math.sqrt((mXe * V) / M.K.e) / B, feedback: t`Kinetic energy $qV = \tfrac12mv^2$ gives $v = \sqrt{2qV/m}$; the 2 belongs under the root.` }],
          hints: [t`$m = 131.29 \times 1.6605\times10^{-27}$ kg $= ${tex(mXe, 4)}$ kg and $q = e$.`, t`$r = \sqrt{2mV/e}\,/B$.`],
          teach: t`The $e/m$ tube’s relation $r = \sqrt{2mV/q}/B$ sizes any charged particle’s circle — and the mass makes all the difference.`,
          explain: t`$r = \sqrt{2(${tex(mXe, 4)})(${V})/${tex(M.K.e, 4)}}\,/\,${B} = ${ans.toFixed(2)}$ m — far bigger than a thruster channel a few centimetres wide, while a 20 eV electron circles in $${(re * 1000).toFixed(1)}$ mm. That is the design: the field traps electrons (which ionize the propellant) and barely steers the ions it accelerates.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'J. J. Thomson, Cathode rays, Philosophical Magazine 44, 293 (1897)', url: 'https://doi.org/10.1080/14786449708621070' },
    SRC.codata,
    SRC.taylor('ch. 8 (least-squares fitting)'),
    SRC.usu,
  ],
});
