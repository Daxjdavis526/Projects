// Precession of nearly circular orbits (Taylor §8 problems; Goldstein §3.6):
// linearize Binet's equation about the circular orbit, u = u_c + η, to get
// η″ + β²η = 0 with β² = 3 + rF′/F; the distance swings from periapsis to
// apoapsis while φ turns through the apsidal angle ψ = π/β, which for
// F = −krⁿ is π/√(3 + n). Closed only when β is rational; for every orbit
// only n = −2 and n = 1 (Bertrand). A force a little steeper than 1/r²
// advances the apsides by ≈ πδ per orbit. GR adds an r⁻⁴ term: Δφ =
// 6πGM/[c²a(1 − e²)] per orbit — labelled as a forward pointer to gr.S25.
// Explored in cm3-orbit (power-law mode with the formula readout).
// Transfer: rosette orbits in galaxies (ρ ∝ r^−γ), GR advances of Venus,
// Earth and the asteroid Icarus. Avoids gr.S25.i's Mercury budget items.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, distinct } from './_cm.js';
import { GM_SUN, C, AU, orb } from './_cm3.js';

const t = String.raw;
const DEG = 180 / Math.PI;
const ARCSEC = 206264.806;
// the floor of U_eff for F = −krⁿ with k = μ = ℓ = 1 (circle at r = 1), plus a margin
const near = (n, m = 0.05) => +((Math.abs(n + 1) < 1e-9 ? 0.5 : 1 / (n + 1) + 0.5) + m).toFixed(4);

