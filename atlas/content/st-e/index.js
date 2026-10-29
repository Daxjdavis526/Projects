import { mod } from '../_util.js';

export default {
  id: 'st-e', track: 'spacetime', code: 'Advanced Math E', title: 'Fourier Analysis and Mathematical Methods',
  provenance: 'usu-course', evidence: 'B', credits: 3,
  catalog: 'USU offers PHYS 5340/5350 Methods of Theoretical Physics and MATH 5410 Methods of Applied Mathematics; neither is required by this B.S.',
  source: { label: 'USU catalog 2025–26: Physics MS', url: 'https://catalog.usu.edu/preview_program.php?catoid=40&poid=40338&print=&returnto=30650' },
  summary: 'The physicist’s toolkit: Fourier series and transforms, Laplace transforms, Sturm–Liouville theory, orthogonal polynomials, spherical harmonics, Bessel and Gamma functions, Green’s functions, variational calculus and spectral methods.',
  prereqs: ['math2280', 'math1220'],
  boss: { title: 'The Methods Marathon', blurb: 'Expand, transform and solve: the right special function for every geometry.' },
  modules: [
    mod('E1', 'Fourier series', ['Periodic functions as sums of sines', 'Computing Fourier coefficients', 'Complex Fourier series']),
    mod('E2', 'Convergence', ['Pointwise and mean-square convergence', 'The Gibbs phenomenon', 'Parseval’s theorem']),
    mod('E3', 'The Fourier transform', ['From series to transforms', 'Properties and convolution', 'The uncertainty principle of signals']),
    mod('E4', 'The Laplace transform as a method', ['Transforms, poles and stability']),
    mod('E5', 'Sturm–Liouville theory', ['Self-adjoint operators', 'Orthogonal eigenfunctions and completeness']),
    mod('E6', 'Orthogonal polynomials', ['Legendre polynomials', 'Hermite and Laguerre polynomials']),
    mod('E7', 'Spherical harmonics', ['Spherical harmonics and multipoles']),
    mod('E8', 'Bessel functions', ['Bessel’s equation and its solutions', 'Vibrating drums']),
    mod('E9', 'The Gamma function and special integrals', ['The Gamma function', 'Gaussian and related integrals']),
    mod('E10', 'Green’s functions', ['Impulse responses and Green’s functions']),
    mod('E11', 'Calculus of variations', ['Functional derivatives', 'Constraints and Lagrange multipliers in variational problems']),
    mod('E12', 'Spectral methods', ['Chebyshev expansions and exponential convergence']),
  ],
};
