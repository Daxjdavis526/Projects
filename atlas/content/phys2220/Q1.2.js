// Photons and Compton scattering — a photon carries momentum p = h/λ = E/c;
// scattering off a free electron lengthens its wavelength by
// Δλ = (h/mₑc)(1 − cos θ). Compton's 1923 molybdenum Kα experiment, the
// Compton edge of gamma-ray detectors, and PET's 511 keV photons. Every
// number is computed here or in model/qm-compton.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { H } from '../../src/viz/model/qm-light.js';
import { LAMBDA_C_PM, MEC2_KEV, keV, pmOf, shiftPm, scatter, scatteredKeV } from '../../src/viz/model/qm-compton.js';
import { seg, label } from './_modern.js';

const t = String.raw;

const LC = LAMBDA_C_PM;
const EX = scatter(71.07, 90);            // Compton's molybdenum Kα line at 90°

/** The Compton picture with every answer-bearing number hidden. */
const scene = (params, caption) => ({ type: 'qm-compton', params: { graph: false, controls: false, readout: false, hide: ['lam2', 'E2', 'K', 'phi'], ...params }, ...(caption ? { caption } : {}) });

/** A photon pictured as a short wave packet carrying momentum. */
const packet = {
  type: 'graph',
  params: {
    x: [-0.5, 10.5], y: [-1.6, 1.9], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ fn: 'exp(-((x - 4.5)/1.6)^2)*sin(2*pi*x/0.7)', color: 'violet', width: 2.2 }],
    arrows: [{ from: [7.2, 0], to: [9.8, 0], color: 'gold', label: 'p = h/λ', labelDx: -46, labelDy: -16 }],
    points: [label(4.5, -1.25, 'one photon: energy E = hc/λ, momentum p = E/c', 'violet', 0, 0, 'center')],
  },
  caption: 'A photon pictured as a short wave packet moving to the right. Schematic: a photon has no size or shape of this kind.',
};

