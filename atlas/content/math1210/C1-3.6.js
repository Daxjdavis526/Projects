// The chain rule — rates multiply along a chain of dependence: gravity
// depends on altitude, altitude on time; acceleration on mass, mass on time.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { curveFig, fitY } from './_c1kit.js';

const t = String.raw;
const G0 = 9.81, RE = 6371;                        // m/s², km
const gOf = (h) => G0 * (RE / (RE + h)) ** 2;      // h in km
const dgdh = (h) => -2 * G0 * RE * RE / (RE + h) ** 3;   // m/s² per km
const MU = 3.986e14;                               // Earth’s GM, m³/s²

// the rocket of the worked example and the find-the-error problem
const F = 900e3, M0 = 50000, MDOT = 250;

export default lesson({
  id: 'math1210.C1-3.6',
  title: 'The chain rule',
  minutes: 10, difficulty: 2,
  intro: t`When $y$ depends on $u$ and $u$ depends on $x$, a small change in $x$ is passed down the chain and **the rates multiply**:

$$\frac{dy}{dx} = \frac{dy}{du}\,\frac{du}{dx}$$

In function notation, $\big(f(g(x))\big)' = f'(g(x))\,g'(x)$: the derivative of the outside, evaluated at the inside, times the derivative of the inside. A climbing rocket is a chain: the gravity it feels depends on its altitude, and its altitude depends on time. Its acceleration depends on its mass, and its mass falls as it burns propellant.`,
  symbols: [
    { tex: 'x', text: 'the independent variable — often time $t$, in s' },
    { tex: 'u = g(x)', text: 'the **inner** function: the intermediate quantity, such as altitude' },
    { tex: 'y = f(u)', text: 'the **outer** function: the quantity you want, such as the gravitational acceleration' },
    { tex: '\\frac{dy}{du}', text: 'how fast $y$ changes per unit of $u$, evaluated at the current $u = g(x)$' },
    { tex: '\\frac{du}{dx}', text: 'how fast the inner quantity changes per unit of $x$' },
  ],
  why: t`Almost every physical rate is a chain — a rocket sees the air thin because it climbs, a satellite slows because its orbit grows — and the chain rule is also what makes substitution work in integrals.`,
  visual: {
    type: 'graph',
    title: 'Gravity felt by a climbing rocket',
    lead: t`The curve is the gravitational acceleration $g$ felt by a rocket climbing straight up with constant acceleration $a$, plotted against time. Drag the gold point to choose a moment. The readouts break the slope into the two links of the chain: how fast $g$ falls per kilometre of height, and how many kilometres per second the rocket climbs.`,
    tasks: [
      t`Check at several moments that $\frac{dg}{dh}\times\frac{dh}{dt}$ equals the measured slope of the curve.`,
      t`Early in the flight $dh/dt$ is small, so $g$ barely changes even though $dg/dh$ is at its largest.`,
      t`Double the acceleration: the rocket climbs faster, and $g$ falls off sooner.`,
    ],
    params: {
      x: [-8, 225], y: [6.7, 10.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'g (m/s²)',
      sliders: [{ key: 'a', label: t`Acceleration $a$`, min: 10, max: 40, step: 1, value: 25, unit: t`\text{m/s}^2`, explain: t`The rocket’s constant upward acceleration, so its altitude is $h = \tfrac12 a t^2$.` }],
      curves: [{ fn: '9.81*(6371/(6371 + 0.0005*a*x^2))^2', color: 'accent', domain: [0, 225] }],
      tangent: { fn: '9.81*(6371/(6371 + 0.0005*a*x^2))^2', at: 120 },
      readouts: [
        { label: t`altitude $h$`, expr: '0.0005*a*x0^2', unit: t`\text{km}`, digits: 3 },
        { label: t`$dh/dt$`, expr: '0.001*a*x0', unit: t`\text{km/s}`, digits: 3 },
        { label: t`$dg/dh$`, expr: '-2*9.81*6371^2/(6371 + 0.0005*a*x0^2)^3', unit: t`\text{m/s}^2\text{ per km}`, digits: 3 },
        { label: t`product $\frac{dg}{dh}\frac{dh}{dt}$`, expr: '-2*9.81*6371^2/(6371 + 0.0005*a*x0^2)^3*0.001*a*x0', unit: t`\text{m/s}^3`, digits: 3 },
        { label: 'slope of the curve', expr: 'slope', unit: t`\text{m/s}^3`, digits: 3 },
      ],
    },
    caption: t`$g = g_0\left(\frac{R}{R+h}\right)^2$ with $g_0 = 9.81\ \text{m/s}^2$ and $R = 6371$ km: a spherical Earth, inverse-square gravity. Constant acceleration straight up is a simplification; a real launch pitches over and its acceleration grows as propellant burns.`,
  },
  example: {
    prompt: t`A rocket with constant thrust $F = 900$ kN starts at mass $m_0 = 50\,000$ kg and burns propellant at $\dot m = 250$ kg/s, so $m(t) = m_0 - \dot m t$. Ignoring drag, its acceleration is $a(t) = \dfrac{F}{m(t)} - g$. How fast is the acceleration growing at $t = 100$ s?`,
    visual: curveFig({ fn: `${F}/(${M0} - ${MDOT}*x) - 9.81`, x: [-8, 175], y: [-5, 85], xlabel: 't (s)', ylabel: 'a (m/s²)', domain: [0, 165], at: 100, f: (x) => F / (M0 - MDOT * x) - 9.81, df: (x) => F * MDOT / (M0 - MDOT * x) ** 2, span: 40, caption: t`The acceleration climbs ever faster as the rocket gets lighter. Constant thrust, $g$ held at $9.81\ \text{m/s}^2$ and no drag are simplifications.` }),
    steps: [
      { label: 'Name the chain', text: t`$a$ depends on $m$ through $a = F m^{-1} - g$, and $m$ depends on $t$. Outer: $u \mapsto F u^{-1}$. Inner: $u = m(t)$.` },
      { label: 'Differentiate the outside', text: t`$\dfrac{da}{dm} = -F m^{-2}$, evaluated at the current mass. The constant $g$ drops out.` },
      { label: 'Differentiate the inside', text: t`$\dfrac{dm}{dt} = -\dot m = -250$ kg/s: the mass is falling.` },
      { label: 'Multiply', text: t`$\dfrac{da}{dt} = \dfrac{da}{dm}\dfrac{dm}{dt} = \left(-\dfrac{F}{m^2}\right)(-\dot m) = \dfrac{F\dot m}{m^2}$. Two minus signs: losing mass *raises* the acceleration.` },
      { label: 'Substitute', text: t`At $t = 100$ s, $m = 50\,000 - 250\times100 = 25\,000$ kg, so $\dfrac{da}{dt} = \dfrac{(9.0\times10^5)(250)}{(2.5\times10^4)^2} = 0.36\ \text{m/s}^3$.` },
      { label: 'Sense check', text: t`Units: $\text{N}\cdot\text{kg/s}/\text{kg}^2 = \text{m/s}^3$, a rate of change of acceleration (a *jerk*). The sign is positive, as the steepening curve demands.` },
    ],
    answer: t`$\dfrac{da}{dt} = \dfrac{F\dot m}{m^2} = 0.36\ \text{m/s}^3$ at $t = 100$ s.`,
  },
  practice: [
    mcq({
      id: 'outer-inner', difficulty: 1,
      prompt: t`What is $\dfrac{d}{dx}\sin(x^2)$?`,
      visual: curveFig({ fn: 'sin(x^2)', x: [-0.2, 3.2], y: [-1.4, 1.4], at: 1.5, f: (x) => Math.sin(x * x), df: (x) => 2 * x * Math.cos(x * x), span: 0.3, caption: t`$y = \sin(x^2)$ oscillates faster and faster as $x$ grows, so its slopes grow too.` }),
      choices: [t`$2x\cos(x^2)$`, t`$\cos(x^2)$`, t`$\cos(2x)$`, t`$2x\cos(2x)$`],
      answer: 0,
      why: {
        1: t`That differentiates the outside but forgets to multiply by the derivative of the inside, $2x$. It could never explain the steepening wiggles in the picture.`,
        2: t`The outer derivative is evaluated **at** the inside, $\cos(x^2)$; the inner derivative $2x$ multiplies it, it does not replace the inside.`,
        3: t`The inner derivative $2x$ multiplies the outer derivative; it does not replace $x^2$ inside the cosine.`,
      },
      hints: [t`Outer: $\sin u$, with $u = x^2$. Inner derivative: $2x$.`],
      teach: t`Outer derivative at the inside, times the inner derivative: $\cos(x^2)\cdot 2x$.`,
      explain: t`$\dfrac{d}{dx}\sin(x^2) = \cos(x^2)\cdot\dfrac{d}{dx}(x^2) = 2x\cos(x^2)$. The factor $2x$ is why the oscillations steepen as $x$ grows.`,
    }),
    expr({
      id: 'power-chain', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5]), a = r.pick([2, 3]), b = r.int(1, 5);
        const inner = `${a}x^2 + ${b}`;
        return {
          prompt: t`Differentiate $f(x) = (${inner})^{${n}}$.`,
          lhs: t`f'(x)`,
          answer: `${n}*(${inner})^${n - 1}*${2 * a}x`,
          answerTeX: t`${2 * a * n}x\,(${inner})^{${n - 1}}`,
          vars: { x: [-1.2, 1.2] }, derivativeOf: `(${inner})^${n}`,
          errors: [{ answer: `${n}*(${inner})^${n - 1}`, feedback: t`You differentiated the outside only. Multiply by the derivative of the inside, $${2 * a}x$.` }, { answer: `${n}*(${2 * a}x)^${n - 1}`, feedback: t`The outer derivative is evaluated at the inside itself, $${inner}$, not at its derivative.` }],
          hints: [t`Outer: $u^{${n}}$, with $u = ${inner}$.`, t`$\dfrac{d}{du}u^{${n}} = ${n}u^{${n - 1}}$ and $\dfrac{du}{dx} = ${2 * a}x$. Multiply.`],
          teach: t`For a power of a function, $\frac{d}{dx}u^n = n u^{n-1}\,u'$ — the power rule plus the chain rule.`,
          explain: t`$${n}(${inner})^{${n - 1}}\cdot ${2 * a}x = ${2 * a * n}x(${inner})^{${n - 1}}$. It is zero at $x = 0$, where the even function $f$ has its minimum.`,
          visual: curveFig({ fn: `(${inner})^${n}`, x: [-1.2, 1.2], y: fitY((x) => (a * x * x + b) ** n, -1.2, 1.2), caption: t`$y = (${inner})^{${n}}$, symmetric about $x = 0$.` }),
        };
      },
    }),
    expr({
      id: 'oscillator-v', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 5]), w = r.pick([2, 3, 4]);
        return {
          prompt: t`A mass on a spring has position $x(t) = ${A}\cos(${w}t)$ cm, with $t$ in seconds. Find its velocity $v(t) = x'(t)$ in cm/s.`,
          lhs: t`v(t)`,
          answer: `-${A * w}*sin(${w}t)`, answerTeX: t`-${A * w}\sin(${w}t)`,
          vars: { t: [-2, 2] }, derivativeOf: `${A}*cos(${w}*t)`,
          errors: [{ answer: `-${A}*sin(${w}t)`, feedback: t`The inside is $${w}t$, whose derivative is $${w}$: the velocity carries a factor of the angular frequency.` }, { answer: `${A * w}*sin(${w}t)`, feedback: t`$\frac{d}{du}\cos u = -\sin u$: check the sign.` }],
          hints: [t`Outer: $${A}\cos u$; inner: $u = ${w}t$, so $du/dt = ${w}$.`],
          teach: t`$\frac{d}{dt}\cos(\omega t) = -\omega\sin(\omega t)$: every derivative of an oscillation brings out a factor $\omega$.`,
          explain: t`$v = ${A}\cdot(-\sin(${w}t))\cdot ${w} = -${A * w}\sin(${w}t)$ cm/s. The peak speed is $A\omega = ${A * w}$ cm/s, reached as the mass passes through the centre.`,
          visual: curveFig({ fn: `${A}*cos(${w}*x)`, x: [-0.1, 3.2], y: [-A * 1.35, A * 1.35], xlabel: 't (s)', ylabel: 'x (cm)', domain: [0, 3.2], caption: t`Position against time: amplitude $${A}$ cm, angular frequency $${w}$ rad/s. Undamped — a real spring loses energy.` }),
        };
      },
    }),
    num({
      id: 'lapse-rate', difficulty: 2,
      gen(r) {
        const v = r.pick([6, 8, 10, 12, 15]);
        const ans = -6.5 * v / 1000;
        return {
          prompt: t`In the standard atmosphere, the air temperature falls by $6.5$ K for every kilometre of altitude. An aircraft climbs at $${v}$ m/s. How fast does the outside air temperature change, in K/s?`,
          answer: ans, units: 'K/s', difference: true, tol: { rel: 0.005 },
          errors: [{ value: -6.5 * v, feedback: t`Watch the units: $6.5$ K per **kilometre** times $${v}$ **metres** per second. Convert the climb rate to $${nice(v / 1000)}$ km/s first.` }],
          hints: [t`$\dfrac{dT}{dt} = \dfrac{dT}{dh}\,\dfrac{dh}{dt}$, with $\dfrac{dT}{dh} = -6.5$ K/km.`, t`$\dfrac{dh}{dt} = ${v}$ m/s $= ${nice(v / 1000)}$ km/s.`],
          teach: t`In Leibniz form the units chain too: (K/km) × (km/s) = K/s.`,
          explain: t`$\dfrac{dT}{dt} = (-6.5\ \text{K/km})(${nice(v / 1000)}\ \text{km/s}) = ${nice(ans)}$ K/s — about $${nice(-ans * 60, 3)}$ K colder every minute.`,
          visual: curveFig({ fn: '288.15 - 6.5*x', x: [-0.5, 12], y: [205, 300], xlabel: 'h (km)', ylabel: 'T (K)', domain: [0, 11], caption: t`The International Standard Atmosphere’s troposphere: $15^\circ$C at sea level, falling $6.5$ K/km to $11$ km. Real profiles vary from day to day.` }),
        };
      },
    }),
    num({
      id: 'gravity-climb', difficulty: 3,
      gen(r) {
        const h = r.pick([200, 300, 400, 600, 800]), v = r.pick([2, 3, 4, 5]);
        const ans = dgdh(h) * v;
        return {
          prompt: t`The gravitational acceleration at altitude $h$ is $g(h) = g_0\left(\dfrac{R}{R+h}\right)^2$, with $g_0 = 9.81\ \text{m/s}^2$ and $R = 6371$ km. A rocket passes $h = ${h}$ km climbing at $${v}$ km/s. How fast is the $g$ it feels changing, in $\text{m/s}^3$?`,
          answer: ans, units: 'm/s^3', tol: { rel: 0.005 },
          errors: [{ value: dgdh(h), feedback: t`That is $dg/dh$, per kilometre of altitude. Multiply by the climb rate $dh/dt = ${v}$ km/s.` }, { value: 2 * G0 * RE * RE / (RE + h) ** 3 * v, feedback: t`Check the sign: $g$ falls as the rocket climbs.` }],
          hints: [t`Write $g = g_0 R^2 (R+h)^{-2}$, so $\dfrac{dg}{dh} = -2g_0 R^2 (R+h)^{-3}$.`, t`Evaluate $dg/dh$ at $h = ${h}$ km (it comes out in $\text{m/s}^2$ per km), then multiply by $dh/dt = ${v}$ km/s.`],
          teach: t`$\frac{dg}{dt} = \frac{dg}{dh}\frac{dh}{dt}$: the rocket feels gravity weaken only because it moves.`,
          explain: t`$\dfrac{dg}{dh} = -\dfrac{2(9.81)(6371)^2}{(${RE + h})^3} = ${tex(dgdh(h), 4)}\ \text{m/s}^2$ per km, so $\dfrac{dg}{dt} = ${tex(dgdh(h), 4)}\times ${v} = ${tex(ans, 3)}\ \text{m/s}^3$.`,
          visual: curveFig({ fn: '9.81*(6371/(6371 + x))^2', x: [-40, 1050], y: [6.8, 10.2], xlabel: 'h (km)', ylabel: 'g (m/s²)', domain: [0, 1050], points: [{ x: h, y: gOf(h), color: 'gold', label: `${h} km` }], caption: t`Gravity against altitude for a spherical Earth. Even at $${h}$ km it is still $${nice(gOf(h), 3)}\ \text{m/s}^2$ — orbit is free fall, not the absence of gravity.` }),
        };
      },
    }),
    expr({
      id: 'cos-cubed', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 4]);
        return {
          prompt: t`Differentiate $f(x) = \cos^3(${k}x)$, which means $\big(\cos(${k}x)\big)^3$.`,
          lhs: t`f'(x)`,
          answer: `-${3 * k}*cos(${k}x)^2*sin(${k}x)`, answerTeX: t`-${3 * k}\cos^2(${k}x)\sin(${k}x)`,
          vars: { x: [-1.5, 1.5] }, derivativeOf: `cos(${k}*x)^3`,
          errors: [
            { answer: `-3*cos(${k}x)^2*sin(${k}x)`, feedback: t`One link is missing: the innermost function is $${k}x$, with derivative $${k}$.` },
            { answer: `3*cos(${k}x)^2`, feedback: t`You stopped after the outermost layer. The cosine inside must be differentiated too.` },
          ],
          hints: [t`Three layers, outside in: a cube, a cosine, and $${k}x$.`, t`Cube: $3u^2$ with $u = \cos(${k}x)$. Cosine: $-\sin(${k}x)$. Innermost: $${k}$.`, t`Multiply all three: $3\cos^2(${k}x)\cdot(-\sin(${k}x))\cdot ${k}$.`],
          teach: t`Peel a nested function from the outside in, multiplying one derivative per layer.`,
          explain: t`$f'(x) = 3\cos^2(${k}x)\cdot\big(-\sin(${k}x)\big)\cdot ${k} = -${3 * k}\cos^2(${k}x)\sin(${k}x)$.`,
          visual: curveFig({ fn: `cos(${k}*x)^3`, x: [-1.6, 1.6], y: [-1.35, 1.35], caption: t`$y = \cos^3(${k}x)$: flatter-topped than a cosine, but with the same zeros.` }),
        };
      },
    }),
    mcq({
      id: 'find-error-jerk', difficulty: 3, kind: 'error',
      prompt: t`For the rocket of the worked example, a student writes

$$a(t) = \frac{F}{m_0 - \dot m t} - g \quad\Longrightarrow\quad a'(t) = -\frac{F}{(m_0 - \dot m t)^2}.$$

What is wrong?`,
      visual: curveFig({ fn: `${F}/(${M0} - ${MDOT}*x) - 9.81`, x: [-8, 175], y: [-5, 85], xlabel: 't (s)', ylabel: 'a (m/s²)', domain: [0, 165], caption: t`The rocket’s acceleration rises through the burn — so its derivative must be positive.` }),
      choices: [
        t`The inner derivative $-\dot m$ is missing; with it, $a'(t) = +\dfrac{F\dot m}{(m_0 - \dot m t)^2}$`,
        t`The derivative of $\dfrac{1}{u}$ is $+\dfrac{1}{u^2}$, so only the sign is wrong`,
        t`The thrust $F$ must be differentiated as well`,
        t`Nothing — acceleration falls as propellant burns`,
      ],
      answer: 0,
      why: {
        1: t`$\frac{d}{du}u^{-1} = -u^{-2}$ is right. The sign flips only when you multiply by the inner derivative $-\dot m$ — and that factor also supplies the missing kg/s.`,
        2: t`The thrust is constant here, so its derivative is $0$.`,
        3: t`The graph rises: a lighter rocket under the same thrust accelerates harder. The student’s formula is negative everywhere.`,
      },
      hints: [t`Check the units of the student’s answer: $\text{N}/\text{kg}^2$ is not $\text{m/s}^3$.`, t`The inside is $u = m_0 - \dot m t$. What is $du/dt$?`],
      teach: t`Forgetting the inner derivative breaks the units and, here, the sign — two checks that catch it.`,
      explain: t`$a'(t) = -F(m_0 - \dot m t)^{-2}\cdot(-\dot m) = \dfrac{F\dot m}{(m_0 - \dot m t)^2} > 0$. The factor $\dot m$ (kg/s) is exactly what turns $\text{N}/\text{kg}^2$ into $\text{m/s}^3$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-range', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, 4, 5, 6]);
        return {
          prompt: t`An aircraft flies at altitude $${c}$ km. When its ground distance from a radar dish is $x$ km, its straight-line range is $r = \sqrt{x^2 + ${c * c}}$ km. Find $\dfrac{dr}{dx}$.`,
          lhs: t`\frac{dr}{dx}`,
          answer: `x/sqrt(x^2 + ${c * c})`, answerTeX: t`\frac{x}{\sqrt{x^2 + ${c * c}}}`,
          vars: { x: [-8, 8] }, derivativeOf: `sqrt(x^2 + ${c * c})`,
          errors: [{ answer: `1/(2*sqrt(x^2 + ${c * c}))`, feedback: t`Multiply by the inner derivative $2x$.` }],
          hints: [t`Outer: $\sqrt u = u^{1/2}$; inner: $u = x^2 + ${c * c}$.`],
          teach: t`$\frac{d}{dx}\sqrt{u} = \frac{u'}{2\sqrt u}$.`,
          explain: t`$\dfrac{dr}{dx} = \dfrac{2x}{2\sqrt{x^2 + ${c * c}}} = \dfrac{x}{\sqrt{x^2 + ${c * c}}}$. It is $0$ overhead and approaches $1$ far away, where range and ground distance grow together.`,
          visual: curveFig({ fn: `sqrt(x^2 + ${c * c})`, x: [-15, 15], y: [0, 17], xlabel: 'x (km)', ylabel: 'r (km)', caption: t`Range against ground distance: rounded near overhead, where the aircraft is ${c} km away even at $x = 0$, and nearly the straight lines $r = |x|$ far out. Flat Earth assumed.` }),
        };
      },
    }),
    num({
      id: 'cp-spiral', difficulty: 3, transfer: true,
      gen(r) {
        const rk = r.pick([6700, 6750, 6800, 6900]), dr = r.pick([2, 3, 4, 5]);
        const v = Math.sqrt(MU / (rk * 1000)), ans = -v / (2 * rk) * dr;
        return {
          prompt: t`A satellite in a circular orbit of radius $r$ moves at $v = \sqrt{GM/r}$, with $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ for Earth. Its electric thrusters spiral it slowly outward, raising $r$ by $${dr}$ km per day. At $r = ${rk}$ km, how fast does its orbital speed change, in m/s per day?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: -ans, feedback: t`Check the sign: $v = \sqrt{GM/r}$ falls as $r$ grows. Thrusting forward to climb leaves the satellite **slower**.` }],
          hints: [t`$\dfrac{dv}{dt} = \dfrac{dv}{dr}\dfrac{dr}{dt}$, and $v = \sqrt{GM}\,r^{-1/2}$ gives $\dfrac{dv}{dr} = -\dfrac{v}{2r}$.`, t`$v = ${nice(v, 4)}$ m/s at this radius; $-\dfrac{v}{2r}$ is in (m/s) per km when $r$ is in km.`],
          teach: t`Through the chain rule, a slow change in orbit size becomes a slow change in speed — of the opposite sign.`,
          explain: t`$v = \sqrt{3.986\times10^{14}/(${tex(rk * 1000, 3)})} = ${nice(v, 4)}$ m/s; $\dfrac{dv}{dr} = -\dfrac{${nice(v, 4)}}{2\times ${rk}} = ${nice(-v / (2 * rk), 3)}$ (m/s)/km; times $${dr}$ km/day gives $${nice(ans, 3)}$ m/s per day.`,
          visual: curveFig({ fn: `sqrt(${MU}/(x*1000))`, x: [6400, 12200], y: [5500, 8100], xlabel: 'r (km)', ylabel: 'v (m/s)', domain: [6500, 12200], points: [{ x: rk, y: v, color: 'gold', label: `${rk} km` }], caption: t`Circular-orbit speed against radius. The spiral is slow enough that the orbit stays nearly circular at every moment, which is what lets $v = \sqrt{GM/r}$ apply throughout.` }),
        };
      },
    }),
    mcq({
      id: 'cp-table', difficulty: 2,
      prompt: t`Suppose $g(2) = 5$, $g'(2) = 3$, $f'(2) = 4$ and $f'(5) = -1$. What is $\dfrac{d}{dx}f(g(x))$ at $x = 2$?`,
      choices: ['−3', '12', '−1', '3'],
      answer: 0,
      why: {
        1: t`That uses $f'(2)$, but the outer derivative must be evaluated at the inside, $g(2) = 5$.`,
        2: t`That is $f'(g(2))$ alone; multiply by the inner derivative $g'(2) = 3$.`,
        3: t`That is the inner derivative alone; multiply by the outer derivative $f'(5)$.`,
      },
      hints: [t`$(f\circ g)'(2) = f'(g(2))\cdot g'(2)$.`],
      teach: t`The outer derivative is evaluated at the inner function’s value, not at $x$.`,
      explain: t`$f'(g(2))\,g'(2) = f'(5)\cdot 3 = (-1)(3) = -3$.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §3.6 The chain rule', url: 'https://openstax.org/books/calculus-volume-1/pages/3-6-the-chain-rule' }],
});
