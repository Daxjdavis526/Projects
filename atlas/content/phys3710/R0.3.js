// Metrics on curved surfaces: ds² = dρ² + f(ρ)² dφ² for a surface that is
// round about a point — plane (f = ρ), sphere (f = R sin(ρ/R)) and saddle
// (the hyperbolic plane, f = a sinh(ρ/a)) — read from inside: circumference,
// area, Gaussian curvature K = −f″/f, triangle angle sums. Builds on
// gr.S08.i/d (the sphere's metric, its short circles on Earth and Ganymede)
// without reusing those examples; the saddle is new here.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6 } from './_geom.js';

const t = String.raw;
const DEG = 180 / Math.PI;

/** Circumference against radius (both in units of the curvature radius) for the three geometries. */
function circles({ mark = null, sliders = null, points = [], readouts = null, vlines = [], caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0, 3.3], y: [0, 26], aspect: 'wide', axesAt: 'edge', xlabel: 'radius ρ (in units of R or a)', ylabel: 'circumference C',
      curves: [
        { fn: '2*pi*sinh(x)', domain: [0, 2.15], color: 'teal', width: 2.6, label: 'saddle: 2πa sinh(ρ/a)', labelAt: 1.95, labelDx: -10, labelDy: -6, labelAlign: 'right' },
        { fn: '2*pi*x', color: 'ink2', width: 2, dash: true, label: 'plane: 2πρ', labelAt: 2.9, labelDx: -6, labelDy: -12, labelAlign: 'right' },
        { fn: '2*pi*sin(x)', domain: [0, 'pi'], color: 'gold', width: 2.6, label: 'sphere: 2πR sin(ρ/R)', labelAt: 2.35, labelDx: 8, labelDy: -4 },
      ],
      vlines: [{ x: 'pi', label: 'south pole', color: 'ink3' }, ...vlines],
      points: [...points, ...(mark ? [mark] : [])],
      ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? t`The length of a circle drawn at distance $\rho$ from a centre, measured along each surface. Lengths are in units of the curvature radius ($R$ for the sphere, $a$ for the saddle).`,
  };
}

/** A saddle surface z = (x² − y²)/2 drawn in polar form, so its rim is round. */
const saddle = (caption) => ({
  type: 'surface3d',
  params: { surface: ['u*cos(v)', 'u*sin(v)', '0.5*u^2*cos(2*v)'], domain: [[0, 1.5], [0, 2 * Math.PI]], n: 36, aspect: 'wide', dist: 7.5, pitch: 0.45 },
  caption: caption ?? t`A saddle, $z = (x^2 - y^2)/2$: it curves up in one direction and down in the other. Its Gaussian curvature is $-1$ at the centre and weakens outward. No smooth surface in ordinary space has the same negative curvature everywhere (Hilbert’s theorem), so the exact “saddle geometry” of this lesson can only be drawn in pieces. Drag to turn it.`,
});

