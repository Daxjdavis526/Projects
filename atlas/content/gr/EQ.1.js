// Einstein's field equations with the cosmological constant, dissected
// symbol by symbol. Conventions: Carroll's, signature (−,+,+,+), with c and G
// kept visible so every factor can be read.
import { lesson, mcq, num } from '../../src/core/content.js';

const t = String.raw;
const G = 6.674e-11, C = 2.998e8;

const EFE = t`R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4}\,T_{\mu\nu}`;

// pictures
const SUB = '₀₁₂₃';
const GRID = [];
for (let m = 0; m < 4; m++) for (let n = 0; n < 4; n++) GRID.push({ x: n, y: -m, r: 5, color: m === n ? 'gold' : 'accent', label: `X${SUB[m]}${SUB[n]}`, labelDx: 7, labelDy: -13 });
const ARRAY = {
  type: 'graph', params: { x: [-0.7, 3.7], y: [-3.7, 0.7], aspect: 'square', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, points: GRID,
    curves: [{ fn: '-x', domain: [-0.45, 3.45], dash: [5, 5], color: 'ink3', width: 1.2 }] },
  caption: t`The sixteen entries of a $4\times4$ array: row $\mu$, column $\nu$, each running over $0, 1, 2, 3$. Symmetry, $X_{\mu\nu} = X_{\nu\mu}$, is a reflection across the dashed diagonal.`,
};
// the length on which matter of density ρ curves spacetime: L = 1/√(κρc²), κ = 8πG/c⁴
const L_COEF = C / Math.sqrt(8 * Math.PI * G);
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = (x) => { const e = Math.floor(Math.log10(x)), m = Math.round(x / 10 ** e); return m === 10 ? `10${[...String(e + 1)].map((d) => SUP[d]).join('')}` : `${m} × 10${[...String(e)].map((d) => SUP[d]).join('')}`; };
const DENSITIES = [['air', 1.2, 0, -14], ['water', 1000, 0, -14], ['the Sun’s core', 1.5e5, 0, -14], ['a white dwarf', 1e9, 0, -14], ['a neutron star', 4e17, -10, 16]];
const length = (L) => (L < 1e6 ? `${Math.round(L / 1000)} km` : `${sci(L)} m`);
const STIFFNESS = {
  type: 'graph', params: { x: [-1, 19.5], y: [2.5, 14], xlabel: 'log₁₀ density (kg/m³)', ylabel: 'log₁₀ L (m)', axesAt: 'edge',
    curves: [{ fn: `${Math.log10(L_COEF).toFixed(4)} - x/2`, color: 'ink3', width: 1.4 }],
    points: DENSITIES.map(([name, rho, dx, dy]) => ({ x: Math.log10(rho), y: Math.log10(L_COEF / Math.sqrt(rho)), color: 'accent', label: `${name}: ${length(L_COEF / Math.sqrt(rho))}`, labelDx: dx || 9, labelDy: dy, labelAlign: dx < 0 ? 'right' : 'left' })) },
  caption: t`The length $L = 1/\sqrt{\kappa\,\rho c^2}$, with $\kappa = 8\pi G/c^4$, on which matter of density $\rho$ curves spacetime — an order of magnitude, not an exact radius. For water it is about 1.5 AU; only in a neutron star does it shrink to the size of the star itself.`,
};
const FALLING_BALL = (caption) => ({ type: 'gr-dustball', params: { mode: 'tides', body: 'bh', rSlider: false, play: false, t: 0.6, readout: false, views: 'side' }, caption });

