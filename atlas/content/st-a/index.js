import { mod } from '../_util.js';

export default {
  id: 'st-a', track: 'spacetime', code: 'Advanced Math A', title: 'Vector and Tensor Analysis',
  provenance: 'supplementary', evidence: null, credits: null,
  note: 'No USU undergraduate course; tensor calculus appears in the graduate MATH 6110 (third-party topic list). Conventions throughout: Carroll’s, signature (−,+,+,+).',
  source: { label: 'Carroll, Lecture Notes on General Relativity (gr-qc/9712019)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  summary: 'Start intuitive, end computing: index notation, vectors and covectors as geometric objects, coordinate transformations, the metric, raising and lowering, tensor fields and the covariant derivative — checked in flat space first.',
  prereqs: ['math2270', 'math2210'],
  boss: { title: 'The Index Gauntlet', blurb: 'Transform, contract, raise and differentiate — and prove a quantity is a scalar.' },
  modules: [
    mod('A1', 'Scalars, vectors and the summation convention', ['Scalars, vectors and arrays of numbers', 'Index notation and Einstein summation', 'The Kronecker delta and the Levi-Civita symbol', 'Index gymnastics: practice']),
    mod('A2', 'Vectors as geometric objects', ['A vector is not its components', 'How components change when the basis changes', 'Tangent vectors as directional derivatives']),
    mod('A3', 'Covectors', ['Covectors as stacks of level lines', 'The gradient df is a covector', 'Pairing a covector with a vector', 'The dual basis', 'Why covector components carry lower indices']),
    mod('A4', 'Coordinates and Jacobians', ['Coordinate transformations', 'The Jacobian matrix as the transformation rule', 'Polar coordinates: the basis vectors ∂r and ∂θ', 'Spherical coordinates']),
    mod('A5', 'Tensors', ['Tensors as multilinear machines', 'Rank and index placement: type (k, l)', 'The tensor product', 'Contraction', 'Symmetric and antisymmetric parts']),
    mod('A6', 'The metric tensor', ['The metric as a dot-product machine', 'Line elements ds²', 'The metric in polar and spherical coordinates', 'Raising and lowering indices', 'The inverse metric', 'Signature and the Minkowski metric']),
    mod('A7', 'Tensor fields', ['Tensor fields on space', 'Transformation laws for fields', 'Invariants: building scalars from tensors']),
    mod('A8', 'Differentiating tensors', ['Why ∂μVν is not a tensor', 'Christoffel symbols in flat polar coordinates', 'The covariant derivative', 'Metric compatibility: ∇g = 0']),
    mod('A9', 'Calculations in curvilinear coordinates', ['Divergence and Laplacian from the covariant derivative', 'Straight lines in polar coordinates: flat-space geodesics']),
    mod('A10', 'Capstone: the tensor toolbox', ['The Levi-Civita tensor and the volume element', 'Putting it together: a full tensor calculation']),
  ],
};
