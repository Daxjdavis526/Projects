// The uncertainty principle (Griffiths & Schroeter §1.6 and §3.5). Derived:
// Robertson’s σ_A σ_B ≥ |⟨[A, B]⟩|/2 from the Schwarz inequality, then
// [x, p] = iħ gives σ_x σ_p ≥ ħ/2. Checked: a Gaussian saturates it, a
// chirped Gaussian (what a free packet becomes) does not, nor do sech or
// triangle states (π/6 ħ and √(3/10) ħ); for spin, σ_Sx σ_Sy ≥ (ħ/2)|⟨S_z⟩|.
// phys2710.MP6.3 met the principle heuristically, with estimates; this lesson
// proves it and computes the products. Every number is computed here.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, M_RB87, HBARC_EVNM, blochPic, curvePic, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;

/** A chirped Gaussian ψ = exp(−(1 − ic)x²/4σ²): real part, imaginary part and |ψ|. */
const chirped = (c, s, caption) => ({
  type: 'graph',
  params: {
    x: [r6(-3.2 * s), r6(3.2 * s)], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'x', ylabel: 'ψ (scaled)', yticks: 4, xticks: 0,
    curves: [
      { fn: `exp(-x^2/(4*${r6(s * s)}))`, color: 'good', width: 1.6, dash: [5, 4] },
      { fn: `exp(-x^2/(4*${r6(s * s)}))*cos(${c}*x^2/(4*${r6(s * s)}))`, color: 'accent', width: 2.2 },
      { fn: `exp(-x^2/(4*${r6(s * s)}))*sin(${c}*x^2/(4*${r6(s * s)}))`, color: 'warn', width: 2, dash: [6, 4] },
    ],
    legend: [{ label: 'Re ψ', color: 'accent' }, { label: 'Im ψ', color: 'warn', dash: [6, 4] }, { label: '|ψ|', color: 'good', dash: [5, 4] }], legendAt: 'tr',
  },
  caption,
});

