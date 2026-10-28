// The ML inequality: |∫γ f dz| ≤ M·L, where L is the length of the path and
// M the largest |f| on it. Geometrically: the chain of arrows f·Δz cannot
// reach further from 0 than its total length, Σ|f||Δz| ≤ M·L — and it is
// shorter whenever the arrows turn. The reverse triangle inequality
// |z² + a²| ≥ |z|² − a² gives M without finding a maximum. The payoff is the
// big-arc estimate that D9 uses: on a semicircle of radius R,
// |∫ dz/(z² + 1)| ≤ πR/(R² − 1) → 0.
import { lesson, mcq, num } from '../../src/core/content.js';
import { cTeX, num as nm, argand, apart } from './_cx.js';
import { C, contour, integral, circle } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const poles = [{ x: 0, y: 1, label: 'i', kind: 'pole' }, { x: 0, y: -1, label: '−i', kind: 'pole' }];
const halfArc = (R) => ({ kind: 'arc', c: [0, 0], r: R, from: 0, to: PI });

export default lesson({
  id: 'st-d.D5.2',
  title: 'Estimating integrals: the ML inequality',
  minutes: 11, difficulty: 3,
  intro: t`Often you do not need a contour integral’s value — only proof that it is **small**. Picture the chain of little arrows $f(z_k)\Delta z_k$ from the last lesson. Each arrow is at most $M|\Delta z_k|$ long, where $M$ is the largest $|f|$ on the path, and the lengths $|\Delta z_k|$ add up to the path’s length $L$. A chain of total length $ML$ cannot end further than $ML$ from where it started:

$$\left|\int_\gamma f(z)\,dz\right| \;\le\; \int_\gamma |f(z)|\,|dz| \;\le\; M L$$

Equality would need every arrow to point the same way. Usually they turn, and the true value is much smaller — but the bound is enough to show that an integral **vanishes** in a limit, which is how the residue method of D9 disposes of big arcs.`,
  symbols: [
    { tex: t`\gamma`, text: 'the path of integration' },
    { tex: 'L', text: t`the length of $\gamma$, $\int_\gamma |dz| = \int_a^b |z'(t)|\,dt$` },
    { tex: 'M', text: t`an upper bound for $|f(z)|$ at every point of $\gamma$ — the maximum itself, or anything larger that is easier to find` },
    { tex: t`|dz|`, text: t`the length of an infinitesimal piece of the path (arc length), as opposed to the arrow $dz$` },
  ],
  why: t`The ML bound is what lets a contour be closed by a huge arc “for free”, which turns real integrals, inverse Laplace transforms and the response of causal systems into sums over poles.`,
  visual: {
    type: 'cx2-contour',
    title: 'How long can the chain be?',
    lead: t`A semicircular arc of radius $R$ above the poles $\pm i$, with its arrows. The readout gives the integral, the length $L$, the largest $|f|$ on the arc ($M$, marked in gold) and the bound $ML$. Pull $R$ up and compare the two integrands.`,
    tasks: [
      t`For $1/(z^2 + 1)$, raise $R$ from $1.2$ to $5$: $ML$ falls from about $8.6$ to $0.65$, and the integral (always smaller) falls with it. $M$ shrinks like $1/R^2$ while $L$ grows only like $R$.`,
      t`For $z/(z^2 + 1)$, $M$ shrinks only like $1/R$, so $ML$ levels off near $\pi$ — and the integral is stuck at exactly $\pi i$. A bound that does not shrink proves nothing.`,
      t`Compare the chain’s straight-line reach with $ML$: at $R = 1.2$ the arrows turn a lot and $|\!\int\!| \approx 1.39$, far below $ML \approx 8.6$.`,
    ],
    params: {
      fns: [{ f: '1/(z^2 + 1)', label: '$1/(z^2 + 1)$', marks: poles }, { f: 'z/(z^2 + 1)', label: '$z/(z^2 + 1)$', marks: poles }],
      sliders: [{ key: 'R', label: 'arc radius $R$', min: 1.2, max: 5, step: 0.05, value: 2, explain: t`The radius of the semicircle $|z| = R$, $\operatorname{Im} z \ge 0$, walked from $R$ to $-R$.` }],
      contour: { kind: 'arc', c: [0, 0], r: 'R', from: 0, to: PI }, x: [-5.4, 5.4], y: [-1.6, 5.6],
      n: 16, readout: ['I', 'L', 'M', 'ML'],
    },
    caption: t`The arrows on the arc are drawn longer than true, all by one factor; the chain on the right is to scale, and its window rescales as $R$ changes — read the axis numbers. $M$ is found by sampling the arc finely.`,
  },
  example: {
    prompt: t`Bound $\left|\displaystyle\int_{C_R} \frac{dz}{z^2 + 1}\right|$ on the upper semicircle $C_R$ of radius $R = 3$, and show that the bound tends to zero as $R \to \infty$.`,
    visual: contour({ f: '1/(z^2 + 1)', contour: halfArc(3), marks: poles, x: [-3.6, 3.6], y: [-1.4, 3.6], n: 20, readout: ['I', 'ML'] }, t`The arc of radius 3 and its chain: the arrows turn, so the chain reaches only $0.64$, while the bound allows $1.18$.`),
    steps: [
      { label: 'Length', text: t`Half of a circle of radius 3: $L = \pi R = 3\pi \approx 9.42$.` },
      { label: 'Bound the size', text: t`On the arc $|z| = 3$. The **reverse triangle inequality** $|a + b| \ge |a| - |b|$ gives $|z^2 + 1| \ge |z|^2 - 1 = 8$, so $\left|\dfrac{1}{z^2 + 1}\right| \le \dfrac18 = M$. (No maximisation needed; here it is even the true maximum, reached at $z = 3i$.)` },
      { label: 'Multiply', text: t`$\left|\int_{C_3}\right| \le ML = \dfrac{3\pi}{8} \approx 1.18$. The true value, by quadrature, is $${nm(C.abs(integral('1/(z^2 + 1)', halfArc(3))), 3)}$: the bound is honest but not tight.` },
      { label: 'Large R', text: t`For any $R > 1$: $M = \dfrac{1}{R^2 - 1}$ and $L = \pi R$, so the bound is $\dfrac{\pi R}{R^2 - 1} \to 0$ as $R \to \infty$ — it falls like $\pi/R$.` },
      { label: 'Why care', text: t`Close the real segment $[-R, R]$ with this arc: the arc’s share vanishes as $R$ grows, so a real integral equals a closed contour integral. That is the whole trick of D9.` },
    ],
    answer: t`$|\!\int_{C_3}| \le 3\pi/8 \approx 1.18$; in general $\le \pi R/(R^2 - 1) \to 0$.`,
  },
  practice: [
    num({
      id: 'length', difficulty: 1,
      gen(r) {
        const R = r.pick([1, 2, 3, 4, 5]);
        const ans = PI * R + 2 * R;
        return {
          prompt: t`What is the length $L$ of the closed contour made of the segment from $-${R}$ to $${R}$ and the upper semicircle $|z| = ${R}$ back to $-${R}$?`,
          visual: argand({ view: R * 0.75 + 0.6, center: [0, R * 0.45], curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, PI], color: 'violet', width: 2.6 }, { param: ['t', '0'], t: [-R, R], color: 'violet', width: 2.6 }], pts: [{ z: [R, 0], label: String(R), color: 'ink2' }, { z: [-R, 0], label: `−${R}`, color: 'ink2' }], caption: t`The D-shaped contour: a diameter and a half-circle.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: PI * R, feedback: 'You have the arc; add the straight segment, 2R long.' }, { value: 2 * PI * R + 2 * R, feedback: 'The arc is half a circle: πR, not 2πR.' }]),
          hints: ['A half circle of radius R is πR long.', 'Add the diameter, 2R.'],
          teach: 'L is ordinary arc length: add the lengths of the pieces.',
          explain: t`$L = \pi(${R}) + 2(${R}) = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'reverse-tri', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), R = r.pick([4, 5, 6, 8]);
        const ans = 1 / (R * R - a * a);
        const f = `1/(z^2 + ${a * a})`;
        return {
          prompt: t`On the circle $|z| = ${R}$, use the reverse triangle inequality to find a bound $M$ with $\left|\dfrac{1}{z^2 + ${a * a}}\right| \le M$. (3 significant figures.)`,
          visual: contour({ f, contour: circle(R), marks: [{ x: 0, y: a, label: `${a}i`, kind: 'pole' }, { x: 0, y: -a, label: `−${a}i`, kind: 'pole' }], view: 'colour', x: [-R - 1, R + 1], y: [-R - 1, R + 1], panel: 'none', arrowsOn: false }, t`The circle $|z| = ${R}$ over the colour picture of $1/(z^2 + ${a * a})$ (hue = argument, brighter bands where the size doubles): the poles at $\pm${a}i$ sit well inside.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 1 / (R * R + a * a), feedback: t`That is the **smallest** value of $|f|$ on the circle (where $z^2$ and $${a * a}$ add). The bound needs the largest: $|z^2 + ${a * a}| \ge |z|^2 - ${a * a}$.` }, { value: 1 / (R - a * a), feedback: t`Square the radius: $|z^2| = |z|^2 = ${R * R}$.` }]),
          hints: [t`$|z^2 + ${a * a}| \ge |z^2| - ${a * a} = ${R}^2 - ${a * a}$.`, t`A bigger denominator means a smaller fraction, so $\left|\dfrac{1}{z^2 + ${a * a}}\right| \le \dfrac{1}{${R * R - a * a}}$.`],
          teach: t`To bound $|1/g|$ from above, bound $|g|$ from below: $|a + b| \ge |a| - |b|$.`,
          explain: t`$M = 1/(${R * R} - ${a * a}) = ${nm(ans, 3)}$. It is the true maximum here, reached at $z = \pm${R}i$, where $z^2 = -${R * R}$ cancels as much of $${a * a}$ as it can.`,
        };
      },
    }),
    num({
      id: 'ml-exp', difficulty: 2,
      gen(r) {
        const w = r.pick([[1, 1], [1, 2], [2, 1], [0.5, 1], [1, -1]]);
        const L = Math.hypot(w[0], w[1]), M = Math.exp(w[0]), ans = M * L;
        const spec = { kind: 'segment', from: [0, 0], to: w };
        return {
          prompt: t`Use the ML inequality to bound $\left|\displaystyle\int_\gamma e^z\,dz\right|$, where $\gamma$ is the straight segment from $0$ to $${cTeX(w)}$. (3 significant figures.)`,
          visual: contour({ f: 'exp(z)', contour: spec, x: [-0.6, 2.6], y: [-1.6, 2.4], n: 10, panel: 'none', arrowsOn: 'f', readout: false }, t`The segment with arrows of $e^z$ along it (to one scale): $|e^z| = e^x$ grows to the right.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: L, feedback: t`You took $M = 1$, the value at $0$. $|e^z| = e^{x}$ is largest at the right-hand end.` }, { value: Math.exp(L) * L, feedback: t`$|e^z| = e^{\operatorname{Re} z}$, not $e^{|z|}$.` }]),
          hints: [t`$L = |${cTeX(w)}| = ${nm(L, 4)}$.`, t`$|e^{x + iy}| = e^x$, largest where $x$ is largest: $x = ${w[0]}$.`],
          teach: t`For $e^z$, the size is $e^{\operatorname{Re} z}$: $M$ is $e$ to the largest real part on the path.`,
          explain: t`$ML = e^{${w[0]}}\times${nm(L, 4)} = ${nm(ans, 4)}$. The true value is $|e^{w} - 1| = ${nm(C.abs(C.sub(C.cexp(w), [1, 0])), 4)}$ — below the bound, as it must be.`,
        };
      },
    }),
    mcq({
      id: 'not-equal', difficulty: 2,
      prompt: t`The picture shows $\oint z^2\,dz$ round a circle of radius $1.5$: $L = 3\pi$, $M = 2.25$, so $ML \approx 21$ — yet the integral is $0$. Which statement is right?`,
      visual: contour({ f: 'z^2', contour: circle(1.5), x: [-2, 2], y: [-2, 2], n: 24, wx: [-6, 6], wy: [-6, 6] }, t`The arrows $z^2\Delta z$ turn three times round as $z$ goes once round, and the chain closes into a loop back at $0$.`),
      choices: [
        t`$ML$ only bounds the chain’s total length; the arrows turn and cancel, so the end point can be much nearer $0$`,
        t`$|\int f\,dz| = ML$ always; the picture must be wrong`,
        t`ML applies only to open paths, not closed ones`,
        t`The bound fails because $z^2$ is analytic`,
      ],
      answer: 0,
      why: {
        1: t`Equality needs every arrow pointing the same way. Here they point every way.`,
        2: t`Nothing in the argument cares whether the path closes: the chain’s reach is at most its length either way.`,
        3: t`The bound holds for every continuous $f$, analytic or not — it just may be far from the truth.`,
      },
      hints: [t`The chain on the right has total length $\sum|f\,\Delta z|$. How far from $0$ can its end be?`, t`What happens to the end point when the arrows turn round?`],
      teach: t`$ML$ is an upper bound, met only when all the arrows point one way; turning arrows make the true value smaller.`,
      explain: t`The chain is about $\int|f||dz| = 2.25\times3\pi \approx 21$ long, but it curls round and ends at $0$. The ML inequality says only that the end is within $21$ of the start — true, and useless here. It earns its keep when the bound itself goes to $0$.`,
    }),
    mcq({
      id: 'which-vanish', difficulty: 3,
      prompt: t`On the upper semicircle $C_R$ (radius $R$, centre $0$), for which integrand does the ML inequality prove $\int_{C_R} f\,dz \to 0$ as $R \to \infty$?`,
      visual: contour({ f: '1/(z^2 + 1)', contour: halfArc(4), marks: poles, x: [-4.6, 4.6], y: [-1.4, 4.6], n: 18, panel: 'none', arrowsOn: false }, t`A large semicircle $C_R$ above the real axis (here $R = 4$).`),
      choices: [t`$\dfrac{1}{z^2 + 1}$`, t`$\dfrac{z}{z^2 + 1}$`, t`$\dfrac{1}{z}$`, t`$\dfrac{e^{z}}{z^2 + 1}$`],
      answer: 0,
      why: {
        1: t`$M \approx 1/R$ and $L = \pi R$: $ML \to \pi$, which does not vanish — and in fact the integral is exactly $\pi i$ for every $R > 1$.`,
        2: t`$\int_{C_R} dz/z = i\pi$ exactly (half a turn of $dz/z = i\,d\theta$), for every $R$.`,
        3: t`On the arc $|e^z| = e^{R\cos\theta}$ reaches $e^R$ at $z = R$: $M$ explodes, and so does the bound.`,
      },
      hints: [t`$L = \pi R$ grows like $R$, so you need $M$ to shrink faster than $1/R$.`, t`Estimate $M$ for each: about $1/R^2$, $1/R$, $1/R$, and $e^R/R^2$.`],
      teach: t`On an arc of length $\pi R$, ML proves vanishing when $|f|$ falls faster than $1/R$ — for example like $1/R^2$.`,
      explain: t`For $1/(z^2 + 1)$: $ML \le \pi R/(R^2 - 1) \to 0$. The rule of thumb for a rational function: the denominator’s degree must beat the numerator’s by at least 2.`,
    }),
    num({
      id: 'how-big-R', difficulty: 3,
      gen(r) {
        const eps = r.pick([0.5, 0.2, 0.1, 0.05]);
        const k = PI / eps, ans = (k + Math.sqrt(k * k + 4)) / 2;
        return {
          prompt: t`The ML bound for $\int_{C_R} \frac{dz}{z^2 + 1}$ on the upper semicircle is $B(R) = \dfrac{\pi R}{R^2 - 1}$. Above what radius $R$ is $B(R) < ${eps}$? (3 significant figures.)`,
          visual: contour({ f: '1/(z^2 + 1)', contour: halfArc(2.5), marks: poles, x: [-3, 3], y: [-1.4, 3], n: 18, panel: 'none' }, t`A semicircle (here $R = 2.5$) with its arrows, drawn larger than true. As $R$ grows the arc lengthens but the arrows shrink faster.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: PI / eps, feedback: t`That drops the $-1$ in $R^2 - 1$ (a fair estimate for large $R$, but solve the quadratic for the exact crossing).` }]),
          hints: [t`Solve $\pi R = ${eps}(R^2 - 1)$, a quadratic in $R$.`, t`$R^2 - ${nm(k, 4)}R - 1 = 0$; take the positive root.`],
          teach: t`The ML bound for a big arc falls roughly like $\pi/R$: halving the target needs roughly twice the radius.`,
          explain: t`$R = \tfrac12\big(${nm(k, 4)} + \sqrt{${nm(k, 4)}^2 + 4}\big) = ${nm(ans, 4)}$. Close to $\pi/${eps} = ${nm(k, 4)}$, as $B(R) \approx \pi/R$ for large $R$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-circle-pole', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 1.5, 2]), a = r.pick([3, 4, 5]);
        const ans = (2 * PI * R) / (a - R);
        return {
          prompt: t`Bound $\left|\displaystyle\oint_{|z| = ${R}} \frac{dz}{z - ${a}}\right|$ with the ML inequality. (3 significant figures.)`,
          visual: contour({ f: `1/(z - ${a})`, contour: circle(R), marks: [{ x: a, y: 0, label: String(a), kind: 'pole' }], x: [-2.6, 5.6], y: [-2.6, 2.6], n: 20, panel: 'none' }, t`The circle and the pole at $${a}$ outside it. Arrows drawn larger than true.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: (2 * PI * R) / (a + R), feedback: t`That uses the farthest point. $M$ must be the largest $|f|$: at the point of the circle **nearest** the pole, distance $${a} - ${R}$.` }, { value: (2 * PI * R) / a, feedback: t`$|z - ${a}|$ is not $${a}$ everywhere: on the circle it can be as small as $${a} - ${R}$.` }]),
          hints: [t`$L = 2\pi(${R})$.`, t`$|z - ${a}| \ge ${a} - |z| = ${a - R}$, so $M = 1/${a - R}$.`],
          teach: t`Near a pole, $M$ is set by the closest approach of the path to it.`,
          explain: t`$ML = 2\pi(${R})/${a - R} = ${nm(ans, 4)}$. (The true value is $0$ — the pole is outside, and the next lesson shows why. A bound is only a bound.)`,
        };
      },
    }),
    num({
      id: 'cp-top-side', difficulty: 3,
      gen(r) {
        const A = r.pick([2, 5, 10]), h = r.pick([2, 3, 4]);
        const ans = 2 * A * Math.exp(-h);
        const spec = { kind: 'segment', from: [A, h], to: [-A, h] };
        return {
          prompt: t`Bound $\left|\displaystyle\int_\gamma e^{iz}\,dz\right|$ along the horizontal segment from $${A} + ${h}i$ to $-${A} + ${h}i$. (3 significant figures.)`,
          visual: contour({ f: 'exp(i z)', contour: spec, x: [-A - 1, A + 1], y: [-1, h + 1.5], n: 12, panel: 'none', arrowsOn: 'f' }, t`The segment at height $${h}$ with arrows of $e^{iz}$ (drawn larger than true, to one scale): every one has the same length.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * A, feedback: t`$|e^{iz}|$ is not 1 off the real axis: $|e^{i(x + iy)}| = e^{-y}$.` }, { value: 2 * A * Math.exp(h), feedback: t`$e^{i(x + iy)} = e^{-y}e^{ix}$: the size is $e^{-y}$, which is small above the axis.` }]),
          hints: [t`$e^{i(x + iy)} = e^{-y}e^{ix}$, so $|e^{iz}| = e^{-y}$.`, t`On the segment $y = ${h}$ throughout, and $L = ${2 * A}$.`],
          teach: t`$|e^{iz}| = e^{-\operatorname{Im} z}$: it decays exponentially into the upper half-plane.`,
          explain: t`$ML = ${2 * A}e^{-${h}} = ${nm(ans, 4)}$. This exponential decay above the axis is why integrals with $e^{ikx}$ are closed in the upper half-plane (D9, Jordan’s lemma).`,
        };
      },
    }),
    num({
      id: 'cp-bromwich', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([1, 2, 5]), R = r.pick([20, 50, 100]);
        const ans = (PI * R) / (R - a) ** 2;
        return {
          prompt: t`A pitch-rate filter in a flight computer has transfer function $H(s) = \dfrac{1}{(s + ${a})^2}$, with $s$ in $\text{s}^{-1}$. To get its time response one integrates $H(s)e^{st}$ round a contour closed by the left half of the circle $|s| = ${R}\ \text{s}^{-1}$. For $t > 0$, $|e^{st}| \le 1$ on that arc (where $\operatorname{Re} s \le 0$). Bound the arc’s contribution $\left|\int_{\text{arc}} H(s)e^{st}\,ds\right|$, in seconds. (3 significant figures.)`,
          visual: contour({ f: `1/(z + ${a})^2`, contour: { kind: 'arc', c: [0, 0], r: R, from: PI / 2, to: 1.5 * PI }, marks: [{ x: -a, y: 0, label: `−${a}`, kind: 'pole' }], x: [-1.25 * R, 0.4 * R], y: [-1.15 * R, 1.15 * R], n: 16, panel: 'none', arrowsOn: false, zname: 's-plane' }, t`The $s$-plane: the left half of the circle $|s| = ${R}$, and the filter’s double pole at $s = -${a}$. The rest of the contour, a vertical line to the right of the pole, is not drawn.`),
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: apart(ans, [{ value: (2 * PI * R) / (R - a) ** 2, feedback: t`The arc is half a circle: $L = \pi R$.` }, { value: (PI * R) / (R * R), feedback: t`On the arc $|s + ${a}| \ge R - ${a}$, not $R$: some points are closer to the pole.` }]),
          hints: [t`$L = \pi(${R}) \ \text{s}^{-1}$; for $M$, bound $|H(s)e^{st}| \le |H(s)|$.`, t`$|s + ${a}| \ge |s| - ${a} = ${R - a}$, so $|H| \le 1/${R - a}^2$.`],
          teach: t`For $t > 0$ the factor $e^{st}$ is at most 1 in the left half-plane, so a transfer function falling like $1/|s|^2$ makes the big left arc negligible.`,
          explain: t`$ML = \pi(${R})/${R - a}^2 = ${nm(ans, 3)}$ s, and it shrinks like $\pi/R$ as the arc grows. So only the pole inside counts: the response is a residue at $s = -${a}$ — in this case $te^{-${a}t}$, the critically damped answer you could check by hand. (A model filter: real ones have more poles, but the same argument applies.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), §47 (upper bounds for moduli of contour integrals)', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 8', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
  ],
});
