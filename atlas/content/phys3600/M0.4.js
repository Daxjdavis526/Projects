// The Dirac delta function (Griffiths §1.5): the missing divergence of r̂/r²,
// δ defined by the sifting property and pictured as a limit of narrowing
// spikes of unit area, δ(kx) = δ(x)/|k| and δ(g(x)), units of δ, the 3D
// delta and charge densities of points, shells and rings written with δ (the
// PER-documented trouble spots, Wilcox & Pollock 2015), and ∇·(r̂/r²) =
// 4πδ³(r) used under an integral. math2210.C3-5.9 previews the shrinking-ball
// picture; this lesson goes on from there.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { is, scene3, sf, sphereSurface, boxSurface, dot } from './_toolkit.js';

const t = String.raw;
const PI = Math.PI;

const GAUSS = 'e^(-(x - a)^2/(2*eps^2))/(eps*sqrt(2*pi))';
const BOX = 'step(eps - abs(x - a))/(2*eps)';
const DELTA = `${is('k', 0)}*(${GAUSS}) + ${is('k', 1)}*(${BOX})`;
const FS = ['1 + 0.5*sin(1.5*x)', '0.25*x^2 + 0.5', 'e^(-x/2)'];
const F = FS.map((f, j) => `${is('m', j)}*(${f})`).join(' + ');
const FA = F.replace(/x/g, 'a');
// ∫ f δ_ε dx in closed form, for each family (k) and test function (m)
const SIFT = [
  `${is('k', 0)}*(${is('m', 0)}*(1 + 0.5*e^(-(1.5*eps)^2/2)*sin(1.5*a)) + ${is('m', 1)}*(0.25*(a^2 + eps^2) + 0.5) + ${is('m', 2)}*(e^(-a/2)*e^(eps^2/8)))`,
  `${is('k', 1)}*(${is('m', 0)}*(1 + 0.5*sin(1.5*a)*sin(1.5*eps)/(1.5*eps)) + ${is('m', 1)}*(0.25*(a^2 + eps^2/3) + 0.5) + ${is('m', 2)}*(e^(-a/2)*sinh(eps/2)/(eps/2)))`,
].join(' + ');

