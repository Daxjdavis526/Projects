// The displacement field D (Griffiths §4.3): Gauss's law in matter,
// ∇·D = ρ_f with D = ε₀E + P; when ∮D·da = Q_f gives D (symmetry that the
// material's boundaries share) and when it does not; the "deceptive
// parallel" — ∇×D = ∇×P, so D is not fixed by free charge alone — shown on
// a bar electret (no free charge anywhere, D ≠ 0, its lines closed loops)
// whose field is computed by numerical integration over its end faces; the
// boundary conditions D⊥ jumps by σ_f, E∥ continuous. Transfer: charge
// building up in a spacecraft's Kapton blanket.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, PI, DEG, sf, diskE, arrowsAt, grid, circle, polygon, is, bare } from './_mag.js';

const t = String.raw;

// ── the bar electret: uniform P along +x, bound charge ±P on its end faces ──
const SHAPES = [{ name: 'long rod', h: 1.3, a: 0.55 }, { name: 'thin disc', h: 0.15, a: 1.2 }];
const WIN = { x: [-3.2, 3.2], y: [-1.55, 1.55] };
/** E (units P/ε₀) of the electret at (X, Y) in a slice through its axis, by quadrature over both faces. */
function electretE({ h, a }, X, Y) {
  const s = Math.abs(Y), sg = Y < 0 ? -1 : 1;
  const [s1, z1] = diskE(1, a, s, X - h), [s2, z2] = diskE(-1, a, s, X + h);
  return [EPS0 * (z1 + z2), EPS0 * sg * (s1 + s2)];
}
const inside = ({ h, a }, X, Y) => Math.abs(X) < h && Math.abs(Y) < a;
const nearFace = ({ h, a }, X, Y) => (Math.abs(Math.abs(X) - h) < 0.09 && Math.abs(Y) < a + 0.09) || (Math.abs(Math.abs(Y) - a) < 0.07 && Math.abs(X) < h + 0.07);
const PTS = grid(WIN.x, WIN.y, 20);
const fieldSets = SHAPES.map((S, g) => {
  // a thin disc falls between grid columns: give it a column of its own along its mid-plane
  const extra = S.h < 0.2 ? [...new Set(PTS.map(([, y]) => y))].filter((y) => Math.abs(y) < S.a - 0.07).map((y) => [0, y]) : [];
  const pts = [...PTS.filter(([x, y]) => !nearFace(S, x, y)), ...extra];
  const E = new Map(pts.map(([x, y]) => [`${x},${y}`, electretE(S, x, y)]));
  const Ef = (x, y) => E.get(`${x},${y}`);
  const Df = (x, y) => { const [u, v] = Ef(x, y); return inside(S, x, y) ? [u + 1, v] : [u, v]; };
  const Pf = (x, y) => (inside(S, x, y) ? [1, 0] : [0, 0]);
  const w = (f) => `${is('g', g)}*${is('f', f)}`;
  return [
    ...arrowsAt(pts, Ef, { len: 0.3, maxM: 1, when: w(0) }),
    ...arrowsAt(pts, Df, { len: 0.3, maxM: 1, when: w(1) }),
    ...arrowsAt(pts, Pf, { len: 0.3, maxM: 1, when: w(2), color: 'gold' }),
  ];
}).flat();
/** Centre values (closed form, from two disks on their common axis): E against P, and D. */
const centre = ({ h, a }) => { const c = h / Math.hypot(h, a); return { E: -(1 - c), D: c }; };
/** Outline and bound-charge marks of shape g (gated on the choice when `gate`). */
function outline(g, gate = true) {
  const { h, a } = SHAPES[g], when = gate ? { when: is('g', g) } : {};
  const n = 5, ys = Array.from({ length: n }, (_, k) => -a + ((k + 0.5) * 2 * a) / n);
  return {
    curves: polygon([[-h, -a], [h, -a], [h, a], [-h, a]], 'ink2', when),
    points: [...ys.map((y) => ({ x: h + 0.06, y, r: 3, color: 'warn', ...when })), ...ys.map((y) => ({ x: -h - 0.06, y, r: 3, color: 'accent', ...when }))],
  };
}
const o0 = outline(0), o1 = outline(1);

/** Two flat media meeting at y = 0: vacuum above, material below, with arrows. */
const interfacePic = (arrows, caption, extra = {}) => ({
  type: 'graph',
  params: bare([-2.6, 2.6], [-1.25, 1.25], {
    shade: [{ fn: '0', lower: '-1.25', from: -2.6, to: 2.6, color: 'teal', alpha: 0.2 }],
    curves: [{ fn: '0', domain: [-2.6, 2.6], color: 'teal', width: 2 }],
    points: [{ x: -2.5, y: 1.05, r: 0, label: 'vacuum', labelDx: 0, labelDy: 0, color: 'ink2' }, { x: -2.5, y: -1.05, r: 0, label: 'polarized material', labelDx: 0, labelDy: 0, color: 'teal' }],
    arrows,
    ...extra,
  }),
  caption,
});

