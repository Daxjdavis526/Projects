import { mod } from '../_util.js';

export default {
  id: 'research', track: 'experimental', code: 'PHYS 4900', title: 'Research in Physics',
  provenance: 'usu-required', evidence: 'A', credits: 4,
  catalog: 'Prior to registration, student must make arrangements with the Physics Department’s undergraduate research advisor. Written and oral presentations on the outcomes of the project are required.',
  source: { label: 'USU catalog: PHYS 4900', url: 'https://catalog.usu.edu/courses/PHYS4900' },
  note: '“A total of 4 credits of PHYS 4900: Research in Physics (CI) is required” for this emphasis (1–3 credits per enrolment, repeatable). A touchstone course with “advanced proficiency” expected.',
  summary: 'How research actually works — literature, questions, models, simulation, inference, reproducibility, presenting — practised on seven miniature projects with real public data: GW150914, the Pantheon+ Hubble diagram, Mercury, exoplanets and more.',
  prereqs: ['lab'],
  boss: { title: 'The Mini-Thesis', blurb: 'Pick a project, reproduce a published number, and present it with honest uncertainty.' },
  modules: [
    mod('R0', 'What research is', ['From homework to open questions']),
    mod('R1', 'Finding the literature', ['arXiv, ADS and INSPIRE', 'Search strategies and citation trails']),
    mod('R2', 'Reading a paper', ['The three-pass method', 'Figures first: reading plots critically']),
    mod('R3', 'Asking a research question', ['Questions that can be answered', 'Scoping a project']),
    mod('R4', 'Modelling', ['From physics to a computable model', 'Dimensional analysis and scaling as research tools']),
    mod('R5', 'Simulation', ['Verification versus validation', 'Convergence tests for simulations']),
    mod('R6', 'Inference from data', ['Likelihoods and parameter estimation', 'Model comparison']),
    mod('R7', 'Reproducibility', ['Version control and notebooks', 'Reproducing a published result']),
    mod('R8', 'Presenting results', ['Talks and posters', 'Writing a research report']),
    mod('R9', 'Proposals', ['Writing a short proposal']),
    mod('P', 'Miniature research projects', ['GW150914: find the chirp with a matched filter', 'The Pantheon+ Hubble diagram: measure H₀ and Ωm', 'Kepler-10b: a planet from a light curve', 'Mercury’s perihelion by numerical integration', 'Measuring g with a pendulum, large-angle corrections included', 'Counting statistics with a cosmic-ray detector', 'Gaia parallaxes and the distance ladder'], { prereqs: ['research.R6'] }),
  ],
};
