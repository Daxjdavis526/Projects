// Separation of variables in Cartesian coordinates (Griffiths §3.3.1): the
// semi-infinite slot (Griffiths Ex. 3.3) — product solutions, the boundary
// conditions that choose sines one way and decaying exponentials the other,
// why one term cannot do and an infinite sum must, Fourier's trick, the Gibbs
// overshoot at the corners, and how fast the higher harmonics die (a/nπ);
// the rectangular pipe (cosh, Ex. 3.4) checked against relaxation. Transfer:
// how far behind a wire grid a plasma instrument's field ripple fades. The
// mathematics of Fourier series is st-b.B7.2 and st-b.B8.1.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { sf, relaxPic } from './_bvp.js';

const t = String.raw;
const PI = Math.PI;

/** The slot's potential from the series (V₀ = 1, a = 1): V(x, y) with `terms` odd harmonics. */
const slot = (x, y, terms = 400) => { let v = 0; for (let k = 1; k <= terms; k++) { const n = 2 * k - 1; v += (4 / (n * PI)) * Math.sin(n * PI * y) * Math.exp(-n * PI * x); } return v; };
let gibbs = 0;
for (let y = 1e-4; y < 0.2; y += 1e-4) gibbs = Math.max(gibbs, slot(0, y, 200));
/** Partial sum at the centre line y = a/2, as an expression in N (terms) and s (x/a), for a readout. */
const centreExpr = Array.from({ length: 40 }, (_, j) => { const n = 2 * j + 1; return `step(N - ${j + 0.5})*${+(4 / (n * PI) * Math.sin((n * PI) / 2)).toFixed(12)}*exp(-${n}*pi*s)`; }).join(' + ');
/** The rectangular pipe: walls x = ±b at V₀ = 1, y = 0 and y = a grounded (a = 1); V at the centre. */
const pipeCentre = (b) => { let v = 0; for (let k = 1; k <= 400; k++) { const n = 2 * k - 1; v += ((4 / (n * PI)) * Math.sin((n * PI) / 2)) / Math.cosh(n * PI * b); } return v; };

