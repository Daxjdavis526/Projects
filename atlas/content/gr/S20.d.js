// Deriving and verifying the Schwarzschild solution — Derivation Mode.
// Static, spherically symmetric ansatz ds² = −e^{2α}dt² + e^{2β}dr² + r²dΩ²
// → nine Christoffels → R_tt, R_rr, R_θθ (Carroll's eqs. 5.13–5.14 / notes
// 7.15–7.16) → e^{2(β−α)}R_tt + R_rr = (2/r)(α′ + β′) gives β = −α → R_θθ =
// 1 − (rf)′ = 0 gives f = 1 − R_s/r → the Newtonian limit fixes R_s = 2M.
// All of it checked with SymPy (also: all ten R_μν = 0, Kretschmann
// 48M²/r⁶, Schwarzschild–de Sitter R_μν = Λg_μν, trial powers 1 − k/rⁿ give
// R_θθ = k(1 − n)/rⁿ). G = c = 1 throughout, M meaning GM/c². Agrees with
// gr.S20.i and gr.EQ.8; avoids their r_s, clock-rate, proper-distance and
// local-speed-of-light items.
import { lesson, mcq, num, expr, order, code } from '../../src/core/content.js';
import { M_SUN, LAMBDA, PC, sci, round, metricTable } from './_classic.js';

const t = String.raw;

// the two metric functions against r, as a problem's setting
const metricCurves = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 12], y: [-1.3, 3.3], xlabel: 'r / M', ylabel: 'metric component',
    curves: [
      { fn: '-(1 - 2/x)', domain: [0.6, 12], color: 'gold', label: 'gₜₜ = −(1 − 2M/r)', labelAt: 7, labelDy: 16 },
      { fn: '1/(1 - 2/x)', domain: [2.45, 12], color: 'accent', label: 'gᵣᵣ = 1/(1 − 2M/r)', labelAt: 6.5 },
    ],
    vlines: [{ x: 2, label: 'r = 2M' }],
    hlines: [{ y: 0 }],
  },
  caption: caption ?? t`The two non-trivial components of the Schwarzschild metric ($G = c = 1$, $r$ in units of $M$). The Christoffel symbols are built from their slopes, and from the $r^2$ of the angular part.`,
});

// the static, spherical ansatz as a 4 × 4 table
const ansatzTable = (caption, cross = false) => metricTable(
  [['−e²ᵅ', cross ? '?' : '', '', ''], [cross ? '?' : '', 'e²ᵝ', '', ''], ['', '', 'r²', ''], ['', '', '', 'r² sin²θ']],
  { colors: [['gold', 'bad', '', ''], ['bad', 'accent', '', ''], ['', '', 'ink', ''], ['', '', '', 'ink']], caption },
);

// −g_tt when α + β = k: the far-away clock rate tends to e^k
const rescale = {
  type: 'graph',
  params: {
    x: [0, 30], y: [0, 1.55], xlabel: 'r / M', ylabel: '−gₜₜ',
    curves: [
      { fn: '1 - 2/x', domain: [2, 30], color: 'gold', label: 'k = 0', labelAt: 22, labelDy: 16 },
      { fn: 'exp(0.3)*(1 - 2/x)', domain: [2, 30], color: 'accent', label: 'k = 0.15', labelAt: 22 },
    ],
    hlines: [{ y: 1 }],
  },
  caption: t`$-g_{tt} = e^{2k}(1 - 2M/r)$ for two values of the constant $k = \alpha + \beta$ ($G = c = 1$). Far away one tends to 1 and the other to $e^{2k}$: the same spacetime, with $t$ ticking in different units.`,
};

// a student's trial metric beside Schwarzschild's
const trialCurves = {
  type: 'graph',
  params: {
    x: [0, 14], y: [-1.2, 1.25], xlabel: 'r / M', ylabel: 'f(r)',
    curves: [
      { fn: '1 - 2/x', domain: [1.2, 14], color: 'gold', label: 'k = 0', labelAt: 1.25, labelDx: 8, labelDy: 4 },
      { fn: '1 - 2/x + 0.75/x^2', domain: [0.42, 14], color: 'accent', label: 'k = 0.75', labelAt: 0.45, labelDx: 8, labelDy: -6 },
    ],
    hlines: [{ y: 0 }],
  },
  caption: t`$f(r) = 1 - 2M/r + kM^2/r^2$ for $k = 0$ (gold) and $k = 0.75$ (blue), $G = c = 1$. Far away the two are indistinguishable; close in, the blue one crosses zero twice, at $r = 0.5M$ and $1.5M$.`,
};

// the competing pulls in Schwarzschild–de Sitter, Λ hugely exaggerated
const balancePic = {
  type: 'graph',
  params: {
    x: [0, 20], y: [0, 0.5], xlabel: 'distance (illustrative units)', ylabel: 'acceleration (illustrative)',
    curves: [
      { fn: '2/x^2', domain: [2, 20], color: 'gold', label: 'the mass’s pull, M/r²', labelAt: 3.1 },
      { fn: '0.01*x/3*2', domain: [0, 20], color: 'violet', label: 'Λ’s push, Λr/3', labelAt: 15, labelDy: 16 },
    ],
  },
  caption: t`The two terms of $f'(r)/2 = M/r^2 - \Lambda r/3$ in Schwarzschild–de Sitter, in illustrative units: the real $\Lambda$ is far too small for both curves to fit on one graph. Close in the mass wins; far out $\Lambda$ does.`,
};

