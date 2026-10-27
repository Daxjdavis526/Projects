// Volumes by cylindrical shells: slice parallel to the axis of rotation.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { between, revolve, outline, ring, axisLine, shellSides } from './_revolve.js';

const t = String.raw;

// Explore: the region under y = 2x − x² (0 ≤ x ≤ 2), rotated about the
// vertical line x = h (h = 0 or −1). The shift keeps the axis at the centre.
const top = (x) => `(2*(${x}) - (${x})^2)`, floor0 = () => '0';
const REGION = between(top, floor0, 0, 2);
const SH = ['-h', 0, -0.5];
const AX = { axis: 'y', at: 'h', shift: SH };

export default lesson({
  id: 'math1220.C2-1.3',
  title: 'Volumes by cylindrical shells',
  minutes: 10, difficulty: 3,
  intro: t`Rotate a region about the $y$-axis and slice it **parallel** to the axis instead of across it. A thin vertical strip at $x$ sweeps out a **cylindrical shell**: a tube of radius $x$, height $h(x)$ and thickness $dx$. Cut open and flattened, a shell is almost a slab of volume circumference × height × thickness, so

$$V = \int_a^b 2\pi x\,h(x)\,dx$$

Shells let you keep $x$ as the variable even though the axis is vertical — no need to solve $y = f(x)$ for $x$.`,
  symbols: [
    { tex: 'V', text: 'the volume of the solid, in cubic units (m³)' },
    { tex: 'x', text: 'the **radius** of the shell: its distance from the axis of rotation (for the $y$-axis, simply $x$)' },
    { tex: 'h(x)', text: 'the **height** of the shell: the top boundary minus the bottom boundary of the region at $x$' },
    { tex: '2\\pi x', text: 'the circumference of the shell — the length of the slab once it is unrolled' },
    { tex: 'dx', text: 'the thickness of the shell' },
    { tex: 'a,\\ b', text: 'the smallest and largest $x$ in the region' },
  ],
  why: t`Adding up thin rings of area $2\pi r\,dr$ is how you find the mass of a disk whose density changes with radius, a flywheel’s moment of inertia, or the mass of an accretion disk around a black hole.`,
  visual: {
    type: 'surface3d',
    title: 'Shells: strips parallel to the axis',
    lead: t`The violet outline is the region under $y = 2x - x^2$, standing beside the vertical axis of rotation (red). Revolving it sweeps out a ring-shaped solid. The gold cage is the shell swept out by the thin vertical strip at $x$: radius = distance to the axis, height = $2x - x^2$.`,
    tasks: [
      t`Move the shell across the region: thin and short near the ends, tall in the middle — and wider the farther it is from the axis.`,
      t`Sweep from 0° to 360°: every vertical strip of the region traces out one shell, and the shells nest like tubes.`,
      t`Switch the axis to the line $x = -1$: every radius grows by 1, a hole opens in the middle, and the volume doubles from $\tfrac{8\pi}{3}$ to $\tfrac{16\pi}{3}$.`,
    ],
    params: {
      surface: revolve(REGION, { ...AX, sweep: 'sw' }),
      domain: [[0, 4], [0, 1]], n: 48, colorBy: false, alpha: 0.55, axes: false,
      yaw: -0.75, pitch: 0.5, dist: 5.8,
      choices: [{ key: 'h', label: 'Axis of rotation', options: [[0, 'the y-axis'], [-1, 'the line x = −1']], value: 0 }],
      sliders: [
        { key: 'sw', label: 'Revolve by', min: 0, max: 360, step: 5, value: 270, unit: '^\\circ', explain: 'How far the region has swept around the axis. At 360° the solid is complete.' },
        { key: 'xs', label: 'Shell at $x$', min: 0.05, max: 1.95, step: 0.05, value: 1.2, explain: t`The vertical strip of the region at this $x$, and the shell it sweeps out.` },
      ],
      curves: [
        axisLine({ ...AX, from: -0.3, to: 1.7 }),
        outline(REGION, AX),
        outline(REGION, { ...AX, angle: 'sw' }),
        ring('xs', 0, AX),
        ring('xs', top('xs'), AX),
        ...shellSides('xs', 0, top('xs'), { at: 'h', shift: SH, count: 6 }),
      ],
      readouts: [
        { label: 'shell radius', expr: 'xs - h' },
        { label: 'shell height', expr: '2*xs - xs^2' },
        { label: t`volume $V$`, expr: '8*pi*(1 - h)/3' },
      ],
    },
    caption: 'Drag to turn the solid. The shell is drawn as a cage of lines so you can see it inside the semi-transparent solid; the volume readout is exact.',
  },
  example: {
    prompt: t`The region under $y = 2x^2 - x^3$ for $0 \le x \le 2$ is rotated about the $y$-axis. Find the volume.`,
    visual: {
      type: 'graph',
      params: {
        aspect: 'wide', x: [-0.5, 2.5], y: [-0.2, 1.5],
        curves: [{ fn: '2*x^2 - x^3', color: 'accent', label: 'y = 2x² − x³', labelAt: 0.45 }],
        shade: [{ fn: '2*x^2 - x^3', from: 0, to: 2, color: 'accent', alpha: 0.2 }, { fn: '2*x^2 - x^3', from: 1.25, to: 1.31, color: 'gold', alpha: 0.9 }],
        arrows: [{ from: [0, 0.12], to: [1.24, 0.12], color: 'gold', label: 'radius x' }],
        vlines: [{ x: 0, color: 'bad', label: 'axis' }],
      },
      caption: 'The gold strip, at distance x from the axis, sweeps out one shell of height 2x² − x³.',
    },
    steps: [
      { label: 'Why shells', text: t`Washers would slice horizontally and need $x$ as a function of $y$ — solving the cubic $y = 2x^2 - x^3$ for $x$. Shells keep everything in $x$.` },
      { label: 'One shell', text: t`The strip at $x$ is $x$ from the axis and $2x^2 - x^3$ tall, so its shell has volume $\approx 2\pi x\left(2x^2 - x^3\right)dx$.` },
      { label: 'Set up', text: t`$V = \displaystyle\int_0^2 2\pi x\left(2x^2 - x^3\right)dx = 2\pi\int_0^2\left(2x^3 - x^4\right)dx.$` },
      { label: 'Integrate', text: t`$2\pi\left[\dfrac{x^4}{2} - \dfrac{x^5}{5}\right]_0^2 = 2\pi\left(8 - \dfrac{32}{5}\right) = \dfrac{16\pi}{5} \approx 10.05.$` },
      { label: 'Sense check', text: t`The region is at most $\tfrac{32}{27} \approx 1.19$ tall (at $x = \tfrac43$), so the solid fits inside a cylinder of radius 2 and height 1.19, volume $\pi(2)^2(1.19) \approx 14.9$. Our $10.05$ is below that, as it must be.` },
    ],
    answer: t`$V = \dfrac{16\pi}{5} \approx 10.05$ cubic units`,
  },
  practice: [
    mcq({
      id: 'shell-parts', difficulty: 1,
      prompt: t`The region under $y = f(x)$ for $1 \le x \le 3$ (with $f > 0$) is rotated about the $y$-axis. What are the radius and height of the shell at $x$?`,
      choices: [
        t`radius $x$, height $f(x)$`,
        t`radius $f(x)$, height $x$`,
        t`radius $x - 1$, height $f(x)$`,
        t`radius $3 - x$, height $f(x)$`,
      ],
      answer: 0,
      why: {
        1: 'That swaps the roles. The radius is the horizontal distance from the strip to the vertical axis.',
        2: t`The radius is measured from the axis of rotation ($x = 0$), not from the left edge of the region.`,
        3: t`That would be the radius for rotation about the line $x = 3$.`,
      },
      hints: ['The shell is the tube swept out by the vertical strip at x. How far is that strip from the y-axis?', 'How tall is the strip?'],
      teach: 'Shell radius = distance from the strip to the axis; shell height = length of the strip.',
      explain: t`The strip at $x$ is $x$ away from the $y$-axis and $f(x)$ tall, so $V = \int_1^3 2\pi x\,f(x)\,dx$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, 3.6], y: [-0.2, 2.2], curves: [{ fn: '1 + 0.6*sin(1.6*x)', color: 'accent', label: 'y = f(x)', labelAt: 3.05 }], shade: [{ fn: '1 + 0.6*sin(1.6*x)', from: 1, to: 3, color: 'accent', alpha: 0.2 }, { fn: '1 + 0.6*sin(1.6*x)', from: 2.2, to: 2.26, color: 'gold', alpha: 0.9 }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] } },
    }),
    num({
      id: 'shell-basic', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), V = (Math.PI * k ** 4) / 6;
        const f = k === 1 ? 'x - x^2' : `${k}x - x^2`;
        return {
          prompt: t`The region under $y = ${f}$ and above the $x$-axis is rotated about the $y$-axis. Use shells to find the volume. Give 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          errors: [{ value: k ** 4 / 12, feedback: t`You left out the $2\pi$: a shell’s circumference is $2\pi x$, not $x$.` }],
          hints: [t`The region runs from $x = 0$ to $x = ${k}$.`, t`$V = \int_0^{${k}} 2\pi x\left(${f}\right)dx = 2\pi\int_0^{${k}}\left(${k === 1 ? '' : k}x^2 - x^3\right)dx$.`],
          teach: 'Shell volume: 2π × radius × height × thickness, summed with an integral.',
          explain: t`$2\pi\left[\tfrac{${k === 1 ? '' : k}x^3}{3} - \tfrac{x^4}{4}\right]_0^{${k}} = 2\pi\left(\tfrac{${k ** 4}}{3} - \tfrac{${k ** 4}}{4}\right) = \tfrac{${k ** 4}\pi}{6} \approx ${fmt(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.4 * k, 1.3 * k], y: [-0.1 * k * k, 0.35 * k * k], curves: [{ fn: `${k}*x - x^2`, color: 'accent' }], shade: [{ fn: `${k}*x - x^2`, from: 0, to: k, color: 'accent', alpha: 0.2 }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] } },
        };
      },
    }),
    num({
      id: 'about-line', difficulty: 3,
      gen(r) {
        const c = r.int(2, 4), V = 2 * Math.PI * (c / 3 - 1 / 4);
        return {
          prompt: t`The region under $y = x^2$ for $0 \le x \le 1$ is rotated about the vertical line $x = ${c}$. Find the volume. Give 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          errors: [{ value: Math.PI / 2, feedback: t`That uses radius $x$ — the distance to the $y$-axis. Here the axis is $x = ${c}$, so the radius is $${c} - x$.` }],
          hints: [t`The strip at $x$ is $${c} - x$ away from the line $x = ${c}$.`, t`$V = \int_0^1 2\pi\left(${c} - x\right)x^2\,dx$.`],
          teach: 'For an axis x = c, the shell radius is the distance |c − x|.',
          explain: t`$2\pi\int_0^1\left(${c}x^2 - x^3\right)dx = 2\pi\left(\tfrac{${c}}{3} - \tfrac14\right) \approx ${fmt(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, c + 0.6], y: [-0.2, 1.4], curves: [{ fn: 'x^2', color: 'accent', label: 'y = x²', labelAt: 0.55 }], shade: [{ fn: 'x^2', from: 0, to: 1, color: 'accent', alpha: 0.22 }, { fn: 'x^2', from: 0.7, to: 0.75, color: 'gold', alpha: 0.9 }], arrows: [{ from: [c, 0.15], to: [0.76, 0.15], color: 'gold', label: `${c} − x` }], vlines: [{ x: c, color: 'bad', label: `axis x = ${c}` }] } },
        };
      },
    }),
    mcq({
      id: 'choose-method', difficulty: 2,
      prompt: t`The region under $y = x^3 + x$ for $0 \le x \le 1$ is rotated about the $y$-axis. Which integral gives the volume with the least work?`,
      choices: [
        t`$2\pi\displaystyle\int_0^1 x\left(x^3 + x\right)dx$`,
        t`$\pi\displaystyle\int_0^1\left(x^3 + x\right)^2dx$`,
        t`$2\pi\displaystyle\int_0^1\left(x^3 + x\right)dx$`,
        t`$\pi\displaystyle\int_0^2 x^2\,dy$`,
      ],
      answer: 0,
      why: {
        1: t`Those are disks perpendicular to the $x$-axis — the solid made by rotating about the $x$-axis.`,
        2: t`The radius $x$ is missing: each shell’s volume is $2\pi x\cdot h(x)\,dx$.`,
        3: t`Washers in $y$ would need $x$ as a function of $y$ (solving $y = x^3 + x$), and the washer would be $\pi(1 - x^2)$, not $\pi x^2$.`,
      },
      hints: ['The axis is vertical. Which slices keep x as the variable?', 'A shell at x has radius x and height x³ + x.'],
      teach: 'Shells keep x as the variable when the axis is vertical, so you never have to invert the function.',
      explain: t`$V = 2\pi\int_0^1\left(x^4 + x^2\right)dx = 2\pi\left(\tfrac15 + \tfrac13\right) = \tfrac{16\pi}{15}$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.6, 1.5], y: [-0.2, 2.3], curves: [{ fn: 'x^3 + x', color: 'accent', label: 'y = x³ + x', labelAt: 0.45, domain: [0, 1.15] }], shade: [{ fn: 'x^3 + x', from: 0, to: 1, color: 'accent', alpha: 0.22 }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] }, caption: 'The region and the axis of rotation (red).' },
    }),
    num({
      id: 'horizontal-shells', difficulty: 3,
      gen(r) {
        const b = r.pick([1, 4, 9]), rb = Math.sqrt(b), V = (Math.PI * b * b) / 2;
        return {
          prompt: t`The region under $y = \sqrt{x}$ for $0 \le x \le ${b}$ is rotated about the **$x$-axis**. Find the volume with shells — horizontal strips — and check it against disks. Give 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          hints: [
            t`About a horizontal axis, shells come from horizontal strips: integrate in $y$, from $0$ to $${rb}$.`,
            t`The strip at height $y$ runs from $x = y^2$ to $x = ${b}$: its length is $${b} - y^2$ and its radius is $y$.`,
            t`$V = \int_0^{${rb}} 2\pi y\left(${b} - y^2\right)dy$.`,
          ],
          teach: 'Shells work about any axis: strips parallel to it, radius = distance to it, height = strip length.',
          explain: t`Shells: $2\pi\left[\tfrac{${b}y^2}{2} - \tfrac{y^4}{4}\right]_0^{${rb}} = 2\pi\left(\tfrac{${b * b}}{2} - \tfrac{${b * b}}{4}\right) = \tfrac{${b * b}\pi}{2}$. Disks agree: $\pi\int_0^{${b}} x\,dx = \tfrac{${b * b}\pi}{2} \approx ${fmt(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, b * 1.2], y: [-0.25 * rb, rb * 1.35], curves: [{ fn: 'sqrt(x)', color: 'accent' }], shade: [{ fn: 'sqrt(x)', from: 0, to: b, color: 'accent', alpha: 0.2 }, { fn: `${0.56 * rb}`, lower: `${0.5 * rb}`, from: (0.53 * rb) ** 2, to: b, color: 'gold', alpha: 0.9 }], hlines: [{ y: 0, color: 'bad', label: 'axis' }] }, caption: 'The gold horizontal strip sweeps out a shell around the x-axis.' },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`The region between $y = x$ and $y = x^2$ is rotated about the $y$-axis. A student writes $V = \displaystyle\int_0^1 2\pi x^2\left(x - x^2\right)dx$. What is wrong?`,
      choices: [
        t`The radius should be $x$, not $x^2$: $V = \int_0^1 2\pi x\left(x - x^2\right)dx = \tfrac{\pi}{6}$`,
        t`The height should be $x^2 - x$`,
        t`It should be $\pi$, not $2\pi$`,
        t`The limits should be $0$ to $2$`,
      ],
      answer: 0,
      why: {
        1: t`On $[0, 1]$, $x \ge x^2$, so the height top − bottom is $x - x^2$; the other order is negative.`,
        2: t`A shell unrolls into a slab of length $2\pi\times$radius; $\pi r^2$ belongs to disks.`,
        3: t`The curves meet at $x = 0$ and $x = 1$.`,
      },
      hints: ['Check each factor: 2π, radius, height, limits.', t`How far is the strip at $x$ from the $y$-axis?`],
      teach: 'The radius of a shell is the distance from the axis — for the y-axis that is x itself, whatever the curves are.',
      explain: t`The student used the bottom curve $x^2$ as the radius. With radius $x$: $2\pi\int_0^1(x^2 - x^3)\,dx = 2\pi\left(\tfrac13 - \tfrac14\right) = \tfrac{\pi}{6}$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 1.4], y: [-0.1, 1.2], curves: [{ fn: 'x', color: 'accent', label: 'y = x', labelAt: 1.1 }, { fn: 'x^2', color: 'warn', label: 'y = x²', labelAt: 1.02 }], shade: [{ fn: 'x', lower: 'x^2', from: 0, to: 1, color: 'accent', alpha: 0.22 }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] } },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-shell', difficulty: 2,
      gen(r) {
        const b = r.int(1, 3), V = Math.PI * Math.log(1 + b * b);
        return {
          prompt: t`The region under $y = \dfrac{1}{1 + x^2}$ for $0 \le x \le ${b}$ is rotated about the $y$-axis. Find the volume. Give 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          hints: [t`$V = \int_0^{${b}} \dfrac{2\pi x}{1 + x^2}\,dx$; substitute $u = 1 + x^2$.`],
          teach: 'Shells often produce integrands that a substitution finishes off.',
          explain: t`With $u = 1 + x^2$, $du = 2x\,dx$: $V = \pi\int_1^{${1 + b * b}}\dfrac{du}{u} = \pi\ln ${1 + b * b} \approx ${fmt(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.4, b + 0.6], y: [-0.1, 1.2], curves: [{ fn: '1/(1 + x^2)', color: 'accent' }], shade: [{ fn: '1/(1 + x^2)', from: 0, to: b, color: 'accent', alpha: 0.22 }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] } },
        };
      },
    }),
    num({
      id: 'cp-flywheel', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([1500, 1600, 1800]), th = r.pick([0.04, 0.05, 0.06]), R = r.pick([0.25, 0.3, 0.4]);
        const M = ((5 * Math.PI) / 3) * th * rho * R * R;
        return {
          prompt: t`A composite flywheel is a disk of radius ${R} m and thickness ${th} m. Its fibres are packed more densely toward the rim: $\rho(r) = ${rho}\left(1 + \dfrac{r}{${R}}\right)$ kg/m³ at distance $r$ from the centre. Find its mass by adding up thin rings. Give 3 significant figures.`,
          answer: M, units: 'kg', tol: { rel: 0.005 },
          errors: [{ value: rho * Math.PI * R * R * th, feedback: t`That uses the density at the centre, ${rho} kg/m³, everywhere. The density grows with $r$, so add up rings.` }],
          hints: [
            t`A ring of radius $r$ and width $dr$ has volume $2\pi r\,dr \times ${th}$ (circumference × width × thickness).`,
            t`$M = \int_0^{${R}} \rho(r)\cdot 2\pi r\cdot ${th}\,dr = 2\pi(${th})(${rho})\int_0^{${R}}\left(r + \dfrac{r^2}{${R}}\right)dr$.`,
          ],
          teach: 'When a property varies with radius, slice into rings of area 2πr dr — the shell idea in two dimensions.',
          explain: t`$\int_0^{${R}}\left(r + \tfrac{r^2}{${R}}\right)dr = \tfrac{${R}^2}{2} + \tfrac{${R}^2}{3} = \tfrac56(${R})^2$, so $M = 2\pi(${th})(${rho})\cdot\tfrac56(${R})^2 \approx ${fmt(M)}$ kg.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-R * 1.6, R * 1.6], y: [-R * 1.15, R * 1.15], equal: true, curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, '2*pi'], color: 'accent' }, { param: [`${0.6 * R}*cos(t)`, `${0.6 * R}*sin(t)`], t: [0, '2*pi'], color: 'gold' }, { param: [`${0.66 * R}*cos(t)`, `${0.66 * R}*sin(t)`], t: [0, '2*pi'], color: 'gold' }] }, caption: 'Face-on view: one thin ring of the flywheel, of radius r and width dr.' },
        };
      },
    }),
    mcq({
      id: 'cp-compare', difficulty: 2,
      prompt: t`A region is rotated about the $y$-axis. Which statement is true?`,
      choices: [
        t`Shells use vertical strips (parallel to the axis) and integrate in $x$; washers use horizontal strips (perpendicular to it) and integrate in $y$`,
        t`Shells and washers both use vertical strips`,
        t`Shells always give a larger volume than washers`,
        t`Shells only work when the region touches the axis`,
      ],
      answer: 0,
      why: {
        1: t`Washers must be perpendicular to the axis — horizontal here — so they use $dy$.`,
        2: 'Both methods measure the same solid, so they give the same volume.',
        3: t`The radius is just the distance to the axis; the Explore solid about $x = -1$ never touches its axis.`,
      },
      hints: ['How is each kind of slice oriented relative to the axis?'],
      teach: 'Washers are perpendicular to the axis; shells are parallel to it — both give the same volume.',
      explain: 'Washers slice across the axis, shells along it. Pick whichever makes the radii and heights easy to write down.',
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.6, 2.4], y: [-0.15, 1.2], curves: [{ fn: '2*x - x^2', color: 'accent', domain: [0, 2] }], shade: [{ fn: '2*x - x^2', from: 0, to: 2, color: 'accent', alpha: 0.18 }, { fn: '2*x - x^2', from: 1.4, to: 1.46, color: 'gold', alpha: 0.9 }, { fn: '0.56', lower: '0.5', from: '1 - sqrt(0.47)', to: '1 + sqrt(0.47)', color: 'teal', alpha: 0.85 }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] }, caption: 'A region beside the axis of rotation (red), with one vertical strip (gold) and one horizontal strip (teal).' },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.3 Volumes of Revolution: Cylindrical Shells', url: 'https://openstax.org/books/calculus-volume-2/pages/2-3-volumes-of-revolution-cylindrical-shells' }],
});
