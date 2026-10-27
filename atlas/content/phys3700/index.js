import { mod } from '../_util.js';

export default {
  id: 'phys3700', track: 'physics', code: 'PHYS 3700', title: 'Thermal Physics',
  provenance: 'usu-reconstructed', evidence: 'B', credits: 3,
  catalog: 'Prerequisites PHYS 2710 and PHYS 3550, with MATH 2210, 2250 or 2280 (2024–25 listing). No credit for both PHYS 3700 and MAE 2300.',
  source: { label: 'USU catalog 2024–25 course listing', url: 'https://catalog.usu.edu/content.php?catoid=39&navoid=30109' },
  note: 'USU instructors have used Schroeder, An Introduction to Thermal Physics, chapters 1–7. Its exact place in the requirement blocks was not recovered.',
  summary: 'Temperature and entropy from counting microstates: the laws of thermodynamics, engines, free energies, Boltzmann statistics, partition functions and quantum gases — ending at black-hole thermodynamics.',
  prereqs: ['phys2710', 'phys3550'],
  boss: { title: 'The Black-Hole Engine', blurb: 'A hole with negative heat capacity, bathed in the CMB: which way does the energy flow?' },
  modules: [
    mod('T0', 'Probability on-ramp', ['Probability distributions and averages', 'Combinatorics for physicists', 'Stirling’s approximation']),
    mod('T1', 'Energy in thermal physics', ['Temperature and the ideal gas', 'Equipartition of energy', 'Heat, work and the first law', 'Compression work and adiabatic processes', 'Heat capacities and latent heat']),
    mod('T2', 'The second law by counting', ['Two-state systems and microstates', 'The Einstein solid', 'Interacting systems and the approach to equilibrium', 'Entropy as log multiplicity', 'The ideal gas multiplicity']),
    mod('T3', 'Interactions and implications', ['Temperature from entropy', 'Paramagnets and negative temperature', 'Mechanical and diffusive equilibrium', 'The thermodynamic identity']),
    mod('T4', 'Engines and refrigerators', ['Heat engines and efficiency limits', 'Refrigerators', 'Real cycles']),
    mod('T5', 'Free energy and chemical thermodynamics', ['Helmholtz and Gibbs free energies', 'Free energy as a force toward equilibrium', 'Phase transformations', 'Mixtures and chemical equilibrium']),
    mod('T6', 'Boltzmann statistics', ['The Boltzmann factor', 'The partition function', 'Average values and equipartition derived', 'The Maxwell speed distribution', 'Partition functions and free energy']),
    mod('T7', 'Quantum statistics', ['The Gibbs factor', 'Bosons and fermions', 'Degenerate Fermi gases', 'Blackbody radiation', 'Debye theory of solids', 'Bose–Einstein condensation']),
    mod('T8', 'Interacting systems (enrichment)', ['The Ising model', 'Monte Carlo simulation']),
    mod('T9', 'Ensembles and information entropy', ['Microcanonical, canonical and grand canonical ensembles', 'Entropy as missing information']),
    mod('T10', 'Transport (enrichment)', ['Mean free path, conduction and diffusion']),
    mod('T11', 'Astrophysical and relativistic thermal physics (enrichment)', ['Stars and white dwarfs', 'Black-hole entropy and Hawking temperature']),
  ],
};
