// Moments and centres of mass: point masses, then centroids of plates (laminae)
// from strip moments, with symmetry shortcuts and Pappus's theorem.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-1.8',
  title: 'Moments and centres of mass',
  minutes: 12, difficulty: 3,
  intro: t`The **centre of mass** is the balance point: the average position, weighted by mass. For point masses $m_i$ at positions $x_i$ on a line, $\bar x = \sum m_i x_i / \sum m_i$. For a thin flat plate of uniform density (a **lamina**) filling the region between $y = f(x)$ above and $y = g(x)$ below, slice it into vertical strips. A strip at $x$ has area $(f - g)\,dx$, sits at distance $x$ from the $y$-axis, and has its own centre at height $\tfrac12(f + g)$. Weighting by area gives the **centroid**:

$$\bar x = \frac{1}{A}\int_a^b x\,\big[f(x) - g(x)\big]\,dx, \qquad \bar y = \frac{1}{A}\int_a^b \tfrac12\left[f(x)^2 - g(x)^2\right]dx$$

where $A = \int_a^b [f - g]\,dx$. The uniform density cancels, so the centroid depends only on the shape.`,
  symbols: [
    { tex: '\\bar x,\\ \\bar y', text: 'the coordinates of the **centroid** — the centre of mass of a uniform plate (m)' },
    { tex: 'A', text: 'the area of the region (m²)' },
    { tex: 'M_y = \\int x\\,[f - g]\\,dx', text: 'the **moment about the $y$-axis**: each strip’s area times its distance $x$ from that axis. $\\bar x = M_y/A$' },
    { tex: 'M_x = \\int \\tfrac12[f^2 - g^2]\\,dx', text: 'the **moment about the $x$-axis**: each strip’s area $(f - g)\\,dx$ times its centre height $\\tfrac12(f + g)$. $\\bar y = M_x/A$' },
    { tex: 'f(x),\\ g(x)', text: 'the top and bottom boundaries of the plate' },
    { tex: 'm_i,\\ x_i', text: 'for separate point masses: each mass (kg) and its position (m)' },
  ],
  why: t`A rocket is stable only if its centre of mass sits ahead of its centre of pressure; satellites are balanced about their centre of mass so thrusters do not set them spinning.`,
  visual: {
    type: 'graph',
    title: 'Where a plate balances',
    lead: t`A uniform plate shaped like the region under $y = 2\left(\tfrac{x}{4}\right)^p$ for $0 \le x \le 4$. The gold dot is its centroid; a pin through it would balance the plate. The thin gold strip and its centre show the pieces that the moment integrals add up.`,
    tasks: [
      t`At $p = 1$ the plate is a right triangle: its centroid is at $\left(\tfrac83, \tfrac23\right)$ — two-thirds of the way along and a third of the way up.`,
      'Raise p: the left part of the plate thins out and the area crowds toward x = 4, so the centroid moves right and down.',
      t`Move the strip: its own centre is at half its height, $\tfrac12 f(x)$. That is why $\bar y$ averages $\tfrac12 f^2$ rather than $f$.`,
    ],
    params: {
      x: [-0.4, 4.6], y: [-0.3, 2.45], equal: true,
      sliders: [
        { key: 'p', label: 'Shape exponent $p$', min: 0.2, max: 3, step: 0.05, value: 1, explain: t`$p = 1$: a triangle; $p < 1$: bulging; $p > 1$: hollowed.` },
        { key: 'xs', label: 'Strip at $x$', min: 0.1, max: 3.9, step: 0.05, value: 1.5, explain: 'A sample vertical strip of the plate.' },
      ],
      curves: [{ fn: '2*(x/4)^p', color: 'accent', domain: [0, 4] }],
      shade: [
        { fn: '2*(x/4)^p', from: 0, to: 4, color: 'accent', alpha: 0.22 },
        { fn: '2*(x/4)^p', from: 'xs', to: 'xs + 0.07', color: 'gold', alpha: 0.75 },
      ],
      vlines: [{ x: '4*(p + 1)/(p + 2)', color: 'gold' }],
      hlines: [{ y: '(p + 1)/(2*p + 1)', color: 'gold' }],
      points: [
        { x: 'xs + 0.035', y: '(xs/4)^p', color: 'warn', r: 3.5, label: 'strip centre' },
        { x: '4*(p + 1)/(p + 2)', y: '(p + 1)/(2*p + 1)', color: 'gold', r: 6, label: 'centroid' },
      ],
      readouts: [
        { label: t`area $A$`, expr: '8/(p + 1)', digits: 3 },
        { label: t`$\bar x$`, expr: '4*(p + 1)/(p + 2)', digits: 3 },
        { label: t`$\bar y$`, expr: '(p + 1)/(2*p + 1)', digits: 3 },
      ],
    },
    caption: t`The centroid comes from the exact formulas $\bar x = \tfrac{4(p + 1)}{p + 2}$ and $\bar y = \tfrac{p + 1}{2p + 1}$, worked out from the integrals above. The strip is drawn wider than a true $dx$.`,
  },
  example: {
    prompt: t`Find the centroid of the region between $y = x$ and $y = x^2$.`,
    visual: {
      type: 'graph',
      params: { aspect: 'wide', x: [-0.2, 1.5], y: [-0.1, 1.15], equal: true, curves: [{ fn: 'x', color: 'accent', label: 'y = x', labelAt: 1.1, domain: [0, 1.15] }, { fn: 'x^2', color: 'warn', label: 'y = x²', labelAt: 1.02, domain: [0, 1.06] }], shade: [{ fn: 'x', lower: 'x^2', from: 0, to: 1, color: 'accent', alpha: 0.22 }, { fn: 'x', lower: 'x^2', from: 0.65, to: 0.69, color: 'gold', alpha: 0.85 }], points: [{ x: 0.67, y: (0.67 + 0.67 * 0.67) / 2, color: 'warn', r: 3.5 }, { x: 0.5, y: 0.4, color: 'gold', r: 6, label: 'centroid' }] },
      caption: t`The gold strip at $x$ has area $(x - x^2)\,dx$ and centre height $\tfrac12(x + x^2)$ (orange dot).`,
    },
    steps: [
      { label: 'Area', text: t`The curves meet at $x = 0$ and $1$, with $y = x$ on top: $A = \displaystyle\int_0^1 (x - x^2)\,dx = \tfrac12 - \tfrac13 = \tfrac16.$` },
      { label: 'Moment about the y-axis', text: t`$M_y = \displaystyle\int_0^1 x(x - x^2)\,dx = \tfrac13 - \tfrac14 = \tfrac{1}{12}$, so $\bar x = \dfrac{1/12}{1/6} = \tfrac12.$` },
      { label: 'Moment about the x-axis', text: t`Each strip’s centre is at $\tfrac12(x + x^2)$, so $M_x = \displaystyle\int_0^1 \tfrac12\left(x^2 - x^4\right)dx = \tfrac12\left(\tfrac13 - \tfrac15\right) = \tfrac{1}{15}$, and $\bar y = \dfrac{1/15}{1/6} = \tfrac25.$` },
      { label: 'Sense check', text: t`The strip heights $x - x^2 = x(1 - x)$ are symmetric about $x = \tfrac12$, so $\bar x = \tfrac12$ had to come out. At $x = \tfrac12$ the region spans $0.25 \le y \le 0.5$, and $\bar y = 0.4$ sits inside it.` },
    ],
    answer: t`$(\bar x, \bar y) = \left(\tfrac12, \tfrac25\right)$`,
  },
  practice: [
    num({
      id: 'stage-cg', difficulty: 1,
      gen(r) {
        const m1 = r.pick([100, 120, 150]), m2 = r.pick([60, 80]), m3 = r.pick([30, 40, 50]);
        const x1 = 0.5, x2 = r.pick([2.0, 2.5]), x3 = r.pick([3.5, 4.0]);
        const xb = (m1 * x1 + m2 * x2 + m3 * x3) / (m1 + m2 + m3);
        return {
          prompt: t`Along a small upper stage, measured from its tail: the engine (${m1} kg) is centred at ${x1} m, the propellant tank (${m2} kg) at ${x2} m and the payload (${m3} kg) at ${x3} m. Where is the stage’s centre of mass?`,
          answer: xb, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (x1 + x2 + x3) / 3, feedback: 'That is the plain average of the positions. Heavier parts pull the balance point toward themselves: weight each position by its mass.' }],
          hints: [t`$\bar x = \dfrac{m_1x_1 + m_2x_2 + m_3x_3}{m_1 + m_2 + m_3}$.`],
          teach: 'The centre of mass is the mass-weighted average position.',
          explain: t`$\bar x = \dfrac{${m1}(${x1}) + ${m2}(${x2}) + ${m3}(${x3})}{${m1 + m2 + m3}} = \dfrac{${nice(m1 * x1 + m2 * x2 + m3 * x3)}}{${m1 + m2 + m3}} \approx ${fmt(xb)}$ m from the tail — pulled toward the heavy engine.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 4.6], y: [-0.6, 0.8], xlabel: 'x (m)', xticks: 6, curves: [{ fn: '0', color: 'ink3', domain: [0, 4.3] }], points: [{ x: x1, y: 0, r: 3 + m1 / 25, color: 'accent', label: `${m1} kg` }, { x: x2, y: 0, r: 3 + m2 / 25, color: 'accent', label: `${m2} kg` }, { x: x3, y: 0, r: 3 + m3 / 25, color: 'accent', label: `${m3} kg` }] }, caption: 'The three parts along the stage’s axis (dot size grows with mass).' },
        };
      },
    }),
    {
      type: 'point', id: 'drag-centroid', difficulty: 2,
      prompt: t`Drag the point to the centroid of the triangle with corners $(0, 0)$, $(4, 0)$ and $(1, 3)$.`,
      instruction: 'Drag the point to where the triangle would balance on a pin, then check.',
      answer: { x: 5 / 3, y: 1 }, tol: { x: 0.2, y: 0.15 },
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.5, 4.8], y: [-0.4, 3.4], equal: true, curves: [{ fn: 'min(3*x, 4 - x)', color: 'accent', domain: [0, 4] }], shade: [{ fn: 'min(3*x, 4 - x)', from: 0, to: 4, color: 'accent', alpha: 0.22 }], drag: [{ key: 'p', x: 3.6, y: 2.6 }] } },
      hints: ['The centroid of a triangle is where its three medians meet.', 'That point is the average of the three corners: add the x-coordinates and divide by 3, and the same for y.'],
      teach: 'A triangle’s centroid is the average of its three vertices, one third of the way up from each side.',
      explain: t`$\bar x = \tfrac{0 + 4 + 1}{3} = \tfrac53$ and $\bar y = \tfrac{0 + 0 + 3}{3} = 1$. The integrals give the same: $A = 6$, $M_y = 10$, $M_x = 6$.`,
    },
    num({
      id: 'sqrt-xbar', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 4, 9, 16]);
        return {
          prompt: t`Find $\bar x$ for the uniform plate under $y = \sqrt{x}$, $0 \le x \le ${b}$.`,
          answer: (3 * b) / 5, tol: { rel: 0.005 },
          errors: [{ value: b / 2, feedback: t`That is the middle of the interval. The plate is taller on the right, so its area — and its balance point — sit further right.` }],
          hints: [t`$A = \int_0^{${b}}\sqrt{x}\,dx = \tfrac23 (${b})^{3/2}$.`, t`$M_y = \int_0^{${b}} x\sqrt{x}\,dx = \tfrac25 (${b})^{5/2}$, and $\bar x = M_y/A$.`],
          teach: 'x̄ is the area-weighted average of x: the moment ∫x(f − g)dx divided by the area.',
          explain: t`$\bar x = \dfrac{\tfrac25 (${b})^{5/2}}{\tfrac23 (${b})^{3/2}} = \tfrac35(${b}) = ${nice((3 * b) / 5)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.08 * b, b * 1.12], y: [-0.06 * Math.sqrt(b), Math.sqrt(b) * 1.2], curves: [{ fn: 'sqrt(x)', color: 'accent', domain: [0, b] }], shade: [{ fn: 'sqrt(x)', from: 0, to: b, color: 'accent', alpha: 0.22 }] } },
        };
      },
    }),
    num({
      id: 'sqrt-ybar', difficulty: 3,
      gen(r) {
        const b = r.pick([1, 4, 9, 16]), yb = (3 / 8) * Math.sqrt(b);
        return {
          prompt: t`Find $\bar y$ for the uniform plate under $y = \sqrt{x}$, $0 \le x \le ${b}$.`,
          answer: yb, tol: { rel: 0.005 },
          errors: [
            { value: 2 * yb, feedback: t`Missing the $\tfrac12$: a strip’s centre is at half its height, so $M_x = \int \tfrac12 f(x)^2\,dx$.` },
            { value: (3 * b) / 5, feedback: t`That is $\bar x$. For $\bar y$, weight each strip by the height of its centre, $\tfrac12\sqrt{x}$.` },
          ],
          hints: [t`$M_x = \int_0^{${b}}\tfrac12\left(\sqrt{x}\right)^2dx = \int_0^{${b}}\tfrac{x}{2}\,dx$.`, t`$A = \tfrac23(${b})^{3/2}$ and $\bar y = M_x/A$.`],
          teach: 'For ȳ each vertical strip counts at its own centre height, half way up: M_x = ∫ ½(f² − g²) dx.',
          explain: t`$M_x = \tfrac{${b * b}}{4}$ and $A = \tfrac23(${b})^{3/2} = ${nice((2 / 3) * b ** 1.5)}$, so $\bar y = ${fmt(yb, 4)}$ — less than half of the plate’s greatest height $${Math.sqrt(b)}$, because the plate is thin on the left.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.08 * b, b * 1.12], y: [-0.06 * Math.sqrt(b), Math.sqrt(b) * 1.2], curves: [{ fn: 'sqrt(x)', color: 'accent', domain: [0, b] }], shade: [{ fn: 'sqrt(x)', from: 0, to: b, color: 'accent', alpha: 0.22 }] } },
        };
      },
    }),
    mcq({
      id: 'symmetry', difficulty: 2,
      prompt: t`Where is the centroid of the region between $y = 4 - x^2$ and the $x$-axis?`,
      choices: [t`$\left(0, \tfrac85\right)$`, t`$(0, 2)$`, t`$\left(0, \tfrac43\right)$`, t`$\left(0, \tfrac{16}{5}\right)$`],
      answer: 0,
      why: {
        1: 'Halfway up the bounding rectangle — but the region is wide at the bottom and narrow at the top, so its area sits lower.',
        2: 'One third of the height is the rule for a triangle; a parabolic cap is fuller than a triangle near its top.',
        3: t`That forgets the $\tfrac12$ in $M_x = \int\tfrac12 f^2\,dx$ — twice too high, outside the region’s middle.`,
      },
      hints: [t`The region is symmetric about the $y$-axis, so $\bar x = 0$.`, t`$A = \tfrac{32}{3}$ and $M_x = \int_{-2}^{2}\tfrac12(4 - x^2)^2dx = \tfrac{256}{15}$.`],
      teach: 'A line of symmetry always contains the centroid — use it before integrating.',
      explain: t`$\bar y = \dfrac{256/15}{32/3} = \tfrac85 = 1.6$: below the halfway height of 2, because the region is widest at the bottom.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-3.2, 3.2], y: [-0.3, 4.4], equal: true, curves: [{ fn: '4 - x^2', color: 'accent', domain: [-2.05, 2.05] }], shade: [{ fn: '4 - x^2', from: -2, to: 2, color: 'accent', alpha: 0.22 }] } },
    }),
    expr({
      id: 'half-disc', difficulty: 3,
      prompt: t`Find $\bar y$ for a uniform half-disc of radius $a$: the region under $y = \sqrt{a^2 - x^2}$, $-a \le x \le a$. Give it in terms of $a$.`,
      answer: '4a/(3 pi)', answerTeX: t`\dfrac{4a}{3\pi}`,
      vars: { a: [0.5, 3] },
      errors: [
        { answer: 'a/2', feedback: 'Halfway up is too high: a half-disc is widest along its flat edge, so its area sits low.' },
        { answer: '8a/(3 pi)', feedback: t`Missing the $\tfrac12$ in $M_x = \int \tfrac12 f^2\,dx$.` },
        { answer: '2a/(3 pi)', feedback: t`The area of a *half*-disc is $\tfrac12\pi a^2$, not $\pi a^2$.` },
      ],
      hints: [t`$M_x = \int_{-a}^{a}\tfrac12\left(a^2 - x^2\right)dx = \tfrac23 a^3$.`, t`$A = \tfrac12\pi a^2$, so $\bar y = M_x/A$.`],
      teach: 'For a half-disc, ȳ = 4a/(3π) ≈ 0.42a — a result worth remembering.',
      explain: t`$\bar y = \dfrac{\tfrac23 a^3}{\tfrac12\pi a^2} = \dfrac{4a}{3\pi} \approx 0.424a$. Check with Pappus: revolving the half-disc about its flat edge moves the centroid a distance $2\pi\bar y$ and sweeps a ball of volume $2\pi\bar y\cdot\tfrac12\pi a^2 = \tfrac43\pi a^3$ ✓`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-1.7, 1.7], y: [-0.15, 1.2], equal: true, curves: [{ fn: 'sqrt(1 - x^2)', color: 'accent', domain: [-1, 1] }], shade: [{ fn: 'sqrt(1 - x^2)', from: -1, to: 1, color: 'accent', alpha: 0.22 }] }, caption: 'Drawn with a = 1.' },
    }),
    num({
      id: 'pappus-torus', difficulty: 3,
      gen(r) {
        const R = r.pick([1.0, 1.2, 1.5]), rr = r.pick([0.3, 0.4]);
        const V = 2 * Math.PI * R * Math.PI * rr * rr;
        return {
          prompt: t`**Pappus’s theorem:** when a flat region of area $A$ is revolved about an axis in its plane that does not cut through it, the volume swept out is $V = 2\pi d\,A$, where $d$ is the distance from the region’s centroid to the axis.

A toroidal (doughnut-shaped) propellant tank is made by revolving a circle of radius ${rr} m about an axis ${R} m from the circle’s centre. Find its volume.`,
          answer: V, units: 'm^3', tol: { rel: 0.005 },
          errors: [{ value: R * Math.PI * rr * rr, feedback: t`The centroid travels a full circle of circumference $2\pi d$, not a distance $d$.` }],
          hints: [t`The centroid of the disc is its centre, ${R} m from the axis. Its area is $\pi(${rr})^2$.`, t`$V = 2\pi(${R})\cdot\pi(${rr})^2$.`],
          teach: 'Pappus: volume of revolution = (distance travelled by the centroid) × (area).',
          explain: t`$V = 2\pi(${R})\cdot\pi(${rr})^2 = 2\pi^2(${R})(${rr})^2 \approx ${fmt(V)}$ m³. Shells give the same answer, with much more work.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.4, R + rr + 0.6], y: [-rr * 1.8, rr * 1.8], equal: true, curves: [{ param: [`${R} + ${rr}*cos(t)`, `${rr}*sin(t)`], t: [0, '2*pi'], color: 'accent' }], shade: [{ fn: `sqrt(${rr * rr} - (x - ${R})^2)`, lower: `-sqrt(${rr * rr} - (x - ${R})^2)`, from: R - rr, to: R + rr, color: 'accent', alpha: 0.22 }], points: [{ x: R, y: 0, color: 'gold', label: 'centroid' }], vlines: [{ x: 0, color: 'bad', label: 'axis' }], arrows: [{ from: [0, -rr * 1.4], to: [R, -rr * 1.4], color: 'gold', label: 'd' }] }, caption: 'The circle and the axis it is revolved about.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ybar', difficulty: 2,
      gen(r) {
        const b = r.int(1, 3), yb = (3 * b * b) / 10;
        return {
          prompt: t`Find $\bar y$ for the uniform plate under $y = x^2$, $0 \le x \le ${b}$.`,
          answer: yb, tol: { rel: 0.005 },
          hints: [t`$A = \tfrac{${b ** 3}}{3}$ and $M_x = \int_0^{${b}}\tfrac12 x^4\,dx$.`],
          teach: 'ȳ = (1/A) ∫ ½ f(x)² dx for a plate between y = f(x) and the x-axis.',
          explain: t`$M_x = \tfrac{${b ** 5}}{10}$, so $\bar y = \dfrac{${b ** 5}/10}{${b ** 3}/3} = \tfrac{3(${b * b})}{10} = ${nice(yb)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1 * b, b * 1.15], y: [-0.06 * b * b, b * b * 1.15], curves: [{ fn: 'x^2', color: 'accent', domain: [0, b * 1.05] }], shade: [{ fn: 'x^2', from: 0, to: b, color: 'accent', alpha: 0.22 }] } },
        };
      },
    }),
    num({
      id: 'cp-model-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const motor = r.pick([0.15, 0.18, 0.24]);
        const parts = [[0.12, 0.1], [0.35, 0.45], [motor, 0.8], [0.05, 0.85]];
        const M = parts.reduce((s, [m]) => s + m, 0), xb = parts.reduce((s, [m, x]) => s + m * x, 0) / M;
        return {
          prompt: t`A model rocket, measured from its nose tip: nose cone 0.12 kg at 0.10 m, body tube and payload 0.35 kg at 0.45 m, motor ${motor} kg at 0.80 m, fins 0.05 kg at 0.85 m. Where is its centre of mass? (Its centre of pressure is at 0.70 m; the rocket is stable if the centre of mass is ahead of it, roughly a body diameter or more.)`,
          answer: xb, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (0.1 + 0.45 + 0.8 + 0.85) / 4, feedback: 'That is the plain average of the positions; weight each by its mass.' }],
          hints: ['Total mass first, then the sum of mass × position.', t`$\bar x = \dfrac{\sum m_i x_i}{\sum m_i}$.`],
          teach: 'The centre of mass of a rocket is the mass-weighted average of its parts’ positions.',
          explain: t`$\bar x = \dfrac{0.012 + 0.1575 + ${nice(motor * 0.8)} + 0.0425}{${nice(M)}} \approx ${fmt(xb)}$ m from the tip, about ${fmt((0.7 - xb) * 100, 2)} cm ahead of the centre of pressure. A heavier motor moves it aft and shrinks that margin.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.05, 1], y: [-0.25, 0.25], xlabel: 'distance from nose tip (m)', curves: [{ param: ['t', '0.04'], t: [0.2, 0.9], color: 'ink3' }, { param: ['t', '-0.04'], t: [0.2, 0.9], color: 'ink3' }, { param: ['t', '0.04*t/0.2'], t: [0, 0.2], color: 'ink3' }, { param: ['t', '-0.04*t/0.2'], t: [0, 0.2], color: 'ink3' }], points: parts.map(([m, x]) => ({ x, y: 0, r: 3 + m * 20, color: 'accent', label: `${m} kg` })), vlines: [{ x: 0.7, color: 'bad', label: 'CP' }] }, caption: 'Side view, not to scale vertically. Dot size grows with mass; CP is the centre of pressure.' },
        };
      },
    }),
    num({
      id: 'cp-fin', difficulty: 3, transfer: true,
      gen(r) {
        const c = r.pick([0.18, 0.24, 0.3, 0.36]), s = r.pick([0.08, 0.1, 0.12]), e = c / 2;
        const xb = (11 * c) / 18;
        return {
          prompt: t`A rocket fin is a flat plate: its root edge lies along the body from $x = 0$ to $x = ${c}$ m; the leading edge runs straight from $(0, 0)$ to $(${nice(e)}, ${s})$; the tip runs parallel to the body from there to $x = ${c}$; the trailing edge is the straight line $x = ${c}$. Find $\bar x$, the chordwise position of its centroid.`,
          answer: xb, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: c / 2, feedback: 'The middle of the root chord would be right for a rectangle. This fin is cut back at the front, so its area sits further aft.' }],
          hints: [
            t`Top boundary: $y = \tfrac{${s}}{${nice(e)}}x$ for $0 \le x \le ${nice(e)}$, then $y = ${s}$ up to $x = ${c}$.`,
            t`Or split the fin: a triangle with corners $(0,0)$, $(${nice(e)}, 0)$, $(${nice(e)}, ${s})$ and a rectangle from $x = ${nice(e)}$ to ${c}. Combine their centroids, weighted by area.`,
          ],
          teach: 'A composite shape’s centroid is the area-weighted average of its pieces’ centroids.',
          explain: t`Triangle: area $\tfrac12(${nice(e)})(${s})$, centroid at $x = \tfrac23(${nice(e)})$. Rectangle: area $(${nice(c - e)})(${s})$, centroid at $x = ${nice((c + e) / 2)}$. Weighted average: $\bar x = \tfrac{11}{18}(${c}) \approx ${fmt(xb)}$ m — the span cancels.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.05 * c, c * 1.25], y: [-0.25 * s, s * 1.6], equal: true, xlabel: 'x (m)', curves: [{ fn: `min(${s / e}*x, ${s})`, color: 'accent', domain: [0, c] }, { param: [`${c}`, 't'], t: [0, s], color: 'accent' }], shade: [{ fn: `min(${s / e}*x, ${s})`, from: 0, to: c, color: 'accent', alpha: 0.22 }], hlines: [{ y: 0, color: 'ink3', label: 'body' }] }, caption: 'The fin seen side-on; the rocket body runs along the x-axis.' },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.6 Moments and Centers of Mass', url: 'https://openstax.org/books/calculus-volume-2/pages/2-6-moments-and-centers-of-mass' }],
});
