// The Road to Einstein's Field Equations: 37 steps, each with an Intuition
// lesson (.i) and a Derivation lesson (.d), plus fourteen equation
// dissections. Step numbers never change; the two modes are different routes
// through them (see ROUTES). Every step carries an honesty badge.

// built lesson modules, by step and mode
const LOADS = {
  'S09.i': () => import('./S09.i.js'),
};

const S = (n, title, badges, i, d, extra = {}) => ({
  id: `S${String(n).padStart(2, '0')}`, step: n, title, badges, independent: true, ...extra,
  lessons: [
    { n: 'i', title: i.title ?? i, mode: 'intuition', minutes: i.minutes ?? 7, prereqs: i.prereqs ?? [], concept: !!i.concept, badges, load: LOADS[`S${String(n).padStart(2, '0')}.i`] },
    { n: 'd', title: d.title ?? d, mode: 'derivation', minutes: d.minutes ?? 12, difficulty: d.difficulty ?? 3, prereqs: d.prereqs ?? [], badges, load: LOADS[`S${String(n).padStart(2, '0')}.d`] },
  ],
});
const I = (n) => `gr.S${String(n).padStart(2, '0')}.i`;
const D = (n) => `gr.S${String(n).padStart(2, '0')}.d`;

export const ROUTES = {
  derivation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 25, 24, 21, 22, 26, 30, 31, 28, 27, 29, 32, 33, 34, 35, 36, 37],
  intuition: [1, 2, 3, 4, 5, 6, 8, 7, 9, 12, 10, 11, 13, 20, 23, 25, 24, 21, 22, 26, 27, 30, 31, 14, 15, 16, 17, 18, 19, 28, 29, 32, 33, 34, 35, 36, 37],
  fastTrack: [9, 12, 20, 23, 21, 22, 24],
};

