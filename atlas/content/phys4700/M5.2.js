// The hydrogen atom (Griffiths & Schroeter §4.2). The radial equation with
// V = −e²/4πε₀r in ρ = κr; the asymptotic forms ρ^{l+1} and e^{−ρ}; the power
// series that must terminate (else it grows as e^{2ρ}), giving ρ₀ = 2n and
// the associated Laguerre polynomials L_{n−l−1}^{2l+1}(2r/na); the
// energies Eₙ = −(μ/2ħ²)(e²/4πε₀)²/n² with the reduced mass μ, so the
// hydrogen Rydberg is R_H = R∞/(1 + mₑ/mₚ) = 10 967 758.34 m⁻¹ (CODATA 2022)
// and Lyman-α comes out at 121.568 nm (measured 121.567 nm; the rest is
// fine structure and QED). Isotope shifts (Urey's deuterium), positronium,
// muonic hydrogen; the "accidental" l-degeneracy. Code: the radial equation
// by finite differences against −13.6 eV/n². Transfer: MAVEN's D/H
// measurement at Mars from the 33 pm Lyman-α isotope shift. phys2710.MP8
// treats hydrogen at the introductory level; its examples (1s radii, e^(−r/a),
// radio recombination lines) are not repeated here. Every number is computed
// here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { RINF, MP_ME, MDC2, MEC2, MMUC2, H, C, QE } from '../phys2710/_constants.js';
import { seg, label, r6 } from './_qm.js';

