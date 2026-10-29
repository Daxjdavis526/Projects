// Tensor fields on space: a tensor at every point, components that are
// functions of position. The electric field (a vector field) and the stress
// inside a loaded cantilever (a (0, 2) field, a machine turning the normal of
// a cut into the force per area across it) as the two running examples.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, plane, fieldArrows, basisAt, beamStress, beamPic, DEG } from './_tcalc.js';

const t = String.raw;
const KE = 8.988e9;                          // Coulomb constant, N m²/C²
const BEAM = { P: 4000, L: 1.2, b: 0.05, h: 0.12 };   // the Explore's cantilever

// the field of point charges [{ q (nC), at: [x, y] (cm) }] on a cm grid, with a marked point
function chargesPic(charges, P, { caption, span = 7 } = {}) {
  if (P) span = Math.max(span, Math.abs(P[0]) + 1.5, (Math.abs(P[1]) + 1.2) / 0.62);
  const f = (x, y) => charges.reduce(([ex, ey], c) => {
    const dx = x - c.at[0], dy = y - c.at[1], r3 = Math.hypot(dx, dy) ** 3;
    return [ex + (c.q * dx) / r3, ey + (c.q * dy) / r3];
  }, [0, 0]);
  const near = (x, y) => charges.some((c) => Math.hypot(x - c.at[0], y - c.at[1]) < 0.9) || (P && Math.hypot(x - P[0], y - P[1]) < 0.9);
  return plane({
    x: [-span, span], y: [r6(-0.62 * span), r6(0.62 * span)],
    arrows: fieldArrows(f, { x: [-span, span], y: [-0.62 * span, 0.62 * span], step: span > 8 ? 2 : 1, maxLen: span > 8 ? 1.6 : 0.8, cap: 0.08, skip: near }),
    points: [
      ...charges.map((c) => ({ x: c.at[0], y: c.at[1], r: 7, color: c.q > 0 ? 'bad' : 'accent', label: c.q > 0 ? '+' : '−', labelDx: -4, labelDy: 4 })),
      ...(P ? [{ x: P[0], y: P[1], r: 4.5, color: 'gold', label: 'P' }] : []),
    ],
    extra: { axes: true, axesAt: 'edge', xticks: 7, yticks: 4, xlabel: 'x (cm)', ylabel: 'y (cm)' },
    caption,
  });
}

// a small square of material with a cut through it and the cut's unit normal
function cutPic(alphaDeg, caption) {
  const c = Math.cos(alphaDeg * DEG), s = Math.sin(alphaDeg * DEG);
  return plane({
    x: [-1.8, 1.8], y: [-1.15, 1.15],
    curves: [
      { param: ['-0.8 + 1.6*t', '-0.8'], t: [0, 1], color: 'ink3', width: 1.6 }, { param: ['-0.8 + 1.6*t', '0.8'], t: [0, 1], color: 'ink3', width: 1.6 },
      { param: ['-0.8', '-0.8 + 1.6*t'], t: [0, 1], color: 'ink3', width: 1.6 }, { param: ['0.8', '-0.8 + 1.6*t'], t: [0, 1], color: 'ink3', width: 1.6 },
      { param: [`${r6(-s)}*t`, `${r6(c)}*t`], t: [-1.05, 1.05], color: 'ink', width: 2.4 },
    ],
    arrows: [
      { from: [0, 0], to: [r6(0.9 * c), r6(0.9 * s)], color: 'accent', width: 2.6, label: 'n' },
      { from: [1.15, -0.95], to: [1.65, -0.95], color: 'ink3', width: 1.2, label: 'x' },
      { from: [1.15, -0.95], to: [1.15, -0.45], color: 'ink3', width: 1.2, label: 'y' },
    ],
    caption,
  });
}

