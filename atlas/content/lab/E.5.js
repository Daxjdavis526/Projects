// Michelson interferometry — the lab view: fringes counted as a micrometer
// drives one mirror through a lever; N against mirror travel, whose slope is
// 2/λ; the lever ratio as a scale-factor systematic that no fit can see,
// removed by calibrating with a He–Ne laser before measuring sodium; counting
// statistics (±1 fringe) and how far to move for a target precision; a gas
// cell's refractive index; the sodium doublet's beats in fringe visibility.
// Michelson–Morley's expected shift and a LIGO arm as transfers. Every number
// is computed from the seeded model the labe-rig simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, table, SIMNOTE, SRC } from './_labe.js';

const t = String.raw;
const HENE = 632.8, NA = M.NA_D;          // nm (air)
const D1 = 589.592, D2 = 588.995;

// ── the worked example: calibrate with He–Ne (seed 3), then sodium (seed 105), lever error present in both ──
const CAL = M.run('michelson', { seed: 3 });
const NAR = M.run('michelson', { seed: 105, params: { source: 'na' } });
const lamH = CAL.results[0], lamN = NAR.results[0];
const corr = HENE / lamH.value;
const lamNa = lamN.value * corr;
const relNa = Math.hypot(lamH.sigma / lamH.value, lamN.sigma / lamN.value);

