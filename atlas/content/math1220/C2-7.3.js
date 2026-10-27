// The dot product and projections — one number that measures how much two
// vectors point the same way: angles, perpendicularity, work, components.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { QUADS, signed, vecTeX, arrows2D, add, sub, scale, dot, norm, deg } from './_vectors.js';

const t = String.raw;
const pick3 = (r) => { const [a, b, c, L] = r.pick(QUADS); return [signed(r, [a, b, c]), L]; };

// projection of a onto b, in the graph's expression syntax
const K = '(ax*bx + ay*by)/(bx^2 + by^2)';
// the angle between a and b from their direction angles alone — independent of the dot product
const TH = 'acos(cos(atan2(ay, ax) - atan2(by, bx)))';

export default lesson({
  id: 'math1220.C2-7.3',
  title: 'The dot product and projections',
  minutes: 10, difficulty: 2,
  intro: t`The **dot product** multiplies two vectors and returns a single number. You can compute it from components or from lengths and the angle between the vectors — and the two always agree:

$$\vec a\cdot\vec b = a_xb_x + a_yb_y + a_zb_z = |\vec a|\,|\vec b|\cos\theta$$

So it measures how much two vectors point the same way: positive when the angle is acute, **zero exactly when they are perpendicular**, negative when it is obtuse. Divide by $|\vec b|$ and you get the **scalar projection** of $\vec a$ on $\vec b$ — the part of $\vec a$ that lies along $\vec b$. Work, $W = \vec F\cdot\vec d$, is the most famous dot product in physics.`,
  symbols: [
    { tex: '\\vec a\\cdot\\vec b', text: 'the dot product: a **scalar** (a number), not a vector; its units are the product of the two vectors’ units' },
    { tex: 'a_x b_x + a_y b_y + a_z b_z', text: 'multiply matching components and add' },
    { tex: '|\\vec a|,\\ |\\vec b|', text: 'the two magnitudes' },
    { tex: '\\theta', text: t`the angle between the vectors when they are drawn tail to tail, $0 \le \theta \le 180^\circ$` },
    { tex: '\\operatorname{comp}_{\\vec b}\\vec a = \\tfrac{\\vec a\\cdot\\vec b}{|\\vec b|}', text: t`the **scalar projection**: the signed length of $\vec a$’s shadow along $\vec b$. The **vector projection** is $\operatorname{proj}_{\vec b}\vec a = \frac{\vec a\cdot\vec b}{|\vec b|^2}\,\vec b$` },
  ],
  why: t`Work done by a force, the power a solar panel collects, the headwind on a runway and, later, the inner products of quantum mechanics and the metric of relativity are all dot products.`,
  visual: {
    type: 'graph',
    title: 'Projecting one vector onto another',
    lead: t`Drag the tips of $\vec a$ (blue) and $\vec b$ (amber). The green arrow is the projection of $\vec a$ onto the line of $\vec b$ (faint), and the dashed segment drops from the tip of $\vec a$ at a right angle. The readouts compute $\vec a\cdot\vec b$ both ways.`,
    tasks: [
      'Swing a until the dot product reads 0: the angle is 90° and the projection shrinks to nothing.',
      'Push the angle past 90°: the dot product turns negative and the projection points against b.',
      'Make b twice as long: a · b doubles, but the projection of a stays the same — it depends only on the direction of b.',
    ],
    params: {
      x: [-6, 6], y: [-4, 5], equal: true,
      drag: [{ key: 'a', x: 2, y: 3, snap: 0.5 }, { key: 'b', x: 4, y: 1, snap: 0.5 }],
      curves: [
        { param: ['t*bx', 't*by'], t: [-6, 6], color: 'ink4', width: 1 },
        { param: [`ax + t*(${K}*bx - ax)`, `ay + t*(${K}*by - ay)`], t: [0, 1], color: 'ink3', dash: true, width: 1.4 },
      ],
      arrows: [
        { from: [0, 0], to: ['bx', 'by'], color: 'warn', label: 'b' },
        { from: [0, 0], to: ['ax', 'ay'], color: 'accent', label: 'a' },
        { from: [0, 0], to: [`${K}*bx`, `${K}*by`], color: 'good' },
      ],
      readouts: [
        { label: '$a_xb_x + a_yb_y$', expr: 'ax*bx + ay*by', digits: 4 },
        { label: '$|\\vec a||\\vec b|\\cos\\theta$', expr: `sqrt(ax^2 + ay^2)*sqrt(bx^2 + by^2)*cos(${TH})`, digits: 4 },
        { label: '$\\theta$', expr: `${TH}*180/pi`, unit: '^\\circ', digits: 4 },
        { label: '$\\operatorname{comp}_{\\vec b}\\vec a$', expr: '(ax*bx + ay*by)/sqrt(bx^2 + by^2)', digits: 3 },
      ],
    },
    caption: 'Handles snap to half-units. Equal scales on both axes, so right angles look right. The angle θ is found from the directions of the two arrows alone, so the two readouts are independent calculations that agree.',
  },
  example: {
    prompt: t`Find the angle between $\vec a = \langle 1, 2, 2\rangle$ and $\vec b = \langle 3, 0, 4\rangle$, and the vector projection of $\vec a$ onto $\vec b$.`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 4.5,
        vectors: [
          { to: [3, 0, 4], color: 'warn', label: t`\vec b` },
          { to: [1, 2, 2], color: 'accent', label: t`\vec a` },
          { to: [1.32, 0, 1.76], color: 'good', width: 3.4 },
        ],
        segments: [{ from: [1, 2, 2], to: [1.32, 0, 1.76], color: 'ink3', dash: true }],
      },
      caption: 'Green: the projection of a onto b, lying along b. Drag to rotate: from every side the dashed segment meets b at a right angle.',
    },
    steps: [
      { label: 'Dot product from components', text: t`$\vec a\cdot\vec b = (1)(3) + (2)(0) + (2)(4) = 11$.` },
      { label: 'Magnitudes', text: t`$|\vec a| = \sqrt{1 + 4 + 4} = 3$ and $|\vec b| = \sqrt{9 + 0 + 16} = 5$.` },
      { label: 'Angle', text: t`$\cos\theta = \dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|} = \dfrac{11}{15}$, so $\theta = \arccos\frac{11}{15} = 42.8^\circ$.` },
      { label: 'Projection', text: t`$\operatorname{proj}_{\vec b}\vec a = \dfrac{\vec a\cdot\vec b}{|\vec b|^2}\,\vec b = \dfrac{11}{25}\langle 3, 0, 4\rangle = \langle 1.32,\ 0,\ 1.76\rangle$. Its length, $\frac{11}{5} = 2.2$, is the scalar projection.` },
      { label: 'Sense check', text: t`What is left over, $\vec a - \operatorname{proj}_{\vec b}\vec a = \langle -0.32, 2, 0.24\rangle$, should be perpendicular to $\vec b$: $(-0.32)(3) + 0 + (0.24)(4) = 0$. ✓` },
    ],
    answer: t`$\theta = 42.8^\circ$ and $\operatorname{proj}_{\vec b}\vec a = \langle 1.32, 0, 1.76\rangle$ (scalar projection $2.2$).`,
  },
  practice: [
    num({
      id: 'compute-dot', difficulty: 1,
      gen(r) {
        const a = [r.intExcept(-6, 6, [0]), r.int(-6, 6), r.intExcept(-6, 6, [0])], b = [r.int(-6, 6), r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])];
        let d = dot(a, b);
        if (d === 0) { b[0] += 1; d = dot(a, b); }
        return {
          prompt: t`Compute $\vec a\cdot\vec b$ for $\vec a = ${vecTeX(a)}$ and $\vec b = ${vecTeX(b)}$.`,
          answer: d, tol: { rel: 1e-9, abs: 1e-9 },
          errors: [{ value: a[0] * b[0] + a[1] * b[1], feedback: 'Include the z-components too: three products, added.' }].filter((e) => e.value !== d),
          hints: [t`Multiply matching components: $a_xb_x$, $a_yb_y$, $a_zb_z$ — then add.`],
          teach: 'The dot product multiplies matching components and adds; the result is a number, not a vector.',
          explain: t`$(${a[0]})(${b[0]}) + (${a[1]})(${b[1]}) + (${a[2]})(${b[2]}) = ${a[0] * b[0]} + ${a[1] * b[1]} + ${a[2] * b[2]} = ${d}$.`,
        };
      },
    }),
    num({
      id: 'angle-between', difficulty: 2,
      gen(r) {
        let a, La, b, Lb, c;
        do { [a, La] = pick3(r); [b, Lb] = pick3(r); c = dot(a, b) / (La * Lb); } while (Math.abs(c) > 0.98 || Math.abs(c) < 0.02);
        const th = deg(Math.acos(c));
        return {
          prompt: t`Find the angle between $\vec a = ${vecTeX(a)}$ and $\vec b = ${vecTeX(b)}$, in degrees to one decimal place.`,
          answer: th, units: '°', tol: { rel: 0.002, abs: 0.1 },
          errors: c < 0 ? [{ value: 180 - th, feedback: 'Keep the sign of the dot product: a negative dot product means an obtuse angle.' }] : [],
          hints: [t`$\cos\theta = \dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}$.`, t`$\vec a\cdot\vec b = ${dot(a, b)}$, $|\vec a| = ${La}$, $|\vec b| = ${Lb}$.`],
          teach: t`$\cos\theta = \frac{\vec a\cdot\vec b}{|\vec a||\vec b|}$, and the sign of the dot product decides acute or obtuse.`,
          explain: t`$\cos\theta = \frac{${dot(a, b)}}{${La}\cdot${Lb}} = ${nice(c, 4)}$, so $\theta = ${nice(th, 4)}^\circ$${c < 0 ? ' — obtuse, because the dot product is negative' : ''}.`,
          visual: { type: 'calc-vectors3d', params: { range: Math.max(La, Lb) + 0.5, vectors: [{ to: a, color: 'accent', label: t`\vec a` }, { to: b, color: 'warn', label: t`\vec b` }] }, caption: 'Drag to rotate: the angle between them is the same from every viewpoint.' },
        };
      },
    }),
    mcq({
      id: 'perpendicular', difficulty: 2,
      prompt: t`Which vector is perpendicular to $\langle 2, -1, 3\rangle$?`,
      choices: [t`$\langle 1, 5, 1\rangle$`, t`$\langle -2, 1, -3\rangle$`, t`$\langle \tfrac12, -1, \tfrac13\rangle$`, t`$\langle 3, -1, 2\rangle$`],
      answer: 0,
      why: {
        1: t`That points the opposite way along the same line: the angle is $180^\circ$, and the dot product is $-14$, not 0.`,
        2: t`Taking reciprocals does not make a perpendicular vector: the dot product is $1 + 1 + 1 = 3$.`,
        3: t`The dot product is $6 + 1 + 6 = 13$, far from 0.`,
      },
      hints: ['Perpendicular means the dot product is zero.', t`Check each: for example $\langle 1, 5, 1\rangle\cdot\langle 2, -1, 3\rangle = 2 - 5 + 3$.`],
      teach: 'Two nonzero vectors are perpendicular exactly when their dot product is zero.',
      explain: t`$\langle 1, 5, 1\rangle\cdot\langle 2, -1, 3\rangle = 2 - 5 + 3 = 0$, so the angle is $90^\circ$.`,
    }),
    num({
      id: 'work', difficulty: 2,
      gen(r) {
        let F, d;
        do {
          F = [r.int(2, 9) * 10, r.intExcept(-9, 9, [0]) * 10, r.intExcept(-9, 9, [0]) * 10]; d = [r.int(1, 5), r.intExcept(-4, 4, [0]), r.intExcept(-3, 3, [0])];
          while (dot(F, d) <= 0) d[0] += 2;   // the arm does positive work
        } while (norm(F) * norm(d) < 1.05 * dot(F, d));   // and the force is clearly not along the motion
        const W = dot(F, d);
        return {
          prompt: t`The robotic arm on a space station moves a payload through the displacement $\vec d = ${vecTeX(d)}$ m while pushing on it with a constant force $\vec F = ${vecTeX(F)}$ N. How much work does the arm do?`,
          answer: W, units: 'J', tol: { rel: 1e-3 },
          errors: [{ value: norm(F) * norm(d), feedback: t`That assumes the force points along the displacement. Only the component along $\vec d$ does work: $W = \vec F\cdot\vec d$.` }],
          hints: [t`$W = \vec F\cdot\vec d = F_xd_x + F_yd_y + F_zd_z$.`],
          teach: 'Work is the dot product of force and displacement: only the part of the force along the motion counts.',
          explain: t`$W = (${F[0]})(${d[0]}) + (${F[1]})(${d[1]}) + (${F[2]})(${d[2]}) = ${W}$ J — less than $|\vec F||\vec d| = ${nice(norm(F) * norm(d), 4)}$ J, because the force is not parallel to the motion.`,
        };
      },
    }),
    num({
      id: 'crosswind', difficulty: 3,
      gen(r) {
        const w = [r.intExcept(-12, 12, [0]), r.intExcept(-12, 12, [0])], u = [0.6, 0.8];
        const along = dot(w, u), cross = Math.abs(w[0] * u[1] - w[1] * u[0]);
        return {
          prompt: t`A runway points along the unit vector $\hat u = \langle 0.6, 0.8\rangle$ ($x$ east, $y$ north). The wind velocity is $\vec w = ${vecTeX(w)}$ m/s. What is the **crosswind** — the size of the wind’s component perpendicular to the runway?`,
          answer: cross, units: 'm/s', tol: { rel: 2e-3, abs: 0.01 },
          errors: [{ value: Math.abs(along), feedback: t`That is the component **along** the runway, $|\vec w\cdot\hat u|$. Subtract it from $\vec w$ and take what is left.` }, { value: norm(w), feedback: 'That is the whole wind speed; only the part across the runway is crosswind.' }].filter((e) => Math.abs(e.value - cross) > 0.05),
          hints: [t`The component along the runway is $(\vec w\cdot\hat u)\,\hat u$ with $\vec w\cdot\hat u = ${nice(along)}$.`, t`Crosswind vector $= \vec w - (\vec w\cdot\hat u)\hat u$; find its length. (Or use $|\vec w|^2 = (\text{along})^2 + (\text{across})^2$.)`],
          teach: 'Split a vector into a part along a direction (its projection) and a perpendicular remainder.',
          explain: t`$\vec w\cdot\hat u = ${nice(along)}$ m/s along the runway (${along < 0 ? 'a headwind for a take-off along $\\hat u$' : 'a tailwind for a take-off along $\\hat u$'}). The rest, $\vec w - ${nice(along)}\hat u = ${vecTeX(sub(w, scale(u, along)).map((x) => +x.toFixed(3)))}$, has length $${nice(cross, 4)}$ m/s: the crosswind. Check: $${nice(along, 4)}^2 + ${nice(cross, 4)}^2 = ${nice(dot(w, w))} = |\vec w|^2$.`,
          visual: arrows2D([{ to: [6 * u[0], 6 * u[1]], color: 'ink3' }, { to: w.map((x) => x / 2), color: 'accent' }, { to: scale(u, along / 2), color: 'good' }], { caption: 'Grey: the runway direction. Blue: the wind (half scale). Green: its component along the runway. The crosswind is the gap between the blue and green tips.' }),
        };
      },
    }),
    mcq({
      id: 'projection-slip', difficulty: 3, kind: 'error',
      prompt: t`A student computes the vector projection of $\vec a = \langle 4, 2\rangle$ onto $\vec b = \langle 3, 4\rangle$:
$$\operatorname{proj}_{\vec b}\vec a = \frac{\vec a\cdot\vec b}{|\vec b|}\,\vec b = \frac{20}{5}\langle 3, 4\rangle = \langle 12, 16\rangle.$$
What went wrong?`,
      choices: [
        t`Divide by $|\vec b|^2 = 25$, not $|\vec b| = 5$: the answer is $\langle 2.4, 3.2\rangle$`,
        t`The dot product should be $4\cdot4 + 2\cdot3 = 22$`,
        t`It should be multiplied by $\vec a$, not $\vec b$`,
        t`Nothing: the projection can be longer than $\vec a$`,
      ],
      answer: 0,
      why: {
        1: t`The dot product pairs matching components: $4\cdot3 + 2\cdot4 = 20$ is right.`,
        2: t`The projection lies along $\vec b$, so it is a multiple of $\vec b$.`,
        3: t`A shadow is never longer than the object: $|\langle 12, 16\rangle| = 20 > |\vec a| = 4.47$, so something is wrong.`,
      },
      hints: ['Compare the length of the answer with the length of a.', t`$\frac{\vec a\cdot\vec b}{|\vec b|}$ is the scalar projection, a length; it must multiply the **unit** vector $\vec b/|\vec b|$.`],
      teach: t`$\operatorname{proj}_{\vec b}\vec a = \frac{\vec a\cdot\vec b}{|\vec b|^2}\vec b$ — one $|\vec b|$ for the scalar projection, one to make $\vec b$ a unit vector.`,
      explain: t`$\operatorname{proj}_{\vec b}\vec a = \frac{20}{25}\langle 3, 4\rangle = \langle 2.4, 3.2\rangle$, of length $4$, the scalar projection — shorter than $|\vec a| = 4.47$, as a shadow must be.`,
    }),
    num({
      id: 'find-k', difficulty: 2,
      gen(r) {
        let p, q, m, n, k;
        do { p = r.intExcept(-4, 4, [0]); q = r.intExcept(-4, 4, [0]); m = r.intExcept(-4, 4, [0]); n = r.intExcept(-4, 4, [0]); } while (m + p === 0 || q * n === 0);
        k = (-q * n) / (m + p);
        return {
          prompt: t`For which number $k$ are $\langle k, ${p}, ${q}\rangle$ and $\langle ${m}, k, ${n}\rangle$ perpendicular? (A fraction is fine.)`,
          answer: k, tol: { rel: 1e-4, abs: 1e-6 },
          hints: ['Set the dot product equal to zero.', t`$${m}k + ${p}k + (${q})(${n}) = 0$.`],
          teach: 'Perpendicularity is one equation: dot product = 0.',
          explain: t`$${m}k + ${p}k + ${q * n} = 0 \Rightarrow ${m + p}k = ${-q * n} \Rightarrow k = ${frac(k)}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-angle', difficulty: 2,
      gen(r) {
        let a, La, b, Lb, c;
        do { [a, La] = pick3(r); [b, Lb] = pick3(r); c = dot(a, b) / (La * Lb); } while (Math.abs(c) > 0.98);
        const th = deg(Math.acos(c));
        return {
          prompt: t`Find the angle between $${vecTeX(a)}$ and $${vecTeX(b)}$, to one decimal place.`,
          answer: th, units: '°', tol: { rel: 0.002, abs: 0.1 },
          hints: [t`$\cos\theta = \frac{\vec a\cdot\vec b}{|\vec a||\vec b|}$.`],
          teach: 'Angle from the dot product divided by both lengths.',
          explain: t`$\cos\theta = \frac{${dot(a, b)}}{${La * Lb}}$, $\theta = ${nice(th, 4)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'cp-scalar-projection', difficulty: 3,
      gen(r) {
        const [b, Lb] = pick3(r);
        let a = [r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0])];
        if (dot(a, b) === 0) a = add(a, b);
        const comp = dot(a, b) / Lb;
        return {
          prompt: t`Find the scalar projection of $\vec a = ${vecTeX(a)}$ onto $\vec b = ${vecTeX(b)}$ (the signed length of $\vec a$ along $\vec b$).`,
          answer: comp, tol: { rel: 2e-3 },
          errors: [{ value: dot(a, b) / (Lb * Lb), feedback: t`Divide by $|\vec b|$ once: $\frac{\vec a\cdot\vec b}{|\vec b|}$.` }, { value: dot(a, b), feedback: 'Divide the dot product by the length of b.' }].filter((e) => Math.abs(e.value - comp) > 1e-3),
          hints: [t`$\operatorname{comp}_{\vec b}\vec a = \frac{\vec a\cdot\vec b}{|\vec b|}$.`, t`$|\vec b| = ${Lb}$.`],
          teach: 'The scalar projection is the dot product with the unit vector along b.',
          explain: t`$\frac{${dot(a, b)}}{${Lb}} = ${nice(comp, 4)}$${comp < 0 ? ' — negative, so a has a component pointing against b' : ''}.`,
        };
      },
    }),
    num({
      id: 'cp-solar-panel', difficulty: 3, transfer: true,
      gen(r) {
        let n, Ln, s, Ls, c;
        do { [n, Ln] = pick3(r); [s, Ls] = pick3(r); c = dot(n, s) / (Ln * Ls); } while (c < 0.2 || c > 0.98);
        const Pmax = r.pick([800, 1200, 1500, 2000]);
        return {
          prompt: t`A spacecraft’s solar array delivers $${Pmax}$ W when sunlight hits it head-on; at an angle it delivers $P_\text{max}\cos\theta$, where $\theta$ is the angle between the panel’s normal and the direction to the Sun. In the spacecraft’s frame the panel normal is $\vec n = ${vecTeX(n)}$ and the Sun lies along $\vec s = ${vecTeX(s)}$. What power does the array deliver?`,
          answer: Pmax * c, units: 'W', tol: { rel: 2e-3 },
          errors: [{ value: Pmax * dot(n, s), feedback: t`$\cos\theta$ needs unit vectors: divide $\vec n\cdot\vec s$ by $|\vec n||\vec s|$.` }],
          hints: [t`$\cos\theta = \frac{\vec n\cdot\vec s}{|\vec n||\vec s|}$.`, t`$\vec n\cdot\vec s = ${dot(n, s)}$, $|\vec n| = ${Ln}$, $|\vec s| = ${Ls}$.`],
          teach: 'The cosine of the angle between two directions is the dot product of their unit vectors.',
          explain: t`$\cos\theta = \frac{${dot(n, s)}}{${Ln}\cdot${Ls}} = ${nice(c, 4)}$ ($\theta = ${nice(deg(Math.acos(c)), 3)}^\circ$), so $P = ${Pmax}\times${nice(c, 4)} = ${nice(Pmax * c, 4)}$ W.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.3 The Dot Product', url: 'https://openstax.org/books/calculus-volume-3/pages/2-3-the-dot-product' },
  ],
});
