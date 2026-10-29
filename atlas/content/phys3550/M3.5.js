// Constraints and Lagrange multipliers (Taylor §6.5 problems, §7.10). Builds
// on math2210.C3-3.8 (∇f = λ∇g, λ as the rate of change of the optimum) and
// goes two steps further: (1) isoperimetric problems — extremize ∫f dx with
// ∫g dx fixed by applying Euler–Lagrange to f + λg: Dido's semicircle (λ is
// the radius, = dA/dℓ) and the hanging chain (a catenary, not a parabola);
// (2) multipliers as constraint forces: m r̈ = F + λ∇g, the force normal to
// the constraint surface, with λ found from the motion — the puck that leaves
// a hemisphere where λ = 0 (cos θ = 2/3 from rest). A moving constraint does
// work. Forward links: M4 (Lagrange's equations with multipliers) and st-g G6.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { polarPic, sci, r6, gpic, seg, lab, distinct, G } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;

/** Catenary y = C cosh(x/C) through (±d/2) with arc length L: solve 2C sinh(d/2C) = L for C; the sag. */
function catenary(d, L) {
  let lo = 1e-3, hi = 1e6;
  for (let i = 0; i < 300; i++) { const m = Math.sqrt(lo * hi); if (2 * m * Math.sinh(d / (2 * m)) > L) lo = m; else hi = m; }
  const C = Math.sqrt(lo * hi);
  return { C, sag: C * (Math.cosh(d / (2 * C)) - 1) };
}

/** The puck on a hemisphere of radius R, starting at the top with speed v0: where it leaves (cos θ) and its speed there. */
const leave = (R, v0, g = G) => { const c = (2 + (v0 * v0) / (g * R)) / 3; return { c, th: Math.acos(c) / DEG, v: Math.sqrt(g * R * c) }; };

const EX = (() => { const R = 2, m = 0.5; const L = leave(R, 0); return { R, m, ...L, h: R * L.c }; })();

// the hemisphere picture: dome of radius 1, puck at angle th (deg)
function dome({ th = 0, caption, arrows = [], extra = {} }) {
  const s = Math.sin(th * DEG), c = Math.cos(th * DEG);
  return gpic({
    x: [-1.5, 1.5], y: [-0.15, 1.45], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 3.1416], color: 'ink2', width: 2.6 }, seg([-1.4, 0], [1.4, 0], 'ink3', 2), seg([0, 0], [r6(s), r6(c)], 'ink4', 1, true), seg([0, 0], [0, 1.2], 'ink4', 1, true)],
    points: [{ x: r6(s * 1.04), y: r6(c * 1.04), color: 'warn', r: 6 }, lab(0.12 * Math.sin((th * DEG) / 2) + 0.05, 0.42 * Math.cos((th * DEG) / 2), th > 4 ? 'θ' : '', 'ink2')],
    arrows,
    ...extra,
  }, caption, 'A puck on a smooth hemispherical dome');
}

