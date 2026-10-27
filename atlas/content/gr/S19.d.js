// Recovering ∇²Φ = 4πGρ from the field equations — Derivation Mode. Weak,
// static field: g_00 = −(1 + 2Φ/c²), g_ij = (1 − 2Ψ/c²)δ_ij. To first order
// R_00 = ∇²Φ/c² (only ∂_iΓ^i_00 survives), and the trace-reversed equation
// with slow matter, T_00 − ½Tg_00 = ½ρc², gives R_00 = 4πGρ/c²: Poisson's
// equation (worked example). Also: G_00 = 2∇²Ψ/c² involves only the spatial
// potential, and R_xy ∝ ∂x∂y(Ψ − Φ) forces Ψ = Φ — which doubles the bending
// of light. Explore: Φ and its field through a uniform ball, ∇²Φ = 4πGρ inside.
// Checkpoint: the clock at a planet's centre (transfer), where pressure
// enters, where the expansion breaks down (r = 2GM/c²). Avoids gr.S19.i's and
// gr.EQ.6's items. Verified with SymPy (scratch v19.py).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C, sci, stressTable } from './_curvature.js';
import { fallField } from './_eq.js';

const t = String.raw;
const YEAR = 3.156e7;                                             // s

// Φ (blue) and its field strength (gold) through a uniform ball, in units of GM/R and GM/R²
const ballCurves = [
  { fn: '-(3 - x^2)/2', domain: [0, 1], color: 'accent', width: 2.6 }, { fn: '-1/x', domain: [1, 3], color: 'accent', width: 2.6 },
  { fn: 'x', domain: [0, 1], color: 'gold', width: 2.2 }, { fn: '1/x^2', domain: [1, 3], color: 'gold', width: 2.2 },
];
const ballGraph = (extra = {}) => ({
  x: [0, 3], y: [-1.65, 1.2], xlabel: 'distance from the centre ÷ radius R', ylabel: 'Φ ÷ (GM/R) (blue);  field ÷ (GM/R²) (gold)',
  shade: [{ fn: '1.15', lower: '-1.6', from: 0, to: 1, color: 'gold', alpha: 0.06 }],
  hlines: [{ y: 0, color: 'ink3' }],
  vlines: [{ x: 1, label: 'surface', color: 'ink3' }],
  curves: ballCurves,
  ...extra,
});

// a light ray bent by the Sun (exaggerated)
const bentRay = {
  type: 'graph',
  params: {
    x: [-6, 6], y: [-2.2, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['t', '1.4 - 0.06*(t + sqrt(t^2 + 2))'], t: [-6, 6], color: 'gold', width: 2.4 },
      { param: ['t', '1.4'], t: [-6, 6], color: 'ink4', width: 1.2, dash: [5, 4] },
    ],
    points: [{ x: 0, y: 0, r: 22, color: 'gold' }, { x: -5.8, y: 1.85, r: 0.01, color: 'ink2', label: 'starlight' }],
  },
  caption: 'Starlight grazing the Sun is bent toward it (enormously exaggerated; the real bending is 1.75 arcseconds). Dashed: the undeflected path.',
};

// the weak-field metric: which perturbation does what
const metricTable = stressTable([['−2Φ/c²', '', '', ''], ['', '−2Ψ/c²', '', ''], ['', '', '−2Ψ/c²', ''], ['', '', '', '−2Ψ/c²']], {
  colors: [['gold', '', '', ''], ['', 'violet', '', ''], ['', '', 'violet', ''], ['', '', '', 'violet']],
  caption: t`The weak, static metric is flat plus a small $h_{\mu\nu}$: $h_{00} = -2\Phi/c^2$ (gold) sets how clocks run; $h_{ij} = -2\Psi/c^2\,\delta_{ij}$ (violet) how rulers stretch.`,
});