export default lesson({
  id: 'lab.E.5',
  title: 'Michelson interferometry',
  minutes: 17, difficulty: 3,
  lab: true,
  intro: t`A Michelson interferometer splits a beam in two, sends the halves to two mirrors and recombines them. Move one mirror by $d$ and its beam’s path changes by $2d$; every wavelength of path change sweeps one bright fringe past the detector. **Counting fringes turns a length into a number of wavelengths** — the trick Michelson used to measure the metre in light, that Michelson and Morley used to look for the ether, and that LIGO uses to catch gravitational waves. In the lab a micrometer drives the mirror through a lever, so the mirror’s travel is only as good as the lever’s ratio — a scale-factor systematic no fit can see.`,
  equation: t`N = \frac{2d}{\lambda}, \qquad d = \frac{\Delta m}{R}`,
  symbols: [
    { tex: 'N', text: 'the number of fringes counted — a whole number, uncertain by about one' },
    { tex: 'd', text: 'how far the mirror moved, in m' },
    { tex: '\\lambda', text: 'the light’s wavelength in air, in m: 632.8 nm for a He–Ne laser; 589.0 and 589.6 nm for the sodium D lines' },
    { tex: '\\Delta m', text: 'the travel read on the micrometer’s dial, in m' },
    { tex: 'R', text: 'the lever’s reduction ratio (nominally 5 here): the mirror moves $1/R$ as far as the screw' },
  ],
  why: t`Calibrating against a known standard is how a scale error is found at all — a fit to self-consistent data cannot tell a 2% long ruler from a 2% long wavelength.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: counting fringes against mirror travel',
    lead: t`Set the micrometer travel and take a reading: above, the detector’s brightness as the mirror moves, with the fringe count; below, the count against the mirror travel the dial implies, fitted. The readout turns the slope into a wavelength.`,
    tasks: [
      'With the He–Ne laser, the wavelength comes out near 645 nm, four σ above 632.8 — though χ²/ν is fine.',
      'Switch off the lever error: the He–Ne wavelength now agrees. The fit could not tell the two cases apart; only the known wavelength could.',
      'Turn the lever error back on and switch to the sodium lamp: it reads about 2% high too, by the same factor. Divide by the factor the He–Ne run found.',
    ],
    params: { exp: 'michelson', seed: 2, residuals: true, expected: true },
    caption: t`Simulated counts: the mirror moves the dial travel ÷ 5.10 (a lever 2% off its nominal 5, when switched on), and each count is the true $2d/\lambda$ plus a Gaussian error of 0.4 fringe, rounded to a whole number. Dashed green: the line the true wavelength gives with a perfect lever. ${SIMNOTE}`,
  },
  example: {
    prompt: t`First you calibrate with a He–Ne laser (632.8 nm); then, without touching the micrometer or lever, you swap in a sodium lamp. Counts at the same eight dial settings:

${table([[t`\Delta m\ (\mu\text{m})`, ...CAL.R.map((q) => String(q.dm))], [t`N\ (\text{He–Ne})`, ...CAL.R.map((q) => String(q.N))], [t`N\ (\text{Na})`, ...NAR.R.map((q) => String(q.N))]])}

Each count is good to $\pm 0.5$ (one σ). The lever’s nominal ratio is 5. Find sodium’s mean D-line wavelength.`,
    visual: rigPlot('michelson', { seed: 105, params: { source: 'na' }, expected: true }, t`The sodium counts against mirror travel from the nominal lever ratio, with the fit (gold) and the line the true 589.3 nm predicts (dashed). ${SIMNOTE}`),
    steps: [
      { label: 'Mirror travel', text: t`With the nominal ratio, $d = \Delta m/5$: 5, 10, … 40 μm. The fits use $d$ in μm and give slopes in fringes per μm.` },
      { label: 'He–Ne slope', text: t`The He–Ne counts fit a slope $${pmT(CAL.fit.b, CAL.fit.sb)}$ per μm, so $\lambda = 2/b = ${resT(lamH)}$ nm — $${lamH.z.toFixed(1)}\sigma$ above 632.8 nm, with $\chi^2/\nu = ${CAL.fit.chi2r.toFixed(2)}$. Nothing in the fit looks wrong.` },
      { label: 'Diagnose', text: t`The laser’s wavelength is known far better than this, so the mirror must have moved less than the dial says: every $d$ is too big by the factor $${(lamH.value / HENE).toFixed(4)}$. That is a lever ratio near $5 \times ${(lamH.value / HENE).toFixed(4)} = ${(5 * lamH.value / HENE).toFixed(2)}$.` },
      { label: 'Sodium', text: t`The sodium counts give $\lambda_\text{apparent} = ${resT(lamN)}$ nm, inflated by the same lever.` },
      { label: 'Correct', text: t`Multiply by $632.8/${lamH.value.toFixed(2)}$: $\lambda_\text{Na} = ${lamN.value.toFixed(2)} \times ${corr.toFixed(4)} = ${lamNa.toFixed(1)}$ nm. Relative uncertainties of a ratio add in quadrature: $\sqrt{${(100 * lamH.sigma / lamH.value).toFixed(2)}^2 + ${(100 * lamN.sigma / lamN.value).toFixed(2)}^2} = ${(100 * relNa).toFixed(2)}\%$, so $\pm ${(relNa * lamNa).toFixed(1)}$ nm.` },
      { label: 'Compare', text: t`The D lines at 588.995 and 589.592 nm average $${NA.toFixed(1)}$ nm: $z = ${((lamNa - NA) / (relNa * lamNa)).toFixed(2)}$. The two lines’ fringes beat, so their contrast fades every 0.29 mm of mirror travel; 40 μm is safely inside the first fade.` },
    ],
    answer: t`$\lambda_\text{Na} = ${lamNa.toFixed(1)} \pm ${(relNa * lamNa).toFixed(1)}$ nm after calibrating the lever with He–Ne (uncalibrated: $${resT(lamN)}$ nm).`,
  },
  practice: [
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const dm = r.pick([40, 60, 80, 120, 150, 180]), src = r.pick(['hene', 'na']);
        const lam = src === 'na' ? NA : HENE;
        const d = dm / 5, ans = (2000 * d) / lam;
        return {
          prompt: t`The mirror moves $${d}\ \mu\text{m}$ in ${src === 'na' ? 'sodium light (mean 589.3 nm)' : 'He–Ne light (632.8 nm)'}. How many fringes pass the detector?`,
          visual: rigRaw('michelson', { seed: r.int(1, 999), settings: [dm], params: { source: src }, flags: { lever: false } }, 'The detector’s brightness over the last few micrometres of travel: one cycle per fringe.'),
          answer: ans, tol: { rel: 0, abs: 0.6 },
          errors: [{ value: (1000 * d) / lam, feedback: t`The light goes to the mirror and back: moving it by $d$ changes the path by $2d$.` }],
          hints: [t`The path changes by twice the mirror’s travel.`, t`$N = 2d/\lambda$ — put both in the same unit.`],
          teach: 'One fringe for every half-wavelength the mirror moves.',
          explain: t`$N = 2 \times ${d}\,000\ \text{nm}/${lam.toFixed(1)}\ \text{nm} = ${ans.toFixed(1)}$ — about ${Math.round(ans)} fringes to count.`,
        };
      },
    }),
    num({
      id: 'slope', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('michelson', { seed, flags: { lever: false } });
        const b = +A.fit.b.toFixed(4);
        const ans = 2000 / b;
        return {
          prompt: t`A fit of fringe count against mirror travel (in μm) has slope $${b.toFixed(4)}$ fringes per μm. What wavelength does it give? Answer in nm.`,
          visual: rigPlot('michelson', { seed, flags: { lever: false } }, t`The counts and fit. ${SIMNOTE}`),
          answer: ans, units: 'nm', tol: { rel: 0.002 },
          errors: [{ value: 1000 / b, feedback: t`$N = 2d/\lambda$, so the slope is $2/\lambda$ and $\lambda = 2/\text{slope}$.` }, { value: b, feedback: t`Invert: $\lambda = 2/b$.` }],
          hints: [t`The slope of $N$ against $d$ is $2/\lambda$.`, t`$\lambda = 2/b$ μm $= 2000/b$ nm.`],
          teach: t`The slope of fringes against travel is $2/\lambda$.`,
          explain: t`$\lambda = 2/${b.toFixed(4)}\ \mu\text{m} = ${ans.toFixed(1)}$ nm.`,
        };
      },
    }),
    num({
      id: 'calibrate', difficulty: 3,
      gen(r) {
        const s1 = r.int(1, 99999), s2 = r.int(1, 99999);
        const A = M.run('michelson', { seed: s1 }), B = M.run('michelson', { seed: s2, params: { source: 'na' } });
        const lh = +A.results[0].value.toFixed(1), ln = +B.results[0].value.toFixed(1);
        const ans = (ln * HENE) / lh;
        return {
          prompt: t`With the same micrometer and lever, a He–Ne laser (632.8 nm) gives an apparent wavelength of $${lh.toFixed(1)}$ nm, and a sodium lamp $${ln.toFixed(1)}$ nm. What is sodium’s wavelength, corrected? Answer in nm.`,
          visual: rigPlot('michelson', { seed: s2, params: { source: 'na' }, expected: true }, t`The sodium run, uncorrected: its fit (gold) sits off the true line (dashed) by the lever’s factor. ${SIMNOTE}`),
          answer: ans, units: 'nm', tol: { rel: 0.001 },
          errors: [{ value: ln - (lh - HENE), feedback: 'The lever error is a scale factor, not an offset: it stretches every travel by the same ratio. Correct by multiplying by 632.8/λ(He–Ne apparent).' }].filter((x) => Math.abs(x.value - ans) > 0.0015 * ans),
          hints: ['The lever scales every mirror travel by the same factor, so every apparent wavelength by that factor too.', t`$\lambda_\text{Na} = \lambda_\text{Na, app} \times 632.8/\lambda_\text{He–Ne, app}$.`],
          teach: 'A scale error found with a known standard is corrected by the ratio, applied to everything measured with the same scale.',
          explain: t`$${ln.toFixed(1)} \times 632.8/${lh.toFixed(1)} = ${ans.toFixed(1)}$ nm (the D lines average $${NA.toFixed(1)}$ nm). An offset correction would be wrong here; the error is proportional to the travel ([calibration](#/lesson/lab.A7.1)).`,
        };
      },
    }),
    mcq({
      id: 'why-not-fit', difficulty: 3,
      prompt: 'A run with the He–Ne laser gives λ = 645 ± 3 nm with χ²/ν = 1.1 and featureless residuals. What does the good χ² tell you about the 4σ disagreement with 632.8 nm?',
      visual: rigPlot('michelson', { seed: 3, expected: true }, t`The He–Ne run: a good fit (gold) off the true line (dashed). ${SIMNOTE}`),
      choices: [
        'Nothing: a scale error in the travel multiplies every x by the same factor, so the data still lie on a perfect line — only a known reference reveals it',
        'The disagreement must be a statistical fluke, since the fit is good',
        'The laser’s wavelength must be wrong, since the fit is good',
        'The counts must be off by one somewhere; recount the largest',
      ],
      answer: 0,
      why: {
        1: 'At 4σ a fluke is rare (about 1 in 16 000 for a Gaussian), and nothing in the fit argues for it.',
        2: 'A He–Ne line is fixed by atomic neon at 632.8 nm to far better than 0.1%; the lab’s lever is the weaker link.',
        3: 'One miscount moves one point by one fringe — the residuals would show it, and it could not shift every point proportionally.',
      },
      hints: ['If every d is too large by 2%, what happens to the shape of N against d?', 'Can any property of the data alone fix the absolute scale of the x-axis?'],
      teach: 'χ² tests scatter about the model; a common scale factor leaves the scatter untouched and goes unseen.',
      explain: 'A proportional error in d stretches the x-axis: the points stay on a line, just with the wrong slope. χ² and residuals are blind to it. A known wavelength (or a calibrated length gauge) is the only cure — calibrate the lever, then measure.',
    }),
    num({
      id: 'gas-cell', difficulty: 3,
      gen(r) {
        const L = r.pick([3, 4, 5]), lam = r.pick([HENE, 543.5]);
        const nm1 = 2.73e-4 * (lam === HENE ? 1 : 1.0035);
        const N = Math.round((2 * L * 1e-2 * nm1) / (lam * 1e-9) * 10) / 10;
        const ans = (N * lam * 1e-9) / (2 * L * 1e-2);
        return {
          prompt: t`A glass cell ${L} cm long sits in one arm. As you pump it from atmospheric pressure to vacuum with ${lam === HENE ? 'a He–Ne (632.8 nm)' : 'a green He–Ne (543.5 nm)'} laser, $${N.toFixed(1)}$ fringes pass. What is $n - 1$ for air at atmospheric pressure?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 105], y: [0, +(N * 1.15).toFixed(1)], xlabel: 'pressure in the cell (kPa)', ylabel: 'fringes passed', axesAt: 'edge', curves: [{ fn: `${(N / 101.3).toFixed(6)}*x`, color: 'accent', domain: [0, 101.3] }], points: [{ x: 101.3, y: N, color: 'gold', label: 'start: 1 atm', labelDx: -78, labelDy: -10 }] }, caption: t`Fringes passed against cell pressure while pumping out: straight, because $n - 1$ is proportional to the gas density (an ideal-gas teaching picture).` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ans * 2, feedback: t`The beam crosses the cell twice, out and back: the path changes by $2L(n - 1)$.` }],
          hints: [t`The optical path through the cell changes by $L(n - 1)$ each way.`, t`$N = 2L(n - 1)/\lambda$, so $n - 1 = N\lambda/(2L)$.`],
          teach: t`A gas cell in one arm changes the optical path by $2L(n - 1)$: the interferometer weighs a gas by its refractive index.`,
          explain: t`$n - 1 = ${N.toFixed(1)} \times ${tex(lam * 1e-9, 4)}/(2 \times 0.0${L}) = ${tex(ans, 3)}$. Since $n - 1$ is proportional to density, this also corrects wavelengths measured in air: here by about 0.03%.`,
        };
      },
    }),
    num({
      id: 'beats', difficulty: 3,
      gen(r) {
        const which = r.pick(['sodium', 'mercury yellow']);
        const [l1, l2] = which === 'sodium' ? [D2, D1] : [576.960, 579.066];
        const ans = (((l1 + l2) / 2) ** 2 / (2 * (l2 - l1))) * 1e-6;
        return {
          prompt: t`The ${which} doublet has lines at $${l1}$ and $${l2}$ nm. Their fringes drift in and out of step, so the fringe contrast fades and returns. How far does the mirror move between two fades? Answer in mm.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, +(2.2 * ans).toFixed(3)], y: [0, 1.15], xlabel: 'mirror travel', xticks: 0, ylabel: 'fringe contrast', axesAt: 'edge', curves: [{ fn: `abs(cos(pi*x/${ans.toFixed(5)}))`, color: 'accent', samples: 600 }] }, caption: 'Fringe contrast against mirror travel for two equally bright lines (travel axis unnumbered: that is the question).' },
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ans * 2, feedback: t`The path difference is $2d$: the mirror moves half the path change between fades, $\lambda^2/(2\Delta\lambda)$.` }],
          hints: [t`The two fringe systems slip by one fringe when the path difference changes by $\lambda^2/\Delta\lambda$.`, t`The mirror moves half the path change: $d = \lambda^2/(2\Delta\lambda)$.`],
          teach: t`Two close lines beat in an interferometer: contrast returns every $\lambda^2/(2\Delta\lambda)$ of mirror travel.`,
          explain: t`$\bar\lambda^2/(2\Delta\lambda) = ${((l1 + l2) / 2).toFixed(2)}^2/(2 \times ${(l2 - l1).toFixed(3)})\ \text{nm} = ${ans.toFixed(3)}$ mm. Counting fades over centimetres of travel measures $\Delta\lambda$ — a spectrometer made of one moving mirror, the idea behind Fourier-transform spectroscopy.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-travel', difficulty: 2,
      gen(r) {
        const target = r.pick([0.1, 0.2, 0.05]);
        const N = 1 / (target / 100);
        const ans = (N * HENE) / 2 / 1000;
        return {
          prompt: t`Your fringe count is uncertain by about one fringe. How far must the mirror move, at 632.8 nm, for that miscount alone to limit the wavelength to $${target}\%$? Answer in μm.`,
          visual: rigRaw('michelson', { seed: 7, settings: [100], flags: { lever: false } }, 'Fringes passing during the last 3 μm of a 20 μm travel: each is one count.'),
          answer: ans, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: ans * 2, feedback: t`$N = 2d/\lambda$: the mirror needs only $N\lambda/2$.` }],
          hints: [t`A miscount of 1 in $N$ gives a relative error $1/N$.`, t`$N = 1/(${target / 100})$, and $d = N\lambda/2$.`],
          teach: 'Counting precision improves with the count: one fringe in N is 1/N.',
          explain: t`$N = ${N.toFixed(0)}$ fringes, so $d = ${N.toFixed(0)} \times 632.8\ \text{nm}/2 = ${ans.toFixed(0)}\ \mu\text{m}$. Beyond that, the lever’s calibration, not the counting, limits the result.`,
        };
      },
    }),
    num({
      id: 'cp-mm', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([10, 11]), lam = r.pick([550, 590]);
        const v = 30e3, c = M.K.c;
        const ans = (2 * L * v * v) / (c * c * lam * 1e-9);
        return {
          prompt: t`Michelson and Morley’s 1887 interferometer folded each arm to an effective length of about $${L}$ m. If light moved through an ether at $c$, and the Earth moved through it at $30$ km/s along one arm, rotating the instrument by 90° should shift the fringes by $\Delta N \approx 2Lv^2/(\lambda c^2)$. How many fringes is that, at $\lambda = ${lam}$ nm?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 360], y: [-0.5, 0.5], xlabel: 'rotation angle (°)', ylabel: 'fringe shift', axesAt: 'edge', curves: [{ fn: '0', color: 'good', width: 3 }], points: [{ x: 300, y: 0.06, r: 0, label: 'observed: flat', color: 'good' }] }, caption: 'What they saw, drawn schematically: no shift twice per rotation, at the level they could detect. Compute the shift the ether theory predicted.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`Rotating by 90° swaps the arms, so the predicted shift is twice one arm’s effect: $2Lv^2/(\lambda c^2)$.` }],
          hints: [t`$v/c = 10^{-4}$, so $v^2/c^2 = 10^{-8}$.`, t`$\Delta N = 2 \times ${L}\ \text{m} \times 10^{-8}/${lam}\ \text{nm}$.`],
          teach: t`An interferometer turns a path difference of a part in $10^8$ over metres into a measurable fraction of a fringe.`,
          explain: t`$\Delta N = 2(${L})(${tex(v * v / (c * c), 3)})/${tex(lam * 1e-9, 3)} = ${ans.toFixed(2)}$ fringe. They reported a shift certainly less than a twentieth of the predicted 0.4 — the null result that special relativity later explained.`,
        };
      },
    }),
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([1e-21, 2e-21, 5e-22]);
        const L = 3995, lam = 1064e-9;
        const dL = h * L;
        const ans = (2 * dL) / lam;
        return {
          prompt: t`A gravitational wave of strain $h = ${tex(h, 1)}$ changes a LIGO arm (about 3995 m long) by $\Delta L = hL$. How many fringes of its 1064 nm laser does that single change of arm length correspond to, with $N = 2\Delta L/\lambda$?`,
          visual: { type: 'gr-chirp', params: { sliders: false, play: false, readout: false }, caption: 'A chirp and what it does to the detector’s arms (exaggerated enormously).' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: 'Out and back: the path changes by 2ΔL.' }],
          hints: [t`$\Delta L = hL = ${tex(dL, 2)}$ m.`, t`$N = 2\Delta L/\lambda$ with $\lambda = 1.064\times10^{-6}$ m.`],
          teach: 'LIGO is a Michelson interferometer that resolves a tiny fraction of one fringe.',
          explain: t`$N = 2(${tex(dL, 2)})/(1.064\times10^{-6}) = ${tex(ans, 2)}$ of a fringe. Counting is useless at that level: LIGO holds its interferometer near a dark fringe, stores the light in Fabry–Pérot arm cavities, and reads the tiny change in output power.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'A. A. Michelson & E. W. Morley, On the relative motion of the Earth and the luminiferous ether, American Journal of Science 34, 333 (1887)', url: 'https://doi.org/10.2475/ajs.s3-34.203.333' },
    SRC.asd,
    SRC.taylor('ch. 4 (systematic errors)'),
    SRC.usu,
  ],
});
