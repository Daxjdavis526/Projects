// The hydrogen spectrum and the Rydberg constant — the lab view: a grating
// spectrometer, calibrated on mercury's green line, measures the angles of
// four Balmer lines; 1/λ against 1/4 − 1/n² is a straight line through the
// origin whose slope is the Rydberg constant for hydrogen. Reading both
// sides cancels the table's zero; the grating's label (600 lines/mm) against
// its calibration as the systematic; air against vacuum wavelengths as a
// correction too small to matter here; the reduced mass and deuterium's
// isotope shift; a galaxy's redshifted Hα as the transfer. Every number is
// computed from the seeded model the labg-classics simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, SIMNOTE, SRC } from './_classic.js';

const t = String.raw;
const PR = M.EXPERIMENTS.rydberg.defaults;
const K = M.K, RH = K.RH;
const D2R = Math.PI / 180;
const HG = 546.074;                                   // nm, mercury green (air, NIST ASD)
const thHg = +M.gratingTheta(HG, PR.N).toFixed(3);    // the calibration angle as read
const Ncal = Math.sin(thHg * D2R) / (HG * 1e-6);      // lines per mm
const sThHg = (PR.sTh / Math.SQRT2) * D2R;
const relCal = sThHg / Math.tan(thHg * D2R);

// the worked example: seed 3
const EX = M.run('rydberg', { seed: 3 });
const EXR = EX.results[0];
const lamAir = EX.R.map((q) => (Math.sin(q.th * D2R) / Ncal) * 1e6);   // nm
const relS = EXR.sigma / EXR.value, relAll = Math.hypot(relS, relCal);
const sAll = relAll * EXR.value, zAll = (EXR.value - RH) / sAll;
const runR = (seed, flags = {}) => M.run('rydberg', { seed, flags });
const fmtR = (x) => tex(x, 6);

