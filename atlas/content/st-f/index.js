import { mod } from '../_util.js';

export default {
  id: 'st-f', track: 'spacetime', code: 'Advanced Math F', title: 'Numerical Methods',
  provenance: 'usu-course', evidence: 'B', credits: 3,
  catalog: 'USU offers MATH 4610 and MATH 5610/5620 numerical analysis, and graduate MATH 6620; none is required by this B.S.',
  source: { label: 'USU catalog 2024–25: MATH 4610', url: 'https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=332980' },
  summary: 'How computers get physics right — and wrong: floating point, stability, root finding, interpolation, quadrature, matrix decompositions, eigenvalues, ODE and PDE solvers, symplectic integration, convergence testing, and a three-level geodesic lab around a black hole.',
  prereqs: ['math1220', 'prog'],
  boss: { title: 'The Convergence Court', blurb: 'Show your simulation converges at the order you claim — or find the bug.' },
  modules: [
    mod('F1', 'Floating-point arithmetic', ['Binary floating point and machine epsilon', 'Round-off and cancellation']),
    mod('F2', 'Error and stability', ['Truncation versus round-off error', 'Conditioning and stability']),
    mod('F3', 'Root finding', ['Bisection', 'Newton’s method and its convergence', 'Secant and safeguarded methods']),
    mod('F4', 'Interpolation', ['Polynomial interpolation and Runge’s phenomenon', 'Chebyshev nodes and splines']),
    mod('F5', 'Quadrature', ['Newton–Cotes rules and their error', 'Gaussian quadrature', 'Adaptive quadrature']),
    mod('F6', 'Numerical linear algebra', ['LU decomposition and pivoting', 'QR and Cholesky']),
    mod('F7', 'Eigenvalue methods', ['Power iteration', 'The QR algorithm']),
    mod('F8', 'Least squares and the SVD numerically', ['Normal equations versus QR', 'The SVD in computation']),
    mod('F9', 'ODE solvers', ['Euler’s method and its order', 'Runge–Kutta methods', 'Adaptive step size']),
    mod('F10', 'Symplectic integration', ['Leapfrog and velocity Verlet', 'Why symplectic integrators keep energy bounded']),
    mod('F11', 'PDE solvers', ['Explicit and implicit schemes', 'Von Neumann stability analysis']),
    mod('F12', 'Spectral methods', ['Chebyshev differentiation']),
    mod('F13', 'Convergence testing', ['Measuring the order of convergence', 'Richardson extrapolation']),
    mod('F14', 'The geodesic lab', ['Level 1: radial orbits in proper time', 'Level 2: the orbit equation u(φ)', 'Level 3: the full geodesic equation with conserved-quantity checks']),
  ],
};
