// Perihelion advance from the orbit equation — Derivation Mode. The metric's
// independence of t and φ gives E = (1 − 2M/r) dt/dτ and L = r² dφ/dτ; the
// normalization of the four-velocity gives (dr/dτ)² = E² − (1 − 2M/r)(1 + L²/r²);
// with u = 1/r and φ as the variable, u'' + u = M/L² + 3Mu². First-order
// perturbation theory: u₀ = (1 + e cos φ)/p with p = L²/M; the resonant part
// of 3Mu₀² gives a secular (3Me/p²) φ sin φ, i.e. u ≈ (1 + e cos[(1 − 3M/p)φ])/p,
// so Δφ = 6πM/p per orbit: Mercury 0.1035″ per orbit, 42.98″ per century.
// Checked with SymPy (the radial equation, the orbit equation, the particular
// solutions) and numerically (RK4 on the exact equation: deviations 7.6×10⁻³,
// 7.6×10⁻⁴, 7.6×10⁻⁵ at p = 10³, 10⁴, 10⁵ M for e = 0.2). G = c = 1 inside the
// derivation. Avoids gr.S25.i's planets, S2, Hulse–Taylor and budget items.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { M_SUN, AU, ARCSEC, sci, round } from './_classic.js';

const t = String.raw;

// Mercury (IAU/JPL mean elements) and the asteroid 1566 Icarus
const MERC = { a: 5.7909e10, e: 0.2056, P: 87.969 };
const ICARUS = { a: 1.078, e: 0.827, P: 409 };          // AU, –, days
const pOf = (a, e) => a * (1 - e * e);
const MERC_P = pOf(MERC.a, MERC.e);
const MERC_ORBIT = (6 * Math.PI * M_SUN) / MERC_P;       // rad per orbit
const MERC_CY = (MERC_ORBIT / ARCSEC) * (36525 / MERC.P);
const ICARUS_ORBIT = (6 * Math.PI * M_SUN) / (pOf(ICARUS.a, ICARUS.e) * AU);
const ICARUS_CY = (ICARUS_ORBIT / ARCSEC) * (36525 / ICARUS.P);

// u = 1/r against φ, Newton's and a precessing one (advance exaggerated)
const unrolled = {
  type: 'graph',
  params: {
    x: [0, 13], y: [0.45, 1.6], xlabel: 'φ (radians)', ylabel: 'u × p',
    curves: [
      { fn: '1 + 0.4*cos(x)', color: 'accent', dash: true, width: 1.6, label: 'Newton', labelAt: 6.3, labelDx: -40, labelDy: -12 },
      { fn: '1 + 0.4*cos(x/1.15)', color: 'gold', label: 'relativity (exaggerated)', labelAt: 9.6, labelDy: -14 },
    ],
    vlines: [{ x: 6.2832, label: '2π' }, { x: 12.566, label: '4π' }],
  },
  caption: t`$u = 1/r$ (times $p$) against the angle $\phi$ for an orbit with $e = 0.4$. Newton's peaks — the perihelia — come every $2\pi$; the relativistic orbit's come later each time. Its advance is exaggerated about $${sci((2 * Math.PI * 0.15) / MERC_ORBIT, 1)}$ times compared with Mercury's.`,
};

// the forcing term that resonates
const forcing = {
  type: 'graph',
  params: {
    x: [0, 19], y: [-1.6, 1.6], xlabel: 'φ (radians)', ylabel: '',
    curves: [{ fn: 'cos(x)', color: 'accent', label: 'A cos φ, with A = 1', labelAt: 9.6, labelDy: -14 }],
    vlines: [{ x: 6.2832, label: '2π' }, { x: 12.566, label: '4π' }],
    hlines: [{ y: 0 }],
  },
  caption: t`The forcing on the right of $y'' + y = A\cos\phi$. The left side, with no forcing, rings as $\cos\phi$ and $\sin\phi$ — period $2\pi$, exactly the forcing's period: resonance.`,
};

// cos((1 − δ)φ) against its first-order expansion
const DELTA = 0.04;
const secularPic = {
  type: 'graph',
  params: {
    x: [0, 40], y: [-2.3, 2.3], xlabel: 'φ (radians)', ylabel: '',
    curves: [
      { fn: `cos((1 - ${DELTA})*x)`, color: 'gold', label: 'cos((1 − δ)φ)', labelAt: 3.2, labelDy: -12 },
      { fn: `cos(x) + ${DELTA}*x*sin(x)`, color: 'accent', dash: true, width: 1.8, label: 'cos φ + δφ sin φ', labelAt: 34.5, labelDy: -12 },
    ],
  },
  caption: t`A slightly slow oscillation, $\cos((1 - \delta)\phi)$ with $\delta = ${DELTA}$, and its first-order expansion in $\delta$. They agree while $\delta\phi \ll 1$; the expansion's "growing amplitude" is just the slow drift of the phase, written badly.`,
};

