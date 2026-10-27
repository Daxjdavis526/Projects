// Lorentz transformations and invariance — Derivation Mode. The boost is
// derived from linearity, the motion of the moving origin, the speed of light
// in both frames and the relativity principle; then velocity addition,
// simultaneity, length contraction and the Doppler factor follow from it.
// Index notation and the summation convention wait for step 3: everything
// here is written out, with matrices for the boost.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { C, TAU_MU, round, frames } from './_deriv.js';

const t = String.raw;

const gam = (b) => 1 / Math.sqrt(1 - b * b);
// speeds with tidy Lorentz factors: [β, β as TeX, γ, γ as TeX]
const SPEEDS = [[0.6, '0.6', 1.25, '1.25'], [0.8, '0.8', 5 / 3, t`\tfrac53`], [5 / 13, t`\tfrac{5}{13}`, 13 / 12, t`\tfrac{13}{12}`], [12 / 13, t`\tfrac{12}{13}`, 13 / 5, '2.6']];
const H_MW = 1907;                       // m, Mount Washington summit to sea level (Frisch & Smith 1963)

// the Doppler picture: a source receding at β emits a crest each unit of its own time; light returns to x = 0
function dopplerSketch(beta, caption) {
  const g = gam(beta), segs = [[0, 0, 5.4, round(beta * 5.4), 'violet'], [0, 0, 7, 0, 'accent']], ev = [];
  for (const n of [1, 2]) {
    const te = round(g * n), xe = round(beta * g * n), ta = round(g * (1 + beta) * n);
    segs.push([te, xe, ta, 0, 'warn']);
    ev.push([te, xe, n === 1 ? 'crest 1 sent' : 'crest 2 sent', 'violet'], [ta, 0, n === 1 ? 'received' : 'received', 'accent']);
  }
  return frames({ events: ev, segments: segs, range: 5, cone: false, xlabel: 'x (light-seconds)', ylabel: 't (seconds)', caption });
}

