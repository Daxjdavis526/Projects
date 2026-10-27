import { mod } from '../_util.js';

export default {
  id: 'phys3750', track: 'physics', code: 'PHYS 3750', title: 'Foundations of Wave Phenomena',
  provenance: 'usu-required', evidence: 'A', credits: 3,
  catalog: 'A survey of wave phenomena in physics, with emphasis on application of mathematical techniques to the wave equation, Schrödinger equation, and Maxwell equations.',
  source: { label: 'Torre, Foundations of Wave Phenomena (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
  note: 'Year 3 Fall in the 2024–25 map; “MATH 2250 or MATH 2270/MATH 2280 must be taken before PHYS 3750.” Charles Torre’s open textbook (CC BY-NC-ND) is the spine; the Atlas links to it and writes its own lessons in the same order.',
  summary: 'One equation, three worlds: oscillators to the continuum limit, Fourier analysis, dispersion, separation of variables — then the Schrödinger and Maxwell equations as wave equations.',
  prereqs: ['phys2220', 'math2280', 'math2210'],
  boss: { title: 'Chirp', blurb: 'Decompose, propagate and disperse a signal — then recognise a gravitational-wave chirp.' },
  modules: [
    mod('W1', 'Harmonic oscillations', ['The harmonic oscillator, complex exponentials', 'Damped and driven oscillators revisited']),
    mod('W2', 'Coupled oscillators', ['Two coupled oscillators and normal modes', 'Beats and energy exchange']),
    mod('W3', 'The linear chain', ['N coupled oscillators', 'Normal modes of a chain']),
    mod('W4', 'The continuum limit', ['From a chain to a string', 'The one-dimensional wave equation']),
    mod('W5', 'Solving the wave equation in one dimension', ['Travelling waves and d’Alembert’s solution', 'Standing waves and boundary conditions', 'Superposition and initial conditions']),
    mod('W6', 'Fourier analysis', ['Fourier series', 'The Fourier transform', 'Wave packets and bandwidth', 'Dispersion, phase and group velocity']),
    mod('W7', 'Waves in three dimensions', ['Plane waves and wave vectors', 'Spherical waves']),
    mod('W8', 'Separation of variables', ['The rectangular membrane', 'The circular membrane and Bessel functions']),
    mod('W9', 'Energy and momentum of waves', ['Energy density and flux on a string', 'Conservation laws for fields']),
    mod('W10', 'The Schrödinger equation as a wave equation', ['Free particle waves and dispersion', 'Bound states as standing waves']),
    mod('W11', 'Vector calculus for fields', ['Divergence, curl and the Laplacian, physically']),
    mod('W12', 'Maxwell’s equations and electromagnetic waves', ['Maxwell’s equations in vacuum', 'Electromagnetic plane waves and polarization']),
    mod('W13', 'Nonlinear waves (enrichment)', ['Solitons and the KdV equation']),
    mod('W14', 'Enrichment: waves everywhere', ['Gravitational waves as a wave equation']),
  ],
};
