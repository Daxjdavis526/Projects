// Magnetization and bound currents (Griffiths §6.1–6.2): atoms as current
// loops (para-, dia- and ferromagnetism in one paragraph), M as dipole moment
// per volume, the bound currents J_b = ∇×M and K_b = M × n̂ from the dipole
// vector potential (M5.1's argument with currents for charges), the uniformly
// magnetized cylinder as a solenoid with no wire (its bound current in
// ampere-turns), the uniformly magnetized sphere (K_b = M sin θ φ̂, the
// spinning shell of M6.6: ⅔μ₀M inside, a dipole outside, the jump μ₀K at the
// equator), curls of non-uniform M in cylindrical coordinates, and the
// misconception that a uniform M carries no current. Transfer: the magnetic
// cleanliness of a spacecraft — one small latch-valve magnet against a
// magnetometer on a boom. Uses the em3h-magnet sim. Linear media are M7.3.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, PI, DEG, sf, arrowsAt, grid, circle, polygon, bare } from './_mag.js';
import { CHI, magPic } from './_matter.js';

const t = String.raw;
// a sintered NdFeB magnet: B_r ≈ 1.2–1.4 T, so M ≈ B_r/μ₀ ≈ 1.0 × 10⁶ A/m (approximate; grades vary)
const M_NDFEB = 1.0e6;

/** A sphere magnetized along +y (vertical): its outline, a few M arrows (gold) and, optionally, extra graph params. */
const spherePic = (caption, extra = {}) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    curves: [circle(1, 'ink2')],
    arrows: [-0.5, 0, 0.5].map((x) => ({ from: [x, -0.45], to: [x, 0.45], color: 'gold', width: 2.2 })),
    points: [{ x: -0.5, y: 0.45, r: 0, label: 'M', labelDx: -16, labelDy: 0, color: 'gold' }],
    ...extra,
  }),
  caption,
});

/** A long cylinder seen from the side (axis vertical, |x| < 1) with M = k|x|ⁿ ẑ, or end-on with M = k sⁿ φ̂. */
function cylPic(axial, n, caption) {
  if (axial) {
    return {
      type: 'graph',
      params: bare([-2.6, 2.6], [-1.25, 1.25], {
        curves: polygon([[-1, -1.15], [1, -1.15], [1, 1.15], [-1, 1.15]], 'ink2'),
        arrows: [...arrowsAt(grid([-1, 1], [-1.1, 1.1], 8), (x) => [0, Math.abs(x) ** n], { len: 0.3, color: 'gold' }), { from: [0, -1.2], to: [0, 1.24], color: 'ink4', width: 1, dash: [3, 4] }],
        points: [{ x: 1.08, y: 0.95, r: 0, label: 'surface s = R', color: 'ink2' }, { x: 0.06, y: -1.12, r: 0, label: 'axis', color: 'ink3' }],
      }),
      caption,
    };
  }
  return {
    type: 'graph',
    params: bare([-2.6, 2.6], [-1.25, 1.25], {
      curves: [circle(1.05, 'ink2')],
      arrows: arrowsAt(grid([-1, 1], [-1, 1], 8).filter(([x, y]) => Math.hypot(x, y) < 0.95 && Math.hypot(x, y) > 0.1), (x, y) => { const s = Math.hypot(x, y); return [-y * s ** (n - 1), x * s ** (n - 1)]; }, { len: 0.26, color: 'gold' }),
    }),
    caption,
  };
}

/** Two pole pieces of a strong magnet and a stream of liquid falling between them. */
const polesPic = {
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: '0.9', lower: '-0.9', from: -2.0, to: -0.55, color: 'warn', alpha: 0.35 }, { fn: '0.9', lower: '-0.9', from: 0.55, to: 2.0, color: 'accent', alpha: 0.35 }],
    curves: [{ param: ['0.02*sin(9*t)', 't'], t: [-1.2, 1.2], color: 'teal', width: 3 }],
    arrows: [-0.5, 0, 0.5].map((y) => ({ from: [-0.5, y], to: [0.5, y], color: 'violet', width: 1.6 })),
    points: [{ x: -1.27, y: 0, r: 0, label: 'N', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' }, { x: 1.27, y: 0, r: 0, label: 'S', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' }, { x: 0.08, y: 1.1, r: 0, label: 'falling stream', color: 'teal' }],
  }),
  caption: 'A stream of liquid falling through the strong, non-uniform field between two pole pieces (field in violet). Not to scale.',
};

