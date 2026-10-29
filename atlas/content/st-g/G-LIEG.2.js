// The four pieces of the Lorentz group. From ΛᵀηΛ = η: det Λ = ±1 and
// (Λ⁰₀)² = 1 + Σ(Λⁱ₀)² ≥ 1. Both are continuous and skip a gap, so O(1,3)
// falls into four connected components — L↑₊ (rotations and boosts, the
// identity component SO⁺(1,3)), L↑₋ = P L↑₊, L↓₋ = T L↑₊, L↓₊ = PT L↑₊ —
// drawn on the (Λ⁰₀, det Λ) plane, where a boost slides a point along a ray
// that never crosses the gap. Which unions are subgroups (orthochronous,
// proper, orthochorous); a mirror z → −z sits with parity. Transfers: the Wu
// experiment (parity is not a symmetry of nature, only L↑₊ is guaranteed) and
// classifying described transformations. st-d.D2.2 has PSL(2,ℂ) ≅ SO⁺(1,3).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const NAMES = [t`$L^\uparrow_+$: proper orthochronous`, t`$L^\uparrow_-$: improper orthochronous`, t`$L^\downarrow_-$: improper non-orthochronous`, t`$L^\downarrow_+$: proper non-orthochronous`];
// piece index from det and the sign of Λ⁰₀
const piece = (det, s00) => (s00 > 0 ? (det > 0 ? 0 : 1) : det < 0 ? 2 : 3);
const PIECE_RULE = ['det +1, Λ⁰₀ ≥ +1', 'det −1, Λ⁰₀ ≥ +1', 'det −1, Λ⁰₀ ≤ −1', 'det +1, Λ⁰₀ ≤ −1'];

// the (Λ⁰₀, det Λ) plane: the four rays where Lorentz transformations live, and the forbidden gap
const plane = (extra = {}) => ({
  x: [-4.4, 4.4], y: [-1.9, 1.9], aspect: 'wide', xlabel: 'Λ⁰₀', ylabel: 'det Λ', yticks: 4,
  shade: [{ fn: '1.7', lower: '-1.7', from: -1, to: 1, color: 'bad', alpha: 0.12 }],
  curves: [
    { fn: '1', domain: [1, 4.4], color: 'good', width: 5 }, { fn: '-1', domain: [1, 4.4], color: 'accent', width: 5 },
    { fn: '-1', domain: [-4.4, -1], color: 'violet', width: 5 }, { fn: '1', domain: [-4.4, -1], color: 'gold', width: 5 },
  ],
  points: [
    { x: 3.2, y: 1, r: 0, label: 'L↑₊', labelDy: -16 }, { x: 3.2, y: -1, r: 0, label: 'L↑₋', labelDy: 18 },
    { x: -3.6, y: -1, r: 0, label: 'L↓₋', labelDy: 18 }, { x: -3.6, y: 1, r: 0, label: 'L↓₊', labelDy: -16 },
    { x: 0, y: 0, r: 0, label: 'no Λ here', labelAlign: 'center', labelDx: 0, labelDy: 0 },
    ...(extra.points || []),
  ],
  ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'points')),
});

// a 1+1 transformation's columns Λe_t and Λe_x, with the light cone
const columnsPic = (L, caption) => {
  const [[a, b], [c, d]] = L;            // rows t, x; columns e_t, e_x
  const m = Math.max(1.4, ...[a, b, c, d].map(Math.abs)) * 1.15;
  return {
    type: 'graph',
    params: {
      x: [-1.8 * m, 1.8 * m], y: [-m, m], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't',
      curves: [{ fn: 'x', color: 'warn', dash: true, width: 1 }, { fn: '-x', color: 'warn', dash: true, width: 1 }],
      arrows: [{ from: [0, 0], to: [0, 1], color: 'ink4', width: 1.4, dash: true, label: 'eₜ', labelDx: -18 }, { from: [0, 0], to: [1, 0], color: 'ink4', width: 1.4, dash: true, label: 'eₓ', labelDy: 14 }, { from: [0, 0], to: [r6(c), r6(a)], color: 'gold', width: 2.6, label: 'Λeₜ' }, { from: [0, 0], to: [r6(d), r6(b)], color: 'accent', width: 2.6, label: 'Λeₓ' }],
    },
    caption,
  };
};

