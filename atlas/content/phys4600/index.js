import { mod } from '../_util.js';

export default {
  id: 'phys4600', track: 'physics', code: 'PHYS 4600', title: 'Electromagnetism II',
  provenance: 'usu-reconstructed', evidence: 'A', credits: 3,
  catalog: 'Topics include electromagnetic induction, conservation laws with fields, electromagnetic waves, dynamic response of materials, electromagnetic potentials, radiation, and the relativistic description of electromagnetism.',
  source: { label: 'USU catalog 2025–26: PHYS 4600', url: 'https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338889' },
  note: 'A program “touchstone” course. Prerequisites PHYS 3600 and PHYS 3750. Corresponds to Griffiths chapters 7–12.',
  summary: 'Fields that move: induction, the Poynting theorem, waves in matter, potentials and gauges, radiation from accelerated charges, and electrodynamics in four-vector form — the template for linearized gravity.',
  prereqs: ['phys3600', 'phys3750'],
  boss: { title: 'Maxwell’s Equations Challenge', blurb: 'From potentials to radiated power, with a Road-to-Spacetime bonus round.' },
  modules: [
    mod('M0', 'Bridge from Electromagnetism I', ['What changes when fields depend on time']),
    mod('M1', 'Electrodynamics', ['Ohm’s law and emf', 'Faraday’s law and induced fields', 'Inductance and magnetic energy', 'Maxwell’s correction: the displacement current', 'Maxwell’s equations in matter and boundary conditions']),
    mod('M2', 'Conservation laws', ['Charge conservation and continuity', 'Poynting’s theorem', 'The Maxwell stress tensor and field momentum', 'Angular momentum in fields']),
    mod('M3', 'Electromagnetic waves', ['Waves in vacuum', 'Waves in linear media and at interfaces', 'Fresnel equations', 'Absorption and dispersion in conductors', 'Waveguides']),
    mod('M4', 'Potentials and gauges', ['Scalar and vector potentials', 'Gauge transformations: Coulomb and Lorenz', 'Retarded potentials', 'Liénard–Wiechert potentials']),
    mod('M5', 'Radiation', ['Electric dipole radiation', 'Magnetic dipole radiation', 'Radiation from a point charge: the Larmor formula', 'Radiation reaction']),
    mod('M6', 'Relativistic electrodynamics', ['Lorentz transformations of fields', 'The field tensor F^μν', 'Maxwell’s equations in covariant form', 'The stress–energy tensor of the field']),
  ],
};
