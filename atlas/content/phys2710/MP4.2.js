// X-rays and Compton scattering — an X-ray tube’s bremsstrahlung continuum
// with its Duane–Hunt cutoff λmin = hc/eV and the target’s characteristic
// lines; Bragg’s law 2d sin θ = nλ, which measures them; and the Compton
// shift Δλ = (h/mₑc)(1 − cos θ) derived from conservation of four-momentum
// (lesson MP3.3). Builds on phys2220.Q1.2 without repeating its examples.
// Every number is computed here or in model/qm-compton.js.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, QE, HC_EVNM, MEC2 } from './_constants.js';
import { seg, label, frame, r6 } from './_diagrams.js';
import { LAMBDA_C_PM, XRAY, kalphaPm, CRYSTAL } from './_quanta.js';

const t = String.raw;
const HC = HC_EVNM;                                  // eV nm = keV pm
const MEC2_KEV = MEC2 * 1000;
const DEG = Math.PI / 180;
const lamMin = (kV) => HC / kV;                      // pm, for a tube voltage in kV
const scatteredKeV = (E, th) => E / (1 + (E / MEC2_KEV) * (1 - Math.cos(th * DEG)));
const braggDeg = (lam, d, n = 1) => Math.asin((n * lam) / (2 * d)) / DEG;

// The tube targets: Kα (Kα₁ and Kα₂ unresolved for molybdenum), Kβ, the K edge,
// and the reference voltage at which the continuum’s peak is drawn 1 unit high.
const TUBE = {
  mo: { lines: [[kalphaPm('mo'), 1], [HC / XRAY.mo.kb1, 0.2]], edge: XRAY.mo.edge, ref: 35, H0: 3.2, span: 30, w: 0.6, x: [0, 130] },
  w: { lines: [[HC / XRAY.w.ka1, 1], [HC / XRAY.w.ka2, 0.55], [HC / XRAY.w.kb1, 0.3]], edge: XRAY.w.edge, ref: 100, H0: 3, span: 50, w: 0.22, x: [0, 70] },
};
/** The spectrum’s expression (per unit wavelength, x in pm) for a voltage V — a number or a slider key. */
function spectrumFn(target, V) {
  const T = TUBE[target], kc = r6(4 * lamMin(T.ref) ** 2), v = `(${V})`;
  const cont = `${kc}*max(0, x*${v}/${r6(HC)} - 1)/x^2`;
  const lines = T.lines.map(([lam, rel]) => `${r6(T.H0 * rel)}*(max(0, ${v} - ${r6(T.edge)})/${T.span})^1.5*exp(-((x - ${r6(lam)})/${T.w})^2)`);
  return [cont, ...lines].join(' + ');
}
/** A static tube spectrum at one voltage; `ask` hides the numbers on the wavelength axis. */
function tubeSpectrum(target, kV, { ask = false, caption } = {}) {
  const T = TUBE[target];
  const peak = Math.max((kV / T.ref) ** 2, T.H0 * (Math.max(0, kV - T.edge) / T.span) ** 1.5);
  return {
    type: 'graph',
    params: {
      x: T.x, y: [0, r6(1.22 * peak)], aspect: 'wide', xlabel: 'wavelength (pm)', ylabel: 'intensity', yticks: 0, axesAt: 'edge',
      ...(ask ? { xticks: 0 } : {}),
      curves: [{ fn: spectrumFn(target, kV), domain: [0.5, T.x[1]], color: 'accent', width: 2.2 }],
      vlines: [{ x: r6(lamMin(kV)), label: ask ? 'λmin = ?' : 'λmin', color: 'gold' }],
    },
    caption: caption ?? `The X-ray spectrum of a ${XRAY[target].name} target at ${kV} kV: Kramers’ model of the continuum, ${kV > T.edge ? 'with the target’s K lines broadened for visibility' : 'below the voltage that excites the K lines'}. Heights are illustrative.`,
  };
}

/**
 * Bragg reflection from planes of atoms, spacing d: two parallel rays at
 * glancing angle θ; the lower one travels the extra path 2d sin θ (warn).
 */
