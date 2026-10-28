// Solids: the free electron gas revisited (Griffiths & Schroeter §5.3). The
// quantum-mechanical view of what phys3700.T7.3 treats thermodynamically:
// electrons in a box with periodic boundary conditions occupy a lattice of
// k-points, one per (2π)³/V, two spins each; filling them from the bottom
// makes the Fermi sphere, k_F = (3π²n)^(1/3) and E_F = ħ²k_F²/2m; the density
// of states g(E) ∝ E^(d/2 − 1) (1/√E in a wire, constant in a sheet, √E in
// bulk). Bands: a periodic potential (the Dirac comb) allows only energies
// with |cos ka + β sin ka/ka| ≤ 1, so gaps open at ka = nπ; one electron
// per atom half-fills a band (a metal), two fill it (an insulator). Explore:
// the 2D Fermi circle filling up. Worked example: silver. Metals here (Ag, Au,
// Li, Cs, Be) are not T7.3's. Transfers: the nuclear Fermi gas (neutrons at
// 0.08 fm⁻³) and a trapped ⁴⁰K gas, E_F = ħω̄(6N)^(1/3). CODATA 2022.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HB2M_EVNM2, HBARC_EVNM } from '../phys4700/_qm.js';
import { MNC2 } from '../phys2710/_constants.js';
import { HBAR, ME, QE, NA, KB, r6, seg, label } from './_q2.js';

const t = String.raw;
const METALS = {
  Ag: { name: 'silver', rho: 10490, M: 0.1078682, z: 1 },
  Au: { name: 'gold', rho: 19300, M: 0.196966570, z: 1 },
  Li: { name: 'lithium', rho: 534, M: 0.00694, z: 1 },
  Cs: { name: 'caesium', rho: 1930, M: 0.132905452, z: 1 },
  Be: { name: 'beryllium', rho: 1850, M: 0.009012183, z: 2 },
};
for (const m of Object.values(METALS)) {
  m.n = (m.z * m.rho * NA) / m.M;                                // electrons per m³
  m.kF = Math.cbrt(3 * Math.PI ** 2 * m.n);                      // m⁻¹
  m.EF = (HBAR * m.kF) ** 2 / (2 * ME) / QE;                     // eV
  m.vF = (HBAR * m.kF) / ME;                                     // m/s
}
const AG = METALS.Ag;

/** The density of states in d dimensions, shapes only (scaled to meet at E = 1). */
const dosPic = (caption, labels = ['P', 'Q', 'R']) => ({
  type: 'graph',
  params: {
    x: [0, 3], y: [0, 2.2], aspect: 'wide', xlabel: 'energy E (arbitrary units)', ylabel: 'g(E) (scaled)', xticks: 3, yticks: 0, axesAt: 'edge',
    curves: [
      { fn: '1/sqrt(x)', color: 'accent', width: 2.4, domain: [0.2, 3], label: labels[0], labelAt: 0.3, labelDx: 8 },
      { fn: '1', color: 'gold', width: 2.4, label: labels[1], labelAt: 2.7, labelDy: -12 },
      { fn: 'sqrt(x)', color: 'violet', width: 2.4, label: labels[2], labelAt: 2.7, labelDy: -12 },
    ],
  },
  caption,
});

