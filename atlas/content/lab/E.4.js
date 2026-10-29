// Franck–Hertz — the lab view: peaks located on a mercury tube's current
// curve, their positions fitted against order n; the contact potential in
// the intercept (so the first peak's voltage is not the excitation energy);
// the mean-free-path stretch of the spacings (Rapior, Sengstock & Baev 2006)
// that curves the position plot and biases its slope; the spacing analysis
// extrapolated to n = ½ with the fit's covariance; why averaging successive
// spacings throws away the middle peaks; and the 253.7 nm photon. Xenon in an
// ion engine's discharge as the transfer. Every number is computed from the
// seeded model the labe-rig simulation draws with (_labe.js).
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, table, SIMNOTE, SRC } from './_labe.js';
import { ellipse } from './_labf.js';

const t = String.raw;
const EA = M.HG_3P1;                              // eV
const HC = (M.K.h * M.K.c / M.K.e) * 1e9;         // eV nm
const NS = [1, 2, 3, 4, 5, 6, 7];

// ── the worked example: seven peaks, seed 1 ──
const EX = M.run('fh', { seed: 1 });
const GX = M.analyse('fh', EX.rows, { axes: 'gap' });
const EXE = GX.results[0], EXlam = GX.results[1];

const fhRun = (seed, flags = {}, axes = null) => M.run('fh', { seed, flags, axes });

