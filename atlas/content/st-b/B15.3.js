// Why ADM is weakly hyperbolic and BSSN works — a concept lesson. ADM (in
// York's 1979 form) with a fixed lapse and shift is only weakly hyperbolic:
// zero-speed modes without a full set of eigenvectors (B12.2). The Maxwell
// analogue of Knapp, Walker & Baumgarte (2002), cut to one dimension (my own
// reduction, checked here): ADM-like (a = ∂ₓAₓ, E) a_t = −E_x, E_t = 0 —
// a Jordan block at speed 0, a Gauss violation ε cos kx makes a = εkt sin kx;
// BSSN-like, with Γ = ∂ᵢAⁱ promoted to a variable and Gauss's law substituted
// into its equation: a_t = −E_x, E_t = −a_x + Γ_x, Γ_t = 0 — speeds −1, 0, 1,
// strongly hyperbolic; the same data give a = ε sin kx sin kt. Adding a
// fraction q of the constraint: speeds 0, ±√(1 − q): q = 1 is ADM-like
// (defective), q > 1 not hyperbolic. BSSN: φ, K, γ̃ᵢⱼ (det 1), Ãᵢⱼ (traceless),
// Γ̃ⁱ = −∂ⱼγ̃ⁱʲ: 1 + 1 + 6 + 6 + 3 = 17 variables, with the momentum constraint
// added to the Γ̃ⁱ equation (Shibata & Nakamura 1995; Baumgarte & Shapiro
// 1998). Strong hyperbolicity with suitable gauges: Beyer & Sarbach (2004);
// Gundlach & Martín-García (2006) for the moving-puncture conditions, apart
// from special shift values. 2005: Pretorius (generalized harmonic, arXiv
// July 2005, PRL Sept 2005); moving punctures, Campanelli et al. and Baker et
// al., both arXiv November 2005, PRL 96, 111101 and 111102 (March 2006).
import { mcq, multi, num, order, lesson } from '../../src/core/content.js';
import { SRC } from './_pde.js';
import { tex } from '../../src/core/format.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const EPS = 0.05;
const KWB = { label: 'A. M. Knapp, E. J. Walker & T. W. Baumgarte, Illustrating stability properties of numerical relativity in electrodynamics, Phys. Rev. D 65, 064031 (2002)', url: 'https://doi.org/10.1103/PhysRevD.65.064031' };
const SN = { label: 'M. Shibata & T. Nakamura, Evolution of three-dimensional gravitational waves: harmonic slicing case, Phys. Rev. D 52, 5428 (1995)', url: 'https://doi.org/10.1103/PhysRevD.52.5428' };
const BS = { label: 'T. W. Baumgarte & S. L. Shapiro, Numerical integration of Einstein’s field equations, Phys. Rev. D 59, 024007 (1998)', url: 'https://doi.org/10.1103/PhysRevD.59.024007' };
const CLMZ = { label: 'M. Campanelli, C. O. Lousto, P. Marronetti & Y. Zlochower, Accurate evolutions of orbiting black-hole binaries without excision, Phys. Rev. Lett. 96, 111101 (2006)', url: 'https://doi.org/10.1103/PhysRevLett.96.111101' };
const BAKER = { label: 'J. G. Baker, J. Centrella, D.-I. Choi, M. Koppitz & J. van Meter, Gravitational-wave extraction from an inspiraling configuration of merging black holes, Phys. Rev. Lett. 96, 111102 (2006)', url: 'https://doi.org/10.1103/PhysRevLett.96.111102' };
const GMG = { label: 'C. Gundlach & J. M. Martín-García, Well-posedness of formulations of the Einstein equations with dynamical lapse and shift conditions, Phys. Rev. D 74, 024016 (2006)', url: 'https://doi.org/10.1103/PhysRevD.74.024016' };

