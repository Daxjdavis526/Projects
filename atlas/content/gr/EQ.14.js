// Orbits in the Schwarzschild spacetime as motion in an effective potential,
// dissected (Carroll §5.4, G = c = 1, so M means GM/c², a length):
//   ½(dr/dλ)² + ½ε − εM/r + L²/(2r²) − ML²/r³ = ½E²,
// with E = (1 − 2M/r) dt/dλ, L = r² dφ/dλ, ε = 1 for bodies (λ = τ) and 0
// for light. Checked: circular orbits r = [L² ± L√(L² − 12M²)]/(2M) (L = 4M
// gives 12M and 4M); light's potential peaks at 3M with height L²/(54M²), so
// rays with b = L/E < 3√3 M are captured; E = 1 and L = 4M touch the peak at
// 4M exactly (the marginally bound orbit); the GR term is 2M/r of the
// centrifugal one. Avoids repeating gr.S21.i (ISCO radius and frequency,
// efficiency, local speed, Interstellar), gr.S24.i (shadow sizes) and
// gr.S25.i (perihelion precession).
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, GM_EARTH, GM_SUN, AU, sci, round } from './_eq.js';

const t = String.raw;

const RS_EARTH = (2 * GM_EARTH) / C ** 2, RS_SUN = (2 * GM_SUN) / C ** 2;
const RS_SGRA = 4.3e6 * RS_SUN;
const M_KM = (2.0 * GM_SUN) / C ** 2 / 1e3;             // GM/c² of a 2.0-solar-mass neutron star, km

// V(r) for a body (ε = 1) or light (ε = 0), G = c = 1, as a graph expression of x = r/M
const vBody = (L) => `0.5 - 1/x + ${round(L * L / 2, 6)}/x^2 - ${round(L * L, 6)}/x^3`;
const vNewton = (L) => `0.5 - 1/x + ${round(L * L / 2, 6)}/x^2`;
const V = (r, L, eps = 1) => 0.5 * eps - eps / r + (L * L) / (2 * r * r) - (L * L) / r ** 3;
const rCirc = (L, sign = 1) => (L * L + sign * L * Math.sqrt(L * L - 12)) / 2;

// Einstein's potential against Newton's, for L = 4M
const versus = {
  type: 'graph',
  params: {
    x: [0, 40], y: [0.44, 0.52], xlabel: 'r / M', ylabel: 'V(r)',
    curves: [
      { fn: vBody(4), domain: [2.6, 40], color: 'gold', width: 2.4, label: 'Einstein', labelAt: 17, labelDy: 14 },
      { fn: vNewton(4), domain: [5.5, 40], color: 'accent', width: 2, dash: true, label: 'Newton', labelAt: 8, labelDx: 10, labelDy: -4 },
    ],
  },
  caption: t`The effective potential for $L = 4M$, with $G = c = 1$ and $r$ in units of $M = GM/c^2$. Solid: all four terms. Dashed: without the last one.`,
};

// the two angular terms, for L = 4M
const twoTerms = {
  type: 'graph',
  params: {
    x: [0, 10], y: [0, 4], xlabel: 'r / M', ylabel: 'size of the term',
    curves: [
      { fn: '8/x^2', domain: [1.4, 10], color: 'accent', width: 2.2, label: 'L²/(2r²)', labelAt: 5, labelDy: -12 },
      { fn: '16/x^3', domain: [2.5, 10], color: 'gold', width: 2.2, label: 'ML²/r³', labelAt: 3.4, labelDx: -66, labelDy: 6 },
    ],
    vlines: [{ x: 2, label: 'r = 2M' }],
  },
  caption: t`The centrifugal term and the size of the GR term for $L = 4M$ ($G = c = 1$). Far out the GR term is the smaller; the two are equal at $r = 2M$, the horizon.`,
};

// V(r) for a chosen L, with its hump and its well
const wellFor = (L) => {
  const lo = V(rCirc(L), L), hi = V(rCirc(L, -1), L);
  return {
    type: 'graph',
    params: {
      x: [0, 40], y: [round(lo - 0.02, 3), round(hi + 0.02, 3)], xlabel: 'r / M', ylabel: 'V(r)',
      curves: [{ fn: vBody(L), domain: [2.4, 40], color: 'gold', width: 2.4 }],
    },
    caption: t`The effective potential for $L = ${L}M$ ($G = c = 1$): a hump close in, a shallow well farther out.`,
  };
};

