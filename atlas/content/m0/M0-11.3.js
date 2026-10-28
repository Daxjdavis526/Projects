// Eccentricity — one number that says how far a conic is from a circle: e = c/a, from perihelion and aphelion, and PF = e·PD.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N, thou } from './_m0kit.js';
import { seg, ell, plane, dot, note } from './_m0geo.js';

const t = String.raw;
const MU = 398600.4;   // Earth's GM, km³/s²
const RE = 6371;       // Earth's mean radius, km
// an orbit ellipse (semi-major a, eccentricity e) with the attracting body at the right-hand focus
const orbitPic = (a, e, caption, { body = 'Sun', ticks = false, scale = 1, extra = {}, bodyR = 0 } = {}) => {
  const A = a * scale, c = A * e, b = A * Math.sqrt(1 - e * e), H = 1.12 * Math.max(b, A / 2);
  const curves = [ell([0, 0], A, b, { width: 2.6 })];
  if (bodyR) curves.push({ param: [`${N(c)} + ${N(bodyR * scale)}*cos(t)`, `${N(bodyR * scale)}*sin(t)`], t: [0, 6.2832], color: 'teal', width: 2 });
  return plane({ x: [-2 * H, 2 * H], y: [-H, H], ticks, curves, points: [dot([c, 0], body, { color: bodyR ? 'teal' : 'gold', r: bodyR ? 2 : 6, labelDy: 14 })], caption, extra });
};
const BODIES = [
  { name: 'Halley’s comet', q: 0.586, Q: 35.08, unit: 'AU' },
  { name: 'Pluto', q: 29.66, Q: 49.31, unit: 'AU' },
  { name: 'The Moon (about the Earth)', q: 363300, Q: 405500, unit: 'km' },
  { name: 'A geostationary transfer orbit', q: 6621, Q: 42164, unit: 'km' },
];

