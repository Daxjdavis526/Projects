// The Ising model: spins ±1 on a lattice, neighbours preferring to align.
// Energy counting on a chain and a square lattice; the cost of one flip;
// mean-field theory (each spin feels its neighbours' average) and its
// kT_c = zJ; why one dimension has no transition (a domain wall costs a fixed
// energy but gains entropy k ln N); Onsager's exact kT_c = 2J/ln(1 + √2) and
// Yang's magnetization for the square lattice; a real two-dimensional magnet.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, MEV, TC_SQUARE, TC_HONEY, TC_TRI, YANG_EXPR, yang, mfM, chainPic, crossPic, isingPic, r4, texNum, apart } from './_th4.js';

const t = String.raw;
const TC_CUBIC = 4.511528;   // simple cubic, Monte Carlo (Ferrenberg, Xu & Landau 2018)
const LATTICES = {
  honey: { name: 'honeycomb', z: 3, exact: TC_HONEY, how: 'exact (Houtappel 1950)' },
  square: { name: 'square', z: 4, exact: TC_SQUARE, how: 'exact (Onsager 1944)' },
  tri: { name: 'triangular', z: 6, exact: TC_TRI, how: 'exact (Houtappel 1950)' },
  cubic: { name: 'simple cubic (3D)', z: 6, exact: TC_CUBIC, how: 'Monte Carlo (Ferrenberg et al. 2018)' },
};
const chainE = (s) => { let e = 0; for (let i = 0; i + 1 < s.length; i++) e -= s[i] * s[i + 1]; return e; };   // in units of J

/** The mean-field picture: y = m against y = tanh(4m/t) for each t. */
function mfPic(ts, { caption, marks = true } = {}) {
  const curves = [{ fn: 'x', domain: [0, 1.2], color: 'ink3', dash: true, label: 'y = m', labelAt: 0.72, labelDx: 10, labelDy: 10 }];
  const points = [];
  ts.forEach((tt, k) => {
    const col = ['gold', 'accent', 'violet'][k % 3];
    curves.push({ fn: `tanh(${r4(4 / tt)}*x)`, domain: [0, 1.2], color: col, label: `kT/J = ${tt}`, labelAt: 1.12, labelDy: k ? 14 : -10 });
    const m = mfM(tt);
    if (marks && m > 1e-6) points.push({ x: r4(m), y: r4(m), r: 5, color: col });
  });
  points.push({ x: 0, y: 0, r: 5, color: 'ink2' });
  return { type: 'graph', params: { x: [0, 1.3], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'magnetization m', ylabel: 'y', curves, points }, caption };
}

