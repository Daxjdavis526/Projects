// The Gauss–Bonnet theorem: local (curvature inside + geodesic curvature of
// the boundary + turning at corners = 2π) and global (∬K dA = 2πχ). Checked
// on a polar cap, the sphere (octahedron), the torus, polyhedra (Descartes'
// angle defect), a lunar survey triangle and a wheel-and-spoke space station.
import { lesson, mcq, num, order, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_dg.js';
import { R_MOON } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;

// Explore: c = 0 torus, 1 sphere, 2 polar cap
const W = (k) => `step(0.5 - abs(c - ${k}))`;
const PHI = (1 + Math.sqrt(5)) / 2;
const SOLIDS = {
  tetrahedron: { v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], faces: '3 triangles', angle: 180 },
  cube: { v: [-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [-1, 1].map((c) => [a, b, c]))), faces: '3 squares', angle: 90 },
  octahedron: { v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], faces: '4 equilateral triangles', angle: 120 },
  icosahedron: { v: [-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [[0, a, b * PHI], [a, b * PHI, 0], [b * PHI, 0, a]])), faces: '5 equilateral triangles', angle: 60 },
  dodecahedron: { v: [...[-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [-1, 1].map((c) => [a, b, c]))), ...[-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [[0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [b * PHI, 0, a / PHI]]))], faces: '3 regular pentagons', angle: 36 },
};
function solidPic(name) {
  const V = SOLIDS[name].v, d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  let m = Infinity;
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) m = Math.min(m, d(V[i], V[j]));
  const segs = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) if (d(V[i], V[j]) < m * 1.01) segs.push({ from: V[i].map(r6), to: V[j].map(r6), color: 'accent' });
  return { type: 'calc-vectors3d', params: { range: 2.2, grid: false, axes: false, yaw: 0.4, pitch: 0.35, segments: segs, points: V.map((p) => ({ at: p.map(r6), color: 'gold' })) }, caption: `A regular ${name}: ${V.length} vertices, ${segs.length} edges.` };
}