const t = String.raw;
const RYD = (H * C * RINF) / QE;                 // hcR∞ in eV: 13.605 693 1…
const MD_ME = MDC2 / MEC2;                       // deuteron / electron mass ratio
const MMU_ME = MMUC2 / MEC2;                     // muon / electron mass ratio
const red = (M) => 1 / (1 + 1 / M);              // μ/mₑ for a nucleus of mass M mₑ
const RH = RINF * red(MP_ME), RD = RINF * red(MD_ME);
const E1H = -RYD * red(MP_ME);
/** A number with thin-space thousands groups, as TeX: 10 967 758.34. */
const grp = (x, d) => { const [i, f] = x.toFixed(d).split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') + (f ? '.' + f : ''); };
const lam = (R, n1, n2) => 1 / (R * (1 / (n1 * n1) - 1 / (n2 * n2)));        // vacuum wavelength, m
const LYA = lam(RH, 1, 2);

/** Energy levels by l, as columns, for hydrogen (eV). */
function levelsPic(caption) {
  const curves = [], points = [];
  for (let n = 1; n <= 4; n++) for (let l = 0; l < n; l++) curves.push(seg(l + 0.15, E1H / (n * n), l + 0.85, E1H / (n * n), ['accent', 'violet', 'gold', 'teal'][l], 2.4));
  ['s', 'p', 'd', 'f'].forEach((s, l) => points.push(label(l + 0.5, 1.2, `l = ${l} (${s})`, 'ink2', 0, 0, 'center')));
  for (let n = 1; n <= 4; n++) points.push(label(4.05, E1H / (n * n), `n = ${n}`, 'ink3', 2, 0));
  return { type: 'graph', params: { x: [0, 4.6], y: [-14.5, 2], aspect: 'wide', xlabel: '', ylabel: 'energy (eV)', xticks: 0, yticks: 4, axesAt: 'edge', curves, points }, caption };
}

export default lesson({
  id: 'phys4700.M5.2',
  title: 'The hydrogen atom',
  minutes: 18, difficulty: 3,
  intro: t`Put the Coulomb potential into the radial equation and only one thing can go wrong: the power series for $u(r)$ may fail to stop, and then it grows like $e^{2\kappa r}$ and cannot be normalized. Demanding that it stop forces a whole number $n$ and gives the energies — with the **reduced mass** $\mu$ of electron and proton, because the proton moves too:

$$\begin{gathered} E_n = -\frac{\mu}{2\hbar^2}\Big(\frac{e^2}{4\pi\epsilon_0}\Big)^2\frac{1}{n^2} \\ = -\frac{hcR_H}{n^2} \\ \mu = \frac{m_em_p}{m_e + m_p} \end{gathered}$$

The terminated series are associated Laguerre polynomials, and the wave functions are $\psi_{nlm} = R_{nl}(r)Y_l^m(\theta, \phi)$ with $l = 0, 1, \dots, n - 1$. Every level is $n^2$-fold degenerate (twice that with spin) — more than spherical symmetry alone explains.`,
  symbols: [
    { tex: 'E_n', text: t`the energy of level $n$, measured from the ionization limit (an electron at rest far away): negative for bound states` },
    { tex: 'n', text: t`the principal quantum number, $1, 2, 3, \dots$; with $l = 0, \dots, n - 1$ and $m = -l, \dots, l$` },
    { tex: '\\mu', text: t`the reduced mass of electron and proton: $m_e/(1 + m_e/m_p)$, about 0.05% less than $m_e$` },
    { tex: 'e^2/4\\pi\\epsilon_0', text: t`the strength of the Coulomb attraction, $${tex(QE * QE * 8.9875517862e9, 5)}$ J m` },
    { tex: 'R_H', text: t`the Rydberg constant for hydrogen: $R_\infty\,\mu/m_e = ${grp(RH, 2)}\ \text{m}^{-1}$ (CODATA 2022 inputs)` },
    { tex: 'h,\\ c,\\ \\hbar', text: t`Planck’s constant, the speed of light, and $h/2\pi$` },
  ],
  why: 'Hydrogen is the one atom solved exactly; its spectrum calibrates astronomy, fixes the Rydberg constant to twelve digits, and is the starting point for every other atom.',
  visual: {
    type: 'mp-orbitals',
    title: 'Hydrogen’s radial functions',
    lead: t`Each state $\psi_{nlm}$: a slice through its probability cloud, and below it the radial probability $P(r) = r^2R_{nl}^2 = |u|^2$. Count the bumps and the nodes as you change $n$ and $l$.`,
    tasks: [
      'Fix n = 3 and step l from 0 to 2: the radial nodes number n − l − 1, the degree of the Laguerre polynomial — 2, 1, 0.',
      'For l = n − 1 (1s, 2p, 3d, 4f) there are no radial nodes: P(r) is a single peak at r = n² a₀, Bohr’s orbit radius.',
      'Every state with the same n has the same energy, whatever its l and m. Hydrogen’s 1/r potential is special; most central potentials split those levels.',
    ],
    params: { n: 3, l: 1, m: 0, panels: ['cloud', 'radial'], controls: ['n', 'l', 'm'], marks: ['peak', 'mean', 'nodes'] },
    caption: 'Exact non-relativistic wave functions for an infinitely heavy nucleus (the reduced-mass correction rescales lengths by 0.05%); no spin, fine structure or Lamb shift. Lengths in Bohr radii.',
  },
  example: {
    prompt: t`Solve the radial equation for hydrogen far enough to see where the energies come from, then compute $R_H$ and the Lyman-α wavelength ($n = 2 \to 1$) with the reduced mass, and compare with the measured $121.567$ nm.`,
    visual: levelsPic(t`Hydrogen’s levels to scale, sorted by $l$: every $l < n$ shares the energy of its $n$.`),
    steps: [
      { label: 'Dimensionless form', text: t`With $\kappa = \sqrt{-2\mu E}/\hbar$, $\rho = \kappa r$ and $\rho_0 = \dfrac{\mu e^2}{2\pi\epsilon_0\hbar^2\kappa}$: $\dfrac{d^2u}{d\rho^2} = \Big[1 - \dfrac{\rho_0}{\rho} + \dfrac{l(l+1)}{\rho^2}\Big]u$.` },
      { label: 'Peel off the limits', text: t`Far out, $u \sim e^{-\rho}$; near the origin, $u \sim \rho^{l+1}$. So write $u = \rho^{l+1}e^{-\rho}v(\rho)$, and $v$ obeys $\rho v'' + 2(l + 1 - \rho)v' + (\rho_0 - 2(l + 1))v = 0$.` },
      { label: 'The series', text: t`$v = \sum c_j\rho^j$ gives $c_{j+1} = \dfrac{2(j + l + 1) - \rho_0}{(j + 1)(j + 2l + 2)}\,c_j$. For large $j$, $c_{j+1} \approx 2c_j/j$: the series of $e^{2\rho}$, which would make $u \sim e^{+\rho}$ — not normalizable.` },
      { label: 'It must stop', text: t`So some $c_{j_{\max}+1} = 0$: $\rho_0 = 2(j_{\max} + l + 1) \equiv 2n$ with $n = 1, 2, \dots$ and $l \le n - 1$. Then $E = -\dfrac{\hbar^2\kappa^2}{2\mu} = -\dfrac{\mu}{2\hbar^2}\Big(\dfrac{e^2}{4\pi\epsilon_0}\Big)^2\dfrac{1}{n^2}$, and $v$ is the Laguerre polynomial $L_{n-l-1}^{2l+1}(2\rho)$.` },
      { label: 'Reduced mass', text: t`For an infinitely heavy nucleus this is $-hcR_\infty/n^2$ with $hcR_\infty = ${fmt(RYD, 9)}$ eV. With $m_p/m_e = ${fmt(MP_ME, 13)}$: $R_H = R_\infty/(1 + m_e/m_p) = ${grp(RH, 2)}\ \text{m}^{-1}$, and $E_1 = ${fmt(E1H, 7)}$ eV.` },
      { label: 'Lyman-α', text: t`$1/\lambda = R_H(1 - \tfrac14)$, so $\lambda = 4/(3R_H) = ${fmt(LYA * 1e9, 7)}$ nm in vacuum, against $121.567$ nm measured — agreement to one part in $10^5$. Without the reduced mass the error would be 50 times larger (0.054%). The remainder is fine structure and QED, the subject of module M8.` },
    ],
    answer: t`$E_n = -hcR_H/n^2$ with $R_H = ${grp(RH, 2)}\ \text{m}^{-1}$; $E_1 = ${fmt(E1H, 6)}$ eV and Lyman-α at $${fmt(LYA * 1e9, 6)}$ nm.`,
  },
  practice: [
    mcq({
      id: 'terminate', difficulty: 2,
      prompt: t`In the series solution, what goes wrong if $\rho_0$ is not an even integer, so the series for $v(\rho)$ never ends?`,
      visual: { type: 'graph', params: { x: [0, 8], y: [-0.2, 1.6], aspect: 'wide', xlabel: 'ρ = κr', ylabel: 'u (scaled)', xticks: 8, yticks: 0, axesAt: 'edge', curves: [{ fn: '2*x*exp(-x)', color: 'accent', width: 2.4 }, { fn: '0.02*x*exp(x)/(1 + 0.02*x*exp(x))*1.5 + 2*x*exp(-x)*0.5', color: 'bad', width: 2, dash: [6, 4] }], legend: [{ label: 'series stops: decays', color: 'accent' }, { label: 'series runs on: grows', color: 'bad', dash: [6, 4] }], legendAt: 'tr' }, caption: 'Schematic: a terminating solution (n = 1) and a non-terminating one, which grows without limit (drawn compressed).' },
      choices: [
        t`$v \sim e^{2\rho}$ at large $\rho$, so $u \sim e^{+\rho}$ blows up and cannot be normalized`,
        t`The series diverges at every $\rho$, so there is no solution at all`,
        t`$u$ fails to vanish at $r = 0$`,
        t`Nothing; it just gives a scattering state with $E > 0$`,
      ],
      answer: 0,
      why: {
        1: t`The series converges for every $\rho$ — like the series for $e^{2\rho}$. The trouble is how fast its sum grows.`,
        2: t`The factor $\rho^{l+1}$ already makes $u(0) = 0$.`,
        3: t`$\kappa$ was defined for $E < 0$; a non-terminating series there is a growing exponential, not a scattering wave.`,
      },
      hints: [t`For large $j$, $c_{j+1}/c_j \to 2/j$. Which function has that ratio of coefficients?`],
      teach: 'Quantized energies come from a normalizability condition: the series must terminate, or the solution grows exponentially.',
      explain: t`$c_{j+1} \approx 2c_j/j$ means $c_j \approx 2^j/j!$: $v \approx e^{2\rho}$, and $u = \rho^{l+1}e^{-\rho}v \sim e^{+\rho}$. Only energies with $\rho_0 = 2n$ give a polynomial $v$ and a normalizable state — the same logic that quantized the oscillator.`,
    }),
    num({
      id: 'isotope', difficulty: 2,
      gen(r) {
        const [n1, n2, nm] = r.pick([[2, 3, 'Balmer-α (Hα, $n = 3 \\to 2$)'], [2, 4, 'Balmer-β (Hβ, $n = 4 \\to 2$)'], [1, 3, 'Lyman-β ($n = 3 \\to 1$)']]);
        const lh = lam(RH, n1, n2), ld = lam(RD, n1, n2), ans = (lh - ld) * 1e12;
        return {
          prompt: t`In 1932 Urey found deuterium as faint companions of hydrogen’s lines, shifted by the different reduced mass. For the ${nm} line, by how much is deuterium’s vacuum wavelength **shorter** than hydrogen’s, in pm? ($R_\infty = ${grp(RINF, 6)}\ \text{m}^{-1}$, $m_p/m_e = ${fmt(MP_ME, 13)}$, $m_d/m_e = ${fmt(MD_ME, 10)}$.)`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', xlabel: 'wavelength (not to scale)', ylabel: 'intensity', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-(x - 0.62)^2/0.0004)', color: 'accent', width: 2.4 }, { fn: '0.15*exp(-(x - 0.38)^2/0.0004)', color: 'violet', width: 2.2 }], points: [label(0.62, 1.02, 'H', 'accent', 0, -8, 'center'), label(0.38, 0.2, 'D (×0.0002 in nature)', 'violet', 0, -8, 'center')] }, caption: 'A hydrogen line with its deuterium companion on the short-wavelength side. Separation and strength exaggerated.' },
          answer: ans, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: (lam(RINF, n1, n2) - lh) * 1e12 * -1, feedback: t`That compares hydrogen with an infinitely heavy nucleus. Compare $R_H = R_\infty/(1 + m_e/m_p)$ with $R_D = R_\infty/(1 + m_e/m_d)$.` }],
          hints: [t`$R_H = R_\infty/(1 + m_e/m_p)$ and $R_D = R_\infty/(1 + m_e/m_d)$.`, t`$\lambda_H - \lambda_D = \lambda_H\big(1 - R_H/R_D\big)$, with $1/\lambda_H = R_H(1/n_1^2 - 1/n_2^2)$.`],
          teach: 'A heavier nucleus raises the reduced mass, deepens every level in proportion, and shifts every line slightly to the blue.',
          explain: t`$\lambda_H = ${fmt(lh * 1e9, 7)}$ nm and $\lambda_D = ${fmt(ld * 1e9, 7)}$ nm: a shift of $${fmt(ans, 4)}$ pm, a fraction $${tex(1 - RH / RD, 3)}$ of the wavelength. Urey, Brickwedde and Murphy saw it in an enriched sample — the discovery of deuterium.`,
        };
      },
    }),
    num({
      id: 'exotic', difficulty: 2,
      gen(r) {
        const [name, M, desc] = r.pick([['positronium', 1, 'an electron bound to a positron (mass $m_e$)'], ['muonic hydrogen', null, `a negative muon ($m_\\mu = ${fmt(MMU_ME, 10)}\\,m_e$) bound to a proton`], ['hydrogen with an infinitely heavy nucleus', Infinity, 'the textbook idealization']]);
        let mu;
        if (M === 1) mu = 0.5;
        else if (M === Infinity) mu = 1;
        else mu = (MMU_ME * MP_ME) / (MMU_ME + MP_ME);
        const ans = -RYD * mu;
        return {
          prompt: t`The hydrogen formula applies to any two opposite unit charges, with their reduced mass $\mu$: $E_1 = -(\mu/m_e)\times${fmt(RYD, 7)}$ eV. What is the ground-state energy of ${name}, ${desc}, in eV?`,
          visual: levelsPic('Ordinary hydrogen’s levels for comparison. Every level scales by the same factor μ/mₑ.'),
          answer: ans, units: 'eV', tol: { rel: 0.002 },
          errors: [{ value: -RYD * (M === 1 ? 1 : MMU_ME), feedback: t`Use the reduced mass, $m_1m_2/(m_1 + m_2)$, not the orbiting particle’s own mass.` }].filter((e) => Math.abs(e.value - ans) > 0.003 * Math.abs(ans)),
          hints: [t`$\mu = \dfrac{m_1m_2}{m_1 + m_2}$.`, t`Then $E_1 = -${fmt(RYD, 7)}\ \text{eV}\times\mu/m_e$.`],
          teach: 'Hydrogen-like systems differ only in their reduced mass, which scales every energy level by μ/mₑ (and every length by mₑ/μ).',
          explain: t`$\mu/m_e = ${fmt(mu, 7)}$, so $E_1 = ${fmt(ans, 6)}$ eV. ${M === null ? t`The muon orbits $${fmt(mu, 4)}$ times closer than an electron — close enough that muonic hydrogen measured the proton’s charge radius (the “proton radius puzzle”).` : M === 1 ? 'Positronium’s levels are half hydrogen’s, and it is twice as large.' : t`Ordinary hydrogen is $${fmt(-E1H, 7)}$ eV deep: the infinite-mass value is 0.05% too large.`}`,
        };
      },
    }),
    num({
      id: 'virial', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, 4]), which = r.pick(['V', 'T']);
        const En = E1H / (n * n), ans = which === 'V' ? 2 * En : -En;
        return {
          prompt: t`For a $1/r$ potential the virial theorem gives $2\langle T\rangle = -\langle V\rangle$ in every stationary state. In hydrogen’s level $n = ${n}$ ($E_${n} = ${fmt(En, 6)}$ eV), what is the expectation value of the ${which === 'V' ? 'potential' : 'kinetic'} energy, in eV?`,
          visual: { type: 'mp-orbitals', params: { n, l: n - 1, m: 0, panels: ['radial'], controls: false, hide: ['energy'] }, caption: t`$P(r)$ for the $n = ${n}$, $l = ${n - 1}$ state; every $l$ at this $n$ has the same $\langle T\rangle$ and $\langle V\rangle$.` },
          answer: ans, units: 'eV', tol: { rel: 0.002 },
          errors: (which === 'V' ? [{ value: En, feedback: t`$E = \langle T\rangle + \langle V\rangle$ with $\langle T\rangle = -\langle V\rangle/2$: so $\langle V\rangle = 2E$, not $E$.` }, { value: -ans, feedback: 'Check the sign: Coulomb potential energy is negative.' }] : [{ value: En, feedback: t`Kinetic energy is positive: $\langle T\rangle = -E_n$.` }, { value: -2 * En, feedback: t`$\langle T\rangle = -\tfrac12\langle V\rangle = -E_n$, not $-2E_n$.` }]),
          hints: [t`$E_n = \langle T\rangle + \langle V\rangle$ and $\langle T\rangle = -\tfrac12\langle V\rangle$.`, t`So $\langle V\rangle = 2E_n$ and $\langle T\rangle = -E_n$.`],
          teach: 'In a Coulomb bound state the average kinetic energy is −E and the average potential energy is 2E.',
          explain: t`$\langle ${which}\rangle = ${fmt(ans, 6)}$ eV. Equivalently $\langle 1/r\rangle = 1/(n^2a)$, since $\langle V\rangle = -\tfrac{e^2}{4\pi\epsilon_0}\langle 1/r\rangle$ — a result independent of $l$.`,
        };
      },
    }),
    num({
      id: 'circular', difficulty: 3,
      gen(r) {
        const l = r.pick([1, 2, 3]);
        const ans = -RYD / ((l + 1) ** 2);
        return {
          prompt: t`Try $u(r) = r^{${l + 1}}e^{-r/b}$ in hydrogen’s radial equation with $l = ${l}$ (infinitely heavy nucleus). It is a solution for exactly one $b$. What energy, in eV, does it have? ($hcR_\infty = ${fmt(RYD, 7)}$ eV, $a_0$ the Bohr radius.)`,
          visual: { type: 'mp-orbitals', params: { n: l + 1, l, m: 0, panels: ['radial'], controls: false, hide: ['energy', 'name'], marks: ['peak'] }, caption: t`The radial probability of this state: one peak, no radial nodes.` },
          answer: ans, units: 'eV', tol: { rel: 0.002 },
          errors: [{ value: -RYD / (l * l), feedback: t`The terminating series has $n = j_{\max} + l + 1$; with no other terms, $n = l + 1$.` }, { value: -RYD, feedback: t`That is the ground state ($l = 0$); with $l = ${l}$ the state belongs to $n = ${l + 1}$.` }],
          hints: [t`Substituting gives terms in $r^{l-1}$, $r^{l}$ and $r^{l+1}$ times $e^{-r/b}$; the $r^l$ terms cancel only if $b = (l + 1)a_0$.`, t`Then $E = -\hbar^2/2m_eb^2 = -hcR_\infty/(l + 1)^2$.`],
          teach: t`States with $l = n - 1$ have $u = r^ne^{-r/na_0}$: no radial nodes, and energy $-13.6\ \text{eV}/n^2$.`,
          explain: t`$b = ${l + 1}a_0$ and $E = -${fmt(RYD, 6)}/${(l + 1) ** 2} = ${fmt(ans, 5)}$ eV — the $n = ${l + 1}$ level, the “circular” state whose $P(r)$ peaks at Bohr’s radius $n^2a_0 = ${(l + 1) ** 2}\,a_0$.`,
        };
      },
    }),
    code({
      id: 'fd-hydrogen', difficulty: 3,
      prompt: t`Solve hydrogen’s radial equation numerically. In atomic units ($r$ in $a_0$, energy in hartrees, $1\ \text{hartree} = 2\times${fmt(RYD, 7)}$ eV) it reads $-\tfrac12u'' + \big[-\tfrac1r + \tfrac{l(l+1)}{2r^2}\big]u = Eu$. On the grid $r_j = jh$, $j = 1 \dots N$, with $u = 0$ at $r = 0$ and at $r = Nh + h$, it becomes a symmetric tridiagonal matrix: $1/h^2 + V_{\text{eff}}(r_j)$ on the diagonal and $-1/2h^2$ beside it. Write \`levels(l, k)\` returning the lowest \`k\` energies **in eV** for $N = 1500$, $h = 0.04\,a_0$. Use \`scipy.linalg.eigh_tridiagonal\` (fast) rather than a dense solver.`,
      starter: t`import numpy as np
from scipy.linalg import eigh_tridiagonal

RY = ${RYD}      # eV
N, h = 1500, 0.04
r = h * np.arange(1, N + 1)

def levels(l, k):
    pass

print(levels(0, 3))
print([-RY / n**2 for n in (1, 2, 3)])
`,
      answer: t`import numpy as np
from scipy.linalg import eigh_tridiagonal

RY = ${RYD}      # eV
N, h = 1500, 0.04
r = h * np.arange(1, N + 1)

def levels(l, k):
    diag = 1 / h**2 - 1 / r + l * (l + 1) / (2 * r**2)
    off = -0.5 / h**2 * np.ones(N - 1)
    E = eigh_tridiagonal(diag, off, select='i', select_range=(0, k - 1))[0]
    return E * 2 * RY

print(levels(0, 3))
print([-RY / n**2 for n in (1, 2, 3)])`,
      tests: [
        { name: t`the $l = 0$ levels are $-13.6\ \text{eV}/n^2$ for $n = 1, 2, 3$, to 0.1%`, code: 'np.allclose(levels(0, 3), [-RY / n**2 for n in (1, 2, 3)], rtol=1e-3)' },
        { name: t`the lowest $l = 1$ level equals the $n = 2$ energy (the l-degeneracy)`, code: 'abs(levels(1, 1)[0] / (-RY / 4) - 1) < 1e-3' },
        { name: t`the lowest $l = 2$ level equals the $n = 3$ energy`, code: 'abs(levels(2, 1)[0] / (-RY / 9) - 1) < 1e-3' },
        { name: t`$n^2E_n$ is the same for the first three $l = 0$ levels`, code: 'np.ptp(levels(0, 3) * np.array([1, 4, 9])) < 0.02' },
      ],
      hints: ['The diagonal is 1/h² − 1/r + l(l+1)/(2r²) on the grid r; the off-diagonal is −1/(2h²), one shorter.', '`eigh_tridiagonal(d, e, select="i", select_range=(0, k-1))[0]` returns the lowest k eigenvalues; multiply hartrees by 2·RY for eV.'],
      teach: 'A radial equation is a 1D eigenvalue problem; discretized, hydrogen’s spectrum and its l-degeneracy come out of a tridiagonal matrix.',
      explain: t`The grid reproduces $-13.6/n^2$ to a few parts in $10^4$ (the error, from the cusp of the $l = 0$ states at the nucleus, shrinks as $h^2$). The $l = 1$ and $l = 2$ series start at $n = 2$ and $n = 3$ with the same energies as the s states: the degeneracy is in the equation, not put in by hand. Try a potential $-e^{-r/5}/r$ (screened) and watch it split.`,
    }),
    mcq({
      id: 'accidental', difficulty: 3,
      prompt: t`In hydrogen the 2s and 2p levels have the same energy, but in the spherical well of the last lesson 2s lies far above 1p. Why is hydrogen different?`,
      visual: levelsPic('Hydrogen’s levels by l: within each n, every l lines up.'),
      choices: [
        t`The $1/r$ potential has an extra conserved quantity (the Laplace–Runge–Lenz vector), a larger symmetry than rotations alone`,
        t`Every central potential makes the energy independent of $l$`,
        t`The electron’s spin cancels the centrifugal barrier`,
        t`The reduced mass removes the $l$ dependence`,
      ],
      answer: 0,
      why: {
        1: t`Rotational symmetry only guarantees degeneracy in $m$; the spherical well and real many-electron atoms have $l$-dependent energies.`,
        2: t`Spin was not in the equation; and the barrier is plainly there in $V_{\text{eff}}$.`,
        3: t`The reduced mass rescales every level equally; it cannot create or remove a degeneracy.`,
      },
      hints: ['Classically, which orbits close on themselves? Kepler orbits do — the ellipse does not precess.', t`A conserved vector along the major axis of the ellipse exists only for $1/r$ (and the oscillator’s $r^2$).`],
      teach: 'Hydrogen’s n² degeneracy is a hidden symmetry of the 1/r potential, the quantum version of non-precessing Kepler ellipses.',
      explain: t`The Laplace–Runge–Lenz vector keeps a Kepler ellipse from precessing; in quantum mechanics it commutes with $\hat H$ and connects different $l$ at the same $n$. Anything that spoils the pure $1/r$ — other electrons screening the nucleus, relativity, QED — splits 2s from 2p, as in lithium or in hydrogen’s own fine structure and Lamb shift.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rh', difficulty: 2,
      prompt: t`Verify the Rydberg constant for hydrogen. With CODATA 2022’s $R_\infty = ${grp(RINF, 6)}\ \text{m}^{-1}$ (the value for an infinitely heavy nucleus) and $m_p/m_e = ${fmt(MP_ME, 13)}$, what is $R_H$, in $\text{m}^{-1}$? Give at least nine significant figures.`,
      visual: levelsPic('Every hydrogen level is −hcR_H/n²: one constant sets the whole diagram.'),
      answer: RH, units: 'm^-1', tol: { rel: 2e-8 },
      errors: [{ value: RINF, feedback: t`That is $R_\infty$. Multiply by $\mu/m_e = 1/(1 + m_e/m_p)$.` }, { value: RINF * (1 - 1 / MP_ME), feedback: t`$1/(1 + x)$ is close to $1 - x$, but not equal at eight figures: divide by $1 + m_e/m_p$ exactly.` }],
      hints: [t`$R_H = R_\infty\,\mu/m_e = \dfrac{R_\infty}{1 + m_e/m_p}$.`, t`$m_e/m_p = 1/${fmt(MP_ME, 13)} = ${tex(1 / MP_ME, 9)}$.`],
      teach: 'The proton’s finite mass lowers hydrogen’s Rydberg constant by a factor 1/(1 + mₑ/mₚ), about 5.4 parts in 10⁴.',
      explain: t`$R_H = ${grp(RINF, 6)}/${fmt(1 + 1 / MP_ME, 12)} = ${grp(RH, 2)}\ \text{m}^{-1}$. (Hydrogen’s measured transition frequencies are in fact how $R_\infty$ itself is determined, once fine structure, QED and the proton’s size are accounted for.)`,
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      prompt: t`Mars has lost most of its water, and the deuterium-to-hydrogen ratio of its upper atmosphere records how much. NASA’s MAVEN orbiter measures it with an ultraviolet spectrograph that separates the Lyman-α lines of the two isotopes. How far apart are they, in pm? ($R_\infty = ${grp(RINF, 6)}\ \text{m}^{-1}$, $m_p/m_e = ${fmt(MP_ME, 13)}$, $m_d/m_e = ${fmt(MD_ME, 10)}$.)`,
      visual: { type: 'graph', params: { x: [121.49, 121.6], y: [0, 1.15], aspect: 'wide', xlabel: 'wavelength (nm)', ylabel: 'brightness (scaled)', xticks: 4, yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-(x - 121.567)^2/(2*0.004^2))', color: 'accent', width: 2.4, samples: 2000 }, { fn: '0.12*exp(-(x - 121.534)^2/(2*0.004^2))', color: 'violet', width: 2.4, samples: 2000 }] }, caption: 'Hydrogen’s Lyman-α emission and, to its short-wavelength side, deuterium’s, much fainter. Line widths and strengths schematic; the axis is in nm.' },
      answer: (lam(RH, 1, 2) - lam(RD, 1, 2)) * 1e12, units: 'pm', tol: { rel: 0.01 },
      errors: [{ value: (lam(RINF, 1, 2) - lam(RH, 1, 2)) * 1e12, feedback: 'That compares hydrogen with an infinitely heavy nucleus; compare hydrogen with deuterium.' }],
      hints: [t`$\lambda = \dfrac{4}{3R}$ for each isotope, with $R = R_\infty/(1 + m_e/M)$.`, t`$\Delta\lambda = \lambda_H(1 - R_H/R_D)$.`],
      teach: 'Isotope shifts from the reduced mass are large enough at short wavelengths to separate isotopes spectroscopically.',
      explain: t`$\lambda_H = ${fmt(lam(RH, 1, 2) * 1e9, 7)}$ nm and $\lambda_D = ${fmt(lam(RD, 1, 2) * 1e9, 7)}$ nm, $${fmt((lam(RH, 1, 2) - lam(RD, 1, 2)) * 1e12, 4)}$ pm apart — about 1 part in 3700. Hydrogen escapes Mars more easily than deuterium, so the remaining water is enriched in D; MAVEN found deuterium’s emission varying strongly with the Martian seasons, tracing the escape as it happens.`,
    }),
    mcq({
      id: 'cp-l-range', difficulty: 2,
      prompt: t`An electron in hydrogen is in the $n = 3$ level. Which set lists every allowed value of $l$, and how many states (ignoring spin) share this energy?`,
      visual: levelsPic('The levels by l up to n = 4.'),
      choices: [t`$l = 0, 1, 2$; 9 states`, t`$l = 0, 1, 2, 3$; 16 states`, t`$l = 1, 2, 3$; 15 states`, t`$l = 0, 1, 2$; 3 states`],
      answer: 0,
      why: {
        1: t`$l$ stops at $n - 1$: the series needs $n = j_{\max} + l + 1$ with $j_{\max} \ge 0$.`,
        2: t`$l = 0$ is allowed for every $n$ (the s states), and $l = n$ is not.`,
        3: t`Each $l$ carries $2l + 1$ values of $m$: $1 + 3 + 5 = 9$.`,
      },
      hints: [t`$n = j_{\max} + l + 1$ with $j_{\max} = 0, 1, 2, \dots$.`, t`Count $2l + 1$ states per $l$.`],
      teach: 'For hydrogen l runs from 0 to n − 1, and the level holds n² states (2n² with spin).',
      explain: t`$l = 0, 1, 2$ (3s, 3p, 3d) with $1 + 3 + 5 = 9 = n^2$ states — 18 with spin, which is why the third row of the periodic table would hold 18 if the levels did not split in many-electron atoms.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values (Rydberg constant, mass ratios)', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'Urey, Brickwedde & Murphy, “A hydrogen isotope of mass 2”, Phys. Rev. 39, 164 (1932)', url: 'https://doi.org/10.1103/PhysRev.39.164' },
    { label: 'NASA, MAVEN (Mars Atmosphere and Volatile EvolutioN) mission', url: 'https://science.nasa.gov/mission/maven/' },
  ],
});
