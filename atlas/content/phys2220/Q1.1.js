// The photoelectric effect — light ejects electrons from a metal only above a
// threshold frequency; brightness sets how many, frequency how fast:
// K_max = hf − φ = eV₀. Millikan's graph gives h. Mercury-lamp lines are the
// real ones (vacuum wavelengths, nm); work functions are Michaelson's (1977).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { photonEV, freqHz, HC_EVNM, H_EVS, QE } from '../../src/viz/model/qm-light.js';
import { METALS, kmax, thresholdNm } from '../../src/viz/model/qm-photoelectric.js';
import { ME, seg, label, spectrumStrip, r6 } from './_modern.js';

const t = String.raw;

const HG = [184.95, 253.65, 312.57, 365.02, 404.66, 435.83, 546.07];   // mercury-lamp lines, nm
const PHI = (k) => METALS[k].phi;
const PHIT = (k) => METALS[k].phi.toFixed(2);         // as printed: 2.30, not 2.3
const capital = (s) => s[0].toUpperCase() + s.slice(1);

// the worked example: the 254 nm mercury line on zinc
const EX = { nm: 253.65, metal: 'zinc' };
EX.E = photonEV(EX.nm); EX.K = kmax(EX.nm, PHI('zinc')); EX.v = Math.sqrt(2 * EX.K * QE / ME); EX.l0 = thresholdNm(PHI('zinc'));

/**
 * The metal as an energy well, schematic: electrons fill it to its top, the
 * vacuum level lies φ higher, a photon lifts one electron by hf, and what is
 * left over is the kinetic energy. Not to scale.
 */
function wellPicture({ phi, hf, K, caption }) {
  const top = hf ? (K === 'none' ? 1.3 : 3.3) : null;
  const curves = [seg(3, 0, 3, 2, 'ink2', 2), seg(3, 2, 6.6, 2, 'ink2', 2, true), seg(-0.2, 0, 3, 0, 'accent', 2.4)];
  const arrows = [{ from: [3.45, 0.06], to: [3.45, 1.94], color: 'violet' }, { from: [3.45, 1.94], to: [3.45, 0.06], color: 'violet' }];
  const points = [label(1.4, -1.1, 'electrons in the metal', 'accent', 0, 0, 'center'), label(4.6, 2, 'vacuum level: free and at rest', 'ink2', 0, -12, 'center'), label(3.45, 1, phi, 'violet', 8, 0)];
  if (top) {
    arrows.push({ from: [1.4, 0.05], to: [1.4, top], color: 'gold' });
    points.push(label(1.4, top / 2, hf, 'gold', -10, 0, 'right'));
    if (K !== 'none') {
      arrows.push({ from: [1.5, top], to: [6.0, top], color: 'accent' }, { from: [6.3, 2.06], to: [6.3, top - 0.04], color: 'good' }, { from: [6.3, top - 0.04], to: [6.3, 2.06], color: 'good' });
      points.push(label(6.3, (2 + top) / 2, K, 'good', -8, 0, 'right'), label(3.8, top, 'electron escapes', 'accent', 0, -12, 'center'));
    } else points.push(label(1.4, top, 'too little to escape', 'bad', 0, -14, 'center'));
  }
  return {
    type: 'graph',
    params: {
      x: [-0.4, 7], y: [-2.5, 4.1], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: '0', lower: '-2.4', from: -0.2, to: 3, color: 'accent', alpha: 0.18 }],
      curves, arrows, points,
    },
    caption: caption ?? 'The metal as an energy well: electrons fill it up to its top; escaping costs at least φ; a photon gives one electron hf. Schematic, not to scale.',
  };
}
/** The bench itself, with no numbers (a setting for a question). */
const bench = (metal, nm, extra = {}) => ({ type: 'qm-photoelectric', params: { metal, lambda: nm, intensity: 50, V: 0, graph: false, controls: false, readout: false, hide: ['K'], ...extra } });

