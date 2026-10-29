// Connectedness, compactness and orientability — a refresher. st-c.C7.2 is the
// full lesson on Hausdorff, compact and connected (two origins, Heine–Borel,
// counting pieces); this one adds what a manifold's global shape decides for
// physics: orientability (a normal carried round a Möbius strip comes back
// reversed), time-orientability (light cones that turn over going round a
// cylinder), the Euler characteristic χ = V − E + F, the hairy-ball theorem
// and its consequence that a compact 2D spacetime must have χ = 0, and
// Geroch's theorem that compact spacetimes contain closed timelike curves.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);

// the Möbius strip r(u, v) = ((1 + v cos(u/2)) cos u, (1 + v cos(u/2)) sin u, v sin(u/2)), |v| ≤ W
const W = 0.45, N = 40;
const mob = (u, v) => [(1 + v * Math.cos(u / 2)) * Math.cos(u), (1 + v * Math.cos(u / 2)) * Math.sin(u), v * Math.sin(u / 2)].map(r6);
const strip = Array.from({ length: N }, (_, k) => {
  const u0 = (2 * Math.PI * k) / N, u1 = (2 * Math.PI * (k + 1)) / N;
  const a = mob(u0, -W), b = mob(u1, -W), c = mob(u0, W);
  return { at: a, u: b.map((x, i) => r6(x - a[i])), v: c.map((x, i) => r6(x - a[i])), color: 'teal', alpha: 0.22 };
});
const normalAt = (u) => ({ from: [`cos(${u})`, `sin(${u})`, 0], to: [`cos(${u})*(1 + 0.7*sin(${u}/2))`, `sin(${u})*(1 + 0.7*sin(${u}/2))`, `-0.7*cos(${u}/2)`], color: 'accent', label: '\\mathbf n' });
const rulingAt = (u) => ({ from: [`cos(${u})`, `sin(${u})`, 0], to: [`cos(${u})*(1 + 0.55*cos(${u}/2))`, `sin(${u})*(1 + 0.55*cos(${u}/2))`, `0.55*sin(${u}/2)`], color: 'gold', label: '\\mathbf e_v' });
const mobius = (extra = {}) => ({
  range: 1.6, yaw: 0.6, pitch: 0.5,
  parallelograms: strip,
  curves: [{ param: ['cos(t)', 'sin(t)', 0], t: [0, TAU], color: 'ink3', dash: true }],
  ...extra,
});

// edges of an n-gonal prism, or of a closed ring of n square-section blocks (a polyhedral torus)
function polyhedron(kind, n) {
  const seg = [];
  const P = (r, a, z) => [r6(r * Math.cos(a)), r6(r * Math.sin(a)), r6(z)];
  for (let k = 0; k < n; k++) {
    const a0 = (2 * Math.PI * k) / n, a1 = (2 * Math.PI * (k + 1)) / n;
    if (kind === 'prism') {
      seg.push([P(1.4, a0, 0), P(1.4, a1, 0)], [P(1.4, a0, 1.4), P(1.4, a1, 1.4)], [P(1.4, a0, 0), P(1.4, a0, 1.4)]);
    } else {
      const corners = [[1.4, 0], [2.2, 0], [2.2, 0.8], [1.4, 0.8]];
      corners.forEach(([r, z], i) => {
        const [r2, z2] = corners[(i + 1) % 4];
        seg.push([P(r, a0, z), P(r2, a0, z2)], [P(r, a0, z), P(r, a1, z)]);
      });
    }
  }
  return seg.map(([from, to]) => ({ from, to, color: 'accent' }));
}

// light cones on a cylinder (x from 0 to 2π, ends glued) whose axes turn through angle x/2
const cone = (cx, cy, phi, s = 0.32) => {
  const d = [phi - Math.PI / 4, phi + Math.PI / 4].map((a) => [r6(Math.sin(a)), r6(Math.cos(a))]);
  return d.map(([dx, dy]) => ({ param: [`${r6(cx)} + t*${dx}`, `${r6(cy)} + t*${dy}`], t: [-s, s], color: 'warn', width: 1.6 }));
};
const turningCones = () => {
  const curves = [], arrows = [];
  for (let k = 0; k <= 8; k++) {
    const x = (k * Math.PI) / 4, phi = x / 2;
    curves.push(...cone(x, 0, phi));
    arrows.push({ from: [r6(x), 0], to: [r6(x + 0.36 * Math.sin(phi)), r6(0.36 * Math.cos(phi))], color: 'gold', width: 2.2 });
  }
  return { curves, arrows };
};

