// The effective potential (Taylor §8.4): with ℓ = μr²φ̇ conserved, the energy
// E = ½μṙ² + ℓ²/(2μr²) + U(r) is a one-dimensional problem in
// U_eff = U + ℓ²/(2μr²). Turning points where U_eff = E (periapsis and
// apoapsis), the circular orbit at the minimum, escape when E ≥ U(∞); the
// centrifugal barrier is the kinetic energy of the sideways motion, not a
// force. Stability of circular orbits for F ∝ −rⁿ needs n > −3. Explored in
// cm3-orbit (orbit beside U_eff, draggable E). Worked: a satellite released
// horizontally at 500 km and 8.2 km/s — its apogee from the turning-point
// quadratic. Transfer: a comet's perihelion; the GR term that gives the
// barrier a top (plunge orbits, ISCO) — pointer to gr.S20/gr.S25.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, distinct } from './_cm.js';
import { GM_E, GM_SUN, R_EQ, AU, orb, conic, disc } from './_cm3.js';

const t = String.raw;

const EX = (() => {
  const h0 = 500e3, v0 = 8200, r0 = R_EQ + h0;
  const eps = (v0 * v0) / 2 - GM_E / r0, hh = r0 * v0;
  const d = Math.sqrt(GM_E * GM_E + 2 * eps * hh * hh);
  const ra = (-GM_E - d) / (2 * eps), rp = (-GM_E + d) / (2 * eps);
  return { h0, v0, r0, eps, hh, ra, rp, alt: (ra - R_EQ) / 1e3, va: hh / ra, vc: Math.sqrt(GM_E / r0) };
})();

// U_eff (per unit mass, μ = k = 1) for mech-energy pictures
const kep = (L) => `-1/x + ${L}^2/(2*x^2)`;

