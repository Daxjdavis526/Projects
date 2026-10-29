// The dot product: one number that says how much of one vector lies along another.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { vectorPicture, polar, DEG } from './_vectors.js';

const t = String.raw;
const deg = (x) => (x * 180) / Math.PI;
const dot = (a, b) => a.reduce((s, c, k) => s + c * b[k], 0);
const len = (a) => Math.sqrt(dot(a, a));
const vecTeX = (v) => `(${v.join(',\\ ')})`;

// expressions for the Explore graph (A dragged by 'a', B by 'b')
const DOT = '(ax*bx + ay*by)', AA = '(ax^2 + ay^2)', BB = '(bx^2 + by^2)';
const COS = `min(1, max(-1, ${DOT}/sqrt(${AA}*${BB})))`;
const SIDE = 'sgn(ax*by - ay*bx)';

/**
 * Two vectors from the origin in 3D, optionally with the projection of the second onto the first.
 * They are scaled together to fit — or each on its own (`separate`) when they are different kinds
 * of quantity; directions are always exact.
 */
function pair3d(A, B, { la = '\\vec A', lb = '\\vec B', project = false, separate = false, caption } = {}) {
  const kA = 2.6 / (separate ? len(A) : Math.max(len(A), len(B))), kB = separate ? 2.6 / len(B) : kA;
  const a = A.map((c) => +(c * kA).toFixed(4)), b = B.map((c) => +(c * kB).toFixed(4));
  const p = a.map((c) => +((dot(a, b) / dot(a, a)) * c).toFixed(4));
  return {
    type: 'calc-vectors3d',
    params: {
      range: 3, aspect: 'wide',
      vectors: [{ to: a, color: 'accent', label: la }, { to: b, color: 'violet', label: lb }, ...(project ? [{ to: p, color: 'gold', width: 3.4 }] : [])],
      segments: project ? [{ from: b, to: p, color: 'ink3', dash: true }] : [],
    },
    caption: caption ?? 'Both vectors drawn from the origin, scaled together to fit; their directions are exact. Drag to rotate.',
  };
}

// the worked example: work done by a constant force
const EX = { F: [40, 30], d: [5, -2] };
EX.W = dot(EX.F, EX.d);
EX.cos = EX.W / (len(EX.F) * len(EX.d));
EX.th = deg(Math.acos(EX.cos));
EX.par = EX.W / len(EX.d);
const EXS = 6;                                       // the displacement is drawn 6× larger than its scale in metres
const EXP = EX.d.map((c) => (EX.W / dot(EX.d, EX.d)) * c);