export default lesson({
  id: 'phys4700.M2.4',
  title: 'The uncertainty principle',
  minutes: 16, difficulty: 3,
  intro: t`Take many identically prepared systems, measure observable $A$ on some and $B$ on others, and the results scatter with standard deviations $\sigma_A$ and $\sigma_B$. The Schwarz inequality of [Complex vector spaces and inner products](#/lesson/phys4700.M0.1) puts a floor under their product, set by the **commutator** $[\hat A, \hat B] = \hat A\hat B - \hat B\hat A$:

$$\sigma_A\,\sigma_B \ge \tfrac12\big|\langle[\hat A, \hat B]\rangle\big|, \qquad \text{so} \qquad \sigma_x\,\sigma_p \ge \frac{\hbar}{2}$$

since $[\hat x, \hat p] = i\hbar$. This is the **Robertson inequality**, and it is a theorem about states, not about clumsy instruments: no wave function has both a sharp position and a sharp momentum, because a narrow $\psi(x)$ is built from a wide spread of wavenumbers. Gaussians, and only Gaussians without a chirp (a phase that grows as $x^2$), sit exactly on the bound. ([The uncertainty principle](#/lesson/phys2710.MP6.3) used it to estimate sizes and energies; here it is derived and checked.)`,
  symbols: [
    { tex: '\\sigma_A', text: t`the standard deviation of the results of measuring $A$: $\sigma_A^2 = \langle A^2\rangle - \langle A\rangle^2$` },
    { tex: '[\\hat A, \\hat B]', text: t`the commutator $\hat A\hat B - \hat B\hat A$: zero when the order of the two operators does not matter` },
    { tex: '\\langle\\cdot\\rangle', text: 'the expectation value in the state at hand' },
    { tex: '\\sigma_x,\\ \\sigma_p', text: 'the spreads of position (m) and of momentum (kg m/s) in the same state' },
    { tex: '\\hbar/2', text: t`the floor for position and momentum: $${tex(HBAR / 2, 4)}$ J s` },
  ],
  why: 'It sets the zero-point energy of every oscillator and atom, the size of atoms, and the noise floor of the most sensitive instruments ever built, from LIGO’s mirrors to atom interferometers.',
  visual: {
    type: 'graph',
    title: 'When is a Gaussian minimal?',
    lead: t`A Gaussian packet $\psi = e^{-(1 - ic)x^2/4\sigma^2}$. Its width $\sigma$ sets $\sigma_x$; its **chirp** $c$ is a phase that grows with $x^2$, the shape a free packet takes as it spreads. The readouts give the spreads and their product in units of $\hbar/2$.`,
    tasks: [
      'Keep c = 0 and change σ: the product stays exactly 1 × ħ/2. Squeezing x widens p to match.',
      'Turn up the chirp: |ψ| does not change at all, yet σₚ grows. A phase that varies across the packet is a spread of momenta.',
      'At c = 1 the product is √2 × ħ/2; a free packet reaches that when it has spread to √2 times its starting width.',
    ],
    params: {
      x: [-4, 4], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'x (nm)', ylabel: 'ψ (scaled)', yticks: 4,
      sliders: [
        { key: 's', label: 'Width $\\sigma$', min: 0.3, max: 1.5, step: 0.05, value: 0.8, unit: '\\text{nm}', explain: 'The position spread: |ψ|² is a Gaussian with standard deviation σ.' },
        { key: 'c', label: 'Chirp $c$', min: -3, max: 3, step: 0.1, value: 0, explain: 'A phase cx²/4σ² that grows away from the centre: momentum that differs from place to place.' },
      ],
      curves: [
        { fn: 'exp(-x^2/(4*s^2))', color: 'good', width: 1.6, dash: [5, 4] },
        { fn: 'exp(-x^2/(4*s^2))*cos(c*x^2/(4*s^2))', color: 'accent', width: 2.2 },
        { fn: 'exp(-x^2/(4*s^2))*sin(c*x^2/(4*s^2))', color: 'warn', width: 2, dash: [6, 4] },
      ],
      legend: [{ label: 'Re ψ', color: 'accent' }, { label: 'Im ψ', color: 'warn', dash: [6, 4] }, { label: '|ψ|', color: 'good', dash: [5, 4] }], legendAt: 'tr',
      readouts: [
        { label: '$\\sigma_x$ (nm)', expr: 's', digits: 3 },
        { label: '$\\sigma_p c$ (eV)', expr: `${r6(HBARC_EVNM)}*sqrt(1 + c^2)/(2*s)`, digits: 3 },
        { label: '$\\sigma_x\\sigma_p\\,/\\,(\\hbar/2)$', expr: 'sqrt(1 + c^2)', digits: 4 },
      ],
    },
    caption: t`Exact formulas for this family: $\sigma_x = \sigma$ and $\sigma_p = \tfrac{\hbar}{2\sigma}\sqrt{1 + c^2}$. The curves are drawn unnormalized, peaking at 1.`,
  },
  example: {
    prompt: t`Derive $\sigma_A\sigma_B \ge \tfrac12|\langle[\hat A, \hat B]\rangle|$ for Hermitian $\hat A$, $\hat B$, apply it to position and momentum, and check it on $\psi = (2\pi\sigma^2)^{-1/4}e^{-x^2/4\sigma^2}$.`,
    visual: curvePic({ fn: 'exp(-x^2/2)/sqrt(2*pi)', x: [-3.5, 3.5], y: [0, 0.46], xlabel: 'x / σ', ylabel: '|ψ|² (per σ)', shade: [-1, 1], caption: t`The Gaussian’s $|\psi|^2$, with $\pm\sigma_x$ shaded: 68% of position results fall there.` }),
    steps: [
      { label: 'Shift the operators', text: t`Let $\hat A' = \hat A - \langle A\rangle$, $\hat B' = \hat B - \langle B\rangle$, and $|f\rangle = \hat A'|\psi\rangle$, $|g\rangle = \hat B'|\psi\rangle$. Because $\hat A'$ is Hermitian, $\sigma_A^2 = \langle\psi|\hat A'^2|\psi\rangle = \langle f|f\rangle$; likewise $\sigma_B^2 = \langle g|g\rangle$.` },
      { label: 'Schwarz', text: t`$\sigma_A^2\sigma_B^2 = \langle f|f\rangle\langle g|g\rangle \ge |\langle f|g\rangle|^2 \ge \big(\operatorname{Im}\langle f|g\rangle\big)^2 = \left(\dfrac{\langle f|g\rangle - \langle g|f\rangle}{2i}\right)^2$.` },
      { label: 'The commutator', text: t`$\langle f|g\rangle - \langle g|f\rangle = \langle\psi|\hat A'\hat B' - \hat B'\hat A'|\psi\rangle = \langle[\hat A, \hat B]\rangle$: the constant shifts commute with everything and drop out. So $\sigma_A\sigma_B \ge \tfrac12|\langle[\hat A, \hat B]\rangle|$.` },
      { label: 'Position and momentum', text: t`On any $f(x)$: $[\hat x, \hat p]f = x(-i\hbar f') - (-i\hbar)(xf)' = -i\hbar xf' + i\hbar f + i\hbar xf' = i\hbar f$. So $[\hat x, \hat p] = i\hbar$ and $\sigma_x\sigma_p \ge \tfrac12|i\hbar| = \tfrac{\hbar}{2}$.` },
      { label: 'Check a Gaussian', text: t`$\sigma_x = \sigma$ by construction, $\langle p\rangle = 0$ (real $\psi$), and $\langle p^2\rangle = \hbar^2\int\psi'^2dx = \hbar^2\langle x^2\rangle/4\sigma^4 = \hbar^2/4\sigma^2$. So $\sigma_x\sigma_p = \sigma\cdot\tfrac{\hbar}{2\sigma} = \tfrac{\hbar}{2}$: exactly on the bound.` },
      { label: 'When equality holds', text: t`Both inequalities must be tight: $|g\rangle$ must be an imaginary multiple of $|f\rangle$, $(-i\hbar\partial_x)\psi = i a x\psi$ with real $a > 0$. That differential equation’s solution is the Gaussian; a chirp makes the multiple complex and breaks the equality.` },
    ],
    answer: t`$\sigma_A\sigma_B \ge \tfrac12|\langle[\hat A, \hat B]\rangle|$; with $[\hat x, \hat p] = i\hbar$, $\sigma_x\sigma_p \ge \hbar/2$, and the Gaussian gives exactly $\hbar/2$.`,
  },
  practice: [
    order({
      id: 'robertson-order', difficulty: 2,
      prompt: t`Put the steps of the uncertainty principle’s proof in order.`,
      items: [
        t`Write $\sigma_A^2 = \langle f|f\rangle$ and $\sigma_B^2 = \langle g|g\rangle$, with $|f\rangle = (\hat A - \langle A\rangle)|\psi\rangle$.`,
        t`Apply the Schwarz inequality: $\sigma_A^2\sigma_B^2 \ge |\langle f|g\rangle|^2$.`,
        t`Keep only the imaginary part: $|\langle f|g\rangle|^2 \ge \big(\operatorname{Im}\langle f|g\rangle\big)^2$.`,
        t`Recognise $2i\operatorname{Im}\langle f|g\rangle = \langle[\hat A, \hat B]\rangle$.`,
        t`Insert $[\hat x, \hat p] = i\hbar$: $\sigma_x\sigma_p \ge \hbar/2$.`,
      ],
      visual: curvePic({ fn: 'exp(-x^2/2)/sqrt(2*pi)', x: [-3.5, 3.5], y: [0, 0.46], xlabel: 'x / σ', ylabel: '|ψ|²', shade: [-1, 1], caption: t`The quantity being bounded: a spread, $\sigma_x$ (shaded), of position results — paired with the spread of momentum results in the same state.` }),
      hints: ['Start by expressing each spread as the length of a vector.', 'The commutator appears only once the imaginary part has been taken.'],
      teach: 'Spreads are lengths of vectors; the Schwarz inequality bounds their product by an overlap, whose imaginary part is the commutator.',
      explain: t`Lengths → Schwarz → imaginary part → commutator → $[\hat x, \hat p] = i\hbar$. Nothing in the chain mentions a measuring device: the bound is a property of the state.`,
    }),
    num({
      id: 'min-sigma-p', difficulty: 2,
      gen(r) {
        const s = r.pick([0.05, 0.1, 0.25, 0.5, 2]);
        const ans = HBARC_EVNM / (2 * s);
        return {
          prompt: t`An electron is in a Gaussian minimum-uncertainty state with $\sigma_x = ${s}$ nm. What is $\sigma_p c$, in eV? ($\hbar c = ${fmt(HBARC_EVNM, 6)}$ eV nm.)`,
          visual: curvePic({ fn: `exp(-x^2/(2*${r6(s * s)}))`, x: [r6(-3.5 * s), r6(3.5 * s)], y: [0, 1.15], ylabel: '|ψ|² (scaled)', shade: [-s, s], caption: t`$|\psi|^2$ with $\pm\sigma_x$ shaded.` }),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`At the bound $\sigma_x\sigma_p = \hbar/2$, so $\sigma_p = \hbar/(2\sigma_x)$: keep the 2.` }, { value: 2 * Math.PI * ans, feedback: t`Use $\hbar c$, not $hc$.` }],
          hints: [t`For a Gaussian, $\sigma_x\sigma_p = \hbar/2$ exactly.`, t`$\sigma_p c = \hbar c/(2\sigma_x)$.`],
          teach: t`A minimum-uncertainty packet has $\sigma_p = \hbar/(2\sigma_x)$: halve the width, double the momentum spread.`,
          explain: t`$\sigma_p c = \dfrac{${fmt(HBARC_EVNM, 5)}}{2\times${s}} = ${fmt(ans, 4)}$ eV. No state with this $\sigma_x$ can have a smaller $\sigma_p$.`,
        };
      },
    }),
    num({
      id: 'chirp-product', difficulty: 3,
      gen(r) {
        const c = r.pick([0.5, 0.75, 1, 1.5, 2, 3]);
        const ans = 0.5 * Math.sqrt(1 + c * c);
        return {
          prompt: t`$\psi = (2\pi\sigma^2)^{-1/4}\exp\!\left(-\dfrac{(1 - ${c}i)\,x^2}{4\sigma^2}\right)$ has the same $|\psi|$ as a plain Gaussian, so $\sigma_x = \sigma$. Find $\sigma_x\sigma_p$ in units of $\hbar$. (Use $\langle p^2\rangle = \hbar^2\int|\psi'|^2dx$ and $\langle x^2\rangle = \sigma^2$.)`,
          visual: chirped(c, 1, t`The chirped packet ($c = ${c}$): the phase winds faster away from the centre, under an unchanged envelope.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0.5, feedback: t`Only an unchirped Gaussian sits on the bound. The phase $e^{icx^2/4\sigma^2}$ adds momentum spread: $|\psi'|^2$ gains a factor $1 + c^2$.` }, { value: 0.5 * (1 + c * c), feedback: t`$\sigma_p$ scales as $\sqrt{1 + c^2}$, the square root of $\langle p^2\rangle$’s factor.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\psi' = -\dfrac{(1 - ${c}i)\,x}{2\sigma^2}\,\psi$, so $|\psi'|^2 = \dfrac{(1 + ${c * c})\,x^2}{4\sigma^4}|\psi|^2$.`, t`$\langle p\rangle = 0$, and $\langle p^2\rangle = \hbar^2(1 + c^2)/4\sigma^2$.`],
          teach: t`A phase that varies across the packet adds momentum spread: a chirped Gaussian has $\sigma_x\sigma_p = \tfrac{\hbar}{2}\sqrt{1 + c^2}$.`,
          explain: t`$\langle p^2\rangle = \hbar^2\dfrac{1 + ${c * c}}{4\sigma^4}\langle x^2\rangle = \dfrac{\hbar^2(1 + ${c * c})}{4\sigma^2}$, so $\sigma_x\sigma_p = \tfrac{\hbar}{2}\sqrt{1 + ${c * c}} = ${fmt(ans, 4)}\,\hbar$. A free Gaussian packet develops exactly this chirp as it spreads.`,
        };
      },
    }),
    num({
      id: 'sech-product', difficulty: 3,
      gen(r) {
        const k = r.pick([0, 2, 5, 10]), a = r.pick([0.2, 0.5, 1]);
        const ans = Math.PI / 6;
        return {
          prompt: t`A particle is in $\psi = \dfrac{1}{\sqrt{2a}}\operatorname{sech}\dfrac{x}{a}\,e^{i${k}x}$ with $a = ${a}$ nm. Given $\langle x^2\rangle = \pi^2a^2/12$, $\langle p\rangle = ${k === 0 ? '0' : t`${k}\hbar\ \text{nm}^{-1}`}$ and $\langle p^2\rangle = \hbar^2\big(${k * k}\ \text{nm}^{-2} + 1/3a^2\big)$, find $\sigma_x\sigma_p$ in units of $\hbar$.`,
          visual: curvePic({ fn: `1/(2*${a})/cosh(x/${a})^2`, x: [r6(-4 * a), r6(4 * a)], y: [0, r6(0.6 / a)], caption: t`$|\psi|^2 = \operatorname{sech}^2(x/a)/2a$: its tails are exponential, fatter than a Gaussian’s.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0.5, feedback: 'Only a Gaussian reaches ħ/2; the sech shape lies above it.' }, { value: Math.sqrt((Math.PI ** 2 / 12) * (k * k * a * a + 1 / 3)), feedback: t`Subtract $\langle p\rangle^2$: $\sigma_p^2 = \langle p^2\rangle - \langle p\rangle^2$. The kick $k_0$ moves the packet but adds no spread.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\sigma_p^2 = \langle p^2\rangle - \langle p\rangle^2 = \hbar^2/3a^2$, and $\langle x\rangle = 0$.`, t`$\sigma_x\sigma_p = \dfrac{\pi a}{\sqrt{12}}\cdot\dfrac{\hbar}{\sqrt3\,a}$.`],
          teach: t`Spreads subtract the mean: a momentum kick $e^{ik_0x}$ shifts $\langle p\rangle$ but leaves $\sigma_p$ alone.`,
          explain: t`$\sigma_x = \pi a/\sqrt{12}$ and $\sigma_p = \hbar/(\sqrt3\,a)$, so $\sigma_x\sigma_p = \tfrac{\pi}{6}\hbar = ${fmt(ans, 4)}\,\hbar$ — 5% above $\hbar/2$, whatever $a$ and $k_0$.`,
        };
      },
    }),
    num({
      id: 'spin-uncertainty', difficulty: 3,
      gen(r) {
        const th = r.pick([45, 60, 120, 135]), ph = r.pick([30, 45, 60]);
        const x = Math.sin(th * D) * Math.cos(ph * D), y = Math.sin(th * D) * Math.sin(ph * D), z = Math.cos(th * D);
        const ans = 0.25 * Math.sqrt((1 - x * x) * (1 - y * y)), bound = Math.abs(z) / 4;
        return {
          prompt: t`A spin is in $|{+n}\rangle$ with Bloch angles $\theta = ${th}^\circ$, $\phi = ${ph}^\circ$, so $\langle S_x\rangle = \tfrac{\hbar}{2}\sin\theta\cos\phi$, $\langle S_y\rangle = \tfrac{\hbar}{2}\sin\theta\sin\phi$ and $\langle S_z\rangle = \tfrac{\hbar}{2}\cos\theta$. Find $\sigma_{S_x}\sigma_{S_y}$ in units of $\hbar^2$. (Every spin-½ component squares to $\hbar^2/4$.)`,
          visual: blochPic({ states: [{ v: [x, y, z] }], caption: 'The state on the Bloch sphere. Drag to rotate.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: bound, feedback: t`That is the Robertson bound, $\tfrac{\hbar}{2}|\langle S_z\rangle|$ (with $[\hat S_x, \hat S_y] = i\hbar\hat S_z$). The product itself is at least that.` }, { value: 0.25, feedback: t`That is the largest possible product. Subtract the means: $\sigma_{S_x}^2 = \tfrac{\hbar^2}{4} - \langle S_x\rangle^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`$\sigma_{S_x} = \tfrac{\hbar}{2}\sqrt{1 - \sin^2\theta\cos^2\phi}$ and likewise for $y$.`, t`Multiply the two spreads.`],
          teach: t`For spin, $[\hat S_x, \hat S_y] = i\hbar\hat S_z$, so $\sigma_{S_x}\sigma_{S_y} \ge \tfrac{\hbar}{2}|\langle S_z\rangle|$ — a bound that depends on the state.`,
          explain: t`$\sigma_{S_x}\sigma_{S_y} = \tfrac{\hbar^2}{4}\sqrt{(1 - ${fmt(x * x, 3)})(1 - ${fmt(y * y, 3)})} = ${fmt(ans, 3)}\,\hbar^2$, above the bound $\tfrac{\hbar}{2}|\langle S_z\rangle| = ${fmt(bound, 3)}\,\hbar^2$. Unlike $\hbar/2$ for $x$ and $p$, this floor changes with the state, and vanishes when $\langle S_z\rangle = 0$.`,
        };
      },
    }),
    code({
      id: 'products-code', difficulty: 3,
      prompt: t`Check the uncertainty principle numerically, with $\hbar = 1$. Write \`spread_product(x, psi)\`, which normalizes \`psi\`, computes $\sigma_x$ from $\langle x\rangle$ and $\langle x^2\rangle$, computes $\sigma_p$ from $\langle p\rangle = \operatorname{Re}\int\psi^*(-i\psi')\,dx$ and $\langle p^2\rangle = \int|\psi'|^2dx$, and returns $\sigma_x\sigma_p$. Use \`np.gradient\` and \`np.trapezoid\`.`,
      starter: t`import numpy as np

x = np.linspace(-40, 40, 80001)

def spread_product(x, psi):
    pass

print(spread_product(x, np.exp(-x**2 / 4)))
`,
      answer: t`import numpy as np

x = np.linspace(-40, 40, 80001)

def spread_product(x, psi):
    psi = psi / np.sqrt(np.trapezoid(np.abs(psi) ** 2, x))
    rho = np.abs(psi) ** 2
    mx = np.trapezoid(x * rho, x)
    sx = np.sqrt(np.trapezoid((x - mx) ** 2 * rho, x))
    d = np.gradient(psi, x)
    mp = np.real(np.trapezoid(np.conj(psi) * (-1j) * d, x))
    sp = np.sqrt(np.trapezoid(np.abs(d) ** 2, x) - mp ** 2)
    return sx * sp

print(spread_product(x, np.exp(-x**2 / 4)))`,
      tests: [
        { name: 'a Gaussian sits on the bound, 0.5', code: 'abs(spread_product(x, np.exp(-x**2 / 4)) - 0.5) < 1e-4' },
        { name: 'shifting and kicking the Gaussian changes nothing', code: 'abs(spread_product(x, np.exp(-(x - 3)**2 / 2) * np.exp(4j * x)) - 0.5) < 1e-3' },
        { name: 'sech gives π/6 ≈ 0.5236', code: 'abs(spread_product(x, 1 / np.cosh(x / 1.3)) - np.pi / 6) < 1e-4' },
        { name: 'the triangle gives √0.3 ≈ 0.5477', code: 'abs(spread_product(x, np.clip(1 - np.abs(x) / 2, 0, None)) - np.sqrt(0.3)) < 2e-3' },
        { name: 'a chirped Gaussian (c = 1) gives √2 / 2', code: 'abs(spread_product(x, np.exp(-(1 - 1j) * x**2 / 4)) - np.sqrt(2) / 2) < 1e-4' },
      ],
      hints: ['ρ = |ψ|²; ⟨x⟩ = ∫xρ dx and σₓ² = ∫(x − ⟨x⟩)²ρ dx.', '`d = np.gradient(psi, x)`; ⟨p²⟩ is `np.trapezoid(np.abs(d)**2, x)`; subtract ⟨p⟩².'],
      teach: 'A spread is a standard deviation: subtract the mean before squaring, for momentum as for position.',
      explain: t`Every shape lands on or above $0.5$: Gaussian $0.5000$, sech $0.5236$, triangle $0.548$ (its corners cost momentum spread), chirped Gaussian $0.707$. Shifting or kicking a state moves $\langle x\rangle$ and $\langle p\rangle$ but not the spreads.`,
    }),
    mcq({
      id: 'meaning-error', difficulty: 2, kind: 'error',
      prompt: t`A student explains: “$\sigma_x\sigma_p \ge \hbar/2$ means that when I measure an electron’s position, the photon I bounce off it kicks its momentum, so every position measurement has an error of at least $\sigma_x$.” What is wrong with this account?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [0, 1.2], aspect: 'wide', xlabel: 'result (in units of each spread)', ylabel: 'how often', yticks: 0, axesAt: 'edge', curves: [{ fn: 'exp(-x^2/2)', color: 'accent', width: 2.4, label: 'positions, batch 1', labelAt: -2.6, labelDy: -14 }, { fn: '0.7*exp(-x^2/8)', color: 'warn', width: 2.2, dash: [6, 4], label: 'momenta, batch 2', labelAt: 1.9, labelDy: -14 }] }, caption: 'Histograms of results from two batches of identically prepared electrons: positions measured on one batch, momenta on the other. Schematic.' },
      choices: [
        t`$\sigma_x$ and $\sigma_p$ are the spreads of results over many identically prepared systems — properties of the state; each single measurement can be as precise as the apparatus allows`,
        'Nothing: the inequality is a statement about the disturbance a measurement causes',
        t`The inequality limits only the momentum measurement, not the position one`,
        t`The bound is $\hbar$, not $\hbar/2$`,
      ],
      answer: 0,
      why: {
        1: t`Heisenberg’s original microscope argument was about disturbance, but the inequality derived here involves no apparatus at all: it holds for the state before anything is measured.`,
        2: t`It is symmetric in $x$ and $p$; neither is singled out.`,
        3: t`$\hbar/2$ is the derived bound for standard deviations; $\hbar$ appears only in rough order-of-magnitude versions.`,
      },
      hints: ['What exactly are σₓ and σₚ the standard deviations of?', 'Could you measure x on one electron and p on a different, identically prepared one?'],
      teach: 'The uncertainty principle bounds the spreads that a state predicts for separate measurements, not the error of any one measurement.',
      explain: t`The derivation used only $|\psi\rangle$ and two operators. Prepare many electrons identically; measure $x$ precisely on half and $p$ precisely on the others. The two histograms’ widths obey $\sigma_x\sigma_p \ge \hbar/2$ however good the instruments are. (Disturbance by measurement is real too, but it is a different statement.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-triangle', difficulty: 3,
      gen(r) {
        const a = r.pick([0.3, 1, 2.5]);
        const ans = Math.sqrt(0.3);
        return {
          prompt: t`$\psi(x) = A(1 - |x|/a)$ for $|x| < a$, zero outside, with $a = ${a}$ nm and $A = \sqrt{3/2a}$. Its moments are $\langle x\rangle = 0$, $\langle x^2\rangle = a^2/10$, $\langle p\rangle = 0$ and $\langle p^2\rangle = \hbar^2\int\psi'^2dx = 3\hbar^2/a^2$. Find $\sigma_x\sigma_p$ in units of $\hbar$.`,
          visual: curvePic({ fn: `max(1 - abs(x)/${a}, 0)^2`, x: [r6(-1.3 * a), r6(1.3 * a)], y: [0, 1.15], ylabel: '|ψ|² (scaled)', caption: 'The triangle state’s density. The corners in ψ itself make its slope jump, which costs momentum spread.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0.5, feedback: 'Only a Gaussian reaches ħ/2.' }, { value: 0.3, feedback: 'Take the square root of the product of the variances.' }],
          hints: [t`Both means are zero, so $\sigma_x^2 = \langle x^2\rangle$ and $\sigma_p^2 = \langle p^2\rangle$.`, t`$\sigma_x\sigma_p = \sqrt{\tfrac{a^2}{10}\cdot\tfrac{3\hbar^2}{a^2}}$.`],
          teach: 'Multiply the two standard deviations; for a non-Gaussian shape the result lies above ħ/2.',
          explain: t`$\sigma_x\sigma_p = \sqrt{3/10}\,\hbar = ${fmt(ans, 4)}\,\hbar$, independent of $a$ — 10% above the floor.`,
        };
      },
    }),
    mcq({
      id: 'cp-x-py', difficulty: 2,
      prompt: t`Can a particle in three dimensions have a sharply defined $x$ **and** a sharply defined $p_y$ at the same time?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 2], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 'y', xticks: 0, yticks: 0, shade: [{ fn: '2', lower: '-2', from: -0.25, to: 0.25, color: 'accent', alpha: 0.35 }], curves: [-1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75].map((y) => ({ param: ['-0.25 + 0.5*t', String(y)], t: [0, 1], color: 'warn', width: 2 })), arrows: [{ from: [0.9, -1.2], to: [0.9, 1.2], color: 'warn', width: 2.2, label: 'one sharp momentum along y', labelDx: 8, labelDy: 8 }], points: [{ x: -0.3, y: -1.85, r: 0, color: 'accent', label: 'narrow in x', labelAlign: 'right', labelDx: -6, labelDy: 0 }] }, caption: 'A state confined to a thin strip in x (blue) whose wave crests (orange) are evenly spaced lines along y: sharp x, sharp momentum along y. Schematic.' },
      choices: [
        t`Yes: $[\hat x, \hat p_y] = 0$, so the Robertson bound is zero`,
        t`No: $\sigma_x\sigma_{p_y} \ge \hbar/2$ like any position and momentum`,
        t`Only if $p_x$ is also sharp`,
        t`Only in the classical limit $\hbar \to 0$`,
      ],
      answer: 0,
      why: {
        1: t`The bound comes from the commutator, and $\hat x$ and $\hat p_y = -i\hbar\,\partial_y$ commute: differentiating in $y$ ignores $x$.`,
        2: t`$p_x$ is the one that cannot be sharp alongside $x$.`,
        3: 'No limit is needed: the commutator is exactly zero.',
      },
      hints: [t`Compute $[\hat x, \hat p_y]f(x, y) = x(-i\hbar\,\partial_yf) - (-i\hbar)\,\partial_y(xf)$.`],
      teach: t`Only components along the same axis are incompatible: $[\hat x_i, \hat p_j] = i\hbar\,\delta_{ij}$.`,
      explain: t`$[\hat x, \hat p_y] = 0$, so a state as narrow as you like in $x$, times $e^{ik_yy}$ in $y$, is allowed. The commutator, not the words “position” and “momentum”, decides.`,
    }),
    num({
      id: 'cp-cold-cloud', difficulty: 3, transfer: true,
      gen(r) {
        const sx = r.pick([5, 10, 20, 50]);     // μm
        const sv = HBAR / (2 * M_RB87 * sx * 1e-6) * 1e6;   // μm/s
        return {
          prompt: t`In orbit, an atom interferometer can let a cloud of rubidium-87 atoms drift freely for seconds (NASA’s Cold Atom Lab does this on the ISS; space gravimeters built on it are in development). Even a perfectly prepared cloud spreads, because its velocity spread can be no smaller than the uncertainty principle allows. For a minimum-uncertainty state with $\sigma_x = ${sx}\ \mu\text{m}$, what is the velocity spread $\sigma_v = \sigma_p/m$, in μm/s? ($m = ${tex(M_RB87, 6)}$ kg.)`,
          visual: curvePic({ fn: `exp(-x^2/(2*${sx * sx}))`, x: [-4 * sx, 4 * sx], y: [0, 1.15], xlabel: 'x (μm)', ylabel: 'atom density (scaled)', shade: [-sx, sx], caption: t`The cloud’s density, with $\pm\sigma_x$ shaded. Real clouds are warmer, and their atoms interact: this is the floor, not a typical value.` }),
          answer: sv, units: 'μm/s', tol: { rel: 0.005 },
          errors: [{ value: 2 * sv, feedback: t`$\sigma_p = \hbar/(2\sigma_x)$: keep the 2.` }, { value: 2 * Math.PI * sv, feedback: t`Use $\hbar$, not $h$.` }],
          hints: [t`At the bound, $\sigma_p = \hbar/(2\sigma_x)$.`, t`$\sigma_v = \hbar/(2m\sigma_x)$; convert $\sigma_x$ to metres.`],
          teach: 'The uncertainty principle sets a floor on a cloud’s velocity spread, and so on how slowly it can expand.',
          explain: t`$\sigma_v = \dfrac{${tex(HBAR, 4)}}{2\times${tex(M_RB87, 4)}\times${tex(sx * 1e-6, 2)}} = ${fmt(sv, 3)}\ \mu\text{m/s}$. Over a 10 s free fall that alone would add about $${fmt(sv * 10 / 1e3, 2)}$ mm of spread — which is why such experiments cool clouds to picokelvin effective temperatures and why “delta-kick” lenses are used to slow their expansion.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §1.6 and §3.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Robertson, “The uncertainty principle”, Phys. Rev. 34, 163 (1929)', url: 'https://doi.org/10.1103/PhysRev.34.163' },
    { label: 'Gaaloul et al., “A space-based quantum gas laboratory at picokelvin energy scales”, Nat. Commun. 13, 7889 (2022)', url: 'https://coldatomlab.jpl.nasa.gov/' },
  ],
});
