// The finite well and tunnelling — where E < V the wave function does not
// stop but decays as e^{−κx}, κ = √(2m(V₀ − E))/ħ. A finite well holds a
// finite number of states, each below its infinite-well partner, found from
// a transcendental equation (graphically, or numerically with brentq). A
// barrier of finite thickness lets a fraction T ≈ 16(E/V₀)(1 − E/V₀)e^{−2κd}
// through. Real cases: the scanning tunnelling microscope, the Esaki tunnel
// diode, alpha decay (Gamow's factor, across 24 orders of magnitude in
// half-life), Landsat's quantum-well infrared detectors and proton fusion in
// the Sun. Every number is computed here or in model/mp-schrodinger.js.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HC, KE2, ALPHA, T0, well, graphical, coulomb, seg, label, r6 } from './_schrodinger.js';
import { disc } from './_diagrams.js';
import { MPC2 } from './_constants.js';
import * as S from '../../src/viz/model/mp-schrodinger.js';

const t = String.raw;
const HBARC = 197.3269804;                            // MeV fm (the same digits as eV nm)
const MAC2 = 3727.3794118, UC2 = 931.49410372;        // MeV: the alpha particle; the atomic mass unit
const YEAR = 365.25 * 86400;

/**
 * Gamow's model of alpha decay: an alpha particle of energy Q inside a nucleus
 * of radius R = 1.2(A_d^(1/3) + 4^(1/3)) fm tunnels through the Coulomb
 * barrier of the daughter (charge Z). Returns 2G, the hit rate f = v/2R and
 * the half-life ln 2/(f e^(−2G)).
 */
function gamow(Q, Z, Ad) {
  const md = Ad * UC2, mu = (MAC2 * md) / (MAC2 + md);
  const R = 1.2 * (Math.cbrt(Ad) + Math.cbrt(4)), b = (2 * Z * KE2) / Q, x = R / b;
  const G2 = ((2 * Math.sqrt(2 * mu * Q)) / HBARC) * b * (Math.acos(Math.sqrt(x)) - Math.sqrt(x * (1 - x)));
  const f = (Math.sqrt((2 * Q) / mu) * 2.99792458e23) / (2 * R);
  return { R, b, G2, f, T: Math.exp(-G2), half: Math.LN2 / (f * Math.exp(-G2)) };
}
// Q values (MeV, AME2020) and measured half-lives (NUBASE2020)
const NUCLIDES = [
  { name: 'uranium-238', sym: '²³⁸U', Q: 4.270, Z: 90, Ad: 234, half: 4.468e9 * YEAR, said: '4.47 billion years' },
  { name: 'thorium-232', sym: '²³²Th', Q: 4.082, Z: 88, Ad: 228, half: 1.40e10 * YEAR, said: '14.0 billion years' },
  { name: 'radium-226', sym: '²²⁶Ra', Q: 4.871, Z: 86, Ad: 222, half: 1600 * YEAR, said: '1600 years' },
  { name: 'radon-222', sym: '²²²Rn', Q: 5.590, Z: 84, Ad: 218, half: 3.8235 * 86400, said: '3.82 days' },
  { name: 'polonium-212', sym: '²¹²Po', Q: 8.954, Z: 82, Ad: 208, half: 0.294e-6, said: '0.294 μs' },
];

/** A scanning tunnelling microscope's tip above a surface (schematic). */
const stm = {
  type: 'graph',
  params: {
    x: [-4.2, 4.2], y: [-0.8, 3.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [
      ...[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x) => disc(x, 0, 0.45, 'accent', 0.45)),
      ...[[0, 1.6], [-0.5, 2.4], [0.5, 2.4], [-1, 3.2], [0, 3.2], [1, 3.2]].map(([x, y]) => disc(x, y, 0.45, 'gold', 0.5)),
    ],
    arrows: [{ from: [1.25, 0.45], to: [1.25, 1.15], color: 'bad', width: 1.6 }, { from: [1.25, 1.15], to: [1.25, 0.45], color: 'bad', width: 1.6 }],
    points: [label(1.45, 0.8, 'vacuum gap d', 'bad', 0, 0, 'left'), label(-1.3, 2.4, 'metal tip', 'gold', 0, 0, 'right'), label(-3.9, -0.65, 'surface atoms', 'accent', 0, 0, 'left'), label(0.95, 0.8, 'electrons tunnel', 'ink2', 0, 0, 'right')],
  },
  caption: 'A scanning tunnelling microscope (schematic): a sharp metal tip, ending in a single atom, held a few tenths of a nanometre above a conducting surface. Electrons tunnel across the vacuum gap; the current is measured as the tip scans.',
};

