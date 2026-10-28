// Transformations of graphs — y = a f(b(x − h)) + k: outside acts on outputs, inside acts (backwards) on inputs.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { sgn } from './_m0kit.js';

const t = String.raw;
const is = (k) => `step(0.5 - abs(fam - ${k}))`;
// "(x − 3)" or "(x + 3)" for a shift h, as TeX
const inner = (h) => (h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${Math.abs(h)}`);

export default lesson({
  id: 'm0.M0-4.2',
  title: 'Transformations of graphs',
  minutes: 9, difficulty: 2,
  intro: t`Once you know the graph of one function $f$, you know a whole family: every member is $f$ shifted, stretched or flipped.

$$y = a\,f\big(b\,(x - h)\big) + k$$

The rule of thumb: **changes outside $f$ act on the outputs and do what they say** ($+k$ moves the graph up by $k$). **Changes inside act on the inputs and do the opposite**: $f(x - 2)$ moves the graph **right** by $2$, and $f(2x)$ squeezes it to **half** its width. That reversal is not a quirk — the new graph must reach the value $f$ had at $x$ when its own input is $x + 2$.`,
  symbols: [
    { tex: 'f', text: 'the parent function, whose graph you already know' },
    { tex: 'a', text: 'vertical stretch factor: multiplies every output; $a < 0$ also flips the graph over the $x$-axis' },
    { tex: 'b', text: 'horizontal factor: $b > 1$ squeezes the graph to $1/b$ of its width, $0 < b < 1$ widens it; $b < 0$ flips it over the $y$-axis' },
    { tex: 'h', text: 'horizontal shift: the graph moves **right** by $h$ (left if $h$ is negative)' },
    { tex: 'k', text: 'vertical shift: the graph moves up by $k$' },
  ],
  why: t`Physics re-uses shapes constantly: a signal that arrives later is $f(t - t_0)$, a faster replay is $f(2t)$, a resonance curve centred elsewhere is the same curve shifted. Reading those changes off the formula saves redrawing every graph from scratch.`,
  visual: {
    type: 'graph',
    title: 'The transformation playground',
    lead: t`The dashed curve is the parent $f$; the blue one is $y = a\,f(b(x - h)) + k$. The gold point $P$ on the parent moves to the violet point $P'$. Move one slider at a time.`,
    tasks: [
      t`Set $h = 2$: the graph moves **right** by $2$, although the formula has $x - 2$ in it.`,
      t`Set $b = 2$: the graph squeezes toward the $y$-axis, and $P'$ moves from $x = 1$ to $x = 0.5$.`,
      t`Set $a = -1$: the graph flips over the $x$-axis. Outside changes act on heights, exactly as written.`,
    ],
    params: {
      x: [-6, 6], y: [-5, 5], aspect: 'wide',
      choices: [{ key: 'fam', label: t`Parent $f(x)$`, options: [[0, t`$x^2$`], [1, t`$|x|$`], [2, t`$\sqrt{x}$`], [3, t`$\sin x$`]], value: 0, explain: 'The parent graph that is shifted, stretched and flipped.' }],
      sliders: [
        { key: 'a', label: t`Vertical factor $a$`, min: -3, max: 3, step: 0.1, value: 1, explain: t`Multiplies every output by $a$; a negative $a$ flips the graph over the $x$-axis.` },
        { key: 'b', label: t`Horizontal factor $b$`, min: 0.25, max: 3, step: 0.05, value: 1, explain: t`The input is multiplied by $b$ before $f$ sees it, so the graph is squeezed to $1/b$ of its width.` },
        { key: 'h', label: t`Horizontal shift $h$`, min: -4, max: 4, step: 0.1, value: 0, explain: t`The input has $h$ subtracted, so the graph moves right by $h$.` },
        { key: 'k', label: t`Vertical shift $k$`, min: -3, max: 3, step: 0.1, value: 0, explain: t`Added to every output: the graph moves up by $k$.` },
      ],
      curves: [
        { fn: 'x^2', color: 'ink3', dash: true, when: is(0) }, { fn: 'a*(b*(x - h))^2 + k', color: 'accent', when: is(0) },
        { fn: 'abs(x)', color: 'ink3', dash: true, when: is(1) }, { fn: 'a*abs(b*(x - h)) + k', color: 'accent', when: is(1) },
        { fn: 'sqrt(x)', color: 'ink3', dash: true, domain: [0, 6], when: is(2) }, { fn: 'a*sqrt(b*(x - h)) + k', color: 'accent', when: is(2) },
        { fn: 'sin(x)', color: 'ink3', dash: true, when: is(3) }, { fn: 'a*sin(b*(x - h)) + k', color: 'accent', when: is(3) },
      ],
      points: [
        { x: '1 + step(0.5 - abs(fam - 3))*(pi/2 - 1)', y: 1, color: 'gold', r: 5, label: 'P', labelDx: -16, labelDy: -10 },
        { x: 'h + (1 + step(0.5 - abs(fam - 3))*(pi/2 - 1))/b', y: 'a + k', color: 'violet', r: 5.5, label: 'P′' },
      ],
      readouts: [{ label: t`$P'$ at $x$`, expr: 'h + (1 + step(0.5 - abs(fam - 3))*(pi/2 - 1))/b', digits: 3 }, { label: t`$P'$ at $y$`, expr: 'a + k', digits: 3 }],
    },
    caption: t`$P$ is the parent’s point at height $1$: at $x = 1$, or at $x = \pi/2$ for $\sin x$. The square root is drawn only where its input is not negative.`,
  },
  example: {
    prompt: t`Describe how to get the graph of $y = -2(x - 3)^2 + 1$ from $y = x^2$, and find its vertex.`,
    visual: { type: 'graph', params: { x: [-3, 7], y: [-5, 5], aspect: 'wide', curves: [{ fn: 'x^2', color: 'ink3', dash: true, label: 'y = x²', labelAt: -1.9, labelDx: 8, labelDy: 0 }, { fn: '-2(x - 3)^2 + 1', color: 'accent', label: 'y = −2(x − 3)² + 1', labelAt: 4.3, labelDx: 10, labelDy: 0 }], points: [{ x: 0, y: 0, color: 'gold', r: 5 }, { x: 3, y: 1, color: 'violet', r: 5.5, label: 'vertex (3, 1)', labelDx: -40, labelDy: -14 }], arrows: [{ from: [0.2, 0.15], to: [2.75, 0.9], color: 'gold', width: 2 }] }, caption: t`The parent (dashed) and the result. The vertex moved from $(0, 0)$ to $(3, 1)$; the arms now point down and are twice as steep.` },
    steps: [
      { label: 'Inside first', text: t`$x - 3$ inside: shift **right** by $3$. The new vertex is where the inside is zero, $x = 3$.` },
      { label: 'Stretch', text: t`The factor $2$ doubles every height above the vertex: the parabola is twice as steep.` },
      { label: 'Flip', text: t`The minus sign multiplies every output by $-1$: the arms point down.` },
      { label: 'Lift', text: t`$+1$ moves everything up by $1$: the vertex is at $(3, 1)$, now a maximum.` },
      { label: 'Check a point', text: t`At $x = 4$: $-2(1)^2 + 1 = -1$. The parent’s $(1, 1)$ went right $3$, was scaled by $-2$, and lifted by $1$: $(4, -1)$ ✓.` },
    ],
    answer: t`Right $3$, stretch by $2$, flip, up $1$: vertex $(3, 1)$, opening downward.`,
  },
  practice: [
    num({
      id: 'peak-shift', difficulty: 1,
      gen(r) {
        const p = r.int(-2, 2), m = r.int(2, 4), s = r.sign(), ans = p + s * m;
        return {
          prompt: t`A pulse $f(x)$ has its peak at $x = ${p}$. Where is the peak of $g(x) = f(${inner(s * m)})$?`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: p - s * m, feedback: t`Wrong direction. $g$ reaches the peak value when its input $${inner(s * m)}$ equals $${p}$, so $x = ${p} ${s > 0 ? '+' : '-'} ${m}$.` }],
          hints: [t`The peak happens when the input to $f$ equals $${p}$.`, t`Solve $${inner(s * m)} = ${p}$.`],
          teach: t`$f(x - h)$ is $f$ moved right by $h$: everything happens $h$ later.`,
          explain: t`$${inner(s * m)} = ${p}$ gives $x = ${ans}$: the pulse moved ${s > 0 ? 'right' : 'left'} by $${m}$.`,
          visual: { type: 'graph', params: { x: [-7, 7], y: [-0.2, 1.3], aspect: 'wide', ylabel: 'f', yticks: 0, curves: [{ fn: `e^(-(x - (${p}))^2)`, color: 'accent', label: 'f(x)', labelAt: p + 0.7, labelDx: 6, labelDy: -6 }], points: [{ x: p, y: 1, color: 'gold', r: 5, label: 'peak of f', labelDx: -30, labelDy: -14 }] }, caption: t`The pulse $f$ alone; $g$ is for you to place.` },
        };
      },
    }),
    mcq({
      id: 'which-equation', difficulty: 2,
      gen(r) {
        const h = r.int(1, 3), k = r.int(1, 3), sq = r.bool(0.5);
        const fT = sq ? t`x^2` : t`|x|`, F = (u) => (sq ? `(${u})^2` : `abs(${u})`), pt = sq ? 'vertex' : 'corner';
        return {
          prompt: t`The dashed curve is $y = f(x) = ${fT}$. Which equation gives the blue curve?`,
          visual: { type: 'graph', params: { x: [-5, 6], y: [-1.5, 7], aspect: 'wide', curves: [{ fn: F('x'), color: 'ink3', dash: true }, { fn: `${F(`x - ${h}`)} + ${k}`, color: 'accent' }] }, caption: t`Both graphs, with scales.` },
          choices: [t`$y = f(x - ${h}) + ${k}$`, t`$y = f(x + ${h}) + ${k}$`, t`$y = f(x - ${h}) - ${k}$`, t`$y = f(x + ${h}) - ${k}$`],
          answer: 0,
          why: {
            1: t`$f(x + ${h})$ moves the graph **left**: its ${pt} is where $x + ${h} = 0$, at $x = -${h}$. The blue ${pt} is at $x = +${h}$.`,
            2: t`The vertical shift does what it says: $-${k}$ would move the graph down, but the blue ${pt} is above the dashed one.`,
            3: t`Both directions are reversed: this graph has its ${pt} at $(-${h}, -${k})$.`,
          },
          hints: [t`Find the blue ${pt}. Where is the input of $f$ zero?`],
          teach: t`The ${pt} of $f(x - h) + k$ sits at $(h, k)$: inside $-h$ moves right, outside $+k$ moves up.`,
          explain: t`The blue ${pt} is at $(${h}, ${k})$: right $${h}$, so $x - ${h}$ inside; up $${k}$, so $+${k}$ outside. $y = f(x - ${h}) + ${k}$.`,
        };
      },
    }),
    num({
      id: 'pulse-width', difficulty: 2,
      gen(r) {
        const W = r.pick([4, 6, 8, 12]), k = r.pick([2, 3, 4]), fast = r.bool(0.5);
        const ans = fast ? W / k : W * k, wrong = fast ? W * k : W / k;
        const arg = fast ? `${k}t` : t`t/${k}`;
        return {
          prompt: t`A pressure sensor on a test stand records a pulse $p(t)$ lasting $${W}$ ms. Played back from the data recorder, the signal is $p(${arg})$. How long does the played-back pulse last?`,
          answer: ans, units: 'ms', tol: { rel: 1e-6, abs: 1e-9 },
          errors: [{ value: wrong, feedback: t`Inside changes act backwards: $p(${arg})$ reaches a given part of the pulse ${fast ? `$${k}$ times sooner, so it is $${k}$ times *shorter*` : `$${k}$ times later, so it is $${k}$ times *longer*`}.` }],
          hints: [t`If the original pulse runs over $0 \le t \le ${W}$, over which $t$ does $p(${arg})$ run?`, t`Solve $0 \le ${arg} \le ${W}$ for $t$.`],
          teach: t`$f(bt)$ squeezes a graph to $1/b$ of its width; $f(t/b)$ stretches it $b$ times.`,
          explain: t`$0 \le ${arg} \le ${W}$ gives $0 \le t \le ${nice(ans)}$: the pulse lasts $${nice(ans)}$ ms.`,
          visual: { type: 'graph', params: { x: [-2, 16], y: [-0.2, 1.35], aspect: 'wide', xlabel: 't (ms)', ylabel: 'p', yticks: 0, curves: [{ fn: `(sin(pi*x/${W}))^2*step(${W} - x)*step(x)`, color: 'accent', domain: [-2, 16] }], arrows: [{ from: [0, 1.15], to: [W, 1.15], color: 'gold', label: `${W} ms`, labelDx: -36, labelDy: -12 }, { from: [W, 1.15], to: [0, 1.15], color: 'gold' }] }, caption: t`The original recorded pulse $p(t)$; its shape is illustrative.` },
        };
      },
    }),
    expr({
      id: 'write-shift', difficulty: 2,
      gen(r) {
        const m = r.int(1, 4), n = r.intExcept(1, 4, [m]);
        return {
          prompt: t`Shift the graph of $y = \sqrt{x}$ **left** by $${m}$ and **up** by $${n}$. Write the new function.`,
          lhs: 'y',
          answer: `sqrt(x + ${m}) + ${n}`, answerTeX: t`\sqrt{x + ${m}} + ${n}`,
          vars: { x: [0.5, 4] },
          errors: [
            { answer: `sqrt(x - ${m}) + ${n}`, feedback: t`$\sqrt{x - ${m}}$ moves the graph *right*: it starts where $x - ${m} = 0$, at $x = ${m}$. To move left, add inside.` },
            { answer: `sqrt(x + ${n}) + ${m}`, feedback: t`The left shift goes inside the root and the upward shift outside: you swapped them.` },
          ],
          hints: [t`The new graph should start at $(-${m}, ${n})$.`, t`Which input makes the inside of the root zero at $x = -${m}$?`],
          teach: t`To shift left by $m$, replace $x$ by $x + m$; to shift up by $n$, add $n$ to the output.`,
          explain: t`$y = \sqrt{x + ${m}} + ${n}$ starts where $x + ${m} = 0$ — at $x = -${m}$ — at height $${n}$.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-1, 6], aspect: 'wide', curves: [{ fn: 'sqrt(x)', color: 'accent', domain: [0, 6], label: 'y = √x', labelAt: 4, labelDx: 6, labelDy: 14 }], points: [{ x: 0, y: 0, color: 'gold', r: 5, label: 'start', labelDx: 8, labelDy: 14 }], arrows: [{ from: [-0.15, 0], to: [-m + 0.15, 0], color: 'violet', label: `left ${m}`, labelDx: -10, labelDy: 16 }, { from: [-m, 0.15], to: [-m, n - 0.15], color: 'violet', label: `up ${n}`, labelDx: -46, labelDy: 0 }] }, caption: t`The parent $\sqrt{x}$ and where its starting point must go.` },
        };
      },
    }),
    {
      type: 'point', id: 'move-point', difficulty: 3,
      gen(r) {
        const a = r.pick([2, -1, -2]), h = r.intExcept(-3, 3, [0]), k = r.int(-2, 2);
        const p = 2, q = 2, X = p + h, Y = a * q + k;
        const fT = t`${a === -1 ? '-' : a}\,f(${inner(h)}) ${k === 0 ? '' : sgn(k)}`;
        return {
          prompt: t`The point $P(2, 2)$ lies on $y = f(x)$ (blue). Where does it land on the graph of $y = ${fT}$?`,
          visual: { type: 'graph', params: { x: [-7, 7], y: [-7, 7], aspect: 'wide', curves: [{ fn: 'x^2/2', color: 'accent', label: 'y = f(x)', labelAt: -2.6, labelDx: 8, labelDy: 0 }], points: [{ x: 2, y: 2, color: 'gold', r: 5, label: 'P', labelDx: 8, labelDy: 12 }], drag: [{ key: 'q', x: -5, y: 5, snap: 0.5 }] } },
          answer: { x: X, y: Y }, tol: { x: 0.26, y: 0.26 },
          instruction: 'Drag the point to the image of P, then check.',
          hints: [t`The $x$-coordinate: the new graph’s input must satisfy $${inner(h)} = 2$.`, t`The $y$-coordinate: multiply $P$’s height by $${a}$, then add $${k}$.`, t`So $x = 2 ${h > 0 ? '+' : '-'} ${Math.abs(h)}$ and $y = ${a} \times 2 ${sgn(k)}$.`],
          teach: t`A point $(p, q)$ on $f$ moves to $(p + h,\ a q + k)$ on $a\,f(x - h) + k$.`,
          explain: t`Inside: $${inner(h)} = 2$ at $x = ${X}$. Outside: $${a} \times 2 ${sgn(k)} = ${Y}$. The image is $(${X}, ${Y})$.`,
        };
      },
    },
    mcq({
      id: 'reflect', difficulty: 2,
      prompt: t`The graph of $y = e^{x}$ is shown. How is the graph of $y = e^{-x}$ related to it?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-3, 5], aspect: 'wide', curves: [{ fn: 'e^x', color: 'accent', label: 'y = eˣ', labelAt: 1.2, labelDx: 10, labelDy: 0 }], points: [{ x: 1, y: Math.E, color: 'gold', r: 5, label: '(1, e)', labelDx: 10, labelDy: 10 }] }, caption: t`The parent, $y = e^x$.` },
      choices: ['its mirror image in the y-axis', 'its mirror image in the x-axis', 'the same curve moved left by 1', 'its mirror image in the line y = x'],
      answer: 0,
      why: {
        1: t`That is $y = -e^{x}$: a minus *outside* flips the outputs. Here the minus is inside, on the input.`,
        2: t`A shift needs a constant added to $x$, as in $e^{x + 1}$. A minus sign on $x$ reflects.`,
        3: t`The mirror image in $y = x$ is the inverse function, $\ln x$ — a different curve.`,
      },
      hints: [t`The point $(1, e)$ is on $y = e^x$. Which input gives $e^{-x} = e$?`],
      teach: t`$f(-x)$ reflects a graph in the $y$-axis; $-f(x)$ reflects it in the $x$-axis.`,
      explain: t`$e^{-x}$ at $x = -1$ equals $e^{x}$ at $x = 1$: every point $(p, q)$ becomes $(-p, q)$. Growth run backwards in time is decay.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-vertex', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, -2, -1]), h = r.intExcept(-5, 5, [0]), k = r.int(-6, 6);
        return {
          prompt: t`What is the $x$-coordinate of the vertex of $y = ${a === -1 ? '-' : a}(${inner(h)})^2 ${k === 0 ? '' : sgn(k)}$?`,
          answer: h, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: -h, feedback: t`The vertex is where the inside is zero: $${inner(h)} = 0$ at $x = ${h}$, not $${-h}$.` }, ...(k !== h && k !== -h ? [{ value: k, feedback: t`$${k}$ is the vertex’s height, its $y$-coordinate.` }] : [])],
          hints: [t`The parent $x^2$ has its vertex where its input is zero.`],
          teach: t`The vertex of $a(x - h)^2 + k$ is at $(h, k)$.`,
          explain: t`$${inner(h)} = 0$ at $x = ${h}$; the vertex is $(${h}, ${k})$.`,
          visual: { type: 'graph', params: { x: [-7, 7], y: [-7, 7], aspect: 'wide', curves: [{ fn: 'x^2', color: 'ink3', dash: true, label: 'y = x²', labelAt: 1.8, labelDx: 8, labelDy: 0 }], points: [{ x: 0, y: 0, color: 'gold', r: 5, label: 'vertex of the parent', labelDx: 10, labelDy: 14 }] }, caption: t`The parent parabola; the transformed one is for you to place.` },
        };
      },
    }),
    mcq({
      id: 'cp-ignition', difficulty: 2, transfer: true,
      gen(r) {
        const T0 = r.pick([3, 4, 6, 7]);
        return {
          prompt: t`An engine’s thrust is $F(s)$, where $s$ is the time since ignition. The engines ignite $${T0}$ s before liftoff, at mission time $t = -${T0}$ s. Which expression gives the thrust as a function of mission time $t$?`,
          visual: { type: 'graph', params: { x: [-2, 12], y: [-0.15, 1.3], aspect: 'wide', xlabel: 's (s after ignition)', ylabel: 'F', yticks: 0, curves: [{ fn: '0.9*(1 - e^(-1.2x))*step(x)', color: 'accent', domain: [-2, 12] }], points: [{ x: 0, y: 0, color: 'gold', r: 5, label: 'ignition, s = 0', labelDx: 8, labelDy: -14 }] }, caption: t`Thrust against time since ignition; an illustrative start-up curve, not a real engine’s.` },
          choices: [t`$F(t + ${T0})$`, t`$F(t - ${T0})$`, t`$F(t) + ${T0}$`, t`$F(t) - ${T0}$`],
          answer: 0,
          why: {
            1: t`Check ignition: at $t = -${T0}$ this gives $F(-${2 * T0})$, not $F(0)$. It delays the curve to $t = +${T0}$, after liftoff.`,
            2: t`Adding $${T0}$ to the *thrust* changes newtons, not timing.`,
            3: t`Subtracting from the output shifts the curve down, not in time.`,
          },
          hints: [t`At ignition, $t = -${T0}$, the argument of $F$ must be $s = 0$.`],
          teach: t`Converting clocks is an inside shift: if $s = t + T_0$, then $F(s) = F(t + T_0)$, which moves the curve left by $T_0$.`,
          explain: t`Time since ignition is $s = t + ${T0}$, so thrust is $F(t + ${T0})$: zero argument at $t = -${T0}$ ✓. On the mission clock the curve sits $${T0}$ s to the left.`,
        };
      },
    }),
    mcq({
      id: 'cp-squeeze-point', difficulty: 2,
      gen(r) {
        const p = r.pick([2, 4, 6]), q = r.pick([1, 3, 5]);
        return {
          prompt: t`The point $(${p}, ${q})$ is on the graph of $y = f(x)$. Which point must be on the graph of $y = f(2x)$?`,
          visual: { type: 'graph', params: { x: [-1, 2 * p + 1], y: [-0.5, 2 * q + 1.5], aspect: 'wide', curves: [{ fn: `${q}*sqrt(x/${p})`, color: 'accent', domain: [0, 2 * p + 1], label: 'y = f(x)', labelAt: 2 * p, labelDx: -30, labelDy: 16 }], points: [{ x: p, y: q, color: 'gold', r: 5, label: `(${p}, ${q})`, labelDx: -16, labelDy: -14 }] }, caption: t`One possible $f$ through $(${p}, ${q})$.` },
          choices: [t`$(${p / 2}, ${q})$`, t`$(${2 * p}, ${q})$`, t`$(${p}, ${2 * q})$`, t`$(${p / 2}, ${2 * q})$`],
          answer: 0,
          why: {
            1: t`Inside factors act backwards: $f(2x)$ needs $2x = ${p}$, so $x = ${p / 2}$, not $${2 * p}$.`,
            2: t`That point is on $y = 2f(x)$: a factor outside doubles the heights. Inside, it halves the $x$-coordinates.`,
            3: t`The height does not change: $f(2 \cdot ${p / 2}) = f(${p}) = ${q}$.`,
          },
          hints: [t`Which $x$ makes $2x = ${p}$?`],
          teach: t`$f(2x)$ squeezes the graph horizontally by a factor of $2$; heights are unchanged.`,
          explain: t`At $x = ${p / 2}$, $f(2x) = f(${p}) = ${q}$, so $(${p / 2}, ${q})$ is on the new graph.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §1.5 Transformation of Functions', url: 'https://openstax.org/books/precalculus-2e/pages/1-5-transformation-of-functions' },
  ],
});
