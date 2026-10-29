// The rectangular membrane, the physicist's way: separation of variables
// u = X(x)Y(y)T(t) gives modes sin(mπx/a) sin(nπy/b) cos ωt with
// ω = v|k|, k = (mπ/a, nπ/b) — each mode four plane waves bouncing between
// the edges, each a point of a lattice in k-space. Counting lattice points
// inside a quarter circle gives the number of modes below a frequency,
// N ≈ ab k²/4π − (a + b)k/2π (Weyl), growing as f² in 2D — the road to the
// blackbody spectrum. Worked example: a silicon-nitride membrane resonator.
// (Square membranes, degeneracy and Chladni mixtures are st-b B7.2's.)
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn } from './_wv.js';

const t = String.raw;

// the worked example: a high-stress silicon nitride membrane, 1.0 mm × 1.5 mm
const EX = (() => {
  const S = 1.0e9, rho = 3000, a = 1.0e-3, b = 1.5e-3, fmax = 2e6;
  const v = Math.sqrt(S / rho), f = (m, n) => (v / 2) * Math.hypot(m / a, n / b);
  let N = 0; for (let m = 1; m < 100; m++) for (let n = 1; n < 100; n++) if (f(m, n) < fmax) N++;
  const k = (2 * Math.PI * fmax) / v, lead = (a * b * k * k) / (4 * Math.PI), edge = ((a + b) * k) / (2 * Math.PI);
  return { S, rho, a, b, fmax, v, f11: f(1, 1), f21: f(2, 1), f12: f(1, 2), N, k, lead, edge, weyl: lead - edge, R: (k * a) / Math.PI };
})();

// k-space lattice for a membrane a × b (a = 1), modes inside radius R (units of π/a) highlighted
function latticePic(asp, R, caption, more = {}) {
  const pts = [];
  for (let m = 1; m <= Math.ceil(R) + 1; m++) for (let n = 1; n <= Math.ceil(R * asp) + 1; n++) {
    const x = m, y = n / asp, inside = Math.hypot(x, y) < R;
    if (x <= R + 1.2 && y <= R + 1.2) pts.push({ x, y, color: inside ? 'gold' : 'ink4', r: inside ? 3.5 : 2.5 });
  }
  return {
    type: 'graph',
    params: {
      x: [0, 2 * (R + 1.3)], y: [0, R + 1.3], equal: true, aspect: 'wide', xlabel: 'kₓ a/π', ylabel: 'k (y) a/π', xticks: 6, yticks: 6,
      curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, Math.PI / 2], color: 'accent', width: 2 }],
      points: more.points === false ? [] : pts, ...(more.params || {}),
    },
    caption,
  };
}

