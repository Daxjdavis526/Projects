// Kepler orbits (Taylor §8.5–8.7): with u = 1/r and φ as the variable, the
// radial equation becomes Binet's u″ + u = −μF/(ℓ²u²); for gravity the right
// side is the constant GMm²/L², so u = (GMm²/L²)(1 + e cos φ): the conic
// r = c/(1 + e cos φ) with c = L²/(GMm²) and e from the energy,
// E = (GMm)²m(e² − 1)/(2L²). Kepler III and the vis-viva equation
// v² = GM(2/r − 1/a) — the equation M4.4's checkpoint points to. Worked: a
// Molniya orbit (e, c, period 718 min, perigee and apogee speeds). Practice:
// conic type from E, Binet's solution, vis-viva, the period from rp and ra
// (a is not the apoapsis), e from ε and h, same r and v ⇒ same a. Transfer:
// a GTO's apogee speed; comets 67P, Encke and NEOWISE at perihelion.
// Links (not reused): math1220.C2-6.6 (conics), math2210.C3-2.5 (Kepler's laws
// from vector calculus), phys2210.M13.4 (Kepler's laws), prog.P1.3 (Hohmann code).
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { sci, r6, gpic, distinct } from './_cm.js';
import { GM_E, GM_SUN, R_EQ, AU, visviva, orb, conic, disc, ring } from './_cm3.js';

const t = String.raw;

const MO = (() => {
  const rp = R_EQ + 600e3, ra = R_EQ + 39750e3, a = (rp + ra) / 2, e = (ra - rp) / (ra + rp), c = a * (1 - e * e);
  return { rp, ra, a, e, c, T: 2 * Math.PI * Math.sqrt(a ** 3 / GM_E), vp: visviva(GM_E, rp, a), va: visviva(GM_E, ra, a) };
})();

// an Earth orbit picture in km: Earth to scale, the ellipse, a marked point
function earthOrbit({ rp, ra, at = null, caption, alt, vec = false }) {
  const R = ra * 1.08;
  const p = (2 * rp * ra) / (rp + ra), e = (ra - rp) / (ra + rp);
  const pts = [];
  if (at !== null) { const rr = p / (1 + e * Math.cos(at)); pts.push({ x: r6(rr * Math.cos(at)), y: r6(rr * Math.sin(at)), color: 'warn', r: 6 }); }
  return gpic({
    x: [-R, rp * 1.6], y: [-0.62 * R, 0.62 * R], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [disc(R_EQ / 1e3)], curves: [conic(rp, ra, { color: 'accent', width: 2 })], points: pts,
    arrows: vec && at !== null ? [{ from: [pts[0].x, pts[0].y], to: [pts[0].x, r6(pts[0].y + (at === 0 ? 0.25 : -0.25) * R)], color: 'warn', label: 'v', labelDx: 6, labelDy: 0 }] : [],
  }, caption, alt || 'An elliptical orbit around Earth');
}