export default lesson({
  id: 'st-c.C6.4',
  title: 'The Gauss–Bonnet theorem',
  minutes: 15, difficulty: 4,
  equation: t`\iint_R K\,dA + \oint_{\partial R}\kappa_g\,ds + \sum_i(\pi - \alpha_i) = 2\pi\chi(R)`,
  intro: t`Walk once round the edge of a region $R$ on a surface, keeping it on your left. Your direction turns for three reasons: the curvature inside, $\iint K\,dA$ (the holonomy of C6.3); the steering along the edge, $\oint\kappa_g\,ds$; and the sharp turns $\pi - \alpha_i$ at corners with interior angles $\alpha_i$. For a region shaped like a disc they always add up to one full turn, $2\pi$. In general the right side is $2\pi\chi$, where the **Euler characteristic** $\chi = V - E + F$ counts vertices, edges and faces of any way of cutting $R$ into polygons.

For a closed surface there is no edge, and the theorem becomes

$$\iint_S K\,dA = 2\pi\chi(S),\qquad \chi = 2 - 2g,$$

with $g$ the number of holes (the **genus**). Bend, dent or stretch a sphere however you like: its total curvature stays $4\pi$. Curvature is local and geometric; this sum is global and topological.`,
  symbols: [
    { tex: 'K', text: t`the Gaussian curvature, $\text{m}^{-2}$; $\iint K\,dA$ is dimensionless (radians)` },
    { tex: t`\kappa_g`, text: 'the geodesic curvature of the boundary (C6.2); zero along geodesic edges' },
    { tex: t`\alpha_i`, text: t`the interior angles at the boundary’s corners; $\pi - \alpha_i$ is the turn there` },
    { tex: t`\chi`, text: t`the Euler characteristic: $V - E + F$; 1 for a disc, 2 for a sphere, 0 for a torus` },
    { tex: 'g', text: 'the genus: the number of handles (holes through the surface)' },
  ],
  why: t`It is the first theorem tying local geometry to global shape — the model for the singularity theorems and topology-change arguments of GR. And in two dimensions it kills gravity: the Einstein–Hilbert action $\int R\sqrt{g}\,d^2x = 2\iint K\,dA = 4\pi\chi$ is a topological constant, so 2D general relativity has no field equations.`,
  visual: {
    type: 'graph',
    title: 'Adding up the curvature',
    lead: t`The curve is the curvature density $K\sqrt{EG}$ along a meridian; the shaded area times $2\pi$ (for the angle round the axis) is $\iint K\,dA$. The dashed curve is $K$ itself.`,
    tasks: [
      t`Torus: change $R$ and $r$. $K$ (dashed) changes a lot, but the density is always $\cos v$: the positive outer half exactly cancels the negative inner half, $\iint K\,dA = 0 = 2\pi\chi$.`,
      t`Sphere: change its radius $a$. $K = 1/a^2$ changes; the density $\sin\theta$ and the total $4\pi$ do not.`,
      t`Polar cap: grow the cap. Curvature inside plus the boundary’s geodesic curvature is always $2\pi$, so $\chi = 1$ — at the equator all of it is inside; for a tiny cap almost all is in the boundary.`,
    ],
    params: {
      x: [-3.3, 3.3], y: [-2.2, 2.2], xlabel: 'v (torus) or θ (sphere), rad', ylabel: '',
      choices: [{ key: 'c', label: 'Surface', options: [[0, 'torus'], [1, 'sphere'], [2, 'polar cap']], value: 0, explain: 'A closed torus, a closed sphere, or a cap of the sphere bounded by a circle of latitude.' }],
      sliders: [
        { key: 'R', label: 'Torus $R$', min: 1.5, max: 4, step: 0.1, value: 2, explain: 'Distance from the axis to the centre of the tube.' },
        { key: 'r', label: 'Torus $r$', min: 0.3, max: 1, step: 0.05, value: 1, explain: 'Radius of the tube.' },
        { key: 'a', label: 'Sphere $a$', min: 0.8, max: 2, step: 0.05, value: 1, explain: 'Radius of the sphere (and of the cap’s sphere).' },
        { key: 'th', label: t`Cap $\theta_0$`, min: 0.1, max: 3.1, step: 0.01, value: 1, explain: 'Colatitude of the cap’s edge, in radians: the cap is θ ≤ θ₀.' },
      ],
      curves: [
        { fn: 'cos(x)', domain: [-3.1416, 3.1416], color: 'accent', width: 2.4, when: W(0) },
        { fn: 'cos(x)/(r*(R + r*cos(x)))', domain: [-3.1416, 3.1416], color: 'gold', dash: true, width: 2, when: W(0) },
        { fn: 'sin(x)', domain: [0, 3.1416], color: 'accent', width: 2.4, when: `${W(1)} + ${W(2)}` },
        { fn: '1/a^2', domain: [0, 3.1416], color: 'gold', dash: true, width: 2, when: `${W(1)} + ${W(2)}` },
      ],
      shade: [
        { fn: 'cos(x)', from: -3.1416, to: 3.1416, color: 'accent', alpha: 0.22, when: W(0) },
        { fn: 'sin(x)', from: 0, to: 3.1416, color: 'accent', alpha: 0.22, when: W(1) },
        { fn: 'sin(x)', from: 0, to: 'th', color: 'accent', alpha: 0.22, when: W(2) },
      ],
      vlines: [{ x: 'th', color: 'violet', when: W(2) }],
      integral: { fn: `${W(0)}*cos(x) + (1 - ${W(0)})*sin(x)`, from: `-${W(0)}*pi`, to: `${W(0)}*pi + ${W(1)}*pi + ${W(2)}*th` },
      readouts: [
        { label: t`$\iint K\,dA$`, expr: '2*pi*integral', digits: 4, zero: 1e-6 },
        { label: t`$\oint\kappa_g\,ds$`, expr: `${W(2)}*2*pi*cos(th)`, digits: 4, zero: 1e-6 },
        { label: t`$\chi$`, expr: `integral + ${W(2)}*cos(th)`, digits: 3, zero: 1e-6 },
      ],
      legend: [{ label: 'K √(EG), curvature density', color: 'accent' }, { label: 'K', color: 'gold', dash: true }], legendAt: 'tl',
    },
    caption: t`Torus: $\iint K\,dA = \int_0^{2\pi}\!\!\int_{-\pi}^{\pi}\cos v\,dv\,du$. Sphere: $\int_0^{2\pi}\!\!\int_0^{\pi}\sin\theta\,d\theta\,d\varphi$. Cap: the same up to $\theta_0$, plus the edge’s $\oint\kappa_g\,ds = 2\pi\cos\theta_0$. The readouts add these up and divide by $2\pi$.`,
  },
  example: {
    prompt: t`Check Gauss–Bonnet on the polar cap $\theta \le \theta_0$ of a sphere of radius $a$, then on the whole sphere using an octahedral triangulation.`,
    visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 90, colat: 90, colatSlider: false, transport: false, readout: false }, caption: 'One octant of the sphere: a geodesic triangle with three right angles. Eight of them tile the sphere.' },
    steps: [
      { label: 'Inside the cap', text: t`$\iint K\,dA = \frac{1}{a^2}\cdot2\pi a^2(1 - \cos\theta_0) = 2\pi(1 - \cos\theta_0)$.` },
      { label: 'Its edge', text: t`The edge is a parallel: $\kappa_g = \cot\theta_0/a$ (C6.2), length $2\pi a\sin\theta_0$, so $\oint\kappa_g\,ds = 2\pi\cos\theta_0$. No corners.` },
      { label: 'Add up', text: t`$2\pi(1 - \cos\theta_0) + 2\pi\cos\theta_0 = 2\pi = 2\pi\chi$, with $\chi = 1$ for a disc ✓ — for every $\theta_0$.` },
      { label: 'One octant', text: t`A geodesic triangle with three right angles: $\kappa_g = 0$ on its sides, and each corner turns $\pi - \tfrac\pi2$. So $\iint K\,dA = 2\pi - 3\cdot\tfrac\pi2 = \tfrac\pi2$ — the octant’s area $\tfrac18\cdot4\pi a^2$ over $a^2$ ✓.` },
      { label: 'Whole sphere', text: t`Eight octants: $\iint K\,dA = 8\cdot\tfrac\pi2 = 4\pi$. The octahedral cutting has $V = 6$, $E = 12$, $F = 8$, so $\chi = 6 - 12 + 8 = 2$ and $2\pi\chi = 4\pi$ ✓.` },
    ],
    answer: t`Cap: $2\pi(1 - \cos\theta_0) + 2\pi\cos\theta_0 = 2\pi$. Sphere: $\iint K\,dA = 4\pi = 2\pi\cdot2$.`,
  },
  practice: [
    match({
      id: 'chi', difficulty: 1,
      prompt: t`Match each surface to its Euler characteristic $\chi$.`,
      left: ['a sphere (or any closed surface without holes)', 'a torus', 'a two-holed torus', 'a disc (or a cap of a sphere)', 'a cylinder without lids (an annulus)'],
      right: ['2', '0', '−2', '1', '−1', '3'],
      answer: [0, 1, 2, 3, 1],
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', surfaces: ['torus', 'sphere', 'cylinder'], readout: false }, caption: 'A torus, a sphere and an open cylinder.' },
      hints: [t`Closed surfaces: $\chi = 2 - 2g$ with $g$ the number of holes.`, t`A disc is one face with its boundary: one vertex, one edge, one face gives $1 - 1 + 1 = 1$. An annulus is a square with one pair of opposite sides glued: $V - E + F = 1 - 2 + 1 = 0$.`],
      teach: 'χ = V − E + F; for closed surfaces χ = 2 − 2g.',
      explain: t`Sphere 2, torus 0, two-holed torus $-2$, disc 1, annulus 0. Gauss–Bonnet turns these into total curvatures: $4\pi$, $0$, $-4\pi$; for a cap or an annulus the boundary terms join in.`,
    }),
    num({
      id: 'genus-total', difficulty: 2,
      gen(r) {
        const g = r.pick([1, 2, 3, 5]), tot = 2 * Math.PI * (2 - 2 * g);
        return {
          prompt: t`A cast metal manifold for a propellant system is a closed surface with $${g}$ through-hole${g === 1 ? '' : 's'} (genus $g = ${g}$). Whatever its exact shape, what is $\iint K\,dA$ over its whole surface?`,
          visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', controls: false, readout: false }, caption: 'One through-hole: a torus. More holes add more saddle-shaped (blue) regions.' },
          answer: tot, tol: { rel: 0.01 },
          errors: [{ value: 4 * Math.PI, feedback: t`$4\pi$ is the sphere’s total. Each hole lowers $\chi$ by 2: $\chi = 2 - 2g$.` }, { value: 2 * Math.PI * (2 - g), feedback: t`Each hole lowers $\chi$ by 2, not 1: $\chi = 2 - 2g$.` }].filter((e) => Math.abs(e.value - tot) > 0.02 * Math.abs(tot)),
          hints: [t`$\iint K\,dA = 2\pi\chi$ with $\chi = 2 - 2g$.`],
          teach: 'The total curvature of a closed surface is 2π(2 − 2g), whatever its shape.',
          explain: t`$\chi = 2 - ${2 * g} = ${2 - 2 * g}$, so $\iint K\,dA = ${2 - 2 * g}\times2\pi = ${nice(tot, 4)}$. ${g === 1 ? 'A torus has as much negative curvature as positive.' : 'Every extra hole adds −4π: more saddle than dome.'}`,
        };
      },
    }),
    num({
      id: 'defect', difficulty: 2,
      gen(r) {
        const name = r.pick(Object.keys(SOLIDS));
        const S = SOLIDS[name];
        return {
          prompt: t`A polyhedron is flat except at its vertices, where all its curvature is concentrated: each vertex carries an **angle defect**, $360^\circ$ minus the angles of the faces meeting there. At each vertex of a regular ${name}, ${S.faces} meet. What is the angle defect at one vertex, in degrees?`,
          visual: solidPic(name),
          answer: S.angle, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 360 - S.angle, feedback: 'That is the sum of the face angles; the defect is what is missing from 360°.' }].filter((e) => Math.abs(e.value - S.angle) > 1),
          hints: ['A square’s corner is 90°, an equilateral triangle’s 60°, a regular pentagon’s 108°.', 'Add the angles of the faces meeting at the vertex and subtract from 360°.'],
          teach: 'A polyhedron’s curvature sits at its vertices as angle defects, and they total 720° = 4π.',
          explain: t`Defect $= ${S.angle}^\circ$ at each of the ${S.v.length} vertices: total $${S.angle * S.v.length}^\circ = 4\pi$ — Descartes’ theorem, the polyhedral Gauss–Bonnet, since $\chi = 2$.`,
        };
      },
    }),
    num({
      id: 'cap-boundary', difficulty: 3,
      gen(r) {
        const colat = r.pick([20, 40, 60, 75]);
        const b = 2 * Math.PI * Math.cos(colat * DEG);
        return {
          prompt: t`A region of a sphere is the cap within $${colat}^\circ$ of the North Pole. Its total curvature is $\iint K\,dA = 2\pi(1 - \cos ${colat}^\circ)$. Using Gauss–Bonnet (the cap is a disc, $\chi = 1$, with a smooth boundary), find $\oint\kappa_g\,ds$ round its edge, in radians.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 90 - colat, transport: false, readout: false }, caption: 'The cap and its edge.' },
          answer: b, tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * (1 - Math.cos(colat * DEG)), feedback: t`That is the curvature inside. Gauss–Bonnet says the two add to $2\pi$.` }, { value: 2 * Math.PI, feedback: 'That would be a flat disc, with nothing inside.' }].filter((e) => Math.abs(e.value - b) > 0.02 * b),
          hints: [t`The cap is a disc, $\chi = 1$, with a smooth edge: no corner terms.`, t`So $\iint K\,dA + \oint\kappa_g\,ds = 2\pi$; solve for the boundary term.`],
          teach: 'For a disc-shaped region, the curvature inside and the turning of the boundary always add up to 2π.',
          explain: t`$\oint\kappa_g\,ds = 2\pi - 2\pi(1 - \cos ${colat}^\circ) = 2\pi\cos ${colat}^\circ = ${nice(b, 4)}$, matching $\kappa_g = \cot\theta_0/a$ times the length $2\pi a\sin\theta_0$. The more curvature the cap holds, the less its edge needs to steer.`,
        };
      },
    }),
    num({
      id: 'triangle-sum', difficulty: 3,
      gen(r) {
        const [n, what] = r.pick([[8, 'one octant (a face of the octahedral tiling)'], [20, 'one face of the icosahedral tiling'], [4, 'one face of the tetrahedral tiling'], [80, 'one face of a subdivided icosahedral tiling (as used in climate-model grids)']]);
        const sum = 180 + 720 / n;
        return {
          prompt: t`A geodesic triangle covers exactly $1/${n}$ of a sphere — ${what}. What is the sum of its interior angles, in degrees?`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: n === 8 ? 90 : n === 4 ? 120 : 72, colat: n === 8 || n === 4 ? 90 : 63, colatSlider: false, transport: false, readout: false }, caption: 'A geodesic triangle on a sphere (shape illustrative).' },
          answer: sum, units: 'deg', tol: { rel: 0.002 },
          errors: [{ value: 180, feedback: 'That is a flat triangle. On a sphere the angles exceed 180° by ∬K dA.' }, { value: 180 + 360 / n, feedback: t`The whole sphere has $\iint K\,dA = 4\pi = 720^\circ$, not $360^\circ$.` }].filter((e) => Math.abs(e.value - sum) > 0.005 * sum),
          hints: [t`Gauss–Bonnet with geodesic sides: $\iint K\,dA + \sum(\pi - \alpha_i) = 2\pi$, so $\sum\alpha_i = \pi + \iint K\,dA$.`, t`$\iint K\,dA$ over the triangle is $4\pi/${n}$ rad $= ${nice(720 / n, 4)}^\circ$.`],
          teach: 'For a geodesic triangle, the angle sum is π plus the curvature inside.',
          explain: t`$\sum\alpha_i = 180^\circ + 720^\circ/${n} = ${nice(sum, 5)}^\circ$. ${n === 4 ? 'Each corner is 120°: three of them meet at each vertex of the tiling, filling 360°.' : n === 8 ? 'Three right angles.' : 'In the icosahedral tiling five 72° corners meet at each vertex.'}`,
        };
      },
    }),
    mcq({
      id: 'torus-zero', difficulty: 2,
      prompt: t`The torus has $K > 0$ on its outer half and $K < 0$ on its inner half. Why must the total come out exactly $0$, for every $R$ and $r$?`,
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', v: 2.5, controls: false, readout: false }, caption: 'A torus coloured by K: gold outside, blue inside.' },
      choices: [
        t`Gauss–Bonnet: $\iint K\,dA = 2\pi\chi$ and a torus has $\chi = 0$`,
        'Because the inner and outer halves have equal areas',
        t`Because $K$ is an odd function of $v$`,
        t`It is only approximately zero, when $R \gg r$`,
      ],
      answer: 0,
      why: {
        1: t`They do not: the outer half has area $2\pi r(\pi R + 2r)$, the inner $2\pi r(\pi R - 2r)$. What balances is $K\,dA$, not area.`,
        2: t`$K = \cos v/\big(r(R + r\cos v)\big)$ is even in $v$. It is $\cos v$ that integrates to zero over a full turn.`,
        3: t`It is exact: the density $K\sqrt{EG} = \cos v$ for every $R$ and $r$.`,
      },
      hints: [t`Compute $K\sqrt{EG}$: the factors of $R + r\cos v$ cancel.`, 'Or count: a torus can be cut into a square with its sides glued in pairs.'],
      teach: 'A torus has χ = 0, so its positive and negative curvature cancel exactly.',
      explain: t`$K\sqrt{EG} = \cos v$, which integrates to zero; topologically, $\chi = 0$ (one vertex, two edges, one face after gluing). Any surface with a hole through it — a doughnut, a coffee mug, a toroidal tank — has total curvature 0.`,
    }),
    order({
      id: 'global', difficulty: 3,
      prompt: t`Derive the global theorem $\iint_S K\,dA = 2\pi(V - E + F)$ from the local one for triangles. Order the steps.`,
      visual: solidPic('icosahedron'),
      items: [
        t`Cut $S$ into $F$ small geodesic triangles, with $E$ edges and $V$ vertices.`,
        t`For each triangle, local Gauss–Bonnet gives $\iint K\,dA = \alpha_1 + \alpha_2 + \alpha_3 - \pi$.`,
        t`Add over all triangles: $\iint_S K\,dA = (\text{sum of all angles}) - \pi F$.`,
        t`The angles round each vertex fill $2\pi$, so the sum of all angles is $2\pi V$.`,
        t`Each triangle has 3 edges and each edge borders 2 triangles: $3F = 2E$, so $\pi F = 2\pi E - 2\pi F$.`,
        t`Hence $\iint_S K\,dA = 2\pi V - 2\pi E + 2\pi F = 2\pi\chi$.`,
      ],
      hints: ['Sum the local theorem over every triangle, then count angles round vertices and triangles along edges.', t`Use $3F = 2E$ to replace $\pi F$ by $2\pi(E - F)$.`],
      teach: 'Summing local Gauss–Bonnet over a triangulation turns angle bookkeeping into V − E + F.',
      explain: t`Since the left side does not depend on the triangulation, neither does $V - E + F$: that is why $\chi$ is a topological invariant. With geodesic triangles the $\kappa_g$ terms vanish; with curved edges they cancel in pairs, each edge being traversed once each way.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-moon', difficulty: 3, transfer: true,
      gen(r) {
        const s = r.pick([100, 250, 400, 600]);
        const sig = s / R_MOON, A = Math.acos(Math.cos(sig) / (1 + Math.cos(sig))), excess = (3 * A - Math.PI) / DEG;
        const flat = ((Math.sqrt(3) / 4) * s * s) / (R_MOON * R_MOON) / DEG;
        return {
          prompt: t`Surveyors on the Moon ($R = 1737.4$ km) lay out an equilateral geodesic triangle with sides of $${s}$ km. Its angles satisfy $\cos\alpha = \dfrac{\cos\sigma}{1 + \cos\sigma}$, with $\sigma = s/R$. By how many degrees does the angle sum exceed $180^\circ$?`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 60, colat: Math.max(20, Math.round((s / R_MOON) / DEG / 5) * 5), colatSlider: false, transport: false, readout: false }, caption: 'A geodesic triangle with a vertex at the pole (shape illustrative, not the survey’s).' },
          answer: excess, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: flat, feedback: 'You used the flat area √3 s²/4 divided by R². For a triangle this large the exact angles differ: use the spherical formula.' }, { value: excess / 3, feedback: 'That is the excess of one angle over 60°; the question asks for the whole sum’s excess, three times as much.' }].filter((e) => Math.abs(e.value - excess) > 0.012 * excess),
          hints: [t`$\sigma = ${s}/1737.4 = ${nice(sig, 4)}$ rad; $\cos\alpha = ${nice(Math.cos(sig) / (1 + Math.cos(sig)), 6)}$.`, t`$\alpha = ${nice(A / DEG, 6)}^\circ$; the excess is $3\alpha - 180^\circ$.`],
          teach: 'The angle excess of a geodesic triangle is ∬K dA — on a sphere, its area over R².',
          explain: t`$3\times${nice(A / DEG, 6)}^\circ - 180^\circ = ${nice(excess, 3)}^\circ$. By Gauss–Bonnet that equals the area over $R^2$, so the triangle’s area is $${tex(excess * DEG * R_MOON * R_MOON, 4)}\ \text{km}^2$ (the flat $\tfrac{\sqrt3}{4}s^2$ is $${tex((Math.sqrt(3) / 4) * s * s, 4)}\ \text{km}^2$). Measured angles alone give the Moon’s curvature.`,
        };
      },
    }),
    num({
      id: 'cp-station', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([2, 3, 4, 6]);
        const chi = 2 - 2 * k, tot = 2 * Math.PI * chi;
        return {
          prompt: t`A wheel-shaped space station is a ring-shaped habitat (a torus) joined to a central spherical hub by $${k}$ hollow spokes; its outer skin is one closed surface. Each spoke cuts a disc out of the hub and one out of the ring and joins them with a tube. What is $\iint K\,dA$ over the whole skin?`,
          visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-1.4, 1.4], equal: true, axes: false, grid: false, curves: [{ param: ['1.15*cos(t)', '1.15*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['0.85*cos(t)', '0.85*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['0.22*cos(t)', '0.22*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }, ...Array.from({ length: k }, (_, i) => { const a = r6((2 * Math.PI * i) / k); return [{ param: [`0.22*cos(${a}) + t*0.63*cos(${a}) - 0.04*sin(${a})`, `0.22*sin(${a}) + t*0.63*sin(${a}) + 0.04*cos(${a})`], t: [0, 1], color: 'ink2', width: 1.6 }, { param: [`0.22*cos(${a}) + t*0.63*cos(${a}) + 0.04*sin(${a})`, `0.22*sin(${a}) + t*0.63*sin(${a}) - 0.04*cos(${a})`], t: [0, 1], color: 'ink2', width: 1.6 }]; }).flat()] }, caption: t`The station seen from above (schematic): ring, hub and $${k}$ spokes.` },
          answer: tot, tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'A plain torus has total curvature 0, but each spoke adds a handle.' }, { value: 2 * Math.PI * (2 - 2 * (k + 1)), feedback: t`Count again: the ring and hub start with $\chi = 0 + 2$, and each spoke lowers $\chi$ by 2.` }].filter((e) => Math.abs(e.value - tot) > 0.02 * Math.abs(tot)),
          hints: [t`$\chi$(torus) $= 0$, $\chi$(sphere) $= 2$. Removing two discs lowers $\chi$ by 2; adding a tube (an annulus, $\chi = 0$) changes nothing.`, t`So $\chi = 0 + 2 - 2\times${k}$, and $\iint K\,dA = 2\pi\chi$.`],
          teach: 'Gauss–Bonnet makes total curvature a matter of counting: each handle adds −4π.',
          explain: t`$\chi = 2 - ${2 * k} = ${chi}$ (genus ${k}), so $\iint K\,dA = ${chi}\times2\pi = ${nice(tot, 4)}$ — whatever the radii. The spokes’ junctions are saddle-shaped, and they supply exactly that much negative curvature.`,
        };
      },
    }),
    mcq({
      id: 'cp-2d-gravity', difficulty: 3, transfer: true,
      prompt: t`On a two-dimensional spacetime (or surface) the Ricci scalar is $R = 2K$, so the Einstein–Hilbert action is $\int R\sqrt{|g|}\,d^2x = 2\iint K\,dA$. What does Gauss–Bonnet imply?`,
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'sphere', surfaces: ['sphere', 'torus'], readout: false }, caption: 'Deform the shape and K moves around; its total does not.' },
      choices: [
        t`The action equals $4\pi\chi$, a constant for every metric of the same topology, so varying the metric gives no field equations: 2D general relativity is empty`,
        'The action is zero, so 2D gravity is attractive',
        'The action grows with the area, so 2D universes expand',
        'Gauss–Bonnet says nothing about actions',
      ],
      answer: 0,
      why: {
        1: t`It is $4\pi\chi$, zero only for a torus; and a constant action yields no dynamics at all, attractive or otherwise.`,
        2: t`$\iint K\,dA$ does not depend on the area — that is the point of Gauss–Bonnet.`,
        3: t`It fixes the action’s value for every metric, which is exactly what makes the variation vanish.`,
      },
      hints: [t`$2\iint K\,dA = 2\cdot2\pi\chi$. Does it change when you change the metric smoothly?`, 'Field equations come from how the action changes under small changes of the metric.'],
      teach: 'In two dimensions the Einstein–Hilbert action is topological, so Einstein’s equations are empty there.',
      explain: t`Equivalently, $G_{\mu\nu} \equiv 0$ in 2D. Gravity needs at least four dimensions to have gravitational waves (gr.S27); lower-dimensional models (C11.3) add extra fields to make it do anything.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-5', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), ch. 13', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