// an eccentric orbit around a black hole, to scale in units of M
const ellipsePic = (rp, ra) => {
  const p = (2 * rp * ra) / (rp + ra), e = (ra - rp) / (ra + rp);
  return {
    type: 'graph',
    params: {
      x: [round(-ra * 1.08), round(rp * 2.2)], y: [round(-ra * 0.75), round(ra * 0.75)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ polar: `${round(p, 6)}/(1 + ${round(e, 6)}*cos(theta))`, theta: [0, 6.2832], color: 'gold', width: 1.8 }],
      points: [
        { x: 0, y: 0, color: 'ink', r: 4, label: 'black hole', labelDx: -30, labelDy: 16 },
        { x: rp, y: 0, color: 'bad', r: 5, label: `closest: ${rp}M`, labelDx: 10, labelDy: 0 },
        { x: -ra, y: 0, color: 'accent', r: 5, label: `farthest: ${ra}M`, labelDx: 10, labelDy: -12 },
      ],
    },
    caption: t`One loop of the orbit, to scale in units of $M = GM/c^2$ ($G = c = 1$), drawn as a Newtonian ellipse — the precession is not shown. The horizon, at $2M$, is too small to see.`,
  };
};

// a ray of light passing a mass, bending hugely exaggerated
const lightPic = {
  type: 'graph',
  params: {
    x: [-6, 6], y: [-1.4, 2.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(max(0.36 - x^2, 0))', lower: '-sqrt(max(0.36 - x^2, 0))', from: -0.6, to: 0.6, color: 'gold', alpha: 0.85 }],
    curves: [
      { fn: '1.2', domain: [-6, 6], color: 'ink4', dash: true, width: 1 },
      { fn: '1.2 - 0.09*(x + sqrt(x^2 + 1.44))', domain: [-6, 6], color: 'accent', width: 2.2, label: 'light', labelAt: -5.2, labelDy: -12 },
    ],
  },
  caption: 'A ray of light passing a mass, with the bending hugely exaggerated; dashed, the straight line it would follow without the mass.',
};

// what three theories predict for Mercury, the third left blank
const theoriesPic = {
  type: 'graph',
  params: {
    x: [0, 3.6], y: [-15, 52], grid: false, xlabel: ' ', ylabel: 'arcsec per century', xticks: 0,
    shade: [
      { fn: '43', from: 0.25, to: 0.95, color: 'ink3', alpha: 0.5 },
      { fn: round(MERC_CY, 4).toString(), from: 1.25, to: 1.95, color: 'gold', alpha: 0.85 },
    ],
    hlines: [{ y: 0 }],
    points: [
      { x: 0.25, y: 46.5, r: 0.01, color: 'ink2', label: 'measured: 43″' },
      { x: 1.25, y: 46.5, r: 0.01, color: 'gold', label: `GR: ${round(MERC_CY, 4)}″` },
      { x: 2.35, y: 8, r: 0.01, color: 'violet', label: 'Nordström: ?' },
    ],
  },
  caption: 'Mercury’s anomalous perihelion advance, arcseconds per century: the measured value and general relativity’s prediction. The third theory’s bar is for you to find.',
};

// Mercury, Earth and Icarus to scale (AU); orientations not real
const icarusPic = {
  type: 'graph',
  params: {
    x: [-2.2, 1.35], y: [-1.3, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.2, dash: true },
      { polar: `${round(pOf(0.387, 0.2056), 5)}/(1 + 0.2056*cos(theta))`, theta: [0, 6.2832], color: 'accent', width: 1.6 },
      { polar: `${round(pOf(ICARUS.a, ICARUS.e), 5)}/(1 + ${ICARUS.e}*cos(theta))`, theta: [0, 6.2832], color: 'gold', width: 2 },
    ],
    points: [
      { x: 0, y: 0, color: 'gold', r: 6, label: 'Sun', labelDx: -12, labelDy: 16 },
      { x: -1.85, y: 0.32, r: 0.01, color: 'gold', label: 'Icarus' },
      { x: 0.05, y: 0.42, r: 0.01, color: 'accent', label: 'Mercury' },
      { x: 0.55, y: 0.95, r: 0.01, color: 'teal', label: 'Earth' },
    ],
  },
  caption: 'The orbits of Mercury, the Earth (dashed) and the asteroid Icarus, to scale in AU. Their real orientations differ; only the sizes and shapes are right.',
};