function bragg(thDeg, { caption, numbers = true } = {}) {
  const s = Math.sin(thDeg * DEG), c = Math.cos(thDeg * DEG), L = 3.4;
  const atoms = [];
  for (let row = 0; row < 3; row++) for (let i = -3; i <= 3; i++) atoms.push({ x: i * 1.15, y: -row, r: 4.5, color: 'ink3' });
  const A = [-s * c, -1 + s * s], B = [s * c, -1 + s * s];
  return {
    type: 'graph',
    params: frame([-4, 4.4], [-2.5, 2.2], {
      aspect: 'wide',
      curves: [
        seg(-L * c, L * s, 0, 0, 'violet', 2), seg(0, 0, L * c, L * s, 'violet', 2),
        seg(-L * c - 0.4 * c, -1 + (L + 0.4) * s, 0, -1, 'violet', 2), seg(0, -1, (L + 0.4) * c, -1 + (L + 0.4) * s, 'violet', 2),
        seg(0, 0, A[0], A[1], 'ink4', 1.2, true), seg(0, 0, B[0], B[1], 'ink4', 1.2, true),
        seg(A[0], A[1], 0, -1, 'warn', 3.2), seg(0, -1, B[0], B[1], 'warn', 3.2),
        seg(-3.7, 0, 3.7, 0, 'ink4', 1, true), seg(-3.7, -1, 3.7, -1, 'ink4', 1, true), seg(-3.7, -2, 3.7, -2, 'ink4', 1, true),
        seg(3.95, 0, 3.95, -1, 'ink2', 1.6),
      ],
      points: [
        ...atoms,
        label(-L * c, L * s, 'X-rays in', 'violet', -6, -10, 'right'), label(L * c, L * s, 'reflected', 'violet', 8, -8),
        label(-1.15, 0.05, 'θ', 'ink', -4, -12, 'center'),
        label(0.2, -1.25, numbers ? 'extra path: 2d sin θ' : 'extra path', 'warn', 0, 6, 'center'),
        label(3.95, -0.5, 'd', 'ink2', 8, 0),
      ],
    }),
    caption: caption ?? 'Bragg reflection: X-rays reflected from neighbouring planes of atoms (spacing d) reinforce when the lower ray’s extra path, 2d sin θ, is a whole number of wavelengths. The glancing angle θ is measured from the planes. Not to scale.',
  };
}

/** The Compton collision from model/qm-compton.js, with the answer-bearing numbers hidden. */
const collision = (pm, theta, caption) => ({ type: 'qm-compton', params: { lambda: r6(pm), theta, graph: false, controls: false, readout: false, hide: ['lam2', 'E2', 'K', 'phi'] }, ...(caption ? { caption } : {}) });

/** Energy against momentum (both in MeV): the electron’s mass hyperbola, and a photon added to an electron at rest. */
const ePc = {
  type: 'graph',
  params: {
    x: [-0.3, 4.7], y: [0, 2.4], aspect: 'wide', equal: true, xlabel: 'pc (MeV)', ylabel: 'E (MeV)',
    curves: [{ fn: `sqrt(x^2 + ${r6(MEC2 ** 2)})`, domain: [0, 4.7], color: 'accent', width: 2.6, label: 'every free electron: E² = (pc)² + (mc²)²', labelAt: 1.25, labelDx: 10, labelDy: 14 }],
    arrows: [{ from: [0, r6(MEC2)], to: [1, r6(MEC2 + 1)], color: 'gold', label: 'add a 1 MeV photon', labelDx: 8, labelDy: -6 }],
    points: [{ x: 0, y: r6(MEC2), color: 'accent', r: 5, label: 'electron at rest', labelDx: 8, labelDy: 12 }, { x: 1, y: r6(MEC2 + 1), color: 'bad', r: 5 }],
  },
  caption: 'Energy against momentum. A free electron must lie on the blue hyperbola. Adding a photon (energy = momentum × c, a 45° step) to an electron at rest lands above it, at a point no electron can occupy.',
};

/** COMPTEL’s two detector layers: a gamma ray scatters in the upper one and is absorbed in the lower one. Schematic. */
const comptel = (() => {
  const P = [0, 2.25], u = [0.5547, -0.8321], o = [Math.cos(-86.3 * DEG), Math.sin(-86.3 * DEG)], el = [Math.cos(-8 * DEG), Math.sin(-8 * DEG)];
  const end = 3.5 / -o[1];
  return {
    type: 'graph',
    params: frame([-4.2, 5.2], [-2.0, 4.8], {
      aspect: 'wide',
      shade: [{ fn: '2.5', lower: '2', from: -3, to: 3, color: 'accent', alpha: 0.25 }, { fn: '-1', lower: '-1.5', from: -3.5, to: 3.5, color: 'gold', alpha: 0.25 }],
      curves: [
        seg(P[0] - 2.7 * u[0], P[1] - 2.7 * u[1], P[0], P[1], 'violet', 2.2), seg(P[0], P[1], P[0] + 1.6 * u[0], P[1] + 1.6 * u[1], 'ink4', 1.2, true),
        seg(P[0], P[1], P[0] + end * o[0], P[1] + end * o[1], 'warn', 2.2),
      ],
      arrows: [{ from: P, to: [P[0] + 1.1 * el[0], P[1] + 1.1 * el[1]], color: 'accent', width: 2.4 }],
      points: [
        { x: P[0], y: P[1], r: 4, color: 'ink' }, { x: r6(P[0] + end * o[0]), y: -1.25, r: 4, color: 'ink' },
        label(3, 2.25, 'upper detector: the electron’s energy E₁', 'accent', 0, -22, 'right'),
        label(-3.5, -1.25, 'lower detector: the photon’s energy E₂', 'gold', 0, 22, 'left'),
        label(P[0] - 2.7 * u[0], P[1] - 2.7 * u[1], 'gamma ray in', 'violet', -6, -8, 'right'),
        label(0.55, 1.15, 'θ = ?', 'ink', 6, 0),
        label(0.1, -0.2, 'scattered photon', 'warn', 8, 0),
      ],
    }),
    caption: 'COMPTEL’s principle: a gamma ray scatters off an electron in the upper detector and the scattered photon is absorbed in the lower one, 1.5 m below. Each layer measures one energy. Schematic, not to scale.',
  };
})();

