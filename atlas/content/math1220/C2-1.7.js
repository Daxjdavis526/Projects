// Hydrostatic force: pressure grows with depth, so slice a submerged plate
// into horizontal strips, each at a single depth.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;
const g = 9.81;

// front view of a plate: water surface at y = 0, depth = −y
// k·v as TeX with k reduced: 1 → v, 2/2 → v, 3/2 → \frac{3}{2}v
const coef = (k, v) => (Math.abs(k - 1) < 1e-12 ? v : `${frac(k)}${v}`);

const front = (shade, extra = {}) => ({ type: 'graph', params: { aspect: 'wide', equal: true, ylabel: 'height (m)', shade, hlines: [{ y: 0, color: 'teal', label: 'water surface' }], ...extra } });

export default lesson({
  id: 'math1220.C2-1.7',
  title: 'Hydrostatic force',
  minutes: 10, difficulty: 3,
  intro: t`The pressure in a still liquid grows linearly with depth: $p = \rho g h$. On a horizontal plate every point is at the same depth, so the force is simply pressure × area. On a vertical wall the pressure changes from top to bottom, so slice the wall into thin horizontal strips: each strip sits at a single depth $h$, has width $w(h)$, and feels force $\rho g h\,w(h)\,dh$. Adding the strips:

$$F = \int_a^b \rho g\,h\,w(h)\,dh$$

Dams, ship hulls, submarine portholes and propellant-tank walls are all designed with this integral.`,
  symbols: [
    { tex: 'F', text: 'the total force of the liquid on the plate, in newtons (N), pushing perpendicular to the plate' },
    { tex: '\\rho', text: 'the density of the liquid (kg/m³): 1000 for fresh water, about 1025 for seawater' },
    { tex: 'g', text: 'the acceleration of gravity, 9.81 m/s²' },
    { tex: 'h', text: 'the **depth** of a strip below the liquid’s surface (m) — measured downward' },
    { tex: 'w(h)', text: 'the width of the plate at depth $h$ (m)' },
    { tex: 'a,\\ b', text: 'the depths of the top and bottom of the plate' },
    { tex: 'p = \\rho g h', text: 'the **gauge pressure** at depth $h$ (Pa = N/m²); atmospheric pressure acts on both sides of a wall and cancels' },
  ],
  why: t`The same strip-by-strip reasoning sizes a dam, a submarine porthole or a rocket’s propellant tank — whose pressure, during launch, grows with the vehicle’s acceleration as well as with depth.`,
  visual: {
    type: 'graph',
    title: 'Pressure grows with depth',
    lead: t`A side view of water held back by a vertical wall. Each arrow shows the pressure on the wall at its depth, drawn to scale: the arrows grow in proportion to depth and form a triangle. The gold strip is one thin horizontal strip of the wall.`,
    tasks: [
      'Move the strip down: its pressure grows by 9.81 kPa for every metre of water above it.',
      t`Double the water depth: the pressure at the bottom doubles, but the force on each metre of wall **quadruples** — it is $\rho g D^2/2$.`,
      'The force on a metre of wall is the area of the pressure triangle: half of (bottom pressure × depth).',
    ],
    params: {
      x: [-5, 1.6], y: [-10.8, 1.2], xlabel: ' ', ylabel: 'height (m)',
      sliders: [
        { key: 'D', label: 'Water depth $D$ (m)', min: 1, max: 10, step: 0.1, value: 6, explain: 'How deep the water is against the wall.' },
        { key: 'hs', label: 'Strip depth $h$ (m)', min: 0, max: 10, step: 0.1, value: 3, explain: 'Where the gold strip sits (it stops at the bottom).' },
      ],
      shade: [{ fn: '0', lower: '-D', from: -4.8, to: 0, color: 'teal', alpha: 0.16 }],
      curves: [
        { param: ['0', 't'], t: [-10.6, 1], color: 'ink2', width: 3.5 },
        { param: ['t', '-D'], t: [-4.8, 0], color: 'ink2', width: 2 },
        { param: ['-0.42*D*t', '-D*t'], t: [0, 1], color: 'warn', dash: true },
        { param: ['0', 't'], t: ['-min(hs, D) - 0.18', '-min(hs, D) + 0.18'], color: 'gold', width: 7 },
      ],
      arrows: [
        { from: ['-0.42*0.2*D', '-0.2*D'], to: [0, '-0.2*D'], color: 'warn' },
        { from: ['-0.42*0.4*D', '-0.4*D'], to: [0, '-0.4*D'], color: 'warn' },
        { from: ['-0.42*0.6*D', '-0.6*D'], to: [0, '-0.6*D'], color: 'warn' },
        { from: ['-0.42*0.8*D', '-0.8*D'], to: [0, '-0.8*D'], color: 'warn' },
        { from: ['-0.42*D', '-D + 0.05'], to: [0, '-D + 0.05'], color: 'warn' },
        { from: ['-0.42*min(hs, D) - 0.6', '-min(hs, D)'], to: [-0.02, '-min(hs, D)'], color: 'gold' },
      ],
      readouts: [
        { label: t`pressure at the strip $\rho g h$`, expr: '9.81*min(hs, D)', unit: t`\text{kPa}`, digits: 3 },
        { label: 'pressure at the bottom', expr: '9.81*D', unit: t`\text{kPa}`, digits: 3 },
        { label: t`force per metre of wall $\rho g D^2/2$`, expr: '9.81*D^2/2', unit: t`\text{kN/m}`, digits: 3 },
      ],
    },
    caption: t`Heights are measured from the water surface, so a point at height $-3$ is at depth $h = 3$ m. Fresh water, $\rho = 1000$ kg/m³, $g = 9.81$ m/s². Gauge pressure: the atmosphere pushes on both sides and cancels. Arrow lengths are proportional to pressure; the gold arrow is offset slightly so it stays visible.`,
  },
  example: {
    prompt: t`A test tank has a triangular viewing window in its vertical wall. The window’s 2 m top edge is horizontal, 1 m below the water surface, and its lowest point is 1.5 m below that. Find the force of the water ($\rho = 1000$ kg/m³) on the window.`,
    visual: front(
      [{ fn: '-1', lower: '-2.5 + 1.5*abs(x)', from: -1, to: 1, color: 'accent', alpha: 0.25 }, { fn: '-1.74', lower: '-1.86', from: -0.4667, to: 0.4667, color: 'gold', alpha: 0.9 }],
      { x: [-2.6, 2.6], y: [-2.8, 0.4], arrows: [{ from: [1.4, 0], to: [1.4, -1.8], color: 'ink2', label: 'h' }, { from: [-0.4667, -2.05], to: [0.4667, -2.05], color: 'gold', label: 'w(h)' }] },
    ),
    steps: [
      { label: 'Depth and width', text: t`Measure depth $h$ down from the surface. The window spans $1 \le h \le 2.5$. Its width shrinks linearly from 2 m at $h = 1$ to 0 at $h = 2.5$: $w(h) = \tfrac{2}{1.5}(2.5 - h) = \tfrac43(2.5 - h)$.` },
      { label: 'One strip', text: t`A strip at depth $h$ feels pressure $\rho g h$ over area $w(h)\,dh$: force $1000(9.81)\,h\cdot\tfrac43(2.5 - h)\,dh$.` },
      { label: 'Set up', text: t`$F = 9810\cdot\tfrac43\displaystyle\int_1^{2.5}\left(2.5h - h^2\right)dh.$` },
      { label: 'Integrate', text: t`$\left[1.25h^2 - \tfrac{h^3}{3}\right]_1^{2.5} = 2.604 - 0.917 = 1.6875$, so $F = 9810\cdot\tfrac43\cdot1.6875 = 9810 \times 2.25 \approx 22\,100$ N.` },
      { label: 'Sense check', text: t`The window’s area is $\tfrac12(2)(1.5) = 1.5$ m², and its centroid is a third of the way down from its top edge, at depth $1.5$ m. Pressure there × area $= 9810(1.5)(1.5) = 22\,072$ N ✓ — a shortcut the moments lesson explains.` },
    ],
    answer: t`$F \approx 22.1$ kN`,
  },
  practice: [
    mcq({
      id: 'why-integrate', difficulty: 1,
      prompt: 'Why can the force of water on a vertical dam face not be found as one pressure × the area of the face?',
      choices: [
        'The pressure changes with depth, so there is no single pressure to multiply by — slice into strips at one depth each',
        'Because water pressure only pushes downward',
        'Because the weight of the water acts on the ground, not on the dam',
        'It can: multiply the pressure at the bottom by the area',
      ],
      answer: 0,
      why: {
        1: 'Pressure in a fluid pushes equally in all directions, and always perpendicular to a surface — including sideways on a wall.',
        2: 'The water pushes sideways on the dam too; that sideways push is exactly what the integral measures.',
        3: 'The bottom pressure is the largest; using it everywhere overestimates the force (by a factor of 2 for a wall that starts at the surface).',
      },
      hints: [t`How does $p = \rho g h$ behave from the top of the dam to the bottom?`],
      teach: 'Use force = pressure × area only where the pressure is uniform — on a thin horizontal strip.',
      explain: t`Pressure varies with depth, so each strip $dh$ has its own pressure $\rho g h$; the integral adds them.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-3.8, 1], y: [-6.6, 0.7], axes: false, grid: false, shade: [{ fn: '0', lower: '-6', from: -3.6, to: 0, color: 'teal', alpha: 0.16 }], curves: [{ param: ['0', 't'], t: [-6.4, 0.6], color: 'ink2', width: 3.5 }, { param: ['-3.6*t', '0'], t: [0, 1], color: 'teal' }, { param: ['-2.52*t', '-6*t'], t: [0, 1], color: 'warn', dash: true }], arrows: [1, 2, 3, 4, 5].map((k) => ({ from: [-0.504 * k, -1.2 * k], to: [0, -1.2 * k], color: 'warn' })) }, caption: 'Side view of water against a dam wall. Arrow lengths show the pressure, which grows in proportion to depth.' },
    }),
    num({
      id: 'rect-gate', difficulty: 2,
      gen(r) {
        const W = r.pick([2, 3, 4]), H = r.pick([1, 2]), a = r.pick([2, 3, 4, 5]);
        const F = (1000 * g * W * ((a + H) ** 2 - a * a)) / 2 / 1000;
        return {
          prompt: t`A rectangular sluice gate in a dam is ${W} m wide and ${H} m tall. Its top edge is ${a} m below the water surface. Find the force of the water on the gate, in kN.`,
          answer: F, units: 'kN', tol: { rel: 0.005 },
          errors: [
            { value: (1000 * g * a * W * H) / 1000, feedback: t`That uses the pressure at the top edge for the whole gate. The pressure keeps growing down to depth ${a + H} m.` },
            { value: (1000 * g * (a + H) * W * H) / 1000, feedback: 'That uses the pressure at the bottom edge for the whole gate — too much.' },
          ],
          hints: [t`$w(h) = ${W}$ for every depth from $${a}$ to $${a + H}$.`, t`$F = 1000(9.81)\displaystyle\int_{${a}}^{${a + H}} ${W}h\,dh$.`],
          teach: 'For a rectangle the width is constant, and the integral of h gives (b² − a²)/2.',
          explain: t`$F = 9810\cdot${W}\cdot\tfrac{${a + H}^2 - ${a}^2}{2} = 9810\cdot${W}\cdot${((a + H) ** 2 - a * a) / 2} \approx ${fmt(F)}$ kN — the same as the pressure at the gate’s mid-depth, ${a + H / 2} m, times its area.`,
          visual: front([{ fn: `${-a}`, lower: `${-a - H}`, from: -W / 2, to: W / 2, color: 'accent', alpha: 0.3 }], { x: [-W * 1.5, W * 1.5], y: [-a - H - 0.5, 0.6] }),
        };
      },
    }),
    num({
      id: 'triangle-up', difficulty: 3,
      gen(r) {
        const b = r.pick([2, 3, 4]), H = r.pick([2, 3]);
        const F = (1000 * g * b * H * H) / 3 / 1000;
        return {
          prompt: t`A triangular plate stands vertically in water: its vertex is at the surface and its horizontal base, ${b} m wide, is ${H} m down. Find the force of the water on one face, in kN.`,
          answer: F, units: 'kN', tol: { rel: 0.005 },
          errors: [
            { value: (1000 * g * b * H * H) / 2 / 1000, feedback: t`That treats the plate as a ${b} m wide rectangle. Its width grows from 0 at the surface: $w(h) = ${coef(b / H, 'h')}$.` },
            { value: (1000 * g * b * H * H) / 6 / 1000, feedback: 'That would be right for a triangle pointing down (its area concentrated near the surface). This one is widest at the bottom, where the pressure is highest.' },
          ],
          hints: [t`Similar triangles: at depth $h$ the width is $w(h) = ${coef(b / H, 'h')}$.`, t`$F = 9810\displaystyle\int_0^{${H}} h\cdot ${coef(b / H, 'h')}\,dh$.`],
          teach: 'Write the width as a function of depth with similar triangles, then integrate ρgh·w(h).',
          explain: t`$F = 9810\cdot\tfrac{${b}}{${H}}\cdot\tfrac{${H}^3}{3} = 9810\cdot\tfrac{${b}\cdot${H * H}}{3} \approx ${fmt(F)}$ kN.`,
          visual: front([{ fn: `${(-2 * H) / b}*abs(x)`, lower: `${-H}`, from: -b / 2, to: b / 2, color: 'accent', alpha: 0.3 }], { x: [-b * 1.3, b * 1.3], y: [-H - 0.4, 0.5] }),
        };
      },
    }),
    mcq({
      id: 'semicircle-setup', difficulty: 2,
      prompt: t`A vertical semicircular plate of radius 2 m has its straight edge (the diameter) along the water surface and its curved edge below. With $h$ the depth, which integral gives the force on it?`,
      choices: [
        t`$\rho g\displaystyle\int_0^2 h\cdot 2\sqrt{4 - h^2}\,dh$`,
        t`$\rho g\displaystyle\int_0^2 h\sqrt{4 - h^2}\,dh$`,
        t`$\rho g\displaystyle\int_0^2 2\sqrt{4 - h^2}\,dh$`,
        t`$\rho g\displaystyle\int_0^2 (2 - h)\cdot 2\sqrt{4 - h^2}\,dh$`,
      ],
      answer: 0,
      why: {
        1: t`$\sqrt{4 - h^2}$ is only half the width — from the centre line to one edge.`,
        2: t`The depth $h$ is missing: this is $\rho g$ × the plate’s area, as if the pressure were $\rho g$ everywhere.`,
        3: t`$2 - h$ is the height above the lowest point, not the depth below the surface.`,
      },
      hints: [t`At depth $h$, the plate runs from $x = -\sqrt{4 - h^2}$ to $x = +\sqrt{4 - h^2}$.`, 'Each strip’s pressure is ρg × (its depth).'],
      teach: 'Each strip contributes pressure (ρgh) × width × dh; the width is the full chord at that depth.',
      explain: t`Width $2\sqrt{4 - h^2}$, pressure $\rho g h$: $F = \rho g\int_0^2 2h\sqrt{4 - h^2}\,dh = \tfrac{16}{3}\rho g \approx 52.3$ kN for water.`,
      visual: front([{ fn: '0', lower: '-sqrt(4 - x^2)', from: -2, to: 2, color: 'accent', alpha: 0.3 }, { fn: '-1.15', lower: '-1.27', from: '-sqrt(4 - 1.21^2)', to: 'sqrt(4 - 1.21^2)', color: 'gold', alpha: 0.9 }], { x: [-3.4, 3.4], y: [-2.3, 0.5] }),
    }),
    num({
      id: 'half-tank', difficulty: 3,
      gen(r) {
        const R = r.pick([1, 1.5, 2]), F = ((2 / 3) * 810 * g * R ** 3) / 1000;
        return {
          prompt: t`A horizontal cylindrical tank of radius ${R} m is half full of kerosene ($\rho = 810$ kg/m³). Find the force of the kerosene on one circular end, in kN.`,
          answer: F, units: 'kN', tol: { rel: 0.005 },
          errors: [{ value: (810 * g * R * ((Math.PI * R * R) / 2)) / 1000, feedback: t`That uses the pressure at the bottom ($h = ${R}$) over the whole wetted half-disc. Integrate: shallow strips feel less.` }],
          hints: [
            t`The liquid surface is at the tank’s centre line. The wetted part of the end is a half-disc: at depth $h$ its width is $2\sqrt{${R * R} - h^2}$.`,
            t`$F = 810(9.81)\displaystyle\int_0^{${R}} 2h\sqrt{${R * R} - h^2}\,dh$; substitute $u = ${R * R} - h^2$.`,
          ],
          teach: 'For a curved boundary, write the strip width with the circle’s equation and integrate by substitution.',
          explain: t`$\int_0^{${R}} 2h\sqrt{${R * R} - h^2}\,dh = \tfrac23(${R})^3$, so $F = 810(9.81)\cdot\tfrac23(${R})^3 \approx ${fmt(F)}$ kN.`,
          visual: front([{ fn: '0', lower: `-sqrt(${R * R} - x^2)`, from: -R, to: R, color: 'accent', alpha: 0.3 }], { x: [-R * 2, R * 2], y: [-R * 1.15, R * 1.15], curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, '2*pi'], color: 'ink2' }] }),
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A square plate 2 m on a side hangs vertically in water with its top edge at the surface. A student writes: “the pressure is $\rho g(2)$, the area is 4 m², so $F = 9810 \times 2 \times 4 \approx 78.5$ kN.” What is wrong?`,
      choices: [
        t`The pressure is $\rho g \cdot 2$ only at the bottom edge; it grows from 0 at the top, so $F = \rho g\int_0^2 2h\,dh \approx 39.2$ kN`,
        'The area of the plate is 2 m², not 4 m²',
        t`The pressure should be $\rho g/h$`,
        'Atmospheric pressure must be added to the water pressure',
      ],
      answer: 0,
      why: {
        1: 'A 2 m square has area 2 × 2 = 4 m².',
        2: t`Pressure grows with depth: $p = \rho g h$, not $\rho g/h$.`,
        3: 'The atmosphere presses on both faces of the plate, so it cancels from the net force.',
      },
      hints: ['Is the pressure the same at the top edge and the bottom edge?', t`Average $\rho g h$ over the plate: its mid-depth is 1 m.`],
      teach: 'Pressure × area works only with the right pressure — for a vertical rectangle, the pressure at its mid-depth.',
      explain: t`$F = 9810\int_0^2 2h\,dh = 9810 \times 4 = 39\,240$ N $\approx 39.2$ kN — half the student’s answer.`,
      visual: front([{ fn: '0', lower: '-2', from: -1, to: 1, color: 'accent', alpha: 0.3 }], { x: [-2.6, 2.6], y: [-2.4, 0.5] }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-window', difficulty: 2,
      gen(r) {
        const W = r.pick([0.5, 0.8, 1.2]), H = r.pick([0.6, 0.8, 1]), a = r.pick([1.2, 2, 3.5]);
        const F = (1000 * g * W * ((a + H) ** 2 - a * a)) / 2;
        return {
          prompt: t`A rectangular inspection window in the side of a water test tank is ${W} m wide and ${H} m tall, with its top edge ${a} m below the surface. Find the force of the water on the window. Give 3 significant figures.`,
          answer: F, units: 'N', tol: { rel: 0.005 },
          hints: [t`$F = 9810\displaystyle\int_{${a}}^{${nice(a + H)}} ${W}h\,dh$.`],
          teach: 'For a rectangle, F = ρgw(b² − a²)/2, between the depths of its edges.',
          explain: t`$F = 9810(${W})\tfrac{${nice(a + H)}^2 - ${a}^2}{2} \approx ${fmt(F)}$ N.`,
          visual: front([{ fn: `${-a}`, lower: `${-(a + H)}`, from: -W / 2, to: W / 2, color: 'accent', alpha: 0.3 }], { x: [-Math.max(2, a), Math.max(2, a)], y: [-(a + H) - 0.4, 0.5], arrows: [{ from: [W / 2 + 0.3, 0], to: [W / 2 + 0.3, -a], color: 'ink2', label: `${a} m` }] }),
        };
      },
    }),
    num({
      id: 'cp-dam', difficulty: 3, transfer: true,
      gen(r) {
        const [T, B, D] = r.pick([[50, 30, 20], [80, 40, 30], [60, 40, 15]]);
        const F = (1000 * g * D * D * (T + 2 * B)) / 6 / 1e6;
        return {
          prompt: t`The vertical face of a dam is a trapezoid: ${T} m wide at the water surface, ${B} m wide at the bottom, ${D} m deep. Find the force of the water on it, in MN.`,
          answer: F, units: 'MN', tol: { rel: 0.005 },
          errors: [{ value: (1000 * g * T * D * D) / 2 / 1e6, feedback: t`That treats the face as a ${T} m wide rectangle. It narrows with depth.` }],
          hints: [
            t`The width falls linearly from ${T} m at $h = 0$ to ${B} m at $h = ${D}$: $w(h) = ${T} - \tfrac{${T - B}}{${D}}h$.`,
            t`$F = 9810\displaystyle\int_0^{${D}} h\left(${T} - \tfrac{${T - B}}{${D}}h\right)dh$.`,
          ],
          teach: 'For a trapezoid, the width is a linear function of depth.',
          explain: t`$F = 9810\left[\tfrac{${T}}{2}h^2 - \tfrac{${T - B}}{${3 * D}}h^3\right]_0^{${D}} = 9810\cdot${nice((D * D * (T + 2 * B)) / 6)} \approx ${fmt(F)}$ MN.`,
          visual: front([{ fn: '0', lower: `-${D}*min(1, (${T / 2} - abs(x))/${(T - B) / 2})`, from: -T / 2, to: T / 2, color: 'accent', alpha: 0.3 }], { x: [-T * 0.8, T * 0.8], y: [-D * 1.2, D * 0.25] }),
        };
      },
    }),
    num({
      id: 'cp-porthole', difficulty: 3, transfer: true,
      gen(r) {
        const rad = r.pick([0.15, 0.2, 0.3]), d = r.pick([20, 50, 100]);
        const F = (1025 * g * d * Math.PI * rad * rad) / 1000;
        return {
          prompt: t`An underwater habitat has a vertical circular porthole of radius ${rad} m whose centre is ${d} m below the sea surface ($\rho = 1025$ kg/m³). Find the force of the water on it, in kN.`,
          answer: F, units: 'kN', tol: { rel: 0.005 },
          hints: [
            t`Let $y$ be the height above the porthole’s centre; a strip there is at depth $${d} - y$ and has width $2\sqrt{${nice(rad * rad)} - y^2}$.`,
            t`$F = \rho g\displaystyle\int_{-${rad}}^{${rad}} (${d} - y)\,2\sqrt{${nice(rad * rad)} - y^2}\,dy$. Split it: the part with $y$ is an odd function on a symmetric interval.`,
            t`The odd part integrates to 0; what is left is $\rho g\,${d}\times$ the area of the disc.`,
          ],
          teach: 'Symmetry can do the work: an odd integrand on a symmetric interval integrates to zero.',
          explain: t`$F = 1025(9.81)(${d})\,\pi(${rad})^2 \approx ${fmt(F)}$ kN — the pressure at the centre times the area. Strips above and below the centre differ by equal and opposite amounts.`,
          visual: { type: 'graph', params: { aspect: 'wide', equal: true, x: [-rad * 3, rad * 3], y: [-d - rad * 1.4, -d + rad * 1.4], xlabel: 'x (m)', ylabel: 'height (m)', curves: [{ param: [`${rad}*cos(t)`, `${-d} + ${rad}*sin(t)`], t: [0, '2*pi'], color: 'accent' }], shade: [{ fn: `${-d} + sqrt(${rad * rad} - x^2)`, lower: `${-d} - sqrt(${rad * rad} - x^2)`, from: -rad, to: rad, color: 'accent', alpha: 0.2 }, { fn: `${-d + 0.6 * rad}`, lower: `${-d + 0.52 * rad}`, from: -0.8 * rad, to: 0.8 * rad, color: 'gold', alpha: 0.85 }, { fn: `${-d - 0.52 * rad}`, lower: `${-d - 0.6 * rad}`, from: -0.8 * rad, to: 0.8 * rad, color: 'gold', alpha: 0.85 }] }, caption: t`Zoomed in on the porthole; the surface is ${d} m above its centre. Strips the same distance above and below the centre have the same width.` },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.5 Physical Applications', url: 'https://openstax.org/books/calculus-volume-2/pages/2-5-physical-applications' }],
});
