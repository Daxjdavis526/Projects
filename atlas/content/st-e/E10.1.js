// Green's functions for a general Sturm–Liouville operator Lu = −(pu′)′ + qu
// on [a, b]: the construction from one solution fitting each end,
// G = −u₁(x<)u₂(x>)/(pW), with pW constant by Abel's theorem; continuity and
// the slope jump −1/p(s); symmetry from self-adjointness (Lagrange's
// identity); the eigenfunction expansion Σφₙ(x)φₙ(s)/λₙ and its slow 1/n²
// convergence; the Fredholm alternative when 0 is an eigenvalue. Examples:
// the screened operator −u″ + κ²u (a cooling fin) and −(xu′)′ (a heated
// cylindrical shell). Overlaps: st-b B9.1 (the tent for −u″, reciprocity,
// the cable) and st-d D11.1 (causal Green's functions) are linked.
import { lesson, mcq, num } from '../../src/core/content.js';
import { SF, SRC, gpic, r3, r4, PI } from './_sf.js';

const t = String.raw;
// −u″ + κ²u on [0, 1], u(0) = u(1) = 0
const Gs = (k, x, s) => (Math.sinh(k * Math.min(x, s)) * Math.sinh(k * (1 - Math.max(x, s)))) / (k * Math.sinh(k));
const GsExpr = (k, s) => `(step(${s} - x)*sinh(${k}*x)*sinh(${k}*(1 - ${s})) + step(x - ${s})*sinh(${k}*${s})*sinh(${k}*(1 - x)))/(${k}*sinh(${k}))`;
// −(xu′)′ on [1, 2], u(1) = u(2) = 0
const L2 = Math.log(2);
const Gx = (x, s) => (Math.log(Math.min(x, s)) * Math.log(2 / Math.max(x, s))) / L2;
const uShell = (x) => -x * x / 4 + (3 / (4 * L2)) * Math.log(x) + 0.25;
const uShellG = (x) => SF.integrate((s) => Gx(x, s) * s, 1, x, 20) + SF.integrate((s) => Gx(x, s) * s, x, 2, 20);

