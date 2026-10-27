import { mod } from '../_util.js';

export default {
  id: 'phys2710', track: 'physics', code: 'PHYS 2710', title: 'Introductory Modern Physics',
  provenance: 'usu-reconstructed', evidence: 'D', credits: 3,
  catalog: 'Principles and applications of relativity and quantum mechanics, including a discussion of atomic, solid state, and particle physics.',
  source: { label: 'USU Physics course descriptions', url: 'https://www.physics.usu.edu/teaching/' },
  note: 'De facto required: PHYS 3600, 3700, 3870 and Optics I all list it as a prerequisite; its row in the requirement blocks was not recovered.',
  summary: 'Where classical physics broke: relativity, blackbody radiation, photons, matter waves, the Schrödinger equation, atoms, molecules, solids and a first look at nuclei and particles.',
  prereqs: ['phys2220', 'math1220'],
  boss: { title: 'The Quantum Threshold', blurb: 'From a spectrum or a stopping voltage to the physics that explains it.' },
  modules: [
    mod('MP1', 'The failures of classical physics', ['Blackbody radiation and the ultraviolet catastrophe', 'Planck’s quantum hypothesis', 'Atomic spectra']),
    mod('MP2', 'Relativistic kinematics', ['Einstein’s postulates', 'Time dilation, length contraction and the muon', 'Lorentz transformations', 'Spacetime diagrams and the interval', 'Velocity addition and the Doppler effect']),
    mod('MP3', 'Relativistic dynamics', ['Relativistic momentum', 'Energy, mass and E = mc²', 'Massless particles and four-momentum']),
    mod('MP4', 'Photons', ['The photoelectric effect', 'X-rays and Compton scattering', 'Pair production']),
    mod('MP5', 'Atomic models', ['Rutherford scattering', 'The Bohr model', 'Franck–Hertz and energy levels']),
    mod('MP6', 'Matter waves', ['De Broglie wavelength and electron diffraction', 'Wave packets', 'The uncertainty principle']),
    mod('MP7', 'The Schrödinger equation in one dimension', ['The wave function and probability', 'The infinite square well', 'The finite well and tunnelling', 'The harmonic oscillator', 'Expectation values']),
    mod('MP8', 'The hydrogen atom', ['Separation in three dimensions', 'Quantum numbers and orbitals', 'Angular momentum and spin']),
    mod('MP9', 'Many-electron atoms', ['The exclusion principle', 'The periodic table', 'X-ray spectra']),
    mod('MP10', 'Statistical physics', ['Maxwell–Boltzmann statistics', 'Fermi–Dirac and Bose–Einstein statistics', 'Lasers']),
    mod('MP11', 'Molecules', ['Molecular bonding', 'Rotational and vibrational spectra']),
    mod('MP12', 'Solids', ['Band theory', 'Metals and the free-electron model', 'Semiconductors and the p–n junction', 'Superconductivity']),
    mod('MP13', 'Nuclei, particles and the cosmos (preview)', ['Nuclear binding and decay', 'The particle zoo and the Standard Model', 'A first look at cosmology']),
  ],
};
