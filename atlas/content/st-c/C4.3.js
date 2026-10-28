// Isometries: maps that keep the first fundamental form. The bent sheet and
// the cylinder (and cone) are locally isometric to the plane; the helicoid
// and catenoid to each other; no map of the Earth is isometric (Theorema
// Egregium preview) — map projections choose what to keep.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, mesh } from './_dg.js';
import { R_EARTH } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;
const PI = r6(Math.PI);
const TAU = r6(2 * Math.PI);

// Explore: s = 0 a sheet bent by b (curvature of the bend); s = 1 the
// helicoid–catenoid associate family at angle al.
const BEND = (u, v) => [`sin(b*(${u}))/b`, `${v}`, `(1 - cos(b*(${u})))/b`];
const ASSOC = (u, v) => [`cos(al)*sinh(${v})*sin(${u}) + sin(al)*cosh(${v})*cos(${u})`, `-cos(al)*sinh(${v})*cos(${u}) + sin(al)*cosh(${v})*sin(${u})`, `(${u})*cos(al) + (${v})*sin(al)`];
const mix = (u, v) => BEND(u, v).map((e, i) => `(1 - s)*(${e}) + s*(${ASSOC(u, v)[i]})`);
const tri = [[-2.2, -0.9], [2.4, -0.7], [0.2, 1.05]];
const seg = (P, Q, X, when) => ({ param: X(`(${P[0]} + (${r6(Q[0] - P[0])})*t)`, `(${P[1]} + (${r6(Q[1] - P[1])})*t)`), t: [0, 1], color: 'gold', width: 3, when });

// Mercator: y = ln tan(π/4 + λ/2)
const merc = (l) => Math.log(Math.tan(Math.PI / 4 + (l * DEG) / 2));
const mercatorGrid = (caption) => ({
  type: 'graph',
  params: {
    x: [-3.3, 3.3], y: [-0.25, 2.65], equal: true, xlabel: 'longitude (rad)', ylabel: 'y', grid: false,
    hlines: [0, 15, 30, 45, 60, 75].map((l) => ({ y: r6(merc(l)), label: `${l}°N`, color: l === 0 ? 'ink2' : 'accent' })),
    vlines: [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ x: r6((k * Math.PI) / 3), color: 'ink3' })),
  },
  caption,
});

