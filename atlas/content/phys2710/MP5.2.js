// The Bohr model, taken seriously as mechanics — L = nħ and Coulomb’s law
// give rₙ = n²a₀/Z, vₙ = Zαc/n and Eₙ = −Z²·13.6 eV/n²; a nucleus of finite
// mass moves too, so the electron’s mass becomes the reduced mass
// μ = mM/(m + M): hydrogen against deuterium (Urey’s discovery),
// positronium, He⁺ and muonic atoms (muonic hydrogen; muonic lead, where the
// point-nucleus model breaks); the correspondence principle at large n and
// the radio recombination lines of interstellar hydrogen. Builds on
// phys2220.A1.1 without repeating its examples. Every number is computed here.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, MEC2, MPC2, MDC2, MMUC2, MP_ME, RINF, A0, UC2 } from './_constants.js';
import { seg, label, frame, circle, r6 } from './_diagrams.js';
import { RYD, MAC2, ALPHA, M_PB208 } from './_quanta.js';

const t = String.raw;
const mu = (m, M) => (m * M) / (m + M) / MEC2;                 // reduced mass in electron masses (rest energies in MeV)
const MU = { H: 1 / (1 + 1 / MP_ME), D: mu(MEC2, MDC2), Ps: 0.5, He: mu(MEC2, MAC2), muH: mu(MMUC2, MPC2) };
const MPB = M_PB208 * UC2 - 82 * MEC2;                          // MeV, lead-208 nucleus
const lam = (m, ni, nf, Z = 1) => 1e9 / (RINF * m * Z * Z * (1 / (nf * nf) - 1 / (ni * ni)));   // nm, vacuum
const A0FM = A0 * 1e15;
const RC = RINF * C;                                            // Hz: the Rydberg frequency (infinite nuclear mass)

/**
 * Two bodies circling their centre of mass (Bohr’s picture with a moving
 * nucleus): separation 1, electron on a circle of radius M/(M + m), nucleus
 * on one of radius m/(M + m). M is the nucleus’s mass in units of the light
 * particle’s; a slider key or a number.
 */
