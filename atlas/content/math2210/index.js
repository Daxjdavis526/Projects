import { mod } from '../_util.js';

export default {
  id: 'math2210', track: 'math', code: 'MATH 2210', title: 'Multivariable Calculus',
  provenance: 'usu-required', evidence: 'B', credits: 3,
  catalog: 'Partial differentiation and optimization of functions of several variables, multiple integration, calculus of vector fields, including line and surface integrals, and theorems of Green, Gauss, and Stokes.',
  source: { label: 'USU catalog 2025–26: MATH 2210', url: 'https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338001' },
  summary: 'Calculus in three dimensions: partial derivatives, gradients, multiple integrals, vector fields and the theorems of Green, Gauss and Stokes — “one theorem in four costumes”.',
  prereqs: ['math1220'],
  boss: { title: 'The Flux and Circulation Challenge', blurb: 'Choose the theorem, set up the integral, and say what the number means physically.' },
  modules: [
    mod('C3-0', 'Multivariable primer', ['Functions of several variables and their graphs', 'Level curves and contour maps']),
    mod('C3-1', 'Vectors and the geometry of space', ['Coordinates in three dimensions', 'Vectors, dot and cross products revisited', 'Lines and planes', 'Quadric surfaces', 'Cylindrical and spherical coordinates']),
    mod('C3-2', 'Vector-valued functions and motion', ['Curves in space', 'Derivatives and integrals of vector functions', 'Arc length and curvature', 'Velocity, acceleration and the TNB frame', 'Kepler’s laws from vector calculus']),
    mod('C3-3', 'Partial derivatives', ['Limits and continuity in several variables', 'Partial derivatives', 'Tangent planes and linear approximation', 'The chain rule in several variables', 'Directional derivatives and the gradient', 'The gradient as a covector', 'Maxima, minima and saddle points', 'Lagrange multipliers']),
    mod('C3-4', 'Multiple integrals', ['Double integrals over rectangles', 'Double integrals over general regions', 'Double integrals in polar coordinates', 'Triple integrals', 'Triple integrals in cylindrical and spherical coordinates', 'Change of variables and the Jacobian', 'Mass, moments and moments of inertia']),
    mod('C3-5', 'Vector calculus', ['Vector fields', 'Line integrals', 'Conservative fields and potentials', 'Green’s theorem', 'Divergence and curl', 'Parametric surfaces and surface area', 'Surface integrals and flux', 'Stokes’ theorem', 'The divergence theorem', 'One theorem in four costumes']),
    mod('C3-6', 'Second-order linear ODEs (preview)', ['Homogeneous equations with constant coefficients', 'Forced oscillations and resonance'], { prereqs: ['math2210.C3-3'] }),
  ],
};