export default {
  id: 'gr', track: 'gr', code: 'The Road', title: 'The Road to Einstein’s Field Equations',
  provenance: 'usu-course', evidence: 'B', credits: 3,
  catalog: 'Steps 1–31 correspond to USU’s elective PHYS 5910/6910 Relativity I (“foundations of spacetime physics” through curved spacetime, the Einstein equations and exact solutions; prerequisites PHYS 3710 and PHYS 4600). Steps 32–37 go beyond USU’s catalog.',
  source: { label: 'USU catalog 2024–25: PHYS 6910 Relativity I', url: 'https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330749' },
  note: 'Intuition Mode builds the physics without advanced mathematics; Derivation Mode works the real mathematics step by step and is gated by the Mathematics of Spacetime tracks. Conventions: Carroll’s, signature (−,+,+,+). Every lesson is badged Established, Mathematically allowed, Speculative or Teaching model.',
  summary: 'From Newton’s gravity to the field equations, black holes, gravitational waves and cosmology — in two modes — ending honestly at wormholes, warp drives and the open questions.',
  prereqs: ['phys3710'],
  boss: { title: 'Einstein’s Field Equations Challenge', blurb: 'Read a metric, find its geodesics and curvature, and predict what an observer measures.' },
  modules: [
    S(1, 'Newtonian gravity and its limitations', ['est-obs'], { title: 'Newton’s gravity and the 43 arcseconds it cannot explain' }, { title: 'Newtonian gravity as a field theory: Poisson’s equation and instant action', prereqs: ['phys2210.M13'] }),
    S(2, 'Special relativity review', ['est-obs'], { title: 'Light clocks, time dilation and the muon', prereqs: [I(1)] }, { title: 'Lorentz transformations and invariance, reviewed', prereqs: [D(1)] }),
    S(3, 'Minkowski spacetime', ['est-obs'], { title: 'Spacetime diagrams and light cones', prereqs: [I(2)] }, { title: 'The Minkowski metric ημν and the summation convention', prereqs: [D(2)] }),
    S(4, 'Four-vectors and spacetime intervals', ['est-obs'], { title: 'The interval: what every observer agrees on', prereqs: [I(3)] }, { title: 'Four-velocity, four-momentum and invariants', prereqs: [D(3), 'st-a.A1'] }),
    S(5, 'The equivalence principle', ['est-obs'], { title: 'Falling elevators: gravity you cannot feel', prereqs: [I(4)] }, { title: 'Weak and Einstein equivalence principles, and what tests them', prereqs: [D(4)] }),
    S(6, 'Gravity as geometry', ['est-der', 'model'], { title: 'Gravity is mostly time running at different rates', prereqs: [I(5)] }, { title: 'Why gravity must be curvature: the tower argument', prereqs: [D(5)] }),
    S(7, 'Coordinate systems and transformations', ['est-der'], { title: 'Coordinates are labels, not reality', prereqs: [I(6)], concept: true, minutes: 4 }, { title: 'General coordinate transformations and the Jacobian', prereqs: [D(6), 'st-a.A4'] }),
    S(8, 'Metric tensors and line elements', ['est-der'], { title: 'The metric: a rule for measuring distances and times', prereqs: [I(6)] }, { title: 'Line elements in practice: from polar coordinates to curved spacetime', prereqs: [D(7), 'st-a.A6'] }),
    S(9, 'Proper time', ['est-obs'], { title: 'Proper time: the time your own clock keeps', prereqs: [I(8)] }, { title: 'Proper time as the integral of the line element', prereqs: [D(8)] }),
    S(10, 'Covariant derivatives', ['est-der'], { title: 'Comparing arrows at different places', prereqs: [I(12)], concept: true, minutes: 4 }, { title: 'The covariant derivative of vectors and tensors', prereqs: [D(9), 'st-a.A8'] }),
    S(11, 'Connections and Christoffel symbols', ['est-der'], { title: 'What a connection does, without the indices', prereqs: [I(10)], concept: true, minutes: 4 }, { title: 'Christoffel symbols from the metric', prereqs: [D(10), 'st-c.C13'] }),
    S(12, 'Geodesic equations', ['est-der', 'est-obs'], { title: 'Free fall is the path of maximal aging', prereqs: [I(9)] }, { title: 'The geodesic equation from the action', prereqs: [D(11), 'st-c.C14'] }),
    S(13, 'Parallel transport', ['est-der', 'est-obs'], { title: 'Carrying an arrow around a curved world', prereqs: [I(11)], concept: true, minutes: 5 }, { title: 'Parallel transport, holonomy and Gravity Probe B', prereqs: [D(12), 'st-c.C12'] }),
    S(14, 'Curvature tensors', ['est-der'], { title: 'Curvature you can feel: tides', prereqs: [I(31)] }, { title: 'The Riemann tensor', prereqs: [D(13), 'st-c.C15'] }),
    S(15, 'Ricci curvature and scalar curvature', ['est-der'], { title: 'Ricci curvature: how a ball of dust changes volume', prereqs: [I(14)], concept: true }, { title: 'Contracting Riemann: Ricci tensor and Ricci scalar', prereqs: [D(14), 'st-c.C16'] }),
    S(16, 'The stress–energy tensor', ['est-der'], { title: 'What curves spacetime: energy, momentum and pressure', prereqs: [I(15)] }, { title: 'Tμν for dust, fluids and fields', prereqs: [D(15)] }),
    S(17, 'The Einstein tensor', ['est-der'], { title: 'The part of curvature matter controls', prereqs: [I(16)], concept: true, minutes: 5 }, { title: 'Gμν and the Bianchi identity ∇μGμν = 0', prereqs: [D(16)] }),
    S(18, 'Einstein’s field equations', ['est-obs', 'open'], { title: 'Spacetime tells matter how to move; matter tells spacetime how to curve', prereqs: [I(17)] }, { title: 'Gμν + Λgμν = 8πG Tμν, symbol by symbol', prereqs: [D(17)] }),
    S(19, 'The Newtonian limit', ['est-der'], { title: 'How Einstein contains Newton', prereqs: [I(18)] }, { title: 'Recovering ∇²Φ = 4πGρ from the field equations', prereqs: [D(18)] }),
    S(20, 'The Schwarzschild metric', ['est-der', 'est-obs'], { title: 'The spacetime outside any round mass', prereqs: [I(12)] }, { title: 'Deriving and verifying the Schwarzschild solution', prereqs: [D(19)] }),
    S(21, 'Orbits around black holes', ['est-der'], { title: 'Orbits, the photon sphere and the innermost stable orbit', prereqs: [I(24)] }, { title: 'Effective potentials for massive and massless particles', prereqs: [D(24)] }),
    S(22, 'Event horizons', ['est-der'], { title: 'The event horizon: a one-way surface', prereqs: [I(21)] }, { title: 'Horizons in Eddington–Finkelstein and Kruskal coordinates', prereqs: [D(21)] }),
    S(23, 'Gravitational time dilation and redshift', ['est-obs'], { title: 'Clocks run slow low down: GPS and Pound–Rebka', prereqs: [I(20)] }, { title: 'Gravitational redshift from the metric', prereqs: [D(20)] }),
    S(24, 'Light bending and gravitational lensing', ['est-obs'], { title: 'Light bends: eclipses, lenses and Einstein rings', prereqs: [I(25)] }, { title: 'The deflection angle 4GM/(c²b) from null geodesics', prereqs: [D(25)] }),
    S(25, 'Precession of planetary orbits', ['est-obs'], { title: 'Mercury’s 43 arcseconds, explained', prereqs: [I(23)] }, { title: 'Perihelion advance from the orbit equation', prereqs: [D(23)] }),
    S(26, 'Kerr geometry and rotating black holes', ['est-der', 'math'], { title: 'Spinning black holes and frame dragging', prereqs: [I(22)] }, { title: 'The Kerr metric: horizons, ergosphere and the 42% efficiency limit', prereqs: [D(22)] }),
    S(27, 'Gravitational waves', ['est-obs'], { title: 'Ripples in spacetime and how LIGO hears them', prereqs: [I(26)] }, { title: 'Wave solutions, polarizations and the quadrupole formula', prereqs: [D(28), 'st-b.B3'] }),
    S(28, 'Linearized gravity', ['est-der'], { title: 'Weak gravity as a small ripple on flat spacetime', prereqs: [I(19)] }, { title: 'Linearized field equations in Lorenz gauge', prereqs: [D(31)] }),
    S(29, 'Einstein’s equations as a PDE system', ['est-der'], { title: 'Constraints and evolution: why simulating gravity is hard', prereqs: [I(28)] }, { title: 'Hyperbolicity, gauge and well-posedness', prereqs: [D(27), 'st-b.B12'] }),
    S(30, 'Cosmology and FLRW spacetime', ['est-obs'], { title: 'An expanding universe without a centre', prereqs: [I(27)] }, { title: 'The FLRW metric and comoving coordinates', prereqs: [D(26)] }),
    S(31, 'The Friedmann equations', ['est-obs', 'open'], { title: 'What the universe is made of decides its fate', prereqs: [I(30)] }, { title: 'Deriving the Friedmann and acceleration equations', prereqs: [D(30)] }),
    S(32, 'Numerical relativity', ['est-obs'], { title: 'Colliding black holes on a computer', prereqs: [I(29)] }, { title: 'The 3+1 split, BSSN and moving punctures', prereqs: [D(29), 'st-f.F14'] }),
    S(33, 'Energy conditions', ['est-der'], { title: 'Rules that ordinary matter obeys — and quantum fields bend', prereqs: [I(32)] }, { title: 'Null, weak, strong and dominant energy conditions', prereqs: [D(32)] }),
    S(34, 'Exotic spacetime geometries', ['math', 'spec'], { title: 'Solutions that exist on paper', prereqs: [I(33)] }, { title: 'Gödel, cosmic strings and what each solution needs', prereqs: [D(33)] }),
    S(35, 'Traversable wormhole models', ['math', 'spec'], { title: 'Wormholes: what the mathematics allows and what it demands', prereqs: [I(34)] }, { title: 'Morris–Thorne throats and the null energy condition', prereqs: [D(34)] }),
    S(36, 'The Alcubierre warp drive and its limits', ['math', 'refuted'], { title: 'Warp drives: correct mathematics, impossible requirements', prereqs: [I(35)] }, { title: 'The Alcubierre metric, its energy budget and the 2021–2024 claims', prereqs: [D(35)] }),
    S(37, 'Open questions in gravitation', ['open'], { title: 'What nobody knows yet', prereqs: [I(36)] }, { title: 'The frontier: quantum gravity, singularities, information and the Hubble tension', prereqs: [D(36)] }),
    {
      id: 'EQ', title: 'Equations, dissected', independent: true,
      lessons: [
        ['Einstein’s field equations with Λ', I(18)], ['The geodesic equation', I(12)], ['Christoffel symbols', I(11)],
        ['The Riemann tensor', I(14)], ['The Ricci tensor and scalar', I(15)], ['The Einstein tensor', I(17)],
        ['The perfect-fluid stress–energy tensor', I(16)], ['The Schwarzschild metric', I(20)], ['The Kerr metric', I(26)],
        ['The FLRW metric', I(30)], ['The Friedmann, acceleration and continuity equations', I(31)],
        ['The linearized field equations', I(28)], ['The quadrupole formula', I(27)], ['Schwarzschild effective potentials', I(21)],
      ].map(([title, pre], k) => ({ n: k + 1, title, kind: 'dissection', minutes: 6, prereqs: [pre] })),
    },
  ],
};
