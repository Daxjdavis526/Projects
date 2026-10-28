// Linear and nonlinear media (Griffiths §6.4): M = χ_m H and B = μH with
// real susceptibilities (Griffiths Table 6.1); the linear sphere in a uniform
// field (B inside = 3μ_r/(μ_r + 2) B₀, M5.3's dielectric sphere in magnetic
// dress) as the susceptibility shift an MRI scanner sees; ferromagnets, where
// μ is not a constant — the B–H loop of soft iron against Alnico 5 and NdFeB
// (em3h-loop), remanence, coercivity, the Curie temperature; the magnetic
// circuit (∮H·dl = NI, the gap dominates); a permanent magnet's operating
// point from its demagnetizing factor and recoil line. Transfers: a Hall
// thruster's magnetic circuit, a magnetorquer's shape-limited core gain, and
// an MRI passive shim. The intro magnetic circuit is not in phys2220; this
// lesson builds it from M7.2's Ampère's law for H.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, PI, sf, circle, polygon, bare } from './_mag.js';
import { CHI, JS_IRON, MATERIALS, loopB, spheroidN, magPic, loopPic } from './_matter.js';

const t = String.raw;
// NdFeB: remanence about 1.3 T and recoil permeability about 1.05 (typical sintered grades; both vary)
const BR = 1.3, MUREC = 1.05;
/** B inside a linearly recoiling ellipsoidal magnet with demagnetizing factor N: B_r(1 − N)/(1 + χ_rec N). */
const opB = (N) => (BR * (1 - N)) / (1 + (MUREC - 1) * N);

/** A C-shaped iron yoke with a gap at the right and a winding on the left. */
const yokePic = (caption, label = 'gap g') => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [
      { fn: '1.1', lower: '0.75', from: -1.6, to: 1.4, color: 'ink3', alpha: 0.45 },
      { fn: '-0.75', lower: '-1.1', from: -1.6, to: 1.4, color: 'ink3', alpha: 0.45 },
      { fn: '0.75', lower: '-0.75', from: -1.6, to: -1.25, color: 'ink3', alpha: 0.45 },
      { fn: '0.75', lower: '0.12', from: 1.05, to: 1.4, color: 'ink3', alpha: 0.45 },
      { fn: '-0.12', lower: '-0.75', from: 1.05, to: 1.4, color: 'ink3', alpha: 0.45 },
    ],
    curves: [...[-0.55, -0.35, -0.15, 0.05, 0.25, 0.45].map((y) => ({ param: [`-1.43 + 0.3*cos(t)`, `${y} + 0.06*sin(t)`], t: [0, 2 * PI], color: 'warn', width: 1.6 })),
      ...polygon([[-1.425, -0.925], [1.225, -0.925], [1.225, 0.925], [-1.425, 0.925]], 'violet', { width: 1.3, dash: [5, 4] })],
    arrows: [{ from: [1.22, -0.1], to: [1.22, 0.1], color: 'accent', width: 2 }],
    points: [{ x: 1.45, y: 0, r: 0, label, labelDx: 8, labelDy: 0, color: 'accent' }, { x: -1.75, y: 0.55, r: 0, label: 'N turns, I', labelAlign: 'right', labelDx: 0, labelDy: 0, color: 'warn' }, { x: -0.1, y: 0.55, r: 0, label: 'path through the iron and gap', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'violet' }],
  }),
  caption,
});

/** A long thin rod of material along a uniform field (violet), with small induced moments (gold) along or against it. */
const rodPic = (chi, caption) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: '0.18', lower: '-0.18', from: -1.6, to: 1.6, color: 'teal', alpha: 0.35 }],
    arrows: [...[-0.9, -0.55, 0.55, 0.9].map((y) => ({ from: [-2.4, y], to: [2.4, y], color: 'violet', width: 1.4 })),
      ...[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (chi > 0 ? { from: [x - 0.18, 0], to: [x + 0.18, 0], color: 'gold', width: 2 } : { from: [x + 0.18, 0], to: [x - 0.18, 0], color: 'gold', width: 2 }))],
    points: [{ x: 2.35, y: 0.9, r: 0, label: 'B₀', labelDx: 4, labelDy: -10, color: 'violet' }, { x: 0, y: -0.18, r: 0, label: 'sample', labelAlign: 'center', labelDx: 0, labelDy: 14, color: 'teal' }],
  }),
  caption,
});

