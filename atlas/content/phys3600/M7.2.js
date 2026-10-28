// The auxiliary field H (Griffiths §6.3): splitting the current into free
// and bound, ∇×H = J_f with H = B/μ₀ − M and Ampère's law for H; the
// deceptive parallel — ∇·H = −∇·M, so free current alone fixes H only with
// symmetry; inside a permanent magnet, with no free current anywhere, H is
// the demagnetizing field and points against M (pole density M·n̂ on the end
// faces plays the part of bound charge, so H at a disk magnet's centre comes
// from M1's charged-disk formula); B = μ₀(H + M) as a vector sum at a point;
// the boundary conditions (B⊥ continuous, H∥ jumps by K_f; at an end face H⊥
// jumps by M, at the side B∥ by μ₀M); and the misconception that H is "the
// magnetic field". Transfer: a clamp-on current probe round a Hall
// thruster's discharge cable. Uses the em3h-magnet sim.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, PI, sf, circle, polygon, bare } from './_mag.js';
import { magPic } from './_matter.js';

const t = String.raw;
/** H at the centre of a uniformly magnetized cylinder, in units of M: −(1 − L/√(L² + D²)). */
const hCentre = (L, D) => -(1 - L / Math.sqrt(L * L + D * D));

// the worked example: an NdFeB disk magnet 10 mm across and 5 mm thick
const EX_D = 10, EX_L = 5, EX_M = 1.0e6;
const EX_N = 1 - EX_L / Math.sqrt(EX_L ** 2 + EX_D ** 2), EX_H = -EX_N * EX_M, EX_B = MU0 * (EX_H + EX_M);

/** A cable end-on (⊙) inside a ferrite ring, with a dashed Amperian circle of radius rs (ring from 0.55 to 1.05). */
const ringPic = (rs, caption) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: 'sqrt(max(1.1025 - x^2, 0))', lower: 'sqrt(max(0.3025 - x^2, 0))', from: -1.05, to: 1.05, color: 'teal', alpha: 0.3 }, { fn: '-sqrt(max(0.3025 - x^2, 0))', lower: '-sqrt(max(1.1025 - x^2, 0))', from: -1.05, to: 1.05, color: 'teal', alpha: 0.3 }],
    curves: [circle(0.55, 'teal', { width: 1.5 }), circle(1.05, 'teal', { width: 1.5 }), circle(rs, 'violet', { dash: [5, 4] })],
    points: [{ x: 0, y: 0, r: 7, color: 'warn' }, { x: 0, y: 0, r: 0, label: 'I, out of the page', labelDx: 12, labelDy: -12, color: 'warn' }, { x: 1.12, y: 0.75, r: 0, label: 'ferrite ring', color: 'teal' }, { x: rs * 0.71, y: -rs * 0.71, r: 0, label: 'radius s', labelDx: 8, labelDy: 10, color: 'violet' }],
  }),
  caption,
});

