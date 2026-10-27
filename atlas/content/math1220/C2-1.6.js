// Work done by a variable force: springs, cables, pumping, and lifting a
// payload against gravity that weakens with altitude.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, frac, tex as texNum } from '../../src/core/format.js';

const t = String.raw;
const g = 9.81;
const RHO_LOX = 1141;            // kg/m³, liquid oxygen at its normal boiling point (≈ 90 K)
const GM = 3.986004418e14;       // m³/s², Earth (IERS / WGS 84)
const RE = 6.371e6;              // m, mean Earth radius

// a tank cross-section for pumping pictures: walls, liquid, one layer and its lift
const tankPic = ({ w, H, y0, dy, top = H, liftLabel }) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [-w * 1.9, w * 1.9], y: [-0.08 * top, top * 1.12], equal: true,
    shade: [{ fn: `${H}`, from: -w, to: w, color: 'teal', alpha: 0.14 }, { fn: `${y0 + dy}`, lower: `${y0}`, from: -w, to: w, color: 'gold', alpha: 0.85 }],
    curves: [{ param: [`${-w}`, 't'], t: [0, top], color: 'ink2' }, { param: [`${w}`, 't'], t: [0, top], color: 'ink2' }, { param: ['t', '0'], t: [-w, w], color: 'ink2' }],
    arrows: [{ from: [w * 0.45, y0 + dy], to: [w * 0.45, top], color: 'gold', label: liftLabel }, { from: [-w * 0.55, 0], to: [-w * 0.55, y0], color: 'ink3', label: 'y' }],
  },
});