// a rod in tension with an inclined cut
function rodPic(alphaDeg, caption) {
  const c = Math.cos(alphaDeg * DEG), s = Math.sin(alphaDeg * DEG);
  const half = 0.5 * Math.tan(alphaDeg * DEG);
  return plane({
    x: [-3.2, 3.2], y: [-1.2, 1.2],
    curves: [
      { param: ['-2.4 + 4.8*t', '0.5'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['-2.4 + 4.8*t', '-0.5'], t: [0, 1], color: 'ink2', width: 2 },
      { param: [`${r6(-half)}*t`, '0.5*t'], t: [-1, 1], color: 'ink', width: 2.4 },
    ],
    arrows: [
      { from: [-2.4, 0], to: [-3.1, 0], color: 'bad', width: 2.6, label: 'F', labelDy: -12 },
      { from: [2.4, 0], to: [3.1, 0], color: 'bad', width: 2.6, label: 'F', labelDy: -12 },
      { from: [0, 0], to: [r6(0.9 * c), r6(0.9 * s)], color: 'accent', width: 2.4, label: 'n' },
    ],
    caption,
  });
}

// a rocket-motor case wall, unrolled: hoop direction up the page, axis across, a weld at ψ to the axis
function wallPic(psi, caption) {
  const tn = Math.tan(psi * DEG);
  const L = Math.min(1.4, 1.1 / Math.max(tn, 0.4));
  return plane({
    x: [-2.6, 2.6], y: [-1.4, 1.4],
    curves: [
      { param: ['-2 + 4*t', '-1.1'], t: [0, 1], color: 'ink3', width: 1.4 }, { param: ['-2 + 4*t', '1.1'], t: [0, 1], color: 'ink3', width: 1.4 },
      { param: ['-2', '-1.1 + 2.2*t'], t: [0, 1], color: 'ink3', width: 1.4 }, { param: ['2', '-1.1 + 2.2*t'], t: [0, 1], color: 'ink3', width: 1.4 },
      { param: [`${r6(L)}*t`, `${r6(L * tn)}*t`], t: [-1, 1], color: 'gold', width: 3 },
    ],
    arrows: [
      { from: [-1.3, 0.25], to: [-1.3, 0.95], color: 'bad', width: 2.4, label: 'σ (hoop)', labelDx: 6 },
      { from: [-1.3, -0.25], to: [-1.3, -0.95], color: 'bad', width: 2.4 },
      { from: [1.25, -0.7], to: [1.85, -0.7], color: 'warn', width: 2.4, label: 'σ (axial)', labelDy: 14 },
      { from: [0.75, -0.7], to: [0.15, -0.7], color: 'warn', width: 2.4 },
    ],
    points: [{ x: 0, y: 0, r: 0.01, color: 'gold', label: 'weld', labelDx: 10, labelDy: 12 }],
    caption,
  });
}

// the Explore: the stress field of the cantilever, probed point by point
const SXX = 'P*(L - s)*(q/1000)/I/10^6';
const SXY = '(-(3*P/(2*b*h))*(1 - 4*(q/1000)^2/h^2)/10^6)';
const CA = 'cos(a*pi/180)', SA = 'sin(a*pi/180)';
const TX = `(${SXX})*${CA} + ${SXY}*${SA}`;
const TY = `${SXY}*${CA}`;
const YP = '4*q/1000';                               // the probe's height on the drawing (depth ×4)
const profile = [-60, -30, 30, 60].map((qk) => ({ from: ['s', `${r6((4 * qk) / 1000)}`], to: [`s + k*P*(L - s)*(${qk}/1000)/I/10^6`, `${r6((4 * qk) / 1000)}`], color: 'ink3', width: 1.4 }));
const explore = {
  type: 'graph',
  title: 'The stress field inside a loaded beam',
  lead: t`A steel cantilever, built into the wall on the left and loaded at its tip. At the gold probe, the stress tensor takes the unit normal $n$ of an imagined cut (blue) and returns the force per area $t$ that the material beyond the cut exerts across it (gold arrow): $t_i = \sigma_{ij}n^j$. Move the probe and turn the cut.`,
  tasks: [
    t`Slide the probe from the top of the beam to the bottom: $\sigma_{xx}$ runs from tension (positive) through zero on the dashed neutral axis to compression. Same beam, different tensor at every point.`,
    t`Move the probe toward the tip: $\sigma_{xx}$ falls to zero at the free end, where nothing bends the beam; the small shear part $\sigma_{xy}$ stays.`,
    t`Turn the cut until $n$ points straight up ($90^\circ$): the traction shrinks to the shear alone, less than 1 MPa. The same tensor at the same point gives very different answers for different cuts.`,
  ],
  params: {
    x: [-0.3, 2.0], y: [-0.5, 0.65], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    sliders: [
      { key: 's', label: 'probe: distance from the wall', min: 0, max: 1.2, step: 0.05, value: 0.3, unit: '\\mathrm{m}', explain: 'Where along the 1.2 m beam the probe sits.' },
      { key: 'q', label: 'probe: height above the neutral axis', min: -60, max: 60, step: 5, value: 30, unit: '\\mathrm{mm}', explain: 'The beam is 120 mm deep; the neutral axis is its middle.' },
      { key: 'a', label: 'direction of the cut’s normal $n$', min: -180, max: 180, step: 5, value: 45, unit: '^\\circ', explain: 'Measured anticlockwise from the beam’s axis.' },
    ],
    constants: { P: 4000, L: 1.2, b: 0.05, h: 0.12, I: 7.2e-6, k: 0.015 },
    curves: [
      { param: ['1.2*t', '0.24'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['1.2*t', '-0.24'], t: [0, 1], color: 'ink2', width: 2 },
      { param: ['1.2', '-0.24 + 0.48*t'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['0', '-0.45 + 0.9*t'], t: [0, 1], color: 'ink3', width: 4 },
      { param: ['1.2*t', '0'], t: [0, 1], color: 'ink4', width: 1, dash: [4, 4] },
      { param: ['s', '-0.24 + 0.48*t'], t: [0, 1], color: 'ink4', width: 1, dash: [3, 3] },
      ...Array.from({ length: 6 }, (_, k) => ({ param: ['-0.06*t', `${r6(-0.45 + (k + 0.5) * (0.9 / 6))} - 0.06*t`], t: [0, 1], color: 'ink3', width: 1.2 })),
      { param: [`s - 0.13*t*${SA}`, `${YP} + 0.13*t*${CA}`], t: [-1, 1], color: 'ink', width: 2.2 },
    ],
    arrows: [
      ...profile,
      { from: [1.2, 0.58], to: [1.2, 0.26], color: 'bad', width: 2.6, label: '4 kN', labelDx: 6, labelDy: -10 },
      { from: ['s', YP], to: [`s + 0.17*${CA}`, `${YP} + 0.17*${SA}`], color: 'accent', width: 2.4, label: 'n' },
      { from: ['s', YP], to: [`s + k*(${TX})`, `${YP} + k*(${TY})`], color: 'gold', width: 3, label: 't' },
    ],
    points: [{ x: 's', y: YP, r: 4.5, color: 'gold' }],
    readouts: [
      { label: t`$\sigma_{xx}$ (MPa)`, expr: SXX, digits: 3 },
      { label: t`$\sigma_{xy} = \sigma_{yx}$ (MPa)`, expr: SXY, digits: 3 },
      { label: t`$t_x = \sigma_{xx}n^x + \sigma_{xy}n^y$ (MPa)`, expr: TX, digits: 3 },
      { label: t`$t_y = \sigma_{yx}n^x + \sigma_{yy}n^y$ (MPa)`, expr: TY, digits: 3 },
    ],
  },
  caption: t`A steel cantilever 1.2 m long, 50 mm wide and 120 mm deep, with a 4 kN tip load; its depth is drawn four times exaggerated. Grey arrows along the dashed section: $\sigma_{xx}$ across the depth there. Stresses from Euler–Bernoulli beam theory, which neglects $\sigma_{yy}$ and is inaccurate within about one depth of the wall and of the load point.`,
};

export default lesson({
  id: 'st-a.A7.1',
  title: 'Tensor fields on space',
  minutes: 11, difficulty: 2,
  intro: t`A **tensor field** puts a tensor at every point, so its components become functions of position:

$$T(x) = T^{\mu}{}_{\nu}(x)\;\partial_\mu\otimes dx^\nu$$

At each point $x$ the tensor is the multilinear machine of module A5, eating vectors and covectors **at that point**; move, and the machine changes. Temperature $T(x)$ is a scalar field, type $(0, 0)$. The electric field $E^\mu(x)$ is a vector field, $(1, 0)$; the gradient $\partial_\mu\Phi$ of the potential, a covector field, $(0, 1)$. The **stress** $\sigma_{ij}(x)$ inside a loaded beam is a $(0, 2)$ field: at each point it takes the unit normal $n$ of an imagined cut and returns the force per area $t$ across it, $t_i = \sigma_{ij}n^j$. In Cartesian coordinates of flat space the metric is $\delta_{ij}$, so upper and lower components agree and engineers write every index down. The metric $g_{\mu\nu}(x)$ of module A6 is a tensor field too.`,
  symbols: [
    { tex: 'T(x)', text: t`the field: one tensor at each point $x$` },
    { tex: t`T^{\mu}{}_{\nu}(x)`, text: t`its components at $x$ — functions of position, one for each choice of $\mu$ and $\nu$ (here a type $(1, 1)$ field as the example)` },
    { tex: t`\partial_\mu\otimes dx^\nu`, text: t`the basis at $x$ built from the coordinate basis vectors $\partial_\mu$ and covectors $dx^\nu$ there (lessons A3–A5); in curvilinear coordinates it changes from point to point too` },
    { tex: t`\sigma_{ij}(x)`, text: t`the stress tensor at $x$, in pascals: force per area, $i, j = x, y, z$` },
    { tex: 'n^j', text: t`the unit normal of a cut through $x$ (no units)` },
    { tex: 't_i', text: t`the traction: force per area that the material on the side $n$ points to exerts across the cut, in pascals` },
  ],
  why: t`Every quantity in general relativity is a tensor field on spacetime — the metric $g_{\mu\nu}(x)$, which is the gravitational field, and the stress–energy $T^{\mu\nu}(x)$, which is the beam’s stress tensor grown to four dimensions with energy and momentum added.`,
  visual: explore,
  example: {
    prompt: t`The Explore’s cantilever: length $L = 1.2$ m, section $b \times h = 50\ \text{mm} \times 120\ \text{mm}$, tip load $P = 4.0$ kN. Beam theory gives $\sigma_{xx} = P(L - x)y/I$ and $\sigma_{xy} = -\dfrac{3P}{2bh}\left(1 - \dfrac{4y^2}{h^2}\right)$, with $\sigma_{yy} \approx 0$, $I = bh^3/12$, $x$ measured from the wall and $y$ up from the neutral axis. Find the stress tensor at A $= (0.30\ \text{m}, +30\ \text{mm})$ and the traction on a cut whose normal points at $45^\circ$; then repeat at B $= (0.30\ \text{m}, -30\ \text{mm})$.`,
    visual: beamPic(BEAM, { pts: [{ x: 0.3, y: 0.03, label: 'A' }, { x: 0.3, y: -0.03, label: 'B' }], caption: 'The cantilever (depth drawn three times exaggerated) with the two points, 30 mm above and below the neutral axis.' }),
    steps: [
      { label: 'Section', text: t`$I = bh^3/12 = (0.050)(0.120)^3/12 = 7.2\times10^{-6}\ \text{m}^4$: the second moment of area, which measures how hard the section is to bend.` },
      { label: 'The tensor at A', text: t`$\sigma_{xx} = (4000)(0.90)(0.030)/(7.2\times10^{-6}) = 15\ \text{MPa}$. The shear has $3P/(2bh) = 12\,000/0.012\ \text{Pa} = 1.0$ MPa and $1 - 4y^2/h^2 = 1 - 4(0.030)^2/(0.120)^2 = 0.75$, so $\sigma_{xy} = -0.75\ \text{MPa}$. So $$\sigma_{ij}(\text{A}) = \begin{pmatrix} 15 & -0.75 \\ -0.75 & 0 \end{pmatrix}\ \text{MPa}.$$` },
      { label: 'Feed it a normal', text: t`$n = (\cos45^\circ, \sin45^\circ) = (0.707, 0.707)$. Then $t_x = \sigma_{xx}n^x + \sigma_{xy}n^y = (15 - 0.75)(0.707) = 10.1$ MPa and $t_y = \sigma_{yx}n^x + \sigma_{yy}n^y = -0.53$ MPa.` },
      { label: 'Another point', text: t`At B, $y = -30$ mm: $\sigma_{xx} = -15$ MPa (compression), the shear is the same, and $t = \big((-15 - 0.75)(0.707),\ -0.53\big) = (-11.1, -0.53)$ MPa. Same cut direction, different point, a different tensor: that is what “field” means.` },
      { label: 'Sense check', text: t`The largest bending stress, at the wall’s top and bottom fibres, is $PL(h/2)/I = 40$ MPa — well under the roughly 250 MPa at which structural steel yields. The shear is twenty times smaller than the bending stress here, as beam theory expects for a slender beam.` },
    ],
    answer: t`$\sigma(\text{A}) = \begin{pmatrix} 15 & -0.75 \\ -0.75 & 0 \end{pmatrix}$ MPa, traction $(10.1, -0.53)$ MPa; at B, $\sigma_{xx} = -15$ MPa and the traction is $(-11.1, -0.53)$ MPa.`,
  },
  practice: [
    match({
      id: 'types', difficulty: 1,
      prompt: 'Match each field to its type.',
      left: [t`the temperature $T(x)$ in a nozzle wall`, t`the electric field $E^\mu(x)$`, t`the gradient $\partial_\mu\Phi$ of the electric potential`, t`the stress $\sigma_{ij}(x)$ in a beam`],
      right: ['scalar field, type (0, 0)', 'vector field, type (1, 0)', 'covector field, type (0, 1)', 'tensor field of type (0, 2)', 'tensor field of type (2, 1)'],
      answer: [0, 1, 2, 3],
      hints: [t`Count the indices: none is a scalar; one up is a vector; one down is a covector; two down is type $(0, 2)$.`],
      teach: t`A field’s type is the type of the tensor it puts at each point: count upper and lower indices.`,
      explain: t`Temperature is one number per point. $E^\mu$ carries one upper index (an arrow at each point); $\partial_\mu\Phi$ one lower index (a stack of equipotentials at each point); $\sigma_{ij}$ two lower indices — it eats two vectors, $\sigma_{ij}m^in^j$ being the component along $m$ of the traction on the cut with normal $n$.`,
    }),
    num({
      id: 'point-charge', difficulty: 2,
      gen(r) {
        const [x, y, R] = r.pick([[3, 4, 5], [-3, 4, 5], [4, -3, 5], [6, 8, 10], [-6, 8, 10]]), q = r.pick([2, 3, 5]), which = r.pick(['x', 'y']);
        const rm = R / 100, comp = which === 'x' ? x / 100 : y / 100;
        const E = (KE * q * 1e-9) / (rm * rm), ans = (E * comp) / rm;
        return {
          prompt: t`A charge $q = +${q}$ nC sits at the origin. At the point $(x, y) = (${x}, ${y})$ cm, its field is $E^i = \dfrac{kq\,x^i}{r^3}$ with $k = 8.988\times10^{9}\ \text{N m}^2/\text{C}^2$. Find the component $E^${which}$ there, in V/m.`,
          visual: chargesPic([{ q: 1, at: [0, 0] }], [x, y], { caption: 'The field of a positive point charge: one arrow at each point (arrows show direction; lengths are capped near the charge). Gold: the point asked about.' }),
          answer: ans, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: E, feedback: t`That is the field’s magnitude $kq/r^2$. A component also carries the direction: multiply by $x^i/r$.` }, { value: ans * 1e4, feedback: 'Convert the coordinates to metres before dividing by r³.' }],
          hints: [t`$r = ${R}$ cm $= ${nice(rm)}$ m and $x^i$ in metres too.`, t`$E^${which} = \dfrac{(8.988\times10^9)(${q}\times10^{-9})(${nice(comp)})}{(${nice(rm)})^3}$.`],
          teach: 'A vector field gives a vector at each point; its components are functions of where you are.',
          explain: t`$E = kq/r^2 = ${nice(E, 4)}$ V/m, and the ${which}-component is that times $x^${which === 'x' ? 'x' : 'y'}/r = ${nice(comp / rm)}$: $E^${which} = ${nice(ans, 4)}$ V/m.`,
        };
      },
    }),
    num({
      id: 'traction', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-40, 60, [0]), d = r.intExcept(-30, 30, [0]), c = r.intExcept(-20, 20, [0]);
        const al = r.pick([30, 60, 120, 150]), which = r.pick(['x', 'y']);
        const nx = Math.cos(al * DEG), ny = Math.sin(al * DEG);
        const tx = a * nx + c * ny, ty = c * nx + d * ny;
        const ans = which === 'x' ? tx : ty;
        const wrong = which === 'x' ? a * nx + c * nx : c * ny + d * ny;
        return {
          prompt: t`At a point in a machine part, $$\sigma_{ij} = \begin{pmatrix} ${a} & ${c} \\ ${c} & ${d} \end{pmatrix}\ \text{MPa}$$ (rows and columns $x, y$). A cut through the point has unit normal at $${al}^\circ$ from the $x$ axis. Find the traction component $t_${which} = \sigma_{${which}j}n^j$, in MPa.`,
          visual: cutPic(al, t`A small square of material at the point, the cut through it and its unit normal $n$ at $${al}^\circ$.`),
          answer: ans, units: 'MPa', tol: { rel: 0.005, abs: 0.05 },
          errors: Math.abs(wrong - ans) > 0.1 ? [{ value: wrong, feedback: t`Each term pairs a column with its own component of $n$: $\sigma_{${which}x}n^x + \sigma_{${which}y}n^y$, with $n^x = \cos${al}^\circ$ and $n^y = \sin${al}^\circ$.` }] : [],
          hints: [t`$n = (\cos${al}^\circ, \sin${al}^\circ) = (${nice(nx, 4)}, ${nice(ny, 4)})$.`, t`$t_${which} = \sigma_{${which}x}n^x + \sigma_{${which}y}n^y$: row ${which === 'x' ? 1 : 2} of the matrix against $n$.`],
          teach: t`The stress tensor at a point is a machine: feed it a cut’s normal, and $t_i = \sigma_{ij}n^j$ comes out.`,
          explain: t`$t_${which} = (${which === 'x' ? a : c})(${nice(nx, 4)}) + (${which === 'x' ? c : d})(${nice(ny, 4)}) = ${nice(ans, 4)}$ MPa.`,
        };
      },
    }),
    num({
      id: 'bending', difficulty: 2,
      gen(r) {
        const P = r.pick([2, 3, 5]) * 1000, L = r.pick([1.0, 1.5, 2.0]), h = r.pick([0.1, 0.12]), b = 0.05;
        const x = r.pick([0.25, 0.4]) * L, y = r.sign() * r.pick([0.02, 0.04]);
        const { sxx, I } = beamStress({ P, L, b, h }, x, y);
        const ans = sxx / 1e6;
        return {
          prompt: t`A cantilever of length $L = ${L}$ m, built in at $x = 0$, carries a tip load $P = ${P / 1000}$ kN; its section is ${b * 1000} mm wide and ${h * 1000} mm deep, so $I = bh^3/12$. Find the bending stress $\sigma_{xx} = P(L - x)y/I$ at $x = ${nice(x)}$ m, $y = ${y * 1000}$ mm (positive is above the neutral axis), in MPa.`,
          visual: beamPic({ P, L, b, h }, { pts: [{ x, y, label: 'point' }], caption: 'The cantilever, depth drawn three times exaggerated, with the point asked about.' }),
          answer: ans, units: 'MPa', tol: { rel: 0.01 },
          errors: [
            { value: (P * x * y) / I / 1e6, feedback: t`The bending moment at a section is the load times its distance from the **tip**, $L - x$, not from the wall.` },
            { value: (P * (L - x) * y) / ((b * h ** 3) / 3) / 1e6, feedback: t`For a rectangle about its middle, $I = bh^3/12$, not $bh^3/3$.` },
          ],
          hints: [t`$I = (${b})(${h})^3/12 = ${tex(I, 4)}\ \text{m}^4$.`, t`Put $y$ in metres: $\sigma_{xx} = (${P})(${nice(L - x)})(${nice(y)})/I$.`],
          teach: 'The stress field of a bent beam varies with position: linearly through the depth, and with the distance from the tip.',
          explain: t`$\sigma_{xx} = \dfrac{(${P})(${nice(L - x)})(${nice(y)})}{${tex(I, 4)}} = ${nice(ans, 4)}$ MPa — ${y > 0 ? 'tension, above the neutral axis' : 'compression, below the neutral axis'}.`,
        };
      },
    }),
    mcq({
      id: 'different-points', difficulty: 2,
      prompt: t`A vector field gives a vector $V(\text{P})$ at P and another, $V(\text{Q})$, at Q. Which statement is right?`,
      visual: plane({ x: [-3.8, 3.8], y: [-2.4, 2.4], arrows: [...basisAt([2.0, 0.5], { k: 0.3 }), ...basisAt([-1.4, 1.2], { k: 0.3, labels: false }), { from: [2.0, 0.5], to: [2.0, 1.6], color: 'gold', width: 3, label: 'V(P)', labelDx: 6 }, { from: [-1.4, 1.2], to: [-2.2, 0.5], color: 'gold', width: 3, label: 'V(Q)', labelDy: 14 }], points: [{ x: 2.0, y: 0.5, r: 3.5, color: 'ink', label: 'P', labelDx: -16, labelDy: 12 }, { x: -1.4, y: 1.2, r: 3.5, color: 'ink', label: 'Q', labelDx: 4, labelDy: 14 }, { x: 0, y: 0, r: 3, color: 'ink3' }], curves: [{ param: ['2.0616*cos(t)', '2.0616*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1 }, { param: ['1.8439*cos(t)', '1.8439*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1 }], caption: t`Two vectors of one field at two points, with the polar basis at each: $\partial_r$ (blue) and $0.3\,\partial_\theta$ (violet).` }),
      choices: [
        'They belong to different points; flat space lets you slide one onto the other without turning it, but a general space needs an extra rule to compare them (module A8)',
        'Compare their components in any coordinate system: equal components mean equal vectors',
        'They can never be compared, even on a flat plane',
        'Only their lengths are defined; a direction at Q means nothing at P',
      ],
      answer: 0,
      why: {
        1: t`Only in a basis that is the same everywhere. In polar coordinates $\partial_r$ at P and $\partial_r$ at Q point different ways, so equal components describe different arrows.`,
        2: 'On a flat plane, sliding an arrow without turning it is perfectly well defined: that is how you subtract velocities.',
        3: 'Directions are defined at each point; the question is only how to carry one to another point.',
      },
      hints: [t`Each vector of a field lives at its own point. What would “the same direction” mean on a curved surface such as a sphere?`],
      teach: 'Tensors at different points live in different spaces; comparing them needs a rule for carrying one to the other.',
      explain: t`On flat space the rule is obvious — slide the arrow without turning it — and Cartesian components make it automatic. On a sphere there is no such rule built in (try carrying an arrow from the equator to the pole by two routes). The rule is the **connection**, and module A8 builds it, starting with what goes wrong when you subtract polar components naively.`,
    }),
    num({
      id: 'slip-plane', difficulty: 2,
      gen(r) {
        const F = r.pick([10, 20, 30]), A = r.pick([50, 80, 100]), al = r.pick([30, 45, 60]), which = r.pick(['normal', 'shear']);
        const s = (F * 1000) / A;                         // N/mm² = MPa
        const c = Math.cos(al * DEG), sn = Math.sin(al * DEG);
        const ans = which === 'normal' ? s * c * c : s * sn * c;
        return {
          prompt: t`A rod of cross-section ${A} mm² carries a tension of ${F} kN, so inside it $\sigma_{xx} = F/A$ and every other component is zero. A cut has unit normal at $${al}^\circ$ to the rod’s axis. Find the ${which === 'normal' ? t`**normal** stress across it, $t_in^i$` : t`**shear** stress along it, the part of $t$ parallel to the cut`}, in MPa.`,
          visual: rodPic(al, t`A rod in tension with a cut whose normal is $${al}^\circ$ from the axis.`),
          answer: ans, units: 'MPa', tol: { rel: 0.005 },
          errors: [{ value: s, feedback: t`That is $\sigma_{xx}$ itself. The traction on a tilted cut is $t = \sigma_{xx}\cos\alpha$ along the axis; then project it ${which === 'normal' ? 'onto the normal' : 'along the cut'}.` }, { value: s * c, feedback: t`That is the whole traction $|t| = \sigma_{xx}\cos\alpha$. Project it ${which === 'normal' ? t`onto $n$: another $\cos\alpha$` : t`along the cut: a factor $\sin\alpha$`}.` }],
          hints: [t`$\sigma_{xx} = F/A$; with $n = (\cos\alpha, \sin\alpha)$, the traction is $t = (\sigma_{xx}\cos\alpha,\ 0)$.`, which === 'normal' ? t`Normal part: $t\cdot n = \sigma_{xx}\cos^2\alpha$.` : t`Shear part: the component of $t$ along the cut direction $(-\sin\alpha, \cos\alpha)$, in size $\sigma_{xx}\sin\alpha\cos\alpha$.`],
          teach: 'One stress tensor answers for every cut through a point; a rod in plain tension carries shear on tilted planes.',
          explain: t`$\sigma_{xx} = ${F * 1000}/${A} = ${nice(s, 4)}$ MPa, and ${which === 'normal' ? t`$\sigma_{xx}\cos^2${al}^\circ = ${nice(ans, 4)}$` : t`$\sigma_{xx}\sin${al}^\circ\cos${al}^\circ = ${nice(ans, 4)}$`} MPa. The shear peaks at $45^\circ$, at half of $\sigma_{xx}$ — which is why a ductile metal bar pulled apart slides along planes near $45^\circ$ to its axis.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-two-charges', difficulty: 2,
      gen(r) {
        const d = r.pick([3, 4]), y0 = r.pick([3, 4]), q = r.pick([2, 4]), same = r.bool(0.5);
        const R = Math.hypot(d, y0) / 100, E1 = (KE * q * 1e-9) / (R * R);
        const ans = same ? (2 * E1 * (y0 / 100)) / R : (2 * E1 * (d / 100)) / R;
        const comp = same ? 'y' : 'x';
        return {
          prompt: t`Two charges sit on the $x$ axis: $+${q}$ nC at $x = -${d}$ cm and ${same ? '$+' : '$-'}${q}$ nC at $x = +${d}$ cm. At the point $(0, ${y0})$ cm their fields add. Find the ${same ? '$y$' : '$x$'}-component of the total field there, in V/m, taking $k = 8.988\times10^{9}\ \text{N m}^2/\text{C}^2$ (the other component cancels).`,
          visual: chargesPic([{ q: 1, at: [-d, 0] }, { q: same ? 1 : -1, at: [d, 0] }], [0, y0], { span: 7, caption: 'The total field of the two charges; arrows show direction, their lengths capped near the charges. Gold: the point.' }),
          answer: ans, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: 'That is one charge’s contribution. Both contribute equally to this component.' }],
          hints: [t`Each charge is $r = \sqrt{${d}^2 + ${y0}^2} = ${nice(R * 100)}$ cm away and gives $kq/r^2$ along the line from it.`, same ? t`The $y$ parts add: $E^y = 2\,\dfrac{kq}{r^2}\,\dfrac{${y0}}{${nice(R * 100)}}$.` : t`The $x$ parts add, pointing from $+$ toward $-$ (the $+x$ direction): $E^x = 2\,\dfrac{kq}{r^2}\,\dfrac{${d}}{${nice(R * 100)}}$.`],
          teach: 'Fields add point by point: at each point the total is the vector sum of the vectors there.',
          explain: same ? t`Each charge gives $kq/r^2 = ${nice(E1, 4)}$ V/m. The $x$ parts cancel and the $y$ parts add: $E^y = ${nice(ans, 4)}$ V/m.` : t`Each charge gives $kq/r^2 = ${nice(E1, 4)}$ V/m. The $y$ parts cancel and the $x$ parts add — the field runs from the positive charge toward the negative one: $E^x = ${nice(ans, 4)}$ V/m.`,
        };
      },
    }),
    num({
      id: 'cp-weld', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([6, 8, 10]), R = r.pick([150, 250]), th = r.pick([3, 4, 5]), psi = r.pick([30, 45, 60]);
        const sh = (p * R) / th, sa = sh / 2;
        const c = Math.cos(psi * DEG), s = Math.sin(psi * DEG);
        const ans = sh * c * c + sa * s * s;
        return {
          prompt: t`A solid-rocket motor case of radius ${R} mm and wall thickness ${th} mm holds a chamber pressure of ${p} MPa. In its thin wall the stress is the hoop stress $\sigma_h = pR/t$ around the case and the axial stress $\sigma_a = pR/(2t)$ along it, with no shear between those directions. A spiral weld runs at $\psi = ${psi}^\circ$ to the case’s axis, so its normal (in the wall) is $${psi}^\circ$ from the hoop direction. What normal stress, in MPa, pulls the weld apart?`,
          visual: wallPic(psi, t`A patch of the case wall, unrolled flat: the hoop direction is up the page, the axis across it, and the gold weld runs at $${psi}^\circ$ to the axis. Not to scale.`),
          answer: ans, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: sh, feedback: t`That is the hoop stress, which a weld running straight along the axis ($\psi = 0$) would feel.` }, { value: sh * c + sa * s, feedback: t`Each stress acts on the normal twice: once to make the traction, once to project it back onto the normal. That gives squares, $\cos^2\psi$ and $\sin^2\psi$.` }],
          hints: [t`$\sigma_h = ${p}\times${R}/${th} = ${nice(sh, 4)}$ MPa and $\sigma_a = ${nice(sa, 4)}$ MPa.`, t`In (hoop, axial) components $\sigma = \text{diag}(\sigma_h, \sigma_a)$ and $n = (\cos\psi, \sin\psi)$, so $n^i\sigma_{ij}n^j = \sigma_h\cos^2\psi + \sigma_a\sin^2\psi$.`],
          teach: t`The normal stress on any cut is the stress tensor fed the cut’s normal twice: $n^i\sigma_{ij}n^j$.`,
          explain: t`$\sigma_n = ${nice(sh, 4)}\cos^2${psi}^\circ + ${nice(sa, 4)}\sin^2${psi}^\circ = ${nice(ans, 4)}$ MPa — less than the hoop stress, which is one reason spiral welds are used on pressure pipes: a weld along the axis would carry the full $\sigma_h$.`,
        };
      },
    }),
    mcq({
      id: 'cp-depends', difficulty: 2,
      prompt: 'Inside a loaded beam, on what does the force per area across a small cut depend?',
      visual: beamPic(BEAM, { pts: [{ x: 0.3, y: 0.03, label: 'P' }, { x: 0.9, y: -0.04, label: 'Q' }], caption: 'The cantilever, depth drawn three times exaggerated, with two points.' }),
      choices: [
        'On both the point and the orientation of the cut: the stress tensor field σ(x) fed the cut’s normal',
        'Only on the point: the traction is a vector field',
        'Only on the orientation of the cut: the stress is the same throughout the beam',
        'On neither: it is the load divided by the cross-section everywhere',
      ],
      answer: 0,
      why: {
        1: 'At one point, different cuts feel different tractions — turn the cut in the Explore. A vector field would give one arrow per point.',
        2: 'The bending stress changes sign across the depth and falls to zero at the tip.',
        3: 'P/A is the average shear force per area on a vertical section; the actual stresses vary from point to point and cut to cut.',
      },
      hints: [t`Recall $t_i = \sigma_{ij}(x)\,n^j$: which inputs does the right-hand side have?`],
      teach: 'Traction depends on two inputs, the point and the normal: a (0, 2) tensor field fed one vector.',
      explain: t`$t_i = \sigma_{ij}(x)n^j$: the point picks the tensor, the normal is fed into it. That two-input dependence is what makes stress a rank-2 tensor field rather than a vector field.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (tensor fields on manifolds)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'OpenStax University Physics Vol. 2, §5.4 (the electric field)', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field' },
    { label: 'Roylance, Mechanics of Materials (MIT OCW 3.11): stresses in beams; pressure vessels', url: 'https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/' },
  ],
});
