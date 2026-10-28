// Multiplication as rotation and scaling — the first lesson of complex
// analysis, Needham-style: a complex number is a point, but it is also an
// operation on the whole plane. Multiplying by c = r e^{iθ} turns every point
// through θ and stretches it by r; lengths multiply and angles add.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, cPlain, num as nm, deg, wrapDeg, argand, cxmap, cis } from './_cx.js';

const t = String.raw;
const DEG = Math.PI / 180;
const T = [[3, 4], [5, 12], [8, 15], [6, 8], [7, 24], [20, 21]];   // Pythagorean pairs: whole-number moduli

// the worked example: (1 + 2i)(3 + i)
const EZ = [1, 2], EW = [3, 1], EP = M.mul(EZ, EW);

// the explore map: multiply by c = r e^{iθ} (θ in degrees), drawn on one plane
const multiplyBy = (r, th, extra = {}) => ({
  f: 'mobius', a: [`r*cos(th*pi/180)`, `r*sin(th*pi/180)`],
  sliders: [
    { key: 'r', label: 'Size $|c|$', min: 0.25, max: 2.5, step: 0.05, value: r, explain: 'How much every length is stretched (above 1) or shrunk (below 1).' },
    { key: 'th', label: t`Angle $\arg c$`, min: -180, max: 180, step: 5, value: th, unit: '^\\circ', explain: 'How far every point is turned about 0, anticlockwise for positive angles.' },
  ],
  layout: 'same', x: [-3, 3], y: [-1.6, 3], grid: 'cartesian', gx: [0, 2], gy: [0, 2], gn: 5,
  shape: 'F', shapeAt: [0.3, 0.3], shapeSize: 1.4, drag: { x: 1.6, y: 0.6, label: 'z', wlabel: 'cz' }, arrows: true,
  readout: ['z', 'w', { label: '$|c|$', expr: 'r' }, { label: t`$\arg c$ (degrees)`, expr: 'th' }],
  ...extra,
});

