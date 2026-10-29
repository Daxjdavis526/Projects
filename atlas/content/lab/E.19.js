// Single- and double-slit diffraction — the lab view: a He–Ne laser through a
// double slit, each bright fringe located by scanning a photodiode; fringe
// position against order is a straight line whose slope λL/d gives the
// wavelength once the slit spacing is known. The single slit's dark fringes
// give its width the same way. The analysis: the fit, a Type B budget that
// the spacing d dominates, a scale systematic (L measured to the wrong
// face), missing orders, the Fraunhofer condition, and the comparison with
// the NIST He–Ne line. A laser altimeter's footprint as the transfer. Every
// number is computed from the seeded model the labg-classics simulation
// draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, SIMNOTE, SRC } from './_classic.js';
import { budget } from './_unc.js';
import { dataGraph } from './_labf.js';

const t = String.raw;
const P2 = M.EXPERIMENTS.slit2.defaults, P1 = M.EXPERIMENTS.slit1.defaults;
const HENE = M.HENE;

// the worked example: seed 1
const EX = M.run('slit2', { seed: 1 });
const EXl = EX.results[0];
const sD = 0.002e-3, sL = 0.002;                       // Type B: d to ±2 μm, L to ±2 mm
const relS = EXl.sigma / EXl.value, relD = sD / P2.d, relL = sL / P2.L;
const relT = Math.hypot(relS, relD, relL);
const sTot = relT * EXl.value;
const zEX = (EXl.value - HENE) / sTot;
const run2 = (seed, flags = {}) => M.run('slit2', { seed, flags });
// the intercept question: a run (seed 8) read on a scale whose zero sits 0.31 mm off the pattern's centre
const IC = M.run('slit2', { seed: 8 }), OFF = 0.31;