export default lesson({
  id: 'phys3600.M5.2',
  title: 'The displacement field D',
  minutes: 15, difficulty: 3,
  equation: t`\nabla\cdot\vec D = \rho_f, \qquad \vec D \equiv \varepsilon_0\vec E + \vec P`,
  intro: t`Inside matter the charge comes in two kinds: the **free** charge $\rho_f$ you put there (on plates, in a wire) and the bound charge $\rho_b = -\nabla\cdot\vec P$ that polarization produces. Gauss’s law sees both: $\varepsilon_0\nabla\cdot\vec E = \rho_f - \nabla\cdot\vec P$. Move $\vec P$ to the left and the bound charge disappears from the equation: the combination $\vec D = \varepsilon_0\vec E + \vec P$, the **displacement**, has the free charge alone as its source, so $\oint\vec D\cdot d\vec a = Q_{f,\text{enc}}$. That is useful — you control the free charge. But it is **half of a field’s description**: $\nabla\times\vec D = \nabla\times\vec P$, which need not vanish, so $\vec D$ is **not** fixed by the free charge alone. Its boundary conditions follow from the same pillboxes and loops as $\vec E$’s in [M2.2](#/lesson/phys3600.M2.2): $D_\perp$ jumps by $\sigma_f$, while $E_\parallel$ stays continuous.`,
  symbols: [
    { tex: '\\vec D', text: t`the displacement field, in $\text{C/m}^2$ (the units of $\vec P$ and of surface charge)` },
    { tex: '\\rho_f', text: t`the free charge density, in $\text{C/m}^3$: charge not tied to the material’s molecules` },
    { tex: '\\vec E', text: 'the electric field — the real, total one, made by free and bound charge together — in V/m' },
    { tex: '\\vec P', text: t`the polarization, in $\text{C/m}^2$` },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $${tex(EPS0, 5)}$ F/m` },
  ],
  why: t`Every capacitor and cable calculation with an insulator starts from $\oint\vec D\cdot d\vec a = Q_f$, and $\vec D$ joins $\vec H$ in Maxwell’s equations in matter (PHYS 4600) — so knowing exactly when it fails matters.`,
  visual: {
    type: 'graph',
    title: 'A field with no free charge',
    lead: t`A bar of **electret** — a material with a frozen-in polarization $\vec P$, pointing right — seen in a slice through its axis. There is no free charge anywhere. Its bound charge is $+P$ on the right face (orange) and $-P$ on the left (blue). Switch between $\vec E$, $\vec D$ and $\vec P$, and between a long rod and a thin disc.`,
    tasks: [
      t`$\vec E$ on the long rod: lines leave the $+$ face and end on the $-$ face, as for any charge. Inside the rod $\vec E$ points **backward**, against $\vec P$, but is weak (read $E$ at the centre).`,
      t`$\vec D$ on the long rod: inside it points **forward**, $D \approx P$, and its lines close in loops through the outside — no starts, no ends, since $\nabla\cdot\vec D = \rho_f = 0$. Yet $\vec D \ne 0$: it is not set by free charge alone.`,
      t`Switch to the thin disc: now inside $E \approx P/\varepsilon_0$ backward and $D \approx 0$. Same material, same $\vec P$, still no free charge — the shape alone decided $\vec D$.`,
    ],
    params: {
      ...bare(WIN.x, WIN.y),
      choices: [
        { key: 'g', label: 'Shape', options: SHAPES.map((S, g) => [g, S.name]), value: 0, explain: 'The same uniform polarization in a long thin rod or a short wide disc.' },
        { key: 'f', label: 'Field', options: [[0, t`$\vec E$`], [1, t`$\vec D = \varepsilon_0\vec E + \vec P$`], [2, t`$\vec P$`]], value: 1, explain: 'The electric field, the displacement, or the polarization that makes both.' },
      ],
      curves: [...o0.curves, ...o1.curves],
      points: [...o0.points, ...o1.points],
      arrows: fieldSets,
      readouts: [
        { label: t`$E$ at the centre (units of $P/\varepsilon_0$; negative is against $\vec P$)`, expr: SHAPES.map((S, g) => `${is('g', g)}*(${centre(S).E})`).join(' + '), digits: 3 },
        { label: t`$D$ at the centre (units of $P$)`, expr: SHAPES.map((S, g) => `${is('g', g)}*(${centre(S).D})`).join(' + '), digits: 3 },
      ],
    },
    caption: t`$\vec E$ computed by numerical integration of Coulomb’s law over the two charged end faces; $\vec D = \varepsilon_0\vec E + \vec P$. Arrow lengths are compressed (and capped near the face edges, where $E$ grows without bound); colour shows strength. Centre values are exact.`,
  },
  example: {
    prompt: t`An electret rod of radius 5.0 mm and length 10 cm has a uniform polarization $P = 1.0\ \mu\text{C/m}^2$ along its axis and no free charge. Find $\vec E$ and $\vec D$ at its centre. Then do the same for a disc of the same material, 1.0 mm thick and 5.0 cm in radius.`,
    visual: { type: 'graph', params: bare([-3, 3], [-1, 1], { curves: [...polygon([[-2, -0.35], [2, -0.35], [2, 0.35], [-2, 0.35]], 'ink2'), { param: ['2*t', '0.35*t'], t: [0, 1], color: 'ink3', dash: [4, 4], width: 1.5 }, { param: ['-2*t', '0.35*t'], t: [0, 1], color: 'ink3', dash: [4, 4], width: 1.5 }], points: [...[-0.28, -0.14, 0, 0.14, 0.28].flatMap((y) => [{ x: 2.07, y, r: 3, color: 'warn' }, { x: -2.07, y, r: 3, color: 'accent' }]), { x: 0, y: 0, r: 4, color: 'good', label: 'centre', labelDx: -20, labelDy: 16 }, { x: 2.1, y: 0.62, r: 0, label: '+P face', labelDx: -20, color: 'warn' }, { x: -2.1, y: 0.62, r: 0, label: '−P face', labelDx: -20, color: 'accent' }], arrows: [{ from: [-0.6, -0.65], to: [0.6, -0.65], color: 'gold', width: 2.6, label: 'P', labelDx: 6, labelDy: 4 }] }), caption: t`The rod cut through its axis (radius exaggerated): bound charge $\pm P$ on its end faces. Each face is a uniformly charged disk seen from a point on its axis (dashed lines to the rims).` },
    steps: [
      { label: 'Bound charge', text: t`$\vec P$ is uniform, so $\rho_b = 0$; on the end faces $\sigma_b = \pm P$, on the curved side $\vec P\cdot\hat n = 0$. Two charged disks, a distance $h = L/2$ from the centre.` },
      { label: 'Field of each disk', text: t`From [M1.1](#/lesson/phys3600.M1.1), a disk of charge $\sigma$ and radius $a$ makes $\dfrac{\sigma}{2\varepsilon_0}\left(1 - \dfrac{h}{\sqrt{h^2 + a^2}}\right)$ on its axis at distance $h$. Both faces push the centre’s field the same way, from $+$ to $-$: **against** $\vec P$. So $E = \dfrac{P}{\varepsilon_0}\left(1 - \dfrac{h}{\sqrt{h^2 + a^2}}\right)$.` },
      { label: 'Rod', text: t`$h = 5.0$ cm, $a = 0.50$ cm: $h/\sqrt{h^2 + a^2} = ${nice(sf(centre({ h: 5, a: 0.5 }).D, 4))}$, so $E \approx ${nice(sf((1e-6 / EPS0) * -centre({ h: 5, a: 0.5 }).E, 3))}$ V/m backward and $D = \varepsilon_0E + P = P\dfrac{h}{\sqrt{h^2 + a^2}} \approx ${nice(sf(centre({ h: 5, a: 0.5 }).D, 3))}\ \mu\text{C/m}^2$ forward.` },
      { label: 'Disc', text: t`$h = 0.50$ mm, $a = 5.0$ cm: $h/\sqrt{h^2 + a^2} = ${nice(sf(centre({ h: 0.05, a: 5 }).D, 3))}$, so $E \approx ${tex((1e-6 / EPS0) * -centre({ h: 0.05, a: 5 }).E, 3)}$ V/m backward — nearly $P/\varepsilon_0$ — and $D \approx ${nice(sf(centre({ h: 0.05, a: 5 }).D, 2))}\ \mu\text{C/m}^2$.` },
      { label: 'The lesson', text: t`No free charge in either, yet $D$ differs a hundredfold. $\nabla\cdot\vec D = 0$ everywhere, but $\nabla\times\vec D = \nabla\times\vec P$ is not zero on the curved side, where $\vec P$ stops abruptly. Gauss’s law for $\vec D$ is true here and tells you nothing.` },
    ],
    answer: t`Rod: $E \approx ${nice(sf((1e-6 / EPS0) * -centre({ h: 5, a: 0.5 }).E, 2))}$ V/m against $\vec P$, $D \approx ${nice(sf(centre({ h: 5, a: 0.5 }).D, 3))}\ \mu\text{C/m}^2$ along it. Disc: $E \approx ${tex((1e-6 / EPS0) * -centre({ h: 0.05, a: 5 }).E, 3)}$ V/m against $\vec P$, $D \approx ${nice(sf(centre({ h: 0.05, a: 5 }).D, 2))}\ \mu\text{C/m}^2$.`,
  },
  practice: [
    num({
      id: 'coated', difficulty: 2,
      gen(r) {
        const Q = r.pick([2, 5, 10]), a = 1, b = r.pick([3, 4]), rc = r.pick([1.5, 2, 2.5]);
        const D = (Q * 1e-9) / (4 * PI * (rc / 100) ** 2);
        return {
          prompt: t`A metal ball of radius ${a} cm carries a free charge of ${Q} nC. It is coated with a thick layer of an insulating plastic out to a radius of ${b} cm. Nothing is known about the plastic except that it is spherically symmetric. Find $D$ inside the plastic, ${rc} cm from the centre.`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: `sqrt(max(${(b / 4) ** 2} - x^2, 0))`, lower: `-sqrt(max(${(b / 4) ** 2} - x^2, 0))`, from: -b / 4, to: b / 4, color: 'teal', alpha: 0.22 }, { fn: 'sqrt(max(0.0625 - x^2, 0))', lower: '-sqrt(max(0.0625 - x^2, 0))', from: -0.25, to: 0.25, color: 'ink3', alpha: 0.6 }], curves: [circle(b / 4, 'teal'), circle(0.25, 'ink2'), circle(rc / 4, 'violet', { dash: [5, 4] })], points: [{ x: b / 4 + 0.05, y: 0.4, r: 0, label: 'plastic', labelDx: 6, color: 'teal' }, { x: rc / 4 * 0.71, y: -rc / 4 * 0.71, r: 0, label: 'Gaussian sphere', labelDx: 14, labelDy: 18, color: 'violet' }] }), caption: t`The metal ball (grey), its plastic coat (teal) and a Gaussian sphere of radius ${rc} cm inside the plastic (violet, dashed). To scale.` },
          answer: D * 1e9, units: 'nC/m^2', tol: { rel: 0.01 },
          errors: [{ value: ((Q * 1e-9) / (4 * PI * (a / 100) ** 2)) * 1e9, feedback: 'That is the free charge density on the metal’s surface. D falls off as 1/r² through the plastic.' }],
          hints: [t`With spherical symmetry (in the plastic too), $\oint\vec D\cdot d\vec a = D\cdot4\pi r^2 = Q_{f,\text{enc}}$.`, t`Only the ${Q} nC on the metal is free; the plastic’s bound charge does not enter.`],
          teach: 'When the material shares the symmetry, Gauss’s law for D gives D from the free charge alone — whatever the material is.',
          explain: t`$D = \dfrac{Q_f}{4\pi r^2} = \dfrac{${Q}\times10^{-9}}{4\pi(${rc / 100})^2} \approx ${nice(sf(D * 1e9, 3))}\ \text{nC/m}^2$, radially out. To get $\vec E$ you need $\vec P$ — that is, a property of the plastic (M5.3). Outside the coat, $\vec P = 0$ and $E = D/\varepsilon_0$.`,
        };
      },
    }),
    num({
      id: 'perp-jump', difficulty: 2,
      gen(r) {
        const D1 = r.pick([2, 3, 5]), sf_ = r.pick([1, 1.5, 4, -1]);
        const D2 = D1 + sf_;
        return {
          prompt: t`At a flat interface between two insulators, medium 1 is below and medium 2 above. Just below, the normal component of $\vec D$ is $${D1}\ \mu\text{C/m}^2$, pointing up. The interface carries a free surface charge $\sigma_f = ${sf_}\ \mu\text{C/m}^2$. What is the upward normal component of $\vec D$ just above?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '0', lower: '-1.25', from: -2.6, to: 2.6, color: 'teal', alpha: 0.18 }, { fn: '1.25', lower: '0', from: -2.6, to: 2.6, color: 'violet', alpha: 0.1 }], curves: [{ fn: '0', domain: [-2.6, 2.6], color: 'gold', width: 2.6 }, ...polygon([[-0.5, -0.3], [0.5, -0.3], [0.5, 0.3], [-0.5, 0.3]], 'ink2', { dash: [4, 4], width: 1.5 })], arrows: [{ from: [0, -1.1], to: [0, -0.4], color: 'accent', width: 2.6, label: 'D below', labelDx: 8, labelDy: 6 }], points: [{ x: 1.2, y: 0.12, r: 0, label: 'free charge σ on the interface', labelDx: 0, color: 'gold' }, { x: -2.5, y: 1.05, r: 0, label: 'medium 2', labelDx: 0, labelDy: 0, color: 'violet' }, { x: -2.5, y: -1.05, r: 0, label: 'medium 1', labelDx: 0, labelDy: 0, color: 'teal' }] }), caption: 'The interface (gold) with its free charge, a pillbox straddling it (dashed) and the known D below. The field above is left for you.' },
          answer: D2, units: 'uC/m^2', tol: { rel: 0.01, abs: 0.01 },
          errors: [{ value: D1 - sf_, feedback: t`Flux out of the pillbox is $D_{2\perp} - D_{1\perp}$ (out through the top, in through the bottom) $= \sigma_f$. So $D_{2\perp} = D_{1\perp} + \sigma_f$.` }, { value: D1, feedback: t`$D_\perp$ is continuous only where there is no **free** surface charge. Here there is.` }].filter((e) => Math.abs(e.value - D2) > 0.01),
          hints: [t`A thin pillbox straddling the interface: $\oint\vec D\cdot d\vec a = Q_{f,\text{enc}} = \sigma_fA$.`, t`The flux is $(D_{2\perp} - D_{1\perp})A$, with “up” as positive.`],
          teach: t`Across any surface, the normal component of $\vec D$ jumps by the free surface charge: $D_{2\perp} - D_{1\perp} = \sigma_f$.`,
          explain: t`$D_{2\perp} = D_{1\perp} + \sigma_f = ${D1} + (${sf_}) = ${nice(D2)}\ \mu\text{C/m}^2$. Bound surface charge does not appear: it is already inside $\vec D$ through $\vec P$.`,
        };
      },
    }),
    num({
      id: 'measured-P', difficulty: 3,
      gen(r) {
        const sg = r.pick([5, 8, 10]), P = r.pick([2, 3, 4]);
        const E = ((sg - P) * 1e-6) / EPS0;
        return {
          prompt: t`A capacitor’s plates carry free charge $\pm${sg}\ \mu\text{C/m}^2$ and are isolated. A slab of an unknown insulator fills the gap, and a measurement shows its polarization is $P = ${P}\ \mu\text{C/m}^2$, pointing from the positive plate to the negative. Find the field inside the slab.`,
          visual: { type: 'em-capacitor', params: { A: 0.01, d: 2e-3, connected: false, Q: sg * 1e-6 * 0.01, kappa: sg / (sg - P), f: 1, controls: [], readouts: [], show: { values: false } }, caption: 'The plates’ free charge, the slab’s bound charge facing them, and the field between. Drawn as a linear slab with the same ratio of free to bound charge; the question assumes nothing about linearity. Fringing ignored.' },
          answer: E / 1e3, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: ((sg * 1e-6) / EPS0) / 1e3, feedback: t`$\sigma_f/\varepsilon_0$ is the field in the empty gap. In the slab the bound charge $-P$ facing the positive plate cancels part of it.` }, { value: ((sg + P) * 1e-6) / EPS0 / 1e3, feedback: t`$\vec D = \varepsilon_0\vec E + \vec P$, so $\varepsilon_0E = D - P$: subtract the polarization.` }],
          hints: [t`A pillbox with one face inside a plate: $D = \sigma_f$ in the slab, whatever the material.`, t`$E = (D - P)/\varepsilon_0$.`],
          teach: 'D follows the free charge; then E = (D − P)/ε₀ needs only the polarization — no assumption about the material.',
          explain: t`$D = ${sg}\ \mu\text{C/m}^2$, so $E = \dfrac{(${sg} - ${P})\times10^{-6}}{${tex(EPS0, 5)}} \approx ${nice(sf(E / 1e3, 3))}$ kV/m — the field of the free charge minus that of the bound charge $\mp P$ on the slab’s faces. The ratio $\sigma_f/(\sigma_f - P) = ${nice(sf(sg / (sg - P), 3))}$ is what a linear material would call its dielectric constant.`,
        };
      },
    }),
    mcq({
      id: 'deceptive', difficulty: 3,
      prompt: t`A bar electret holds a frozen-in uniform polarization and **no free charge anywhere**. A student argues: “$\oint\vec D\cdot d\vec a = Q_{f,\text{enc}} = 0$ for every closed surface, so $\vec D = 0$ everywhere.” Is that right?`,
      visual: { type: 'graph', params: { ...bare(WIN.x, WIN.y), constants: { g: 0, f: 1 }, curves: o0.curves, points: o0.points, arrows: fieldSets.filter((a) => a.when === `${is('g', 0)}*${is('f', 1)}`) }, caption: t`The rod’s $\vec D$, computed numerically (lengths compressed). Its lines run forward inside and loop back outside.` },
      choices: [
        t`No: zero flux through every surface makes $\nabla\cdot\vec D = 0$, but $\nabla\times\vec D = \nabla\times\vec P \ne 0$ at the rod’s sides, so $\vec D$ need not vanish`,
        t`Yes: $\vec D$ is determined by the free charge, and there is none`,
        t`No, because the bound charge on the end faces counts as $Q_{f,\text{enc}}$`,
        t`Yes inside the rod, where $\vec E$ and $\vec P$ cancel; no outside`,
      ],
      answer: 0,
      why: {
        1: t`That is the **deceptive parallel**: $\vec E$ is fixed by its sources because its curl is zero. $\vec D$’s curl is $\nabla\times\vec P$, which is not zero where the polarization stops at the side walls.`,
        2: t`Bound charge is exactly what $\vec D$ leaves out: $\nabla\cdot\vec D = \rho_f$ only.`,
        3: t`Inside the rod $\vec D \approx \vec P$, pointing forward; $\varepsilon_0\vec E$ is a small backward correction, not a cancellation.`,
      },
      hints: [t`A vector field is fixed by its divergence **and** its curl (Helmholtz, M0.5). What is $\nabla\times\vec D$?`, t`$\nabla\times\vec D = \varepsilon_0\nabla\times\vec E + \nabla\times\vec P$, and $\nabla\times\vec E = 0$ in statics.`],
      teach: t`$\vec D$ has the free charge as its divergence, but its curl is $\nabla\times\vec P$: it is fixed by free charge alone only when that curl vanishes.`,
      explain: t`Zero flux everywhere means only $\nabla\cdot\vec D = 0$: lines of $\vec D$ never start or end — they close in loops, as in the picture. Helmholtz’s theorem needs the curl too, and $\nabla\times\vec P$ is a sheet at the rod’s side walls. (It is the same pattern as a solenoid’s magnetic field, for the same mathematical reason — M6.)`,
    }),
    multi({
      id: 'when-gauss', difficulty: 3,
      prompt: t`In which of these can you find $\vec D$ from $\oint\vec D\cdot d\vec a = Q_{f,\text{enc}}$ alone, knowing nothing about the insulator?`,
      visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '0.55', lower: '-0.55', from: -0.55, to: 0.55, color: 'teal', alpha: 0.25 }], curves: [...polygon([[-0.55, -0.55], [0.55, -0.55], [0.55, 0.55], [-0.55, 0.55]], 'teal'), circle(0.9, 'violet', { dash: [5, 4] })], points: [{ x: 0, y: 0, r: 5, color: 'warn', label: '+q', labelDx: 8 }, { x: 0.95, y: 0.5, r: 0, label: 'sphere: D·n̂ not constant on it', labelDx: 6, color: 'violet' }] }), caption: 'One of the cases: a point charge at the centre of a cube of insulator, with a spherical Gaussian surface that cuts through the cube’s corners.' },
      choices: [
        'A point charge at the centre of a sphere of insulator',
        'A long wire along the axis of a cylindrical insulating sleeve',
        'A charged plane sandwiched between two equal flat slabs of insulator',
        'A point charge at the centre of a cube of insulator',
        'A point charge just outside a flat slab of insulator',
      ],
      answer: [0, 1, 2],
      why: {
        3: t`The cube’s faces break the spherical symmetry: $\vec P$, and so $\vec D$, need not be radial, and $\nabla\times\vec P \ne 0$ at its faces.`,
        4: t`The slab bends the field. Neither $\vec D$’s direction nor its size is constant over any surface you could draw.`,
      },
      hints: [t`You need a surface over which $\vec D\cdot\hat n$ is constant — so the symmetry must hold for the insulator’s shape too, not just the free charge.`, 'Check that every boundary of the insulator is a sphere, a cylinder or a plane matching the free charge’s symmetry.'],
      teach: t`Gauss’s law for $\vec D$ is useful only when the free charge **and** the material’s boundaries share one symmetry; then $\nabla\times\vec P = 0$ and $\vec D$ follows the free charge.`,
      explain: t`In the symmetric cases the polarization shares the symmetry, its curl vanishes, and $\vec D$ is exactly the vacuum $\varepsilon_0\vec E$ of the free charge. In the cube and the slab the material’s edges set up bound charge that bends the field, and $\vec D$ is no longer fixed by free charge alone.`,
    }),
    num({
      id: 'tangential', difficulty: 3,
      gen(r) {
        const Ex = r.pick([10, 20, 30]), Ey = r.pick([-15, 10, 25]), Px = r.pick([0.1, 0.2]), Py = r.pick([0.1, 0.3]);
        const Eya = Ey + (Py * 1e-6) / EPS0 / 1e3, ans = Math.hypot(Ex, Eya);
        const sc = 0.025;
        return {
          prompt: t`Vacuum lies above a flat face of a polarized material; there is no free charge on the face. Just below it, inside the material, $\vec P = (${Px},\ ${Py})\ \mu\text{C/m}^2$ and $\vec E = (${Ex},\ ${Ey})$ kV/m, as $(x, y)$ components with $y$ normal to the face, pointing out into the vacuum. How strong is the field just above the face?`,
          visual: interfacePic([{ from: [-1, -0.08], to: [-1 + Ex * sc, -0.08 + Ey * sc], color: 'accent', width: 2.6, label: 'E below', labelDx: 6, labelDy: 10 }, { from: [1, -0.08], to: [1 + Px * 4, -0.08 + Py * 4], color: 'gold', width: 2.6, label: 'P', labelDx: 6, labelDy: 10 }], t`The face (teal line), the field just inside it (blue) and the polarization (gold), each drawn to its own scale. The field above is left for you.`),
          answer: ans, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(Ex, Ey), feedback: t`$E_\perp$ jumps: the face carries bound charge $\sigma_b = P_y$. Use $D_\perp$, which is continuous here.` }, { value: Math.hypot(Ex + (Px * 1e-6) / EPS0 / 1e3, Eya), feedback: t`The tangential component of $\vec E$ is continuous (curl $\vec E = 0$); only the normal component changes.` }],
          hints: [t`$E_x$ is the same on both sides. No free charge, so $D_y$ is the same: $\varepsilon_0E_y^{\text{above}} = \varepsilon_0E_y^{\text{below}} + P_y$.`, t`$P_y/\varepsilon_0 = ${nice(sf((Py * 1e-6) / EPS0 / 1e3, 4))}$ kV/m.`],
          teach: 'At a boundary E∥ is continuous and, with no free charge, D⊥ is continuous — so E⊥ jumps by the bound charge, P⊥/ε₀.',
          explain: t`Above: $E_x = ${Ex}$ kV/m and $E_y = ${Ey} + ${nice(sf((Py * 1e-6) / EPS0 / 1e3, 4))} = ${nice(sf(Eya, 4))}$ kV/m, so $|\vec E| \approx ${nice(sf(ans, 3))}$ kV/m. The tangential part of $\vec P$ plays no part: it makes no surface charge.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-kapton', difficulty: 3, transfer: true,
      gen(r) {
        const J = r.pick([0.1, 0.2, 0.5]), Dlim = 1e-3;
        const Jsi = J * 1e-9 / 1e-4, tmin = Dlim / Jsi / 60;
        return {
          prompt: t`During a geomagnetic substorm, hot electrons stream onto a spacecraft in geostationary orbit at $${J}$ nA/cm² (substorms bring 0.1 to 1 nA/cm²). They stop in the outer layer of a Kapton thermal blanket bonded to grounded aluminium. Treat the blanket as large and flat, with the electrons as a free surface charge on its outer face and no field outside. Ignoring leakage, after how many minutes does $D$ inside the Kapton reach $1.0\ \text{mC/m}^2$? (With Kapton’s permittivity, from the next lesson, that makes a field of about 30 MV/m in the film — enough to risk a discharge.)`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: '-0.55', lower: '-1.0', from: -2.4, to: 2.4, color: 'ink3', alpha: 0.6 }, { fn: '0.35', lower: '-0.55', from: -2.4, to: 2.4, color: 'gold', alpha: 0.25 }], curves: [{ fn: '0.35', domain: [-2.4, 2.4], color: 'gold', width: 2 }], points: [...[-2, -1.2, -0.4, 0.4, 1.2, 2].map((x) => ({ x, y: 0.42, r: 0, label: '−', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'accent' })), ...[-2, -1.2, -0.4, 0.4, 1.2, 2].map((x) => ({ x, y: -0.62, r: 0, label: '+', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'warn' })), { x: -2.4, y: -0.85, r: 0, label: 'grounded aluminium', labelDx: 0, labelDy: 0, color: 'ink' }, { x: -2.4, y: 0.0, r: 0, label: 'Kapton', labelDx: 0, labelDy: 0, color: 'gold' }], arrows: [...[-1.6, 0, 1.6].map((x) => ({ from: [x, -0.45], to: [x, 0.25], color: 'violet', width: 2.4 })), ...[-0.8, 0.8].map((x) => ({ from: [x, 1.2], to: [x, 0.55], color: 'accent', width: 2, dash: true }))] }), caption: t`Electrons (dashed) bury themselves at the blanket’s surface; an equal positive charge is drawn into the grounded aluminium; $\vec D$ (violet) runs between them. Thickness exaggerated. Real charge lands at a range of depths and leaks away slowly.` },
          answer: tmin, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: tmin * 60, feedback: 'That is in seconds; the question asks for minutes.' }],
          hints: [t`A pillbox with one face in the aluminium and one face in the Kapton: $D = |\sigma_f|$, whatever Kapton’s properties.`, t`$\sigma_f$ grows as $Jt$: convert $${J}$ nA/cm² to A/m² ($1\ \text{cm}^2 = 10^{-4}\ \text{m}^2$).`],
          teach: t`$D$ in the film is set by the free charge deposited, $D = \sigma_f = Jt$ — the material only matters for turning $\vec D$ into $\vec E$.`,
          explain: t`$J = ${tex(Jsi, 2)}\ \text{A/m}^2$, so $t = D/J = \dfrac{10^{-3}}{${tex(Jsi, 2)}} \approx ${nice(sf(tmin * 60, 3))}$ s $\approx ${nice(sf(tmin, 3))}$ min. Designers fight this **surface charging** — and the internal charging that MeV electrons cause deeper down — with conductive coatings and by grounding every blanket; discharges in charged insulators are a known cause of anomalies on geostationary satellites.`,
        };
      },
    }),
    num({
      id: 'cp-normal', difficulty: 3,
      gen(r) {
        const Eo = r.pick([20, 50, 80]), P = r.pick([0.2, 0.5, 1.0]);
        const Ein = Eo - (P * 1e-6) / EPS0 / 1e3;
        return {
          prompt: t`Just outside a flat face of a polarized material, in vacuum, the field is ${Eo} kV/m, pointing straight out of the face. Inside, the polarization is $${P}\ \mu\text{C/m}^2$, also pointing straight out. There is no free charge. What is the field just inside, as a component along the outward normal (negative if it points inward)?`,
          visual: interfacePic([{ from: [-0.8, 0.08], to: [-0.8, 0.9], color: 'accent', width: 2.6, label: 'E outside', labelDx: 6, labelDy: 0 }, { from: [0.8, -0.95], to: [0.8, -0.2], color: 'gold', width: 2.6, label: 'P', labelDx: 6, labelDy: 6 }], t`The face (teal) with the field just outside it (blue) and the polarization inside (gold). Not to scale.`),
          answer: Ein, units: 'kV/m', tol: { rel: 0.01 },
          errors: [{ value: Eo + (P * 1e-6) / EPS0 / 1e3, feedback: t`The face carries bound charge $+P$, which makes the field just inside smaller than just outside: $E_{\text{in}} = E_{\text{out}} - P/\varepsilon_0$.` }, { value: Eo, feedback: t`Only $D_\perp$ is continuous here. $E_\perp$ jumps by the bound charge.` }],
          hints: [t`$D_\perp$ is continuous (no free charge): $\varepsilon_0E_{\text{out}} = \varepsilon_0E_{\text{in}} + P$.`, t`$P/\varepsilon_0 = ${nice(sf((P * 1e-6) / EPS0 / 1e3, 4))}$ kV/m; subtract it from the outside field.`],
          teach: 'With no free charge, D⊥ is continuous across a face, so E⊥ jumps by P⊥/ε₀.',
          explain: t`$E_{\text{in}} = E_{\text{out}} - \dfrac{P}{\varepsilon_0} = ${Eo} - ${nice(sf((P * 1e-6) / EPS0 / 1e3, 4))} \approx ${nice(sf(Ein, 3))}$ kV/m${Ein < 0 ? t`: it points **into** the material, against $\vec P$ — the depolarizing field of M5.1` : ''}.`,
        };
      },
    }),
    mcq({
      id: 'cp-disc', difficulty: 2,
      prompt: t`In the middle of a thin, wide electret disc polarized across its thickness (no free charge anywhere), which of $\vec E$, $\vec D$ and $\vec P$ is close to zero?`,
      visual: { type: 'graph', params: { ...bare(WIN.x, WIN.y), constants: { g: 1, f: 2 }, curves: o1.curves, points: o1.points, arrows: fieldSets.filter((a) => a.when === `${is('g', 1)}*${is('f', 2)}`) }, caption: t`The disc in a slice through its axis, with its polarization (gold) and bound charge $\pm P$ on its faces.` },
      choices: [t`$\vec D$: the faces act like a capacitor, so $\varepsilon_0\vec E \approx -\vec P$ and they cancel`, t`$\vec E$: there is no free charge to make a field`, t`$\vec P$: a polarization cannot survive its own field`, 'None of them'],
      answer: 0,
      why: {
        1: t`Bound charge makes field too: the faces carry $\pm P$, a parallel-plate capacitor with $E = P/\varepsilon_0$ between them.`,
        2: t`An electret’s polarization is frozen in — that is what makes it an electret. Its own field opposes it but does not undo it.`,
        3: t`One of them does vanish: add $\varepsilon_0\vec E$ and $\vec P$.`,
      },
      hints: [t`The disc’s faces carry bound charge $\pm P$. What field does a wide pair of charged sheets make between them?`],
      teach: 'In a thin disc polarized across its thickness, the depolarizing field is −P/ε₀, so D = ε₀E + P ≈ 0.',
      explain: t`A thin disc is a parallel-plate capacitor of bound charge: $\vec E \approx -\vec P/\varepsilon_0$ inside, so $\vec D \approx 0$. In a long rod polarized along its length it is the other way round: $\vec E \approx 0$ and $\vec D \approx \vec P$. Free charge is zero in both — another face of $\nabla\times\vec D \ne 0$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §4.3 and Problem 4.15', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NASA-HDBK-4002A, Mitigating In-Space Charging Effects (2011)', url: 'https://standards.nasa.gov/standard/NASA/NASA-HDBK-4002' },
  ],
});
