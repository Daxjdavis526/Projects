// Charts and atlases: a chart is a homeomorphism from an open patch onto an
// open subset of ℝⁿ; an atlas is a set of charts that covers the space;
// transition maps convert between overlapping charts. Stereographic charts
// on the circle and the sphere, the transition (X, Y) ↦ (X, Y)/(X² + Y²),
// latitude–longitude as a chart and what it misses, and why no single chart
// covers the sphere (compactness and connectedness).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);
const DEG = Math.PI / 180;

// the unit sphere with a few parallels, for calc-vectors3d
const parallels = [-60, -30, 30, 60].map((lat) => ({ param: [`${r6(Math.cos(lat * DEG))}*cos(t)`, `${r6(Math.cos(lat * DEG))}*sin(t)`, String(r6(Math.sin(lat * DEG)))], t: [0, TAU], color: 'ink4', width: 1 }));
const sphere = { spheres: [{ centre: [0, 0, 0], radius: 1, color: 'teal' }], curves: parallels };
const NS = [{ at: [0, 0, 1], color: 'ink', label: 'N' }, { at: [0, 0, -1], color: 'ink', label: 'S' }];

// the explore: p at colatitude th and longitude ph (degrees), its two stereographic images
const TH = 'th*pi/180', PH = 'ph*pi/180';
const PX = `sin(${TH})*cos(${PH})`, PY = `sin(${TH})*sin(${PH})`, PZ = `cos(${TH})`;
const XN = `(${PX})/(1 - ${PZ})`, YN = `(${PY})/(1 - ${PZ})`;
const XS = `(${PX})/(1 + ${PZ})`, YS = `(${PY})/(1 + ${PZ})`;

// the circle x² + y² = 1 in the plane, its north pole and a point
const circlePic = (alpha, { line = false, caption, extra = {} } = {}) => {
  const x = r6(Math.cos(alpha)), y = r6(Math.sin(alpha));
  const X = r6(x / (1 - y));
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-1.5, 1.5], equal: true, aspect: 'wide', grid: false, xticks: line ? 7 : 0, yticks: 0,
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'teal', width: 2.2 }, line ? { param: [`${X}*t`, '1 - t'], t: [0, 1], color: 'gold', width: 1.6, dash: [5, 4] } : null].filter(Boolean),
      points: [{ x: 0, y: 1, color: 'ink', label: 'N' }, { x, y, color: 'gold', label: 'p' }, ...(line ? [{ x: X, y: 0, color: 'accent', label: 'X' }] : [])],
      ...extra,
    },
    caption,
  };
};