export default lesson({
  id: 'st-e.E10.1',
  title: 'Impulse responses and Green’s functions',
  minutes: 16, difficulty: 3,
  intro: t`A **Green’s function** is the response to a unit point source: $LG(\cdot, s) = \delta(x - s)$ with the boundary conditions built in. Superposition then solves every source at once, $u(x) = \int_a^bG(x, s)f(s)\,ds$. [ST-B](#/lesson/st-b.B9.1) found the tent for $-u''$; here is the construction for any Sturm–Liouville operator $Lu = -(pu')' + qu$ on $[a, b]$. Take $u_1$ solving $Lu_1 = 0$ with the **left** boundary condition and $u_2$ solving $Lu_2 = 0$ with the **right** one; then

$$G(x, s) = -\frac{u_1(x_<)\,u_2(x_>)}{p\,W[u_1, u_2]}, \qquad W = u_1u_2' - u_1'u_2,$$

where $x_<$ and $x_>$ are the smaller and larger of $x$ and $s$. The product $pW$ is a constant (Abel’s theorem), so this is well defined; $G$ is continuous and its slope drops by $1/p(s)$ across $x = s$. The construction fails exactly when $u_1$ and $u_2$ are the same function — when 0 is an eigenvalue — and then the **Fredholm alternative** takes over. In time instead of space, the same object with only a left condition is the causal **impulse response** ([ST-D](#/lesson/st-d.D11.1)).`,
  symbols: [
    { tex: 'G(x, s)', text: 'the response at $x$ to a unit point source at $s$' },
    { tex: 'u_1,\\ u_2', text: 'solutions of $Lu = 0$ obeying the left and the right boundary condition respectively' },
    { tex: 'p(x)', text: 'the coefficient in $-(pu\')\'$ — a stiffness, conductivity or tension; $p > 0$' },
    { tex: 'W', text: 'the Wronskian $u_1u_2\' - u_1\'u_2$; $pW$ is constant' },
    { tex: 'x_<,\\ x_>', text: '$\\min(x, s)$ and $\\max(x, s)$' },
  ],
  why: t`Green’s functions turn every linear boundary-value problem — heat in a fin, deflection of a beam, the potential of a charge, a detector’s response to a gravitational-wave strain — into one integral, and their eigenfunction form links them to the spectra of [E5](#/lesson/st-e.E5.2).`,
  visual: {
    type: 'graph',
    title: 'One kernel, two ways',
    lead: t`For $Lu = -u'' + \kappa^2u$ on $[0, 1]$ with $u = 0$ at both ends, the blue curve is the exact $G(x, s)$ from the $u_1u_2$ construction; the dashed curve is the sum of the first $N$ terms of its eigenfunction expansion $\sum_n\dfrac{2\sin n\pi x\,\sin n\pi s}{n^2\pi^2 + \kappa^2}$.`,
    tasks: [
      'Drag the source s: the kink follows it. Note the height at x = 0.7 with s = 0.3, then at x = 0.3 with s = 0.7: the same — G(x, s) = G(s, x).',
      'Set N = 1, 2, 5, 20: the sum converges, but slowly at the kink, where the coefficients fall only like 1/n².',
      'Raise κ: G shrinks and localizes around s — a source in a medium that leaks (heat loss, screening) is felt only nearby, over a distance 1/κ.',
    ],
    params: {
      x: [0, 1], y: [-0.02, 0.27], xlabel: 'x', ylabel: '', aspect: 'wide', axesAt: 'edge',
      sliders: [
        { key: 's', label: 'Source position $s$', min: 0.05, max: 0.95, step: 0.01, value: 0.35, unit: '', explain: 'Where the unit point source sits.' },
        { key: 'kap', label: 'Screening $\\kappa$', min: 0.5, max: 12, step: 0.1, value: 2, unit: '', explain: 'The leak rate: $\\kappa^2u$ removes what $-u\'\'$ spreads.' },
        { key: 'N', label: 'Modes $N$', min: 1, max: 30, step: 1, value: 3, unit: '', explain: 'Terms kept in the eigenfunction sum.' },
      ],
      curves: [
        { fn: '(step(s - x)*sinh(kap*x)*sinh(kap*(1 - s)) + step(x - s)*sinh(kap*s)*sinh(kap*(1 - x)))/(kap*sinh(kap))', color: 'accent', width: 2.4 },
        { sum: '2*sin(k*pi*x)*sin(k*pi*s)/((k*pi)^2 + kap^2)', k: [1, 'N'], color: 'warn', width: 1.8, dash: [6, 4] },
      ],
      vlines: [{ x: 's', color: 'gold' }],
      readouts: [{ label: '$G(s, s) =$', expr: 'sinh(kap*s)*sinh(kap*(1 - s))/(kap*sinh(kap))', digits: 4 }],
    },
    caption: 'Exact G (blue) against the truncated eigenfunction sum (dashed); gold: the source. The ends are held at zero.',
  },
  example: {
    prompt: t`A long cylindrical shell between radii $r = 1$ and $r = 2$ (in units of the inner radius) is heated uniformly, with both surfaces held at the coolant temperature. Steady conduction gives $-(r\,u')' = r$ for the temperature rise $u$ (in units of $qa^2/k$), with $u(1) = u(2) = 0$. Build $G$ and find $u(1.5)$.`,
    visual: gpic({ x: [1, 2], y: [-0.01, 0.17], xlabel: 'r', curves: [{ fn: '-x^2/4 + 3/(4*ln(2))*ln(x) + 0.25', color: 'accent', width: 2.4, label: 'u(r)', labelAt: 1.2, labelDy: -6 }, ...[1.3, 1.5, 1.7].map((s) => ({ fn: `0.3*(step(${s} - x)*ln(x)*ln(2/${s}) + step(x - ${s})*ln(${s})*ln(2/x))/ln(2)`, color: 'ink3', width: 1.2, dash: [4, 4] }))] }, 'The temperature rise u(r) (blue) and, dashed, G(r, s) for s = 1.3, 1.5, 1.7 (scaled down to fit): u is their superposition.'),
    steps: [
      { label: 'Homogeneous solutions', text: t`$-(ru')' = 0$ gives $u = A + B\ln r$. Left condition $u(1) = 0$: $u_1 = \ln r$. Right condition $u(2) = 0$: $u_2 = \ln(2/r)$.` },
      { label: 'Wronskian and Abel', text: t`$W = \ln r\cdot\big(-\tfrac1r\big) - \tfrac1r\ln\tfrac2r = -\dfrac{\ln 2}{r}$, so $pW = r\,W = -\ln 2$: constant, as Abel promises.` },
      { label: 'The kernel', text: t`$G(r, s) = \dfrac{\ln r_<\,\ln(2/r_>)}{\ln 2}$: continuous, zero at both walls, symmetric in $r$ and $s$, with slope dropping by $1/p(s) = 1/s$ at $r = s$.` },
      { label: 'Superpose', text: t`$u(1.5) = \displaystyle\int_1^2G(1.5, s)\,s\,ds = ${r4(uShellG(1.5))}$ (the source term is $r$, from $-(ru')' = r\cdot1$).` },
      { label: 'Check directly', text: t`Integrating $-(ru')' = r$ twice: $u = -\tfrac{r^2}{4} + A\ln r + B$ with $B = \tfrac14$, $A = \tfrac{3}{4\ln2}$. At $r = 1.5$: $u = ${r4(uShell(1.5))}$ — the same.` },
    ],
    answer: t`$G(r, s) = \ln r_<\ln(2/r_>)/\ln 2$ and $u(1.5) = ${r4(uShell(1.5))}$ (in units of $qa^2/k$). Once $G$ is known, any heating profile $q(r)$ costs one integral.`,
  },
  practice: [
    num({
      id: 'screened', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3, 5]), x = r.pick([0.2, 0.3, 0.7]), s = r.pick([0.4, 0.5, 0.6]);
        const ans = Gs(k, x, s);
        return {
          prompt: t`For $-u'' + ${k * k}u = f$ on $[0, 1]$ with $u(0) = u(1) = 0$, $u_1 = \sinh ${k}x$ and $u_2 = \sinh ${k}(1 - x)$. Evaluate $G(${x}, ${s})$.`,
          visual: gpic({ x: [0, 1], y: [-0.01, 1.2 * Gs(k, s, s)], yticks: 0, xlabel: 'x', curves: [{ fn: GsExpr(k, s), color: 'accent', width: 2.3 }], vlines: [{ x: s, color: 'gold' }] }, t`The shape of $G(x, ${s})$ as a function of $x$ (vertical scale hidden); gold: the source.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sinh(k * Math.min(x, s)) * Math.sinh(k * (1 - Math.max(x, s))) / Math.sinh(k), feedback: t`$pW = -${k}\sinh ${k}$: divide by $${k}\sinh ${k}$, not just $\sinh ${k}$.` }, { value: Math.sinh(k * Math.max(x, s)) * Math.sinh(k * (1 - Math.min(x, s))) / (k * Math.sinh(k)), feedback: t`$u_1$ takes the smaller of $x$ and $s$, $u_2$ the larger.` }].filter((e) => e.value > 0 && Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$W = u_1u_2' - u_1'u_2 = -${k}\big(\sinh ${k}x\cosh ${k}(1 - x) + \cosh ${k}x\sinh ${k}(1 - x)\big) = -${k}\sinh ${k}$.`, t`$G = \dfrac{\sinh(${k}x_<)\,\sinh\big(${k}(1 - x_>)\big)}{${k}\sinh ${k}}$ with $x_< = ${Math.min(x, s)}$, $x_> = ${Math.max(x, s)}$.`],
          teach: 'G is u₁ at the nearer-left point times u₂ at the farther-right point, over the constant −pW.',
          explain: t`$G(${x}, ${s}) = ${r4(ans)}$. As $\kappa \to 0$ it tends to the tent $x_<(1 - x_>)$ of [ST-B](#/lesson/st-b.B9.1).`,
        };
      },
    }),
    num({
      id: 'jump', difficulty: 2,
      gen(r) {
        const s = r.pick([1.2, 1.5, 1.8, 2.5]), ans = -1 / s;
        return {
          prompt: t`For $Lu = -(x\,u')'$ (so $p(x) = x$), by how much does $\partial G/\partial x$ change as $x$ crosses the source at $s = ${s}$ from left to right?`,
          visual: gpic({ x: [1, 3], y: [-0.02, 0.4], xlabel: 'x', curves: [{ fn: `(step(${s} - x)*ln(x)*ln(3/${s}) + step(x - ${s})*ln(${s})*ln(3/x))/ln(3)`, color: 'accent', width: 2.3 }], vlines: [{ x: s, color: 'gold' }] }, t`$G(x, ${s})$ for $-(xu')'$ on $[1, 3]$: a kink at the source.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / s, feedback: t`Integrate $-(pG')' = \delta$ across $s$: $-p\,[G']_{s^-}^{s^+} = 1$, so the jump is negative.` }, { value: -1, feedback: t`That is the jump for $p = 1$. Here $p(s) = ${s}$.` }, { value: -s, feedback: t`Divide by $p(s)$, don’t multiply.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * Math.abs(ans)),
          hints: [t`Integrate $-(p\,\partial_xG)' = \delta(x - s)$ from $s - \epsilon$ to $s + \epsilon$.`, t`$-p(s)\big(G'(s^+) - G'(s^-)\big) = 1$.`],
          teach: 'Across the source the flux p∂G/∂x drops by exactly the source strength 1.',
          explain: t`$[G'] = -1/p(s) = -1/${s} = ${r4(ans)}$. Physically: the heat flux $-pu'$ jumps by the power injected at the point.`,
        };
      },
    }),
    num({
      id: 'superpose', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 4, 6]), ans = (1 - 1 / Math.cosh(k / 2)) / (k * k);
        return {
          prompt: t`With the Green’s function of $-u'' + ${k * k}u$ on $[0, 1]$ (fixed ends), solve for a uniform source $f = 1$: find $u(\tfrac12) = \int_0^1G(\tfrac12, s)\,ds$.`,
          visual: gpic({ x: [0, 1], y: [-0.01, 1.2 * ans], yticks: 0, xlabel: 'x', curves: [{ fn: `(1 - cosh(${k}*(x - 0.5))/cosh(${k}/2))/${k * k}`, color: 'accent', width: 2.3 }, { fn: `${(0.5 / Gs(k, 0.5, 0.5)) * ans * 0.5}*(${GsExpr(k, 0.5)})`, color: 'ink3', width: 1.3, dash: [4, 4] }] }, 'The shape of the solution for f = 1 (blue) and of G(x, ½) (dashed); vertical scale hidden.'),
          answer: ans, tol: { rel: 0.005 },
          integrand: `(step(0.5 - s)*sinh(${k}*s)*sinh(${k}*0.5) + step(s - 0.5)*sinh(${k}*0.5)*sinh(${k}*(1 - s)))/(${k}*sinh(${k}))`, limits: [0, 1], vars: { s: [0, 1] },
          errors: [{ value: 1 / 8, feedback: t`$1/8$ is the unscreened answer ($\kappa = 0$); the leak term lowers it.` }, { value: 1 / (k * k), feedback: t`$1/\kappa^2$ is the value far from both ends of a long domain; here the ends still pull $u$ down.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`By symmetry, $\int_0^1G(\tfrac12, s)ds = 2\displaystyle\int_0^{1/2}\frac{\sinh ${k}s\,\sinh(${k}/2)}{${k}\sinh ${k}}ds$.`, t`Or solve directly: $u = \dfrac{1}{${k * k}}\Big(1 - \dfrac{\cosh ${k}(x - \frac12)}{\cosh(${k}/2)}\Big)$.`],
          teach: 'u = ∫G f ds: superpose the responses to point sources.',
          explain: t`$u(\tfrac12) = \dfrac{1 - \operatorname{sech}(${k}/2)}{${k * k}} = ${r4(ans)}$. The Green’s-function integral and the direct solution agree, as they must.`,
        };
      },
    }),
    mcq({
      id: 'symmetric', difficulty: 3,
      prompt: t`Why is $G(x, s) = G(s, x)$ for every Sturm–Liouville operator with self-adjoint boundary conditions?`,
      visual: gpic({ x: [0, 1], y: [-0.01, 0.13], xlabel: 'x', curves: [{ fn: GsExpr(2, 0.3), color: 'accent', width: 2.2 }, { fn: GsExpr(2, 0.75), color: 'violet', width: 2.2 }], points: [{ x: 0.75, y: Gs(2, 0.75, 0.3), color: 'gold', r: 5 }, { x: 0.3, y: Gs(2, 0.3, 0.75), color: 'gold', r: 5 }] }, 'G(x, 0.3) (blue) and G(x, 0.75) (violet): each passes through the same height at the other’s source (gold).'),
      choices: [
        'Apply Lagrange’s identity ∫(v·Lu − u·Lv) = boundary terms = 0 to u = G(·, s), v = G(·, x): it gives G(x, s) − G(s, x) = 0',
        'Because G is built from sinh, which is an odd function',
        'Because the source is a delta function, which is even',
        'It holds only for constant p; in general G is not symmetric',
      ],
      answer: 0,
      why: {
        1: 'Symmetry holds for every self-adjoint L — the shell’s logarithms are not odd functions.',
        2: 'δ(x − s) is symmetric in x and s, but that alone does not make the response symmetric; a non-self-adjoint L breaks it.',
        3: 'The shell example has p = r and its G is symmetric too; what matters is self-adjointness.',
      },
      hints: [t`Self-adjoint means $\int v\,Lu = \int u\,Lv$ for functions obeying the boundary conditions.`, t`Use $LG(\cdot, s) = \delta(\cdot - s)$ inside those integrals.`],
      teach: 'Reciprocity — the response at x to a source at s equals the response at s to a source at x — is self-adjointness in disguise.',
      explain: t`With $u = G(\cdot, s)$ and $v = G(\cdot, x)$: $\int\big(G(y, x)\delta(y - s) - G(y, s)\delta(y - x)\big)dy = G(s, x) - G(x, s) = 0$. For a non-self-adjoint operator (with a first-derivative drift term, say) reciprocity fails — a source upstream is felt downstream, not vice versa.`,
    }),
    num({
      id: 'one-mode', difficulty: 3,
      gen(r) {
        const k = r.pick([0.5, 1, 2]), x = r.pick([0.3, 0.5]), s = r.pick([0.4, 0.5, 0.6]);
        const ans = (2 * Math.sin(PI * x) * Math.sin(PI * s)) / (PI * PI + k * k), exact = Gs(k, x, s);
        return {
          prompt: t`The eigenfunctions of $-u'' + ${k * k}u$ on $[0, 1]$ with fixed ends are $\phi_n = \sqrt2\sin n\pi x$, with $\lambda_n = n^2\pi^2 + ${k * k}$, and $G(x, s) = \sum_n\phi_n(x)\phi_n(s)/\lambda_n$. Keep only $n = 1$: estimate $G(${x}, ${s})$.`,
          visual: gpic({ x: [0, 1], y: [-0.01, 1.25 * Gs(k, s, s)], xlabel: 'x', curves: [{ fn: GsExpr(k, s), color: 'accent', width: 2.3 }, { fn: `2*sin(pi*x)*sin(pi*${s})/(pi^2 + ${k * k})`, color: 'warn', width: 1.8, dash: [6, 4] }] }, `G(x, ${s}) (blue) and its first eigenfunction term (dashed).`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: exact, feedback: 'That is the exact G; the question asks for the one-term estimate.' }, { value: ans / 2, feedback: t`Normalized eigenfunctions carry $\sqrt2$: the product gives a factor 2.` }, { value: (2 * Math.sin(PI * x) * Math.sin(PI * s)) / (PI * PI), feedback: t`Include $\kappa^2 = ${k * k}$ in $\lambda_1$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`With $n = 1$: $\phi_1(x)\phi_1(s) = 2\sin\pi x\,\sin\pi s$ and $\lambda_1 = \pi^2 + ${k * k}$.`, t`$G \approx \dfrac{2\sin(\pi\cdot${x})\sin(\pi\cdot${s})}{\pi^2 + ${k * k}}$.`],
          teach: 'G is the inverse of L, so in the eigenbasis it is Σ φₙ(x)φₙ(s)/λₙ — the lowest modes dominate.',
          explain: t`$${r4(ans)}$, against the exact $${r4(exact)}$ — ${r3((100 * Math.abs(ans - exact)) / exact)}% off with one term. Terms fall like $1/n^2$ because $G$ has a kink at $x = s$ (a jump in slope), as in [E2.1](#/lesson/st-e.E2.1).`,
        };
      },
    }),
    mcq({
      id: 'fredholm', difficulty: 3,
      prompt: t`Try to build a Green’s function for $-u'' = f$ on $[0, 1]$ with **insulated** ends, $u'(0) = u'(1) = 0$. What happens?`,
      visual: gpic({ x: [0, 1], y: [-1.3, 1.3], xlabel: 'x', curves: [{ fn: '1', color: 'accent', width: 2.3, label: 'u = 1 solves −u″ = 0 with u′ = 0 at both ends', labelAt: 0.05, labelDy: -12 }, { fn: 'sin(2*pi*x)', color: 'warn', width: 1.6, dash: [6, 4], label: 'a heat source with zero net power', labelAt: 0.55, labelDy: 18 }] }, 'The constant (the zero-eigenvalue mode) and a source that integrates to zero.'),
      choices: [
        'u₁ and u₂ are both constants, W = 0 and no G exists; −u″ = f is solvable only if ∫f dx = 0, and then only up to an added constant',
        'G exists and is the same tent as for fixed ends',
        'G exists but is not symmetric',
        'A solution exists for every f, because the ends are insulated',
      ],
      answer: 0,
      why: {
        1: 'The tent vanishes at the ends; insulated ends need zero slope, and no tent has that.',
        2: 'The operator is still self-adjoint; the problem is existence, not symmetry.',
        3: 'With insulated ends and net heating the temperature rises forever: no steady state. Integrate the equation: −u′(1) + u′(0) = ∫f, so ∫f must be 0.',
      },
      hints: ['Which functions solve −u″ = 0 with u′(0) = 0? With u′(1) = 0?', 'Integrate −u″ = f over [0, 1] and use the boundary conditions.'],
      teach: 'If 0 is an eigenvalue, Lu = f is solvable only when f is orthogonal to the zero mode (Fredholm alternative).',
      explain: t`Both one-sided solutions are constants, so $W = 0$ and the formula breaks — 0 is an eigenvalue with eigenfunction 1. The **Fredholm alternative**: $Lu = f$ has a solution iff $\int f\cdot1\,dx = 0$, and then $u$ is unique up to adding the zero mode. A modified Green’s function handles that case.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fin', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.3, 0.4, 0.5]), m = r.pick([4, 6, 8]), kA = r.pick([0.03, 0.05]), Q = r.pick([2, 5, 8]), frac = r.pick([0.5, 0.25]);
        const s = frac * L, g = (Math.sinh(m * s) * Math.sinh(m * (L - s))) / (m * Math.sinh(m * L)), ans = (Q / kA) * g;
        return {
          prompt: t`A spacecraft radiator fin of length $L = ${L}$ m is bolted at both ends to a structure at the sink temperature. Along it, conduction and radiative loss give $-kA\,T'' + hP\,T = q(x)$ for the temperature rise $T$, i.e. $-T'' + m^2T = q/kA$ with $m = ${m}\ \text{m}^{-1}$ and $kA = ${kA}\ \text{W m/K}$. An electronics box dissipating $Q = ${Q}$ W is clamped at $x = ${s}$ m. Using the Green’s function of $-T'' + m^2T$ on $[0, L]$, what is the temperature rise under the box, in K?`,
          visual: gpic({ x: [0, L], y: [-0.02 * ans, 1.2 * ans], yticks: 0, xlabel: 'x (m)', curves: [{ fn: `${Q / kA}*(step(${s} - x)*sinh(${m}*x)*sinh(${m}*(${L} - ${s})) + step(x - ${s})*sinh(${m}*${s})*sinh(${m}*(${L} - x)))/(${m}*sinh(${m}*${L}))`, color: 'warn', width: 2.4 }], vlines: [{ x: s, color: 'gold' }] }, 'The shape of the temperature rise along the fin (vertical scale hidden; linearized radiation, uniform cross-section); gold: the box.'),
          answer: ans, units: 'K', tol: { rel: 0.005 },
          errors: [{ value: Q * g, feedback: t`The source is $q/kA$: divide the power by $kA = ${kA}$ W m/K.` }, { value: (Q / kA) * s * (L - s) / L, feedback: t`That ignores the loss term $m^2T$ — the bare tent $x_<(L - x_>)/L$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`On $[0, L]$: $u_1 = \sinh mx$, $u_2 = \sinh m(L - x)$, $G = \dfrac{\sinh(mx_<)\sinh\big(m(L - x_>)\big)}{m\sinh mL}$.`, t`$T(s) = \dfrac{Q}{kA}\,G(s, s)$ with $G(s, s) = ${r4(g)}$ m.`],
          teach: 'A point heat source in a lossy fin is the screened Green’s function times Q/kA; the loss confines the hot spot to about 1/m.',
          explain: t`$T = \dfrac{${Q}}{${kA}}\times${r4(g)} = ${r4(ans)}$ K. Without the radiative loss the tent would give $${r4((Q / kA) * s * (L - s) / L)}$ K; with it, heat leaks out within about $1/m = ${r3(1 / m)}$ m of the box. (Real radiation goes as $T^4$; linearizing about the sink temperature gives the $hP$ term.)`,
        };
      },
    }),
    num({
      id: 'cp-abel', difficulty: 3,
      gen(r) {
        const x = r.pick([1.2, 1.4, 1.6]), s = r.pick([1.5, 1.7, 1.9]);
        const lo = Math.min(x, s), hi = Math.max(x, s), ans = 2 * (1 - 1 / lo) * (1 / hi - 0.5);
        return {
          prompt: t`For $Lu = -(x^2u')'$ on $[1, 2]$ with $u(1) = u(2) = 0$: the solutions of $Lu = 0$ are $A + B/x$, so $u_1 = 1 - 1/x$ and $u_2 = 1/x - 1/2$. Find $p\,W$ and then $G(${x}, ${s})$.`,
          visual: gpic({ x: [1, 2], y: [-0.01, 0.13], yticks: 0, xlabel: 'x', curves: [{ fn: `2*(step(${s} - x)*(1 - 1/x)*(1/${s} - 0.5) + step(x - ${s})*(1 - 1/${s})*(1/x - 0.5))`, color: 'accent', width: 2.3 }], vlines: [{ x: s, color: 'gold' }] }, t`$G(x, ${s})$ for $-(x^2u')'$; gold: the source.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: t`$pW = x^2\cdot\big(-\tfrac{1}{2x^2}\big) = -\tfrac12$, so divide by $\tfrac12$ — multiply by 2.` }, { value: 2 * (1 - 1 / hi) * (1 / lo - 0.5), feedback: t`$u_1$ takes $x_< = ${lo}$ and $u_2$ takes $x_> = ${hi}$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$W = (1 - \tfrac1x)(-\tfrac{1}{x^2}) - \tfrac{1}{x^2}(\tfrac1x - \tfrac12) = -\dfrac{1}{2x^2}$.`, t`$pW = -\tfrac12$, so $G = 2\,u_1(x_<)\,u_2(x_>)$.`],
          teach: 'Abel’s theorem makes pW constant; the Green’s function is u₁(x<)u₂(x>) divided by −pW.',
          explain: t`$pW = -\tfrac12$ (constant, as Abel requires), and $G(${x}, ${s}) = 2\big(1 - \tfrac{1}{${lo}}\big)\big(\tfrac{1}{${hi}} - \tfrac12\big) = ${r4(ans)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-decay', difficulty: 2,
      prompt: t`In the eigenfunction expansion $G(x, s) = \sum_n\dfrac{2\sin n\pi x\,\sin n\pi s}{n^2\pi^2}$ of the tent for $-u''$, how fast do the terms fall, and why?`,
      visual: gpic({ x: [0, 1], y: [-0.01, 0.27], xlabel: 'x', curves: [{ fn: 'step(0.4 - x)*0.6*x + step(x - 0.4)*0.4*(1 - x)', color: 'accent', width: 2.3 }, { sum: '2*sin(k*pi*x)*sin(k*pi*0.4)/(k*pi)^2', k: [1, 3], color: 'warn', width: 1.8, dash: [6, 4] }] }, 'The tent G(x, 0.4) and three terms of its eigenfunction sum (dashed).'),
      choices: ['Like 1/n²: G is continuous with a jump in slope at x = s', 'Like 1/n: G jumps at x = s', 'Exponentially: G is smooth', 'They do not fall: the series converges only in the mean'],
      answer: 0,
      why: {
        1: 'G is continuous — only its derivative jumps. A jump in G itself would give 1/n.',
        2: 'The kink at x = s spoils smoothness; exponential decay needs analyticity.',
        3: 'The terms fall like 1/n², so the series converges absolutely and uniformly.',
      },
      hints: ['How do Fourier coefficients fall for a function with a corner? (Lesson E2.1.)'],
      teach: 'The smoothness of G sets the decay of its eigen-coefficients: a kink gives 1/n².',
      explain: t`The $n$-th term is $2\sin n\pi x\sin n\pi s/(n\pi)^2$: $1/\lambda_n \sim 1/n^2$, exactly the decay of a function with a corner. In two and three dimensions $G$ is singular at $x = s$ (logarithm, $1/r$) and the expansion converges only in the mean.`,
    }),
  ],
  sources: [SRC.stakgold, SRC.rhb, SRC.boas],
});
