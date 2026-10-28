// Magnetostatic boundary conditions (Griffiths §5.4.2): at a surface
// current K, the normal component of B is continuous (a pillbox and
// ∇·B = 0) while the tangential component jumps by μ₀K × n̂ (an Amperian
// loop); A is continuous. Field lines kinking at a current sheet, the jump
// read off two magnetometers (an outside field cancels), the direction of
// μ₀K × n̂ (a documented sign slip), nested solenoids as stacked sheets, and
// the force on a current sheet using the average field — the magnetic
// pressure B²/2μ₀ that high-field magnets must hold. Transfer: a satellite
// crossing a sheet of field-aligned (Birkeland) current.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, PI, sf, circle, bare } from './_mag.js';

const t = String.raw;
const ANG = 'al*pi/180';
const BXA = `(cos(${ANG}) - k/2)`, BXB = `(cos(${ANG}) + k/2)`, BY = `sin(${ANG})`;

/** Arrows of a uniform field above (or below) the sheet y = 0, on a few points, scaled by L per unit field. */
const sheetArrows = (bx, by, ys, L = 0.32, color = 'accent') => [-2.6, -1.3, 0, 1.3, 2.6].flatMap((x) => ys.map((y) => ({ from: [`${x} - ${L}*${bx}`, `${y} - ${L}*${by}`], to: [`${x} + ${L}*${bx}`, `${y} + ${L}*${by}`], color, width: 2 })));
/** A field line through (x0, 0): straight above and below, with slopes set by each side's field. */
const kinked = (x0) => [
  { param: [`${x0} + t*${BXA}/${BY}`, 't'], t: [0, 1.6], color: 'violet', width: 1.6 },
  { param: [`${x0} + t*${BXB}/${BY}`, 't'], t: [-1.6, 0], color: 'violet', width: 1.6 },
];

/** A static sheet picture: the sheet at y = 0 (current out of the page) and given arrows. */
const sheetPic = (arrows, caption, extra = {}) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    curves: [{ fn: '0', domain: [-2.6, 2.6], color: 'gold', width: 3 }],
    points: [...[-2.2, -1.1, 0, 1.1, 2.2].map((x) => ({ x, y: 0, r: 3, color: 'gold' })), { x: -2.55, y: 0.12, r: 0, label: 'K out of the page', labelDx: 0, labelDy: -6, color: 'gold' }],
    arrows,
    ...extra,
  }),
  caption,
});

/** The current sheet in 3D (the xy-plane, K along x), optionally with field vectors above and below. */
const sheet3 = (vectors, caption, extra = {}) => ({
  type: 'calc-vectors3d',
  params: { range: 2.6, planes: [{ normal: [0, 0, 1], d: 0, size: 2.2, color: 'gold', alpha: 0.2 }], vectors: [{ from: [-1.2, -1.2, 0], to: [0.4, -1.2, 0], color: 'warn', label: '\\vec K' }, ...vectors], yaw: 0.9, ...extra },
  caption,
});

