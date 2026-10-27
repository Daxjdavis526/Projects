import { mod } from '../_util.js';

export default {
  id: 'math2280', track: 'math', code: 'MATH 2280', title: 'Ordinary Differential Equations',
  provenance: 'usu-required', evidence: 'A', credits: 3,
  catalog: 'Analytic solution techniques for ODEs; initial value and boundary value problems with applications; higher-order scalar equations; first-order linear systems; Laplace transforms.',
  source: { label: 'USU catalog: MATH 2280', url: 'https://catalog.usu.edu/courses/MATH2280' },
  summary: 'The equations of motion of everything: first-order models, oscillators, linear systems, phase portraits, Laplace transforms, boundary-value problems and numerical solvers.',
  prereqs: ['math1220', 'math2270'],
  boss: { title: 'The Phase Portrait Challenge', blurb: 'Classify, solve and simulate — then predict what a real oscillator or orbit does.' },
  modules: [
    mod('DE-1', 'What differential equations are', ['Order, linearity and solutions', 'Slope fields and qualitative behaviour', 'Existence and uniqueness (and when they fail)']),
    mod('DE-2', 'First-order equations', ['Separable equations', 'Linear equations and integrating factors', 'Exact equations', 'Substitutions: Bernoulli and homogeneous', 'Population models: exponential and logistic', 'Mixing, cooling and RC circuits', 'Euler’s method', 'Improved Euler and Runge–Kutta (RK4)']),
    mod('DE-3', 'Higher-order linear equations', ['Second-order linear equations', 'Constant coefficients: real, repeated and complex roots', 'Undetermined coefficients', 'Variation of parameters', 'Free oscillations: damping regimes', 'Forced oscillations and resonance', 'RLC circuits']),
    mod('DE-4', 'Linear systems', ['Systems of first-order equations', 'The eigenvalue method', 'Complex and repeated eigenvalues', 'The matrix exponential', 'Coupled oscillators and normal modes'], { prereqs: ['math2270.LA-9'] }),
    mod('DE-5', 'Nonlinear systems and stability', ['Equilibria and linearization', 'Phase-plane classification: the trace–determinant map', 'Predator–prey and competition', 'The nonlinear pendulum', 'Limit cycles and conservative systems']),
    mod('DE-6', 'Laplace transforms', ['The Laplace transform', 'Solving initial-value problems', 'Step functions and shifted forcing', 'Impulses and the delta function', 'Convolution and transfer functions']),
    mod('DE-7', 'Series solutions', ['Power-series solutions near ordinary points', 'Frobenius’ method and Bessel’s equation']),
    mod('DE-8', 'Boundary-value problems', ['Boundary-value problems versus initial-value problems', 'Eigenvalue problems: the vibrating string', 'Fourier series for boundary-value problems']),
    mod('DE-9', 'Sturm–Liouville theory (enrichment)', ['Sturm–Liouville problems and orthogonal eigenfunctions']),
  ],
};
