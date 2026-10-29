import { mod } from '../_util.js';

// PHYS 3710's general-relativity modules share their lessons with the GR road's
// Intuition Mode (steps 5–6, 9, 12, 20–25, 27, 30–31) so they are built once.
export default {
  id: 'phys3710', track: 'physics', code: 'PHYS 3710', title: 'Intermediate Modern Physics',
  provenance: 'usu-course', evidence: 'A', credits: 3,
  catalog: 'Introduction to the principles and applications of special and general relativity (one edition). Another lists: space-time, relativistic kinematics and dynamics, gravity and geometry, black holes, Big Bang, nuclei, radioactivity, and nuclear reactions.',
  source: { label: 'David Peak, PHYS 3710', url: 'https://www.physics.usu.edu/peak/phys_3710/index.htm' },
  note: 'A real USU course whose place in this emphasis could not be verified. It is the prerequisite of PHYS 5910/6910 Relativity I. Cosmology appears officially only as “Big Bang”; the cosmology module here is an Atlas extension.',
  summary: 'Special relativity in depth, then gravity as geometry taught physics-first — clocks, orbits and light near black holes — plus nuclei and particles. The accessible bridge to the GR road.',
  prereqs: ['phys2710'],
  boss: { title: 'The Spacetime Navigator', blurb: 'Boosts, intervals, a black-hole clock and a nuclear decay — all in one voyage.' },
  modules: [
    mod('R0', 'Toolkit', ['Geometric units: c = 1', 'Hyperbolic functions and rapidity', 'Metrics on curved surfaces']),
    mod('R1', 'Spacetime', ['Events, worldlines and the light cone', 'The spacetime interval', 'Proper time and the twin paradox']),
    mod('R2', 'Lorentz transformations', ['Boosts as hyperbolic rotations', 'Minkowski diagrams with two observers', 'Simultaneity, contraction and dilation from one diagram']),
    mod('R3', 'Four-vectors', ['Four-velocity and four-momentum', 'Energy and momentum conservation in collisions', 'The Doppler effect and aberration']),
    mod('R4', 'Testing special relativity', ['Muons, clocks on planes and particle accelerators']),
    { id: 'G1', title: 'The equivalence principle', refs: ['gr.S05'] },
    { id: 'G2', title: 'Gravity as geometry', refs: ['gr.S06', 'gr.S09', 'gr.S12'] },
    { id: 'G3', title: 'Schwarzschild orbits and the classic tests', refs: ['gr.S20', 'gr.S23', 'gr.S25', 'gr.S24'] },
    { id: 'G4', title: 'Black holes', refs: ['gr.S21', 'gr.S22'] },
    { id: 'G5', title: 'Gravitational waves', refs: ['gr.S27'] },
    { id: 'C1', title: 'Cosmology (Atlas extension)', refs: ['gr.S30', 'gr.S31'] },
    mod('N1', 'Nuclear structure', ['Nuclear size, mass and binding energy', 'The semi-empirical mass formula']),
    mod('N2', 'Radioactivity', ['Decay laws and half-lives', 'Alpha, beta and gamma decay']),
    mod('N3', 'Nuclear reactions', ['Q-values and cross sections', 'Fission and fusion']),
    mod('P1', 'Elementary particles', ['Leptons, quarks and bosons', 'Conservation laws and Feynman diagrams']),
  ],
};
