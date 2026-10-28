// Kepler's laws from vector calculus — from the inverse-square force alone:
// the angular momentum per unit mass h = r × v is conserved (planar orbits,
// equal areas), the Laplace–Runge–Lenz vector A = v × h − GM r̂ is conserved
// (the orbit is a conic with the Sun at a focus), and the area of the ellipse
// over the areal rate gives the period (T² ∝ a³). Real orbit data throughout.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { norm, vecTeX } from './_space.js';

const t = String.raw;
const D = Math.PI / 180;
// a whole number with thin-space thousands: 398\,600
const big = (x) => `${x < 0 ? '-' : ''}${Math.round(Math.abs(x)).toLocaleString('en-US').replace(/,/g, '\\,')}`;
const near = (a, b) => Math.abs(a - b) <= 0.006 * Math.max(Math.abs(b), 1e-9);
// keep only the error values a grader could tell apart from the answer and each other
const distinct = (answer, errs) => errs.filter((e, k) => Number.isFinite(e.value) && !near(e.value, answer) && !errs.slice(0, k).some((f) => near(e.value, f.value)));

// constants, matching the mech-kepler model
const GM_SUN = 1.32712440018e20, GM_EARTH = 3.986004418e14, GM_MOON = 4.9048695e12, AU = 1.495978707e11, R_EARTH_KM = 6371;
const GM_E_KM = GM_EARTH / 1e9;   // km³/s²

// a still picture of one of mech-kepler's real orbits
const orbitPic = (preset, caption, extra = {}) => ({ type: 'mech-kepler', params: { presets: [preset], preset, controls: false, readout: false, sectors: 12, ...extra }, caption });

// the worked example: Mercury from one perihelion fix
const MERC = (() => {
  const rp = 4.600e10, vp = 58970, h = rp * vp, A = vp * h - GM_SUN, e = A / GM_SUN, p = (h * h) / GM_SUN;
  const ra = p / (1 - e), va = h / ra, a = (rp + ra) / 2, T = 2 * Math.PI * Math.sqrt(a ** 3 / GM_SUN);
  return { rp, vp, h, A, e, p, ra, va, a, T };
})();

// the Explore's orbit: GM = 1.5, semi-latus rectum p = 1.6 (arbitrary units)
const c = 'cos(th*pi/180)', s = 'sin(th*pi/180)', R = `(1.6/(1 + e*${c}))`;
const VS = Math.sqrt(1.5 / 1.6), HZ = Math.sqrt(1.5 * 1.6);   // √(GM/p) and h = √(GM p)
const vs = nice(VS, 5), hz = nice(HZ, 5);

