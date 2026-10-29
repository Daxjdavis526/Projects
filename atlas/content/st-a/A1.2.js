// Index notation and Einstein summation: free and dummy indices, index
// placement as grammar, renaming dummies, and counting what an index
// equation stands for.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { legs, grid, r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the Explore: W^i = M^i_j V^j drawn as numbers, with row i of M lit
const M0 = [[2, -1, 0], [1, 3, -2], [0, 1, 4]], V0 = [3, 1, 2];
const W0 = M0.map((row) => row.reduce((s, m, j) => s + m * V0[j], 0));
const sel = (i) => `1 - min(1, abs(isel - ${i}))`;                      // 1 when the slider is at i, else 0
const minus = (v) => String(v).replace('-', '−');
function explorePoints() {
  const pts = [];
  const ring = (x, y, when) => pts.push({ x, y, r: 15, color: 'gold', when }, { x, y, r: 12.5, color: 'panel', when });
  const val = (x, y, v, color = 'ink') => pts.push({ x, y, r: 0.01, color, label: minus(v), labelDx: 0, labelDy: 0, labelAlign: 'center' });
  const tag = (x, y, s, color = 'ink3') => pts.push({ x, y, r: 0.01, color, label: s, labelDx: 0, labelDy: 0, labelAlign: 'center' });
  M0.forEach((row, i) => row.forEach((m, j) => { ring(j, -i, sel(i + 1)); val(j, -i, m); }));
  V0.forEach((v, j) => { ring(4, -j, '1'); val(4, -j, v); tag(4.75, -j, `j = ${j + 1}`); });
  W0.forEach((w, i) => { ring(6.4, -i, sel(i + 1)); val(6.4, -i, w); });
  [0, 1, 2].forEach((i) => tag(-0.95, -i, `i = ${i + 1}`));
  [0, 1, 2].forEach((j) => tag(j, 0.62, `j = ${j + 1}`));
  tag(1, 1.25, 'Mⁱⱼ', 'accent'); tag(4, 1.25, 'Vʲ', 'accent'); tag(6.4, 1.25, 'Wⁱ', 'accent');
  tag(3, -1, '×', 'ink2'); tag(5.55, -1, '=', 'ink2');
  return pts;
}
const pick3 = (vals) => vals.map((v, k) => `(${sel(k + 1)})*(${v})`).join(' + ');

// a random small integer array
const ints = (r, n, lo = -3, hi = 4) => Array.from({ length: n }, () => r.intExcept(lo, hi, [0]));
const vecTeX = (a) => `(${a.join(',\\ ')})`;
const matTeX = (A) => `\\begin{pmatrix} ${A.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

export default lesson({
  id: 'st-a.A1.2',
  title: 'Index notation and Einstein summation',
  minutes: 10, difficulty: 2,
  intro: t`Written out, the equations of general relativity would fill pages. Index notation folds them up with two rules. An **index** is a label that runs over values — 1, 2, 3 in space; 0, 1, 2, 3 in spacetime. And **Einstein’s summation convention**: when one index letter appears twice in a term, once up and once down, you sum over all its values:

$$W^i = M^i{}_j\,V^j \quad\text{means}\quad W^i = \sum_{j=1}^{3} M^i{}_j\,V^j$$

