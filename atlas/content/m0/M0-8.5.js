// Laws of sines and cosines — trigonometry for any triangle, from triangulation to an orbit's plane-change Δv.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { D2R, triFig } from './_m0trig.js';

const t = String.raw;
const deg = (x) => x / D2R;
const MU = 398600.4418, RE = 6378.137;
// GTO from a 185 km parking orbit to geostationary radius: apogee speed and GEO circular speed (km/s)
const GTO = (() => { const rp = RE + 185, ra = 42164.17, a = (rp + ra) / 2; return { va: Math.sqrt(MU * (2 / ra - 1 / a)), vg: Math.sqrt(MU / ra) }; })();
// worked example: two radar stations 40 km apart track a descending capsule between them
const TRI = (() => { const c = 40, A = 62, B = 71, G = 180 - A - B, b = (c * Math.sin(B * D2R)) / Math.sin(G * D2R); return { c, A, B, G, b, h: b * Math.sin(A * D2R), a: (c * Math.sin(A * D2R)) / Math.sin(G * D2R) }; })();
// a triangle from base c along x and two base angles (degrees): vertices [P, Q, R]
// a label for the angle B at the right-hand corner (c, 0) of such a triangle
const atQ = (c, A, B) => { const G = 180 - A - B, b = (c * Math.sin(B * D2R)) / Math.sin(G * D2R), k = 0.2 * Math.max(c, b * Math.sin(A * D2R)); return { x: N(c - k * Math.cos((B * D2R) / 2)), y: N(k * Math.sin((B * D2R) / 2)), r: 0, label: `${B}°`, color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 }; };
const fromAngles = (c, A, B) => { const G = 180 - A - B, b = (c * Math.sin(B * D2R)) / Math.sin(G * D2R); return [[0, 0], [c, 0], [b * Math.cos(A * D2R), b * Math.sin(A * D2R)]]; };

