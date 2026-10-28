// Sectional curvature: Riemann read plane by plane. K(X, Y) is the Gaussian
// curvature of the surface of geodesics leaving a point in the plane of X
// and Y; it depends only on the plane; it determines Riemann; constant K
// means R_ρσμν = K(g g − g g); Ricci in a unit direction is the sum of the
// sectional curvatures of planes containing it. Worked on the spatial
// geometry around a star (Schwarzschild t = const: −M/r³ for planes through
// the radial direction, +2M/r³ for the tangential plane, total R = 0), on
// S² × R and the 3-sphere; and on timelike planes, where positive K means
// tidal stretching.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { GM_EARTH, C } from './_curv.js';

const t = String.raw;
const DEG = Math.PI / 180;
const AU = 1.495978707e11;

const E = (extra = {}) => [
  { to: [1.4, 0, 0], color: 'accent', label: t`\hat e_r` },
  { to: [0, 1.4, 0], color: 'teal', label: t`\hat e_\theta` },
  { to: [0, 0, 1.4], color: 'gold', label: t`\hat e_\varphi` },
  ...(extra.more || []),
];

/** The frame and the plane spanned by ê_θ and cos β ê_r + sin β ê_φ. */
const tiltPic = (beta, caption) => {
  const c = Math.cos(beta * DEG), s = Math.sin(beta * DEG);
  return {
    type: 'calc-vectors3d',
    params: {
      range: 1.8, yaw: 0.75, pitch: 0.45,
      vectors: E({ more: [{ to: [+(1.2 * c).toFixed(4), 0, +(1.2 * s).toFixed(4)], color: 'warn', label: 'W' }] }),
      parallelograms: [{ at: [+(-1.1 * c).toFixed(4), -1.1, +(-1.1 * s).toFixed(4)], u: [+(2.2 * c).toFixed(4), 0, +(2.2 * s).toFixed(4)], v: [0, 2.2, 0], color: 'violet', alpha: 0.28 }],
    },
    caption,
  };
};

