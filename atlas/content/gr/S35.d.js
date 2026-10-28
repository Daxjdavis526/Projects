// Morris–Thorne throats and the null energy condition — Derivation Mode.
// ds² = −e^{2Φ}c²dt² + dr²/(1 − b/r) + r²dΩ². Static orthonormal frame (G = c = 1):
// ρ = b′/(8πr²), p_r = [−b/r³ + 2(1 − b/r)Φ′/r]/(8π), p_t (Φ = 0) = (b − b′r)/(16πr³);
// ρ + p_r = [(b′r − b)/r³ + 2(1 − b/r)Φ′/r]/(8π) → (b′(r₀) − 1)/(8πr₀²) at the
// throat for any finite Φ. Embedding: dz/dr = (r/b − 1)^(−½), d²r/dz² = (b − b′r)/(2b²),
// flare-out b′(r₀) < 1. Ellis b = r₀²/r: ρ = p_r = −r₀²/(8πr⁴), p_t = +r₀²/(8πr⁴),
// ℓ² = r² − r₀², r = r₀ cosh(z/r₀), ∫ρ 4πr² dℓ (one side) = −πr₀/4, Misner–Sharp
// m = b/2. Power law b = r₀(r₀/r)ⁿ: ρ = −n r₀ⁿ⁺¹/(8π rⁿ⁺³), ρ + p_r = −(n + 1)…
// All checked in SymPy (scratch v35.py); numbers computed below.
import { lesson, mcq, multi, num, expr, code } from '../../src/core/content.js';
import { C, G, sci, round } from './_derivlate.js';

const t = String.raw;

// ── numbers ─────────────────────────────────────────────────────────────────

const tension = (r0) => C ** 4 / (8 * Math.PI * G * r0 * r0);    // Pa, radial tension at any static throat

// ── pictures ────────────────────────────────────────────────────────────────

// the power-law family b = r₀(r₀/r)ⁿ, Φ = 0, in units of c⁴/(8πG r₀²)
const powerPic = ({ n = 1, sliders = false, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [1, 4], y: [-3.2, 1.6], xlabel: 'areal radius r / r₀', ylabel: 'units of c⁴/(8πG r₀²)', axesAt: 'edge',
    ...(sliders ? {
      sliders: [{ key: 'n', label: 'Shape exponent $n$ in $b = r_0(r_0/r)^n$', min: -0.95, max: 2, step: 0.01, value: n, explain: 'Each value is a different throat. $n = 1$ is the Ellis throat; the throat flares out as long as $b\'(r_0) = -n < 1$, that is $n > -1$.' }],
      readouts: [
        { label: t`$b'(r_0)$`, expr: '-n', digits: 3 },
        { label: t`$\rho c^2$ at the throat`, expr: '-n', digits: 3 },
        { label: t`$\rho c^2 + p_r$ at the throat`, expr: '-(n + 1)', digits: 3 },
      ],
    } : { constants: { n } }),
    curves: [
      { fn: '-n*x^(-n - 3)', color: 'gold', width: 2.4 },
      { fn: '-x^(-n - 3)', color: 'accent', width: 2.2, dash: true },
      { fn: '-(n + 1)*x^(-n - 3)', color: 'violet', width: 2.8 },
    ],
    hlines: [{ y: 0, color: 'ink3' }],
    points: [
      { x: 3.95, y: 1.3, r: 0.01, color: 'gold', label: 'energy density ρc²', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 3.95, y: 1.0, r: 0.01, color: 'accent', label: 'dashed: radial pressure pᵣ', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 3.95, y: 0.7, r: 0.01, color: 'violet', label: 'null combination ρc² + pᵣ', labelAlign: 'right', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: caption ?? t`What a static observer at areal radius $r$ measures for the throats $b = r_0(r_0/r)^n$ with $\Phi = 0$: energy density, radial pressure (negative: a tension) and their sum, the null combination. Mathematics, not a design anyone can build.`,
});

// embedding diagram of the Ellis throat with a radial geodesic (gr-surface's catenoid is exactly r = cosh z)
const embedPic = (caption) => ({
  type: 'gr-surface',
  params: { mode: 'geodesic', surface: 'catenoid', v: -1.1, heading: 90, length: 2.6, controls: false, readout: false },
  caption,
});

// a plain catenoid, r = r₀ cosh(z/r₀), r₀ = 1
const catenoidPic = {
  type: 'surface3d',
  params: {
    surface: ['cosh(u)*cos(v)', 'cosh(u)*sin(v)', 'u'], domain: [[-1.5, 1.5], [0, 6.2832]], n: 36,
    axes: false, alpha: 0.55, pitch: 0.3, dist: 9,
    curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [0, 6.2832], color: 'gold', width: 3 }],
  },
  caption: t`Embedding diagram of a wormhole throat: one slice of space through the throat ($t$ fixed, equatorial plane), drawn as a surface in an imaginary flat 3D space so that lengths along the surface are true lengths. The extra dimension is a drawing aid, not a real direction. Gold: the throat, $r = r_0$.`,
};