The summed index ($j$) is a **dummy**: it is used up by the sum, so you may rename it. An index that appears once in every term ($i$) is **free**: the line is one equation for each of its values, and **every term must carry the same free indices at the same height**. Treat index placement as grammar — an upper index pairs with a lower one — and a badly formed expression shows itself at a glance. (The Road’s step 3 used this rule for $ds^2 = \eta_{\mu\nu}\,dx^\mu dx^\nu$; here you take the grammar apart.)`,
  symbols: [
    { tex: t`M^i{}_j`, text: t`an array of numbers with one upper index $i$ (the row) and one lower index $j$ (the column) — the matrix of a linear map. The gap in $M^i{}_j$ records that $i$ comes first` },
    { tex: t`V^j`, text: 'the components of a vector: an upper index' },
    { tex: t`W^i`, text: t`the result: one number for each value of $i$` },
    { tex: 'i', text: t`a **free** index: once in every term. The equation holds for $i = 1$, $2$ and $3$ separately` },
    { tex: 'j', text: t`a **dummy** index: twice in one term, once up and once down, and summed. $M^i{}_k V^k$ means exactly the same` },
  ],
  why: t`A line such as $R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$ is ten equations, each with dozens of terms hidden in sums; you can only read it if the index grammar is second nature.`,
  visual: {
    type: 'graph',
    title: 'A free index picks a row; a dummy index is summed away',
    lead: t`The array $M^i{}_j$, the vector $V^j$ and the result $W^i = M^i{}_j V^j$. The slider chooses the free index $i$: that row of $M$ lights up, it is multiplied entry by entry with $V$, and the products are added — that sum over $j$ is what the repeated index means.`,
    tasks: [
      t`Set $i = 2$ and check the readout by hand: $1\cdot3 + 3\cdot1 + (-2)\cdot2 = 2$.`,
      t`The letter $j$ never appears in the answer: the sum used it up. Writing $M^i{}_k V^k$ would give the same three numbers.`,
      'Three values of the free index give three equations, each a sum of three products: nine multiplications hidden in one short line.',
    ],
    params: {
      x: [-1.6, 7.6], y: [-2.7, 1.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      sliders: [{ key: 'isel', label: t`Free index $i$`, min: 1, max: 3, step: 1, value: 1, explain: t`Which of the three equations $W^1$, $W^2$, $W^3$ to look at.` }],
      points: explorePoints(),
      readouts: [
        { label: t`$M^i{}_1V^1 + M^i{}_2V^2 + M^i{}_3V^3$`, expr: pick3(M0.map((row) => row.reduce((s, m, j) => s + m * V0[j], 0))), digits: 4 },
        { label: t`terms: $M^i{}_1V^1$`, expr: pick3(M0.map((row) => row[0] * V0[0])), digits: 3 },
        { label: t`$M^i{}_2V^2$`, expr: pick3(M0.map((row) => row[1] * V0[1])), digits: 3 },
        { label: t`$M^i{}_3V^3$`, expr: pick3(M0.map((row) => row[2] * V0[2])), digits: 3 },
      ],
    },
    caption: t`Gold rings mark the numbers that go into $W^i$ for the chosen $i$. The vector is drawn as a column because its index $j$ runs down it, matching the columns of $M$.`,
  },
  example: {
    prompt: t`In two dimensions, $A_i = (1, -2)$, $M^i{}_j = \begin{pmatrix} 3 & -1 \\ 2 & 4 \end{pmatrix}$ (row $i$, column $j$) and $V^j = (2, 1)$. What is $s = A_i\,M^i{}_j\,V^j$? Say first what kind of object it is.`,
    visual: legs([{ name: 'A' }, { name: 'M' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 1, b: 2, index: 'j' }], caption: t`$A_i M^i{}_j V^j$ as an index diagram: every index is joined to a partner, so no leg is left loose — the result is a single number.` }),
    steps: [
      { label: 'Read the indices', text: t`$i$ appears twice (down on $A$, up on $M$) and so does $j$ (down on $M$, up on $V$). Both are dummies; nothing is free. So $s$ is **one number**, a double sum of $2 \times 2 = 4$ terms.` },
      { label: 'Do one sum first', text: t`Sum over $j$ to get $W^i = M^i{}_jV^j$: $W^1 = 3\cdot2 + (-1)\cdot1 = 5$ and $W^2 = 2\cdot2 + 4\cdot1 = 8$. The free index $i$ survives this step.` },
      { label: 'Then the other', text: t`$s = A_iW^i = 1\cdot5 + (-2)\cdot8 = -11$.` },
      { label: 'Check by brute force', text: t`All four terms $A_iM^i{}_jV^j$: $1\cdot3\cdot2 + 1\cdot(-1)\cdot1 + (-2)\cdot2\cdot2 + (-2)\cdot4\cdot1 = 6 - 1 - 8 - 8 = -11$. ✓ The order of the sums does not matter.` },
    ],
    answer: t`$s = -11$, a single number: both indices are summed.`,
  },
  practice: [
    mcq({
      id: 'free-dummy', difficulty: 1,
      prompt: t`In the expression $T^i{}_j\,V^j\,W_k$, which indices are free?`,
      visual: legs([{ name: 'T', up: ['i'] }, { name: 'V' }, { name: 'W', down: ['k'] }], { links: [{ a: 0, b: 1, index: 'j' }] }),
      choices: [t`$i$ and $k$`, t`$j$ only`, t`$i$, $j$ and $k$`, 'None: the expression is a single number'],
      answer: 0,
      why: {
        1: t`$j$ appears twice, once up and once down: it is summed, so it is a dummy.`,
        2: t`$j$ is summed away; only indices that appear once survive.`,
        3: t`Two indices are left over, $i$ up and $k$ down, so this is an array of $3\times3$ numbers, not one number.`,
      },
      hints: ['Count how often each letter appears.'],
      teach: 'An index appearing once is free; one appearing twice, once up and once down, is a summed dummy.',
      explain: t`$j$ is summed; $i$ (upper) and $k$ (lower) are free. The expression has one value for every pair $(i, k)$.`,
    }),
    multi({
      id: 'grammar', difficulty: 2,
      prompt: 'Which of these are grammatical index equations? Select every one.',
      visual: legs([{ name: 'M', up: ['i'] }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'j' }], caption: t`The first equation’s right-hand side, $M^i{}_jV^j$: one loose leg, up, labelled $i$ — exactly what the left-hand side $W^i$ has.` }),
      choices: [
        t`$W^i = M^i{}_j\,V^j$`,
        t`$A_i = M^j{}_i\,B_j$`,
        t`$s = A_i\,B^i$`,
        t`$V^i = W^j$`,
        t`$A^i = B^i{}_j\,C^j\,D_j$`,
        t`$s = A^i\,B^i$`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`The free index on the left is $i$, on the right $j$: the two sides are not even the same kind of statement.`,
        4: t`$j$ appears three times in one term, so the sum is ambiguous.`,
        5: t`Both indices are up. The convention pairs an upper index with a lower one; two uppers cannot be summed without a metric (lesson A6).`,
      },
      hints: ['Check each side’s free indices, and their heights.', 'Then check that every repeated letter appears exactly twice, once up and once down.'],
      teach: 'Every term carries the same free indices at the same height, and every dummy appears exactly twice, once up and once down.',
      explain: t`In the first three, the free indices match ($i$ up, $i$ down, none) and each dummy is one up and one down. $V^i = W^j$ has mismatched free indices; the fifth repeats $j$ three times; the last sums two upper indices.`,
    }),
    num({
      id: 'contract', difficulty: 1,
      gen(r) {
        const A = ints(r, 3), B = ints(r, 3);
        if (A.reduce((x, a, k) => x + a * B[k], 0) === 0) B[0] = -B[0];   // keep the answer away from 0
        const s = A.reduce((x, a, k) => x + a * B[k], 0);
        const naive = A.reduce((x, a) => x + a, 0) + B.reduce((x, b) => x + b, 0);
        return {
          prompt: t`With $A_i = ${vecTeX(A)}$ and $B^i = ${vecTeX(B)}$, evaluate $A_i\,B^i$.`,
          visual: legs([{ name: 'A' }, { name: 'B' }], { links: [{ a: 0, b: 1, index: 'i' }], caption: t`$A_iB^i$: one summed pair, no loose legs — a single number.` }),
          answer: s, tol: { rel: 0, abs: 0.5 },
          errors: naive !== s ? [{ value: naive, feedback: 'Multiply matching components first, then add the products.' }] : [],
          hints: [t`$A_iB^i = A_1B^1 + A_2B^2 + A_3B^3$.`],
          teach: 'A repeated pair, one up and one down, means: multiply matching components and add.',
          explain: t`$A_iB^i = ${A.map((a, k) => `(${a})(${B[k]})`).join(' + ')} = ${s}$.`,
        };
      },
    }),
    num({
      id: 'matrix-vector', difficulty: 2,
      gen(r) {
        const M = [ints(r, 3), ints(r, 3), ints(r, 3)], V = ints(r, 3, -2, 3);
        const i = r.int(1, 3);
        // every entry of M is nonzero, so nudging V¹ moves W^i off zero
        if (M[i - 1].reduce((s, m, j) => s + m * V[j], 0) === 0) V[0] += V[0] === -1 ? 2 : 1;
        const W = M.map((row) => row.reduce((s, m, j) => s + m * V[j], 0));
        const colWrong = M.reduce((s, row, j) => s + row[i - 1] * V[j], 0);   // summing down column i instead of along row i
        return {
          prompt: t`With $M^i{}_j = ${matTeX(M)}$ (row $i$, column $j$) and $V^j = ${vecTeX(V)}$, find $W^{${i}}$ in $W^i = M^i{}_j\,V^j$.`,
          visual: grid(M, { hl: [0, 1, 2].map((j) => [i - 1, j]), rowNames: ['i = 1', 'i = 2', 'i = 3'], colNames: ['j = 1', 'j = 2', 'j = 3'], caption: t`The array $M^i{}_j$ with row $i = ${i}$ marked: the free index fixes the row, and the dummy $j$ runs along it.` }),
          answer: W[i - 1], tol: { rel: 0, abs: 0.5 },
          errors: colWrong !== W[i - 1] ? [{ value: colWrong, feedback: t`You ran down column ${i}. In $M^i{}_jV^j$ the summed index $j$ is the column, so it runs along row ${i}.` }] : [],
          hints: [t`Fix $i = ${i}$; then $W^{${i}} = M^{${i}}{}_1V^1 + M^{${i}}{}_2V^2 + M^{${i}}{}_3V^3$.`, t`Those are the entries of row ${i}, multiplied by $${V.join(',\\ ')}$ in turn.`],
          teach: 'With the free index fixed, a contraction is one row of the array multiplied entry by entry into the vector.',
          explain: t`$W^{${i}} = ${M[i - 1].map((m, j) => `(${m})(${V[j]})`).join(' + ')} = ${W[i - 1]}$. All three: $W = ${vecTeX(W)}$.`,
        };
      },
    }),
    num({
      id: 'how-many', difficulty: 2,
      gen(r) {
        const forms = [
          { tex: t`W^\mu = M^\mu{}_\nu\,V^\nu`, f: 1, d: 1, net: legs([{ name: 'M', up: ['μ'] }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'ν' }] }) },
          { tex: t`T^{\mu\nu} = A^\mu\,B^\nu`, f: 2, d: 0, net: legs([{ name: 'A', up: ['μ'] }, { name: 'B', up: ['ν'] }]) },
          { tex: t`a^\mu = \Gamma^\mu{}_{\alpha\beta}\,u^\alpha\,u^\beta`, f: 1, d: 2, net: legs([{ name: 'u' }, { name: 'Γ', up: ['μ'] }, { name: 'u' }], { links: [{ a: 0, b: 1, index: 'α' }, { a: 1, b: 2, index: 'β' }] }) },
          { tex: t`X^\mu{}_\nu = A^\mu{}_\lambda\,B^\lambda{}_\nu`, f: 2, d: 1, net: legs([{ name: 'A', up: ['μ'] }, { name: 'B', down: ['ν'] }], { links: [{ a: 0, b: 1, index: 'λ' }] }) },
          { tex: t`s = h_{\mu\nu}\,U^\mu\,V^\nu`, f: 0, d: 2, net: legs([{ name: 'U' }, { name: 'h' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'μ' }, { a: 1, b: 2, index: 'ν' }] }) },
        ];
        const F = r.pick(forms), n = r.pick([3, 4]), askEq = F.d === 0 ? true : F.f === 0 ? false : r.bool(0.5);
        const ans = askEq ? n ** F.f : n ** F.d;
        const other = askEq ? n ** F.d : n ** F.f;
        return {
          prompt: t`Every index runs over ${n} values (${n === 4 ? t`$0, 1, 2, 3$, as in spacetime` : t`$1, 2, 3$, as in space`}). How many ${askEq ? 'separate equations does this line stand for' : 'products are added up in each equation'}? $$${F.tex}$$`,
          visual: { ...F.net, caption: 'Its right-hand side as an index diagram: loose legs are free indices (each multiplies the number of equations), gold links are summed pairs (each multiplies the number of terms).' },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: other !== ans ? [{ value: other, feedback: askEq ? 'That counts the terms in each sum. Equations come from the free indices.' : 'That counts the equations. Terms come from the summed indices.' }] : [],
          hints: [askEq ? 'Each free index can take any of its values independently; each choice is one equation.' : 'Each summed index runs over all its values; with two summed indices every pair of values gives a term.', t`Count the ${askEq ? 'free' : 'dummy'} indices, then raise ${n} to that power.`],
          teach: 'n values per index: the free indices give $n^{\\text{free}}$ equations and the dummies $n^{\\text{dummy}}$ terms in each.',
          explain: t`Free indices: ${F.f}; summed: ${F.d}. So the line is $${n}^{${F.f}} = ${n ** F.f}$ equation${n ** F.f === 1 ? '' : 's'}, each a sum of $${n}^{${F.d}} = ${n ** F.d}$ term${n ** F.d === 1 ? '' : 's'}.`,
        };
      },
    }),
    mcq({
      id: 'rename', difficulty: 2,
      prompt: t`Which expression means exactly the same as $A_i\,B^i\,C^j{}_j$?`,
      visual: legs([{ name: 'A' }, { name: 'B' }, { name: 'C' }], { links: [{ a: 0, b: 1, index: 'i' }], loops: [{ node: 2, index: 'j' }], caption: t`$A_iB^i\,C^j{}_j$: two separate sums. The loop on $C$ joins its own upper and lower index — a trace.` }),
      choices: [t`$A_k\,B^k\,C^m{}_m$`, t`$A_j\,B^j\,C^j{}_j$`, t`$A_i\,B^j\,C^i{}_j$`, t`$A_1B^1\,C^1{}_1$`],
      answer: 0,
      why: {
        1: t`Now $j$ appears four times: you can no longer tell which indices are summed together.`,
        2: t`This links $A$ to $C$ and $B$ to $C$ — a different sum, $\sum_{i,j}A_iC^i{}_jB^j$, which generally gives a different number.`,
        3: 'Dummy indices are summed over all their values, not set to 1.',
      },
      hints: ['Dummy indices are placeholders: what matters is which slots are paired, not the letters.'],
      teach: 'A dummy index may be renamed to any letter not already in use in that term.',
      explain: t`Renaming $i \to k$ and $j \to m$ keeps the same pairings — $A$ with $B$, and $C$ with itself — so it is the same number: $(A_kB^k)(C^m{}_m)$.`,
    }),
    mcq({
      id: 'clash', difficulty: 3, kind: 'error',
      prompt: t`A student has $s = W^i\,N_{ij}\,U^j$, where $N_{ij}$ is an array with two lower indices, and substitutes $W^i = M^i{}_j\,V^j$ to get
