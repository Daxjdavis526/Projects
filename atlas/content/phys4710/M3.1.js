// Hyperfine structure beyond hydrogen's ground state (Griffiths & Schroeter
// §7.5; Steck's alkali data). phys4700.M6.3 derives hydrogen's 21-cm line
// from Fermi's contact formula; nothing of it is repeated. Here: the general
// magnetic-dipole hyperfine Hamiltonian A Î·Ĵ/ħ² for a J = ½ ground state,
// F = I ± ½, E_F = (A/2)[F(F + 1) − I(I + 1) − J(J + 1)], the interval rule
// E_F − E_{F−1} = AF, the splitting A(I + ½). Caesium-133 (I = 7/2): F = 3
// and 4, 9 192 631 770 Hz exactly (the SI second), A = 2298.157 942 5 MHz;
// its Breit–Rabi diagram (16 sublevels, g_J and g_I from Steck) and the clock
// transition's quadratic shift 427.45 Hz/G². Scaling of the contact term,
// A ∝ g_I Z³/n³ with the reduced-mass factor: H 2s ≈ 1s/8 (177.5507 against
// 177.556 834 3 MHz measured), D (327.328 against 327.384 352 MHz), ³He⁺
// (8666.08 against 8665.649 867 MHz, and inverted: the helion's moment is
// negative). Transfers: a caesium fountain's Ramsey time and linewidth; the
// passive hydrogen masers of Galileo. Moments CODATA 2022.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { CS_HFS } from '../phys4700/_qm.js';
import { H, MU_B, MP_ME, C, G0, r6, levelPic } from './_q2.js';

const t = String.raw;
const NU_H = 1420.405751768;                 // MHz, hydrogen 1s (hydrogen masers)
const NU_H2S = 177.5568343;                  // MHz, hydrogen 2s (Kolachevsky et al. 2009)
const NU_D = 327.384352522;                  // MHz, deuterium 1s (Wineland & Ramsey 1972)
const NU_HE3 = 8665.649867;                  // MHz, ³He⁺ 1s (Schuessler et al. 1969)
const MU_P = 2.79284734463, MU_D = 0.8574382335, MU_HEL = -2.127625307;   // nuclear magnetons (CODATA 2022)
const MD_ME = 3670.482967655, MH_ME = 5495.88527984;                        // deuteron, helion masses / mₑ (CODATA 2022)
const red3 = (M) => (1 + 1 / M) ** -3;
const PRED = {
  d: NU_H * ((MU_D / 1) / (MU_P / 0.5)) * (1.5 / 1) * (red3(MD_ME) / red3(MP_ME)),
  he: NU_H * 8 * Math.abs(MU_HEL / MU_P) * (red3(MH_ME) / red3(MP_ME)),
};
const GJ = 2.00254032, GI = -0.00039885395;   // Cs-133 ground state (Steck)
const MUB_H = MU_B / H;                       // Hz/T
const NU = CS_HFS;
const KQ = ((GJ - GI) * MUB_H) ** 2 / (2 * NU);  // Hz/T², clock transition's quadratic shift
const ALK = [
  { name: 'rubidium-87', I: 1.5, nu: 6834.682610904 },
  { name: 'rubidium-85', I: 2.5, nu: 3035.732439 },
  { name: 'sodium-23', I: 1.5, nu: 1771.6261288 },
  { name: 'caesium-133', I: 3.5, nu: NU / 1e6 },
  { name: 'potassium-39', I: 1.5, nu: 461.7197202 },
];
const half = (x) => (Number.isInteger(x) ? String(x) : `${2 * x}/2`);

