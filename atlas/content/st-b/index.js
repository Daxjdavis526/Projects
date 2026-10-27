import { mod } from '../_util.js';

export default {
  id: 'st-b', track: 'spacetime', code: 'Advanced Math B', title: 'Partial Differential Equations',
  provenance: 'usu-course', evidence: 'B', credits: 3,
  catalog: 'USU offers MATH 5420 Partial Differential Equations and the graduate MATH 6450; neither is required by this B.S.',
  source: { label: 'USU catalog 2025–26: program list including MATH 5420', url: 'https://catalog.usu.edu/preview_program.php?catoid=40&poid=40274&print=' },
  summary: 'What PDEs say and how to solve them: characteristics, the wave, heat and Laplace equations, separation of variables, Fourier methods, Green’s functions, shocks, well-posedness and finite differences — ending with Einstein’s equations as a PDE system.',
  prereqs: ['math2280', 'math2210'],
  boss: { title: 'The Well-Posedness Trial', blurb: 'Classify, solve and simulate — and explain why a scheme blew up.' },
  modules: [
    mod('B0', 'What PDEs represent', ['From physical laws to PDEs']),
    mod('B1', 'Partial derivatives, physically', ['Rates of change in space and time', 'Conservation laws in differential form']),
    mod('B2', 'First-order PDEs', ['The transport equation', 'The method of characteristics', 'Characteristics for variable speed']),
    mod('B3', 'The wave equation', ['Derivation from a string', 'd’Alembert’s solution', 'Domains of dependence and causality', 'Energy conservation for waves']),
    mod('B4', 'The heat equation', ['Diffusion from random walks', 'The fundamental solution', 'Smoothing and the maximum principle']),
    mod('B5', 'Laplace and Poisson equations', ['Harmonic functions and the mean-value property', 'Poisson’s equation and gravity']),
    mod('B6', 'Boundary-value problems', ['Dirichlet, Neumann and Robin conditions', 'Uniqueness by energy methods']),
    mod('B7', 'Separation of variables', ['Separation on an interval', 'Rectangles and the vibrating membrane', 'Disks, spheres and special functions']),
    mod('B8', 'Fourier methods', ['Fourier series solutions', 'Fourier transform solutions on the line']),
    mod('B9', 'Green’s functions', ['Green’s functions for ODE boundary problems', 'Green’s functions for Poisson’s equation', 'Retarded Green’s functions for the wave equation']),
    mod('B10', 'Classification', ['Hyperbolic, parabolic and elliptic equations', 'Why the type decides what you can ask']),
    mod('B11', 'Nonlinear PDEs', ['Burgers’ equation and shock formation', 'Weak solutions and the Rankine–Hugoniot condition']),
    mod('B12', 'Well-posedness and initial-value formulations', ['Hadamard’s criteria', 'Weak versus strong hyperbolicity']),
    mod('B13', 'Numerical PDE methods', ['Finite differences', 'Stability, the CFL condition and blow-up', 'Convergence and consistency']),
    mod('B14', 'Constraints and evolution', ['Constraint equations that ride along with evolution', 'Constraint damping']),
    mod('B15', 'Einstein’s equations as a PDE system', ['Four constraints and six evolution equations', 'Harmonic gauge and Choquet-Bruhat’s theorem', 'Why ADM is weakly hyperbolic and BSSN works']),
  ],
};