// light's potential for two angular momenta
const lightCurves = {
  type: 'graph',
  params: {
    x: [0, 14], y: [0, 0.042], xlabel: 'r / M', ylabel: 'V(r) for light',
    curves: [
      { fn: '0.5/x^2 - 1/x^3', domain: [2, 14], color: 'accent', width: 2.2, label: 'L = M', labelAt: 9, labelDy: 18 },
      { fn: '1.21*(0.5/x^2 - 1/x^3)', domain: [2, 14], color: 'gold', width: 2.2, label: 'L = 1.1M', labelAt: 6.2, labelDy: -12 },
    ],
  },
  caption: t`The potential that light moves in, for two values of $L$ ($G = c = 1$). It is zero at the horizon, $r = 2M$.`,
};

// light's potential with two energy levels
const lightLevels = {
  type: 'graph',
  params: {
    x: [0, 14], y: [0, 0.032], xlabel: 'r / M', ylabel: 'V(r) for light',
    curves: [{ fn: '0.5/x^2 - 1/x^3', domain: [2, 14], color: 'accent', width: 2.4 }],
    hlines: [{ y: 0.026, label: 'ray A: ½E²', color: 'bad' }, { y: 0.012, label: 'ray B: ½E²', color: 'teal' }],
  },
  caption: t`Light's potential for $L = M$ ($G = c = 1$) and the levels $\tfrac12E^2$ of two incoming rays. Ray B meets the curve and turns back; ray A passes over the top and falls in.`,
};

// Einstein and Newton far out, rest-mass ½ removed
const farOut = {
  type: 'graph',
  params: {
    x: [8, 100], y: [-0.045, 0.005], xlabel: 'r / M', ylabel: 'V(r) − ½',
    curves: [
      { fn: '-1/x + 8/x^2 - 16/x^3', domain: [8, 100], color: 'gold', width: 2.4, label: 'Einstein', labelAt: 18, labelDy: 14 },
      { fn: '-1/x + 8/x^2', domain: [8, 100], color: 'accent', width: 2, dash: true, label: 'Newton', labelAt: 10.5, labelDx: 10, labelDy: -4 },
    ],
  },
  caption: t`The two potentials for $L = 4M$ ($G = c = 1$) with the rest-mass $\tfrac12$ taken off. Far out they merge.`,
};

// L = 4M and a body released from rest far away
const marginal = {
  type: 'graph',
  params: {
    x: [0, 30], y: [0.44, 0.53], xlabel: 'r / M', ylabel: 'V(r)',
    curves: [{ fn: vBody(4), domain: [2.6, 30], color: 'gold', width: 2.4 }],
    hlines: [{ y: 0.5, label: 'E = 1:  ½E² = ½', color: 'accent' }],
  },
  caption: t`The effective potential for $L = 4M$ ($G = c = 1$), and the level $\tfrac12E^2 = \tfrac12$ of a body released from rest far away.`,
};

// the ISCO potential around a 2.0-solar-mass neutron star, in km
const starPotential = (() => {
  const m = round(M_KM, 4), L2 = 12 * M_KM * M_KM;
  return {
    type: 'graph',
    params: {
      x: [0, 50], y: [0.36, 0.5], xlabel: 'r (km)', ylabel: 'V(r)',
      shade: [{ fn: '0.5', lower: '0.36', from: 0, to: 12.5, color: 'teal', alpha: 0.18 }],
      curves: [{ fn: `0.5 - ${m}/x + ${round(L2 / 2, 4)}/x^2 - ${round(m * L2, 4)}/x^3`, domain: [7, 50], color: 'gold', width: 2.4 }],
      points: [{ x: 6.25, y: 0.49, r: 0.01, color: 'teal', label: 'inside the star', labelDx: -40, labelDy: 0 }],
    },
    caption: t`The effective potential for $L = 2\sqrt3\,GM/c$ around a 2.0-solar-mass neutron star of radius 12.5 km, with $r$ in km. Shaded: inside the star, where it does not apply.`,
  };
})();