export default lesson({
  id: 'gr.S25.d',
  title: 'Perihelion advance from the orbit equation',
  minutes: 16, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`Step 23 found a conserved quantity because the Schwarzschild metric does not depend on $t$. It does not depend on $\phi$ either, which gives a second: the angular momentum. With both, the normalization of the four-velocity turns the geodesic equation for an orbit into a single equation for $u = 1/r$ as a function of angle: Newton's orbit equation plus one extra term, $3Mu^2$. Solving it to first order in that term gives a perihelion advance of $6\pi M/p$ per orbit — for Mercury, 42.98″ per century, the number that convinced Einstein in November 1915.

Conventions: Carroll's, signature $(-,+,+,+)$, **with $G = c = 1$**, so $M$ means $GM/c^2$ (1476.6 m for the Sun). Orbits lie in the plane $\theta = \pi/2$, which spherical symmetry lets you choose.`,
  equation: t`\frac{d^2u}{d\phi^2} + u = \frac{M}{L^2} + 3Mu^2`,
  symbols: [
    { tex: 'u', text: t`$1/r$, the reciprocal of the areal radius; a function of the angle $\phi$ around the orbit` },
    { tex: '\\phi', text: 'the angle around the central mass, in the orbit’s plane, in radians' },
    { tex: 'L', text: t`the conserved angular momentum per unit mass, $r^2\,d\phi/d\tau$; with $G = c = 1$ a length (divide m²/s by $c$)` },
    { tex: 'M', text: t`the central mass as a length, $GM/c^2$` },
    { tex: '3Mu^2', text: t`the general-relativity term: about $3(v/c)^2$ times the Newtonian $M/L^2$ — $10^{-7}$ for Mercury` },
    { tex: 'p', text: t`$L^2/M$, the orbit's semi-latus rectum; in Newton's limit $p = a(1 - e^2)$, with $a$ the semi-major axis and $e$ the eccentricity` },
  ],
  why: t`The same equation, with the $M/L^2$ term gone, bends light (step 24); written as an energy equation it is the effective potential of black-hole orbits (step 21).`,
  visual: {
    type: 'graph',
    title: 'An ellipse that will not close',
    lead: t`The first-order solution of the orbit equation, $u = [1 + e\cos(k\phi)]/p$ with $k = 1/(1 + 3M/p)$, drawn for three turns ($p = 1$ sets the scale). Dashed: Newton's ellipse. Dots: successive perihelia. The strength $M/p$ is wildly exaggerated.`,
    tasks: [
      'Set the strength to 0: the orbit closes on itself — Kepler’s ellipse.',
      'Set it to 0.02: each perihelion lands 21.6° further round, in the direction the planet moves.',
      'Mercury’s M/p is 2.7×10⁻⁸ — far below the slider’s smallest step. Its orbit would look perfectly closed here, yet the advance adds up to 43″ a century.',
    ],
    params: {
      x: [-2.8, 2.8], y: [-2.1, 2.1], equal: true, xlabel: '', ylabel: '', axes: false,
      sliders: [
        { key: 'g', label: 'Strength $M/p$', min: 0, max: 0.04, step: 0.0005, value: 0.02, explain: 'The size of the relativistic correction, GM/(c²p). Mercury: 2.7 × 10⁻⁸; a star at 100 M from a black hole: 0.01.' },
        { key: 'e', label: 'Eccentricity $e$', min: 0, max: 0.6, step: 0.01, value: 0.4, explain: 'How stretched the orbit is: 0 is a circle. A circle has no perihelion to advance.' },
      ],
      curves: [
        { polar: '1/(1 + e*cos(theta))', theta: [0, 6.2832], color: 'accent', dash: true, width: 1.4 },
        { polar: '1/(1 + e*cos(theta/(1 + 3*g)))', theta: [0, 18.85], color: 'gold', width: 2 },
      ],
      points: [
        { x: 0, y: 0, color: 'ink', r: 4 },
        ...[0, 1, 2, 3].map((n) => ({ x: `cos(${2 * n}*pi*(1 + 3*g))/(1 + e)`, y: `sin(${2 * n}*pi*(1 + 3*g))/(1 + e)`, color: 'bad', r: 4.5 })),
      ],
      readouts: [
        { label: 'advance per orbit, $6\\pi M/p$', expr: '1080*g', unit: '^\\circ', digits: 4 },
      ],
    },
    caption: t`The first-order solution, with $k = 1/(1 + 3M/p)$ so that the perihelia advance by exactly $6\pi M/p$ (any $k = 1 - 3M/p + O(M^2/p^2)$ is equally good at this order). Strength exaggerated; distances in units of $p$.`,
  },
  example: {
    prompt: t`Derive the orbit equation from the Schwarzschild metric, solve it to first order in $M$, and find the perihelion advance per orbit. Then evaluate it for Mercury ($a = 5.7909\times10^{10}$ m, $e = 0.2056$, period 87.969 days).`,
    visual: unrolled,
    steps: [
      { label: 'Two conserved quantities', text: t`The metric is independent of $t$ and of $\phi$, so (as in step 23) the lowered components $u_t$ and $u_\phi$ are constant along a geodesic:
$$E = \left(1 - \frac{2M}{r}\right)\frac{dt}{d\tau}, \qquad L = r^2\frac{d\phi}{d\tau},$$
the energy and angular momentum per unit mass.` },
      { label: 'The radial equation', text: t`Put them into $g_{\mu\nu}u^\mu u^\nu = -1$ (with $\theta = \pi/2$):
$$-\frac{E^2}{1 - 2M/r} + \frac{1}{1 - 2M/r}\left(\frac{dr}{d\tau}\right)^2 + \frac{L^2}{r^2} = -1 \;\Rightarrow\; \left(\frac{dr}{d\tau}\right)^2 = E^2 - \left(1 - \frac{2M}{r}\right)\left(1 + \frac{L^2}{r^2}\right).$$` },
      { label: 'Trade τ for φ', text: t`With $u = 1/r$: $\dfrac{dr}{d\tau} = \dfrac{dr}{d\phi}\dfrac{d\phi}{d\tau} = -\dfrac{1}{u^2}\dfrac{du}{d\phi}\cdot Lu^2 = -L\,u'$, primes now meaning $d/d\phi$. So
$$u'^2 = \frac{E^2}{L^2} - (1 - 2Mu)\left(\frac{1}{L^2} + u^2\right).$$` },
      { label: 'Differentiate', text: t`Take $d/d\phi$ of both sides and divide by $2u'$ (it is non-zero except at the turning points):
$$u'' + u = \frac{M}{L^2} + 3Mu^2.$$
Newton's orbit equation is the same without $3Mu^2$. Its size relative to $M/L^2$ is $3L^2u^2 = 3(r\,d\phi/d\tau)^2 \approx 3v^2$: about $10^{-7}$ for Mercury. That calls for perturbation theory.` },
      { label: 'Zeroth order', text: t`Without the new term the solution is Kepler's ellipse, $u_0 = (1 + e\cos\phi)/p$ with $p = L^2/M$ — perihelion at $\phi = 0$, closing after exactly $2\pi$.` },
      { label: 'First order', text: t`Put $u = u_0 + u_1$ and keep terms first order in $M/p$: $u_1'' + u_1 = 3Mu_0^2 = \dfrac{3M}{p^2}\left(1 + 2e\cos\phi + e^2\cos^2\phi\right)$. The constant and $\cos 2\phi$ parts only nudge the orbit's size and shape. The $\cos\phi$ part has exactly the left side's natural frequency, and resonates: it gives $u_1 \supset \dfrac{3Me}{p^2}\,\phi\sin\phi$, which grows with every turn.` },
      { label: 'Read off the advance', text: t`$u \approx \dfrac1p\left[1 + e\cos\phi + \dfrac{3M}{p}\,e\,\phi\sin\phi\right] \approx \dfrac1p\left[1 + e\cos\!\left(\left(1 - \dfrac{3M}{p}\right)\phi\right)\right]$, since $\cos(\phi - \delta\phi) \approx \cos\phi + \delta\phi\sin\phi$. Perihelion comes when $(1 - 3M/p)\phi = 2\pi$, at $\phi \approx 2\pi(1 + 3M/p)$:
$$\Delta\phi = \frac{6\pi M}{p} \;\text{ per orbit} \;=\; \frac{6\pi GM}{c^2a(1 - e^2)}.$$` },
      { label: 'Mercury', text: t`$p = a(1 - e^2) = ${sci(MERC_P, 4)}$ m and $GM_\odot/c^2 = 1476.6$ m, so $\Delta\phi = ${sci(MERC_ORBIT, 4)}$ rad $= ${sci(MERC_ORBIT / ARCSEC, 4)}''$ per orbit. A century holds $36\,525/87.969 = ${sci(36525 / MERC.P, 4)}$ orbits: $${sci(MERC_CY, 4)}''$ per century. The measured anomaly is $43''$ per century.` },
      { label: 'Check the approximation', text: t`Integrating the exact equation numerically (with $e = 0.2$) gives an advance larger than $6\pi M/p$ by $7.6\times10^{-3}$, $7.6\times10^{-4}$ and $7.6\times10^{-5}$ of itself at $p = 10^3$, $10^4$ and $10^5\,M$: the error shrinks in proportion to $M/p$, as a first-order result should. For Mercury it is a few parts in $10^{8}$.` },
    ],
    answer: t`$u'' + u = M/L^2 + 3Mu^2$ gives $\Delta\phi = 6\pi M/p = 6\pi GM/[c^2a(1 - e^2)]$ per orbit: $${sci(MERC_ORBIT / ARCSEC, 4)}''$ per orbit and $${sci(MERC_CY, 4)}''$ per century for Mercury.`,
  },
  practice: [
    expr({
      id: 'radial', difficulty: 2,
      prompt: t`An orbit in the equatorial plane of a Schwarzschild black hole ($G = c = 1$) has $\dfrac{dt}{d\tau} = \dfrac{E}{1 - 2M/r}$ and $\dfrac{d\phi}{d\tau} = \dfrac{L}{r^2}$. Substitute these into the normalization
$$-\left(1 - \frac{2M}{r}\right)\left(\frac{dt}{d\tau}\right)^2 + \frac{1}{1 - 2M/r}\left(\frac{dr}{d\tau}\right)^2 + r^2\left(\frac{d\phi}{d\tau}\right)^2 = -1$$
and solve for $(dr/d\tau)^2$. Use $E$, $L$, $M$, $r$.`,
      answer: 'E^2 - (1 - 2M/r)(1 + L^2/r^2)', answerTeX: t`E^2 - \left(1 - \frac{2M}{r}\right)\left(1 + \frac{L^2}{r^2}\right)`, lhs: t`\left(\frac{dr}{d\tau}\right)^2`,
      vars: { E: [0.9, 0.99], L: [3, 6], M: [0.5, 1.5], r: [8, 20] },
      errors: [
        { answer: 'E^2 - 1 + 2M/r - L^2/r^2', feedback: t`That drops the cross term $+2ML^2/r^3$ — the one piece with no Newtonian counterpart. Multiply out $(1 - 2M/r)(1 + L^2/r^2)$ fully.` },
        { answer: 'E^2 + (1 - 2M/r)(1 + L^2/r^2)', feedback: t`Check the sign: move $-1$ and the $L^2/r^2$ term to the right before multiplying by $1 - 2M/r$.` },
        { answer: '(E^2 - (1 - 2M/r)(1 + L^2/r^2))/(1 - 2M/r)', feedback: t`Multiply through by $(1 - 2M/r)$ completely: the $E^2$ term loses its denominator too.` },
      ],
      hints: [t`$-(1 - 2M/r)\dfrac{E^2}{(1 - 2M/r)^2} = -\dfrac{E^2}{1 - 2M/r}$, and $r^2\dfrac{L^2}{r^4} = \dfrac{L^2}{r^2}$.`, t`Multiply the whole equation by $(1 - 2M/r)$ and isolate $(dr/d\tau)^2$.`],
      teach: 'Two conserved quantities and the normalization of the four-velocity reduce an orbit to one first-order equation in r.',
      explain: t`$-\dfrac{E^2}{1 - 2M/r} + \dfrac{\dot r^2}{1 - 2M/r} + \dfrac{L^2}{r^2} = -1$; multiplying by $1 - 2M/r$ gives $\dot r^2 = E^2 - (1 - 2M/r)(1 + L^2/r^2)$. Expanded, the right side is $E^2 - 1 + \dfrac{2M}{r} - \dfrac{L^2}{r^2} + \dfrac{2ML^2}{r^3}$: Newton's energy equation plus that last term.`,
      visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 25, L: 4.6, compare: false }, caption: t`An orbit integrated from this equation ($G = c = 1$, radii in units of $M$). Right: $E^2$ (dashed) and the potential curve $(1 - 2M/r)(1 + L^2/r^2)$; $\dot r^2$ is the gap between them, zero at the turning points.` },
    }),
    expr({
      id: 'orbit-eq', difficulty: 3,
      prompt: t`With $u = 1/r$ and the angle $\phi$ as the variable, the radial equation becomes
$$\left(\frac{du}{d\phi}\right)^2 = \frac{E^2}{L^2} - (1 - 2Mu)\left(\frac{1}{L^2} + u^2\right).$$
Differentiate both sides with respect to $\phi$ and divide by $2\,du/d\phi$. What is $d^2u/d\phi^2$? Use $u$, $M$, $L$.`,
      answer: 'M/L^2 - u + 3M u^2', answerTeX: t`\frac{M}{L^2} - u + 3Mu^2`, lhs: t`\frac{d^2u}{d\phi^2}`,
      vars: { u: [0.02, 0.2], M: [0.5, 1.5], L: [3, 6] },
      errors: [
        { answer: 'M/L^2 - u + M u^2', feedback: t`Differentiate both factors of the product: $(1 - 2Mu)$ gives $-2Mu'$, but $(1/L^2 + u^2)$ gives $2uu'$, and its product with $-2Mu$ adds another $2Mu^2$.` },
        { answer: 'M/L^2 - u + 2M u^2', feedback: t`Collect all the $u^2$ terms: $Mu^2$ from the first part of the product rule and $2Mu^2$ from the second.` },
        { answer: 'M/L^2 - u', feedback: t`That is Newton's orbit equation: it drops the terms from differentiating the $2Mu\cdot u^2$ product.` },
      ],
      hints: [t`$\dfrac{d}{d\phi}\left[(1 - 2Mu)\left(\tfrac{1}{L^2} + u^2\right)\right] = -2Mu'\left(\tfrac{1}{L^2} + u^2\right) + (1 - 2Mu)\,2uu'$.`, t`So $2u'u'' = 2Mu'\left(\tfrac{1}{L^2} + u^2\right) - 2uu'(1 - 2Mu)$; divide by $2u'$.`],
      teach: 'Differentiating the first-order energy equation gives a second-order orbit equation, which is easier to solve by perturbation.',
      explain: t`$u'' = \dfrac{M}{L^2} + Mu^2 - u + 2Mu^2 = \dfrac{M}{L^2} - u + 3Mu^2$, so $u'' + u = M/L^2 + 3Mu^2$ (checked with SymPy). The constant $E^2/L^2$ disappears: the orbit's shape needs only $M/L^2$ and the new term.`,
      visual: unrolled,
    }),
    expr({
      id: 'resonance', difficulty: 3,
      prompt: t`The first-order correction obeys an equation of the form $y'' + y = A\cos\phi$ (primes are $d/d\phi$). A trial $y = C\cos\phi$ fails — it gives zero on the left. Try $y = C\,\phi\sin\phi$ and find the particular solution $y(\phi)$. Use $A$ and \`phi\`.`,
      answer: 'A phi sin(phi)/2', answerTeX: t`\frac{A}{2}\,\phi\sin\phi`, lhs: 'y',
      vars: { A: [0.5, 2], phi: [0.3, 3] },
      errors: [
        { answer: '-A phi sin(phi)/2', feedback: t`$(\phi\sin\phi)'' = 2\cos\phi - \phi\sin\phi$, so $y'' + y = 2C\cos\phi$: $C = +A/2$.` },
        { answer: 'A phi sin(phi)', feedback: t`$y'' + y = 2C\cos\phi$ for $y = C\phi\sin\phi$, so $C = A/2$, not $A$.` },
        { answer: 'A sin(phi)/2', feedback: t`$\sin\phi$ solves the equation with no forcing, so it gives zero on the left. The factor $\phi$ is what makes the trial work.` },
      ],
      hints: [t`$(\phi\sin\phi)' = \sin\phi + \phi\cos\phi$; differentiate once more.`, t`$(\phi\sin\phi)'' = 2\cos\phi - \phi\sin\phi$, so $(\phi\sin\phi)'' + \phi\sin\phi = 2\cos\phi$.`],
      teach: 'Forcing at the natural frequency gives a response that grows like φ sin φ — in an orbit, the signature of a slow drift of the phase.',
      explain: t`$y = \tfrac{A}{2}\phi\sin\phi$ gives $y'' + y = \tfrac{A}{2}\cdot2\cos\phi = A\cos\phi$. In the orbit, $A = 6M^2e/L^4 = 6Me/p^2$, so $u_1 \supset \dfrac{3Me}{p^2}\phi\sin\phi$ — the term that moves the perihelion.`,
      visual: forcing,
    }),
    mcq({
      id: 'secular', difficulty: 3,
      prompt: t`The first-order solution contains $\dfrac{3Me}{p^2}\,\phi\sin\phi$, which grows without limit as the planet goes round. Why does that **not** mean the orbit grows without limit?`,
      choices: [
        t`It is the first-order expansion of a shifted frequency: $\cos\phi + \delta\phi\sin\phi \approx \cos((1 - \delta)\phi)$ while $\delta\phi \ll 1$, so the orbit keeps its shape and only its phase drifts — the perihelion advances`,
        'It does mean that: orbits in general relativity spiral slowly outward',
        'The growing term is a rounding error of the approximation and should simply be dropped',
        'Energy conservation forbids growth, so the term must be cancelled by the next order',
      ],
      answer: 0,
      why: {
        1: 'A single body in the Schwarzschild spacetime has conserved E and L: its orbit neither spirals in nor out. (Gravitational waves do shrink orbits, but that is a separate, far smaller effect.)',
        2: 'Dropping it throws away the physics: it is the only term that accumulates, orbit after orbit, and it is exactly the perihelion advance.',
        3: 'The next order does not cancel it; it corrects the drift rate slightly, at relative size M/p.',
      },
      hints: ['Compare the two curves in the picture: when do they agree, and when do they part?', t`Expand $\cos((1 - \delta)\phi) = \cos\phi\cos\delta\phi + \sin\phi\sin\delta\phi$ for small $\delta\phi$.`],
      teach: 'A secular term in a first-order solution is usually a slowly drifting phase written as a growing amplitude.',
      explain: t`$\cos((1 - \delta)\phi) \approx \cos\phi + \delta\phi\sin\phi$ as long as $\delta\phi \ll 1$. Resumming, $u \approx [1 + e\cos((1 - 3M/p)\phi)]/p$: an ellipse whose orientation turns by $6\pi M/p$ each orbit. For Mercury $\delta = 3M/p \approx 8\times10^{-8}$, so the expansion holds for millions of orbits.`,
      visual: secularPic,
    }),
    num({
      id: 'turning-points', difficulty: 2,
      gen(r) {
        const [rp, ra] = r.pick([[50, 150], [20, 60], [40, 200], [100, 300], [30, 90]]);
        const p = (2 * rp * ra) / (rp + ra), x = ((6 * Math.PI) / p) * (180 / Math.PI);
        const a = (rp + ra) / 2;
        return {
          prompt: t`A small body orbits a black hole ($G = c = 1$), swinging between $r = ${rp}M$ at its closest and $r = ${ra}M$ at its farthest. The zeroth-order solution $u_0 = (1 + e\cos\phi)/p$ has its maximum $1/r_\text{min}$ and minimum $1/r_\text{max}$ at $\phi = 0$ and $\pi$. Use them to find $p$, then estimate the advance per orbit, $6\pi M/p$, in degrees.`,
          answer: x, units: 'deg', tol: { rel: 0.01 },
          errors: [
            { value: ((6 * Math.PI) / a) * (180 / Math.PI), feedback: t`That uses the semi-major axis $a = (r_\text{min} + r_\text{max})/2$. The formula needs $p = a(1 - e^2)$, from $\dfrac{2}{p} = \dfrac{1}{r_\text{min}} + \dfrac{1}{r_\text{max}}$.` },
            { value: ((6 * Math.PI) / rp) * (180 / Math.PI), feedback: t`That uses the closest distance itself. $p$ lies between the two distances: $2/p = 1/r_\text{min} + 1/r_\text{max}$.` },
          ],
          hints: [t`$\dfrac{1}{r_\text{min}} = \dfrac{1 + e}{p}$ and $\dfrac{1}{r_\text{max}} = \dfrac{1 - e}{p}$; add them.`, t`$\dfrac{2}{p} = \dfrac{1}{${rp}} + \dfrac{1}{${ra}}$, so $p = ${sci(p, 4)}M$; then $6\pi/p$ radians.`],
          teach: 'The semi-latus rectum p is the harmonic mean of the closest and farthest distances: 2/p = 1/r_min + 1/r_max.',
          explain: t`$p = 2(${rp})(${ra})/(${rp} + ${ra}) = ${sci(p, 4)}M$, so $\Delta\phi \approx 6\pi/${sci(p, 4)} = ${sci((6 * Math.PI) / p, 3)}$ rad $= ${sci(x, 3)}^\circ$ per orbit. So close to a black hole the first-order formula is only a guide: the exact advance is larger by a fraction of order $M/p \approx ${sci(1 / p, 1)}$.`,
          visual: ellipsePic(rp, ra),
        };
      },
    }),
    code({
      id: 'exact-orbit', difficulty: 3,
      prompt: t`Test the approximation. The program integrates an orbit from one perihelion to the next with RK4 and returns the advance in radians. Complete \`rhs(u, w, L)\`: writing $w = du/d\phi$, the orbit equation becomes $u' = w$, $w' = M/L^2 - u + 3Mu^2$. The tests compare the exact advance with $6\pi M/p$.`,
      starter: t`import math

M = 1.0          # G = c = 1, lengths in units of M
e = 0.2          # eccentricity of the starting ellipse

def rhs(u, w, L):
    """The orbit equation as two first-order equations: u' = w, w' = u''."""
    return w, 0   # replace 0 with u'' from the orbit equation

def precession(p, steps_per_orbit=4000):
    """Integrate from one perihelion to the next (RK4 in phi); return the advance in radians."""
    L = math.sqrt(p*M)
    u, w, phi = (1 + e)/p, 0.0, 0.0
    h = 2*math.pi/steps_per_orbit
    for _ in range(3*steps_per_orbit):                  # at most three turns
        k1 = rhs(u, w, L)
        k2 = rhs(u + h/2*k1[0], w + h/2*k1[1], L)
        k3 = rhs(u + h/2*k2[0], w + h/2*k2[1], L)
        k4 = rhs(u + h*k3[0], w + h*k3[1], L)
        u_new = u + h/6*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0])
        w_new = w + h/6*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        if phi > math.pi and w > 0 >= w_new:          # u passes a maximum: perihelion
            return phi + h*w/(w - w_new) - 2*math.pi
        u, w, phi = u_new, w_new, phi + h
    return float('nan')                                  # no perihelion found
`,
      answer: t`import math

M = 1.0          # G = c = 1, lengths in units of M
e = 0.2          # eccentricity of the starting ellipse

def rhs(u, w, L):
    """The orbit equation as two first-order equations: u' = w, w' = u''."""
    return w, M/L**2 - u + 3*M*u**2

def precession(p, steps_per_orbit=4000):
    """Integrate from one perihelion to the next (RK4 in phi); return the advance in radians."""
    L = math.sqrt(p*M)
    u, w, phi = (1 + e)/p, 0.0, 0.0
    h = 2*math.pi/steps_per_orbit
    for _ in range(3*steps_per_orbit):                  # at most three turns
        k1 = rhs(u, w, L)
        k2 = rhs(u + h/2*k1[0], w + h/2*k1[1], L)
        k3 = rhs(u + h/2*k2[0], w + h/2*k2[1], L)
        k4 = rhs(u + h*k3[0], w + h*k3[1], L)
        u_new = u + h/6*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0])
        w_new = w + h/6*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        if phi > math.pi and w > 0 >= w_new:          # u passes a maximum: perihelion
            return phi + h*w/(w - w_new) - 2*math.pi
        u, w, phi = u_new, w_new, phi + h
    return float('nan')                                  # no perihelion found
`,
      tests: [
        { name: t`at $p = 1000M$ the exact advance is within 1% of $6\pi M/p$`, code: 'abs(precession(1000)/(6*math.pi/1000) - 1) < 0.01' },
        { name: 'it is a little larger than the first-order value', code: 'precession(1000) > 6*math.pi/1000' },
        { name: t`at $p = 10\,000M$ the two agree to 0.1%`, code: 'abs(precession(10000)/(6*math.pi/10000) - 1) < 0.001' },
      ],
      hints: [t`\`rhs\` must return the pair $(u', w')$, and $w' = u''$.`, t`\`return w, M/L**2 - u + 3*M*u**2\``],
      teach: 'A first-order result should differ from the exact one by a fraction of order the small parameter — here M/p.',
      explain: t`With the orbit equation in place the exact advance at $p = 1000M$ is $0.018993$ rad against $6\pi/1000 = 0.018850$: larger by $0.76\%$. At $p = 10^4M$ the gap is $0.076\%$ — ten times smaller, as a correction of relative size $M/p$ must be. Try deleting \`3*M*u**2\`: the advance drops to zero, Newton's closed ellipse.`,
      visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 22, L: 4.5, compare: true }, caption: t`An orbit integrated from the same equation ($G = c = 1$, radii in units of $M$), much closer in than $p = 1000M$; dashed, Newton's ellipse from the same start.` },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-light', difficulty: 2,
      prompt: t`Repeat the derivation for light. A photon's path is null, so the normalization becomes $g_{\mu\nu}\dfrac{dx^\mu}{d\lambda}\dfrac{dx^\nu}{d\lambda} = 0$ instead of $-1$, with $E$ and $L$ defined the same way (using an affine parameter $\lambda$). Which orbit equation results?`,
      choices: [
        t`$u'' + u = 3Mu^2$`,
        t`$u'' + u = \dfrac{M}{L^2} + 3Mu^2$, the same as for matter`,
        t`$u'' + u = \dfrac{M}{L^2}$`,
        t`$u'' + u = 0$: light is not affected by gravity`,
      ],
      answer: 0,
      why: {
        1: t`The $M/L^2$ term came from the $-1$ on the right of the normalization, through $(1 - 2Mu)\cdot1$. With $0$ there it is gone.`,
        2: t`That keeps Newton's term and drops the relativistic one — the reverse of what happens.`,
        3: t`$u'' + u = 0$ gives straight lines; but the $3Mu^2$ term came from the $L^2u^2$ part, which light still has.`,
      },
      hints: [t`With $0$ instead of $-1$: $u'^2 = \dfrac{E^2}{L^2} - (1 - 2Mu)u^2$.`],
      teach: 'For light only the relativistic term survives: u″ + u = 3Mu², the equation of light bending.',
      explain: t`$u'^2 = E^2/L^2 - u^2 + 2Mu^3$; differentiating gives $u'' + u = 3Mu^2$. Its straight-line solution $u = \sin\phi/b$ is bent by the right side: step 24 shows it gives $4M/b$.`,
      visual: lightPic,
    }),
    num({
      id: 'cp-nordstrom', difficulty: 3,
      prompt: t`In the parametrized post-Newtonian framework, any metric theory with space-curvature parameter $\gamma$ and nonlinearity parameter $\beta$ predicts $\dfrac{2 + 2\gamma - \beta}{3}$ times general relativity's perihelion advance (general relativity has $\gamma = \beta = 1$). Gunnar Nordström's 1913 scalar theory of gravity, a serious rival before 1915, has $\gamma = -1$ and $\beta = \tfrac12$. What did it predict for Mercury, in arcseconds per century? (GR: $${sci(MERC_CY, 4)}''$.)`,
      answer: (MERC_CY * (2 + 2 * -1 - 0.5)) / 3, units: 'arcsec', tol: { rel: 0.01 },
      errors: [
        { value: (MERC_CY * (2 + 2 * -1 + 0.5)) / 3, feedback: t`Mind the sign of $\beta$: the factor is $(2 + 2\gamma - \beta)/3$, so $\beta = \tfrac12$ is subtracted.` },
        { value: (MERC_CY * (2 + 2 * 1 - 0.5)) / 3, feedback: t`Nordström's $\gamma$ is $-1$, not $+1$: in his theory space curvature works the other way.` },
      ],
      hints: [t`$(2 + 2\gamma - \beta)/3$ with $\gamma = -1$, $\beta = \tfrac12$.`, t`$(2 - 2 - 0.5)/3 = -1/6$; multiply by $${sci(MERC_CY, 4)}''$.`],
      teach: 'The perihelion advance tests both how much space is curved (γ) and how gravity gravitates (β); a wrong theory can even get the sign wrong.',
      explain: t`$\dfrac{2 - 2 - \tfrac12}{3} = -\dfrac16$, so $${sci(MERC_CY, 4)}''\times(-\tfrac16) = ${sci((MERC_CY * -0.5) / 3, 3)}''$ per century: a **backward** (retrograde) advance, against an observed $+43''$. Mercury ruled the theory out; today the advance and other tests pin $|\beta - 1|$ below $8\times10^{-5}$.`,
      visual: theoriesPic,
    }),
    num({
      id: 'cp-icarus', difficulty: 3, transfer: true,
      prompt: t`The asteroid 1566 Icarus has a very eccentric orbit: $a = ${ICARUS.a}$ AU, $e = ${ICARUS.e}$, period ${ICARUS.P} days. In 1968 radar astronomers used it to test the perihelion advance far from Mercury. What does $6\pi GM_\odot/[c^2a(1 - e^2)]$ predict for it, in arcseconds per century? ($GM_\odot/c^2 = 1476.6$ m, 1 AU $= 1.496\times10^{11}$ m.)`,
      answer: ICARUS_CY, units: 'arcsec', tol: { rel: 0.01 },
      errors: [
        { value: ((6 * Math.PI * M_SUN) / (ICARUS.a * AU) / ARCSEC) * (36525 / ICARUS.P), feedback: t`You left out $1 - e^2 = ${sci(1 - ICARUS.e ** 2, 3)}$ — for this eccentric orbit it more than triples the advance.` },
        { value: ICARUS_ORBIT / ARCSEC, feedback: t`That is per orbit. A century holds $36\,525/${ICARUS.P}$ orbits.` },
      ],
      hints: [t`$p = a(1 - e^2) = ${ICARUS.a}\times(1 - ${ICARUS.e}^2)$ AU $= ${sci(pOf(ICARUS.a, ICARUS.e) * AU, 4)}$ m.`, t`Per orbit: $6\pi\times1476.6/p$ radians $\times 206\,265$; then multiply by $36\,525/${ICARUS.P}$.`],
      teach: 'The advance depends on the orbit’s semi-latus rectum: a very eccentric orbit dives close to the Sun and precesses fast even if its average distance is large.',
      explain: t`$p = ${sci(pOf(ICARUS.a, ICARUS.e) * AU, 4)}$ m gives $${sci(ICARUS_ORBIT / ARCSEC, 4)}''$ per orbit and $${sci(ICARUS_CY, 3)}''$ per century. Icarus's semi-major axis is almost three times Mercury's, but at perihelion it passes inside Mercury's orbit — and its $p$ is close to Mercury's. Shapiro and colleagues' radar measurements (1968) agreed with general relativity, within their uncertainty.`,
      visual: icarusPic,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (orbits and the perihelion advance)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Will, “The Confrontation between General Relativity and Experiment”, Living Rev. Relativ. 17, 4 (2014), §3.5', url: 'https://arxiv.org/abs/1403.7377' },
    { label: 'Shapiro, Ash & Smith, “Icarus: further confirmation of the relativistic perihelion precession”, Phys. Rev. Lett. 20, 1517 (1968)', url: 'https://doi.org/10.1103/PhysRevLett.20.1517' },
  ],
});
