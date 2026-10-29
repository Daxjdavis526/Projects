// Partial-wave analysis (Griffiths & Schroeter §10.2; Sakurai §6.4). A
// spherically symmetric potential conserves angular momentum, so the
// scattering splits into channels l, each changed only by a phase shift δₗ:
// f(θ) = (1/k)Σ(2l + 1)e^{iδₗ} sin δₗ Pₗ(cos θ), σ = (4π/k²)Σ(2l + 1)sin²δₗ,
// the unitarity ceiling 4π(2l + 1)/k² and the optical theorem
// Im f(0) = kσ/4π. Partial waves l ≳ ka barely scatter (a classical impact
// parameter b = l/k must be < a). Worked: the hard sphere, δ₀ = −ka,
// tan δ₁ = j₁/n₁ ≈ −(ka)³/3. The square well's δ₀; the zero-energy resonance
// at g = π/2; the vanishing scattering length at tan g = g (g = 4.493) —
// the Ramsauer–Townsend effect. Transfer: neutron–proton scattering from the
// singlet and triplet scattering lengths a_s = −23.748 fm, a_t = 5.424 fm
// (σ = π(3a_t² + a_s²) = 20.5 b, against the measured 20.4 b for slow
// neutrons on free protons). Exact numbers from the q2b-scatter model.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { scatPic, HBARC_EVNM, r6 } from './_q2b.js';
import * as S from '../../src/viz/model/q2b-scatter.js';
import { MNC2 } from '../phys2710/_constants.js';

const t = String.raw;
const DEG = 180 / Math.PI;
const HS = (ka) => S.phaseShifts('hard', ka, 0, 3);
const EX = { ka: 0.5 };
EX.d = HS(EX.ka); EX.cs = S.crossSections(S.phaseShifts('hard', EX.ka), EX.ka);
const AS = -23.748, AT = 5.424;                     // fm, n–p singlet and triplet scattering lengths

