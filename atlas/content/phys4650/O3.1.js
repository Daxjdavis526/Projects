// Scattering and the refractive index (Hecht §3.5, §4.2). Where n comes from:
// light drives bound electrons as damped oscillators (the Lorentz model), the
// dipoles they form give K_E(ω) and hence n²(ω) = 1 + (Nq²/ε₀m)Σ f_j/(ω_0j² −
// ω² − iγ_jω); below the resonances n > 1 and rises with ω (normal
// dispersion), near one the index wiggles and the light is absorbed
// (anomalous dispersion). With the damping dropped and frequencies turned into
// wavelengths this is Sellmeier's formula — SCHOTT's six numbers for N-BK7,
// whose C coefficients are the squared resonance wavelengths. The same driven
// electrons re-radiate: a lone molecule scatters ∝ ω⁴/(ω₀² − ω²)², which far
// below resonance is Rayleigh's λ⁻⁴ — the blue sky; in a dense uniform medium
// the scattered wavelets cancel sideways and add forward into the refracted
// wave. Cauchy's two-term fit, why the sky is not violet. Transfers: Rayleigh
// extinction of starlight (Hansen & Travis optical depth), Abbe number of F2.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { sf, nOf } from './_op.js';

const t = String.raw;

// SCHOTT N-BK7 Sellmeier coefficients (λ in µm)
const B = [1.03961212, 0.231792344, 1.01046945], Cc = [0.00600069867, 0.0200179144, 103.560653];
const sell = (nm) => { const u = (nm / 1000) ** 2; return Math.sqrt(1 + B.reduce((s, b, i) => s + (b * u) / (u - Cc[i]), 0)); };
const SELL_FN = `sqrt(1 + ${B[0]}*(x/1000)^2/((x/1000)^2 - ${Cc[0]}) + ${B[1]}*(x/1000)^2/((x/1000)^2 - ${Cc[1]}) + ${B[2]}*(x/1000)^2/((x/1000)^2 - ${Cc[2]}))`;
const LINES = { F: 486.13, d: 587.56, C: 656.27 };
const EX = { nF: sell(LINES.F), nd: sell(LINES.d), nC: sell(LINES.C) };
EX.V = (EX.nd - 1) / (EX.nF - EX.nC);
EX.l = Cc.map((c) => Math.sqrt(c));

// one Lorentz oscillator, x = ω/ω₀: S = Nq²/(ε₀mω₀²), g = γ/ω₀
const DEN = '((1 - x^2)^2 + g^2*x^2)';
const E1 = `(1 + S*(1 - x^2)/${DEN})`, E2 = `(S*g*x/${DEN})`, MOD = `sqrt(${E1}^2 + ${E2}^2)`;
const N_FN = `sqrt((${MOD} + ${E1})/2)`, K_FN = `sqrt(max(${MOD} - ${E1}, 0)/2)`;

/** Rayleigh optical depth of the atmosphere at sea level (Hansen & Travis 1974), λ in µm. */
const tauR = (um) => 0.008569 * um ** -4 * (1 + 0.0113 * um ** -2 + 0.00013 * um ** -4);

/** The BK7 index curve against wavelength, with optional marked points. */
const bk7Graph = (points, caption, extra = {}) => ({
  type: 'graph',
  params: { x: [300, 1600], y: [1.495, 1.54], aspect: 'wide', xlabel: 'vacuum wavelength (nm)', ylabel: 'n', yticks: 4, curves: [{ fn: SELL_FN, color: 'accent', width: 2.4, domain: [310, 1600] }], points, ...extra },
  caption,
});

