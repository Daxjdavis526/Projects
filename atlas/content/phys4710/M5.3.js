// Connection formulas (Griffiths & Schroeter §9.3). Near a turning point a
// smooth V is linear, the Schrödinger equation becomes Airy's, and matching
// Ai(z) to the WKB forms on both sides gives
//   (2D/√p) cos(∫ₓ^{x₂} p dx/ħ − π/4) ⟷ (D/√|p|) e^{−∫_{x₂}^x |p| dx/ħ}:
// each soft turning point costs an eighth of a wavelength of phase. Hence
// ∫p dx = (n + ½)πħ between two soft turning points (exact for the
// oscillator), (n − ¼)πħ with one wall (n = 1, 2 …; the half oscillator, exact
// again; the bouncer), nπħ between walls (M5.1). Worked example: V = α|x|
// against the Airy zeros. The Airy length (ħ²/2mF)^{1/3}; the bound-state
// count of the sech² well; the quartic's E ∝ (n + ½)^{4/3}. Transfer: the
// quantum bouncing neutrons of Nesvizhevsky et al. (ILL, Nature 2002):
// heights 13.7, 24.0, 32.4 μm, WKB within 1%. Exact levels come from the
// q2b-wkb model (Numerov) and the Airy zeros.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, MN, G0, HBARC_EVNM, MEC2_EV, HB2M_EVNM2, wkbPic, potPic, r6, seg, label } from './_q2b.js';
import { exactLevel } from '../../src/viz/model/q2b-wkb.js';

const t = String.raw;
const HB_SQ2M = HBARC_EVNM / Math.sqrt(2 * MEC2_EV);                    // eV^½ nm: ħ/√(2mₑ) = 0.195 18…
const AZ = [2.338107410459767, 4.087949444130970, 5.520559828095551, 6.786708090071759];   // −(zeros of Ai)
const APZ = [1.018792971647471, 3.248197582179837, 4.820099211178736];                      // −(zeros of Ai′)
// |x| well in units ħ = m = α = 1: WKB [3π(n + ½)/4√2]^{2/3}; exact −a/2^{1/3}
const LIN = [0, 1, 2, 3].map((n) => ({ n, wkb: ((3 * Math.PI * (n + 0.5)) / (4 * Math.SQRT2)) ** (2 / 3), exact: (n % 2 ? AZ[(n - 1) / 2] : APZ[n / 2]) / 2 ** (1 / 3) }));
// the neutron bouncer
const LN = Math.cbrt((HBAR * HBAR) / (2 * MN * MN * G0));               // m, the Airy length (ħ²/2m²g)^{1/3}
const zW = (n) => LN * (1.5 * Math.PI * (n - 0.25)) ** (2 / 3);
// sech² wells with an unambiguous count (WKB and exact agree, s − ½ not near an integer)
const SECH = [];
for (const V0 of [0.3, 0.5, 1, 2]) for (const a of [0.2, 0.3, 0.5, 0.8]) {
  const s = (a * Math.sqrt(V0)) / HB_SQ2M, lam = -0.5 + Math.sqrt(0.25 + s * s);
  const nW = Math.ceil(s - 0.5), nE = Math.ceil(lam), frac = s - 0.5 - Math.floor(s - 0.5);
  if (nW === nE && frac > 0.15 && frac < 0.85 && nW >= 2 && nW <= 8) SECH.push({ V0, a, s, n: nW });
}

