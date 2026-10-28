// Fine structure of hydrogen (Griffiths & Schroeter §7.3). Two corrections of
// order α² to the Bohr levels: the relativistic kinetic energy −p⁴/8m³c²
// (computed with ⟨1/r⟩ and ⟨1/r²⟩) and spin–orbit coupling (with the Thomas
// half), plus the Darwin term for s states; together
// E¹ = (Eₙ²/2mc²)(3 − 4n/(j + ½)), which depends on j alone — 2S½ and 2P½
// stay degenerate. α is computed from e, ħ, c and ε₀ (CODATA 2022) and agrees
// with √(2hR∞/mₑc) to 10⁻¹². n = 2: 2P3/2 − 2P½ = 10.949 GHz at first order;
// × (1 + 2aₑ) for the anomalous moment and ÷ (1 + mₑ/mₚ) for the reduced
// mass gives 10.9687 GHz against the measured 10 969.0 MHz (Hagley & Pipkin's
// 9911.2 MHz plus the Lamb shift). The Lamb shift itself (≈ 1057.8 MHz, Lamb &
// Retherford 1947) is QED and is quoted, not computed. Code: the exact Dirac
// energies against Bohr + fine structure. Transfer: the Lyman-α doublets of
// hydrogen-like ions in X-ray astronomy (Z⁴ scaling). phys2710 mentions fine
// structure only as "parts in 10⁵"; nothing is repeated.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, QE, C, seg, label, r6 } from './_qm.js';
import { ALPHA, RYD_EV, MEC2_EV, LAMB_2S_HZ, fsUnit, fsShift, relShift } from './_pert.js';
import { MP_ME } from '../phys2710/_constants.js';

const t = String.raw;
const AE = 1.15965218059e-3;                         // electron magnetic-moment anomaly (CODATA 2022)
const GHZ = (eV) => (eV * QE) / H / 1e9;
const UEV = 1e6;
const SPLIT2 = fsShift(2, 1.5) - fsShift(2, 0.5);    // eV, 2P3/2 − 2P½ at first order
const SPLIT2_CORR = GHZ(SPLIT2) * (1 + 2 * AE) / (1 + 1 / MP_ME);
const LAMB_UEV = (H * LAMB_2S_HZ) / QE * UEV;
const LJ = ['S', 'P', 'D', 'F'];
const jtxt = (j) => `${2 * j}/2`;

/**
 * Hydrogen's level n in columns: Bohr, + relativistic (by l), + spin–orbit
 * and Darwin (by j), and for n = 2 + the Lamb shift. ns: which n to draw
 * (each shown while the choice key `n` equals it, if there is a choice).
 */
function levelsPic({ ns = [2], choice = false, qed = true, caption, numbers = true, upto = 4 }) {
  const curves = [], points = [];
  const col = [[0.15, 0.95], [1.45, 2.25], [2.75, 3.55], [4.05, 4.85]];
  for (const n of ns) {
    const when = choice ? `step(0.5 - abs(n - ${n}))` : undefined;
    const S = (x0, y0, x1, y1, color, width, dash) => ({ ...seg(x0, y0, x1, y1, color, width, dash), ...(when ? { when } : {}) });
    const L = (x, y, text, color, dx, dy, al) => ({ ...label(x, y, text, color, dx, dy, al), ...(when ? { when } : {}) });
    curves.push(S(col[0][0], 0, col[0][1], 0, 'ink2', 3));
    points.push(L(col[0][0], 0, `n = ${n}`, 'ink2', 0, -12));
    for (let l = 0; l < n; l++) {
      const yr = relShift(n, l) * UEV;
      curves.push(S(col[0][1], 0, col[1][0], yr, 'ink4', 1, [3, 4]), S(col[1][0], yr, col[1][1], yr, 'accent', 3));
      points.push(L(col[1][1], yr, `${n}${LJ[l].toLowerCase()}`, 'accent', 5, 0));
      if (upto >= 3) for (const j of [l - 0.5, l + 0.5].filter((jj) => jj > 0)) curves.push(S(col[1][1], yr, col[2][0], fsShift(n, j) * UEV, 'ink4', 1, [3, 4]));
    }
    for (let j = 0.5; j < n && upto >= 3; j++) {
      const y = fsShift(n, j) * UEV;
      curves.push(S(col[2][0], y, col[2][1], y, 'gold', 3));
      points.push(L(col[2][1], y, `j = ${jtxt(j)}`, 'gold', 5, 0));
      if (qed && upto >= 4 && n === 2) {
        if (j === 0.5) {
          curves.push(S(col[2][1], y, col[3][0], y + LAMB_UEV, 'ink4', 1, [3, 4]), S(col[3][0], y + LAMB_UEV, col[3][1], y + LAMB_UEV, 'violet', 3));
          curves.push(S(col[2][1], y, col[3][0], y, 'ink4', 1, [3, 4]), S(col[3][0], y, col[3][1], y, 'violet', 3));
          points.push(L(col[3][1], y + LAMB_UEV, '2S1/2', 'violet', 5, -6), L(col[3][1], y, '2P1/2', 'violet', 5, 7));
        } else {
          curves.push(S(col[2][1], y, col[3][0], y, 'ink4', 1, [3, 4]), S(col[3][0], y, col[3][1], y, 'violet', 3));
          points.push(L(col[3][1], y, '2P3/2', 'violet', 5, 0));
        }
      }
    }
  }
  const ymin = Math.min(...ns.map((n) => relShift(n, 0) * UEV));
  const heads = ['Bohr', '+ rel.', '+ s–o', ...(qed ? ['+ Lamb'] : [])].slice(0, upto);
  heads.forEach((h, k) => points.push(label((col[k][0] + col[k][1]) / 2, -ymin * 0.1, h, 'ink3', 0, 0, 'center')));
  return {
    type: 'graph',
    params: {
      x: [0, qed ? 5.7 : 4.4], y: [r6(ymin * 1.08), r6(-ymin * 0.16)], aspect: 'wide', xlabel: '', ylabel: 'shift from Bohr level (μeV)', axesAt: 'edge', xticks: 0, yticks: numbers ? 5 : 0,
      ...(choice ? { choices: [{ key: 'n', label: t`Level $n$`, options: ns.map((n) => [n, `n = ${n}`]), value: ns[0], explain: 'Which hydrogen level to take apart. Each column adds one correction.' }] } : {}),
      curves, points,
    },
    caption,
  };
}

