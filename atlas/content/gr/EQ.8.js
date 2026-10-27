// The Schwarzschild metric, dissected term by term: the time part (clock
// rates), the radial part (ruler stretch), the angular part (areal radius)
// and the Schwarzschild radius. Signature (−,+,+,+), G and c explicit.
// Verified with sympy: R_μν = 0; Kretschmann 48G²M²/(c⁴r⁶). Agrees with
// gr.S20.i (two maps), gr.S22.i (inside, r is timelike) and gr.S23.i; avoids
// repeating their r_s, redshift and GPS items.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, C, M_SUN, M_EARTH, R_EARTH, R_SUN, AU, sci, round, rs } from './_eq.js';

const t = String.raw;
const log = Math.log10;

// the metric's two coefficients, inside and outside the horizon (r in units of r_s)
const coeffs = (slider) => ({
  type: 'graph',
  params: {
    x: [0, 6], y: [-4, 4], xlabel: 'r / rₛ', ylabel: 'coefficient',
    ...(slider ? {
      sliders: [{ key: 'R', label: 'Position $r/r_s$', min: 0.2, max: 6, step: 0.01, value: 3, explain: 'Inside the horizon for values below 1.' }],
      points: [{ x: 'R', y: '-(1 - 1/R)', color: 'gold' }, { x: 'R', y: '1/(1 - 1/R)', color: 'accent' }],
      readouts: [
        { label: '$g_{tt}/c^2 = -(1 - r_s/r)$', expr: '-(1 - 1/R)', digits: 4 },
        { label: '$g_{rr} = 1/(1 - r_s/r)$', expr: '1/(1 - 1/R)', digits: 4 },
      ],
    } : {}),
    curves: [
      { fn: '-(1 - 1/x)', domain: [0.2, 6], color: 'gold', label: 'gₜₜ / c²', labelAt: 4.6, labelDy: 14 },
      { fn: '1/(1 - 1/x)', domain: [1.18, 6], color: 'accent', label: 'gᵣᵣ', labelAt: 4.6, labelDy: -12 },
      { fn: '1/(1 - 1/x)', domain: [0.2, 0.83], color: 'accent' },
    ],
    vlines: [{ x: 1, label: 'r = rₛ' }],
    hlines: [{ y: 0 }],
  },
  caption: t`The two coefficients of the Schwarzschild metric against $r$, in units of $r_s$. Outside the horizon $g_{tt} < 0$ and $g_{rr} > 0$, as in flat spacetime; at $r = r_s$ both change sign. Far away they approach the flat values $-1$ and $+1$.`,
});

// radius against mass, both in powers of ten, with the line r = r_s
const RS_SUN_KM = rs(M_SUN) / 1e3;
const radiusMap = {
  type: 'graph',
  params: {
    x: [-7, 2], y: [-1.5, 7], xlabel: 'log₁₀(mass in solar masses)', ylabel: 'log₁₀(radius in km)',
    curves: [{ fn: `${round(log(RS_SUN_KM), 5)} + x`, color: 'bad', label: 'r = rₛ', labelAt: 1.1, labelDx: 4, labelDy: 14 }],
    points: [
      { x: round(log(M_EARTH / M_SUN), 4), y: round(log(R_EARTH / 1e3), 4), color: 'accent', label: 'Earth' },
      { x: round(log(1.898e27 / M_SUN), 4), y: round(log(6.991e4), 4), color: 'gold', label: 'Jupiter' },
      { x: 0, y: round(log(R_SUN / 1e3), 4), color: 'gold', label: 'Sun' },
      { x: round(log(1.4), 4), y: round(log(12), 4), color: 'violet', label: 'neutron star', labelDx: -9, labelAlign: 'right' },
    ],
  },
  caption: t`Radius against mass, both in powers of ten. The red line is $r = r_s$: squeezed onto it, a body would be a black hole. The vertical gap between a body and the line is how far it is from that, in powers of ten.`,
};