export default lesson({
  id: 'phys3550.M5.2',
  title: 'The effective potential',
  minutes: 15, difficulty: 3,
  intro: t`For a central force the angular momentum $\ell = \mu r^2\dot\phi$ is conserved ([M4.4](#/lesson/phys3550.M4.4)). Use it to replace $\dot\phi$ in the energy, and the sideways part of the kinetic energy, $\tfrac12\mu r^2\dot\phi^2$, becomes $\ell^2/(2\mu r^2)$ — a function of $r$ alone. The energy then reads exactly like a particle on a line, moving in an **effective potential** $U_{\text{eff}}$. Every question about how close an orbit comes, how far it goes, or whether it escapes is now read off one curve: the body can be only where $U_{\text{eff}} \le E$, and its distance turns round where $U_{\text{eff}} = E$.`,
  equation: t`E = \tfrac12\mu\dot r^2 + U_{\text{eff}}(r), \qquad U_{\text{eff}}(r) = U(r) + \frac{\ell^2}{2\mu r^2}`,
  symbols: [
    { tex: 'E', text: 'the total energy of the relative motion, in J — conserved' },
    { tex: '\\mu', text: 'the reduced mass ([M5.1](#/lesson/phys3550.M5.1)), in kg; for a satellite, its own mass' },
    { tex: '\\dot r', text: 'the **radial** speed — how fast the distance changes — in m/s' },
    { tex: 'U(r)', text: 'the real potential energy of the central force, in J ($-GM\\mu/r$ for gravity)' },
    { tex: '\\ell', text: 'the angular momentum $\\mu r^2\\dot\\phi$, in kg·m²/s — conserved, so a constant in $U_{\\text{eff}}$' },
    { tex: '\\ell^2/2\\mu r^2', text: 'the **centrifugal barrier**: the kinetic energy of the sideways motion, written as a function of $r$, in J' },
  ],
  why: t`Turning points, circular orbits, escape and capture — for planets, satellites and black holes alike — are all read off this one curve; general relativity changes only its formula.`,
  visual: {
    type: 'cm3-orbit',
    title: 'An orbit beside its effective potential',
    lead: t`In the energy panel, $U_{\text{eff}}$ (blue) is the gravitational well (dashed grey) plus the centrifugal barrier (dashed violet). The gold line is the energy — drag it. The green band is where the body is allowed; its ends $r_p$ and $r_a$ are the dashed circles round the orbit. Press Play and watch the orange gap $E - U_{\text{eff}} = \tfrac12\mu\dot r^2$.`,
    tasks: [
      t`Drag $E$ down to the floor of the well: the two turning points merge and the orbit becomes a circle.`,
      t`Drag $E$ above zero: there is no outer turning point — the body escapes on a hyperbola.`,
      t`Lower $\ell$: the barrier shrinks and the body dives closer to the centre, but for gravity it never reaches it while $\ell > 0$.`,
    ],
    params: { force: 'kepler', L: 1, E: -0.3, sliders: ['L', 'E'], ranges: { L: [0.6, 1.4, 0.01], E: [-1.2, 0.4, 0.005] }, view: 4, r: [0, 4.6], y: [-1, 0.6], readouts: ['E', 'L', 'rp', 'ra', 'ecc', 'fate'], turns: 2 },
    caption: t`Gravity in units with $GM = \mu = 1$. The orbit is integrated exactly and drawn to scale; the energy line's turning points match the dashed circles. One body about a fixed centre: for a binary it is the motion of the separation.`,
  },
  example: {
    prompt: t`A satellite is released ${EX.h0 / 1e3} km above Earth's equatorial radius ($r_0 = ${sci(EX.r0 / 1e3, 5)}$ km) moving horizontally at ${EX.v0 / 1e3} km/s. Using the effective potential, find how far from Earth's centre it climbs. ($GM = 3.986\times10^{14}$ m³/s².)`,
    visual: orb({ force: 'kepler', L: 1, E: -0.36, view: 2.6, r: [0, 3], y: [-0.8, 0.5], turning: true }, t`The shape of the problem, in units with $GM = 1$: released horizontally at the inner turning point, the satellite climbs to the outer one.`),
    steps: [
      { label: 'Per unit mass', text: t`Divide by $\mu$ (the satellite's mass): $\varepsilon = E/\mu = \tfrac12\dot r^2 - \dfrac{GM}{r} + \dfrac{h^2}{2r^2}$, with $h = \ell/\mu = r^2\dot\phi$ the angular momentum per unit mass.` },
      { label: 'Constants', text: t`At release the velocity is horizontal, so $\dot r = 0$ and $h = r_0v_0 = ${sci(EX.hh, 4)}$ m²/s; $\varepsilon = \tfrac12v_0^2 - GM/r_0 = ${sci(EX.eps, 4)}$ J/kg. Negative: the orbit is bound.` },
      { label: 'Turning points', text: t`$\dot r = 0$ where $\varepsilon = -GM/r + h^2/2r^2$. Multiply by $r^2$: $\varepsilon r^2 + GMr - \tfrac12h^2 = 0$, a quadratic.` },
      { label: 'Solve', text: t`$r = \dfrac{-GM \pm \sqrt{(GM)^2 + 2\varepsilon h^2}}{2\varepsilon}$, giving $r = ${sci(EX.rp / 1e3, 5)}$ km (the release point itself) and $r = ${sci(EX.ra / 1e3, 4)}$ km.` },
      { label: 'Sense check', text: t`One root must be $r_0$ — the release point is a turning point because $\dot r = 0$ there ✓. The speed ${EX.v0 / 1e3} km/s exceeds the circular ${sci(EX.vc / 1e3, 3)} km/s, so the release point is the perigee and the satellite climbs, to an altitude of $${sci(EX.alt, 3)}$ km.` },
    ],
    answer: t`It climbs to $r_a = ${sci(EX.ra / 1e3, 4)}$ km from Earth's centre (about $${sci(EX.alt, 3)}$ km up), where $\dot r = 0$ again.`,
  },
  practice: [
    mcq({
      id: 'barrier-meaning', difficulty: 2,
      prompt: t`What is the centrifugal barrier $\ell^2/2\mu r^2$ in $U_{\text{eff}}$?`,
      visual: orb({ force: 'kepler', L: 1, E: -0.3, view: 3.4, r: [0, 4], y: [-1, 0.8], turning: false, apsides: false, panels: ['ueff'] }, t`$U_{\text{eff}}$ (blue) as the well $U(r)$ plus the barrier $\ell^2/2\mu r^2$ (violet), in units with $GM = \mu = 1$.`),
      choices: [
        t`The kinetic energy of the sideways (tangential) motion, written as a function of $r$ using conserved $\ell$`,
        t`The potential energy of a real outward force that pushes orbiting bodies away from the centre`,
        t`The part of the gravitational potential energy that is repulsive at short range`,
        t`A correction that is negligible except for fast orbits`,
      ],
      answer: 0,
      why: { 1: t`No outward force acts on an orbiting body — only gravity, inward. The term is kinetic energy that the bookkeeping moved to the potential side.`, 2: t`Newtonian gravity is attractive at every distance; the barrier comes from $\tfrac12\mu r^2\dot\phi^2$, not from $U$.`, 3: t`It dominates at small $r$ for every orbit with $\ell \ne 0$: it is why a planet never falls into the Sun.` },
      hints: [t`Start from $T = \tfrac12\mu(\dot r^2 + r^2\dot\phi^2)$ and put $\dot\phi = \ell/\mu r^2$.`],
      teach: t`The barrier is tangential kinetic energy: as $r$ shrinks at fixed $\ell$, the sideways speed $\ell/\mu r$ must grow.`,
      explain: t`$\tfrac12\mu r^2\dot\phi^2 = \tfrac12\mu r^2(\ell/\mu r^2)^2 = \ell^2/2\mu r^2$. Moving it to the potential side turns two-dimensional motion into one-dimensional motion in $r$; its "force" $-d/dr(\ell^2/2\mu r^2) = \ell^2/\mu r^3$ is the centrifugal force of the co-rotating frame ([M6.3](#/lesson/phys3550.M6.3)).`,
    }),
    num({
      id: 'apogee', difficulty: 2,
      gen(r) {
        const h = r.pick([300, 400, 600, 800]), v = r.pick([8.0, 8.3, 8.6, 9.0]);
        const r0 = R_EQ + h * 1e3, vv = v * 1e3;
        const eps = (vv * vv) / 2 - GM_E / r0, hh = r0 * vv;
        const ra = (-GM_E - Math.sqrt(GM_E * GM_E + 2 * eps * hh * hh)) / (2 * eps) / 1e3;
        return {
          prompt: t`A satellite moves horizontally at ${v} km/s at ${h} km altitude ($r_0 = ${sci(r0 / 1e3, 5)}$ km from Earth's centre). How far from Earth's centre is its apogee, in km? ($GM = 3.986\times10^{14}$ m³/s².)`,
          answer: ra, units: 'km', tol: { rel: 0.005 },
          errors: distinct([{ value: ra - R_EQ / 1e3, feedback: t`That is the altitude. The question asks for the distance from Earth's centre — add nothing, subtract nothing: $r$ itself.` }], ra),
          hints: [t`Find $\varepsilon = \tfrac12v_0^2 - GM/r_0$ and $h = r_0v_0$ (the release point is a turning point).`, t`Solve $\varepsilon r^2 + GMr - \tfrac12h^2 = 0$; one root is $r_0$, the other is the apogee.`],
          teach: t`Turning points are where $U_{\text{eff}} = E$; for gravity that is a quadratic in $r$ whose two roots are perigee and apogee.`,
          explain: t`$\varepsilon = ${sci(eps, 4)}$ J/kg, $h = ${sci(hh, 4)}$ m²/s; the roots of $\varepsilon r^2 + GMr - \tfrac12h^2 = 0$ are $r_0$ and $r_a = ${sci(ra, 4)}$ km.`,
          visual: gpic({ x: [-ra * 1.08, r0 / 1e3 * 1.5], y: [-ra * 0.62, ra * 0.62], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [disc(R_EQ / 1e3)], curves: [{ param: [`${r6(r0 / 1e3)}*cos(t)`, `${r6(r0 / 1e3)}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }], points: [{ x: r6(r0 / 1e3), y: 0, color: 'warn', r: 6, label: 'release', labelDx: 8, labelDy: 12 }], arrows: [{ from: [r6(r0 / 1e3), 0], to: [r6(r0 / 1e3), r6(ra * 0.35)], color: 'warn', label: 'v₀', labelDx: 6, labelDy: 0 }] }, t`Earth (to scale) and the release point, with the horizontal velocity. The dashed circle is the release radius; the orbit beyond it is what you are finding.`, 'Earth with a satellite released horizontally'),
        };
      },
    }),
    {
      type: 'slider', id: 'make-circle', difficulty: 2,
      prompt: t`This body has angular momentum $\ell = 1.2$ (units with $GM = \mu = 1$). Set its energy so that its orbit is a **circle**.`,
      visual: { type: 'cm3-orbit', params: { force: 'kepler', L: 1.2, E: -0.1, sliders: ['E'], ranges: { E: [-0.6, 0.2, 0.005] }, view: 4.5, r: [0, 5], y: [-0.7, 0.4], readouts: [], dragE: true, play: false, apsides: false }, caption: t`Units with $GM = \mu = 1$; $\ell = 1.2$ is fixed. Orbit to scale.` },
      param: 'E', answer: [-0.35, -0.345],
      instruction: 'Set the energy for a circular orbit, then check.',
      hints: [t`A circular orbit has $\dot r = 0$ always: its radius sits where the two turning points meet.`, t`That is the minimum of $U_{\text{eff}} = -1/r + \ell^2/2r^2$, at $r = \ell^2$; put that $r$ back into $U_{\text{eff}}$.`],
      teach: t`A circular orbit sits at the bottom of the effective-potential well, where the turning points merge.`,
      explain: t`$U_{\text{eff}}' = 1/r^2 - \ell^2/r^3 = 0$ at $r_c = \ell^2 = 1.44$, and $E = U_{\text{eff}}(r_c) = -1/(2\ell^2) = -0.347$. Any lower energy is impossible (the body would need $\dot r^2 < 0$); any higher gives an ellipse.`,
    },
    expr({
      id: 'spring-rc', difficulty: 3,
      prompt: t`A puck of mass $\mu$ on a frictionless table is tied to a central post by a spring of zero natural length: $U = \tfrac12kr^2$. Find the radius $r_c$ of its circular orbit for angular momentum $\ell$ (type $\ell$ as \`l\`).`,
      answer: '(l^2/(mu*k))^(1/4)', answerTeX: t`\left(\frac{\ell^2}{\mu k}\right)^{1/4}`,
      vars: { l: [0.5, 3], mu: [0.5, 3], k: [0.5, 3] }, keys: [['μ', 'mu']],
      errors: [{ answer: '(l^2/(mu*k))^(1/3)', feedback: t`That is the inverse-square law's power. Here $U_{\text{eff}}' = kr - \ell^2/\mu r^3 = 0$ gives $r^4 = \ell^2/\mu k$.` }, { answer: 'sqrt(l^2/(mu*k))', feedback: t`Check the power: $kr = \ell^2/\mu r^3$ means $r^4$, so take a fourth root.` }],
      hints: [t`$U_{\text{eff}} = \tfrac12kr^2 + \ell^2/2\mu r^2$. Set its derivative to zero.`, t`$kr - \ell^2/(\mu r^3) = 0$.`],
      teach: t`The circular orbit is at the minimum of $U_{\text{eff}}$: the real force balances the centrifugal term $\ell^2/\mu r^3$.`,
      explain: t`$kr = \ell^2/\mu r^3$, so $r_c = (\ell^2/\mu k)^{1/4}$. Here $U_{\text{eff}} \to \infty$ at both ends: every orbit is bound — an ellipse centred on the post, as [M5.5](#/lesson/phys3550.M5.5) shows.`,
      visual: { type: 'mech-energy', params: { U: '0.5*x^2 + 1/(2*x^2)', x: [0.25, 3], y: [0, 3.5], E: 2, x0: 1.8, xlabel: 'r', ylabel: 'energy', play: false, dragE: false, dragX: false, bars: false, force: false, equilibria: false, turning: false, particle: false, readouts: [] }, caption: t`$U_{\text{eff}}$ for the puck on a spring (units with $\mu = k = \ell = 1$): a well with walls on both sides. The minimum is what you are locating.` },
    }),
    multi({
      id: 'stable-n', difficulty: 3,
      prompt: t`For an attractive power-law force $F = -kr^n$, the circular orbit at the minimum of $U_{\text{eff}}$ is stable only if $n > -3$. Which of these forces have **stable** circular orbits?`,
      visual: { type: 'mech-energy', params: { U: '-1/(3*x^3) + 0.5/(x^2)', x: [0.4, 4], y: [-0.6, 0.6], E: 0.15, xlabel: 'r', ylabel: 'energy', play: false, dragE: false, dragX: false, bars: false, force: false, turning: false, particle: false, readouts: [] }, caption: t`$U_{\text{eff}}$ for $F = -k/r^4$ ($n = -4$; units with $k = \mu = \ell = 1$): the circular orbit sits at a **maximum**.` },
      choices: [t`$F = -kr$ (a spring)`, t`$F = -k/r^2$ (gravity)`, t`$F = -k/r^{5/2}$`, t`$F = -k/r^3$`, t`$F = -k/r^4$`],
      answer: [0, 1, 2],
      why: { 3: t`$n = -3$: $U = -k/2r^2$ has the same shape as the barrier, so $U_{\text{eff}} = (\ell^2/\mu - k)/2r^2$ has no minimum at all — a circle is possible only for one exact $\ell$, and the slightest push spirals in or out.`, 4: t`$n = -4$: near the centre the attraction beats the barrier, so $U_{\text{eff}}$ has a maximum, not a minimum (the picture).` },
      hints: [t`Write $n$ for each: $-kr$ is $n = 1$; $-k/r^2$ is $n = -2$.`, t`The test: does the force fall off more slowly than $1/r^3$, the barrier's own force law?`],
      teach: t`A circular orbit is stable when the attraction weakens with distance more slowly than the centrifugal term $\ell^2/\mu r^3$: $n > -3$.`,
      explain: t`$n = 1$, $-2$ and $-5/2$ exceed $-3$: stable. The barrier's "force" goes as $r^{-3}$; a real force falling faster than that wins at small $r$ and loses at large $r$, so the balance point is a hill. General relativity adds just such an $r^{-4}$ term — which is why black holes have an innermost stable orbit.`,
    }),
    mcq({
      id: 'fastest-radial', difficulty: 2,
      prompt: t`A planet moves on an ellipse between $r_p$ and $r_a$. Where along the orbit is its **radial** speed $|\dot r|$ greatest?`,
      visual: orb({ force: 'kepler', L: 1, E: -0.3, view: 3.4, r: [0, 4], y: [-1, 0.6], parts: false, labels: false }, t`The orbit and its effective potential (units with $GM = \mu = 1$). The turning points are where the gold line meets the curve.`),
      choices: [t`Where $U_{\text{eff}}$ is lowest — at $r = \ell^2/GM\mu^2$, the circular-orbit radius`, t`At periapsis, where the planet is fastest`, t`At apoapsis, where gravity is weakest`, t`Where $r$ equals the semi-major axis $a$, the average of $r_p$ and $r_a$`],
      answer: 0,
      why: { 1: t`At periapsis the planet's *total* speed is greatest, but all of it is sideways: $\dot r = 0$ there, by definition of a turning point.`, 2: t`Apoapsis is a turning point too: $\dot r = 0$.`, 3: t`The radial kinetic energy $E - U_{\text{eff}}$ is largest at the well's floor, $r = p = a(1 - e^2)$, which lies inside $a$ for any ellipse that is not a circle.` },
      hints: [t`$\tfrac12\mu\dot r^2 = E - U_{\text{eff}}(r)$: where is the gap between the gold line and the curve widest?`],
      teach: t`The radial kinetic energy is the gap $E - U_{\text{eff}}$, widest at the bottom of the well and zero at the turning points.`,
      explain: t`$\tfrac12\mu\dot r^2 = E - U_{\text{eff}}$ is greatest where $U_{\text{eff}}$ is least: at the circular-orbit radius $r_c = \ell^2/GM\mu^2$. For a Kepler ellipse that is the semi-latus rectum $p$, the distance at $90^\circ$ from periapsis — a little inside the semi-major axis $a$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-comet', difficulty: 3, transfer: true,
      gen(r) {
        const q = r.pick([0.4, 0.59, 0.9, 1.2]), Q = r.pick([18, 25, 35]);
        const qm = q * AU, Qm = Q * AU, a = (qm + Qm) / 2;
        const vQ = +(Math.sqrt(GM_SUN * (2 / Qm - 1 / a)) / 1e3).toPrecision(3);
        const v = vQ * 1e3, eps = (v * v) / 2 - GM_SUN / Qm, hh = Qm * v;
        const rp = (-GM_SUN + Math.sqrt(GM_SUN ** 2 + 2 * eps * hh * hh)) / (2 * eps) / AU;
        return {
          prompt: t`A comet at aphelion is ${Q} AU from the Sun, moving at ${vQ} km/s. How close to the Sun does it come, in AU? ($GM_\odot = 1.327\times10^{20}$ m³/s², 1 AU $= 1.496\times10^{11}$ m.)`,
          answer: rp, units: 'AU', tol: { rel: 0.01 },
          errors: [],
          hints: [t`At aphelion $\dot r = 0$, so $h = r_av_a$ and $\varepsilon = \tfrac12v_a^2 - GM/r_a$.`, t`Solve $\varepsilon r^2 + GMr - \tfrac12h^2 = 0$; the root that is not $r_a$ is the perihelion.`],
          teach: t`Both ends of an orbit are roots of $U_{\text{eff}}(r) = E$; knowing one end and the speed there gives the other.`,
          explain: t`$\varepsilon = ${sci(eps, 4)}$ J/kg and $h = ${sci(hh, 4)}$ m²/s give roots $${Q}$ AU and $r_p = ${sci(rp, 3)}$ AU. A speed of under a kilometre per second at aphelion is enough to miss the Sun by tens of millions of kilometres.`,
          visual: gpic({ x: [-Q * 1.05, 4], y: [-Q * 0.25, Q * 0.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [conic(0.6, Q, { color: 'ink3', width: 1.2, dash: true })], points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'Sun', labelDx: 8, labelDy: 12 }, { x: -Q, y: 0, color: 'warn', r: 5, label: 'aphelion', labelDx: 8, labelDy: 12 }], arrows: [{ from: [-Q, 0], to: [-Q, -Q * 0.15], color: 'warn', label: 'v', labelDx: 6, labelDy: 0 }] }, t`The comet at aphelion (orbit dashed, its perihelion distance not to scale). The speed there is the only other thing you need.`, 'A long comet orbit with the Sun at one end'),
        };
      },
    }),
    mcq({
      id: 'cp-gr-barrier', difficulty: 3, transfer: true,
      prompt: t`General relativity adds a term to the effective potential (per unit mass): $V_{\text{eff}} = -\dfrac{GM}{r} + \dfrac{h^2}{2r^2} - \dfrac{GMh^2}{c^2r^3}$. What does the new term do to orbits near a black hole?`,
      visual: { type: 'cm3-orbit', params: { force: 'gr', L: 1, delta: 0.07, E: -0.45, sliders: [], view: 3, r: [0, 3.2], y: [-0.75, 0.1], readouts: [], play: true }, caption: t`A bound orbit in the effective potential with the GR term, $GM/c^2$ made enormous so the effect shows (units with $GM = 1$; orbit to scale).` },
      choices: [
        t`It caps the centrifugal barrier with a maximum: a body with enough energy goes over the top and plunges, and below a critical $h$ there is no stable circular orbit at all`,
        t`It deepens the well, so every orbit becomes a smaller ellipse but stays closed`,
        t`It makes the barrier taller, so bodies can never get as close as Newton allows`,
        t`Nothing measurable: it is smaller than the Newtonian terms everywhere`,
      ],
      answer: 0,
      why: { 1: t`The $-1/r^3$ term overwhelms the $+1/r^2$ barrier at small $r$; it also makes orbits precess rather than close.`, 2: t`It pulls the potential **down** at small $r$, lowering the barrier.`, 3: t`Far out it is tiny (Mercury's 43″ per century), but near a black hole it dominates: the innermost stable circular orbit is at $6GM/c^2$.` },
      hints: [t`Compare how fast $h^2/2r^2$ and $GMh^2/c^2r^3$ grow as $r \to 0$.`, t`A falling $r^{-3}$ term beats a rising $r^{-2}$ at small $r$, so $V_{\text{eff}}$ turns over: a hump, then a plunge.`],
      teach: t`The GR term turns the centrifugal barrier into a finite hump: orbits can be captured, and circular orbits end at the ISCO.`,
      explain: t`$V_{\text{eff}}$ rises to a hump and then falls to $-\infty$: energy above the hump means capture, which Newton never allows for $h \ne 0$. The hump and well merge when $h = 2\sqrt3\,GM/c$, at $r = 6GM/c^2$ — the innermost stable circular orbit. See [the orbit equation in GR](#/lesson/gr.S25.d) and the [Schwarzschild orbit explorer](#/explore/orbit).`,
    }),
    num({
      id: 'cp-rdot', difficulty: 2,
      gen(r) {
        const L = r.pick([0.8, 1, 1.2]), E = r.pick([-0.2, -0.25, -0.3]), rr = r.pick([1.2, 1.5, 1.8]);
        const V = -1 / rr + (L * L) / (2 * rr * rr), ok = E - V;
        const R = ok > 0.01 ? rr : r6(L * L);
        const VV = -1 / R + (L * L) / (2 * R * R), rd = Math.sqrt(2 * (E - VV));
        return {
          prompt: t`In units with $GM = \mu = 1$, a body has $E = ${E}$ and $\ell = ${L}$. How fast is its distance from the centre changing (the magnitude $|\dot r|$) when $r = ${R}$?`,
          answer: rd, tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(2 * (E + 1 / R)), feedback: t`That is the total speed, from $E = \tfrac12v^2 - 1/r$. The radial part leaves out the sideways kinetic energy $\ell^2/2r^2$.` }, { value: 2 * (E - VV), feedback: t`$\tfrac12\dot r^2 = E - U_{\text{eff}}$: take the square root.` }], rd),
          hints: [t`$\tfrac12\dot r^2 = E - U_{\text{eff}}(r)$ with $U_{\text{eff}} = -1/r + \ell^2/2r^2$.`],
          teach: t`The radial speed comes straight from the gap between the energy line and $U_{\text{eff}}$.`,
          explain: t`$U_{\text{eff}}(${R}) = ${sci(VV, 4)}$, so $\dot r^2 = 2(${E} - (${sci(VV, 4)})) = ${sci(2 * (E - VV), 4)}$ and $|\dot r| = ${sci(rd, 3)}$.`,
          visual: orb({ force: 'kepler', L, E, view: 3.6, r: [0, 4], y: [-0.9, 0.5], turning: false }, t`The orbit and $U_{\text{eff}}$ for these values (units with $GM = \mu = 1$).`),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §8.4: the equivalent one-dimensional problem', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'S. M. Carroll, Lecture Notes on General Relativity (1997), ch. 7: Schwarzschild orbits, arXiv gr-qc/9712019', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