export default lesson({
  id: 'phys4710.M5.3',
  title: 'Connection formulas',
  minutes: 17, difficulty: 4,
  intro: t`WKB fails at a turning point, but the gap is narrow. There a smooth potential is nearly a straight line, the Schrödinger equation becomes **Airy’s equation**, and its exact solution joins the oscillating WKB wave on one side to the decaying one on the other. The result is a rule for crossing the gap:

$$\begin{gathered} \frac{2D}{\sqrt{p}}\cos\!\Bigl(\frac1\hbar\int_x^{x_2}p\,dx' - \frac\pi4\Bigr) \;\longleftrightarrow\; \frac{D}{\sqrt{|p|}}\,e^{-\frac1\hbar\int_{x_2}^{x}|p|\,dx'} \end{gathered}$$

The $-\pi/4$ is the point: **each soft turning point costs an eighth of a wavelength** of phase, so between two of them $\int p\,dx = (n + \tfrac12)\pi\hbar$ — the Bohr–Sommerfeld rule with its famous half.`,
  symbols: [
    { tex: 'x_2', text: 'a turning point, where V(x₂) = E, with the allowed region to its left and the forbidden region to its right' },
    { tex: 'p,\\ |p|', text: 'the classical momentum √(2m(E − V)) on the allowed side, and the magnitude √(2m(V − E)) on the forbidden side' },
    { tex: 'D', text: 'a constant amplitude, the same on both sides: that is what “connecting” fixes' },
    { tex: '\\tfrac{\\pi}{4}', text: 'the phase lost at a soft turning point: an eighth of a wavelength’s 2π, from the Airy function’s asymptotic form' },
    { tex: '\\hbar', text: 'the reduced Planck constant' },
    { tex: 'n', text: 'the number of nodes of the bound state: 0, 1, 2 …' },
  ],
  why: 'The connection formulas turn WKB into a quantization rule that gives molecular vibration levels, Rydberg states, the bouncing levels of neutrons and the prefactor of every tunnelling rate.',
  visual: {
    type: 'q2b-wkb',
    title: 'Crossing a turning point',
    lead: t`Near a turning point, in the scaled distance $z = (x - x_2)/\ell$ with $\ell = (\hbar^2/2mF)^{1/3}$ and $F = V'(x_2)$, the exact solution is the Airy function $\mathrm{Ai}(z)$ (blue). The WKB forms (gold) are the oscillating one on the left and the decaying one on the right.`,
    tasks: [
      'Move the probe to z = −6: WKB and exact agree to about 1%, phase and all. The −π/4 in the cosine is what makes the gold peaks land on the blue ones.',
      'Move it to z = 2: the decaying forms agree to a few per cent.',
      'Now approach z = 0 from either side: the WKB values run away to infinity while Ai stays finite. The Airy function bridges the gap.',
    ],
    params: { view: 'airy', z: -6 },
  },
  example: {
    prompt: t`A particle sits in the V-shaped well $V = \alpha|x|$. Use the connection formulas (two soft turning points) to find its WKB levels, and compare with the exact levels, which come from the zeros of the Airy function and its derivative. Work in units $\hbar = m = \alpha = 1$.`,
    visual: wkbPic({ pot: 'linear', n: 1, panels: ['energy', 'wave'] }, 'The well V = |x| with its exact levels (solid) and WKB levels (dashed), and the second state, exact (blue) and WKB (gold). Units ħ = m = α = 1.'),
    steps: [
      { label: 'Quantization rule', text: t`Two soft turning points at $\pm a$, $a = E/\alpha$, each costing $\pi/4$: $\displaystyle\int_{-a}^{a}p\,dx = \bigl(n + \tfrac12\bigr)\pi\hbar$ with $n = 0, 1, 2, \dots$` },
      { label: 'The integral', text: t`$\displaystyle\int_{-a}^{a}\sqrt{2m(E - \alpha|x|)}\,dx = 2\sqrt{2m}\int_0^{a}\sqrt{E - \alpha x}\,dx = \frac{4\sqrt{2m}}{3\alpha}E^{3/2}$.` },
      { label: 'Solve', text: t`$E_n = \Bigl[\dfrac{3\pi\hbar\alpha}{4\sqrt{2m}}\bigl(n + \tfrac12\bigr)\Bigr]^{2/3}$: in our units $${LIN.map((L) => fmt(L.wkb, 4)).join(',\\ ')},\ \dots$ for $n = 0, 1, 2, 3$.` },
      { label: 'Exact', text: t`Solving Airy’s equation on each side, the even states need $\psi'(0) = 0$ and the odd states $\psi(0) = 0$: $E = 2^{-1/3}|a|$ with $a$ a zero of $\mathrm{Ai}'$ (even) or $\mathrm{Ai}$ (odd). That gives $${LIN.map((L) => fmt(L.exact, 4)).join(',\\ ')}$.` },
      { label: 'Compare', text: t`Errors: $${LIN.map((L) => fmt((100 * (L.wkb - L.exact)) / L.exact, 2)).join('\\%,\\ ')}\%$. Even the ground state, with no nodes at all, is within 10%, and by $n = 3$ the error is a tenth of a per cent.` },
      { label: 'Why the half matters', text: t`Without the connection formulas (hard-wall thinking, $\int p\,dx = n\pi\hbar$) the ground state would have zero energy. The $\tfrac12$ is the zero-point energy, and it comes from the wave leaking a little way past each turning point.` },
    ],
    answer: t`$E_n = \bigl[\tfrac{3\pi\hbar\alpha}{4\sqrt{2m}}(n + \tfrac12)\bigr]^{2/3}$; in units $\hbar = m = \alpha = 1$, $E_0 = ${fmt(LIN[0].wkb, 4)}$ against the exact $${fmt(LIN[0].exact, 4)}$, and the error falls fast with $n$.`,
  },
  practice: [
    mcq({
      id: 'quarter', difficulty: 2,
      prompt: t`Between two hard walls WKB needs $\int p\,dx = n\pi\hbar$; between two soft turning points it needs $(n + \tfrac12)\pi\hbar$. Where does the extra half come from?`,
      visual: wkbPic({ pot: 'harmonic', n: 3, panels: ['wave'], wkb: false }, 'An oscillator state (exact, blue) and its turning points (dashed gold): the wave runs a little way past each one into the shaded forbidden regions. Units ħ = m = 1.'),
      choices: [
        t`At a soft turning point the wave does not stop dead but leaks into the forbidden region: matching to the Airy function shifts the phase by $\pi/4$ at each end`,
        t`It is the uncertainty principle: $\Delta x\,\Delta p \ge \hbar/2$ adds half a quantum`,
        t`The particle spends half its time at each wall`,
        t`It is a relativistic correction, important only for high levels`,
      ],
      answer: 0,
      why: {
        1: 'The uncertainty principle explains why the ground state cannot have zero energy, but the exact ½ comes from the phase matching, not from the inequality.',
        2: t`Time spent is a matter of amplitude ($1/\sqrt p$), not of phase.`,
        3: t`Nothing here is relativistic; and the $\tfrac12$ matters most for the *lowest* levels.`,
      },
      hints: [t`Compare the WKB cosine near a turning point: $\cos(\int p\,dx/\hbar - \pi/4)$.`],
      teach: 'Each soft turning point removes an eighth of a wavelength of phase (π/4), so two of them add ½ to the quantum number.',
      explain: t`A hard wall forces $\psi = 0$ exactly there. A sloping wall lets the wave run on, decaying, past the turning point, so the oscillating part effectively ends $\pi/4$ of phase early. Two such ends give $\pi/2$, which is the $\tfrac12$ in $(n + \tfrac12)\pi\hbar$.`,
    }),
    num({
      id: 'airy-length', difficulty: 2,
      gen(r) {
        const F = r.pick([0.2, 0.5, 1, 2, 5]);                                  // eV/nm
        const ans = Math.cbrt(HB2M_EVNM2 / F);
        return {
          prompt: t`Near a turning point where the potential rises with slope $F = V'(x_2)$, the wave function is $\mathrm{Ai}(z)$ with $z = (x - x_2)/\ell$ and $\ell = (\hbar^2/2mF)^{1/3}$. Find $\ell$, in nm, for an electron where $F = ${F}$ eV/nm. ($\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 5)}$ eV nm².)`,
          visual: wkbPic({ view: 'airy', z: -1, wkb: false }, 'The Airy function in the scaled distance z: one unit of z is one Airy length ℓ.'),
          answer: ans, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(HB2M_EVNM2 / F), feedback: t`The Airy length is a cube root: $(\hbar^2/2mF)^{1/3}$ has units of $(\text{eV nm}^2 \div \text{eV/nm})^{1/3} = \text{nm}$.` }, { value: HB2M_EVNM2 / F, feedback: 'Take the cube root.' }],
          hints: [t`$\ell^3 = \dfrac{\hbar^2}{2mF}$, in nm³ when $\hbar^2/2m$ is in eV nm² and $F$ in eV/nm.`],
          teach: t`The turning-point region has a natural width $(\hbar^2/2mF)^{1/3}$: WKB needs the potential to stay linear over several of these lengths.`,
          explain: t`$\ell = (${fmt(HB2M_EVNM2, 4)}/${F})^{1/3} = ${fmt(ans, 3)}$ nm. The connection works when $V$ stays close to linear over a few $\ell$ on each side, so that the Airy solution and the WKB forms overlap.`,
        };
      },
    }),
    num({
      id: 'linear-wkb', difficulty: 3,
      gen(r) {
        const F = r.pick([0.5, 1, 2]), n = r.pick([0, 1, 2, 3]);                 // eV/nm
        const ans = ((3 * Math.PI * F * HB_SQ2M * (n + 0.5)) / 4) ** (2 / 3);
        const hard = n === 0 ? null : ((3 * Math.PI * F * HB_SQ2M * n) / 4) ** (2 / 3);
        return {
          prompt: t`An electron is trapped in the V-shaped well $V = F|x|$ with $F = ${F}$ eV/nm (a symmetric field pointing towards the centre). Use WKB with the connection formulas to find the energy of level $n = ${n}$ (counting from 0), in eV. ($\hbar/\sqrt{2m_e} = ${fmt(HB_SQ2M, 5)}$ eV$^{1/2}$ nm.)`,
          visual: potPic({ x: [-3, 3], y: [0, 3.4], curves: [{ fn: 'abs(x)', domain: [-3, 3] }], E: { from: -1.6, to: 1.6, y: 1.6 }, points: [label(-1.6, 1.6, '−a', 'gold', -10, 12), label(1.6, 1.6, '+a', 'gold', 2, 12)], xlabel: 'x (scaled)', ylabel: 'V (scaled)', xticks: 0, yticks: 0, caption: 'A V-shaped well with an energy level and its two soft turning points ±a = ±E/F. Schematic scales.' }),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [...(hard ? [{ value: hard, feedback: t`Two soft turning points: $\int p\,dx = (n + \tfrac12)\pi\hbar$, not $n\pi\hbar$.` }] : []), { value: ((3 * Math.PI * F * HB_SQ2M * (n + 0.5)) / 2) ** (2 / 3), feedback: t`The integral over both sides is $\tfrac{4\sqrt{2m}}{3F}E^{3/2}$ — a factor 2 from the two halves.` }],
          hints: [t`$\int_{-a}^{a}\sqrt{2m(E - F|x|)}\,dx = \dfrac{4\sqrt{2m}}{3F}E^{3/2}$.`, t`Set it to $(n + \tfrac12)\pi\hbar$: $E^{3/2} = \dfrac{3\pi F}{4}\dfrac{\hbar}{\sqrt{2m}}\bigl(n + \tfrac12\bigr)$.`],
          teach: t`For a linear well the levels go as $(n + \tfrac12)^{2/3}$: they crowd together as the well widens with height.`,
          explain: t`$E^{3/2} = \tfrac{3\pi}{4}\times${F}\times${fmt(HB_SQ2M, 4)}\times${n + 0.5} = ${fmt(ans ** 1.5, 4)}$ eV$^{3/2}$, so $E = ${fmt(ans, 4)}$ eV. The exact value, $|a|\,(\hbar^2F^2/2m)^{1/3}$ with $a$ the relevant Airy zero, is ${fmt((n % 2 ? AZ[(n - 1) / 2] : APZ[n / 2]) * Math.cbrt(HB2M_EVNM2 * F * F), 4)} eV.`,
        };
      },
    }),
    num({
      id: 'half-ho', difficulty: 3,
      gen(r) {
        const hw = r.pick([10, 25, 40, 60]), n = r.pick([1, 2, 3]);              // meV
        const ans = (2 * n - 0.5) * hw;
        return {
          prompt: t`A “half oscillator”: $V = \tfrac12m\omega^2x^2$ for $x > 0$ and an impenetrable wall at $x = 0$, with $\hbar\omega = ${hw}$ meV. One end is a wall and the other a soft turning point, so $\int_0^a p\,dx = (n - \tfrac14)\pi\hbar$ with $n = 1, 2, \dots$ Find the WKB energy of level $n = ${n}$, in meV.`,
          visual: potPic({ x: [-0.5, 2.5], y: [0, 3.2], curves: [{ fn: 'x^2/2', domain: [0, 2.5] }], walls: [0], E: { from: 0, to: 1.87, y: 1.75 }, points: [label(1.87, 1.75, 'a', 'gold', 4, 12)], xlabel: 'x (scaled)', ylabel: 'V (scaled)', xticks: 0, yticks: 0, caption: 'Half a harmonic well: a hard wall at x = 0 and a soft turning point at a. Schematic scales.' }),
          answer: ans, units: 'meV', tol: { rel: 0.005 },
          errors: [{ value: (n + 0.5) * hw, feedback: t`$\int_0^a p\,dx$ is only half the full oscillator’s $\pi E/\omega$: it is $\pi E/2\omega$.` }, { value: (2 * n - 1) * hw, feedback: t`One soft turning point costs $\tfrac14$, not $\tfrac12$: the rule is $(n - \tfrac14)\pi\hbar$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\int_0^a p\,dx$ is a quarter of the phase-space ellipse: $\pi E/2\omega$.`, t`$\pi E/2\omega = (n - \tfrac14)\pi\hbar$ gives $E = (2n - \tfrac12)\hbar\omega$.`],
          teach: t`A wall plus a soft turning point gives $(n - \tfrac14)\pi\hbar$; for the half oscillator that is exact.`,
          explain: t`$E = (2\times${n} - \tfrac12)\times${hw} = ${fmt(ans, 4)}$ meV. The exact levels of the half oscillator are the odd states of the full one, $(2k + \tfrac32)\hbar\omega$ with $k = n - 1$ — the same numbers: WKB is exact here, as for the full oscillator.`,
        };
      },
    }),
    num({
      id: 'count', difficulty: 3,
      gen(r) {
        const { V0, a, s, n } = r.pick(SECH);
        return {
          prompt: t`How many bound states does an electron have in the smooth well $V = -V_0\,\mathrm{sech}^2(x/a)$ with $V_0 = ${V0}$ eV and $a = ${a}$ nm? Use WKB: a level $n$ exists if $(n + \tfrac12)\pi\hbar$ fits under $\int p\,dx$ at $E = 0$, the top of the well. ($\int_{-\infty}^{\infty}\mathrm{sech}\,u\,du = \pi$, $\hbar/\sqrt{2m_e} = ${fmt(HB_SQ2M, 5)}$ eV$^{1/2}$ nm.)`,
          visual: potPic({ x: [-4, 4], y: [-1.15, 0.25], curves: [{ fn: '-1/cosh(x)^2', domain: [-4, 4] }], E: { from: -4, to: 4, y: 0 }, Elabel: 'E = 0', xlabel: 'x / a', ylabel: 'V / V₀', xticks: 4, yticks: 3, caption: 'The sech² well (the Pöschl–Teller potential), in units of its depth and width. Bound states lie below E = 0.' }),
          answer: n, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.floor(s), feedback: t`A level $n$ fits if $n + \tfrac12 < \sqrt{2mV_0}\,a/\hbar$; count $n = 0, 1, \dots$ — the ground state is $n = 0$.` }].filter((e) => e.value !== n),
          hints: [t`At $E = 0$: $\int p\,dx = \sqrt{2mV_0}\,a\int\mathrm{sech}\,u\,du = \pi a\sqrt{2mV_0}$.`, t`Levels exist for $n + \tfrac12 < s$, with $s = a\sqrt{V_0}\big/(\hbar/\sqrt{2m_e})$.`],
          teach: 'WKB counts bound states: the phase-space area under the well’s top, in units of h, minus a half.',
          explain: t`$s = ${a}\sqrt{${V0}}/${fmt(HB_SQ2M, 4)} = ${fmt(s, 4)}$, so levels $n = 0, \dots, ${n - 1}$ fit: ${n} states. The exact count for this potential is the smallest integer at least $\lambda = -\tfrac12 + \sqrt{\tfrac14 + s^2} = ${fmt(-0.5 + Math.sqrt(0.25 + s * s), 4)}$: also ${n}.`,
        };
      },
    }),
    mcq({
      id: 'overlap', difficulty: 3,
      prompt: t`The connection formulas match the Airy solution to the WKB forms in an “overlap region” on each side of the turning point. What must be true there?`,
      visual: wkbPic({ view: 'airy', z: -4 }, 'Ai(z) (blue) and the WKB forms (gold, dashed): they agree once |z| is a few units, and fail near z = 0.'),
      choices: [
        t`$|x - x_2|$ is several Airy lengths $\ell$ (so WKB works) yet small enough that $V$ is still nearly linear (so Airy works)`,
        t`$x = x_2$ exactly, where both solutions are known`,
        t`Far from the turning point, where $V$ can have any shape`,
        t`Inside the forbidden region only, because the oscillating side never matches`,
      ],
      answer: 0,
      why: {
        1: 'At the turning point WKB diverges, so nothing can be matched there.',
        2: 'Far away the linear approximation behind the Airy solution breaks down.',
        3: t`Both sides are matched: that is how the oscillating wave’s phase $-\pi/4$ is fixed.`,
      },
      hints: ['Each approximation has its own region of validity. The matching needs both at once.', t`WKB needs $|z| \gg 1$; the Airy solution needs $V$ to be linear. Where do both hold?`],
      teach: 'The patching works only if the potential stays linear over a few Airy lengths — a condition that holds better and better at high n.',
      explain: t`WKB needs $|z| \gg 1$; the linear potential needs $|x - x_2|$ small on the scale over which $V'$ changes. Both hold together when $\ell$ is short compared with that scale — the same slowly-varying condition as before, now applied to the turning point’s neighbourhood.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bouncer', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([1, 2, 3, 4]), ans = zW(n) * 1e6;
        return {
          prompt: t`**Quantum bouncing neutrons.** At the Institut Laue–Langevin (Nesvizhevsky et al., 2002) ultracold neutrons skimmed over a horizontal mirror under a slit, and the transmission rose in steps as the slit was opened: the neutrons have quantized bouncing levels in Earth’s gravity. Model it as $V = mgz$ above a hard floor (one wall, one soft turning point: $\int_0^{z_n}p\,dz = (n - \tfrac14)\pi\hbar$). Find the classical turning height $z_n$ of level $n = ${n}$, in μm. ($m_n = ${tex(MN, 6)}$ kg, $g = 9.807\ \text{m/s}^2$.)`,
          visual: wkbPic({ pot: 'bouncer', n, panels: ['energy'], hide: ['labels'] }, 'A particle above a hard floor in uniform gravity: the potential rises linearly with height (here drawn across), and each level has one soft turning point. Units ħ = m = g = 1.'),
          answer: ans, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: (LN * (1.5 * Math.PI * (n - 0.5)) ** (2 / 3)) * 1e6, feedback: t`The floor is a wall and the top a soft turning point: $(n - \tfrac14)$, not $(n - \tfrac12)$.` }, { value: (LN * (1.5 * Math.PI * n) ** (2 / 3)) * 1e6, feedback: t`A soft turning point costs a quarter: $(n - \tfrac14)\pi\hbar$, not $n\pi\hbar$.` }],
          hints: [t`$\int_0^{z_n}\sqrt{2m(E - mgz)}\,dz = \tfrac23\sqrt{2m}\,E^{3/2}/(mg)$ with $E = mgz_n$.`, t`This gives $z_n = \Bigl(\dfrac{\hbar^2}{2m^2g}\Bigr)^{1/3}\Bigl[\tfrac{3\pi}{2}\bigl(n - \tfrac14\bigr)\Bigr]^{2/3}$, and $(\hbar^2/2m^2g)^{1/3} = ${fmt(LN * 1e6, 4)}\ \mu$m.`],
          teach: 'Neutrons above a mirror have bouncing levels tens of micrometres high, and WKB with one wall and one soft turning point predicts them to within about 1%.',
          explain: t`$z_${n} = ${fmt(LN * 1e6, 4)}\ \mu\text{m}\times[\tfrac{3\pi}{2}(${n} - \tfrac14)]^{2/3} = ${fmt(ans, 4)}\ \mu$m. The exact answer, from the zeros of the Airy function, is $${fmt(LN * AZ[n - 1] * 1e6, 4)}\ \mu$m; the energy is $${fmt((MN * G0 * LN * AZ[n - 1]) / 1.602176634e-19 * 1e12, 3)}$ peV. The ILL transmission steps were consistent with these lowest levels — gravity acting on a quantum state, measured directly.`,
        };
      },
    }),
    mcq({
      id: 'cp-ho', difficulty: 2,
      prompt: t`Bohr–Sommerfeld with the connection-formula half, $\oint p\,dx = (n + \tfrac12)h$, gives $E_n = (n + \tfrac12)\hbar\omega$ for the harmonic oscillator. What does that say about WKB?`,
      visual: wkbPic({ pot: 'harmonic', n: 2, panels: ['energy', 'phase'] }, 'Oscillator levels, exact (solid) and WKB (dashed, on top of them), and the phase-space ellipse of the third level. Units ħ = m = 1.'),
      choices: [
        'Its energies happen to be exact for this potential, but the WKB wave functions are still only approximate (they diverge at the turning points)',
        'WKB is exact for every potential at every level',
        'The oscillator is the one potential where WKB fails',
        'The half is a fudge chosen to match the oscillator',
      ],
      answer: 0,
      why: {
        1: 'For the quartic well the WKB ground state is 18% low: exactness is special to a few potentials.',
        2: 'The levels come out exactly right, not wrong.',
        3: 'The half is derived from the Airy matching, and the same rule fixes the |x| well and the bouncer, where it is not exact but close.',
      },
      hints: ['Compare the dashed and solid levels, and remember what the WKB wave does at a turning point.'],
      teach: 'For the oscillator (and the Morse potential) the WKB quantization rule gives the exact spectrum; the wave functions remain approximate.',
      explain: t`The phase-space ellipse has area $2\pi E/\omega$; setting it to $(n + \tfrac12)h$ gives the exact spectrum. That is a property of the quadratic potential — corrections to WKB happen to vanish for it — not of WKB in general. The WKB $\psi$ still blows up at the turning points.`,
    }),
    num({
      id: 'cp-quartic', difficulty: 3,
      gen(r) {
        const [n1, n2] = r.pick([[1, 3], [2, 6], [1, 5], [3, 9]]);
        const ans = ((n2 + 0.5) / (n1 + 0.5)) ** (4 / 3);
        const ex = exactLevel('quartic', n2) / exactLevel('quartic', n1);
        return {
          prompt: t`For a quartic well $V = \beta x^4$, the WKB integral $\int p\,dx$ at energy $E$ scales as $E^{3/4}$. Using $(n + \tfrac12)\pi\hbar$, find the ratio $E_{${n2}}/E_{${n1}}$ predicted by WKB.`,
          visual: wkbPic({ pot: 'quartic', n: n2, panels: ['energy'], hide: ['labels'] }, 'The quartic well x⁴/2 and its levels (units ħ = m = 1). The chosen level is gold.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ((n2 + 0.5) / (n1 + 0.5)) ** (2 / 3), feedback: t`$E^{3/4} \propto n + \tfrac12$ means $E \propto (n + \tfrac12)^{4/3}$.` }, { value: (n2 / n1) ** (4 / 3), feedback: t`Keep the $\tfrac12$: $E \propto (n + \tfrac12)^{4/3}$.` }],
          hints: [t`$p = \sqrt{2m(E - \beta x^4)}$ and the turning point is at $(E/\beta)^{1/4}$: substituting $x = (E/\beta)^{1/4}u$ shows $\int p\,dx \propto E^{1/2}E^{1/4}$.`, t`So $E_n \propto (n + \tfrac12)^{4/3}$.`],
          teach: t`Scaling the WKB integral gives how levels grow with $n$ for any power-law well: $E \propto (n + \tfrac12)^{2k/(k+2)}$ for $V \propto |x|^k$.`,
          explain: t`$E_{${n2}}/E_{${n1}} = (${n2 + 0.5}/${n1 + 0.5})^{4/3} = ${fmt(ans, 4)}$. The exact ratio is ${fmt(ex, 4)}. For $V \propto |x|^k$ the rule gives $E \propto (n + \tfrac12)^{2k/(k + 2)}$: linear in $n$ for $k = 2$, and $n^2$ for a box ($k \to \infty$).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §9.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Nesvizhevsky et al., “Quantum states of neutrons in the Earth’s gravitational field”, Nature 415, 297 (2002)', url: 'https://doi.org/10.1038/415297a' },
    { label: 'NIST Digital Library of Mathematical Functions, §9 (Airy functions)', url: 'https://dlmf.nist.gov/9' },
  ],
});
