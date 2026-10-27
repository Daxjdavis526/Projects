import { mod } from '../_util.js';

export default {
  id: 'st-d', track: 'spacetime', code: 'Advanced Math D', title: 'Complex Analysis',
  provenance: 'usu-course', evidence: 'A', credits: 3,
  catalog: 'MATH 5270 Complex Variables: analytic functions, contour integration, and residue theorem conformal mappings.',
  source: { label: 'USU catalog: MATH 5270', url: 'https://catalog.usu.edu/courses/MATH5270' },
  note: 'Geometric first, as in Needham’s Visual Complex Analysis: functions as maps, the derivative as an “amplitwist”. Not required by this B.S.',
  summary: 'Complex functions as maps of the plane: analyticity and Cauchy–Riemann, contour integrals, Cauchy’s theorem, Laurent series, residues for real integrals, conformal maps — and the quasinormal ringing of black holes.',
  prereqs: ['math2210', 'm0'],
  boss: { title: 'The Residue Hunt', blurb: 'Evaluate real integrals by leaving the real line, and map a flow conformally.' },
  modules: [
    mod('D1', 'Complex numbers geometrically', ['Multiplication as rotation and scaling', 'Euler’s formula revisited']),
    mod('D2', 'Complex functions as maps', ['Visualizing functions: grids and domain colouring', 'Möbius transformations']),
    mod('D3', 'Differentiability', ['The complex derivative as an amplitwist', 'The Cauchy–Riemann equations', 'Harmonic functions']),
    mod('D4', 'Elementary functions', ['The exponential and logarithm', 'Branch cuts and multivalued functions', 'Complex powers and trigonometric functions']),
    mod('D5', 'Contour integrals', ['Integrating along a path', 'Estimating integrals: the ML inequality']),
    mod('D6', 'Cauchy’s theorem', ['Cauchy’s theorem', 'The Cauchy integral formula', 'Liouville’s theorem and the fundamental theorem of algebra']),
    mod('D7', 'Series', ['Taylor series and the radius of convergence', 'Laurent series']),
    mod('D8', 'Singularities and residues', ['Poles, essential singularities and removable ones', 'The residue theorem']),
    mod('D9', 'Real integrals by residues', ['Rational functions on the real line', 'Trigonometric integrals', 'Jordan’s lemma and Fourier-type integrals']),
    mod('D10', 'Conformal maps', ['Angle-preserving maps', 'Potential flow and electrostatics in 2D']),
    mod('D11', 'Physics applications', ['Causality, Green’s functions and Kramers–Kronig', 'Quasinormal modes of black holes']),
  ],
};
