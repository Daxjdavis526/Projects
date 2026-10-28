// Separation in three dimensions — when the potential splits, so does the
// wave function. A cubic box: ψ = X(x)Y(y)Z(z), E = (h²/8mL²)(nx² + ny² + nz²),
// three quantum numbers and degenerate levels. A central potential V(r):
// ψ = R(r)Θ(θ)Φ(φ); single-valuedness makes m an integer, the θ equation
// needs l ≥ |m|, the radial equation (with its centrifugal barrier) needs
// n > l and gives Eₙ = −13.6 eV/n². Worked example: e^(−r/a) solves the
// radial equation only for a = a₀, with E = −13.6 eV. Transfer: radio
// recombination lines from n ≈ 100 hydrogen in nebulae. Every number is
// computed here.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, RH, A0 } from './_constants.js';
import { RYD } from './_quanta.js';
import { seg, label, r6 } from './_schrodinger.js';
import * as S from '../../src/viz/model/mp-schrodinger.js';

const t = String.raw;

/** All (nx, ny, nz) with nx² + ny² + nz² = s. */
const triples = (s) => {
  const out = [];
  for (let a = 1; a * a < s; a++) for (let b = 1; a * a + b * b < s; b++) { const c = Math.round(Math.sqrt(s - a * a - b * b)); if (c >= 1 && a * a + b * b + c * c === s) out.push([a, b, c]); }
  return out;
};
/** The lowest levels of a cubic box, in units of h²/8mL², with their degeneracies. */
const CUBE = (() => { const out = []; for (let s = 3; s <= 30; s++) { const g = triples(s).length; if (g) out.push({ s, g }); } return out; })();

/** A slice through a cubic box state: |X(x)Y(y)|² over the square face (surface3d). */
const slice = (nx, ny, caption) => ({
  type: 'surface3d',
  params: { z: `1.6*(sin(${nx}*pi*x)*sin(${ny}*pi*y))^2`, domain: [[0, 1], [0, 1]], n: 40, yaw: 0.6, pitch: 0.55, dist: 4.2, target: [0.5, 0.5, 0.5] },
  caption,
});

/** A cube's energy ladder (in units of h²/8mL²) up to some level, with the asked one in gold. */
const cubeLadder = (ask) => {
  const lv = CUBE.filter((L) => L.s <= Math.max(ask + 3, 14));
  const top = lv[lv.length - 1].s + 1.5;
  const curves = [], points = [];
  for (const L of lv) {
    const hi = L.s === ask;
    curves.push(seg(0, L.s, 1.6, L.s, hi ? 'gold' : 'accent', hi ? 2.8 : 1.8));
    points.push(label(1.65, L.s, hi ? `${L.s}: how many states?` : `${L.s}`, hi ? 'gold' : 'ink2', 4, 0, 'left'));
  }
  return { type: 'graph', params: { x: [-0.2, 3.2], y: [0, top], aspect: 'wide', axesAt: 'edge', xlabel: '', xticks: 0, ylabel: 'energy (units of h²/8mL²)', curves, points }, caption: 'The lowest levels of a particle in a cubic box, at their energies nx² + ny² + nz² in units of h²/8mL².' };
};