// energy per unit proper length on one side of the Ellis throat (G = c = 1, r₀ = 1)
const energyPic = {
  type: 'graph',
  params: {
    x: [0, 6], y: [-0.6, 0.1], xlabel: 'proper distance from the throat ℓ / r₀', ylabel: '4πr²ρ  (G = c = 1, r₀ = 1)', axesAt: 'edge',
    shade: [{ fn: '0', lower: '-1/(2*(x^2 + 1))', from: 0, to: 6, color: 'bad', alpha: 0.25 }],
    curves: [{ fn: '-1/(2*(x^2 + 1))', color: 'bad', width: 2.6 }],
    hlines: [{ y: 0, color: 'ink3' }],
    points: [{ x: 1.4, y: -0.42, r: 0.01, color: 'bad', label: 'shaded area: the total on this side', labelAlign: 'left', labelDx: 0, labelDy: 0 }],
  },
  caption: t`Energy per unit proper length on one side of the Ellis throat, $4\pi r^2\rho$ with $r^2 = \ell^2 + r_0^2$, in units with $G = c = 1$ and $r_0 = 1$. The shaded area, out to infinity, is the total; the picture stops at $\ell = 6r_0$.`,
};

// cross-section of a bundle of radial light rays passing through a throat
const bundlePic = {
  type: 'graph',
  params: {
    x: [-2, 2], y: [0, 5.2], xlabel: 'affine parameter along the rays (throat at 0)', ylabel: 'bundle area ÷ area at the throat', axesAt: 'edge',
    curves: [{ fn: '1 + x^2', color: 'accent', width: 2.6 }],
    vlines: [{ x: 0, color: 'ink3', label: 'throat' }],
    points: [
      { x: -1.85, y: 4.75, r: 0.01, color: 'accent', label: 'converging: θ < 0', labelAlign: 'left', labelDx: 0, labelDy: 0 },
      { x: 1.85, y: 4.75, r: 0.01, color: 'accent', label: 'diverging: θ > 0', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 0, y: 1, color: 'gold', r: 5, label: 'θ = 0 and increasing', labelDx: 10, labelDy: 16 },
    ],
  },
  caption: t`A bundle of light rays falling radially into a wormhole shrinks to the throat and then grows on the far side: its expansion $\theta$ (the fractional rate of change of its area) goes from negative to positive. Schematic shape.`,
};

