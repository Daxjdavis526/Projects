// The FLRW metric and comoving coordinates — Derivation Mode. From the
// cosmological principle: comoving observers' proper time is cosmic time
// (g_00 = −c²), isotropy forbids g_0i and anisotropic stretching (g_ij =
// a²γ_ij), homogeneity + isotropy make each slice a space of constant
// curvature, ⁽³⁾R_ij = 2kγ_ij, ⁽³⁾R = 6k (so 6k/a² at time t); χ =
// arcsin(√k r)/√k. Christoffels: Γ^t_ij = aȧγ_ij/c², Γ^i_tj = (ȧ/a)δ^i_j,
// Γ^i_tt = 0 (comoving galaxies fall freely). Radial light: c dt = a dχ, so
// 1 + z = 1/a_emit; d = aχ gives ḋ = Hd; momenta decay as 1/a. Einstein–
// de Sitter light cone d = 3t^{2/3}(1 − t^{1/3}) (units ct₀): peaks at t = 8/27,
// d = 4/9 on the Hubble sphere, z = 5/4; ΛCDM peak z ≈ 1.59, 5.85 Gly (model
// gr-cosmology). Checked with SymPy (scratch v30.py). Conventions as gr.EQ.10:
// a = 1 today, r comoving, k in m⁻². Avoids gr.S30.i and gr.EQ.10's items.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { sci, round, grid4 } from './_derivlate.js';
import { C_KMS, LY_PER_MPC, comovingDistance, hubbleTime } from '../../src/viz/model/gr-cosmology.js';

const t = String.raw;
const H0 = 67.4;
const TWO_C_H = (2 * C_KMS) / H0;                                   // 2c/H₀ in Mpc (EdS distance scale)
const EDS_AGE = (2 / 3) * hubbleTime(H0);                           // Gyr
const eds = { chi: (z) => TWO_C_H * (1 - 1 / Math.sqrt(1 + z)), dA: (z) => TWO_C_H * (1 / (1 + z) - (1 + z) ** -1.5) };
const LCDM_PEAK = (() => {                                          // the largest proper distance at emission, Planck 2018
  let best = [0, 0];
  for (let z = 0.5; z <= 3; z += 0.01) { const d = comovingDistance(z, { Om: 0.315, OL: 0.685 }, H0, 4000) / (1 + z); if (d > best[1]) best = [z, d]; }
  return { z: best[0], gly: (best[1] * LY_PER_MPC) / 1e9 };
})();
const ARCSEC = 648000 / Math.PI;
const R3 = '{}^{(3)}\\!R';                                         // the curvature of a slice

// ── pictures ────────────────────────────────────────────────────────────────

// Einstein–de Sitter: galaxy worldlines d = χ t^{2/3}, our past light cone d = 3t^{2/3}(1 − t^{1/3}), the Hubble sphere 3t/2
const conePic = ({ slider = false, chis = [0.25, 0.5, 0.75, 1, 1.25, 1.75], sphere = true, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [0, 1.08], y: [0, 1.25], xlabel: 'cosmic time ÷ the age t₀', ylabel: 'proper distance from us ÷ ct₀',
    ...(slider ? {
      sliders: [{ key: 'X', label: 'A galaxy’s comoving distance $\\chi$, in units of $ct_0$', min: 0.05, max: 2.9, step: 0.01, value: 1, explain: 'Its distance today. It keeps this comoving label for ever; its proper distance is $a(t)\\,\\chi$.' }],
      readouts: [
        { label: 'redshift we see it at, $z$', expr: '1/(1 - X/3)^2 - 1', digits: 3 },
        { label: 'when its light left, $t/t_0$', expr: '(1 - X/3)^3', digits: 3 },
        { label: 'its distance then, $\\div\\,ct_0$', expr: 'X*(1 - X/3)^2', digits: 3 },
        { label: 'its distance now, $\\div\\,ct_0$', expr: 'X', digits: 3 },
      ],
    } : {}),
    curves: [
      ...chis.map((ch) => ({ fn: `${ch}*x^(2/3)`, domain: [0, 1.08], color: 'ink4', width: 1.2 })),
      { fn: '3*x^(2/3)*(1 - x^(1/3))', domain: [0, 1], color: 'gold', width: 2.8, label: 'our past light cone', labelAt: 0.62, labelDx: 8, labelDy: -12 },
      ...(sphere ? [{ fn: '1.5*x', domain: [0, 0.83], color: 'violet', width: 1.6, dash: true, label: 'Hubble sphere c/H', labelAt: 0.16, labelDx: -10, labelDy: -10, labelAlign: 'right' }] : []),
      ...(slider ? [{ fn: 'X*x^(2/3)', domain: [0, 1.08], color: 'accent', width: 2.2 }] : []),
    ],
    points: [
      { x: 1, y: 0, color: 'gold', r: 6, label: 'us, now', labelDx: -54, labelDy: -12 },
      ...(slider ? [{ x: '(1 - X/3)^3', y: 'X*(1 - X/3)^2', color: 'accent', r: 6, label: 'light leaves', labelDx: 10, labelDy: 14 }] : []),
    ],
  },
  caption: caption ?? `Einstein–de Sitter model — flat, matter only, a = (t/t₀)^(2/3) — chosen because everything has a closed form; time in units of the age t₀, distance in units of ct₀. Grey: galaxies at fixed comoving distance. In our universe (Planck 2018) the light cone peaks at z ≈ ${LCDM_PEAK.z.toFixed(1)}, ${LCDM_PEAK.gly.toFixed(2)} billion light-years.`,
});