export default lesson({
  id: 'lab.E.19',
  title: 'Single-slit and double-slit diffraction',
  minutes: 17, difficulty: 2,
  lab: true,
  intro: t`Thomas Young’s two slits (1803) made light’s wave nature visible: where the paths from the two slits differ by a whole number of wavelengths, the waves add, and bright fringes appear on a screen. For a small angle the $m$-th bright fringe sits at $x_m \approx m\lambda L/d$, so **fringe position against order is a straight line whose slope is $\lambda L/d$**. Each slit also has a width $a$, and its own diffraction pattern — dark where $a\sin\theta = n\lambda$ — is the envelope the fringes live under. Measure the slope, know $d$ and $L$, and you have measured a wavelength of light with a ruler.`,
  equation: t`x_m \approx \frac{\lambda L}{d}\,m`,
  symbols: [
    { tex: 'x_m', text: 'the position of the $m$-th bright fringe on the screen, measured from wherever the scale’s zero happens to be, in mm' },
    { tex: 'm', text: 'the fringe order: 0 at the centre, ±1, ±2 … outward (a whole number)' },
    { tex: '\\lambda', text: 'the light’s wavelength in air, in nm: the He–Ne laser line is 632.816 nm (NIST)' },
    { tex: 'L', text: 'the distance from the slits to the screen, in m' },
    { tex: 'd', text: 'the centre-to-centre spacing of the two slits, in mm — measured separately under a microscope' },
    { tex: 'a', text: 'the width of each slit, in mm: it sets the envelope, with zeros at $a\\sin\\theta = n\\lambda$' },
  ],
  why: t`The same arithmetic — angles from a known spacing — runs every spectrometer, X-ray crystallography and the electron-diffraction lesson to come; and the single slit’s $\lambda/a$ is the diffraction limit of every telescope.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: fringes from a double slit',
    lead: t`Pick a fringe order and take a reading: the photodiode finds that bright fringe’s centre, and the point joins the plot of $x$ against $m$. The upper panel shows the pattern with the single-slit envelope (dashed). The gold line is the weighted fit; the readout turns its slope into $\lambda$ using $d = 0.250$ mm and $L = 0.800$ m, and compares it with the NIST He–Ne line.`,
    tasks: [
      'Look at the pattern near x = ±12 mm: the fringes there are almost gone. That is where the single-slit envelope has its first zero.',
      'Switch on “L measured to the holder’s front face”: every point moves a little outward, the line still fits perfectly — and λ is now about 5σ high.',
      'Run the series again: λ changes by about its σ (2 nm) each time, while the 12 mm mistake in L stays put.',
    ],
    params: { exp: 'slit2', seed: 3, expected: true },
    caption: t`Simulated readings: slits $a = 0.040$ mm wide, $d = 0.250$ mm apart, $L = 0.800$ m, each fringe centre located with $\sigma = 0.06$ mm. Dashed green: the line the NIST wavelength predicts. Fraunhofer (far-field) pattern on a flat screen. ${SIMNOTE}`,
  },
  example: {
    prompt: t`With $d = 0.250 \pm 0.002$ mm (microscope) and $L = 0.800 \pm 0.002$ m (tape), you locate eleven bright fringes, each to $\sigma = 0.06$ mm:

${colTable([['m', ...EX.R.map((q) => String(q.m))], [t`x\ (\text{mm})`, ...EX.R.map((q) => q.x.toFixed(2))]])}

Find $\lambda$ with its full uncertainty and compare it with the NIST value, 632.816 nm.`,
    visual: rigPlot('slit2', { seed: 1, expected: true }, t`The eleven fringe positions against order, the weighted fit (gold) and the NIST line (dashed), with residuals below. ${SIMNOTE}`),
    steps: [
      { label: 'Linearize', text: t`$d\sin\theta_m = m\lambda$ and $x_m = L\tan\theta_m$. For these angles (under $0.8^\circ$) $\sin\theta \approx \tan\theta$ to one part in $10^4$, so $x_m = x_0 + (\lambda L/d)\,m$: slope $\lambda L/d$, and an intercept $x_0$ that is just where the scale’s zero sits.` },
      { label: 'Fit', text: t`Equal error bars, so the weighted and unweighted lines agree: slope $b = ${pmT(EX.fit.b, EX.fit.sb)}$ mm per order, intercept $${pmT(EX.fit.a, EX.fit.sa)}$ mm, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ ($\nu = 9$).` },
      { label: 'Wavelength', text: t`$\lambda = bd/L = ${EX.fit.b.toFixed(4)}\ \text{mm} \times 0.250\ \text{mm}/800\ \text{mm} = ${EXl.value.toFixed(1)}$ nm, with a statistical σ of $${EXl.sigma.toFixed(1)}$ nm ($${(100 * relS).toFixed(2)}\%$).` },
      { label: 'Type B', text: t`$\lambda = bd/L$ is a product, so relative uncertainties add in quadrature: $d$ gives $0.002/0.250 = ${(100 * relD).toFixed(1)}\%$ and $L$ gives $2/800 = ${(100 * relL).toFixed(2)}\%$. Combined: $\sqrt{${(100 * relS).toFixed(2)}^2 + ${(100 * relD).toFixed(1)}^2 + ${(100 * relL).toFixed(2)}^2} = ${(100 * relT).toFixed(2)}\%$, or $${sTot.toFixed(1)}$ nm. **The microscope reading of $d$ dominates**: more fringes would hardly help.` },
      { label: 'Compare', text: t`$z = (${EXl.value.toFixed(1)} - 632.8)/${sTot.toFixed(1)} = ${zEX.toFixed(2)}$: agreement. A 0.9% measurement of a wavelength with a tape measure and a microscope — and the fit’s own precision, 0.3%, is wasted until $d$ is known better.` },
    ],
    answer: t`$\lambda = ${pmT(EXl.value, sTot)}$ nm (statistical, slit spacing and distance combined), $${Math.abs(zEX).toFixed(1)}\sigma$ from 632.8 nm.`,
  },
  practice: [
    num({
      id: 'spacing', difficulty: 1,
      gen(r) {
        const d = r.pick([0.125, 0.25, 0.5]), L = r.pick([0.6, 0.8, 1.0, 1.2]);
        const ans = (HENE * 1e-6 * L * 1000) / d;
        return {
          prompt: t`A He–Ne laser ($\lambda = 632.8$ nm) lights two slits $${d}$ mm apart. On a screen $${L.toFixed(1)}$ m away, how far apart are neighbouring bright fringes? Answer in mm.`,
          visual: { type: 'optics-waves', params: { mode: 'slits', N: 2, a: 40, d: d * 1000, lambda: 633, L, controls: false, readout: false, phasors: false }, caption: 'The two-slit pattern on the screen and its intensity across it (computed from phasors; Fraunhofer limit).' },
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [
            { value: ans * 1000, feedback: 'Watch the units: put λ, L and d in metres before dividing, then convert the answer to mm.' },
            { value: (HENE * 1e-6 * d) / (L * 1000), feedback: t`Upside down: the spacing is $\lambda L/d$ — a longer throw spreads the fringes, a wider slit spacing squeezes them.` },
          ],
          hints: [t`The fringe spacing is $\Delta x = \lambda L/d$.`],
          teach: t`Neighbouring fringes are $\lambda L/d$ apart: longer $L$ spreads them, larger $d$ squeezes them.`,
          explain: t`$\Delta x = (632.8\times10^{-9})(${L.toFixed(1)})/(${tex(d * 1e-3, 3)}) = ${tex(ans * 1e-3, 3)}$ m $= ${ans.toFixed(2)}$ mm.`,
        };
      },
    }),
    num({
      id: 'lam-slope', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = run2(seed);
        const b = +A.fit.b.toFixed(4);
        const lam = (b * 1e-3 * P2.d) / P2.L * 1e9;
        return {
          prompt: t`A fit of fringe position against order gives a slope of $${b.toFixed(4)}$ mm per order, with $d = 0.250$ mm and $L = 0.800$ m. What wavelength does it give? Answer in nm.`,
          visual: rigPlot('slit2', { seed }, t`The run: fringe positions, the weighted fit and its residuals. ${SIMNOTE}`),
          answer: lam, units: 'nm', tol: { rel: 0.002 },
          errors: [
            { value: (b * 1e-3 * P2.L) / P2.d * 1e9, feedback: t`Solve $b = \lambda L/d$ for $\lambda$: $\lambda = bd/L$.` },
            { value: lam * 1000, feedback: 'Mind the units: put the slope, d and L all in metres before multiplying.' },
          ].filter((e) => Math.abs(e.value - lam) > 0.01 * lam),
          hints: [t`The slope is $b = \lambda L/d$.`, t`$\lambda = bd/L$, with everything in metres.`],
          teach: t`The slope of $x$ against $m$ is $\lambda L/d$; multiply by $d/L$ to get $\lambda$.`,
          explain: t`$\lambda = (${tex(b * 1e-3, 4)}\ \text{m})(2.50\times10^{-4}\ \text{m})/0.800\ \text{m} = ${lam.toFixed(1)}$ nm.`,
        };
      },
    }),
    mcq({
      id: 'missing', difficulty: 2,
      prompt: t`With $a = 0.040$ mm wide slits $d = 0.250$ mm apart, the bright fringes of order $m = \pm6$ are almost invisible, though $m = \pm5$ are clear. Why?`,
      visual: rigRaw('slit2', { seed: 2, settings: [5] }, t`The pattern (red) under the single-slit envelope (dashed). The gold line marks the fringe $m = 5$.`),
      choices: [
        t`They sit close to the first zero of each slit’s own diffraction pattern, at $x = \lambda L/a$, where $d/a = 6.25$ puts order 6`,
        'The laser beam is not wide enough to light the screen that far out',
        'Two-slit interference only produces five orders on each side',
        'The photodiode is less sensitive far from the centre',
      ],
      answer: 0,
      why: {
        1: 'The beam lights both slits; what reaches the screen is set by the slits’ diffraction, not by the beam’s width.',
        2: t`The interference term $\cos^2(\pi d\sin\theta/\lambda)$ has maxima at every order; it is the envelope that dims them.`,
        3: 'Nothing in the model makes the detector less sensitive off-centre; the intensity itself is near zero there.',
      },
      hints: [t`The pattern is $\cos^2$ (two-slit) times the single-slit envelope $\operatorname{sinc}^2(\pi a\sin\theta/\lambda)$.`, t`Where is the envelope’s first zero, in units of the fringe spacing?`],
      teach: t`Two-slit fringes are multiplied by each slit’s diffraction envelope; an order that lands on an envelope zero goes missing.`,
      explain: t`The envelope’s first zero is at $\sin\theta = \lambda/a$; fringe $m$ is at $\sin\theta = m\lambda/d$. They coincide at $m = d/a = 6.25$: fringe 6 is at 96% of the way to the zero, where the envelope has fallen to under 1% of its peak. Counting the fringes inside the central envelope measures $d/a$.`,
    }),
    num({
      id: 'width', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = M.run('slit1', { seed });
        const b = +A.fit.b.toFixed(3);
        const ans = (HENE * 1e-9 * P1.L) / (b * 1e-3) * 1e3;
        return {
          prompt: t`A single slit is lit by the He–Ne laser (632.8 nm) and the dark fringes are located on a screen $1.000$ m away. A fit of their positions against $n$ gives a slope of $${b.toFixed(3)}$ mm. How wide is the slit? Answer in mm.`,
          visual: rigPlot('slit1', { seed }, t`Dark-fringe positions against $n$ (no $n = 0$: the centre is bright), the fit and its residuals. ${SIMNOTE}`),
          answer: ans, units: 'mm', tol: { rel: 0.003 },
          errors: [
            { value: (b * 1e-3) / (HENE * 1e-9 * P1.L) / 1e3, feedback: t`Upside down: the slope is $\lambda L/a$, so $a = \lambda L/b$.` },
            { value: ans / 2, feedback: t`The first zero is at $a\sin\theta = \lambda$, not $2\lambda$: no factor of 2 belongs here.` },
          ],
          hints: [t`The dark fringes sit at $a\sin\theta = n\lambda$, so $x_n \approx n\lambda L/a$.`, t`$a = \lambda L/b$.`],
          teach: t`The single slit’s zeros are spaced $\lambda L/a$ apart: the narrower the slit, the wider its pattern.`,
          explain: t`$a = (632.8\times10^{-9})(1.000)/(${tex(b * 1e-3, 4)}) = ${tex(ans * 1e-3, 4)}$ m $= ${ans.toFixed(4)}$ mm (nominal: 0.080 mm).`,
        };
      },
    }),
    num({
      id: 'budget', difficulty: 3,
      gen(r) {
        const sd = r.pick([1, 2, 5]), sl = r.pick([1, 2, 5]), stat = r.pick([0.2, 0.3, 0.5]);
        const rd = (sd / 250) * 100, rl = (sl / 800) * 100;
        const ans = Math.hypot(stat, rd, rl);
        return {
          prompt: t`A fit gives $\lambda$ with a statistical relative uncertainty of $${stat}\%$. The slit spacing is $d = 250 \pm ${sd}\ \mu\text{m}$ and the distance $L = 800 \pm ${sl}$ mm. What is the combined relative uncertainty of $\lambda = bd/L$, in percent?`,
          visual: budget([{ label: 'statistical (the fit)', u: stat }, { label: `slit spacing d (±${sd} μm)`, u: rd }, { label: `distance L (±${sl} mm)`, u: rl }], { unit: '%', caption: 'The three relative uncertainties to scale, and their quadrature sum.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: stat + rd + rl, feedback: 'Independent uncertainties add in quadrature, not linearly.' },
            { value: Math.hypot(stat, sd / 250, sl / 800), feedback: 'Convert each to a percentage before combining them with the fit’s percentage.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`For a product or quotient, add the *relative* uncertainties in quadrature.`, t`$\sqrt{s^2 + (\sigma_d/d)^2 + (\sigma_L/L)^2}$, each in percent.`],
          teach: 'For λ = bd/L the relative uncertainties of b, d and L add in quadrature.',
          explain: t`$d$: $${sd}/250 = ${rd.toFixed(2)}\%$; $L$: $${sl}/800 = ${rl.toFixed(3)}\%$. Combined: $\sqrt{${stat}^2 + ${rd.toFixed(2)}^2 + ${rl.toFixed(3)}^2} = ${ans.toFixed(2)}\%$. The largest term dominates — improve that one first.`,
        };
      },
    }),
    mcq({
      id: 'Lref', difficulty: 3,
      prompt: t`The slits sit in a slide 12 mm behind the front of its holder, and $L$ was taped to the front face: 0.800 m written down, 0.812 m in truth. What does that do to the result?`,
      visual: rigPlot('slit2', { seed: 6, flags: { Lref: true }, expected: true }, t`Data taken with the true $L = 0.812$ m, against the line the NIST wavelength predicts for the $L$ written down (dashed). ${SIMNOTE}`),
      choices: [
        t`$\lambda = bd/L$ comes out 1.5% high, and the fit cannot reveal it: the line is still straight and $\chi^2$ is still fine`,
        t`The line bends, and the residuals show the mistake`,
        'It moves only the intercept, so the slope and λ are unaffected',
        t`$\lambda$ comes out 1.5% low`,
      ],
      answer: 0,
      why: {
        1: t`Every fringe moves outward by the same factor $0.812/0.800$: a straight line stays straight. A scale error cannot be seen in the residuals.`,
        2: t`An offset in where you measure $x$ from would only move the intercept; an error in $L$ scales every $x$, which changes the slope.`,
        3: t`The true $L$ is longer, so the fringes are wider apart than the written $L$ allows: $b$ is larger and $\lambda = bd/L_\text{written}$ comes out high.`,
      },
      hints: [t`The slope really is $\lambda L_\text{true}/d$; you divide by $L_\text{written}$.`, t`$L_\text{true}/L_\text{written} = 812/800$.`],
      teach: 'A scale error multiplies every point by the same factor: the fit stays perfect and the result is wrong. Only an independent check finds it.',
      explain: t`$\lambda_\text{reported} = \lambda\,L_\text{true}/L_\text{written} = 632.8 \times 1.015 = 642.3$ nm — about 5σ off with the fit’s σ alone. Only a check from outside the fit catches it: measuring to the slits themselves, or measuring a known wavelength first ([calibration and systematic error](#/lesson/lab.A7.1)).`,
    }),
    mcq({
      id: 'fraunhofer', difficulty: 3,
      prompt: t`The formulas assume the far field (Fraunhofer): the Fresnel number $N_F = a^2/(L\lambda)$ must be much less than 1. With the He–Ne laser, which set-up fails that test?`,
      visual: { type: 'optics-waves', params: { mode: 'slits', N: 1, a: 80, lambda: 633, L: 1, controls: false, readout: false, phasors: false }, caption: 'A single 0.080 mm slit seen 1 m away: a clean far-field pattern ($N_F = 0.01$). Fraunhofer limit as computed.' },
      choices: [
        'A 1.0 mm slit with the screen 0.5 m away',
        'A 0.080 mm slit with the screen 1.0 m away',
        'A 0.040 mm slit with the screen 0.5 m away',
        'A 0.20 mm slit with the screen 2.0 m away',
      ],
      answer: 0,
      why: {
        1: t`$N_F = (8\times10^{-5})^2/(1.0 \times 6.33\times10^{-7}) = 0.010$: comfortably far field.`,
        2: t`$N_F = (4\times10^{-5})^2/(0.5 \times 6.33\times10^{-7}) = 0.005$: far field.`,
        3: t`$N_F = (2\times10^{-4})^2/(2.0 \times 6.33\times10^{-7}) = 0.032$: still far field.`,
      },
      hints: [t`Compute $a^2/(L\lambda)$ for each, with everything in metres.`, t`$N_F \ll 1$ means the slit is small compared with the first Fresnel zone, $\sqrt{L\lambda}$ — about 0.6–1.1 mm here.`],
      teach: t`Fraunhofer’s formulas need $a^2 \ll L\lambda$; a wide slit close to the screen casts a Fresnel pattern instead.`,
      explain: t`For the 1 mm slit, $N_F = (10^{-3})^2/(0.5 \times 6.33\times10^{-7}) = 3.2$: a near-field (Fresnel) pattern, nothing like $\operatorname{sinc}^2$. A lens after the slit, focused on the screen, puts the far field at its focal plane and rescues the measurement.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = run2(seed);
        const l = +A.results[0].value.toFixed(1), rs = A.results[0].sigma / A.results[0].value;
        const s = +(l * Math.hypot(rs, relD, relL)).toFixed(1);
        const ans = (l - HENE) / s;
        return {
          prompt: t`A double-slit run gives $\lambda = ${l.toFixed(1)} \pm ${s.toFixed(1)}$ nm (fit, slit spacing and distance combined). How many standard uncertainties is it from the NIST value for the He–Ne line in air, 632.816 nm? Give $z$ with its sign.`,
          visual: rigPlot('slit2', { seed, expected: true }, t`The run behind this result, with the line the NIST wavelength predicts (dashed). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.06 },
          errors: [{ value: (100 * (l - HENE)) / HENE, feedback: 'That is the percentage difference. Divide the difference by σ instead.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['Subtract the NIST value from yours.', t`$z = (\lambda - \lambda_\text{NIST})/\sigma$.`],
          teach: t`Agreement means $|z| \lesssim 2$, with $z$ = difference ÷ combined uncertainty.`,
          explain: t`$z = (${l.toFixed(1)} - 632.8)/${s.toFixed(1)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-intercept', difficulty: 2,
      prompt: t`The fit of $x$ against $m$ returns an intercept of $${pmT(IC.fit.a + OFF, IC.fit.sa)}$ mm, far from zero. What should you conclude?`,
      visual: { type: 'graph', params: dataGraph({ xs: IC.R.map((q) => q.m), ys: IC.R.map((q) => q.x + OFF), sy: P2.sx, fit: { a: IC.fit.a + OFF, b: IC.fit.b }, xlabel: 'fringe order m', ylabel: 'x (mm)' }), caption: t`The run: fringe position against order, read on a scale whose zero sits off the pattern’s centre, with the fitted line. ${SIMNOTE}` },
      choices: [
        'Nothing is wrong: the scale’s zero is simply not at the centre of the pattern; the slope, and λ, do not care',
        'The wavelength is wrong by 0.31 mm per order and must be corrected',
        'The slits are unequal in width, which shifts every fringe',
        'The fit has failed and the data must be retaken',
      ],
      answer: 0,
      why: {
        1: 'The intercept is a length on the screen, not a slope: it does not enter λ = bd/L at all.',
        2: 'Unequal slit widths change the fringe visibility, not where the fringes are.',
        3: 'A straight line with a sensible χ² has not failed; an offset is exactly what the intercept is for.',
      },
      hints: ['Where did you put the zero of the ruler or the detector’s travel?'],
      teach: 'An intercept absorbs an offset in where you measure from, leaving the slope clean.',
      explain: t`$x_m = x_0 + (\lambda L/d)m$: $x_0$ is wherever the scale’s zero sits relative to the pattern’s centre. Only the slope carries $\lambda$ — the reason to fit a line rather than divide one fringe’s position by its order.`,
    }),
    num({
      id: 'cp-altimeter', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([0.05, 0.1, 0.15]), H = r.pick([300, 400, 500]);
        const lam = 1064e-9;
        const ans = 2 * H * 1e3 * (1.22 * lam) / D;
        return {
          prompt: t`A spacecraft’s laser altimeter (Nd:YAG, $\lambda = 1064$ nm) sends its beam out through an aperture $${(D * 100).toFixed(0)}$ cm across, from $${H}$ km above the surface. Diffraction spreads it at least to the Airy pattern of that aperture, whose first dark ring is at $\sin\theta = 1.22\lambda/D$. What is the smallest possible diameter of the spot (to the first dark ring) on the ground? Answer in m.`,
          visual: { type: 'optics-waves', params: { mode: 'airy', preset: 'custom', D, lambda: lam, single: true, controls: false, readout: false }, caption: 'The Airy pattern of a circular aperture: the circular cousin of the single slit, with 1.22λ/D in place of λ/a.' },
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: ans / 2, feedback: 'That is the radius: the spot extends 1.22λ/D on each side of the axis.' },
            { value: ans / 1.22, feedback: t`For a circular aperture the first zero is at $1.22\lambda/D$, not $\lambda/D$ as for a slit.` },
          ],
          hints: [t`Half-angle to the first dark ring: $\theta \approx 1.22\lambda/D$.`, t`Diameter on the ground $\approx 2H\theta$.`],
          teach: t`A beam from an aperture $D$ cannot spread less than about $1.22\lambda/D$: the single-slit result, in two dimensions.`,
          explain: t`$\theta = 1.22 \times 1.064\times10^{-6}/${D} = ${tex((1.22 * lam) / D, 3)}$ rad, so the spot is $2 \times ${H}\ \text{km} \times \theta = ${ans.toFixed(1)}$ m across. Real altimeter footprints are often much larger, because the beam is deliberately spread: diffraction is only the floor.`,
        };
      },
    }),
  ],
  sources: [
    SRC.os3('3.1–3.2', '3-2-youngs-double-slit-interference'),
    SRC.os3('4.1', '4-1-single-slit-diffraction'),
    SRC.asd,
    SRC.taylor('ch. 8 (least-squares fitting) and ch. 3 (propagation)'),
    SRC.usu,
  ],
});
