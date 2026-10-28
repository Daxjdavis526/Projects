// Spherical harmonics as the eigenfunctions of the Laplacian on the sphere:
// separation into Pₗᵐ(cos θ)e^{imφ}, orthonormality and completeness on the
// sphere, 2l + 1 harmonics per degree, the addition theorem and Unsöld's sum,
// and multipole expansions from 1/|r − r′| — with the axis trick (an
// axisymmetric potential is fixed by its values on the axis). Overlaps:
// phys4700 M5.4 (angular momentum) and phys3600 M4.5 (water, CO₂, Earth's J₂)
// are linked; the examples here are a ring and a tethered pair.
import { lesson, mcq, num } from '../../src/core/content.js';
import { SF, SRC, gpic, r3, r4, PI } from './_sf.js';

const t = String.raw;
const sph = (params, caption) => ({ type: 'fa2-sphere', params: { controls: false, readout: false, ...params }, caption });
const P = SF.legendre;
// ring of radius a: exact potential in its plane (∝ average of 1/distance) against the multipole series
const ringExact = (r, a) => SF.integrate((p) => 1 / Math.sqrt(r * r + a * a - 2 * a * r * Math.cos(p)), 0, 2 * PI, 40) / (2 * PI);
const ringSeries = (r, a, L) => { let s = 0, c = 1; for (let n = 0; 2 * n <= L; n++) { s += c * (a / r) ** (2 * n) * P(2 * n, 0); c *= -(2 * n + 1) / (2 * (n + 1)); } return s / r; };
const C22 = 1 / Math.sqrt(15 / (16 * PI));        // sin²θ cos 2φ = C22 · Y₂₂ (real)