/** Two hyperfine levels F = I ± ½ (energies in units of A), with their degeneracies. */
function hfPic(I, caption, { inverted = false, labels = true } = {}) {
  const Fu = I + 0.5, Fl = I - 0.5, Eu = (Fu * (Fu + 1) - I * (I + 1) - 0.75) / 2, El = (Fl * (Fl + 1) - I * (I + 1) - 0.75) / 2;
  const s = inverted ? -1 : 1;
  return levelPic([
    { E: s * Eu, x0: 0.6, x1: 2.4, color: 'accent', label: labels ? `F = ${half(Fu)} (${2 * Fu + 1} states)` : undefined, dx: 8 },
    { E: s * El, x0: 0.6, x1: 2.4, color: 'gold', label: labels ? `F = ${half(Fl)} (${2 * Fl + 1} states)` : undefined, dx: 8 },
  ], { y: [r6(Math.min(s * Eu, s * El) - 0.8), r6(Math.max(s * Eu, s * El) + 0.8)], x: [0, 4.4], ylabel: 'energy (units of A)', caption, yticks: 0 });
}

/** The Breit–Rabi levels of Cs-133’s ground state (GHz) against B (mT). */
function csCurves() {
  const k = ((GJ - GI) * MUB_H) / NU / 1000;     // x per mT
  const gm = (GI * MUB_H) / 1e9 / 1000;          // GHz per mT per unit m
  const c0 = -NU / 1e9 / 16, h = NU / 2e9;
  const out = [];
  for (let m = -4; m <= 4; m++) out.push({ fn: `${r6(c0)} + ${r6(gm * m)}*x + ${r6(h)}*sqrt(1 + ${m}*${r6(k)}*x/2 + (${r6(k)}*x)^2)`, color: m === 0 ? 'violet' : 'accent', width: m === 0 ? 2.8 : 1.8 });
  for (let m = -3; m <= 3; m++) out.push({ fn: `${r6(c0)} + ${r6(gm * m)}*x - ${r6(h)}*sqrt(1 + ${m}*${r6(k)}*x/2 + (${r6(k)}*x)^2)`, color: m === 0 ? 'violet' : 'gold', width: m === 0 ? 2.8 : 1.8 });
  return { curves: out, k };
}
const CS = csCurves();