/** The slot in cross-section: grounded plates at y = 0 and y = a, the end x = 0 at V₀ (graph). */
const slotPic = (caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [-0.4, 3.2], y: [-0.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ fn: '0', domain: [0, 3.2], color: 'ink2', width: 4 }, { fn: '1', domain: [0, 3.2], color: 'ink2', width: 4 }, { param: ['0', 't'], t: [0, 1], color: 'warn', width: 4 }],
    points: [{ x: 1.6, y: 0, r: 0, label: 'V = 0', labelDy: 16, labelDx: -16 }, { x: 1.6, y: 1, r: 0, label: 'V = 0', labelDy: -6, labelDx: -16 }, { x: 0, y: 0.5, r: 0, label: 'V₀(y)', labelDx: -46 }, { x: 3.1, y: 0.5, r: 0, label: '→ ∞, V → 0', labelDx: -66 }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys3600.M4.3',
  title: 'Separation of variables: Cartesian',
  minutes: 18, difficulty: 3,
  equation: t`V(x, y) = \sum_{n=1}^{\infty} C_n\,e^{-n\pi x/a}\sin\frac{n\pi y}{a}, \qquad C_n = \frac2a\int_0^a V_0(y)\sin\frac{n\pi y}{a}\,dy`,
  intro: t`Two grounded metal plates, $y = 0$ and $y = a$, run off to $x = +\infty$; a strip at $x = 0$ between them is held at $V_0(y)$. Try a product, $V = X(x)\,Y(y)$: Laplace’s equation becomes $X''/X + Y''/Y = 0$, a function of $x$ plus a function of $y$ that sum to zero — so each is a constant, $+k^2$ and $-k^2$. The **boundary conditions choose**: $Y$ must vanish at both plates, so $Y = \sin(n\pi y/a)$ with $k = n\pi/a$; $V \to 0$ far away, so $X = e^{-kx}$, not $e^{+kx}$. One such term matches the end only if $V_0(y)$ happens to be a sine, so in general you need **all** of them, and orthogonality of the sines (“Fourier’s trick”) picks out each $C_n$. Uniqueness then says the sum is the answer. The mathematics of Fourier series is in [the PDE course](#/lesson/st-b.B8.1); here the physics is in how fast each term dies.`,
  symbols: [
    { tex: 'a', text: 'the gap between the grounded plates, in m' },
    { tex: 'x', text: t`distance along the slot from the end at $x = 0$, in m` },
    { tex: 'y', text: t`position across the slot, $0 \le y \le a$, in m` },
    { tex: 'n', text: 'the harmonic number, 1, 2, 3, …: the n-th term has n half-waves across the slot' },
    { tex: 'C_n', text: 'the coefficient of the n-th term, in V' },
    { tex: 'V_0(y)', text: t`the potential imposed across the end, in V` },
    { tex: 'e^{-n\\pi x/a}', text: t`the decay along the slot: the $n$-th term falls by $e$ every $a/n\pi$` },
  ],
  why: t`How fast a non-uniform potential is smoothed out with distance — the $e^{-n\pi x/a}$ — sets how far behind a wire grid an ion thruster’s or a plasma probe’s field is uniform, and why fringing fields at a capacitor’s edge reach only about one gap in.`,
  visual: {
    type: 'graph',
    title: 'Building the end from sines',
    lead: t`The potential across the slot (from one plate, $y = 0$, to the other, $y = a$) for an end held at a constant $V_0$, built from $N$ odd harmonics. Slide the cross-section back from the end: the wiggles die first, then the whole profile.`,
    tasks: [
      t`At $x = 0$, raise $N$: the sum hugs $V_0$ more closely, but the overshoot at each plate stays about ${Math.round((gibbs - 1) * 100)}% — the Gibbs phenomenon at the corners, where the boundary value jumps.`,
      t`Move to $x = 0.25a$: with $N = 3$ the curve already looks finished. Higher terms die like $e^{-n\pi x/a}$.`,
      t`At $x = a/2$ a single sine is within 2% of the full answer (compare the readout for $N = 1$ and $N = 20$).`,
    ],
    params: {
      x: [0, 1], y: [-0.05, 1.3], aspect: 'wide', xlabel: 'y / a  (across the slot)', ylabel: 'V / V₀',
      sliders: [
        { key: 'N', label: t`Terms $N$ (odd harmonics $n = 1, 3, \ldots, 2N - 1$)`, min: 1, max: 20, step: 1, value: 3, explain: 'How many terms of the series are added up.' },
        { key: 's', label: t`Distance from the end, $x/a$`, min: 0, max: 1, step: 0.01, value: 0, explain: 'Where along the slot the cross-section is taken.' },
      ],
      curves: [
        { sum: '4/((2k - 1)*pi)*sin((2k - 1)*pi*x)*exp(-(2k - 1)*pi*s)', k: [1, 'N'], color: 'accent', width: 2.6 },
        { fn: '4/pi*sin(pi*x)*exp(-pi*s)', color: 'gold', width: 1.6, dash: [5, 4] },
      ],
      hlines: [{ y: 1, color: 'ink3', label: 'V₀' }],
      legend: [{ label: 'partial sum', color: 'accent' }, { label: 'first term alone', color: 'gold', dash: true }],
      legendAt: 'tr',
      readouts: [{ label: t`$V/V_0$ on the centre line`, expr: centreExpr, digits: 4 }],
    },
    caption: t`Exact partial sums of $\tfrac{4}{\pi}\sum_{n\ \text{odd}}\tfrac1n e^{-n\pi x/a}\sin(n\pi y/a)$. Only odd $n$ appear: the even coefficients of a constant vanish. At the corners themselves the boundary data are contradictory (0 on the plate, $V_0$ on the end); a real gap would have a small insulating break there.`,
  },
  example: {
    prompt: t`The end of a slot $a = 2$ cm wide is held at $V_0 = 100$ V. Find the coefficients $C_n$ and the potential on the centre line one half-width from the end, $(x, y) = (a/2, a/2)$.`,
    visual: relaxPic({ n: 40, aspect: 0.5, walls: { left: 100, right: 0, top: 0, bottom: 0 }, levels: [5, 10, 20, 30, 50, 70], probe: [0.25, 0.25], readout: false }, t`A slot two widths long, its end (left) at 100 V, relaxed on a grid: equipotentials at 5, 10, 20, 30, 50 and 70 V. The far end is grounded here, which barely matters two widths in. The probe marks $(a/2, a/2)$.`),
    steps: [
      { label: 'Fourier’s trick', text: t`Multiply $V_0 = \sum C_n\sin(n\pi y/a)$ by $\sin(m\pi y/a)$ and integrate across: orthogonality kills every term but $n = m$, which gives $C_m\cdot a/2$. So $C_n = \dfrac2a\displaystyle\int_0^aV_0\sin\dfrac{n\pi y}{a}dy = \dfrac{2V_0}{n\pi}(1 - \cos n\pi)$.` },
      { label: 'Coefficients', text: t`$C_n = \dfrac{4V_0}{n\pi}$ for odd $n$, $0$ for even $n$: $C_1 \approx ${nice(sf(400 / PI, 4))}$ V, $C_3 \approx ${nice(sf(400 / (3 * PI), 4))}$ V, $C_5 \approx ${nice(sf(400 / (5 * PI), 4))}$ V, …` },
      { label: 'Sum at the point', text: t`At $(a/2, a/2)$: $V = \sum C_n e^{-n\pi/2}\sin(n\pi/2)$. Term by term: $${nice(sf((400 / PI) * Math.exp(-PI / 2), 4))} - ${nice(sf((400 / (3 * PI)) * Math.exp(-1.5 * PI), 3))} + ${nice(sf((400 / (5 * PI)) * Math.exp(-2.5 * PI), 2))} - \cdots \approx ${nice(sf(100 * slot(0.5, 0.5), 4))}$ V.` },
      { label: 'Sense check', text: t`The first term alone is within ${nice(sf(Math.abs((400 / PI) * Math.exp(-PI / 2) / (100 * slot(0.5, 0.5)) - 1) * 100, 2))}% of the sum: by $x = a/2$ the harmonics have died. And the answer does not depend on $a$ itself, only on $x/a$ and $y/a$: Laplace’s equation has no length scale of its own.` },
    ],
    answer: t`$C_n = 4V_0/n\pi$ for odd $n$ (zero for even); $V(a/2, a/2) \approx ${nice(sf(100 * slot(0.5, 0.5), 3))}$ V.`,
  },
  practice: [
    mcq({
      id: 'which-product', difficulty: 2,
      prompt: t`For the slot (plates $y = 0$ and $y = a$ grounded, $V \to 0$ as $x \to \infty$), which separated solution is allowed?`,
      visual: slotPic('The slot: grounded plates top and bottom, the end held at V₀(y), open to the right.'),
      choices: [t`$e^{-n\pi x/a}\sin(n\pi y/a)$`, t`$e^{+n\pi x/a}\sin(n\pi y/a)$`, t`$\sin(n\pi x/a)\,e^{-n\pi y/a}$`, t`$e^{-n\pi x/a}\cos(n\pi y/a)$`],
      answer: 0,
      why: {
        1: t`This grows without limit as $x \to \infty$; the implicit condition $V \to 0$ far away rules it out.`,
        2: t`The oscillating factor must be the one that vanishes at two places — across the slot, in $y$.`,
        3: t`$\cos(0) = 1$: it does not vanish on the plate $y = 0$.`,
      },
      hints: ['Which direction has two boundaries where V = 0? That direction needs a function with two zeros.', t`Along $x$, the only condition is “$V \to 0$ far away” — easy to forget, but it decides between $e^{+kx}$ and $e^{-kx}$.`],
      teach: 'The boundary conditions choose the functions: oscillation between two zeros, decay toward a condition at infinity.',
      explain: t`$\sin(n\pi y/a)$ vanishes on both plates; $e^{-n\pi x/a}$ dies far away. The condition at infinity is implicit — students often forget it, and Wilcox and Pollock found exactly that among the commonest separation-of-variables slips.`,
    }),
    num({
      id: 'cn-ramp', difficulty: 3,
      gen(r) {
        const V0 = r.pick([50, 100, 200]), n = r.pick([1, 2, 3]);
        const ans = (2 * V0 * (n % 2 ? 1 : -1)) / (n * PI);
        return {
          prompt: t`The end of a slot is held at a linear ramp, $V_0(y) = ${V0}\,y/a$ volts. Use Fourier’s trick to find the coefficient $C_{${n}}$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-0.6, 1.5], aspect: 'wide', xlabel: 'y / a', ylabel: 'V / V₀', curves: [{ fn: 'x', color: 'warn', width: 2.6, label: 'the ramp', labelAt: 0.75, labelDy: -8 }, { fn: `sin(${n}*pi*x)`, color: 'accent', width: 2, dash: [5, 4], label: `sin(${n}πy/a)`, labelAt: n === 1 ? 0.3 : 0.1, labelDy: -8 }] }, caption: t`The ramp and the sine it is projected on. $C_n$ measures how much of this sine the ramp contains.` },
          answer: ans, units: 'V', tol: { rel: 0.01 },
          integrand: `2*${V0}*x*sin(${n}*pi*x)`, limits: [0, 1], vars: { x: [0, 1] },
          errors: [{ value: ans / 2, feedback: t`$C_n = \dfrac{2}{a}\displaystyle\int_0^a$: the factor 2 comes from $\int_0^a\sin^2(n\pi y/a)\,dy = a/2$.` }],
          hints: [t`$C_n = \dfrac2a\displaystyle\int_0^a ${V0}\dfrac ya\sin\dfrac{n\pi y}{a}dy = 2\cdot${V0}\displaystyle\int_0^1 u\sin(n\pi u)\,du$ with $u = y/a$.`, t`Integrate by parts: $\displaystyle\int_0^1 u\sin(n\pi u)\,du = \dfrac{(-1)^{n+1}}{n\pi}$.`],
          teach: t`Fourier’s trick: multiply by the $n$-th sine, integrate across, and orthogonality leaves only $C_n$ times $a/2$.`,
          explain: t`$C_n = \dfrac{2V_0(-1)^{n+1}}{n\pi}$, so $C_{${n}} \approx ${nice(sf(ans, 4))}$ V. Unlike the constant end, every $n$ appears, with alternating signs; they fall only as $1/n$ because the ramp jumps back to 0 at the plate $y = a$.`,
        };
      },
    }),
    num({
      id: 'decay', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 5]), f = r.pick([100, 1000]);
        const x = (a * Math.log(f)) / PI;
        return {
          prompt: t`In a slot ${a} cm wide, how far from the end does the leading ($n = 1$) term of the potential fall to $1/${f}$ of its value at the end?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 1.05], aspect: 'wide', xlabel: 'x / a', ylabel: 'relative size', curves: [{ fn: 'exp(-pi*x)', color: 'accent', width: 2.4, label: 'n = 1', labelAt: 0.35, labelDy: -6 }, { fn: 'exp(-3*pi*x)', color: 'gold', width: 2, label: 'n = 3', labelAt: 0.12, labelDx: 8 }, { fn: 'exp(-5*pi*x)', color: 'violet', width: 2, label: 'n = 5', labelAt: 0.05, labelDx: 10, labelDy: 30 }] }, caption: t`The decay factors $e^{-n\pi x/a}$ of the first three odd harmonics.` },
          answer: x, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: a / PI, feedback: t`$a/\pi$ is the distance to fall by a factor $e$. To fall by ${f}, go $\ln ${f}$ of those.` }, { value: (a * Math.log10(f)) / PI, feedback: t`Use the natural logarithm: $e^{-\pi x/a} = 1/${f}$ gives $\pi x/a = \ln ${f}$.` }],
          hints: [t`The $n = 1$ term carries $e^{-\pi x/a}$.`, t`$x = \dfrac{a}{\pi}\ln ${f}$.`],
          teach: 'The n-th harmonic dies with decay length a/nπ: about a third of the gap for the first, faster for the rest.',
          explain: t`$x = \dfrac{a}{\pi}\ln ${f} = \dfrac{${a}}{\pi}\times${nice(sf(Math.log(f), 4))} \approx ${nice(sf(x, 3))}$ cm — about ${nice(sf(Math.log(f) / PI, 2))} slot widths. The $n = 3$ term gets there three times sooner.`,
        };
      },
    }),
    mcq({
      id: 'why-sum', difficulty: 2,
      prompt: t`Why can a single term $C\,e^{-\pi x/a}\sin(\pi y/a)$ not solve the slot problem when the end is held at a constant $V_0$?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.05, 1.35], aspect: 'wide', xlabel: 'y / a', ylabel: 'V / V₀', curves: [{ fn: '1', color: 'warn', width: 2.6, label: 'required: V₀', labelAt: 0.4, labelDy: -8 }, { fn: '4/pi*sin(pi*x)', color: 'accent', width: 2, dash: [5, 4], label: 'best single sine', labelAt: 0.12, labelDy: 14 }] }, caption: 'The boundary value across the end (orange) and the best single sine.' },
      choices: [
        'At x = 0 it gives a sine across the end, not a constant: it fails the boundary condition there',
        'It does not satisfy Laplace’s equation',
        'It does not vanish on the plates',
        'It grows as x increases',
      ],
      answer: 0,
      why: {
        1: 'Every separated term satisfies Laplace’s equation; that is how it was built.',
        2: 'The sine vanishes at y = 0 and y = a by construction.',
        3: 'It decays; the growing exponential was already thrown out.',
      },
      hints: ['Check each condition in turn: Laplace’s equation, the plates, far away, the end.'],
      teach: 'Each separated term meets every condition but one; the infinite sum is what meets the last one.',
      explain: t`Each term solves Laplace’s equation and three of the four boundary conditions; the fourth — the shape across the end — needs a sum. Since Laplace’s equation is linear, any sum of solutions is a solution, and uniqueness says the right sum is **the** answer. Forgetting that an infinite sum is required is one of the documented separation-of-variables difficulties.`,
    }),
    num({
      id: 'pipe', difficulty: 3,
      gen(r) {
        const [bf, aspect] = r.pick([[0.5, 1], [1, 0.5]]), V0 = r.pick([50, 100]);
        const ans = V0 * pipeCentre(bf);
        return {
          prompt: t`A long rectangular metal pipe has its top and bottom walls ($y = 0$ and $y = a$) grounded and its side walls ($x = \pm b$, insulated from them) held at ${V0} V, with $b = ${bf === 1 ? 'a' : 'a/2'}$. Separation gives $V = \sum_{n\ \text{odd}}\dfrac{4V_0}{n\pi}\dfrac{\cosh(n\pi x/a)}{\cosh(n\pi b/a)}\sin\dfrac{n\pi y}{a}$. Find $V$ at the centre of the pipe.`,
          visual: relaxPic({ n: 40, aspect, walls: { left: V0, right: V0, top: 0, bottom: 0 }, levels: 8, probe: [0.5, aspect / 2] }, t`The pipe’s cross-section relaxed on a grid (the probe marks the centre). Width $2b$, height $a$.`),
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: V0 * (4 / PI) / Math.cosh((PI * bf)), feedback: 'That is the first term alone. Here the walls are close, and the n = 3 term still matters: add a few more.' }].filter((e) => Math.abs(e.value / ans - 1) > 0.012),
          hints: [t`At the centre, $x = 0$ (so $\cosh = 1$) and $\sin(n\pi/2) = +1, -1, +1, \ldots$ for $n = 1, 3, 5, \ldots$`, t`$V = \dfrac{4V_0}{\pi}\left[\dfrac{1}{\cosh(\pi b/a)} - \dfrac{1}{3\cosh(3\pi b/a)} + \dfrac{1}{5\cosh(5\pi b/a)} - \cdots\right]$, with $b/a = ${bf}$.`],
          teach: 'In a finite region both exponentials survive; symmetry about x = 0 combines them into cosh.',
          explain: t`$V(0, a/2) = \dfrac{4V_0}{\pi}\sum_{n\ \text{odd}}\dfrac{\sin(n\pi/2)}{n\cosh(n\pi b/a)} \approx ${nice(sf(ans, 3))}$ V. Here neither exponential blows up, so both survive, and symmetry in $x$ makes them a cosh. The relaxed grid in the picture gives the same value to within its discretization error.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-grid', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([0.5, 1, 2]), f = r.pick([100, 1000]);
        const z = (p * Math.log(f)) / (2 * PI);
        return {
          prompt: t`Plasma instruments on spacecraft (retarding-potential analyzers, Faraday cups) and ion thrusters use wire grids to set potentials. Close behind a grid of parallel wires with spacing ${p} mm, the potential has a ripple $\propto\cos(2\pi y/p)$ on top of its average. Solving Laplace’s equation for this ripple as for the slot, how far behind the grid has the ripple fallen to $1/${f}$ of its size at the grid?`,
          visual: { type: 'graph', params: { x: [-1.5, 1.5], y: [-0.1, 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [0.12, 0.3, 0.55, 0.9, 1.3].map((z) => ({ fn: `${z} + 0.1*cos(2*pi*x)*exp(-2*pi*${z})`, domain: [-1.5, 1.5], color: 'violet', width: 1.6 })), points: [-1, 0, 1].map((x) => ({ x, y: 0, r: 5, color: 'ink2' })).concat([{ x: 1.45, y: 1.3, r: 0, label: 'flat far behind', labelDx: -96, labelDy: -10 }, { x: 0.5, y: 0, r: 0, label: 'wires, spacing p', labelDx: -46, labelDy: 14 }]) }, caption: t`Wires of the grid (dots), seen end-on, with equipotentials behind it (violet): their ripple fades with distance $z$ as $e^{-2\pi z/p}$. Ripple size exaggerated; real grids also have the finite wire thickness to worry about.` },
          answer: z, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (p * Math.log(f)) / PI, feedback: t`The ripple has wavelength $p$, so $k = 2\pi/p$: the decay is $e^{-2\pi z/p}$. (A slot of width $a$ has half a wave across it: $k = \pi/a$.)` }],
          hints: [t`A ripple $\cos(ky)$ with $k = 2\pi/p$ pairs with $e^{-kz}$ in Laplace’s equation.`, t`$e^{-2\pi z/p} = 1/${f}$ gives $z = \dfrac{p}{2\pi}\ln ${f}$.`],
          teach: t`A potential pattern of wavelength $\lambda$ dies behind its source as $e^{-2\pi z/\lambda}$: fine detail fades within about one wavelength.`,
          explain: t`$z = \dfrac{p}{2\pi}\ln ${f} \approx ${nice(sf(z, 3))}$ mm — about one grid spacing. That is why analyzers keep sensitive surfaces a few wire spacings behind a grid, and why a fine mesh is a good equipotential.`,
        };
      },
    }),
    num({
      id: 'cp-half', difficulty: 3,
      gen(r) {
        const V0 = r.pick([60, 100, 120]), n = r.pick([1, 2, 3]);
        const ans = ((2 * V0) / (n * PI)) * (1 - Math.cos((n * PI) / 2));
        return {
          prompt: t`The end of a slot is held at $V_0 = ${V0}$ V on its lower half ($0 < y < a/2$) and at 0 V on its upper half. Find $C_{${n}}$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-0.2, 1.4], aspect: 'wide', xlabel: 'y / a', ylabel: 'V / V₀', curves: [{ fn: '1', domain: [0, 0.5], color: 'warn', width: 2.6 }, { fn: '0', domain: [0.5, 1], color: 'warn', width: 2.6 }, { fn: `sin(${n}*pi*x)`, color: 'accent', width: 2, dash: [5, 4] }] }, caption: t`The end’s potential (orange) and the sine $\sin(${n}\pi y/a)$ (dashed).` },
          answer: ans, units: 'V', tol: { rel: 0.01 },
          integrand: `2*${V0}*sin(${n}*pi*x)`, limits: [0, 0.5], vars: { x: [0, 1] },
          errors: [{ value: ((2 * V0) / (n * PI)) * (1 - Math.cos(n * PI)), feedback: 'That integrates over the whole width. The upper half is at 0 V and contributes nothing.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`$C_n = \dfrac2a\displaystyle\int_0^{a/2}V_0\sin\dfrac{n\pi y}{a}dy$.`, t`$= \dfrac{2V_0}{n\pi}\left(1 - \cos\dfrac{n\pi}{2}\right)$.`],
          teach: 'Fourier’s trick works for any boundary profile: integrate it against each sine.',
          explain: t`$C_n = \dfrac{2V_0}{n\pi}\left(1 - \cos\dfrac{n\pi}{2}\right)$, so $C_{${n}} \approx ${nice(sf(ans, 4))}$ V.`,
        };
      },
    }),
    mcq({
      id: 'cp-implicit', difficulty: 2,
      prompt: t`For the slot, which condition is **not** written on the picture but still removes half of the solutions?`,
      visual: slotPic('The slot, with its explicit boundary conditions.'),
      choices: [t`$V \to 0$ as $x \to \infty$`, t`$V = 0$ at $y = 0$`, t`$V = V_0(y)$ at $x = 0$`, t`$\nabla^2V = 0$`],
      answer: 0,
      why: { 1: 'That one is drawn on the picture: the bottom plate.', 2: 'That one is drawn too: it fixes the coefficients, not which functions are allowed.', 3: 'That is the equation itself, not a boundary condition.' },
      hints: ['Which way does the slot extend without end?'],
      teach: 'Implicit boundary conditions — finite at the origin, zero at infinity — are as binding as the drawn ones.',
      explain: t`$V \to 0$ far down the slot discards $e^{+n\pi x/a}$. In spherical problems the same role is played by “finite at the centre” and “zero at infinity” ([M4.4](#/lesson/phys3600.M4.4)).`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §3.3.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Wilcox & Pollock, Upper-division student difficulties with separation of variables (PRST-PER 11, 020131, 2015)', url: 'https://journals.aps.org/prper/pdf/10.1103/PhysRevSTPER.11.020131' },
  ],
});
