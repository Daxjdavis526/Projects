// Rank and index placement: a type (k, l) tensor has k covector slots (upper
// indices) and l vector slots (lower indices). The rank k + l counts slots;
// the type decides the transformation law — so the same square array of
// numbers read as a (1,1) and as a (0,2) tensor transforms differently.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { still, legs } from './_ten.js';
import { matTeX, cong, inv2, mul, cols, trace } from './_metric.js';

const t = String.raw;
const SQ = [[1, 0], [0, 1]];
const TYPES = [[2, 0, 'violet'], [1, 0, 'accent'], [1, 1, 'ink2'], [0, 1, 'teal'], [0, 2, 'gold']];
// a generic (k, l) tensor as an index diagram
const LETTERS = ['μ', 'ν', 'λ', 'σ', 'ρ', 'κ'];
const typeLegs = (k, l, caption, name = 'T') => legs([{ name, up: LETTERS.slice(0, k), down: LETTERS.slice(k, k + l) }], { caption });

export default lesson({
  id: 'st-a.A5.2',
  title: 'Rank and index placement: type (k, l)',
  minutes: 10, difficulty: 3,
  intro: t`A tensor of **type $(k, l)$** has $k$ slots for covectors and $l$ slots for vectors. Its components are its values on basis covectors and basis vectors, so they carry **$k$ upper and $l$ lower indices**: $T^{\mu}{}_{\nu} = T(\mathbf e^\mu, \mathbf e_\nu)$ for a (1,1) tensor. The total $k + l$ is its **rank** — but rank alone is not enough. Lesson A5.1’s argument, slot by slot, gives **one Jacobian factor per index**: $\partial x'/\partial x$ for each upper index (a covector slot, filled from the dual basis, which changes against the basis — lesson A3.5) and $\partial x/\partial x'$ for each lower one:

$$T'^{\mu}{}_{\nu} = \frac{\partial x'^\mu}{\partial x^\alpha}\,\frac{\partial x^\beta}{\partial x'^\nu}\;T^{\alpha}{}_{\beta}$$

So a (2,0), a (1,1) and a (0,2) tensor all fill a square array, yet they change in three different ways. **A matrix is not a tensor**: an array becomes one only together with its index placement — its transformation law.`,
  symbols: [
    { tex: t`(k, l)`, text: t`the type: $k$ covector slots (upper indices), $l$ vector slots (lower indices)` },
    { tex: t`k + l`, text: 'the rank: the total number of slots and indices' },
    { tex: t`T^{\mu}{}_{\nu}`, text: t`the components of a (1,1) tensor, $T(\mathbf e^\mu, \mathbf e_\nu)$: the horizontal order of the indices records the order of the slots` },
    { tex: t`\dfrac{\partial x'^\mu}{\partial x^\alpha}`, text: 'the factor for each upper index: transforms like vector components' },
    { tex: t`\dfrac{\partial x^\beta}{\partial x'^\nu}`, text: 'the factor for each lower index: transforms like the basis vectors and covector components' },
  ],
  why: t`Reading the type off the index placement tells you at a glance how any object in relativity transforms, and which products of tensors make sense — lesson A5.4’s contractions pair one upper with one lower index for exactly this reason.`,
  visual: {
    type: 'graph',
    title: 'Five types under one change of scale',
    lead: t`Make every basis arrow $\lambda$ times longer, $\mathbf e'_\mu = \lambda\,\mathbf e_\mu$. Each lower index then multiplies a component by $\lambda$ and each upper index divides it by $\lambda$, so a type $(k, l)$ component changes by $\lambda^{\,l-k}$. Both axes are logarithmic, so each type is a straight line.`,
    tasks: [
      t`Set $\lambda = 2$: a (0,2) component is multiplied by 4, a (2,0) component divided by 4, and a (1,1) component is unchanged.`,
      t`The three rank-2 types — (2,0), (1,1) and (0,2) — follow three different lines: rank alone does not fix the law.`,
      t`Which types are unchanged by every rescaling? Only those with as many upper as lower indices, like $\delta^\mu{}_\nu$.`,
    ],
    params: {
      x: [-1.05, 1.05], y: [-2.1, 2.1], xlog: true, ylog: true, aspect: 'wide', xlabel: 'λ (every basis arrow scaled by λ)', ylabel: 'factor on a component',
      sliders: [{ key: 'lam', label: t`$\lambda$`, min: 0.25, max: 4, step: 0.05, value: 2, explain: t`The scale of the new basis: $\mathbf e'_\mu = \lambda\,\mathbf e_\mu$. Metres to centimetres is $\lambda = 0.01$.` }],
      curves: TYPES.map(([k, l, color]) => ({ fn: `${l - k}*x`, color, width: 2.2, label: `(${k},${l}): λ${l - k === 0 ? '⁰' : l - k === 1 ? '' : l - k === -1 ? '⁻¹' : l - k === 2 ? '²' : '⁻²'}`, labelAt: k === 1 && l === 1 ? -0.45 : 0.45, labelDy: k === 1 && l === 1 ? -10 : 0 })),
      vlines: [{ x: 'log10(lam)', color: 'ink3' }],
      points: TYPES.map(([k, l, color]) => ({ x: 'log10(lam)', y: `${l - k}*log10(lam)`, color, r: 4 })),
      readouts: [
        { label: '(2,0): ', expr: 'lam^(-2)', digits: 3 }, { label: '(1,0): ', expr: 'lam^(-1)', digits: 3 }, { label: '(1,1): ', expr: '1', digits: 3 },
        { label: '(0,1): ', expr: 'lam', digits: 3 }, { label: '(0,2): ', expr: 'lam^2', digits: 3 },
      ],
    },
    caption: t`The factor $\lambda^{\,l-k}$ by which a type $(k, l)$ component changes when every basis arrow is scaled by $\lambda$ — the simplest change of basis; a general one mixes components as well as scaling them.`,
  },
  example: {
    prompt: t`One array, $\begin{pmatrix} 1 & 3 \\ 2 & 4 \end{pmatrix}$, holds the components of a (1,1) tensor $M^\mu{}_\nu$ and, separately, of a (0,2) tensor $T_{\mu\nu}$. Stretch the first basis arrow, $\mathbf e'_1 = 2\mathbf e_1$, $\mathbf e'_2 = \mathbf e_2$. Find both new arrays and compare their diagonal sums.`,
    visual: still({ basis: [[2, 0], [0, 1]], ghost: SQ, showVector: false, construction: false, grid: 'none' }, t`The new basis (bold): $\mathbf e'_1$ is twice $\mathbf e_1$ (faint); $\mathbf e'_2 = \mathbf e_2$.`),
    steps: [
      { label: 'The matrices', text: t`$A = \operatorname{diag}(2, 1)$ and $A^{-1} = \operatorname{diag}(\tfrac12, 1)$. Each lower index takes a factor $A^\beta{}_\nu$; each upper index a factor $(A^{-1})^\mu{}_\alpha$.` },
      { label: 'The (1,1) reading', text: t`$M'^\mu{}_\nu = (A^{-1})^\mu{}_\alpha\,A^\beta{}_\nu\,M^\alpha{}_\beta$: entry $(1, 2)$ gets $\tfrac12\cdot1$, entry $(2, 1)$ gets $1\cdot2$, the diagonal $\tfrac12\cdot2 = 1$. So $M' = ${matTeX([[1, 1.5], [4, 4]])}$.` },
      { label: 'The (0,2) reading', text: t`$T'_{\mu\nu} = A^\alpha{}_\mu A^\beta{}_\nu\,T_{\alpha\beta}$: entry $(1, 1)$ gets $2\cdot2$, entries $(1, 2)$ and $(2, 1)$ get $2$. So $T' = ${matTeX([[4, 6], [4, 4]])}$.` },
      { label: 'Compare', text: t`Same array before, different arrays after. The diagonal sum of $M$ stays $5$; that of $T$ jumps from $5$ to $8$. The first is a basis-independent number (lesson A5.4’s contraction); the second is not.` },
    ],
    answer: t`$M' = ${matTeX([[1, 1.5], [4, 4]])}$, $T' = ${matTeX([[4, 6], [4, 4]])}$: the type, not the array, decides the law. Only the (1,1) reading keeps its diagonal sum.`,
  },
  practice: [
    match({
      id: 'types', difficulty: 1,
      prompt: 'Match each object to its type (k, l): k upper indices, l lower.',
      visual: legs([{ name: 'g', down: ['μ', 'ν'] }, { name: 'δ', up: ['μ'], down: ['ν'] }, { name: 'R', up: ['ρ'], down: ['σ', 'μ', 'ν'] }, { name: 'u', up: ['μ'] }], { gap: 1.9, caption: t`Index diagrams: an upper index is a leg up (a covector slot), a lower index a leg down (a vector slot).` }),
      left: [t`the metric $g_{\mu\nu}$`, t`the inverse metric $g^{\mu\nu}$`, t`the Kronecker delta $\delta^\mu{}_\nu$`, t`the Riemann tensor $R^\rho{}_{\sigma\mu\nu}$`, t`a four-velocity $u^\mu$`, t`a gradient $\partial_\mu f$`],
      right: ['(0, 2)', '(2, 0)', '(1, 1)', '(1, 3)', '(1, 0)', '(0, 1)'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['Count the upper indices for k and the lower ones for l.'],
      teach: 'The type is read straight off the index placement: (number up, number down).',
      explain: t`$g_{\mu\nu}$ (0,2), $g^{\mu\nu}$ (2,0), $\delta^\mu{}_\nu$ (1,1), $R^\rho{}_{\sigma\mu\nu}$ (1,3), $u^\mu$ (1,0), $\partial_\mu f$ (0,1). The metric and its inverse share a rank but not a type.`,
    }),
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const [k, l] = r.pick([[1, 2], [2, 1], [0, 3], [2, 2], [1, 3], [3, 0]]), n = r.pick([2, 3, 4]);
        const ans = n ** (k + l);
        return {
          prompt: t`How many components does a type $(${k}, ${l})$ tensor have in ${n} dimensions (before any symmetry is used)?`,
          visual: typeLegs(k, l, t`A type $(${k}, ${l})$ tensor: ${k} upper and ${l} lower legs, each running over ${n} values.`),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n * (k + l), feedback: t`Each index runs over $${n}$ values *independently*: multiply, $${n}^{${k + l}}$, rather than add.` }, { value: (k + l) ** n, feedback: t`Base and power are swapped: $${k + l}$ indices with $${n}$ values each give $${n}^{${k + l}}$.` }].filter((e) => e.value !== ans),
          hints: [t`Each of the $${k + l}$ indices takes any of $${n}$ values.`],
          teach: t`A rank-$r$ tensor in $n$ dimensions has $n^r$ components; only its type, not the count, depends on where the indices sit.`,
          explain: t`$${n}^{${k}+${l}} = ${ans}$. In spacetime the Riemann tensor, rank 4, has $4^4 = 256$ — its symmetries cut that to 20 independent ones.`,
        };
      },
    }),
    num({
      id: 'scale', difficulty: 2,
      gen(r) {
        const [k, l] = r.pick([[2, 0], [0, 2], [1, 2], [2, 1], [0, 3]]), lam = r.pick([2, 3, 10]), c = r.pick([6, 12, 18, 36]);
        const ans = c * lam ** (l - k);
        const up = LETTERS.slice(0, k).join(''), dn = LETTERS.slice(k, k + l).join('');
        const name = `T${k ? `^{${up.replace(/μ/g, '\\mu').replace(/ν/g, '\\nu').replace(/λ/g, '\\lambda')}}` : ''}${l ? `${k ? '{}' : ''}_{${dn.replace(/μ/g, '\\mu').replace(/ν/g, '\\nu').replace(/λ/g, '\\lambda')}}` : ''}`;
        return {
          prompt: t`A type $(${k}, ${l})$ tensor $${name}$ has one component equal to $${c}$. Every basis arrow is made ${lam} times longer, $\mathbf e'_\mu = ${lam}\,\mathbf e_\mu$. What does that component become?`,
          visual: typeLegs(k, l, t`$${name}$: ${k} upper index${k === 1 ? '' : 'es'}, each dividing a component by $${lam}$; ${l} lower, each multiplying it by $${lam}$.`),
          answer: ans, tol: { rel: 1e-6 },
          errors: [{ value: c * lam ** (k - l), feedback: 'Upside down: a lower index transforms with the basis (multiply by λ), an upper index against it (divide).' }].filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`Each lower index brings a factor $${lam}$, each upper index a factor $1/${lam}$.`],
          teach: t`Under $\mathbf e'_\mu = \lambda\mathbf e_\mu$ a type $(k, l)$ component is multiplied by $\lambda^{\,l-k}$.`,
          explain: t`$${c}\times${lam}^{${l - k}} = ${nice(ans)}$.`,
        };
      },
    }),
    mcq({
      id: 'law', difficulty: 2,
      prompt: t`Which is the transformation law of a type (2,1) tensor $T^{\mu\nu}{}_\lambda$?`,
      visual: legs([{ name: 'T', up: ['μ', 'ν'], down: ['λ'] }], { caption: t`$T^{\mu\nu}{}_\lambda$: two upper legs and one lower.` }),
      choices: [
        t`$T'^{\mu\nu}{}_\lambda = \dfrac{\partial x'^\mu}{\partial x^\alpha}\dfrac{\partial x'^\nu}{\partial x^\beta}\dfrac{\partial x^\gamma}{\partial x'^\lambda}\,T^{\alpha\beta}{}_\gamma$`,
        t`$T'^{\mu\nu}{}_\lambda = \dfrac{\partial x^\alpha}{\partial x'^\mu}\dfrac{\partial x^\beta}{\partial x'^\nu}\dfrac{\partial x'^\lambda}{\partial x^\gamma}\,T^{\alpha\beta}{}_\gamma$`,
        t`$T'^{\mu\nu}{}_\lambda = \dfrac{\partial x'^\mu}{\partial x^\alpha}\dfrac{\partial x^\gamma}{\partial x'^\lambda}\,T^{\alpha\nu}{}_\gamma$`,
        t`$T'^{\mu\nu}{}_\lambda = \dfrac{\partial x'^\mu}{\partial x^\alpha}\dfrac{\partial x'^\nu}{\partial x^\beta}\dfrac{\partial x'^\lambda}{\partial x^\gamma}\,T^{\alpha\beta}{}_\gamma$`,
      ],
      answer: 0,
      why: {
        1: t`Every factor is upside down: the free $\mu$ sits in a denominator, where it acts as a lower index. Check the balance of each free index.`,
        2: t`The second upper index is missing its factor: $\nu$ is left mixing old and new, $T^{\alpha\nu}{}_\gamma$.`,
        3: t`The lower index $\lambda$ needs $\partial x^\gamma/\partial x'^\lambda$; here $\lambda$ ends up upstairs and $\gamma$ is summed with two lower partners.`,
      },
      hints: ['One factor per index. Check that every free index sits at the same height on both sides — an index in a denominator counts as lower.'],
      teach: t`Upper index: a factor $\partial x'/\partial x$; lower index: $\partial x/\partial x'$. Index balance decides which is which.`,
      explain: t`Two upper indices, two factors of $\partial x'^\cdot/\partial x^\cdot$; one lower, one of $\partial x^\cdot/\partial x'^\cdot$. Every summed index pairs one up with one down.`,
    }),
    num({
      id: 'array-two-ways', difficulty: 3,
      gen(r) {
        const A = r.pick([[[2, 0], [0, 1]], [[1, 0], [0, 3]], [[1, 1], [0, 1]], [[2, 0], [1, 1]]]);
        const Mx = [[r.intExcept(-3, 4, [0]), r.intExcept(-3, 3, [0])], [r.intExcept(-3, 3, [0]), r.intExcept(-3, 4, [0])]];
        const asMixed = mul(mul(inv2(A), Mx), A), asLower = cong(Mx, A);
        const cand = [];
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (Math.abs(asMixed[i][j] - asLower[i][j]) > 0.01 && Math.abs(asMixed[i][j]) > 1e-9 && Math.abs(asLower[i][j]) > 1e-9) cand.push([i, j]);
        const [i, j] = cand.length ? r.pick(cand) : [0, 0];
        const which = r.pick(['mixed', 'lower']);
        const ans = which === 'mixed' ? asMixed[i][j] : asLower[i][j], other = which === 'mixed' ? asLower[i][j] : asMixed[i][j];
        return {
          prompt: t`The array $${matTeX(Mx)}$ holds the components of ${which === 'mixed' ? t`a (1,1) tensor $M^\mu{}_\nu$` : t`a (0,2) tensor $T_{\mu\nu}$`}. The basis changes by $\mathbf e'_\nu = A^\beta{}_\nu\,\mathbf e_\beta$ with $A = ${matTeX(A)}$. Find ${which === 'mixed' ? t`$M'^${i + 1}{}_${j + 1}$` : t`$T'_{${i + 1}${j + 1}}$`}.`,
          visual: still({ basis: cols(A), ghost: SQ, showVector: false, construction: false, grid: 'none' }, t`The new basis (bold, the columns of $A$) over the old (faint).`),
          answer: ans, tol: { rel: 0.005, abs: 0.01 },
          errors: Math.abs(other - ans) > 0.01 ? [{ value: other, feedback: which === 'mixed' ? t`That is the (0,2) law, $A^\mathsf{T}MA$. An upper index takes $A^{-1}$: $M' = A^{-1}MA$.` : t`That is the (1,1) law, $A^{-1}TA$. Both lower indices take $A$: $T' = A^\mathsf{T}TA$.` }] : [],
          hints: [which === 'mixed' ? t`$M'^\mu{}_\nu = (A^{-1})^\mu{}_\alpha\,M^\alpha{}_\beta\,A^\beta{}_\nu$: as matrices, $M' = A^{-1}MA$.` : t`$T'_{\mu\nu} = A^\alpha{}_\mu\,T_{\alpha\beta}\,A^\beta{}_\nu$: as matrices, $T' = A^\mathsf{T}TA$.`, t`$A^{-1} = ${matTeX(inv2(A))}$, $A^\mathsf{T} = ${matTeX([[A[0][0], A[1][0]], [A[0][1], A[1][1]]])}$.`],
          teach: 'The same array transforms as A⁻¹MA if it is a (1,1) tensor and as AᵀTA if it is a (0,2) tensor: the index placement is part of the object.',
          explain: t`${which === 'mixed' ? t`$M' = A^{-1}MA = ${matTeX(asMixed)}$` : t`$T' = A^\mathsf{T}TA = ${matTeX(asLower)}$`}, so the entry is $${nice(ans)}$. Read as the other type, the same array would give $${matTeX(which === 'mixed' ? asLower : asMixed)}$. Diagonal sums: (1,1) keeps $${trace(Mx)}$; (0,2) gives $${nice(trace(asLower))}$.`,
        };
      },
    }),
    mcq({
      id: 'riemann-slots', difficulty: 2,
      prompt: t`The Riemann tensor $R^\rho{}_{\sigma\mu\nu}$ is a machine. What does it eat, to return a single number?`,
      visual: legs([{ name: 'R', up: ['ρ'], down: ['σ', 'μ', 'ν'] }], { caption: t`$R^\rho{}_{\sigma\mu\nu}$: one leg up, three down.` }),
      choices: ['One covector and three vectors', 'Four vectors', 'Three covectors and one vector', 'Two covectors and two vectors'],
      answer: 0,
      why: {
        1: 'The upper index ρ marks a covector slot: Riemann is type (1,3), not (0,4). (Lowering ρ with the metric makes a (0,4) relative, lesson A6.4.)',
        2: 'Upside down: upper indices are covector slots, and there is only one.',
        3: 'Count again: one index up, three down.',
      },
      hints: ['Each upper index is a slot for a covector; each lower index a slot for a vector.'],
      teach: 'Each upper index is a covector slot, each lower index a vector slot.',
      explain: t`Type (1,3): $R(\omega, \mathbf A, \mathbf B, \mathbf C) = R^\rho{}_{\sigma\mu\nu}\,\omega_\rho A^\sigma B^\mu C^\nu$. Feed it only the three vectors and the leftover slot makes it a vector — the version used in geodesic deviation.`,
    }),
    multi({
      id: 'balanced', difficulty: 2,
      prompt: 'Which of these are well-formed tensor equations — every term with the same free indices at the same heights, every summed index once up and once down? Select every one.',
      visual: legs([{ name: 'A', up: ['μ'], down: [] }, { name: 'V', up: [] }], { links: [{ a: 0, b: 1, index: 'ν' }], caption: t`$A^\mu{}_\nu V^\nu$: the summed $\nu$ joins a lower leg to an upper one; the free $\mu$ stays up.` }),
      choices: [t`$W^\mu = A^\mu{}_\nu\,V^\nu$`, t`$\omega_\mu = T_{\mu\nu}\,V^\nu$`, t`$U_\mu = S^{\mu\nu}\,\omega_\nu$`, t`$g_{\mu\nu} = h^{\mu\nu}$`, t`$T^\mu{}_\nu = A^\mu{}_\lambda\,B^\lambda{}_\nu$`],
      answer: [0, 1, 4],
      why: {
        2: t`The free $\mu$ is lower on the left and upper on the right: the two sides would transform differently.`,
        3: 'A (0,2) tensor cannot equal a (2,0) tensor component by component: the equation would hold in one basis and fail in the next.',
      },
      hints: ['Find the free indices of each side and compare their heights.'],
      teach: 'An equation between tensors holds in every basis only if both sides have the same type — the same free indices at the same heights.',
      explain: t`The first, second and last balance. The third and fourth put the free indices at different heights on the two sides, so they could hold in one basis at most.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-count', difficulty: 1,
      gen(r) {
        const [what, k, l, n] = r.pick([['the Riemann tensor in four-dimensional spacetime', 1, 3, 4], ['the Riemann tensor of a surface (two dimensions)', 1, 3, 2], ['the Riemann tensor of ordinary three-dimensional space', 1, 3, 3], ['a type (2,1) tensor in spacetime', 2, 1, 4]]);
        const ans = n ** (k + l);
        return {
          prompt: t`How many components, before any symmetry is used, does ${what} have?`,
          visual: typeLegs(k, l, t`A type $(${k}, ${l})$ tensor in ${n} dimensions.`, k === 1 && l === 3 ? 'R' : 'T'),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n * (k + l), feedback: 'The index values multiply: n to the power of the rank.' }].filter((e) => e.value !== ans),
          hints: [t`$n^{\,k+l}$.`],
          teach: t`$n^{\,k+l}$ components: the rank is the power, the dimension the base.`,
          explain: t`$${n}^{${k + l}} = ${ans}$.`,
        };
      },
    }),
    num({
      id: 'cp-degrees', difficulty: 3, transfer: true,
      gen(r) {
        const [place, lat] = r.pick([['the equator', 0], ['Kourou’s latitude, 5.2° N', 5.2], ['Cape Canaveral’s latitude, 28.5° N', 28.5]]);
        const R = 6371, th = ((90 - lat) * Math.PI) / 180;
        const g = (R * Math.sin(th)) ** 2, k = Math.PI / 180;
        const ans = g * k * k;
        return {
          prompt: t`On a spherical Earth ($R = 6371$ km) the metric — a (0,2) tensor, the subject of module A6 — has component $g_{\phi\phi} = R^2\sin^2\theta$ in km² per radian² of longitude $\phi$, with $\theta$ the angle from the North Pole. A navigator measures longitude in **degrees** instead, $\phi' = (180/\pi)\,\phi$. At ${place}, what is the new component $g'_{\phi'\phi'}$, in km² per degree²? (Its square root is the distance per degree of longitude.)`,
          visual: { type: 'graph', params: { x: [-1.5, 2.2], y: [-0.45, 0.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
            curves: [{ param: ['1.2*cos(t)', '0.35*sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.6 }],
            points: [{ x: 0, y: 0.35, color: 'ink', label: 'P', labelDx: -14 }],
            arrows: [{ from: [0, 0.35], to: [1.2, 0.35], color: 'ink3', width: 2.4, label: '∂φ: one radian', labelDx: 6, labelDy: 10 }, { from: [0, 0.35], to: [0.21, 0.35], color: 'gold', width: 3.2, label: '∂φ′: one degree (drawn 10× too long)', labelDx: -10, labelDy: -14 }] },
            caption: t`A circle of latitude (teal, in perspective) and the basis arrows for one radian and one degree of longitude at a point on it. Schematic: the degree arrow is really $\pi/180$ of the radian one.` },
          answer: ans, units: 'km^2', tol: { rel: 0.005 },
          errors: [{ value: g / (k * k), feedback: 'That transforms it like an upper-index object. Both indices of g are lower: each brings a factor ∂φ/∂φ′ = π/180, so the component shrinks.' }, { value: g * k, feedback: 'Two lower indices, two factors of π/180 — not one.' }],
          hints: [t`$g'_{\phi'\phi'} = \dfrac{\partial\phi}{\partial\phi'}\dfrac{\partial\phi}{\partial\phi'}\,g_{\phi\phi}$, with $\partial\phi/\partial\phi' = \pi/180$.`, t`$g_{\phi\phi} = (6371\sin\theta)^2$ km² with $\theta = ${nice(90 - lat)}^\circ$.`],
          teach: 'A rescaled coordinate rescales each lower index of a component by the same Jacobian factor — twice for the metric.',
          explain: t`$g'_{\phi'\phi'} = (\pi/180)^2\times${nice(g, 5)} = ${nice(ans, 5)}$ km² per degree², so one degree of longitude there is $\sqrt{${nice(ans, 5)}} = ${nice(Math.sqrt(ans), 4)}$ km.`,
        };
      },
    }),
    mcq({
      id: 'cp-identity', difficulty: 2,
      prompt: t`In one basis, a (1,1) tensor $M^\mu{}_\nu$ and a (0,2) tensor $T_{\mu\nu}$ both have the identity array $\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$. Every basis arrow is then doubled, $\mathbf e'_\mu = 2\,\mathbf e_\mu$. What are their new arrays?`,
      visual: still({ basis: [[2, 0], [0, 2]], ghost: SQ, showVector: false, construction: false, grid: 'none', names: ['2e₁', '2e₂'] }, 'The doubled basis (bold) over the old (faint).'),
      choices: [t`$M'$ is still the identity; $T'$ is $4$ times the identity`, t`Both are $4$ times the identity`, t`Both are still the identity`, t`$M'$ is $4$ times the identity; $T'$ is still the identity`],
      answer: 0,
      why: {
        1: t`$M$’s upper index divides by 2 while its lower index multiplies by 2: $M$ is unchanged.`,
        2: t`An array of numbers that is the identity in one basis need not stay so: $T$’s two lower indices each multiply by 2.`,
        3: 'Swapped: the (1,1) tensor is the one whose factors cancel.',
      },
      hints: [t`Factor $\lambda^{\,l-k}$ with $\lambda = 2$.`],
      teach: t`$\delta^\mu{}_\nu$ is the identity in every basis; a (0,2) tensor that is the identity in one basis is not.`,
      explain: t`(1,1): $2^{1-1} = 1$; (0,2): $2^2 = 4$. The (1,1) identity is the Kronecker delta, the same in every basis; the (0,2) one is a metric, which records the basis arrows’ lengths (lesson A6.1).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (tensors of type (k, l) and their transformation law)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §3.2–3.3', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Tensor: valence and the transformation law', url: 'https://en.wikipedia.org/wiki/Tensor#As_multidimensional_arrays' },
  ],
});