// the null combination near an Ellis-shaped throat for three redshift functions Φ = −α r₀/r
const phiPic = {
  type: 'graph',
  params: {
    x: [1, 3], y: [-2.4, 0.8], xlabel: 'areal radius r / r₀', ylabel: 'ρc² + pᵣ  (units of c⁴/(8πG r₀²))', axesAt: 'edge',
    curves: [
      { fn: '-2/x^4', color: 'accent', width: 2.4 },
      { fn: '-2/x^4 + 2*1*(x^2 - 1)/x^5', color: 'gold', width: 2.2 },
      { fn: '-2/x^4 + 2*3*(x^2 - 1)/x^5', color: 'violet', width: 2.2 },
    ],
    hlines: [{ y: 0, color: 'ink3' }],
    points: [
      { x: 1, y: -2, color: 'bad', r: 5, label: 'every curve: −2 at the throat', labelDx: 10, labelDy: 14 },
      { x: 2.95, y: -1.0, r: 0.01, color: 'accent', label: 'Φ = 0', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 2.95, y: -1.25, r: 0.01, color: 'gold', label: 'Φ = −r₀/r', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      { x: 2.95, y: -1.5, r: 0.01, color: 'violet', label: 'Φ = −3r₀/r', labelAlign: 'right', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: t`The null combination for the shape $b = r_0^2/r$ with three redshift functions $\Phi = -\alpha r_0/r$ ($\alpha = 0, 1, 3$). Away from the throat $\Phi$ changes it — even making it positive — but at the throat every curve reaches the same negative value.`,
};

// areal radius against proper distance through an Ellis throat
const probePic = (r0, r1) => ({
  type: 'graph',
  params: {
    x: [round(-1.15 * Math.sqrt(r1 * r1 - r0 * r0), 3), round(1.15 * Math.sqrt(r1 * r1 - r0 * r0), 3)], y: [0, round(1.25 * r1, 3)],
    xlabel: 'proper distance ℓ from the throat (km)', ylabel: 'areal radius r (km)', axesAt: 'edge',
    curves: [{ fn: `sqrt(x^2 + ${r0 * r0})`, color: 'accent', width: 2.6 }],
    points: [
      { x: round(-Math.sqrt(r1 * r1 - r0 * r0), 4), y: r1, color: 'gold', r: 5, label: 'start', labelDx: 10, labelDy: 4 },
      { x: round(Math.sqrt(r1 * r1 - r0 * r0), 4), y: r1, color: 'gold', r: 5, label: 'finish', labelDx: -10, labelDy: 4, labelAlign: 'right' },
      { x: 0, y: r0, color: 'bad', r: 5, label: 'throat', labelDx: 0, labelDy: 18, labelAlign: 'center' },
    ],
  },
  caption: t`The size of spheres, $r$, against true distance travelled, $\ell$, through an Ellis throat of radius $${r0}$ km: $r^2 = \ell^2 + r_0^2$. A hypothetical object, not a known one.`,
});

// ── coding exercise ─────────────────────────────────────────────────────────

const CODE_START = `import sympy as sp

t, r, th, ph, r0 = sp.symbols('t r theta phi r0', positive=True)
X = [t, r, th, ph]
b = sp.Function('b')(r)                                     # the shape function
g = sp.diag(-1, 1/(1 - b/r), r**2, r**2*sp.sin(th)**2)      # Morris-Thorne, Phi = 0, G = c = 1
gi = g.inv()

def Gam(l, m, n):
    return sum(gi[l, s]*(sp.diff(g[s, m], X[n]) + sp.diff(g[s, n], X[m])
                         - sp.diff(g[m, n], X[s])) for s in range(4))/2

G3 = [[[sp.simplify(Gam(l, m, n)) for n in range(4)] for m in range(4)] for l in range(4)]

def ricci(m, n):
    return sp.simplify(sum(sp.diff(G3[l][m][n], X[l]) - sp.diff(G3[l][l][m], X[n])
                           + sum(G3[l][l][s]*G3[s][m][n] - G3[l][n][s]*G3[s][l][m] for s in range(4))
                           for l in range(4)))

R = sp.Matrix(4, 4, lambda m, n: ricci(m, n))
Rs = sp.simplify(sum(gi[m, m]*R[m, m] for m in range(4)))
Gein = (R - g*Rs/2).applyfunc(sp.simplify)                 # Einstein tensor, coordinate components

def source():
    # return (rho, p_r) measured by static observers, from G = 8 pi T in their orthonormal frame:
    # the frame components are G_tt/(-g_tt) and G_rr/g_rr
    rho = 0                                                  # replace
    p_r = 0                                                  # replace
    return rho, p_r

rho, p_r = source()
print('rho =', sp.simplify(rho), '   p_r =', sp.simplify(p_r))
`;
const CODE_ANSWER = CODE_START
  .replace('    rho = 0                                                  # replace', '    rho = Gein[0, 0]/(-g[0, 0])/(8*sp.pi)')
  .replace('    p_r = 0                                                  # replace', '    p_r = Gein[1, 1]/g[1, 1]/(8*sp.pi)');

export default lesson({
  id: 'gr.S35.d',
  title: 'Morris–Thorne throats and the null energy condition',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['math', 'spec'],
  intro: t`In 1988 Morris and Thorne ran Einstein's equations backwards on purpose. Design a wormhole a person could cross — a throat that stays open, no horizon, gentle tides — and then compute the matter it needs. The design lives in two functions: the **redshift function** $\Phi(r)$, which sets how clocks run, and the **shape function** $b(r)$, which sets the geometry of space. The throat sits at $r_0$, where $b(r_0) = r_0$.

The verdict, derived here, is the second half of the main equation: at the throat $\rho c^2 + p_r < 0$. Every static, traversable wormhole breaks the null energy condition, whatever $\Phi$ you choose. The matter there must carry a tension of $c^4/(8\pi Gr_0^2)$ — about $5\times10^{42}$ Pa for a throat one metre across. Quantum fields break the null condition only by tiny amounts, briefly, and no source for a large throat is known. Traversable wormholes are **mathematics with unmet requirements**, not a technology.`,
  equation: t`ds^2 = -e^{2\Phi(r)}c^2dt^2 + \frac{dr^2}{1 - b(r)/r} + r^2\,d\Omega^2, \qquad \left(\rho c^2 + p_r\right)\Big|_{r_0} = \frac{c^4}{8\pi G}\,\frac{b'(r_0) - 1}{r_0^2} < 0`,
  symbols: [
    { tex: '\\Phi(r)', text: t`the **redshift function**: clocks at rest at $r$ tick at $e^{\Phi}$ times the rate of clocks far away (if $\Phi \to 0$ there). It must stay finite — no horizon` },
    { tex: 'b(r)', text: t`the **shape function**, a length: it sets how much radial distance there is between spheres` },
    { tex: 'r', text: t`the areal radius: a sphere at $r$ has area $4\pi r^2$. It is not distance from a centre — there is no centre` },
    { tex: 'r_0', text: t`the throat: the smallest sphere, where $b(r_0) = r_0$` },
    { tex: "b'(r_0)", text: t`the slope $db/dr$ at the throat; **flare-out** demands $b'(r_0) < 1$` },
    { tex: 'd\\Omega^2', text: t`$d\theta^2 + \sin^2\theta\,d\phi^2$, the angles on a sphere` },
    { tex: '\\rho c^2,\\ p_r', text: 'the energy density and the radial pressure measured by observers at rest; a negative pressure is a tension' },
    { tex: 'G,\\ c', text: "Newton's constant and the speed of light" },
  ],
  why: 'Wormholes are the most quoted "solution of Einstein\'s equations". Deriving exactly what the throat demands — and why no choice of shape or redshift avoids it — is what separates the mathematics from the science fiction.',
  visual: {
    ...powerPic({ sliders: true }),
    title: 'What a family of throats demands',
    lead: t`A family of throats, $b = r_0(r_0/r)^n$ with $\Phi = 0$, and what static observers would measure around each. Every member with $n > -1$ flares out. Watch the violet curve, the null combination $\rho c^2 + p_r$.`,
    tasks: [
      t`$n = 1$ is the Ellis throat: the energy density and the radial pressure are equal and negative everywhere.`,
      t`Slide $n$ below 0: the energy density (gold) turns **positive** everywhere — yet the violet curve stays negative. The radial tension outweighs the energy density, so the null condition still fails.`,
      t`Push $n$ towards $-1$: $b'(r_0) \to 1$, the throat stops flaring, and the violation at the throat shrinks to zero — but so does the wormhole. Flare-out and null-condition violation are the same condition.`,
    ],
  },
  example: {
    prompt: t`For the Morris–Thorne metric, find the flare-out condition, read off the matter that static observers measure, and prove that $\rho c^2 + p_r < 0$ at the throat for every finite $\Phi$. Then evaluate it all for the Ellis throat, $b = r_0^2/r$ and $\Phi = 0$.`,
    visual: embedPic(t`Embedding diagram of the Ellis throat — a catenoid, $r = r_0\cosh(z/r_0)$ — coloured by its curvature (blue: negative). One slice of space drawn in an imaginary flat 3D space; the gold line is a radial path straight through the throat.`),
    steps: [
      { label: 'The geometry', text: t`Spheres at $r$ have area $4\pi r^2$; the smallest, at $r_0$ where $b(r_0) = r_0$, is the throat. There $g_{rr} = 1/(1 - b/r)$ blows up, but only the coordinate is bad: the proper radial distance $\ell = \int dr/\sqrt{1 - b/r}$ is finite, and runs from $-\infty$ on one side to $+\infty$ on the other. With $\Phi$ finite, $g_{tt}$ never vanishes — no horizon.` },
      { label: 'Flare-out', text: t`Embed the equatorial slice as a surface $z(r)$ in flat 3D space: $dz/dr = \pm\left(r/b - 1\right)^{-1/2}$, vertical at the throat. For the throat to be a minimum of $r(z)$, $$\frac{d^2r}{dz^2} = \frac{b - b'r}{2b^2} > 0 \text{ at } r_0, \quad\text{that is}\quad b'(r_0) < 1.$$` },
      { label: 'The source', text: t`Compute $G_{\mu\nu}$ and read $T_{\mu\nu} = \frac{c^4}{8\pi G}G_{\mu\nu}$ in the orthonormal frame of observers at rest: $$\rho c^2 = \frac{c^4}{8\pi G}\frac{b'}{r^2}, \qquad p_r = \frac{c^4}{8\pi G}\left[-\frac{b}{r^3} + 2\left(1 - \frac{b}{r}\right)\frac{\Phi'}{r}\right],$$ and, for $\Phi = 0$, $p_t = \frac{c^4}{8\pi G}\frac{b - b'r}{2r^3}$.` },
      { label: 'The null condition', text: t`For a radial light ray, $T_{\mu\nu}k^\mu k^\nu \propto \rho c^2 + p_r = \frac{c^4}{8\pi G}\left[\frac{b'r - b}{r^3} + 2\left(1 - \frac{b}{r}\right)\frac{\Phi'}{r}\right]$. At the throat $b = r_0$ kills the $\Phi'$ term, leaving $\frac{c^4}{8\pi G}\frac{b'(r_0) - 1}{r_0^2}$ — negative, by flare-out. **Every static traversable throat breaks the null energy condition.**` },
      { label: 'The Ellis throat', text: t`$b = r_0^2/r$, $\Phi = 0$: $b'(r_0) = -1$, so it flares, and $\rho c^2 = p_r = -\frac{c^4}{8\pi G}\frac{r_0^2}{r^4}$, $p_t = +\frac{c^4}{8\pi G}\frac{r_0^2}{r^4}$ — negative energy density everywhere. The proper distance obeys $\ell^2 = r^2 - r_0^2$, and the embedding is the catenoid $r = r_0\cosh(z/r_0)$.` },
      { label: 'Sense check', text: t`Observers at the throat measure a radial tension $-p_r = c^4/(8\pi Gr_0^2)$, the same for every static throat: $${sci(tension(1), 2)}$ Pa for $r_0 = 1$ m — roughly $10^{8}$ times the pressure at the centre of a neutron star, $10^{34}$ to $10^{35}$ Pa. SymPy reproduces every expression above from the metric.` },
    ],
    answer: t`Flare-out is $b'(r_0) < 1$; then $\left(\rho c^2 + p_r\right)\big|_{r_0} = \frac{c^4}{8\pi G}\frac{b'(r_0) - 1}{r_0^2} < 0$ for any finite $\Phi$. For Ellis, $\rho c^2 = p_r = -\frac{c^4}{8\pi G}\frac{r_0^2}{r^4}$ and $p_t = -p_r$.`,
  },
  practice: [
    expr({
      id: 'embedding', difficulty: 2,
      prompt: t`For the Ellis throat, $b = r_0^2/r$, the embedding surface obeys $\dfrac{dz}{dr} = \left(\dfrac{r}{b} - 1\right)^{-1/2} = \left(\dfrac{r^2}{r_0^2} - 1\right)^{-1/2}$. Integrate with $z = 0$ at the throat and give the shape as $r(z)$.`,
      visual: catenoidPic,
      answer: 'r0*cosh(z/r0)', answerTeX: t`r_0\cosh\frac{z}{r_0}`, lhs: 'r(z)',
      vars: { r0: [0.5, 2], z: [-1.5, 1.5] },
      errors: [
        { answer: 'sqrt(r0^2 + z^2)', feedback: t`That is $r$ against proper distance $\ell$, measured along the surface. $z$ is the height in the imaginary embedding space, a different thing.` },
        { answer: 'r0*cosh(z)', feedback: t`Check the units: the argument of cosh must be a pure number, $z/r_0$.` },
        { answer: 'r0*cos(z/r0)', feedback: t`$\int dr/\sqrt{r^2/r_0^2 - 1} = r_0\cosh^{-1}(r/r_0)$ — hyperbolic, so the throat widens without limit.` },
      ],
      hints: [t`$\int\dfrac{dr}{\sqrt{r^2/r_0^2 - 1}} = r_0\cosh^{-1}\dfrac{r}{r_0}$.`],
      teach: t`The Ellis throat embeds as a catenoid, $r = r_0\cosh(z/r_0)$ — the shape a soap film takes between two rings.`,
      explain: t`$z = r_0\cosh^{-1}(r/r_0)$, so $r = r_0\cosh(z/r_0)$: a catenoid, with negative Gaussian curvature everywhere. The embedding is only a drawing aid; the physics is the metric, and the metric says the matter must have negative energy density.`,
    }),
    expr({
      id: 'ellis-energy', difficulty: 2,
      prompt: t`Using $\rho c^2 = \dfrac{c^4}{8\pi G}\dfrac{b'}{r^2}$, find the energy density that static observers measure around the Ellis throat, $b = r_0^2/r$.`,
      visual: powerPic({ n: 1, caption: t`The Ellis throat ($n = 1$): energy density, radial pressure and their sum, in units of $c^4/(8\pi Gr_0^2)$. Every curve is negative; the first two coincide.` }),
      answer: '-c^4*r0^2/(8*pi*G*r^4)', answerTeX: t`-\frac{c^4r_0^2}{8\pi Gr^4}`, lhs: t`\rho c^2`,
      vars: { c: [0.5, 2], r0: [0.5, 1.5], G: [0.5, 2], r: [1.5, 3] },
      errors: [
        { answer: 'c^4*r0^2/(8*pi*G*r^4)', feedback: t`Differentiate carefully: $b' = d(r_0^2/r)/dr = -r_0^2/r^2$, negative.` },
        { answer: '-c^4*r0^2/(8*pi*G*r^3)', feedback: t`$b'/r^2 = -r_0^2/r^4$: the powers of $r$ add.` },
        { answer: '-c^4/(8*pi*G*r^2)', feedback: t`$b' = -r_0^2/r^2$, which equals $-1$ only at the throat.` },
      ],
      hints: [t`$b' = -r_0^2/r^2$.`],
      teach: t`Around the Ellis throat the energy density is negative everywhere, $\rho c^2 = -\frac{c^4}{8\pi G}\frac{r_0^2}{r^4}$ — exotic matter in the strict sense.`,
      explain: t`$\rho c^2 = \frac{c^4}{8\pi G}\cdot\frac{-r_0^2/r^2}{r^2} = -\frac{c^4r_0^2}{8\pi Gr^4}$, falling off as $1/r^4$. The radial pressure happens to be equal to it, and the tangential pressure is its opposite.`,
    }),
    expr({
      id: 'one-side-energy', difficulty: 3,
      prompt: t`How much energy does the Ellis throat need? In units with $G = c = 1$, $\rho = -r_0^2/(8\pi r^4)$, the proper radial distance $\ell$ obeys $r^2 = \ell^2 + r_0^2$, and the proper volume of a shell is $4\pi r^2\,d\ell$. Find $\int_0^\infty \rho\,4\pi r^2\,d\ell$, the total on one side.`,
      visual: energyPic,
      answer: '-pi*r0/4', answerTeX: t`-\frac{\pi r_0}{4}`, lhs: t`\int_0^\infty\rho\,4\pi r^2\,d\ell`,
      vars: { r0: [0.5, 3] },
      errors: [
        { answer: '-pi*r0/2', feedback: t`That counts both sides of the throat. One side runs from $\ell = 0$ to $\infty$.` },
        { answer: 'pi*r0/4', feedback: t`$\rho$ is negative everywhere, so the total is too.` },
        { answer: '-r0/2', feedback: t`$r_0/2$ is the mass function $b/2$ at the throat. Do the integral: $\int_0^\infty \frac{d\ell}{\ell^2 + r_0^2} = \frac{\pi}{2r_0}$.` },
      ],
      hints: [t`$\rho\,4\pi r^2 = -\dfrac{r_0^2}{2r^2} = -\dfrac{r_0^2}{2(\ell^2 + r_0^2)}$.`, t`$\displaystyle\int_0^\infty\frac{d\ell}{\ell^2 + r_0^2} = \frac{\pi}{2r_0}$.`],
      teach: t`The Ellis throat needs $-\tfrac{\pi}{4}r_0c^2/G$ of energy on each side: half a Jupiter mass of negative mass-energy for a one-metre throat.`,
      explain: t`$-\dfrac{r_0^2}{2}\cdot\dfrac{\pi}{2r_0} = -\dfrac{\pi r_0}{4}$, or in SI units $-\tfrac{\pi}{4}r_0c^2/G$: $${sci((Math.PI / 4) * C * C / G, 3)}$ kg of negative mass-energy for every metre of throat radius — for $r_0 = 1$ m, about $0.56$ Jupiter masses. Yet a distant observer measures zero total mass: the mass function $m = b/2 = r_0^2/(2r)$ is $r_0/2$ at the throat and falls to zero far away.`,
    }),
    mcq({
      id: 'focusing-throat', difficulty: 3,
      prompt: t`A bundle of light rays falls radially into a wormhole and comes out the other side: its expansion $\theta$ goes from negative to positive, passing $\theta = 0$ at the throat with $d\theta/d\lambda > 0$. With no twist, the Raychaudhuri equation reads $\dfrac{d\theta}{d\lambda} = -\tfrac12\theta^2 - \sigma^2 - R_{\mu\nu}k^\mu k^\nu$, where $\sigma^2 \ge 0$ is the shear. What follows at the throat?`,
      visual: bundlePic,
      choices: [
        t`$R_{\mu\nu}k^\mu k^\nu < 0$ there, so by Einstein's equations $T_{\mu\nu}k^\mu k^\nu < 0$: the null energy condition fails`,
        t`Nothing: the Raychaudhuri equation does not apply inside a wormhole`,
        t`The shear $\sigma$ must be large, which can turn the bundle around by itself`,
        t`The rays must be accelerated by a force at the throat`,
      ],
      answer: 0,
      why: {
        1: t`It applies to any bundle of geodesics in any spacetime: it is an identity from the geometry, before any field equation.`,
        2: t`Shear enters as $-\sigma^2$: it only ever makes $\theta$ fall faster. It cannot turn the bundle around.`,
        3: t`Light rays here are free-falling geodesics; no force acts. The turnaround must come from curvature.`,
      },
      hints: [t`At the throat $\theta = 0$, so $\dfrac{d\theta}{d\lambda} = -\sigma^2 - R_{\mu\nu}k^\mu k^\nu$, and this must be positive.`, t`$-\sigma^2 \le 0$, so the positivity has to come from $-R_{\mu\nu}k^\mu k^\nu$; then use $R_{\mu\nu}k^\mu k^\nu = \frac{8\pi G}{c^4}T_{\mu\nu}k^\mu k^\nu$.`],
      teach: t`Gravity sourced by ordinary matter always focuses light. Defocusing at a throat needs $T_{\mu\nu}k^\mu k^\nu < 0$ — the same result as the metric calculation, from a different direction.`,
      explain: t`With $\theta = 0$, $0 < d\theta/d\lambda = -\sigma^2 - R_{\mu\nu}k^\mu k^\nu \le -R_{\mu\nu}k^\mu k^\nu$, so $R_{\mu\nu}k^\mu k^\nu < 0$ and, through $R_{\mu\nu}k^\mu k^\nu = \frac{8\pi G}{c^4}T_{\mu\nu}k^\mu k^\nu$, the null condition fails. The argument does not need the wormhole to be static or spherical — which is why Hochberg and Visser (1997, 1998) could extend the theorem to throats of any shape, static or not.`,
    }),
    mcq({
      id: 'positive-density', difficulty: 3,
      prompt: t`The throat $b = r_0(r_0/r)^n$ with $n = -\tfrac12$ and $\Phi = 0$ flares out ($b'(r_0) = \tfrac12$), and static observers measure **positive** energy density everywhere around it, $\rho c^2 = \frac{c^4}{16\pi G}\,r_0^{1/2}r^{-5/2}$. Does it satisfy the weak energy condition?`,
      visual: powerPic({ n: -0.5, caption: t`The throat with $n = -\tfrac12$: positive energy density (gold), but a radial tension (blue, dashed) larger than it, so the null combination (violet) is negative.` }),
      choices: [
        t`No: $\rho c^2 + p_r = -\tfrac12\cdot\frac{c^4}{8\pi G}r_0^{1/2}r^{-5/2} < 0$, so the null condition fails — and the weak condition includes it. Fast observers moving radially measure negative energy density`,
        t`Yes: the weak condition only asks for $\rho \ge 0$`,
        t`Yes, because the throat flares out`,
        t`It cannot be decided without $\Phi$`,
      ],
      answer: 0,
      why: {
        1: t`The weak condition asks $T_{\mu\nu}t^\mu t^\nu \ge 0$ for **every** observer, which for a stress tensor of this type needs $\rho c^2 + p_i \ge 0$ as well as $\rho \ge 0$ (step 33).`,
        2: t`Flaring out is exactly what forces the violation: $\rho c^2 + p_r = \frac{c^4}{8\pi G}(b' - 1)/r_0^2$ at the throat.`,
        3: t`$\Phi = 0$ is given. And at the throat, no finite $\Phi$ changes $\rho c^2 + p_r$.`,
      },
      hints: [t`Compute $p_r = -\frac{c^4}{8\pi G}\,b/r^3$ and add it to $\rho c^2$.`, t`Recall the weak condition's fast-observer limit from step 33.`],
      teach: 'Positive energy density does not rescue a wormhole: the tension still beats it, and the null condition — part of the weak one — fails.',
      explain: t`$p_r = -\frac{c^4}{8\pi G}\frac{b}{r^3} = -\frac{c^4}{8\pi G}r_0^{1/2}r^{-5/2}$, twice the size of $\rho c^2$ and negative, so $\rho c^2 + p_r = -\frac{c^4}{16\pi G}r_0^{1/2}r^{-5/2}$. As in step 33, an observer moving radially fast enough measures $\gamma^2(\rho c^2 + p_r) - p_r < 0$. The exotic part of exotic matter is the tension, not necessarily the energy density.`,
    }),
    code({
      id: 'sympy-mt', difficulty: 3,
      prompt: t`Let SymPy read off the matter. The program builds the Morris–Thorne metric with $\Phi = 0$ and an arbitrary shape function \`b(r)\`, and its Einstein tensor \`Gein\` in coordinates. Complete \`source()\` so that it returns $\rho$ and $p_r$ as static observers measure them (units $G = c = 1$), using $G_{\hat t\hat t} = G_{tt}/(-g_{tt})$ and $G_{\hat r\hat r} = G_{rr}/g_{rr}$ and $G_{\hat\mu\hat\nu} = 8\pi T_{\hat\mu\hat\nu}$.`,
      visual: catenoidPic,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`$\rho = b'/(8\pi r^2)$`, code: 'sp.simplify(rho - sp.diff(b, r)/(8*sp.pi*r**2)) == 0' },
        { name: t`$p_r = -b/(8\pi r^3)$`, code: 'sp.simplify(p_r + b/(8*sp.pi*r**3)) == 0' },
        { name: t`Ellis throat: $\rho + p_r = -1/(4\pi r_0^2)$ at $r = r_0$`, code: 'sp.simplify(sp.simplify(sp.sympify(rho + p_r).subs(b, r0**2/r).doit()).subs(r, r0) + 1/(4*sp.pi*r0**2)) == 0' },
      ],
      hints: ['`rho = Gein[0, 0]/(-g[0, 0])/(8*sp.pi)`.', '`p_r = Gein[1, 1]/g[1, 1]/(8*sp.pi)`.'],
      teach: 'Reading a metric backwards takes three lines once the Einstein tensor is known: divide by the metric to reach the observers’ frame, then by 8π.',
      explain: t`With $g_{tt} = -1$ and $g_{rr} = 1/(1 - b/r)$, the frame components give $\rho = b'/(8\pi r^2)$ and $p_r = -b/(8\pi r^3)$; at an Ellis throat $\rho + p_r = (b' - 1)/(8\pi r_0^2) = -2/(8\pi r_0^2)$. The same lines, applied to any proposed wormhole metric, are how its energy budget is checked.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-probe', difficulty: 3, transfer: true,
      gen(r) {
        const [r0, r1] = r.pick([[1, 3], [2, 5], [1.5, 4]]);
        const d = 2 * Math.sqrt(r1 * r1 - r0 * r0);
        return {
          prompt: t`Suppose — hypothetically — an Ellis wormhole with throat radius $r_0 = ${r0}$ km existed. A probe flies radially from the sphere of areal radius $${r1}$ km on one side, through the throat, to the sphere of areal radius $${r1}$ km on the other side. Its radar measures proper distance $\ell$, with $r^2 = \ell^2 + r_0^2$. How far does it travel, in km?`,
          answer: d, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: 2 * (r1 - r0), feedback: t`That is the change in areal radius, not distance travelled. Near the throat, $r$ barely changes while $\ell$ grows: use $\ell = \sqrt{r^2 - r_0^2}$.` },
            { value: d / 2, feedback: 'That is one side only. The probe crosses to the same radius on the far side.' },
            { value: 2 * r1, feedback: t`In flat space that would be right, but here there is no centre: subtract the throat, $\ell = \sqrt{r^2 - r_0^2}$.` },
          ],
          hints: [t`On each side $\ell = \sqrt{r^2 - r_0^2}$.`, t`Total: $2\sqrt{r_1^2 - r_0^2}$.`],
          teach: t`Through an Ellis throat, proper distance and areal radius are related by $r^2 = \ell^2 + r_0^2$: the trip from $r_1$ to $r_1$ is $2\sqrt{r_1^2 - r_0^2}$.`,
          explain: t`$2\sqrt{${r1}^2 - ${r0}^2} = ${round(d, 4)}$ km — compared with $${2 * (r1 - r0)}$ km of change in areal radius. Keeping such a throat open would need a radial tension of $${sci(tension(r0 * 1e3), 2)}$ Pa and negative energy no known matter supplies; the exercise is geometry, not a mission plan.`,
          visual: probePic(r0, r1),
        };
      },
    }),
    mcq({
      id: 'cp-phi', difficulty: 2,
      prompt: t`Could a cleverly chosen redshift function $\Phi(r)$ make $\rho c^2 + p_r \ge 0$ at the throat of a static traversable wormhole?`,
      visual: phiPic,
      choices: [
        t`No: the $\Phi'$ term in $\rho c^2 + p_r$ is multiplied by $1 - b/r$, which vanishes at the throat, leaving $\frac{c^4}{8\pi G}\left(b'(r_0) - 1\right)/r_0^2 < 0$ for any finite $\Phi$`,
        t`Yes: a large positive $\Phi'$ at the throat cancels the negative term`,
        t`Yes: let $e^{2\Phi}$ go to zero at the throat`,
        t`No, because $\Phi$ must be zero for every wormhole`,
      ],
      answer: 0,
      why: {
        1: t`Any finite $\Phi'$ is multiplied by $1 - b/r = 0$ at the throat.`,
        2: t`$e^{2\Phi} = 0$ is a horizon: the throat becomes a black hole's, and nothing can cross it. Traversability is the whole point.`,
        3: t`Morris and Thorne allow any finite $\Phi$; it controls clocks and tides. It just cannot help at the throat.`,
      },
      hints: [t`Write out $\rho c^2 + p_r$ and set $b = r_0$.`],
      teach: 'No redshift function rescues the throat: the null condition fails there for every static traversable wormhole.',
      explain: t`$\rho c^2 + p_r = \frac{c^4}{8\pi G}\left[\frac{b'r - b}{r^3} + 2\left(1 - \frac{b}{r}\right)\frac{\Phi'}{r}\right]$; at $r_0$ the bracket is $(b'(r_0) - 1)/r_0^2$. $\Phi$ can make the null combination positive away from the throat (the picture), but never at it.`,
    }),
    multi({
      id: 'cp-conditions', difficulty: 3,
      prompt: t`Around the Ellis throat, static observers measure $\rho c^2 = p_r = -\frac{c^4}{8\pi G}\frac{r_0^2}{r^4}$ and $p_t = +\frac{c^4}{8\pi G}\frac{r_0^2}{r^4}$. Which energy conditions does its matter break?`,
      visual: powerPic({ n: 1, caption: t`The Ellis throat ($n = 1$), in units of $c^4/(8\pi Gr_0^2)$: energy density and radial pressure coincide, both negative.` }),
      choices: ['The null condition', 'The weak condition', 'The strong condition', 'The dominant condition'],
      answer: [0, 1, 2, 3],
      why: {},
      hints: [t`Check $\rho c^2 + p_r$, $\rho$, $\rho c^2 + p_r + 2p_t$ and $\rho c^2 \ge |p_i|$.`, t`The null condition is part of the weak and strong ones; $\rho < 0$ breaks the weak and dominant ones directly.`],
      teach: 'The Ellis throat breaks all four energy conditions: its energy density is negative and its radial tension exceeds it.',
      explain: t`With $X = \frac{c^4}{8\pi G}\frac{r_0^2}{r^4}$: $\rho c^2 + p_r = -2X < 0$ (null fails, and with it the weak and strong conditions, which include it); $\rho c^2 = -X < 0$ (weak and dominant fail directly); $\rho c^2 + p_r + 2p_t = 0$ and $\rho c^2 + p_t = 0$ sit exactly on their boundaries. Quantum fields break the null condition only by small amounts for short times; no source for this much is known.`,
    }),
  ],
  sources: [
    { label: 'Morris & Thorne, “Wormholes in spacetime and their use for interstellar travel”, Am. J. Phys. 56, 395 (1988)', url: 'https://doi.org/10.1119/1.15620' },
    { label: 'Ellis, “Ether flow through a drainhole: a particle model in general relativity”, J. Math. Phys. 14, 104 (1973)', url: 'https://doi.org/10.1063/1.1666161' },
    { label: 'Hochberg & Visser, “Geometric structure of the generic static traversable wormhole throat”, Phys. Rev. D 56, 4745 (1997)', url: 'https://arxiv.org/abs/gr-qc/9704082' },
    { label: 'Ford & Roman, “Quantum field theory constrains traversable wormhole geometries”, Phys. Rev. D 53, 5496 (1996)', url: 'https://arxiv.org/abs/gr-qc/9510071' },
  ],
});