export default lesson({
  id: 'phys3550.M3.5',
  title: 'Constraints and Lagrange multipliers',
  minutes: 18, difficulty: 3,
  intro: t`[MATH 2210](#/lesson/math2210.C3-3.8) found constrained extrema with $\nabla f = \lambda\nabla g$. The same multiplier does two more jobs. **In a functional:** to extremize $\int f\,dx$ while another integral $\int g\,dx$ is held fixed (a rope of given length, a chain of given length), apply the Euler–Lagrange equation to $f + \lambda g$ and choose $\lambda$ to meet the constraint. **In mechanics:** a particle held on a surface $g(\vec r) = 0$ feels a force from the surface that keeps it there. That force is perpendicular to the surface — along $\nabla g$ — so it is $\lambda\nabla g$, and the multiplier, solved for along with the motion, *is* the constraint force. Where $\lambda$ would have to change sign, a one-sided constraint lets go.`,
  equation: t`m\ddot{\vec r} = \vec F + \lambda\,\nabla g(\vec r), \qquad g(\vec r) = 0`,
  symbols: [
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: '\\ddot{\\vec r}', text: 'its acceleration, in m/s²' },
    { tex: '\\vec F', text: 'the applied forces we know in advance — gravity, springs — in N' },
    { tex: 'g(\\vec r) = 0', text: 'the constraint: the surface or curve the particle must stay on (for a sphere of radius $R$, $g = x^2 + y^2 + z^2 - R^2$)' },
    { tex: '\\nabla g', text: 'the gradient of $g$: perpendicular to the constraint surface' },
    { tex: '\\lambda', text: 'the Lagrange multiplier, an unknown function of time found with the motion; $\\lambda\\nabla g$ is the **constraint force** (N), so $\\lambda$ has units of N per unit of $\\nabla g$' },
  ],
  why: t`Every rope tension, normal force and bearing reaction in Lagrangian mechanics comes out of a multiplier like this ([M4.1](#/lesson/phys3550.M4.1)) — and in the Hamiltonian form of general relativity, the lapse and shift are multipliers enforcing its constraints.`,
  visual: {
    type: 'graph',
    title: 'A puck sliding off a dome',
    lead: t`A puck slides without friction over a smooth dome of radius 1 m. Slide it down with $\theta$. Blue: the constraint force $\lambda\nabla g$, along the outward normal. Orange: its weight. While the dome pushes ($N > 0$) the puck stays on; at $N = 0$ the multiplier would have to turn into a pull — which a dome cannot give.`,
    tasks: [
      t`From rest at the top ($v_0 = 0$), slide $\theta$ until the normal force vanishes: about $48^\circ$, where $\cos\theta = 2/3$.`,
      t`Give the puck a push, $v_0 = 2$ m/s: it leaves earlier. The harder the push, the sooner it leaves; at $\sqrt{gR} \approx 3.1$ m/s it would leave at once.`,
      t`Notice that the constraint force is always perpendicular to the dome: it never does work on the puck.`,
    ],
    params: {
      x: [-1.6, 1.6], y: [-0.2, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      sliders: [
        { key: 'th', label: 'Angle from the top $\\theta$', min: 0, max: 80, step: 0.5, value: 25, unit: '^\\circ', explain: 'How far round the dome the puck has slid.' },
        { key: 'v0', label: 'Speed at the top $v_0$', min: 0, max: 3, step: 0.05, value: 0, unit: '\\mathrm{m/s}', explain: 'A push at the top: the puck then reaches angle $\\theta$ with $v^2 = v_0^2 + 2gR(1 - \\cos\\theta)$.' },
      ],
      constants: { R: 1, gg: 9.8 },
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 3.1416], color: 'ink2', width: 2.6 },
        { param: ['t', '0'], t: [-1.5, 1.5], color: 'ink3', width: 2 },
        { param: ['t*sin(th*pi/180)', 't*cos(th*pi/180)'], t: [0, 1], color: 'ink4', width: 1, dash: true },
      ],
      points: [
        { x: 'sin(th*pi/180)', y: 'cos(th*pi/180)', color: 'warn', r: 7 },
        { x: 'sin(acos((2 + v0^2/9.8)/3))', y: '(2 + v0^2/9.8)/3', color: 'bad', r: 4, label: 'leaves here', labelDx: 8, labelDy: -6, when: 'step(1 - (2 + v0^2/9.8)/3)' },
      ],
      arrows: [
        { from: ['sin(th*pi/180)', 'cos(th*pi/180)'], to: ['sin(th*pi/180)', 'cos(th*pi/180) - 0.4'], color: 'warn', label: 'mg', labelDx: 6, labelDy: 8 },
        { from: ['sin(th*pi/180)', 'cos(th*pi/180)'], to: ['sin(th*pi/180)*(1 + 0.041*(9.8*(3*cos(th*pi/180) - 2) - v0^2))', 'cos(th*pi/180)*(1 + 0.041*(9.8*(3*cos(th*pi/180) - 2) - v0^2))'], color: 'accent', label: 'λ∇g', labelDx: 6, labelDy: -8, when: 'step(9.8*(3*cos(th*pi/180) - 2) - v0^2)' },
      ],
      readouts: [
        { label: 'normal force N', expr: '9.8*(3*cos(th*pi/180) - 2) - v0^2', unit: '\\mathrm{N}', digits: 3, zero: 0 },
        { label: 'λ = N/2R', expr: '(9.8*(3*cos(th*pi/180) - 2) - v0^2)/2', unit: '\\mathrm{N/m}', digits: 3, zero: 0 },
      ],
    },
    caption: t`A 1 kg point puck on a frictionless dome of radius 1 m, $g = 9.8$ m/s². Constraint $g = x^2 + y^2 - R^2$, so $\nabla g = 2\vec r$ and the constraint force is $2\lambda R$ outward. A negative $N$ is the pull the dome would need — it cannot give it, so past “leaves here” the puck is airborne and the picture no longer applies. Arrows to scale with each other.`,
  },
  example: {
    prompt: t`A ${EX.m} kg puck starts at rest on top of a smooth hemispherical dome of radius ${EX.R} m and slides off. Using the multiplier equations, find the normal force as a function of angle and where the puck leaves the surface.`,
    visual: dome({ th: 30, caption: t`The puck partway down, at angle $\theta$ from the top. Not to scale.`, arrows: [{ from: [0.5, 0.866], to: [0.5, 0.466], color: 'warn', label: 'mg', labelDx: 6, labelDy: 8 }, { from: [0.5, 0.866], to: [0.62, 1.074], color: 'accent', label: 'λ∇g', labelDx: 6, labelDy: -6 }] }),
    steps: [
      { label: 'Constraint', text: t`In the vertical plane of the motion, $g(x, y) = x^2 + y^2 - R^2 = 0$, so $\nabla g = (2x, 2y) = 2R\,\hat r$: outward along the radius, perpendicular to the dome.` },
      { label: 'Equations', text: t`$m\ddot x = 2\lambda x$ and $m\ddot y = -mg + 2\lambda y$: three unknowns $x(t), y(t), \lambda(t)$ and three equations with the constraint.` },
      { label: 'Project radially', text: t`Take the $\hat r$ component. On a circle the radial acceleration is $-v^2/R$, and gravity's radial part is $-mg\cos\theta$: $-mv^2/R = -mg\cos\theta + 2\lambda R$. So the constraint force is $N = 2\lambda R = mg\cos\theta - mv^2/R$.` },
      { label: 'Speed', text: t`The constraint force is perpendicular to the motion, so it does no work and energy is conserved: $v^2 = 2gR(1 - \cos\theta)$. Then $N = mg(3\cos\theta - 2)$.` },
      { label: 'Let go', text: t`A dome can push but not pull. $N$, and $\lambda$, reach zero at $\cos\theta = 2/3$: $\theta = ${sci(EX.th, 3)}^\circ$, a height $\tfrac23R = ${sci(EX.h, 3)}$ m above the centre. Beyond it the multiplier equations would demand a pull, so the puck flies off on a parabola.` },
      { label: 'Sense check', text: t`At the top $N = mg = ${sci(EX.m * G, 3)}$ N, as it must be at rest. The answer is independent of $m$, $g$ and $R$: the same $48^\circ$ for a puck on a cup and a skier on a snow dome.` },
    ],
    answer: t`$N = 2\lambda R = mg(3\cos\theta - 2)$, which vanishes at $\cos\theta = 2/3$: the puck leaves at $${sci(EX.th, 3)}^\circ$ from the top, $${sci(EX.h, 3)}$ m above the dome's centre.`,
  },
  practice: [
    num({
      id: 'dido', difficulty: 2,
      gen(r) {
        const l = r.pick([100, 200, 400, 600]);
        const A = (l * l) / (2 * Math.PI);
        return {
          prompt: t`Dido's problem: with a rope ${l} m long, enclose the largest area against a straight coastline (the coast closes the region). The augmented integrand $y + \lambda\sqrt{1 + y'^2}$ gives an Euler–Lagrange equation saying the rope's curvature is $1/\lambda$ everywhere — so it is an arc of a circle. What is the greatest area?`,
          answer: A, units: 'm^2', tol: { rel: 0.005 },
          errors: [{ value: (l * l) / (4 * Math.PI), feedback: t`That is a full circle of circumference ${l} m. Against the coast the rope need only make a **semicircle**, with $\ell = \pi R$.` }, { value: (l * l) / 8, feedback: t`A rectangle twice as wide as deep encloses $\ell^2/8$ — good, but the semicircle does better.` }],
          hints: [t`Constant curvature means a circular arc. Against a straight coast the best arc meets it at right angles: a semicircle.`, t`$\ell = \pi R$, so $R = \ell/\pi$ and $A = \tfrac12\pi R^2 = \ell^2/2\pi$.`],
          teach: t`For a fixed-length boundary, maximize the area by applying Euler–Lagrange to $y + \lambda\sqrt{1 + y'^2}$: a circular arc of radius $\lambda$.`,
          explain: t`$R = ${l}/\pi = ${sci(l / Math.PI, 3)}$ m and $A = \ell^2/2\pi = ${sci(A, 3)}$ m². The multiplier is the radius, $\lambda = R$, and it is also $dA/d\ell = \ell/\pi$: one more metre of rope buys $R$ square metres — the meaning of $\lambda$ from MATH 2210, now for a functional.`,
          visual: gpic({ x: [-1.4, 1.4], y: [-0.2, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'good', alpha: 0.2 }], curves: [seg([-1.4, 0], [1.4, 0], 'accent', 3), { param: ['cos(t)', 'sin(t)'], t: [0, 3.1416], color: 'warn', width: 2.4 }], points: [lab(0, -0.12, 'coast', 'accent'), lab(0.95, 0.75, 'rope', 'warn')] }, t`The shape the multiplier picks: a semicircle of rope against the coast. Not to scale.`, 'A semicircular rope enclosing land against a straight coast'),
        };
      },
    }),
    num({
      id: 'chain-sag', difficulty: 3,
      gen(r) {
        const d = r.pick([10, 20, 50]), k = r.pick([1.05, 1.1, 1.2]);
        const L = d * k, { C, sag } = catenary(d, L);
        return {
          prompt: t`A chain ${sci(L, 3)} m long hangs between two hooks at the same height, ${d} m apart. Minimizing its potential energy at fixed length gives the catenary $y = C\cosh(x/C)$ (with $x$ measured from the middle); the length condition is $2C\sinh\!\big(\tfrac{${d}}{2C}\big) = ${sci(L, 3)}$. Solve for $C$ numerically and find the sag — how far the middle hangs below the hooks.`,
          answer: sag, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: C, feedback: t`$C$ is the catenary's parameter, not the sag. The sag is $C\cosh(d/2C) - C$.` }, { value: Math.sqrt((3 * d * (L - d)) / 8), feedback: t`That is the shallow-parabola estimate $\sqrt{3d(L - d)/8}$ — close for a tight chain, but solve the catenary exactly.` }].filter((e) => Math.abs(e.value - sag) > 0.01 * sag),
          hints: [t`Try values of $C$: the left side $2C\sinh(${d}/2C)$ falls as $C$ grows. Bisect until it equals ${sci(L, 3)}.`, t`You should find $C \approx ${sci(C, 3)}$ m. Then the sag is $C\big(\cosh(${d}/2C) - 1\big)$.`],
          teach: t`The multiplier fixes the catenary's offset; its one shape parameter $C$ comes from the length constraint.`,
          explain: t`$C = ${sci(C, 4)}$ m, so the sag is $C(\cosh(${d / 2}/C) - 1) = ${sci(sag, 3)}$ m. Only ${sci((k - 1) * 100, 2)}% of slack makes a sag of ${sci((sag / d) * 100, 2)}% of the span.`,
          visual: gpic({ x: [r6(-d * 0.6), r6(d * 0.6)], y: [r6(-sag * 2.2 - d * 0.02), r6(d * 0.08)], xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, axes: false, curves: [{ fn: `${r6(C)}*cosh(x/${r6(C)}) - ${r6(C * Math.cosh(d / (2 * C)))}`, domain: [-d / 2, d / 2], color: 'ink2', width: 2.4 }, seg([-d / 2, 0], [d / 2, 0], 'ink4', 1, true)], points: [{ x: -d / 2, y: 0, color: 'ink', label: 'hook', labelDx: -10, labelDy: -12 }, { x: d / 2, y: 0, color: 'ink', label: 'hook', labelDx: -20, labelDy: -12 }] }, t`The hanging chain (no scale given).`, 'A chain hanging between two hooks'),
        };
      },
    }),
    mcq({
      id: 'catenary-parabola', difficulty: 2,
      prompt: t`A free-hanging chain is a catenary, but the main cables of a suspension bridge hang (very nearly) as parabolas. Why the difference?`,
      visual: gpic({ x: [-1.2, 1.2], y: [-0.1, 1.15], xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ fn: 'cosh(x*1.3169) - 1', domain: [-1, 1], color: 'accent', width: 2.4, label: 'catenary', labelAt: -0.55, labelDx: -62, labelDy: 0 }, { fn: 'x^2', domain: [-1, 1], color: 'warn', width: 2, dash: true, label: 'parabola', labelAt: 0.55, labelDx: 8, labelDy: 4 }] }, t`A catenary and a parabola through the same three points: the catenary is flatter at the bottom and steeper at the ends.`, 'A catenary and a parabola compared'),
      choices: [
        t`The chain's weight is spread evenly along its **length**; the bridge's load is the deck, spread evenly along the **horizontal** span`,
        t`Steel cables are stiffer than chains, and stiffness bends them into parabolas`,
        t`The catenary minimizes length; the parabola minimizes energy`,
        t`They are the same curve; the names differ only by tradition`,
      ],
      answer: 0,
      why: {
        1: t`Neither chain nor cable resists bending to any extent at these scales; the shape is set by where the weight sits.`,
        2: t`Both minimize potential energy at fixed length. What differs is the energy integrand: $y\sqrt{1 + y'^2}$ for weight per length, $y$ alone for weight per horizontal metre.`,
        3: t`They differ visibly for a deep sag: $\cosh$ grows exponentially, $x^2$ does not. For a shallow sag they agree closely.`,
      },
      hints: [t`Write the potential energy as an integral over $x$. Where does the weight per $dx$ come from in each case?`],
      teach: t`The shape of a hanging cable comes from where its load lies: per unit length (catenary) or per unit span (parabola).`,
      explain: t`For the chain, $U = \rho g\int y\,ds = \rho g\int y\sqrt{1 + y'^2}\,dx$, which gives $\cosh$. For the bridge the deck's weight per horizontal metre dominates, so the load per $dx$ is constant and the cable's equilibrium is $y'' = \text{const}$: a parabola.`,
    }),
    num({
      id: 'dome-push', difficulty: 3,
      gen(r) {
        const R = r.pick([1, 2, 5]), f = r.pick([0.3, 0.5, 0.7]);
        const v0 = Math.round(Math.sqrt(f * G * R) * 10) / 10;
        const L = leave(R, v0);
        return {
          prompt: t`A puck is launched horizontally at ${v0} m/s from the top of a smooth hemispherical dome of radius ${R} m. Using $N = 2\lambda R = mg\cos\theta - mv^2/R$ and energy conservation, at what angle from the top does it leave the dome?`,
          answer: L.th, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: Math.acos(2 / 3) / DEG, feedback: t`That is the answer from rest. The push adds $v_0^2$ to $v^2$: $\cos\theta = \big(2 + v_0^2/gR\big)/3$.` }, { value: Math.acos((2 + (v0 * v0) / (G * R)) / 2) / DEG, feedback: t`With $v^2 = v_0^2 + 2gR(1 - \cos\theta)$, setting $N = 0$ gives $3\cos\theta = 2 + v_0^2/gR$ — divide by 3.` }].filter((e) => Number.isFinite(e.value)),
          hints: [t`$v^2 = v_0^2 + 2gR(1 - \cos\theta)$. Put it into $N = 0$: $g\cos\theta = v^2/R$.`, t`$3\cos\theta = 2 + v_0^2/(gR)$, with $v_0^2/(gR) = ${sci((v0 * v0) / (G * R), 3)}$.`],
          teach: t`The puck leaves where the multiplier — the normal force — reaches zero.`,
          explain: t`$\cos\theta = (2 + ${sci((v0 * v0) / (G * R), 3)})/3 = ${sci(L.c, 4)}$, so $\theta = ${sci(L.th, 3)}^\circ$ — earlier than the $48.2^\circ$ from rest.`,
          visual: dome({ th: 0, caption: t`The puck at the top, about to be pushed sideways. Not to scale.`, arrows: [{ from: [0, 1.04], to: [0.45, 1.04], color: 'good', label: 'v₀', labelDx: 4, labelDy: -10 }] }),
        };
      },
    }),
    mcq({
      id: 'moving-constraint', difficulty: 3,
      prompt: t`A constraint force $\lambda\nabla g$ is perpendicular to the constraint surface, so it is often said to do no work. For which of these does the constraint force **do work** on the particle?`,
      visual: polarPic({ r: '0.1*cosh(1.5*t)', theta: '1.5*t', T: [0, 2.2], at: 1.6, show: ['path', 'basis', 'v'], caption: t`A bead on a rod that a motor turns at a steady rate, seen from above: its velocity (orange) is not along the rod.` }),
      choices: [
        t`A bead on a frictionless rod that a motor keeps turning: the rod pushes sideways, and the bead's velocity has a sideways part`,
        t`A puck sliding on a fixed, smooth dome`,
        t`A bead sliding on a fixed, frictionless circular hoop`,
        t`A pendulum bob on a string of fixed length tied to a fixed pivot`,
      ],
      answer: 0,
      why: {
        1: t`The dome is fixed: the normal force is perpendicular to the dome and the puck moves along the dome, so $\vec N\cdot\vec v = 0$.`,
        2: t`A fixed hoop's normal force is perpendicular to the hoop, and the bead moves along it: no work.`,
        3: t`The tension is along the string and the bob moves on a circle about the fixed pivot, perpendicular to the string: no work.`,
      },
      hints: [t`Work is $\vec F\cdot\vec v$. The force is perpendicular to the surface — but is the velocity along the surface if the surface itself moves?`, t`Three of the constraints are fixed in space. In the fourth, the rod drags the bead round with it, so the bead's velocity has a part along the rod's push.`],
      teach: t`A constraint force is perpendicular to the constraint, but if the constraint moves, the particle's velocity is not tangent to it — and the force does work.`,
      explain: t`On a turning rod the bead's velocity has a part along $\hat\theta$, carried by the rod, and the rod's push is along $\hat\theta$: power $N r\omega > 0$, paid by the motor ([M1.1](#/lesson/phys3550.M1.1)). Time-dependent constraints do work; this is why the bead's energy is not conserved on [M4.3](#/lesson/phys3550.M4.3)'s rotating hoop.`,
    }),
    order({
      id: 'method', difficulty: 2,
      prompt: t`Put the steps of finding a constraint force with a multiplier in order.`,
      visual: dome({ th: 40, caption: t`The puck on the dome, with its weight and the constraint force. Arrows not to scale.`, arrows: [{ from: [0.643, 0.766], to: [0.643, 0.366], color: 'warn', label: 'mg', labelDx: 6, labelDy: 8 }, { from: [0.643, 0.766], to: [0.71, 0.846], color: 'accent' }] }),
      items: [
        t`Write the constraint as $g(\vec r) = 0$ and compute $\nabla g$.`,
        t`Write $m\ddot{\vec r} = \vec F + \lambda\nabla g$.`,
        t`Use energy conservation (no work from a fixed constraint) to get the speed.`,
        t`Take the component along $\nabla g$ and solve for $\lambda$.`,
        t`Find where $\lambda$ changes sign: a one-sided constraint lets go there.`,
      ],
      hints: [t`You cannot write the force $\lambda\nabla g$ before you have $\nabla g$.`, t`The component along $\nabla g$ needs the speed (it holds $v^2/R$), so energy comes first.`],
      teach: t`Constraint, equation with $\lambda\nabla g$, speed from energy, project along the normal, check the sign.`,
      explain: t`The normal component of the equation contains $\lambda$ and the centripetal $v^2/R$; energy supplies $v^2$; then $\lambda(\theta)$ follows, and its sign tells you whether the surface must push or pull.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars-boulder', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([2, 3, 4, 6]);
        const gM = 3.71, L = leave(R, 0, gM);
        return {
          prompt: t`A small Mars rover, brakes off, starts from rest on top of a smooth, round boulder of radius ${R} m and rolls (treat it as sliding without friction) down one side. Mars's $g = 3.71$ m/s². How fast is it moving when it loses contact with the boulder?`,
          answer: L.v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(2 * gM * R), feedback: t`That is the speed after dropping a full radius. It leaves much higher, at $\cos\theta = 2/3$.` }, { value: Math.sqrt(gM * R), feedback: t`At the point of leaving $v^2 = gR\cos\theta$, with $\cos\theta = 2/3$.` }, { value: Math.sqrt((2 * G * R) / 3), feedback: t`On Mars $g = 3.71$ m/s², not 9.8.` }],
          hints: [t`It leaves where the normal force (the multiplier) vanishes: $\cos\theta = 2/3$ from rest, whatever $g$ is.`, t`There $v^2 = 2gR(1 - \cos\theta) = \tfrac23gR$.`],
          teach: t`The leaving angle is universal; the leaving speed $\sqrt{2gR/3}$ is not.`,
          explain: t`$v = \sqrt{\tfrac23\times3.71\times${R}} = ${sci(L.v, 3)}$ m/s, at $48.2^\circ$ from the top. A real wheeled rover has friction and rolling inertia, which change the details but not the moral: on a convex surface the ground stops pushing before you reach the bottom.`,
          visual: dome({ th: 15, caption: t`The rover (orange) on the boulder, treated as a smooth hemisphere. Not to scale.` }),
        };
      },
    }),
    mcq({
      id: 'cp-negative-lambda', difficulty: 3,
      prompt: t`Solving the multiplier equations for a puck released from rest at the top of a dome, a student gets $\lambda < 0$ at $\theta = 60^\circ$ (with $g = x^2 + y^2 - R^2$, so $\nabla g$ points outward). What does it mean?`,
      visual: gpic({ x: [0, 90], y: [-1.1, 1.1], xlabel: 'θ (degrees)', ylabel: 'N / mg', curves: [{ fn: '3*cos(x*pi/180) - 2', color: 'accent', width: 2.4 }], hlines: [{ y: 0, color: 'ink3' }] }, t`$N/mg = 3\cos\theta - 2$, the normal force the equations demand, against angle.`, 'Normal force against angle, crossing zero'),
      choices: [
        t`The dome would have to **pull** the puck inward to keep it on; a dome only pushes, so the puck has already left — the equations no longer describe it`,
        t`The normal force is pushing outward harder than before`,
        t`The student made a sign error: $\lambda$ is always positive`,
        t`The puck sinks into the dome`,
      ],
      answer: 0,
      why: {
        1: t`Outward pushing is $\lambda > 0$ when $\nabla g$ points outward. Negative means inward.`,
        2: t`$\lambda$ can have either sign; for a two-sided constraint (a bead on a wire) a negative value is fine. Only for a one-sided one does the sign matter.`,
        3: t`A rigid constraint cannot be penetrated; the equations assume the puck stays on, which is exactly what fails.`,
      },
      hints: [t`$\lambda\nabla g$ is the force. Which way does it point when $\lambda < 0$?`, t`Can a dome hold a puck down? What happens to a puck that needs a pull it cannot get?`],
      teach: t`The multiplier's sign says whether the constraint pushes or pulls; a one-sided constraint lets go when it would have to pull.`,
      explain: t`$\lambda\nabla g$ with $\lambda < 0$ points inward: a pull. The puck left at $48.2^\circ$, where $\lambda = 0$; after that it is a projectile, and the constraint equations — which assume it stays on — give a fictitious answer.`,
    }),
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([80, 100, 150]), slack = r.pick([1.01, 1.02, 1.04]);
        const L = d * slack, { C, sag } = catenary(d, L);
        return {
          prompt: t`A cable for a launch-pad camera is strung between two towers ${d} m apart at the same height. It is $${sci(L, 4)}$ m long and hangs under its own weight as a catenary $y = C\cosh(x/C)$, with $2C\sinh(${d}/2C) = ${sci(L, 4)}$. How far does its middle sag below the tower tops?`,
          answer: sag, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: C, feedback: t`$C$ is the catenary's parameter; the sag is $C(\cosh(d/2C) - 1)$.` }, { value: (L - d) / 2, feedback: t`Half the slack is not the sag: a little extra length makes a much larger sag (roughly $\sqrt{3d\,\Delta L/8}$).` }],
          hints: [t`Solve $2C\sinh(${d}/2C) = ${sci(L, 4)}$ for $C$ by bisection: $C$ is large (hundreds of metres) for a tight cable.`, t`$C \approx ${sci(C, 3)}$ m; the sag is $C(\cosh(${d / 2}/C) - 1)$.`],
          teach: t`The length constraint, enforced by a multiplier, fixes the catenary — and a tiny slack gives a surprisingly large sag.`,
          explain: t`$C = ${sci(C, 4)}$ m and the sag is $${sci(sag, 3)}$ m: ${sci((slack - 1) * 100, 2)}% extra cable sags ${sci((sag / d) * 100, 2)}% of the span. Tight cables need enormous tension — the reason no cable is ever perfectly straight.`,
          visual: gpic({ x: [r6(-d * 0.6), r6(d * 0.6)], y: [r6(-d * 0.18), r6(d * 0.25)], equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, axes: false, curves: [seg([-d / 2, -d * 0.15], [-d / 2, 0], 'ink2', 4), seg([d / 2, -d * 0.15], [d / 2, 0], 'ink2', 4), seg([-d / 2, 0], [d / 2, 0], 'ink4', 1, true)], points: [lab(0, d * 0.05, `${d} m`, 'ink3')] }, t`The two towers, to scale; the cable's sag is the question.`, 'Two towers with the line between their tops'),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §6.5 and §7.10: constraint forces and Lagrange multipliers', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 8.09 Classical Mechanics III: constraints and Lagrange multipliers', url: 'https://ocw.mit.edu/courses/8-09-classical-mechanics-iii-fall-2014/' },
  ],
});
