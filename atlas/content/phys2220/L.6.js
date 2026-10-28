// Lab 6 of PHYS 2225 (virtual): Snell's law with a laser and an acrylic
// half-cylinder (sin θ₂ against sin θ₁, slope 1/n), and the thin-lens
// equation on an optical bench (1/s′ against 1/s, intercept 1/f — and a slope
// that must be −1, a built-in check). The systematic is a misplaced zero: a
// block turned on its protractor (an intercept and a low n), or distances read
// from the lens holder's index mark (a straight line with the wrong slope and
// a long f).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';
import { run, apart } from './_lab2225.js';

const t = String.raw;
const N_PMMA = 1.489, F0 = 15.0;
const D2R = Math.PI / 180;
const asind = (x) => Math.asin(x) / D2R;

// the worked example: the lens, distances read from the holder's mark (seed 23)
const EX = (() => {
  const rows = B.makeData('lens', { seed: 23, sys: 'reference' }).rows;
  const an = B.analyse('lens', rows, { sys: 'reference' });
  const f = an.series[0].fit, [qf, qs] = an.results;
  const row = rows[2];                                     // s = 30 cm
  return { rows, f, qf, qs, row, fCorr: 1 / (1 / (row.s + 1) + 1 / (row.R[0] - 1)) };
})();

/** A ray at a flat boundary (optics-rays), as a still picture. */
const iface = (params, caption) => ({ type: 'optics-rays', params: { mode: 'interface', controls: false, readout: false, waves: false, ...params }, caption });
/** A thin lens with an object (optics-rays), as a still picture. */
const lensPic = (params, caption) => ({ type: 'optics-rays', params: { mode: 'lens', controls: false, readout: false, drag: false, ...params }, caption });

