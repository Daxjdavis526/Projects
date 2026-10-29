// The Zeeman effect (Griffiths & Schroeter §7.4). Ĥ_Z = (μ_B B/ħ)(L̂z + 2Ŝz).
// Weak field (μ_B B ≪ fine structure): the good states are |n l j m_j⟩ and
// E = g_J μ_B B m_j with Landé's g_J = 1 + [j(j+1) − l(l+1) + s(s+1)]/2j(j+1),
// from projecting L + 2S on J. Strong field (Paschen–Back): |n l m_l m_s⟩
// with μ_B B(m_l + 2m_s) plus fine structure as a correction. Normal Zeeman
// effect for S = 0 (g = 1); anomalous otherwise. Explore: hydrogen's n = 2
// diagonalized exactly within the level (fine structure + Zeeman; no Lamb
// shift, no hyperfine) from 0 to 2 T, with the weak- and strong-field
// straight lines to compare. Worked: Landé's g and the anomalous patterns of
// sodium's D lines (4 and 6 components). Code: the l = 1, s = ½ level as a
// 6 × 6 matrix A L·S + μ_B B(Lz + 2Sz). Transfer: Zeeman splitting in
// sunspots (Hale 1908) with the Hinode line Fe I 630.25 nm, whose ⁵P₁ level
// gives g = 2.5 — umbral fields 0.2–0.4 T. phys2710.MP8.3 did the normal
// effect, cadmium, and Hale with the 525.02 nm line's g given; here g is
// computed from the term. Constants CODATA 2022.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, C, QE, MU_B, seg, label, r6 } from './_qm.js';
import { fsShift } from './_pert.js';

const t = String.raw;
const MUB = MU_B / QE;                          // eV/T: 5.788 381 8…e-5
const MUB_UEV = MUB * 1e6;                      // μeV per tesla
const HC = (H * C) / QE * 1e9;                  // eV nm
const E12 = fsShift(2, 0.5) * 1e6, E32 = fsShift(2, 1.5) * 1e6;   // μeV, hydrogen n = 2 fine-structure levels
const FS2 = E32 - E12;
const gJ = (L, S, J) => 1 + (J * (J + 1) - L * (L + 1) + S * (S + 1)) / (2 * J * (J + 1));
const NA_D1 = 589.592, NA_D2 = 588.995;         // nm in air (NIST ASD)
const FE630 = 630.2494;                          // nm in air, Fe I a⁵P₁ – z⁵D₀ (Hinode SOT/SP)
const SIGMA_CM = { 'hydrogen, n = 2': null, 'lithium 2p': 0.3353, 'sodium 3p': 17.196, 'potassium 4p': 57.71 };   // cm⁻¹ fine-structure intervals (NIST ASD)

/** The 2 × 2 mixing of hydrogen's 2P m_j = ±½ states as graph expressions in B = x (μeV). */
function mixed(mj, sign) {
  const b = `${r6(MUB_UEV)}*x`;
  const a = `(${r6(E32)} + ${r6((2 / 3) * mj * 2)}*${b})`, d = `(${r6(E12)} + ${r6((1 / 3) * mj * 2)}*${b})`;
  return `(${a} + ${d})/2 ${sign} sqrt(((${a} - ${d})/2)^2 + 2*(${b})^2/9)`;
}

/** Hydrogen n = 2 in a field: exact levels within the level, with optional comparison lines keyed to choice `cmp`. */
function n2Pic({ explore = false, Bmax = 2, mark = null, numbers = true, caption }) {
  const b = (k) => `${r6(k * MUB_UEV)}*x`;
  const exact = [
    [`${r6(E12)} + ${b(1)}`, 'teal'], [`${r6(E12)} - ${b(1)}`, 'teal'],
    [`${r6(E32)} + ${b(2)}`, 'gold'], [`${r6(E32)} - ${b(2)}`, 'gold'],
    [mixed(0.5, '+'), 'accent'], [mixed(0.5, '-'), 'accent'], [mixed(-0.5, '+'), 'violet'], [mixed(-0.5, '-'), 'violet'],
  ].map(([fn, color]) => ({ fn, color, width: 2.4 }));
  const weak = [[E12, 1], [E12, -1], [E12, 1 / 3], [E12, -1 / 3], [E32, 2], [E32, -2], [E32, 2 / 3], [E32, -2 / 3]]
    .map(([e, g]) => ({ fn: `${r6(e)} + ${b(g)}`, color: 'ink3', width: 1.2, dash: [5, 4], when: 'step(0.5 - abs(cmp - 1))' }));
  const so = (mlms) => (mlms === 0.5 ? E32 : mlms === 0 ? (2 * E32 + E12) / 3 : (E32 + 2 * E12) / 3);
  const strong = [[E12, 1], [E12, -1], [so(0.5), 2], [so(0.5), -2], [so(0), 1], [so(0), -1], [so(-0.5), 0], [so(-0.5), 0]]
    .map(([e, k]) => ({ fn: `${r6(e)} + ${b(k)}`, color: 'ink3', width: 1.2, dash: [2, 3], when: 'step(0.5 - abs(cmp - 2))' }));
  const top = 2.25 * MUB_UEV * Bmax;
  return {
    type: 'graph',
    params: {
      x: [0, Bmax], y: [r6(-top - 40), r6(top + 10)], aspect: 'wide', xlabel: 'magnetic field B (T)', ylabel: 'energy − Bohr E₂ (μeV)', axesAt: 'edge', xticks: 4, yticks: numbers ? 5 : 0,
      ...(explore ? {
        sliders: [{ key: 'B', label: 'Field $B$', min: 0, max: Bmax, step: 0.02, value: 0.3, unit: '\\text{T}', explain: t`A uniform magnetic field along $z$. $\mu_BB$ is $${fmt(MUB_UEV, 4)}\ \mu$eV per tesla; the $n = 2$ fine-structure gap is $${fmt(FS2, 4)}\ \mu$eV.` }],
        choices: [{ key: 'cmp', label: 'Compare with', options: [[0, 'nothing'], [1, 'weak-field (Landé)'], [2, 'strong-field (Paschen–Back)']], value: 1, explain: t`Straight-line approximations, dashed: Landé’s slopes $g_Jm_j$, or the strong-field slopes $m_l + 2m_s$ plus fine structure.` }],
        readouts: [{ label: 'μ_B B (μeV)'.replace('μ_B', 'μB'), expr: `${r6(MUB_UEV)}*B`, digits: 4 }, { label: 'μB B / fine-structure gap', expr: `${r6(MUB_UEV / FS2)}*B`, digits: 3 }],
        vlines: [{ x: 'B', color: 'ink3' }],
      } : { constants: { cmp: 0 }, ...(mark !== null ? { vlines: [{ x: mark, color: 'ink3' }] } : {}) }),
      curves: [...exact, ...(explore ? [...weak, ...strong] : [])],
      ...(explore ? { points: [label(0.02, E32, '2P3/2', 'gold', 4, -10), label(0.02, E12, '2S1/2, 2P1/2', 'teal', 4, 14)] } : {}),
    },
    caption,
  };
}