/** The Dirac comb's band condition f(z) = cos z + β sin z / z, z = ka, with the allowed bands shaded. */
const combPic = (b, caption, { slider = false, marks = true } = {}) => {
  const B = slider ? 'beta' : String(b);
  const f = `(cos(x) + ${B}*sin(x)/x)`;
  return {
    type: 'graph',
    params: {
      x: [0.01, 10], y: [-2, r6(Math.max(3, 1 + (slider ? 6 : b)))], aspect: 'wide', xlabel: 'ka (wave number × spacing)', ylabel: 'cos ka + β sin ka / ka', xticks: 10, yticks: 4, axesAt: 'edge',
      ...(slider ? { sliders: [{ key: 'beta', label: t`Barrier strength $\beta = m\alpha a/\hbar^2$`, min: 0, max: 6, step: 0.1, value: b, explain: t`How strong each delta-function barrier $\alpha\,\delta(x - na)$ is, in units set by the lattice spacing $a$. Zero means free electrons.` }] } : {}),
      shade: [{ fn: `1.15*step(1 - abs${f})`, lower: `-1.15*step(1 - abs${f})`, from: 0.01, to: 10, color: 'good', alpha: 0.18 }],
      curves: [{ fn: f, color: 'accent', width: 2.4, samples: 2000 }],
      hlines: [{ y: 1, color: 'ink3' }, { y: -1, color: 'ink3' }],
      vlines: marks ? [{ x: r6(Math.PI), label: 'π', color: 'ink4' }, { x: r6(2 * Math.PI), label: '2π', color: 'ink4' }, { x: r6(3 * Math.PI), label: '3π', color: 'ink4' }] : [],
    },
    caption,
  };
};

/** The 2D Fermi circle: k-points of a periodic box, filled up to radius √(N/2π) in units of 2π/L. */
function fermiCircle({ N = 60, slider = false, caption, readouts = false }) {
  const pts = [], R = 7, KEY = slider ? 'Ne' : String(N);
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) {
    pts.push({ x: i, y: j, r: 2.5, color: 'ink4' });
    pts.push({ x: i, y: j, r: 4, color: 'gold', when: `step(${KEY}/(2*pi) - ${i * i + j * j})` });
  }
  return {
    type: 'graph',
    params: {
      x: [-7.6, 7.6], y: [-7.6, 7.6], aspect: 'wide', equal: true, xlabel: 'k along x (units of 2π/L)', ylabel: 'k along y (units of 2π/L)', xticks: 0, yticks: 0, axesAt: 'edge', grid: false,
      ...(slider ? { sliders: [{ key: 'Ne', label: t`Electrons $N$`, min: 2, max: 300, step: 2, value: N, explain: 'How many electrons are put into the square box. Each allowed k holds two (spin up and down).' }] } : {}),
      curves: [{ param: [`sqrt(${KEY}/(2*pi))*cos(t)`, `sqrt(${KEY}/(2*pi))*sin(t)`], t: [0, 6.2832], color: 'accent', width: 2 }],
      points: pts,
      ...(readouts ? { readouts: [{ label: t`$k_F$ (units of $2\pi/L$)`, expr: `sqrt(${KEY}/(2*pi))`, digits: 3 }, { label: t`$E_F$ (units of $\hbar^2(2\pi/L)^2/2m$)`, expr: `${KEY}/(2*pi)`, digits: 3 }] } : {}),
    },
    caption,
  };
}

