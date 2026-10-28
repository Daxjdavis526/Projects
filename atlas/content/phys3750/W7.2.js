// Spherical waves: for a spherically symmetric wave the Laplacian is
// (1/r)∂²(ru)/∂r², so ru obeys the 1D wave equation and u = f(r − vt)/r. The
// harmonic outgoing wave (Ã/r)e^{i(kr − ωt)}: amplitude ∝ 1/r because the
// energy flux through every sphere is the same, intensity P/4πr² (the
// inverse-square law), decibels falling 6 dB per doubling, converging waves,
// and the far field looking plane (sagitta D²/8R). Worked example: sunlight
// from the Sun's nominal luminosity to the solar constant and out to Jupiter.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;
const LSUN = 3.828e26, AU = 1.495978707e11;    // IAU 2015 nominal solar luminosity (W); IAU 2012 astronomical unit (m)

const EX = (() => {
  const S = LSUN / (4 * Math.PI * AU * AU), rM = 1.524, rJ = 5.203;
  return { S, rM, rJ, SM: S / rM ** 2, SJ: S / rJ ** 2 };
})();

// u(r) = cos(kr)/r along a radius, with its ±1/r envelope (r in wavelengths)
const radialPic = (caption, more = {}) => curvesPic([
  { fn: 'cos(2*pi*x)/x', color: 'accent', width: 2.2, domain: [0.25, 6], samples: 2000 },
  { fn: '1/x', color: 'gold', dash: [5, 4], width: 1.2, domain: [0.25, 6] },
  { fn: '-1/x', color: 'gold', dash: [5, 4], width: 1.2, domain: [0.25, 6] },
], [0, 6], [-3, 3], caption, { xlabel: 'r (wavelengths)', ylabel: 'u (relative)', ...more });

