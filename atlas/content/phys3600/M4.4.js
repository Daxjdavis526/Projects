// Separation of variables in spherical coordinates (Griffiths §3.3.2), with
// azimuthal symmetry: the radial powers r^l and r^−(l+1), Legendre
// polynomials (computed by recurrence in _bvp.js, never typed), regularity
// choosing the terms inside and outside, Fourier–Legendre coefficients by
// orthogonality, the sphere with a prescribed V(θ), and the conducting
// sphere in a uniform field (σ = 3ε₀E₀cos θ, the field tripled at the poles).
// Transfer: a metal payload in a thunderstorm field. The special-function
// mathematics is st-b.B7.3.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, sf, field, P, legendreRat, legendreTeX, legendreExpr, legendreProject } from './_bvp.js';

const t = String.raw;
const PI = Math.PI;

/** r^l P_l(y/r) as a polynomial expression in x and y (y along the axis): homogeneous of degree l. */
const solid = (l) => legendreRat(l).map(([n, d], k) => (n === 0 ? null : `(${n}/${d})*y^${k}*(x^2 + y^2)^${(l - k) / 2}`)).filter(Boolean).join(' + ');
const keys = ['c0', 'c1', 'c2', 'c3'];
const inside = keys.map((c, l) => `${c}*(${solid(l)})`).join(' + ');
const outside = keys.map((c, l) => `${c}*(${solid(l)})/(x^2 + y^2)^${(2 * l + 1) / 2}`).join(' + ');
const sphereMap = `step(1 - sqrt(x^2 + y^2))*(${inside}) + step(sqrt(x^2 + y^2) - 1)*(${outside})`;