// one slice of space around a black hole (Flamm's paraboloid, r_s = 1) with two circles and the radial ruler between them
const flamm = (a, b) => ({
  type: 'surface3d',
  params: {
    surface: ['u*cos(v)', 'u*sin(v)', '2*sqrt(u - 1) - 4'], domain: [[1, 6], [0, 6.2832]], n: 30, axes: false, alpha: 0.4, colorBy: false,
    yaw: 0.5, pitch: 0.42, dist: 17, target: [0, 0, -1.6],
    curves: [
      { param: [`${a}*cos(t)`, `${a}*sin(t)`, `${round(2 * Math.sqrt(a - 1) - 4, 5)}`], t: [0, 6.2832], color: 'accent', width: 2.6 },
      { param: [`${b}*cos(t)`, `${b}*sin(t)`, `${round(2 * Math.sqrt(b - 1) - 4, 5)}`], t: [0, 6.2832], color: 'accent', width: 2.6 },
      { param: ['0.87758*t', '-0.47943*t', '2*sqrt(t - 1) - 4'], t: [a, b], color: 'gold', width: 5 },
    ],
    caption: `Not a rubber sheet — nothing rolls on it. One slice of space around a black hole at one moment, bent into an imaginary extra dimension so that lengths along the surface are true lengths (the height means nothing). Blue: the spheres r = ${a} rₛ and r = ${b} rₛ, seen as circles. Gold: the radial ruler between them. Drag to rotate.`,
  },
});

// a static clock's rate against r
const clockRate = (k) => ({
  type: 'graph',
  params: {
    x: [0, 10], y: [0, 1.15], xlabel: 'r / rₛ', ylabel: 'clock rate dτ/dt',
    curves: [{ fn: 'sqrt(1 - 1/x)', domain: [1, 10], color: 'gold' }],
    vlines: [{ x: 1, label: 'r = rₛ' }, ...(k ? [{ x: k, label: `r = ${k} rₛ`, color: 'accent' }] : [])],
    hlines: [{ y: 1, label: 'far away' }],
  },
  caption: t`How fast a clock hovering at $r$ ticks, per unit of the coordinate time $t$: $\sqrt{1 - r_s/r}$.`,
});

// Earth's orbit (not to scale)
const orbitPic = {
  type: 'graph',
  params: {
    x: [-2.1, 2.1], y: [-1.3, 1.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.8, dash: true }],
    arrows: [{ from: [0, 0], to: [0.985, 0.17], color: 'ink3', label: 'a = 1 AU', labelDx: -60, labelDy: -14 }],
    points: [{ x: 0, y: 0, color: 'gold', r: 9, label: 'Sun', labelDx: -14, labelDy: 20 }, { x: 0.985, y: 0.17, color: 'accent', r: 5, label: 'Earth' }],
  },
  caption: 'Earth’s orbit around the Sun (not to scale): one turn in a year at about 1 AU. Kepler’s third law turns that into the Sun’s GM — the M in the metric.',
};

