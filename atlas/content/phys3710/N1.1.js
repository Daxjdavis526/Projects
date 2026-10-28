// Nuclear size, mass and binding energy, at Krane’s level. How the radius is
// measured: electrons scattered from a nucleus make a diffraction pattern
// whose first minimum gives R (uniform sphere: qR = 4.493); the charge
// density has a flat interior at about 0.16 nucleons/fm³ and a skin of
// fixed thickness, so R = 1.2 A^(1/3) fm fits heavy nuclei and light ones
// sit higher. Mirror nuclei measure R a second way, from the Coulomb
// energy. Masses: AME2020 mass excesses, separation energies and the
// magic numbers. PHYS 2220 A1.2 did binding energies from masses, the
// radius ratio and the density; PHYS 2710 MP13.1 the liquid drop. This
// lesson does not repeat them.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as Nu from '../../src/viz/model/qm-nuclear.js';
import { U, M_N, KE2, HBARC, AME, mass, excess, Q, Sn, uni, r6, seg, label } from './_nuclear.js';

const t = String.raw;
const DNH = (M_N - AME['H-1'][1]) * U;            // MeV, (mₙ − m_H)c² = 0.782
const XH = excess('H-1') * 1000, XN = (M_N - 1) * U * 1000;   // keV, mass excesses of ¹H and the neutron
const X0 = 4.4934;                                 // first zero of 3j₁(x)/x, the uniform sphere’s form factor

/** Measured rms charge radii (fm; Angeli & Marinova 2013) and the uniform sphere with the same rms radius, R = √(5/3)·r_rms. */
const RMS = { 'C-12': 2.4702, 'O-16': 2.6991, 'Ca-40': 3.4776, 'Fe-56': 3.7377, 'Sn-120': 4.6519, 'Pb-208': 5.5012, 'U-238': 5.8571 };
const REQ = Object.fromEntries(Object.entries(RMS).map(([k, r]) => [k, Math.sqrt(5 / 3) * r]));
const NAME = { 'C-12': 'carbon-12', 'O-16': 'oxygen-16', 'Ca-40': 'calcium-40', 'Fe-56': 'iron-56', 'Sn-120': 'tin-120', 'Pb-208': 'lead-208', 'U-238': 'uranium-238' };

// ---- mirror nuclei: a proton turned into a neutron, all else equal
const MIRRORS = {
  'O-15': { d: 'N-15', p: 'oxygen-15', dn: 'nitrogen-15' },
  'C-11': { d: 'B-11', p: 'carbon-11', dn: 'boron-11' },
  'N-13': { d: 'C-13', p: 'nitrogen-13', dn: 'carbon-13' },
  'F-17': { d: 'O-17', p: 'fluorine-17', dn: 'oxygen-17' },
  'Ca-39': { d: 'K-39', p: 'calcium-39', dn: 'potassium-39' },
  'Sc-41': { d: 'Ca-41', p: 'scandium-41', dn: 'calcium-41' },
};
const mirror = (p) => {
  const { d } = MIRRORS[p], Z = AME[p][0], A = +p.split('-')[1], dM = Q([p], [d]), dEC = dM + DNH;
  return { Z, A, dM, dEC, R: (0.6 * KE2 * 2 * (Z - 1)) / dEC };
};
const O15 = mirror('O-15');

// ---- pictures
/** The nucleon density of a nucleus (a Fermi function) beside the uniform sphere R = 1.2A^(1/3). A is a number or a slider key. */
function profile(A, { extra = {}, caption } = {}) {
  const c = `(1.12*(${A})^(1/3) - 0.86*(${A})^(-1/3))`, Req = `1.2*(${A})^(1/3)`;
  return {
    type: 'graph',
    params: {
      x: [0, 11], y: [0, 0.2], aspect: 'wide', axesAt: 'edge', xlabel: 'distance from the centre r (fm)', ylabel: 'nucleons per fm³',
      shade: [{ fn: `0.16/(1 + exp((x - ${c})/0.54))`, from: 0, to: 11, color: 'accent', alpha: 0.18 }],
      curves: [
        { fn: `0.16/(1 + exp((x - ${c})/0.54))`, color: 'accent', width: 2.8, label: 'measured shape (Fermi fit)', labelAt: 0.4, labelDy: -12 },
        { fn: `0.138*step(${Req} - x)`, color: 'gold', width: 2, dash: true, label: 'uniform sphere, R = 1.2 ∛A fm', labelAt: 0.4, labelDy: 14 },
      ],
      vlines: [{ x: `${c} - 1.2`, color: 'ink4' }, { x: `${c} + 1.2`, color: 'ink4' }],
      points: [{ x: c, y: 0.185, r: 0.01, color: 'ink2', label: '← skin 2.4 fm →', labelDx: 0, labelDy: 0, labelAlign: 'center' }],
      ...extra,
    },
    caption: caption ?? t`The density of nucleons against distance from the centre: a flat interior near 0.16 nucleons per fm³ and a skin about 2.4 fm thick (90% to 10% of the central density) for every nucleus. A Fermi-function fit with typical parameters (half-density radius $1.12A^{1/3} - 0.86A^{-1/3}$ fm, diffuseness 0.54 fm); light nuclei deviate from it. Dashed: the uniform sphere with $R = 1.2A^{1/3}$ fm.`,
  };
}

