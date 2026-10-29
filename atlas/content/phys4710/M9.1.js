// Why the Schrödinger equation is not relativistic — a teaser (Griffiths,
// Introduction to Elementary Particles ch. 7; Sakurai, Advanced QM ch. 3).
// The Schrödinger equation quantizes E = p²/2m; quantizing E² = p²c² + m²c⁴
// gives the Klein–Gordon equation, with three problems as a one-particle
// wave equation: negative-energy solutions with no floor, a conserved density
// ρ ∝ Re(iψ*∂ₜψ) that is not positive, and no consistent localization below
// the Compton wavelength ħ/mc (pair creation). Dirac's first-order equation
// (1928) restored a positive density and predicted spin ½ with g = 2, the
// fine structure (2p₃/₂ − 2p₁/₂ = 10.95 GHz from the Dirac formula, measured
// 10.97 GHz with QED corrections) and antimatter (Anderson's positron, 1932);
// the full resolution is quantum field theory, where Klein–Gordon is a fine
// equation for spin-0 fields. Size of the corrections: (γ − 1)/(v²/2c²) for
// hydrogen's electron (v ≈ αc), the order α² of fine structure. Transfer:
// gold's 1s electron (v ≈ Zαc, γ ≈ 1.22, a Bohr-model estimate), the root of
// relativistic chemistry.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { ALPHA, HBARC_EVNM, MEC2_EV, r6 } from './_q2b.js';
import { MPC2, MPIC2, MMUC2 } from '../phys2710/_constants.js';

const t = String.raw;
const dirac = (n, j) => { const k = j + 0.5, d = k - Math.sqrt(k * k - ALPHA * ALPHA); return MEC2_EV / Math.sqrt(1 + (ALPHA / (n - d)) ** 2); };
const FS2 = (dirac(2, 1.5) - dirac(2, 0.5)) / 4.135667696e-15 / 1e9;      // GHz
const dispPic = (caption, { p = null, nr = true } = {}) => ({
  type: 'graph',
  params: {
    x: [-3, 3], y: [-3.6, 3.6], aspect: 'wide', xlabel: 'momentum pc / mc²', ylabel: 'energy E / mc²', axesAt: 'edge', xticks: 6, yticks: 6,
    curves: [
      { fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.6, label: 'E = +√(p²c² + m²c⁴)', labelAt: 1.6, labelDx: 8, labelDy: 10 },
      { fn: '-sqrt(1 + x^2)', color: 'bad', width: 2.6, label: 'E = −√(p²c² + m²c⁴)', labelAt: 1.6, labelDx: 8, labelDy: -10 },
      ...(nr ? [{ fn: '1 + x^2/2', color: 'gold', width: 2, dash: [6, 4], label: 'mc² + p²/2m', labelAt: -2.2, labelDx: -40, labelDy: -12 }] : []),
    ],
    shade: [{ fn: '1', lower: '-1', from: -3, to: 3, color: 'ink4', alpha: 0.15 }],
    ...(p !== null ? { points: [{ x: p, y: r6(Math.sqrt(1 + p * p)), color: 'accent' }, { x: p, y: r6(-Math.sqrt(1 + p * p)), color: 'bad' }] } : {}),
  },
  caption,
});

