// Harmonic gauge and Choquet-Bruhat's theorem — a concept lesson. In any
// coordinates R_μν = −½g^αβ∂_α∂_β g_μν + ½(∂_μΓ_ν + ∂_νΓ_μ) + (first
// derivatives), Γ^λ = g^αβΓ^λ_αβ = −□x^λ. The ∂Γ terms spoil hyperbolicity
// (pure-gauge directions). Harmonic coordinates, □x^μ = 0, kill them: vacuum
// Einstein becomes ten quasilinear wave equations g^αβ∂_α∂_β g_μν = F_μν(g, ∂g),
// with light cones as characteristics. Y. Fourès-Bruhat (Choquet-Bruhat),
// Acta Math. 88, 141 (1952): local existence and uniqueness for smooth data
// satisfying the constraints; maximal development: Choquet-Bruhat & Geroch
// 1969. Constraint propagation: Γ^μ obeys a homogeneous wave equation (Bianchi),
// with zero data when the constraints hold, so it stays zero. Generalized
// harmonic Γ^μ = H^μ(x, g) (Friedrich 1985; Pretorius 2005). Flat-space checks:
// ∇²r = 2/r, ∇²(rⁿ) = n(n + 1)rⁿ⁻². GW170817: 1.74 s over 40 Mpc gives
// |Δv|/c ≲ 4×10⁻¹⁶ if all the delay were speed. Avoids gr.S29.d's principal
// symbol algebra and its Schwarzschild harmonic coordinates (code exercise).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC, player } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const FB52 = { label: 'Y. Fourès-Bruhat, Théorème d’existence pour certains systèmes d’équations aux dérivées partielles non linéaires, Acta Math. 88, 141–225 (1952)', url: 'https://doi.org/10.1007/BF02392131' };
const CBG69 = { label: 'Y. Choquet-Bruhat & R. Geroch, Global aspects of the Cauchy problem in general relativity, Commun. Math. Phys. 14, 329 (1969)', url: 'https://doi.org/10.1007/BF01645389' };
const WALD = { label: 'R. M. Wald, General Relativity (University of Chicago Press, 1984), ch. 10', url: 'https://openlibrary.org/isbn/9780226870335' };
const GW170817 = { label: 'LIGO, Virgo, Fermi-GBM & INTEGRAL, Gravitational waves and gamma-rays from a binary neutron star merger: GW170817 and GRB 170817A, Astrophys. J. Lett. 848, L13 (2017)', url: 'https://doi.org/10.3847/2041-8213/aa920c' };
const MPC = 3.0857e22, C = 2.998e8;
const cone = (caption, extra = {}) => player({ mode: 'wave', init: 'pluck', profile: 'gauss', w: 0.8, c: 1, t: 3, tmax: 5, x: [-8, 8], probe: [1, 4.2], ...extra }, caption);

