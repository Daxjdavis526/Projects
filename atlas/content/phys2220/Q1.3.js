// De Broglie waves — every particle has a wavelength λ = h/p. Davisson and
// Germer's 54 eV electrons on nickel, electron microscopes (relativistic
// momentum), thermal neutrons, C₆₀ molecules and a baseball. Every number is
// computed here or in model/qm-matterwaves.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { H } from '../../src/viz/model/qm-light.js';
import { PARTICLES, lambdaFromK, lambdaNonRel, lambdaFromV } from '../../src/viz/model/qm-matterwaves.js';
import { seg, label, r6 } from './_modern.js';

const t = String.raw;

const ME = PARTICLES.electron.m, MN = PARTICLES.neutron.m, MC60 = PARTICLES.c60.m;
const QE = 1.602176634e-19;
const D_NI = 0.215;                                    // nm, spacing of the rows of nickel atoms on Davisson and Germer's face
const EX = { K: 54 };
EX.p = Math.sqrt(2 * ME * EX.K * QE); EX.lam = H / EX.p * 1e9; EX.th = Math.asin(EX.lam / D_NI) * 180 / Math.PI;
const DEG = Math.PI / 180;

/** Waves scattered from a row of atoms: incoming straight down, outgoing at angle θ from the normal. */
function crystal(thDeg, caption, labels = true) {
  const s = Math.sin(thDeg * DEG), c = Math.cos(thDeg * DEG);
  const atoms = [0, 1, 2, 3, 4, 5].map((x) => ({ x, y: 0, r: 7, color: 'ink3' }));
  const curves = [seg(1, 2.4, 1, 0.12, 'violet', 2), seg(2, 2.4, 2, 0.12, 'violet', 2), seg(1, 0, r6(1 + 2.2 * s), r6(2.2 * c), 'gold', 2), seg(2, 0, r6(2 + 2.2 * s), r6(2.2 * c), 'gold', 2), seg(1, 0, r6(1 + s * s), r6(-0 + s * c), 'warn', 2.6)];
  const points = [...atoms, label(1.5, -0.35, labels ? 'd = 0.215 nm' : 'spacing d', 'ink2', 0, 10, 'center'), label(2.3, 1.7, 'electrons in', 'violet', 6, 0), label(r6(2 + 2.2 * s), r6(2.2 * c), 'scattered', 'gold', 6, -6)];
  if (labels) points.push(label(r6(1 + s * s), r6(s * c), 'extra path: d sin θ', 'warn', 10, 2));
  return {
    type: 'graph',
    params: { x: [-0.6, 6.2], y: [-0.9, 2.7], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    caption: caption ?? 'Electrons arriving straight down on a row of surface atoms, and waves leaving two neighbouring atoms at angle θ from the vertical. The scattered waves reinforce when the extra path d sin θ is a whole number of wavelengths. Not to scale.',
  };
}
/** An electron gun: cathode, anode, the accelerating voltage. */
const gun = (V, caption) => ({
  type: 'graph',
  params: {
    x: [-0.5, 8.5], y: [-1.6, 1.8], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg(0.6, -1.1, 0.6, 1.1, 'ink', 4), seg(5.2, -1.1, 5.2, -0.18, 'ink', 4), seg(5.2, 0.18, 5.2, 1.1, 'ink', 4), { fn: '0.25*sin(2*pi*(x - 5.4)/0.55)', domain: [5.4, 7.9], color: 'accent', width: 2 }],
    points: [{ x: 0.9, y: 0, r: 5, color: 'accent', label: 'electron starts at rest', labelDx: 6, labelDy: 18 }, label(0.6, -1.1, 'cathode', 'ink2', -22, 14), label(5.2, -1.1, `anode, ${V} higher`, 'ink2', -40, 14), label(6.65, 0.3, 'λ = ?', 'accent', 0, -16, 'center')],
  },
  caption: caption ?? 'An electron gun: the electron gains kinetic energy eV crossing the gap, and with it a de Broglie wavelength. Not to scale.',
});
/** Lengths on a logarithmic ladder, from atoms down to the Planck length. */
const ladder = {
  type: 'graph',
  params: {
    x: [0, 10], y: [-36, -8], xlabel: '', ylabel: 'size (log₁₀ of metres)', xticks: 0.001, yticks: 7,
    points: [
      { x: 3, y: -10, color: 'accent', label: 'an atom: 10⁻¹⁰ m', labelDx: 10, labelDy: 0 },
      { x: 3, y: -15, color: 'accent', label: 'a proton: 10⁻¹⁵ m', labelDx: 10, labelDy: 0 },
      { x: 3, y: -18.4, color: 'violet', label: 'LIGO’s mirror motion: 4 × 10⁻¹⁹ m', labelDx: 10, labelDy: 0 },
      { x: 3, y: -34.8, color: 'warn', label: 'the Planck length: 1.6 × 10⁻³⁵ m', labelDx: 10, labelDy: 0 },
    ],
  },
  caption: 'Some lengths on a logarithmic scale: each step of 1 is a factor of ten. Where does a baseball’s wavelength belong?',
};

