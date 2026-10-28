// Degeneracy and symmetry (Griffiths & Schroeter §6.7–6.8; Sakurai §4.1).
// If Â and B̂ both commute with Ĥ but not with each other, Ĥ has degenerate
// levels: a non-degenerate eigenstate of Ĥ would have to be an eigenstate of
// both. Rotations give the (2l + 1)-fold m-degeneracy; a square box's x ↔ y
// swap gives pairs (n_x, n_y), (n_y, n_x); number theory adds "accidental"
// ones (1² + 7² = 5² + 5²). Hydrogen's l-degeneracy comes from a hidden
// symmetry, the conserved Runge–Lenz vector (SO(4)); the isotropic
// oscillator's (n + 1)(n + 2)/2 from SU(3). Breaking a symmetry splits levels:
// a rectangle splits the box's pairs, a field along z splits m, screening by
// core electrons splits sodium's 3s and 3p by 2.10 eV (the D lines, used by
// laser guide stars). Explore: 2D box levels against the aspect ratio.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { HC_EVNM } from '../phys2710/_constants.js';
import { r6, seg, label, hLevelsPic, levelPic } from './_q2.js';

const t = String.raw;
const PAIRS = [];
for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) PAIRS.push([a, b]);
const sq2 = (E) => { const out = []; for (let a = 1; a * a < E; a++) { const b = Math.round(Math.sqrt(E - a * a)); if (b >= 1 && a * a + b * b === E) out.push([a, b]); } return out; };
const triples = (E) => { const out = []; for (let a = 1; a * a < E; a++) for (let b = a; a * a + b * b < E; b++) { const r = E - a * a - b * b, z = Math.round(Math.sqrt(r)); if (z >= b && z * z === r) out.push([a, b, z]); } return out; };
const cube3 = (E) => { let c = 0; for (let a = 1; a * a < E; a++) for (let b = 1; a * a + b * b < E; b++) { const r = E - a * a - b * b, z = Math.round(Math.sqrt(r)); if (z >= 1 && z * z === r) c++; } return c; };
const NA_D2 = 589.158326;     // nm, sodium D2 in vacuum (Steck, Sodium D Line Data)