export default lesson({
  id: 'st-c.C16.2',
  title: 'Sectional curvature',
  minutes: 13, difficulty: 3,
  equation: t`K(X, Y) = \frac{R_{\mu\nu\rho\sigma}X^\mu Y^\nu X^\rho Y^\sigma}{g(X, X)\,g(Y, Y) - g(X, Y)^2}`,
  intro: t`In three or more dimensions there is no single "the curvature" at a point. But pick a **2-plane** there, spanned by two vectors $X$ and $Y$, and shoot geodesics out in every direction within it: they sweep out a little surface, and its Gaussian curvature is the **sectional curvature** $K(X, Y)$ above. The denominator is the squared area of the parallelogram on $X$ and $Y$, so $K$ depends only on the plane, not on which vectors span it.

Sectional curvatures carry everything: knowing $K$ for every plane recovers all of Riemann. Two special cases matter most:

- **Constant $K$ for every plane:** $R_{\rho\sigma\mu\nu} = K(g_{\rho\mu}g_{\sigma\nu} - g_{\rho\nu}g_{\sigma\mu})$ — spheres, flat space and hyperbolic space, the "maximally symmetric" spaces.
- **Ricci is a sum of them:** for a unit vector $e$, $R_{\mu\nu}e^\mu e^\nu = \sum_i K(e, e_i)$ over an orthonormal set $e_i$ perpendicular to $e$; and $R$ is the sum over all pairs, counted twice.`,
  symbols: [
    { tex: t`K(X, Y)`, text: t`the sectional curvature of the plane spanned by $X$ and $Y$, in $\text{m}^{-2}$` },
    { tex: t`R_{\mu\nu\rho\sigma}`, text: 'the lowered Riemann tensor (C15.3), in Carroll’s convention' },
    { tex: t`X^\mu,\ Y^\nu`, text: 'two vectors at the point; any two that span the same plane give the same K' },
    { tex: t`g(X, X)\,g(Y, Y) - g(X, Y)^2`, text: t`the squared area of the parallelogram spanned by $X$ and $Y$ (negative for a timelike plane in spacetime)` },
  ],
  why: t`Tidal forces are sectional curvatures of planes containing the direction of time: positive ones stretch, negative ones squeeze (C17.1). Spatial sectional curvatures are what "curved space" around a star means.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Turn the plane',
    lead: t`At a point, three orthonormal directions: $\hat e_r$ (away from the centre), $\hat e_\theta$ and $\hat e_\varphi$. The violet plane is the one perpendicular to the orange normal $n$. Tilt it and read its sectional curvature.`,
    tasks: [
      t`Space around a star: with $n$ along $\hat e_r$ (tilt $0^\circ$) the plane is tangential, $K = +2M/r^3$. Tilt it to $90^\circ$ — now it contains the radial direction — and $K = -M/r^3$. In between it passes through zero.`,
      t`Spin the azimuth: $K$ does not change. The space is symmetric about the radial line.`,
      t`$S^2\times$ line: planes containing the line (tilt $90^\circ$) are flat. The 3-sphere: every plane has the same $K$ — it is maximally symmetric.`,
    ],
    params: {
      range: 1.8, yaw: 0.75,
      sliders: [
        { key: 'a', label: 'tilt of $n$ from $\\hat e_r$', min: 0, max: 90, step: 1, value: 30, unit: '^\\circ', explain: 'The angle between the plane’s normal and the radial direction.' },
        { key: 'b', label: 'azimuth of $n$', min: 0, max: 360, step: 5, value: 40, unit: '^\\circ', explain: 'Turns the plane about the radial direction.' },
      ],
      choices: [{ key: 's', label: 'Space', options: [[1, 'around a star (units of M/r³)'], [2, '$S^2\\times$ line (units of $1/a^2$)'], [3, '3-sphere (units of $1/a^2$)']], value: 1, explain: 'Three 3D spaces with symmetry about the radial line.' }],
      vectors: [...E(), { to: ['1.2*cos(a*pi/180)', '1.2*sin(a*pi/180)*cos(b*pi/180)', '1.2*sin(a*pi/180)*sin(b*pi/180)'], color: 'warn', label: 'n' }],
      planes: [{ normal: ['cos(a*pi/180)', 'sin(a*pi/180)*cos(b*pi/180)', 'sin(a*pi/180)*sin(b*pi/180)'], d: 0, size: 1.2, color: 'violet', alpha: 0.28 }],
      readouts: [{ label: t`$K$ of the violet plane`, expr: '(2*step(1.5 - s) + step(s - 1.5))*cos(a*pi/180)^2 + (step(s - 2.5) - step(1.5 - s))*sin(a*pi/180)^2', digits: 3, zero: 1e-9 }],
    },
    caption: t`The frame is orthonormal; the plane is drawn through the point. Around a star: the spatial slice $t = \text{const}$ of Schwarzschild, where in this frame $K = 2M/r^3$ for the tangential plane and $-M/r^3$ for every plane through $\hat e_r$ (exact, $G = c = 1$). A plane with unit normal $n$ has $K = n_r^2K_{\theta\varphi} + (n_\theta^2 + n_\varphi^2)K_{r\theta}$ here because no mixed components appear in this frame.`,
  },
  example: {
    prompt: t`In the space around a star (the Schwarzschild slice $t = \text{const}$, $G = c = 1$), the orthonormal frame components are $R_{\hat r\hat\theta\hat r\hat\theta} = R_{\hat r\hat\varphi\hat r\hat\varphi} = -M/r^3$, $R_{\hat\theta\hat\varphi\hat\theta\hat\varphi} = +2M/r^3$, and every component with three or four different indices is zero. Find $K$ for the plane spanned by $X = \hat e_\theta$ and $W = \cos\beta\,\hat e_r + \sin\beta\,\hat e_\varphi$; then find the Ricci component along $\hat e_\theta$ and the scalar $R$.`,
    visual: tiltPic(35, 'The plane spanned by ê_θ and W, tilted by β = 35° from the radial direction toward ê_φ.'),
    steps: [
      { label: 'Denominator', text: t`$X$ and $W$ are orthonormal: $g(X, X)g(W, W) - g(X, W)^2 = 1$.` },
      { label: 'Expand', text: t`$R(W, X, W, X) = \cos^2\beta\,R_{\hat r\hat\theta\hat r\hat\theta} + \sin^2\beta\,R_{\hat\varphi\hat\theta\hat\varphi\hat\theta} + 2\sin\beta\cos\beta\,R_{\hat r\hat\theta\hat\varphi\hat\theta}$, and the last component is zero.` },
      { label: 'Sectional', text: t`$K = \big(-\cos^2\beta + 2\sin^2\beta\big)\dfrac{M}{r^3}$: from $-M/r^3$ for a plane through the radial line to $+2M/r^3$ for the tangential plane, and zero at $\tan^2\beta = \tfrac12$, $\beta = 35.3^\circ$.` },
      { label: 'Ricci', text: t`$R_{\hat\theta\hat\theta} = K(\hat e_\theta, \hat e_r) + K(\hat e_\theta, \hat e_\varphi) = -M/r^3 + 2M/r^3 = +M/r^3$, and likewise $R_{\hat r\hat r} = -2M/r^3$.` },
      { label: 'Scalar', text: t`$R = 2(K_{r\theta} + K_{r\varphi} + K_{\theta\varphi}) = 2(-1 - 1 + 2)M/r^3 = 0$. Not a coincidence: for a moment-of-time-symmetry slice of empty spacetime, Einstein’s equation demands zero spatial $R$.` },
    ],
    answer: t`$K = (2\sin^2\beta - \cos^2\beta)M/r^3$; $R_{\hat\theta\hat\theta} = M/r^3$; $R = 0$.`,
  },
  practice: [
    num({
      id: 'tilted', difficulty: 2,
      gen(r) {
        const b = r.pick([15, 25, 50, 60, 75]);
        const c2 = Math.cos(b * DEG) ** 2, s2 = 1 - c2, key = -c2 + 2 * s2;
        return {
          prompt: t`In the space around a star, as in the worked example ($K = -M/r^3$ for planes through $\hat e_r$, $+2M/r^3$ for the tangential plane, no mixed components), what is the sectional curvature of the plane spanned by $\hat e_\theta$ and $\cos\beta\,\hat e_r + \sin\beta\,\hat e_\varphi$ for $\beta = ${b}^\circ$? Give it in units of $M/r^3$.`,
          visual: tiltPic(b, t`The plane spanned by ê_θ and W, tilted by β = ${b}° from the radial direction.`),
          answer: key, tol: { rel: 0, abs: 0.005 },
          errors: [
            { value: 2 * c2 - s2, feedback: t`The two weights are swapped: $\beta = 0$ gives a plane through $\hat e_r$, where $K = -M/r^3$.` },
            { value: -Math.cos(b * DEG) + 2 * Math.sin(b * DEG), feedback: t`Riemann is quadratic in each vector: the weights are $\cos^2\beta$ and $\sin^2\beta$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02),
          hints: [t`$K = \cos^2\beta\,K_{r\theta} + \sin^2\beta\,K_{\theta\varphi}$ (the mixed term is zero).`],
          teach: 'With no mixed components, a tilted plane’s sectional curvature is a cos²/sin² blend of the frame planes’ values.',
          explain: t`$K = -\cos^2 ${b}^\circ + 2\sin^2 ${b}^\circ = ${nice(key, 4)}$, in units of $M/r^3$. ${key > 0 ? 'Positive: geodesics in this plane converge, as on a sphere.' : 'Negative: geodesics in this plane spread apart, as on a saddle.'}`,
        };
      },
    }),
    num({
      id: 'any-vectors', difficulty: 3,
      gen(r) {
        const k = r.pick([0.5, 1.5, 2, -1, -0.8]), [p, q] = r.pick([[2, 3], [1, 2], [3, 1], [-2, 1], [1, -3]]);
        const num0 = q * q * k, den = 1 * (p * p + q * q) - p * p, key = num0 / den;
        return {
          prompt: t`At a point of a surface (orthonormal coordinates there), $R_{1212} = ${k}\ \text{m}^{-2}$. Take $X = (1, 0)$ and $Y = (${p}, ${q})$. Compute $K(X, Y)$ from the formula, in $\text{m}^{-2}$.`,
          visual: { type: 'graph', params: { x: [-3.5, 4.5], y: [-3.6, 3.6], equal: true, axesAt: 'edge', xlabel: '', ylabel: '', arrows: [{ from: [0, 0], to: [1, 0], color: 'accent', width: 2.4, label: 'X' }, { from: [0, 0], to: [p, q], color: 'warn', width: 2.4, label: 'Y' }], curves: [{ param: [`1 + ${p}*t`, `${q}*t`], t: [0, 1], color: 'violet', width: 1.4, dash: [4, 3] }, { param: [`${p} + t`, `${q}`], t: [0, 1], color: 'violet', width: 1.4, dash: [4, 3] }] }, caption: 'X, Y and their parallelogram (dashed): the formula’s denominator is its squared area.' },
          answer: key, units: 'm^-2', tol: { rel: 0.005 },
          errors: [
            { value: num0, feedback: t`That is the numerator alone: divide by the squared area of the parallelogram, $g(X,X)g(Y,Y) - g(X,Y)^2 = ${den}$.` },
            { value: num0 / (p * p + q * q), feedback: t`$g(X,X)g(Y,Y) = ${p * p + q * q}$ is not the squared area unless $X \perp Y$; subtract $g(X,Y)^2 = ${p * p}$.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key)),
          hints: [t`In 2D, $R_{\mu\nu\rho\sigma}X^\mu Y^\nu X^\rho Y^\sigma = (X^1Y^2 - X^2Y^1)^2R_{1212}$.`, t`Numerator $= ${q}^2\times${k}$; denominator $= 1\cdot${p * p + q * q} - ${p}^2$.`],
          teach: 'Sectional curvature depends only on the plane: the parallelogram’s area cancels from top and bottom.',
          explain: t`Numerator $${nice(num0, 4)}$, denominator $${den}$: $K = ${nice(key, 4)}\ \text{m}^{-2} = R_{1212}$. On a surface every pair of independent vectors spans the same plane, so $K(X, Y) = K$ whatever $X$ and $Y$ are — the formula’s denominator is there to make that true.`,
        };
      },
    }),
    num({
      id: 'ricci-sum', difficulty: 2,
      gen(r) {
        const K12 = r.intExcept(-5, 5, [0]), K13 = r.intExcept(-5, 5, [0]), K23 = r.intExcept(-5, 5, [0, -K12 - K13]);
        const ask = r.pick(['R11', 'R']);
        const key = ask === 'R11' ? K12 + K13 : 2 * (K12 + K13 + K23);
        return {
          prompt: t`At a point of a three-dimensional space, an orthonormal frame $e_1, e_2, e_3$ has sectional curvatures $K(e_1, e_2) = ${K12}$, $K(e_1, e_3) = ${K13}$, $K(e_2, e_3) = ${K23}$ (in units of $10^{-3}\ \text{m}^{-2}$), and no mixed components. What is ${ask === 'R11' ? t`the Ricci component $R_{11} = R_{\mu\nu}e_1^\mu e_1^\nu$` : t`the Ricci scalar $R$`}, in the same units?`,
          visual: {
            type: 'calc-vectors3d',
            params: { range: 1.6, vectors: [{ to: [1.3, 0, 0], color: 'accent', label: 'e_1' }, { to: [0, 1.3, 0], color: 'teal', label: 'e_2' }, { to: [0, 0, 1.3], color: 'gold', label: 'e_3' }],
              parallelograms: [{ at: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0], color: 'accent', alpha: 0.2 }, { at: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1], color: 'gold', alpha: 0.2 }, { at: [0, 0, 0], u: [0, 1, 0], v: [0, 0, 1], color: 'teal', alpha: 0.2 }] },
            caption: 'The three coordinate planes of an orthonormal frame, each with its own sectional curvature.',
          },
          answer: key, tol: { rel: 0, abs: 0.01 },
          errors: ask === 'R11'
            ? [{ value: K12 + K13 + K23, feedback: t`$R_{11}$ sums only the planes that contain $e_1$: $K(e_1, e_2) + K(e_1, e_3)$.` }].filter((e) => e.value !== key)
            : [{ value: K12 + K13 + K23, feedback: t`$R = \sum_i R_{ii}$ counts each plane twice (once from each of its directions).` }],
          hints: [ask === 'R11' ? t`$R_{11} = \sum_{i\ne1}K(e_1, e_i)$.` : t`$R = R_{11} + R_{22} + R_{33}$, and each $R_{ii}$ is a sum of sectional curvatures.`],
          teach: 'Ricci in a direction sums the sectional curvatures of the planes containing it; R sums every plane twice.',
          explain: ask === 'R11'
            ? t`$R_{11} = ${K12} + (${K13}) = ${key}$. The plane $e_2e_3$ does not contain $e_1$ and does not enter.`
            : t`$R = 2(${K12} + (${K13}) + (${K23})) = ${key}$, in units of $10^{-3}\ \text{m}^{-2}$.`,
        };
      },
    }),
    mcq({
      id: 'constant', difficulty: 2,
      prompt: t`In a space, every plane at every point has the same sectional curvature $\kappa$. What is its Riemann tensor?`,
      visual: { type: 'gr-surface', params: { mode: 'loop', surface: 'sphere', v: 1.0, controls: false, readout: false }, caption: 'A small loop on a sphere: on a round sphere every point and every direction look alike.' },
      choices: [
        t`$R_{\rho\sigma\mu\nu} = \kappa(g_{\rho\mu}g_{\sigma\nu} - g_{\rho\nu}g_{\sigma\mu})$`,
        t`$R_{\rho\sigma\mu\nu} = \kappa\,g_{\rho\sigma}g_{\mu\nu}$`,
        t`$R_{\rho\sigma\mu\nu} = 0$, because a constant curvature can be transformed away`,
        t`$R_{\rho\sigma\mu\nu} = \kappa(g_{\rho\mu}g_{\sigma\nu} + g_{\rho\nu}g_{\sigma\mu})$`,
      ],
      answer: 0,
      why: {
        1: t`$g_{\rho\sigma}g_{\mu\nu}$ is symmetric in $\rho\sigma$; Riemann must be antisymmetric there.`,
        2: 'Curvature is a tensor: no coordinates remove it. Only the Christoffels can be removed at a point.',
        3: 'With a plus sign the tensor is symmetric in each pair, the opposite of what Riemann needs.',
      },
      hints: [t`Which combination of two metrics is antisymmetric in $\rho\sigma$ and in $\mu\nu$? Feed it $X, Y, X, Y$ and check that it gives $\kappa$ times the parallelogram’s squared area.`],
      teach: 'Constant sectional curvature means Riemann is κ times the one antisymmetric combination of metrics.',
      explain: t`$\kappa(g_{\rho\mu}g_{\sigma\nu} - g_{\rho\nu}g_{\sigma\mu})X^\rho Y^\sigma X^\mu Y^\nu = \kappa\big(g(X,X)g(Y,Y) - g(X,Y)^2\big)$, so every plane gets $K = \kappa$. Spheres ($\kappa > 0$), flat space and hyperbolic space in any dimension are the examples — and, in spacetime, de Sitter and anti-de Sitter.`,
    }),
    mcq({
      id: 'timelike', difficulty: 3,
      prompt: t`In Schwarzschild spacetime the timelike plane spanned by $\hat e_t$ and $\hat e_r$ has sectional curvature $K = +2M/r^3$ (the denominator $g(\hat e_t, \hat e_t)g(\hat e_r, \hat e_r) = -1$ is negative). What happens to two particles released at rest, one slightly above the other?`,
      visual: { type: 'gr-dustball', params: { mode: 'tides', body: 'bh', t: 0, readout: false, views: 'side', arrows: false, play: false }, caption: 'A ball of dust about to be released at rest near a black hole (side view, the mass to the left). What shape will it take?' },
      choices: [
        'They drift apart: for a timelike plane, positive K stretches',
        'They drift together, as geodesics do on a sphere',
        'Nothing: sectional curvature of a timelike plane has no effect on particles',
        'They drift apart because K is negative here',
      ],
      answer: 0,
      why: {
        1: t`On a sphere, positive $K$ focuses. In a timelike plane the negative denominator flips the sign: $\ddot\xi = +K\xi$.`,
        2: 'This plane contains the particles’ own direction in time: it is exactly the plane tides act in.',
        3: t`$K$ is $+2M/r^3$, positive. The stretching comes from the sign of the denominator, not of $K$.`,
      },
      hints: [t`For a spacelike plane, separations obey $\ddot\xi = -K\xi$. Here the plane contains time, and $g(\hat e_t, \hat e_t) = -1$.`, t`Geodesic deviation (C17.1) gives $\ddot\xi^{\hat r} = -R^{\hat r}{}_{\hat t\hat r\hat t}\,\xi^{\hat r} = +K\,\xi^{\hat r}$.`],
      teach: 'In a timelike plane a positive sectional curvature stretches: the sign flips with the metric’s time sign.',
      explain: t`$\ddot\xi = +\dfrac{2M}{r^3}\xi$: the radial tide. The planes $(\hat e_t, \hat e_\theta)$ and $(\hat e_t, \hat e_\varphi)$ have $K = -M/r^3$ and squeeze. In 1+1 de Sitter, $K = H^2 > 0$ makes comoving galaxies separate (C18.3).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-earth-space', difficulty: 3, transfer: true,
      gen(r) {
        const [what, rk] = r.pick([['at the Earth’s surface (radius 6371 km)', 6371], ['at the height of the International Space Station (orbit radius 6791 km)', 6791], ['at GPS orbit radius (26 560 km)', 26560], ['at geostationary orbit radius (42 164 km)', 42164]]);
        const M = GM_EARTH / (C * C), rr = rk * 1e3, K = (2 * M) / rr ** 3, Rc = 1 / Math.sqrt(K) / AU;
        return {
          prompt: t`The space around the Earth (a slice $t = \text{const}$ of the Schwarzschild geometry, $M = GM_\oplus/c^2 = 4.435$ mm) has sectional curvature $2M/r^3$ for the plane tangent to the sphere of radius $r$. ${what[0].toUpperCase() + what.slice(1)}, a plane of that curvature curves like a sphere of what radius $1/\sqrt K$, in astronomical units ($1\ \text{AU} = 1.496\times10^{11}$ m)?`,
          visual: tiltPic(90, 'The tangential plane (spanned by ê_θ and ê_φ) at a point above the Earth.'),
          answer: Rc, units: 'AU', tol: { rel: 0.01 },
          errors: [
            { value: Rc * Math.sqrt(2), feedback: t`The tangential plane has $K = 2M/r^3$; $M/r^3$ is the size of the radial planes’ value.` },
            { value: (1 / K) / AU, feedback: t`$1/K$ is a squared length: take the square root.` },
          ].filter((e) => Math.abs(e.value - Rc) > 0.02 * Rc),
          hints: [t`$K = 2M/r^3$ with $M = 4.435\times10^{-3}$ m and $r$ in metres.`, t`$K = ${tex(K, 3)}\ \text{m}^{-2}$; then $1/\sqrt K$ in metres, divided by $1.496\times10^{11}$.`],
          teach: 'The spatial curvature near a planet is minute: its radius of curvature is far larger than the planet’s orbit around the Sun.',
          explain: t`$K = 2\times4.435\times10^{-3}/(${tex(rr, 4)})^3 = ${tex(K, 3)}\ \text{m}^{-2}$, so $1/\sqrt K = ${tex(1 / Math.sqrt(K), 3)}$ m $= ${nice(Rc, 3)}$ AU. That is the curvature of *space*; the curvature that makes things fall is mostly the time–space kind, and Gravity Probe B’s geodetic precession measured the two together. This "radius" is a way to state a curvature, not the size of anything real.`,
        };
      },
    }),
    num({
      id: 'cp-diagonal-plane', difficulty: 3,
      gen(r) {
        const [p, q] = r.pick([[1, 1], [1, 2], [2, 1], [1, 3], [3, 2]]);
        const key = (p * p * -1 + q * q * 2) / (p * p + q * q);
        return {
          prompt: t`Around a star, as before ($K_{r\theta} = K_{r\varphi} = -M/r^3$, $K_{\theta\varphi} = +2M/r^3$, no mixed components), find the sectional curvature of the plane spanned by $X = ${p === 1 ? '' : p}\hat e_r + ${q === 1 ? '' : q}\hat e_\varphi$ and $Y = \hat e_\theta$, in units of $M/r^3$.`,
          visual: tiltPic(Math.atan2(q, p) / DEG, 'The plane spanned by ê_θ and X, which leans between the radial direction and ê_φ.'),
          answer: key, tol: { rel: 0, abs: 0.005 },
          errors: [
            { value: -p * p + 2 * q * q, feedback: t`Divide by the parallelogram’s squared area, $g(X,X)g(Y,Y) - g(X,Y)^2 = ${p * p + q * q}$.` },
            { value: (-p + 2 * q) / Math.hypot(p, q), feedback: 'Riemann is quadratic in X: the weights are the squares of its components.' },
          ].filter((e) => Math.abs(e.value - key) > 0.02),
          hints: [t`Numerator: $R(X, Y, X, Y) = ${p * p}K_{r\theta} + ${q * q}K_{\varphi\theta}$ (in an orthonormal frame, with no mixed terms).`, t`Denominator: $|X|^2|Y|^2 - (X\cdot Y)^2 = ${p * p + q * q}\cdot1 - 0$.`],
          teach: 'Normalize: the sectional curvature divides by the squared area, so only the plane’s direction matters.',
          explain: t`$K = \dfrac{${p * p}(-1) + ${q * q}(2)}{${p * p + q * q}} = ${nice(key, 4)}$ in units of $M/r^3$ — the same as for the unit vector $(\hat e_r\cos\beta + \hat e_\varphi\sin\beta)$ with $\tan\beta = ${q}/${p}$.`,
        };
      },
    }),
    multi({
      id: 'cp-facts', difficulty: 3,
      prompt: t`Which statements about sectional curvature are true? Select all that are.`,
      visual: tiltPic(60, 'A plane at a point of a 3D space, spanned by ê_θ and a direction between ê_r and ê_φ.'),
      choices: [
        t`$K(X, Y) = K(2X + Y,\ Y)$`,
        'Knowing K for every plane at a point determines the whole Riemann tensor there',
        'The Ricci scalar is zero only if every sectional curvature is zero',
        'In two dimensions there is one plane at each point, and its K is the Gaussian curvature',
        'K is the same for every plane at a point in any 3D space',
      ],
      answer: [0, 1, 3],
      why: {
        2: 'The space around a star has R = 0 with sectional curvatures −M/r³ and +2M/r³.',
        4: 'Only in maximally symmetric spaces (or at isotropic points); around a star it ranges from −M/r³ to +2M/r³.',
      },
      hints: ['K depends on the plane, not on the vectors spanning it.', 'Remember the worked example’s scalar R.'],
      teach: 'Sectional curvature is a function on planes; it determines Riemann, and R is (twice) its sum over an orthonormal frame.',
      explain: t`$2X + Y$ and $Y$ span the same plane as $X$ and $Y$. Riemann can be rebuilt from $K$ on all planes (by polarization), and on a surface the single plane gives $K$ itself. $R$ is a sum and can vanish with non-zero terms.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Riemannian Geometry, ch. 4 (sectional curvature; constant curvature)', url: 'https://link.springer.com/book/9780817634902' },
    { label: 'Carroll, Spacetime and Geometry, §3.9 and §5.2 (maximally symmetric spaces; the Schwarzschild solution)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