export default lesson({
  id: 'm0.M0-11.3',
  title: 'Eccentricity',
  minutes: 9, difficulty: 2,
  intro: t`Ellipses, parabolas and hyperbolas are one family, told apart by a single number, the **eccentricity** $e$. For an ellipse or hyperbola it is how far the focus sits from the centre, in units of $a$:

$$e = \frac{c}{a}, \qquad r_p = a(1 - e),\ \ r_a = a(1 + e) \ \Rightarrow\ e = \frac{r_a - r_p}{r_a + r_p}$$

$e = 0$ is a circle (the foci merge at the centre), $0 < e < 1$ an ellipse, $e = 1$ a parabola, $e > 1$ a hyperbola. For an orbit, $r_p$ and $r_a$ are the closest and farthest distances from the attracting body at the focus (perihelion and aphelion around the Sun; perigee and apogee around the Earth), so **two distance measurements give the shape**. The same $e$ appears in the focus–directrix definition: every point of a conic has $PF = e \cdot PD$ — distance to the focus is $e$ times distance to the directrix (for $e > 0$).`,
  symbols: [
    { tex: 'e', text: 'the **eccentricity**, a pure number $\\ge 0$: Earth’s orbit $0.0167$, the Moon’s $0.0549$, Halley’s comet $0.967$' },
    { tex: 'a,\\ c', text: 'the semi-major axis and the centre-to-focus distance' },
    { tex: 'r_p,\\ r_a', text: 'the closest and farthest distances from the focus (periapsis, apoapsis), in km or AU' },
    { tex: 'PF,\\ PD', text: 'a point’s distance to the focus and to the directrix' },
  ],
  why: t`Eccentricity is how mission designers, astronomers and the [Kepler orbit explorer](#/explore/mech-kepler) describe an orbit’s shape. A burn that raises the speed at perigee raises $e$; at $e = 1$ the spacecraft escapes on a parabola, and above it leaves on a hyperbola. [Calculus II](#/lesson/math1220.C2-6.6) writes every conic as $r = p/(1 + e\cos\theta)$, the form Kepler’s first law takes.`,
  visual: {
    type: 'calc-polar',
    title: 'Same closest approach, faster launch',
    lead: t`Every orbit here passes the Sun (gold) at the same closest distance, $1$ unit, with a speed $v$ measured in multiples of the circular-orbit speed there. Faster means more eccentric: in this setup $e = v^2 - 1$ (Newtonian gravity).`,
    tasks: [
      t`At $v = 1$ the orbit is the circle ($e = 0$). Speed up a little: an ellipse, its far end swinging out.`,
      t`At $v = \sqrt2 \approx 1.414$, $e = 1$: the far end never closes. That is **escape speed**, and the path is a parabola.`,
      t`Beyond $\sqrt2$ the path opens into a hyperbola — a flyby that leaves for good. The teal line is the directrix, $PF = e\cdot PD$.`,
    ],
    params: {
      grid: 'polar', angles: 'none', rstep: 1, aspect: 'wide', x: [-6.5, 4], y: [-2.6, 2.6],
      sliders: [{ key: 'v', label: t`Speed at closest approach, $v/v_{\text{circ}}$`, min: 1, max: 1.6, step: 0.005, value: 1.2, explain: t`$1$ is the speed of a circular orbit at that distance; $\sqrt2$ is escape speed.` }],
      curves: [
        { conic: ['0', '1'], color: 'ink4', width: 1.2, dash: true },
        { conic: ['v^2 - 1', 'v^2'], color: 'accent', width: 2.6 },
      ],
      vlines: [{ x: 'v^2/(v^2 - 1 + 0.000001)', color: 'teal', label: 'directrix', when: 'step(v - 1.1)' }],
      points: [{ x: 0, y: 0, color: 'gold', size: 7, label: 'Sun', labelDx: 8, labelDy: 14 }, { x: 1, y: 0, color: 'ink2', size: 4, label: 'closest', labelDx: 6, labelDy: -10 }],
      readouts: [
        { label: t`$e = v^2 - 1$`, expr: 'v^2 - 1', digits: 3 },
        { label: 'shape', classify: 'v^2 - 1' },
      ],
    },
    caption: t`To scale with the closest approach as the unit; the dashed circle is the $e = 0$ orbit. Two-body Newtonian motion (relation $e = v^2 - 1$ holds at closest approach); real orbits are nudged by other bodies.`,
  },
  example: {
    prompt: t`The Moon’s distance from the Earth (centre to centre) ranges from $363\,300$ km at perigee to $405\,500$ km at apogee. Find the eccentricity of its orbit, its semi-major axis, and how far the Earth’s centre is from the ellipse’s centre.`,
    visual: orbitPic(384400, 0.0549, t`The Moon’s orbit to scale, with the Earth at a focus. It looks like a circle: $e = 0.055$ moves the focus only $5.5\%$ of $a$ off-centre.`, { body: 'Earth' }),
    steps: [
      { label: 'Semi-major axis', text: t`$r_p + r_a = 2a$ (the long axis, end to end): $a = \tfrac12(363\,300 + 405\,500) = 384\,400$ km.` },
      { label: 'Focus offset', text: t`$r_a - r_p = 2c$: $c = \tfrac12(405\,500 - 363\,300) = 21\,100$ km.` },
      { label: 'Eccentricity', text: t`$e = \dfrac{c}{a} = \dfrac{21\,100}{384\,400} = ${sig(21100 / 384400, 3)}$, the same as $\dfrac{r_a - r_p}{r_a + r_p}$.` },
      { label: 'Sense check', text: t`$e$ is small, as it should be for an orbit that looks round; the semi-minor axis is $a\sqrt{1 - e^2} = ${thou(384400 * Math.sqrt(1 - (21100 / 384400) ** 2))}$ km, only $0.15\%$ less than $a$. (The Moon’s orbit is perturbed by the Sun; these are mean values.)` },
    ],
    answer: t`$e \approx ${sig(21100 / 384400, 3)}$, $a = 384\,400$ km, $c = 21\,100$ km.`,
  },
  practice: [
    num({
      id: 'e-from-ab', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[5, 3], [5, 4], [13, 5], [10, 8], [6, 2], [3, 1]]), c = Math.sqrt(a * a - b * b), ans = c / a;
        return {
          prompt: t`Find the eccentricity of $\dfrac{x^2}{${a * a}} + \dfrac{y^2}{${b * b}} = 1$. Give 3 significant figures if it is not exact.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: b / a, feedback: t`$b/a$ is not $e$: first find $c = \sqrt{a^2 - b^2}$, then $e = c/a$.` }, { value: c, feedback: t`That is $c$. Divide by $a$: eccentricity has no units.` }, { value: c / b, feedback: t`Divide by the **semi-major** axis, $a = ${a}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$c = \sqrt{${a * a} - ${b * b}}$.`],
          teach: t`$e = c/a$ with $c = \sqrt{a^2 - b^2}$: a number between $0$ and $1$ for any ellipse.`,
          explain: t`$c = ${sig(c, 4)}$, so $e = ${sig(c, 4)}/${a} = ${sig(ans, 3)}$.`,
          visual: plane({ x: [-2.3 * a / 2 - 0.5, 2.3 * a / 2 + 0.5].map((v) => v * 1.0), y: [-0.6 * a - 0.3, 0.6 * a + 0.3], ticks: false, curves: [ell([0, 0], a, b, { width: 2.6 })], caption: t`The ellipse (axis numbers hidden).` }),
        };
      },
    }),
    num({
      id: 'e-from-apsides', difficulty: 2,
      gen(r) {
        const B = r.pick(BODIES), ans = (B.Q - B.q) / (B.Q + B.q), a = (B.Q + B.q) / 2;
        const fmt = (v) => (B.unit === 'km' ? thou(v) : String(v));
        return {
          prompt: t`${B.name}: closest distance $${fmt(B.q)}$ ${B.unit}, farthest $${fmt(B.Q)}$ ${B.unit} (measured from the focus — the centre of the body it orbits). What is the orbit’s eccentricity? Give 3 significant figures.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (B.Q - B.q) / B.Q, feedback: t`Divide by $r_a + r_p = 2a$, not by $r_a$ alone.` }, { value: B.q / B.Q, feedback: t`The ratio of the distances is not $e$: use $e = \dfrac{r_a - r_p}{r_a + r_p}$.` }, { value: 1 - B.q / B.Q, feedback: t`Close, but the denominator is $r_a + r_p$: $e = \dfrac{r_a - r_p}{r_a + r_p}$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$r_a - r_p = 2c$ and $r_a + r_p = 2a$.`],
          teach: t`$e = \dfrac{r_a - r_p}{r_a + r_p}$: two distances from the focus fix the shape.`,
          explain: t`$e = \dfrac{${fmt(B.Q)} - ${fmt(B.q)}}{${fmt(B.Q)} + ${fmt(B.q)}} = ${sig(ans, 3)}$, with $a = ${B.unit === 'km' ? thou(a) : sig(a, 4)}$ ${B.unit}.`,
          visual: orbitPic(a, ans, t`The orbit to scale, with the central body at the focus (axis numbers hidden).`, { body: B.unit === 'AU' ? 'Sun' : 'Earth' }),
        };
      },
    }),
    mcq({
      id: 'classify', difficulty: 1,
      gen(r) {
        const [eT, k] = r.pick([['0.967', 0], ['1', 1], ['1.20', 2], ['0', 3], ['0.9999', 0], ['3.36', 2]]);
        const names = ['A long ellipse: it comes back', 'A parabola: it escapes, only just', 'A hyperbola: it escapes with speed to spare', 'A circle'];
        const why = [t`$e < 1$, however close to $1$, is a closed ellipse.`, t`Exactly $e = 1$ is the parabola — the borderline between bound and unbound.`, t`$e > 1$ is a hyperbola.`, t`Only $e = 0$ is a circle.`];
        return {
          prompt: t`A body’s orbit about the Sun has eccentricity $e = ${eT}$. What is its path?`,
          choices: names, fixedOrder: true, answer: k,
          why: Object.fromEntries([0, 1, 2, 3].filter((j) => j !== k).map((j) => [j, why[j]])),
          hints: [t`Compare $e$ with $0$ and with $1$.`],
          teach: t`$e = 0$ circle, $e < 1$ ellipse, $e = 1$ parabola, $e > 1$ hyperbola.`,
          explain: t`$e = ${eT}$: ${names[k].toLowerCase()}.${eT === '0.967' ? ' (That is Halley’s comet, back every 75–76 years.)' : eT === '1.20' ? ' (ʻOumuamua, the first known interstellar object, had about this.)' : ''}`,
        };
      },
    }),
    num({
      id: 'focus-directrix', difficulty: 2,
      gen(r) {
        const [pf, pd] = r.pick([[3.2, 4.0], [1.5, 6.0], [2.4, 2.0], [5.0, 5.0], [0.9, 3.0]]), ans = pf / pd;
        return {
          prompt: t`A point $P$ on a conic is $${pf}$ AU from its focus and $${pd}$ AU from its directrix. What is the conic’s eccentricity?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: pd / pf, feedback: t`Upside down: $PF = e \cdot PD$, so $e = PF/PD$.` }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`$PF = e\cdot PD$.`],
          teach: t`Every point of a conic has $PF/PD = e$: less than $1$ for ellipses, $1$ for parabolas, more for hyperbolas.`,
          explain: t`$e = ${pf}/${pd} = ${sig(ans, 3)}$: ${ans < 1 ? 'an ellipse' : ans === 1 ? 'a parabola' : 'a hyperbola'}.`,
          visual: (() => {
            const xd = 3, P = [xd - pd, 0.9 * pf], F = [P[0] + Math.sqrt(Math.max(pf * pf - (0.9 * pf) ** 2, 0)), 0];
            return plane({ x: [F[0] - 6, F[0] + 6], y: [-3, 3], ticks: false, curves: [seg(P, F, { color: 'warn', width: 2.2 }), seg(P, [xd, P[1]], { color: 'teal', width: 2.2, dash: true })], points: [dot(F, 'F', { color: 'gold' }), dot(P, 'P'), note([(P[0] + F[0]) / 2 - 0.3, P[1] / 2], `${pf}`, { color: 'warn' }), note([(P[0] + xd) / 2, P[1] + 0.3], `${pd}`, { color: 'teal' })], extra: { vlines: [{ x: xd, color: 'teal', label: 'directrix' }] }, caption: t`The point, its distance to the focus (orange) and to the directrix (teal dashed). Schematic: lengths as labelled, not to scale.` });
          })(),
        };
      },
    }),
    num({
      id: 'perigee-alt', difficulty: 3,
      gen(r) {
        const a = r.pick([26600, 24500]), e = r.pick([0.72, 0.7, 0.65]), rp = a * (1 - e), ans = rp - RE;
        return {
          prompt: t`A highly elliptical communications orbit has semi-major axis $${thou(a)}$ km and eccentricity $${e}$. How high above the ground is its perigee? (Earth’s mean radius is $6\,371$ km.)`,
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: rp, feedback: t`That is the perigee **radius**, from the Earth’s centre. Subtract the Earth’s radius for the altitude.` }, { value: a * (1 + e) - RE, feedback: t`$a(1 + e)$ is the apogee. Perigee is $a(1 - e)$.` }, { value: a * e - RE, feedback: t`$ae$ is $c$, the centre-to-focus offset. The perigee distance is $a - c = a(1 - e)$.` }].filter((e2) => Math.abs(e2.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`Perigee radius $r_p = a(1 - e)$, measured from the Earth’s centre.`, t`$r_p = ${thou(a)} \times ${sig(1 - e, 2)} = ${thou(rp)}$ km; then subtract $6\,371$ km.`],
          teach: t`$r_p = a(1 - e)$ and $r_a = a(1 + e)$ are distances from the focus — the planet’s centre, not its surface.`,
          explain: t`$r_p = ${thou(rp)}$ km, so the perigee altitude is $${thou(ans)}$ km; the apogee is $${thou(a * (1 + e) - RE)}$ km up. Orbits like this (Molniya-type) dwell for hours near apogee over high latitudes.`,
          visual: orbitPic(a, e, t`The orbit and the Earth (teal) to scale; axis numbers hidden.`, { body: '', bodyR: RE }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-escape', difficulty: 3, transfer: true,
      gen(r) {
        const rp = r.pick([6700, 6800, 7000]), v = r.pick([9.6, 10.4, 11.0, 11.6, 12.3]), ans = (rp * v * v) / MU - 1;
        return {
          prompt: t`At closest approach, an orbit’s eccentricity is $e = \dfrac{r_p v_p^2}{GM} - 1$, where $r_p$ is the distance from the planet’s centre, $v_p$ the speed there and $GM = 398\,600\ \text{km}^3/\text{s}^2$ for the Earth. After its final burn, a lunar probe is at perigee with $r_p = ${thou(rp)}$ km and $v_p = ${v}$ km/s. Find $e$.`,
          answer: ans, tol: { rel: 0.005, abs: 0.003 },
          errors: [{ value: (rp * v) / MU - 1, feedback: t`Square the speed: $v_p^2 = ${sig(v * v, 4)}\ \text{km}^2/\text{s}^2$.` }, { value: (rp * v * v) / MU, feedback: t`Subtract the $1$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$r_p v_p^2 = ${thou(rp)} \times ${sig(v * v, 4)}$ in $\text{km}^3/\text{s}^2$ — the same units as $GM$.`, t`Divide by $398\,600$, then subtract $1$. Compare the result with $1$.`],
          teach: t`Speed at periapsis sets the shape: $e < 1$ bound, $e = 1$ exactly escape speed, $e > 1$ escaping.`,
          explain: t`$e = \dfrac{${thou(rp)} \times ${sig(v * v, 4)}}{398\,600} - 1 = ${sig(ans, 3)}$: ${ans < 1 ? 'an ellipse — the probe stays bound to the Earth (a highly eccentric one reaches toward the Moon)' : 'at or above 1 — the probe escapes the Earth (ignoring the Moon and Sun)'}. Escape speed here would be $\sqrt{2GM/r_p} = ${sig(Math.sqrt((2 * MU) / rp), 4)}$ km/s.`,
          visual: { type: 'calc-polar', params: { grid: 'none', aspect: 'wide', x: [-9, 3], y: [-3, 3], constants: { e: +Math.min(ans, 1.8).toFixed(4) }, curves: [{ conic: ['e', '1 + e'], color: 'accent', width: 2.4 }, { conic: ['0', '1'], color: 'ink4', width: 1, dash: true }], points: [{ x: 0, y: 0, color: 'teal', size: 7, label: 'Earth', labelDy: 14 }] }, caption: t`The trajectory’s shape with perigee as the unit of distance (the dashed circle is the circular orbit there); the Earth is not to this scale.` },
        };
      },
    }),
    num({
      id: 'cp-gto', difficulty: 2, transfer: true,
      gen(r) {
        const hp = r.pick([185, 250, 300]), ha = 35786, rp = RE + hp, ra = RE + ha, ans = (ra - rp) / (ra + rp);
        return {
          prompt: t`A geostationary transfer orbit has perigee $${hp}$ km and apogee $35\,786$ km **above the ground**. With the Earth’s radius $6\,371$ km, what is its eccentricity?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (ha - hp) / (ha + hp), feedback: t`Altitudes are measured from the surface, but the focus is the Earth’s **centre**: add $6\,371$ km to each first.` }, { value: (ra - rp) / ra, feedback: t`Divide by $r_a + r_p$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Convert to distances from the centre: $r_p = 6\,371 + ${hp}$, $r_a = 6\,371 + 35\,786$.`],
          teach: t`Orbit distances are measured from the focus — the planet’s centre — not from its surface.`,
          explain: t`$r_p = ${thou(rp)}$ km, $r_a = ${thou(ra)}$ km: $e = \dfrac{${thou(ra - rp)}}{${thou(ra + rp)}} = ${sig(ans, 3)}$.`,
          visual: orbitPic((ra + rp) / 2, ans, t`The transfer orbit and the Earth (teal) to scale; axis numbers hidden.`, { body: '', bodyR: RE }),
        };
      },
    }),
    num({
      id: 'cp-b', difficulty: 2,
      gen(r) {
        const a = r.pick([10, 5, 20]), e = r.pick([0.6, 0.8, 0.28]), ans = a * Math.sqrt(1 - e * e);
        return {
          prompt: t`An asteroid’s orbit has semi-major axis $${a}$ AU and eccentricity $${e}$. What is its semi-minor axis $b$, in AU?`,
          answer: ans, units: 'AU', tol: { rel: 0.005 },
          errors: [{ value: a * (1 - e), feedback: t`$a(1 - e)$ is the perihelion distance, not $b$. Use $b^2 = a^2 - c^2$ with $c = ae$.` }, { value: a * Math.sqrt(1 + e * e), feedback: t`For an ellipse $b^2 = a^2 - c^2$: $b$ is shorter than $a$.` }, { value: a * e, feedback: t`$ae$ is $c$, the centre-to-focus distance.` }].filter((e2) => Math.abs(e2.value - ans) > 0.005 * ans),
          hints: [t`$c = ae$ and $b^2 = a^2 - c^2$, so $b = a\sqrt{1 - e^2}$.`],
          teach: t`$b = a\sqrt{1 - e^2}$: even $e = 0.3$ shortens the minor axis by only $5\%$.`,
          explain: t`$b = ${a}\sqrt{1 - ${e}^2} = ${sig(ans, 3)}$ AU.`,
          visual: orbitPic(a, e, t`The orbit with the Sun at a focus, to scale (axis numbers hidden).`),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §10.6 Conic Sections in Polar Coordinates (eccentricity)', url: 'https://openstax.org/books/precalculus-2e/pages/10-6-conic-sections-in-polar-coordinates' },
    { label: 'NASA Moon Fact Sheet (perigee 363 300 km, apogee 405 500 km) and Pluto Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' },
    { label: 'JPL Small-Body Database: 1P/Halley (q = 0.586 AU, e = 0.967)', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html' },
  ],
});