export default lesson({
  id: 'phys2220.L.6',
  title: 'Snell’s law and lenses',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment** in two parts. First, a red laser beam enters the flat face of a half-cylinder of acrylic at its centre; you set the angle of incidence $\theta_1$ on the ray table’s protractor and read the angle of refraction $\theta_2$. Second, a lens on an optical bench forms an image of a lit object on a screen; you set the object distance $s$ and find the image distance $s'$ where the image is sharpest. The bench computes each reading with realistic scatter.

Both laws become straight lines with the right axes:

$$\sin\theta_1 = n\sin\theta_2, \qquad \frac{1}{s} + \frac{1}{s'} = \frac{1}{f}$$

Plot $\sin\theta_2$ against $\sin\theta_1$: slope $1/n$. Plot $1/s'$ against $1/s$: intercept $1/f$ — and a slope that must be exactly $-1$. (Lab skills trained: linearizing, and using a known slope as a test of the measurement itself.)`,
  symbols: [
    { tex: '\\theta_1,\\ \\theta_2', text: 'the angles of the beam from the normal to the surface, in air and in the acrylic' },
    { tex: 'n', text: 'the refractive index of acrylic (PMMA): about 1.489 at the laser’s 633 nm (refractiveindex.info, after Sultanova et al. 2009)' },
    { tex: 's', text: 'the object’s distance from the lens, in cm' },
    { tex: "s'", text: 'the image’s distance from the lens, where the screen shows it sharpest, in cm' },
    { tex: 'f', text: 'the lens’s focal length: 15.0 cm by the maker’s specification' },
    { tex: '1/f', text: 'the lens’s power: in m⁻¹ (diopters) when $f$ is in metres' },
  ],
  why: 'Refractive indices set how every lens, window and fibre bends light, and the thin-lens equation is how star trackers, launch cameras and telescopes are focused — so measuring both, and knowing where to measure from, matters.',
  visual: {
    type: 'lab-bench',
    title: 'Bend a laser beam, focus an image',
    lead: t`The Method switch chooses the part. With the block, eight angles are in the table and the plot shows $\sin\theta_2$ against $\sin\theta_1$; the readout gives $n = 1/\text{slope}$. With the lens, seven object distances; the plot shows $1/s'$ against $1/s$, and the readout gives $f$ from the intercept and the slope itself.`,
    tasks: [
      'With the block: the sines fall on a straight line through the origin with slope 1/n, and n comes out near 1.489. Switch the plot to θ₂ against θ₁: a curve.',
      'Switch to the lens: the slope comes out at −1.00 within its error, and f near 15.0 cm. Turn on the systematic (distances from the holder’s mark): the line stays straight, but its slope moves to about −0.87 and f to 16.0 cm.',
      'Back on the block with the systematic on (block turned 4°): the line misses the origin and n drops to about 1.44.',
    ],
    params: { exp: ['snell', 'lens'], seed: 29, residuals: true },
  },
  example: {
    prompt: t`On the optical bench, the object and image distances were read from the lens holder’s index mark. Seven readings are in the table, $s'$ judged to about $\pm$(2 mm + 1.2%). A weighted fit of $1/s'$ against $1/s$ (both in $\text{m}^{-1}$) gives slope $${pmTeX(EX.f.b, EX.f.sb)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\text{m}^{-1}`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. Find $f$, check the fit against the lens equation, and explain what you find.`,
    visual: plot('lens', EX.rows, { sys: true, table: true, residuals: true, expected: true, caption: '1/s′ against 1/s with ±1σ error bars, the weighted least-squares line (gold) and, dashed, the lens equation for f = 15.0 cm.' }),
    steps: [
      { label: 'Focal length', text: t`The intercept is $1/f$, so $f = 100/${EX.f.a.toFixed(3)} = ${EX.qf.value.toFixed(2)}$ cm, with $\sigma_f = f^2\sigma_{1/f} = ${EX.qf.sigma.toFixed(2)}$ cm: $f = ${pmTeX(EX.qf.value, EX.qf.sigma, t`\text{cm}`)}$ — ${EX.qf.z.toFixed(1)}σ above the maker’s 15.0 cm.` },
      { label: 'The built-in check', text: t`The lens equation says $1/s' = 1/f - 1/s$: the slope must be exactly $-1$. The fit gives $${pmTeX(EX.f.b, EX.f.sb)}$, ${((EX.f.b + 1) / EX.f.sb).toFixed(1)} standard errors away. A different lens could change the intercept, but **nothing about the lens can change that slope** — the distances themselves are wrong.` },
      { label: 'Find the cause', text: t`Both distances were read from the holder’s mark, which sits 1.0 cm in front of the lens: every $s$ is really $s + 1.0$ cm and every $s'$ really $s' - 1.0$ cm. Errors of opposite sign in $s$ and $s'$ tilt the line in $1/s$, $1/s'$ while keeping it nearly straight, so $\chi^2$ cannot see them.` },
      { label: 'Correct one point', text: t`At $s = ${EX.row.s}$ cm the screen read $${EX.row.R[0].toFixed(1)}$ cm. Measured from the lens: $s = ${EX.row.s + 1}$ cm, $s' = ${(EX.row.R[0] - 1).toFixed(1)}$ cm, so $f = 1/(1/${EX.row.s + 1} + 1/${(EX.row.R[0] - 1).toFixed(1)}) = ${EX.fCorr.toFixed(2)}$ cm — the maker’s 15.0 cm within one reading’s scatter.` },
      { label: 'Sense check', text: t`For an object at $2f = 30$ cm the image forms at $2f$ too, the same size and inverted — and the reading at $s = 30$ cm is close to that. One point cannot reveal a 1 cm offset; the slope across the whole range can.` },
    ],
    answer: t`The fit gives $f = ${pmTeX(EX.qf.value, EX.qf.sigma, t`\text{cm}`)}$ but a slope of $${pmTeX(EX.f.b, EX.f.sb)}$, not $-1$: the distances were read from a mark 1.0 cm from the lens. Corrected, the data agree with $f = 15.0$ cm.`,
  },
  practice: [
    num({
      id: 'n-from-slope', difficulty: 1,
      gen(r) {
        const { rows, f } = run(r, 'snell');
        const b = +f.b.toFixed(4);
        return {
          prompt: t`A weighted fit of $\sin\theta_2$ against $\sin\theta_1$ for the acrylic block has slope $${b.toFixed(4)}$. What refractive index does that give?`,
          answer: 1 / b, tol: { rel: 0.002 },
          errors: [{ value: b, feedback: t`The slope is $\sin\theta_2/\sin\theta_1 = 1/n$: invert it.` }],
          hints: [t`Snell’s law: $\sin\theta_2 = \sin\theta_1/n$. Compare with $\sin\theta_2 = b\sin\theta_1$.`],
          teach: 'With the sine in the slower medium on the vertical axis, the slope is 1/n.',
          explain: t`$n = 1/${b.toFixed(4)} = ${(1 / b).toFixed(3)}$, close to acrylic’s 1.489.`,
          visual: plot('snell', rows, { caption: 'sin θ₂ against sin θ₁ with the weighted least-squares line.' }),
        };
      },
    }),
    num({
      id: 'predict-theta2', difficulty: 1,
      gen(r) {
        const th1 = r.pick([25, 35, 55, 65, 75]);
        const th2 = asind(Math.sin(th1 * D2R) / N_PMMA);
        return {
          prompt: t`The laser meets the flat face of the acrylic ($n = 1.489$) at $${th1}^\circ$ from the normal. At what angle from the normal does the beam travel inside the block?`,
          answer: th2, units: '°', tol: { rel: 0.004, abs: 0.05 },
          errors: apart([{ value: th1 / N_PMMA, feedback: t`Snell’s law divides the *sines*, not the angles: $\sin\theta_2 = \sin\theta_1/n$.` }, { value: asind(Math.min(1, Math.sin(th1 * D2R) * N_PMMA)), feedback: 'Entering a denser medium, the beam bends toward the normal: θ₂ is smaller than θ₁.' }].filter((e) => Number.isFinite(e.value) && e.value < 89.9), th2, 0.01),
          hints: [t`$\sin\theta_2 = \sin\theta_1/n$.`],
          teach: 'Going into a denser medium, the beam bends toward the normal: sin θ₂ = sin θ₁/n.',
          explain: t`$\sin\theta_2 = \sin ${th1}^\circ/1.489 = ${(Math.sin(th1 * D2R) / N_PMMA).toFixed(4)}$, so $\theta_2 = ${th2.toFixed(1)}^\circ$.`,
          visual: iface({ n1: 1, n2: N_PMMA, angle: th1, hide: ['refracted', 'theta2'] }, `The beam arriving at ${th1}° on the flat face; the acrylic is below (n = 1.489). The refracted beam is hidden.`),
        };
      },
    }),
    mcq({
      id: 'why-sines', difficulty: 2,
      ...(() => {
        const rows = B.makeData('snell', { seed: 8 }).rows;
        return {
          prompt: t`Your angles of refraction, plotted against the angles of incidence, curve. Why plot $\sin\theta_2$ against $\sin\theta_1$ instead?`,
          choices: [
            t`Snell’s law is a proportion between the sines, $\sin\theta_2 = \sin\theta_1/n$, so the sines fall on a straight line through the origin whose slope is $1/n$`,
            'Sines have smaller uncertainties than angles, so the fit is more precise',
            t`$\theta_2$ against $\theta_1$ is also straight; the sines only make the numbers smaller`,
            'A fit needs numbers between 0 and 1',
          ],
          answer: 0,
          why: {
            1: t`The sines carry the same information as the angles; their uncertainties are the angles’ times $\cos\theta$. The point is the shape, not the precision.`,
            2: t`Only for small angles is $\sin\theta \approx \theta$. At $\theta_1 = 80^\circ$, $\theta_2$ is $41^\circ$, well below the $54^\circ$ a straight line from the small angles would predict.`,
            3: 'A least-squares line takes numbers of any size; the axes are chosen to make the law a straight line.',
          },
          hints: ['Which quantities does Snell’s law make proportional to each other?'],
          teach: 'Choose axes on which the law is a straight line: for refraction, the sines of the angles.',
          explain: t`$\sin\theta_1 = n\sin\theta_2$ is a proportion between the sines, not the angles, so only the sines lie on one straight line at every angle. The curve of $\theta_2$ against $\theta_1$ flattens because the sine flattens toward $90^\circ$.`,
          visual: plot('snell', rows, { axes: 'raw', fit: false, caption: 'θ₂ against θ₁: the points curve.' }),
        };
      })(),
    }),
    num({
      id: 'critical', difficulty: 2,
      gen(r) {
        const { f, q } = run(r, 'snell');
        const n = +q.value.toFixed(3), thc = asind(1 / n);
        return {
          prompt: t`Your fit gives $n = ${n.toFixed(3)}$ for the acrylic. Now the beam enters through the curved face, aimed at the centre, and meets the flat face from inside the block. Beyond what angle of incidence will no light get out into the air?`,
          answer: thc, units: '°', tol: { rel: 0.003 },
          errors: apart([{ value: asind(n - 1), feedback: t`The critical angle has $\sin\theta_c = n_2/n_1 = 1/n$, not $n - 1$.` }, { value: 90 - thc, feedback: 'That is measured from the surface. The critical angle, like every angle here, is measured from the normal.' }], thc, 0.01),
          hints: [t`At the critical angle the refracted beam skims the surface: $n\sin\theta_c = 1\cdot\sin 90^\circ$.`],
          teach: 'From inside a denser medium, total internal reflection starts at sin θc = 1/n.',
          explain: t`$\sin\theta_c = 1/${n.toFixed(3)}$, so $\theta_c = ${thc.toFixed(1)}^\circ$. Entering along a radius, the beam crosses the curved face undeviated, so the flat face is the only one that bends it.`,
          visual: iface({ n1: n, n2: 1, angle: 30, hide: ['critical'] }, 'The beam inside the acrylic (above) meeting the flat face; air below. Fresnel strengths shown. Angle shown is 30°, not the critical angle.'),
        };
      },
    }),
    num({
      id: 'one-pair', difficulty: 1,
      gen(r) {
        const s = r.pick([22, 28, 45, 55]);
        const row = B.makeData('lens', { seed: r.int(1, 999999), settings: [s] }).rows[0];
        const si = row.R[0], f = 1 / (1 / s + 1 / si);
        return {
          prompt: t`With the object ${s} cm from the lens, the sharpest image forms on a screen ${si.toFixed(1)} cm behind it. What focal length do these two distances give?`,
          answer: f, units: 'cm', tol: { rel: 0.003 },
          errors: apart([{ value: s + si, feedback: t`Add the *reciprocals*: $1/f = 1/s + 1/s'$.` }, { value: 1 / (1 / s - 1 / si), feedback: t`For a real image both distances are positive: $1/f = 1/s + 1/s'$.` }], f),
          hints: [t`$\dfrac1f = \dfrac1s + \dfrac1{s'}$.`],
          teach: 'One object–image pair gives f = 1/(1/s + 1/s′) — with the full scatter of one judgment of sharpness.',
          explain: t`$1/f = 1/${s} + 1/${si.toFixed(1)} = ${(1 / f).toFixed(5)}\ \text{cm}^{-1}$, so $f = ${f.toFixed(2)}$ cm.`,
          visual: apparatus('lens', { at: s, data: [[s, si]] }, 'The object, the lens and the screen where the image is sharpest. Distances to scale; heights not.'),
        };
      },
    }),
    mcq({
      id: 'slope-check', difficulty: 3,
      gen(r) {
        const { rows, an } = run(r, 'lens', { sys: 'reference' });
        const [qf, qs] = an.results;
        return {
          prompt: t`A fit of $1/s'$ against $1/s$ gives $f = ${pmTeX(qf.value, qf.sigma, t`\text{cm}`)}$ and slope $${pmTeX(qs.value, qs.sigma)}$; the lens is marked 15.0 cm, and the residuals look fine. What is the most likely explanation?`,
          choices: [
            'Both distances were measured from a point that is not at the lens, so every s and s′ is off by the same amount in opposite directions',
            'The lens’s real focal length is 16 cm, not 15 cm',
            'Random scatter: with more readings the slope will come back to −1',
            'The thin-lens equation does not hold for this lens',
          ],
          answer: 0,
          why: {
            1: t`A different focal length moves only the intercept, $1/f$: the slope stays exactly $-1$. Here the slope itself is wrong.`,
            2: t`The slope is ${((qs.value + 1) / qs.sigma).toFixed(0)} standard errors from $-1$: far too far for chance.`,
            3: 'The equation holds well for a thin lens when distances are measured from the lens itself. Blame the measurement before the law.',
          },
          hints: ['Which part of the result can a change of lens never affect?', 'What would make every s too small and every s′ too large by the same amount?'],
          teach: 'A slope the theory fixes is a free test of the measurement: if it is wrong, the data — not the lens — are at fault.',
          explain: t`The law fixes the slope at $-1$ whatever the lens, so a slope of $${qs.value.toFixed(2)}$ points at the distances. Reading both from a mark that sits in front of the lens makes $s$ too small and $s'$ too large by the same amount; on reciprocal axes that tilts the line and inflates $f$.`,
          visual: plot('lens', rows, { sys: true, expected: true, caption: '1/s′ against 1/s, the weighted fit (gold) and the lens equation for f = 15.0 cm (dashed).' }),
        };
      },
    }),
    num({
      id: 'correct-pair', difficulty: 3,
      gen(r) {
        const s = r.pick([25, 30, 35, 40]), dl = r.pick([0.8, 1.0, 1.5]);
        const row = B.makeData('lens', { seed: r.int(1, 999999), settings: [s], sys: 'reference', params: { hold: dl } }).rows[0];
        const si = row.R[0], f = 1 / (1 / (s + dl) + 1 / (si - dl)), fRaw = 1 / (1 / s + 1 / si);
        return {
          prompt: t`Distances on the bench were read from the holder’s index mark, which sits ${dl.toFixed(1)} cm in front of the lens (on the object’s side). The readings are $s = ${s}$ cm and $s' = ${si.toFixed(1)}$ cm. What focal length do they give once corrected?`,
          answer: f, units: 'cm', tol: { rel: 0.003 },
          errors: apart([
            { value: fRaw, feedback: 'That uses the readings as they are. Measure both distances from the lens itself.' },
            { value: 1 / (1 / (s - dl) + 1 / (si + dl)), feedback: t`The mark is on the object’s side of the lens: the object is *farther* from the lens than the mark, the image *nearer*. So $s$ grows and $s'$ shrinks.` },
          ], f, 0.004),
          hints: [t`From the lens, the object is $s + ${dl.toFixed(1)}$ cm away and the image $s' - ${dl.toFixed(1)}$ cm.`, t`Then $1/f = 1/(s + ${dl.toFixed(1)}) + 1/(s' - ${dl.toFixed(1)})$.`],
          teach: 'Measure every distance from the lens: a reference point off the lens shifts s and s′ in opposite directions.',
          explain: t`$1/f = \dfrac{1}{${(s + dl).toFixed(1)}} + \dfrac{1}{${(si - dl).toFixed(1)}}$, so $f = ${f.toFixed(2)}$ cm, against ${fRaw.toFixed(2)} cm uncorrected.`,
          visual: apparatus('lens', { at: s, sys: true, data: [[s, si]], params: { hold: dl } }, 'Distances read from the holder’s index mark (amber), not from the lens. Distances to scale; heights not.'),
        };
      },
    }),
    code({
      id: 'fit-lens', difficulty: 2,
      gen(r) {
        const rows = B.makeData('lens', { seed: r.int(1, 999999) }).rows;
        const ss = rows.map((q) => q.s), si = rows.map((q) => q.R[0]);
        const g = B.fitLine(ss.map((v) => 1 / v), si.map((v) => 1 / v));
        const data = t`import numpy as np

s = np.array([${ss.join(', ')}])                # cm, object distance
s_img = np.array([${si.map((v) => v.toFixed(1)).join(', ')}])   # cm, image distance
`;
        return {
          prompt: t`Fit $1/s'$ against $1/s$ with \`np.polyfit\` (an unweighted fit is fine here). Set \`f\` to the focal length in cm, from the intercept, and \`slope\` to the fitted slope, which the lens equation says should be $-1$.`,
          starter: t`${data}
f = 0.0
slope = 0.0
print(f, slope)
`,
          answer: t`${data}
slope, intercept = np.polyfit(1 / s, 1 / s_img, 1)
f = 1 / intercept
print(f"f = {f:.2f} cm, slope = {slope:.3f}")
`,
          tests: [
            { name: t`\`f\` is 1/intercept (${(1 / g.a).toFixed(2)} cm)`, code: `abs(f - ${1 / g.a}) < 1e-6 * ${1 / g.a}` },
            { name: t`\`slope\` is the fitted slope (${g.b.toFixed(3)})`, code: `abs(slope - ${g.b}) < 1e-6` },
          ],
          hints: [t`\`slope, intercept = np.polyfit(1 / s, 1 / s_img, 1)\` — with distances in cm, the intercept is in cm⁻¹.`, t`\`f = 1 / intercept\`.`],
          teach: 'On reciprocal axes the lens equation is a straight line: intercept 1/f, slope −1.',
          explain: t`The fit gives $f = ${(1 / g.a).toFixed(2)}$ cm and a slope of $${g.b.toFixed(3)}$ — close to $-1$, so these distances were measured from the right place.`,
          visual: plot('lens', rows, { fit: false, caption: 'The readings your program fits.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-star-tracker', difficulty: 3, transfer: true,
      gen(r) {
        const fmm = r.pick([25, 35, 50]), sm = r.pick([2.0, 3.0, 5.0]);
        const s = sm * 1000, d = (fmm * fmm) / (s - fmm);
        return {
          prompt: t`A spacecraft star tracker has a ${fmm} mm lens, focused for stars — objects so far away that their light arrives parallel and images at the focal plane. On the ground it is checked with a target ${sm.toFixed(1)} m away. How far behind the focal plane does that target’s image form, in millimetres?`,
          answer: d, units: 'mm', tol: { rel: 0.005 },
          errors: apart([{ value: (fmm * fmm) / s, feedback: t`That is the small-distance approximation $f^2/s$; the exact shift is $s' - f = f^2/(s - f)$.` }, { value: 1 / (1 / fmm - 1 / s), feedback: t`That is the whole image distance $s'$. The question asks how far it is beyond the focal plane: $s' - f$.` }], d, 0.012),
          hints: [t`For the target, $s' = \dfrac{1}{1/f - 1/s}$; for a star, $s' = f$.`, t`The shift is $s' - f = \dfrac{f^2}{s - f}$.`],
          teach: 'Objects at a finite distance image slightly beyond the focal plane, by f²/(s − f): tiny for distant targets, but a sensor must sit there.',
          explain: t`$s' = 1/(1/${fmm} - 1/${s}) = ${(1 / (1 / fmm - 1 / s)).toFixed(3)}$ mm, so the image sits $${d.toFixed(3)}$ mm behind the focal plane. A tracker focused on the target would blur the stars; test rigs use collimators that put the target optically at infinity.`,
          visual: lensPic({ f: 10, dO: 30, hO: 6, rays: 'principal', hide: ['di', 'm'], view: [-34, 22] }, 'A lens imaging a nearby object: the image forms beyond the focal point F′. Scaled down; the tracker’s numbers are in the question.'),
        };
      },
    }),
    mcq({
      id: 'cp-tir', difficulty: 2,
      prompt: t`Your fit gave $n = 1.489$ for the acrylic. The laser now enters through the curved face, aimed at the centre, and meets the flat face from inside at $45^\circ$ from the normal. What happens there?`,
      choices: [
        'All of the light reflects back into the block: 45° is beyond the critical angle of 42.2°',
        'It refracts out into the air at about 64° from the normal',
        'It refracts out into the air at about 28° from the normal',
        'It passes straight through, because it entered along a radius',
      ],
      answer: 0,
      why: {
        1: t`That would need $\sin\theta_2 = 1.489\sin45^\circ = 1.05$ — more than 1, which no angle has. No refracted beam exists.`,
        2: t`Leaving the denser acrylic the beam bends *away* from the normal, so $\theta_2 > \theta_1$ — but here not even that is possible.`,
        3: 'Entering along a radius means it crosses the curved face without bending. At the flat face it meets a boundary at 45°, like any other beam.',
      },
      hints: [t`Try Snell’s law: $\sin\theta_2 = n\sin\theta_1$ with $n = 1.489$.`, t`Compare $45^\circ$ with $\theta_c = \sin^{-1}(1/1.489)$.`],
      teach: 'Beyond the critical angle Snell’s law has no solution: the light is totally internally reflected.',
      explain: t`$\theta_c = \sin^{-1}(1/1.489) = 42.2^\circ$. At $45^\circ$, $1.489\sin45^\circ = 1.05 > 1$, so no beam leaves: the flat face becomes a perfect mirror. Optical fibres and the prisms in binoculars use this.`,
      visual: iface({ n1: 1.489, n2: 1, angle: 45, hide: ['reflected', 'refracted', 'critical'] }, 'The beam inside the acrylic (above) arriving at 45° at the flat face, air below. What it does next is hidden.'),
    }),
    mcq({
      id: 'cp-snell-fault', difficulty: 3,
      gen(r) {
        const { rows, f, q } = run(r, 'snell', { sys: 'reference' });
        return {
          prompt: t`Another group’s acrylic data give $n = ${pmTeX(q.value, q.sigma)}$, and their line of $\sin\theta_2$ against $\sin\theta_1$ misses the origin: intercept $${pmTeX(f.a, f.sa)}$. What is the most likely cause?`,
          choices: [
            'The block sat turned a few degrees on the protractor, so the 0° line was not its normal',
            'Their block is a different plastic with a lower index',
            'The laser’s colour makes n smaller',
            'Random scatter in reading the angles',
          ],
          answer: 0,
          why: {
            1: t`A different material changes the slope but keeps Snell’s law a proportion — a line through the origin. The intercept says the angles themselves are offset.`,
            2: 'The laser is a single colour, 633 nm, the wavelength n was quoted for; dispersion would also keep the line through the origin.',
            3: t`An intercept ${(f.a / f.sa).toFixed(1)} standard errors from zero, together with a low n, is not chance.`,
          },
          hints: ['Snell’s law with true angles is a proportion: a line through the origin. What kind of fault adds a constant to every angle you read?', 'A constant added to small angles adds about the same amount to their sines — which part of the fitted line does that move?'],
          teach: 'An intercept where the law demands a proportion points to an offset in what you read — here, a misaligned zero.',
          explain: t`If the block is turned by $\delta$, every angle is read from the wrong zero: $\sin(\theta_1 - \delta) = n\sin(\theta_2 - \delta)$. At small angles that adds about $\delta(1 - 1/n)$ to $\sin\theta_2$ — an intercept — and drags the fitted $n$ down. Align the flat face with the protractor’s 90° line (a reflected beam at 0° comes straight back) before measuring.`,
          visual: plot('snell', rows, { sys: true, expected: true, caption: 'sin θ₂ against sin θ₁, the fit (gold) and sin θ₂ = sin θ₁/1.489 (dashed).' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §1.4 Refraction and §1.5 Total Internal Reflection', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-4-refraction' },
    { label: 'OpenStax University Physics Vol. 3, §2.4 Thin Lenses', url: 'https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses' },
    { label: 'refractiveindex.info: PMMA (poly(methyl methacrylate)), Sultanova et al. 2009', url: 'https://refractiveindex.info/?shelf=organic&book=poly%28methyl_methacrylate%29&page=Sultanova' },
    SOURCES.taylor('ch. 8 (least squares)'),
    SOURCES.aapt,
  ],
});