export default lesson({
  id: 'phys2220.Q1.3',
  title: 'De Broglie waves',
  minutes: 11, difficulty: 2,
  intro: t`If light waves come as particles, do particles come as waves? In 1924 Louis de Broglie proposed that every particle has a wavelength set by its momentum:

$$\lambda = \frac{h}{p}$$

Three years later Clinton Davisson and Lester Germer fired slow electrons at a nickel crystal and found them diffracted exactly as waves of that wavelength would be. Because $h$ is so small, only light, slow things have wavelengths big enough to notice — electrons, neutrons, whole atoms, even C₆₀ molecules have all been diffracted — and the tiny wavelength of fast electrons is what lets electron microscopes see individual atoms.

> Continue in [Introductory Modern Physics](#/course/phys2710), where matter waves lead to wave packets and the Schrödinger equation.`,
  symbols: [
    { tex: '\\lambda', text: 'the de Broglie wavelength of the particle, in m' },
    { tex: 'h', text: t`Planck’s constant, $6.626\times10^{-34}$ J s` },
    { tex: 'p', text: t`the particle’s momentum, in kg·m/s: $mv$ when $v \ll c$; for a particle of kinetic energy $K$, $p = \sqrt{2mK}$, and in general $pc = \sqrt{K^2 + 2Kmc^2}$` },
  ],
  why: 'Matter waves are the starting point of quantum mechanics: the Schrödinger equation is the wave equation they obey, and atoms, chemistry and solids all follow from it.',
  visual: {
    type: 'qm-slits',
    title: 'Electrons through two slits',
    lead: t`An electron gun fires electrons at a barrier with two slits. Each electron lands at one spot on the screen — but as the spots pile up, a fringe pattern appears, spaced exactly as for waves of wavelength $\lambda = h/p$. The bars on the right count the hits; the orange curve is the wave’s prediction.`,
    tasks: [
      'Let a few thousand electrons land (or press “+1000 at once”): the fringes are spaced by λ/d in angle.',
      'Lower the voltage from 50 kV to 12.5 kV: the momentum halves (very nearly), λ doubles, and the fringes spread twice as far apart.',
      'Widen the slit separation d: the fringes crowd together, since their angular spacing is λ/d.',
    ],
    params: { mode: 'double', kV: 50, a: 0.5, d: 2.0, rate: 20 },
  },
  example: {
    prompt: t`Davisson and Germer accelerated electrons through 54 V, giving them $K = 54$ eV, and aimed them straight down at a nickel crystal whose surface atoms lie in rows $d = ${D_NI}$ nm apart. Find the electrons’ de Broglie wavelength and the angle from the vertical at which the scattered waves reinforce.`,
    visual: crystal(EX.th),
    steps: [
      { label: 'Momentum', text: t`$K = 54\ \text{eV} = 54\times1.602\times10^{-19}$ J, far below $m_ec^2 = 511$ keV, so Newton will do: $p = \sqrt{2m_eK} = \sqrt{2(9.109\times10^{-31})(${tex(EX.K * QE, 4)})} = ${tex(EX.p, 3)}$ kg·m/s.` },
      { label: 'Wavelength', text: t`$\lambda = \dfrac{h}{p} = \dfrac{6.626\times10^{-34}}{${tex(EX.p, 3)}}\ \text{m} = ${fmt(EX.lam, 3)}$ nm — about the spacing of atoms in a solid.` },
      { label: 'The crystal as a grating', text: t`Waves scattered from neighbouring rows of atoms travel paths that differ by $d\sin\theta$. They reinforce when that is a whole number of wavelengths; the first such angle has $d\sin\theta = \lambda$.` },
      { label: 'The angle', text: t`$\sin\theta = \dfrac{${fmt(EX.lam, 3)}}{${D_NI}} = ${fmt(EX.lam / D_NI, 3)}$, so $\theta = ${fmt(EX.th, 3)}°$. Davisson and Germer saw a strong peak at 50°.` },
      { label: 'Sense check', text: t`Electrons of a few tens of eV have wavelengths comparable to atomic spacings, which is why crystals diffract them just as they diffract X-rays of similar wavelength.` },
    ],
    answer: t`$\lambda = ${fmt(EX.lam, 3)}$ nm, and the scattered electrons reinforce at about ${fmt(EX.th, 3)}° from the vertical (observed: 50°).`,
  },
  practice: [
    num({
      id: 'electron-lambda', difficulty: 1,
      gen(r) {
        const K = r.pick([10, 25, 100, 150, 400, 1000]);
        const lam = lambdaNonRel('electron', K) * 1e9;
        return {
          prompt: t`An electron has kinetic energy ${K} eV. What is its de Broglie wavelength, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: lam * Math.sqrt(2), feedback: t`Keep the 2 inside the square root: $p = \sqrt{2mK}$.` }],
          hints: [t`$p = \sqrt{2m_eK}$ with $K = ${K}\times1.602\times10^{-19}$ J and $m_e = 9.109\times10^{-31}$ kg.`, t`Then $\lambda = h/p$. (A handy shortcut: $\lambda \approx 1.226\ \text{nm}/\sqrt{K/\text{eV}}$.)`],
          teach: 'For a slow particle of kinetic energy K, λ = h/√(2mK).',
          explain: t`$p = \sqrt{2(9.109\times10^{-31})(${tex(K * QE, 4)})} = ${tex(Math.sqrt(2 * ME * K * QE), 3)}$ kg·m/s, so $\lambda = h/p = ${fmt(lam, 3)}$ nm.`,
          visual: crystal(40, 'Electrons with wavelengths near atomic spacings are diffracted by the rows of atoms in a crystal. Not to scale.', false),
        };
      },
    }),
    num({
      id: 'baseball', difficulty: 1,
      prompt: t`A 145 g baseball flies at 40 m/s. What is its de Broglie wavelength, in metres?`,
      answer: H / (0.145 * 40), units: 'm', tol: { rel: 0.01 },
      errors: [{ value: H / (145 * 40), feedback: 'Use the mass in kilograms: 145 g = 0.145 kg.' }],
      hints: [t`$\lambda = h/(mv)$ with $m = 0.145$ kg.`],
      teach: 'Everyday objects have wavelengths so small that no opening could ever diffract them.',
      explain: t`$\lambda = \dfrac{6.626\times10^{-34}}{0.145\times40}\ \text{m} = ${tex(H / (0.145 * 40), 3)}$ m — about $10^{19}$ times smaller than a proton, and only about seven times the Planck length. Its wave nature is real but utterly unobservable.`,
      visual: ladder,
    }),
    num({
      id: 'voltage-for-lambda', difficulty: 2,
      gen(r) {
        const lamNm = r.pick([0.1, 0.2, 0.05, 0.15]);
        const V = (H * H) / (2 * ME * QE * (lamNm * 1e-9) ** 2);
        return {
          prompt: t`Through what potential difference must an electron be accelerated from rest so that its de Broglie wavelength is ${lamNm} nm?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(V), feedback: t`Square both sides: $\lambda = h/\sqrt{2meV}$ gives $V = h^2/(2me\lambda^2)$.` }],
          hints: [t`$eV = K = \dfrac{p^2}{2m}$ and $p = h/\lambda$.`, t`So $V = \dfrac{h^2}{2m_e e\lambda^2}$.`],
          teach: 'Pick the wavelength, and the momentum and accelerating voltage follow: V = h²/(2meλ²).',
          explain: t`$p = h/\lambda = ${tex(H / (lamNm * 1e-9), 3)}$ kg·m/s, $K = p^2/2m_e = ${tex(V * QE, 3)}$ J, so $V = K/e = ${fmt(V, 3)}$ V.`,
          visual: gun('V'),
        };
      },
    }),
    mcq({
      id: 'same-energy', difficulty: 2,
      prompt: 'An electron and a proton have the same kinetic energy (both far below their rest energies). Which has the longer de Broglie wavelength, and by about how much?',
      choices: ['The electron, by about 43 times', 'The proton, because it is heavier', 'They are the same, because they have the same energy', 'The electron, by about 1836 times'],
      answer: 0,
      why: {
        1: 'Heavier means more momentum at the same energy (p = √(2mK)), and λ = h/p is then shorter, not longer.',
        2: 'Wavelength depends on momentum, not energy; equal energies mean very unequal momenta.',
        3: 'That is the mass ratio. The momenta differ by the square root of it.',
      },
      hints: [t`$\lambda = h/\sqrt{2mK}$: at fixed $K$, how does $\lambda$ depend on $m$?`, t`$m_p/m_e = 1836$.`],
      teach: 'At equal kinetic energy, λ ∝ 1/√m: lighter particles have longer wavelengths.',
      explain: t`$\lambda_e/\lambda_p = \sqrt{m_p/m_e} = \sqrt{1836} = 42.8$. That is why electrons, not protons, are used to probe the arrangement of atoms at modest energies.`,
    }),
    num({
      id: 'neutron', difficulty: 2,
      prompt: t`Neutrons slowed down in a reactor’s moderator to “thermal” speeds of about 2200 m/s are used to study crystals, proteins and magnets. What is their de Broglie wavelength, in nm? ($m_n = 1.675\times10^{-27}$ kg.)`,
      answer: lambdaFromV(MN, 2200) * 1e9, units: 'nm', tol: { rel: 0.01 },
      errors: [{ value: lambdaFromV(ME, 2200) * 1e9, feedback: 'That uses the electron’s mass; a neutron is 1839 times heavier.' }],
      hints: [t`$\lambda = h/(m_nv)$.`],
      teach: 'Thermal neutrons have wavelengths comparable to atomic spacings — and, being uncharged, they see light atoms and magnetism that X-rays miss.',
      explain: t`$\lambda = \dfrac{6.626\times10^{-34}}{(1.675\times10^{-27})(2200)}\ \text{m} = ${fmt(lambdaFromV(MN, 2200) * 1e9, 3)}$ nm — just right for diffraction by the rows of atoms in a crystal.`,
      visual: crystal(55, 'Neutrons diffract from the planes of atoms in a crystal just as electrons and X-rays do. Not to scale.', false),
    }),
    num({
      id: 'tem', difficulty: 3,
      prompt: t`A transmission electron microscope accelerates electrons through 200 kV. Find their de Broglie wavelength in picometres, using the relativistic momentum $pc = \sqrt{K^2 + 2Kmc^2}$ (lesson R1.4), with $K = 200$ keV and $m_ec^2 = 511.0$ keV.`,
      answer: lambdaFromK('electron', 2e5) * 1e12, units: 'pm', tol: { rel: 0.005 },
      errors: [{ value: lambdaNonRel('electron', 2e5) * 1e12, feedback: t`That is Newton’s $p = \sqrt{2mK}$, which overestimates λ by 9% at this energy. Use the relativistic $pc = \sqrt{K^2 + 2Kmc^2}$.` }],
      hints: [t`$pc = \sqrt{200^2 + 2(200)(511.0)}$ keV.`, t`$\lambda = \dfrac{h}{p} = \dfrac{hc}{pc}$, with $hc = 1239.8$ keV pm.`],
      teach: 'Fast electrons need relativistic momentum: at 200 keV Newton’s formula is 9% off.',
      explain: t`$pc = \sqrt{40\,000 + 204\,400} = ${fmt(Math.sqrt(200 * 200 + 2 * 200 * 510.99895), 4)}$ keV, so $\lambda = 1239.8/${fmt(Math.sqrt(200 * 200 + 2 * 200 * 510.99895), 4)} = ${fmt(lambdaFromK('electron', 2e5) * 1e12, 4)}$ pm — about fifty times smaller than the spacing of atoms, which is why such microscopes can image individual atomic columns (lens flaws, not the wavelength, set their real limit).`,
      visual: {
        type: 'graph',
        params: {
          x: [10, 300], y: [0, 14], xlabel: 'accelerating voltage (kV)', ylabel: 'λ (pm)',
          curves: [{ fn: '1226.4/sqrt(1000*x)', color: 'ink3', dash: true, domain: [10, 300], label: 'Newton', labelAt: 250, labelDx: -10, labelDy: -12 }, { fn: '1239.84/sqrt(x^2 + 2*x*510.99895)', color: 'accent', domain: [10, 300], label: 'relativistic', labelAt: 60, labelDx: 6, labelDy: -12 }],
        },
        caption: 'Electron wavelength against accelerating voltage: Newton’s momentum (dashed) and the relativistic one (solid). They part company above a few tens of kV.',
      },
    }),
    num({
      id: 'fringe-spacing', difficulty: 2,
      gen(r) {
        const kV = r.pick([10, 20, 40, 80]), d = r.pick([1.5, 2, 3]);
        const lam = lambdaFromK('electron', kV * 1e3), ang = (lam / (d * 1e-6)) * 1e6;
        return {
          prompt: t`Electrons accelerated through ${kV} kV pass two slits ${d} μm apart. Their wavelength is ${fmt(lam * 1e12, 3)} pm. What is the angle between neighbouring bright fringes, in microradians?`,
          answer: ang, units: 'μrad', tol: { rel: 0.01 },
          errors: [{ value: ang / 2, feedback: t`Bright fringes are spaced by $\lambda/d$; dark fringes fall halfway between them.` }],
          hints: [t`For small angles the bright fringes are $\lambda/d$ apart.`, t`$\dfrac{${fmt(lam * 1e12, 3)}\times10^{-12}\ \text{m}}{${d}\times10^{-6}\ \text{m}}$ in radians; multiply by $10^6$ for μrad.`],
          teach: 'Two-slit fringes are spaced by λ/d in angle, for electrons exactly as for light.',
          explain: t`$\lambda/d = ${fmt(lam * 1e12, 3)}\times10^{-12}/(${d}\times10^{-6}) = ${fmt(ang, 3)}\ \mu\text{rad}$ — on a screen a metre away, fringes ${fmt(ang, 3)} μm apart, which is why real electron interference is magnified with electron lenses before it is photographed.`,
          visual: { type: 'qm-slits', params: { mode: 'double', kV, a: 0.5, d, hits: 3000, hide: ['lambda'], controls: false, readout: false, range: 30 }, caption: 'Electrons recorded one by one behind two slits (the histogram counts them; the orange curve is the wave’s prediction). Angles on the screen are not labelled here.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cryo-em', difficulty: 3, transfer: true,
      prompt: t`Cryo-electron microscopes, which map the shapes of proteins, typically run at 300 kV. What is the de Broglie wavelength of their electrons, in pm? (Use $pc = \sqrt{K^2 + 2Kmc^2}$ with $m_ec^2 = 511.0$ keV and $hc = 1239.8$ keV pm.)`,
      answer: lambdaFromK('electron', 3e5) * 1e12, units: 'pm', tol: { rel: 0.005 },
      errors: [{ value: lambdaNonRel('electron', 3e5) * 1e12, feedback: 'Newton’s momentum is 13% off at 300 keV: use the relativistic formula.' }],
      hints: [t`$pc = \sqrt{300^2 + 2(300)(511.0)}$ keV.`, t`$\lambda = hc/(pc)$.`],
      teach: 'At hundreds of keV, electron microscopes must use relativistic momentum to get λ right.',
      explain: t`$pc = ${fmt(Math.sqrt(300 * 300 + 2 * 300 * 510.99895), 4)}$ keV, so $\lambda = ${fmt(lambdaFromK('electron', 3e5) * 1e12, 4)}$ pm; Newton would give ${fmt(lambdaNonRel('electron', 3e5) * 1e12, 3)} pm.`,
      visual: gun('300 kV', 'The electron gun of a microscope accelerates electrons through 300 kV. Not to scale.'),
    }),
    num({
      id: 'cp-c60', difficulty: 2, transfer: true,
      prompt: t`In 1999 Markus Arndt, Anton Zeilinger and colleagues sent C₆₀ “buckyball” molecules — 60 carbon atoms, 720 u in all — through a diffraction grating and saw interference. The molecules moved at about 220 m/s. What was their de Broglie wavelength, in pm? (1 u = $1.661\times10^{-27}$ kg.)`,
      answer: lambdaFromV(MC60, 220) * 1e12, units: 'pm', tol: { rel: 0.01 },
      errors: [{ value: lambdaFromV(MC60 / 60, 220) * 1e12, feedback: 'Use the mass of the whole molecule, 720 u — it is the molecule that interferes.' }],
      hints: [t`$m = 720\times1.661\times10^{-27}$ kg; $\lambda = h/(mv)$.`],
      teach: 'Even large molecules have measurable wavelengths if they are slow and the grating fine enough.',
      explain: t`$m = ${tex(MC60, 4)}$ kg, so $\lambda = \dfrac{6.626\times10^{-34}}{${tex(MC60, 4)}\times220}\ \text{m} = ${fmt(lambdaFromV(MC60, 220) * 1e12, 3)}$ pm — hundreds of times smaller than the molecule itself, yet its interference fringes were measured.`,
      visual: crystal(30, 'Matter waves diffracted by a regular array — atoms in a crystal here; a grating of 100 nm slits in the C₆₀ experiment. Not to scale.', false),
    }),
    mcq({
      id: 'cp-baseball', difficulty: 2,
      prompt: 'Why does a baseball flying through a doorway not diffract the way an electron passing through a crystal does?',
      choices: [
        'Its de Broglie wavelength, about 10⁻³⁴ m, is absurdly small compared with the doorway',
        'Only particles without mass have a wavelength',
        'A baseball is too slow; faster objects have longer wavelengths',
        'Only charged particles behave as waves',
      ],
      answer: 0,
      why: {
        1: 'Electrons and neutrons have mass and are diffracted all the time. Every particle has λ = h/p.',
        2: 'Faster means more momentum and a shorter wavelength, not longer.',
        3: 'Neutrons and C₆₀ molecules are uncharged, and both have been diffracted.',
      },
      hints: ['Diffraction is noticeable only when the opening is not much larger than the wavelength.'],
      teach: 'Diffraction needs openings comparable to λ = h/p; for everyday objects λ is unimaginably small.',
      explain: t`$\lambda = h/(mv) \approx 10^{-34}$ m for a baseball, against a doorway of about 1 m: the spreading angle $\lambda/a \approx 10^{-34}$ rad is unmeasurable. The wave nature is there in principle, invisible in practice.`,
      visual: ladder,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §6.5 De Broglie’s matter waves', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-5-de-broglies-matter-waves' },
    { label: 'Davisson & Germer (1927), Diffraction of electrons by a crystal of nickel, Phys. Rev. 30, 705', url: 'https://doi.org/10.1103/PhysRev.30.705' },
    { label: 'Arndt et al. (1999), Wave–particle duality of C₆₀ molecules, Nature 401, 680', url: 'https://doi.org/10.1038/44348' },
  ],
});
