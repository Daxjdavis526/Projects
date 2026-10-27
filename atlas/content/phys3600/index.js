import { mod } from '../_util.js';

export default {
  id: 'phys3600', track: 'physics', code: 'PHYS 3600', title: 'Electromagnetism I',
  provenance: 'usu-required', evidence: 'A', credits: 3,
  catalog: 'Topics include the Maxwell equations, Coulomb’s and Biot-Savart laws, scalar and vector potentials, boundary conditions, multipole expansions, and energy.',
  source: { label: 'USU catalog 2024–25: PHYS 3600', url: 'https://usu.catalog.acalog.com/preview_course_nopop.php?catoid=39&coid=330709' },
  note: 'A program “touchstone” course. Prerequisites: PHYS 2710, PHYS 3550, MATH 2210, and MATH 2250 or 2280. Corresponds to Griffiths chapters 1–6.',
  summary: 'Static fields done properly: vector calculus and the delta function, Gauss and potentials, conductors and boundary-value problems, multipoles, dielectrics and magnetostatics.',
  prereqs: ['phys2710', 'phys3550', 'math2210', 'math2280'],
  boss: { title: 'The Boundary-Value Gauntlet', blurb: 'Images, separation of variables and multipoles — pick the method the geometry demands.' },
  modules: [
    mod('M0', 'Vector calculus and the delta function', ['Gradient, divergence and curl revisited', 'The fundamental theorems', 'Curvilinear coordinates', 'The Dirac delta function', 'Helmholtz’s theorem']),
    mod('M1', 'The electric field', ['Coulomb’s law and continuous distributions', 'Divergence and curl of E', 'Gauss’s law in integral and differential form']),
    mod('M2', 'Electric potential and energy', ['The potential and Poisson’s equation', 'Boundary conditions on E and V', 'Work and energy in electrostatics']),
    mod('M3', 'Conductors', ['Conductors in equilibrium', 'Induced charge and capacitors']),
    mod('M4', 'Boundary-value techniques', ['Laplace’s equation and uniqueness', 'The method of images', 'Separation of variables: Cartesian', 'Separation of variables: spherical and Legendre polynomials', 'The multipole expansion']),
    mod('M5', 'Fields in matter: dielectrics', ['Polarization and bound charge', 'The displacement field D', 'Linear dielectrics']),
    mod('M6', 'Magnetostatics', ['The Lorentz force law', 'The Biot–Savart law', 'Divergence and curl of B; Ampère’s law', 'The vector potential', 'Magnetostatic boundary conditions', 'The magnetic dipole']),
    mod('M7', 'Fields in matter: magnetism', ['Magnetization and bound currents', 'The auxiliary field H', 'Linear and nonlinear media']),
    mod('M8', 'The static Maxwell equations', ['Electrostatics and magnetostatics side by side']),
  ],
};