export default lesson({
  id: 'st-e.E7.1',
  title: 'Spherical harmonics and multipoles',
  minutes: 17, difficulty: 3,
  intro: t`Separate Laplace’s equation in spherical coordinates and the angular part must solve $-\nabla_S^2Y = \lambda Y$ on the unit sphere. Periodicity in $\varphi$ forces $e^{im\varphi}$ with $m$ an integer; boundedness at the poles forces $\lambda = l(l + 1)$ with $|m| \le l$, exactly as in [E6.1](#/lesson/st-e.E6.1). The normalized solutions are the **spherical harmonics**

$$Y_l^m(\theta, \varphi) = \sqrt{\frac{2l + 1}{4\pi}\,\frac{(l - m)!}{(l + m)!}}\;P_l^m(\cos\theta)\,e^{im\varphi},$$

with $P_l^m(x) = (1 - x^2)^{m/2}\frac{d^m}{dx^m}P_l(x)$. They are orthonormal, $\oint\bar Y_l^mY_{l'}^{m'}\,d\Omega = \delta_{ll'}\delta_{mm'}$, and complete: any reasonable $f(\theta, \varphi)$ is $\sum f_{lm}Y_l^m$ — Fourier series on a sphere. Each degree $l$ has $2l + 1$ of them. Their payoff is the **multipole expansion**, from the generating function of [E6.1](#/lesson/st-e.E6.1): $\frac{1}{|\vec r - \vec r\,'|} = \sum_l\frac{r'^l}{r^{l+1}}P_l(\cos\gamma)$ for $r > r'$. (Conventions differ by a sign $(-1)^m$, the Condon–Shortley phase; the pictures here use real combinations, $\cos m\varphi$ and $\sin m\varphi$. Quantum mechanics meets the same functions as angular momentum states: [PHYS 4700](#/lesson/phys4700.M5.4).)`,
  symbols: [
    { tex: 'Y_l^m', text: 'the spherical harmonic of degree $l$ and order $m$, an eigenfunction of $-\\nabla_S^2$ with eigenvalue $l(l + 1)$' },
    { tex: 'l,\\ m', text: 'integers with $l \\ge 0$ and $-l \\le m \\le l$: $2l + 1$ values of $m$ per $l$' },
    { tex: '\\theta,\\ \\varphi', text: 'the polar angle from the $z$-axis ($0$ to $\\pi$) and the azimuth ($0$ to $2\\pi$)' },
    { tex: 'P_l^m', text: 'the associated Legendre function: $l - |m|$ zeros in $(-1, 1)$' },
    { tex: 'd\\Omega', text: 'the element of solid angle, $\\sin\\theta\\,d\\theta\\,d\\varphi$; the sphere has $4\\pi$ steradians' },
  ],
  why: t`Planetary gravity fields, the cosmic microwave background’s temperature map, the radiation pattern of an antenna and every gravitational-wave template (in spin-weighted harmonics) are lists of $Y_l^m$ coefficients.`,
  visual: {
    type: 'fa2-sphere',
    title: 'Nodal lines on a sphere',
    lead: t`The sphere is shaded by the real harmonic of degree $l$ and order $m$; the bold curves are where it vanishes. Drag to turn it; switch to “lobes” for the size of $Y$ in each direction.`,
    tasks: [
      'Keep l = 3 and step m from 0 to 3: latitude circles turn into great circles through the poles — always l lines in total.',
      'm = 0 harmonics are zonal (bands round the axis); m = ±l are sectoral (orange-peel segments).',
      'Count the harmonics for l = 2 as m runs from −2 to 2: five, the 2l + 1 degeneracy.',
    ],
    params: { l: 3, m: 1, view: 'sphere' },
    caption: 'Real spherical harmonics, computed from Pₗᵐ by recurrence. Blue positive, orange negative, pale near zero; bold: nodal lines. The dashed line is the polar axis θ = 0.',
  },
  example: {
    prompt: t`A thin ring of mass $M$ and radius $a$ (a planetary ring, idealized) has, on its axis, $\Phi(z) = -\dfrac{GM}{\sqrt{z^2 + a^2}}$. Find its potential **everywhere** with $r > a$, and test it in the ring’s plane at $r = 2a$.`,
    visual: gpic({ x: [-3, 3], y: [-1.6, 1.6], equal: true, xlabel: '', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', '0.18*sin(t)'], t: [0, 6.2832], color: 'gold', width: 3 }], points: [{ x: 0, y: 1.3, label: 'on the axis: known', color: 'accent' }, { x: 2, y: 0, label: 'r = 2a: wanted', color: 'warn' }], arrows: [{ from: [0, -1.5], to: [0, 1.55], color: 'ink3', width: 1.2 }] }, 'The ring seen slightly from above, its axis (vertical) and the point in its plane where the series is tested.'),
    steps: [
      { label: 'Axisymmetric form', text: t`Outside $r = a$ the potential solves Laplace’s equation, does not depend on $\varphi$ and vanishes at infinity, so only $m = 0$ harmonics appear: $\Phi = \sum_lB_l\,r^{-l-1}P_l(\cos\theta)$.` },
      { label: 'Expand on the axis', text: t`On the axis $\theta = 0$, $P_l(1) = 1$ and $r = z$: $-\dfrac{GM}{z}\Big(1 + \dfrac{a^2}{z^2}\Big)^{-1/2}$ $= -\dfrac{GM}{z}\Big(1 - \dfrac12\dfrac{a^2}{z^2} + \dfrac38\dfrac{a^4}{z^4} - \cdots\Big)$.` },
      { label: 'Match', text: t`Comparing powers of $z$: $B_0 = -GM$, $B_2 = \tfrac12GMa^2$, $B_4 = -\tfrac38GMa^4$, and all odd $B_l = 0$ (the ring is symmetric about its plane).` },
      { label: 'Off the axis', text: t`Uniqueness lets the same $B_l$ serve everywhere: $\Phi = -\dfrac{GM}{r}\Big(1 - \dfrac{a^2}{2r^2}P_2(\cos\theta) + \dfrac{3a^4}{8r^4}P_4(\cos\theta) - \cdots\Big)$.` },
      { label: 'Test', text: t`In the plane, $P_2(0) = -\tfrac12$ and $P_4(0) = \tfrac38$. At $r = 2a$ the bracket is $1 + \tfrac1{16} + \tfrac{9}{1024} + \cdots$: in units of $GM/a$, $${r4(ringSeries(2, 1, 0))}$, $${r4(ringSeries(2, 1, 2))}$, $${r4(ringSeries(2, 1, 4))}$ after one, two and three terms, against the exact $${r4(ringExact(2, 1))}$ (numerical integral round the ring).` },
    ],
    answer: t`$\Phi = -\dfrac{GM}{r}\Big[1 - \dfrac12\Big(\dfrac ar\Big)^2P_2(\cos\theta) + \dfrac38\Big(\dfrac ar\Big)^4P_4(\cos\theta) - \cdots\Big]$ for $r > a$. In the plane at $r = 2a$ the quadrupole term deepens the potential by $1/16 \approx 6\%$: a ring pulls harder in its plane than a point of the same mass.`,
  },
  practice: [
    num({
      id: 'north-pole', difficulty: 1,
      gen(r) {
        const l = r.int(1, 6), ans = Math.sqrt((2 * l + 1) / (4 * PI));
        return {
          prompt: t`What is $Y_{${l}}^0$ at the north pole, $\theta = 0$?`,
          visual: sph({ l, m: 0 }, `The zonal harmonic Y${'₀₁₂₃₄₅₆'[l]}⁰, symmetric about the polar axis.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`$P_l(1) = 1$, but $Y_l^0$ carries the normalization $\sqrt{(2l + 1)/4\pi}$.` }, { value: (2 * l + 1) / (4 * PI), feedback: 'Take the square root of the normalization.' }],
          hints: [t`$Y_l^0 = \sqrt{\dfrac{2l + 1}{4\pi}}\,P_l(\cos\theta)$, and $\cos 0 = 1$.`],
          teach: 'Yₗ⁰ is Pₗ(cos θ) rescaled to unit norm on the sphere.',
          explain: t`$\sqrt{${2 * l + 1}/4\pi} = ${r4(ans)}$. The factor makes $\oint|Y_l^0|^2d\Omega = 2\pi\cdot\frac{2l + 1}{4\pi}\cdot\frac{2}{2l + 1} = 1$.`,
        };
      },
    }),
    mcq({
      id: 'degeneracy', difficulty: 1,
      gen(r) {
        const l = r.int(3, 6), m = r.int(-l, l);
        return {
          prompt: t`The picture shows one harmonic with $l = ${l}$. How many linearly independent spherical harmonics share this degree, and so the eigenvalue $l(l + 1) = ${l * (l + 1)}$?`,
          visual: sph({ l, m }, 'One of the harmonics of this degree.'),
          choices: [String(2 * l + 1), String(l + 1), String(2 * l), String(l * l)],
          answer: 0,
          why: { 1: 'That counts m = 0, 1, …, l only; negative m (or the sin mφ partners) are independent too.', 2: 'You left out m = 0, the zonal harmonic.', 3: 'l² counts all harmonics with degree below l: Σ(2k + 1) for k < l.' },
          hints: ['m runs from −l to l in steps of 1.'],
          teach: 'Each degree l carries 2l + 1 harmonics, m = −l … l.',
          explain: t`$m = -${l}, \dots, ${l}$: $2(${l}) + 1 = ${2 * l + 1}$. Rotating a harmonic of degree $l$ gives a combination of the same $2l + 1$ — degree is rotation-invariant, order is not.`,
        };
      },
    }),
    num({
      id: 'expand-cos2', difficulty: 2,
      gen(r) {
        const a = r.int(1, 5), b = r.intExcept(-6, 6, [0]);
        const c00 = Math.sqrt(4 * PI) * (a + b / 3), ans = ((2 * b) / 3) * Math.sqrt((4 * PI) / 5);
        return {
          prompt: t`A temperature pattern on a sphere is $f(\theta) = ${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}\cos^2\theta$ (kelvin, measured from some reference). Expand it as $f = c_{00}Y_0^0 + c_{20}Y_2^0$. What is $c_{20}$?`,
          visual: sph({ terms: [[0, 0, c00], [2, 0, ans]] }, 'The pattern f(θ) on the sphere: it depends only on latitude.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (2 * b) / 3, feedback: t`That is the coefficient of $P_2(\cos\theta)$. Convert: $P_2 = \sqrt{4\pi/5}\,Y_2^0$.` }, { value: b * Math.sqrt((4 * PI) / 5), feedback: t`$\cos^2\theta = \tfrac13 + \tfrac23P_2(\cos\theta)$: only $\tfrac23$ of $b$ goes to $P_2$.` }],
          hints: [t`$\cos^2\theta = \tfrac13P_0 + \tfrac23P_2(\cos\theta)$.`, t`$Y_2^0 = \sqrt{5/4\pi}\,P_2(\cos\theta)$, so $P_2 = \sqrt{4\pi/5}\,Y_2^0$.`],
          teach: 'Expand in Legendre polynomials first, then rescale each Pₗ into Yₗ⁰.',
          explain: t`$c_{20} = \tfrac23(${b})\sqrt{4\pi/5} = ${r4(ans)}$ K (and $c_{00} = \sqrt{4\pi}\,(${a} + ${b}/3) = ${r4(c00)}$ K). The mean over the sphere is $c_{00}/\sqrt{4\pi}$; the $Y_2^0$ part says “poles versus equator”.`,
        };
      },
    }),
    mcq({
      id: 'axisym', difficulty: 2,
      prompt: t`A function on the sphere does not depend on $\varphi$. Which coefficients $f_{lm} = \oint f\,\bar Y_l^m\,d\Omega$ can be nonzero?`,
      visual: sph({ terms: [[0, 0, 1], [1, 0, 1.2], [3, 0, 0.8]] }, 'An axisymmetric pattern: unchanged by rotation about the polar axis.'),
      choices: ['only m = 0, for any l', 'only l = 0', 'only m = l', 'all of them, in general'],
      answer: 0,
      why: { 1: 'Bands of latitude need P₁, P₂, … — any l with m = 0.', 2: t`The $m = l$ harmonics vary as $e^{il\varphi}$; they integrate to zero against a $\varphi$-independent $f$.`, 3: t`The $\varphi$ integral of $e^{-im\varphi}$ over a full turn vanishes unless $m = 0$.` },
      hints: [t`$f_{lm}$ contains $\int_0^{2\pi}e^{-im\varphi}d\varphi$.`],
      teach: 'Symmetry selects harmonics: no φ dependence means m = 0 only.',
      explain: t`$\int_0^{2\pi}e^{-im\varphi}d\varphi = 2\pi\delta_{m0}$, so only $Y_l^0 \propto P_l(\cos\theta)$ survive — which is why axisymmetric problems need only Legendre polynomials.`,
    }),
    num({
      id: 'ring-quad', difficulty: 3,
      gen(r) {
        const q = r.pick([2, 3, 4, 5]), thDeg = r.pick([0, 30, 60, 90]);
        const x = Math.cos((thDeg * PI) / 180), ans = -0.5 / (q * q) * P(2, x);
        return {
          prompt: t`For the ring of the worked example, $\Phi = -\dfrac{GM}{r}\Big[1 - \dfrac12\Big(\dfrac ar\Big)^2P_2(\cos\theta) + \cdots\Big]$. At $r = ${q}a$ and $\theta = ${thDeg}^\circ$ from the ring’s axis, what is the quadrupole term as a fraction of the monopole term? (Include its sign.)`,
          visual: gpic({ x: [-1.2 * q, 1.2 * q], y: [-0.7 * q, 0.7 * q], equal: true, xlabel: '', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', '0.18*sin(t)'], t: [0, 6.2832], color: 'gold', width: 3 }], points: [{ x: q * Math.sin((thDeg * PI) / 180), y: q * x, color: 'warn', label: 'field point' }], arrows: [{ from: [0, -0.65 * q], to: [0, 0.65 * q], color: 'ink3', width: 1.2 }] }, 'The ring (gold, edge-on axis vertical) and the field point.'),
          answer: ans, tol: { rel: 0.005, abs: 1e-6 },
          errors: [{ value: -ans, feedback: t`Sign: the term is $-\tfrac12(a/r)^2P_2$ inside the bracket.` }, { value: -0.5 / (q * q), feedback: t`You left out $P_2(\cos\theta)$ — it is $1$ only on the axis.` }].filter((e) => Math.abs(e.value - ans) > 1e-4),
          hints: [t`Divide the quadrupole term by the monopole term 1: what is left is $-\tfrac12(a/r)^2P_2(\cos\theta)$.`, t`$P_2(\cos${thDeg}^\circ) = \tfrac12(3\cos^2${thDeg}^\circ - 1) = ${r4(P(2, x))}$.`],
          teach: 'A multipole term’s size falls as a power of a/r, and its sign and strength vary with direction as Pₗ(cos θ).',
          explain: t`$-\tfrac12\cdot\tfrac{1}{${q * q}}\cdot${r4(P(2, x))} = ${r4(ans)}$. On the axis the ring is weaker than a point mass; in its plane it is stronger.`,
        };
      },
    }),
    num({
      id: 'addition', difficulty: 3,
      gen(r) {
        const [t1, p1, t2, p2] = r.pick([[40, 10, 70, 100], [30, 0, 30, 90], [60, 20, 110, 200], [20, 300, 80, 40]]);
        const d = (v) => (v * PI) / 180;
        const cg = Math.cos(d(t1)) * Math.cos(d(t2)) + Math.sin(d(t1)) * Math.sin(d(t2)) * Math.cos(d(p1 - p2));
        const sum = [-2, -1, 0, 1, 2].reduce((s, m) => s + SF.ylmReal(2, m, d(t1), d(p1)) * SF.ylmReal(2, m, d(t2), d(p2)), 0);
        const ans = (4 * PI / 5) * sum;
        return {
          prompt: t`The **addition theorem** says $P_l(\cos\gamma) = \dfrac{4\pi}{2l + 1}\sum_mY_l^m(\hat n_1)\,\bar Y_l^m(\hat n_2)$, where $\gamma$ is the angle between two directions. For $\hat n_1 = (\theta, \varphi) = (${t1}^\circ, ${p1}^\circ)$ and $\hat n_2 = (${t2}^\circ, ${p2}^\circ)$, find $P_2(\cos\gamma)$.`,
          visual: sph({ l: 2, m: 0, nodal: false }, 'Two directions on the sphere; only the angle between them matters.'),
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: cg, feedback: t`That is $\cos\gamma$ itself; apply $P_2(x) = \tfrac12(3x^2 - 1)$.` }],
          hints: [t`You do not need the five harmonics: $\cos\gamma = \cos\theta_1\cos\theta_2 + \sin\theta_1\sin\theta_2\cos(\varphi_1 - \varphi_2)$.`, t`Here $\cos\gamma = ${r4(cg)}$.`],
          teach: 'The addition theorem splits a function of the angle between two directions into products of harmonics of each.',
          explain: t`$\cos\gamma = ${r4(cg)}$, so $P_2(\cos\gamma) = ${r4(ans)}$ — and the sum over the five real $Y_2^m$ gives the same number. That is how $1/|\vec r - \vec r\,'|$ separates into source factors and field-point factors: multipole moments.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([10, 20, 30]), R = r.pick([60, 100, 150]);
        const ans = -0.5 * (d / (2 * R)) ** 2;
        return {
          prompt: t`Two equal masses on a tether of length $d = ${d}$ km (a tethered-satellite pair) sit at $z = \pm d/2$. A spacecraft is $${R}$ km away, in the plane perpendicular to the tether through its middle. By what fraction does the pair’s quadrupole term change the gravitational potential there, compared with a single point of the same total mass?`,
          visual: gpic({ x: [-0.9 * R, 0.9 * R], y: [-0.5 * R, 0.5 * R], equal: true, xlabel: '', xticks: 0, yticks: 0, points: [{ x: 0, y: d / 2, color: 'gold', r: 6 }, { x: 0, y: -d / 2, color: 'gold', r: 6 }, { x: 0.8 * R, y: 0, color: 'accent', label: 'craft', labelDx: -30 }], arrows: [{ from: [0, -d / 2], to: [0, d / 2], color: 'ink3', width: 1.5 }] }, 'The tethered pair (gold) and the spacecraft; not to scale.'),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: -ans, feedback: t`In the plane, $P_2(\cos 90^\circ) = -\tfrac12$: the sign flips.` }, { value: (d / (2 * R)) ** 2, feedback: t`Multiply by $P_2(0) = -\tfrac12$.` }, { value: -0.5 * (d / R) ** 2, feedback: t`Each mass sits $d/2$ from the centre: the ratio is $(d/2r)^2$.` }],
          hints: [t`$\dfrac{1}{|\vec r - \vec r\,'|} = \sum_l\dfrac{r'^l}{r^{l+1}}P_l(\cos\gamma)$ for each mass, with $r' = d/2$ and $\cos\gamma = \pm\cos\theta$; odd $l$ cancel.`, t`The bracket is $1 + \big(\tfrac{d}{2r}\big)^2P_2(\cos\theta) + \cdots$, and $\theta = 90^\circ$.`],
          teach: 'A multipole correction is (size/distance)ˡ times Pₗ of the direction.',
          explain: t`$\Phi = -\dfrac{GM}{r}\big[1 + \big(\tfrac{d}{2r}\big)^2P_2(\cos\theta) + \cdots\big]$, so in the plane the change is $-\tfrac12\big(\tfrac{${d / 2}}{${R}}\big)^2 = ${r3(ans)}$ — the pair is slightly weaker sideways than a point mass, stronger end-on. (Rings and pairs have quadrupoles of opposite sign.)`,
        };
      },
    }),
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const L = r.int(2, 10), ans = (L + 1) ** 2;
        return {
          prompt: t`A gravity model of a planet is truncated at degree $l = ${L}$ (all orders $m$). How many coefficients does it have, counting $l = 0$?`,
          visual: sph({ terms: [[2, 0, 1], [3, 1, 0.6], [4, -2, 0.5], [2, 2, 0.4]] }, 'An irregular gravity pattern: a sum of harmonics of several degrees.'),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 2 * L + 1, feedback: t`That counts degree ${L} only; add the lower degrees.` }, { value: L * L, feedback: t`$\sum_{l=0}^{L}(2l + 1) = (L + 1)^2$, not $L^2$.` }],
          hints: [t`Add $2l + 1$ for $l = 0, 1, \dots, ${L}$.`],
          teach: 'Degree up to L means (L + 1)² spherical-harmonic coefficients.',
          explain: t`$\sum_{l=0}^{${L}}(2l + 1) = (${L} + 1)^2 = ${ans}$. Real models start at $l = 2$ (the $l = 1$ terms vanish with the origin at the centre of mass) and run to $l$ in the hundreds or thousands for Earth and the Moon.`,
        };
      },
    }),
    num({
      id: 'cp-sectoral', difficulty: 3,
      prompt: t`The real sectoral harmonic of degree 2 is $Y_{22} = \sqrt{\dfrac{15}{16\pi}}\,\sin^2\theta\cos2\varphi$. Write $f = \sin^2\theta\cos2\varphi$ as $c\,Y_{22}$: what is $c$, the coefficient $\oint f\,Y_{22}\,d\Omega$?`,
      visual: sph({ terms: [[2, 2, 1]] }, 'sin²θ cos 2φ: four lobes round the equator, nodes on two great circles through the poles.'),
      answer: C22, tol: { rel: 0.005 },
      errors: [{ value: Math.sqrt(15 / (16 * PI)), feedback: 'That is the normalization itself; c is its reciprocal.' }, { value: 1, feedback: 'f is not normalized: its integral of f² over the sphere is not 1.' }],
      hints: [t`$f = \dfrac{1}{\sqrt{15/16\pi}}\,Y_{22}$ directly.`, t`Or compute $\oint f^2d\Omega = \int_0^\pi\sin^5\theta\,d\theta\int_0^{2\pi}\cos^22\varphi\,d\varphi = \tfrac{16}{15}\cdot\pi$, and $c = \sqrt{\oint f^2}$.`],
      teach: 'An orthonormal expansion coefficient is the projection ∮ f Y dΩ; for a single harmonic it is just the inverse normalization.',
      explain: t`$c = \sqrt{16\pi/15} = ${r4(C22)}$, and indeed $\oint f^2d\Omega = 16\pi/15 = c^2$. This is the pattern of a planet’s $C_{22}$ term — a triaxial body’s equatorial bulge.`,
    }),
  ],
  sources: [SRC.dlmf14, SRC.arfken, SRC.rhb],
});
