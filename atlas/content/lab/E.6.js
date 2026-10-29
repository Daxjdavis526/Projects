// Fabry–Pérot interferometry — the lab view: an air-spaced etalon's rings on
// the focal plane of a lens; r² against ring number is a straight line whose
// slope gives the gap (with λ and f known) and whose intercept gives the
// fraction of an order at the centre; radii measured from a misplaced centre
// as the systematic (curved residuals, a biased gap), cured by measuring
// diameters; the lens's focal length as a Type B term; free spectral range,
// finesse and resolving power, and the overlapping orders of a doublet.
// A LIGO arm cavity and a laser resonator as transfers. Every number is
// computed from the seeded model the labe-rig simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, table, SIMNOTE, SRC } from './_labe.js';
import { budget } from './_unc.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.fp.defaults;
const C = M.K.c;
const fin = (R) => (Math.PI * Math.sqrt(R)) / (1 - R);
const airy = (R) => `1/(1 + ${((4 * R) / (1 - R) ** 2).toFixed(4)}*sin(pi*x)^2)`;

// ── the worked example: ten rings, seed 5 ──
const EX = M.run('fp', { seed: 5 });
const EXd = EX.results[0], EXe = EX.results[1];
const relF = 2 * (0.5 / 200);                          // f = 200.0 ± 0.5 mm
const relD = Math.hypot(EXd.sigma / EXd.value, relF);
const ring1 = M.fpRing(P0, 1);