/** A slab |x| < a magnetized along z with M = kx ẑ (z up the page). */
const slabPic = (caption) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: '1.2', lower: '-1.2', from: -1, to: 1, color: 'ink3', alpha: 0.15 }],
    curves: [{ param: ['-1', 't'], t: [-1.2, 1.2], color: 'ink2', width: 2 }, { param: ['1', 't'], t: [-1.2, 1.2], color: 'ink2', width: 2 }],
    arrows: [...[-0.75, -0.4, 0.4, 0.75].flatMap((x) => [-0.55, 0.55].map((y) => ({ from: [x, y - 0.45 * x], to: [x, y + 0.45 * x], color: 'gold', width: 2.2 }))),
      { from: [1.6, -0.9], to: [2.3, -0.9], color: 'ink3', width: 1.4, label: 'x', labelDx: 4, labelDy: 0 }, { from: [1.6, -0.9], to: [1.6, -0.2], color: 'ink3', width: 1.4, label: 'z', labelDx: 4, labelDy: -4 }],
    points: [{ x: -1, y: 1.12, r: 0, label: 'x = −a', labelAlign: 'right', labelDx: -6, labelDy: 0, color: 'ink2' }, { x: 1, y: 1.12, r: 0, label: 'x = a', labelDx: 6, labelDy: 0, color: 'ink2' }],
  }),
  caption,
});

// the worked example: an NdFeB sphere of radius 5.0 mm
const EX_R = 5e-3, EX_BIN = (2 / 3) * MU0 * M_NDFEB, EX_M = (4 / 3) * PI * EX_R ** 3 * M_NDFEB, EX_Z = 0.02;
const EX_BAX = (MU0 * EX_M) / (2 * PI * EX_Z ** 3);