export default lesson({
  id: 'phys2220.Q1.1',
  title: 'The photoelectric effect',
  minutes: 12, difficulty: 2,
  intro: t`Light falling on a clean metal knocks electrons out of it. Classical waves predicted that brighter light would give the electrons more energy, that any colour would work if bright enough, and that dim light would need time to build up energy. Experiment disagrees on every count: **below a threshold frequency no electrons come out, however bright the light**; above it they emerge at once, brighter light gives *more* electrons but not faster ones, and their maximum energy rises in a straight line with frequency. Einstein explained it in 1905: light arrives in packets — **photons** — each of energy $hf$, and one photon gives all its energy to one electron, which spends at least $\varphi$ escaping:

$$K_{\max} = hf - \varphi = eV_0$$

Millikan, who doubted Einstein’s photons, tested this for a decade and in 1916 confirmed it, measuring $h$ from the slope.

> Continue in [Introductory Modern Physics](#/course/phys2710): its module on photons returns to the full current–voltage analysis and Millikan’s method.`,
  symbols: [
    { tex: 'K_{\\max}', text: 'the kinetic energy of the fastest ejected electrons, in electronvolts (1 eV = $1.602\\times10^{-19}$ J)' },
    { tex: 'h', text: t`Planck’s constant, $6.626\,070\,15\times10^{-34}$ J s exactly, or $4.136\times10^{-15}$ eV s` },
    { tex: 'f', text: t`the light’s frequency, in Hz; $f = c/\lambda$, and a photon’s energy is $hf = hc/\lambda$, with $hc = 1240$ eV nm` },
    { tex: '\\varphi', text: 'the work function: the least energy that frees an electron from the surface — 2.30 eV for potassium, 4.33 eV for zinc' },
    { tex: 'e', text: t`the elementary charge, $1.602\times10^{-19}$ C` },
    { tex: 'V_0', text: 'the stopping potential: the retarding voltage that just stops the fastest electrons, in volts — numerically equal to $K_{\\max}$ in eV' },
  ],
  why: 'Photons are the first quantum idea you can measure on a bench: they explain solar cells, photomultipliers and digital cameras, and they open the road to quantum mechanics.',
  visual: {
    type: 'qm-photoelectric',
    title: 'Colour sets the energy; brightness sets the number',
    lead: t`Light from the lamp falls on the cathode. Each photon that carries more than $\varphi$ can free one electron, which crosses to the collector unless the retarding voltage $V$ turns it back. The graph is Millikan’s: $K_{\max}$ against frequency.`,
    tasks: [
      'With potassium and 450 nm light, double the brightness: the current doubles, but Kₘₐₓ (the gold point) does not move.',
      'Slide to red light, 700 nm: the electrons stop, however bright you make it — each photon carries 1.77 eV, less than φ = 2.30 eV.',
      'Switch to the current–voltage graph and raise V until the current just stops: that is V₀, equal to Kₘₐₓ in eV. Then choose zinc: no visible light frees anything.',
    ],
    params: { metal: 'potassium', lambda: 450, intensity: 60, V: 0, panel: 'millikan' },
  },
  example: {
    prompt: t`A mercury lamp’s strongest ultraviolet line, $\lambda = ${EX.nm}$ nm, shines on a zinc plate ($\varphi = ${PHIT('zinc')}$ eV). Find the photon energy, $K_{\max}$, the stopping potential, the fastest electrons’ speed, and the longest wavelength that ejects any electrons from zinc.`,
    visual: wellPicture({ phi: `φ = ${PHIT('zinc')} eV`, hf: `hf = ${fmt(EX.E, 3)} eV`, K: `Kₘₐₓ = ${fmt(EX.K, 3)} eV` }),
    steps: [
      { label: 'Photon energy', text: t`$hf = \dfrac{hc}{\lambda} = \dfrac{1239.8\ \text{eV nm}}{${EX.nm}\ \text{nm}} = ${fmt(EX.E, 4)}$ eV.` },
      { label: 'Energy left over', text: t`$K_{\max} = hf - \varphi = ${fmt(EX.E, 4)} - ${PHIT('zinc')} = ${fmt(EX.K, 3)}$ eV. Electrons from deeper in the metal need more than $\varphi$ to escape and come out slower; this is the most any can have.` },
      { label: 'Stopping potential', text: t`$eV_0 = K_{\max}$, so $V_0 = ${fmt(EX.K, 3)}$ V: a collector ${fmt(EX.K, 3)} V negative of the plate turns back even the fastest electrons.` },
      { label: 'Speed', text: t`$v = \sqrt{2K_{\max}/m_e} = \sqrt{\dfrac{2\times${fmt(EX.K, 3)}\times1.602\times10^{-19}\ \text{J}}{9.109\times10^{-31}\ \text{kg}}} = ${tex(EX.v, 3)}$ m/s — far below $c$, so Newton’s $\tfrac12 mv^2$ is fine here.` },
      { label: 'Threshold', text: t`An electron just escapes when $hf = \varphi$: $\lambda_0 = \dfrac{hc}{\varphi} = \dfrac{1239.8}{${PHIT('zinc')}}$ nm $= ${fmt(EX.l0, 4)}$ nm, in the ultraviolet. No visible light, however bright, frees electrons from zinc.` },
      { label: 'Sense check', text: t`This is what Hallwachs found in 1888: ultraviolet light discharges a negatively charged zinc plate, while visible light, however bright, does nothing at all.` },
    ],
    answer: t`$hf = ${fmt(EX.E, 4)}$ eV; $K_{\max} = ${fmt(EX.K, 3)}$ eV; $V_0 = ${fmt(EX.K, 3)}$ V; $v = ${tex(EX.v, 3)}$ m/s; threshold $${fmt(EX.l0, 4)}$ nm.`,
  },
  practice: [
    mcq({
      id: 'brighter', difficulty: 1,
      prompt: t`Blue light of fixed wavelength ejects electrons from a potassium plate. You double the brightness. What happens to the number of electrons ejected each second and to $K_{\max}$?`,
      choices: ['The number doubles; Kₘₐₓ stays the same', 'Both double', 'The number stays the same; Kₘₐₓ doubles', 'Neither changes'],
      answer: 0,
      why: {
        1: 'Each photon still carries the same energy hf, so each electron gets the same maximum energy. Brightness only means more photons.',
        2: 'That is the classical wave prediction — a stronger wave shakes the electrons harder. Experiment says the opposite: brightness changes the number, not the energy.',
        3: 'Twice as many photons per second free twice as many electrons per second, so the current doubles.',
      },
      hints: ['What does doubling the brightness change: the energy of each photon, or how many arrive?'],
      teach: 'Frequency sets each photon’s energy; brightness sets how many photons arrive — and photons carry no charge.',
      explain: t`Twice the photons per second, each with the same $hf$: twice the electrons, each with at most the same $K_{\max} = hf - \varphi$. The stopping potential does not move.`,
      visual: { type: 'qm-photoelectric', params: { metal: 'potassium', lambda: 450, intensity: 40, V: 0, panel: 'iv', controls: false, readout: false }, caption: 'The bench with blue light on potassium, and the current against the retarding voltage at this brightness.' },
    }),
    num({
      id: 'photon-energy', difficulty: 1,
      gen(r) {
        const [nm, what] = r.pick([[405, 'a violet laser pointer (405 nm)'], [532, 'a green laser pointer (532 nm)'], [650, 'a red laser diode (650 nm)'], [1064, 'an infrared Nd:YAG laser (1064 nm)'], [121.6, 'the Sun’s ultraviolet Lyman-α line (121.6 nm)'], [589, 'a sodium street lamp (589 nm)']]);
        const E = photonEV(nm);
        return {
          prompt: t`What energy does one photon from ${what} carry, in electronvolts?`,
          answer: E, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: E * QE, feedback: 'That is the energy in joules. Divide by 1.602 × 10⁻¹⁹ J/eV — or use hc = 1240 eV nm directly.' }],
          hints: [t`$E = hc/\lambda$, and $hc = 1239.8$ eV nm.`],
          teach: 'A photon’s energy is E = hc/λ; with hc ≈ 1240 eV nm, divide 1240 by the wavelength in nm.',
          explain: t`$E = \dfrac{1239.8\ \text{eV nm}}{${nm}\ \text{nm}} = ${fmt(E, 3)}$ eV. Visible photons carry roughly 1.6–3.3 eV — the same scale as chemical bonds, which is why light can drive photochemistry and photosynthesis.`,
          visual: spectrumStrip({ from: 100, to: 1150, marks: [{ nm, label: `${nm} nm` }] }),
        };
      },
    }),
    num({
      id: 'kmax', difficulty: 2,
      gen(r) {
        const metal = r.pick(['cesium', 'potassium', 'sodium', 'zinc', 'copper']);
        const lines = HG.filter((nm) => photonEV(nm) > PHI(metal) + 0.25);
        const nm = r.pick(lines), E = photonEV(nm), K = E - PHI(metal);
        return {
          prompt: t`Light from a mercury lamp’s ${nm} nm line falls on ${metal} ($\varphi = ${PHIT(metal)}$ eV). What is the maximum kinetic energy of the ejected electrons, in eV?`,
          answer: K, units: 'eV', tol: { rel: 0.01, abs: 0.005 },
          errors: [{ value: E + PHI(metal), feedback: t`The work function is *spent* escaping: subtract it, $K_{\max} = hf - \varphi$.` }, { value: E, feedback: t`That is the photon’s whole energy; the electron must first pay $\varphi$ to escape.` }],
          hints: [t`First the photon energy: $hf = 1239.8/${nm}$ eV.`, t`Then $K_{\max} = hf - ${PHIT(metal)}$ eV.`],
          teach: 'Einstein’s equation: the fastest electrons keep what is left of the photon’s energy after paying the work function.',
          explain: t`$hf = ${fmt(E, 4)}$ eV, so $K_{\max} = ${fmt(E, 4)} - ${PHIT(metal)} = ${fmt(K, 3)}$ eV, and the stopping potential is ${fmt(K, 3)} V.`,
          visual: wellPicture({ phi: `φ = ${PHIT(metal)} eV`, hf: `hf (from ${nm} nm)`, K: 'Kₘₐₓ = ?' }),
        };
      },
    }),
    num({
      id: 'threshold', difficulty: 2,
      gen(r) {
        const metal = r.pick(['cesium', 'potassium', 'sodium', 'copper', 'platinum']);
        const l0 = thresholdNm(PHI(metal));
        return {
          prompt: t`What is the longest wavelength of light that can eject electrons from ${metal}, whose work function is ${PHIT(metal)} eV? Answer in nm.`,
          answer: l0, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: PHI(metal) / H_EVS, feedback: 'That is the threshold frequency in Hz. Convert to a wavelength: λ₀ = c/f₀ = hc/φ.' }],
          hints: [t`At threshold the photon has just enough energy: $hc/\lambda_0 = \varphi$.`, t`$\lambda_0 = 1239.8\ \text{eV nm}/${PHIT(metal)}\ \text{eV}$.`],
          teach: 'The threshold wavelength is λ₀ = hc/φ: longer wavelengths carry too little energy per photon, however bright the light.',
          explain: t`$\lambda_0 = \dfrac{1239.8}{${PHIT(metal)}}\ \text{nm} = ${fmt(l0, 4)}$ nm — ${l0 > 380 ? (l0 > 750 ? 'in the infrared' : 'visible light') : 'ultraviolet'}. Light of any longer wavelength frees no electrons from ${metal}.`,
          visual: wellPicture({ phi: `φ = ${PHIT(metal)} eV`, hf: 'hf too small', K: 'none' }, 'A photon below threshold lifts an electron, but not far enough to escape. Schematic, not to scale.'),
        };
      },
    }),
    num({
      id: 'millikan-h', difficulty: 3,
      gen(r) {
        const metal = r.pick(['sodium', 'potassium', 'cesium']);
        const [l1, l2] = r.pick([[312.57, 435.83], [365.02, 404.66], [253.65, 404.66], [312.57, 404.66]]);
        const V1 = +(photonEV(l1) - PHI(metal)).toFixed(3), V2 = +(photonEV(l2) - PHI(metal)).toFixed(3);
        const f1 = freqHz(l1), f2 = freqHz(l2);
        const h = (QE * (V1 - V2)) / (f1 - f2);
        return {
          prompt: t`In a Millikan-style experiment on ${metal}, light of frequency $f_1 = ${tex(f1, 4)}$ Hz needs a stopping potential of ${V1} V, and light of $f_2 = ${tex(f2, 4)}$ Hz needs ${V2} V. What value of Planck’s constant do these measurements give, in J s?`,
          answer: h, units: 'J s', tol: { rel: 0.01 },
          errors: [{ value: (V1 - V2) / (f1 - f2), feedback: t`That is the slope $h/e$ in V s (or eV s). Multiply by $e = 1.602\times10^{-19}$ C to get $h$ in J s.` }],
          hints: [t`$eV_0 = hf - \varphi$ for both: subtract to remove $\varphi$, $\;e(V_1 - V_2) = h(f_1 - f_2)$.`, t`$h = \dfrac{(1.602\times10^{-19}\ \text{C})(${nice(+(V1 - V2).toFixed(3))}\ \text{V})}{${tex(f1 - f2, 4)}\ \text{Hz}}$.`],
          teach: 'The slope of V₀ against f is h/e, the same for every metal; its intercept gives the work function.',
          explain: t`$h = \dfrac{e\,(V_1 - V_2)}{f_1 - f_2} = \dfrac{(1.602\times10^{-19})(${nice(+(V1 - V2).toFixed(3))})}{${tex(f1 - f2, 4)}} = ${tex(h, 4)}$ J s — the exact value is $6.626\times10^{-34}$ J s. The work function follows from either point: $\varphi = hf_1 - eV_1 = ${fmt(H_EVS * f1 - V1, 3)}$ eV.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 11], y: [-3.5, 3], xlabel: 'frequency f (10¹⁴ Hz)', ylabel: 'V₀ (V)',
              points: [{ x: r6(f1 / 1e14), y: V1, color: 'gold', r: 5.5, label: `${V1} V`, labelDx: 10, labelDy: 0 }, { x: r6(f2 / 1e14), y: V2, color: 'gold', r: 5.5, label: `${V2} V`, labelDx: 10, labelDy: 0 }],
              hlines: [{ y: 0, color: 'ink3' }],
            },
            caption: 'The two measurements: stopping potential against frequency. The straight line through them has slope h/e.',
          },
        };
      },
    }),
    num({
      id: 'classical-delay', difficulty: 3,
      prompt: t`Dim light of intensity $1.0\times10^{-3}\ \text{W/m}^2$ falls on potassium ($\varphi = 2.30$ eV). If light were a smooth classical wave, each atom could only soak up the energy falling on its own area, about $1\times10^{-19}\ \text{m}^2$. How many minutes would it take to gather enough energy to free one electron?`,
      answer: (2.30 * QE) / (1.0e-3 * 1e-19) / 60, units: 'min', tol: { rel: 0.01 },
      errors: [{ value: (2.30 * QE) / (1.0e-3 * 1e-19), feedback: 'That is in seconds: divide by 60 for minutes.' }],
      hints: [t`Power absorbed by one atom: $P = IA = (1.0\times10^{-3})(1\times10^{-19})$ W.`, t`Time $= \varphi/P$, with $\varphi = 2.30\times1.602\times10^{-19}$ J.`],
      teach: 'A classical wave spreads its energy thin; a photon delivers it all at once to one electron.',
      explain: t`$t = \dfrac{\varphi}{IA} = \dfrac{${tex(2.30 * QE, 3)}\ \text{J}}{${tex(1e-22, 2)}\ \text{W}} = ${fmt((2.30 * QE) / 1e-22, 3)}$ s, about ${fmt((2.30 * QE) / 1e-22 / 60, 2)} minutes. Experiments find electrons within a few nanoseconds of switching the light on, however dim it is: the energy arrives in whole photons, and the first photon to land frees the first electron.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.5, 10.5], y: [-1.3, 3.3], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [0.6, 1.4, 2.2, 3.0].map((y) => seg(0, y, 10, y, 'gold', 1.4, true)),
          points: [...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => ({ x, y: 0, r: 7, color: x === 5 ? 'accent' : 'ink3' })), label(5, -0.5, 'one atom: about 10⁻¹⁹ m²', 'accent', 0, 8, 'center'), label(9.6, 3.0, 'a weak, smooth wave', 'gold', -10, -10, 'right')],
          arrows: [{ from: [9.6, 2.9], to: [9.6, 0.5], color: 'gold' }],
        },
        caption: 'The classical picture: a weak, smooth wave spreading its energy evenly over every atom of the surface. Not to scale.',
      },
    }),
    mcq({
      id: 'what-carries', difficulty: 2,
      prompt: 'In a phototube, light falls on the cathode and an ammeter in the external circuit shows a current. What carries the current across the tube?',
      choices: [
        'Electrons ejected from the cathode; photons carry no charge',
        'Photons, which carry negative charge from the lamp to the plate',
        'Ions of air inside the tube, knocked loose by the light',
        'Nothing crosses the tube: the light pushes charge around the wires directly',
      ],
      answer: 0,
      why: {
        1: 'Photons are electrically neutral. Each one hands its energy to an electron that was already in the metal.',
        2: 'The tube is evacuated: there is no air to ionize, and the current flows even in a very good vacuum.',
        3: 'The current is a stream of electrons crossing the vacuum gap — a retarding voltage stops it, which could not happen if nothing crossed.',
      },
      hints: ['Which particles are charged: photons or electrons?'],
      teach: 'A photon is uncharged; it gives its energy to an electron, and the electrons carry the current.',
      explain: 'Each photon that carries more than φ frees one electron from the cathode; those electrons cross the vacuum to the collector and return through the circuit. The photons themselves carry energy and momentum, but no charge.',
      visual: bench('potassium', 450),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solar-cell', difficulty: 2, transfer: true,
      prompt: t`The solar arrays on most satellites use silicon cells. A photon is absorbed usefully only if it can lift an electron across silicon’s band gap of 1.12 eV — the same one-photon, one-electron threshold as the photoelectric effect, though the electron stays inside the crystal. What is the longest wavelength a silicon cell can use, in nm?`,
      answer: HC_EVNM / 1.12, units: 'nm', tol: { rel: 0.005 },
      errors: [{ value: 1.12 / H_EVS, feedback: 'That is a frequency. The wavelength is λ = hc/E.' }],
      hints: [t`$\lambda = hc/E = 1239.8\ \text{eV nm}/1.12\ \text{eV}$.`],
      teach: 'A photon threshold sets the longest wavelength any photon detector or solar cell can use: λ = hc/E.',
      explain: t`$\lambda = 1239.8/1.12 = ${fmt(HC_EVNM / 1.12, 4)}$ nm, in the near infrared. Longer-wavelength sunlight passes through unused, however intense it is. Spacecraft cells stack layers with larger gaps on top (around 1.9, 1.4 and 0.7 eV) so each slice of the spectrum is caught by a layer whose threshold it just exceeds.`,
      visual: spectrumStrip({ from: 250, to: 1500, marks: [{ nm: 1000, label: 'silicon’s limit: ?', color: 'gold' }], caption: 'The spectrum from ultraviolet to infrared. The gold mark is placed only roughly: finding silicon’s limit is the question.' }),
    }),
    num({
      id: 'cp-spacecraft', difficulty: 3, transfer: true,
      prompt: t`Sunlight includes a strong ultraviolet line at 121.6 nm (hydrogen’s Lyman-α). It strikes a spacecraft’s gold-coated surface, whose work function is ${PHIT('gold')} eV. What is the maximum kinetic energy of the photoelectrons, in eV?`,
      answer: photonEV(121.6) - PHI('gold'), units: 'eV', tol: { rel: 0.01 },
      errors: [{ value: photonEV(121.6), feedback: t`That is the photon energy; subtract the work function: $K_{\max} = hf - \varphi$.` }],
      hints: [t`$hf = 1239.8/121.6$ eV.`, t`$K_{\max} = hf - ${PHIT('gold')}$ eV.`],
      teach: 'Ultraviolet sunlight ejects photoelectrons from every sunlit spacecraft surface.',
      explain: t`$hf = ${fmt(photonEV(121.6), 4)}$ eV, so $K_{\max} = ${fmt(photonEV(121.6) - PHI('gold'), 3)}$ eV. Losing electrons this way charges sunlit surfaces positive — typically by a few volts, until the surface pulls back all but the fastest photoelectrons — and spacecraft are designed so that differences in charge between surfaces cannot spark and damage instruments.`,
      visual: wellPicture({ phi: `φ = ${PHIT('gold')} eV`, hf: 'hf (121.6 nm)', K: 'Kₘₐₓ = ?' }),
    }),
    mcq({
      id: 'cp-colours', difficulty: 2,
      prompt: t`You light a cesium photocathode ($\varphi = 2.14$ eV) first with **dim** violet light (400 nm), then with **very bright** red light (650 nm). What do you find?`,
      choices: [
        'Only the dim violet light ejects electrons',
        'Both eject electrons, and the bright red light gives the faster ones',
        'Only the bright red light ejects electrons, because it delivers more energy per second',
        'Both eject electrons with the same maximum energy',
      ],
      answer: 0,
      why: {
        1: 'Brightness does not raise the energy of each photon. A 650 nm photon carries only 1.91 eV, below cesium’s 2.14 eV.',
        2: 'Energy per second is not what matters: each electron must get at least φ from a single photon.',
        3: 'The red photons are below threshold, so they free no electrons at all.',
      },
      hints: [t`Compute each photon’s energy, $hc/\lambda$, and compare it with $\varphi$.`],
      teach: 'Whether light ejects electrons depends on the energy of each photon, not on how many photons arrive.',
      explain: t`At 400 nm each photon carries ${fmt(photonEV(400), 3)} eV, enough to free an electron with up to ${fmt(photonEV(400) - 2.14, 2)} eV left over. At 650 nm each carries only ${fmt(photonEV(650), 3)} eV — below the 2.14 eV threshold — so no electrons come out, however bright the light.`,
      visual: spectrumStrip({ from: 300, to: 800, marks: [{ nm: 400, label: 'dim 400 nm' }, { nm: 650, label: 'bright 650 nm' }] }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §6.2 Photoelectric effect', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-2-photoelectric-effect' },
    { label: 'Millikan (1916), A direct photoelectric determination of Planck’s “h”, Phys. Rev. 7, 355', url: 'https://doi.org/10.1103/PhysRev.7.355' },
    { label: 'Michaelson (1977), The work function of the elements and its periodicity, J. Appl. Phys. 48, 4729', url: 'https://doi.org/10.1063/1.323539' },
    { label: 'McKagan et al., a research-based curriculum for teaching the photoelectric effect (student difficulties)', url: 'https://oer.issuelab.org/resources/1368/1368.pdf' },
  ],
});