function twoBody(M, ang = 'a', extra = {}) {
  const re = `(${M})/((${M}) + 1)`, rn = `1/((${M}) + 1)`, th = `(${ang})*pi/180`;
  return {
    x: [-1.6, 1.6], y: [-1.15, 1.15], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: [`${re}*cos(t)`, `${re}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.4, dash: true },
      { param: [`${rn}*cos(t)`, `${rn}*sin(t)`], t: [0, 6.2832], color: 'bad', width: 1.4, dash: true },
      { param: [`${re}*cos(${th})*t - ${rn}*cos(${th})*(1 - t)`, `${re}*sin(${th})*t - ${rn}*sin(${th})*(1 - t)`], t: [0, 1], color: 'ink4', width: 1.2 },
    ],
    points: [
      { x: `${re}*cos(${th})`, y: `${re}*sin(${th})`, r: 6, color: 'accent', label: 'electron', labelDx: 10, labelDy: -10 },
      { x: `-${rn}*cos(${th})`, y: `-${rn}*sin(${th})`, r: 9, color: 'bad', label: 'nucleus', labelDx: 12, labelDy: 14 },
      { x: 0, y: 0, r: 2.5, color: 'gold', label: 'centre of mass', labelDx: -10, labelDy: 16, labelAlign: 'right' },
    ],
    ...extra,
  };
}
const twoBodyStill = (M, caption) => ({ type: 'graph', params: twoBody(M, 35), caption });

/** A Bohr orbit: the nucleus, the electron and its velocity (schematic). */
const orbitPic = (caption) => ({
  type: 'graph',
  params: frame([-1.9, 1.9], [-1.25, 1.25], {
    aspect: 'wide',
    curves: [circle(0, 0, 1, 'accent', 1.6, true)],
    arrows: [{ from: [0.7071, 0.7071], to: [0.2, 1.22], color: 'gold', label: 'v = ?', labelDx: -8, labelDy: -8, labelAlign: 'right' }, { from: [0, 0], to: [0.68, 0.68], color: 'ink3', width: 1.2, label: 'r', labelDx: 4, labelDy: 14 }],
    points: [{ x: 0, y: 0, r: 7, color: 'bad' }, { x: 0.7071, y: 0.7071, r: 6, color: 'accent', label: 'electron', labelDx: 10, labelDy: 6 }],
  }),
  caption: caption ?? 'Bohr’s 1913 picture: an electron on a circular orbit. The model gets the energies right; quantum mechanics replaced the orbits with clouds of probability.',
});

/** Classical orbital frequency and the photon frequency for n → n − 1, against n, on log–log axes. */
function corrGraph(nMark, caption) {
  const L = Math.log10;
  return {
    type: 'graph',
    params: {
      x: [0, 3], y: [6, 16.2], aspect: 'wide', xlog: true, ylog: true, xlabel: 'principal quantum number n', ylabel: 'frequency (Hz)',
      curves: [
        { fn: `${r6(L(2 * RC))} - 3*x`, domain: [0, 3], color: 'accent', width: 2.4, label: 'electron’s orbital frequency', labelAt: 1.9, labelDx: 10, labelDy: -10 },
        { fn: `log(${r6(RC)}*(1/(10^x - 1)^2 - 1/10^(2*x)))`, domain: [0.302, 3], color: 'gold', width: 2.2, dash: true, label: 'photon, n → n − 1', labelAt: 0.5, labelDx: 10, labelDy: -6 },
      ],
      vlines: nMark ? [{ x: r6(L(nMark)), label: `n = ${nMark}`, color: 'ink3' }] : [],
    },
    caption: caption ?? 'Hydrogen in Bohr’s model, ignoring the nucleus’s motion: the frequency of the light emitted in the jump n → n − 1 (dashed) and the number of times per second the electron goes round (solid). At large n they become the same.',
  };
}

/** A close-up of two spectral lines, hydrogen’s and deuterium’s (no wavelengths shown). */
const pairLines = (caption) => ({
  type: 'graph',
  params: {
    x: [-1, 1], y: [0, 1.3], aspect: 'wide', xlabel: 'wavelength →', ylabel: '', xticks: 0, yticks: 0, axesAt: 'edge',
    curves: [{ fn: 'exp(-((x + 0.32)/0.05)^2)*0.45 + exp(-((x - 0.32)/0.05)^2)', color: 'accent', width: 2.2 }],
    points: [label(-0.32, 0.45, 'deuterium', 'violet', 0, -14, 'center'), label(0.32, 1, 'hydrogen', 'accent', 0, -14, 'center'), label(0, 0.2, 'Δλ = ?', 'gold', 0, 0, 'center')],
  },
  caption: caption ?? 'A close-up of one line from a mixture of hydrogen and deuterium: the heavier isotope’s line sits at a slightly shorter wavelength. Heights and widths illustrative.',
});

export default lesson({
  id: 'phys2710.MP5.2',
  title: 'The Bohr model',
  minutes: 15, difficulty: 3,
  intro: t`Bohr’s 1913 model rests on one quantum rule — the orbiting electron’s angular momentum comes in whole units, $L = n\hbar$ — plus Coulomb’s law and Newton’s. For a nucleus of charge $Ze$ it gives radii $r_n = n^2a_0/Z$, speeds $v_n = Z\alpha c/n$ and energies $-Z^2(13.6\ \text{eV})/n^2$. Taken seriously as mechanics it has one correction: the nucleus is not infinitely heavy, so **both bodies circle their centre of mass**, and the electron’s mass is replaced by the reduced mass $\mu$:

$$E_n = -\frac{\mu}{m_e}\,\frac{Z^2}{n^2}\,R_\infty hc, \qquad \mu = \frac{mM}{m + M}$$

That 0.05% correction separates hydrogen’s spectral lines from deuterium’s — which is how deuterium was discovered — halves every energy of positronium, and makes a muon’s orbit 186 times smaller than an electron’s. At large $n$, Bohr’s photon frequencies merge with the classical orbital frequency: the **correspondence principle**.

> The first look at hydrogen’s levels and lines was [Atomic spectra and the Bohr model](#/lesson/phys2220.A1.1). Remember that the orbits are a historical model; the energies survive in quantum mechanics (module MP8).`,
  symbols: [
    { tex: 'E_n', text: 'the energy of level $n$, in eV, counted from the two particles at rest far apart; bound levels are negative' },
    { tex: 'n', text: 'the principal quantum number, 1, 2, 3, …: the angular momentum in units of $\\hbar$' },
    { tex: 'Z', text: 'the nucleus’s charge number: 1 for hydrogen, 2 for helium' },
    { tex: 'R_\\infty hc', text: t`the Rydberg energy, $${fmt(RYD, 8)}$ eV — hydrogen’s ionization energy if its nucleus were infinitely heavy` },
    { tex: '\\mu', text: 'the reduced mass of the pair, which replaces the electron’s mass in every Bohr formula' },
    { tex: 'm,\\ M', text: 'the masses of the orbiting particle (an electron, or a muon) and of the nucleus' },
    { tex: 'm_e', text: t`the electron’s mass, $9.109\times10^{-31}$ kg; $R_\infty hc$ is computed with it` },
  ],
  why: 'Reduced-mass shifts are how isotopes are told apart in starlight and how exotic atoms — positronium, muonic hydrogen — test quantum electrodynamics and measure the proton’s size; the correspondence principle is the first bridge between quantum and classical physics.',
  visual: {
    type: 'graph',
    title: 'Two bodies, one centre of mass',
    lead: t`In Bohr’s picture neither body sits still: the electron and the nucleus both circle their common centre of mass, on opposite sides of it. Bohr’s formulas still hold for their separation if the electron’s mass is replaced by $\mu = m_eM/(m_e + M)$. Change the nucleus’s mass and watch $\mu$ and the spectrum.`,
    tasks: [
      'Set M = 1 electron mass — positronium, an electron and a positron: both circle the centre at equal distances, μ = mₑ/2, and E₁ halves to −6.80 eV.',
      'Set M = 1836 (hydrogen): the proton barely moves, yet its wobble shifts Lyman-α by 0.05%. Try 3670 (deuterium): the line moves 0.033 nm shorter.',
      'Drag the angle: the two bodies stay on opposite sides, the line between them always through the centre of mass.',
    ],
    params: twoBody('M', 'a', {
      sliders: [
        { key: 'M', label: 'Nucleus mass $M$', min: 1, max: 10000, value: 1836.15, logScale: true, unit: 'm_e', explain: 'In electron masses: 1 for a positron, 1836 for a proton, 3670 for a deuteron, 7294 for an alpha.' },
        { key: 'a', label: 'Angle round the orbit', min: 0, max: 360, step: 1, value: 35, unit: '^\\circ', explain: 'Where the pair is in its orbit.' },
      ],
      readouts: [
        { label: '$\\mu/m_e$', expr: 'M/(M + 1)', digits: 7 },
        { label: '$E_1$', expr: `-${r6(RYD)}*M/(M + 1)`, unit: '\\mathrm{eV}', digits: 5 },
        { label: 'Lyman-α (2 → 1)', expr: `${r6(lam(1, 2, 1))}*(M + 1)/M`, unit: '\\mathrm{nm}', digits: 7 },
        { label: 'Bohr radius', expr: `${r6(A0 * 1e12)}*(M + 1)/M`, unit: '\\mathrm{pm}', digits: 5 },
      ],
    }),
    caption: 'Bohr’s orbit with both bodies moving, for an electron and a nucleus of mass M; sizes of the dots not to scale. Energies and wavelengths ignore fine structure (parts in 10⁵). Quantum mechanics replaces the orbits with clouds, but the reduced mass enters it in exactly the same way.',
  },
  example: {
    prompt: t`Hydrogen’s red Hα line comes from the jump $n = 3 \to 2$. Find its vacuum wavelength for ordinary hydrogen and for deuterium, whose nucleus has twice the mass, and the shift between them. ($R_\infty = 1.097\,373\,157\times10^{7}\ \text{m}^{-1}$; $m_p/m_e = 1836.15$, $m_d/m_e = 3670.48$.)`,
    visual: pairLines('The Hα line of a hydrogen sample containing a little deuterium, close up: the heavier isotope’s line sits slightly to the short-wavelength side. Heights and widths illustrative.'),
    steps: [
      { label: 'Reduced masses', text: t`$\dfrac{\mu_\text{H}}{m_e} = \dfrac{1}{1 + m_e/m_p} = ${fmt(MU.H, 7)}$ and $\dfrac{\mu_\text{D}}{m_e} = \dfrac{1}{1 + m_e/m_d} = ${fmt(MU.D, 7)}$.` },
      { label: 'The line', text: t`$\dfrac{1}{\lambda} = \dfrac{\mu}{m_e}\,R_\infty\left(\dfrac1{2^2} - \dfrac1{3^2}\right) = \dfrac{5}{36}\,\dfrac{\mu}{m_e}\,R_\infty$, so $\lambda_\text{H} = ${fmt(lam(MU.H, 3, 2), 7)}$ nm and $\lambda_\text{D} = ${fmt(lam(MU.D, 3, 2), 7)}$ nm (in vacuum; tables measured in air quote 656.28 nm for hydrogen).` },
      { label: 'The shift', text: t`$\Delta\lambda = ${fmt(lam(MU.H, 3, 2) - lam(MU.D, 3, 2), 3)}$ nm, deuterium to the short side. As a fraction, $\Delta\lambda/\lambda \approx m_e/m_p - m_e/m_d \approx m_e/2m_p = ${tex(0.5 / MP_ME, 3)}$.` },
      { label: 'History', text: t`In 1931 Harold Urey, Ferdinand Brickwedde and George Murphy concentrated the heavy isotope by evaporating liquid hydrogen and found faint companions to the Balmer lines at exactly these shifted wavelengths: deuterium’s discovery, and Urey’s Nobel Prize in 1934.` },
      { label: 'Sense check', text: t`A shift of 0.18 nm in 656 nm is three parts in ten thousand — tiny, but larger than the widths of the lines from a cooled discharge, so the two lines can be resolved.` },
    ],
    answer: t`$\lambda_\text{H} = ${fmt(lam(MU.H, 3, 2), 7)}$ nm, $\lambda_\text{D} = ${fmt(lam(MU.D, 3, 2), 7)}$ nm: deuterium’s line is $${fmt(lam(MU.H, 3, 2) - lam(MU.D, 3, 2), 3)}$ nm shorter.`,
  },
  practice: [
    num({
      id: 'bohr-speed', difficulty: 1,
      gen(r) {
        const [Z, ion] = r.pick([[1, 'hydrogen'], [2, 'the helium ion He⁺'], [3, 'the lithium ion Li²⁺']]), n = r.pick([1, 2, 3]);
        const v = (Z * ALPHA * C) / n;
        return {
          prompt: t`In Bohr’s model, how fast does the electron of ${ion} ($Z = ${Z}$) move in the level $n = ${n}$, in km/s?`,
          answer: v / 1000, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: (Z * ALPHA * C * n) / 1000, feedback: t`The speed falls with $n$: $v_n = Z\alpha c/n$.` }, { value: (ALPHA * C) / n / 1000, feedback: t`The nucleus’s charge $Z$ multiplies the speed: $v_n = Z\alpha c/n$.` }].filter((e) => Math.abs(e.value - v / 1000) > 0.01 * (v / 1000)),
          hints: [t`$L = m v r = n\hbar$ with $r_n = n^2a_0/Z$ gives $v_n = Z\alpha c/n$, where $\alpha = 1/137.036$ is the fine-structure constant.`, t`$v = ${Z}\times\dfrac{2.998\times10^{5}\ \text{km/s}}{137.036\times${n}}$.`],
          teach: 'In Bohr’s model the ground-state electron of hydrogen moves at αc, about c/137; vₙ = Zαc/n.',
          explain: t`$v = \dfrac{${Z}\times2.998\times10^5}{137.036\times${n}}\ \text{km/s} = ${fmt(v / 1000, 4)}$ km/s, or $${fmt((Z * ALPHA) / n, 3)}c$. Small enough that Newton’s mechanics is a fair first approximation — the relativistic corrections, of order $(Z\alpha)^2$, are the fine structure. (The speed does not depend on the reduced mass.)`,
          visual: orbitPic(),
        };
      },
    }),
    num({
      id: 'exotic-lyman', difficulty: 2,
      gen(r) {
        const [what, m, Z, note] = r.pick([
          ['positronium — an electron bound to a positron', MU.Ps, 1, 'Positronium’s levels are half of hydrogen’s, so its lines are twice as long.'],
          ['the helium ion He⁺ ($Z = 2$, nucleus 7294 electron masses)', MU.He, 2, 'Four times hydrogen’s energies, so a quarter of the wavelength: far ultraviolet.'],
        ]);
        const l = lam(m, 2, 1, Z);
        return {
          prompt: t`What is the wavelength of the Lyman-α photon ($n = 2 \to 1$) of ${what}, in nm? (Use $R_\infty hc = 13.6057$ eV and $hc = 1239.84$ eV nm; include the reduced mass.)`,
          answer: l, units: 'nm', tol: { rel: 0.002 },
          errors: [{ value: lam(1, 2, 1, Z), feedback: t`That treats the nucleus as infinitely heavy. Multiply the energies by $\mu/m_e = ${fmt(m, 6)}$.` }].filter((e) => Math.abs(e.value - l) > 0.003 * l),
          hints: [t`$\mu/m_e = ${fmt(m, 6)}$; the photon carries $\dfrac{\mu}{m_e}Z^2(13.6057\ \text{eV})\left(1 - \tfrac14\right)$.`, t`Then $\lambda = 1239.84\ \text{eV nm}/E$.`],
          teach: 'Every Bohr energy scales with the reduced mass and with Z², so hydrogen-like atoms have hydrogen’s spectrum, rescaled.',
          explain: t`$E = ${fmt(m, 6)}\times${Z * Z}\times13.6057\times0.75 = ${fmt(1239.841984 / l, 5)}$ eV, so $\lambda = ${fmt(l, 5)}$ nm. ${note}`,
          visual: twoBodyStill(m === MU.Ps ? 1 : MAC2 / MEC2, m === MU.Ps ? 'Positronium in Bohr’s picture: electron and positron, equal masses, circle their centre of mass at equal distances. Not to scale.' : 'He⁺ in Bohr’s picture: the alpha nucleus, 7294 electron masses, barely moves. Not to scale.'),
        };
      },
    }),
    num({
      id: 'isotope-shift', difficulty: 2,
      gen(r) {
        const [ni, nf, name] = r.pick([[2, 1, 'Lyman-α'], [4, 2, 'Hβ'], [5, 2, 'Hγ']]);
        const dl = (lam(MU.H, ni, nf) - lam(MU.D, ni, nf)) * 1000;
        return {
          prompt: t`Hydrogen’s ${name} line ($n = ${ni} \to ${nf}$) has vacuum wavelength ${fmt(lam(MU.H, ni, nf), 7)} nm. By how many picometres shorter is deuterium’s ${name} line? ($m_p/m_e = 1836.15$; $m_d/m_e = 3670.48$.)`,
          answer: dl, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: lam(MU.H, ni, nf) * 1000 * (1 / MP_ME), feedback: t`That uses $m_e/m_p$ alone. The shift is the *difference* of the two corrections: $\Delta\lambda/\lambda \approx m_e/m_p - m_e/m_d$.` }],
          hints: [t`$\lambda \propto 1/\mu$, so $\lambda_\text{D} = \lambda_\text{H}\,\mu_\text{H}/\mu_\text{D}$.`, t`$\mu_\text{H}/m_e = 1/(1 + 1/1836.15)$ and $\mu_\text{D}/m_e = 1/(1 + 1/3670.48)$.`],
          teach: 'An isotope’s lines shift by the ratio of the reduced masses: heavier nuclei, slightly shorter wavelengths.',
          explain: t`$\lambda_\text{D} = ${fmt(lam(MU.H, ni, nf), 7)}\times\dfrac{${fmt(MU.H, 7)}}{${fmt(MU.D, 7)}} = ${fmt(lam(MU.D, ni, nf), 7)}$ nm, so $\Delta\lambda = ${fmt(dl, 3)}$ pm — about $${tex((MU.D - MU.H) / MU.D, 2)}$ of the wavelength. Astronomers use exactly this shift to measure the deuterium left over from the Big Bang in distant gas clouds.`,
          visual: pairLines(),
        };
      },
    }),
    mcq({
      id: 'positronium-why', difficulty: 2,
      prompt: 'Positronium is an electron bound to a positron, which has the same mass as an electron. Why are its energy levels half of hydrogen’s?',
      choices: [
        'Both particles move about their centre of mass, so the reduced mass is mₑ/2 and every Bohr energy halves',
        'The positron’s charge is half the proton’s',
        'Two particles share the binding energy, so each gets half',
        'Positronium is twice as big, and Coulomb energy goes as 1/r',
      ],
      answer: 0,
      why: {
        1: 'A positron’s charge is +e, exactly the proton’s; only its mass differs.',
        2: 'The binding energy belongs to the pair as a whole; the halving comes from the reduced mass in the formula, not from splitting it.',
        3: 'It is twice as big, but that is a second consequence, not the cause: the reduced mass both doubles the size and halves the energy.',
      },
      hints: [t`$E_n \propto \mu$, with $\mu = m_eM/(m_e + M)$. What is $\mu$ when $M = m_e$?`],
      teach: 'With equal masses the reduced mass is half of either, so positronium has half of hydrogen’s energies and twice its size.',
      explain: t`$\mu = m_e\cdot m_e/(2m_e) = m_e/2$, so $E_n = -6.80\ \text{eV}/n^2$ and the separation is $2n^2a_0$. Positronium lives only 0.1 ns (or 142 ns, depending on the spins) before annihilating — long enough for its spectrum to be measured precisely.`,
      visual: twoBodyStill(1, 'Positronium in Bohr’s picture: equal masses circling their centre of mass at equal distances. Not to scale.'),
    }),
    num({
      id: 'correspondence', difficulty: 3,
      gen(r) {
        const n = r.pick([5, 10, 20, 50, 100]);
        const ratio = (n * (2 * n - 1)) / (2 * (n - 1) ** 2);
        return {
          prompt: t`In Bohr’s model of hydrogen (nucleus infinitely heavy) the electron in level $n$ goes round $f_\text{orb} = 2R_\infty c/n^3$ times per second, while the photon from the jump $n \to n - 1$ has frequency $f = R_\infty c\left[\dfrac{1}{(n-1)^2} - \dfrac{1}{n^2}\right]$. What is the ratio $f/f_\text{orb}$ for $n = ${n}$? Give four decimal places.`,
          answer: ratio, tol: { rel: 0, abs: 0.0005 * ratio },
          errors: [{ value: 1, feedback: 'The two agree only in the limit of very large n; at any finite n they differ a little. Compute the ratio exactly.' }].filter(() => Math.abs(ratio - 1) > 0.002),
          hints: [t`The $R_\infty c$ cancels: $\dfrac{f}{f_\text{orb}} = \dfrac{n^3}{2}\left[\dfrac{1}{(n-1)^2} - \dfrac{1}{n^2}\right]$.`, t`Simplify: $\dfrac{1}{(n-1)^2} - \dfrac{1}{n^2} = \dfrac{2n - 1}{n^2(n-1)^2}$, so the ratio is $\dfrac{n(2n - 1)}{2(n - 1)^2}$.`],
          teach: 'At large n the light from a jump to the next level has the frequency of the classical orbit: Bohr’s rule and classical radiation agree, the correspondence principle.',
          explain: t`$\dfrac{f}{f_\text{orb}} = \dfrac{${n}\times${2 * n - 1}}{2\times${(n - 1) ** 2}} = ${fmt(ratio, 5)}$ — within ${fmt(100 * (ratio - 1), 2)}% of 1. The difference shrinks like $3/2n$: for large $n$ a jump to the neighbouring level emits light at the frequency a classical electron would radiate at, exactly as Bohr demanded of any quantum theory.`,
          visual: corrGraph(n),
        };
      },
    }),
    num({
      id: 'muonic-lead', difficulty: 3,
      prompt: t`A muon (207 times heavier than an electron) captured by a lead nucleus ($Z = 82$, rest energy $${tex(MPB, 6)}$ MeV) falls to its lowest Bohr level. What is that level’s radius in Bohr’s model, in fm? (Muon rest energy ${fmt(MMUC2, 7)} MeV; $a_0 = 52\,918$ fm.)`,
      answer: A0FM / mu(MMUC2, MPB) / 82, units: 'fm', tol: { rel: 0.01 },
      errors: [{ value: A0FM / 82, feedback: 'Replace the electron’s mass by the muon’s (reduced) mass: the orbit shrinks by about 207.' }, { value: A0FM / mu(MMUC2, MPB), feedback: t`The radius also shrinks by $Z$: $r_1 = a_0(m_e/\mu)/Z$.` }],
      hints: [t`$r_1 = \dfrac{m_e}{\mu}\,\dfrac{a_0}{Z}$, with $\mu$ the muon–nucleus reduced mass.`, t`$\mu/m_e = \dfrac{105.658}{0.510999}\times\dfrac{1}{1 + 105.658/${tex(MPB, 4)}} = ${fmt(mu(MMUC2, MPB), 5)}$.`],
      teach: 'A heavy orbiting particle shrinks every Bohr radius by m/mₑ: a muon around a heavy nucleus orbits at nuclear distances.',
      explain: t`$r_1 = \dfrac{52\,918\ \text{fm}}{${fmt(mu(MMUC2, MPB), 5)}\times82} = ${fmt(A0FM / mu(MMUC2, MPB) / 82, 3)}$ fm — smaller than the lead nucleus itself, about $1.2\times208^{1/3} = ${fmt(1.2 * Math.cbrt(208), 2)}$ fm. The muon spends much of its time *inside* the nucleus, where the Coulomb field is no longer that of a point charge, so Bohr’s formula fails badly. That is useful: the energies of muonic X-rays measure how the nuclear charge is spread out.`,
      visual: {
        type: 'graph',
        params: frame([-11, 11], [-8, 8], {
          aspect: 'wide',
          shade: [{ fn: 'sqrt(max(0, 50.55 - x^2))', lower: '-sqrt(max(0, 50.55 - x^2))', from: -7.11, to: 7.11, color: 'bad', alpha: 0.25 }],
          curves: [circle(0, 0, 7.11, 'bad', 1.6)],
          points: [label(0, -7.11, 'lead nucleus, radius about 7.1 fm', 'bad', 0, 14, 'center'), label(8.2, 6.6, 'the muon’s lowest Bohr orbit: r = ?', 'accent', 0, 0, 'left')],
        }),
        caption: 'A lead-208 nucleus to scale (radius 1.2 ∛A fm). Where would the muon’s lowest Bohr orbit fall?',
      },
    }),
    multi({
      id: 'assumed', difficulty: 2,
      prompt: 'Which of these did Bohr assume, rather than derive?',
      choices: [
        t`The angular momentum is quantized: $L = n\hbar$`,
        'An electron in an allowed orbit does not radiate',
        t`A jump between levels emits one photon with $hf = E_i - E_f$`,
        t`The radii grow as $n^2$`,
        t`The energies go as $-1/n^2$`,
        'The value of the Rydberg constant',
      ],
      answer: [0, 1, 2],
      why: {
        3: t`Derived: combine $L = n\hbar$ with the Coulomb force supplying the centripetal force, and $r_n = n^2a_0/Z$ follows.`,
        4: 'Derived from the same two ingredients — the triumph of the model.',
        5: t`Derived: Bohr computed $R_\infty = m_ee^4/(8\varepsilon_0^2h^3c)$ from known constants and matched the measured value — the strongest early evidence for the model.`,
      },
      hints: ['The postulates are the parts with no classical justification; everything else Bohr calculated from them with Coulomb’s law and Newton’s.'],
      teach: 'Bohr postulated quantized angular momentum, non-radiating orbits and photon jumps; the radii, energies and Rydberg constant then followed.',
      explain: 'Bohr’s three postulates — quantized angular momentum, stationary orbits that do not radiate, and one photon per jump — contradicted classical physics openly. From them and classical mechanics he derived the n² radii, the −1/n² energies and the Rydberg constant itself, to within the accuracy of the constants of 1913.',
      visual: orbitPic('Bohr’s 1913 picture of hydrogen: an electron on a circular orbit around the proton. Not to scale; the orbits are a historical model.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-recombination', difficulty: 3, transfer: true,
      prompt: t`Radio astronomers map clouds of ionized hydrogen around young stars using “radio recombination lines”: electrons recaptured into very high levels cascade down one level at a time. What is the frequency of the H109α line, the jump $n = 110 \to 109$, in GHz? ($R_\infty c = 3.289\,842\times10^{15}$ Hz; include hydrogen’s reduced mass, $\mu/m_e = 0.999\,456$.)`,
      answer: (RC * MU.H * (1 / 109 ** 2 - 1 / 110 ** 2)) / 1e9, units: 'GHz', tol: { rel: 0.002 },
      errors: [{ value: (RC * MU.H * (1 / 110 ** 2)) / 1e9, feedback: 'The photon carries the difference between the two levels: subtract 1/110² from 1/109².' }],
      hints: [t`$f = \dfrac{\mu}{m_e}R_\infty c\left(\dfrac{1}{109^2} - \dfrac{1}{110^2}\right)$.`, t`$\dfrac{1}{109^2} - \dfrac{1}{110^2} = ${tex(1 / 109 ** 2 - 1 / 110 ** 2, 5)}$.`],
      teach: 'Jumps between neighbouring high levels emit radio waves; at such n the photon frequency is almost the orbital frequency.',
      explain: t`$f = 0.999\,456\times3.289\,842\times10^{15}\times${tex(1 / 109 ** 2 - 1 / 110 ** 2, 5)} = ${fmt((RC * MU.H * (1 / 109 ** 2 - 1 / 110 ** 2)) / 1e9, 5)}$ GHz, a 6 cm radio wave (the catalogued frequency is 5008.923 MHz). An atom in level 110 has a radius of $110^2a_0 \approx ${fmt((110 * 110 * A0 * 1e6) / MU.H, 2)}\ \mu\text{m}$ — about the size of a bacterium — and survives only in the near-vacuum of interstellar space.`,
      visual: corrGraph(110, 'Photon and orbital frequencies against n (Bohr’s model, nucleus fixed). At n = 110 the two curves have merged: the line is almost exactly the orbital frequency.'),
    }),
    num({
      id: 'cp-muonic-h', difficulty: 2,
      prompt: t`In muonic hydrogen a muon (rest energy 105.658 MeV) replaces the electron around a proton (938.272 MeV). By what factor is its Bohr radius smaller than ordinary hydrogen’s? ($m_ec^2 = 0.511\,00$ MeV.)`,
      answer: MU.muH / MU.H, tol: { rel: 0.003 },
      errors: [{ value: MMUC2 / MEC2, feedback: 'That is the ratio of the bare masses. The radius goes as 1/μ, and the muon’s reduced mass with the proton is 10% below its own mass.' }],
      hints: [t`$a \propto 1/\mu$, so the factor is $\mu_{\mu p}/\mu_{ep}$.`, t`$\mu_{\mu p} = \dfrac{105.658\times938.272}{105.658 + 938.272}$ MeV and $\mu_{ep} \approx 0.510\,72$ MeV.`],
      teach: 'Every Bohr radius goes as 1/μ, so a muonic atom is about 186 times smaller than the ordinary one.',
      explain: t`$\mu_{\mu p} = ${fmt(mu(MMUC2, MPC2) * MEC2, 5)}$ MeV $= ${fmt(MU.muH, 5)}\,m_e$, so the factor is $${fmt(MU.muH, 5)}/${fmt(MU.H, 6)} = ${fmt(MU.muH / MU.H, 4)}$: radius $${fmt(A0FM / MU.muH, 3)}$ fm. Its muon spends far more time near the proton, so its levels feel the proton’s size; in 2010 muonic-hydrogen spectroscopy gave a proton radius of 0.84 fm, starting the “proton radius puzzle”.`,
      visual: twoBodyStill(MPC2 / MMUC2, 'Muonic hydrogen in Bohr’s picture: the proton is only 8.9 times heavier than the muon, so it wobbles visibly. Not to scale.'),
    }),
    mcq({
      id: 'cp-correspondence', difficulty: 2,
      prompt: 'Which statement is the correspondence principle?',
      choices: [
        'For large quantum numbers, quantum predictions must agree with classical physics — so at large n the light from a jump to the next level has the classical orbital frequency',
        'Every quantum level corresponds to exactly one classical orbit, at every n',
        'Atoms emit light at the frequency of the electron’s orbit, at every n',
        'Quantum and classical physics agree only for the ground state',
      ],
      answer: 0,
      why: {
        1: 'At small n the orbits and their frequencies have nothing classical about them: for n = 2 the photon’s frequency is three times the orbit’s.',
        2: 'That was the classical expectation; it fails badly at small n, where the photon frequency differs from the orbital frequency.',
        3: 'The ground state is the most quantum of all; agreement comes at large n.',
      },
      hints: ['Where do quantum effects fade: at small quantum numbers or large ones?'],
      teach: 'A quantum theory must reproduce classical physics in the limit of large quantum numbers.',
      explain: 'Bohr used the principle to fix the constant in his model: requiring that, at large n, the photon from n → n − 1 has the orbital frequency gives the Rydberg constant. Today it is a test any quantum theory must pass.',
      visual: corrGraph(null),
    }),
  ],
  sources: [
    { label: 'Bohr (1913), On the constitution of atoms and molecules, Phil. Mag. 26, 1', url: 'https://doi.org/10.1080/14786441308634955' },
    { label: 'Urey, Brickwedde & Murphy (1932), A hydrogen isotope of mass 2, Phys. Rev. 39, 164', url: 'https://doi.org/10.1103/PhysRev.39.164' },
    { label: 'Pohl et al. (2010), The size of the proton, Nature 466, 213', url: 'https://doi.org/10.1038/nature09250' },
    { label: 'CODATA 2022 recommended values (NIST): Rydberg constant, mass ratios', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