export default lesson({
  id: 'phys3550.M5.5',
  title: 'Precession of nearly circular orbits',
  minutes: 15, difficulty: 4,
  intro: t`A nearly circular orbit does two things at once: it goes round, and its distance oscillates in and out about the circular radius. If the two motions have the same period, the orbit closes; if not, its closest point creeps round — the orbit **precesses**, tracing a rosette. Linearizing Binet's equation ([M5.3](#/lesson/phys3550.M5.3)) about the circle gives the radial oscillation's angular "frequency" $\beta$ in $\phi$, and with it the **apsidal angle** $\psi$: how far the body turns between periapsis and apoapsis. For gravity $\psi = 180^\circ$ exactly — which is why Kepler's ellipses close, and why Mercury's slow precession was a clue that Newton's law is not the whole story.`,
  equation: t`\psi = \frac{\pi}{\beta}, \qquad \beta^2 = 3 + \frac{rF'(r)}{F(r)}\bigg|_{r_c} \quad\xrightarrow{F\,=\,-kr^n}\quad \psi = \frac{\pi}{\sqrt{3 + n}}`,
  symbols: [
    { tex: '\\psi', text: 'the **apsidal angle**: the angle turned from periapsis to the next apoapsis, in rad (or degrees)' },
    { tex: '\\beta', text: 'radial oscillations per radian of $\\phi$: the orbit closes after one radial cycle only if $\\beta = 1$' },
    { tex: 'F(r)', text: 'the central force (negative: attractive), in N; $F\'$ is its derivative $dF/dr$' },
    { tex: 'r_c', text: 'the radius of the circular orbit the real orbit stays near, in m' },
    { tex: 'n', text: 'the exponent of a power-law force $F = -kr^n$: $-2$ for gravity, $1$ for a spring; $n > -3$ for stability' },
  ],
  why: t`An orbit's precession is a sensitive measure of its force law: it revealed general relativity in Mercury's orbit and today measures the masses in binary pulsars and the shape of galaxies' dark-matter halos.`,
  visual: {
    type: 'cm3-orbit',
    title: 'Rosettes from power laws',
    lead: t`A power-law force $F = -kr^n$ ($k = \mu = 1$). The orbit is drawn for six turns of $\phi$; the readouts compare the measured apsidal angle with $\pi/\sqrt{3 + n}$.`,
    tasks: [
      t`Set $n = -2$ (gravity) or $n = 1$ (a spring): the orbit closes, with $\psi = 180^\circ$ or $90^\circ$.`,
      t`Set $n = -2.5$: the periapsis advances by more than $100^\circ$ per lap — a rosette.`,
      t`Lower $E$ to the floor and the measured angle approaches the formula; raise it and they part — the formula is for **nearly** circular orbits.`,
    ],
    params: { force: 'power', n: -2.5, L: 1, E: -0.13, sliders: ['n', 'E'], ranges: { n: [-2.8, 2, 0.05], E: [-0.25, 1.5, 0.005] }, turns: 6, view: 2.6, r: [0, 3], y: [-0.3, 0.6], readouts: ['apsidal', 'formula', 'advance', 'fate'] },
    caption: t`Units with $k = \mu = \ell = 1$. Integrated exactly from Binet's equation; the dashed circles are the turning radii. $E$ below the well's floor is raised to it (a circle). For $n > -1$ every orbit is bound.`,
  },
  example: {
    prompt: t`For $F = -kr^n$, find the apsidal angle of a nearly circular orbit, and evaluate it for $n = -2.5$.`,
    visual: orb({ force: 'power', n: -2.5, L: 1, E: -0.15, turns: 6, view: 2.2, r: [0, 2.6], y: [-0.25, 0.3], panels: ['orbit'] }, t`An orbit under $F = -k/r^{2.5}$, six turns of $\phi$ (units with $k = \mu = \ell = 1$). The periapsis advances each lap.`),
    steps: [
      { label: 'Binet', text: t`$u'' + u = f(u)$ with $f(u) = -\mu F(1/u)/(\ell^2u^2) = \dfrac{\mu k}{\ell^2}u^{-n-2}$.` },
      { label: 'The circle', text: t`A circular orbit has $u'' = 0$: $u_c = f(u_c)$.` },
      { label: 'Perturb', text: t`Put $u = u_c + \eta$ with $\eta$ small: $\eta'' + u_c + \eta = f(u_c) + f'(u_c)\eta$, so $\eta'' + \big(1 - f'(u_c)\big)\eta = 0$.` },
      { label: 'Evaluate', text: t`$f'(u_c) = (-n - 2)f(u_c)/u_c = -(n + 2)$. So $\eta'' + (3 + n)\eta = 0$: $\eta \propto \cos\beta\phi$ with $\beta = \sqrt{3 + n}$.` },
      { label: 'Apsidal angle', text: t`From a maximum of $u$ (periapsis) to a minimum (apoapsis), $\beta\phi$ advances by $\pi$: $\psi = \pi/\sqrt{3 + n}$. For $n = -2.5$: $\psi = \pi/\sqrt{0.5} = ${sci(180 / Math.sqrt(0.5), 4)}^\circ$.` },
      { label: 'Sense check', text: t`$n = -2$ gives $180^\circ$ (Kepler's closed ellipse) ✓, $n = 1$ gives $90^\circ$ (an ellipse centred on the force centre) ✓. Here each periapsis lies $2\psi - 360^\circ = ${sci(360 / Math.sqrt(0.5) - 360, 3)}^\circ$ beyond the last.` },
    ],
    answer: t`$\psi = \pi/\sqrt{3 + n}$; for $n = -2.5$, $\psi = ${sci(180 / Math.sqrt(0.5), 4)}^\circ$, so the periapsis advances $${sci(360 / Math.sqrt(0.5) - 360, 3)}^\circ$ per radial cycle.`,
  },
  practice: [
    num({
      id: 'psi-n', difficulty: 2,
      gen(r) {
        const n = r.pick([-2.75, -2.25, -1.5, -1, 0, 2, 3]);
        const psi = 180 / Math.sqrt(3 + n);
        return {
          prompt: t`What is the apsidal angle of a nearly circular orbit under the attractive force $F = -kr^{${n}}$, in degrees?`,
          answer: psi, units: 'deg', tol: { rel: 0.005 },
          errors: distinct([{ value: 180 * Math.sqrt(3 + n), feedback: t`Upside down: $\psi = \pi/\beta$ with $\beta = \sqrt{3 + n}$ — more radial oscillations per turn means a smaller angle between apsides.` }, { value: 360 / Math.sqrt(3 + n), feedback: t`That is periapsis to the next periapsis. The apsidal angle runs from periapsis to apoapsis: half a radial cycle.` }], psi),
          hints: [t`$\psi = \pi/\sqrt{3 + n}$.`],
          teach: t`For $F = -kr^n$, a nearly circular orbit turns through $\pi/\sqrt{3 + n}$ between periapsis and apoapsis.`,
          explain: t`$\psi = 180^\circ/\sqrt{3 + (${n})} = ${sci(psi, 4)}^\circ$.${psi > 180 ? ' More than 180°: the apsides advance.' : ' Less than 180°: the apsides regress, or (if it divides 360° evenly) the orbit closes.'}`,
          visual: orb({ force: 'power', n, L: 1, E: near(n, n < -2 ? 0.03 : 0.1), turns: 4, view: 2, r: [0, 2.4], y: [-1, 1], panels: ['orbit'], apsides: false }, t`A nearly circular orbit under this force (units with $k = \mu = \ell = 1$; the wobble is exaggerated slightly for visibility). Apsides not marked.`),
        };
      },
    }),
    mcq({
      id: 'spring-orbit', difficulty: 2,
      prompt: t`A puck tied to a post by a spring ($F = -kr$) moves on a nearly circular path. How many times per revolution does its distance from the post reach a maximum?`,
      visual: orb({ force: 'power', n: 1, L: 1, E: 1.25, turns: 2, view: 1.7, r: [0, 2], y: [0, 3], panels: ['orbit'], apsides: false }, t`An orbit under a spring force (units with $k = \mu = \ell = 1$), force centre gold.`),
      choices: [t`Twice: $\psi = 90^\circ$, so it is an ellipse centred on the post`, t`Once: it is a Kepler ellipse with the post at a focus`, t`Never exactly: the orbit precesses`, t`Four times`],
      answer: 0,
      why: { 1: t`That is gravity, $n = -2$, $\psi = 180^\circ$. For a spring $n = 1$ and $\psi = \pi/\sqrt4 = 90^\circ$.`, 2: t`$\psi = 90^\circ$ divides $360^\circ$ exactly, so the orbit closes: the spring is one of Bertrand's two closed cases.`, 3: t`Maxima come every $2\psi = 180^\circ$: twice per turn, not four times (that would count minima too).` },
      hints: [t`$\psi = \pi/\sqrt{3 + n}$ with $n = 1$.`, t`Maxima of $r$ are $2\psi$ apart.`],
      teach: t`Under a spring force the apsidal angle is $90^\circ$: two far points and two near points per revolution — a centred ellipse.`,
      explain: t`$\psi = 90^\circ$: apoapsis, periapsis, apoapsis, periapsis every quarter turn. Indeed $x$ and $y$ each oscillate harmonically with the same frequency, which traces an ellipse centred on the post — exactly, at any amplitude.`,
    }),
    mcq({
      id: 'advance-or-regress', difficulty: 3,
      prompt: t`A force law a little steeper than gravity, $F = -k/r^{2.1}$, acts on a nearly circular orbit. Seen from above, the periapsis:`,
      visual: orb({ force: 'power', n: -2.1, L: 1, E: near(-2.1, 0.06), turns: 6, view: 1.5, r: [0, 2], y: [-1.2, 0], panels: ['orbit'], apsides: false }, t`Six turns of the orbit (units with $k = \mu = \ell = 1$), moving anticlockwise. Apsides not marked.`),
      choices: [t`Advances — moves forward, in the direction of motion`, t`Regresses — moves backward against the motion`, t`Stays fixed: any force near $1/r^2$ gives closed orbits`, t`Advances or regresses depending on the orbit's size`],
      answer: 0,
      why: { 1: t`$\psi = \pi/\sqrt{3 + n} = \pi/\sqrt{0.9} > \pi$: the body travels **more** than $180^\circ$ between apsides, so each periapsis is ahead of the last.`, 2: t`Only exactly $n = -2$ closes; $n = -2.1$ gives $\psi = 189.7^\circ$.`, 3: t`For a power law, $\beta = \sqrt{3 + n}$ is the same at every radius.` },
      hints: [t`Compute $\psi$ for $n = -2.1$. Is it more or less than $180^\circ$?`, t`If $\psi > 180^\circ$, the next apoapsis comes later in angle than it would for an ellipse.`],
      teach: t`A force that grows faster than $1/r^2$ toward the centre makes the radial oscillation slower than the revolution: the apsides advance.`,
      explain: t`$\psi = 180^\circ/\sqrt{0.9} = ${sci(180 / Math.sqrt(0.9), 4)}^\circ$, so the periapsis advances $${sci(360 / Math.sqrt(0.9) - 360, 3)}^\circ$ per orbit. General relativity's correction is such an extra pull at short range — and Mercury's perihelion advances.`,
    }),
    num({
      id: 'small-delta', difficulty: 3,
      gen(r) {
        const d = r.pick([0.01, 0.02, 0.05, 0.1]);
        const adv = 360 / Math.sqrt(1 - d) - 360;
        return {
          prompt: t`An attractive force $F = -k/r^{2 + \delta}$ with $\delta = ${d}$ holds a body on a nearly circular orbit. By how many degrees does the periapsis advance per radial cycle (periapsis to periapsis)?`,
          answer: adv, units: 'deg', tol: { rel: 0.005 },
          errors: distinct([{ value: 180 / Math.sqrt(1 - d) - 180, feedback: t`That is per half cycle (periapsis to apoapsis). Periapsis to periapsis is $2\psi$, so the advance is $2\psi - 360^\circ$.` }, { value: 180 / Math.sqrt(1 - d), feedback: t`That is $\psi$ itself. The advance is how much $2\psi$ exceeds a full turn.` }], adv),
          hints: [t`$n = -2 - \delta$, so $\psi = \pi/\sqrt{1 - \delta}$.`, t`The advance per cycle is $2\psi - 2\pi$; for small $\delta$ it is about $\pi\delta$.`],
          teach: t`A small change $\delta$ in the force's exponent advances the periapsis by about $\pi\delta$ radians per orbit.`,
          explain: t`$2\psi - 360^\circ = 360^\circ\big(1/\sqrt{1 - ${d}} - 1\big) = ${sci(adv, 4)}^\circ$; the small-$\delta$ estimate $\pi\delta = ${sci(180 * d, 3)}^\circ$ is close. Precision orbit measurements turn this around: an observed advance limits any deviation from the inverse-square law.`,
          visual: orb({ force: 'power', n: -2 - d, L: 1, E: near(-2 - d, 0.04), turns: 3, view: 1.6, r: [0, 2], y: [-1, 0], panels: ['orbit'], apsides: false }, t`Three turns of such an orbit (units with $k = \mu = \ell = 1$): the advance is too small to see by eye for small $\delta$.`),
        };
      },
    }),
    expr({
      id: 'beta-gr', difficulty: 3,
      prompt: t`A Newtonian attraction plus a small extra short-range pull: $F(r) = -\dfrac{k}{r^2} - \dfrac{\lambda}{r^4}$. Using $\beta^2 = 3 + rF'/F$, find $\beta^2$ at radius $r$. Type $\lambda$ as lambda.`,
      answer: '(k*r^2 - lambda)/(k*r^2 + lambda)', answerTeX: t`\frac{kr^2 - \lambda}{kr^2 + \lambda}`,
      lhs: '\\beta^2', vars: { k: [0.5, 2], r: [0.5, 2], lambda: [0.01, 0.2] },
      errors: [{ answer: '(k*r^2 + lambda)/(k*r^2 + lambda)', feedback: t`That is 1: you lost the extra term's derivative. $F' = 2k/r^3 + 4\lambda/r^5$.` }, { answer: '(k*r^2 + 3*lambda)/(k*r^2 + lambda)', feedback: t`Check the sign: $rF'/F = -(2kr^2 + 4\lambda)/(kr^2 + \lambda)$, and $3 - (2kr^2 + 4\lambda)/(kr^2 + \lambda) = (kr^2 - \lambda)/(kr^2 + \lambda)$.` }],
      hints: [t`$F' = 2k/r^3 + 4\lambda/r^5$, so $rF' = 2k/r^2 + 4\lambda/r^4$.`, t`Multiply top and bottom of $rF'/F$ by $r^4$: $rF'/F = -(2kr^2 + 4\lambda)/(kr^2 + \lambda)$.`],
      teach: t`Any extra force changes $\beta$ through the logarithmic slope $rF'/F$; an extra short-range pull makes $\beta < 1$.`,
      explain: t`$\beta^2 = \dfrac{kr^2 - \lambda}{kr^2 + \lambda} \approx 1 - \dfrac{2\lambda}{kr^2}$, so $\psi = \pi/\beta \approx \pi(1 + \lambda/kr^2)$: the apsides advance by $2\pi\lambda/kr^2$ per orbit. General relativity's correction to $U_{\text{eff}}$ acts as just such a $1/r^4$ force.`,
      visual: gpic({ x: [0.5, 3], y: [-4.2, 0], xlabel: 'r', ylabel: 'F', curves: [{ fn: '-1/x^2', color: 'ink3', width: 1.6, dash: true, label: 'Newton', labelAt: 2.6, labelDx: -10, labelDy: -14 }, { fn: '-1/x^2 - 0.3/x^4', color: 'accent', width: 2.2, label: 'with extra pull', labelAt: 0.75, labelDx: 10, labelDy: 6 }] }, t`$-k/r^2$ (dashed) and the same plus $-\lambda/r^4$ (units with $k = 1$, $\lambda = 0.3$, exaggerated): the extra pull matters only close in.`, 'Two attractive force curves'),
    }),
    multi({
      id: 'bertrand', difficulty: 3,
      prompt: t`Which statements about closed orbits are true?`,
      visual: orb({ force: 'power', n: -1, L: 1, E: 0.6, turns: 7, view: 3.2, r: [0, 3.5], y: [-0.2, 1.5], panels: ['orbit'], apsides: false }, t`Seven turns of an orbit under $F = -k/r$ (units with $k = \mu = \ell = 1$).`),
      choices: [
        t`Only $F \propto -1/r^2$ and $F \propto -r$ make **every** bound orbit close (Bertrand's theorem)`,
        t`For $F = -k/r$, nearly circular orbits do not close: $\psi = 127.3^\circ$`,
        t`A force with $n = 6$ gives nearly circular orbits that close after a sixth of a turn per apsis ($\psi = 60^\circ$), but large orbits do not close`,
        t`Every attractive central force makes closed orbits, because angular momentum is conserved`,
        t`For gravity, only circular orbits close; ellipses precess slowly`,
      ],
      answer: [0, 1, 2],
      why: { 3: t`Conserved angular momentum keeps an orbit in a plane and sweeping equal areas; it does not make $\psi$ a rational fraction of $360^\circ$.`, 4: t`Kepler ellipses close exactly at any eccentricity — the special symmetry behind the conserved Laplace–Runge–Lenz vector.` },
      hints: [t`Compute $\psi$ for $n = -1$ and $n = 6$.`, t`Closure for one nearly circular orbit needs $\sqrt{3 + n}$ rational; closure for all orbits, at all amplitudes, is much more demanding.`],
      teach: t`Closed orbits are rare: the inverse-square law and the spring are the only central forces for which every bound orbit closes.`,
      explain: t`$n = -1$ gives $\psi = 180^\circ/\sqrt2 = 127.3^\circ$, an irrational fraction of a turn: a rosette that never closes. $n = 6$ gives $\psi = 60^\circ$ for small wobbles, but at larger amplitude the anharmonic terms shift it. Bertrand (1873) proved that only $n = -2$ and $n = 1$ close at every amplitude.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-galaxy', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([0, 1, 1.5, 2]);
        const n = 1 - g, psi = 180 / Math.sqrt(3 + n);
        const name = { 0: 'a uniform core', 1: 'a cusp with $\\rho \\propto 1/r$', 1.5: 'a region with $\\rho \\propto r^{-1.5}$', 2: 'an isothermal halo with $\\rho \\propto 1/r^2$ (flat rotation curve)' }[g];
        return {
          prompt: t`A star orbits deep inside a spherical galaxy, in ${name}. Where the density goes as $\rho \propto r^{-\gamma}$ (here $\gamma = ${g}$), the enclosed mass grows as $M(r) \propto r^{3 - \gamma}$, so the force is $F \propto -M(r)/r^2$. What is the apsidal angle of a nearly circular orbit, in degrees?`,
          answer: psi, units: 'deg', tol: { rel: 0.005 },
          errors: distinct([{ value: 180, feedback: t`$180^\circ$ is for a point mass. Here the mass inside the orbit grows with $r$, so $F$ is not $1/r^2$: $F \propto -r^{1 - \gamma}$.` }, { value: 180 / Math.sqrt(3 - g), feedback: t`$F \propto -M(r)/r^2 \propto -r^{3 - \gamma - 2}$, so $n = 1 - \gamma$, not $-\gamma$.` }], psi),
          hints: [t`Find $n$: $F \propto -r^{3 - \gamma}/r^2 = -r^{1 - \gamma}$.`, t`$\psi = 180^\circ/\sqrt{3 + n} = 180^\circ/\sqrt{4 - \gamma}$.`],
          teach: t`Inside an extended mass the force is not inverse-square, so stellar orbits are rosettes whose apsidal angle reports the density profile.`,
          explain: t`$n = 1 - ${g} = ${r6(n)}$, so $\psi = 180^\circ/\sqrt{${r6(4 - g)}} = ${sci(psi, 4)}^\circ$${g === 0 ? ' — exactly the spring’s: a uniform core makes closed ellipses centred on the galaxy’s middle.' : t` — between the spring's $90^\circ$ and Kepler's $180^\circ$: galactic orbits are rosettes, with the periapsis regressing.`}`,
          visual: orb({ force: 'power', n, L: 1, E: near(n, 0.12), turns: 5, view: 2, r: [0, 2.4], y: [-1, 2], panels: ['orbit'], apsides: false }, t`A star's orbit in such a galaxy, five turns (units with $k = \mu = \ell = 1$; not a real galaxy's scale).`),
        };
      },
    }),
    num({
      id: 'cp-gr', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([
          { name: 'Venus', a: 1.0821e11, e: 0.0068, T: 224.701 },
          { name: 'Earth', a: AU, e: 0.0167, T: 365.256 },
          { name: 'the asteroid 1566 Icarus', a: 1.0779 * AU, e: 0.8269, T: 408.8 },
        ]);
        const per = (6 * Math.PI * GM_SUN) / (C * C * P.a * (1 - P.e * P.e)), cent = per * ARCSEC * (36525 / P.T);
        return {
          prompt: t`**General relativity (a forward pointer).** Einstein's correction to the Sun's gravity advances a planet's perihelion by $\Delta\phi = \dfrac{6\pi GM_\odot}{c^2a(1 - e^2)}$ per orbit. For ${P.name} ($a = ${sci(P.a / 1e9, 4)}\times10^{9}$ m, $e = ${P.e}$, period ${P.T} days), how many arcseconds is that per century?`,
          answer: cent, units: 'arcsec', tol: { rel: 0.01 },
          errors: distinct([{ value: per * ARCSEC, feedback: t`That is per orbit. A century holds $36\,525/${P.T}$ orbits.` }, { value: (per * ARCSEC * (36525 / P.T)) * (1 - P.e * P.e), feedback: t`Divide by $1 - e^2$; do not multiply.` }], cent),
          hints: [t`Compute $\Delta\phi$ in radians, then convert: $1\ \text{rad} = 206\,265''$.`, t`Multiply by the number of orbits in a century, $36\,525\ \text{d}/T$.`],
          teach: t`GR's perihelion advance is a small per-orbit angle that accumulates over many orbits.`,
          explain: t`$\Delta\phi = ${sci(per, 3)}$ rad $= ${sci(per * ARCSEC, 3)}''$ per orbit, times $${sci(36525 / P.T, 4)}$ orbits: $${sci(cent, 3)}''$ per century.${P.name.includes('Icarus') ? ' Its large eccentricity brings it so close to the Sun that its advance is a quarter of Mercury’s despite its larger orbit.' : ''} For where this formula comes from — the $3GMu^2/c^2$ term it adds to Binet's equation — see [Mercury's 43 arcseconds](#/lesson/gr.S25.i) and [the derivation](#/lesson/gr.S25.d).`,
          visual: orb({ force: 'gr', delta: 0.004, L: 1, E: -0.25, turns: 6, view: 2.2, r: [0, 2.6], y: [-0.6, 0.1], panels: ['orbit'], apsides: false }, t`What the extra term does, enormously exaggerated: the GR strength $GM/c^2$ here is about $10^6$ times Mercury's (units with $GM = 1$).`),
        };
      },
    }),
    mcq({
      id: 'cp-rate-ratio', difficulty: 2,
      prompt: t`On a nearly circular orbit the distance oscillates $\beta$ times per revolution. For which force does the radial oscillation keep exact step with the revolution, so that each periapsis falls in the same place?`,
      visual: orb({ force: 'power', n: -1.5, L: 1, E: near(-1.5, 0.2), turns: 6, view: 2.2, r: [0, 2.6], y: [-1, 0], panels: ['orbit'], apsides: false }, t`An orbit whose radial oscillation does **not** keep step: six turns (units with $k = \mu = \ell = 1$).`),
      choices: [t`Gravity, $F \propto -1/r^2$: $\beta = 1$`, t`Any attractive force, by conservation of angular momentum`, t`$F \propto -1/r^3$: $\beta = 0$`, t`$F \propto -1/r$: $\beta = 1$`],
      answer: 0,
      why: { 1: t`Angular momentum fixes the plane and the areal rate, not $\beta$.`, 2: t`$\beta = 0$ means no radial restoring at all: $n = -3$ has no stable circle.`, 3: t`For $n = -1$, $\beta = \sqrt2$.` },
      hints: [t`$\beta = \sqrt{3 + n}$. Which $n$ gives 1?`],
      teach: t`Only for the inverse-square force is the radial frequency exactly the orbital frequency, $\beta = 1$.`,
      explain: t`$\beta = \sqrt{3 + n} = 1$ requires $n = -2$. That coincidence is fragile: any extra force — other planets, an oblate Sun, general relativity — shifts $\beta$ from 1, and the orbit precesses.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 8 problems on nearly circular orbits and precession', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. Goldstein, C. Poole & J. Safko, Classical Mechanics, 3rd ed. (2002), §3.6: Bertrand’s theorem', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000003410' },
    { label: 'I. I. Shapiro et al., Phys. Rev. Lett. 20, 1517 (1968): the relativistic advance of Icarus', url: 'https://doi.org/10.1103/PhysRevLett.20.1517' },
  ],
});
