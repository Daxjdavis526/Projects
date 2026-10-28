// De Broglie wavelength and electron diffraction — λ = h/p for every
// particle. Davisson and Germer’s 54 eV peak read as Bragg reflection from
// planes inside the nickel crystal (and its second order); de Broglie’s
// reading of Bohr’s rule (n wavelengths round an orbit); G. P. Thomson’s
// transmission rings, as in the teaching electron-diffraction tube; the
// relativistic wavelength and when Newton’s formula fails; electron
// microscopes and their resolution; electrons against X-rays of the same
// wavelength; cold atoms in an atomic fountain. Builds on phys2220.Q1.3
// without repeating its examples. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, QE, ME, MEC2, HC_EVNM, A0 } from './_constants.js';
import { seg, label, frame, circle, r6 } from './_diagrams.js';
import { U_KG, M_CS133 } from './_quanta.js';

const t = String.raw;
const DEG = Math.PI / 180;
const MC2 = MEC2 * 1e6;                                         // eV
const lamRel = (K) => HC_EVNM / Math.sqrt(K * K + 2 * K * MC2);   // nm, K in eV
const lamNew = (K) => (H / Math.sqrt(2 * ME * K * QE)) * 1e9;     // nm, Newton’s momentum
const D_NI = 0.2158;                                             // nm, row spacing on nickel’s (111) face
const EX = { K: 54, phi: 50 };
EX.lam = lamNew(EX.K); EX.thB = 90 - EX.phi / 2; EX.d = EX.lam / (2 * Math.sin(EX.thB * DEG)); EX.dCrys = D_NI * Math.sin((EX.phi / 2) * DEG);
const GRAPHITE = [0.213, 0.123];                                 // nm: graphite’s (10) and (11) spacings, the two rings of a teaching tube

/**
 * Davisson and Germer’s geometry: electrons straight down onto the nickel
 * surface, the scattered beam at φ from the normal, and the planes inside
 * the crystal that reflect it, tilted φ/2 from the surface.
 */
function dgGeometry(phi, { labels = true, caption } = {}) {
  const s = Math.sin(phi * DEG), c = Math.cos(phi * DEG), tilt = (phi / 2) * DEG;
  const atoms = [];
  for (let row = 0; row < 3; row++) for (let i = -5; i <= 5; i++) atoms.push({ x: r6(i * 0.42 + (row % 2) * 0.21), y: -0.42 * row, r: 4, color: 'ink3' });
  const planes = [-1.26, -0.84, -0.42, 0, 0.42, 0.84, 1.26].map((x0) => seg(x0 - 0.8 * Math.cos(tilt), -0.45 + 0.8 * Math.sin(tilt), x0 + 0.8 * Math.cos(tilt), -0.45 - 0.8 * Math.sin(tilt), 'ink4', 1, true));
  return {
    type: 'graph',
    params: frame([-2.6, 2.6], [-1.3, 2.4], {
      aspect: 'wide',
      curves: [...planes, seg(-2.3, 0.1, 2.3, 0.1, 'ink2', 1.4)],
      arrows: [{ from: [0, 2.2], to: [0, 0.18], color: 'violet', label: labels ? 'electrons, 54 eV' : 'electrons', labelDx: -8, labelDy: -60, labelAlign: 'right' }, { from: [0, 0.18], to: [r6(2.0 * s), r6(0.18 + 2.0 * c)], color: 'gold', label: labels ? `strong beam at ${phi}°` : 'strong beam', labelDx: 8, labelDy: 0 }],
      points: [...atoms, label(1.6, -0.95, 'nickel crystal', 'ink3', 0, 0, 'center'), label(-1.5, -0.95, 'planes inside (dashed)', 'ink4', 0, 0, 'center')],
    }),
    caption: caption ?? 'Davisson and Germer’s geometry: electrons arrive along the normal to the nickel surface and come back strongly at one angle. Read as Bragg reflection, they bounce off planes inside the crystal (dashed) tilted at half that angle to the surface. Not to scale.',
  };
}