export default lesson({
  id: 'phys2210.M2.4',
  title: 'The dot product',
  minutes: 9, difficulty: 2,
  intro: t`The **dot product** multiplies two vectors and gives a *scalar*: it measures how much of one vector points along the other.

$$\vec A\cdot\vec B = AB\cos\theta = A_xB_x + A_yB_y + A_zB_z$$

It is largest when the vectors are parallel, zero when they are perpendicular, and negative when they point more than 90° apart. Its most important job in mechanics is **work**, $W = \vec F\cdot\vec d$: only the part of a force along the motion does work.`,
  symbols: [
    { tex: '\\vec A\\cdot\\vec B', text: '“A dot B”: a single number, not a vector. Its units are the product of the two vectors’ units (N·m = J for a force and a displacement)' },
    { tex: 'A,\\ B', text: 'the magnitudes of the two vectors' },
    { tex: '\\theta', text: 'the angle between the vectors when they are drawn tail to tail, between 0° and 180°' },
    { tex: 'A_xB_x + \\dots', text: 'the same number from components: multiply matching components and add — no angle needed' },
  ],
  why: 'Work and power, the flux of sunlight through a solar panel, the component of a force along a surface — and in relativity, the spacetime interval itself is a dot product, with a minus sign in it.',
  visual: {
    type: 'graph',
    title: 'Project one vector onto another',
    lead: t`Drag the tips of $\vec A$ and $\vec B$. The gold arrow is the **projection** of $\vec B$ onto $\vec A$: the part of $\vec B$ that lies along $\vec A$, of length $B\cos\theta$. The dot product is that length times $A$ — computed below in two different ways.`,
    tasks: [
      'Swing B around A: the dot product is largest when they line up, zero at 90°, negative beyond.',
      'Make B perpendicular to A: the projection vanishes and A · B = 0, however long the vectors are.',
      'Double A: A · B doubles, but the gold projection of B does not change.',
    ],
    params: {
      x: [-5, 7], y: [-4, 5], equal: true, xlabel: 'x', ylabel: 'y',
      alt: 'Two draggable vectors with the projection of one onto the other',
      drag: [{ key: 'a', x: 5, y: 1, snap: 0.5 }, { key: 'b', x: 2, y: 3, snap: 0.5 }],
      curves: [
        { param: ['t*ax', 't*ay'], t: [-4, 4], color: 'ink4', width: 1, dash: true },
        { param: [`bx + t*(${DOT}/${AA}*ax - bx)`, `by + t*(${DOT}/${AA}*ay - by)`], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
        { param: ['0.9*cos(t)', '0.9*sin(t)'], t: ['atan2(ay, ax)', `atan2(ay, ax) + ${SIDE}*acos(${COS})`], color: 'gold', width: 1.8 },
      ],
      arrows: [
        { from: [0, 0], to: [`${DOT}/${AA}*ax`, `${DOT}/${AA}*ay`], color: 'gold' },
        { from: [0, 0], to: ['ax', 'ay'], color: 'accent', label: 'A' },
        { from: [0, 0], to: ['bx', 'by'], color: 'violet', label: 'B' },
      ],
      points: [
        { x: `1.3*cos(atan2(ay, ax) + ${SIDE}*acos(${COS})/2)`, y: `1.3*sin(atan2(ay, ax) + ${SIDE}*acos(${COS})/2)`, r: 0.01, color: 'gold', label: 'θ' },
      ],
      readouts: [
        { label: '$A_xB_x + A_yB_y$', expr: DOT, digits: 3 },
        { label: '$AB\\cos\\theta$', expr: `sqrt(${AA})*sqrt(${BB})*cos(atan2(by, bx) - atan2(ay, ax))`, digits: 3 },
        { label: '$\\theta$', expr: `acos(${COS})*180/pi`, unit: '^\\circ', digits: 3 },
        { label: '$B\\cos\\theta$ (gold)', expr: `${DOT}/sqrt(${AA})`, digits: 3 },
      ],
    },
    caption: 'Drag either tip (they snap to half-units). The dashed line from B’s tip meets the line of A at a right angle; the gold projection is negative — pointing backwards along A — when θ is more than 90°.',
  },
  example: {
    prompt: t`A cable pulls a cargo sled with a constant force $\vec F = (${EX.F[0]}\,\hat\imath + ${EX.F[1]}\,\hat\jmath)$ N while the sled moves through $\vec d = (${EX.d[0].toFixed(1)}\,\hat\imath - ${(-EX.d[1]).toFixed(1)}\,\hat\jmath)$ m. How much work does the cable do, and what is the angle between the force and the motion?`,
    visual: vectorPicture({
      arrows: [{ to: EX.F, color: 'violet', label: 'F (N)' }, { to: EX.d.map((c) => c * EXS), color: 'accent', label: 'd (m, ×6)' }, { to: EXP, color: 'gold', label: 'part of F along d', mid: true }],
      segments: [{ from: EX.F, to: EXP }],
      arc: { from: deg(Math.atan2(EX.d[1], EX.d[0])), to: deg(Math.atan2(EX.F[1], EX.F[0])), label: 'θ' },
      numbers: false, caption: 'Force (violet) and displacement (blue) from a common point; the displacement is drawn 6 times longer than the force’s scale so both show. Gold: the component of F along d.',
    }),
    steps: [
      { label: 'Multiply matching components', text: t`$W = \vec F\cdot\vec d = (${EX.F[0]})(${EX.d[0]}) + (${EX.F[1]})(${EX.d[1]}) = ${EX.F[0] * EX.d[0]} - ${-EX.F[1] * EX.d[1]} = ${EX.W}\ \text{J}$ — newtons times metres are joules.` },
      { label: 'Magnitudes', text: t`$F = \sqrt{${EX.F[0]}^2 + ${EX.F[1]}^2} = ${len(EX.F)}$ N and $d = \sqrt{${EX.d[0]}^2 + (${EX.d[1]})^2} = ${fmt(len(EX.d), 4)}$ m.` },
      { label: 'Solve for the angle', text: t`$\cos\theta = \dfrac{\vec F\cdot\vec d}{Fd} = \dfrac{${EX.W}}{${len(EX.F)}\times${fmt(len(EX.d), 4)}} = ${fmt(EX.cos, 3)}$, so $\theta = ${fmt(EX.th, 3)}°$.` },
      { label: 'Read it physically', text: t`Only $F\cos\theta = ${EX.W}/${fmt(len(EX.d), 4)} = ${fmt(EX.par, 3)}$ N of the ${len(EX.F)} N force acts along the motion; the rest pulls sideways and does no work.` },
      { label: 'Sense check', text: t`$\theta < 90°$, so the work is positive — the cable speeds the sled up (or keeps it going against friction). A force pulling backwards, $\theta > 90°$, would give negative work.` },
    ],
    answer: t`$W = ${EX.W}$ J, with $\theta \approx ${fmt(EX.th, 3)}°$ between the force and the displacement.`,
  },
  practice: [
    num({
      id: 'dot-from-components', difficulty: 1,
      gen(r) {
        const A = [r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0])];
        let B;
        do { B = [r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0])]; } while (dot(A, B) === 0 || Math.abs(dot(A, B) - (A[0] * B[0] + A[1] * B[1])) < 1e-9);
        return {
          prompt: t`Find $\vec A\cdot\vec B$ for $\vec A = ${vecTeX(A)}$ and $\vec B = ${vecTeX(B)}$.`,
          answer: dot(A, B), tol: { rel: 0, abs: 0.01 },
          errors: [{ value: A[0] * B[0] + A[1] * B[1], feedback: 'You left out the z-terms: in three dimensions there are three products to add.' }],
          hints: [t`Multiply matching components and add: $A_xB_x + A_yB_y + A_zB_z$.`],
          visual: pair3d(A, B),
          teach: 'The dot product in components: multiply x by x, y by y, z by z, and add — the result is a single number.',
          explain: t`$(${A[0]})(${B[0]}) + (${A[1]})(${B[1]}) + (${A[2]})(${B[2]}) = ${A[0] * B[0]} + ${A[1] * B[1]} + ${A[2] * B[2]} = ${dot(A, B)}$.`,
        };
      },
    }),
    mcq({
      id: 'sign-of-dot', difficulty: 1,
      prompt: 'Two vectors are 120° apart when drawn tail to tail. Their dot product is:',
      choices: ['Negative', 'Positive', 'Zero', 'Undefined: the angle must be below 90°'],
      answer: 0,
      why: {
        1: 'cos 120° = −0.5: past 90°, one vector points partly backwards along the other.',
        2: 'Zero needs exactly 90°: perpendicular vectors.',
        3: 'Any angle from 0° to 180° is allowed; past 90° the dot product is simply negative.',
      },
      hints: ['u · v = uv cos θ. What is the sign of cos 120°?'],
      teach: 'The sign of u · v tells you the angle: positive below 90°, zero at 90°, negative above.',
      explain: t`$\vec u\cdot\vec v = uv\cos120° = -\tfrac12 uv < 0$. For a force and a displacement, that means negative work: the force is taking energy away.`,
      visual: vectorPicture({ arrows: [{ to: [3, 0], label: 'u' }, { to: polar(2.5, 120), color: 'violet', label: 'v' }], arc: { from: 0, to: 120, label: '120°' }, numbers: false }),
    }),
    num({
      id: 'angle-between', difficulty: 2,
      gen(r) {
        const [A, B] = r.pick([[[3, 4, 0], [4, 3, 0]], [[1, 2, 2], [2, -2, 1]], [[2, -1, 2], [1, 1, 0]], [[1, 0, 1], [0, 1, 1]], [[3, -2, 1], [1, 2, 4]], [[2, 3, -1], [-1, 1, 2]]]);
        const c = dot(A, B) / (len(A) * len(B)), th = deg(Math.acos(c));
        return {
          prompt: t`What is the angle between $\vec A = ${vecTeX(A)}$ and $\vec B = ${vecTeX(B)}$?`,
          answer: th, units: '°', tol: { rel: 0.005 },
          errors: [{ value: 90 - th, feedback: t`That is the complement. $\cos\theta = \dfrac{\vec A\cdot\vec B}{AB}$ gives θ directly — use the inverse cosine, not the inverse sine.` }],
          hints: [t`$\cos\theta = \dfrac{\vec A\cdot\vec B}{|\vec A|\,|\vec B|}$.`, t`$\vec A\cdot\vec B = ${dot(A, B)}$, $|\vec A| = \sqrt{${dot(A, A)}}$, $|\vec B| = \sqrt{${dot(B, B)}}$.`],
          teach: 'Put the two forms of the dot product together to find an angle: cos θ = (A · B)/(AB).',
          visual: pair3d(A, B),
          explain: t`$\cos\theta = \dfrac{${dot(A, B)}}{\sqrt{${dot(A, A)}}\sqrt{${dot(B, B)}}} = ${fmt(c, 4)}$, so $\theta = ${fmt(th, 4)}°$.`,
        };
      },
    }),
    mcq({
      id: 'which-perpendicular', difficulty: 2,
      prompt: t`Which vector is perpendicular to $\vec A = (3,\ -2,\ 1)$?`,
      choices: [t`$(2,\ 3,\ 0)$`, t`$(-3,\ 2,\ -1)$`, t`$(2,\ 3,\ 1)$`, t`$(1,\ 1,\ 1)$`],
      answer: 0,
      why: {
        1: t`That is $-\vec A$: antiparallel, at 180°. Its dot product with $\vec A$ is $-14$.`,
        2: t`$(3)(2) + (-2)(3) + (1)(1) = 1$, not 0 — close, but not perpendicular.`,
        3: t`$3 - 2 + 1 = 2 \ne 0$.`,
      },
      hints: ['Perpendicular means the dot product is zero.', 'Compute A · v for each option.'],
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 3, aspect: 'wide',
          planes: [{ normal: [3, -2, 1], point: [0, 0, 0], size: 1.9, color: 'violet', alpha: 0.22 }],
          vectors: [{ to: [3, -2, 1].map((c) => +((2.4 * c) / Math.sqrt(14)).toFixed(4)), color: 'accent', label: '\\vec A' }],
        },
        caption: 'A (blue, scaled to fit) and the plane through the origin perpendicular to it (violet). Every vector perpendicular to A lies in that plane. Drag to rotate.',
      },
      teach: 'Two nonzero vectors are perpendicular exactly when their dot product is zero — the quickest right-angle test there is.',
      explain: t`$(3)(2) + (-2)(3) + (1)(0) = 6 - 6 + 0 = 0$, so $(2,\ 3,\ 0)$ is perpendicular to $\vec A$.`,
    }),
    num({
      id: 'work-at-angle', difficulty: 2,
      gen(r) {
        const F = r.pick([1200, 2500, 4000, 6000]), d = r.pick([15, 25, 40, 60]), a = r.pick([10, 20, 25, 35, 50]);
        const W = F * d * Math.cos(a * DEG);
        return {
          prompt: t`A tug pushes an aircraft along the taxiway with a ${F} N force directed ${a}° below the horizontal, moving it ${d} m. How much work does the tug do on the aircraft?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: F * d, feedback: 'Only the component of the force along the motion does work: include cos θ.' }, { value: F * d * Math.sin(a * DEG), feedback: 'The angle is between the force and the motion, so the component along the motion uses the cosine.' }],
          hints: [t`$W = \vec F\cdot\vec d = Fd\cos\theta$, where θ is the angle between the force and the displacement.`],
          teach: 'Work is the dot product of force and displacement: W = Fd cos θ.',
          explain: t`$W = (${F}\ \text{N})(${d}\ \text{m})\cos ${a}^\circ = ${tex(W, 3)}$ J. The downward part of the push presses the aircraft into the ground and does no work.`,
          visual: vectorPicture({ arrows: [{ to: polar(1, -a), color: 'violet', label: 'F' }, { to: [1.25, 0], label: 'd' }], arc: { from: -a, to: 0, label: `${a}°` }, numbers: false, caption: 'The force and the displacement, tail to tail (directions only; lengths not to scale).' }),
        };
      },
    }),
    num({
      id: 'component-along', difficulty: 3,
      gen(r) {
        const s = r.pick([[2, 3, 6], [1, 2, 2], [2, -1, 2], [3, 4, 12]]);
        const F = r.pick([[120, 80, 40], [200, -60, 90], [-50, 150, 300], [80, 80, -100]]);
        const along = dot(F, s) / len(s);
        return {
          prompt: t`A force $\vec F = ${vecTeX(F)}$ N acts on the end of a strut that lies along the direction $\vec s = ${vecTeX(s)}$. What is the component of $\vec F$ along the strut?`,
          answer: along, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: dot(F, s), feedback: t`$\vec s$ is not a unit vector: divide $\vec F\cdot\vec s$ by $|\vec s| = ${len(s)}$.` }],
          hints: [t`The component of $\vec F$ along $\vec s$ is $\vec F\cdot\hat s = \dfrac{\vec F\cdot\vec s}{|\vec s|}$.`, t`$\vec F\cdot\vec s = ${dot(F, s)}$ and $|\vec s| = ${len(s)}$.`],
          teach: 'The component of a vector along a direction is its dot product with the unit vector of that direction.',
          visual: pair3d(s, F, { la: '\\vec s', lb: '\\vec F', project: true, separate: true, caption: 'The strut direction (blue) and the force (violet), each scaled to fit; directions are exact. Gold: the part of the force along the strut. Drag to rotate.' }),
          explain: t`$\vec F\cdot\hat s = \dfrac{${dot(F, s)}}{${len(s)}} = ${fmt(along, 4)}$ N${along < 0 ? ' — negative, so the force pushes along the strut toward its other end' : ''}.`,
        };
      },
    }),
    num({
      id: 'make-perpendicular', difficulty: 3,
      gen(r) {
        const [a1, a3, b1, b2, b3] = r.pick([[2, 3, 4, -2, 1], [1, -2, 3, 4, 2], [5, 1, 2, 2, -4], [3, 2, -1, 5, 3]]);
        const c = -(a1 * b1 + a3 * b3) / b2;
        return {
          prompt: t`For what value of $c$ are $\vec A = (${a1},\ c,\ ${a3})$ and $\vec B = (${b1},\ ${b2},\ ${b3})$ perpendicular?`,
          answer: c, tol: { rel: 0.002, abs: 0.002 },
          errors: [{ value: (a1 * b1 + a3 * b3) / b2, feedback: 'Check the sign when you move the other terms across the equals sign.' }],
          hints: ['Perpendicular means A · B = 0.', t`$(${a1})(${b1}) + c(${b2}) + (${a3})(${b3}) = 0$; solve for $c$.`],
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 6, aspect: 'wide',
              // a patch of the plane through the origin perpendicular to B, big enough to hold the origin and the crossing point
              planes: [{ normal: [b1, b2, b3], centre: [a1 / 2, c / 2, a3 / 2], size: +(Math.hypot(a1, c, a3) / 2 + 1).toFixed(3), color: 'violet', alpha: 0.2 }],
              vectors: [{ to: [b1, b2, b3], color: 'accent', label: '\\vec B' }],
              // the line's label sits at its far end: run the line away from the crossing so the two labels stay apart
              lines: [{ point: [a1, 0, a3], dir: [0, c > 0 ? -1 : 1, 0], t: [-6.5, 6.5], color: 'gold', label: `(${a1},\\ c,\\ ${a3})` }],
              points: [{ at: [a1, +c.toFixed(4), a3], color: 'gold', label: '\\vec A\\perp\\vec B' }],
            },
            caption: 'B (blue) and part of the plane through the origin perpendicular to it (violet). As c changes, the tip of A slides along the gold line, parallel to the y-axis; A is perpendicular to B where the line pierces the plane (gold dot). Drag to rotate.',
          },
          teach: 'Setting a dot product to zero turns “perpendicular” into an equation you can solve.',
          explain: t`$${a1 * b1} + ${b2}c + ${a3 * b3} = 0$, so $c = ${fmt(c, 4)}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solar-panel', difficulty: 3, transfer: true,
      gen(r) {
        const [n, s] = r.pick([[[0.6, 0.48, 0.64], [0.8, 0.6, 0]], [[0, 0.6, 0.8], [0, 0.8, 0.6]], [[0.36, 0.48, 0.8], [0.6, 0, 0.8]], [[0.8, 0, 0.6], [0.48, 0.6, 0.64]]]);
        const Pmax = r.pick([2.0, 4.5, 6.0]);
        const f = dot(n, s);
        return {
          prompt: t`A satellite’s solar array produces ${Pmax.toFixed(1)} kW when it faces the Sun squarely. In general its power is $P = P_\text{max}\,(\hat n\cdot\hat s)$, where $\hat n$ is the unit vector normal to the panel and $\hat s$ the unit vector toward the Sun. Right now $\hat n = ${vecTeX(n)}$ and $\hat s = ${vecTeX(s)}$. How much power does it produce?`,
          answer: Pmax * f, units: 'kW', tol: { rel: 0.01 },
          errors: [{ value: Pmax, feedback: 'The panel is tilted away from the Sun, so it collects less than its maximum: multiply by n̂ · ŝ.' }],
          hints: [t`$\hat n\cdot\hat s = n_xs_x + n_ys_y + n_zs_z$ — both are unit vectors, so this is $\cos\theta$.`, t`Multiply that number by $P_\text{max} = ${Pmax}$ kW.`],
          teach: 'For unit vectors, the dot product is the cosine of the angle between them — exactly the factor by which tilting cuts a panel’s power.',
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 2, aspect: 'wide',
              planes: [{ normal: n, point: [0, 0, 0], size: 1, color: 'accent', alpha: 0.35, showNormal: true, normalLabel: '\\hat n' }],
              vectors: [{ to: s.map((c) => 1.8 * c), color: 'gold', label: '\\text{to the Sun}' }],
            },
            caption: 'The panel (blue square), its unit normal n̂, and the direction to the Sun. Drag to rotate.',
          },
          explain: t`$\hat n\cdot\hat s = ${fmt(f, 3)}$ (the panel is tilted ${fmt(deg(Math.acos(f)), 3)}° from the Sun), so $P = ${Pmax}\times${fmt(f, 3)} = ${fmt(Pmax * f, 3)}$ kW.`,
        };
      },
    }),
    num({
      id: 'cp-work-3d', difficulty: 2,
      gen(r) {
        const F = r.pick([[300, -100, 200], [50, 120, -80], [-40, 250, 60]]);
        const d = r.pick([[4, 2, 1], [10, 0, -3], [2, 5, 2]]);
        return {
          prompt: t`A force $\vec F = ${vecTeX(F)}$ N acts on a crate while it moves through $\vec d = ${vecTeX(d)}$ m. How much work does the force do?`,
          answer: dot(F, d), units: 'J', tol: { rel: 0.005 },
          errors: [{ value: len(F) * len(d), feedback: t`$Fd$ assumes the force and the motion are parallel. Use $\vec F\cdot\vec d$ in components.` }],
          hints: [t`$W = F_xd_x + F_yd_y + F_zd_z$.`],
          visual: pair3d(F, d, { la: '\\vec F', lb: '\\vec d', separate: true, caption: 'The force (blue) and the displacement (violet), each scaled to fit; their directions are exact. Drag to rotate.' }),
          teach: 'With vectors in components, work is just the dot product: no angle needed.',
          explain: t`$W = (${F[0]})(${d[0]}) + (${F[1]})(${d[1]}) + (${F[2]})(${d[2]}) = ${dot(F, d)}$ J.`,
        };
      },
    }),
    mcq({
      id: 'cp-zero-dot', difficulty: 2,
      prompt: t`Two nonzero vectors have $\vec A\cdot\vec B = 0$. What does that tell you?`,
      choices: ['They are perpendicular', 'They are parallel', 'They point in opposite directions', 'One of them must be zero after all'],
      answer: 0,
      why: {
        1: 'Parallel vectors give the largest possible dot product, AB.',
        2: 'Opposite vectors give the most negative dot product, −AB.',
        3: 'With both magnitudes nonzero, AB cos θ = 0 forces cos θ = 0.',
      },
      hints: ['A · B = AB cos θ, and neither A nor B is zero.'],
      teach: 'A zero dot product between nonzero vectors means a right angle: cos 90° = 0.',
      explain: t`$AB\cos\theta = 0$ with $A, B \ne 0$ means $\cos\theta = 0$: $\theta = 90°$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §2.4', url: 'https://openstax.org/books/university-physics-volume-1/pages/2-4-products-of-vectors' },
  ],
});
