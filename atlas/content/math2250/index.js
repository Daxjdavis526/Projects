// MATH 2250 is assembled from the Linear Algebra and ODE lessons rather than
// written twice: each module here points at the modules that teach it.

export default {
  id: 'math2250', track: 'math', code: 'MATH 2250', title: 'Linear Algebra and Differential Equations',
  provenance: 'usu-required', evidence: 'A', credits: 4,
  catalog: 'Linear systems, abstract vector spaces, matrices through eigenvalues and eigenvectors, solutions of ODEs, Laplace transforms, first-order systems.',
  source: { label: 'USU catalog: MATH 2250', url: 'https://catalog.usu.edu/courses/MATH2250' },
  note: 'USU accepts MATH 2250 in place of MATH 2270 + MATH 2280 in prerequisites. Whether its 4 credits count inside this degree’s 13-credit math block could not be verified. The course is “primarily oriented towards students in engineering”; for a GR-bound learner the Atlas recommends 2270 + 2280.',
  summary: 'USU’s combined course, routed through the Linear Algebra and ODE lessons, plus a bridge pack that restores what physics and GR need from the longer pair.',
  prereqs: ['math1220'],
  alias: true,
  boss: { title: 'The Combined Systems Challenge', blurb: 'Eigenvalues meet oscillators: one problem, both halves of the course.' },
  modules: [
    { id: 'P-1', title: 'First-order differential equations', refs: ['math2280.DE-1', 'math2280.DE-2'] },
    { id: 'P-2', title: 'Linear systems and matrices', refs: ['math2270.LA-1', 'math2270.LA-2', 'math2270.LA-3'] },
    { id: 'P-3', title: 'Vector spaces', refs: ['math2270.LA-5', 'math2270.LA-6'] },
    { id: 'P-4', title: 'Determinants, eigenvalues and eigenvectors', refs: ['math2270.LA-8', 'math2270.LA-9'] },
    { id: 'P-5', title: 'Higher-order linear equations', refs: ['math2280.DE-3'] },
    { id: 'P-6', title: 'Linear systems of differential equations', refs: ['math2280.DE-4'] },
    { id: 'P-7', title: 'Laplace transforms', refs: ['math2280.DE-6'] },
    { id: 'P-8', title: 'The physics and GR bridge pack', refs: ['math2270.LA-7', 'math2270.LA-10', 'math2270.LA-11', 'math2270.LA-12', 'math2270.LA-14', 'math2280.DE-7', 'math2280.DE-8'] },
  ],
};