/** A tunnel diode's current against voltage (schematic shape). */
const diodeIV = {
  type: 'graph',
  params: {
    x: [0, 0.5], y: [0, 1.35], aspect: 'wide', axesAt: 'edge', xlabel: 'forward voltage (V)', ylabel: 'current (relative)', yticks: 0,
    curves: [{ fn: '(x/0.065)*exp(1 - x/0.065) + 0.00001*(exp(x/0.035) - 1)', domain: [0, 0.5], color: 'accent', width: 2.4 }],
    shade: [{ fn: '1.35', from: 0.07, to: 0.24, color: 'bad', alpha: 0.1 }],
    points: [label(0.155, 1.2, 'current falls as voltage rises', 'bad', 0, 0, 'center'), label(0.065, 1, 'peak', 'ink2', 8, -10, 'left'), label(0.36, 0.95, 'ordinary diode current', 'ink2', 0, 0, 'right')],
  },
  caption: 'The current–voltage curve of a tunnel diode (schematic shape, not a measured device): a tunnelling peak at low voltage, then a region where the current falls as the voltage rises (shaded), then the ordinary diode’s rise.',
};

export default lesson({
  id: 'phys2710.MP7.3',
  title: 'The finite well and tunnelling',
  minutes: 16, difficulty: 3,
  intro: t`Real walls are not infinitely high. Where a particle’s energy $E$ is below the potential $V_0$, the Schrödinger equation reads $\psi'' = \kappa^2\psi$: the wave function does not stop, it **decays exponentially**, $\psi \propto e^{-\kappa x}$. Matching $\psi$ and its slope at each wall allows only certain energies — a finite number of them, each a little below its infinite-well partner, because the wave leaks into the walls and so has more room. Make the wall thin and the tail reaches the other side: the particle **tunnels** through a barrier it could never climb, with probability

$$T \approx 16\,\frac{E}{V_0}\left(1 - \frac{E}{V_0}\right)e^{-2\kappa d}, \qquad \kappa = \frac{\sqrt{2m(V_0 - E)}}{\hbar}$$

The exponential makes tunnelling exquisitely sensitive: it powers the scanning tunnelling microscope, flash memory and alpha decay, and it lets the Sun burn.`,
  symbols: [
    { tex: 'T', text: t`the transmission probability: the fraction of incoming particles that come out the far side (the formula holds when $e^{-2\kappa d} \ll 1$)` },
    { tex: 'E', text: 'the particle’s total energy — the same on both sides of the barrier, in eV' },
    { tex: 'V_0', text: 'the barrier’s height, or the depth of the well’s walls, in eV' },
    { tex: 'd', text: 'the barrier’s thickness, in m (or nm)' },
    { tex: '\\kappa', text: t`the decay constant of $\psi$ inside the barrier, in $\text{m}^{-1}$; $1/\kappa$ is how far $\psi$ reaches before falling by a factor $e$` },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: '\\hbar', text: t`$h/2\pi$; for an electron, $\hbar^2/2m_e = 0.0381$ eV nm²` },
  ],
  why: 'Tunnelling is how atoms are imaged one by one, how flash memory stores bits, how uranium decays and how protons fuse in the Sun despite a barrier hundreds of times their thermal energy.',
  visual: {
    type: 'mp-schrodinger',
    title: 'A well with finite walls — and a barrier',
    lead: t`Start with a finite well. Top: its levels (gold, the chosen one) beside the infinite well’s (dashed). Bottom, on separate axes: $|\psi|^2$, with the classically forbidden regions shaded. Then switch to a barrier: a wave arrives from the left, part reflects and part gets through.`,
    tasks: [
      'Lower the walls’ height V₀: the levels sink further below the dashed ones and the tails reach further into the walls. Below about 0.38 eV only one state is left — but one always remains.',
      'Switch to the barrier. With E = 0.5 eV, V₀ = 1 eV and d = 1 nm, T is 0.003. Double d to 2 nm: T falls about 1400-fold, to 2 × 10⁻⁶.',
      'Raise E above V₀: T is not 1. The barrier’s edges still reflect, except at energies where a whole number of half-wavelengths fits across it.',
    ],
    params: { mode: 'bound', well: 'finite', V0: 2, L: 1, n: 1, show: 'prob', compare: true, E: 0.5, Vb: 1, d: 1, controls: ['mode', 'V0', 'L', 'n', 'compare', 'show', 'E', 'Vb', 'd', 'tlog'] },
  },
  example: {
    prompt: t`An electron with $E = 0.50$ eV meets a barrier $V_0 = 1.00$ eV high and $d = 1.0$ nm thick. Estimate the chance it tunnels through. How does that change if the barrier is 2.0 nm thick — and what if the particle were a proton?`,
    visual: well({ mode: 'scatter', barrier: 'rect', E: 0.5, Vb: 1, d: 1, show: 'prob', hide: ['T'] }, t`The barrier (top) and $|\psi|^2$ (bottom): incident and reflected waves interfere on the left; inside, $|\psi|^2$ falls exponentially; on the right a small transmitted wave carries on. The energy is the same everywhere.`),
    steps: [
      { label: 'Decay constant', text: t`$\kappa = \dfrac{\sqrt{2m(V_0 - E)}}{\hbar} = \sqrt{\dfrac{V_0 - E}{\hbar^2/2m}} = \sqrt{\dfrac{0.50\ \text{eV}}{0.0381\ \text{eV nm}^2}} = ${fmt(S.kappa(0.5, 1), 3)}\ \text{nm}^{-1}$.` },
      { label: 'The exponent', text: t`$2\kappa d = 2(${fmt(S.kappa(0.5, 1), 3)})(1.0) = ${fmt(2 * S.kappa(0.5, 1), 3)}$, so $e^{-2\kappa d} = ${tex(Math.exp(-2 * S.kappa(0.5, 1)), 3)}$.` },
      { label: 'The prefactor', text: t`$16\,(0.5)(1 - 0.5) = 4$, so $T \approx 4\times${tex(Math.exp(-2 * S.kappa(0.5, 1)), 3)} = ${tex(S.barrierTApprox(0.5, 1, 1), 3)}$ — about 3 electrons in a thousand. (The exact result, from matching waves at both edges, is $${tex(S.barrier(0.5, 1, 1).T, 3)}$.)` },
      { label: 'Twice as thick', text: t`The exponent doubles: $T \approx 4e^{-${fmt(4 * S.kappa(0.5, 1), 3)}} = ${tex(S.barrierTApprox(0.5, 1, 2), 3)}$, about 1400 times smaller. Thickness enters the exponent; that is why tunnelling is so sensitive to it.` },
      { label: 'A proton', text: t`$\kappa$ grows as $\sqrt m$, by $\sqrt{1836} = 42.8$: $2\kappa d \approx 310$ and $T \sim 10^{${Math.round(Math.log10(S.barrierTApprox(0.5, 1, 1, MPC2 / 0.51099895069)))}}$. Tunnelling is a light particle’s game at these sizes — protons tunnel only through barriers far thinner, as in nuclei.` },
      { label: 'Sense check', text: t`The transmitted electron still has $E = 0.50$ eV. Tunnelling reduces how *many* get through, never the energy of those that do.` },
    ],
    answer: t`$T \approx ${tex(S.barrierTApprox(0.5, 1, 1), 2)}$ for 1.0 nm, $${tex(S.barrierTApprox(0.5, 1, 2), 2)}$ for 2.0 nm; for a proton, about $10^{${Math.round(Math.log10(S.barrierTApprox(0.5, 1, 1, MPC2 / 0.51099895069)))}}$.`,
  },
  practice: [
    num({
      id: 'reach', difficulty: 1,
      gen(r) {
        const dU = r.pick([0.1, 0.5, 1, 4.5]), k = Math.sqrt(dU / T0);
        return {
          prompt: t`An electron in a well has an energy ${dU} eV below the top of the well’s walls. How far into the wall does its wave function reach before falling by a factor of $e$ — that is, what is $1/\kappa$, in nm?`,
          answer: 1 / k, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: 1 / (2 * k), feedback: t`That is the decay length of $|\psi|^2 \propto e^{-2\kappa x}$. The question asks about $\psi$ itself, $\propto e^{-\kappa x}$.` }],
          hints: [t`$\kappa = \sqrt{(V_0 - E)/(\hbar^2/2m)}$ with $\hbar^2/2m_e = 0.0381$ eV nm².`],
          teach: t`In a forbidden region ψ falls as $e^{-\kappa x}$: the closer E is to the top, the further the tail reaches.`,
          explain: t`$\kappa = \sqrt{${dU}/0.0381}\ \text{nm}^{-1} = ${fmt(k, 3)}\ \text{nm}^{-1}$, so $1/\kappa = ${fmt(1 / k, 3)}$ nm. ${dU >= 4 ? 'This is the depth for an electron at a metal surface (work function about 4.5 eV): a tenth of a nanometre, which is why tunnelling across a vacuum needs gaps of atomic size.' : 'Shallow binding means a long tail.'}`,
          visual: well({ mode: 'scatter', barrier: 'step', E: 0.5, Vb: r6(0.5 + dU), show: 'psi', hide: ['T', 'axis'] }, t`A step ${dU} eV above the electron’s energy (top) and the real part of $\psi$ (bottom): it oscillates on the left and decays inside the step. Not to scale between pictures.`),
        };
      },
    }),
    num({
      id: 'count', difficulty: 2,
      gen(r) {
        const [V0, L] = r.pick([[1, 1], [2, 1], [5, 1], [10, 0.5], [3, 0.8], [0.5, 2]]);
        const z0 = S.wellZ0(V0, L), N = S.boundCount(V0, L);
        return {
          prompt: t`How many bound states does a finite well hold for an electron if the well is $V_0 = ${V0}$ eV deep and $L = ${L}$ nm wide? A well of strength $z_0 = \frac L2\sqrt{2mV_0}/\hbar$ holds one state for every $\pi/2$ in $z_0$, rounded up.`,
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: N > 1 ? [{ value: N - 1, feedback: t`Round up, not down: the first state exists however small $z_0$ is, and each further $\pi/2$ adds one.` }] : [],
          hints: [t`$z_0 = \frac L2\sqrt{\frac{V_0}{\hbar^2/2m}} = \frac{${L}}{2}\sqrt{\frac{${V0}}{0.0381}}$.`, t`Divide $z_0$ by $\pi/2 = 1.571$ and round up.`],
          teach: 'A finite well holds ⌈2z₀/π⌉ bound states — at least one, however shallow.',
          explain: t`$z_0 = ${fmt(z0, 3)}$ and $2z_0/\pi = ${fmt((2 * z0) / Math.PI, 3)}$, so the well holds ${N} bound state${N > 1 ? 's' : ''}. Each new state appears when $z_0$ passes another multiple of $\pi/2$, as in the graphical solution.`,
          visual: well({ well: 'finite', V0, L, n: 1, levels: false, panels: ['energy'], hide: ['labels', 'scale'] }, t`The well, ${V0} eV deep and ${L} nm wide, with only its ground level drawn.`),
        };
      },
    }),
    num({
      id: 'graphical', difficulty: 3,
      gen(r) {
        const [V0, L] = r.pick([[1, 1], [2, 1], [5, 1], [3, 0.8]]);
        const z0 = S.wellZ0(V0, L), lev = S.finiteLevels(V0, L)[0];
        return {
          prompt: t`For an electron in a finite well $V_0 = ${V0}$ eV deep and $L = ${L}$ nm wide ($z_0 = ${fmt(z0, 3)}$), the graphical solution shows the ground state where $\tan z = \sqrt{z_0^2 - z^2}/z$, at $z = ka = ${fmt(lev.z, 4)}$ (with $a = L/2$). What is the ground-state energy, in eV?`,
          answer: lev.E, units: 'eV', tol: { rel: 0.01 },
          errors: [
            { value: (T0 * lev.z * lev.z) / (L * L), feedback: t`$z = ka$ uses the half-width $a = L/2 = ${L / 2}$ nm, not $L$.` },
            { value: S.boxEnergy(1, L), feedback: 'That is the infinite well’s ground state. The finite well’s is lower: use the z the graph gives.' },
          ],
          hints: [t`$k = z/a$ with $a = ${L / 2}$ nm.`, t`Inside the well $V = 0$, so $E = \hbar^2k^2/2m = 0.0381\ \text{eV nm}^2\times k^2$.`],
          teach: 'Each crossing gives z = ka; the energy is then the kinetic energy ħ²k²/2m inside the well.',
          explain: t`$k = ${fmt(lev.z, 4)}/${L / 2} = ${fmt(lev.k, 4)}\ \text{nm}^{-1}$ and $E = 0.0381\times${fmt(lev.k, 4)}^2 = ${fmt(lev.E, 3)}$ eV, below the infinite well’s ${fmt(S.boxEnergy(1, L), 3)} eV: the wave leaks into the walls, so it fits in more room.`,
          visual: graphical(z0, { mark: { z: lev.z, text: `z = ${lev.z.toFixed(4)}` } }),
        };
      },
    }),
    mcq({
      id: 'energy-after', difficulty: 2,
      prompt: t`An electron of energy 0.50 eV tunnels through a barrier 1.0 eV high. What is its energy after it emerges on the far side?`,
      choices: [
        '0.50 eV — the same as before',
        'Less than 0.50 eV: it lost energy climbing into the barrier',
        'Smaller by the factor T, the transmission probability',
        t`Smaller by the factor $e^{-\kappa d}$, as the wave function inside`,
      ],
      answer: 0,
      why: {
        1: 'It never climbs: inside the barrier there is no classical motion to cost energy. A stationary state has one energy everywhere.',
        2: 'T is how many electrons get through, not how much energy each one keeps.',
        3: 'The decaying amplitude says how likely the electron is to be found there, not how much energy it has. Drawing ψ on the energy axis invites this mix-up.',
      },
      hints: ['Which of the two pictures shows energy, and does that line change from left to right?'],
      teach: 'Total energy is the same on both sides; only the probability amplitude shrinks inside the barrier.',
      explain: t`The stationary state has a single energy $E$, so a transmitted electron carries all 0.50 eV — and moves away just as fast as it came. The barrier only cuts the *number* that get through. (This is the most common misconception about tunnelling.)`,
      visual: well({ mode: 'scatter', barrier: 'rect', E: 0.5, Vb: 1, d: 1, show: 'prob', hide: ['T'] }, 'The barrier and the electron’s energy (top), and |ψ|² (bottom), drawn on separate axes.'),
    }),
    num({
      id: 'stm', difficulty: 2,
      gen(r) {
        const phi = r.pick([4.0, 4.5, 5.0]), dd = r.pick([0.05, 0.1, 0.2]), k = Math.sqrt(phi / T0), F = Math.exp(2 * k * dd);
        return {
          prompt: t`A scanning tunnelling microscope’s current is proportional to $e^{-2\kappa d}$, where $d$ is the tip–surface gap and the barrier height is about the metal’s work function, ${phi} eV. By what factor does the current grow when the tip moves ${dd} nm closer?`,
          answer: F, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(k * dd), feedback: t`The current goes as $|\psi|^2$, which falls as $e^{-2\kappa d}$ — mind the 2.` }],
          hints: [t`$\kappa = \sqrt{${phi}\ \text{eV}/0.0381\ \text{eV nm}^2}$.`, t`The ratio of currents is $e^{2\kappa\,\Delta d}$ with $\Delta d = ${dd}$ nm.`],
          teach: 'With κ ≈ 10 nm⁻¹ for a metal surface, the tunnelling current changes about tenfold for every 0.1 nm of gap.',
          explain: t`$\kappa = ${fmt(k, 3)}\ \text{nm}^{-1}$ and the factor is $e^{2(${fmt(k, 3)})(${dd})} = ${fmt(F, 3)}$. A tenfold change per tenth of a nanometre is why the microscope can feel single atoms: holding the current steady, the tip traces the surface to a hundredth of a nanometre. Binnig and Rohrer shared the 1986 Nobel Prize for it.`,
          visual: stm,
        };
      },
    }),
    num({
      id: 'alpha', difficulty: 3,
      gen(r) {
        const N = r.pick(NUCLIDES), g = gamow(N.Q, N.Z, N.Ad);
        return {
          prompt: t`In Gamow’s 1928 model of alpha decay, an alpha particle rattles inside the ${N.name} nucleus, hitting the Coulomb barrier $f = ${tex(g.f, 3)}$ times per second, and each time tunnels out with probability $T = e^{-2G}$. For its decay energy, ${N.Q} MeV, the barrier gives $2G = ${fmt(g.G2, 4)}$. What half-life does the model predict, in seconds?`,
          answer: g.half, units: 's', tol: { rel: 0.03 },
          errors: [{ value: 1 / (g.f * g.T), feedback: t`That is the mean life $1/\lambda$. The half-life is $\ln 2/\lambda$.` }],
          hints: [t`The decay rate is $\lambda = fT = f e^{-2G}$.`, t`$t_{1/2} = \ln 2/\lambda = 0.693/(f e^{-2G})$. Work with powers of ten: $e^{-${fmt(g.G2, 4)}} = 10^{-${fmt(g.G2 / Math.LN10, 4)}}$.`],
          teach: 'A decay rate is a tunnelling probability times how often the barrier is hit — and the exponent makes half-lives span dozens of powers of ten.',
          explain: t`$T = e^{-${fmt(g.G2, 4)}} = ${tex(g.T, 3)}$, so $\lambda = ${tex(g.f * g.T, 3)}\ \text{s}^{-1}$ and $t_{1/2} = ${tex(g.half, 3)}$ s. The measured half-life of ${N.sym} is ${N.said} ($${tex(N.half, 3)}$ s). The crude model lands within a factor of a few — across uranium’s billions of years and polonium-212’s microseconds, a span of $10^{24}$ produced by Q values that differ only by a factor of two. That exponential sensitivity is the Geiger–Nuttall law, and it was the first triumph of tunnelling.`,
          visual: coulomb({ Z1Z2: 2 * N.Z, R: g.R, Q: N.Q, xmax: 1.25 * g.b, caption: t`The alpha particle’s potential energy against its distance from the centre of the ${N.name} nucleus: a Coulomb barrier outside the nuclear radius $R$ and an attractive well inside (its depth here is schematic). At its energy, ${N.Q} MeV, it is classically forbidden between $R$ and $b$ (red).` }),
        };
      },
    }),
    mcq({
      id: 'tunnel-diode', difficulty: 2,
      prompt: t`Leo Esaki’s tunnel diode (1957) is a p–n junction made from extremely heavily doped semiconductor. Why does the heavy doping make it work?`,
      choices: [
        'It makes the depletion layer — the barrier between the two sides — only about 10 nm thick, thin enough for electrons to tunnel straight through',
        'It lowers the barrier to zero, so electrons simply flow over it',
        'It gives the electrons enough energy to pass over the top of the barrier',
        'It makes the electrons heavier, so they tunnel more easily',
      ],
      answer: 0,
      why: {
        1: 'The barrier is still there; it is thin, not absent. Current that falls as voltage rises (the shaded region) is a tunnelling signature.',
        2: 'Doping does not heat the electrons. Passing over the top is the ordinary diode current at higher voltage.',
        3: t`Heavier particles tunnel *worse*: $\kappa \propto \sqrt m$.`,
      },
      hints: [t`Which quantity sits in the exponent of $e^{-2\kappa d}$ and can be changed by how a device is made?`],
      teach: 'Tunnelling devices work by making barriers nanometres thin, since d sits in the exponent.',
      explain: t`Heavy doping squeezes the depletion layer to about 10 nm, and electrons tunnel across it. As the forward voltage rises, the energies on the two sides slide out of line and the tunnelling current *falls* — negative resistance, used in fast oscillators. Esaki shared the 1973 Nobel Prize; flash memory relies on tunnelling through oxide layers a few nanometres thick.`,
      visual: diodeIV,
    }),
    code({
      id: 'finite-roots', difficulty: 3,
      prompt: t`The finite well’s levels solve transcendental equations in $z = ka$ (with $a = L/2$ and $z_0 = a\sqrt{V_0/(\hbar^2/2m)}$). In forms with no infinities they read: even states $z\sin z - \sqrt{z_0^2 - z^2}\cos z = 0$, one in each interval $[j\pi, j\pi + \pi/2)$; odd states $z\cos z + \sqrt{z_0^2 - z^2}\sin z = 0$, one in each $[j\pi + \pi/2, (j+1)\pi)$; none beyond $z_0$. Finish \`finite_well_levels(V0, L)\` so it returns every bound energy, lowest first, using \`scipy.optimize.brentq\` on each interval of width $\pi/2$ from $z = 0$ up to $z_0$ (even and odd intervals alternate). Each root gives $E = (\hbar^2/2m)(z/a)^2$.`,
      starter: t`import numpy as np
from scipy.optimize import brentq

hbar2_2m = 0.0380998          # eV nm² (an electron)

def finite_well_levels(V0, L):
    a = L / 2
    z0 = a * np.sqrt(V0 / hbar2_2m)
    s = lambda z: np.sqrt(max(z0**2 - z**2, 0.0))
    even = lambda z: z * np.sin(z) - s(z) * np.cos(z)
    odd = lambda z: z * np.cos(z) + s(z) * np.sin(z)
    E = []
    # for j = 0, 1, 2 … while j*pi/2 < z0:
    #     search [j*pi/2, min((j+1)*pi/2, z0)] with even (j even) or odd (j odd)
    #     append hbar2_2m * (z / a)**2
    return E

print(finite_well_levels(5.0, 1.0))
`,
      answer: t`import numpy as np
from scipy.optimize import brentq

hbar2_2m = 0.0380998

def finite_well_levels(V0, L):
    a = L / 2
    z0 = a * np.sqrt(V0 / hbar2_2m)
    s = lambda z: np.sqrt(max(z0**2 - z**2, 0.0))
    even = lambda z: z * np.sin(z) - s(z) * np.cos(z)
    odd = lambda z: z * np.cos(z) + s(z) * np.sin(z)
    E = []
    j = 0
    while j * np.pi / 2 < z0:
        lo, hi = j * np.pi / 2 + 1e-12, min((j + 1) * np.pi / 2, z0)
        z = brentq(even if j % 2 == 0 else odd, lo, hi)
        E.append(hbar2_2m * (z / a)**2)
        j += 1
    return E

print(finite_well_levels(5.0, 1.0))`,
      tests: (() => {
        const lev = S.finiteLevels(5, 1).map((l) => l.E);
        return [
          { name: 'a 5 eV, 1 nm well holds four states', code: 'len(finite_well_levels(5.0, 1.0)) == 4' },
          { name: t`its ground state is at ${lev[0].toFixed(4)} eV`, code: `abs(finite_well_levels(5.0, 1.0)[0] - ${lev[0]}) < 1e-4` },
          { name: t`its top state is at ${lev[3].toFixed(4)} eV, still below $V_0$`, code: `abs(finite_well_levels(5.0, 1.0)[3] - ${lev[3]}) < 1e-4` },
          { name: 'a very shallow well still holds exactly one state', code: 'len(finite_well_levels(0.01, 1.0)) == 1' },
          { name: 'a very deep well approaches the infinite well (0.376 eV)', code: 'abs(finite_well_levels(1e5, 1.0)[0] - 0.37603) < 0.002' },
        ];
      })(),
      hints: [t`Loop with \`j = 0\` and \`while j * np.pi / 2 < z0:\`; the bracket is \`lo = j*np.pi/2 + 1e-12\`, \`hi = min((j+1)*np.pi/2, z0)\`.`, t`\`z = brentq(even if j % 2 == 0 else odd, lo, hi)\`, then \`E.append(hbar2_2m * (z / a)**2)\` and \`j += 1\`.`],
      teach: 'A transcendental condition becomes a list of levels by bracketing one root per interval and handing each to a root-finder.',
      explain: t`Each interval of width $\pi/2$ below $z_0$ holds exactly one root, alternately even and odd, so the loop finds every bound state. The 5 eV well’s four levels lie at ${S.finiteLevels(5, 1).map((l) => l.E.toFixed(3)).join(', ')} eV, each below the infinite well’s $n^2\times0.376$ eV.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-barrier', difficulty: 2,
      gen(r) {
        const [E, V0, d] = r.pick([[0.2, 1, 0.5], [1, 3, 0.4], [2, 5, 0.3], [0.5, 2, 0.6]]), T = S.barrierTApprox(E, V0, d);
        return {
          prompt: t`An electron with $E = ${E}$ eV meets a barrier $V_0 = ${V0}$ eV high and $d = ${d}$ nm thick. Estimate the tunnelling probability with $T \approx 16\frac{E}{V_0}\left(1 - \frac{E}{V_0}\right)e^{-2\kappa d}$.`,
          answer: T, tol: { rel: 0.02 },
          errors: [{ value: Math.exp(-2 * S.kappa(E, V0) * d), feedback: t`Keep the prefactor $16\frac{E}{V_0}(1 - \frac{E}{V_0}) = ${fmt(16 * (E / V0) * (1 - E / V0), 3)}$.` }, { value: 16 * (E / V0) * (1 - E / V0) * Math.exp(-S.kappa(E, V0) * d), feedback: t`The exponent is $-2\kappa d$: probability goes as $|\psi|^2$.` }],
          hints: [t`$\kappa = \sqrt{(V_0 - E)/0.0381\ \text{eV nm}^2}$.`, t`$2\kappa d = ${fmt(2 * S.kappa(E, V0) * d, 3)}$.`],
          teach: t`$T \approx 16(E/V_0)(1 - E/V_0)\,e^{-2\kappa d}$, with κ from the energy deficit V₀ − E.`,
          explain: t`$\kappa = ${fmt(S.kappa(E, V0), 3)}\ \text{nm}^{-1}$, $2\kappa d = ${fmt(2 * S.kappa(E, V0) * d, 3)}$, and $T \approx ${fmt(16 * (E / V0) * (1 - E / V0), 3)}\,e^{-${fmt(2 * S.kappa(E, V0) * d, 3)}} = ${tex(T, 3)}$ (the exact value is $${tex(S.barrier(E, V0, d).T, 3)}$).`,
          visual: well({ mode: 'scatter', barrier: 'rect', E, Vb: V0, d, panels: ['energy'] }, t`The barrier, ${V0} eV high and ${d} nm thick, and the electron’s energy.`),
        };
      },
    }),
    mcq({
      id: 'cp-walls', difficulty: 2,
      prompt: t`An electron sits in the ground state of a finite well. What is its wave function like inside the walls, where $V_0 > E$?`,
      choices: [
        'It decays exponentially with distance into the wall, but is not zero there',
        'It is exactly zero: the electron does not have enough energy to be there',
        'It oscillates, with a smaller amplitude than inside the well',
        'It grows with distance into the wall',
      ],
      answer: 0,
      why: {
        1: 'That is true only for infinitely high walls. For finite ones ψ leaks in — the leak that lowers the levels and makes tunnelling possible.',
        2: t`Oscillation needs $E > V$. Where $E < V$, $\psi'' = \kappa^2\psi$ has real exponentials, not sines.`,
        3: t`A growing solution is allowed by the equation but could not be normalised; only the decaying one survives.`,
      },
      hints: [t`Where $E < V$, the Schrödinger equation reads $\psi'' = \kappa^2\psi$. What solves it?`],
      teach: 'In a classically forbidden region ψ decays exponentially — small, but not zero.',
      explain: t`Inside the wall $\psi \propto e^{-\kappa|x|}$ with $\kappa = \sqrt{2m(V_0 - E)}/\hbar$. A measurement can find the electron there, with a probability that falls off over a distance $1/2\kappa$. This leaking is why the finite well’s levels lie below the infinite well’s.`,
      visual: well({ well: 'finite', V0: 2, L: 1, n: 1, panels: ['energy'], hide: ['energy'] }, 'A finite well 2 eV deep and 1 nm wide, with its levels; the ground state is gold.'),
    }),
    num({
      id: 'cp-qwip', difficulty: 3, transfer: true,
      gen(r) {
        const [V0, L] = r.pick([[0.2, 5], [0.18, 5], [0.2, 4]]), m = 0.067, lev = S.finiteLevels(V0, L, m);
        const E1 = lev[0].E, lam = HC / (V0 - E1) / 1000;
        return {
          prompt: t`Landsat 8’s Thermal Infrared Sensor sees Earth’s heat with quantum-well infrared photodetectors: thin layers of gallium arsenide between aluminium gallium arsenide, which trap conduction electrons in a finite well. Take a well $V_0 = ${V0}$ eV deep and $L = ${L}$ nm wide, with the electron’s effective mass $m^* = 0.067\,m_e$. It holds one bound state; solving the even-state condition gives $z = ka = ${fmt(lev[0].z, 4)}$ ($a = L/2$). A photon is detected when it lifts the electron from this level to the top of the well, where it escapes and is collected. What wavelength does the detector respond to, in μm?`,
          answer: lam, units: 'μm', tol: { rel: 0.01 },
          errors: [
            { value: HC / V0 / 1000, feedback: t`The electron starts at $E_1$, not at the bottom of the well: the photon needs only $V_0 - E_1$.` },
            { value: HC / (V0 - (T0 * lev[0].z ** 2) / (L * L / 4)) / 1000, feedback: t`Use the effective mass: $\hbar^2/2m^* = 0.0381/0.067$ eV nm², about 15 times the free electron’s.` },
          ],
          hints: [t`$k = z/a$, and $E_1 = \dfrac{\hbar^2k^2}{2m^*} = \dfrac{0.0381\ \text{eV nm}^2}{0.067}\,k^2$.`, t`The photon energy is $V_0 - E_1$; then $\lambda = hc/(V_0 - E_1)$ with $hc = 1.240$ eV μm.`],
          teach: 'A quantum-well detector is tuned by its depth and width: the photon must supply V₀ − E₁.',
          explain: t`$k = ${fmt(lev[0].k, 4)}\ \text{nm}^{-1}$, so $E_1 = (0.0381/0.067)(${fmt(lev[0].k, 4)})^2 = ${fmt(E1, 3)}$ eV, and the photon needs $${fmt(V0 - E1, 3)}$ eV: $\lambda = ${fmt(lam, 3)}$ μm, in the thermal infrared where Earth glows. TIRS’s two bands sit at 10.9 and 12.0 μm, set exactly this way by the wells’ depth and width. (The model takes one effective mass on both sides and ignores band non-parabolicity; real designs refine both.)`,
          visual: well({ well: 'finite', V0, L, mass: 0.067, n: 1, panels: ['energy'], hide: ['energy', 'scale'] }, t`The GaAs well, ${V0} eV deep and ${L} nm wide, and its single bound level (energy hidden).`),
        };
      },
    }),
    num({
      id: 'cp-sun', difficulty: 3, transfer: true,
      gen(r) {
        const keV = r.pick([1.3, 2.6, 5, 10]), mu = MPC2 / 2, eta = ALPHA * Math.sqrt(mu / (2 * keV / 1000)), P = Math.exp(-2 * Math.PI * eta);
        return {
          prompt: t`Two protons in the Sun’s core must get within a few femtometres of each other for the strong force to take hold, and at 2.6 fm their Coulomb barrier is about 0.55 MeV — while the core’s thermal energies are only a few keV. For a pure Coulomb barrier the tunnelling probability is about $e^{-2\pi\eta}$, with $\eta = \alpha\sqrt{\mu c^2/2E}$, where $\alpha = 1/137.0$, $\mu c^2 = ${fmt(mu, 4)}$ MeV is the pair’s reduced rest energy and $E$ their energy of relative motion. Find the probability for $E = ${keV}$ keV.`,
          answer: P, tol: { rel: 0.02 },
          errors: [{ value: Math.exp(-Math.PI * eta), feedback: t`The exponent is $2\pi\eta$, not $\pi\eta$.` }],
          hints: [t`Work in MeV: $E = ${keV / 1000}$ MeV, so $\eta = \frac{1}{137.0}\sqrt{\frac{${fmt(mu, 4)}}{2\times${keV / 1000}}}$.`, t`$\eta = ${fmt(eta, 4)}$; then $e^{-2\pi\eta}$.`],
          teach: t`Fusion in stars runs on tunnelling: the Gamow factor $e^{-2\pi\eta}$ is tiny but not zero, and grows steeply with energy.`,
          explain: t`$\eta = ${fmt(eta, 4)}$, so $e^{-2\pi\eta} = ${tex(P, 3)}$. Classically, essentially no proton pair in the Sun could ever touch; quantum mechanically a fraction of about $${tex(P, 1)}$ of close encounters at this energy tunnel through. With some $10^{56}$ protons in the core, that is enough — though the first step of the proton–proton chain is slower still, because the fusion itself needs a weak-interaction decay. Eddington proposed in 1920 that the Sun burns hydrogen into helium; in 1929 Atkinson and Houtermans used Gamow’s tunnelling to show how it could.`,
          visual: coulomb({ Z1Z2: 1, R: 2.6, Q: 0.05, unit: 'MeV', xmax: 36, ymax: 0.65, wellDepth: 0.1, names: { Q: 'E (raised, for visibility)', b: 'classical turning point', R: '2.6 fm', top: 'barrier ≈ 0.55 MeV' }, caption: 'Two protons’ potential energy against separation: a Coulomb barrier outside about 2.6 fm and the strong force’s short-range attraction inside (schematic depth). The energy line is drawn far higher than the real few keV so that it shows at all; the true turning point is hundreds of femtometres out.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §7.6–7.7 (barrier penetration and tunnelling)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-7-quantum-tunneling-of-particles-through-potential-barriers' },
    { label: 'Gamow (1928), Zur Quantentheorie des Atomkernes, Z. Phys. 51, 204', url: 'https://doi.org/10.1007/BF01343196' },
    { label: 'Binnig & Rohrer (1987), Scanning tunneling microscopy — from birth to adolescence (Nobel lecture), Rev. Mod. Phys. 59, 615', url: 'https://doi.org/10.1103/RevModPhys.59.615' },
    { label: 'Esaki (1958), New phenomenon in narrow germanium p–n junctions, Phys. Rev. 109, 603', url: 'https://doi.org/10.1103/PhysRev.109.603' },
    { label: 'Reuter et al. (2015), The Thermal Infrared Sensor (TIRS) on Landsat 8, Remote Sens. 7, 1135', url: 'https://doi.org/10.3390/rs70101135' },
  ],
});
