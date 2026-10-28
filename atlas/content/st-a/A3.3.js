// Pairing a covector with a vector: ω(V) = ω_μ V^μ is the same number in
// every basis — no metric needed — because the two sets of components change
// in opposite ways. In spacetime: an observer's measured energy −p_μ u^μ.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { still, legs, r6 } from './_ten.js';

const t = String.raw;
const SQ = [[1, 0], [0, 1]];
const vecTeX = (a) => `(${a.join(',\\ ')})`;
const matTeX = (A) => `\\begin{pmatrix} ${A.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const fr = (x) => (Number.isInteger(x) ? String(x) : frac(x));
const comb = (B, c) => [c[0] * B[0][0] + c[1] * B[1][0], c[0] * B[0][1] + c[1] * B[1][1]];

export default lesson({
  id: 'st-a.A3.3',
  title: 'Pairing a covector with a vector',
  minutes: 10, difficulty: 2,
  intro: t`Feeding a vector to a covector is the one product in tensor algebra that needs **nothing but the two objects**. Change the basis however you like — stretch it, skew it, turn it — and the two sets of components change in opposite ways, so the sum of their products stays put:

$$\omega(\mathbf V) = \omega_\mu V^\mu = \omega'_\nu V'^\nu$$

It has to: $\omega(\mathbf V)$ is the number of the stack’s lines the arrow crosses, and relabelling cannot change a count. Compare the dot product $\mathbf U\cdot\mathbf V$ of two *vectors*: multiplying two arrows needs lengths and angles — a metric, $g_{\mu\nu}U^\mu V^\nu$ (lesson A6). A sum such as $U^\mu V^\mu$, two upper indices with no metric, is not the same in every basis, which is why the summation convention only ever pairs an upper index with a lower one.`,
  symbols: [
    { tex: t`\omega_\mu`, text: t`the covector’s components in some basis: $\omega_\mu = \omega(\mathbf e_\mu)$` },
    { tex: t`V^\mu`, text: t`the vector’s components in the same basis` },
    { tex: t`\omega'_\nu,\ V'^\nu`, text: 'both sets of components in another basis' },
    { tex: t`\omega(\mathbf V)`, text: 'a scalar: one number, the same in every basis — the count of lines crossed' },
  ],
  why: t`In relativity a measured quantity must not depend on coordinates; pairings are how you get such numbers — the energy an observer measures is $E = -p_\mu u^\mu$, a covector paired with a four-velocity.`,
  visual: {
    type: 'ten-basis',
    title: 'Drag the basis; the count stays',
    lead: t`A covector (teal stack) and a vector (gold). Drag the basis arrows anywhere: $\omega_1$, $\omega_2$, $V^1$ and $V^2$ all change, but $\omega_iV^i$ — the number of lines crossed — does not. The last two readouts show that the naive “length” $\sqrt{(V^1)^2 + (V^2)^2}$, a sum of two upper indices, is not so lucky.`,
    tasks: [
      t`Stretch $\mathbf e_1$ to twice its length: $\omega_1$ doubles (it crosses twice as many lines) and $V^1$ halves. Their product is unchanged.`,
      t`Skew the basis hard: all four components change, $\omega_iV^i$ never does.`,
      t`Watch $\sqrt{(V^1)^2 + (V^2)^2}$ wander as you drag, while the true length stays fixed: an upper–upper sum depends on the basis.`,
    ],
    params: { mode: 'covector', basis: [[1, 0], [0.4, 0.9]], dragBasis: true, covector: [1, 0.6], vector: [2.1, 1.2], readout: ['w', 'V', 'pair', 'len'], view: 2.4 },
    caption: t`Dragging the basis keeps the stack and the arrow where they are and updates the sliders to the stack’s new components. Bold lines are the ones the arrow crosses.`,
  },
  example: {
    prompt: t`In a basis $\mathbf e_i$, a covector has $\omega_i = (2, -1)$ and a vector has $V^i = (3, 4)$. A new basis is $\mathbf e'_1 = 2\mathbf e_1$, $\mathbf e'_2 = \mathbf e_1 + \mathbf e_2$. Find both sets of new components and check the pairing.`,
    visual: still({ mode: 'covector', basis: [[2, 0], [1, 1]], ghost: SQ, covector: [4, 1], vector: [3, 4].map((x) => x * 0.6), crossings: true, construction: true, grid: 'none', levelLabels: false }, t`The new basis (bold) over the old (faint), the stack of $\omega$ and the arrow (drawn at 0.6 scale, so it crosses $0.6\times2$ lines).`),
    steps: [
      { label: 'Old pairing', text: t`$\omega_iV^i = 2\cdot3 + (-1)\cdot4 = 2$.` },
      { label: 'New covector components', text: t`A covector’s components are its values on the basis arrows: $\omega'_1 = \omega(2\mathbf e_1) = 2\omega_1 = 4$ and $\omega'_2 = \omega(\mathbf e_1 + \mathbf e_2) = \omega_1 + \omega_2 = 1$. They change **like the basis**.` },
      { label: 'New vector components', text: t`$\mathbf V = V'^1(2\mathbf e_1) + V'^2(\mathbf e_1 + \mathbf e_2)$ must equal $3\mathbf e_1 + 4\mathbf e_2$: so $V'^2 = 4$ and $2V'^1 + 4 = 3$, $V'^1 = -\tfrac12$. They change **against the basis** (lesson A2.2).` },
      { label: 'New pairing', text: t`$\omega'_jV'^j = 4\cdot(-\tfrac12) + 1\cdot4 = 2$. ✓ Same number.` },
      { label: 'Contrast', text: t`The upper–upper sum $V^iV^i$ is $9 + 16 = 25$ in the old basis but $\tfrac14 + 16 = 16.25$ in the new one: it is not a property of the arrow.` },
    ],
    answer: t`$\omega'_j = (4, 1)$, $V'^j = (-\tfrac12, 4)$, and $\omega'_jV'^j = 2 = \omega_iV^i$.`,
  },
  practice: [
    num({
      id: 'pair4', difficulty: 1,
      gen(r) {
        const w = [r.intExcept(-3, 3, [0]), r.int(-3, 3), r.int(-3, 3), r.intExcept(-3, 3, [0])], V = [r.intExcept(-3, 4, [0]), r.int(-3, 3), r.intExcept(-3, 3, [0]), r.int(-3, 3)];
        if (w.reduce((s, x, k) => s + x * V[k], 0) === 0) V[0] += V[0] === -1 ? 2 : 1;
        const s = w.reduce((x, a, k) => x + a * V[k], 0);
        return {
          prompt: t`In spacetime (indices $0, 1, 2, 3$), a covector has components $\omega_\mu = ${vecTeX(w)}$ and a vector $V^\mu = ${vecTeX(V)}$. Evaluate $\omega_\mu V^\mu$.`,
          visual: legs([{ name: 'ω' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'μ' }], caption: t`$\omega_\mu V^\mu$: one lower index paired with one upper — a scalar, four terms.` }),
          answer: s, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: s - 2 * w[0] * V[0], feedback: t`No minus sign belongs here: a pairing needs no metric, so the time component is added like the others. (The $-$ of the Minkowski metric appears only when you lower or raise an index.)` }].filter((e) => e.value !== s),
          hints: [t`$\omega_\mu V^\mu = \omega_0V^0 + \omega_1V^1 + \omega_2V^2 + \omega_3V^3$.`],
          teach: 'A pairing is a plain sum of products, the same in every basis and in every signature.',
          explain: t`$${w.map((a, k) => `(${a})(${V[k]})`).join(' + ')} = ${s}$.`,
        };
      },
    }),
    num({
      id: 'stretch', difficulty: 2,
      gen(r) {
        const s = r.pick([2, 3, 0.5, 1000]), w1 = r.pick([1.5, 2, -3]), V1 = r.pick([4, 6, -2]);
        const which = r.pick(['w', 'V']);
        const ans = which === 'w' ? s * w1 : V1 / s;
        return {
          prompt: t`A covector has $\omega_1 = ${w1}$ and a vector has $V^1 = ${V1}$. The basis arrow $\mathbf e_1$ is replaced by $\mathbf e'_1 = ${s}\,\mathbf e_1$ (the other basis arrows unchanged). What is the new ${which === 'w' ? t`$\omega'_1$` : t`$V'^1$`}?`,
          visual: still({ mode: 'covector', basis: [[Math.min(s, 2.4), 0], [0.3, 1]], ghost: [[1, 0], [0.3, 1]], ghostNames: ['e₁', ''], names: ['e′₁', 'e₂'], covector: [Math.min(s, 2.4) * 0.8, 0.5], vector: [1.6, 0.9], crossings: false, construction: false, grid: 'none', levelLabels: false }, t`A stretched basis arrow (bold) crosses more of the stack’s lines than the old one (faint), but fewer of it are needed to build the gold arrow.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: which === 'w' ? w1 / s : V1 * s, feedback: which === 'w' ? t`A longer basis arrow crosses *more* lines: $\omega'_1 = \omega(\mathbf e'_1)$ grows with it.` : 'A longer basis arrow means fewer of them: the vector component shrinks.' }],
          hints: [which === 'w' ? t`$\omega'_1 = \omega(\mathbf e'_1) = \omega(${s}\,\mathbf e_1)$.` : t`$V'^1\mathbf e'_1$ must be the same piece $V^1\mathbf e_1$ of the arrow.`],
          teach: 'Covector components scale with the basis arrows; vector components scale against them.',
          explain: which === 'w' ? t`$\omega'_1 = ${s}\,\omega_1 = ${nice(ans)}$, and $V'^1 = V^1/${s}$, so the product $\omega'_1V'^1 = \omega_1V^1$ is unchanged.` : t`$V'^1 = V^1/${s} = ${nice(ans)}$, while $\omega'_1 = ${s}\,\omega_1$: the product is unchanged.`,
        };
      },
    }),
    num({
      id: 'use-invariance', difficulty: 2,
      gen(r) {
        const total = r.intExcept(-6, 8, [0]), w1 = r.intExcept(-3, 3, [0]), V1 = r.intExcept(-3, 3, [0]), V2 = r.pick([2, -1, 4]);
        const w2 = (total - w1 * V1) / V2;
        return {
          prompt: t`In one basis, $\omega(\mathbf V) = ${total}$. In another, the vector has components $V'^j = (${V1}, ${V2})$ and the covector has $\omega'_1 = ${w1}$. What must $\omega'_2$ be?`,
          visual: legs([{ name: 'ω′' }, { name: 'V′' }], { links: [{ a: 0, b: 1, index: 'j' }], caption: t`$\omega'_jV'^j$ — the same scalar as $\omega_iV^i$ in the first basis.` }),
          answer: w2, tol: { rel: 0.005, abs: 0.002 },
          hints: [t`$\omega'_jV'^j = \omega(\mathbf V) = ${total}$ in every basis.`, t`$${w1}\cdot(${V1}) + \omega'_2\cdot(${V2}) = ${total}$.`],
          teach: 'Because the pairing is the same in every basis, it can be used as an equation to find a missing component.',
          explain: t`$\omega'_2 = (${total} - ${w1}\cdot(${V1}))/(${V2}) = ${nice(w2)}$.`,
        };
      },
    }),
    multi({
      id: 'invariant', difficulty: 2,
      prompt: t`Which of these are the same number in every basis, without any metric? ($\omega$, $\theta$ covectors; $\mathbf U$, $\mathbf V$ vectors.) Select every one.`,
      visual: still({ mode: 'covector', basis: [[1.2, 0.2], [0.3, 0.9]], ghost: SQ, covector: [1, 0.5], vector: [1.9, 1.1], crossings: true, construction: false, grid: 'none' }, 'Two bases, one stack and one arrow: the number of bold lines does not depend on the basis.'),
      choices: [t`$\omega_\mu V^\mu$`, t`$\delta^\mu_\mu$`, t`$\omega_\mu U^\mu + \theta_\nu V^\nu$`, t`$U^\mu V^\mu$`, t`$\omega_\mu\theta_\mu$`],
      answer: [0, 1, 2],
      why: {
        3: t`Two upper indices: their components change the same way, so the sum changes with the basis. Turning it into a scalar needs a metric, $g_{\mu\nu}U^\mu V^\nu$.`,
        4: 'Two lower indices: the same problem, the other way round; it needs the inverse metric.',
      },
      hints: ['Look at index heights: does every summed pair have one up and one down?'],
      teach: 'Only sums pairing an upper index with a lower one are basis-independent without a metric.',
      explain: t`Pairings $\omega_\mu V^\mu$, sums of pairings, and the trace $\delta^\mu_\mu = n$ are scalars. $U^\mu V^\mu$ and $\omega_\mu\theta_\mu$ each pair two indices that change the same way, so they are not.`,
    }),
    mcq({
      id: 'mixed-bases', difficulty: 3, kind: 'error',
      prompt: t`A student has a covector’s components in the new basis of the worked example, $\omega'_j = (4, 1)$, and the vector’s components in the old basis, $V^i = (3, 4)$, and computes $\omega(\mathbf V) = 4\cdot3 + 1\cdot4 = 16$. The right answer is 2. What went wrong?`,
      visual: still({ mode: 'covector', basis: [[2, 0], [1, 1]], ghost: SQ, covector: [4, 1], vector: [1.8, 2.4], crossings: true, construction: false, grid: 'none', levelLabels: false }, 'Old basis faint, new basis bold: each has its own components for the same stack and arrow.'),
      choices: [
        'The two sets of components belong to different bases; a pairing only works with both in the same basis',
        'The pairing needs a metric, which they left out',
        'They should have subtracted instead of added',
        'Covector components must be divided by the vector components, not multiplied',
      ],
      answer: 0,
      why: {
        1: 'A pairing never needs a metric. The trouble is mixing bases.',
        2: 'In a pairing every product is added; no signs are introduced.',
        3: 'Pairing is a sum of products of matching components.',
      },
      hints: [t`Which basis does $(4, 1)$ belong to, and which does $(3, 4)$?`, t`Convert one of them: $V'^j = (-\tfrac12, 4)$.`],
      teach: 'Pair components only within one basis; across bases the numbers mean nothing together.',
      explain: t`$\omega'_jV'^j = 4(-\tfrac12) + 1(4) = 2$, or in the old basis $\omega_iV^i = 2\cdot3 - 1\cdot4 = 2$. Mixing $\omega'_j$ with $V^i$ multiplies numbers that refer to different basis arrows.`,
    }),
    num({
      id: 'general-pair', difficulty: 3,
      gen(r) {
        const opts = [[[2, 1], [0, 1]], [[1, 1], [1, 2]], [[1, -1], [1, 1]], [[3, 1], [1, 1]]];
        let A, w, V, wn, Vn;
        for (let k = 0; k < 40; k++) {
          A = r.pick(opts); w = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])]; V = [r.intExcept(-3, 4, [0]), r.intExcept(-3, 4, [0])];
          const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
          wn = [A[0][0] * w[0] + A[1][0] * w[1], A[0][1] * w[0] + A[1][1] * w[1]];
          Vn = [(A[1][1] * V[0] - A[0][1] * V[1]) / d, (-A[1][0] * V[0] + A[0][0] * V[1]) / d];
          if (w[0] * V[0] + w[1] * V[1] !== 0 && wn.every((x) => x !== 0)) break;
        }
        const which = r.pick([1, 2]);
        return {
          prompt: t`The new basis is $\mathbf e'_j = A^i{}_j\mathbf e_i$ with $A = ${matTeX(A)}$. A covector has old components $\omega_i = ${vecTeX(w)}$. What is its new component $\omega'_${which} = \omega(\mathbf e'_${which})$?`,
          visual: still({ mode: 'covector', basis: [[A[0][0], A[1][0]], [A[0][1], A[1][1]]], ghost: SQ, covector: wn.map((x) => x * 0.5), vector: [0.01, 0.01], crossings: false, construction: false, grid: 'none', levelLabels: true }, t`The stack of $\tfrac12\omega$ with the new basis (bold) and the old (faint): count the lines each new arrow crosses, and double.`),
          answer: wn[which - 1], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: A[which - 1][0] * w[0] + A[which - 1][1] * w[1], feedback: t`That uses row ${which} of $A$. The new arrow $\mathbf e'_${which}$ is column ${which}: $\omega'_${which} = A^i{}_${which}\,\omega_i$.` }].filter((e) => e.value !== wn[which - 1]),
          hints: [t`A covector’s components are its values on the basis arrows: $\omega'_${which} = \omega(\mathbf e'_${which})$.`, t`$\omega'_${which} = \omega(A^i{}_${which}\mathbf e_i) = A^i{}_${which}\,\omega_i$ — column ${which} of $A$.`],
          teach: t`Covector components transform with the basis matrix itself: $\omega'_j = A^i{}_j\,\omega_i$.`,
          explain: t`$\omega'_${which} = ${A[0][which - 1]}\cdot(${w[0]}) + ${A[1][which - 1]}\cdot(${w[1]}) = ${wn[which - 1]}$. With $V' = A^{-1}V$ the pairing is unchanged: for $V^i = ${vecTeX(V)}$, $\omega'_jV'^j = ${vecTeX(wn)}\cdot${vecTeX(Vn.map((x) => fr(+x.toFixed(9))))} = ${w[0] * V[0] + w[1] * V[1]} = \omega_iV^i$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pair', difficulty: 2,
      gen(r) {
        const w = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])], V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        if (w.reduce((s, x, k) => s + x * V[k], 0) === 0) V[2] += V[2] === -1 ? 2 : 1;
        const s = w.reduce((x, a, k) => x + a * V[k], 0);
        return {
          prompt: t`$\omega_i = ${vecTeX(w)}$ and $V^i = ${vecTeX(V)}$ in one basis. Someone changes to a skewed basis and recomputes. What value of $\omega_iV^i$ will they get?`,
          visual: legs([{ name: 'ω' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'i' }] }),
          answer: s, tol: { rel: 0, abs: 0.1 },
          hints: ['The pairing does not depend on the basis: compute it in the one you have.'],
          teach: 'ω(V) is a scalar: compute it in any convenient basis.',
          explain: t`$\omega_iV^i = ${w.map((a, k) => `(${a})(${V[k]})`).join(' + ')} = ${s}$, in this basis and every other.`,
        };
      },
    }),
    num({
      id: 'cp-doppler', difficulty: 3, transfer: true,
      gen(r) {
        const [line, E] = r.pick([['hydrogen-alpha', 1.889], ['hydrogen Lyman-alpha', 10.20], ['sodium D', 2.104]]);
        const b = r.pick([0.3, 0.5, 0.6, 0.8]), sgn = r.pick([1, -1]);
        const g = 1 / Math.sqrt(1 - b * b);
        const Eobs = g * E * (1 - sgn * b);
        return {
          prompt: t`With $c = 1$ and signature $(-,+,+,+)$, a ${line} photon of energy ${E} eV in a station’s frame, travelling in the $+x$ direction, has covector components $p_\mu = (-${E},\ ${E},\ 0,\ 0)$ eV. A probe flies ${sgn > 0 ? 'in the same direction as the photon' : 'toward the oncoming photon'} at speed $${b}$, so its four-velocity is $u^\mu = \gamma\,(1,\ ${sgn > 0 ? '' : '-'}${b},\ 0,\ 0)$ with $\gamma = 1/\sqrt{1 - ${b}^2}$. The energy the probe measures is $E_\text{obs} = -p_\mu u^\mu$. Find it.`,
          visual: {
            type: 'spacetime', params: { beta: sgn * b, events: [[0, 0], [2, 2]], names: ['emission', 'detection'], range: 3 },
            caption: t`The station’s spacetime diagram with the probe’s frame (axes tilted for speed ${b}). The photon’s worldline runs at 45°. The probe measures the photon’s energy with its own clock and rulers.`,
          },
          answer: Eobs, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: g * E * (1 + sgn * b), feedback: t`Sign slip: $-p_\mu u^\mu = -\gamma(p_0 + p_1u^1/\gamma) = \gamma(E - p_1v)$ with $v = ${sgn > 0 ? '' : '-'}${b}$.` }, { value: E, feedback: 'A moving observer does not measure the station’s energy: that is the Doppler effect.' }],
          hints: [t`$-p_\mu u^\mu = -(p_0u^0 + p_1u^1) = -\gamma\,(-${E} + ${E}\cdot${sgn > 0 ? '' : '(-'}${b}${sgn > 0 ? '' : ')'})$.`, t`$\gamma = ${nice(g, 4)}$.`],
          teach: 'An observer’s measured energy is a pairing: the photon’s covector with the observer’s four-velocity.',
          explain: t`$E_\text{obs} = \gamma E(1 ${sgn > 0 ? '-' : '+'} ${b}) = ${nice(g, 4)}\times${E}\times${nice(1 - sgn * b, 3)} = ${nice(Eobs, 4)}$ eV — a ${sgn > 0 ? 'red' : 'blue'}shift by the relativistic Doppler factor $\sqrt{(1 ${sgn > 0 ? '-' : '+'} ${b})/(1 ${sgn > 0 ? '+' : '-'} ${b})} = ${nice(Eobs / E, 4)}$. (The minus sign comes from the convention $p_0 = -E$ in this signature, not from the pairing, which needs no metric.)`,
        };
      },
    }),
    mcq({
      id: 'cp-heights', difficulty: 2,
      prompt: 'Why does the summation convention only ever sum an upper index against a lower one?',
      visual: legs([{ name: 'ω' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'μ' }], caption: 'A lower slot joined to an upper slot: the only join that gives the same number in every basis.' }),
      choices: [
        'Lower-index components change with the basis and upper-index ones against it, so only up–down sums are the same in every basis',
        'It is a typographical convention with no mathematical content',
        'Upper indices are always positive and lower ones negative',
        'Two upper indices can never appear in the same term',
      ],
      answer: 0,
      why: {
        1: t`Getting it wrong gives basis-dependent answers, as $U^\mu V^\mu$ showed.`,
        2: 'Heights say how components transform, not their signs.',
        3: t`They can appear together, as in $T^{\mu\nu} = A^\mu B^\nu$; they just cannot be summed against each other.`,
      },
      hints: [t`What happens to $\omega_\mu$ and to $V^\mu$ when a basis arrow is doubled?`],
      teach: 'Index heights record how components transform, and an up–down sum is what cancels the change.',
      explain: t`Under $\mathbf e'_j = A^i{}_j\mathbf e_i$, $\omega'_j = A^i{}_j\omega_i$ while $V'^j = (A^{-1})^j{}_iV^i$; in $\omega'_jV'^j$ the $A$ and $A^{-1}$ cancel. Two indices of the same height would leave an $A$ or an $A^{-1}$ behind.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (dual vectors and the action of a one-form on a vector)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §3.3 (one-forms; the contraction needs no metric)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Misner, Thorne & Wheeler, Gravitation, §2.5', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
  ],
});
