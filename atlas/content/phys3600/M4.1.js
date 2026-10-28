// Laplace's equation and uniqueness (Griffiths §3.1): what ∇²V = 0 forbids
// (no interior maximum or minimum — Earnshaw's theorem, and why ion traps
// need oscillating or magnetic fields), the two uniqueness theorems as the
// physicist's licence to guess, the empty-cavity theorem, and relaxation on
// a grid seen as uniqueness in action (two starting guesses, one answer; SOR
// as the fast way there). The proofs (mean value, energy method) live in
// st-b.B5.1 and st-b.B6.2; this lesson uses them.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { KC, sf, field, relaxPic } from './_bvp.js';

const t = String.raw;

// four unit charges at (±1, ±1, 0): curvatures of V at the centre, by finite differences
const V4 = (x, y, z) => [[1, 1], [1, -1], [-1, 1], [-1, -1]].reduce((s, [a, b]) => s + 1 / Math.hypot(x - a, y - b, z), 0);
const h = 1e-3, v0 = V4(0, 0, 0);
const Vxx = (V4(h, 0, 0) - 2 * v0 + V4(-h, 0, 0)) / (h * h), Vzz = (V4(0, 0, h) - 2 * v0 + V4(0, 0, -h)) / (h * h);

export default lesson({
  id: 'phys3600.M4.1',
  title: 'Laplace’s equation and uniqueness',
  minutes: 16, difficulty: 3,
  equation: t`\nabla^2 V = 0 \quad\Longrightarrow\quad V(\vec r_0) = \frac{1}{4\pi R^2}\oint_{\text{sphere}} V\,da`,
  intro: t`Wherever there is no charge, Poisson’s equation becomes **Laplace’s equation**, and its solutions are rigid: the value at any point equals the average over every sphere centred there (proved in [the PDE course](#/lesson/st-b.B5.1)). So $V$ has **no maximum or minimum** inside a charge-free region — only on its boundary — and a charge can never sit in stable equilibrium in an electrostatic field (Earnshaw’s theorem). The second consequence is the physicist’s favourite: **uniqueness**. Specify $V$ on every boundary (or the total charge on each conductor), and only one solution exists ([proof by energy methods](#/lesson/st-b.B6.2)). So any function you can find — by a guess, a mirror trick, a series or a computer — that obeys Laplace’s equation and the boundary conditions is **the** answer. Every method in the rest of this module rests on that.`,
  symbols: [
    { tex: '\\nabla^2V', text: t`the Laplacian of the potential, $\partial_x^2V + \partial_y^2V + \partial_z^2V$, in V/m²` },
    { tex: 'V(\\vec r_0)', text: t`the potential at the centre $\vec r_0$ of a sphere lying wholly in a charge-free region, in V` },
    { tex: 'R', text: 'the radius of that sphere (any radius that keeps it charge-free), in m' },
    { tex: '\\oint_{\\text{sphere}} V\\,da', text: t`the integral of $V$ over the sphere’s surface; dividing by its area $4\pi R^2$ makes it the average` },
  ],
  why: t`Uniqueness turns guessing into a method: images, separation of variables and multipole expansions are all clever guesses certified by it. In general relativity, the constraint equations that initial data for a black-hole simulation must satisfy are elliptic in just this way, and are solved by relaxation.`,
  visual: {
    type: 'em3-relax',
    title: 'Two guesses, one answer',
    lead: t`A square box with its top wall at 100 V and the others at 0 V, solved by relaxation: every sweep replaces each grid value by the average of its four neighbours. A second run, started from a different guess, goes along in the background. Press Play and watch the log panel.`,
    tasks: [
      t`The gold dashed curve — the largest difference between the two runs — falls to zero: whatever you start from, you end at the same potential. That is the uniqueness theorem.`,
      t`Once it has settled, drag the probe: $V$ there equals the mean of its four neighbours, and it never exceeds 100 V or drops below 0 V anywhere inside.`,
      t`Restart with the SOR sweep (over-relaxation): the same answer in a small fraction of the sweeps.`,
    ],
    params: { n: 24, walls: { left: 0, right: 0, bottom: 0, top: 100 }, init: 'random', method: 'gs', compare: true, exact: true, probe: [0.5, 0.5], controls: ['init', 'method', 'top', 'left'] },
    caption: t`A 24 × 24 grid of cells. The finished grid agrees with the exact Fourier-series solution of [M4.3](#/lesson/phys3600.M4.3) to within about a tenth of a volt here (the readout gives both). The relaxation basics — Jacobi sweeps by hand and in code — are in [the PDE course](#/lesson/st-b.B5.1).`,
  },
  example: {
    prompt: t`Four equal positive charges sit at the corners of a square, $(\pm1, \pm1, 0)$ in some unit. At the centre the forces on a test charge cancel. Is a positive test charge there in stable equilibrium?`,
    visual: {
      type: 'graph',
      params: {
        x: [-0.8, 0.8], y: [2.3, 3.1], aspect: 'wide', xlabel: 'distance from the centre', ylabel: 'V (scaled)',
        curves: [
          { fn: '1/sqrt((x - 1)^2 + 1) + 1/sqrt((x + 1)^2 + 1) + 1/sqrt((x - 1)^2 + 1) + 1/sqrt((x + 1)^2 + 1)', color: 'accent', width: 2.6, label: 'along x (in the plane)', labelAt: 0.3, labelDy: 22 },
          { fn: '4/sqrt(2 + x^2)', color: 'warn', width: 2.6, label: 'along z (out of the plane)', labelAt: -0.6, labelDy: 18 },
        ],
        points: [{ x: 0, y: v0, color: 'gold', label: 'centre', labelDx: 8, labelDy: -12 }],
      },
      caption: t`The potential of the four charges along a line through the centre in the plane (blue) and perpendicular to it (orange). Units: $q/4\pi\varepsilon_0$ per unit length.`,
    },
    steps: [
      { label: 'In the plane', text: t`Move along $x$: you approach two charges and leave two. $V$ rises either way — curvature $\partial_x^2V \approx +${nice(sf(Vxx, 3))}$. In the plane, the centre is a valley: stable.` },
      { label: 'Out of the plane', text: t`Move along $z$: you leave all four charges at once, so $V$ falls — $\partial_z^2V \approx ${nice(sf(Vzz, 3))}$. That direction is a hilltop: unstable.` },
      { label: 'Laplace forces it', text: t`$\partial_x^2V + \partial_y^2V + \partial_z^2V = ${nice(sf(Vxx, 3))} + ${nice(sf(Vxx, 3))} - ${nice(sf(-Vzz, 3))} = 0$. A minimum would need all three curvatures positive — impossible when they sum to zero.` },
      { label: 'Earnshaw', text: t`No arrangement of static charges can do better: in a charge-free region, $V$ has no local minimum (or maximum). A charge in an electrostatic field always has an escape direction.` },
      { label: 'How traps cheat', text: t`A Paul trap flips a saddle-shaped potential back and forth at radio frequency, so the escape direction keeps changing; a Penning trap adds a magnetic field. Both earned Nobel prizes (1989).` },
    ],
    answer: t`No: the centre is a saddle. Laplace’s equation forbids a minimum of $V$ in empty space, so a charge can never be held stably by static fields alone (Earnshaw’s theorem).`,
  },
  practice: [
    mcq({
      id: 'interior-max', difficulty: 2,
      prompt: t`A box has its walls at 0 V and 100 V and holds a small electrode at 60 V somewhere inside; there is no other charge. What is the highest potential anywhere in the empty space of the box?`,
      visual: relaxPic({ n: 30, walls: { left: 0, right: 0, bottom: 0, top: 100 }, electrode: { x: 0.35, y: 0.25, w: 0.15, h: 0.15, V: 60 }, levels: 10, labels: false, probe: false }, 'The relaxed potential (colour, with equipotentials) around the 60 V electrode.'),
      choices: ['100 V, reached only on the top wall', 'Somewhat above 100 V, near the middle of the box', '60 V, at the electrode', 'It depends on where the electrode is'],
      answer: 0,
      why: {
        1: 'Laplace’s equation forbids an interior maximum: the largest value of V must lie on a boundary.',
        2: 'The electrode is a boundary too, but the top wall at 100 V is higher.',
        3: 'Its position changes the shape of the solution, not the range: every value lies between the lowest and highest boundary values.',
      },
      hints: ['Where can a harmonic function take its largest value?'],
      teach: 'In a charge-free region V lies between its smallest and largest boundary values: no interior maximum or minimum.',
      explain: t`By the mean-value property, an interior maximum would have to equal the average of its surroundings — impossible unless $V$ is constant. So the maximum, 100 V, is on the top wall, and the electrode at 60 V is just another boundary.`,
    }),
    multi({
      id: 'which-unique', difficulty: 3,
      prompt: t`In which situations is the potential in the region **uniquely** determined?`,
      visual: relaxPic({ n: 24, walls: { left: 20, right: 0, bottom: 0, top: 100 }, levels: 9 }, 'A region bounded by walls at set potentials (left 20 V, top 100 V, the rest 0 V).'),
      choices: [
        t`$V$ is given on the whole boundary, and $\rho$ is given inside`,
        t`The region is bounded by conductors, the total charge on each is given, and $\rho$ is given between them`,
        t`$V$ is given on only part of the boundary`,
        t`$\rho$ is given inside, but nothing about the boundary`,
        t`$\partial V/\partial n$ is given on the whole boundary (up to an added constant in $V$)`,
      ],
      answer: [0, 1, 4],
      why: {
        2: 'Leave part of the boundary free and infinitely many solutions fit — you could set any values there.',
        3: 'Without boundary conditions, adding any solution of Laplace’s equation (a uniform field, say) gives another answer.',
      },
      hints: ['The first uniqueness theorem: V on the boundary. The second: total charge on each conductor.', t`Neumann data ($\partial V/\partial n$) also fix $V$ — up to a constant, which does not change $\vec E$.`],
      teach: 'Boundary values of V, the charges on the surrounding conductors, or the normal derivative all pin down a unique field; a partial boundary does not.',
      explain: t`The first theorem: $V$ on the whole boundary plus $\rho$ inside. The second: conductors with given total charges. Neumann data fix $V$ up to a constant. The energy-method proof of all three is in [the PDE course](#/lesson/st-b.B6.2).`,
    }),
    num({
      id: 'sor-step', difficulty: 2,
      gen(r) {
        const nb = [r.int(20, 60), r.int(20, 60), r.int(40, 90), r.int(0, 30)], old = r.int(10, 50), w = r.pick([1.5, 1.8, 1.9]);
        const avg = nb.reduce((s, v) => s + v, 0) / 4, ans = old + w * (avg - old);
        return {
          prompt: t`During an SOR sweep with over-relaxation factor $\omega = ${w}$, a grid node holds ${old} V and its four neighbours (with any already updated this sweep) hold ${nb.join(', ')} V. What value does the sweep give the node?`,
          visual: relaxPic({ n: 12, walls: { left: 0, right: 0, bottom: 0, top: 100 }, sweeps: 3, levels: 0, labels: false, probe: [0.5, 0.5], readout: true, hide: ['V', 'mean', 'change'] }, 'A coarse grid three sweeps into a relaxation. Each sweep visits every free node in turn.'),
          answer: ans, units: 'V', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: avg, feedback: t`That is the plain Gauss–Seidel value, the neighbours’ average. SOR overshoots it: $V_{\text{new}} = V_{\text{old}} + \omega\,(\bar V - V_{\text{old}})$.` }],
          hints: [t`First the average: $\bar V = \tfrac14(${nb.join(' + ')})$.`, t`Then step past it: $V_{\text{new}} = ${old} + ${w}\,(\bar V - ${old})$.`],
          teach: 'Over-relaxation moves each node past its neighbours’ average by the factor ω, anticipating where the slow convergence would take it.',
          explain: t`$\bar V = ${nice(avg)}$ V, so $V_{\text{new}} = ${old} + ${w}(${nice(avg)} - ${old}) = ${nice(sf(ans, 4))}$ V. With the best $\omega$ (about $2/(1 + \pi/N)$ for an $N$-cell square) the number of sweeps grows like $N$ instead of $N^2$.`,
        };
      },
    }),
    num({
      id: 'mean-value', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 5, 8]), d = r.pick([10, 20, 30]), R = r.pick([3, 5, 8]);
        const ans = (KC * q * 1e-9) / (d / 100);
        return {
          prompt: t`A point charge of $${q}$ nC sits ${d} cm from the centre of an imaginary sphere of radius ${R} cm (the charge is outside it). What is the average of the charge’s potential over the sphere’s surface?`,
          visual: field({ x: [-d - 8, 14], y: [-12, 12], charges: [{ x: -d, y: 0, q }], gauss: { shape: 'sphere', x: 0, y: 0, r: R, move: false, resize: false }, equip: true, fieldLines: false, grid: false }, t`The charge (left), its equipotentials, and the imaginary sphere. The near side of the sphere sits at higher $V$ than the far side.`),
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (KC * q * 1e-9) / ((d - R) / 100), feedback: 'That is V at the nearest point of the sphere. The average over the whole sphere is smaller.' }, { value: 0, feedback: 'The average is not zero: every point of the sphere has positive potential.' }],
          hints: ['Inside the sphere there is no charge, so the potential there obeys Laplace’s equation.', 'By the mean-value property the average over the sphere equals V at its centre.'],
          teach: 'In a charge-free region, the average of V over any sphere is its value at the centre.',
          explain: t`The average equals $V$ at the centre: $kq/d = \dfrac{(8.988\times10^9)(${q}\times10^{-9})}{${d / 100}} \approx ${nice(sf(ans, 3))}$ V — whatever the sphere’s radius, as long as the charge stays outside it.`,
        };
      },
    }),
    mcq({
      id: 'guess', difficulty: 2,
      prompt: t`By inspired guessing you find a function that satisfies Laplace’s equation everywhere in a region and takes the right values on all of its boundary. What can you say?`,
      visual: relaxPic({ n: 24, walls: { left: 0, right: 0, bottom: 0, top: 100 }, top: 'sine', levels: 9 }, t`The top wall at $100\sin(\pi x/a)$ V: a case where a guess, $V \propto \sin(\pi x/a)\sinh(\pi y/a)$, works exactly.`),
      choices: ['It is the solution — there is no other', 'It is one of infinitely many solutions', 'It is correct only if you derived it systematically', 'It is correct only near the boundary'],
      answer: 0,
      why: {
        1: 'That would be true with part of the boundary unspecified. With all of it fixed, the solution is unique.',
        2: 'How you found it does not matter: uniqueness certifies any function that passes both tests.',
        3: 'Laplace’s equation holds throughout, so it is right everywhere inside.',
      },
      hints: ['Suppose there were two solutions. What does their difference satisfy, and what is it on the boundary?'],
      teach: 'Uniqueness is a licence to guess: pass the two tests and the guess is the answer.',
      explain: t`The difference of two solutions obeys Laplace’s equation and vanishes on the boundary; with no interior maximum or minimum it vanishes everywhere. So a guess that passes the two tests is the answer — the logic behind images ([M4.2](#/lesson/phys3600.M4.2)) and separation of variables.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-trap', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([2, 3, 5, 8]);
        return {
          prompt: t`Near the centre of an ion trap (a Paul trap, or the quadrupole mass filter of a spacecraft’s mass spectrometer), the potential in the empty space is $V = ${A}\times10^{4}\,(x^2 + y^2) + B\,z^2$ volts, with lengths in metres. Laplace’s equation fixes $B$. Find it.`,
          visual: { type: 'surface3d', params: { z: '0.5*(x^2 - 2*y^2)', domain: [[-1.5, 1.5], [-1.5, 1.5]], n: 30, levels: 10, axisLabels: ['s', 'z', 'V'] }, caption: t`The potential over a plane containing the trap’s axis: $s$ is the distance from the axis, $z$ along it. Shape only: a saddle.` },
          answer: -2 * A * 1e4, units: 'V/m^2', tol: { rel: 1e-6 },
          errors: [{ value: -A * 1e4, feedback: t`Two transverse directions each contribute $2\times${A}\times10^4$: the $z$ curvature must cancel both.` }],
          hints: [t`$\nabla^2V = \partial_x^2V + \partial_y^2V + \partial_z^2V = 2A + 2A + 2B$.`, t`Set it to zero: $B = -2A$.`],
          teach: 'Laplace’s equation makes the curvatures of V in three directions sum to zero: confine in two, and the third must push out.',
          explain: t`$2(${A}\times10^4) + 2(${A}\times10^4) + 2B = 0$ gives $B = ${-2 * A}\times10^4\ \text{V/m}^2$. A positive ion is pulled toward the axis but pushed out along it (Earnshaw). A Paul trap reverses the voltages at radio frequency, so each direction is confining half the time — and on average the ion is held.`,
        };
      },
    }),
    num({
      id: 'cp-average', difficulty: 2,
      gen(r) {
        const q1 = r.pick([3, 4]), q2 = r.pick([-2, -1, 2]), d1 = r.pick([15, 20]), d2 = r.pick([25, 30]);
        const ans = KC * 1e-9 * (q1 / (d1 / 100) + q2 / (d2 / 100));
        return {
          prompt: t`Charges of $${q1}$ nC and $${q2}$ nC sit outside an imaginary sphere, ${d1} cm and ${d2} cm from its centre respectively. What is the average potential over the sphere?`,
          visual: field({ x: [-30, 30], y: [-16, 16], charges: [{ x: -d1, y: 0, q: q1 }, { x: d2 * 0.6, y: d2 * 0.8, q: q2 }], gauss: { shape: 'sphere', x: 0, y: 0, r: 8, move: false, resize: false }, equip: true, fieldLines: false, grid: false }, 'The two charges, their equipotentials and the imaginary sphere (radius 8 cm).'),
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: KC * 1e-9 * (q1 / (d1 / 100)), feedback: 'Both charges contribute; potentials add.' }],
          hints: ['The mean-value property holds for the total potential: the sphere holds no charge.', t`Average $= V(\text{centre}) = k\left(\dfrac{q_1}{d_1} + \dfrac{q_2}{d_2}\right)$.`],
          teach: 'The mean-value property applies to any charge-free sphere, however many charges sit outside it.',
          explain: t`Average $= V(\text{centre}) = (8.988\times10^9)\left(\dfrac{${q1}\times10^{-9}}{${d1 / 100}} + \dfrac{${q2}\times10^{-9}}{${d2 / 100}}\right) \approx ${nice(sf(ans, 3))}$ V.`,
        };
      },
    }),
    mcq({
      id: 'cp-cavity', difficulty: 3,
      prompt: t`Why is the field zero inside an empty cavity in a conductor, whatever charges sit outside?`,
      visual: field({ x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 4, a: 2.4, Q: 0 }, charges: [{ x: 7.5, y: 2, q: 4 }], fieldLines: true, density: 12, equip: true }, 'A hollow conductor near a charge: field lines end on its outer surface; none enter the cavity.'),
      choices: [
        t`$V = $ constant obeys Laplace’s equation in the cavity and matches its boundary (the conductor’s potential); by uniqueness it is the only solution`,
        t`Gauss’s law: the cavity encloses no charge, so the flux and hence the field is zero`,
        t`The metal blocks electric field lines`,
        t`The field is not zero; it is only small`,
      ],
      answer: 0,
      why: {
        1: 'Zero net flux allows field lines in on one side and out on the other. Gauss alone cannot rule that out.',
        2: 'Field lines do not stop at metal by any blocking: the surface charges rearrange so their field cancels the outside one inside.',
        3: 'It is exactly zero, for any outside charges, in electrostatics.',
      },
      hints: ['What are the boundary conditions on the cavity wall?', 'Can you think of a function that satisfies both Laplace’s equation and those conditions?'],
      teach: 'Uniqueness proves the Faraday cage: a constant fits, so a constant it is.',
      explain: t`The cavity wall is part of one conductor, so it is an equipotential. A constant $V$ solves Laplace’s equation and fits that boundary; uniqueness says nothing else does. So $\vec E = -\nabla V = 0$ inside — the Faraday cage of [M3.1](#/lesson/phys3600.M3.1), proved.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §3.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'W. Paul, Electromagnetic traps for charged and neutral particles (Nobel lecture, 1989)', url: 'https://www.nobelprize.org/prizes/physics/1989/paul/lecture/' },
    { label: 'Press et al., Numerical Recipes (3rd ed.), §20.5: relaxation methods and SOR', url: 'https://numerical.recipes/book.html' },
  ],
});
