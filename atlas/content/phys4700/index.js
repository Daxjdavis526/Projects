import { mod } from '../_util.js';

export default {
  id: 'phys4700', track: 'physics', code: 'PHYS 4700', title: 'Quantum Mechanics I',
  provenance: 'usu-reconstructed', evidence: 'A', credits: 3,
  catalog: 'Principles of quantum mechanics, operators in Hilbert space, matrix mechanics, angular momentum, spin, perturbation theory, and applications.',
  source: { label: 'USU catalog 2024–25: PHYS 4700', url: 'https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330722' },
  note: 'Prerequisites PHYS 3600 and PHYS 3750. Time-independent perturbation theory sits here because the description lists it.',
  summary: 'Wave functions to Hilbert space: stationary states, the formalism of operators and bra-kets, three dimensions and hydrogen, spin and angular momentum, and perturbation theory.',
  prereqs: ['phys3600', 'phys3750', 'math2270'],
  boss: { title: 'The Quantum State Challenge', blurb: 'Prepare, evolve and measure: expectation values, uncertainty and a perturbed spectrum.' },
  modules: [
    mod('M0', 'Mathematical bridge', ['Complex vector spaces and inner products', 'Hermitian operators and eigenvalues']),
    mod('M1', 'Spins first: a two-state on-ramp', ['Stern–Gerlach experiments', 'Spin states as vectors', 'Measurement and probability']),
    mod('M2', 'The wave function', ['The Schrödinger equation and Born’s rule', 'Normalization and probability current', 'Momentum and expectation values', 'The uncertainty principle']),
    mod('M3', 'Stationary states and one-dimensional potentials', ['Separation of variables and stationary states', 'The infinite square well', 'The harmonic oscillator: ladder operators', 'The free particle and wave packets', 'The delta-function potential', 'The finite square well and tunnelling']),
    mod('M4', 'Formalism', ['Hilbert space', 'Observables and Hermitian operators', 'Eigenfunctions and the spectrum', 'Generalized statistical interpretation', 'The generalized uncertainty principle', 'Dirac notation', 'Time evolution and the Heisenberg picture']),
    mod('M5', 'Quantum mechanics in three dimensions', ['The Schrödinger equation in spherical coordinates', 'The hydrogen atom', 'Angular momentum operators', 'Spherical harmonics']),
    mod('M6', 'Spin and addition of angular momentum', ['Spin ½ and the Pauli matrices', 'Spin in a magnetic field: precession', 'Adding angular momenta']),
    mod('M7', 'Electromagnetic interactions', ['Charged particles in fields and the Aharonov–Bohm effect']),
    mod('M8', 'Time-independent perturbation theory', ['Non-degenerate perturbation theory', 'Degenerate perturbation theory', 'Fine structure of hydrogen', 'The Zeeman effect']),
  ],
};
