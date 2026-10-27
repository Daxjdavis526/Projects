import { mod } from '../_util.js';

export default {
  id: 'math1210', track: 'math', code: 'MATH 1210', title: 'Calculus I',
  provenance: 'usu-entry', evidence: 'A', credits: 4,
  catalog: 'Limits, continuity, derivatives, derivative formulas, derivative applications, indefinite and definite integrals and the basics of integration.',
  source: { label: 'USU catalog: MATH 1210', url: 'https://catalog.usu.edu/courses/MATH1210' },
  summary: 'Limits, derivatives and integrals — the entry requirement for every USU physics program. Taught here only where the verification diagnostic finds a gap.',
  prereqs: ['m0'],
  boss: { title: 'The Rate of Change Challenge', blurb: 'Related rates, optimization and the Fundamental Theorem, in contexts you have not seen.' },
  modules: [
    mod('C1-1', 'Functions toolkit', ['Average rate of change and the difference quotient', 'Function families a physicist meets daily']),
    mod('C1-2', 'Limits and continuity', ['The idea of a limit', 'Limit laws and algebraic techniques', 'One-sided limits and infinite limits', 'Continuity and the Intermediate Value Theorem', 'Limits at infinity', 'The precise (ε–δ) definition']),
    mod('C1-3', 'The derivative', ['Tangent lines and instantaneous rates', 'The derivative as a function', 'Power, sum and constant-multiple rules', 'Product and quotient rules', 'Derivatives of trigonometric functions', 'The chain rule', 'Implicit differentiation', 'Derivatives of exponentials and logarithms', 'Derivatives of inverse functions']),
    mod('C1-4', 'Applications of derivatives', ['Related rates', 'Linear approximation and differentials', 'Extreme values', 'The Mean Value Theorem', 'Curve sketching: what f′ and f″ say', 'Optimization', 'L’Hôpital’s rule', 'Newton’s method']),
    mod('C1-5', 'Integration', ['Antiderivatives', 'Area and Riemann sums', 'The definite integral', 'The Fundamental Theorem of Calculus', 'Substitution', 'Net change and displacement from velocity']),
  ],
};
