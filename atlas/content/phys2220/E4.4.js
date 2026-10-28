// Field from potential: E is minus the gradient of V. Along a line, E_x is
// minus the slope of V(x); in space each component is minus a partial
// derivative. Differentiating one number-valued function is often the easiest
// way to a vector field.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { K, EPS0, tn, s3, r6, field } from './_efield.js';

const t = String.raw;

// the worked example: a ring, Q = 5.0 nC, radius 3.0 cm; P on its axis 4.0 cm from the centre
const WX = { Q: 5e-9, a: 0.03, z: 0.04 };
WX.V = (K * WX.Q) / Math.hypot(WX.z, WX.a);
WX.E = (K * WX.Q * WX.z) / (WX.z ** 2 + WX.a ** 2) ** 1.5;
const ringV = `${r6(K * WX.Q * 100)}/sqrt(x^2 + 9)`;              // V(z) in volts, z in cm
const slope = -WX.E / 100;                                       // dV/dz in V/cm at z = 4 cm

// a simple model of the fair-weather atmosphere: V(z) = V∞(1 − e^(−z/H))
const ATM = { Vinf: 250e3, H: 2000 };

// the piecewise-linear profile of the checkpoint (x in cm, V in volts)
const PW = '-100*min(x, 2) + 100*max(x - 4, 0)';

