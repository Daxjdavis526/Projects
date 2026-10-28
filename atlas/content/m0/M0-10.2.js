// The complex plane, modulus and argument — a + bi as the point (a, b); its distance from 0 and its direction.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { D2R, deg, wrap180, circ, plane, dot } from './_m0geo.js';
import { M, cTeX, argand } from '../st-d/_cx.js';

const t = String.raw;
const arcTo = (z, r = 0.6) => { const a = M.arg(z); return { r, from: Math.min(0, a), to: Math.max(0, a), color: 'gold' }; };

export default lesson({
  id: 'm0.M0-10.2',
  title: 'The complex plane, modulus and argument',
  minutes: 9, difficulty: 2,
  intro: t`Plot $z = a + bi$ as the point $(a, b)$: the real part across, the imaginary part up. This is the **complex plane** (or Argand diagram), and in it a complex number is also an arrow from $0$. Adding complex numbers is adding arrows tip to tail; the conjugate $\bar z$ is the mirror image in the real axis. Like any arrow, $z$ has a length and a direction:

$$|z| = \sqrt{a^2 + b^2}, \qquad \arg z = \theta \ \text{ with } \ a = |z|\cos\theta,\ \ b = |z|\sin\theta$$

The **modulus** $|z|$ is the distance from $0$; the **argument** $\arg z$ is the angle from the positive real axis, usually taken in $(-180^\circ, 180^\circ]$ (the **principal** value). As with any polar angle, $\tan\theta = b/a$ does not fix $\theta$: read the quadrant from the signs of $a$ and $b$. Together they give the **polar form** $z = |z|(\cos\theta + i\sin\theta)$.`,
  symbols: [
    { tex: 'a,\\ b', text: 'the real and imaginary parts: the point’s coordinates' },
    { tex: '|z|', text: 'the **modulus**: the length of the arrow, never negative (in the units $z$ carries)' },
    { tex: '\\arg z = \\theta', text: 'the **argument**: the arrow’s angle from the positive real axis, anticlockwise positive; principal value in $(-180^\\circ, 180^\\circ]$ (or $(-\\pi, \\pi]$)' },
    { tex: '\\bar z', text: 'the conjugate $a - bi$: same modulus, opposite argument' },
  ],
  why: t`In physics the modulus and argument are the **amplitude** and **phase**: an AC voltage, a light wave or a quantum amplitude is a complex number whose length says how big and whose angle says when. The [complex-numbers course](#/lesson/st-d.D1.1) and every phasor diagram build on this picture.`,
  visual: {
    type: 'graph',
    title: 'Length and angle of a complex number',
    lead: t`Drag $z$ anywhere (it snaps to half-units). The gold arc is its argument; the dashed arrow is its conjugate $\bar z$. Compare the true argument with what a calculator’s $\tan^{-1}(b/a)$ returns.`,
    tasks: [
      t`Drag $z$ to $-3 + 4i$: $|z| = 5$ and $\arg z = 126.9^\circ$, but $\tan^{-1}(4/(-3)) = -53.1^\circ$ — pointing the opposite way.`,
      t`Drag $z$ below the real axis: the argument turns negative. The conjugate always mirrors $z$ and has the opposite argument.`,
      t`Drag $z$ straight up to $2i$: $\arg z = 90^\circ$, and $b/a$ has no value at all.`,
    ],
    params: {
      x: [-10, 10], y: [-5, 5], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im',
      drag: [{ key: 'p', x: -3, y: 4, snap: 0.5 }],
      curves: [
        { param: ['0.9*cos(t*atan2(py, px))', '0.9*sin(t*atan2(py, px))'], t: [0, 1], color: 'gold', width: 2.4 },
        { param: ['sqrt(px^2 + py^2)*cos(t)', 'sqrt(px^2 + py^2)*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true },
      ],
      arrows: [
        { from: [0, 0], to: ['px', 'py'], color: 'accent', width: 2.8, label: 'z' },
        { from: [0, 0], to: ['px', '-py'], color: 'warn', width: 1.8, dash: true, label: 'conj z' },
      ],
      readouts: [
        { label: t`$z$: real part`, expr: 'px', digits: 3 },
        { label: 'imaginary part', expr: 'py', digits: 3 },
        { label: t`$|z|$`, expr: 'sqrt(px^2 + py^2)', digits: 4 },
        { label: t`$\arg z$`, expr: 'atan2(py, px)*180/pi', digits: 4, unit: '^\\circ' },
        { label: t`$\tan^{-1}(b/a)$`, expr: 'atan(py/px)*180/pi', digits: 4, unit: '^\\circ' },
      ],
    },
    caption: t`To scale; the faint circle has radius $|z|$ — every number on it has the same modulus.`,
  },
  example: {
    prompt: t`Find the modulus and argument of $z = -2\sqrt3 + 2i$, and write it in polar form.`,
    visual: argand({ arrows: [{ to: [-2 * Math.sqrt(3), 2], color: 'accent', label: 'z' }], arcs: [arcTo([-2 * Math.sqrt(3), 2], 0.9)], circles: [{ r: 4 }], view: 4.6, caption: t`$z$ in the second quadrant, its argument (gold) and the circle of radius $|z|$.` }),
    steps: [
      { label: 'Modulus', text: t`$|z| = \sqrt{(-2\sqrt3)^2 + 2^2} = \sqrt{12 + 4} = 4$.` },
      { label: 'Quadrant', text: t`Real part negative, imaginary part positive: $z$ is in the **second quadrant**, so $90^\circ < \arg z < 180^\circ$.` },
      { label: 'Reference angle', text: t`$\tan^{-1}\left|\dfrac{2}{-2\sqrt3}\right| = \tan^{-1}\dfrac{1}{\sqrt3} = 30^\circ$ from the negative real axis.` },
      { label: 'Argument', text: t`$\arg z = 180^\circ - 30^\circ = 150^\circ = \tfrac{5\pi}{6}$. (A calculator’s $\tan^{-1}(b/a) = -30^\circ$ points into the fourth quadrant: wrong.)` },
      { label: 'Polar form', text: t`$z = 4(\cos 150^\circ + i\sin 150^\circ)$. Check: $4\cos 150^\circ = -2\sqrt3$ ✓ and $4\sin 150^\circ = 2$ ✓.` },
    ],
    answer: t`$|z| = 4$, $\arg z = 150^\circ = \tfrac{5\pi}{6}$; $z = 4(\cos 150^\circ + i\sin 150^\circ)$.`,
  },
  practice: [
    num({
      id: 'modulus', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[5, 12], [8, 15], [7, 24], [20, 21], [2, 3], [1, 1]]), z = [r.sign() * a, r.sign() * b], ans = Math.hypot(a, b);
        return {
          prompt: t`Find $|z|$ for $z = ${cTeX(z)}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a + b, feedback: t`The modulus is a length: $\sqrt{a^2 + b^2}$, not $|a| + |b|$.` }, { value: a * a + b * b, feedback: t`That is $|z|^2$. Take the square root.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$|z|$ is the distance from $0$ to the point $(${z[0]}, ${z[1]})$.`],
          teach: t`$|a + bi| = \sqrt{a^2 + b^2}$: Pythagoras on the real and imaginary parts.`,
          explain: t`$|z| = \sqrt{${a * a} + ${b * b}} = ${sig(ans, 4)}$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }], view: 1.2 * Math.max(a, b), caption: t`$z$ as an arrow from $0$.` }),
        };
      },
    }),
    num({
      id: 'argument', difficulty: 3,
      gen(r) {
        const z = r.pick([[-3, 4], [-5, -12], [-1, -1], [-8, 6], [-4, -3], [-7, 24]]), ans = deg(M.arg(z)), naive = deg(Math.atan(z[1] / z[0]));
        return {
          prompt: t`Find the principal argument of $z = ${cTeX(z)}$, in degrees in $(-180^\circ, 180^\circ]$.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [
            { value: naive, feedback: t`That is $\tan^{-1}(b/a)$, which only reaches the right half-plane. $z$ has a negative real part: ${z[1] > 0 ? t`add $180^\circ$` : t`subtract $180^\circ$`}.` },
            { value: deg(Math.atan(Math.abs(z[1] / z[0]))), feedback: t`That is the reference angle. Place it in $z$’s quadrant.` },
            { value: ans + 360, feedback: t`Same direction, but outside the principal range: subtract $360^\circ$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`Real part ${z[0] < 0 ? 'negative' : 'positive'}, imaginary part ${z[1] < 0 ? 'negative' : 'positive'}: quadrant ${z[1] > 0 ? 'II' : 'III'}.`, t`Reference angle $\tan^{-1}|b/a| = ${sig(deg(Math.atan(Math.abs(z[1] / z[0]))), 4)}^\circ$, measured from the negative real axis ${z[1] > 0 ? 'upward' : 'downward'}.`],
          teach: t`Argument = reference angle, placed in the quadrant set by the signs — \`atan2(b, a)\`.`,
          explain: t`${z[1] > 0 ? t`$\arg z = 180^\circ - ${sig(deg(Math.atan(Math.abs(z[1] / z[0]))), 4)}^\circ` : t`$\arg z = -180^\circ + ${sig(deg(Math.atan(Math.abs(z[1] / z[0]))), 4)}^\circ`} = ${sig(ans, 4)}^\circ$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }], view: 1.2 * Math.max(Math.abs(z[0]), Math.abs(z[1])), caption: t`$z$ in the plane. Its argument is measured from the positive real axis.` }),
        };
      },
    }),
    {
      type: 'point', id: 'drag-sum', difficulty: 2,
      gen(r) {
        const z = r.pick([[2, 1], [-1, 2], [3, -1], [1, 3]]), w = r.pick([[-3, 1], [1, -2], [-2, -1], [2, 2]]), s = M.add(z, w);
        const v = argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: w, color: 'warn', label: 'w' }], view: 4.2, caption: t`$z$ (blue) and $w$ (orange). Drag the gold point.` });
        v.params.drag = [{ key: 'p', x: 0.5, y: -3.5, snap: 0.5 }];
        return {
          prompt: t`Drag the gold point to $z + w$, where $z = ${cTeX(z)}$ and $w = ${cTeX(w)}$.`,
          visual: v, answer: { x: s[0], y: s[1] }, tol: { x: 0.3, y: 0.3 },
          instruction: 'Drag the point to z + w, then check.',
          hints: [t`Add real parts and imaginary parts separately.`, t`Or slide $w$’s arrow so its tail sits on $z$’s tip: the sum is where its tip lands.`],
          teach: t`Complex numbers add like arrows, tip to tail — like 2D vectors.`,
          explain: t`$z + w = (${z[0]} + (${w[0]})) + (${z[1]} + (${w[1]}))i = ${cTeX(s)}$.`,
        };
      },
    },
    mcq({
      id: 'which-arg', difficulty: 2,
      prompt: t`Which number has argument $\tfrac{3\pi}{4}$ ($135^\circ$)?`,
      choices: [t`$-1 + i$`, t`$1 - i$`, t`$1 + i$`, t`$-1 - i$`],
      answer: 0,
      why: {
        1: t`$1 - i$ has the same $b/a = -1$ as $-1 + i$, but points the opposite way: its argument is $-\tfrac{\pi}{4}$. The ratio alone cannot tell them apart.`,
        2: t`$1 + i$ is in the first quadrant, at $\tfrac{\pi}{4}$.`,
        3: t`$-1 - i$ is in the third quadrant, at $-\tfrac{3\pi}{4}$.`,
      },
      hints: [t`$\tfrac{3\pi}{4}$ is in the second quadrant: real part negative, imaginary part positive.`],
      teach: t`$\tan\theta$ cannot distinguish opposite directions; the signs of the parts can.`,
      explain: t`$-1 + i$: left one, up one — $45^\circ$ short of the negative real axis, so $\arg = 135^\circ = \tfrac{3\pi}{4}$.`,
      visual: plane({ x: [-3, 3], y: [-1.5, 1.5], ticks: false, xlabel: 'Re', ylabel: 'Im', curves: [circ([0, 0], 1.414, { color: 'ink4', width: 1, dash: true })], points: [1, -1].flatMap((a) => [1, -1].map((b) => dot([a, b], '', { color: 'gold', r: 5 }))), caption: t`The four candidates, all at distance $\sqrt2$ from $0$.` }),
    }),
    num({
      id: 'distance', difficulty: 2,
      gen(r) {
        const z = [r.int(-3, 4), r.int(-3, 4)], d = r.pick([[3, 4], [5, 12], [6, 8], [4, -3], [-8, 6]]), w = [z[0] + d[0], z[1] + d[1]], ans = Math.hypot(...d);
        return {
          prompt: t`How far apart are $z = ${cTeX(z)}$ and $w = ${cTeX(w)}$ in the complex plane? (That distance is $|w - z|$.)`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(M.abs(w) - M.abs(z)), feedback: t`$\big||w| - |z|\big|$ compares distances from $0$, not from each other. Subtract the numbers first: $|w - z|$.` }, { value: M.abs(M.add(w, z)), feedback: t`That is $|w + z|$. The distance between them is $|w - z|$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$w - z = ${cTeX(d)}$. Its modulus is the distance.`],
          teach: t`$|w - z|$ is the distance between the points $w$ and $z$ — the distance formula in complex dress.`,
          explain: t`$w - z = ${cTeX(d)}$, so $|w - z| = \sqrt{${d[0] ** 2} + ${d[1] ** 2}} = ${sig(ans, 4)}$.`,
          visual: argand({ pts: [{ z, label: 'z', color: 'accent' }, { z: w, label: 'w', color: 'warn' }], arrows: [{ from: z, to: w, color: 'gold', dash: [5, 4] }], view: 1.15 * Math.max(...[z, w].flat().map(Math.abs), 3), caption: t`The two points and the segment joining them.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-reflection', difficulty: 3, transfer: true,
      gen(r) {
        const G = r.pick([[-0.3, 0.4], [-0.6, -0.2], [-0.12, 0.35], [-0.5, -0.5], [-0.24, 0.07]]), ans = deg(M.arg(G));
        return {
          prompt: t`A deep-space antenna’s feed is tested by measuring its **reflection coefficient** $\Gamma = ${cTeX(G)}$: the fraction of the signal bounced back, as a complex number whose modulus is the size of the echo and whose argument is its phase shift. What is the phase, in degrees in $(-180^\circ, 180^\circ]$?`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: deg(Math.atan(G[1] / G[0])), feedback: t`$\tan^{-1}(b/a)$ put $\Gamma$ in the right half-plane, but its real part is negative. ${G[1] > 0 ? t`Add $180^\circ$.` : t`Subtract $180^\circ$.`}` }, { value: ans + 360, feedback: t`Same direction, outside the principal range: subtract $360^\circ$.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`Which quadrant is $\Gamma$ in? Look at the signs of its real and imaginary parts.`, t`Reference angle $\tan^{-1}|b/a| = ${sig(deg(Math.atan(Math.abs(G[1] / G[0]))), 4)}^\circ$, measured from the negative real axis ${G[1] > 0 ? 'upward' : 'downward'}.`],
          teach: t`Phase is the argument: quadrant first, then the reference angle.`,
          explain: t`$\Gamma$ is in quadrant ${G[1] > 0 ? 'II' : 'III'}: phase $${sig(ans, 4)}^\circ$; the echo’s size is $|\Gamma| = ${sig(M.abs(G), 3)}$, so $${sig(100 * M.abs(G) ** 2, 2)}\%$ of the power is reflected.`,
          visual: argand({ arrows: [{ to: G, color: 'accent', label: 'Γ' }], circles: [{ r: 1 }], view: 1.15, caption: t`$\Gamma$ in the plane; a passive antenna keeps it inside the unit circle (dashed).` }),
        };
      },
    }),
    mcq({
      id: 'cp-conj', difficulty: 1,
      prompt: t`In the complex plane, where is $\bar z$ compared with $z$?`,
      choices: ['Its mirror image in the real axis', 'Its mirror image in the imaginary axis', 'Opposite it, through 0 (a half-turn)', 'A quarter-turn anticlockwise from it'],
      answer: 0,
      why: {
        1: t`Mirroring in the imaginary axis flips the **real** part: that is $-\bar z$.`,
        2: t`A half-turn flips both parts: that is $-z$.`,
        3: t`A quarter-turn anticlockwise is multiplying by $i$: $iz$.`,
      },
      hints: [t`$\bar z = a - bi$: which coordinate changes sign?`],
      teach: t`Conjugation flips the imaginary part: a reflection in the real axis, same modulus, opposite argument.`,
      explain: t`$a + bi \to a - bi$ keeps the real part and flips the imaginary part: reflection in the real axis.`,
      visual: argand({ arrows: [{ to: [2, 1.5], color: 'accent', label: 'z' }], view: 2.6, caption: t`A number $z$ in the first quadrant.` }),
    }),
    num({
      id: 'cp-mod-decimal', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2.4, -0.7], [-1.2, 0.5], [0.6, -0.8], [-2.8, -9.6]]), ans = Math.hypot(a, b);
        return {
          prompt: t`What is the modulus of $z = ${cTeX([a, b])}$?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(a) + Math.abs(b), feedback: t`Add the squares, then take the root.` }, { value: a * a + b * b, feedback: t`That is $|z|^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\sqrt{a^2 + b^2}$.`],
          teach: t`$|z| = \sqrt{a^2 + b^2}$ for any real $a$, $b$ — decimals included.`,
          explain: t`$|z| = \sqrt{${sig(a * a, 4)} + ${sig(b * b, 4)}} = ${sig(ans, 4)}$.`,
          visual: argand({ arrows: [{ to: [a, b], color: 'accent', label: 'z' }], view: 1.25 * Math.max(Math.abs(a), Math.abs(b)), caption: t`$z$ as an arrow from $0$.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.5 Polar Form of Complex Numbers', url: 'https://openstax.org/books/precalculus-2e/pages/8-5-polar-form-of-complex-numbers' },
    { label: 'OpenStax Precalculus 2e, §3.1 Complex Numbers (plotting in the complex plane)', url: 'https://openstax.org/books/precalculus-2e/pages/3-1-complex-numbers' },
  ],
});
void D2R; void wrap180;