export default lesson({
  id: 'lab.E.6',
  title: 'Fabry–Pérot interferometry',
  minutes: 17, difficulty: 3,
  lab: true,
  intro: t`A Fabry–Pérot etalon is two flat, parallel, partly silvered mirrors a gap $d$ apart. Light bounces between them many times, and only where the round trip $2d\cos\theta$ is a whole number of wavelengths does it come through — so a lens behind it draws **sharp bright rings**, far sharper than a Michelson’s fringes. Near the axis, $\cos\theta \approx 1 - \theta^2/2$ makes the rings’ squared radii step evenly with ring number: a straight line whose slope gives $d$ and whose intercept gives how far the centre is from a bright order. The sharpness — the finesse — set by the mirrors’ reflectance makes it the tool for splitting close spectral lines.`,
  equation: t`r_p^2 = \frac{f^2\lambda}{d}\,(p - 1 + \varepsilon), \qquad \Delta\nu_\text{FSR} = \frac{c}{2d}, \qquad \mathcal F = \frac{\pi\sqrt R}{1 - R}`,
  symbols: [
    { tex: 'r_p', text: 'the radius of the $p$-th bright ring on the lens’s focal plane, in m' },
    { tex: 'p', text: 'the ring number, 1 for the innermost' },
    { tex: 'f', text: 'the focal length of the lens that images the rings, in m' },
    { tex: '\\lambda', text: 'the wavelength, in m (632.8 nm He–Ne here)' },
    { tex: 'd', text: 'the gap between the mirrors, in m (air between them)' },
    { tex: '\\varepsilon', text: 'the fractional part of the order at the centre, $2d/\\lambda$: 0 means a bright spot in the middle' },
    { tex: '\\Delta\\nu_\\text{FSR}', text: 'the free spectral range, in Hz: the frequency step between successive orders' },
    { tex: '\\mathcal F', text: 'the finesse: the FSR divided by a ring’s width (in frequency)' },
    { tex: 'R', text: 'each mirror’s reflectance (0.85 here)' },
  ],
  why: t`The same physics is every laser resonator and the 4 km arm cavities of LIGO; and an etalon is how fine structure, Zeeman splitting and laser modes are resolved in the lab.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: measuring ring radii',
    lead: t`Pick a ring and take a reading: above, the ring pattern with the radius you measured in gold; below, $r^2$ against ring number with the fit. The readout turns the slope into the gap $d$ and the intercept into the fraction of an order at the centre.`,
    tasks: [
      'Run the series: the gap comes out at 2.000 mm to a fraction of a per cent.',
      'Switch on “radii measured from a misplaced centre” (0.25 mm off): the gap jumps about 5%, the residuals curve, and χ²/ν rises. The marked centre in the picture moves.',
      'Switch it off again — measuring each ring’s diameter and halving it cancels the centre’s position completely.',
    ],
    params: { exp: 'fp', seed: 2, residuals: true, expected: true },
    caption: t`Simulated radii: exact ring positions for a $2.000$ mm air gap at 632.8 nm behind an $f = 200$ mm lens (illustrative), each radius measured with $\sigma = 0.03$ mm. The analysis uses the small-angle form, good to about 0.2% in $r^2$ at the tenth ring. Ring widths in the picture are not to scale. ${SIMNOTE}`,
  },
  example: {
    prompt: t`He–Ne light (632.8 nm) through an etalon; a lens of focal length $f = 200.0 \pm 0.5$ mm. Measured radii (diameters halved, $\sigma = 0.03$ mm):

${table([['p', ...EX.R.map((q) => String(q.p))], [t`r\ (\text{mm})`, ...EX.R.map((q) => q.r.toFixed(2))]])}

Find the gap $d$ with its uncertainty, the fraction of an order at the centre, and the free spectral range.`,
    visual: rigPlot('fp', { seed: 5 }, t`$r^2$ against ring number with the weighted fit and its residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Square', text: t`$r^2$ runs from $${(EX.R[0].r ** 2).toFixed(2)}$ to $${(EX.R[9].r ** 2).toFixed(1)}\ \text{mm}^2$; $\sigma_{r^2} = 2r\sigma_r$ grows outward, so the fit is weighted.` },
      { label: 'Fit', text: t`Slope $b = ${pmT(EX.fit.b, EX.fit.sb)}\ \text{mm}^2$ per ring, intercept $a = ${pmT(EX.fit.a, EX.fit.sa)}\ \text{mm}^2$, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$.` },
      { label: 'Gap', text: t`$b = f^2\lambda/d$, so $d = f^2\lambda/b = (200\ \text{mm})^2(632.8\times10^{-6}\ \text{mm})/${EX.fit.b.toFixed(3)} = ${EXd.value.toFixed(4)}$ mm, with $\pm ${EXd.sigma.toFixed(4)}$ mm from the fit.` },
      { label: 'The lens', text: t`$d \propto f^2$, so $\pm 0.5$ mm on 200 mm adds $2 \times 0.25\% = 0.5\%$: in quadrature with the fit’s $${(100 * EXd.sigma / EXd.value).toFixed(2)}\%$, $${(100 * relD).toFixed(2)}\%$, so $d = ${EXd.value.toFixed(3)} \pm ${(relD * EXd.value).toFixed(3)}$ mm. The lens, not the rings, limits it — a second known wavelength would remove $f$ altogether.` },
      { label: 'Centre', text: t`$\varepsilon = 1 + a/b = ${resT(EXe)}$: the centre sits that fraction of an order past the last bright order. From the gap itself, $2d/\lambda = ${ring1.mc.toFixed(2)}$ — ${Math.floor(ring1.mc)} whole orders and $${ring1.eps.toFixed(3)}$ over.` },
      { label: 'Free spectral range', text: t`$\Delta\nu = c/2d = ${(C / (2 * EXd.value * 1e-3) / 1e9).toFixed(1)}$ GHz, or in wavelength $\lambda^2/2d = ${((632.8e-9) ** 2 / (2 * EXd.value * 1e-3) * 1e12).toFixed(1)}$ pm: two lines further apart than that land in different orders and their rings interleave.` },
      { label: 'Sense check', text: t`With $R = 0.85$ the finesse is $${fin(0.85).toFixed(1)}$: each ring is about $1/${fin(0.85).toFixed(0)}$ of the spacing between rings wide, and lines $${((632.8e-9) ** 2 / (2 * EXd.value * 1e-3) / fin(0.85) * 1e12).toFixed(1)}$ pm apart can be told apart — a resolving power near $${tex(ring1.mc * fin(0.85), 2)}$.` },
    ],
    answer: t`$d = ${EXd.value.toFixed(3)} \pm ${(relD * EXd.value).toFixed(3)}$ mm (fit and lens combined); $\varepsilon = ${resT(EXe)}$; FSR $= ${(C / (2 * EXd.value * 1e-3) / 1e9).toFixed(1)}$ GHz.`,
  },
  practice: [
    num({
      id: 'order', difficulty: 1,
      gen(r) {
        const d = r.pick([1.000, 2.000, 3.000, 5.000]), lam = r.pick([632.8, 543.5, 589.0]);
        const ans = (2 * d * 1e-3) / (lam * 1e-9);
        return {
          prompt: t`An air-spaced etalon has a gap of $${d.toFixed(3)}$ mm. What is the interference order $m = 2d/\lambda$ at the centre of the pattern for light of $${lam}$ nm?`,
          visual: rigRaw('fp', { seed: r.int(1, 999), settings: [1] }, 'A ring pattern (for a 2.000 mm gap at 632.8 nm): each bright ring is one order lower than the one inside it.'),
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: ans / 2, feedback: t`The round trip is $2d$: $m = 2d/\lambda$.` }],
          hints: [t`$m = 2d/\lambda$ with both in metres.`],
          teach: 'An etalon works at enormous order: thousands of wavelengths fit in the round trip.',
          explain: t`$m = 2(${tex(d * 1e-3, 4)})/(${tex(lam * 1e-9, 4)}) = ${ans.toFixed(1)}$. Rings count down from there: the innermost has the highest whole order.`,
        };
      },
    }),
    num({
      id: 'fsr', difficulty: 2,
      gen(r) {
        const d = r.pick([0.5, 1, 2, 3, 5]);
        const ans = C / (2 * d * 1e-3) / 1e9;
        return {
          prompt: t`What is the free spectral range of an air-spaced etalon with a $${d}$ mm gap? Answer in GHz.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [0, 1.1], xlabel: 'frequency (in units of the FSR)', ylabel: 'transmission', axesAt: 'edge', curves: [{ fn: airy(0.85), color: 'accent', samples: 3000 }] }, caption: 'Transmission against frequency for R = 0.85: a comb of peaks one free spectral range apart.' },
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: C / (d * 1e-3) / 1e9, feedback: t`The round trip is $2d$: $\Delta\nu = c/2d$.` }],
          hints: [t`Successive orders differ by one wavelength of round trip, $2d$.`, t`$\Delta\nu = c/(2d)$.`],
          teach: t`The free spectral range $c/2d$ is the frequency step between orders — the widest span an etalon can measure without ambiguity.`,
          explain: t`$\Delta\nu = 2.998\times10^8/(2 \times ${tex(d * 1e-3, 2)}) = ${ans.toFixed(1)}$ GHz.`,
        };
      },
    }),
    num({
      id: 'finesse', difficulty: 2,
      gen(r) {
        const R = r.pick([0.80, 0.85, 0.90, 0.95]);
        const ans = fin(R);
        return {
          prompt: t`Each mirror of an etalon reflects $${Math.round(R * 100)}\%$. What is its finesse $\mathcal F = \pi\sqrt R/(1 - R)$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 2], y: [0, 1.1], xlabel: 'round-trip phase (in orders)', ylabel: 'transmission', axesAt: 'edge', curves: [{ fn: airy(R), color: 'accent', samples: 3000 }, { fn: airy(0.4), color: 'ink3', dash: true, samples: 1500 }] }, caption: `Transmission for R = ${R} (solid) and, for comparison, R = 0.4 (dashed): higher reflectance, sharper peaks.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (Math.PI * R) / (1 - R), feedback: t`The numerator has $\sqrt R$, not $R$.` }, { value: Math.PI / (1 - R), feedback: t`Keep the $\sqrt R$ in the numerator.` }].filter((x) => Math.abs(x.value - ans) > 0.006 * ans),
          hints: [t`$\mathcal F = \pi\sqrt R/(1 - R)$.`],
          teach: 'Finesse grows steeply as the mirrors approach perfect reflection: it is the number of resolvable lines per free spectral range.',
          explain: t`$\mathcal F = \pi\sqrt{${R}}/${(1 - R).toFixed(2)} = ${ans.toFixed(1)}$. Real etalons fall short of it: mirror flatness and alignment add their own “finesse” in series.`,
        };
      },
    }),
    num({
      id: 'gap', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('fp', { seed });
        const b = +A.fit.b.toFixed(3);
        const ans = (200 ** 2 * 632.8e-6) / b;
        return {
          prompt: t`A fit of $r^2$ (mm²) against ring number gives a slope of $${b.toFixed(3)}\ \text{mm}^2$ per ring, with $f = 200$ mm and $\lambda = 632.8$ nm. What is the gap $d$? Answer in mm.`,
          visual: rigPlot('fp', { seed }, t`The ring data and fit. ${SIMNOTE}`),
          answer: ans, units: 'mm', tol: { rel: 0.002 },
          errors: [{ value: (200 * 632.8e-6) / b, feedback: t`The focal length is squared: $r = f\theta$, so $r^2 = f^2\theta^2$.` }, { value: b / (200 ** 2 * 632.8e-6), feedback: t`Invert: $b = f^2\lambda/d$, so $d = f^2\lambda/b$.` }],
          hints: [t`$r_p^2 = (f^2\lambda/d)(p - 1 + \varepsilon)$: the slope is $f^2\lambda/d$.`, t`Work in mm: $\lambda = 632.8\times10^{-6}$ mm.`],
          teach: t`The slope of $r^2$ against ring number is $f^2\lambda/d$.`,
          explain: t`$d = 200^2 \times 632.8\times10^{-6}/${b.toFixed(3)} = ${ans.toFixed(4)}$ mm.`,
        };
      },
    }),
    mcq({
      id: 'diameter', difficulty: 3,
      prompt: 'Why measure each ring’s diameter and halve it, rather than its radius from the centre?',
      visual: rigRaw('fp', { seed: 3, settings: [1, 2, 3, 4, 5, 6], flags: { centre: true } }, 'Radii measured from a centre marked 0.25 mm off (the cross); the gold line is one such radius.'),
      choices: [
        'The centre’s true position is uncertain; a radius from a misplaced centre is wrong by the offset on one side, but the two sides’ errors cancel in a diameter',
        'A diameter is twice as long, so its relative uncertainty is halved, and that is the only reason',
        'Rings are not circular, and a diameter averages the ellipse',
        'Radii cannot be measured at all on a camera image',
      ],
      answer: 0,
      why: {
        1: 'That helps a little, but the bigger reason is a bias: a misplaced centre shifts every radius, and that shift does not average away.',
        2: 'A well-aligned etalon gives circles; ellipticity is a separate issue.',
        3: 'They can — the trouble is only knowing where the centre is.',
      },
      hints: ['Move the centre right by δ. What happens to the radius measured to the right, and to the left?', 'r(right) = r − δ, r(left) = r + δ.'],
      teach: 'A measurement taken symmetrically about an uncertain reference cancels the reference’s error.',
      explain: t`From a centre misplaced by $\delta$ toward the right, the right edge is $r - \delta$ away and the left $r + \delta$: half their sum is exactly $r$. One-sided radii give $r^2 - 2r\delta + \delta^2$, which bends the plot and biases the slope — the same reversal idea as field reversal in $e/m$.`,
    }),
    num({
      id: 'resolve', difficulty: 3,
      gen(r) {
        const d = r.pick([1, 2, 3, 5]), R = r.pick([0.85, 0.90, 0.95]), lam = 643.8;
        const ans = ((lam * 1e-9) ** 2 / (2 * d * 1e-3) / fin(R)) * 1e12;
        return {
          prompt: t`An etalon with a $${d}$ mm air gap and $${Math.round(R * 100)}\%$ mirrors views cadmium’s red line at 643.8 nm. What is the smallest wavelength difference it can resolve, about the free spectral range in wavelength divided by the finesse? Answer in pm.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 2], y: [0, 1.4], xlabel: 'round-trip phase (in orders)', ylabel: 'transmission', axesAt: 'edge', curves: [{ fn: `${airy(R)} + ${airy(R).replace(/x/g, `(x - ${(1 / fin(R)).toFixed(4)})`)}`, color: 'accent', samples: 3000 }] }, caption: 'Two equally bright lines one ring-width apart, summed: just resolved (the Taylor criterion).' },
          answer: ans, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: ans * fin(R), feedback: t`That is the whole free spectral range, $\lambda^2/2d$. Divide by the finesse.` }],
          hints: [t`In wavelength, the FSR is $\lambda^2/(2d)$.`, t`$\delta\lambda \approx \lambda^2/(2d\,\mathcal F)$ with $\mathcal F = \pi\sqrt R/(1 - R)$.`],
          teach: 'An etalon resolves about one free spectral range divided by the finesse.',
          explain: t`FSR $= (643.8\ \text{nm})^2/(2 \times ${d}\ \text{mm}) = ${(((lam * 1e-9) ** 2 / (2 * d * 1e-3)) * 1e12).toFixed(1)}$ pm and $\mathcal F = ${fin(R).toFixed(1)}$, so $\delta\lambda = ${ans.toFixed(2)}$ pm — a resolving power $\lambda/\delta\lambda \approx ${tex((lam * 1e3) / ans, 2)}$, far beyond a grating spectrometer’s. The Zeeman effect splits this line by about 20 pm per tesla.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-budget', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('fp', { seed });
        const relFit = A.results[0].sigma / A.results[0].value;
        const sf = r.pick([0.5, 1.0, 2.0]);
        const ans = 100 * Math.hypot(relFit, 2 * sf / 200);
        return {
          prompt: t`A ring fit gives the gap with a relative uncertainty of $${(100 * relFit).toFixed(2)}\%$. The lens’s focal length is $200$ mm with a standard uncertainty of $${sf}$ mm. What is the combined relative uncertainty of $d$, in per cent?`,
          visual: budget([{ label: 'ring fit', u: 100 * relFit }, { label: `focal length (±${sf} mm)`, u: 100 * 2 * sf / 200 }], { unit: '%', caption: 'The two contributions and their quadrature sum, to scale.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * Math.hypot(relFit, sf / 200), feedback: t`$d = f^2\lambda/b$: the focal length enters squared, so its relative uncertainty counts twice.` }, { value: 100 * (relFit + 2 * sf / 200), feedback: 'Independent contributions add in quadrature.' }],
          hints: [t`$d \propto f^2$: the lens contributes $2\sigma_f/f$.`, 'Combine in quadrature with the fit’s part.'],
          teach: 'A Type B input raised to a power can dominate a budget — here the lens outweighs a dozen rings.',
          explain: t`$2 \times ${sf}/200 = ${(100 * 2 * sf / 200).toFixed(2)}\%$; $\sqrt{${(100 * relFit).toFixed(2)}^2 + ${(100 * 2 * sf / 200).toFixed(2)}^2} = ${ans.toFixed(2)}\%$.`,
        };
      },
    }),
    mcq({
      id: 'cp-bow', difficulty: 3,
      prompt: t`A student’s $r^2$ plot has residuals that smile (positive at both ends, negative in the middle), $\chi^2/\nu \approx 3$, and a gap about 5% off the spacer’s specification. What is the most likely cause?`,
      visual: rigPlot('fp', { seed: 4, flags: { centre: true }, expected: true }, t`The plot in question: fit (gold), the expected line (dashed) and the residuals. ${SIMNOTE}`),
      choices: [
        'Radii measured on one side from a misplaced centre: r − δ squared adds a term −2rδ that grows as √p, bending the line',
        'The small-angle approximation failing at the outer rings',
        'Random errors in the radii, underestimated by a factor of √3',
        'The wrong wavelength used in the analysis',
      ],
      answer: 0,
      why: {
        1: 'Here it is good to about 0.2% in r² at the tenth ring — far too small for a 5% shift.',
        2: 'Underestimated random errors raise χ² but leave no smooth pattern, and do not shift the slope by 5%.',
        3: 'A wrong λ scales d but leaves the plot perfectly straight.',
      },
      hints: ['A smooth pattern in the residuals points at a wrong model, not noise.', t`Expand $(r - \delta)^2$ and remember $r \propto \sqrt{p - 1 + \varepsilon}$.`],
      teach: 'A systematic that depends on the reading’s own size leaves a curve in the residuals; one that is proportional to it does not.',
      explain: t`$(r - \delta)^2 = r^2 - 2r\delta + \delta^2$, and $r \propto \sqrt{p - 1 + \varepsilon}$: the extra term is curved (convex) in $p$, so a line through it leaves a smile and its slope is biased. Measuring diameters removes it.`,
    }),
    num({
      id: 'cp-ligo', difficulty: 2, transfer: true,
      gen(r) {
        const which = r.pick([['a LIGO arm cavity', 3995], ['a 30 cm He–Ne laser tube', 0.30], ['a 1.5 m laser gyroscope leg', 1.5]]);
        const ans = C / (2 * which[1]);
        const unit = ans > 1e6 ? 'MHz' : 'kHz';
        return {
          prompt: t`What is the free spectral range — the spacing of the resonant frequencies — of ${which[0]}, a Fabry–Pérot cavity with mirrors $${which[1]}$ m apart? Answer in ${unit}.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 4], y: [0, 1.1], xlabel: 'frequency (in units of the FSR)', ylabel: 'transmission', axesAt: 'edge', curves: [{ fn: airy(0.98), color: 'accent', samples: 4000 }] }, caption: 'A high-finesse cavity’s comb of resonances (R = 0.98, drawn in units of the FSR).' },
          answer: unit === 'MHz' ? ans / 1e6 : ans / 1e3, units: unit, tol: { rel: 0.005 },
          errors: [{ value: (unit === 'MHz' ? ans / 1e6 : ans / 1e3) * 2, feedback: t`Light makes a round trip, $2L$: $\Delta\nu = c/2L$.` }],
          hints: [t`$\Delta\nu = c/(2L)$.`],
          teach: 'Every optical cavity is a Fabry–Pérot: its resonances are spaced by c/2L.',
          explain: t`$\Delta\nu = 2.998\times10^8/(2 \times ${which[1]}) = ${unit === 'MHz' ? (ans / 1e6).toFixed(0) : (ans / 1e3).toFixed(1)}$ ${unit}. A laser’s longitudinal modes are exactly this comb; LIGO holds its 1064 nm light on one resonance of each arm, so the stored light makes hundreds of round trips.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'LIGO Scientific Collaboration, Advanced LIGO, Classical and Quantum Gravity 32, 074001 (2015)', url: 'https://doi.org/10.1088/0264-9381/32/7/074001' },
    SRC.usu,
    SRC.taylor('ch. 8'),
  ],
});
