import { mod } from '../_util.js';

export default {
  id: 'phys4710', track: 'physics', code: 'PHYS 4710', title: 'Quantum Mechanics II',
  provenance: 'usu-reconstructed', evidence: 'A', credits: 3,
  catalog: 'Title and credits only; no description was found.',
  source: { label: 'USU catalog list (older edition)', url: 'https://catalog.usu.edu/content.php?catoid=35&navoid=26518' },
  note: 'Content reconciled from about eight universities’ second-semester syllabi (e.g. MIT 8.06): identical particles, time-dependent perturbation theory, scattering, the variational method and WKB are near-universal; the rest depends on the instructor.',
  summary: 'Approximation methods and many particles: identical particles, symmetries, the variational principle, WKB, time-dependent perturbation theory and Fermi’s golden rule, scattering — and foundations.',
  prereqs: ['phys4700'],
  boss: { title: 'The Approximation Arena', blurb: 'Choose the right approximation, justify it, and estimate the error.' },
  modules: [
    mod('M0', 'Bridge', ['Where exact solutions stop']),
    mod('M1', 'Identical particles', ['Bosons, fermions and exchange symmetry', 'Atoms and the exchange force', 'Solids: the free electron gas revisited']),
    mod('M2', 'Symmetries and conservation laws', ['Translations, momentum and generators', 'Rotations and angular momentum', 'Parity and time reversal', 'Degeneracy and symmetry']),
    mod('M3', 'Applications of perturbation theory', ['Hyperfine structure and the 21-cm line', 'The Stark effect']),
    mod('M4', 'The variational principle', ['The variational theorem', 'The helium ground state', 'The hydrogen molecule ion']),
    mod('M5', 'The WKB approximation', ['The classical region', 'Tunnelling and alpha decay', 'Connection formulas']),
    mod('M6', 'Scattering', ['Cross sections', 'Partial-wave analysis', 'The Born approximation']),
    mod('M7', 'Time-dependent dynamics', ['Two-level systems and Rabi oscillations', 'Time-dependent perturbation theory', 'Fermi’s golden rule', 'Emission and absorption of radiation', 'The adiabatic theorem and Berry’s phase']),
    mod('M8', 'Foundations and quantum information', ['Density matrices', 'Entanglement and Bell’s theorem', 'Measurement and decoherence']),
    mod('M9', 'Relativistic quantum mechanics (teaser)', ['Why the Schrödinger equation is not relativistic']),
  ],
};