export default lesson({
  id: 'phys3750.W8.1',
  title: 'The rectangular membrane',
  minutes: 16, difficulty: 3,
  intro: t`A membrane under tension $T$ (N/m) with mass $\sigma$ per area obeys $u_{tt} = v^2(u_{xx} + u_{yy})$, $v = \sqrt{T/\sigma}$. Fix it along a rectangle $a \times b$ and try a product, $u = X(x)Y(y)\cos\omega t$. Dividing by $XY$ gives $X''/X + Y''/Y = -\omega^2/v^2$: a function of $x$ plus a function of $y$ equals a constant, so **each** is constant. Each factor is then a sine fitting its side:

$$\begin{gathered}u_{mn} = \sin\frac{m\pi x}{a}\,\sin\frac{n\pi y}{b}\,\cos\omega_{mn}t, \\ \omega_{mn} = v\sqrt{\Big(\frac{m\pi}{a}\Big)^2 + \Big(\frac{n\pi}{b}\Big)^2}\end{gathered}$$

Read it as a [plane wave](#/lesson/phys3750.W7.1): $\omega = v|\vec k|$ with $\vec k = (m\pi/a, n\pi/b)$. Each mode is four plane waves, $(\pm k_x, \pm k_y)$, bouncing between the edges, and the boundary allows only a **lattice** of wave vectors. Counting lattice points counts modes. (Square drums, their repeated frequencies and Chladni patterns are in [the vibrating membrane](#/lesson/st-b.B7.2).)`,
  symbols: [
    { tex: 'u(x, y, t)', text: 'the membrane’s displacement from flat, in m' },
    { tex: 'a,\\ b', text: 'the side lengths along $x$ and $y$, in m' },
    { tex: 'm,\\ n', text: 'whole numbers $\\ge 1$: the number of half-waves across $x$ and across $y$' },
    { tex: 'v = \\sqrt{T/\\sigma}', text: 'the wave speed: tension per unit length $T$ (N/m) over mass per unit area $\\sigma$ (kg/m²)' },
    { tex: '\\omega_{mn}', text: 'the angular frequency of mode $(m, n)$, in rad/s' },
  ],
  why: t`“Fit waves in a box, then count the allowed wave vectors” is how physics gets the blackbody spectrum, the heat capacity of solids, and the electron states in a metal.`,
  visual: {
    type: 'pde2-membrane',
    title: 'Modes of a rectangular panel',
    lead: t`One mode $(m, n)$ seen from above (blue up, orange down, nodal lines bold), and the frequency ladder of the lowest modes with ticks at whole multiples of the fundamental.`,
    tasks: [
      t`Step through $m$ and $n$: mode $(m, n)$ has $m - 1$ nodal lines across $x$ and $n - 1$ across $y$.`,
      t`Stretch the side ratio $b/a$ to 2: the modes with extra half-waves along the **long** side are the cheap ones, and crowd to the bottom of the ladder.`,
      t`Watch the ladder: the overtones do not land on the whole-number ticks — a membrane is not harmonic.`,
    ],
    params: { shape: 'rect', aspect: 1.5, m: 2, n: 1, controls: ['m', 'n', 'aspect'], count: 12 },
    caption: t`An ideal membrane: uniform tension, no stiffness, no air loading, small displacements (exaggerated). The panel spans $0 \le x \le a$, $0 \le y \le b$.`,
  },
  example: {
    prompt: t`A silicon nitride membrane resonator — of the kind used in optomechanics experiments — is ${tn(EX.a * 1e3)} mm × ${tn(EX.b * 1e3)} mm, with tensile stress $${tn(EX.S / 1e9)}$ GPa and density ${EX.rho} kg/m³. Find its fundamental, and how many modes it has below ${tn(EX.fmax / 1e6)} MHz.`,
    steps: [
      { label: 'Wave speed', text: t`Per unit area, tension is stress × thickness and mass is density × thickness, so the thickness cancels: $v = \sqrt{\text{stress}/\rho} = \sqrt{${tn(EX.S)}/${EX.rho}} = ${tn(EX.v)}$ m/s.` },
      { label: 'Fundamental', text: t`$f_{11} = \dfrac{v}{2}\sqrt{\dfrac{1}{a^2} + \dfrac{1}{b^2}} = ${tn(EX.f11 / 1e3)}$ kHz. Next come $f_{12} = ${tn(EX.f12 / 1e3)}$ kHz (the extra half-wave along the long side) and $f_{21} = ${tn(EX.f21 / 1e3)}$ kHz.` },
      { label: 'The lattice', text: t`Mode $(m, n)$ is the point $\vec k = (m\pi/a, n\pi/b)$; it lies below $f$ when $|\vec k| < 2\pi f/v = ${tn(EX.k)}$ rad/m. So count lattice points inside a quarter circle of that radius: by direct count, **${EX.N} modes**.` },
      { label: 'Estimate by area', text: t`Each point owns a cell of area $\pi^2/ab$. The quarter disc holds $\dfrac{\pi k^2/4}{\pi^2/ab} = \dfrac{abk^2}{4\pi} = ${tn(EX.lead)}$ cells; the points on the axes ($m = 0$ or $n = 0$) are not modes, which removes about $(a + b)k/2\pi = ${tn(EX.edge)}$: $${tn(EX.weyl)}$ — within one of the count.` },
      { label: 'Sense check', text: t`The count grows as $k^2 \propto f^2$: doubling the frequency range brings four times as many modes. In a 3D box it grows as $f^3$ — the count behind the Rayleigh–Jeans law for blackbody radiation.` },
    ],
    answer: t`$f_{11} \approx ${tn(EX.f11 / 1e3, 3)}$ kHz, and ${EX.N} modes below ${tn(EX.fmax / 1e6)} MHz; the area estimate $abk^2/4\pi - (a + b)k/2\pi$ gives $${tn(EX.weyl, 3)}$.`,
    visual: latticePic(EX.b / EX.a, EX.R, t`Allowed wave vectors of the $1 \times 1.5$ mm membrane in units of $\pi/a$: modes below ${tn(EX.fmax / 1e6)} MHz (gold) lie inside the quarter circle $|\vec k| = 2\pi f/v$.`),
  },
  practice: [
    num({
      id: 'f-mn', difficulty: 2,
      gen(r) {
        const T = r.pick([200, 500, 900]), s = r.pick([0.05, 0.1, 0.25]), a = r.pick([0.3, 0.4, 0.6]), b = r.pick([0.5, 0.8, 1.0]), m = r.int(1, 3), n = r.int(1, 3);
        const v = Math.sqrt(T / s), f = (v / 2) * Math.hypot(m / a, n / b);
        return {
          prompt: t`A rectangular loudspeaker diaphragm is modelled as a membrane ${a} m × ${b} m with tension ${T} N/m and ${s} kg/m². What is the frequency of its $(m, n) = (${m}, ${n})$ mode, in Hz?`,
          visual: { type: 'pde2-membrane', params: { shape: 'rect', aspect: Math.min(2, Math.max(0.4, +(b / a).toFixed(2))), m, n, ladder: false, readout: false, controls: [] }, caption: t`Mode (${m}, ${n}) from above; blue up, orange down, nodal lines bold.` },
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: v * Math.hypot(m / a, n / b), feedback: t`That is $f$ without the factor $\tfrac12$: $f = \omega/2\pi = \tfrac{v}{2}\sqrt{(m/a)^2 + (n/b)^2}$.` }, { value: (v / 2) * (m / a + n / b), feedback: t`Add the components in quadrature — $|\vec k|$ is a length.` }].filter((e) => Math.abs(e.value - f) > 0.02 * f),
          hints: [t`$v = \sqrt{T/\sigma}$.`, t`$f_{mn} = \dfrac{v}{2}\sqrt{(m/a)^2 + (n/b)^2}$.`],
          teach: t`$f_{mn} = \frac{v}{2}\sqrt{(m/a)^2 + (n/b)^2}$: the length of the wave vector, times $v/2\pi$.`,
          explain: t`$v = \sqrt{${T}/${s}} = ${tn(v)}$ m/s, so $f_{${m}${n}} = ${tn(f)}$ Hz.`,
        };
      },
    }),
    mcq({
      id: 'why-separate', difficulty: 2,
      prompt: t`Separating $u = X(x)Y(y)\cos\omega t$ gives $\dfrac{X''(x)}{X(x)} + \dfrac{Y''(y)}{Y(y)} = -\dfrac{\omega^2}{v^2}$. Why must $X''/X$ be a constant?`,
      visual: { type: 'pde2-membrane', params: { shape: 'rect', aspect: 1.5, m: 3, n: 2, ladder: false, readout: false, controls: [] }, caption: 'A product mode: the x-pattern is the same along every line of constant y.' },
      choices: [
        t`Changing $x$ alone cannot change the sum, because the other two terms do not depend on $x$`,
        t`Because the membrane is a rectangle, so $X$ and $Y$ must be the same function`,
        t`Because $X$ must vanish at both edges, which forces it to be a constant`,
        t`It need not be: $X''/X$ can vary as long as $Y''/Y$ varies in the same way`,
      ],
      answer: 0,
      why: {
        1: t`$X$ and $Y$ differ whenever $a \ne b$, and even then the argument has nothing to do with the shape.`,
        2: 'The edge conditions pick which constants are allowed; they are not why the ratio is constant.',
        3: t`$Y''/Y$ cannot respond to changes in $x$ — it depends only on $y$.`,
      },
      hints: [t`Hold $y$ fixed and vary $x$: which terms can change?`, t`Only $X''/X$ depends on $x$, and the right side is fixed.`],
      teach: 'If f(x) + g(y) = const for all x and y, then f and g are each constant: the heart of separation of variables.',
      explain: t`So $X'' = -k_x^2X$ and $Y'' = -k_y^2Y$ with $k_x^2 + k_y^2 = \omega^2/v^2$; the fixed edges then quantize $k_x = m\pi/a$ and $k_y = n\pi/b$.`,
    }),
    {
      type: 'point', id: 'k-lattice', difficulty: 2,
      gen(r) {
        const asp = r.pick([1.5, 2, 0.5]), m = r.int(1, 3), n = r.int(1, asp < 1 ? 2 : 3); // keep n/asp on the plotted range (y ≤ 5.9)
        return {
          prompt: t`A membrane has $b = ${asp}a$. In the plane of wave vectors, with both axes in units of $\pi/a$, drag the point to the wave vector of mode $(m, n) = (${m}, ${n})$.`,
          visual: latticePic(asp, 4.6, t`The plane of wave vectors, in units of $\pi/a$ (the arc is $|\vec k| = 4.6\pi/a$, for scale).`, { points: false, params: { drag: [{ key: 'p', x: 0.3, y: 0.3, snap: 0.05 }] } }),
          answer: { x: m, y: n / asp }, tol: { x: 0.15, y: 0.15 },
          instruction: 'Drag the point to the mode’s wave vector, then check.',
          hints: [t`$\vec k = (m\pi/a, n\pi/b)$.`, t`In units of $\pi/a$: $(m, n\,a/b) = (${m}, ${n}/${asp})$.`],
          teach: t`Fixed edges allow the wave vectors $(m\pi/a, n\pi/b)$: a rectangular lattice, spaced more closely along the longer side.`,
          explain: t`$(${m}, ${tn(n / asp)})$. Its length, $${tn(Math.hypot(m, n / asp))}\pi/a$, sets the frequency: $\omega = v|\vec k|$.`,
        };
      },
    },
    mcq({
      id: 'second-mode', difficulty: 2,
      prompt: t`A rectangular membrane has $b = 1.6a$ (it is longer along $y$). Which mode has the second-lowest frequency?`,
      visual: latticePic(1.6, 2.4, t`The lowest wave vectors for $b = 1.6a$, in units of $\pi/a$; the arc is for scale only.`, { points: false, params: { points: [[1, 1], [1, 2], [2, 1], [2, 2], [1, 3]].map(([m, n]) => ({ x: m, y: n / 1.6, color: 'gold', r: 4 })) } }),
      choices: ['(1, 2): two half-waves along the long side', '(2, 1): two half-waves along the short side', '(2, 2): two half-waves each way', '(1, 3): three half-waves along the long side'],
      answer: 0,
      why: {
        1: t`An extra half-wave across the **short** side costs more: $k_x$ jumps by $\pi/a$, but $k_y$ only by $\pi/b$.`,
        2: t`$(2, 2)$ has the longer wave vector of either single change: $\sqrt{4 + 4/1.6^2}$ against $\sqrt{1 + 4/1.6^2}$.`,
        3: t`$(1, 3)$ gives $\sqrt{1 + 9/2.56} = ${tn(Math.sqrt(1 + 9 / 2.56))}$, above $(1, 2)$’s $${tn(Math.sqrt(1 + 4 / 2.56))}$.`,
      },
      hints: [t`Compare $|\vec k|^2 \propto m^2 + (n\,a/b)^2$ for each.`, t`$(1, 2)$: $1 + (2/1.6)^2 = ${tn(1 + 4 / 2.56)}$; $(2, 1)$: $4 + (1/1.6)^2 = ${tn(4 + 1 / 2.56)}$.`],
      teach: 'Extra half-waves are cheapest along the longest side, where the lattice is densest.',
      explain: t`$|\vec k|^2$ in units of $(\pi/a)^2$: $(1, 1)$ ${tn(1 + 1 / 2.56)}, $(1, 2)$ ${tn(1 + 4 / 2.56)}, $(2, 1)$ ${tn(4 + 1 / 2.56)}. So $f_{12}/f_{11} = ${tn(Math.sqrt((1 + 4 / 2.56) / (1 + 1 / 2.56)))}$.`,
    }),
    num({
      id: 'weyl', difficulty: 3,
      gen(r) {
        const a = r.pick([0.4, 0.5, 0.8]), b = r.pick([0.6, 1.0, 1.2]), v = r.pick([40, 60, 80]), f = r.pick([400, 600, 1000]);
        const k = (2 * Math.PI * f) / v, est = (a * b * k * k) / (4 * Math.PI) - ((a + b) * k) / (2 * Math.PI);
        return {
          prompt: t`A drum panel ${a} m × ${b} m has $v = ${v}$ m/s. Estimate how many modes it has below ${f} Hz using $N \approx \dfrac{abk^2}{4\pi} - \dfrac{(a + b)k}{2\pi}$, with $k = 2\pi f/v$.`,
          visual: latticePic(b / a, 5, t`Schematic: allowed wave vectors (units of $\pi/a$) inside a quarter circle. For this panel the circle $|\vec k| = 2\pi f/v$ is much larger, holding many more points.`),
          answer: est, tol: { rel: 0.02 },
          errors: [{ value: (a * b * k * k) / (4 * Math.PI), feedback: t`Subtract the edge term $(a + b)k/2\pi$: lattice points on the axes ($m = 0$ or $n = 0$) are not modes.` }, { value: (a * b * k * k) / Math.PI, feedback: t`Only a **quarter** circle counts: $m$ and $n$ are positive.` }],
          hints: [t`$k = 2\pi(${f})/${v} = ${tn(k)}$ rad/m.`, t`$abk^2/4\pi = ${tn((a * b * k * k) / (4 * Math.PI))}$; subtract $(a + b)k/2\pi$.`],
          teach: t`Mode counting: (quarter-disc area)/(cell area $\pi^2/ab$), minus the points on the axes: $N \approx abk^2/4\pi - (a + b)k/2\pi$.`,
          explain: t`$N \approx ${tn((a * b * k * k) / (4 * Math.PI))} - ${tn(((a + b) * k) / (2 * Math.PI))} = ${tn(est)}$. The count depends on the area and perimeter, not on the exact shape — Weyl’s law.`,
        };
      },
    }),
    {
      type: 'slider', id: 'match-modes', difficulty: 3,
      prompt: t`Change the side ratio $b/a$ until modes $(1, 2)$ and $(3, 1)$ have the same frequency (their stems on the ladder meet).`,
      visual: { type: 'pde2-membrane', params: { shape: 'rect', aspect: 1, m: 3, n: 1, controls: ['aspect'], count: 8, readout: false }, caption: 'Mode (3, 1) from above, and the ladder of the lowest 8 modes labelled (m, n).' },
      param: 'aspect', answer: [0.59, 0.64],
      instruction: 'Set the side ratio, then check.',
      hints: [t`Equal frequencies need $1 + 4(a/b)^2 = 9 + (a/b)^2$.`, t`$3(a/b)^2 = 8$, so $b/a = \sqrt{3/8}$.`],
      teach: 'The side ratio decides the order of the ladder: the right ratio makes two different modes ring at one frequency.',
      explain: t`$b/a = \sqrt{3/8} = ${tn(Math.sqrt(3 / 8))}$: then $(1, 2)$ — two half-waves along the now **short** $b$ — costs as much as three along $a$.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-sin', difficulty: 3, transfer: true,
      gen(r) {
        const S = r.pick([0.8, 1.0, 1.1]) * 1e9, rho = 3000, a = r.pick([0.5, 1.0, 2.0]) * 1e-3, q = r.pick([1, 1.25, 2]);
        const b = q * a, v = Math.sqrt(S / rho), f = (v / 2) * Math.hypot(1 / a, 1 / b);
        return {
          prompt: t`A silicon nitride membrane for a precision accelerometer is ${tn(a * 1e3)} mm × ${tn(b * 1e3)} mm, with tensile stress ${tn(S / 1e9)} GPa and density 3000 kg/m³. What is its fundamental frequency, in kHz?`,
          visual: { type: 'pde2-membrane', params: { shape: 'rect', aspect: q, m: 1, n: 1, ladder: false, readout: false, controls: [] }, caption: 'The fundamental (1, 1) from above.' },
          answer: f / 1000, units: 'kHz', tol: { rel: 0.01 },
          errors: [{ value: (v * Math.hypot(1 / a, 1 / b)) / 1000, feedback: t`$f = \omega/2\pi$ brings a factor $\tfrac12$: $f_{11} = \tfrac v2\sqrt{1/a^2 + 1/b^2}$.` }, { value: (Math.sqrt(S / rho / 1e3) / 2) * Math.hypot(1 / a, 1 / b) / 1000, feedback: 'Use SI units throughout: stress in Pa, density in kg/m³.' }],
          hints: [t`$v = \sqrt{\text{stress}/\rho}$ — the thickness cancels.`, t`$f_{11} = \tfrac{v}{2}\sqrt{1/a^2 + 1/b^2}$ with $a, b$ in m.`],
          teach: t`For a stressed film, $v = \sqrt{\text{stress}/\rho}$, independent of thickness; then $f_{11} = \frac v2\sqrt{a^{-2} + b^{-2}}$.`,
          explain: t`$v = ${tn(v)}$ m/s; $f_{11} = ${tn(f / 1000)}$ kHz. Smaller membranes ring higher, in proportion to $1/\text{size}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-count-growth', difficulty: 3,
      prompt: t`The number of modes of a membrane below frequency $f$ grows as $f^2$. How does the number of sound modes of a rectangular **room** (a 3D box) below $f$ grow at high frequency?`,
      visual: latticePic(1.3, 5.2, t`The 2D lattice of allowed wave vectors and a quarter circle; in 3D it becomes a cubic lattice and an eighth of a sphere.`),
      choices: [t`As $f^3$: the lattice points fill an eighth of a sphere of radius $2\pi f/v$`, t`As $f^2$: modes always grow as the square of frequency`, t`As $f$: each added frequency adds the same number of modes`, t`As $f^{3/2}$: one and a half dimensions are added each time`],
      answer: 0,
      why: {
        1: 'The power is the dimension of the lattice: area in 2D (f²), volume in 3D (f³).',
        2: 'Linear growth is a string’s (1D): modes nπ/L equally spaced.',
        3: 'The count goes as volume in k-space: k³, so f³.',
      },
      hints: ['In 3D the allowed wave vectors are (lπ/a, mπ/b, nπ/c).', t`Count the points inside $|\vec k| < 2\pi f/v$: volume $\tfrac18\cdot\tfrac43\pi k^3$.`],
      teach: t`Mode counts grow as $f^d$ in $d$ dimensions: $f$ for a string, $f^2$ for a membrane, $f^3$ for a room or a cavity.`,
      explain: t`$N \approx Vk^3/6\pi^2$ in a box of volume $V$. For light in a cavity (two polarizations per wave vector), giving each mode an energy $k_BT$ yields the Rayleigh–Jeans spectrum, which rises as $f^2$ without limit — the ultraviolet catastrophe that Planck’s quanta cured.`,
    }),
    num({
      id: 'cp-ratio', difficulty: 2,
      gen(r) {
        const q = r.pick([1.2, 1.5, 1.8, 2]);
        const ratio = Math.hypot(1, 2 / q) / Math.hypot(1, 1 / q);
        return {
          prompt: t`A rectangular membrane has $b = ${q}a$. What is the ratio $f_{12}/f_{11}$?`,
          visual: { type: 'pde2-membrane', params: { shape: 'rect', aspect: q, m: 1, n: 2, ladder: false, readout: false, controls: [] }, caption: 'Mode (1, 2): two half-waves along y, the side of length b.' },
          answer: ratio, tol: { rel: 0.005 },
          errors: [{ value: 2, feedback: 'That would be a string’s second harmonic. On a membrane only one component of the wave vector doubles.' }, { value: Math.hypot(2, 1 / q) / Math.hypot(1, 1 / q), feedback: t`Mode $(1, 2)$ doubles $n$, the half-waves along $y$ (side $b$), not $m$.` }],
          hints: [t`$f_{mn} \propto \sqrt{m^2 + (n\,a/b)^2}$.`, t`$\dfrac{\sqrt{1 + 4/${q}^2}}{\sqrt{1 + 1/${q}^2}}$.`],
          teach: 'Membrane overtones are not whole multiples: only one component of the wave vector steps up at a time.',
          explain: t`$\sqrt{1 + ${tn(4 / (q * q))}}/\sqrt{1 + ${tn(1 / (q * q))}} = ${tn(ratio, 4)}$ — not 2.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 11–12 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Thompson et al., Strong dispersive coupling of a high-finesse cavity to a micromechanical membrane, Nature 452, 72 (2008)', url: 'https://doi.org/10.1038/nature06715' },
  ],
});
