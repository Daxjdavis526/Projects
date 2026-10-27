// Lines and planes in space — a line is a point plus a direction, a plane is a
// point plus a normal. Orbital planes, their normals and the line of nodes.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { QUADS, signed, vecTeX, add, sub, scale, dot, cross, norm, deg } from './_vectors.js';

const t = String.raw;
const D = 'pi/180';
const pointTeX = (p) => `(${p.join(', ')})`;
const fit = (...pts) => Math.max(3, Math.ceil(Math.max(...pts.flat().map(Math.abs))) + 1);

// a·x + b·y + c·z = d, written as both TeX and answer text ("2x - y + 3z = 7")
function planeEq(n, d) {
  let s = '';
  n.forEach((c, k) => {
    if (!c) return;
    const v = 'xyz'[k], mag = Math.abs(c), body = mag === 1 ? v : `${mag}${v}`;
    s += s ? ` ${c < 0 ? '-' : '+'} ${body}` : `${c < 0 ? '-' : ''}${body}`;
  });
  return `${s} = ${d}`;
}
const lineTeX = (P, v) => ['x', 'y', 'z'].map((name, k) => {
  const p = P[k], c = v[k];
  const tt = c === 0 ? '' : c === 1 ? 't' : c === -1 ? '-t' : `${c}t`;
  const rhs = p === 0 ? (tt || '0') : tt ? `${p} ${tt.startsWith('-') ? '-' : '+'} ${tt.replace(/^-/, '')}` : String(p);
  return `${name} = ${rhs}`;
}).join(',\\quad ');