export default lesson({
  id: 'phys3600.M7.2',
  title: 'The auxiliary field H',
  minutes: 15, difficulty: 3,
  equation: t`\nabla\times\vec H = \vec J_f, \qquad \vec H \equiv \frac{\vec B}{\mu_0} - \vec M`,
  intro: t`Inside matter the current that makes $\vec B$ is of two kinds: the **free** current $\vec J_f$ you send down wires, and the bound current $\nabla\times\vec M$ of [M7.1](#/lesson/phys3600.M7.1). Ampère’s law says $\nabla\times\vec B = \mu_0(\vec J_f + \nabla\times\vec M)$; gather the curls and $\nabla\times(\vec B/\mu_0 - \vec M) = \vec J_f$. The bracket is the **auxiliary field** $\vec H$, and its Ampère’s law, $\oint\vec H\cdot d\vec l = I_{f,\text{enc}}$, counts only the current you control. Like $\vec D$ in [M5.2](#/lesson/phys3600.M5.2), $\vec H$ comes with a **deceptive parallel**: its divergence $\nabla\cdot\vec H = -\nabla\cdot\vec M$ need not vanish, so free current fixes $\vec H$ only when symmetry does the rest. Inside a permanent magnet there is no free current at all, yet $\vec H$ is far from zero — it points **against** $\vec M$, and $\vec B = \mu_0(\vec H + \vec M)$ still points along it.`,
  symbols: [
    { tex: '\\vec H', text: t`the auxiliary field (engineers call it the magnetic field strength), in A/m` },
    { tex: '\\vec B', text: t`the magnetic field, in tesla: the field in the Lorentz force $q\vec v\times\vec B$` },
    { tex: '\\vec M', text: 'the magnetization, in A/m' },
    { tex: '\\vec J_f', text: t`the free current density, in $\text{A/m}^2$: current in wires, not in atoms` },
    { tex: '\\mu_0', text: t`the vacuum permeability, $${tex(MU0, 9)}\ \text{N/A}^2$` },
  ],
  why: t`Every magnetic circuit — a transformer, a Hall thruster’s coils and pole pieces, an MRI magnet — is designed with $\oint\vec H\cdot d\vec l = NI$, because $\vec H$ is the field the winding sets and the material answers with $\vec B$.`,
  visual: {
    type: 'em3h-magnet',
    title: 'H inside a magnet points backward',
    lead: t`The magnet of M7.1 again, now showing $\vec H$. There is no free current anywhere, so $\vec H$ has no curl — but it has divergence where $\vec M$ stops: a **pole density** $\vec M\cdot\hat n$, positive on the north face and negative on the south, plays exactly the part bound charge plays for $\vec E$. The inset adds $\mu_0\vec H$ and $\mu_0\vec M$ head to tail at the probe; their sum is $\vec B$.`,
    tasks: [
      t`$\vec H$ lines start on the north face and end on the south face, inside and out. Drag the probe inside: $\mu_0\vec H$ points backward, yet $\mu_0\vec H + \mu_0\vec M = \vec B$ points forward.`,
      t`Slide from a thin disk to a long rod: the demagnetizing factor $N$ (with $\vec H = -N\vec M$ at the centre) falls from near 1 toward 0. A long rod barely demagnetizes itself.`,
      t`Switch to $\vec B$: outside the magnet $\vec B = \mu_0\vec H$ exactly (no $\vec M$ there), so the lines agree; inside, $\vec B$ lines run forward and close, while $\vec H$ lines run backward and stop.`,
    ],
    params: { ratio: 0.5, show: 'H', probe: [0.15, 0.35], controls: ['show', 'shape', 'ratio', 'sources'], M: 1000 },
    caption: t`Exact fields of a uniformly magnetized cylinder with $M = 1000$ kA/m (about that of NdFeB). The pole density $\pm M$ sits on the flat faces; $\vec H$ is continuous across the curved side. Real magnets are not perfectly uniform.`,
  },
  example: {
    prompt: t`An NdFeB disk magnet ${EX_D} mm across and ${EX_L} mm thick is magnetized uniformly through its thickness with $M = ${tex(EX_M, 2)}\ \text{A/m}$. Find $\vec H$ and $\vec B$ at its centre.`,
    visual: magPic({ ratio: EX_L / EX_D, show: 'H', sources: true }, t`The disk cut through its axis (horizontal) with its $\vec H$ lines (violet): out of the north face, round and into the south face — and, inside, backward from the north face to the south. Exact.`),
    steps: [
      { label: 'Why not Ampère', text: t`There is no free current, so $\oint\vec H\cdot d\vec l = 0$ round every loop — but that does not make $\vec H$ zero. Its divergence is $\nabla\cdot\vec H = -\nabla\cdot\vec M$, which vanishes inside but not at the faces, where $\vec M$ stops: a pole density $\vec M\cdot\hat n = \pm M$ on the north and south faces.` },
      { label: 'Use electrostatics', text: t`$\vec H$ has zero curl and sources $\pm M$ per unit area, so it is the “electric field” of two charged disks with $\sigma/\varepsilon_0 \to M$. A disk gives $\dfrac{M}{2}\left(1 - \dfrac{d}{\sqrt{d^2 + a^2}}\right)$ on its axis at distance $d$ ([M1.1](#/lesson/phys3600.M1.1)), pointing away from the north face and toward the south face — both **backward**.` },
      { label: 'At the centre', text: t`With $d = L/2$ and $a = D/2$ from each face: $H = -M\left(1 - \dfrac{L}{\sqrt{L^2 + D^2}}\right) = -${nice(sf(EX_N, 4))}M \approx ${tex(EX_H, 3)}$ A/m. The demagnetizing factor here is $N \approx ${nice(sf(EX_N, 3))}$.` },
      { label: 'Then B', text: t`$B = \mu_0(H + M) = \mu_0M\dfrac{L}{\sqrt{L^2 + D^2}} \approx ${nice(sf(EX_B, 3))}$ T, **along** $\vec M$. Check: that is exactly the centre field of a finite solenoid with $nI = M$ ([M6.2](#/lesson/phys3600.M6.2)) — the bound current’s field, as M7.1 promised ✓.` },
      { label: 'Limits', text: t`A long rod ($L \gg D$): $H \to 0$ and $B \to \mu_0M$. A thin disk ($L \ll D$): $H \to -M$ and $B \to 0$. The same material holds its magnetization much less comfortably as a flat disk than as a rod, which is why the demagnetizing field matters in M7.3.` },
    ],
    answer: t`$H \approx ${tex(EX_H, 3)}$ A/m (against $\vec M$) and $B \approx ${nice(sf(EX_B, 3))}$ T (along $\vec M$) at the centre.`,
  },
  practice: [
    num({
      id: 'h-ferrite', difficulty: 2,
      gen(r) {
        const I = r.pick([2, 5, 12, 20]), s = r.pick([4, 6, 8]), mur = r.pick([800, 2000]);
        const H = I / (2 * PI * s * 1e-3);
        return {
          prompt: t`A ferrite ring (relative permeability about ${mur}) is clipped round a long straight cable carrying a steady ${I} A, to suppress interference. What is $H$ inside the ferrite, ${s} mm from the cable’s axis?`,
          visual: ringPic(0.55 + (s - 4) * 0.1, t`The cable end-on (orange, current out of the page) inside the ferrite ring (teal), with a dashed Amperian circle through the ferrite. Not to scale.`),
          answer: H, units: 'A/m', tol: { rel: 0.01 },
          errors: [
            { value: H / mur, feedback: t`Ampère’s law for $\vec H$ counts only free current — the material does not enter. The permeability sets $B = \mu_0\mu_rH$, not $H$.` },
            { value: H * mur, feedback: t`$H$ does not depend on the ferrite at all here; the factor ${mur} multiplies $B$, not $H$.` },
          ],
          hints: [t`By symmetry $\vec H$ circles the cable with the same size all round a circle centred on it.`, t`$\oint\vec H\cdot d\vec l = H\cdot2\pi s = I_{f,\text{enc}}$.`],
          teach: 'With enough symmetry, Ampère’s law for H gives H from the free current alone, whatever the material.',
          explain: t`$H = \dfrac{I}{2\pi s} = \dfrac{${I}}{2\pi(${s}\times10^{-3})} \approx ${nice(sf(H, 3))}$ A/m, circling the cable. The ferrite’s answer is in $B = \mu_0\mu_rH$, about ${mur} times what the same $H$ makes in air.`,
        };
      },
    }),
    mcq({
      id: 'deceptive', difficulty: 2,
      prompt: t`A permanent bar magnet sits alone on a bench: no free current anywhere. Since $\nabla\times\vec H = \vec J_f = 0$, what is $\vec H$ inside the magnet?`,
      visual: magPic({ ratio: 1.5, show: 'H', sources: true }, t`A uniformly magnetized bar with its $\vec H$ lines (violet) and its pole density (orange $+$ and blue $-$ on the end faces). Exact.`),
      choices: [
        t`Not zero: it points against $\vec M$, because $\nabla\cdot\vec H = -\nabla\cdot\vec M$ is non-zero at the end faces`,
        t`Zero, because there is no free current`,
        t`Equal to $\vec M$, since $\vec H$ and $\vec M$ are both in A/m`,
        t`Equal to $\vec B/\mu_0$, as it is everywhere`,
      ],
      answer: 0,
      why: {
        1: t`Zero curl does not mean zero field: an electrostatic field has zero curl too. $\vec H$ also has a divergence, and the end faces are its sources.`,
        2: t`$\vec H = \vec B/\mu_0 - \vec M$; inside the magnet it points **against** $\vec M$.`,
        3: t`$\vec H = \vec B/\mu_0$ only where $\vec M = 0$ — outside the magnet.`,
      },
      hints: [t`A field is fixed by its curl **and** its divergence (Helmholtz, M0.5).`, t`$\nabla\cdot\vec H = \nabla\cdot(\vec B/\mu_0) - \nabla\cdot\vec M = -\nabla\cdot\vec M$.`],
      teach: 'H has the deceptive parallel: zero free current gives zero curl, not zero H — the divergence −∇·M at a magnet’s faces is a source.',
      explain: t`With no free current, $\vec H$ is curl-free and sourced by the pole density $\vec M\cdot\hat n$ on the end faces — mathematically an electrostatic field. Inside it runs from the north face to the south face: against $\vec M$. That is the **demagnetizing field**, and it is why a magnet’s shape matters.`,
    }),
    num({
      id: 'h-centre', difficulty: 3,
      gen(r) {
        const D = r.pick([10, 20, 25]), L = r.pick([2, 5, 10, 20, 40]), M = r.pick([800, 950, 1100]);
        const H = hCentre(L, D) * M;
        return {
          prompt: t`A cylindrical magnet ${D} mm across and ${L} mm long is magnetized uniformly along its axis with $M = ${M}$ kA/m. What is the axial component of $\vec H$ at its centre? (Negative if it points against $\vec M$.)`,
          visual: magPic({ ratio: L / D, show: 'H', sources: true }, t`The magnet cut through its axis with its $\vec H$ lines and pole density. Exact.`),
          answer: H, units: 'kA/m', tol: { rel: 0.01 },
          errors: [
            { value: -M / 3, feedback: t`$-M/3$ is a **sphere’s** demagnetizing field. For a cylinder use the two charged disks: $H = -M\left(1 - L/\sqrt{L^2 + D^2}\right)$.` },
            { value: -M, feedback: t`$-M$ is the thin-disk limit. A cylinder of finite length demagnetizes itself less: $N = 1 - L/\sqrt{L^2 + D^2}$.` },
          ].filter((e) => Math.abs(e.value - H) > 0.02 * Math.abs(H)),
          hints: [t`$\vec H$ comes from pole densities $\pm M$ on the end faces, like the field of two charged disks, each giving $\tfrac{M}{2}\left(1 - \tfrac{d}{\sqrt{d^2 + a^2}}\right)$ at distance $d$ on its axis.`, t`At the centre $d = L/2$, $a = D/2$, and both disks push $\vec H$ backward: $H = -M\left(1 - \dfrac{L}{\sqrt{L^2 + D^2}}\right)$.`],
          teach: 'At a magnet’s centre H = −NM, with the demagnetizing factor N set by its shape alone.',
          explain: t`$N = 1 - \dfrac{${L}}{\sqrt{${L}^2 + ${D}^2}} \approx ${nice(sf(-hCentre(L, D), 3))}$, so $H \approx ${nice(sf(H, 3))}$ kA/m, pointing against $\vec M$. ${L > D ? 'A long magnet demagnetizes itself only a little.' : 'A flat magnet demagnetizes itself strongly.'}`,
        };
      },
    }),
    num({
      id: 'face', difficulty: 3,
      gen(r) {
        const D = r.pick([10, 20]), L = r.pick([5, 10, 20]), M = r.pick([900, 1000]);
        const a = D / 2, BfS = (((MU0 * M * 1e3) / 2) * (L / Math.sqrt(L * L + a * a))).toFixed(3), Bf = +BfS;
        const Hin = Bf / MU0 / 1e3 - M, Hout = Bf / MU0 / 1e3;
        return {
          prompt: t`A cylindrical magnet (${D} mm across, ${L} mm long, $M = ${M}$ kA/m along its axis) has a field of $B = ${BfS}$ T at the centre of its north face, pointing straight out. What is the axial component of $\vec H$ just **inside** the face? (Negative if it points into the magnet.)`,
          visual: magPic({ ratio: L / D, show: 'B', sources: false }, t`The magnet cut through its axis with its $\vec B$ lines; the point asked about is the middle of the right-hand (north) face. Exact.`),
          answer: Hin, units: 'kA/m', tol: { rel: 0.01, abs: 2 },
          errors: [
            { value: Hout, feedback: t`That is $H$ just **outside**. The normal component of $\vec B$ is continuous across the face; $\vec H = \vec B/\mu_0 - \vec M$ jumps by $M$ because $\vec M$ stops there.` },
            { value: Hout + M, feedback: t`Subtract $\vec M$, do not add it: $\vec H = \vec B/\mu_0 - \vec M$.` },
          ],
          hints: [t`At the face the normal component of $\vec B$ is continuous ($\nabla\cdot\vec B = 0$ and a pillbox): just inside, $B$ is still ${BfS} T.`, t`Inside, $\vec H = \vec B/\mu_0 - \vec M$: convert ${BfS} T to A/m with $1/\mu_0$, then subtract $M$.`],
          teach: 'Across a face where M ends, B⊥ is continuous and H⊥ jumps by M — the pole density.',
          explain: t`Just inside, $B$ is the same ${BfS} T, so $H = \dfrac{${BfS}}{${tex(MU0, 6)}} - ${M}\times10^3 \approx ${nice(sf(Hin, 3))}$ kA/m: pointing back into the magnet. Just outside, $H = B/\mu_0 \approx +${nice(sf(Hout, 3))}$ kA/m. The jump, $M$, is the face’s pole density — the magnetic twin of $E_\perp$ jumping by $\sigma_b/\varepsilon_0$.`,
        };
      },
    }),
    mcq({
      id: 'side-bc', difficulty: 2,
      prompt: t`Cross the curved side of a long, uniformly magnetized rod from inside to outside, halfway along it. There is no free current anywhere. What happens to the components of $\vec B$ and $\vec H$ **parallel** to the surface?`,
      visual: magPic({ ratio: 3, show: 'B', sources: true }, t`A long magnetized rod and its $\vec B$ lines; inside, $\vec B$ runs along the rod, and just outside it is weak and points back. Exact.`),
      choices: [
        t`$B_\parallel$ jumps by $\mu_0M$; $H_\parallel$ is continuous`,
        t`Both are continuous`,
        t`$H_\parallel$ jumps by $M$; $B_\parallel$ is continuous`,
        t`Both jump by the same amount`,
      ],
      answer: 0,
      why: {
        1: t`The bound surface current $K_b = M$ makes $B_\parallel$ jump by $\mu_0K_b$ ([M6.5](#/lesson/phys3600.M6.5)).`,
        2: t`That is backwards: $H_\parallel$ jumps only across **free** surface current, and here there is none.`,
        3: t`$\vec H = \vec B/\mu_0 - \vec M$: the jump in $B_\parallel/\mu_0$ is exactly cancelled by the jump in $M_\parallel$.`,
      },
      hints: [t`Which current sits on the side: free or bound? Which field “sees” which current?`, t`$\vec B$’s tangential jump is $\mu_0\vec K$ for **all** surface current; $\vec H$’s is $\vec K_f$ only.`],
      teach: 'At a boundary B∥ jumps by μ₀ times all the surface current, H∥ only by the free part.',
      explain: t`The side carries bound current $K_b = M$ and no free current. So $B_\parallel$ drops by $\mu_0M$ — from about $\mu_0M$ inside a long rod to nearly zero outside — while $H_\parallel = B_\parallel/\mu_0 - M_\parallel$ stays continuous: inside, $\mu_0M/\mu_0 - M \approx 0$; outside, $\approx 0$.`,
    }),
    num({
      id: 'b-from-h', difficulty: 2,
      gen(r) {
        const M = r.pick([850, 950, 1050]), H = -r.pick([150, 300, 450]);
        const B = MU0 * (H + M) * 1e3;
        return {
          prompt: t`Inside a magnet, at one point, $\vec M = ${M}$ kA/m along $+\hat z$ and $\vec H = ${H}$ kA/m along $\hat z$ (that is, pointing backward). What is $B$ there?`,
          visual: { type: 'em3h-magnet', params: { ratio: 0.8, show: 'B', probe: [0.2, 0.3], controls: false, readout: false, sources: false, lines: 4 }, caption: t`A magnet with its $\vec B$ lines and a probe; the inset adds $\mu_0\vec H$ and $\mu_0\vec M$ head to tail to make $\vec B$ (lengths to one scale; not the numbers of this problem).` },
          answer: B, units: 'T', tol: { rel: 0.01 },
          errors: [
            { value: MU0 * H * 1e3, feedback: t`$\mu_0\vec H$ alone leaves out the magnetization: $\vec B = \mu_0(\vec H + \vec M)$.` },
            { value: MU0 * (M - H) * 1e3, feedback: t`Keep the sign: $\vec H$ points backward, so it **subtracts** from $\vec M$.` },
          ],
          hints: [t`$\vec H \equiv \vec B/\mu_0 - \vec M$, so $\vec B = \mu_0(\vec H + \vec M)$.`, t`Add the components: $${H} + ${M}$ kA/m, then multiply by $\mu_0$.`],
          teach: 'B = μ₀(H + M) is a vector sum at each point: inside a magnet H is backward, and B is still forward.',
          explain: t`$B = \mu_0(H + M) = (${tex(MU0, 6)})(${H + M}\times10^{3}) \approx ${nice(sf(B, 3))}$ T, along $+\hat z$ — along $\vec M$, even though $\vec H$ points the other way.`,
        };
      },
    }),
    mcq({
      id: 'cavity', difficulty: 3,
      prompt: t`Deep inside a large block of magnetized material the fields are $\vec B_0$, $\vec H_0$ and $\vec M$, all along one axis. A long, thin, needle-shaped hole is drilled along that axis. What is $\vec B$ at the middle of the hole?`,
      visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '1.1', lower: '-1.1', from: -2.2, to: 2.2, color: 'ink3', alpha: 0.22 }], curves: [...polygon([[-1.2, -0.05], [1.2, -0.05], [1.2, 0.05], [-1.2, 0.05]], 'ink')], arrows: [...[-1.6, -0.5, 0.6, 1.7].flatMap((x) => [-0.6, 0.6].map((y) => ({ from: [x - 0.3, y], to: [x + 0.3, y], color: 'gold', width: 2 }))), ], points: [{ x: -1.3, y: -0.6, r: 0, label: 'M', labelDx: 4, labelDy: -8, color: 'gold' }, { x: 0, y: 0.05, r: 0, label: 'needle-shaped hole', labelAlign: 'center', labelDx: 0, labelDy: -12, color: 'ink' }] }), caption: t`A block of uniformly magnetized material (grey, $\vec M$ in gold) with a long thin hole along $\vec M$. Not to scale: the hole is much thinner and longer.` },
      choices: [
        t`$\vec B_0 - \mu_0\vec M$, which is $\mu_0\vec H_0$: $H_\parallel$ is continuous along the hole’s long walls`,
        t`$\vec B_0$: $\vec B$ is continuous`,
        t`Zero: there is no material in the hole`,
        t`$\mu_0\vec M$`,
      ],
      answer: 0,
      why: {
        1: t`Only the **normal** component of $\vec B$ is continuous. Along the needle’s long walls the field is tangential, and $B_\parallel$ jumps by $\mu_0K_b$ — the hole’s walls carry bound current. ($\vec B_0$ is the answer for a flat, wafer-shaped hole across $\vec M$.)`,
        2: t`Empty space still has a field: the material’s bound currents make one there.`,
        3: t`$\mu_0\vec M$ is the jump across the hole’s walls, not the field in it.`,
      },
      hints: [t`Along the needle’s long sides, which component is tangential? There is no free current on the walls, so which field’s tangential part is continuous?`, t`$H_\parallel$ is continuous: in the hole $\vec H = \vec H_0$, and there $\vec M = 0$, so $\vec B = \mu_0\vec H_0$.`],
      teach: 'In a needle-shaped cavity along M the field is μ₀H of the material; in a wafer-shaped one across M it is B — Kelvin’s way of giving H and B an operational meaning.',
      explain: t`On the hole’s long walls the field is tangential, and with no free surface current $H_\parallel$ is continuous: $\vec H_{\text{hole}} = \vec H_0$, so $\vec B_{\text{hole}} = \mu_0\vec H_0 = \vec B_0 - \mu_0\vec M$. (The walls carry a bound current $\vec M\times\hat n$ circling the opposite way, which cancels $\mu_0\vec M$ of the field.) A charged particle flying along such a needle would feel $\mu_0\vec H_0$ — inside a short permanent magnet, a **backward** field. In a flat wafer-shaped hole across $\vec M$, the normal $\vec B$ is continuous instead and the particle feels $\vec B_0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-clamp', difficulty: 3, transfer: true,
      gen(r) {
        const [P, V] = r.pick([[1350, 300], [3000, 300], [4500, 400], [6000, 400]]), rr = r.pick([10, 15, 20]), mur = r.pick([1500, 3000]);
        const I = P / V, H = I / (2 * PI * rr * 1e-3);
        return {
          prompt: t`A Hall thruster runs at ${P} W with a discharge voltage of ${V} V. A clamp-on current probe closes a ring of ferrite ($\mu_r \approx ${mur}$) round its discharge cable; the ring’s mean radius is ${rr} mm. What is $H$ in the ferrite?`,
          visual: ringPic(0.8, t`The discharge cable end-on (orange) inside the probe’s ferrite ring (teal); dashed, a circle through the ferrite. Not to scale.`),
          answer: H, units: 'A/m', tol: { rel: 0.01 },
          errors: [
            { value: H / mur, feedback: t`$\oint\vec H\cdot d\vec l$ counts free current only; the ferrite’s $\mu_r$ affects $B$, not $H$.` },
            { value: P / (2 * PI * rr * 1e-3), feedback: t`Use the current, not the power: $I = P/V$.` },
          ],
          hints: [t`The discharge current is $I = P/V$.`, t`Round the ring, $H\cdot2\pi r = I$.`],
          teach: 'A clamp-on current probe reads ∮H·dl = I: the free current through its ring, whatever the ring is made of.',
          explain: t`$I = ${P}/${V} = ${nice(sf(I, 3))}$ A, and $H = I/2\pi r \approx ${nice(sf(H, 3))}$ A/m. The ferrite multiplies $B$ by about ${mur}, which a Hall sensor in a small gap in the ring then reads; because $\oint\vec H\cdot d\vec l = I$ for any path round the cable, the reading hardly depends on where the cable sits in the ring.`,
        };
      },
    }),
    num({
      id: 'cp-sphere-h', difficulty: 3,
      gen(r) {
        const M = r.pick([300, 600, 900, 1200]);
        return {
          prompt: t`A sphere is magnetized uniformly with $M = ${M}$ kA/m along $+\hat z$. What is the $z$ component of $\vec H$ inside it? (Negative if it points against $\vec M$.)`,
          visual: magPic({ shape: 'sphere', show: 'H', sources: true }, t`The sphere cut through its axis with its $\vec H$ lines and pole density $M\cos\theta$. Exact.`),
          answer: -M / 3, units: 'kA/m', tol: { rel: 0.01 },
          errors: [
            { value: (2 * M) / 3, feedback: t`$\tfrac23M$ is $B/\mu_0$ inside. $\vec H = \vec B/\mu_0 - \vec M = \tfrac23\vec M - \vec M$.` },
          ],
          hints: [t`Inside, $\vec B = \tfrac23\mu_0\vec M$ (M7.1).`, t`$\vec H = \vec B/\mu_0 - \vec M$.`],
          teach: 'Inside a uniformly magnetized sphere H = −M/3: the demagnetizing factor of a sphere is one third.',
          explain: t`$H = \tfrac23M - M = -\tfrac13M \approx ${nice(sf(-M / 3, 3))}$ kA/m: uniform and backward. It is the polarized sphere’s $\vec E = -\vec P/3\varepsilon_0$ in magnetic dress — the same pole-density mathematics.`,
        };
      },
    }),
    mcq({
      id: 'cp-shape', difficulty: 3,
      prompt: t`Four magnets carry the same uniform magnetization $M$. Inside which one is $\vec H$ closest to $-\vec M$?`,
      visual: magPic({ ratio: 0.15, show: 'H', sources: true }, t`One of the four: a thin disk magnetized through its thickness, with its $\vec H$ lines. Exact.`),
      choices: [
        'A thin disk magnetized through its thickness',
        'A sphere',
        'A long rod magnetized along its length',
        'A ring magnetized round its circumference, like a closed core',
      ],
      answer: 0,
      why: {
        1: t`A sphere’s $\vec H$ is $-\vec M/3$, a third of the way.`,
        2: t`A long rod’s pole density sits on two small faces far apart: $\vec H \approx 0$ inside.`,
        3: t`A ring magnetized round itself has no faces where $\vec M$ ends: no pole density, so $\vec H = 0$ — and $\vec B = \mu_0\vec M$ is trapped inside.`,
      },
      hints: [t`$\vec H$ inside comes from the pole density $\pm M$ on the faces $\vec M$ crosses. How close are they, and how big?`, t`A thin disk is a parallel-plate “capacitor” with $\pm M$ on its faces.`],
      teach: 'The demagnetizing field runs from H ≈ −M in a thin disk magnetized across it to H = 0 in a closed ring.',
      explain: t`The thin disk is a pair of large sheets with $\pm M$, so $\vec H \approx -\vec M$ and $\vec B = \mu_0(\vec H + \vec M) \approx 0$ inside. Then the sphere ($-M/3$), the rod ($\approx 0$) and the closed ring ($0$ exactly). Permanent magnets therefore prefer long shapes, or keepers that close the loop, and flat ones need materials (like NdFeB) that resist demagnetization.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §6.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Goebel and Katz, Fundamentals of Electric Propulsion: Ion and Hall Thrusters (JPL, 2008), ch. 7', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
    { label: 'Derby and Olbert, Cylindrical magnets and ideal solenoids, Am. J. Phys. 78, 229 (2010)', url: 'https://doi.org/10.1119/1.3256157' },
  ],
});