$$s = M^i{}_j\,V^j\,N_{ij}\,U^j.$$
What is wrong?`,
      visual: legs([{ name: 'V' }, { name: 'M' }, { name: 'N' }, { name: 'U' }], { links: [{ a: 0, b: 1, index: 'k' }, { a: 1, b: 2, index: 'i' }, { a: 2, b: 3, index: 'j' }], caption: t`What the student meant: three separate sums. Each gold link needs its own letter, so the one between $V$ and $M$ must not also be called $j$.` }),
      choices: [
        t`The substituted dummy $j$ clashes with the $j$ already summed: rename it, $s = M^i{}_k\,V^k\,N_{ij}\,U^j$`,
        'Nothing: every repeated index is summed, so the expression is fine',
        t`The free index $i$ must be renamed as well`,
        t`$M^i{}_j$ should have been written $M_j{}^i$ to match $N_{ij}$`,
      ],
      answer: 0,
      why: {
        1: t`$j$ now appears four times. Which two of them belong to the same sum? The expression no longer says.`,
        2: t`In $s$, $i$ is a dummy too, and it appears exactly twice (up on $M$, down on $N$), so it can stay.`,
        3: 'Changing the order of the indices on M changes which index is the row; the problem is the clash of letters.',
      },
      hints: ['Count how many times each letter appears in the student’s line.', t`The $j$ inside $W^i = M^i{}_jV^j$ is a dummy: you may call it anything before substituting.`],
      teach: 'Before substituting an expression with a dummy index, rename that dummy to a letter not used anywhere else in the term.',
      explain: t`The $j$ in $M^i{}_jV^j$ is a placeholder. Substituted into a term that already sums over $j$, it must get a fresh name: $s = M^i{}_k\,V^k\,N_{ij}\,U^j$, a triple sum over $i$, $j$, $k$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-double', difficulty: 2,
      gen(r) {
        let A, M, V, W, s;
        for (let k = 0; k < 40; k++) {     // redraw until no intermediate result and no answer is 0
          A = ints(r, 2); M = [ints(r, 2), ints(r, 2)]; V = ints(r, 2, -2, 3);
          W = M.map((row) => row[0] * V[0] + row[1] * V[1]);
          s = A[0] * W[0] + A[1] * W[1];
          if (s !== 0 && W[0] !== 0 && W[1] !== 0) break;
          if (k === 39) { A = [1, -2]; M = [[3, -1], [2, 4]]; V = [-1, 2]; W = [-5, 6]; s = -17; }
        }
        return {
          prompt: t`In two dimensions, $A_i = ${vecTeX(A)}$, $M^i{}_j = ${matTeX(M)}$ (row $i$, column $j$) and $V^j = ${vecTeX(V)}$. Evaluate $A_i\,M^i{}_j\,V^j$.`,
          visual: legs([{ name: 'A' }, { name: 'M' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 1, b: 2, index: 'j' }] }),
          answer: s, tol: { rel: 0, abs: 0.5 },
          hints: [t`First $W^i = M^i{}_jV^j$, then $A_iW^i$.`],
          teach: 'With no free index left, a chain of contractions is a single number; do the sums one at a time.',
          explain: t`$W = ${vecTeX(W)}$, so $A_iW^i = (${A[0]})(${W[0]}) + (${A[1]})(${W[1]}) = ${s}$.`,
        };
      },
    }),
    num({
      id: 'cp-imu', difficulty: 3, transfer: true,
      gen(r) {
        const psi = r.pick([20, 30, 35, 50, 65]), ax = r.pick([1.5, 2.0, 2.5, 3.0]), ay = r.pick([-1.2, -0.8, 0.6, 1.0]), az = -9.8;
        const c = Math.cos(psi * DEG), s = Math.sin(psi * DEG);
        const R = [[c, -s, 0], [s, c, 0], [0, 0, 1]].map((row) => row.map((v) => +v.toFixed(4)));
        const i = r.pick([1, 2]);
        const a = [ax, ay, az], out = R[i - 1].reduce((x, m, j) => x + m * a[j], 0);
        const wrongCol = R.reduce((x, row, j) => x + row[i - 1] * a[j], 0);
        return {
          prompt: t`A drone’s accelerometer reading in body axes is $a'^j = (${ax},\ ${ay},\ ${az})\ \text{m/s}^2$ ($j$ = forward, right, down). Its heading is $${psi}^\circ$, so navigation components follow from $a^i = R^i{}_j\,a'^j$ with
$$R^i{}_j = ${matTeX(R)}$$
(rows $i$ = north, east, down). What is the ${i === 1 ? 'north' : 'east'} component $a^{${i}}$?`,
          visual: grid(R, { hl: [0, 1, 2].map((j) => [i - 1, j]), rowNames: ['north', 'east', 'down'], colNames: ['fwd', 'right', 'down'], dx: 1.6, caption: t`The rotation array $R^i{}_j$ (to 4 decimal places), with row $i = ${i}$ marked. Level flight is assumed: no pitch or roll.` }),
          answer: out, units: 'm/s^2', tol: { rel: 0.005, abs: 0.005 },
          errors: Math.abs(wrongCol - out) > 0.05 ? [{ value: wrongCol, feedback: t`You used column ${i}. The free index $i$ picks the row of $R^i{}_j$; the dummy $j$ runs along it.` }] : [],
          hints: [t`$a^{${i}} = R^{${i}}{}_1\,a'^1 + R^{${i}}{}_2\,a'^2 + R^{${i}}{}_3\,a'^3$.`, t`Use row ${i} of the array: $(${R[i - 1].join(',\\ ')})$.`],
          teach: 'A rotation of components is a contraction: the free index picks the row, the dummy is summed along it.',
          explain: t`$a^{${i}} = (${R[i - 1][0]})(${ax}) + (${R[i - 1][1]})(${ay}) + (${R[i - 1][2]})(${az}) = ${nice(out, 4)}\ \text{m/s}^2$. The third component, $-9.8\ \text{m/s}^2$ along “down”, is not motion: an accelerometer held up against gravity reads $9.8\ \text{m/s}^2$ upward.`,
        };
      },
    }),
    mcq({
      id: 'cp-mismatch', difficulty: 2,
      prompt: t`What is wrong with $A^i = B^i{}_j\,C^j + D_j$?`,
      visual: legs([{ name: 'B', up: ['i'] }, { name: 'C' }, { name: 'D', down: ['j'], x: 4.2 }], { links: [{ a: 0, b: 1, index: 'j' }], caption: t`The two terms on the right as index diagrams: $B^i{}_jC^j$ has one loose upper leg, $i$; $D_j$ has one loose lower leg, $j$.` }),
      choices: [
        t`The last term’s free index is $j$ (and lower), but the equation’s free index is $i$ (upper)`,
        t`$j$ appears three times in the equation, so the sum is ambiguous`,
        t`$A^i$ should have a lower index to match $B^i{}_j$`,
        'Nothing: indices in separate terms do not need to match',
      ],
      answer: 0,
      why: {
        1: t`Dummies are counted within one term: in $B^i{}_jC^j$, $j$ appears exactly twice. The $j$ in $D_j$ is a different, free $j$.`,
        2: t`$B^i{}_jC^j$ has a free upper $i$, matching $A^i$; that part is fine.`,
        3: 'Every term in an equation — on either side — must carry the same free indices at the same heights.',
      },
      hints: ['List the free indices of each term separately.'],
      teach: 'Each term of an equation must have the same free indices at the same heights; dummies are counted term by term.',
      explain: t`$A^i$ and $B^i{}_jC^j$ have a free upper $i$; $D_j$ has a free lower $j$. You cannot add an object with one free index to an object with a different one — like adding a vector to a number. Perhaps $D^i$ was meant.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (index notation and the summation convention)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), ch. 2', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Fleisch, A Student’s Guide to Vectors and Tensors, ch. 5', url: 'https://www.cambridge.org/9780521171908' },
  ],
});