/** A matter wave fitting round a Bohr orbit: n wavelengths, drawn as ripples on the circle. */
const orbitWave = (n, caption) => ({
  type: 'graph',
  params: frame([-1.9, 1.9], [-1.3, 1.3], {
    aspect: 'wide',
    curves: [circle(0, 0, 1, 'ink4', 1.2, true), { polar: `1 + 0.13*cos(${n}*theta)`, theta: [0, 6.2832], color: 'accent', width: 2.2 }],
    points: [{ x: 0, y: 0, r: 6, color: 'bad' }, label(0, -1.18, `n = ${n}: the wave closes on itself`, 'accent', 0, 0, 'center')],
  }),
  caption: caption ?? 'De Broglie’s picture of a Bohr orbit: a whole number of wavelengths around the circle. A teaching model — the electron has no orbit — but it reproduces Bohr’s rule L = nħ.',
});

/** Rings on the screen of an electron-diffraction tube (two of them, schematic, no scale). */
const rings = (caption) => ({
  type: 'graph',
  params: frame([-2.3, 2.3], [-1.25, 1.25], {
    aspect: 'wide',
    curves: [circle(0, 0, 0.6, 'good', 3), circle(0, 0, 1.04, 'good', 3)],
    points: [{ x: 0, y: 0, r: 7, color: 'good' }, label(0.6 * 0.707, 0.6 * 0.707, 'inner ring', 'good', 6, -8), label(1.04 * 0.707, 1.04 * 0.707, 'outer ring', 'good', 6, -8), label(0, 0, 'straight-through spot', 'ink3', 0, 16, 'center')],
  }),
  caption: caption ?? 'The glowing screen of an electron-diffraction tube: electrons through a thin layer of graphite (crystals at every orientation) land on rings, one for each set of crystal planes. Schematic; sizes not to scale.',
});

/** An electron microscope’s objective lens accepting a cone of half-angle α from a point of the specimen. */
const lensCone = {
  type: 'graph',
  params: frame([-3.2, 3.2], [-0.4, 2.6], {
    aspect: 'wide',
    curves: [seg(0, 0, -1.4, 2, 'violet', 1.8), seg(0, 0, 1.4, 2, 'violet', 1.8), seg(0, 0, 0, 2, 'ink4', 1, true), seg(-2.2, 2, -1.5, 2, 'ink', 4), seg(1.5, 2, 2.2, 2, 'ink', 4), seg(-2.8, 0, 2.8, 0, 'warn', 3)],
    points: [{ x: 0, y: 0, r: 4, color: 'bad' }, label(0, 0, 'a point of the specimen', 'warn', 0, 16, 'center'), label(-2.2, 2, 'objective lens aperture', 'ink', 0, -14, 'left'), label(0.25, 0.9, 'α', 'ink', 8, 0)],
  }),
  caption: 'The objective lens accepts electrons scattered from each point of the specimen within a half-angle α (a few milliradians in real microscopes — drawn far wider here). Diffraction blurs each point to about 0.61λ/α.',
};

