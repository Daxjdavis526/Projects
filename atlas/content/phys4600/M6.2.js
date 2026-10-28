// The field tensor F^μν (Griffiths §12.3.3–12.3.4, in Carroll's −+++
// convention, x⁰ = ct): F^{0i} = E_i/c, F^{ij} = ε_ijk B_k, built from the
// four-potential as ∂^μA^ν − ∂^νA^μ; lowering both indices flips the sign of
// the time–space entries; the dual G^μν (E/c → B, B → −E/c); a boost acts
// with one Λ per index, F′ = ΛFΛᵀ, which reproduces M6.1's rules; the
// invariants F_μνF^μν = 2(B² − E²/c²) and F_μνG^μν = −4E·B/c; the Lorentz
// force dp^μ/dτ = qF^μν u_ν. Explore: em4c-boost with the live matrix (F up,
// F down, G). Worked example: a 6 MV/m field boosted at 0.6c, entry by
// entry. Code: build F^μν in NumPy, boost it as ΛFΛᵀ and find the frame where
// crossed fields lose their magnetic part (A6.4 only raised indices).
// Transfer: an LHC proton's view of its 8.33 T bending field.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { C, sf, boostTensor, Fup, Lambda, fieldsOf, boostPic, tensorTable, F_CELLS, F_COLORS, MPC2 } from './_em4c.js';

const t = String.raw;

// the worked example: E = 6.0 MV/m along y, observer at 0.6c along x
const EX = { E: 6e6, b: 0.6 };
EX.g = 1 / Math.sqrt(1 - EX.b ** 2);
{
  const Fp = boostTensor(Fup([0, EX.E, 0], [0, 0, 0]), Lambda(EX.b)), f = fieldsOf(Fp);
  EX.Ep = f.E[1]; EX.Bp = f.B[2]; EX.F02 = Fp[0][2]; EX.F12 = Fp[1][2];
}

const FPIC = (caption, hide = []) => tensorTable(F_CELLS, { caption, colors: F_COLORS, names: ['t', 'x', 'y', 'z'], hide });

