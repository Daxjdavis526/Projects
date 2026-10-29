// Emission and absorption of radiation: Einstein's A and B coefficients
// (Griffiths & Schroeter §11.2–11.3; Einstein 1916/1917). The classical
// dipole radiation behind it is phys4600.M5.1 (linked). Here: absorption and
// stimulated emission from the golden rule with incoherent broadband light,
// rate = B ρ(ν); Einstein's detailed-balance argument giving g₁B₁₂ = g₂B₂₁
// and A₂₁/B₂₁ = 8πhν³/c³; stimulated over spontaneous = 1/(e^{hν/kT} − 1)
// (huge for radio lines, negligible for optical ones at room temperature);
// A ∝ ω³|d|²; the Lyman series from |⟨n10|z|100⟩|² (A = 6.265, 1.673, 0.682
// × 10⁸ s⁻¹ for n = 2, 3, 4, matching NIST); electric-dipole selection rules
// Δl = ±1 from parity and angular momentum; the metastable 2s (two-photon,
// 8.23 s⁻¹) and the 21-cm magnetic-dipole line (A ≈ 2.88 × 10⁻¹⁵ s⁻¹,
// τ ≈ 11 Myr). Lasers need inversion because B₁₂ = B₂₁. Transfer: 21-cm gas
// bathed in the CMB, where stimulated emission wins by a factor of 40.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, H, C, KB, ALPHA, A0, RYD, QE, MP_ME, r6, seg, label } from './_q2b.js';
import { z2n } from './_q2.js';

const t = String.raw;
const MU = 1 / (1 + 1 / MP_ME);
const wn = (n) => ((1 - 1 / (n * n)) * RYD * QE * MU) / HBAR;
const Aly = (n) => (4 * ALPHA * wn(n) ** 3 * z2n(n) * (A0 / MU) ** 2) / (3 * C * C);
const LINES = [
  { name: 'the 21-cm line of hydrogen', lam: 0.21106114, short: '21 cm' },
  { name: 'the caesium clock transition (9.19 GHz)', lam: C / 9192631770, short: 'Cs clock' },
  { name: 'the CO₂ laser line (10.6 μm)', lam: 10.6e-6, short: 'CO₂ 10.6 μm' },
  { name: 'the sodium D line (589 nm)', lam: 589.0e-9, short: 'Na 589 nm' },
  { name: 'Lyman-α (121.6 nm)', lam: 121.567e-9, short: 'Lyman-α' },
];
LINES.forEach((L) => { L.th = (H * C) / (L.lam * KB); });
const ratioExpr = (th) => `-(${r6(th)}/10^x)/ln(10) - log10(1 - exp(-${r6(th)}/10^x))`;
const A21CM = 2.8843e-15;                       // s⁻¹, hydrogen hyperfine (Gould 1994)
const YR = 3.15576e7;

const hLevels = (arrows, caption) => ({
  type: 'graph',
  params: {
    x: [0, 3.3], y: [-14.5, 0.6], aspect: 'wide', xlabel: '', ylabel: 'energy (eV)', xticks: 0, yticks: 4, axesAt: 'edge',
    curves: [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2], [4, 0], [4, 1], [4, 2]].map(([n, l]) => seg(l * 0.95 + 0.25, -RYD / (n * n), l * 0.95 + 0.85, -RYD / (n * n), ['accent', 'violet', 'gold'][l], 2.4)),
    points: [label(0.55, 0.3, 's (l = 0)', 'accent', 0, 0, 'center'), label(1.5, 0.3, 'p (l = 1)', 'violet', 0, 0, 'center'), label(2.45, 0.3, 'd (l = 2)', 'gold', 0, 0, 'center'), label(3.25, -RYD, 'n = 1', 'ink3', 0, 0, 'right'), label(3.25, -RYD / 4, 'n = 2', 'ink3', 0, -8, 'right')],
    arrows,
  },
  caption,
});
const arr = (n1, l1, n2, l2, color = 'warn', dash) => ({ from: [r6(l1 * 0.95 + 0.55), r6(-RYD / (n1 * n1))], to: [r6(l2 * 0.95 + 0.55), r6(-RYD / (n2 * n2))], color, width: 2.2, ...(dash ? { dash } : {}) });