// the worked example: a C-yoke electromagnet
const EX_L = 0.3, EX_G = 0.01, EX_MUR = 2000, EX_B = 0.3;
const EX_HG = EX_B / MU0, EX_HFE = EX_B / (MU0 * EX_MUR), EX_NI = EX_HG * EX_G + EX_HFE * EX_L;
// what the model soft-iron curve says at that H (rising branch), and the circuit redone with that μ_r
const EX_BCURVE = loopB(MATERIALS.iron, EX_HFE, 'up'), EX_MUC = EX_BCURVE / (MU0 * EX_HFE);
const EX_NI2 = EX_HG * EX_G + (EX_B / (MU0 * EX_MUC)) * EX_L;

// a linear sphere in a uniform field: field lines are contours of the flux function ψ = sA_φ (axis along x,
// s = |y|): (1 + 2β)y²/2 inside, y²(1/2 + β/r³) outside, β = (μ_r − 1)/(μ_r + 2). μ_r = 3 here, hugely exaggerated.
const BETA = 0.4;
const PSI = `step(1 - (x^2 + y^2))*${1 + 2 * BETA}*y^2/2 + step((x^2 + y^2) - 1)*y^2*(0.5 + ${BETA}/(x^2 + y^2)^1.5)`;
const spherePic = (caption) => ({
  type: 'c3-contour',
  params: { f: PSI, x: [-3.2, 3.2], y: [-1.6, 1.6], levels: [0.02, 0.08, 0.18, 0.32, 0.5, 0.72, 0.98, 1.28], labels: false, fill: false, aspect: 'wide', xlabel: '', ylabel: '', n: 160,
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI], color: 'teal', width: 2 }] },
  caption,
});

