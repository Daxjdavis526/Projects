// The differential Bianchi identity, its double contraction ∇^μ G_μν = 0, and
// why that makes G_μν the natural geometric side of a field equation whose
// source obeys ∇_μ T^μν = 0. Shown at work in a static star: G_t̂t̂ = 2m′/r²
// ties the metric's mass function to the density, and ∇_μ T^μr = 0 — which
// the identity guarantees — is the Tolman–Oppenheimer–Volkoff equation of
// hydrostatic balance. Explore: the exact uniform-density (Schwarzschild
// interior) pressure against Newton's, diverging at Buchdahl's 2M/R = 8/9.
// Also: 2+1 gravity (G = 0 forces flatness), the boundary of a boundary,
// and a numerical check that converges to zero.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { G, C, MSUN_LEN } from './_curv.js';

const t = String.raw;
const GRP = '(sqrt(1 - c*x^2) - sqrt(1 - c))/(3*sqrt(1 - c) - sqrt(1 - c*x^2))';   // p/ρ inside a uniform-density star, x = r/R, c = 2M/R
const NEWT = '(c/4)*(1 - x^2)';
const pc = (c) => (1 - Math.sqrt(1 - c)) / (3 * Math.sqrt(1 - c) - 1);

const starPic = (c, caption, { gr = true } = {}) => ({
  type: 'graph',
  params: {
    x: [0, 1.05], y: [0, gr ? Math.max(0.1, Math.min(1.6, pc(c) * 1.25)) : Math.max(0.05, c / 3)], aspect: 'wide', axesAt: 'edge', xlabel: 'r / R', ylabel: 'p / ρ', yticks: 4,
    constants: { c },
    curves: [
      { fn: NEWT, domain: [0, 1], color: 'violet', width: 2.2, dash: [6, 4], label: 'Newton', labelAt: 0.75, labelDy: -10 },
      ...(gr ? [{ fn: GRP, domain: [0, 1], color: 'accent', width: 2.6, label: 'general relativity', labelAt: 0.3, labelDy: -12 }] : []),
    ],
  },
  caption,
});

