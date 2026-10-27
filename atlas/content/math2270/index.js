import { mod } from '../_util.js';

export default {
  id: 'math2270', track: 'math', code: 'MATH 2270', title: 'Linear Algebra',
  provenance: 'usu-required', evidence: 'B', credits: 3,
  catalog: 'Solutions of linear systems, matrix operations, matrix factorization, vector spaces, subspaces, linear independence, bases, linear transformations, eigensystems, orthogonality, Gram-Schmidt orthogonalization, and projections.',
  source: { label: 'USU catalog 2025–26: MATH 2270', url: 'https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338004' },
  summary: 'Vectors as objects, not columns: systems, transformations, eigenvalues, orthogonality, quadratic forms and duality — the road from matrices to tensors. Needs only Calculus I.',
  prereqs: ['math1210'],
  boss: { title: 'The Basis Change Challenge', blurb: 'Eigenvectors, projections and a quadratic form whose signature decides everything.' },
  modules: [
    mod('LA-1', 'Vectors and linear combinations', ['Vectors, length and angle', 'Linear combinations and span']),
    mod('LA-2', 'Linear systems and elimination', ['Systems of equations as matrices', 'Gaussian elimination and row echelon form', 'Reduced row echelon form and solution sets', 'Applications: circuits, statics and balancing']),
    mod('LA-3', 'Matrix algebra', ['Matrix multiplication as composition', 'Inverse matrices', 'LU factorization', 'Transposes and symmetric matrices']),
    mod('LA-4', 'Linear transformations', ['Transformations of the plane', 'The matrix of a linear map', 'Kernel and range']),
    mod('LA-5', 'Subspaces', ['Column space and null space', 'Linear independence', 'Basis and dimension', 'Rank and the four fundamental subspaces']),
    mod('LA-6', 'Abstract vector spaces', ['Vector spaces beyond arrows', 'Function spaces and polynomials as vectors']),
    mod('LA-7', 'Change of basis', ['Coordinates relative to a basis', 'Change-of-basis matrices', 'Similar matrices: one operator, many matrices']),
    mod('LA-8', 'Determinants', ['The determinant as signed volume', 'Computing determinants and cofactors', 'Cramer’s rule and inverses']),
    mod('LA-9', 'Eigenvalues and eigenvectors', ['Eigenvectors: directions a map preserves', 'The characteristic polynomial', 'Diagonalization', 'Complex eigenvalues and rotations', 'Applications: dynamical systems and Markov chains']),
    mod('LA-10', 'Orthogonality and least squares', ['Inner products and orthogonality', 'Orthogonal projections', 'Gram–Schmidt and QR', 'Least-squares fitting']),
    mod('LA-11', 'Symmetric matrices and quadratic forms', ['The spectral theorem', 'Quadratic forms and principal axes', 'Sylvester’s law of inertia and signature']),
    mod('LA-12', 'The singular value decomposition', ['The SVD geometrically', 'Low-rank approximation and data']),
    mod('LA-13', 'Complex vector spaces', ['Complex inner products and Hermitian matrices', 'Unitary matrices']),
    mod('LA-14', 'Duality and bilinear forms', ['Dual spaces and covectors', 'Two transformation laws: vectors versus covectors', 'Bilinear forms and the metric idea']),
  ],
};