// Compton’s spectrometer: the Mo Kα line read off a calcite crystal, before and after scattering
const CAL = CRYSTAL.calcite.d;

export default lesson({
  id: 'phys2710.MP4.2',
  title: 'X-rays and Compton scattering',
  minutes: 15, difficulty: 3,
  intro: t`Electrons slammed into a metal target at tens of kilovolts make X-rays in two ways. Braking in the fields of the nuclei gives a **continuous spectrum** — bremsstrahlung — that stops sharply at the shortest wavelength one electron’s whole energy can make, $\lambda_{\min} = hc/eV$ (the Duane–Hunt law). Knocking out inner electrons gives **sharp lines** that belong to the target metal. A crystal sorts X-rays by wavelength through Bragg’s law, $2d\sin\theta = n\lambda$. With such a spectrometer Arthur Compton found in 1923 that X-rays scattered by carbon come out longer in wavelength, by an amount that depends only on the angle:

$$\Delta\lambda = \lambda' - \lambda = \frac{h}{m_ec}\,(1 - \cos\theta)$$

It is exactly what conservation of four-momentum demands when a photon collides with a free electron.

> The first look was [Photons and Compton scattering](#/lesson/phys2220.Q1.2). Here: where the X-rays come from, how their wavelengths are read, and the derivation.`,
  symbols: [
    { tex: '\\lambda,\\ \\lambda\'', text: 'the wavelengths of the incoming and the scattered photon, in m (for X-rays usually pm: $1\\ \\text{pm} = 10^{-12}$ m)' },
    { tex: 'h', text: t`Planck’s constant, $6.626\times10^{-34}$ J s` },
    { tex: 'm_e', text: t`the electron’s mass, $9.109\times10^{-31}$ kg — its rest energy $m_ec^2$ is 511.0 keV` },
    { tex: 'c', text: t`the speed of light, $2.998\times10^{8}$ m/s` },
    { tex: '\\theta', text: 'the scattering angle between the incoming and the scattered photon: 0 is straight on, 180° straight back' },
    { tex: 'h/m_ec', text: t`the electron’s Compton wavelength, ${fmt(LAMBDA_C_PM, 4)} pm: the shift at 90°` },
  ],
  why: 'X-ray tubes and Bragg spectrometers are how the structures of atoms, crystals and DNA were read; the Compton formula is the first collision worked with four-momentum, the same algebra that runs gamma-ray telescopes and particle detectors.',
  visual: {
    type: 'graph',
    title: 'The spectrum of a molybdenum X-ray tube',
    lead: t`Intensity against wavelength for a tube with a molybdenum target. The smooth part is bremsstrahlung; it can never reach below $\lambda_{\min} = hc/eV$, where one electron gives all its energy $eV$ to one photon. The spikes are molybdenum’s K lines.`,
    tasks: [
      'Raise V from 15 to 30 kV: the cutoff λmin slides to half its wavelength — hc/eV, the Duane–Hunt law.',
      'Cross 20.0 kV: the K lines appear at 63.2 and 71.1 pm. Push on to 50 kV — they grow, but never move: they belong to molybdenum, not to the voltage.',
      'Compare the continuum at 25 and 50 kV: doubling the voltage roughly quadruples its height.',
    ],
    params: {
      x: [0, 130], y: [0, 3.4], aspect: 'wide', xlabel: 'wavelength (pm)', ylabel: 'intensity', yticks: 0, axesAt: 'edge',
      sliders: [{ key: 'V', label: 'Tube voltage $V$', min: 10, max: 50, step: 0.5, value: 35, unit: '\\mathrm{kV}', explain: 'Each electron reaches the target with kinetic energy $eV$.' }],
      curves: [{ fn: spectrumFn('mo', 'V'), domain: [0.5, 130], color: 'accent', width: 2.2 }],
      vlines: [{ x: `${r6(HC)}/V`, label: 'λmin', color: 'gold' }],
      readouts: [{ label: '$\\lambda_{\\min} = hc/eV$', expr: `${r6(HC)}/V`, unit: '\\mathrm{pm}', digits: 4 }, { label: 'largest photon energy $eV$', expr: 'V', unit: '\\mathrm{keV}', digits: 3 }],
    },
    caption: 'Kramers’ 1923 model of the continuum (per unit wavelength) and molybdenum’s Kα (its doublet unresolved) and Kβ lines, broadened for visibility. Heights are illustrative; real tubes also absorb the longest wavelengths in the target and the window.',
  },
  example: {
    prompt: t`A photon of energy $E$ strikes a free electron at rest and leaves at angle $\theta$ with energy $E'$. Derive the Compton formula from conservation of energy and momentum, then find $E'$ for a 1.00 MeV gamma ray scattered through 90°.`,
    visual: { type: 'qm-compton', params: { lambda: r6(HC / 1000), theta: 90, graph: false, controls: false }, caption: 'A 1.00 MeV gamma ray scattered through 90°. Wavelengths are hugely magnified but drawn in their true ratio; the momentum arrows on the right are to scale and close into a triangle.' },
    steps: [
      { label: 'Four-momenta', text: t`Before: the photon has energy $E$ and momentum $\vec p$ with $|\vec p| = E/c$; the electron has energy $m_ec^2$ and no momentum. After: the photon has $E'$ and $\vec p\,'$ at angle $\theta$; the electron has $E_e$ and $\vec p_e$. Conserving four-momentum means conserving both energy and momentum.` },
      { label: 'Isolate the electron', text: t`$E_e = E - E' + m_ec^2$ and $\vec p_e = \vec p - \vec p\,'$. By the law of cosines, $(p_ec)^2 = E^2 + E'^2 - 2EE'\cos\theta$.` },
      { label: 'Use the invariant', text: t`Every free particle has $E^2 - (pc)^2 = (mc^2)^2$ (lesson MP3.3). For the electron afterwards:
$$(E - E' + m_ec^2)^2 - (E^2 + E'^2 - 2EE'\cos\theta) = (m_ec^2)^2.$$
This one equation eliminates everything about the electron.` },
      { label: 'Simplify', text: t`Expanding, $E^2$, $E'^2$ and $(m_ec^2)^2$ cancel, leaving $-2EE' + 2(E - E')\,m_ec^2 + 2EE'\cos\theta = 0$, that is $(E - E')\,m_ec^2 = EE'(1 - \cos\theta)$.` },
      { label: 'In wavelengths', text: t`Divide by $EE'm_ec^2$: $\;\dfrac1{E'} - \dfrac1E = \dfrac{1 - \cos\theta}{m_ec^2}$. Multiply by $hc$ and use $hc/E = \lambda$: $\;\lambda' - \lambda = \dfrac{h}{m_ec}(1 - \cos\theta)$.` },
      { label: 'A gamma ray at 90 degrees', text: t`$\dfrac{1}{E'} = \dfrac{1}{1.00\ \text{MeV}} + \dfrac{1}{0.511\ \text{MeV}}$, so $E' = ${fmt(scatteredKeV(1000, 90) / 1000, 3)}$ MeV: the gamma ray keeps only a third of its energy, while a 17.4 keV molybdenum X-ray scattered through 90° keeps ${fmt(100 * scatteredKeV(17.445, 90) / 17.445, 2)}%.` },
      { label: 'Sense check', text: t`$h/m_ec$ is a length, as a wavelength shift must be, and $E$ itself has dropped out: every photon gets the same shift at a given angle. Only the *fraction* of its energy a photon loses grows with $E$, which is why the effect needs X-rays or gamma rays to be seen.` },
    ],
    answer: t`$\lambda' - \lambda = \dfrac{h}{m_ec}(1 - \cos\theta)$; the 1.00 MeV gamma ray leaves at 90° with $E' = ${fmt(scatteredKeV(1000, 90) / 1000, 3)}$ MeV.`,
  },
  practice: [
    num({
      id: 'duane-hunt', difficulty: 1,
      gen(r) {
        const [kV, target, what] = r.pick([[28, 'mo', 'a mammography tube, which images soft tissue at 28 kV'], [35, 'mo', 'a laboratory diffractometer’s tube at 35 kV'], [45, 'mo', 'a tube run at 45 kV'], [70, 'w', 'a dental X-ray tube at 70 kV'], [120, 'w', 'a CT scanner’s tube at 120 kV']]);
        return {
          prompt: t`What is the shortest wavelength in the X-rays from ${what}, in pm?`,
          answer: lamMin(kV), units: 'pm', tol: { rel: 0.005 },
          errors: [{ value: lamMin(kV) * 2, feedback: t`The continuum’s cutoff is at $hc/eV$; its peak (in Kramers’ model) is near twice that.` }],
          hints: [t`One electron can give at most its whole kinetic energy $eV = ${kV}$ keV to one photon.`, t`$\lambda_{\min} = hc/eV$, with $hc = 1239.8$ keV pm.`],
          teach: 'The shortest wavelength from an X-ray tube is set by the voltage alone: λmin = hc/eV.',
          explain: t`$\lambda_{\min} = \dfrac{1239.8\ \text{keV pm}}{${kV}\ \text{keV}} = ${fmt(lamMin(kV), 4)}$ pm. Whatever the target, no photon can carry more than one electron’s energy.`,
          visual: tubeSpectrum(target, kV, { ask: true }),
        };
      },
    }),
    num({
      id: 'h-from-cutoff', difficulty: 2,
      gen(r) {
        const kV = r.pick([24, 30, 39]), lam = +(lamMin(kV) * (1 + r.pick([-0.004, 0.003, 0.006]))).toFixed(2);
        const h = (QE * kV * 1e3 * lam * 1e-12) / C;
        return {
          prompt: t`In 1915 William Duane and Franklin Hunt used the short-wavelength cutoff to measure Planck’s constant. Suppose a tube run at ${kV}.0 kV gives a continuum that stops at ${lam} pm. What value of $h$ does this give, in J s?`,
          answer: h, units: 'J s', tol: { rel: 0.005 },
          hints: [t`At the cutoff one electron’s whole energy becomes one photon: $eV = hc/\lambda_{\min}$.`, t`$h = \dfrac{eV\lambda_{\min}}{c} = \dfrac{(1.602\times10^{-19}\ \text{C})(${kV}.0\times10^{3}\ \text{V})(${lam}\times10^{-12}\ \text{m})}{2.998\times10^{8}\ \text{m/s}}$.`],
          teach: 'The Duane–Hunt cutoff turns a voltmeter and a crystal angle into Planck’s constant: h = eVλmin/c.',
          explain: t`$h = eV\lambda_{\min}/c = ${tex(h, 4)}$ J s — within ${fmt(Math.abs(h / 6.62607015e-34 - 1) * 100, 1)}% of the exact value. The Duane–Hunt method was for decades one of the best measurements of $h/e$.`,
          visual: tubeSpectrum('mo', kV, { ask: true, caption: `The tube’s spectrum at ${kV} kV: the continuum stops abruptly at λmin. Heights are illustrative.` }),
        };
      },
    }),
    num({
      id: 'bragg-angle', difficulty: 2,
      gen(r) {
        const [line, lam] = r.pick([['copper Kα (154.2 pm)', kalphaPm('cu')], ['molybdenum Kα (71.07 pm)', kalphaPm('mo')]]);
        const key = r.pick(['nacl', 'lif', 'si']), n = r.pick([1, 2]);
        const d = CRYSTAL[key].d, th = braggDeg(lam, d, n);
        return {
          prompt: t`X-rays of ${line} fall on a crystal of ${CRYSTAL[key].name}, spaced $d = ${d}$ pm. At what glancing angle θ (measured from the planes) is the ${n === 1 ? 'first' : 'second'}-order reflection?`,
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: [
            { value: Math.asin(Math.min(1, (n * lam) / d)) / DEG, feedback: t`The extra path is twice $d\sin\theta$ — down to the next plane and back up: $2d\sin\theta = n\lambda$.` },
            ...(n === 2 ? [{ value: braggDeg(lam, d, 1), feedback: 'That is the first-order angle; second order needs 2λ of extra path.' }] : []),
            { value: 90 - th, feedback: 'θ in Bragg’s law is measured from the planes, not from their normal.' },
          ],
          hints: [t`Bragg’s law: $2d\sin\theta = n\lambda$.`, t`$\sin\theta = \dfrac{${n} \times ${fmt(lam, 4)}}{2 \times ${d}}$.`],
          teach: 'Reflections from successive planes reinforce when 2d sin θ = nλ, with θ the glancing angle from the planes.',
          explain: t`$\sin\theta = ${n}\times${fmt(lam, 4)}/(2\times${d}) = ${fmt(Math.sin(th * DEG), 4)}$, so $\theta = ${fmt(th, 4)}°$. The detector sits at $2\theta = ${fmt(2 * th, 4)}°$ from the incoming beam.`,
          visual: bragg(22, { caption: 'Bragg reflection from planes of atoms spaced d apart; the lower ray travels an extra 2d sin θ. The angle drawn is not the answer.' }),
        };
      },
    }),
    mcq({
      id: 'why-2d', difficulty: 2,
      prompt: t`Why is Bragg’s condition $2d\sin\theta = n\lambda$ and not $d\sin\theta = n\lambda$?`,
      choices: [
        t`The ray reflected from the lower plane travels $d\sin\theta$ extra on the way down to it and another $d\sin\theta$ on the way back up`,
        'The X-ray reflects twice inside the crystal before it leaves',
        'Each plane holds two layers of atoms',
        t`The factor 2 converts the glancing angle $\theta$ into the scattering angle $2\theta$`,
      ],
      answer: 0,
      why: {
        1: 'Each ray reflects once, from one plane; the two rays differ only in which plane they reach.',
        2: 'The spacing d is already the distance between whole planes; nothing in the condition counts atoms.',
        3: t`The scattering angle is indeed $2\theta$, but a sine of a doubled angle is not twice a sine; the 2 multiplies the path, $d\sin\theta$.`,
      },
      hints: ['Follow the lower ray: it must go farther both before and after it reflects. How much farther each way?'],
      teach: 'In Bragg reflection the lower ray’s extra path is d sin θ going in plus d sin θ coming out.',
      explain: t`Drop perpendiculars from the upper atom onto the lower ray (the dashed lines): the extra path is $d\sin\theta$ before the reflection and $d\sin\theta$ after, $2d\sin\theta$ in all. A surface grating, with only one row of atoms, would give $d\sin\theta$ — which is how Davisson and Germer first read their electron data (lesson MP6.1).`,
      visual: bragg(28),
    }),
    order({
      id: 'compton-derivation', difficulty: 3,
      prompt: 'Put the steps of the Compton derivation in order.',
      items: [
        t`Conserve energy and momentum: $E + m_ec^2 = E' + E_e$ and $\vec p = \vec p\,' + \vec p_e$.`,
        t`Isolate the electron: $E_e = E - E' + m_ec^2$, and $(p_ec)^2 = E^2 + E'^2 - 2EE'\cos\theta$.`,
        t`Eliminate the electron with its invariant, $E_e^2 - (p_ec)^2 = (m_ec^2)^2$.`,
        t`Expand and cancel: $(E - E')\,m_ec^2 = EE'(1 - \cos\theta)$.`,
        t`Divide by $EE'm_ec^2$ and write $hc/E = \lambda$: $\lambda' - \lambda = \frac{h}{m_ec}(1 - \cos\theta)$.`,
      ],
      hints: ['Start from the conservation laws, and finish with wavelengths.', 'The electron’s energy and momentum must both be written in terms of the photons before the invariant can remove them.'],
      teach: 'Conserve four-momentum, isolate the particle you do not care about, and square it away with its invariant mass.',
      explain: 'The derivation conserves energy and momentum, writes the unobserved electron’s energy and momentum in terms of the photons, removes them with E² − (pc)² = (mc²)², and only then converts energies to wavelengths.',
      visual: collision(HC / 200, 60, 'A 200 keV photon scattered through 60°: the momentum arrows on the right, to scale, close into a triangle — momentum conservation drawn.'),
    }),
    num({
      id: 'gamma-scatter', difficulty: 2,
      gen(r) {
        const [E, what] = r.pick([[1460.8, 'the 1460.8 keV gamma ray of potassium-40, present in every rock and every human body'], [2614.5, 'the 2614.5 keV gamma ray of thallium-208, from the thorium decay chain'], [4438, 'the 4438 keV gamma ray of excited carbon-12, seen from solar flares'], [6129, 'the 6129 keV gamma ray of excited oxygen-16']]);
        const th = r.pick([30, 60, 90, 120]), E2 = scatteredKeV(E, th);
        return {
          prompt: t`Take a photon of ${what}. It Compton-scatters off an electron through ${th}°. What energy does the scattered photon have, in keV? ($m_ec^2 = 511.0$ keV.)`,
          answer: E2, units: 'keV', tol: { rel: 0.005 },
          errors: [{ value: E - E2, feedback: 'That is the electron’s share. The photon keeps E′.' }, { value: E * (1 - (E / MEC2_KEV) * (1 - Math.cos(th * DEG))), feedback: t`Invert correctly: $1/E' = 1/E + (1 - \cos\theta)/m_ec^2$, not $E' = E[1 - (E/m_ec^2)(1 - \cos\theta)]$.` }].filter((e) => Math.abs(e.value - E2) > 0.02 * E2),
          hints: [t`$\dfrac1{E'} = \dfrac1E + \dfrac{1 - \cos\theta}{m_ec^2}$.`, t`$E' = \dfrac{E}{1 + (E/m_ec^2)(1 - \cos ${th}°)}$, with $E/m_ec^2 = ${fmt(E / MEC2_KEV, 4)}$.`],
          teach: 'At gamma-ray energies the Compton formula takes a large fraction of the energy: E′ = E/[1 + (E/mₑc²)(1 − cos θ)].',
          explain: t`$E' = \dfrac{${E}}{1 + ${fmt(E / MEC2_KEV, 4)}\times${fmt(1 - Math.cos(th * DEG), 4)}} = ${fmt(E2, 4)}$ keV — ${fmt(100 * E2 / E, 2)}% of the original. However high $E$ goes, a photon scattered through 90° leaves with less than $m_ec^2 = 511$ keV.`,
          visual: collision(HC / E, th),
        };
      },
    }),
    mcq({
      id: 'no-absorb', difficulty: 3,
      prompt: 'Why can a free electron scatter a photon but never absorb one completely?',
      choices: [
        'Energy and momentum cannot both be conserved: the electron would end up with more energy than its momentum allows a particle of its mass',
        'It can, but only if the photon carries exactly 511 keV',
        'A photon can only bounce off an electron; it can never give it energy',
        'Absorption needs the electron to be moving already',
      ],
      answer: 0,
      why: {
        1: 'No photon energy works: adding any photon to an electron at rest lands off the electron’s mass hyperbola.',
        2: 'In Compton scattering the photon does give the electron energy — the recoil — just never all of it.',
        3: 'In the electron’s own rest frame it is at rest, and there the argument applies unchanged.',
      },
      hints: ['Try it: electron at rest plus a photon of energy E. What are the total energy and momentum?', t`Check whether $E_\text{tot}^2 - (p_\text{tot}c)^2$ equals $(m_ec^2)^2$, as it must for a single electron.`],
      teach: 'A photon added to a free electron gives a total four-momentum whose invariant mass exceeds mₑ, so a lone electron cannot carry it.',
      explain: t`Afterwards the electron would have $E_\text{tot} = E + m_ec^2$ and $p_\text{tot}c = E$, so $E_\text{tot}^2 - (p_\text{tot}c)^2 = (m_ec^2)^2 + 2Em_ec^2 > (m_ec^2)^2$ — too much energy for its momentum. That is why the photoelectric effect needs a *bound* electron (the atom takes up the momentum) and why Compton scattering always leaves a photon.`,
      visual: ePc,
    }),
    num({
      id: 'compton-crystal', difficulty: 3,
      gen(r) {
        const th = r.pick([45, 90, 135, 180]);
        const l1 = kalphaPm('mo'), l2 = l1 + LAMBDA_C_PM * (1 - Math.cos(th * DEG));
        const d = (braggDeg(l2, CAL) - braggDeg(l1, CAL)) * 60;
        return {
          prompt: t`Compton read his wavelengths with a calcite crystal ($d = ${CAL}$ pm). Molybdenum Kα X-rays ($\lambda = ${fmt(l1, 4)}$ pm) scattered through ${th}° are shifted by the Compton formula. By how many arcminutes does the first-order Bragg angle of the shifted line exceed that of the unshifted one?`,
          answer: d, units: 'arcmin', tol: { rel: 0.02 },
          errors: [{ value: d * 2, feedback: 'That is the change in 2θ, the detector angle. The question asks about the glancing angle θ.' }],
          hints: [t`First $\lambda' = ${fmt(l1, 4)} + ${fmt(LAMBDA_C_PM, 4)}(1 - \cos ${th}°)$ pm.`, t`Then $\theta = \sin^{-1}(\lambda/2d)$ for each wavelength; subtract and multiply by 60 for arcminutes.`],
          teach: 'A shift of a few picometres moves a Bragg peak by only a fraction of a degree, which is why Compton needed a precise spectrometer.',
          explain: t`$\lambda' = ${fmt(l2, 4)}$ pm. $\theta = ${fmt(braggDeg(l1, CAL), 4)}°$ unshifted and $${fmt(braggDeg(l2, CAL), 4)}°$ shifted: a difference of $${fmt(d, 3)}$ arcminutes — less than half a degree, but easily resolved on a good crystal spectrometer.`,
          visual: {
            type: 'graph',
            params: {
              x: [6.2, 7.8], y: [0, 1.3], aspect: 'wide', xlabel: 'crystal angle θ', ylabel: 'X-rays counted', xticks: 0, yticks: 0, axesAt: 'edge',
              curves: [{ fn: `exp(-((x - ${r6(braggDeg(l1, CAL))})/0.05)^2) + 0.85*exp(-((x - ${r6(braggDeg(l2, CAL))})/0.07)^2)`, color: 'accent', width: 2.2 }],
              points: [label(braggDeg(l1, CAL), 1.08, 'unshifted', 'ink2', 0, -10, 'center'), label(braggDeg(l2, CAL), 0.93, 'shifted', 'accent', 18, -10, 'left')],
            },
            caption: 'What Compton’s ionization chamber recorded as he turned the crystal: the unshifted and the shifted peak. Schematic: widths and heights illustrative, angles unlabelled.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-comptel', difficulty: 3, transfer: true,
      gen(r) {
        const [E, what] = r.pick([[1808.7, 'the 1809 keV line of aluminium-26, made in massive stars and supernovae'], [1157, 'the 1157 keV line of titanium-44 from the supernova remnant Cassiopeia A']]);
        const E1 = r.pick([200, 300, 450, 600]), E2 = E - E1;
        const cosT = 1 - MEC2_KEV * (1 / E2 - 1 / E), th = Math.acos(cosT) / DEG;
        const sw = 1 - MEC2_KEV * (1 / E1 - 1 / E);
        return {
          prompt: t`The COMPTEL telescope on NASA’s Compton Gamma Ray Observatory caught each gamma ray twice: it Compton-scattered off an electron in an upper detector, which measured the electron’s energy $E_1$, and the scattered photon was absorbed in a lower one, which measured $E_2$. A photon of ${what} deposits $E_1 = ${E1}$ keV and $E_2 = ${fmt(E2, 4)}$ keV. Through what angle did it scatter, in degrees?`,
          answer: th, units: 'deg', tol: { rel: 0.01 },
          errors: Math.abs(sw) <= 1 && Math.abs(Math.acos(sw) / DEG - th) > 0.03 * th ? [{ value: Math.acos(sw) / DEG, feedback: t`The scattered photon carries $E' = E_2$; the electron took $E_1$. Swap them.` }] : [],
          hints: [t`The photon arrived with $E = E_1 + E_2$ and left with $E' = E_2$.`, t`$\cos\theta = 1 - m_ec^2\left(\dfrac1{E_2} - \dfrac1{E_1 + E_2}\right)$, with $m_ec^2 = 511.0$ keV.`],
          teach: 'Two energy measurements fix a Compton scattering angle, so each gamma ray’s direction is known to lie on a cone around the scattered photon’s path.',
          explain: t`$\cos\theta = 1 - 511.0\left(\dfrac{1}{${fmt(E2, 4)}} - \dfrac{1}{${E}}\right) = ${fmt(cosT, 4)}$, so $\theta = ${fmt(th, 3)}°$. The source therefore lies somewhere on a cone of that half-angle; many photons’ cones overlap at the source. COMPTEL mapped aluminium-26 across the Milky Way this way.`,
          visual: comptel,
        };
      },
    }),
    num({
      id: 'cp-cutoff-bragg', difficulty: 2,
      gen(r) {
        const kV = r.pick([20, 25, 30, 35]), d = CRYSTAL.lif.d, th = braggDeg(lamMin(kV), d);
        return {
          prompt: t`A tube runs at ${kV} kV, and its X-rays fall on a lithium fluoride crystal ($d = ${d}$ pm). Below what glancing angle does the crystal reflect no X-rays at all in first order?`,
          answer: th, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: Math.asin(lamMin(kV) / d) / DEG, feedback: t`Bragg’s law has $2d$: $\sin\theta = \lambda/2d$.` }],
          hints: [t`The shortest wavelength present is $\lambda_{\min} = hc/eV$; shorter wavelengths need smaller angles.`, t`$\sin\theta = \lambda_{\min}/2d$ with $\lambda_{\min} = 1239.8/${kV}$ pm.`],
          teach: 'The Duane–Hunt cutoff appears on a crystal spectrometer as a smallest Bragg angle below which nothing is reflected.',
          explain: t`$\lambda_{\min} = ${fmt(lamMin(kV), 4)}$ pm, so $\sin\theta = ${fmt(lamMin(kV), 4)}/${fmt(2 * d, 4)} = ${fmt(Math.sin(th * DEG), 4)}$ and $\theta = ${fmt(th, 3)}°$. Turning the crystal below this angle, the counts drop to zero — the way Duane and Hunt actually saw their cutoff.`,
          visual: bragg(25, { caption: 'Bragg reflection from planes spaced d apart. The angle drawn is not the answer.' }),
        };
      },
    }),
    mcq({
      id: 'cp-fraction', difficulty: 2,
      prompt: 'Photons of three kinds are scattered through 90° by free electrons: green light, 17 keV X-rays and 1 MeV gamma rays. Which statement is true?',
      choices: [
        'All three are shifted by the same 2.43 pm, but the gamma rays lose by far the largest fraction of their energy',
        'The gamma rays are shifted by the most picometres, because they carry the most energy',
        'All three lose the same fraction of their energy, because the shift does not depend on the wavelength',
        'Green light is shifted the most, because its wavelength is the longest',
      ],
      answer: 0,
      why: {
        1: t`$\Delta\lambda = (h/m_ec)(1 - \cos\theta)$ contains no $E$ and no $\lambda$: the shift in picometres is the same for all.`,
        2: t`The same $\Delta\lambda$ is a tiny fraction of 532 nm but a large fraction of 1.24 pm, so the energy fractions differ enormously.`,
        3: 'The shift does not grow with wavelength; it is the same 2.43 pm at 90° for every photon.',
      },
      hints: [t`Compare $\Delta\lambda$ with $\lambda$ for each: 532 nm, 71 pm and 1.24 pm.`],
      teach: 'The Compton shift Δλ is the same for every photon; the fractional shift Δλ/λ = (E/mₑc²)(1 − cos θ) grows with the photon’s energy.',
      explain: t`At 90° each shift is $h/m_ec = 2.43$ pm. For green light that is $${tex(LAMBDA_C_PM / 532e3, 2)}$ of the wavelength; for 17 keV X-rays about 3%; for a 1 MeV gamma ray ($\lambda = 1.24$ pm) it doubles the wavelength and more, so the photon keeps a third of its energy.`,
      visual: collision(HC / 1000, 90, 'A 1 MeV gamma ray scattered through 90°: its outgoing wave is visibly longer. Wavelengths magnified, in their true ratio.'),
    }),
  ],
  sources: [
    { label: 'Compton (1923), A quantum theory of the scattering of X-rays by light elements, Phys. Rev. 21, 483', url: 'https://doi.org/10.1103/PhysRev.21.483' },
    { label: 'Duane & Hunt (1915), On X-ray wave-lengths, Phys. Rev. 6, 166', url: 'https://doi.org/10.1103/PhysRev.6.166' },
    { label: 'W. H. & W. L. Bragg (1913), The reflection of X-rays by crystals, Proc. R. Soc. A 88, 428', url: 'https://doi.org/10.1098/rspa.1913.0040' },
    { label: 'X-ray Data Booklet (LBNL): emission-line energies and absorption edges', url: 'https://xdb.lbl.gov/' },
    { label: 'NASA HEASARC: the Compton Gamma Ray Observatory and COMPTEL', url: 'https://heasarc.gsfc.nasa.gov/docs/cgro/' },
  ],
});
