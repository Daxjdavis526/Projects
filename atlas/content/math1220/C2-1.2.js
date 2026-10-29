// Volumes by slicing: known cross-sections, disks and washers.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { between, revolve, outline, ring, axisLine } from './_revolve.js';

const t = String.raw;

// The Explore solid is the worked example's: the region between y = √x and
// y = w·x/2 on [0, 4] (w = 1: washers; w = 0: the region reaches the axis, so
// disks). SH centres it on the camera's target.
const top = (x) => `sqrt(${x})`, bottom = (x) => `w*(${x})/2`;
const REGION = between(top, bottom, 0, 4);
const SH = [-2, 0, 0];

export default lesson({
  id: 'math1220.C2-1.2',
  title: 'Volumes by slicing: disks and washers',
  minutes: 11, difficulty: 2,
  intro: t`If you know the area $A(x)$ of every cross-section of a solid perpendicular to an axis, slice the solid into thin slabs of thickness $dx$ and add them: $V = \int_a^b A(x)\,dx$. For a **solid of revolution** about the $x$-axis every slab is round — a **disk** of radius $R(x)$, or, if the region does not touch the axis, a **washer** with a hole of radius $r(x)$:

$$V = \int_a^b \pi\left[R(x)^2 - r(x)^2\right]dx$$

Tanks, nose cones, nozzles and anything else turned on a lathe are measured this way.`,
  symbols: [
    { tex: 'V', text: 'the volume of the solid, in cubic units (m³)' },
    { tex: 'A(x)', text: 'the area of the cross-section at $x$ (m²); for a washer $A = \\pi(R^2 - r^2)$' },
    { tex: 'R(x)', text: 'the **outer radius**: the distance from the axis of rotation to the far edge of the region' },
    { tex: 'r(x)', text: 'the **inner radius**: the distance from the axis to the near edge; $r = 0$ gives a solid disk' },
    { tex: 'dx', text: 'the thickness of one slice, measured along the axis' },
    { tex: 'a,\\ b', text: 'where the solid starts and ends along the axis' },
  ],
  why: t`Disks and washers slice across the axis of rotation and the next lesson’s shells slice along it; knowing both lets you size tanks, nozzles and the moments of inertia of rotating parts with whichever is easier.`,
  visual: {
    type: 'surface3d',
    title: 'Sweep a flat region into a solid',
    lead: t`The violet outline is a flat region standing in a vertical plane. **Revolve** it about the $x$-axis (red) and it sweeps out a solid. The gold rings mark the slice at $x$: a washer with outer radius $R = \sqrt{x}$ and inner radius $r = \tfrac{x}{2}$ — or, if the region touches the axis, a disk.`,
    tasks: [
      t`Set **Revolve by** to 0°, then drag it up to 360°: the flat region sweeps out the solid.`,
      t`Move the slice: its area $\pi(R^2 - r^2) = \pi\left(x - \tfrac{x^2}{4}\right)$ falls to zero at both ends, where the curves meet.`,
      t`Switch to **Disks**: the cone-shaped hole closes ($r = 0$) and the volume grows from $\tfrac{8\pi}{3} \approx 8.38$ to $8\pi \approx 25.1$.`,
    ],
    params: {
      surface: revolve(REGION, { axis: 'x', at: 0, sweep: 'sw', shift: SH }),
      domain: [[0, 4], [0, 1]], n: 48, colorBy: false, alpha: 0.78, axes: false,
      yaw: -1.3, pitch: 0.5, dist: 7.6,
      choices: [{ key: 'w', label: 'Region', options: [[1, 'Washers: between √x and x/2'], [0, 'Disks: under √x']], value: 1 }],
      sliders: [
        { key: 'sw', label: 'Revolve by', min: 0, max: 360, step: 5, value: 270, unit: '^\\circ', explain: 'How far the region has swept around the axis. At 360° the solid is complete.' },
        { key: 'xs', label: 'Slice at $x$', min: 0.05, max: 3.95, step: 0.05, value: 2.2, explain: t`The gold rings are the outer and inner edges of the slice at this $x$.` },
      ],
      curves: [
        axisLine({ from: -0.8, to: 5, shift: SH }),
        outline(REGION, { shift: SH }),
        outline(REGION, { shift: SH, angle: 'sw' }),
        ring('xs', top('xs'), { shift: SH }),
        ring('xs', bottom('xs'), { shift: SH }),
      ],
      readouts: [
        { label: t`slice area $A(x) = \pi(R^2 - r^2)$`, expr: 'pi*(xs - w*xs^2/4)' },
        { label: t`volume $V$`, expr: 'pi*(8 - 16*w/3)' },
      ],
    },
    caption: 'Drag to turn the solid. The surface is built from small flat patches, so its edges look slightly faceted; the readouts are exact.',
  },
  example: {
    prompt: t`The region between $y = \sqrt{x}$ and $y = \tfrac{x}{2}$ is rotated about the $x$-axis. Find the volume of the solid.`,
    visual: {
      type: 'graph',
      params: {
        aspect: 'wide', x: [-0.3, 4.8], y: [-0.4, 2.5],
        curves: [{ fn: 'sqrt(x)', color: 'accent', label: 'y = √x', labelAt: 3.3 }, { fn: 'x/2', color: 'warn', label: 'y = x/2', labelAt: 4.3 }],
        shade: [{ fn: 'sqrt(x)', lower: 'x/2', from: 0, to: 4, color: 'accent', alpha: 0.2 }, { fn: 'sqrt(x)', lower: 'x/2', from: 2.2, to: 2.28, color: 'gold', alpha: 0.9 }],
        arrows: [{ from: [2.1, 0], to: [2.1, 1.449], color: 'accent', label: 'R' }, { from: [2.38, 0], to: [2.38, 1.19], color: 'warn', label: 'r' }],
      },
      caption: t`The gold strip sweeps out one washer. Both radii are measured from the axis of rotation (here the $x$-axis).`,
    },
    steps: [
      { label: 'Find the ends', text: t`$\sqrt{x} = \tfrac{x}{2} \iff x = \tfrac{x^2}{4} \iff x = 0$ or $x = 4$.` },
      { label: 'Radii', text: t`Between them $\sqrt{x} \ge \tfrac{x}{2}$, so a slice is a washer with outer radius $R = \sqrt{x}$ and inner radius $r = \tfrac{x}{2}$.` },
      { label: 'Set up', text: t`$V = \displaystyle\int_0^4 \pi\left[(\sqrt{x})^2 - \left(\tfrac{x}{2}\right)^2\right]dx = \pi\int_0^4\left(x - \frac{x^2}{4}\right)dx.$ Square each radius *before* subtracting.` },
      { label: 'Integrate', text: t`$\pi\left[\dfrac{x^2}{2} - \dfrac{x^3}{12}\right]_0^4 = \pi\left(8 - \dfrac{16}{3}\right) = \dfrac{8\pi}{3} \approx 8.38.$` },
      { label: 'Sense check', text: t`The washer solid is a paraboloid with a cone drilled out of it. The paraboloid alone (disks of radius $\sqrt{x}$) has volume $\pi\int_0^4 x\,dx = 8\pi$; the cone of radius 2 and length 4 has $\tfrac13\pi(2)^2(4) = \tfrac{16\pi}{3}$. Their difference is $\tfrac{8\pi}{3}$ ✓` },
    ],
    answer: t`$V = \dfrac{8\pi}{3} \approx 8.38$ cubic units`,
  },
  practice: [
    mcq({
      id: 'disk-or-washer', difficulty: 1,
      prompt: t`The region between $y = x^2$ and $y = 2x$ (for $0 \le x \le 2$) is rotated about the $x$-axis. What is the slice at $x$?`,
      choices: [
        t`A washer with $R = 2x$ and $r = x^2$`,
        t`A disk of radius $2x$`,
        t`A washer with $R = x^2$ and $r = 2x$`,
        t`A disk of radius $2x - x^2$`,
      ],
      answer: 0,
      why: {
        1: t`The region does not reach the axis between $0$ and $2$ — there is a gap under $y = x^2$, so every slice has a hole.`,
        2: t`The outer radius belongs to the edge *farther* from the axis: $2x \ge x^2$ on $[0, 2]$.`,
        3: t`Subtracting the radii first gives the wrong shape: the slice is a ring with area $\pi\left(R^2 - r^2\right)$, not a disk of radius $R - r$.`,
      },
      hints: ['Does the region touch the axis of rotation?', 'Which curve is farther from the axis?'],
      teach: 'A region that does not touch the axis gives washers: R is the distance to the far edge, r to the near edge.',
      explain: t`The slice is a ring with outer radius $2x$ and inner radius $x^2$, so $A(x) = \pi\left(4x^2 - x^4\right)$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 2.6], y: [-0.5, 4.6], curves: [{ fn: '2*x', color: 'accent', label: 'y = 2x', labelAt: 2.15 }, { fn: 'x^2', color: 'warn', label: 'y = x²', labelAt: 1.75 }], shade: [{ fn: '2*x', lower: 'x^2', from: 0, to: 2, color: 'accent', alpha: 0.2 }] } },
    }),
    expr({
      id: 'sphere', difficulty: 2,
      prompt: t`Rotating the half-disk under $y = \sqrt{a^2 - x^2}$ (for $-a \le x \le a$) about the $x$-axis gives a ball of radius $a$. Use disks to find its volume in terms of $a$.`,
      answer: '4/3 pi a^3',
      answerTeX: t`\tfrac43\pi a^3`,
      vars: { a: [0.5, 3] },
      errors: [
        { answer: '2/3 pi a^3', feedback: t`That is half the ball: integrate from $-a$ to $a$, not from $0$.` },
        { answer: 'pi a^3', feedback: t`Check the integral: $\int_{-a}^{a}\left(a^2 - x^2\right)dx = 2a^3 - \tfrac23 a^3 = \tfrac43 a^3$.` },
      ],
      hints: [t`Each slice is a disk of radius $R = \sqrt{a^2 - x^2}$, so its area is $\pi\left(a^2 - x^2\right)$.`, t`$V = \pi\int_{-a}^{a}\left(a^2 - x^2\right)dx$.`],
      teach: 'Square the radius before integrating: the square root disappears and the integral is a polynomial.',
      explain: t`$V = \pi\left[a^2x - \tfrac{x^3}{3}\right]_{-a}^{a} = \pi\left(\tfrac{2a^3}{3} + \tfrac{2a^3}{3}\right) = \tfrac43\pi a^3$ — the volume of a sphere, derived.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-1.6, 1.6], y: [-0.3, 1.3], equal: true, curves: [{ fn: 'sqrt(1 - x^2)', color: 'accent' }], shade: [{ fn: 'sqrt(1 - x^2)', from: -1, to: 1, color: 'accent', alpha: 0.2 }, { fn: 'sqrt(1 - x^2)', from: 0.45, to: 0.5, color: 'gold', alpha: 0.9 }], xticks: 4 }, caption: t`Drawn with $a = 1$. The gold strip sweeps out a disk of radius $\sqrt{a^2 - x^2}$.` },
    }),
    num({
      id: 'washer', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4), V = (2 * Math.PI * k ** 5) / 15;
        return {
          prompt: t`The region between $y = ${k}x$ and $y = x^2$ is rotated about the $x$-axis. Find the volume. Give 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          errors: [{ value: (Math.PI * k ** 5) / 30, feedback: t`You squared the difference $R - r$. The washer area is $\pi\left(R^2 - r^2\right)$, not $\pi(R - r)^2$.` }],
          hints: [t`The curves meet at $x = 0$ and $x = ${k}$. The line is farther from the axis: $R = ${k}x$, $r = x^2$.`, t`$V = \pi\int_0^{${k}}\left(${k * k}x^2 - x^4\right)dx$.`],
          teach: 'Washer area is π(R² − r²): square each radius, then subtract.',
          explain: t`$V = \pi\left[\tfrac{${k * k}}{3}x^3 - \tfrac{x^5}{5}\right]_0^{${k}} = \pi\left(\tfrac{${k ** 5}}{3} - \tfrac{${k ** 5}}{5}\right) = \tfrac{${2 * k ** 5}\pi}{15} \approx ${fmt(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, k + 0.6], y: [-0.5, k * k + 1.5], curves: [{ fn: `${k}*x`, color: 'accent' }, { fn: 'x^2', color: 'warn' }], shade: [{ fn: `${k}*x`, lower: 'x^2', from: 0, to: k, color: 'accent', alpha: 0.2 }], arrows: [{ from: [k / 2, 0], to: [k / 2, (k * k) / 2], color: 'accent', label: 'R' }, { from: [k / 2 + 0.12 * k, 0], to: [k / 2 + 0.12 * k, (0.62 * k) ** 2], color: 'warn', label: 'r' }] } },
        };
      },
    }),
    num({
      id: 'about-line', difficulty: 3,
      gen(r) {
        const c = r.int(1, 3), V = Math.PI * (1 / 5 + (2 * c) / 3);
        return {
          prompt: t`The region under $y = x^2$ and above the $x$-axis, for $0 \le x \le 1$, is rotated about the line $y = -${c}$. Find the volume. Give 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          errors: [
            { value: Math.PI / 5, feedback: t`That is the volume about the $x$-axis. Measure both radii from the line $y = -${c}$.` },
            { value: Math.PI * (1 / 5 + (2 * c) / 3 + c * c), feedback: t`The region does not reach the line $y = -${c}$: there is a hole of radius $${c}$. Subtract $\pi r^2$ with $r = ${c}$.` },
          ],
          hints: [
            t`Radii are distances from the axis $y = -${c}$: the top edge is $x^2 - (-${c}) = x^2 + ${c}$ away, the bottom edge (the $x$-axis) is $${c}$ away.`,
            t`So $R = x^2 + ${c}$ and $r = ${c}$.`,
            t`$V = \pi\int_0^1\left[\left(x^2 + ${c}\right)^2 - ${c * c}\right]dx = \pi\int_0^1\left(x^4 + ${2 * c}x^2\right)dx$.`,
          ],
          teach: 'When the axis is the line y = k, every radius is a distance from that line: |y − k|.',
          explain: t`$V = \pi\left[\tfrac{x^5}{5} + \tfrac{${2 * c}x^3}{3}\right]_0^1 = \pi\left(\tfrac15 + \tfrac{${2 * c}}{3}\right) \approx ${fmt(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.4, 1.6], y: [-c - 0.6, 1.4], curves: [{ fn: 'x^2', color: 'accent', label: 'y = x²', labelAt: 1.05 }], shade: [{ fn: 'x^2', from: 0, to: 1, color: 'accent', alpha: 0.22 }], hlines: [{ y: -c, color: 'bad', label: `axis y = −${c}` }], arrows: [{ from: [0.75, -c], to: [0.75, 0.5625], color: 'accent', label: 'R' }, { from: [0.45, -c], to: [0.45, 0], color: 'warn', label: 'r' }] } },
        };
      },
    }),
    num({
      id: 'squares', difficulty: 3,
      gen(r) {
        const a = r.int(1, 3), V = (16 * a ** 3) / 3;
        return {
          prompt: t`A solid has as its base the disk $x^2 + y^2 \le ${a * a}$. Every cross-section perpendicular to the $x$-axis is a **square** with one side across the base. Find the volume.`,
          answer: V, tol: { rel: 0.005 },
          errors: [{ value: (4 * a ** 3) / 3, feedback: t`The side of the square is the whole chord, from $y = -\sqrt{${a * a} - x^2}$ to $y = +\sqrt{${a * a} - x^2}$ — twice the half-chord.` }],
          hints: [
            t`At position $x$ the chord across the disk has length $2\sqrt{${a * a} - x^2}$. That is the side of the square.`,
            t`$A(x) = \left(2\sqrt{${a * a} - x^2}\right)^2 = 4\left(${a * a} - x^2\right)$, and $V = \int_{-${a}}^{${a}} A(x)\,dx$.`,
          ],
          teach: 'Slicing works for any known cross-section: find the area A(x) of the slice at x, then integrate it.',
          explain: t`$V = \int_{-${a}}^{${a}} 4\left(${a * a} - x^2\right)dx = 4\left(2\cdot${a ** 3} - \tfrac{2\cdot${a ** 3}}{3}\right) = \tfrac{${16 * a ** 3}}{3} \approx ${nice(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-a * 1.6, a * 1.6], y: [-a * 1.2, a * 1.2], equal: true, curves: [{ param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [0, '2*pi'], color: 'accent' }], shade: [{ fn: `sqrt(${a * a} - x^2)`, lower: `-sqrt(${a * a} - x^2)`, from: 0.35 * a, to: 0.4 * a, color: 'gold', alpha: 0.9 }] }, caption: 'The base seen from above. The gold chord is one side of the square slice that stands on it.' },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`The region under $y = x^2$ for $0 \le x \le 2$ is rotated about the **$y$-axis**. A student writes $V = \pi\displaystyle\int_0^2 \left(x^2\right)^2 dx = \frac{32\pi}{5}$. What is wrong?`,
      choices: [
        t`Slices must be perpendicular to the axis of rotation — horizontal here — so the radii must be written in $y$: $V = \pi\int_0^4\left(2^2 - (\sqrt{y})^2\right)dy = 8\pi$`,
        t`The integrand should be $\left(x^2\right)^2 - 2^2$`,
        t`Only the limits are wrong: they should run from $0$ to $4$`,
        t`Nothing: this is the volume about the $y$-axis`,
      ],
      answer: 0,
      why: {
        1: t`That keeps vertical slices, which are not perpendicular to the $y$-axis, and is negative besides.`,
        2: t`In $y$ the limits are $0$ to $4$, but the integrand must change as well: the radii are horizontal distances from the $y$-axis.`,
        3: t`$\pi\int_0^2 (x^2)^2\,dx$ uses vertical disks of radius $x^2$ — that is the solid made by rotating about the $x$-axis.`,
      },
      hints: ['Draw the axis of rotation. Which way must a disk or washer slice face?', t`A horizontal slice at height $y$ runs from $x = \sqrt{y}$ to $x = 2$. Which of those is the hole?`],
      teach: 'Disks and washers are always perpendicular to the axis of rotation, so the axis decides whether you integrate in x or in y.',
      explain: t`At height $y$ the slice is a washer with $R = 2$ and $r = \sqrt{y}$, so $V = \pi\int_0^4 (4 - y)\,dy = 8\pi$. The next lesson (cylindrical shells) gets the same answer while keeping $x$ as the variable.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-1, 3], y: [-0.4, 4.6], curves: [{ fn: 'x^2', color: 'accent', label: 'y = x²', labelAt: 1.5 }], shade: [{ fn: 'x^2', from: 0, to: 2, color: 'accent', alpha: 0.22 }, { fn: '2.6', lower: '2.45', from: 'sqrt(2.525)', to: 2, color: 'gold', alpha: 0.9 }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] }, caption: 'Rotating about the y-axis: the gold horizontal strip sweeps out a washer.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-washer', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), V = (Math.PI * k ** 4) / 6;
        const line = k === 1 ? 'x' : t`\dfrac{x}{${k}}`;
        return {
          prompt: t`The region between $y = \sqrt{x}$ and $y = ${line}$ is rotated about the $x$-axis. Find the volume. Give 3 significant figures.`,
          answer: V, tol: { rel: 0.005 },
          hints: [t`They meet at $x = 0$ and $x = ${k * k}$. $R = \sqrt{x}$ and $r = ${k === 1 ? 'x' : `x/${k}`}$.`],
          teach: 'Volume of revolution with washers: V = π∫(R² − r²) dx between the crossings.',
          explain: t`$V = \pi\int_0^{${k * k}}\left(x - \tfrac{x^2}{${k * k}}\right)dx = \pi\left(\tfrac{${k ** 4}}{2} - \tfrac{${k ** 4}}{3}\right) = \tfrac{${k ** 4}\pi}{6} \approx ${fmt(V)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, k * k + 1], y: [-0.4, k + 0.8], curves: [{ fn: 'sqrt(x)', color: 'accent' }, { fn: `x/${k}`, color: 'warn' }], shade: [{ fn: 'sqrt(x)', lower: `x/${k}`, from: 0, to: k * k, color: 'accent', alpha: 0.2 }] } },
        };
      },
    }),
    num({
      id: 'cp-nose-cone', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([0.3, 0.4, 0.5, 0.6]), L = r.pick([0.8, 1.0, 1.2, 1.5]);
        const V = (Math.PI * R * R * L) / 2;
        return {
          prompt: t`A sounding rocket’s paraboloid nose cone has radius $y = ${R}\sqrt{x/${L}}$ m at distance $x$ m behind its tip, for $0 \le x \le ${L}$. How much volume does it enclose? Give 3 significant figures.`,
          answer: V, units: 'm^3', tol: { rel: 0.005 },
          errors: [
            { value: (Math.PI * R * R * L) / 3, feedback: 'That is the volume of a cone with the same base and length. A paraboloid is fuller than a cone.' },
            { value: Math.PI * R * R * L, feedback: 'That is the whole cylinder around the nose cone.' },
          ],
          hints: [t`Each slice is a disk of radius $${R}\sqrt{x/${L}}$, area $\pi\cdot ${nice(R * R)}\,x/${L}$.`, t`$V = \pi\,\dfrac{${nice(R * R)}}{${L}}\displaystyle\int_0^{${L}} x\,dx$.`],
          teach: 'A paraboloid fills exactly half of the cylinder that encloses it.',
          explain: t`$V = \pi\,\dfrac{${nice(R * R)}}{${L}}\cdot\dfrac{${L}^2}{2} = \dfrac{\pi(${R})^2(${L})}{2} \approx ${fmt(V)}$ m³ — about ${fmt(V * 1000)} litres, half the enclosing cylinder.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1, L * 1.25], y: [-R * 1.4, R * 1.4], equal: true, xlabel: 'x (m)', curves: [{ fn: `${R}*sqrt(x/${L})`, color: 'accent' }, { fn: `-${R}*sqrt(x/${L})`, color: 'accent' }], shade: [{ fn: `${R}*sqrt(x/${L})`, lower: `-${R}*sqrt(x/${L})`, from: 0, to: L, color: 'accent', alpha: 0.18 }] }, caption: 'Side view of the nose cone, tip at the left. The axis of the rocket is the x-axis.' },
        };
      },
    }),
    mcq({
      id: 'cp-axis-boundary', difficulty: 2,
      prompt: t`The region between $y = x^2$ and the line $y = 4$ is rotated about the line $y = 4$. Which integral gives the volume?`,
      choices: [
        t`$\pi\displaystyle\int_{-2}^{2}\left(4 - x^2\right)^2dx$`,
        t`$\pi\displaystyle\int_{-2}^{2}\left(16 - x^4\right)dx$`,
        t`$\pi\displaystyle\int_{-2}^{2}x^4\,dx$`,
        t`$\pi\displaystyle\int_{-2}^{2}\left[4^2 - \left(4 - x^2\right)^2\right]dx$`,
      ],
      answer: 0,
      why: {
        1: t`Those are washers about the $x$-axis ($R = 4$, $r = x^2$) — a different solid.`,
        2: t`$x^2$ is the parabola’s distance from the $x$-axis, not from the line $y = 4$.`,
        3: t`Washers with $R = 4$ and $r = 4 - x^2$ belong to the region *below* the parabola, down to the $x$-axis. This region touches the axis $y = 4$, so it has no hole.`,
      },
      hints: [t`Measure distances from the line $y = 4$. How far is the parabola from it at $x$?`, 'Does the region touch the axis of rotation?'],
      teach: 'If the region touches the axis of rotation along its whole length, the slices are disks.',
      explain: t`The region’s top edge lies on the axis, so each slice is a disk of radius $4 - x^2$: $V = \pi\int_{-2}^{2}(4 - x^2)^2dx = \tfrac{512\pi}{15}$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-3, 3], y: [-0.5, 5], curves: [{ fn: 'x^2', color: 'accent', label: 'y = x²', labelAt: 1.6 }], shade: [{ fn: '4', lower: 'x^2', from: -2, to: 2, color: 'accent', alpha: 0.2 }], hlines: [{ y: 4, color: 'bad', label: 'axis y = 4' }] } },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.2 Determining Volumes by Slicing', url: 'https://openstax.org/books/calculus-volume-2/pages/2-2-determining-volumes-by-slicing' }],
});
