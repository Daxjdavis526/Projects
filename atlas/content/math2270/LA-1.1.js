// Vectors in Rⁿ: length and angle for lists of any number of components.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, norm, angleDeg, tupleTeX, stems } from './_la.js';

const t = String.raw;

// an integer vector with n components (enough of them nonzero) and a whole-number length
function wholeLength(r, n, lo = -6, hi = 6) {
  for (let k = 0; k < 600; k++) {
    const v = Array.from({ length: n }, () => r.int(lo, hi));
    const s = dot(v, v), L = Math.round(Math.sqrt(s));
    if (L * L === s && L >= 3 && v.filter((x) => x !== 0).length >= n - 1) return v;
  }
  return n === 5 ? [1, 2, 2, 4, 0] : [1, 1, 1, 1, 2, 2, 2, 2, 2].slice(0, n);
}
// two integer vectors that are neither parallel nor perpendicular, with no zero vector
function pair(r, n, lo, hi) {
  for (let k = 0; k < 600; k++) {
    const u = Array.from({ length: n }, () => r.int(lo, hi)), v = Array.from({ length: n }, () => r.int(lo, hi));
    if (!norm(u) || !norm(v)) continue;
    const c = dot(u, v) / (norm(u) * norm(v));
    if (Math.abs(c) > 0.12 && Math.abs(c) < 0.95) return [u, v];
  }
  return [[1, 2, 0, 2, 4].slice(0, n), [2, 1, 2, 4, 0].slice(0, n)];
}
const squares = (v) => v.map((x) => (x < 0 ? `(${x})^2` : `${x}^2`)).join(' + ');
const products = (u, v) => u.map((x, k) => `(${x})(${v[k]})`).join(' + ');

const BANDS = ['U', 'B', 'V', 'R', 'I', 'J'];