export default lesson({
  id: 'st-c.C8.1',
  title: 'Charts and atlases',
  minutes: 14, difficulty: 3,
  intro: t`A **chart** on a space $M$ is a pair $(U, \varphi)$: an open set $U \subset M$ and a map $\varphi: U \to \mathbb R^n$ that is a homeomorphism onto an open subset of $\mathbb R^n$ — a continuous, invertible assignment of coordinates with a continuous inverse. An **atlas** is a collection of charts whose patches cover $M$. Where two patches overlap, a point has two sets of coordinates, and the **transition map** $\varphi_\beta\circ\varphi_\alpha^{-1}$ converts one into the other.

The sphere is the model. Project from the north pole $N$ through a point $p$ onto the equatorial plane: that is the **stereographic chart** $\sigma_N(x, y, z) = \dfrac{(x, y)}{1 - z}$, defined everywhere except $N$. Projecting from $S$ gives $\sigma_S = \dfrac{(x, y)}{1 + z}$, defined except at $S$. Together they cover the sphere, and on the overlap

$$\sigma_S\circ\sigma_N^{-1}(X, Y) = \frac{(X, Y)}{X^2 + Y^2}.$$`,
  symbols: [
    { tex: t`(x, y, z)`, text: t`a point of the unit sphere $x^2 + y^2 + z^2 = 1$ in space (used only to build the charts)` },
    { tex: t`\sigma_N,\ \sigma_S`, text: 'the stereographic charts from the north and south poles: each takes the sphere minus one pole onto the whole plane' },
    { tex: t`(X, Y)`, text: t`the coordinates a point gets from $\sigma_N$` },
    { tex: t`\sigma_N^{-1}`, text: t`the inverse map: coordinates back to the point, $\sigma_N^{-1}(X, Y) = \dfrac{(2X,\ 2Y,\ X^2 + Y^2 - 1)}{X^2 + Y^2 + 1}$` },
    { tex: t`\sigma_S\circ\sigma_N^{-1}`, text: t`the transition map: north coordinates in, south coordinates out. It is defined on the overlap, the plane minus its origin (the origin is the south pole, which $\sigma_S$ cannot see)` },
  ],
  why: t`Spacetime is described in charts — Schwarzschild’s, Kruskal’s, a falling observer’s — and no chart is privileged. Physics must be stated so that it survives every transition map; that is what tensors are for. And when a chart misbehaves (Schwarzschild’s at $r = 2M$), the first question is whether the space is sick or only the chart.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Two charts on one sphere',
    lead: t`A point $p$ on the unit sphere and its two stereographic images in the equatorial plane: from $N$ (gold line, image $\sigma_N(p)$) and from $S$ (violet line, image $\sigma_S(p)$). Move $p$ with the sliders and drag to turn the view.`,
    tasks: [
      t`Bring $p$ toward $N$ (small colatitude): $\sigma_N(p)$ runs off toward infinity — $N$ itself has no north coordinates. Toward $S$ the violet image runs off instead.`,
      t`Put $p$ on the equator (colatitude $90^\circ$): both images coincide with $p$, and both charts give it the same coordinates.`,
      t`Watch the last readout: the two images always lie on the same ray from the centre, with lengths multiplying to exactly 1. That is the transition map.`,
    ],
    params: {
      range: 1.3, grid: false, yaw: 0.35, pitch: 0.55,
      sliders: [
        { key: 'th', label: t`colatitude of $p$`, min: 34, max: 146, step: 1, value: 60, unit: t`^\circ`, explain: 'Angle down from the north pole: 0° would be N, 180° S. The range stops short of the poles so the images stay on screen.' },
        { key: 'ph', label: t`longitude of $p$`, min: 0, max: 360, step: 1, value: 30, unit: t`^\circ`, explain: 'Angle round the axis from the x-axis.' },
      ],
      ...sphere,
      planes: [{ normal: [0, 0, 1], d: 0, size: 2.6, color: 'violet', alpha: 0.1 }],
      points: [...NS, { at: [PX, PY, PZ], color: 'gold', label: 'p' }, { at: [XN, YN, 0], color: 'gold', label: t`\sigma_N(p)` }, { at: [XS, YS, 0], color: 'violet', label: t`\sigma_S(p)` }],
      segments: [{ from: [0, 0, 1], to: [XN, YN, 0], color: 'gold' }, { from: [0, 0, -1], to: [XS, YS, 0], color: 'violet' }],
      readouts: [
        { label: t`$X$`, expr: XN, digits: 3 }, { label: t`$Y$`, expr: YN, digits: 3 },
        { label: t`$X'$`, expr: XS, digits: 3 }, { label: t`$Y'$`, expr: YS, digits: 3 },
        { label: t`$(X^2 + Y^2)(X'^2 + Y'^2)$`, expr: `((${XN})^2 + (${YN})^2)*((${XS})^2 + (${YS})^2)`, digits: 4 },
      ],
    },
    caption: t`Exact projections of the unit sphere (three great circles and four parallels) onto the plane $z = 0$. $(X, Y) = \sigma_N(p)$ and $(X', Y') = \sigma_S(p)$.`,
  },
  example: {
    prompt: t`For the point $p = (\tfrac23, \tfrac13, \tfrac23)$ of the unit sphere, compute $\sigma_N(p)$ and $\sigma_S(p)$, then derive the transition map $\sigma_S\circ\sigma_N^{-1}$ and check it on $p$.`,
    visual: { type: 'calc-vectors3d', params: { range: 1.3, grid: false, yaw: 0.35, pitch: 0.55, ...sphere, planes: [{ normal: [0, 0, 1], d: 0, size: 2.6, color: 'violet', alpha: 0.1 }], points: [...NS, { at: [r6(2 / 3), r6(1 / 3), r6(2 / 3)], color: 'gold', label: 'p' }, { at: [2, 1, 0], color: 'gold', label: t`\sigma_N(p)` }, { at: [0.4, 0.2, 0], color: 'violet', label: t`\sigma_S(p)` }], segments: [{ from: [0, 0, 1], to: [2, 1, 0], color: 'gold' }, { from: [0, 0, -1], to: [0.4, 0.2, 0], color: 'violet' }] }, caption: t`The point $p$ and its two images, to scale.` },
    steps: [
      { label: 'On the sphere', text: t`$\tfrac49 + \tfrac19 + \tfrac49 = 1$ ✓, and $z = \tfrac23$ is neither pole, so both charts see $p$.` },
      { label: 'North chart', text: t`$1 - z = \tfrac13$, so $\sigma_N(p) = (\tfrac23, \tfrac13)\big/\tfrac13 = (2, 1)$.` },
      { label: 'South chart', text: t`$1 + z = \tfrac53$, so $\sigma_S(p) = (\tfrac23, \tfrac13)\big/\tfrac53 = (0.4, 0.2)$.` },
      { label: 'Invert the north chart', text: t`The line from $N$ through $(X, Y, 0)$ meets the sphere again at $\sigma_N^{-1}(X, Y) = \dfrac{(2X,\ 2Y,\ X^2 + Y^2 - 1)}{X^2 + Y^2 + 1}$ (check: its length is 1).` },
      { label: 'Compose', text: t`$1 + z = \dfrac{2(X^2 + Y^2)}{X^2 + Y^2 + 1}$, so $\sigma_S = \dfrac{(2X, 2Y)/(X^2 + Y^2 + 1)}{2(X^2 + Y^2)/(X^2 + Y^2 + 1)} = \dfrac{(X, Y)}{X^2 + Y^2}$.` },
      { label: 'Check', text: t`$(2, 1)/(4 + 1) = (0.4, 0.2)$ ✓. The overlap is the sphere minus both poles; in north coordinates that is the plane minus the origin, exactly where the formula is defined.` },
    ],
    answer: t`$\sigma_N(p) = (2, 1)$, $\sigma_S(p) = (0.4, 0.2)$, and $\sigma_S\circ\sigma_N^{-1}(X, Y) = (X, Y)/(X^2 + Y^2)$ on $\mathbb R^2 \setminus \{0\}$.`,
  },
  practice: [
    num({
      id: 'north-coord', difficulty: 2,
      gen(r) {
        const [X, Y] = r.pick([[1, 2], [2, 1], [1, 1], [3, 1], [2, 2], [1, 3], [-1, 2], [2, -3]]);
        const D = X * X + Y * Y + 1, p = [2 * X / D, 2 * Y / D, (X * X + Y * Y - 1) / D];
        return {
          prompt: t`The point $p = \left(${frac(p[0])},\ ${frac(p[1])},\ ${frac(p[2])}\right)$ lies on the unit sphere. What is its first north-chart coordinate $X$, where $\sigma_N(x, y, z) = (x, y)/(1 - z)$?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.3, grid: false, yaw: 0.35, pitch: 0.55, ...sphere, planes: [{ normal: [0, 0, 1], d: 0, size: 2.6, color: 'violet', alpha: 0.1 }], points: [...NS, { at: p.map(r6), color: 'gold', label: 'p' }] }, caption: 'The point on the unit sphere, above or below the equatorial plane that receives the projection.' },
          answer: X, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: p[0] / (1 + p[2]), feedback: t`That is the south chart, $x/(1 + z)$. The north chart divides by $1 - z$.` }, { value: p[0], feedback: t`Divide by $1 - z$: projecting from the pole stretches every point outward.` }].filter((e) => Math.abs(e.value - X) > 0.02),
          hints: [t`$1 - z = ${frac(1 - p[2])}$.`, t`$X = x/(1 - z) = ${frac(p[0])} \div ${frac(1 - p[2])}$.`],
          teach: 'The north stereographic chart divides the horizontal position by the distance below the north pole, 1 − z.',
          explain: t`$X = ${frac(p[0])} \div ${frac(1 - p[2])} = ${X}$ (and $Y = ${Y}$). ${p[2] > 0 ? 'The point is in the northern hemisphere, so its image lies outside the unit circle.' : 'The point is in the southern hemisphere, so its image lies inside the unit circle.'}`,
        };
      },
    }),
    num({
      id: 'transition', difficulty: 2,
      gen(r) {
        const [X, Y] = r.pick([[2, 1], [1, 3], [3, -1], [-2, 2], [0.5, 1], [1, -2]]);
        const Xp = X / (X * X + Y * Y);
        return {
          prompt: t`A point of the sphere has north-chart coordinates $(X, Y) = (${X}, ${Y})$. What is its first south-chart coordinate $X'$?`,
          visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-3.6, 3.6], equal: true, aspect: 'wide', xticks: 7, yticks: 7, xlabel: 'X', ylabel: 'Y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'teal', width: 1.6, label: 'equator', labelAt: 0.7 }], points: [{ x: X, y: Y, color: 'gold', label: '(X, Y)' }, { x: 0, y: 0, r: 4, hollow: true, color: 'ink2' }] }, caption: 'The north chart’s plane: the equator is the unit circle, the south pole is the origin (open dot), and the north pole is at infinity.' },
          answer: Xp, tol: { rel: 0.002 },
          errors: [{ value: 1 / X, feedback: t`On the circle the transition is $X' = 1/X$; on the sphere you divide by $X^2 + Y^2$, the squared distance from the origin.` }, { value: X * (X * X + Y * Y), feedback: 'Divide by X² + Y², not multiply: a point far out in the north chart is near the north pole, close to the centre of the south chart.' }].filter((e) => Math.abs(e.value - Xp) > 0.01 * Math.abs(Xp)),
          hints: [t`$\sigma_S\circ\sigma_N^{-1}(X, Y) = (X, Y)/(X^2 + Y^2)$.`, t`$X^2 + Y^2 = ${X * X + Y * Y}$.`],
          teach: 'The stereographic transition map is inversion in the unit circle: same direction, reciprocal distance.',
          explain: t`$X' = ${X}/${X * X + Y * Y} = ${nice(Xp, 4)}$ (and $Y' = ${nice(Y / (X * X + Y * Y), 4)}$). The image lies on the same ray from the origin at distance $1/\sqrt{${X * X + Y * Y}}$ — inversion in the equator.`,
        };
      },
    }),
    mcq({
      id: 'angle-chart', difficulty: 2,
      prompt: t`Why is the angle $\theta \in (0, 2\pi)$, a perfectly good coordinate on most of the circle, not by itself an atlas for the circle?`,
      visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.25, 1.25], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0.03, r6(2 * Math.PI - 0.03)], color: 'teal', width: 2.4 }, { param: ['0.55*cos(t)', '0.55*sin(t)'], t: [0, 2.2], color: 'gold', width: 1.6 }], points: [{ x: 1, y: 0, r: 4.5, hollow: true, color: 'bad', label: 'θ = 0 left out', labelDx: 12 }, { x: 0, y: 0, r: 2.5, color: 'ink2' }, { x: 0.25, y: 0.62, r: 0, label: 'θ' }] }, caption: t`The patch of the angle chart: the circle minus the point $(1, 0)$.` },
      choices: [
        t`Its patch misses the point $(1, 0)$; including it would need the half-open range $[0, 2\pi)$, which is not open, and the angle would jump there`,
        t`It is not continuous anywhere`,
        t`The circle is one-dimensional but a chart must have two coordinates`,
        t`Angles are not real numbers, so they cannot be coordinates`,
      ],
      answer: 0,
      why: {
        1: t`On the open arc it is continuous with a continuous inverse ($\theta \mapsto (\cos\theta, \sin\theta)$). The trouble is only at the missing point.`,
        2: t`A chart on an $n$-dimensional space has $n$ coordinates; for the circle, one.`,
        3: t`On $(0, 2\pi)$ the angle is an ordinary real number. Coordinates can be any real numbers.`,
      },
      hints: ['An atlas must cover every point, and every chart must be defined on an open set with an open image.', 'What happens at the point where the angle would wrap from 2π back to 0?'],
      teach: 'Every chart is defined on an open patch, so a closed curve such as the circle needs at least two of them to be covered.',
      explain: t`Add a second angle chart, $\theta' \in (-\pi, \pi)$, which misses $(-1, 0)$ instead, and the two cover the circle. On the overlap (two arcs) the transition is $\theta' = \theta$ on the upper arc and $\theta' = \theta - 2\pi$ on the lower — smooth on each piece.`,
    }),
    num({
      id: 'circle-stereo', difficulty: 2,
      gen(r) {
        const adeg = r.pick([20, 35, -30, -50, 150, 200, 240]);
        const a = adeg * DEG, x = Math.cos(a), y = Math.sin(a), X = x / (1 - y);
        return {
          prompt: t`On the unit circle, the north stereographic chart is $X = x/(1 - y)$: the line from $N = (0, 1)$ through $p$ meets the $x$-axis at $X$. Find $X$ for the point at angle $${adeg}^\circ$, $p = (\cos ${adeg}^\circ,\ \sin ${adeg}^\circ)$.`,
          visual: circlePic(a, { caption: 'The unit circle, its north pole N and the point p. The chart’s line runs from N through p to the x-axis.' }),
          answer: X, tol: { rel: 0.003 },
          errors: [{ value: x / (1 + y), feedback: t`That is the south chart, $x/(1 + y)$ — projecting from $(0, -1)$.` }, { value: 1 / X, feedback: t`That is $X' = 1/X$, the point’s south-chart coordinate.` }].filter((e) => Math.abs(e.value - X) > 0.01 * Math.abs(X)),
          hints: [t`$x = ${nice(x, 4)}$ and $y = ${nice(y, 4)}$.`, t`$X = ${nice(x, 4)}/(1 - (${nice(y, 4)}))$.`],
          teach: 'The stereographic chart of the circle sends p to where the line from the north pole through p meets the axis.',
          explain: t`$X = ${nice(x, 4)}/${nice(1 - y, 4)} = ${nice(X, 4)}$. ${y > 0 ? 'Upper-half points land outside [−1, 1]; near N they run off to ±∞.' : 'Lower-half points land inside (−1, 1).'} The south chart gives $X' = x/(1 + y) = 1/X = ${nice(1 / X, 4)}$: on the circle the transition map is $X' = 1/X$.`,
          solution: t`By similar triangles, the line from $(0, 1)$ to $(x, y)$ drops $1 - y$ while moving $x$ across; it must drop 1 to reach the axis, so it moves $x/(1 - y)$.`,
        };
      },
    }),
    mcq({
      id: 'origin-overlap', difficulty: 2,
      prompt: t`The transition map $(X, Y) \mapsto (X, Y)/(X^2 + Y^2)$ blows up at $(X, Y) = (0, 0)$. Does that spoil the stereographic atlas?`,
      visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-2, 2], equal: true, aspect: 'wide', xticks: 7, yticks: 5, xlabel: 'X', ylabel: 'Y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'teal', width: 1.6 }, { param: ['2*t', '1*t'], t: [0, 1.4], color: 'ink3', width: 1, dash: [3, 3] }], points: [{ x: 2, y: 1, color: 'gold', label: 'P' }, { x: 0.4, y: 0.2, color: 'violet', label: 'P′', labelDx: 8, labelDy: 14 }, { x: 0, y: 0, r: 4.5, hollow: true, color: 'bad' }] }, caption: t`The transition map sends $P = (2, 1)$ to $P' = (0.4, 0.2)$, along the ray, inside the unit circle; it is undefined at the origin (open dot).` },
      choices: [
        t`No: the origin of the north chart is the south pole, which the south chart does not contain, so the origin is not in the overlap where the transition map is needed`,
        t`Yes: a transition map must be defined on the whole plane`,
        t`Yes: the sphere has a genuine singularity at the south pole`,
        t`No, because the formula can be repaired by defining it to be $(0, 0)$ there`,
      ],
      answer: 0,
      why: {
        1: t`A transition map only has to work on the overlap $\varphi_\alpha(U_\alpha \cap U_\beta)$, not everywhere.`,
        2: t`The sphere is perfectly smooth at $S$ — every point of it looks alike. $S$ is simply the one point $\sigma_S$ cannot reach; the blow-up belongs to the coordinates.`,
        3: t`Points near the origin go off to infinity, so no value at the origin would make the map continuous — and none is needed.`,
      },
      hints: [t`Which point of the sphere has north coordinates $(0, 0)$?`, 'Is that point in the domain of the south chart?'],
      teach: 'A transition map is needed only on the overlap of the two patches; outside it, it may blow up harmlessly.',
      explain: t`$\sigma_N^{-1}(0, 0) = (0, 0, -1) = S$, which $\sigma_S$ excludes. On the true overlap — the plane minus the origin — the map is smooth with a smooth inverse (itself). A formula blowing up is a fact about coordinates, not about the sphere: the same lesson as Schwarzschild’s $r = 2M$.`,
    }),
    mcq({
      id: 'latlong', difficulty: 2,
      prompt: t`Colatitude and longitude $(\theta, \varphi)$ form a chart on the sphere when $\theta \in (0, \pi)$ and $\varphi \in (0, 2\pi)$ — open ranges, as a chart needs. Which part of the sphere does this chart **miss**?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.3, grid: false, yaw: 0.35, pitch: 0.55, ...sphere, curves: [...parallels, ...[60, 120, 180, 240, 300].map((d) => ({ param: [`${r6(Math.cos(d * DEG))}*sin(t)`, `${r6(Math.sin(d * DEG))}*sin(t)`, 'cos(t)'], t: [0, r6(Math.PI)], color: 'ink4', width: 1 }))], points: NS }, caption: 'Lines of constant colatitude and longitude on the unit sphere.' },
      choices: [
        t`The whole half great circle $\varphi = 0$ from pole to pole, poles included`,
        'Only the two poles',
        'The equator',
        'Nothing: every point has a colatitude and a longitude',
      ],
      answer: 0,
      why: {
        1: t`The poles are missed, but so is the meridian $\varphi = 0$: the open range $(0, 2\pi)$ leaves out $\varphi = 0$.`,
        2: t`The equator is $\theta = \pi/2$, inside the range.`,
        3: t`The poles have no well-defined longitude, and $\varphi = 0$ is excluded so that the range is open. A map $[0, 2\pi)$ would jump.`,
      },
      hints: [t`$\theta = 0$ and $\theta = \pi$ are excluded. What else does an open range of $\varphi$ exclude?`],
      teach: 'Latitude and longitude are a chart only on the sphere minus a meridian and the poles — a closed half great circle.',
      explain: t`The chart covers the sphere minus the closed half great circle $\varphi = 0$. A second, rotated copy covers what this one misses, so two such charts make an atlas. The poles’ “singularity” in $(\theta, \varphi)$ is the chart’s, not the sphere’s.`,
    }),
    order({
      id: 'one-chart', difficulty: 3,
      prompt: t`Prove that no single chart can cover the whole sphere $S^2$. Order the steps.`,
      visual: { type: 'calc-vectors3d', params: { range: 1.3, grid: false, yaw: 0.35, pitch: 0.55, ...sphere, points: NS }, caption: 'The unit sphere: closed, bounded, compact.' },
      items: [
        t`Suppose $\varphi: S^2 \to \mathbb R^2$ were a chart covering all of $S^2$; its image $\varphi(S^2)$ is then an open subset of $\mathbb R^2$.`,
        t`$S^2$ is compact and $\varphi$ is continuous, so $\varphi(S^2)$ is compact: closed and bounded.`,
        t`So $\varphi(S^2)$ is non-empty, open and closed in $\mathbb R^2$.`,
        t`$\mathbb R^2$ is connected, so its only non-empty subset that is both open and closed is $\mathbb R^2$ itself.`,
        t`But $\mathbb R^2$ is not bounded — a contradiction. At least two charts are needed.`,
      ],
      hints: ['Use what C7.2 said about compactness: continuous images of compact sets are compact.', 'A set both open and closed in a connected space is empty or everything.'],
      teach: 'A compact manifold can never be covered by one chart, because a chart’s image is open and a compact image is closed and bounded.',
      explain: t`The same argument works for any compact manifold: the torus, every sphere, a closed universe. Two charts suffice for the sphere — the stereographic pair. Notice what the proof needs: only topology. No lengths, no curvature.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-polar-chart', difficulty: 2, transfer: true,
      gen(r) {
        const lat = r.pick([60, 66.56, 70, 75, 80, 85]);
        const R = 6371, theta = (90 - lat) * DEG, rho = R * Math.tan(theta / 2);
        return {
          prompt: t`Polar navigation charts use the stereographic projection. Projecting the Earth (a sphere of radius $6371$ km) from the South Pole onto the equatorial plane, a point at colatitude $\theta$ lands at distance $\rho = R\tan(\theta/2)$ from the centre of the chart. How far from the centre is a point at latitude $${lat}^\circ$N${lat === 66.56 ? ' (the Arctic Circle)' : ''}, in km?`,
          visual: { type: 'graph', params: { x: [-1.7, 1.7], y: [-1.15, 1.15], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'teal', width: 2.2 }, { fn: '0', domain: [-1.7, 1.7], color: 'violet', width: 1.4 }, { param: [`${r6(Math.sin(theta))}*t`, `-1 + ${r6(1 + Math.cos(theta))}*t`], t: [0, 1], color: 'gold', width: 1.6, dash: [5, 4] }], points: [{ x: 0, y: 1, color: 'ink', label: 'N' }, { x: 0, y: -1, color: 'ink', label: 'S' }, { x: r6(Math.sin(theta)), y: r6(Math.cos(theta)), color: 'gold', label: 'p' }] }, caption: 'A slice through the Earth’s axis: the projecting line from S to the point (it crosses the equatorial plane, violet, on its way). Real polar charts also rescale by a constant.' },
          answer: rho, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: R * Math.tan(theta), feedback: t`The half angle matters: the line from the *South* Pole makes half the central angle (an inscribed angle). $\rho = R\tan(\theta/2)$.` }, { value: R * Math.sin(theta), feedback: 'That is the orthographic distance from the axis, not the stereographic one.' }, { value: R * Math.tan((lat * DEG) / 2), feedback: 'Use colatitude θ = 90° − latitude.' }].filter((e) => Math.abs(e.value - rho) > 0.005 * rho),
          hints: [t`$\theta = 90^\circ - ${lat}^\circ = ${nice(90 - lat)}^\circ$.`, t`$\rho = 6371\tan(${nice((90 - lat) / 2)}^\circ)$ km.`],
          teach: 'The south-pole stereographic chart puts colatitude θ at radius R tan(θ/2): the North Pole at the centre, the equator at radius R.',
          explain: t`$\rho = 6371 \times \tan(${nice((90 - lat) / 2)}^\circ) = ${nice(rho, 4)}$ km. (In the unit-sphere notation, this is $R$ times the south chart $\sigma_S$, since $\sin\theta/(1 + \cos\theta) = \tan(\theta/2)$.) Stereographic charts are popular with navigators because they preserve angles — a property C11 will make precise.`,
        };
      },
    }),
    num({
      id: 'cp-back', difficulty: 2,
      gen(r) {
        const [Xp, Yp] = r.pick([[0.2, 0.4], [0.5, -0.5], [-0.1, 0.3], [0.25, 0], [0.6, 0.2]]);
        const X = Xp / (Xp * Xp + Yp * Yp);
        return {
          prompt: t`A point has south-chart coordinates $(X', Y') = (${Xp}, ${Yp})$. What is its north-chart coordinate $X$?`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1, 1], equal: true, aspect: 'wide', xticks: 5, yticks: 5, xlabel: 'X′', ylabel: 'Y′', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'teal', width: 1.6 }], points: [{ x: Xp, y: Yp, color: 'violet', label: '(X′, Y′)' }, { x: 0, y: 0, r: 4, hollow: true, color: 'ink2' }] }, caption: 'The south chart’s plane: the origin (open dot) is the north pole, which this chart does not see; the unit circle is the equator.' },
          answer: X, tol: { rel: 0.002 },
          errors: [{ value: Xp * (Xp * Xp + Yp * Yp), feedback: 'Divide by X′² + Y′²: the inverse of inversion in a circle is the same inversion.' }, { value: 1 / Xp, feedback: t`That is the circle’s rule $1/X'$; on the sphere divide by $X'^2 + Y'^2$.` }].filter((e) => Math.abs(e.value - X) > 0.01 * Math.abs(X)),
          hints: [t`By symmetry (swap the roles of $N$ and $S$), $\sigma_N\circ\sigma_S^{-1}(X', Y') = (X', Y')/(X'^2 + Y'^2)$.`],
          teach: 'The stereographic transition map is its own inverse.',
          explain: t`$X = ${Xp}/${nice(Xp * Xp + Yp * Yp)} = ${nice(X, 4)}$. Inversion in the unit circle undoes itself, so the same formula goes both ways — both transition maps are smooth, which is what C8.2 will demand.`,
        };
      },
    }),
    mcq({
      id: 'cp-min-charts', difficulty: 2,
      prompt: 'What is the smallest number of charts in an atlas of the sphere?',
      visual: { type: 'calc-vectors3d', params: { range: 1.3, grid: false, yaw: 0.35, pitch: 0.55, ...sphere, points: NS }, caption: 'The unit sphere.' },
      choices: ['Two', 'One', 'Three', 'Six, one for each face of a cube'],
      answer: 0,
      why: {
        1: 'One chart is impossible: the sphere is compact, a chart’s image is open, and a non-empty bounded set cannot be both open and closed in the plane.',
        2: 'Three work, but the two stereographic charts already cover everything.',
        3: 'Six graph-style charts (one per hemisphere about each axis) are a common atlas, but not the smallest.',
      },
      hints: ['Can one chart do it? Recall the compactness argument.', 'The stereographic pair misses only N and S respectively.'],
      teach: 'The sphere needs at least two charts, and two stereographic charts are enough.',
      explain: t`$\sigma_N$ covers all but $N$, $\sigma_S$ all but $S$: together, everything. One chart cannot work (compactness). How many charts a space *needs* is a topological fact; which charts you *use* is a choice.`,
    }),
  ],
  sources: [
    { label: 'Lee, Introduction to Smooth Manifolds (2nd ed.), ch. 1', url: 'https://link.springer.com/book/10.1007/978-1-4419-9982-5' },
    { label: 'Carroll, Spacetime and Geometry, §2.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