export default lesson({
  id: 'phys4650.O3.1',
  title: 'Scattering and the refractive index',
  minutes: 16, difficulty: 3,
  intro: t`Why is light slower in glass? Its electric field drives the electrons bound in each atom. Each behaves like a damped spring of natural frequency $\omega_0$: it oscillates at the light’s $\omega$, forms a little dipole, and radiates. Adding up the dipoles gives the material’s $K_E(\omega)$, so ([O2.1](#/lesson/phys4650.O2.1)) its index — the **Lorentz oscillator model**:

$$n^2(\omega) = 1 + \frac{Nq_e^2}{\varepsilon_0m_e}\sum_j\frac{f_j}{\omega_{0j}^2 - \omega^2 - i\gamma_j\omega}$$

Below a resonance $n > 1$ and rises with frequency (**normal dispersion**: blue bends more than red). Near one, the light is absorbed and $n$ falls with frequency (**anomalous dispersion**). The same radiating electrons **scatter** light: a lone molecule scatters as $\omega^4$ far below its resonance — Rayleigh scattering, the blue of the sky.`,
  symbols: [
    { tex: 'n', text: t`the refractive index; complex in general, $n + i\kappa$: the real part sets the phase speed, the imaginary part $\kappa$ the absorption` },
    { tex: 'N', text: 'the number of molecules per unit volume, in m⁻³' },
    { tex: 'q_e,\\ m_e', text: t`the electron’s charge ($1.602\times10^{-19}$ C) and mass ($9.109\times10^{-31}$ kg)` },
    { tex: '\\varepsilon_0', text: 'the vacuum permittivity, in F/m' },
    { tex: 'f_j', text: 'the oscillator strength: the effective number of electrons per molecule with resonance j' },
    { tex: '\\omega_{0j}', text: 'the natural (resonant) angular frequency of the j-th kind of oscillator, in rad/s; for glass, in the ultraviolet and infrared' },
    { tex: '\\gamma_j', text: 'its damping rate, in s⁻¹: sets the width of the absorption line' },
    { tex: '\\omega', text: 'the angular frequency of the light, in rad/s' },
  ],
  why: t`Every lens designer’s glass catalogue, every rainbow and every blue sky is this one driven oscillator, summed.`,
  visual: {
    type: 'graph',
    title: 'One resonance: the index and the absorption',
    lead: t`One kind of oscillator, with frequency on the horizontal axis in units of its resonance $\omega_0$. Blue: the index $n$ (the phase is slowed by it). Red: $\kappa$, the absorption. Gold dashed: the power one molecule scatters, $\propto\omega^4/[(\omega_0^2 - \omega^2)^2 + \gamma^2\omega^2]$ (scaled to fit).`,
    tasks: [
      t`Below the resonance $n > 1$ and rises with $\omega$: normal dispersion. Visible light sits here for glass, whose resonances are in the ultraviolet.`,
      t`Raise the damping: the absorption peak widens and lowers. Across it $n$ **falls** with $\omega$ — anomalous dispersion — and just above it $n < 1$ (the phase outruns $c$; no signal does: O5).`,
      t`Far below the resonance the gold curve rises as $\omega^4$: double the frequency, sixteen times the scattering. That is Rayleigh’s law.`,
    ],
    params: {
      x: [0, 2], y: [0, 2.6], aspect: 'wide', xlabel: 'ω / ω₀', ylabel: '', yticks: 5,
      sliders: [
        { key: 'S', label: 'Strength $Nq_e^2f/\\varepsilon_0m_e\\omega_0^2$', min: 0.05, max: 1.5, step: 0.01, value: 0.6, explain: 'How many oscillators, and how strongly they couple to the light. A denser material is stronger.' },
        { key: 'g', label: 'Damping $\\gamma/\\omega_0$', min: 0.02, max: 0.5, step: 0.01, value: 0.08, explain: 'How quickly an oscillator loses energy (to collisions and re-radiation); it sets the absorption line’s width.' },
      ],
      curves: [
        { fn: '1', color: 'ink3', width: 1, dash: [4, 4] },
        { fn: `0.25*x^4/${DEN}`, color: 'gold', width: 1.6, dash: [6, 4], samples: 800 },
        { fn: K_FN, color: 'bad', width: 2.2, samples: 800, label: 'κ', labelAt: 1.75, labelDy: -8 },
        { fn: N_FN, color: 'accent', width: 2.6, samples: 800, label: 'n', labelAt: 0.4, labelDy: -10 },
      ],
    },
    caption: t`A single classical oscillator — a teaching model. Real materials have several resonances, and quantum mechanics replaces the springs with transitions between levels; the formula survives with $f_j$ as measured oscillator strengths.`,
  },
  example: {
    prompt: t`SCHOTT fits its N-BK7 glass with Sellmeier’s formula, $n^2 = 1 + \sum_{j=1}^3\dfrac{B_j\lambda^2}{\lambda^2 - C_j}$ ($\lambda$ in µm), with $B = (1.03961212,\ 0.231792344,\ 1.01046945)$ and $C = (0.00600069867,\ 0.0200179144,\ 103.560653)$ µm². Find the index at the F (486.13 nm), d (587.56 nm) and C (656.27 nm) lines, the Abbe number $V_d = (n_d - 1)/(n_F - n_C)$, and the wavelengths of the resonances the fit implies.`,
    visual: bk7Graph(Object.entries(LINES).map(([k, l]) => ({ x: l, y: sf(sell(l), 6), color: 'gold', label: k, labelDy: -12 })), t`N-BK7’s index from the Sellmeier fit, valid from about 300 to 2500 nm. It falls slowly toward the red: normal dispersion.`),
    steps: [
      { label: 'Where Sellmeier comes from', text: t`Drop the damping (glass is transparent between resonances) and write $\omega = 2\pi c/\lambda$: each Lorentz term $\dfrac{f_j}{\omega_{0j}^2 - \omega^2}$ becomes $\dfrac{B_j\lambda^2}{\lambda^2 - \lambda_j^2}$. So $C_j = \lambda_j^2$, the squared resonance wavelengths.` },
      { label: 'Evaluate', text: t`$n_F = ${sf(EX.nF, 6)}$, $n_d = ${sf(EX.nd, 6)}$, $n_C = ${sf(EX.nC, 6)}$. Blue light sees the larger index.` },
      { label: 'Abbe number', text: t`$V_d = \dfrac{${sf(EX.nd, 6)} - 1}{${sf(EX.nF, 6)} - ${sf(EX.nC, 6)}} = ${sf(EX.V, 4)}$ (SCHOTT lists 64.17). Large $V$ means weak dispersion: a “crown” glass.` },
      { label: 'Resonances', text: t`$\lambda_j = \sqrt{C_j}$: $${sf(EX.l[0] * 1000, 3)}$ nm and $${sf(EX.l[1] * 1000, 4)}$ nm in the ultraviolet (electrons), and $${sf(EX.l[2], 4)}$ µm in the infrared (vibrating Si–O bonds). Visible light lies between them, where the glass is clear and $n$ rises gently toward the UV.` },
      { label: 'Sense check', text: t`The fit’s “resonances” are effective, not single lines: glass absorbs over broad UV and IR bands. Below about 300 nm BK7 becomes opaque, as the model says it must near $\lambda_1$, $\lambda_2$.` },
    ],
    answer: t`$n_F = ${sf(EX.nF, 6)}$, $n_d = ${sf(EX.nd, 6)}$, $n_C = ${sf(EX.nC, 6)}$; $V_d = ${sf(EX.V, 4)}$; resonances near ${sf(EX.l[0] * 1000, 2)} nm, ${sf(EX.l[1] * 1000, 3)} nm and ${sf(EX.l[2], 3)} µm.`,
  },
  practice: [
    mcq({
      id: 'which-side', difficulty: 1,
      prompt: t`Crown glass has its strong electronic resonances in the ultraviolet. For visible light, how does its index change from red to violet, and why?`,
      visual: bk7Graph([], t`N-BK7’s index against wavelength (Sellmeier fit).`, { x: [380, 760], y: [1.51, 1.535] }),
      choices: ['It rises toward violet: violet is closer to the UV resonances, so the electrons respond more strongly.', 'It falls toward violet: higher-frequency light is harder for electrons to follow.', 'It is the same for all colours: n is a property of the glass, not the light.', 'It rises toward violet because violet photons have more momentum to lose.'],
      answer: 0,
      why: { 1: t`Below a resonance the response *grows* as $\omega$ approaches $\omega_0$: the denominator $\omega_0^2 - \omega^2$ shrinks.`, 2: 'Then prisms would not split white light: n depends on frequency — dispersion.', 3: t`In the wave picture the slowing comes from the electrons’ response, $1/(\omega_0^2 - \omega^2)$, not from photons losing momentum.` },
      hints: [t`Look at the oscillator term $1/(\omega_0^2 - \omega^2)$ for $\omega < \omega_0$.`],
      teach: t`Below a resonance, $n$ increases with frequency: normal dispersion.`,
      explain: t`For $\omega < \omega_0$ the term $1/(\omega_0^2 - \omega^2)$ grows as $\omega$ rises toward the UV resonance, so $n$ rises from red to violet and violet refracts more.`,
    }),
    num({
      id: 'bk7-n', difficulty: 2,
      gen(r) {
        const nm = r.pick([405, 450, 532, 633, 780, 850, 1064, 1310]);
        const n = sell(nm);
        return {
          prompt: t`Use SCHOTT’s Sellmeier fit for N-BK7, $n^2 = 1 + \sum_j B_j\lambda^2/(\lambda^2 - C_j)$ with $B = (1.03961212,\ 0.231792344,\ 1.01046945)$, $C = (0.00600069867,\ 0.0200179144,\ 103.560653)$ µm² and $\lambda$ in µm, to find its index at ${nm} nm. Give 5 significant figures.`,
          visual: bk7Graph([], t`The curve you are evaluating; the wavelength is marked.`, { vlines: [{ x: nm, color: 'gold', label: `${nm} nm` }] }),
          answer: n, tol: { rel: 5e-5 }, sigfigs: 5,
          errors: [{ value: Math.sqrt(1 + B.reduce((s, b, i) => s + (b * nm * nm) / (nm * nm - Cc[i]), 0)), feedback: 'Convert the wavelength to micrometres first: the C coefficients are in µm².' }, { value: n * n, feedback: 'The formula gives n²: take the square root.' }],
          hints: [t`$\lambda = ${nm / 1000}$ µm, so $\lambda^2 = ${sf((nm / 1000) ** 2, 6)}$ µm².`, t`Add the three terms $B_j\lambda^2/(\lambda^2 - C_j)$ to 1, then take the square root. The third term is small and negative-ish: $\lambda^2 \ll C_3$.`],
          teach: t`Sellmeier’s formula is the Lorentz model without damping, written in wavelength; catalogue coefficients give indices to about $10^{-5}$.`,
          explain: t`The three terms are ${B.map((b, i) => sf((b * (nm / 1000) ** 2) / ((nm / 1000) ** 2 - Cc[i]), 5)).join(', ')}, so $n^2 = ${sf(n * n, 6)}$ and $n = ${sf(n, 5)}$.`,
        };
      },
    }),
    num({
      id: 'resonance', difficulty: 2,
      gen(r) {
        const [mat, C, kind] = r.pick([['fused silica', 0.0684043 ** 2, 'UV'], ['fused silica', 0.1162414 ** 2, 'UV'], ['fused silica', 9.896161 ** 2, 'IR'], ['N-BK7', 0.0200179144, 'UV'], ['N-BK7', 103.560653, 'IR'], ['sapphire', 18.028251 ** 2, 'IR']]);
        const lam = Math.sqrt(C);
        return {
          prompt: t`One term of the Sellmeier fit for ${mat} has $C_j = ${sf(C, 6)}$ µm². At what wavelength is the resonance it represents, in µm?`,
          visual: { type: 'graph', params: { x: [0, 2.5 * lam], y: [-6, 6], aspect: 'wide', xlabel: 'λ (µm)', ylabel: 'term', yticks: 4, curves: [{ fn: `x^2/(x^2 - ${sf(C, 6)})`, color: 'accent', width: 2.2, samples: 1200 }] }, caption: t`The shape of one Sellmeier term, $\lambda^2/(\lambda^2 - C_j)$: it blows up at the resonance (real materials absorb there instead).` },
          answer: lam, units: 'um', tol: { rel: 0.002 },
          errors: [{ value: C, feedback: t`$C_j$ is the resonance wavelength **squared**: take its square root.` }],
          hints: [t`The term $\lambda^2/(\lambda^2 - C_j)$ diverges where $\lambda^2 = C_j$.`],
          teach: t`Each Sellmeier $C_j$ is the square of an effective resonance wavelength.`,
          explain: t`$\lambda_j = \sqrt{C_j} = ${sf(lam, 4)}$ µm — in the ${kind === 'UV' ? 'ultraviolet: an electronic resonance' : 'infrared: a vibration of the lattice’s bonds'}.`,
        };
      },
    }),
    num({
      id: 'rayleigh-ratio', difficulty: 2,
      gen(r) {
        const [l1, l2] = r.pick([[450, 650], [400, 700], [470, 620], [420, 680], [380, 760]]);
        const ratio = (l2 / l1) ** 4;
        return {
          prompt: t`By what factor does air scatter ${l1} nm light more strongly than ${l2} nm light (Rayleigh scattering)?`,
          visual: { type: 'graph', params: { x: [380, 760], y: [0, 4.4], aspect: 'wide', xlabel: 'wavelength (nm)', ylabel: 'relative', yticks: 4, curves: [{ fn: '(700/x)^4', color: 'accent', width: 2.4 }], vlines: [{ x: l1, color: 'violet' }, { x: l2, color: 'bad' }] }, caption: t`Rayleigh scattering strength, $\propto\lambda^{-4}$, relative to its value at 700 nm.` },
          answer: ratio, tol: { rel: 0.005 },
          errors: [{ value: l2 / l1, feedback: t`Rayleigh scattering goes as $\lambda^{-4}$, not $\lambda^{-1}$.` }, { value: (l2 / l1) ** 2, feedback: t`The amplitude goes as $\omega^2$; the power goes as $\omega^4 \propto \lambda^{-4}$.` }],
          hints: [t`Scattered power $\propto\omega^4\propto\lambda^{-4}$ far below resonance.`],
          teach: t`Far below its resonance a molecule’s dipole has a fixed amplitude, and a dipole radiates power $\propto\omega^4$: Rayleigh’s $\lambda^{-4}$.`,
          explain: t`$(${l2}/${l1})^4 = ${sf(ratio, 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'not-violet', difficulty: 2,
      prompt: t`Rayleigh scattering is strongest at the shortest wavelengths, so why does the clear sky look blue rather than violet?`,
      visual: { type: 'graph', params: { x: [380, 720], y: [0, 1.15], aspect: 'wide', xlabel: 'wavelength (nm)', ylabel: '', yticks: 0, curves: [{ fn: '(450/x)^4*min(1, 0.55 + (x - 380)/300)', color: 'accent', width: 2.4, label: 'skylight (schematic)', labelAt: 600, labelDy: -10 }, { fn: 'exp(-((x - 555)/80)^2)', color: 'good', width: 1.8, dash: [6, 4], label: 'eye sensitivity', labelAt: 640, labelDy: -10 }] }, caption: t`Schematic shapes only: the skylight spectrum (sunlight × $\lambda^{-4}$) and the eye’s daylight sensitivity.` },
      choices: ['The Sun emits less violet than blue, the upper atmosphere absorbs some, and the eye is far less sensitive to violet: the mixture looks sky-blue.', 'Violet light is too energetic to be scattered by air molecules.', 'Rayleigh’s law fails below 450 nm.', 'The sky reflects the blue of the oceans.'],
      answer: 0,
      why: { 1: 'Violet scatters even more than blue — Rayleigh’s law holds right through the visible.', 2: 'It holds well across the visible; air’s resonances are far into the ultraviolet.', 3: 'The sky is just as blue over deserts and from a mountaintop far from the sea.' },
      hints: ['The colour you see depends on the light’s spectrum *and* on the eye.'],
      teach: 'Sky colour is Rayleigh’s λ⁻⁴ times the solar spectrum, seen through the eye’s response.',
      explain: 'Skylight’s spectrum is the solar spectrum times λ⁻⁴: it does rise into the violet, but sunlight itself falls off there and ozone absorbs below about 320 nm. The eye barely sees violet; the cones’ response to the mixture reads as a pale sky-blue.',
    }),
    num({
      id: 'cauchy', difficulty: 3,
      gen(r) {
        const [l1, l2] = r.pick([[486.13, 656.27], [435.83, 706.52], [404.66, 852.11]]);
        const n1 = sf(sell(l1), 6), n2 = sf(sell(l2), 6), lx = r.pick([546.07, 587.56, 632.8]);
        const Bc = (n1 - n2) / (1 / l1 ** 2 - 1 / l2 ** 2), A = n1 - Bc / l1 ** 2, pred = A + Bc / lx ** 2;
        return {
          prompt: t`N-BK7 has $n = ${n1}$ at ${l1} nm and $n = ${n2}$ at ${l2} nm. Fit Cauchy’s two-term formula $n = A + B/\lambda^2$ through these two points and use it to predict the index at ${lx} nm. Give 5 significant figures.`,
          visual: bk7Graph([{ x: l1, y: n1, color: 'gold', label: `${l1} nm` }, { x: l2, y: n2, color: 'gold', label: `${l2} nm` }], t`The two measured points on N-BK7’s index curve; the prediction is for ${lx} nm.`, { x: [380, 900], y: [1.505, 1.535], vlines: [{ x: lx, color: 'ink3' }] }),
          answer: pred, tol: { rel: 2e-5 }, sigfigs: 5,
          errors: [{ value: (n1 + n2) / 2, feedback: 'Averaging the two indices ignores how n depends on λ. Solve for A and B first.' }],
          hints: [t`Subtract the two equations: $B = \dfrac{n_1 - n_2}{1/\lambda_1^2 - 1/\lambda_2^2}$.`, t`Then $A = n_1 - B/\lambda_1^2$, and evaluate $A + B/\lambda^2$ at ${lx} nm.`],
          teach: t`Far from resonances the Sellmeier sum expands to Cauchy’s $A + B/\lambda^2 + \dots$: two measured indices fix $A$ and $B$.`,
          explain: t`$B = ${sf(Bc, 4)}$ nm², $A = ${sf(A, 6)}$, so $n(${lx}) = ${sf(pred, 6)}$; the full Sellmeier fit gives $${sf(sell(lx), 6)}$ — Cauchy is good to about $10^{-4}$ between the points.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-extinction', difficulty: 3, transfer: true,
      gen(r) {
        const nm = r.pick([400, 450, 500, 550, 650]), z = r.pick([0, 45, 60, 70]);
        const X = 1 / Math.cos((z * Math.PI) / 180), tau = tauR(nm / 1000), T = Math.exp(-tau * X);
        return {
          prompt: t`A ground telescope tracks a star ${z === 0 ? 'overhead' : t`at $${z}^\circ$ from the zenith`}. Rayleigh scattering alone gives the whole atmosphere (at sea level, looking straight up) an optical depth $\tau = 0.008569\,\lambda^{-4}(1 + 0.0113\lambda^{-2} + 0.00013\lambda^{-4})$, with $\lambda$ in µm. What fraction of the star’s ${nm} nm light reaches the telescope? (The slant path is $1/\cos z$ times the vertical one.)`,
          visual: { type: 'graph', params: { x: [350, 800], y: [0, 1], aspect: 'wide', xlabel: 'wavelength (nm)', ylabel: 'transmitted', yticks: 5, curves: [{ fn: `exp(-0.008569*(x/1000)^(-4)*(1 + 0.0113*(x/1000)^(-2) + 0.00013*(x/1000)^(-4))*${sf(X, 5)})`, color: 'accent', width: 2.4 }], vlines: [{ x: nm, color: 'gold' }] }, caption: t`Transmission through the Rayleigh-scattering atmosphere along this slant path. Aerosols, ozone and water vapour absorb and scatter more; they are left out.` },
          answer: T, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(-tau), feedback: t`That is straight up. Along a slant path at zenith angle $z$ the light crosses $1/\cos z$ times as much air.` }, { value: 1 - tau * X, feedback: t`Use the exponential, $e^{-\tau X}$; $1 - \tau X$ is only its first-order approximation.` }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: [t`Evaluate $\tau$ at $\lambda = ${nm / 1000}$ µm.`, t`Transmission $= e^{-\tau/\cos z}$.`],
          teach: t`Scattering removes light from a beam exponentially: $T = e^{-\tau X}$, with airmass $X \approx 1/\cos z$.`,
          explain: t`$\tau = ${sf(tau, 3)}$, airmass $X = ${sf(X, 3)}$, so $T = e^{-${sf(tau * X, 3)}} = ${sf(T, 3)}$. The light scattered out of the star’s beam is the blue sky seen from elsewhere.`,
        };
      },
    }),
    num({
      id: 'cp-abbe-f2', difficulty: 2,
      gen(r) {
        const mat = r.pick(['f2', 'silica', 'sf11']);
        const nF = sf(nOf(mat, LINES.F), 6), nd = sf(nOf(mat, LINES.d), 6), nC = sf(nOf(mat, LINES.C), 6);
        const V = (nd - 1) / (nF - nC);
        const name = { f2: 'SCHOTT F2 flint glass', silica: 'fused silica', sf11: 'SCHOTT SF11 dense flint' }[mat];
        return {
          prompt: t`A star-tracker lens designer considers ${name}: $n_F = ${nF}$, $n_d = ${nd}$, $n_C = ${nC}$. What is its Abbe number $V_d = (n_d - 1)/(n_F - n_C)$?`,
          visual: { type: 'graph', params: { x: [450, 700], y: [nC - 0.004, nF + 0.004], aspect: 'wide', xlabel: 'wavelength (nm)', ylabel: 'n', yticks: 4, points: [{ x: LINES.F, y: nF, color: 'accent', label: 'F' }, { x: LINES.d, y: nd, color: 'gold', label: 'd' }, { x: LINES.C, y: nC, color: 'bad', label: 'C' }] }, caption: t`The three catalogue indices of this glass at the hydrogen F and C lines and the helium d line.` },
          answer: V, tol: { rel: 0.005 },
          errors: [{ value: (nd - 1) / (nC - nF), feedback: t`The difference is $n_F - n_C$ (blue minus red), which is positive: $V_d$ is positive.` }, { value: nd / (nF - nC), feedback: t`The numerator is $n_d - 1$, the glass’s refracting power.` }],
          hints: [t`$V_d$ compares the refracting power $n_d - 1$ with the spread $n_F - n_C$.`],
          teach: t`The Abbe number measures dispersion against refraction: low $V$ (flints) disperse strongly, high $V$ (crowns, silica) weakly.`,
          explain: t`$V_d = (${nd} - 1)/(${nF} - ${nC}) = ${sf(V, 3)}$. ${V > 50 ? 'High: little chromatic aberration for its power.' : 'Low: strong dispersion — useful paired with a crown to cancel colour (O4).'}`,
        };
      },
    }),
    mcq({
      id: 'cp-opaque-uv', difficulty: 2,
      prompt: t`Window glass is clear to visible light but opaque below about 300 nm. In the oscillator model, why?`,
      visual: { type: 'graph', params: { x: [0, 2], y: [0, 2.4], aspect: 'wide', xlabel: 'ω / ω₀', ylabel: '', yticks: 0, curves: [{ fn: N_FN.replace(/S/g, '0.6').replace(/g\^2/g, '0.15^2').replace(/g\*/g, '0.15*'), color: 'accent', width: 2.2, label: 'n', labelAt: 0.4, labelDy: -10 }, { fn: K_FN.replace(/S/g, '0.6').replace(/g\^2/g, '0.15^2').replace(/g\*/g, '0.15*'), color: 'bad', width: 2.2, label: 'κ', labelAt: 1.2, labelDy: -8 }], vlines: [{ x: 0.5, color: 'gold', label: 'visible' }] }, caption: t`One oscillator, schematic: the visible sits well below glass’s ultraviolet resonances.` },
      choices: ['Near 300 nm the light approaches the electrons’ UV resonances, where the driven oscillation is strong and its energy is absorbed.', 'Ultraviolet photons are too small to fit between the atoms.', 'Glass reflects ultraviolet light totally.', 'The index becomes imaginary for all wavelengths shorter than visible.'],
      answer: 0,
      why: { 1: 'The wavelength (hundreds of nm) is always far larger than the atoms (tenths of a nm); size is not the issue.', 2: 'Reflection at normal incidence stays a few percent; the light is absorbed inside the glass.', 3: t`The index has an imaginary part $\kappa$ that grows near a resonance, but it stays complex, not purely imaginary, and only near the resonance.` },
      hints: [t`Where is $\kappa$ large in the oscillator model?`],
      teach: 'Absorption bands sit at the resonances; transparency windows lie between them.',
      explain: t`The damping term $i\gamma\omega$ matters only near $\omega_0$: there $\kappa$ is large and the glass absorbs. BK7’s effective electronic resonances are near 80 and 140 nm, and its absorption edge reaches up to about 300 nm. Fused silica, with resonances further out, transmits down to about 180 nm — which is why UV optics use it.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §3.5 and §4.2', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'SCHOTT optical glass data sheet, N-BK7 (Sellmeier coefficients, Abbe number 64.17)', url: 'https://refractiveindex.info/?shelf=glass&book=SCHOTT-optical&page=N-BK7' },
    { label: 'I. H. Malitson, Interspecimen comparison of the refractive index of fused silica, JOSA 55, 1205 (1965)', url: 'https://doi.org/10.1364/JOSA.55.001205' },
    { label: 'J. E. Hansen & L. D. Travis, Light scattering in planetary atmospheres, Space Sci. Rev. 16, 527 (1974)', url: 'https://doi.org/10.1007/BF00168069' },
  ],
});
