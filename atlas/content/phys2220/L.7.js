// Lab 7 of PHYS 2225 (virtual): diffraction and interference with a HeNe
// laser. A double slit's bright fringes sit at y = mλL/d, so y against the
// order m gives the slit separation; the single-slit envelope (slits 0.040 mm
// wide) wipes out every fifth order, and counting past the gap without
// noticing puts a kink in the residuals. A 300 lines/mm grating throws its
// orders out to 50°, where sin θ = mλ/d must be computed exactly: y/L is
// tan θ, and the small-angle shortcut wrecks λ.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';
import { run, apart } from './_lab2225.js';

const t = String.raw;
const P0 = B.EXPERIMENTS.doubleslit.defaults;
const LAM = 632.8e-9, D2R = Math.PI / 180;

// the worked example: fringes counted past the missing 5th order (seed 19)
const EX = (() => {
  const rows = B.makeData('doubleslit', { seed: 19 }).rows;
  const bad = B.analyse('doubleslit', rows, { sys: 'slip' }), good = B.analyse('doubleslit', rows);
  return { rows, fb: bad.series[0].fit, qb: bad.results[0], fg: good.series[0].fit, qg: good.results[0], gap: rows[4].R[0] - rows[3].R[0], step: rows[3].R[0] - rows[2].R[0] };
})();

/** An interference pattern from optics-waves, as a still picture. */
const slits = (params, caption) => ({ type: 'optics-waves', params: { mode: 'slits', controls: false, readout: false, phasors: false, ...params }, caption });