export default lesson({
  id: 'math1220.C2-7.5',
  title: 'Lines and planes in space',
  minutes: 12, difficulty: 3,
  intro: t`A **line** in space is a point it passes through plus a direction to travel; a **plane** is a point it contains plus a **normal** vector perpendicular to it:

$$\vec r(t) = \vec r_0 + t\,\vec v, \qquad \vec n\cdot(\vec r - \vec r_0) = 0$$

Written out, the plane is $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$, or $ax + by + cz = d$ with normal $\vec n = \langle a, b, c\rangle$ — the coefficients **are** the normal. Two planes meet at the angle between their normals, along a line whose direction is $\vec n_1\times\vec n_2$. An orbit is a plane through Earth’s centre; its tilt and its crossing line with the equator are exactly these ideas.`,
  symbols: [
    { tex: '\\vec r_0', text: 'the position vector of a known point on the line or plane' },
    { tex: '\\vec v', text: 'a **direction vector** for the line: any nonzero multiple works' },
    { tex: 't', text: 'the parameter: each real number $t$ gives one point $\\vec r(t)$ of the line' },
    { tex: '\\vec n = \\langle a, b, c\\rangle', text: 'a **normal** vector, perpendicular to every direction within the plane' },
    { tex: '\\vec r = \\langle x, y, z\\rangle', text: 'a general point; it is on the plane exactly when $\\vec r - \\vec r_0$ is perpendicular to $\\vec n$' },
  ],
  why: t`Orbital planes and plane-change manoeuvres, the lines of sight of tracking stations, the surfaces of a wing panel, and later the tangent planes of multivariable calculus all reduce to a point and a vector.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Two planes through Earth’s centre: the equator and an orbit',
    lead: t`Blue: the equatorial plane $z = 0$, normal $\hat k$. Violet: an orbital plane with **inclination** $i$ (its tilt) and **right ascension of the ascending node** $\Omega$ (which way it is tilted). Its normal $\vec n$ is drawn from Earth’s centre. The gold line where the planes cross is the **line of nodes**, along $\hat k\times\vec n$.`,
    tasks: [
      'Raise the inclination: the angle between the planes always equals the angle between their normals.',
      'Turn Ω: the orbital plane swings around Earth’s axis, carrying the line of nodes with it — the inclination does not change.',
      'Push the inclination past 90°: the orbit becomes retrograde, and the normal points below the equator.',
    ],
    params: {
      range: 3,
      grid: false,
      sliders: [
        { key: 'inc', label: 'Inclination $i$', min: 0, max: 150, step: 0.1, value: 51.6, unit: '^\\circ', explain: 'The angle between the orbital plane and the equator (the ISS flies at 51.6°).' },
        { key: 'Om', label: 'Ascending node $\\Omega$', min: 0, max: 360, step: 5, value: 40, unit: '^\\circ', explain: 'The direction, around the equator, where the orbit crosses it heading north.' },
      ],
      planes: [
        { normal: [0, 0, 1], d: 0, size: 2.4, color: 'accent', alpha: 0.14 },
        { normal: [`sin(inc*${D})*sin(Om*${D})`, `-sin(inc*${D})*cos(Om*${D})`, `cos(inc*${D})`], d: 0, size: 2.4, color: 'violet', alpha: 0.26, showNormal: true, normalLabel: t`\vec n` },
      ],
      lines: [{ point: [0, 0, 0], dir: [`cos(Om*${D})`, `sin(Om*${D})`, 0], t: [-2.9, 2.9], color: 'gold', width: 2.6, label: t`\text{nodes}` }],
      points: [{ at: [0, 0, 0], color: 'ink2', r: 6 }],
      readouts: [
        { label: '$\\vec n$', vec: [`sin(inc*${D})*sin(Om*${D})`, `-sin(inc*${D})*cos(Om*${D})`, `cos(inc*${D})`], digits: 3 },
        { label: 'angle between normals', expr: `acos(cos(inc*${D}))*180/pi`, unit: '^\\circ', digits: 4 },
        { label: 'line of nodes along', vec: [`cos(Om*${D})`, `sin(Om*${D})`, 0], digits: 3 },
      ],
    },
    caption: 'Drag to rotate. Planes are drawn as squares around Earth’s centre (the grey dot); real orbital planes extend without limit, and Earth itself is not drawn.',
  },
  example: {
    prompt: t`Find an equation of the plane through $P(1, 0, 0)$, $Q(0, 2, 0)$ and $R(0, 0, 3)$.`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 3.2, yaw: 1.2, pitch: 0.45,   // the default view looks almost along this plane's normal
        planes: [{ normal: [6, 3, 2], point: [1, 0, 0], centre: [0.33, 0.67, 1], size: 1.9, color: 'violet', alpha: 0.25 }],
        triangles: [{ pts: [[1, 0, 0], [0, 2, 0], [0, 0, 3]], color: 'gold', alpha: 0.25 }],
        points: [{ at: [1, 0, 0], label: 'P' }, { at: [0, 2, 0], label: 'Q' }, { at: [0, 0, 3], label: 'R' }],
        vectors: [{ from: [1 / 3, 2 / 3, 1], to: [1 / 3 + 1.2, 2 / 3 + 0.6, 1 + 0.4], color: 'good', label: t`\vec n` }],
      },
      caption: 'Drag to rotate. The gold triangle PQR lies in the violet plane; the green normal is ⟨6, 3, 2⟩, scaled down.',
    },
    steps: [
      { label: 'Two directions in the plane', text: t`$\overrightarrow{PQ} = \langle -1, 2, 0\rangle$ and $\overrightarrow{PR} = \langle -1, 0, 3\rangle$ both lie in the plane.` },
      { label: 'Normal from the cross product', text: t`$\vec n = \overrightarrow{PQ}\times\overrightarrow{PR} = \langle (2)(3) - (0)(0),\ (0)(-1) - (-1)(3),\ (-1)(0) - (2)(-1)\rangle = \langle 6, 3, 2\rangle$.` },
      { label: 'Point–normal form', text: t`Through $P(1, 0, 0)$: $6(x - 1) + 3(y - 0) + 2(z - 0) = 0$, that is $6x + 3y + 2z = 6$.` },
      { label: 'Check the other points', text: t`$Q$: $0 + 6 + 0 = 6$ ✓. $R$: $0 + 0 + 6 = 6$ ✓.` },
      { label: 'Sense check', text: t`Dividing by 6 gives $\frac{x}{1} + \frac{y}{2} + \frac{z}{3} = 1$: the plane cuts the axes at $1$, $2$ and $3$ — exactly where $P$, $Q$ and $R$ sit.` },
    ],
    answer: t`$6x + 3y + 2z = 6$, with normal $\langle 6, 3, 2\rangle$.`,
  },
  practice: [
    mcq({
      id: 'direction-vector', difficulty: 1,
      gen(r) {
        let P, v;
        do { P = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; v = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])]; } while (new Set([vecTeX(v), vecTeX(P), vecTeX(add(P, v)), vecTeX([P[0], v[1], P[2]])]).size < 4);
        return {
          prompt: t`The line $${lineTeX(P, v)}$ — which vector gives its direction?`,
          choices: [t`$${vecTeX(v)}$`, t`$${vecTeX(P)}$`, t`$${vecTeX(add(P, v))}$`, t`$${vecTeX([P[0], v[1], P[2]])}$`],
          answer: 0,
          why: {
            1: t`That is the point where $t = 0$ — a position on the line, not its direction.`,
            2: t`That is the point where $t = 1$. The direction is how far you move per unit of $t$.`,
            3: 'That mixes the starting point and the direction. The direction is the coefficient of t in every coordinate.',
          },
          hints: [t`The direction vector is made of the coefficients of $t$.`],
          teach: t`In $\vec r(t) = \vec r_0 + t\vec v$, the constants give a point and the coefficients of $t$ give the direction.`,
          visual: { type: 'calc-vectors3d', params: { range: fit(P, add(P, v)), lines: [{ point: P, dir: v, t: [-1.5, 1.5], color: 'teal' }], points: [{ at: P, label: t`t = 0`, color: 'teal' }], vectors: [{ from: P, to: add(P, v), color: 'accent' }] }, caption: 'Drag to rotate. The line, its point at t = 0, and the step it takes as t increases by 1.' },
          explain: t`The coefficients of $t$ are $${v.join(', ')}$, so the line runs along $${vecTeX(v)}$ through the point $${pointTeX(P)}$.`,
        };
      },
    }),
    expr({
      id: 'point-normal', difficulty: 2,
      gen(r) {
        let P, n, d;
        do { P = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; n = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])]; d = dot(n, P); } while (d === 0);
        return {
          prompt: t`Write an equation of the plane through $P${pointTeX(P)}$ with normal vector $\vec n = ${vecTeX(n)}$.`,
          answer: planeEq(n, d), answerTeX: planeEq(n, d),
          vars: { x: [-3, 3], y: [-3, 3], z: [-3, 3] }, mode: 'equation',
          errors: [{ answer: planeEq(n, 0), feedback: t`That plane has the right normal but passes through the origin. Use the point: $\vec n\cdot(\vec r - \vec r_0) = 0$.` }],
          keys: [['=', '=']],
          hints: [t`$a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$ with $\langle a, b, c\rangle = ${vecTeX(n)}$.`, t`Expanding gives $${planeEq(n, '\\ldots')}$; the constant is $\vec n\cdot\vec r_0 = ${d}$.`],
          teach: 'The normal’s components are the coefficients of x, y and z; the point fixes the constant.',
          visual: {
            type: 'calc-vectors3d',
            params: { range: fit(P), planes: [{ normal: n, point: P, size: 2.2, color: 'violet', alpha: 0.25 }], points: [{ at: P, label: 'P' }], vectors: [{ from: P, to: add(P, scale(n, 1.6 / norm(n))), color: 'good', label: t`\vec n` }] },
            caption: 'Drag to rotate. The plane through P perpendicular to n (normal drawn shortened).',
          },
          explain: t`$${n[0]}(x - ${P[0]}) + ${n[1]}(y - ${P[1]}) + ${n[2]}(z - ${P[2]}) = 0$ simplifies to $${planeEq(n, d)}$. Any nonzero multiple of this equation describes the same plane.`,
        };
      },
    }),
    num({
      id: 'line-meets-plane', difficulty: 2,
      gen(r) {
        let P, v, n, ts, e;
        do {
          P = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; v = [r.intExcept(-3, 3, [0]), r.int(-3, 3), r.intExcept(-3, 3, [0])];
          n = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])]; ts = r.intExcept(-3, 3, [0]);
          e = dot(n, add(P, scale(v, ts)));
        } while (dot(n, v) === 0 || P[2] + ts * v[2] === 0);
        const X = add(P, scale(v, ts));
        return {
          prompt: t`The line $${lineTeX(P, v)}$ meets the plane $${planeEq(n, e)}$. What is the $z$-coordinate of the point where they meet?`,
          answer: X[2], tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: ts, feedback: t`That is the parameter $t$ at the meeting point. Put it back into the equation for $z$.` }].filter((x) => x.value !== X[2]),
          hints: ['Substitute the line’s x, y and z (in terms of t) into the plane’s equation and solve for t.', t`You should find $t = ${ts}$. Then compute $z$.`],
          teach: 'To intersect a line with a plane, substitute the parametric line into the plane equation: one equation for t.',
          visual: {
            type: 'calc-vectors3d',
            params: { range: fit(P, X), planes: [{ normal: n, point: X, size: 2.4, color: 'violet', alpha: 0.22 }], lines: [{ point: P, dir: v, t: [Math.min(0, ts) - 1.2, Math.max(0, ts) + 1.2], color: 'teal' }], points: [{ at: P, label: t`t = 0`, color: 'teal' }, { at: X, color: 'gold' }] },
            caption: 'Drag to rotate. The teal line pierces the violet plane at the gold point.',
          },
          explain: t`Substituting gives $${dot(n, v)}t ${dot(n, P) < 0 ? '-' : '+'} ${Math.abs(dot(n, P))} = ${e}$, so $t = ${ts}$, and the point is $${pointTeX(X)}$: $z = ${X[2]}$.`,
        };
      },
    }),
    num({
      id: 'distance-to-plane', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), n = signed(r, [a, b, c]), e = r.int(-8, 8);
        let Q, val;
        do { Q = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; val = dot(n, Q) - e; } while (val === 0);
        const dist = Math.abs(val) / L;
        return {
          prompt: t`How far is the point $${pointTeX(Q)}$ from the plane $${planeEq(n, e)}$?`,
          answer: dist, tol: { rel: 1e-3 },
          errors: [{ value: Math.abs(val), feedback: t`Divide by the length of the normal, $|\vec n| = ${L}$: the formula measures along the unit normal.` }].filter((x) => Math.abs(x.value - dist) > 1e-6),
          hints: [t`Distance $= \dfrac{|ax_1 + by_1 + cz_1 - d|}{\sqrt{a^2 + b^2 + c^2}}$.`, t`Here $|\vec n| = \sqrt{${a * a} + ${b * b} + ${c * c}} = ${L}$.`],
          teach: 'The distance from a point to a plane is the projection, onto the unit normal, of any vector from the plane to the point.',
          visual: (() => {
            const foot = sub(Q, scale(n, val / (L * L)));
            return {
              type: 'calc-vectors3d',
              params: { range: fit(Q, foot), planes: [{ normal: n, point: foot, size: 2.4, color: 'violet', alpha: 0.22 }], points: [{ at: Q, label: 'Q' }], segments: [{ from: Q, to: foot, color: 'gold', dash: true }] },
              caption: 'Drag to rotate. The distance is measured along the normal: the dashed segment meets the plane at a right angle.',
            };
          })(),
          explain: t`$\frac{|${dot(n, Q)} - (${e})|}{${L}} = \frac{${Math.abs(val)}}{${L}} = ${nice(dist, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'parallel-planes', difficulty: 2,
      prompt: t`Which plane is parallel to — and different from — the plane $2x - y + 3z = 5$?`,
      choices: [t`$4x - 2y + 6z = 1$`, t`$-2x + y - 3z = -5$`, t`$x + 2y = 7$`, t`$2x + y + 3z = 5$`],
      answer: 0,
      why: {
        1: t`That is the same equation multiplied by $-1$: the same plane, not a different parallel one.`,
        2: t`Its normal $\langle 1, 2, 0\rangle$ has dot product $2 - 2 + 0 = 0$ with $\langle 2, -1, 3\rangle$: the planes are perpendicular.`,
        3: t`Its normal $\langle 2, 1, 3\rangle$ is not a multiple of $\langle 2, -1, 3\rangle$, so the planes cross.`,
      },
      hints: ['Parallel planes have parallel normals: the coefficients must be in proportion.', 'Then check that the constant is not in the same proportion, or it is the same plane.'],
      teach: 'Planes are parallel when their normals are; they are the same plane when the whole equations are proportional.',
      visual: { type: 'calc-vectors3d', params: { range: 3.5, planes: [{ normal: [2, -1, 3], d: 5, size: 2.4, color: 'violet', alpha: 0.25, showNormal: true, normalLabel: t`\vec n` }] }, caption: 'Drag to rotate. The plane 2x − y + 3z = 5 and its normal ⟨2, −1, 3⟩. A parallel plane shares that normal direction.' },
      explain: t`$4x - 2y + 6z = 1$ has normal $\langle 4, -2, 6\rangle = 2\langle 2, -1, 3\rangle$, so it is parallel, and since $1 \ne 2\times5$ it is a different plane.`,
    }),
    num({
      id: 'angle-between-planes', difficulty: 3,
      gen(r) {
        let n1, L1, n2, L2, c;
        do {
          const q1 = r.pick(QUADS), q2 = r.pick(QUADS);
          n1 = signed(r, q1.slice(0, 3)); L1 = q1[3]; n2 = signed(r, q2.slice(0, 3)); L2 = q2[3];
          c = dot(n1, n2) / (L1 * L2);
        } while (Math.abs(c) > 0.97 || Math.abs(c) < 0.05);
        const th = deg(Math.acos(Math.abs(c)));
        return {
          prompt: t`Find the (acute) angle between the planes $${planeEq(n1, r.int(-5, 5))}$ and $${planeEq(n2, r.int(-5, 5))}$, to one decimal place.`,
          answer: th, units: '°', tol: { rel: 2e-3, abs: 0.1 },
          errors: [{ value: 180 - th, feedback: 'The angle between planes is reported as the acute one: if the normals make an obtuse angle, subtract it from 180°.' }],
          hints: ['The angle between two planes is the angle between their normals.', t`$\cos\theta = \frac{|\vec n_1\cdot\vec n_2|}{|\vec n_1||\vec n_2|}$, with $\vec n_1\cdot\vec n_2 = ${dot(n1, n2)}$, $|\vec n_1| = ${L1}$, $|\vec n_2| = ${L2}$.`],
          teach: 'Read the normals off the coefficients; the planes meet at the angle between them (taking the acute one).',
          visual: {
            type: 'calc-vectors3d',
            params: { range: 3, grid: false, planes: [{ normal: n1, d: 0, size: 2.2, color: 'accent', alpha: 0.2, showNormal: true, normalLabel: t`\vec n_1` }, { normal: n2, d: 0, size: 2.2, color: 'violet', alpha: 0.22, showNormal: true, normalLabel: t`\vec n_2` }] },
            caption: 'Drag to rotate. Both planes are drawn through the origin: shifting a plane does not change its tilt.',
          },
          explain: t`$\cos\theta = \frac{${Math.abs(dot(n1, n2))}}{${L1}\cdot${L2}} = ${nice(Math.abs(c), 4)}$, so $\theta = ${nice(th, 4)}^\circ$. The constants on the right do not matter: shifting a plane does not change its tilt.`,
        };
      },
    }),
    mcq({
      id: 'intersection-direction', difficulty: 2,
      prompt: t`The planes $x + y + z = 6$ and $x - y = 0$ meet in a line. Which vector points along it?`,
      choices: [t`$\langle 1, 1, -2\rangle$`, t`$\langle 2, 0, 1\rangle$`, t`$\langle 1, -1, 0\rangle$`, t`There is no line: $\vec n_1\cdot\vec n_2 = 0$, so the planes do not meet`],
      answer: 0,
      why: {
        1: t`That is $\vec n_1 + \vec n_2$. The line lies in both planes, so it is perpendicular to both normals: use $\vec n_1\times\vec n_2$.`,
        2: t`That is the normal of the second plane — perpendicular to it, so it cannot lie in it.`,
        3: 'A zero dot product means the planes are perpendicular, and perpendicular planes certainly meet.',
      },
      hints: ['The line lies in both planes, so it is perpendicular to both normals.', t`Compute $\langle 1, 1, 1\rangle\times\langle 1, -1, 0\rangle$.`],
      teach: t`The line where two planes meet runs along $\vec n_1\times\vec n_2$, the direction perpendicular to both normals.`,
      visual: { type: 'calc-vectors3d', params: { range: 4.5, planes: [{ normal: [1, 1, 1], d: 6, centre: [2, 2, 2], size: 2.2, color: 'accent', alpha: 0.2 }, { normal: [1, -1, 0], d: 0, centre: [2, 2, 2], size: 2.2, color: 'violet', alpha: 0.22 }], lines: [{ point: [2, 2, 2], dir: [1, 1, -2], t: [-1.2, 1.2], color: 'gold', width: 2.6 }] }, caption: 'Drag to rotate. The two planes and the gold line where they cross.' },
      explain: t`$\langle 1, 1, 1\rangle\times\langle 1, -1, 0\rangle = \langle (1)(0) - (1)(-1),\ (1)(1) - (1)(0),\ (1)(-1) - (1)(1)\rangle = \langle 1, 1, -2\rangle$. Check: it satisfies both $1 + 1 - 2 = 0$ and $1 - 1 = 0$ as a direction.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-three-points', difficulty: 3,
      gen(r) {
        let P, Q, R, n, d;
        do {
          P = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)]; Q = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)]; R = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
          n = cross(sub(Q, P), sub(R, P)); d = dot(n, P);
        } while (n.some((x) => x === 0) || d === 0);
        return {
          prompt: t`Write an equation of the plane through $${pointTeX(P)}$, $${pointTeX(Q)}$ and $${pointTeX(R)}$.`,
          answer: planeEq(n, d), answerTeX: planeEq(n, d),
          vars: { x: [-3, 3], y: [-3, 3], z: [-3, 3] }, mode: 'equation',
          errors: [{ answer: planeEq(n, 0), feedback: 'That has the right normal but passes through the origin; use one of the points for the constant.' }],
          keys: [['=', '=']],
          hints: [t`A normal is $\overrightarrow{PQ}\times\overrightarrow{PR}$ — take any two sides from the same point.`, t`$\vec n = ${vecTeX(n)}$; the constant is $\vec n$ dotted with any of the points.`],
          teach: 'Plane through three points: normal from a cross product of two sides, constant from one point.',
          visual: { type: 'calc-vectors3d', params: { range: fit(P, Q, R), triangles: [{ pts: [P, Q, R], color: 'gold' }], points: [{ at: P }, { at: Q }, { at: R }] }, caption: 'Drag to rotate. The three points and the triangle they make; the plane you want contains it.' },
          explain: t`$\vec n = ${vecTeX(n)}$ and $\vec n\cdot${pointTeX(P)} = ${d}$, so $${planeEq(n, d)}$. All three points satisfy it.`,
        };
      },
    }),
    num({
      id: 'cp-distance', difficulty: 2,
      gen(r) {
        const [a, b, c, L] = r.pick(QUADS), n = signed(r, [a, b, c]), e = r.int(-9, 9);
        let Q, val;
        do { Q = [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)]; val = dot(n, Q) - e; } while (val === 0);
        return {
          prompt: t`Find the distance from $${pointTeX(Q)}$ to the plane $${planeEq(n, e)}$.`,
          answer: Math.abs(val) / L, tol: { rel: 1e-3 },
          errors: [{ value: Math.abs(val), feedback: t`Divide by $|\vec n| = ${L}$.` }].filter((x) => Math.abs(x.value - Math.abs(val) / L) > 1e-6),
          hints: [t`$\dfrac{|ax_1 + by_1 + cz_1 - d|}{|\vec n|}$.`],
          teach: 'Point-to-plane distance: plug the point in, take the absolute value, divide by |n|.',
          visual: { type: 'calc-vectors3d', params: { range: fit(Q, sub(Q, scale(n, val / (L * L)))), planes: [{ normal: n, point: sub(Q, scale(n, val / (L * L))), size: 2.4, color: 'violet', alpha: 0.22 }], points: [{ at: Q, label: 'Q' }] }, caption: 'Drag to rotate. The plane and the point.' },
          explain: t`$\frac{|${val}|}{${L}} = ${nice(Math.abs(val) / L, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-plane-change', difficulty: 3, transfer: true,
      gen(r) {
        const [i1, i2, O2, v] = r.pick([[51.6, 28.5, 0, 7.66], [28.5, 0, 0, 3.07], [51.6, 51.6, 30, 7.66], [98, 97, 10, 7.5], [28.5, 51.6, 60, 7.7]]);
        const Dg = Math.PI / 180;
        const n1 = [0, -Math.sin(i1 * Dg), Math.cos(i1 * Dg)].map((x) => +x.toFixed(4));
        const n2 = [Math.sin(i2 * Dg) * Math.sin(O2 * Dg), -Math.sin(i2 * Dg) * Math.cos(O2 * Dg), Math.cos(i2 * Dg)].map((x) => +x.toFixed(4));
        const th = Math.acos(dot(n1, n2) / (norm(n1) * norm(n2))), dv = 2 * v * Math.sin(th / 2);
        return {
          prompt: t`A satellite moves at $${v}$ km/s in a circular orbit whose plane has unit normal $\vec n_1 = ${vecTeX(n1)}$. Mission control wants it in the plane with unit normal $\vec n_2 = ${vecTeX(n2)}$. A single burn where the planes cross must turn the velocity through the angle $\theta$ between the planes, which costs $\Delta v = 2v\sin\frac{\theta}{2}$. Find $\Delta v$.`,
          answer: dv, units: 'km/s', tol: { rel: 3e-3 },
          errors: [{ value: 2 * v * Math.sin(th), feedback: t`Use half the angle: $\Delta v = 2v\sin\frac{\theta}{2}$.` }],
          hints: [t`$\cos\theta = \vec n_1\cdot\vec n_2$ (both are unit vectors).`, t`$\vec n_1\cdot\vec n_2 = ${nice(dot(n1, n2), 4)}$, so $\theta = ${nice(deg(th), 4)}^\circ$.`],
          teach: 'The angle between two orbital planes is the angle between their normals; turning the velocity through it is a plane change.',
          visual: { type: 'calc-vectors3d', params: { range: 3, grid: false, planes: [{ normal: n1, d: 0, size: 2.3, color: 'accent', alpha: 0.2, showNormal: true, normalLabel: t`\vec n_1` }, { normal: n2, d: 0, size: 2.3, color: 'violet', alpha: 0.22, showNormal: true, normalLabel: t`\vec n_2` }] }, caption: 'Drag to rotate. The two orbital planes through Earth’s centre and their normals.' },
          explain: t`$\theta = \arccos(${nice(dot(n1, n2), 4)}) = ${nice(deg(th), 4)}^\circ$, so $\Delta v = 2(${v})\sin(${nice(deg(th) / 2, 4)}^\circ) = ${nice(dv, 3)}$ km/s. Turning a fast velocity is expensive, which is why launch sites and orbits are chosen to avoid plane changes, and why missions that need one often make it far from Earth, where $v$ is small, or combine it with another burn.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §2.5 Equations of Lines and Planes in Space', url: 'https://openstax.org/books/calculus-volume-3/pages/2-5-equations-of-lines-and-planes-in-space' },
  ],
});