/** Wavelength against energy for photons and electrons, log–log. */
const eLambda = (lamMark) => ({
  type: 'graph',
  params: {
    x: [-3, 1], y: [-1, 6.5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge', xlabel: 'wavelength (nm)', ylabel: 'energy (eV)',
    curves: [
      { fn: `${r6(Math.log10(HC_EVNM))} - x`, color: 'violet', width: 2.4, label: 'photon: E = hc/λ', labelAt: -2.2, labelDx: 10, labelDy: -6 },
      { fn: `log(sqrt((${r6(HC_EVNM)}/10^x)^2 + ${r6(MC2 * MC2)}) - ${r6(MC2)})`, color: 'accent', width: 2.4, label: 'electron: kinetic energy', labelAt: -0.6, labelDx: -10, labelDy: 14, labelAlign: 'right' },
    ],
    vlines: [{ x: r6(Math.log10(lamMark)), label: `λ = ${lamMark} nm`, color: 'gold' }],
  },
  caption: 'The energy a photon and an electron need for a given wavelength (logarithmic scales; the electron’s from relativistic momentum). At atomic wavelengths an electron needs about a hundred times less energy than an X-ray photon.',
});

export default lesson({
  id: 'phys2710.MP6.1',
  title: 'De Broglie wavelength and electron diffraction',
  minutes: 14, difficulty: 3,
  intro: t`In 1924 Louis de Broglie proposed that every particle has a wavelength set by its momentum,

$$\lambda = \frac{h}{p}$$

and that Bohr’s quantum rule simply says a whole number of these waves must fit around an orbit. In 1927 two experiments found the waves. Clinton Davisson and Lester Germer, firing 54 eV electrons at a nickel crystal, saw a strong beam come back at 50° — Bragg reflection from planes inside the crystal, of exactly the predicted wavelength. George Paget Thomson sent faster electrons through thin metal foils and photographed diffraction rings. Today the same waves, shortened by relativistic momenta, let electron microscopes resolve single columns of atoms.

> The first look was [De Broglie waves](#/lesson/phys2220.Q1.3), with Davisson and Germer’s surface-grating reading. Here: the planes inside the crystal, rings, relativity and resolution.`,
  symbols: [
    { tex: '\\lambda', text: 'the particle’s de Broglie wavelength, in m (for electrons usually nm or pm)' },
    { tex: 'h', text: t`Planck’s constant, $6.626\times10^{-34}$ J s` },
    { tex: 'p', text: t`the particle’s momentum: $\sqrt{2mK}$ when its kinetic energy $K \ll mc^2$, and in general $pc = \sqrt{K^2 + 2Kmc^2}$; for an electron from rest through a voltage $V$, $K = eV$` },
  ],
  why: 'Matter waves are the bridge to the Schrödinger equation (module MP7), and their tiny wavelengths are why electron microscopes, electron diffraction and neutron diffraction read the structure of everything from metals to viruses.',
  visual: {
    type: 'graph',
    title: 'Davisson and Germer’s polar plot',
    lead: t`Electrons come straight down onto the nickel surface (violet arrow). The blue curve is how many come back in each direction — its distance from the centre — drawn like Davisson and Germer’s own polar diagrams. Change the accelerating voltage $V$ and watch the spur: it points where $D\sin\varphi = \lambda$ for the surface rows, $D = 0.2158$ nm, and is strongest near 54 V.`,
    tasks: [
      'Start at 40 V and raise V: a spur grows near 64°, swings to 50° at 54 V, where it is strongest, and fades by 70 V while still swinging toward the normal.',
      'At 54 V read λ: 0.167 nm, the spacing of atoms in a solid — the reason a crystal can diffract electrons at all.',
      'Compare the readouts at 36 V and 72 V: doubling V shortens λ by √2, and the predicted spur swings from 71° to 42°.',
    ],
    params: {
      x: [-1.9, 2.3], y: [-0.4, 2.15], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [{ key: 'V', label: 'Accelerating voltage $V$', min: 34, max: 80, step: 0.5, value: 48, unit: '\\mathrm{V}', explain: 'The electrons’ kinetic energy is $eV$, so $\\lambda = h/\\sqrt{2meV} = 1.2264\\ \\text{nm}/\\sqrt{V/\\text{volt}}$.' }],
      curves: [
        { param: ['(0.45 + 0.12*cos(t) + 0.95*exp(-((V - 54)/8)^2)*exp(-((0.2158*sin(t)*sqrt(V)/1.2264 - 1)/0.05)^2))*sin(t)', '(0.45 + 0.12*cos(t) + 0.95*exp(-((V - 54)/8)^2)*exp(-((0.2158*sin(t)*sqrt(V)/1.2264 - 1)/0.05)^2))*cos(t)'], t: [0, 1.5708], color: 'accent', width: 2.6 },
        { param: ['1.75*sin(t)', '1.75*cos(t)'], t: [0, 1.5708], color: 'ink4', width: 1, dash: true },
        seg(-1.8, 0, 2.0, 0, 'ink2', 1.6),
      ],
      arrows: [
        { from: [-0.07, 2.0], to: [-0.07, 0.05], color: 'violet', label: 'incoming electrons', labelDx: -10, labelDy: -6, labelAlign: 'right' },
        { from: [0, 0], to: ['1.85*1.2264/(0.2158*sqrt(V))', '1.85*sqrt(1 - (1.2264/(0.2158*sqrt(V)))^2)'], color: 'gold', width: 1.4, dash: [5, 4], label: 'D sin φ = λ', labelDx: 6, labelDy: -4 },
      ],
      points: [label(0, 1.75, '0°', 'ink3', 8, -10), label(1.75 * Math.sin(30 * DEG), 1.75 * Math.cos(30 * DEG), '30°', 'ink3', 6, -6), label(1.75 * Math.sin(60 * DEG), 1.75 * Math.cos(60 * DEG), '60°', 'ink3', 8, -4), label(1.75, 0, '90°', 'ink3', 6, -8), label(-1.1, 0, 'nickel crystal', 'ink3', 0, 12, 'center')],
      readouts: [{ label: '$\\lambda = h/\\sqrt{2meV}$', expr: '1.2264/sqrt(V)', unit: '\\mathrm{nm}', digits: 4 }, { label: 'predicted spur angle $\\varphi$', expr: 'asin(1.2264/(0.2158*sqrt(V)))*180/pi', unit: '^\\circ', digits: 3 }],
    },
    caption: 'After Davisson and Germer’s 1927 polar plots, schematic: the spur’s direction follows the surface-grating condition D sin φ = λ; its strength, which peaks near 54 V where reflection from the planes inside the crystal also matches, and the smooth background are modelled, not their data. Angles are measured from the normal.',
  },
  example: {
    prompt: t`Davisson and Germer’s strongest beam came back at $\varphi = ${EX.phi}°$ from the normal when the electrons had ${EX.K} eV. Treat it as Bragg reflection from planes *inside* the nickel crystal: find the glancing angle and the spacing of the planes the de Broglie wavelength requires, compare it with the crystal’s geometry, and predict the voltage at which the second-order reflection appears at the same angle.`,
    visual: dgGeometry(EX.phi),
    steps: [
      { label: 'The wavelength', text: t`$K = ${EX.K}$ eV $\ll m_ec^2$, so $p = \sqrt{2m_eK}$ and $\lambda = h/p = ${fmt(EX.lam, 4)}$ nm.` },
      { label: 'Which planes', text: t`A reflecting plane must be perpendicular to the difference between the outgoing and incoming directions. The incoming beam is straight down and the outgoing one is ${EX.phi}° from straight up, so the planes are tilted $\varphi/2 = ${EX.phi / 2}°$ from the surface, and the electrons meet them at the glancing angle $\theta = 90° - ${EX.phi / 2}° = ${EX.thB}°$.` },
      { label: 'Bragg’s law', text: t`$2d\sin\theta = \lambda$ gives $d = \dfrac{${fmt(EX.lam, 4)}\ \text{nm}}{2\sin ${EX.thB}°} = ${fmt(EX.d, 3)}$ nm.` },
      { label: 'The crystal’s geometry', text: t`Those planes pass through the surface rows, $D = ${D_NI}$ nm apart, at ${EX.phi / 2}°: their spacing is $D\sin ${EX.phi / 2}° = ${fmt(EX.dCrys, 3)}$ nm. The de Broglie wavelength fits to about 1% — and the surface-grating reading, $D\sin\varphi = \lambda$, is the same condition seen from outside ($2D\sin\tfrac\varphi2\cos\tfrac\varphi2 = D\sin\varphi$).` },
      { label: 'Second order', text: t`At the same angle, $2d\sin\theta = 2\lambda'$ needs $\lambda' = \lambda/2$, so $p$ doubles and $K = p^2/2m$ quadruples: about $4\times${EX.K} = ${4 * EX.K}$ V.` },
      { label: 'Sense check', text: t`The leftover 1% is real physics: electrons speed up as they cross into the metal, attracted by its positive ions, so their wavelength *inside* is a little shorter. Davisson and Germer had to correct for this “refraction” of matter waves.` },
    ],
    answer: t`$\lambda = ${fmt(EX.lam, 3)}$ nm; glancing angle ${EX.thB}°; $d = ${fmt(EX.d, 3)}$ nm against ${fmt(EX.dCrys, 3)} nm from the crystal; second order at about ${4 * EX.K} V.`,
  },
  practice: [
    num({
      id: 'bohr-wave', difficulty: 1,
      gen(r) {
        const n = r.pick([1, 2, 3, 4]), lam = 2 * Math.PI * A0 * 1e9 * n;
        return {
          prompt: t`In Bohr’s model of hydrogen the electron in level $n$ moves at $v_n = \alpha c/n$, with $\alpha = 1/137.036$. What is its de Broglie wavelength in level $n = ${n}$, in nm?`,
          answer: lam, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: lam / n / n, feedback: t`The speed falls as $1/n$, so the wavelength grows as $n$: $\lambda_n = h/(m_ev_n)$.` }].filter(() => n > 1),
          hints: [t`$\lambda = \dfrac{h}{m_ev_n} = \dfrac{h\,n}{m_e\alpha c}$.`, t`$\dfrac{h}{m_e\alpha c} = 2\pi a_0 = 0.3325$ nm, with $a_0 = 0.052\,918$ nm.`],
          teach: 'De Broglie read Bohr’s rule L = nħ as “n wavelengths fit around the orbit”: 2πrₙ = nλₙ.',
          explain: t`$\lambda_${n} = ${n}\times2\pi a_0 = ${fmt(lam, 4)}$ nm, while the orbit’s circumference is $2\pi n^2a_0 = ${fmt(lam * n, 4)}$ nm — exactly ${n} wavelength${n > 1 ? 's' : ''}. That is $mvr = n\hbar$ in disguise.`,
          visual: orbitWave(Math.max(n, 3)),
        };
      },
    }),
    num({
      id: 'thomson-rings', difficulty: 2,
      gen(r) {
        const kV = r.pick([3, 4, 5]), [d, which] = r.pick([[GRAPHITE[0], 'inner'], [GRAPHITE[1], 'outer']]), L = 0.135;
        const lam = lamRel(kV * 1e3), th = Math.asin(lam / (2 * d)), R = L * Math.tan(2 * th) * 1000;
        return {
          prompt: t`A teaching electron-diffraction tube fires ${kV}.0 kV electrons through a thin layer of graphite onto a screen 13.5 cm beyond it. The ${which} ring comes from planes spaced ${d} nm apart. What is the ring’s radius on the screen, in mm? (The electrons’ wavelength is ${fmt(lam * 1000, 4)} pm.)`,
          answer: R, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: L * Math.tan(th) * 1000, feedback: t`The beam is turned through $2\theta$, twice the Bragg angle — the angle between the incoming and the reflected direction.` }],
          hints: [t`Bragg: $\sin\theta = \lambda/2d$. The diffracted beam leaves at $2\theta$ to the straight-through beam.`, t`The ring’s radius is $R = L\tan 2\theta$ with $L = 135$ mm (and for small angles, $R \approx L\lambda/d$).`],
          teach: 'Each set of crystal planes, met at every orientation in a powder, sends electrons onto a cone of half-angle 2θ: a ring on the screen.',
          explain: t`$\sin\theta = ${fmt(lam, 4)}/(2\times${d})$, so $\theta = ${fmt(th / DEG, 3)}°$ and $R = 135\tan ${fmt((2 * th) / DEG, 3)}° = ${fmt(R, 3)}$ mm. The rings shrink as the voltage rises — with $R \propto \lambda \propto 1/\sqrt V$ — which is G. P. Thomson’s 1927 test of de Broglie’s formula.`,
          visual: rings(),
        };
      },
    }),
    num({
      id: 'tem-resolution', difficulty: 2,
      gen(r) {
        const kV = r.pick([100, 200, 300]), a = r.pick([5, 10, 15]);
        const lam = lamRel(kV * 1e3), res = (0.61 * lam) / (a * 1e-3);
        return {
          prompt: t`A transmission electron microscope runs at ${kV} kV (electron wavelength ${fmt(lam * 1000, 4)} pm) with an objective aperture of half-angle ${a} mrad. What is its diffraction-limited resolution, $0.61\lambda/\alpha$, in nm?`,
          answer: res, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: (0.61 * lam) / a, feedback: 'Convert the angle to radians: 1 mrad = 0.001 rad.' }],
          hints: [t`$\alpha = ${a}\times10^{-3}$ rad.`, t`$d = 0.61\times${fmt(lam * 1000, 4)}\ \text{pm}/(${a}\times10^{-3})$.`],
          teach: 'An electron microscope’s resolution is set by λ/α: tiny wavelengths, but also tiny apertures, because magnetic lenses blur wide cones.',
          explain: t`$d = 0.61\times${fmt(lam, 4)}\ \text{nm}/${tex(a * 1e-3, 2)} = ${fmt(res, 3)}$ nm — about the spacing of atoms. A light microscope at best manages about 200 nm. Why not open the aperture wider? Magnetic lenses have large spherical aberration, which grows as $\alpha^3$; aberration-corrected instruments now reach about 0.05 nm.`,
          visual: lensCone,
        };
      },
    }),
    num({
      id: 'newton-fails', difficulty: 3,
      gen(r) {
        const pct = r.pick([1, 2, 5]), kV = (2 * MC2 * ((1 + pct / 100) ** 2 - 1)) / 1e3;
        return {
          prompt: t`Newton’s momentum $p = \sqrt{2mK}$ makes an electron’s wavelength too long by the factor $\sqrt{1 + K/2mc^2}$. Above what accelerating voltage is Newton’s wavelength more than ${pct}% too long, in kV? ($m_ec^2 = 511.0$ keV.)`,
          answer: kV, units: 'kV', tol: { rel: 0.01 },
          errors: [{ value: (2 * MC2 * (pct / 100)) / 1e3, feedback: t`Square the factor first: $\sqrt{1 + K/2mc^2} = ${1 + pct / 100}$ means $K/2mc^2 = ${1 + pct / 100}^2 - 1$.` }],
          hints: [t`Relativistically $pc = \sqrt{K^2 + 2Kmc^2} = \sqrt{2Kmc^2}\,\sqrt{1 + K/2mc^2}$, so Newton’s $\lambda$ is too long by $\sqrt{1 + K/2mc^2}$.`, t`Set $\sqrt{1 + K/2mc^2} = ${1 + pct / 100}$: $K = 2mc^2\left(${1 + pct / 100}^2 - 1\right)$ with $2mc^2 = 1022$ keV.`],
          teach: 'Electron wavelengths need relativistic momentum above a few tens of kilovolts — every electron microscope runs there.',
          explain: t`$K = 1022\ \text{keV}\times(${fmt((1 + pct / 100) ** 2 - 1, 4)}) = ${fmt(kV, 3)}$ keV, so $V = ${fmt(kV, 3)}$ kV. Microscopes at 100–300 kV are well into the relativistic range.`,
          visual: {
            type: 'graph',
            params: {
              x: [2, 6], y: [0.995, 1.36], aspect: 'wide', xlog: true, xlabel: 'accelerating voltage (V)', ylabel: 'Newton’s λ ÷ true λ',
              curves: [{ fn: `sqrt(1 + 10^x/${r6(2 * MC2)})`, color: 'accent', width: 2.4 }],
              hlines: [{ y: 1 + pct / 100, label: `${pct}% too long`, color: 'gold' }],
            },
            caption: 'How far Newton’s formula overestimates an electron’s wavelength, against the accelerating voltage (logarithmic axis).',
          },
        };
      },
    }),
    num({
      id: 'electron-vs-xray', difficulty: 2,
      gen(r) {
        const [lam, what] = r.pick([[0.154, 'copper Kα X-rays, 0.154 nm'], [0.0711, 'molybdenum Kα X-rays, 0.0711 nm'], [0.1, '0.100 nm']]);
        const K = Math.sqrt((HC_EVNM / lam) ** 2 + MC2 * MC2) - MC2;
        return {
          prompt: t`To probe a crystal with the same wavelength as ${what}, how much kinetic energy would an electron need, in eV?`,
          answer: K, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: HC_EVNM / lam, feedback: t`That is a *photon’s* energy, $hc/\lambda$. For an electron, $p = h/\lambda$ and $K = p^2/2m$.` }],
          hints: [t`$p = h/\lambda$, and for a slow electron $K = p^2/2m_e = \dfrac{h^2}{2m_e\lambda^2}$.`, t`$\dfrac{h^2}{2m_e} = 1.504\ \text{eV nm}^2$, so $K = 1.504/${lam}^2$ eV.`],
          teach: 'At the same wavelength an electron carries far less energy than a photon, because it has mass: K = h²/2mλ² against E = hc/λ.',
          explain: t`$K = 1.504/${lam}^2 = ${fmt(K, 3)}$ eV, against $${fmt(HC_EVNM / lam / 1000, 3)}$ keV for the X-ray photon. Slow electrons barely penetrate a crystal, so they see only its top few layers: low-energy electron diffraction (LEED) is how surfaces are studied, while X-rays probe the bulk.`,
          visual: eLambda(lam),
        };
      },
    }),
    mcq({
      id: 'why-crystal', difficulty: 2,
      prompt: 'Why did Davisson and Germer need a crystal — rather than a ruled grating like those used for light — to diffract their electrons?',
      choices: [
        'A 54 eV electron’s wavelength, 0.17 nm, is far shorter than any ruled spacing; only the regular rows of atoms in a crystal are close enough together',
        'Electrons are charged, so only a metal can diffract them',
        'A grating would absorb every electron, while a crystal reflects them',
        'Electrons diffract only from three-dimensional objects',
      ],
      answer: 0,
      why: {
        1: 'Neutral neutrons and atoms diffract too; what matters is a spacing comparable to the wavelength.',
        2: 'In 1927 nobody could rule a grating fine enough; today nanofabricated gratings of 100 nm slits diffract slow molecules and electrons.',
        3: 'Two-slit and single-slit electron diffraction exist; the crystal is needed for its spacing, not its depth.',
      },
      hints: ['Diffraction is noticeable only when the spacing is comparable to the wavelength. Compare 0.17 nm with a grating ruled at, say, 1000 lines per mm.'],
      teach: 'To diffract a wave you need structure on the scale of its wavelength; for slow electrons that means the atoms of a crystal.',
      explain: 'Ruled gratings have spacings of about a micrometre — thousands of times the electron’s wavelength, so the diffraction angles would be unmeasurably small. The atoms of a crystal sit about 0.2 nm apart, like a grating built by nature; X-ray crystallography had used them the same way since 1912.',
      visual: dgGeometry(50, { labels: false, caption: 'Electrons striking a nickel crystal, whose atoms form a natural grating with spacings near 0.2 nm. Not to scale.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fountain', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([1, 3, 4]), m = M_CS133 * U_KG, lam = (H / (m * v)) * 1e9;
        return {
          prompt: t`An atomic-fountain clock — the kind that defines the second — and the atom interferometers used as precision gravimeters toss laser-cooled cesium-133 atoms upward at a few metres per second. What is the de Broglie wavelength of a cesium atom moving at ${v} m/s, in nm? (Mass: ${fmt(M_CS133, 7)} u, with 1 u $= 1.661\times10^{-27}$ kg.)`,
          answer: lam, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: (H / (ME * v)) * 1e9, feedback: 'That uses the electron’s mass. The whole atom has the wavelength: use the cesium atom’s mass.' }],
          hints: [t`$m = ${fmt(M_CS133, 7)}\times1.661\times10^{-27}$ kg $= ${tex(m, 4)}$ kg.`, t`$\lambda = h/(mv)$.`],
          teach: 'Whole atoms have de Broglie waves; cooled to centimetres or metres per second, their wavelengths reach nanometres.',
          explain: t`$\lambda = \dfrac{6.626\times10^{-34}}{${tex(m, 4)}\times${v}}\ \text{m} = ${fmt(lam, 3)}$ nm. In an atom interferometer each atom’s wave is split by laser pulses and recombined; the phase difference between its two paths measures the acceleration of gravity to parts in $10^{9}$ — and tests the equivalence principle at the heart of general relativity.`,
          visual: {
            type: 'graph',
            params: frame([-3, 3], [-0.3, 3.3], {
              aspect: 'wide',
              curves: [{ fn: '3 - (x/1.1)^2', domain: [-1.7, 1.7], color: 'accent', width: 2, dash: true }, seg(-0.6, 0.15, 0.6, 0.15, 'ink2', 3)],
              points: [{ x: -1.2, y: r6(3 - (1.2 / 1.1) ** 2), r: 5, color: 'gold' }, label(-1.2, 3 - (1.2 / 1.1) ** 2, `cesium atoms, ${v} m/s`, 'gold', -8, 0, 'right'), label(0, 0.15, 'laser-cooled cloud', 'ink2', 0, 14, 'center'), label(0, 3, 'tossed up, falling back', 'accent', 0, -12, 'center')],
            }),
            caption: 'An atomic fountain: a cloud of laser-cooled atoms is tossed upward and falls back under gravity. Schematic.',
          },
        };
      },
    }),
    num({
      id: 'cp-voltage-from-ring', difficulty: 3,
      gen(r) {
        const Rmm = r.pick([10.5, 12.0, 14.0]), d = GRAPHITE[0], L = 135;
        const th = Math.atan(Rmm / L) / 2, lam = 2 * d * Math.sin(th);              // nm
        const pc = HC_EVNM / lam, K = Math.sqrt(pc * pc + MC2 * MC2) - MC2;
        return {
          prompt: t`In the same graphite tube (screen 135 mm beyond the graphite), the inner ring — planes 0.213 nm apart — has radius ${Rmm} mm. What accelerating voltage is the tube running at, in kV?`,
          answer: K / 1000, units: 'kV', tol: { rel: 0.02 },
          errors: [{ value: (Math.sqrt((HC_EVNM / (2 * d * Math.sin(Math.atan(Rmm / L)))) ** 2 + MC2 * MC2) - MC2) / 1000, feedback: t`The ring is at $2\theta$ from the straight-through beam, so $\theta = \tfrac12\tan^{-1}(R/L)$ — half the angle you used.` }],
          hints: [t`$2\theta = \tan^{-1}(${Rmm}/135)$, then $\lambda = 2d\sin\theta$.`, t`$K = h^2/2m\lambda^2 = 1.504\ \text{eV nm}^2/\lambda^2$ (Newton is fine to 1% at a few kV).`],
          teach: 'A ring’s radius gives the wavelength through Bragg’s law, and the wavelength gives the electrons’ energy.',
          explain: t`$2\theta = ${fmt((2 * th) / DEG, 3)}°$, so $\lambda = 2(0.213)\sin ${fmt(th / DEG, 3)}° = ${fmt(lam * 1000, 4)}$ pm and $K = ${fmt(K / 1000, 3)}$ keV: the tube runs at about ${fmt(K / 1000, 2)} kV.`,
          visual: rings(),
        };
      },
    }),
    mcq({
      id: 'cp-microscope', difficulty: 2,
      prompt: 'Why can an electron microscope resolve individual columns of atoms when no light microscope can?',
      choices: [
        'Its electrons’ wavelength, a few picometres at 100–300 kV, is about a hundred thousand times shorter than visible light’s',
        'Electrons are smaller than photons',
        'Magnetic lenses are perfect, unlike glass ones',
        'Electrons stick to atoms, outlining them',
      ],
      answer: 0,
      why: {
        1: 'Neither has a size in that sense; what limits resolution is the wavelength of the wave that forms the image.',
        2: 'Magnetic lenses are far worse than glass ones — their aberrations force tiny apertures — yet the short wavelength wins anyway.',
        3: 'Imaging electrons pass through a thin specimen; contrast comes from how atoms scatter their waves.',
      },
      hints: ['Resolution is limited by diffraction: about λ divided by the aperture angle.'],
      teach: 'Resolution scales with wavelength: picometre electron waves resolve atoms, half-micrometre light cannot.',
      explain: t`A 200 kV electron has $\lambda = ${fmt(lamRel(2e5) * 1000, 3)}$ pm, against about 500 nm for green light. Even with apertures a hundred times narrower than a light microscope’s, that leaves resolution near 0.1 nm — the size of an atom.`,
      visual: lensCone,
    }),
  ],
  sources: [
    { label: 'Davisson & Germer (1927), Diffraction of electrons by a crystal of nickel, Phys. Rev. 30, 705', url: 'https://doi.org/10.1103/PhysRev.30.705' },
    { label: 'Thomson & Reid (1927), Diffraction of cathode rays by a thin film, Nature 119, 890', url: 'https://doi.org/10.1038/119890a0' },
    { label: 'de Broglie (1924), Recherches sur la théorie des quanta (thesis); Nobel lecture 1929', url: 'https://www.nobelprize.org/prizes/physics/1929/broglie/lecture/' },
    { label: 'OpenStax University Physics Vol. 3, §6.5 De Broglie’s matter waves', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-5-de-broglies-matter-waves' },
  ],
});