export default lesson({
  id: 'st-c.C4.3',
  title: 'Isometries: why a cylinder is flat',
  minutes: 12, difficulty: 3,
  equation: t`E = \tilde E,\quad F = \tilde F,\quad G = \tilde G`,
  intro: t`Two surfaces $S$ and $\tilde S$, each with a patch on the same $(u, v)$ map, are **locally isometric** when the matching points have the same first fundamental form — the equations above. Then every curve has the same length on both, every angle and every area agree, and an inhabitant measuring only *within* the surface cannot tell them apart.

Roll a sheet of paper into a cylinder of radius $a$: with $x = a\varphi$ as a coordinate, $(a\cos\frac xa,\ a\sin\frac xa,\ z)$ has $E = 1$, $F = 0$, $G = 1$, exactly the plane’s $dx^2 + dz^2$. **A cylinder is bent, but it is not curved** — in the sense this course will make precise. The isometry is only local: $x$ and $x + 2\pi a$ land on the same point, so the cylinder is the plane rolled up, not the plane itself.`,
  symbols: [
    { tex: 'E,\\ F,\\ G', text: t`the first fundamental form of $S$ at $\mathbf X(u, v)$` },
    { tex: t`\tilde E,\ \tilde F,\ \tilde G`, text: t`that of $\tilde S$ at the matching point $\tilde{\mathbf X}(u, v)$` },
    { tex: 'a', text: 'the radius of the cylinder, in the units of the sheet' },
    { tex: 'x', text: t`arc length round the cylinder, $x = a\varphi$: the coordinate that makes the cylinder’s metric the plane’s` },
  ],
  why: t`An isometry is the right notion of “the same space”: GR’s coordinate freedom (gr.S07.i) is the statement that relabelling points changes the components of $g$ but not the geometry. And the question “can this be flattened?” — which C6.1 answers with Gauss’s $K$ — is the question “is spacetime curved?”.`,
  visual: {
    type: 'surface3d',
    title: 'Bending without stretching',
    lead: t`Two families of surfaces, each a single surface bent through a family of shapes without stretching. Watch what changes in space — and what an inhabitant would measure.`,
    tasks: [
      t`Sheet: bend it from flat to a full cylinder. The gold triangle and the diagonal line keep their lengths and angles throughout; the straight line becomes a helix.`,
      t`Helicoid → catenoid: slide the angle from $0^\circ$ to $90^\circ$. One turn of the helicoid (a spiral staircase of rulings) twists into the catenoid’s neck: every member has the same $ds^2 = \cosh^2 v\,(du^2 + dv^2)$.`,
      t`In the middle of that slide, at about $45^\circ$, the surface is neither — and still isometric to both.`,
    ],
    params: {
      surface: mix('u', 'v'), domain: [[-PI, PI], [-1.2, 1.2]], n: 40, alpha: 0.78, pitch: 0.35, yaw: -0.9, dist: 6.5,
      choices: [{ key: 's', label: 'Family', options: [[0, 'sheet → cylinder'], [1, 'helicoid → catenoid']], value: 0, explain: 'Each family is one surface bent through a range of shapes; its first fundamental form never changes.' }],
      sliders: [
        { key: 'b', label: 'Bend of the sheet', min: 0.02, max: 1, step: 0.01, value: 0.45, explain: 'The curvature 1/a of the cylinder the sheet is wrapped on; at 1 the sheet, 2π wide, closes up. (Sheet only.)' },
        { key: 'al', label: 'Associate angle', min: 0, max: 1.5708, step: 0.01, value: 0, explain: 'The surface is cos(angle) × helicoid + sin(angle) × catenoid; 0 is the helicoid, 1.57 (90°) the catenoid. (Helicoid–catenoid only.)' },
      ],
      curves: [
        ...[[0, 1], [1, 2], [2, 0]].map(([i, j]) => seg(tri[i], tri[j], mix, '1 - s')),
        { param: mix('t', '0.35*t'), t: [-3, 3], color: 'accent', width: 2.4, when: '1 - s' },
        { param: mix('t', '0'), t: [-PI, PI], color: 'gold', width: 3, when: 's' },
        { param: mix('0', 't'), t: [-1.2, 1.2], color: 'accent', width: 2.4, when: 's' },
      ],
    },
    caption: t`Sheet: $(-\pi, \pi)\times(-1.2, 1.2)$ wrapped on a cylinder of radius $1/b$. Associate family (with $c = 1$): $\cos\alpha\,(\sinh v\sin u,\ -\sinh v\cos u,\ u) + \sin\alpha\,(\cosh v\cos u,\ \cosh v\sin u,\ v)$ for $|u| \le \pi$, $|v| \le 1.2$. Colour shows height only.`,
  },
  example: {
    prompt: t`Show that the helicoid $\mathbf X(u, v) = (\sinh v\cos u,\ \sinh v\sin u,\ u)$ and the catenoid $\tilde{\mathbf X}(u, v) = (\cosh v\cos u,\ \cosh v\sin u,\ v)$ are locally isometric, and say why they are not the same surface.`,
    visual: { type: 'surface3d', params: { surface: ['sinh(v)*cos(u)', 'sinh(v)*sin(u)', 'u'], domain: [[-PI, PI], [-1.2, 1.2]], alpha: 0.75, pitch: 0.3, dist: 9, curves: [{ param: ['sinh(t)', '0', '0'], t: [-1.2, 1.2], color: 'accent', width: 3 }, { param: ['cos(t)', 'sin(t)', 't'], t: [-PI, PI], color: 'gold', width: 3 }] }, caption: t`One turn of the helicoid. The ruling $u = 0$ (blue) is a straight line; the helix $v = 0.88$ (gold, where $\sinh v = 1$) has the same length as a circle on the catenoid.` },
    steps: [
      { label: 'Helicoid', text: t`$\mathbf X_u = (-\sinh v\sin u,\ \sinh v\cos u,\ 1)$, $\mathbf X_v = (\cosh v\cos u,\ \cosh v\sin u,\ 0)$. So $E = \sinh^2 v + 1 = \cosh^2 v$, $F = 0$, $G = \cosh^2 v$.` },
      { label: 'Catenoid', text: t`$\tilde{\mathbf X}_u = \cosh v\,(-\sin u,\ \cos u,\ 0)$, $\tilde{\mathbf X}_v = (\sinh v\cos u,\ \sinh v\sin u,\ 1)$. So $\tilde E = \cosh^2 v$, $\tilde F = 0$, $\tilde G = \sinh^2 v + 1 = \cosh^2 v$.` },
      { label: 'Compare', text: t`Identical: $ds^2 = \cosh^2 v\,(du^2 + dv^2)$ on both. The map sending $\mathbf X(u, v)$ to $\tilde{\mathbf X}(u, v)$ is a local isometry.` },
      { label: 'Not congruent', text: t`The helicoid contains straight lines (its rulings, $u$ fixed); the catenoid contains none. No rigid motion carries one onto the other: same intrinsic geometry, different shape in space.` },
      { label: 'Only local', text: t`On the catenoid $u$ and $u + 2\pi$ are the same point; on the helicoid they are a full turn apart. The map wraps the infinite helicoid round the catenoid again and again, like a sheet round a cylinder.` },
    ],
    answer: t`Both have $ds^2 = \cosh^2 v\,(du^2 + dv^2)$, so they are locally isometric; they are not congruent (only the helicoid has straight lines) and the isometry is not one-to-one.`,
  },
  practice: [
    mcq({
      id: 'paper-triangle', difficulty: 1,
      prompt: 'You draw a triangle on a flat sheet of paper, measure its angles, then roll the sheet into a cylinder without stretching it. What is the sum of the triangle’s angles now, measured on the paper?',
      visual: { type: 'surface3d', params: { surface: BEND('u', 'v').map((e) => e.replace(/b/g, '0.7')), domain: [[-PI, PI], [-1.2, 1.2]], alpha: 0.75, pitch: 0.35, yaw: -0.9, dist: 8.5, axes: false, curves: [[0, 1], [1, 2], [2, 0]].map(([i, j]) => seg(tri[i], tri[j], (u, v) => BEND(u, v).map((e) => e.replace(/b/g, '0.7')))) }, caption: 'The paper half rolled up, with the triangle (gold) drawn on it.' },
      choices: [t`Still $180^\circ$`, t`More than $180^\circ$, because the paper now curves`, t`Less than $180^\circ$, because the sides have become curves`, 'It depends on how the triangle sits relative to the axis'],
      answer: 0,
      why: {
        1: t`The paper bends but does not stretch: every angle drawn on it, measured along the paper, is unchanged — that is what $E = \tilde E$, $F = \tilde F$, $G = \tilde G$ guarantees.`,
        2: 'The sides curve in space, but on the paper they are still the shortest paths between the corners, and the angles between them have not changed.',
        3: 'Its orientation changes how the triangle looks in space, not anything measured along the paper.',
      },
      hints: ['Rolling does not stretch the paper. What does that say about angles drawn on it?'],
      teach: 'Bending without stretching is an isometry, and isometries keep every length and angle measured in the surface.',
      explain: t`The angle sum is $180^\circ$. On a sphere the sum would exceed $180^\circ$ — that excess is curvature (C5.4, C6.4), and it is exactly what rolling paper cannot create.`,
    }),
    multi({
      id: 'which-flat', difficulty: 2,
      prompt: 'Which of these surfaces can be made from a flat sheet by bending alone, with no stretching or tearing (away from any tip or edge)? Select every one.',
      visual: { type: 'calc-vectors3d', params: { range: 2.4, grid: false, axes: false, curves: [...mesh((u, v) => [`0.5*${v}*cos(${u}) - 1.2`, `0.5*${v}*sin(${u})`, `${v} - 0.8`], [0, TAU], [0, 1.8], { nu: 12, nv: 4, closedU: true, color: 'accent' }), ...mesh((u, v) => [`0.8*cos(${u}) + 1.2`, `0.8*sin(${u})`, `${v}`], [0, TAU], [-0.8, 1], { nu: 12, nv: 3, closedU: true, color: 'teal' })] }, caption: 'A cone (blue) and a cylinder (teal), drawn by their straight rulings and circles.' },
      choices: ['A cylinder', 'A cone (without its tip)', 'A piece of a sphere', t`The saddle $z = xy$`, 'A helicoid'],
      answer: [0, 1],
      why: {
        2: 'Any flat map of a piece of sphere distorts something: circles drawn round a point are too short (C5.4), and C6.1 proves no bending can fix that.',
        3: t`The saddle bends both ways at once. Its curvature $K = -1/(1 + x^2 + y^2)^2$ is never zero, so it cannot be isometric to the plane (C6.1).`,
        4: t`The helicoid is isometric to the catenoid, not to the plane: its $K = -1/\cosh^4 v$ is negative.`,
      },
      hints: ['Try it with paper: which of these can you make by rolling?', 'A cone and a cylinder both unroll onto the table; a sphere and a saddle wrinkle or tear.'],
      teach: 'Surfaces you can roll from paper — cylinders and cones — are locally isometric to the plane.',
      explain: t`Cut a cone along a ruling and it lies flat as a sector of a disc; a cylinder unrolls to a strip. Both have $ds^2 = dx^2 + dy^2$ in suitable coordinates. Sphere, saddle and helicoid do not — the obstacle is Gauss’s curvature $K$, which bending cannot change.`,
    }),
    num({
      id: 'cone-sector', difficulty: 2,
      gen(r) {
        const alpha = r.pick([20, 30, 40, 45, 60]), s = r.pick([0.5, 1, 2]);
        const ang = 360 * Math.sin(alpha * DEG);
        return {
          prompt: t`A cone has half-angle $\alpha = ${alpha}^\circ$ at its tip (the angle between the axis and a ruling) and slant length $${s}$ m. Cut it along a ruling and unroll it: you get a sector of a disc of radius $${s}$ m. What is the sector’s angle, in degrees?`,
          visual: { type: 'surface3d', params: { surface: [`v*${r6(Math.sin(alpha * DEG))}*cos(u)`, `v*${r6(Math.sin(alpha * DEG))}*sin(u)`, `-v*${r6(Math.cos(alpha * DEG))}`], domain: [[0, TAU], [0, s]], alpha: 0.75, pitch: 0.3, dist: r6(2.4 * s), target: [0, 0, r6(-0.5 * s * Math.cos(alpha * DEG))], axes: false, curves: [{ param: [`t*${r6(Math.sin(alpha * DEG))}`, '0', `-t*${r6(Math.cos(alpha * DEG))}`], t: [0, s], color: 'gold', width: 3 }] }, caption: 'The cone, tip up, with the ruling to cut along (gold).' },
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 360 - ang, feedback: 'That is the angle of the piece left over — the gap in the disc, not the sector itself.' }, { value: 2 * alpha, feedback: t`$2\alpha$ is the cone’s opening angle in space. The sector’s angle comes from matching lengths: its arc must equal the base circle.` }].filter((e) => Math.abs(e.value - ang) > 0.02 * ang),
          hints: [t`The base circle has radius $${s}\sin\alpha$, so circumference $2\pi\cdot${s}\sin\alpha$. Unrolling keeps that length.`, t`A sector of radius $${s}$ and angle $\theta$ has arc length $${s}\,\theta$. Set them equal.`],
          teach: t`A cone of half-angle $\alpha$ unrolls into a sector of angle $2\pi\sin\alpha$ — the isometry keeps the rim’s length.`,
          explain: t`$\theta = 2\pi\sin\alpha = 360^\circ\times\sin ${alpha}^\circ = ${nice(ang, 4)}^\circ$, whatever the slant length. The missing $${nice(360 - ang, 4)}^\circ$ is the cone’s **deficit angle**: C6.3 shows it is all the curvature of the cone, concentrated at the tip.`,
        };
      },
    }),
    num({
      id: 'mercator-area', difficulty: 3,
      gen(r) {
        const [place, l] = r.pick([['central Greenland', 72], ['Oslo', 60], ['Svalbard', 78], ['Paris', 49], ['Antarctica’s coast', 70]]);
        const k2 = 1 / Math.cos(l * DEG) ** 2;
        return {
          prompt: t`Mercator’s map has coordinates $x = \varphi$ (longitude) and $y = \ln\tan(\tfrac\pi4 + \tfrac\lambda2)$. In them, the Earth’s metric is $ds^2 = R^2\cos^2\lambda\,(dx^2 + dy^2)$. Near ${place} (latitude $${l}^\circ$), by what factor does the map exaggerate **areas** compared with the equator?`,
          visual: mercatorGrid(t`Mercator’s grid: meridians every $60^\circ$ and parallels every $15^\circ$, at their true map positions.`),
          answer: k2, tol: { rel: 0.01 },
          errors: [{ value: 1 / Math.cos(l * DEG), feedback: t`That is the *length* scale, $1/\cos\lambda$. Areas scale by its square, since the map stretches both directions equally.` }, { value: Math.cos(l * DEG) ** 2, feedback: t`That is the factor the other way round: map distances must be multiplied by $R\cos\lambda$ to get true ones, so the map *enlarges* by $1/\cos\lambda$.` }],
          hints: [t`A map step $(dx, dy)$ has true length $R\cos\lambda\,\sqrt{dx^2 + dy^2}$: at the equator the factor is $R$, at latitude $\lambda$ it is $R\cos\lambda$.`, t`So the map enlarges lengths by $1/\cos\lambda$ relative to the equator, in every direction; areas by $1/\cos^2\lambda$.`],
          teach: t`A metric $\Omega^2(dx^2 + dy^2)$ keeps angles (it is conformal) but scales lengths by $\Omega$ and areas by $\Omega^2$.`,
          explain: t`$1/\cos^2 ${l}^\circ = ${nice(k2, 3)}$. Mercator keeps angles — a compass course is a straight line on it, which is why navigators used it — and pays in area: Greenland (2.2 million km²) looks comparable to Africa (30 million km²).`,
        };
      },
    }),
    mcq({
      id: 'conformal', difficulty: 2,
      prompt: t`In Mercator’s coordinates the sphere’s metric is $ds^2 = R^2\cos^2\lambda\,(dx^2 + dy^2)$, with $E = G$ and $F = 0$. What does that form of the metric tell you about the map?`,
      visual: mercatorGrid('Mercator’s grid. Each little cell is a true square on the Earth, but cells near the poles stand for much smaller squares.'),
      choices: ['Angles on the map are true angles on the Earth, but lengths are not', 'The map is an isometry', 'The map shows true areas', 'Angles and lengths are both distorted, by the same factor'],
      answer: 0,
      why: {
        1: t`An isometry needs $ds^2 = dx^2 + dy^2$ (times $R^2$) *everywhere*. The factor $\cos^2\lambda$ changes from place to place.`,
        2: t`Map areas are $dx\,dy$, true areas $R^2\cos^2\lambda\,dx\,dy$: they differ by the varying factor $\cos^2\lambda$.`,
        3: t`Angles come from $\cos\theta = \mathrm I(\mathbf a, \mathbf b)/\sqrt{\mathrm I(\mathbf a, \mathbf a)\mathrm I(\mathbf b, \mathbf b)}$, in which a common factor cancels. So angles are not distorted at all.`,
      },
      hints: [t`Put $\mathrm I = \Omega^2(dx^2 + dy^2)$ into the angle formula of C4.2 and see what happens to $\Omega$.`],
      teach: t`A metric of the form $\Omega^2(dx^2 + dy^2)$ is conformal: it preserves angles while scaling lengths by $\Omega$.`,
      explain: t`The factor $\Omega^2 = R^2\cos^2\lambda$ cancels from every angle. Mercator chose angles; Lambert’s equal-area map (C4.2) chose areas. Neither can have both, because a map that kept angles *and* areas would be an isometry — and C6.1 shows none exists.`,
    }),
    order({
      id: 'sheet-isometry', difficulty: 3,
      prompt: t`Show that wrapping the plane onto a cylinder of radius $a$, $(x, y) \mapsto \big(a\sin\frac xa,\ y,\ a(1 - \cos\frac xa)\big)$, is a local isometry. Order the steps.`,
      visual: { type: 'surface3d', params: { surface: BEND('u', 'v').map((e) => e.replace(/b/g, '1')), domain: [[-PI, PI], [-1.2, 1.2]], alpha: 0.75, pitch: 0.3, yaw: -0.9, dist: 7, axes: false, curves: [{ param: BEND('t', '0.35*t').map((e) => e.replace(/b/g, '1')), t: [-3, 3], color: 'gold', width: 3 }] }, caption: t`The wrapped sheet with $a = 1$: a straight line on the sheet becomes a helix.` },
      items: [
        t`$\mathbf X_x = \big(\cos\frac xa,\ 0,\ \sin\frac xa\big)$ and $\mathbf X_y = (0,\ 1,\ 0)$.`,
        t`So $E = \cos^2\frac xa + \sin^2\frac xa = 1$, $F = 0$, $G = 1$.`,
        t`The plane, parameterized by $(x, y)$, has $E = 1$, $F = 0$, $G = 1$ too.`,
        t`Equal first fundamental forms: every curve keeps its length, so the map is a local isometry.`,
        t`It is not one-to-one: $x$ and $x + 2\pi a$ go to the same point, so it is not a global isometry.`,
      ],
      hints: ['Compute the first fundamental form of the wrapped sheet first.', 'Compare with the plane, then ask whether the map can be undone everywhere.'],
      teach: 'To show a map is a local isometry, show it carries the first fundamental form of one surface to that of the other.',
      explain: t`This is the precise sense in which “a cylinder is flat”. The same computation for a cone uses polar coordinates on the sheet, $(r, \vartheta)$ with $0 \le \vartheta < 2\pi\sin\alpha$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fairing', difficulty: 2, transfer: true,
      gen(r) {
        const rb = r.pick([0.4, 0.6, 0.9, 1.2]), h = r.pick([1.2, 1.8, 2.4]);
        const s = Math.hypot(rb, h), ang = (360 * rb) / s;
        return {
          prompt: t`A conical nose fairing of base radius $${rb}$ m and height $${h}$ m is to be rolled from flat aluminium sheet. What angle must the sector cut from the sheet have, in degrees?`,
          visual: { type: 'surface3d', params: { surface: [`${rb}*(1 - v/${h})*cos(u)`, `${rb}*(1 - v/${h})*sin(u)`, 'v'], domain: [[0, TAU], [0, h]], alpha: 0.75, pitch: 0.25, dist: r6(1.7 * (h + rb)), target: [0, 0, r6(h / 2)], axes: false }, caption: 'The fairing, to scale (a real fairing is an ogive or a cone with a rounded tip; the cone is a simplification).' },
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: (360 * rb) / h, feedback: t`The sector’s radius is the slant length $\sqrt{r^2 + h^2}$, not the height: that is the distance from tip to rim measured along the sheet.` }, { value: 360 - ang, feedback: 'That is the gap left over, not the sector.' }].filter((e) => Math.abs(e.value - ang) > 0.02 * ang),
          hints: [t`Unrolling is an isometry: the sector’s radius is the slant length $s = \sqrt{${rb}^2 + ${h}^2}$ m and its arc is the base circumference $2\pi\times${rb}$ m.`, t`$\theta = 360^\circ\times r/s$.`],
          teach: 'An isometry keeps lengths: the unrolled sector’s radius is the slant length and its arc the rim.',
          explain: t`$s = ${nice(s, 4)}$ m, so $\theta = 360^\circ\times ${rb}/${nice(s, 4)} = ${nice(ang, 4)}^\circ$. Sheet-metal work relies on this: only developable surfaces (cones, cylinders and their relatives) can be formed from flat stock without stretching it.`,
        };
      },
    }),
    num({
      id: 'cp-circle', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([500, 1000, 2000, 3000, 5000]);
        const C = 2 * Math.PI * R_EARTH * Math.sin(rho / R_EARTH), short = 2 * Math.PI * rho - C;
        return {
          prompt: t`On the Earth (radius $6371$ km), the points at distance $\rho = ${rho}$ km from the North Pole, measured along the surface, form a circle of colatitude $\rho/R$. Its circumference is $2\pi R\sin(\rho/R)$. By how many kilometres does it fall short of $2\pi\rho$, the circumference an isometric flat map would show?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.4, grid: false, axes: false, pitch: 0.5, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink4' }], points: [{ at: [0, 0, 1], color: 'gold', label: 'N' }], curves: [{ param: [`${r6(Math.sin(rho / R_EARTH))}*cos(t)`, `${r6(Math.sin(rho / R_EARTH))}*sin(t)`, `${r6(Math.cos(rho / R_EARTH))}`], t: [0, TAU], color: 'gold', width: 2.6 }, { param: [`sin(t)`, '0', 'cos(t)'], t: [0, r6(rho / R_EARTH)], color: 'accent', width: 3 }] }, caption: t`The circle (gold) and one radius $\rho$ measured along the surface (blue).` },
          answer: short, units: 'km', tol: { rel: 0.01 },
          hints: [t`$\rho/R = ${nice(rho / R_EARTH, 4)}$ rad; compute $2\pi R\sin(\rho/R)$ and subtract it from $2\pi\rho$.`, t`For small $\rho$, $\sin x \approx x - x^3/6$, so the shortfall is about $\pi\rho^3/(3R^2)$.`],
          teach: 'An isometry keeps every length; circles on a sphere are shorter than flat circles of the same radius, so no flat map of the sphere is isometric.',
          explain: t`$2\pi\rho = ${nice(2 * Math.PI * rho, 5)}$ km and $2\pi R\sin(\rho/R) = ${nice(C, 5)}$ km: a shortfall of $${nice(short, 3)}$ km. A flat map that kept the radius would have to keep the circumference too, and cannot. C5.4 turns this shortfall into a measurement of curvature.`,
        };
      },
    }),
    multi({
      id: 'cp-same-I', difficulty: 3,
      prompt: t`The helicoid and the catenoid have the same $E$, $F$, $G$ at matching points. Which of these must also agree at matching points? Select every one.`,
      visual: { type: 'surface3d', params: { surface: ['cosh(v)*cos(u)', 'cosh(v)*sin(u)', 'v'], domain: [[0, TAU], [-1.2, 1.2]], alpha: 0.75, pitch: 0.25, dist: 8 }, caption: 'The catenoid, isometric to the helicoid of the worked example.' },
      choices: ['The length of any curve', 'The area of any region', 'The angle between two curves', 'Whether a curve is a straight line in space', 'The direction of the unit normal'],
      answer: [0, 1, 2],
      why: {
        3: 'The helicoid’s rulings are straight lines in space; their images on the catenoid are catenaries. Straightness in space is extrinsic.',
        4: 'The normal depends on how the surface sits in space. The two surfaces face very different ways at matching points.',
      },
      hints: [t`Lengths, angles and areas are all computed from $E$, $F$, $G$ (C4.2).`, 'Anything that needs the surrounding space — straight lines in space, the normal — can differ.'],
      teach: 'Isometric surfaces agree on everything computed from E, F, G and may differ in everything that needs the surrounding space.',
      explain: t`Lengths, areas and angles agree; the shape in space does not. The deep question for C5–C6: is curvature like length (intrinsic) or like the normal (extrinsic)? Gauss’s answer is “both kinds exist”, and the Gaussian curvature is intrinsic.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-2', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Needham, Visual Differential Geometry and Forms, ch. 1–3', url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms' },
  ],
});