/** A 1D picture: a test function, the integration interval, and the spike of δ at x0 as an upward arrow. */
const spikePic = (f, x0, { x = [-4, 4], y = [-1, 6], from, to, label = 'δ', caption, extra = {} } = {}) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide',
    curves: [{ fn: f, color: 'gold', label: 'f(x)', labelAt: x[0] + 0.12 * (x[1] - x[0]), labelDy: -12 }],
    arrows: [{ from: [x0, 0], to: [x0, y[1] * 0.85], color: 'accent', width: 3, label, labelDx: 6, labelDy: 4 }],
    ...(from !== undefined ? { shade: [{ fn: '0.12', lower: '-0.12', from, to, color: 'teal', alpha: 0.35 }], vlines: [{ x: from, color: 'teal' }, { x: to, color: 'teal' }] } : {}),
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys3600.M0.4',
  title: 'The Dirac delta function',
  minutes: 16, difficulty: 3,
  equation: t`\nabla\cdot\left(\frac{\hat r}{r^2}\right) = 4\pi\,\delta^3(\vec r)`,
  intro: t`The field $\hat r/r^2$ — Coulomb’s field — has zero divergence everywhere except the origin, yet its flux through every sphere round the origin is $4\pi$. The divergence theorem says that $4\pi$ must come from somewhere inside: **all of it from the single point $r = 0$**. No ordinary function is zero everywhere but one point and still integrates to $4\pi$. The **Dirac delta** is the object made for this job. It is defined by what it does inside an integral:

$$\int_{-\infty}^{\infty} f(x)\,\delta(x - a)\,dx = f(a)$$

Picture it as the limit of ever taller, narrower spikes that keep **area 1**. In three dimensions $\delta^3(\vec r) = \delta(x)\,\delta(y)\,\delta(z)$, and the equation above is the precise statement of where the divergence of Coulomb’s field lives.`,
  symbols: [
    { tex: '\\delta(x - a)', text: t`the one-dimensional delta: zero for $x \ne a$, with $\int\delta(x - a)\,dx = 1$ over any interval containing $a$. It has units of **1/[x]**: $\text{m}^{-1}$ when $x$ is a length` },
    { tex: 'f(x)', text: 'any smooth “test” function; the delta picks out its value at one point (the sifting property)' },
    { tex: '\\delta^3(\\vec r)', text: t`the three-dimensional delta $\delta(x)\delta(y)\delta(z)$: $\int\delta^3(\vec r)\,d\tau = 1$ over any volume containing the origin; units $\text{m}^{-3}$` },
    { tex: '\\hat r/r^2', text: t`the inverse-square field of a unit point source at the origin` },
    { tex: '4\\pi', text: t`the flux of $\hat r/r^2$ through any closed surface round the origin: $\tfrac{1}{R^2}\cdot4\pi R^2$` },
  ],
  why: t`With $\vec E = \tfrac{q}{4\pi\varepsilon_0}\tfrac{\hat r}{r^2}$, this identity is Gauss’s law for a point charge, $\nabla\cdot\vec E = \tfrac{q}{\varepsilon_0}\delta^3(\vec r)$, and it lets one formula, $\rho(\vec r)$, describe points, lines, shells and smooth clouds alike.`,
  visual: {
    type: 'graph',
    title: 'Narrow the spike, keep the area',
    lead: t`The blue curve $\delta_\varepsilon(x - a)$ is a spike of width about $\varepsilon$ and area 1; the gold curve is a test function $f$, and the violet area is $f\,\delta_\varepsilon$. The readouts compare $\int f\,\delta_\varepsilon\,dx$ with $f(a)$.`,
    tasks: [
      t`Shrink $\varepsilon$: the spike’s height grows as $1/\varepsilon$ (it soon runs off the top) while its area stays $1.000$.`,
      t`As $\varepsilon \to 0$, $\int f\,\delta_\varepsilon\,dx$ closes in on $f(a)$, for the Gaussian and the box alike: the shape of the spike does not matter, only its area.`,
      t`Slide $a$: the spike samples $f$ wherever it sits. That is the sifting property, $\int f(x)\,\delta(x - a)\,dx = f(a)$.`,
    ],
    params: {
      x: [-3, 3], y: [-0.4, 5], aspect: 'wide', xlabel: 'x', ylabel: '',
      sliders: [
        { key: 'eps', label: t`Width $\varepsilon$`, min: 0.03, max: 1, step: 0.01, value: 0.5, explain: 'How wide the spike is. The delta function is the limit as this goes to zero.' },
        { key: 'a', label: t`Centre $a$`, min: -2, max: 2, step: 0.1, value: 0.8, explain: 'Where the spike sits: the point whose value of f it picks out.' },
      ],
      choices: [
        { key: 'k', label: 'Spike', options: [[0, 'Gaussian'], [1, 'Box']], value: 0, explain: t`Two sequences that both tend to $\delta$: a normal curve of standard deviation $\varepsilon$, and a rectangle of width $2\varepsilon$ and height $1/2\varepsilon$.` },
        { key: 'm', label: t`Test function $f$`, options: [[0, t`$1 + \tfrac12\sin 1.5x$`], [1, t`$\tfrac14x^2 + \tfrac12$`], [2, t`$e^{-x/2}$`]], value: 0, explain: 'Any smooth function will do.' },
      ],
      curves: [{ fn: DELTA, color: 'accent', width: 2.4 }, { fn: F, color: 'gold', width: 2 }],
      shade: [{ fn: `(${F})*(${DELTA})`, from: 'a - 6*eps', to: 'a + 6*eps', color: 'violet', alpha: 0.35 }],
      points: [{ x: 'a', y: FA, color: 'gold', r: 5 }],
      integral: { fn: DELTA, from: 'a - 8*eps', to: 'a + 8*eps' },
      readouts: [
        { label: t`area of $\delta_\varepsilon$`, expr: 'integral', digits: 4 },
        { label: t`peak height`, expr: `${is('k', 0)}/(eps*sqrt(2*pi)) + ${is('k', 1)}/(2*eps)`, digits: 3 },
        { label: t`$\int f\,\delta_\varepsilon\,dx$`, expr: SIFT, digits: 4 },
        { label: t`$f(a)$`, expr: FA, digits: 4 },
      ],
    },
    caption: t`The spike’s area is integrated numerically; $\int f\,\delta_\varepsilon\,dx$ is computed in closed form for each spike and test function. For small $\varepsilon$ the peak runs off the top of the frame. A real delta is the limit, not any one spike.`,
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_{\mathcal V}\left(r^2 + 2\,\vec r\cdot\vec c\right)\delta^3(\vec r - \vec b)\,d\tau$ with $\vec b = (1, 2, 2)$ m and $\vec c = (1, 1, 1)$ m, where $\mathcal V$ is (i) the ball of radius 4 m centred on the origin, (ii) the ball of radius 2 m.`,
    visual: scene3({ range: 4.3, spheres: [{ centre: [0, 0, 0], radius: 4, color: 'teal' }, { centre: [0, 0, 0], radius: 2, color: 'violet' }], points: [{ at: [1, 2, 2], color: 'gold', label: '\\vec b' }], vectors: [{ to: [1, 2, 2], color: 'gold' }] }, t`The point $\vec b$, at distance 3 m from the origin: inside the 4 m ball (teal), outside the 2 m ball (violet). Drag to rotate.`),
    steps: [
      { label: 'Where is the spike', text: t`$\delta^3(\vec r - \vec b)$ is zero except at $\vec r = \vec b$, and $|\vec b| = \sqrt{1 + 4 + 4} = 3$ m.` },
      { label: 'Sift (i)', text: t`$\vec b$ lies inside the 4 m ball, so the integral is the integrand at $\vec b$: $b^2 + 2\,\vec b\cdot\vec c = 9 + 2(1 + 2 + 2) = 19\ \text{m}^2$.` },
      { label: 'Sift (ii)', text: t`$\vec b$ lies outside the 2 m ball: the spike never enters the region, and the integral is $0$.` },
      { label: 'Units', text: t`$\delta^3$ has units $\text{m}^{-3}$ and $d\tau$ has $\text{m}^3$: they cancel, leaving the integrand’s units, $\text{m}^2$ ✓.` },
    ],
    answer: t`(i) $19\ \text{m}^2$; (ii) $0$, because $\vec b$ is outside the region.`,
  },
  practice: [
    num({
      id: 'sift', difficulty: 1,
      gen(r) {
        const c = r.pick([1, 2, 3]), d = r.pick([2, 3, 5]), a = r.pick([-2, -1, 1, 2]);
        const f = (x) => x ** 3 - c * x + d, ans = f(a);
        const ff = `x^3 - ${c}*x + ${d}`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-3}^{3}\left(x^3 - ${c === 1 ? '' : c}x + ${d}\right)\delta(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})\,dx$.`,
          visual: spikePic(ff, a, { x: [-3.5, 3.5], y: [-12, 14], from: -3, to: 3, caption: t`The integrand’s smooth factor (gold), the interval $[-3, 3]$ (teal) and the delta’s spike at $x = ${a}$ (blue arrow).` }),
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: [
            ...(f(-a) !== ans ? [{ value: f(-a), feedback: t`$\delta(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})$ spikes where its argument is zero: at $x = ${a}$, not $x = ${-a}$.` }] : []),
            ...(d !== ans ? [{ value: d, feedback: t`That is $f(0)$. The delta here is shifted: it picks out $f$ where $x ${a < 0 ? '+' : '-'} ${Math.abs(a)} = 0$.` }] : []),
          ],
          hints: [t`$\delta(x - a)$ is zero except where $x = a$. Where is that here, and is it inside $[-3, 3]$?`, t`The integral is the smooth factor evaluated at $x = ${a}$.`],
          teach: t`Sifting: $\int f(x)\,\delta(x - a)\,dx = f(a)$ when $a$ lies inside the range of integration.`,
          explain: t`The spike sits at $x = ${a}$, inside $[-3, 3]$, so the integral is $(${a})^3 - ${c}(${a}) + ${d} = ${ans}$.`,
        };
      },
    }),
    mcq({
      id: 'error-outside', difficulty: 2, kind: 'error',
      prompt: t`A student writes: $\displaystyle\int_{-1}^{2} x^3\,\delta(x + 3)\,dx = (-3)^3 = -27$. What is wrong?`,
      visual: spikePic('x^3/6', -3, { x: [-4.2, 3.2], y: [-5, 5], from: -1, to: 2, caption: t`The interval $[-1, 2]$ (teal), the factor $x^3$ (gold, drawn at 1/6 scale) and the delta’s spike at $x = -3$ (blue).` }),
      choices: [t`The spike at $x = -3$ lies outside $[-1, 2]$, so the integral is $0$`, t`It should be $+27$: $\delta(x + 3)$ picks out $x = +3$`, 'Nothing: the delta always picks out the value where its argument vanishes', t`It should be $-27$ times the interval length, 3`],
      answer: 0,
      why: {
        1: t`The argument $x + 3$ vanishes at $x = -3$, so that part was right. The trouble is where the spike sits relative to the limits.`,
        2: 'Only if that point lies within the limits. Between −1 and 2 the delta is zero everywhere, so the integrand is zero everywhere.',
        3: 'The delta has no width to multiply by; sifting gives one value, or zero.',
      },
      hints: ['Where does the delta spike? Mark it on the x-axis together with the limits.'],
      teach: 'A delta whose spike lies outside the region of integration contributes nothing.',
      explain: t`$\delta(x + 3)$ is zero on all of $[-1, 2]$, so the integral is $0$. Wilcox and Pollock found this check — is the spike inside the region? — is the step students most often skip, and in three dimensions it decides whether a point charge is enclosed.`,
    }),
    num({
      id: 'scale', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, -2, -3, 4]), x0 = r.pick([1, 2, -1, 1.5, -2]), c = k * x0;
        const f = (x) => x * x + 1, ans = f(x0) / Math.abs(k);
        const arg = `${k}x ${c < 0 ? '+' : '-'} ${Math.abs(c)}`;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\left(x^2 + 1\right)\delta(${arg})\,dx$.`,
          visual: spikePic('x^2 + 1', x0, { x: [-4, 4], y: [-1, 8], label: `spike at x = ${nice(x0)}`, caption: t`The factor $x^2 + 1$ (gold) and the spike of $\delta(${arg})$ at $x = ${nice(x0)}$ (blue). The arrow marks where, not how strong.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: f(x0), feedback: t`You sifted at the right point but forgot the scale factor: $\delta(kx - c) = \tfrac{1}{|k|}\delta(x - c/k)$.` },
            ...(k < 0 ? [{ value: f(x0) / k, feedback: t`The factor is $1/|k|$, not $1/k$: a delta is never negative. Substitute $u = kx$ and the limits swap, which flips the sign back.` }] : []),
            ...(f(c) / Math.abs(k) !== ans ? [{ value: f(c) / Math.abs(k), feedback: t`The spike is where $${arg} = 0$, at $x = ${nice(x0)}$, not at $x = ${c}$.` }] : []),
          ],
          hints: [t`Substitute $u = ${k}x$: then $dx = du/${k}$. Or use $\delta(kx - c) = \tfrac{1}{|k|}\,\delta(x - c/k)$.`, t`The spike is at $x = ${nice(x0)}$; evaluate $x^2 + 1$ there and divide by $|${k}|$.`],
          teach: t`$\delta(kx) = \delta(x)/|k|$: squeezing the argument makes the spike narrower, so its area shrinks by $|k|$.`,
          explain: t`$\delta(${arg}) = \tfrac{1}{${Math.abs(k)}}\delta(x ${x0 < 0 ? '+' : '-'} ${nice(Math.abs(x0))})$, so the integral is $\tfrac{(${nice(x0)})^2 + 1}{${Math.abs(k)}} = ${nice(sf(ans, 4))}$. This is why $\delta$ carries units: $\delta(x)$ with $x$ in metres is in $\text{m}^{-1}$, so that $\int\delta(x)\,dx = 1$.`,
        };
      },
    }),
    num({
      id: 'two-roots', difficulty: 3,
      gen(r) {
        const b = r.pick([1, 2, 3, 1.5]);
        const f = (x) => x ** 3 + x * x + 2, ans = (f(b) + f(-b)) / (2 * b);
        return {
          prompt: t`Evaluate $\displaystyle\int_{-\infty}^{\infty}\left(x^3 + x^2 + 2\right)\delta\!\left(x^2 - ${nice(b * b)}\right)dx$.`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-(b * b) - 1, 17 - b * b], aspect: 'wide', curves: [{ fn: `x^2 - ${b * b}`, color: 'accent', label: 'g(x) = x² − b²', labelAt: -3.6, labelDx: 12 }], points: [{ x: -b, y: 0, color: 'gold', r: 5, label: '−b', labelDy: 16 }, { x: b, y: 0, color: 'gold', r: 5, label: 'b', labelDy: 16 }] }, caption: t`The argument $g(x) = x^2 - ${nice(b * b)}$ of the delta: it crosses zero twice, at $x = \pm${nice(b)}$, with slope $\pm${nice(2 * b)}$ there.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: f(b) / (2 * b), feedback: t`$g(x) = x^2 - ${nice(b * b)}$ vanishes at **two** points, $\pm${nice(b)}$: each gives a spike, and both count.` },
            { value: f(b) + f(-b), feedback: t`Each spike is weighted by $1/|g'(x_i)|$ — here $1/${nice(2 * b)}$ — just as $\delta(kx) = \delta(x)/|k|$.` },
          ],
          hints: [t`$\delta(g(x)) = \sum_i \dfrac{\delta(x - x_i)}{|g'(x_i)|}$, summed over the zeros $x_i$ of $g$.`, t`Zeros at $\pm${nice(b)}$ with $|g'| = ${nice(2 * b)}$ at both. Evaluate $f(${nice(b)}) + f(-${nice(b)})$ and divide by $${nice(2 * b)}$.`],
          teach: t`$\delta(g(x))$ is a spike at every zero of $g$, each weighted by $1/|g'|$ there.`,
          explain: t`$\tfrac{f(${nice(b)}) + f(-${nice(b)})}{${nice(2 * b)}} = \tfrac{${nice(f(b))} ${f(-b) < 0 ? '-' : '+'} ${nice(Math.abs(f(-b)))}}{${nice(2 * b)}} = ${nice(sf(ans, 4))}$. The odd part, $x^3$, cancels between the two spikes. The same rule turns $\delta(r - R)$ in a shell into the right weights in other coordinates.`,
        };
      },
    }),
    mcq({
      id: 'shell-density', difficulty: 2,
      prompt: t`A thin spherical shell of radius $R$ carries total charge $Q$ spread uniformly. Which volume charge density $\rho(\vec r)$ describes it?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-0.3, 3], aspect: 'wide', xlabel: 'distance from the centre r', ylabel: 'ρ', yticks: 0, arrows: [{ from: [1.8, 0], to: [1.8, 2.6], color: 'accent', width: 3, label: 'all the charge at r = R', labelDx: 8, labelDy: 4 }], vlines: [{ x: 1.8, label: 'R', color: 'ink3' }] }, caption: t`The density is zero everywhere except on the sphere $r = R$: a spike in $r$.` },
      choices: [t`$\dfrac{Q}{4\pi R^2}\,\delta(r - R)$`, t`$Q\,\delta(r - R)$`, t`$\dfrac{3Q}{4\pi R^3}\,\delta(r - R)$`, t`$\dfrac{Q}{4\pi R^2}\,\delta^3(\vec r - R\hat r)$`],
      answer: 0,
      why: {
        1: t`Units: $Q\,\delta(r - R)$ is in C/m, not C/m³, and $\int Q\,\delta(r - R)\,4\pi r^2\,dr = 4\pi R^2Q$, far too much.`,
        2: t`That spreads the charge through the ball’s volume, then squeezes it to the surface — the units come out C/m⁴, and the total is $3Q/R$.`,
        3: t`$\delta^3$ already has units m⁻³, so this is C/m⁵; and $\vec r - R\hat r = 0$ on a whole sphere, not at a point, which $\delta^3$ cannot describe.`,
      },
      hints: [t`Check units: $\delta(r - R)$ is in m⁻¹, and $\rho$ must be in C/m³.`, t`Check the total: $\int\rho\,d\tau = \int_0^\infty\rho\,4\pi r^2\,dr$ must equal $Q$.`],
      teach: t`A surface charge $\sigma$ on the sphere $r = R$ is the volume density $\rho = \sigma\,\delta(r - R)$, with $\sigma = Q/4\pi R^2$.`,
      explain: t`$\int\tfrac{Q}{4\pi R^2}\delta(r - R)\,4\pi r^2\,dr = \tfrac{Q}{4\pi R^2}\cdot4\pi R^2 = Q$ ✓, and the units are C/m² × m⁻¹ = C/m³ ✓. Writing densities with deltas is how one formula, $\vec E = \tfrac{1}{4\pi\varepsilon_0}\int\tfrac{\rho\,\hat{\mathcal R}}{\mathcal R^2}d\tau'$, covers points, lines and shells.`,
    }),
    num({
      id: 'ring-charge', difficulty: 2,
      gen(r) {
        const lam = r.pick([5, 8, 12, 20]), acm = r.pick([4, 6, 10, 15]);
        const a = acm / 100, ans = 2 * PI * a * lam;
        return {
          prompt: t`A charged ring is written in cylindrical coordinates as $\rho(\vec r) = \lambda_0\,\delta(s - a)\,\delta(z)$, with $\lambda_0 = ${lam}$ nC/m and $a = ${acm}$ cm. Find its total charge, $\int\rho\,d\tau$.`,
          visual: scene3({ range: 1.6, curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [0, 2 * PI], color: 'gold' }], vectors: [{ from: [0, 0, 0], to: [Math.cos(0.6), Math.sin(0.6), 0], color: 'ink3', label: 'a' }] }, t`The ring of radius $a$ in the plane $z = 0$, centred on the $z$-axis. Drag to rotate.`),
          answer: ans, units: 'nC', tol: { rel: 0.005 },
          errors: [
            { value: 2 * PI * lam, feedback: t`You dropped the $s$ in $d\tau = s\,ds\,d\phi\,dz$. With it, the $\delta(s - a)$ leaves a factor $a$.` },
            { value: lam * a, feedback: t`The $\phi$ integral runs round the whole ring: $\int_0^{2\pi}d\phi = 2\pi$.` },
          ],
          hints: [t`In cylindrical coordinates $d\tau = s\,ds\,d\phi\,dz$.`, t`$\int\delta(z)\,dz = 1$, $\int s\,\delta(s - a)\,ds = a$, $\int_0^{2\pi}d\phi = 2\pi$.`],
          teach: t`Integrate a delta-written density with the full volume element: the scale factors survive the sifting.`,
          explain: t`$Q = \lambda_0\int_0^{2\pi}\!d\phi\int s\,\delta(s - a)\,ds\int\delta(z)\,dz = 2\pi a\lambda_0 = 2\pi(${a})(${lam}) \approx ${nice(sf(ans, 3))}$ nC — the circumference times the line density, as it must be. Units: $\delta(s - a)\delta(z)$ is in m⁻², so $\rho$ is in C/m³ ✓.`,
        };
      },
    }),
    num({
      id: 'div-under-integral', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 3, 5]), R = r.pick([1, 2, 3]);
        const ans = 4 * PI * c;
        return {
          prompt: t`Evaluate $\displaystyle\int_{\mathcal V}\left(r^2 + ${c}\right)\nabla\cdot\left(\frac{\hat r}{r^2}\right)d\tau$, where $\mathcal V$ is the ball of radius $R = ${R}$ centred on the origin.`,
          visual: { type: 'c3-flux', params: { F: ['x/(x^2 + y^2 + z^2)^1.5', 'y/(x^2 + y^2 + z^2)^1.5', 'z/(x^2 + y^2 + z^2)^1.5'], surfaces: [sphereSurface(1)], integrand: 'flux', readouts: [], flipToggle: false, normals: false, range: 1.5, arrowLen: 0.3 }, caption: t`The field $\hat r/r^2$ leaving the ball’s surface (drawn at radius 1). Its divergence is zero everywhere inside except at the centre. Drag to rotate.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: 0, feedback: t`$\nabla\cdot(\hat r/r^2)$ is zero everywhere **except** the origin, where it is $4\pi\delta^3(\vec r)$, and the origin is inside the ball.` },
            { value: 4 * PI * (R * R + c), feedback: t`That evaluates $r^2 + ${c}$ on the surface. The delta sits at the centre, where $r^2 = 0$. (Integrating by parts instead, the volume term $-4\pi R^2$ cancels the surface’s $R^2$ part.)` },
          ],
          hints: [t`Replace $\nabla\cdot(\hat r/r^2)$ by $4\pi\delta^3(\vec r)$.`, t`The integral sifts out $4\pi$ times $(r^2 + ${c})$ at $r = 0$.`],
          teach: t`$\nabla\cdot(\hat r/r^2) = 4\pi\delta^3(\vec r)$: under an integral it picks out $4\pi$ times the rest of the integrand at the origin.`,
          explain: t`$\int(r^2 + ${c})\,4\pi\delta^3(\vec r)\,d\tau = 4\pi(0 + ${c}) = ${4 * c}\pi \approx ${nice(sf(ans, 4))}$, whatever the radius. Check by parts, never touching the origin: the volume term is $-\int\tfrac{\hat r}{r^2}\cdot\nabla(r^2)\,d\tau = -\int_0^R\tfrac{2}{r}\,4\pi r^2\,dr = -4\pi R^2$ and the surface term is $\oint(r^2 + ${c})\tfrac{\hat r}{r^2}\cdot d\vec a = 4\pi(R^2 + ${c})$; together $4\pi\cdot${c}$ ✓.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sift3d', difficulty: 3,
      gen(r) {
        const b = [r.pick([-1, 1, 2]), r.pick([-2, 1, 2]), r.pick([-1, 1, 3])];
        const c = r.pick([2, 3]);
        const ans = b[0] * b[1] + c * b[2] * b[2];
        const fix = ans === 0;
        const bb = fix ? [b[0], b[1], b[2] + 1] : b, val = bb[0] * bb[1] + c * bb[2] * bb[2];
        return {
          prompt: t`Evaluate $\displaystyle\int_{\text{cube}}\left(xy + ${c}z^2\right)\delta^3(\vec r - \vec b)\,d\tau$ over the cube $-4 \le x, y, z \le 4$ (metres), with $\vec b = (${bb.join(', ')})$ m.`,
          visual: { type: 'c3-flux', params: { surfaces: [boxSurface([-4, 4], [-4, 4], [-4, 4], 'Cube')], readouts: [], normals: false, flipToggle: false, alpha: 0.18, range: 5, points: [{ at: bb, label: 'b', color: 'gold' }] }, caption: t`The cube and the point $\vec b$ where the delta spikes. Drag to rotate.` },
          answer: val, units: 'm^2', tol: { rel: 0, abs: 1e-6 },
          errors: [
            ...(bb[0] * bb[1] + c * bb[2] !== val ? [{ value: bb[0] * bb[1] + c * bb[2], feedback: t`Square the $z$-coordinate: the factor is $${c}z^2$.` }] : []),
          ],
          hints: [t`Is $\vec b$ inside the cube? Each coordinate must lie between $-4$ and $4$.`, t`If it is, the integral is the integrand evaluated at $\vec b$: $x = ${bb[0]}$, $y = ${bb[1]}$, $z = ${bb[2]}$.`],
          teach: t`$\int f(\vec r)\,\delta^3(\vec r - \vec b)\,d\tau = f(\vec b)$ if $\vec b$ is inside the region, and $0$ if not.`,
          explain: t`$\vec b$ is inside the cube, so the integral is $(${bb[0]})(${bb[1]}) + ${c}(${bb[2]})^2 = ${val}\ \text{m}^2$.`,
        };
      },
    }),
    num({
      id: 'cp-planet', difficulty: 3, transfer: true,
      gen(r) {
        const [name, GM, tGM] = r.pick([['Earth', 3.986004e14, t`3.986\times10^{14}`], ['Mars', 4.282837e13, t`4.283\times10^{13}`], ['Jupiter', 1.26686534e17, t`1.267\times10^{17}`], ['the Moon', 4.9048695e12, t`4.905\times10^{12}`]]);
        const ans = 4 * PI * GM;
        return {
          prompt: t`Outside ${name}, Newtonian gravity has potential $\Phi = -GM/r$, with $GM = ${tGM}\ \text{m}^3/\text{s}^2$. A navigation engineer integrates $\nabla^2\Phi$ over a large sphere that encloses the whole planet. Treating the planet as a point mass at the centre, what is $\displaystyle\int\nabla^2\Phi\,d\tau$?`,
          visual: { type: 'c3-flux', params: { F: ['-x/(x^2 + y^2 + z^2)^1.5', '-y/(x^2 + y^2 + z^2)^1.5', '-z/(x^2 + y^2 + z^2)^1.5'], surfaces: [sphereSurface(1)], integrand: 'flux', readouts: [], flipToggle: false, normals: false, range: 1.5, arrowLen: 0.3 }, caption: t`The gravitational field $\vec g = -\nabla\Phi$ pointing in through the enclosing sphere (drawn at radius 1; arrows show direction). Drag to rotate.` },
          answer: ans, units: 'm^3/s^2', tol: { rel: 0.005 },
          errors: [
            { value: GM, feedback: t`$\nabla^2(1/r) = -4\pi\delta^3(\vec r)$: the $4\pi$ is the flux of $\hat r/r^2$ through a sphere.` },
          ],
          hints: [t`$\nabla^2\Phi = -GM\,\nabla^2(1/r)$ and $\nabla^2(1/r) = \nabla\cdot\nabla(1/r) = -\nabla\cdot(\hat r/r^2)$.`, t`So $\nabla^2\Phi = 4\pi GM\,\delta^3(\vec r)$; integrate over a region that contains the origin.`],
          teach: t`$\nabla^2(1/r) = -4\pi\delta^3(\vec r)$: a point mass is the source of Poisson’s equation $\nabla^2\Phi = 4\pi G\rho$ with $\rho = M\delta^3(\vec r)$.`,
          explain: t`$\int\nabla^2\Phi\,d\tau = 4\pi GM = 4\pi(${tGM}) \approx ${tex(ans, 4)}\ \text{m}^3/\text{s}^2$ — the same for any enclosing surface, since by the divergence theorem it is the inward flux of $\vec g$. Poisson’s equation $\nabla^2\Phi = 4\pi G\rho$ is what general relativity must reproduce for weak fields.`,
        };
      },
    }),
    mcq({
      id: 'cp-step', difficulty: 2,
      prompt: t`The step function $\theta(x)$ is $0$ for $x < 0$ and $1$ for $x > 0$. What is $d\theta/dx$?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-0.3, 2.6], aspect: 'wide', curves: [0.5, 0.2, 0.05].map((w, k) => ({ fn: `0.5*(1 + tanh(x/${w}))`, color: ['ink3', 'violet', 'accent'][k], width: 2 })), legend: [{ label: 'width 0.5', color: 'ink3' }, { label: 'width 0.2', color: 'violet' }, { label: 'width 0.05', color: 'accent' }], legendAt: 'tl' }, caption: t`Smoothed steps $\tfrac12(1 + \tanh(x/w))$ getting sharper. Each climbs from 0 to 1, a total rise of 1.` },
      choices: [t`$\delta(x)$`, t`$0$, since $\theta$ is flat on both sides`, t`It does not exist anywhere`, t`$1$ at $x = 0$ and $0$ elsewhere`],
      answer: 0,
      why: {
        1: t`Flat everywhere except at $0$, yes — but the rise of 1 happens somewhere: $\int_{-1}^{1}\theta'\,dx = \theta(1) - \theta(-1) = 1$.`,
        2: 'As an ordinary function it does not; as a distribution it does, and that is the point of the delta.',
        3: t`A function that is $1$ at one point and $0$ elsewhere integrates to $0$, not to the rise of $1$.`,
      },
      hints: [t`Integrate the derivative against a test function: $\int f\,\theta'\,dx = [f\theta] - \int f'\,\theta\,dx$ with $f \to 0$ at $\pm\infty$.`, t`$-\int_0^\infty f'\,dx = f(0)$.`],
      teach: t`The derivative of a jump is a delta: $d\theta/dx = \delta(x)$, weighted by the size of the jump.`,
      explain: t`For any test function, $\int f\,\theta'\,dx = -\int_0^\infty f'\,dx = f(0)$, which is what $\delta$ does. So $\theta' = \delta$. The same move gives surface charges: where $\vec E$ jumps across a charged sheet, $\nabla\cdot\vec E$ contains $\sigma\,\delta$, as module M2 shows.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.5', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Wilcox & Pollock, Students’ difficulties with the Dirac delta function (PRST-PER 11, 010108)', url: 'https://arxiv.org/abs/1407.6311' },
  ],
});