// how weak is weak: |h_00| = 2GM/(rc²) against distance (log axes), for the Sun or the Earth
const hGraph = (body) => {
  const [GM, R, name, far, farName] = body === 'sun' ? [1.327e20, 6.957e8, 'the Sun', 1.496e11, 'the Earth’s orbit'] : [3.986e14, 6.371e6, 'the Earth', 3.844e8, 'the Moon’s orbit'];
  const L = Math.log10((2 * GM) / C ** 2), x0 = Math.floor(L) - 1, x1 = Math.ceil(Math.log10(far)) + 1;
  const pt = (r, label) => ({ x: +Math.log10(r).toFixed(3), y: +(L - Math.log10(r)).toFixed(3), r: 4.5, color: 'gold', label, labelDx: -10, labelDy: -10, labelAlign: 'right' });
  return {
    type: 'graph',
    params: {
      x: [x0, x1], y: [L - x1 - 0.5, 1.2], axesAt: 'edge', xlabel: 'log₁₀(distance from the centre ÷ 1 m)', ylabel: 'log₁₀ |h₀₀|',
      curves: [{ fn: `${L.toFixed(4)} - x`, domain: [x0, x1], color: 'accent', width: 2.4 }],
      hlines: [{ y: 0, color: 'warn', label: '|h₀₀| = 1: the expansion fails' }],
      points: [pt(R, `${name}’s surface`), pt(far, farName)],
    },
    caption: t`How far the field of ${name} is from flat, $|h_{00}| = 2GM/(rc^2)$, on logarithmic axes, if all its mass sat at the centre. The weak-field derivation drops terms of order $h^2$.`,
  };
};