/** Electron scattering from a uniform sphere of radius R (fm) at energy E (MeV): |F|² on a log scale against angle. */
function diffraction(E, R, { mark = null, caption, th = [3, 90] } = {}) {
  const k = r6(2 * E / HBARC), u = `(${k}*sin(x*pi/360)*${r6(R)})`;
  return {
    type: 'graph',
    params: {
      x: th, y: [-6, 0.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'scattering angle θ (degrees)', ylabel: 'form factor |F|²',
      curves: [{ fn: `log10(max(0.000001, (3*(sin(${u}) - ${u}*cos(${u}))/${u}^3)^2))`, domain: th, color: 'accent', width: 2.4 }],
      ...(mark ? { vlines: [{ x: mark, label: 'first minimum', color: 'gold' }] } : {}),
    },
    caption: caption ?? `What a uniformly charged sphere does to ${E} MeV electrons: the scattering rate, divided by that from a point charge, falls in a diffraction pattern with sharp zeros. A real nucleus, with its soft edge, fills the zeros in to shallow minima.`,
  };
}

/** Uniform-sphere radii from measured charge radii against A^(1/3), with R = 1.2A^(1/3). */
function radii({ caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0, 6.6], y: [0, 8.5], aspect: 'wide', axesAt: 'edge', xlabel: 'cube root of the mass number, ∛A', ylabel: 'equivalent radius R (fm)',
      curves: [{ fn: '1.2*x', color: 'gold', width: 2, dash: true, label: 'R = 1.2 ∛A fm', labelAt: 5.2, labelDy: 18 }],
      points: Object.entries(REQ).map(([k, R]) => ({ x: r6(Math.cbrt(+k.split('-')[1])), y: r6(R), r: 5, color: 'accent', label: uni(k), labelDx: -6, labelDy: -12, labelAlign: 'right' })),
    },
    caption: caption ?? t`Each nucleus’s uniform-sphere radius, $\sqrt{5/3}$ times its measured rms charge radius (Angeli and Marinova, 2013), against the cube root of its mass number. Heavy nuclei follow $1.2A^{1/3}$ fm closely; light ones lie above it, because the skin is a larger part of them.`,
  };
}

/** Energy levels of a mirror pair’s atoms: the parent sits above the daughter by Q_EC. */
function mirrorLevels(p, d, { showQ = true, caption } = {}) {
  const m = mirror(p);
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [-0.8, 4.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [seg(1, 3.6, 4.2, 3.6, 'warn', 3), seg(5.8, 0, 9, 0, 'accent', 3)],
      arrows: [{ from: [4.4, 3.5], to: [5.7, 0.15], color: 'ink3', width: 1.6 }],
      points: [label(2.6, 3.6, `${uni(p)}: Z = ${m.Z}, N = ${m.A - m.Z}`, 'warn', 0, -13, 'center'), label(7.4, 0, `${uni(d)}: Z = ${m.Z - 1}, N = ${m.A - m.Z + 1}`, 'accent', 0, -13, 'center'),
        label(5.2, 1.9, showQ ? `β⁺ / electron capture, ${fmt(m.dM, 4)} MeV` : 'β⁺ / electron capture', 'ink2', 8, 0, 'left'),
        label(2.6, 3.6, 'one more proton, one fewer neutron', 'ink3', 0, 14, 'center'), label(7.4, 0, 'same nuclear force, less repulsion', 'ink3', 0, 14, 'center')],
    },
    caption: caption ?? 'A mirror pair: swap one proton for a neutron and the nuclear force does not notice (charge symmetry). The heavier atom decays to the lighter. Heights are schematic.',
  };
}

