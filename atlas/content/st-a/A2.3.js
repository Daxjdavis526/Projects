// Tangent vectors as directional derivatives: a vector at a point is the
// operator V = V^μ ∂_μ that differentiates functions along itself; the
// coordinate basis vectors are the partial derivatives ∂_μ.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;

// a contour map of f with a point P and an arrow V at it (and optionally the straight curve P + λV)
function mapPic(f, P, V, { caption, x = [-3, 3], y = [-2.4, 2.4], levels = 11, curve = false, labels = false, extra = {} } = {}) {
  return {
    type: 'c3-contour',
    params: {
      f, x, y, levels, labels, fillAlpha: 0.22,
      points: [{ x: r6(P[0]), y: r6(P[1]), color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }],
      arrows: [{ from: P.map(r6), to: [r6(P[0] + V[0]), r6(P[1] + V[1])], color: 'gold', label: 'V' }],
      curves: curve ? [{ param: [`${r6(P[0])} + ${r6(V[0])}*t`, `${r6(P[1])} + ${r6(V[1])}*t`], t: [-4, 4], color: 'gold', width: 1.2, dash: true }] : [],
      ...extra,
    },
    caption,
  };
}

export default lesson({
  id: 'st-a.A2.3',
  title: 'Tangent vectors as directional derivatives',
  minutes: 11, difficulty: 3,
  intro: t`On a curved surface — or in curved spacetime — there is no room for arrows stretching from one point to another, and even on a flat plane in curved coordinates “the arrow $(1, 0)$” means something different at every point. So relativity defines a vector at a point by what it **does**: it differentiates functions along itself. A curve $x^\mu(\lambda)$ through the point carries any function $f$ along, and the chain rule gives the rate

$$V(f) = \frac{df}{d\lambda} = \frac{dx^\mu}{d\lambda}\,\frac{\partial f}{\partial x^\mu} = V^\mu\,\partial_\mu f$$

The vector **is** that operator, $V = V^\mu\,\partial_\mu$. The coordinate basis vectors are the partial derivatives $\partial_\mu = \partial/\partial x^\mu$ — “move along the $x^\mu$ coordinate line, the other coordinates fixed” — and a vector’s components are what it does to the coordinates themselves: $V(x^\nu) = V^\nu$.`,
  symbols: [
    { tex: 'V', text: 'a tangent vector at a point: the operator that takes any function to its rate of change along V' },
    { tex: 'f', text: 'any smooth function on the space — a temperature, a pressure, a potential, a coordinate' },
    { tex: t`x^\mu(\lambda)`, text: t`a curve through the point, labelled by a parameter $\lambda$ (a time, an arc length…)` },
    { tex: t`V^\mu = \dfrac{dx^\mu}{d\lambda}`, text: t`the components: how fast each coordinate changes along the curve` },
    { tex: t`\partial_\mu = \dfrac{\partial}{\partial x^\mu}`, text: t`the coordinate basis vectors, $\partial_x, \partial_y, \dots$: the lower index matches $\mathbf e_\mu$` },
    { tex: 'V(f)', text: t`a number at the point, in units of $f$ per unit of $\lambda$` },
  ],
  why: t`This is how vectors live on a manifold, which has no arrows and no straight lines of its own: four-velocities, Killing vectors and the coordinate basis $\partial_t, \partial_r, \partial_\theta, \partial_\phi$ of a black hole’s spacetime are all derivative operators.`,
  visual: {
    type: 'c3-contour',
    title: 'A vector differentiates along itself',
    lead: t`The map shows level curves of $f = xy + \tfrac12x^2$. The gold arrow is a vector $V = V^x\partial_x + V^y\partial_y$ at the point P, and the dashed line is a curve with that velocity. The readout is $V(f) = V^x\,\partial_xf + V^y\,\partial_yf$ at P — the rate at which $f$ changes as you leave P along $V$.`,
    tasks: [
      t`Turn $V$ until it runs along the level curve through P: $V(f) = 0$.`,
      t`Double both components: $V(f)$ doubles. Reverse them: it changes sign. The operator is linear in $V$.`,
      t`Point $V$ along $\partial_x$ ($V^y = 0$, $V^x = 1$): the readout is just $\partial f/\partial x$ at P.`,
    ],
    params: {
      f: 'x*y + 0.5*x^2', x: [-3, 3], y: [-2.4, 2.4], levels: 13, labels: true, fillAlpha: 0.22,
      sliders: [
        { key: 'px', label: 'P: $x$', min: -2, max: 2, step: 0.1, value: 1, explain: 'Where the vector lives.' },
        { key: 'py', label: 'P: $y$', min: -1.8, max: 1.8, step: 0.1, value: 0.5, explain: 'Each point has its own vectors.' },
        { key: 'vx', label: '$V^x$', min: -2, max: 2, step: 0.1, value: 1, explain: t`How fast $x$ changes along the curve: $dx/d\lambda$.` },
        { key: 'vy', label: '$V^y$', min: -2, max: 2, step: 0.1, value: 0.6, explain: t`How fast $y$ changes: $dy/d\lambda$.` },
      ],
      points: [{ x: 'px', y: 'py', color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }],
      arrows: [{ from: ['px', 'py'], to: ['px + vx', 'py + vy'], color: 'gold', label: 'V' }],
      curves: [{ param: ['px + vx*t', 'py + vy*t'], t: [-4, 4], color: 'gold', width: 1.2, dash: true }],
      readouts: [
        { label: t`$\partial_xf$ at P`, expr: 'py + px', digits: 3 },
        { label: t`$\partial_yf$ at P`, expr: 'px', digits: 3 },
        { label: t`$V(f) = V^x\partial_xf + V^y\partial_yf$`, expr: 'vx*(py + px) + vy*px', digits: 3 },
      ],
    },
    caption: t`Level curves of $f$, labelled with their values. The arrow is drawn with its components in units of $x$ and $y$ per unit $\lambda$; the dashed line is the straight curve $x^\mu(\lambda) = P^\mu + \lambda V^\mu$, whose velocity at P is $V$.`,
  },
  example: {
    prompt: t`A research aircraft flies along $x(t) = 2 + 3t$, $y(t) = 1 + t^2$ (km, with $t$ in minutes) through air whose temperature is $T(x, y) = 280 + 5x - 2xy$ kelvin. At $t = 1$ min, how fast is the temperature it measures changing?`,
    visual: mapPic('280 + 5*x - 2*x*y', [5, 2], [1.5, 1], { x: [1, 9], y: [-0.6, 4.4], levels: 10, labels: true, extra: { curves: [{ param: ['2 + 3*t', '1 + t^2'], t: [-0.2, 1.8], color: 'violet', width: 2 }] }, caption: t`Isotherms of $T$ (kelvin), the flight path (violet) and its velocity $V = (3, 2)$ km/min at $t = 1$, drawn at half length.` }),
    steps: [
      { label: 'The vector', text: t`At $t = 1$ the aircraft is at $(5, 2)$ km, and its velocity is $V^\mu = dx^\mu/dt = (3, 2t) = (3, 2)$ km/min. As an operator, $V = 3\,\partial_x + 2\,\partial_y$.` },
      { label: 'The partial derivatives', text: t`$\partial_xT = 5 - 2y = 1$ K/km and $\partial_yT = -2x = -10$ K/km at $(5, 2)$.` },
      { label: 'Apply the operator', text: t`$V(T) = V^x\partial_xT + V^y\partial_yT = 3(1) + 2(-10) = -17$ K/min.` },
      { label: 'Check by brute force', text: t`Along the path $T(t) = 280 + 5(2 + 3t) - 2(2 + 3t)(1 + t^2)$, so $\dfrac{dT}{dt} = 15 - 2\left[3(1 + t^2) + (2 + 3t)(2t)\right] = 15 - 2[6 + 10] = -17$ K/min at $t = 1$. ✓ The operator did the chain rule for us.` },
    ],
    answer: t`$V(T) = -17$ K/min: the thermometer reading is falling at 17 K per minute.`,
  },
  practice: [
    num({
      id: 'apply', difficulty: 1,
      gen(r) {
        const [fs, ftex, fx, fy] = r.pick([
          ['x^2*y', t`x^2y`, (x, y) => 2 * x * y, (x, y) => x * x],
          ['x*y + y^2', t`xy + y^2`, (x, y) => y, (x, y) => x + 2 * y],
          ['3*x - x*y^2', t`3x - xy^2`, (x, y) => 3 - y * y, (x, y) => -2 * x * y],
        ]);
        let P, V, val;
        for (let k = 0; k < 30; k++) { P = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])]; V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])]; val = V[0] * fx(...P) + V[1] * fy(...P); if (val !== 0) break; }
        return {
          prompt: t`At the point $(x, y) = (${P.join(', ')})$, apply the vector $V = ${V[0]}\,\partial_x ${V[1] < 0 ? '-' : '+'} ${Math.abs(V[1])}\,\partial_y$ to $f = ${ftex}$. What is $V(f)$?`,
          visual: mapPic(fs, P, V.map((v) => v * 0.4), { caption: t`Level curves of $f = ${ftex}$, the point and the vector (drawn at 0.4 of its length).` }),
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: fx(...P) + fy(...P), feedback: t`That is $\partial_xf + \partial_yf$: weight each partial derivative by the matching component of $V$.` }].filter((e) => e.value !== val),
          hints: [t`$V(f) = V^x\,\partial_xf + V^y\,\partial_yf$.`, t`At the point, $\partial_xf = ${fx(...P)}$ and $\partial_yf = ${fy(...P)}$.`],
          teach: 'A vector acts on a function by taking the components-weighted sum of its partial derivatives.',
          explain: t`$V(f) = (${V[0]})(${fx(...P)}) + (${V[1]})(${fy(...P)}) = ${val}$.`,
        };
      },
    }),
    mcq({
      id: 'what-is-dx', difficulty: 1,
      prompt: t`In ordinary Cartesian coordinates on a plane, what is the basis vector $\partial_x$?`,
      visual: { type: 'graph', params: { x: [-0.5, 4.5], y: [-0.5, 3], equal: true, aspect: 'wide', xticks: 6, yticks: 4, arrows: [{ from: [1.5, 1], to: [2.5, 1], color: 'gold', label: '∂ₓ' }, { from: [1.5, 1], to: [1.5, 2], color: 'violet', label: '∂ᵧ' }], points: [{ x: 1.5, y: 1, color: 'ink', label: 'P', labelDx: -14, labelDy: 12 }], curves: [{ fn: '1', color: 'ink3', width: 1, dash: true }, { param: ['1.5', 't'], t: [-0.5, 3], color: 'ink3', width: 1, dash: true }] }, caption: t`The two coordinate lines through P (dashed) and the basis vectors along them.` },
      choices: [
        t`The derivative along the $x$ coordinate line with $y$ held fixed — the arrow of one unit step in $x$`,
        t`The number $\partial f/\partial x$ for some function $f$`,
        t`The gradient of the function $x$`,
        t`The whole $x$-axis`,
      ],
      answer: 0,
      why: {
        1: t`$\partial_x f$ is what the vector *gives* when applied to $f$; $\partial_x$ itself is the operator, waiting for a function.`,
        2: t`The gradient of $x$ is the covector $dx$ (lesson A3.2): related, but a different kind of object.`,
        3: 'A vector lives at one point; the axis is a whole line of points.',
      },
      hints: [t`What does $\partial_x$ do to a function $f$, and in which direction does it look?`],
      teach: t`The coordinate basis vector $\partial_\mu$ differentiates along its coordinate line with the other coordinates held fixed.`,
      explain: t`$\partial_x$ takes any $f$ to its rate of change along the $x$ line through P, $y$ fixed. In Cartesian coordinates that is the familiar unit arrow along $x$; in other coordinates the same definition gives arrows that vary from point to point (lesson A4.3).`,
    }),
    num({
      id: 'circle', difficulty: 2,
      gen(r) {
        const lam = r.pick([20, 30, 50, 70, 110]);
        const c = Math.cos(lam * DEG), s = Math.sin(lam * DEG);
        const ans = c * c - s * s;            // V(xy) with V = (−sin λ, cos λ) at (cos λ, sin λ)
        return {
          prompt: t`A point moves around the unit circle, $x = \cos\lambda$, $y = \sin\lambda$. At $\lambda = ${lam}^\circ$, its velocity is the vector $V = \dfrac{dx}{d\lambda}\partial_x + \dfrac{dy}{d\lambda}\partial_y$ (per radian). Apply it to $f = xy$.`,
          visual: mapPic('x*y', [c, s], [-s, c], { x: [-1.8, 1.8], y: [-1.4, 1.4], extra: { curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'violet', width: 1.6 }] }, caption: t`Level curves of $xy$, the unit circle (violet), the point at $\lambda = ${lam}^\circ$ and its velocity.` }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: 2 * s * c, feedback: t`That is $f$ itself times 2. Apply the operator: $V^x\partial_x(xy) + V^y\partial_y(xy) = V^xy + V^yx$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$V^\mu = (dx/d\lambda, dy/d\lambda) = (-\sin\lambda, \cos\lambda)$.`, t`$V(xy) = V^x\,y + V^y\,x = -\sin^2\lambda + \cos^2\lambda$.`],
          teach: 'The velocity of a curve is a vector, and applying it to f gives df/dλ along the curve.',
          explain: t`$V(xy) = (-\sin\lambda)(\sin\lambda) + (\cos\lambda)(\cos\lambda) = \cos 2\lambda = ${nice(ans, 4)}$ per radian — the same as $\tfrac{d}{d\lambda}(\cos\lambda\sin\lambda) = \tfrac{d}{d\lambda}\tfrac12\sin2\lambda$. ✓`,
        };
      },
    }),
    num({
      id: 'coordinate-fn', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-4, 4, [0]), b = r.intExcept(-4, 4, [0]), p = r.intExcept(-3, 3, [0]), q = r.intExcept(-3, 3, [0, p]);
        const B = p * a + q * b === 0 ? b + (b === -1 ? 2 : 1) : b;   // shifting b moves the answer off 0, since q ≠ 0
        const val = p * a + q * B;
        return {
          prompt: t`A vector has components $V^x = ${a}$, $V^y = ${B}$. What is $V(${p}x ${q < 0 ? '-' : '+'} ${Math.abs(q)}y)$ — the vector applied to the function $${p}x ${q < 0 ? '-' : '+'} ${Math.abs(q)}y$?`,
          visual: mapPic(`${p}*x + (${q})*y`, [0.4, 0.2], [a * 0.3, B * 0.3], { caption: t`The straight level lines of $${p}x ${q < 0 ? '-' : '+'} ${Math.abs(q)}y$ and the vector (drawn at 0.3 of its length).` }),
          answer: val, tol: { rel: 0, abs: 0.01 },
          hints: [t`$V(x) = V^x$ and $V(y) = V^y$: the components are what $V$ does to the coordinates.`, t`The operator is linear: $V(${p}x + ${q}y) = ${p}\,V(x) + ${q}\,V(y)$.`],
          teach: t`$V(x^\nu) = V^\nu$: the components of a vector are what it does to the coordinate functions.`,
          explain: t`$V(${p}x + ${q}y) = ${p}V^x + ${q < 0 ? `(${q})` : q}V^y = ${p}(${a}) + ${q < 0 ? `(${q})` : q}(${B}) = ${val}$.`,
        };
      },
    }),
    mcq({
      id: 'why-operators', difficulty: 2,
      prompt: 'Why does general relativity define a vector at a point as a derivative operator rather than as an arrow?',
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'sphere', controls: false, readout: false }, caption: 'Coordinate basis vectors at a point of a sphere. They lie in the tangent plane there; no arrow drawn on the curved surface itself could reach from that point to another.' },
      choices: [
        'On a curved space there are no arrows reaching from one point to another, but derivatives along curves need only the neighbourhood of the point',
        'Operators are easier to draw than arrows',
        'Arrows can only exist in two dimensions',
        'Derivatives are more accurate than arrows',
      ],
      answer: 0,
      why: {
        1: 'They are harder to draw, if anything. The reason is that they make sense without any surrounding flat space.',
        2: 'Arrows work fine in three-dimensional flat space; the problem is curvature, not dimension.',
        3: 'Accuracy is not the issue: the arrow picture is exact in flat space. It just does not exist on a curved one.',
      },
      hints: ['Think of a sphere seen only from inside it: where would an arrow from one point to another lie?'],
      teach: 'Directional derivatives need nothing but a point and the curves through it, so they define vectors on any curved space.',
      explain: 'A curved spacetime is not embedded in anything: there is no space for arrows to stretch through. But a curve through a point, and the rate of change of functions along it, make sense anywhere — so the vector is defined as that rate-taking operator.',
    }),
    multi({
      id: 'properties', difficulty: 3,
      prompt: t`Which of these hold for every vector $V$ at a point, all functions $f$, $g$ and constants $a$, $b$? Select every one.`,
      visual: mapPic('x*y + 0.5*x^2', [1, 0.5], [1, 0.6], { curve: true, caption: t`A vector at P and a curve through P with that velocity: $V(f)$ is the rate of change of $f$ along it.` }),
      choices: [
        t`$V(af + bg) = a\,V(f) + b\,V(g)$`,
        t`$V(fg) = f\,V(g) + g\,V(f)$, with $f$, $g$ evaluated at the point`,
        t`$V(c) = 0$ for a constant function $c$`,
        t`$V(f^2) = \big(V(f)\big)^2$`,
        t`$V(f)$ depends on the values of $f$ far from the point`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`By the product rule, $V(f^2) = 2f\,V(f)$.`,
        4: 'V(f) is a derivative at the point: it depends only on f near the point (in fact only on its first derivatives there).',
      },
      hints: ['V(f) is df/dλ along a curve: use what you know about derivatives.', 'Linearity and the product rule are properties of every derivative.'],
      teach: 'Tangent vectors are exactly the operators that are linear and obey the product rule at the point.',
      explain: t`Being $d/d\lambda$ along a curve, $V$ is linear, obeys the Leibniz rule, kills constants and only sees the point’s neighbourhood. Mathematicians turn this around and define tangent vectors as such operators (“derivations”).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-apply', difficulty: 2,
      gen(r) {
        const P = [r.pick([1, 2]), r.pick([-1, 1, 2])], V = [r.pick([2, -1, 3]), r.pick([1, -2])];
        const fx = 2 * P[0] + P[1], fy = P[0] - 3 * P[1] * P[1];
        let val = V[0] * fx + V[1] * fy;
        if (val === 0) V[0] += 1;
        val = V[0] * fx + V[1] * fy;
        return {
          prompt: t`Apply $V = ${V[0]}\,\partial_x ${V[1] < 0 ? '-' : '+'} ${Math.abs(V[1])}\,\partial_y$ to $f = x^2 + xy - y^3$ at $(x, y) = (${P.join(', ')})$.`,
          visual: mapPic('x^2 + x*y - y^3', P, V.map((v) => v * 0.3), { x: [-3, 4], y: [-2.6, 2.8], caption: t`Level curves of $f$, the point and the vector (drawn at 0.3 of its length).` }),
          answer: val, tol: { rel: 0, abs: 0.01 },
          hints: [t`$\partial_xf = 2x + y$, $\partial_yf = x - 3y^2$.`],
          teach: t`A vector acts on a function as $V(f) = V^\mu\,\partial_\mu f$.`,
          explain: t`$\partial_xf = ${fx}$, $\partial_yf = ${fy}$, so $V(f) = (${V[0]})(${fx}) + (${V[1]})(${fy}) = ${val}$.`,
        };
      },
    }),
    num({
      id: 'cp-descent', difficulty: 3, transfer: true,
      gen(r) {
        const z = r.pick([2000, 3000, 4500]), w = r.pick([5, 8, 12]), u = r.pick([180, 230]), g = r.pick([0.001, 0.002]);
        const p0 = 101325, H = 8400;
        const pz = -(p0 * Math.exp(-z / H)) / H;          // ∂p/∂z, Pa/m
        const px = -g;                                    // ∂p/∂x, Pa/m: pressure falling ahead
        const rate = u * px + -w * pz;                    // V = (u, −w)
        return {
          prompt: t`An airliner descends at $${w}$ m/s while flying at $${u}$ m/s through air whose pressure is $p(x, z) = p_0\,e^{-z/H} - ${g}\,x$ pascals, with $p_0 = 101\,325$ Pa, scale height $H = 8400$ m, $z$ the altitude and $x$ the distance flown (so the pressure falls by ${g * 1000} Pa per kilometre ahead). At $z = ${z}$ m, how fast does the pressure outside rise, in Pa/s? Use $V(p) = V^x\partial_xp + V^z\partial_zp$ with $V = (${u}, -${w})$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [-20, 30], y: [z / 1000 - 1.8, z / 1000 + 1.8], aspect: 'wide', xlabel: 'x (km)', ylabel: 'altitude z (km)',
              curves: [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ fn: `-8.4*ln((${Math.round(p0 * Math.exp(-z / H) + 4000 * k)} + ${g * 1000}*x)/101325)`, color: 'accent2', width: 1.2 })),
              arrows: [{ from: [0, z / 1000], to: [12, r6(z / 1000 - (12 * w) / u)], color: 'gold', label: 'V' }],
              points: [{ x: 0, y: z / 1000, color: 'ink', label: 'aircraft', labelDx: -10, labelDy: 14, labelAlign: 'right' }],
            },
            caption: t`Isobars every 4 kPa (blue) and the flight direction (gold). The axes are not equally scaled: the window is 50 km wide but 3.6 km tall, and the isobars’ tilt from the horizontal gradient is far too small to see.`,
          },
          answer: rate, units: 'Pa/s', tol: { rel: 0.01 },
          errors: [{ value: -w * pz, feedback: t`You dropped the horizontal term $V^x\partial_xp$: flying into lower pressure ahead matters too.` }, { value: u * px + w * pz, feedback: t`The aircraft descends, so $V^z = -${w}$ m/s: mind the sign.` }].filter((e) => Math.abs(e.value - rate) > 0.02 * Math.abs(rate)),
          hints: [t`$\partial_zp = -\dfrac{p_0}{H}e^{-z/H}$ and $\partial_xp = -${g}$ Pa/m.`, t`At $z = ${z}$ m, $\partial_zp = ${nice(pz, 4)}$ Pa/m.`],
          teach: t`An instrument carried along a path reads the velocity’s action on the field, $V(p) = V^\mu\partial_\mu p$.`,
          explain: t`$V(p) = (${u})(${-g}) + (-${w})(${nice(pz, 4)}) = ${nice(u * px, 3)} + ${nice(-w * pz, 4)} = ${nice(rate, 4)}$ Pa/s — about ${nice(rate / 100, 2)} hPa every second, which the cabin-pressure controller has to follow. The horizontal term is only $${nice(u * px, 2)}$ Pa/s: a realistic weather-map gradient is tiny beside the vertical one. (A pure exponential atmosphere is a model; the real pressure profile differs by a few per cent.)`,
        };
      },
    }),
    mcq({
      id: 'cp-components', difficulty: 2,
      prompt: t`For a vector $V = V^\mu\,\partial_\mu$, what is $V(x^\nu)$ — the vector applied to the coordinate function $x^\nu$?`,
      visual: mapPic('y', [0.5, 0.3], [1.2, 0.8], { caption: t`Level lines of the coordinate function $y$: $V(y)$ counts how fast $y$ grows along $V$ — its $y$-component.` }),
      choices: [t`$V^\nu$, the $\nu$th component`, t`$x^\nu$, the coordinate itself`, '1', t`$\delta^\nu_\mu$`],
      answer: 0,
      why: {
        1: 'V differentiates its argument; it does not return it.',
        2: t`$\partial_\nu x^\nu = 1$ for the basis vector alone; a general $V$ weights it by $V^\nu$.`,
        3: t`$\partial_\mu x^\nu = \delta^\nu_\mu$ is the step before contracting with $V^\mu$.`,
      },
      hints: [t`$V(x^\nu) = V^\mu\,\partial_\mu x^\nu$, and $\partial_\mu x^\nu = \delta^\nu_\mu$.`],
      teach: t`The components of a vector are its action on the coordinates: $V^\nu = V(x^\nu)$.`,
      explain: t`$V(x^\nu) = V^\mu\partial_\mu x^\nu = V^\mu\delta^\nu_\mu = V^\nu$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (tangent vectors as directional derivatives)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §6.1–6.2', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