export default lesson({
  id: 'st-g.G-LIEG.2',
  title: 'The four pieces of the Lorentz group',
  minutes: 12, difficulty: 3,
  intro: t`Every Lorentz transformation satisfies $\Lambda^\top\eta\,\Lambda = \eta$. Two facts follow, and between them they cut the group $O(1, 3)$ into **four pieces** that no continuous motion can join:

$$\det\Lambda = \pm1, \qquad (\Lambda^0{}_0)^2 = 1 + \sum_{i=1}^{3}(\Lambda^i{}_0)^2 \ge 1$$

The sign of $\det\Lambda$ says whether $\Lambda$ preserves spatial handedness (**proper**, $+1$) and the sign of $\Lambda^0{}_0$ whether it keeps the future in the future (**orthochronous**, $\Lambda^0{}_0 \ge 1$). The piece containing the identity, $L^\uparrow_+ = SO^+(1, 3)$, holds every rotation and boost; parity $P$ and time reversal $T$ reach the other three. [Boosts as hyperbolic rotations](#/lesson/phys3710.R2.1) lives inside $L^\uparrow_+$, and so does [the Möbius-map picture](#/lesson/st-d.D2.2) of $SO^+(1, 3)$.`,
  symbols: [
    { tex: '\\Lambda^\\mu{}_\\nu', text: t`a Lorentz matrix; row $\mu$, column $\nu$, with $0$ the time index ($c = 1$)` },
    { tex: '\\Lambda^0{}_0', text: t`the time–time entry: how much of the new time axis lies along the old one; $\gamma$ for a boost` },
    { tex: '\\Lambda^i{}_0', text: t`the space parts of the first column, $\Lambda e_t$: $\gamma\vec v$ for a boost` },
    { tex: 'P, T', text: t`parity $\operatorname{diag}(1, -1, -1, -1)$ and time reversal $\operatorname{diag}(-1, 1, 1, 1)$` },
    { tex: 'L^\\uparrow_+', text: t`the proper orthochronous Lorentz group: $\det = +1$, $\Lambda^0{}_0 \ge 1$` },
  ],
  why: 'Physical laws are only guaranteed to be invariant under the identity piece: the weak interaction breaks parity and time reversal, and general relativity’s local Lorentz symmetry is SO⁺(1,3) — whose double cover is where spinors live.',
  visual: {
    type: 'graph',
    title: 'Four rays and a gap',
    lead: t`Every Lorentz transformation is a point on one of the four coloured rays: across is $\Lambda^0{}_0$, up is $\det\Lambda$. The gold dot is a boost of rapidity $w$, optionally followed by $P$ and $T$. Nothing can sit in the red gap.`,
    tasks: [
      t`Slide $w$: the dot runs along its ray, $\Lambda^0{}_0 = \pm\cosh w$, and never reaches the gap. Boosts and rotations — continuous motions — cannot change the piece.`,
      t`Switch on $P$: the dot jumps to $\det = -1$. Switch on $T$ as well: it jumps to $\Lambda^0{}_0 \le -1$ with $\det = +1$. Reaching another piece takes a discrete jump.`,
    ],
    params: plane({
      sliders: [{ key: 'w', label: t`Boost rapidity $w$`, min: -2, max: 2, step: 0.05, value: 0.6, explain: t`A boost along $x$ with speed $\tanh w$; $\Lambda^0{}_0 = \cosh w = \gamma$.` }],
      choices: [{ key: 'p', label: t`Then apply $P$`, options: [[1, 'no'], [-1, 'yes']], value: 1, explain: 'Parity flips all three space axes: det −1.' }, { key: 'q', label: t`Then apply $T$`, options: [[1, 'no'], [-1, 'yes']], value: 1, explain: 'Time reversal flips the time axis: det −1 and Λ⁰₀ changes sign.' }],
      points: [{ x: 'q*cosh(w)', y: 'p*q', r: 7, color: 'gold' }],
      readouts: [{ label: t`$\Lambda^0{}_0$`, expr: 'q*cosh(w)', digits: 4 }, { label: t`$\det\Lambda$`, expr: 'p*q', digits: 2 }],
    }),
    caption: t`The rays are exact: $|\Lambda^0{}_0| \ge 1$ and $\det\Lambda = \pm1$. Rotations sit at $\Lambda^0{}_0 = 1$, boosts at $\gamma$.`,
  },
  example: {
    prompt: t`From $\Lambda^\top\eta\,\Lambda = \eta$, show that $\det\Lambda = \pm1$ and $|\Lambda^0{}_0| \ge 1$, and conclude that $O(1, 3)$ has (at least) four pieces. Where do $P$, $T$ and $PT$ go?`,
    visual: { type: 'graph', params: plane({ points: [{ x: 1, y: 1, r: 6, color: 'ink', label: 'I', labelDx: -14, labelDy: -10 }, { x: 1, y: -1, r: 6, color: 'ink', label: 'P', labelDx: -14, labelDy: 10 }, { x: -1, y: -1, r: 6, color: 'ink', label: 'T', labelDx: 8, labelDy: 10 }, { x: -1, y: 1, r: 6, color: 'ink', label: 'PT', labelDx: 8, labelDy: -10 }] }), caption: t`$I$, $P$, $T$ and $PT$ each sit at the inner end of a different ray.` },
    steps: [
      { label: 'Determinant', text: t`Take determinants: $\det\Lambda^\top\det\eta\det\Lambda = \det\eta$, so $(\det\Lambda)^2 = 1$ and $\det\Lambda = \pm1$.` },
      { label: 'The time-time entry', text: t`The $00$ entry of $\Lambda^\top\eta\Lambda = \eta$ reads $-(\Lambda^0{}_0)^2 + \sum_i(\Lambda^i{}_0)^2 = -1$. So $(\Lambda^0{}_0)^2 = 1 + \sum_i(\Lambda^i{}_0)^2 \ge 1$: either $\Lambda^0{}_0 \ge 1$ or $\Lambda^0{}_0 \le -1$. Physically: $\Lambda e_t$ is a unit timelike vector, on the upper or the lower sheet of the hyperboloid.` },
      { label: 'Continuity', text: t`Along any continuous path $\Lambda(s)$ in the group, $\det\Lambda(s)$ and $\Lambda^0{}_0(s)$ are continuous. The first takes only the values $\pm1$, the second avoids $(-1, 1)$: neither can change sign without a jump. So the four sign combinations are four separate pieces.` },
      { label: 'Place the reflections', text: t`$P = \operatorname{diag}(1, -1, -1, -1)$: $\det = -1$, $\Lambda^0{}_0 = 1$, in $L^\uparrow_-$. $T = \operatorname{diag}(-1, 1, 1, 1)$: $\det = -1$, $\Lambda^0{}_0 = -1$, in $L^\downarrow_-$. $PT = -I$: $\det = +1$, $\Lambda^0{}_0 = -1$, in $L^\downarrow_+$.` },
      { label: 'Sense check', text: t`Each piece is a copy of $L^\uparrow_+$: $L^\uparrow_- = PL^\uparrow_+$ and so on. And $L^\uparrow_+$ is itself connected — every element is a rotation times a boost — so there are exactly four.` },
    ],
    answer: t`$\det\Lambda = \pm1$ and $\Lambda^0{}_0 \ge 1$ or $\le -1$; four sign combinations, four pieces. $I \in L^\uparrow_+$, $P \in L^\uparrow_-$, $T \in L^\downarrow_-$, $PT = -I \in L^\downarrow_+$.`,
  },
  practice: [
    mcq({
      id: 'classify', difficulty: 2,
      gen(r) {
        const w = r.pick([0.4, 0.7, 1.0, -0.5, -0.9]), p = r.pick([1, -1]), q = r.pick([1, -1]);
        const ch = Math.cosh(w), sh = Math.sinh(w);
        // Λ = P^p T^q B(w) in 1+1, rows (t, x): P = diag(1, −1), T = diag(−1, 1)
        const L = [[q * ch, q * sh], [p * sh, p * ch]];
        const det = p * q, ans = piece(det, q);
        const why = {};
        for (let k = 0; k < 4; k++) if (k !== ans) why[k] = t`That piece has ${PIECE_RULE[k]}. Here $\det\Lambda = ${det}$ and $\Lambda^0{}_0 = ${nice(r6(L[0][0]), 4)}$.`;
        return {
          prompt: t`In 1+1 dimensions ($c = 1$), which piece of the Lorentz group contains $\Lambda = \begin{pmatrix} ${nice(r6(L[0][0]), 4)} & ${nice(r6(L[0][1]), 4)} \\ ${nice(r6(L[1][0]), 4)} & ${nice(r6(L[1][1]), 4)}\end{pmatrix}$, acting on $(t, x)$?`,
          visual: columnsPic(L, t`The columns of $\Lambda$: the images of $e_t$ (gold) and $e_x$ (blue), with the light cone dashed. In 1+1 “proper” means $\Lambda e_t, \Lambda e_x$ keep the orientation of $e_t, e_x$.`),
          choices: NAMES, answer: ans, fixedOrder: true, why,
          hints: [t`Compute $\det\Lambda = \Lambda^0{}_0\Lambda^1{}_1 - \Lambda^0{}_1\Lambda^1{}_0$ and read off the sign of $\Lambda^0{}_0$.`, t`Orthochronous: $\Lambda^0{}_0 \ge 1$, so $\Lambda e_t$ points to the future. Proper: $\det = +1$.`],
          teach: 'The piece is read off two signs: the determinant (handedness) and Λ⁰₀ (whether the time axis still points to the future).',
          explain: t`$\det\Lambda = ${det}$ and $\Lambda^0{}_0 = ${nice(r6(L[0][0]), 4)}$: ${NAMES[ans]}. It is a boost of rapidity $${w}$${p < 0 ? ' followed by parity' : ''}${q < 0 ? `${p < 0 ? ' and' : ' followed by'} time reversal` : ''}.`,
        };
      },
    }),
    num({
      id: 'lambda00', difficulty: 2,
      gen(r) {
        const v = r.pick([[0.6, 0.8, 0], [1, 2, 2], [0.3, 0, 0.4], [2, 3, 6], [1.2, 0, 0.5]]);
        const ans = Math.sqrt(1 + v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        return {
          prompt: t`An orthochronous Lorentz transformation has first column with space parts $(\Lambda^1{}_0, \Lambda^2{}_0, \Lambda^3{}_0) = (${v.join(', ')})$. What is $\Lambda^0{}_0$?`,
          visual: { type: 'graph', params: { x: [-8, 8], y: [-0.5, 8.5], equal: true, aspect: 'wide', xlabel: '|space part|', ylabel: 'Λ⁰₀', curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 2.2, label: 'unit timelike vectors (future sheet)', labelAt: -7, labelDx: 4, labelDy: 20 }, { fn: 'abs(x)', color: 'warn', dash: true, width: 1 }] }, caption: t`$\Lambda e_t$ must lie on the future sheet of $-(\Lambda^0{}_0)^2 + |\vec\Lambda_0|^2 = -1$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(Math.abs(1 - v[0] ** 2 - v[1] ** 2 - v[2] ** 2)), feedback: t`Sign: $(\Lambda^0{}_0)^2 = 1 + \sum(\Lambda^i{}_0)^2$, from the minus sign in $\eta_{00}$.` }, { value: 1 + v[0] ** 2 + v[1] ** 2 + v[2] ** 2, feedback: 'That is (Λ⁰₀)²; take the square root.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The $00$ component of $\Lambda^\top\eta\Lambda = \eta$: $-(\Lambda^0{}_0)^2 + \sum_i(\Lambda^i{}_0)^2 = -1$.`, 'Orthochronous means the positive root.'],
          teach: t`$\Lambda e_t$ is a unit timelike vector, so $\Lambda^0{}_0 = \sqrt{1 + |\vec\Lambda_0|^2} \ge 1$ for an orthochronous transformation — it is the $\gamma$ of the new frame.`,
          explain: t`$\Lambda^0{}_0 = \sqrt{1 + ${nice(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)}} = ${nice(ans, 4)}$: the new frame moves at speed $${nice(Math.sqrt(1 - 1 / (ans * ans)), 4)}$ relative to the old.`,
        };
      },
    }),
    multi({
      id: 'subgroups', difficulty: 3,
      prompt: t`Which of these sets are subgroups of $O(1, 3)$?`,
      visual: { type: 'graph', params: plane(), caption: 'The four pieces on the (Λ⁰₀, det Λ) plane.' },
      choices: [t`$L^\uparrow_+$ alone`, t`$L^\uparrow_+ \cup L^\uparrow_-$ (orthochronous)`, t`$L^\uparrow_+ \cup L^\downarrow_+$ (proper)`, t`$L^\uparrow_+ \cup L^\downarrow_-$`, t`$L^\uparrow_-$ alone`, t`$L^\uparrow_- \cup L^\downarrow_-$ (improper)`],
      answer: [0, 1, 2, 3],
      why: {
        4: t`It does not contain the identity — and $P\cdot P = I$ leaves it.`,
        5: t`Not closed: two improper transformations compose to a proper one ($\det$ multiplies), and the identity is missing.`,
      },
      hints: [t`A subgroup must contain $I$, which lies in $L^\uparrow_+$.`, t`$\det$ and $\operatorname{sign}\Lambda^0{}_0$ both multiply under composition (the second needs a short proof). A union is closed when the signs it allows are closed under multiplication.`],
      teach: 'The identity piece and its unions with one other piece are the subgroups: each is the kernel of a sign homomorphism (det, the time sign, or their product).',
      explain: t`Three homomorphisms to $\{\pm1\}$ — $\det\Lambda$, $\operatorname{sign}\Lambda^0{}_0$ and their product — have kernels $L_+$ (proper), $L^\uparrow$ (orthochronous) and $L^\uparrow_+ \cup L^\downarrow_-$ (sometimes called orthochorous). $L^\uparrow_+$ is the intersection of all three.`,
    }),
    num({
      id: 'compose', difficulty: 3,
      gen(r) {
        const w1 = r.pick([0.3, 0.5, 0.8]), w2 = r.pick([0.4, 0.6, -0.2]), rev = r.bool(0.5);
        const ans = (rev ? -1 : 1) * Math.cosh(w1 + w2);
        return {
          prompt: t`In 1+1, $\Lambda_1 = ${rev ? 'T\\,' : ''}B(${w1})$ ${rev ? '(a boost of rapidity ' + w1 + ' followed by time reversal $T = \\operatorname{diag}(-1, 1)$)' : '(a boost of rapidity ' + w1 + ')'} and $\Lambda_2 = B(${w2})$, where $B(w) = \begin{pmatrix}\cosh w & \sinh w \\ \sinh w & \cosh w\end{pmatrix}$. Find $(\Lambda_1\Lambda_2)^0{}_0$.`,
          visual: { type: 'graph', params: plane({ points: [{ x: r6((rev ? -1 : 1) * Math.cosh(w1)), y: rev ? -1 : 1, r: 6, color: 'ink', label: 'Λ₁', labelDy: rev ? 14 : -10 }, { x: r6(Math.cosh(w2)), y: 1, r: 6, color: 'ink', label: 'Λ₂', labelDy: -10 }] }), caption: 'The two factors on the (Λ⁰₀, det Λ) plane. Where does their product go?' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (rev ? -1 : 1) * Math.cosh(w1) * Math.cosh(w2), feedback: t`The $00$ entry of a product is $\cosh w_1\cosh w_2 + \sinh w_1\sinh w_2$: the cross term counts. Collinear boosts add rapidities.` }, { value: -ans, feedback: rev ? 'T flips the time row: the product keeps the minus sign.' : 'Two forward boosts stay orthochronous: the sign is +.' }].filter((e) => Math.abs(e.value - ans) > 0.005 * Math.abs(ans)),
          hints: [t`$B(w_1)B(w_2) = B(w_1 + w_2)$: rapidities add.`, rev ? t`$T$ multiplies the top row by $-1$.` : t`$(B(w_1 + w_2))^0{}_0 = \cosh(w_1 + w_2)$.`],
          teach: 'Collinear boosts compose by adding rapidities, and the sign of Λ⁰₀ multiplies: the pieces form the group {±1} × {±1}.',
          explain: t`$(\Lambda_1\Lambda_2)^0{}_0 = ${rev ? '-' : ''}\cosh(${w1} ${w2 < 0 ? '-' : '+'} ${Math.abs(w2)}) = ${nice(ans, 4)}$: the product lands in ${rev ? t`$L^\downarrow_-$, with $\Lambda_1$` : t`$L^\uparrow_+$, with both factors`}.`,
        };
      },
    }),
    mcq({
      id: 'mirror', difficulty: 2,
      prompt: t`A single mirror, $z \to -z$ (with $t, x, y$ unchanged), is a Lorentz transformation. Which piece is it in?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.4, vectors: [{ to: [1, 0, 0], color: 'accent', label: 'x' }, { to: [0, 1, 0], color: 'accent', label: 'y' }, { to: [0, 0, 1], color: 'accent', label: 'z' }, { from: [0, 0, 0], to: [0, 0, -1], color: 'gold', label: 'z\'' }], planes: [{ normal: [0, 0, 1], d: 0, size: 1.2, color: 'violet', alpha: 0.18 }], yaw: 0.8, pitch: 0.35 }, caption: 'The mirror plane z = 0 and the reflected z-axis (gold); x and y are unchanged.' },
      choices: [t`$L^\uparrow_-$, with parity: it is $P$ followed by a $180^\circ$ rotation about $z$`, t`$L^\uparrow_+$: one flipped axis is a rotation`, t`$L^\downarrow_-$, with time reversal`, t`It is not a Lorentz transformation, since parity must flip all three axes`],
      answer: 0,
      why: {
        1: t`Its determinant is $-1$: no rotation reverses handedness.`,
        2: t`$\Lambda^0{}_0 = +1$: time is untouched, so it is orthochronous.`,
        3: t`$\operatorname{diag}(1, 1, 1, -1)$ satisfies $\Lambda^\top\eta\Lambda = \eta$; it is as good a reflection as $P$.`,
      },
      hints: [t`Write it as a matrix: $\operatorname{diag}(1, 1, 1, -1)$. What are $\det$ and $\Lambda^0{}_0$?`, t`$P = \operatorname{diag}(1, -1, -1, -1)$; compare $P$ with a $180^\circ$ turn about $z$, $\operatorname{diag}(1, -1, -1, 1)$.`],
      teach: 'Any single mirror is parity combined with a rotation: every improper orthochronous transformation is P times an element of the identity piece.',
      explain: t`$\det = -1$, $\Lambda^0{}_0 = 1$: $L^\uparrow_-$. Indeed $\operatorname{diag}(1, 1, 1, -1) = P\cdot\operatorname{diag}(1, -1, -1, 1)$, parity times a half-turn about $z$. That is why “parity” and “mirror symmetry” are used interchangeably.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-wu', difficulty: 3, transfer: true,
      prompt: t`In the Wu experiment (1957), polarized cobalt-60 nuclei emit their beta electrons preferentially **opposite** to the nuclear spin. Under a mirror, the electron momentum $\vec p$ (a polar vector) and the spin $\vec J$ (an axial vector) transform differently. What does the result show?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, vectors: [{ to: [0, 0, 1.2], color: 'accent', label: '\\vec J' }, { to: [0, 0, -1.2], color: 'gold', label: '\\vec p_e' }], curves: [{ param: ['0.5*cos(t)', '0.5*sin(t)', '0.25'], t: [0, 5.2], color: 'accent' }], yaw: 0.8, pitch: 0.3 }, caption: 'The observed configuration: nuclear spin up, with the circulation that produces it drawn as a loop; electrons leave mostly downward. Schematic.' },
      choices: [t`In the mirror world electrons would go *along* the spin, which is not what nature does: parity is not a symmetry of the weak interaction, and only $L^\uparrow_+$ is a guaranteed symmetry`, 'Nothing about symmetry: mirrors reverse spin and momentum alike, so the mirror experiment looks the same', 'Time reversal is violated, since the electrons leave and never return', 'The cobalt nuclei were not really polarized'],
      answer: 0,
      why: {
        1: t`Under parity $\vec p \to -\vec p$ but $\vec J \to +\vec J$ (it is $\vec r\times\vec p$, two sign flips). So $\vec J\cdot\vec p$ changes sign and the mirrored experiment would look different.`,
        2: 'An arrow of emission is not a test of T; T violation was found separately (kaons, 1964 for CP; directly in 1998).',
        3: 'The polarization was measured, and reversing the field reversed the asymmetry.',
      },
      hints: [t`$\vec J\cdot\vec p$ is negative in the experiment. What is its sign in the mirror world?`, t`Under parity $\vec p \to -\vec p$ but $\vec J \to +\vec J$ (angular momentum is $\vec r\times\vec p$).`],
      teach: 'Parity sits in another piece of the Lorentz group, so nothing forces it to be a symmetry; the weak interaction breaks it, and only the identity piece is guaranteed.',
      explain: t`$\vec J\cdot\vec p$ is a pseudoscalar: parity flips its sign. Nature chose $\vec J\cdot\vec p < 0$, the mirror world would have $> 0$, so the mirror world is not ours. Relativity only demands invariance under $L^\uparrow_+$ — the piece reachable continuously from the identity.`,
    }),
    mcq({
      id: 'cp-describe', difficulty: 2,
      gen(r) {
        const [desc, ans] = r.pick([
          [t`a boost along $x$ at $0.6c$, followed by the reflection $y \to -y$`, 1],
          [t`a boost along $z$ at $0.8c$, followed by $t \to -t$`, 2],
          [t`a $180^\circ$ rotation about $x$, followed by a boost along $y$ at $0.5c$`, 0],
          [t`$x^\mu \to -x^\mu$ (every coordinate reversed), followed by a rotation by $30^\circ$ about $z$`, 3],
          [t`$t \to -t$ together with $x \to -x$, with $y$ and $z$ unchanged`, 3],
        ]);
        const why = {};
        for (let k = 0; k < 4; k++) if (k !== ans) why[k] = t`That piece has ${PIECE_RULE[k]}; find this transformation’s determinant and the sign of $\Lambda^0{}_0$ from its reflections.`;
        return {
          prompt: t`Which piece of the Lorentz group contains ${desc}?`,
          visual: { type: 'graph', params: plane(), caption: 'The four pieces on the (Λ⁰₀, det Λ) plane.' },
          choices: NAMES, answer: ans, fixedOrder: true, why,
          hints: ['Boosts and rotations do not change the piece. Count the reflections.', t`Each reflected coordinate contributes a factor $-1$ to $\det$; reflecting $t$ also flips the sign of $\Lambda^0{}_0$.`],
          teach: 'To classify a transformation, ignore its boosts and rotations and count reflections: each flips det, and a time reflection flips the sign of Λ⁰₀.',
          explain: t`Only the reflections matter: ${NAMES[ans]}.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Weinberg, The Quantum Theory of Fields I (CUP, 1995), §2.3 (the four components of the Lorentz group)', url: 'https://doi.org/10.1017/CBO9781139644167' },
    { label: 'Wu et al., Experimental test of parity conservation in beta decay, Phys. Rev. 105, 1413 (1957)', url: 'https://doi.org/10.1103/PhysRev.105.1413' },
  ],
});