export default lesson({
  id: 'st-b.B15.2',
  kind: 'concept',
  title: 'Harmonic gauge and Choquet-Bruhat’s theorem',
  minutes: 14, difficulty: 4,
  intro: t`Written in arbitrary coordinates, Einstein’s equations are not a well-posed evolution system: the four coordinate functions are undetermined, and second derivatives of the metric appear in combinations that no wave equation has. The cure is to fix the coordinates with equations of their own. Ask each coordinate to obey the wave equation, $\Box x^\mu = 0$ — **harmonic coordinates**. That is the same as setting $\Gamma^\mu \equiv g^{\alpha\beta}\Gamma^\mu_{\ \alpha\beta} = 0$, which deletes the troublesome terms from the Ricci tensor and leaves the vacuum equations as ten wave equations for the ten metric components:

$$g^{\alpha\beta}\,\partial_\alpha\partial_\beta\, g_{\mu\nu} = F_{\mu\nu}(g, \partial g).$$

The left side is the wave operator of the metric itself, so information travels along light cones; the right side holds only first derivatives. In 1952 Yvonne Fourès-Bruhat (later Choquet-Bruhat) used this form to prove the first existence theorem: **for smooth initial data that satisfy the constraints, a solution of Einstein’s equations exists, at least for a while, and it is unique** up to the choice of coordinates.`,
  symbols: [
    { tex: 'g_{\\mu\\nu}', text: 'the spacetime metric: ten unknown functions (Greek indices run 0–3, repeated ones are summed; $G = c = 1$)' },
    { tex: 'g^{\\alpha\\beta}\\partial_\\alpha\\partial_\\beta', text: 'the wave operator built from the metric (the principal part): its characteristic surfaces are light cones' },
    { tex: '\\Box x^\\mu = 0', text: 'the harmonic-gauge condition: each coordinate, viewed as a function on spacetime, obeys the curved-space wave equation' },
    { tex: '\\Gamma^\\mu = g^{\\alpha\\beta}\\Gamma^\\mu_{\\ \\alpha\\beta}', text: 'the contracted Christoffel symbols; $\\Box x^\\mu = -\\Gamma^\\mu$, so harmonic coordinates have $\\Gamma^\\mu = 0$' },
    { tex: 'F_{\\mu\\nu}(g, \\partial g)', text: 'everything else: products of the metric and its first derivatives — lower order, so it cannot spoil hyperbolicity' },
  ],
  why: t`This is the theorem that makes general relativity a deterministic theory: the past determines the future, inside light cones. The same harmonic form, generalized, is what Frans Pretorius evolved in 2005 for the first complete binary-black-hole merger. The Road to Einstein derives the principal symbol in [hyperbolicity, gauge and well-posedness](#/lesson/gr.S29.d).`,
  visual: {
    type: 'pde-player',
    title: 'Light cones are the characteristics',
    lead: t`In harmonic gauge every metric component obeys a wave equation whose characteristics are light rays. Drag the probe in the lower panel: the value there depends only on the data inside its backward light cone — the domain of dependence of lesson B3.3, now for spacetime itself.`,
    tasks: [
      'Drag the probe up: its light cone reaches back over a wider stretch of the initial slice.',
      'Move it outside the region the pulse’s cone reaches: the solution there is still zero — nothing outruns light.',
      'Play: the pulse splits and runs along the two families of characteristics.',
    ],
    params: { mode: 'wave', init: 'pluck', profile: 'gauss', w: 0.8, c: 1, t: 2, tmax: 5, x: [-8, 8], probe: [1.5, 3.5], controls: ['t'] },
    caption: t`A one-dimensional wave equation with $c = 1$ standing in for one metric component in harmonic gauge (a teaching model: the real equations are nonlinear and coupled through $F_{\mu\nu}$, and the cones are those of the curved metric $g$ itself).`,
  },
  example: {
    prompt: t`Check two coordinate systems of flat spacetime: are the Cartesian coordinates $(t, x, y, z)$ harmonic? Is the spherical radius $r$? Then say what harmonic gauge becomes for weak fields.`,
    visual: { type: 'graph', params: { x: [0, 5], y: [0, 4.2], aspect: 'wide', axesAt: 'edge', xlabel: 'r', ylabel: '∇²r', curves: [{ fn: '2/x', color: 'warn', width: 2.4, domain: [0.45, 5] }, { fn: '0*x', color: 'good', width: 2.4 }], points: [{ x: 3.4, y: 0.15, r: 0, label: '□x = □y = □z = □t = 0', color: 'good' }, { x: 1.2, y: 2.6, r: 0, label: '∇²r = 2/r', color: 'warn' }] }, caption: 'In flat space the Cartesian coordinates are harmonic; the radius r is not.' },
    steps: [
      { label: 'Flat wave operator', text: t`In Minkowski space $\Box f = -\partial_t^2f + \nabla^2 f$. Each Cartesian coordinate is linear, so all its second derivatives vanish: $\Box t = \Box x = \Box y = \Box z = 0$. Harmonic.` },
      { label: 'The radius', text: t`$r$ does not depend on $t$, so $\Box r = \nabla^2 r = \dfrac{1}{r^2}\dfrac{d}{dr}\Big(r^2\dfrac{dr}{dr}\Big) = \dfrac{2}{r} \ne 0$. Spherical coordinates are not harmonic.` },
      { label: 'Why it matters', text: t`In harmonic coordinates the second-derivative terms $\tfrac12(\partial_\mu\Gamma_\nu + \partial_\nu\Gamma_\mu)$ in $R_{\mu\nu}$ vanish, leaving $-\tfrac12 g^{\alpha\beta}\partial_\alpha\partial_\beta g_{\mu\nu}$: the same operator on every component, with no mixing at the highest order.` },
      { label: 'Weak fields', text: t`For $g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}$ with small $h$, $\Gamma^\mu = 0$ becomes the Lorenz gauge $\partial^\mu\bar h_{\mu\nu} = 0$ (with $\bar h_{\mu\nu} = h_{\mu\nu} - \tfrac12\eta_{\mu\nu}h$), and Einstein’s equations become $\Box\bar h_{\mu\nu} = -16\pi T_{\mu\nu}$ — the wave equation for gravitational waves.` },
      { label: 'Honesty', text: t`Harmonic coordinates exist near any slice (solve $\Box x^\mu = 0$ with chosen data), but they need not last for ever: like any wave solutions, they can focus and become singular. Codes therefore use *generalized* harmonic gauge, $\Gamma^\mu = H^\mu$, with source functions $H^\mu$ chosen to steer the coordinates.` },
    ],
    answer: t`Cartesian coordinates are harmonic ($\Box x^\mu = 0$); the radius is not ($\nabla^2r = 2/r$). For weak fields harmonic gauge is the Lorenz gauge, and the equations become $\Box\bar h_{\mu\nu} = -16\pi T_{\mu\nu}$.`,
  },
  practice: [
    mcq({
      id: 'physics', difficulty: 1,
      prompt: t`Does putting Einstein’s equations in harmonic coordinates change their physical predictions — the orbit of a planet, the waveform at a detector?`,
      visual: cone('The wave equation’s light cones: harmonic gauge makes Einstein’s equations look like this, whatever spacetime they describe.'),
      choices: ['No: it is a choice of coordinates, and coordinate-independent quantities are unchanged', 'Yes: it removes four of the ten equations', 'Yes: it makes gravity propagate at the speed of light, which it otherwise would not', 'Only for weak fields'],
      answer: 0,
      why: { 1: 'All ten equations remain; four extra conditions fix the coordinates.', 2: 'Gravity’s influence travels at light speed in any coordinates; harmonic gauge only makes this visible in the form of the equations.', 3: 'Harmonic coordinates exist near any slice, in strong fields too; the theorem was proved for the full nonlinear equations.' },
      hints: ['What do coordinates label, and what do measurements depend on?'],
      teach: 'A gauge choice changes how a solution is described, never what is measured.',
      explain: t`Any solution in other coordinates can be re-expressed in harmonic ones (locally), and vice versa. What the gauge buys is the *form* of the equations: a hyperbolic system to which the theory of wave equations — existence, uniqueness, domains of dependence — applies.`,
    }),
    num({
      id: 'laplace-rn', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, -1]), R = r.pick([2, 4, 5]);
        const val = n * (n + 1) * R ** (n - 2);
        return {
          prompt: t`In flat space, $\nabla^2(r^n) = n(n + 1)\,r^{n - 2}$. Evaluate $\nabla^2(r^{${n}})$ at $r = ${R}$. ${n === -1 ? '(Away from the origin.)' : ''}`,
          visual: { type: 'graph', params: { x: [0.3, 6], y: [-1, 8], aspect: 'wide', axesAt: 'edge', xlabel: 'r', ylabel: 'rⁿ', curves: [{ fn: n === -1 ? '1/x' : `x^${n}/${n === 3 ? 25 : n === 2 ? 5 : 1}`, color: 'accent', width: 2.2 }], vlines: [{ x: R, color: 'gold' }] }, caption: t`The function $r^{${n}}$ (scaled to fit), with the point $r = ${R}$ marked.` },
          answer: val, tol: { rel: 1e-6, abs: 1e-9 },
          errors: [{ value: n * (n - 1) * R ** (n - 2), feedback: t`That is $d^2(r^n)/dr^2$ alone. In three dimensions $\nabla^2 f = f'' + (2/r)f'$, which adds $2n\,r^{n-2}$.` }].filter((e) => Math.abs(e.value - val) > 1e-6),
          hints: [t`$\nabla^2 f(r) = \dfrac{1}{r^2}\dfrac{d}{dr}\Big(r^2\dfrac{df}{dr}\Big) = f'' + \dfrac{2}{r}f'$.`, t`$n(n + 1)\,r^{n-2}$ with $n = ${n}$, $r = ${R}$.`],
          teach: 'Only n = 0 and n = −1 give harmonic powers of r in three dimensions.',
          explain: t`$${n}(${n + 1})\times${R}^{${n - 2}} = ${r3(val)}$. ${n === -1 ? 'Zero: 1/r is harmonic away from the origin — the Newtonian potential.' : n === 1 ? 'Not zero: the radius r is not a harmonic coordinate.' : 'Not zero.'} (For Schwarzschild spacetime, the harmonic radial coordinate turns out to be $r - M$.)`,
        };
      },
    }),
    mcq({
      id: 'theorem', difficulty: 2,
      prompt: t`What exactly did Fourès-Bruhat’s 1952 theorem establish?`,
      visual: cone('Data on one slice determine the solution inside the region they causally control — for a while.'),
      choices: ['For smooth initial data satisfying the constraints, a solution of the vacuum Einstein equations exists for some finite time and is unique up to coordinates', 'Solutions exist for all time for any initial data', 'Black holes cannot form from smooth initial data', 'The constraints are automatically satisfied by any initial data'],
      answer: 0,
      why: { 1: 'The theorem is local in time. Global questions — the stability of Minkowski space (Christodoulou & Klainerman, 1993), cosmic censorship — came decades later, and some are open.', 2: 'Collapse to black holes from smooth data is allowed — and a local theorem says nothing about it.', 3: 'The data must satisfy the constraints; that is a hypothesis, not a conclusion.' },
      hints: ['Is the result local or global in time? What must the data satisfy?'],
      teach: 'Choquet-Bruhat (1952): local existence and uniqueness for smooth constraint-satisfying data — general relativity has a well-posed initial-value problem.',
      explain: t`The theorem is **local**: some time interval, smooth data, constraints satisfied. In 1969 Choquet-Bruhat and Geroch showed that every such data set has a unique *maximal* development. How long solutions last, and what singularities they reach, are separate and harder questions.`,
    }),
    order({
      id: 'propagation', difficulty: 3,
      prompt: t`Order the argument that a solution of the reduced (harmonic-gauge) equations also solves the full Einstein equations.`,
      visual: cone('The key step is a wave equation for the gauge quantity itself, so the uniqueness of wave equations does the work.'),
      items: [
        t`Choose initial data that satisfy the constraints, with $\Gamma^\mu = 0$ on the first slice`,
        t`The constraints then make $\partial_t\Gamma^\mu = 0$ on that slice too`,
        'Solve the ten reduced wave equations for the metric',
        t`The Bianchi identity forces $\Gamma^\mu$ to obey a homogeneous wave equation`,
        t`A wave equation with zero data has only the zero solution, so $\Gamma^\mu = 0$ everywhere and the full equations hold`,
      ],
      hints: [t`The argument is about $\Gamma^\mu$, the quantity harmonic gauge sets to zero: show it stays zero.`, 'Zero value and zero rate at the start, plus a homogeneous wave equation, give zero for ever (uniqueness, as in lesson B6.2).'],
      teach: t`Harmonic gauge is preserved by the reduced evolution because $\Gamma^\mu$ obeys its own wave equation — constraint propagation again.`,
      explain: t`This is lesson B14.1’s pattern for Einstein’s equations: the gauge condition $\Gamma^\mu = 0$ is a constraint whose violation obeys a homogeneous wave equation, $g^{\alpha\beta}\partial_\alpha\partial_\beta\Gamma^\mu + (\text{lower order}) = 0$. Zero data — which the Hamiltonian and momentum constraints guarantee — propagate as zero.`,
    }),
    num({
      id: 'cone-radius', difficulty: 1, transfer: true,
      gen(r) {
        const dt = r.pick([0.1, 0.2, 0.5, 1]);
        return {
          prompt: t`In harmonic gauge the metric at a detector now depends only on data inside its past light cone. On the slice $${dt}$ s ago, how large a region (radius, in km) can influence it?`,
          visual: cone('The backward light cone of the probe point: its base on an earlier slice is the region that matters.'),
          answer: C * dt / 1000, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: C * dt, feedback: 'Convert metres to kilometres.' }],
          hints: [t`Radius $= c\,\Delta t$.`],
          teach: 'Domains of dependence in general relativity are light cones.',
          explain: t`$c\,\Delta t = ${tex(C * dt / 1000, 4)}$ km. Nothing outside it — not even a change in a distant mass — can affect the metric here yet: unlike Newtonian gravity, Einstein’s is causal.`,
        };
      },
    }),
    mcq({
      id: 'generalized', difficulty: 2,
      prompt: t`Pretorius’s 2005 merger code used **generalized** harmonic gauge, $\Gamma^\mu = H^\mu(x, g)$, with source functions $H^\mu$ depending on the coordinates and the metric but not its derivatives. Why does this keep the equations hyperbolic?`,
      visual: cone('The principal part — the wave operator — is untouched by terms without second derivatives.'),
      choices: [t`$H^\mu$ holds no derivatives of $g$, so $\partial_\mu H_\nu$ adds only first derivatives: the principal part stays $g^{\alpha\beta}\partial_\alpha\partial_\beta$`, 'Because H is small', 'Because it is the same as ordinary harmonic gauge', 'It does not: generalized harmonic gauge is only weakly hyperbolic'],
      answer: 0,
      why: { 1: 'H need not be small; it is chosen to steer the coordinates (for instance to keep the lapse from collapsing).', 2: 'H ≠ 0 changes the coordinates, which can be essential near black holes.', 3: 'With H independent of derivatives of g the system keeps the wave principal part and is strongly (indeed symmetric) hyperbolic.' },
      hints: ['Which terms decide hyperbolicity? How many derivatives of g does ∂H contain?'],
      teach: 'Gauge source functions without derivatives of the metric leave the principal part, and hence well-posedness, intact.',
      explain: t`Replacing $\Gamma^\mu$ by $\Gamma^\mu - H^\mu$ in the reduction adds $\partial_{(\mu}H_{\nu)}$, which holds at most first derivatives of $g$ — lower order. The freedom to choose $H^\mu$ (Friedrich, 1985; Garfinkle, 2002), plus constraint damping (Gundlach et al., 2005), plus excision of the black-hole interiors, made Pretorius’s evolution work.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gw170817', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([26, 40, 45]), dt = r.pick([1.74, 1.7, 2]);
        const bound = (C * dt) / (D * MPC);
        return {
          prompt: t`The characteristics of Einstein’s equations are light cones, so gravitational waves should travel at exactly $c$. For GW170817 the gamma-ray burst arrived ${dt} s after the merger’s gravitational-wave signal, from a distance of about ${D} Mpc ($1\ \text{Mpc} = 3.086\times10^{22}$ m). If the whole delay came from a speed difference, how large would $|v_{\text{gw}} - c|/c$ be?`,
          visual: cone('Two signals riding the same light cone from one event: any speed difference shows up as an arrival-time difference.'),
          answer: bound, tol: { rel: 0.01 },
          errors: [{ value: dt / (D * MPC), feedback: t`Multiply by $c$: the fraction is $c\,\Delta t/D$, the delay over the travel time $D/c$.` }, { value: bound / 1000, feedback: 'Use metres throughout: 1 Mpc is 3.086×10²² m.' }],
          hints: [t`Travel time $D/c$; fraction $= \Delta t/(D/c) = c\,\Delta t/D$.`, t`$D = ${D}\times3.086\times10^{22}$ m.`],
          teach: 'A tiny delay over a huge distance bounds the speed of gravity to parts in 10¹⁵.',
          explain: t`$c\,\Delta t/D = (${tex(C, 4)})(${dt})/(${D}\times${tex(MPC, 4)}) = ${tex(bound, 2)}$. The collaborations’ published bound, allowing the gamma rays to have left up to 10 s late and taking a conservative distance, is $-3\times10^{-15} \le \Delta v/c \le 7\times10^{-16}$: gravitational waves travel along the light cones the theorem’s wave equations predict.`,
        };
      },
    }),
    mcq({
      id: 'cp-local', difficulty: 3,
      prompt: t`A student argues: “Choquet-Bruhat proved Einstein’s equations always have solutions, so a simulated collapse to a black hole must be a numerical artefact.” What is wrong?`,
      visual: cone('A local theorem: the solution is guaranteed in a neighbourhood of the initial slice.'),
      choices: ['The theorem is local in time; it does not forbid singularities or horizons forming later — and indeed singularity theorems predict them', 'Nothing: smooth data stay smooth for ever in general relativity', 'The theorem only applies to weak fields', 'The theorem only applies to harmonic coordinates, which black holes do not have'],
      answer: 0,
      why: { 1: 'Penrose’s singularity theorem (1965) shows that trapped surfaces lead to incomplete geodesics.', 2: 'It applies to the full nonlinear vacuum equations.', 3: 'Harmonic coordinates are a tool for the proof; any solution can be described in them near a slice.' },
      hints: ['Read the theorem’s statement: for how long does it guarantee a solution?', 'Do other theorems of general relativity predict what happens later in a collapse?'],
      teach: 'Local well-posedness guarantees short-time existence and uniqueness; long-time behaviour, singularities included, is another matter.',
      explain: t`Well-posedness tells you the evolution is determined and stable for a while. Collapse is a genuine prediction of the equations, and codes must handle it — by excising the interior (Pretorius) or by gauges that keep slices away from the singularity (moving punctures, next lesson).`,
    }),
    mcq({
      id: 'cp-lorenz', difficulty: 2,
      prompt: t`For weak fields, harmonic gauge becomes the Lorenz gauge $\partial^\mu\bar h_{\mu\nu} = 0$, and Einstein’s equations become $\Box\bar h_{\mu\nu} = -16\pi T_{\mu\nu}$. Which electromagnetic statement is the exact analogue?`,
      visual: cone('Both are wave equations with sources once the gauge is fixed.'),
      choices: [t`In Lorenz gauge $\partial_\mu A^\mu = 0$, Maxwell’s equations become $\Box A^\nu = -\mu_0 J^\nu$, wave equations for each potential component`, t`Gauss’s law $\nabla\cdot\vec E = \rho/\varepsilon_0$`, t`In Coulomb gauge the scalar potential obeys Poisson’s equation instantaneously`, 'Faraday’s law of induction'],
      answer: 0,
      why: { 1: 'Gauss’s law is a constraint, the analogue of the Hamiltonian constraint, not of the gauge-fixed evolution.', 2: 'Coulomb gauge gives an elliptic equation for the scalar potential — the opposite choice, closer to some elliptic gauges in relativity.', 3: 'Faraday’s law is one of the evolution equations in terms of fields, with no gauge involved.' },
      hints: ['Look for a gauge condition that turns the equations for the potentials into wave equations.'],
      teach: 'Lorenz gauge in electromagnetism and harmonic gauge in gravity both turn the field equations into wave equations.',
      explain: t`With $\partial_\mu A^\mu = 0$ the potential equations decouple into $\Box A^\nu = -\mu_0J^\nu$, exactly as harmonic (Lorenz) gauge gives $\Box\bar h_{\mu\nu} = -16\pi T_{\mu\nu}$; in both, the gauge condition is preserved because the source is conserved ($\partial_\mu J^\mu = 0$, $\partial^\mu T_{\mu\nu} = 0$).`,
    }),
  ],
  sources: [FB52, CBG69, WALD, GW170817, SRC.evans],
});