// Reissner–Nordström beside Schwarzschild
const rnCurves = {
  type: 'graph',
  params: {
    x: [0, 12], y: [-0.8, 1.2], xlabel: 'r / M', ylabel: 'f(r)',
    curves: [
      { fn: '1 - 2/x', domain: [1.3, 12], color: 'gold', label: 'Q = 0', labelAt: 1.35, labelDx: 8, labelDy: 4 },
      { fn: '1 - 2/x + 0.64/x^2', domain: [0.33, 12], color: 'accent', label: 'Q = 0.8M', labelAt: 0.36, labelDx: 8, labelDy: -6 },
    ],
    hlines: [{ y: 0 }],
  },
  caption: t`$f(r) = 1 - 2M/r + Q^2/r^2$ for an uncharged hole (gold) and one with $Q = 0.8M$ (blue), $G = c = 1$ (and Gaussian units for the charge). The charged one crosses zero twice, at $r = 0.4M$ and $1.6M$: an inner and an outer horizon.`,
};

const CHRIST = [
  {
    name: t`\Gamma^r{}_{tt}`, lhs: t`\Gamma^r{}_{tt}`, answer: 'M(r - 2M)/r^3', tex: t`\frac{M(r - 2M)}{r^3}`,
    hints: [t`Only $\sigma = r$ survives (the inverse metric is diagonal), and of the three derivatives only $-\partial_r g_{tt}$ is non-zero: $\Gamma^r{}_{tt} = -\tfrac12 g^{rr}\,\partial_r g_{tt}$.`, t`$g^{rr} = 1 - 2M/r$ and $\partial_r g_{tt} = \partial_r\left[-(1 - 2M/r)\right] = -2M/r^2$.`],
    errors: [
      { answer: '-M(r - 2M)/r^3', feedback: t`Check the sign: the $-\partial_\sigma g_{\mu\nu}$ term brings a minus, and $\partial_r g_{tt} = -2M/r^2$ brings another.` },
      { answer: 'M/r^2', feedback: t`That is $-\tfrac12\partial_r g_{tt}$ without the factor $g^{rr} = 1 - 2M/r$. Far away the two agree: Newton's $GM/r^2$.` },
      { answer: 'M/(r(r - 2M))', feedback: t`That is $\Gamma^t{}_{tr}$, which raises with $g^{tt}$. Here the upper index is $r$.` },
    ],
    explain: t`$\Gamma^r{}_{tt} = -\tfrac12\left(1 - \tfrac{2M}{r}\right)\left(-\tfrac{2M}{r^2}\right) = \dfrac{M}{r^2}\left(1 - \dfrac{2M}{r}\right) = \dfrac{M(r - 2M)}{r^3}$. Far out it is Newton's $GM/r^2$: in the geodesic equation, $\ddot r = -\Gamma^r{}_{tt}\dot t^{\,2} + \dots$ is gravity's pull on a body at rest.`,
  },
  {
    name: t`\Gamma^t{}_{tr}`, lhs: t`\Gamma^t{}_{tr}`, answer: 'M/(r(r - 2M))', tex: t`\frac{M}{r(r - 2M)}`,
    hints: [t`Only $\sigma = t$ survives, and only the $\partial_r g_{tt}$ term: $\Gamma^t{}_{tr} = \tfrac12 g^{tt}\,\partial_r g_{tt}$.`, t`$g^{tt} = -1/(1 - 2M/r)$ and $\partial_r g_{tt} = -2M/r^2$.`],
    errors: [
      { answer: '-M/(r(r - 2M))', feedback: t`Both $g^{tt}$ and $\partial_r g_{tt}$ are negative: their product is positive.` },
      { answer: 'M/r^2', feedback: t`You left out $g^{tt} = -1/(1 - 2M/r)$ (or took it to be $-1$).` },
      { answer: 'M(r - 2M)/r^3', feedback: t`That is $\Gamma^r{}_{tt}$, raised with $g^{rr}$. Here the upper index is $t$.` },
    ],
    explain: t`$\Gamma^t{}_{tr} = \tfrac12\cdot\dfrac{-1}{1 - 2M/r}\cdot\left(-\dfrac{2M}{r^2}\right) = \dfrac{M}{r^2(1 - 2M/r)} = \dfrac{M}{r(r - 2M)}$ — in the ansatz's language, $\alpha'$.`,
  },
  {
    name: t`\Gamma^r{}_{rr}`, lhs: t`\Gamma^r{}_{rr}`, answer: '-M/(r(r - 2M))', tex: t`-\frac{M}{r(r - 2M)}`,
    hints: [t`All three derivatives are $\partial_r g_{rr}$, with signs $+, +, -$: $\Gamma^r{}_{rr} = \tfrac12 g^{rr}\,\partial_r g_{rr}$.`, t`$g_{rr} = (1 - 2M/r)^{-1}$, so $\partial_r g_{rr} = -(1 - 2M/r)^{-2}\cdot\dfrac{2M}{r^2}$.`],
    errors: [
      { answer: 'M/(r(r - 2M))', feedback: t`Differentiating $(1 - 2M/r)^{-1}$ gives a minus sign: the radial stretch shrinks as $r$ grows.` },
      { answer: '-M/r^2', feedback: t`You left out a factor $1/(1 - 2M/r)$: $g^{rr}$ cancels only one of the two powers from the derivative.` },
      { answer: '2M - r', feedback: t`That is $\Gamma^r{}_{\theta\theta}$. Here both lower indices are $r$.` },
    ],
    explain: t`$\Gamma^r{}_{rr} = \tfrac12\left(1 - \tfrac{2M}{r}\right)\cdot\left(-\dfrac{2M/r^2}{(1 - 2M/r)^2}\right) = -\dfrac{M}{r(r - 2M)}$ — the ansatz's $\beta'$, and equal to $-\alpha'$, as $\beta = -\alpha$ demands.`,
  },
  {
    name: t`\Gamma^r{}_{\theta\theta}`, lhs: t`\Gamma^r{}_{\theta\theta}`, answer: '2M - r', tex: t`2M - r`,
    hints: [t`Only the $-\partial_\sigma g_{\mu\nu}$ term survives, with $\sigma = r$: $\Gamma^r{}_{\theta\theta} = -\tfrac12 g^{rr}\,\partial_r g_{\theta\theta}$.`, t`$g_{\theta\theta} = r^2$, so $\partial_r g_{\theta\theta} = 2r$; and $g^{rr} = 1 - 2M/r$.`],
    errors: [
      { answer: 'r - 2M', feedback: t`The surviving term is $-\partial_r g_{\theta\theta}$: it carries a minus sign.` },
      { answer: '-r', feedback: t`That is the flat-space value. You left out $g^{rr} = 1 - 2M/r$.` },
      { answer: 'M(r - 2M)/r^3', feedback: t`That is $\Gamma^r{}_{tt}$. Here the lower indices are both $\theta$.` },
    ],
    explain: t`$\Gamma^r{}_{\theta\theta} = -\tfrac12\left(1 - \tfrac{2M}{r}\right)(2r) = -(r - 2M) = 2M - r$. In flat space it would be $-r$: it is what keeps a body moving along a sphere curving back toward the centre.`,
  },
];

