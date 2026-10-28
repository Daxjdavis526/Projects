// The Michelson interferometer: two arms, one moving mirror, fringes counted
// as 2ΔL = Nλ; measuring wavelengths, displacements and the index of a gas;
// the Michelson–Morley null result; and LIGO — a Michelson with 4 km
// Fabry–Pérot arms that senses arm changes of about 10⁻¹⁸ m without counting
// fringes at all. Pictures from optics-waves (michelson mode) and the
// course's Michelson schematic (_waves.js).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, michelsonPic } from './_optics.js';
import { michelson as michelsonSketch } from './_waves.js';

const t = String.raw;

export default lesson({
  id: 'phys2220.O3.3',
  title: 'The Michelson interferometer',
  minutes: 13, difficulty: 3,
  intro: t`A **Michelson interferometer** splits one beam of light in two with a half-silvered mirror, sends the halves down two perpendicular arms to mirrors, and recombines them at a detector. If one mirror moves a distance $\Delta L$, the light in that arm travels $2\Delta L$ farther — there and back — and the output cycles from bright to dark to bright each time that extra path grows by one wavelength. Counting $N$ fringes measures the move in wavelengths of light:

$$2\Delta L = N\lambda$$

Michelson used it to measure the metre in wavelengths of light, and with Morley (1887) to look for Earth's motion through a supposed "ether" — finding none.`,
  symbols: [
    { tex: '\\Delta L', text: 'how far the movable mirror moves, in m' },
    { tex: '2\\Delta L', text: 'the change in path difference: the light crosses the extra distance twice' },
    { tex: 'N', text: 'the number of fringes (bright–dark–bright cycles) that pass the detector' },
    { tex: '\\lambda', text: 'the wavelength of the light: 633 nm for a red helium–neon laser, 1064 nm for LIGO’s infrared laser' },
  ],
  why: t`The most sensitive ruler ever built is a Michelson interferometer: LIGO senses changes in its 4 km arms of about $10^{-18}$ m, a thousandth of a proton's width, as gravitational waves pass ([how LIGO hears them](#/lesson/gr.S27.i)).`,
  visual: {
    type: 'optics-waves',
    title: 'Counting fringes',
    lead: t`Left: the interferometer from above (the mirror's movement drawn hugely exaggerated). Right: the rings the detector sees, and the brightness at their centre as the mirror moves. Press **Play** to drive the mirror, or use the slider.`,
    tasks: [
      'Play: each time the mirror moves 316 nm (half of 633 nm), a new bright ring is born at the centre and the counter clicks once.',
      'Set the mirror to 158 nm, a quarter wavelength: the centre is dark. The path difference has changed by half a wavelength.',
      t`Change the wavelength to 450 nm and move the mirror the same distance: more fringes go by, since $N = 2\Delta L/\lambda$.`,
    ],
    params: { mode: 'michelson', dL: 0, lambda: 633, d0: 400, maxL: 2000 },
  },
  example: {
    prompt: t`A helium–neon laser ($\lambda = 633$ nm) lights a Michelson interferometer. (a) How many fringes pass the detector when the movable mirror moves 0.100 mm? (b) An experimenter counts 1000 fringes as the mirror moves. How far did it move?`,
    visual: michelsonSketch({ caption: 'A Michelson interferometer from above: moving one end mirror by ΔL changes that arm’s round trip by 2ΔL (not to scale).' }),
    steps: [
      { label: 'Path change', text: t`The mirror moves $\Delta L$; the light goes there and back, so the path difference changes by $2\Delta L$. Each wavelength of that is one fringe.` },
      { label: 'Fringes', text: t`$N = \dfrac{2\Delta L}{\lambda} = \dfrac{2(0.100\times10^{-3}\ \text{m})}{633\times10^{-9}\ \text{m}} = 316$ fringes.` },
      { label: 'Distance', text: t`$\Delta L = \dfrac{N\lambda}{2} = \dfrac{1000(633\ \text{nm})}{2} = 316.5\ \mu\text{m}$.` },
      { label: 'Sense check', text: t`Each fringe is half a wavelength of mirror motion, 0.3 µm: counting fringes measures distances to a fraction of a micrometre with nothing but light.` },
    ],
    answer: t`(a) 316 fringes; (b) $316.5\ \mu\text{m}$.`,
  },
  practice: [
    mcq({
      id: 'quarter', difficulty: 1,
      prompt: 'A Michelson interferometer’s output is bright. The movable mirror moves a quarter of a wavelength farther away. What happens at the output?',
      choices: ['It goes dark', 'It stays bright', 'It goes dark only after half a wavelength of mirror movement', 'It becomes twice as bright'],
      answer: 0,
      why: {
        1: 'The path difference has changed by half a wavelength, which turns in-step into half-a-cycle-apart.',
        2: 'Half a wavelength of mirror motion changes the path by a whole wavelength — that brings it back to bright.',
        3: 'Interference cannot make it brighter than in-step: it was already as bright as it gets.',
      },
      hints: ['The light crosses the extra distance twice.', 'A quarter wavelength of mirror motion is half a wavelength of path.'],
      teach: 'Moving a mirror by λ/4 changes the path difference by λ/2, turning bright into dark.',
      explain: t`The path difference changes by $2\times\lambda/4 = \lambda/2$: the two beams now arrive half a cycle apart and cancel. Another $\lambda/4$ of motion brings the output back to bright.`,
      visual: michelsonPic({ dL: 0 }, 'The interferometer at the start, with the output bright (the mirror’s movement exaggerated).'),
    }),
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const lam = r.pick([633, 543, 532]), dL = r.pick([10, 25, 50, 80]);
        const key = (2 * dL * 1e-6) / (lam * 1e-9);
        return {
          prompt: t`Light of wavelength ${lam} nm lights a Michelson interferometer. How many fringes pass the detector as the mirror moves ${dL} µm?`,
          answer: key, tol: { rel: 0.005, abs: 0.6 },
          errors: [{ value: key / 2, feedback: t`The path changes by *twice* the mirror's movement: $N = 2\Delta L/\lambda$.` }],
          hints: [t`$N = 2\Delta L/\lambda$, with both in metres.`],
          teach: 'Each half-wavelength of mirror motion moves one fringe past the detector.',
          explain: t`$N = \dfrac{2(${dL}\times10^{-6})}{${lam}\times10^{-9}} = ${tn(key)}$ fringes.`,
          visual: michelsonPic({ lambda: lam, dL: 900 }, 'The detector’s rings, and the brightness at their centre as the mirror moves.'),
        };
      },
    }),
    num({
      id: 'displacement', difficulty: 1,
      gen(r) {
        const lam = r.pick([633, 589]), N = r.pick([150, 400, 1200, 2500]);
        const key = (N * lam) / 2 / 1000;
        return {
          prompt: t`Using ${lam} nm light, you count ${N} fringes passing as a mirror on a machine part moves. How far did it move, in micrometres?`,
          answer: key, units: 'µm', tol: { rel: 0.005 },
          errors: [{ value: key * 2, feedback: t`Divide by 2: each fringe is half a wavelength of mirror motion, $\Delta L = N\lambda/2$.` }],
          hints: [t`$\Delta L = N\lambda/2$.`],
          teach: 'Distance = (number of fringes) × (half a wavelength): the interferometer as a ruler.',
          explain: t`$\Delta L = ${N}\times${lam}\ \text{nm}/2 = ${tn(key * 1000)}$ nm $= ${tn(key)}\ \mu\text{m}$.`,
          visual: michelsonSketch({ caption: 'The mirror on the moving part changes one arm’s round trip by twice its movement (not to scale).' }),
        };
      },
    }),
    num({
      id: 'measure-lambda', difficulty: 2,
      gen(r) {
        const [lam0, src] = r.pick([[589.3, 'a sodium lamp'], [532, 'a green laser'], [650, 'a red diode laser'], [405, 'a violet diode laser']]);
        const dL = r.pick([0.1, 0.2, 0.25]);
        const N = Math.round((2 * dL * 1e-3) / (lam0 * 1e-9));
        const key = ((2 * dL * 1e-3) / N) * 1e9;
        return {
          prompt: t`To measure the wavelength of ${src}, you move a Michelson interferometer's mirror ${dL} mm with a calibrated screw and count ${N} fringes. What is the wavelength, in nm?`,
          answer: key, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: key / 2, feedback: t`The path changes by $2\Delta L$: $\lambda = 2\Delta L/N$.` }],
          hints: [t`$\lambda = 2\Delta L/N$.`, t`Convert ${dL} mm to metres, $${dL}\times10^{-3}$ m, before dividing; then express the answer in nm.`],
          teach: 'Run the fringe count backwards to measure a wavelength: λ = 2ΔL/N.',
          explain: t`$\lambda = \dfrac{2(${dL}\times10^{-3}\ \text{m})}{${N}} = ${tn(key)}$ nm.`,
          visual: michelsonPic({ lambda: Math.round(lam0), dL: 600 }, 'The interferometer, its rings and the detector’s brightness against mirror movement.'),
        };
      },
    }),
    num({
      id: 'gas-cell', difficulty: 3,
      gen(r) {
        const [Lc, N] = r.pick([[4, 37], [5, 46], [10, 92]]);
        const lam = 633e-9;
        const key = (N * lam) / (2 * Lc * 1e-2);
        return {
          prompt: t`A glass cell ${Lc}.0 cm long sits in one arm of a Michelson interferometer lit at 633 nm. As air is slowly pumped out of it, ${N} fringes pass the detector. What was the index of the air, as $n - 1$? (The light crosses the cell twice; inside it, a length $L$ holds $nL/\lambda$ wavelengths.)`,
          answer: key, tol: { rel: 0.01 },
          errors: [{ value: key * 2, feedback: t`The light crosses the cell twice: the count is $N = 2L(n - 1)/\lambda$.` }, { value: 1 + key, feedback: t`The question asks for $n - 1$, the small part.` }],
          hints: [t`Pumping out the air changes the number of wavelengths in the cell, one way, by $L(n - 1)/\lambda$.`, t`There and back: $N = 2L(n - 1)/\lambda$.`, t`$n - 1 = N\lambda/(2L)$, with $L$ in metres.`],
          teach: 'Changing what fills one arm shifts the fringes too: an interferometer measures refractive indices of gases.',
          explain: t`$n - 1 = \dfrac{N\lambda}{2L} = \dfrac{${N}(633\times10^{-9})}{2(${Lc / 100})} = ${tn(key)}$ — the index of ordinary air, $1.000\,29$, read to a few percent. The same idea, with air's index changing with density, is what Schlieren systems see.`,
          visual: michelsonSketch({ arm: 'a gas cell in this arm', caption: 'A Michelson interferometer with a gas cell in one arm (not to scale).' }),
        };
      },
    }),
    mcq({
      id: 'michelson-morley', difficulty: 2,
      prompt: 'In 1887 Michelson and Morley turned a large interferometer slowly round, expecting Earth’s motion through the “ether” to change the light’s speed along one arm and shift the fringes by about 0.4 of a fringe. What did they see?',
      choices: [
        'A shift less than a twentieth of the expected one: no sign of motion through an ether',
        'Exactly the expected 0.4-fringe shift',
        'A shift twice as large as expected',
        'No fringes at all: the ether blocked the interference',
      ],
      answer: 0,
      why: {
        1: 'The famous result is a null one: the expected shift did not appear.',
        2: 'Nothing like that was seen; later, far more precise versions have pushed the limit lower still.',
        3: 'The fringes were clear; they simply did not move as the apparatus turned.',
      },
      hints: ['The result is famous for what it did not find.', 'Special relativity takes the speed of light to be the same in every direction for every observer.'],
      teach: 'Michelson and Morley found no fringe shift: light’s speed did not depend on the direction of Earth’s motion.',
      explain: 'They saw less than one twentieth of the expected 0.4 fringe. Einstein’s 1905 postulate — light travels at the same speed for every observer — accounts for the null result directly. Modern versions with lasers and optical cavities confirm it to better than parts in 10¹⁷.',
      visual: michelsonSketch({ arm: 'arm 1', caption: 'The Michelson–Morley arrangement: two perpendicular arms; rotating the whole table swaps their directions relative to Earth’s motion (not to scale).' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-screw', difficulty: 2,
      gen(r) {
        const lam = r.pick([546.1, 632.8]), N = r.pick([200, 500, 800]);
        const key = (N * lam) / 2 / 1000;
        return {
          prompt: t`A micrometer screw moves an interferometer mirror while ${N} fringes of ${lam} nm light pass. How far did the mirror move, in micrometres?`,
          answer: key, units: 'µm', tol: { rel: 0.005 },
          errors: [{ value: key * 2, feedback: 'Each fringe is half a wavelength of mirror motion.' }],
          hints: [t`$\Delta L = N\lambda/2$.`],
          teach: 'A fringe count measures mirror motion in half-wavelengths.',
          explain: t`$\Delta L = ${N}\times${lam}/2 = ${tn(key * 1000)}$ nm $= ${tn(key)}\ \mu\text{m}$. Calibrating the screw this way checks it to a fraction of a micrometre.`,
          visual: michelsonPic({ lambda: Math.round(lam), dL: 1200 }, 'The interferometer and its fringes.'),
        };
      },
    }),
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      prompt: t`LIGO is a Michelson interferometer with 4.0 km arms and a 1064 nm laser. A gravitational wave of strain $h = 1.0\times10^{-21}$ changes the difference between the arm lengths by $\Delta L = hL$. Each arm is a Fabry–Pérot cavity in which the light makes about 280 round trips, multiplying the change in path by about 280. By what fraction of one fringe does the output shift? ($N = 280\times2\Delta L/\lambda$.)`,
      answer: (280 * 2 * 1e-21 * 4000) / 1064e-9, tol: { rel: 0.01 },
      errors: [{ value: (2 * 1e-21 * 4000) / 1064e-9, feedback: 'Include the factor of about 280 from the light’s many round trips in each arm.' }, { value: 1e-21 * 4000, feedback: t`That is $\Delta L$ in metres. Divide the path change by the wavelength to count fringes.` }],
      hints: [t`$\Delta L = hL = 1.0\times10^{-21}\times4000$ m $= 4.0\times10^{-18}$ m.`, t`One round trip: $2\Delta L/\lambda = 8.0\times10^{-18}/1.064\times10^{-6}$.`, 'Multiply by 280.'],
      teach: 'A gravitational wave shifts LIGO’s output by only billionths of a fringe — so LIGO measures light power, not fringe counts.',
      explain: t`$\Delta L = 4.0\times10^{-18}$ m, a few thousandths of a proton's diameter. One round trip shifts the output by $7.5\times10^{-12}$ of a fringe; the cavities raise it to about $${tn((280 * 2 * 1e-21 * 4000) / 1064e-9)}$ of a fringe. Counting fringes could never see that. LIGO instead holds its output near a dark fringe and measures tiny changes in brightness, with hundreds of kilowatts of laser light stored in its arms and seismically isolated mirrors hanging as pendulums.`,
      visual: michelsonSketch({ arm: '4 km arm', caption: 'LIGO’s layout: a Michelson interferometer (not to scale; each arm is also a cavity in which the light bounces about 280 times).' }),
    }),
    mcq({
      id: 'cp-how', difficulty: 3, transfer: true,
      prompt: 'LIGO detects arm-length changes of about 10⁻¹⁸ m — far less than a millionth of a fringe. How is that possible?',
      choices: [
        'It does not count fringes: it holds the output near a dark fringe and measures tiny changes in light power, using very high laser power, arm cavities that multiply the effect, and averaging over enormous numbers of photons',
        'Its laser’s wavelength is about 10⁻¹⁸ m',
        'It counts fringes extremely fast, a trillion per second',
        'Its mirrors are single atoms, which can be placed exactly',
      ],
      answer: 0,
      why: {
        1: 'LIGO’s laser is infrared, 1064 nm: a trillion times longer than the changes it detects.',
        2: 'There are no whole fringes to count: the shift is a few billionths of one.',
        3: 'The mirrors are 40 kg fused-silica test masses, suspended as pendulums to isolate them from ground vibration.',
      },
      hints: ['How much does the output brightness change for a tiny fraction of a fringe, near a dark fringe?', 'More photons make a small change in brightness easier to measure.'],
      teach: 'An interferometer can measure a tiny fraction of a fringe by measuring brightness precisely, rather than counting whole fringes.',
      explain: 'Near a dark fringe, the output power changes in proportion to the arm-length difference, so a billionth of a fringe gives a billionth-scale change in power. With hundreds of kilowatts circulating in the arms, enough photons arrive to measure that above the photon counting noise; cavities multiply the signal and the mirrors are isolated from vibrations. That is how GW150914’s 4×10⁻¹⁸ m stretch was seen.',
      visual: michelsonPic({ lambda: 633, dL: 150 }, 'An interferometer near a dark fringe at its centre: there the output brightness is most sensitive to tiny shifts (a laboratory Michelson, not LIGO’s scale).'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §3.5 The Michelson Interferometer', url: 'https://openstax.org/books/university-physics-volume-3/pages/3-5-the-michelson-interferometer' },
    { label: 'Michelson & Morley, “On the Relative Motion of the Earth and the Luminiferous Ether”, Am. J. Sci. 34, 333 (1887)', url: 'https://en.wikisource.org/wiki/On_the_Relative_Motion_of_the_Earth_and_the_Luminiferous_Ether' },
    { label: 'LIGO Laboratory: LIGO’s interferometer (Fabry–Pérot arm cavities)', url: 'https://www.ligo.caltech.edu/page/ligos-ifo' },
    { label: 'LIGO–Virgo, GW150914, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://arxiv.org/abs/1602.03837' },
  ],
});