/** Yang's curve with the mean-field curve, on kT/J. */
function curvesPic({ caption, mark = null, mf = true, tc = true } = {}) {
  const curves = [{ fn: YANG_EXPR, domain: [0.6, r4(TC_SQUARE - 1e-4)], color: 'gold', width: 2.4, label: 'exact (Yang)', labelAt: 1.2, labelDy: -10 }, { fn: '0', domain: [r4(TC_SQUARE), 5], color: 'gold', width: 2.4 }];
  const points = [];
  if (mf) {
    const pts = [];
    for (let x = 0.6; x < 4; x += 0.1) pts.push([r4(x), r4(mfM(x))]);
    curves.push({ fn: `0`, domain: [4, 5], color: 'ink3', dash: true });
    // the mean-field curve as straight pieces through computed points
    for (let i = 0; i + 1 < pts.length; i++) curves.push({ fn: `${pts[i][1]} + (${r4((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]))})*(x - ${pts[i][0]})`, domain: [pts[i][0], pts[i + 1][0]], color: 'ink3', dash: true });
    curves.push({ fn: `${pts[pts.length - 1][1]}*sqrt(max(0, (4 - x)/(4 - ${pts[pts.length - 1][0]})))`, domain: [pts[pts.length - 1][0], 4], color: 'ink3', dash: true });
    points.push({ x: 3.2, y: 0.78, r: 0.01, color: 'ink3', label: 'mean field' });
  }
  if (mark !== null) points.push({ x: r4(mark), y: r4(yang(mark)), r: 5, color: 'accent' });
  return { type: 'graph', params: { x: [0, 5], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / J', ylabel: '|m|', curves, points, vlines: tc ? [{ x: r4(TC_SQUARE), color: 'ink4', label: 'T(c)' }] : [] }, caption };
}

export default lesson({
  id: 'phys3700.T8.1',
  title: 'The Ising model',
  minutes: 18, difficulty: 3,
  intro: t`Everything so far in this course has been made of particles that ignore each other. The **Ising model** is the simplest system where they do not: a lattice of spins, each up ($s_i = +1$) or down ($s_i = -1$), where every pair of nearest neighbours has a lower energy when the two agree:

$$E = -J\sum_{\langle ij\rangle} s_i s_j \;-\; h\sum_i s_i .$$

At high temperature entropy wins and the spins point every which way; at low temperature energy wins and they line up into a magnet. Somewhere between is a **phase transition**, at a sharp critical temperature $T_c$. No mean-field shortcut gets that temperature right: for the square lattice it took Lars Onsager’s exact solution (1944) to find $kT_c = 2J/\ln(1 + \sqrt2) = 2.269\,J$.`,
  symbols: [
    { tex: 'E', text: 'the energy of one configuration of all the spins, in J (or meV)' },
    { tex: 's_i', text: 'spin $i$: $+1$ (up) or $-1$ (down) — a two-state system, as in the paramagnet of [T3.2](#/lesson/phys3700.T3.2)' },
    { tex: 'J', text: 'the coupling: the energy a bond saves when its two spins agree (and costs when they disagree), in J or meV; $J > 0$ is a ferromagnet' },
    { tex: '\\langle ij\\rangle', text: 'the sum runs over nearest-neighbour pairs, each bond counted **once**' },
    { tex: 'h', text: 'an outside field, as an energy per spin ($h = \\mu B$ for a magnetic moment $\\mu$ in a field $B$); zero in most of this lesson' },
  ],
  why: 'The Ising model is the laboratory of phase transitions: magnets, alloys ordering, liquid–gas critical points and lattice gases all share its critical behaviour, and Monte Carlo simulation (the next lesson) was built to study it.',
  visual: {
    type: 'th4-ising',
    title: 'A magnet that melts',
    lead: t`A $48\times48$ lattice with periodic edges, updated live by Metropolis Monte Carlo. Each cell is one spin. Below, the magnetization per spin $m$ against $kT/J$: the gold curve is the exact answer for an infinite lattice, the dashed curve is mean-field theory, and the dots are your measurements. Change the temperature and watch both pictures.`,
    tasks: [
      'At kT/J = 1.5 the lattice stays almost all one colour and the measured |m| sits on the gold curve.',
      'Set kT/J = 2.3, just above Tc: domains of every size appear, merge and break up, and m wanders.',
      'At kT/J = 3.5 the colours are a fine salt-and-pepper mix — yet mean field (dashed) still predicts a magnet.',
    ],
    params: { T: 1.5, L: 48, start: 'cold', panels: ['lattice', 'curve'], mf: true, rate: 20 },
  },
  example: {
    prompt: t`**Mean-field theory.** Replace each spin’s four neighbours on the square lattice by their average, $m$. Find the temperature below which a spontaneous magnetization ($m \ne 0$ with $h = 0$) appears, and compare it with Onsager’s exact $kT_c = 2.269\,J$.`,
    visual: mfPic([2, 5], { caption: 'Graphical solution of m = tanh(4Jm/kT): below kT = 4J the curve starts steeper than the line and crosses it again at a nonzero m (dot); above, only m = 0 survives.' }),
    steps: [
      { label: 'One spin', text: t`Spin $i$ sees its neighbours only through $-J s_i\sum_{\text{nb}} s_j$. Replace each $s_j$ by its average $m$: the spin feels an effective field, $E_i = -s_i\,(zJm + h)$, with $z = 4$ neighbours.` },
      { label: 'Average it', text: t`A two-state system in a field (T6.1): $\bar s_i = \dfrac{e^{\beta(zJm + h)} - e^{-\beta(zJm + h)}}{e^{\beta(zJm + h)} + e^{-\beta(zJm + h)}} = \tanh\bigl(\beta(zJm + h)\bigr)$, with $\beta = 1/kT$.` },
      { label: 'Self-consistency', text: t`Every spin is alike, so $\bar s_i$ must equal the $m$ we assumed: $m = \tanh\bigl(zJm/kT\bigr)$ when $h = 0$. The line $y = m$ and the curve $y = \tanh(zJm/kT)$ always meet at $m = 0$.` },
      { label: 'Where order appears', text: t`Near $m = 0$, $\tanh x \approx x$, so the curve starts with slope $zJ/kT$. A second crossing exists only if that slope exceeds 1: $kT_c^{\text{MF}} = zJ = 4J$.` },
      { label: 'Compare', text: t`Exact: $2.269\,J$. Mean field is $${fmt(4 / TC_SQUARE, 3)}$ times too high — it ignores **fluctuations**: real neighbours are correlated with spin $i$ and with each other, and small flipped clusters destroy order sooner than an average field suggests.` },
    ],
    answer: t`Mean field: $kT_c = zJ = 4J$. Onsager: $kT_c = 2J/\ln(1 + \sqrt2) = 2.269\,J$ — mean field overestimates it by $${fmt(100 * (4 / TC_SQUARE - 1), 2)}\,\%$.`,
  },
  practice: [
    num({
      id: 'chain-energy', difficulty: 1,
      gen(r) {
        const s = Array.from({ length: 8 }, () => (r.bool(0.5) ? 1 : -1)), J = r.pick([1.5, 2, 3, 4]);
        const e = chainE(s), a = (7 - e) / 2;
        return {
          prompt: t`Eight spins sit in a row (an open chain, seven bonds), with coupling $J = ${J}$ meV and no field. What is the energy $E = -J\sum s_is_{i+1}$ of the configuration shown, in meV?`,
          answer: e * J, units: 'meV', tol: { rel: 1e-6, abs: 0.01 },
          errors: apart([{ value: -a * J, feedback: 'Disagreeing pairs count too: each one adds +J.' }, { value: 2 * e * J, feedback: 'Count each bond once: seven bonds for eight spins in a row.' }], e * J),
          hints: ['Go along the row: each neighbouring pair that agrees contributes −J; each pair that disagrees, +J.', t`Here ${a} pair${a === 1 ? '' : 's'} agree${a === 1 ? 's' : ''} and ${7 - a} disagree${7 - a === 1 ? 's' : ''}.`],
          teach: 'The Ising energy is a count of bonds: −J for every agreeing pair, +J for every disagreeing one.',
          explain: t`$E = -J(\text{agreeing} - \text{disagreeing}) = -${J}\,(${a} - ${7 - a})$ meV $= ${fmt(e * J, 3)}$ meV.`,
          visual: chainPic(s, { caption: `Spins up (blue) and down (orange), J = ${J} meV.` }),
        };
      },
    }),
    num({
      id: 'flip-cost', difficulty: 2,
      gen(r) {
        let nbs, sum;
        do { nbs = Array.from({ length: 4 }, () => (r.bool(0.5) ? 1 : -1)); sum = nbs.reduce((a, b) => a + b, 0); } while (sum === 0);
        const c = r.sign(), J = r.pick([1, 2, 5]), dE = 2 * c * sum * J;
        return {
          prompt: t`On a square lattice with $J = ${J}$ meV and no field, the gold spin and its four neighbours are as shown. By how much does the energy change if the gold spin flips? (Give $\Delta E = E_\text{after} - E_\text{before}$ in meV.)`,
          answer: dE, units: 'meV', tol: { rel: 1e-6, abs: 0.01 },
          errors: apart([{ value: c * sum * J, feedback: 'Before, its four bonds contribute −J sᵢ Σ sⱼ; after, +J sᵢ Σ sⱼ. The change is twice that.' }], dE),
          hints: [t`Only the four bonds touching the gold spin change. Before the flip they contribute $-J s_i\sum_\text{nb} s_j$.`, t`After the flip that becomes $+J s_i\sum_\text{nb} s_j$, so $\Delta E = 2Js_i\sum_\text{nb}s_j$, with $s_i = ${c > 0 ? '+1' : '-1'}$ and $\sum s_j = ${sum}$.`],
          teach: 'A flip changes only the bonds that touch the spin: ΔE = 2J sᵢ Σ(neighbours) — the number Monte Carlo needs at every step.',
          explain: t`$\Delta E = 2(${J})(${c})(${sum}) = ${dE}$ meV. ${dE > 0 ? 'Flipping costs energy, so it happens only with help from the heat bath.' : 'Flipping releases energy: the spin was fighting its neighbours.'}`,
          visual: crossPic(c, nbs, { caption: 'The gold spin and its four nearest neighbours (up: blue, down: orange). Other spins are farther away and do not interact with it.' }),
        };
      },
    }),
    mcq({
      id: 'no-1d', difficulty: 3,
      prompt: t`Ising solved the one-dimensional chain exactly in 1925: it has **no** phase transition at any $T > 0$. Which argument explains why?`,
      choices: [
        t`One domain wall costs a fixed energy $2J$ but can sit in any of about $N$ places, gaining entropy $k\ln N$; for a long chain $2J - kT\ln N < 0$ at any $T > 0$, so walls always form`,
        t`In one dimension each spin has only two neighbours, so $J$ is too weak`,
        t`A chain cannot have a magnetic field along it`,
        t`Mean-field theory gives $kT_c = 2J$ for $z = 2$, and Ising’s exact solution confirms it`,
      ],
      answer: 0,
      why: { 1: 'A transition would just occur at a lower temperature if J were weaker; the chain has none at all, however strong J is.', 2: 'A field can point along any direction; the absence of order is about entropy, not geometry of fields.', 3: 'That is exactly where mean field fails: it predicts kT(c) = 2J, but the exact solution has no transition. Mean field is worst in low dimensions.' },
      hints: ['Compare the free energy F = U − TS of a fully aligned chain with one that has a single break in it.', t`One break costs $\Delta U = 2J$; there are $N - 1$ places to put it, so $\Delta S = k\ln(N - 1)$.`],
      teach: 'Order survives only if breaking it costs more than the entropy it gains — in 1D a break always pays for itself.',
      explain: t`$\Delta F = 2J - kT\ln N$, negative for any $T > 0$ once $N$ is large enough, so a long chain is always broken into domains and $\langle m\rangle = 0$. In 2D a wall around a domain costs energy proportional to its length, which grows with the domain — Peierls showed (1936) this keeps order alive at low $T$.`,
      visual: chainPic([1, 1, 1, 1, 1, -1, -1, -1, -1, -1], { mark: 4.5, caption: 'One domain wall (▲): a single disagreeing bond costs 2J, and it could sit between any two neighbours.' }),
    }),
    num({
      id: 'mf-tc', difficulty: 2,
      gen(r) {
        const k = r.pick(['honey', 'square', 'tri', 'cubic']), L = LATTICES[k], J = r.pick([1, 1.5, 2, 3]);
        const T = (L.z * J * MEV) / KB, Te = (L.exact * J * MEV) / KB;
        return {
          prompt: t`An Ising ferromagnet on a ${L.name} lattice has $z = ${L.z}$ nearest neighbours per spin and $J = ${J}$ meV. What critical temperature does **mean-field theory** predict, in K?`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: (TC_SQUARE * J * MEV) / KB, feedback: 'That is Onsager’s exact value for the square lattice. The question asks for the mean-field estimate kT(c) = zJ.' }, { value: (J * MEV) / KB, feedback: 'Multiply by the number of neighbours: kT(c) = zJ.' }, { value: (L.z * J) / (KB / 1.602176634e-19), feedback: 'Convert meV to joules (1 meV = 1.602 × 10⁻²² J) before dividing by k.' }], T),
          hints: [t`Mean field: $kT_c = zJ$.`, t`$T_c = zJ/k$ with $J = ${J}\times1.602\times10^{-22}$ J and $k = 1.381\times10^{-23}$ J/K.`],
          teach: 'Mean field gives kT(c) = zJ: more neighbours, a stronger average field, a higher T(c).',
          explain: t`$T_c^{\text{MF}} = ${L.z}(${J}\ \text{meV})/k = ${fmt(T, 3)}$ K. The ${L.how} value is $${fmt(Te, 3)}$ K: mean field is $${fmt(100 * (L.z / L.exact - 1), 2)}\,\%$ high. It does better with more neighbours and in more dimensions, where the average field really is a good stand-in.`,
          visual: { type: 'graph', params: { x: [0, 7], y: [0, 7], aspect: 'wide', axesAt: 'edge', xlabel: 'neighbours z', ylabel: 'kT(c) / J', curves: [{ fn: 'x', domain: [0, 7], color: 'ink3', dash: true, label: 'mean field, zJ', labelAt: 5.6, labelDy: -12 }], points: Object.entries(LATTICES).filter(([kk]) => kk !== k).map(([, LL]) => ({ x: LL.z, y: r4(LL.exact), r: 5, color: 'gold', label: LL.name.replace(' (3D)', ''), labelDx: 8, labelDy: 10 })) }, caption: 'Exact or best-known critical temperatures of other lattices (gold) against the mean-field line kT(c) = zJ.' },
        };
      },
    }),
    num({
      id: 'onsager-K', difficulty: 2,
      gen(r) {
        const J = r.pick([0.5, 1, 1.2, 2, 2.5]), T = (TC_SQUARE * J * MEV) / KB;
        return {
          prompt: t`A two-dimensional square-lattice Ising magnet has $J = ${J}$ meV. Using Onsager’s exact result, at what temperature does it lose its spontaneous magnetization, in K?`,
          answer: T, units: 'K', tol: { rel: 0.005 },
          errors: apart([{ value: (4 * J * MEV) / KB, feedback: 'That is the mean-field estimate 4J/k. Onsager’s exact value is 2J/(k ln(1 + √2)).' }, { value: (2 * J * MEV) / (KB * Math.log10(1 + Math.SQRT2)), feedback: 'ln is the natural logarithm: ln(1 + √2) = 0.8814.' }, { value: (2 * J * MEV) / KB, feedback: 'Divide by ln(1 + √2) = 0.8814.' }], T),
          hints: [t`$kT_c = \dfrac{2J}{\ln(1 + \sqrt2)} = 2.269\,J$.`, t`$J = ${J}$ meV $= ${texNum(J * MEV, 4)}$ J; divide $2.269J$ by $k = 1.380\,649\times10^{-23}$ J/K.`],
          teach: t`Onsager: $kT_c = 2J/\ln(1+\sqrt2) \approx 2.269\,J$ for the square lattice — the first exact phase transition in a model with interactions.`,
          explain: t`$T_c = 2.269\,(${texNum(J * MEV, 4)}\ \text{J})/(1.3806\times10^{-23}\ \text{J/K}) = ${fmt(T, 4)}$ K. At $J = 1$ meV, $T_c$ is about 26 K: magnets with $T_c$ near room temperature need couplings of tens of meV.`,
          visual: curvesPic({ mf: false, caption: 'Yang’s exact magnetization for the infinite square lattice (1952), on a temperature axis in units of J/k.' }),
        };
      },
    }),
    {
      type: 'slider', id: 'mf-wrong-zone', difficulty: 2,
      prompt: t`Mean-field theory and the exact solution disagree about a whole range of temperatures. Set the temperature to one at which **mean field predicts a magnet but the real square-lattice Ising model has none**.`,
      visual: isingPic({ T: 1.5, L: 32, panels: ['curve'], mf: true, tc: false, controls: ['T'], hide: ['avg'] }, 'The exact magnetization of the infinite lattice (gold) and the mean-field curve (dashed). The blue line is your temperature.'),
      param: 'T', answer: [2.35, 3.9],
      instruction: 'Drag the temperature into the range where the two curves disagree about whether there is order, then check.',
      hints: ['Find where the gold curve reaches zero, and where the dashed one does.', t`Exact: zero above $kT/J = 2.27$. Mean field: zero only above $kT/J = 4$.`],
      teach: 'Mean field overestimates T(c): between 2.27 J/k and 4 J/k it predicts order that fluctuations destroy.',
      explain: t`Anywhere between $kT/J = 2.27$ and $4$: there mean field’s average field is strong enough to align a spin, but in reality clusters of flipped spins form and break up so freely that no net magnetization survives.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-yang', difficulty: 3,
      gen(r) {
        const f = r.pick([0.5, 0.7, 0.8, 0.9, 0.95, 0.99]), x = f * TC_SQUARE, m = yang(x);
        return {
          prompt: t`Yang’s exact result for the square-lattice Ising magnetization is $|m| = \bigl[1 - \sinh^{-4}(2J/kT)\bigr]^{1/8}$ below $T_c$. What is $|m|$ at $T = ${f}\,T_c$?`,
          answer: m, tol: { rel: 0.003 },
          errors: apart([{ value: mfM(x), feedback: 'That is the mean-field value. Use Yang’s formula with 2J/kT.' }, { value: (1 - Math.sinh(2 / x) ** -4), feedback: 'Take the eighth root at the end.' }], m),
          hints: [t`$kT/J = ${f}\times2.269 = ${fmt(x, 4)}$, so $2J/kT = ${fmt(2 / x, 4)}$.`, t`$\sinh(${fmt(2 / x, 4)}) = ${fmt(Math.sinh(2 / x), 4)}$; raise to the $-4$, subtract from 1, take the eighth root.`],
          teach: 'The 1/8 power makes the exact magnetization stay large almost up to T(c), then plunge vertically.',
          explain: t`$\sinh(2J/kT) = ${fmt(Math.sinh(2 / x), 4)}$, so $|m| = (1 - ${fmt(Math.sinh(2 / x) ** -4, 4)})^{1/8} = ${fmt(m, 4)}$. The exponent $\beta = 1/8$ is a **critical exponent**, the same for every two-dimensional system in the Ising universality class — mean field gets $\tfrac12$ instead.`,
          visual: curvesPic({ mf: false, caption: 'Yang’s exact magnetization (gold). Its steepness near T(c) comes from the exponent 1/8.' }),
        };
      },
    }),
    num({
      id: 'cp-cri3', difficulty: 3, transfer: true,
      prompt: t`A single atomic layer of chromium triiodide, CrI₃, is a two-dimensional ferromagnet whose spins point almost strictly perpendicular to the layer — close to Ising-like — with Curie temperature $T_c = 45$ K (Huang et al., 2017). Its chromium atoms form a **honeycomb** lattice, for which the exact Ising result is $kT_c = 2J/\ln(2 + \sqrt3)$. Treating it as an ideal honeycomb Ising magnet, what coupling $J$ does that imply, in meV?`,
      answer: (KB * 45) / (TC_HONEY * MEV), units: 'meV', tol: { rel: 0.01 },
      errors: [{ value: (KB * 45) / (TC_SQUARE * MEV), feedback: 'That uses the square-lattice constant 2.269. For the honeycomb, kT(c) = 2J/ln(2 + √3) = 1.519 J.' }, { value: (KB * 45) / (3 * MEV), feedback: 'That is the mean-field estimate kT(c) = zJ with z = 3. Use the exact honeycomb value.' }],
      hints: [t`$2/\ln(2 + \sqrt3) = ${fmt(TC_HONEY, 4)}$, so $J = kT_c/${fmt(TC_HONEY, 4)}$.`, t`$kT_c = (1.3806\times10^{-23})(45)$ J $= ${fmt((KB * 45) / MEV, 4)}$ meV.`],
      teach: 'Measure T(c) and the exact lattice solution turns it into the microscopic coupling J — how 2D magnets are first characterized.',
      explain: t`$kT_c = ${fmt((KB * 45) / MEV, 4)}$ meV, so $J = ${fmt((KB * 45) / MEV, 4)}/${fmt(TC_HONEY, 4)} = ${fmt((KB * 45) / (TC_HONEY * MEV), 3)}$ meV. This is a model estimate: real CrI₃ has a finite anisotropy and a spin of 3/2, and fits to its spin-wave spectrum give couplings of the same order but not the same number. That a single layer orders at all is the Ising lesson: with continuous spin symmetry (Mermin–Wagner) it would not.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / J', ylabel: '|m| (sketch)', curves: [{ fn: `(1 - (x/${r4(TC_HONEY)})^4)^0.125`, domain: [0.4, r4(TC_HONEY - 1e-4)], color: 'violet', width: 2.2, label: 'honeycomb', labelAt: 0.8, labelDy: -10 }, { fn: YANG_EXPR, domain: [0.6, r4(TC_SQUARE - 1e-4)], color: 'gold', width: 2.2, label: 'square', labelAt: 1.9, labelDy: -12 }]}, caption: 'Fewer neighbours, lower T(c): the honeycomb curve is a sketch with the right T(c) and exponent 1/8, the square-lattice curve is Yang’s exact result.' },
    }),
    mcq({
      id: 'cp-why-mf', difficulty: 2,
      prompt: t`Mean field predicts $kT_c = 4J$ for the square lattice; the exact answer is $2.269J$. What does mean field leave out that makes it too high?`,
      choices: [
        'Fluctuations and correlations: neighbours are not independent averages, and flipped clusters break up order sooner',
        'The external field h, which lowers T(c)',
        'Quantum mechanics: real spins are not classical arrows',
        'The energy of the bonds: mean field counts each bond twice',
      ],
      answer: 0,
      why: { 1: 'Both results are for h = 0; a field smears the transition out rather than shifting T(c) down.', 2: 'The Ising model is the same in both treatments; the disagreement is in how it is solved.', 3: 'Mean field counts the bonds correctly: its kT(c) = zJ comes from the slope of tanh, not from double counting.' },
      hints: ['Mean field replaces each neighbour by the average magnetization m. What does that miss near T(c)?'],
      teach: 'Mean field misses fluctuations, so it overestimates order — most badly in low dimensions.',
      explain: 'Near T(c), large correlated clusters of flipped spins form and dissolve. An average field cannot see them, so it predicts that order survives to higher temperature than it really does. In four or more dimensions mean field becomes exact for critical exponents; in one it fails completely.',
      visual: isingPic({ T: 2.3, L: 64, start: 'hot', sweeps: 600, panels: ['lattice'], hide: ['m'] }, 'A 64 × 64 lattice just above Tc after 600 Metropolis sweeps from a random start: clusters of every size, which an average field cannot represent.'),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §8.2', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Onsager, Crystal Statistics I, Phys. Rev. 65, 117 (1944)', url: 'https://doi.org/10.1103/PhysRev.65.117' },
    { label: 'Yang, The Spontaneous Magnetization of a Two-Dimensional Ising Model, Phys. Rev. 85, 808 (1952)', url: 'https://doi.org/10.1103/PhysRev.85.808' },
    { label: 'Houtappel, Order-disorder in hexagonal lattices, Physica 16, 425 (1950)', url: 'https://doi.org/10.1016/0031-8914(50)90130-3' },
    { label: 'Ferrenberg, Xu & Landau, Pushing the limits of Monte Carlo simulations for the three-dimensional Ising model, Phys. Rev. E 97, 043301 (2018)', url: 'https://doi.org/10.1103/PhysRevE.97.043301' },
    { label: 'Huang et al., Layer-dependent ferromagnetism in a van der Waals crystal down to the monolayer limit, Nature 546, 270 (2017)', url: 'https://doi.org/10.1038/nature22391' },
  ],
});
