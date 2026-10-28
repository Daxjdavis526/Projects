// From physics to a computable model: assumptions, state variables, a
// first-order ODE system, units chosen so the numbers are near 1, initial
// conditions, outputs and planned tests — worked through Mercury's orbit
// with Newton's gravity plus the leading general-relativistic correction
// (a teaching model that reproduces the 1PN perihelion advance, not the full
// post-Newtonian equations of motion). The coding exercise writes the
// right-hand side. Points forward to research.P.4.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { SRC } from './_rs.js';

const t = String.raw;
const GM = 1.32712440018e20, C = 299792458, AU = 1.495978707e11, DAY = 86400;
const PL = { Mercury: [0.387098, 0.20563, 87.969], Venus: [0.723332, 0.006772, 224.701], Earth: [1.0, 0.016709, 365.256], Mars: [1.523679, 0.0934, 686.98] };
const tunit = (a) => Math.sqrt((a * AU) ** 3 / GM) / DAY;          // days
const DELTA = GM / (C * C * PL.Mercury[0] * AU);
const VP = Math.sqrt(GM * (1 + PL.Mercury[1]) / (PL.Mercury[0] * AU * (1 - PL.Mercury[1])));
const TERM = 3 * VP * VP / (C * C);
const sci = (x, n = 3) => x.toExponential(n - 1).replace(/e\+?(-?\d+)/, '\\times10^{$1}');

const orbitPic = (delta, caption) => ({ type: 'cm3-orbit', params: { force: 'gr', delta, L: 1, E: -0.3, sliders: [], turns: 5, panels: ['orbit'], readouts: [], play: false, dragE: false, labels: false }, caption });

