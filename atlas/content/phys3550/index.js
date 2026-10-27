import { mod } from '../_util.js';

export default {
  id: 'phys3550', track: 'physics', code: 'PHYS 3550', title: 'Intermediate Classical Mechanics',
  provenance: 'usu-required', evidence: 'A', credits: 3,
  catalog: 'Newtonian mechanics, including dynamics of single and multiple particle systems, conservation laws, harmonic oscillations, central-force motion, rotations, and the two-body problem.',
  source: { label: 'USU catalog 2024–25 course listing', url: 'https://catalog.usu.edu/content.php?catoid=39&navoid=30109' },
  note: 'USU instructors have used Taylor’s Classical Mechanics; the catalog says Lagrangian/Hamiltonian mechanics, accelerated frames and chaos “may also be included”.',
  summary: 'Beyond F = ma: calculus of variations, Lagrangian and Hamiltonian mechanics, central forces and orbits, non-inertial frames, rigid bodies, normal modes and chaos — the road to geodesics.',
  prereqs: ['phys2220', 'math2210', 'math2280'],
  boss: { title: 'Mission to Mercury', blurb: 'An orbital-dynamics campaign: effective potentials, transfers, precession and a Lagrangian you build yourself.' },
  modules: [
    mod('M0', 'Toolkit', ['Vectors and coordinate systems revisited', 'Differential equations a mechanic needs']),
    mod('M1', 'Newton’s laws and conservation laws', ['Newton’s laws in polar and other coordinates', 'Momentum and the centre of mass', 'Energy, conservative forces and the curl test', 'Angular momentum of systems']),
    mod('M2', 'Oscillations', ['Simple harmonic motion revisited', 'Damped oscillators', 'Driven oscillators and resonance', 'Fourier series for periodic forcing']),
    mod('M3', 'Calculus of variations', ['Functionals and the shortest path', 'The Euler–Lagrange equation', 'The brachistochrone', 'Fermat’s principle: Snell’s law from least time', 'Constraints and Lagrange multipliers']),
    mod('M4', 'Lagrangian mechanics', ['Generalized coordinates and constraints', 'Hamilton’s principle of least action', 'Lagrange’s equations in practice', 'Cyclic coordinates and conserved momenta', 'Noether’s theorem: symmetry and conservation']),
    mod('M5', 'Central forces and orbits', ['The two-body problem and reduced mass', 'The effective potential', 'Kepler orbits', 'Orbital transfers and Hohmann manoeuvres', 'Precession of nearly circular orbits']),
    mod('M6', 'Non-inertial frames', ['Accelerating frames', 'Rotating frames', 'Centrifugal and Coriolis forces', 'Foucault’s pendulum']),
    mod('M7', 'Rigid bodies', ['The inertia tensor', 'Principal axes', 'Euler’s equations', 'Free precession and the tennis-racket theorem']),
    mod('M8', 'Coupled oscillators and normal modes', ['Two coupled masses', 'The general method: eigenvalue problems', 'Many coupled oscillators and the continuum limit']),
    mod('M9', 'Hamiltonian mechanics', ['The Hamiltonian and Hamilton’s equations', 'Phase space and Liouville’s theorem', 'Poisson brackets']),
    mod('M10', 'Nonlinear mechanics and chaos', ['The driven damped pendulum', 'Sensitive dependence and Lyapunov exponents', 'Bifurcations and the logistic map']),
    mod('M11', 'Collisions and scattering (enrichment)', ['Scattering angles and cross sections', 'Rutherford scattering']),
    mod('M12', 'The relativistic Lagrangian (bridge)', ['A free particle maximizes proper time']),
    mod('M13', 'Field Lagrangians (bridge)', ['From particles to fields: the vibrating string']),
  ],
};