export default lesson({
  id: 'math1220.C2-1.6',
  title: 'Work done by a variable force',
  minutes: 11, difficulty: 3,
  intro: t`A constant force $F$ pushing an object a distance $d$ along its line of action does work $W = Fd$. When the force changes with position — a spring that pushes back harder the more it is stretched, a cable that gets lighter as it is wound in, gravity that weakens with altitude — slice the motion into short steps over which the force is nearly constant, and add:

$$W = \int_a^b F(x)\,dx$$

For **pumping** a liquid, slice the liquid instead: every thin layer has its own weight and is lifted its own distance, so $W = \int (\text{weight of the layer})\times(\text{distance it is lifted})$.`,
  symbols: [
    { tex: 'W', text: 'the work done, in joules (1 J = 1 N·m)' },
    { tex: 'F(x)', text: 'the force at position $x$, along the direction of motion, in newtons (N)' },
    { tex: 'x', text: 'position along the line of motion, in metres' },
    { tex: 'a,\\ b', text: 'where the motion starts and ends' },
    { tex: 'dx', text: 'a short step of the motion' },
    { tex: 'F = kx', text: '**Hooke’s law** for a spring stretched $x$ beyond its natural length; $k$ is the spring constant (N/m)' },
  ],
  why: t`Work integrals size pumps and turbopumps, give the energy stored in springs and pressure vessels, and — with Newton’s $F = GMm/r^2$ — the energy needed to lift a payload to orbit or to escape Earth entirely.`,
  visual: {
    type: 'graph',
    title: 'Work is the area under the force',
    lead: t`To lift a 1000 kg payload slowly from Earth’s surface, you must hold up its weight, which **shrinks with altitude**: $F(h) = mg\,\dfrac{R^2}{(R + h)^2}$. The work is the area under this curve. The rectangles are force × short step, added up.`,
    tasks: [
      'Increase the number of steps n: the rectangles (a left sum, which overestimates a falling curve) settle onto the exact work.',
      'Push the target altitude to 20 000 km: the true work is less than a quarter of what a constant 9.81 kN weight would suggest.',
      t`As $h$ grows without bound the work approaches $mgR \approx 62.5$ GJ — the energy to escape Earth from rest (ignoring air and Earth’s rotation).`,
    ],
    params: {
      x: [-0.6, 21], y: [0, 11.5], xlabel: 'altitude h (1000 km)', ylabel: 'F (kN)',
      sliders: [
        { key: 'H', label: 'Target altitude (1000 km)', min: 0.5, max: 20, step: 0.1, value: 6, explain: 'How high the payload is lifted, in thousands of kilometres. The ISS orbits at about 0.4; GPS satellites at about 20.' },
        { key: 'n', label: 'Number of steps $n$', min: 1, max: 40, step: 1, value: 6, explain: 'Each rectangle is the force at the start of a step times the step.' },
      ],
      curves: [
        { fn: '9.81*(6.371/(6.371 + x))^2', color: 'accent', label: 'weight F(h)', labelAt: 12.5 },
        { fn: '9.81', color: 'ink3', dash: true, label: 'weight at the surface, 9.81 kN', labelAt: 9 },
      ],
      riemann: { fn: '9.81*(6.371/(6.371 + x))^2', from: 0, to: 'H', n: 'n', rule: 'left' },
      readouts: [
        { label: 'sum of the rectangles', expr: 'riemann', unit: t`\text{GJ}`, digits: 4 },
        { label: t`exact work $W$`, expr: '9.81*6.371*H/(6.371 + H)', unit: t`\text{GJ}`, digits: 4 },
        { label: 'if the weight stayed 9.81 kN', expr: '9.81*H', unit: t`\text{GJ}`, digits: 4 },
      ],
    },
    caption: t`Work against gravity only: the payload is raised slowly, so no kinetic energy is given to it, and air drag and Earth’s rotation are ignored. $g = 9.81$ m/s², $R = 6371$ km. One kN × 1000 km is one gigajoule.`,
  },
  example: {
    prompt: t`A cylindrical tank of radius 1.5 m and height 4 m is full of liquid oxygen (density ${RHO_LOX} kg/m³). How much work does it take to pump all of it out over the top of the tank?`,
    visual: { ...tankPic({ w: 1.5, H: 4, y0: 1.4, dy: 0.15, liftLabel: '4 − y' }), caption: 'Cross-section of the tank. The gold layer at height y must be lifted 4 − y metres to the top.' },
    steps: [
      { label: 'Slice the liquid', text: t`Measure $y$ up from the bottom. A layer at height $y$ of thickness $dy$ has volume $\pi(1.5)^2\,dy$ and weight $${RHO_LOX}\cdot 9.81\cdot\pi(1.5)^2\,dy \approx 79\,100\,dy$ N.` },
      { label: 'Lift distance', text: t`That layer must rise from $y$ to the top at $4$ m: a distance $4 - y$. Lower layers travel farther.` },
      { label: 'Set up', text: t`$W = \displaystyle\int_0^4 ${RHO_LOX}\,(9.81)\,\pi(1.5)^2\,(4 - y)\,dy.$` },
      { label: 'Integrate', text: t`$\int_0^4 (4 - y)\,dy = \left[4y - \tfrac{y^2}{2}\right]_0^4 = 8$, so $W = ${RHO_LOX}(9.81)\pi(2.25)(8) \approx 6.33\times10^5$ J $= 633$ kJ.` },
      { label: 'Sense check', text: t`The LOX has mass $${RHO_LOX}\cdot\pi(1.5)^2\cdot 4 \approx 32\,300$ kg, and on average it rises 2 m (its centre of mass is at mid-height): $mg\bar h \approx 32\,300 \times 9.81 \times 2 \approx 633$ kJ ✓` },
    ],
    answer: t`$W \approx 633$ kJ (an idealisation: no pipe friction, and the liquid leaves with negligible speed)`,
  },
  practice: [
    num({
      id: 'hooke', difficulty: 1,
      gen(r) {
        const F = r.pick([12, 18, 24, 30]), s = r.pick([0.1, 0.15, 0.2]);
        const d = r.pick([0.3, 0.4, 0.5].filter((v) => Math.abs(v - 2 * s) > 1e-9));   // d = 2s would make F·d coincide with ½kd²
        const k = F / s, W = 0.5 * k * d * d;
        return {
          prompt: t`A force of ${F} N holds a spring stretched ${s} m beyond its natural length. How much work does it take to stretch it from its natural length to ${d} m beyond it?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: F * d, feedback: t`The spring force is not constant at ${F} N: it grows in proportion to the stretch. Integrate $kx$.` }, { value: k * d * d, feedback: t`Missing the $\tfrac12$: $\int_0^d kx\,dx = \tfrac12 kd^2$.` }],
          hints: [t`Hooke’s law: $F = kx$, so $k = ${F}/${s} = ${nice(k)}$ N/m.`, t`$W = \int_0^{${d}} ${nice(k)}\,x\,dx$.`],
          teach: 'For a spring the force grows linearly with stretch, so the work is the triangle area ½kd².',
          explain: t`$k = ${nice(k)}$ N/m and $W = \tfrac12(${nice(k)})(${d})^2 = ${nice(W)}$ J — the area of the triangle under $F = kx$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.05, d * 1.25], y: [0, k * d * 1.2], xlabel: 'x (m)', ylabel: 'F (N)', curves: [{ fn: `${k}*x`, color: 'accent' }], shade: [{ fn: `${k}*x`, from: 0, to: d, color: 'accent', alpha: 0.22 }] } },
        };
      },
    }),
    num({
      id: 'spring-interval', difficulty: 2,
      gen(r) {
        const k = r.pick([200, 300, 400, 500]), x1 = r.pick([0.1, 0.2]), x2 = x1 + r.pick([0.1, 0.2, 0.3]);
        const W = 0.5 * k * (x2 * x2 - x1 * x1);
        return {
          prompt: t`A spring has constant $k = ${k}$ N/m. How much work does it take to stretch it from ${x1} m to ${nice(x2)} m beyond its natural length?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: 0.5 * k * (x2 - x1) ** 2, feedback: t`$\tfrac12 k(x_2 - x_1)^2$ would be right only if the spring started relaxed. Evaluate $\tfrac12 kx^2$ at both limits and subtract.` }],
          hints: [t`$W = \int_{${x1}}^{${nice(x2)}} ${k}x\,dx$.`],
          teach: 'Integrate the spring force between the actual starting and ending stretches.',
          explain: t`$W = \tfrac12(${k})\left(${nice(x2)}^2 - ${x1}^2\right) = ${nice(W)}$ J — a trapezoid under $F = kx$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.02, x2 * 1.25], y: [0, k * x2 * 1.2], xlabel: 'x (m)', ylabel: 'F (N)', curves: [{ fn: `${k}*x`, color: 'accent' }], shade: [{ fn: `${k}*x`, from: x1, to: x2, color: 'accent', alpha: 0.25 }] } },
        };
      },
    }),
    num({
      id: 'cable', difficulty: 2,
      gen(r) {
        const L = r.pick([20, 30, 40, 50]), w = r.pick([2, 3, 4, 5]), W = (w * L * L) / 2;
        return {
          prompt: t`A ${L} m cable weighing ${w} N per metre hangs straight down from a winch. How much work does it take to wind all of it in?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: w * L * L, feedback: 'That lifts every piece of cable the full length. Only the bottom end travels that far; a piece near the top hardly moves.' }],
          hints: [t`After $x$ m have been wound in, $${L} - x$ m still hang, weighing $${w}(${L} - x)$ N.`, t`$W = \int_0^{${L}} ${w}(${L} - x)\,dx$.`],
          teach: 'For a hanging cable the force (the weight still hanging) decreases as it is wound in.',
          explain: t`$W = ${w}\left[${L}x - \tfrac{x^2}{2}\right]_0^{${L}} = \tfrac{${w}\cdot${L}^2}{2} = ${nice(W)}$ J. Equivalently: the cable’s weight ${w * L} N, lifted through the average distance ${L / 2} m its centre of mass rises.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1, L * 1.15], y: [0, w * L * 1.2], xlabel: 'wound in, x (m)', ylabel: 'F (N)', curves: [{ fn: `${w}*(${L} - x)`, color: 'accent', domain: [0, L] }], shade: [{ fn: `${w}*(${L} - x)`, from: 0, to: L, color: 'accent', alpha: 0.22 }] }, caption: 'Force needed against how much cable has been wound in: the area is the work.' },
        };
      },
    }),
    num({
      id: 'cable-load', difficulty: 3,
      gen(r) {
        const L = r.pick([20, 30, 40]), w = r.pick([3, 5]), P = r.pick([200, 400, 600]);
        const W = (w * L * L) / 2 + P * L;
        return {
          prompt: t`A crane cable ${L} m long weighing ${w} N/m lifts a ${P} N load from the ground to the crane, winding in the whole cable. How much work is done?`,
          answer: W, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: (w * L * L) / 2, feedback: 'That is the cable alone. The load is lifted the full length too.' }, { value: w * L * L + P * L, feedback: 'The cable’s pieces do not all travel the full length: integrate its remaining weight.' }],
          hints: [t`The load’s weight is constant: it contributes $${P}\times${L}$ J.`, t`The cable contributes $\int_0^{${L}} ${w}(${L} - x)\,dx$, as in the last problem.`],
          teach: 'Split the work: constant forces give force × distance; varying ones need an integral.',
          explain: t`$W = ${P}(${L}) + \tfrac{${w}(${L})^2}{2} = ${P * L} + ${(w * L * L) / 2} = ${W}$ J.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1, L * 1.15], y: [0, (w * L + P) * 1.2], xlabel: 'wound in, x (m)', ylabel: 'F (N)', curves: [{ fn: `${w}*(${L} - x) + ${P}`, color: 'accent', domain: [0, L] }], shade: [{ fn: `${w}*(${L} - x) + ${P}`, from: 0, to: L, color: 'accent', alpha: 0.22 }, { fn: `${P}`, from: 0, to: L, color: 'warn', alpha: 0.2 }] }, caption: 'Orange: the load’s constant weight. Blue on top: the cable still hanging.' },
        };
      },
    }),
    mcq({
      id: 'setup-pump', difficulty: 2,
      prompt: t`A rectangular tank 5 m long, 3 m wide and 2 m deep is full of water ($\rho = 1000$ kg/m³). With $y$ measured up from the bottom, which integral gives the work (in joules) to pump all the water out over the top?`,
      choices: [
        t`$\displaystyle\int_0^2 1000\,(9.81)(15)(2 - y)\,dy$`,
        t`$\displaystyle\int_0^2 1000\,(9.81)(15)\,y\,dy$`,
        t`$\displaystyle\int_0^2 1000\,(15)(2 - y)\,dy$`,
        t`$\displaystyle\int_0^2 1000\,(9.81)(15)\,dy$`,
      ],
      answer: 0,
      why: {
        1: t`$y$ is how far the layer is *above the bottom*. It has to rise to the top, a distance $2 - y$.`,
        2: t`Without $g$ this adds up mass × distance (kg·m), not force × distance. Work needs the layer’s weight.`,
        3: 'That is just the total weight of the water; each layer’s lift distance is missing.',
      },
      hints: ['Weight of a layer = density × g × (area × thickness).', 'How far must the layer at height y rise to reach the top?'],
      teach: 'Pumping work: integrate (density × g × layer area) × (lift distance) over the depth.',
      explain: t`A layer of area $5\times3 = 15$ m² and thickness $dy$ weighs $1000(9.81)(15)\,dy$ N and rises $2 - y$ m. $W = 1000(9.81)(15)\cdot 2 \approx 294$ kJ.`,
      visual: { ...tankPic({ w: 2.5, H: 2, y0: 0.7, dy: 0.12, liftLabel: '2 − y' }), caption: 'Side view (length 5 m, depth 2 m). The gold layer rises 2 − y to the top.' },
    }),
    num({
      id: 'cone-tank', difficulty: 3,
      gen(r) {
        const [R, H] = r.pick([[2, 6], [3, 6], [2, 4], [1.5, 3]]);
        const W = (1000 * g * Math.PI * R * R * H * H) / 12 / 1000;
        return {
          prompt: t`A water tank is an upside-down cone: radius ${R} m at the top, depth ${H} m, vertex at the bottom. It is full ($\rho = 1000$ kg/m³). How much work does it take to pump all the water out over the top? Answer in kJ to 3 significant figures.`,
          answer: W, units: 'kJ', tol: { rel: 0.005 },
          errors: [
            { value: 4 * W, feedback: t`That lifts all the water the full ${H} m. Each layer rises only from its own height $y$ to the top: $${H} - y$.` },
            { value: 2 * W, feedback: t`That assumes an average lift of half the depth. A cone holds most of its water near the top, so the average lift is only a quarter of the depth.` },
          ],
          hints: [
            t`With $y$ up from the vertex, the layer at height $y$ is a disk of radius $${frac(R / H)}y$ (similar triangles).`,
            t`Its weight is $1000(9.81)\pi\left(${frac(R / H)}y\right)^2dy$ and it rises $${H} - y$.`,
            t`$W = 1000(9.81)\pi\dfrac{${R * R}}{${H * H}}\displaystyle\int_0^{${H}} y^2(${H} - y)\,dy$.`,
          ],
          teach: 'For a tank whose width changes with height, the layer area changes too: write the radius as a function of y.',
          explain: t`$\int_0^{${H}} y^2(${H} - y)\,dy = \tfrac{${H}^4}{3} - \tfrac{${H}^4}{4} = \tfrac{${H}^4}{12}$, so $W = 1000(9.81)\pi\tfrac{${R * R}}{${H * H}}\cdot\tfrac{${H ** 4}}{12} \approx ${fmt(W)}$ kJ.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-R * 2, R * 2], y: [-0.1 * H, H * 1.12], equal: true, shade: [{ fn: `${H}`, lower: `${H / R}*abs(x)`, from: -R, to: R, color: 'teal', alpha: 0.14 }, { fn: `${0.45 * H}`, lower: `${0.42 * H}`, from: -0.42 * R, to: 0.42 * R, color: 'gold', alpha: 0.85 }], curves: [{ fn: `${H / R}*abs(x)`, color: 'ink2', domain: [-R, R] }], arrows: [{ from: [0.12 * R, 0.45 * H], to: [0.12 * R, H], color: 'gold', label: `${H} − y` }] }, caption: 'Cross-section of the cone. The gold layer at height y has radius (R/H)y.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-spring-twist', difficulty: 3,
      gen(r) {
        const W1 = r.pick([2, 3, 5, 8]), s = r.pick([0.1, 0.2, 0.25]);
        return {
          prompt: t`It takes ${W1} J of work to stretch a spring ${s} m from its natural length. How much work does it take to stretch it a **further** ${s} m?`,
          answer: 3 * W1, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: W1, feedback: 'The spring pulls back harder the more it is stretched, so the second stretch costs more than the first.' }, { value: 4 * W1, feedback: 'That is the total work from the natural length. Subtract the first stretch.' }],
          hints: [t`$W = \tfrac12 kx^2$; stretching to twice the distance takes four times the total work.`, 'The second stretch is the total minus the first.'],
          teach: 'Spring work grows with the square of the stretch, so equal extra stretches cost more and more.',
          explain: t`$\tfrac12 k s^2 = ${W1}$ J, and $\tfrac12 k(2s)^2 = ${4 * W1}$ J, so the second stretch takes $${4 * W1} - ${W1} = ${3 * W1}$ J.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.02 * s, 2.4 * s], y: [0, 2.4], xlabel: 'x', ylabel: 'F', xticks: 4, curves: [{ fn: `x/${s}`, color: 'accent' }], shade: [{ fn: `x/${s}`, from: 0, to: s, color: 'accent', alpha: 0.25 }, { fn: `x/${s}`, from: s, to: 2 * s, color: 'warn', alpha: 0.25 }] }, caption: 'Force against stretch (force axis in arbitrary units). Blue: the first stretch. Orange: the second.' },
        };
      },
    }),
    num({
      id: 'cp-fill-stage', difficulty: 3, transfer: true,
      gen(r) {
        const rad = r.pick([1.5, 1.8, 2]), b = r.pick([15, 20, 30]), h = r.pick([4, 6]);
        const W = (RHO_LOX * g * Math.PI * rad * rad * ((b + h) ** 2 - b * b)) / 2 / 1e6;
        return {
          prompt: t`A launch-pad pump at ground level fills a rocket stage’s liquid-oxygen tank: a vertical cylinder of radius ${rad} m, ${h} m tall, whose bottom is ${b} m above the pump. Each layer of LOX ($\rho = ${RHO_LOX}$ kg/m³) is lifted from ground level to its place in the tank. How much work does filling the tank take? Answer in MJ to 3 significant figures.`,
          answer: W, units: 'MJ', tol: { rel: 0.005 },
          errors: [{ value: (RHO_LOX * g * Math.PI * rad * rad * h * (b + h)) / 1e6, feedback: 'That lifts every layer to the top of the tank. The bottom layers only rise to the bottom of the tank.' }],
          hints: [
            t`A layer at height $y$ (from ${b} to ${b + h} m) has weight $${RHO_LOX}(9.81)\pi(${rad})^2\,dy$ and is lifted $y$ metres.`,
            t`$W = ${RHO_LOX}(9.81)\pi(${rad})^2\displaystyle\int_{${b}}^{${b + h}} y\,dy$.`,
          ],
          teach: 'Pumping work depends on where each layer starts and finishes: here every layer starts at ground level and ends at its own height.',
          explain: t`$\int_{${b}}^{${b + h}} y\,dy = \tfrac{${b + h}^2 - ${b}^2}{2} = ${((b + h) ** 2 - b * b) / 2}$, so $W = ${RHO_LOX}(9.81)\pi(${rad})^2(${((b + h) ** 2 - b * b) / 2}) \approx ${fmt(W)}$ MJ — the tank’s weight lifted to its mid-height, ${b + h / 2} m. (Pipe friction and the liquid’s speed are ignored.)`,
        };
      },
    }),
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const [m, alt, name] = r.pick([[1000, 400e3, 'the ISS’s altitude (400 km)'], [500, 35786e3, 'geostationary altitude (35 786 km)'], [2000, 20200e3, 'GPS altitude (20 200 km)']]);
        const W = (GM * m * (1 / RE - 1 / (RE + alt))) / 1e9;
        return {
          prompt: t`Gravity on a mass $m$ at distance $r$ from Earth’s centre is $F = \dfrac{GMm}{r^2}$, with $GM = 3.986\times10^{14}$ m³/s². How much work does it take to raise a ${m} kg satellite from Earth’s surface ($R = 6371$ km) to ${name}, ignoring the speed it needs to orbit? Answer in GJ to 3 significant figures.`,
          answer: W, units: 'GJ', tol: { rel: 0.005 },
          errors: [{ value: (m * g * alt) / 1e9, feedback: t`That uses the surface weight $mg$ all the way up. Gravity weakens as $1/r^2$, so integrate.` }],
          hints: [t`$W = \displaystyle\int_R^{R + h}\frac{GMm}{r^2}\,dr$.`, t`$\int r^{-2}\,dr = -r^{-1}$, so $W = GMm\left(\dfrac1R - \dfrac1{R + h}\right)$.`],
          teach: 'For an inverse-square force, the work between two radii is GMm(1/r₁ − 1/r₂).',
          explain: t`$W = (3.986\times10^{14})(${m})\left(\dfrac{1}{6.371\times10^6} - \dfrac{1}{${texNum(RE + alt, 5)}}\right) \approx ${fmt(W)}$ GJ. Reaching orbit takes far more: the orbital speed must be supplied too.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, (RE + alt) / 1e6 * 1.15], y: [0, m * g / 1000 * 1.25], xlabel: 'r (1000 km)', ylabel: 'F (kN)', curves: [{ fn: `${(GM * m) / 1e15}/x^2`, color: 'accent', domain: [6.371, (RE + alt) / 1e6 * 1.15] }], shade: [{ fn: `${(GM * m) / 1e15}/x^2`, from: 6.371, to: (RE + alt) / 1e6, color: 'accent', alpha: 0.25 }], vlines: [{ x: 6.371, label: 'surface' }] }, caption: 'The weight against distance from Earth’s centre; the shaded area is the work.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §2.5 Physical Applications', url: 'https://openstax.org/books/calculus-volume-2/pages/2-5-physical-applications' },
    { label: 'NIST Chemistry WebBook: oxygen (fluid properties)', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7782447' },
  ],
});