// slices of constant cosmic time, comoving worldlines orthogonal to them
const slicesPic = {
  type: 'graph',
  params: {
    x: [-4.2, 4.2], y: [-0.3, 3.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      ...[0.4, 1.3, 2.2, 3.1].map((y) => ({ fn: `${y}`, domain: [-4, 4], color: 'ink3', width: 1.4 })),
      ...[-3, -1.5, 0, 1.5, 3].map((x) => ({ param: [`${x}*(0.55 + 0.45*t/3.2)`, 't'], t: [0.1, 3.3], color: 'accent', width: 2 })),
    ],
    points: [{ x: -4.0, y: 3.25, r: 0.01, color: 'ink3', label: 'slices of constant t', labelDx: 0, labelDy: 0 }, { x: 0.15, y: 0.15, r: 0.01, color: 'accent', label: 'comoving galaxies', labelDx: 0, labelDy: 0 }],
  },
  caption: 'Slices of constant cosmic time (grey) and the worldlines of comoving galaxies (blue), which spread apart as space grows (schematic). Each worldline crosses each slice at right angles.',
};

// one dimension suppressed: closed space as a circle; χ along it, r = circumference ÷ 2π
const ALPHA = 1.05, RC = 1.6;
const closedPic = {
  type: 'graph',
  params: {
    x: [-2.6, 2.6], y: [-1.9, 2.1], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: [`${RC}*cos(t)`, `${RC}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.6 },
      { param: [`${RC}*sin(t)`, `${RC}*cos(t)`], t: [0, ALPHA], color: 'gold', width: 3.2 },
      { param: [`${round(RC * Math.sin(ALPHA), 5)}*t`, `${round(RC * Math.cos(ALPHA), 5)}`], t: [0, 1], color: 'accent', width: 2.6 },
      { param: ['0', 't'], t: [-1.75, 1.95], color: 'ink4', width: 1, dash: true },
    ],
    points: [
      { x: 0, y: RC, color: 'gold', r: 5, label: 'us', labelDx: -24, labelDy: -6 },
      { x: round(RC * Math.sin(ALPHA), 4), y: round(RC * Math.cos(ALPHA), 4), color: 'accent', r: 5 },
      { x: 1.0, y: 1.75, r: 0.01, color: 'gold', label: 'χ: distance measured within space', labelDx: 0, labelDy: 0 },
      { x: -2.5, y: round(RC * Math.cos(ALPHA) - 0.32, 4), r: 0.01, color: 'accent', label: 'r: circumference ÷ 2π', labelDx: 0, labelDy: 0 },
      { x: -0.9, y: -0.35, r: 0.01, color: 'ink3', label: 'curvature radius 1/√k', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: 'Closed space with one dimension dropped: a circle of radius 1/√k (the real thing is a 3-sphere). A galaxy a distance χ from us along the space lies on a sphere whose circumference is 2πr — and r is smaller than χ.',
};

// momentum against scale factor
const decay = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 4.2], y: [0, 2.3], xlabel: 'scale factor a, relative to its value at the start', ylabel: 'momentum ÷ its starting value',
    curves: [{ fn: '1/x', domain: [0.45, 4.2], color: 'accent', width: 2.6 }],
    points: [{ x: 1, y: 1, color: 'gold', r: 5, label: 'start', labelDx: 8, labelDy: -6 }],
  },
  caption,
});

// a(t) for Einstein–de Sitter
const edsCurve = (caption) => ({
  type: 'gr-friedmann',
  params: { sliders: false, readout: false, models: [[1, 0, 'Einstein–de Sitter (matter only)', 'accent']], t: [-12, 10], a: [0, 1.8] },
  caption,
});

// galaxies in the Hubble flow and a probe moving through it
const probePic = {
  type: 'graph',
  params: {
    x: [-4.2, 4.2], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    arrows: [
      ...[[-3, 1], [-1.5, -1], [1.5, 1], [3, -1], [-3, -1], [3, 1]].map(([x, y]) => ({ from: [x, y], to: [round(x * 1.18, 4), round(y * 1.18, 4)], color: 'ink3' })),
      { from: [0, 0], to: [1.2, 0], color: 'bad' },
    ],
    points: [
      ...[[-3, 1], [-1.5, -1], [1.5, 1], [3, -1], [-3, -1], [3, 1]].map(([x, y]) => ({ x, y, color: 'ink2', r: 4 })),
      { x: 0, y: 0, color: 'gold', r: 6, label: 'probe', labelDx: -20, labelDy: 16 },
      { x: 0.25, y: 0.3, r: 0.01, color: 'bad', label: 'its speed through the local flow', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: 'Galaxies (grey) moving apart with the Hubble flow, and a probe moving through it (red, relative to the galaxies next to it). Not to scale.',
};

const CODE_START = t`import sympy as sp

r, th, ph, k = sp.symbols('r theta phi k', real=True)
Y = [r, th, ph]
gam = sp.diag(1/(1 - k*r**2), r**2, r**2*sp.sin(th)**2)   # the spatial part of FLRW, without a(t)^2
gami = gam.inv()

def christoffel(l, m, n):
    """Gamma^l_mn of gam."""
    return sum(gami[l, s]*(sp.diff(gam[s, m], Y[n]) + sp.diff(gam[s, n], Y[m]) - sp.diff(gam[m, n], Y[s])) for s in range(3))/2

def ricci(m, n):
    """R_mn = d_l G^l_mn - d_n G^l_lm + G^l_ls G^s_mn - G^l_ns G^s_lm (summed over l, s)."""
    tot = 0
    # complete the sums over l and s
    return sp.simplify(tot)

R3 = sp.simplify(sum(gami[m, n]*ricci(m, n) for m in range(3) for n in range(3)))
print('Ricci scalar of the slice:', R3)
`;
const CODE_ANSWER = CODE_START.replace(`    tot = 0
    # complete the sums over l and s
    return sp.simplify(tot)`, `    tot = 0
    for l in range(3):
        tot += sp.diff(christoffel(l, m, n), Y[l]) - sp.diff(christoffel(l, l, m), Y[n])
        for s in range(3):
            tot += christoffel(l, l, s)*christoffel(s, m, n) - christoffel(l, n, s)*christoffel(s, l, m)
    return sp.simplify(tot)`);

export default lesson({
  id: 'gr.S30.d',
  title: 'The FLRW metric and comoving coordinates',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`On scales of hundreds of megaparsecs the universe is the same everywhere and in every direction — the **cosmological principle**, borne out by galaxy surveys and the cosmic microwave background. That symmetry fixes the metric of spacetime up to one function of time and one constant. Observers who see the universe isotropic carry clocks that define **cosmic time**; isotropy forbids any time–space cross term and any stretching that favours a direction; homogeneity makes each slice of constant time a space of **constant curvature** $k$. The result is the Friedmann–Lemaître–Robertson–Walker metric, shown above.

Its null geodesics give the redshift, $1 + z = 1/a(t_\text{emit})$; proper distances $d = a\chi$ give Hubble's law; and every free particle's momentum decays as $1/a$. Conventions as in the FLRW dissection: $a = 1$ today, $r$ a comoving distance, $k$ in m⁻².`,
  equation: t`ds^2 = -c^2\,dt^2 + a(t)^2\left[\frac{dr^2}{1 - k r^2} + r^2\,d\Omega^2\right] = -c^2\,dt^2 + a(t)^2\left[d\chi^2 + r(\chi)^2\,d\Omega^2\right]`,
  symbols: [
    { tex: 't', text: t`cosmic time: the proper time of comoving observers, those who see the universe isotropic` },
    { tex: 'a(t)', text: t`the scale factor, 1 today, no units: every distance between comoving galaxies is proportional to it` },
    { tex: 'r', text: t`the comoving radial coordinate, fixed by areas: a sphere at $r$ has proper area $4\pi a^2r^2$` },
    { tex: '\\chi', text: t`the comoving radial distance, $d\chi = dr/\sqrt{1 - kr^2}$, measured within a slice and rescaled to today` },
    { tex: 'k', text: t`the spatial curvature, in m⁻²: $k > 0$ closed, $0$ flat, $k < 0$ open; today's curvature radius is $1/\sqrt{|k|}$` },
    { tex: 'd\\Omega^2', text: t`$d\theta^2 + \sin^2\theta\,d\phi^2$, directions on the sky` },
    { tex: 'c', text: t`the speed of light` },
  ],
  why: 'Every distance, age and redshift in cosmology is read off this metric — and the next step puts it into Einstein’s equations to find a(t) itself.',
  visual: {
    ...conePic({ slider: true }),
    title: 'Our past light cone in an expanding universe',
    lead: t`Galaxies sit at fixed comoving distances $\chi$, so their proper distances $a(t)\chi$ fan out (grey). Light we receive today travelled along the gold curve, solving $c\,dt = a\,d\chi$ backwards. Choose a galaxy: the blue dot is where its light set out.`,
    tasks: [
      'Move the galaxy outward from χ = 1: its light set out earlier, and from closer to us than χ = 1 galaxies were. The most distant sources we see were, when their light left, never farther than 4/9 of ct₀ — reached at z = 1.25.',
      'The gold curve turns over exactly where it crosses the dashed Hubble sphere: there the light, moving toward us at c, is carried away by the expansion at c. Inside, it gains on us; outside, it loses ground.',
      'Slide toward χ = 3: the redshift grows without limit. 3ct₀ is the particle horizon — light from farther away has not reached us yet.',
    ],
  },
  example: {
    prompt: t`Derive the FLRW metric from the cosmological principle, then show from it that light arrives redshifted by $1 + z = 1/a(t_\text{emit})$ and that comoving galaxies obey Hubble's law.`,
    visual: slicesPic,
    steps: [
      { label: 'Cosmic time', text: t`Comoving observers see the universe isotropic. Label each slice by the proper time of their clocks, $t$. If their worldlines were not perpendicular to the slices, their velocity relative to the slices would pick out a direction — so $g_{0i} = 0$ — and homogeneity makes every clock tick alike: $g_{00} = -c^2$. Hence $ds^2 = -c^2dt^2 + g_{ij}\,dx^idx^j$.` },
      { label: 'One scale factor', text: t`Isotropy also forbids space from stretching faster in one direction than another, and homogeneity forbids it from stretching faster in one place: $g_{ij}(t, \vec x) = a(t)^2\gamma_{ij}(\vec x)$, with one function $a(t)$.` },
      { label: 'Constant curvature', text: t`A space that is the same at every point and in every direction has the same curvature everywhere: $${R3}_{ij} = 2k\gamma_{ij}$ and $${R3} = 6k$ (so $6k/a^2$ at time $t$). Only three such spaces exist — the 3-sphere, flat space and the hyperbolic space — and in polar coordinates all three read $\gamma = \dfrac{dr^2}{1 - kr^2} + r^2d\Omega^2$.` },
      { label: 'Light', text: t`Radial light has $ds^2 = 0$: $c\,dt = a\,d\chi$. Two wave crests leave a galaxy at fixed $\chi$ a time $\delta t_e$ apart; both cover the same comoving distance, $\int c\,dt/a$, so $\delta t_e/a(t_e) = \delta t_o/a(t_o)$. Wavelengths stretch in proportion to $a$: $1 + z = a(t_o)/a(t_e) = 1/a(t_e)$.` },
      { label: 'Hubble law', text: t`The proper distance to a galaxy at fixed $\chi$ is $d = a(t)\chi$, so $\dot d = \dot a\chi = (\dot a/a)\,d = H d$: Hubble's law, exact at every distance, for every comoving observer.` },
      { label: 'Sense check', text: t`The Christoffel symbols have $\Gamma^i{}_{tt} = 0$: a galaxy at fixed comoving coordinates is in free fall — no force holds it on the grid. With $k = 0$ the slices are Euclidean, and at $a = 1$ comoving distances are today's proper distances.` },
    ],
    answer: t`$ds^2 = -c^2dt^2 + a(t)^2\left[\frac{dr^2}{1 - kr^2} + r^2d\Omega^2\right]$; radial light gives $1 + z = 1/a(t_e)$; $d = a\chi$ gives $\dot d = Hd$.`,
  },
  practice: [
    mcq({
      id: 'g0i', difficulty: 2,
      prompt: t`Why does the FLRW metric, written in cosmic time and comoving coordinates, have no cross terms $g_{0i}\,dt\,dx^i$?`,
      visual: slicesPic,
      choices: [
        t`A non-zero $g_{0i}$ would be a vector in space at every point — a preferred direction — which isotropy forbids`,
        t`Because the scale factor depends only on time`,
        t`Cross terms are always removable by a change of coordinates in any spacetime`,
        t`Because the universe is spatially flat`,
      ],
      answer: 0,
      why: {
        1: t`$a(t)$ multiplies the spatial part; it says nothing about whether time and space mix.`,
        2: t`Not in general: a rotating spacetime such as Kerr has a $g_{t\phi}$ no relabelling removes. Here isotropy is what forbids it.`,
        3: t`The cross terms vanish for $k > 0$ and $k < 0$ too; curvature is a separate question.`,
      },
      hints: [t`$g_{0i}$ has one space index: at each point, it is three numbers — an arrow. What would that arrow point along?`],
      teach: t`Isotropy for comoving observers forbids any preferred spatial direction, so $g_{0i} = 0$ in comoving coordinates.`,
      explain: t`The three components $g_{0i}$ form a spatial vector at each point. Any non-zero vector picks a direction, and isotropic observers see none. So the comoving worldlines cross the slices of constant $t$ at right angles, and $g_{0i} = 0$.`,
    }),
    mcq({
      id: 'free-fall', difficulty: 2,
      prompt: t`For FLRW, $\Gamma^t{}_{ij} = a\dot a\,\gamma_{ij}/c^2$, $\Gamma^i{}_{tj} = (\dot a/a)\,\delta^i{}_j$ and $\Gamma^i{}_{tt} = 0$. What does $\Gamma^i{}_{tt} = 0$ tell you about galaxies at fixed comoving coordinates?`,
      visual: conePic({ sphere: false, caption: 'Galaxies at fixed comoving distance (grey) in the Einstein–de Sitter model, their proper distances growing as (t/t₀)^(2/3), with our past light cone (gold).' }),
      choices: [
        t`They are in free fall: $x^i = $ const solves the geodesic equation, $d^2x^i/d\tau^2 = -\Gamma^i{}_{tt}(dt/d\tau)^2 = 0$`,
        'They are held on the grid by a force that balances the expansion',
        'They are at rest in space, so they feel no expansion',
        'They move away from us through space at the Hubble speed',
      ],
      answer: 0,
      why: {
        1: t`No force is needed: with the other velocity components zero, the geodesic equation for $x^i$ is satisfied by doing nothing.`,
        2: 'Their proper distances grow as a(t) — they feel the expansion as growing separations — but each is at rest relative to its own neighbourhood.',
        3: 'They do not move through space: the space between them grows. Their comoving coordinates never change.',
      },
      hints: [t`Write the geodesic equation for $x^i$ with $dx^j/d\tau = 0$: only the $\Gamma^i{}_{tt}$ term survives.`],
      teach: t`Comoving galaxies are freely falling observers: $\Gamma^i{}_{tt} = 0$ makes constant comoving coordinates a geodesic.`,
      explain: t`With $dx^j/d\tau = 0$, the geodesic equation reads $d^2x^i/d\tau^2 = -\Gamma^i{}_{tt}(dt/d\tau)^2 = 0$, so $x^i$ stays constant and $d\tau = dt$. The galaxies coast; the metric's $a(t)$ does the rest.`,
    }),
    expr({
      id: 'chi-of-r', difficulty: 2,
      prompt: t`In a closed universe ($k > 0$) the comoving distance to a galaxy at radial coordinate $r$ is $\chi = \displaystyle\int_0^r \frac{dr'}{\sqrt{1 - kr'^2}}$. Evaluate it.`,
      visual: closedPic,
      answer: 'asin(sqrt(k)*r)/sqrt(k)', answerTeX: t`\frac{1}{\sqrt k}\arcsin\!\left(\sqrt k\,r\right)`, lhs: t`\chi`,
      vars: { r: [0.1, 0.8], k: [0.5, 1.2] }, integrand: '1/sqrt(1 - k*r^2)',
      errors: [{ answer: 'asin(sqrt(k)*r)', feedback: t`Divide by $\sqrt k$: substitute $r = \sin u/\sqrt k$, so $dr = \cos u\,du/\sqrt k$.` }, { answer: 'r', feedback: t`That is the flat-space answer, $k = 0$. With $k > 0$ the integrand exceeds 1, so $\chi > r$.` }],
      hints: [t`Substitute $r' = \sin u/\sqrt k$: then $\sqrt{1 - kr'^2} = \cos u$ and $dr' = \cos u\,du/\sqrt k$.`, t`The integral becomes $\int du/\sqrt k$ from $0$ to $\arcsin(\sqrt k\,r)$.`],
      teach: t`In a closed universe $r = \sin(\sqrt k\,\chi)/\sqrt k$: the circumferential radius lags the distance measured within space, as on a globe.`,
      explain: t`$\chi = \arcsin(\sqrt k\,r)/\sqrt k$, so $r = \sin(\sqrt k\,\chi)/\sqrt k < \chi$ — the circles-on-a-globe effect of the FLRW dissection. For $k < 0$ the same steps give $\operatorname{arsinh}$, and $r > \chi$.`,
    }),
    mcq({
      id: 'momentum', difficulty: 2,
      prompt: t`For flat FLRW the metric does not depend on $x$, so the geodesic equation conserves $a^2\,dx/d\lambda$. A comoving observer measures the particle's momentum $p \propto a\,dx/d\lambda$. What follows?`,
      visual: decay('Momentum of a free particle, measured by the comoving observers it passes, against the scale factor: it falls as 1/a.'),
      choices: [
        t`$p \propto 1/a$ for every free particle: light redshifts by $1 + z = 1/a$, and a slow body's speed relative to the local galaxies dies away`,
        t`$p$ is constant, because the metric is the same everywhere`,
        t`$p \propto a$: the expansion speeds particles up`,
        t`Only light loses momentum; massive particles keep theirs`,
      ],
      answer: 0,
      why: {
        1: t`Homogeneity conserves the comoving momentum $a^2\,dx/d\lambda$, not the physical one: one factor of $a$ is left over.`,
        2: t`The conserved quantity is $a^2\,dx/d\lambda$, so $a\,dx/d\lambda$ falls as $1/a$, not rises.`,
        3: t`The same conservation law holds for any geodesic, timelike or null: massive particles lose momentum too.`,
      },
      hints: [t`If $a^2\,dx/d\lambda$ is constant, how does $a\,dx/d\lambda$ scale?`],
      teach: 'In an expanding universe every free particle’s momentum, measured by the comoving observers it passes, falls as 1/a.',
      explain: t`$p \propto a\,dx/d\lambda = (a^2\,dx/d\lambda)/a \propto 1/a$. For light that is the redshift, derived a second way; for slow bodies it is "Hubble drag": peculiar velocities decay, which is why galaxies end up nearly at rest in the comoving grid.`,
    }),
    num({
      id: 'eds-chi', difficulty: 2,
      gen(r) {
        const z = r.pick([1, 3, 8]);
        const x = eds.chi(z);
        return {
          prompt: t`In the Einstein–de Sitter model (flat, matter only, $a = (t/t_0)^{2/3}$, $t_0 = 2/(3H_0)$), light from redshift $z$ has travelled a comoving distance $\chi = \displaystyle\int_{t_e}^{t_0}\frac{c\,dt}{a} = \frac{2c}{H_0}\left[1 - (1 + z)^{-1/2}\right]$. With $H_0 = ${H0}$ km/s/Mpc ($c = 299\,792$ km/s), what is $\chi$ for $z = ${z}$, in Mpc?`,
          answer: x, units: 'Mpc', tol: { rel: 0.01 },
          errors: [{ value: x / (1 + z), feedback: t`That is the proper distance when the light left, $a\chi$. Today's comoving distance is $\chi$ itself.` }, { value: (C_KMS * z) / H0, feedback: t`That is $cz/H_0$, good only for $z \ll 1$.` }],
          hints: [t`$2c/H_0 = 2\times299\,792/${H0} = ${sci(TWO_C_H, 4)}$ Mpc.`, t`$(1 + ${z})^{-1/2} = ${sci(1 / Math.sqrt(1 + z), 4)}$.`],
          teach: t`Comoving distances come from integrating $c\,dt/a$ along the light ray; in Einstein–de Sitter the integral has a closed form.`,
          explain: t`$\chi = ${sci(TWO_C_H, 4)}\times${sci(1 - 1 / Math.sqrt(1 + z), 4)} = ${sci(x, 4)}$ Mpc. Our universe, with $\Lambda$, gives ${sci(comovingDistance(z, { Om: 0.315, OL: 0.685 }, H0, 4000), 3)} Mpc: its expansion was slower in the past, so light had longer to travel.`,
          visual: edsCurve('The Einstein–de Sitter scale factor, a ∝ t^(2/3), passing through today with the measured expansion rate. A teaching model: our universe also has Λ.'),
        };
      },
    }),
    num({
      id: 'eds-peak', difficulty: 3,
      prompt: t`In the Einstein–de Sitter model the proper distance of a source when its light left is $d_e = a\chi = \dfrac{2c}{H_0}\left[(1 + z)^{-1} - (1 + z)^{-3/2}\right]$. Find the largest value it can take, in billions of light-years, for $H_0 = ${H0}$ km/s/Mpc. (1 Mpc $= 3.262$ million light-years)`,
      answer: (eds.dA(1.25) * LY_PER_MPC) / 1e9, units: 'Gly', tol: { rel: 0.01 },
      errors: [{ value: (TWO_C_H * LY_PER_MPC) / 1e9, feedback: t`That is $2c/H_0$ itself. Maximise the bracket first: with $u = (1 + z)^{-1/2}$ it is $u^2(1 - u)$.` }, { value: (TWO_C_H * (4 / 9) * LY_PER_MPC) / 1e9, feedback: t`$4/9$ is $u^2$ at the peak; multiply by $1 - u = 1/3$ too.` }],
      hints: [t`Write $u = (1 + z)^{-1/2}$: the bracket is $u^2(1 - u)$. Set its derivative $2u - 3u^2$ to zero.`, t`$u = 2/3$ (so $z = 5/4$), and the bracket is $\tfrac49\cdot\tfrac13 = \tfrac{4}{27}$. Multiply by $2c/H_0 = ${sci(TWO_C_H, 4)}$ Mpc.`],
      teach: 'Light from the most distant sources left them when they were close: the proper distance at emission has a maximum, at z = 5/4 in Einstein–de Sitter.',
      explain: t`$d_{e,\max} = \tfrac{4}{27}\times${sci(TWO_C_H, 4)} = ${sci(eds.dA(1.25), 4)}$ Mpc $= ${sci((eds.dA(1.25) * LY_PER_MPC) / 1e9, 3)}$ Gly, at $z = 1.25$. Every source seen at higher redshift was closer when its light set out. With $\Lambda$ (Planck 2018) the peak moves to $z \approx ${LCDM_PEAK.z.toFixed(1)}$ and ${LCDM_PEAK.gly.toFixed(2)} billion light-years.`,
      visual: edsCurve('The Einstein–de Sitter scale factor against time (a teaching model with closed-form answers).'),
    }),
    mcq({
      id: 'hubble-sphere', difficulty: 3,
      prompt: t`The proper distance $d_\gamma$ of a photon heading toward us obeys $\dot d_\gamma = H d_\gamma - c$. A photon emitted toward us from beyond the Hubble sphere ($d_\gamma > c/H$) at first gets **farther** away. In the Einstein–de Sitter model, why does it reach us anyway?`,
      visual: conePic({ caption: 'Einstein–de Sitter: our past light cone (gold) and the Hubble sphere c/H = 3t/2 (violet, dashed). Distance in units of ct₀, time in units of the age t₀.' }),
      choices: [
        t`$H$ falls as the universe ages, so the Hubble sphere grows faster than the photon recedes; once the sphere overtakes it, $\dot d_\gamma < 0$ and the photon closes in`,
        'It never does: light emitted beyond the Hubble sphere can never reach us',
        t`The photon speeds up beyond $c$ to catch up`,
        'Gravity of the matter between pulls the photon in',
      ],
      answer: 0,
      why: {
        1: t`That would be true only if $c/H$ never grew. In Einstein–de Sitter $c/H = 3ct/2$ grows, and the gold curve crosses it.`,
        2: t`Locally light always moves at $c$; it is $H d_\gamma$, the expansion term, that changes.`,
        3: t`The equation $\dot d_\gamma = Hd_\gamma - c$ already contains all the gravity there is: the expansion history. No extra pull appears.`,
      },
      hints: [t`Where is $\dot d_\gamma = 0$? On the sphere $d_\gamma = c/H$.`, t`In Einstein–de Sitter $H = 2/(3t)$, so the Hubble sphere $c/H = 3ct/2$ grows with time.`],
      teach: 'Light emitted beyond the Hubble sphere can still reach us, because the Hubble sphere grows and overtakes it — the turnover of the light cone.',
      explain: t`$\dot d_\gamma = Hd_\gamma - c > 0$ beyond the sphere, so the photon at first loses ground. But $c/H = 3ct/2$ grows faster, and when the sphere passes the photon, $\dot d_\gamma$ turns negative: the peak of the gold curve, at $t = (8/27)t_0$ and $d = \tfrac49ct_0$. (Davis & Lineweaver 2004 untangle this and related confusions.)`,
    }),
    code({
      id: 'sympy-slice', difficulty: 3,
      prompt: t`Check that the FLRW slices have constant curvature. The program sets up the spatial metric $\gamma = \operatorname{diag}\!\left(\frac{1}{1 - kr^2},\ r^2,\ r^2\sin^2\theta\right)$ and its Christoffel symbols. Complete \`ricci(m, n)\` so it returns
$$R_{mn} = \sum_{l}\left(\partial_l\Gamma^l{}_{mn} - \partial_n\Gamma^l{}_{lm}\right) + \sum_{l,s}\left(\Gamma^l{}_{ls}\Gamma^s{}_{mn} - \Gamma^l{}_{ns}\Gamma^s{}_{lm}\right),$$
with \`christoffel(l, m, n)\` $= \Gamma^l{}_{mn}$ and \`Y[l]\` the coordinate $y^l$.`,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`the Ricci scalar is $6k$, everywhere`, code: 'sp.simplify(R3 - 6*k) == 0' },
        { name: t`$R_{rr} = 2k\,\gamma_{rr}$`, code: 'sp.simplify(ricci(0, 0) - 2*k*gam[0, 0]) == 0' },
        { name: t`$R_{\theta\theta} = 2k\,\gamma_{\theta\theta}$`, code: 'sp.simplify(ricci(1, 1) - 2*k*gam[1, 1]) == 0' },
      ],
      hints: [t`Loop \`for l in range(3)\`: add \`sp.diff(christoffel(l, m, n), Y[l]) - sp.diff(christoffel(l, l, m), Y[n])\`.`, t`Inside it, loop \`for s in range(3)\` and add \`christoffel(l, l, s)*christoffel(s, m, n) - christoffel(l, n, s)*christoffel(s, l, m)\`.`],
      teach: t`Homogeneous, isotropic slices have $R_{ij} = 2k\gamma_{ij}$: curvature that is the same at every point and in every direction.`,
      explain: t`SymPy returns $${R3} = 6k$, independent of $r$ and $\theta$, and $R_{ij} = 2k\gamma_{ij}$: the slices are spaces of constant curvature, as homogeneity and isotropy demand. With $a(t)^2$ in front, the curvature at time $t$ is $6k/a^2$ — the "$-kc^2/a^2$" that will appear in the Friedmann equation.`,
      visual: closedPic,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-probe', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([300, 1000, 3000]), f = r.pick([1.5, 2, 3]);
        return {
          prompt: t`A probe is launched into intergalactic space at ${v} km/s relative to the galaxies around it, then coasts. Speeds this small are non-relativistic, so its speed relative to the local Hubble flow falls as $1/a$. How fast is it moving relative to the galaxies around it once the universe has grown ${f}-fold?`,
          answer: v / f, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: v * f, feedback: t`Momentum falls as the universe grows: divide by the growth factor, $1/a$.` }, { value: v / (f * f), feedback: t`Only one power of $a$: $p \propto 1/a$, and $v \propto p$ for slow bodies.` }],
          hints: [t`$v \propto 1/a$: divide by ${f}.`],
          teach: '“Hubble drag”: in an expanding universe a coasting body slows down relative to the local galaxies, as 1/a.',
          explain: t`$${v}/${f} = ${sci(v / f, 3)}$ km/s. No force acts: the probe keeps passing galaxies that are themselves receding along with it, each slightly faster than the last. The same law redshifts light.`,
          visual: probePic,
        };
      },
    }),
    mcq({
      id: 'cp-which-metric', difficulty: 2,
      prompt: t`Which line element describes a spatially flat FLRW universe in cosmic time $t$ and comoving coordinates $x, y, z$?`,
      choices: [
        t`$ds^2 = -c^2dt^2 + a(t)^2\left(dx^2 + dy^2 + dz^2\right)$`,
        t`$ds^2 = a(t)^2\left(-c^2dt^2 + dx^2 + dy^2 + dz^2\right)$`,
        t`$ds^2 = -a(t)^2c^2dt^2 + dx^2 + dy^2 + dz^2$`,
        t`$ds^2 = -c^2dt^2 + a(t)\left(dx^2 + dy^2 + dz^2\right)$`,
      ],
      answer: 0,
      why: {
        1: t`That is the same spacetime in **conformal** time $\eta$, with $d\eta = dt/a$ — not in cosmic time: in it, comoving clocks would tick at the rate $a\,dt$.`,
        2: t`Then rulers would not stretch at all and only clocks would change: no Hubble law, and comoving clocks would not keep cosmic time.`,
        3: t`Distances scale as $a$, so the line element, quadratic in distance, carries $a^2$.`,
      },
      hints: [t`Comoving clocks must read $t$: put $dx = dy = dz = 0$. And distances between comoving galaxies must be $a(t)$ times the comoving ones.`],
      teach: t`In cosmic time the FLRW line element is $-c^2dt^2 + a^2(\ldots)$; other forms use other time coordinates.`,
      explain: t`With $dx^i = 0$ it gives $d\tau = dt$ — cosmic time — and at fixed $t$ distances are $a(t)$ times comoving ones. The second form is correct physics in conformal time, where light rays travel at 45° in $(\eta, x)$: a useful relabelling, not a different universe.`,
    }),
    num({
      id: 'cp-angular', difficulty: 3,
      gen(r) {
        const z = r.pick([0.5, 1.25, 4]);
        const D = 0.03;                                               // Mpc (30 kpc)
        const th = (D / eds.dA(z)) * ARCSEC;
        return {
          prompt: t`A telescope images a galaxy 30 kpc across. In a flat universe its angular size is $\theta = D/d_A$, where $d_A = a\chi$ is its proper distance when the light left — in the Einstein–de Sitter model, $d_A = \dfrac{2c}{H_0}\left[(1 + z)^{-1} - (1 + z)^{-3/2}\right]$. With $H_0 = ${H0}$ km/s/Mpc, what angle does it span at $z = ${z}$, in arcseconds?`,
          answer: th, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: (D / eds.chi(z)) * ARCSEC, feedback: t`Divide by $a\chi$, not $\chi$: the light rays from the galaxy's two edges spread out from the galaxy, which was a factor $1 + z$ closer then.` }],
          hints: [t`$d_A = ${sci(TWO_C_H, 4)}\ \text{Mpc}\times\left[(1 + ${z})^{-1} - (1 + ${z})^{-3/2}\right]$.`, t`$\theta = 0.03\ \text{Mpc}/d_A$ in radians; multiply by 206 265.`],
          teach: 'Because the distance at emission peaks, galaxies of a fixed size look smallest at a middling redshift — 1.25 in Einstein–de Sitter — and larger again beyond it.',
          explain: t`$d_A = ${sci(eds.dA(z), 4)}$ Mpc, so $\theta = ${sci(th, 3)}''$. At $z = 1.25$ the angle is at its smallest; more distant galaxies look bigger, because their light left when they were closer. (Planck 2018's universe moves the minimum to $z \approx ${LCDM_PEAK.z.toFixed(1)}$.)`,
          visual: conePic({ caption: 'Einstein–de Sitter: the distance of each source when its light left is where the gold curve meets its grey worldline — the distance that sets its angular size.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 8 (cosmology)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Davis & Lineweaver, “Expanding confusion: common misconceptions of cosmological horizons and the superluminal expansion of the universe” (2004)', url: 'https://arxiv.org/abs/astro-ph/0310808' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
  ],
});