export default lesson({
  id: 'lab.E.24',
  title: 'Hydrogen spectrum and the Rydberg constant',
  minutes: 17, difficulty: 3,
  lab: true,
  intro: t`Heat hydrogen in a discharge tube and it glows in a handful of sharp colours. In 1885 Johann Balmer found a formula for their wavelengths; Rydberg generalized it; Bohr explained it in 1913: an electron dropping from level $n$ to level 2 emits a photon whose inverse wavelength is proportional to $1/2^2 - 1/n^2$. A diffraction grating sends each line to its own angle, $d\sin\theta = \lambda$ in first order. Measure four angles, turn them into wavelengths, and **plot $1/\lambda$ against $1/4 - 1/n^2$**: a line through the origin whose slope is the Rydberg constant — one of the best-known numbers in physics.`,
  equation: t`\frac{1}{\lambda} = R_H\left(\frac{1}{2^2} - \frac{1}{n^2}\right)`,
  symbols: [
    { tex: '\\lambda', text: 'the line’s wavelength in vacuum, in nm (the spectrometer measures it in air, 0.028% shorter)' },
    { tex: 'R_H', text: 'the Rydberg constant for hydrogen, in $\\text{m}^{-1}$: $R_\\infty/(1 + m_e/m_p) = 1.096\\,776 \\times 10^{7}\\ \\text{m}^{-1}$ (from CODATA), the reduced-mass version of $R_\\infty$' },
    { tex: 'n', text: 'the upper level of the jump: 3 for Hα (red), 4 for Hβ (cyan), 5 for Hγ and 6 for Hδ (violet)' },
    { tex: '2', text: 'the lower level shared by every Balmer line' },
    { tex: 'd,\\ \\theta', text: 'the grating’s line spacing (1/N, for N lines per mm) and the angle of the first-order line: $d\\sin\\theta = \\lambda$' },
  ],
  why: t`Hydrogen’s lines are the yardstick of astronomy: their shifts give the speeds of stars and the redshifts of galaxies, and the Rydberg constant is measured today to 12 significant figures.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: Balmer lines through a grating',
    lead: t`Choose a line and take a reading: the telescope is set on it on both sides, and half the difference of the two vernier readings is its angle $\theta$. The lower plot shows $1/\lambda$ (vacuum) against $1/4 - 1/n^2$ with the weighted line; the readout gives $R_H$ as the slope and the intercept, which Bohr’s formula says is zero.`,
    tasks: [
      'Switch on “Use the label’s 600 lines/mm”: every wavelength scales by 0.5% and so does R — the line is still straight and through the origin, but the result is now about 3σ low.',
      'Switch off the air-to-vacuum conversion: R moves by 0.028%, a sixth of its σ. Worth doing, not worth worrying about here.',
      'Run the series a few times: the intercept scatters about zero, as it should.',
    ],
    params: { exp: 'rydberg', seed: 2, expected: true },
    caption: t`Simulated: a grating of 603.0 lines/mm (its label says 600), first order; each angle read to 1′ on each side, so $\sigma_\theta = 0.71'$ for the half-difference; wavelengths from Bohr’s levels with the reduced mass, shifted into air ($n_\text{air} = 1.000\,277$). Fine structure is below this resolution. Dashed green: the line $R_H$ predicts. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Calibration first: mercury’s green line (546.074 nm in air, NIST) appears at $\theta = ${thHg.toFixed(3)}^\circ$. Then the four Balmer lines (each angle good to $0.012^\circ$):

${colTable([['n', ...EX.R.map((q) => String(q.n))], [t`\theta\ (^\circ)`, ...EX.R.map((q) => q.th.toFixed(3))]])}

Find $R_H$ with its uncertainty and compare it with the CODATA-based $1.096\,776\times10^7\ \text{m}^{-1}$.`,
    visual: rigPlot('rydberg', { seed: 3, expected: true }, t`$1/\lambda$ against $1/4 - 1/n^2$ with ±1σ bars (too small to see), the weighted fit (gold) and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Calibrate', text: t`$N = \sin\theta_\text{Hg}/\lambda_\text{Hg} = \sin ${thHg.toFixed(3)}^\circ/(546.074\times10^{-6}\ \text{mm}) = ${Ncal.toFixed(1)}$ lines/mm — not the 600 on the label. Its σ, from the angle’s: $\cot\theta\,\sigma_\theta = ${(100 * relCal).toFixed(3)}\%$.` },
      { label: 'Wavelengths', text: t`$\lambda_\text{air} = \sin\theta/N$: ${lamAir.map((l, i) => t`$${l.toFixed(2)}$ nm ($n = ${EX.R[i].n}$)`).join(', ')}. Multiply by $n_\text{air} = 1.000\,277$ for vacuum, then invert.` },
      { label: 'Linearize', text: t`Against $x = 1/4 - 1/n^2$ $(${EX.R.map((q) => (0.25 - 1 / q.n ** 2).toFixed(4)).join(', ')})$, the points $1/\lambda$ should lie on a line through the origin of slope $R_H$. Each bar: $\sigma_{1/\lambda} = (1/\lambda)\cot\theta\,\sigma_\theta$ — largest relatively for the smallest angles.` },
      { label: 'Fit', text: t`Slope $${pmT(EX.fit.b, EX.fit.sb)}\ \mu\text{m}^{-1}$, intercept $${pmT(EX.fit.a, EX.fit.sa)}\ \mu\text{m}^{-1}$ (zero, as Bohr says), $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ ($\nu = 2$).` },
      { label: 'Uncertainty', text: t`$R_H = ${fmtR(EXR.value)}\ \text{m}^{-1}$ with the fit’s $${(100 * relS).toFixed(3)}\%$; the calibration’s $${(100 * relCal).toFixed(3)}\%$ scales every wavelength alike, so it adds in quadrature: $${(100 * relAll).toFixed(3)}\%$, $\sigma = ${tex(sAll, 2)}\ \text{m}^{-1}$.` },
      { label: 'Compare', text: t`$z = (${fmtR(EXR.value)} - ${fmtR(RH)})/${tex(sAll, 2)}$ $= ${zAll.toFixed(2)}$. $${(100 * relAll).toFixed(2)}\%$ with a vernier and a grating. Enough to see the reduced mass? $R_\infty$ is 0.054% bigger: about ${(0.054 / (100 * relAll)).toFixed(1)}σ — not quite.` },
    ],
    answer: t`$R_H = (${pmT(EXR.value / 1e7, sAll / 1e7)})\times10^7\ \text{m}^{-1}$, $${Math.abs(zAll).toFixed(1)}\sigma$ from the CODATA-based value.`,
  },
  practice: [
    num({
      id: 'grating', difficulty: 1,
      gen(r) {
        const N = r.pick([300, 600]), th = r.pick([11.5, 15.2, 17.0, 23.3]);
        const ans = (Math.sin(th * D2R) / N) * 1e6;
        return {
          prompt: t`A first-order line appears at $\theta = ${th}^\circ$ through a grating of $${N}$ lines per mm. What is its wavelength? Answer in nm.`,
          visual: rigRaw('rydberg', { seed: 1, settings: [3] }, 'The four Balmer lines as they appear through a 603-lines/mm grating (simulated); the gold bar is the telescope’s setting.'),
          answer: ans, units: 'nm', tol: { rel: 0.003 },
          errors: [{ value: ((th * D2R) / N) * 1e6, feedback: t`Use $\sin\theta$, not $\theta$ in radians: at these angles the difference is a few percent.` }, { value: Math.sin(th * D2R) * N, feedback: t`The spacing is $d = 1/N$: $\lambda = \sin\theta/N$.` }],
          hints: [t`$d = 1/N$ mm; first order: $\lambda = d\sin\theta$.`],
          teach: t`A grating’s first order sits where $d\sin\theta = \lambda$, with $d = 1/N$.`,
          explain: t`$\lambda = \sin ${th}^\circ/(${N}\ \text{mm}^{-1}) = ${tex(Math.sin(th * D2R) / N, 4)}$ mm $= ${ans.toFixed(1)}$ nm.`,
        };
      },
    }),
    num({
      id: 'calibrate', difficulty: 2,
      gen(r) {
        const Nt = r.pick([597.5, 601.2, 603.0, 604.4]);
        const th = +M.gratingTheta(HG, Nt).toFixed(3);
        const ans = Math.sin(th * D2R) / (HG * 1e-6);
        return {
          prompt: t`Mercury’s green line, 546.074 nm in air, appears at $\theta = ${th.toFixed(3)}^\circ$ in first order. How many lines per mm does the grating really have?`,
          visual: rigRaw('rydberg', { seed: 2, settings: [4] }, 'The spectrometer’s view (simulated): every line’s angle depends on the grating’s spacing, so the spacing must be known first.'),
          answer: ans, units: 'mm^-1', tol: { rel: 0.0005 },
          errors: [{ value: (HG * 1e-6) / Math.sin(th * D2R), feedback: t`That is the spacing $d$ in mm; the number of lines per mm is $1/d$.` }],
          hints: [t`$N = 1/d = \sin\theta/\lambda$.`, t`Put $\lambda$ in mm: $546.074\times10^{-6}$ mm.`],
          teach: 'Calibrate an instrument on a line whose wavelength is known: here, the grating’s true ruling.',
          explain: t`$N = \sin ${th.toFixed(3)}^\circ/(546.074\times10^{-6}\ \text{mm}) = ${ans.toFixed(1)}$ lines/mm. A label’s “600” is a nominal value; a 0.5% difference is ordinary.`,
        };
      },
    }),
    num({
      id: 'predict', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 5, 6, 7]);
        const ans = 1e9 / (RH * (0.25 - 1 / (n * n)));
        return {
          prompt: t`With $R_H = 1.096\,776\times10^7\ \text{m}^{-1}$, what vacuum wavelength does the Balmer line from $n = ${n}$ have? Answer in nm.`,
          visual: { type: 'qm-hydrogen', params: { series: 2, n, picture: 'none', controls: false, readout: false, hide: ['lambda', 'strip'] }, caption: 'Hydrogen’s levels to scale with the jump to level 2 highlighted (the spectrum strip hidden: it would give the answer).' },
          answer: ans, units: 'nm', tol: { rel: 0.001 },
          errors: [
            { value: 1e9 / (RH * (1 / 4 + 1 / (n * n))), feedback: t`It is a difference of the two levels’ terms, $1/4 - 1/n^2$, not a sum.` },
            { value: 1e9 / (RH * (1 - 1 / (n * n))), feedback: t`That is the Lyman series (down to level 1). Balmer lines end on level 2: $1/2^2 - 1/n^2$.` },
          ],
          hints: [t`$1/\lambda = R_H(1/4 - 1/n^2)$.`],
          teach: t`Each Balmer line has $1/\lambda = R_H(1/4 - 1/n^2)$: they crowd toward 364.6 nm as $n$ grows.`,
          explain: t`$1/\lambda = 1.096\,776\times10^7 \times (1/4 - 1/${n * n})$ $= ${tex(RH * (0.25 - 1 / (n * n)), 5)}\ \text{m}^{-1}$, so $\lambda = ${ans.toFixed(2)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'two-sides', difficulty: 2,
      prompt: t`For each line the telescope is set on its first order to the left and to the right, and $\theta$ is taken as half the difference of the two readings. Why bother?`,
      visual: rigRaw('rydberg', { seed: 3, settings: [5] }, 'One side of the spectrum, as seen (simulated).'),
      choices: [
        'The table’s zero — where the scale reads when the telescope looks straight through — is never exactly known; it cancels in the difference of the two sides',
        'Two readings average the random error, which is the only reason',
        'The two sides give different wavelengths, which must be averaged',
        'The right-hand order is brighter, so it is more accurate',
      ],
      answer: 0,
      why: {
        1: 'They do average random error too (σ falls by √2), but the main gain is that an unknown offset drops out entirely.',
        2: 'The two orders are symmetric: same wavelength, equal and opposite angles.',
        3: 'With the grating square to the beam, the two first orders are equally bright.',
      },
      hints: ['If the scale reads θ₀ when the telescope points straight through, what do the two sides read?'],
      teach: 'Measuring symmetric positions and halving the difference cancels a zero offset.',
      explain: t`The scale reads $\theta_0 + \theta$ on one side and $\theta_0 - \theta$ on the other: half the difference is $\theta$, with $\theta_0$ gone. (The same idea, a reversal, cancels the ambient field in the [$e/m$ experiment](#/lesson/lab.E.1).)`,
    }),
    mcq({
      id: 'nominal', difficulty: 3,
      prompt: t`A student skips the mercury calibration and uses the grating’s label, 600 lines/mm, though the true ruling is 603.0. What happens to $R_H$?`,
      visual: rigPlot('rydberg', { seed: 4, flags: { nominal: true }, expected: true }, t`The same angles analysed with 600 lines/mm: fit (gold) against the line $R_H$ predicts (dashed). ${SIMNOTE}`),
      choices: [
        t`Every wavelength comes out 0.5% too long, so $R_H$ is 0.5% too small — and the fit cannot tell: the line still goes through the origin`,
        t`$R_H$ comes out 0.5% too large`,
        'The intercept moves away from zero, flagging the mistake',
        'Nothing: the grating spacing cancels in the slope',
      ],
      answer: 0,
      why: {
        1: t`$\lambda = \sin\theta/N$: a smaller $N$ gives a longer $\lambda$, so $1/\lambda$ — and its slope — is smaller.`,
        2: 'Every 1/λ is scaled by the same factor: a line through the origin stays through the origin.',
        3: t`$d$ multiplies every wavelength; it scales the slope, it does not cancel.`,
      },
      hints: [t`$\lambda = d\sin\theta$ with $d = 1/N$. What does using 600 instead of 603 do to every λ?`, t`Every $1/\lambda$ is multiplied by $600/603$. What does that do to a line through the origin?`],
      teach: 'A scale error is invisible to the fit: only calibration against a known line catches it.',
      explain: t`$\lambda_\text{used} = \lambda \times 603.0/600 = 1.005\lambda$, so $R_H$ comes out $1/1.005$ of the truth: 0.5% low, about 3σ with this apparatus. The mercury line is the independent check.`,
    }),
    num({
      id: 'deuterium', difficulty: 3,
      gen(r) {
        const n = r.pick([3, 4]);
        const RD = K.Rinf / (1 + 1 / 3670.48296);
        const lH = 1e9 / (RH * (0.25 - 1 / (n * n))), lD = 1e9 / (RD * (0.25 - 1 / (n * n)));
        const ans = lH - lD;
        return {
          prompt: t`The reduced mass makes $R_H = R_\infty/(1 + m_e/m_p)$. Deuterium’s nucleus is about twice as heavy ($m_d = 3670.48\,m_e$), so its lines sit at slightly shorter wavelengths. By how much is deuterium’s ${n === 3 ? 'Hα' : 'Hβ'} line shifted from hydrogen’s? Use $R_\infty = 10\,973\,731.57\ \text{m}^{-1}$ and $m_p = 1836.15\,m_e$. Answer in nm.`,
          visual: { type: 'qm-hydrogen', params: { series: 2, n, picture: 'none', controls: false, readout: true }, caption: 'Hydrogen’s levels and Balmer lines. Deuterium’s are the same pattern, shrunk by about 0.03%.' },
          answer: ans, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: lH * (1 / 1836.15), feedback: t`The shift is set by the *difference* of the two reduced-mass factors, $m_e/m_p - m_e/m_d$, about half of $m_e/m_p$.` }],
          hints: [t`$R_D = R_\infty/(1 + m_e/m_d)$; $\lambda \propto 1/R$.`, t`$\Delta\lambda = \lambda_H(1 - R_H/R_D) \approx \lambda_H(m_e/m_p - m_e/m_d)$.`],
          teach: t`The nucleus’s recoil scales every line by $1 + m_e/M$: a heavier isotope shifts the lines to the blue.`,
          explain: t`$\lambda_H = ${lH.toFixed(3)}$ nm, $\lambda_D = ${lD.toFixed(3)}$ nm: a shift of $${ans.toFixed(3)}$ nm. Harold Urey found deuterium in 1931 by spotting exactly this faint companion line.`,
        };
      },
    }),
    mcq({
      id: 'intercept', difficulty: 2,
      prompt: t`Suppose the fit of $1/\lambda$ against $1/4 - 1/n^2$ had returned an intercept several σ from zero. Which would be the first thing to suspect?`,
      visual: rigPlot('rydberg', { seed: 5 }, t`A fit with its intercept free. ${SIMNOTE}`),
      choices: [
        'A misidentified line, or an angle read from a wrong zero on one side — something that does not scale all wavelengths alike',
        'That Bohr’s formula is wrong for hydrogen',
        'The grating’s spacing, which scales every wavelength',
        'The air-to-vacuum conversion',
      ],
      answer: 0,
      why: {
        1: 'Bohr’s formula is confirmed to parts in 10⁶ by far better spectroscopy; a lab-bench intercept is not evidence against it.',
        2: 'A spacing error multiplies every 1/λ by the same factor: it changes the slope and keeps the intercept at zero.',
        3: 'The conversion multiplies every λ by the same 1.000 277: again only the slope changes.',
      },
      hints: ['Which mistakes scale every point by one factor, and which shift points differently?'],
      teach: 'A scale error moves the slope; an intercept away from zero points to a mistake that is not a common scale factor.',
      explain: t`Scale errors (spacing, air index) pass through the origin. A non-zero intercept means points are displaced *differently*: a line assigned the wrong $n$ (the faint Hε, $n = 7$, taken for Hδ), or one angle read against a mis-set zero. Check the line identification first.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runR(seed);
        const v = +(A.results[0].value / 1e7).toFixed(5);
        const s = +(v * Math.hypot(A.results[0].sigma / A.results[0].value, relCal)).toFixed(5);
        const ans = (v - RH / 1e7) / s;
        return {
          prompt: t`A run gives $R_H = (${v.toFixed(5)} \pm ${s.toFixed(5)})\times10^7\ \text{m}^{-1}$. From CODATA, $R_H = 1.096\,776\times10^7\ \text{m}^{-1}$. Give $z$, with its sign.`,
          visual: rigPlot('rydberg', { seed, expected: true }, t`The run, with the line the CODATA-based $R_H$ predicts (dashed). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.06 },
          errors: [{ value: (v - K.Rinf / 1e7) / s, feedback: t`Compare with $R_H$, not $R_\infty$: hydrogen’s nucleus recoils, which lowers $R$ by the factor $1/(1 + m_e/m_p)$.` }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: [t`Subtract 1.096 776.`, t`$z = \Delta/\sigma$.`],
          teach: t`$z$ = difference over uncertainty, against the right reference ($R_H$, not $R_\infty$).`,
          explain: t`$z = (${v.toFixed(5)} - 1.09678)/${s.toFixed(5)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'cp-lyman', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runR(seed);
        const v = +(A.results[0].value / 1e7).toFixed(4);
        const ans = 1e9 / (v * 1e7 * 0.75);
        return {
          prompt: t`Using your measured $R_H = ${v.toFixed(4)}\times10^7\ \text{m}^{-1}$, predict the wavelength of Lyman-α, the jump from $n = 2$ to $n = 1$ — far in the ultraviolet, where no glass spectrometer can see it. Answer in nm.`,
          visual: { type: 'qm-hydrogen', params: { series: 1, n: 2, picture: 'none', controls: false, readout: false, hide: ['lambda', 'strip'] }, caption: 'The Lyman series: every jump ends on level 1 (spectrum strip hidden).' },
          answer: ans, units: 'nm', tol: { rel: 0.001 },
          errors: [{ value: 1e9 / (v * 1e7 * 0.25), feedback: t`Lyman ends on level 1: $1/1^2 - 1/2^2 = 3/4$.` }],
          hints: [t`$1/\lambda = R_H(1/1^2 - 1/2^2)$.`],
          teach: 'One measured constant predicts every line of every series.',
          explain: t`$\lambda = 1/(R_H \times 3/4) = ${ans.toFixed(2)}$ nm (the accepted value is 121.57 nm) — the line that dominates the ultraviolet sky and that telescopes use to find the most distant galaxies.`,
        };
      },
    }),
    num({
      id: 'cp-redshift', difficulty: 3, transfer: true,
      gen(r) {
        const lobs = r.pick([1.312, 1.968, 2.625, 3.281, 4.20]);
        const lrest = M.balmer(3).vac / 1000;
        const ans = lobs / lrest - 1;
        return {
          prompt: t`A space telescope’s infrared spectrograph finds a distant galaxy’s Hα line at $${lobs.toFixed(3)}\ \mu\text{m}$ (vacuum). Hα’s rest wavelength in vacuum is $${(lrest * 1000).toFixed(2)}$ nm. What is the galaxy’s redshift $z = \lambda_\text{obs}/\lambda_\text{rest} - 1$?`,
          visual: { type: 'qm-hydrogen', params: { series: 2, n: 3, picture: 'none', controls: false }, caption: 'Hα at rest: the n = 3 → 2 jump of hydrogen, 656.5 nm in vacuum. Cosmic expansion stretches it into the infrared.' },
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: lobs / lrest, feedback: t`That is $1 + z$: the redshift is the stretch factor minus one.` }, { value: (lobs - lrest) / lobs, feedback: t`Divide by the *rest* wavelength: $z = (\lambda_\text{obs} - \lambda_\text{rest})/\lambda_\text{rest}$.` }],
          hints: [t`Put both wavelengths in the same unit.`, t`$z = \lambda_\text{obs}/\lambda_\text{rest} - 1$.`],
          teach: t`Redshift is the fractional stretch of a known line: $1 + z = \lambda_\text{obs}/\lambda_\text{rest}$.`,
          explain: t`$z = ${lobs.toFixed(3)}/${lrest.toFixed(5)} - 1 = ${ans.toFixed(3)}$: the universe has expanded by a factor $${(1 + ans).toFixed(2)}$ since this light left the galaxy. The lab’s Balmer lines are the ruler that makes the measurement possible.`,
        };
      },
    }),
  ],
  sources: [
    SRC.codata,
    SRC.asd,
    { label: 'P. E. Ciddor, Refractive index of air: new equations for the visible and near infrared, Appl. Opt. 35, 1566 (1996)', url: 'https://doi.org/10.1364/AO.35.001566' },
    SRC.os3('6.4', '6-4-bohrs-model-of-the-hydrogen-atom'),
    { label: 'H. C. Urey, F. G. Brickwedde & G. M. Murphy, A hydrogen isotope of mass 2, Phys. Rev. 39, 164 (1932)', url: 'https://doi.org/10.1103/PhysRev.39.164' },
  ],
});