export default lesson({
  id: 'st-d.D1.1',
  title: 'Multiplication as rotation and scaling',
  minutes: 10, difficulty: 1,
  intro: t`A complex number $z = x + iy$ is a point of the plane — or an arrow from $0$ to it. Write it in polar form, by its length and its angle: $z = r(\cos\theta + i\sin\theta)$, shortened to $re^{i\theta}$ (the shorthand you met with Euler’s formula; the next lesson shows why it is the right name). The surprise is what **multiplication** does:

$$|zw| = |z|\,|w|, \qquad \arg(zw) = \arg z + \arg w$$

So multiplying by a fixed $c$ is an **operation on the whole plane**: every point is turned about $0$ through $\arg c$ and stretched by $|c|$. Shapes keep their angles and their proportions. Multiplying by $i$ is a quarter-turn; by $-1$, a half-turn.`,
  symbols: [
    { tex: 'z,\\ w', text: t`complex numbers $x + iy$: points of the plane, real part across and imaginary part up. Here they carry no units (a phasor or an impedance borrows the units of what it describes)` },
    { tex: 'i', text: t`the imaginary unit, with $i^2 = -1$. Geometrically: the point one unit straight up, and the operation “turn a quarter-turn anticlockwise”` },
    { tex: '|z|', text: t`the **modulus**, $\sqrt{x^2 + y^2}$: the length of the arrow from $0$ to $z$` },
    { tex: t`\arg z`, text: t`the **argument**, the angle from the positive real axis to the arrow, anticlockwise positive. It is defined only up to whole turns: $30^\circ$ and $390^\circ$ name the same direction, so we report it between $-180^\circ$ and $180^\circ$` },
    { tex: t`re^{i\theta}`, text: t`polar form: length $r = |z|$, angle $\theta = \arg z$; it means $r(\cos\theta + i\sin\theta)$` },
  ],
  why: t`Rotations in the plane, AC phasors, quantum phases and the oscillating factors $e^{i\omega t}$ of every wave all run on this one rule — and from the next module on, a complex function will be studied by what it does, point by point, as a little rotation and scaling.`,
  visual: {
    type: 'cx-map',
    title: 'Multiply the whole plane by c',
    lead: t`The faint grid, the faint letter F and the grey arrow $z$ are the plane before; the bold ones are after multiplying everything by $c = |c|e^{i\arg c}$. Drag $z$ and watch the gold arrow $cz$ follow, always turned by the same angle and stretched by the same factor.`,
    tasks: [
      t`Set $|c| = 1$ and $\arg c = 90^\circ$: that is $c = i$. Every point makes a quarter-turn — the F stands on its side but is not mirrored.`,
      t`Set $\arg c = 180^\circ$: multiplying by $-1$ is a half-turn, not a reflection.`,
      t`Set $|c| = 2$, $\arg c = 0$: a pure stretch. Now $\arg c = 30^\circ$ too: the grid’s right angles survive every setting.`,
    ],
    params: multiplyBy(1, 40),
    caption: t`The map $z \mapsto cz$ drawn on one plane: faint before, bold after. The grid square and the letter F are only there to show shape; every point of the plane moves the same way.`,
  },
  example: {
    prompt: t`Multiply $z = 1 + 2i$ by $w = 3 + i$, first by algebra, then by lengths and angles, and check that the two agree.`,
    visual: argand({
      arrows: [{ to: EZ, color: 'accent', label: 'z' }, { to: EW, color: 'warn', label: 'w' }, { to: EP, color: 'gold', label: 'zw' }],
      arcs: [{ r: 1.1, from: 0, to: M.arg(EW), color: 'warn' }, { r: 1.6, from: M.arg(EW), to: M.arg(EP), color: 'accent' }],
      view: 4.2, center: [1, 3.3],
      caption: t`To scale. The angle of $zw$ (gold) is the angle of $w$ (orange arc) plus the angle of $z$ (blue arc, laid on top of it); its length is $|z|\,|w| = \sqrt5\cdot\sqrt{10}$.`,
    }),
    steps: [
      { label: 'Algebra', text: t`Multiply out and use $i^2 = -1$: $(1 + 2i)(3 + i) = 3 + i + 6i + 2i^2 = 1 + 7i$.` },
      { label: 'Lengths', text: t`$|z| = \sqrt{1 + 4} = \sqrt5$ and $|w| = \sqrt{9 + 1} = \sqrt{10}$, so the rule predicts $|zw| = \sqrt{50} = ${nm(Math.sqrt(50), 4)}$. Directly: $|1 + 7i| = \sqrt{1 + 49} = \sqrt{50}$. ✓` },
      { label: 'Angles', text: t`$\arg z = \arctan 2 = ${nm(deg(M.arg(EZ)), 4)}^\circ$ and $\arg w = \arctan\tfrac13 = ${nm(deg(M.arg(EW)), 4)}^\circ$. Their sum is $${nm(deg(M.arg(EZ)) + deg(M.arg(EW)), 4)}^\circ$; directly, $\arg(1 + 7i) = \arctan 7 = ${nm(deg(M.arg(EP)), 4)}^\circ$. ✓` },
      { label: 'Why it works', text: t`In polar form $zw = r_1r_2\big[(\cos\theta_1\cos\theta_2 - \sin\theta_1\sin\theta_2) + i(\sin\theta_1\cos\theta_2 + \cos\theta_1\sin\theta_2)\big] = r_1r_2\big[\cos(\theta_1 + \theta_2) + i\sin(\theta_1 + \theta_2)\big]$ — the angle-addition formulas are hiding inside complex multiplication.` },
    ],
    answer: t`$zw = 1 + 7i$: length $\sqrt{50} = \sqrt5\cdot\sqrt{10}$, angle $${nm(deg(M.arg(EP)), 4)}^\circ = ${nm(deg(M.arg(EZ)), 4)}^\circ + ${nm(deg(M.arg(EW)), 4)}^\circ$.`,
  },
  practice: [
    mcq({
      id: 'which-iz', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [3, 1], [1, 2], [3, 2], [2, 3]]);
        const z = [a, b];
        const cands = [M.mul([0, 1], z), M.mul([0, -1], z), M.conj(z), M.add(z, [0, 1])];
        const L = ['P', 'Q', 'R', 'S'], at = r.shuffle([0, 1, 2, 3]);    // candidate k is labelled L[at[k]]
        const names = at.map((j) => L[j]);
        const why = {
          [at[1]]: t`Point ${names[1]} is $-iz$: a quarter-turn **clockwise**. Multiplying by $i$ turns anticlockwise, the positive direction of angles.`,
          [at[2]]: t`Point ${names[2]} is $\bar z = ${cTeX(M.conj(z))}$, the mirror image in the real axis. Multiplying never mirrors: it turns and stretches.`,
          [at[3]]: t`Point ${names[3]} is $z + i$: one unit straight up. That is **adding** $i$, a slide, not multiplying by it.`,
        };
        return {
          prompt: t`The point $z = ${cTeX(z)}$ is marked. Which labelled point is $iz$?`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }], pts: cands.map((p, k) => ({ z: p, label: names[k], color: 'gold' })), circles: [{ r: Math.hypot(a, b) }], view: 3.6, caption: 'The dashed circle is |w| = |z|: every rotation of z about 0 lands on it.' }),
          choices: L, answer: at[0], why, fixedOrder: true,
          hints: [t`Multiplying by $i$ keeps the length ($|i| = 1$) and adds $90^\circ$ to the angle.`, t`Algebra agrees: $i(${a} + ${b}i) = ${a}i + ${b}i^2 = ${cTeX(M.mul([0, 1], z))}$.`],
          teach: t`Multiplying by $i$ is a quarter-turn anticlockwise about $0$.`,
          explain: t`$iz = ${cTeX(M.mul([0, 1], z))}$, point ${names[0]}: the same distance from $0$ as $z$, turned $90^\circ$ anticlockwise.`,
        };
      },
    }),
    num({
      id: 'mod-product', difficulty: 2,
      gen(r) {
        const [p, q] = r.shuffle(T).slice(0, 2);
        const z = [p[0] * r.sign(), p[1] * r.sign()], w = [q[1] * r.sign(), q[0] * r.sign()];
        const mz = Math.hypot(...z), mw = Math.hypot(...w), ans = mz * mw;
        const V = Math.max(...z.map(Math.abs), ...w.map(Math.abs)) * 1.15;
        return {
          prompt: t`Without multiplying out, find $|zw|$ for $z = ${cTeX(z)}$ and $w = ${cTeX(w)}$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: w, color: 'warn', label: 'w' }], view: V, caption: 'The two arrows to scale; their product would be far off this picture.' }),
          answer: ans, tol: { rel: 1e-6, abs: 0.01 },
          errors: [{ value: mz + mw, feedback: t`Moduli **multiply** under multiplication: $|zw| = |z|\,|w|$, not $|z| + |w|$.` }],
          hints: [t`$|zw| = |z|\,|w|$.`, t`$|z| = \sqrt{${z[0]}^2 + ${z[1]}^2} = ${mz}$ and $|w| = ${mw}$.`],
          teach: 'Lengths multiply when complex numbers multiply.',
          explain: t`$|z| = ${mz}$ and $|w| = ${mw}$, so $|zw| = ${mz}\times${mw} = ${ans}$. (Multiplying out gives $zw = ${cTeX(M.mul(z, w))}$, whose modulus is indeed $${ans}$.)`,
        };
      },
    }),
    {
      type: 'point', id: 'drag-zw', difficulty: 2,
      gen(r) {
        const z = r.pick([[1, 1], [2, 1], [1, 2], [1, -1], [-1, 1]]);
        const w = r.pick([[0, 1], [1, 1], [0.5, 1], [-1, 1], [1, -1]]);
        const p = M.mul(z, w);
        return {
          prompt: t`Drag the gold point to the product $zw$, where $z = ${cTeX(z)}$ and $w = ${cTeX(w)}$. Think in lengths and angles, then check with algebra.`,
          visual: (() => { const v = argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: w, color: 'warn', label: 'w' }], circles: [{ r: 1 }], view: 3.3, caption: 'The dashed circle has radius 1, for judging lengths.' }); v.params.drag = [{ key: 'p', x: 0.3, y: -2.6, snap: 0.05 }]; return v; })(),
          answer: { x: r6(p[0]), y: r6(p[1]) }, tol: { x: 0.2, y: 0.2 },
          instruction: 'Drag the point to zw, then check.',
          hints: [t`$|zw| = |z|\,|w| = ${nm(Math.hypot(...z), 3)}\times${nm(Math.hypot(...w), 3)}$ and $\arg(zw) = ${nm(deg(M.arg(z)), 3)}^\circ + ${nm(deg(M.arg(w)), 3)}^\circ$.`, t`Or multiply out: $(${cTeX(z)})(${cTeX(w)})$, using $i^2 = -1$.`],
          teach: 'To multiply, add the angles and multiply the lengths.',
          explain: t`$zw = ${cTeX(p)}$: length $${nm(Math.hypot(...p), 3)}$ and angle $${nm(deg(M.arg(p)), 3)}^\circ$.`,
        };
      },
    },
    num({
      id: 'arg-wrap', difficulty: 2,
      gen(r) {
        const a = r.pick([80, 110, 130, 150]), b = r.pick([115, 125, 140, 160]);
        const ra = r.pick([1.5, 2]), rb = r.pick([1, 1.5]);
        const ans = wrapDeg(a + b);
        return {
          prompt: t`$z$ has length $${ra}$ and argument $${a}^\circ$; $w$ has length $${rb}$ and argument $${b}^\circ$. Find $\arg(zw)$, as an angle between $-180^\circ$ and $180^\circ$.`,
          visual: argand({ arrows: [{ to: M.polar(ra, a * DEG), color: 'accent', label: 'z' }, { to: M.polar(rb, b * DEG), color: 'warn', label: 'w' }], arcs: [{ r: 0.5, from: 0, to: a * DEG, color: 'accent' }, { r: 0.7, from: 0, to: b * DEG, color: 'warn' }], view: 2.4, caption: 'The two arrows and their angles, measured anticlockwise from the positive real axis.' }),
          answer: ans, units: '°', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: a + b, feedback: t`That is the right direction, but $${a + b}^\circ$ is more than half a turn: subtract $360^\circ$ to report it between $-180^\circ$ and $180^\circ$.` }, { value: b - a, feedback: 'Angles add under multiplication; subtracting them is division.' }],
          hints: [t`$\arg(zw) = \arg z + \arg w$.`, t`$${a}^\circ + ${b}^\circ = ${a + b}^\circ$; the same direction is $${a + b}^\circ - 360^\circ$.`],
          teach: 'Arguments add, and any angle can be shifted by a whole turn without changing the direction.',
          explain: t`$${a}^\circ + ${b}^\circ = ${a + b}^\circ$, which points the same way as $${ans}^\circ$. (The length, $${ra}\times${rb} = ${nm(ra * rb)}$, plays no part in the angle.)`,
        };
      },
    }),
    mcq({
      id: 'divide', difficulty: 2,
      gen(r) {
        const [r1, r2] = r.pick([[6, 2], [8, 2], [12, 4], [12, 2], [9, 3]]);
        const a = r.pick([100, 120, 150, 80]), b = r.pick([30, 40, 60]);
        const pol = (m, d) => t`$${m}e^{i\,${d}^\circ}$`;
        return {
          prompt: t`Divide $z = ${r1}e^{i\,${a}^\circ}$ by $w = ${r2}e^{i\,${b}^\circ}$.`,
          visual: argand({ arrows: [{ to: M.polar(r1, a * DEG), color: 'accent', label: 'z' }, { to: M.polar(r2, b * DEG), color: 'warn', label: 'w' }], view: r1 * 0.75, center: [0, r1 * 0.45], caption: 'z and w to scale.' }),
          choices: [pol(r1 / r2, a - b), pol(r1 / r2, a + b), pol(r1 * r2, a - b), pol(r1 - r2, a - b)],
          answer: 0,
          why: {
            1: t`Division undoes multiplication, so it **subtracts** the angle of $w$: dividing by $w$ turns back by $${b}^\circ$.`,
            2: t`The angle is right, but lengths divide in a quotient: $|z/w| = |z|/|w|$.`,
            3: t`Lengths scale by a factor, they do not subtract: $|z/w| = ${r1}/${r2}$.`,
          },
          hints: [t`$z/w$ is the number that, multiplied by $w$, gives back $z$.`, t`So its length times $${r2}$ must be $${r1}$, and its angle plus $${b}^\circ$ must be $${a}^\circ$.`],
          teach: 'Dividing by w un-does w: divide the lengths and subtract the angles.',
          explain: t`$z/w = \tfrac{${r1}}{${r2}}e^{i(${a}^\circ - ${b}^\circ)} = ${nm(r1 / r2)}e^{i\,${a - b}^\circ}$. Check: multiplying it by $w$ adds back $${b}^\circ$ and the factor $${r2}$.`,
        };
      },
    }),
    mcq({
      id: 'sqrt-i', difficulty: 3,
      prompt: t`Which number $c$ in the first quadrant turns $1$ into $i$ when you multiply by it **twice** — that is, $c^2 = i$?`,
      visual: argand({ pts: [{ z: [1, 0], label: '1', color: 'ink2' }, { z: [0, 1], label: 'i', color: 'gold' }], circles: [{ r: 1 }], arcs: [{ r: 0.45, from: 0, to: Math.PI / 2, color: 'gold' }], view: 1.5, caption: t`From $1$ to $i$ is a quarter-turn with no stretch. Two equal steps must each do half of it.` }),
      choices: [t`$\tfrac{1}{\sqrt2}(1 + i)$`, t`$1 + i$`, t`$\tfrac12(1 + i)$`, t`$\tfrac{i}{2}$`],
      answer: 0,
      why: {
        1: t`The angle is right ($45^\circ$, half the quarter-turn), but $|1 + i| = \sqrt2$, so two steps stretch by $2$: $(1 + i)^2 = 2i$.`,
        2: t`$|\tfrac12(1 + i)| = \tfrac{1}{\sqrt2}$, so two steps shrink by $\tfrac12$: the square is $\tfrac{i}{2}$.`,
        3: t`$\tfrac{i}{2}$ turns by $90^\circ$ per step — two steps make a half-turn, to $-\tfrac14$. Halving the **number** does not halve the **angle**.`,
      },
      hints: ['Split the job in two equal parts: each multiplication must do half the turning and half the stretching (in the sense of factors).', t`Half of a $90^\circ$ turn is $45^\circ$; a stretch of $1$ split into two equal factors is $1\times1$.`],
      teach: 'Square roots halve the angle and take the square root of the length.',
      explain: t`$c = e^{i\,45^\circ} = \tfrac{1}{\sqrt2}(1 + i)$: length $1$, angle $45^\circ$. Twice: length $1$, angle $90^\circ$ — that is $i$. (Its negative, at $-135^\circ$, also squares to $i$.)`,
    }),
  ],
  checkpoint: [
    {
      type: 'point', id: 'cp-quotient', difficulty: 2,
      gen(r) {
        const q = r.pick([[1, 1], [2, 0], [0, 1], [1, -1], [-1, 1], [0, -2]]);
        const w = r.pick([[1, 1], [0, 1], [1, 2], [2, -1]]);
        const z = M.mul(q, w);
        return {
          prompt: t`Drag the gold point to $z/w$, where $z = ${cTeX(z)}$ and $w = ${cTeX(w)}$.`,
          visual: (() => { const v = argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: w, color: 'warn', label: 'w' }], circles: [{ r: 1 }], view: 3.4, caption: 'The dashed circle has radius 1.' }); v.params.drag = [{ key: 'p', x: -2.5, y: -2.6, snap: 0.05 }]; return v; })(),
          answer: { x: r6(q[0]), y: r6(q[1]) }, tol: { x: 0.2, y: 0.2 },
          instruction: 'Drag the point to z/w, then check.',
          hints: [t`$|z/w| = |z|/|w|$ and $\arg(z/w) = \arg z - \arg w$.`, t`Or multiply top and bottom by $\bar w$: $\dfrac{z}{w} = \dfrac{z\bar w}{|w|^2}$.`],
          teach: 'Division divides the lengths and subtracts the angles.',
          explain: t`$z/w = \dfrac{(${cTeX(z)})(${cTeX(M.conj(w))})}{${w[0] ** 2 + w[1] ** 2}} = ${cTeX(q)}$. Check: $(${cTeX(q)})(${cTeX(w)}) = ${cTeX(z)}$.`,
        };
      },
    },
    num({
      id: 'cp-power', difficulty: 3,
      gen(r) {
        const [z, zt, a] = r.pick([[[1, Math.sqrt(3)], t`1 + \sqrt3\,i`, 60], [[Math.sqrt(3), 1], t`\sqrt3 + i`, 30], [[1, 1], t`1 + i`, 45], [[-1, 1], t`-1 + i`, 135]]);
        const n = r.int(3, 5);
        const ans = wrapDeg(a * n);
        return {
          prompt: t`Find $\arg\big[(${zt})^{${n}}\big]$, between $-180^\circ$ and $180^\circ$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }], arcs: [{ r: 0.6, from: 0, to: a * DEG, color: 'accent' }], circles: [{ r: Math.hypot(...z) }], view: 2.3, caption: t`$z = ${zt}$ and its angle. Each multiplication by $z$ adds that angle again.` }),
          answer: ans, units: '°', tol: { rel: 0, abs: 0.5 },
          errors: a * n !== ans ? [{ value: a * n, feedback: t`Right direction — now report it between $-180^\circ$ and $180^\circ$ by taking off whole turns.` }] : [],
          hints: [t`Each factor adds $\arg z = ${a}^\circ$, so $\arg z^{${n}} = ${n}\times${a}^\circ$, up to whole turns.`, t`$${n}\times${a}^\circ = ${a * n}^\circ$. Subtract $360^\circ$ if it is above $180^\circ$.`],
          teach: t`A power multiplies the angle: $\arg z^n = n\arg z$ (up to whole turns), and $|z^n| = |z|^n$.`,
          explain: t`$\arg z = ${a}^\circ$, so $\arg z^{${n}} = ${a * n}^\circ$, the same direction as $${ans}^\circ$. The length is $|z|^{${n}} = ${nm(Math.hypot(...z) ** n, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-phasor', difficulty: 2, transfer: true,
      gen(r) {
        const [R, X] = r.pick([[30, 40], [60, 80], [50, 120], [80, 60], [120, 50], [40, 30]]);
        const I0 = r.pick([0.5, 1.5, 2, 2.5]);
        const Z = Math.hypot(R, X), V = Z * I0, phi = deg(Math.atan2(X, R));
        return {
          prompt: t`In AC circuit analysis the current is a complex number $I$ (its length is the current’s amplitude, its angle the phase) and a load is a complex **impedance** $Z = R + iX$. The voltage across the load is the product $V = ZI$. A load with $R = ${R}\ \Omega$ and $X = ${X}\ \Omega$ carries a current of amplitude $${I0}$ A. What is the amplitude of the voltage across it?`,
          visual: argand({ arrows: [{ to: [2, 0], color: 'accent', label: 'I' }, { to: M.polar(1.6, Math.atan2(X, R)), color: 'warn', label: 'Z' }, { to: M.polar(3.4, Math.atan2(X, R)), color: 'gold', label: 'V = ZI', dash: [6, 4] }], arcs: [{ r: 0.8, from: 0, to: Math.atan2(X, R), color: 'warn' }], view: 2.2, center: [1.3, 1.4], ticks: false, caption: t`Directions true, lengths not to scale: the current phasor $I$ along the real axis, the impedance $Z$, and the voltage $V = ZI$ — the current turned through $\arg Z$ and stretched by $|Z|$.` }),
          answer: V, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: (R + X) * I0, feedback: t`$|Z|$ is the length of the arrow $R + iX$: $\sqrt{R^2 + X^2}$, not $R + X$.` }, { value: R * I0, feedback: 'That is only the resistor’s share. The impedance’s full length multiplies the current.' }],
          hints: [t`Lengths multiply: $|V| = |Z|\,|I|$.`, t`$|Z| = \sqrt{${R}^2 + ${X}^2} = ${nm(Z)}\ \Omega$.`],
          teach: 'An impedance acts on a current phasor exactly as a complex number acts on the plane: it stretches it by |Z| and turns it by arg Z.',
          explain: t`$|V| = |Z|\,|I| = ${nm(Z)}\ \Omega\times${I0}\ \text{A} = ${nm(V, 4)}$ V. Multiplying by $Z$ also turns the phasor by $\arg Z = \arctan(${X}/${R}) = ${nm(phi, 3)}^\circ$: the voltage leads the current by that angle, the phase angle of [the RLC lesson](#/lesson/phys2220.B5.2).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed., OUP 2023), ch. 1', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), ch. 1', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