export default lesson({
  id: 'phys4710.M1.3',
  title: 'Solids: the free electron gas revisited',
  minutes: 18, difficulty: 3,
  intro: t`Treat a metal’s valence electrons as free particles in a box of volume $V$. With periodic boundary conditions the allowed wave vectors form a cubic lattice in **k-space**, one point per volume $(2\pi)^3/V$, each holding two electrons (spin up and down). Fermions fill these states from the bottom, so the ground state is a sphere of occupied points — the **Fermi sea** — of radius $k_F$. Counting points gives $N = 2\cdot\tfrac43\pi k_F^3\cdot V/(2\pi)^3$, so

$$\begin{gathered} k_F = (3\pi^2n)^{1/3}, \qquad E_F = \frac{\hbar^2k_F^2}{2m} = \frac{\hbar^2}{2m}(3\pi^2n)^{2/3} \end{gathered}$$

with $n = N/V$. The top electrons carry several eV of kinetic energy at absolute zero — pure Pauli exclusion. Add a periodic potential and the spectrum breaks into **bands** separated by gaps, which decides metal or insulator.`,
  symbols: [
    { tex: 'n', text: t`the number density of free (conduction) electrons, in $\text{m}^{-3}$: atoms per volume times valence` },
    { tex: 'k_F', text: t`the Fermi wave number, the radius of the occupied sphere in k-space, in $\text{m}^{-1}$` },
    { tex: 'E_F', text: 'the Fermi energy: the kinetic energy of the highest occupied state at zero temperature, in eV' },
    { tex: '\\hbar', text: t`the reduced Planck constant, $${tex(HBAR, 6)}$ J s` },
    { tex: 'm', text: t`the electron’s mass (or an effective mass $m^*$ inside a crystal)` },
    { tex: '3\\pi^2', text: t`from the counting: the sphere’s volume $\tfrac43\pi k_F^3$, two spins, and one state per $(2\pi)^3/V$` },
  ],
  why: 'The Fermi sea explains why metals conduct, why their electrons barely contribute to heat capacity, what holds up white dwarfs, and — with bands — why silicon is a semiconductor and diamond an insulator.',
  visual: {
    ...fermiCircle({ N: 60, slider: true, readouts: true }),
    title: 'Filling the Fermi sea',
    lead: t`A two-dimensional box with periodic boundaries: every grey dot is an allowed wave vector $\vec k = (2\pi/L)(i, j)$, holding two electrons. Gold dots are filled. Add electrons and watch the occupied region grow.`,
    tasks: [
      t`The filled dots always form a disc: the lowest energies are the smallest $|\vec k|$, whatever the direction. Its edge is the Fermi circle.`,
      t`Quadruple $N$ from 50 to 200: $k_F$ doubles and $E_F$ quadruples. In 2D, $E_F \propto N$, so the density of states is constant; in 3D the same counting gives $E_F \propto n^{2/3}$.`,
      t`At small $N$ the disc is lumpy — the lattice of k-points shows. In a real metal $N \approx 10^{23}$ and the sphere is smooth.`,
    ],
    caption: 'A square box of side L with periodic boundary conditions, in two dimensions, at zero temperature; no interactions between electrons and no lattice potential.',
  },
  example: {
    prompt: t`Silver has density $${AG.rho}$ kg/m³, molar mass $${fmt(AG.M * 1000, 7)}$ g/mol and one conduction electron per atom. Find $n$, $k_F$, $E_F$, the Fermi speed $v_F = \hbar k_F/m_e$ and the Fermi temperature $T_F = E_F/k_B$.`,
    visual: fermiCircle({ N: 120, caption: t`A Fermi sea (a two-dimensional slice of the idea): filled k-points out to $k_F$. In silver the 3D sphere holds about $3\times10^{22}$ occupied k-points per cm³, so it is smooth.` }),
    steps: [
      { label: 'Electron density', text: t`$n = \rho N_A/M = ${AG.rho}\times${fmt(NA, 9)}/${fmt(AG.M, 7)} = ${tex(AG.n, 4)}\ \text{m}^{-3}$, one electron per atom.` },
      { label: 'Fermi wave number', text: t`$k_F = (3\pi^2n)^{1/3} = ${tex(AG.kF, 4)}\ \text{m}^{-1}$; the Fermi wavelength $2\pi/k_F = ${fmt((2 * Math.PI) / AG.kF * 1e9, 3)}$ nm is about twice the spacing of the atoms.` },
      { label: 'Fermi energy', text: t`$E_F = \hbar^2k_F^2/2m_e = ${fmt(AG.EF, 4)}$ eV — the typical kinetic energy of an atomic electron, though the gas is “cold”.` },
      { label: 'Speed and temperature', text: t`$v_F = \hbar k_F/m_e = ${tex(AG.vF, 3)}$ m/s, about 0.5% of $c$ (so non-relativistic is fine). $T_F = E_F/k_B = ${tex((AG.EF * QE) / KB, 3)}$ K: room temperature is under 1% of it, so the gas is deeply degenerate.` },
      { label: 'Check', text: t`Ashcroft and Mermin list $E_F = 5.49$ eV for silver (at a slightly different density). The free-electron model works well for the noble and alkali metals, whose single valence electron is nearly free.` },
    ],
    answer: t`$n = ${tex(AG.n, 3)}\ \text{m}^{-3}$, $k_F = ${tex(AG.kF, 3)}\ \text{m}^{-1}$, $E_F = ${fmt(AG.EF, 3)}$ eV, $v_F = ${tex(AG.vF, 3)}$ m/s, $T_F = ${tex((AG.EF * QE) / KB, 3)}$ K.`,
  },
  practice: [
    num({
      id: 'fermi-energy', difficulty: 2,
      gen(r) {
        const k = r.pick(['Au', 'Li', 'Cs', 'Be']), m = METALS[k];
        return {
          prompt: t`${m.name[0].toUpperCase() + m.name.slice(1)} has density $${m.rho}$ kg/m³ and molar mass $${fmt(m.M * 1000, 6)}$ g/mol, with ${m.z === 1 ? 'one conduction electron' : 'two conduction electrons'} per atom. What is its free-electron Fermi energy, in eV? ($\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 6)}$ eV nm².)`,
          visual: { type: 'graph', params: { x: [0, 1.4], y: [0, 1.3], aspect: 'wide', xlabel: 'E / (Fermi energy)', ylabel: 'g(E) × occupancy (scaled)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: 'sqrt(x)', color: 'ink3', width: 1.6, dash: [6, 4] }, { fn: 'sqrt(x)*step(1 - x)', color: 'accent', width: 2.4 }], shade: [{ fn: 'sqrt(x)', from: 0, to: 1, color: 'accent', alpha: 0.25 }] }, caption: 'Occupied states at zero temperature: the 3D density of states g ∝ √E filled up to the Fermi energy (energy axis unlabelled).' },
          answer: m.EF, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: (HBAR ** 2 / (2 * ME) / QE) * Math.cbrt(3 * Math.PI ** 2 * (m.n / m.z)) ** 2, feedback: 'Multiply the atom density by the valence: each beryllium atom gives two electrons.' }, { value: (HBAR ** 2 / (2 * ME) / QE) * Math.cbrt(6 * Math.PI ** 2 * m.n) ** 2, feedback: t`$k_F^3 = 3\pi^2n$, not $6\pi^2n$: the factor 2 for spin is already inside $3\pi^2$.` }].filter((e) => Math.abs(e.value - m.EF) > 0.02 * m.EF),
          hints: [t`$n = z\rho N_A/M$, then $k_F = (3\pi^2n)^{1/3}$.`, t`$n = ${tex(m.n, 4)}\ \text{m}^{-3}$, so $k_F = ${tex(m.kF, 4)}\ \text{m}^{-1}$ $= ${fmt(m.kF * 1e-9, 4)}\ \text{nm}^{-1}$; then $E_F = (\hbar^2/2m_e)k_F^2$.`],
          teach: t`$E_F = (\hbar^2/2m)(3\pi^2n)^{2/3}$: only the electron density sets it.`,
          explain: t`$n = ${tex(m.n, 4)}\ \text{m}^{-3}$, $k_F = ${fmt(m.kF * 1e-9, 4)}\ \text{nm}^{-1}$, so $E_F = ${fmt(HB2M_EVNM2, 5)}\times${fmt(m.kF * 1e-9, 4)}^2 = ${fmt(m.EF, 4)}$ eV. ${k === 'Cs' ? 'Caesium’s large, loosely bound atoms give the lowest electron density of any metal and the smallest Fermi energy.' : k === 'Be' ? 'Two electrons per small atom make beryllium’s electron gas dense and its Fermi energy high.' : 'Within a few percent of the tabulated free-electron value.'}`,
        };
      },
    }),
    num({
      id: 'fermi-speed', difficulty: 2,
      gen(r) {
        const E = r.pick([1.59, 3.24, 4.74, 7.0, 9.47, 11.7]);
        const ans = Math.sqrt((2 * E * QE) / ME);
        return {
          prompt: t`A metal has Fermi energy $${E}$ eV. How fast do its fastest electrons move at absolute zero, in m/s? ($m_e = ${tex(ME, 6)}$ kg.)`,
          visual: fermiCircle({ N: 90, caption: 'The Fermi sea, in a 2D slice. Electrons on the edge move fastest; at zero temperature none move faster.' }),
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt((E * QE) / ME), feedback: t`$E = \tfrac12mv^2$, so $v = \sqrt{2E/m}$: keep the 2.` }],
          hints: [t`$E_F = \tfrac12m_ev_F^2$.`, t`Convert: $E_F = ${E}\times${tex(QE, 7)}$ J.`],
          teach: 'Even at absolute zero, Pauli exclusion keeps electrons moving at about a million metres per second.',
          explain: t`$v_F = \sqrt{2E_F/m_e} = ${tex(ans, 3)}$ m/s, about $${fmt((ans / 299792458) * 100, 2)}$% of the speed of light. Electrons at the Fermi surface carry the current, and their speed and mean free path set a metal’s conductivity.`,
        };
      },
    }),
    mcq({
      id: 'dos-dims', difficulty: 2,
      prompt: t`Counting k-points in $d$ dimensions gives a density of states $g(E) \propto E^{d/2 - 1}$. In the picture, which curve is the density of states of a two-dimensional electron gas, such as electrons trapped at a semiconductor interface?`,
      visual: dosPic('Three densities of states, labelled P, Q and R, scaled to meet at E = 1.'),
      choices: ['Q, the constant', 'P, falling as 1/√E', 'R, rising as √E', 'None: a 2D gas has no density of states'],
      answer: 0,
      why: {
        1: t`$1/\sqrt E$ is the one-dimensional case ($d = 1$, power $-\tfrac12$): a quantum wire.`,
        2: t`$\sqrt E$ is ordinary three-dimensional bulk ($d = 3$, power $+\tfrac12$).`,
        3: t`Any system with many closely spaced levels has a density of states; in 2D it happens to be flat.`,
      },
      hints: [t`Put $d = 2$ into $E^{d/2 - 1}$.`, 'In 2D the number of states inside |k| < k grows as the area πk² ∝ E, so its derivative is constant.'],
      teach: 'The density of states is set by dimension: 1/√E in a wire, constant in a sheet, √E in bulk.',
      explain: t`$E^{2/2 - 1} = E^0$: constant. The number of states below $E$ is the area of a disc of radius $k \propto \sqrt E$, which grows linearly in $E$. That flat density of states is why quantum-well lasers have sharp, step-like absorption edges.`,
    }),
    num({
      id: 'two-deg', difficulty: 3,
      gen(r) {
        const nn = r.pick([1, 2, 3, 5]);             // ×10¹⁵ m⁻²
        const ms = 0.067, n = nn * 1e15;
        const ans = (Math.PI * HBAR ** 2 * n) / (ms * ME) / QE * 1000;      // meV
        return {
          prompt: t`At a GaAs/AlGaAs interface electrons move freely in a plane with effective mass $m^* = ${ms}\,m_e$ — the high-mobility gas of quantum Hall and transistor physics. Two spins per k-point and one k-point per $(2\pi)^2/A$ give $n = k_F^2/2\pi$, so $E_F = \pi\hbar^2n/m^*$. For $n = ${nn}\times10^{15}\ \text{m}^{-2}$, what is $E_F$, in meV?`,
          visual: fermiCircle({ N: 2 * nn * 30, caption: 'A 2D Fermi sea (illustration; dot count not to scale).' }),
          answer: ans, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: ans * ms, feedback: t`Use the effective mass $m^* = ${ms}\,m_e$, not $m_e$: the crystal makes electrons in GaAs act much lighter.` }, { value: ans / 2, feedback: t`With two spins, $n = 2\times\pi k_F^2/(2\pi)^2 = k_F^2/2\pi$, giving $E_F = \pi\hbar^2n/m^*$, not $\pi\hbar^2n/2m^*$.` }],
          hints: [t`$E_F = \dfrac{\pi\hbar^2n}{m^*}$ with $m^* = ${ms}\times${tex(ME, 5)}$ kg.`, t`$\pi\hbar^2 = ${tex(Math.PI * HBAR ** 2, 4)}\ \text{J}^2\text{s}^2$; divide by $m^*$, multiply by $n$, and convert J to meV.`],
          teach: t`In two dimensions $E_F$ is proportional to the electron density, because the density of states is constant.`,
          explain: t`$E_F = \pi\hbar^2n/m^* = ${fmt(ans, 4)}$ meV — a few hundred times smaller than in a metal, so a gate voltage can change $n$ and sweep $E_F$, which is what a transistor does. Cooled below about 1 K, $k_BT \ll E_F$ and the gas is degenerate.`,
        };
      },
    }),
    num({
      id: 'band-top', difficulty: 3,
      gen(r) {
        const a = r.pick([0.25, 0.3, 0.4, 0.5]), n = r.pick([1, 2]);
        const ans = (HB2M_EVNM2 * (n * Math.PI) ** 2) / (a * a), np = n === 1 ? '' : String(n);
        return {
          prompt: t`A 1D crystal of repulsive delta-function barriers spaced $a = ${a}$ nm apart allows energies $E = \hbar^2k^2/2m_e$ only where $|\cos ka + \beta\sin ka/ka| \le 1$. At $ka = n\pi$ the left side is exactly $\pm1$, so each band ends there. What is the energy at the top of band ${n}, in eV?`,
          visual: combPic(2, t`The band condition for $\beta = 2$: green strips are allowed values of $ka$; between them, gaps.`),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: (HB2M_EVNM2 * (n * Math.PI) ** 2) / (a * a) / (n * n), feedback: t`Band ${n} ends at $ka = ${np}\pi$, not $\pi$.` }, { value: (HB2M_EVNM2 * (2 * n * Math.PI) ** 2) / (a * a), feedback: t`$ka = n\pi$ gives $k = n\pi/a$, not $2n\pi/a$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`At the top of band ${n}, $k = ${n === 1 ? '' : n}\pi/a$.`, t`$E = (\hbar^2/2m_e)k^2$ with $\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 6)}$ eV nm².`],
          teach: 'In a lattice of spacing a the bands end at k = nπ/a, where electron waves Bragg-reflect off the lattice.',
          explain: t`$E = ${fmt(HB2M_EVNM2, 5)}\times(${np}\pi/${a})^2 = ${fmt(ans, 4)}$ eV. At $k = n\pi/a$ the wavelength $2a/n$ fits the lattice exactly, waves reflected from successive barriers add up (Bragg reflection), and a gap opens just above — the free-electron energy here is the band top, independent of the barrier strength.`,
        };
      },
    }),
    mcq({
      id: 'bloch-phase', difficulty: 3,
      prompt: t`In a periodic potential, $V(x + a) = V(x)$, Bloch’s theorem says every stationary state can be chosen with $\psi(x + a) = e^{iqa}\psi(x)$. What does this say about $|\psi|^2$?`,
      visual: combPic(1.5, 'The band condition for β = 1.5. Each allowed ka corresponds to a Bloch phase q through cos qa = cos ka + β sin ka/ka.'),
      choices: [
        t`$|\psi(x + a)|^2 = |\psi(x)|^2$: the probability density repeats in every cell, though $\psi$ itself picks up a phase`,
        t`$|\psi|^2$ grows by a factor $e^{qa}$ from cell to cell`,
        t`$\psi$ itself is periodic, so $q$ must be 0`,
        t`$|\psi|^2$ is the same everywhere in the crystal`,
      ],
      answer: 0,
      why: {
        1: t`The factor $e^{iqa}$ has modulus 1 for real $q$; a real growth factor would make $\psi$ blow up and could not be normalized over a large crystal — those energies are the gaps.`,
        2: t`$\psi$ is periodic only up to the phase $e^{iqa}$; $q$ ranges over $-\pi/a < q \le \pi/a$.`,
        3: t`Within a cell $|\psi|^2$ varies (it is lower at the barriers); only its pattern repeats.`,
      },
      hints: [t`Take the modulus squared of both sides of $\psi(x + a) = e^{iqa}\psi(x)$.`, t`For real $q$, $|e^{iqa}| = 1$.`],
      teach: 'Bloch’s theorem: a translation by one lattice spacing changes a stationary state only by a phase.',
      explain: t`$|e^{iqa}|^2 = 1$, so the density is periodic. Bloch’s theorem is the eigenvalue statement for the translation operator $\hat T(a)$, which commutes with $\hat H$ — lesson M2.1 builds it from momentum as the generator of translations. Energies where the band condition would need $|\cos qa| > 1$ have complex $q$: growing states, so no states at all — the gaps.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nucleus', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([0.075, 0.08, 0.085]);        // neutrons per fm³
        const kF = Math.cbrt(3 * Math.PI ** 2 * n);    // fm⁻¹
        const hc = HBARC_EVNM;                          // eV nm = MeV fm numerically
        const ans = (hc * kF) ** 2 / (2 * MNC2);
        return {
          prompt: t`The nucleons in a heavy nucleus behave roughly as a Fermi gas. Neutrons alone fill their own Fermi sphere at a density of about $${n}\ \text{fm}^{-3}$ (1 fm $= 10^{-15}$ m), two spin states per k-point. With $\hbar c = ${fmt(hc, 8)}$ MeV fm and $m_nc^2 = ${fmt(MNC2, 8)}$ MeV, what is the neutrons’ Fermi energy, in MeV?`,
          visual: fermiCircle({ N: 150, caption: 'The neutrons’ Fermi sea (2D illustration); protons fill a separate sphere.' }),
          answer: ans, units: 'MeV', tol: { rel: 0.005 },
          errors: [{ value: (hc * Math.cbrt(1.5 * Math.PI ** 2 * n)) ** 2 / (2 * MNC2), feedback: t`Neutrons have spin ½, so two per k-point: $k_F = (3\pi^2n)^{1/3}$.` }],
          hints: [t`$k_F = (3\pi^2n)^{1/3}$ in $\text{fm}^{-1}$.`, t`$E_F = (\hbar ck_F)^2/2m_nc^2$; here $k_F = ${fmt(kF, 4)}\ \text{fm}^{-1}$.`],
          teach: 'The same Fermi-sea counting works at any scale: in a nucleus it gives tens of MeV.',
          explain: t`$k_F = ${fmt(kF, 4)}\ \text{fm}^{-1}$ and $E_F = (${fmt(hc, 5)}\times${fmt(kF, 4)})^2/(2\times${fmt(MNC2, 6)}) = ${fmt(ans, 3)}$ MeV. With a binding of about 8 MeV per nucleon on top, the well holding the nucleons is roughly 40–45 MeV deep — the starting point of the nuclear shell model.`,
        };
      },
    }),
    num({
      id: 'cp-trapped', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([1e5, 3e5, 1e6]), f = r.pick([80, 120, 200]);
        const w = 2 * Math.PI * f, ans = ((HBAR * w * Math.cbrt(6 * N)) / KB) * 1e9;      // nK
        return {
          prompt: t`In a harmonic trap the single-particle levels are $E = \hbar\bar\omega(n_x + n_y + n_z)$ (zero point dropped), and filling them with $N$ spin-polarized fermions gives $E_F = \hbar\bar\omega(6N)^{1/3}$. A $^{40}$K gas of $N = ${tex(N, 1)}$ atoms is held at a mean trap frequency $\bar\omega = 2\pi\times${f}$ Hz. What is its Fermi temperature $T_F = E_F/k_B$, in nK?`,
          visual: { type: 'graph', params: { x: [0, 1.4], y: [0, 1.3], aspect: 'wide', xlabel: 'E / (Fermi energy)', ylabel: 'g(E) (scaled)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: 'x^2', color: 'ink3', width: 1.6, dash: [6, 4] }, { fn: 'x^2*step(1 - x)', color: 'accent', width: 2.4 }], shade: [{ fn: 'x^2', from: 0, to: 1, color: 'accent', alpha: 0.25 }] }, caption: t`In a 3D harmonic trap the density of states grows as $E^2$; at zero temperature it is filled to $E_F$.` },
          answer: ans, units: 'nK', tol: { rel: 0.005 },
          errors: [{ value: ans / (2 * Math.PI), feedback: t`$\bar\omega$ is $2\pi\times${f}$ rad/s: include the $2\pi$.` }, { value: ((HBAR * w * Math.cbrt(N)) / KB) * 1e9, feedback: t`Counting states with $n_x + n_y + n_z \le n$ gives about $n^3/6$, so $N = (E_F/\hbar\bar\omega)^3/6$: keep the 6.` }],
          hints: [t`$E_F = \hbar\bar\omega(6N)^{1/3}$ with $\hbar\bar\omega = ${tex(HBAR * w, 4)}$ J.`, t`$(6N)^{1/3} = ${fmt(Math.cbrt(6 * N), 4)}$; divide $E_F$ by $k_B = ${tex(KB, 7)}$ J/K.`],
          teach: t`The Fermi energy depends on the density of states: in a harmonic trap $g \propto E^2$, so $E_F \propto N^{1/3}$.`,
          explain: t`$E_F = \hbar\bar\omega(6N)^{1/3} = ${tex((HBAR * w * Math.cbrt(6 * N)), 4)}$ J, so $T_F = ${fmt(ans, 4)}$ nK. DeMarco and Jin reached $T \approx 0.5\,T_F$ in 1999; the gas then fills its Fermi sea as electrons do in a metal, a billion times colder.`,
        };
      },
    }),
    mcq({
      id: 'cp-insulator', difficulty: 3,
      prompt: t`In a 1D crystal each band holds exactly two electrons per atom (one $q$-state per atom, two spins). Atoms of element X give one valence electron each; atoms of element Y give two. Ignoring band overlap, which is a metal?`,
      visual: combPic(3, 'The band condition for β = 3: bands (green) separated by gaps.'),
      choices: [
        'X: its lowest band is half full, so electrons at the top can move into empty states at infinitesimal energy cost; Y’s band is completely full and a gap separates it from the next',
        'Y: more electrons means more conduction',
        'Both: free electrons always conduct',
        'Neither: a periodic potential stops all conduction',
      ],
      answer: 0,
      why: {
        1: 'A full band carries no net current: for every electron with q there is one with −q, and no empty state is close by in energy.',
        2: 'Electrons in a full band are not free to change state; they need the gap energy to move.',
        3: 'A perfectly periodic potential does not scatter Bloch electrons at all; scattering comes from defects and vibrations.',
      },
      hints: ['How full is the lowest band in each case?', 'To carry a current, electrons must shift into slightly different q-states; that needs empty states just above the occupied ones.'],
      teach: 'Band filling decides conduction: partly filled bands make metals, completely filled bands with a gap above make insulators.',
      explain: t`One electron per atom fills half the first band (X: a metal, like sodium); two fill it (Y: an insulator or, if the gap is small, a semiconductor). In three dimensions bands can overlap, which is why divalent magnesium still conducts — but the counting rule is the start of all of solid-state physics.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §5.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'N. W. Ashcroft & N. D. Mermin, Solid State Physics, ch. 2 (free-electron values, table 2.1)', url: 'https://www.cengage.com/' },
    { label: 'B. DeMarco & D. S. Jin, Science 285, 1703 (1999)', url: 'https://doi.org/10.1126/science.285.5434.1703' },
  ],
});