export default lesson({
  id: 'phys2220.Q1.2',
  title: 'Photons and Compton scattering',
  minutes: 12, difficulty: 3,
  intro: t`A photon carries momentum as well as energy. Being massless, it has $E = pc$ (lesson R1.4), so $p = E/c = h/\lambda$. Fire X-ray photons at a block of carbon and they bounce off its loosely held electrons like billiard balls: each electron recoils, carrying off energy and momentum, so the scattered photon has less energy — a **longer wavelength**. Conservation of energy and momentum fixes the shift, which depends only on the scattering angle:

$$\Delta\lambda = \lambda' - \lambda = \frac{h}{m_e c}\,(1 - \cos\theta)$$

Arthur Compton measured exactly this in 1923. A classical wave would have made the electrons oscillate at its own frequency and re-radiate at the same wavelength — no shift at all.`,
  symbols: [
    { tex: '\\lambda', text: 'the wavelength of the incoming photon, in m (for X-rays, picometres: 1 pm = $10^{-12}$ m)' },
    { tex: "\\lambda'", text: 'the wavelength of the scattered photon' },
    { tex: '\\Delta\\lambda', text: 'the Compton shift, $\\lambda\' - \\lambda$: never negative' },
    { tex: 'h', text: t`Planck’s constant, $6.626\times10^{-34}$ J s` },
    { tex: 'm_e', text: t`the electron’s mass, $9.109\times10^{-31}$ kg; the photon scatters off a single electron` },
    { tex: 'c', text: t`the speed of light, $2.998\times10^{8}$ m/s` },
    { tex: '\\theta', text: 'the scattering angle: 0 means straight on, 180° straight back' },
    { tex: 'h/m_e c', text: t`the electron’s Compton wavelength, ${fmt(LC, 4)} pm: the shift at 90°, and half the largest possible shift` },
  ],
  why: 'Compton scattering settled that photons carry momentum; today it shapes every gamma-ray spectrum, blurs medical X-ray images, and — run in reverse by fast electrons in space — makes some of the most energetic photons in astronomy.',
  visual: {
    type: 'qm-compton',
    title: 'A billiard-ball collision with light',
    lead: t`An X-ray photon strikes an electron at rest. Change the scattering angle and watch three things: the scattered wave stretches, the electron recoils, and the momentum triangle on the right always closes — $\vec p = \vec p\,' + \vec p_e$.`,
    tasks: [
      'At θ = 90° the shift is exactly h/mₑc = 2.43 pm, whatever the X-rays’ wavelength.',
      'Push θ to 180° (backscatter): the shift doubles to 4.85 pm and the electron shoots straight ahead with the most energy.',
      'Switch to green light: the same 2.43 pm is a few parts per million of 532 nm — invisible. Then try cesium-137 gamma rays at 180°: the photon loses most of its energy.',
    ],
    params: { source: 'mo', theta: 90 },
  },
  example: {
    prompt: t`In 1923 Compton scattered molybdenum Kα X-rays ($\lambda = 71.07$ pm) off carbon and looked at 90°. Predict the scattered wavelength and the photon energies, the electron’s kinetic energy, and the direction it recoils in.`,
    visual: { type: 'qm-compton', params: { source: 'mo', theta: 90, graph: false, controls: false }, caption: 'The collision at 90°: the waves’ wavelengths are drawn in their true ratio (hugely magnified); the momentum arrows on the right are to scale.' },
    steps: [
      { label: 'The Compton wavelength', text: t`$\dfrac{h}{m_ec} = \dfrac{6.626\times10^{-34}\ \text{J s}}{(9.109\times10^{-31}\ \text{kg})(2.998\times10^{8}\ \text{m/s})} = ${tex(LC * 1e-12, 4)}$ m $= ${fmt(LC, 4)}$ pm.` },
      { label: 'The shift at 90 degrees', text: t`$\cos 90° = 0$, so $\Delta\lambda = h/m_ec = ${fmt(LC, 4)}$ pm and $\lambda' = 71.07 + ${fmt(LC, 3)} = ${fmt(EX.lam2, 4)}$ pm — a ${fmt(EX.frac * 100, 2)}% stretch, easily measured with a crystal spectrometer.` },
      { label: 'Photon energies', text: t`$E = hc/\lambda = \dfrac{1239.8\ \text{keV pm}}{71.07\ \text{pm}} = ${fmt(EX.E, 4)}$ keV, and $E' = 1239.8/${fmt(EX.lam2, 4)} = ${fmt(EX.E2, 4)}$ keV.` },
      { label: 'The electron’s share', text: t`Energy is conserved, so the electron gets $K = E - E' = ${fmt(EX.K, 3)}$ keV — a few per cent of the photon’s energy, far below its rest energy of 511 keV, so it recoils at a modest ${fmt(Math.sqrt(2 * EX.K / MEC2_KEV), 2)}c.` },
      { label: 'Where it goes', text: t`Momentum is conserved too. The photon arrives with $p = E/c$ along $x$ and leaves with $p' = E'/c$ straight up, so the electron carries $(p,\ -p')$: it recoils at $\tan^{-1}(p'/p) = \tan^{-1}(${fmt(EX.E2 / EX.E, 4)}) = ${fmt(EX.phi, 3)}°$ below the axis.` },
      { label: 'Sense check', text: t`Compton saw a peak at about 73.5 pm at this angle. The same 2.43 pm shift on 500 nm visible light would be five parts in a million — which is why it took X-rays to see it.` },
    ],
    answer: t`$\lambda' = ${fmt(EX.lam2, 4)}$ pm; $E = ${fmt(EX.E, 4)}$ keV, $E' = ${fmt(EX.E2, 4)}$ keV; the electron gets ${fmt(EX.K, 3)} keV and recoils ${fmt(EX.phi, 3)}° below the incoming direction.`,
  },
  practice: [
    num({
      id: 'photon-momentum', difficulty: 1,
      gen(r) {
        const [nm, what] = r.pick([[532, 'a green laser photon (532 nm)'], [0.07107, 'a molybdenum Kα X-ray photon (71.07 pm)'], [121.6, 'an ultraviolet Lyman-α photon (121.6 nm)'], [1064, 'an infrared photon from an Nd:YAG laser (1064 nm)'], [pmOf(661.657) / 1000, 'a cesium-137 gamma-ray photon (1.874 pm)']]);
        const p = H / (nm * 1e-9);
        return {
          prompt: t`What is the momentum of ${what}, in kg·m/s?`,
          answer: p, units: 'kg m/s', tol: { rel: 0.005 },
          errors: [{ value: p * 299792458, feedback: t`That is the energy $pc$ in joules. Momentum is $p = h/\lambda$.` }],
          hints: [t`$p = h/\lambda$, with $h = 6.626\times10^{-34}$ J s and $\lambda$ in metres.`],
          teach: 'A photon’s momentum is p = h/λ: the shorter the wavelength, the harder it hits.',
          explain: t`$p = \dfrac{6.626\times10^{-34}}{${tex(nm * 1e-9, 4)}}\ \text{kg·m/s} = ${tex(p, 3)}$ kg·m/s. Tiny — but near Earth a light sail catches a few times $10^{21}$ sunlight photons per square metre every second, and the pushes add up.`,
          visual: packet,
        };
      },
    }),
    num({
      id: 'shift-angle', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 45, 60, 120, 135, 150]);
        const d = shiftPm(th);
        return {
          prompt: t`X-rays scatter off the loosely bound electrons in a block of carbon. By how many picometres is the wavelength of the X-rays scattered through ${th}° longer than that of the incoming ones?`,
          answer: d, units: 'pm', tol: { rel: 0.005 },
          errors: [{ value: LC * Math.cos(th * Math.PI / 180), feedback: t`The factor is $(1 - \cos\theta)$, not $\cos\theta$.` }, { value: LC * (1 + Math.cos(th * Math.PI / 180)), feedback: t`Check the sign: $\Delta\lambda = \dfrac{h}{m_ec}(1 - \cos\theta)$, which is zero straight ahead.` }].filter((e) => Math.abs(e.value - d) > 0.02 * d),
          hints: [t`$\Delta\lambda = \dfrac{h}{m_ec}(1 - \cos\theta)$ with $h/m_ec = ${fmt(LC, 4)}$ pm.`, t`$\cos ${th}° = ${fmt(Math.cos(th * Math.PI / 180), 4)}$.`],
          teach: 'The Compton shift grows from zero straight ahead to 4.85 pm straight back, whatever the X-rays’ wavelength.',
          explain: t`$\Delta\lambda = ${fmt(LC, 4)}\times(1 - ${fmt(Math.cos(th * Math.PI / 180), 4)}) = ${fmt(d, 3)}$ pm.`,
          visual: scene({ source: 'mo', theta: th }),
        };
      },
    }),
    num({
      id: 'compton-edge', difficulty: 2,
      gen(r) {
        const [E, what] = r.pick([[661.657, 'cesium-137 (661.7 keV)'], [1173.228, 'cobalt-60 (1173.2 keV)'], [1332.492, 'cobalt-60 (1332.5 keV)'], [1274.537, 'sodium-22 (1274.5 keV)']]);
        const E2 = scatteredKeV(E, 180), K = E - E2;
        return {
          prompt: t`A gamma-ray detector records the photons of ${what}. Some photons Compton-scatter off an electron in the detector and escape, leaving behind only the electron’s kinetic energy. What is the largest energy such an electron can carry, in keV? (It happens for backscatter, $\theta = 180°$; $m_ec^2 = 511.0$ keV.)`,
          answer: K, units: 'keV', tol: { rel: 0.005 },
          errors: [{ value: E2, feedback: 'That is the backscattered photon’s energy; the electron gets the rest, E − E′.' }, { value: E, feedback: 'The photon cannot give the electron all its energy in a Compton collision: momentum must be conserved too.' }],
          hints: [t`At 180°, $E' = \dfrac{E}{1 + 2E/m_ec^2}$ (from $\Delta\lambda = 2h/m_ec$, written in energies).`, t`The electron’s energy is $K = E - E'$.`],
          teach: 'A backscattered photon hands the electron the most energy it can: the Compton edge of a gamma-ray spectrum.',
          explain: t`$E' = \dfrac{${E}}{1 + 2\times${E}/511.0} = ${fmt(E2, 4)}$ keV, so $K = ${E} - ${fmt(E2, 4)} = ${fmt(K, 4)}$ keV. Detectors show a sharp “Compton edge” at this energy in every gamma-ray spectrum — a fingerprint of the photon’s momentum.`,
          visual: scene({ lambda: pmOf(E), theta: 180 }),
        };
      },
    }),
    mcq({
      id: 'visible-light', difficulty: 2,
      prompt: 'Light scatters off electrons all the time. Why did no one notice the Compton shift until X-rays were used?',
      choices: [
        'The shift, at most 4.85 pm, is only a few parts per million of a visible wavelength',
        'Visible photons carry no momentum',
        'Visible light cannot scatter off electrons',
        'The shift grows with wavelength, so for visible light it is too large to recognise',
      ],
      answer: 0,
      why: {
        1: 'Every photon carries momentum p = h/λ; visible photons just carry much less than X-ray photons.',
        2: 'It does — that is why the sky is blue (scattering by molecules) and how lasers can push on single electrons.',
        3: 'The shift depends only on the angle, not on the wavelength: the same few picometres for any light.',
      },
      hints: ['Does Δλ depend on λ?', 'Compare 4.85 pm with 500 nm.'],
      teach: 'Δλ is the same few picometres for every wavelength, so only short-wavelength X-rays and gamma rays show a noticeable fractional shift.',
      explain: t`The shift is at most $2h/m_ec = ${fmt(2 * LC, 3)}$ pm for any light. Against 500 nm that is a fraction $${tex(2 * LC / 500e3, 2)}$; against 71 pm X-rays it is about 7%.`,
      visual: scene({ source: 'green', theta: 90 }, 'Green light scattering at 90°: the scattered wave’s stretch is far too small to see.'),
    }),
    mcq({
      id: 'which-longest', difficulty: 2,
      prompt: 'X-rays of one wavelength scatter off a carbon target in all directions. Which scattered X-rays have the longest wavelength?',
      choices: ['Those scattered straight back (θ = 180°)', 'Those scattered straight ahead (θ near 0)', 'Those scattered sideways (θ = 90°)', 'All of them: the shift is the same in every direction'],
      answer: 0,
      why: {
        1: 'Straight ahead the photon barely touches the electron: 1 − cos θ is near zero, and so is the shift.',
        2: 'At 90° the shift is h/mₑc — only half the maximum.',
        3: 'The shift depends on angle through (1 − cos θ).',
      },
      hints: [t`Where is $1 - \cos\theta$ largest?`],
      teach: 'The harder the bounce, the more momentum the electron takes and the longer the scattered wavelength: backscatter loses the most.',
      explain: t`$1 - \cos\theta$ is largest, 2, at $\theta = 180°$: a head-on bounce, where the electron recoils straight ahead with the most energy and the photon comes back with $\lambda + ${fmt(2 * LC, 3)}$ pm.`,
      visual: scene({ source: 'mo', theta: 45 }, 'One scattering at 45°, with the momentum triangle on the right. Wavelengths magnified; momenta to scale.'),
    }),
    num({
      id: 'electron-energy', difficulty: 3,
      gen(r) {
        const [pm, th] = r.pick([[20, 120], [50, 90], [10, 60], [30, 150], [15, 90]]);
        const s = scatter(pm, th);
        return {
          prompt: t`X-rays of wavelength ${pm} pm scatter off free electrons through ${th}°. How much kinetic energy does each struck electron receive, in keV?`,
          answer: s.K, units: 'keV', tol: { rel: 0.01 },
          errors: [{ value: s.E, feedback: 'That is the whole photon energy. The electron gets only the difference E − E′.' }, { value: s.dlam, feedback: 'That is the shift in pm. Convert both wavelengths to energies, then subtract.' }],
          hints: [t`$\lambda' = \lambda + ${fmt(LC, 4)}(1 - \cos ${th}°)$ pm.`, t`$E = 1239.8/\lambda$ and $E' = 1239.8/\lambda'$ in keV (wavelengths in pm); $K = E - E'$.`],
          teach: 'Energy conservation: the electron’s kinetic energy is the energy the photon lost, E − E′.',
          explain: t`$\lambda' = ${pm} + ${fmt(s.dlam, 4)} = ${fmt(s.lam2, 4)}$ pm. $E = ${fmt(s.E, 4)}$ keV, $E' = ${fmt(s.E2, 4)}$ keV, so $K = ${fmt(s.K, 3)}$ keV.`,
          visual: scene({ lambda: pm, theta: th }),
        };
      },
    }),
    mcq({
      id: 'two-peaks', difficulty: 3,
      prompt: 'Compton’s spectra of X-rays scattered by carbon showed two peaks: one shifted by the predicted amount, and one at the original wavelength. What produces the unshifted peak?',
      choices: [
        'Photons scattered by electrons bound tightly to an atom, so the whole atom recoils — and the shift h/Mc for an atom is thousands of times smaller',
        'Photons that passed straight through the carbon without scattering',
        'Photons scattered twice, whose two shifts cancelled',
        'The classical part of the X-ray wave, which never interacts with electrons',
      ],
      answer: 0,
      why: {
        1: 'The detector looks at 90° from the beam: only scattered photons arrive there.',
        2: 'Every Compton scattering lengthens the wavelength; shifts never cancel.',
        3: 'There is no separate classical part: the same photons make both peaks.',
      },
      hints: ['The formula has the mass of whatever recoils in the denominator.', t`Replace $m_e$ by the mass of a carbon atom, about $22\,000\,m_e$: what happens to the shift?`],
      teach: 'Δλ = h/(mc)(1 − cos θ) contains the mass of whatever recoils; a whole atom recoils almost not at all.',
      explain: t`For a tightly bound inner electron the X-ray effectively hits the whole carbon atom, about 22 000 times the electron’s mass, so the shift is about $${tex(LC / 21874, 2)}$ pm — invisible. Loosely bound outer electrons behave as free and give the full shift.`,
      visual: {
        type: 'graph',
        params: {
          x: [68, 78], y: [0, 1.25], aspect: 'wide', xlabel: 'wavelength (pm)', ylabel: 'X-rays detected', yticks: 0,
          curves: [{ fn: 'exp(-((x - 71.07)/0.45)^2) + 0.9*exp(-((x - 73.5)/0.6)^2)', color: 'accent' }],
          vlines: [{ x: 71.07, label: 'original 71.07 pm', color: 'ink3' }],
        },
        caption: 'Compton’s 1923 measurement at 90°, schematic: two peaks, one at the original wavelength and one shifted by about 2.4 pm. Heights and widths are illustrative, not his data.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pet', difficulty: 2, transfer: true,
      prompt: t`A PET scanner detects pairs of 511 keV photons from positron annihilation in a patient. Some photons Compton-scatter inside the body, which blurs the image. What energy does a 511 keV photon have after backscattering ($\theta = 180°$) from an electron? ($m_ec^2 = 511.0$ keV.)`,
      answer: scatteredKeV(MEC2_KEV, 180), units: 'keV', tol: { rel: 0.005 },
      errors: [{ value: MEC2_KEV - scatteredKeV(MEC2_KEV, 180), feedback: 'That is the electron’s share. The photon keeps E′.' }],
      hints: [t`$E' = \dfrac{E}{1 + (E/m_ec^2)(1 - \cos\theta)}$.`, t`Here $E = m_ec^2$ and $1 - \cos 180° = 2$.`],
      teach: 'Scattered photons lose energy in a known way, so scanners reject photons that arrive with too little — most of them scattered.',
      explain: t`$E' = \dfrac{511}{1 + 1\times2} = ${fmt(scatteredKeV(MEC2_KEV, 180), 4)}$ keV — exactly a third. PET scanners accept only photons near 511 keV, which throws away most scattered photons before they can blur the image.`,
      visual: scene({ source: 'ann', theta: 180 }),
    }),
    num({
      id: 'cp-shift', difficulty: 2,
      prompt: t`X-rays of wavelength 50.0 pm scatter off free electrons through 60°. What is the scattered wavelength, in pm?`,
      answer: 50 + shiftPm(60), units: 'pm', tol: { rel: 0.001 },
      errors: [{ value: shiftPm(60), feedback: 'That is only the shift. Add it to the original 50.0 pm.' }, { value: 50 - shiftPm(60), feedback: 'Scattering lengthens the wavelength: add the shift.' }],
      hints: [t`$\lambda' = \lambda + \dfrac{h}{m_ec}(1 - \cos 60°)$.`],
      teach: 'λ′ = λ + (h/mₑc)(1 − cos θ).',
      explain: t`$\Delta\lambda = ${fmt(LC, 4)}\times(1 - 0.5) = ${fmt(shiftPm(60), 4)}$ pm, so $\lambda' = ${fmt(50 + shiftPm(60), 4)}$ pm.`,
      visual: scene({ lambda: 50, theta: 60 }),
    }),
    mcq({
      id: 'cp-what-changes', difficulty: 2,
      prompt: 'When a photon Compton-scatters off a free electron at rest, which statement is true?',
      choices: [
        'It loses energy, so its wavelength gets longer — and it still travels at c',
        'It slows down, which is why its wavelength gets longer',
        'It gains energy from the collision',
        'Its energy is unchanged; only its direction changes',
      ],
      answer: 0,
      why: {
        1: 'A photon always moves at c. Its energy E = hc/λ falls, so λ rises — not its speed.',
        2: 'The electron starts at rest, so the photon can only give energy, never gain it.',
        3: 'The recoiling electron carries off energy, so the photon must lose some (except straight ahead, where nothing happens).',
      },
      hints: ['The electron starts at rest and ends up moving. Where did its energy come from?'],
      teach: 'In Compton scattering the photon gives some of its energy to the electron: E = hc/λ falls and λ grows, while the photon’s speed stays c.',
      explain: 'Energy conservation: the electron’s kinetic energy came from the photon, whose energy E = hc/λ therefore drops. A photon cannot slow down, so the loss shows up as a longer wavelength.',
      visual: scene({ source: 'mo', theta: 120 }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §6.3 The Compton effect', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-3-the-compton-effect' },
    { label: 'Compton (1923), A quantum theory of the scattering of X-rays by light elements, Phys. Rev. 21, 483', url: 'https://doi.org/10.1103/PhysRev.21.483' },
    { label: 'CODATA 2022 recommended values (NIST): the electron Compton wavelength', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
