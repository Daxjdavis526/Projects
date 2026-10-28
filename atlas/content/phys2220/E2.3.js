// Continuous charge distributions: chop the charge into pieces dq, add their
// fields with an integral, and let symmetry cancel components first. The rod
// on its bisector, the ring on its axis, the long wire, the big plate.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { K, EPS0, tn, s3, field, ringPic } from './_efield.js';

const t = String.raw;

// the worked example: a 3.0 nC rod 8.0 cm long, the field 3.0 cm out on its bisector
const WX = { Q: 3e-9, L: 0.08, y: 0.03 };
WX.E = (K * WX.Q) / (WX.y * Math.sqrt(WX.y ** 2 + WX.L ** 2 / 4));
WX.point = (K * WX.Q) / WX.y ** 2;
WX.line = (2 * K * (WX.Q / WX.L)) / WX.y;

const ringE = (Q, a, x) => (K * Q * x) / (x * x + a * a) ** 1.5;

export default lesson({
  id: 'phys2220.E2.3',
  title: 'Continuous charge distributions',
  minutes: 14, difficulty: 3,
  intro: t`A charged rod, ring or plate carries so many charges, spread so smoothly, that you cannot add them one at a time. Instead, chop the object into small pieces of charge $dq$, treat each piece as a point charge, and add their fields with an integral:

$$\vec E = \int \frac{k\,dq}{r^2}\,\hat r$$

Write $dq$ from a **charge density** — $dq = \lambda\,dl$ along a line, $\sigma\,dA$ over a surface — and use **symmetry** first: pieces in mirror-image positions often cancel one component of each other's field, leaving one simple integral to do.`,
  symbols: [
    { tex: 'dq', text: 'the charge on one small piece of the object, in C' },
    { tex: '\\lambda', text: 'linear charge density: charge per unit length, in C/m, so a piece of length $dl$ holds $dq = \\lambda\\,dl$' },
    { tex: '\\sigma', text: 'surface charge density: charge per unit area, in C/m², so $dq = \\sigma\\,dA$' },
    { tex: 'r', text: 'the distance from the piece $dq$ to the point where you want the field, in m — it changes from piece to piece' },
    { tex: '\\hat r', text: 'the unit vector from the piece toward that point: each piece’s field points along its own $\\hat r$' },
    { tex: 'k', text: 'the Coulomb constant, $8.988\\times10^{9}\\ \\text{N·m}^2/\\text{C}^2$' },
  ],
  why: 'This is how the fields of real objects — wires, plates, electrodes, the rings in an ion beam’s lenses — are found, and the same integral of 1/r² gives the gravity of extended bodies.',
  visual: {
    type: 'em-field',
    title: 'From pieces to an integral',
    lead: t`A charged rod chopped into $N$ equal pieces, each treated as a point charge. Each small red arrow is one piece's field at the probe, laid tip to tail; together they reach the gold arrow, the total. The readout compares the sum of the $N$ pieces with the exact integral.`,
    tasks: [
      'Set N = 1: the whole rod becomes one point charge at its middle — a poor guess this close. Raise N and watch the sum settle on the integral.',
      'Keep the probe on the vertical line through the middle: the sideways parts of mirror-image pieces cancel, so the total points straight up.',
      'Drag the probe far from the rod with N = 1: from far away the rod looks like a point charge, and even one piece does well.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-4, 8],
      rods: [{ x1: -4, y1: 0, x2: 4, y2: 0, Q: 3, pieces: 'n' }],
      sliders: [{ key: 'n', label: 'Pieces $N$', min: 1, max: 24, step: 1, value: 6, explain: 'The rod’s 3.0 nC, shared equally among N point charges at the pieces’ centres.' }],
      probe: { x: 0, y: 3 }, fan: true, readouts: ['E', 'Eexact'], arrows: false, fieldLines: false,
    },
    caption: 'The rod is 8.0 cm long and carries 3.0 nC. The arrows are drawn to one scale (shrunk if they would leave the picture). The “exact” value integrates over the rod analytically.',
  },
  example: {
    prompt: t`A thin rod 8.0 cm long carries 3.0 nC spread evenly along it. Find the electric field at a point 3.0 cm from its midpoint, on the perpendicular bisector.`,
    visual: field({ unit: 'cm', x: [-7, 7], y: [-2, 5.5], rods: [{ x1: -4, y1: 0, x2: 4, y2: 0, Q: 3, pieces: 8 }], probe: { x: 0, y: 3, label: 'P' }, fan: true, fieldLines: false }, 'The rod (8 of its pieces shown as dots), the point P, and each piece’s field at P laid tip to tail (red). Every red arrow has a mirror image whose sideways part cancels it.'),
    steps: [
      { label: 'Set up', text: t`Put the rod on the $x$ axis from $-L/2$ to $L/2$ and P at $(0, y)$. A piece $dx$ at position $x$ holds $dq = \lambda\,dx$ with $\lambda = Q/L = 3.0\times10^{-9}/0.080 = 3.75\times10^{-8}$ C/m, and is $r = \sqrt{x^2 + y^2}$ from P.` },
      { label: 'Symmetry', text: t`The pieces at $x$ and $-x$ push P equally hard; their $x$ parts cancel. Only the $y$ part survives: $dE_y = \dfrac{k\lambda\,dx}{r^2}\cdot\dfrac{y}{r} = \dfrac{k\lambda y\,dx}{(x^2 + y^2)^{3/2}}$.` },
      { label: 'Integrate', text: t`$E = k\lambda y\displaystyle\int_{-L/2}^{L/2}\frac{dx}{(x^2 + y^2)^{3/2}} = k\lambda y\left[\frac{x}{y^2\sqrt{x^2 + y^2}}\right]_{-L/2}^{L/2} = \frac{kQ}{y\sqrt{y^2 + L^2/4}}$.` },
      { label: 'Numbers', text: t`$E = \dfrac{(8.988\times10^{9})(3.0\times10^{-9})}{(0.030)\sqrt{0.030^2 + 0.040^2}} = \dfrac{26.96}{(0.030)(0.050)} = ${tn(WX.E)}$ N/C, straight away from the rod.` },
      { label: 'Limits', text: t`Far away ($y \gg L$) the formula becomes $kQ/y^2$: a point charge. Close up ($y \ll L$) it becomes $2k\lambda/y$: an infinitely long line. Here both are poor: $kQ/y^2 = ${tn(WX.point)}$ and $2k\lambda/y = ${tn(WX.line)}$ N/C bracket the true $${tn(WX.E)}$ N/C.` },
    ],
    answer: t`$E = \dfrac{kQ}{y\sqrt{y^2 + L^2/4}} = ${tn(WX.E)}$ N/C, perpendicular to the rod.`,
  },
  practice: [
    num({
      id: 'lambda', difficulty: 1,
      gen(r) {
        const L = r.pick([10, 12, 15, 20, 25]), Q = r.pick([1.5, 2.0, 3.0, 4.5, 6.0]), lam = Q / (L / 100);
        return {
          prompt: t`A plastic rod ${L} cm long carries $${Q}$ nC spread evenly along it. What is its linear charge density $\lambda$?`,
          answer: lam, units: 'nC/m', tol: { rel: 0.01 },
          errors: [{ value: L / 100 / Q, feedback: t`That is length per charge. $\lambda$ is charge per unit length: $Q/L$.` }],
          hints: [t`$\lambda = Q/L$, with $L$ in metres.`],
          teach: 'Linear charge density is charge per unit length, so a piece of length dl holds dq = λ dl.',
          explain: t`$\lambda = \dfrac{${Q}\ \text{nC}}{${L / 100}\ \text{m}} = ${s3(lam, 3)}$ nC/m. A 1 mm piece of it holds $${s3(lam * 1e-3, 3)}$ nC.`,
          visual: field({ unit: 'cm', x: [-16, 16], y: [-4, 4], rods: [{ x1: -L / 2, y1: 0, x2: L / 2, y2: 0, Q }], fieldLines: false, labels: false }, `The ${L} cm rod with its charge spread evenly along it.`),
        };
      },
    }),
    mcq({
      id: 'ring-symmetry', difficulty: 2,
      prompt: t`A ring carries charge spread evenly around it. P is on its axis. The pieces $dq$ and $dq'$ sit on opposite sides of the ring. What happens to their fields at P?`,
      choices: [
        'Their parts across the axis cancel; their parts along the axis add',
        'They cancel completely, so the field on the axis is zero',
        'Their parts along the axis cancel; their parts across the axis add',
        'Nothing cancels: every piece adds its whole field',
      ],
      answer: 0,
      why: {
        1: 'They would cancel completely only at the centre of the ring, where the two fields point in exactly opposite directions.',
        2: 'Both pieces push P away from the ring, so their parts along the axis point the same way.',
        3: 'Their sizes are equal, but their directions are mirror images: the sideways parts point opposite ways.',
      },
      hints: ['Draw both fields at P. Each points away from its own piece.'],
      teach: 'For a point on a ring’s axis, opposite pieces cancel each other’s sideways field, so only the component along the axis survives.',
      explain: 'Each piece’s field at P points away from it. For opposite pieces the sideways parts are equal and opposite and cancel; the parts along the axis add. Going round the ring in such pairs, only the axial component survives.',
      visual: ringPic({ caption: 'A charged ring (red), two opposite pieces dq and dq′, and their fields at P on the axis (blue). Drag to turn the picture.' }),
    }),
    num({
      id: 'ring-axis', difficulty: 2,
      gen(r) {
        const Q = r.pick([2, 3, 5]), a = r.pick([3, 4, 5]), x = r.pick([2, 4, 6, 10]);
        const E = ringE(Q * 1e-9, a / 100, x / 100);
        return {
          prompt: t`A ring of radius ${a} cm carries $${Q}$ nC spread evenly around it. How strong is the field on its axis, ${x} cm from its centre? On the axis, $E = \dfrac{kQx}{(x^2 + a^2)^{3/2}}$.`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (K * Q * 1e-9) / ((x / 100) ** 2 + (a / 100) ** 2), feedback: t`That adds the pieces' whole fields. Only the part along the axis survives: multiply by $x/r$.` }, { value: (K * Q * 1e-9) / (x / 100) ** 2, feedback: 'That treats the ring as a point charge at its centre — fine only far away.' }],
          hints: [t`Every piece is the same distance $r = \sqrt{x^2 + a^2}$ from P, and its field's component along the axis is $\dfrac{k\,dq}{r^2}\cdot\dfrac{x}{r}$.`, t`$E = \dfrac{kQx}{(x^2 + a^2)^{3/2}}$ with $x = ${x / 100}$ m and $a = ${a / 100}$ m.`],
          teach: 'On a ring’s axis every piece is the same distance away, so the integral is just a sum: $E = kQx/(x^2 + a^2)^{3/2}$.',
          explain: t`$E = \dfrac{(8.988\times10^{9})(${Q}\times10^{-9})(${x / 100})}{(${x / 100}^2 + ${a / 100}^2)^{3/2}} = ${tn(E)}$ N/C, along the axis, away from the ring.`,
          visual: ringPic({ pair: false, caption: `The charged ring (radius ${a} cm) and the point P on its axis, ${x} cm from the centre. Not to scale; drag to turn it.` }),
        };
      },
    }),
    expr({
      id: 'the-integral', difficulty: 3,
      prompt: t`Integrals like the rod's need $\displaystyle\int \frac{dx}{(x^2 + y^2)^{3/2}}$, with $y$ held constant (it is the distance from the rod). Find it.`,
      answer: 'x/(y^2*sqrt(x^2 + y^2))', answerTeX: t`\frac{x}{y^2\sqrt{x^2 + y^2}}`,
      vars: { x: [-2, 2], y: [0.5, 2] }, mode: 'constant', integrand: '1/(x^2 + y^2)^(3/2)',
      errors: [{ answer: 'x/sqrt(x^2 + y^2)', feedback: t`Differentiate it to check: you are missing a factor $1/y^2$.` }, { answer: '-1/sqrt(x^2 + y^2)', feedback: t`That is $\int x\,dx/(x^2 + y^2)^{3/2}$ — the integral for the component along the rod, which has an extra $x$ on top.` }],
      hints: [t`Substitute $x = y\tan\theta$, so $dx = y\sec^2\theta\,d\theta$ and $x^2 + y^2 = y^2\sec^2\theta$.`, t`The integral becomes $\dfrac{1}{y^2}\int\cos\theta\,d\theta = \dfrac{\sin\theta}{y^2}$.`, t`With $\tan\theta = x/y$, $\sin\theta = x/\sqrt{x^2 + y^2}$.`],
      teach: 'A trigonometric substitution x = y tan θ turns the 1/r³ of a line of charge into ∫cos θ dθ.',
      explain: t`With $x = y\tan\theta$: $\displaystyle\int\frac{y\sec^2\theta\,d\theta}{y^3\sec^3\theta} = \frac{1}{y^2}\int\cos\theta\,d\theta = \frac{\sin\theta}{y^2} = \frac{x}{y^2\sqrt{x^2+y^2}} + C$.`,
      visual: {
        type: 'graph',
        params: { x: [-4, 4], y: [-0.1, 1.15], aspect: 'wide', xlabel: 'x (in units of y)', ylabel: '', curves: [{ fn: '1/(x^2 + 1)^(3/2)', color: 'accent', width: 2.4 }], shade: [{ fn: '1/(x^2 + 1)^(3/2)', from: -1.33, to: 1.33, color: 'accent', alpha: 0.2 }] },
        caption: t`The integrand with $y = 1$: pieces of the rod far from the foot of the perpendicular contribute little. The shaded strip is a rod of length $L = 2.67y$.`,
      },
    }),
    num({
      id: 'long-wire', difficulty: 2,
      gen(r) {
        const lam = r.pick([2, 5, 8, 12]), d = r.pick([1, 2, 5, 10]), E = (2 * K * lam * 1e-9) / (d / 100);
        return {
          prompt: t`A long straight wire carries $${lam}$ nC/m. How strong is its field ${d} cm away (far from its ends)? Integrating along a very long line gives $E = 2k\lambda/r$.`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (K * lam * 1e-9) / (d / 100), feedback: t`The infinite line gives $2k\lambda/r$: the factor 2 is missing.` }, { value: (2 * K * lam * 1e-9) / (d / 100) ** 2, feedback: t`A line's field falls off as $1/r$, not $1/r^2$: the pieces far along the line keep contributing.` }],
          hints: [t`$E = 2k\lambda/r$, with $\lambda$ in C/m and $r$ in m.`],
          teach: 'A long line of charge has a field 2kλ/r: it falls off as 1/r, more slowly than a point charge’s.',
          explain: t`$E = \dfrac{2(8.988\times10^{9})(${lam}\times10^{-9})}{${d / 100}} = ${tn(E)}$ N/C, pointing straight away from the wire. It is the rod's formula with $L \gg y$.`,
          visual: field({ unit: 'cm', x: [-12, 12], y: [-7, 7], lines: [{ x: 0, y: 0, lambda: lam }], probe: { x: Math.min(d, 10), y: 0, label: 'P' }, probeArrow: false, fieldLines: true, density: 12 }, 'The wire seen end-on (it runs straight through the page) and the point P. Not to scale.'),
        };
      },
    }),
    num({
      id: 'semicircle', difficulty: 3,
      gen(r) {
        const Q = r.pick([2, 4, 6]), R = r.pick([5, 8, 10]), lam = (Q * 1e-9) / (Math.PI * (R / 100));
        const E = (2 * K * lam) / (R / 100), c = (K * lam) / (R / 100);
        return {
          prompt: t`A thin wire bent into a semicircle of radius ${R} cm carries $${Q}$ nC spread evenly along it. How strong is the field at the centre C of the circle?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          integrand: `${c}*sin(x)`, limits: [0, 'pi'],
          errors: [{ value: (K * Q * 1e-9) / (R / 100) ** 2, feedback: t`That adds every piece's whole field. Their sideways parts cancel: only $\int\sin\theta$ of each survives, giving $2k\lambda/R$.` }, { value: (Math.PI * K * lam) / (R / 100), feedback: t`$\int_0^\pi\sin\theta\,d\theta = 2$, not $\pi$.` }],
          hints: [
            t`A piece at angle $\theta$ holds $dq = \lambda R\,d\theta$ and is a distance $R$ from C, so $dE = k\lambda\,d\theta/R$.`,
            t`By symmetry only the component along the line of symmetry survives: $dE\sin\theta$.`,
            t`$E = \dfrac{k\lambda}{R}\displaystyle\int_0^\pi\sin\theta\,d\theta = \dfrac{2k\lambda}{R}$ with $\lambda = \dfrac{Q}{\pi R}$.`,
          ],
          teach: 'When every piece is the same distance away, only its angle changes: integrate the surviving component over the angle.',
          explain: t`$\lambda = Q/\pi R = ${tn(lam)}$ C/m and $E = \dfrac{k\lambda}{R}\displaystyle\int_0^\pi\sin\theta\,d\theta = \dfrac{2k\lambda}{R} = ${tn(E)}$ N/C, pointing away from the arc.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, 1.6], y: [-0.85, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 'pi'], color: 'bad', width: 4 }],
              points: [{ x: 0, y: 0, color: 'gold', label: 'C', labelDx: 8, labelDy: 10 }, { x: 0.5, y: 0.866, color: 'bad', r: 5, label: 'dq', labelDx: 8, labelDy: -8 }, { x: -0.5, y: 0.866, color: 'bad', r: 5, label: "dq'", labelDx: -30, labelDy: -8 }],
              arrows: [{ from: [0, 0], to: [-0.3, -0.52], color: 'accent', label: 'dE', labelDx: -26 }, { from: [0, 0], to: [0.3, -0.52], color: 'accent', label: "dE'", labelDx: 6 }],
            },
            caption: 'The charged semicircle (red), two mirror-image pieces, and their fields at the centre C (blue). The sideways parts cancel.',
          },
        };
      },
    }),
    num({
      id: 'big-plate', difficulty: 2,
      gen(r) {
        const sig = r.pick([5, 10, 20, 40]), d = r.pick([1, 2, 5]), E = (sig * 1e-9) / (2 * EPS0);
        return {
          prompt: t`A large flat plastic sheet carries $${sig}$ nC/m² spread evenly over it. How strong is its field ${d} cm from the sheet, near its middle? (Integrating rings over the whole plane gives $E = \sigma/2\varepsilon_0$; $\varepsilon_0 = 8.854\times10^{-12}\ \text{C}^2/(\text{N·m}^2)$.)`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (sig * 1e-9) / EPS0, feedback: t`That is $\sigma/\varepsilon_0$, the field between two oppositely charged sheets (or just outside a conductor). One sheet gives $\sigma/2\varepsilon_0$.` }],
          hints: [t`$E = \sigma/2\varepsilon_0$, whatever the distance (as long as it is small compared with the sheet).`],
          teach: 'A large uniformly charged sheet has a field σ/2ε₀ that does not depend on the distance from it.',
          explain: t`$E = \dfrac{${sig}\times10^{-9}}{2(8.854\times10^{-12})} = ${tn(E)}$ N/C — the same at 1 cm and at 5 cm. As you move away, each ring of the sheet is farther, but more of the sheet lies at small angles: the two effects cancel exactly for an infinite plane.`,
          visual: field({ unit: 'cm', x: [-8, 8], y: [-5, 5], sheets: [{ x: 0, y: 0, angle: 90, sigma: sig }], probe: { x: Math.min(d, 6), y: 1, label: 'P' }, probeArrow: false, fieldLines: true, density: 10 }, 'The sheet seen edge-on (it extends in and out of the page) and the point P. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'ring-error', difficulty: 3, kind: 'error',
      prompt: t`A student finds the field on the axis of a charged ring like this: “Every piece is $r = \sqrt{x^2 + a^2}$ from P, so $E = \displaystyle\int\frac{k\,dq}{r^2} = \frac{kQ}{x^2 + a^2}$.” What is wrong?`,
      choices: [
        t`They added the pieces' whole fields. The sideways parts cancel, so only $\dfrac{k\,dq}{r^2}\cdot\dfrac{x}{r}$ adds up: $E = \dfrac{kQx}{(x^2 + a^2)^{3/2}}$`,
        t`The distance should be $x$, not $\sqrt{x^2 + a^2}$`,
        'The ring is a closed loop, so its field on the axis is zero',
        t`They should have used $2k\lambda/r$, the field of a line`,
      ],
      answer: 0,
      why: {
        1: 'Each piece really is √(x² + a²) away; that part is right.',
        2: 'Only at the very centre (x = 0) do the fields cancel completely. Elsewhere the parts along the axis add.',
        3: 'The 2kλ/r formula is for a long straight line, not for a ring seen from its axis.',
      },
      hints: ['Draw the fields of two opposite pieces at P. Do they point the same way?', 'Which component of each piece’s field survives?'],
      teach: 'Integrate a component, not a size: in ∫dE, the vectors must point the same way before their sizes can be added.',
      explain: t`Integrating $|d\vec E|$ adds arrows that point in different directions. Take the component along the axis, $\cos\alpha = x/r$: $E = \dfrac{kx}{r^3}\int dq = \dfrac{kQx}{(x^2 + a^2)^{3/2}}$. It correctly gives zero at the centre and $kQ/x^2$ far away.`,
      visual: ringPic({ caption: 'Two opposite pieces of the ring and their fields at P (blue): they point in different directions.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ring', difficulty: 2,
      gen(r) {
        const Q = r.pick([4, 6, 8]), a = r.pick([2, 6]), x = r.pick([3, 5, 8]), E = ringE(Q * 1e-9, a / 100, x / 100);
        return {
          prompt: t`A ring of radius ${a} cm carries $${Q}$ nC. How strong is the field on its axis ${x} cm from the centre?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          hints: [t`$E = kQx/(x^2 + a^2)^{3/2}$.`],
          teach: 'On a ring’s axis only the axial components survive: $E = kQx/(x^2 + a^2)^{3/2}$.',
          explain: t`$E = \dfrac{(8.988\times10^{9})(${Q}\times10^{-9})(${x / 100})}{(${x / 100}^2 + ${a / 100}^2)^{3/2}} = ${tn(E)}$ N/C.`,
          visual: ringPic({ pair: false, caption: `The ring (radius ${a} cm) and the point P on its axis. Not to scale.` }),
        };
      },
    }),
    num({
      id: 'cp-lens', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([1.0, 1.2, 1.5, 2.0]), xm = a / Math.SQRT2;
        return {
          prompt: t`Ion beams in accelerators and electron microscopes are focused by ring-shaped electrodes. Model one as a uniformly charged ring of radius ${a} cm. How far from its centre, along its axis, is its field strongest?`,
          answer: xm, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: a, feedback: t`Set $dE/dx = 0$: the maximum is at $x = a/\sqrt2$, not at $x = a$.` }, { value: a / 2, feedback: t`Check the derivative: $(x^2 + a^2) - 3x^2 = 0$ gives $x^2 = a^2/2$.` }],
          hints: [t`Maximise $E(x) = \dfrac{kQx}{(x^2 + a^2)^{3/2}}$: set $dE/dx = 0$.`, t`$\dfrac{dE}{dx} = kQ\,\dfrac{(x^2 + a^2) - 3x^2}{(x^2 + a^2)^{5/2}}$.`],
          teach: 'A ring’s axial field is zero at its centre and at infinity, so it peaks in between, at x = a/√2.',
          explain: t`$\dfrac{dE}{dx} = kQ\,\dfrac{a^2 - 2x^2}{(x^2 + a^2)^{5/2}} = 0$ at $x = a/\sqrt2 = ${s3(xm, 3)}$ cm. A charged particle crossing the ring is pushed hardest there — which is why such lenses are designed around the ring's own size.`,
          visual: ringPic({ pair: false, caption: 'A ring electrode and a point on its axis. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-rod-end', difficulty: 3,
      gen(r) {
        const L = r.pick([10, 20]), Q = r.pick([2, 3, 5]), d = r.pick([2, 5, 10]);
        const lam = (Q * 1e-9) / (L / 100), E = (K * Q * 1e-9) / ((d / 100) * ((d + L) / 100));
        return {
          prompt: t`A rod ${L} cm long carries $${Q}$ nC spread evenly along it. How strong is the field on the rod's own axis, ${d} cm beyond one end?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          integrand: `${K * lam}/(${(d + L) / 100} - x)^2`, limits: [0, L / 100],
          errors: [{ value: (K * Q * 1e-9) / ((d + L / 2) / 100) ** 2, feedback: 'That puts all the charge at the rod’s middle. The near end counts for more than the far end: integrate.' }],
          hints: [t`A piece $dx$ at distance $s$ from P contributes $k\lambda\,dx/s^2$, all pointing the same way along the axis.`, t`$E = k\lambda\displaystyle\int_d^{d + L}\frac{ds}{s^2} = k\lambda\left(\frac1d - \frac1{d + L}\right) = \frac{kQ}{d(d + L)}$.`],
          teach: 'On the rod’s own axis every piece’s field points the same way, so the sizes simply integrate: E = kQ/(d(d + L)).',
          explain: t`$E = k\lambda\left(\dfrac1d - \dfrac1{d + L}\right) = \dfrac{kQ}{d(d + L)} = \dfrac{(8.988\times10^{9})(${Q}\times10^{-9})}{(${d / 100})(${(d + L) / 100})} = ${tn(E)}$ N/C, along the axis, away from the rod.`,
          visual: field({ unit: 'cm', x: [-L / 2 - 3, L / 2 + d + 4], y: [-5, 5], rods: [{ x1: -L / 2, y1: 0, x2: L / 2, y2: 0, Q }], probe: { x: L / 2 + d, y: 0, label: 'P' }, probeArrow: false, fieldLines: false }, 'The charged rod and the point P on its axis, beyond one end.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.5 Calculating Electric Fields of Charge Distributions', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-5-calculating-electric-fields-of-charge-distributions' },
  ],
});