export default lesson({
  id: 'phys3600.M4.4',
  title: 'Separation of variables: spherical and Legendre polynomials',
  minutes: 18, difficulty: 4,
  equation: t`V(r, \theta) = \sum_{l=0}^{\infty}\left(A_l\,r^l + \frac{B_l}{r^{l+1}}\right)P_l(\cos\theta)`,
  intro: t`When nothing depends on the azimuth $\phi$, try $V = R(r)\,\Theta(\theta)$ in spherical Laplace’s equation. The radial part gives powers, $r^l$ and $r^{-(l+1)}$. The angular part is Legendre’s equation, whose solutions stay finite at both poles only when $l = 0, 1, 2, \ldots$: they are the **Legendre polynomials** $P_l(\cos\theta)$ — $P_0 = 1$, $P_1 = \cos\theta$, $P_2 = ${legendreTeX(2, '\\cos\\theta')}$, $P_3 = ${legendreTeX(3, '\\cos\\theta')}$, from the recurrence $(l + 1)P_{l+1} = (2l + 1)xP_l - lP_{l-1}$. Then the regions choose: **inside** a sphere $V$ must be finite at the centre, so $B_l = 0$; **outside** it must vanish far away, so $A_l = 0$ (unless a uniform field is imposed there). The $P_l$ are orthogonal, $\int_{-1}^{1}P_lP_{l'}\,dx = \frac{2}{2l + 1}\delta_{ll'}$ with $x = \cos\theta$, which picks out each coefficient from the boundary values — the spherical Fourier’s trick. The special-function mathematics is in [the PDE course](#/lesson/st-b.B7.3).`,
  symbols: [
    { tex: 'r,\\ \\theta', text: t`distance from the centre (m) and angle from the symmetry axis; nothing depends on $\phi$` },
    { tex: 'l', text: t`the degree, $0, 1, 2, \ldots$: monopole, dipole, quadrupole, …` },
    { tex: 'A_l,\\ B_l', text: t`constants fixed by the boundaries, in V/mˡ and V·mˡ⁺¹` },
    { tex: 'r^l', text: 'the solution regular at the centre (used inside)' },
    { tex: 'r^{-(l+1)}', text: 'the solution that dies far away (used outside)' },
    { tex: 'P_l(\\cos\\theta)', text: t`the Legendre polynomial of degree $l$: $P_l(1) = 1$ at the north pole, with $l$ zeros between the poles` },
  ],
  why: t`The same expansion describes Earth’s gravity field (the $J_2$ of an orbit’s precession), the multipoles of a molecule or a nucleus, and — with $\phi$ restored — the spherical harmonics of atomic orbitals and of the cosmic microwave background.`,
  visual: {
    type: 'c3-contour',
    title: 'Mixing Legendre terms on a sphere',
    lead: t`A sphere of radius $R$ (the circle) whose surface potential you build from $P_0$ to $P_3$; the axis of symmetry is vertical. Inside, each term grows as $r^l$; outside, it fades as $r^{-(l+1)}$. Shading and contours show $V$ everywhere.`,
    tasks: [
      t`Only $c_1$: inside, flat equipotentials — a uniform field; outside, a dipole pattern. Only $c_0$: constant inside, $1/r$ outside.`,
      t`Only $c_2$: four lobes. Drag the probe out along the axis: $V$ falls as $1/r^3$, much faster than the dipole’s $1/r^2$.`,
      t`Drag the probe to the centre: whatever the mix, $V(0) = c_0$ — the average of $V$ over the sphere (every $P_l$ with $l \ge 1$ averages to zero).`,
    ],
    params: {
      f: sphereMap, x: [-3.2, 3.2], y: [-2, 2], aspect: 'wide', levels: 12, labels: false, fill: true, xlabel: '', ylabel: 'axis', n: 140,
      sliders: keys.map((k, l) => ({ key: k, label: t`$c_${l}$, the $P_${l}$ part of $V(R, \theta)$`, min: -1, max: 1, step: 0.1, value: l === 1 ? 1 : 0, unit: t`\text{V}`, explain: `The coefficient of P${'₀₁₂₃'[l]}(cos θ) in the sphere’s surface potential.` })),
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }],
      probe: [0.5, 1.4],
      readouts: [{ label: t`$V$ at the probe`, expr: 'fp', unit: t`\text{V}`, digits: 3 }, { label: t`$r/R$ at the probe`, expr: 'sqrt(px^2 + py^2)', digits: 3 }],
    },
    caption: t`Exact: inside $V = \sum c_l(r/R)^lP_l(\cos\theta)$, outside $V = \sum c_l(R/r)^{l+1}P_l(\cos\theta)$, with $R = 1$. A slice through the axis; the picture is the same in every such slice.`,
  },
  example: {
    prompt: t`An uncharged conducting sphere of radius $R$ is placed in a uniform field $\vec E_0 = E_0\hat z$. Find $V$ outside and the induced surface charge. Put in $E_0 = 100$ kV/m.`,
    visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 3, Q: 0 }, uniform: [0, 1e5], ref: [0, 0], fieldLines: true, density: 16, equip: true, dV: 1000 }, t`The sphere (grey) in a uniform field pointing up the page, with field lines and equipotentials (violet, every 1 000 V). The lines bend to meet the metal at right angles and crowd at the poles.`),
    steps: [
      { label: 'Boundary conditions', text: t`Ground the sphere: $V = 0$ on $r = R$ (an uncharged sphere sits at the potential of its centre, so this costs nothing). Far away, $V \to -E_0z = -E_0r\cos\theta$.` },
      { label: 'Choose terms', text: t`The far condition has only $l = 1$, with $A_1 = -E_0$; all other $A_l = 0$. So $V = -E_0r\cos\theta + \sum_l \dfrac{B_l}{r^{l+1}}P_l(\cos\theta)$.` },
      { label: 'Fit the sphere', text: t`At $r = R$ every $P_l$ must cancel: for $l \ne 1$, $B_l = 0$; for $l = 1$, $-E_0R + B_1/R^2 = 0$, so $B_1 = E_0R^3$. Result: $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$ — the applied field plus a dipole.` },
      { label: 'Surface charge', text: t`$\sigma = -\varepsilon_0\,\partial V/\partial r\,\big|_{R} = \varepsilon_0E_0\left(1 + \dfrac{2R^3}{R^3}\right)\cos\theta = 3\varepsilon_0E_0\cos\theta$.` },
      { label: 'Numbers', text: t`At the poles $\sigma = \pm3\varepsilon_0E_0 \approx \pm${nice(sf(3 * EPS0 * 1e5 * 1e9, 3))}\ \text{nC/m}^2$, and the field there is $3E_0 = 300$ kV/m — whatever the sphere’s size. The induced dipole is $p = 4\pi\varepsilon_0R^3E_0$.` },
    ],
    answer: t`$V = -E_0\left(r - R^3/r^2\right)\cos\theta$ outside, $\sigma = 3\varepsilon_0E_0\cos\theta$: up to $\approx ${nice(sf(3 * EPS0 * 1e5 * 1e9, 3))}\ \text{nC/m}^2$, with $3E_0$ at the poles.`,
  },
  practice: [
    num({
      id: 'p-value', difficulty: 2,
      gen(r) {
        const l = r.pick([2, 3]), th = r.pick([30, 45, 60, 120]);
        const ans = P(l, Math.cos((th * PI) / 180));
        return {
          prompt: t`Evaluate $P_${l}(\cos\theta)$ at $\theta = ${th}°$, with $P_${l}(x) = ${legendreTeX(l)}$.`,
          visual: { type: 'graph', params: { x: [0, 180], y: [-1.1, 1.1], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: `P${'₀₁₂₃'[l]}(cos θ)`, curves: [{ fn: legendreExpr(l, 'cos(x*pi/180)'), color: 'accent', width: 2.6 }], vlines: [{ x: th, color: 'violet' }] }, caption: t`$P_${l}(\cos\theta)$ from pole to pole; the violet line marks $\theta = ${th}°$.` },
          answer: ans, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: P(l, (th * PI) / 180), feedback: t`$x$ is $\cos\theta$, not $\theta$ in radians.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\cos ${th}° = ${nice(sf(Math.cos((th * PI) / 180), 4))}$.`, t`Put $x = \cos\theta$ into $${legendreTeX(l)}$.`],
          teach: 'Legendre polynomials are functions of cos θ: they equal 1 at the north pole and (−1)ˡ at the south.',
          explain: t`$x = \cos ${th}° \approx ${nice(sf(Math.cos((th * PI) / 180), 4))}$, so $P_${l} \approx ${nice(sf(ans, 3))}$.`,
        };
      },
    }),
    mcq({
      id: 'which-terms', difficulty: 2,
      prompt: t`For the region **inside** a sphere containing no charge, which terms of the general solution survive?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 3], aspect: 'wide', xlabel: 'r / R', ylabel: '', curves: [{ fn: 'x^2', domain: [0, 1.7], color: 'accent', width: 2.4, label: 'r² (l = 2)', labelAt: 1.5, labelDx: 6 }, { fn: '1/x^3', domain: [0.69, 3], color: 'warn', width: 2.4, label: 'r⁻³ (l = 2)', labelAt: 2.2, labelDy: -8 }], vlines: [{ x: 1, color: 'ink3', label: 'surface' }] }, caption: t`The two radial solutions for $l = 2$: one is finite at the centre, the other blows up there.` },
      choices: [t`$A_lr^lP_l(\cos\theta)$ only`, t`$B_lr^{-(l+1)}P_l(\cos\theta)$ only`, 'Both, with all coefficients fixed by the surface values', t`Only $l = 0$, since there is no charge inside`],
      answer: 0,
      why: {
        1: t`$r^{-(l+1)}$ blows up at the centre, where there is no charge to justify it. That is the outside solution.`,
        2: t`Both appear only in a shell, $a < r < b$, which has two boundaries to fix them.`,
        3: t`No charge inside does not mean constant $V$: the surface values can vary with $\theta$, as in the Explore picture.`,
      },
      hints: ['What happens to each radial function at r = 0?'],
      teach: 'Implicit conditions choose the radial functions: finite at the centre keeps rˡ; zero at infinity keeps r^−(l+1).',
      explain: t`At $r = 0$, $r^{-(l+1)}$ diverges; with no charge there, $V$ must be finite, so $B_l = 0$ inside. The mirror argument keeps only $B_l$ outside. Forgetting these implicit conditions is one of the commonest documented slips in spherical problems.`,
    }),
    num({
      id: 'cos2-centre', difficulty: 3,
      gen(r) {
        const k = r.pick([30, 60, 90]);
        const A0 = (1 / 2) * legendreProject((x) => k * x * x, 0);
        return {
          prompt: t`The surface of a hollow sphere is held at $V_0(\theta) = ${k}\cos^2\theta$ volts. What is the potential at its centre?`,
          visual: { type: 'c3-contour', params: { f: sphereMap, constants: { c0: k / 3, c1: 0, c2: (2 * k) / 3, c3: 0 }, x: [-3.2, 3.2], y: [-2, 2], aspect: 'wide', levels: 12, labels: false, fill: true, xlabel: '', ylabel: 'axis', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }] }, caption: t`The potential inside and outside the sphere (axis vertical): highest near the poles, where $\cos^2\theta = 1$.` },
          answer: A0, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: k, feedback: t`${k} V is the value at the poles only. The centre sees the **average** over the sphere.` }, { value: k / 2, feedback: t`The average of $\cos^2\theta$ over a sphere (weighting by area, $\sin\theta\,d\theta$) is $\tfrac13$, not $\tfrac12$.` }],
          hints: [t`Write $\cos^2\theta = \tfrac13P_0 + \tfrac23P_2(\cos\theta)$.`, t`Inside, $V = \tfrac{${k}}{3} + \tfrac{2\cdot${k}}{3}\left(\tfrac rR\right)^2P_2$; at the centre only the $l = 0$ term remains.`],
          teach: 'Only the l = 0 part of the surface potential reaches the centre: V(0) is the average of V over the sphere.',
          explain: t`$\cos^2\theta = \tfrac13 + \tfrac23P_2$, so $V(0) = \tfrac13\times${k} = ${nice(A0)}$ V — the area-average of $V_0$ over the sphere, as the mean-value property of [M4.1](#/lesson/phys3600.M4.1) demands.`,
        };
      },
    }),
    num({
      id: 'cos2-outside', difficulty: 3,
      gen(r) {
        const k = r.pick([30, 60, 90]), n = r.pick([2, 3]);
        const ans = (k / 3) / n + ((2 * k) / 3) / n ** 3;
        return {
          prompt: t`The same sphere (radius $R$, surface at $${k}\cos^2\theta$ V, nothing else around). Find $V$ on the axis at $r = ${n}R$, outside.`,
          visual: { type: 'c3-contour', params: { f: sphereMap, constants: { c0: k / 3, c1: 0, c2: (2 * k) / 3, c3: 0 }, x: [-3.2, 3.2], y: [-2, 3.2], aspect: 'wide', levels: 12, labels: false, fill: true, xlabel: '', ylabel: 'axis', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }], points: [{ x: 0, y: n, color: 'gold', label: `r = ${n}R` }] }, caption: 'The sphere’s potential; the gold point is where V is asked for.' },
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: k / n, feedback: t`Outside, each term falls with its own power: $l = 0$ as $R/r$, $l = 2$ as $(R/r)^3$.` }, { value: (k / 3) / n + ((2 * k) / 3) / n ** 2, feedback: t`The $l = 2$ term goes as $r^{-(l+1)} = r^{-3}$, not $r^{-2}$.` }],
          hints: [t`Outside: $V = \tfrac{${k}}{3}\dfrac Rr + \tfrac{2\cdot${k}}{3}\left(\dfrac Rr\right)^3P_2(\cos\theta)$.`, t`On the axis $P_2(1) = 1$; put $R/r = 1/${n}$.`],
          teach: 'Outside, each Legendre term of the surface potential fades as (R/r)^(l+1): higher l dies faster.',
          explain: t`$V = \tfrac{${k}}{3}\cdot\tfrac1${n} + \tfrac{2\cdot${k}}{3}\cdot\tfrac{1}{${n ** 3}} \approx ${nice(sf(ans, 3))}$ V. The monopole part already dominates at $r = ${n}R$.`,
        };
      },
    }),
    num({
      id: 'norm', difficulty: 2,
      gen(r) {
        const l = r.pick([1, 2, 3, 4]);
        return {
          prompt: t`Orthogonality gives $\displaystyle\int_{-1}^{1}[P_l(x)]^2\,dx$ a simple value. Find it for $l = ${l}$, with $P_${l}(x) = ${legendreTeX(l)}$.`,
          visual: { type: 'graph', params: { x: [-1, 1], y: [-0.2, 1.1], aspect: 'wide', xlabel: 'x = cos θ', ylabel: '', curves: [{ fn: `(${legendreExpr(l)})^2`, color: 'accent', width: 2.4 }], shade: [{ fn: `(${legendreExpr(l)})^2`, from: -1, to: 1, color: 'accent', alpha: 0.25 }] }, caption: t`$[P_${l}(x)]^2$: the shaded area is the integral.` },
          answer: 2 / (2 * l + 1), tol: { rel: 0.005 },
          integrand: `(${legendreExpr(l)})^2`, limits: [-1, 1], vars: { x: [-1, 1] },
          errors: [{ value: 1, feedback: t`The $P_l$ are normalized to $P_l(1) = 1$, not to unit integral.` }],
          hints: [t`The rule is $\displaystyle\int_{-1}^1P_l^2\,dx = \dfrac{2}{2l + 1}$.`],
          teach: t`The Legendre polynomials are orthogonal on $[-1, 1]$ with $\int P_l^2\,dx = 2/(2l+1)$ — the normalization used to extract coefficients.`,
          explain: t`$\dfrac{2}{2\cdot${l} + 1} = ${nice(sf(2 / (2 * l + 1), 4))}$. So a coefficient is $C_l = \dfrac{2l + 1}{2}\displaystyle\int_{-1}^1 V_0P_l\,dx$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-storm', difficulty: 3, transfer: true,
      gen(r) {
        const E0 = r.pick([50, 100, 200, 400]);
        const sig = 3 * EPS0 * E0 * 1e3;
        return {
          prompt: t`A stratospheric balloon carries a roughly spherical metal instrument package through the field below a thundercloud, ${E0} kV/m and vertical. Treat the package as an uncharged conducting sphere. What surface charge density is induced at its top, and is the field there above dry air’s sea-level breakdown of 3 MV/m? Give $\sigma$ in μC/m².`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 3, Q: 0 }, uniform: [0, 1e5], ref: [0, 0], fieldLines: true, density: 16, equip: false }, 'A conducting sphere in a uniform vertical field: field lines crowd at the poles.'),
          answer: sig * 1e6, units: 'uC/m^2', tol: { rel: 0.01 },
          errors: [{ value: EPS0 * E0 * 1e3 * 1e6, feedback: t`That is $\varepsilon_0E_0$, the charge on a flat plate. The sphere bends the field and triples it at the poles: $\sigma = 3\varepsilon_0E_0\cos\theta$.` }],
          hints: [t`$\sigma = 3\varepsilon_0E_0\cos\theta$; at the top, $\theta = 0$.`, t`The field just outside is $\sigma/\varepsilon_0 = 3E_0$.`],
          teach: 'A conducting sphere in a uniform field carries σ = 3ε₀E₀cos θ: the field at its poles is three times the applied one, whatever its size.',
          explain: t`$\sigma = 3\varepsilon_0E_0 \approx ${nice(sf(sig * 1e6, 3))}\ \mu\text{C/m}^2$, and the field at the top is $3E_0 = ${nice(3 * E0)}$ kV/m — ${3 * E0 >= 3000 ? 'at or past' : 'below'} the sea-level breakdown field. Breakdown fields fall with air density, so at balloon altitudes corona starts in weaker fields; and real shapes with corners enhance the field far more than a sphere’s factor of 3.`,
        };
      },
    }),
    num({
      id: 'cp-cos3', difficulty: 3,
      gen(r) {
        const V0 = r.pick([10, 20, 50]), l = r.pick([1, 3]);
        const C = ((2 * l + 1) / 2) * legendreProject((x) => V0 * x ** 3, l);
        return {
          prompt: t`A sphere’s surface is held at $V_0(\theta) = ${V0}\cos^3\theta$ volts. Its Legendre expansion is $\sum_l C_lP_l(\cos\theta)$. Find $C_${l}$.`,
          visual: { type: 'graph', params: { x: [-1, 1], y: [-1.1, 1.1], aspect: 'wide', xlabel: 'x = cos θ', ylabel: 'V / V₀', curves: [{ fn: 'x^3', color: 'warn', width: 2.6, label: 'cos³θ', labelAt: 0.6, labelDy: 14 }, { fn: legendreExpr(l), color: 'accent', width: 2, dash: [5, 4], label: `P${'₀₁₂₃'[l]}`, labelAt: l === 1 ? -0.6 : -0.3, labelDy: -8 }] }, caption: t`The surface potential against $x = \cos\theta$, and the Legendre polynomial being projected on.` },
          answer: C, units: 'V', tol: { rel: 0.01 },
          integrand: `${(2 * l + 1) / 2}*${V0}*x^3*(${legendreExpr(l)})`, limits: [-1, 1], vars: { x: [-1, 1] },
          errors: [{ value: legendreProject((x) => V0 * x ** 3, l), feedback: t`Divide by the norm: $C_l = \dfrac{2l + 1}{2}\displaystyle\int_{-1}^1V_0P_l\,dx$.` }],
          hints: [t`$C_l = \dfrac{2l + 1}{2}\displaystyle\int_{-1}^{1}V_0(x)P_l(x)\,dx$ with $x = \cos\theta$.`, t`Or rewrite: $x^3 = \tfrac35P_1(x) + \tfrac25P_3(x)$.`],
          teach: 'A polynomial in cos θ is a finite sum of Legendre polynomials; orthogonality, or plain algebra, finds the coefficients.',
          explain: t`$x^3 = \tfrac35P_1 + \tfrac25P_3$, so $C_1 = \tfrac35\times${V0}$ and $C_3 = \tfrac25\times${V0}$: here $C_${l} = ${nice(sf(C, 4))}$ V. Every other coefficient is zero.`,
        };
      },
    }),
    mcq({
      id: 'cp-shell', difficulty: 3,
      prompt: t`You need $V$ in the region **between** two concentric spheres, $a < r < b$, each held at a given $V(\theta)$. Which terms do you keep?`,
      visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(1.44 - x^2, 0))', lower: '-sqrt(max(1.44 - x^2, 0))', from: -1.2, to: 1.2, color: 'accent', alpha: 0.12 }], curves: [{ param: ['0.55*cos(t)', '0.55*sin(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }, { param: ['1.2*cos(t)', '1.2*sin(t)'], t: [0, 2 * PI], color: 'warn', width: 2.4 }], points: [{ x: 0, y: 0.85, r: 0, label: 'a < r < b', labelDx: -22 }] }, caption: 'The region between two spheres (shaded).' },
      choices: [t`Both $r^l$ and $r^{-(l+1)}$ for each $l$: two coefficients, fixed by the two spheres`, t`Only $r^l$, since the region is bounded`, t`Only $r^{-(l+1)}$, since the region is outside the inner sphere`, t`Only $l = 0$`],
      answer: 0,
      why: {
        1: t`The region does not contain the origin, so nothing forbids $r^{-(l+1)}$.`,
        2: t`The region does not reach infinity, so nothing forbids $r^l$.`,
        3: t`With $\theta$-dependent boundary values, higher $l$ are needed.`,
      },
      hints: ['Does the region contain r = 0? Does it reach infinity?', 'A radial function is thrown out only when it misbehaves somewhere inside the region.'],
      teach: 'Keep every radial solution the region allows; each boundary supplies one equation per l.',
      explain: t`Neither $r = 0$ nor $r = \infty$ is in the region, so both radial functions stay. Each sphere gives one condition per $l$ — two equations for $A_l$ and $B_l$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §3.3.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NIST Digital Library of Mathematical Functions, §14.7 and §18.9 (Legendre polynomials)', url: 'https://dlmf.nist.gov/18.9' },
  ],
});