export default lesson({
  id: 'math2270.LA-1.1',
  title: 'Vectors, length and angle',
  minutes: 10, difficulty: 2,
  intro: t`In linear algebra a **vector** is an ordered list of $n$ real numbers, written as a column, and $\mathbb R^n$ is the set of all such lists. Length and angle carry over from the arrows of the plane unchanged, because **any two vectors lie in a plane of their own**, where ordinary geometry holds:

$$\cos\theta = \frac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\,\|\mathbf v\|}, \qquad \mathbf u\cdot\mathbf v = u_1v_1 + u_2v_2 + \dots + u_nv_n$$

The same formula compares two spectra, two sensor records or two signals, whatever $n$ is — it measures how alike their *shapes* are, not how big they are.`,
  symbols: [
    { tex: t`\mathbf u,\ \mathbf v`, text: t`vectors in $\mathbb R^n$: columns of $n$ real numbers, written in bold` },
    { tex: t`u_k`, text: t`the $k$-th component of $\mathbf u$, for $k = 1, \dots, n$ — in the units of whatever $\mathbf u$ lists` },
    { tex: t`\mathbb R^n`, text: t`all lists of $n$ real numbers; $n$ is the number of components` },
    { tex: t`\mathbf u\cdot\mathbf v`, text: 'the dot product: multiply matching components and add — a single number' },
    { tex: t`\|\mathbf v\|`, text: t`the length (norm) of $\mathbf v$: $\sqrt{\mathbf v\cdot\mathbf v} = \sqrt{v_1^2 + \dots + v_n^2}$` },
    { tex: t`\theta`, text: t`the angle between $\mathbf u$ and $\mathbf v$, from $0^\circ$ to $180^\circ$, measured in the plane the two vectors span` },
  ],
  why: t`The Cauchy–Schwarz inequality $|\mathbf u\cdot\mathbf v| \le \|\mathbf u\|\,\|\mathbf v\|$ keeps this cosine between $-1$ and $1$ in every dimension, and every projection, least-squares fit and orthogonal basis later in the course is built on this one dot product.`,
  visual: {
    type: 'la-vectors',
    title: 'Two stars, six colours, one angle',
    lead: t`Each star's brightness through six filters is a vector in $\mathbb R^6$, drawn as six stems. The right panel shows the two vectors in the plane they span, at their true lengths and their true angle $\theta$ — a real angle, even though no one can picture six dimensions.`,
    tasks: [
      'Drag the stems of v until their shape matches u: θ falls towards 0° even though v stays dimmer.',
      'Set the scale s to 3: both v’s length and v·u triple, but θ does not move.',
      'Make s negative: v reverses, and θ becomes 180° minus what it was.',
    ],
    params: {
      vectors: [{ name: 'u', values: [2, 3, 4, 4, 3, 2], color: 'accent' }, { name: 'v', values: [1, 2, 3, 4, 4, 3], color: 'warn', drag: true }],
      labels: BANDS, xlabel: 'filter band', y: [-6.5, 6.5], snap: 0.5, scale: true, center: true,
    },
    caption: 'Brightness in arbitrary flux units through the U, B, V, R, I and J filters. The right panel is exact for lengths and the angle; it does not show how that plane sits inside R⁶.',
  },
  example: {
    prompt: t`Find the angle between $\mathbf u = (1, 2, 0, 2, 4)$ and $\mathbf v = (2, 1, 2, 4, 0)$ in $\mathbb R^5$.`,
    visual: { type: 'la-vectors', params: { vectors: [{ name: 'u', values: [1, 2, 0, 2, 4], color: 'accent' }, { name: 'v', values: [2, 1, 2, 4, 0], color: 'warn' }] }, caption: 'The two vectors as stems (left) and in the plane they span (right).' },
    steps: [
      { label: 'Dot product', text: t`Multiply matching components and add: $\mathbf u\cdot\mathbf v = 1\cdot2 + 2\cdot1 + 0\cdot2 + 2\cdot4 + 4\cdot0 = 2 + 2 + 0 + 8 + 0 = 12$.` },
      { label: 'Lengths', text: t`$\|\mathbf u\| = \sqrt{1 + 4 + 0 + 4 + 16} = \sqrt{25} = 5$ and $\|\mathbf v\| = \sqrt{4 + 1 + 4 + 16 + 0} = \sqrt{25} = 5$. Each is Pythagoras with five squares instead of two.` },
      { label: 'Cosine', text: t`$\cos\theta = \dfrac{12}{5\cdot5} = 0.48$.` },
      { label: 'Angle', text: t`$\theta = \arccos 0.48 = 61.3^\circ$.` },
      { label: 'Sense check', text: t`The cosine is positive, so the angle is acute: the two lists are large in partly the same places (components 2 and 4) and differ elsewhere. Cauchy–Schwarz holds: $|12| \le 5\cdot5 = 25$.` },
    ],
    answer: t`$\theta \approx 61.3^\circ$ ($\cos\theta = 0.48$).`,
  },
  practice: [
    num({
      id: 'length-n', difficulty: 1,
      gen(r) {
        const v = wholeLength(r, 5), L = norm(v), sq = dot(v, v), sum = v.reduce((a, x) => a + x, 0);
        return {
          prompt: t`Find the length $\|\mathbf v\|$ of $\mathbf v = ${tupleTeX(v)}$ in $\mathbb R^5$.`,
          answer: L, tol: { rel: 1e-3 },
          errors: [{ value: sq, feedback: t`That is $\mathbf v\cdot\mathbf v$, the sum of the squares. The length is its square root.` },
            ...(Math.abs(sum) !== L && sum !== sq ? [{ value: sum, feedback: 'You added the components. Square each one first: a negative component still adds to the length.' }] : [])],
          hints: ['Square every component, add the squares, then take the square root.', t`$\|\mathbf v\|^2 = ${squares(v)}$.`],
          teach: t`The length of a vector in $\mathbb R^n$ is the square root of the sum of the squares of its components — Pythagoras with $n$ terms.`,
          explain: t`$\|\mathbf v\| = \sqrt{${squares(v)}} = \sqrt{${sq}} = ${L}$.`,
          visual: stems([['v', v]], { caption: 'The five components of v as stems. Its length is not the height of any one stem: every component counts, squared.' }),
        };
      },
    }),
    num({
      id: 'dot-n', difficulty: 1,
      gen(r) {
        let u, v, d, abs;
        for (let k = 0; k < 400; k++) {
          u = Array.from({ length: 6 }, () => r.int(-4, 5)); v = Array.from({ length: 6 }, () => r.int(-4, 5));
          d = dot(u, v); abs = u.reduce((s, x, i) => s + Math.abs(x * v[i]), 0);
          if (d !== 0 && abs !== Math.abs(d) && u.some((x, i) => x * v[i] < 0)) break;
        }
        return {
          prompt: t`Compute $\mathbf u\cdot\mathbf v$ for $\mathbf u = ${tupleTeX(u)}$ and $\mathbf v = ${tupleTeX(v)}$.`,
          answer: d, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: abs, feedback: 'You dropped the signs: a product of a positive and a negative component subtracts.' }],
          hints: ['Multiply the first components together, then the second, and so on; add the six products.', t`$\mathbf u\cdot\mathbf v = ${products(u, v)}$.`],
          teach: 'The dot product of two vectors in Rⁿ multiplies matching components and adds the n products.',
          explain: t`$${products(u, v)} = ${d}$.`,
          visual: stems([['u', u, 'accent'], ['v', v, 'warn']], { caption: 'u and v side by side, component by component. Where one stem points up and the other down, that product is negative.' }),
        };
      },
    }),
    num({
      id: 'angle-n', difficulty: 2,
      gen(r) {
        const [u, v] = pair(r, 4, -3, 5), th = angleDeg(u, v), d = dot(u, v);
        return {
          prompt: t`Find the angle between $\mathbf u = ${tupleTeX(u)}$ and $\mathbf v = ${tupleTeX(v)}$, in degrees to one decimal place.`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.06 },
          errors: [{ value: 180 - th, feedback: 'Check the sign of the dot product: a negative dot product means an obtuse angle, a positive one an acute angle.' }],
          hints: [t`You need three numbers: $\mathbf u\cdot\mathbf v$, $\|\mathbf u\|$ and $\|\mathbf v\|$.`, t`$\mathbf u\cdot\mathbf v = ${d}$, $\|\mathbf u\| = \sqrt{${dot(u, u)}}$ and $\|\mathbf v\| = \sqrt{${dot(v, v)}}$; then $\theta = \arccos\dfrac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\|\mathbf v\|}$.`],
          teach: 'The angle between vectors in Rⁿ comes from the cosine formula: dot product over the product of the lengths.',
          explain: t`$\cos\theta = \dfrac{${d}}{\sqrt{${dot(u, u)}}\sqrt{${dot(v, v)}}} = ${nice(d / (norm(u) * norm(v)))}$, so $\theta = ${th.toFixed(1)}^\circ$.`,
          visual: stems([['u', u, 'accent'], ['v', v, 'warn']], { caption: 'The two vectors as stems. The angle between them lives in the plane they span — the right panel of the Explore picture.' }),
        };
      },
    }),
    mcq({
      id: 'orthogonal', difficulty: 2,
      prompt: t`Which vector is orthogonal (perpendicular) to $\mathbf u = (1, -1, 2, 0, 3)$?`,
      choices: [t`$(2, 2, 0, 5, 0)$`, t`$(2, -2, 0, 5, 0)$`, t`$(-1, 1, -2, 0, -3)$`, t`$(1, 1, 1, 1, 1)$`],
      answer: 0,
      why: {
        1: t`A sign slip: $(-1)(-2) = +2$, so the dot product is $2 + 2 = 4$, not 0.`,
        2: t`That is $-\mathbf u$, pointing the opposite way: $\cos\theta = -1$, so $\theta = 180^\circ$. Opposite is not perpendicular.`,
        3: t`Its dot product with $\mathbf u$ adds up $\mathbf u$'s components: $1 - 1 + 2 + 0 + 3 = 5$, not 0.`,
      },
      hints: ['Two vectors are orthogonal exactly when their dot product is 0.', 'Compute the dot product of u with each choice; watch the signs.'],
      teach: t`In $\mathbb R^n$, orthogonal means $\mathbf u\cdot\mathbf v = 0$ — that is the definition of perpendicular once you cannot draw it.`,
      explain: t`$(1)(2) + (-1)(2) + (2)(0) + (0)(5) + (3)(0) = 2 - 2 = 0$, so $\cos\theta = 0$ and $\theta = 90^\circ$.`,
      visual: stems([['u', [1, -1, 2, 0, 3], 'accent']], { caption: 'The components of u. A vector orthogonal to it must balance its positive and negative products exactly.' }),
    }),
    num({
      id: 'unit', difficulty: 2,
      gen(r) {
        const v = wholeLength(r, 5, -7, 7), L = norm(v);
        const idx = r.pick(v.map((x, i) => (x !== 0 ? i : -1)).filter((i) => i >= 0)), ord = ['first', 'second', 'third', 'fourth', 'fifth'][idx];
        const val = v[idx] / L;
        return {
          prompt: t`The unit vector in the direction of $\mathbf v = ${tupleTeX(v)}$ is $\hat{\mathbf v} = \mathbf v / \|\mathbf v\|$. What is its ${ord} component? Give it to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: v[idx] / dot(v, v), feedback: t`You divided by $\mathbf v\cdot\mathbf v = ${dot(v, v)}$, the length squared. Divide by the length, $${L}$.` },
            ...(Math.abs(v[idx] * L - val) > 1e-9 ? [{ value: v[idx] * L, feedback: 'You multiplied by the length. To make the length 1, divide every component by it.' }] : [])],
          hints: [t`First find $\|\mathbf v\|$: square, add, take the root.`, t`$\|\mathbf v\| = \sqrt{${dot(v, v)}} = ${L}$; divide the ${ord} component, $${v[idx]}$, by it.`],
          teach: 'Dividing a vector by its own length keeps its direction and makes its length exactly 1.',
          explain: t`$\|\mathbf v\| = ${L}$, so the ${ord} component of $\hat{\mathbf v}$ is $${v[idx]}/${L} = ${nice(val, 3)}$. Every component shrinks by the same factor, so the shape of the stems is unchanged.`,
          visual: stems([['v', v]], { caption: 'The stems of v. The unit vector has the same shape, every stem scaled by 1/‖v‖.' }),
        };
      },
    }),
    mcq({
      id: 'state-vector', difficulty: 2,
      prompt: t`A spacecraft's state is stored as one vector $\mathbf s = (x, y, z, v_x, v_y, v_z) = (6778, 0, 0, 0, 7.67, 0)$, positions in km and velocities in km/s (a circular orbit 400 km up). What is wrong with quoting $\|\mathbf s\|$ as a physical quantity?`,
      choices: [
        'Its components carry different units, so adding their squares measures nothing — the number even changes if velocity is written in km/h',
        t`Nothing: every vector in $\mathbb R^6$ has a length, and this one's is about 6778`,
        'A vector with six components has no length; length only exists in two and three dimensions',
        'With six components you must take the sixth root of the sum of squares, not the square root',
      ],
      answer: 0,
      why: {
        1: t`The number exists mathematically, but it adds $\text{km}^2$ to $(\text{km/s})^2$. Rewrite the velocity in km/h and $\|\mathbf s\|$ jumps from about 6778 to about 28 400 — so it measures nothing physical.`,
        2: t`Length is defined in every $\mathbb R^n$. The trouble here is units, not dimension.`,
        3: 'The length is always a square root, whatever n is: it is still Pythagoras, with more squares.',
      },
      hints: ['Length adds the squares of all the components together. Can you add a squared distance to a squared speed?', 'Try changing the velocity unit to km/h and see whether the “length” changes.'],
      teach: t`Lengths and angles in $\mathbb R^n$ mean something physical only when every component has the same units (or has been made dimensionless).`,
      explain: t`In km and km/h the velocity component is $7.67 \times 3600 \approx 27\,600$, and $\sqrt{6778^2 + 27\,600^2} \approx 28\,400$ instead of 6778. A quantity that changes with the choice of units for half its parts is not a physical length. Orbit software keeps the state vector, but measures position errors and velocity errors separately (or weights them to a common unit first).`,
      visual: stems([['s', [6778, 0, 0, 0, 7.67, 0], 'accent']], { labels: ['x', 'y', 'z', 'vx', 'vy', 'vz'], xlabel: 'state component', caption: 'The state vector as stems: the velocity stem (7.67 km/s) is invisible beside the position stem (6778 km) — only because of the units chosen.' }),
    }),
    num({
      id: 'correlation', difficulty: 3,
      gen(r) {
        let dx, dy, rr, raw;
        const noises = [[1, -1, 0, 0, 0], [1, 1, -1, -1, 0], [2, -1, -1, 0, 0], [1, 0, 0, -1, 0]];
        for (let k = 0; k < 200; k++) {
          dx = r.shuffle([-2, -1, 0, 1, 2]);
          const kk = r.pick([1, 2]), s = r.sign(), e = r.shuffle(r.pick(noises));
          dy = dx.map((x, i) => s * kk * x + e[i]);
          rr = dot(dx, dy) / (norm(dx) * norm(dy));
          const p = dx.map((x) => 20 + x), g = dy.map((y) => 40 + 5 * y);
          raw = dot(p, g) / (norm(p) * norm(g));
          if (Math.abs(rr) > 0.3 && Math.abs(rr) < 0.995 && Math.abs(raw - rr) > 0.01) break;
        }
        const p = dx.map((x) => 20 + x), g = dy.map((y) => 40 + 5 * y), b = dy.map((y) => 5 * y);
        const ys = g;
        return {
          prompt: t`Two sensors on a test stand log five readings each: chamber pressure $p = ${tupleTeX(p)}$ bar and strain-gauge output $s = ${tupleTeX(g)}$ mV. Subtract each list's mean, then find the cosine of the angle between the two centred vectors — the **correlation coefficient** $r$. Give $r$ to 3 decimal places.`,
          answer: rr, tol: { rel: 0, abs: 0.0015 },
          errors: [{ value: raw, feedback: 'That is the cosine of the raw readings. Subtract each mean first: otherwise the large average values make almost any two lists look nearly parallel.' }],
          hints: [t`The means are $\bar p = 20$ bar and $\bar s = 40$ mV. Subtract them from every reading.`,
            t`The centred vectors are $\mathbf a = ${tupleTeX(dx)}$ and $\mathbf b = ${tupleTeX(b)}$.`,
            t`$r = \dfrac{\mathbf a\cdot\mathbf b}{\|\mathbf a\|\,\|\mathbf b\|}$ with $\mathbf a\cdot\mathbf b = ${dot(dx, b)}$.`],
          teach: 'The correlation coefficient of two data sets is the cosine of the angle between them once each has had its mean subtracted.',
          explain: t`$\mathbf a\cdot\mathbf b = ${dot(dx, b)}$, $\|\mathbf a\| = \sqrt{${dot(dx, dx)}}$, $\|\mathbf b\| = \sqrt{${dot(b, b)}}$, so $r = ${rr.toFixed(3)}$. ${rr > 0 ? 'Positive: the gauge reads high when the pressure is high.' : 'Negative: the gauge reads low when the pressure is high — it may simply be mounted the other way round.'} Scaling either list (mV to V) leaves $r$ unchanged, just as it leaves an angle unchanged.`,
          visual: {
            type: 'graph',
            params: { x: [17.4, 22.6], y: [Math.min(...ys) - 8, Math.max(...ys) + 8], aspect: 'wide', xlabel: 'p (bar)', ylabel: 's (mV)', axesAt: 'edge', points: p.map((x, i) => ({ x, y: ys[i], color: 'accent', r: 5 })) },
            caption: 'The five readings as a scatter plot. The correlation measures how nearly they lie on a sloping line — as a cosine, once the averages are taken away.',
          },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the angle between $\mathbf u = (3, 1, 2, 2)$ and $\mathbf v = (2, 4, 4, 2)$:

$$\mathbf u\cdot\mathbf v = 6 + 4 + 8 + 4 = 22,\quad \|\mathbf u\| = \sqrt{3 + 1 + 2 + 2} = \sqrt 8,\quad \|\mathbf v\| = \sqrt{2 + 4 + 4 + 2} = \sqrt{12},$$

$$\cos\theta = \frac{22}{\sqrt 8\,\sqrt{12}} \approx 2.25.$$

Where is the mistake?`,
      choices: [
        t`The lengths: each component must be squared before adding, so $\|\mathbf u\| = \sqrt{18}$ and $\|\mathbf v\| = \sqrt{40}$`,
        t`The dot product: it should add every component, $3 + 1 + 2 + 2 + 2 + 4 + 4 + 2 = 20$`,
        t`Nothing — in $\mathbb R^4$ a cosine can be larger than 1`,
        t`The formula is upside down: $\cos\theta = \|\mathbf u\|\,\|\mathbf v\| / (\mathbf u\cdot\mathbf v)$`,
      ],
      answer: 0,
      why: {
        1: 'The dot product multiplies matching components: 6 + 4 + 8 + 4 = 22, as written.',
        2: t`Cauchy–Schwarz holds in every dimension, $|\mathbf u\cdot\mathbf v| \le \|\mathbf u\|\,\|\mathbf v\|$, so $|\cos\theta| \le 1$ always. A cosine above 1 always means an arithmetic slip.`,
        3: 'Upside down, nearly perpendicular vectors would get enormous cosines. The dot product goes on top.',
      },
      hints: ['A cosine can never exceed 1, so some step is wrong. Check each of the three numbers.', t`How is a length computed: $\sqrt{v_1 + v_2 + \dots}$ or $\sqrt{v_1^2 + v_2^2 + \dots}$?`],
      teach: 'A cosine larger than 1 is an alarm, not a result: Cauchy–Schwarz guarantees |cos θ| ≤ 1 in every dimension.',
      explain: t`$\|\mathbf u\| = \sqrt{9 + 1 + 4 + 4} = \sqrt{18}$ and $\|\mathbf v\| = \sqrt{4 + 16 + 16 + 4} = \sqrt{40}$, so $\cos\theta = 22/\sqrt{720} \approx 0.820$ and $\theta \approx 34.9^\circ$.`,
      visual: stems([['u', [3, 1, 2, 2], 'accent'], ['v', [2, 4, 4, 2], 'warn']], { caption: 'The two vectors as stems: similar in shape, so the true angle should be fairly small.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-angle', difficulty: 2,
      gen(r) {
        const [u, v] = pair(r, 5, -2, 4), th = angleDeg(u, v), d = dot(u, v);
        return {
          prompt: t`Find the angle between $\mathbf u = ${tupleTeX(u)}$ and $\mathbf v = ${tupleTeX(v)}$ in $\mathbb R^5$, in degrees to one decimal place.`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.06 },
          hints: [t`Find $\mathbf u\cdot\mathbf v$, $\|\mathbf u\|$ and $\|\mathbf v\|$, then $\theta = \arccos\dfrac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\|\mathbf v\|}$.`],
          teach: 'The angle formula is the same in every dimension: dot product over the product of the lengths.',
          explain: t`$\mathbf u\cdot\mathbf v = ${d}$, $\|\mathbf u\| = \sqrt{${dot(u, u)}}$, $\|\mathbf v\| = \sqrt{${dot(v, v)}}$: $\cos\theta = ${nice(d / (norm(u) * norm(v)))}$ and $\theta = ${th.toFixed(1)}^\circ$.`,
          visual: stems([['u', u, 'accent'], ['v', v, 'warn']]),
        };
      },
    }),
    num({
      id: 'cp-spectra', difficulty: 3, transfer: true,
      gen(r) {
        const library = [[20, 24, 30, 34, 31, 26], [12, 15, 22, 30, 36, 38], [35, 33, 30, 26, 22, 20]];
        const m = r.pick(library), k = r.pick([0.6, 0.75, 1.25, 1.5]), e = r.shuffle([2, -2, 1, -1, 1, 0]);
        const rock = m.map((x, i) => Math.round(k * x) + e[i]);
        const th = angleDeg(rock, m);
        return {
          prompt: t`A rover's spectrometer measures a rock's reflectance in six bands, $\mathbf r = ${tupleTeX(rock)}$ (in percent), and compares it with a library mineral, $\mathbf m = ${tupleTeX(m)}$. The **spectral angle** between them — the angle between the two vectors in $\mathbb R^6$ — is small when the shapes match. What is it, in degrees to one decimal place?`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.06 },
          hints: [t`The spectral angle is $\theta = \arccos\dfrac{\mathbf r\cdot\mathbf m}{\|\mathbf r\|\,\|\mathbf m\|}$.`, t`$\mathbf r\cdot\mathbf m = ${dot(rock, m)}$, $\|\mathbf r\| = \sqrt{${dot(rock, rock)}}$, $\|\mathbf m\| = \sqrt{${dot(m, m)}}$.`],
          teach: 'An angle compares the shapes of two spectra and ignores their overall brightness, which depends on lighting rather than on the rock.',
          explain: t`$\cos\theta = \dfrac{${dot(rock, m)}}{\sqrt{${dot(rock, rock)}}\sqrt{${dot(m, m)}}} = ${(dot(rock, m) / (norm(rock) * norm(m))).toFixed(5)}$, so $\theta = ${th.toFixed(1)}^\circ$. The rock is ${k < 1 ? 'dimmer' : 'brighter'} than the library sample — shadow or sunlight — but its shape nearly matches, so the angle is small. This *spectral angle mapper* is used to classify minerals in orbital spectra of Mars; the numbers here are made up.`,
          visual: stems([['rock r', rock, 'warn'], ['mineral m', m, 'accent']], { labels: ['450', '550', '650', '750', '850', '950'], xlabel: 'band centre (nm)', caption: 'The rock and the library mineral, band by band (reflectance in percent). Different heights, similar shape.' }),
        };
      },
    }),
    mcq({
      id: 'cp-scale', difficulty: 2,
      prompt: t`Every component of $\mathbf v$ is multiplied by 3 — the same star seen through a telescope that collects three times the light. What happens to the angle between $\mathbf v$ and a reference spectrum $\mathbf u$?`,
      choices: ['It does not change', 'It triples', 'It shrinks to a third', 'It depends on how many components the vectors have'],
      answer: 0,
      why: {
        1: t`The dot product triples, but so does $\|\mathbf v\|$; the 3 cancels in $\cos\theta$.`,
        2: t`Only the length and the dot product grow; in $\dfrac{\mathbf u\cdot 3\mathbf v}{\|\mathbf u\|\,\|3\mathbf v\|}$ the factor 3 cancels.`,
        3: t`Scaling by a positive number keeps the direction, so $\theta$ is fixed. The scaling cancels for any number of components.`,
      },
      hints: [t`Write $\cos\theta$ for $\mathbf u$ and $3\mathbf v$.`, t`$\mathbf u\cdot(3\mathbf v) = 3\,\mathbf u\cdot\mathbf v$ and $\|3\mathbf v\| = 3\|\mathbf v\|$.`],
      teach: 'Multiplying a vector by a positive number changes its length, never its direction, so angles stay the same.',
      explain: t`$\cos\theta' = \dfrac{3\,\mathbf u\cdot\mathbf v}{\|\mathbf u\|\cdot 3\|\mathbf v\|} = \cos\theta$. That is why an angle compares colours of stars, or spectra of rocks, without caring how bright they are.`,
      visual: stems([['v', [1, 2, 3, 4, 4, 3], 'warn'], ['3v', [3, 6, 9, 12, 12, 9], 'gold']], { labels: BANDS, xlabel: 'filter band', caption: 'v and 3v: every stem three times taller, the same shape.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §1.1–1.2', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC Linear Algebra', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