export default lesson({
  id: 'phys3550.M5.3',
  title: 'Kepler orbits',
  minutes: 18, difficulty: 3,
  intro: t`The radial equation of [M5.2](#/lesson/phys3550.M5.2) is nonlinear in $r$ and awkward in $t$. Two changes of variable tame it: use $u = 1/r$, and ask for the **shape** $u(\phi)$ instead of $u(t)$. Conserved $L = mr^2\dot\phi$ turns $d/dt$ into $(Lu^2/m)\,d/d\phi$, and Newton's law becomes Binet's equation. For gravity its right side is a constant, so the orbit is a cosine in $1/r$ — a conic section with the Sun at a focus. Energy conservation then gives the speed anywhere on it, the **vis-viva** equation, which mission designers use more than any other:

$$v^2 = GM\left(\frac{2}{r} - \frac{1}{a}\right)$$`,
  equation: t`u'' + u = \frac{GMm^2}{L^2} \quad\Longrightarrow\quad r(\phi) = \frac{c}{1 + e\cos\phi}`,
  symbols: [
    { tex: 'u = 1/r', text: 'the reciprocal distance, in m⁻¹; a prime means $d/d\\phi$' },
    { tex: '\\phi', text: 'the angle from periapsis (the **true anomaly**), in rad' },
    { tex: 'G,\\ M,\\ m', text: 'Newton’s constant, the central mass and the orbiting mass, in kg (for a binary use $\\mu$ for $m$ and $m_1 + m_2$ for $M$)' },
    { tex: 'L', text: 'the conserved angular momentum $mr^2\\dot\\phi$, in kg·m²/s' },
    { tex: 'c = L^2/GMm^2', text: 'the **semi-latus rectum**: the distance at $\\phi = 90^\\circ$, in m' },
    { tex: 'e', text: 'the **eccentricity**: 0 a circle, below 1 an ellipse, 1 a parabola, above 1 a hyperbola' },
    { tex: 'v,\\ a', text: 'in vis-viva: the speed at distance $r$ (m/s) and the semi-major axis (m), $a = c/(1 - e^2)$' },
  ],
  why: t`Every orbit determination, launch window and transfer burn starts here — and in general relativity the same $u'' + u$ gains one small term that makes Mercury's orbit precess.`,
  visual: {
    type: 'cm3-orbit',
    title: 'One equation, four conics',
    lead: t`Gravity in units with $GM = m = 1$. Every orbit here solves $u'' + u = 1/L^2$, and its eccentricity is $e = \sqrt{1 + 2EL^2}$. Drag the energy line and read $e$ below.`,
    tasks: [
      t`Put $E$ at the floor of the well: $e = 0$, a circle of radius $c = L^2$.`,
      t`Raise $E$ to exactly 0: $e = 1$, a parabola — the body just escapes.`,
      t`Above zero, $e > 1$: a hyperbola, with one turning point only. Change $L$ at fixed $E$: $c$ and $e$ both change, but the semi-major axis $a = -1/2E$ of an ellipse does not.`,
    ],
    params: { force: 'kepler', L: 1, E: -0.25, sliders: ['L', 'E'], ranges: { L: [0.6, 1.4, 0.01], E: [-1.2, 0.4, 0.005] }, view: 4.2, r: [0, 4.6], y: [-1, 0.5], readouts: ['E', 'L', 'rp', 'ra', 'ecc'], turns: 1 },
    caption: t`Gravity in units with $GM = m = 1$; orbit integrated from Binet's equation and drawn to scale, the attracting mass fixed at the focus.`,
  },
  example: {
    prompt: t`A Molniya communications satellite has its perigee 600 km and its apogee 39 750 km above Earth's equatorial radius (6378 km). Find its eccentricity, semi-latus rectum and period, and its speeds at perigee and apogee. ($GM = 3.986\times10^{14}$ m³/s².)`,
    visual: earthOrbit({ rp: MO.rp / 1e3, ra: MO.ra / 1e3, at: 0, vec: true, caption: t`The Molniya orbit with Earth to scale, the satellite at perigee. It spends most of its 12 hours slowly crossing the far end, high above the northern hemisphere.` }),
    steps: [
      { label: 'Distances', text: t`From Earth's centre: $r_p = ${sci(MO.rp / 1e3, 5)}$ km and $r_a = ${sci(MO.ra / 1e3, 5)}$ km. On the conic, $r_p = c/(1 + e)$ at $\phi = 0$ and $r_a = c/(1 - e)$ at $\phi = 180^\circ$.` },
      { label: 'Shape', text: t`Divide: $r_a/r_p = (1 + e)/(1 - e)$, so $e = \dfrac{r_a - r_p}{r_a + r_p} = ${MO.e.toFixed(4)}$, and $c = r_p(1 + e) = ${sci(MO.c / 1e3, 5)}$ km.` },
      { label: 'Period', text: t`$a = (r_p + r_a)/2 = ${sci(MO.a / 1e3, 5)}$ km, and Kepler's third law gives $T = 2\pi\sqrt{a^3/GM} = ${sci(MO.T / 60, 4)}$ min — half a sidereal day, so the ground track repeats daily.` },
      { label: 'Vis-viva', text: t`$v_p = \sqrt{GM(2/r_p - 1/a)} = ${sci(MO.vp / 1e3, 4)}$ km/s and $v_a = ${sci(MO.va / 1e3, 4)}$ km/s.` },
      { label: 'Sense check', text: t`Angular momentum: $r_pv_p = ${sci((MO.rp * MO.vp) / 1e6, 5)}\times10^{6}$ and $r_av_a = ${sci((MO.ra * MO.va) / 1e6, 5)}\times10^{6}$ m²/s ✓ (equal, as [M4.4](#/lesson/phys3550.M4.4) requires). And $c = h^2/GM$ ✓.` },
    ],
    answer: t`$e = ${MO.e.toFixed(3)}$, $c = ${sci(MO.c / 1e3, 4)}$ km, $T = ${sci(MO.T / 60, 3)}$ min; $v_p = ${sci(MO.vp / 1e3, 3)}$ km/s at perigee and $v_a = ${sci(MO.va / 1e3, 3)}$ km/s at apogee.`,
  },
  practice: [
    mcq({
      id: 'conic-from-E', difficulty: 1,
      prompt: t`From $E = \dfrac{(GMm)^2m}{2L^2}(e^2 - 1)$, what is the orbit of a body with total energy exactly zero?`,
      visual: orb({ force: 'kepler', L: 1, E: 0, view: 3.5, r: [0, 4], y: [-1, 0.5], panels: ['ueff'], turning: false, allowed: false }, t`$U_{\text{eff}}$ with the energy line at $E = 0$ (units with $GM = m = 1$).`),
      choices: [t`A parabola ($e = 1$): it just escapes, arriving at infinity with zero speed`, t`A circle ($e = 0$)`, t`A hyperbola ($e > 1$)`, t`An ellipse that reaches infinity and comes back`],
      answer: 0,
      why: { 1: t`A circle has $e = 0$, so $E = -(GMm)^2m/2L^2 < 0$: the bottom of the well.`, 2: t`A hyperbola needs $e > 1$, so $E > 0$: it arrives at infinity with speed to spare.`, 3: t`An ellipse has $E < 0$ and a finite apoapsis $a(1 + e)$; with $E = 0$ the semi-major axis $a = -GMm/2E$ is infinite.` },
      hints: [t`Set $E = 0$ in the formula: what must $e$ be?`],
      teach: t`The sign of the energy sorts the conics: negative ellipses, zero parabolas, positive hyperbolas.`,
      explain: t`$E = 0$ forces $e = 1$: a parabola. At $E = 0$ the speed at every $r$ is exactly the escape speed $\sqrt{2GM/r}$ — vis-viva with $a \to \infty$.`,
    }),
    expr({
      id: 'binet-solution', difficulty: 3,
      prompt: t`Solve Binet's equation $u'' + u = K$ (a constant) for a body at its periapsis at $\phi = 0$, where $u(0) = u_0$ and $u'(0) = 0$. Give $r(\phi) = 1/u$. Type $\phi$ as phi.`,
      answer: '1/(K + (u_0 - K)*cos(phi))', answerTeX: t`\frac{1}{K + (u_0 - K)\cos\phi}`,
      lhs: 'r(\\phi)', vars: { K: [0.5, 1], u_0: [1.2, 2], phi: [-1, 1] },
      errors: [{ answer: '1/(u_0*cos(phi))', feedback: t`You dropped the particular solution: $u = K$ solves the equation with the constant right side; add the homogeneous $A\cos\phi$ to it.` }, { answer: '1/(K + u_0*cos(phi))', feedback: t`Fit the constant: at $\phi = 0$, $u = K + A$ must equal $u_0$, so $A = u_0 - K$.` }],
      hints: [t`The general solution is a particular one plus the homogeneous $A\cos\phi + B\sin\phi$. Try a constant for the particular one.`, t`$u = K + A\cos\phi + B\sin\phi$; $u'(0) = 0$ kills $B$, and $u(0) = u_0$ fixes $A$.`],
      teach: t`Binet's equation for gravity is a driven harmonic oscillator in $\phi$: a constant plus a cosine — a conic.`,
      explain: t`$u = K + (u_0 - K)\cos\phi$, i.e. $r = c/(1 + e\cos\phi)$ with $c = 1/K = L^2/GMm^2$ and $e = u_0/K - 1$. The period of the cosine in $\phi$ is exactly $2\pi$, so the orbit closes — the special property of the inverse-square law ([M5.5](#/lesson/phys3550.M5.5)).`,
      visual: gpic({ x: [-3, 1.2], y: [-1.4, 1.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ polar: '1/(0.7 + 0.45*cos(theta))', theta: [0, 6.2832], color: 'accent', width: 2 }], points: [{ x: 0, y: 0, color: 'gold', r: 6 }, { x: 0.8696, y: 0, color: 'warn', r: 5, label: 'periapsis, φ = 0', labelDx: -40, labelDy: 18 }] }, t`One solution, drawn: periapsis on the right, the attracting mass at the focus (gold).`, 'An ellipse with a focus marked'),
    }),
    num({
      id: 'visviva', difficulty: 2,
      gen(r) {
        const o = r.pick([
          { name: 'a geostationary transfer orbit', hp: 250, ha: 35786 },
          { name: 'a Molniya-type orbit', hp: 500, ha: 39900 },
          { name: 'a highly elliptical orbit', hp: 400, ha: 20200 },
        ]);
        const rp = R_EQ / 1e3 + o.hp, ra = R_EQ / 1e3 + o.ha, a = (rp + ra) / 2;
        const rr = r.pick([0.3, 0.5, 0.7]) * (ra - rp) + rp, x = Math.round(rr);
        const v = visviva(GM_E, x * 1e3, a * 1e3) / 1e3;
        return {
          prompt: t`A satellite on ${o.name} has its perigee ${o.hp} km and its apogee ${o.ha.toLocaleString('en-US').replace(/,/g, ' ')} km above Earth's equatorial radius (6378 km). How fast is it moving when it is $${sci(x, 5)}$ km from Earth's centre, in km/s?`,
          answer: v, units: 'km/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(GM_E / (x * 1e3)) / 1e3, feedback: t`That is the circular speed at $r$. On an ellipse, vis-viva has the extra $-1/a$: $v^2 = GM(2/r - 1/a)$.` }, { value: visviva(GM_E, x * 1e3, ((o.hp + o.ha) / 2) * 1e3) / 1e3, feedback: t`Measure $a$ from Earth's centre: $a = (r_p + r_a)/2$ with both radii including Earth's 6378 km.` }], v),
          hints: [t`$a = (r_p + r_a)/2$, with the radii measured from Earth's centre.`, t`$v = \sqrt{GM(2/r - 1/a)}$, in metres then converted.`],
          teach: t`Vis-viva gives the speed anywhere on an orbit from just the distance and the semi-major axis.`,
          explain: t`$a = ${sci(a, 5)}$ km, so $v = \sqrt{3.986\times10^{14}\,(2/${sci(x * 1e3, 5)} - 1/${sci(a * 1e3, 5)})} = ${sci(v, 3)}$ km/s.`,
          visual: earthOrbit({ rp, ra, at: Math.acos(Math.max(-1, Math.min(1, (((2 * rp * ra) / (rp + ra)) / x - 1) / ((ra - rp) / (ra + rp))))), caption: t`The orbit with Earth to scale; the satellite is marked where it is $${sci(x, 5)}$ km from Earth's centre.` }),
        };
      },
    }),
    num({
      id: 'period-rp-ra', difficulty: 2,
      gen(r) {
        const hp = r.pick([300, 500, 1000]), ha = r.pick([5000, 12000, 25000]);
        const rp = R_EQ / 1e3 + hp, ra = R_EQ / 1e3 + ha, a = (rp + ra) / 2;
        const T = (2 * Math.PI * Math.sqrt((a * 1e3) ** 3 / GM_E)) / 3600;
        return {
          prompt: t`A satellite's perigee is ${hp} km and its apogee ${ha.toLocaleString('en-US').replace(/,/g, ' ')} km above Earth's equatorial radius (6378 km). What is its orbital period, in hours?`,
          answer: T, units: 'h', tol: { rel: 0.005 },
          errors: distinct([{ value: (2 * Math.PI * Math.sqrt((ra * 1e3) ** 3 / GM_E)) / 3600, feedback: t`The semi-major axis is **half the long axis**, $(r_p + r_a)/2$, not the apoapsis distance.` }, { value: (2 * Math.PI * Math.sqrt((((hp + ha) / 2) * 1e3) ** 3 / GM_E)) / 3600, feedback: t`Measure from Earth's centre: add 6378 km to each altitude before averaging.` }], T),
          hints: [t`$a = (r_p + r_a)/2$ with $r = 6378\ \text{km} + h$.`, t`$T = 2\pi\sqrt{a^3/GM}$.`],
          teach: t`Kepler's third law needs the semi-major axis — the average of the periapsis and apoapsis distances from the centre.`,
          explain: t`$a = (${sci(rp, 5)} + ${sci(ra, 5)})/2 = ${sci(a, 5)}$ km, and $T = 2\pi\sqrt{a^3/GM} = ${sci(T, 3)}$ h. Only $a$ matters: every orbit with this $a$, however eccentric, has this period.`,
          visual: earthOrbit({ rp, ra, caption: t`The orbit with Earth to scale (perigee on the right).` }),
        };
      },
    }),
    num({
      id: 'ecc-from-energy', difficulty: 3,
      gen(r) {
        const rr = r.pick([7000, 8000, 9000]) * 1e3, v = r.pick([7.8, 8.4, 9.2]) * 1e3, g = r.pick([10, 20, 30]) * (Math.PI / 180);
        const eps = (v * v) / 2 - GM_E / rr, h = rr * v * Math.cos(g);
        const e = Math.sqrt(1 + (2 * eps * h * h) / GM_E ** 2);
        return {
          prompt: t`A spacecraft $${sci(rr / 1e3, 4)}$ km from Earth's centre moves at ${v / 1e3} km/s, its velocity tilted $${Math.round(g * 57.2958)}^\circ$ above the local horizontal. Find the eccentricity of its orbit from $e = \sqrt{1 + 2\varepsilon h^2/(GM)^2}$, where $\varepsilon$ is the energy and $h$ the angular momentum, both per unit mass.`,
          answer: e, tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(1 + (2 * eps * (rr * v) ** 2) / GM_E ** 2), feedback: t`Only the horizontal component of velocity carries angular momentum: $h = rv\cos\gamma$, with $\gamma$ the tilt above horizontal.` }, { value: Math.sqrt(1 + (2 * eps * (rr * v * Math.sin(g)) ** 2) / GM_E ** 2), feedback: t`$\gamma$ is measured from the horizontal, so the horizontal component is $v\cos\gamma$, not $v\sin\gamma$.` }], e),
          hints: [t`$\varepsilon = \tfrac12v^2 - GM/r$ (it does not care about direction); $h = r\,v_\perp$.`, t`$v_\perp = v\cos\gamma$ with $\gamma$ the angle above horizontal.`],
          teach: t`Energy fixes the size of an orbit and angular momentum its shape: $e$ needs both.`,
          explain: t`$\varepsilon = ${sci(eps, 4)}$ J/kg, $h = ${sci(h, 4)}$ m²/s, so $e = ${sci(e, 3)}$ — ${e < 1 ? 'an ellipse' : 'a hyperbola: it escapes'}.`,
          visual: gpic({ x: [-1.2, 1.6], y: [-0.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(0.35)], curves: [{ param: ['1.1*cos(t)', '1.1*sin(t)'], t: [0.8, 2.4], color: 'ink4', width: 1, dash: true }], points: [{ x: 0, y: 1.1, color: 'warn', r: 6 }], arrows: [{ from: [0, 1.1], to: [r6(0.8 * Math.cos(g)), r6(1.1 + 0.8 * Math.sin(g))], color: 'warn', label: 'v', labelDx: 6, labelDy: -4 }, { from: [0, 1.1], to: [0.8, 1.1], color: 'ink3', width: 1, dash: true, label: 'horizontal', labelDx: 6, labelDy: 10 }] }, t`The spacecraft above Earth (not to scale) with its velocity tilted above the local horizontal.`, 'A spacecraft with a velocity tilted above horizontal'),
        };
      },
    }),
    mcq({
      id: 'same-a', difficulty: 3,
      prompt: t`Two probes pass the same point, the same distance $r$ from a planet, at the same speed — one moving horizontally, one climbing at $30^\circ$. Compare their orbits.`,
      visual: gpic({ x: [-2.2, 2.2], y: [-1.75, 2.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ polar: '1.21/(1 + 0.21*cos(theta))', theta: [0, 6.2832], color: 'accent', width: 2 }, { polar: '0.9075/(1 + 0.532048*cos(theta + 1.745541))', theta: [0, 6.2832], color: 'warn', width: 2 }], points: [{ x: 0, y: 0, color: 'gold', r: 6 }, { x: 1, y: 0, color: 'ink', r: 5, label: 'P', labelDx: 8, labelDy: 12 }] }, t`The two orbits through the same point P at the same speed, to scale. Their shapes and orientations differ.`, 'Two ellipses crossing at one point'),
      choices: [t`Same semi-major axis and period, different eccentricity and orientation`, t`The horizontal one has the larger orbit, since all its speed goes into going round`, t`The climbing one has the larger orbit, since it is heading outward`, t`Identical orbits, just started at different points`],
      answer: 0,
      why: { 1: t`The size of an orbit, $a$, depends only on the energy $\tfrac12v^2 - GM/r$, which does not care about direction.`, 2: t`Climbing raises the apoapsis but lowers the periapsis; the average, $a$, is unchanged.`, 3: t`Different directions give different angular momenta, so different $e$ — and the picture shows two different ellipses.` },
      hints: [t`Solve vis-viva for $a$: $1/a = 2/r - v^2/GM$. Which of these depends on direction?`, t`Direction enters only through the angular momentum $h = rv\cos\gamma$, and $h$ sets the eccentricity, not $a$.`],
      teach: t`Vis-viva says $a$ depends only on $r$ and the speed $v$: direction changes the shape, not the size.`,
      explain: t`$1/a = 2/r - v^2/GM$ is the same for both, so both have the same $a$ and (Kepler III) the same period. Direction sets $h = rv\cos\gamma$ and with it $e$ and the orientation. This is why a launch vehicle's job is mostly speed: the right speed at the right height fixes the orbit's size.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gto', difficulty: 2, transfer: true,
      gen(r) {
        const hp = r.pick([185, 250, 300, 400]);
        const rp = R_EQ + hp * 1e3, ra = R_EQ + 35786e3, a = (rp + ra) / 2;
        const va = visviva(GM_E, ra, a) / 1e3;
        return {
          prompt: t`A rocket's upper stage leaves its satellite on a geostationary transfer orbit: perigee ${hp} km, apogee 35 786 km above Earth's equatorial radius (6378 km). How fast is the satellite moving when it reaches apogee, in km/s?`,
          answer: va, units: 'km/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(GM_E / ra) / 1e3, feedback: t`That is the geostationary circular speed, 3.07 km/s — the satellite is slower than that at apogee, which is why it must fire its own motor there.` }, { value: visviva(GM_E, rp, a) / 1e3, feedback: t`That is the perigee speed. At apogee $r = r_a$.` }], va),
          hints: [t`$a = (r_p + r_a)/2$, all from Earth's centre.`, t`$v_a = \sqrt{GM(2/r_a - 1/a)}$.`],
          teach: t`Vis-viva at apogee: a transfer orbit arrives slower than the circular orbit it touches.`,
          explain: t`$a = ${sci(a / 1e3, 5)}$ km and $v_a = ${sci(va, 3)}$ km/s, against $${sci(Math.sqrt(GM_E / ra) / 1e3, 3)}$ km/s for a geostationary circle: the apogee burn of [M5.4](#/lesson/phys3550.M5.4) makes up the difference.`,
          visual: earthOrbit({ rp: rp / 1e3, ra: ra / 1e3, at: Math.PI, vec: true, caption: t`The transfer orbit with Earth to scale, the satellite at apogee.` }),
        };
      },
    }),
    num({
      id: 'cp-comet', difficulty: 2, transfer: true,
      gen(r) {
        const c = r.pick([
          { name: '67P/Churyumov–Gerasimenko', q: 1.2432, a: 3.463 },
          { name: '2P/Encke', q: 0.336, a: 2.215 },
          { name: 'C/2020 F3 (NEOWISE)', q: 0.2947, a: 270 },
        ]);
        const v = visviva(GM_SUN, c.q * AU, c.a * AU) / 1e3;
        return {
          prompt: t`Comet ${c.name} has a perihelion distance of ${c.q} AU and a semi-major axis of ${c.a} AU. How fast does it move at perihelion, in km/s? ($GM_\odot = 1.327\times10^{20}$ m³/s², 1 AU $= 1.496\times10^{11}$ m.)`,
          answer: v, units: 'km/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(GM_SUN / (c.q * AU)) / 1e3, feedback: t`That is the circular speed at ${c.q} AU. At perihelion of an ellipse the speed is higher: $v^2 = GM(2/r - 1/a)$.` }, { value: Math.sqrt((2 * GM_SUN) / (c.q * AU)) / 1e3, feedback: t`That is the escape speed — the $a \to \infty$ limit. Include the $-1/a$ term.` }], v),
          hints: [t`Vis-viva with $r = q$ and the given $a$, both in metres.`],
          teach: t`Vis-viva needs only the distance and the semi-major axis.`,
          explain: t`$v = \sqrt{GM_\odot(2/q - 1/a)} = ${sci(v, 3)}$ km/s.${c.a > 100 ? ' With $a$ in the hundreds of AU it is barely below the escape speed: a long-period comet is nearly parabolic.' : ''}`,
          visual: gpic({ x: [-2.3, 1.4], y: [-1, 1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [conic(0.4, 2, { color: 'accent', width: 2 }), { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }], points: [{ x: 0, y: 0, color: 'gold', r: 7, label: 'Sun', labelDx: -10, labelDy: 16 }, { x: 0.4, y: 0, color: 'warn', r: 5, label: 'perihelion', labelDx: 8, labelDy: -10 }] }, t`A comet's orbit with the Sun at a focus (Earth's orbit dashed). Schematic: not to scale for any particular comet.`, 'A comet orbit around the Sun'),
        };
      },
    }),
    order({
      id: 'cp-derivation', difficulty: 3,
      prompt: t`Put the derivation of a Kepler orbit in order.`,
      visual: orb({ force: 'kepler', L: 1, E: -0.3, view: 3, r: [0, 3.4], y: [-1, 0.5], panels: ['orbit'], turning: false }, t`The result: a closed ellipse with the attracting mass at a focus (units with $GM = m = 1$).`),
      items: [
        t`$L = mr^2\dot\phi$ is conserved, so $\dot\phi = L/mr^2$`,
        t`Put $u = 1/r$: $\dot r = -(L/m)\,u'$ and $\ddot r = -(L^2/m^2)\,u^2u''$`,
        t`The radial equation becomes $u'' + u = -mF/(L^2u^2)$`,
        t`For $F = -GMm\,u^2$ the right side is the constant $GMm^2/L^2$`,
        t`So $u = (GMm^2/L^2)(1 + e\cos\phi)$: the conic $r = c/(1 + e\cos\phi)$`,
      ],
      hints: [t`Conservation first; then the change of variables; then the force law.`, t`The solution comes last, once the equation is linear with a constant right side.`],
      teach: t`Binet's trick: conserved $L$ lets $\phi$ replace $t$, and $u = 1/r$ makes the inverse-square law linear.`,
      explain: t`Each step uses the one before: $\dot\phi$ from $L$ converts $d/dt$ to $d/d\phi$; with $u = 1/r$ the centripetal term $-r\dot\phi^2$ becomes the $+u$ on the left; gravity's $u^2$ cancels the $u^2$ from the conversion, leaving a constant — and $u'' + u = \text{constant}$ is solved by a cosine.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §8.6–8.7: the Kepler orbits and their energies', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. D. Curtis, Orbital Mechanics for Engineering Students, 4th ed. (Elsevier, 2020), ch. 2: the vis-viva equation and orbit elements', url: 'https://www.sciencedirect.com/book/9780128240250/orbital-mechanics-for-engineering-students' },
    { label: 'JPL Small-Body Database: orbital elements of 67P, 2P/Encke and C/2020 F3', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html' },
  ],
});
