// Cauchy's theorem: if f is analytic on and inside a closed contour, the
// arrows f·dz close up — ∮ f dz = 0. Proof by Green's theorem, where the two
// Cauchy–Riemann equations kill the two double integrals. The working form is
// deformation: a contour may be slid and bent freely as long as it crosses
// no singularity, and the integral does not change; crossing a pole changes
// it. Partial fractions then reduce rational integrands to ∮dz/(z − a) = 2πi.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { cTeX, num as nm, apart } from './_cx.js';
import { C, contour, integral, circle } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const pm = [{ x: 0, y: 1, label: 'i', kind: 'pole' }, { x: 0, y: -1, label: '−i', kind: 'pole' }];
const hex = (r, c = [0, 0]) => [0, 1, 2, 3, 4, 5].map((k) => [c[0] + r * Math.cos((k * PI) / 3 + 0.2), c[1] + r * Math.sin((k * PI) / 3 + 0.2)].map((v) => +v.toFixed(3)));

export default lesson({
  id: 'st-d.D6.1',
  title: 'Cauchy’s theorem',
  minutes: 14, difficulty: 3,
  intro: t`For $z^2$ round a circle, the little arrows $f\,dz$ curled up and their chain came home to $0$. That is no accident of circles. **Cauchy’s theorem**: if $f$ is analytic at every point on and inside a simple closed contour $\gamma$, then

$$\oint_\gamma f(z)\,dz = 0$$

The proof is Green’s theorem plus the Cauchy–Riemann equations. Its everyday use is **deformation**: two contours that can be slid into one another without crossing a singularity of $f$ give the **same** integral. So a messy contour can be swapped for a circle round each singularity — and round a single point $a$, $\oint dz/(z - a) = 2\pi i$ (D5.1). Crossing a singularity is the only thing that can change the answer.`,
  symbols: [
    { tex: t`\gamma`, text: t`a **simple** closed contour (it does not cross itself), traversed anticlockwise, so the region it encloses is on the left` },
    { tex: 'f', text: t`a function **analytic** (complex-differentiable) at every point on $\gamma$ and inside it` },
    { tex: t`\oint`, text: 'an integral round a closed path' },
  ],
  why: t`Cauchy’s theorem is why contour integrals depend only on the singularities a contour encloses — the root of the integral formula, Taylor and Laurent series, residues, and the causality arguments of physics.`,
  visual: {
    type: 'cx2-contour',
    title: 'Deform the contour',
    lead: t`A hexagonal contour you can reshape: drag any of its six corners. The readout shows the integral and how many times the contour winds round each singularity. Watch the end of the chain (gold ring) as you drag.`,
    tasks: [
      t`With $1/(z^2 + 1)$: stretch the hexagon a long way without touching $\pm i$ — the integral stays $0$. Now drag one corner up past $i$: the integral jumps to $\pi$. Pull another corner down past $-i$ too: back to $0$, as the two poles’ contributions cancel.`,
      t`With $e^z$ (no singularities anywhere), no reshaping changes the answer from $0$.`,
      t`With $1/z$: the integral is $2\pi i$ whatever the shape, so long as $0$ stays inside.`,
    ],
    params: {
      fns: [
        { f: '1/(z^2 + 1)', label: '$1/(z^2 + 1)$', marks: pm },
        { f: 'exp(z)', label: '$e^z$', marks: [] },
        { f: '1/z', label: '$1/z$', marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }] },
      ],
      contour: { kind: 'poly', pts: hex(0.75) }, drag: true, x: [-1.9, 1.9], y: [-1.9, 1.9], n: 24, readout: ['I', 'wind'],
    },
    caption: t`The arrows on the left are drawn longer than true, all by one factor; the chain is to scale, and its window rescales as you drag. If a side runs right through a pole the integral is not defined and the chain disappears.`,
  },
  example: {
    prompt: t`Prove Cauchy’s theorem for an analytic $f = u + iv$ whose partial derivatives are continuous, using [Green’s theorem](#/lesson/math2210.C3-5.4), $\oint_\gamma (P\,dx + Q\,dy) = \iint_D (Q_x - P_y)\,dA$, where $D$ is the region inside $\gamma$.`,
    visual: contour({ f: 'exp(z)*cos(z)', contour: { kind: 'rect', x: [-1.5, 1.2], y: [-1, 1.3] }, x: [-2, 2], y: [-2, 2], n: 28, readout: ['I'] }, t`The rectangle and the arrows of $e^z\cos z\,\Delta z$: their chain closes into a loop and ends where it began.`),
    steps: [
      { label: 'Split', text: t`$f\,dz = (u + iv)(dx + i\,dy) = (u\,dx - v\,dy) + i\,(v\,dx + u\,dy)$. So $\oint f\,dz$ is two real line integrals.` },
      { label: 'Green on the real part', text: t`With $P = u$, $Q = -v$: $\oint (u\,dx - v\,dy) = \iint_D (-v_x - u_y)\,dA$.` },
      { label: 'Green on the imaginary part', text: t`With $P = v$, $Q = u$: $\oint (v\,dx + u\,dy) = \iint_D (u_x - v_y)\,dA$.` },
      { label: 'Cauchy–Riemann', text: t`Analyticity means $u_x = v_y$ and $u_y = -v_x$ (D3.2). Both integrands are zero at every point of $D$, so both double integrals vanish: $\oint_\gamma f\,dz = 0$.` },
      { label: 'Where it fails', text: t`Every point of $D$ was used. One bad point inside — a pole — and the argument says nothing. (Goursat later removed the need for continuous partial derivatives; the theorem holds for every analytic $f$.)` },
    ],
    answer: t`$\oint_\gamma f\,dz = \iint_D(-v_x - u_y)\,dA + i\iint_D(u_x - v_y)\,dA = 0$ by the Cauchy–Riemann equations.`,
  },
  practice: [
    mcq({
      id: 'which-zero', difficulty: 2,
      prompt: t`Which integral round the unit circle $|z| = 1$ is zero **by Cauchy’s theorem**?`,
      visual: contour({ f: 'exp(z^2)', contour: circle(1), view: 'colour', x: [-1.6, 1.6], y: [-1.6, 1.6], panel: 'none', arrowsOn: false, marks: [{ x: 0.5, y: 0, label: '½', kind: 'point' }] }, t`The unit circle over the colour picture of $e^{z^2}$, smooth everywhere; the point $\tfrac12$ is marked for reference.`),
      choices: [t`$\oint e^{z^2}\,dz$`, t`$\oint \dfrac{dz}{2z - 1}$`, t`$\oint \bar z\,dz$`, t`$\oint \operatorname{Log} z\,dz$`],
      answer: 0,
      why: {
        1: t`$1/(2z - 1)$ has a pole at $z = \tfrac12$, inside the circle. The integral is $\pi i$.`,
        2: t`$\bar z$ is not analytic anywhere; its integral is $2\pi i$ (D5.1).`,
        3: t`The principal $\operatorname{Log}$ jumps across its cut on the negative real axis, which runs through the circle — it is not analytic there, and the integral is $-2\pi i$.`,
      },
      hints: [t`Cauchy needs $f$ analytic at **every** point on and inside the circle.`, t`Look for poles inside, branch cuts crossing, or non-analytic functions.`],
      teach: t`Cauchy’s theorem demands analyticity everywhere on and inside the contour — no poles, no cuts, no $\bar z$.`,
      explain: t`$e^{z^2}$ is entire (analytic everywhere), so its integral round any closed contour is $0$. The others fail the hypothesis — and in fact give $\pi i$, $2\pi i$ and $-2\pi i$.`,
    }),
    num({
      id: 'count-poles', difficulty: 2,
      gen(r) {
        const P = r.shuffle([r.pick([[[0.5, 0.3], 2], [[-0.4, -0.6], 3]]), ...r.shuffle([[[1.7, 0.2], 5], [[-0.3, 1.8], -1], [[0.8, -0.8], 4]]).slice(0, 2)]);
        const R = r.pick([1, 1.4]);
        const src = P.map(([p, c]) => `${c}/(z - (${p[0]}) - (${p[1]})*i)`).join(' + ');
        const ans = integral(src, circle(R))[1];
        const terms = P.map(([p, c], k) => `${k ? (c < 0 ? ' - ' : ' + ') : c < 0 ? '-' : ''}\\frac{${Math.abs(c)}}{z - (${cTeX(p)})}`).join('');
        return {
          prompt: t`Compute $\operatorname{Im}\oint_{|z| = ${R}} f(z)\,dz$, once anticlockwise, where

$$f(z) = ${terms}$$

(3 significant figures.)`,
          visual: contour({ f: src, contour: circle(R), marks: P.map(([p], k) => ({ x: p[0], y: p[1], label: ['P', 'Q', 'S'][k], kind: 'pole' })), x: [-2.2, 2.2], y: [-2.2, 2.2], panel: 'none', arrowsOn: false }, t`The circle $|z| = ${R}$ and the three poles, labelled in the order of the terms.`),
          answer: ans, tol: { rel: 0.005, abs: 0.01 },
          errors: apart(ans, [{ value: 2 * PI * P.reduce((s, [, c]) => s + c, 0), feedback: 'A pole outside the circle contributes nothing: Cauchy’s theorem applies to its term.' }]),
          hints: [t`Each term $\frac{c}{z - a}$ gives $2\pi i\,c$ if $a$ is inside the circle (deform to a small circle round $a$), and $0$ if $a$ is outside (Cauchy).`, t`Check $|a| < ${R}$ for each pole.`],
          teach: t`Round any contour, $\oint \frac{c\,dz}{z - a}$ is $2\pi i\,c$ if $a$ is inside and $0$ if it is outside.`,
          explain: t`Inside: ${P.filter(([p]) => C.abs(p) < R).map(([p, c]) => `$${cTeX(p)}$ (coefficient $${c}$)`).join(', ') || 'none'}. So $\oint = 2\pi i\times${nm(ans / (2 * PI), 3)}$, imaginary part $${nm(ans, 4)}$.`,
        };
      },
    }),
    order({
      id: 'green-order', difficulty: 3,
      prompt: t`Put the steps of the Green’s-theorem proof of Cauchy’s theorem in order.`,
      visual: contour({ f: 'z^3 - 2z', contour: { kind: 'rect', x: [-1.2, 1.4], y: [-0.9, 1.1] }, x: [-1.8, 1.8], y: [-1.6, 1.6], n: 24 }, t`An analytic integrand round a rectangle: its chain of arrows closes up.`),
      items: [
        t`Write $f\,dz = (u\,dx - v\,dy) + i(v\,dx + u\,dy)$`,
        t`Apply Green’s theorem to each real line integral`,
        t`Get $\iint(-v_x - u_y)\,dA + i\iint(u_x - v_y)\,dA$`,
        t`Use Cauchy–Riemann: both integrands vanish`,
        t`Conclude $\oint f\,dz = 0$`,
      ],
      hints: ['Start by splitting into real and imaginary parts.', 'The analyticity enters only at the end, through the Cauchy–Riemann equations.'],
      teach: 'Cauchy’s theorem is Green’s theorem with the Cauchy–Riemann equations making the curl-like integrands vanish.',
      explain: t`Split, apply Green twice, then each double integral has the integrand $-(v_x + u_y)$ or $u_x - v_y$, which the Cauchy–Riemann equations make identically zero.`,
    }),
    num({
      id: 'partial-fractions', difficulty: 3,
      gen(r) {
        const b = r.pick([2, 3, -2]), enclose = r.pick(['b', '0']);
        const spec = enclose === 'b' ? { kind: 'rect', x: [b - 1, b + 1], y: [-1, 1] } : { kind: 'rect', x: [-1, 1], y: [-1, 1] };
        const ans = integral(`1/(z*(z - (${b})))`, spec)[1];
        return {
          prompt: t`Let $\gamma$ be the square with corners $${cTeX([spec.x[0], -1])}$ and $${cTeX([spec.x[1], 1])}$ (sides parallel to the axes), anticlockwise. Find $\operatorname{Im}\displaystyle\oint_\gamma \frac{dz}{z(z ${b < 0 ? '+' : '-'} ${Math.abs(b)})}$. (3 significant figures.)`,
          visual: contour({ f: `1/(z*(z - (${b})))`, contour: spec, marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }, { x: b, y: 0, label: String(b).replace('-', '−'), kind: 'pole' }], x: [Math.min(0, b) - 1.6, Math.max(0, b) + 1.6], y: [-1.8, 1.8], panel: 'none', arrowsOn: false }, t`The square and the two poles of the integrand.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: t`Check the partial fractions: $\frac{1}{z(z - b)} = \frac{1}{b}\left(\frac{1}{z - b} - \frac{1}{z}\right)$.` }, { value: 2 * PI, feedback: t`The coefficient of the enclosed term is $\pm\frac{1}{${b}}$, not $1$.` }]),
          hints: [t`Partial fractions: $\dfrac{1}{z(z - b)} = \dfrac{1}{b}\left(\dfrac{1}{z - b} - \dfrac{1}{z}\right)$ with $b = ${b}$.`, t`Only the term whose pole is inside the square contributes $2\pi i\times$(its coefficient).`],
          teach: t`Partial fractions plus deformation: each simple pole $a$ inside contributes $2\pi i$ times the coefficient of $\frac{1}{z - a}$.`,
          explain: t`The square encloses only $z = ${enclose === 'b' ? b : 0}$, whose term has coefficient $${enclose === 'b' ? '' : '-'}\frac{1}{${b}}$. So $\oint = 2\pi i\times(${nm(ans / (2 * PI), 3)})$, imaginary part $${nm(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'defined-everywhere', difficulty: 2, kind: 'error',
      prompt: t`A student argues: “$1/z$ is complex-differentiable at every point where it is defined, so by Cauchy’s theorem $\oint_{|z| = 1} dz/z = 0$.” What is wrong?`,
      visual: contour({ f: '1/z', contour: circle(1), marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }], x: [-1.6, 1.6], y: [-1.6, 1.6], n: 16, readout: ['I'] }, t`The chain for $1/z$ does not close: it climbs to $2\pi i$.`),
      choices: [
        t`Cauchy needs $f$ analytic at every point **inside** the contour too, and $1/z$ is not defined at $0$, which is inside`,
        t`$1/z$ is not complex-differentiable anywhere`,
        t`Cauchy’s theorem only holds for polynomials`,
        t`Nothing: the integral really is $0$`,
      ],
      answer: 0,
      why: {
        1: t`$1/z$ has derivative $-1/z^2$ at every $z \ne 0$.`,
        2: t`It holds for every analytic $f$: $e^z$, $\cos z$, $1/(z - 5)$ inside $|z| = 1$, …`,
        3: t`Parametrise: $dz/z = i\,d\theta$, which adds up to $2\pi i$.`,
      },
      hints: ['Re-read the hypothesis: “on and inside”.', 'Is there a point inside the unit circle where 1/z fails to exist?'],
      teach: t`“Analytic wherever defined” is not enough: the region inside the contour must contain no singularity at all.`,
      explain: t`The hole at $0$ is exactly what Green’s theorem cannot see past — the double integral would need the integrand at $0$. Deform the unit circle into a tiny one round $0$ and the integral stays $2\pi i$ however small it gets.`,
    }),
    num({
      id: 'zbar-area', difficulty: 3,
      gen(r) {
        const pts = r.pick([[[0, 0], [2, 0], [1, 1.5]], [[0, 0], [3, 0], [0, 2]], [[-1, -1], [2, -1], [0.5, 1]], [[0, 0], [2, 0], [2, 2], [0, 2]]]);
        const ans = integral('conj(z)', { kind: 'poly', pts })[1];
        const desc = pts.map((p) => `$${cTeX(p)}$`).join(', ');
        return {
          prompt: t`Find $\operatorname{Im}\displaystyle\oint_\gamma \bar z\,dz$ round the polygon with corners ${desc}, in that order. (Hint: Green’s theorem, not parametrisation.)`,
          visual: contour({ f: 'conj(z)', contour: { kind: 'poly', pts }, x: [-1.6, 3.4], y: [-1.6, 2.6], n: 20, panel: 'none' }, t`The polygon, anticlockwise, with the arrows $\bar z\,\Delta z$ (drawn larger than true).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: ans / 2, feedback: t`That is the area. The integral is $2i$ times the area.` }]),
          hints: [t`$\bar z\,dz = (x - iy)(dx + i\,dy) = (x\,dx + y\,dy) + i(x\,dy - y\,dx)$.`, t`By Green, $\oint (x\,dy - y\,dx) = \iint 2\,dA = 2\times$area, and $\oint (x\,dx + y\,dy) = 0$.`],
          teach: t`For the non-analytic $\bar z$, Green’s theorem leaves $\oint \bar z\,dz = 2i\times$(enclosed area) — Cauchy fails because Cauchy–Riemann does.`,
          explain: t`The area is $${nm(ans / 2, 4)}$, so $\oint \bar z\,dz = ${nm(ans, 4)}i$. Here $u = x$, $v = -y$: $u_x - v_y = 2 \ne 0$, and that $2$ is what survives in the double integral.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-root-pair', difficulty: 3,
      gen(r) {
        const b = r.pick([1, 2]), side = r.sign(), rad = r.pick([0.8, 1]);
        const c = [side * b, r.pick([0, 0.3])];
        const ans = integral(`1/(z^2 - ${b * b})`, circle(rad, c))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|${c[1] === 0 ? `z ${side > 0 ? '-' : '+'} ${b}` : `z - (${cTeX(c)})`}| = ${rad}} \frac{dz}{z^2 - ${b * b}}$. (3 significant figures.)`,
          visual: contour({ f: `1/(z^2 - ${b * b})`, contour: circle(rad, c), marks: [{ x: b, y: 0, label: String(b), kind: 'pole' }, { x: -b, y: 0, label: `−${b}`, kind: 'pole' }], x: [-b - 1.5, b + 1.5], y: [-1.6, 1.6], panel: 'none', arrowsOn: false }, t`The circle and the two poles $\pm${b}$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: t`$\frac{1}{z^2 - b^2} = \frac{1}{2b}\left(\frac{1}{z - b} - \frac{1}{z + b}\right)$: check which sign the enclosed term carries.` }, { value: 2 * PI, feedback: t`The enclosed term’s coefficient is $\pm\frac{1}{${2 * b}}$.` }]),
          hints: [t`$\dfrac{1}{z^2 - ${b * b}} = \dfrac{1}{${2 * b}}\left(\dfrac{1}{z - ${b}} - \dfrac{1}{z + ${b}}\right)$.`, t`Only the pole at $${side * b}$ is inside.`],
          teach: t`Deformation plus partial fractions: only enclosed poles count, each with $2\pi i$ times its coefficient.`,
          explain: t`The circle encloses $z = ${side * b}$, whose term has coefficient $${side > 0 ? '' : '-'}\frac{1}{${2 * b}}$: $\oint = ${side > 0 ? '' : '-'}\frac{2\pi i}{${2 * b}}$, imaginary part $${nm(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-same', difficulty: 2,
      prompt: t`The integrand $f(z) = \dfrac{e^z}{z(z - 3)}$ has poles at $0$ and $3$. Which contour gives the same integral as the unit circle $|z| = 1$?`,
      visual: contour({ f: 'exp(z)/(z*(z - 3))', contour: circle(1), marks: [{ x: 0, y: 0, label: '0', kind: 'pole' }, { x: 3, y: 0, label: '3', kind: 'pole' }], circles: [{ c: [0, 0], r: 2, color: 'ink3' }], x: [-2.4, 4.4], y: [-2.4, 2.4], panel: 'none', arrowsOn: false }, t`The unit circle (violet), a dashed circle of radius 2 for scale, and the two poles.`),
      choices: [t`The square with corners $\pm2 \pm 2i$`, t`The circle $|z| = 4$`, t`The circle $|z - 3| = 1$`, t`The circle $|z - 1| = \tfrac12$`],
      answer: 0,
      why: {
        1: t`$|z| = 4$ encloses the pole at $3$ as well, which adds its own contribution.`,
        2: t`That encloses only the pole at $3$, not the one at $0$.`,
        3: t`That encloses no pole at all, so its integral is $0$ — but the unit circle’s is not.`,
      },
      hints: ['Two contours give the same integral when one can be slid into the other without crossing a pole.', 'Which contour encloses exactly the pole at 0?'],
      teach: 'A contour integral depends only on which singularities the contour encloses (and how many times it winds round them).',
      explain: t`The square $|x|, |y| \le 2$ encloses $0$ but not $3$ — the same set as the unit circle — so the two can be deformed into each other through a region where $f$ is analytic.`,
    }),
    mcq({
      id: 'cp-causal', difficulty: 3, transfer: true,
      prompt: t`An accelerometer’s proof mass responds to a force at angular frequency $\omega$ through $\chi(\omega) = \dfrac{1}{\omega_0^2 - \omega^2 - i\gamma\omega}$. Treat $\omega$ as complex: the poles are at $\omega = \pm\sqrt{\omega_0^2 - \gamma^2/4} - i\gamma/2$, in the **lower** half-plane (damping $\gamma > 0$). Which statement follows from Cauchy’s theorem?`,
      visual: contour({ f: '1/(1 - z^2 - 0.4i z)', contour: { kind: 'rect', x: [-2, 2], y: [0.1, 1.6] }, view: 'colour', marks: [{ x: 0.98, y: -0.2, label: 'pole', kind: 'pole' }, { x: -0.98, y: -0.2, label: 'pole', kind: 'pole' }], x: [-2.4, 2.4], y: [-1.6, 1.8], panel: 'none', arrowsOn: false, zname: 'ω-plane' }, t`The complex $\omega$-plane coloured by $\chi$ (with $\omega_0 = 1$, $\gamma = 0.4$), its two poles just below the real axis, and a loop drawn in the upper half-plane.`),
      choices: [
        t`$\oint \chi(\omega)\,d\omega = 0$ round every closed loop in the upper half-plane`,
        t`$\oint \chi(\omega)\,d\omega = 0$ round every closed loop in the plane`,
        t`$\chi$ has no singularities anywhere, so it is constant`,
        t`$\oint \chi\,d\omega = 0$ only round loops that enclose both poles`,
      ],
      answer: 0,
      why: {
        1: t`A loop round a pole in the lower half-plane gives $2\pi i$ times that pole’s coefficient, not $0$.`,
        2: t`It has two poles — they are just below the real axis.`,
        3: t`A loop round both poles gives the sum of their two contributions; for this $\chi$ they happen to cancel, but that is a coincidence of this particular function (it falls off like $1/\omega^2$), not Cauchy’s theorem.`,
      },
      hints: [t`Cauchy’s theorem needs no singularities on or inside the loop.`, t`Where are the poles? Where can a loop be drawn that avoids enclosing them?`],
      teach: t`A causal response has its poles in the lower half-plane, so it is analytic in the whole upper half-plane: every loop there integrates to zero.`,
      explain: t`All of $\chi$’s poles lie below the axis, so $\chi$ is analytic throughout the upper half-plane, and Cauchy’s theorem kills every loop drawn there. This is the seed of the **Kramers–Kronig relations** (D11): a causal system — one that cannot respond before it is pushed — has its poles in the lower half-plane, and that alone ties the real and imaginary parts of its response together.`,
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 8 (Cauchy’s theorem)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §§50–53 (Cauchy–Goursat)', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
