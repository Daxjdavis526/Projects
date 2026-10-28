// The exclusion principle — identical particles, the antisymmetric
// two-fermion wave function, and Pauli’s rule that no two electrons in an atom
// share (n, l, m_l, m_s). Helium’s ground state (both electrons in 1s, spins
// opposite; the repulsion and a screened estimate against the measured
// 79.0 eV), lithium’s third electron pushed to 2s, Hund’s rule, the exchange
// hole, electrons stacked in a box, and fermion or boson by counting spin-½
// constituents (Planck’s ³He–⁴He dilution cooler). Every number is computed
// here or in model/mp-shells.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { H, ME, QE } from './_constants.js';
import { RYD } from './_quanta.js';
import * as S from '../../src/viz/model/mp-shells.js';
import { IE_SUCCESSIVE, boxDiagram, wellLadder, seg, label, frame, r6 } from './_atoms.js';

const t = String.raw;
const IE = S.ionization;
const HE_TOTAL = IE_SUCCESSIVE.He[0] + IE_SUCCESSIVE.He[1];    // 79.005 eV: both electrons removed
const HE_NAIVE = -2 * 4 * RYD;                                  // two independent electrons in a Z = 2 1s level
const HE_PERT = HE_NAIVE + (5 / 8) * 2 * (2 * RYD);             // with the first-order repulsion (5/8)Z hartree
const ZS = 27 / 16, HE_VAR = -2 * ZS * ZS * RYD;               // the variational (screened) estimate
const LI_ZEFF = 2 * Math.sqrt(IE(3) / RYD);
const E1nm = (L) => (H * H) / (8 * ME * (L * 1e-9) ** 2) / QE;  // eV, the infinite well’s ground level
/** The lowest total energy of N spin-½ fermions in the well, in units of E₁: two per level. */
const fermiTotal = (N) => { let s = 0; for (let k = 0; k < N; k++) s += (Math.floor(k / 2) + 1) ** 2; return s; };
const onePerLevel = (N) => { let s = 0; for (let n = 1; n <= N; n++) s += n * n; return s; };

/** Helium’s energy, four ways, as levels side by side (eV). */
const heliumLevels = (() => {
  const e = (E) => `−${(-E).toFixed(1)} eV`;
  const L = [[HE_NAIVE, 'no repulsion', 'ink3'], [HE_PERT, 'repulsion, first order', 'violet'], [HE_VAR, 'screened: Z(eff) = 27/16', 'accent'], [-HE_TOTAL, 'measured', 'good']];
  return {
    type: 'graph',
    params: {
      x: [0, 10], y: [-118, -62], aspect: 'wide', xlabel: '', xticks: 0, ylabel: 'energy (eV)', axesAt: 'edge', grid: false,
      curves: L.map(([E, , c], i) => seg(0.35 + 2.45 * i, E, 2.25 + 2.45 * i, E, c, 3.4)),
      points: L.flatMap(([E, txt, c], i) => [label(1.3 + 2.45 * i, E, txt, c, 0, -14, 'center'), label(1.3 + 2.45 * i, E, e(E), c, 0, 14, 'center')]),
    },
    caption: 'Helium’s ground-state energy (both electrons bound, relative to a bare nucleus and two distant electrons): three estimates against the measured value, the sum of its two ionization energies (NIST Atomic Spectra Database).',
  };
})();

/** |ψ(x₁, x₂)|² for two particles in a box, in the states n = 1 and n = 2: antisymmetric (s = −1) or symmetric (s = +1). */
const exchangeMap = (s, caption) => ({
  type: 'c3-contour',
  params: {
    f: `step(x)*step(1 - x)*step(y)*step(1 - y)*(sin(pi*x)*sin(2*pi*y) ${s < 0 ? '-' : '+'} sin(2*pi*x)*sin(pi*y))^2`,
    x: [-0.3, 1.3], y: [0, 1], levels: [0.2, 0.6, 1.2, 2, 2.8], labels: false, fill: true, xlabel: 'x₁ / L (electron 1)', ylabel: 'x₂ / L (electron 2)',
    curves: [{ param: ['t', 't'], t: [0, 1], color: 'ink', width: 1.4, dash: true }],
  },
  caption,
});