export default lesson({
  id: 'phys3600.M7.1',
  title: 'Magnetization and bound currents',
  minutes: 16, difficulty: 3,
  equation: t`\vec J_b = \nabla\times\vec M, \qquad \vec K_b = \vec M\times\hat n`,
  intro: t`Every atom is a tiny current loop: its electrons circle the nucleus and, more importantly, spin, each carrying a magnetic moment. Usually the moments cancel or point every which way. In a field they line up a little — **along** $\vec B$ in a paramagnet (unpaired spins turning), **against** it in a diamagnet (orbits sped up or slowed down, Lenz’s law at the atomic scale) — or, in a ferromagnet such as iron, a lot, and they stay lined up when the field is gone. The **magnetization** $\vec M$ is the magnetic dipole moment per unit volume. Add up the vector potentials of all those little dipoles and integrate by parts, exactly as [M5.1](#/lesson/phys3600.M5.1) did for $\vec P$: the result is the vector potential of two real currents — a **surface current** $\vec K_b = \vec M\times\hat n$ where the loops’ outer edges run along the boundary uncancelled, and a **volume current** $\vec J_b = \nabla\times\vec M$ wherever $\vec M$ varies, so that neighbouring loops no longer cancel. These **bound currents** make the field of magnetized matter, by Biot–Savart and every method of M6. A uniformly magnetized rod is a solenoid with no wire.`,
  symbols: [
    { tex: '\\vec M', text: t`the magnetization: magnetic dipole moment per unit volume, in $\text{A·m}^2/\text{m}^3 = \text{A/m}$` },
    { tex: '\\hat n', text: 'the outward unit normal of the material’s surface' },
    { tex: '\\vec K_b', text: t`the bound surface current density: current per unit width of surface, in A/m` },
    { tex: '\\vec J_b', text: t`the bound volume current density: current per unit area, in $\text{A/m}^2$` },
    { tex: '\\nabla\\times\\vec M', text: 'the curl of M: how much the magnetization circulates around a point, in A/m²' },
  ],
  why: t`Every permanent magnet — in a reaction-wheel motor, a Hall thruster’s magnetic circuit or a latch valve — is a sheet of bound current, and a spacecraft carrying a sensitive magnetometer has to budget for every one of them.`,
  visual: {
    type: 'em3h-magnet',
    title: 'A magnet is a solenoid with no wire',
    lead: t`A uniformly magnetized cylinder cut through its axis; the axis runs across the page and $\vec M$ points right, toward the north end. Its bound current $\vec K_b = \vec M\times\hat n$ circles the curved side like a solenoid’s winding — $\odot$ out of the page on top, $\otimes$ into it underneath. Field lines are drawn spaced by equal flux in three dimensions, so the slice shows few near the axis. Change the shape, and drag the probe.`,
    tasks: [
      t`Show $\vec M$: it is uniform, so $\vec J_b = \nabla\times\vec M = 0$ inside. All the bound current runs on the curved side; on the flat ends $\vec M\parallel\hat n$ and $\vec M\times\hat n = 0$.`,
      t`Stretch it to a long rod (length ÷ diameter 4): $B$ at the probe approaches $\mu_0M$, the field of a long solenoid with $nI = K_b = M$. Squash it to a disk and $B$ at the centre falls toward zero.`,
      t`Choose the sphere: inside, $\vec B$ is uniform and two-thirds of $\mu_0\vec M$. Its bound current is densest round the equator, like the current on a spinning charged shell.`,
    ],
    params: { ratio: 1, show: 'B', views: ['B', 'M'], readouts: ['B', 'M'], inset: false, probe: [0.3, 0.4], controls: ['show', 'shape', 'ratio', 'sources'], M: 1000 },
    caption: t`Exact fields of a uniformly magnetized body (its bound current is a finite solenoid’s) with $M = 1000$ kA/m, about that of a sintered NdFeB magnet. Real magnets are not perfectly uniform, and only the probe’s readout is in real units.`,
  },
  example: {
    prompt: t`A sphere of radius $R = 5.0$ mm is magnetized uniformly, $\vec M = M\hat z$ with $M = ${tex(M_NDFEB, 2)}$ A/m — about what a sintered NdFeB magnet carries. Find its bound currents, the field inside, and the field on its axis 2.0 cm from the centre.`,
    visual: magPic({ shape: 'sphere', show: 'B', sources: true }, t`The magnetized sphere cut through its axis (horizontal): its bound current (orange, $\odot$ out of the page and $\otimes$ into it, larger near the equator) and its field lines, uniform inside. Exact; lines spaced by equal flux in 3D.`),
    steps: [
      { label: 'Bound currents', text: t`$\vec M$ is constant, so $\vec J_b = \nabla\times\vec M = 0$. On the surface $\hat n = \hat r$, and $\vec K_b = M\,\hat z\times\hat r = M\sin\theta\,\hat\phi$: circling the axis, greatest at the equator, zero at the poles.` },
      { label: 'Borrow a result', text: t`That is exactly the surface current of a spinning charged shell, $\sigma\omega R\sin\theta\,\hat\phi$, whose moment you found in [M6.6](#/lesson/phys3600.M6.6) and whose field inside is uniform, $\tfrac23\mu_0\sigma\omega R$ (Griffiths Ex. 5.11). With $\sigma\omega R \to M$: $\vec B = \tfrac23\mu_0\vec M$ inside.` },
      { label: 'Inside', text: t`$B = \tfrac23(${tex(MU0, 6)})(${tex(M_NDFEB, 2)}) \approx ${nice(sf(EX_BIN, 3))}$ T, along $\vec M$.` },
      { label: 'Outside', text: t`Outside, the field is exactly that of a point dipole holding the sphere’s whole moment, $m = \tfrac43\pi R^3M \approx ${nice(sf(EX_M, 3))}\ \text{A·m}^2$. On the axis at $z = 2.0$ cm: $B = \dfrac{\mu_0m}{2\pi z^3} \approx ${nice(sf(EX_BAX * 1e3, 3))}$ mT.` },
      { label: 'Check the jump', text: t`Just outside the equator the dipole field is $\dfrac{\mu_0m}{4\pi R^3} = \tfrac13\mu_0M$, pointing **against** $\vec M$; just inside it is $\tfrac23\mu_0M$ along it. The tangential field jumps by $\mu_0M = \mu_0K_b$ there — exactly what [M6.5](#/lesson/phys3600.M6.5) demands of a surface current ✓.` },
    ],
    answer: t`$\vec J_b = 0$, $\vec K_b = M\sin\theta\,\hat\phi$; inside $\vec B = \tfrac23\mu_0\vec M$, about $${nice(sf(EX_BIN, 3))}$ T; on the axis at 2.0 cm about $${nice(sf(EX_BAX * 1e3, 3))}$ mT.`,
  },
  practice: [
    num({
      id: 'k-sphere', difficulty: 2,
      gen(r) {
        const M = r.pick([300, 500, 800, 1000]), th = r.pick([30, 60, 90, 120, 150, 20, 160]);
        const ans = M * Math.sin(th * DEG), x = Math.sin(th * DEG), y = Math.cos(th * DEG);
        return {
          prompt: t`A sphere is magnetized uniformly, $\vec M = M\hat z$ with $M = ${M}$ kA/m. How strong is the bound surface current at the point of its surface where $\theta = ${th}°$ (measured from $+\hat z$)?`,
          visual: spherePic(t`The sphere (axis vertical), its uniform magnetization (gold) and the outward normal at $\theta = ${th}°$ (violet).`, { arrows: [...[-0.5, 0, 0.5].map((xx) => ({ from: [xx, -0.45], to: [xx, 0.45], color: 'gold', width: 2.2 })), { from: [x, y], to: [1.45 * x, 1.45 * y], color: 'violet', width: 2.4, label: 'n̂', labelDx: 6 }], points: [{ x, y, r: 4, color: 'violet' }, { x: -0.5, y: 0.45, r: 0, label: 'M', labelDx: -16, labelDy: 0, color: 'gold' }] }),
          answer: ans, units: 'kA/m', tol: { rel: 0.01 },
          errors: [
            { value: M * Math.abs(Math.cos(th * DEG)), feedback: t`$M\cos\theta$ is the normal part of $\vec M$ — the electric analogue’s $\sigma_b = \vec P\cdot\hat n$. A current needs the **cross** product: $|\vec M\times\hat n| = M\sin\theta$.` },
            { value: M, feedback: t`Only at the equator, where $\vec M$ is tangent to the surface, is $K_b = M$. Elsewhere only the tangential part of $\vec M$ makes current.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\vec K_b = \vec M\times\hat n$, and on a sphere $\hat n = \hat r$.`, t`$|\hat z\times\hat r| = \sin\theta$, and the direction is $\hat\phi$.`],
          teach: t`Bound surface current is the tangential part of $\vec M$ turned through a right angle: $\vec K_b = \vec M\times\hat n$.`,
          explain: t`$K_b = M\sin ${th}° \approx ${nice(sf(ans, 3))}$ kA/m, flowing along $\hat\phi$ — round the axis, like the current on a spinning charged shell. It vanishes at the poles and peaks at the equator.`,
        };
      },
    }),
    expr({
      id: 'jb', difficulty: 3,
      gen(r) {
        const axial = r.bool(0.5), n = r.pick([1, 2, 3]);
        const pw = (c, p) => (p === 0 ? `${c}*k` : p === 1 ? `${c}*k*s` : `${c}*k*s^${p}`);
        const pwT = (c, p) => `${c === 1 ? '' : c}k${p === 0 ? '' : p === 1 ? 's' : `s^{${p}}`}`;
        const c = axial ? n : n + 1;
        const ans = axial ? `-${pw(c, n - 1)}` : pw(c, n - 1), ansT = axial ? `-${pwT(c, n - 1)}` : pwT(c, n - 1);
        const Mt = axial ? t`ks^{${n}}\,\hat z` : t`ks^{${n}}\,\hat\phi`;
        return {
          prompt: axial
            ? t`A long cylinder is magnetized along its axis, but not uniformly: $\vec M = ${Mt}$, where $s$ is the distance from the axis and $k$ a constant. Find the $\phi$ component of the bound volume current, $(\vec J_b)_\phi$.`
            : t`A long cylinder is magnetized round its axis, $\vec M = ${Mt}$, where $s$ is the distance from the axis and $k$ a constant. Find the $z$ component of the bound volume current, $(\vec J_b)_z$.`,
          visual: cylPic(axial, n, axial ? t`The cylinder cut along its axis (dashed): $\vec M$ (gold) points along the axis and grows with $s$ as $s^{${n}}$.` : t`The cylinder end-on: $\vec M$ (gold) circles the axis and grows with $s$ as $s^{${n}}$.`),
          answer: ans, answerTeX: ansT, lhs: axial ? t`(\vec J_b)_\phi` : t`(\vec J_b)_z`,
          vars: { k: [0.5, 3], s: [0.2, 2] },
          errors: axial
            ? [{ answer: pw(c, n - 1), feedback: t`In cylindrical coordinates $(\nabla\times\vec M)_\phi = \partial_zM_s - \partial_sM_z$: the minus sign stays.` }]
            : [{ answer: pw(n, n - 1), feedback: t`That is $dM_\phi/ds$, the Cartesian habit. In cylindrical coordinates $(\nabla\times\vec M)_z = \tfrac1s\,\partial_s(sM_\phi)$.` }],
          hints: [t`$\vec J_b = \nabla\times\vec M$, with the curl in cylindrical coordinates (M0.3).`, axial ? t`$(\nabla\times\vec M)_\phi = \dfrac{\partial M_s}{\partial z} - \dfrac{\partial M_z}{\partial s} = 0 - \dfrac{d}{ds}\left(ks^{${n}}\right)$.` : t`$(\nabla\times\vec M)_z = \dfrac1s\dfrac{\partial}{\partial s}(sM_\phi) - \dfrac1s\dfrac{\partial M_s}{\partial\phi} = \dfrac1s\dfrac{d}{ds}\left(ks^{${n + 1}}\right)$.`],
          teach: 'Bound volume current is the curl of M, and a curl in cylindrical coordinates carries its scale factors.',
          explain: axial
            ? t`$(\vec J_b)_\phi = -\dfrac{d}{ds}(ks^{${n}}) = ${ansT}$: the currents circle the axis, the opposite way to the surface current $\vec K_b = \vec M\times\hat s = kR^{${n}}\hat\phi$ on the outside. The two together make a solenoid whose winding density grows outward.`
            : t`$(\vec J_b)_z = \dfrac1s(${n + 1})ks^{${n}} = ${ansT}$, along the axis. The surface carries $\vec K_b = kR^{${n}}\,\hat\phi\times\hat s = -kR^{${n}}\hat z$, the return current: the pair is a coaxial cable made of magnetized matter, with field inside only.`,
        };
      },
    }),
    num({
      id: 'ampere-turns', difficulty: 2,
      gen(r) {
        const L = r.pick([5, 10, 20, 25]), D = r.pick([6, 10, 12]), Mm = r.pick([0.9, 1.0, 1.1]);
        const K = Mm * 1e6, I = K * L * 1e-3;
        return {
          prompt: t`A cylindrical NdFeB magnet ${L} mm long and ${D} mm across is magnetized uniformly along its axis with $M = ${tex(K, 2)}$ A/m. How much bound current, in total, circles its curved side? (That is the ampere-turns a wire solenoid of the same size would need to make the same field.)`,
          visual: magPic({ ratio: L / D, show: 'B', sources: true }, 'The magnet cut through its axis: its bound current (orange) circles the curved side like a solenoid’s winding, and makes the field lines (blue). Exact field for a uniformly magnetized cylinder.'),
          answer: I / 1e3, units: 'kA', tol: { rel: 0.01 },
          errors: [{ value: (K * PI * D * 1e-3) / 1e3, feedback: t`$K_b$ is current per unit length **along the axis**. Multiply by the magnet’s length, not by its circumference.` }],
          hints: [t`On the side, $\vec K_b = \vec M\times\hat n$ has size $M$ and circles the axis.`, t`Current crossing a line along the side of length $L$: $I = K_bL$.`],
          teach: t`A uniformly magnetized cylinder is a solenoid whose winding carries $K_b = M$ amperes per metre of length.`,
          explain: t`$I = K_bL = (${tex(K, 2)})(${L}\times10^{-3}) \approx ${nice(sf(I, 3))}$ A — about ${nice(sf(I / 1e3, 3))} thousand ampere-turns in a ${L} mm length. A wire coil that size would melt long before carrying it, which is why small motors, latch valves and many low-power Hall thrusters use permanent magnets: the bound current costs no power.`,
        };
      },
    }),
    mcq({
      id: 'circulation', difficulty: 2,
      prompt: t`A bar magnet is magnetized uniformly along its length, with $\vec M$ pointing toward its north end. Looking at the north end face-on, which way does its bound surface current circulate round the curved side?`,
      visual: magPic({ ratio: 2, show: 'M', sources: false }, t`The magnet cut through its axis: $\vec M$ (gold) points to the north end (right). Bound currents not drawn.`),
      choices: [
        'Counterclockwise, as you look at the north end',
        'Clockwise, as you look at the north end',
        'Along the side, from the south end to the north end',
        t`It has none: $\vec M$ is uniform, so $\nabla\times\vec M = 0$`,
      ],
      answer: 0,
      why: {
        1: t`That would make a field pointing into the magnet at your end: with the right hand, fingers along the current, the thumb gives $\vec M$ — toward you.`,
        2: t`$\vec K_b = \vec M\times\hat n$ is perpendicular to $\vec M$, so it cannot run along the magnet.`,
        3: t`$\nabla\times\vec M = 0$ rules out a **volume** current. At the surface $\vec M$ stops abruptly, and $\vec K_b = \vec M\times\hat n$ is not zero on the curved side.`,
      },
      hints: [t`Work out $\vec M\times\hat n$ on the top of the side, where $\hat n$ points up.`, 'A current loop’s moment points along your thumb when your fingers follow the current.'],
      teach: 'The bound current circulates so that, by the right-hand rule, its moment is M: counterclockwise seen from the north end.',
      explain: t`$\vec K_b = \vec M\times\hat n$ circles the axis in the sense that gives a moment along $\vec M$ — counterclockwise as seen from the north end, exactly like the winding of a solenoid whose field points at you. That is the whole reason a magnet’s north end attracts the south end of a compass needle.`,
    }),
    multi({
      id: 'pulled-in', difficulty: 2,
      prompt: t`Which of these are **pulled into** the strong field between a magnet’s pole pieces (that is, have $\vec M$ along $\vec B$)? Their susceptibilities are in Griffiths’s Table 6.1.`,
      visual: polesPic,
      choices: ['Liquid oxygen', 'Aluminium', 'Iron', 'Water', 'Copper', 'Bismuth'],
      answer: [0, 1, 2],
      why: {
        3: t`Water is diamagnetic ($\chi_m \approx ${tex(CHI.water.chi, 2)}$): its induced moments oppose the field, so it is pushed out — weakly.`,
        4: t`Copper is diamagnetic ($\chi_m \approx ${tex(CHI.copper.chi, 2)}$): pushed out. (A magnet falling down a copper pipe is slowed by eddy currents, a different effect.)`,
        5: t`Bismuth is the most strongly diamagnetic metal ($\chi_m \approx -1.7\times10^{-4}$): it is repelled.`,
      },
      hints: [t`A dipole aligned with $\vec B$ is pulled toward stronger field ([M6.6](#/lesson/phys3600.M6.6)); one opposed to it is pushed away.`, 'Paramagnets have unpaired electron spins that turn with the field; diamagnets have only paired electrons whose orbits react against it.'],
      teach: 'Paramagnets and ferromagnets magnetize along B and are pulled in; diamagnets magnetize against B and are pushed out.',
      explain: t`Liquid oxygen ($\chi_m \approx +${tex(CHI.lox.chi, 2)}$) is paramagnetic — an O₂ molecule has two unpaired electrons — and a stream of it hangs between the poles; aluminium ($\approx +${tex(CHI.aluminium.chi, 2)}$) is weakly paramagnetic; iron is ferromagnetic and pulled hard. Water, copper and bismuth are diamagnetic and pushed out. Liquid oxygen’s pull has been studied as a way to settle propellant in a tank in weightlessness.`,
    }),
    mcq({
      id: 'error-no-current', difficulty: 3, kind: 'error',
      prompt: t`A student argues: “The magnet is magnetized uniformly, so $\vec J_b = \nabla\times\vec M = 0$ everywhere. With no bound current there is nothing to make a field — the uniform magnet’s field must come from somewhere else.” Where is the slip?`,
      visual: magPic({ ratio: 1.5, show: 'B', sources: false }, 'A uniformly magnetized cylinder cut through its axis, and its field lines. Exact; the bound currents are not drawn.'),
      choices: [
        t`The surface current $\vec K_b = \vec M\times\hat n$ on the curved side was left out; it alone makes the whole field`,
        t`$\nabla\times\vec M$ is not zero for a uniform $\vec M$`,
        'A magnet’s field comes from magnetic charges at its ends, not from currents',
        'Nothing: the field comes from the free currents inside the atoms',
      ],
      answer: 0,
      why: {
        1: t`A constant vector field has zero curl. The student’s first step is right; the surface term is what is missing.`,
        2: t`No magnetic charge has ever been found; $\nabla\cdot\vec B = 0$. (A magnetic “pole” picture does give $\vec H$ correctly — that is M7.2 — but $\vec B$ comes from currents.)`,
        3: t`The atomic currents **are** the bound currents: inside they cancel, and their uncancelled edges make $\vec K_b$.`,
      },
      hints: [t`The integration by parts that gives $\vec J_b$ also leaves a boundary term. What is it?`, t`At the surface $\vec M$ drops abruptly to zero — an infinite curl, packed into a sheet.`],
      teach: t`A uniform magnetization has no volume current but a full surface current, $\vec K_b = \vec M\times\hat n$ — and that sheet makes the whole field.`,
      explain: t`Inside, each atomic loop’s current is cancelled by its neighbours’; at the surface it is not, and the leftover is a sheet $\vec K_b = \vec M\times\hat n$, a solenoid’s winding. Mathematically, $\vec M$ jumping from $M$ to 0 at the surface is a curl concentrated there: $\nabla\times\vec M$ has a delta-function sheet, which is $\vec K_b$.`,
    }),
    num({
      id: 'sphere-inside', difficulty: 2,
      gen(r) {
        const M = r.pick([300, 600, 900, 1100]);
        const B = (2 / 3) * MU0 * M * 1e3;
        return {
          prompt: t`A ball magnet is magnetized uniformly with $M = ${M}$ kA/m. How strong is the magnetic field $B$ at its centre?`,
          visual: magPic({ shape: 'sphere', show: 'M', sources: true }, t`The ball cut through its axis: uniform $\vec M$ (gold) and its bound current (orange). Not to scale.`),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [
            { value: MU0 * M * 1e3 * 1e3, feedback: t`$\mu_0M$ is the field inside a **long** magnetized rod (a long solenoid). A sphere’s bound current sits partly at the sides, and gives $\tfrac23\mu_0M$.` },
            { value: (MU0 * M * 1e3 * 1e3) / 3, feedback: t`$\tfrac13\mu_0M$ is the size of the field just outside the equator (pointing the other way). Inside it is $\tfrac23\mu_0M$.` },
          ],
          hints: [t`Its bound current is $M\sin\theta\,\hat\phi$ — a spinning charged shell’s, which makes a uniform field inside.`, t`$\vec B = \tfrac23\mu_0\vec M$ inside.`],
          teach: 'Inside a uniformly magnetized sphere the field is uniform, two-thirds of μ₀M.',
          explain: t`$B = \tfrac23\mu_0M = \tfrac23(${tex(MU0, 6)})(${M}\times10^{3}) \approx ${nice(sf(B * 1e3, 3))}$ mT, along $\vec M$ — the same everywhere inside.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cleanliness', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([4, 6, 8]), L = r.pick([2, 3, 4]), d = r.pick([0.5, 1, 2]);
        const V = PI * (D * 5e-4) ** 2 * L * 1e-3, m = M_NDFEB * V, B = (MU0 * m) / (2 * PI * d ** 3);
        return {
          prompt: t`A spacecraft’s latch valve holds itself shut with a small NdFeB disk ${D} mm across and ${L} mm thick, magnetized along its axis with $M \approx ${tex(M_NDFEB, 2)}$ A/m. Its magnetometer sits on a boom ${d} m away, on the disk’s axis. Treating the disk as a point dipole, what field does it add at the magnetometer?`,
          visual: magPic({ ratio: L / D, show: 'B', sources: true }, 'The disk magnet and its field lines, close up. At the magnetometer, metres away, only its dipole field is left. Not to scale.'),
          answer: B * 1e9, units: 'nT', tol: { rel: 0.01 },
          errors: [{ value: (MU0 * m) / (4 * PI * d ** 3) * 1e9, feedback: t`$\mu_0m/4\pi r^3$ is the dipole field **across** its axis. On the axis it is twice that, $\mu_0m/2\pi r^3$.` }],
          hints: [t`The dipole moment is the magnetization times the volume: $m = M\cdot\pi(D/2)^2L$.`, t`On the axis, $B = \dfrac{\mu_0}{4\pi}\dfrac{2m}{r^3}$.`],
          teach: 'A magnet’s moment is M times its volume; far away it is a point dipole whose field falls as 1/r³.',
          explain: t`$m = MV = (${tex(M_NDFEB, 2)})(${tex(V, 3)}\ \text{m}^3) \approx ${tex(m, 3)}\ \text{A·m}^2$, and $B = \dfrac{\mu_0m}{2\pi r^3} \approx ${nice(sf(B * 1e9, 3))}$ nT. The interplanetary field near Earth is only about 5 nT, so one valve magnet could swamp it: missions with magnetometers fit compensating magnets, test every part for its moment, and mount the sensor on a boom — doubling the distance cuts the field eightfold.`,
        };
      },
    }),
    num({
      id: 'cp-equator', difficulty: 3,
      gen(r) {
        const M = r.pick([200, 450, 700, 950]);
        const B = (MU0 * M * 1e3) / 3;
        return {
          prompt: t`A sphere is magnetized uniformly with $M = ${M}$ kA/m. How strong is the field just **outside** its surface at the equator (halfway between the poles)?`,
          visual: magPic({ shape: 'sphere', show: 'B', sources: true }, 'The magnetized sphere and its field lines; the equator is the top and bottom of the circle as drawn. Exact.'),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [
            { value: 2 * B * 1e3, feedback: t`$\tfrac23\mu_0M$ is the field **inside**. Across the equator the tangential field jumps by $\mu_0K_b = \mu_0M$, so outside it is $\tfrac23\mu_0M - \mu_0M = -\tfrac13\mu_0M$.` },
            { value: 3 * B * 1e3, feedback: t`$\mu_0M$ is the jump across the surface, not the field outside.` },
          ],
          hints: [t`Outside, the sphere is a pure dipole, $m = \tfrac43\pi R^3M$.`, t`At the equator a dipole’s field is $\dfrac{\mu_0m}{4\pi R^3}$, pointing against $\vec m$.`],
          teach: t`Outside, a magnetized sphere is a point dipole; at its equator the field is $\mu_0M/3$, pointing against $\vec M$ — and the jump from the inside value is $\mu_0K_b$.`,
          explain: t`$B = \dfrac{\mu_0}{4\pi R^3}\cdot\tfrac43\pi R^3M = \tfrac13\mu_0M \approx ${nice(sf(B * 1e3, 3))}$ mT, pointing **against** $\vec M$. The jump from $+\tfrac23\mu_0M$ inside to $-\tfrac13\mu_0M$ outside is $\mu_0M$, which is $\mu_0K_b$ at the equator, as the boundary condition requires.`,
        };
      },
    }),
    mcq({
      id: 'cp-slab', difficulty: 3,
      prompt: t`A slab $-a < x < a$ is magnetized along $z$ with $\vec M = kx\,\hat z$ (so it points up on one side and down on the other). What is the bound volume current inside it?`,
      visual: slabPic(t`The slab cut across: $\vec M$ (gold) grows linearly with $x$ and reverses through the middle.`),
      choices: [t`$\vec J_b = -k\,\hat y$, uniform`, t`$\vec J_b = +k\,\hat y$, uniform`, t`$\vec J_b = kx\,\hat y$`, t`$\vec J_b = 0$: the slab is neutral overall`],
      answer: 0,
      why: {
        1: t`$(\nabla\times\vec M)_y = \partial_zM_x - \partial_xM_z = -k$: the sign comes from the order in the curl.`,
        2: t`The curl differentiates: $\partial_x(kx) = k$, a constant.`,
        3: t`Currents need not vanish just because they cancel in total; here the volume current is cancelled by the surface currents $\vec K_b = ka\,\hat y$ on both faces.`,
      },
      hints: [t`$\nabla\times(M_z\hat z) = \partial_yM_z\,\hat x - \partial_xM_z\,\hat y$.`, t`Only $\partial_xM_z = k$ is non-zero.`],
      teach: t`$\vec J_b = \nabla\times\vec M$: work out the curl component by component, signs and all.`,
      explain: t`$\vec J_b = -\partial_x(kx)\,\hat y = -k\,\hat y$, uniform. The faces carry $\vec K_b = \vec M\times\hat n = ka\,\hat y$ each (at $x = a$, $\hat z\times\hat x = \hat y$; at $x = -a$, $(-\hat z)\times(-\hat x) = \hat y$), and per unit height the totals cancel: $-k(2a) + 2ka = 0$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §6.1–6.2, Example 6.1 and Table 6.1', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Derby and Olbert, Cylindrical magnets and ideal solenoids, Am. J. Phys. 78, 229 (2010) — the exact field the Explore picture draws', url: 'https://doi.org/10.1119/1.3256157' },
    { label: 'Coey, Magnetism and Magnetic Materials (Cambridge, 2010): NdFeB magnets and their remanence', url: 'https://doi.org/10.1017/CBO9780511845000' },
  ],
});