/** Two attempts at Φ(φ) = e^(imφ) around a circle: m = 2 joins up, m = 1.5 does not. */
const singleValued = {
  type: 'graph',
  params: {
    x: [-3.4, 3.4], y: [-1.55, 1.55], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { polar: '1', theta: [0, 6.2832], color: 'ink4', width: 1, dash: [3, 4] },
      { param: ['-1.8 + (1 + 0.35*cos(2*t))*cos(t)', '(1 + 0.35*cos(2*t))*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.4 },
      { param: ['1.8 + (1 + 0.35*cos(1.5*t))*cos(t)', '(1 + 0.35*cos(1.5*t))*sin(t)'], t: [0, 6.2832], color: 'bad', width: 2.4 },
    ],
    points: [label(-1.8, -1.45, 'm = 2: joins itself after 2π', 'accent', 0, 0, 'center'), label(1.8, -1.45, 'm = 1.5: a jump where φ = 0 meets 2π', 'bad', 0, 0, 'center'), { x: 3.15, y: 0, r: 4, color: 'bad' }, { x: 2.15, y: 0, r: 4, color: 'bad' }],
  },
  caption: 'The real part of Φ = e^(imφ), drawn as a ripple around a circle (radius 1 + 0.35 cos mφ). Going once around, φ returns to the same place: Φ must return to the same value.',
};

/** The radial effective potential −27.2/r + 13.6·l(l+1)/r² (eV, r in a₀). */
const veff = (l, r0 = null) => ({
  type: 'graph',
  params: {
    x: [0.2, 12], y: [-30, 30], aspect: 'wide', axesAt: 'edge', xlabel: 'r (Bohr radii a₀)', ylabel: 'energy (eV)',
    curves: [
      { fn: '-27.211/x', domain: [0.2, 12], color: 'ink3', width: 1.6, dash: [5, 4], label: 'Coulomb −ke²/r', labelAt: 1.2, labelDx: 8, labelDy: 10 },
      { fn: `${r6(13.6057 * l * (l + 1))}/x^2`, domain: [0.2, 12], color: 'warn', width: 1.6, dash: [5, 4], label: `centrifugal term, l = ${l}`, labelAt: 2.6, labelDx: 8, labelDy: -8 },
      { fn: `-27.211/x + ${r6(13.6057 * l * (l + 1))}/x^2`, domain: [0.2, 12], color: 'accent', width: 2.6, label: 'effective potential', labelAt: 7, labelDx: 0, labelDy: -12 },
    ],
    hlines: [{ y: 0, color: 'ink4' }],
    ...(r0 ? { vlines: [{ x: r0, label: `r = ${r0}a₀`, color: 'gold' }] } : {}),
  },
  caption: 'The radial equation sees the Coulomb attraction plus a centrifugal barrier ∝ l(l+1)/r² that keeps electrons with angular momentum away from the nucleus. Energies in eV, distances in Bohr radii.',
});

export default lesson({
  id: 'phys2710.MP8.1',
  title: 'Separation in three dimensions',
  minutes: 15, difficulty: 3,
  intro: t`In three dimensions the Schrödinger equation is $-\frac{\hbar^2}{2m}\nabla^2\psi + V\psi = E\psi$ — a partial differential equation in three variables. When the potential splits into pieces that each depend on one coordinate, the wave function splits too: **separation of variables** turns one hard equation into three ordinary ones, each with its own quantum number. In a cubic box, $\psi = X(x)Y(y)Z(z)$. For an atom, where $V$ depends only on the distance $r$, use spherical coordinates:

$$\psi_{nlm}(r, \theta, \phi) = R_{nl}(r)\,\Theta_{lm}(\theta)\,e^{im\phi}$$

Requiring $\psi$ to be single-valued and finite makes $m$ an integer, $l \ge |m|$ and $n \ge l + 1$; for hydrogen the energy comes out as $E_n = -13.6\ \text{eV}/n^2$ — Bohr’s levels, now from a wave equation, with no orbits.`,
  symbols: [
    { tex: 'r,\\ \\theta,\\ \\phi', text: 'spherical coordinates: distance from the nucleus, angle down from the +z-axis, angle around it from the +x-axis' },
    { tex: 'R_{nl}(r)', text: 'the radial function: how ψ varies with distance; set by n and l' },
    { tex: '\\Theta_{lm}(\\theta)', text: 'the polar-angle function (an associated Legendre function of cos θ); set by l and m' },
    { tex: 'e^{im\\phi}', text: 'the azimuthal part: a phase that turns m times around the z-axis' },
    { tex: 'n', text: 'the principal quantum number 1, 2, 3 …, which fixes the energy' },
    { tex: 'l', text: 'the orbital quantum number 0 … n − 1, which fixes the angular momentum' },
    { tex: 'm', text: 'the magnetic quantum number −l … l, which fixes the angular momentum’s z-component' },
  ],
  why: 'Separation of variables is how every atom, nucleus and solid is first understood — and the same method solves the wave equations of light, sound and gravitational waves.',
  visual: {
    type: 'mp-orbitals',
    title: 'One wave function, three factors',
    lead: t`The cloud (left) is a slice through the atom. It is the product of two pictures: the angular shape $|\Theta_{lm}|^2$ (right) — how $\psi$ depends on direction — and the radial probability $P(r) = r^2R_{nl}^2$ (below) — how it depends on distance.`,
    tasks: [
      'n = 1, 2, 3 with l = 0: the angular shape stays a sphere; the radial curve gains a node each time, and the cloud a dark shell.',
      'n = 3, l = 1, then l = 2: the radial curve loses a node each time l rises, and the angular shape gains one.',
      'n = 3, l = 2: step m through −2 … 2. Only Θ changes; R does not depend on m at all.',
    ],
    params: { n: 2, l: 0, m: 0, controls: ['n', 'l', 'm'] },
  },
  example: {
    prompt: t`For $l = 0$ the radial equation of hydrogen is $-\dfrac{\hbar^2}{2m}\dfrac{1}{r^2}\dfrac{d}{dr}\!\left(r^2\dfrac{dR}{dr}\right) - \dfrac{ke^2}{r}R = ER$, where $ke^2 = e^2/4\pi\varepsilon_0$. Try $R = e^{-r/a}$. For which $a$ does it work, and what is $E$?`,
    visual: { type: 'mp-orbitals', params: { n: 1, l: 0, m: 0, panels: ['radial'], marks: ['peak'], controls: false, readout: false }, caption: 'The radial probability P(r) = r²R² of the solution, peaking at one Bohr radius.' },
    steps: [
      { label: 'Differentiate', text: t`$\dfrac{dR}{dr} = -\dfrac Ra$, so $\dfrac{1}{r^2}\dfrac{d}{dr}\!\left(-\dfrac{r^2R}{a}\right) = \dfrac{1}{r^2}\left(-\dfrac{2rR}{a} + \dfrac{r^2R}{a^2}\right) = \dfrac{R}{a^2} - \dfrac{2R}{ar}$.` },
      { label: 'Substitute', text: t`$-\dfrac{\hbar^2}{2m}\left(\dfrac{1}{a^2} - \dfrac{2}{ar}\right)R - \dfrac{ke^2}{r}R = ER$. Divide by $R$: $\;-\dfrac{\hbar^2}{2ma^2} + \left(\dfrac{\hbar^2}{ma} - ke^2\right)\dfrac1r = E$.` },
      { label: 'Match the 1/r terms', text: t`$E$ is a constant, so the coefficient of $1/r$ must vanish: $a = \dfrac{\hbar^2}{mke^2} = a_0 = 0.0529$ nm — the Bohr radius, now the scale of a wave function rather than an orbit.` },
      { label: 'The energy', text: t`What is left is $E = -\dfrac{\hbar^2}{2ma_0^2} = -\dfrac{(\hbar c)^2}{2(mc^2)a_0^2} = -\dfrac{(197.3\ \text{eV nm})^2}{2(511\,000\ \text{eV})(0.0529\ \text{nm})^2} = ${fmt(-RYD, 3)}$ eV.` },
      { label: 'Sense check', text: t`This is hydrogen’s ground state, $n = 1$, $l = 0$, $m = 0$, with exactly the measured ionisation energy. Any other $a$ leaves a $1/r$ term that no constant $E$ can balance: the equation itself picks the size of the atom.` },
    ],
    answer: t`$R = e^{-r/a}$ works only for $a = a_0 = \hbar^2/mke^2 = 0.0529$ nm, and then $E = -\hbar^2/2ma_0^2 = -13.6$ eV.`,
  },
  practice: [
    num({
      id: 'cube-energy', difficulty: 1,
      gen(r) {
        const [nx, ny, nz] = r.pick([[1, 1, 1], [2, 1, 1], [2, 2, 1], [1, 2, 3], [3, 1, 1]]), L = r.pick([1, 2]);
        const s = nx * nx + ny * ny + nz * nz, E = s * S.boxEnergy(1, L);
        return {
          prompt: t`An electron is in a cubic box ${L} nm on a side, in the state $(n_x, n_y, n_z) = (${nx}, ${ny}, ${nz})$. With $\psi = X(x)Y(y)Z(z)$, the energy is the sum of three one-dimensional box energies. What is it, in eV?`,
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: (nx + ny + nz) ** 2 * S.boxEnergy(1, L), feedback: t`Add the three energies: $E = \frac{h^2}{8mL^2}(n_x^2 + n_y^2 + n_z^2)$, not $(n_x + n_y + n_z)^2$.` }],
          hints: [t`$E = \dfrac{h^2}{8mL^2}\left(n_x^2 + n_y^2 + n_z^2\right)$, and $\dfrac{h^2}{8m_eL^2} = 0.376\ \text{eV}\times(1\ \text{nm}/L)^2$.`],
          teach: 'Separated variables add their energies: a cube’s levels are (nx² + ny² + nz²) times the 1D box’s E₁.',
          explain: t`$n_x^2 + n_y^2 + n_z^2 = ${s}$, so $E = ${s}\times${fmt(S.boxEnergy(1, L), 3)}\ \text{eV} = ${fmt(E, 3)}$ eV.`,
          visual: slice(nx, ny, t`$|X(x)Y(y)|^2$ for this state across one face of the box — ${nx} hump${nx > 1 ? 's' : ''} along x, ${ny} along y. Drag to rotate. Height in arbitrary units.`),
        };
      },
    }),
    num({
      id: 'degeneracy', difficulty: 2,
      gen(r) {
        const s = r.pick([6, 9, 11, 14, 21]), g = triples(s).length;
        return {
          prompt: t`How many different states $(n_x, n_y, n_z)$ of a particle in a cubic box share the energy $${s}\,h^2/8mL^2$?`,
          answer: g, tol: { rel: 0, abs: 0.5 },
          errors: g > 1 ? [{ value: 1, feedback: 'Different orderings of the same three numbers are different states: (1, 1, 2) has its double hump along z, (2, 1, 1) along x.' }] : [],
          hints: [t`Find the whole numbers $n_x, n_y, n_z \ge 1$ with $n_x^2 + n_y^2 + n_z^2 = ${s}$.`, t`Then count the distinct orders: three different numbers give 6, two equal give 3.`],
          teach: 'A cube’s symmetry makes levels degenerate: the same energy from different orderings of (nx, ny, nz).',
          explain: t`$${s} = ${triples(s).map((q) => q.join('² + ') + '²').filter((v, i, arr) => arr.findIndex((w) => w.split(' + ').sort().join() === v.split(' + ').sort().join()) === i)[0]}$, which can be arranged in ${g} ways — ${g}-fold degeneracy. Stretch one side of the box and the symmetry breaks, splitting the level.`,
          visual: cubeLadder(s),
        };
      },
    }),
    mcq({
      id: 'integer-m', difficulty: 2,
      prompt: t`The azimuthal part of a separated wave function is $\Phi(\phi) = e^{im\phi}$. Why must $m$ be an integer?`,
      choices: [
        t`$\phi$ and $\phi + 2\pi$ are the same direction, so $\Phi$ must repeat: $e^{im2\pi} = 1$ only for whole numbers $m$`,
        t`Because $m$ counts electrons, and electrons come in whole numbers`,
        t`Because $\Phi$ must vanish at $\phi = 0$`,
        t`It need not be: any real $m$ works, but only integers are observed`,
      ],
      answer: 0,
      why: {
        1: 'm is a property of one electron’s state — its angular momentum about z — not a count of particles.',
        2: t`$e^{im\phi}$ never vanishes; nothing requires it to. The condition is that it joins up with itself.`,
        3: 'A non-integer m gives a wave function with two different values in the same place, which is not allowed: no such state exists.',
      },
      hints: ['Going once around the z-axis brings you back to where you started. What must Φ do?'],
      teach: 'Single-valuedness around the z-axis quantizes m — the origin of space quantization.',
      explain: t`$\Phi(\phi + 2\pi) = \Phi(\phi)$ requires $e^{2\pi im} = 1$, so $m = 0, \pm1, \pm2, \ldots$ Because $L_z = m\hbar$, this is why angular momentum along any axis comes only in whole multiples of $\hbar$.`,
      visual: singleValued,
    }),
    mcq({
      id: 'central', difficulty: 2,
      prompt: t`For which potentials can the wave function always be separated as $\psi = R(r)\,\Theta(\theta)\,\Phi(\phi)$, with the same angular functions every time?`,
      choices: [
        t`Any potential that depends only on the distance $r$ — a central potential`,
        t`Only the Coulomb potential $-ke^2/r$`,
        'Any potential at all',
        t`Only for states with $l = 0$`,
      ],
      answer: 0,
      why: {
        1: t`The angular equations never see $V$: any $V(r)$ gives the same $\Theta_{lm}$ and $e^{im\phi}$ — the nuclear shell model and the 3D oscillator use them too. Only $R(r)$ and the energies depend on the shape of $V$.`,
        2: t`A potential that depends on direction (a molecule, an atom in an electric field) mixes $\theta$ and $\phi$ into the radial problem, and the separation fails.`,
        3: 'Every l separates; l = 0 is just the case with no angular dependence.',
      },
      hints: [t`In $\nabla^2$ written in spherical coordinates, the angles appear only in one bracket, divided by $r^2$. Where must $V$ live for the angular part to separate?`],
      teach: 'A central potential V(r) lets ψ = R(r)Y(θ, φ): the angular parts are universal; only R depends on V.',
      explain: t`Multiplying through by $r^2$ puts all the angular derivatives on one side and everything that depends on $r$ — including $V(r)$ — on the other. Both sides must then equal the same constant, $l(l+1)$. That is why every atom, not just hydrogen, has s, p, d and f orbitals.`,
      visual: { type: 'c3-coords', params: { system: 'spherical', point: [2.2, 55, 40], sliders: false, readouts: [] }, caption: 'Spherical coordinates: r from the origin, θ down from +z, φ around from +x. Drag to rotate.' },
    }),
    num({
      id: 'centrifugal', difficulty: 2,
      gen(r) {
        const l = r.pick([1, 2, 3]), k = r.pick([1, 2, 4]), V = (13.6057 * l * (l + 1)) / (k * k);
        return {
          prompt: t`With $\psi = R(r)Y(\theta, \phi)$, the radial equation sees an effective potential $V(r) + \dfrac{l(l+1)\hbar^2}{2mr^2}$. For an electron with $l = ${l}$, how big is the centrifugal term at $r = ${k === 1 ? '' : k}a_0$, in eV? ($\hbar^2/2m_ea_0^2 = 13.6$ eV.)`,
          answer: V, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: (13.6057 * l * l) / (k * k), feedback: t`The factor is $l(l+1) = ${l * (l + 1)}$, not $l^2$ — the same $l(l+1)$ as in $|\vec L|^2 = l(l+1)\hbar^2$.` }, ...(k > 1 ? [{ value: (13.6057 * l * (l + 1)) / k, feedback: t`The term falls as $1/r^2$: divide by $${k}^2$.` }] : [])],
          hints: [t`$\dfrac{l(l+1)\hbar^2}{2mr^2} = l(l+1)\times\dfrac{\hbar^2}{2ma_0^2}\times\left(\dfrac{a_0}{r}\right)^2$.`],
          teach: 'The centrifugal term l(l+1)ħ²/2mr² is |L|²/2mr²: angular momentum keeps the electron off the nucleus.',
          explain: t`$${l * (l + 1)}\times13.6\ \text{eV}/${k * k} = ${fmt(V, 3)}$ eV. It is the classical $L^2/2mr^2$ with $L^2 = l(l+1)\hbar^2$. Because it blows up as $1/r^2$ near the nucleus, every state with $l > 0$ has $R \to 0$ there; only s states reach the nucleus.`,
          visual: veff(l, k),
        };
      },
    }),
    order({
      id: 'steps', difficulty: 2,
      prompt: t`Put the steps of solving hydrogen by separation of variables in order.`,
      items: [
        t`Write $\psi = R(r)\,\Theta(\theta)\,\Phi(\phi)$ and substitute it into the Schrödinger equation`,
        'Divide by RΘΦ, so that each group of terms depends on one variable only',
        'Set each group equal to a separation constant, giving three ordinary differential equations',
        t`Solve for $\Phi = e^{im\phi}$; single-valuedness makes $m$ an integer`,
        t`Solve for $\Theta$; finite solutions need $l = 0, 1, 2, \ldots$ with $l \ge |m|$`,
        t`Solve the radial equation; normalisable solutions need $n \ge l + 1$ and give $E_n = -13.6\ \text{eV}/n^2$`,
      ],
      hints: ['Separation comes before solving; the angular equations come before the radial one, because the radial equation needs l.'],
      teach: 'Separate first; then each equation’s boundary condition produces one quantum number: m, then l, then n.',
      explain: t`Each condition — single-valued $\Phi$, finite $\Theta$, normalisable $R$ — turns a separation constant into a quantum number. The radial equation needs $l$ (it appears in the centrifugal term), so the angular equations are solved first.`,
      visual: veff(1),
    }),
    mcq({
      id: 'energy-depends', difficulty: 2,
      prompt: t`In the hydrogen atom (ignoring spin and the small relativistic corrections), which quantum numbers fix an electron’s energy?`,
      choices: [t`$n$ alone`, t`$n$ and $l$`, t`$n$, $l$ and $m$`, t`$l$ alone`],
      answer: 0,
      why: {
        1: t`In other atoms, yes — inner electrons screen the nucleus and $l$ matters. For hydrogen’s pure $1/r$ potential the energy depends on $n$ only.`,
        2: t`$m$ only says how the angular momentum is tilted; with no external field, no direction is special, so it cannot affect the energy.`,
        3: t`$l$ sets the shape and angular momentum; the energy is $E_n = -13.6\ \text{eV}/n^2$.`,
      },
      hints: [t`The radial equation’s solutions give $E_n = -13.6\ \text{eV}/n^2$. Does $l$ appear?`],
      teach: 'Hydrogen’s energy depends only on n: all n² combinations of l and m at one n share it.',
      explain: t`$E_n = -13.6\ \text{eV}/n^2$ for every $l < n$ and every $m$, so level $n$ holds $n^2$ states of the same energy. The $m$-degeneracy comes from rotational symmetry; the $l$-degeneracy is special to the $1/r$ potential.`,
      visual: { type: 'qm-hydrogen', params: { series: 2, n: 3, picture: 'cloud', controls: false, readout: false, hide: ['strip'] }, caption: 'Hydrogen’s energy levels to scale, with the n = 3 level’s cloud. Fine structure (parts in 10⁵) is ignored.' },
    }),
    num({
      id: 'ions', difficulty: 3,
      gen(r) {
        const [Z, name] = r.pick([[2, 'a helium ion, He⁺'], [3, 'a doubly ionised lithium ion, Li²⁺']]);
        return {
          prompt: t`For ${name} — one electron and a nucleus of charge $Ze$ with $Z = ${Z}$ — the potential is $-Zke^2/r$. Repeat the worked example’s matching with $ke^2 \to Zke^2$: what is the ground-state energy, in eV?`,
          answer: -RYD * Z * Z, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: -RYD * Z, feedback: t`Both $a$ and $E$ change: $a = a_0/Z$, and $E = -\hbar^2/2ma^2$ goes as $Z^2$.` }],
          hints: [t`Matching the $1/r$ terms now gives $a = \hbar^2/(mZke^2) = a_0/${Z}$.`, t`$E = -\dfrac{\hbar^2}{2ma^2} = -\dfrac{\hbar^2}{2ma_0^2}\,Z^2 = -13.6\ \text{eV}\times${Z * Z}$.`],
          teach: 'A charge-Z nucleus pulls the electron Z times closer and binds it Z² times harder.',
          explain: t`$a = a_0/${Z} = ${fmt((A0 * 1e9) / Z, 3)}$ nm and $E = -13.6\times${Z * Z} = ${fmt(-RYD * Z * Z, 3)}$ eV — measured: ${Z === 2 ? '54.4' : '122.5'} eV to remove the last electron.`,
          visual: { type: 'mp-orbitals', params: { n: 1, l: 0, m: 0, panels: ['radial'], marks: [], rmax: 6, controls: false, readout: false }, caption: 'Hydrogen’s 1s radial probability (Z = 1), in Bohr radii. For charge Z the whole curve shrinks by Z towards the nucleus.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]);
        return {
          prompt: t`How many different $(l, m)$ combinations — separate spatial wave functions — belong to hydrogen’s level $n = ${n}$?`,
          answer: n * n, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n, feedback: t`That counts only the values of $l$. Each $l$ comes with $2l + 1$ values of $m$.` }, { value: 2 * n * n, feedback: 'That includes the two spin states, which belong to the next lesson. Count spatial states only.' }],
          hints: [t`$l$ runs from 0 to ${n - 1}; each $l$ has $2l + 1$ values of $m$.`],
          teach: 'Level n holds n² spatial states: the sum of (2l + 1) for l = 0 … n − 1.',
          explain: t`$\sum_{l=0}^{${n - 1}}(2l+1) = ${Array.from({ length: n }, (_, l) => 2 * l + 1).join(' + ')} = ${n * n}$, all with $E_${n} = ${fmt(-RYD / (n * n), 3)}$ eV.`,
          visual: { type: 'qm-hydrogen', params: { series: 1, n, picture: 'none', controls: false, readout: false, hide: ['strip', 'lambda'] }, caption: 'Hydrogen’s levels to scale. Every state at one level shares its energy.' },
        };
      },
    }),
    mcq({
      id: 'cp-allowed', difficulty: 2,
      prompt: t`Which set of quantum numbers $(n, l, m)$ is **not** an allowed state of hydrogen?`,
      choices: [t`$(2, 2, 1)$`, t`$(3, 2, -2)$`, t`$(2, 1, 0)$`, t`$(4, 3, 3)$`],
      answer: 0,
      why: {
        1: t`Allowed: $l = 2 < n = 3$ and $|m| = 2 \le l$.`,
        2: t`Allowed: the $2p$ state with $m = 0$.`,
        3: t`Allowed: $l = 3 < 4$ and $|m| = 3 \le 3$.`,
      },
      hints: [t`Check $l \le n - 1$ and $|m| \le l$ for each.`, t`For $n = 2$, $l$ can only be 0 or 1.`],
      teach: 'The rules: l = 0 … n − 1 and m = −l … l.',
      explain: t`$(2, 2, 1)$ breaks $l \le n - 1$: the radial equation has no normalisable solution with $n = 2$ and $l = 2$.`,
      visual: { type: 'mp-orbitals', params: { n: 3, l: 2, m: -2, panels: ['cloud', 'angular'], controls: false, readout: false }, caption: 'One of the allowed states in the list, (3, 2, −2): its cloud and angular shape.' },
    }),
    num({
      id: 'cp-radio', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([92, 109, 166]), nu = RH * C * (1 / (n * n) - 1 / ((n + 1) * (n + 1)));
        return {
          prompt: t`In the glowing gas around young stars, electrons recombine with protons into very high levels and cascade down. Radio telescopes detect the jump from $n = ${n + 1}$ to $n = ${n}$ (the line H${n}α). Because hydrogen’s energy depends only on $n$, the frequency is $\nu = R_Hc\left(\dfrac{1}{${n}^2} - \dfrac{1}{${n + 1}^2}\right)$ with $R_Hc = ${tex(RH * C, 5)}$ Hz. What is it, in MHz?`,
          answer: nu / 1e6, units: 'MHz', tol: { rel: 0.002 },
          errors: [{ value: (RH * C) / (n * n) / 1e6, feedback: 'Subtract the two terms: the photon carries the difference between the levels.' }],
          hints: [t`$\dfrac{1}{${n}^2} - \dfrac{1}{${n + 1}^2} = ${tex(1 / (n * n) - 1 / ((n + 1) * (n + 1)), 5)}$.`, t`For large $n$ this is about $2/n^3$: the levels crowd together.`],
          teach: 'High-n transitions in interstellar hydrogen fall in the radio — and E depending only on n makes them easy to predict.',
          explain: t`$\nu = ${tex(RH * C, 5)}\times${tex(1 / (n * n) - 1 / ((n + 1) * (n + 1)), 5)} = ${fmt(nu / 1e6, 5)}$ MHz${n === 109 ? ', exactly where H109α is observed (5008.9 MHz)' : ''}. An atom in level ${n} has a mean radius of about $1.5n^2a_0 \approx ${fmt(1.5 * n * n * A0 * 1e6, 2)}$ μm — larger than a bacterium; it survives only in the near-vacuum of nebulae. The lines’ Doppler shifts map how the gas moves.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3], y: [n - 3.5, n + 4.5], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
              curves: Array.from({ length: 8 }, (_, i) => seg(0.4, n - 3 + i, 2, n - 3 + i, i === 3 || i === 4 ? 'gold' : 'accent', i === 3 || i === 4 ? 2.4 : 1.4)),
              arrows: [{ from: [1.2, n + 1], to: [1.2, n], color: 'bad', width: 2 }],
              points: [label(2.05, n, `n = ${n}`, 'gold', 4, 0, 'left'), label(2.05, n + 1, `n = ${n + 1}`, 'gold', 4, 0, 'left'), label(1.25, n + 0.5, `H${n}α`, 'bad', 6, 0, 'left')],
            },
            caption: 'A few of hydrogen’s levels near the one asked about, drawn evenly spaced for clarity (their true spacing shrinks as about 1/n³).',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §8.1 (the hydrogen atom)', url: 'https://openstax.org/books/university-physics-volume-3/pages/8-1-the-hydrogen-atom' },
    { label: 'OpenStax University Physics Vol. 3, §7.5 problems on the 3D box (separation of variables)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-5-the-quantum-harmonic-oscillator' },
    { label: 'NRAO Essential Radio Astronomy, §7.2: recombination lines', url: 'https://www.cv.nrao.edu/~sransom/web/Ch7.html' },
  ],
});
