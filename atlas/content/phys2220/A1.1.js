// Atomic spectra and the Bohr model — hydrogen's levels E_n = −13.6 eV/n²,
// photons carry the difference between two levels, the named series, emission
// and absorption, and the Bohr model as a historical stepping stone: right
// energies, no real orbits. Wavelengths from model/qm-hydrogen.js (CODATA
// 2022 Rydberg constant, reduced mass included).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { HC_EVNM, C } from '../../src/viz/model/qm-light.js';
import { energy, lineNm, airNm } from '../../src/viz/model/qm-hydrogen.js';
import { seg, label, spectrumStrip } from './_modern.js';

const t = String.raw;

const E13 = 13.6;                                   // eV, the rounded value the problems use
const dE = (ni, nf, Z = 1) => E13 * Z * Z * (1 / (nf * nf) - 1 / (ni * ni));
const NAMES = { '3,2': 'Hα', '4,2': 'Hβ', '5,2': 'Hγ', '6,2': 'Hδ', '2,1': 'Lyman-α', '3,1': 'Lyman-β', '4,3': 'Paschen-α' };

/** A static picture of the atom’s levels and one jump (no wavelengths shown). */
const atom = (series, n, extra = {}, caption = 'Hydrogen’s levels and the jumps of one series, with this jump highlighted. Levels to scale above the break.') => ({ type: 'qm-hydrogen', params: { series, n, controls: false, readout: false, hide: ['lambda'], picture: 'none', ...extra }, caption });

/**
 * An energy-level ladder with `graph`: levels −E1·Z²/n² for n = from…top and
 * the ionization level at 0, drawn to scale (or evenly spaced, `schematic`),
 * with optional arrows [from n, to n | 0]. Crowded levels go unlabelled.
 */
function ladder({ Z = 1, top = 6, from = 1, arrows = [], caption, ask = '', schematic = false } = {}) {
  const E1 = E13 * Z * Z, En = (n) => -E1 / (n * n);
  const y = (n) => (n === 0 ? 0 : schematic ? -(top + 1 - n) : En(n));
  const lo = schematic ? -(top - from + 1) - 0.5 : En(from) * 1.12, hi = schematic ? 0.6 : (E1 * 0.08) / (from * from), span = hi - lo;
  const curves = [seg(0.6, 0, 6.2, 0, 'ink3', 1.2, true)], points = [label(6.2, 0, '0 eV: ionized', 'ink3', -4, -10, 'right')];
  for (let n = from; n <= top; n++) {
    const gapAbove = (n === top ? 0 : y(n + 1)) - y(n), roomy = gapAbove > 0.075 * span || arrows.some(([a2, b2]) => a2 === n || b2 === n);
    curves.push(seg(0.6, y(n), 6.2, y(n), 'ink2', roomy ? 1.8 : 1.1));
    if (roomy) points.push(label(0.6, y(n), `n = ${n}`, 'ink2', -6, 0, 'right'), label(6.2, y(n), `−${(E1 / (n * n)).toFixed(2)} eV`, 'ink3', 6, 0));
  }
  const arr = arrows.map(([a, b, col = 'gold', x = 3.4]) => ({ from: [x, y(a)], to: [x, y(b)], color: col }));
  if (ask && arrows.length) points.push(label(arrows[0][3] ?? 3.4, (y(arrows[0][0]) + y(arrows[0][1])) / 2, ask, 'gold', 10, 0));
  return {
    type: 'graph',
    params: { x: [-0.9, 8.4], y: [lo, hi], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, points, arrows: arr },
    caption: caption ?? (schematic ? 'Energy levels, evenly spaced for clarity: not to scale.' : 'Energy levels drawn to scale: they crowd together toward 0 eV, where the electron is no longer bound.'),
  };
}