export default lesson({
  id: 'm0.M0-8.5',
  title: 'Laws of sines and cosines',
  minutes: 11, difficulty: 3,
  intro: t`Right-triangle ratios need a right angle. For **any** triangle — angles $\alpha$, $\beta$, $\gamma$ opposite sides $a$, $b$, $c$ — two laws do the job:

$$\frac{a}{\sin\alpha} = \frac{b}{\sin\beta} = \frac{c}{\sin\gamma}, \qquad c^2 = a^2 + b^2 - 2ab\cos\gamma$$

The **law of sines** pairs each side with its opposite angle: use it when you know a side and its opposite angle (two angles and a side, ASA or AAS). The **law of cosines** is Pythagoras with a correction term: use it for two sides and the angle between them (SAS) or all three sides (SSS). At $\gamma = 90^\circ$ the correction vanishes and it *is* Pythagoras. One trap: given two sides and an angle **not** between them (SSA), there may be no triangle, one, or **two** — because $\sin\beta = k$ has two solutions, $\beta$ and $180^\circ - \beta$.`,
  symbols: [
    { tex: 'a,\\ b,\\ c', text: 'the three side lengths (any one length unit)' },
    { tex: '\\alpha,\\ \\beta,\\ \\gamma', text: 'the angles **opposite** $a$, $b$ and $c$ respectively; they add to $180^\\circ$' },
    { tex: '2ab\\cos\\gamma', text: 'the correction to Pythagoras: zero for a right angle, positive for an acute $\\gamma$ (so $c$ is shorter), negative for an obtuse one' },
  ],
  why: t`Triangulation locates things you cannot reach — a capsule, a mountain top, a star — from angles measured at two known points. In orbital mechanics, two velocity vectors and the angle between them form a triangle whose third side is the $\Delta v$ a burn must supply: the law of cosines prices every plane change.`,
  visual: {
    type: 'graph',
    title: 'Any triangle, two laws',
    lead: t`Drag the top vertex. The base $c$ is fixed; the readouts give the other sides, the angles and the ratios side $/ \sin$(opposite angle).`,
    tasks: [
      t`Drag anywhere: the three ratios $a/\sin\alpha$, $b/\sin\beta$, $c/\sin\gamma$ stay equal to each other (they equal the diameter of the circle through the three corners).`,
      t`Make $\gamma$ a right angle (about $90^\circ$): the correction $2ab\cos\gamma$ drops to zero and $c^2 = a^2 + b^2$.`,
      t`Pull the vertex down towards the base: $\gamma$ grows past $90^\circ$, $\cos\gamma$ turns negative, and $c$ becomes the longest side.`,
    ],
    params: {
      x: [-1, 5], y: [-0.6, 3.6], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, axes: false,
      drag: [{ key: 'r', x: 1.3, y: 2.6, snap: 0.05 }],
      curves: [
        { param: ['4*t', '0'], t: [0, 1], color: 'ink2', width: 2.6 },
        { param: ['4 + t*(rx - 4)', 't*ry'], t: [0, 1], color: 'accent', width: 2.6 },
        { param: ['t*rx', 't*ry'], t: [0, 1], color: 'warn', width: 2.6 },
        { param: ['0.45*cos(t)', '0.45*sin(t)'], t: [0, 'atan2(ry, rx)'], color: 'gold', width: 1.6 },
        { param: ['4 - 0.45*cos(t)', '0.45*sin(t)'], t: [0, 'atan2(ry, 4 - rx)'], color: 'gold', width: 1.6 },
      ],
      points: [
        { x: 2, y: 0, r: 0, label: 'c', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 14 },
        { x: '(4 + rx)/2', y: 'ry/2', r: 0, label: 'a', color: 'accent', labelDx: 10, labelDy: 0 },
        { x: 'rx/2', y: 'ry/2', r: 0, label: 'b', color: 'warn', labelAlign: 'right', labelDx: -10, labelDy: 0 },
        { x: '0.7*cos(atan2(ry, rx)/2)', y: '0.7*sin(atan2(ry, rx)/2)', r: 0, label: 'α', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 },
        { x: '4 - 0.7*cos(atan2(ry, 4 - rx)/2)', y: '0.7*sin(atan2(ry, 4 - rx)/2)', r: 0, label: 'β', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 },
        { x: 'rx', y: 'ry', r: 0, label: 'γ', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 20 },
      ],
      readouts: [
        { label: t`$a$`, expr: 'sqrt((rx - 4)^2 + ry^2)', digits: 3 },
        { label: t`$b$`, expr: 'sqrt(rx^2 + ry^2)', digits: 3 },
        { label: t`$\gamma$ (degrees)`, expr: '180 - (atan2(ry, rx) + atan2(ry, 4 - rx))*180/pi', digits: 4 },
        { label: t`$a/\sin\alpha$`, expr: 'sqrt((rx - 4)^2 + ry^2)/sin(atan2(ry, rx))', digits: 4 },
        { label: t`$b/\sin\beta$`, expr: 'sqrt(rx^2 + ry^2)/sin(atan2(ry, 4 - rx))', digits: 4 },
        { label: t`$c/\sin\gamma$`, expr: '4/sin(atan2(ry, rx) + atan2(ry, 4 - rx))', digits: 4 },
        { label: t`$a^2 + b^2 - 2ab\cos\gamma$`, expr: '(rx - 4)^2 + ry^2 + rx^2 + ry^2 - 2*sqrt((rx - 4)^2 + ry^2)*sqrt(rx^2 + ry^2)*cos(pi - atan2(ry, rx) - atan2(ry, 4 - rx))', digits: 4 },
      ],
    },
    caption: t`To scale, with base $c = 4$. Keep the vertex above the base: below it the angles are measured on the other side.`,
  },
  example: {
    prompt: t`Two radar stations ${TRI.c} km apart track a descending capsule that is between them. From the first station the capsule is $${TRI.A}^\circ$ above the baseline; from the second, $${TRI.B}^\circ$. How far is the capsule from the first station, and how high is it?`,
    visual: triFig({ v: fromAngles(TRI.c, TRI.A, TRI.B), right: null, angleAt: 0, angleLabel: `${TRI.A}°`, sides: [`${TRI.c} km`, '', 'd'], caption: t`The baseline and the two sight lines, to scale; the ground is taken as flat (fine over $${TRI.c}$ km).`, extra: { points: [atQ(TRI.c, TRI.A, TRI.B)] } }),
    steps: [
      { label: 'Third angle', text: t`The angles add to $180^\circ$: at the capsule, $\gamma = 180^\circ - ${TRI.A}^\circ - ${TRI.B}^\circ = ${TRI.G}^\circ$.` },
      { label: 'Pair side with angle', text: t`The baseline $c = ${TRI.c}$ km is opposite $\gamma$. The distance $d$ from the first station is opposite the angle at the **second** station, $${TRI.B}^\circ$.` },
      { label: 'Law of sines', text: t`$\dfrac{d}{\sin ${TRI.B}^\circ} = \dfrac{${TRI.c}}{\sin ${TRI.G}^\circ}$, so $d = \dfrac{${TRI.c} \times ${sig(Math.sin(TRI.B * D2R), 4)}}{${sig(Math.sin(TRI.G * D2R), 4)}} = ${sig(TRI.b, 4)}$ km.` },
      { label: 'Height', text: t`Drop a perpendicular from the capsule: a right triangle with hypotenuse $d$ and angle $${TRI.A}^\circ$, so $h = d\sin ${TRI.A}^\circ = ${sig(TRI.h, 3)}$ km.` },
      { label: 'Check', text: t`From the other station: $\tfrac{${TRI.c}\sin ${TRI.A}^\circ}{\sin ${TRI.G}^\circ}\sin ${TRI.B}^\circ = ${sig(TRI.a * Math.sin(TRI.B * D2R), 3)}$ km ✓ — the same height.` },
    ],
    answer: t`About $${sig(TRI.b, 3)}$ km from the first station, at a height of about $${sig(TRI.h, 3)}$ km.`,
  },
  practice: [
    num({
      id: 'sines-side', difficulty: 2,
      gen(r) {
        const A = r.pick([40, 50, 35, 65]), B = r.pick([60, 75, 80]), c = r.pick([10, 12, 15, 20]), G = 180 - A - B, ans = (c * Math.sin(A * D2R)) / Math.sin(G * D2R);
        return {
          prompt: t`A triangle has angles $\alpha = ${A}^\circ$ and $\beta = ${B}^\circ$, and side $c = ${c}$ m. Find side $a$ (opposite $\alpha$).`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (c * Math.sin(A * D2R)) / Math.sin(B * D2R), feedback: t`$c$ pairs with the angle **opposite** it, $\gamma$ — find $\gamma = 180^\circ - \alpha - \beta$ first, not $\beta$.` }, { value: (c * Math.sin(G * D2R)) / Math.sin(A * D2R), feedback: t`Upside down: $a = c\,\dfrac{\sin\alpha}{\sin\gamma}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\gamma = 180^\circ - ${A}^\circ - ${B}^\circ = ${G}^\circ$.`, t`$\dfrac{a}{\sin\alpha} = \dfrac{c}{\sin\gamma}$.`],
          teach: t`Law of sines: each side over the sine of its opposite angle gives the same number.`,
          explain: t`$a = \dfrac{${c}\sin ${A}^\circ}{\sin ${G}^\circ} = \dfrac{${c} \times ${sig(Math.sin(A * D2R), 4)}}{${sig(Math.sin(G * D2R), 4)}} = ${sig(ans, 4)}$ m.`,
          visual: triFig({ v: fromAngles(c, A, B), angleAt: 0, angleLabel: 'α', sides: [`c = ${c} m`, 'a', 'b'], caption: t`To scale: $c$ along the bottom, $\alpha$ at the left corner, $\beta$ at the right one.` }),
        };
      },
    }),
    num({
      id: 'plane-change', difficulty: 2,
      gen(r) {
        const v = r.pick([7.2, 7.5, 7.7]), di = r.pick([5, 10, 15, 20]), ans = Math.sqrt(2 * v * v * (1 - Math.cos(di * D2R)));
        return {
          prompt: t`A satellite in a circular orbit moves at $${v}$ km/s. A burn swings its velocity through $${di}^\circ$ into a new orbital plane, keeping the speed the same. Its old and new velocities form a triangle with the change $\Delta v$: how big must $\Delta v$ be?`,
          answer: ans, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`The speed is unchanged, but the velocity — a vector — has turned. Its change is the third side of the triangle.` }, { value: 2 * v * Math.sin(di * D2R), feedback: t`$2v\sin\Delta i$ is twice too big for small angles: the exact result is $2v\sin(\Delta i/2)$, from $\Delta v^2 = 2v^2(1 - \cos\Delta i)$.` }],
          hints: [t`Law of cosines with $a = b = ${v}$ km/s and the angle between them $${di}^\circ$.`, t`$\Delta v^2 = ${v}^2 + ${v}^2 - 2(${v})(${v})\cos ${di}^\circ$.`],
          teach: t`The change of a vector is the third side of the triangle it forms with the old vector: the law of cosines gives its length.`,
          explain: t`$\Delta v = \sqrt{2(${v})^2(1 - \cos ${di}^\circ)} = ${sig(ans, 3)}$ km/s $= 2v\sin\tfrac{\Delta i}{2}$ — about $${Math.round((ans / v) * 100)}\%$ of the orbital speed for a $${di}^\circ$ turn. Plane changes are among the costliest manoeuvres in spaceflight.`,
          visual: { type: 'graph', params: { x: [-0.5, 8.5], y: [-0.6, 3.2], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', arrows: [{ from: [0, 0], to: [v, 0], color: 'accent', width: 2.6, label: 'old v', labelDx: -24, labelDy: 14 }, { from: [0, 0], to: [N(v * Math.cos(di * D2R)), N(v * Math.sin(di * D2R))], color: 'warn', width: 2.6, label: 'new v', labelDx: -10, labelDy: -10 }, { from: [v, 0], to: [N(v * Math.cos(di * D2R)), N(v * Math.sin(di * D2R))], color: 'gold', width: 2.2 }], points: [{ x: N((v + v * Math.cos(di * D2R)) / 2), y: N((v * Math.sin(di * D2R)) / 2), r: 0, label: 'Δv', color: 'gold', labelDx: 10, labelDy: 0 }, { x: 1.6, y: N(0.12 + 0.6 * Math.sin(di * D2R)), r: 0, label: `${di}°`, color: 'ink2', labelDx: 0, labelDy: 0 }] }, caption: t`The velocity triangle, to scale: old and new velocities of equal length, and the change between their tips.` },
        };
      },
    }),
    num({
      id: 'cosines-angle', difficulty: 3,
      gen(r) {
        const [a, b, c] = r.pick([[5, 7, 10], [6, 8, 11], [4, 9, 11], [7, 8, 13]]), ans = deg(Math.acos((a * a + b * b - c * c) / (2 * a * b)));
        return {
          prompt: t`A triangular truss has sides of $${a}$ m, $${b}$ m and $${c}$ m. What is its largest angle?`,
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: deg(Math.acos((b * b + c * c - a * a) / (2 * b * c))), feedback: t`That is the smallest angle, opposite the shortest side. The largest angle is opposite the longest side, $${c}$ m.` }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.5),
          hints: [t`The largest angle is opposite the longest side, $${c}$ m.`, t`$\cos\gamma = \dfrac{${a}^2 + ${b}^2 - ${c}^2}{2 \cdot ${a} \cdot ${b}}$.`],
          teach: t`Given three sides, solve the law of cosines for the cosine of an angle: $\cos\gamma = \dfrac{a^2 + b^2 - c^2}{2ab}$.`,
          explain: t`$\cos\gamma = \dfrac{${a * a} + ${b * b} - ${c * c}}{${2 * a * b}} = ${sig((a * a + b * b - c * c) / (2 * a * b), 4)}$, so $\gamma = ${sig(ans, 4)}^\circ$ — obtuse, since the cosine is negative (and $${c}^2 > ${a}^2 + ${b}^2$).`,
          visual: (() => { const g = Math.acos((a * a + b * b - c * c) / (2 * a * b)), al = Math.asin((a * Math.sin(g)) / c); return triFig({ v: [[0, 0], [c, 0], [b * Math.cos(al), b * Math.sin(al)]], sides: [`${c} m`, `${a} m`, `${b} m`], caption: t`The truss to scale; the angle you want sits at the top, opposite the longest side.` }); })(),
        };
      },
    }),
    mcq({
      id: 'ssa-count', difficulty: 3,
      gen(r) {
        const al = r.pick([30, 40]), b = 10, h = b * Math.sin(al * D2R), kind = r.pick(['none', 'two', 'one']);
        const a = kind === 'none' ? Math.floor(h) - 1 : kind === 'two' ? Math.round((h + b) / 2) : b + 2;
        const ans = { none: 0, one: 1, two: 2 }[kind];
        const C = ['no triangle', 'exactly one triangle', 'exactly two triangles', 'infinitely many triangles'];
        return {
          prompt: t`A triangle is to have $\alpha = ${al}^\circ$, $b = ${b}$ cm and $a = ${a}$ cm (side $a$ opposite $\alpha$, so the angle is **not** between the two sides). How many triangles fit these data? (The height from the top vertex to the base line is $b\sin\alpha = ${sig(h, 3)}$ cm.)`,
          visual: { type: 'graph', params: { x: [-1, 17], y: [-1.2, 7], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['16*t', '0'], t: [0, 1], color: 'ink3', width: 1.6, dash: true }, { param: [`t*${N(b * Math.cos(al * D2R))}`, `t*${N(h)}`], t: [0, 1], color: 'warn', width: 2.6 }, { param: [N(b * Math.cos(al * D2R)), `t*${N(h)}`], t: [0, 1], color: 'ink3', width: 1.2, dash: true }, { param: ['1.4*cos(t)', '1.4*sin(t)'], t: [0, N(al * D2R)], color: 'gold', width: 1.6 }], points: [{ x: 2.1, y: 0.45, r: 0, label: `${al}°`, color: 'gold', labelDx: 0, labelDy: 0 }, { x: N((b * Math.cos(al * D2R)) / 2), y: N(h / 2), r: 0, label: `b = ${b}`, color: 'warn', labelAlign: 'right', labelDx: -8, labelDy: -6 }, { x: N(b * Math.cos(al * D2R)), y: N(h / 2), r: 0, label: 'h', color: 'ink3', labelDx: 6, labelDy: 0 }, { x: N(b * Math.cos(al * D2R)), y: N(h), color: 'ink', r: 4 }] }, caption: t`The given angle and side $b$, with the base line (dashed) along which side $a = ${a}$ cm must reach from the top vertex.` },
          choices: C,
          answer: ans,
          why: Object.fromEntries([0, 1, 2, 3].filter((k) => k !== ans).map((k) => [k, k === 3 ? t`Three pieces of data that fix a triangle’s size never allow a continuous family; the possibilities are $0$, $1$ or $2$.` : k === 0 ? t`Side $a = ${a}$ cm is longer than the height $${sig(h, 3)}$ cm, so it reaches the base line.` : k === 1 ? (kind === 'two' ? t`Side $a$ is shorter than $b$ but longer than the height, so it can swing to meet the base line on **either** side of the foot of the height: two triangles, with $\beta$ and $180^\circ - \beta$.` : t`Side $a = ${a}$ cm is shorter than the height $${sig(h, 3)}$ cm: it cannot reach the base line at all.`) : (kind === 'none' ? t`Side $a = ${a}$ cm is shorter than the height $${sig(h, 3)}$ cm: it cannot reach the base line at all.` : t`Side $a = ${a}$ cm is longer than $b$: swung one way it meets the base line, swung the other it would land behind the corner with the $${al}^\circ$ angle — only one triangle.`)])),
          hints: [t`Picture side $a$ hanging from the top vertex and swinging like a pendulum. Does it reach the base line, and how many times?`, t`Compare $a$ with the height $${sig(h, 3)}$ cm and with $b = ${b}$ cm.`],
          teach: t`SSA with an acute angle: $a < h$ gives none, $h < a < b$ gives two, $a \ge b$ gives one ($a = h$ gives one right triangle).`,
          explain: kind === 'none' ? t`$a = ${a} < h = ${sig(h, 3)}$: the side cannot reach the base line, so no triangle.` : kind === 'two' ? t`$h = ${sig(h, 3)} < a = ${a} < b = ${b}$: the side meets the base line at two points, giving two triangles — one with $\beta$ acute, one with $180^\circ - \beta$. The law of sines’ $\sin\beta = k$ has both as solutions.` : t`$a = ${a} > b = ${b}$: only one intersection lies on the correct side of the vertex, so exactly one triangle.`,
        };
      },
    }),
    num({
      id: 'ssa-obtuse', difficulty: 3,
      gen(r) {
        const [al, b, a] = r.pick([[30, 10, 7], [40, 12, 9], [35, 14, 10], [25, 15, 8]]), s = (b * Math.sin(al * D2R)) / a, b1 = deg(Math.asin(s)), ans = 180 - b1;
        return {
          prompt: t`In a triangle, $\alpha = ${al}^\circ$, $a = ${a}$ cm and $b = ${b}$ cm. The law of sines gives $\sin\beta = ${sig(s, 4)}$, and a calculator says $\beta = ${sig(b1, 4)}^\circ$. But a second triangle fits the same data. What is $\beta$ in that one?`,
          answer: ans, units: 'deg', tol: { rel: 0.003 },
          errors: [{ value: b1, feedback: t`That is the first triangle. $\sin\beta = ${sig(s, 4)}$ is also solved by the obtuse angle $180^\circ - \beta$.` }, { value: 180 - al - b1, feedback: t`That is the third angle $\gamma$ of the first triangle. The question asks for the other possible $\beta$.` }],
          hints: [t`$\sin(180^\circ - \beta) = \sin\beta$.`, t`Check it fits: $\alpha + (180^\circ - ${sig(b1, 4)}^\circ) < 180^\circ$?`],
          teach: t`In the ambiguous case, $\sin\beta = k$ gives $\beta$ and $180^\circ - \beta$; both are valid whenever $\alpha + (180^\circ - \beta) < 180^\circ$.`,
          explain: t`$\beta_2 = 180^\circ - ${sig(b1, 4)}^\circ = ${sig(ans, 4)}^\circ$, and $${al}^\circ + ${sig(ans, 4)}^\circ < 180^\circ$, so this triangle exists too, with $\gamma = ${sig(180 - al - ans, 3)}^\circ$.`,
          visual: (() => { const g1 = 180 - al - b1, c1 = (a * Math.sin(g1 * D2R)) / Math.sin(al * D2R), g2 = 180 - al - ans, c2 = (a * Math.sin(g2 * D2R)) / Math.sin(al * D2R), top = [b * Math.cos(al * D2R), b * Math.sin(al * D2R)]; return { type: 'graph', params: { x: [-1, c1 + 1.5], y: [-1, top[1] + 1.5], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: [`${N(c1 + 1)}*t`, '0'], t: [0, 1], color: 'ink3', width: 1.4, dash: true }, { param: [`t*${N(top[0])}`, `t*${N(top[1])}`], t: [0, 1], color: 'warn', width: 2.6 }, { param: [`${N(top[0])} + t*(${N(c1 - top[0])})`, `${N(top[1])}*(1 - t)`], t: [0, 1], color: 'accent', width: 2.4 }, { param: [`${N(top[0])} + t*(${N(c2 - top[0])})`, `${N(top[1])}*(1 - t)`], t: [0, 1], color: 'accent', width: 2.4, dash: true }], points: [{ x: N(c1), y: 0, color: 'ink', r: 4, label: `β ≈ ${Math.round(b1)}°`, labelDx: 6, labelDy: 14 }, { x: N(c2), y: 0, color: 'ink', r: 4, label: 'second β?', labelAlign: 'right', labelDx: -6, labelDy: 14 }, { x: N(top[0] / 2), y: N(top[1] / 2), r: 0, label: `b = ${b}`, color: 'warn', labelAlign: 'right', labelDx: -8, labelDy: 0 }] } }; })(),
        };
      },
    }),
    mcq({
      id: 'which-law', difficulty: 2,
      gen(r) {
        const k = r.int(0, 3);
        const D = [
          [t`two sides, $a = 7$ and $b = 9$, and the angle between them, $\gamma = 50^\circ$; find $c$`, 1, t`With the included angle known, no side–opposite-angle pair is complete; the law of cosines takes SAS directly.`],
          [t`all three sides, $5$, $6$ and $8$; find the largest angle`, 1, t`No angle is known, so no side–angle pair: solve the law of cosines for $\cos\gamma$.`],
          [t`two angles, $40^\circ$ and $75^\circ$, and the side between them, $12$; find another side`, 0, t`The third angle is $65^\circ$, so each side has its opposite angle: the law of sines.`],
          [t`side $a = 8$, its opposite angle $\alpha = 35^\circ$, and side $b = 11$; find $\beta$`, 0, t`A side and its opposite angle form a complete pair: the law of sines gives $\sin\beta$ (watch for a second solution).`],
        ][k];
        const C = ['the law of sines', 'the law of cosines', 'Pythagoras’ theorem', 'not enough information'];
        return {
          prompt: t`You know ${D[0]}. Which tool solves it most directly?`,
          visual: k === 0 ? triFig({ v: [[0, 0], [9, 0], [7 * Math.cos(50 * D2R), 7 * Math.sin(50 * D2R)]], angleAt: 0, angleLabel: '50°', sides: ['9', '?', '7'], caption: t`The data, to scale.` }) : k === 1 ? triFig({ v: [[0, 0], [8, 0], [(64 + 25 - 36) / 16, Math.sqrt(25 - ((64 + 25 - 36) / 16) ** 2)]], sides: ['8', '6', '5'], caption: t`The three sides, to scale.` }) : k === 2 ? triFig({ v: fromAngles(12, 40, 75), angleAt: 0, angleLabel: '40°', sides: ['12', '', ''], caption: t`The data, to scale: $75^\circ$ at the right corner.` }) : triFig({ v: [[0, 0], [11 * Math.cos(35 * D2R) + Math.sqrt(64 - (11 * Math.sin(35 * D2R)) ** 2), 0], [11 * Math.cos(35 * D2R), 11 * Math.sin(35 * D2R)]], angleAt: 0, angleLabel: '35°', sides: ['', '8', '11'], caption: t`One triangle that fits the data, to scale.` }),
          choices: C,
          answer: D[1],
          why: Object.fromEntries([0, 1, 2, 3].filter((j) => j !== D[1]).map((j) => [j, j === 2 ? t`Pythagoras needs a right angle, and none is given.` : j === 3 ? t`Three independent pieces, at least one a side, are enough to solve a triangle (up to the SSA ambiguity).` : D[2]])),
          hints: [t`Is there a side whose opposite angle you know? If yes, the law of sines; if not, the law of cosines.`],
          teach: t`Law of sines when a side–opposite-angle pair is complete (ASA, AAS, SSA); law of cosines for SAS and SSS.`,
          explain: D[2],
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gto', difficulty: 3, transfer: true,
      gen(r) {
        const [site, di] = r.pick([['Cape Canaveral', 28.5], ['Kourou', 6], ['Baikonur', 51.6]]), { va, vg } = GTO;
        const ans = Math.sqrt(va * va + vg * vg - 2 * va * vg * Math.cos(di * D2R));
        return {
          prompt: t`A geostationary satellite launched from ${site} arrives at the high point of its transfer orbit at $${sig(va, 4)}$ km/s, in an orbit tilted $${di}^\circ$ to the equator. It must end up moving at $${sig(vg, 4)}$ km/s in the equatorial plane. One burn does both: its $\Delta v$ is the third side of the triangle formed by the two velocities, with $${di}^\circ$ between them. How big is it?`,
          answer: ans, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: vg - va, feedback: t`That is the speed change alone, ignoring the $${di}^\circ$ turn. Velocities add as vectors: use the law of cosines.` }, { value: Math.hypot(va, vg), feedback: t`That treats the angle between the velocities as $90^\circ$. It is $${di}^\circ$: keep the $-2ab\cos\gamma$ term.` }, { value: vg - va + 2 * vg * Math.sin((di * D2R) / 2), feedback: t`That is two separate burns — speed up, then turn. One combined burn is cheaper: it is the single third side of the triangle.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\Delta v^2 = v_1^2 + v_2^2 - 2v_1 v_2\cos\Delta i$.`, t`$v_1 = ${sig(va, 4)}$, $v_2 = ${sig(vg, 4)}$ km/s, $\Delta i = ${di}^\circ$.`],
          teach: t`A burn that changes speed and direction at once costs the third side of the velocity triangle — less than doing the two separately.`,
          explain: t`$\Delta v = \sqrt{${sig(va, 4)}^2 + ${sig(vg, 4)}^2 - 2(${sig(va, 4)})(${sig(vg, 4)})\cos ${di}^\circ} = ${sig(ans, 3)}$ km/s. A launch site near the equator (Kourou) saves real fuel here; from a high latitude the plane change dominates. Speeds are for a transfer orbit from a $185$ km parking orbit.`,
          visual: { type: 'graph', params: { x: [-0.3, 3.6], y: [-0.4, 1.85], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', arrows: [{ from: [0, 0], to: [N(va * Math.cos(di * D2R)), N(va * Math.sin(di * D2R))], color: 'warn', width: 2.6, label: 'v₁', labelDx: -6, labelDy: -12 }, { from: [0, 0], to: [N(vg), 0], color: 'accent', width: 2.6, label: 'v₂', labelDx: -8, labelDy: 14 }, { from: [N(va * Math.cos(di * D2R)), N(va * Math.sin(di * D2R))], to: [N(vg), 0], color: 'gold', width: 1.6, dash: true }], points: [{ x: 0.75, y: N(0.08 + 0.25 * Math.sin(di * D2R)), r: 0, label: `${di}°`, color: 'ink2', labelDx: 0, labelDy: 0 }] }, caption: t`The velocity triangle, to scale (km/s); the dashed side is the $\Delta v$ to find.` },
        };
      },
    }),
    num({
      id: 'cp-triangulate', difficulty: 3,
      gen(r) {
        const c = r.pick([20, 30, 50]), A = r.pick([48, 55, 65]), B = r.pick([58, 70, 77]), G = 180 - A - B, d = (c * Math.sin(B * D2R)) / Math.sin(G * D2R), ans = d * Math.sin(A * D2R);
        return {
          prompt: t`Two observers ${c} km apart see a high-altitude balloon between them, at elevation angles of $${A}^\circ$ and $${B}^\circ$ above the line joining them. How high is the balloon?`,
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: c * Math.sin(A * D2R), feedback: t`The baseline is not the sight line: first find the distance to the balloon with the law of sines.` }, { value: (c * Math.sin(A * D2R)) / Math.sin(G * D2R) * Math.sin(A * D2R), feedback: t`You paired the distance from the first observer with its own angle. It is opposite the **second** observer’s angle, $${B}^\circ$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Angle at the balloon: $180^\circ - ${A}^\circ - ${B}^\circ = ${G}^\circ$. The distance $d$ from the first observer is opposite $${B}^\circ$.`, t`$d = \dfrac{${c}\sin ${B}^\circ}{\sin ${G}^\circ}$, then $h = d\sin ${A}^\circ$.`],
          teach: t`Triangulation: the law of sines gives a sight-line distance; a right triangle turns it into a height.`,
          explain: t`$d = \dfrac{${c}\sin ${B}^\circ}{\sin ${G}^\circ} = ${sig(d, 4)}$ km, so $h = d\sin ${A}^\circ = ${sig(ans, 3)}$ km.`,
          visual: triFig({ v: fromAngles(c, A, B), angleAt: 0, angleLabel: `${A}°`, sides: [`${c} km`, '', ''], caption: t`The two sight lines meeting at the balloon, to scale; the ground is taken as flat.`, extra: { points: [atQ(c, A, B)] } }),
        };
      },
    }),
    mcq({
      id: 'cp-ssa', difficulty: 3,
      gen(r) {
        const [al, b, a, ans] = r.pick([[30, 12, 8, 2], [30, 12, 5, 0], [30, 12, 14, 1], [45, 10, 8, 2], [45, 10, 6, 0]]);
        const h = b * Math.sin(al * D2R);
        return {
          prompt: t`How many triangles have $\alpha = ${al}^\circ$, $b = ${b}$ and $a = ${a}$ (with $a$ opposite $\alpha$)?`,
          visual: { type: 'graph', params: { x: [-1, 18], y: [-1, 9], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['17*t', '0'], t: [0, 1], color: 'ink3', width: 1.4, dash: true }, { param: [`t*${N(b * Math.cos(al * D2R))}`, `t*${N(h)}`], t: [0, 1], color: 'warn', width: 2.6 }], points: [{ x: N((b * Math.cos(al * D2R)) / 2), y: N(h / 2), r: 0, label: `b = ${b}`, color: 'warn', labelAlign: 'right', labelDx: -8, labelDy: 0 }, { x: 1.9, y: 0.45, r: 0, label: `${al}°`, color: 'gold', labelDx: 0, labelDy: 0 }] }, caption: t`The given angle and side $b$; side $a$ hangs from the top vertex and must reach the dashed base line.` },
          choices: ['none', 'one', 'two', 'it depends on the units'],
          answer: ans,
          why: Object.fromEntries([0, 1, 2, 3].filter((k) => k !== ans).map((k) => [k, k === 3 ? t`Ratios of lengths do not depend on units.` : t`Compare $a = ${a}$ with the height $b\sin\alpha = ${sig(h, 3)}$ and with $b = ${b}$: ${a < h ? 'it is shorter than the height, so it cannot reach the base line' : a < b ? 'it is between them, so it meets the base line twice' : 'it is longer than $b$, so only one meeting point is on the right side'}.`])),
          hints: [t`Compute the height $b\sin\alpha$ and compare.`, t`$a < h$: none; $h < a < b$: two; $a \ge b$: one.`],
          teach: t`The ambiguous case: compare $a$ with $b\sin\alpha$ and with $b$.`,
          explain: a < h ? t`$h = ${b}\sin ${al}^\circ = ${sig(h, 3)}$ and $a = ${a} < h$: side $a$ cannot reach the base line, so there is no triangle.` : a < b ? t`$h = ${b}\sin ${al}^\circ = ${sig(h, 3)} < a = ${a} < b = ${b}$: side $a$ meets the base line twice, so there are two triangles ($\beta$ and $180^\circ - \beta$).` : t`$a = ${a} \ge b = ${b}$: only one meeting point lies on the correct side, so there is one triangle.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.1 Non-right Triangles: Law of Sines', url: 'https://openstax.org/books/precalculus-2e/pages/8-1-non-right-triangles-law-of-sines' },
    { label: 'OpenStax Precalculus 2e, §8.2 Non-right Triangles: Law of Cosines', url: 'https://openstax.org/books/precalculus-2e/pages/8-2-non-right-triangles-law-of-cosines' },
    { label: 'R. A. Braeunig, Rocket and Space Technology: Orbital Mechanics (plane changes and combined burns)', url: 'http://www.braeunig.us/space/orbmech.htm' },
  ],
});