export default lesson({
  id: 'phys2220.L.7',
  title: 'Diffraction and interference with a laser',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A helium–neon laser ($\lambda = 632.8$ nm) shines through a pair of narrow slits onto a screen 1.500 m away, and then through a diffraction grating. You read the positions of the bright fringes or spots off a ruler on the screen. The bench computes each reading with realistic scatter.

Light from the slits arrives in step — a bright fringe — wherever the two paths differ by a whole number of wavelengths:

$$d\sin\theta_m = m\lambda, \qquad y_m = L\tan\theta_m \approx \frac{m\lambda L}{d}\ \ (\text{small }\theta)$$

So the double slit’s fringes are evenly spaced, and $y$ against $m$ is a straight line of slope $\lambda L/d$. A grating’s orders fly out to large angles, where $\sin\theta$ must be computed exactly. (Lab skills trained: identifying what each fringe is before fitting it, and knowing when an approximation holds.)`,
  symbols: [
    { tex: 'd', text: 'the distance between the slits’ centres (0.200 mm on the slide’s label), or between neighbouring lines of a grating (1/300 mm)' },
    { tex: '\\theta_m', text: 'the angle of the $m$-th bright fringe from the straight-through beam' },
    { tex: 'm', text: 'the order: 0 for the central fringe, then 1, 2, 3 … outward on each side' },
    { tex: '\\lambda', text: 'the laser’s wavelength: 632.8 nm for the helium–neon red line' },
    { tex: 'y_m', text: 'the fringe’s distance from the centre of the pattern on the screen, in mm' },
    { tex: 'L', text: 'the distance from the slits to the screen, in m' },
  ],
  why: 'Gratings sort light by wavelength in every astronomical spectrograph, from the instruments that find exoplanets by their star’s wobble to the ones on Mars rovers; reading their orders correctly is the whole game.',
  visual: {
    type: 'lab-bench',
    title: 'Shine the laser, read the pattern',
    lead: t`With the double slit, eight bright fringes are in the table — the 5th order is missing — and the plot shows $y$ against $m$; the readout turns the slope into the slit separation $d$. The Method switch changes to the grating, where the readout gives $\lambda$ from $\sin\theta$ against $m$.`,
    tasks: [
      'With the double slit, y against m is straight and d comes out at 0.200 mm. Look at the pattern above the bench: the 5th fringe is missing, wiped out by the single-slit envelope.',
      'Turn on the systematic (an analysis slip): the fringes past the gap are now counted 5, 6, 7, 8. The residuals jump at the gap, χ²/dof soars, and d drops by 16%.',
      'Switch to the grating: sin θ against m gives λ = 632.8 nm. With the systematic on, sin θ is taken as y/L — at these angles the line curves and λ comes out absurdly long.',
    ],
    params: { exp: ['doubleslit', 'grating'], seed: 16, residuals: true },
  },
  example: {
    prompt: t`A student counts the visible bright fringes outward, 1 to 8, and records their distances from the centre: ${EX.rows.map((q) => q.R[0].toFixed(1)).join(', ')} mm (each to ±0.3 mm). The screen is 1.500 m away. A fit of $y$ against the counted $m$ gives slope $${pmTeX(EX.fb.b, EX.fb.sb, t`\text{mm}`)}$ with $\chi^2/\text{dof} = ${EX.fb.chi2r.toFixed(1)}$, so $d = ${pmTeX(EX.qb.value, EX.qb.sigma, t`\text{mm}`)}$ — far from the 0.200 mm on the slide. Find what went wrong, and the slit separation.`,
    visual: plot('doubleslit', EX.rows, { sys: true, residuals: true, caption: 'y against the counted m, the least-squares line and the residuals: they jump between the 4th and 5th counted fringes.' }),
    steps: [
      { label: 'Read the residuals', text: t`$\chi^2/\text{dof} = ${EX.fb.chi2r.toFixed(1)}$ is not scatter, and the residuals are not random: they fall steadily, then jump between the 4th and 5th counted fringes. Something happens at that fringe.` },
      { label: 'Look at the gaps', text: t`The first four fringes are about $${EX.step.toFixed(1)}$ mm apart, but the 4th and the next visible one are $${EX.gap.toFixed(1)}$ mm apart — two spacings. A fringe is missing there.` },
      { label: 'Why missing', text: t`Each slit is $a = 0.040$ mm wide, and its own diffraction pattern has a zero where $a\sin\theta = \lambda$. With $d/a = 0.200/0.040 = 5$ that zero falls exactly on the double slit’s 5th order: $d\sin\theta = 5\lambda$. The 5th bright fringe has nothing to be bright with.` },
      { label: 'Relabel and refit', text: t`The fringes counted 5, 6, 7, 8 are really orders 6, 7, 8, 9. Refit: slope $${pmTeX(EX.fg.b, EX.fg.sb, t`\text{mm}`)}$, $\chi^2/\text{dof} = ${EX.fg.chi2r.toFixed(2)}$, residuals without a pattern.` },
      { label: 'Slit separation', text: t`$d = \lambda L/\text{slope} = (632.8\times10^{-9}\ \text{m})(1.500\ \text{m})/(${EX.fg.b.toFixed(3)}\times10^{-3}\ \text{m}) = ${EX.qg.value.toFixed(4)}$ mm; with the slope’s uncertainty and $L$’s 0.13%, $d = ${pmTeX(EX.qg.value, EX.qg.sigma, t`\text{mm}`)}$ — the slide’s 0.200 mm.` },
      { label: 'Sense check', text: t`The largest angle here is $\sin\theta_9 = 9\lambda/d = 0.028$, about $1.6^\circ$, so $\tan\theta$ and $\sin\theta$ differ by only 0.04%: for a double slit the small-angle form $y = m\lambda L/d$ is excellent.` },
    ],
    answer: t`The 5th order is missing (it falls on a zero of each slit’s own pattern, since $d/a = 5$), so the fringes counted 5–8 are orders 6–9. Relabelled, $d = ${pmTeX(EX.qg.value, EX.qg.sigma, t`\text{mm}`)}$.`,
  },
  practice: [
    num({
      id: 'd-from-slope', difficulty: 1,
      gen(r) {
        const { rows, f } = run(r, 'doubleslit');
        const b = +f.b.toFixed(3), d = (LAM * 1.5) / (b * 1e-3) * 1e3;
        return {
          prompt: t`The fringes of a HeNe laser (632.8 nm) on a screen 1.500 m from a double slit give a slope of $${b.toFixed(3)}$ mm per order for $y$ against $m$. What is the slit separation, in mm?`,
          answer: d, units: 'mm', tol: { rel: 0.003 },
          errors: [{ value: (b * 1e-3) / (LAM * 1.5) * 1e-3, feedback: t`Upside down: the slope is $\lambda L/d$, so $d = \lambda L/\text{slope}$.` }],
          hints: [t`$y_m = m\lambda L/d$: the slope is $\lambda L/d$.`, 'Work in metres: the slope in m, then d in m, then convert to mm.'],
          teach: 'The fringe spacing λL/d is the slope of y against m; the slit separation is λL divided by it.',
          explain: t`$d = \dfrac{(632.8\times10^{-9})(1.500)}{${b.toFixed(3)}\times10^{-3}} = ${d.toFixed(4)}$ mm.`,
          visual: plot('doubleslit', rows, { caption: 'y against m for the bright fringes (the 5th order is missing), with the least-squares line.' }),
        };
      },
    }),
    num({
      id: 'spacing', difficulty: 1,
      gen(r) {
        const dmm = r.pick([0.125, 0.150, 0.250, 0.300]), L = r.pick([1.2, 2.5, 3.0]);
        const dy = (LAM * L) / (dmm * 1e-3) * 1e3;
        return {
          prompt: t`The HeNe laser lights two slits ${dmm.toFixed(3)} mm apart. How far apart, in mm, are neighbouring bright fringes on a screen ${L.toFixed(1)} m away?`,
          answer: dy, units: 'mm', tol: { rel: 0.004 },
          errors: apart([{ value: dy / 2, feedback: t`Neighbouring bright fringes differ by one whole order, $\Delta m = 1$: their spacing is $\lambda L/d$, not half of it.` }], dy),
          hints: [t`$\Delta y = \lambda L/d$ for $\Delta m = 1$.`],
          teach: 'Double-slit fringes are evenly spaced by λL/d: farther screen or closer slits, wider fringes.',
          explain: t`$\Delta y = \dfrac{(632.8\times10^{-9})(${L.toFixed(1)})}{${(dmm * 1e-3).toExponential(2).replace('e-4', '\\times10^{-4}')}} = ${dy.toFixed(2)}$ mm.`,
          visual: slits({ N: 2, a: 20, d: Math.round(dmm * 1000), lambda: 633, L, axis: 'angle', hide: ['spacing'] }, `The fringes plotted by angle (slits ${Math.round(dmm * 1000)} µm apart, 20 µm wide). Turning angles into millimetres on the screen is your job.`),
        };
      },
    }),
    num({
      id: 'missing-order', difficulty: 2,
      gen(r) {
        const [dum, aum] = r.pick([[200, 50], [240, 60], [300, 100], [180, 30], [250, 50]]);
        const k = dum / aum;
        return {
          prompt: t`A double slit has slits ${aum} µm wide whose centres are ${dum} µm apart. Which bright fringe is the first to go missing?`,
          answer: k, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: k - 1, feedback: t`Order $m$ falls on the envelope’s first zero when $d\sin\theta = m\lambda$ and $a\sin\theta = \lambda$ together: $m = d/a$ exactly.` }],
          hints: [t`Each slit’s own pattern is dark where $a\sin\theta = \lambda$.`, t`The double slit’s order $m$ sits at $d\sin\theta = m\lambda$. Divide the two conditions.`],
          teach: 'When the slit spacing is a whole number d/a of slit widths, that order lands on a zero of the single-slit envelope and vanishes.',
          explain: t`$m = d/a = ${dum}/${aum} = ${k}$: the ${k}th bright fringe (and the ${2 * k}th, …) is missing. Count past it carefully — or you will label every later fringe one order too low.`,
          visual: slits({ N: 1, a: aum, d: dum, lambda: 633, L: 1.5, range: 40 }, `The pattern of one ${aum} µm slit alone: the envelope that every double-slit fringe lives under. 1.5 m screen.`),
        };
      },
    }),
    mcq({
      id: 'narrower', difficulty: 2,
      prompt: 'Keeping the slits’ spacing d fixed, you swap in a slide whose slits are half as wide. What happens to the pattern on the screen?',
      choices: [
        'The fringe spacing stays the same, but the envelope spreads to twice the width, so more fringes are visible',
        'The fringes move twice as far apart',
        'The envelope shrinks to half the width',
        'Nothing changes: only d matters',
      ],
      answer: 0,
      why: {
        1: t`The fringe spacing $\lambda L/d$ is set by the slits’ *spacing*, not their width.`,
        2: t`A narrower slit diffracts *more*: its envelope’s first zero at $\sin\theta = \lambda/a$ moves out as $a$ shrinks. A wider slit makes a narrower pattern, not a wider one.`,
        3: 'The slit width sets the envelope — how far out the fringes stay bright — and how much light gets through.',
      },
      hints: ['Which length sets the spacing of the fringes, and which sets the envelope?', t`The envelope’s first zero is at $\sin\theta = \lambda/a$.`],
      teach: 'The slit spacing sets the fringe spacing; the slit width sets the envelope, and narrower slits spread it wider.',
      explain: t`Halving $a$ moves the envelope’s first zero from $\lambda/a$ to $2\lambda/a$: twice as many fringes fit under it (dimmer, since less light gets through), still spaced $\lambda L/d$ apart.`,
      visual: slits({ N: 2, a: 40, d: 200, lambda: 633, L: 1.5 }, 'The double-slit pattern before the swap: slits 40 µm wide, 200 µm apart, screen 1.5 m away. The dashed curve is the single-slit envelope.'),
    }),
    mcq({
      id: 'kink', difficulty: 3,
      gen(r) {
        const { rows, f, q } = run(r, 'doubleslit', { sys: 'slip' });
        return {
          prompt: t`A classmate’s fit of $y$ against their counted orders gives $d = ${pmTeX(q.value, q.sigma, t`\text{mm}`)}$ with $\chi^2/\text{dof} = ${f.chi2r.toFixed(0)}$, and the residuals jump halfway along. The slits are 0.040 mm wide and labelled 0.200 mm apart. What happened?`,
          choices: [
            'The 5th order is missing (d/a = 5), and the fringes beyond the gap were counted one order too low',
            'The laser’s wavelength drifted during the run',
            'The screen moved halfway through the measurements',
            'The error bars are too small: the ruler is worse than ±0.3 mm',
          ],
          answer: 0,
          why: {
            1: 'A drifting wavelength would stretch the pattern gradually, not make a sudden jump — and HeNe lines are extremely stable.',
            2: 'A moved screen could cause a jump — but at exactly the place a missing order is predicted? Check the simple explanation first: the gap between counted 4 and counted 5 is two spacings.',
            3: 'Bigger error bars would lower χ² but not remove a step in the residuals — and d would still be wrong.',
          },
          hints: ['Look at the spacing between successive fringes: is any gap twice as big?', t`Which order falls on a zero of each slit’s own pattern? Compute $d/a$.`],
          teach: 'Identify every fringe’s order before fitting: a missing order miscounted shows up as a step in the residuals.',
          explain: t`$d/a = 0.200/0.040 = 5$, so the 5th order lands on the single-slit zero and vanishes. Counting only the visible fringes labels orders 6–9 as 5–8: the later points sit too far out for their labels, the line steepens, and $d = \lambda L/\text{slope}$ comes out about 16% small.`,
          visual: plot('doubleslit', rows, { sys: true, residuals: true, caption: 'y against the counted order, the least-squares line, and the residuals.' }),
        };
      },
    }),
    num({
      id: 'grating-lambda', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 2, 3]);
        const row = B.makeData('grating', { seed: r.int(1, 999999), settings: [m] }).rows[0];
        const Y = row.R[0], y = Y / 2, L = 300;
        const lam = ((y / Math.hypot(y, L)) / m) * (1e-3 / 300) * 1e9;
        return {
          prompt: t`The laser passes through a grating with 300 lines per mm onto a screen 0.300 m away. The two order-${m} spots (one on each side) are ${Y.toFixed(0)} mm apart. What wavelength does that give, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.003 },
          errors: apart([
            { value: (((y / L) / m) * (1e-3 / 300)) * 1e9, feedback: t`$y/L$ is $\tan\theta$, not $\sin\theta$. At these angles the difference matters: $\sin\theta = y/\sqrt{y^2 + L^2}$.` },
            { value: (((Y / Math.hypot(Y, L)) / m) * (1e-3 / 300)) * 1e9, feedback: t`${Y.toFixed(0)} mm is the distance between the two spots, $2y$. Each spot is $y = ${y.toFixed(1)}$ mm from the centre.` },
          ], lam, 0.008),
          hints: [t`$d = 1/300$ mm, and $\sin\theta = y/\sqrt{y^2 + L^2}$ with $y$ half the separation.`, t`Then $\lambda = d\sin\theta/m$.`],
          teach: 'For a grating, find sin θ exactly from the spot’s position, then λ = d sin θ / m.',
          explain: t`$y = ${y.toFixed(1)}$ mm, $\sin\theta = ${y.toFixed(1)}/\sqrt{${y.toFixed(1)}^2 + 300^2} = ${(y / Math.hypot(y, L)).toFixed(4)}$, so $\lambda = (3.333\ \mu\text{m})(${(y / Math.hypot(y, L)).toFixed(4)})/${m} = ${lam.toFixed(1)}$ nm.`,
          visual: apparatus('grating', { at: m, data: [[m, Y]] }, `The grating and the screen; the measured order is ±${m}. Spot positions to scale.`),
        };
      },
    }),
    num({
      id: 'small-angle', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 2, 3, 4]);
        const th = Math.asin((m * LAM * 300) / 1e-3) / D2R, err = 100 * (1 / Math.cos(th * D2R) - 1);
        return {
          prompt: t`For the 300 lines/mm grating, order ${m} leaves at $\theta = ${th.toFixed(1)}^\circ$. By what percentage does $y/L$ (that is, $\tan\theta$) overstate $\sin\theta$ there?`,
          answer: err, units: '%', tol: { rel: 0.01 },
          errors: apart([{ value: 100 * (Math.tan(th * D2R) - Math.sin(th * D2R)), feedback: t`That is the *difference* $\tan\theta - \sin\theta$, times 100. Asked for is the ratio: $\tan\theta/\sin\theta - 1 = 1/\cos\theta - 1$.` }], err, 0.02),
          hints: [t`$\dfrac{\tan\theta}{\sin\theta} = \dfrac{1}{\cos\theta}$.`],
          teach: 'y/L overstates sin θ by the factor 1/cos θ: under 0.1% below 2.5°, but large for a grating’s outer orders.',
          explain: t`$1/\cos ${th.toFixed(1)}^\circ - 1 = ${err.toFixed(1)}$%. A double slit’s fringes, within a degree or two, suffer under 0.1%; a grating’s orders do not.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 55], y: [0, 1.45], xlabel: 'θ (°)', ylabel: ' ',
              curves: [{ fn: 'sin(x*pi/180)', color: 'accent', width: 2.4, label: 'sin θ', labelAt: 47, labelDy: 14 }, { fn: 'tan(x*pi/180)', color: 'warn', width: 2.4, dash: true, label: 'tan θ = y/L', labelAt: 42, labelDy: -14 }],
              vlines: [{ x: +th.toFixed(2), color: 'violet', label: `order ${m}` }],
            },
            caption: 'sin θ and tan θ: indistinguishable at small angles, far apart at a grating’s outer orders.',
          },
        };
      },
    }),
    code({
      id: 'grating-fit', difficulty: 2,
      gen(r) {
        const rows = B.makeData('grating', { seed: r.int(1, 999999) }).rows;
        const ms = rows.map((q) => q.s), Ys = rows.map((q) => q.R[0]);
        const sinE = Ys.map((Y) => (Y / 2) / Math.hypot(Y / 2, 300)), sinS = Ys.map((Y) => Y / 2 / 300);
        const g = B.fitLine(ms, sinE), gs = B.fitLine(ms, sinS), d = 1e-3 / 300;
        const lam = g.b * d * 1e9, lamS = gs.b * d * 1e9;
        const data = t`import numpy as np

m = np.array([${ms.join(', ')}])
sep = np.array([${Ys.map((v) => v.toFixed(0)).join(', ')}])   # mm, between the spots of order +m and −m
L = 300.0                         # mm, grating to screen
d = 1e-3 / 300                    # m, line spacing
`;
        return {
          prompt: t`Compute $\sin\theta$ for each order exactly from the spot separation, fit it against $m$ with \`np.polyfit\`, and set \`lam\` to the wavelength in nm. Then set \`lam_small\` to what the small-angle shortcut $\sin\theta \approx y/L$ would give.`,
          starter: t`${data}
lam = 0.0
lam_small = 0.0
print(lam, lam_small)
`,
          answer: t`${data}
y = sep / 2
sin_exact = y / np.sqrt(y**2 + L**2)
lam = np.polyfit(m, sin_exact, 1)[0] * d * 1e9
lam_small = np.polyfit(m, y / L, 1)[0] * d * 1e9
print(f"lambda = {lam:.1f} nm; small-angle: {lam_small:.0f} nm")
`,
          tests: [
            { name: t`\`lam\` uses the exact $\sin\theta$ (${lam.toFixed(1)} nm)`, code: `abs(lam - ${lam}) < 1e-6 * ${lam}` },
            { name: t`\`lam_small\` uses $y/L$ (${lamS.toFixed(0)} nm)`, code: `abs(lam_small - ${lamS}) < 1e-6 * ${lamS}` },
          ],
          hints: [t`\`y = sep / 2\`, then \`sin_exact = y / np.sqrt(y**2 + L**2)\`.`, t`The slope of $\sin\theta$ against $m$ is $\lambda/d$: \`lam = np.polyfit(m, sin_exact, 1)[0] * d * 1e9\`.`],
          teach: 'The slope of sin θ against the order is λ/d; compute sin θ exactly from the geometry, not as y/L.',
          explain: t`Exact: $\lambda = ${lam.toFixed(1)}$ nm. Small-angle: ${lamS.toFixed(0)} nm — the shortcut, harmless for a double slit, is ruinous at a grating’s ${(Math.asin(4 * 632.8e-9 * 300 / 1e-3) / D2R).toFixed(0)}° fourth order.`,
          visual: plot('grating', rows, { fit: false, caption: 'sin θ against m for the readings your program fits.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-redshift', difficulty: 3, transfer: true,
      gen(r) {
        const lines = r.pick([1200, 1000, 800]), v = r.pick([20, 30, 50]);
        const lam0 = 656.28e-9, dg = 1e-3 / lines, s = lam0 / dg, th = Math.asin(s);
        const dlam = (lam0 * v * 1e3) / 2.998e8, dth = dlam / (dg * Math.cos(th));
        const asec = (dth * 180 * 3600) / Math.PI;
        return {
          prompt: t`An astronomical spectrograph uses a grating with ${lines} lines per mm in first order. A star’s hydrogen-alpha line (656.28 nm at rest) is redshifted because the star recedes at ${v} km/s: $\Delta\lambda = \lambda v/c$. By how much does the line’s diffraction angle change, in arcseconds?`,
          answer: asec, units: 'arcsec', tol: { rel: 0.01 },
          errors: apart([{ value: ((dlam / dg) * 180 * 3600) / Math.PI, feedback: t`Differentiate $d\sin\theta = \lambda$: $d\cos\theta\,\Delta\theta = \Delta\lambda$. Do not forget the $\cos\theta$.` }], asec, 0.02),
          hints: [t`$\Delta\lambda = \lambda v/c$, and $\theta = \sin^{-1}(\lambda/d)$ for $m = 1$.`, t`From $d\sin\theta = \lambda$: $\Delta\theta = \Delta\lambda/(d\cos\theta)$, in radians; 1 rad = 206 265 arcsec.`],
          teach: 'A grating turns a wavelength shift into an angle shift Δθ = mΔλ/(d cos θ): the basis of every Doppler spectrograph.',
          explain: t`$\theta = \sin^{-1}(${s.toFixed(4)}) = ${(th / D2R).toFixed(2)}^\circ$; $\Delta\lambda = ${(dlam * 1e12).toFixed(1)}$ pm; $\Delta\theta = \Delta\lambda/(d\cos\theta) = ${(dth * 1e6).toFixed(1)}\ \mu\text{rad} = ${asec.toFixed(1)}$ arcsec. Exoplanet hunters measure shifts thousands of times smaller, with bigger gratings, higher orders and exquisite calibration.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [400, 700], y: [0, 1.05], xlabel: 'λ (nm)', ylabel: 'sin θ',
              curves: [{ fn: `${+(lines * 1e-6).toFixed(6)}*x`, color: 'accent', width: 2.4, label: `first order, ${lines} lines/mm`, labelAt: 470, labelDy: -14, domain: [400, Math.min(700, +(dg * 1e9).toFixed(1))] }],
              vlines: [{ x: 656.28, color: 'bad', label: 'Hα' }],
            },
            caption: 'sin θ = λ/d in first order: the steeper the line, the more a shift in λ moves the angle.',
          },
        };
      },
    }),
    num({
      id: 'cp-two-fringes', difficulty: 2,
      gen(r) {
        const rows = B.makeData('doubleslit', { seed: r.int(1, 999999), settings: [2, 8] }).rows;
        const [y2, y8] = rows.map((q) => q.R[0]);
        const sp = (y8 - y2) / 6, d = (LAM * 1.5) / (sp * 1e-3) * 1e3;
        return {
          prompt: t`On the screen 1.500 m away, the 2nd bright fringe is ${y2.toFixed(1)} mm and the 8th is ${y8.toFixed(1)} mm from the centre. What slit separation do these two readings give, in mm?`,
          answer: d, units: 'mm', tol: { rel: 0.005 },
          errors: apart([{ value: (LAM * 1.5) / (((y8 - y2) / 7) * 1e-3) * 1e3, feedback: 'From the 2nd to the 8th fringe is six spacings, not seven.' }, { value: (LAM * 1.5) / (((y8 - y2) / 5) * 1e-3) * 1e3, feedback: 'The missing 5th fringe still counts: from order 2 to order 8 is six spacings.' }], d, 0.01),
          hints: [t`Between orders 2 and 8 there are $8 - 2 = 6$ fringe spacings, missing order or not.`, t`$d = \lambda L/\Delta y$ with $\Delta y$ one spacing.`],
          teach: 'Using fringes far apart averages over many spacings — as long as the orders, not the visible fringes, are counted.',
          explain: t`One spacing is $(${y8.toFixed(1)} - ${y2.toFixed(1)})/6 = ${sp.toFixed(3)}$ mm, so $d = (632.8\times10^{-9})(1.500)/(${sp.toFixed(3)}\times10^{-3}) = ${d.toFixed(4)}$ mm.`,
          visual: apparatus('doubleslit', { at: 8, data: [[8, y8]] }, 'The fringes on the screen: the 5th order is missing. The bracket marks the 8th fringe’s distance from the centre.'),
        };
      },
    }),
    mcq({
      id: 'cp-blue', difficulty: 2,
      prompt: 'You replace the red HeNe laser (633 nm) with a blue one (450 nm), keeping the same grating. How do the first-order spots move?',
      choices: [
        'Closer to the centre: a shorter wavelength diffracts through a smaller angle',
        'Farther from the centre, because blue light bends more',
        'They stay put: a grating’s angles depend only on its line spacing',
        'They disappear: a grating works only for one colour',
      ],
      answer: 0,
      why: {
        1: t`Blue bends more in a *prism*, where the cause is refraction (the glass’s $n$ is larger for blue). A grating diffracts, and $\sin\theta = m\lambda/d$ is larger for longer, redder wavelengths.`,
        2: t`$\sin\theta = m\lambda/d$ contains $\lambda$: that is what makes a grating a spectrometer.`,
        3: 'A grating diffracts every wavelength — each to its own angle, which is how it spreads white light into a spectrum.',
      },
      hints: [t`Look at $d\sin\theta = m\lambda$: what happens to $\theta$ when $\lambda$ shrinks?`],
      teach: 'A grating sends longer wavelengths to larger angles — the reverse of a prism’s order of colours.',
      explain: t`$\sin\theta_1 = \lambda/d$: $0.190$ for 633 nm but $0.135$ for 450 nm with 300 lines/mm, so the blue spots sit at $7.8^\circ$ instead of $10.9^\circ$. A grating’s spectrum runs violet-inside, red-outside — the opposite of a prism’s.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [-0.65, 0.65], y: [-1, 1], xlabel: 'sin θ', ylabel: ' ', yticks: 0.001,
          points: [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ x: +(k * 0.18984).toFixed(4), y: 0, r: 7, color: 'bad' })),
          hlines: [{ y: 0, color: 'ink4' }],
        },
        caption: 'The red laser’s spots through the 300 lines/mm grating, by sin θ. Where would blue ones go?',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §3.2 Young’s Double-Slit Interference', url: 'https://openstax.org/books/university-physics-volume-3/pages/3-2-youngs-double-slit-interference' },
    { label: 'OpenStax University Physics Vol. 3, §4.3 Double-Slit Diffraction and §4.4 Diffraction Gratings', url: 'https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction' },
    { label: 'NIST Atomic Spectra Database: the helium–neon laser line, 632.8 nm (in air)', url: 'https://physics.nist.gov/PhysRefData/ASD/lines_form.html' },
    SOURCES.taylor('ch. 8 (least squares)'),
    SOURCES.aapt,
  ],
});