export default lesson({
  id: 'phys3600.M7.3',
  title: 'Linear and nonlinear media',
  minutes: 18, difficulty: 3,
  equation: t`\vec M = \chi_m\vec H, \qquad \vec B = \mu_0(1 + \chi_m)\vec H = \mu\vec H`,
  intro: t`For most materials the magnetization is simply proportional to the auxiliary field: $\vec M = \chi_m\vec H$, with a dimensionless **magnetic susceptibility** $\chi_m$. It is tiny: negative for diamagnets (water about $${tex(CHI.water.chi, 2)}$), positive for paramagnets (aluminium about $+${tex(CHI.aluminium.chi, 2)}$, liquid oxygen about $+${tex(CHI.lox.chi, 2)}$). Then $\vec B = \mu\vec H$ with the **permeability** $\mu = \mu_0(1 + \chi_m) = \mu_0\mu_r$, and every problem of [M5.3](#/lesson/phys3600.M5.3) has a magnetic twin. **Ferromagnets** break the rule. Iron’s $\vec M$ depends on the history of $\vec H$ — the **hysteresis loop** — and saturates at $\mu_0M_s \approx ${JS_IRON}$ T; it keeps a **remanence** when the drive is gone, and a reverse field, the **coercivity**, is needed to wipe it out. Soft magnets (iron) have a thin loop and are easy to turn round; hard magnets (NdFeB) have a fat one and make permanent magnets. Ampère’s law for $\vec H$ still holds: set $\oint\vec H\cdot d\vec l = NI$, then read $\vec B$ off the material’s curve.`,
  symbols: [
    { tex: '\\chi_m', text: 'the magnetic susceptibility: dimensionless, negative for diamagnets, positive for paramagnets' },
    { tex: '\\mu', text: t`the permeability, $\mu_0(1 + \chi_m)$, in $\text{N/A}^2$ (or H/m)` },
    { tex: '\\mu_r', text: t`the relative permeability $\mu/\mu_0 = 1 + \chi_m$: about 1 for most matter, thousands for iron on part of its curve` },
    { tex: '\\vec H,\\ \\vec M', text: 'the auxiliary field and the magnetization, in A/m' },
    { tex: '\\vec B', text: 'the magnetic field, in tesla' },
  ],
  why: t`Magnetorquers, Hall thruster pole pieces, transformers and MRI magnets are all designed with $\mu$, $\chi_m$ and the B–H loop — and they fail in the places where “$\mu$ is a constant” stops being true.`,
  visual: {
    type: 'em3h-loop',
    title: 'Soft and hard: the B–H loop',
    lead: t`The B–H loop of a ferromagnet. Choose a material, set the applied $H$ (a fraction of the range shown) and the direction it last swept from, or press **Cycle** to sweep it round. The dashed curve is the material’s own share, $\mu_0M = B - \mu_0H$.`,
    tasks: [
      t`Soft iron: the loop is thin — a coercivity of about 80 A/m — and saturates near ${JS_IRON} T. Read $B/\mu_0H$ at a few points: it rises into the thousands and then falls. “The permeability of iron” is not one number.`,
      t`NdFeB: the $H$ axis is now in kA/m, and the loop is enormous. At $H = 0$ on the falling branch $B$ is still about 1.3 T — the remanence — and it takes about 1000 kA/m backward to remove $\vec M$.`,
      t`Compare the loop areas: the energy lost per cycle per unit volume. Soft iron loses thousands of times less, which is why transformer and magnetorquer cores are soft.`,
    ],
    params: { material: 'iron', materials: ['iron', 'alnico', 'ndfeb'], H: 150, branch: 'up' },
    caption: t`A smooth model of each major loop, fitted to typical values: soft iron ($\mu_0M_s = ${JS_IRON}$ T, $H_c \approx 80$ A/m, $B_r \approx 1.2$ T), Alnico 5 ($B_r \approx 1.28$ T, $H_c \approx 51$ kA/m) and NdFeB grade N42 ($B_r \approx 1.31$ T, $H_{cJ} \approx 1000$ kA/m). Real loops vary with grade, heat treatment and temperature; minor loops are not drawn.`,
  },
  example: {
    prompt: t`A C-shaped soft-iron yoke has a mean path of ${EX_L * 100} cm through the iron and a ${EX_G * 1000} mm air gap, both of the same cross-section. You want $${EX_B}$ T in the gap. Take $\mu_r \approx ${EX_MUR}$ for the iron at this field. How many ampere-turns must the winding carry?`,
    visual: yokePic(t`The yoke (grey) with its winding (orange) and gap; the dashed loop is the path for $\oint\vec H\cdot d\vec l$. Fringing at the gap ignored; not to scale.`),
    steps: [
      { label: 'Same flux', text: t`$\nabla\cdot\vec B = 0$: the flux round the circuit is the same everywhere, and with equal cross-sections (and no fringing) $B$ is ${EX_B} T in the iron and in the gap alike.` },
      { label: 'H in each part', text: t`In the gap $H_g = B/\mu_0 \approx ${tex(EX_HG, 3)}$ A/m. In the iron $H_{\text{Fe}} = B/\mu_0\mu_r \approx ${nice(sf(EX_HFE, 3))}$ A/m — ${EX_MUR} times less.` },
      { label: 'Ampère for H', text: t`$\oint\vec H\cdot d\vec l = H_{\text{Fe}}\ell + H_gg = NI$: $(${nice(sf(EX_HFE, 3))})(${EX_L}) + (${tex(EX_HG, 3)})(${EX_G}) \approx ${nice(sf(EX_HFE * EX_L, 3))} + ${nice(sf(EX_HG * EX_G, 4))}$, so $NI \approx ${nice(sf(EX_NI, 3))}$ A.` },
      { label: 'Read it', text: t`The 1 cm gap takes ${nice(sf((100 * EX_HG * EX_G) / EX_NI, 3))}% of the ampere-turns; the 30 cm of iron barely ${nice(sf((100 * EX_HFE * EX_L) / EX_NI, 2))}%. That is why $\mu_r$ need only be roughly known — and why the iron must not saturate, where $\mu_r$ collapses.` },
      { label: 'Check the iron', text: t`The model soft-iron curve of the Explore step gives $${nice(sf(EX_BCURVE, 2))}$ T at $H \approx ${nice(sf(EX_HFE, 3))}$ A/m on its rising branch — a local $\mu_r$ nearer ${nice(sf(EX_MUC, 2))} than ${EX_MUR}. Redo the sum with that and $NI \approx ${nice(sf(EX_NI2, 3))}$ A: a ${nice(sf((100 * (EX_NI - EX_NI2)) / EX_NI, 1))}% change. The gap makes the answer robust; only near saturation, above about 1.5 T, would the iron’s share grow.` },
    ],
    answer: t`$NI \approx ${nice(sf(EX_NI, 3))}$ ampere-turns — say 1000 turns carrying ${nice(sf(EX_NI / 1000, 2))} A — almost all of it to drive the gap.`,
  },
  practice: [
    num({
      id: 'chi-m', difficulty: 2,
      gen(r) {
        const key = r.pick(['water', 'aluminium', 'copper', 'lox']), B0 = r.pick([1.5, 3, 7]);
        const { name, chi } = CHI[key], M = (chi * B0) / MU0;
        return {
          prompt: t`A long thin rod of ${name} lies along the field inside a ${B0} T MRI magnet, so the $H$ inside it equals the applied $B_0/\mu_0$. Its susceptibility is $\chi_m \approx ${tex(chi, 2)}$. What magnetization does it acquire? (Negative if it points against the field.)`,
          visual: rodPic(chi, t`The sample (teal) along the scanner’s field (violet); its induced moments (gold) point ${chi > 0 ? 'along' : 'against'} the field. Not to scale.`),
          answer: M, units: 'A/m', tol: { rel: 0.01 },
          errors: [{ value: chi * B0, feedback: t`$\chi_m$ multiplies $H$, in A/m — not $B$ in tesla. First $H = B_0/\mu_0$.` }],
          hints: [t`$H = B_0/\mu_0$, in A/m.`, t`$M = \chi_mH = \chi_mB_0/\mu_0$.`],
          teach: t`In a linear material $M = \chi_mH$: tiny and against the field for a diamagnet, along it for a paramagnet.`,
          explain: t`$H = ${B0}/\mu_0 \approx ${tex(B0 / MU0, 3)}$ A/m and $M = \chi_mH \approx ${nice(sf(M, 3))}$ A/m${chi < 0 ? ', against the field' : ', along the field'} — compare about $10^6$ A/m in a permanent magnet. Small as it is, the field it adds is $\mu_0M = \chi_mB_0$: a few parts per million of the scanner’s field${key === 'lox' ? ', or thousands for liquid oxygen' : ''}, and MRI images are sensitive to exactly that.`,
        };
      },
    }),
    num({
      id: 'mu-apparent', difficulty: 2,
      gen(r) {
        const H = r.pick([100, 120, 150, 200, 300]), B = +loopB(MATERIALS.iron, H, 'up').toFixed(2);
        const mu = B / (MU0 * H);
        return {
          prompt: t`On the rising branch of a soft-iron loop, $B = ${B}$ T at $H = ${H}$ A/m. What is the apparent relative permeability $B/\mu_0H$ there?`,
          visual: loopPic({ material: 'iron', H, branch: 'up' }, t`Soft iron’s B–H loop (model), with the point asked about (orange). Typical values; real iron varies with purity and annealing.`),
          answer: mu, tol: { rel: 0.01 },
          errors: [{ value: B / H, feedback: t`Divide by $\mu_0$ too: $\mu_r = B/(\mu_0H)$ is dimensionless.` }],
          hints: [t`$\mu_r = \dfrac{B}{\mu_0H}$.`, t`$\mu_0H = (${tex(MU0, 6)})(${H})$ T.`],
          teach: t`For iron, $\mu_r = B/\mu_0H$ depends on where on the loop you are — it is a local ratio, not a material constant.`,
          explain: t`$\mu_r = \dfrac{${B}}{(${tex(MU0, 6)})(${H})} \approx ${nice(sf(mu, 3))}$. Try another point of the curve and you get a different number: near the steep part it is several thousand, near saturation it falls toward 1, and on the falling branch it can even be negative.`,
        };
      },
    }),
    num({
      id: 'circuit', difficulty: 3,
      gen(r) {
        const g = r.pick([2, 3, 5]), l = r.pick([0.3, 0.4, 0.5]), mur = r.pick([800, 1500]), B = r.pick([0.4, 0.6, 0.8]);
        const NI = (B / MU0) * (g * 1e-3 + l / mur);
        return {
          prompt: t`An iron yoke has a ${l * 100} cm path through the iron ($\mu_r \approx ${mur}$ at the working field) and a ${g} mm gap of the same cross-section. How many ampere-turns give $${B}$ T in the gap?`,
          visual: yokePic(t`The yoke, its winding and the gap; the dashed loop is the path for Ampère’s law. Fringing ignored; not to scale.`),
          answer: NI, units: 'A', tol: { rel: 0.01 },
          errors: [
            { value: ((B / MU0) * l) / mur, feedback: t`That is the iron’s share alone. The gap, where $H = B/\mu_0$, needs far more.` },
            { value: (B / MU0) * g * 1e-3, feedback: t`That is the gap alone. With $\mu_r = ${mur}$ the iron’s ${l * 100} cm adds $B\ell/\mu_0\mu_r$ — here not negligible.` },
          ].filter((e) => Math.abs(e.value - NI) > 0.03 * NI),
          hints: [t`$\oint\vec H\cdot d\vec l = H_{\text{Fe}}\ell + H_gg = NI$, with the same $B$ in both parts.`, t`$H_g = B/\mu_0$ and $H_{\text{Fe}} = B/\mu_0\mu_r$, so $NI = \dfrac{B}{\mu_0}\left(g + \dfrac{\ell}{\mu_r}\right)$.`],
          teach: t`In a magnetic circuit the ampere-turns split between iron and gap in the ratio $\ell/\mu_r$ to $g$: a small gap usually dominates.`,
          explain: t`$NI = \dfrac{${B}}{\mu_0}\left(${g / 1000} + \dfrac{${l}}{${mur}}\right) \approx ${nice(sf(NI, 3))}$ A. The iron behaves like ${nice(sf((l / mur) * 1000, 2))} mm of extra gap: the “reluctance” picture, in which $\ell/\mu$ plays resistance and $NI$ an emf.`,
        };
      },
    }),
    num({
      id: 'linear-sphere', difficulty: 3,
      gen(r) {
        const key = r.pick(['water', 'aluminium', 'copper']), { name, chi } = CHI[key];
        const mur = 1 + chi, ppm = ((3 * mur) / (mur + 2) - 1) * 1e6;
        return {
          prompt: t`A small sphere of ${name} ($\chi_m \approx ${tex(chi, 2)}$) sits in an MRI scanner’s uniform field $B_0$. Inside a linear sphere the field is uniform, $B = \dfrac{3\mu_r}{\mu_r + 2}B_0$. By how many parts per million does $B$ inside differ from $B_0$? (Negative if it is weaker.)`,
          visual: spherePic(t`Field lines of a uniform field bent by a linear sphere (teal), from the exact solution. Its permeability is hugely exaggerated here ($\mu_r = 3$, so lines crowd in); a diamagnet such as water pushes them out instead, by parts per million.`),
          answer: ppm, tol: { rel: 0.01 },
          errors: [
            { value: chi * 1e6, feedback: t`$\chi_m$ alone overstates it: the sphere’s own demagnetizing field cuts the change to $\tfrac{3\mu_r}{\mu_r + 2} - 1 = \dfrac{2\chi_m}{3 + \chi_m} \approx \tfrac23\chi_m$.` },
          ],
          hints: [t`$\dfrac{3\mu_r}{\mu_r + 2} - 1 = \dfrac{2(\mu_r - 1)}{\mu_r + 2} = \dfrac{2\chi_m}{3 + \chi_m}$.`, t`For $|\chi_m| \ll 1$ that is $\approx \tfrac23\chi_m$; multiply by $10^6$ for parts per million.`],
          teach: t`A linear sphere in a uniform field changes the field inside by $2\chi_m/(3 + \chi_m)$ — the magnetic twin of the dielectric sphere.`,
          explain: t`$\dfrac{2\chi_m}{3 + \chi_m} \approx ${nice(sf(ppm, 3))}$ ppm. MRI measures proton frequencies to well under a part per million, so the boundaries between tissue, air and metal implants shift the local field enough to distort images — the **susceptibility artefact** — and shims are added to undo the magnet’s own small inhomogeneity.`,
        };
      },
    }),
    mcq({
      id: 'soft-hard', difficulty: 2,
      prompt: t`Here is the B–H loop of soft iron: a thin loop, coercivity about 80 A/m. For which job is it **wrong**?`,
      visual: loopPic({ material: 'iron', H: 0, branch: 'down' }, t`Soft iron’s loop (model, typical values), with the remanence point marked. Its coercivity is tiny: 80 A/m.`),
      choices: ['The permanent magnet that holds a latch valve shut', 'The core of a magnetorquer rod', 'The laminated core of a 50 Hz power transformer', 'The pole pieces of a Hall thruster’s magnetic circuit'],
      answer: 0,
      why: {
        1: t`Exactly right for iron: a soft core multiplies the coil’s moment while it is on, and loses it when the current stops — a torquer must be switchable.`,
        2: t`Right for soft iron (in practice silicon steel, in thin laminations against eddy currents): its thin loop keeps the energy lost every cycle small.`,
        3: t`Pole pieces only guide flux from the coils or magnets; soft iron with high saturation is the usual choice.`,
      },
      hints: [t`A permanent magnet must resist its own demagnetizing field, $H = -NM$ — hundreds of kA/m for a stubby magnet.`, 'Compare 80 A/m with that.'],
      teach: 'Soft magnets (small coercivity, thin loop) carry flux and switch easily; hard magnets (large coercivity) stay magnetized against their own demagnetizing field.',
      explain: t`A permanent magnet’s own demagnetizing field is a sizeable fraction of $M$ — around $10^5$ A/m or more — while soft iron gives up its magnetization at about 80 A/m. A soft-iron “magnet” wipes itself out unless its flux path is closed with a keeper. Latch valves use NdFeB or SmCo.`,
    }),
    num({
      id: 'operating', difficulty: 3,
      gen(r) {
        const [k, shape] = r.pick([[1, 'a sphere'], [2, 'a prolate spheroid twice as long as it is wide, magnetized along its length'], [4, 'a prolate spheroid four times as long as it is wide, magnetized along its length'], [0.5, 'an oblate spheroid half as thick as it is wide, magnetized through its thickness']]);
        const N = spheroidN(k), B = opB(N);
        return {
          prompt: t`An NdFeB magnet with remanence $B_r = ${BR}$ T recoils linearly, $B = B_r + \mu_0\mu_{\text{rec}}H$ with $\mu_{\text{rec}} = ${MUREC}$, in the second quadrant. It is shaped as ${shape}, with demagnetizing factor $N = ${nice(sf(N, 4))}$ (so $H = -NM$ inside and $M = B/\mu_0 - H$). What is $B$ inside?`,
          visual: loopPic({ material: 'ndfeb', quadrant: true, H: 0, branch: 'down', intrinsic: true }, t`NdFeB’s demagnetization curve (model; solid $B$, dashed $\mu_0M$), with the remanence marked. Nearly a straight line until the knee near $-850$ kA/m.`),
          answer: B, units: 'T', tol: { rel: 0.01 },
          errors: [
            { value: BR, feedback: t`$B_r$ is the field in a closed circuit ($N = 0$). The magnet’s own poles set $H = -NM$, which lowers $B$.` },
            { value: BR * N, feedback: t`Upside down: with $N$ near 1 (a flat disk) the field is weakest, not strongest.` },
          ].filter((e) => Math.abs(e.value - B) > 0.02 * B),
          hints: [t`Substitute $H = -NM$ and $M = B/\mu_0 - H$: $H = -N(B/\mu_0 - H)$, so $\mu_0H = -\dfrac{N}{1 - N}B$ — the load line.`, t`Put that into $B = B_r + \mu_{\text{rec}}\mu_0H$: $B\left(1 + \dfrac{\mu_{\text{rec}}N}{1 - N}\right) = B_r$, so $B = \dfrac{B_r(1 - N)}{1 + (\mu_{\text{rec}} - 1)N}$.`],
          teach: 'A permanent magnet sits where its recoil line meets its load line, B = −μ₀(1 − N)/N · H: the flatter the magnet, the lower B.',
          explain: t`$B = \dfrac{${BR}(1 - ${nice(sf(N, 4))})}{1 + ${nice(sf(MUREC - 1, 2))}(${nice(sf(N, 4))})} \approx ${nice(sf(B, 3))}$ T, with $H = -\dfrac{N}{1 - N}\dfrac{B}{\mu_0} \approx ${nice(sf(-((N / (1 - N)) * B) / MU0 / 1e3, 3))}$ kA/m — well short of NdFeB’s knee, so the magnet is safe. The same shape in Alnico, with its knee near $-50$ kA/m, would partly demagnetize itself.`,
        };
      },
    }),
    mcq({
      id: 'curie', difficulty: 2,
      prompt: t`A magnetized soft-iron part is heated above 770 °C (1043 K) and then cooled again with no field applied. What is it now?`,
      visual: { type: 'graph', params: { x: [0, 1300], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'T (K)', ylabel: 'Mₛ / Mₛ(0)', curves: [{ fn: '(max(1 - (x/1043)^2.5, 0))^0.36', domain: [0, 1043], color: 'accent', width: 2.6 }, { fn: '0', domain: [1043, 1300], color: 'accent', width: 2.6 }], vlines: [{ x: 1043, label: 'Curie point', color: 'warn' }] }, caption: 'The spontaneous magnetization of iron against temperature — the shape is schematic, the Curie temperature (1043 K) real. Above it the order is gone and iron is paramagnetic.' },
      choices: ['Demagnetized: above the Curie point the spins disorder, and on cooling the domains form with random directions', 'Still magnetized as before: magnetization is a permanent property of the atoms', 'Magnetized the other way, because heating reverses the domains', 'Permanently non-magnetic: heating destroys ferromagnetism for good'],
      answer: 0,
      why: {
        1: 'The atoms keep their moments, but the alignment between them — what makes M large — is a collective order that heat destroys.',
        2: 'Nothing picks out a reversed direction: with no field the domains settle in all directions and cancel.',
        3: 'The change is reversible: below the Curie point iron is ferromagnetic again, just with its domains unaligned.',
      },
      hints: ['Above the Curie temperature iron is paramagnetic. What sets the domains’ directions as it cools again?'],
      teach: 'Ferromagnetic order exists only below the Curie temperature; above it the material is paramagnetic, and it cools into randomly oriented domains.',
      explain: 'Above 1043 K thermal agitation beats the exchange coupling that aligns neighbouring spins, and iron is merely paramagnetic. Cooling in zero field, domains form again but point every which way, so the part comes out demagnetized — still ferromagnetic, ready to be magnetized again. Rocks that cool through their Curie point in Earth’s field keep a record of it: palaeomagnetism.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-hall', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([15, 20, 25]), g = r.pick([10, 12, 15]), l = r.pick([0.2, 0.3]), mur = r.pick([1000, 2000]);
        const NI = ((B * 1e-3) / MU0) * (g * 1e-3 + l / mur);
        return {
          prompt: t`A Hall thruster traps its electrons with a radial field across its annular channel. Model its magnetic circuit as soft iron (a ${l * 100} cm path, $\mu_r \approx ${mur}$) closing across a ${g} mm gap — the channel — of the same cross-section. How many ampere-turns do its coils need for ${B} mT across the channel?`,
          visual: yokePic(t`The magnetic circuit simplified to an iron yoke with one gap (the channel); a real thruster has inner and outer poles, several coils and a shaped field. Fringing ignored; not to scale.`, 'channel'),
          answer: NI, units: 'A', tol: { rel: 0.01 },
          errors: [
            { value: (((B * 1e-3) / MU0) * l) / mur, feedback: 'That is only the iron’s share. The channel gap, where H = B/μ₀, needs almost all the ampere-turns.' },
            { value: B * g, feedback: t`Convert to SI and divide by $\mu_0$: $H_g = B/\mu_0$ in A/m.` },
          ].filter((e) => Math.abs(e.value - NI) > 0.03 * NI),
          hints: [t`$NI = H_gg + H_{\text{Fe}}\ell$ with $H_g = B/\mu_0$ and $H_{\text{Fe}} = B/\mu_0\mu_r$.`, t`$NI = \dfrac{B}{\mu_0}\left(g + \dfrac{\ell}{\mu_r}\right)$.`],
          teach: 'A gap in a magnetic circuit costs B·g/μ₀ ampere-turns; good iron adds only a little.',
          explain: t`$NI = \dfrac{${B}\times10^{-3}}{\mu_0}\left(${g / 1000} + \dfrac{${l}}{${mur}}\right) \approx ${nice(sf(NI, 3))}$ A — a few hundred ampere-turns, easily wound. The iron must stay well below saturation everywhere, which is why Hall thrusters’ pole pieces are carefully shaped; some small thrusters use permanent magnets instead and spend no power on the field.`,
        };
      },
    }),
    num({
      id: 'cp-torquer', difficulty: 4, transfer: true,
      gen(r) {
        const k = r.pick([10, 20, 40]), mur = r.pick([2000, 10000]);
        const N = spheroidN(k), chi = mur - 1, gain = 1 + chi / (1 + N * chi);
        return {
          prompt: t`A magnetorquer is a coil wound on a soft-magnetic rod. Model the rod as a prolate spheroid ${k} times as long as it is wide ($N = ${nice(sf(N, 4))}$ along its length) with $\mu_r \approx ${mur}$. The coil alone would apply $H_0 = nI$; inside the rod $H = H_0 - NM$ and $M = \chi_mH$. By what factor does the core multiply the coil’s magnetic moment?`,
          visual: magPic({ ratio: k / 4, show: 'H', sources: true }, t`A magnetized rod and its $\vec H$ lines, shortened to fit (the real rod is ${k} times as long as it is wide): the pole density on its ends makes the small backward $\vec H$ that limits it. Exact for a uniformly magnetized cylinder.`),
          answer: gain, tol: { rel: 0.01 },
          errors: [
            { value: mur, feedback: t`$\mu_r$ is the gain only in a closed core. A rod’s ends carry pole density, and its demagnetizing field limits $M$ to $\chi_mH_0/(1 + N\chi_m)$.` },
            { value: 1 / N, feedback: t`$1/N$ is the limit for infinite $\mu_r$; with $\mu_r = ${mur}$ use $1 + \chi_m/(1 + N\chi_m)$.` },
          ].filter((e) => Math.abs(e.value - gain) > 0.02 * gain),
          hints: [t`Solve $M = \chi_m(H_0 - NM)$: $M = \dfrac{\chi_mH_0}{1 + N\chi_m}$.`, t`The moment is the coil’s plus the core’s: $(H_0 + M)\times$volume, so the gain is $1 + \dfrac{\chi_m}{1 + N\chi_m}$.`],
          teach: t`A rod core’s gain is limited by its shape: about $1/N$ once $\mu_r$ is large — a longer rod, not a better material, gives more moment.`,
          explain: t`$M = \dfrac{\chi_mH_0}{1 + N\chi_m}$, so the gain is $1 + \dfrac{${chi}}{1 + ${nice(sf(N, 4))}(${chi})} \approx ${nice(sf(gain, 3))}$ — close to $1/N \approx ${nice(sf(1 / N, 3))}$, nowhere near ${mur}. The demagnetizing field sets the moment, which is why torque rods are long and thin, and why switching to a higher-$\mu_r$ alloy gains little.`,
        };
      },
    }),
    num({
      id: 'cp-shim', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([0.5, 1, 2]), d = r.pick([0.25, 0.3, 0.4]), B0 = r.pick([1.5, 3]);
        const M = JS_IRON / MU0, m = M * V * 1e-6, dB = (MU0 * m) / (2 * PI * d ** 3);
        return {
          prompt: t`MRI magnets are made uniform by **passive shimming**: small pieces of iron placed round the bore. In a ${B0} T scanner a ${V} cm³ iron piece is fully saturated, $\mu_0M_s = ${JS_IRON}$ T, along the field. Treating it as a point dipole, by how much does it change the field ${d * 100} cm away along the field direction?`,
          visual: magPic({ shape: 'sphere', show: 'B', sources: false, lines: 4 }, t`The field of a uniformly magnetized piece (shown as a sphere) — far away, a dipole’s. It adds to the scanner’s field along the axis. Not to scale.`),
          answer: dB * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [
            { value: ((MU0 * m) / (4 * PI * d ** 3)) * 1e6, feedback: t`On the dipole’s axis the field is $\mu_0m/2\pi r^3$, twice the value across it.` },
            { value: JS_IRON * 1e6, feedback: t`$\mu_0M_s$ is the field scale inside the iron; far away only the moment $m = M_sV$ matters.` },
          ],
          hints: [t`The moment is $m = M_sV$ with $M_s = ${JS_IRON}/\mu_0$ A/m.`, t`On the axis, $\Delta B = \dfrac{\mu_0m}{2\pi r^3}$.`],
          teach: t`A saturated iron shim is a fixed dipole, $M_sV$, whose field falls as $1/r^3$: tiny pieces correct parts-per-million errors.`,
          explain: t`$m = M_sV = \dfrac{${JS_IRON}}{\mu_0}(${V}\times10^{-6}) \approx ${nice(sf(m, 3))}\ \text{A·m}^2$ and $\Delta B = \dfrac{\mu_0m}{2\pi r^3} \approx ${nice(sf(dB * 1e6, 3))}\ \mu\text{T}$ — about ${nice(sf((dB / B0) * 1e6, 2))} parts per million of ${B0} T. A scanner needs its field uniform to a few ppm over the imaging volume, so shimming means placing hundreds of such pieces, each worked out by solving for the field’s spherical-harmonic coefficients — the multipole expansion of M4.5, run backwards.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §6.4 and Table 6.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Coey, Magnetism and Magnetic Materials (Cambridge, 2010): iron, soft and hard magnets', url: 'https://doi.org/10.1017/CBO9780511845000' },
    { label: 'Osborn, Demagnetizing factors of the general ellipsoid, Phys. Rev. 67, 351 (1945)', url: 'https://doi.org/10.1103/PhysRev.67.351' },
    { label: 'Goebel and Katz, Fundamentals of Electric Propulsion (JPL, 2008), ch. 7: Hall thruster magnetic circuits', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
  ],
});
