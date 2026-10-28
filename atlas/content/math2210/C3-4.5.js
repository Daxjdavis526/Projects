// Triple integrals in cylindrical and spherical coordinates: dV = ρ dρ dφ dz
// and dV = r² sin θ dr dθ dφ, in the physics convention of lesson C3-1.5
// (θ down from +z, φ the azimuth). Balls and cones as boxes in (r, θ, φ), the
// mass of a planet whose density varies with depth, and the shell factor 4πv²
// behind the Maxwell speed distribution.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { r6 } from './_integrals.js';

const t = String.raw;

// physical constants (CODATA 2018) and data (NASA planetary fact sheets)
const KB = 1.380649e-23, U = 1.66053906660e-27;
const R_EARTH = 6.371e6, M_EARTH = 5.9722e24, R_MARS = 3.3895e6, M_MARS = 6.4171e23;

// the solid 0 ≤ r ≤ R, 0 ≤ θ ≤ θ₀, 0 ≤ φ ≤ φ₀ as a wireframe for calc-vectors3d. R, th, ph are
// expressions (θ₀ and φ₀ in radians); n: how many grid curves on the cap.
function wedge(R, th, ph, { n = 4, cone = 'violet', cap = 'accent' } = {}) {
  const curves = [];
  for (let k = 1; k <= n; k++) { const f = r6(k / n); curves.push({ param: [`(${R})*sin(${f}*(${th}))*cos(t)`, `(${R})*sin(${f}*(${th}))*sin(t)`, `(${R})*cos(${f}*(${th}))`], t: [0, ph], color: cap, width: k === n ? 2.2 : 1.1 }); }
  for (let k = 0; k <= 6; k++) {
    const f = r6(k / 6), edge = k === 0 || k === 6;
    curves.push({ param: [`(${R})*sin(t)*cos(${f}*(${ph}))`, `(${R})*sin(t)*sin(${f}*(${ph}))`, `(${R})*cos(t)`], t: [0, th], color: cap, width: edge ? 2.2 : 1.1 });
    curves.push({ param: [`t*(${R})*sin(${th})*cos(${f}*(${ph}))`, `t*(${R})*sin(${th})*sin(${f}*(${ph}))`, `t*(${R})*cos(${th})`], t: [0, 1], color: cone, width: edge ? 1.8 : 0.9 });
  }
  for (const f of [0, 1]) curves.push({ param: [`0.5*(${R})*sin(t)*cos(${f}*(${ph}))`, `0.5*(${R})*sin(t)*sin(${f}*(${ph}))`, `0.5*(${R})*cos(t)`], t: [0, th], color: cone, width: 1, dash: true });
  return { curves, segments: [{ from: [0, 0, 0], to: [0, 0, R], color: cone, width: 1.8 }] };
}
const scene = (params, caption) => ({ type: 'calc-vectors3d', params: { grid: false, ...params }, caption });
// the edges of the spherical box r1 ≤ r ≤ r2, t1 ≤ θ ≤ t2, p1 ≤ φ ≤ p2 (numbers), as calc-vectors3d curves
function sphBox(r1, r2, t1, t2, p1, p2, color = 'gold') {
  const P = (r, th, ph) => [r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)].map(r6);
  const curves = [];
  for (const th of [t1, t2]) for (const ph of [p1, p2]) curves.push({ param: [`t*${r6(Math.sin(th) * Math.cos(ph))}`, `t*${r6(Math.sin(th) * Math.sin(ph))}`, `t*${r6(Math.cos(th))}`], t: [r1, r2], color, width: 2 });
  for (const r of [r1, r2]) for (const ph of [p1, p2]) curves.push({ param: [`${r}*sin(t)*${r6(Math.cos(ph))}`, `${r}*sin(t)*${r6(Math.sin(ph))}`, `${r}*cos(t)`], t: [t1, t2], color, width: 2 });
  for (const r of [r1, r2]) for (const th of [t1, t2]) curves.push({ param: [`${r6(r * Math.sin(th))}*cos(t)`, `${r6(r * Math.sin(th))}*sin(t)`, `${r6(r * Math.cos(th))}`], t: [p1, p2], color, width: 2 });
  curves.push({ param: [`${r6(r2 * Math.sin(t1))}*cos(t)`, `${r6(r2 * Math.sin(t1))}*sin(t)`, `${r6(r2 * Math.cos(t1))}`], t: [0, 6.2832], color: 'ink3', width: 1, dash: true });
  return { curves, segments: [{ from: [0, 0, 0], to: P(r1, t1, p1), color: 'ink3', dash: true }, { from: [0, 0, 0], to: P(r1, t2, p1), color: 'ink3', dash: true }] };
}
// √h as TeX: an integer when h is a perfect square
const rootTeX = (h) => (Number.isInteger(Math.sqrt(h)) ? String(Math.sqrt(h)) : t`\sqrt{${h}}`);

