// Polar coordinates: the coordinate basis ∂r, ∂θ (unit and length r), its
// dual dr, dθ, how both vary from point to point, and coordinate versus
// unit-vector ("physical") components.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;
const PTS = [[3, 4, 5], [-3, 4, 5], [4, -3, 5], [-4, -3, 5], [6, 8, 10], [-5, 12, 13], [12, 5, 13]];

// the polar grid and the coordinate basis ∂r, k·∂θ at the given points (x, y)
function basisPic(points, { k = 1, caption, span, vec, grid = 4 } = {}) {
  const arrows = [];
  for (const [x, y] of points) {
    const r = Math.hypot(x, y), c = x / r, s = y / r;
    arrows.push({ from: [r6(x), r6(y)], to: [r6(x + c), r6(y + s)], color: 'accent', width: 2.4, label: '∂r' }, { from: [r6(x), r6(y)], to: [r6(x - k * y), r6(y + k * x)], color: 'violet', width: 2.4, label: k === 1 ? '∂θ' : `${k}∂θ` });
  }
  if (vec) arrows.push({ from: vec.from.map(r6), to: vec.to.map(r6), color: 'gold', width: 3, label: vec.label || 'V' });
  // frame everything drawn: the points and the tips of all their arrows
  const ends = arrows.flatMap((q) => [q.from, q.to]);
  const S = span || Math.max(Math.max(...ends.map((p) => Math.abs(p[0]))) + 0.7, (Math.max(...ends.map((p) => Math.abs(p[1]))) + 0.5) / 0.62, 2.5);
  const rings = Array.from({ length: Math.ceil(S * 1.5 / grid * 4) }, (_, j) => (j + 1) * grid / 4).filter((q) => q < S * 1.5);
  return {
    type: 'graph',
    params: {
      x: [-S, S], y: [-S * 0.62, S * 0.62], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: [...rings.map((q) => ({ param: [`${r6(q)}*cos(t)`, `${r6(q)}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 })), ...Array.from({ length: 12 }, (_, j) => ({ param: [`t*${r6(Math.cos(j * 30 * DEG))}`, `t*${r6(Math.sin(j * 30 * DEG))}`], t: [0, S * 1.5], color: 'ink4', width: 1 }))],
      arrows,
      points: points.map(([x, y]) => ({ x: r6(x), y: r6(y), color: 'ink', r: 3.5 })),
    },
    caption,
  };
}

export default lesson({
  id: 'st-a.A4.3',
  title: 'Polar coordinates: the basis vectors ∂r and ∂θ',
  minutes: 11, difficulty: 2,
  intro: t`Polar coordinates come with their own basis at every point: the coordinate basis vectors $\partial_r$ and $\partial_\theta$, the columns of $\partial(x, y)/\partial(r, \theta)$ (lesson A4.2). In Cartesian terms,

$$\partial_r = \cos\theta\,\partial_x + \sin\theta\,\partial_y, \qquad \partial_\theta = -r\sin\theta\,\partial_x + r\cos\theta\,\partial_y = -y\,\partial_x + x\,\partial_y$$

$\partial_r$ points outward and is one unit long; $\partial_\theta$ points around and is **$r$ long**, because turning by one radian at radius $r$ moves you a distance $r$. Both **change from point to point**: $\partial_r$ turns as you go around, $\partial_\theta$ turns and grows. Their dual basis is $dr = \cos\theta\,dx + \sin\theta\,dy$ and $d\theta = (-\sin\theta\,dx + \cos\theta\,dy)/r$, with $dr(\partial_r) = d\theta(\partial_\theta) = 1$. Physicists often prefer unit vectors, $\hat r = \partial_r$ and $\hat\theta = \partial_\theta/r$; components along them (“physical components”) relate to coordinate components by $V^{\hat\theta} = r\,V^\theta$.`,
  symbols: [
    { tex: t`\partial_r`, text: t`the coordinate basis vector for $r$: the step when $r$ alone grows by one unit. Length 1, pointing outward` },
    { tex: t`\partial_\theta`, text: t`the coordinate basis vector for $\theta$: the step when $\theta$ alone grows by one radian. Length $r$, pointing around (anticlockwise)` },
    { tex: t`\partial_x,\ \partial_y`, text: 'the Cartesian basis: the same at every point' },
    { tex: 'r,\\ \\theta', text: t`the polar coordinates of the point where the basis lives; $\theta$ in radians` },
  ],
  why: t`Every metric in general relativity is written in a coordinate basis like this one — $\partial_t, \partial_r, \partial_\theta, \partial_\phi$ for a black hole — and basis vectors that change from point to point are exactly what Christoffel symbols and the covariant derivative keep track of (lesson A8).`,
  visual: {
    type: 'gr-coordinates',
    title: 'Basis vectors that change from place to place',
    lead: t`The polar grid’s own arrows at P: blue is $\hat r = \partial_r$, violet is the step for $\Delta\theta = 0.25$ rad, which is $0.25\,\partial_\theta$. Fainter copies show the same arrows along P’s ray and around its circle. Drag P.`,
    tasks: [
      t`Drag P outward: the violet arrows grow in proportion to $r$ — $|\partial_\theta| = r$ — while the blue ones keep their length.`,
      t`Drag P around the origin: both arrows turn with it. A “constant” component along $\partial_r$ means something different at every point.`,
      t`Bring P close to the origin: $\partial_\theta$ shrinks toward zero length. At $r = 0$ the basis fails — the coordinate singularity of lesson A4.1.`,
    ],
    params: { mode: 'basis', p: [2.2, 1.3], range: 4 },
    caption: t`Blue: $\hat r = \partial_r$, one unit long. Violet: $0.25\,\partial_\theta$, so its length is $0.25\,r$. Faint copies show how both vary along the ray and around the circle through P. Drag P.`,
  },
  example: {
    prompt: t`At the point $(r, \theta) = (2, 30^\circ)$: write $\partial_r$ and $\partial_\theta$ in Cartesian components, check that $d\theta$ is their dual partner, and express the constant vector $\partial_x$ in the polar basis there.`,
    visual: basisPic([[2 * Math.cos(30 * DEG), 2 * Math.sin(30 * DEG)]], { k: 1, vec: { from: [2 * Math.cos(30 * DEG), 2 * Math.sin(30 * DEG)], to: [2 * Math.cos(30 * DEG) + 1, 2 * Math.sin(30 * DEG)], label: '∂x' }, caption: t`At $(2, 30^\circ)$: $\partial_r$ (blue, length 1), $\partial_\theta$ (violet, length 2) and the Cartesian $\partial_x$ (gold).` }),
    steps: [
      { label: 'The basis', text: t`$\partial_r = (\cos30^\circ, \sin30^\circ) = (0.866, 0.5)$ and $\partial_\theta = (-2\sin30^\circ, 2\cos30^\circ) = (-1, 1.732)$, of length $\sqrt{1 + 3} = 2 = r$.` },
      { label: 'The dual', text: t`$d\theta = (-\sin\theta\,dx + \cos\theta\,dy)/r = -0.25\,dx + 0.433\,dy$. Then $d\theta(\partial_\theta) = (-0.25)(-1) + 0.433(1.732) = 0.25 + 0.75 = 1$ ✓ and $d\theta(\partial_r) = -0.25(0.866) + 0.433(0.5) = 0$ ✓.` },
      { label: 'Components of ∂x', text: t`Apply the dual basis to $\partial_x = (1, 0)$: $V^r = dr(\partial_x) = \cos\theta = 0.866$ and $V^\theta = d\theta(\partial_x) = -\sin\theta/r = -0.25$.` },
      { label: 'Check', text: t`$0.866\,\partial_r - 0.25\,\partial_\theta = (0.75 + 0.25,\ 0.433 - 0.433) = (1, 0)$. ✓ And its length from polar components needs the factor $r$: $(V^r)^2 + r^2(V^\theta)^2 = 0.75 + 4(0.0625) = 1$.` },
    ],
    answer: t`$\partial_r = (0.866, 0.5)$, $\partial_\theta = (-1, 1.732)$; $d\theta = -0.25\,dx + 0.433\,dy$; $\partial_x = 0.866\,\partial_r - 0.25\,\partial_\theta$.`,
  },
  practice: [
    num({
      id: 'dtheta-cart', difficulty: 1,
      gen(r) {
        const [x, y] = r.pick(PTS), which = r.pick(['x', 'y']);
        const ans = which === 'x' ? -y : x;
        return {
          prompt: t`At the point $(x, y) = (${x}, ${y})$, what is the ${which}-component of $\partial_\theta$ in Cartesian terms?`,
          visual: basisPic([[x, y]], { k: 0.25, caption: t`The polar basis at the point: $\partial_r$ and $\partial_\theta$ (drawn at a quarter of its length).` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: which === 'x' ? -y / Math.hypot(x, y) : x / Math.hypot(x, y), feedback: t`That is a component of the unit vector $\hat\theta$. $\partial_\theta = r\,\hat\theta$ is $r$ times longer.` }],
          hints: [t`$\partial_\theta = -y\,\partial_x + x\,\partial_y$.`],
          teach: t`The polar basis vector $\partial_\theta$ is $-y\,\partial_x + x\,\partial_y$: it points around and is $r$ long.`,
          explain: t`$\partial_\theta = (\partial x/\partial\theta, \partial y/\partial\theta) = (-y, x) = (${-y}, ${x})$, of length $r = ${Math.hypot(x, y)}$.`,
        };
      },
    }),
    num({
      id: 'dx-polar', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 4, 5]), th = r.pick([30, 60, 120, 150, 225, 300]);
        const vec = r.pick(['x', 'y']), comp = r.pick(['r', 'theta']);
        const c = Math.cos(th * DEG), s = Math.sin(th * DEG);
        const ans = vec === 'x' ? (comp === 'r' ? c : -s / R) : (comp === 'r' ? s : c / R);
        const wrong = vec === 'x' ? -s : c;
        return {
          prompt: t`At $(r, \theta) = (${R}, ${th}^\circ)$, the constant Cartesian vector $\partial_${vec}$ is written as $V^r\partial_r + V^\theta\partial_\theta$. What is ${comp === 'r' ? '$V^r$' : t`$V^\theta$`}?`,
          visual: basisPic([[R * c, R * s]], { k: 0.5, vec: { from: [R * c, R * s], to: [R * c + (vec === 'x' ? 1 : 0), R * s + (vec === 'y' ? 1 : 0)], label: `∂${vec}` }, caption: t`At the point: $\partial_r$, $\tfrac12\partial_\theta$ and the Cartesian $\partial_${vec}$ (gold).` }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: comp === 'theta' && Math.abs(wrong - ans) > 0.01 ? [{ value: wrong, feedback: t`That is the component along the unit vector $\hat\theta$. Along $\partial_\theta$, which is $r = ${R}$ long, it is $r$ times smaller.` }] : [],
          hints: [t`Apply the dual basis: $V^r = dr(\partial_${vec})$, $V^\theta = d\theta(\partial_${vec})$.`, t`$dr = \cos\theta\,dx + \sin\theta\,dy$ and $d\theta = (-\sin\theta\,dx + \cos\theta\,dy)/r$.`],
          teach: 'A Cartesian basis vector has polar components that change from point to point, because the polar basis does.',
          explain: t`${comp === 'r' ? t`$V^r = ${vec === 'x' ? '\\cos' : '\\sin'}${th}^\circ = ${nice(ans, 4)}$` : t`$V^\theta = ${vec === 'x' ? '-\\sin' : '\\cos'}${th}^\circ/${R} = ${nice(ans, 4)}$`}. So $\partial_${vec} = ${nice(vec === 'x' ? c : s, 4)}\,\partial_r ${(vec === 'x' ? -s / R : c / R) < 0 ? '-' : '+'} ${nice(Math.abs(vec === 'x' ? -s / R : c / R), 4)}\,\partial_\theta$ here.`,
        };
      },
    }),
    num({
      id: 'dtheta-of-v', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS);
        let V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        if (x * V[1] - y * V[0] === 0) V = [V[0], V[1] + 1];
        const ans = (x * V[1] - y * V[0]) / (R * R);
        return {
          prompt: t`At $(x, y) = (${x}, ${y})$, evaluate the covector $d\theta$ on the vector $V = ${V[0]}\,\partial_x ${V[1] < 0 ? '-' : '+'} ${Math.abs(V[1])}\,\partial_y$.`,
          visual: basisPic([[x, y]], { k: 0.25, vec: { from: [x, y], to: [x + V[0], y + V[1]] }, caption: t`The point, its polar basis ($\partial_\theta$ at a quarter of its length) and $V$.` }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: x * V[1] - y * V[0], feedback: t`Divide by $r^2 = ${R * R}$: $d\theta = (x\,dy - y\,dx)/r^2$.` }, { value: (x * V[1] - y * V[0]) / R, feedback: t`That is $r\,d\theta(V)$, the component along the unit vector $\hat\theta$. $d\theta$ itself has another factor $1/r$.` }],
          hints: [t`$d\theta = \dfrac{-y\,dx + x\,dy}{r^2}$.`],
          teach: t`$d\theta(V)$ is the rate at which the polar angle changes along $V$: $(xV^y - yV^x)/r^2$.`,
          explain: t`$d\theta(V) = \dfrac{(${x})(${V[1]}) - (${y})(${V[0]})}{${R * R}} = ${nice(ans, 4)}$ (radians per unit of $V$’s parameter).`,
        };
      },
    }),
    num({
      id: 'physical', difficulty: 2,
      gen(r) {
        const [what, R, v, unit] = r.pick([['A car circles a roundabout', 20, 10, 'm'], ['A centrifuge sample spins', 0.15, 30, 'm'], ['A cyclist rides a velodrome bend', 35, 16, 'm']]);
        const which = r.pick(['coord', 'phys']);
        const Vt = v / R;
        return {
          prompt: which === 'coord'
            ? t`${what} at radius ${R} ${unit} with speed ${v} m/s, straight around the centre. In polar coordinates its velocity is $V = V^\theta\,\partial_\theta$. What is the coordinate component $V^\theta$, in rad/s?`
            : t`${what} at radius ${R} ${unit}, and its velocity has coordinate component $V^\theta = ${nice(Vt, 4)}$ rad/s (and $V^r = 0$). What is its physical component along the unit vector $\hat\theta$ — its speed, in m/s?`,
          visual: basisPic([[1.6, 1.2]], { k: 0.5, vec: { from: [1.6, 1.2], to: [1.6 - 1.2 * 0.9, 1.2 + 1.6 * 0.9], label: 'V' }, caption: t`Schematic: a velocity straight around the centre is along $\partial_\theta$ (here drawn at half length).` }),
          answer: which === 'coord' ? Vt : v, units: which === 'coord' ? 'rad/s' : 'm/s', tol: { rel: 0.005 },
          errors: which === 'coord' ? [{ value: v, feedback: t`That is the speed, the component along the unit vector $\hat\theta$. $\partial_\theta$ is $r$ long, so $V^\theta = v/r$.` }, { value: v * R, feedback: t`Divide by $r$, do not multiply: a long $\partial_\theta$ means a small component.` }] : [{ value: Vt, feedback: t`That is the coordinate component. The physical one is $V^{\hat\theta} = r\,V^\theta$.` }],
          hints: [t`$V = V^\theta\partial_\theta = (rV^\theta)\,\hat\theta$, because $\partial_\theta = r\,\hat\theta$.`],
          teach: t`Coordinate and physical (unit-vector) components differ by the length of the basis vector: $V^{\hat\theta} = r\,V^\theta$.`,
          explain: which === 'coord' ? t`$V^\theta = v/r = ${v}/${R} = ${nice(Vt, 4)}$ rad/s — the angular velocity.` : t`$V^{\hat\theta} = rV^\theta = ${R}\times${nice(Vt, 4)} = ${v}$ m/s.`,
        };
      },
    }),
    multi({
      id: 'which-vary', difficulty: 2,
      prompt: 'Which of these change from point to point on the plane? Select every one.',
      visual: basisPic([[2.4, 0.6], [-1.2, 2.2], [-2.6, -1.6], [1.4, -2.2]], { k: 0.5, caption: t`$\partial_r$ and $\tfrac12\partial_\theta$ at four points.` }),
      choices: [t`The direction of $\partial_r$`, t`The length of $\partial_r$`, t`The direction of $\partial_\theta$`, t`The length of $\partial_\theta$`, t`The direction of $\partial_x$`],
      answer: [0, 2, 3],
      why: { 1: t`$\partial_r$ is always one unit long: one unit of $r$ is one unit of distance.`, 4: t`$\partial_x$ is the same arrow everywhere: that is what makes Cartesian coordinates special.` },
      hints: [t`$\partial_r = (\cos\theta, \sin\theta)$ and $\partial_\theta = (-r\sin\theta, r\cos\theta)$: which depend on the point?`],
      teach: t`The polar basis turns with $\theta$, and $\partial_\theta$ also grows with $r$; only the Cartesian basis is the same everywhere.`,
      explain: t`$\partial_r$ turns but keeps length 1; $\partial_\theta$ turns and has length $r$. $\partial_x$ never changes. (Lesson A8 measures exactly these changes: they are the Christoffel symbols.)`,
    }),
    mcq({
      id: 'constant-comps', difficulty: 2,
      prompt: t`The vector field $V = \partial_\theta$ has polar components $(V^r, V^\theta) = (0, 1)$ at every point. Is it the same arrow everywhere?`,
      visual: basisPic([[1, 0.5], [-0.8, 1.6], [-2, -0.6], [0.6, -2.4], [2.6, 1.6]], { k: 0.4, caption: t`$0.4\,\partial_\theta$ (violet) at several points, with $\partial_r$ (blue). Constant polar components, very different arrows.` }),
      choices: [
        'No: it is a rotation — the arrows point around the origin and grow with r',
        'Yes: constant components mean a constant field',
        'Yes, but only on one circle',
        'No: it points straight outward everywhere',
      ],
      answer: 0,
      why: {
        1: 'Constant components mean a constant field only in a basis that is itself constant, like the Cartesian one.',
        2: 'Even on one circle the arrows turn as you go around.',
        3: t`Outward is $\partial_r$; $\partial_\theta$ points around.`,
      },
      hints: [t`In Cartesian components, $\partial_\theta = (-y, x)$.`],
      teach: 'Constant components in a varying basis describe a varying field.',
      explain: t`$\partial_\theta = -y\,\partial_x + x\,\partial_y$: the velocity field of a plate turning at 1 rad/s. Its Cartesian components vary; its polar components do not. (The converse — a constant field with varying polar components — is the uniform field $\partial_x$.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dtheta', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick(PTS);
        let V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        if (x * V[1] - y * V[0] === 0) V = [V[0], V[1] + 1];
        const ans = (x * V[1] - y * V[0]) / (R * R);
        return {
          prompt: t`At $(x, y) = (${x}, ${y})$, a vector has Cartesian components $(${V.join(', ')})$. What is its coordinate component $V^\theta$?`,
          visual: basisPic([[x, y]], { k: 0.25, vec: { from: [x, y], to: [x + V[0], y + V[1]] }, caption: t`The point, the polar basis and the vector.` }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          hints: [t`$V^\theta = d\theta(V) = (xV^y - yV^x)/r^2$.`],
          teach: t`Components come from the dual basis: $V^\theta = d\theta(V)$.`,
          explain: t`$V^\theta = \dfrac{(${x})(${V[1]}) - (${y})(${V[0]})}{${R * R}} = ${nice(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const [name, R, Tmin] = r.pick([['The International Space Station', 6791, 92.9], ['A GPS satellite', 26560, 717.97], ['A geostationary satellite', 42164, 1436.07], ['The Moon', 384400, 27.32 * 1440]]);
        const Vt = (2 * Math.PI) / (Tmin * 60);
        const v = R * Vt;
        const which = r.pick(['speed', 'Vt']);
        return {
          prompt: which === 'speed'
            ? t`${name} orbits at radius $r = ${R}$ km (treated as a circle) with period ${Tmin > 2000 ? `${nice(Tmin / 1440, 4)} days` : `${Tmin} min`}, so in polar coordinates centred on Earth its velocity is $V = V^\theta\,\partial_\theta$ with $V^\theta = 2\pi/T$. Using $|\partial_\theta| = r$, find its speed in km/s.`
            : t`${name} orbits at radius $r = ${R}$ km with speed ${nice(v, 4)} km/s (treat the orbit as a circle). What is its coordinate component $V^\theta$ in polar coordinates, in rad/s?`,
          visual: basisPic([[2.4, 1.2]], { k: 0.45, caption: 'Schematic, not to scale: a circular orbit’s velocity points along ∂θ, whose length is the orbital radius.' }),
          answer: which === 'speed' ? v : Vt, units: which === 'speed' ? 'km/s' : 'rad/s', tol: { rel: 0.005 },
          errors: which === 'speed' ? [{ value: Vt, feedback: t`That is $V^\theta$, an angular rate. The speed is $|V^\theta\partial_\theta| = rV^\theta$.` }] : [{ value: v, feedback: t`That is the speed in km/s. The coordinate component divides it by $r$, the length of $\partial_\theta$.` }],
          hints: which === 'speed' ? [t`$V^\theta = 2\pi/T$ with $T$ in seconds.`, t`Speed $= |V| = V^\theta\,|\partial_\theta| = rV^\theta$.`] : [t`Speed $= rV^\theta$.`, t`$V^\theta = \text{speed}/r$, with $r$ in km.`],
          teach: t`A circular orbit is $V^\theta\partial_\theta$: its coordinate component is the angular rate, and its speed is $r$ times that.`,
          explain: t`$V^\theta = 2\pi/T = ${tex(Vt, 4)}$ rad/s and the speed is $rV^\theta = ${R}\times${tex(Vt, 4)} = ${nice(v, 4)}$ km/s.`,
        };
      },
    }),
    mcq({
      id: 'cp-which-dtheta', difficulty: 2,
      prompt: t`Which covector is $d\theta$, written in Cartesian terms?`,
      visual: basisPic([[2, 1]], { k: 0.5, caption: t`The polar basis at a point: $d\theta$ must give 1 on $\partial_\theta$ and 0 on $\partial_r$.` }),
      choices: [t`$\dfrac{-y\,dx + x\,dy}{x^2 + y^2}$`, t`$-y\,dx + x\,dy$`, t`$\dfrac{x\,dx + y\,dy}{\sqrt{x^2 + y^2}}$`, t`$-\sin\theta\,dx + \cos\theta\,dy$`],
      answer: 0,
      why: {
        1: t`On $\partial_\theta = (-y, x)$ this gives $y^2 + x^2 = r^2$, not 1.`,
        2: t`That is $dr$: it gives 1 on $\partial_r$ and 0 on $\partial_\theta$.`,
        3: t`On $\partial_\theta$ that gives $r$: it is $r\,d\theta$, the dual of the unit vector $\hat\theta$.`,
      },
      hints: [t`Test each on $\partial_\theta = (-y, x)$: the right one gives exactly 1.`],
      teach: t`The dual basis is fixed by $d\theta(\partial_\theta) = 1$ and $d\theta(\partial_r) = 0$.`,
      explain: t`$d\theta(\partial_\theta) = \dfrac{(-y)(-y) + x\cdot x}{r^2} = 1$ and $d\theta(\partial_r) = \dfrac{-y\cos\theta + x\sin\theta}{r^2} = 0$. ✓ It is also the differential of $\theta = \operatorname{atan2}(y, x)$.`,
    }),
  ],
  sources: [
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.2 (polar coordinates in the flat plane)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (coordinate bases)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