export default lesson({
  id: 'st-g.G-TOP2.1',
  title: 'Connectedness, compactness and orientability',
  minutes: 12, difficulty: 3,
  intro: t`Three global properties of a space decide what can live on it. **Connected**: it is not the union of two disjoint nonempty open sets — it comes in one piece. **Compact**: every cover by open sets has a finite subcover; in $\mathbb R^n$, closed and bounded. **Orientable**: a choice of handedness (of normal, or of ordered basis) can be made continuously everywhere. For a closed surface they are tied to one integer, the **Euler characteristic**:

$$\chi = V - E + F = 2 - 2g \quad (\text{orientable, genus } g)$$

[Hausdorff, compact and connected](#/lesson/st-c.C7.2) is the full lesson on the first two; this refresher adds orientation and what $\chi$ forbids a spacetime to be.`,
  symbols: [
    { tex: '\\chi', text: 'the Euler characteristic, a topological invariant: it does not change under any continuous deformation' },
    { tex: 'V, E, F', text: 'the numbers of vertices, edges and faces of any polyhedral decomposition of the surface' },
    { tex: 'g', text: 'the genus: the number of handles (sphere 0, torus 1)' },
    { tex: '\\mathbf n', text: 'a unit normal; choosing one continuously over the whole surface is an orientation' },
  ],
  why: 'Spacetime must be connected to be one universe, non-compact to avoid closed timelike curves, and time-orientable for “future” to mean something everywhere — global assumptions behind the singularity theorems and every causal statement in general relativity.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Carry a normal round a Möbius strip',
    lead: t`The blue arrow $\mathbf n$ is a unit normal to the strip at angle $u$ round its centre line; the gold arrow $\mathbf e_v$ points across the strip. Both change continuously as you slide $u$. Watch what they are when you get back.`,
    tasks: [
      t`Slide $u$ from $0$ to $2\pi$: you are back at the same point of the strip, but $\mathbf n$ points the other way — and so does $\mathbf e_v$. No continuous choice of normal exists: the strip is **non-orientable**.`,
      t`Go round twice ($u$ to $4\pi$ is the same as reading the picture again from $0$): the normal comes back to itself. That is why the strip has only one side and one edge.`,
    ],
    params: mobius({
      sliders: [{ key: 'u', label: t`Angle round the strip $u$`, min: 0, max: TAU, step: 0.05, value: 0.3, explain: 'Where along the centre line the arrows sit; u = 0 and u = 2π are the same point.' }],
      vectors: [normalAt('u'), rulingAt('u')],
      readouts: [{ label: t`$n_z$`, expr: '-cos(u/2)', digits: 3 }],
    }),
    caption: t`The strip is drawn from 40 flat panels; the dashed circle is its centre line. $\mathbf n = (\cos u\sin\tfrac u2, \sin u\sin\tfrac u2, -\cos\tfrac u2)$ is the exact normal along the centre line.`,
  },
  example: {
    prompt: t`Show that a compact 1+1-dimensional spacetime cannot be a sphere, but can be a torus.`,
    visual: { type: 'field2d', params: { P: '1', Q: '0.5*sin(x)', x: [0, 6.28], y: [0, 3.14], probe: false, readout: false }, caption: t`A nowhere-zero vector field on the rectangle $[0, 2\pi]\times[0, \pi]$ whose opposite edges are glued: a torus. Its values match across the glued edges, so it is a continuous field on the torus.` },
    steps: [
      { label: 'What a Lorentz metric needs', text: t`At every point a Lorentzian metric has a light cone, and the timelike directions inside it. Picking the cone’s axis gives a **direction field** (a line at each point) that is never zero. Conversely, from a Riemannian metric and such a line field one can build a Lorentzian metric (Hawking & Ellis §2.6). So: Lorentzian metric $\iff$ nowhere-vanishing line field.` },
      { label: 'Count zeros', text: t`On a compact surface, the Poincaré–Hopf theorem says the indices of the zeros of any continuous vector field add up to $\chi$. A field with no zeros needs $\chi = 0$. (For line fields the same holds, with half-integer indices allowed.)` },
      { label: 'The sphere', text: t`A cube is a sphere deformed: $V - E + F = 8 - 12 + 6 = 2$. With $\chi = 2 \ne 0$, every line field on $S^2$ vanishes somewhere — the hairy-ball theorem — so $S^2$ carries no Lorentzian metric.` },
      { label: 'The torus', text: t`The square with opposite edges glued has $1$ vertex, $2$ edges and $1$ face: $\chi = 1 - 2 + 1 = 0$. (A rectangle glued the same way is a torus too.) The field in the picture is never zero, so a Lorentzian metric exists — flat $-dt^2 + dx^2$ with both $t$ and $x$ periodic.` },
      { label: 'Sense check', text: t`That torus spacetime has closed timelike curves (walk forward in $t$ until it wraps round): compact spacetimes always do, which is one reason physical spacetimes are taken non-compact.` },
    ],
    answer: t`A Lorentzian metric needs a nowhere-zero line field, which on a compact surface needs $\chi = 0$. $\chi(S^2) = 2$, so the sphere is ruled out; $\chi(T^2) = 0$, and $-dt^2 + dx^2$ on the torus works (with closed timelike curves).`,
  },
  practice: [
    num({
      id: 'euler', difficulty: 1,
      gen(r) {
        const kind = r.pick(['prism', 'ring']), n = r.pick([4, 5, 6, 7, 8]);
        const [V, E, F] = kind === 'prism' ? [2 * n, 3 * n, n + 2] : [4 * n, 8 * n, 4 * n];
        const ans = V - E + F;
        return {
          prompt: t`A polyhedron ${kind === 'prism' ? `(a prism on a ${n}-sided base)` : `(a ring of ${n} square-section blocks, with a hole through the middle)`} has $V = ${V}$ vertices, $E = ${E}$ edges and $F = ${F}$ faces. What is its Euler characteristic $\chi$?`,
          visual: { type: 'calc-vectors3d', params: { range: 2.4, segments: polyhedron(kind, n), yaw: 0.5, pitch: 0.55 }, caption: 'The polyhedron’s edges; hidden ones are drawn too.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: V + E + F, feedback: 'The edges are subtracted: χ = V − E + F.' }, { value: V + E - F, feedback: 'Signs alternate with dimension: vertices +, edges −, faces +.' }].filter((e) => e.value !== ans),
          hints: [t`$\chi = V - E + F$.`],
          teach: 'V − E + F is the same for every polyhedron of the same topology: 2 for anything shaped like a sphere, 0 for anything shaped like a torus.',
          explain: t`$${V} - ${E} + ${F} = ${ans}$: ${ans === 2 ? 'a sphere, deformed — genus 0' : 'a torus, deformed — genus 1, one hole'}. $\chi$ counts holes, not corners.`,
        };
      },
    }),
    multi({
      id: 'orientable', difficulty: 2,
      prompt: 'Which of these surfaces are orientable?',
      visual: { type: 'calc-vectors3d', params: mobius({ vectors: [normalAt(0.4)] }), caption: 'A Möbius strip with one normal drawn (for reference).' },
      choices: ['The sphere', 'The torus', 'The cylinder', 'The Möbius strip', 'The Klein bottle', 'The real projective plane (a disc with opposite boundary points glued)'],
      answer: [0, 1, 2],
      why: {
        3: 'Carry the normal round the centre line: it returns reversed.',
        4: 'A Klein bottle contains Möbius strips; any surface that contains one is non-orientable.',
        5: 'The projective plane is a Möbius strip with a disc sewn onto its edge, so it contains a Möbius strip.',
      },
      hints: [t`A surface is non-orientable exactly when it contains a Möbius strip.`, 'Look for a loop along which a normal (or a little clockwise circle) comes back reversed.'],
      teach: 'A surface is orientable when a normal (or a sense of rotation) can be chosen continuously everywhere — equivalently, when no Möbius strip sits inside it.',
      explain: 'Sphere, torus and cylinder each have two sides. The Möbius strip, the Klein bottle and the projective plane do not; the last two cannot even be built in ordinary 3D space without passing through themselves.',
    }),
    num({
      id: 'hyperboloid-pieces', difficulty: 3,
      gen(r) {
        const s = r.pick([-1, 1]);
        const ans = s < 0 ? 2 : 1;
        return {
          prompt: t`In 2+1 Minkowski space ($c = 1$), how many connected pieces does the surface $-t^2 + x^2 + y^2 = ${s}$ have? (${s < 0 ? 'These are the unit timelike vectors: the possible four-velocities.' : 'These are the unit spacelike vectors.'})`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-2.2, 2.2], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 }, ...(s < 0 ? [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.2 }, { fn: '-sqrt(1 + x^2)', color: 'accent', width: 2.2 }] : [{ param: ['cosh(t)', 'sinh(t)'], t: [-1.6, 1.6], color: 'accent', width: 2.2 }, { param: ['-cosh(t)', 'sinh(t)'], t: [-1.6, 1.6], color: 'accent', width: 2.2 }])] }, caption: t`The slice $y = 0$ through the surface (blue), with the light cone dashed. The full surface is this curve swept round the $t$-axis.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: s < 0 ? 1 : 2, feedback: s < 0 ? 'The upper and lower sheets never meet: t² = 1 + x² + y² ≥ 1, so t cannot pass through 0.' : 'The slice has two branches, but sweeping it round the t-axis joins them: a one-sheeted hyperboloid, like a cooling tower.' }],
          hints: [t`Sweep the slice round the $t$-axis: the surface is rotationally symmetric in $(x, y)$.`, s < 0 ? t`Can $t$ change sign on the surface? $t^2 = 1 + x^2 + y^2$.` : t`Is there a path on the surface from $(x, y) = (1, 0)$ to $(-1, 0)$ at $t = 0$? Try the circle $x^2 + y^2 = 1$.`],
          teach: 'Count pieces on the whole space, not on a slice: unit timelike vectors fall into two pieces (future and past), unit spacelike vectors in 2+1 or more dimensions form one.',
          explain: s < 0 ? t`Two sheets, $t \ge 1$ and $t \le -1$: future- and past-pointing four-velocities. No continuous motion turns one into the other — the seed of the time-orientation of the Lorentz group.` : t`One piece: the circle $x^2 + y^2 = 1$ at $t = 0$ joins the two branches of the slice. (In 1+1 dimensions the same equation gives two pieces — dimension matters.)`,
        };
      },
    }),
    mcq({
      id: 'extreme', difficulty: 2,
      prompt: t`On which space does **every** continuous function to $\mathbb R$ attain a maximum?`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [-2, 2], aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ fn: 'atan(x)', color: 'accent', width: 2.2, label: 'arctan x', labelAt: 3.5, labelDy: 14 }], hlines: [{ y: 1.5708, color: 'gold', label: 'π/2, never reached' }] }, caption: t`$\arctan x$ on $\mathbb R$: bounded, continuous, with supremum $\pi/2$ and no maximum.` },
      choices: [t`The sphere $S^2$`, t`The plane $\mathbb R^2$`, t`The open disc $x^2 + y^2 < 1$`, t`The sphere with one point removed`],
      answer: 0,
      why: {
        1: t`$\arctan x$ (in either coordinate) is continuous on $\mathbb R^2$ and never reaches its supremum.`,
        2: t`$x^2 + y^2$ on the open disc approaches $1$ at the edge but never gets there: the disc is not closed, so not compact.`,
        3: t`The sphere minus a point is a plane in disguise (stereographic projection), so not compact.`,
      },
      hints: [t`The extreme value theorem needs the domain to be compact.`, t`Which of these is closed and bounded (as a subset of $\mathbb R^3$)?`],
      teach: 'A continuous real function on a compact space attains its maximum and minimum; on a non-compact space it may escape to an edge or to infinity.',
      explain: 'S² is compact: closed and bounded in ℝ³. So the hottest point on a planet’s surface exists for any continuous temperature map. Each other space lets a function creep toward a value it never reaches.',
    }),
    mcq({
      id: 'spacetime-surface', difficulty: 3,
      prompt: t`Which compact surface can carry a 1+1-dimensional Lorentzian metric (a light cone at every point, varying continuously)?`,
      visual: { type: 'field2d', params: { P: '0.9 + 0.3*cos(2*y)', Q: '0.4*sin(x)', x: [0, 6.28], y: [0, 3.14], probe: false, readout: false }, caption: t`A nowhere-zero field on the rectangle $[0, 2\pi]\times[0, \pi]$ with opposite edges glued: it matches across the glued edges.` },
      choices: [t`The torus, $\chi = 0$`, t`The sphere, $\chi = 2$`, t`The genus-2 surface, $\chi = -2$`, 'Any compact surface: a metric can always be chosen'],
      answer: 0,
      why: {
        1: t`Every continuous line field on $S^2$ vanishes somewhere (hairy ball: the indices add to $\chi = 2$), and a light cone needs a nonzero timelike direction everywhere.`,
        2: t`The indices of zeros must add to $\chi = -2 \ne 0$, so a nowhere-zero field cannot exist here either.`,
        3: 'Riemannian metrics exist on every manifold; Lorentzian ones need a nowhere-vanishing line field, which topology can forbid.',
      },
      hints: [t`A Lorentzian metric picks out a timelike direction at each point: a nowhere-zero line field.`, t`On a compact surface the zeros of a field have indices adding up to $\chi$.`],
      teach: 'A compact manifold carries a Lorentzian metric only if χ = 0: topology alone can forbid a spacetime.',
      explain: t`Only $\chi = 0$ allows a nowhere-zero field; among orientable compact surfaces that is the torus alone (the Klein bottle also has $\chi = 0$). Every Lorentzian torus, though, is acausal: compact spacetimes contain closed timelike curves.`,
    }),
    mcq({
      id: 'time-orientable', difficulty: 3,
      prompt: t`A 1+1 spacetime is a cylinder: $x$ runs from $0$ to $2\pi$ with the ends glued. Its light cones turn smoothly through half a turn going round, so the cone at $x = 2\pi$ is the cone at $x = 0$ again. Pick “future” (gold arrow) at $x = 0$ and carry the choice continuously round. What follows?`,
      visual: { type: 'graph', params: { x: [-0.6, 6.9], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: 'x', ylabel: '', yticks: 0, ...turningCones(), vlines: [{ x: 0, color: 'ink3', label: 'glued' }, { x: 6.2832, color: 'ink3', label: 'glued' }] }, caption: 'Light cones (orange) whose axes turn through x/2; the gold arrows are the continuous choice of “future” started at x = 0. Cones are drawn at a few points only.' },
      choices: [t`It is not time-orientable: arriving back at $x = 0$, the carried “future” arrow points into the cone’s past half`, 'It is time-orientable: the cones match across the glued edge, so future does too', 'The metric is discontinuous at the glued edge, so it is not a spacetime', 'Time-orientability fails only if the space is non-orientable as well'],
      answer: 0,
      why: {
        1: 'The cones match as double cones, but the arrow does not: it arrives pointing down where it started pointing up.',
        2: 'A half-turned double cone is the same double cone, so the metric is perfectly smooth across the edge.',
        3: 'The cylinder is orientable; time-orientability is a separate property of the light cones.',
      },
      hints: [t`Follow the gold arrows to $x = 2\pi$. Which way does the last one point?`, t`At $x = 2\pi$ the cone has turned by $\pi$: its old future half is now its lower half.`],
      teach: 'A spacetime is time-orientable when “future” can be chosen continuously everywhere; light cones that turn over round a loop forbid it.',
      explain: 'The carried arrow arrives pointing down, into what the arrow at x = 0 calls the past. No global future exists. General relativity normally assumes time-orientability (or passes to a double cover that has it).',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-compact', difficulty: 3, transfer: true,
      prompt: t`A closed (positively curved) universe has compact space, a 3-sphere, yet relativists still require the **spacetime** to be non-compact. Why?`,
      visual: { type: 'graph', params: { x: [-1.2, 1.2], y: [-0.1, 1.1], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ param: ['0.12*sin(6.2832*t)', 't'], t: [0, 1], color: 'gold', width: 2.4, label: 'worldline', labelAt: 0.3, labelDx: 8 }], hlines: [{ y: 0, color: 'ink3', label: 't = 0, glued to t = 1' }, { y: 1, color: 'ink3', label: 't = 1' }] }, caption: 'A spacetime with compact time: the top edge glued to the bottom. The gold worldline never moves faster than about 0.75c, so it is timelike everywhere, and it closes on itself.' },
      choices: ['Every compact spacetime contains a closed timelike curve — an observer could meet their own past', 'A compact spacetime cannot be Hausdorff', 'A compact spacetime would have infinite four-volume', 'Compact spaces cannot be connected'],
      answer: 0,
      why: {
        1: 'Compact Hausdorff spaces are everywhere (the sphere, the torus); compactness and Hausdorff get along fine.',
        2: 'Compactness gives a finite volume, if anything.',
        3: 'The sphere is compact and connected.',
      },
      hints: ['Think of the picture: what happens to a worldline in a spacetime whose time direction closes up?', 'Geroch (1967) proved the general case: compactness of the whole spacetime forces a closed timelike curve.'],
      teach: 'Compact spacetimes always contain closed timelike curves, so causality requires a non-compact spacetime even when space itself is compact.',
      explain: 'Geroch’s theorem: a compact spacetime contains a closed timelike curve. A closed universe escapes it because its time direction is not compact — it runs from a big bang and need not close. So R × S³ is fine; S¹ × S³ is not.',
    }),
    num({
      id: 'cp-gauss-bonnet', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([0, 2, 3, 4]);
        const ans = 2 * (2 - 2 * g);
        const what = ['a spherical propellant tank', '', 'a two-hole (genus-2) composite shell', 'a three-hole (genus-3) truss node shell', 'a four-hole (genus-4) manifold block'][g];
        return {
          prompt: t`By the Gauss–Bonnet theorem the total Gaussian curvature of a closed orientable surface is $\iint K\,dA = 2\pi\chi$. For ${what} (genus $g = ${g}$), what is $\iint K\,dA$ in units of $\pi$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 - 2 * g, feedback: t`That is $\chi$ itself; the integral is $2\pi\chi$, so the number of $\pi$s is $2\chi$.` }, { value: 4 * g - 4, feedback: t`Sign: $\chi = 2 - 2g$, which is negative for $g \ge 2$.` }].filter((e) => e.value !== ans),
          hints: [t`$\chi = 2 - 2g$.`, t`$\iint K\,dA = 2\pi(2 - 2g)$.`],
          teach: 'Gauss–Bonnet ties geometry to topology: however a surface is shaped, its total curvature is 2πχ.',
          explain: t`$\chi = ${2 - 2 * g}$, so $\iint K\,dA = ${ans}\pi$. Dents and bulges move curvature around but cannot change the total: only adding a handle (each costs $-4\pi$) can.`,
        };
      },
    }),
    num({
      id: 'cp-calms', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.int(3, 7);
        const ans = n - 2;
        return {
          prompt: t`A global wind map shows the horizontal wind as a continuous tangent field on the Earth’s surface. Its zeros are ${n} storm centres and calm highs, each of index $+1$ (the wind circles or spreads round them), and some saddles (index $-1$) where flows meet. By the Poincaré–Hopf theorem the indices add up to $\chi(S^2) = 2$. How many saddles must there be, if there are no other zeros?`,
          visual: { type: 'graph', params: { x: [-180, 180], y: [-90, 90], aspect: 'wide', xlabel: 'longitude (°)', ylabel: 'latitude (°)', points: Array.from({ length: n }, (_, k) => ({ x: -150 + (300 * k) / Math.max(1, n - 1), y: [35, -40, 55, -20, 10, -60, 45][k], r: 6, color: 'accent', label: '+1' })) }, caption: 'Index +1 zeros of the wind field on a latitude–longitude map (positions made up). The saddles are not drawn.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n + 2, feedback: t`Index sum: $${n}\cdot(+1) + s\cdot(-1) = 2$, so $s = ${n} - 2$.` }, { value: n, feedback: 'That would make the indices add to 0, the torus’s value. The sphere’s is 2.' }],
          hints: [t`Each storm or high contributes $+1$ and each saddle $-1$; the total must be $2$.`, t`$${n} - s = 2$.`],
          teach: 'On a sphere the indices of a tangent field’s zeros always add up to χ = 2, so a nowhere-zero wind is impossible and zeros come in a constrained balance.',
          explain: t`$${n} - s = 2$ gives $s = ${ans}$. The hairy-ball theorem is the special case “the indices cannot all be absent”: somewhere on Earth the horizontal wind is calm.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hawking & Ellis, The Large Scale Structure of Space-Time (CUP, 1973), §§2.6, 6.4', url: 'https://doi.org/10.1017/CBO9780511524646' },
    { label: 'Geroch, Topology in general relativity, J. Math. Phys. 8, 782 (1967)', url: 'https://doi.org/10.1063/1.1705276' },
    { label: 'Nakahara, Geometry, Topology and Physics, 2nd ed. (IOP, 2003), chs. 2, 5', url: 'https://doi.org/10.1201/9781315275826' },
  ],
});