export default lesson({
  id: 'phys4710.M7.4',
  title: 'Emission and absorption of radiation',
  minutes: 17, difficulty: 3,
  intro: t`An atom in light can absorb a photon, be **stimulated** by the light to emit one, or emit one **spontaneously** with no light at all. Einstein (1916) showed that the three rates are locked together — otherwise matter and radiation could never reach thermal equilibrium:

$$\begin{gathered} A_{21} = \frac{8\pi h\nu^3}{c^3}\,B_{21},\qquad g_1B_{12} = g_2B_{21} \end{gathered}$$

Absorption and stimulated emission come from the golden rule with the light’s field; spontaneous emission is the same physics with the vacuum’s field, and it grows as $\nu^3$. (The classical antenna behind it is [electric dipole radiation](#/lesson/phys4600.M5.1).)`,
  symbols: [
    { tex: 'A_{21}', text: 'the spontaneous emission rate from the upper level 2 to the lower level 1, in s⁻¹ (the inverse lifetime if 2 → 1 is the only decay)' },
    { tex: 'B_{21},\\ B_{12}', text: 'the stimulated-emission and absorption coefficients: the rate per atom is Bρ(ν)' },
    { tex: '\\rho(\\nu)', text: 'the radiation’s energy density per unit frequency, in J m⁻³ Hz⁻¹' },
    { tex: '\\nu', text: 'the transition frequency, (E₂ − E₁)/h, in Hz' },
    { tex: 'g_1,\\ g_2', text: 'the degeneracies (numbers of states) of the two levels' },
    { tex: 'h,\\ c', text: 'Planck’s constant and the speed of light' },
  ],
  why: 'Lasers, masers, stellar spectra, the 21-cm map of the Milky Way and the greenhouse effect all run on these three rates and the ratios between them.',
  visual: {
    type: 'graph',
    title: 'Stimulated versus spontaneous',
    lead: t`In thermal radiation at temperature $T$, the ratio of stimulated to spontaneous emission is $1/(e^{h\nu/kT} - 1)$. Five real lines, from radio to ultraviolet, on log scales.`,
    tasks: [
      'At room temperature (300 K) the 21-cm line is stimulated about 4 400 times more than it emits spontaneously; the sodium D line essentially never is.',
      'Slide down to the cosmic background’s 2.7 K: radio lines are still dominated by stimulated emission.',
      'Find where the CO₂ laser line crosses 1: at a temperature of about hν/k ÷ ln 2 ≈ 1 960 K the two processes are equal.',
    ],
    params: {
      x: [0, 5.2], y: [-12, 5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'temperature T (K)', ylabel: 'stimulated ÷ spontaneous', axesAt: 'edge',
      sliders: [{ key: 'T', label: 'Temperature $T$', min: 2.7, max: 100000, step: 0.1, value: 300, logScale: true, unit: '\\text{K}', explain: 'The temperature of the thermal (blackbody) radiation bathing the atoms.' }],
      curves: LINES.map((L, i) => ({ fn: ratioExpr(L.th), color: ['teal', 'violet', 'warn', 'gold', 'accent'][i], width: 2.2, label: L.short, labelAt: [0.3, 1.35, 2.75, 3.55, 4.25][i], labelDy: [-10, -10, 12, 12, 12][i], labelDx: [0, 0, 8, 8, 8][i] })),
      hlines: [{ y: 0, color: 'ink4' }],
      vlines: [{ x: 'log10(T)', color: 'ink2' }],
      readouts: [
        { label: '21 cm', expr: `1/(exp(${r6(LINES[0].th)}/T) - 1)`, digits: 3, zero: 0 },
        { label: 'CO₂ 10.6 μm', expr: `1/(exp(${r6(LINES[2].th)}/T) - 1)`, digits: 3, zero: 0 },
        { label: 'Na 589 nm', expr: `1/(exp(${r6(LINES[3].th)}/T) - 1)`, digits: 3, zero: 0 },
      ],
    },
    caption: t`The ratio $1/(e^{h\nu/kT} - 1)$ for blackbody radiation of temperature $T$; above the grey line stimulated emission wins. Real environments are rarely in thermal equilibrium — a laser or a maser is the deliberate exception.`,
  },
  example: {
    prompt: t`Use Einstein’s equilibrium argument to relate $A_{21}$ and $B_{21}$, then compute $A$ for the Lyman lines $np \to 1s$ of hydrogen from $A = \dfrac{4\alpha\omega^3}{3c^2}|\langle1s|\vec r|np\rangle|^2$.`,
    visual: hLevels([arr(2, 1, 1, 0), arr(3, 1, 1, 0, 'warn', [5, 4]), arr(4, 1, 1, 0, 'warn', [2, 3])], 'Hydrogen’s lowest levels by n and l. Arrows: the Lyman series np → 1s, the only electric-dipole decays of the np states to the ground state.'),
    steps: [
      { label: 'Rates', text: t`With $N_1$, $N_2$ atoms in thermal radiation: absorption $N_1B_{12}\rho$, stimulated emission $N_2B_{21}\rho$, spontaneous emission $N_2A_{21}$.` },
      { label: 'Equilibrium', text: t`Steady state: $N_1B_{12}\rho = N_2(A_{21} + B_{21}\rho)$, with $N_2/N_1 = (g_2/g_1)e^{-h\nu/kT}$ (Boltzmann). Solve: $\rho = \dfrac{A_{21}/B_{21}}{(g_1B_{12}/g_2B_{21})e^{h\nu/kT} - 1}$.` },
      { label: 'Match Planck', text: t`This must equal Planck’s $\rho = \dfrac{8\pi h\nu^3/c^3}{e^{h\nu/kT} - 1}$ at every $T$: so $g_1B_{12} = g_2B_{21}$ and $A_{21} = \dfrac{8\pi h\nu^3}{c^3}B_{21}$. Without $A$ — without spontaneous emission — no equilibrium is possible.` },
      { label: 'Lyman alpha', text: t`$|\langle1s|\vec r|2p\rangle|^2 = ${fmt(z2n(2), 4)}\,a^2$ (reduced-mass Bohr radius $a$) and $\hbar\omega = 10.20$ eV give $A = ${tex(Aly(2), 4)}\ \text{s}^{-1}$ — the golden-rule result of the last lesson.` },
      { label: 'Lyman beta and gamma', text: t`For $3p$: $|\langle1s|\vec r|3p\rangle|^2 = ${fmt(z2n(3), 4)}\,a^2$, $A = ${tex(Aly(3), 4)}\ \text{s}^{-1}$; for $4p$: $${fmt(z2n(4), 4)}\,a^2$, $A = ${tex(Aly(4), 4)}\ \text{s}^{-1}$. NIST lists $6.2649$, $1.6725$ and $0.68186\times10^8\ \text{s}^{-1}$.` },
      { label: 'Sense check', text: t`Higher frequency helps ($\omega^3$), but the overlap of a large $np$ orbit with the compact $1s$ falls faster, so $A$ drops along the series. The $3p$ level can also decay to $2s$ (Balmer-α), so its lifetime is a little shorter than $1/A_{31}$.` },
    ],
    answer: t`$A_{21} = (8\pi h\nu^3/c^3)B_{21}$, $g_1B_{12} = g_2B_{21}$; Lyman $A$ values $${tex(Aly(2), 4)}$, $${tex(Aly(3), 4)}$, $${tex(Aly(4), 4)}\ \text{s}^{-1}$ for $n = 2, 3, 4$.`,
  },
  practice: [
    num({
      id: 'ratio', difficulty: 2,
      gen(r) {
        const L = r.pick(LINES.slice(0, 4)), T = r.pick([77, 300, 1000, 3000]);
        const ans = 1 / Math.expm1(L.th / T);
        return {
          prompt: t`Atoms with a transition at ${L.name} sit in blackbody radiation at $T = ${T}$ K. What is the ratio of stimulated to spontaneous emission, $1/(e^{h\nu/kT} - 1)$?`,
          visual: { type: 'graph', params: { x: [0, 5.2], y: [-12, 5], xlog: true, ylog: true, aspect: 'wide', xlabel: 'temperature T (K)', ylabel: 'stimulated ÷ spontaneous', axesAt: 'edge', curves: [{ fn: ratioExpr(L.th), color: 'accent', width: 2.4 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'The ratio for this line against temperature, log scales (the temperature asked about is not marked).' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-L.th / T), feedback: t`That is the Boltzmann factor; the ratio is $1/(e^{h\nu/kT} - 1)$, the photon occupation number.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$h\nu/k = hc/\lambda k$ with $\lambda = ${L.lam >= 1e-3 ? tex(L.lam * 100, 4) + '\\ \\text{cm}' : tex(L.lam * 1e9, 4) + '\\ \\text{nm}'}$.`, t`$h\nu/kT = ${tex(L.th / T, 4)}$ here.`],
          teach: 'Stimulated emission beats spontaneous when kT ≫ hν: radio and microwave lines are stimulated-dominated, optical lines are not.',
          explain: t`$h\nu/k = ${tex(L.th, 4)}$ K, so $h\nu/kT = ${tex(L.th / T, 4)}$ and the ratio is $${tex(ans, 3)}$.`,
        };
      },
    }),
    num({
      id: 'lyman-n', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]);
        const ans = Aly(n);
        return {
          prompt: t`Compute the spontaneous emission rate of hydrogen’s $${n}p \to 1s$ line from $A = \dfrac{4\alpha\omega^3}{3c^2}|\langle1s|\vec r|${n}p\rangle|^2$, with $|\langle1s|\vec r|${n}p\rangle|^2 = ${fmt(z2n(n), 5)}\,a^2$, $a = ${fmt((A0 / MU) * 1e12, 6)}$ pm (the reduced-mass Bohr radius) and $\hbar\omega = (1 - 1/${n * n})\times13.6057\ \text{eV}\times${fmt(MU, 6)}$.`,
          visual: hLevels([arr(Math.min(n, 4), 1, 1, 0)], `The decay ${n}p → 1s (the arrow; levels above n = 4 not drawn).`),
          answer: ans, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: ans * 3, feedback: t`The matrix element given is already $|\langle1s|\vec r|np\rangle|^2$ — do not multiply by 3 for the three components.` }, { value: ans / (4 / 3), feedback: t`Keep the prefactor $4\alpha/3c^2$.` }],
          hints: [t`$\omega = \hbar\omega/\hbar$: find $\omega$ in rad/s first.`, t`$A = \dfrac{4\alpha}{3c^2}\omega^3\times${fmt(z2n(n), 4)}\times(${fmt((A0 / MU) * 1e12, 5)}\times10^{-12}\ \text{m})^2$.`],
          teach: 'Spontaneous rates scale as ω³|d|²: the frequency helps, the shrinking overlap hurts.',
          explain: t`$\omega = ${tex(wn(n), 5)}\ \text{s}^{-1}$, so $A = ${tex(ans, 4)}\ \text{s}^{-1}$. ${n === 2 ? 'The 2p state has no other way down, so τ = 1/A = 1.60 ns.' : `The ${n}p state also decays to lower s and d levels, so its lifetime is shorter than 1/A.`}`,
        };
      },
    }),
    mcq({
      id: 'two-s', difficulty: 2,
      prompt: t`Hydrogen’s $2s$ state lies at the same energy as $2p$, yet lives about 0.12 s instead of 1.6 ns. Why?`,
      visual: hLevels([arr(2, 0, 1, 0, 'bad', [4, 4]), arr(2, 1, 1, 0, 'good')], 'Green: the allowed 2p → 1s decay. Red dashed: 2s → 1s, forbidden for a single electric-dipole photon.'),
      choices: [
        t`$2s \to 1s$ has $\Delta l = 0$: the dipole matrix element $\langle1s|\vec r|2s\rangle$ vanishes by parity, so it must decay by two photons at once, far more slowly`,
        'The 2s electron is farther from the nucleus and cannot reach it',
        'There is no photon state of the right energy',
        'Spin conservation forbids it',
      ],
      answer: 0,
      why: {
        1: 'The 2s wave function is not farther out than the 2p one in any way that matters; the issue is symmetry.',
        2: 'The energy is the same as Lyman-α; photon states exist. The coupling vanishes.',
        3: 'Spin is unchanged in either case; the electric dipole operator does not touch spin.',
      },
      hints: [t`$\vec r$ is odd under parity; $1s$ and $2s$ are both even.`],
      teach: 'Electric-dipole transitions need Δl = ±1 (a parity change): “forbidden” transitions go by slower channels, not never.',
      explain: t`$\langle1s|\vec r|2s\rangle$ is the integral of an odd function: zero. The $2s$ state decays by emitting two photons simultaneously, at $8.23\ \text{s}^{-1}$ — a lifetime of 0.12 s, a hundred million times longer than $2p$. In a gas, collisions usually mix it with $2p$ first.`,
    }),
    num({
      id: 'cm21', difficulty: 2,
      gen(r) {
        const which = r.pick(['Myr', 'number']);
        const tauMyr = 1 / A21CM / YR / 1e6;
        const N = r.pick([1e60, 1e64, 5e65]);
        const ans = which === 'Myr' ? tauMyr : N * 0.75 * A21CM;
        return {
          prompt: which === 'Myr'
            ? t`The 21-cm line of hydrogen is a magnetic-dipole transition between the hyperfine levels of the ground state, with $A = ${tex(A21CM, 4)}\ \text{s}^{-1}$. What is the upper level’s spontaneous lifetime, in millions of years?`
            : t`A cloud contains $${tex(N, 1)}$ hydrogen atoms, three quarters of them in the upper hyperfine level (the statistical weights 3 : 1 of a warm gas). With $A = ${tex(A21CM, 4)}\ \text{s}^{-1}$, how many 21-cm photons per second does it emit spontaneously?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [-0.4, 1.4], aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, grid: false, curves: [seg(0.4, 0, 1.6, 0, 'accent', 3), seg(0.4, 1, 1.6, 1, 'accent', 3)], arrows: [{ from: [1, 0.95], to: [1, 0.05], color: 'gold', width: 2.4 }], points: [label(1.7, 1, 'F = 1 (3 states)', 'accent', 4, 0), label(1.7, 0, 'F = 0 (1 state)', 'accent', 4, 0), label(1.1, 0.5, '21 cm, 1420.4 MHz', 'gold', 4, 0)] }, caption: 'Hydrogen’s ground-state hyperfine levels (spacing hugely exaggerated: 5.9 μeV) and the 21-cm transition.' },
          answer: ans, units: which === 'Myr' ? '' : 's^-1', tol: { rel: 0.01 },
          errors: which === 'Myr' ? [{ value: tauMyr * 1e6, feedback: 'Convert years to millions of years.' }] : [{ value: N * A21CM, feedback: 'Only the atoms in the upper level can emit.' }],
          hints: which === 'Myr' ? [t`$\tau = 1/A$; one year is $3.156\times10^7$ s.`] : [t`Rate $= N_2A$ with $N_2 = \tfrac34N$.`],
          teach: 'A magnetic-dipole transition at a radio frequency is extraordinarily slow — yet the sheer number of hydrogen atoms makes 21 cm the brightest map of the Galaxy.',
          explain: which === 'Myr' ? t`$\tau = 1/(${tex(A21CM, 4)}\ \text{s}^{-1}) = ${tex(1 / A21CM, 3)}$ s $= ${fmt(tauMyr, 3)}$ million years. Collisions in interstellar gas reset the level populations far more often than that.` : t`$\tfrac34\times${tex(N, 1)}\times${tex(A21CM, 4)} = ${tex(ans, 3)}$ photons per second.`,
        };
      },
    }),
    mcq({
      id: 'laser', difficulty: 2,
      prompt: t`Why can a two-level system in thermal equilibrium never amplify light, however hard it is pumped by light at the transition frequency?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-0.4, 1.4], aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, grid: false, curves: [seg(0.4, 0, 1.6, 0, 'accent', 3), seg(0.4, 1, 1.6, 1, 'accent', 3)], arrows: [{ from: [0.8, 0.05], to: [0.8, 0.95], color: 'good', width: 2.2, label: 'B₁₂ρ', labelDx: -36, labelDy: 0 }, { from: [1.2, 0.95], to: [1.2, 0.05], color: 'warn', width: 2.2, label: 'B₂₁ρ', labelDx: 8, labelDy: 0 }] }, caption: 'Absorption (up) and stimulated emission (down) between two non-degenerate levels: equal coefficients.' },
      choices: [
        t`$B_{12} = B_{21}$ (for equal degeneracies), so light gains only if $N_2 > N_1$ — and pumping on the same transition can at most equalize the populations`,
        'Stimulated photons travel in random directions',
        'Spontaneous emission always exceeds stimulated emission',
        t`The atoms absorb more strongly than they emit, by a factor $e^{h\nu/kT}$`,
      ],
      answer: 0,
      why: {
        1: 'Stimulated photons copy the stimulating photon’s direction, phase and polarization — the basis of the laser.',
        2: 'For strong light the stimulated rate Bρ can far exceed A.',
        3: 'The coefficients are equal; the populations differ by the Boltzmann factor.',
      },
      hints: [t`Net gain is $(N_2 - N_1)B\rho$ per unit time.`],
      teach: 'Gain needs population inversion, which a two-level system cannot reach by optical pumping: lasers use three or four levels.',
      explain: t`Net stimulated emission is $(N_2 - N_1)B_{21}\rho$. Pumping drives $N_2$ toward $N_1$ (saturation) but never past it. Three- and four-level schemes pump a different transition and let atoms collect in the upper laser level.`,
    }),
    num({
      id: 'nu3', difficulty: 2,
      gen(r) {
        const lam1 = r.pick([500, 600, 800]), f = r.pick([2, 3, 10]);
        const ans = f ** 3;
        return {
          prompt: t`Two transitions have the same dipole matrix element, but one is at $${lam1}$ nm and the other at $${fmt(lam1 / f, 4)}$ nm. By what factor is the shorter-wavelength line’s spontaneous rate larger?`,
          visual: { type: 'graph', params: { x: [0, 10.5], y: [0, 1100], aspect: 'wide', xlabel: 'frequency ratio ν₂/ν₁', ylabel: 'A₂/A₁', axesAt: 'edge', curves: [{ fn: 'x^3', domain: [0, 10.3], color: 'accent', width: 2.4 }] }, caption: 'Spontaneous rate against frequency at fixed dipole moment: a cubic.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: f, feedback: t`$A \propto \omega^3|d|^2$: cube the frequency ratio.` }, { value: f * f, feedback: t`It is $\omega^3$, not $\omega^2$: one power from the photon’s energy and two from the density of photon states.` }],
          hints: [t`$A = \dfrac{\omega^3|d|^2}{3\pi\epsilon_0\hbar c^3}$.`],
          teach: 'Spontaneous emission grows as ν³: ultraviolet and X-ray transitions are fast, radio ones extremely slow — which is why X-ray lasers are so hard to build.',
          explain: t`The frequency ratio is ${f}, so $A$ grows by $${f}^3 = ${ans}$. The same $\nu^3$ is why masers came before lasers, and X-ray lasers needed free-electron machines.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cmb', difficulty: 3, transfer: true,
      gen(r) {
        const [L, T, where] = r.pick([[LINES[0], 2.725, 'the cosmic microwave background (2.725 K) in intergalactic gas'], [LINES[0], 2.725 * 7, 'the cosmic microwave background at redshift z = 6 (7 × 2.725 K)'], [LINES[1], 2.725, 'the cosmic microwave background (2.725 K)']]);
        const ans = 1 / Math.expm1(L.th / T);
        return {
          prompt: t`Radio astronomers must account for stimulated emission. For ${L.name}, bathed in ${where}, what is the ratio of stimulated to spontaneous emission?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-1, 3], xlog: true, ylog: true, aspect: 'wide', xlabel: 'T (K)', ylabel: 'stimulated ÷ spontaneous', axesAt: 'edge', curves: [{ fn: ratioExpr(L.th), color: 'teal', width: 2.4 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'The ratio for this line against radiation temperature (log scales).' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-L.th / T), feedback: t`The occupation number is $1/(e^{x} - 1)$ with $x = h\nu/kT$; for small $x$ it is about $1/x$.` }],
          hints: [t`$h\nu/k = ${fmt(L.th, 4)}$ K for this line.`, t`For $h\nu \ll kT$, $1/(e^{h\nu/kT} - 1) \approx kT/h\nu$.`],
          teach: 'For radio lines even the 2.7 K microwave background stimulates far more emission than happens spontaneously.',
          explain: t`$h\nu/kT = ${fmt(L.th / T, 4)}$, so the ratio is $${fmt(ans, 4)}$. ${L === LINES[0] ? 'The 21-cm line’s excitation temperature is pulled toward the CMB’s; at the cosmic dawn, the contrast between them is what 21-cm cosmology experiments look for.' : 'Clock atoms in a warm room see even more: blackbody radiation shifts clock frequencies, a correction every primary clock applies.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-why-a', difficulty: 2,
      prompt: t`Einstein introduced spontaneous emission (the $A$ coefficient) in 1916, a decade before quantum electrodynamics. What forced him to?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-0.4, 1.4], aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, grid: false, curves: [seg(0.4, 0, 1.6, 0, 'accent', 3), seg(0.4, 1, 1.6, 1, 'accent', 3)], arrows: [{ from: [0.7, 0.05], to: [0.7, 0.95], color: 'good', width: 2.2 }, { from: [1.0, 0.95], to: [1.0, 0.05], color: 'warn', width: 2.2 }, { from: [1.3, 0.95], to: [1.3, 0.05], color: 'gold', width: 2.2, dash: [4, 4] }] }, caption: 'Absorption, stimulated emission and spontaneous emission (dashed) between two levels.' },
      choices: [
        'Without it, atoms in thermal radiation could not reproduce Planck’s law at all temperatures',
        'Excited atoms were observed to glow only in strong light',
        'Stimulated emission alone would violate energy conservation',
        'Bohr’s model required electrons to spiral into the nucleus',
      ],
      answer: 0,
      why: {
        1: 'They glow in the dark too — that is spontaneous emission, and the point.',
        2: 'Stimulated emission conserves energy perfectly; the problem was matching the equilibrium spectrum.',
        3: 'Bohr’s model forbade spiralling; it said nothing about rates.',
      },
      hints: ['Write the equilibrium condition with only B coefficients and see what ρ(ν) comes out.'],
      teach: 'Detailed balance with Planck’s law fixes A/B = 8πhν³/c³: spontaneous emission is required by thermodynamics.',
      explain: t`With only $B$ terms, equilibrium gives $\rho \to$ an expression that cannot match Planck’s formula at all $T$. Adding $A$ makes it work, with $A/B = 8\pi h\nu^3/c^3$ — later derived from the quantized field: spontaneous emission is emission stimulated by the vacuum’s fluctuations.`,
    }),
    num({
      id: 'cp-lifetime', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        const ans = 1e9 / Aly(n);
        return {
          prompt: t`If $np \to 1s$ were the only decay of hydrogen’s $${n}p$ level, with $A = ${tex(Aly(n), 4)}\ \text{s}^{-1}$, what would its lifetime be, in ns?`,
          visual: hLevels([arr(n, 1, 1, 0)], `The ${n}p → 1s decay.`),
          answer: ans, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: ans * Math.LN2, feedback: 'That is a half-life; the lifetime is 1/A.' }],
          hints: [t`$\tau = 1/A$.`],
          teach: 'The lifetime is the inverse of the total decay rate.',
          explain: t`$\tau = 1/${tex(Aly(n), 4)} = ${fmt(ans, 4)}$ ns. ${n > 2 ? `The real ${n}p lifetime is a little shorter, because it can also decay to lower s and d levels.` : 'For 2p this is the true lifetime, 1.60 ns.'}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §11.2–11.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'NIST Atomic Spectra Database (hydrogen transition probabilities)', url: 'https://physics.nist.gov/asd' },
  ],
});