export default lesson({
  id: 'phys3750.W7.2',
  title: 'Spherical waves',
  minutes: 14, difficulty: 3,
  intro: t`A small source — a loudspeaker, a star, a supernova — sends waves out equally in all directions. For a wave that depends only on the distance $r$, the Laplacian simplifies to $\nabla^2u = \frac1r\partial_r^2(ru)$, so the product $ru$ obeys the **one-dimensional** wave equation, and $ru = f(r - vt)$. For a steady tone:

$$u(r, t) = \frac{\tilde A}{r}\,e^{i(kr - \omega t)}, \qquad I = \frac{P}{4\pi r^2}$$

The wavefronts are spheres, and the amplitude falls as $1/r$ — exactly what is needed for the power $P$ flowing out through every sphere, intensity $\times\ 4\pi r^2$, to be the same. That is the **inverse-square law**: not a separate fact, but energy conservation for a spherical wave. Far from the source, a small patch of a sphere is nearly flat: the spherical wave looks like the [plane waves](#/lesson/phys3750.W7.1) of the last lesson.`,
  symbols: [
    { tex: 'r', text: 'the distance from the source, in m' },
    { tex: '\\tilde A/r', text: 'the complex amplitude at distance $r$: $\\tilde A$ is fixed by the source, in (units of $u$)·m' },
    { tex: 'k = \\omega/v', text: 'the wavenumber, in rad/m: crests (spheres) are $2\\pi/k$ apart' },
    { tex: 'I', text: 'the intensity: power per unit area crossing a sphere, in W/m² — proportional to $|\\tilde A|^2/r^2$' },
    { tex: 'P', text: 'the total power the source emits, in W' },
  ],
  why: t`Every radiation budget — sunlight on a planet, a spacecraft’s radio link, a supernova’s neutrinos, a gravitational wave’s strain falling as $1/r$ — rests on the spherical wave.`,
  visual: {
    type: 'c3-contour',
    title: 'Rings that fade as 1/r',
    lead: t`A slice through a spherical wave, $\cos(kr - \omega t)/r$, with the source at the centre. Gold and teal are crests, dark blue troughs; as the amplitude falls, the crests fade from gold to teal. Shading is clipped near the source, where the field is largest.`,
    tasks: [
      t`Advance time: the rings move outward at the same speed everywhere and the pattern keeps its shape.`,
      t`Compare a ring near the centre with one 4 times farther out: its amplitude is 4 times smaller, its intensity 16 times.`,
      t`Look at a small patch far from the centre: the rings are nearly straight, a plane wave.`,
    ],
    params: {
      f: 'max(-0.6, min(0.6, cos(2*pi*(sqrt(x^2 + y^2)/lam - ph))/(sqrt(x^2 + y^2)/lam)))', x: [-6, 6], y: [-3.75, 3.75], levels: { from: -0.5, to: 0.5, step: 0.25 }, labels: false, fill: true, n: 170,
      sliders: [
        { key: 'ph', label: 'Time $t/T$', min: 0, max: 2, step: 0.01, value: 0, unit: '', explain: 'Time in periods: each period every crest moves out one wavelength.' },
        { key: 'lam', label: 'Wavelength $\\lambda$', min: 0.6, max: 2, step: 0.05, value: 1, unit: '\\mathrm{m}', explain: 'The spacing of the crests.' },
      ],
      xlabel: 'x (m)', ylabel: 'y (m)',
    },
    caption: t`A slice through the source of $u = \cos(kr - \omega t)/(kr/2\pi)$; values beyond ±0.6 are drawn as ±0.6 so the far rings stay visible; thin lines are contours of u, 0.25 apart. An ideal point source in a uniform, lossless medium.`,
  },
  example: {
    prompt: t`The Sun’s total power output is $L_\odot = ${tn(LSUN, 4)}$ W (the IAU nominal value). Treating sunlight as a spherical wave, what intensity reaches the top of Earth’s atmosphere at $1\ \text{AU} = ${tn(AU, 7)}$ m? And at Mars (${EX.rM} AU) and Jupiter (${EX.rJ} AU)?`,
    steps: [
      { label: 'One sphere', text: t`All of $L_\odot$ crosses a sphere of radius $r$ around the Sun (nothing is absorbed in between), so $I = L_\odot/4\pi r^2$.` },
      { label: 'At Earth', text: t`$I = ${tn(LSUN, 4)}/\big(4\pi(${tn(AU, 4)})^2\big) = ${tn(EX.S, 4)}$ W/m². The measured “solar constant” is about 1361 W/m²: the inverse-square law with the nominal luminosity reproduces it.` },
      { label: 'Scale outward', text: t`$I \propto 1/r^2$: at Mars $${tn(EX.S, 4)}/${EX.rM}^2 = ${tn(EX.SM)}$ W/m²; at Jupiter $${tn(EX.S, 4)}/${EX.rJ}^2 = ${tn(EX.SJ)}$ W/m², $1/${tn(EX.rJ ** 2, 3)}$ of Earth’s.` },
      { label: 'Amplitude', text: t`The wave’s field amplitude falls only as $1/r$: at Jupiter it is $1/${EX.rJ}$ of Earth’s. Intensity, being amplitude squared, falls as $1/r^2$.` },
      { label: 'Sense check', text: t`Juno, at Jupiter, carries about 60 m² of solar panels — far more than an Earth satellite of similar power — for exactly this factor of ${tn(EX.rJ ** 2, 2)}.` },
    ],
    answer: t`$${tn(EX.S, 4)}$ W/m² at Earth, $${tn(EX.SM)}$ W/m² at Mars and $${tn(EX.SJ)}$ W/m² at Jupiter.`,
    visual: curvesPic([{ fn: `${EX.S.toFixed(1)}/x^2`, color: 'accent', width: 2.4, domain: [0.3, 6] }], [0, 6], [0, 2000], t`Sunlight’s intensity (W/m²) against distance from the Sun (AU), $I = L_\odot/4\pi r^2$.`, { xlabel: 'distance (AU)', ylabel: 'I (W/m²)', points: [{ x: 1, y: EX.S, color: 'gold', label: 'Earth' }, { x: EX.rM, y: EX.SM, color: 'gold', label: 'Mars' }, { x: EX.rJ, y: EX.SJ, color: 'gold', label: 'Jupiter', labelDy: -14 }] }),
  },
  practice: [
    mcq({
      id: 'why-1-over-r', difficulty: 2,
      prompt: t`Why does a spherical wave’s **amplitude** fall as $1/r$, rather than $1/r^2$?`,
      visual: radialPic(t`A spherical wave along one radius (blue) inside its envelope $\pm 1/r$ (dashed).`),
      choices: [
        t`Intensity $\propto$ amplitude², and intensity × $4\pi r^2$ must stay constant, so amplitude $\propto 1/r$`,
        t`The amplitude does fall as $1/r^2$; only the intensity falls as $1/r$`,
        t`The medium absorbs energy as the wave travels, at a rate proportional to $1/r$`,
        t`The wavelength grows in proportion to $r$, which spreads the amplitude out`,
      ],
      answer: 0,
      why: {
        1: t`That is backwards: the intensity, which is the square of the amplitude, carries the $1/r^2$.`,
        2: t`The $1/r$ holds in a perfectly lossless medium; absorption adds an extra exponential decay on top.`,
        3: t`The wavelength $2\pi/k$ is the same at every radius: the crests stay equally spaced.`,
      },
      hints: [t`Energy flux through a sphere: intensity × area.`, t`$I \propto |\tilde A|^2/r^2$ and area $= 4\pi r^2$.`],
      teach: t`$1/r$ in amplitude is $1/r^2$ in intensity: energy conservation spread over a sphere.`,
      explain: t`$|\tilde A/r|^2 \times 4\pi r^2 = 4\pi|\tilde A|^2$, the same through every sphere: the wave neither gains nor loses energy as it spreads.`,
    }),
    num({
      id: 'amp-scale', difficulty: 2,
      gen(r) {
        const r1 = r.pick([2, 5, 10]), m = r.pick([3, 4, 8, 10]), p1 = r.pick([20, 50, 120]);
        const r2 = r1 * m, p2 = p1 / m;
        return {
          prompt: t`A small loudspeaker’s sound has a pressure amplitude of ${p1} mPa at ${r1} m. What is the pressure amplitude at ${r2} m, in mPa? (Open air, no echoes or absorption.)`,
          visual: radialPic(t`Pressure along a radius (blue), inside the envelope $\propto 1/r$ (dashed); $r$ in wavelengths.`),
          answer: p2, units: 'mPa', tol: { rel: 0.01 },
          errors: [{ value: p1 / (m * m), feedback: t`That is how the **intensity** scales. The amplitude scales as $1/r$.` }],
          hints: [t`Amplitude $\propto 1/r$.`, t`$p_2 = p_1\,r_1/r_2$.`],
          teach: t`A spherical wave’s amplitude scales as $1/r$.`,
          explain: t`$${p1} \times ${r1}/${r2} = ${tn(p2)}$ mPa. The intensity falls ${m * m}-fold.`,
        };
      },
    }),
    num({
      id: 'db-drop', difficulty: 2,
      gen(r) {
        const m = r.pick([2, 3, 5, 10, 20]);
        const d = 20 * Math.log10(m);
        return {
          prompt: t`You move ${m} times farther from a small source of sound in open air. By how many decibels does the sound level drop?`,
          visual: curvesPic([{ fn: '1/x^2', color: 'accent', width: 2.4, domain: [0.4, 8] }], [0, 8], [0, 6.5], t`Intensity of a point source against distance (both relative): $I \propto 1/r^2$.`, { xlabel: 'r (relative)', ylabel: 'I (relative)' }),
          answer: d, units: 'dB', tol: { rel: 0.01, abs: 0.05 },
          errors: [{ value: 10 * Math.log10(m), feedback: t`Intensity falls by $${m}^2$, not ${m}: $10\log_{10}(${m}^2) = 20\log_{10}${m}$.` }],
          hints: [t`The intensity falls by a factor $${m}^2$.`, t`Level change $= 10\log_{10}(I_1/I_2) = 20\log_{10}(r_2/r_1)$.`],
          teach: t`Inverse square in decibels: −6 dB per doubling of distance, −20 dB per factor of 10.`,
          explain: t`$20\log_{10}${m} = ${tn(d)}$ dB. Real outdoor sound also loses some to air absorption and gains some from ground reflections.`,
        };
      },
    }),
    num({
      id: 'siren', difficulty: 2,
      gen(r) {
        const P = r.pick([0.5, 2, 10]), R = r.pick([20, 50, 100]);
        const I = P / (4 * Math.PI * R * R), L = 10 * Math.log10(I / 1e-12);
        return {
          prompt: t`A warning siren radiates ${P} W of sound equally in all directions. What sound level does a listener ${R} m away hear, in dB ($I_0 = 10^{-12}$ W/m²)?`,
          visual: curvesPic([{ fn: `${P}/(4*pi*x^2)`, color: 'accent', width: 2.4, domain: [R / 5, R * 2] }], [0, R * 2], [0, P / (4 * Math.PI * (R / 5) ** 2) * 1.1], t`The siren’s intensity (W/m²) against distance (m).`, { xlabel: 'r (m)', ylabel: 'I (W/m²)' }),
          answer: L, units: 'dB', tol: { rel: 0, abs: 0.2 },
          errors: [{ value: 10 * Math.log10(P / (4 * Math.PI * R) / 1e-12), feedback: t`Divide by the sphere’s **area**, $4\pi r^2$.` }, { value: 10 * Math.log10(P / (R * R) / 1e-12), feedback: t`The area of a sphere is $4\pi r^2$, not $r^2$.` }],
          hints: [t`$I = P/(4\pi r^2)$.`, t`$L = 10\log_{10}(I/I_0)$.`],
          teach: t`An isotropic source: $I = P/4\pi r^2$, then convert to decibels.`,
          explain: t`$I = ${P}/(4\pi \times ${R}^2) = ${tn(I)}$ W/m², so $L = ${tn(L)}$ dB.`,
        };
      },
    }),
    num({
      id: 'sagitta', difficulty: 3,
      gen(r) {
        const D = r.pick([34, 70]), Rkm = r.pick([36000, 400000, 2.3e8]);
        const sag = (D * D) / (8 * Rkm * 1000) * 1000;   // mm
        const what = { 36000: 'a geostationary satellite', 400000: 'a spacecraft near the Moon', 230000000: 'a Mars orbiter' }[Rkm];
        return {
          prompt: t`A ${D} m deep-space antenna receives ${what} $${tn(Rkm, 2)}$ km away. The arriving wavefront is a sphere of that radius. By how much does it depart from a flat plane across the dish, i.e. what is the sagitta $D^2/8R$, in mm?`,
          visual: curvesPic([{ fn: '1 - sqrt(1 - x^2)', color: 'gold', width: 2, domain: [-0.6, 0.6] }, { fn: '0', color: 'ink3', dash: [5, 4], width: 1.2, domain: [-0.6, 0.6] }], [-0.8, 0.8], [-0.1, 0.4], t`A spherical wavefront (gold) against a plane (dashed) across a dish — curvature hugely exaggerated.`, { xlabel: 'across the dish', ylabel: '', xticks: 0, yticks: 0 }),
          answer: sag, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (D * D) / (2 * Rkm * 1000) * 1000, feedback: t`Use the half-width $D/2$: the sagitta is $(D/2)^2/2R = D^2/8R$.` }],
          hints: [t`For a sphere of radius $R \gg D$, the surface at distance $s$ from the axis sits $s^2/2R$ behind the tangent plane.`, t`$s = D/2$ at the rim: $D^2/8R$, with $R$ in m.`],
          teach: t`Far from the source a spherical wave is plane to within $D^2/8R$ across an aperture $D$ — negligible once that is much less than a wavelength.`,
          explain: t`$D^2/8R = ${D}^2/(8 \times ${tn(Rkm * 1000)}) = ${tn(sag)}$ mm — tiny next to a 36 mm X-band wavelength, so the dish sees a plane wave.`,
        };
      },
    }),
    mcq({
      id: 'converging', difficulty: 3,
      prompt: t`The wave equation also allows $u = g(r + vt)/r$: a spherical wave **converging** on the centre. What happens to its amplitude as it closes in?`,
      visual: radialPic(t`The envelope $\propto 1/r$ (dashed) along a radius: an inward-moving wave climbs it.`),
      choices: [
        t`It grows as $1/r$: the same energy is squeezed through ever smaller spheres`,
        t`It shrinks as $r$: the wave loses energy as it moves inward`,
        t`It stays the same: amplitude only changes for outgoing waves`,
        t`It grows exponentially, without limit, as soon as the wave starts moving inward`,
      ],
      answer: 0,
      why: {
        1: 'In a lossless medium the energy crossing each sphere is the same whichever way the wave runs.',
        2: t`The $1/r$ belongs to the geometry, not to the direction of travel.`,
        3: t`The growth is $1/r$, a power law, not exponential; it is finite until the wave reaches the very centre.`,
      },
      hints: [t`$ru = g(r + vt)$ keeps its size; divide by $r$.`, 'Energy flux through a sphere is the same at every radius.'],
      teach: t`A converging spherical wave focuses: amplitude $\propto 1/r$ grows toward the centre.`,
      explain: t`The same $1/r$, run backwards. Medicine uses this to shatter kidney stones with focused shock waves, and implosions use it to reach extreme pressures; near the centre the linear theory breaks down.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solar-flux', difficulty: 2, transfer: true,
      gen(r) {
        const [name, d] = r.pick([['Mercury', 0.387], ['Saturn', 9.537], ['Parker Solar Probe at its closest approach', 0.0459], ['Mars', 1.524]]);
        const I = LSUN / (4 * Math.PI * (d * AU) ** 2);
        return {
          prompt: t`With the Sun’s luminosity $L_\odot = ${tn(LSUN, 4)}$ W and 1 AU $= ${tn(AU, 4)}$ m, what is the intensity of sunlight at ${name}, ${d} AU from the Sun, in W/m²?`,
          visual: curvesPic([{ fn: `1361/x^2`, color: 'accent', width: 2.4, domain: [0.3, 10] }], [0, 10], [0, 3000], t`Sunlight’s intensity (W/m²) against distance from the Sun (AU).`, { xlabel: 'distance (AU)', ylabel: 'I (W/m²)' }),
          answer: I, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: LSUN / (4 * Math.PI * d * AU * AU), feedback: t`Square the whole distance: $r = ${d}$ AU, so $r^2 = (${d} \times ${tn(AU, 4)})^2$.` }, { value: LSUN / (4 * Math.PI * (d * AU)), feedback: t`Intensity falls as $1/r^2$.` }],
          hints: [t`$I = L_\odot/(4\pi r^2)$.`, t`Equivalently, $1361\ \text{W/m}^2/(${d})^2$.`],
          teach: t`Inverse square: $I = L/4\pi r^2$, or Earth’s 1361 W/m² divided by $r^2$ in AU.`,
          explain: t`$I = ${tn(LSUN, 4)}/\big(4\pi(${tn(d * AU, 4)})^2\big) = ${tn(I)}$ W/m².`,
        };
      },
    }),
    num({
      id: 'cp-test-stand', difficulty: 3, transfer: true,
      gen(r) {
        const L1 = r.pick([130, 140, 150]), r1 = r.pick([100, 300]), L2 = r.pick([85, 100]);
        const r2 = r1 * 10 ** ((L1 - L2) / 20);
        return {
          prompt: t`A rocket engine on a test stand produces ${L1} dB at ${r1} m. Treating the engine as a point source in open air (ignoring air absorption, wind and the ground), at what distance has the level fallen to ${L2} dB, in km?`,
          visual: curvesPic([{ fn: `${L1} - 20*log10(x/${r1 / 1000})`, color: 'accent', width: 2.4, domain: [r1 / 2000, 100] }], [0, 100], [60, L1 + 15], t`Sound level (dB) against distance (km) for a point source: 20 dB per factor of 10.`, { xlabel: 'distance (km)', ylabel: 'level (dB)', hlines: [{ y: L2, color: 'gold' }] }),
          answer: r2 / 1000, units: 'km', tol: { rel: 0.02 },
          errors: [{ value: (r1 * 10 ** ((L1 - L2) / 10)) / 1000, feedback: t`Level falls as $20\log_{10}r$ (intensity $\propto 1/r^2$), so $r_2 = r_1\times 10^{\Delta L/20}$.` }],
          hints: [t`$L_1 - L_2 = 20\log_{10}(r_2/r_1)$.`, t`$r_2 = r_1 \times 10^{(${L1} - ${L2})/20}$.`],
          teach: t`Point source: every factor of 10 in distance costs 20 dB.`,
          explain: t`$r_2 = ${r1} \times 10^{${L1 - L2}/20} = ${tn(r2 / 1000)}$ km. In reality air absorbs the high frequencies too, so the true distance is shorter — but the inverse square sets the scale.`,
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: t`A satellite’s radio signal is received at twice the distance. What happens to its intensity and to its field amplitude?`,
      visual: curvesPic([{ fn: '1/x^2', color: 'accent', width: 2.2, domain: [0.5, 4], label: 'intensity', labelAt: 0.8, labelDx: 8 }, { fn: '1/x', color: 'gold', dash: [5, 4], width: 1.6, domain: [0.25, 4], label: 'amplitude', labelAt: 3, labelDy: -12 }], [0, 4], [0, 3.2], t`Intensity ($\propto 1/r^2$) and amplitude ($\propto 1/r$) of a spherical wave, relative.`, { xlabel: 'r (relative)', ylabel: '' }),
      choices: ['Intensity falls to 1/4; amplitude to 1/2', 'Intensity falls to 1/2; amplitude to 1/4', 'Both fall to 1/2', 'Both fall to 1/4'],
      answer: 0,
      why: {
        1: 'Swapped: the amplitude carries 1/r, the intensity (amplitude squared) 1/r².',
        2: 'Intensity is the square of amplitude: if one halves, the other must quarter.',
        3: 'Intensity ∝ amplitude²: they cannot fall by the same factor.',
      },
      hints: [t`$I \propto 1/r^2$.`, t`$I \propto |\text{amplitude}|^2$.`],
      teach: t`Spherical spreading: amplitude $\propto 1/r$, intensity $\propto 1/r^2$.`,
      explain: t`Doubling $r$: $I \to I/4$ (−6 dB) and the field amplitude $\to 1/2$. A beamed antenna still obeys the same $1/r^2$ far away; it only concentrates the power into a smaller solid angle.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 9–13 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'IAU 2015 Resolution B3: nominal solar luminosity 3.828 × 10²⁶ W', url: 'https://arxiv.org/abs/1510.07674' },
    { label: 'Kopp & Lean, A new, lower value of total solar irradiance, GRL 38, L01706 (2011): 1360.8 ± 0.5 W/m²', url: 'https://doi.org/10.1029/2010GL045777' },
  ],
});