export default lesson({
  id: 'gr.EQ.1',
  kind: 'dissection',
  title: 'Einstein’s field equations with Λ',
  minutes: 7, difficulty: 3,
  badges: ['est-obs', 'open'],
  equation: t`\part{1}{R_{\mu\nu}} - \part{2}{\tfrac12 R\,g_{\mu\nu}} + \part{3}{\Lambda g_{\mu\nu}} = \part{4}{\frac{8\pi G}{c^4}}\,\part{5}{T_{\mu\nu}}`,
  intro: t`These ten equations are the whole of general relativity's account of gravity. The left side is geometry — how spacetime is curved. The right side is matter — how much energy, momentum and pressure sit in it. The equals sign is the physics: matter decides the curvature, and the curvature (through the geodesic equation) decides how matter moves.

Each symbol below gets its own card. Take them in order the first time.`,
  parts: [
    {
      tex: t`R_{\mu\nu}`, name: 'the Ricci tensor', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`Second derivatives of the metric, packaged into a $4\times4$ symmetric array. Physically, it measures how a small ball of freely falling test particles **starts to change its volume**: with ordinary matter inside, the ball shrinks — gravity focuses.

The indices $\mu, \nu$ each run over $0, 1, 2, 3$ (that is, $t, x, y, z$), so every term in this equation is a $4 \times 4$ array.`,
      more: t`It is a contraction of the Riemann tensor, $R_{\mu\nu} = R^{\lambda}{}_{\mu\lambda\nu}$. Riemann has 20 independent components in four dimensions; Ricci keeps 10 of them. The other 10 (the Weyl tensor) are the curvature that can exist in empty space — tides and gravitational waves.`,
    },
    {
      tex: t`\tfrac12 R\,g_{\mu\nu}`, name: 'the trace correction', badge: 'est-der',
      text: t`$R = g^{\mu\nu}R_{\mu\nu}$ is the **Ricci scalar**, the trace of the Ricci tensor. Subtracting $\tfrac12 R\,g_{\mu\nu}$ is not decoration: it is the unique combination that makes the left side automatically **divergence-free** (the contracted Bianchi identity, $\nabla^\mu G_{\mu\nu} = 0$).

That matters because the right side must be conserved, $\nabla^\mu T_{\mu\nu} = 0$. Einstein's first attempt, $R_{\mu\nu} \propto T_{\mu\nu}$, failed exactly here.`,
      more: t`Together the first two parts form the **Einstein tensor**, $G_{\mu\nu} = R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu}$, so the equations are often written $G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu}$.`,
    },
    {
      tex: t`\Lambda g_{\mu\nu}`, name: 'the cosmological-constant term', badge: 'open', units: t`$\Lambda$ in $\text{m}^{-2}$`,
      text: t`$g_{\mu\nu}$ is the **metric** — the unknown you are solving for, the rule that turns coordinate differences into real distances and times. $\Lambda$ is a constant, measured at about $1.1 \times 10^{-52}\ \text{m}^{-2}$.

A positive $\Lambda$ makes empty space drive **accelerated expansion**. The acceleration itself is observed (supernovae, the cosmic microwave background); *why* $\Lambda$ has this tiny value — or whether it is a constant at all — is an **open question**.`,
      more: t`Moved to the right-hand side, $-\frac{\Lambda c^4}{8\pi G} g_{\mu\nu}$ acts like a fluid with energy density $\rho_\Lambda c^2 = \frac{\Lambda c^4}{8\pi G}$ and pressure $p = -\rho_\Lambda c^2$ — "dark energy" with negative pressure.`,
    },
    {
      tex: t`\frac{8\pi G}{c^4}`, name: 'the coupling constant', badge: 'est-obs', units: t`$\text{N}^{-1}$`,
      text: t`How strongly matter curves spacetime. Numerically $\frac{8\pi G}{c^4} \approx 2.1 \times 10^{-43}\ \text{N}^{-1}$ — absurdly small. Spacetime is **stiff**: it takes the mass of a planet or a star to curve it measurably.

The $8\pi$ is not chosen by taste: it is fixed by demanding that weak, slow gravity reduce to Newton's $\nabla^2\Phi = 4\pi G\rho$.`,
    },
    {
      tex: t`T_{\mu\nu}`, name: 'the stress–energy tensor', badge: 'est-der', units: t`$\text{J/m}^3 = \text{Pa}$`,
      text: t`Everything that gravitates, in one symmetric $4\times4$ array. $T_{00}$ is the **energy density**; $T_{0i}$ is momentum density (energy flowing); $T_{ij}$ is **stress** — pressure on the diagonal, shear off it.

So pressure gravitates too, not only mass. In a star that is a small correction; in a neutron star it is decisive.`,
      more: t`For a perfect fluid, $T_{\mu\nu} = (\rho + p/c^2)\,u_\mu u_\nu + p\,g_{\mu\nu}$, where $u_\mu$ is the fluid's four-velocity.`,
    },
  ],
  readAloud: t`The curvature of spacetime (left), plus a uniform push from the cosmological constant, equals the energy, momentum and stress it contains (right), times a coupling so small that only planets and stars curve spacetime noticeably.`,
  why: t`This is the destination of the Road: every later lesson — black holes, waves, cosmology — is a solution of these equations.`,
  practice: [
    mcq({
      id: 'which-matter', difficulty: 1,
      prompt: t`$$${EFE}$$ Which term describes the matter and energy present?`,
      visual: { type: 'gr-dustball', params: { mode: 'matter', rho: 1000, rhoSlider: false, play: false, t: 0.6, readout: false, views: 'side' }, caption: t`A ball of dust released at rest inside water-density matter shrinks the same way in every direction. Something in the equation must say how much matter is there.` },
      choices: [t`$T_{\mu\nu}$`, t`$R_{\mu\nu}$`, t`$g_{\mu\nu}$`, t`$\Lambda g_{\mu\nu}$`],
      answer: 0,
      why: { 1: 'The Ricci tensor is geometry: second derivatives of the metric.', 2: 'The metric is the geometry itself — the unknown you solve for.', 3: 'This is the cosmological-constant term: a property of empty spacetime, not of the matter in it.' },
      hints: ['The equation sets geometry (left) equal to something on the right.', t`The right side holds the "source" of gravity, the way mass density $\rho$ sources Newton's $\nabla^2\Phi = 4\pi G\rho$.`],
      teach: 'Geometry goes on the left of the field equations; energy, momentum and stress go on the right in T.',
      explain: t`$T_{\mu\nu}$, the stress–energy tensor, holds energy density, momentum density and stresses. Everything on the left is built from the metric.`,
    }),
    mcq({
      id: 'count-equations', difficulty: 2,
      prompt: t`Each side of the field equations is a symmetric $4\times4$ array ($X_{\mu\nu} = X_{\nu\mu}$). How many independent component equations does that make?`,
      visual: ARRAY,
      choices: ['10', '16', '4', '6'],
      answer: 0,
      why: { 1: 'A general 4 × 4 array has 16 entries, but symmetry makes the 6 below the diagonal copies of the 6 above it.', 2: 'That counts only the diagonal.', 3: 'That counts only the off-diagonal pairs — add the 4 diagonal entries.' },
      hints: ['Count the diagonal entries, then the distinct off-diagonal pairs.', 'For an n × n symmetric array: n(n + 1)/2.'],
      teach: 'A symmetric n × n array has n(n + 1)/2 independent entries, so the field equations are 10 equations.',
      explain: t`4 diagonal entries plus $\binom{4}{2} = 6$ off-diagonal pairs: $4\cdot5/2 = 10$.`,
      solution: t`The contracted Bianchi identity ties 4 of the 10 together, leaving 6 independent equations — matching the 10 metric components minus the 4 that a change of coordinates can alter freely.`,
    }),
    num({
      id: 'coupling', difficulty: 2,
      prompt: t`Using $G = 6.674\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$ and $c = 2.998\times10^{8}\ \text{m/s}$, compute the coupling $\dfrac{8\pi G}{c^4}$ in $\text{N}^{-1}$.`,
      visual: STIFFNESS,
      answer: (8 * Math.PI * G) / C ** 4, units: 'N^-1', tol: { rel: 0.01 },
      errors: [{ value: (8 * Math.PI * G) / C ** 2, feedback: t`You divided by $c^2$; the coupling has $c^4$ downstairs.` }, { value: (8 * G) / C ** 4, feedback: t`You dropped the $\pi$.` }],
      hints: [t`$c^4 = (2.998\times10^8)^4 \approx 8.08\times10^{33}$.`, t`$8\pi G \approx 1.68\times10^{-9}$; divide.`],
      teach: 'The coupling 8πG/c⁴ is about 2 × 10⁻⁴³ per newton, which is why spacetime is so stiff.',
      explain: t`$\dfrac{8\pi (6.674\times10^{-11})}{(2.998\times10^8)^4} = \dfrac{1.677\times10^{-9}}{8.078\times10^{33}} \approx 2.08\times10^{-43}\ \text{N}^{-1}$.`,
    }),
    mcq({
      id: 'why-half-r', difficulty: 3,
      prompt: t`Why does the left side contain $-\tfrac12 R\,g_{\mu\nu}$ rather than just $R_{\mu\nu}$?`,
      choices: [
        t`So the left side has zero divergence, matching energy–momentum conservation $\nabla^\mu T_{\mu\nu} = 0$`,
        'To make both sides carry the same units',
        'It is the energy stored in the gravitational field itself',
        'It is the cosmological constant written in another form',
      ],
      answer: 0,
      why: { 1: t`$R_{\mu\nu}$ and $R\,g_{\mu\nu}$ have the same units ($\text{m}^{-2}$); the coefficient $\tfrac12$ is about divergence, not units.`, 2: 'General relativity has no local gravitational energy density to put in the equation; this term is pure geometry.', 3: t`$\Lambda g_{\mu\nu}$ is a separate term with a constant coefficient; $R$ varies from place to place.` },
      hints: ['What must be true of the right side, by energy and momentum conservation?', t`The right side obeys $\nabla^\mu T_{\mu\nu} = 0$, so the left side must too. Does $\nabla^\mu R_{\mu\nu}$ vanish on its own?`],
      teach: 'The Einstein tensor is the combination of Ricci curvature whose divergence vanishes identically, so it can equal a conserved source.',
      explain: t`The contracted Bianchi identity gives $\nabla^\mu R_{\mu\nu} = \tfrac12 \nabla_\nu R$, which is not zero in general. Subtracting $\tfrac12 R g_{\mu\nu}$ cancels it exactly: $\nabla^\mu G_{\mu\nu} = 0$.`,
    }),
    mcq({
      id: 'vacuum', difficulty: 3,
      prompt: t`In empty space with $\Lambda = 0$, $T_{\mu\nu} = 0$. What do the field equations reduce to?`,
      visual: FALLING_BALL(t`A ball of dust falling freely in empty space near a black hole of ten solar masses. Shape drawn to scale; the hole is off to the left.`),
      choices: [t`$R_{\mu\nu} = 0$`, t`$g_{\mu\nu} = 0$`, t`Spacetime must be flat: $R^{\rho}{}_{\sigma\mu\nu} = 0$`, t`$R = 0$, with $R_{\mu\nu}$ free`],
      answer: 0,
      why: { 1: 'A vanishing metric would mean no distances or times at all — not a spacetime.', 2: 'Ricci-flat is weaker than flat: the Riemann tensor (tidal curvature) can survive. Outside the Sun, spacetime is curved but empty.', 3: t`Taking the trace of $R_{\mu\nu} - \tfrac12 R g_{\mu\nu} = 0$ gives $R - 2R = 0$, so $R = 0$ — and then $R_{\mu\nu} = 0$ follows.` },
      hints: [t`Set the right side to zero, then take the trace of both sides: $g^{\mu\nu}g_{\mu\nu} = 4$.`, t`The trace gives $R - \tfrac12 R \cdot 4 = -R = 0$. Put $R = 0$ back into the equation.`],
      teach: 'In vacuum the field equations say only that the Ricci tensor vanishes; tidal curvature (Riemann) can remain.',
      explain: t`Tracing gives $R = 0$, and then the equations read $R_{\mu\nu} = 0$. The Schwarzschild spacetime outside a star is Ricci-flat but not flat.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-unknown', difficulty: 2,
      prompt: 'When you "solve Einstein’s equations", which quantity are you solving for?',
      choices: [t`The metric $g_{\mu\nu}$`, t`The stress–energy tensor $T_{\mu\nu}$`, t`The cosmological constant $\Lambda$`, t`The coupling $8\pi G/c^4$`],
      answer: 0,
      why: { 1: 'The matter content is usually specified (or solved alongside); the geometry is what you find.', 2: t`$\Lambda$ is a measured constant.`, 3: 'That is a fixed combination of constants of nature.' },
      hints: ['Every curvature term on the left is built from derivatives of one object.'],
      teach: 'Einstein’s equations are differential equations for the metric, given the matter content.',
      explain: t`$R_{\mu\nu}$ and $R$ are built from the metric and its first and second derivatives, so the equations are second-order PDEs for $g_{\mu\nu}$.`,
    }),
    mcq({
      id: 'cp-flat', difficulty: 3, transfer: true,
      prompt: t`A probe far from any star measures tidal stretching from a nearby black hole, in a region where $T_{\mu\nu} = 0$ and we take $\Lambda = 0$. Which statement is right?`,
      visual: FALLING_BALL(t`The probe's test masses, released around it, as they fall towards the black hole (off to the left). Shape drawn to scale.`),
      choices: [
        t`$R_{\mu\nu} = 0$ there, but the Riemann tensor is not zero — tides are curvature`,
        t`The tides prove $T_{\mu\nu} \neq 0$ at the probe`,
        'Spacetime is flat there, so the tides must be a coordinate effect',
        t`$R_{\mu\nu} \neq 0$ there, because the black hole's mass curves it`,
      ],
      answer: 0,
      why: { 1: 'Tidal forces exist in vacuum: the Moon raises tides across empty space.', 2: 'Tidal stretching cannot be removed by any choice of coordinates or frame — it is real curvature.', 3: t`In vacuum the field equations force $R_{\mu\nu} = 0$ wherever $T_{\mu\nu} = 0$, however close the mass.` },
      hints: [t`What do the field equations say at a point where $T_{\mu\nu} = 0$?`, 'Is there curvature that the Ricci tensor does not see?'],
      teach: 'Vacuum regions are Ricci-flat; the curvature that remains there is tidal (Weyl) curvature.',
      explain: t`The field equations fix $R_{\mu\nu}$ locally from $T_{\mu\nu}$, so it vanishes in vacuum. The Weyl part of the Riemann tensor is not fixed locally and carries the tides.`,
    }),
    num({
      id: 'cp-lambda', difficulty: 3,
      prompt: t`The vacuum energy density equivalent to $\Lambda$ is $u_\Lambda = \dfrac{\Lambda c^4}{8\pi G}$. With $\Lambda = 1.1\times10^{-52}\ \text{m}^{-2}$, $G = 6.674\times10^{-11}$ and $c = 2.998\times10^8$ (SI), find $u_\Lambda$ in $\text{J/m}^3$.`,
      visual: { type: 'gr-friedmann', params: { sliders: false, readout: false }, caption: t`The size of our universe against time in billions of years (the Planck 2018 fit): the measured $\Lambda$ is what makes the expansion speed up today.` },
      answer: (1.1e-52 * C ** 4) / (8 * Math.PI * G), units: 'J/m^3', tol: { rel: 0.02 },
      hints: [t`It is $\Lambda$ divided by the coupling constant you met earlier, $2.08\times10^{-43}\ \text{N}^{-1}$.`, t`$1.1\times10^{-52} / 2.08\times10^{-43}$.`],
      teach: 'Dividing a curvature by the coupling 8πG/c⁴ turns it into an energy density.',
      explain: t`$u_\Lambda = \dfrac{1.1\times10^{-52}}{2.08\times10^{-43}} \approx 5.3\times10^{-10}\ \text{J/m}^3$ — about the rest energy of a few hydrogen atoms per cubic metre.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §4.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
  ],
});
