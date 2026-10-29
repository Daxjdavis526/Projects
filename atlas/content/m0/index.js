import { mod } from '../_util.js';

export default {
  id: 'm0', track: 'math', code: 'M0', title: 'Mathematical Foundations',
  provenance: 'supplementary', evidence: null, credits: null,
  summary: 'A skippable, diagnostic-gated refresher of everything from algebra to vectors and complex numbers. USU admits physics majors after Calculus I, so this course exists for gaps, not as a gate.',
  source: { label: 'OpenStax Precalculus 2e (structure)', url: 'https://github.com/openstax/osbooks-college-algebra-bundle/blob/main/collections/precalculus-2e.collection.xml' },
  prereqs: [],
  boss: { title: 'The Foundations Gauntlet', blurb: 'Mixed algebra, trigonometry, logs and vectors under one roof — no hints, no topic labels.' },
  modules: [
    mod('M0-1', 'Notation and arithmetic', ['Reading mathematical notation: Σ, Π, Greek letters', 'Fractions, ratios and percentages', 'Exponent rules and roots', 'Scientific notation and orders of magnitude']),
    mod('M0-2', 'Algebraic manipulation', ['Expanding and factoring', 'Rational expressions', 'Solving for a variable in a formula', 'Completing the square']),
    mod('M0-3', 'Equations and inequalities', ['Linear and quadratic equations', 'Systems of linear equations', 'Inequalities and absolute value', 'Equations with radicals and rational terms']),
    mod('M0-4', 'Functions and graphs', ['What a function is: domain and range', 'Transformations of graphs', 'Composition and inverse functions', 'Reading graphs as physical stories']),
    mod('M0-5', 'Polynomials and rational functions', ['Polynomial behaviour and roots', 'Rational functions and asymptotes', 'Polynomial division']),
    mod('M0-6', 'Exponentials and logarithms', ['Exponential growth and decay', 'Logarithms as inverse exponentials', 'Log rules and solving exponential equations', 'e and the natural log', 'Log scales and log–log plots']),
    mod('M0-7', 'Trigonometry', ['Angles in degrees and radians', 'Right-triangle trigonometry', 'The unit circle', 'Graphs of sine and cosine', 'Amplitude, frequency and phase']),
    mod('M0-8', 'Trigonometric identities and inverses', ['Pythagorean and reciprocal identities', 'Sum, difference and double-angle formulas', 'Writing a sin x + b cos x as R sin(x + φ)', 'Inverse trigonometric functions', 'Laws of sines and cosines']),
    mod('M0-9', 'Coordinate geometry and 2D vectors', ['Lines, slopes and distance', 'Circles and polar coordinates', 'Parametric descriptions of motion', 'Vectors and components', 'Adding and resolving vectors']),
    mod('M0-10', 'Complex numbers', ['Imaginary numbers and arithmetic', 'The complex plane, modulus and argument', 'Euler’s formula and polar form', 'Powers and roots of complex numbers']),
    mod('M0-11', 'Conic sections', ['Parabolas', 'Ellipses and hyperbolas', 'Eccentricity']),
    mod('M0-12', 'Sequences, series and the binomial theorem', ['Arithmetic and geometric sequences', 'Summation and geometric series', 'The binomial theorem']),
    mod('M0-13', 'Quantitative reasoning', ['Dimensional analysis', 'Fermi estimates', 'Mathematical modelling: from words to equations', 'Proportional reasoning and scaling laws']),
    mod('M0-14', 'Logic and proof', ['Statements, implication and negation', 'Direct proof and counterexamples', 'Proof by contradiction', 'Proof by induction']),
  ],
};