export default lesson({
  id: 'gr.EQ.8',
  kind: 'dissection',
  title: 'The Schwarzschild metric',
  minutes: 8, difficulty: 3,
  badges: ['est-der', 'est-obs'],
  equation: t`\begin{gathered}\part{1}{ds^2} = \part{2}{-\left(1 - \frac{r_s}{r}\right)c^2\,dt^2} + \part{3}{\frac{dr^2}{1 - r_s/r}} + \part{4}{r^2\left(d\theta^2 + \sin^2\theta\,d\phi^2\right)} \\[6pt] \part{5}{r_s = \frac{2GM}{c^2}}\end{gathered}`,
  intro: t`Karl Schwarzschild found this exact solution of Einstein's equations in 1916, weeks after they were published. By Birkhoff's theorem it is the **only** spherically symmetric solution with no matter: outside the Sun, a planet, a non-spinning star or a black hole, spacetime is exactly this, whatever the inside is doing. One length, $r_s$, sets everything.

The coordinates are $(t, r, \theta, \phi)$; the signature is $(-,+,+,+)$, with $G$ and $c$ shown explicitly. Each term below gets its own card.`,
  parts: [
    {
      tex: t`ds^2`, name: 'the line element', badge: 'est-der', units: t`$\text{m}^2$`,
      text: t`The squared spacetime interval between two neighbouring events, separated by $dt$, $dr$, $d\theta$ and $d\phi$. It is what every observer agrees on. For a clock's path $ds^2 = -c^2d\tau^2$, so it gives the clock's own time $\tau$; for a ruler at one instant $ds^2 = d\ell^2$, its length; for light $ds^2 = 0$.

The whole metric is just the rule $g_{\mu\nu}$ written as a sum — here diagonal, with $g_{tt} = -(1 - r_s/r)c^2$, $g_{rr} = 1/(1 - r_s/r)$, $g_{\theta\theta} = r^2$, $g_{\phi\phi} = r^2\sin^2\theta$.`,
    },
    {
      tex: t`-\left(1 - \frac{r_s}{r}\right)c^2\,dt^2`, name: 'the time part: clock rates', badge: 'est-obs', units: t`$\text{m}^2$`,
      text: t`$t$ is the time kept by observers **far away**, not by a clock near the mass. A clock hovering at fixed $r$ ($dr = d\theta = d\phi = 0$) has $c^2d\tau^2 = (1 - r_s/r)\,c^2dt^2$: it ticks at $\sqrt{1 - r_s/r}$ of the far-away rate. Low clocks run slow — measured from a 22.5 m tower to GPS orbit — and light climbing out is redshifted by the same factor.

Far out, $\sqrt{1 - r_s/r} \approx 1 - GM/(rc^2) = 1 + \Phi/c^2$: Newton's potential, as a clock rate. At $r = r_s$ the factor reaches zero, and inside it changes sign.`,
    },
    {
      tex: t`\frac{dr^2}{1 - r_s/r}`, name: 'the radial part: ruler stretch', badge: 'est-der', units: t`$\text{m}^2$`,
      text: t`A short ruler pointing radially, at one instant, measures $d\ell = dr/\sqrt{1 - r_s/r}$: **more** than the change in $r$. Space is stretched radially near the mass — the ruler map. The proper distance between two spheres is $\int dr/\sqrt{1 - r_s/r}$, longer than the difference of their $r$ values.

At $r = r_s$ the factor blows up, but that is a failure of these coordinates, not of spacetime: the curvature there is finite, and other coordinates pass through smoothly.`,
    },
    {
      tex: t`r^2\left(d\theta^2 + \sin^2\theta\,d\phi^2\right)`, name: 'the angular part: areal radius', badge: 'est-der', units: t`$\text{m}^2$`,
      text: t`Exactly the geometry of an ordinary sphere of radius $r$: $\theta$ is the angle from the north pole, $\phi$ the angle around it. So a sphere at fixed $r$ has area $4\pi r^2$ and a circle around it has circumference $2\pi r$.

That **defines** $r$: it is the areal radius, measured by walking round a circle and dividing by $2\pi$ — not the distance to the centre, which the radial stretch makes longer (and which, inside a black hole, does not exist as a ruler distance at all).`,
    },
    {
      tex: t`r_s = \frac{2GM}{c^2}`, name: 'the Schwarzschild radius', badge: 'est-obs', units: t`$\text{m}$`,
      text: t`The one length in the metric: 2.95 km for each solar mass, 8.87 mm for the Earth. $M$ is the mass that distant orbits measure through Kepler's third law, $GM = 4\pi^2a^3/T^2$ — the total, including the gravitational binding energy. $G = 6.674\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\text{s}^{-2}$ is Newton's constant and $c$ the speed of light.

For the Sun and the planets $r_s$ lies deep inside the body, where this vacuum metric does not apply. Only a black hole exposes $r = r_s$, its event horizon.`,
    },
  ],
  readAloud: t`Outside a round mass, the interval between two nearby events is the flat one, except that clock ticks are shrunk by the factor $1 - r_s/r$ and radial distances stretched by its inverse, while spheres keep their area $4\pi r^2$.`,
  why: t`Every solar-system test of general relativity and every non-spinning black hole lives in this metric; reading it term by term is how you predict what a clock, a ruler or a light ray does near a mass.`,
  visual: {
    title: 'Inside and outside the horizon',
    lead: t`The gold curve is $g_{tt}/c^2 = -(1 - r_s/r)$; the blue one is $g_{rr} = 1/(1 - r_s/r)$. In flat spacetime they would be $-1$ and $+1$ everywhere. Slide the position in and out, across $r = r_s$.`,
    tasks: [
      'Far out, both approach their flat values: the metric becomes Minkowski’s, written in spherical coordinates.',
      t`Approach $r = r_s$ from outside: $g_{tt} \to 0$ (clocks hovering there would stop) and $g_{rr} \to \infty$ — the coordinates are failing.`,
      'Go inside: both coefficients change sign. Now r, not t, plays the role of time: decreasing r is as unavoidable as the future.',
    ],
    ...coeffs(true),
  },
  practice: [
    num({
      id: 'compactness', difficulty: 2,
      gen(r) {
        const [name, M, R, mTeX, rTeX] = r.pick([
          ['the Sun', M_SUN, R_SUN, t`1.989\times10^{30}`, t`6.957\times10^{8}`],
          ['the Earth', M_EARTH, R_EARTH, t`5.972\times10^{24}`, t`6.371\times10^{6}`],
          ['Jupiter', 1.898e27, 6.991e7, t`1.898\times10^{27}`, t`6.991\times10^{7}`],
          ['a neutron star of 1.4 solar masses', 1.4 * M_SUN, 1.2e4, t`2.785\times10^{30}`, t`1.2\times10^{4}`],
        ]);
        const k = rs(M) / R;
        return {
          prompt: t`The metric's corrections are set by $r_s/r$. Find $r_s = 2GM/c^2$ for ${name} ($M = ${mTeX}$ kg) and divide it by the surface radius, $R = ${rTeX}$ m. What is $r_s/R$ — how close is the surface to being a horizon? ($G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^{8}$ m/s)`,
          answer: k, tol: { rel: 0.01 },
          errors: [{ value: k / 2, feedback: t`Use $r_s = 2GM/c^2$, with the factor 2.` }, { value: R / rs(M), feedback: t`Upside down: divide $r_s$ by $R$.` }],
          hints: [t`$r_s = 2GM/c^2 = ${sci(rs(M), 4)}$ m.`, t`Divide by $R = ${rTeX}$ m.`],
          teach: t`The ratio $r_s/R$ measures how strongly relativistic a body is: a billionth for Earth, a few millionths for the Sun, a third for a neutron star.`,
          explain: t`$r_s = ${sci(rs(M), 3)}$ m, so $r_s/R = ${sci(k, 3)}$. The time part of the metric differs from flat by that fraction at the surface: ${k > 0.1 ? 'a neutron star is genuinely relativistic — its surface clocks run at only $\\sqrt{1 - r_s/R}$ of the far-away rate.' : 'tiny, which is why Newton works so well in the Solar System.'}`,
          visual: radiusMap,
        };
      },
    }),
    mcq({
      id: 'which-part', difficulty: 1,
      prompt: t`$$ds^2 = -\left(1 - \frac{r_s}{r}\right)c^2dt^2 + \frac{dr^2}{1 - r_s/r} + \underbrace{r^2\left(d\theta^2 + \sin^2\theta\,d\phi^2\right)}_{\text{?}}$$ What does the marked term tell you?`,
      choices: [
        t`That a sphere at coordinate $r$ has area $4\pi r^2$: $r$ is defined by the areas of spheres, not by distance to the centre`,
        t`That clocks at $r$ run slow by the factor $r^2$`,
        t`That radial rulers are stretched near the mass`,
        t`That space is flat in every direction, so $r$ is the distance from the centre`,
      ],
      answer: 0,
      why: {
        1: 'Clock rates come from the dt² term; the marked term has no dt in it.',
        2: 'Radial stretch is the dr² term. The marked term describes the directions around the mass, at fixed r.',
        3: t`It is flat geometry only on each sphere. The $dr^2$ term stretches the radial direction, so distances to the centre are not $r$.`,
      },
      hints: [t`Hold $t$ and $r$ fixed: what is left is the geometry of the sphere at radius $r$.`],
      teach: 'Schwarzschild’s r is the areal radius: the angular part is exactly that of a sphere of radius r.',
      explain: t`With $dt = dr = 0$ the metric is $r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$ — an ordinary sphere of radius $r$, with area $4\pi r^2$ and circumference $2\pi r$. Measure a circle's circumference, divide by $2\pi$, and you have $r$.`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 40, transport: false, measure: true, readout: false }, caption: 'Spheres in general relativity are measured from the outside in: by the circumference of a circle on them, not by a ruler to the centre.' },
    }),
    mcq({
      id: 'limit', difficulty: 2,
      prompt: t`What does the Schwarzschild metric become far from the mass, as $r \to \infty$ (or for $M \to 0$)?`,
      choices: [
        t`Flat Minkowski spacetime in spherical coordinates: $ds^2 = -c^2dt^2 + dr^2 + r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$`,
        'A singular metric, because 1/r goes to zero',
        'Newton’s gravity, with the force falling off as 1/r²',
        'Nothing: the metric is the same at every r',
      ],
      answer: 0,
      why: {
        1: t`$r_s/r \to 0$ makes both factors go to 1 — nothing singular about that.`,
        2: t`Newton is the first correction, $1 - r_s/r \approx 1 + 2\Phi/c^2$, which still fades; in the limit itself there is no gravity left.`,
        3: t`$r_s/r$ changes with $r$: the factors approach 1 only far away.`,
      },
      hints: [t`What do $1 - r_s/r$ and $1/(1 - r_s/r)$ tend to as $r \to \infty$?`],
      teach: 'Schwarzschild spacetime is asymptotically flat: far away it becomes Minkowski spacetime in spherical coordinates.',
      explain: t`Both factors tend to 1, leaving the flat metric in spherical coordinates. That is why the far-away observers' time $t$ and the mass $M$ can be defined by ordinary measurements made far out.`,
      visual: coeffs(false),
    }),
    mcq({
      id: 'inside', difficulty: 3,
      prompt: t`Inside the horizon, $r < r_s$, the factor $1 - r_s/r$ is negative. What does that do to the metric's meaning?`,
      choices: [
        t`The $dt^2$ term turns positive and the $dr^2$ term negative: $r$ becomes the time-like coordinate, so moving to smaller $r$ is as unavoidable as moving into the future`,
        'Distances become imaginary, so nothing can exist inside',
        t`Nothing changes: $t$ is still time and $r$ still a distance`,
        'Time runs backward inside the horizon',
      ],
      answer: 0,
      why: {
        1: 'Infalling matter crosses the horizon in a finite time on its own clock and carries on; the signs only swap the roles of the coordinates.',
        2: t`The coefficients' signs, which decide which coordinate is time-like, do change: $g_{tt} > 0$ and $g_{rr} < 0$ inside.`,
        3: 'The future still points one way — toward smaller r. Clocks falling in tick forward as always.',
      },
      hints: [t`In $(-,+,+,+)$, the time-like coordinate is the one whose metric coefficient is negative.`, t`Inside, which coefficient is negative: $g_{tt} = -(1 - r_s/r)c^2$ or $g_{rr} = 1/(1 - r_s/r)$?`],
      teach: 'Inside a black hole r is the time-like coordinate: the singularity at r = 0 is a moment in the future, not a place to avoid.',
      explain: t`With $r < r_s$, $g_{tt} > 0$ and $g_{rr} < 0$: $r$ is now the time-like direction, and every future-pointing worldline has $r$ decreasing. That is why nothing, not even light, can get out — and why the singularity is a moment, not a place.`,
      visual: coeffs(false),
    }),
    num({
      id: 'distance', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [2, 3], [3, 4], [5, 6]]);
        const F = (x) => Math.sqrt(x * (x - 1)) + Math.log(Math.sqrt(x) + Math.sqrt(x - 1));
        const L = F(b) - F(a);
        return {
          prompt: t`How far apart, measured with a ruler at one instant, are the spheres $r = ${a}\,r_s$ and $r = ${b}\,r_s$ around a black hole? Work in units of $r_s$: the proper distance is $\displaystyle\int_{${a}}^{${b}} \frac{dr}{\sqrt{1 - 1/r}}$.`,
          answer: L, tol: { rel: 0.005 },
          integrand: '1/sqrt(1 - 1/r)', limits: [a, b], vars: ['r'],
          errors: [{ value: b - a, feedback: t`That is the difference in $r$. Radial rulers are stretched: integrate $1/\sqrt{1 - r_s/r}$.` }],
          hints: [t`An antiderivative is $\sqrt{r(r-1)} + \ln\!\left(\sqrt r + \sqrt{r - 1}\right)$.`, t`Evaluate it at $${b}$ and at $${a}$ and subtract.`],
          teach: t`Radial distances near a mass are longer than the difference in $r$: integrate the stretched ruler, $1/\sqrt{1 - r_s/r}$.`,
          explain: t`$\left[\sqrt{r(r-1)} + \ln(\sqrt r + \sqrt{r-1})\right]_{${a}}^{${b}} = ${fmt(L, 4)}\,r_s$, against a difference in $r$ of $${b - a}\,r_s$. The stretch is largest near the horizon and fades far out.`,
          visual: flamm(a, b),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sun-rs', difficulty: 2, transfer: true,
      gen(r) {
        const [planet, aAU, Tdays] = r.pick([['Earth', 1.0, 365.256], ['Mars', 1.5237, 686.98], ['Venus', 0.72333, 224.70]]);
        const a = aAU * AU, T = Tdays * 86400;
        const GM = (4 * Math.PI ** 2 * a ** 3) / T ** 2, R = (2 * GM) / (C * C);
        return {
          prompt: t`The $M$ in the metric is the mass that distant orbits measure. ${planet} orbits the Sun at $a = ${sci(a, 5)}$ m in $T = ${Tdays}$ days. Kepler's third law gives $GM = 4\pi^2a^3/T^2$. Use it to find the Sun's Schwarzschild radius, in km.`,
          answer: R / 1e3, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: GM / (C * C) / 1e3, feedback: 'You found GM/c². The Schwarzschild radius is twice that.' }, { value: (2 * GM) / C / 1e3, feedback: 'Divide by c², not c.' }],
          hints: [t`$T = ${Tdays}\times86\,400 = ${sci(T, 4)}$ s, so $GM = 4\pi^2(${sci(a, 4)})^3/(${sci(T, 4)})^2 = ${sci(GM, 4)}\ \text{m}^3/\text{s}^2$.`, t`$r_s = 2GM/c^2$ with $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
          teach: t`Orbits measure $GM$ directly — far more precisely than $G$ or $M$ separately — and $GM$ is all the metric needs: $r_s = 2GM/c^2$.`,
          explain: t`$GM_\odot = ${sci(GM, 4)}\ \text{m}^3/\text{s}^2$, so $r_s = ${sci(R / 1e3, 4)}$ km. No knowledge of $G$ or of the Sun's mass in kilograms was needed — only an orbit, a clock and $c$.`,
          visual: orbitPic,
        };
      },
    }),
    mcq({
      id: 'cp-t', difficulty: 2,
      prompt: t`Which clock measures the Schwarzschild coordinate time $t$?`,
      choices: [
        t`A clock at rest very far from the mass. Every clock hovering at finite $r$ ticks slower, at $\sqrt{1 - r_s/r}$ of its rate`,
        t`Every clock: $t$ is the time coordinate, so all clocks read it`,
        'A clock falling freely toward the mass',
        'A clock hovering just outside the horizon',
      ],
      answer: 0,
      why: {
        1: t`Clocks read their own proper time $\tau$; only for a clock far away and at rest is $d\tau = dt$.`,
        2: t`A falling clock moves, and is deep in the well: its proper time differs from $t$ on both counts.`,
        3: t`Near the horizon $\sqrt{1 - r_s/r} \to 0$: such a clock ticks far slower than $t$ advances.`,
      },
      hints: [t`For a clock at rest at $r$, the metric gives $d\tau = \sqrt{1 - r_s/r}\,dt$. Where does $d\tau = dt$?`],
      teach: t`Schwarzschild $t$ is the time of observers far away; a clock hovering at $r$ ticks slower by $\sqrt{1 - r_s/r}$.`,
      explain: t`Only as $r \to \infty$ does $\sqrt{1 - r_s/r} \to 1$. Treating $t$ as anyone's clock reading near a black hole is a classic error: the infinite $t$ for reaching the horizon says nothing about the finite time on the infaller's own clock.`,
      visual: clockRate(null),
    }),
    mcq({
      id: 'cp-light', difficulty: 3,
      prompt: t`For light moving radially, $ds^2 = 0$ gives $\dfrac{dr}{dt} = \pm c\left(1 - \dfrac{r_s}{r}\right)$ — less than $c$ near the mass. What speed does an observer hovering at $r$ measure for that light, with her own clock and ruler?`,
      choices: [
        t`Exactly $c$: her clock runs slow by $\sqrt{1 - r_s/r}$ and her radial ruler is stretched by $1/\sqrt{1 - r_s/r}$, which together undo the factor`,
        t`$c(1 - r_s/r)$: light really is slower near a mass`,
        t`$c/(1 - r_s/r)$: faster than light, near a mass`,
        t`$c\sqrt{1 - r_s/r}$, half-way between`,
      ],
      answer: 0,
      why: {
        1: t`$dr/dt$ uses the far-away time and the areal coordinate, not her measurements. Locally, light always moves at $c$ — the equivalence principle.`,
        2: 'Nothing measured locally ever outruns light; the factors here make the measured speed exactly c.',
        3: t`Each factor contributes $\sqrt{1 - r_s/r}$; together they cancel the whole $1 - r_s/r$, not half of it.`,
      },
      hints: [t`Her time: $d\tau = \sqrt{1 - r_s/r}\,dt$. Her distance: $d\ell = dr/\sqrt{1 - r_s/r}$.`, t`Compute $d\ell/d\tau$.`],
      teach: 'Coordinate speeds can differ from c; any speed of light measured locally, with real clocks and rulers, is exactly c.',
      explain: t`$\dfrac{d\ell}{d\tau} = \dfrac{dr/\sqrt{1 - r_s/r}}{\sqrt{1 - r_s/r}\,dt} = \dfrac{1}{1 - r_s/r}\,\dfrac{dr}{dt} = c$. The slowing of $dr/dt$ is in the coordinates; it shows up physically as the Shapiro delay of radar echoes passing the Sun.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 8], y: [0, 1.15], xlabel: 'r / rₛ', ylabel: '(dr/dt) ÷ c',
          curves: [{ fn: '1 - 1/x', domain: [1, 8], color: 'gold' }],
          vlines: [{ x: 1, label: 'r = rₛ' }],
          hlines: [{ y: 1, label: 'c' }],
        },
        caption: t`The coordinate speed of radial light, $dr/dt = c(1 - r_s/r)$, against $r$. It uses the far-away time $t$ and the areal radius $r$ — not what anyone measures on the spot.`,
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, ch. 5 (the Schwarzschild solution)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 7', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed., free online)', url: 'https://www.eftaylor.com/exploringblackholes' },
  ],
});