export default lesson({
  id: 'gr.S20.d',
  title: 'Deriving and verifying the Schwarzschild solution',
  minutes: 16, difficulty: 3, mode: 'derivation', badges: ['est-der', 'est-obs'],
  intro: t`In empty space Einstein's equations reduce to $R_{\mu\nu} = 0$ (step 18): ten coupled second-order equations for the metric. Around a static, round mass, symmetry cuts the unknowns to two functions of one variable, and the vacuum equations fix both. The result, found by Karl Schwarzschild in 1916, is the metric above — the exterior of every round star and planet, and of every non-spinning black hole. Here you derive it from the field equations, then verify it: by hand, and with SymPy, all ten components of $R_{\mu\nu}$ vanish.

Conventions: Carroll's, signature $(-,+,+,+)$, **with $G = c = 1$** — so $M$ stands for the length $GM/c^2$ (1476.6 m for the Sun) and $t$ for $ct$.`,
  equation: t`ds^2 = -\left(1 - \frac{2M}{r}\right)dt^2 + \frac{dr^2}{1 - 2M/r} + r^2\,d\Omega^2`,
  symbols: [
    { tex: 'ds^2', text: t`the interval between two neighbouring events; for a clock's path $ds^2 = -d\tau^2$, its own time` },
    { tex: 't', text: 'the time coordinate: the time kept by clocks at rest far from the mass (with $c = 1$, measured in metres of light travel)' },
    { tex: 'r', text: t`the **areal radius**: a sphere at $r$ has area $4\pi r^2$. It is defined by the ansatz's last term, not by a ruler laid to the centre` },
    { tex: 'd\\Omega^2', text: t`$d\theta^2 + \sin^2\theta\,d\phi^2$, the metric of a unit sphere: $\theta$ the angle from the pole, $\phi$ the angle around it` },
    { tex: 'M', text: t`the mass as a length, $GM/c^2$ — an integration constant, fixed by matching Newton's gravity far away` },
    { tex: '\\alpha(r),\\ \\beta(r)', text: t`the two unknown functions of the ansatz $ds^2 = -e^{2\alpha}dt^2 + e^{2\beta}dr^2 + r^2d\Omega^2$; the solution is $e^{2\alpha} = e^{-2\beta} = 1 - 2M/r$` },
    { tex: 'R_{\\mu\\nu}', text: t`the Ricci tensor (step 15), built from the metric's first and second derivatives; the vacuum field equations say it is zero` },
  ],
  why: t`Every classic test in the steps ahead — redshift, perihelion advance, light bending — and every non-spinning black hole is a geodesic of this one metric or a change of its coordinates.`,
  visual: {
    type: 'graph',
    title: 'Only one power of r is empty space',
    lead: t`Try metrics with $g_{tt} = -f$ and $g_{rr} = 1/f$, where $f = 1 - 2M/r^n$ (gold), with $G = c = 1$ and $r$ in units of $M$. Red is the Ricci component $R_{\theta\theta} = 1 - (rf)'$, which empty space requires to vanish at **every** $r$. Change the power $n$.`,
    tasks: [
      'Set n = 1: the red curve lies flat on zero at every r — and so do the other Ricci components (readout). That is Schwarzschild.',
      'Try n = 2: the residual is −2M/r², not zero. A metric like that needs a source of energy in the space around the mass; empty space cannot supply it.',
      'Every trial tends to 1 far away: being flat at infinity does not pick the metric. The field equations do.',
    ],
    params: {
      x: [1, 12], y: [-1.6, 1.4], xlabel: 'r / M', ylabel: '',
      sliders: [{ key: 'n', label: 'Power $n$ in $f = 1 - 2M/r^n$', min: 0.5, max: 2.5, step: 0.05, value: 1.6, explain: 'A trial metric. With β = −α, the vacuum equations reduce to conditions on f alone.' }],
      curves: [
        { fn: '1 - 2/x^n', color: 'gold', label: 'f(r)', labelAt: 9, labelDy: 16 },
        { fn: '2(1 - n)/x^n', color: 'bad', label: 'Rθθ', labelAt: 2.6, labelDy: -12 },
      ],
      hlines: [{ y: 0 }],
      readouts: [
        { label: '$R_{\\theta\\theta}$ at $r = 3M$', expr: '2(1 - n)/3^n', digits: 3 },
        { label: '$R_{tt}/f$ at $r = 3M$', expr: 'n(1 - n)/3^(n + 2)', digits: 3 },
      ],
    },
    caption: t`Trial metrics $f = 1 - 2M/r^n$ with $g_{rr} = 1/f$ ($G = c = 1$). For them $R_{\theta\theta} = 2M(1 - n)/r^n$ and $R_{tt} = f\,n(1 - n)M/r^{n+2}$ — both checked with SymPy — so only $n = 1$ (or $M = 0$, flat space) is a vacuum solution.`,
  },
  example: {
    prompt: t`Derive the metric outside a static, spherically symmetric mass from $R_{\mu\nu} = 0$, and verify the result.`,
    visual: ansatzTable(t`The ansatz as a matrix $g_{\mu\nu}$: two unknown functions on the diagonal, a round sphere of area $4\pi r^2$ in the angular block, and zeros everywhere else.`),
    steps: [
      { label: 'The ansatz', text: t`**Static**: nothing depends on $t$, and nothing changes if time runs backward, $t \to -t$, so there is no $dt\,dr$ term. **Spherical**: the angles enter only as a round sphere, $r^2d\Omega^2$, which *defines* $r$ as the areal radius. Two functions remain:
$$ds^2 = -e^{2\alpha(r)}dt^2 + e^{2\beta(r)}dr^2 + r^2d\Omega^2.$$
Writing them as exponentials keeps $g_{tt} < 0$ and $g_{rr} > 0$ automatically.` },
      { label: 'Christoffel symbols', text: t`From $\Gamma^\lambda{}_{\mu\nu} = \tfrac12 g^{\lambda\sigma}(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu})$ (step 11), with primes meaning $d/dr$, only these are non-zero (up to swapping the lower indices):
$$\Gamma^t{}_{tr} = \alpha', \quad \Gamma^r{}_{tt} = e^{2(\alpha - \beta)}\alpha', \quad \Gamma^r{}_{rr} = \beta', \quad \Gamma^\theta{}_{r\theta} = \Gamma^\phi{}_{r\phi} = \frac1r,$$
$$\Gamma^r{}_{\theta\theta} = -re^{-2\beta}, \quad \Gamma^r{}_{\phi\phi} = -re^{-2\beta}\sin^2\theta, \quad \Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta, \quad \Gamma^\phi{}_{\theta\phi} = \cot\theta.$$` },
      { label: 'The Ricci tensor', text: t`Contracting the Riemann tensor built from them (steps 14–15) leaves four non-zero components:
$$R_{tt} = e^{2(\alpha - \beta)}\left[\alpha'' + \alpha'^2 - \alpha'\beta' + \tfrac2r\alpha'\right], \qquad R_{rr} = -\alpha'' - \alpha'^2 + \alpha'\beta' + \tfrac2r\beta',$$
$$R_{\theta\theta} = e^{-2\beta}\left[r(\beta' - \alpha') - 1\right] + 1, \qquad R_{\phi\phi} = \sin^2\theta\,R_{\theta\theta}.$$` },
      { label: 'Combine', text: t`Vacuum: each is zero. The useful combination kills the second derivatives:
$$e^{2(\beta - \alpha)}R_{tt} + R_{rr} = \frac2r(\alpha' + \beta') = 0,$$
so $\alpha + \beta$ is a constant $k$. Redefining $\tilde t = e^{k}t$ — just choosing the unit of the far-away clock — makes it zero: $\beta = -\alpha$.` },
      { label: 'Solve', text: t`Write $f = e^{2\alpha} = e^{-2\beta}$. Then $R_{\theta\theta} = 1 - (rf)'$, and $R_{\theta\theta} = 0$ integrates at once: $rf = r - R_s$, so
$$f = 1 - \frac{R_s}{r},$$
with $R_s$ a constant of integration. The other equations then hold too: $R_{tt} = \dfrac{f}{2r^2}\,(r^2f')'$, and $r^2f' = R_s$ is constant.` },
      { label: 'Fix the constant', text: t`Far from the mass a slowly moving body must feel Newton's gravity, which needs $g_{tt} \approx -(1 + 2\Phi)$ with $\Phi = -M/r$ (the Newtonian limit, step 19). So $1 - R_s/r = 1 - 2M/r$, and $R_s = 2M$ — in SI units, $r_s = 2GM/c^2$.` },
      { label: 'Verify', text: t`Put $f = 1 - 2M/r$ back and let SymPy compute every component:

\`\`\`python
g = sp.diag(-f, 1/f, r**2, r**2*sp.sin(th)**2)   # f = 1 - 2*M/r
[ricci(m, n) for m in range(4) for n in range(m, 4)]   # ricci() as in the practice exercise
# [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
\`\`\`

All ten vanish. Curvature does not: the Kretschmann scalar $R_{\mu\nu\rho\sigma}R^{\mu\nu\rho\sigma} = 48M^2/r^6$. Ricci-flat is not flat — the tides survive.` },
      { label: 'Sense check', text: t`Restoring $G$ and $c$, $2M$ is $2GM/c^2$, a length: 2.95 km for the Sun, 8.87 mm for the Earth. With $M \to 0$, or $r \to \infty$, the metric becomes Minkowski's in spherical coordinates. And the static assumption turns out to be unnecessary: Birkhoff's theorem shows that *every* spherically symmetric vacuum is this one.` },
    ],
    answer: t`$ds^2 = -(1 - 2M/r)\,dt^2 + (1 - 2M/r)^{-1}dr^2 + r^2d\Omega^2$, with the integration constant fixed by Newton's limit to $2M = 2GM/c^2$. All ten $R_{\mu\nu}$ vanish; the Kretschmann scalar $48M^2/r^6$ does not.`,
  },
  practice: [
    expr({
      id: 'christoffel', difficulty: 2,
      gen(r) {
        const c = r.pick(CHRIST);
        return {
          prompt: t`For the Schwarzschild metric ($G = c = 1$), $g_{tt} = -(1 - 2M/r)$, $g_{rr} = (1 - 2M/r)^{-1}$, $g_{\theta\theta} = r^2$, $g_{\phi\phi} = r^2\sin^2\theta$, and every off-diagonal entry is zero. Use
$$\Gamma^\lambda{}_{\mu\nu} = \tfrac12 g^{\lambda\sigma}\left(\partial_\mu g_{\nu\sigma} + \partial_\nu g_{\mu\sigma} - \partial_\sigma g_{\mu\nu}\right)$$
to find $${c.name}$. Type $M$ and $r$ as letters.`,
          answer: c.answer, answerTeX: c.tex, lhs: c.lhs,
          vars: { M: [0.5, 1.5], r: [4, 12] },
          errors: c.errors,
          hints: c.hints,
          teach: 'For a diagonal metric each Christoffel symbol needs only one entry of the inverse metric and one or two derivatives of the metric.',
          explain: c.explain,
          visual: metricCurves(),
        };
      },
    }),
    mcq({
      id: 'no-cross-term', difficulty: 2,
      prompt: t`The ansatz $ds^2 = -e^{2\alpha}dt^2 + e^{2\beta}dr^2 + r^2d\Omega^2$ has no $g_{tr}\,dt\,dr$ term (the "?" entries in the picture). What justifies leaving it out for a **static** mass?`,
      choices: [
        t`A static spacetime is unchanged when time runs backward, $t \to -t$, but that flips the sign of a $dt\,dr$ term — so the term must be zero`,
        'Every metric must be diagonal, in any coordinates',
        'An off-diagonal entry would make the metric tensor non-symmetric',
        'A dt dr term would always make spacetime curved, and we want the curvature to come out of the equations',
      ],
      answer: 0,
      why: {
        1: t`Far from it: the Kerr metric has a $dt\,d\phi$ term, and this very spacetime in Eddington–Finkelstein coordinates (step 22) has a $dv\,dr$ term.`,
        2: t`$g_{tr} = g_{rt}$ keeps the metric symmetric; symmetric matrices can have off-diagonal entries.`,
        3: 'Off-diagonal entries can appear even in flat spacetime, for instance in rotating coordinates. Curvature is not read off a single entry.',
      },
      hints: ['What does “static” mean, beyond “nothing depends on t”?', t`Under $t \to -t$, $dt \to -dt$: which terms of the metric change sign?`],
      teach: 'Static means time-independent and time-reversal symmetric, which forbids any dt dxⁱ cross terms.',
      explain: t`$t \to -t$ sends $dt\,dr \to -dt\,dr$ while leaving $dt^2$ and $dr^2$ alone. A static spacetime looks the same played backward, so $g_{tr} = 0$. (For a spherical metric a $dt\,dr$ term could also simply be removed by resetting each clock, $t \to t + F(r)$.)`,
      visual: ansatzTable(t`The static, spherical ansatz as a matrix $g_{\mu\nu}$. The red entries, $g_{tr} = g_{rt}$, are the ones in question.`, true),
    }),
    mcq({
      id: 'rescale-t', difficulty: 3,
      prompt: t`The vacuum equations give $e^{2(\beta - \alpha)}R_{tt} + R_{rr} = \dfrac{2}{r}(\alpha' + \beta') = 0$, so $\alpha + \beta = k$, a constant. Why may you set $k = 0$?`,
      choices: [
        t`Redefining the time coordinate, $\tilde t = e^{k}t$, removes it: $k$ only sets the unit in which the far-away clock is read`,
        t`The metric must reduce to Minkowski's at $r = 0$, which needs $k = 0$`,
        t`The determinant of the metric must equal $-1$, which needs $k = 0$`,
        t`In vacuum the total energy is zero, and $k$ is that energy`,
      ],
      answer: 0,
      why: {
        1: t`There is no flat region at $r = 0$ — that is where the curvature blows up. What fixes $k$ is the behaviour far away.`,
        2: t`The determinant is $-e^{2(\alpha + \beta)}r^4\sin^2\theta$; nothing requires it to be $-1$.`,
        3: t`$k$ is not an energy. The mass survives as the other integration constant, $R_s = 2M$: empty space around a star still carries the star's mass in its metric.`,
      },
      hints: [t`With $\beta = k - \alpha$, write out $g_{tt}\,dt^2$ and $g_{rr}\,dr^2$. Where does $k$ appear?`, t`$-e^{2\alpha}dt^2 = -e^{2(\alpha - k)}\,(e^{k}dt)^2$. Call $\alpha - k$ the new $\alpha$ and $e^{k}t$ the new $t$.`],
      teach: 'A constant that a change of coordinates can remove carries no physics: here it is just the unit of time.',
      explain: t`With $\alpha + \beta = k$, $-e^{2\alpha}dt^2 = -e^{2(\alpha - k)}d\tilde t^{\,2}$ with $\tilde t = e^{k}t$, and $e^{2\beta} = e^{-2(\alpha - k)}$. So the new $\tilde\alpha = \alpha - k$ satisfies $\tilde\alpha + \beta = 0$. In the picture, $k$ only changes what $-g_{tt}$ tends to far away; choosing $\tilde t$ so that it tends to 1 makes $\tilde t$ the proper time of clocks far from the mass.`,
      visual: rescale,
    }),
    mcq({
      id: 'trial-k', difficulty: 3,
      prompt: t`A student proposes $f(r) = 1 - \dfrac{2M}{r} + \dfrac{kM^2}{r^2}$ (with $g_{tt} = -f$, $g_{rr} = 1/f$, $G = c = 1$) and claims it solves the vacuum equations for any constant $k$. With $\beta = -\alpha$ the vacuum equations need $R_{\theta\theta} = 1 - (rf)' = 0$. What does that say about $k$?`,
      choices: [
        t`Only $k = 0$ works: $R_{\theta\theta} = kM^2/r^2$, so a $1/r^2$ term needs a source — the electric field of a charged mass supplies one`,
        t`Any $k$ works: the extra term dies away far from the mass`,
        t`Only $k = 1$, which makes $f = (1 - M/r)^2$ and puts a single horizon at $r = M$`,
        t`Any $k < 1$, so that $f$ has two real roots (two horizons)`,
      ],
      answer: 0,
      why: {
        1: t`Fading far away is not enough: the vacuum equations must hold at every $r$, and $R_{\theta\theta} = kM^2/r^2$ is not zero anywhere when $k \neq 0$.`,
        2: t`A neat factorization is not a field equation. With $k = 1$, $R_{\theta\theta} = M^2/r^2 \neq 0$: that metric (extremal Reissner–Nordström) needs a charge.`,
        3: t`Whether $f$ has roots is decided after solving the equations, not instead of them; $R_{\theta\theta} = kM^2/r^2$ rules out every $k \neq 0$.`,
      },
      hints: [t`Compute $rf = r - 2M + kM^2/r$, then differentiate.`, t`$(rf)' = 1 - kM^2/r^2$, so $R_{\theta\theta} = 1 - (rf)' = kM^2/r^2$.`],
      teach: 'A metric is a vacuum solution only if every Ricci component vanishes at every point — not just far away.',
      explain: t`$(rf)' = 1 - kM^2/r^2$ gives $R_{\theta\theta} = kM^2/r^2$, zero only for $k = 0$. A $+Q^2/r^2$ term is exactly what an electric charge produces: the Reissner–Nordström metric solves Einstein's equations *with* the field's stress–energy as the source, not $R_{\mu\nu} = 0$.`,
      visual: trialCurves,
    }),
    order({
      id: 'steps', difficulty: 2,
      prompt: 'Put the steps of the derivation of the Schwarzschild metric in order.',
      items: [
        t`Write the most general static, spherically symmetric metric: $-e^{2\alpha}dt^2 + e^{2\beta}dr^2 + r^2d\Omega^2$.`,
        t`Compute the Christoffel symbols from the first derivatives of the metric.`,
        t`Compute $R_{tt}$, $R_{rr}$ and $R_{\theta\theta}$ from the Christoffel symbols and their derivatives.`,
        t`Combine $e^{2(\beta - \alpha)}R_{tt} + R_{rr} = 0$ to get $\alpha + \beta = $ constant, and rescale $t$ to make it zero.`,
        t`Solve $R_{\theta\theta} = 1 - (rf)' = 0$: $f = 1 - R_s/r$.`,
        t`Match Newton's gravity far away: $R_s = 2M$.`,
      ],
      hints: ['Curvature is built from Christoffels, and Christoffels from the metric.', 'The integration constant is fixed last, by comparing with Newton far from the mass.'],
      teach: 'Ansatz, connection, curvature, field equations, integration, boundary condition: the pattern of almost every exact solution.',
      explain: t`Symmetry gives the ansatz; Christoffels and then Ricci give the field equations; one combination removes a constant that only sets the unit of time; one equation integrates to $f = 1 - R_s/r$; Newton fixes $R_s = 2M$.`,
      visual: ansatzTable(t`The starting point: the ansatz as a matrix, with two unknown functions on the diagonal.`),
    }),
    code({
      id: 'sympy-ricci', difficulty: 3,
      prompt: t`Verify the solution with SymPy. The program sets up the Schwarzschild metric and a function \`ricci(m, n)\` that builds $R_{\mu\nu}$ from Christoffel symbols. Complete \`christoffel(l, m, n)\` so that it returns
$$\Gamma^l{}_{mn} = \tfrac12\sum_{s} g^{ls}\left(\partial_m g_{ns} + \partial_n g_{ms} - \partial_s g_{mn}\right).$$
Index 0 is $t$, 1 is $r$, 2 is $\theta$, 3 is $\phi$; \`ginv\` is $g^{\mu\nu}$ and \`sp.diff(expr, x[m])\` is $\partial_m$.`,
      starter: t`import sympy as sp

t, r, th, ph, M = sp.symbols('t r theta phi M', positive=True)
x = [t, r, th, ph]
f = 1 - 2*M/r
g = sp.diag(-f, 1/f, r**2, r**2*sp.sin(th)**2)   # Schwarzschild, G = c = 1
ginv = g.inv()

def christoffel(l, m, n):
    """Gamma^l_mn = 1/2 g^{ls} (d_m g_ns + d_n g_ms - d_s g_mn), summed over s."""
    return 0   # replace with the sum over s

def ricci(m, n):
    """R_mn, built from the Christoffels (sums over l and k)."""
    total = 0
    for l in range(4):
        total += sp.diff(christoffel(l, m, n), x[l]) - sp.diff(christoffel(l, l, m), x[n])
        for k in range(4):
            total += christoffel(l, l, k)*christoffel(k, m, n) - christoffel(l, n, k)*christoffel(k, l, m)
    return sp.simplify(total)
`,
      answer: t`import sympy as sp

t, r, th, ph, M = sp.symbols('t r theta phi M', positive=True)
x = [t, r, th, ph]
f = 1 - 2*M/r
g = sp.diag(-f, 1/f, r**2, r**2*sp.sin(th)**2)   # Schwarzschild, G = c = 1
ginv = g.inv()

def christoffel(l, m, n):
    """Gamma^l_mn = 1/2 g^{ls} (d_m g_ns + d_n g_ms - d_s g_mn), summed over s."""
    return sum(ginv[l, s]*(sp.diff(g[n, s], x[m]) + sp.diff(g[m, s], x[n]) - sp.diff(g[m, n], x[s])) for s in range(4))/2

def ricci(m, n):
    """R_mn, built from the Christoffels (sums over l and k)."""
    total = 0
    for l in range(4):
        total += sp.diff(christoffel(l, m, n), x[l]) - sp.diff(christoffel(l, l, m), x[n])
        for k in range(4):
            total += christoffel(l, l, k)*christoffel(k, m, n) - christoffel(l, n, k)*christoffel(k, l, m)
    return sp.simplify(total)
`,
      tests: [
        { name: t`$\Gamma^r{}_{tt} = M(r - 2M)/r^3$`, code: 'sp.simplify(christoffel(1, 0, 0) - M*(r - 2*M)/r**3) == 0' },
        { name: t`$\Gamma^t{}_{tr} = M/[r(r - 2M)]$`, code: 'sp.simplify(christoffel(0, 0, 1) - M/(r*(r - 2*M))) == 0' },
        { name: t`$\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$`, code: 'sp.simplify(christoffel(2, 3, 3) + sp.sin(th)*sp.cos(th)) == 0' },
        { name: t`with your Christoffels, all ten $R_{\mu\nu}$ vanish`, code: 'christoffel(1, 0, 0) != 0 and all(ricci(m, n) == 0 for m in range(4) for n in range(m, 4))' },
      ],
      hints: [t`Loop over $s$ from 0 to 3 and add up \`ginv[l, s]*(…)\`; the metric's entries are \`g[i, j]\`.`, t`One line does it: \`return sum(ginv[l, s]*(sp.diff(g[n, s], x[m]) + sp.diff(g[m, s], x[n]) - sp.diff(g[m, n], x[s])) for s in range(4))/2\`.`],
      teach: 'A Christoffel symbol is a short sum over one index of first derivatives of the metric, weighted by the inverse metric.',
      explain: t`With the sum in place SymPy reproduces the hand-computed symbols and confirms that every component of $R_{\mu\nu}$ simplifies to zero: the Schwarzschild metric solves the vacuum equations exactly, at every $r$, not just far away. Changing \`f\` to \`1 - 2*M/r**2\` and rerunning would show $R_{\theta\theta} \neq 0$ — the Explore picture, done symbolically.`,
      visual: metricCurves(t`The metric being checked ($G = c = 1$, $r$ in units of $M$). SymPy differentiates these functions exactly, so the check holds at every $r$ outside $2M$.`),
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-charge', difficulty: 2,
      prompt: t`A charged, non-spinning black hole has $f(r) = 1 - \dfrac{2M}{r} + \dfrac{Q^2}{r^2}$ (the Reissner–Nordström metric, with $G = c = 1$ and the charge $Q$ in matching units), again with $g_{tt} = -f$ and $g_{rr} = 1/f$. Compute $R_{\theta\theta} = 1 - (rf)'$. Since it is not zero, this is not a vacuum solution: the electric field's energy is its source.`,
      answer: 'Q^2/r^2', answerTeX: t`\frac{Q^2}{r^2}`, lhs: t`R_{\theta\theta}`,
      vars: { Q: [0.2, 0.9], M: [0.5, 1.5], r: [3, 10] },
      errors: [
        { answer: '-Q^2/r^2', feedback: t`$(rf)' = 1 - Q^2/r^2$, so $1 - (rf)' = +Q^2/r^2$.` },
        { answer: '1 - Q^2/r^2', feedback: t`That is $(rf)'$ itself. $R_{\theta\theta}$ is one minus it.` },
      ],
      hints: [t`$rf = r - 2M + Q^2/r$.`],
      teach: 'Each extra term in f leaves a non-zero Ricci component, which the field equations must match with a source.',
      explain: t`$rf = r - 2M + Q^2/r$, so $(rf)' = 1 - Q^2/r^2$ and $R_{\theta\theta} = Q^2/r^2$. Einstein's equations match it with the electric field's stress–energy, $\propto Q^2/r^4$. Astrophysical black holes are thought to be very nearly neutral — ionized gas around them would quickly cancel any charge — so Schwarzschild and Kerr are the ones that matter.`,
      visual: rnCurves,
    }),
    expr({
      id: 'cp-lambda', difficulty: 3,
      prompt: t`With a cosmological constant the vacuum equations become $R_{\mu\nu} = \Lambda g_{\mu\nu}$. The same ansatz still gives $\beta = -\alpha$, and the $\theta\theta$ equation becomes $1 - (rf)' = \Lambda r^2$. Find the $f(r)$ that reduces to Schwarzschild's $1 - 2M/r$ when $\Lambda = 0$. (Type $\Lambda$ as \`Lambda\`.)`,
      answer: '1 - 2M/r - Lambda r^2/3', answerTeX: t`1 - \frac{2M}{r} - \frac{\Lambda r^2}{3}`, lhs: 'f(r)',
      vars: { M: [0.5, 1.5], r: [3, 10], Lambda: [0.001, 0.02] },
      errors: [
        { answer: '1 - 2M/r - Lambda r^2', feedback: t`Integrating $\Lambda r^2$ gives $\Lambda r^3/3$: you lost the $\tfrac13$.` },
        { answer: '1 - 2M/r + Lambda r^2/3', feedback: t`$(rf)' = 1 - \Lambda r^2$, so $rf = r - \Lambda r^3/3 - 2M$: the $\Lambda$ term enters with a minus sign.` },
      ],
      hints: [t`Rearrange: $(rf)' = 1 - \Lambda r^2$. Integrate once.`, t`$rf = r - \dfrac{\Lambda r^3}{3} - 2M$, with the constant chosen to match Schwarzschild.`],
      teach: 'With Λ the same integration gives Schwarzschild–de Sitter: the mass term falls off as 1/r, the Λ term grows as r².',
      explain: t`$(rf)' = 1 - \Lambda r^2$ integrates to $rf = r - \Lambda r^3/3 - 2M$, so $f = 1 - 2M/r - \Lambda r^2/3$: the Schwarzschild–de Sitter (Kottler) metric, checked with SymPy to give $R_{\mu\nu} = \Lambda g_{\mu\nu}$. With the measured $\Lambda \approx 1.1\times10^{-52}\ \text{m}^{-2}$ its effect on any planetary orbit is unmeasurably small.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 30], y: [-0.6, 1.2], xlabel: 'r / M', ylabel: 'f(r)',
          curves: [{ fn: '1 - 2/x', domain: [1.6, 30], color: 'gold', label: 'Λ = 0: Schwarzschild', labelAt: 14, labelDy: 16 }],
          hlines: [{ y: 0 }],
        },
        caption: t`The starting point: Schwarzschild's $f = 1 - 2M/r$ ($G = c = 1$). Your answer adds a term that grows with $r$.`,
      },
    }),
    num({
      id: 'cp-balance', difficulty: 3, transfer: true,
      gen(r) {
        const [what, m] = r.pick([['the Sun, imagined alone in the universe', 1], ['a galaxy of $10^{12}$ solar masses', 1e12], ['a cluster of galaxies of $10^{15}$ solar masses', 1e15]]);
        const R = Math.cbrt((3 * m * M_SUN) / LAMBDA), x = R / PC;
        const mTeX = m === 1 ? '1476.6' : m === 1e12 ? t`10^{12}\times1476.6` : t`10^{15}\times1476.6`;
        const AU_RATIO = (LAMBDA * 1.495978707e11 ** 3) / (3 * M_SUN);   // Λ's push ÷ the Sun's pull at 1 AU
        return {
          prompt: t`In Schwarzschild–de Sitter, $f = 1 - 2M/r - \Lambda r^2/3$ (with $G = c = 1$). A static observer there needs no rocket where $f'(r) = 0$: the mass's pull and $\Lambda$'s push balance. Find that radius for ${what}, in parsecs. Use $GM_\odot/c^2 = 1476.6$ m, $\Lambda = 1.1\times10^{-52}\ \text{m}^{-2}$ and 1 pc $= 3.086\times10^{16}$ m.`,
          answer: x, units: 'pc', tol: { rel: 0.01 },
          errors: [
            { value: Math.cbrt((6 * m * M_SUN) / LAMBDA) / PC, feedback: t`Differentiate carefully: $f' = 2M/r^2 - 2\Lambda r/3$, so $r^3 = 3M/\Lambda$.` },
            { value: Math.sqrt((3 * m * M_SUN) / LAMBDA) / PC, feedback: t`Balance gives $M/r^2 = \Lambda r/3$, a cube: $r^3 = 3M/\Lambda$.` },
          ],
          hints: [t`$f'(r) = \dfrac{2M}{r^2} - \dfrac{2\Lambda r}{3} = 0$ gives $r^3 = 3M/\Lambda$.`, t`$M = ${mTeX}$ m, so $r = \left(3M/1.1\times10^{-52}\right)^{1/3}$ m; divide by $3.086\times10^{16}$.`],
          teach: 'In Schwarzschild–de Sitter the attraction falls as 1/r² while Λ’s repulsion grows as r, so they balance at r = (3M/Λ)^(1/3).',
          explain: t`$r^3 = 3M/\Lambda$ gives $r = ${sci(R)}$ m $= ${sci(x)}$ pc. ${m === 1 ? 'For the Sun that lies far beyond the region it dominates inside the Galaxy anyway' : m === 1e12 ? 'About a megaparsec — comparable to the size of galaxy groups like our own; farther out, Λ’s push beats the group’s pull' : 'About ten megaparsecs: farther out, not even a rich cluster can hold anything at rest'}. Λ matters only on the largest scales: at the Earth's orbit its push is about $${sci(AU_RATIO, 1)}$ of the Sun's pull.`,
          visual: balancePic,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (the Schwarzschild solution)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Carroll, Spacetime and Geometry, §5.1–5.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Schwarzschild (1916), “On the gravitational field of a mass point…”, English translation', url: 'https://arxiv.org/abs/physics/9905030' },
  ],
});
