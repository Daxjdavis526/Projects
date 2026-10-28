// Applications of linear systems: Kirchhoff networks by mesh currents, a truss
// joint in static equilibrium, and balancing combustion reactions.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { solve, matTeX, augTeX, rr } from './_la.js';

const t = String.raw;

// composition matrices: rows are elements, columns species (products entered with a minus sign)
const species = (M, cols, rows, caption, stepper = false) => rr(M, { aug: false, picture: 'none', mode: 'rref', colLabels: cols, rowLabels: rows, caption, stepper });
const METHANE = [[1, 0, -1, 0], [4, 0, 0, -2], [0, 2, -2, -1]];
const HYDRAZINE = [[2, 2, -2, 0], [4, 0, 0, -2], [0, 4, 0, -1]];
const KEROSENE = [[12, 0, -1, 0], [26, 0, 0, -2], [0, 2, -2, -1]];

const circuit = (name, values, { caption, ...opts } = {}) => ({ type: 'em-circuit', params: { circuit: name, values, ...opts }, ...(caption ? { caption: `${caption} Ideal battery, wires and resistors.` } : {}) });
const deg = Math.PI / 180;

export default lesson({
  id: 'math2270.LA-2.4',
  title: 'Applications: circuits, statics and balancing',
  minutes: 12, difficulty: 3,
  intro: t`Conservation laws are linear, so every network obeys a linear system: one equation per loop (energy: Kirchhoff's voltage law), per joint (forces balance), per element (atoms are conserved). For circuits, give each window of the network its own clockwise **mesh current**. A resistor shared by two meshes carries the difference of their currents, so the junction rule holds automatically, and the loop law for every mesh together reads

$$R\,\mathbf i = \boldsymbol{\mathcal E}$$

Setting up the equations is the physics; solving them is elimination — or one call to \`numpy.linalg.solve\`.`,
  symbols: [
    { tex: 'R', text: t`the mesh resistance matrix, in ohms (Ω): $R_{kk}$ is the total resistance around mesh $k$; $R_{jk}$ is minus the resistance meshes $j$ and $k$ share` },
    { tex: t`\mathbf i`, text: t`the mesh currents $i_1, i_2, \dots$, in amperes (A), each taken clockwise round its own window` },
    { tex: t`\boldsymbol{\mathcal E}`, text: t`the sources: entry $k$ is the net emf, in volts (V), pushing clockwise round mesh $k$ (an emf opposing that direction counts negative)` },
    { tex: t`i_j - i_k`, text: 'the actual current in a resistor shared by meshes j and k, in mesh j’s clockwise direction' },
  ],
  why: 'Circuit simulators, structural-analysis codes and chemical-equilibrium solvers all work this way at scale: one linear equation per conservation law, then the matrix goes to a solver.',
  visual: {
    type: 'code-runner',
    title: 'Solve a bridge circuit with one call',
    lead: t`A Wheatstone bridge has three meshes, so three equations. The program builds $R$ and $\boldsymbol{\mathcal E}$ and solves them with \`numpy.linalg.solve\`. Press **Run**, then change the resistances and run it again.`,
    tasks: [
      'Run it: the detector current i₃ − i₂ is about 2 mA.',
      'Set R4 = 300.0, so that R1/R2 = R3/R4: the bridge balances and the detector current drops to zero (to rounding).',
      'Print R - R.T: the mesh matrix is symmetric. Can you see why from how it was built?',
    ],
    params: {
      code: t`import numpy as np

# A Wheatstone bridge: 10 V across two arms, R1 over R2 on the left and
# R3 over R4 on the right, with a detector Rg joining their midpoints.
# Mesh currents, all clockwise: i1 round the battery and the left arm,
# i2 round R1, R3 and Rg (top window), i3 round R2, Rg and R4 (bottom window).
E = 10.0                                         # V
R1, R2, R3, R4, Rg = 100.0, 200.0, 150.0, 250.0, 50.0   # ohms

R = np.array([[R1 + R2, -R1,          -R2         ],
              [-R1,     R1 + R3 + Rg, -Rg         ],
              [-R2,     -Rg,          R2 + R4 + Rg]])
emf = np.array([E, 0.0, 0.0])

i = np.linalg.solve(R, emf)                      # mesh currents, A
print("mesh currents (mA):", np.round(1000 * i, 3))
print("detector current i3 - i2 (mA):", round(1000 * (i[2] - i[1]), 4))
print("R symmetric?", np.allclose(R, R.T))`,
    },
    caption: 'Ideal battery and resistors; the detector is modelled as a 50 Ω resistor.',
  },
  example: {
    prompt: t`In the two-loop circuit, $\mathcal E_1 = 9$ V, $\mathcal E_2 = 3$ V, $R_1 = 3\ \Omega$, $R_2 = 2\ \Omega$ and $R_3 = 6\ \Omega$. Find the current in $R_3$ by mesh analysis.`,
    visual: circuit('twoloop', { E1: 9, E2: 3, R1: 3, R2: 2, R3: 6 }, { show: { I: true }, caption: 'The circuit with its currents (from the simulation’s own solver): compare them with the mesh calculation.' }),
    steps: [
      { label: 'Mesh currents', text: t`Let $i_1$ circulate clockwise round the left window ($\mathcal E_1$, $R_1$, $R_3$) and $i_2$ clockwise round the right window ($R_2$, $\mathcal E_2$, $R_3$). Going down through $R_3$, the current is $i_1 - i_2$.` },
      { label: 'Left loop', text: t`Clockwise: up through $\mathcal E_1$ gains 9 V; $R_1$ drops $3i_1$; $R_3$ drops $6(i_1 - i_2)$. So $9 = 3i_1 + 6(i_1 - i_2)$, or $9i_1 - 6i_2 = 9$.` },
      { label: 'Right loop', text: t`Clockwise: $R_2$ drops $2i_2$; down through $\mathcal E_2$, from its $+$ to its $-$ terminal, drops 3 V; up through $R_3$ drops $6(i_2 - i_1)$. So $-6i_1 + 8i_2 = -3$.` },
      { label: 'The matrix', text: t`$$${matTeX([[9, -6], [-6, 8]])}\begin{bmatrix} i_1 \\ i_2 \end{bmatrix} = \begin{bmatrix} 9 \\ -3 \end{bmatrix}$$ Diagonal: each mesh's total resistance. Off the diagonal: minus the shared $R_3$, the same in both places.` },
      { label: 'Eliminate', text: t`$R_2 \leftarrow R_2 + \tfrac23 R_1$ gives $4i_2 = 3$, so $i_2 = 0.75$ A; then $9i_1 = 9 + 6(0.75)$ gives $i_1 = 1.5$ A.` },
      { label: 'Answer and check', text: t`The current down through $R_3$ is $i_1 - i_2 = 0.75$ A. Junction check: 1.5 A arrives through $R_1$, and $0.75 + 0.75$ A leaves through $R_3$ and $R_2$. ✓ Note that $i_2 > 0$ pushes current into the $+$ terminal of $\mathcal E_2$: that battery is being charged.` },
    ],
    answer: t`$0.75$ A, downward through $R_3$ ($i_1 = 1.5$ A, $i_2 = 0.75$ A).`,
  },
  practice: [
    mcq({
      id: 'mesh-matrix', difficulty: 2,
      prompt: t`For the two-loop circuit, with clockwise mesh currents $i_1$ (left window) and $i_2$ (right window), which is the mesh resistance matrix $R$?`,
      choices: [
        t`$\begin{bmatrix} R_1 + R_3 & -R_3 \\ -R_3 & R_2 + R_3 \end{bmatrix}$`,
        t`$\begin{bmatrix} R_1 + R_3 & R_3 \\ R_3 & R_2 + R_3 \end{bmatrix}$`,
        t`$\begin{bmatrix} R_1 & -R_3 \\ -R_3 & R_2 \end{bmatrix}$`,
        t`$\begin{bmatrix} R_1 + R_2 + R_3 & -R_3 \\ -R_3 & R_2 + R_3 \end{bmatrix}$`,
      ],
      answer: 0,
      why: {
        1: t`Both mesh currents run clockwise, so in $R_3$ they flow in opposite directions: the shared term is $R_3(i_1 - i_2)$, which puts $-R_3$ off the diagonal.`,
        2: t`Mesh 1's own current flows through $R_3$ as well, so $R_3$ belongs in its diagonal entry: $R_1 + R_3$.`,
        3: t`$R_2$ is not in the left window; mesh 1 never passes through it.`,
      },
      hints: ['Diagonal entry k: add up every resistance mesh k passes through.', t`Off the diagonal: the resistance the two meshes share, with a minus sign when both currents are clockwise.`],
      teach: 'The mesh matrix has each mesh’s total resistance on the diagonal and minus each shared resistance off it.',
      explain: t`Mesh 1 passes through $R_1$ and $R_3$; mesh 2 through $R_2$ and $R_3$; they share $R_3$, in which their clockwise currents oppose. Hence $R = \begin{bmatrix} R_1 + R_3 & -R_3 \\ -R_3 & R_2 + R_3 \end{bmatrix}$ — symmetric, as every mesh matrix is.`,
      visual: circuit('twoloop', {}, { show: { values: false }, caption: 'The two-loop circuit: ℰ₁ and R₁ on the left, R₃ in the middle, R₂ and ℰ₂ on the right.' }),
    }),
    num({
      id: 'mesh-solve', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const E1 = r.pick([6, 9, 12, 15]), E2 = r.pick([1.5, 3, 4.5, 6]), R1 = r.int(1, 6), R2 = r.int(1, 6), R3 = r.int(2, 8);
          const [i1, i2] = solve([[R1 + R3, -R3], [-R3, R2 + R3]], [E1, -E2]), i3 = i1 - i2;
          if (Math.abs(i3) < 0.05 || Math.abs(i1) < 0.05 || Math.abs(i2) < 0.05 || Math.abs(i1 - i3) < 1e-6 || Math.abs(i2 - i3) < 1e-6) continue;
          return {
            prompt: t`In the two-loop circuit, $\mathcal E_1 = ${E1}$ V, $\mathcal E_2 = ${E2}$ V, $R_1 = ${R1}\ \Omega$, $R_2 = ${R2}\ \Omega$ and $R_3 = ${R3}\ \Omega$. Using clockwise mesh currents, find the current **down** through $R_3$, in A (negative if it flows up).`,
            answer: i3, units: 'A', tol: { rel: 0.005, abs: 1e-4 },
            errors: [{ value: i1, feedback: t`That is $i_1$, the current in $R_1$. $R_3$ carries the difference $i_1 - i_2$.` }, { value: i2, feedback: t`That is $i_2$, the current in $R_2$. $R_3$ carries the difference $i_1 - i_2$.` }, ...(Math.abs(i1 + i2 - i3) > 1e-6 && Math.abs(i1 + i2 + i3) > 1e-6 ? [{ value: i1 + i2, feedback: 'Both mesh currents are clockwise, so in the shared resistor they flow in opposite directions: subtract them.' }] : [])],
            hints: [t`The equations are $(${R1 + R3})i_1 - ${R3}i_2 = ${E1}$ and $-${R3}i_1 + (${R2 + R3})i_2 = -${E2}$.`, t`Eliminate $i_1$ (or use the $2\times2$ inverse), then take $i_1 - i_2$.`],
            teach: 'Solve the mesh system, then recover each branch current as a mesh current or a difference of two.',
            explain: t`$i_1 = ${nice(i1, 4)}$ A and $i_2 = ${nice(i2, 4)}$ A, so the current down through $R_3$ is $i_1 - i_2 = ${nice(i3, 4)}$ A.`,
            visual: circuit('twoloop', { E1, E2, R1, R2, R3 }, { caption: 'The two-loop circuit with its values; currents are what you are finding.' }),
          };
        }
        return { prompt: 'In the two-loop circuit with ℰ₁ = 9 V, ℰ₂ = 3 V, R₁ = 3 Ω, R₂ = 2 Ω, R₃ = 6 Ω, find the current down through R₃.', answer: 0.75, units: 'A', hints: ['Mesh analysis: see the worked example.'], teach: 'Solve the mesh system.', explain: t`$0.75$ A.` };
      },
    }),
    num({
      id: 'balance-aerozine', difficulty: 2,
      gen(r) {
        const ask = r.pick([['N₂', 2, 3], ['H₂O', 3, 4]]);
        return {
          prompt: t`Hydrazine and dinitrogen tetroxide ignite on contact, which is why spacecraft thrusters use them. Balance
$$x_1\,\mathrm{N_2H_4} + x_2\,\mathrm{N_2O_4} \;\to\; x_3\,\mathrm{N_2} + x_4\,\mathrm{H_2O}$$
with the smallest whole numbers. What is the coefficient of $\mathrm{${ask[0] === 'N₂' ? 'N_2' : 'H_2O'}}$?`,
          answer: ask[2], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: ask[2] / 4, feedback: t`With $x_4 = 1$ the coefficients come out as fractions. Scale them to the smallest whole numbers.` }].filter((e) => e.value !== ask[2]),
          hints: [t`One equation per element: N: $2x_1 + 2x_2 = 2x_3$; H: $4x_1 = 2x_4$; O: $4x_2 = x_4$.`, t`Four unknowns, three equations: one free variable. Let $x_4 = t$, so $x_1 = t/2$, $x_2 = t/4$, $x_3 = 3t/4$; pick $t$ to clear the fractions.`],
          teach: 'Balancing a reaction is a homogeneous linear system: one equation per element, one unknown per species.',
          explain: t`$t = 4$ gives $2\,\mathrm{N_2H_4} + \mathrm{N_2O_4} \to 3\,\mathrm{N_2} + 4\,\mathrm{H_2O}$. Check: N $4 + 2 = 6$, H $8 = 8$, O $4 = 4$. Real thrusters use mixtures (such as monomethylhydrazine) and their exhaust contains other species too; the balanced equation is the ideal complete reaction.`,
          visual: species(HYDRAZINE, ['N₂H₄', 'N₂O₄', 'N₂', 'H₂O'], ['N', 'H', 'O'], 'The element-by-species matrix: one row per element, one column per molecule, products with a minus sign. Its null space holds the balances.'),
        };
      },
    }),
    num({
      id: 'truss', difficulty: 3,
      gen(r) {
        const W = r.pick([6, 8, 10, 12, 15]), [a, b] = r.pick([[30, 60], [45, 30], [60, 45], [40, 70], [50, 25]]), ask = r.int(1, 2);
        const s = Math.sin((a + b) * deg), T1 = (W * Math.cos(b * deg)) / s, T2 = (W * Math.cos(a * deg)) / s;
        const L = 1.6, P1 = [-L * Math.cos(a * deg), L * Math.sin(a * deg)], P2 = [L * Math.cos(b * deg), L * Math.sin(b * deg)];
        return {
          prompt: t`During installation, an engine weighing ${W} kN hangs from a joint held by two straight bars: bar 1 rises to the upper left at $${a}^\circ$ above the horizontal, bar 2 to the upper right at $${b}^\circ$. Both bars are in tension. Write the two equilibrium equations at the joint and solve them: what is the tension in bar ${ask}, in kN?`,
          answer: ask === 1 ? T1 : T2, units: 'kN', tol: { rel: 0.005 },
          errors: [{ value: ask === 1 ? T2 : T1, feedback: `That is the tension in bar ${3 - ask}.` }, ...(Math.abs(W / 2 - (ask === 1 ? T1 : T2)) > 0.01 ? [{ value: W / 2, feedback: 'The bars are not symmetric, so they do not share the load equally: solve the two equations.' }] : [])],
          hints: [t`Horizontal: $-T_1\cos${a}^\circ + T_2\cos${b}^\circ = 0$. Vertical: $T_1\sin${a}^\circ + T_2\sin${b}^\circ = ${W}$.`, t`That is a $2\times2$ system for $(T_1, T_2)$; eliminate one unknown.`, t`The solution is $T_1 = \dfrac{W\cos${b}^\circ}{\sin(${a}^\circ + ${b}^\circ)}$ and $T_2 = \dfrac{W\cos${a}^\circ}{\sin(${a}^\circ + ${b}^\circ)}$.`],
          teach: 'Static equilibrium at a joint gives one linear equation per direction; the unknown member forces are the solution.',
          explain: t`$T_1 = ${nice(T1, 4)}$ kN and $T_2 = ${nice(T2, 4)}$ kN. Check the vertical balance: $${nice(T1, 4)}\sin${a}^\circ + ${nice(T2, 4)}\sin${b}^\circ = ${W}$ kN. A whole truss is solved the same way — two equations per joint, all at once, as one large linear system.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.2, 2.2], y: [-1.5, 1.8], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ param: [`${P1[0]}*t`, `${P1[1]}*t`], t: [0, 1], color: 'ink3', width: 5 }, { param: [`${P2[0]}*t`, `${P2[1]}*t`], t: [0, 1], color: 'ink3', width: 5 }],
              points: [{ x: 0, y: 0, color: 'ink', r: 6 }, { x: P1[0], y: P1[1], color: 'ink2', r: 6, label: 'support', labelDx: -20, labelDy: -14 }, { x: P2[0], y: P2[1], color: 'ink2', r: 6, label: 'support', labelDx: -20, labelDy: -14 }],
              arrows: [
                { from: [0, 0], to: [P1[0] * 0.55, P1[1] * 0.55], color: 'accent', label: 'T₁', labelDx: -22, labelDy: 6 },
                { from: [0, 0], to: [P2[0] * 0.55, P2[1] * 0.55], color: 'warn', label: 'T₂', labelDx: 8, labelDy: 6 },
                { from: [0, 0], to: [0, -1.2], color: 'bad', label: `${W} kN`, labelDx: 8, labelDy: 6 },
              ],
            },
            caption: `The joint, its two bars (grey) and the three forces on it. Angles: ${a}° and ${b}° above the horizontal. Arrows show directions only, not sizes.`,
          },
        };
      },
    }),
    code({
      id: 'bridge-solve', difficulty: 2,
      prompt: t`A strain-gauge bridge on a test stand has $\mathcal E = 12$ V, $R_1 = 220\ \Omega$, $R_2 = 330\ \Omega$, $R_3 = 270\ \Omega$, $R_4 = 390\ \Omega$ and a detector $R_g = 100\ \Omega$, wired as in the Explore program. Build the mesh matrix \`R\` and the source vector \`emf\`, solve for the mesh currents \`i\` with \`np.linalg.solve\`, and set \`ig\` to the detector current $i_3 - i_2$ in amperes.`,
      starter: t`import numpy as np

E = 12.0
R1, R2, R3, R4, Rg = 220.0, 330.0, 270.0, 390.0, 100.0

R = np.zeros((3, 3))     # TODO: the mesh resistance matrix
emf = np.zeros(3)        # TODO: the net emf round each mesh
i = np.zeros(3)          # TODO: solve R i = emf
ig = 0.0                 # TODO: the detector current, i3 - i2

print(i, ig)
`,
      answer: t`import numpy as np

E = 12.0
R1, R2, R3, R4, Rg = 220.0, 330.0, 270.0, 390.0, 100.0

R = np.array([[R1 + R2, -R1, -R2],
              [-R1, R1 + R3 + Rg, -Rg],
              [-R2, -Rg, R2 + R4 + Rg]])
emf = np.array([E, 0.0, 0.0])
i = np.linalg.solve(R, emf)
ig = i[2] - i[1]

print(i, ig)
`,
      tests: [
        { name: 'R is the mesh matrix (550, 590, 820 on the diagonal)', code: 'np.allclose(R, [[550, -220, -330], [-220, 590, -100], [-330, -100, 820]])' },
        { name: 'emf drives only the battery mesh', code: 'np.allclose(emf, [12, 0, 0])' },
        { name: 'i solves R i = emf', code: 'np.allclose(R @ i, emf) and abs(i[0] - 0.0400025328746) < 1e-9' },
        { name: 'the detector current is about 0.279 mA', code: 'abs(ig - 0.000278616206176) < 1e-9' },
      ],
      hints: [t`Copy the matrix from the Explore program: diagonal entries are each mesh's total resistance, off-diagonal entries minus the shared ones.`, t`\`emf = np.array([E, 0.0, 0.0])\`, \`i = np.linalg.solve(R, emf)\`, \`ig = i[2] - i[1]\`.`],
      teach: 'numpy.linalg.solve(R, b) does the elimination for you; your job is the physics that builds R and b.',
      explain: t`The detector carries $i_3 - i_2 \approx 0.279$ mA. It would be exactly zero if $R_1/R_2 = R_3/R_4$; here $220/330 \approx 0.667$ against $270/390 \approx 0.692$. A strain gauge changes its resistance by a tiny fraction under load, and a bridge turns that change into a measurable detector signal.`,
      visual: circuit('bridge', { E: 12, R1: 220, R2: 330, R3: 270, R4: 390, Rg: 100 }, { opts: { det: 'galv' }, caption: 'The bridge: R₁ over R₂ on the left, R₃ over R₄ on the right, the detector G (100 Ω) between the midpoints.' }),
    }),
    mcq({
      id: 'why-free', difficulty: 2,
      prompt: t`Balancing $x_1\,\mathrm{CH_4} + x_2\,\mathrm{O_2} \to x_3\,\mathrm{CO_2} + x_4\,\mathrm{H_2O}$ (methane–oxygen, as in Raptor engines) gives a system with infinitely many solutions. Why?`,
      choices: ['It is homogeneous with fewer equations than unknowns: any multiple of a balance is also a balance', 'Because chemical equations are only approximate', 'Because there are more elements than species', 'Because oxygen appears in more than one product, so its equation does not count'],
      answer: 0,
      why: {
        1: 'The atom counts are exact. The freedom is only in the overall scale: doubling every coefficient balances just as well.',
        2: 'Here there are 3 elements and 4 species — fewer equations than unknowns, which is what leaves a free variable.',
        3: 'Every element gives an equation, however many molecules contain it.',
      },
      hints: ['What are the right-hand sides of the element equations?', 'If (1, 2, 1, 2) balances the reaction, what about (2, 4, 2, 4)?'],
      teach: 'A balancing system is homogeneous, so its solutions form a line through the origin; chemists pick the point with the smallest whole numbers.',
      explain: t`C, H and O give three homogeneous equations in four unknowns, so one variable is free and every multiple of $(1, 2, 1, 2)$ balances: $\mathrm{CH_4} + 2\,\mathrm{O_2} \to \mathrm{CO_2} + 2\,\mathrm{H_2O}$.`,
      visual: species(METHANE, ['CH₄', 'O₂', 'CO₂', 'H₂O'], ['C', 'H', 'O'], 'The element-by-species matrix for methane–oxygen (products with a minus sign). Step through to its RREF: the last column has no pivot.', true),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-kerosene', difficulty: 3, transfer: true,
      prompt: t`Rocket kerosene (RP-1) is often modelled as dodecane, $\mathrm{C_{12}H_{26}}$. Balance its complete combustion with liquid oxygen,
$$x_1\,\mathrm{C_{12}H_{26}} + x_2\,\mathrm{O_2} \;\to\; x_3\,\mathrm{CO_2} + x_4\,\mathrm{H_2O},$$
using the smallest whole numbers. What is $x_2$, the coefficient of oxygen?`,
      answer: 37, tol: { rel: 0, abs: 0.01 },
      errors: [{ value: 18.5, feedback: t`That balances one molecule of fuel, but not in whole numbers: double everything.` }],
      hints: [t`C: $12x_1 = x_3$. H: $26x_1 = 2x_4$. O: $2x_2 = 2x_3 + x_4$.`, t`Let $x_1 = t$: then $x_3 = 12t$, $x_4 = 13t$ and $x_2 = (24t + 13t)/2 = 18.5t$.`],
      teach: 'Balance by solving the element equations with one free variable, then scale to the smallest whole numbers.',
      explain: t`With $t = 2$: $2\,\mathrm{C_{12}H_{26}} + 37\,\mathrm{O_2} \to 24\,\mathrm{CO_2} + 26\,\mathrm{H_2O}$ (C $24 = 24$, H $52 = 52$, O $74 = 48 + 26$). By mass that is $37 \times 32 / (2 \times 170.3) \approx 3.5$ kg of oxygen per kg of fuel. Real kerosene engines run fuel-rich, at about 2.3–2.7, so their exhaust also holds CO and H₂: this equation is the stoichiometric ideal, not what leaves the nozzle.`,
      visual: species(KEROSENE, ['C₁₂H₂₆', 'O₂', 'CO₂', 'H₂O'], ['C', 'H', 'O'], 'The element-by-species matrix for kerosene–oxygen: one row per element, one column per molecule, products with a minus sign.'),
    }),
    num({
      id: 'cp-ladder', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const E = r.pick([6, 9, 12, 24]), R1 = r.int(1, 6), R2 = r.int(2, 8), R3 = r.int(1, 6), R4 = r.int(2, 8);
          const [i1, i2] = solve([[R1 + R2, -R2], [-R2, R2 + R3 + R4]], [E, 0]);
          if (Math.abs(i1 - i2) < 0.02 || i2 < 0.05 || Math.abs(i1 - 2 * i2) < 1e-6) continue;
          return {
            prompt: t`In the ladder circuit, $\mathcal E = ${E}$ V, $R_1 = ${R1}\ \Omega$, $R_2 = ${R2}\ \Omega$, $R_3 = ${R3}\ \Omega$ and $R_4 = ${R4}\ \Omega$. Set up the two mesh equations and find the current in $R_4$, in A.`,
            answer: i2, units: 'A', tol: { rel: 0.005 },
            errors: [{ value: i1, feedback: t`That is $i_1$, the current in $R_1$. $R_4$ lies only in the second mesh.` }, { value: i1 - i2, feedback: t`That is the current in $R_2$, the resistor the two meshes share.` }],
            hints: [t`Mesh 1 passes through $R_1$ and $R_2$; mesh 2 through $R_2$, $R_3$ and $R_4$; they share $R_2$.`, t`$(${R1 + R2})i_1 - ${R2}i_2 = ${E}$ and $-${R2}i_1 + (${R2 + R3 + R4})i_2 = 0$.`],
            teach: 'Diagonal: each mesh’s total resistance; off-diagonal: minus the shared resistance; right side: the emf in each mesh.',
            explain: t`$i_1 = ${nice(i1, 4)}$ A and $i_2 = ${nice(i2, 4)}$ A. $R_4$ is in mesh 2 only, so it carries $${nice(i2, 4)}$ A.`,
            visual: circuit('ladder', { E, R1, R2, R3, R4 }, { caption: 'The ladder: R₁ then R₃ along the top, R₂ and R₄ as rungs. Currents are what you are finding.' }),
          };
        }
        return { prompt: 'Ladder: ℰ = 12 V, R₁ = 2 Ω, R₂ = 4 Ω, R₃ = 2 Ω, R₄ = 2 Ω. Current in R₄?', answer: 1, units: 'A', hints: ['Two mesh equations.'], teach: 'Mesh analysis.', explain: t`$1$ A.` };
      },
    }),
    mcq({
      id: 'cp-symmetric', difficulty: 2,
      prompt: t`The mesh matrix of the bridge circuit is
$$${matTeX([[550, -220, -330], [-220, 590, -100], [-330, -100, 820]])}\ \Omega.$$
Why is it symmetric ($R_{jk} = R_{kj}$)?`,
      choices: [
        t`$R_{jk}$ and $R_{kj}$ are both minus the resistance that meshes $j$ and $k$ share`,
        'Because current in a resistor can flow either way',
        'Because Ohm’s law treats voltage and current symmetrically',
        'It is a coincidence of these particular values',
      ],
      answer: 0,
      why: {
        1: 'Current direction affects signs in the loop equations, but the symmetry comes from the shared resistances.',
        2: 'Ohm’s law, V = IR, is not symmetric in V and I; the symmetry is in how meshes share resistors.',
        3: 'Every mesh matrix of resistors is symmetric, whatever the values.',
      },
      hints: [t`Which resistance does entry $R_{12}$ describe? And $R_{21}$?`],
      teach: 'A mesh matrix is symmetric because a resistor shared by two meshes enters both of their loop equations in the same way.',
      explain: t`$R_{12} = R_{21} = -220\ \Omega$: both describe $R_1$, shared by meshes 1 and 2. Symmetric matrices like this one — like an inertia or stress tensor — get a lesson of their own in LA-3.4.`,
      visual: rr([[550, -220, -330], [-220, 590, -100], [-330, -100, 820]], { aug: false, picture: 'none', colLabels: ['i₁', 'i₂', 'i₃'], caption: 'The bridge’s mesh matrix in ohms: each column multiplies one mesh current.' }),
    }),
  ],
  sources: [
    { label: 'Lay, Lay & McDonald, Linear Algebra and Its Applications (6th ed.), §1.6: Applications of linear systems', url: 'https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235/9780135851203' },
    { label: 'OpenStax University Physics Vol. 2, §10.3: Kirchhoff’s rules', url: 'https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules' },
  ],
});