export default lesson({
  id: 'phys3600.M6.5',
  title: 'Magnetostatic boundary conditions',
  minutes: 14, difficulty: 3,
  equation: t`B^\perp_{\text{above}} = B^\perp_{\text{below}}, \qquad \vec B_{\text{above}} - \vec B_{\text{below}} = \mu_0\,\vec K\times\hat n`,
  intro: t`At a sheet of surface current $\vec K$ the magnetic field kinks, and the two field equations say exactly how. A flat pillbox straddling the sheet has no net flux, since $\nabla\cdot\vec B = 0$: the **normal component is continuous**. A thin rectangular Amperian loop straddling it encloses current $K\ell$ when it lies across the flow, so the **tangential component jumps by $\mu_0K$**, at right angles to $\vec K$. Together: $\vec B_{\text{above}} - \vec B_{\text{below}} = \mu_0\vec K\times\hat n$, with $\hat n$ pointing from below to above. It is the mirror image of the electrostatic rules of [M2.2](#/lesson/phys3600.M2.2), where $E^\perp$ jumps and $E^\parallel$ does not. The vector potential is continuous across the sheet; only its normal derivative jumps.`,
  symbols: [
    { tex: 'B^\\perp,\\ B^\\parallel', text: 'the components of B normal and tangential to the surface, in T' },
    { tex: '\\vec K', text: 'the surface current density: current per unit width across the flow, in A/m' },
    { tex: '\\hat n', text: 'the unit normal to the surface, pointing from the “below” side to the “above” side' },
    { tex: '\\mu_0', text: t`the vacuum permeability, $${tex(MU0, 9)}\ \text{N/A}^2$` },
  ],
  why: t`Spacecraft magnetometers find thin current sheets in space — the magnetopause, Birkeland currents — exactly as these jumps; and the same rule gives the pressure a magnet’s own field puts on its windings.`,
  visual: {
    type: 'graph',
    title: 'Field lines kinking at a current sheet',
    lead: t`A flat sheet of current (gold, flowing out of the page) sits in a uniform outside field $B_0$ tilted at angle $\alpha$ to the sheet. The sheet adds $\mp\tfrac12\mu_0K$ along the sheet above and below. Blue arrows are the total field; violet lines are field lines.`,
    tasks: [
      t`The normal component (read it) is the same on both sides for every setting; only the tangential one changes. The field lines bend at the sheet but never break.`,
      t`Set $\mu_0K/B_0 = 2\cos\alpha$: the field above becomes exactly normal to the sheet. The sheet can turn the field through any angle.`,
      t`Reverse the current (negative $K$): the kink flips. The jump in $B^\parallel$ always equals $\mu_0K$ — check it against the readouts.`,
    ],
    params: {
      ...bare([-3.2, 3.2], [-1.55, 1.55]),
      sliders: [
        { key: 'k', label: t`Sheet current $\mu_0K/B_0$`, min: -2, max: 2, step: 0.1, value: 0.6, explain: 'The surface current, measured by the field jump it makes, in units of the outside field.' },
        { key: 'al', label: t`Angle $\alpha$ of the outside field to the sheet`, min: 20, max: 160, step: 1, value: 60, unit: '^\\circ', explain: 'The direction of the uniform field that the sheet sits in.' },
      ],
      curves: [{ fn: '0', domain: [-3.2, 3.2], color: 'gold', width: 3 }, ...[-2, 0, 2].flatMap(kinked)],
      arrows: [...sheetArrows(BXA, BY, [0.55, 1.2]), ...sheetArrows(BXB, BY, [-0.55, -1.2])],
      points: [...[-2.8, -1.4, 0, 1.4, 2.8].map((x) => ({ x, y: 0, r: 3, color: 'gold' }))],
      readouts: [
        { label: t`$B^\perp$ above and below`, expr: BY, digits: 3, unit: t`B_0` },
        { label: t`$B^\parallel$ above`, expr: BXA, digits: 3, unit: t`B_0` },
        { label: t`$B^\parallel$ below`, expr: BXB, digits: 3, unit: t`B_0` },
      ],
    },
    caption: t`Exact: an infinite flat sheet makes $\tfrac12\mu_0K$ on each side, opposite in direction, plus the uniform outside field. Arrows to scale with the field; units of $B_0$.`,
  },
  example: {
    prompt: t`A wide flat sheet in the plane $z = 0$ carries surface current $\vec K = 20\ \text{A/m}\ \hat x$. Just above it the field is $\vec B = (30,\ -20,\ 40)\ \mu\text{T}$. Find the field just below.`,
    visual: sheet3([{ from: [0.6, 0.6, 0.15], to: [0.6 + 30 / 20, 0.6 - 20 / 20, 0.15 + 40 / 20], color: 'accent', label: '\\vec B_{\\text{above}}' }], t`The sheet (gold) in the $xy$-plane, its current (orange) and the field just above (blue, 1 unit per 20 μT). Drag to rotate.`),
    steps: [
      { label: 'Normal component', text: t`$\hat n = \hat z$ (from below to above). $B_z$ is continuous: $40\ \mu\text{T}$ below as well.` },
      { label: 'Jump', text: t`$\mu_0\vec K\times\hat n = \mu_0K\,(\hat x\times\hat z) = -\mu_0K\,\hat y$, with $\mu_0K = (${tex(MU0, 5)})(20) \approx ${nice(sf(MU0 * 20 * 1e6, 4))}\ \mu\text{T}$.` },
      { label: 'Solve', text: t`$\vec B_{\text{below}} = \vec B_{\text{above}} - \mu_0\vec K\times\hat n = (30,\ -20 + ${nice(sf(MU0 * 20 * 1e6, 4))},\ 40) \approx (30,\ ${nice(sf(-20 + MU0 * 20 * 1e6, 3))},\ 40)\ \mu\text{T}$.` },
      { label: 'Sense check', text: t`The sheet alone makes $\tfrac12\mu_0K \approx ${nice(sf(MU0 * 10 * 1e6, 3))}\ \mu\text{T}$ along $-\hat y$ above and $+\hat y$ below (right-hand rule round the current along $x$) ✓. Only the component across the current, $B_y$, changed; $B_x$, along $\vec K$, is continuous too.` },
    ],
    answer: t`$\vec B_{\text{below}} \approx (30,\ ${nice(sf(-20 + MU0 * 20 * 1e6, 3))},\ 40)\ \mu\text{T}$, size $${nice(sf(Math.hypot(30, -20 + MU0 * 20 * 1e6, 40), 3))}\ \mu\text{T}$.`,
  },
  practice: [
    num({
      id: 'K-from-jump', difficulty: 2,
      gen(r) {
        const K = r.pick([10, 30, 50]), B0 = r.pick([18, 22, 25]);
        const h = (MU0 * K * 1e6) / 2, up = +(B0 - h).toFixed(2), dn = +(B0 + h).toFixed(2);
        const ans = ((dn - up) * 1e-6) / MU0;
        return {
          prompt: t`Two magnetometers sit just above and just below a wide, flat copper busbar carrying current out of the page, in a lab where Earth’s field also points along the bar’s surface. Measuring the field component along the surface and across the current, the upper one reads ${up} μT and the lower one ${dn} μT. What is the surface current density in the busbar?`,
          visual: sheetPic([{ from: [-1.4, 0.55], to: [-1.4 + 0.035 * up, 0.55], color: 'accent', width: 2.4, label: `${up} μT`, labelDx: 6, labelDy: -8 }, { from: [-1.4, -0.55], to: [-1.4 + 0.035 * dn, -0.55], color: 'accent', width: 2.4, label: `${dn} μT`, labelDx: 6, labelDy: -8 }], 'The busbar edge-on (gold, current out of the page) with the two readings of the field along it (blue). Not to scale.', { points: [{ x: -1.55, y: 0.55, r: 5, color: 'violet' }, { x: -1.55, y: -0.55, r: 5, color: 'violet' }, { x: -2.55, y: 0.12, r: 0, label: 'K out of the page', labelDx: 0, labelDy: -6, color: 'gold' }] }),
          answer: ans, units: 'A/m', tol: { rel: 0.01 },
          errors: [{ value: (dn * 1e-6) / MU0, feedback: 'One reading includes Earth’s field. Only the difference between the two sides is the sheet’s doing.' }, { value: ((dn - up) * 1e-6) / (2 * MU0), feedback: t`The jump across the sheet is the whole $\mu_0K$ (it makes $+\tfrac12\mu_0K$ on one side and $-\tfrac12\mu_0K$ on the other).` }],
          hints: [t`Earth’s field is the same on both sides; the sheet’s own field reverses. Subtract the readings.`, t`$|\Delta B^\parallel| = \mu_0K$.`],
          teach: 'The jump in the tangential field across a sheet is μ₀K, whatever other fields are present — they cancel in the difference.',
          explain: t`$K = \dfrac{(${dn} - ${up})\times10^{-6}}{${tex(MU0, 5)}} \approx ${nice(sf(ans, 3))}$ A/m. The average of the two readings, $${nice(sf((up + dn) / 2, 3))}\ \mu\text{T}$, is the outside field; the current out of the page weakens the field above and strengthens it below, as the right-hand rule says.`,
        };
      },
    }),
    num({
      id: 'below', difficulty: 3,
      gen(r) {
        const Bx = r.pick([10, 20, 30]), By = r.pick([10, 15, 25]), K = r.pick([10, 20, 40]);
        const j = MU0 * K * 1e6, ans = Math.hypot(Bx + j, By);
        return {
          prompt: t`A sheet in the plane $y = 0$ carries surface current $${K}$ A/m along $+\hat z$ (out of the page). Just above it ($y > 0$) the field is $(B_x, B_y) = (${Bx},\ ${By})\ \mu\text{T}$. How strong is the field just below?`,
          visual: sheetPic([{ from: [0, 0.1], to: [0.03 * Bx, 0.1 + 0.03 * By], color: 'accent', width: 2.6, label: 'B above', labelDx: 6, labelDy: -8 }], 'The sheet edge-on (current out of the page) and the field just above it (blue). The field below is left for you.'),
          answer: ans, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(Bx - j, By), feedback: t`Sign: $\vec B_{\text{above}} - \vec B_{\text{below}} = \mu_0\vec K\times\hat n = \mu_0K(\hat z\times\hat y) = -\mu_0K\hat x$, so $B_x$ is **larger** below.` }, { value: Math.hypot(Bx, By + j), feedback: t`The jump is in the tangential component, here $B_x$; $B_y$ is normal and continuous.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$B_y$ (normal) is continuous. For $B_x$: $\vec B_{\text{above}} - \vec B_{\text{below}} = \mu_0\vec K\times\hat n$ with $\hat n = \hat y$.`, t`$\hat z\times\hat y = -\hat x$, so $B_x^{\text{below}} = B_x^{\text{above}} + \mu_0K$; $\mu_0K = ${nice(sf(j, 4))}\ \mu\text{T}$.`],
          teach: t`Below a current sheet, $\vec B_{\text{below}} = \vec B_{\text{above}} - \mu_0\vec K\times\hat n$: work out the cross product before adding.`,
          explain: t`Below: $(${Bx} + ${nice(sf(j, 4))},\ ${By})\ \mu\text{T}$, so $|\vec B| \approx ${nice(sf(ans, 3))}\ \mu\text{T}$. The right-hand rule agrees: current out of the page makes a field to the left above it and to the right below it.`,
        };
      },
    }),
    mcq({
      id: 'which', difficulty: 2,
      prompt: t`Across a sheet of surface current, which components of $\vec B$ are continuous?`,
      visual: sheetPic([...[-1.6, 0, 1.6].map((x) => ({ from: [x - 0.35, 0.6 - 0.3], to: [x + 0.35, 0.6 + 0.3], color: 'accent', width: 2.2 })), ...[-1.6, 0, 1.6].map((x) => ({ from: [x - 0.9, -0.6 - 0.3], to: [x + 0.9, -0.6 + 0.3], color: 'accent', width: 2.2 }))], 'The field just above and just below a current sheet (blue).'),
      choices: [
        'The normal component, and the tangential component along the current',
        t`Only the tangential components; the normal one jumps by $\mu_0K$`,
        'Both normal and tangential, since B has no sources',
        'Neither: everything jumps at a sheet of current',
      ],
      answer: 0,
      why: {
        1: t`That swaps the roles — it is the electrostatic pattern ($E^\perp$ jumps by $\sigma/\varepsilon_0$). For $\vec B$, $\nabla\cdot\vec B = 0$ keeps $B^\perp$ continuous.`,
        2: t`No sources fixes only the normal component. The tangential component across the current jumps by $\mu_0K$: currents are the curl of $\vec B$.`,
        3: t`$B^\perp$ is always continuous (no magnetic charge), and so is the tangential part along $\vec K$.`,
      },
      hints: [t`A pillbox gives the normal component (through $\nabla\cdot\vec B$); an Amperian loop gives the tangential (through $\nabla\times\vec B$). Which loop orientation encloses current?`],
      teach: 'At a current sheet B⊥ is continuous and only the tangential part across the current jumps — the mirror image of E at a charged sheet.',
      explain: t`The pillbox: $\oint\vec B\cdot d\vec a = 0$, so $B^\perp$ is continuous. A loop lying along the current encloses none, so $B^\parallel$ along $\vec K$ is continuous; a loop across the current encloses $K\ell$, so the component perpendicular to $\vec K$ jumps by $\mu_0K$.`,
    }),
    mcq({
      id: 'direction', difficulty: 3,
      prompt: t`A sheet in the $xy$-plane carries $\vec K = K\hat x$. Taking $\hat n = \hat z$, what is $\vec B_{\text{above}} - \vec B_{\text{below}}$?`,
      visual: sheet3([], t`The sheet (gold) and its current (orange) along $+x$. Drag to rotate.`),
      choices: [t`$-\mu_0K\,\hat y$`, t`$+\mu_0K\,\hat y$`, t`$+\mu_0K\,\hat x$`, t`$+\mu_0K\,\hat z$`],
      answer: 0,
      why: {
        1: t`$\hat x\times\hat z = -\hat y$, not $+\hat y$. A common sign slip: check with the right-hand rule — above a current along $x$, the field points along $-y$.`,
        2: t`The jump is perpendicular to $\vec K$: the component along the current is continuous.`,
        3: t`The normal component never jumps.`,
      },
      hints: [t`Compute $\hat x\times\hat z$ (cyclic order $x \to y \to z$).`, t`Check: grip the current with your right thumb along $+x$; above the sheet your fingers point along $-y$.`],
      teach: 'The jump μ₀K × n̂ lies in the sheet, perpendicular to the current; get the cross product right and the right-hand rule agrees.',
      explain: t`$\mu_0K(\hat x\times\hat z) = -\mu_0K\hat y$. The sheet alone makes $-\tfrac12\mu_0K\hat y$ above and $+\tfrac12\mu_0K\hat y$ below; their difference is $-\mu_0K\hat y$. Sign errors in $\mu_0\vec K\times\hat n$ are among the commonest slips with these conditions.`,
    }),
    num({
      id: 'nested', difficulty: 3,
      gen(r) {
        const n1 = r.pick([1000, 2000]), I1 = r.pick([2, 3]), n2 = r.pick([500, 1500]), I2 = r.pick([1, 4]), same = r.bool(0.5);
        const K1 = n1 * I1, K2 = n2 * I2, B = MU0 * (K1 + (same ? 1 : -1) * K2);
        return {
          prompt: t`Two long coaxial solenoids: the inner has ${n1} turns/m carrying ${I1} A, the outer (larger radius) ${n2} turns/m carrying ${I2} A, wound ${same ? 'in the same sense' : 'in the opposite sense'}. Treat each winding as a current sheet. How strong is the field inside the inner solenoid?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: 'sqrt(max(0.36 - x^2, 0))', lower: '-sqrt(max(0.36 - x^2, 0))', from: -0.6, to: 0.6, color: 'teal', alpha: 0.18 }], curves: [circle(0.6, 'warn'), circle(1.1, 'gold')], points: [{ x: 0, y: 0, r: 0, label: '?', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'teal' }, { x: 0, y: -0.42, r: 0, label: 'inner winding', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'warn' }, { x: 0.8, y: 0.95, r: 0, label: 'outer winding', labelDx: 8, color: 'gold' }] }), caption: 'The two solenoids end-on: each winding is a cylindrical current sheet. Not to scale.' },
          answer: Math.abs(B) * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: MU0 * Math.abs(K1 - (same ? 1 : -1) * K2) * 1e3, feedback: same ? 'Wound the same way, the two fields add inside the inner one.' : 'Wound in opposite senses, the fields oppose: subtract.' }, { value: MU0 * K1 * 1e3, feedback: 'The outer solenoid’s field fills its whole inside, including the inner solenoid.' }].filter((e) => Math.abs(e.value - Math.abs(B) * 1e3) > 0.01),
          hints: [t`Start outside, where $B = 0$. Crossing each winding inward, $B^\parallel$ jumps by $\mu_0K$ with $K = nI$.`, t`Between the windings: $\mu_0n_2I_2$. Inside the inner: add or subtract $\mu_0n_1I_1$ by the winding sense.`],
          teach: 'Nested windings are stacked current sheets: cross each one and the axial field jumps by μ₀nI.',
          explain: t`Between the windings $B = \mu_0n_2I_2 \approx ${nice(sf(MU0 * K2 * 1e3, 3))}$ mT; inside the inner one it changes by $\mu_0n_1I_1 \approx ${nice(sf(MU0 * K1 * 1e3, 3))}$ mT, giving $${nice(sf(Math.abs(B) * 1e3, 3))}$ mT.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-birkeland', difficulty: 3, transfer: true,
      gen(r) {
        const dB = r.pick([200, 400, 800]), v = 7.5, dt = r.pick([5, 10, 20]);
        const K = (dB * 1e-9) / MU0, d = v * dt * 1e3, J = K / d;
        return {
          prompt: t`A satellite in a polar orbit at 7.5 km/s flies through a sheet of field-aligned (Birkeland) current that links the magnetosphere to the auroral oval. Its magnetometer sees the east–west component of the field change by ${dB} nT across the sheet, which it crosses in ${dt} s. Treat it as a flat sheet. What is the current density inside it?`,
          visual: { type: 'graph', params: { x: [0, 60], y: [-150, 1.1 * dB], aspect: 'wide', xlabel: 'time (s)', ylabel: 'east–west field (nT)', curves: [{ fn: `${dB}*min(max((x - ${30 - dt / 2})/${dt}, 0), 1)`, color: 'accent', width: 2.4 }], vlines: [{ x: 30 - dt / 2, color: 'ink3' }, { x: 30 + dt / 2, color: 'ink3', label: 'inside the sheet' }] }, caption: t`An idealised magnetometer trace (blue): the field ramps across the sheet. Real traces are noisy and the background field has been removed.` },
          answer: J * 1e6, units: 'uA/m^2', tol: { rel: 0.01 },
          errors: [{ value: (K / 1) * 1e6, feedback: t`$\Delta B/\mu_0$ is the surface current $K$, in A/m. Spread over the sheet’s thickness $v\Delta t$, it gives $J$.` }, { value: ((dB * 1e-9) / (2 * MU0) / d) * 1e6, feedback: t`The whole jump across the sheet is $\mu_0K$, not $\tfrac12\mu_0K$.` }],
          hints: [t`The tangential field jumps by $\mu_0K$ across the sheet: $K = \Delta B/\mu_0$.`, t`The sheet is $v\Delta t = 7.5\ \text{km/s}\times${dt}\ \text{s}$ thick, so $J = K/(v\Delta t)$.`],
          teach: 'A jump ΔB in the tangential field across a sheet means a surface current K = ΔB/μ₀ — the routine way satellites measure field-aligned currents.',
          explain: t`$K = \dfrac{${dB}\times10^{-9}}{${tex(MU0, 5)}} \approx ${nice(sf(K, 3))}$ A/m, over a thickness of $${nice(v * dt)}$ km: $J \approx ${nice(sf(J * 1e6, 3))}\ \mu\text{A/m}^2$ — a typical auroral value, and in total millions of amperes along the oval.`,
        };
      },
    }),
    num({
      id: 'cp-pressure', difficulty: 3,
      gen(r) {
        const B = r.pick([5, 10, 20, 45]);
        const p = (B * B) / (2 * MU0);
        return {
          prompt: t`The winding of a long solenoid is a current sheet with $B$ inside and 0 outside. The force per unit area on a current sheet is $\vec K\times\vec B_{\text{avg}}$, where $\vec B_{\text{avg}}$ is the **average** of the fields on its two sides. What outward pressure does the field put on the winding of a ${B} T magnet?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: 'sqrt(max(0.81 - x^2, 0))', lower: '-sqrt(max(0.81 - x^2, 0))', from: -0.9, to: 0.9, color: 'teal', alpha: 0.18 }], curves: [circle(0.9, 'warn', { width: 3 })], arrows: [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ from: [0.95 * Math.cos((k * PI) / 4), 0.95 * Math.sin((k * PI) / 4)], to: [1.25 * Math.cos((k * PI) / 4), 1.25 * Math.sin((k * PI) / 4)], color: 'violet', width: 2 })), points: [{ x: 0, y: 0, r: 0, label: `B = ${B} T`, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'teal' }] }), caption: 'The solenoid end-on: its field inside (teal) pushes the winding (orange) outward (violet).' },
          answer: p / 1e6, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: (B * B) / MU0 / 1e6, feedback: t`Use the **average** field, $B/2$: the sheet does not push on itself. $f = K\cdot\tfrac B2 = \tfrac{B}{\mu_0}\cdot\tfrac B2$.` }],
          hints: [t`The jump across the winding gives $K = B/\mu_0$, and $B_{\text{avg}} = \tfrac12(B + 0)$.`, t`Pressure $= K\,B_{\text{avg}} = \dfrac{B^2}{2\mu_0}$.`],
          teach: 'A field B pushes on the currents that bound it with a magnetic pressure B²/2μ₀ — using the average of the fields on the two sides.',
          explain: t`$p = \dfrac{B^2}{2\mu_0} = \dfrac{${B}^2}{2(${tex(MU0, 5)})} \approx ${nice(sf(p / 1e6, 3))}$ MPa — ${p / 101325 > 1000 ? `about ${nice(sf(p / 101325, 2))} atmospheres` : `about ${nice(sf(p / 101325, 3))} atmospheres`}. At tens of tesla this rivals the strength of steel, which is why record magnets are wound with reinforcement and some still burst.`,
        };
      },
    }),
    num({
      id: 'cp-vector', difficulty: 3,
      gen(r) {
        const K = r.pick([10, 20, 50]), Ba = [r.pick([10, -10]), r.pick([15, 25]), r.pick([30, 40])];
        const j = MU0 * K * 1e6, Bb = [Ba[0], Ba[1], Ba[2]];
        Bb[0] = Ba[0] - j; // K along y, n = z: K×n = ŷ×ẑ = x̂; below = above − μ0K x̂
        const ans = Math.hypot(...Bb);
        return {
          prompt: t`A sheet in the $xy$-plane carries $\vec K = ${K}\ \text{A/m}\ \hat y$. Just above it ($z > 0$) the field is $(${Ba.join(',\\ ')})\ \mu\text{T}$. How strong is the field just below?`,
          visual: sheet3([], t`The sheet (gold) and its current (orange), here along $+y$. Drag to rotate.`, { vectors: [{ from: [-1.2, -1.2, 0], to: [-1.2, 0.4, 0], color: 'warn', label: '\\vec K' }] }),
          answer: ans, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(Ba[0] + j, Ba[1], Ba[2]), feedback: t`Sign: $\hat y\times\hat z = +\hat x$, so $\vec B_{\text{below}} = \vec B_{\text{above}} - \mu_0K\hat x$.` }, { value: Math.hypot(Ba[0], Ba[1] - j, Ba[2]), feedback: 'The component along the current is continuous; the jump is perpendicular to K, within the sheet.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\vec B_{\text{below}} = \vec B_{\text{above}} - \mu_0\vec K\times\hat n$, with $\hat n = \hat z$.`, t`$\hat y\times\hat z = \hat x$; $\mu_0K = ${nice(sf(j, 4))}\ \mu\text{T}$.`],
          teach: t`The boundary condition is a vector equation: $\vec B_{\text{below}} = \vec B_{\text{above}} - \mu_0\vec K\times\hat n$.`,
          explain: t`$\vec B_{\text{below}} = (${nice(sf(Bb[0], 4))},\ ${Bb[1]},\ ${Bb[2]})\ \mu\text{T}$, of size $${nice(sf(ans, 3))}\ \mu\text{T}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.4.2 and Problem 5.17', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Iijima & Potemra, Large-scale characteristics of field-aligned currents, J. Geophys. Res. 81 (1976)', url: 'https://doi.org/10.1029/JA081i013p02165' },
  ],
});