export default lesson({
  id: 'phys2220.A1.1',
  title: 'Atomic spectra and the Bohr model',
  minutes: 12, difficulty: 2,
  intro: t`Hot hydrogen glows at only a few sharp wavelengths — red at 656 nm, blue-green at 486 nm, violet at 434 and 410 nm — and hydrogen in front of a brighter source absorbs exactly the same ones. In 1913 Niels Bohr explained why: the electron can have only certain energies, and a photon is emitted or absorbed when it jumps between two of them,

$$E_n = -\frac{13.6\ \text{eV}}{n^2}, \qquad hf = E_{n_i} - E_{n_f}$$

Bohr pictured the levels as circular orbits. The energies survive in quantum mechanics; **the orbits do not** — the electron has no path, only a cloud of probability. Treat the Bohr model as a historical stepping stone that happens to get hydrogen’s energies right.

> Continue in [Introductory Modern Physics](#/course/phys2710), where the Schrödinger equation gives the same energies — and the clouds.`,
  symbols: [
    { tex: 'E_n', text: 'the energy of level $n$, in eV, counted from a free electron at rest (0 eV): bound levels are negative' },
    { tex: 'n', text: 'the principal quantum number: 1 (the ground state), 2, 3, …' },
    { tex: '13.6\\ \\text{eV}', text: t`hydrogen’s ionization energy — the Rydberg energy, ${fmt(-energy(1), 5)} eV once the proton’s recoil is included` },
    { tex: 'hf', text: t`the photon’s energy; its wavelength is $\lambda = hc/(E_{n_i} - E_{n_f})$, with $hc = 1240$ eV nm` },
    { tex: 'n_i,\\ n_f', text: 'the initial and final levels of the jump: $n_i > n_f$ for emission' },
  ],
  why: 'Spectral lines are the fingerprints that tell astronomers what stars are made of, how hot they are and how fast they move — and energy levels are what lasers and atomic clocks are built on.',
  visual: {
    type: 'qm-hydrogen',
    title: 'Jumps between levels make the lines',
    lead: t`Left: hydrogen’s levels, to scale, and the jumps of one series. Right: the spectrum those jumps make, and a picture of the atom in the upper level. Move the upper level and switch series and modes.`,
    tasks: [
      'In the Balmer series (jumps to n = 2): 3 → 2 is the red line at 656 nm, 4 → 2 the blue-green one at 486 nm, 5 → 2 and 6 → 2 are violet.',
      'Switch to absorption: the dark lines fall at exactly the same wavelengths — the same jumps, run upward.',
      'Try the Lyman series (jumps to n = 1): all ultraviolet, because the drop to the ground state is so large. Then switch the picture to Bohr’s orbit, and back to the cloud.',
    ],
    params: { mode: 'emission', series: 2, n: 3, picture: 'cloud' },
  },
  example: {
    prompt: t`Find the wavelength of the photon hydrogen emits when its electron drops from $n = 3$ to $n = 2$ — the red Hα line that colours glowing nebulae.`,
    visual: { type: 'qm-hydrogen', params: { series: 2, n: 3, picture: 'none', controls: false }, caption: 'The jump from n = 3 to n = 2 (red), with the rest of the Balmer series, and the spectrum they make. Levels to scale above the break; colours approximate.' },
    steps: [
      { label: 'The two levels', text: t`$E_3 = -\dfrac{13.6}{9} = -1.51$ eV and $E_2 = -\dfrac{13.6}{4} = -3.40$ eV.` },
      { label: 'The photon takes the difference', text: t`$hf = E_3 - E_2 = -1.51 - (-3.40) = ${fmt(dE(3, 2), 3)}$ eV.` },
      { label: 'Wavelength', text: t`$\lambda = \dfrac{hc}{hf} = \dfrac{1239.8\ \text{eV nm}}{${fmt(dE(3, 2), 4)}\ \text{eV}} = ${fmt(HC_EVNM / dE(3, 2), 4)}$ nm — red.` },
      { label: 'More precisely', text: t`With the proton’s recoil included (13.598 eV instead of 13.6), $\lambda = ${fmt(lineNm(3, 2), 5)}$ nm in vacuum. Light slows slightly in air, so tables quote ${fmt(airNm(lineNm(3, 2)), 5)} nm, the wavelength measured in air.` },
      { label: 'Sense check', text: t`Visible photons carry 1.6 to 3.3 eV, and 1.89 eV sits near the red end. Absorbed in a star’s atmosphere by atoms in $n = 2$, the same 1.89 eV makes the dark Hα line in its spectrum.` },
    ],
    answer: t`About ${fmt(HC_EVNM / dE(3, 2), 3)} nm (red); precisely ${fmt(lineNm(3, 2), 5)} nm in vacuum, ${fmt(airNm(lineNm(3, 2)), 5)} nm in air.`,
  },
  practice: [
    num({
      id: 'photon-energy', difficulty: 1,
      gen(r) {
        const [ni, nf] = r.pick([[3, 2], [4, 2], [5, 2], [2, 1], [3, 1], [4, 3]]);
        const E = dE(ni, nf);
        return {
          prompt: t`A hydrogen atom’s electron drops from $n = ${ni}$ to $n = ${nf}$. What energy does the emitted photon carry, in eV? (Use $E_n = -13.6\ \text{eV}/n^2$.)`,
          answer: E, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: E13 / (ni * ni) + E13 / (nf * nf), feedback: t`Subtract the energies, minding the signs: $E_{n_i} - E_{n_f}$, with both negative.` }, { value: E13 * (1 / nf - 1 / ni), feedback: t`Square the quantum numbers: $E_n \propto 1/n^2$.` }],
          hints: [t`$E_${ni} = -13.6/${ni * ni}$ eV and $E_${nf} = -13.6/${nf * nf}$ eV.`, t`The photon carries $E_${ni} - E_${nf}$.`],
          teach: 'An emitted photon carries exactly the energy difference between the two levels.',
          explain: t`$hf = 13.6\left(\dfrac1{${nf * nf}} - \dfrac1{${ni * ni}}\right) = ${fmt(E, 4)}$ eV${NAMES[`${ni},${nf}`] ? ` — the ${NAMES[`${ni},${nf}`]} line` : ''}.`,
          visual: atom(nf, ni, { hide: ['lambda', 'strip'] }),
        };
      },
    }),
    num({
      id: 'balmer-lambda', difficulty: 2,
      gen(r) {
        const ni = r.pick([4, 5, 6]);
        const lam = HC_EVNM / dE(ni, 2);
        return {
          prompt: t`What is the wavelength, in nm, of the line hydrogen emits when its electron drops from $n = ${ni}$ to $n = 2$? (Use $E_n = -13.6\ \text{eV}/n^2$ and $hc = 1240$ eV nm.)`,
          answer: lam, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: HC_EVNM / (E13 / (ni * ni)), feedback: t`That uses only the energy of level ${ni}. The photon carries the *difference* $E_${ni} - E_2$.` }],
          hints: [t`$\Delta E = 13.6\left(\tfrac14 - \tfrac1{${ni * ni}}\right)$ eV.`, t`$\lambda = 1240\ \text{eV nm}/\Delta E$.`],
          teach: 'λ = hc/ΔE: the bigger the jump, the shorter the wavelength.',
          explain: t`$\Delta E = ${fmt(dE(ni, 2), 4)}$ eV, so $\lambda = 1239.8/${fmt(dE(ni, 2), 4)} = ${fmt(lam, 4)}$ nm, the ${NAMES[`${ni},2`]} line (precisely ${fmt(lineNm(ni, 2), 5)} nm in vacuum).`,
          visual: atom(2, ni, { hide: ['lambda', 'strip'] }),
        };
      },
    }),
    mcq({
      id: 'no-orbits', difficulty: 2,
      prompt: 'According to quantum mechanics, what is the electron in a hydrogen atom’s ground state doing?',
      choices: [
        'It has no definite path; there is only a probability of finding it at each place, most likely about 0.053 nm from the nucleus',
        'It circles the nucleus on an orbit of radius 0.053 nm, like a tiny planet',
        'It sits at rest, 0.053 nm from the nucleus',
        'It spirals slowly into the nucleus, radiating light as it goes',
      ],
      answer: 0,
      why: {
        1: 'That is Bohr’s 1913 picture. It gave the right energies, but no experiment has ever found electrons on paths inside atoms: quantum mechanics replaced orbits with clouds of probability.',
        2: 'An electron at rest at one point would have a sharply defined position and momentum — exactly what the uncertainty principle forbids.',
        3: 'That is what classical physics predicts — and why it could not explain stable atoms. The ground state is stable: it cannot radiate, because there is no lower level to drop to.',
      },
      hints: ['Think of the uncertainty principle: can the electron have both a definite place and a definite velocity?'],
      teach: 'The Bohr model is a historical stepping stone: its energies are right for hydrogen, but electrons do not travel on orbits.',
      explain: 'Quantum mechanics describes the ground-state electron as a spherical cloud of probability. The most likely distance from the nucleus, a₀ = 0.053 nm, equals Bohr’s first radius — one reason his model was so persuasive — but there is no orbit and no path.',
      visual: { type: 'qm-hydrogen', params: { series: 1, n: 2, picN: 1, picture: 'cloud', controls: false, readout: false, hide: ['lambda'] }, caption: 'Hydrogen’s levels, a jump to the ground state, and the ground state pictured as quantum mechanics describes it: a cloud of probability.' },
    }),
    num({
      id: 'ionize', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]);
        const lam = HC_EVNM / (E13 / (n * n));
        return {
          prompt: t`What is the longest wavelength of light that can ionize a hydrogen atom whose electron is in level $n = ${n}$, freeing the electron? Answer in nm.`,
          answer: lam, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: HC_EVNM / E13, feedback: t`That is for the ground state. From $n = ${n}$ the electron needs only $13.6/${n * n}$ eV.` }].filter(() => n !== 1),
          hints: [t`To ionize, the photon must lift the electron from $E_${n}$ to 0: it needs at least $13.6/${n * n}$ eV.`, t`$\lambda_{\max} = 1240\ \text{eV nm}/(13.6/${n * n}\ \text{eV})$.`],
          teach: 'Ionization from level n takes at least 13.6 eV/n²; any photon with more energy also works, and the electron leaves with the excess.',
          explain: t`The photon needs $${fmt(E13 / (n * n), 3)}$ eV, so $\lambda \le ${fmt(lam, 4)}$ nm${n === 1 ? ' — far ultraviolet. Interstellar hydrogen absorbs almost all starlight shortward of this “Lyman limit”.' : n === 2 ? ' — the Balmer limit, near the violet end of vision.' : ' — in the near infrared.'}`,
          visual: ladder({ from: n, top: 7, arrows: [[n, 0]], ask: 'needs ? eV', caption: `Ionization lifts the electron from level ${n} to 0 eV, where it is free. Levels from n = ${n} up, to scale.` }),
        };
      },
    }),
    mcq({
      id: 'absorption', difficulty: 2,
      prompt: 'Light from deep inside a hot star passes through its cooler outer atmosphere, where many hydrogen atoms have electrons in level n = 2. What appears in the visible part of the star’s spectrum?',
      choices: [
        'Dark lines at the same wavelengths as hydrogen’s bright Balmer lines',
        'Bright lines at the Balmer wavelengths, on top of the rainbow',
        'Dark lines at wavelengths unrelated to hydrogen’s emission lines',
        'A smooth rainbow: the absorbed light is re-emitted, so nothing is lost',
      ],
      answer: 0,
      why: {
        1: 'Bright lines come from gas glowing against a dark background. Gas in front of a hotter source removes light.',
        2: 'Absorption needs exactly the same energy jumps as emission, so the lines fall at the same wavelengths.',
        3: 'The atoms re-emit, but in every direction, so the beam heading toward us is still depleted at those wavelengths.',
      },
      hints: ['Absorbing a photon lifts an electron between the same two levels it falls between when it emits.'],
      teach: 'Absorption lines and emission lines of an element fall at the same wavelengths: the same jumps, in opposite directions.',
      explain: 'Atoms in n = 2 absorb photons of 1.89, 2.55, 2.86 eV… — exactly the energies hydrogen emits in its Balmer lines — leaving dark lines at 656, 486, 434 and 410 nm. They are strongest in stars near 10 000 K, hot enough to put many atoms in n = 2.',
      visual: atom(2, 4, { picture: 'none', hide: ['lambda'] }),
    }),
    num({
      id: 'count-lines', difficulty: 2,
      prompt: 'A gas of hydrogen atoms is excited so that some electrons reach n = 4. As they cascade back down to n = 1 by every possible route, how many different wavelengths can the gas emit?',
      answer: 6, tol: { rel: 0, abs: 0.5 },
      errors: [{ value: 3, feedback: 'Count every pair of levels, not just the jumps from n = 4: 4→3, 4→2, 4→1, 3→2, 3→1, 2→1.' }, { value: 4, feedback: 'Four levels give six pairs; each pair is one possible jump.' }],
      hints: ['Each pair of levels among n = 1, 2, 3, 4 gives one possible jump.', 'Number of pairs from 4 levels: 4 × 3 / 2.'],
      teach: 'Every pair of levels gives a line: N levels make N(N − 1)/2 possible wavelengths.',
      explain: 'Six: 4→3, 4→2, 4→1, 3→2, 3→1 and 2→1. Each pair of levels has its own energy gap and so its own wavelength.',
      visual: ladder({ top: 4, schematic: true, caption: 'Hydrogen’s four lowest levels, evenly spaced for clarity (not to scale): how many different jumps can connect them?' }),
    }),
    num({
      id: 'helium-ion', difficulty: 3,
      prompt: t`A helium ion He⁺ has one electron and a nucleus of charge $Z = 2$, so its levels are $E_n = -13.6\ \text{eV}\times Z^2/n^2$. Hot stars show a strong He⁺ line from the jump $n = 4 \to 3$. What is its wavelength, in nm?`,
      answer: HC_EVNM / dE(4, 3, 2), units: 'nm', tol: { rel: 0.005 },
      errors: [{ value: HC_EVNM / dE(4, 3, 1), feedback: t`That is hydrogen’s 4 → 3 line. With $Z = 2$ every energy is $Z^2 = 4$ times larger.` }, { value: HC_EVNM / (dE(4, 3, 1) * 2), feedback: t`The levels scale as $Z^2$, not $Z$.` }],
      hints: [t`$\Delta E = 13.6\times4\times\left(\tfrac19 - \tfrac1{16}\right)$ eV.`, t`$\lambda = 1240/\Delta E$ nm.`],
      teach: 'One-electron ions follow Bohr’s formula with energies scaled by Z².',
      explain: t`$\Delta E = 54.4\times\left(\tfrac19 - \tfrac1{16}\right) = ${fmt(dE(4, 3, 2), 4)}$ eV, so $\lambda = ${fmt(HC_EVNM / dE(4, 3, 2), 4)}$ nm — the blue He II line at 468.6 nm that marks the hottest stars, where enough helium is ionized.`,
      visual: ladder({ Z: 2, from: 2, top: 6, arrows: [[4, 3]], caption: 'The levels of the helium ion He⁺ from n = 2 up, to scale: each four times deeper than hydrogen’s.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-star-speed', difficulty: 3, transfer: true,
      prompt: t`In the laboratory, hydrogen’s Hα line is at 656.28 nm (measured in air). In the spectrum of a star it appears at 656.90 nm. Using the Doppler shift for speeds much less than $c$, $\Delta\lambda/\lambda = v/c$, how fast is the star moving away from us, in km/s?`,
      answer: (0.62 / 656.28) * C / 1000, units: 'km/s', tol: { rel: 0.01 },
      errors: [{ value: (0.62 / 656.28) * C, feedback: 'That is in m/s; divide by 1000 for km/s.' }],
      hints: [t`$\Delta\lambda = 656.90 - 656.28 = 0.62$ nm.`, t`$v = c\,\Delta\lambda/\lambda = (3.00\times10^{5}\ \text{km/s})\times0.62/656.28$.`],
      teach: 'Spectral lines are rulers for motion: shifted to the red, the source recedes; to the blue, it approaches.',
      explain: t`$v = c\,\dfrac{\Delta\lambda}{\lambda} = 2.998\times10^{5}\times\dfrac{0.62}{656.28}\ \text{km/s} = ${fmt((0.62 / 656.28) * C / 1000, 3)}$ km/s, away from us. Astronomers measure stars’ motions this way to within metres per second — enough to detect planets tugging on them.`,
      visual: spectrumStrip({ from: 640, to: 672, marks: [{ nm: 656.28, label: 'laboratory 656.28' }, { nm: 656.9, label: 'star', dy: 22 }], caption: 'A close-up of the red end of the spectrum: hydrogen’s Hα line in the laboratory, and where it appears in the star. Colours approximate.' }),
    }),
    num({
      id: 'cp-lyman-alpha', difficulty: 2,
      prompt: t`Find the wavelength, in nm, of the photon emitted when hydrogen’s electron drops from $n = 2$ to the ground state. (Use $E_n = -13.6\ \text{eV}/n^2$ and $hc = 1240$ eV nm.)`,
      answer: HC_EVNM / dE(2, 1), units: 'nm', tol: { rel: 0.005 },
      errors: [{ value: HC_EVNM / E13, feedback: 'The photon carries only E₂ − E₁ = 10.2 eV, not the full 13.6 eV.' }],
      hints: [t`$\Delta E = 13.6\left(1 - \tfrac14\right)$ eV.`],
      teach: 'Jumps to the ground state are large, so the Lyman series lies in the ultraviolet.',
      explain: t`$\Delta E = 10.2$ eV, so $\lambda = 1239.8/10.2 = ${fmt(HC_EVNM / dE(2, 1), 4)}$ nm: Lyman-α, ultraviolet — the brightest line in the Sun’s far-ultraviolet spectrum.`,
      visual: ladder({ top: 5, arrows: [[2, 1]], caption: 'The jump from n = 2 to the ground state, on the level ladder drawn to scale.' }),
    }),
    mcq({
      id: 'cp-bohr', difficulty: 2,
      prompt: 'Which statement about the Bohr model is accurate?',
      choices: [
        'It predicts hydrogen’s energy levels correctly, but its picture of electrons circling on orbits was replaced by quantum mechanics',
        'It is the modern picture of the atom, confirmed by images of electron orbits',
        'It explains the spectra of every element',
        'It gives the wrong energies even for hydrogen',
      ],
      answer: 0,
      why: {
        1: 'No experiment has imaged orbits. Imaging techniques show clouds of electron probability, as quantum mechanics predicts.',
        2: 'Bohr’s model fails for helium and every atom with more than one electron.',
        3: 'For hydrogen it gives the energies — and so the wavelengths — to about one part in ten thousand; the remaining small effects need quantum mechanics and relativity.',
      },
      hints: ['What did Bohr get right, and what did quantum mechanics change?'],
      teach: 'The Bohr model is a historical stepping stone: right energies for hydrogen, wrong picture of the electron.',
      explain: 'Bohr’s quantized levels explained hydrogen’s spectrum in 1913 and pointed the way to quantum mechanics. In 1926 the Schrödinger equation gave the same energies without orbits, and went on to explain every other atom.',
      visual: { type: 'qm-hydrogen', params: { series: 2, n: 3, picture: 'orbit', controls: false, readout: false, hide: ['lambda'] }, caption: 'Bohr’s 1913 picture: the electron on a circular orbit. Its energies are right; the orbit is not.' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §6.4 Bohr’s model of the hydrogen atom', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-4-bohrs-model-of-the-hydrogen-atom' },
    { label: 'Bohr (1913), On the constitution of atoms and molecules, Phil. Mag. 26, 1', url: 'https://doi.org/10.1080/14786441308634955' },
    { label: 'NIST Atomic Spectra Database (hydrogen lines)', url: 'https://www.nist.gov/pml/atomic-spectra-database' },
    { label: 'CODATA 2022 recommended values (NIST): the Rydberg constant', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