export default lesson({
  id: 'research.R4.1',
  title: 'From physics to a computable model',
  minutes: 14, difficulty: 3,
  intro: t`A **model** is the physics you keep, written so a computer can step it forward. Building one is a sequence of decisions: what to leave out (and say so), which numbers describe the system’s **state**, what equations move that state, which **units** keep the numbers near 1, where to start, and what to measure. For Mercury, keep the Sun’s Newtonian pull plus the leading general-relativistic correction:

$$\ddot{\vec r} = -\frac{GM}{r^3}\,\vec r\left(1 + \lambda\,\frac{3L^2}{c^2 r^2}\right)$$

Written as four first-order equations for $(x, y, v_x, v_y)$, this is something any ODE solver can integrate.`,
  symbols: [
    { tex: '\\vec r', text: 'the planet’s position relative to the Sun, in metres; $r = |\\vec r|$' },
    { tex: '\\ddot{\\vec r}', text: 'its acceleration, the second time derivative of $\\vec r$' },
    { tex: 'GM', text: 'the Sun’s gravitational parameter, $1.327\\times10^{20}\\ \\text{m}^3\\,\\text{s}^{-2}$' },
    { tex: 'L', text: 'the specific angular momentum $|\\vec r \\times \\vec v|$ (per unit mass), in $\\text{m}^2/\\text{s}$' },
    { tex: 'c', text: 'the speed of light' },
    { tex: '\\lambda', text: 'a dial on the relativistic term: 0 is Newton, 1 is GR, larger values exaggerate it (a numerical device, undone later)' },
  ],
  why: t`Every simulation result is only as good as the model behind it — and only as trustworthy as the list of what that model leaves out.`,
  visual: {
    type: 'cm3-orbit',
    title: 'One parameter switches the physics on',
    lead: t`An orbit under Newton’s gravity plus the GR term. The slider is the strength of the correction, $GM/c^2$ in units of the orbit’s size — for Mercury it is $${sci(DELTA)}$, far too small to see, so this picture exaggerates it about a million-fold.`,
    tasks: ['Set the GR strength to 0: the orbit closes on itself — pure Kepler.', 'Raise it: the ellipse turns a little further every orbit, always in the direction of motion.', 'Raise it further: the orbit becomes a rosette. The turning per orbit grows in proportion to the strength while it stays small.'],
    params: { force: 'gr', delta: 0.005, L: 1, E: -0.3, sliders: ['delta'], ranges: { delta: [0, 0.03, 0.0005] }, turns: 6, panels: ['orbit', 'ueff'], readouts: ['advance'] },
    caption: t`Units with $GM = 1$. The GR term is exaggerated enormously; the model is Newton plus the leading relativistic correction, valid in weak fields only.`,
  },
  example: {
    prompt: t`Turn "Mercury orbiting the Sun, with general relativity" into a model you can integrate. Mercury: $a = 0.387\,098$ AU, $e = 0.205\,63$, period 87.969 days.`,
    visual: orbitPic(0.006, 'The model’s output, exaggerated: an ellipse that turns by Δφ every orbit.'),
    steps: [
      { label: 'Assumptions', text: t`The Sun is fixed (it is 6 million times heavier than Mercury); other planets are ignored; the Sun is a point mass (no oblateness); gravity is Newton’s plus the leading GR correction. Each is a choice to be **written down**, since each shifts the answer by some amount you may later need to estimate.` },
      { label: 'State and equations', text: t`The motion stays in a plane, so four numbers fix the state: $\vec s = (x, y, v_x, v_y)$. Then $\dot x = v_x$, $\dot y = v_y$, and $(\dot v_x, \dot v_y)$ is the acceleration above. An ODE solver needs exactly this: a function returning $\dot{\vec s}$ for any $\vec s$.` },
      { label: 'Units', text: t`Measure length in units of $a$ and set $GM = 1$. The time unit is then $\sqrt{a^3/GM} = ${tunit(PL.Mercury[0]).toFixed(2)}$ days (one period is $2\pi$ of them), and $c^2$ becomes $1/\delta$ with $\delta = GM/(c^2 a) = ${sci(DELTA)}$. Every number in the code is now of order 1 — except $\delta$, which carries all of relativity.` },
      { label: 'Start', text: t`At perihelion: $\vec r = (a(1 - e), 0)$ and $\vec v = (0, v_p)$ with $v_p = \sqrt{GM(1 + e)/(a(1 - e))}$, which is $${(VP / 1000).toFixed(2)}$ km/s in SI units.` },
      { label: 'Outputs and planned tests', text: t`Output: the angle of each perihelion. Tests before trusting it: with $\lambda = 0$ the advance must vanish; energy must stay constant when $\lambda = 0$; the advance must scale as $\lambda$ while it is small. Only then compare with $6\pi GM/(c^2 a (1 - e^2))$.` },
    ],
    answer: t`State $(x, y, v_x, v_y)$; equations $\dot{\vec r} = \vec v$, $\dot{\vec v} = -\vec r\,(1 + 3\lambda\delta L^2/r^2)/r^3$ in units $GM = a = 1$; start at perihelion; output the perihelion angle; assumptions and tests listed before running.`,
  },
  practice: [
    order({
      id: 'steps', difficulty: 2,
      prompt: 'Put the steps of building a computable model in order.',
      visual: orbitPic(0.006, 'The goal: a model that produces a precessing orbit you can measure.'),
      items: [
        'Write down what physics you keep and what you leave out',
        'Choose the state variables',
        'Write the equations as first-order ODEs for the state',
        'Choose units that keep the numbers near 1',
        'Set the initial conditions',
        'Decide the outputs and the tests the code must pass',
      ],
      hints: ['You cannot choose state variables before deciding what physics is in the model.', 'Initial conditions are written in the chosen units, so units come first.'],
      teach: 'Assumptions → state → equations → units → initial conditions → outputs and tests.',
      explain: 'Each step depends on the one before it. Listing the tests before running anything stops you from "testing" the code against whatever it happens to produce.',
    }),
    mcq({
      id: 'state', difficulty: 2,
      prompt: t`For a planet moving in a plane under a force that depends only on its position and velocity, what is the smallest **state vector** an ODE solver needs?`,
      visual: orbitPic(0.006, 'One orbit, traced by integrating the state forward in time.'),
      choices: [t`$(x, y, v_x, v_y)$`, t`$(x, y)$`, t`$(r, \phi)$`, t`$(x, y, v_x, v_y, a_x, a_y)$`],
      answer: 0,
      why: { 1: 'Position alone does not say where the planet goes next: Newton’s law is second order, so velocity is needed too.', 2: 'Still only position, in polar form.', 3: 'The acceleration is computed from position and velocity by the model; it is not independent state.' },
      hints: ['Newton’s second law is second order in time.', 'A second-order equation in two coordinates becomes four first-order equations.'],
      teach: 'The state is everything needed to step the system forward: for Newtonian motion, positions and velocities.',
      explain: t`Two second-order equations become four first-order ones: $\dot x = v_x$, $\dot y = v_y$, $\dot v_x = a_x(\vec s)$, $\dot v_y = a_y(\vec s)$.`,
    }),
    num({
      id: 'time-unit', difficulty: 2,
      gen(r) {
        const name = r.pick(['Mercury', 'Venus', 'Earth', 'Mars']), [a, , P] = PL[name];
        const ans = tunit(a);
        return {
          prompt: t`In units with $GM_\odot = 1$ and length measured in ${name}’s semi-major axis ($a = ${a}$ AU, with $1\ \text{AU} = 1.496\times10^{11}$ m and $GM_\odot = 1.327\times10^{20}\ \text{m}^3\,\text{s}^{-2}$), how many days is one unit of time, $\sqrt{a^3/GM_\odot}$?`,
          visual: orbitPic(0, 'A Kepler orbit (GR term off): in these units one period is 2π time units.'),
          answer: ans, units: 'day', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * ans, feedback: t`That is the whole period, $2\pi$ time units.` }, { value: ans * DAY, feedback: 'That is in seconds; the question asks for days.' }].filter((x) => Math.abs(x.value - ans) > 0.01 * ans),
          hints: [t`Work in SI: $a = ${a} \times 1.496\times10^{11}$ m.`, t`Check: the answer times $2\pi$ should be ${name}’s period, ${P} days.`],
          teach: 'Choosing GM = 1 and the orbit size as the length unit fixes the time unit to P/2π: the numbers in the code stay near 1.',
          explain: t`$\sqrt{a^3/GM} = ${(ans * DAY).toFixed(0)}$ s $= ${ans.toFixed(2)}$ days, and $2\pi \times ${ans.toFixed(2)} = ${(2 * Math.PI * ans).toFixed(1)}$ days — the period, as Kepler’s third law requires.`,
        };
      },
    }),
    num({
      id: 'term-size', difficulty: 3,
      prompt: t`At perihelion, Mercury’s velocity is perpendicular to its position, so $L = r v_p$ and the correction term is $3L^2/(c^2 r^2) = 3v_p^2/c^2$. With $v_p = ${(VP / 1000).toFixed(2)}$ km/s, how big is it?`,
      visual: orbitPic(0.006, 'The correction is drawn enormously exaggerated; its real size is the question.'),
      answer: TERM, tol: { rel: 0.01 },
      errors: [{ value: TERM / 3, feedback: 'You dropped the factor 3.' }, { value: 3 * VP / C, feedback: 'Square the velocity ratio: the term goes as v²/c².' }],
      hints: [t`$v_p/c = ${(VP / 1000).toFixed(2)}\times10^{3}/2.998\times10^{8}$.`, t`Square it and multiply by 3.`],
      teach: 'Estimate each term of a model before integrating it: a correction of order 10⁻⁷ tells you the precision the code must hold.',
      explain: t`$3(v_p/c)^2 = 3 \times (${sci(VP / C)})^2 = ${sci(TERM)}$. Double-precision numbers carry about 16 digits, so the term survives addition to 1 — but integrator errors must stay well below $10^{-7}$ per orbit, or the term must be exaggerated with $\lambda$.`,
    }),
    code({
      id: 'rhs', difficulty: 3,
      prompt: t`Write \`rhs(t, s, lam, delta)\` for the model in units $GM = 1$, where $c^2 = 1/\delta$. It takes the state \`s = [x, y, vx, vy]\` and returns the list \`[vx, vy, ax, ay]\`, with

$$\vec a = -\frac{\vec r}{r^3}\left(1 + 3\lambda\delta\frac{L^2}{r^2}\right), \qquad L = x v_y - y v_x.$$

(\`t\` is unused, but ODE solvers such as \`scipy.integrate.solve_ivp\` pass it.)`,
      starter: t`def rhs(t, s, lam, delta):
    x, y, vx, vy = s
    # r squared, r, and the angular momentum L
    # the factor multiplying (x, y)
    # return [vx, vy, ax, ay]
    pass
`,
      answer: t`def rhs(t, s, lam, delta):
    x, y, vx, vy = s
    r2 = x * x + y * y
    r = r2 ** 0.5
    L = x * vy - y * vx
    f = -(1 + 3 * lam * delta * L * L / r2) / (r2 * r)
    return [vx, vy, f * x, f * y]
`,
      tests: [
        { name: 'returns four numbers', code: 'len(rhs(0, [1, 0, 0, 1], 0, 0)) == 4' },
        { name: 'passes the velocity through as the first two derivatives', code: 'list(rhs(0, [1, 0, 0.3, 0.7], 0, 0)[:2]) == [0.3, 0.7]' },
        { name: 'Newton at r = 1: acceleration −1 toward the Sun', code: 'abs(rhs(0, [1, 0, 0, 1], 0, 0)[2] + 1) < 1e-12 and abs(rhs(0, [1, 0, 0, 1], 0, 0)[3]) < 1e-12' },
        { name: 'GR term: at r = 2, L = 1, λδ = 0.01 the pull is 1.0075 × Newton’s', code: 'abs(rhs(0, [2, 0, 0, 0.5], 1, 0.01)[2] + 0.251875) < 1e-12' },
        { name: 'the acceleration points at the Sun at any position', code: '(lambda a: abs(a[2] * (-0.8) - a[3] * 0.6) < 1e-12 and a[2] < 0)(rhs(0, [0.6, -0.8, 0.5, 0.9], 10, 1e-3))' },
      ],
      hints: [t`\`r2 = x*x + y*y\`, \`r = r2**0.5\`, \`L = x*vy - y*vx\`.`, t`The factor is \`f = -(1 + 3*lam*delta*L*L/r2) / (r2*r)\`; then \`ax = f*x\`, \`ay = f*y\`.`],
      teach: 'A model becomes code as one function: state in, time derivative of the state out.',
      explain: t`With \`lam = 0\` this is Newton’s inverse square; the bracket adds the GR correction. Test values: at $(2, 0)$ with $v_y = 0.5$, $L = 1$ and the factor is $-(1 + 0.03/4)/8 = -0.1259375$, so $a_x = -0.251875$.`,
    }),
    mcq({
      id: 'left-out', difficulty: 2,
      prompt: 'Which effect does this model of Mercury leave out?',
      visual: orbitPic(0.006, 'The model: one planet, one point-mass Sun, Newton plus the leading GR term.'),
      choices: ['The pull of the other planets', 'The Sun’s Newtonian attraction', 'The leading general-relativistic correction', 'Conservation of angular momentum'],
      answer: 0,
      why: { 1: 'That is the main term.', 2: 'That is the λ term, with λ = 1 for GR.', 3: 'The force is central, so angular momentum is conserved by the model.' },
      hints: ['How many bodies are in the model?'],
      teach: 'Every model leaves things out; list them, and later estimate how much each would change the answer.',
      explain: 'The other planets drive most of Mercury’s observed perihelion advance (about 530″ per century, against GR’s 43″). Leaving them out is fine for reproducing the GR part — if you say so.',
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-rocket', difficulty: 2, transfer: true,
      prompt: t`You model a sounding rocket climbing vertically: thrust $T$, drag that depends on speed and air density (which depends on altitude), gravity, and a mass that falls as propellant burns at rate $\dot m$. What is the state vector?`,
      visual: { type: 'diagram', params: { kind: 'block', mass: 'm', forces: [{ dir: 90, label: 'thrust T', size: 1 }, { dir: 270, label: 'weight mg + drag D(v, h)', size: 0.6 }] }, caption: 'Forces on the climbing rocket, drawn as a block: thrust up; weight and drag (both downward while it climbs) as one arrow. Directions and rough sizes only.' },
      choices: [t`$(h, v, m)$: altitude, velocity and mass`, t`$(h, v)$ only`, t`$(v, m)$ only`, t`$(h, v, a)$`],
      answer: 0,
      why: { 1: 'The mass changes, and the acceleration depends on it: it must be integrated too.', 2: 'Drag depends on altitude through the air density, so altitude is needed.', 3: 'Acceleration is computed from the state by the model, not integrated.' },
      hints: ['Which quantities have their own rate equation?', t`$\dot h = v$, $\dot v = (T - D)/m - g$, $\dot m = -\dot m_{\text{burn}}$.`],
      teach: 'The state is every quantity with its own rate equation; everything else is computed from it.',
      explain: t`Three rate equations: $\dot h = v$, $\dot v = (T - D(v, h))/m - g$, $\dot m = -\dot m_{\text{burn}}$. So the state is $(h, v, m)$.`,
    }),
    num({
      id: 'cp-leo', difficulty: 2,
      gen(r) {
        const alt = r.pick([300, 400, 550, 800]), a = 6371 + alt;
        const ans = Math.sqrt((a * 1e3) ** 3 / 3.986004418e14);
        return {
          prompt: t`For a model of a satellite in a circular orbit ${alt} km above Earth (Earth’s radius 6371 km, $GM_\oplus = 3.986\times10^{14}\ \text{m}^3\,\text{s}^{-2}$), you choose $GM_\oplus = 1$ and the orbit radius as the unit of length. How many seconds is the unit of time?`,
          visual: orbitPic(0, 'A Kepler orbit with the GR term off; in these units one period is 2π.'),
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt((alt * 1e3) ** 3 / 3.986004418e14), feedback: 'Use the radius from Earth’s centre, not the altitude.' }, { value: 2 * Math.PI * ans, feedback: t`That is the period, $2\pi$ time units.` }],
          hints: [t`$r = 6371 + ${alt} = ${a}$ km.`, t`Time unit $= \sqrt{r^3/GM_\oplus}$, in SI units.`],
          teach: 'With GM = 1 and the orbit radius as the length unit, the time unit is the orbital period divided by 2π.',
          explain: t`$\sqrt{(${a}\times10^{3})^3/3.986\times10^{14}} = ${ans.toFixed(0)}$ s; the period is $2\pi$ times that, $${(2 * Math.PI * ans / 60).toFixed(1)}$ min.`,
        };
      },
    }),
    mcq({
      id: 'cp-units', difficulty: 3,
      prompt: t`Why write the Mercury model in units with $GM = 1$ and $a = 1$ rather than in SI?`,
      visual: orbitPic(0.006, 'The same orbit in any units; only the numbers in the code change.'),
      choices: [
        t`The numbers stay near 1, and the whole relativistic effect is gathered in one dimensionless parameter $\delta = GM/(c^2 a)$`,
        'Because SI units give the wrong answer in an ODE solver',
        'Because it makes the model exact',
        'Because it removes the need for initial conditions',
      ],
      answer: 0,
      why: { 1: 'SI works in principle; it is a matter of conditioning, tolerances and clarity, not correctness.', 2: 'Units cannot change what the model leaves out.', 3: 'Initial conditions are still needed; they just become numbers near 1.' },
      hints: ['Compare a position of 5.8 × 10¹⁰ m with a position of 0.79.', 'Which single number then measures how relativistic the orbit is?'],
      teach: 'Good units make the numbers order 1 and expose the dimensionless parameters that control the physics.',
      explain: t`Solver tolerances, step-size control and your own sanity checks all work best with numbers near 1. And the model then shows its one controlling parameter: $\delta = ${sci(DELTA)}$ for Mercury — the subject of the next lesson.`,
    }),
  ],
  sources: [SRC.will, { label: 'NASA Goddard Space Flight Center, Planetary Fact Sheet (orbital elements)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' }],
});