/** Composite particles as dots: protons (red), neutrons (grey), electrons (blue). */
const composites = (() => {
  const atom = (cx, p, n, e, name) => {
    const pts = [];
    const nuc = [...Array(p).fill('bad'), ...Array(n).fill('ink3')];
    nuc.forEach((c, i) => pts.push({ x: r6(cx + 0.22 * Math.cos((2 * Math.PI * i) / nuc.length)), y: r6(0.22 * Math.sin((2 * Math.PI * i) / nuc.length)), r: 6, color: c }));
    for (let i = 0; i < e; i++) pts.push({ x: r6(cx + 1.05 * Math.cos(Math.PI / 2 + Math.PI * i)), y: r6(1.05 * Math.sin(Math.PI / 2 + Math.PI * i)), r: 4.5, color: 'accent' });
    pts.push(label(cx, -1.55, name, 'ink', 0, 0, 'center'));
    return pts;
  };
  return {
    type: 'graph',
    params: frame([-3.4, 3.4], [-1.9, 1.5], {
      aspect: 'wide',
      curves: [{ param: ['-1.6 + 1.05*cos(t)', '1.05*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }, { param: ['1.6 + 1.05*cos(t)', '1.05*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }],
      points: [...atom(-1.6, 2, 1, 2, 'helium-3'), ...atom(1.6, 2, 2, 2, 'helium-4')],
    }),
    caption: 'Helium-3 and helium-4: protons red, neutrons grey, electrons blue. Not to scale — the nucleus is some 30 000 times smaller than the atom.',
  };
})();

// atoms for Hund’s rule: [Z, the subshell being filled, the core and filled s rows]
const HUND = [6, 7, 8, 14, 15, 16, 22, 23, 25, 26, 27, 28];
function hundRows(Z) {
  const v = S.valence(Z), core = S.coreOf(Z);
  const rows = [{ core: core ? `[${S.symbol(core)}] core` : '' }].filter((r) => r.core);
  for (const s of v) rows.push({ name: S.subshellName(s.n, s.l), count: s.l === 0 ? s.count : null });
  // order bottom-up as they fill: s below p; 4s below 3d
  return rows;
}

export default lesson({
  id: 'phys2710.MP9.1',
  title: 'The exclusion principle',
  minutes: 15, difficulty: 3,
  intro: t`Every electron is exactly like every other: swap two of them and no measurement can tell. So the two-electron wave function can at most change sign when the labels are swapped, $\psi(2,1) = \pm\psi(1,2)$, and nature uses both signs. Particles of half-integer spin — electrons, protons, neutrons — are **fermions** and take the minus sign; particles of integer spin — photons, helium-4 atoms — are **bosons** and take the plus. Two fermions in the one-electron states $a$ and $b$ have only one allowed combination,

$$\psi(1,2) = \frac{1}{\sqrt2}\Big[\psi_a(1)\,\psi_b(2) - \psi_b(1)\,\psi_a(2)\Big]$$

and it vanishes identically if $a = b$. That is Wolfgang Pauli’s **exclusion principle** (1925): no two electrons in an atom share all four quantum numbers $(n, l, m_l, m_s)$. It is why atoms have shells, why the periodic table repeats, and why matter takes up room.

> Spin and the four quantum numbers came in [Angular momentum and spin](#/lesson/phys2710.MP8.3). Here: what happens when an atom has more than one electron.`,
  symbols: [
    { tex: '\\psi(1,2)', text: 'the two-electron wave function; “1” stands for electron 1’s position and spin, “2” for electron 2’s. $|\\psi|^2$ is the probability density of finding one electron at the first place and the other at the second' },
    { tex: '\\psi_a,\\ \\psi_b', text: 'one-electron states, each labelled by a full set of quantum numbers $(n, l, m_l, m_s)$' },
    { tex: '\\tfrac{1}{\\sqrt2}', text: 'normalization: it makes the total probability 1 when $\\psi_a$ and $\\psi_b$ are different, normalized states' },
    { tex: '-', text: 'the minus sign: swapping the labels 1 and 2 turns $\\psi$ into $-\\psi$ — the defining property of fermions' },
    { tex: 'n,\\ l,\\ m_l,\\ m_s', text: 'the principal ($1, 2, 3, \\ldots$), orbital ($0 \\ldots n-1$), magnetic ($-l \\ldots l$) and spin ($\\pm\\tfrac12$) quantum numbers' },
  ],
  why: 'The exclusion principle builds the periodic table, holds white dwarfs and neutron stars up against their own gravity, and sets the Fermi energy that runs every metal and semiconductor.',
  visual: {
    type: 'mp-shells',
    title: 'Building atoms one electron at a time',
    lead: t`Left: the subshells in the order they fill, each orbital a box that holds at most one spin-up and one spin-down electron. Right: every electron’s four quantum numbers, the newest in gold. Below: the energy it takes to pull off the outermost electron (the first ionization energy).`,
    tasks: [
      'Step from helium (Z = 2) to lithium: 1s is full, so the third electron must start n = 2 — and the ionization energy falls from 24.6 eV to 5.4 eV.',
      'Fill 2p from boron to neon: one arrow in each box before any pair (Hund’s rule). Check the list on the right: no two rows are the same.',
      'Stop at neon and count: n = 1 holds 2 electrons and n = 2 holds 8 — each shell holds 2n².',
    ],
    params: { Z: 2, maxZ: 18, panels: ['boxes', 'numbers', 'ie'] },
  },
  example: {
    prompt: t`Helium has two electrons. Estimate its ground-state energy (both electrons bound, relative to the bare nucleus and two distant electrons) by first ignoring the repulsion between the electrons, and compare with experiment: removing them takes ${fmt(IE_SUCCESSIVE.He[0], 4)} eV and then ${fmt(IE_SUCCESSIVE.He[1], 4)} eV. Then place lithium’s third electron.`,
    visual: heliumLevels,
    steps: [
      { label: 'One electron at a time', text: t`Ignore the repulsion and each electron sees the full nuclear charge $Z = 2$, like the one electron of $\text{He}^+$: $E_{1s} = -Z^2(13.6\ \text{eV}) = -54.4$ eV.` },
      { label: 'Two in 1s', text: t`Both may sit in 1s only because they differ in $m_s$: one $+\tfrac12$, one $-\tfrac12$. Their spatial wave function $\psi_{1s}(1)\psi_{1s}(2)$ is symmetric, so the spin state must be the antisymmetric pair — the whole still changes sign under a swap. Total: $2\times(-54.4) = ${fmt(HE_NAIVE, 4)}$ eV.` },
      { label: 'Experiment', text: t`Removing both electrons takes $${fmt(IE_SUCCESSIVE.He[0], 4)} + ${fmt(IE_SUCCESSIVE.He[1], 4)} = ${fmt(HE_TOTAL, 4)}$ eV, so the ground state lies at $-${fmt(HE_TOTAL, 3)}$ eV. The estimate is too deep by ${fmt(-HE_NAIVE - HE_TOTAL, 3)} eV: the repulsion between the electrons is not small. Adding its average value for two 1s electrons, $\tfrac58 Z\times 27.2$ eV $= 34.0$ eV, overshoots the other way, to $${fmt(HE_PERT, 3)}$ eV.` },
      { label: 'Screening', text: t`Each electron partly shields the nucleus from the other. Letting both see an effective charge $Z_\text{eff}$ and choosing the one that gives the lowest energy (the variational method) gives $Z_\text{eff} = \tfrac{27}{16} = ${fmt(ZS, 3)}$ and $E = -2Z_\text{eff}^2(13.6\ \text{eV}) = ${fmt(HE_VAR, 3)}$ eV — within ${fmt((100 * (HE_TOTAL + HE_VAR)) / HE_TOTAL, 2)}% of experiment.` },
      { label: 'The third electron', text: t`Lithium’s third electron cannot join them: $(1, 0, 0, +\tfrac12)$ and $(1, 0, 0, -\tfrac12)$ are taken, and 1s has no other states. It must go to $n = 2$, into 2s, much farther out. Lithium’s ionization energy is only ${fmt(IE(3), 3)} eV.` },
      { label: 'Sense check', text: t`If the two 1s electrons screened perfectly, the 2s electron would see $Z = 1$ and need $13.6/2^2 = 3.40$ eV. It needs ${fmt(IE(3), 3)} eV because the 2s cloud dips inside the 1s core: $Z_\text{eff} = 2\sqrt{${fmt(IE(3), 3)}/13.6} = ${fmt(LI_ZEFF, 3)}$, between 1 and 3 as it must be.` },
    ],
    answer: t`Without repulsion, $${fmt(HE_NAIVE, 4)}$ eV; measured, $-${fmt(HE_TOTAL, 3)}$ eV; screened, $${fmt(HE_VAR, 3)}$ eV. The exclusion principle sends lithium’s third electron to 2s, where it is bound by only ${fmt(IE(3), 3)} eV.`,
  },
  practice: [
    num({
      id: 'capacity', difficulty: 1,
      gen(r) {
        const [kind, n, l] = r.pick([['shell', 2, null], ['shell', 3, null], ['shell', 4, null], ['sub', 3, 2], ['sub', 4, 3], ['sub', 5, 1], ['sub', 4, 2]]);
        const name = l === null ? `the $n = ${n}$ shell` : `the ${n}${'spdf'[l]} subshell`;
        const ans = l === null ? 2 * n * n : 2 * (2 * l + 1);
        const rows = l === null ? Array.from({ length: n }, (_, k) => ({ name: `${n}${'spdf'[k]}`, count: null })) : [{ name: `${n}${'spdf'[l]}`, count: null }];
        return {
          prompt: t`How many electrons can ${name} hold?`,
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: ans / 2, feedback: t`That counts the orbitals (values of $m_l$${l === null ? ' and $l$' : ''}). Each orbital takes two electrons, $m_s = +\tfrac12$ and $-\tfrac12$.` }, ...(l === null ? [{ value: 2 * n, feedback: t`$l$ runs from 0 to $n - 1$, and each $l$ has $2l + 1$ values of $m_l$: count them all.` }] : [{ value: 2 * l, feedback: t`$m_l$ runs from $-l$ to $+l$ including 0: that is $2l + 1$ values.` }])],
          hints: [t`List the allowed $(l, m_l)$, then remember each takes two spins.`, l === null ? t`The $n = ${n}$ shell has $l = 0 \ldots ${n - 1}$; the number of orbitals is $\sum (2l + 1) = n^2$.` : t`$l = ${l}$ has $2l + 1 = ${2 * l + 1}$ orbitals.`],
          teach: 'Each orbital (n, l, mₗ) holds two electrons of opposite spin, so a subshell holds 2(2l + 1) and a shell 2n².',
          explain: l === null ? t`$l = 0, \ldots, ${n - 1}$ give $${Array.from({ length: n }, (_, k) => 2 * k + 1).join(' + ')} = ${n * n}$ orbitals; two spins each makes $2n^2 = ${ans}$.` : t`$${2 * l + 1}$ values of $m_l$ times two values of $m_s$: $2(2l + 1) = ${ans}$.`,
          visual: boxDiagram(rows, { alignMl: true, mlLabels: true, caption: `${l === null ? `The subshells of the n = ${n} shell` : `The ${n}${'spdf'[l]} subshell`}, empty: one box per orbital, in columns of equal mₗ.` }),
        };
      },
    }),
    mcq({
      id: 'third-electron', difficulty: 1,
      prompt: t`Lithium’s first two electrons have quantum numbers $(n, l, m_l, m_s) = (1, 0, 0, +\tfrac12)$ and $(1, 0, 0, -\tfrac12)$. What are the third electron’s in the ground state?`,
      choices: [t`$(2, 0, 0, +\tfrac12)$`, t`$(1, 0, 0, +\tfrac12)$`, t`$(1, 1, 0, +\tfrac12)$`, t`$(2, 1, 0, +\tfrac12)$`],
      answer: 0,
      why: {
        1: 'That set is already taken by the first electron: the exclusion principle forbids a second electron in it.',
        2: t`For $n = 1$ the only orbital is $l = 0$: $l$ runs from 0 to $n - 1$.`,
        3: 'That is allowed (2p), but 2p lies above 2s in a many-electron atom, so it is an excited state.',
      },
      hints: ['1s has room for exactly two electrons, and both places are filled.'],
      teach: 'Once an orbital holds two electrons of opposite spin, the next electron must take the next subshell up.',
      explain: t`With 1s full, the third electron takes the lowest state left: $n = 2$, $l = 0$ (2s), $m_l = 0$, either spin. 2s lies below 2p in lithium because the 2s electron penetrates the 1s core and feels more of the nuclear charge.`,
      visual: boxDiagram([{ name: '1s', count: 2 }, { name: '2s', count: 0 }, { name: '2p', count: 0 }], { caption: 'Lithium’s first two electrons, in 1s with opposite spins. Where does the third go?' }),
    }),
    num({
      id: 'hund', difficulty: 2,
      gen(r) {
        const Z = r.pick(HUND), v = S.valence(Z), last = v.filter((s) => s.l > 0).at(-1);
        const ans = S.unpaired(Z), m = 2 * last.l + 1, sub = S.subshellName(last.n, last.l);
        const pairsFirst = last.count % 2;                       // one pair per orbital, filled in order
        return {
          prompt: t`The ground state of ${S.element(Z).name} is $${S.configTeX(Z)}$. By Hund’s rule, how many of its electrons are unpaired?`,
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: pairsFirst, feedback: t`You paired the electrons first. Hund’s rule puts one electron in each of the ${m} ${sub} orbitals, spins parallel, before any pair forms.` }, { value: last.count, feedback: t`That is the number of ${sub} electrons. Once all ${m} orbitals hold one, the rest pair up.` }].filter((e) => e.value !== ans),
          hints: [t`Only the partly filled ${sub} subshell matters: full subshells are all paired. It has ${m} orbitals.`, t`Place the ${last.count} ${sub} electrons one per orbital first (spins parallel), and pair only when every orbital has one.`],
          teach: 'Hund’s rule: electrons spread over a subshell’s orbitals with parallel spins before any pair up.',
          explain: t`${last.count} electrons in ${m} orbitals: ${last.count <= m ? `each takes its own orbital, so all ${last.count} are unpaired` : `${m} go in singly, the other ${last.count - m} ${last.count - m === 1 ? 'pairs' : 'pair'} up, leaving ${2 * m - last.count} unpaired`}. Parallel spins keep the electrons apart — their spatial wave function is antisymmetric and vanishes where they meet — so they repel less.`,
          visual: boxDiagram(hundRows(Z), { caption: `${S.element(Z).name[0].toUpperCase() + S.element(Z).name.slice(1)}: the full core and s subshell drawn, the ${sub} boxes left for you to fill.` }),
        };
      },
    }),
    mcq({
      id: 'exchange-hole', difficulty: 2,
      prompt: t`Two electrons with the same spin are in a one-dimensional box, one in its $n = 1$ state and one in $n = 2$. The map shows $|\psi(x_1, x_2)|^2$ for the antisymmetric combination: bright where finding electron 1 at $x_1$ and electron 2 at $x_2$ is likely. It is zero all along the dashed diagonal $x_1 = x_2$. What does that mean?`,
      choices: [
        'The two electrons are never found at the same place: the antisymmetric wave function vanishes whenever their coordinates coincide',
        'The electrons repel each other so strongly that they cannot meet',
        'Neither electron can be found at the centre of the box',
        t`The diagonal is a node of the $n = 2$ state`,
      ],
      answer: 0,
      why: {
        1: 'No force went into this map: it is built from the box states alone. The hole comes from the minus sign, not from repulsion.',
        2: t`Each electron alone can be anywhere: the map is bright near $x_1 = 0.5$ wherever $x_2$ is not also 0.5. Only coincidences are forbidden.`,
        3: t`The $n = 2$ state’s node is at $x = L/2$ — a horizontal or vertical line on this map, not the diagonal.`,
      },
      hints: [t`Set $x_1 = x_2 = x$ in $\psi_a(x_1)\psi_b(x_2) - \psi_b(x_1)\psi_a(x_2)$.`],
      teach: 'Antisymmetry alone keeps same-spin fermions apart — the exchange hole — with no force involved.',
      explain: t`At $x_1 = x_2 = x$ the two terms are equal, $\psi_a(x)\psi_b(x) - \psi_b(x)\psi_a(x) = 0$. Same-spin electrons avoid each other, which lowers their repulsion: that is why Hund’s rule favours parallel spins. The symmetric (boson) combination does the opposite and piles up along the diagonal.`,
      visual: exchangeMap(-1, 'The antisymmetric two-electron probability density |ψ(x₁, x₂)|² in a box of width L, states n = 1 and n = 2, brighter for larger values. No repulsion is included.'),
    }),
    num({
      id: 'well-fill', difficulty: 2,
      gen(r) {
        const N = r.int(3, 8), L = r.pick([0.8, 1.0, 1.2]), E1 = E1nm(L);
        const ans = fermiTotal(N) * E1;
        return {
          prompt: t`${N} electrons are trapped in a one-dimensional box ${L.toFixed(1)} nm wide, whose levels are $E_n = n^2E_1$ with $E_1 = ${fmt(E1, 3)}$ eV. Ignoring the repulsion between them, what is their lowest possible total energy, in eV?`,
          answer: ans, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: N * E1, feedback: 'That puts every electron in the lowest level, which only bosons can do. Electrons go two to a level, spins opposite.' }, { value: onePerLevel(N) * E1, feedback: 'That puts one electron per level. Each level holds two: spin up and spin down.' }],
          hints: ['Each level n holds two electrons, one of each spin.', t`Fill from the bottom: the levels $n = 1, 1, 2, 2, 3, 3, \ldots$ until all ${N} electrons are placed, and add $n^2 E_1$ for each.`],
          teach: 'Fermions in a box fill the levels from the bottom, two per level — so their total energy is far above N times the lowest level.',
          explain: t`The electrons take $n = ${Array.from({ length: N }, (_, k) => Math.floor(k / 2) + 1).join(', ')}$, so $E = ${fermiTotal(N)}E_1 = ${fmt(ans, 3)}$ eV — ${fmt(fermiTotal(N) / N, 3)} times what ${N} bosons would need. The top filled level is a first taste of the Fermi energy (lesson MP10.2).`,
          visual: wellLadder(N, { show: false, caption: 'The box’s lowest levels, Eₙ = n²E₁, to scale; the electrons are left for you to place.' }),
        };
      },
    }),
    mcq({
      id: 'li-vs-he', difficulty: 2,
      prompt: t`Lithium’s nucleus has charge $3e$, helium’s $2e$. Yet lithium’s outermost electron is bound by only ${fmt(IE(3), 3)} eV, against helium’s ${fmt(IE(2), 3)} eV. Why?`,
      choices: [
        'The exclusion principle forces lithium’s third electron into n = 2, much farther from the nucleus and screened by the two 1s electrons',
        'Lithium’s nucleus is larger, so its pull on the electrons is spread out and weaker',
        'All three of lithium’s electrons share the 1s orbital, so each is held less tightly',
        'Helium is a noble gas, and noble gases have an extra stability that lithium lacks',
      ],
      answer: 0,
      why: {
        1: 'The size of the nucleus hardly matters: it is some 30 000 times smaller than the atom, and outside it the pull depends only on its charge.',
        2: 'The exclusion principle forbids a third electron in 1s: its two places are taken.',
        3: 'That names the pattern without explaining it. Helium’s stability is its full n = 1 shell; lithium’s weakness is having to start the next one.',
      },
      hints: ['Where must the third electron go, and how much of the nuclear charge does it see from there?'],
      teach: 'A new shell starts far out and behind a screen of inner electrons, so the first electron in it is loosely bound.',
      explain: t`With 1s full, lithium’s third electron sits in 2s, about four times farther out (radii grow as $n^2$), and the two 1s electrons cancel most of the nuclear charge: it feels $Z_\text{eff} \approx ${fmt(LI_ZEFF, 2)}$. Every alkali metal repeats the story at the start of each period.`,
      visual: { type: 'mp-shells', params: { Z: 3, maxZ: 10, panels: ['boxes', 'ie'], controls: false, readout: false }, caption: 'Lithium’s electrons, and the first ionization energies of hydrogen to neon (NIST), lithium marked.' },
    }),
    mcq({
      id: 'if-bosons', difficulty: 3,
      prompt: 'Suppose electrons were bosons, so that any number could share one state. What would the ground state of carbon (six electrons) look like, and what would follow?',
      choices: [
        'All six electrons would crowd into 1s; atoms would shrink as Z grew and lose their shells, and chemistry would no longer repeat from one period to the next',
        'Nothing would change: the electrons’ energies depend on n and l, not on their spin',
        'The electrons would still pair two to an orbital, because their repulsion keeps a third one out',
        'The atom would fly apart, because bosons repel one another',
      ],
      answer: 0,
      why: {
        1: 'The energies do not depend on spin, but the exclusion principle decides which states are available — and that is what changes.',
        2: 'Repulsion raises the energy of crowding but cannot forbid it; the 1s attraction from a charge of 6e wins easily. The limit of two per orbital is the exclusion principle, not repulsion.',
        3: 'Being a boson says nothing about forces; electrons would still be negatively charged and still bound to the nucleus.',
      },
      hints: ['Without exclusion, every electron could take the lowest state.', 'Which features of atoms come from electrons being forced into higher shells: their sizes, their outer electrons, the periodic table?'],
      teach: 'Shell structure — and with it atomic sizes, valence and the periodic table — exists only because electrons are fermions.',
      explain: 'Bosonic electrons would all drop into 1s, ever closer to the nucleus as Z grew. There would be no outer electrons to share or transfer, so no periodic chemistry; and with no exclusion to resist compression, bulk matter would collapse far more than it does (Dyson and Lenard proved in 1967 that the stability of ordinary matter needs electrons to be fermions).',
      visual: boxDiagram([{ name: '1s', count: 2 }, { name: '2s', count: 2 }, { name: '2p', count: 2 }], { caption: 'Real carbon, 1s² 2s² 2p²: the exclusion principle and Hund’s rule at work.' }),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-dilution', difficulty: 2, transfer: true,
      prompt: 'The detectors on ESA’s Planck satellite were cooled to 0.1 K by a dilution refrigerator, which works because helium-3 and helium-4 behave quite differently near absolute zero: one atom is a fermion, the other a boson. A composite particle’s spin is set by how many spin-½ particles (protons, neutrons, electrons) it contains. Which is the fermion?',
      choices: [
        'Helium-3: 2 protons, 1 neutron and 2 electrons make 5 spin-½ particles, an odd number, so its total spin is half-integer',
        'Helium-4: it has more particles, so more spin',
        'Both: an atom made of fermions is a fermion',
        'Neither: whole atoms are always bosons',
      ],
      answer: 0,
      why: {
        1: 'Helium-4 has 2 + 2 + 2 = 6 spin-½ particles: their spins add to a whole number, so it is a boson. What matters is odd or even, not how many.',
        2: 'An even number of half-integer spins adds up to a whole number: helium-4, made only of fermions, is a boson.',
        3: 'Whole atoms with an odd number of spin-½ constituents are fermions: helium-3, lithium-6 and potassium-40 are all used as fermions in laboratories.',
      },
      hints: ['Count protons, neutrons and electrons in each atom. Half-integer spins add to a half-integer total when there is an odd number of them.', 'Helium-3: 2 + 1 + 2. Helium-4: 2 + 2 + 2.'],
      teach: 'A composite of an odd number of fermions is a fermion; of an even number, a boson.',
      explain: 'Helium-3 (5 spin-½ constituents) is a fermion and helium-4 (6) a boson. Below about 0.9 K a mixture of the two liquids separates, and pumping helium-3 atoms across the boundary into the helium-4-rich side absorbs heat — the dilution refrigerator, which kept Planck’s bolometers at 0.1 K.',
      visual: composites,
    }),
    num({
      id: 'cp-ml-count', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5]), ml = r.int(0, Math.min(2, n - 1));
        const ans = 2 * (n - ml);
        return {
          prompt: t`How many electrons in an atom can have both $n = ${n}$ and $m_l = ${ml}$?`,
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n - ml, feedback: t`That counts the orbitals with $m_l = ${ml}$. Each takes two electrons, one of each spin.` }, ...(ml ? [{ value: 2 * n, feedback: t`$m_l = ${ml}$ needs $l \ge ${ml}$: the subshells with smaller $l$ have no such orbital.` }] : []), { value: 2 * n * n, feedback: t`That is the whole $n = ${n}$ shell. Only the orbitals with $m_l = ${ml}$ count.` }].filter((e) => e.value !== ans),
          hints: [t`$m_l = ${ml}$ is possible only in subshells with $l \ge ${ml}$, and $l \le ${n - 1}$.`, t`Each such subshell has exactly one orbital with $m_l = ${ml}$, holding two electrons.`],
          teach: 'Count the allowed (l, mₗ) pairs first, then double for spin.',
          explain: t`The subshells $l = ${Array.from({ length: n - ml }, (_, k) => ml + k).join(', ')}$ each have one orbital with $m_l = ${ml}$: that is ${n - ml} orbitals, and two spins each gives ${ans} electrons.`,
          visual: boxDiagram(Array.from({ length: n > 4 ? 4 : n }, (_, k) => ({ name: `${n}${'spdf'[k]}`, count: null })), { alignMl: true, mlLabels: true, caption: `The subshells of the n = ${n} shell${n > 4 ? ' up to 5f (5g, with 9 orbitals, is not drawn)' : ''}, each box one orbital, in columns of equal mₗ.` }),
        };
      },
    }),
    num({
      id: 'cp-pauli-energy', difficulty: 3,
      gen(r) {
        const N = r.int(4, 8), L = r.pick([0.5, 1.0, 2.0]), E1 = E1nm(L);
        const ans = (fermiTotal(N) - N) * E1;
        return {
          prompt: t`$N = ${N}$ particles with the electron’s mass are trapped in a one-dimensional box ${L.toFixed(1)} nm wide ($E_1 = ${fmt(E1, 3)}$ eV), with no forces between them. How much more is their lowest total energy if they are spin-½ fermions than if they are bosons, in eV?`,
          answer: ans, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: fermiTotal(N) * E1, feedback: 'That is the fermions’ whole energy. Subtract what the bosons need.' }, { value: (onePerLevel(N) - N) * E1, feedback: 'Spin-½ fermions take two to a level, not one.' }],
          hints: ['Bosons can all sit in n = 1. Fermions fill the levels two at a time.', t`The difference is $E_1\left(\sum n_k^2 - N\right)$, with the fermions’ levels $n_k = 1, 1, 2, 2, 3, \ldots$`],
          teach: 'The exclusion principle alone costs energy: fermions must climb the ladder even with no forces between them — the origin of degeneracy pressure.',
          explain: t`Fermions: $${fermiTotal(N)}E_1$; bosons: $${N}E_1$. The difference, $${fermiTotal(N) - N}E_1 = ${fmt(ans, 3)}$ eV, is pure exclusion energy. Squeeze the box and it grows as $1/L^2$: the fermions push back. That push, for electrons in a white dwarf or neutrons in a neutron star, holds the star up (lesson MP10.2).`,
          visual: wellLadder(N, { kind: 'boson', caption: `${N} bosons, all in the lowest level of the box. Where would ${N} electrons go?` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Pauli (1925), Über den Zusammenhang des Abschlusses der Elektronengruppen im Atom mit der Komplexstruktur der Spektren, Z. Phys. 31, 765', url: 'https://doi.org/10.1007/BF02980631' },
    { label: 'OpenStax University Physics Vol. 3, §8.5 The exclusion principle and the periodic table', url: 'https://openstax.org/books/university-physics-volume-3/pages/8-5-the-exclusion-principle-and-the-periodic-table' },
    { label: 'NIST Atomic Spectra Database: ground states and ionization energies', url: 'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html' },
    { label: 'Dyson & Lenard (1967), Stability of matter. I, J. Math. Phys. 8, 423', url: 'https://doi.org/10.1063/1.1705209' },
    { label: 'ESA: Planck’s High Frequency Instrument and its 0.1 K dilution cooler', url: 'https://www.esa.int/Science_Exploration/Space_Science/Planck' },
  ],
});