/** Two bars: the separation energies of the last neutron in a nucleus with a closed shell and in the next one. */
function snBars(a, b, { hideB = false, caption } = {}) {
  const sa = Sn(a), sb = Sn(b);
  return {
    type: 'graph',
    params: {
      x: [0, 4], y: [0, 18], aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'neutron separation energy (MeV)',
      shade: [{ fn: String(r6(sa)), from: 0.6, to: 1.6, color: 'accent', alpha: 0.5 }, { fn: String(r6(sb)), from: 2.4, to: 3.4, color: hideB ? 'ink4' : 'warn', alpha: hideB ? 0.15 : 0.5 }],
      points: [label(1.1, sa, `${uni(a)}: ${fmt(sa, 4)} MeV`, 'accent', 0, -12, 'center'), label(2.9, hideB ? 9 : sb, hideB ? `${uni(b)}: ?` : `${uni(b)}: ${fmt(sb, 4)} MeV`, hideB ? 'ink3' : 'warn', 0, -12, 'center')],
    },
    caption: caption ?? 'The energy needed to pull the last neutron out of each nucleus, from AME2020 masses.',
  };
}

export default lesson({
  id: 'phys3710.N1.1',
  title: 'Nuclear size, mass and binding energy',
  minutes: 16, difficulty: 3,
  intro: t`How big is a nucleus, and how do we know? Fire electrons at it. An electron feels only the electric charge, so the pattern it scatters into is a picture of how that charge is spread — and, like light through a pinhole, it has a **diffraction minimum** whose angle gives the size. Every nucleus turns out to have the same interior density, about 0.16 nucleons per fm³, and a soft skin of the same thickness, so its radius grows as the cube root of its mass number. Its mass, measured to a part in $10^{10}$, then gives the **binding energy**:

$$R \approx R_0A^{1/3},\ R_0 = 1.2\ \text{fm}, \qquad B = \left[Z\,M({}^1\text{H}) + N m_n - M(A, Z)\right]c^2$$

You computed binding energies in [PHYS 2220 A1.2](#/lesson/phys2220.A1.2); here they become a measuring tool — for radii, and for the shells hidden inside nuclei.`,
  symbols: [
    { tex: 'R', text: 'the nuclear radius: the radius of the uniformly charged sphere that scatters electrons the same way (the “equivalent radius”), in femtometres ($1\\ \\text{fm} = 10^{-15}$ m)' },
    { tex: 'R_0', text: 'the radius parameter, about 1.2 fm for heavy nuclei — a fit to electron-scattering data, not a constant of nature' },
    { tex: 'A', text: 'the mass number, $A = Z + N$: the number of nucleons' },
    { tex: 'Z,\\ N', text: 'the numbers of protons and of neutrons' },
    { tex: 'B', text: 'the binding energy: the energy needed to separate the nucleus into free protons and neutrons, in MeV' },
    { tex: 'M({}^1\\text{H})', text: 'the mass of a hydrogen atom, 1.007 825 032 u: a proton plus an electron, so the electrons balance against those of the atom' },
    { tex: 'm_n', text: 'the mass of a neutron, 1.008 664 916 u' },
    { tex: 'M(A, Z)', text: 'the **atomic** mass of the nuclide (AME2020), in u; $1\\ \\text{u}\\,c^2 = 931.494$ MeV' },
  ],
  why: 'Nuclear radii set the Coulomb barriers that decide fusion in stars and the energy of fission, and binding energies — read through separation energies — reveal the magic numbers that shape every nuclear process.',
  visual: {
    ...profile('A', {
      extra: {
        sliders: [{ key: 'A', label: 'Mass number $A$', min: 4, max: 240, step: 1, value: 208, explain: 'From helium-4 to uranium. The interior density stays the same; only the size changes.' }],
        readouts: [
          { label: t`equivalent radius $1.2A^{1/3}$`, expr: '1.2*A^(1/3)', unit: t`\text{fm}`, digits: 3 },
          { label: 'half-density radius', expr: '1.12*A^(1/3) - 0.86*A^(-1/3)', unit: t`\text{fm}`, digits: 3 },
        ],
      },
    }),
    title: 'A nucleus has a flat middle and a soft edge',
    lead: t`The blue curve is the density of nucleons at each distance from the centre, as electron scattering measures it; the dashed gold step is the uniform sphere with $R = 1.2A^{1/3}$ fm. Watch what changes, and what does not, as you go from light to heavy.`,
    tasks: [
      'Slide A from 208 down to 16: the interior density stays at about 0.16 nucleons per fm³ — nuclear matter does not compress, the mark of a short-range, saturating force.',
      'The skin between the two thin lines stays 2.4 fm thick. For oxygen-16 it is most of the nucleus; for lead-208 a thin rind.',
      'Compare the two radii in the readout: the soft edge is why “the” radius needs a definition.',
    ],
  },
  example: {
    prompt: t`Oxygen-15 ($Z = 8$, $N = 7$) and nitrogen-15 ($Z = 7$, $N = 8$) are **mirror nuclei**: one proton is swapped for a neutron. Their atomic masses are $15.0030656$ u and $15.0001089$ u. The nuclear force treats protons and neutrons alike, so the masses differ only through the neutron–hydrogen mass difference and the extra Coulomb energy of oxygen’s eighth proton. Find that Coulomb energy, and from it the radius of a uniformly charged sphere.`,
    visual: mirrorLevels('O-15', 'N-15'),
    steps: [
      { label: 'Write both masses', text: t`$M(A, Z) = Z\,M_H + N m_n - B/c^2$. The binding energies differ only by the Coulomb energy: $B({}^{15}\text{N}) - B({}^{15}\text{O}) = \Delta E_C$. Subtracting, $\left[M({}^{15}\text{O}) - M({}^{15}\text{N})\right]c^2 = (M_H - m_n)c^2 + \Delta E_C$.` },
      { label: 'Coulomb energy', text: t`$\Delta E_C = (${fmt(mass('O-15'), 9)} - ${fmt(mass('N-15'), 9)})\times931.494 + 0.782 = ${fmt(O15.dM, 4)} + ${fmt(DNH, 3)} = ${fmt(O15.dEC, 4)}$ MeV.` },
      { label: 'A charged sphere', text: t`A uniformly charged sphere of $Z$ protons stores $E_C = \tfrac35\,\dfrac{e^2}{4\pi\varepsilon_0}\,\dfrac{Z(Z-1)}{R}$ (every pair of protons counted once; a proton does not repel itself). So $\Delta E_C = \tfrac35\,\dfrac{e^2}{4\pi\varepsilon_0 R}\left[Z(Z-1) - (Z-1)(Z-2)\right] = \tfrac35\,\dfrac{e^2}{4\pi\varepsilon_0 R}\,2(Z-1)$.` },
      { label: 'Solve for the radius', text: t`With $e^2/4\pi\varepsilon_0 = 1.440$ MeV fm and $Z = 8$: $R = \dfrac{0.6\times1.440\times14}{${fmt(O15.dEC, 4)}} = ${fmt(O15.R, 3)}$ fm, that is $R/A^{1/3} = ${fmt(O15.R / Math.cbrt(15), 3)}$ fm.` },
      { label: 'Sense check', text: t`Electron scattering from oxygen-16 gives an rms charge radius of 2.699 fm, which is a uniform sphere of $\sqrt{5/3}\times2.699 = ${fmt(REQ['O-16'], 3)}$ fm. Two unrelated measurements — one electric, one from masses — agree to 2%. Both give $R_0$ near 1.4 fm for so light a nucleus: its skin is a large part of it.` },
    ],
    answer: t`$\Delta E_C = ${fmt(O15.dEC, 4)}$ MeV, so $R = ${fmt(O15.R, 3)}$ fm — within 2% of the radius electron scattering gives.`,
  },
  practice: [
    mcq({
      id: 'why-electrons', difficulty: 1,
      prompt: 'Hofstadter measured nuclear sizes with electrons, not alpha particles or protons, and won the 1961 Nobel Prize for it. Why are electrons the right probe?',
      choices: [
        'They feel only the electromagnetic force, so the pattern maps the charge itself; hadrons also feel the nuclear force, which blurs the picture',
        'They are lighter, so they penetrate further into the nucleus before stopping',
        'They are attracted rather than repelled, so they can reach the centre classically',
        'They have no wavelength of their own, so they act as perfect point probes',
      ],
      answer: 0,
      why: {
        1: 'A few hundred MeV electron passes straight through; the size comes from how it is deflected, not how far it goes.',
        2: 'Attraction helps a little at low energy, but at hundreds of MeV the Coulomb pull hardly matters; the point is which force acts.',
        3: 'Every electron has a de Broglie wavelength — and that wavelength is exactly what makes a diffraction pattern possible.',
      },
      hints: ['Which forces does an electron feel? Which does an alpha particle feel?', 'A probe that feels the nuclear force measures the force’s range as well as the charge.'],
      teach: 'Electrons interact only electromagnetically, so their scattering pattern is the Fourier picture of the nuclear charge.',
      explain: 'Electrons are point-like and feel only the electric charge, which QED describes exactly, so a measured pattern can be inverted to give the charge density. Alpha particles and protons feel the strong force too: Rutherford’s deviations at high energy measured where the nuclear force starts, not the charge distribution. Electrons of a few hundred MeV have wavelengths of a few fm, small enough to resolve a nucleus.',
      visual: diffraction(500, REQ['Pb-208'], { th: [3, 40], caption: 'Scattering of 500 MeV electrons from a uniform sphere the size of lead-208: a diffraction pattern, as from a pinhole. Real nuclei have soft edges, which fill in the zeros.' }),
    }),
    num({
      id: 'e-scatter', difficulty: 2,
      gen(r) {
        const key = r.pick(['Ca-40', 'Fe-56', 'Sn-120', 'Pb-208']), E = r.pick([250, 300, 400, 500]);
        const th = Math.round((2 * Math.asin((X0 * HBARC) / (2 * E * REQ[key])) * 180) / Math.PI * 10) / 10;
        const q = (2 * E / HBARC) * Math.sin((th * Math.PI) / 360), R = X0 / q;
        const qFull = (2 * E / HBARC) * Math.sin((th * Math.PI) / 180);
        return {
          prompt: t`Electrons of ${E} MeV scatter from ${NAME[key]}. The first diffraction minimum lies at $\theta = ${th}°$. A uniformly charged sphere of radius $R$ has its first minimum where $qR = 4.493$, with the momentum transfer $q = \dfrac{2E}{\hbar c}\sin\dfrac{\theta}{2}$ (the electron is ultra-relativistic, $p = E/c$, and the nucleus’s recoil is negligible). What is $R$, in fm? ($\hbar c = 197.33$ MeV fm.)`,
          answer: R, units: 'fm', tol: { rel: 0.005 },
          errors: [{ value: X0 / qFull, feedback: t`The momentum transfer uses half the scattering angle: $q = 2k\sin(\theta/2)$, not $\sin\theta$.` }, { value: X0 / (q / 2), feedback: t`$q = 2k\sin(\theta/2)$: keep the factor 2 (the electron’s momentum turns by $\theta$, and the change is twice $k\sin(\theta/2)$).` }],
          hints: [t`First $q$: $\dfrac{2\times${E}}{197.33}\sin(${fmt(th / 2, 3)}°)$, in $\text{fm}^{-1}$.`, t`$q = ${fmt(q, 4)}\ \text{fm}^{-1}$, so $R = 4.493/q$.`],
          teach: 'The first diffraction minimum sits at qR ≈ 4.49: the larger the nucleus, the smaller the angle.',
          explain: t`$q = ${fmt(q, 4)}\ \text{fm}^{-1}$ and $R = 4.493/q = ${fmt(R, 3)}$ fm, that is $R/A^{1/3} = ${fmt(R / Math.cbrt(+key.split('-')[1]), 3)}$ fm. The electron’s reduced wavelength $\hbar c/E = ${fmt(HBARC / E, 3)}$ fm is smaller than the nucleus, which is why energies of hundreds of MeV are needed.`,
          visual: diffraction(E, REQ[key], { th: [3, Math.min(120, Math.round(th * 2.4))], caption: `The diffraction pattern ${E} MeV electrons make on a uniformly charged sphere. The first minimum is the one in the question; a real nucleus fills it in to a dip.` }),
        };
      },
    }),
    num({
      id: 'mass-excess', difficulty: 2,
      gen(r) {
        const key = r.pick(['Ca-40', 'Fe-56', 'Co-59', 'Ni-62', 'Au-197', 'Pb-208', 'U-238']), [Z, M] = AME[key], A = +key.split('-')[1], N = A - Z;
        const D = Math.round(excess(key) * 1000 * 10) / 10, B = (Z * XH + N * XN - D) / 1000;
        return {
          prompt: t`Mass tables list the **mass excess** $\Delta = (M - A\,\text{u})c^2$ rather than the mass. For ${key.replace('-', '-')} ($Z = ${Z}$, $A = ${A}$) the 2020 Atomic Mass Evaluation gives $\Delta = ${fmt(D, 6)}$ keV; for the hydrogen atom $\Delta_H = 7288.97$ keV and for the neutron $\Delta_n = 8071.32$ keV. What is the binding energy per nucleon, in MeV?`,
          answer: B / A, units: 'MeV', tol: { rel: 0.002 },
          errors: [{ value: B, feedback: 'That is the total binding energy. Divide by the number of nucleons A.' }, { value: (Z * XH + N * XN + D) / 1000 / A, feedback: 'Subtract the nuclide’s mass excess: a lower mass means stronger binding.' }],
          hints: [t`The $A$ atomic mass units cancel: $B = Z\Delta_H + N\Delta_n - \Delta$.`, t`$B = ${Z}\times7288.97 + ${N}\times8071.32 - (${fmt(D, 6)})$ keV; then divide by $${A}$.`],
          teach: t`With mass excesses the large $A$ u parts cancel, so $B = Z\Delta_H + N\Delta_n - \Delta$ uses only small numbers.`,
          explain: t`$B = ${tex(B * 1000, 6)}\ \text{keV} = ${fmt(B, 5)}$ MeV, so $B/A = ${fmt(B / A, 4)}$ MeV. Mass excesses are how every modern table is printed: the numbers are small, and their differences give Q-values directly.`,
          visual: { type: 'qm-binding', params: { nuclide: key, controls: false, readout: false, semf: false, labels: false, hide: ['B'] }, caption: 'Binding energy per nucleon against mass number from measured masses. The nucleus in the question is gold; its value is withheld.' },
        };
      },
    }),
    num({
      id: 'mirror', difficulty: 3,
      gen(r) {
        const p = r.pick(['C-11', 'N-13', 'F-17', 'Ca-39', 'Sc-41']), mi = MIRRORS[p], m = mirror(p);
        const Rz2 = (0.6 * KE2 * (2 * m.Z - 1)) / m.dEC, Rno = (0.6 * KE2 * 2 * (m.Z - 1)) / m.dM;
        return {
          prompt: t`${mi.p[0].toUpperCase() + mi.p.slice(1)} ($Z = ${m.Z}$) and its mirror ${mi.dn} ($Z = ${m.Z - 1}$) have atomic masses ${fmt(mass(p), 10)} u and ${fmt(mass(mi.d), 10)} u. Treating the nucleus as a uniformly charged sphere, $E_C = \tfrac35\,(1.440\ \text{MeV fm})\,Z(Z-1)/R$, find its radius $R$ in fm. ($(m_n - M_H)c^2 = 0.782$ MeV.)`,
          answer: m.R, units: 'fm', tol: { rel: 0.006 },
          errors: [{ value: Rz2, feedback: t`With $Z^2$ instead of $Z(Z-1)$ the difference is $2Z - 1$; but a proton does not repel itself, and the formula given uses $Z(Z-1)$, whose difference is $2(Z-1)$.` }, { value: Rno, feedback: t`The mass difference also contains $(M_H - m_n)c^2$: add $0.782$ MeV to get the Coulomb energy.` }],
          hints: [t`$\Delta E_C = [M_\text{parent} - M_\text{mirror}]c^2 + (m_n - M_H)c^2$.`, t`$\Delta E_C = \tfrac35(1.440)\,\dfrac{2(Z-1)}{R}$; here $\Delta E_C = ${fmt(m.dEC, 4)}$ MeV.`],
          teach: 'Mirror nuclei differ only in Coulomb energy, so their mass difference measures the nuclear radius.',
          explain: t`$\Delta E_C = ${fmt(m.dM, 4)} + 0.782 = ${fmt(m.dEC, 4)}$ MeV and $R = 0.6\times1.440\times${2 * (m.Z - 1)}/${fmt(m.dEC, 4)} = ${fmt(m.R, 3)}$ fm, or $R/A^{1/3} = ${fmt(m.R / Math.cbrt(m.A), 3)}$ fm — like electron scattering, larger than 1.2 fm for a light nucleus. The uniform sphere is a model: the last proton’s orbit and the exchange term shift the answer by several per cent.`,
          visual: mirrorLevels(p, mi.d, { caption: 'The mirror pair’s atoms. The heavier decays to the lighter by positron emission or electron capture; the energy released is the mass difference. Heights are schematic.' }),
        };
      },
    }),
    num({
      id: 'sep-energy', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([['O-16', 'O-17'], ['Ca-40', 'Ca-41']]), [Z] = AME[b], Ab = +b.split('-')[1], prev = `${b.split('-')[0]}-${Ab - 1}`;
        return {
          prompt: t`The neutron separation energy is the energy needed to pull one neutron out: $S_n = [M(A-1, Z) + m_n - M(A, Z)]c^2$. ${a.replace('-', '-')} has $S_n = ${fmt(Sn(a), 4)}$ MeV. With atomic masses ${prev} ${fmt(mass(prev), 11)} u, ${b} ${fmt(mass(b), 11)} u and $m_n = 1.008664916$ u, find $S_n$ for ${b.replace('-', '-')}, in MeV.`,
          answer: Sn(b), units: 'MeV', tol: { rel: 0.003 },
          errors: [{ value: -Sn(b), feedback: t`The separated pieces are heavier than the bound nucleus, so $S_n$ is positive: $M(A-1) + m_n - M(A)$.` }, { value: (mass(prev) - mass(b)) * U, feedback: 'Include the neutron’s own mass: the products are the lighter nucleus and a free neutron.' }],
          hints: [t`$S_n$ is the mass of the pieces minus the mass of the whole, times $c^2$.`, t`$S_n = (${fmt(mass(prev), 11)} + 1.008664916 - ${fmt(mass(b), 11)})\times931.494$ MeV.`],
          teach: 'Separation energies drop sharply just past a magic number: the next nucleon starts a new, higher shell.',
          explain: t`$S_n = ${fmt(Sn(b), 4)}$ MeV — far below the ${fmt(Sn(a), 4)} MeV of ${a}. ${a.replace('-', '-')} has ${a === 'O-16' ? '8' : '20'} protons and ${a === 'O-16' ? '8' : '20'} neutrons, both **magic numbers** (2, 8, 20, 28, 50, 82, 126): its shells are full, and the next neutron must sit in a new shell, loosely held. The liquid drop knows nothing of this; the shell model, with spin–orbit coupling, explains it.`,
          visual: snBars(a, b, { hideB: true, caption: `The energy to pull the last neutron out of ${a} (from AME2020 masses), beside the one in the question.` }),
        };
      },
    }),
    mcq({
      id: 'density', difficulty: 2,
      prompt: t`Measured radii grow as $A^{1/3}$. What does that tell us about nuclei and the force inside them?`,
      choices: [
        'The volume grows in proportion to A, so every nucleus has the same density: each nucleon binds only to its near neighbours, and they cannot be squeezed closer',
        'The nuclear force grows weaker with A, so heavier nuclei swell',
        'Nuclei are mostly empty space, like atoms, with nucleons orbiting far apart',
        'The protons’ repulsion compresses heavy nuclei, so their density rises with A',
      ],
      answer: 0,
      why: {
        1: 'If each nucleon felt every other, heavy nuclei would be denser, not the same density. The constant density is the sign of a short-range, saturating force.',
        2: 'Nucleons are about 1.7 fm across and sit about 1.8 fm apart: a nucleus is packed, like a liquid.',
        3: 'Repulsion pushes outward, if anything lowering the density slightly; it does not compress.',
      },
      hints: [t`$R^3 \propto A$: what does that make the number of nucleons per unit volume?`, 'A force that reached every other nucleon would pull a big nucleus tighter. Does that happen?'],
      teach: 'R ∝ A^(1/3) means constant density — nuclear matter is an incompressible liquid held by a short-range force.',
      explain: t`$V \propto R^3 \propto A$, so $A/V$ is the same for every nucleus: about $3/(4\pi\times1.2^3) = 0.138$ nucleons per fm³ averaged over the uniform sphere, 0.16 in the interior. Each nucleon is bound only to its neighbours — the **saturation** that also makes the binding grow as $A$ (the volume term of the liquid drop).`,
      visual: radii(),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neutron-star', difficulty: 3, transfer: true,
      gen(r) {
        const Msun = r.pick([1.4, 1.6, 2.0]), M = Msun * 1.98841e30, rho = 0.16e45 * 1.67492750056e-27, R = Math.cbrt((3 * M) / (4 * Math.PI * rho)) / 1000;
        return {
          prompt: t`A neutron star is, roughly, one enormous nucleus held together by gravity. Suppose a ${Msun} solar-mass neutron star ($M_\odot = 1.988\times10^{30}$ kg) had the interior density of a nucleus, 0.16 nucleons per fm³, each of mass $1.675\times10^{-27}$ kg. What would its radius be, in km?`,
          answer: R, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: Math.cbrt((3 * M) / (4 * Math.PI * 0.16e15 * 1.675e-27)) / 1000, feedback: t`$1\ \text{fm}^3 = 10^{-45}\ \text{m}^3$, so 0.16 per fm³ is $1.6\times10^{44}$ per m³.` }],
          hints: [t`Density: $\rho = 0.16\times10^{45}\ \text{m}^{-3}\times1.675\times10^{-27}$ kg $= ${tex(rho, 3)}\ \text{kg/m}^3$.`, t`$R = \left(\dfrac{3M}{4\pi\rho}\right)^{1/3}$.`],
          teach: 'Nuclear matter has one density, about 2.7 × 10¹⁷ kg/m³: a star of it is only tens of kilometres across.',
          explain: t`$\rho = ${tex(rho, 3)}\ \text{kg/m}^3$ and $R = ${fmt(R, 3)}$ km. NICER’s X-ray timing of pulsars finds radii of 12–13 km for such stars: gravity squeezes the core to a few times nuclear density, while the outer layers are less dense. A teaching estimate — but nuclear physics alone gets the size of a neutron star right.`,
          visual: profile(208, { caption: 'The nucleon density inside lead-208: a flat interior near 0.16 nucleons per fm³. A neutron star is, to a first estimate, a ball of this matter some 10⁵⁷ nucleons strong. Fermi-function fit, typical parameters.' }),
        };
      },
    }),
    num({
      id: 'cp-magic', difficulty: 3,
      prompt: t`Lead-208 has 82 protons and 126 neutrons, both magic numbers. With atomic masses Pb-208 ${fmt(mass('Pb-208'), 10)} u, Pb-209 ${fmt(mass('Pb-209'), 9)} u and $m_n = 1.008664916$ u, how much energy does it take to remove the last neutron from lead-209, in MeV? (For lead-208 itself it takes ${fmt(Sn('Pb-208'), 4)} MeV.)`,
      answer: Sn('Pb-209'), units: 'MeV', tol: { rel: 0.003 },
      errors: [{ value: (mass('Pb-208') - mass('Pb-209')) * U, feedback: t`Add the free neutron’s mass to the pieces: $S_n = [M(208) + m_n - M(209)]c^2$.` }],
      hints: [t`$S_n = [M({}^{208}\text{Pb}) + m_n - M({}^{209}\text{Pb})]c^2$.`, 'Multiply the mass difference in u by 931.494 MeV.'],
      teach: 'A nucleon beyond a closed shell is loosely bound: the drop in separation energy marks the magic number.',
      explain: t`$S_n = ${fmt(Sn('Pb-209'), 4)}$ MeV, barely half lead-208’s ${fmt(Sn('Pb-208'), 4)} MeV. The 127th neutron opens a new shell. This is how the magic numbers were found: by Mayer and Jensen (Nobel Prize 1963) from jumps like this one.`,
      visual: snBars('Pb-208', 'Pb-209', { hideB: true, caption: 'The energy needed to remove the last neutron from lead-208 (AME2020), beside lead-209’s, withheld.' }),
    }),
    mcq({
      id: 'cp-light', difficulty: 2,
      prompt: t`Electron scattering gives equivalent radii of $1.20A^{1/3}$ fm for lead-208 but $1.39A^{1/3}$ fm for carbon-12. Why do light nuclei sit above the $1.2A^{1/3}$ line?`,
      choices: [
        'Every nucleus has a skin about 2.4 fm thick; in a light nucleus the skin is a large part of the whole, which raises its mean-square radius',
        'Light nuclei are less dense in the middle because their nucleons are bound more weakly',
        'Lead is compressed by its own gravity',
        'The electrons used for carbon had lower energy, so they could not resolve it fully',
      ],
      answer: 0,
      why: {
        1: 'Interior densities are similar; it is the edge, not the middle, that differs in proportion.',
        2: 'Gravity inside a nucleus is about 10³⁶ times weaker than the nuclear force.',
        3: 'The radius comes from the angle of the minimum at whatever energy is used; the measurements are mature and consistent.',
      },
      hints: ['Look at the density profile: which part of it is the same thickness for every nucleus?', 'If the skin is 2.4 fm thick, what fraction of a 3 fm nucleus is skin? Of a 7 fm one?'],
      teach: 'A fixed skin thickness makes small nuclei relatively fuzzy, so R₀ = 1.2 fm is a heavy-nucleus value.',
      explain: t`The equivalent radius is $\sqrt{5/3}$ times the rms radius, and a skin of fixed thickness adds proportionally more to the rms radius of a small nucleus. So $R = 1.2A^{1/3}$ fm describes heavy nuclei; light ones need about 1.4 fm. Textbooks quote $R_0$ from 1.2 to 1.4 fm for this reason.`,
      visual: radii(),
    }),
  ],
  sources: [
    { label: 'Krane, Introductory Nuclear Physics (Wiley, 1988), ch. 3: nuclear properties', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'Wang et al. (2021), The AME 2020 atomic mass evaluation (II), Chinese Physics C 45, 030003', url: 'https://doi.org/10.1088/1674-1137/abddaf' },
    { label: 'Angeli and Marinova (2013), Table of experimental nuclear ground state charge radii, Atomic Data and Nuclear Data Tables 99, 69', url: 'https://doi.org/10.1016/j.adt.2011.12.006' },
    { label: 'Hofstadter (1956), Electron scattering and nuclear structure, Rev. Mod. Phys. 28, 214', url: 'https://doi.org/10.1103/RevModPhys.28.214' },
  ],
});