export default lesson({
  id: 'phys4710.M2.4',
  title: 'Degeneracy and symmetry',
  minutes: 16, difficulty: 3,
  intro: t`Why do levels coincide? Because of symmetry — and the mechanism is short. Suppose two observables both commute with the Hamiltonian but not with each other:

$$[\hat H, \hat A] = [\hat H, \hat B] = 0,\qquad [\hat A, \hat B] \neq 0$$

If a level of $\hat H$ held only one state, that state would have to be an eigenstate of both $\hat A$ and $\hat B$ at once — impossible for all states when they do not commute. So some levels must be **degenerate**. Rotations are the classic case: $\hat L_x$, $\hat L_y$, $\hat L_z$ all commute with a central $\hat H$ but not with each other, and every level with angular momentum $l$ is $(2l + 1)$-fold degenerate. Run it backwards, and **breaking a symmetry splits a level** — every splitting in a spectrum is a symmetry being broken. When levels coincide with no obvious reason, look for a hidden symmetry.`,
  symbols: [
    { tex: '\\hat H', text: 'the Hamiltonian; its eigenvalues are the energy levels' },
    { tex: '\\hat A,\\ \\hat B', text: t`two conserved observables (generators of symmetries), such as $\hat L_x$ and $\hat L_z$` },
    { tex: '[\\hat H, \\hat A] = 0', text: t`$\hat A$ is conserved, and $\hat A$ maps each energy level into itself` },
    { tex: '[\\hat A, \\hat B] \\neq 0', text: 'the two symmetries do not commute, so they cannot be diagonalized together' },
  ],
  why: 'Degeneracies and their splitting are how spectroscopists read symmetry: the Zeeman effect, crystal-field splittings, hydrogen’s hidden symmetry and its breaking by the Lamb shift, and particle multiplets all follow this logic.',
  visual: {
    type: 'graph',
    title: 'A box being stretched',
    lead: t`The levels of a particle in a two-dimensional box with sides $L$ and $rL$, $E = E_0\big(n_x^2 + n_y^2/r^2\big)$, against the aspect ratio $r$. Each curve is one state $(n_x, n_y)$.`,
    tasks: [
      'At r = 1 (a square) the curves meet in pairs: (1, 2) with (2, 1), (1, 3) with (3, 1)… The square’s x ↔ y symmetry swaps them, so they must share an energy.',
      'Move away from r = 1: every pair splits. Stretching the box breaks the swap symmetry, and the degeneracy goes with it.',
      'At r = 2 the curves of (1, 4) and (2, 2) cross: both give 5E₀. No symmetry of a 1 × 2 rectangle turns one state into the other — the crossing is accidental, and r = 1.98 separates them.',
    ],
    params: {
      x: [0.6, 2.2], y: [0, 22], aspect: 'wide', xlabel: 'aspect ratio r = Ly/Lx', ylabel: 'E / E₀', xticks: 8, yticks: 4, axesAt: 'edge',
      sliders: [{ key: 'rr', label: t`Aspect ratio $r$`, min: 0.6, max: 2.2, step: 0.01, value: 1, explain: 'How much longer the box is along y than along x.' }],
      curves: PAIRS.map(([a, b]) => ({ fn: `${a * a} + ${b * b}/x^2`, color: a === b ? 'ink3' : a < b ? 'accent' : 'gold', width: a === b ? 1.6 : 2.2, ...(a === b ? { dash: [5, 4] } : {}) })),
      vlines: [{ x: 'rr', color: 'ink3' }],
      readouts: [{ label: t`$E(1,2) - E(2,1)$ in units of $E_0$`, expr: '1 + 4/rr^2 - 4 - 1/rr^2', digits: 3 }],
      legend: [{ label: 'nₓ < ny', color: 'accent' }, { label: 'nₓ > ny', color: 'gold' }, { label: 'nₓ = ny', color: 'ink3', dash: [5, 4] }],
      legendAt: 'tr',
    },
    caption: 'Exact levels of an infinite rectangular well, E₀ = π²ħ²/2mL²; states with nₓ, ny from 1 to 4.',
  },
  example: {
    prompt: t`Hydrogen’s $n = 2$ level holds four spatial states: $2s$ and three $2p$. Which degeneracies does rotational symmetry explain, which does it not, and what breaks them?`,
    visual: hLevelsPic({ nmax: 3, lmax: 2, caption: 'Hydrogen’s levels by l: every l at a given n has the same energy.' }),
    steps: [
      { label: 'Rotations', text: t`$\hat{\vec L}$ commutes with $\hat H$, and its components do not commute with each other. So each $l$ level is $(2l + 1)$-fold degenerate in $m$: the three $2p$ states ($m = -1, 0, 1$) are guaranteed to share an energy.` },
      { label: 'What rotations miss', text: t`Rotations never mix $l = 0$ with $l = 1$ — they act within each $l$. Nothing about rotations requires $2s$ and $2p$ to have the same energy, and in any central potential other than $1/r$ they do not.` },
      { label: 'Hidden symmetry', text: t`The $1/r$ potential has an extra conserved quantity: the Runge–Lenz vector, which classically points along the major axis of a Kepler ellipse and does not precess. Quantum mechanically its components commute with $\hat H$ and change $l$; together with $\hat{\vec L}$ they generate a four-dimensional rotation group, SO(4), whose multiplets have $n^2$ states. That is the “accidental” degeneracy.` },
      { label: 'Breaking it', text: t`Anything that spoils the pure $1/r$ potential splits $2s$ from $2p$: relativistic corrections partly (fine structure), and QED fully — the Lamb shift separates $2s_{1/2}$ from $2p_{1/2}$ by $1057.8$ MHz. In sodium, the inner electrons screen the nucleus and split $3s$ from $3p$ by $2.1$ eV.` },
      { label: 'Breaking rotations', text: t`A magnetic field along $z$ leaves only rotations about $z$. $\hat L_z$ alone has no non-commuting partner, so the $m$-degeneracy goes: the Zeeman effect splits each $l$ level into $2l + 1$.` },
    ],
    answer: t`Rotational symmetry explains the threefold $2p$ degeneracy; the $2s$–$2p$ degeneracy comes from the hidden SO(4) symmetry of the $1/r$ potential. Fine structure and the Lamb shift break the latter; a magnetic field breaks the former.`,
  },
  practice: [
    num({
      id: 'oscillator-deg', difficulty: 2,
      gen(r) {
        const n = r.int(2, 6);
        const ans = ((n + 1) * (n + 2)) / 2;
        return {
          prompt: t`The 3D isotropic harmonic oscillator has levels $E = (n + \tfrac32)\hbar\omega$ with $n = n_x + n_y + n_z$. Ignoring spin, how many states share the level $n = ${n}$?`,
          visual: levelPic(Array.from({ length: 7 }, (_, k) => ({ E: k + 1.5, x0: 0.6, x1: 2.4, color: k === n ? 'gold' : 'ink3', label: `n = ${k}`, dx: 8 })), { y: [0, 8.5], x: [0, 3.4], ylabel: 'E / ħω', caption: 'The oscillator’s ladder; the gold level is the one asked about.' }),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 3 * n, feedback: 'Count all ways to write n as nₓ + ny + nz with each ≥ 0, not only those with one nonzero entry.' }, { value: n + 1, feedback: 'That counts two dimensions. In 3D there is one more quantum number to distribute.' }, { value: (n + 1) ** 2, feedback: 'That is hydrogen-like counting. Count the triples (nₓ, ny, nz) summing to n.' }].filter((e) => e.value !== ans),
          hints: [t`Count the triples $(n_x, n_y, n_z)$ of non-negative integers with $n_x + n_y + n_z = ${n}$.`, t`For each $n_x = 0, \dots, ${n}$ there are $${n} - n_x + 1$ choices of $n_y$; add them up.`],
          teach: 'The isotropic oscillator’s level n holds (n + 1)(n + 2)/2 states — more than rotations explain, the sign of a hidden SU(3) symmetry.',
          explain: t`$\sum_{n_x=0}^{${n}}(${n} - n_x + 1) = ${ans}$. Rotations alone give multiplets of $2l + 1$; the level holds $l = ${n}, ${n - 2}, \dots$ together, which needs a larger symmetry (SU(3)). Nuclear shell structure starts from this degeneracy: magic numbers 2, 8, 20 are the filled oscillator shells.`,
        };
      },
    }),
    num({
      id: 'square-deg', difficulty: 2,
      gen(r) {
        const E = r.pick([25, 50, 65, 85, 125, 130]);
        const ans = sq2(E).length;
        return {
          prompt: t`A particle in a square box has levels $E = E_0(n_x^2 + n_y^2)$, $n_x, n_y = 1, 2, 3, \dots$ How many states have $E = ${E}E_0$?`,
          visual: { type: 'graph', params: { x: [0, 12], y: [0, 12], aspect: 'wide', equal: true, xlabel: 'nₓ', ylabel: 'ny', xticks: 12, yticks: 12, axesAt: 'edge', grid: false, points: Array.from({ length: 121 }, (_, k) => ({ x: (k % 11) + 1, y: Math.floor(k / 11) + 1, r: 2.5, color: 'ink3' })), curves: [{ param: [`${r6(Math.sqrt(E))}*cos(t)`, `${r6(Math.sqrt(E))}*sin(t)`], t: [0, 1.5708], color: 'accent', width: 2 }] }, caption: t`States as lattice points; the arc has radius $\sqrt{${E}}$, so a state on it has energy $${E}E_0$.` },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: ans / 2, feedback: t`$(n_x, n_y)$ and $(n_y, n_x)$ are different states when $n_x \neq n_y$.` }].filter((e) => e.value !== ans && Number.isInteger(e.value)),
          hints: [t`List the ways to write ${E} as a sum of two squares of positive integers, order mattering.`, 'Count the lattice points lying exactly on the arc.'],
          teach: 'In a square box the x ↔ y swap pairs states; extra coincidences of sums of squares give accidental degeneracies.',
          explain: t`${sq2(E).map(([a, b]) => `$(${a}, ${b})$`).join(', ')}: $${ans}$ states. ${ans > 2 ? 'Pairs related by the swap are symmetry-required; the extra pairs are accidental — number theory, not geometry.' : 'Just the pair related by the x ↔ y swap.'}`,
        };
      },
    }),
    num({
      id: 'split-pair', difficulty: 2,
      gen(r) {
        const rr = r.pick([1.02, 1.05, 1.1, 1.2]);
        const ans = 3 - 3 / (rr * rr);
        return {
          prompt: t`Stretch the square box so that $L_y = ${rr}L_x$; the levels become $E = E_0\big(n_x^2 + n_y^2/${rr}^2\big)$. By how much, in units of $E_0$, does the state $(2, 1)$ now lie above $(1, 2)$?`,
          visual: { type: 'graph', params: { x: [0.9, 1.3], y: [3, 6], aspect: 'wide', xlabel: 'aspect ratio r', ylabel: 'E / E₀', xticks: 4, yticks: 3, axesAt: 'edge', curves: [{ fn: '1 + 4/x^2', color: 'accent', width: 2.4, label: '(1, 2)', labelAt: 0.93, labelDy: -10 }, { fn: '4 + 1/x^2', color: 'gold', width: 2.4, label: '(2, 1)', labelAt: 1.25, labelDy: -10 }], vlines: [{ x: rr, color: 'ink3' }] }, caption: 'The two formerly degenerate states against the aspect ratio; the grey line marks this box.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`$(2, 1)$ has the larger $n_x$, which the stretch does not soften: it ends up higher.` }],
          hints: [t`$E(2, 1) - E(1, 2) = \big(4 + 1/r^2\big) - \big(1 + 4/r^2\big)$.`, t`$= 3 - 3/r^2$ with $r = ${rr}$.`],
          teach: 'A small symmetry-breaking distortion splits a degenerate pair by an amount proportional to the distortion.',
          explain: t`$3 - 3/${rr}^2 = ${fmt(ans, 4)}E_0$. For a small stretch $r = 1 + \epsilon$ this is about $6\epsilon E_0$: linear in the distortion, the hallmark of degenerate perturbation theory.`,
        };
      },
    }),
    mcq({
      id: 'two-s-two-p', difficulty: 2,
      prompt: t`In hydrogen, $2s$ and $2p$ have the same energy (ignoring fine structure). Which symmetry is responsible?`,
      visual: hLevelsPic({ nmax: 2, lmax: 1, caption: 'Hydrogen’s n = 1 and n = 2 levels by l.' }),
      choices: [
        t`A hidden symmetry of the $1/r$ potential, generated by the conserved Runge–Lenz vector`,
        'Rotational symmetry',
        'Parity',
        'Time-reversal symmetry',
      ],
      answer: 0,
      why: {
        1: t`Rotations keep $l$ fixed; they explain why the three $2p$ states coincide, not why $2s$ joins them.`,
        2: t`$2s$ is even and $2p$ odd: parity distinguishes them and gives no reason for equal energies.`,
        3: t`Time reversal relates $m$ to $-m$; it cannot relate $l = 0$ to $l = 1$.`,
      },
      hints: ['Which operation could turn an s state into a p state? Rotations cannot.'],
      teach: 'Degeneracies beyond those of the obvious symmetry point to a hidden symmetry — for hydrogen, the Runge–Lenz vector.',
      explain: t`The Runge–Lenz vector commutes with $\hat H$ only for an exact $1/r$ potential, and its components change $l$ by one. It is the same conserved quantity that keeps a Kepler ellipse from precessing — which is why a perturbation that makes orbits precess (GR, other planets) is the same kind that splits $2s$ from $2p$.`,
    }),
    mcq({
      id: 'zeeman-symmetry', difficulty: 2,
      prompt: t`A hydrogen atom in a $3d$ state ($l = 2$, spin ignored) is placed in a weak uniform magnetic field along $z$. Into how many levels does the $3d$ level split, and why?`,
      visual: levelPic([{ E: 2, x0: 0.3, x1: 1.3, color: 'ink2', label: '3d, no field', dx: 0, dy: -14, lx: 0.8, align: 'center' }], { y: [0, 4], x: [0, 3.4], ylabel: 'energy (schematic)', caption: 'The 3d level before the field is applied.', yticks: 0 }),
      choices: [
        t`Five: only rotations about $z$ survive, so $\hat L_z$ is conserved but has no non-commuting partner, and states of different $m$ separate`,
        t`Three: the field picks out $x$, $y$ and $z$`,
        'One: a magnetic field cannot change an atom’s energy',
        t`Two: spin up and spin down`,
      ],
      answer: 0,
      why: {
        1: t`The levels are labelled by $m = -2, \dots, 2$, which is five values; the Cartesian axes are not the label.`,
        2: t`The orbital magnetic moment couples to $\vec B$: $\Delta E = \mu_BBm$.`,
        3: 'Spin was ignored here; the orbital splitting depends on m, with 2l + 1 values.',
      },
      hints: ['Which rotations still leave the atom-plus-field unchanged?', t`With only $\hat L_z$ conserved, the remaining label is $m$; how many values does it take for $l = 2$?`],
      teach: 'Lowering the symmetry from all rotations to rotations about one axis splits a (2l + 1)-fold level into 2l + 1 levels.',
      explain: t`The field breaks full rotational symmetry down to rotations about $z$. Without $\hat L_x$ and $\hat L_y$ there is nothing to force equal energies for different $m$, and the level splits into five, equally spaced by $\mu_BB$ (the normal Zeeman effect; spin and fine structure complicate it — phys4700 M8).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sodium', difficulty: 2, transfer: true,
      prompt: t`Adaptive-optics telescopes shine a $589$ nm laser into the sodium layer 90 km up, making an artificial “guide star”. Sodium’s valence electron sees a nucleus screened by 10 inner electrons — not a $1/r$ potential — so its $3s$ and $3p$ levels are not degenerate. From the D2 line’s vacuum wavelength, $${NA_D2}$ nm, how far apart are they, in eV? ($hc = ${fmt(HC_EVNM, 9)}$ eV nm.)`,
      visual: hLevelsPic({ nmax: 3, lmax: 2, caption: 'In hydrogen, 3s, 3p and 3d coincide. In sodium they do not.' }),
      answer: HC_EVNM / NA_D2, units: 'eV', tol: { rel: 0.001 },
      errors: [{ value: NA_D2 / HC_EVNM, feedback: t`$E = hc/\lambda$, not $\lambda/hc$.` }],
      hints: [t`$\Delta E = hc/\lambda$.`],
      teach: 'Screening breaks the 1/r potential’s hidden symmetry, so l-levels at the same n separate in every atom but hydrogen.',
      explain: t`$\Delta E = ${fmt(HC_EVNM, 7)}/${NA_D2} = ${fmt(HC_EVNM / NA_D2, 5)}$ eV. A $3s$ electron penetrates the inner shells and feels more of the nuclear charge than a $3p$ electron, so it is more tightly bound. In hydrogen the same two levels differ only by fine structure, about $10^{-5}$ eV.`,
    }),
    num({
      id: 'cp-cube', difficulty: 3,
      gen(r) {
        const E = r.pick([9, 14, 27, 38, 41]);
        const ans = cube3(E);
        return {
          prompt: t`A particle in a cubical box has levels $E = E_0(n_x^2 + n_y^2 + n_z^2)$. How many states have $E = ${E}E_0$?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.3, yaw: 0.6, pitch: 0.35, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }], points: [{ at: [0.58, 0.58, 0.58], color: 'gold' }] }, caption: t`States are lattice points $(n_x, n_y, n_z)$; a level is a sphere of radius $\sqrt{E/E_0}$ through them (schematic).` },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 3, feedback: 'Count every distinct ordering of each triple, and every triple: there may be more than one way to write the sum.' }].filter((e) => e.value !== ans),
          hints: [t`Find all triples of positive integers whose squares sum to ${E}; then count their distinct orderings.`, t`A triple with all entries different has 6 orderings, with two equal 3, with all equal 1.`],
          teach: 'The cube’s permutation symmetry gives degeneracies of 1, 3 or 6; extra ones are accidental.',
          explain: t`$${ans}$ states. Permutations of $(n_x, n_y, n_z)$ — the cube’s symmetry — give the 3s and 6s; ${triples(E).length > 1 ? `here two different triples, ${triples(E).map((q) => `(${q.join(', ')})`).join(' and ')}, share the sum — an accidental degeneracy on top.` : `here there is a single triple, (${triples(E)[0].join(', ')}).`}`,
        };
      },
    }),
    mcq({
      id: 'cp-drum', difficulty: 3, transfer: true,
      prompt: t`A square drumhead has two vibration modes, $(1, 2)$ and $(2, 1)$, at the same frequency. The membrane of a spacecraft solar sail is slightly rectangular. What happens to this pair, and why?`,
      visual: { type: 'pde2-membrane', params: { shape: 'rect', aspect: 1, m: 1, n: 2, mix: [2, 1, 1], ladder: true, count: 6, controls: false, readout: false, play: false }, caption: 'A superposition of the (1, 2) and (2, 1) modes on a square membrane, with the frequency ladder below.' },
      choices: [
        'They split into two nearby frequencies: the rectangle lacks the x ↔ y symmetry that forced them to be equal',
        'They stay degenerate: rectangles and squares have the same symmetry',
        'Both frequencies rise by the same amount, staying equal',
        'One of the modes disappears',
      ],
      answer: 0,
      why: {
        1: 'A square is unchanged by swapping x and y (and by 90° turns); a rectangle is not.',
        2: t`The frequencies scale as $\sqrt{m^2/a^2 + n^2/b^2}$: changing $a$ and $b$ differently moves the two modes differently.`,
        3: 'Both modes still exist; they just no longer share a frequency.',
      },
      hints: ['The same mathematics as the box of the Explore step: what symmetry made the pair equal?', t`For a rectangle with sides $a$ and $b$, mode $(m, n)$ has $f \propto \sqrt{m^2/a^2 + n^2/b^2}$. Compare $(1, 2)$ and $(2, 1)$ when $a \neq b$.`],
      teach: 'Degeneracy is protected by symmetry; break the symmetry and the degenerate partners split — in drums as in atoms.',
      explain: t`With sides $a \neq b$ the modes have $f \propto \sqrt{1/a^2 + 4/b^2}$ and $\sqrt{4/a^2 + 1/b^2}$: different. Engineers see the split pairs in modal tests and use them to diagnose asymmetries — the same logic as reading a molecule’s symmetry from its split spectral lines.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §6.7–6.8 (hydrogen’s hidden symmetry)', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'J. J. Sakurai & J. Napolitano, Modern Quantum Mechanics, §4.1 and §4.5', url: 'https://www.cambridge.org/9781108473224' },
    { label: 'D. A. Steck, “Sodium D Line Data”', url: 'https://steck.us/alkalidata/' },
  ],
});