export default lesson({
  id: 'phys3710.R0.3',
  title: 'Metrics on curved surfaces',
  minutes: 12, difficulty: 3,
  intro: t`An ant living *in* a surface cannot see it bend. All it can do is measure, and the **metric** is its rule for measuring. On a surface that looks the same in every direction around a point, label each place by its distance $\rho$ from that point (measured along the surface) and its direction $\phi$. Every such metric has one form:

$$ds^2 = d\rho^2 + f(\rho)^2\,d\phi^2$$

The function $f$ is the whole geometry: a circle of radius $\rho$ has circumference $2\pi f(\rho)$. On a plane $f = \rho$; on a sphere $f = R\sin(\rho/R)$, so circles fall short; on a **saddle** $f = a\sinh(\rho/a)$, so circles grow *faster* than $2\pi\rho$. You met the sphere’s metric and its short circles in [The metric: a rule for measuring distances and times](#/lesson/gr.S08.i). Here the saddle joins it, and the Gaussian curvature $K = -f''/f$ falls out of the metric alone — the same move general relativity makes with spacetime.`,
  symbols: [
    { tex: 'ds', text: 'the true length of a small step, as a tape measure laid on the surface reads it, in km' },
    { tex: '\\rho', text: 'distance from the centre point, measured along the surface (a “radius” the ant can pace out), in km' },
    { tex: '\\phi', text: 'the direction from the centre, an angle from 0 to 2π (radians)' },
    { tex: 'f(\\rho)', text: t`the circumference radius: a circle at distance $\rho$ has length $2\pi f(\rho)$. On a plane $f = \rho$` },
    { tex: 'R,\\ a', text: t`the curvature radius of the sphere and of the saddle, in km: the distance over which the geometry departs strongly from flat` },
    { tex: 'K', text: t`the Gaussian curvature, $-f''/f$, in $\text{km}^{-2}$: $+1/R^2$ on a sphere, $0$ on a plane, $-1/a^2$ on the saddle` },
  ],
  why: 'Curved spacetime is read the same way: Schwarzschild’s metric defines r by the circumferences of circles, and a closed or open universe is a sphere or a saddle in three dimensions.',
  visual: {
    title: 'Three ways a circle can grow',
    lead: t`Slide the radius of a circle and compare its length on the three surfaces. Near the centre all three agree — every smooth surface is flat up close. Farther out the sphere’s circles fall behind, reach a largest one at the equator, then shrink to the south pole; the saddle’s circles race ahead.`,
    tasks: [
      'At ρ = 0.3 the three circumferences differ by under 2%: small regions look flat.',
      'Set ρ = π/2 ≈ 1.57: the sphere’s circle is its equator, 2πR — the longest it can draw.',
      'Push ρ to 2: the saddle’s circle is 1.8 times longer than flat geometry allows.',
    ],
    ...circles({
      sliders: [{ key: 'rho', label: t`Circle radius $\rho$, in units of $R$ (or $a$)`, min: 0.02, max: 3.1, step: 0.01, value: 1, explain: t`Measured along the surface from the centre, as the ant would pace it.` }],
      vlines: [{ x: 'rho', color: 'accent', label: 'ρ' }],
      points: [
        { x: 'rho', y: '2*pi*sin(rho)', color: 'gold' }, { x: 'rho', y: '2*pi*rho', color: 'ink2' },
        { x: 'rho', y: '2*pi*sinh(rho)', color: 'teal', when: 'step(2.15 - rho)' },
      ],
      readouts: [
        { label: t`sphere $C/2\pi\rho = \sin\rho/\rho$`, expr: 'sin(rho)/rho', digits: 4 },
        { label: t`saddle $C/2\pi\rho = \sinh\rho/\rho$`, expr: 'sinh(rho)/rho', digits: 4 },
        { label: t`sphere area $/\pi\rho^2$`, expr: '2*(1 - cos(rho))/rho^2', digits: 4 },
        { label: t`saddle area $/\pi\rho^2$`, expr: '2*(cosh(rho) - 1)/rho^2', digits: 4 },
      ],
      caption: t`Circumference against radius, both in units of the curvature radius. The sphere’s curve ends at the south pole, $\rho = \pi R$, where the circle shrinks to a point; the saddle’s is cut off at $\rho = 2.15a$ to fit.`,
    }),
  },
  example: {
    prompt: t`A two-dimensional world has the saddle metric $ds^2 = d\rho^2 + a^2\sinh^2(\rho/a)\,d\phi^2$ with $a = 500$ km. Surveyors mark a circle of radius $\rho = 300$ km. Find its circumference and the area inside it, compare both with a flat plane and a sphere of radius 500 km, and find the curvature $K$ and the angle sum of a triangle enclosing $10{,}000\ \text{km}^2$.`,
    visual: saddle(),
    steps: [
      { label: 'Read off the circle', text: t`Along the circle $\rho$ is fixed, so $d\rho = 0$ and $ds = f\,d\phi$. Going once round: $C = 2\pi f(\rho) = 2\pi\times500\sinh(0.6)\ \text{km} = ${nice(2 * Math.PI * 500 * Math.sinh(0.6), 5)}$ km. A plane gives $2\pi\times300 = ${nice(2 * Math.PI * 300, 5)}$ km; a sphere of radius 500 km gives $2\pi\times500\sin(0.6) = ${nice(2 * Math.PI * 500 * Math.sin(0.6), 5)}$ km.` },
      { label: 'The area', text: t`A thin ring of width $d\rho$ has area $2\pi f(\rho)\,d\rho$ (circumference times width — the metric makes the two directions perpendicular). So $A = \int_0^{\rho}2\pi a\sinh(\rho'/a)\,d\rho' = 2\pi a^2\left[\cosh(\rho/a) - 1\right] = ${nice(2 * Math.PI * 250000 * (Math.cosh(0.6) - 1), 5)}\ \text{km}^2$, against $\pi\rho^2 = ${nice(Math.PI * 90000, 5)}\ \text{km}^2$ flat and $2\pi R^2(1 - \cos 0.6) = ${nice(2 * Math.PI * 250000 * (1 - Math.cos(0.6)), 5)}\ \text{km}^2$ on the sphere.` },
      { label: 'The curvature', text: t`Gauss showed that for this form of metric $K = -f''/f$. With $f = a\sinh(\rho/a)$, $f'' = \sinh(\rho/a)/a$, so $K = -1/a^2 = -4\times10^{-6}\ \text{km}^{-2}$ — the same at every point. (For the sphere $f'' = -f/R^2$ gives $K = +1/R^2$; for the plane $f'' = 0$.)` },
      { label: 'Triangles', text: t`The Gauss–Bonnet theorem says the angles of a triangle made of straightest lines (geodesics) add up to $\pi + \int K\,dA$. Here that is $\pi - A/a^2 = \pi - 10^4/(2.5\times10^{5}) = \pi - 0.04$ rad: $180° - ${fmt(1e4 / 250000 * DEG, 3)}° = ${fmt(180 - 1e4 / 250000 * DEG, 4)}°$.` },
      { label: 'Sense check', text: t`All the differences shrink as $\rho/a \to 0$: for small circles $C \approx 2\pi\rho\,(1 - K\rho^2/6)$, so a negative $K$ lengthens circles and a positive one shortens them. Nothing here needed a third dimension — the ant computed $K$ from measurements made in its own world.` },
    ],
    answer: t`$C = ${nice(2 * Math.PI * 500 * Math.sinh(0.6), 4)}$ km (flat ${nice(2 * Math.PI * 300, 4)}, sphere ${nice(2 * Math.PI * 500 * Math.sin(0.6), 4)}); $A = ${nice(2 * Math.PI * 250000 * (Math.cosh(0.6) - 1), 4)}\ \text{km}^2$; $K = -4\times10^{-6}\ \text{km}^{-2}$; the triangle’s angles add to $${fmt(180 - 1e4 / 250000 * DEG, 4)}°$.`,
  },
  practice: [
    num({
      id: 'sphere-circle', difficulty: 2,
      gen(r) {
        const [name, R, rho] = r.pick([['Mercury', 2439.7, 1200], ['the Moon', 1737.4, 1000], ['Ceres', 469.7, 400]]);
        const ans = 2 * Math.PI * R * Math.sin(rho / R);
        return {
          prompt: t`Treat ${name} as a perfect sphere of radius $R = ${R}$ km, with metric $ds^2 = d\rho^2 + R^2\sin^2(\rho/R)\,d\phi^2$. A rover drives round a circle ${rho} km from its landing site, measured along the ground. How long is the circle?`,
          visual: circles({ caption: t`Circumference against radius (in units of the curvature radius) on a sphere, a plane and a saddle. A large circle on a small world is far from flat.` }),
          answer: ans, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: 2 * Math.PI * rho, feedback: t`That is the flat-plane answer $2\pi\rho$. On a sphere the circle is $2\pi R\sin(\rho/R)$ — shorter.` }, { value: 2 * Math.PI * R * Math.sin((rho / R) * (Math.PI / 180)), feedback: t`$\rho/R$ is an angle in radians, not degrees.` }],
          hints: [t`Along the circle $d\rho = 0$, so $C = 2\pi f(\rho) = 2\pi R\sin(\rho/R)$.`, t`$\rho/R = ${fmt(rho / R, 4)}$ rad.`],
          teach: 'The circumference of a circle of radius ρ is 2π f(ρ), read straight from the dφ² term of the metric.',
          explain: t`$C = 2\pi\times${R}\times\sin(${fmt(rho / R, 4)}) = ${nice(ans, 4)}$ km, short of the flat $2\pi\times${rho} = ${nice(2 * Math.PI * rho, 4)}$ km by ${nice(100 * (1 - ans / (2 * Math.PI * rho)), 2)}%.`,
        };
      },
    }),
    expr({
      id: 'K-saddle', difficulty: 2,
      prompt: t`For a metric $ds^2 = d\rho^2 + f(\rho)^2\,d\phi^2$, Gauss’s formula gives the curvature $K = -f''(\rho)/f(\rho)$. Find $K$ for the saddle, $f = a\sinh(\rho/a)$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 2.6], y: [0, 6], aspect: 'wide', xlabel: 'ρ / a', ylabel: 'f / a',
          curves: [{ fn: 'sinh(x)', color: 'teal', label: 'f = a sinh(ρ/a)', labelAt: 2.1, labelDx: -10, labelAlign: 'right' }, { fn: 'x', color: 'ink2', dash: true, label: 'f = ρ (flat)', labelAt: 2.4, labelDy: 14 }],
        },
        caption: t`The saddle’s $f$ bends upward ($f'' > 0$) where the plane’s is straight. The sign of $f''$ is the sign of $-K$.`,
      },
      answer: '-1/a^2', answerTeX: t`-\frac{1}{a^2}`, lhs: 'K', vars: { a: [0.5, 5] },
      errors: [{ answer: '1/a^2', feedback: t`$f'' = +\sinh(\rho/a)/a$, so $-f''/f$ is negative. Positive $K$ belongs to the sphere.` }, { answer: '-1/a', feedback: t`Differentiate twice: each derivative of $\sinh(\rho/a)$ brings down a factor $1/a$.` }],
      hints: [t`$f' = \cosh(\rho/a)$ and $f'' = \sinh(\rho/a)/a$.`, t`$-f''/f = -\dfrac{\sinh(\rho/a)/a}{a\sinh(\rho/a)}$.`],
      teach: 'The curvature comes from the metric alone: K = −f″/f, here −1/a² at every point.',
      explain: t`$K = -\dfrac{\sinh(\rho/a)/a}{a\sinh(\rho/a)} = -\dfrac{1}{a^2}$, the same everywhere: the saddle geometry is as uniform as the sphere’s, with the opposite sign.`,
    }),
    num({
      id: 'saddle-area', difficulty: 3,
      gen(r) {
        const [a, rho] = r.pick([[200, 300], [1000, 1500], [50, 100], [400, 200]]);
        const ans = 2 * Math.PI * a * a * (Math.cosh(rho / a) - 1);
        return {
          prompt: t`On a saddle world with $ds^2 = d\rho^2 + a^2\sinh^2(\rho/a)\,d\phi^2$ and $a = ${a}$ km, what area lies within $\rho = ${rho}$ km of a point? (Add up rings of area $2\pi f\,d\rho$.)`,
          visual: saddle(),
          answer: ans, units: 'km^2', tol: { rel: 0.003 },
          errors: [{ value: Math.PI * rho * rho, feedback: t`That is the flat $\pi\rho^2$. Integrate $2\pi a\sinh(\rho/a)$, not $2\pi\rho$.` }, { value: 2 * Math.PI * a * a * Math.cosh(rho / a), feedback: t`Evaluate between the limits: at $\rho = 0$ the antiderivative is $2\pi a^2\cosh 0 = 2\pi a^2$, which must be subtracted.` }],
          hints: [t`$A = \int_0^{\rho}2\pi a\sinh(\rho'/a)\,d\rho'$.`, t`The antiderivative of $a\sinh(\rho'/a)$ is $a^2\cosh(\rho'/a)$, so $A = 2\pi a^2[\cosh(\rho/a) - 1]$.`],
          teach: 'Area comes from the metric too: rings of circumference 2πf(ρ) and width dρ, added up.',
          explain: t`$A = 2\pi\times${a}^2\left[\cosh(${fmt(rho / a, 3)}) - 1\right] = ${nice(ans, 4)}\ \text{km}^2$, against $\pi\rho^2 = ${nice(Math.PI * rho * rho, 4)}\ \text{km}^2$ flat: ${nice(ans / (Math.PI * rho * rho), 3)} times as much room.`,
        };
      },
    }),
    num({
      id: 'angle-sum', difficulty: 2,
      gen(r) {
        const [name, R, A] = r.pick([['the Moon', 1737.4, 1.0e6], ['Mercury', 2439.7, 2.0e6], ['Mars', 3389.5, 5.0e6]]);
        const ans = 180 + (A / (R * R)) * DEG;
        return {
          prompt: t`Three survey stations on ${name} (a sphere of radius $R = ${R}$ km) are joined by great-circle paths — the straightest lines the surface allows. The triangle encloses $${fmt(A / 1e6, 2)}\times10^{6}\ \text{km}^2$. What is the sum of its three angles? (Gauss–Bonnet: $\pi + KA$ with $K = 1/R^2$.)`,
          visual: { type: 'gr-surface', params: { mode: 'loop', surface: 'sphere', surfaces: false, size: 0.45, readout: false, controls: false }, caption: t`A small loop on a sphere: carried around it, an arrow comes back turned by the curvature inside, $\int K\,dA$ — the same angle by which a geodesic triangle’s angles exceed $180°$.` },
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: 180, feedback: 'That is the flat-plane sum. On a sphere the angles add up to more than 180°.' }, { value: 180 + A / (R * R), feedback: t`$A/R^2$ is in radians: multiply by $180°/\pi$ before adding it to 180°.` }],
          hints: [t`The excess is $A/R^2 = ${tex2(A)}/${R}^2$ radians.`, t`Convert the excess to degrees and add 180°.`],
          teach: 'On a curved surface a geodesic triangle’s angles add to π plus the curvature it encloses, ∫K dA.',
          explain: t`Excess $= A/R^2 = ${fmt(A / (R * R), 4)}$ rad $= ${fmt((A / (R * R)) * DEG, 4)}°$, so the angles add to $${fmt(ans, 5)}°$. Surveyors measuring this excess can find the radius of their world without leaving it.`,
        };
      },
    }),
    mcq({
      id: 'which-world', difficulty: 2,
      prompt: t`Surveyors on an unknown world lay out circles from one point. At radius 800 km (measured along the ground) they find a circumference of 5,200 km. What can they conclude about their world near that point?`,
      visual: circles({ caption: t`Circumference against radius on a sphere, a plane and a saddle (in units of the curvature radius). Which curve could their measurement lie on?` }),
      choices: ['It is negatively curved, like a saddle', 'It is positively curved, like a sphere', 'It is flat', 'Nothing: curvature can only be seen from outside'],
      answer: 0,
      why: {
        1: t`A sphere’s circles fall *short* of $2\pi\rho$. Here $2\pi\times800 = 5{,}027$ km, and they measured more.`,
        2: t`Flat ground gives exactly $2\pi\rho = 5{,}027$ km; 5,200 km is 3.4% more.`,
        3: 'Gauss’s point is the opposite: curvature is intrinsic, measurable by lengths and angles made inside the surface.',
      },
      hints: [t`Compare with the flat value $2\pi\rho$.`, 'Which surface makes circles longer than 2πρ?'],
      teach: 'Circles longer than 2πρ mean negative curvature; shorter mean positive; exactly 2πρ means flat.',
      explain: t`$5{,}200/(2\pi\times800) = ${fmt(5200 / (2 * Math.PI * 800), 4)} > 1$: the circles grow faster than on a plane, the mark of negative curvature. From $C \approx 2\pi\rho(1 - K\rho^2/6)$, $K \approx ${fmt(-6 * (5200 / (2 * Math.PI * 800) - 1) / 640000, 2)}\ \text{km}^{-2}$, a curvature radius near ${nice(1 / Math.sqrt(6 * (5200 / (2 * Math.PI * 800) - 1) / 640000), 2)} km.`,
    }),
    mcq({
      id: 'cylinder', difficulty: 2,
      prompt: t`A cylinder of radius $R$ has metric $ds^2 = dz^2 + R^2\,d\phi^2$, with $z$ along its axis. It is obviously bent in three-dimensional space. Is it curved in the sense of this lesson?`,
      visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'cylinder', surfaces: false, heading: 35, length: 9, readout: false, controls: false }, caption: t`A geodesic on a cylinder: a helix in space, but a straight line when the cylinder is unrolled. Colour shows Gaussian curvature (teal: zero).` },
      choices: [t`No: with $x = R\phi$ its metric is $dz^2 + dx^2$, the flat plane’s, so $K = 0$`, t`Yes: it bends with radius $R$, so $K = 1/R^2$`, t`Yes, but only around the circular direction`, t`It depends on where you stand on it`],
      answer: 0,
      why: {
        1: t`That is how it bends in space (extrinsic). An ant on it measures circles, triangles and areas exactly as on paper: intrinsic $K = 0$.`,
        2: 'Gaussian curvature has no direction; it is one number at each point, and here it is zero.',
        3: 'Every point of a cylinder is alike, and the metric has constant coefficients everywhere.',
      },
      hints: [t`Try the new coordinate $x = R\phi$.`, 'A sheet of paper rolls into a cylinder without stretching.'],
      teach: 'Bending a surface in space is not curvature; the metric, measured from inside, decides.',
      explain: t`With $x = R\phi$, $ds^2 = dz^2 + dx^2$: Pythagoras, so $K = 0$. Paper rolls into a cylinder without stretching or tearing, but it cannot be wrapped smoothly round a ball — a sphere is truly curved.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cmb', difficulty: 3, transfer: true,
      gen(r) {
        const x = r.pick([0.5, 1, 1.5]);
        const ans = x / Math.sinh(x);
        return {
          prompt: t`Cosmologists test the shape of space with the hot spots of the cosmic microwave background, whose true size $L$ is known. In a space with the saddle geometry, light from a ruler at distance $\rho$ spreads its length over a circle of circumference $2\pi a\sinh(\rho/a)$, so the ruler subtends $\theta = L/(a\sinh(\rho/a))$, against $L/\rho$ in flat space. If $\rho = ${x}a$, what is the ratio $\theta_{\text{saddle}}/\theta_{\text{flat}}$?`,
          visual: circles({ vlines: [{ x, color: 'accent', label: `ρ = ${x}a` }], caption: t`Circumference against radius. Spreading a fixed length over a longer circle makes it span a smaller angle. (A static picture: real cosmology uses the comoving distance in an expanding universe.)` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: Math.sinh(x) / x, feedback: 'Invert it: the longer circle makes the angle smaller, so the ratio is below 1.' }, { value: Math.sin(x) / x, feedback: t`That uses $\sin$, the sphere. The saddle has $\sinh$.` }],
          hints: [t`$\theta_{\text{saddle}}/\theta_{\text{flat}} = \rho/(a\sinh(\rho/a))$.`, t`With $\rho/a = ${x}$: $${x}/\sinh(${x})$.`],
          teach: 'In a negatively curved space circles are longer, so distant objects look smaller than in flat space.',
          explain: t`$${x}/\sinh ${x} = ${fmt(ans, 4)}$: the spots would look ${nice(100 * (1 - ans), 2)}% smaller. Planck’s measurements of the spots’ size find space flat to within a few tenths of a percent.`,
        };
      },
    }),
    num({
      id: 'cp-excess', difficulty: 3,
      gen(r) {
        const [A, ex] = r.pick([[50000, 0.5], [2.0e5, 1.2], [1.0e4, 0.25]]);
        const ans = Math.sqrt(A / (ex / DEG));
        return {
          prompt: t`Surveyors on a round asteroid lay out a triangle of geodesics enclosing ${nice(A)} km². Its angles add up to $${180 + ex}°$. Assuming a perfect sphere, what is the asteroid’s radius?`,
          visual: { type: 'gr-surface', params: { mode: 'loop', surface: 'sphere', surfaces: false, size: 0.35, readout: false, controls: false }, caption: 'A loop on a sphere: the curvature it encloses shows up as an angle — the triangle’s excess. Not to scale.' },
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(A / ex), feedback: 'Convert the excess to radians before using A/R².' }, { value: A / (ex / DEG), feedback: t`The excess is $A/R^2$: you found $R^2$; take its square root.` }],
          hints: [t`Excess $= A/R^2$ in radians: $${ex}° = ${fmt(ex / DEG, 4)}$ rad.`, t`$R = \sqrt{A/\text{excess}}$.`],
          teach: 'The angle excess of a geodesic triangle is A/R² on a sphere: curvature measured from inside.',
          explain: t`$R = \sqrt{${nice(A)}/${fmt(ex / DEG, 4)}} = ${nice(ans, 4)}$ km.`,
        };
      },
    }),
    mcq({
      id: 'cp-cone', difficulty: 3,
      prompt: t`A paper cone has metric $ds^2 = d\rho^2 + (\rho/2)^2\,d\phi^2$, with $\rho$ measured from its tip. What is true of it?`,
      visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'cone', surfaces: false, readout: false, controls: false }, caption: 'A cone, coloured by Gaussian curvature (teal: zero). Its tip is the one special point.' },
      choices: [t`$K = 0$ away from the tip, yet every circle round the tip has length $\pi\rho$`, t`$K = -f''/f > 0$ everywhere, like a sphere`, t`It is a plane in disguise: circles have length $2\pi\rho$`, t`$K = 1/\rho^2$, growing toward the tip`],
      answer: 0,
      why: {
        1: t`With $f = \rho/2$, $f'' = 0$, so $K = 0$ wherever the formula applies.`,
        2: t`The circles have length $2\pi f = \pi\rho$, half the flat value, because a whole half-plane of paper was cut away to make the cone.`,
        3: t`$f'' = 0$ gives $K = 0$ away from the tip; all the curvature is concentrated at the tip itself.`,
      },
      hints: [t`Compute $f''$ for $f = \rho/2$.`, t`Then compute the circumference $2\pi f$.`],
      teach: 'Zero curvature locally does not mean the same as a plane globally: a cone hides all its curvature at the tip.',
      explain: t`$K = 0$ everywhere except the tip, so small patches are flat paper; but every circle round the tip is $\pi\rho$, because the cone’s unrolled sheet is a half-disc. The missing angle, $\pi$, is curvature concentrated at the tip — the same structure as the space around a cosmic string.`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, ch. 2 (geometry as physics) and §7.? (metrics of curved surfaces)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Weeks, The Shape of Space (2nd ed.)', url: 'https://www.routledge.com/The-Shape-of-Space/Weeks/p/book/9781138061217' },
    { label: 'Planck Collaboration (2020), Planck 2018 results VI, A&A 641, A6 (spatial curvature)', url: 'https://doi.org/10.1051/0004-6361/201833910' },
  ],
});

function tex2(A) { return `${fmt(A / 1e6, 2)}\\times10^{6}`; }
