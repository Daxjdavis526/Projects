// Substitutions that tame nonlinear first-order equations: Bernoulli
// (v = y^(1−n) makes it linear), homogeneous (v = y/x makes it separable),
// and y′ = G(at + by). The worked example is an aircraft flying towards an
// airfield through a crosswind.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;
const co = (k) => (k === 1 ? '' : k === -1 ? '-' : String(k));
// the worked example: k = 0.2, a = 200 km; the farthest point north is where u^(2k) = (1 − k)/(1 + k), u = x/a
const U = (0.8 / 1.2) ** 2.5, YMAX = 100 * (U ** 0.8 - U ** 1.2);

export default lesson({
  id: 'math2280.DE-2.4',
  title: 'Substitutions: Bernoulli and homogeneous',
  minutes: 12, difficulty: 3,
  intro: t`Some nonlinear equations turn linear or separable after a change of variable. A **Bernoulli** equation has a power of $y$ on the right; the new unknown $v = y^{1-n}$ makes it linear:

$$y' + p(t)\,y = q(t)\,y^n \quad\xrightarrow{\;v\, =\, y^{1-n}\;}\quad v' + (1-n)\,p(t)\,v = (1-n)\,q(t)$$

A **homogeneous** equation $y' = F(y/x)$ depends only on the ratio $y/x$; writing $y = xv$ turns it into the separable $x\,v' = F(v) - v$. And $y' = G(at + by)$ becomes separable with $u = at + by$. Each time the recipe is the same: substitute, solve the easier equation, and translate back.`,
  symbols: [
    { tex: t`n`, text: t`the power of $y$ in a Bernoulli equation; $n = 0$ and $n = 1$ are already linear` },
    { tex: t`v = y^{1-n}`, text: t`the new unknown for Bernoulli: then $v' = (1 - n)\,y^{-n}y'$, which is what removes the power` },
    { tex: t`F(y/x)`, text: t`the slope of a homogeneous equation, a function of the ratio $y/x$ alone — the same along every ray from the origin` },
    { tex: t`v = y/x`, text: t`the new unknown for a homogeneous equation; $y = xv$ gives $y' = v + xv'$` },
  ],
  why: t`Substitution is how nonlinear models are tamed in practice: the logistic law, drag with linear and quadratic parts, and an aircraft holding its heading on a target through a crosswind all become solvable this way.`,
  visual: {
    type: 'graph',
    title: 'Flying towards an airfield through a crosswind',
    lead: t`A pilot starts a distance $a$ east of an airfield and always points the nose at it, flying at airspeed $v_0$, while a wind of speed $w$ blows north. The path obeys the **homogeneous** equation $\dfrac{dy}{dx} = \dfrac{y}{x} - k\sqrt{1 + (y/x)^2}$ with $k = w/v_0$, and the substitution $y = xv$ solves it: $y = \tfrac{a}{2}\left[(x/a)^{1-k} - (x/a)^{1+k}\right]$.`,
    tasks: [
      'Keep k small: the plane bows a little north but still reaches the airfield.',
      'Set k = 1, wind as fast as the plane: it ends up a/2 north of the field, flying flat out against the wind and getting nowhere.',
      'Push k above 1: the wind wins and carries the plane away for ever.',
    ],
    params: {
      x: [-0.05, 1.1], y: [-0.1, 1.05], equal: true, xlabel: 'x / a (east)', ylabel: 'y / a',
      sliders: [{ key: 'k', label: 'Wind ratio $k = w/v_0$', min: 0, max: 1.5, step: 0.05, value: 0.4, unit: '', explain: 'The wind speed as a fraction of the plane’s airspeed.' }],
      curves: [{ fn: '0.5*(x^(1 - k) - x^(1 + k))', domain: [0.0005, 1], color: 'accent', width: 2.8, label: 'flight path', labelAt: 0.62, labelDx: 6, labelDy: -14 }],
      points: [{ x: 0, y: 0, color: 'good', label: 'airfield', labelDx: 8, labelDy: 14 }, { x: 1, y: 0, color: 'gold', label: 'start', labelDx: -12, labelDy: 14 }],
      arrows: [{ from: [0.9, 0.55], to: [0.9, 0.85], color: 'teal', label: 'wind', labelDx: 8, labelDy: 0 }],
      readouts: [{ label: 'northward drift halfway home, $y(a/2)/a$', expr: '0.5*(0.5^(1 - k) - 0.5^(1 + k))', digits: 3 }],
    },
    caption: t`Steady, uniform wind and constant airspeed; the pilot steers continuously at the airfield (a “pursuit” course), and the Earth is flat on this scale. Distances in units of the starting distance $a$.`,
  },
  example: {
    prompt: t`Derive the path above. The plane is at $(x, y)$ with the airfield at the origin; it flies at $v_0$ towards the origin, and the wind adds $w$ northward. Show that $y = \tfrac a2\left[(x/a)^{1-k} - (x/a)^{1+k}\right]$ with $k = w/v_0$, and find how far north the plane strays when $a = 200$ km, $v_0 = 500$ km/h and $w = 100$ km/h.`,
    visual: {
      type: 'graph',
      params: {
        x: [-10, 215], y: [-8, 40], xlabel: 'x (km east)', ylabel: 'y (km)',
        curves: [{ fn: `200*0.5*((x/200)^0.8 - (x/200)^1.2)`, domain: [0.05, 200], color: 'accent', width: 2.6 }],
        points: [{ x: 0, y: 0, color: 'good', label: 'airfield', labelDx: 6, labelDy: 14 }, { x: 200, y: 0, color: 'gold', label: 'start', labelDx: -30, labelDy: 14 }, { x: 200 * U, y: YMAX, color: 'violet', label: 'farthest north', labelDx: 8, labelDy: -12 }],
      },
      caption: t`The path for $k = 0.2$. The vertical scale is stretched about three times to show the bow.`,
    },
    steps: [
      { label: 'Velocity', text: t`With $r = \sqrt{x^2 + y^2}$, the plane’s own velocity points at the origin and the wind adds to it: $\dfrac{dx}{dt} = -v_0\dfrac{x}{r}$, $\;\dfrac{dy}{dt} = -v_0\dfrac{y}{r} + w$.` },
      { label: 'Divide', text: t`$\dfrac{dy}{dx} = \dfrac{-v_0 y/r + w}{-v_0x/r} = \dfrac{y - kr}{x} = \dfrac yx - k\sqrt{1 + \left(\dfrac yx\right)^2}$ for $x > 0$: a function of $y/x$ alone, so homogeneous.` },
      { label: 'Substitute', text: t`With $y = xv$, $y' = v + xv'$, so $v + xv' = v - k\sqrt{1 + v^2}$, that is $x\,v' = -k\sqrt{1 + v^2}$ — separable.` },
      { label: 'Separate and integrate', text: t`$\dfrac{dv}{\sqrt{1 + v^2}} = -k\,\dfrac{dx}{x}$ gives $\operatorname{arsinh} v = -k\ln x + C$. At the start $x = a$, $y = 0$, so $v = 0$ and $C = k\ln a$: $\;\operatorname{arsinh} v = -k\ln(x/a)$.` },
      { label: 'Translate back', text: t`$v = \sinh\!\big(-k\ln(x/a)\big) = \tfrac12\left[(x/a)^{-k} - (x/a)^{k}\right]$, and $y = xv = \tfrac a2\left[(x/a)^{1-k} - (x/a)^{1+k}\right]$.` },
      { label: 'Farthest north', text: t`With $k = 100/500 = 0.2$, set $dy/dx = 0$: $(1 - k)u^{-k} = (1 + k)u^{k}$ for $u = x/a$, so $u = \left(\tfrac{0.8}{1.2}\right)^{2.5} = ${fmt(U, 3)}$ and $y = 100\left(u^{0.8} - u^{1.2}\right) \approx ${fmt(YMAX, 3)}$ km.` },
      { label: 'Sense check', text: t`$k = 0$ gives $y = 0$, a straight line in. For $k < 1$ both powers of $x/a$ are positive, so $y \to 0$: the plane arrives. For $k = 1$, $y \to a/2$.` },
    ],
    answer: t`$y = \tfrac a2\left[(x/a)^{1-k} - (x/a)^{1+k}\right]$; with $k = 0.2$ the plane strays at most about ${Math.round(YMAX)} km north.`,
  },
  practice: [
    mcq({
      id: 'which-v', difficulty: 1,
      prompt: t`Which substitution turns $y' + 2y = e^{t}\,y^3$ into a linear equation?`,
      choices: [t`$v = y^{-2}$`, t`$v = y^{3}$`, t`$v = y^{2}$`, t`$v = y/t$`],
      answer: 0,
      why: {
        1: t`For a Bernoulli equation with power $n$, use $v = y^{1-n}$; with $n = 3$ that is $y^{-2}$, not $y^{3}$.`,
        2: t`Close: the exponent is $1 - n = 1 - 3 = -2$, so the power is negative.`,
        3: t`$v = y/t$ is for homogeneous equations, whose right side depends on $y/t$ alone; here $e^t y^3$ does not.`,
      },
      hints: [t`This is Bernoulli with $n = 3$.`, t`Use $v = y^{1-n}$.`],
      teach: 'For a Bernoulli equation y′ + p y = q yⁿ, the substitution v = y^(1−n) gives a linear equation.',
      explain: t`$n = 3$, so $v = y^{-2}$. Then $v' = -2y^{-3}y'$; multiplying the equation by $-2y^{-3}$ gives $v' - 4v = -2e^t$, which is linear.`,
      visual: { type: 'de-slopefield', params: { f: 'exp(t)*y^3 - 2*y', x: [-1, 2], y: [-2, 2], grid: [17, 14], seeds: [[-1, 1.2], [-1, 0.5], [-1, -1]], seedColor: 'accent2' }, caption: t`The slope field of $y' = e^t y^3 - 2y$ with three solutions. The cube makes it nonlinear: some solutions blow up, others decay.` },
    }),
    expr({
      id: 'logistic-bernoulli', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 1], [2, 1], [1, 0.5], [3, 1]]);
        const K = a / b, y0 = r.pick([0.25, 0.5]) * K, c = 1 / y0 - 1 / K;
        const ans = `1/(${1 / K} + ${c}*exp(-${a}t))`;
        return {
          prompt: t`Solve $y' = ${co(a)}y - ${b === 1 ? '' : b}y^2$ with $y(0) = ${nice(y0)}$ by the substitution $v = 1/y$.`,
          answer: ans, answerTeX: t`y = \dfrac{1}{${nice(1 / K)} + ${nice(c)}\,e^{-${co(a)}t}}`, lhs: 'y',
          vars: { t: [-0.5, 3] },
          integrand: `${a}*(${ans}) - ${b}*(${ans})^2`,
          errors: [{ answer: `1/(${1 / K} + ${1 / y0}*exp(-${a}t))`, feedback: t`Fix the constant from $v(0) = 1/y(0) = ${nice(1 / y0)}$: $\;${nice(1 / K)} + C = ${nice(1 / y0)}$.` }, { answer: `${1 / K} + ${c}*exp(-${a}t)`, feedback: t`That is $v$. Translate back: $y = 1/v$.` }],
          hints: [t`$v = 1/y$ gives $v' = -y'/y^2 = -${co(a)}\,\dfrac1y + ${b} = -${co(a)}v + ${b}$.`, t`So $v' + ${co(a)}v = ${b}$: $v = ${nice(1 / K)} + Ce^{-${co(a)}t}$, with $C$ from $v(0) = ${nice(1 / y0)}$.`],
          teach: 'The logistic equation is Bernoulli with n = 2: the reciprocal 1/y obeys a linear equation.',
          explain: t`$v = ${nice(1 / K)} + ${nice(c)}e^{-${co(a)}t}$, so $y = \dfrac{1}{${nice(1 / K)} + ${nice(c)}e^{-${co(a)}t}}$. As $t \to \infty$, $y \to ${nice(K)}$: the carrying capacity $a/b$. No partial fractions were needed.`,
          visual: { type: 'de-slopefield', params: { f: `${a}*y - ${b}*y^2`, x: [0, 4], y: [0, 1.3 * K], grid: [17, 13], points: [{ x: 0, y: y0, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = ${co(a)}y - ${b === 1 ? '' : b}y^2$, a logistic equation, with the starting point.` },
        };
      },
    }),
    expr({
      id: 'homogeneous', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3]);
        const ans = `x*sqrt(2*ln(x) + ${c * c})`;
        return {
          prompt: t`Solve $\dfrac{dy}{dx} = \dfrac{x^2 + y^2}{xy}$ for $x > 0$, with $y(1) = ${c}$.`,
          answer: ans, answerTeX: t`y = x\sqrt{2\ln x + ${c * c}}`, lhs: 'y',
          vars: { x: [1, 3] },
          integrand: `(x^2 + (${ans})^2)/(x*(${ans}))`,
          errors: [...(c > 1 ? [{ answer: `x*sqrt(2*ln(x) + ${c})`, feedback: t`At $x = 1$, $v = y/x = ${c}$, so $v^2 = ${c * c}$ fixes the constant.` }] : []), { answer: `sqrt(2*ln(x) + ${c * c})`, feedback: t`That is $v = y/x$. Translate back: $y = xv$.` }],
          hints: [t`Divide top and bottom by $x^2$: $\dfrac{dy}{dx} = \dfrac{1 + (y/x)^2}{y/x}$. Set $y = xv$.`, t`$v + xv' = \dfrac{1 + v^2}{v} = \dfrac1v + v$, so $x\,v' = \dfrac1v$: separate, $v\,dv = \dfrac{dx}{x}$.`],
          teach: 'For y′ = F(y/x), put y = xv: the v terms cancel down to the separable x v′ = F(v) − v.',
          explain: t`$\tfrac12 v^2 = \ln x + C$ and $v(1) = ${c}$ gives $C = ${nice(c * c / 2)}$, so $v = \sqrt{2\ln x + ${c * c}}$ and $y = x\sqrt{2\ln x + ${c * c}}$.`,
          visual: { type: 'de-slopefield', params: { f: '(t^2 + y^2)/(t*y)', x: [0.3, 3], y: [0.3, 6], xlabel: 'x', grid: [17, 14], points: [{ x: 1, y: c, color: 'gold', label: `(1, ${c})` }] }, caption: t`The slope field of $y' = (x^2 + y^2)/(xy)$: along any ray from the origin the segments are parallel — the mark of a homogeneous equation.` },
        };
      },
    }),
    num({
      id: 'two-drags', difficulty: 3,
      gen(r) {
        const v0 = r.pick([8, 10, 12]), al = r.pick([0.1, 0.2]), be = r.pick([0.02, 0.05]), T = r.pick([5, 10]);
        const w0 = 1 / v0 + be / al, v = 1 / (w0 * Math.exp(al * T) - be / al);
        return {
          prompt: t`A small torpedo coasts with its motor off, slowed by drag with a linear and a quadratic part: $v' = -${al}\,v - ${be}\,v^2$ ($v$ in m/s, $t$ in s). It starts at ${v0} m/s. Using the Bernoulli substitution $w = 1/v$, find its speed after ${T} s.`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: v0 * Math.exp(-al * T), feedback: 'That keeps only the linear drag; the quadratic part slows it further.' }, { value: v0 / (1 + be * v0 * T), feedback: 'That keeps only the quadratic drag; the linear part slows it further.' }],
          hints: [t`$w = 1/v$ gives $w' = -v'/v^2 = ${al}\,w + ${be}$: linear.`, t`$w = -\dfrac{${be}}{${al}} + Ce^{${al}t}$ with $w(0) = \dfrac{1}{${v0}}$, so $C = \dfrac1{${v0}} + \dfrac{${be}}{${al}}$.`, t`Evaluate $w(${T})$ and take $v = 1/w$.`],
          teach: 'Drag with linear and quadratic parts, v′ = −αv − βv², is Bernoulli with n = 2: w = 1/v grows exponentially.',
          explain: t`$C = ${nice(1 / v0)} + ${nice(be / al)} = ${nice(w0)}$, so $w(${T}) = ${nice(w0)}\,e^{${nice(al * T)}} - ${nice(be / al)} = ${fmt(1 / v, 4)}$ s/m and $v = ${fmt(v, 3)}$ m/s. Both drags together slow it more than either alone.`,
          visual: { type: 'graph', params: { x: [0, 15], y: [0, v0 * 1.05], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${v0}*exp(-${al}x)`, color: 'violet', dash: true, width: 1.8, label: 'linear drag only', labelAt: 9, labelDy: -12 }, { fn: `${v0}/(1 + ${be * v0}x)`, color: 'teal', dash: true, width: 1.8, label: 'quadratic drag only', labelAt: 3, labelDx: 8 }] }, caption: 'Coasting with only one of the two drags (dashed). With both, the speed falls below both curves.' },
        };
      },
    }),
    mcq({
      id: 'forgot-factor', difficulty: 2, kind: 'error',
      prompt: t`A student solves $y' + y = y^3$: “Let $v = y^{-2}$. Dividing the equation by $y^3$ gives $y^{-3}y' + y^{-2} = 1$, so $v' + v = 1$.” What is wrong?`,
      choices: [
        t`$v' = -2y^{-3}y'$, so $y^{-3}y' = -\tfrac12 v'$; the equation is $-\tfrac12v' + v = 1$, that is $v' - 2v = -2$`,
        t`The substitution should be $v = y^{2}$`,
        t`Dividing by $y^3$ is not allowed`,
        'Nothing: the equation for v is right',
      ],
      answer: 0,
      why: {
        1: t`$v = y^{1 - n}$ with $n = 3$ is $y^{-2}$; the student had that right.`,
        2: t`Dividing by $y^3$ is fine wherever $y \neq 0$ — the constant solution $y = 0$ is simply set aside.`,
        3: t`Test it: $v' + v = 1$ has solutions $1 + Ce^{-t}$, which would make $y = (1 + Ce^{-t})^{-1/2}$ — and that does not satisfy $y' + y = y^3$.`,
      },
      hints: [t`Differentiate $v = y^{-2}$ with the chain rule.`, t`Then replace $y^{-3}y'$ by what it equals in terms of $v'$.`],
      teach: 'In the Bernoulli substitution the factor (1 − n) from the chain rule must be carried into the linear equation.',
      explain: t`$v' = -2y^{-3}y'$, so $y^{-3}y' = -\tfrac12v'$ and the equation becomes $v' - 2v = -2$, with $v = 1 + Ce^{2t}$ and $y = \pm(1 + Ce^{2t})^{-1/2}$. In the general recipe this is the factor $(1 - n) = -2$.`,
      visual: { type: 'de-slopefield', params: { f: 'y^3 - y', x: [0, 3], y: [-2, 2], grid: [17, 14], seeds: [[0, 0.9], [0, 0.5], [0, -0.7]], seedColor: 'accent2' }, caption: t`The slope field of $y' = y^3 - y$ with three solutions. The lines $y = 0, \pm1$ are constant solutions.` },
    }),
    expr({
      id: 'shift', difficulty: 3,
      gen(r) {
        const c = r.pick([1, 2, -1, 3]);
        const ans = `tan(t) - t - (${c})`;
        return {
          prompt: t`Solve $y' = (t + y ${c < 0 ? '-' : '+'} ${Math.abs(c)})^2$ with $y(0) = ${-c}$, using $u = t + y ${c < 0 ? '-' : '+'} ${Math.abs(c)}$.`,
          answer: ans, answerTeX: t`y = \tan t - t ${c < 0 ? '+' : '-'} ${Math.abs(c)}`, lhs: 'y',
          vars: { t: [-1, 1] },
          integrand: `(t + (${ans}) + (${c}))^2`,
          errors: [{ answer: `tan(t) - (${c})`, feedback: t`Translate back carefully: $y = u - t ${c < 0 ? '+' : '-'} ${Math.abs(c)}$, so the $-t$ stays.` }, { answer: `tan(t) - t`, feedback: t`Check the starting value: at $t = 0$ that gives $y = 0$, not $${-c}$.` }],
          hints: [t`$u' = 1 + y' = 1 + u^2$ — separable.`, t`$\arctan u = t + C$ and $u(0) = 0 + ${-c} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0$, so $u = \tan t$.`],
          teach: 'For y′ = G(at + by), the combination u = at + by obeys a separable equation.',
          explain: t`$u' = 1 + u^2$ with $u(0) = 0$ gives $u = \tan t$, so $y = \tan t - t ${c < 0 ? '+' : '-'} ${Math.abs(c)}$, valid for $|t| < \pi/2$.`,
          visual: { type: 'de-slopefield', params: { f: `(t + y + ${c})^2`, x: [-1.5, 1.5], y: [-c - 3, -c + 3], grid: [17, 14], points: [{ x: 0, y: -c, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = (t + y ${c < 0 ? '-' : '+'} ${Math.abs(c)})^2$: the slope is constant along each line $t + y = \text{const}$.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-river', difficulty: 3, transfer: true,
      gen(r) {
        const W = r.pick([60, 80, 100]), vb = r.pick([2, 2.5, 3]), w = r.pick([0.5, 1, 1.5]);
        const k = w / vb, u = ((1 - k) / (1 + k)) ** (1 / (2 * k)), d = (W / 2) * (u ** (1 - k) - u ** (1 + k));
        return {
          prompt: t`A boat crosses a river ${W} m wide, always steering straight at a dock on the far bank, at ${vb} m/s through the water; the current flows at ${w} m/s along the river. Measured from the dock, the boat’s path is $y = \tfrac{W}{2}\left[(x/W)^{1-k} - (x/W)^{1+k}\right]$ with $k = w/v_b$, $x$ its distance across to the far bank and $y$ its drift downstream. How far downstream does it drift at most?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (W / 2) * (0.5 ** (1 - k) - 0.5 ** (1 + k)), feedback: t`That is the drift halfway across, at $x = W/2$. The largest drift is where $dy/dx = 0$.` }].filter((e) => Math.abs(e.value - d) > 0.02 * d),
          hints: [t`With $u = x/W$: $\;\dfrac{d}{du}\left(u^{1-k} - u^{1+k}\right) = (1-k)u^{-k} - (1+k)u^{k} = 0$.`, t`So $u^{2k} = \dfrac{1-k}{1+k}$: $u = \left(\dfrac{1-k}{1+k}\right)^{1/(2k)}$. Put it back into $y$.`],
          teach: 'The same homogeneous pursuit equation describes a plane in a crosswind and a boat in a current; its maximum comes from setting dy/dx = 0.',
          explain: t`$k = ${nice(k)}$, $u = \left(\tfrac{${nice(1 - k)}}{${nice(1 + k)}}\right)^{${nice(1 / (2 * k))}} = ${fmt(u, 3)}$, so the drift peaks at $${W / 2}\left(u^{${nice(1 - k)}} - u^{${nice(1 + k)}}\right) = ${fmt(d, 3)}$ m, about ${Math.round((1 - u) * W)} m from the starting bank. Because $k < 1$ the boat still reaches the dock.`,
          visual: {
            type: 'graph',
            params: {
              x: [-5, W + 5], y: [-0.35 * W, 0.15 * W], equal: true, xlabel: 'distance from the far bank (m)', ylabel: '',
              vlines: [{ x: 0, label: 'far bank', color: 'good' }, { x: W, label: 'near bank', color: 'good' }],
              points: [{ x: 0, y: 0, color: 'good', label: 'dock', labelDx: 8, labelDy: -12 }, { x: W, y: 0, color: 'gold', label: 'start', labelDx: -36, labelDy: -12 }],
              arrows: [{ from: [W / 2, -0.12 * W], to: [W / 2, -0.28 * W], color: 'teal', label: 'current', labelDx: 8, labelDy: 0 }],
            },
            caption: 'The river from above, with downstream pointing down the page. The boat steers at the dock all the way across; its path is for you to work out.',
          },
        };
      },
    }),
    expr({
      id: 'cp-bernoulli', difficulty: 3,
      gen(r) {
        const y0 = r.pick([0.5, 2]);
        const C = 1 / (y0 * y0) - 1;
        const ans = `(1 + ${C}*exp(-2t))^(-1/2)`;
        return {
          prompt: t`Solve $y' = y - y^3$ with $y(0) = ${y0 === 0.5 ? t`\tfrac12` : y0}$.`,
          answer: ans, answerTeX: t`y = \dfrac{1}{\sqrt{1 ${C < 0 ? '-' : '+'} ${frac(Math.abs(C))}\,e^{-2t}}}`, lhs: 'y',
          vars: { t: [0, 2] },
          integrand: `(${ans}) - (${ans})^3`,
          errors: [{ answer: `(1 + ${C}*exp(-t))^(-1/2)`, feedback: t`With $v = y^{-2}$, $v' = -2y^{-3}y'$, so $v' + 2v = 2$: the rate is $2$, not 1.` }],
          hints: [t`Bernoulli with $n = 3$: $v = y^{-2}$ gives $v' = -2y^{-3}y' = -2y^{-2} + 2 = -2v + 2$.`, t`$v = 1 + Ce^{-2t}$ with $v(0) = 1/y(0)^2$; then $y = v^{-1/2}$.`],
          teach: 'A cubic Bernoulli equation becomes linear in v = y^(−2); translate back with y = v^(−1/2).',
          explain: t`$v = 1 + Ce^{-2t}$ with $C = ${frac(C)}$, so $y = \left(1 ${C < 0 ? '-' : '+'} ${frac(Math.abs(C))}e^{-2t}\right)^{-1/2} \to 1$: every positive solution settles at the stable equilibrium $y = 1$.`,
          visual: { type: 'de-slopefield', params: { f: 'y - y^3', x: [0, 3], y: [0, 2.2], grid: [17, 13], points: [{ x: 0, y: y0, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = y - y^3$ for $y \ge 0$, with the starting point.` },
        };
      },
    }),
    mcq({
      id: 'cp-rays', difficulty: 2,
      prompt: t`In this slope field every segment along a given ray from the origin has the same slope. Which equation could have produced it?`,
      choices: [t`$y' = \dfrac{x - y}{x + y}$`, t`$y' = \dfrac{x - y}{x + y + 1}$`, t`$y' = x^2 + y^2$`, t`$y' = \dfrac{y}{x} + x$`],
      answer: 0,
      why: {
        1: t`The $+1$ spoils it: scaling $x$ and $y$ by the same factor changes the slope.`,
        2: t`$x^2 + y^2$ grows along every ray, so the slope is not constant along rays.`,
        3: t`$y/x$ alone would be homogeneous, but the extra $x$ changes along a ray.`,
      },
      hints: [t`Along a ray, $y/x$ is fixed. Which right side depends on $y/x$ alone?`, t`Divide top and bottom of each fraction by $x$.`],
      teach: 'An equation is homogeneous when its slope depends only on y/x, which makes the slope constant along rays from the origin.',
      explain: t`$\dfrac{x - y}{x + y} = \dfrac{1 - y/x}{1 + y/x}$ depends on $y/x$ alone, so it is constant along every ray — and $y = xv$ will make it separable.`,
      visual: { type: 'de-slopefield', params: { f: '(t - y)/(t + y)', x: [-3, 3], y: [-3, 3], xlabel: 'x', grid: [19, 19] }, caption: 'A slope field whose slopes depend only on the direction from the origin.' },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.5 Substitution', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'C. H. Edwards and D. E. Penney, Differential Equations and Boundary Value Problems, §1.6 (airplane flight trajectory)', url: 'https://www.pearson.com/en-us/subject-catalog/p/differential-equations-and-boundary-value-problems-computing-and-modeling/P200000006218' },
  ],
});