export default lesson({
  id: 'phys4600.M6.2',
  title: 'The field tensor F^μν',
  minutes: 18, difficulty: 4,
  equation: t`F^{\mu\nu} = \begin{pmatrix} 0 & E_x/c & E_y/c & E_z/c \\ -E_x/c & 0 & B_z & -B_y \\ -E_y/c & -B_z & 0 & B_x \\ -E_z/c & B_y & -B_x & 0 \end{pmatrix}`,
  intro: t`[M6.1](#/lesson/phys4600.M6.1) showed that a boost mixes $\vec E$ with $\vec B$. Six numbers that mix among themselves under Lorentz transformations are the six independent entries of an **antisymmetric tensor**, $F^{\mu\nu} = -F^{\nu\mu}$. With $x^0 = ct$ and the signature $(-, +, +, +)$ of the rest of the Atlas, the electric field fills the time row (divided by $c$, so every entry is in tesla) and the magnetic field the space block. It comes from the four-potential $A^\mu = (V/c, \vec A)$ as $F^{\mu\nu} = \partial^\mu A^\nu - \partial^\nu A^\mu$ — six derivatives, which are exactly $\vec E = -\nabla V - \partial\vec A/\partial t$ and $\vec B = \nabla\times\vec A$. A boost acts on each index with one Lorentz matrix: $F'^{\mu\nu} = \Lambda^\mu{}_\alpha\Lambda^\nu{}_\beta F^{\alpha\beta}$, or as matrices $F' = \Lambda F\Lambda^{\mathsf T}$. That one line **is** M6.1’s set of rules. Lowering both indices with $\eta_{\mu\nu} = \text{diag}(-1, 1, 1, 1)$ flips the sign of the time–space entries only.`,
  symbols: [
    { tex: 'F^{\\mu\\nu}', text: t`the electromagnetic field tensor, both indices up; $\mu, \nu = 0, 1, 2, 3$ label $(ct, x, y, z)$. In tesla` },
    { tex: 'E_x,\\ E_y,\\ E_z', text: 'the electric field components, in V/m' },
    { tex: 'B_x,\\ B_y,\\ B_z', text: 'the magnetic field components, in T' },
    { tex: 'c', text: 'the speed of light (dividing E by c gives tesla)' },
    { tex: '\\Lambda^\\mu{}_\\alpha', text: t`the Lorentz transformation matrix of the boost, as in [phys3710.R2.1](#/lesson/phys3710.R2.1)` },
  ],
  why: t`Every equation of relativistic electrodynamics is written with $F^{\mu\nu}$, and its stress–energy tensor ([M6.4](#/lesson/phys4600.M6.4)) is what makes light gravitate. General relativity’s Riemann tensor is built the same way, as the antisymmetric “field strength” of a connection.`,
  visual: {
    type: 'em4c-boost',
    title: 'Six numbers in a 4 × 4 array',
    lead: t`The same fields as in M6.1, now also as the array $F^{\mu\nu}$ (rows and columns $t, x, y, z$; $c = 1$). Gold cells hold the electric field, teal cells the magnetic; dashed cells are negative. Move the observer and watch entries flow between the two kinds.`,
    tasks: [
      t`Pure electric along $y$: only $F^{02}$ and $F^{20}$ light up. Boost: $F^{02}$ grows and the magnetic cells $F^{12}$, $F^{21}$ fill in — a boost along $x$ mixes row 0 with row 1.`,
      t`The $x$ entries, $F^{01}$ and $F^{23}$, never change under a boost along $x$ (try “generic”).`,
      t`Switch to $F_{\mu\nu}$: the time row and column flip sign, the space block does not. Switch to $G^{\mu\nu}$: the electric and magnetic cells trade places.`,
    ],
    params: { preset: 'pureE', presets: ['pureE', 'pureB', 'crossedE', 'wave', 'generic'], beta: 0, panels: ['fields', 'matrix'], matrix: 'F', matrices: ['F', 'Fdown', 'G'], controls: ['beta', 'preset', 'matrix'] },
    caption: t`Exact transformation $F' = \Lambda F\Lambda^{\mathsf T}$ for a boost along $x$, signature $(-, +, +, +)$, $c = 1$, arbitrary field units. Uniform fields.`,
  },
  example: {
    prompt: t`A lab has a pure electric field $E_y = ${EX.E / 1e6}$ MV/m. Find the field tensor seen by an observer moving along $x$ at $${EX.b}c$, entry by entry, and read off $\vec E'$ and $\vec B'$.`,
    visual: boostPic({ preset: 'pureE', beta: EX.b, panels: ['matrix'] }, t`$F'^{\mu\nu}$ for a pure $E_y$ (in units where $E_y/c = 1$) seen from $0.6c$ along $x$: $F'^{02} = \gamma$, $F'^{12} = -\gamma\beta$.`),
    steps: [
      { label: 'The lab tensor', text: t`Only $F^{02} = E_y/c$ and $F^{20} = -E_y/c$ are nonzero.` },
      { label: 'The boost', text: t`$\Lambda^0{}_0 = \Lambda^1{}_1 = \gamma = ${nice(EX.g)}$, $\Lambda^0{}_1 = \Lambda^1{}_0 = -\gamma\beta = ${nice(-EX.g * EX.b)}$, $\Lambda^2{}_2 = \Lambda^3{}_3 = 1$.` },
      { label: 'One Λ per index', text: t`$F'^{02} = \Lambda^0{}_\alpha\Lambda^2{}_\sigma F^{\alpha\sigma} = \Lambda^0{}_0\Lambda^2{}_2F^{02} = \gamma E_y/c$, since $\Lambda^2{}_\sigma$ is nonzero only for $\sigma = 2$ (the sums run over $\alpha$ and $\sigma$).` },
      { label: 'A magnetic entry appears', text: t`$F'^{12} = \Lambda^1{}_0\Lambda^2{}_2F^{02} = -\gamma\beta E_y/c$. All other entries stay zero, apart from $F'^{20} = -F'^{02}$ and $F'^{21} = -F'^{12}$.` },
      { label: 'Read off', text: t`$E'_y = cF'^{02} = \gamma E_y = ${nice(sf(EX.Ep / 1e6, 3))}$ MV/m and $B'_z = F'^{12} = -\gamma\beta E_y/c \approx ${nice(sf(EX.Bp * 1e3, 3))}$ mT — M6.1’s rules, from matrix multiplication alone.` },
      { label: 'Invariant check', text: t`$F_{\mu\nu}F^{\mu\nu} = 2(B^2 - E^2/c^2)$: in the lab $-2E_y^2/c^2$; for the observer $2\gamma^2(\beta^2 - 1)E_y^2/c^2$, the same.` },
    ],
    answer: t`$F'^{02} = \gamma E_y/c$ and $F'^{12} = -\gamma\beta E_y/c$: $E'_y \approx ${nice(sf(EX.Ep / 1e6, 3))}$ MV/m, $B'_z \approx ${nice(sf(EX.Bp * 1e3, 3))}$ mT.`,
  },
  practice: [
    mcq({
      id: 'which-cell', difficulty: 1,
      prompt: t`In $F^{\mu\nu}$ (rows and columns $t, x, y, z$; signature $(-, +, +, +)$), what goes in row $x$, column $y$ — the upper of the two cells marked “?”?`,
      visual: FPIC(t`The field tensor with one entry and its mirror image hidden. Rows are the first index, columns the second.`, [[1, 2], [2, 1]]),
      choices: [t`$B_z$`, t`$-B_z$`, t`$E_z/c$`, t`$B_x$`],
      answer: 0,
      why: {
        1: t`$-B_z$ sits in the mirror cell, row $y$, column $x$: $F^{21} = -F^{12}$.`,
        2: 'The electric field lives only in the time row and column.',
        3: t`$F^{ij} = \varepsilon_{ijk}B_k$: for $ij = 12$ (that is, $xy$) the missing index is $k = 3$, $z$.`,
      },
      hints: [t`The space block holds $\vec B$: $F^{ij} = \varepsilon_{ijk}B_k$.`, t`For $i = x$, $j = y$ the leftover index is $z$, with $\varepsilon_{xyz} = +1$.`],
      teach: t`The space block of $F$ holds the magnetic field: $F^{xy} = B_z$, $F^{yz} = B_x$, $F^{zx} = B_y$.`,
      explain: t`$F^{12} = \varepsilon_{123}B_3 = B_z$. The cyclic pattern $xy \to z$, $yz \to x$, $zx \to y$ is that of $\vec B = \nabla\times\vec A$: indeed $F^{12} = \partial_xA_y - \partial_yA_x = (\nabla\times\vec A)_z$.`,
    }),
    mcq({
      id: 'lower', difficulty: 2,
      prompt: t`Lower both indices: $F_{\mu\nu} = \eta_{\mu\alpha}\eta_{\nu\beta}F^{\alpha\beta}$ with $\eta = \text{diag}(-1, 1, 1, 1)$. What happens to the entries?`,
      visual: FPIC(t`$F^{\mu\nu}$, both indices up: electric entries (gold) in the time row and column, magnetic (teal) in the space block.`),
      choices: [
        t`The time–space entries change sign ($F_{0i} = -E_i/c$); the space block is unchanged`,
        'Every entry changes sign',
        'Nothing changes: the metric is diagonal',
        t`The space block changes sign; the time–space entries are unchanged`,
      ],
      answer: 0,
      why: {
        1: t`Each lowered index brings one factor of $\eta$; the space block gets $(+1)(+1)$.`,
        2: t`Diagonal does not mean identity: $\eta_{00} = -1$.`,
        3: 'A space index brings +1, so the space block is untouched.',
      },
      hints: [t`An entry with one time index gets one factor of $\eta_{00} = -1$.`, t`$F_{00}$ would get two factors, but it is zero anyway.`],
      teach: 'Lowering both indices of F flips the sign of the electric (time–space) entries and leaves the magnetic ones.',
      explain: t`$F_{0i} = \eta_{00}\eta_{ii}F^{0i} = -E_i/c$ and $F_{ij} = F^{ij}$. In the $(+, -, -, -)$ convention it is the other way round — the space block flips — so always check which index position a book’s matrix shows ([st-g.G-SIG.1](#/lesson/st-g.G-SIG.1)).`,
    }),
    num({
      id: 'dual-inv', difficulty: 3,
      gen(r) {
        const E = r.pick([2, 3, 5]) * 1e5, B = r.pick([1, 2, 4]) * 1e-3, th = r.pick([0, 30, 60, 120]);
        const val = (-4 * E * B * Math.cos((th * Math.PI) / 180)) / C;
        return {
          prompt: t`A lab has $E = ${tex(E, 2)}$ V/m and $B = ${B * 1e3}$ mT, at $${th}^\circ$ to each other. Compute the invariant $F_{\mu\nu}G^{\mu\nu} = -4\vec E\cdot\vec B/c$, in units of $10^{-6}\ \text{T}^2$.`,
          visual: boostPic({ preset: 'custom', E: [0, 0.8, 0], B: [0, +(0.6 * Math.cos((th * Math.PI) / 180)).toFixed(3), +(0.6 * Math.sin((th * Math.PI) / 180)).toFixed(3)], beta: 0, panels: ['fields'] }, t`$\vec E$ (gold) and $c\vec B$ (teal) at $${th}^\circ$; $c = 1$, not to the problem’s scale.`),
          answer: val / 1e-6, tol: { rel: 0.01, abs: 1e-6 },
          errors: [{ value: (4 * E * B * Math.cos((th * Math.PI) / 180)) / C / 1e-6, feedback: t`Mind the sign: $F_{\mu\nu}G^{\mu\nu} = -4\vec E\cdot\vec B/c$ in this convention.` }, { value: (-4 * E * B) / C / 1e-6, feedback: t`$\vec E\cdot\vec B = EB\cos\theta$: include the angle.` }].filter((e) => Math.abs(e.value - val / 1e-6) > 0.02 * Math.abs(val / 1e-6)),
          hints: [t`$\vec E\cdot\vec B = EB\cos\theta$.`, t`Multiply by $-4/c$; V/m times T over m/s gives $\text{T}^2$.`],
          teach: t`$F_{\mu\nu}G^{\mu\nu} = -4\vec E\cdot\vec B/c$ is the second Lorentz invariant; it vanishes exactly when $\vec E \perp \vec B$ (or one field is zero).`,
          explain: th === 90 ? '' : t`$-4EB\cos${th}^\circ/c \approx ${nice(sf(val / 1e-6, 3))}\times10^{-6}\ \text{T}^2$. ${th === 0 ? 'Parallel fields: no observer can remove either one.' : th === 120 ? t`Negative $\cos\theta$ makes it positive here; either sign means both fields exist in every frame.` : 'Nonzero, so both fields exist for every observer.'}`,
        };
      },
    }),
    code({
      id: 'boost-F', difficulty: 3,
      prompt: t`Write \`F_up(E, B)\` returning $F^{\mu\nu}$ as a NumPy array ($c = 1$, signature $(-, +, +, +)$, the matrix at the top of the lesson). Then boost the crossed fields $\vec E = (0, 1, 0)$, $c\vec B = (0, 0, 0.6)$ to an observer moving at $\beta = 0.6$ along $x$ with \`Fp = L @ F @ L.T\`, and read off \`E_new\` $= (F'^{01}, F'^{02}, F'^{03})$ and \`B_new\` $= (F'^{23}, F'^{31}, F'^{12})$.`,
      starter: t`import numpy as np

def F_up(E, B):
    """F^{mu nu} with c = 1: E in the time row, B in the space block."""
    Ex, Ey, Ez = E
    Bx, By, Bz = B
    return np.zeros((4, 4))          # fill in the 16 entries

def boost_x(beta):
    g = 1 / np.sqrt(1 - beta**2)
    return np.array([[g, -g*beta, 0, 0],
                     [-g*beta, g, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]])

F = F_up((0.0, 1.0, 0.0), (0.0, 0.0, 0.6))
L = boost_x(0.6)
Fp = L @ F @ L.T
E_new = None     # (F'^01, F'^02, F'^03)
B_new = None     # (F'^23, F'^31, F'^12)
print(np.round(Fp, 3))
print(E_new, B_new)
`,
      answer: t`import numpy as np

def F_up(E, B):
    """F^{mu nu} with c = 1: E in the time row, B in the space block."""
    Ex, Ey, Ez = E
    Bx, By, Bz = B
    return np.array([[0, Ex, Ey, Ez],
                     [-Ex, 0, Bz, -By],
                     [-Ey, -Bz, 0, Bx],
                     [-Ez, By, -Bx, 0]], dtype=float)

def boost_x(beta):
    g = 1 / np.sqrt(1 - beta**2)
    return np.array([[g, -g*beta, 0, 0],
                     [-g*beta, g, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]])

F = F_up((0.0, 1.0, 0.0), (0.0, 0.0, 0.6))
L = boost_x(0.6)
Fp = L @ F @ L.T
E_new = Fp[0, 1:]
B_new = np.array([Fp[2, 3], Fp[3, 1], Fp[1, 2]])
print(np.round(Fp, 3))
print(E_new, B_new)`,
      tests: [
        { name: t`$F^{\mu\nu}$ is antisymmetric`, code: 'np.allclose(F_up((1, 2, 3), (4, 5, 6)), -F_up((1, 2, 3), (4, 5, 6)).T) and np.abs(F_up((1, 2, 3), (4, 5, 6))).sum() > 0' },
        { name: t`$F^{0i} = E_i$ and the space block holds $\vec B$: $F^{12} = B_z$, $F^{13} = -B_y$, $F^{23} = B_x$`, code: 'np.allclose(F_up((1, 2, 3), (4, 5, 6))[0, 1:], [1, 2, 3]) and np.allclose([F_up((1, 2, 3), (4, 5, 6))[1, 2], F_up((1, 2, 3), (4, 5, 6))[1, 3], F_up((1, 2, 3), (4, 5, 6))[2, 3]], [6, -5, 4])' },
        { name: t`the observer sees $\vec E' = (0, 0.8, 0)$`, code: 'E_new is not None and np.allclose(E_new, [0, 0.8, 0])' },
        { name: t`and no magnetic field at all: $\vec B' = 0$`, code: 'B_new is not None and np.allclose(B_new, 0, atol=1e-12)' },
      ],
      hints: [t`Copy the matrix from the top of the lesson with $c = 1$: row 0 is $(0, E_x, E_y, E_z)$, row 1 is $(-E_x, 0, B_z, -B_y)$, and so on.`, t`\`E_new = Fp[0, 1:]\`; \`B_new = np.array([Fp[2, 3], Fp[3, 1], Fp[1, 2]])\`.`],
      teach: t`A boost acts on each index of $F^{\mu\nu}$: $F' = \Lambda F\Lambda^{\mathsf T}$ — matrix multiplication does all of M6.1’s algebra.`,
      explain: t`At $\beta = cB/E = 0.6$ the magnetic part vanishes and $E' = \sqrt{E^2 - c^2B^2} = 0.8$, as the invariant $E^2 - c^2B^2 = 0.64$ demands. Try $\beta = 0.3$ or $0.9$: $\vec B'$ reappears, with opposite signs on either side of 0.6.`,
    }),
    num({
      id: 'entry', difficulty: 3,
      gen(r) {
        const Ez = r.pick([2, 4, 6]), By = r.pick([5, 10, 20]), b = r.pick([0.3, 0.5, 0.8]);   // MV/m, mT
        const g = 1 / Math.sqrt(1 - b * b), Ep = g * (Ez * 1e6 + b * C * By * 1e-3);
        return {
          prompt: t`In the lab, $E_z = ${Ez}$ MV/m and $B_y = ${By}$ mT. An observer moves along $x$ at $${b}c$. Using $F'^{03} = \Lambda^0{}_\alpha\Lambda^3{}_\sigma F^{\alpha\sigma}$ (summed over $\alpha$ and $\sigma$), find $E'_z = cF'^{03}$, in MV/m.`,
          visual: FPIC(t`The field tensor; the entries that feed $F'^{03}$ are in row $t$ and row $x$ of column $z$.`),
          answer: Ep / 1e6, units: 'MV/m', tol: { rel: 0.01 },
          errors: [{ value: g * (Ez * 1e6 - b * C * By * 1e-3) / 1e6, feedback: t`$F^{13} = -B_y$ and $\Lambda^0{}_1 = -\gamma\beta$: the two minus signs make $E'_z = \gamma(E_z + vB_y)$.` }, { value: (Ez * 1e6 + b * C * By * 1e-3) / 1e6, feedback: t`Keep the $\gamma$ from $\Lambda^0{}_0$ and $\Lambda^0{}_1$.` }],
          hints: [t`$\Lambda^3{}_\sigma$ is 1 for $\sigma = 3$ and 0 otherwise, so $F'^{03} = \Lambda^0{}_0F^{03} + \Lambda^0{}_1F^{13}$.`, t`$= \gamma E_z/c + (-\gamma\beta)(-B_y)$.`],
          teach: t`Each entry of the boosted tensor is a short sum: $F'^{03} = \gamma(F^{03} - \beta F^{13})$ gives $E'_z = \gamma(E_z + vB_y)$.`,
          explain: t`$E'_z = \gamma(E_z + \beta cB_y) = ${nice(sf(g, 4))}\times(${Ez} + ${nice(sf((b * C * By * 1e-3) / 1e6, 4))})$ MV/m $\approx ${nice(sf(Ep / 1e6, 3))}$ MV/m — the rule $\vec E'_\perp = \gamma(\vec E + \vec v\times\vec B)_\perp$, since $(\hat x\times\hat y)_z = +1$.`,
        };
      },
    }),
    mcq({
      id: 'force', difficulty: 3,
      prompt: t`The Lorentz force in tensor form is $\dfrac{dp^\mu}{d\tau} = qF^{\mu\nu}u_\nu$, with $u_\nu = (-\gamma c, \gamma\vec v)$. What does its time component, $\mu = 0$, say?`,
      visual: FPIC(t`Row $t$ of $F^{\mu\nu}$ holds only $\vec E/c$: it is what the time component of the force sees.`),
      choices: [
        t`$\dfrac{dp^0}{d\tau} = \dfrac{q\gamma}{c}\vec E\cdot\vec v$: the rate the field does work on the charge, over $c$ — the magnetic field does none`,
        t`It equals $q\gamma(\vec E + \vec v\times\vec B)$, the ordinary force`,
        'It is always zero, since the force is purely spatial',
        t`It gives the magnetic force $q\vec v\times\vec B$`,
      ],
      answer: 0,
      why: {
        1: t`That is the **space** part, $\mu = i$.`,
        2: t`$p^0 = E/c$ is the energy; it changes whenever $\vec E\cdot\vec v \ne 0$.`,
        3: t`Row 0 of $F$ contains only $\vec E$; the magnetic field cannot appear there.`,
      },
      hints: [t`Row 0 is $(0, E_x/c, E_y/c, E_z/c)$.`, t`$F^{0\nu}u_\nu = (E_i/c)\gamma v_i$.`],
      teach: t`The time component of $qF^{\mu\nu}u_\nu$ is the work–energy theorem: only $\vec E$ does work.`,
      explain: t`$F^{0\nu}u_\nu = F^{0i}u_i = \gamma\vec E\cdot\vec v/c$, and $p^0 = \mathcal E/c$ with $\mathcal E$ the particle’s energy, so $d\mathcal E/d\tau = q\gamma\vec E\cdot\vec v$: power, with no magnetic term. One tensor equation packs both Newton and work–energy.`,
    }),
    mcq({
      id: 'gauge', difficulty: 2,
      prompt: t`Under a gauge transformation $A^\mu \to A^\mu + \partial^\mu\lambda$ (as in [M4.2](#/lesson/phys4600.M4.2)), why is $F^{\mu\nu} = \partial^\mu A^\nu - \partial^\nu A^\mu$ unchanged?`,
      visual: FPIC(t`The tensor built from derivatives of $A^\mu$ — its six entries are the physical fields.`),
      choices: [
        t`The extra piece is $\partial^\mu\partial^\nu\lambda - \partial^\nu\partial^\mu\lambda = 0$: partial derivatives commute`,
        t`Because $\lambda$ must be constant`,
        t`Because $\partial_\mu A^\mu = 0$ in every gauge`,
        t`It is not unchanged; only $\vec E$ is`,
      ],
      answer: 0,
      why: {
        1: t`$\lambda$ can be any smooth function of space and time.`,
        2: t`$\partial_\mu A^\mu = 0$ is the Lorenz gauge — a choice, not a property of every gauge.`,
        3: t`Both $\vec E$ and $\vec B$ are unchanged: they are $F$’s entries.`,
      },
      hints: [t`Substitute $A^\nu + \partial^\nu\lambda$ and collect the $\lambda$ terms.`],
      teach: 'F = ∂A − ∂A is gauge invariant because mixed partial derivatives commute.',
      explain: t`$\partial^\mu(\partial^\nu\lambda) - \partial^\nu(\partial^\mu\lambda) = 0$. The fields are gauge invariant; the potentials are not. The same antisymmetric-derivative construction, with a connection in place of $A$, gives curvature in general relativity.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-lhc', difficulty: 3, transfer: true,
      gen(r) {
        const [E, B] = r.pick([[6.8, 8.33], [6.5, 7.96], [4, 4.9]]);
        const g = (E * 1e3) / MPC2, b = Math.sqrt(1 - 1 / (g * g)), Ep = g * b * C * B;
        return {
          prompt: t`An LHC proton at ${E} TeV ($m_pc^2 = 938.3$ MeV) crosses a dipole magnet’s vertical field of ${B} T. In the proton’s own frame, what electric field does it feel? Give it in units of $10^{12}$ V/m.`,
          visual: boostPic({ preset: 'pureB', beta: 0.9, panels: ['fields', 'matrix'] }, t`A pure magnetic field seen from a fast frame: an electric field appears, and $F^{0i}$ fills in. Drawn at $0.9c$; the proton’s $\gamma$ is thousands. $c = 1$.`),
          answer: Ep / 1e12, units: '', tol: { rel: 0.01 },
          errors: [{ value: (b * C * B) / 1e12, feedback: t`Keep the $\gamma$: $E' = \gamma vB$, and here $\gamma$ is in the thousands.` }],
          hints: [t`$\gamma = E/m_pc^2$; $\vec E' = \gamma(\vec E + \vec v\times\vec B)_\perp$ with $\vec E = 0$.`, t`$E' = \gamma vB \approx \gamma cB$.`],
          teach: 'A magnet seen from an ultrarelativistic particle is mostly a huge electric field, γvB.',
          explain: t`$\gamma \approx ${nice(sf(g, 4))}$, so $E' = \gamma vB \approx ${tex(Ep, 3)}$ V/m, and $B' = \gamma B$ too, at right angles. The invariant $E'^2 - c^2B'^2 = -c^2B^2$ is untouched — in the proton’s frame the field is nearly a light pulse, and that is what makes it radiate.`,
        };
      },
    }),
    mcq({
      id: 'cp-sign', difficulty: 3,
      prompt: t`One textbook uses the signature $(+, -, -, -)$, another $(-, +, +, +)$. Do they agree on the value of the invariant $F_{\mu\nu}F^{\mu\nu}$ for the same fields?`,
      visual: FPIC(t`$F^{\mu\nu}$ in the $(-, +, +, +)$ convention used here.`),
      choices: [
        t`Yes: flipping the sign of $\eta$ flips the two factors of $\eta$ used to lower both indices, which cancel; both get $2(B^2 - E^2/c^2)$`,
        'No: they differ by a sign',
        'No: they differ by a factor of 2',
        'Only if both define the dual the same way',
      ],
      answer: 0,
      why: {
        1: t`Two indices are lowered, so two factors of $\eta$: $(-1)^2 = 1$.`,
        2: 'The normalization does not depend on the signature.',
        3: t`$F_{\mu\nu}F^{\mu\nu}$ does not involve the dual at all (and $F_{\mu\nu}G^{\mu\nu}$’s sign does depend on how $\varepsilon$ is fixed).`,
      },
      hints: [t`$F_{\mu\nu}F^{\mu\nu} = \eta_{\mu\alpha}\eta_{\nu\beta}F^{\alpha\beta}F^{\mu\nu}$: how many factors of $\eta$?`, t`Replacing $\eta$ by $-\eta$ multiplies the product by $(-1)^2$.`],
      teach: 'A full contraction with an even number of metric factors is the same in both signatures.',
      explain: t`If both books agree on $F^{\mu\nu}$ (Griffiths’s matrix is the same as this lesson’s), then $F_{\mu\nu}$ differs only by $\eta \to -\eta$ twice: no change. Quantities with an odd number of metric factors — a four-vector’s squared length — do flip sign ([st-g.G-SIG.2](#/lesson/st-g.G-SIG.2)).`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §12.3.3–12.3.4', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 1 (the field strength tensor, −+++)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