export default lesson({
  id: 'math2210.C3-4.5',
  title: 'Triple integrals in cylindrical and spherical coordinates',
  minutes: 13, difficulty: 3,
  intro: t`Integrals over cylinders, cones and balls are easiest in the coordinates that fit them — provided the volume element comes too. In **cylindrical** coordinates $(\rho, \phi, z)$ the small coordinate box has edges $d\rho$, $\rho\,d\phi$ and $dz$; in **spherical** coordinates $(r, \theta, \phi)$ its edges are $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$. So

$$dV = \rho\,d\rho\,d\phi\,dz \qquad\qquad dV = r^2\sin\theta\,dr\,d\theta\,d\phi$$

Here, as in lesson C3-1.5, $\theta$ is the **polar angle**, measured down from the $+z$-axis ($0$ to $\pi$), and $\phi$ the **azimuth**, measured around from $+x$ ($0$ to $2\pi$). **Many calculus texts, OpenStax and Stewart among them, swap the two angle names and call the radius $\rho$, writing $\rho^2\sin\phi\,d\rho\,d\phi\,d\theta$.** The box is the same; only the labels move. Dropping the $r^2\sin\theta$ — or putting the $2\pi$ on the wrong angle — is the classic mistake.`,
  symbols: [
    { tex: '\\rho,\\ \\phi,\\ z', text: t`cylindrical coordinates: distance from the $z$-axis, azimuth, height` },
    { tex: 'r,\\ \\theta,\\ \\phi', text: t`spherical coordinates: distance from the origin; polar angle from $+z$, $0 \le \theta \le \pi$; azimuth, $0 \le \phi < 2\pi$` },
    { tex: '\\rho\\,d\\rho\\,d\\phi\\,dz', text: t`the cylindrical volume element: polar coordinates' $\rho\,d\rho\,d\phi$ times the height $dz$` },
    { tex: 'r^2\\sin\\theta\\,dr\\,d\\theta\\,d\\phi', text: t`the spherical volume element: the box $dr \times r\,d\theta \times r\sin\theta\,d\phi$. The $\sin\theta$ shrinks it near the poles, where circles of latitude are small` },
    { tex: 'E', text: t`the solid. A ball of radius $R$ is the "box" $0 \le r \le R$, $0 \le \theta \le \pi$, $0 \le \phi \le 2\pi$` },
  ],
  why: t`Planets, stars, atoms and black holes are round: their masses, charges and moments of inertia, and the normalisation of every spherically symmetric quantity — from the hydrogen atom to the Maxwell speed distribution — are spherical-coordinate integrals.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'A ball is a box in spherical coordinates',
    lead: t`The solid $0 \le r \le R$, $0 \le \theta \le \theta_0$, $0 \le \phi \le \phi_0$: a box in $(r, \theta, \phi)$, though in space it is a cone with a spherical cap, cut by two half-planes. Because its limits are constants and $dV = r^2\sin\theta\,dr\,d\theta\,d\phi$ is a product, its volume is a product of three single integrals — the three readouts.`,
    tasks: [
      t`Set $\theta_0 = 180^\circ$ and $\phi_0 = 360^\circ$: the whole ball. The factors are $\tfrac{R^3}{3}$, $2$ and $2\pi$, and their product is $\tfrac43\pi R^3$.`,
      t`Set $\theta_0 = 90^\circ$ for a hemisphere, then $30^\circ$ for an ice-cream cone: $1 - \cos 30^\circ \approx 0.134$, so the cone holds $6.7\%$ of the ball.`,
      t`Equal angles do not cut equal volumes: from $\theta = 0$ to $30^\circ$ holds $6.7\%$ of the ball, but from $60^\circ$ to $90^\circ$ it holds $25\%$ — the $\sin\theta$ in $dV$. Try $\theta_0 = 60^\circ$ and $90^\circ$ and compare.`,
    ],
    params: {
      range: 2.6, scale: 1.45, grid: false,
      sliders: [
        { key: 'R', label: 'Radius $R$', min: 0.5, max: 2.2, step: 0.05, value: 2, explain: 'The outer limit of $r$.' },
        { key: 'th0', label: '$\\theta_0$', min: 5, max: 180, step: 5, value: 60, unit: '^\\circ', explain: 'The polar angle runs from $0$ (the $+z$-axis) to $\\theta_0$: the cone’s half-angle.' },
        { key: 'ph0', label: '$\\phi_0$', min: 10, max: 360, step: 10, value: 270, unit: '^\\circ', explain: 'The azimuth runs from $0$ to $\\phi_0$: how far round the solid reaches.' },
      ],
      ...wedge('R', 'th0*pi/180', 'ph0*pi/180'),
      readouts: [
        { label: '$\\int_0^R r^2\\,dr$', expr: 'R^3/3', digits: 3 },
        { label: '$\\int_0^{\\theta_0}\\sin\\theta\\,d\\theta$', expr: '1 - cos(th0*pi/180)', digits: 3 },
        { label: '$\\int_0^{\\phi_0} d\\phi$', expr: 'ph0*pi/180', digits: 3 },
        { label: 'volume', expr: '(R^3/3)*(1 - cos(th0*pi/180))*(ph0*pi/180)', digits: 4 },
        { label: 'share of the ball', expr: '(1 - cos(th0*pi/180))*(ph0/360)/2', digits: 3 },
      ],
    },
    caption: 'Drag to rotate. Blue: the spherical cap r = R; violet: the cone θ = θ₀ and the edges of the two half-planes φ = 0 and φ = φ₀. A wireframe, to scale.',
  },
  example: {
    prompt: t`(a) Find the volume of a ball of radius $R$. (b) Model Earth's density as falling linearly from $\rho_c = 13\,000$ kg/m³ at the centre to $\rho_s = 3000$ kg/m³ at the surface, $R = 6371$ km: $\rho(r) = \rho_c - (\rho_c - \rho_s)\,r/R$. Find Earth's mass.`,
    visual: { type: 'graph', params: { x: [0, 1.04], y: [-0.05, 1.12], aspect: 'wide', xlabel: 'r / R', ylabel: '', curves: [{ fn: '1 - 10*x/13', domain: [0, 1], color: 'accent', label: 'density ρ(r) / ρc', labelAt: 0.12, labelDx: 6, labelDy: -12 }, { fn: 'x^2*(13 - 10*x)/3.25481', domain: [0, 1], color: 'gold', label: 'mass per shell, 4πr²ρ (scaled)', labelAt: 0.3, labelDx: 10, labelDy: 14 }] }, caption: t`The linear model of Earth (blue) and the mass in each thin shell, $4\pi r^2\rho(r)\,dr$ (gold, scaled to peak at 1). The density is greatest at the centre, but the shells there are tiny. A teaching model: the real Earth's density jumps at the core–mantle boundary.` },
    steps: [
      { label: 'The ball is a box', text: t`$0 \le r \le R$, $0 \le \theta \le \pi$, $0 \le \phi \le 2\pi$, and the integrand factors:
$$V = \int_0^{2\pi}\!\!d\phi\int_0^{\pi}\!\sin\theta\,d\theta\int_0^R\! r^2\,dr = 2\pi\cdot2\cdot\frac{R^3}{3} = \frac43\pi R^3.$$` },
      { label: 'Spherical symmetry', text: t`When $\rho$ depends on $r$ alone, the angular integrals give $4\pi$ whatever $\rho$ is: $M = \displaystyle\int_0^R \rho(r)\,4\pi r^2\,dr$. Each thin **shell** has volume $4\pi r^2\,dr$.` },
      { label: 'Integrate the model', text: t`$\displaystyle\int_0^R \left(\rho_c - (\rho_c - \rho_s)\frac{r}{R}\right) r^2\,dr = R^3\left(\frac{\rho_c}{3} - \frac{\rho_c - \rho_s}{4}\right) = R^3\,(4333 - 2500) = 1833\,R^3$ kg/m³.` },
      { label: 'The number', text: t`$M = 4\pi\times1833\times(6.371\times10^6\ \text{m})^3 = 4\pi\times1833\times2.586\times10^{20} \approx 5.96\times10^{24}$ kg.` },
      { label: 'Sense check', text: t`The measured mass is $5.972\times10^{24}$ kg: the model is within $0.3\%$. A uniform Earth of surface rock, $3000$ kg/m³, would have only half the mass — which is how the first measurements of Earth's mean density, $5513$ kg/m³, revealed a dense interior.` },
    ],
    answer: t`(a) $V = \tfrac43\pi R^3$. (b) $M \approx 5.96\times10^{24}$ kg, against $5.97\times10^{24}$ kg measured.`,
  },
  practice: [
    mcq({
      id: 'dV', difficulty: 1,
      prompt: t`In spherical coordinates — $\theta$ measured from the $+z$-axis, $\phi$ around it — the volume element is:`,
      choices: [t`$r^2\sin\theta\,dr\,d\theta\,d\phi$`, t`$r\sin\theta\,dr\,d\theta\,d\phi$`, t`$r^2\cos\theta\,dr\,d\theta\,d\phi$`, t`$dr\,d\theta\,d\phi$`],
      answer: 0,
      why: {
        1: t`One $r$ short. The box's edges are $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$: two of them carry an $r$.`,
        2: t`A cosine belongs to an angle measured up from the equator — latitude. With $\theta$ measured down from the pole, circles of constant $\theta$ have radius $r\sin\theta$.`,
        3: t`Angles are not lengths: the box's edges are $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$, not $dr$, $d\theta$, $d\phi$.`,
      },
      hints: [t`List the box's three edge lengths: a step $dr$ along the radius, a step $d\theta$ along a meridian, a step $d\phi$ along a circle of latitude.`],
      teach: 'The spherical box has edges dr, r dθ and r sin θ dφ, so dV = r² sin θ dr dθ dφ.',
      explain: t`$dr \times r\,d\theta \times r\sin\theta\,d\phi = r^2\sin\theta\,dr\,d\theta\,d\phi$. The circle of latitude at polar angle $\theta$ has radius $r\sin\theta$, which is why the box thins out toward the poles.`,
      visual: scene({ range: 2.6, scale: 1.5, ...sphBox(1.4, 2.1, 0.75, 1.05, 0.3, 0.75) }, t`A small spherical box: $r$ from $1.4$ to $2.1$, $\theta$ (down from $+z$) from $43^\circ$ to $60^\circ$, $\phi$ from $17^\circ$ to $43^\circ$, with the circle of latitude through its top corner (dashed). Drag to rotate.`),
    }),
    num({
      id: 'paraboloid', difficulty: 2,
      gen(r) {
        const h = r.pick([1, 2, 3, 4]);
        const V = (Math.PI * h * h) / 2;
        return {
          prompt: t`Find the volume of the solid inside the paraboloid $z = x^2 + y^2$ and below the plane $z = ${h}$.`,
          answer: V, tol: { rel: 1e-3 },
          integrand: `2*pi*(${h} - x^2)*x`, limits: [0, Math.sqrt(h)],
          errors: [
            { value: Math.PI * h * h, feedback: t`That is the whole cylinder of radius $${rootTeX(h)}$ and height $${h}$. The solid lies above the paraboloid, $z \ge \rho^2$.` },
            { value: ((4 * Math.PI) / 3) * h ** 1.5, feedback: t`That integrates $(${h} - \rho^2)\,d\rho\,d\phi$: the cylindrical volume element is $\rho\,d\rho\,d\phi\,dz$.` },
          ],
          hints: [t`In cylindrical coordinates the paraboloid is $z = \rho^2$. Each column runs from $z = \rho^2$ up to $z = ${h}$, for $0 \le \rho \le ${rootTeX(h)}$.`, t`$V = \displaystyle\int_0^{2\pi}\!\!\int_0^{${rootTeX(h)}} (${h} - \rho^2)\,\rho\,d\rho\,d\phi$.`],
          teach: 'Cylindrical coordinates turn x² + y² into ρ², and dV keeps the factor ρ from polar coordinates.',
          explain: t`$2\pi\displaystyle\int_0^{${rootTeX(h)}} (${h}\rho - \rho^3)\,d\rho = 2\pi\left(\frac{${h * h}}{2} - \frac{${h * h}}{4}\right) = \frac{\pi\cdot${h * h}}{2} \approx ${fmt(V, 4)}$ — exactly half of the cylinder that encloses it, as Archimedes knew.`,
          visual: { type: 'surface3d', params: { surface: [`${r6(Math.sqrt(h))}*u*cos(v)`, `${r6(Math.sqrt(h))}*u*sin(v)`, `${r6(2.2 / h)}*${h}*u^2`], domain: [[0, 1], [0, 6.2832]], n: 36, axisLen: 2.8, dist: 8, pitch: 0.4, yaw: 0.6, curves: [{ param: [`${r6(Math.sqrt(h))}*cos(t)`, `${r6(Math.sqrt(h))}*sin(t)`, '2.2'], t: [0, 6.2832], color: 'gold', width: 2.6 }] }, caption: t`The paraboloid $z = x^2 + y^2$ up to the plane $z = ${h}$, where it meets the gold circle (heights scaled to fit). The solid fills the cup. Drag to rotate.` },
        };
      },
    }),
    num({
      id: 'cone', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]);
        const [th, tht, deg] = r.pick([[Math.PI / 6, t`\tfrac{\pi}{6}`, 30], [Math.PI / 4, t`\tfrac{\pi}{4}`, 45], [Math.PI / 3, t`\tfrac{\pi}{3}`, 60]]);
        const V = ((2 * Math.PI * a ** 3) / 3) * (1 - Math.cos(th));
        return {
          prompt: t`An "ice-cream cone" is the solid inside the sphere $r = ${a}$ and inside the cone $\theta = ${tht}$ (that is, $0 \le \theta \le ${tht}$). Find its volume.`,
          answer: V, tol: { rel: 1e-3 },
          vars: ['x'], integrand: `2*pi*${a ** 3}/3*sin(x)`, limits: [0, th],
          errors: [
            { value: ((2 * Math.PI * a ** 3) / 3) * th, feedback: t`You dropped the $\sin\theta$ from $dV$: $\int_0^{${tht}} \sin\theta\,d\theta = 1 - \cos${tht}$.` },
            { value: ((2 * Math.PI * a ** 3) / 3) * Math.sin(th), feedback: t`That integrates $\cos\theta$. With $\theta$ measured from the $z$-axis, $dV$ carries $\sin\theta$.` },
          ],
          hints: [t`The solid is the box $0 \le r \le ${a}$, $0 \le \theta \le ${tht}$, $0 \le \phi \le 2\pi$.`, t`$V = 2\pi\left(\int_0^{${tht}}\sin\theta\,d\theta\right)\left(\int_0^{${a}} r^2\,dr\right)$.`],
          teach: 'A cone with a spherical cap is a box in spherical coordinates: its volume is a product of three single integrals.',
          explain: t`$V = 2\pi\,\big(1 - \cos${tht}\big)\,\frac{${a}^3}{3} \approx ${fmt(V, 4)}$, which is $${fmt((100 * (1 - Math.cos(th))) / 2, 3)}\%$ of the whole ball.`,
          visual: scene({ range: a + 0.5, scale: 1.4, ...wedge(String(a), String(r6(th)), '6.2832', { n: 4 }), points: [{ at: [0, 0, a], color: 'accent', r: 0.01, label: `r = ${a}` }] }, t`The solid $0 \le r \le ${a}$, $0 \le \theta \le ${deg}^\circ$: a cone with a spherical cap. Drag to rotate.`),
        };
      },
    }),
    num({
      id: 'ball-r2', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]);
        const I = (4 * Math.PI * R ** 5) / 5;
        return {
          prompt: t`Evaluate $\displaystyle\iiint_B (x^2 + y^2 + z^2)\,dV$ over the ball $B$ of radius $${R}$ centred at the origin.`,
          answer: I, tol: { rel: 1e-3 },
          vars: ['x'], integrand: `4*pi*x^4`, limits: [0, R],
          errors: [
            { value: (4 * Math.PI * R ** 3) / 3, feedback: t`That integrates $r^2\sin\theta\,dr\,d\theta\,d\phi$ — the integrand $r^2$ times only part of $dV$. With $dV$'s own $r^2$, the radial integral is $\int r^4\,dr$.` },
            { value: (2 * Math.PI * Math.PI * R ** 5) / 5, feedback: t`$\int_0^\pi \sin\theta\,d\theta = 2$, not $\pi$: the $\sin\theta$ from $dV$ must be integrated too.` },
          ],
          hints: [t`$x^2 + y^2 + z^2 = r^2$, and $dV = r^2\sin\theta\,dr\,d\theta\,d\phi$.`, t`$\displaystyle\int_0^{2\pi}\!\!\int_0^\pi\!\!\int_0^{${R}} r^4\sin\theta\,dr\,d\theta\,d\phi = 4\pi\cdot\frac{${R}^5}{5}$.`],
          teach: 'For a spherically symmetric integrand, the angles give 4π and what is left is ∫ f(r) r² dr.',
          explain: t`$4\pi\displaystyle\int_0^{${R}} r^4\,dr = \frac{4\pi\cdot${R ** 5}}{5} \approx ${fmt(I, 4)}$. Times a density, $\iiint r^2\,\rho\,dV$ is the quantity behind a ball's moment of inertia — lesson C3-4.7.`,
          visual: scene({ range: R + 0.6, spheres: [{ centre: [0, 0, 0], radius: R, color: 'teal' }, { centre: [0, 0, 0], radius: r6(0.6 * R), color: 'teal' }], vectors: [{ to: [r6(0.6 * R * 0.55), r6(0.6 * R * 0.45), r6(0.6 * R * 0.7)], color: 'gold', label: '\\vec r' }] }, t`The ball of radius $${R}$ (three great circles) and one inner shell; the integrand is $|\vec r|^2 = r^2$. Drag to rotate.`),
        };
      },
    }),
    mcq({
      id: 'cone-limits', difficulty: 2,
      prompt: t`$E$ is the solid inside the sphere $x^2 + y^2 + z^2 = 4$ and above the cone $z = \sqrt{x^2 + y^2}$. Which spherical limits describe it?`,
      choices: [
        t`$0 \le r \le 2$, $\ 0 \le \theta \le \tfrac{\pi}{4}$, $\ 0 \le \phi \le 2\pi$`,
        t`$0 \le r \le 2$, $\ \tfrac{\pi}{4} \le \theta \le \tfrac{\pi}{2}$, $\ 0 \le \phi \le 2\pi$`,
        t`$0 \le r \le 4$, $\ 0 \le \theta \le \tfrac{\pi}{4}$, $\ 0 \le \phi \le 2\pi$`,
        t`$0 \le r \le 2$, $\ 0 \le \theta \le 2\pi$, $\ 0 \le \phi \le \tfrac{\pi}{4}$`,
      ],
      answer: 0,
      why: {
        1: t`That is the region below the cone, between it and the $xy$-plane. Above the cone means closer to the $+z$-axis: smaller $\theta$.`,
        2: t`The sphere $x^2 + y^2 + z^2 = 4$ has radius $2$, not $4$.`,
        3: t`That is the calculus-text convention mixed into ours: here $\theta$ (from the $z$-axis) is the cone's angle and $\phi$ goes all the way round.`,
      },
      hints: [t`On the cone $z = \sqrt{x^2 + y^2}$, $r\cos\theta = r\sin\theta$. What is $\theta$ there?`, t`The cone is $\theta = \tfrac{\pi}{4}$; "above" it means $\theta$ smaller than that.`],
      teach: 'In spherical coordinates a cone about the z-axis is θ = constant, and "inside the cone, above the vertex" means 0 ≤ θ ≤ that constant.',
      explain: t`$z = \sqrt{x^2 + y^2}$ means $\cos\theta = \sin\theta$, so the cone is $\theta = \tfrac{\pi}{4}$. The solid above it and inside the sphere is $0 \le r \le 2$, $0 \le \theta \le \tfrac{\pi}{4}$, all the way round in $\phi$. Its volume is $\tfrac{16\pi}{3}\left(1 - \tfrac{\sqrt2}{2}\right) \approx 4.91$.`,
      visual: scene({ range: 2.5, scale: 1.4, ...wedge('2', '0.7854', '6.2832', { n: 4 }) }, 'The sphere of radius 2 cut by the cone z = √(x² + y²): one of the regions it bounds. Drag to rotate.'),
    }),
    mcq({
      id: 'swapped', difficulty: 3, kind: 'error',
      prompt: t`A student mixes a calculus text's formula with this course's names and writes the volume of a ball of radius $R$ as
$$\int_0^{\pi}\!\!\int_0^{2\pi}\!\!\int_0^{R} r^2\sin\theta\,dr\,d\theta\,d\phi.$$
It comes out as $0$. What went wrong?`,
      choices: [
        t`The angle ranges are swapped: $\theta$, the angle in $\sin\theta$, runs from $0$ to $\pi$ (pole to pole), and $\phi$ from $0$ to $2\pi$. Over $0 \le \theta \le 2\pi$, $\sin\theta$ cancels itself`,
        t`$\sin\theta$ should be $\cos\theta$`,
        t`$r^2$ should be $r$`,
        'Nothing: by symmetry, a volume integral over a ball is 0',
      ],
      answer: 0,
      why: {
        1: t`With $\cos\theta$ the $\theta$-integral over $[0, 2\pi]$ is still $0$, and over $[0, \pi]$ it is $0$ too: the problem is the ranges.`,
        2: t`With $r$ the radial factor changes to $\tfrac{R^2}{2}$, but the angular factor is still $0$.`,
        3: t`Volume is the integral of $1$, which is never negative: it cannot cancel. Integrals of odd functions like $z$ vanish by symmetry; volume does not.`,
      },
      hints: [t`Which angle is integrated over $[0, 2\pi]$ here, and what is $\int_0^{2\pi}\sin\theta\,d\theta$?`, t`The polar angle sweeps from the north pole to the south pole only: $0 \le \theta \le \pi$. The azimuth goes all the way round.`],
      teach: 'The angle in sin θ — the one measured from the pole — runs from 0 to π; the azimuth runs from 0 to 2π.',
      explain: t`$\int_0^{2\pi}\sin\theta\,d\theta = 0$: the negative half cancels the positive half. With the ranges the right way round, $\int_0^{2\pi}d\phi\int_0^\pi \sin\theta\,d\theta\int_0^R r^2\,dr = 2\pi\cdot2\cdot\tfrac{R^3}{3} = \tfrac43\pi R^3$. When a source writes $\rho^2\sin\phi$, its $\phi$ is our $\theta$ — rename before you copy limits.`,
      visual: { type: 'graph', params: { x: [-0.3, 6.6], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'θ', curves: [{ fn: 'sin(x)', domain: [0, 6.2832], color: 'accent', label: 'sin θ', labelAt: 1.3 }], shade: [{ fn: 'max(sin(x), 0)', from: 0, to: 6.2832, color: 'accent', alpha: 0.25 }, { fn: 'min(sin(x), 0)', from: 0, to: 6.2832, color: 'bad', alpha: 0.25 }], vlines: [{ x: 'pi', label: 'π' }, { x: '2*pi', label: '2π' }] }, caption: t`The factor $\sin\theta$ from $dV$ over $0 \le \theta \le 2\pi$: the red area cancels the blue.` },
    }),
    num({
      id: 'grain', difficulty: 2,
      gen(r) {
        const Ro = r.pick([5, 6, 8]), Ri = r.pick([1.5, 2, 2.5]), L = r.pick([30, 40, 50]);
        const M = 1800 * Math.PI * ((Ro / 100) ** 2 - (Ri / 100) ** 2) * (L / 100);
        return {
          prompt: t`A small solid rocket motor's propellant grain is a hollow cylinder: outer radius ${Ro} cm, a central bore of radius ${Ri} cm, length ${L} cm. Its density is 1800 kg/m³, typical of ammonium perchlorate composite propellant. Use cylindrical coordinates to find its mass.`,
          answer: M, units: 'kg', tol: { rel: 0.005 },
          errors: [
            { value: 1800 * Math.PI * (Ro / 100) ** 2 * (L / 100), feedback: 'That is a solid cylinder. Subtract the bore: ρ runs from the bore to the outside.' },
            { value: 1800 * 2 * Math.PI * ((Ro - Ri) / 100) * (L / 100), feedback: t`That integrates $d\rho\,d\phi\,dz$: the volume element is $\rho\,d\rho\,d\phi\,dz$, and $\int_{R_i}^{R_o}\rho\,d\rho = \tfrac12(R_o^2 - R_i^2)$.` },
          ],
          hints: [t`$M = \displaystyle\int_0^{L}\!\!\int_0^{2\pi}\!\!\int_{R_i}^{R_o} 1800\,\rho\,d\rho\,d\phi\,dz$, in metres.`, t`$\int_{R_i}^{R_o}\rho\,d\rho = \tfrac12\left(R_o^2 - R_i^2\right)$.`],
          teach: 'A hollow cylinder is a box in cylindrical coordinates; the factor ρ in dV makes the outer layers count for more.',
          explain: t`$M = 1800\cdot2\pi\cdot\tfrac12\left(${nice(Ro / 100)}^2 - ${nice(Ri / 100)}^2\right)\cdot ${nice(L / 100)} \approx ${fmt(M, 3)}$ kg. Real grains often have star-shaped bores, which burn with a more even thrust; this one is the simplest kind.`,
          visual: { type: 'surface3d', params: { surface: [`(${r6(Ro / 10)} - ${r6((Ro - Ri) / 10)}*min(max(u - 1, 0), 1))*cos(v)`, `(${r6(Ro / 10)} - ${r6((Ro - Ri) / 10)}*min(max(u - 1, 0), 1))*sin(v)`, `${r6(L / 10)}*min(min(u, 1), 3 - u)`], domain: [[0, 3], [1.69, 6.4]], n: 64, axisLen: r6((L / 10) * 1.1), dist: r6((L / 10) * 1.9 + 1.5), target: [0, 0, r6(L / 22)], yaw: 0.9, pitch: 0.42, colorBy: false }, caption: t`The grain, with a quarter cut away to show its bore (to scale, in decimetres). Drag to rotate.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hemisphere', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3, 4]);
        const I = (Math.PI * R ** 4) / 4;
        return {
          prompt: t`$H$ is the solid half-ball $x^2 + y^2 + z^2 \le ${R * R}$, $z \ge 0$. Evaluate $\displaystyle\iiint_H z\,dV$.`,
          answer: I, tol: { rel: 1e-3 },
          vars: ['x'], integrand: 'pi*x^3', limits: [0, R],
          hints: [t`$z = r\cos\theta$, and the half-ball is $0 \le r \le ${R}$, $0 \le \theta \le \tfrac{\pi}{2}$, $0 \le \phi \le 2\pi$.`],
          teach: 'Write the integrand in spherical form and multiply by r² sin θ; over a box in (r, θ, φ) it factors.',
          explain: t`$\displaystyle\int_0^{2\pi}d\phi\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta\int_0^{${R}} r^3\,dr = 2\pi\cdot\tfrac12\cdot\tfrac{${R ** 4}}{4} = ${nice(r6(I / Math.PI))}\pi \approx ${fmt(I, 4)}$. Divided by the volume $\tfrac23\pi(${R})^3$, it puts the centroid at $\bar z = \tfrac38\cdot${R} = ${nice((3 * R) / 8)}$.`,
          visual: scene({ range: R + 0.5, scale: 1.4, ...wedge(String(R), '1.5708', '6.2832', { n: 4 }) }, t`The half-ball $z \ge 0$ of radius $${R}$, drawn as a wireframe. Drag to rotate.`),
        };
      },
    }),
    num({
      id: 'cp-maxwell', difficulty: 3, transfer: true,
      gen(r) {
        const [name, A] = r.pick([['nitrogen, N₂', 28.014], ['oxygen, O₂', 31.998], ['helium', 4.0026]]);
        const T = r.pick([200, 300, 400]);
        const m = A * U, vp = Math.sqrt((2 * KB * T) / m);
        return {
          prompt: t`In a gas at temperature $T$, the share of molecules whose **velocity** lies in a small box $d^3v$ of velocity space is proportional to $e^{-mv^2/2k_BT}\,d^3v$. In spherical coordinates in velocity space, $d^3v = v^2\sin\theta\,dv\,d\theta\,d\phi$, so the share with **speed** between $v$ and $v + dv$ is proportional to $4\pi v^2 e^{-mv^2/2k_BT}\,dv$. Find the most probable speed of ${name} molecules ($m = ${A}$ u) at ${T} K. ($k_B = 1.381\times10^{-23}$ J/K, $1\ \text{u} = 1.661\times10^{-27}$ kg.)`,
          answer: vp, units: 'm/s', tol: { rel: 0.005 },
          errors: [
            { value: Math.sqrt((3 * KB * T) / m), feedback: t`That is the root-mean-square speed, $\sqrt{3k_BT/m}$. The most probable speed is where $v^2e^{-mv^2/2k_BT}$ peaks.` },
            { value: Math.sqrt((8 * KB * T) / (Math.PI * m)), feedback: t`That is the mean speed, $\sqrt{8k_BT/\pi m}$. The most probable speed is where $v^2e^{-mv^2/2k_BT}$ peaks.` },
            { value: 0, feedback: t`The single most likely velocity is zero — but there are many more velocity vectors with larger speeds: the shell of radius $v$ has volume $4\pi v^2\,dv$.` },
          ],
          hints: [
            t`Maximise $g(v) = v^2 e^{-a v^2}$ with $a = \dfrac{m}{2k_BT}$: set $g'(v) = 0$.`,
            t`$g'(v) = 2v e^{-av^2}(1 - a v^2) = 0$ gives $v^2 = \dfrac{1}{a} = \dfrac{2k_BT}{m}$.`,
          ],
          teach: 'The shell factor 4πv² from spherical coordinates pushes the most probable speed away from zero.',
          explain: t`$v_p = \sqrt{2k_BT/m} = \sqrt{\dfrac{2\,(1.381\times10^{-23})(${T})}{${A}\times1.661\times10^{-27}}} \approx ${fmt(vp, 3)}$ m/s. The Gaussian alone peaks at $v = 0$; the factor $v^2$, the area of a sphere in velocity space, moves the peak out — the same $r^2$ that is in every spherical $dV$.`,
          visual: { type: 'calc-polar', params: { grid: 'cartesian', aspect: 'wide', x: [-2.6, 2.6], y: [-2.3, 2.3], xlabel: 'vx', ylabel: 'vz', xticks: 0.001, yticks: 0.001, fills: [{ polar: '1.9', inner: '1.6', theta: [0, 6.2832], color: 'teal', alpha: 0.35 }], curves: [{ polar: '1.9', theta: [0, 6.2832], color: 'teal', width: 1.4 }, { polar: '1.6', theta: [0, 6.2832], color: 'teal', width: 1.4 }], arrows: [{ from: [0, 0], to: [1.05, 1.35], color: 'gold', label: 'v' }] }, caption: t`A slice through velocity space, where each velocity vector $\vec v$ is a point. The velocities with speeds between $v$ and $v + dv$ fill a thin spherical shell — a ring in this slice — whose volume is $4\pi v^2\,dv$: the bigger $v$, the more room.` },
        };
      },
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      prompt: t`A simple model of Mars ($R = 3390$ km) lets its density fall from $5500$ kg/m³ at the centre to $2900$ kg/m³ at the surface as $\rho(r) = 5500 - 2600\,(r/R)^2$ kg/m³. What mass does the model give?`,
      answer: 4 * Math.PI * R_MARS ** 3 * (5500 / 3 - 2600 / 5), units: 'kg', tol: { rel: 0.005 },
      errors: [
        { value: (4 / 3) * Math.PI * R_MARS ** 3 * 5500, feedback: 'That uses the central density everywhere. Integrate the density over the ball, shell by shell.' },
        { value: (4 / 3) * Math.PI * R_MARS ** 3 * 4200, feedback: t`Averaging the centre and surface densities ignores where the volume is: the outer shells hold most of it. Integrate $4\pi r^2\rho(r)\,dr$.` },
      ],
      hints: [
        t`$M = \displaystyle\int_0^R \rho(r)\,4\pi r^2\,dr$, since the density depends on $r$ alone.`,
        t`$\displaystyle\int_0^R \left(5500 - 2600\frac{r^2}{R^2}\right) r^2\,dr = R^3\left(\frac{5500}{3} - \frac{2600}{5}\right)$.`,
      ],
      teach: 'For a density that depends only on r, the mass is a single integral over shells of volume 4πr² dr.',
      explain: t`$M = 4\pi R^3\left(1833 - 520\right) = 4\pi\,(1313)\,(3.39\times10^{6})^3 \approx ${tex(4 * Math.PI * R_MARS ** 3 * (5500 / 3 - 2600 / 5), 3)}$ kg. The measured mass of Mars is $6.417\times10^{23}$ kg (NASA), so this teaching model is within $0.2\%$. Real models of Mars have an iron-rich core about half its radius across, a few thousand kilograms per cubic metre denser than the mantle.`,
      visual: { type: 'graph', params: { x: [0, 1.04], y: [-0.05, 1.12], aspect: 'wide', xlabel: 'r / R', ylabel: '', curves: [{ fn: '(5500 - 2600*x^2)/5500', domain: [0, 1], color: 'accent', label: 'density ρ(r) / ρ(0)', labelAt: 0.1, labelDx: 6, labelDy: -12 }, { fn: `x^2*(5500 - 2600*x^2)/${r6(2900)}`, domain: [0, 1], color: 'gold', label: 'mass per shell (scaled)', labelAt: 0.45, labelDx: 10, labelDy: 14 }] }, caption: t`The model's density (blue) and the mass in each thin shell, $4\pi r^2\rho\,dr$ (gold, scaled so the outermost shell is 1). A teaching model, not a measured profile.` },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §5.5 Triple integrals in cylindrical and spherical coordinates (uses the swapped, mathematics convention)', url: 'https://openstax.org/books/calculus-volume-3/pages/5-5-triple-integrals-in-cylindrical-and-spherical-coordinates' },
    { label: 'NASA Earth and Mars fact sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    { label: 'Dziewonski & Anderson (1981), Preliminary Reference Earth Model', url: 'https://doi.org/10.1016/0031-9201(81)90046-7' },
  ],
});