export default lesson({
  id: 'phys4710.M9.1',
  title: 'Why the Schrödinger equation is not relativistic',
  minutes: 14, difficulty: 3, kind: 'concept',
  intro: t`The Schrödinger equation is $E = p^2/2m$ turned into operators. Special relativity says $E^2 = p^2c^2 + m^2c^4$; turning *that* into operators gives the **Klein–Gordon equation**:

$$\begin{gathered} \frac{1}{c^2}\frac{\partial^2\psi}{\partial t^2} - \nabla^2\psi + \frac{m^2c^2}{\hbar^2}\psi = 0 \end{gathered}$$

It is perfectly Lorentz-invariant, and as a theory of one particle it fails: it has negative-energy solutions with no bottom, a “probability” that can go negative, and no way to confine a particle more tightly than its Compton wavelength without creating new particles. Dirac’s answer (1928) predicted the electron’s spin and antimatter; the full answer is quantum field theory.`,
  symbols: [
    { tex: '\\psi(\\vec r, t)', text: 'the wave function (later reinterpreted as a field)' },
    { tex: 'c', text: 'the speed of light' },
    { tex: '\\nabla^2', text: 'the Laplacian, ∂²/∂x² + ∂²/∂y² + ∂²/∂z²' },
    { tex: 'm', text: 'the particle’s rest mass' },
    { tex: '\\frac{\\hbar}{mc}', text: 'the reduced Compton wavelength: 386 fm for the electron, 0.21 fm for the proton — where single-particle quantum mechanics ends' },
  ],
  why: 'Relativistic quantum mechanics explains spin, fine structure and antimatter, and its failures as a one-particle theory are why physics needed quantum fields — the road toward the Standard Model and quantum gravity.',
  visual: {
    type: 'graph',
    title: 'Two branches of energy',
    lead: t`Relativistic energy against momentum, in units of $mc^2$. The Schrödinger equation knows only the gold parabola; Klein–Gordon has both blue and red branches, separated by a gap of $2mc^2$ (shaded).`,
    tasks: [
      'At small momentum the gold parabola hugs the blue curve: the Schrödinger equation is the low-speed limit.',
      'Slide p up to 1 (pc = mc²): the parabola overestimates the kinetic energy by 21%. Relativity cannot be ignored.',
      'The red branch has no bottom: a particle could fall forever, radiating. Dirac’s fix was to fill it — and holes in the filled sea are antiparticles.',
    ],
    params: {
      ...dispPic('').params,
      sliders: [{ key: 'p', label: t`Momentum $pc/mc^2$`, min: 0, max: 3, step: 0.01, value: 0.3, explain: 'The particle’s momentum in units of mc: 0.3 is about the speed of hydrogen’s electron times 40; 1 is where p c = mc².' }],
      points: [{ x: 'p', y: 'sqrt(1 + p^2)', color: 'accent' }, { x: 'p', y: '1 + p^2/2', color: 'gold' }, { x: 'p', y: '-sqrt(1 + p^2)', color: 'bad' }],
      readouts: [
        { label: t`exact $K/mc^2 = \sqrt{1 + p^2} - 1$`, expr: 'sqrt(1 + p^2) - 1', digits: 4 },
        { label: t`Schrödinger $p^2/2m$`, expr: 'p^2/2', digits: 4 },
        { label: 'overestimate', expr: '(p^2/2)/(sqrt(1 + p^2) - 1 + 1e-15) - 1', digits: 3 },
        { label: t`speed $v/c = p/\sqrt{1 + p^2}$`, expr: 'p/sqrt(1 + p^2)', digits: 3 },
      ],
    },
    caption: 'Free-particle energies, in units of mc² (so momentum is in units of mc). The shaded band of width 2mc² has no states; creating a particle–antiparticle pair costs at least that much.',
  },
  example: {
    prompt: t`Find the plane-wave solutions $\psi = Ae^{i(\vec k\cdot\vec r - \omega t)}$ of the Klein–Gordon equation, then compute its conserved density $\rho = \dfrac{i\hbar}{2mc^2}\Bigl(\psi^*\dfrac{\partial\psi}{\partial t} - \psi\dfrac{\partial\psi^*}{\partial t}\Bigr)$ for each. What goes wrong?`,
    visual: dispPic('The two branches of plane-wave solutions: positive energy (blue) and negative energy (red). Gold: the non-relativistic parabola.', { p: 1.2 }),
    steps: [
      { label: 'Substitute', text: t`$-\omega^2/c^2 + k^2 + m^2c^2/\hbar^2 = 0$, so $E = \hbar\omega = \pm\sqrt{p^2c^2 + m^2c^4}$ with $p = \hbar k$. Both signs solve it.` },
      { label: 'Negative energies', text: t`The negative branch has no lowest state: with any coupling to light, a particle could cascade down forever. A one-particle theory cannot simply discard it, because the positive solutions alone are not a complete set once interactions act.` },
      { label: 'The density', text: t`For the plane wave, $\partial_t\psi = -i\omega\psi$, so $\rho = \dfrac{i\hbar}{2mc^2}(-2i\omega)|A|^2 = \dfrac{E}{mc^2}|A|^2$.` },
      { label: 'Not a probability', text: t`$\rho$ is positive for $E > 0$ and negative for $E < 0$. Because the equation is second order in time, $\psi$ and $\partial_t\psi$ can be chosen independently at $t = 0$, so $\rho$ can be negative anywhere. It is conserved, but it is a charge density, not a probability.` },
      { label: 'Localization', text: t`Squeeze a particle into $\Delta x \lesssim \hbar/mc$ and $\Delta p\,c \gtrsim mc^2$: enough energy to make pairs. For the electron $\hbar/mc = ${fmt(HBARC_EVNM / MEC2_EV * 1e6, 4)}$ fm. Below that, “one particle” is no longer a fixed number.` },
      { label: 'The way out', text: t`Dirac found a first-order equation (1928) with a positive density; it predicted spin ½ with $g = 2$, hydrogen’s fine structure and, from its negative energies, the positron (seen by Anderson in 1932). In quantum field theory, Klein–Gordon is fine again — as the equation of a spin-0 field such as the pion or the Higgs, with $\rho$ a charge density.` },
    ],
    answer: t`$E = \pm\sqrt{p^2c^2 + m^2c^4}$ and $\rho = (E/mc^2)|A|^2$: negative for the negative-energy branch, so Klein–Gordon cannot be a one-particle probability theory.`,
  },
  practice: [
    num({
      id: 'error', difficulty: 2,
      gen(r) {
        const [what, beta] = r.pick([['hydrogen’s electron, v ≈ αc', ALPHA], ['an electron at v = 0.1c', 0.1], ['an electron at v = 0.5c', 0.5], ['a proton at v = 0.3c', 0.3]]);
        const g = 1 / Math.sqrt(1 - beta * beta), Kx = g - 1, Knr = beta * beta / 2, ans = (Kx - Knr) / Kx;
        return {
          prompt: t`For ${what}, by what fraction does the Schrödinger kinetic energy $\tfrac12mv^2$ fall short of the true relativistic $(\gamma - 1)mc^2$? Give $\bigl[(\gamma - 1) - \tfrac12\beta^2\bigr]/(\gamma - 1)$ with $\beta = v/c$.`,
          visual: dispPic('Exact (blue) and non-relativistic (gold, dashed) energies; the gap between them grows with momentum.', {}),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: beta * beta, feedback: t`For small $\beta$ the fraction is about $\tfrac34\beta^2$, not $\beta^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\gamma = 1/\sqrt{1 - \beta^2}$; compute $\gamma - 1$ carefully (for tiny $\beta$, $\gamma - 1 \approx \tfrac12\beta^2 + \tfrac38\beta^4$).`, t`For small $\beta$ the answer is close to $\tfrac34\beta^2$.`],
          teach: 'Relativistic corrections to kinetic energy are of order v²/c²; for hydrogen, (αc)²/c² = α² — the size of fine structure.',
          explain: t`$\gamma - 1 = ${tex(Kx, 5)}$ and $\tfrac12\beta^2 = ${tex(Knr, 5)}$, so the shortfall is $${tex(ans, 3)}$. ${beta === ALPHA ? 'That is about α² × ¾: the relativistic part of hydrogen’s fine structure, which phys4700 treats by perturbation theory.' : 'At this speed the Schrödinger equation’s kinetic energy is noticeably wrong.'}`,
        };
      },
    }),
    num({
      id: 'compton', difficulty: 1,
      gen(r) {
        const [what, mc2] = r.pick([['an electron', MEC2_EV / 1e6], ['a muon', MMUC2], ['a charged pion', MPIC2], ['a proton', MPC2]]);
        const ans = (HBARC_EVNM * 1e6 / 1e6) / mc2;           // fm (ħc = 197.327 MeV fm)
        return {
          prompt: t`What is the reduced Compton wavelength $\hbar/mc$ of ${what} ($mc^2 = ${fmt(mc2, 6)}$ MeV), in fm? ($\hbar c = 197.327$ MeV fm.)`,
          visual: dispPic('Squeezing a particle below ħ/mc gives it momentum of order mc: enough energy to cross the 2mc² gap and make pairs.', { nr: false }),
          answer: ans, units: 'fm', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`That is $h/mc$; the reduced wavelength is $\hbar/mc$.` }],
          hints: [t`$\hbar/mc = \hbar c/mc^2$.`],
          teach: 'Below the Compton wavelength a particle cannot be localized without creating others: single-particle quantum mechanics stops there.',
          explain: t`$197.327/${fmt(mc2, 6)} = ${fmt(ans, 4)}$ fm. ${what === 'a charged pion' ? 'It is also the range of the nuclear force that pion exchange produces (Yukawa’s 1/μ).' : ''}`,
        };
      },
    }),
    mcq({
      id: 'rho', difficulty: 2,
      prompt: t`Why can the Klein–Gordon density $\rho$ be negative, when the Schrödinger density $|\psi|^2$ never is?`,
      visual: dispPic('Positive- and negative-energy branches of the Klein–Gordon equation.', { p: 0.8 }),
      choices: [
        t`The equation is second order in time, so $\rho$ involves $\partial_t\psi$, which can be chosen freely: for negative-energy waves $\rho = (E/mc^2)|A|^2 < 0$`,
        'Relativity allows probabilities to be negative',
        'The wave function becomes imaginary at high speed',
        t`$|\psi|^2$ is not Lorentz-invariant, so it must be replaced by $-|\psi|^2$`,
      ],
      answer: 0,
      why: {
        1: 'Probabilities are never negative; that is precisely why ρ cannot be one.',
        2: 'Wave functions are complex in any case; the problem is the time derivative in ρ.',
        3: t`The conserved current must be the time component of a four-vector; for a second-order equation that is $\propto \operatorname{Im}(\psi^*\partial_t\psi)$, not $|\psi|^2$ with a sign.`,
      },
      hints: ['Count the time derivatives in each equation. What do you need to specify at t = 0?'],
      teach: 'A second-order wave equation has a conserved charge, not a probability: Klein–Gordon describes charged spin-0 fields.',
      explain: t`With two time derivatives, the conserved quantity must include $\partial_t\psi$, and its sign follows the sign of the energy. In field theory this becomes charge: particles count $+1$, antiparticles $-1$.`,
    }),
    num({
      id: 'localize', difficulty: 3,
      gen(r) {
        const dx = r.pick([10, 50, 100, 386]);            // fm
        const dpc = HBARC_EVNM * 1e6 / 1e6 / dx;          // MeV (ħc/Δx)
        const ans = Math.sqrt(dpc * dpc + (MEC2_EV / 1e6) ** 2) - MEC2_EV / 1e6;    // kinetic energy, MeV
        return {
          prompt: t`An electron is confined within $\Delta x = ${dx}$ fm, so its momentum is uncertain by about $\Delta p = \hbar/\Delta x$. Estimate the kinetic energy $\sqrt{(\Delta p\,c)^2 + (m_ec^2)^2} - m_ec^2$, in MeV, and compare it with the pair-creation threshold $2m_ec^2 = 1.022$ MeV.`,
          visual: dispPic('The kinetic energy of the confined electron (blue) against the 2mc² gap (shaded).', { nr: false, p: Math.min(3, r6((HBARC_EVNM / dx) / (MEC2_EV / 1e6))) }),
          answer: ans, units: 'MeV', tol: { rel: 0.02 },
          errors: [{ value: dpc * dpc / (2 * MEC2_EV / 1e6), feedback: 'The momentum is not small compared with mc: use the relativistic energy, not p²/2m.' }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`$\Delta p\,c = \hbar c/\Delta x = 197.327\ \text{MeV fm}/${dx}\ \text{fm}$.`, t`$K = \sqrt{(\Delta p\,c)^2 + 0.511^2} - 0.511$ MeV.`],
          teach: 'Confining an electron within its Compton wavelength gives it energies comparable to mc², enough to create pairs: one-particle quantum mechanics breaks down.',
          explain: t`$\Delta p\,c = ${fmt(dpc, 4)}$ MeV, so $K \approx ${fmt(ans, 3)}$ MeV — ${ans > 1.022 ? 'above the pair threshold: the “one electron” picture fails.' : 'comparable to mc²: relativistic, and close to where pairs appear.'}`,
        };
      },
    }),
    mcq({
      id: 'dirac', difficulty: 2,
      prompt: t`Dirac’s equation (1928), first order in both time and space, predicted several things not put in by hand. Which is **not** one of them?`,
      visual: dispPic('Dirac’s equation keeps both energy branches; he reinterpreted the negative one.', {}),
      choices: [
        'The neutron, as a bound state of a proton and an electron',
        'Spin ½ with a magnetic moment g = 2',
        'The fine-structure splitting of hydrogen’s levels',
        'Antiparticles, from the negative-energy solutions',
      ],
      answer: 0,
      why: {
        1: 'This is a prediction: the electron’s spin and g = 2 come out automatically.',
        2: 'This is a prediction: Dirac’s energy formula reproduces the fine structure (to QED corrections).',
        3: 'This is a prediction: the positron was discovered by Anderson in 1932.',
      },
      hints: ['Three of these follow from solving the Dirac equation for an electron; one is not about electrons at all.'],
      teach: 'Dirac’s equation explained spin, g = 2 and fine structure, and forced antimatter on physics.',
      explain: t`The neutron (Chadwick, 1932) is a separate particle, not a proton–electron bound state — an idea the uncertainty principle rules out (see the localization problem). Dirac’s successes were spin ½, $g = 2$, fine structure and the positron.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gold', difficulty: 2, transfer: true,
      gen(r) {
        const [el, Z] = r.pick([['gold', 79], ['mercury', 80], ['silver', 47], ['copper', 29]]);
        const b = Z * ALPHA, ans = 1 / Math.sqrt(1 - b * b);
        return {
          prompt: t`In a heavy atom the innermost (1s) electron moves at about $v \approx Z\alpha c$ (a Bohr-model estimate). For ${el} ($Z = ${Z}$), what is its Lorentz factor $\gamma$?`,
          visual: dispPic('Relativistic (blue) against non-relativistic (gold) energy: inner electrons of heavy atoms sit well up the curve.', { p: r6(b / Math.sqrt(1 - b * b)) }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: 1 + (b * b) / 2, feedback: 'Use the exact γ = 1/√(1 − β²); at these speeds the small-β expansion is not accurate.' }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$\beta = Z\alpha = ${Z}/137.036$.`, t`$\gamma = 1/\sqrt{1 - \beta^2}$.`],
          teach: 'Inner electrons of heavy atoms are relativistic; the effects reach the outer shells and change chemistry.',
          explain: t`$\beta = ${fmt(b, 4)}$ and $\gamma = ${fmt(ans, 4)}$. ${Z >= 79 ? 'A heavier effective mass shrinks the s orbitals (by roughly 1/γ in this crude estimate); the contracted 6s and expanded 5d levels of gold shift its absorption into the blue, which is why gold is yellow while silver is white — a well-established result of relativistic quantum chemistry.' : el === 'silver' ? 'The correction is modest here, which is one reason silver is white rather than yellow.' : 'The correction is modest here: copper’s reddish colour owes little to relativity.'}`,
        };
      },
    }),
    num({
      id: 'cp-fs', difficulty: 3,
      gen(r) {
        const unit = r.pick(['GHz', 'ueV']);
        const ans = unit === 'GHz' ? FS2 : (dirac(2, 1.5) - dirac(2, 0.5)) * 1e6;
        return {
          prompt: t`Dirac’s energy levels for hydrogen are $E_{nj} = mc^2\Bigl[1 + \Bigl(\dfrac{\alpha}{n - \delta_j}\Bigr)^2\Bigr]^{-1/2}$ with $\delta_j = j + \tfrac12 - \sqrt{(j + \tfrac12)^2 - \alpha^2}$. Compute the splitting between $n = 2$, $j = 3/2$ and $n = 2$, $j = 1/2$, ${unit === 'GHz' ? 'as a frequency in GHz' : 'in μeV'}. (Ignore the reduced mass; $m_ec^2 = 510\,998.950$ eV, $\alpha = 1/137.036$.)`,
          visual: { type: 'graph', params: { x: [0, 3], y: [-0.4, 1.4], aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, grid: false, curves: [{ param: ['0.4 + 1.2*t', '0'], t: [0, 1], color: 'accent', width: 3 }, { param: ['0.4 + 1.2*t', '1'], t: [0, 1], color: 'violet', width: 3 }], points: [{ x: 1.7, y: 1, r: 0, label: 'n = 2, j = 3/2', color: 'violet', labelDx: 4, labelDy: 0 }, { x: 1.7, y: 0, r: 0, label: 'n = 2, j = 1/2', color: 'accent', labelDx: 4, labelDy: 0 }], arrows: [{ from: [1, 0.05], to: [1, 0.95], color: 'gold' }] }, caption: 'The two n = 2 fine-structure levels of hydrogen (spacing schematic).' },
          answer: ans, units: unit === 'GHz' ? 'GHz' : 'ueV', tol: { rel: 0.005 },
          errors: [],
          hints: [t`Compute $\delta_{1/2} = 1 - \sqrt{1 - \alpha^2}$ and $\delta_{3/2} = 2 - \sqrt{4 - \alpha^2}$, then the two energies; subtract carefully (keep many digits — the difference is $10^{-10}$ of $mc^2$).`, t`To leading order the answer is $\alpha^4mc^2/32$.`],
          teach: 'Dirac’s equation gives hydrogen’s fine structure in closed form; the leading term α⁴mc²/32 for n = 2 is about 45 μeV, 10.9 GHz.',
          explain: t`The splitting is $${fmt((dirac(2, 1.5) - dirac(2, 0.5)) * 1e6, 4)}\ \mu\text{eV}$, i.e. $${fmt(FS2, 4)}$ GHz. The measured interval is 10.97 GHz: the remaining 0.2% comes from quantum electrodynamics (the Lamb shift and the electron’s anomalous moment), which Dirac’s equation alone cannot give.`,
        };
      },
    }),
    mcq({
      id: 'cp-qft', difficulty: 2,
      prompt: t`How did physics ultimately resolve the problems of relativistic one-particle wave equations?`,
      visual: dispPic('Particle (blue) and antiparticle (red) branches.', { nr: false }),
      choices: [
        'By quantum field theory: ψ becomes a field operator that creates and destroys particles, negative-energy solutions describe antiparticles with positive energy, and particle number is no longer fixed',
        'By forbidding negative energies with an extra postulate',
        'By using only the Schrödinger equation with relativistic corrections',
        'By showing that relativity does not apply to quantum particles',
      ],
      answer: 0,
      why: {
        1: 'Simply forbidding them leaves an incomplete set of states and contradicts the observed antiparticles.',
        2: 'Perturbative corrections work at low speeds (fine structure) but cannot describe pair creation.',
        3: 'Relativity is tested to extreme precision for quantum particles, e.g. muon lifetimes in storage rings.',
      },
      hints: ['What happens to “the number of particles” above an energy of 2mc²?'],
      teach: 'Relativity plus quantum mechanics forces variable particle number: quantum field theory.',
      explain: t`Once pairs can be created, a wave function for a fixed number of particles cannot be the whole story. Quantum fields solve the Klein–Gordon or Dirac equation as operator equations; the negative-frequency parts create antiparticles of positive energy. This is the language of the Standard Model.`,
    }),
  ],
  sources: [
    { label: 'Dirac, “The quantum theory of the electron”, Proc. R. Soc. A 117, 610 (1928)', url: 'https://doi.org/10.1098/rspa.1928.0023' },
    { label: 'Anderson, “The positive electron”, Phys. Rev. 43, 491 (1933)', url: 'https://doi.org/10.1103/PhysRev.43.491' },
    { label: 'Pyykkö, “Relativistic effects in chemistry: more common than you thought”, Annu. Rev. Phys. Chem. 63, 45 (2012)', url: 'https://doi.org/10.1146/annurev-physchem-032511-143755' },
  ],
});