// the 1D Maxwell analogue: start a = 0, Γ = 0, E = ε cos kx (a Gauss violation)
const W = 'step(0.5 - abs(sys))', B = 'step(0.5 - abs(sys - 1))';
const A = { w: `${EPS}*k1*tt*sin(k1*x)`, b: `${EPS}*sin(k1*x)*sin(k1*tt)` };
const E = { w: `${EPS}*cos(k1*x)`, b: `${EPS}*cos(k1*x)*cos(k1*tt)` };
const analogue = (extra = {}, caption) => ({
  type: 'graph',
  params: {
    x: [0, 6.2832], y: [-3.2, 3.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'a, E',
    curves: [
      { fn: A.w, color: 'accent', width: 2.2, when: W, samples: 1600 }, { fn: E.w, color: 'gold', width: 1.4, dash: [4, 3], when: W, samples: 1600 },
      { fn: A.b, color: 'accent', width: 2.2, when: B, samples: 1600 }, { fn: E.b, color: 'gold', width: 1.4, dash: [4, 3], when: B, samples: 1600 },
    ],
    ...extra,
  },
  caption,
});
const countBars = {
  type: 'graph',
  params: {
    x: [0, 18], y: [-0.2, 2.6], aspect: 'wide', axesAt: 'edge', xlabel: 'variables per point', ylabel: '', yticks: 0, xticks: 9,
    shade: [
      { fn: '2.1', lower: '1.5', from: 0, to: 6, color: 'accent', alpha: 0.5 }, { fn: '2.1', lower: '1.5', from: 6, to: 12, color: 'violet', alpha: 0.5 },
      { fn: '0.9', lower: '0.3', from: 0, to: 1, color: 'gold', alpha: 0.6 }, { fn: '0.9', lower: '0.3', from: 1, to: 2, color: 'warn', alpha: 0.6 },
      { fn: '0.9', lower: '0.3', from: 2, to: 8, color: 'accent', alpha: 0.5 }, { fn: '0.9', lower: '0.3', from: 8, to: 14, color: 'violet', alpha: 0.5 }, { fn: '0.9', lower: '0.3', from: 14, to: 17, color: 'good', alpha: 0.6 },
    ],
    points: [{ x: 0.2, y: 2.35, r: 0, label: 'ADM: γᵢⱼ and Kᵢⱼ', color: 'ink2' }, { x: 0.2, y: 1.15, r: 0, label: 'BSSN: φ, K, γ̃ᵢⱼ, Ãᵢⱼ, Γ̃ⁱ', color: 'ink2' }],
  },
};

export default lesson({
  id: 'st-b.B15.3',
  kind: 'concept',
  title: 'Why ADM is weakly hyperbolic and BSSN works',
  minutes: 15, difficulty: 4,
  intro: t`The 3+1 equations of lesson B15.1, as numerical relativists wrote them for decades (the “ADM” equations, really York’s 1979 form), have real characteristic speeds — but, with the lapse and shift fixed in advance, some of their modes travel at **zero speed and lack a full set of eigenvectors**. That is lesson B12.2’s weak hyperbolicity: short-wavelength errors grow like $k\,t$, faster on finer grids. Codes built on them ran, then crashed. The **BSSN** formulation (Shibata and Nakamura, 1995; Baumgarte and Shapiro, 1998) rewrites the same equations with new variables and — the crucial step — **adds a multiple of the momentum constraint** to one of them. On exact solutions nothing changes; but the principal part does, and with suitable gauge conditions the system becomes strongly hyperbolic. A one-dimensional cut of a Maxwell analogue (Knapp, Walker and Baumgarte, 2002) shows the whole story in two matrices, for $\mathbf u_t = \mathsf M\,\mathbf u_x$:

$$\mathsf M_{\text{ADM-like}} = \begin{pmatrix} 0 & -1 \\ 0 & 0 \end{pmatrix},\qquad \mathsf M_{\text{BSSN-like}} = \begin{pmatrix} 0 & -1 & 0 \\ -1 & 0 & 1 \\ 0 & 0 & 0 \end{pmatrix}.$$`,
  symbols: [
    { tex: 'a = \\partial_x A_x', text: 'the longitudinal part of the vector potential, differentiated: the analogue of the metric’s gauge-sensitive part' },
    { tex: 'E', text: 'the electric field along $x$: the analogue of the extrinsic curvature' },
    { tex: '\\Gamma = \\partial_iA^i', text: 'the divergence of the potential, promoted to a variable of its own — the analogue of BSSN’s $\\tilde\\Gamma^i$' },
    { tex: '\\mathsf M', text: 'the principal matrix: its eigenvalues are the characteristic speeds (here in units of $c$)' },
    { tex: '\\mathbf u', text: 'the list of fields: $(a, E)$ or $(a, E, \\Gamma)$' },
  ],
  why: t`This rewriting, with the right gauge, is what turned crashing codes into the 2005 breakthroughs — and every LIGO–Virgo–KAGRA detection of merging black holes is interpreted with waveform models calibrated to such simulations. The Road to Einstein covers the physics of [the 3+1 split, BSSN and moving punctures](#/lesson/gr.S32.d).`,
  visual: {
    type: 'graph',
    title: 'Same physics, different fates',
    lead: t`Start both Maxwell analogues with a small violation of Gauss’s law, $E = ${EPS}\cos kx$, and $a = \Gamma = 0$. Raise the wavenumber $k$ and the time $t$; watch $a$ (blue) beside $E$ (gold, dashed).`,
    tasks: [
      t`ADM-like: $a = ${EPS}\,kt\sin kx$ — the violation sits still (zero speed) and feeds $a$ for ever. Double $k$: double the growth.`,
      t`BSSN-like: the same violation becomes a pair of waves moving at the speed of light; $a$ never exceeds ${EPS}.`,
      t`Push $k$ to 20 and $t$ to 3 in each: a factor of 60 against a factor of 1.`,
    ],
    params: analogue({
      choices: [{ key: 'sys', label: 'Formulation', options: [[0, 'ADM-like'], [1, 'BSSN-like']], value: 0, explain: 'ADM-like: $a_t = -E_x$, $E_t = 0$. BSSN-like: $a_t = -E_x$, $E_t = -a_x + \\Gamma_x$, $\\Gamma_t = 0$ (Gauss’s law substituted).' }],
      sliders: [
        { key: 'k1', label: 'Wavenumber $k$', min: 1, max: 20, step: 1, value: 4, explain: 'How fine the violation is: $k$ crests per $2\\pi$.' },
        { key: 'tt', label: 'Time $t$', min: 0, max: 3, step: 0.05, value: 1, explain: 'How long the system has run (units with $c = 1$).' },
      ],
      readouts: [{ label: 'largest $|a|$', expr: `${W}*${EPS}*k1*tt + ${B}*${EPS}*abs(sin(k1*tt))`, digits: 3, zero: 1e-9 }],
    }).params,
    caption: t`Exact solutions of the two one-dimensional analogues in vacuum ($\rho = 0$), periodic in $x$, units with $c = 1$. A teaching model: Einstein’s equations are nonlinear and three-dimensional, but the mechanism — a zero-speed mode with a missing eigenvector, removed by adding a constraint — is the same.`,
  },
  example: {
    prompt: t`Classify both analogue systems, solve each from $a = \Gamma = 0$, $E = \varepsilon\cos kx$, and compare $|a|$ at $k = 50$, $t = 2$ for $\varepsilon = ${EPS}$.`,
    visual: analogue({ constants: { sys: 0, k1: 6, tt: 1.5 } }, t`The ADM-like system at $k = 6$, $t = 1.5$: $a$ has grown to $${r3(EPS * 6 * 1.5)}$ from a violation of size ${EPS}.`),
    steps: [
      { label: 'Where they come from', text: t`Maxwell in temporal gauge: $\partial_t\vec A = -\vec E$, $\partial_t\vec E = \nabla(\nabla\cdot\vec A) - \nabla^2\vec A$. Along $x$ alone the two terms cancel: $E_t = 0$, and $a = \partial_xA_x$ obeys $a_t = -E_x$.` },
      { label: 'ADM-like', text: t`$\mathsf M = \begin{pmatrix} 0 & -1 \\ 0 & 0 \end{pmatrix}$: eigenvalue 0 twice, one eigenvector — a Jordan block. $E = \varepsilon\cos kx$ stays put and $a_t = \varepsilon k\sin kx$, so $a = \varepsilon\,kt\sin kx$.` },
      { label: 'BSSN-like', text: t`Treat $\Gamma = \partial_iA^i$ as a variable: $E_t = -a_x + \Gamma_x$, and $\Gamma_t = -\nabla\cdot\vec E$, which Gauss’s law lets us replace by $-\rho = 0$. Now $\det(\mathsf M - \lambda\mathsf I) = -\lambda(\lambda^2 - 1)$: speeds $-1$, 0, $+1$, distinct, so three eigenvectors — strongly hyperbolic.` },
      { label: 'Solve it', text: t`$\Gamma = 0$; $a$ and $E$ form a wave system: $a = \varepsilon\sin kx\,\sin kt$, $E = \varepsilon\cos kx\,\cos kt$ (check: $a_t = \varepsilon k\sin kx\cos kt = -E_x$ ✓).` },
      { label: 'Numbers', text: t`ADM-like: $|a| = \varepsilon kt = ${EPS}\times50\times2 = ${r3(EPS * 100)}$. BSSN-like: $|a| \le \varepsilon = ${EPS}$. A hundredfold difference, growing in proportion to $k$ — and a grid holds $k$ up to $\pi/\Delta x$.` },
      { label: 'The lesson', text: t`Substituting a constraint changed the principal matrix, not the physics: on solutions with $\nabla\cdot\vec E = \rho$, both systems agree. Off them — and numerical solutions always are slightly off — one formulation lets violations pile up, the other sends them away at light speed.` },
    ],
    answer: t`ADM-like: Jordan block at speed 0, $a = \varepsilon kt\sin kx$, $|a| = ${r3(EPS * 100)}$ at $k = 50$, $t = 2$. BSSN-like: speeds $-1, 0, 1$, strongly hyperbolic, $|a| \le \varepsilon = ${EPS}$.`,
  },
  practice: [
    num({
      id: 'bssn-count', difficulty: 1,
      prompt: t`BSSN evolves the conformal factor $\phi$ ($\gamma_{ij} = e^{4\phi}\tilde\gamma_{ij}$), the trace $K$ of the extrinsic curvature, the conformal metric $\tilde\gamma_{ij}$ (symmetric, $3\times3$), the trace-free extrinsic curvature $\tilde A_{ij}$ (symmetric, $3\times3$) and the conformal connection functions $\tilde\Gamma^i = -\partial_j\tilde\gamma^{ij}$ (one per direction). How many functions per point does it evolve?`,
      visual: { type: 'graph', params: { ...countBars.params, shade: countBars.params.shade.slice(0, 2), points: countBars.params.points.slice(0, 1) }, caption: 'ADM’s 12 variables per point: γᵢⱼ (6) and Kᵢⱼ (6). BSSN’s are the question.' },
      answer: 17, tol: { rel: 0, abs: 0.5 },
      errors: [{ value: 12, feedback: 'That is ADM’s count. BSSN adds the scalars φ and K and the three Γ̃ⁱ, keeping two symmetric 3×3 arrays.' }, { value: 23, feedback: 'The symmetric arrays have 6 components each, not 9.' }],
      hints: ['Two scalars, two symmetric 3×3 arrays (6 each), one vector (3).'],
      teach: 'BSSN evolves 17 functions where ADM evolves 12: more variables, related by new constraints, but better behaved.',
      explain: t`$1 + 1 + 6 + 6 + 3 = 17$. They are not independent: $\det\tilde\gamma_{ij} = 1$, $\tilde\gamma^{ij}\tilde A_{ij} = 0$ and $\tilde\Gamma^i = -\partial_j\tilde\gamma^{ij}$ are new constraints. The extra variables are what let the momentum constraint be substituted into the $\tilde\Gamma^i$ equation.`,
    }),
    mcq({
      id: 'classify', difficulty: 2,
      prompt: t`Classify the ADM-like system $a_t = -E_x$, $E_t = 0$.`,
      visual: analogue({ constants: { sys: 0, k1: 10, tt: 1 } }, 'The ADM-like system at k = 10, t = 1: the violation in E (gold) has not moved; a (blue) has grown.'),
      choices: ['weakly hyperbolic only: real speeds (both zero) but a single eigenvector', 'strongly hyperbolic: its eigenvalues are real', 'not hyperbolic: complex speeds', 'parabolic'],
      answer: 0,
      why: { 1: t`Real eigenvalues give weak hyperbolicity only; $\begin{pmatrix} 0 & -1 \\ 0 & 0 \end{pmatrix}$ has the eigenvalue 0 twice with one eigenvector.`, 2: 'Both eigenvalues are 0: real.', 3: 'There is no diffusion term; the type is decided by the eigenvalues and eigenvectors of M.' },
      hints: [t`Find the eigenvectors of $\begin{pmatrix} 0 & -1 \\ 0 & 0 \end{pmatrix}$.`, t`Only multiples of $(1, 0)$ satisfy $\mathsf M\mathbf e = 0$.`],
      teach: 'A repeated zero speed without a full set of eigenvectors is the signature of weak hyperbolicity — the ADM disease.',
      explain: t`$\mathsf M$ is nilpotent, $\mathsf M^2 = 0$, so $e^{ik\mathsf Mt} = \mathsf I + ik t\mathsf M$: growth $\propto kt$, exactly lesson B12.2’s Jordan block with $\lambda = 0$.`,
    }),
    num({
      id: 'growth', difficulty: 2,
      gen(r) {
        const eps = r.pick([1e-6, 1e-8, 1e-10]), N = r.pick([128, 256, 512]), T = r.pick([50, 200]);
        const k = N / 2, amp = eps * k * T;
        return {
          prompt: t`In the ADM-like analogue on a periodic grid of length $2\pi$ with $N = ${N}$ points, round-off leaves a Gauss violation of amplitude $${tex(eps)}$ in the finest mode, $k = \pi/\Delta x = N/2$. Using $|a| = \varepsilon kt$, how large is $a$ at $t = ${T}$?`,
          visual: analogue({ constants: { sys: 0, k1: 16, tt: 2 } }, 'Growth in proportion to k t (illustrative k and t).'),
          answer: amp, tol: { rel: 0.005 },
          errors: [{ value: eps * T, feedback: 'Multiply by k too: the growth is proportional to the wavenumber.' }, { value: eps * N * T, feedback: 'k = π/Δx = π/(2π/N) = N/2.' }],
          hints: [t`$k = N/2 = ${k}$.`, t`$|a| = \varepsilon\,k\,t$.`],
          teach: 'In a weakly hyperbolic formulation, refining the grid raises the finest k and so the growth.',
          explain: t`$|a| = \varepsilon\times${k}\times${T} = ${tex(amp, 3)}$. Double $N$ and it doubles: refinement makes things worse. With the nonlinear, lower-order terms of the real equations the growth turns exponential (B12.2).`,
        };
      },
    }),
    mcq({
      id: 'trick', difficulty: 2,
      prompt: t`What is the essential step that turns the weakly hyperbolic system into a strongly hyperbolic one — in the analogue, and in BSSN?`,
      visual: analogue({ constants: { sys: 1, k1: 10, tt: 1 } }, 'The BSSN-like system at k = 10, t = 1: the violation has become waves, and a stays small.'),
      choices: ['Promote a combination of derivatives to a new variable and use a constraint to rewrite its evolution equation, which changes the principal part', 'Solve the constraints again at every time step', 'Use a finer grid and a higher-order scheme', 'Change the physical content of the equations'],
      answer: 0,
      why: { 1: 'BSSN does not re-solve the constraints; it propagates them in a better-behaved way.', 2: 'A finer grid makes a weakly hyperbolic system worse, not better.', 3: 'The constraint is zero on solutions: the exact solutions are the same.' },
      hints: ['In the analogue, what happened to the Γ equation?', 'Γₜ = −∇·E became Γₜ = −ρ by Gauss’s law: a constraint was substituted.'],
      teach: 'Adding multiples of the constraints changes the principal part (and so hyperbolicity) without changing the solutions.',
      explain: t`In the analogue, $\Gamma = \partial_iA^i$ became a variable and $\Gamma_t = -\nabla\cdot\vec E$ was replaced by $-\rho$ using Gauss’s law. In BSSN, $\tilde\Gamma^i$ becomes a variable and the momentum constraint is added to its evolution equation. Both are legal because the added terms vanish on solutions; both change the eigenvector structure of the principal part.`,
    }),
    order({
      id: 'history', difficulty: 2,
      prompt: t`Put these milestones of solving Einstein’s equations as an initial-value problem in order.`,
      visual: { type: 'graph', params: { x: [1950, 2020], y: [0, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'year', ylabel: '', yticks: 0, xticks: 7, curves: [], vlines: [{ x: 1952, color: 'ink3' }, { x: 2015, color: 'ink3' }] }, caption: 'Seven decades, from the first existence theorem to the first detection.' },
      items: ['Fourès-Bruhat proves local existence and uniqueness in harmonic coordinates', 'Arnowitt, Deser and Misner write the Hamiltonian 3+1 form', 'York writes the 3+1 equations in the form codes used for decades (“ADM”)', 'Shibata and Nakamura, then Baumgarte and Shapiro, introduce the BSSN variables', 'Pretorius evolves a binary black-hole merger in generalized harmonic gauge', 'Two groups announce moving-puncture BSSN mergers, independently', 'LIGO detects GW150914 and compares it with numerical-relativity waveforms'],
      hints: ['The existence theorem came first (1952); the detection last (2015).', 'BSSN: 1995 and 1998. Pretorius’s paper appeared in July 2005, the moving-puncture papers in November 2005.'],
      teach: 'From theorem (1952) to formulations (1962–1998) to working codes (2005) to detection (2015).',
      explain: t`1952 Fourès-Bruhat; 1962 ADM (papers from 1959); 1979 York; 1995 Shibata–Nakamura and 1998 Baumgarte–Shapiro; July 2005 Pretorius (published September 2005); November 2005 Campanelli, Lousto, Marronetti and Zlochower, and Baker, Centrella, Choi, Koppitz and van Meter (both published in March 2006); 2015 GW150914.`,
    }),
    multi({
      id: 'puncture', difficulty: 3,
      prompt: t`Which ingredients made the 2005 moving-puncture simulations work? (Select all that apply.)`,
      visual: { ...countBars, caption: 'The BSSN variables (below) against ADM’s (above).' },
      choices: ['the BSSN variables, with the momentum constraint added to the Γ̃ⁱ equation', '“1+log” slicing, a lapse that collapses near the black holes and keeps slices away from the singularities', 'a Gamma-driver shift, which lets the coordinate punctures move across the grid', 'excising the black-hole interiors from the grid', 'solving the four constraint equations again at every time step'],
      answer: [0, 1, 2],
      why: { 3: 'Excision was Pretorius’s approach; the point of moving punctures was to evolve without excision, letting the gauge handle the singularities.', 4: 'Constraints are solved only for the initial data; afterwards they are monitored.' },
      hints: ['The RIT paper’s title is “Accurate evolutions of orbiting black-hole binaries without excision”.', 'Both lapse and shift had to be evolved by their own equations.'],
      teach: 'Moving punctures = BSSN variables + 1+log slicing + Gamma-driver shift, with no excision.',
      explain: t`BSSN supplies a formulation that, with these gauges, is strongly hyperbolic (Gundlach and Martín-García, 2006, found it strongly hyperbolic except for special combinations of the lapse and shift, where characteristic speeds coincide); 1+log slicing keeps the slices away from the singularities; the Gamma-driver shift lets the punctures move instead of being held fixed. Pretorius’s different route used generalized harmonic gauge, constraint damping and excision.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fraction', difficulty: 3,
      gen(r) {
        const q = r.pick([0, 0.19, 0.36, 0.64, 0.75, 0.91]);
        const s = Math.sqrt(1 - q);
        return {
          prompt: t`Add only a fraction $q$ of Gauss’s law to the analogue’s $\Gamma$ equation: $a_t = -E_x$, $E_t = -a_x + \Gamma_x$, $\Gamma_t = -q\,E_x$ (with $\rho = 0$; $q = 0$ is the BSSN-like system). Its characteristic polynomial is $-\lambda(\lambda^2 + q - 1)$. For $q = ${q}$, what is the positive characteristic speed?`,
          visual: { type: 'graph', params: { x: [0, 1.5], y: [-1.2, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'speeds', curves: [{ fn: '0*x', color: 'ink3', width: 2 }], vlines: [{ x: 1, color: 'bad', label: 'q = 1' }] }, caption: 'The zero-speed mode exists for every q; the other two speeds are the question.' },
          answer: s, tol: { rel: 0.005 },
          errors: [{ value: 1 - q, feedback: t`The speeds are the square roots: $\lambda^2 = 1 - q$.` }, { value: Math.sqrt(1 + q), feedback: t`$\lambda^2 + q - 1 = 0$ gives $\lambda^2 = 1 - q$.` }].filter((e) => Math.abs(e.value - s) > 0.01 * s),
          hints: [t`Set $\lambda^2 + q - 1 = 0$.`, t`$\lambda = \pm\sqrt{1 - q}$.`],
          teach: 'How much of the constraint you add decides the characteristic speeds — and so the type of the system.',
          explain: t`$\lambda = \sqrt{1 - ${q}} = ${r3(s)}$ (and $-${r3(s)}$, and 0). For $q < 1$ the three speeds are distinct: strongly hyperbolic. At $q = 1$ — which is just the ADM-like system with $\Gamma$ along for the ride — all three speeds are 0 and eigenvectors go missing. For $q > 1$ the speeds are imaginary: not hyperbolic at all. Formulation design is the art of choosing these coefficients (and the gauge) well.`,
        };
      },
    }),
    mcq({
      id: 'cp-zero-speed', difficulty: 3,
      prompt: t`Round-off seeds a tiny Gauss violation at one spot in each analogue. Which describes what happens?`,
      visual: analogue({ constants: { sys: 1, k1: 8, tt: 2 } }, 'The BSSN-like analogue at k = 8, t = 2.'),
      choices: ['ADM-like: it stays where it began (zero speed) and keeps feeding a, which grows linearly in time; BSSN-like: it leaves as waves at the speed of light and a stays small', 'Both: it travels away at the speed of light', 'Both: it stays in place, but BSSN-like damps it', 'ADM-like: it decays; BSSN-like: it grows'],
      answer: 0,
      why: { 1: t`In the ADM-like system $E_t = 0$: nothing carries the violation anywhere.`, 2: t`The BSSN-like system has no damping term; the violation propagates (a zero-speed piece remains in $\Gamma$ only if $\Gamma \ne a$ initially).`, 3: t`$E_t = 0$ in the ADM-like system: nothing decays; $a$ grows.` },
      hints: ['What are the characteristic speeds of each system?', 'A zero-speed mode with a missing eigenvector accumulates; nonzero speeds carry disturbances away.'],
      teach: 'Zero-speed defective modes let errors pile up in place; good formulations give them nonzero speeds so they propagate away.',
      explain: t`ADM-like: speed 0 with a Jordan block — the violation is a source for $a$ that never moves, so $a$ grows like $t$ (and like $k$). BSSN-like: speeds $\pm1$ carry it off — through the outer boundary, in a real code. Combined with damping (B14.2) this is how constraint violations are kept small in production runs.`,
    }),
    mcq({
      id: 'cp-ligo', difficulty: 2, transfer: true,
      prompt: t`Why did LIGO’s 2015 detection of merging black holes depend on the formulation work described here?`,
      visual: { type: 'graph', params: { x: [-0.2, 0.03], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'time from merger (s)', ylabel: 'strain', yticks: 0, curves: [{ fn: '(0.25 + 0.75*exp(30*x))*cos(2*pi*(35*(x + 0.2) + 900*(x + 0.2)^2.6))*step(-x) + step(x)*exp(-x/0.004)*cos(2*pi*(35*0.2 + 900*0.2^2.6) + 2*pi*250*x)', color: 'accent', width: 1.6, samples: 3000 }] }, caption: 'A chirp: inspiral, merger, ringdown (schematic, not the measured signal).' },
      choices: ['The merger and ringdown can only be computed numerically, and the waveform models used to identify and measure the signal were built or calibrated with stable, convergent simulations', 'Without BSSN, Einstein’s equations would predict no gravitational waves', 'The detector’s own data analysis solves Einstein’s equations in real time', 'The formulations made the black holes in the simulations heavier'],
      answer: 0,
      why: { 1: 'The waves are predicted by Einstein’s equations in any formulation; the formulation decides whether a computer can follow them through the merger.', 2: 'Searches compare data with precomputed waveform models; they do not run simulations in real time.', 3: 'The masses are physical inputs, not consequences of the formulation.' },
      hints: ['Which part of the signal cannot be computed with approximations such as post-Newtonian theory?'],
      teach: 'Well-posed formulations made the strong-field merger computable, and those simulations underpin the waveform models gravitational-wave astronomy uses.',
      explain: t`The inspiral can be approximated analytically, but the last orbits, merger and ringdown need full numerical relativity. Within ten years of the 2005 breakthroughs, catalogues of simulations (from both generalized-harmonic and moving-puncture codes) were used to build and check the waveform models that matched GW150914 and measured its masses and spins.`,
    }),
  ],
  sources: [KWB, SN, BS, CLMZ, BAKER, GMG, SRC.evans],
});