export default lesson({
  id: 'gr.EQ.14',
  kind: 'dissection',
  title: 'Schwarzschild effective potentials',
  minutes: 9, difficulty: 3,
  badges: ['est-der', 'est-obs'],
  equation: t`\part{1}{\tfrac12\Big(\frac{dr}{d\lambda}\Big)^2} + \underbrace{\part{2}{\tfrac12\varepsilon}\part{3}{\,-\,\varepsilon\frac{M}{r}} + \part{4}{\frac{L^2}{2r^2}}\part{5}{\,-\,\frac{ML^2}{r^3}}}_{V(r)} = \part{6}{\tfrac12E^2}`,
  intro: t`Outside a spherical star or black hole, the geodesic equation has two conserved quantities — energy $E$ and angular momentum $L$ — and with them every orbit reduces to motion along one line, $r$, like a marble rolling on a curve: the **effective potential** $V(r)$. It looks like Newton's energy equation with one extra term, and that term gives Mercury's precession, the innermost stable orbit and the photon sphere.

Conventions: Carroll's, with $G = c = 1$, so $M$ stands for $GM/c^2$ — a length, 1.48 km for the Sun and 4.4 mm for the Earth. $r$ is the Schwarzschild radial coordinate, the areal radius: a sphere at $r$ has area $4\pi r^2$. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`\tfrac12\Big(\frac{dr}{d\lambda}\Big)^2`, name: 'the radial kinetic term', badge: 'est-der', units: 'dimensionless (with G = c = 1)',
      text: t`How fast $r$ changes along the path. For a body $\lambda$ is its proper time $\tau$, the time its own clock keeps; for light, which has no proper time, $\lambda$ is an affine parameter that ticks evenly along the ray.

It can never be negative, so a body can only be where $V(r) \le \tfrac12E^2$. Where the two are equal it is zero: a **turning point**, the closest or farthest approach.`,
    },
    {
      tex: t`\tfrac12\varepsilon`, name: 'the rest-mass offset', badge: 'math', units: 'dimensionless',
      text: t`$\varepsilon = 1$ for a body and $0$ for light. It comes from the normalization of the four-velocity, $g_{\mu\nu}\frac{dx^\mu}{d\lambda}\frac{dx^\nu}{d\lambda} = -\varepsilon$: a body's path is timelike, light's is null.

A constant, so it moves no orbit; it is the rest energy, and it cancels against the $\tfrac12$ in $\tfrac12E^2$ for a body that starts at rest far away.`,
    },
    {
      tex: t`-\varepsilon\frac{M}{r}`, name: 'Newton’s gravity', badge: 'est-obs', units: 'dimensionless',
      text: t`Newton's potential per unit mass, $-GM/r$, divided by $c^2$. It falls off most slowly of all the terms, so far from the mass it dominates: the planets' orbits are mostly this.

It carries $\varepsilon$, so it is absent for light. Light is still attracted, through the last term.`,
    },
    {
      tex: t`\frac{L^2}{2r^2}`, name: 'the centrifugal barrier', badge: 'est-der', units: 'dimensionless',
      text: t`$L = r^2\,d\phi/d\lambda$ is the angular momentum per unit mass, conserved because the spacetime is the same in every direction (in SI, $L$ in m²/s divided by $c$ gives this length). Orbits are taken in the equatorial plane, $\theta = \pi/2$, which spherical symmetry allows.

The same term as in Newton's mechanics: sideways motion keeps a body from falling straight in, and the barrier rises as $1/r^2$.`,
    },
    {
      tex: t`-\frac{ML^2}{r^3}`, name: 'the general-relativity term', badge: 'est-obs', units: 'dimensionless',
      text: t`No counterpart in Newton's theory. It is the centrifugal term times $2M/r$ — tiny far out, but it grows faster than the barrier as $r$ shrinks and wins inside $r = 2M$. So the potential turns over into a hump, and a body that comes in over the hump is captured, however much angular momentum it has.

It makes orbits precess (Mercury's 43″ per century, the star S2's 12′ per orbit around the Milky Way's black hole), removes stable circular orbits inside $6M$, and gives light a circular orbit at $3M$.`,
    },
    {
      tex: t`\tfrac12E^2`, name: 'the conserved energy', badge: 'est-der', units: 'dimensionless',
      text: t`$E = \big(1 - \tfrac{2M}{r}\big)\dfrac{dt}{d\lambda}$, conserved because the spacetime does not change with $t$. For a body it is the energy per unit rest mass, as measured from far away: $E = 1$ for one released from rest at infinity, $E < 1$ for a bound orbit.

For light only the ratio $b = L/E$ matters: it is the impact parameter, how far from the centre the ray's straight line of approach would pass.`,
    },
  ],
  readAloud: t`Half the square of the radial speed, plus an effective potential built from a rest-mass constant, Newton's attraction, the centrifugal barrier and a new attraction that grows as one over r cubed, equals half the square of the conserved energy.`,
  why: t`It turns every orbit around a star or black hole into a marble rolling on a curve: read the curve and you can see precession, the innermost stable orbit, the photon sphere and the size of a black hole's shadow.`,
  visual: {
    type: 'orbit',
    title: 'A marble on the curve',
    lead: t`Left: an orbit around a black hole, computed exactly ($G = c = 1$, radii in units of $M$). Right: its effective potential, drawn doubled as $2V(r) = (1 - 2M/r)(1 + L^2/r^2)$, with the dashed line at $E^2$. Where the two meet, $dr/d\lambda = 0$ and the orbit turns around.`,
    tasks: [
      'Switch gravity to Newton: the −ML²/r³ term disappears, the barrier on the right climbs without limit, and the orbit closes on itself.',
      'Back to Einstein: the closest approach moves round from orbit to orbit. That precession is the −ML²/r³ term at work.',
      'Lower L to 3.6: the hump now lies below the energy line. Nothing turns the body round, and it plunges through the horizon.',
    ],
    params: { mode: 'schwarzschild', r0: 20, L: 4, compare: false },
  },
  practice: [
    mcq({
      id: 'gr-term', difficulty: 1,
      prompt: t`$$\tfrac12\Big(\frac{dr}{d\lambda}\Big)^2 + \tfrac12\varepsilon - \varepsilon\frac{M}{r} + \frac{L^2}{2r^2}\underbrace{-\,\frac{ML^2}{r^3}}_{\text{?}} = \tfrac12E^2$$ Which statement about the marked term is right?`,
      choices: [
        'It has no counterpart in Newton’s theory; it grows faster than the centrifugal barrier as r shrinks and turns the potential over into a hump',
        'It is Newton’s gravitational attraction',
        'It is a repulsion that keeps orbits from falling in',
        'It vanishes for light, which has no mass',
      ],
      answer: 0,
      why: {
        1: t`Newton's attraction is $-\varepsilon M/r$, the term before the barrier. Remove the marked term and what is left is exactly Newton's energy equation.`,
        2: t`It is negative and steepens as $r$ shrinks: it pulls inward. It is what removes the barrier.`,
        3: t`It carries no $\varepsilon$: it survives for light. It is the $-\varepsilon M/r$ term that vanishes.`,
      },
      hints: ['Compare the two curves in the picture: what does the potential do close in, with and without this term?'],
      teach: 'The −ML²/r³ term is the one piece of the potential with no Newtonian counterpart; close in it beats the centrifugal barrier.',
      explain: t`Without it (dashed) the barrier $L^2/2r^2$ rises without limit and nothing can reach $r = 0$ with any angular momentum. With it (solid) the potential peaks — at $4M$ for $L = 4M$ — and falls to zero at the horizon. Every strong-field feature of Schwarzschild orbits comes from this term.`,
      visual: versus,
    }),
    num({
      id: 'ratio', difficulty: 2,
      gen(r) {
        const [what, rs, rTeX, rsTeX, dist, note] = r.pick([
          ['a GPS satellite orbiting the Earth', RS_EARTH, t`2.656\times10^{7}\ \text{m}`, t`8.87\ \text{mm}`, 2.656e7,
            'Utterly negligible for the orbit: the relativity that GPS must correct for is in its clocks, not its path.'],
          ['Mercury orbiting the Sun', RS_SUN, t`5.79\times10^{10}\ \text{m}`, t`2.95\ \text{km}`, 5.79e10,
            'Tiny — yet orbit after orbit it adds up to Mercury’s 43″ per century of precession.'],
          ['the star S2 at its closest to the Milky Way’s central black hole', RS_SGRA, t`120\ \text{AU} = ${sci(120 * AU)}\ \text{m}`, t`${sci(RS_SGRA)}\ \text{m}`, 120 * AU,
            'Large enough that S2’s orbit swings round by 12′ each time, as the GRAVITY instrument measured in 2020.'],
        ]);
        const q = rs / dist;
        return {
          prompt: t`The GR term $-ML^2/r^3$ and the centrifugal term $L^2/(2r^2)$ both contain $L^2$. How large is the first compared with the second (ignore the sign) for ${what}, at $r = ${rTeX}$? The Schwarzschild radius is $r_s = 2GM/c^2 = ${rsTeX}$.`,
          answer: q, tol: { rel: 0.02 },
          errors: [{ value: q / 2, feedback: 'That is M/r. The ratio is (ML²/r³) ÷ (L²/2r²) = 2M/r: keep the 2 from the denominator.' }, { value: 1 / q, feedback: 'Upside down: the GR term is the smaller one far from the mass.' }],
          hints: [t`$\dfrac{ML^2/r^3}{L^2/(2r^2)} = \dfrac{2M}{r}$, and $2M$ means $2GM/c^2 = r_s$.`, t`So the ratio is $r_s/r$.`],
          teach: 'The GR term is the centrifugal term times r_s/r: negligible in the Solar System, decisive near a horizon.',
          explain: t`$r_s/r = ${sci(q)}$. ${note} At $r = 2M$, the horizon, the two terms are equal.`,
          visual: twoTerms,
        };
      },
    }),
    num({
      id: 'circular', difficulty: 2,
      gen(r) {
        const L = r.pick([4, 4.5, 5]);
        const rp = rCirc(L), rm = rCirc(L, -1);
        return {
          prompt: t`A body circles a black hole with angular momentum $L = ${L}M$ ($G = c = 1$). Circular orbits sit where $dV/dr = 0$, which gives $r^2 - (L^2/M)\,r + 3L^2 = 0$. At what radius, in units of $M$, is the **stable** circular orbit?`,
          answer: rp, tol: { rel: 0.01 },
          errors: [
            { value: rm, feedback: 'That root is the top of the hump: an unstable circular orbit, which the slightest nudge ends. The stable one sits at the bottom of the well.' },
            { value: L * L, feedback: 'That is Newton’s circular orbit, r = L²/M. The GR term pulls the stable orbit inward.' },
          ],
          hints: [t`$r = \tfrac12\big[L^2 \pm L\sqrt{L^2 - 12}\big]$ in units of $M$.`, 'A stable orbit is at the bottom of a well, a minimum of V: the larger root.'],
          teach: 'For each angular momentum above 2√3 M there are two circular orbits: a stable one in the well and an unstable one on the hump.',
          explain: t`$r = \tfrac12\big[${L * L} + ${L}\sqrt{${round(L * L - 12, 2)}}\big] = ${sci(rp)}M$ (stable); the other root, $${sci(rm)}M$, is on the hump. Newton would put the circle at $L^2/M = ${L * L}M$. As $L$ falls to $2\sqrt3\,M$ the two orbits merge at $6M$, the innermost stable orbit.`,
          visual: wellFor(L),
        };
      },
    }),
    mcq({
      id: 'light', difficulty: 2,
      prompt: t`For light $\varepsilon = 0$. Which terms of the potential are left, and what does that say?`,
      choices: [
        t`Only $\dfrac{L^2}{2r^2} - \dfrac{ML^2}{r^3}$: light feels no Newtonian $-M/r$ pull; it is bent by the GR term alone`,
        t`All of them: light carries energy, so it is attracted like a mass`,
        t`Only $\dfrac{L^2}{2r^2}$: gravity does not act on light, which travels in straight lines`,
        t`Only $-M/r$: light has no angular momentum`,
      ],
      answer: 0,
      why: {
        1: t`The $\tfrac12\varepsilon$ and $-\varepsilon M/r$ terms carry $\varepsilon$, which is zero for light. Its attraction comes entirely through $-ML^2/r^3$.`,
        2: t`Then light would not bend at all — but the $-ML^2/r^3$ term carries no $\varepsilon$, and it bends light.`,
        3: t`$L = r^2\,d\phi/d\lambda$ is well defined for a ray: one that misses the centre has $L \neq 0$, and $L/E$ is its impact parameter.`,
      },
      hints: [t`Which terms carry a factor of $\varepsilon$?`],
      teach: 'For light only the centrifugal barrier and the GR term remain; its potential peaks at r = 3M for every L.',
      explain: t`$V = \dfrac{L^2}{2r^2}\Big(1 - \dfrac{2M}{r}\Big)$: both curves in the picture are this, scaled by $L^2$, so they peak at the same radius, $3M$ — the photon sphere — whatever $L$ is.`,
      visual: lightCurves,
    }),
    num({
      id: 'capture', difficulty: 3,
      prompt: t`For light, $V = \dfrac{L^2}{2r^2} - \dfrac{ML^2}{r^3}$ peaks at $r = 3M$. A ray coming in from far away is captured if $\tfrac12E^2$ is above the peak, and turned back if it is below. Writing $b = L/E$ for the ray's impact parameter (how far from the centre its straight line of approach would pass), find the largest $b$ that is captured. The black hole's capture cross-section for light is $\pi b^2$ for that $b$: how many times the cross-section of the horizon itself, $\pi(2M)^2$, is it?`,
      answer: 27 / 4, tol: { rel: 0.01 },
      errors: [
        { value: 27, feedback: 'That compares with πM². The horizon’s cross-section is π(2M)² = 4πM².' },
        { value: 9 / 4, feedback: 'That uses the photon sphere, r = 3M, as the capture radius. Rays are captured out to b = 3√3 M, farther than 3M, because light bends on its way in.' },
        { value: Math.sqrt(27) / 2, feedback: 'That is the ratio of the radii. Cross-sections are areas: square it.' },
      ],
      hints: [t`$V(3M) = \dfrac{L^2}{18M^2} - \dfrac{L^2}{27M^2} = \dfrac{L^2}{54M^2}$.`, t`Captured if $\tfrac12E^2 > L^2/(54M^2)$, that is $b^2 = L^2/E^2 < 27M^2$.`],
      teach: 'A black hole captures every ray aimed within 3√3 M of its centre: 6.75 times its horizon’s cross-section, and the radius of its shadow.',
      explain: t`$b_c = \sqrt{27}\,M = 3\sqrt3\,M \approx ${sci(Math.sqrt(27), 3)}M$, so $\pi b_c^2 = 27\pi M^2$, which is $27/4 = 6.75$ times $\pi(2M)^2$. Run backwards, the same number sets a black hole's shadow: a ray traced back from a telescope falls in if $b < 3\sqrt3\,M$, so the shadow's radius is $3\sqrt3\,M$, 2.6 times the horizon's.`,
      visual: lightLevels,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-newton', difficulty: 2,
      prompt: t`Far from the hole ($r \gg M$) a slowly moving body has $E$ close to 1. Write $E = 1 + \mathcal{E}$ with $\mathcal{E}$ small, so that $\tfrac12E^2 \approx \tfrac12 + \mathcal{E}$. What does the equation become?`,
      choices: [
        t`$\tfrac12(dr/d\tau)^2 - M/r + L^2/(2r^2) \approx \mathcal{E}$: Newton's energy equation per unit mass — the $\tfrac12\varepsilon$ cancels the rest energy, and the GR term is negligible`,
        t`$\tfrac12(dr/d\tau)^2 + \tfrac12 = \tfrac12E^2$: far away gravity drops out entirely`,
        t`$\tfrac12(dr/d\tau)^2 - ML^2/r^3 \approx \mathcal{E}$: far away the GR term takes over from $-M/r$`,
        t`$\tfrac12(dr/d\tau)^2 - M/r + L^2/(2r^2) = \tfrac12E^2 \approx \tfrac12$, so every orbit has positive energy and escapes`,
      ],
      answer: 0,
      why: {
        1: t`$-M/r$ falls off more slowly than any other term: far away it is the one that survives. It is Newton's gravity.`,
        2: t`The GR term is the centrifugal term times $2M/r$: far out it is the smallest of them all.`,
        3: t`That keeps the rest energy on one side only. The $\tfrac12\varepsilon$ on the left cancels the $\tfrac12$ on the right, leaving $\mathcal{E}$, which is negative for a bound orbit.`,
      },
      hints: [t`Subtract $\tfrac12$ from both sides.`, t`Compare the sizes of $M/r$, $L^2/r^2$ and $ML^2/r^3$ when $r \gg M$.`],
      teach: 'Far from the mass the equation is Newton’s energy equation, with the rest energy subtracted and E − 1 playing Newton’s energy per unit mass.',
      explain: t`$\tfrac12E^2 - \tfrac12 \approx \mathcal{E}$ is the energy per unit mass without the rest energy, in units of $c^2$. What remains, $\tfrac12\dot r^2 - M/r + L^2/2r^2 = \mathcal{E}$, is Newton's; the GR term adds a correction $2M/r$ times the centrifugal term, which is why the curves in the picture merge far out.`,
      visual: farOut,
    }),
    mcq({
      id: 'cp-marginal', difficulty: 3,
      prompt: t`A body is released from rest far from a black hole, so $E = 1$, with angular momentum $L = 4M$ ($G = c = 1$). What happens as it falls in?`,
      choices: [
        'It spirals toward r = 4M, where its energy exactly equals the top of the hump, circling ever closer to that unstable circular orbit — the borderline between capture and escape',
        'It swings round at r = 8M and flies back out, as a Newtonian parabola would',
        'It falls straight into the hole: anything released from rest falls in',
        'It settles onto the innermost stable circular orbit at 6M',
      ],
      answer: 0,
      why: {
        1: t`Newton's turning point, $L^2/2M = 8M$, ignores the $-ML^2/r^3$ term, which pulls the hump down until its top is exactly $\tfrac12$.`,
        2: t`It has angular momentum. With $L = 4M$ the hump reaches exactly $\tfrac12E^2$; with a little more $L$ the body would swing back out.`,
        3: t`Nothing removes its energy: $E$ stays 1, above the $\sqrt{8/9}$ of the innermost stable orbit, so it cannot settle there.`,
      },
      hints: [t`$\tfrac12E^2 = \tfrac12$. Where does $V(r)$ equal $\tfrac12$ for $L = 4M$?`, t`$V(r) = \tfrac12$ gives $-1/r + 8/r^2 - 16/r^3 = 0$, that is $(r - 4)^2 = 0$.`],
      teach: 'A body falling from rest with L = 4M just reaches the top of the potential at r = 4M: the marginally bound orbit, the line between capture and escape.',
      explain: t`$V = \tfrac12$ has a double root at $r = 4M$: the energy line just touches the top of the hump. The body approaches the unstable circular orbit there, circling more and more times. Less angular momentum and it is captured; more and it escapes. Newton would have turned it round at $8M$.`,
      visual: marginal,
    }),
    mcq({
      id: 'cp-neutron', difficulty: 2, transfer: true,
      prompt: t`A neutron star has a mass of 2.0 solar masses and a radius of 12.5 km. Outside it spacetime is exactly Schwarzschild's (Birkhoff's theorem), so the effective potential holds down to its surface. Which of these lie outside the star? ($GM_\odot/c^2 = 1.477$ km)`,
      choices: [
        t`The innermost stable circular orbit, at $6GM/c^2$, but not the photon sphere, at $3GM/c^2$`,
        'Both the innermost stable orbit and the photon sphere',
        'Neither: they belong to black holes, not stars',
        t`The photon sphere, at $3GM/c^2$, but not the innermost stable orbit, at $6GM/c^2$`,
      ],
      answer: 0,
      why: {
        1: t`$3GM/c^2 = ${sci(3 * M_KM)}$ km lies inside the 12.5-km star; light cannot circle there.`,
        2: 'Birkhoff’s theorem: outside any spherical body the spacetime is Schwarzschild’s, so its potential — hump, well and all — applies outside the surface.',
        3: t`The photon sphere is the inner one, $3GM/c^2$; the stable-orbit limit is twice as far out.`,
      },
      hints: [t`$GM/c^2 = 2.0\times1.477 = ${sci(M_KM)}$ km.`],
      teach: 'Outside any spherical body the Schwarzschild potential applies: for heavy neutron stars the innermost stable orbit lies outside the surface.',
      explain: t`$6GM/c^2 = ${sci(6 * M_KM)}$ km, outside the 12.5-km surface: gas spiralling in through an accretion disk runs out of stable orbits before it reaches the star, and plunges the rest of the way. $3GM/c^2 = ${sci(3 * M_KM)}$ km lies inside, so there is no photon sphere.`,
      visual: starPotential,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §5.4 (geodesics of Schwarzschild)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'GRAVITY Collaboration, “Detection of the Schwarzschild precession in the orbit of the star S2” (2020)', url: 'https://arxiv.org/abs/2004.07187' },
  ],
});