export default lesson({
  id: 'gr.S02.d',
  title: 'Lorentz transformations and invariance, reviewed',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`Take two inertial frames: yours, $S$, and $S'$, moving at speed $v$ along your $x$ axis, their origins together at $t = t' = 0$. The **Lorentz transformation** turns an event’s coordinates in $S$ into its coordinates in $S'$. Measure time in metres, as $ct$, and it becomes the symmetric matrix above; directions across the motion are untouched, $y' = y$ and $z' = z$.

It follows from two postulates — the laws of physics are the same in every inertial frame, and light moves at $c$ in all of them — and **it is the single rule behind time dilation, length contraction, the relativity of simultaneity and the relativistic Doppler shift**. What it leaves unchanged, $(ct)^2 - x^2$, becomes the geometry of spacetime in the next step.`,
  equation: t`\begin{pmatrix} ct' \\ x' \end{pmatrix} = \begin{pmatrix} \gamma & -\gamma\beta \\ -\gamma\beta & \gamma \end{pmatrix}\begin{pmatrix} ct \\ x \end{pmatrix}, \qquad \gamma = \frac{1}{\sqrt{1 - \beta^2}}`,
  symbols: [
    { tex: 'ct,\\ x', text: t`an event’s coordinates in your frame $S$: its time multiplied by $c$ (so it is a distance, in metres) and its position along the line of motion` },
    { tex: "ct',\\ x'", text: t`the same event’s coordinates in the frame $S'$ (“S-prime”), which moves at speed $v$ in your $+x$ direction` },
    { tex: '\\beta', text: t`$v/c$: the speed of $S'$ as a fraction of the speed of light, between $-1$ and $1$` },
    { tex: '\\gamma', text: t`the Lorentz factor: $1$ at rest, $1.25$ at $\beta = 0.6$, growing without limit as $\beta \to 1$` },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s — the same in both frames` },
  ],
  why: t`Every later step assumes this one: the metric of step 3 is defined as the thing Lorentz transformations preserve, and general relativity keeps them as the rule for small, freely falling laboratories.`,
  visual: {
    type: 'spacetime',
    title: 'One event, two sets of coordinates',
    lead: t`Your axes are black; the gold axes belong to $S'$. The readout applies the matrix above to each event, with $c = 1$ (seconds and light-seconds). Drag the events and move the slider.`,
    tasks: [
      'At β = 0.6, B at (t, x) = (5, 3) has x′ = 0 and t′ = 4: B lies on the time axis of S′.',
      'Move the slider: B’s t′ and x′ both change, but t′² − x′² stays 16 = 5² − 3² — the readout’s Δt² − Δx².',
      'Drag B onto the x axis (t = 0, x > 0): for β > 0 its t′ is negative. Events simultaneous in S are not simultaneous in S′.',
    ],
    params: { beta: 0.6, events: [[0, 0], [5, 3]], simultaneity: true, hyperbolae: true, range: 5 },
    caption: t`Units with $c = 1$: seconds up, light-seconds across, so light runs at 45°. The gold dots mark one unit of $S'$’s own time and distance along its axes; grey hyperbolae join events with equal $t^2 - x^2$.`,
  },
  example: {
    prompt: t`Derive the Lorentz transformation for a frame $S'$ moving at $\beta = v/c$ along $x$, assuming only that inertial motion looks inertial in both frames, that light moves at $c$ in both, and that neither frame is special.`,
    visual: frames({ beta: 0.6, range: 5, caption: t`The axes of $S'$ (gold) for $\beta = 0.6$, drawn in your frame. Its time axis is the worldline of its origin, $x = \beta\,ct$; its space axis is the line $ct' = 0$. Both lean toward the light cone (dashed) by the same angle.` }),
    steps: [
      { label: 'It must be linear', text: t`Straight worldlines (inertial motion) must map to straight worldlines, and no event is special, so with the origins matched the map is linear: $x' = A\,x + B\,ct$ and $ct' = C\,x + D\,ct$, with $A$, $B$, $C$, $D$ depending only on $\beta$.` },
      { label: 'Follow the moving origin', text: t`The origin of $S'$ ($x' = 0$) moves along $x = \beta\,ct$. Putting that into $x' = Ax + B\,ct$ must give zero: $B = -A\beta$. So $x' = A(x - \beta\,ct)$.` },
      { label: 'Light moves at c in both', text: t`A flash from the origin runs along $x = \pm ct$ in $S$, and must run along $x' = \pm ct'$ in $S'$. The forward flash gives $C + D = A(1 - \beta)$, the backward one $D - C = A(1 + \beta)$. Adding and subtracting: $D = A$ and $C = -A\beta$, so $ct' = A(ct - \beta x)$.` },
      { label: 'Neither frame is special', text: t`$S$ moves at $-\beta$ as seen from $S'$, so the inverse map has the same form with $\beta \to -\beta$: $x = A(x' + \beta\,ct')$. Substitute the results so far: $x' + \beta\,ct' = A(1 - \beta^2)\,x$, hence $x = A^2(1 - \beta^2)\,x$ and $A = 1/\sqrt{1 - \beta^2} = \gamma$ — the positive root, because $A = 1$ when $\beta = 0$.` },
      { label: 'The result', text: t`$ct' = \gamma(ct - \beta x)$ and $x' = \gamma(x - \beta\,ct)$: the matrix of the equation above, with $y' = y$ and $z' = z$.` },
      { label: 'Two checks', text: t`Slow motion: $\gamma \to 1$, $x' \to x - vt$ and $t' \to t$ — Galileo’s rules. And $(ct')^2 - x'^2 = \gamma^2\left[(ct - \beta x)^2 - (x - \beta\,ct)^2\right] = \gamma^2(1 - \beta^2)\left[(ct)^2 - x^2\right] = (ct)^2 - x^2$: the combination both frames agree on.` },
    ],
    answer: t`$ct' = \gamma(ct - \beta x)$, $x' = \gamma(x - \beta\,ct)$, $y' = y$, $z' = z$, with $\gamma = 1/\sqrt{1 - \beta^2}$ — and $(ct)^2 - x^2 - y^2 - z^2$ is the same in both frames.`,
  },
  practice: [
    num({
      id: 'transform-event', difficulty: 2,
      gen(r) {
        const [b, bt, g, gt] = r.pick(SPEEDS);
        let T, X;
        do { T = r.int(2, 8); X = r.intExcept(-4, 6, [0]); } while (Math.abs(T - b * X) < 0.4 || Math.abs(X - b * T) < 0.4);
        const askT = r.bool(0.5);
        const tp = g * (T - b * X), xp = g * (X - b * T);
        return {
          prompt: t`Frame $S'$ moves at $\beta = ${bt}$ along your $x$ axis (so $\gamma = ${gt}$). An event happens at $t = ${T}$ s and $x = ${X}$ light-seconds in your frame — so $ct = ${T}$ light-seconds. Find its ${askT ? t`time $t'$ in $S'$, in seconds` : t`position $x'$ in $S'$, in light-seconds`}.`,
          answer: askT ? tp : xp, units: askT ? 's' : undefined, tol: { rel: 0.005, abs: 0.002 },
          errors: (askT
            ? [{ value: T, feedback: t`That is Galileo’s answer, $t' = t$. In relativity time mixes with position: $ct' = \gamma(ct - \beta x)$.` }, { value: g * (T + b * X), feedback: t`Check the sign: $S'$ moves toward $+x$, so $ct' = \gamma(ct - \beta x)$.` }, { value: T - b * X, feedback: t`You left out the factor $\gamma = ${gt}$.` }]
            : [{ value: X - b * T, feedback: t`That is Galileo’s $x - vt$; the Lorentz transformation multiplies it by $\gamma = ${gt}$.` }, { value: g * (X + b * T), feedback: t`Check the sign: the origin of $S'$ moves toward $+x$, so $x' = \gamma(x - \beta\,ct)$.` }])
            .filter((e) => Math.abs(e.value - (askT ? tp : xp)) > 0.05 * Math.max(1, Math.abs(askT ? tp : xp))),
          hints: [askT ? t`$ct' = \gamma(ct - \beta x)$; with $c = 1$ light-second per second, $t' = \gamma(t - \beta x)$.` : t`$x' = \gamma(x - \beta\,ct)$.`, askT ? t`$t' = ${gt}\times(${T} - ${bt}\times${X < 0 ? `(${X})` : X})$.` : t`$x' = ${gt}\times(${X} - ${bt}\times${T})$.`],
          teach: 'The Lorentz transformation mixes time and position: each new coordinate is γ times a combination of both old ones.',
          explain: t`${askT ? t`$t' = \gamma(t - \beta x) = ${gt}\times(${T} - ${nice(b * X)}) = ${nice(tp)}$ s` : t`$x' = \gamma(x - \beta\,ct) = ${gt}\times(${X} - ${nice(b * T)}) = ${nice(xp)}$ light-seconds`}. For the record, the other coordinate is ${askT ? t`$x' = ${nice(xp)}$` : t`$t' = ${nice(tp)}$ s`}, and $t'^2 - x'^2 = ${nice(tp * tp - xp * xp)} = ${T}^2 - ${X < 0 ? `(${X})` : X}^2$.`,
          visual: frames({ beta: round(b), events: [[T, X, 'event']], range: Math.max(5, Math.ceil(Math.max(T / 1.3, Math.abs(X) * 1.1))), caption: t`The event (blue) and the axes of $S'$ (gold) for $\beta = ${nice(round(b, 3))}$, in seconds and light-seconds.` }),
        };
      },
    }),
    mcq({
      id: 'inverse', difficulty: 2,
      prompt: t`The boost from $S$ to $S'$ is $\Lambda(\beta) = \begin{pmatrix} \gamma & -\gamma\beta \\ -\gamma\beta & \gamma \end{pmatrix}$, acting on $(ct, x)$. Which matrix takes $S'$ coordinates back to $S$?`,
      choices: [
        t`$\begin{pmatrix} \gamma & \gamma\beta \\ \gamma\beta & \gamma \end{pmatrix}$`,
        t`$\begin{pmatrix} \gamma & -\gamma\beta \\ -\gamma\beta & \gamma \end{pmatrix}$`,
        t`$\begin{pmatrix} 1/\gamma & -1/(\gamma\beta) \\ -1/(\gamma\beta) & 1/\gamma \end{pmatrix}$`,
        t`$\begin{pmatrix} 1/\gamma & 0 \\ 0 & 1/\gamma \end{pmatrix}$`,
      ],
      answer: 0,
      why: {
        1: t`That is the same boost again. Applied to $S'$ coordinates it gives a frame moving still faster, not $S$. (The boost matrix is symmetric, so its transpose is no help either.)`,
        2: 'Matrices are not inverted entry by entry: multiply this by Λ(β) and you do not get the identity.',
        3: 'This only rescales; it cannot undo the mixing of time and position that the off-diagonal entries do.',
      },
      hints: [t`Seen from $S'$, the frame $S$ moves at $-\beta$.`, t`Replace $\beta$ by $-\beta$ in $\Lambda$; $\gamma$ does not change, because it depends on $\beta^2$.`],
      teach: 'The inverse of a boost is the boost with the opposite velocity: Λ(β)⁻¹ = Λ(−β).',
      explain: t`$\Lambda(-\beta)$ has $+\gamma\beta$ off the diagonal, and $\Lambda(-\beta)\Lambda(\beta) = \begin{pmatrix} \gamma^2 - \gamma^2\beta^2 & 0 \\ 0 & \gamma^2 - \gamma^2\beta^2 \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$, since $\gamma^2(1 - \beta^2) = 1$.`,
      visual: frames({ beta: 0.6, range: 5, caption: t`The axes of $S'$ (gold) at $\beta = 0.6$, drawn in $S$. Drawn in $S'$ instead, the axes of $S$ would lean the other way: from there, $S$ moves at $-0.6$.` }),
    }),
    expr({
      id: 'velocity-addition', difficulty: 3,
      prompt: t`A probe moves along $x$ at speed $u$ in your frame $S$. Use the Lorentz transformation to find its speed $u'$ in $S'$, which moves at speed $v$ along $x$. Work with $c = 1$: along the probe’s worldline $\Delta x = u\,\Delta t$, and $u' = \Delta x'/\Delta t'$.`,
      answer: '(u - v)/(1 - u v)', answerTeX: t`\frac{u - v}{1 - uv}`,
      lhs: "u'",
      vars: { u: [-0.9, 0.9], v: [-0.9, 0.9] },
      errors: [
        { answer: 'u - v', feedback: t`That is Galileo’s rule. The Lorentz transformation also changes $\Delta t$: $\Delta t' = \gamma(\Delta t - v\,\Delta x)$.` },
        { answer: '(u + v)/(1 + u v)', feedback: t`That composes the two speeds — the probe’s speed in a frame moving at $-v$. Check the signs: $\Delta x' = \gamma(\Delta x - v\,\Delta t)$.` },
        { answer: '(u - v)/(1 + u v)', feedback: t`Check the sign in the denominator: $\Delta t' = \gamma(\Delta t - v\,\Delta x)$, so it is $1 - uv$.` },
      ],
      hints: [t`With $c = 1$: $\Delta x' = \gamma(\Delta x - v\,\Delta t)$ and $\Delta t' = \gamma(\Delta t - v\,\Delta x)$.`, t`Divide them: the $\gamma$’s cancel. Then divide top and bottom by $\Delta t$ and use $\Delta x/\Delta t = u$.`],
      teach: 'Velocities do not subtract: transforming Δx and Δt together gives u′ = (u − v)/(1 − uv/c²).',
      explain: t`$u' = \dfrac{\gamma(\Delta x - v\,\Delta t)}{\gamma(\Delta t - v\,\Delta x)} = \dfrac{u - v}{1 - uv}$, or with units, $\dfrac{u - v}{1 - uv/c^2}$. Turned around (a ship at $v$ fires a probe forward at $u'$), $u = \dfrac{u' + v}{1 + u'v/c^2}$: $0.6c$ on top of $0.6c$ gives $${nice(1.2 / 1.36, 3)}c$, never more than $c$. And if $u = 1$, then $u' = 1$: light moves at $c$ in both frames.`,
      visual: frames({ beta: 0.5, segments: [[0, 0, 7, 5.6, 'violet']], events: [[5, 4, 'probe', 'violet']], range: 5, caption: t`The probe’s worldline (violet) and the axes of $S'$ (gold), here for $u = 0.8$ and $v = 0.5$. Its speed in $S'$ is its slope measured against the gold axes, not the black ones.` }),
    }),
    num({
      id: 'muon-mountain', difficulty: 3,
      gen(r) {
        const b = r.pick([0.99, 0.995, 0.998]);
        const tl = H_MW / (b * C), g = gam(b), ans = Math.exp(-tl / (g * TAU_MU));
        return {
          prompt: t`In 1963 Frisch and Smith counted cosmic-ray muons near the summit of Mount Washington and again at sea level, ${H_MW} m lower. A muon coming straight down at $${b}c$ decays by the law $N = N_0\,e^{-\tau/\tau_0}$, where $\tau$ is the time on **its own** clock and $\tau_0 = 2.197\ \mu\text{s}$. What fraction of such muons survive the descent?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: Math.exp(-tl / TAU_MU), feedback: t`That uses Earth’s time for the descent. The decay law runs on the muon’s own clock, which records $\gamma$ times less.` },
            { value: Math.exp(-(tl * g) / TAU_MU), feedback: t`The muon’s clock records *less* time than Earth’s, not more: divide Earth’s time by $\gamma$.` },
          ],
          hints: [t`Earth’s time for the descent: $t = ${H_MW}\ \text{m}/(${b}\times2.998\times10^{8}\ \text{m/s}) = ${fmt(tl * 1e6, 4)}\ \mu\text{s}$.`, t`The muon’s own time is $\tau = t/\gamma$ with $\gamma = ${fmt(g, 4)}$; then $N/N_0 = e^{-\tau/\tau_0}$.`],
          teach: 'An unstable particle decays by its own clock: its survival over a trip depends on the proper time t/γ, not on the lab time t.',
          explain: t`$t = ${fmt(tl * 1e6, 4)}\ \mu\text{s}$ in Earth’s frame, $\tau = t/\gamma = ${fmt(tl / g * 1e6, 3)}\ \mu\text{s}$ on the muon’s clock, so $N/N_0 = e^{-${fmt(tl / g / TAU_MU, 3)}} = ${fmt(ans, 3)}$. Without time dilation only $e^{-${fmt(tl / TAU_MU, 3)}} = ${fmt(Math.exp(-tl / TAU_MU), 2)}$ would arrive. Frisch and Smith found far more than that at sea level, as relativity predicts.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 9], y: [0, 1.08], xlabel: 'time on the muon’s own clock, τ (μs)', ylabel: 'fraction surviving',
              constants: { tau0: TAU_MU * 1e6 },
              curves: [{ fn: 'exp(-x/tau0)', color: 'accent' }],
              vlines: [{ x: TAU_MU * 1e6, label: 'τ₀' }],
            },
            caption: t`The decay law $N/N_0 = e^{-\tau/\tau_0}$, in the muon’s own time. Every clock — including the muon’s internal one — runs on proper time.`,
          },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`A student writes the Lorentz transformation in ordinary units as $t' = \gamma(t - vx)$, $x' = \gamma(x - vt)$. What is wrong?`,
      choices: [
        t`The first line should be $t' = \gamma(t - vx/c^2)$: $vx$ is in $\text{m}^2/\text{s}$, not seconds`,
        t`The second line should be $x' = \gamma(x + vt)$`,
        t`$\gamma$ should divide both lines, not multiply them`,
        'Nothing: with time in seconds the two lines are correct',
      ],
      answer: 0,
      why: {
        1: t`$S'$ moves toward $+x$, so its origin $x' = 0$ must sit at $x = vt$: the minus sign is right.`,
        2: t`At $x = vt$ (the origin of $S'$), $t' = t/\gamma$: a moving clock runs slow. Multiplying by $\gamma$ gives exactly that once the $c^2$ is in place.`,
        3: t`Check the units: $t$ is in seconds but $vx$ is in $\text{m}^2/\text{s}$. The two cannot be subtracted.`,
      },
      hints: ['Check that both terms in each bracket have the same units.', t`From $ct' = \gamma(ct - \beta x)$, divide by $c$ and write $\beta = v/c$.`],
      teach: 'Restoring units in ct′ = γ(ct − βx) gives t′ = γ(t − vx/c²): the c² is what makes simultaneity relative only at enormous distances or speeds.',
      explain: t`Dividing $ct' = \gamma(ct - \beta x)$ by $c$ gives $t' = \gamma\left(t - \dfrac{vx}{c^2}\right)$. The $1/c^2$ is why the relativity of simultaneity is invisible in daily life: two events 1 km apart and simultaneous for you are separated, for a car at 30 m/s, by only $vx/c^2 \approx 3\times10^{-13}$ s.`,
      visual: frames({ beta: 0.4, range: 5, caption: t`The line $t' = 0$ (gold, through the origin) has slope $v/c$ on a diagram in $ct$ and $x$: the $vx/c^2$ term in $t'$ is that tilt, made dimensionless by $c^2$.` }),
    }),
    num({
      id: 'simultaneity', difficulty: 2,
      gen(r) {
        const [b, bt, g, gt] = r.pick(SPEEDS.slice(0, 2));
        const D = r.pick([4, 8, 10, 12]);
        const ans = g * b * D;
        return {
          prompt: t`Two stars ${D} light-years apart, at rest relative to each other, each flare at the same moment in their own frame. A starship flies from the first toward the second at $${bt}c$. In the starship’s frame, how many years before the first star’s flare does the second star’s flare happen?`,
          answer: ans, units: 'yr', tol: { rel: 0.005 },
          errors: [
            { value: b * D, feedback: t`You left out $\gamma = ${gt}$: $\Delta t' = \gamma(\Delta t - \beta\,\Delta x)$.` },
            { value: 0, feedback: 'Simultaneity is relative: events at the same time in one frame are not simultaneous in a frame moving along the line between them.' },
            { value: D / b, feedback: t`Multiply, don’t divide: with $\Delta t = 0$, $\Delta t' = -\gamma\beta\,\Delta x/c$.` },
          ],
          hints: [t`Put the first flare at $t = x = 0$ and the second at $t = 0$, $x = ${D}$ ly; the ship’s frame moves at $\beta = ${bt}$ toward $+x$.`, t`$t' = \gamma(t - \beta x) = ${gt}\times(0 - ${bt}\times${D})$ years.`],
          teach: 'Events simultaneous in one frame are separated in another by Δt′ = −γβΔx/c: the event ahead, in the direction of motion, happens first.',
          explain: t`$t' = \gamma(0 - \beta\times${D}\ \text{ly}) = -${nice(ans)}$ years: for the starship the flare ahead of it happens ${nice(ans)} years *earlier* than the one behind. Neither flare can affect the other — they are ${D} light-years apart and simultaneous in the stars’ frame, so they lie outside each other’s light cones — so no cause ever follows its effect.`,
          visual: frames({ beta: b, events: [[0, 0, 'first flare'], [0, D, 'second flare']], range: D + 1, xlabel: 'x (light-years)', ylabel: 't (years)', caption: t`Both flares sit on the stars’ line $t = 0$. The ship’s line of simultaneity through the first flare (the gold $x'$ axis) passes *above* the second: for the ship, the second flare is already in the past.` }),
        };
      },
    }),
    num({
      id: 'doppler', difficulty: 3,
      gen(r) {
        const b = r.pick([0.6, 0.8, 0.28]);
        const f = r.pick([2.3, 8.4, 32]);
        const k = Math.sqrt((1 - b) / (1 + b)), ans = f * k;
        return {
          prompt: t`A spacecraft recedes from Earth at $${b}c$ and transmits at ${f} GHz, measured on board. Derive the received frequency: crests leave every $T_0$ of the craft’s own time; in Earth’s frame, crest $n$ leaves at $t = \gamma nT_0$ from $x = \beta c\,t$ and then travels back to Earth at $c$. What frequency, in GHz, does Earth receive?`,
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [
            { value: f / gam(b), feedback: t`That is time dilation alone. The crests also leave from farther and farther away, which stretches their spacing by a further $1 + \beta$.` },
            { value: f * (1 - b), feedback: t`That is the non-relativistic Doppler rule. Include time dilation: the received period is $\gamma(1 + \beta)\,T_0$.` },
            { value: f / k, feedback: 'That is the frequency for an approaching craft. Receding sources are redshifted: lower frequency.' },
          ],
          hints: [t`Crest $n$ arrives at $t_n = \gamma nT_0 + \beta\gamma nT_0 = \gamma(1 + \beta)\,nT_0$, so the received period is $\gamma(1 + \beta)T_0$.`, t`$\gamma(1 + \beta) = \dfrac{1 + \beta}{\sqrt{(1 - \beta)(1 + \beta)}} = \sqrt{\dfrac{1 + \beta}{1 - \beta}}$; the frequency is divided by it.`],
          teach: 'The relativistic Doppler factor √((1 − β)/(1 + β)) for a receding source is time dilation (γ) times the growing light-travel delay (1 + β).',
          explain: t`The received period is $\gamma(1 + \beta)T_0 = \sqrt{\tfrac{1 + \beta}{1 - \beta}}\,T_0$, so $f_\text{rec} = ${f}\ \text{GHz}\times\sqrt{\tfrac{1 - ${b}}{1 + ${b}}} = ${fmt(ans, 4)}$ GHz. Deep-space tracking uses exactly this formula (expanded in the tiny $\beta$ of real probes) to measure a spacecraft’s speed from its radio signal.`,
          visual: dopplerSketch(b === 0.28 ? 0.6 : b, t`Two crests: sent from the receding craft (violet) and travelling back to Earth (blue) along 45° lines. ${b === 0.28 ? 'Drawn for 0.6c. ' : ''}The returns are spaced by $\gamma(1 + \beta)$ times the craft’s own period.`),
        };
      },
    }),
    order({
      id: 'derive-order', difficulty: 2,
      prompt: 'Put the steps of the derivation of the Lorentz transformation in order.',
      items: [
        t`Inertial motion stays inertial: the map is linear, $x' = Ax + B\,ct$, $ct' = Cx + D\,ct$.`,
        t`The origin of $S'$ moves along $x = \beta\,ct$, so $x' = A(x - \beta\,ct)$.`,
        t`Light moves along $x = \pm ct$ and $x' = \pm ct'$, so $ct' = A(ct - \beta x)$.`,
        t`The inverse must be the same map with $-\beta$, which forces $A^2(1 - \beta^2) = 1$.`,
        t`So $A = \gamma = 1/\sqrt{1 - \beta^2}$, and $(ct)^2 - x^2$ is the same in both frames.`,
      ],
      hints: ['Start from the most general form the map could take.', 'The constant in front, γ, is fixed last — by demanding that neither frame is special.'],
      teach: 'Linearity, the moving origin and the speed of light fix the form of the boost; the relativity principle fixes its overall factor γ.',
      explain: 'Each assumption removes unknowns: linearity leaves four constants; the moving origin and the two light rays leave one, A; reciprocity (the inverse is the boost with −β) sets A = γ. Interval invariance then follows as a check.',
      visual: frames({ beta: 0.6, range: 5, caption: t`The ingredients on one diagram: the moving origin (the gold $t'$ axis), the light rays (dashed), and the line $t' = 0$ (the gold $x'$ axis), for $\beta = 0.6$.` }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-starshot', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.pick([0.1, 0.15, 0.2]);
        const ans = 1064 * Math.sqrt((1 + b) / (1 - b));
        return {
          prompt: t`The proposed Breakthrough Starshot sail would coast toward Alpha Centauri at about $${b}c$ and could signal home with a laser of wavelength 1064 nm, measured on board. At what wavelength would the light arrive at Earth? Give 4 significant figures.`,
          answer: ans, units: 'nm', tol: { rel: 0.002 },
          errors: [
            { value: 1064 * (1 + b), feedback: t`That is the non-relativistic Doppler rule. With time dilation the factor is $\sqrt{(1 + \beta)/(1 - \beta)}$.` },
            { value: 1064 * Math.sqrt((1 - b) / (1 + b)), feedback: 'That is the blueshift of an approaching source. The sail is moving away from Earth: the light arrives redshifted, at a longer wavelength.' },
            { value: 1064 * gam(b), feedback: 'That is time dilation alone; the growing distance stretches the waves too.' },
          ],
          hints: ['For a receding source, wavelengths stretch by √((1 + β)/(1 − β)).', t`$\lambda = 1064\ \text{nm}\times\sqrt{(1 + ${b})/(1 - ${b})}$.`],
          teach: 'A receding source’s wavelength stretches by the relativistic Doppler factor √((1 + β)/(1 − β)).',
          explain: t`$\lambda = 1064\times\sqrt{${nice(1 + b)}/${nice(1 - b)}} = ${fmt(ans, 4)}$ nm — infrared light shifted further into the infrared. The receiver on Earth must be tuned for it, and the shift itself tells you the sail’s speed.`,
          visual: dopplerSketch(0.6, t`The same geometry as a receding radio craft: crests sent from the sail (violet) return to Earth (blue) spaced by $\gamma(1 + \beta)$ times the sail’s own period. Drawn for 0.6c so the stretch is visible.`),
        };
      },
    }),
    num({
      id: 'cp-contraction', difficulty: 2,
      gen(r) {
        const [b, bt, g, gt] = r.pick(SPEEDS);
        const L0 = r.pick([60, 100, 130, 260]);
        const ans = L0 / g;
        return {
          prompt: t`A rod of length $L_0 = ${L0}$ m lies at rest in $S'$, from $x' = 0$ to $x' = ${L0}$ m, and $S'$ moves at $\beta = ${bt}$ ($\gamma = ${gt}$). You measure its length by marking both ends at the same time $t$ in your frame. Using $x' = \gamma(x - \beta\,ct)$, what length do you find?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: L0 * g, feedback: t`At equal $t$, $\Delta x' = \gamma\,\Delta x$, so $\Delta x = L_0/\gamma$: the moving rod is shorter, not longer.` },
            { value: L0, feedback: 'Lengths along the motion are not the same in both frames once the ends are marked simultaneously in yours.' },
          ],
          hints: [t`Write $x' = \gamma(x - \beta\,ct)$ for each end at the same $t$ and subtract: the $ct$ terms cancel.`, t`$L_0 = \Delta x' = \gamma\,\Delta x$, so $\Delta x = L_0/\gamma$.`],
          teach: 'Marking both ends at the same time in your frame gives Δx′ = γΔx: a moving rod measures shorter by γ.',
          explain: t`At equal $t$, $\Delta x' = \gamma\,\Delta x$, so $\Delta x = ${L0}/${gt} = ${nice(ans)}$ m. The two marks are not simultaneous in $S'$ — that is why the frames can disagree about a length without either being wrong.`,
          visual: frames({ beta: round(b), segments: [[-1, round(-b), 7, round(7 * b), 'violet'], [-1, round(2.5 / g - b), 7, round(2.5 / g + 7 * b), 'violet'], [0, -0.4, 0, round(2.5 / g + 0.4), 'ink3', true]], range: 5, axes: false, caption: t`Not to scale: the worldlines of the rod’s two ends (violet, parallel to the gold $t'$ axis), and your line $t = 0$ across them (grey dashed), along which you mark both ends.` }),
        };
      },
    }),
    num({
      id: 'cp-superluminal', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([3, 4, 5]);
        const ans = a / Math.sqrt(1 + a * a);
        return {
          prompt: t`Radio astronomers see blobs in quasar jets crossing the sky at apparent speeds of several times $c$. A blob moving at $\beta c$ at angle $\theta$ to our line of sight appears to move sideways at $\beta_\text{app} = \dfrac{\beta\sin\theta}{1 - \beta\cos\theta}$ (light from its later positions has less far to travel), and the largest value of this over all angles is $\beta\gamma$. What is the smallest true speed $\beta$ that can produce an apparent $${a}c$? Give $\beta$ to four decimal places.`,
          answer: ans, tol: { rel: 0, abs: 0.0002 },
          errors: [
            { value: Math.sqrt(1 - 1 / (a * a)), feedback: t`That sets $\gamma = ${a}$. It is $\beta\gamma$ that must reach ${a}.` },
          ],
          hints: [t`Solve $\beta\gamma = \dfrac{\beta}{\sqrt{1 - \beta^2}} = ${a}$ for $\beta$.`, t`Square: $\beta^2 = ${a * a}(1 - \beta^2)$, so $\beta^2 = ${a * a}/${a * a + 1}$.`],
          teach: 'Apparent sideways speeds above c come from light-travel time; the largest apparent speed for true speed β is βγ.',
          explain: t`$\beta = \dfrac{${a}}{\sqrt{1 + ${a * a}}} = ${fmt(ans, 4)}$. Nothing moves faster than light: the blob is moving at just under $c$ almost straight at us, and it catches up with its own light, compressing the apparent time between its positions by $1 - \beta\cos\theta$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 90], y: [0, 7.5], xlabel: 'angle to the line of sight θ (degrees)', ylabel: 'apparent speed / c',
              curves: [0.9, 0.95, 0.99].map((b, k) => ({ fn: `${b}*sin(x*pi/180)/(1 - ${b}*cos(x*pi/180))`, domain: [0.5, 90], color: ['accent', 'violet', 'gold'][k], label: `β = ${b}`, labelAt: [40, 25, 13][k], labelDx: 6, labelDy: -10 })),
              hlines: [{ y: 1, label: 'c', color: 'ink3' }],
            },
            caption: t`Apparent sideways speed against viewing angle for three true speeds. Each curve peaks at $\beta\gamma$, at the angle where $\cos\theta = \beta$.`,
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 3 and L', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Carroll, Lecture Notes on General Relativity, §1.1–1.2', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Frisch & Smith (1963), Measurement of the relativistic time dilation using μ-mesons, Am. J. Phys. 31, 342', url: 'https://doi.org/10.1119/1.1969508' },
    { label: 'Breakthrough Starshot (a proposal, not a mission)', url: 'https://breakthroughinitiatives.org/initiative/3' },
  ],
});
