import { mod } from '../_util.js';

export default {
  id: 'math1220', track: 'math', code: 'MATH 1220', title: 'Calculus II',
  provenance: 'usu-required', evidence: 'B', credits: 4,
  catalog: 'Integration, integration techniques, infinite series, introduction to vectors, and applications.',
  source: { label: 'USU catalog: MATH 1220', url: 'https://catalog.usu.edu/courses/MATH1220' },
  summary: 'Integration techniques, applications, sequences and series, Taylor series, parametric and polar curves, and a first look at vectors. Part of the 13-credit math block.',
  prereqs: ['math1210'],
  boss: { title: 'The Infinite Series Challenge', blurb: 'Convergence verdicts, Taylor approximations with error bounds, and integrals that need the right technique.' },
  modules: [
    mod('C2-0', 'Integration review', ['Antiderivatives and the Fundamental Theorem', 'Substitution, revisited']),
    mod('C2-1', 'Applications of integration', ['Area between curves', 'Volumes by slicing: disks and washers', 'Volumes by cylindrical shells', 'Arc length', 'Surface area of revolution', 'Work done by a variable force', 'Hydrostatic force', 'Moments and centres of mass', 'Hyperbolic functions and their calculus'], { prereqs: ['math1220.C2-0'] }),
    mod('C2-2', 'Techniques of integration', [{ title: 'Integration by parts', minutes: 8 }, 'Repeated and cyclic integration by parts', 'Trigonometric integrals: sines and cosines', 'Trigonometric integrals: tangents and secants', 'Trigonometric substitution', 'Partial fractions: distinct linear factors', 'Partial fractions: repeated and quadratic factors', 'A strategy for integration', 'Numerical integration: midpoint and trapezoid rules', 'Simpson’s rule and error bounds', 'Improper integrals: infinite limits', 'Improper integrals: unbounded integrands and comparison'], { prereqs: ['math1220.C2-0'] }),
    mod('C2-3', 'Differential equations preview', ['What a differential equation says; slope fields', 'Separable equations', 'Exponential and logistic growth', 'First-order linear equations'], { prereqs: ['math1220.C2-2'] }),
    mod('C2-4', 'Sequences and series', ['Sequences and their limits', 'Monotone and bounded sequences', 'Series, partial sums and geometric series', 'The divergence test and telescoping series', 'The integral test and p-series', 'Comparison and limit comparison tests', 'Alternating series and their error', 'Absolute convergence: ratio and root tests', 'Choosing a convergence test'], { prereqs: ['math1220.C2-2'] }),
    mod('C2-5', 'Power and Taylor series', ['Power series and the radius of convergence', 'The interval of convergence', 'Building series by differentiating and integrating', 'Taylor and Maclaurin series', 'Taylor polynomials and the Lagrange remainder', 'The binomial series', 'Series in physics: small-angle and low-speed approximations'], { prereqs: ['math1220.C2-4'] }),
    mod('C2-6', 'Parametric curves, polar coordinates and conics', ['Parametric curves', 'Calculus of parametric curves', 'Polar coordinates', 'Area and arc length in polar coordinates', 'Conic sections', 'Conics in polar form and Kepler’s first law'], { prereqs: ['math1220.C2-1.4'] }),
    mod('C2-7', 'Introduction to vectors', ['Vectors in the plane', 'Vectors in three dimensions', 'The dot product and projections', 'The cross product', 'Lines and planes in space'], { prereqs: ['math1220.C2-0'] }),
  ],
};