export default lesson({
  id: 'math2210.C3-2.5',
  title: 'Kepler’s laws from vector calculus',
  minutes: 15, difficulty: 3,
  intro: t`Newton’s law of gravitation gives a planet the acceleration $\vec a = -\dfrac{GM}{r^2}\hat r$: always toward the Sun, falling off as $1/r^2$. Vector calculus turns that one line into all three of Kepler’s laws.

**Angular momentum is conserved.** Let $\vec h = \vec r\times\vec v$, the angular momentum per unit mass. By the cross-product rule, $\vec h\,' = \vec v\times\vec v + \vec r\times\vec a = \vec 0 + \vec 0$, because $\vec a$ is parallel to $\vec r$. So $\vec h$ is constant: the planet stays in the fixed plane through the Sun perpendicular to $\vec h$. The area swept by the Sun–planet line grows at $\frac{dA}{dt} = \frac12|\vec r\times\vec v| = \frac h2$, a constant: **equal areas in equal times** (Kepler’s second law).

**A second conserved vector.** Since $\vec h$ is constant, $(\vec v\times\vec h)' = \vec a\times\vec h = -\frac{GM}{r^2}\,\hat r\times(\vec r\times\vec v) = GM\,\frac{d\hat r}{dt}$. Integrating,

$$\vec A = \vec v\times\vec h - GM\,\hat r \quad\text{is constant: the Laplace–Runge–Lenz vector.}$$

**The orbit is a conic.** Dot $\vec A$ with $\vec r$, writing $\theta$ for the angle from $\vec A$ to $\vec r$: $rA\cos\theta = \vec r\cdot(\vec v\times\vec h) - GMr = h^2 - GMr$, since $\vec r\cdot(\vec v\times\vec h) = (\vec r\times\vec v)\cdot\vec h$. Solving for $r$,

$$r = \frac{h^2/GM}{1 + e\cos\theta}, \qquad e = \frac{|\vec A|}{GM}$$

— an ellipse (for $e < 1$) with the Sun at a focus and perihelion in the direction of $\vec A$: **Kepler’s first law**. Finally, the ellipse’s area $\pi ab$ is swept at the rate $h/2$, so the period is $T = 2\pi ab/h$; with $b^2 = a\,h^2/GM$ this gives $T^2 = \dfrac{4\pi^2}{GM}a^3$: **Kepler’s third law**.`,
  symbols: [
    { tex: 'GM', text: t`the Sun’s gravitational parameter, $1.327\times10^{20}$ m³/s² (Earth’s: $3.986\times10^{14}$ m³/s²)` },
    { tex: '\\hat r', text: t`the unit vector from the Sun toward the planet, $\vec r/r$` },
    { tex: '\\vec h = \\vec r\\times\\vec v', text: t`angular momentum per unit mass: constant, perpendicular to the orbit’s plane; its length $h$ is twice the areal rate` },
    { tex: '\\vec A', text: t`the Laplace–Runge–Lenz vector $\vec v\times\vec h - GM\hat r$: constant, pointing at perihelion, with length $e\,GM$` },
    { tex: 'e', text: t`the eccentricity: 0 for a circle, between 0 and 1 for an ellipse` },
    { tex: '\\theta', text: t`the true anomaly: the angle at the Sun from perihelion to the planet` },
    { tex: 'a,\\ b', text: t`the semi-major and semi-minor axes of the ellipse; perihelion and aphelion are $a(1 \mp e)$` },
  ],
  why: t`This is Newton’s triumph: three rules that Kepler extracted from Tycho Brahe’s observations follow from one force law and a page of vector calculus. The same conserved vectors run modern orbit determination — one measured position and velocity give $\vec h$ and $\vec A$, and with them the whole orbit. Applied to the star S2, this weighed the black hole at the centre of our Galaxy (Nobel Prize in Physics, 2020).`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Two vectors that never move',
    lead: t`A planet on its orbit round the Sun (at the origin). Drag $\theta$ to move it. The position $\vec r$ and velocity $\vec v$ change all the time; $\vec h = \vec r\times\vec v$ (teal, up out of the plane) and $\vec A$ (gold) do not. At the Sun, $\vec A$ is built as $\vec v\times\vec h$ (orange) plus $-GM\hat r$ (violet, dashed).`,
    tasks: [
      t`Drag $\theta$ all the way round. $\vec r$, $\vec v$ and the speed change, but $\vec h$ stays put — and so does the areal rate $\frac12|\vec r\times\vec v|$ in the readouts: Kepler’s second law.`,
      t`Watch the triangle at the Sun: $\vec v\times\vec h$ and $-GM\hat r$ both swing round as the planet moves, yet their sum always ends at the same point. That fixed sum is $\vec A$, and it points at perihelion ($\theta = 0$).`,
      t`Lower $e$ to 0: $\vec A$ shrinks away — a circle has no perihelion to point at. Raise it, and the orbit stretches along $\vec A$, with $|\vec A| = e\,GM$.`,
    ],
    params: {
      range: 3, pitch: 0.9, yaw: -1.2,
      sliders: [
        { key: 'th', label: '$\\theta$ (from perihelion)', min: 0, max: 360, step: 1, value: 60, unit: '^\\circ', explain: 'Moves the planet round its orbit.' },
        { key: 'e', label: '$e$ (eccentricity)', min: 0, max: 0.6, step: 0.01, value: 0.4, explain: 'The shape of the orbit, with the same $h$.' },
      ],
      curves: [{ param: ['1.6*cos(t)/(1 + e*cos(t))', '1.6*sin(t)/(1 + e*cos(t))', 0], t: [0, 2 * Math.PI], color: 'ink3', width: 1.6 }],
      points: [{ at: [0, 0, 0], color: 'gold', label: '\\text{Sun}' }],
      vectors: [
        { to: [`${R}*${c}`, `${R}*${s}`, 0], color: 'accent', label: '\\vec r' },
        { from: [`${R}*${c}`, `${R}*${s}`, 0], to: [`${R}*${c} - ${vs}*${s}`, `${R}*${s} + ${vs}*(e + ${c})`, 0], color: 'good', label: '\\vec v' },
        { to: [0, 0, hz], color: 'teal', label: '\\vec h' },
        { to: [`1.5*(e + ${c})`, `1.5*${s}`, 0], color: 'warn', label: '\\vec v\\times\\vec h' },
        { from: [`1.5*(e + ${c})`, `1.5*${s}`, 0], to: ['1.5*e', 0, 0], color: 'violet', dash: true, label: '-GM\\hat r' },
        { to: ['1.5*e', 0, 0], color: 'gold', label: '\\vec A', when: 'step(e - 0.005)' },
      ],
      readouts: [
        { label: '$r$', expr: R, digits: 3 },
        { label: '$|\\vec v|$', expr: `${vs}*sqrt(1 + 2*e*${c} + e^2)`, digits: 3 },
        { label: 'areal rate $\\frac12|\\vec r\\times\\vec v|$', expr: `0.5*(${R}*${c}*${vs}*(e + ${c}) + ${R}*${s}*${vs}*${s})`, digits: 4 },
        { label: '$\\vec v\\times\\vec h - GM\\hat r$', vec: [`1.5*(e + ${c}) - 1.5*${c}`, `1.5*${s} - 1.5*${s}`, '0'], digits: 3 },
      ],
    },
    caption: `Drag to rotate. Units are arbitrary: GM = 1.5 and h = ${nice(HZ, 3)}. The velocity is drawn to scale; the vectors at the Sun are each drawn at the same scale as one another.`,
  },
  example: {
    prompt: t`At perihelion Mercury is $${tex(MERC.rp, 4)}$ m from the Sun, moving at $58.97$ km/s at right angles to the Sun–Mercury line. Using only these and $GM_\odot = 1.327\times10^{20}$ m³/s², find $h$, the eccentricity (from $\vec A$), the aphelion distance and speed, and the orbital period.`,
    visual: orbitPic('mercury', 'Mercury’s real orbit, to scale, with twelve sectors swept in equal times: narrow and long near perihelion, short and wide near aphelion — equal areas.', { controls: true, readout: ['r', 'v', 'T', 'e'], time: true, play: true }),
    steps: [
      { label: 'Angular momentum', text: t`At perihelion $\vec r \perp \vec v$, so $h = r_pv_p = (${tex(MERC.rp, 4)})(58\,970) = ${tex(MERC.h, 4)}$ m²/s. The areal rate is half that: $${tex(MERC.h / 2, 4)}$ m² every second, all year round.` },
      { label: 'The LRL vector', text: t`Put $\hat r = \hat\imath$ and $\vec v = v_p\hat\jmath$, so $\vec h = h\hat k$ and $\vec v\times\vec h = v_ph\,\hat\imath$. Then $\vec A = (v_ph - GM)\hat\imath = (${tex(MERC.vp * MERC.h, 4)} - ${tex(GM_SUN, 4)})\hat\imath = ${tex(MERC.A, 4)}\,\hat\imath$ m³/s², pointing at perihelion, and $e = A/GM = ${nice(MERC.e, 4)}$.` },
      { label: 'The orbit', text: t`$\frac{h^2}{GM} = ${tex(MERC.p, 4)}$ m, so $r = \dfrac{${tex(MERC.p, 4)}\text{ m}}{1 + ${nice(MERC.e, 4)}\cos\theta}$. Aphelion is at $\theta = 180^\circ$: $r_a = ${tex(MERC.ra, 4)}$ m, where $v_a = h/r_a = ${nice(MERC.va / 1000, 4)}$ km/s — the second law again: $r_av_a = r_pv_p$.` },
      { label: 'The period', text: t`$a = \frac{r_p + r_a}{2} = ${tex(MERC.a, 4)}$ m, and $T = 2\pi\sqrt{a^3/GM} = ${tex(MERC.T, 4)}$ s $= ${nice(MERC.T / 86400, 4)}$ days.` },
      { label: 'Check against the sky', text: t`Mercury’s observed year is 87.97 days and its eccentricity 0.2056. Two numbers measured at one instant, and the force law, reproduce the whole orbit.` },
    ],
    answer: t`$h = ${tex(MERC.h, 4)}$ m²/s; $e = ${nice(MERC.e, 3)}$; aphelion $${tex(MERC.ra, 4)}$ m at $${nice(MERC.va / 1000, 4)}$ km/s; $T = ${nice(MERC.T / 86400, 4)}$ days.`,
  },
  practice: [
    mcq({
      id: 'h-constant', difficulty: 2,
      prompt: t`For $\vec h = \vec r\times\vec v$, the product rule gives $\vec h\,' = \vec v\times\vec v + \vec r\times\vec a$. Why is this zero for a planet?`,
      choices: [t`$\vec v\times\vec v = \vec 0$ always, and $\vec r\times\vec a = \vec 0$ because gravity points along $\vec r$`, t`Because the planet’s speed is constant`, t`Because $\vec a = \vec 0$ on a closed orbit`, t`Because $\vec v$ is always perpendicular to $\vec r$`],
      answer: 0,
      why: {
        1: 'A planet’s speed is not constant — Mercury’s ranges from 39 to 59 km/s. Conservation of h does not need it.',
        2: t`The acceleration is never zero: it is $GM/r^2$ toward the Sun at every point.`,
        3: t`On an ellipse $\vec v$ is perpendicular to $\vec r$ only at perihelion and aphelion. The argument works everywhere because $\vec a \parallel \vec r$.`,
      },
      hints: [t`What is the cross product of a vector with itself?`, t`$\vec a = -\frac{GM}{r^2}\hat r$: which way does it point relative to $\vec r$?`],
      teach: 'Any central force — one along r — conserves r × v, because the cross product of parallel vectors is zero.',
      explain: t`$\vec v\times\vec v = \vec 0$ for any vector, and $\vec a = -\frac{GM}{r^2}\hat r$ is parallel to $\vec r$, so $\vec r\times\vec a = \vec 0$. Only the direction of the force matters: every **central** force conserves $\vec h$, which is why orbits under any central force are planar and sweep equal areas in equal times.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2.6, pitch: 0.9, yaw: -1.2,
          curves: [{ param: ['1.6*cos(t)/(1 + 0.45*cos(t))', '1.6*sin(t)/(1 + 0.45*cos(t))', 0], t: [0, 2 * Math.PI], color: 'ink3', width: 1.6 }],
          points: [{ at: [0, 0, 0], color: 'gold', label: '\\text{Sun}' }],
          vectors: (() => {
            // θ = 120° on r = 1.6/(1 + 0.45 cos θ), GM = 1.5: a toward the Sun, v = √(GM/p)⟨−sin θ, e + cos θ⟩
            const th = 120 * D, rr = 1.6 / (1 + 0.45 * Math.cos(th)), P = [rr * Math.cos(th), rr * Math.sin(th), 0];
            const acc = 1.5 / (rr * rr), k = Math.sqrt(1.5 / 1.6), f = (x) => +x.toFixed(4);
            return [
              { to: P.map(f), color: 'accent', label: '\\vec r' },
              { from: P.map(f), to: [f(P[0] - 1.6 * acc * Math.cos(th)), f(P[1] - 1.6 * acc * Math.sin(th)), 0], color: 'violet', label: '\\vec a' },
              { from: P.map(f), to: [f(P[0] - k * Math.sin(th)), f(P[1] + k * (0.45 + Math.cos(th))), 0], color: 'good', label: '\\vec v' },
            ];
          })(),
        },
        caption: 'Drag to rotate. A planet’s position, velocity and acceleration at one point of its orbit.',
      },
    }),
    num({
      id: 'aphelion-speed', difficulty: 2,
      gen(r) {
        const B = r.pick([
          { key: 'earth', name: 'Earth', rp: 1.4710e11, ra: 1.5210e11, vp: 30.29, unit: 'm' },
          { key: 'mercury', name: 'Mercury', rp: 4.600e10, ra: 6.982e10, vp: 58.97, unit: 'm' },
          { key: 'halley', name: 'Halley’s comet', rp: 8.802e10, ra: 5.246e12, vp: 54.46, unit: 'm' },
          { key: 'moon', name: 'the Moon (round Earth)', rp: 3.633e8, ra: 4.055e8, vp: 1.082, unit: 'm' },
        ]);
        const va = (B.vp * B.rp) / B.ra;
        const errors = distinct(va, [
          { value: (B.vp * B.ra) / B.rp, feedback: t`Farther out means slower: $r_av_a = r_pv_p$, so $v_a = v_p\,r_p/r_a$, not $v_p\,r_a/r_p$.` },
          { value: B.vp * Math.sqrt(B.rp / B.ra), feedback: t`That would hold for circular orbits of the two radii. On one orbit, the constant is $h = r_pv_p = r_av_a$.` },
        ]);
        return {
          prompt: t`${B.name[0].toUpperCase() + B.name.slice(1)} moves at $${B.vp}$ km/s at perihelion, $${tex(B.rp, 4)}$ m from the centre of attraction; aphelion is $${tex(B.ra, 4)}$ m away. How fast does it move at aphelion, in km/s?`,
          answer: va, units: 'km/s', tol: { rel: 0.005 }, errors,
          hints: [t`At both apsides $\vec v \perp \vec r$, so $h = rv$ there.`, t`$h$ is conserved: $r_av_a = r_pv_p$.`],
          teach: t`At the apsides $\vec v \perp \vec r$, so conservation of $h = |\vec r\times\vec v|$ gives $r_av_a = r_pv_p$.`,
          explain: t`$v_a = v_p\dfrac{r_p}{r_a} = ${B.vp}\times\dfrac{${tex(B.rp, 4)}}{${tex(B.ra, 4)}} = ${nice(va, 3)}$ km/s.${B.key === 'halley' ? ' Halley’s comet crawls through the outer Solar System at under 1 km/s and spends most of its 75-year orbit out there.' : ''}`,
          visual: orbitPic(B.key, 'The real orbit, to scale, with twelve sectors swept in equal times.'),
        };
      },
    }),
    mcq({
      id: 'lrl-direction', difficulty: 2,
      prompt: t`Which way does the Laplace–Runge–Lenz vector $\vec A = \vec v\times\vec h - GM\hat r$ of an elliptical orbit point?`,
      choices: ['From the Sun toward perihelion, along the long axis of the ellipse', t`Along $\vec h$, perpendicular to the orbit’s plane`, 'From the Sun toward aphelion', 'Along the planet’s velocity at perihelion'],
      answer: 0,
      why: {
        1: t`$\vec v\times\vec h$ is perpendicular to $\vec h$, and so is $\hat r$: $\vec A$ lies in the orbit’s plane.`,
        2: t`In $r = \frac{h^2/GM}{1 + e\cos\theta}$, with $\theta$ measured from $\vec A$, $r$ is smallest at $\theta = 0$: perihelion.`,
        3: t`At perihelion $\vec v\times\vec h$ and $\hat r$ both point straight out from the Sun, so their combination does too — along $\hat r$, not along $\vec v$.`,
      },
      hints: [t`$r = \dfrac{h^2/GM}{1 + e\cos\theta}$, where $\theta$ is measured from $\vec A$. Where is $r$ smallest?`],
      teach: 'A is a fixed arrow in the orbit plane, pointing from the focus to perihelion, with length e·GM.',
      explain: t`$r$ is smallest where $\cos\theta = 1$, so $\vec A$ points at perihelion. Because $\vec A$ is conserved, the ellipse does not turn — for a pure $1/r^2$ force. Mercury’s perihelion does creep round, by 574″ per century: planetary tugs explain 531″, and the last 43″ was the first triumph of general relativity.`,
      visual: orbitPic('mercury', 'Mercury’s orbit, to scale.', { sectors: 0, labels: false }),
    }),
    num({
      id: 'eccentricity-from-state', difficulty: 3,
      gen(r) {
        // a state vector whose orbit clears the atmosphere (perigee above 200 km)
        let rx, vr, vt, e, rpk;
        for (let k = 0; k < 60; k++) {
          rx = r.pick([6800, 7000, 7500, 8000]); vr = r.pick([-0.8, -0.4, 0.4, 0.8]); vt = r.pick([7.6, 8, 8.4]);
          const hh = rx * vt, Ax = vt * hh - GM_E_KM, Ay = -vr * hh;
          e = Math.hypot(Ax, Ay) / GM_E_KM; rpk = (hh * hh) / GM_E_KM / (1 + e);
          if (rpk > R_EARTH_KM + 200) break;
        }
        const h = rx * vt;
        const errors = distinct(e, [
          { value: Math.abs(vt * h - GM_E_KM) / GM_E_KM, feedback: t`$\vec v\times\vec h$ has a $y$-component too, $-v_r h$, from the radial part of the velocity.` },
          { value: (Math.hypot(vt, vr) * h) / GM_E_KM, feedback: t`Subtract $GM\hat r$: $\vec A = \vec v\times\vec h - GM\hat r$.` },
        ]);
        return {
          prompt: t`A tracking station fixes a satellite at $\vec r = \langle ${rx}, 0, 0\rangle$ km from Earth’s centre, moving with $\vec v = \langle ${vr}, ${vt}, 0\rangle$ km/s. With $GM = 398\,600$ km³/s², find $\vec h$ and the Laplace–Runge–Lenz vector, and from it the orbit’s eccentricity, to 3 significant figures.`,
          answer: e, tol: { rel: 0.005, abs: 0.0005 }, errors,
          hints: [t`$\vec h = \vec r\times\vec v = ${big(rx * vt)}\,\hat k$ km²/s.`, t`$\vec v\times\vec h = \langle v_y h,\ -v_x h,\ 0\rangle$; then $\vec A = \vec v\times\vec h - GM\hat\imath$ and $e = |\vec A|/GM$.`],
          teach: 'One position and one velocity fix an orbit: e = |v × h − GM r̂|/GM.',
          explain: t`$\vec h = ${big(h)}\,\hat k$ km²/s, $\vec v\times\vec h = \langle ${big(vt * h)},\ ${big(-vr * h)},\ 0\rangle$, so $\vec A = \langle ${big(vt * h - GM_E_KM)},\ ${big(-vr * h)},\ 0\rangle$ km³/s² and $e = |\vec A|/GM = ${nice(e, 3)}$. Perigee is then $\frac{h^2/GM}{1 + e} = ${nice(rpk, 4)}$ km from Earth’s centre, in the direction of $\vec A$.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 9,
              spheres: [{ centre: [0, 0, 0], radius: 6.371, color: 'teal' }],
              points: [{ at: [rx / 1000, 0, 0], color: 'gold' }],
              vectors: [{ to: [rx / 1000, 0, 0], color: 'accent', label: '\\vec r' }, { from: [rx / 1000, 0, 0], to: [rx / 1000 + 0.35 * vr, 0.35 * vt, 0], color: 'good', label: '\\vec v' }],
            },
            caption: 'Drag to rotate. Earth (teal circles, radius 6371 km) and the satellite’s position and velocity; 1 unit is 1000 km, and the velocity is drawn at 0.35 units per km/s.',
          },
        };
      },
    }),
    num({
      id: 'orbit-equation', difficulty: 2,
      gen(r) {
        const B = r.pick([
          { key: 'mercury', name: 'Mercury', p: 0.3707, e: 0.2056, unit: 'AU' },
          { key: 'halley', name: 'Halley’s comet', p: 1.157, e: 0.967, unit: 'AU' },
          { key: 'gto', name: 'a satellite on a geostationary transfer orbit', p: 11445, e: 0.7286, unit: 'km' },
        ]);
        const th = r.pick([60, 90, 120, 150]), rr = B.p / (1 + B.e * Math.cos(th * D));
        const errors = distinct(rr, [
          { value: B.p / (1 - B.e * Math.cos(th * D)), feedback: t`The sign: $r = \frac{p}{1 + e\cos\theta}$, smallest at $\theta = 0$ (perihelion).` },
          { value: B.p * (1 + B.e * Math.cos(th * D)), feedback: t`Divide by $1 + e\cos\theta$ rather than multiply.` },
        ]);
        return {
          prompt: t`The orbit of ${B.name} is $r = \dfrac{${B.p}\ \text{${B.unit}}}{1 + ${B.e}\cos\theta}$, with $\theta$ measured from perihelion. How far from the centre of attraction is it at $\theta = ${th}^\circ$, in ${B.unit}?`,
          answer: rr, units: B.unit, tol: { rel: 0.005 }, errors,
          hints: [t`$\cos ${th}^\circ = ${nice(Math.cos(th * D), 4)}$.`],
          teach: 'The orbit equation r = p/(1 + e cos θ) gives the distance at any angle from perihelion.',
          explain: t`$r = \dfrac{${B.p}}{1 + ${B.e}(${nice(Math.cos(th * D), 4)})} = ${nice(rr, 4)}$ ${B.unit}.${th === 90 ? t` At $90^\circ$ the distance is $p = h^2/GM$ itself, the **semi-latus rectum**.` : ''}`,
          visual: orbitPic(B.key, 'The real orbit, to scale.', { sectors: 0 }),
        };
      },
    }),
    num({
      id: 'third-law', difficulty: 2,
      gen(r) {
        const B = r.pick([
          { key: 'gps', name: 'A GPS satellite', a: 26560e3, GM: GM_EARTH, per: 3600, unit: 'h', unitName: 'hours' },
          { key: 'geo', name: 'A geostationary satellite', a: 42164e3, GM: GM_EARTH, per: 3600, unit: 'h', unitName: 'hours' },
          { key: 'moon', name: 'The Moon', a: 384400e3, GM: GM_EARTH + GM_MOON, per: 86400, unit: 'd', unitName: 'days' },
        ]);
        const T = (2 * Math.PI * Math.sqrt(B.a ** 3 / B.GM)) / B.per;
        const errors = distinct(T, [{ value: Math.sqrt(B.a ** 3 / B.GM) / B.per, feedback: t`$T = 2\pi\sqrt{a^3/GM}$ — the $2\pi$ comes from the ellipse’s area $\pi ab$ and the areal rate $h/2$.` }]);
        return {
          prompt: t`${B.name} orbits Earth with semi-major axis $a = ${tex(B.a, 5)}$ m. With $GM = ${tex(B.GM, 4)}$ m³/s², what is its period, in ${B.unitName}?`,
          answer: T, units: B.unit, tol: { rel: 0.005 }, errors,
          hints: [t`$T^2 = \dfrac{4\pi^2}{GM}a^3$.`],
          teach: 'Kepler’s third law: T = 2π√(a³/GM), whatever the eccentricity.',
          explain: t`$T = 2\pi\sqrt{\dfrac{(${tex(B.a, 5)})^3}{${tex(B.GM, 4)}}} = ${tex(T * B.per, 4)}$ s $= ${nice(T, 4)}$ ${B.unitName}.${B.key === 'geo' ? ' One sidereal day: the satellite keeps pace with Earth’s rotation.' : B.key === 'gps' ? ' Half a sidereal day, so each satellite traces the same ground track daily.' : ' The sidereal month.'}`,
          visual: orbitPic(B.key, 'The orbit, to scale, with Earth.', { sectors: 0 }),
        };
      },
    }),
    mcq({
      id: 'period-area', difficulty: 2,
      prompt: t`The derivation of the third law starts from the second. Which expression is the period $T$ of an elliptical orbit with semi-axes $a$ and $b$?`,
      choices: [t`$T = \dfrac{\pi ab}{h/2}$: the ellipse’s area divided by the constant areal rate`, t`$T = \dfrac{2\pi a}{v}$: the distance round divided by the speed`, t`$T = \dfrac{\pi ab}{h}$`, t`$T = \dfrac{2\pi a}{h}$`],
      answer: 0,
      why: {
        1: t`The speed is not constant on an ellipse, and the distance round an ellipse is not $2\pi a$ — this only works for circles.`,
        2: t`The area is swept at $\frac12|\vec r\times\vec v| = h/2$, not $h$.`,
        3: t`The units are wrong: $h$ is m²/s, so $2\pi a/h$ is s/m. Area over areal rate gives seconds.`,
      },
      hints: [t`Area is swept at the constant rate $dA/dt = h/2$.`],
      teach: 'One period sweeps the whole ellipse, area πab, at the constant rate h/2.',
      explain: t`In one period the radius line sweeps the whole ellipse, area $\pi ab$, at the steady rate $h/2$, so $T = 2\pi ab/h$. With $b^2 = a\,h^2/GM$ (since $b^2 = a^2(1 - e^2)$ and $h^2/GM = a(1 - e^2)$), squaring gives $T^2 = 4\pi^2a^3/GM$.`,
      visual: orbitPic('halley', 'Halley’s comet, to scale, with twelve sectors swept in equal times — each one twelfth of the ellipse’s area.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-apogee', difficulty: 2,
      gen(r) {
        const hp = r.pick([200, 300, 400]), vp = r.pick([8, 8.5, 9, 9.5]), rp = R_EARTH_KM + hp;
        const h = rp * vp, p = (h * h) / GM_E_KM, e = p / rp - 1, ra = p / (1 - e);
        const errors = distinct(ra, [
          { value: ra - R_EARTH_KM, feedback: 'That is the apogee altitude above the surface. The question asks for the distance from Earth’s centre.' },
          { value: p, feedback: t`That is $p = h^2/GM$, the distance at $\theta = 90^\circ$. Apogee is at $\theta = 180^\circ$: $r_a = p/(1 - e)$.` },
        ]);
        return {
          prompt: t`A satellite passes perigee ${hp} km above Earth’s surface ($r_p = ${rp}$ km from the centre) at $${vp}$ km/s. With $GM = 398\,600$ km³/s², how far from Earth’s centre is its apogee, in km?`,
          answer: ra, units: 'km', tol: { rel: 0.005 }, errors,
          hints: [t`$h = r_pv_p$ and $p = h^2/GM$; then $r_p = p/(1 + e)$ gives $e$, and $r_a = p/(1 - e)$.`],
          teach: t`From perigee data: $h = r_pv_p$, $p = h^2/GM$, $e = p/r_p - 1$, and apogee $r_a = p/(1 - e)$.`,
          explain: t`$h = ${rp}\times${vp} = ${nice(h, 6)}$ km²/s, $p = h^2/GM = ${nice(p, 5)}$ km, $e = p/r_p - 1 = ${nice(e, 4)}$, so $r_a = p/(1 - e) = ${nice(ra, 4)}$ km — an apogee altitude of $${nice(ra - R_EARTH_KM, 4)}$ km.`,
          visual: orbitPic('gto', 'A transfer orbit of the same kind: low perigee, high apogee (drawn to scale; the numbers differ).', { sectors: 0 }),
        };
      },
    }),
    num({
      id: 'cp-jupiter', difficulty: 2,
      gen(r) {
        const [name, aKm, Td] = r.pick([['Io', 421700, 1.769138], ['Europa', 671100, 3.551181], ['Ganymede', 1070400, 7.154553], ['Callisto', 1882700, 16.689018]]);
        const a = aKm * 1e3, T = Td * 86400, GM = (4 * Math.PI ** 2 * a ** 3) / T ** 2, ans = GM / 1e17;
        const errors = distinct(ans, [
          { value: (a ** 3 / T ** 2) / 1e17, feedback: t`$GM = 4\pi^2a^3/T^2$: keep the $4\pi^2$.` },
          { value: (4 * Math.PI ** 2 * aKm ** 3) / Td ** 2 / 1e17, feedback: 'Work in metres and seconds before combining.' },
        ]);
        return {
          prompt: t`Jupiter’s moon ${name} orbits at $a = ${aKm.toLocaleString('en-US').replace(/,/g, '\\,')}$ km with a period of $${Td}$ days. Use Kepler’s third law to find Jupiter’s $GM$, in units of $10^{17}$ m³/s², to 3 significant figures.`,
          answer: ans, tol: { rel: 0.005 }, errors,
          hints: [t`$GM = \dfrac{4\pi^2a^3}{T^2}$, with $a$ in m and $T$ in s.`],
          teach: 'Kepler’s third law weighs the central body: GM = 4π²a³/T².',
          explain: t`$GM = \dfrac{4\pi^2(${tex(a, 4)})^3}{(${tex(T, 5)})^2} = ${tex(GM, 4)}$ m³/s² — Jupiter’s accepted value is $1.267\times10^{17}$ m³/s², about 318 Earths.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 2.4,
              spheres: [{ centre: [0, 0, 0], radius: 0.167, color: 'warn' }],
              curves: [[421700, 'ink3'], [671100, 'ink3'], [1070400, 'ink3'], [1882700, 'ink3']].map(([ak, col]) => ({ param: [`${nice(ak / 1882700 * 2.2, 4)}*cos(t)`, `${nice(ak / 1882700 * 2.2, 4)}*sin(t)`, 0], t: [0, 2 * Math.PI], color: ak === aKm ? 'accent' : col, width: ak === aKm ? 2.6 : 1.2 })),
            },
            caption: `Drag to rotate. The orbits of Jupiter’s four large moons to scale (Jupiter, orange, drawn twice its size); ${name}’s in blue.`,
          },
        };
      },
    }),
    num({
      id: 'cp-s2', difficulty: 3, transfer: true,
      prompt: t`The star S2 orbits the black hole Sagittarius A* at the centre of the Milky Way with a period of $16.05$ years on an ellipse of semi-major axis about $1030$ AU. For Earth round the Sun, $a = 1$ AU and $T = 1$ year. Use Kepler’s third law to find the black hole’s mass, in **millions** of solar masses.`,
      answer: 1030 ** 3 / 16.05 ** 2 / 1e6, tol: { rel: 0.01 },
      errors: [
        { value: 1030 ** 3 / 16.05 / 1e6, feedback: t`The period enters squared: $M \propto a^3/T^2$.` },
        { value: 1030 ** 2 / 16.05 ** 2 / 1e6, feedback: t`The semi-major axis enters cubed: $M \propto a^3/T^2$.` },
      ],
      hints: [t`$T^2 = \dfrac{4\pi^2}{GM}a^3$, so $M \propto a^3/T^2$.`, t`For the Sun, $a^3/T^2 = 1$ in AU and years; so $M/M_\odot = (a/\text{AU})^3/(T/\text{yr})^2$.`],
      teach: 'In AU, years and solar masses Kepler’s third law reads M = a³/T²: an orbit weighs what it circles.',
      explain: t`$\dfrac{M}{M_\odot} = \dfrac{1030^3}{16.05^2} = \dfrac{${tex(1030 ** 3, 4)}}{${nice(16.05 ** 2, 4)}} = ${tex(1030 ** 3 / 16.05 ** 2, 3)}$: about 4.2 million Suns, in a region smaller than S2’s 120 AU pericentre distance — through which the star swings at nearly 7700 km/s. Published fits give $4.3$ million; the small difference comes from the rounded orbit size used here.`,
      visual: orbitPic('s2', 'The orbit of S2 round Sagittarius A*, to scale, with twelve sectors swept in equal times.'),
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §3.4 Motion in Space (Kepler’s laws)', url: 'https://openstax.org/books/calculus-volume-3/pages/3-4-motion-in-space' },
    { label: 'Wikipedia: Laplace–Runge–Lenz vector', url: 'https://en.wikipedia.org/wiki/Laplace%E2%80%93Runge%E2%80%93Lenz_vector' },
    { label: 'NASA Planetary Fact Sheets (orbit data)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    { label: 'GRAVITY Collaboration 2020, the orbit of S2 (A&A 636, L5)', url: 'https://doi.org/10.1051/0004-6361/202037813' },
  ],
});