export default lesson({
  id: 'gr.S19.d',
  title: 'Recovering ∇²Φ = 4πGρ from the field equations',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`Newton's gravity must come out of Einstein's whenever fields are weak, matter slow and pressure small — the solar system, the Galaxy, everyday life. Here is the derivation. Write the metric as flat space plus a small perturbation set by a potential $\Phi$, $g_{00} = -(1 + 2\Phi/c^2)$; work out the Ricci tensor to first order in $\Phi$; and feed it into the trace-reversed field equation of step 18.

The time–time component turns into **Poisson's equation**, $\nabla^2\Phi = 4\pi G\rho$ — and demanding exactly that is what fixed the $8\pi G/c^4$ in front of $T_{\mu\nu}$. The other components then say something Newton never did: space is curved too, by the same potential.`,
  equation: t`g_{00} \approx -\left(1 + \frac{2\Phi}{c^2}\right), \qquad R_{00} \approx \frac{\nabla^2\Phi}{c^2} = \frac{8\pi G}{c^4}\left(T_{00} - \tfrac12 T g_{00}\right) \approx \frac{4\pi G\rho}{c^2}`,
  symbols: [
    { tex: '\\Phi', text: t`the Newtonian potential, in J/kg; $\Phi/c^2 \ll 1$ is what "weak" means (about $10^{-9}$ at the Earth's surface)` },
    { tex: 'g_{00}', text: t`the time–time metric component with $x^0 = ct$: it sets how fast clocks run, $d\tau/dt = \sqrt{-g_{00}} \approx 1 + \Phi/c^2$` },
    { tex: 'R_{00}', text: t`the time–time Ricci component (step 15), here to first order in $\Phi$` },
    { tex: '\\nabla^2', text: t`the Laplacian, $\partial_x^2 + \partial_y^2 + \partial_z^2$` },
    { tex: 'T_{00} - \\tfrac12 T g_{00}', text: t`the trace-reversed source (step 18). For slow matter, $T_{00} = \rho c^2$ and $T \approx -\rho c^2$, so it is $\tfrac12\rho c^2$` },
    { tex: '\\rho', text: t`the mass density, in kg/m³` },
  ],
  why: t`Every orbit Kepler and Newton explained, every spacecraft trajectory, is general relativity in this limit. The derivation also shows how far the limit reaches: corrections are of order $\Phi/c^2$ and $v^2/c^2$, a part in a hundred million for the Earth's orbit.`,
  visual: {
    type: 'graph',
    title: 'Poisson’s equation through a planet',
    lead: t`A uniform ball of mass $M$ and radius $R$. Inside, $\Phi = -\dfrac{GM}{2R}\left(3 - \dfrac{r^2}{R^2}\right)$, curving upward so that $\nabla^2\Phi = 4\pi G\rho$; outside, $\Phi = -GM/r$ with $\nabla^2\Phi = 0$. The clock rate, $\sqrt{-g_{00}} - 1 \approx \Phi/c^2$, follows the blue curve.`,
    tasks: [
      'Move from the centre outward: inside, the field (gold) grows in proportion to r; outside, it falls as 1/r² — the same law from one equation.',
      'Read the clock rate at the centre and at the surface for the Earth: the centre runs slow by an extra part in three billion.',
      'Switch to a neutron star: Φ/c² is no longer small, and this whole weak-field derivation — Newton included — fails.',
    ],
    params: ballGraph({
      sliders: [{ key: 'r', label: 'Where you are, $r/R$', min: 0, max: 3, step: 0.01, value: 0.5, explain: 'Inside the ball for r/R < 1.' }],
      choices: [{ key: 'k', label: 'Body (as a uniform ball)', options: [[6.961e-10, 'Earth'], [2.122e-6, 'Sun'], [0.1722, 'Neutron star']], value: 6.961e-10, explain: 'Each sets GM/(Rc²), the size of Φ/c² at the surface.' }],
      points: [
        { x: 'r', y: '-(3 - min(r, 1)^2)/(2*max(r, 1))', r: 5, color: 'accent' },
        { x: 'r', y: 'min(r, 1)^3/max(r, 0.0001)^2', r: 5, color: 'gold' },
      ],
      readouts: [
        { label: '$\\Phi \\div (GM/R)$', expr: '-(3 - min(r, 1)^2)/(2*max(r, 1))', digits: 3 },
        { label: 'field $\\div (GM/R^2)$', expr: 'min(r, 1)^3/max(r, 0.0001)^2', digits: 3 },
        { label: '$\\nabla^2\\Phi \\div 4\\pi G\\bar\\rho$', expr: 'step(1 - r)', digits: 2 },
        { label: 'clock rate $\\sqrt{-g_{00}} - 1 \\approx \\Phi/c^2$', expr: '-k*(3 - min(r, 1)^2)/(2*max(r, 1))', digits: 3 },
      ],
    }),
    caption: 'Shaded: inside the ball. A uniform ball is a model: real planets and stars are denser toward their centres.',
  },
  example: {
    prompt: t`Take a weak, static field, $g_{00} = -(1 + 2\Phi/c^2)$ with $|\Phi|/c^2 \ll 1$ and nothing changing in time, and slow matter of density $\rho$ with negligible pressure. Show that the field equations reduce to Poisson's equation.`,
    visual: fallField({ caption: t`Newton's field round a planet, $-\nabla\Phi$, which is $-c^2\Gamma^i{}_{00}$: the slow-motion geodesic equation of step 12, $d^2x^i/dt^2 = -c^2\Gamma^i{}_{00}$.` }),
    steps: [
      { label: 'The connection', text: t`To first order, $\Gamma^i{}_{00} = -\tfrac12\partial_i g_{00} = \partial_i\Phi/c^2$ (with $x^0 = ct$); the slow-motion geodesic equation then reads $d^2x^i/dt^2 = -\partial_i\Phi$, so $\Phi$ really is Newton's potential (step 12).` },
      { label: 'The curvature', text: t`$R_{00} = \partial_\lambda\Gamma^\lambda{}_{00} - \partial_0\Gamma^\lambda{}_{\lambda0} + \Gamma\Gamma - \Gamma\Gamma$. The field is static, so every $\partial_0$ vanishes; products of $\Gamma$s are second order. What survives is $R_{00} = \partial_i\Gamma^i{}_{00} = \nabla^2\Phi/c^2$.` },
      { label: 'The source', text: t`Use the trace-reversed equation, $R_{00} = \kappa\left(T_{00} - \tfrac12Tg_{00}\right)$ with $\kappa = 8\pi G/c^4$. Slow, pressure-free matter has $T_{00} = \rho c^2$ and trace $T \approx -\rho c^2$; with $g_{00} \approx -1$, $T_{00} - \tfrac12Tg_{00} = \rho c^2 - \tfrac12\rho c^2 = \tfrac12\rho c^2$.` },
      { label: 'Poisson', text: t`$\dfrac{\nabla^2\Phi}{c^2} = \dfrac{8\pi G}{c^4}\cdot\dfrac{\rho c^2}{2}$, that is $$\nabla^2\Phi = 4\pi G\rho.$$ With a general coupling $\kappa$ the right side would be $\tfrac12\kappa c^4\rho$; matching Newton is what makes $\kappa = 8\pi G/c^4$.` },
      { label: 'Sense check', text: t`Outside a mass $M$, $\nabla^2\Phi = 0$ gives $\Phi = -GM/r$ and $g_{00} = -(1 - 2GM/rc^2)$ — exactly the time–time part of the Schwarzschild metric. At the Sun's surface $2GM/rc^2 \approx 4\times10^{-6}$: weak indeed.` },
    ],
    answer: t`$R_{00} \approx \nabla^2\Phi/c^2$ and $T_{00} - \tfrac12Tg_{00} \approx \tfrac12\rho c^2$, so $R_{00} = \kappa\left(T_{00} - \tfrac12Tg_{00}\right)$ becomes $\nabla^2\Phi = 4\pi G\rho$.`,
  },
  practice: [
    mcq({
      id: 'r00-linear', difficulty: 2,
      prompt: t`For a weak, static field, which terms of $R_{00} = \partial_\lambda\Gamma^\lambda{}_{00} - \partial_0\Gamma^\lambda{}_{\lambda0} + \Gamma^\lambda{}_{\lambda\kappa}\Gamma^\kappa{}_{00} - \Gamma^\lambda{}_{0\kappa}\Gamma^\kappa{}_{\lambda0}$ survive to first order in $\Phi/c^2$?`,
      choices: [
        t`Only $\partial_i\Gamma^i{}_{00}$, the space part of the first term`,
        t`The first two terms; the products are second order`,
        t`All four: nothing can be dropped`,
        t`Only the products, since a static field has no derivatives`,
      ],
      answer: 0,
      why: {
        1: t`The second term is a time derivative, and the field is static: $\partial_0$ of anything is zero. So is the $\lambda = 0$ part of the first term.`,
        2: t`Each $\Gamma$ is already first order in $\Phi/c^2$, so a product of two is second order — dropped in the weak-field limit.`,
        3: t`Static means no time derivatives; space derivatives are what $\nabla^2\Phi$ is made of.`,
      },
      hints: [t`Static: every $\partial_0$ is zero.`, t`Each $\Gamma$ is of order $\Phi/c^2$.`],
      teach: t`In a weak static field, $R_{00} \approx \partial_i\Gamma^i{}_{00} = \nabla^2\Phi/c^2$: one term, linear in the potential.`,
      explain: t`Time derivatives vanish and $\Gamma\Gamma$ is second order, leaving $\partial_i\Gamma^i{}_{00} = \partial_i(\partial_i\Phi/c^2) = \nabla^2\Phi/c^2$.`,
      visual: fallField({ caption: t`A static field round a planet: nothing changes in time, and $|\Phi|/c^2 \sim 10^{-9}$.` }),
    }),
    mcq({
      id: 'trace-slow', difficulty: 2,
      prompt: t`For slow matter with negligible pressure, $T_{00} = \rho c^2$, the trace is $T \approx -\rho c^2$, and $g_{00} \approx -1$. What is the trace-reversed source $T_{00} - \tfrac12Tg_{00}$?`,
      choices: [t`$\tfrac12\rho c^2$`, t`$\rho c^2$`, t`$\tfrac32\rho c^2$`, t`$0$`],
      answer: 0,
      why: {
        1: t`That ignores the trace term. $-\tfrac12Tg_{00} = -\tfrac12(-\rho c^2)(-1) = -\tfrac12\rho c^2$.`,
        2: t`Sign: $T$ and $g_{00}$ are both negative, so $-\tfrac12Tg_{00}$ is negative.`,
        3: t`Only for light, whose trace vanishes, is the source $T_{00}$ itself; for dust, half survives.`,
      },
      hints: [t`$-\tfrac12\,T\,g_{00} = -\tfrac12(-\rho c^2)(-1)$.`],
      teach: t`For slow matter the trace-reversed source is $\tfrac12\rho c^2$ — and that ½ is why Einstein's coupling is $8\pi$, twice Newton's $4\pi$.`,
      explain: t`$\rho c^2 - \tfrac12\rho c^2 = \tfrac12\rho c^2$. Multiplied by $8\pi G/c^4$ it gives $4\pi G\rho/c^2$: the $8\pi$ of the field equations halves to Newton's $4\pi$.`,
      visual: stressTable([['ρc²', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']], { caption: t`Slow, pressure-free matter: $T_{\mu\nu}$ is all energy density.` }),
    }),
    mcq({
      id: 'why-r00', difficulty: 3,
      prompt: t`Write the weak static metric as $g_{00} = -(1 + 2\Phi/c^2)$ and $g_{ij} = (1 - 2\Psi/c^2)\delta_{ij}$ — a clock potential $\Phi$ and a ruler potential $\Psi$. To first order, $R_{00} = \nabla^2\Phi/c^2$ but $G_{00} = 2\nabla^2\Psi/c^2$. Why does the derivation use the trace-reversed $R_{00}$ equation rather than $G_{00} = \kappa T_{00}$?`,
      choices: [
        t`$R_{00}$ involves only $\Phi$, the potential that moves slow bodies; $G_{00}$ fixes $\Psi$ instead, which equals $\Phi$ only once the space–space equations are used`,
        t`$G_{00} = \kappa T_{00}$ is wrong in weak fields`,
        t`$R_{00}$ is larger, so it dominates`,
        t`Because $T_{00}$ is not part of a tensor equation`,
      ],
      answer: 0,
      why: {
        1: t`It is right — it gives $\nabla^2\Psi = 4\pi G\rho$, a true statement about the curvature of space. It just isn't about $\Phi$ until $\Psi = \Phi$ is shown.`,
        2: t`Both are the same size here, of order $4\pi G\rho/c^2$; the point is which potential each one contains.`,
        3: t`$T_{00}$ is a component of the tensor equation; any component may be used. The question is which unknowns each one involves.`,
      },
      hints: [t`Which potential does a slow particle's geodesic equation, $d^2x^i/dt^2 = -c^2\Gamma^i{}_{00}$, depend on?`, t`$\Gamma^i{}_{00}$ comes from $g_{00}$ alone.`],
      teach: t`Slow motion feels only $g_{00}$, so Newton's potential is the clock potential $\Phi$; the trace-reversed $R_{00}$ equation gives $\nabla^2\Phi = 4\pi G\rho$ directly.`,
      explain: t`$R_{00}$ contains only $\Phi$, so $R_{00} = 4\pi G\rho/c^2$ is Poisson's equation for $\Phi$ at once. $G_{00} = 2\nabla^2\Psi/c^2$ gives the same equation for $\Psi$, and the off-diagonal space equations, $R_{xy} \propto \partial_x\partial_y(\Psi - \Phi) = 0$, then show $\Psi = \Phi$ — consistent, but a longer road.`,
      visual: metricTable,
    }),
    expr({
      id: 'interior-field', difficulty: 3,
      prompt: t`Inside a uniform ball, $\nabla^2\Phi = 4\pi G\rho$ with $\Phi$ depending only on $r$, where $\nabla^2\Phi = \dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{d\Phi}{dr}\right)$. Integrate once, with $d\Phi/dr$ finite at the centre. What is the field strength $d\Phi/dr$ at radius $r$ inside?`,
      answer: '4*pi*G*rho*r/3', answerTeX: t`\tfrac43\pi G\rho\,r`, lhs: t`\dfrac{d\Phi}{dr}`,
      vars: { G: [0.5, 2], rho: [0.5, 3], r: [0.2, 2] },
      errors: [
        { answer: '4*pi*G*rho*r', feedback: t`Integrating $4\pi G\rho\,r^2$ gives $\tfrac43\pi G\rho\,r^3$; dividing by $r^2$ leaves $\tfrac43\pi G\rho\,r$.` },
        { answer: '4*pi*G*rho*r^2/3', feedback: t`Divide $r^2\,d\Phi/dr = \tfrac43\pi G\rho\,r^3$ by $r^2$, not by $r$.` },
        { answer: '2*pi*G*rho*r^2/3', feedback: t`That is $\Phi$ itself (up to a constant). The question asks for its derivative, the field.` },
      ],
      hints: [t`$\dfrac{d}{dr}\left(r^2\Phi'\right) = 4\pi G\rho\,r^2$, so $r^2\Phi' = \tfrac43\pi G\rho\,r^3 + C$.`, t`A finite field at $r = 0$ needs $C = 0$.`],
      teach: t`Inside a uniform ball, Poisson's equation gives a field growing in proportion to $r$: $d\Phi/dr = \tfrac43\pi G\rho\,r = GMr/R^3$.`,
      explain: t`$r^2\Phi' = \tfrac43\pi G\rho\,r^3$, so $\Phi' = \tfrac43\pi G\rho\,r = GM(r)/r^2$ with $M(r) = \tfrac43\pi\rho r^3$ — Newton's shell theorem, from the differential equation. Integrating again, $\Phi = \tfrac23\pi G\rho\,r^2 + \text{const}$.`,
      visual: { type: 'graph', params: ballGraph({ curves: ballCurves.slice(0, 2), ylabel: 'Φ ÷ (GM/R)' }), caption: 'The potential Φ through a uniform ball (in units of GM/R): a parabola inside, −GM/r outside. Its slope is the field the question asks for.' },
    }),
    mcq({
      id: 'spatial-part', difficulty: 3,
      prompt: t`The time–time equation gives Newton; the space–space equations add $g_{ij} = (1 - 2\Phi/c^2)\delta_{ij}$ — curved space, with the same potential. What does that spatial part do that Newton's theory cannot?`,
      choices: [
        t`It doubles the bending of light: 1.75 arcseconds at the Sun's edge, where the time part alone gives 0.875`,
        t`It changes the orbits of slow planets by as much as Newton's force`,
        t`Nothing measurable: it is a coordinate effect`,
        t`It makes clocks run slower at lower potential`,
      ],
      answer: 0,
      why: {
        1: t`Slow bodies barely feel it: in their geodesic equation it enters multiplied by $v^2/c^2$. Light, with $v = c$, feels it fully.`,
        2: t`It is curvature, measured: the 1919 eclipse expeditions and modern radio interferometry (to about 0.01%) see the full 1.75 arcseconds.`,
        3: t`That is the time part, $g_{00}$: gravitational time dilation, which Newton's potential already describes.`,
      },
      hints: [t`Which kind of motion is fast enough to feel the space–space part of the metric?`, t`In a geodesic equation, $g_{ij}$ enters through velocities $v^iv^j/c^2$ — tiny for planets, 1 for light.`],
      teach: t`Newton is the $g_{00}$ part of general relativity; the matching spatial curvature is invisible to slow orbits but doubles the deflection of light.`,
      explain: t`For light, $g_{00}$ and $g_{ij}$ contribute equally, each $2GM/(c^2b)$: total $4GM/(c^2b) = 1.75''$ at the Sun's limb. A Newtonian-style calculation — Soldner's in 1801, Einstein's own in 1911 — gets only the first half ($0.875''$ with today's values; with theirs, $0.84''$ and $0.83''$).`,
      visual: bentRay,
    }),
    num({
      id: 'kappa', difficulty: 2,
      prompt: t`Suppose the field equations were $G_{\mu\nu} = \kappa T_{\mu\nu}$ with $\kappa$ unknown. The steps of this lesson give $\nabla^2\Phi = \tfrac12\kappa c^4\rho$. For this to be Newton's $\nabla^2\Phi = 4\pi G\rho$, what must $\kappa c^4/G$ be?`,
      answer: 8 * Math.PI, tol: { rel: 1e-3 },
      errors: [
        { value: 4 * Math.PI, feedback: t`Solve $\tfrac12\kappa c^4 = 4\pi G$: the ½ from the trace reversal doubles it.` },
        { value: 2 * Math.PI, feedback: t`$\tfrac12\kappa c^4 = 4\pi G$ gives $\kappa c^4 = 8\pi G$, not $2\pi G$.` },
      ],
      hints: [t`Set $\tfrac12\kappa c^4 = 4\pi G$.`],
      teach: t`The coupling $8\pi G/c^4$ is fixed by one requirement: slow matter must obey Newton's Poisson equation.`,
      explain: t`$\kappa c^4/G = 8\pi \approx ${fmt(8 * Math.PI, 4)}$, so $\kappa = 8\pi G/c^4 = 2.08\times10^{-43}$ N⁻¹. Nothing else in general relativity sets it: its whole strength is calibrated against Newton.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-core-clock', difficulty: 3, transfer: true,
      gen(r) {
        const [name, GM, Rkm] = r.pick([['the Earth', 3.986e14, 6371], ['Mars', 4.283e13, 3389.5], ['the Moon', 4.905e12, 1737.4]]);
        const frac = GM / (2 * Rkm * 1e3 * C * C), ms = frac * YEAR * 1e3;
        return {
          prompt: t`Treat ${name} as a uniform ball ($GM = ${sci(GM, 4)}$ m³/s², radius ${Rkm.toLocaleString('en-US')} km). Solving $\nabla^2\Phi = 4\pi G\rho$ inside gives $\Phi = -\dfrac{GM}{2R}\left(3 - \dfrac{r^2}{R^2}\right)$. A clock runs at $d\tau/dt \approx 1 + \Phi/c^2$. How many milliseconds per year does a clock at the centre fall behind one on the surface?`,
          answer: ms, units: 'ms', tol: { rel: 0.01 },
          errors: [
            { value: 2 * ms, feedback: t`The difference is $\Phi(0) - \Phi(R) = -\tfrac32GM/R + GM/R = -GM/2R$: half of $GM/R$, not all of it.` },
            { value: 3 * ms, feedback: t`That compares the centre with a clock far away. The question compares it with the surface, where $\Phi = -GM/R$.` },
          ],
          hints: [t`$\Phi(0) - \Phi(R) = -\dfrac{GM}{2R}$.`, t`Fraction behind: $GM/(2Rc^2)$; a year is $3.156\times10^7$ s.`],
          teach: t`Inside a planet the potential keeps falling toward the centre, so the centre's clocks run slowest: by $GM/(2Rc^2)$ relative to the surface, for a uniform ball.`,
          explain: t`$\dfrac{GM}{2Rc^2} = ${sci(frac, 3)}$, which over a year is $${fmt(ms, 3)}$ ms. ${name === 'the Earth' ? 'Over the Earth’s 4.5 billion years that adds up to about a year and a half; with the real, centrally concentrated Earth the centre is about 2.5 years younger than the surface (Uggerhøj and colleagues, 2016).' : 'The smaller and lighter the body, the weaker the effect: it scales as GM/R.'}`,
          visual: { type: 'graph', params: ballGraph({ curves: ballCurves.slice(0, 2), ylabel: 'Φ ÷ (GM/R)', points: [{ x: 0, y: -1.5, r: 5, color: 'gold', label: 'centre clock', labelDx: 10, labelDy: -6 }, { x: 1, y: -1, r: 5, color: 'gold', label: 'surface clock', labelDx: 10, labelDy: -6 }] }), caption: 'The potential through a uniform ball, in units of GM/R: deepest at the centre. A clock’s rate follows it.' },
        };
      },
    }),
    mcq({
      id: 'cp-pressure', difficulty: 2,
      prompt: t`Keep the pressure $p$ of a perfect fluid at rest but stay in a weak, static field. The same steps give $\nabla^2\Phi = 4\pi G(\rho + 3p/c^2)$. Where does the $3p$ come from?`,
      choices: [
        t`From the trace: $T = -\rho c^2 + 3p$, so $T_{00} - \tfrac12Tg_{00} = \tfrac12(\rho c^2 + 3p)$`,
        t`From $T_{00}$, which for a fluid at rest is $\rho c^2 + 3p$`,
        t`From the spatial metric $g_{ij}$, which pressure curves`,
        t`From time derivatives of $\Phi$, which pressure makes non-zero`,
      ],
      answer: 0,
      why: {
        1: t`At rest $T_{00} = \rho c^2$ exactly; pressure lives in the space entries $T_{ii} = p$, and reaches the time–time equation through the trace.`,
        2: t`$R_{00}$ involves only $\Phi$ in a static field; the spatial metric does not enter it.`,
        3: t`The field is static: there are no time derivatives.`,
      },
      hints: [t`$T = g^{\mu\nu}T_{\mu\nu} = -\rho c^2 + 3p$; compute $T_{00} - \tfrac12Tg_{00}$.`, t`$\rho c^2 + \tfrac12(-\rho c^2 + 3p) = \tfrac12(\rho c^2 + 3p)$.`],
      teach: t`Pressure enters Poisson's equation through the trace of $T_{\mu\nu}$: the source of $\Phi$ is $\rho + 3p/c^2$.`,
      explain: t`$T_{00} - \tfrac12Tg_{00} = \rho c^2 + \tfrac12(-\rho c^2 + 3p) = \tfrac12(\rho c^2 + 3p)$. So pressure gravitates (steps 15 and 16), though in the Sun's core only by a few parts in a million.`,
      visual: stressTable([['ρc²', '', '', ''], ['', 'p', '', ''], ['', '', 'p', ''], ['', '', '', 'p']], { caption: t`A fluid at rest: the pressure sits in the space entries, and reaches the time–time equation through the trace.` }),
    }),
    num({
      id: 'cp-breakdown', difficulty: 2,
      gen(r) {
        const [name, GM, unit, scale] = r.pick([['the Sun', 1.327e20, 'km', 1e-3], ['the Earth', 3.986e14, 'mm', 1e3]]);
        const rs = (2 * GM) / (C * C);
        return {
          prompt: t`The derivation kept terms of first order in $h_{00} = -2\Phi/c^2$ and dropped those of order $h_{00}^2$. It fails completely where $|h_{00}| = 2GM/(rc^2)$ reaches 1. For all the mass of ${name} ($GM = ${sci(GM, 4)}$ m³/s²) squeezed into a point, at what radius is that?`,
          answer: rs * scale, units: unit, tol: { rel: 0.005 },
          errors: [
            { value: (rs / 2) * scale, feedback: t`$|h_{00}| = 2GM/(rc^2) = 1$ at $r = 2GM/c^2$, not $GM/c^2$.` },
            { value: (rs / C) * scale, feedback: t`Divide by $c^2$, not $c$.` },
          ],
          hints: [t`$r = 2GM/c^2$.`],
          teach: t`The weak-field expansion fails where $2GM/(rc^2) \sim 1$ — at the Schwarzschild radius, where only the full equations will do.`,
          explain: t`$r = 2GM/c^2 = ${sci(rs * scale, 4)}$ ${unit} — the Schwarzschild radius. ${name === 'the Sun' ? 'The real Sun is 236,000 times larger, so everywhere outside it the expansion is excellent.' : 'The real Earth is 700 million times larger.'} Near a black hole or a neutron star, the full nonlinear equations take over.`,
          visual: hGraph(name === 'the Sun' ? 'sun' : 'earth'),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §4.1 and §4.2 (the Newtonian limit) and §6 (weak fields)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Uggerhøj, Mikkelsen & Faye, The young centre of the Earth, Eur. J. Phys. 37, 035602 (2016)', url: 'https://doi.org/10.1088/0143-0807/37/3/035602' },
  ],
});