/** The vector model: J up the page, L and S adding to it (lengths √(l(l+1)) etc., units of ħ). */
function vecPic(L, S, J, caption) {
  const l = Math.sqrt(L * (L + 1)), s = Math.sqrt(S * (S + 1)), j = Math.sqrt(J * (J + 1));
  const cl = (j * j + l * l - s * s) / (2 * j * l), sl = Math.sqrt(Math.max(0, 1 - cl * cl));
  const Lt = [-l * sl, l * cl];
  const R = Math.max(j, l, s) * 1.15;
  return {
    type: 'graph',
    params: {
      x: [r6(-R * 1.6), r6(R * 1.6)], y: [-0.25, r6(R * 1.05)], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      arrows: [
        { from: [0, 0], to: [0, r6(j)], color: 'gold', width: 3, label: 'J', labelDx: 8, labelDy: 0 },
        { from: [0, 0], to: Lt.map(r6), color: 'accent', width: 2.6, label: 'L', labelDx: -16, labelDy: 0 },
        { from: Lt.map(r6), to: [0, r6(j)], color: 'violet', width: 2.6, label: 'S', labelDx: -18, labelDy: 10 },
      ],
    },
    caption,
  };
}

/** A stick spectrum: components at offsets (units of μ_B B), heights h. */
const sticks = (comps, caption, { xmax = 2, xlabel = 'shift of photon energy (units of μB B)', labels = true } = {}) => ({
  type: 'graph',
  params: {
    x: [-xmax, xmax], y: [0, 1.3], aspect: 'wide', xlabel, ylabel: '', axesAt: 'edge', xticks: labels ? 2 * xmax : 0, yticks: 0,
    curves: [seg(-xmax, 0, xmax, 0, 'ink3', 1), ...comps.map(([x, h, c]) => seg(x, 0, x, h, c || 'accent', 4))],
  },
  caption,
});

// sodium's D lines in a weak field: (upper g, m) → (lower g, m), Δm = 0, ±1
function pattern(gu, ju, gl, jl) {
  const out = [];
  for (let mu = -ju; mu <= ju + 1e-9; mu++) for (let ml = -jl; ml <= jl + 1e-9; ml++) if (Math.abs(mu - ml) <= 1) out.push({ dE: gu * mu - gl * ml, pi: Math.abs(mu - ml) < 1e-9 });
  return out;
}
const D1 = pattern(2 / 3, 0.5, 2, 0.5), D2 = pattern(4 / 3, 1.5, 2, 0.5);
const half = (x) => (x < 0 ? '-' : '') + t`\tfrac{${Math.round(Math.abs(2 * x))}}{2}`;   // ±k/2 as TeX
const A_LS = (2 / 3) * FS2;                     // μeV: A in A L·S that puts 2P3/2 FS2 above 2P½
const mjHalf = (b) => { const a = A_LS / 2 + (2 / 3) * b, d = -A_LS + (1 / 3) * b, m = (a + d) / 2, q = Math.sqrt(((a - d) / 2) ** 2 + (2 * b * b) / 9); return [m - q, m + q]; };