export default lesson({
  id: 'phys4710.M3.1',
  title: 'Hyperfine structure and the 21-cm line',
  minutes: 18, difficulty: 3,
  intro: t`Every nucleus with spin $I$ carries a magnetic moment, and the electron’s field at the nucleus couples to it. For an atom with one valence electron in an s state ($J = \tfrac12$), first-order perturbation theory gives the hyperfine Hamiltonian $A\,\hat{\vec I}\cdot\hat{\vec J}/\hbar^2$, whose eigenstates have definite total angular momentum $\hat{\vec F} = \hat{\vec I} + \hat{\vec J}$:

$$\begin{gathered} E_F = \frac{A}{2}\big[F(F + 1) - I(I + 1) - J(J + 1)\big] \\ F = I \pm \tfrac12 \\ \Delta E = A\big(I + \tfrac12\big) \end{gathered}$$

[Adding angular momenta](#/lesson/phys4700.M6.3) worked out hydrogen ($I = \tfrac12$, the 21-cm line) from Fermi’s contact formula. This lesson takes the same Hamiltonian to heavier nuclei — above all **caesium-133**, whose ground-state splitting has defined the SI second since 1967: exactly $9\,192\,631\,770$ Hz.`,
  symbols: [
    { tex: 'A', text: t`the hyperfine constant, an energy (quoted as $A/h$ in MHz): proportional to the nuclear magnetic moment divided by $I$, and to the electron density at the nucleus` },
    { tex: '\\hat{\\vec I}', text: t`the nuclear spin; $I = \tfrac12$ for the proton, $1$ for the deuteron, $\tfrac72$ for $^{133}$Cs` },
    { tex: '\\hat{\\vec J}', text: t`the electron’s total angular momentum; $J = \tfrac12$ for an s electron` },
    { tex: 'F', text: t`the total angular momentum quantum number of atom plus nucleus; each level holds $2F + 1$ states` },
    { tex: '\\Delta E', text: t`the ground-state hyperfine splitting between $F = I + \tfrac12$ and $F = I - \tfrac12$` },
  ],
  why: 'Hyperfine transitions are the ticking of atomic clocks — caesium defines the second, rubidium clocks fly on GPS satellites, hydrogen masers steer the Deep Space Network — and hyperfine splittings measure nuclear moments and sizes.',
  visual: {
    type: 'graph',
    title: 'Caesium’s 16 ground-state sublevels',
    lead: t`The Breit–Rabi diagram of $^{133}$Cs: energies (as frequencies) of the 16 ground-state sublevels against a magnetic field. Blue: $F = 4$; gold: $F = 3$; violet: the two $m = 0$ levels of the clock transition.`,
    tasks: [
      'At B = 0 there are two levels, 9 and 7 states, 9.19 GHz apart: the SI second.',
      'Raise the field a little: each level fans out into its m sublevels, linearly — but the two violet m = 0 levels move only quadratically. That is why clocks use them.',
      'By 300 mT the pattern has regrouped into two families by the electron’s spin: the field has decoupled J from I (the Paschen–Back regime of hyperfine structure).',
    ],
    params: {
      x: [0, 300], y: [-12, 10], aspect: 'wide', xlabel: 'B (mT)', ylabel: 'E/h (GHz)', xticks: 6, yticks: 4, axesAt: 'edge',
      sliders: [{ key: 'b', label: t`Field $B$`, min: 0, max: 300, step: 1, value: 10, unit: '\\text{mT}', explain: 'A steady magnetic field along z.' }],
      curves: CS.curves,
      vlines: [{ x: 'b', color: 'ink3' }],
      readouts: [{ label: 'shift of the clock transition (Hz)', expr: `${NU}*(sqrt(1 + (${r6(CS.k)}*b)^2) - 1)`, digits: 4 }],
    },
    caption: 'The exact Breit–Rabi formula for J = ½ with Steck’s g_J = 2.002 540 and g_I = −0.000 399 (Cs-133 ground state); no other levels mix in.'.replace('g_J', 'gⱼ').replace('g_I', 'the nuclear g'),
  },
  example: {
    prompt: t`For $^{133}$Cs ($I = \tfrac72$, ground state $6s\ ^2S_{1/2}$), find the hyperfine levels and their degeneracies, the hyperfine constant $A$ from the defined clock frequency, and the clock transition’s sensitivity to a small field.`,
    visual: hfPic(3.5, 'The two hyperfine levels of a J = ½ ground state with I = 7/2, in units of A.'),
    steps: [
      { label: 'Dot product', text: t`$\hat{\vec F}^2 = \hat{\vec I}^2 + \hat{\vec J}^2 + 2\hat{\vec I}\cdot\hat{\vec J}$, so $\hat{\vec I}\cdot\hat{\vec J}/\hbar^2 = \tfrac12[F(F + 1) - I(I + 1) - J(J + 1)]$ — the same algebra as two spins ½, with bigger numbers.` },
      { label: 'Levels', text: t`$F = \tfrac72 \pm \tfrac12 = 4$ or $3$. $E_4 = \tfrac{A}{2}\big[20 - \tfrac{63}{4} - \tfrac34\big] = \tfrac74A$ and $E_3 = \tfrac{A}{2}\big[12 - \tfrac{63}{4} - \tfrac34\big] = -\tfrac94A$. Degeneracies $9 + 7 = 16 = (2I + 1)(2J + 1)$: no states lost.` },
      { label: 'Interval', text: t`$E_4 - E_3 = 4A = A(I + \tfrac12)$. With $\Delta E/h = 9\,192\,631\,770$ Hz exactly, $A/h = ${fmt(NU / 4e6, 11)}$ MHz.` },
      { label: 'Clock states', text: t`In a field, the $m = 0$ levels move only at second order: $\nu(B) = \nu_0\sqrt{1 + x^2}$ with $x = (g_J - g_I)\mu_BB/h\nu_0$, so $\Delta\nu \approx \dfrac{(g_J - g_I)^2\mu_B^2}{2h^2\nu_0}B^2 = ${fmt(KQ / 1e8, 5)}$ Hz/G$^2$ ($1$ G $= 10^{-4}$ T).` },
      { label: 'Size', text: t`A fountain clock’s field of $0.1\ \mu$T shifts the clock by $${fmt(KQ * 1e-14 * 1e3, 3)}$ mHz, a fractional $${tex((KQ * 1e-14) / NU, 2)}$ — small, but larger than the clock’s uncertainty, so it is measured (on the field-sensitive $m = \pm1$ lines) and corrected.` },
    ],
    answer: t`$F = 4$ (9 states) at $+\tfrac74A$ and $F = 3$ (7 states) at $-\tfrac94A$; $A/h = ${fmt(NU / 4e6, 9)}$ MHz; clock shift $${fmt(KQ / 1e8, 4)}$ Hz/G$^2$.`,
  },
  practice: [
    num({
      id: 'find-A', difficulty: 2,
      gen(r) {
        const a = r.pick(ALK);
        const ans = a.nu / (a.I + 0.5);
        return {
          prompt: t`The ground state of ${a.name} ($J = \tfrac12$, nuclear spin $I = ${half(a.I).replace(/(\d+)\/(\d+)/, '\\tfrac{$1}{$2}')}$) has a hyperfine splitting of $${fmt(a.nu, 10)}$ MHz. What is the hyperfine constant $A/h$, in MHz?`,
          visual: hfPic(a.I, 'The two hyperfine levels for this nuclear spin, in units of A.'),
          answer: ans, units: 'MHz', tol: { rel: 0.001 },
          errors: [{ value: a.nu, feedback: t`The splitting is $A(I + \tfrac12)$, not $A$ itself.` }, { value: a.nu / a.I, feedback: t`Divide by $I + \tfrac12$, which is the larger $F$: the interval rule $E_F - E_{F-1} = AF$.` }].filter((e) => Math.abs(e.value - ans) > 0.002 * ans),
          hints: [t`$\Delta E = E_{I+1/2} - E_{I-1/2} = A(I + \tfrac12)$.`],
          teach: 'For a J = ½ ground state the hyperfine splitting is A(I + ½): the interval rule with F = I + ½.',
          explain: t`$A/h = ${fmt(a.nu, 10)}/${fmt(a.I + 0.5, 2)} = ${fmt(ans, 8)}$ MHz.`,
        };
      },
    }),
    mcq({
      id: 'f-values', difficulty: 1,
      prompt: t`Rubidium-85 has nuclear spin $I = \tfrac52$ and a $5s$ ground state. Which hyperfine levels does the ground state have, and how many sublevels in all?`,
      visual: hfPic(2.5, 'Two hyperfine levels (labels hidden).', { labels: false }),
      choices: [t`$F = 2$ and $F = 3$; $5 + 7 = 12$ sublevels`, t`$F = \tfrac52$ only; 6 sublevels`, t`$F = 2, 3$ and $\tfrac52$; 18 sublevels`, t`$F = 1$ and $F = 2$; 8 sublevels`],
      answer: 0,
      why: {
        1: t`The electron’s $J = \tfrac12$ adds to $I$: $F = I \pm \tfrac12$.`,
        2: t`$F$ runs in whole steps from $|I - J|$ to $I + J$: 2 and 3, nothing else.`,
        3: t`That would be $I = \tfrac32$, as for rubidium-87.`,
      },
      hints: [t`$F$ takes every value from $|I - J|$ to $I + J$ in whole steps.`, t`Check: the total must be $(2I + 1)(2J + 1) = 12$.`],
      teach: 'F = I ± ½ for a J = ½ ground state; the sublevels number (2I + 1)(2J + 1).',
      explain: t`$F = 2$ (5 sublevels) and $F = 3$ (7): 12 in all $= 6\times2$. Rubidium-85’s splitting, 3.04 GHz, is less than half of rubidium-87’s 6.83 GHz because its nuclear moment per unit spin is smaller.`,
    }),
    num({
      id: 'h-2s', difficulty: 2,
      prompt: t`The contact hyperfine energy is proportional to the electron density at the nucleus, $|\psi(0)|^2 = Z^3/(\pi a^3n^3)$ for an s state. Hydrogen’s $1s$ splitting is $${fmt(NU_H, 13)}$ MHz. Predict its $2s$ splitting, in MHz.`,
      visual: { type: 'mp-orbitals', params: { n: 2, l: 0, m: 0, panels: ['radial'], controls: false, readout: false }, caption: 'The 2s radial probability: most of the electron is far out, and its density at the nucleus is 1/8 of the 1s value.' },
      answer: NU_H / 8, units: 'MHz', tol: { rel: 0.0005 },
      errors: [{ value: NU_H / 4, feedback: t`$|\psi(0)|^2 \propto 1/n^3$, not $1/n^2$.` }, { value: NU_H / 2, feedback: t`The density at the nucleus falls as $1/n^3$.` }],
      hints: [t`Divide by $n^3 = 8$.`],
      teach: 'The contact hyperfine splitting of an s state scales as Z³/n³.',
      explain: t`$${fmt(NU_H, 10)}/8 = ${fmt(NU_H / 8, 7)}$ MHz, against the measured $${fmt(NU_H2S, 10)}$ MHz — 34 parts per million apart. The difference, mostly relativistic, is calculated so precisely that comparing the 1s and 2s splittings tests QED without needing to know the proton’s structure.`,
    }),
    num({
      id: 'helium3', difficulty: 3,
      prompt: t`The ion $^3$He$^+$ is hydrogen-like with $Z = 2$ and nuclear spin $\tfrac12$ (the helion, moment $\mu_h = ${MU_HEL}\,\mu_N$, against the proton’s $${MU_P}\,\mu_N$). Scale hydrogen’s $${fmt(NU_H, 13)}$ MHz by $Z^3$, by $|\mu_h/\mu_p|$, and by the reduced-mass factor $(1 + m_e/m_h)^{-3}/(1 + m_e/m_p)^{-3} = ${fmt(red3(MH_ME) / red3(MP_ME), 9)}$. What splitting do you predict, in MHz?`,
      visual: hfPic(0.5, 'Hydrogen-like hyperfine levels for I = ½, in units of A; with a negative nuclear moment, A < 0 and the order flips.', { inverted: true }),
      answer: PRED.he, units: 'MHz', tol: { rel: 0.0005 },
      errors: [{ value: NU_H * 8, feedback: t`Also scale by the nuclear moment: the helion’s is $${fmt(Math.abs(MU_HEL / MU_P), 5)}$ of the proton’s.` }, { value: NU_H * 4 * Math.abs(MU_HEL / MU_P) * (red3(MH_ME) / red3(MP_ME)), feedback: t`$|\psi(0)|^2 \propto Z^3$: a factor 8, not 4.` }],
      hints: [t`Both nuclei have spin ½, so $A \propto Z^3\mu$ with the same $I$.`, t`$${fmt(NU_H, 10)}\times8\times${fmt(Math.abs(MU_HEL / MU_P), 6)}\times${fmt(red3(MH_ME) / red3(MP_ME), 6)}$.`],
      teach: 'Hydrogen-like hyperfine splittings scale with Z³, the nuclear moment, and the reduced mass cubed.',
      explain: t`$${fmt(PRED.he, 7)}$ MHz against the measured $${fmt(NU_HE3, 9)}$ MHz: agreement to $${fmt(Math.abs(PRED.he / NU_HE3 - 1) * 1e6, 2)}$ parts per million. Because the helion’s moment is negative, $A < 0$ and the order is inverted: $F = 1$ lies **below** $F = 0$. The $^3$He$^+$ line at 3.46 cm is observed in interstellar gas and traces the helium-3 made in the Big Bang.`,
    }),
    num({
      id: 'deuterium', difficulty: 3,
      prompt: t`Deuterium’s nucleus has $I = 1$ and moment $\mu_d = ${MU_D}\,\mu_N$. The contact constant is $A \propto \mu/I$ (times the electron density), and the splitting is $A(I + \tfrac12)$. Starting from hydrogen ($I = \tfrac12$, $\mu_p = ${MU_P}\,\mu_N$, splitting $${fmt(NU_H, 13)}$ MHz) and including the reduced-mass factor $${fmt(red3(MD_ME) / red3(MP_ME), 9)}$, predict deuterium’s ground-state splitting, in MHz.`,
      visual: hfPic(1, 'Hyperfine levels for I = 1: F = 3/2 and F = ½, in units of A.'),
      answer: PRED.d, units: 'MHz', tol: { rel: 0.0005 },
      errors: [{ value: NU_H * (MU_D / MU_P) * (red3(MD_ME) / red3(MP_ME)), feedback: t`Scaling by $\mu$ alone forgets the spins: $A \propto \mu/I$, and the splitting is $A(I + \tfrac12)$ — a factor $\tfrac{1/1}{1/(1/2)}\times\tfrac{3/2}{1} = \tfrac34$ beyond the moments.` }],
      hints: [t`$\nu_D/\nu_H = \dfrac{\mu_d/1}{\mu_p/\frac12}\cdot\dfrac{1 + \frac12}{\frac12 + \frac12}$, times the reduced-mass factor.`, t`That is $\tfrac34(\mu_d/\mu_p)\times${fmt(red3(MD_ME) / red3(MP_ME), 6)}$.`],
      teach: 'Comparing isotopes, the hyperfine splitting scales as (μ/I)(I + ½) at the same electron density.',
      explain: t`$\nu_D = ${fmt(NU_H, 10)}\times\tfrac34\times${fmt(MU_D / MU_P, 7)}\times${fmt(red3(MD_ME) / red3(MP_ME), 7)} = ${fmt(PRED.d, 7)}$ MHz, against the measured $${fmt(NU_D, 12)}$ MHz. The remaining 170 ppm is the deuteron’s size: its magnetism is spread over a nucleus several femtometres across, which the contact formula treats as a point.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fountain', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([0.3, 0.5, 0.7, 1.0]);
        const T = 2 * Math.sqrt((2 * h) / G0), ans = 1 / (2 * T);
        return {
          prompt: t`A caesium fountain clock launches laser-cooled atoms upward through a microwave cavity; they rise $${h}$ m above it and fall back through it. The two passages form a Ramsey interferometer whose central fringe has a full width of about $1/(2T)$, where $T$ is the time between the passages. Ignoring the cavity’s size, what is that width, in Hz? ($g = ${G0}$ m/s².)`,
          visual: { type: 'graph', params: { x: [0, 1.6], y: [0, 1.2], aspect: 'wide', xlabel: 'time (s)', ylabel: 'height (m)', xticks: 4, yticks: 3, axesAt: 'edge', curves: [{ fn: `max(0, ${r6(Math.sqrt(2 * G0 * h))}*x - ${r6(G0 / 2)}*x^2)`, color: 'accent', width: 2.4, domain: [0, r6(T)] }], hlines: [{ y: 0, color: 'gold', label: 'cavity' }] }, caption: 'The atoms’ ballistic flight above the cavity (no air, uniform gravity).' },
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: 1 / T, feedback: t`The Ramsey fringe’s full width is about $1/(2T)$.` }, { value: 1 / (2 * Math.sqrt((2 * h) / G0)), feedback: t`$T$ is the whole time up and back down: $2\sqrt{2h/g}$.` }],
          hints: [t`Rising $h$ against gravity and falling back takes $T = 2\sqrt{2h/g}$.`, t`$T = ${fmt(T, 4)}$ s; width $= 1/(2T)$.`],
          teach: 'A longer free-flight time between the two microwave pulses narrows the Ramsey fringe as 1/2T.',
          explain: t`$T = ${fmt(T, 4)}$ s and the fringe is $${fmt(ans, 3)}$ Hz wide — a fraction $${tex(ans / NU, 2)}$ of $9.19$ GHz. Splitting that fringe a million times over many launches gives fountains their accuracy of about $10^{-16}$. In orbit, without gravity pulling the atoms back, $T$ could be much longer: the reason for space clocks such as ACES.`,
        };
      },
    }),
    num({
      id: 'cp-galileo', difficulty: 2, transfer: true,
      gen(r) {
        const y = r.pick([1, 3, 5]);           // ×10⁻¹⁴
        const days = r.pick([1, 2]);
        const dt = y * 1e-14 * days * 86400, ans = C * dt * 100;   // cm
        return {
          prompt: t`Each Galileo navigation satellite carries a passive hydrogen maser, which steers a quartz oscillator to hydrogen’s $1420.405\,751\,768$ MHz hyperfine line (derived in [Adding angular momenta](#/lesson/phys4700.M6.3)). If its frequency is off by a fraction $${y}\times10^{-14}$, how far — as a light-travel distance, in cm — does its clock drift in ${days === 1 ? 'one day' : 'two days'}?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [0, 1.15], aspect: 'wide', xlabel: 'time (days)', ylabel: 'clock error (scaled)', xticks: 2, yticks: 0, axesAt: 'edge', curves: [{ fn: '0.5*x', color: 'accent', width: 2.4 }] }, caption: 'A constant fractional frequency error makes the time error grow linearly.' },
          answer: ans, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: ans / 100, feedback: 'Convert metres to centimetres.' }],
          hints: [t`Time error $= y\times t$ with $t$ in seconds.`, t`Multiply by $c = 299\,792\,458$ m/s to get a distance.`],
          teach: 'A clock’s fractional frequency error, times elapsed time, gives its time error; times c, a ranging error.',
          explain: t`$\Delta t = ${y}\times10^{-14}\times${days * 86400}\ \text{s} = ${fmt(dt * 1e9, 3)}$ ns, a light distance of $${fmt(ans, 3)}$ cm. Ground stations upload corrections a few times a day, which is why satellite clocks need this stability between updates.`,
        };
      },
    }),
    mcq({
      id: 'cp-clock-states', difficulty: 2,
      prompt: t`Why do caesium clocks use the transition between the two $m_F = 0$ sublevels rather than, say, $F = 4, m_F = 1 \to F = 3, m_F = 1$?`,
      visual: { type: 'graph', params: { x: [0, 30], y: [-5.4, 5], aspect: 'wide', xlabel: 'B (mT)', ylabel: 'E/h (GHz)', xticks: 6, yticks: 4, axesAt: 'edge', curves: CS.curves }, caption: 'The low-field part of caesium’s Breit–Rabi diagram; violet: the two m = 0 levels.' },
      choices: [
        t`Their frequency difference changes only quadratically with the field, so stray fields of a fraction of a microtesla barely move it`,
        t`Only $m_F = 0$ states absorb microwaves`,
        t`The $m_F = 0$ states are the lowest in energy`,
        t`The definition of the second requires $m_F = 0$ for historical reasons only; physics gives no preference`,
      ],
      answer: 0,
      why: {
        1: t`Transitions with $\Delta m_F = 0$ or $\pm1$ between other sublevels are allowed too; they are used to measure the field.`,
        2: t`In a field the lowest sublevel is $F = 3, m_F = 3$; $m_F = 0$ is in the middle of each fan.`,
        3: 'The choice is physical: the linear Zeeman shifts of the two m = 0 levels cancel.',
      },
      hints: [t`Look at the slopes of the violet curves near $B = 0$.`],
      teach: 'Atomic clocks use m = 0 → m = 0 transitions because they are field-insensitive to first order.',
      explain: t`Near $B = 0$ the two $m_F = 0$ levels have zero slope (apart from the tiny nuclear term, which cancels between them), so the clock frequency shifts by only $${fmt(KQ / 1e8, 4)}$ Hz/G$^2$; the $m_F = 1$ transition would shift by about $0.7$ MHz per gauss — linearly.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §7.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'D. A. Steck, “Cesium D Line Data” (rev. 2.3.3) and “Rubidium 85/87 D Line Data”', url: 'https://steck.us/alkalidata/' },
    { label: 'BIPM, The International System of Units (SI Brochure), 9th ed. (the caesium frequency)', url: 'https://www.bipm.org/en/publications/si-brochure' },
    { label: 'N. Kolachevsky et al., “Measurement of the 2S hyperfine interval in atomic hydrogen”, Phys. Rev. Lett. 102, 213002 (2009)', url: 'https://doi.org/10.1103/PhysRevLett.102.213002' },
  ],
});