export default lesson({
  id: 'st-c.C16.3',
  title: 'The Bianchi identities and the Einstein tensor',
  minutes: 16, difficulty: 4,
  equation: t`\nabla_\lambda R_{\rho\sigma\mu\nu} + \nabla_\rho R_{\sigma\lambda\mu\nu} + \nabla_\sigma R_{\lambda\rho\mu\nu} = 0 \;\Longrightarrow\; \nabla^\mu G_{\mu\nu} = 0`,
  intro: t`Besides the algebraic symmetries of C15.3, the Riemann tensor obeys a **differential** identity: cycle the derivative index through the first pair and the three covariant derivatives cancel — the **Bianchi identity** above, true for every metric. Contract it twice and it says that a particular combination of Ricci curvature never diverges:
$$G_{\mu\nu} = R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu},\qquad \nabla^\mu G_{\mu\nu} \equiv 0.$$
That is why $G_{\mu\nu}$, the **Einstein tensor**, is the geometry that matter can be set equal to. Energy and momentum are conserved locally, $\nabla_\mu T^{\mu\nu} = 0$; an equation $G_{\mu\nu} = 8\pi T_{\mu\nu}$ ($G = c = 1$) is consistent with that for *every* metric, and in fact enforces it — matter’s equations of motion come out of the field equation. In four dimensions $G_{\mu\nu} + \Lambda g_{\mu\nu}$ is the only divergence-free symmetric tensor built from the metric and its first two derivatives (Lovelock, 1971).`,
  symbols: [
    { tex: t`\nabla_\lambda R_{\rho\sigma\mu\nu}`, text: 'the covariant derivative of the Riemann tensor: how curvature changes from point to point' },
    { tex: t`G_{\mu\nu}`, text: t`the Einstein tensor, in $\text{m}^{-2}$: symmetric, ten components in spacetime` },
    { tex: t`R_{\mu\nu},\ R`, text: 'the Ricci tensor and scalar (C16.1)' },
    { tex: t`g_{\mu\nu}`, text: 'the metric' },
    { tex: t`\nabla^\mu G_{\mu\nu}`, text: t`the divergence $g^{\mu\lambda}\nabla_\lambda G_{\mu\nu}$: four numbers per point, one for each $\nu$` },
  ],
  why: t`The contracted Bianchi identity is the hinge of general relativity (gr.S17.d): it makes Einstein’s equation consistent with conservation of energy, and it is why only six of the ten field equations evolve the geometry while four constrain it — the starting point of numerical relativity.`,
  visual: {
    type: 'graph',
    title: 'What the identity does to a star',
    lead: t`For a static star, the identity’s $\nu = r$ component turns $G = 8\pi T$ into the equation of hydrostatic balance. Here it is solved exactly for a star of uniform density (blue), against Newton’s balance (dashed). Raise the compactness $2M/R$.`,
    tasks: [
      t`At $2M/R = 0.02$ (the white dwarf Sirius B is about $5\times10^{-4}$) the two curves agree: Newton is the weak-field limit.`,
      t`At $2M/R = 0.7$ the central pressure is four times Newton’s. In general relativity pressure gravitates too — the balance equation has $\rho + p$ and $m + 4\pi r^3p$ where Newton has $\rho$ and $m$.`,
      t`Push toward $2M/R = 8/9 = 0.889$: the central pressure runs off to infinity. No static star of uniform density can be more compact — Buchdahl’s limit, which holds for any density that does not increase outward.`,
    ],
    params: {
      x: [0, 1.05], y: [-3.5, 1.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'r / R', ylabel: 'p / ρ', yticks: 5,
      sliders: [{ key: 'c', label: 'compactness $2M/R$', min: 0.02, max: 0.88, step: 0.01, value: 0.3, explain: 'Twice the mass over the radius, with G = c = 1: the Schwarzschild radius as a fraction of the star’s radius.' }],
      curves: [
        { fn: `log(${NEWT})`, domain: [0, 0.99], color: 'violet', width: 2.2, dash: [6, 4], label: 'Newton', labelAt: 0.6, labelDy: 16 },
        { fn: `log(${GRP})`, domain: [0, 0.99], color: 'accent', width: 2.6, label: 'general relativity', labelAt: 0.3, labelDy: -12 },
      ],
      readouts: [
        { label: t`central $p/\rho$, general relativity`, expr: '(1 - sqrt(1 - c))/(3*sqrt(1 - c) - 1)', digits: 3 },
        { label: t`central $p/\rho$, Newton`, expr: 'c/4', digits: 3 },
      ],
    },
    caption: t`Pressure over density ($c = 1$, logarithmic scale) against radius, inside a star of uniform density: the exact Schwarzschild interior solution (1916) and Newton’s hydrostatic balance. Uniform density is a teaching model — real neutron stars are denser at the centre — but the run-away near $2M/R = 8/9$ is general.`,
  },
  example: {
    prompt: t`Starting from the Bianchi identity, show that $\nabla^\mu G_{\mu\nu} = 0$ for every metric, and say what this does for the field equation $G_{\mu\nu} = 8\pi T_{\mu\nu}$.`,
    visual: starPic(0.5, 'Inside a uniform-density star with 2M/R = 0.5: the pressure that keeps it static, from ∇_μT^μr = 0 (blue), against Newton’s (dashed).'),
    steps: [
      { label: 'Why it holds', text: t`At any point choose coordinates with $\Gamma = 0$ there (C13). Then $\nabla_\lambda R_{\rho\sigma\mu\nu} = \partial_\lambda R_{\rho\sigma\mu\nu}$, and $R$ is $\partial\Gamma$ plus terms quadratic in $\Gamma$ whose first derivatives vanish there. The cyclic sum of $\partial_\lambda\partial_\mu\Gamma$ terms cancels in pairs. A tensor equation true in one chart is true in all.` },
      { label: 'Contract twice', text: t`Multiply by $g^{\nu\sigma}g^{\mu\lambda}$ (allowed inside $\nabla$, since $\nabla g = 0$). The three terms become $\nabla^\mu R_{\rho\mu}$, $-\nabla_\rho R$ and $\nabla^\nu R_{\rho\nu}$: so $2\nabla^\mu R_{\rho\mu} = \nabla_\rho R$.` },
      { label: 'Einstein tensor', text: t`$\nabla^\mu G_{\mu\nu} = \nabla^\mu R_{\mu\nu} - \tfrac12 g_{\mu\nu}\nabla^\mu R = \tfrac12\nabla_\nu R - \tfrac12\nabla_\nu R = 0$.` },
      { label: 'Consistency', text: t`Take $\nabla^\mu$ of $G_{\mu\nu} = 8\pi T_{\mu\nu}$: the left side is zero identically, so $\nabla^\mu T_{\mu\nu} = 0$. The field equation cannot even be solved unless energy and momentum are conserved.` },
      { label: 'At work', text: t`For a static star, the $\nu = r$ component of $\nabla_\mu T^{\mu\nu} = 0$ is $p' = -(\rho + p)\,\dfrac{m + 4\pi r^3 p}{r(r - 2m)}$ (Tolman–Oppenheimer–Volkoff): the hydrostatic balance in the picture.` },
    ],
    answer: t`Contracting twice gives $\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R$, hence $\nabla^\mu G_{\mu\nu} = 0$ identically; so $G_{\mu\nu} = 8\pi T_{\mu\nu}$ forces $\nabla^\mu T_{\mu\nu} = 0$ — for a star, its hydrostatic balance.`,
  },
  practice: [
    num({
      id: 'mass-function', difficulty: 3,
      gen(r) {
        const A = r.pick([2, 3, 4]) * 1e-3, Rk = r.pick([10, 12, 14]), xr = r.pick([0.3, 0.5, 0.7]);
        const B = (3 * A) / (5 * Rk * Rk), rr = xr * Rk;
        const key = 6 * A - 10 * B * rr * rr;
        return {
          prompt: t`A static star ($G = c = 1$, lengths in km) has $g_{rr} = \big(1 - 2m(r)/r\big)^{-1}$ with mass function $m(r) = A r^3 - B r^5$, where $A = ${A * 1e3}\times10^{-3}\ \text{km}^{-2}$ and $B = ${tex(B, 4)}\ \text{km}^{-4}$ (radius $R = ${Rk}$ km). For such a metric the Einstein tensor’s time–time component, in the static observer’s frame, is $G_{\hat t\hat t} = 2m'(r)/r^2$. Find $G_{\hat t\hat t}$ at $r = ${nice(rr, 3)}$ km, in $\text{km}^{-2}$.`,
          visual: { type: 'graph', params: { x: [0, Rk * 1.05], y: [0, A * Rk ** 3 * 0.45], aspect: 'wide', axesAt: 'edge', xlabel: 'r (km)', ylabel: 'm(r) (km)', yticks: 4, curves: [{ fn: `${A}*x^3*(1 - 0.6*x^2/${Rk * Rk})`, domain: [0, Rk], color: 'accent', width: 2.4 }], vlines: [{ x: rr, color: 'gold' }] }, caption: 'The mass function: the mass inside radius r, as it appears in the metric. The gold line marks the radius asked about.' },
          answer: key, units: 'km^-2', tol: { rel: 0.005 },
          errors: [
            { value: key / (8 * Math.PI), feedback: t`That is the density $\rho = G_{\hat t\hat t}/8\pi$. The question asks for $G_{\hat t\hat t}$ itself.` },
            { value: (2 * (A * rr ** 3 - B * rr ** 5)) / rr ** 3, feedback: t`That is $2m/r^3$. The Einstein tensor needs the derivative: $2m'/r^2$.` },
            { value: 3 * A - 5 * B * rr * rr, feedback: t`$m'/r^2$ — the factor 2 is missing.` },
          ].filter((e) => Math.abs(e.value - key) > 0.02 * Math.abs(key)),
          hints: [t`$m'(r) = 3Ar^2 - 5Br^4$.`, t`$G_{\hat t\hat t} = 2m'/r^2 = 6A - 10Br^2$.`],
          teach: t`The Einstein tensor of a static star counts the mass added per shell: $G_{\hat t\hat t} = 2m'/r^2 = 8\pi\rho$.`,
          explain: t`$G_{\hat t\hat t} = 6A - 10Br^2 = ${tex(key, 4)}\ \text{km}^{-2}$, so Einstein’s equation sets the density there to $\rho = G_{\hat t\hat t}/8\pi = ${tex(key / (8 * Math.PI), 3)}\ \text{km}^{-2}$ (multiply by $c^2/G$ for $\text{kg/m}^3$: $${tex((key / (8 * Math.PI)) * 1e-6 * C * C / G, 3)}$). The time–time equation is simply $m' = 4\pi r^2\rho$ — the mass function counts the mass shell by shell, as in Newton.`,
        };
      },
    }),
    num({
      id: 'central-pressure', difficulty: 3,
      gen(r) {
        const c = r.pick([0.3, 0.45, 0.6, 0.7, 0.8]);
        const key = pc(c);
        return {
          prompt: t`For a static star of uniform density, the identity-guaranteed balance $\nabla_\mu T^{\mu r} = 0$ can be integrated exactly. The central pressure is $$\frac{p_c}{\rho} = \frac{1 - \sqrt{1 - 2M/R}}{3\sqrt{1 - 2M/R} - 1}\qquad (c = 1).$$ Find $p_c/\rho$ for $2M/R = ${c}$, and compare with Newton’s $\tfrac14(2M/R)$.`,
          visual: starPic(c, t`Inside a uniform-density star with 2M/R = ${c}: Newton’s pressure only (the relativistic curve is hidden).`, { gr: false }),
          answer: key, tol: { rel: 0.005 },
          errors: [{ value: c / 4, feedback: 'That is Newton’s value. In general relativity the pressure itself gravitates, so the centre needs more.' }, { value: (1 - Math.sqrt(1 - c)) / (3 * Math.sqrt(1 - c) + 1), feedback: t`The denominator is $3\sqrt{1 - 2M/R} - 1$, with a minus sign: that is what makes it blow up at $2M/R = 8/9$.` }].filter((e) => Math.abs(e.value - key) > 0.02 * key),
          hints: [t`$\sqrt{1 - ${c}} = ${nice(Math.sqrt(1 - c), 4)}$.`, t`$p_c/\rho = (1 - ${nice(Math.sqrt(1 - c), 4)})/(3\times${nice(Math.sqrt(1 - c), 4)} - 1)$.`],
          teach: 'In general relativity pressure adds to the gravity it must resist, so compact stars need far more central pressure than Newton says.',
          explain: t`$p_c/\rho = ${nice(key, 4)}$, against Newton’s $${nice(c / 4, 3)}$ — ${nice(key / (c / 4), 3)} times as much. Each increase of pressure adds to $\rho + p$ and to $m + 4\pi r^3p$ in the balance equation, which demands still more pressure: past $2M/R = 8/9$ no finite pressure is enough.`,
        };
      },
    }),
    mcq({
      id: 'two-plus-one', difficulty: 3,
      prompt: t`In a world with two space dimensions and one time (2+1), the Riemann tensor has 6 components and is fixed entirely by the Ricci tensor (C15.3). Einstein’s equation $G_{\mu\nu} = 8\pi T_{\mu\nu}$ holds there too. What does empty space around a star look like?`,
      visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'cone', controls: false, readout: false }, caption: 'A cone: flat everywhere except at its tip, yet geodesics passing on either side of the tip cross.' },
      choices: [
        'Flat: no tides and no attraction, but a cone-like deficit angle around the star',
        'Curved like a sphere, with tides falling off as 1/r²',
        'Exactly like the space around a star in 3+1 dimensions',
        'It cannot exist: G = 8πT has no solutions in 2+1',
      ],
      answer: 0,
      why: {
        1: t`In empty space $T = 0$, so $G = 0$, so $R_{\mu\nu} = 0$; in 2+1 that forces the whole Riemann tensor to vanish.`,
        2: 'In 3+1 the Weyl tensor carries curvature through empty space. In 2+1 there is no Weyl tensor.',
        3: 'There are solutions: flat space cut and glued into a cone around each mass (Deser, Jackiw and ’t Hooft, 1984).',
      },
      hints: [t`$G_{\mu\nu} = 0$ implies $R_{\mu\nu} = 0$ (take its trace). What does Ricci determine in three dimensions?`, 'A cone is flat except at its tip.'],
      teach: 'In 2+1 dimensions Ricci fixes Riemann, so empty space is exactly flat: gravity there has no tides and no waves.',
      explain: t`With no Weyl part, vacuum means $R^\rho{}_{\sigma\mu\nu} = 0$: no tides, no gravitational waves, no attraction of a test particle at rest. A mass shows up only globally, as a deficit angle — flat space cut and glued into a cone, proportional to the mass. Four dimensions are the first in which the identity leaves room for gravity to propagate.`,
    }),
    order({
      id: 'why-source', difficulty: 3,
      prompt: t`Why must the geometric side of the field equation be divergence-free *identically*? Order the argument.`,
      visual: starPic(0.3, 'Inside a uniform-density star with 2M/R = 0.3: the balance that ∇_μT^μν = 0 demands.'),
      items: [
        t`Matter’s energy and momentum are conserved locally: $\nabla_\mu T^{\mu\nu} = 0$.`,
        t`If the field equation is $E_{\mu\nu} = 8\pi T_{\mu\nu}$, every solution then has $\nabla^\mu E_{\mu\nu} = 0$.`,
        t`Unless that holds for every metric, it is four extra equations on $g$ — for $E = R_{\mu\nu}$ it would force $\nabla_\nu R = 0$, so $R$ and hence $T^\mu{}_\mu$ constant everywhere, which ordinary matter violates.`,
        t`$G_{\mu\nu}$ is divergence-free identically, by the contracted Bianchi identity, so $G_{\mu\nu} = 8\pi T_{\mu\nu}$ adds no such condition.`,
        t`In four dimensions, $G_{\mu\nu} + \Lambda g_{\mu\nu}$ is the only symmetric, divergence-free tensor built from $g$ and its first two derivatives.`,
      ],
      hints: ['Start from what matter itself obeys.', t`Take the divergence of both sides of a candidate equation.`],
      teach: 'The source obeys ∇·T = 0, so the geometric side must have zero divergence for every metric: the Einstein tensor (plus Λg) is the only candidate.',
      explain: t`Einstein first tried $R_{\mu\nu} = \kappa T_{\mu\nu}$ and abandoned it in 1915 for this reason. Lovelock’s theorem then says there was no other choice in four dimensions, apart from the cosmological constant.`,
    }),
    mcq({
      id: 'boundary', difficulty: 2,
      prompt: t`Misner, Thorne and Wheeler read the Bianchi identity as "the boundary of a boundary is zero". In terms of parallel transport, which statement captures it?`,
      visual: {
        type: 'graph',
        params: { x: [-1.6, 1.6], y: [-1.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, aspect: 'wide',
          shade: [{ fn: '0.8', lower: '-0.8', from: -0.8, to: 0.8, color: 'accent', alpha: 0.12 }],
          arrows: [
            { from: [-0.8, -0.8], to: [0, -0.8], color: 'accent', width: 2.2 }, { from: [0, -0.8], to: [0.8, -0.8], color: 'accent', width: 2.2 },
            { from: [0.8, -0.8], to: [0.8, 0], color: 'accent', width: 2.2 }, { from: [0.8, 0], to: [0.8, 0.8], color: 'accent', width: 2.2 },
            { from: [0.8, 0.8], to: [0, 0.8], color: 'accent', width: 2.2 }, { from: [0, 0.8], to: [-0.8, 0.8], color: 'accent', width: 2.2 },
            { from: [-0.8, 0.8], to: [-0.8, 0], color: 'accent', width: 2.2 }, { from: [-0.8, 0], to: [-0.8, -0.8], color: 'accent', width: 2.2 },
          ],
          points: [{ x: -0.8, y: -0.8, color: 'gold', r: 5 }, { x: 0.8, y: -0.8, color: 'gold', r: 5 }, { x: 0.8, y: 0.8, color: 'gold', r: 5 }, { x: -0.8, y: 0.8, color: 'gold', r: 5 }] },
        caption: 'A face and its boundary loop: each corner is where one edge ends and the next begins, so the corners cancel. One dimension up, the faces of a cube share their edges the same way.',
      },
      choices: [
        'Add up the curvature (holonomy) through all six faces of a small cube: each edge is travelled twice in opposite directions, so the total is zero',
        'A vector carried round any closed loop returns unchanged',
        'The boundary of a curved region has zero length',
        'Curvature is zero on the boundary of every region',
      ],
      answer: 0,
      why: {
        1: 'That would be flat space; the identity holds whatever the curvature.',
        2: 'The slogan is about boundaries of boundaries — a cube’s faces have no boundary of their own once glued — not about lengths.',
        3: 'Curvature need not vanish anywhere: the identity constrains how it varies, not its size.',
      },
      hints: ['A cube’s surface is closed: it has no edge of its own. What happens to the edges of its six faces?'],
      teach: 'The Bianchi identity says the total curvature flux out of any small closed surface is zero, because a closed surface has no boundary.',
      explain: t`Each face of the cube contributes its holonomy, $R$ times its area; the faces’ boundary loops cover every edge twice in opposite directions, so the sum vanishes to the order that matters. That is $\nabla_{[\lambda}R_{\rho\sigma]\mu\nu} = 0$ — the same bookkeeping as $\nabla\cdot(\nabla\times\vec A) = 0$ and $d(dA) = 0$ in C10.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neutron', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([3, 5, 7, 9]) * 1e17;
        const Gtt = (8 * Math.PI * G * rho) / (C * C), Lc = 1 / Math.sqrt(Gtt) / 1e3;
        return {
          prompt: t`Near the centre of a neutron star the density is about $${tex(rho, 2)}\ \text{kg/m}^3$. Einstein’s equation in SI units, $G_{\hat t\hat t} = \dfrac{8\pi G}{c^2}\rho$ (pressure aside), gives a curvature. What length $1/\sqrt{G_{\hat t\hat t}}$ does it correspond to, in km?`,
          visual: starPic(0.4, 'Inside a uniform-density model of a compact star with 2M/R = 0.4 (a typical neutron star is near 0.3–0.5).'),
          answer: Lc, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: 1 / Math.sqrt((G * rho) / (C * C)) / 1e3, feedback: t`Keep the $8\pi$: $G_{\hat t\hat t} = 8\pi G\rho/c^2$.` },
            { value: 1 / Gtt / 1e3, feedback: t`$G_{\hat t\hat t}$ is in $\text{m}^{-2}$: the length is $1/\sqrt{G_{\hat t\hat t}}$.` },
          ].filter((e) => Math.abs(e.value - Lc) > 0.02 * Lc),
          hints: [t`$G_{\hat t\hat t} = 8\pi\times6.674\times10^{-11}\times${tex(rho, 2)}/(2.998\times10^8)^2$.`, t`$G_{\hat t\hat t} = ${tex(Gtt, 3)}\ \text{m}^{-2}$.`],
          teach: 'Einstein’s equation converts a density into a curvature 8πGρ/c²; in a neutron star its length scale matches the star’s size.',
          explain: t`$G_{\hat t\hat t} = ${tex(Gtt, 3)}\ \text{m}^{-2}$, so $1/\sqrt{G_{\hat t\hat t}} = ${nice(Lc, 3)}$ km — about the radius of the star itself (10–14 km). That is what "strongly relativistic" means: in water the same length is $${tex(1 / Math.sqrt((8 * Math.PI * G * 1000) / (C * C)) / 1e3, 2)}$ km, which is why Newton serves for planets.`,
        };
      },
    }),
    num({
      id: 'cp-buchdahl', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([1.4, 2.0, 2.3, 10]);
        const key = (9 / 4) * m * (MSUN_LEN / 1e3);
        return {
          prompt: t`Buchdahl’s theorem: a static, spherical star whose density does not increase outward must have $2M/R < 8/9$, i.e. $R > \tfrac94\,GM/c^2$. What is the smallest radius, in km, of such a star of ${m} solar masses ($GM_\odot/c^2 = 1.477$ km)?`,
          visual: starPic(0.85, 'A uniform-density star near the limit (2M/R = 0.85): the central pressure the balance needs is already enormous.'),
          answer: key, units: 'km', tol: { rel: 0.005 },
          errors: [
            { value: 2 * m * (MSUN_LEN / 1e3), feedback: t`$2GM/c^2$ is the Schwarzschild radius, where a horizon forms. A static star cannot get even close: $R > \tfrac94 GM/c^2 = 1.125\times$ that.` },
            { value: 3 * m * (MSUN_LEN / 1e3), feedback: t`$3GM/c^2$ is the photon sphere, a different radius. Buchdahl’s bound is $\tfrac94 GM/c^2$.` },
          ],
          hints: [t`The bound is $R > \tfrac94\,GM/c^2$; for ${m} solar masses, $GM/c^2 = ${m}\times1.477$ km.`, t`$R_{\min} = \tfrac94\times${m}\times1.477$ km.`],
          teach: 'No static star can be squeezed below 9/4 GM/c², a little outside its Schwarzschild radius.',
          explain: t`$R_{\min} = \tfrac94\times${m}\times1.477 = ${nice(key, 4)}$ km, just $1.125$ times the Schwarzschild radius $${nice(2 * m * (MSUN_LEN / 1e3), 4)}$ km. Real neutron stars sit well outside it (about 12 km for $1.4\,M_\odot$); ${m === 10 ? 'a 10-solar-mass object this compact would not be a star at all — nothing known supports it, so it collapses to a black hole.' : 'the bound is general relativity’s, independent of the unknown equation of state.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-residual', difficulty: 2,
      prompt: t`A student computes $\nabla^\mu G_{\mu\nu}$ for a complicated metric on a computer, by finite differences with grid spacing $h$, and gets small non-zero numbers that fall as $h^2$ when the grid is refined (the plot). What should they conclude?`,
      visual: { type: 'graph', params: { x: [-3.2, -0.8], y: [-7.5, -2], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'grid spacing h', ylabel: '|∇·G| (largest)', points: [-3, -2.5, -2, -1.5, -1].map((lx) => ({ x: lx, y: +(2 * lx - 1.2).toFixed(3), r: 5, color: 'accent' })), curves: [{ fn: '2*x - 1.2', domain: [-3.1, -0.9], color: 'ink3', dash: [5, 4], label: 'slope 2', labelAt: -1.6, labelDy: 14 }] }, caption: 'The largest residual against the grid spacing, on log scales: a straight line of slope 2.' },
      choices: [
        'The code is fine: the identity holds exactly, and the residual is the second-order truncation error of the differences',
        'Energy is not conserved in this spacetime',
        'The metric is not a solution of Einstein’s equation',
        'The connection must have torsion',
      ],
      answer: 0,
      why: {
        1: t`$\nabla^\mu G_{\mu\nu} = 0$ for every metric, conserved matter or not: it says nothing about this spacetime.`,
        2: 'The identity holds for any metric, solution or not.',
        3: 'The Levi-Civita connection the code uses is torsion-free by construction; a truncation error is the simpler explanation, and its h² scaling confirms it.',
      },
      hints: ['Does the contracted Bianchi identity depend on the metric being special?', 'What does a residual that falls as h² usually mean in numerics?'],
      teach: 'Because ∇·G = 0 holds for every metric, a computed non-zero divergence measures only numerical error — a free test of a curvature code.',
      explain: t`An identity is a free check. Numerical-relativity codes use exactly this: the residual of the constraint equations must converge to zero at the order of the scheme, or there is a bug.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.6 (Bianchi identity), §4.2 (Einstein’s equation) and §7.2 (TOV, Buchdahl)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Misner, Thorne & Wheeler, Gravitation, ch. 15 (“the boundary of a boundary is zero”)', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Lovelock 1971, The Einstein tensor and its generalizations, J. Math. Phys. 12, 498', url: 'https://doi.org/10.1063/1.1665613' },
    { label: 'Buchdahl 1959, General relativistic fluid spheres, Phys. Rev. 116, 1027', url: 'https://doi.org/10.1103/PhysRev.116.1027' },
  ],
});