export default lesson({
  id: 'phys4700.M8.4',
  title: 'The Zeeman effect',
  minutes: 18, difficulty: 3,
  intro: t`In a magnetic field $B\hat z$ an atom’s electron has the energy $\hat H_Z = \dfrac{\mu_BB}{\hbar}(\hat L_z + 2\hat S_z)$: orbit and spin are both magnets, and spin counts **twice** ($g_s \approx 2$). Because of that factor of 2, $\hat L_z + 2\hat S_z$ is not parallel to $\vec J$, and what you see depends on how the field compares with the fine structure. In a **weak** field, $j$ and $m_j$ stay good quantum numbers and each level splits evenly:

$$\begin{gathered} E_Z = g_J\,\mu_BB\,m_j \\ g_J = 1 + \frac{j(j+1) - l(l+1) + s(s+1)}{2j(j+1)} \end{gathered}$$

$g_J$ is the **Landé g-factor**. With no spin ($s = 0$) it is 1 and every line splits into three — the **normal** Zeeman effect. With spin, levels split by different amounts and lines break into four, six or more components: the **anomalous** Zeeman effect. In a **strong** field the spin and orbit decouple and the shifts become $\mu_BB(m_l + 2m_s)$: the Paschen–Back effect.`,
  symbols: [
    { tex: '\\mu_B', text: t`the Bohr magneton, $e\hbar/2m_e = ${tex(MU_B, 8)}$ J/T $= ${fmt(MUB_UEV, 5)}\ \mu$eV/T (CODATA 2022)` },
    { tex: 'B', text: 'the magnetic field strength, in tesla, along z' },
    { tex: 'm_j', text: t`the projection of $\vec J$ on the field, $-j, \dots, j$ in whole steps` },
    { tex: 'g_J', text: 'the Landé g-factor: how many Bohr magnetons of magnetic moment per unit of J along the field' },
    { tex: 'j,\\ l,\\ s', text: t`the total, orbital and spin angular momentum quantum numbers of the level (for many-electron atoms, $J$, $L$, $S$ of the term)` },
    { tex: '\\hat L_z,\\ \\hat S_z', text: t`the orbital and spin angular momentum along the field; their eigenvalues are $m_l\hbar$ and $m_s\hbar$` },
  ],
  why: 'Zeeman splittings measure magnetic fields where no probe can go — on the Sun, in stars, around magnetars — and set the frequencies of every atomic clock, magnetometer and laser-cooled atom trap.',
  visual: {
    ...n2Pic({ explore: true, caption: t`Hydrogen’s $n = 2$ level in a field, found by diagonalizing fine structure plus $\hat H_Z$ exactly within the level (solid: teal $2S$, gold $2P$ with $m_j = \pm\tfrac32$, blue and violet the mixed $2P$ pairs with $m_j = +\tfrac12$ and $-\tfrac12$). The Lamb shift (4.4 μeV) and hyperfine structure are left out, and $g_s = 2$. Dashed: the straight-line weak- or strong-field approximations. Energies from CODATA 2022 constants.` }),
    title: 'From Landé to Paschen–Back',
    lead: t`Hydrogen’s $n = 2$ level: eight states, $2S_{1/2}$ and $2P_{1/2}$ together and $2P_{3/2}$ $${fmt(FS2, 3)}\ \mu$eV above. Turn up the field and compare the exact levels with the two straight-line limits.`,
    tasks: [
      t`Below about 0.2 T the levels fan out along Landé’s slopes, $g_Jm_j$: four from $2P_{3/2}$, two each from $2S_{1/2}$ and $2P_{1/2}$ (with different slopes, $1$ and $\tfrac13$).`,
      'Around 0.8 T, where μB B equals the fine-structure gap, the levels bend: that is the intermediate regime, where neither limit works.',
      t`Switch to the strong-field comparison and go to 2 T: now the levels follow $m_l + 2m_s$, with two $2P$ lines running flat ($m_l + 2m_s = 0$).`,
    ],
  },
  example: {
    prompt: t`Derive Landé’s $g_J$ from the vector model, then predict the patterns of sodium’s yellow D lines in a 1.00 T field: D1 ($3P_{1/2} \to 3S_{1/2}$, ${NA_D1} nm in air) and D2 ($3P_{3/2} \to 3S_{1/2}$, ${NA_D2} nm).`,
    visual: sticks([...D1.map((c) => [c.dE, c.pi ? 1 : 0.6, c.pi ? 'warn' : 'accent'])], t`The D1 line’s four components in a weak field, offsets in units of $\mu_BB$: π (orange, $\Delta m_j = 0$) and σ (blue, $\Delta m_j = \pm1$). Heights schematic.`),
    steps: [
      { label: 'Project on J', text: t`In a weak field $\vec L$ and $\vec S$ precess fast about $\vec J$, so only their components along $\vec J$ survive on average. $\vec L + 2\vec S = \vec J + \vec S$, and the average of $\vec S$ is $\dfrac{\vec S\cdot\vec J}{J^2}\vec J$.` },
      { label: 'Dot product', text: t`$\vec S\cdot\vec J = \tfrac12(J^2 + S^2 - L^2)$, so $$\begin{gathered} \langle\vec L + 2\vec S\rangle = g_J\vec J, \\ g_J = 1 + \frac{j(j+1) - l(l+1) + s(s+1)}{2j(j+1)}, \end{gathered}$$ and $E_Z = g_J\mu_BBm_j$. This is first-order degenerate perturbation theory in the $|j\,m_j\rangle$ basis, where $\hat H_Z$ is diagonal.` },
      { label: 'Sodium’s g', text: t`Sodium’s one outer electron: $3S_{1/2}$ ($l = 0$) has $g = 2$; $3P_{1/2}$ has $g = 1 + \dfrac{\frac34 - 2 + \frac34}{\frac32} = \tfrac23$; $3P_{3/2}$ has $g = 1 + \dfrac{\frac{15}{4} - 2 + \frac34}{\frac{15}{2}} = \tfrac43$.` },
      { label: 'Patterns', text: t`A photon carries $\Delta m_j = 0$ (π) or $\pm1$ (σ). Each component is shifted by $(g_um_u - g_lm_l)\mu_BB$. D1: $\pm\tfrac23$ and $\pm\tfrac43$ — four lines. D2: $\pm\tfrac13$, $\pm1$, $\pm\tfrac53$ — six lines. Neither looks like the normal triplet.` },
      { label: 'Numbers', text: t`$\mu_BB = ${fmt(MUB_UEV, 4)}\ \mu$eV at 1 T. In wavelength, $\Delta\lambda = \lambda^2\Delta E/hc$: $${fmt((NA_D1 ** 2 * MUB) / HC * 1000, 3)}$ pm per $\mu_BB$ at D1, so its outer components sit $\pm${fmt(((4 / 3) * NA_D1 ** 2 * MUB) / HC * 1000, 3)}$ pm from the line centre.` },
      { label: 'Weak enough?', text: t`Sodium’s $3P$ fine-structure gap is 17.196 cm⁻¹ $= ${fmt(H * C * 1719.6 / QE * 1e3, 4)}$ meV, about 37 times $\mu_BB$ at 1 T: safely weak. For hydrogen’s $n = 2$, with a gap of only $${fmt(FS2, 3)}\ \mu$eV, 1 T is already the intermediate regime.` },
    ],
    answer: t`$g_J = 1 + \dfrac{j(j+1) - l(l+1) + s(s+1)}{2j(j+1)}$. At 1 T, D1 splits into 4 components at $\pm\tfrac23$ and $\pm\tfrac43\,\mu_BB$ (up to $\pm${fmt(((4 / 3) * NA_D1 ** 2 * MUB) / HC * 1000, 3)}$ pm), and D2 into 6 at $\pm\tfrac13$, $\pm1$, $\pm\tfrac53\,\mu_BB$.`,
  },
  practice: [
    num({
      id: 'lande', difficulty: 2,
      gen(r) {
        const [L, S, J, term] = r.pick([[1, 0.5, 1.5, '^2P_{3/2}'], [2, 0.5, 1.5, '^2D_{3/2}'], [2, 0.5, 2.5, '^2D_{5/2}'], [3, 1.5, 1.5, '^4F_{3/2}'], [1, 1, 1, '^3P_1'], [1, 2, 1, '^5P_1'], [2, 3, 1, '^7D_1']]);
        const ans = gJ(L, S, J);
        return {
          prompt: t`What is the Landé g-factor of an atomic level with term $${term}$ ($L = ${L}$, $S = ${fmt(S, 2)}$, $J = ${fmt(J, 2)}$)?`,
          visual: vecPic(L, S, J, t`The vector model of $${term}$ (lengths $\sqrt{L(L+1)}$ and so on, in units of $\hbar$): $\vec L$ and $\vec S$ add to $\vec J$. Spin counts double in the magnetic moment, so the moment is not along $\vec J$.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`$g = 1$ is the orbital-only value. With $S \ne 0$ the spin’s double weight changes it.` }, { value: 1 + (J * (J + 1) + L * (L + 1) - S * (S + 1)) / (2 * J * (J + 1)), feedback: t`Swap $L$ and $S$ in the numerator: $g_J = 1 + \dfrac{J(J+1) - L(L+1) + S(S+1)}{2J(J+1)}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$g_J = 1 + \dfrac{J(J+1) - L(L+1) + S(S+1)}{2J(J+1)}$.`, t`Here $J(J+1) = ${fmt(J * (J + 1), 4)}$, $L(L+1) = ${L * (L + 1)}$, $S(S+1) = ${fmt(S * (S + 1), 4)}$.`],
          teach: 'Landé’s g weighs spin twice and orbit once, projected on J.',
          explain: t`$g = 1 + \dfrac{${fmt(J * (J + 1), 4)} - ${L * (L + 1)} + ${fmt(S * (S + 1), 4)}}{${fmt(2 * J * (J + 1), 4)}} = ${fmt(ans, 4)}$. ${ans > 2 ? 'Larger than the free electron’s 2: when L and S are partly opposed, J is small while the moment stays large.' : ans < 1 ? 'Below 1: the spin is largely opposed to the orbit, cancelling much of the moment.' : 'Between the orbital value 1 and the spin value 2.'}`,
        };
      },
    }),
    num({
      id: 'weak-shift', difficulty: 2,
      gen(r) {
        const B = r.pick([0.02, 0.05, 0.1, 0.15]);
        const [lvl, l, j, mj] = r.pick([['2P_{3/2}', 1, 1.5, 1.5], ['2P_{3/2}', 1, 1.5, 0.5], ['2P_{1/2}', 1, 0.5, 0.5], ['2S_{1/2}', 0, 0.5, 0.5]]);
        const g = gJ(l, 0.5, j), ans = g * MUB_UEV * B * mj;
        return {
          prompt: t`In a weak field of $${B}$ T, by how much (in μeV) does hydrogen’s $${lvl}$, $m_j = ${half(mj)}$ sublevel shift? ($\mu_B = ${fmt(MUB_UEV, 5)}\ \mu$eV/T.)`,
          visual: n2Pic({ Bmax: 0.2, mark: B, numbers: false, caption: t`Hydrogen’s $n = 2$ sublevels at weak field, exact within the level; grey line at ${B} T. Energies unlabelled.` }),
          answer: ans, units: 'μeV', tol: { rel: 0.005 },
          errors: [{ value: MUB_UEV * B * mj, feedback: t`Include the Landé factor $g_J = ${fmt(g, 3)}$ for this level.` }, { value: 2 * MUB_UEV * B * mj, feedback: t`$g = 2$ is the free spin’s value; with orbital motion, $g_J = ${fmt(g, 3)}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$E_Z = g_J\mu_BBm_j$.`, t`For $l = ${l}$, $j = ${half(j)}$: $g_J = ${fmt(g, 4)}$.`],
          teach: t`In a weak field each sublevel shifts by $g_J\mu_BBm_j$.`,
          explain: t`$g_J = ${fmt(g, 4)}$, so $E_Z = ${fmt(g, 4)}\times${fmt(MUB_UEV, 5)}\times${B}\times${half(mj)} = ${fmt(ans, 4)}\ \mu$eV — small next to the $${fmt(FS2, 3)}\ \mu$eV fine-structure gap, so the weak-field formula holds.`,
        };
      },
    }),
    mcq({
      id: 'normal', difficulty: 2,
      prompt: t`Cadmium’s red line at 643.8 nm is a transition between two levels whose electron spins cancel ($S = 0$): $^1D_2 \to {}^1P_1$. In a field it splits into exactly three equally spaced components. Why so simple, when sodium’s D lines split into four and six?`,
      visual: sticks([[-1, 0.6], [0, 1, 'warn'], [1, 0.6]], 'The cadmium line in a field: one π component (orange) and two σ components (blue). Spacing in units of μB B.', { xmax: 2 }),
      choices: [
        t`With $S = 0$ both levels have $g_J = 1$, so every $\Delta m = 0$ transition has the same energy, and so does every $\Delta m = +1$ or $-1$`,
        t`Because both levels have only three sublevels`,
        t`Because cadmium is heavy, so its levels are in the Paschen–Back regime`,
        t`Because a $D \to P$ transition can only emit three photons`,
      ],
      answer: 0,
      why: {
        1: t`$^1D_2$ has five sublevels and $^1P_1$ three. The triplet appears because their spacings are equal ($g = 1$ for both), not because of the counts.`,
        2: t`The Paschen–Back regime needs fields comparable to the fine structure; cadmium’s is large. And with $S = 0$ there is no spin to decouple.`,
        3: t`The selection rule allows nine $\Delta m = 0, \pm1$ transitions here; they just pile onto three energies.`,
      },
      hints: [t`Compute $g_J$ for $S = 0$: $1 + \dfrac{J(J+1) - L(L+1)}{2J(J+1)}$ with $J = L$.`],
      teach: 'The normal Zeeman effect is the S = 0 case: g = 1 for every level, so all lines split into the same three components.',
      explain: t`With $S = 0$, $J = L$ and $g_J = 1$ for both levels. A transition’s shift is $(m_u - m_l)\mu_BB$, which is $0$ or $\pm\mu_BB$: three lines, whatever the levels. Lorentz’s classical electron theory predicted exactly this; the “anomalous” patterns had to wait for spin.`,
    }),
    num({
      id: 'pb-field', difficulty: 3,
      gen(r) {
        const name = r.pick(Object.keys(SIGMA_CM));
        const sig = SIGMA_CM[name];
        const dE = sig === null ? FS2 * 1e-6 : (H * C * sig * 100) / QE;
        const ans = dE / MUB;
        return {
          prompt: t`The Zeeman energy $\mu_BB$ equals an atom’s fine-structure splitting at some field: above it the Paschen–Back regime begins. Estimate that field for ${name}, whose fine-structure splitting is ${sig === null ? t`$${fmt(FS2, 4)}\ \mu$eV` : t`$${sig}$ cm⁻¹ (as a wavenumber, $\Delta E = hc\,\tilde\nu$)`}. Give $B$ in tesla.`,
          visual: n2Pic({ Bmax: 2, numbers: false, caption: t`Hydrogen’s $n = 2$ in a field (exact within the level, energies unlabelled): straight Landé fans at low field, regrouping by $m_l + 2m_s$ at high field.` }),
          answer: ans, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: ans * 100, feedback: t`A wavenumber in cm⁻¹ must be converted to m⁻¹ (×100) before multiplying by $hc$.` }, { value: ans / 100, feedback: t`Convert cm⁻¹ to m⁻¹ by multiplying by 100, not dividing.` }].filter(() => sig !== null),
          hints: [t`$B = \Delta E/\mu_B$ with $\mu_B = ${tex(MUB, 6)}$ eV/T.`, ...(sig !== null ? [t`$\Delta E = hc\tilde\nu = (${tex(HC * 1e-7, 6)}\ \text{eV cm})\times${sig}\ \text{cm}^{-1}$.`] : [t`$\Delta E = ${tex(FS2 * 1e-6, 4)}$ eV.`])],
          teach: t`Whether a field is weak or strong is measured against the fine structure: $\mu_BB$ against the fine-structure gap.`,
          explain: t`$\Delta E = ${tex(dE, 4)}$ eV, so $B = \Delta E/\mu_B = ${fmt(ans, 3)}$ T. ${ans < 2 ? 'A laboratory electromagnet reaches the Paschen–Back regime here.' : ans < 50 ? 'Only the strongest research magnets reach this; in ordinary fields the atom is in the weak-field (Landé) regime.' : 'Beyond any steady laboratory magnet: on Earth this atom is always in the weak-field regime — though magnetic white dwarfs and neutron stars exceed it.'} Heavier atoms have larger fine structure, so they stay “weak” to higher fields.`,
        };
      },
    }),
    mcq({
      id: 'd2-count', difficulty: 3,
      prompt: t`In a weak field, sodium’s $3P_{3/2}$ level ($g = \tfrac43$) splits into four sublevels and $3S_{1/2}$ ($g = 2$) into two. How many distinct components does the D2 line ($3P_{3/2} \to 3S_{1/2}$) show, given $\Delta m_j = 0, \pm1$?`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [-1.6, 4.4], aspect: 'wide', xlabel: '', ylabel: 'energy (schematic)', axesAt: 'edge', xticks: 0, yticks: 0,
          curves: [seg(0.3, 3, 1.3, 3, 'gold', 3), seg(0.3, 0, 1.3, 0, 'accent', 3),
            ...[1.5, 0.5, -0.5, -1.5].map((m) => seg(2.2, 3 + m * (4 / 3) * 0.35, 3.2, 3 + m * (4 / 3) * 0.35, 'gold', 2.4)),
            ...[0.5, -0.5].map((m) => seg(2.2, m * 2 * 0.35, 3.2, m * 2 * 0.35, 'accent', 2.4)),
            seg(1.3, 3, 2.2, 3, 'ink4', 1, [3, 4]), seg(1.3, 0, 2.2, 0, 'ink4', 1, [3, 4])],
          points: [label(0.8, 3, '3P3/2', 'gold', 0, -12, 'center'), label(0.8, 0, '3S1/2', 'accent', 0, 14, 'center'), label(0.8, 4.1, 'B = 0', 'ink3', 0, 0, 'center'), label(2.7, 4.1, 'weak B', 'ink3', 0, 0, 'center'),
            ...[1.5, 0.5, -0.5, -1.5].map((m) => label(3.25, 3 + m * (4 / 3) * 0.35, `m = ${{ 1.5: '+3/2', 0.5: '+½', '-0.5': '−½', '-1.5': '−3/2' }[m]}`, 'gold', 4, 0)),
            ...[0.5, -0.5].map((m) => label(3.25, m * 2 * 0.35, m > 0 ? 'm = +½' : 'm = −½', 'accent', 4, 0))],
        },
        caption: 'The two levels at zero field and split in a weak field (splittings exaggerated, spacing ∝ g m). Transitions not drawn.',
      },
      choices: ['6', '3', '4', '8'],
      answer: 0,
      why: {
        1: t`Three is the normal Zeeman effect, which needs $g_u = g_l$. Here $\tfrac43 \ne 2$, so lines with the same $\Delta m$ no longer coincide.`,
        2: t`Four is D1’s count. D2’s upper level has four sublevels, which allows more transitions.`,
        3: t`Eight would be every pair of sublevels, but $\Delta m_j = \pm2$ (from $m = \pm\tfrac32$ to $\mp\tfrac12$) is forbidden for a single photon.`,
      },
      hints: [t`List the allowed pairs $(m_u, m_l)$ with $|m_u - m_l| \le 1$.`, t`Each shift is $\big(\tfrac43m_u - 2m_l\big)\mu_BB$; count the distinct values.`],
      teach: 'In the anomalous Zeeman effect, unequal g-factors make every allowed sublevel pair a separate line.',
      explain: t`Allowed pairs: $(\tfrac32, \tfrac12)$, $(\tfrac12, \tfrac12)$, $(\tfrac12, -\tfrac12)$, $(-\tfrac12, \tfrac12)$, $(-\tfrac12, -\tfrac12)$, $(-\tfrac32, -\tfrac12)$. Their shifts $\tfrac43m_u - 2m_l$ are $1, -\tfrac13, \tfrac53, -\tfrac53, \tfrac13, -1$: six distinct lines.`,
    }),
    code({
      id: 'zeeman-6', difficulty: 3,
      prompt: t`Watch a $p$ level go from Landé to Paschen–Back. For $l = 1$, $s = \tfrac12$ (units of $\hbar$, energies in μeV), the Hamiltonian on the six product states is $$\hat H = A\,\hat{\vec L}\cdot\hat{\vec S} + b\,(\hat L_z + 2\hat S_z),\qquad b = \mu_BB,$$ with $A = ${fmt(A_LS, 5)}$ μeV, which puts hydrogen’s $2P_{3/2}$ $${fmt(FS2, 4)}\ \mu$eV above $2P_{1/2}$. The spin-1 and spin-½ matrices are given. Write \`H(b)\` (a $6\times6$ array, using \`np.kron(L, I2)\` for orbit and \`np.kron(I3, S)\` for spin) and \`levels(b)\`, its eigenvalues in ascending order.`,
      starter: t`import numpy as np

A = ${A_LS}       # μeV
r2 = np.sqrt(2)
Lx = np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]]) / r2
Ly = np.array([[0, -1j, 0], [1j, 0, -1j], [0, 1j, 0]]) / r2
Lz = np.diag([1.0, 0, -1])
Sx = np.array([[0, 1], [1, 0]]) / 2
Sy = np.array([[0, -1j], [1j, 0]]) / 2
Sz = np.diag([0.5, -0.5])
I2, I3 = np.eye(2), np.eye(3)

def H(b):
    pass

def levels(b):
    pass

print(levels(0))
print(levels(1e5) / 1e5)
`,
      answer: t`import numpy as np

A = ${A_LS}       # μeV
r2 = np.sqrt(2)
Lx = np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]]) / r2
Ly = np.array([[0, -1j, 0], [1j, 0, -1j], [0, 1j, 0]]) / r2
Lz = np.diag([1.0, 0, -1])
Sx = np.array([[0, 1], [1, 0]]) / 2
Sy = np.array([[0, -1j], [1j, 0]]) / 2
Sz = np.diag([0.5, -0.5])
I2, I3 = np.eye(2), np.eye(3)

def H(b):
    LS = sum(np.kron(L, I2) @ np.kron(I3, S) for L, S in ((Lx, Sx), (Ly, Sy), (Lz, Sz)))
    return A * LS + b * (np.kron(Lz, I2) + 2 * np.kron(I3, Sz))

def levels(b):
    return np.linalg.eigvalsh(H(b))

print(levels(0))
print(levels(1e5) / 1e5)
`,
      tests: [
        { name: t`at $B = 0$: $j = \tfrac12$ twice at $-A$, $j = \tfrac32$ four times at $+\tfrac12A$`, code: 'np.allclose(levels(0), [-A, -A, A / 2, A / 2, A / 2, A / 2])' },
        { name: t`weak field: the slopes are Landé’s $g_Jm_j$ — $\pm\tfrac13$ for $j = \tfrac12$, $\pm\tfrac23, \pm2$ for $j = \tfrac32$`, code: 'np.allclose((levels(1e-4) - levels(0)) / 1e-4, [-1/3, 1/3, -2, -2/3, 2/3, 2], atol=1e-3)' },
        { name: t`strong field: the slopes become $m_l + 2m_s$ = $-2, -1, 0, 0, 1, 2$`, code: 'np.allclose(levels(1e6) / 1e6, [-2, -1, 0, 0, 1, 2], atol=1e-3)' },
        { name: t`at 1 T ($b = ${fmt(MUB_UEV, 4)}$ μeV) the mixed $m_j = \tfrac12$ pair matches the $2\times2$ closed form`, code: `all(min(abs(levels(${MUB_UEV}) - v)) < 1e-6 for v in (${mjHalf(MUB_UEV)[0]}, ${mjHalf(MUB_UEV)[1]}))` },
      ],
      hints: [
        'L·S = LxSx + LySy + LzSz, each term np.kron(L, I2) @ np.kron(I3, S).',
        'Lz + 2Sz on the product space is np.kron(Lz, I2) + 2 * np.kron(I3, Sz).',
        'np.linalg.eigvalsh returns the eigenvalues of a Hermitian matrix in ascending order.',
      ],
      teach: 'Diagonalizing A L·S + μB B(Lz + 2Sz) joins the weak-field (Landé) and strong-field (Paschen–Back) limits through the intermediate regime.',
      explain: t`At small $b$ the eigenstates are $|j\,m_j\rangle$ and the slopes are $g_Jm_j$; at large $b$ they are $|m_l\,m_s\rangle$ with slopes $m_l + 2m_s$. In between the two $m_j = \pm\tfrac12$ pairs mix — a $2\times2$ problem each — while $m_j = \pm\tfrac32$ stay straight lines from start to finish, because they are the same state in both bases.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sunspot', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([0.18, 0.22, 0.26, 0.29, 0.33, 0.38]);
        const g = gJ(1, 2, 1), dl = ((FE630 ** 2 * g * MUB * B) / HC) * 1000, dlr = +dl.toPrecision(3);
        const ans = (dlr / 1000) * HC / (FE630 ** 2 * g * MUB);
        return {
          prompt: t`In 1908 George Ellery Hale found sunspot lines split by the Zeeman effect — the first magnetic field measured beyond Earth. Today the Hinode spacecraft maps sunspot fields with the iron line at ${FE630} nm, a transition from a level with term $^5P_1$ to one with $^5D_0$. The $J = 0$ level does not split, so the line is a clean triplet whose σ components sit at $\pm g\,\mu_BB\lambda^2/hc$, with $g$ the $^5P_1$ level’s Landé factor. In a sunspot’s dark core the σ components are found $${dlr}$ pm either side of the line centre. What is the field, in tesla?`,
          visual: sticks([[-1, 0.6], [0, 1, 'warn'], [1, 0.6]], 'The 630.25 nm line in a sunspot (schematic): the π component (orange) at the centre and two σ components (blue) displaced by ±Δλ. Real sunspot umbrae have fields of about 0.2–0.4 T; Hale’s 1908 estimate was about 0.29 T (2900 gauss).', { xmax: 2, xlabel: 'wavelength around the line centre (schematic)', labels: false }),
          answer: ans, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: ans * g, feedback: t`Divide by the Landé factor: $g(^5P_1) = 1 + \dfrac{2 - 2 + 6}{4} = ${g}$.` }, { value: (ans * g) / 2, feedback: t`$g = 2$ is the free electron’s. For $^5P_1$ ($L = 1$, $S = 2$, $J = 1$): $g = 1 + \dfrac{J(J+1) - L(L+1) + S(S+1)}{2J(J+1)} = ${g}$.` }],
          hints: [t`$g(^5P_1)$: $L = 1$, $S = 2$, $J = 1$ in $1 + \dfrac{J(J+1) - L(L+1) + S(S+1)}{2J(J+1)}$.`, t`$B = \dfrac{\Delta\lambda\,hc}{g\,\lambda^2\mu_B}$ with $hc = ${fmt(HC, 7)}$ eV nm and $\mu_B = ${tex(MUB, 6)}$ eV/T.`],
          teach: 'A Zeeman triplet’s splitting, with g computed from the upper level’s term, turns a spectrum into a magnetometer.',
          explain: t`$g = 1 + (2 - 2 + 6)/4 = ${g}$ — this line is chosen because its large $g$ makes it sensitive. Then $$\begin{gathered} B = \frac{(${dlr}\times10^{-3}\ \text{nm})(${fmt(HC, 7)}\ \text{eV nm})}{${g}(${FE630}\ \text{nm})^2(${tex(MUB, 5)}\ \text{eV/T})} \\ = ${fmt(ans, 3)}\ \text{T}, \end{gathered}$$ typical of a sunspot umbra (0.2–0.4 T, about ten thousand times Earth’s field). Hinode also measures the components’ polarization, which gives the field’s direction; NASA’s Solar Dynamics Observatory uses a similar iron line at 617.3 nm, also with $g = 2.5$.`,
        };
      },
    }),
    mcq({
      id: 'cp-regime', difficulty: 2,
      prompt: t`Hydrogen atoms sit in the 5 T field of a laboratory superconducting magnet. Which description of the $n = 2$ level is right?`,
      visual: { type: 'graph', params: { x: [0, 6], y: [0, 360], aspect: 'wide', xlabel: 'B (T)', ylabel: 'energy (μeV)', axesAt: 'edge', xticks: 6, yticks: 4, curves: [{ fn: `${r6(MUB_UEV)}*x`, color: 'accent', width: 2.4, label: 'μB B', labelAt: 4.2, labelDx: -30, labelDy: -10 }, { fn: `${r6(FS2)}`, color: 'gold', width: 2.2, dash: [6, 4], label: 'n = 2 fine-structure gap', labelAt: 3.5, labelDy: -10 }], vlines: [{ x: 5, color: 'ink3', label: '5 T' }] }, caption: 'The Zeeman energy μB B against hydrogen’s n = 2 fine-structure gap (CODATA 2022).' },
      choices: [
        t`Strong field (Paschen–Back): $m_l$ and $m_s$ are good quantum numbers, shifts $\approx\mu_BB(m_l + 2m_s)$, with fine structure a small correction`,
        t`Weak field: shifts $g_J\mu_BBm_j$ with Landé’s $g$`,
        t`Intermediate: the fine structure and the field matter equally`,
        t`The field has no effect on $s$ states, only on $p$ states`,
      ],
      answer: 0,
      why: {
        1: t`Landé’s formula needs $\mu_BB \ll$ the fine-structure gap. At 5 T, $\mu_BB = ${fmt(5 * MUB_UEV, 3)}\ \mu$eV is over six times the $${fmt(FS2, 3)}\ \mu$eV gap.`,
        2: t`Equality happens near 0.8 T. At 5 T the field dominates.`,
        3: t`2S has spin: $m_s = \pm\tfrac12$ shifts it by $\pm\mu_BB$.`,
      },
      hints: [t`Compare $\mu_BB$ at 5 T with the $${fmt(FS2, 3)}\ \mu$eV gap.`],
      teach: t`Strong field means $\mu_BB$ much larger than the fine structure: spin and orbit then align with the field separately.`,
      explain: t`$\mu_BB = ${fmt(5 * MUB_UEV, 4)}\ \mu$eV, more than six times the fine structure: the field decouples $\vec L$ and $\vec S$, and the levels follow $m_l + 2m_s$. For hydrogen, whose fine structure is tiny, “strong” is an ordinary lab field; for sodium it would be tens of tesla.`,
    }),
    num({
      id: 'cp-d1', difficulty: 3,
      gen(r) {
        const B = r.pick([0.5, 1, 1.5, 2, 3]);
        const dE = (8 / 3) * MUB * B, ans = ((NA_D1 ** 2 * dE) / HC) * 1000;
        return {
          prompt: t`Sodium’s D1 line (${NA_D1} nm) splits in a weak field into four components at $\pm\tfrac23$ and $\pm\tfrac43$ times $\mu_BB$. How far apart, in pm, are the two **outermost** components at $B = ${B}$ T?`,
          visual: sticks(D1.map((c) => [c.dE, c.pi ? 1 : 0.6, c.pi ? 'warn' : 'accent']), 'The D1 pattern: π components (orange) and σ components (blue), offsets in units of μB B. Heights schematic.'),
          answer: ans, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`That is one component’s offset; the outermost pair are $\tfrac83\mu_BB$ apart.` }, { value: ans * 3 / 8 * 2, feedback: t`The outermost are at $\pm\tfrac43$, not $\pm1$: their separation is $\tfrac83\mu_BB$.` }],
          hints: [t`$\Delta E = \tfrac83\mu_BB$, with $\mu_B = ${tex(MUB, 6)}$ eV/T.`, t`$\Delta\lambda = \lambda^2\Delta E/hc$ with $hc = ${fmt(HC, 7)}$ eV nm.`],
          teach: 'An anomalous Zeeman pattern’s spacings follow from the g-factors of both levels.',
          explain: t`$\Delta E = \tfrac83(${tex(MUB, 5)})(${B}) = ${tex(dE, 4)}$ eV, so $\Delta\lambda = (${NA_D1})^2\times${tex(dE, 4)}/${fmt(HC, 7)}\ \text{nm}$ $= ${fmt(ans, 3)}$ pm. A good grating spectrometer resolves a few pm, which is how Zeeman, Lorentz and later Landé read off these patterns.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §7.4', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Hale, “On the probable existence of a magnetic field in sun-spots”, Astrophys. J. 28, 315 (1908)', url: 'https://doi.org/10.1086/141602' },
    { label: 'NIST Atomic Spectra Database (sodium D lines, fine-structure intervals)', url: 'https://physics.nist.gov/asd' },
    { label: 'Hinode Solar Optical Telescope spectro-polarimeter (Fe I 630.15 and 630.25 nm)', url: 'https://hinode.nao.ac.jp/en/' },
  ],
});