export default lesson({
  id: 'lab.E.4',
  title: 'Franck–Hertz',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`In 1914 James Franck and Gustav Hertz drove electrons through mercury vapour and found the current to the collector falling each time the accelerating voltage rose by about 4.9 V: an electron can give an atom energy only in one lump. In the lab you sweep the voltage, locate the peaks, and fit their positions against their order $n$. Two things keep the first peak’s voltage from being the excitation energy, and one keeps even the spacing from being it: a contact potential shifts every peak, and an electron that has reached the excitation energy travels on about one mean free path, gaining extra energy, before it collides — so **the spacings grow with $n$**.`,
  equation: t`V_n = V_c + nE + n^2E\,\frac{\lambda}{L}, \qquad \Delta V_n = E\Bigl[1 + (2n - 1)\frac{\lambda}{L}\Bigr]`,
  symbols: [
    { tex: 'V_n', text: 'the accelerating voltage of the $n$-th current peak, in V' },
    { tex: 'n', text: 'the peak’s order: how many excitations an electron has made on its way across' },
    { tex: 'V_c', text: 'an offset, in V, mostly the contact potential between cathode and grid (about 2 V here)' },
    { tex: 'E', text: 'the excitation energy, in eV (numerically the voltage it takes): mercury’s $6s6p\\ {}^3P_1$ level, 4.887 eV' },
    { tex: '\\lambda', text: 'the electrons’ mean free path between collisions with mercury atoms' },
    { tex: 'L', text: 'the cathode–grid distance; $\\lambda/L$ is a fraction of a per cent here, and grows as the oven cools' },
    { tex: '\\Delta V_n', text: 'the spacing from peak $n - 1$ to peak $n$, in V' },
  ],
  why: t`A straight-line fit to data that are really curved does not fail loudly: it returns a precise, wrong slope — and only the residuals and χ² say so.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: locating the peaks of a Franck–Hertz curve',
    lead: t`Above, the anode current against accelerating voltage with each located peak marked. Below, the peak voltages against $n$ with a straight-line fit and its residuals. Pick a peak with the slider and take a reading: each location carries $\sigma = 0.06$ V.`,
    tasks: [
      'Look at the residuals: a smile — high at both ends, low in the middle. χ²/ν is several, and the slope sits about 0.2 V above 4.887.',
      'Switch off the mean-free-path stretch: the residuals flatten, χ²/ν drops near 1, and the slope agrees with 4.887 V.',
      'Switch it back on and set Plot to “spacing against n”: the spacings climb in a straight line, and its value at n = ½ is the excitation energy.',
    ],
    params: { exp: 'fh', seed: 3, residuals: true, expected: true },
    caption: t`Simulated peak positions: $V_n = 2.10\ \text{V} + nE + n^2E\lambda/L$ with $E = 4.887$ eV and $\lambda/L = 0.006$ (illustrative), each located with $\sigma = 0.06$ V. The curve’s shape between peaks is drawn, not computed. Dashed green: positions with no stretch. ${SIMNOTE}`,
  },
  example: {
    prompt: t`You locate seven current peaks, each to $\sigma = 0.06$ V:

${table([['n', ...NS.map(String)], [t`V_n\ (\text{V})`, ...EX.R.map((q) => q.V.toFixed(2))]])}

Find the excitation energy of mercury, with its uncertainty.`,
    visual: rigPlot('fh', { seed: 1 }, t`The seven positions, a straight-line fit and its residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Straight line', text: t`A weighted line through $V_n$ against $n$ gives slope $${pmT(EX.fit.b, EX.fit.sb)}$ V and $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ for $\nu = 5$ — a probability of ${(100 * EX.fit.pval).toFixed(1)}% that a straight line with these error bars scatters this much ([χ²](#/lesson/lab.A6.1)). The residuals smile: the data curve upward.` },
      { label: 'Why it curves', text: t`An electron reaching energy $E$ goes on about one mean free path $\lambda$ before colliding, picking up $eV\lambda/L$ more. At the $n$-th peak that extra is paid $n$ times, so $V_n \approx nE(1 + n\lambda/L)$: quadratic, and the spacings rise linearly, $\Delta V_n = E[1 + (2n - 1)\lambda/L]$.` },
      { label: 'Spacings', text: t`Differences of neighbouring peaks: ${GX.d.y.map((v) => `$${v.toFixed(2)}$`).join(', ')} V for $n = 2$ to $7$, each with $\sigma = 0.06\sqrt2 = 0.085$ V. The offset $V_c$ cancels in every difference.` },
      { label: 'Fit the spacings', text: t`A line $\Delta V_n = a + bn$ gives $a = ${pmT(GX.fit.a, GX.fit.sa)}$ V and $b = ${pmT(GX.fit.b, GX.fit.sb)}$ V, with covariance $${tex(GX.fit.cov, 2)}\ \text{V}^2$.` },
      { label: 'Extrapolate', text: t`The stretch vanishes at $2n - 1 = 0$: $E = a + b/2 = ${EXE.value.toFixed(3)}$ eV. Its variance needs the covariance ([covariance](#/lesson/lab.A6.3)): $\sigma_E^2 = \sigma_a^2 + \sigma_b^2/4 + \operatorname{cov}(a, b)$, so $\sigma_E = ${EXE.sigma.toFixed(3)}$ eV. And $\lambda/L = b/2E = ${resT(EXlam)}$.` },
      { label: 'Compare', text: t`NIST puts the $6s6p\ {}^3P_1$ level at $39\,412.300\ \text{cm}^{-1}$, which is $${EA.toFixed(4)}$ eV: $z = ${EXE.z.toFixed(2)}$. The straight-line slope, $${EX.fit.b.toFixed(3)}$ V, was ${((EX.fit.b - EA) / EX.fit.sb).toFixed(0)}σ high: precise and wrong.` },
      { label: 'Sense check', text: t`The atoms emit what they absorbed: $\lambda = hc/E = ${(HC / EA).toFixed(2)}$ nm in vacuum, the ultraviolet line Franck and Hertz saw from their tube. The honest answer is ${Math.round(EXE.sigma / EX.fit.sb)} times less precise than the straight line’s — the price of not assuming the stretch away.` },
    ],
    answer: t`$E = ${EXE.value.toFixed(2)} \pm ${EXE.sigma.toFixed(2)}$ eV from the spacings (NIST: 4.887 eV); the straight-line slope $${pmT(EX.fit.b, EX.fit.sb)}$ V is biased by the mean-free-path stretch.`,
  },
  practice: [
    num({
      id: 'mean-spacing', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = fhRun(seed, { mfp: false });
        const V = A.R.map((q) => q.V);
        const ans = (V[6] - V[0]) / 6;
        return {
          prompt: t`Seven peaks are found at ${V.map((v) => `$${v.toFixed(2)}$`).join(', ')} V. What is the mean of the six successive spacings? Answer in V.`,
          visual: rigRaw('fh', { seed, flags: { mfp: false } }, 'The current curve with the seven located peaks marked.'),
          answer: ans, units: 'V', tol: { rel: 0.002 },
          errors: [{ value: V[0], feedback: 'The first peak’s voltage includes the contact potential. Use the spacings, which cancel it.' }, { value: V[6] / 7, feedback: 'Dividing a peak’s voltage by n keeps the contact potential in it. Use differences.' }],
          hints: ['Write out the six differences and add them.', 'The sum telescopes: (V₂ − V₁) + (V₃ − V₂) + … = V₇ − V₁.'],
          teach: 'The mean of successive differences is (last − first)/(N − 1): the middle readings cancel out entirely.',
          explain: t`$(${V[6].toFixed(2)} - ${V[0].toFixed(2)})/6 = ${ans.toFixed(3)}$ V. Only two of the seven readings survived the averaging — see the next question.`,
        };
      },
    }),
    mcq({
      id: 'telescope', difficulty: 3,
      prompt: 'Why is a least-squares line through all seven peak positions better than averaging the six successive spacings?',
      visual: rigPlot('fh', { seed: 4, flags: { mfp: false } }, t`Seven positions with a straight-line fit (no stretch in these simulated data). ${SIMNOTE}`),
      choices: [
        'The average of the spacings depends only on the first and last peaks; the fit uses every peak, so its slope is more precise',
        'The average of the spacings is biased by the contact potential; the fit is not',
        'They give the same answer and uncertainty; the fit is only quicker',
        'The fit removes the mean-free-path stretch automatically',
      ],
      answer: 0,
      why: {
        1: 'Both are free of the contact potential: a difference cancels it, and a fit puts it in the intercept.',
        2: 'Their values differ, and so do their uncertainties: the endpoint estimate has σ√2/6 for six spacings, the fit σ/√28.',
        3: 'A straight-line fit assumes no stretch; it is biased by it just as much (the next experiment shows how to handle it).',
      },
      hints: ['Write the average of the six spacings in terms of the peak voltages.', t`For equally spaced $n$ the line’s slope has $\sigma/\sqrt{\sum(n - \bar n)^2} = \sigma/\sqrt{28}$.`],
      teach: 'Averaging successive differences of equally spaced readings throws away all but the two end readings.',
      explain: t`The average is $(V_7 - V_1)/6$ with $\sigma = 0.06\sqrt2/6 = 0.014$ V; the fit’s slope has $0.06/\sqrt{28} = 0.011$ V and uses all seven. The gain grows with more peaks, and the fit’s residuals check the model as well.`,
    }),
    num({
      id: 'half', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), A = fhRun(seed, {}, 'gap');
        const a = +A.fit.a.toFixed(3), b = +A.fit.b.toFixed(4);
        const ans = a + b / 2;
        return {
          prompt: t`A fit of the spacings $\Delta V_n$ against $n$ gives $\Delta V_n = ${a.toFixed(3)} + ${b.toFixed(4)}\,n$ (in V). With $\Delta V_n = E[1 + (2n - 1)\lambda/L]$, what is the excitation energy $E$? Answer in eV.`,
          visual: rigPlot('fh', { seed, axes: 'gap' }, t`The spacings against $n$ and their fit. ${SIMNOTE}`),
          answer: ans, units: 'eV', tol: { rel: 0.001 },
          errors: [{ value: a, feedback: t`The intercept is the line at $n = 0$, where $(2n - 1)\lambda/L = -\lambda/L$, not zero. The stretch vanishes at $n = \tfrac12$.` }, { value: a + b, feedback: t`That is the first spacing, $n = 1$, which already includes one $\lambda/L$ of stretch. Evaluate at $n = \tfrac12$.` }],
          hints: [t`At what $n$ does $(2n - 1)$ vanish?`, t`$E = a + b/2$.`],
          teach: t`Extrapolate the spacing line to $n = \tfrac12$, where the stretch term vanishes.`,
          explain: t`$E = ${a.toFixed(3)} + ${b.toFixed(4)}/2 = ${ans.toFixed(3)}$ eV (NIST: 4.887 eV). And $\lambda/L = b/2E = ${(b / (2 * ans)).toFixed(4)}$.`,
        };
      },
    }),
    num({
      id: 'cov', difficulty: 3,
      gen(r) {
        const sa = r.float(0.08, 0.12, 0.01), sb = r.float(0.018, 0.028, 0.001), rho = -r.float(0.82, 0.92, 0.01);
        const cov = rho * sa * sb;
        const ans = Math.sqrt(sa * sa + (sb * sb) / 4 + cov);
        return {
          prompt: t`For the spacing fit $\Delta V_n = a + bn$ the uncertainties are $\sigma_a = ${sa.toFixed(2)}$ V, $\sigma_b = ${sb.toFixed(3)}$ V, with correlation coefficient $\rho = ${rho.toFixed(2)}$. What is the standard uncertainty of $E = a + b/2$? Answer in V.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-2.2 * sa, 2.2 * sa].map((v) => +(4.88 + v).toFixed(4)), y: [-2.2 * sb, 2.2 * sb].map((v) => +(0.06 + v).toFixed(4)), xlabel: 'intercept a (V)', ylabel: 'slope b (V)', axesAt: 'edge', curves: [ellipse(4.88, 0.06, sa, sb, rho, 1, { color: 'accent' })], points: [{ x: 4.88, y: 0.06, color: 'gold' }] }, caption: t`The fit’s 1σ ellipse in $(a, b)$ (centre illustrative): tilted, because raising the intercept forces the slope down. ${SIMNOTE}` },
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(sa * sa + (sb * sb) / 4), feedback: t`You left out the covariance term, $\operatorname{cov}(a, b) = \rho\sigma_a\sigma_b$ — negative here, so it shrinks the result.` }, { value: Math.sqrt(sa * sa + (sb * sb) / 4 + 2 * cov), feedback: t`For $E = a + \tfrac12 b$ the cross term is $2 \cdot 1 \cdot \tfrac12\,\operatorname{cov} = \operatorname{cov}$, not $2\operatorname{cov}$.` }],
          hints: [t`$\sigma_E^2 = \sigma_a^2 + (\tfrac12)^2\sigma_b^2 + 2(1)(\tfrac12)\operatorname{cov}(a, b)$.`, t`$\operatorname{cov}(a, b) = \rho\,\sigma_a\sigma_b$.`],
          teach: 'A quantity built from two fitted parameters needs their covariance: a negative correlation partly cancels.',
          explain: t`$\operatorname{cov} = ${rho.toFixed(2)} \times ${sa.toFixed(2)} \times ${sb.toFixed(3)} = ${cov.toFixed(5)}\ \text{V}^2$, so $\sigma_E = \sqrt{${(sa * sa).toFixed(5)} + ${(sb * sb / 4).toFixed(6)} ${cov < 0 ? '-' : '+'} ${Math.abs(cov).toFixed(5)}} = ${ans.toFixed(3)}$ V.`,
        };
      },
    }),
    mcq({
      id: 'first-peak', difficulty: 2,
      prompt: 'The first current peak sits near 7 V, though the excitation energy is 4.9 eV. Which explanation is right?',
      visual: rigRaw('fh', { seed: 2 }, 'A simulated current curve with the seven located peaks (dots).'),
      choices: [
        'A contact potential (and the retarding voltage) offset every peak by the same couple of volts; the spacing is unaffected',
        'The first excitation needs 7 eV; only later ones need 4.9 eV',
        'Electrons start with negative kinetic energy at the cathode',
        'The mean-free-path stretch adds 2 V to the first spacing',
      ],
      answer: 0,
      why: {
        1: 'Every excitation of the same level takes the same energy; the first is not special.',
        2: 'They leave the hot cathode with a little positive energy, if anything; the offset comes from the metals’ different work functions.',
        3: 'The stretch is a fraction of a per cent of E per order — a few hundredths of a volt at n = 1, not two volts.',
      },
      hints: ['Does the offset change from peak to peak?', 'What differs between the cathode and grid metals?'],
      teach: 'An offset that is the same for every peak cancels in the spacings — so use spacings or a slope, never one peak’s absolute voltage.',
      explain: 'The cathode and the grid have different work functions, so the electrons see the applied voltage plus a contact potential; the small retarding voltage before the anode shifts things too. All of that is common to every peak, so it lands in the intercept of the position fit and cancels in every spacing.',
    }),
    num({
      id: 'uv', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = fhRun(seed, {}, 'gap');
        const E = +A.results[0].value.toFixed(3);
        const ans = HC / E;
        return {
          prompt: t`A run’s spacing analysis gives $E = ${E.toFixed(3)}$ eV. What vacuum wavelength of light should the excited atoms emit as they drop back? Answer in nm.`,
          visual: rigPlot('fh', { seed, axes: 'gap', residuals: false }, t`The spacing fit behind the result. ${SIMNOTE}`),
          answer: ans, units: 'nm', tol: { rel: 0.002 },
          errors: [{ value: 1240 / E / 2, feedback: 'No factor of 2: one excitation, one photon of the same energy.' }],
          hints: [t`$\lambda = hc/E$ with $hc = 1239.84$ eV nm.`],
          teach: 'An excitation energy measured by electrons and a photon wavelength measured by a spectrometer must agree: E = hc/λ.',
          explain: t`$\lambda = 1239.84/${E.toFixed(3)} = ${ans.toFixed(1)}$ nm, close to the mercury resonance line at 253.73 nm (vacuum; 253.65 nm in air). Franck and Hertz checked exactly this, and found the line only above the threshold voltage.`,
        };
      },
    }),
    mcq({
      id: 'corr', difficulty: 4,
      prompt: t`The spacing analysis fits $\Delta V_n = V_n - V_{n-1}$ for $n = 2$ to $7$ as if the six spacings had independent errors. Are they independent?`,
      visual: rigPlot('fh', { seed: 5, axes: 'gap' }, t`Six spacings with error bars $0.06\sqrt2$ V each, treated as independent by the fit. ${SIMNOTE}`),
      choices: [
        t`No: neighbouring spacings share a reading with opposite signs, so they are anticorrelated, and the fit’s stated σ is not right`,
        'Yes: each peak was located separately, so every spacing is independent',
        'No, but the correlation only affects χ², never the fitted values or their σ',
        t`No: they are positively correlated, so the error bars should be $\sqrt2$ times bigger`,
      ],
      answer: 0,
      why: {
        1: t`The *readings* are independent; the spacings are not. $V_3$ appears in $\Delta V_3$ with a plus sign and in $\Delta V_4$ with a minus.`,
        2: 'The covariance changes the best weighting and the uncertainties of a and b, not only χ².',
        3: t`Sharing a reading with opposite signs gives a negative covariance, $-\sigma^2$, between neighbours.`,
      },
      hints: [t`Write $\Delta V_3$ and $\Delta V_4$ in terms of the peak voltages.`, t`$\operatorname{cov}(V_3 - V_2,\ V_4 - V_3) = -\operatorname{var}(V_3)$.`],
      teach: 'Differences of neighbouring readings are correlated: an error in one reading raises one spacing and lowers the next.',
      explain: t`$\operatorname{cov}(\Delta V_n, \Delta V_{n+1}) = -\sigma^2$ and $\rho = -\tfrac12$. A fit that ignores it misstates the uncertainties — over many simulated runs here, it overstates $\sigma_E$. The clean alternative fits the positions directly with the quadratic model, $V_n = V_c + nE + n^2E\lambda/L$, a [nonlinear fit](#/lesson/lab.A5.3) to independent readings.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-slope', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), A = fhRun(seed, { mfp: false });
        const V = A.R.map((q) => +q.V.toFixed(2));
        const ans = V.reduce((s, v, i) => s + (i + 1 - 4) * v, 0) / 28;
        return {
          prompt: t`A cooler tube shows no measurable stretch. Its seven peaks ($n = 1$ to $7$, equal uncertainties) are at ${V.map((v) => `$${v.toFixed(2)}$`).join(', ')} V. What is the least-squares slope of $V_n$ against $n$? Answer in V.`,
          visual: rigPlot('fh', { seed, flags: { mfp: false }, fit: false, residuals: false }, t`The seven positions, unfitted. ${SIMNOTE}`),
          answer: ans, units: 'V', tol: { rel: 0.0015 },
          errors: [{ value: (V[6] - V[0]) / 6, feedback: '(V₇ − V₁)/6 uses only the end points. The least-squares slope is Σ(n − n̄)Vₙ / Σ(n − n̄)².' }].filter((x) => Math.abs(x.value - ans) > 0.0015 * ans),
          hints: [t`With $\bar n = 4$, $b = \sum(n - 4)V_n/\sum(n - 4)^2$.`, t`$\sum(n - 4)^2 = 9 + 4 + 1 + 0 + 1 + 4 + 9 = 28$.`],
          teach: t`For equally spaced $x$, the least-squares slope is $\sum (x - \bar x)\,y/\sum (x - \bar x)^2$.`,
          explain: t`$\sum(n - 4)V_n = ${V.reduce((s, v, i) => s + (i + 1 - 4) * v, 0).toFixed(2)}$, so $b = ${ans.toFixed(3)}$ V. Weights $-3$ to $3$: every peak counts, the outer ones most.`,
        };
      },
    }),
    mcq({
      id: 'cp-smile', difficulty: 3,
      prompt: t`A straight-line fit of peak voltage against $n$ gives a slope of $5.12 \pm 0.01$ V with $\chi^2/\nu = 6$ and residuals that are positive at both ends and negative in the middle. What should you report?`,
      visual: rigPlot('fh', { seed: 6 }, t`The fit and its residuals. ${SIMNOTE}`),
      choices: [
        t`Not $5.12 \pm 0.01$ V: the model is wrong (the spacings grow), so fit the spacings against $n$ and extrapolate to $n = \tfrac12$`,
        t`$5.12 \pm 0.01$ V, since the statistical uncertainty is so small`,
        t`$5.12 \pm 0.025$ V: inflate σ by $\sqrt{\chi^2/\nu}$ and report the slope`,
        'Drop the two outer peaks, which are outliers, and refit',
      ],
      answer: 0,
      why: {
        1: 'A tiny σ on a model that does not fit measures nothing: χ²/ν = 6 with a pattern says the line is the wrong shape.',
        2: 'Scaling σ by √(χ²/ν) is for scatter that is random but underestimated — not for a systematic curvature, which biases the value itself.',
        3: 'Both ends are high because the data curve; removing them hides the curvature without curing it.',
      },
      hints: ['What does a smile-shaped residual pattern say about the model?', 'Is the problem the size of σ, or the value of the slope?'],
      teach: 'Structured residuals with a large χ² mean a wrong model: fix the model, do not inflate the error bar.',
      explain: t`Curvature in the residuals is the mean-free-path stretch. The position fit’s slope averages the growing spacings and lands high. The spacing analysis models the growth and recovers $E$ at $n = \tfrac12$, with an honestly larger σ ([residual analysis](#/lesson/lab.A6.2)).`,
    }),
    num({
      id: 'cp-xenon', difficulty: 2, transfer: true,
      prompt: t`An ion engine’s xenon discharge glows in the vacuum ultraviolet: xenon’s resonance line is at $146.96$ nm. If you built a Franck–Hertz tube with xenon instead of mercury, what peak spacing would you expect from that level (ignoring the stretch)? Answer in V.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [100, 300], y: [0, 13], xlabel: 'photon wavelength (nm)', ylabel: 'photon energy (eV)', axesAt: 'edge', curves: [{ fn: `${HC.toFixed(3)}/x`, color: 'accent' }], points: [{ x: +(HC / EA).toFixed(3), y: +EA.toFixed(4), color: 'gold', label: 'mercury, 253.7 nm', labelDx: 8, labelDy: -12 }] }, caption: 'Photon energy against vacuum wavelength, E = hc/λ, with mercury’s resonance line marked. Read or compute xenon’s.' },
      answer: HC / 146.96, units: 'V', tol: { rel: 0.003 },
      errors: [{ value: 146.96 / HC, feedback: t`Upside down: $E = hc/\lambda = 1239.84/\lambda_\text{nm}$ eV.` }],
      hints: [t`$E = 1239.84/\lambda_\text{nm}$ eV, and a spacing in volts equals the energy in eV.`],
      teach: 'Whatever the gas, the Franck–Hertz spacing is the energy of its lowest strongly excited level — the photon it re-emits.',
      explain: t`$E = 1239.84/146.96 = ${(HC / 146.96).toFixed(2)}$ eV, so peaks about 8.4 V apart (plus a stretch). In a thruster’s discharge, every such excitation is energy lost to light rather than spent ionizing propellant — one reason ion engines pay well over the 12.1 eV ionization energy for each ion.`,
    }),
  ],
  sources: [
    { label: 'The Nobel Prize in Physics 1925: James Franck and Gustav Hertz (their 1914 papers appeared in Verhandlungen der Deutschen Physikalischen Gesellschaft 16)', url: 'https://www.nobelprize.org/prizes/physics/1925/summary/' },
    { label: 'G. Rapior, K. Sengstock & V. Baev, New features of the Franck–Hertz experiment, American Journal of Physics 74, 423 (2006)', url: 'https://doi.org/10.1119/1.2174033' },
    SRC.asd,
    SRC.taylor('ch. 8'),
  ],
});