export default lesson({
  id: 'phys4710.M6.2',
  title: 'Partial-wave analysis',
  minutes: 18, difficulty: 4,
  intro: t`A spherically symmetric potential cannot change a particle’s angular momentum. So break the incoming plane wave into angular-momentum channels — **partial waves** $l = 0, 1, 2, \dots$ — and each channel can only come back out with its phase shifted by some angle $\delta_l$. Everything about the scattering is in those phase shifts:

$$\begin{gathered} f(\theta) = \frac1k\sum_{l=0}^{\infty}(2l + 1)\,e^{i\delta_l}\sin\delta_l\,P_l(\cos\theta) \\ \sigma = \frac{4\pi}{k^2}\sum_{l=0}^{\infty}(2l + 1)\sin^2\delta_l \end{gathered}$$

At low energy only a few channels matter — roughly $l \lesssim ka$ for a target of radius $a$ — so a handful of numbers describe the whole angular pattern.`,
  symbols: [
    { tex: 'l', text: 'the orbital angular momentum quantum number of a channel: l = 0 (s), 1 (p), 2 (d) …' },
    { tex: '\\delta_l', text: 'the phase shift of channel l, in radians: how far the outgoing wave is pushed (δ < 0, repulsion) or pulled in (δ > 0, attraction) compared with no potential' },
    { tex: 'k', text: 'the wavenumber, p/ħ, in m⁻¹' },
    { tex: 'P_l(\\cos\\theta)', text: 'the Legendre polynomial of degree l: 1, cos θ, (3cos²θ − 1)/2 …' },
    { tex: '2l + 1', text: 'the number of m-states in channel l: higher channels carry more weight' },
    { tex: 'f(\\theta),\\ \\sigma', text: 'the scattering amplitude (a length) and the total cross section (an area)' },
  ],
  why: 'Phase shifts are how nuclear and particle physicists describe forces they cannot write down: resonances, scattering lengths and bound states all show up in δₗ.',
  visual: {
    type: 'q2b-scatter',
    title: 'Phase shifts at work',
    lead: t`A square well of radius $a$ and strength $g = \sqrt{2mV_0}\,a/\hbar$. Top: $d\sigma/d\Omega$ (polar, beam from the left). Middle: each channel’s $\sigma_l$ with its phase shift, against its ceiling. Bottom: $\sigma$ against $ka$.`,
    tasks: [
      'At ka = 0.3 only the l = 0 bar is visible and the pattern is round. Raise ka to 4: bars appear up to about l = 4, and the pattern leans forward.',
      'At ka = 0.2, slide g up through π/2 ≈ 1.57: σ shoots up as the well becomes just deep enough to hold a bound state (a zero-energy resonance), where δ₀ passes 90°.',
      'Set g = 4.5 at ka = 0.1: σ nearly vanishes. δ₀ has gone round to almost 180°, and sin δ₀ ≈ 0 — the Ramsauer–Townsend effect.',
    ],
    params: { target: 'well', ka: 0.3, g: 1.2, controls: ['target', 'ka', 'g'], lmax: 8 },
  },
  example: {
    prompt: t`Find the phase shifts of a hard sphere of radius $a$. Get $\delta_0$ exactly, estimate $\delta_1$ at low energy, and compute $\sigma$ at $ka = ${EX.ka}$.`,
    visual: scatPic({ target: 'hard', ka: EX.ka, panels: ['partials'], lmax: 4, hide: ['phases'] }, 'The hard sphere at ka = 0.5: the s-wave dominates; the p-wave is small and the rest are invisible.'),
    steps: [
      { label: 'Outside', text: t`Beyond the sphere $V = 0$, so the radial function is a mix of the free solutions: $R_l \propto j_l(kr)\cos\delta_l - n_l(kr)\sin\delta_l$. With no potential $\delta_l = 0$ and only $j_l$ appears.` },
      { label: 'Boundary', text: t`The wave cannot enter: $R_l(a) = 0$, so $\tan\delta_l = j_l(ka)/n_l(ka)$.` },
      { label: 's-wave', text: t`$j_0 = \sin x/x$, $n_0 = -\cos x/x$: $\tan\delta_0 = -\tan ka$, so $\delta_0 = -ka$ exactly. The wave $\sin(kr + \delta_0) = \sin k(r - a)$ is simply pushed out by $a$.` },
      { label: 'p-wave', text: t`For small $x$, $j_1 \approx x/3$ and $n_1 \approx -1/x^2$, so $\delta_1 \approx -(ka)^3/3$. In general $\delta_l \propto (ka)^{2l+1}$: higher channels die off fast at low energy.` },
      { label: 'Numbers', text: t`At $ka = ${EX.ka}$: $\delta_0 = ${fmt(EX.d[0] * DEG, 4)}^\circ$, $\delta_1 = ${fmt(EX.d[1] * DEG, 3)}^\circ$ (the estimate gives $${fmt((-(EX.ka ** 3) / 3) * DEG, 3)}^\circ$), $\delta_2 = ${fmt(EX.d[2] * DEG, 2)}^\circ$. In units of $\pi a^2$: $\sigma_0 = \dfrac{4}{(ka)^2}\sin^2\delta_0 = ${fmt(EX.cs.parts[0], 4)}$, $\sigma_1 = \dfrac{12}{(ka)^2}\sin^2\delta_1 = ${fmt(EX.cs.parts[1], 3)}$.` },
      { label: 'Total', text: t`$\sigma = ${fmt(EX.cs.total, 4)}\,\pi a^2$ — already below the zero-energy $4\pi a^2$, on its way to $2\pi a^2$.` },
    ],
    answer: t`$\tan\delta_l = j_l(ka)/n_l(ka)$; $\delta_0 = -ka$, $\delta_1 \approx -(ka)^3/3$; at $ka = ${EX.ka}$, $\sigma = ${fmt(EX.cs.total, 4)}\,\pi a^2$, nearly all s-wave.`,
  },
  practice: [
    num({
      id: 'sigma-deltas', difficulty: 2,
      gen(r) {
        const d0 = r.pick([20, 35, 60, 110, 150]), d1 = r.pick([3, 8, 15]), k = r.pick([0.2, 0.3, 0.5]);     // degrees, fm⁻¹
        const s0 = Math.sin(d0 / DEG) ** 2, s1 = Math.sin(d1 / DEG) ** 2;
        const ans = ((4 * Math.PI) / (k * k)) * (s0 + 3 * s1) / 100;      // b
        return {
          prompt: t`At $k = ${k}\ \text{fm}^{-1}$ a nuclear scattering experiment is fitted with $\delta_0 = ${d0}^\circ$, $\delta_1 = ${d1}^\circ$ and all higher phase shifts negligible. What is the total cross section, in barns? (1 b $= 100\ \text{fm}^2$.)`,
          visual: { type: 'graph', params: { x: [-0.6, 1.6], y: [0, 1.15], aspect: 'wide', xlabel: 'l', ylabel: 'sin²δₗ', xticks: 0, yticks: 4, axesAt: 'edge', curves: [{ param: ['0 + 0*t', `${r6(s0)}*t`], t: [0, 1], color: 'accent', width: 28 }, { param: ['1 + 0*t', `${r6(s1)}*t`], t: [0, 1], color: 'violet', width: 28 }], points: [{ x: 0, y: 0, r: 0, label: 'l = 0', labelAlign: 'center', labelDx: 0, labelDy: 12, color: 'ink2' }, { x: 1, y: 0, r: 0, label: 'l = 1', labelAlign: 'center', labelDx: 0, labelDy: 12, color: 'ink2' }] }, caption: 'sin²δₗ for the two channels: each is at most 1.' },
          answer: ans, units: 'b', tol: { rel: 0.01 },
          errors: [{ value: ((4 * Math.PI) / (k * k)) * (s0 + s1) / 100, feedback: t`Each channel carries a weight $2l + 1$: the p-wave counts three times.` }, { value: ((4 * Math.PI) / (k * k)) * (Math.sin(d0) ** 2 + 3 * Math.sin(d1) ** 2) / 100, feedback: 'Convert the phase shifts to radians (or use a calculator in degree mode).' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma = \dfrac{4\pi}{k^2}\bigl[\sin^2\delta_0 + 3\sin^2\delta_1\bigr]$.`, t`With $k$ in fm⁻¹, $4\pi/k^2$ is in fm²; divide by 100 for barns.`],
          teach: 'The total cross section is a sum over channels of (2l + 1)·sin²δₗ, each weighted by 4π/k².',
          explain: t`$\dfrac{4\pi}{k^2} = ${fmt((4 * Math.PI) / (k * k), 4)}\ \text{fm}^2$; $\sin^2\delta_0 = ${fmt(s0, 4)}$, $3\sin^2\delta_1 = ${fmt(3 * s1, 4)}$; $\sigma = ${fmt(ans * 100, 4)}\ \text{fm}^2 = ${fmt(ans, 4)}$ b.`,
        };
      },
    }),
    num({
      id: 'ceiling', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 6.67, 20, 100]);                                   // eV, neutron
        const k = Math.sqrt(2 * MNC2 * 1e6 * E) / (HBARC_EVNM * 1e6);           // fm⁻¹ (ħc in eV fm)
        const ans = (4 * Math.PI) / (k * k) / 100;
        return {
          prompt: t`What is the largest possible s-wave cross section, $4\pi/k^2$, for a neutron of kinetic energy $${E}$ eV scattering from a heavy nucleus? Give it in barns. ($m_nc^2 = ${fmt(MNC2, 8)}$ MeV, $\hbar c = 197.327$ MeV fm.)`,
          visual: scatPic({ target: 'well', ka: 0.2, g: 1.57, panels: ['partials'], lmax: 4 }, 'At a resonance the s-wave bar fills its ceiling: δ₀ = 90° and σ₀ = 4π/k².'),
          answer: ans, units: 'b', tol: { rel: 0.01 },
          errors: [{ value: ans * 3, feedback: 'For l = 0 the weight 2l + 1 is 1.' }, { value: ans / 4, feedback: t`The ceiling is $4\pi/k^2$, not $\pi/k^2$.` }],
          hints: [t`$\sin^2\delta_0 \le 1$, so $\sigma_0 \le 4\pi/k^2$.`, t`$k = \sqrt{2m_nc^2E}/\hbar c$ (non-relativistic; the nucleus’s recoil is negligible).`],
          teach: 'Unitarity caps each channel at 4π(2l + 1)/k² — huge for slow particles, which is why neutron resonances can have cross sections of thousands of barns.',
          explain: t`$k = \sqrt{2\times${fmt(MNC2, 6)}\times${tex(E * 1e-6, 3)}}/197.327 = ${tex(k, 4)}\ \text{fm}^{-1}$, so $4\pi/k^2 = ${tex(ans * 100, 4)}\ \text{fm}^2 = ${tex(ans, 4)}$ b. Real neutron resonances in heavy nuclei come close to such values — a cross section far larger than the nucleus itself, set by the neutron’s wavelength.`,
        };
      },
    }),
    mcq({
      id: 'lmax', difficulty: 2,
      prompt: t`Why do only partial waves with $l \lesssim ka$ scatter appreciably from a target of radius $a$?`,
      visual: scatPic({ target: 'hard', ka: 5, panels: ['partials'], lmax: 12 }, 'A hard sphere at ka = 5: the bars stop near l = 5.'),
      choices: [
        t`A particle with angular momentum $\hbar l$ and momentum $\hbar k$ has impact parameter $b \approx l/k$; if $b > a$ it misses the target`,
        t`Higher $l$ have higher energy, which the potential cannot absorb`,
        'The Legendre polynomials vanish for l > ka',
        'Selection rules forbid channels with l > ka',
      ],
      answer: 0,
      why: {
        1: 'All channels have the same energy; the centrifugal barrier keeps the high-l parts of the wave away from the target, but energy is not absorbed.',
        2: t`$P_l(\cos\theta)$ is never identically zero; the suppression is in $\delta_l$.`,
        3: 'There is no selection rule: δₗ falls off smoothly, as (ka)^(2l+1) at low energy.',
      },
      hints: [t`Classically $L = pb$: what is $b$ for $L = \hbar l$ and $p = \hbar k$?`],
      teach: 'Partial waves are angular-momentum channels: channel l passes at impact parameter about l/k, so the target only affects l up to about ka.',
      explain: t`$L = \hbar l = \hbar k b$ gives $b = l/k$. Waves with $b > a$ are kept away from the potential by the centrifugal barrier, so $\delta_l \approx 0$ for $l \gg ka$ — the reason low-energy scattering is described by one or two phase shifts.`,
    }),
    num({
      id: 'well-d0', difficulty: 3,
      gen(r) {
        const ka = r.pick([0.2, 0.4, 0.6]), g = r.pick([0.8, 1.2, 2.0, 2.5]);
        const Ka = Math.sqrt(ka * ka + g * g);
        let d = Math.atan((ka / Ka) * Math.tan(Ka)) - ka;
        if (Math.tan(Ka) < 0) d += Math.PI;                                      // continuous branch: Ka past π/2
        const ans = d * DEG;
        return {
          prompt: t`For an attractive square well, matching $\sin(kr + \delta_0)$ outside to $\sin Kr$ inside at $r = a$ gives $\tan(ka + \delta_0) = \dfrac{ka}{Ka}\tan Ka$, with $(Ka)^2 = (ka)^2 + g^2$. Find $\delta_0$ in degrees for $ka = ${ka}$ and $g = ${g}$. (Take the branch with $0 < ka + \delta_0 < \pi$.)`,
          visual: { type: 'graph', params: { x: [0, 3], y: [r6(-1.15 * Math.max(1, Math.abs(Math.sin(Ka) / Math.sin(ka + d)))), r6(1.15 * Math.max(1, Math.abs(Math.sin(Ka) / Math.sin(ka + d))))], aspect: 'wide', xlabel: 'r / a', ylabel: 'u(r)', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: `${r6(Math.sin(Ka) / Math.sin(ka + d))}*0 + sin(${r6(Ka)}*x)`, domain: [0, 1], color: 'accent', width: 2.4 }, { fn: `${r6(Math.sin(Ka) / Math.sin(ka + d))}*sin(${ka}*x + ${r6(d)})`, domain: [1, 3], color: 'accent', width: 2.4 }, { fn: `${r6(Math.sin(Ka) / Math.sin(ka + d))}*sin(${ka}*x)`, domain: [0, 3], color: 'ink3', width: 1.4, dash: [5, 4] }], vlines: [{ x: 1, color: 'ink4' }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'The s-wave u(r) = r·R(r): faster oscillation inside the well (r < a), then sin(kr + δ₀) outside; dashed, the free wave sin kr. The shift between them is the phase shift. Amplitudes not to scale.' },
          answer: ans, units: 'deg', tol: { rel: 0.01, abs: 0.2 },
          errors: [{ value: Math.atan((ka / Ka) * Math.tan(Ka)) * DEG, feedback: t`That is $ka + \delta_0$; subtract $ka$ (in degrees, $${fmt(ka * DEG, 4)}^\circ$).` }],
          hints: [t`$Ka = \sqrt{${ka}^2 + ${g}^2} = ${fmt(Ka, 4)}$; compute $\tan Ka$ in radians.`, t`$ka + \delta_0 = \arctan\bigl(\tfrac{ka}{Ka}\tan Ka\bigr)$, adding $180^\circ$ if the arctangent comes out negative. Then subtract $ka$.`],
          teach: 'An attractive well pulls the wave in (δ₀ > 0); the phase shift is fixed by matching logarithmic derivatives at the edge.',
          explain: t`$\tfrac{ka}{Ka}\tan Ka = ${fmt((ka / Ka) * Math.tan(Ka), 4)}$, so $ka + \delta_0 = ${fmt((ka + d) * DEG, 4)}^\circ$ and $\delta_0 = ${fmt(ans, 4)}^\circ$. ${g > Math.PI / 2 ? 'The well is deep enough to hold a bound state (g > π/2), and δ₀ has passed 90°: Levinson’s theorem counts bound states in units of π.' : 'The well holds no bound state yet (g < π/2), and δ₀ stays below 90°.'}`,
        };
      },
    }),
    mcq({
      id: 'optical', difficulty: 3,
      prompt: t`The optical theorem says $\operatorname{Im}f(0) = \dfrac{k\sigma}{4\pi}$. What does it express?`,
      visual: scatPic({ target: 'hard', ka: 6, panels: ['polar'] }, 'A hard sphere at ka = 6 (polar diagram, beam from the left): the forward lobe is where the scattered wave interferes with the beam.'),
      choices: [
        'Conservation of probability: whatever is scattered must be removed from the forward beam, by interference between the beam and the forward scattered wave',
        'That forward scattering is always the strongest',
        'That the imaginary part of f is unmeasurable',
        'That the cross section is proportional to the energy',
      ],
      answer: 0,
      why: {
        1: 'It constrains the forward amplitude, not the shape of the angular distribution.',
        2: 'Im f(0) is measured through σ — that is the theorem’s use.',
        3: t`$k$ appears because $f$ and $\sigma$ have different units; $\sigma$ itself can fall with energy.`,
      },
      hints: [t`Each term of $f(0)$ is $(2l + 1)e^{i\delta_l}\sin\delta_l/k$: what is its imaginary part?`, t`Compare that with each term of $\sigma$.`],
      teach: 'The optical theorem is unitarity: the beam loses exactly what is scattered, through interference in the forward direction.',
      explain: t`$\operatorname{Im}\bigl[e^{i\delta_l}\sin\delta_l\bigr] = \sin^2\delta_l$, so $\operatorname{Im}f(0) = \frac1k\sum(2l + 1)\sin^2\delta_l = \frac{k}{4\pi}\sigma$. Physically, the scattered wave in the forward direction interferes destructively with the incident one, removing flux at just the rate the particles are scattered elsewhere.`,
    }),
    mcq({
      id: 'ramsauer', difficulty: 3,
      prompt: t`Slow electrons pass through argon gas almost without scattering at an energy below 1 eV (the Ramsauer–Townsend effect), though argon atoms attract them strongly. How do partial waves explain it?`,
      visual: scatPic({ target: 'well', ka: 0.1, g: 4.5, panels: ['sigma'] }, 'σ against ka for a strong attractive well (g = 4.5): almost zero at low ka.'),
      choices: [
        t`The deep attraction turns $\delta_0$ through nearly $180^\circ$, so $\sin\delta_0 \approx 0$; higher channels are still negligible at that energy, so $\sigma$ nearly vanishes`,
        'The electrons are too fast to be deflected',
        'Argon has a closed shell, so it has no potential at all',
        'The electrons tunnel through the atom without interacting',
      ],
      answer: 0,
      why: {
        1: 'At less than 1 eV they are slow: ka is small and s-wave scattering dominates.',
        2: 'A closed shell still produces a strong short-range potential (and polarizability); the effect needs a strong well.',
        3: 'Tunnelling is not involved: the wave goes over and through an attractive well and comes out with a phase shift of π, indistinguishable from none.',
      },
      hints: [t`$\sigma_0 \propto \sin^2\delta_0$. Which values of $\delta_0$ give zero?`, 'A strong attractive well pulls the wave in a long way. How far can the phase shift go?'],
      teach: 'A phase shift of π is invisible: a strong attractive well can make a target transparent at one energy.',
      explain: t`Only $\sin^2\delta_l$ enters $\sigma$, so $\delta_0 = \pi$ scatters nothing. A strong well pulls the s-wave in by nearly a whole half-wavelength; at the right energy $\delta_0 = 180^\circ$ exactly, and with $\delta_1, \delta_2$ still small the gas is nearly transparent.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-np', difficulty: 3, transfer: true,
      gen(r) {
        const which = r.pick(['total', 'singlet', 'triplet']);
        const sT = 4 * Math.PI * AT * AT / 100, sS = 4 * Math.PI * AS * AS / 100, ans = which === 'total' ? 0.75 * sT + 0.25 * sS : which === 'singlet' ? sS : sT;
        return {
          prompt: t`Water slows the neutrons in a reactor (or in a nuclear thermal rocket’s moderator) mostly by scattering them off protons. At low energy the n–p force depends on the spins: the singlet scattering length is $a_s = ${AS}$ fm and the triplet $a_t = ${AT}$ fm, with $\sigma = 4\pi a^2$ for each. ${which === 'total' ? 'For unpolarized neutrons and protons, three quarters of pairs are in the triplet and one quarter in the singlet. What is the cross section, in barns?' : `What is the ${which} cross section, in barns?`}`,
          visual: scatPic({ target: 'well', ka: 0.05, g: 1.4, panels: ['polar'] }, 'Low-energy scattering is isotropic: only the scattering length matters (schematic well).'),
          answer: ans, units: 'b', tol: { rel: 0.01 },
          errors: [{ value: 0.5 * sT + 0.5 * sS, feedback: 'Three of the four spin states are triplet: weight them ¾ and ¼.' }, { value: 4 * Math.PI * (0.75 * AT + 0.25 * AS) ** 2 / 100, feedback: 'Average the cross sections, not the scattering lengths: the two spin channels do not interfere.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_s = 4\pi a_s^2$ and $\sigma_t = 4\pi a_t^2$, with 1 b $= 100\ \text{fm}^2$.`, t`Unpolarized: $\sigma = \tfrac34\sigma_t + \tfrac14\sigma_s = \pi(3a_t^2 + a_s^2)$.`],
          teach: 'Spin-dependent forces need a scattering length per spin channel; the large negative singlet length is a nearly bound state (the dineutron-like virtual state of n–p).',
          explain: t`$\sigma_t = ${fmt(sT, 4)}$ b, $\sigma_s = ${fmt(sS, 4)}$ b, and the unpolarized average is $${fmt(0.75 * sT + 0.25 * sS, 4)}$ b. The measured cross section of slow neutrons on free protons is 20.4 b — the singlet channel, nearly bound, does most of the scattering.`,
        };
      },
    }),
    num({
      id: 'cp-sigma', difficulty: 2,
      gen(r) {
        const ka = r.pick([0.4, 0.8, 1.2]), g = r.pick([1, 2, 3]);
        const d = S.phaseShifts('well', ka, g, 1), ans = (4 / (ka * ka)) * (Math.sin(d[0]) ** 2 + 3 * Math.sin(d[1]) ** 2);
        return {
          prompt: t`A square well at $ka = ${ka}$ has $\delta_0 = ${fmt(d[0] * DEG, 4)}^\circ$ and $\delta_1 = ${fmt(d[1] * DEG, 4)}^\circ$ (higher ones negligible). What is $\sigma$, in units of $\pi a^2$?`,
          visual: scatPic({ target: 'well', ka, g, panels: ['polar'] }, 'The angular distribution these phase shifts produce (polar diagram, beam from the left).'),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (4 / (ka * ka)) * (Math.sin(d[0]) ** 2 + Math.sin(d[1]) ** 2), feedback: 'The p-wave has weight 2l + 1 = 3.' }, { value: (4 / ka) * (Math.sin(d[0]) ** 2 + 3 * Math.sin(d[1]) ** 2), feedback: t`$\sigma/\pi a^2 = \dfrac{4}{(ka)^2}\sum(2l + 1)\sin^2\delta_l$: square the $ka$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma = \dfrac{4\pi}{k^2}\sum(2l + 1)\sin^2\delta_l$, so $\dfrac{\sigma}{\pi a^2} = \dfrac{4}{(ka)^2}\bigl[\sin^2\delta_0 + 3\sin^2\delta_1\bigr]$.`],
          teach: 'Partial cross sections add: σ/πa² = (4/(ka)²)Σ(2l + 1) sin²δₗ.',
          explain: t`$\dfrac{4}{${ka}^2}\bigl[${fmt(Math.sin(d[0]) ** 2, 4)} + 3\times${fmt(Math.sin(d[1]) ** 2, 4)}\bigr] = ${fmt(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-res', difficulty: 2,
      prompt: t`As the energy rises through a resonance in channel $l$, the phase shift $\delta_l$ climbs rapidly through $90^\circ$. What happens to $\sigma_l$ there?`,
      visual: scatPic({ target: 'well', ka: 0.2, g: 1.6, panels: ['partials'], lmax: 4, hide: ['phases'] }, 'Partial cross sections near an s-wave resonance.'),
      choices: [
        t`It reaches its ceiling $4\pi(2l + 1)/k^2$, because $\sin^2\delta_l = 1$`,
        'It vanishes, because the phase shift is large',
        'It becomes infinite',
        'Nothing special: only the total cross section changes',
      ],
      answer: 0,
      why: {
        1: t`It vanishes at $\delta_l = 180^\circ$, not $90^\circ$.`,
        2: t`Unitarity caps it: $\sin^2\delta_l \le 1$ keeps $\sigma_l$ finite at any nonzero $k$.`,
        3: t`$\sigma_l$ is the piece of the total that changes: it is maximal.`,
      },
      hints: [t`$\sigma_l = \dfrac{4\pi}{k^2}(2l + 1)\sin^2\delta_l$.`],
      teach: 'A resonance is δₗ sweeping through 90°, where that channel scatters as much as quantum mechanics allows.',
      explain: t`$\sin^2 90^\circ = 1$, so $\sigma_l = 4\pi(2l + 1)/k^2$, the unitarity limit. The sharper the rise of $\delta_l$, the narrower the peak — and the longer-lived the quasi-bound state behind it.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §10.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'NIST neutron scattering lengths (free-proton cross section)', url: 'https://www.ncnr.nist.gov/resources/n-lengths/' },
  ],
});