export default lesson({
  id: 'phys2220.E4.4',
  title: 'Field from potential',
  minutes: 14, difficulty: 3,
  intro: t`Going from field to potential takes an integral, $\Delta V = -\int\vec E\cdot d\vec s$. Going back takes a derivative. Along a line, the field's component is minus the slope of the potential:

$$E_x = -\frac{dV}{dx}$$

In space, each component is minus a **partial derivative** — the derivative with respect to one coordinate, holding the others fixed:

$$\vec E = -\nabla V = -\left(\frac{\partial V}{\partial x},\ \frac{\partial V}{\partial y},\ \frac{\partial V}{\partial z}\right)$$

The gradient $\nabla V$ points the way $V$ climbs fastest, at right angles to the equipotentials; the field points the opposite way, downhill, and its size is the steepness. Where $V$ is flat the field is zero — whatever the value of $V$.`,
  symbols: [
    { tex: 'E_x', text: 'the component of the field along $x$, in V/m (= N/C); positive if it points toward $+x$' },
    { tex: '\\dfrac{dV}{dx}', text: 'the slope of the graph of $V$ against $x$, in V/m' },
    { tex: '\\dfrac{\\partial V}{\\partial x}', text: 'a partial derivative: differentiate $V$ with respect to $x$, treating $y$ and $z$ as constants' },
    { tex: '\\nabla V', text: 'the gradient of $V$: the vector of its three partial derivatives, pointing uphill in $V$' },
  ],
  why: 'Adding potentials is adding numbers; one derivative then gives the whole vector field. This is how fields are computed in practice — around electrodes, in ion optics, in a thunderstorm — and how instruments infer a field from two voltage readings a short distance apart.',
  visual: {
    type: 'em-field',
    title: 'The field is the downhill slope of V',
    lead: t`The lower graph shows $V$ along the horizontal line through the probe, with its tangent at the probe (gold). Drag the probe; the readout compares the slope with the field.`,
    tasks: [
      'One charge: wherever the graph of V is steep, the field is strong. The readout shows Eₓ = −dV/dx at every point.',
      'Two equal charges: midway, the graph of V has a flat top. The slope is zero, so Eₓ is zero there — though V is not.',
      'Two strips: between them V falls in a straight line (a uniform field); outside it levels off.',
      'Charged ball: inside, V curves smoothly over and is flat at the centre, where the field is zero.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-5, 5],
      presets: [
        { id: 'one', label: 'One charge', charges: [{ x: 0, y: 0, q: 2 }], probe: { x: 3, y: 1 } },
        { id: 'pair', label: 'Two equal charges', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: 2 }], probe: { x: 1, y: 0.5 } },
        { id: 'strips', label: 'Two charged strips', sheets: [{ x: -2, y: 0, angle: 90, sigma: 20, width: 8 }, { x: 2, y: 0, angle: 90, sigma: -20, width: 8 }], probe: { x: -1, y: 0.5 } },
        { id: 'ball', label: 'Charged ball', balls: [{ x: 0, y: 0, R: 3, Q: 3 }], probe: { x: 1.5, y: 0 } },
      ],
      preset: 'one', readouts: ['V', 'dVdx'], profile: true, fieldLines: true, density: 10, arrows: false, equip: false, toggles: ['equip', 'fieldLines'],
    },
    caption: 'Charges in nC; the strips carry ±20 nC/m²; the ball is 3.0 cm in radius with 3.0 nC. The slope is found numerically from V; Eₓ is computed separately from the charges — the two agree.',
  },
  example: {
    prompt: t`A ring of radius 3.0 cm carries 5.0 nC spread evenly round it. On its axis, at distance $z$ from its centre, every piece of the ring is the same distance $\sqrt{z^2 + a^2}$ away, so $V(z) = \dfrac{kQ}{\sqrt{z^2 + a^2}}$. Find the field on the axis 4.0 cm from the centre by differentiating.`,
    visual: {
      type: 'graph',
      params: {
        x: [-10, 10], y: [0, 1700], aspect: 'wide', xlabel: 'z, along the axis (cm)', ylabel: 'V (V)',
        curves: [
          { fn: ringV, domain: [-10, 10], color: 'violet', width: 2.6 },
          { fn: `${r6(WX.V)} + ${r6(slope)}*(x - 4)`, domain: [1.6, 6.4], color: 'gold', width: 2.2, label: 'tangent: slope = −E', labelAt: 6.4, labelDx: -30, labelDy: 18 },
        ],
        points: [{ x: 4, y: r6(WX.V), color: 'gold', label: 'P' }],
      },
      caption: 'The potential along the ring’s axis: highest at the centre, where its slope — and the field — is zero. At P the slope is negative: the field points along +z, away from the ring.',
    },
    steps: [
      { label: 'Write V', text: t`$V(z) = kQ\,(z^2 + a^2)^{-1/2}$. Unlike the field, $V$ needed no components: each piece contributes a number, $k\,dq/\sqrt{z^2 + a^2}$, and they simply add up to $kQ/\sqrt{z^2 + a^2}$.` },
      { label: 'Differentiate', text: t`By the chain rule, $\dfrac{dV}{dz} = kQ\left(-\tfrac12\right)(z^2 + a^2)^{-3/2}\cdot2z = -\dfrac{kQz}{(z^2 + a^2)^{3/2}}$, so $E_z = -\dfrac{dV}{dz} = \dfrac{kQz}{(z^2 + a^2)^{3/2}}$ — the result lesson E2.3 reached by integrating components.` },
      { label: 'Numbers', text: t`$E_z = \dfrac{(8.988\times10^{9})(5.0\times10^{-9})(0.040)}{\left((0.040)^2 + (0.030)^2\right)^{3/2}} = \dfrac{1.798}{1.25\times10^{-4}} = ${tn(WX.E)}$ V/m, pointing along the axis away from the ring. There $V = ${tn(WX.V)}$ V.` },
      { label: 'Sense check', text: t`At $z = 0$ the slope is zero, so the field at the centre is zero — though $V$ is largest there. Far away, $E_z \to kQ/z^2$: a point charge.` },
    ],
    answer: t`$E_z = \dfrac{kQz}{(z^2 + a^2)^{3/2}} = ${tn(WX.E)}$ V/m, along the axis, away from the ring.`,
  },
  practice: [
    num({
      id: 'slope-read', difficulty: 1,
      gen(r) {
        const x = r.pick([1, 3, 6]), s = x < 2 ? -100 : x < 4 ? 0 : 100, Ex = -s * 100;
        return {
          prompt: t`The graph shows the potential along the $x$ axis. What is the field component $E_x$ at $x = ${x}$ cm?`,
          answer: Ex, units: 'V/m', tol: { rel: 0.01, abs: 1 },
          errors: s === 0 ? [{ value: -20000, feedback: 'That is V divided by the distance. The field depends on how V changes: here V is flat.' }] : [{ value: -Ex, feedback: t`That is the slope itself. The field is minus the slope: $E_x = -dV/dx$.` }],
          hints: ['Read the slope of the graph at that point, in volts per centimetre, then convert to V/m.', t`$E_x = -\dfrac{dV}{dx}$.`],
          teach: 'Eₓ is minus the slope of the graph of V against x: zero where V is flat, pointing downhill where it slopes.',
          explain: s === 0 ? t`Between 2 and 4 cm the graph is flat at $-200$ V: $dV/dx = 0$, so $E_x = 0$. The value of $V$ does not matter, only its change.` : t`There the slope is $${s > 0 ? '+' : ''}${s}$ V/cm $= ${tn(s * 100)}$ V/m, so $E_x = -dV/dx = ${tn(Ex)}$ V/m: the field points toward ${Ex > 0 ? '$+x$' : '$-x$'}, down the slope.`,
          visual: { type: 'graph', params: { x: [0, 8], y: [-250, 250], aspect: 'wide', xlabel: 'x (cm)', ylabel: 'V (V)', curves: [{ fn: PW, domain: [0, 8], color: 'violet', width: 2.6 }], vlines: [{ x, label: `x = ${x} cm` }] }, caption: 'The potential against position along the x axis.' },
        };
      },
    }),
    mcq({
      id: 'where-zero', difficulty: 2, fixedOrder: true,
      prompt: 'The graph shows the potential along a line. At which marked point is the field along the line zero?',
      choices: ['A', 'B', 'C', 'D'],
      answer: 1,
      why: {
        0: 'V is zero at A — but it is changing faster there than anywhere else on the graph: the field at A is the strongest of the four. E = 0 needs a flat graph, not V = 0.',
        2: 'At C V is falling, so the field points toward +x; it is not zero.',
        3: 'At D V is small and the graph is gentle, so the field is weak — but not zero: V is still falling.',
      },
      hints: ['The field is minus the slope. Where is the graph flat?'],
      teach: 'The field is zero where V is flat (a peak or a trough), whatever the value of V; where V = 0 the field can be strong.',
      explain: 'Eₓ = −dV/dx, so it is zero where the graph is flat: at the peak, B. At A, V = 0 but the slope is steepest. Being zero and being flat are different things — just as E = 0 between two equal charges where V is far from zero.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 10], y: [-450, 550], aspect: 'wide', xlabel: 'x (cm)', ylabel: 'V (V)',
          curves: [{ fn: '600*(x - 1)*exp(-(x - 1)/2)', domain: [0.3, 10], color: 'violet', width: 2.6 }],
          points: [[1, 'A'], [3, 'B'], [6, 'C'], [9, 'D']].map(([x, label]) => ({ x, y: r6(600 * (x - 1) * Math.exp(-(x - 1) / 2)), label, color: 'gold' })),
        },
        caption: 'The potential along a line, with four marked points.',
      },
    }),
    expr({
      id: 'Ex-partial', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 5]);
        return {
          prompt: t`In a region of space the potential is $V = ${a}x^2y$ (in volts, with $x$ and $y$ in metres). Find the field component $E_x$.`,
          answer: `-${2 * a}*x*y`, answerTeX: t`-${2 * a}xy`, lhs: 'E_x',
          vars: { x: [0.5, 2], y: [0.5, 2] },
          derivativeOf: `-${a}*x^2*y`,
          errors: [
            { answer: `${2 * a}*x*y`, feedback: t`That is $\partial V/\partial x$. The field is minus the gradient: $E_x = -\partial V/\partial x$.` },
            { answer: `-${a}*x^2`, feedback: t`That is $-\partial V/\partial y$, which gives $E_y$. For $E_x$ differentiate with respect to $x$, holding $y$ fixed.` },
          ],
          hints: [t`Treat $y$ as a constant and differentiate with respect to $x$.`, t`$\dfrac{\partial}{\partial x}(${a}x^2y) = ${2 * a}xy$.`],
          teach: 'Each component of E is minus a partial derivative of V: differentiate with respect to that coordinate, holding the others fixed.',
          explain: t`Holding $y$ fixed, $\dfrac{\partial V}{\partial x} = ${2 * a}xy$, so $E_x = -${2 * a}xy$ V/m. (Likewise $E_y = -\partial V/\partial y = -${a}x^2$.) At $(1, 1)$ m the field has $E_x = -${2 * a}$ V/m: it points toward $-x$, downhill in $V$.`,
          visual: { type: 'surface3d', params: { z: `${a}*x^2*y`, domain: [[-1.5, 1.5], [-1.5, 1.5]], zscale: r6(0.25 / a), tangentAt: [1, 1], readouts: [], levels: 9 }, caption: t`The potential as a landscape, with height $V$ over the $(x, y)$ plane, and its tangent plane at $(1, 1)$. The red arrow is $\nabla V$, pointing uphill; the field points the opposite way. Drag to turn it.` },
        };
      },
    }),
    expr({
      id: 'quad-Ey', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 4, 5]) * 1e5;
        return {
          prompt: t`Near the axis of an electrostatic quadrupole lens, the potential is $V = a(x^2 - y^2)$, with $a = ${tn(a)}$ V/m². Find $E_y$, and use it to say which way a proton on the $y$ axis is pushed. (Type the answer in terms of $a$, $x$ and $y$.)`,
          answer: '2*a*y', answerTeX: t`2ay`, lhs: 'E_y',
          vars: { y: [-2, 2], x: [-2, 2], a: [0.5, 3] }, wrt: 'y',
          derivativeOf: '-a*(x^2 - y^2)',
          errors: [
            { answer: '-2*a*y', feedback: t`That is $\partial V/\partial y$. The field is minus it.` },
            { answer: '-2*a*x', feedback: t`That is $E_x = -\partial V/\partial x$. For $E_y$ differentiate with respect to $y$.` },
          ],
          hints: [t`Hold $x$ fixed: $\dfrac{\partial}{\partial y}\big(a(x^2 - y^2)\big) = -2ay$.`],
          teach: t`A quadrupole’s $V = a(x^2 - y^2)$ gives $E_x = -2ax$ and $E_y = +2ay$: it pushes a positive charge back toward the axis in $x$ and away from it in $y$.`,
          explain: t`$E_y = -\dfrac{\partial V}{\partial y} = -(-2ay) = 2ay$. On the $+y$ side $E_y > 0$: the proton is pushed further out, away from the axis. Meanwhile $E_x = -2ax$ pushes it back toward the axis in $x$. A quadrupole focuses in one plane and defocuses in the other — which is why accelerators alternate them, as in lesson E2.4. At $y = 1.0$ mm here, $E_y = ${tn(2 * a * 1e-3)}$ V/m.`,
          visual: field({ unit: 'cm', x: [-6, 6], y: [-3.75, 3.75], lines: [{ x: -3, y: 0, lambda: 10 }, { x: 3, y: 0, lambda: 10 }, { x: 0, y: -3, lambda: -10 }, { x: 0, y: 3, lambda: -10 }], equip: true, equipLabels: false, levels: [-400, -200, -100, -50, -20, 0, 20, 50, 100, 200, 400], fieldLines: true, density: 6 }, 'A quadrupole lens seen end-on: four long electrodes (two positive, two negative). Near the axis its equipotentials (violet) are the hyperbolas x² − y² = constant.'),
        };
      },
    }),
    num({
      id: 'two-readings', difficulty: 2,
      gen(r) {
        const [V1, dV] = r.pick([[1520, -36], [860, 24], [-240, -50]]), dx = r.pick([2, 4]), Ex = -dV / (dx / 1000);
        return {
          prompt: t`A probe reads $${V1}$ V at point A and $${V1 + dV}$ V at point B, ${dx} mm further along $+x$. Estimate $E_x$ between them.`,
          answer: Ex, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: -Ex, feedback: t`Mind the sign: $E_x = -\Delta V/\Delta x$, and $\Delta V = V_B - V_A$.` }],
          hints: [t`$E_x \approx -\dfrac{\Delta V}{\Delta x}$, with $\Delta V = V_B - V_A$ and $\Delta x$ in metres.`],
          teach: 'Two nearby readings of V give the field between them: Eₓ ≈ −ΔV/Δx.',
          explain: t`$\Delta V = ${V1 + dV} - (${V1}) = ${dV}$ V over $\Delta x = ${dx / 1000}$ m, so $E_x \approx -\dfrac{${dV}}{${dx / 1000}} = ${tn(Ex)}$ V/m: the field points toward ${Ex > 0 ? '$+x$' : '$-x$'}, from the higher reading toward the lower. Computers find fields from a grid of potentials exactly this way.`,
          visual: field({ unit: 'mm', x: [-6, 6], y: [-3.75, 3.75], uniform: [r6(Ex), 0], ref: [-dx / 2, 0], equip: true, equipLabels: false, dV: Math.abs(dV), fieldLines: false, arrows: 'linear', gridN: 9, notes: { points: [{ x: -dx / 2, y: 0.8, label: `A: ${V1} V`, color: 'gold', ldx: -30, ldy: -10 }, { x: dx / 2, y: 0.8, label: `B: ${V1 + dV} V`, color: 'gold', ldx: -20, ldy: -10 }] } }, `The two probe positions, with the equipotentials through them and every ${Math.abs(dV)} V beyond (violet), and the field (arrows).`),
        };
      },
    }),
    mcq({
      id: 'flat-V', difficulty: 1,
      prompt: 'The graph shows the potential against distance from the centre of a charged metal sphere of radius 10 cm. What is the field inside the sphere?',
      choices: [
        'Zero: V is the same everywhere inside, so its slope — and the field — is zero',
        '1.2×10⁴ V/m, the value V/R, the same as just outside the surface',
        'It cannot be found without knowing where the charge sits inside',
        'Zero only at the very centre',
      ],
      answer: 0,
      why: {
        1: 'Just outside, E = V/R = 1.2×10⁴ V/m indeed. The field jumps from zero to that value across the surface charge.',
        2: 'The graph alone settles it: a flat V means zero field. (In equilibrium the charge sits on the surface anyway.)',
        3: 'The graph is flat all the way across the inside, not just at the centre.',
      },
      hints: ['The field is minus the slope of V.'],
      teach: 'Where V is constant, the field is zero — however large V is.',
      explain: 'Inside, V is flat at 1200 V, so E = −dV/dr = 0 everywhere inside. Outside, V = kQ/r falls, and the field is minus its slope: kQ/r², which at the surface is V/R = 1.2×10⁴ V/m. A high potential with no field: what matters is how V changes, not how large it is.',
      visual: { type: 'graph', params: { x: [0, 30], y: [0, 1400], aspect: 'wide', xlabel: 'distance from the centre r (cm)', ylabel: 'V (V)', curves: [{ fn: 'min(1200, 12000/max(x, 0.01))', domain: [0, 30], color: 'violet', width: 2.6 }], vlines: [{ x: 10, label: 'surface' }] }, caption: 'The potential of the charged sphere against distance from its centre.' },
    }),
    expr({
      id: 'disk', difficulty: 3,
      prompt: t`On the axis of a uniformly charged disk of radius $R$, the potential at distance $z$ from its centre is $V(z) = C\left(\sqrt{z^2 + R^2} - z\right)$, where $C = \sigma/2\varepsilon_0$. Find the field $E_z$ on the axis, for $z > 0$.`,
      answer: 'C*(1 - z/sqrt(z^2 + R^2))', answerTeX: t`C\left(1 - \frac{z}{\sqrt{z^2 + R^2}}\right)`, lhs: 'E_z',
      vars: { z: [0.2, 3], R: [0.5, 2], C: [0.5, 3] }, wrt: 'z',
      derivativeOf: '-C*(sqrt(z^2 + R^2) - z)',
      errors: [
        { answer: 'C*(z/sqrt(z^2 + R^2) - 1)', feedback: t`That is $dV/dz$. The field is minus it.` },
        { answer: 'C*(sqrt(z^2 + R^2) - z)', feedback: 'That is V itself. Differentiate it with respect to z.' },
      ],
      hints: [t`$\dfrac{d}{dz}\sqrt{z^2 + R^2} = \dfrac{z}{\sqrt{z^2 + R^2}}$.`, t`$E_z = -\dfrac{dV}{dz} = -C\left(\dfrac{z}{\sqrt{z^2 + R^2}} - 1\right)$.`],
      teach: 'Differentiating the disk’s axial potential gives its field: σ/2ε₀ times (1 − z/√(z² + R²)).',
      explain: t`$\dfrac{dV}{dz} = C\left(\dfrac{z}{\sqrt{z^2 + R^2}} - 1\right)$, so $E_z = C\left(1 - \dfrac{z}{\sqrt{z^2 + R^2}}\right)$. Two checks: close to a big disk ($z \ll R$) the bracket is 1 and $E_z = \sigma/2\varepsilon_0$, the field of a large sheet (lesson E3.3); far away ($z \gg R$) it becomes $CR^2/2z^2 = kQ/z^2$ with $Q = \sigma\pi R^2$, a point charge.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [0, 1.1], aspect: 'wide', xlabel: 'z / R', ylabel: 'V / CR',
          curves: [
            { fn: 'sqrt(x^2 + 1) - x', domain: [0, 4], color: 'violet', width: 2.6 },
            { fn: `${r6(Math.SQRT2 - 1)} + ${r6(1 / Math.SQRT2 - 1)}*(x - 1)`, domain: [0.45, 1.55], color: 'gold', width: 2.2 },
          ],
          points: [{ x: 1, y: r6(Math.SQRT2 - 1), color: 'gold', label: 'slope = −E/C', labelDx: 8, labelDy: -10 }],
        },
        caption: 'The disk’s potential along its axis (z in units of R, V in units of CR), with its tangent at z = R. The field is minus the slope: largest at the disk, fading away from it.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-grids', difficulty: 2, transfer: true,
      gen(r) {
        const [Vs, Va] = r.pick([[1100, -180], [1500, -200], [1800, -250]]), d = r.pick([0.6, 0.8, 1.0]), E = (Vs - Va) / (d / 1000);
        return {
          prompt: t`In a gridded ion thruster, the screen grid is held at $+${Vs}$ V and the accelerator grid, ${d} mm downstream, at $${Va}$ V. Treating the field between them as uniform, how strong is it?`,
          answer: E, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: Vs / (d / 1000), feedback: t`The potential difference is from $+${Vs}$ V down to $${Va}$ V: $${Vs - Va}$ V, not ${Vs} V.` }],
          hints: [t`In a uniform field, $E = |\Delta V|/d$.`, t`$\Delta V = ${Va} - ${Vs} = ${Va - Vs}$ V.`],
          teach: 'Between two grids the field is about the voltage between them divided by the gap, pointing toward the lower potential.',
          explain: t`$E = \dfrac{${Vs} - (${Va})}{${d / 1000}} = ${tn(E)}$ V/m, pointing downstream, from the screen grid toward the accelerator grid, so it pushes the positive ions out. In air this would spark; between the grids there is vacuum. The ions end up in the beam at about 0 V, so each leaves with about ${Vs} eV. The accelerator grid is held negative so that electrons in the beam cannot stream back into the thruster.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.6, 2.6], y: [Va - 150, Vs + 250], aspect: 'wide', xlabel: 'distance along the thruster’s axis (mm)', ylabel: 'V (V)',
              curves: [{ fn: `${Vs} - ${r6((Vs - Va) / d)}*min(max(x, 0), ${d}) - ${Va}*min(max((x - ${d})/1.2, 0), 1)`, domain: [-0.6, 2.6], color: 'violet', width: 2.6 }],
              vlines: [{ x: 0, label: 'screen grid' }, { x: d, label: 'accelerator grid' }],
              hlines: [{ y: 0 }],
            },
            caption: 'A simplified potential profile along the axis: flat in the thruster’s plasma, falling steeply between the grids, then rising to about 0 V in the beam. Real profiles are smoother: the field bulges through the grids’ holes.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-graph', difficulty: 2,
      prompt: 'Which description of the field fits the potential shown in the graph?',
      choices: [
        'Eₓ = +1.0×10⁴ V/m from 0 to 2 cm, zero from 2 to 4 cm, −1.0×10⁴ V/m from 4 to 8 cm',
        'Eₓ = −1.0×10⁴ V/m from 0 to 2 cm, zero from 2 to 4 cm, +1.0×10⁴ V/m from 4 to 8 cm',
        'Eₓ is zero at x = 0 and x = 6 cm, where V = 0, and largest where V is most negative',
        'Eₓ = +1.0×10⁴ V/m from 0 to 2 cm, then −1.0×10⁴ V/m from 2 to 8 cm',
      ],
      answer: 0,
      why: {
        1: 'Those are the slopes. The field is minus the slope: where V falls, Eₓ is positive.',
        2: 'The field follows the slope of V, not its value.',
        3: 'Between 2 and 4 cm, V is flat at −200 V. A constant V, whatever its value, means no field.',
      },
      hints: ['Read the slope of each straight piece in V/cm; the field is minus that.'],
      teach: 'Read a field off a graph of V piece by piece: Eₓ is minus the slope.',
      explain: 'From 0 to 2 cm V falls by 200 V: slope −100 V/cm = −1.0×10⁴ V/m, so Eₓ = +1.0×10⁴ V/m. From 2 to 4 cm V is flat: Eₓ = 0. From 4 to 8 cm V rises by 400 V: slope +1.0×10⁴ V/m, so Eₓ = −1.0×10⁴ V/m.',
      visual: { type: 'graph', params: { x: [0, 8], y: [-250, 250], aspect: 'wide', xlabel: 'x (cm)', ylabel: 'V (V)', curves: [{ fn: PW, domain: [0, 8], color: 'violet', width: 2.6 }] }, caption: 'The potential against position along the x axis.' },
    }),
    num({
      id: 'cp-atmosphere', difficulty: 3, transfer: true,
      gen(r) {
        const z = r.pick([0.5, 1, 3]), Ez = (ATM.Vinf / ATM.H) * Math.exp(-(z * 1000) / ATM.H), Vz = ATM.Vinf * (1 - Math.exp(-(z * 1000) / ATM.H));
        return {
          prompt: t`A simple model of the fair-weather atmosphere: the potential at height $z$ above the ground is $V(z) = V_\infty\left(1 - e^{-z/H}\right)$, where $V_\infty = 250$ kV is the potential of the upper atmosphere and $H = 2.0$ km. How strong is the field ${z} km up?`,
          answer: Ez, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: Vz / (z * 1000), feedback: t`That is the average field over the whole height, $V(z)/z$. You want the field at that height: the slope there, $dV/dz$.` }],
          hints: [t`$E_z = -\dfrac{dV}{dz}$.`, t`$\dfrac{dV}{dz} = \dfrac{V_\infty}{H}e^{-z/H}$.`],
          teach: 'The field at a point is minus the derivative of V there, not V divided by distance.',
          explain: t`$\dfrac{dV}{dz} = \dfrac{V_\infty}{H}e^{-z/H} = \dfrac{250\,000}{2000}e^{-${s3(z / 2, 2)}} = ${tn(Ez)}$ V/m, so $E_z = -${tn(Ez)}$ V/m: ${tn(Ez)} V/m, pointing down. At the ground the model gives 125 V/m, close to the measured fair-weather field; the field weakens with height because the air conducts better higher up. Real profiles vary with weather, pollution and latitude.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 8], y: [0, 270], aspect: 'wide', xlabel: 'height z (km)', ylabel: 'V (kV)',
              curves: [
                { fn: '250*(1 - exp(-x/2))', domain: [0, 8], color: 'violet', width: 2.6 },
                { fn: `${r6(250 * (1 - Math.exp(-z / 2)))} + ${r6(125 * Math.exp(-z / 2))}*(x - ${z})`, domain: [Math.max(0, z - 1), z + 1], color: 'gold', width: 2.2 },
              ],
              points: [{ x: z, y: r6(250 * (1 - Math.exp(-z / 2))), color: 'gold' }],
            },
            caption: 'The model’s potential against height, and its tangent at the height in the question. The slope — the field’s size — is greatest at the ground.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-sign', difficulty: 2,
      prompt: 'Along a line, V rises steadily from left to right: negative on the left, positive on the right. Which way does the field along the line point?',
      choices: [
        'To the left, toward lower V, all along the line',
        'To the right, toward higher V',
        'To the left where V is negative and to the right where V is positive',
        'Across the line: a field is always perpendicular to the direction in which V changes',
      ],
      answer: 0,
      why: {
        1: 'A positive charge is pushed toward lower potential energy: the field points down the slope of V, to the left.',
        2: 'Only the slope of V matters, not its sign. The slope is the same all along the line, and so is the field.',
        3: 'The field is perpendicular to the equipotentials — so it points along the direction in which V changes fastest, here along the line.',
      },
      hints: [t`$E_x = -dV/dx$. What is the sign of $dV/dx$?`],
      teach: 'The field points toward decreasing V, along the direction V changes fastest; the sign of V itself does not matter.',
      explain: 'The slope dV/dx is positive everywhere along the line, so Eₓ = −dV/dx is negative everywhere: the field points to the left, toward lower V, with the same size all along — on both sides of the point where V = 0.',
      visual: { type: 'graph', params: { x: [0, 6], y: [-150, 180], aspect: 'wide', xlabel: 'x (cm)', ylabel: 'V (V)', curves: [{ fn: '40*x - 100', domain: [0, 6], color: 'violet', width: 2.6 }], hlines: [{ y: 0 }] }, caption: 'The potential along the line.' },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §7.4 Determining Field from Potential', url: 'https://openstax.org/books/university-physics-volume-2/pages/7-4-determining-field-from-potential' },
  ],
});