/** Two levels, labelled, with an unlabelled gap. */
const pairPic = (lo, hi, caption) => ({
  type: 'graph',
  params: {
    x: [0, 3], y: [-0.6, 1.6], aspect: 'wide', xlabel: '', ylabel: 'energy', axesAt: 'edge', xticks: 0, yticks: 0,
    curves: [seg(0.5, 0, 1.8, 0, 'accent', 3), seg(0.5, 1, 1.8, 1, 'gold', 3)],
    arrows: [{ from: [1.15, 0.05], to: [1.15, 0.95], color: 'ink3', width: 1.6, label: '?', labelDx: 8, labelDy: 10 }, { from: [1.15, 0.95], to: [1.15, 0.05], color: 'ink3', width: 1.6 }],
    points: [label(1.85, 0, lo, 'accent', 4, 0), label(1.85, 1, hi, 'gold', 4, 0)],
  },
  caption,
});

export default lesson({
  id: 'phys4700.M8.3',
  title: 'Fine structure of hydrogen',
  minutes: 18, difficulty: 3,
  intro: t`Bohr’s levels $E_n = -13.6\ \text{eV}/n^2$ ignore two things the electron does: it moves fast enough for relativity to matter, and its spin magnet feels the proton’s orbit (seen from the electron) as a current loop. Both corrections are about $\alpha^2 \approx 5\times10^{-5}$ of the Bohr energy, and together, at first order,

$$E_{nj} = -\frac{13.6\ \text{eV}}{n^2}\Big[1 + \frac{\alpha^2}{n^2}\Big(\frac{n}{j + \frac12} - \frac34\Big)\Big]$$

The energy depends on $n$ and the total angular momentum $j$ only — not on $l$. Each Bohr level splits into $n$ levels, $j = \tfrac12, \dots, n - \tfrac12$, and pairs such as $2S_{1/2}$ and $2P_{1/2}$ stay degenerate. They are not quite: the **Lamb shift** lifts $2S_{1/2}$ by about 1058 MHz, an effect of quantum electrodynamics that no single-particle Schrödinger or Dirac equation contains.`,
  symbols: [
    { tex: 'E_{nj}', text: t`the energy of hydrogen’s level with principal number $n$ and total angular momentum $j$, including fine structure` },
    { tex: '13.6\\ \\text{eV}', text: t`$hcR_\infty = \tfrac12\alpha^2m_ec^2 = ${fmt(RYD_EV, 9)}$ eV, the Bohr ground-state binding (infinitely heavy nucleus)` },
    { tex: '\\alpha', text: t`the fine-structure constant, $e^2/4\pi\epsilon_0\hbar c = 1/${fmt(1 / ALPHA, 10)}$ (from CODATA 2022 $e$, $\hbar$, $c$, $\epsilon_0$): the electron’s speed in the ground state as a fraction of $c$` },
    { tex: 'n', text: t`the principal quantum number, $1, 2, 3, \dots$` },
    { tex: 'j', text: t`the total angular momentum $\vec J = \vec L + \vec S$: $j = l \pm \tfrac12$ (only $\tfrac12$ for $l = 0$)` },
    { tex: 'l', text: t`the orbital quantum number, $0, \dots, n - 1$ (s, p, d, …); in spectroscopic notation a level is $nL_j$, as in $2P_{3/2}$` },
  ],
  why: 'Fine structure is the first place where relativity and spin show up in an atom’s spectrum; its leftovers — the Lamb shift and the electron’s anomalous moment — launched quantum electrodynamics, the most precisely tested theory in physics.',
  visual: {
    ...levelsPic({ ns: [2, 3], choice: true, caption: t`Columns: Bohr’s level, then + the relativistic correction (rel.), + spin–orbit and Darwin terms (s–o), + the Lamb shift ($n = 2$ only). First-order shifts computed from CODATA 2022 constants with an infinitely heavy proton; the hyperfine structure (under 1 μeV for $n = 2$) is left out. The Lamb shift column uses the measured $2S_{1/2}$–$2P_{1/2}$ interval, about 1057.8 MHz; smaller QED shifts of the other levels, and all of them for $n = 3$, are not drawn.` }),
    title: 'One level, three corrections',
    lead: t`Take hydrogen’s $n = 2$ or $n = 3$ level apart. The relativistic correction lowers every state, the more the smaller its $l$ (low-$l$ orbits dive close to the proton, where the electron is fastest). Spin–orbit coupling then splits each $l$ into $j = l \pm \tfrac12$. Watch the end result: states with the same $j$ land at exactly the same energy.`,
    tasks: [
      'For n = 2, follow 2s and 2p: they start 121 μeV apart after the relativistic step, yet 2S1/2 and 2P1/2 end together.',
      'Switch to n = 3: the shifts shrink about threefold (roughly as 1/n³), and there are three j levels.',
      'Look at the last column for n = 2: the Lamb shift, 4.4 μeV, is what breaks the j-degeneracy — and it is not in this lesson’s theory.',
    ],
  },
  example: {
    prompt: t`Derive the first-order fine structure of hydrogen, then find the $2P_{3/2}$–$2P_{1/2}$ splitting in GHz and compare it with the measured 10 969.0 MHz.`,
    visual: levelsPic({ ns: [2], caption: t`Hydrogen’s $n = 2$ level corrected step by step — relativistic (rel.), spin–orbit and Darwin (s–o), Lamb — from CODATA 2022 constants; the Lamb shift is the measured value. Hyperfine structure (under 1 μeV) not shown.` }),
    steps: [
      { label: 'Relativity', text: t`The kinetic energy is $$\begin{gathered} \sqrt{p^2c^2 + m^2c^4} - mc^2 \\ = \frac{p^2}{2m} - \frac{p^4}{8m^3c^2} + \dots \end{gathered}$$ so $\hat H'_r = -\hat p^4/8m^3c^2$. Write $\hat p^4/4m^2 = (\hat H^0 - V)^2$ and use $\langle1/r\rangle = 1/n^2a$, $\langle1/r^2\rangle = 1/[(l + \tfrac12)n^3a^2]$: $$E_r^1 = -\frac{E_n^2}{2mc^2}\Big(\frac{4n}{l + \frac12} - 3\Big).$$ The level is degenerate, but $\hat H'_r$ commutes with $\hat L^2$ and $\hat L_z$, so the states $|n\,l\,m\rangle$ are already good and the plain expectation value is right.` },
      { label: 'Spin–orbit', text: t`In the electron’s frame the proton circles it, making a field $\propto\vec L$; the electron’s magnetic moment $\propto\vec S$ sits in it. With Thomas’s factor of ½ (the electron’s frame rotates): $\hat H'_{so} = \dfrac{e^2}{8\pi\epsilon_0}\dfrac{\hat{\vec S}\cdot\hat{\vec L}}{m^2c^2r^3}$. It commutes with $\hat J^2$, $\hat L^2$, $\hat S^2$ and $\hat J_z$ but not with $\hat L_z$ or $\hat S_z$: the good states are $|n\,l\,j\,m_j\rangle$, as degenerate perturbation theory demands.` },
      { label: 'Evaluate', text: t`$\hat{\vec S}\cdot\hat{\vec L} = \tfrac12\big[j(j+1) - l(l+1) - \tfrac34\big]\hbar^2$ and $\langle1/r^3\rangle = 1/[l(l + \tfrac12)(l + 1)n^3a^3]$ give $$E_{so}^1 = \frac{E_n^2}{mc^2}\,\frac{n\big[j(j+1) - l(l+1) - \frac34\big]}{l(l + \frac12)(l + 1)}.$$ (For $l = 0$ this is $0/0$; the Darwin term, from the Dirac equation, supplies the right answer there.)` },
      { label: 'Add them', text: t`Put $l = j \mp \tfrac12$: the $l$-dependence cancels exactly, leaving $E_{fs}^1 = \dfrac{E_n^2}{2mc^2}\Big(3 - \dfrac{4n}{j + \frac12}\Big)$. Since $|E_n| = \tfrac12\alpha^2mc^2/n^2$, this is $\alpha^2|E_n|/n^2$ times a number of order 1 — the $\alpha^2$ scaling.` },
      { label: 'Numbers', text: t`From CODATA 2022, $\alpha = 1/${fmt(1 / ALPHA, 10)}$ and $E_2^2/2mc^2 = ${fmt(fsUnit(2) * UEV, 5)}\ \mu$eV. $2P_{1/2}$: $(3 - 8)\times$ that $= ${fmt(fsShift(2, 0.5) * UEV, 4)}\ \mu$eV; $2P_{3/2}$: $(3 - 4)\times$ that $= ${fmt(fsShift(2, 1.5) * UEV, 4)}\ \mu$eV. The splitting is $${fmt(SPLIT2 * UEV, 4)}\ \mu$eV, or $${fmt(GHZ(SPLIT2), 5)}$ GHz.` },
      { label: 'Compare', text: t`Measured: 10 969.0 MHz, so first order is 0.2% low. Most of that is the electron’s anomalous magnetic moment, $a_e = ${fmt(AE, 6)}$ — a QED effect that strengthens spin–orbit coupling by $1 + 2a_e$ — and a small reduced-mass correction: $${fmt(GHZ(SPLIT2), 5)}\times(1 + 2a_e)/(1 + m_e/m_p) = ${fmt(SPLIT2_CORR, 6)}$ GHz. The measured $2S_{1/2}$, meanwhile, sits $${fmt(LAMB_UEV, 3)}\ \mu$eV above $2P_{1/2}$ — the Lamb shift, which Lamb and Retherford found with microwaves in 1947.` },
    ],
    answer: t`$E^1_{fs} = \dfrac{E_n^2}{2mc^2}\big(3 - \tfrac{4n}{j + 1/2}\big)$; for $n = 2$ the $j = \tfrac32$ and $j = \tfrac12$ levels are $${fmt(SPLIT2 * UEV, 4)}\ \mu\text{eV} = ${fmt(GHZ(SPLIT2), 4)}$ GHz apart, within 0.2% of the measured 10.969 GHz.`,
  },
  practice: [
    mcq({
      id: 'count-n3', difficulty: 2,
      prompt: t`Including fine structure (but not the Lamb shift), into how many distinct energies does hydrogen’s $n = 3$ level split?`,
      visual: levelsPic({ ns: [3], qed: false, numbers: false, upto: 2, caption: t`The $n = 3$ level after the relativistic correction (to scale, numbers hidden): one line for each $l$. Spin–orbit coupling comes next.` }),
      choices: ['3: j = ½, 3/2 and 5/2', '5: one for each (l, j) pair', '6: one for each (l, j) pair, with 3S½ separate', '9: one for each orbital state'],
      answer: 0,
      why: {
        1: t`There are five $(l, j)$ pairs — $3S_{1/2}, 3P_{1/2}, 3P_{3/2}, 3D_{3/2}, 3D_{5/2}$ — but the energy depends only on $j$, so pairs with the same $j$ coincide.`,
        2: t`There are only five $(l, j)$ pairs at $n = 3$, and they share energies by $j$.`,
        3: t`The 9 orbital states (18 with spin) are the degeneracy of the Bohr level; fine structure groups them by $j$.`,
      },
      hints: [t`At first order the energy depends on $n$ and $j$ only.`, t`For $n = 3$, $l$ runs from 0 to 2, so $j$ runs from $\tfrac12$ to $\tfrac52$.`],
      teach: 'Fine structure depends on n and j only: level n splits into n energies, j = ½ … n − ½.',
      explain: t`$j = \tfrac12$ ($3S_{1/2}$ and $3P_{1/2}$), $j = \tfrac32$ ($3P_{3/2}$ and $3D_{3/2}$) and $j = \tfrac52$ ($3D_{5/2}$): three levels. This $l$-degeneracy at fixed $j$ survives even in the exact Dirac equation; only QED (the Lamb shift) splits it.`,
    }),
    num({
      id: 'split-nl', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]), l = r.int(1, n - 1);
        const dE = fsShift(n, l + 0.5) - fsShift(n, l - 0.5), ans = GHZ(dE);
        const lo = `${n}${LJ[l]}${jtxt(l - 0.5)}`, hi = `${n}${LJ[l]}${jtxt(l + 0.5)}`;
        return {
          prompt: t`Using $E^1_{fs} = \dfrac{E_n^2}{2mc^2}\Big(3 - \dfrac{4n}{j + \frac12}\Big)$, with $E_n^2/2mc^2 = \alpha^2(13.6\ \text{eV})/4n^4$ and $\alpha = 1/${fmt(1 / ALPHA, 7)}$, what is the splitting between hydrogen’s $${n}${LJ[l]}_{${2 * l + 1}/2}$ and $${n}${LJ[l]}_{${2 * l - 1}/2}$ levels, as a frequency in GHz? (Take $13.6\ \text{eV} = ${fmt(RYD_EV, 7)}$ eV.)`,
          visual: pairPic(lo, hi, t`The two levels with $l = ${l}$ in $n = ${n}$; the higher $j$ lies higher. Spacing not to scale.`),
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: GHZ(dE) * 2 * Math.PI, feedback: t`Divide the energy by $h$, not $\hbar$, for a frequency in Hz.` }, { value: GHZ(fsShift(n, l + 0.5)), feedback: 'That is one level’s shift from the Bohr energy; the splitting is the difference of the two shifts.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$j + \tfrac12 = l + 1$ for the upper level and $l$ for the lower one, so the difference is $\dfrac{E_n^2}{2mc^2}\cdot4n\Big(\dfrac1l - \dfrac1{l + 1}\Big)$.`, t`$\dfrac{E_n^2}{2mc^2} = ${fmt(fsUnit(n) * UEV, 4)}\ \mu$eV here; convert with $h = ${tex(H / QE, 6)}$ eV s.`],
          teach: 'Spin–orbit splits each l into j = l ± ½, and the gap shrinks fast with n and l.',
          explain: t`$\Delta E = \dfrac{E_n^2}{2mc^2}\cdot\dfrac{4n}{l(l + 1)} = ${fmt(dE * UEV, 4)}\ \mu$eV, so $\nu = \Delta E/h = ${fmt(ans, 4)}$ GHz. It scales as $1/n^3$ and as $1/l(l + 1)$: the largest splitting in hydrogen is $2P$’s, 10.9 GHz.`,
        };
      },
    }),
    num({
      id: 's-shift', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]);
        const ans = fsShift(n, 0.5) * UEV, rel = relShift(n, 0) * UEV;
        return {
          prompt: t`By how much, in μeV, does fine structure shift hydrogen’s $${n}S_{1/2}$ level away from its Bohr energy? (A negative answer means it moves down. $E_n^2/2mc^2 = ${fmt(fsUnit(n) * UEV, 5)}\ \mu$eV for $n = ${n}$.)`,
          visual: { type: 'graph', params: { x: [0, 3], y: [r6(rel * 1.15), r6(-rel * 0.2)], aspect: 'wide', xlabel: '', ylabel: 'shift (μeV)', axesAt: 'edge', xticks: 0, yticks: 0, curves: [seg(0.3, 0, 1.2, 0, 'ink2', 3), seg(1.8, rel, 2.7, rel, 'accent', 3), seg(1.2, 0, 1.8, rel, 'ink4', 1, [3, 4])], points: [label(0.75, 0, 'Bohr', 'ink2', 0, -12, 'center'), label(2.25, rel, 'relativistic only', 'accent', 0, 14, 'center')] }, caption: t`The Bohr level and where the relativistic correction alone would put $${n}S_{1/2}$ (to scale, unlabelled). The Darwin term, which acts only on s states, moves it back up part of the way.` },
          answer: ans, units: 'μeV', tol: { rel: 0.005 },
          errors: [{ value: rel, feedback: t`That is the relativistic term alone. For s states the Darwin term, $+4n\,E_n^2/2mc^2$, also contributes; the combined formula with $j = \tfrac12$ includes it.` }, { value: -ans, feedback: t`The sign: $3 - 4n/(j + \tfrac12) = 3 - 4n$ is negative, so fine structure lowers every level.` }],
          hints: [t`For $S_{1/2}$, $j = \tfrac12$, so $j + \tfrac12 = 1$.`, t`$E^1_{fs} = \dfrac{E_n^2}{2mc^2}(3 - 4n)$ with $n = ${n}$.`],
          teach: 'Fine structure always lowers a level, most for small n and small j.',
          explain: t`$E^1_{fs} = ${fmt(fsUnit(n) * UEV, 5)}\times(3 - ${4 * n}) = ${fmt(ans, 4)}\ \mu$eV. ${n === 1 ? t`That is $-\alpha^4m_ec^2/8$: hydrogen’s ground state is bound $${fmt(-ans, 3)}\ \mu$eV more tightly than Bohr says — a part in $${fmt(RYD_EV / (-ans / UEV), 3)}$.` : t`Bohr’s energy is $${fmt(RYD_EV / (n * n), 4)}$ eV, so this is a part in $${fmt(RYD_EV / (n * n) / (-ans / UEV), 3)}$.`}`,
        };
      },
    }),
    mcq({
      id: 'lamb', difficulty: 2,
      prompt: t`The measured $2S_{1/2}$ level of hydrogen lies about 1058 MHz above $2P_{1/2}$, though fine structure says they coincide. What is responsible?`,
      visual: levelsPic({ ns: [2], numbers: false, caption: 'The n = 2 level with the measured 2S½–2P½ gap in the last column (to scale, numbers hidden).' }),
      choices: [
        'Quantum electrodynamics: the electron’s interaction with the quantized electromagnetic field (self-energy and vacuum polarization)',
        'Spin–orbit coupling, which this calculation treated only to first order',
        'The relativistic correction, which depends on l',
        'The hyperfine interaction with the proton’s magnetic moment',
      ],
      answer: 0,
      why: {
        1: t`Even the exact Dirac equation — every order of spin–orbit and relativity — keeps $2S_{1/2}$ and $2P_{1/2}$ degenerate. The splitting needs the quantized field.`,
        2: t`It does depend on $l$, but combined with spin–orbit and Darwin terms the total depends on $j$ only: that is the whole point of the first-order result.`,
        3: t`Hyperfine structure splits each level by its total angular momentum $F$ (a 178 MHz splitting for 2S); it shifts both 2S and 2P by tiny amounts and does not produce the 1058 MHz.`,
      },
      hints: [t`Would solving the Dirac equation exactly split the two? (It would not.)`],
      teach: 'The Lamb shift is a QED effect: the vacuum’s fluctuating field jiggles the electron, which matters most for s states that reach the nucleus.',
      explain: t`Lamb and Retherford measured it in 1947 by driving 2S → 2P with microwaves. Bethe explained most of it within days as the electron’s self-energy in the quantized field — the start of modern QED. The fluctuations smear the electron over about $10^{-13}$ m, and only s states, which have probability at the proton, feel the smeared Coulomb potential appreciably.`,
    }),
    num({
      id: 'ion-z4', difficulty: 3,
      gen(r) {
        const [Z, name] = r.pick([[2, 'helium (He⁺)'], [3, 'lithium (Li²⁺)'], [4, 'beryllium (Be³⁺)'], [6, 'carbon (C⁵⁺)']]);
        const dE = fsShift(2, 1.5, Z) - fsShift(2, 0.5, Z), ans = GHZ(dE);
        return {
          prompt: t`A hydrogen-like ion — one electron bound to a nucleus of charge $Ze$ — has $E_n = -Z^2(13.6\ \text{eV})/n^2$, and its fine structure scales as $Z^4$. Hydrogen’s $2P_{3/2}$–$2P_{1/2}$ splitting is $${fmt(GHZ(SPLIT2), 5)}$ GHz at first order. What is it for ${name}, $Z = ${Z}$, in GHz?`,
          visual: { type: 'graph', params: { x: [0.5, 6.5], y: [0, 4], aspect: 'wide', xlabel: 'nuclear charge Z', ylabel: 'log₁₀(splitting / hydrogen’s)', axesAt: 'edge', xticks: 6, yticks: 4, curves: [{ fn: '4*log(x)', color: 'accent', width: 2.2, domain: [1, 6.5] }], points: [{ x: 1, y: 0, r: 5, color: 'gold', label: 'H', labelDx: 6, labelDy: -10 }] }, caption: 'The Z⁴ law on a log scale, relative to hydrogen; first-order theory, which loses accuracy as Zα grows.' },
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: GHZ(SPLIT2) * Z * Z, feedback: t`Bohr energies scale as $Z^2$, but fine structure is $\alpha^2|E_n|/n^2$ with each $\alpha$ effectively $Z\alpha$: $Z^4$.` }, { value: GHZ(SPLIT2) * Z ** 3, feedback: t`It is $Z^4$: $E_n^2$ brings $Z^4$ and nothing divides it back.` }],
          hints: [t`$E^1_{fs} \propto E_n^2/mc^2$, and $E_n \propto Z^2$.`, t`Multiply $${fmt(GHZ(SPLIT2), 5)}$ GHz by $Z^4 = ${Z ** 4}$.`],
          teach: 'Fine structure grows as Z⁴ along the hydrogen-like sequence: the inner electron moves at about Zα times c.',
          explain: t`$${fmt(GHZ(SPLIT2), 5)}\times${Z}^4 = ${fmt(ans, 4)}$ GHz. The electron’s speed is about $Z\alpha c$, so relativistic corrections grow as $(Z\alpha)^2$ relative to energies that already grow as $Z^2$. By uranium ($Z\alpha \approx 0.67$) first order fails and the full Dirac solution is needed.`,
        };
      },
    }),
    mcq({
      id: 'why-alpha2', difficulty: 2,
      prompt: t`Why are fine-structure corrections smaller than the Bohr energy by a factor of order $\alpha^2 \approx ${tex(ALPHA * ALPHA, 2)}$?`,
      visual: { type: 'graph', params: { x: [0.5, 5.5], y: [0, 0.009], aspect: 'wide', xlabel: 'n', ylabel: 'v / c in Bohr’s orbit', axesAt: 'edge', xticks: 5, yticks: 3, curves: [{ fn: `${r6(ALPHA)}/x`, color: 'ink3', width: 1.4, dash: [4, 4], domain: [0.8, 5.5] }], points: [1, 2, 3, 4, 5].map((n) => ({ x: n, y: r6(ALPHA / n), r: 5, color: 'gold' })) }, caption: 'The electron’s speed in Bohr’s orbits as a fraction of c: α/n.' },
      choices: [
        t`The electron moves at $v \approx \alpha c/n$, and relativistic effects — including spin–orbit, itself a relativistic effect — scale as $(v/c)^2$`,
        t`Because $\alpha$ is the ratio of the proton’s mass to the electron’s`,
        t`Because spin is a quantum effect, suppressed by $\hbar^2$`,
        t`Because $\alpha^2$ is the probability that the electron is found at the nucleus`,
      ],
      answer: 0,
      why: {
        1: t`$m_p/m_e \approx 1836$; $\alpha = e^2/4\pi\epsilon_0\hbar c \approx 1/137$ has nothing to do with the proton.`,
        2: t`$\hbar$ is not small in an atom — the Bohr energy is built from it. The small parameter is $v/c$.`,
        3: t`That probability is set by the Bohr radius, not by $\alpha^2$, and it matters only for the Darwin and Lamb corrections to s states.`,
      },
      hints: [t`What is the electron’s speed in the ground state, as a fraction of $c$?`],
      teach: 'Fine structure is relativity in the atom: corrections of order (v/c)², with v/c = α/n.',
      explain: t`In Bohr’s orbit $v/c = \alpha/n$, so corrections of order $(v/c)^2$ are $\alpha^2/n^2$ of the kinetic energy, which is $|E_n|$. That is why $\alpha$ got its name, “fine-structure constant”: Sommerfeld introduced it in 1916 to describe exactly these splittings.`,
    }),
    code({
      id: 'dirac', difficulty: 3,
      prompt: t`The Dirac equation solves hydrogen exactly (for an infinitely heavy proton, without QED): $$E_{nj} = mc^2\Big[1 + \Big(\frac{\alpha}{n - (j + \frac12) + \sqrt{(j + \frac12)^2 - \alpha^2}}\Big)^2\Big]^{-1/2}.$$ Write \`dirac(n, j)\` returning $E_{nj} - mc^2$ in eV, and \`approx(n, j)\` returning Bohr plus first-order fine structure, $-\dfrac{R}{n^2} + \dfrac{R\alpha^2}{4n^4}\Big(3 - \dfrac{4n}{j + \frac12}\Big)$, with $R = \tfrac12\alpha^2mc^2$. Use the constants given.`,
      starter: t`from math import sqrt

alpha = ${ALPHA}
mc2 = ${MEC2_EV}      # eV
R = 0.5 * alpha**2 * mc2       # eV

def dirac(n, j):
    pass

def approx(n, j):
    pass

for n, j in [(1, 0.5), (2, 0.5), (2, 1.5)]:
    print(n, j, dirac(n, j), approx(n, j))
`,
      answer: t`from math import sqrt

alpha = ${ALPHA}
mc2 = ${MEC2_EV}      # eV
R = 0.5 * alpha**2 * mc2       # eV

def dirac(n, j):
    k = j + 0.5
    d = n - k + sqrt(k**2 - alpha**2)
    return mc2 * ((1 + (alpha / d)**2) ** -0.5 - 1)

def approx(n, j):
    return -R / n**2 + R * alpha**2 / (4 * n**4) * (3 - 4 * n / (j + 0.5))

for n, j in [(1, 0.5), (2, 0.5), (2, 1.5)]:
    print(n, j, dirac(n, j), approx(n, j))
`,
      tests: [
        { name: t`the Dirac ground state is $-13.6057$ eV less $0.18$ meV`, code: `abs(dirac(1, 0.5) - (${-RYD_EV + fsShift(1, 0.5)})) < 1e-6` },
        { name: t`Dirac: the $n = 2$ splitting between $j = \tfrac32$ and $j = \tfrac12$ is $${fmt(SPLIT2 * UEV, 4)}\ \mu$eV to within 0.1%`, code: `abs((dirac(2, 1.5) - dirac(2, 0.5)) / ${SPLIT2} - 1) < 1e-3` },
        { name: t`approx agrees with dirac to better than $10^{-8}$ eV for $n = 1$ to $4$ (the next terms are of order $\alpha^6mc^2$)`, code: 'all(abs(dirac(n, j) - approx(n, j)) < 1e-8 for n in range(1, 5) for j in [x + 0.5 for x in range(n)])' },
        { name: t`for each $n$, larger $j$ lies higher, and the exact levels are always below Bohr’s`, code: 'all(dirac(n, j) < dirac(n, j + 1) < -R / n**2 for n in range(2, 5) for j in [x + 0.5 for x in range(n - 1)])' },
      ],
      hints: ['k = j + ½; the denominator is n − k + √(k² − α²).', 'Subtract mc² carefully: compute mc2 * (f − 1) where f is the bracket to the power −½.', 'approx is −R/n² plus (Rα²/4n⁴)(3 − 4n/(j + ½)).'],
      teach: 'First-order perturbation theory reproduces the exact Dirac energies up to terms of order α⁶mc².',
      explain: t`The two agree to a few times $10^{-9}$ eV — the next order, $\alpha^6mc^2 \approx ${tex(ALPHA ** 6 * MEC2_EV, 2)}$ eV, times small numbers. Perturbation theory was not an approximation of convenience here: it captured everything the Dirac equation knows at this order. What neither contains is the Lamb shift.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-xray', difficulty: 3, transfer: true,
      gen(r) {
        const [Z, ion, lam] = r.pick([[6, 'C VI (C⁵⁺)', 3.3736], [8, 'O VIII (O⁷⁺)', 1.8969], [10, 'Ne X (Ne⁹⁺)', 1.2134]]);
        const dE = fsShift(2, 1.5, Z) - fsShift(2, 0.5, Z), ans = dE;
        const Ely = (H * C) / (lam * 1e-9) / QE;
        return {
          prompt: t`X-ray spectrometers on satellites such as Chandra and XRISM see the Lyman-α lines of hydrogen-like ions in hot gas around stars and in galaxy clusters. Each is a doublet: $2P_{3/2} \to 1S_{1/2}$ and $2P_{1/2} \to 1S_{1/2}$. For ${ion}, $Z = ${Z}$, with the line near $${lam}$ nm ($${fmt(Ely, 4)}$ eV), what is the doublet’s splitting in eV? Hydrogen’s $2P_{3/2}$–$2P_{1/2}$ splitting is $${fmt(SPLIT2 * UEV, 4)}\ \mu$eV at first order.`,
          visual: { type: 'graph', params: { x: [-1, 1], y: [0, 1.15], aspect: 'wide', xlabel: 'photon energy (offset, schematic)', ylabel: 'counts', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: 'exp(-(x - 0.18)^2/0.006) + 0.5*exp(-(x + 0.18)^2/0.006)', color: 'accent', width: 2.4 }], points: [label(0.18, 1, 'Lyα₁ (j = 3/2)', 'accent', 0, -12, 'center'), label(-0.18, 0.5, 'Lyα₂ (j = 1/2)', 'accent', 0, -12, 'center')] }, caption: 'A resolved Lyman-α doublet, schematic: the j = 3/2 line twice as strong (twice as many states). Widths and separation illustrative.' },
          answer: ans, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: dE / Z ** 2, feedback: t`Fine structure grows as $Z^4$, not $Z^2$.` }, { value: SPLIT2 * Z ** 4 * 1e6, feedback: t`Convert μeV to eV: divide by $10^6$.` }],
          hints: [t`Scale hydrogen’s splitting by $Z^4$.`, t`$${fmt(SPLIT2 * UEV, 4)}\ \mu\text{eV}\times${Z}^4$, then convert to eV.`],
          teach: 'The Z⁴ growth of fine structure turns a 45 μeV splitting in hydrogen into a fraction of an eV in the X-ray lines of highly charged ions.',
          explain: t`$${fmt(SPLIT2 * UEV, 4)}\ \mu\text{eV}\times${Z ** 4} = ${fmt(ans, 3)}$ eV — about one part in $${fmt(Ely / ans, 3)}$ of the line energy. First order is good to about $(Z\alpha)^2 \approx ${fmt((Z * ALPHA) ** 2 * 100, 2)}\%$ here. The spectrometers in orbit — Chandra’s gratings and XRISM’s microcalorimeter, a few eV wide — see each doublet blended into one line, so astronomers fit it with the theoretical splitting and the 2 : 1 ratio of strengths; laboratory spectrometers resolve the two.`,
        };
      },
    }),
    mcq({
      id: 'cp-labels', difficulty: 2,
      prompt: t`Once fine structure is included (but not the Lamb shift or hyperfine structure), which quantum numbers fix the energy of a hydrogen state?`,
      visual: levelsPic({ ns: [3], qed: false, numbers: false, upto: 2, caption: 'The n = 3 level after the relativistic step alone, one line per l (to scale, numbers hidden).' }),
      choices: [t`$n$ and $j$ only`, t`$n$, $l$ and $j$`, t`$n$ and $l$`, t`$n$, $j$ and $m_j$`],
      answer: 0,
      why: {
        1: t`$l$ appears in the relativistic and spin–orbit terms separately, but cancels from their sum.`,
        2: t`At fixed $n$ and $l$ there are two energies, $j = l \pm \tfrac12$.`,
        3: t`Without an external field there is no preferred direction, so the energy cannot depend on $m_j$.`,
      },
      hints: [t`Look at the formula: $E^1_{fs} = \dfrac{E_n^2}{2mc^2}\big(3 - \tfrac{4n}{j + 1/2}\big)$.`],
      teach: 'In hydrogen with fine structure, energy depends on n and j only.',
      explain: t`$E_{nj}$ depends on $n$ and $j$: $l$ drops out, and $m_j$ cannot matter without a field. Good quantum numbers for the states are $n, l, j, m_j$ — $l$ still labels them, it just does not set the energy.`,
    }),
    num({
      id: 'cp-wave', difficulty: 2, transfer: true,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        const dE = fsShift(n, 1.5) - fsShift(n, 0.5), nu = dE * QE / H, ans = (C / nu) * 100;
        return {
          prompt: t`Lamb and Retherford drove transitions between hydrogen’s $n = 2$ levels with microwaves from war-surplus radar equipment. What free-space wavelength, in cm, matches the first-order $${n}P_{3/2}$–$${n}P_{1/2}$ splitting? ($E_n^2/2mc^2 = ${fmt(fsUnit(n) * UEV, 5)}\ \mu$eV for $n = ${n}$.)`,
          visual: pairPic(`${n}P1/2`, `${n}P3/2`, t`The two $l = 1$ levels of $n = ${n}$. Spacing not to scale.`),
          answer: ans, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: ans / (2 * Math.PI), feedback: t`Use $\nu = \Delta E/h$, not $\Delta E/\hbar$.` }],
          hints: [t`$\Delta E = \dfrac{E_n^2}{2mc^2}\Big(\dfrac{4n}{1} - \dfrac{4n}{2}\Big) = \dfrac{E_n^2}{2mc^2}\cdot2n$.`, t`Then $\nu = \Delta E/h$ and $\lambda = c/\nu$.`],
          teach: 'Fine-structure splittings in hydrogen fall in the microwave band: radar technology made them measurable.',
          explain: t`$\Delta E = ${fmt(dE * UEV, 4)}\ \mu$eV, $\nu = ${fmt(nu / 1e9, 4)}$ GHz, $\lambda = c/\nu = ${fmt(ans, 3)}$ cm. For $n = 2$ that is the 3 cm X band of wartime radar, which is why the measurement became possible in 1947.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §7.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values (e, ħ, c, ε₀, R∞, mₑ, aₑ)', url: 'https://physics.nist.gov/cuu/Constants/' },
    { label: 'Lamb & Retherford, “Fine structure of the hydrogen atom by a microwave method”, Phys. Rev. 72, 241 (1947)', url: 'https://doi.org/10.1103/PhysRev.72.241' },
    { label: 'Hagley & Pipkin, “Separated oscillatory field measurement of hydrogen 2S½–2P3/2 fine structure interval”, Phys. Rev. Lett. 72, 1172 (1994)', url: 'https://doi.org/10.1103/PhysRevLett.72.1172' },
  ],
});
