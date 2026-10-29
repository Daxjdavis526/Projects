// The wave equation derived from Newton's second law for a piece of string,
// with every assumption named — and the term each neglected effect would add
// (gravity, drag, stiffness, a driving force).
import { lesson, mcq, multi, num, match, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const G = 9.81;

// the worked example: a 50 m cable span sagging under its own weight
const SAG = { L: 50, mu: 1.2, FT: 15000 };
SAG.c2 = SAG.FT / SAG.mu;
SAG.s = (G * SAG.L ** 2) / (8 * SAG.c2);
SAG.slope = (G * SAG.L) / (2 * SAG.c2);

// a piece of string under tension: expressions for the Explore graph
const xa = '(x0 - dx/2)', xb = '(x0 + dx/2)';
const slope = (x) => `A*cos(${x})`;
const cosA = (x) => `1/sqrt(1 + (${slope(x)})^2)`;
const sinA = (x) => `${slope(x)}/sqrt(1 + (${slope(x)})^2)`;
const element = (o = {}) => ({
  type: 'graph',
  params: {
    x: [0, 6.3], y: [-1.75, 1.75], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 'u', xticks: 7,
    ...(o.sliders ? { sliders: o.sliders } : { constants: o.constants }),
    curves: [{ fn: 'A*sin(x)', color: 'accent', width: 2 }, { fn: 'A*sin(x)', color: 'gold', width: 5, domain: [xa, xb] }],
    arrows: [
      { from: [xa, `A*sin(${xa})`], to: [`${xa} - 0.9*${cosA(xa)}`, `A*sin(${xa}) - 0.9*${sinA(xa)}`], color: 'teal', width: 2.4, label: 'tension', labelDx: -52 },
      { from: [xb, `A*sin(${xb})`], to: [`${xb} + 0.9*${cosA(xb)}`, `A*sin(${xb}) + 0.9*${sinA(xb)}`], color: 'teal', width: 2.4, label: 'tension', labelDx: 6 },
      { from: ['x0', 'A*sin(x0)'], to: ['x0', `A*sin(x0) + ${o.mag ?? 4}*(${sinA(xb)} - ${sinA(xa)})`], color: 'bad', width: 2.6, label: o.netLabel ?? 'net', labelDx: 6 },
      ...(o.extra || []),
    ],
    readouts: o.readouts,
  },
  caption: o.caption,
});

export default lesson({
  id: 'st-b.B3.1',
  title: 'Derivation from a string',
  minutes: 12, difficulty: 3,
  intro: t`In PHYS 2220 (lesson W1.2) you found the speed of waves on a string, $\sqrt{F_T/\mu}$; here we derive the whole equation and keep a list of everything thrown away. Take a short piece of string between $x$ and $x + \Delta x$, with tension $F_T$ pulling along the string at each end. If the slope $u_x$ is small, the upward pull at the right end is $F_T\sin\theta \approx F_T\,u_x(x + \Delta x)$ and at the left end $-F_T\,u_x(x)$. Newton’s second law for the piece, of mass $\mu\Delta x$, is then $\mu\,\Delta x\,u_{tt} = F_T\big[u_x(x + \Delta x) - u_x(x)\big]$. Divide by $\Delta x$ and let it shrink:

$$u_{tt} = c^2\,u_{xx}, \qquad c^2 = \frac{F_T}{\mu}$$

**The net force comes from the change in slope** — the curvature. The assumptions: small slopes ($\sin\theta \approx \tan\theta$), the same tension everywhere, purely sideways motion, and no gravity, air drag or bending stiffness. Each one you restore adds a term.`,
  symbols: [
    { tex: 'u(x, t)', text: 'the sideways displacement of the string (m)' },
    { tex: t`u_{tt}`, text: 'the sideways acceleration of the piece at $x$ (m/s²)' },
    { tex: t`u_{xx}`, text: 'the curvature of the string (1/m): how fast its slope changes along it' },
    { tex: t`F_T`, text: 'the tension (N), assumed the same all along the string' },
    { tex: t`\mu`, text: 'the linear density: mass per unit length (kg/m)' },
    { tex: 'c', text: t`$\sqrt{F_T/\mu}$, a speed (m/s) — lesson B3.2 shows it is the speed of waves in both directions` },
  ],
  why: t`Far from their sources, gravitational waves obey the same equation for the metric perturbation, $\Box\bar h_{\mu\nu} = 0$ in Lorenz gauge; LIGO’s arms are, in effect, measuring a solution of $u_{tt} = c^2\nabla^2 u$.`,
  visual: {
    ...element({
      sliders: [
        { key: 'x0', label: 'Piece at $x$', min: 0.6, max: 5.7, step: 0.05, value: 2.2, explain: 'Where the piece of string sits.' },
        { key: 'dx', label: 'Length $\\Delta x$', min: 0.2, max: 1.2, step: 0.05, value: 0.6, explain: 'How long the piece is. The derivation lets it shrink to zero.' },
        { key: 'A', label: 'Amplitude $A$', min: 0.05, max: 1.5, step: 0.05, value: 0.25, explain: 'How far the string is displaced. Larger amplitude means steeper slopes.' },
      ],
      readouts: [
        { label: t`net upward pull $\div F_T$ (exact)`, expr: `${sinA(xb)} - ${sinA(xa)}`, digits: 3 },
        { label: t`small-slope estimate $u_{xx}\,\Delta x$`, expr: '-A*sin(x0)*dx', digits: 3 },
        { label: 'steepest slope', expr: 'A', digits: 2 },
      ],
      caption: t`The string $u = A\sin x$ frozen at one instant, with the tension (teal) pulling along it at both ends of the gold piece. The red arrow is the net sideways pull, magnified ×4. Lengths are in arbitrary units.`,
    }),
    title: 'The pull of curvature',
    lead: t`The two tension arrows have the same length but point along the string at each end. Their sideways parts almost cancel; what is left — the red arrow — depends on how much the slope **changes** across the piece.`,
    tasks: [
      'Slide the piece to a crest: the net pull points down, toward the straight line. At an inflection point it vanishes.',
      'Shrink Δx and lower A: the exact pull and the small-slope estimate u_xx Δx converge.',
      'Raise the amplitude to 1.5: the slopes are no longer small and the two readouts part company — the linear wave equation is failing.',
    ].map((s) => s.replace('u_xx Δx', 'uₓₓ Δx')),
  },
  example: {
    prompt: t`A ${SAG.L} m span of instrumentation cable ($\mu = ${SAG.mu}$ kg/m) is strung between two masts at a test range with tension $F_T = ${SAG.FT / 1000}$ kN. Add gravity to the derivation and find how far the middle sags at rest.`,
    visual: { type: 'graph', params: { x: [-2, 52], y: [-0.4, 0.1], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u (m)', curves: [{ fn: `${G}*x*(x - ${SAG.L})/(2*${SAG.c2})`, color: 'accent', width: 2.4, domain: [0, SAG.L] }], points: [{ x: 0, y: 0, color: 'gold', label: 'mast' }, { x: SAG.L, y: 0, color: 'gold', label: 'mast', labelDx: -34 }] }, caption: t`The static sag $u = gx(x - L)/(2c^2)$. The vertical scale is stretched about 100 times; the real cable looks almost straight.` },
    steps: [
      { label: 'Add the weight', text: t`The piece also feels its weight, $-\mu\Delta x\,g$: $\mu\,\Delta x\,u_{tt} = F_T\big[u_x(x + \Delta x) - u_x(x)\big] - \mu\Delta x\,g$, so $u_{tt} = c^2u_{xx} - g$. Gravity is a **source** term: the equation is still linear, now inhomogeneous.` },
      { label: 'At rest', text: t`A cable hanging still has $u_{tt} = 0$, leaving an ODE: $u_{xx} = g/c^2$, with $u(0) = u(L) = 0$ at the masts.` },
      { label: 'Solve', text: t`Integrate twice and fit the ends: $u = \dfrac{g}{2c^2}\,x(x - L)$, a parabola.` },
      { label: 'Numbers', text: t`$c^2 = F_T/\mu = ${SAG.FT}/${SAG.mu} = ${tex(SAG.c2)}\ \text{m}^2/\text{s}^2$. The middle sags by $\dfrac{gL^2}{8c^2} = \dfrac{(${G})(${SAG.L})^2}{8(${tex(SAG.c2)})} = ${tex(SAG.s)}$ m.` },
      { label: 'Check the assumption', text: t`The steepest slope, at the masts, is $gL/(2c^2) = ${tex(SAG.slope)}$: about one degree. Small slopes — the linear equation was entitled to be used. (A slack cable with large sag needs the exact curve, the catenary.)` },
    ],
    answer: t`$u_{tt} = c^2u_{xx} - g$; at rest the cable is a parabola sagging $gL^2/(8c^2) \approx ${tex(SAG.s)}$ m at mid-span.`,
  },
  practice: [
    order({
      id: 'derive', difficulty: 2,
      prompt: t`Put the steps of the derivation of $u_{tt} = c^2u_{xx}$ in order.`,
      items: [
        t`Isolate a piece of string between $x$ and $x + \Delta x$; its mass is $\mu\,\Delta x$.`,
        t`Resolve the tension at each end sideways: $F_T\sin\theta \approx F_T\,u_x$ for small slopes.`,
        t`Newton’s second law: $\mu\,\Delta x\,u_{tt} = F_T\big[u_x(x + \Delta x) - u_x(x)\big]$.`,
        t`Divide by $\mu\,\Delta x$ and let $\Delta x \to 0$: the bracket over $\Delta x$ becomes $u_{xx}$.`,
        t`Name $c^2 = F_T/\mu$: $u_{tt} = c^2u_{xx}$.`,
      ],
      hints: ['Start with a free-body diagram of a small piece.', 'The limit Δx → 0 turns a difference of slopes into a second derivative.'],
      teach: 'Newton on a small piece, small slopes, then shrink the piece.',
      explain: 'Choose the piece, find the forces on it, apply F = ma, then let the piece shrink. The small-slope step is where the linear equation is bought — and where it would fail for large amplitudes.',
    }),
    match({
      id: 'extra-terms', difficulty: 2,
      prompt: t`Each effect the derivation left out adds one term to $u_{tt} = c^2u_{xx} + \ldots$. Match them.`,
      visual: element({ constants: { x0: 1.8, dx: 0.7, A: 0.6 }, netLabel: 'net tension', mag: 1.5,
        extra: [{ from: ['x0 + 0.25', 'A*sin(x0)'], to: ['x0 + 0.25', 'A*sin(x0) - 0.6'], color: 'gold', width: 2.2, label: 'weight', labelDx: 6 }, { from: ['x0 - 0.25', 'A*sin(x0) + 0.05'], to: ['x0 - 0.25', 'A*sin(x0) - 0.35'], color: 'violet', width: 2.2, label: 'drag', labelDx: -36 }],
        caption: 'A piece of string with the forces the simple derivation keeps (tension) and two it drops: its weight and air drag opposing its motion (here moving upward). Arrows show direction only; the tension and net pull are drawn as in the Explore step.' }),
      left: ['gravity on the string', 'air drag, proportional to sideways velocity', 'bending stiffness (a thick piano wire)', 'a sideways driving force per unit length f(x, t)'],
      right: ['−g', '−γ uₜ', '−(EI/μ) uₓₓₓₓ', '+ f/μ', '+ c² uₓ'],
      answer: [0, 1, 2, 3],
      hints: ['Write each as a force per unit length and divide by μ.', 'Drag opposes velocity, uₜ; stiffness resists bending, which takes four x-derivatives (two for curvature, two more for the force it makes).'],
      teach: 'Each neglected force per unit length, divided by μ, is one extra term.',
      explain: t`Weight $-\mu g$ gives $-g$; drag $-b\,u_t$ gives $-\gamma u_t$ with $\gamma = b/\mu$; a beam’s bending moment $EIu_{xx}$ produces a sideways force $-EIu_{xxxx}$; a driving force density gives $+f/\mu$. No physical effect gives a lone $u_x$ term on a symmetric string.`,
    }),
    num({
      id: 'tension-for-sag', difficulty: 2,
      gen(r) {
        const L = r.pick([30, 40, 60]), mu = r.pick([0.8, 1.2, 2.0]), s = r.pick([0.2, 0.3, 0.5]);
        const FT = (mu * G * L * L) / (8 * s);
        return {
          prompt: t`A ${L} m cable span with $\mu = ${mu}$ kg/m must sag no more than ${s} m at mid-span. Using $u_{tt} = c^2u_{xx} - g$ at rest, what tension is needed, in kN?`,
          visual: { type: 'graph', params: { x: [-2, L + 2], y: [-1.6 * s, 0.4 * s], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u (m)', curves: [{ fn: `${s}*4*x*(x - ${L})/${L * L}`, color: 'accent', width: 2.4, domain: [0, L] }], hlines: [{ y: -s, label: `${s} m`, color: 'ink3' }] }, caption: 'The parabolic sag at rest (vertical scale greatly stretched).' },
          answer: FT / 1000, units: 'kN', tol: { rel: 0.01 },
          errors: [{ value: (mu * G * L * L) / (4 * s) / 1000, feedback: t`At mid-span $x(x - L) = -L^2/4$, and the formula has $2c^2$ underneath: the sag is $gL^2/(8c^2)$.` }, { value: (mu * G * L * L) / (8 * s), feedback: 'That is in newtons; the question asks for kN.' }],
          hints: [t`At rest $u = \dfrac{g}{2c^2}x(x - L)$, so the mid-span sag is $s = \dfrac{gL^2}{8c^2}$.`, t`$c^2 = F_T/\mu$, so $F_T = \dfrac{\mu g L^2}{8s}$.`],
          teach: 'At rest the gravity-loaded string equation is an ODE: the sag is a parabola, gL²/(8c²) deep.',
          explain: t`$F_T = \dfrac{\mu gL^2}{8s} = \dfrac{(${mu})(${G})(${L})^2}{8(${s})} = ${tex(FT)}$ N $= ${tex(FT / 1000)}$ kN. Doubling the span needs four times the tension for the same sag.`,
        };
      },
    }),
    num({
      id: 'small-slope', difficulty: 2,
      gen(r) {
        const p = r.pick([0.5, 1, 2, 5]);
        const th = (Math.acos(1 / (1 + p / 100)) * 180) / Math.PI;
        return {
          prompt: t`The derivation replaced the sideways part of the tension, $F_T\sin\theta$, by $F_T\tan\theta = F_T\,u_x$. At what slope angle $\theta$ does $\tan\theta$ exceed $\sin\theta$ by ${p}%? Give $\theta$ in degrees.`,
          visual: { type: 'graph', params: { x: [0, 30], y: [0, 0.6], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: '', curves: [{ fn: 'tan(x*pi/180)', color: 'warn', width: 2.2, label: 'tan θ', labelAt: 26, labelDy: -10 }, { fn: 'sin(x*pi/180)', color: 'accent', width: 2.2, label: 'sin θ', labelAt: 27, labelDy: 14 }] }, caption: 'tan θ and sin θ agree for small angles and part company as the string steepens.' },
          answer: th, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: Math.acos(1 / (1 + p / 100)), feedback: 'That is in radians; convert to degrees.' }],
          hints: [t`$\tan\theta/\sin\theta = 1/\cos\theta$.`, t`Solve $1/\cos\theta = 1 + ${p / 100}$: $\theta = \arccos\big(1/${1 + p / 100}\big)$.`],
          teach: 'The linear wave equation is a small-slope approximation: its error grows like θ²/2.',
          explain: t`$\tan\theta/\sin\theta = 1/\cos\theta = ${1 + p / 100}$ at $\theta = \arccos(1/${1 + p / 100}) = ${tex(th)}°$. A guitar string is far below this; a whip is far above.`,
        };
      },
    }),
    num({
      id: 'net-pull', difficulty: 2,
      gen(r) {
        const FT = r.pick([200, 400, 600]), s1 = r.pick([0.04, 0.06, 0.08]), s2 = -r.pick([0.02, 0.03, 0.05]);
        const net = FT * (s2 / Math.sqrt(1 + s2 * s2) - s1 / Math.sqrt(1 + s1 * s1));
        return {
          prompt: t`A short piece of a string under tension ${FT} N has slope $u_x = ${s1}$ at its left end and $u_x = ${s2}$ at its right end. What is the net sideways force on it, in newtons (positive upward)?`,
          visual: { type: 'graph', params: { x: [-1, 3], y: [-0.25, 0.35], aspect: 'wide', xlabel: 'x', ylabel: 'u', xticks: 4, yticks: 3, curves: [{ fn: `${s1}*x + (${s2} - ${s1})*x^2/4`, color: 'gold', width: 4, domain: [0, 2] }, { fn: `${s1}*x`, color: 'teal', dash: [5, 4], domain: [-0.8, 0.6] }, { fn: `${s2}*(x - 2) + ${s1} + ${s2}`, color: 'teal', dash: [5, 4], domain: [1.4, 2.8] }] }, caption: 'The piece (gold) and the tangent lines at its ends (teal), along which the tension pulls. Slopes are exaggerated for visibility.' },
          answer: net, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: FT * (s2 + s1), feedback: 'The left end pulls the other way (toward −x): its sideways part has the opposite sign. Subtract the slopes.' }],
          hints: [t`Sideways force = $F_T\big[\sin\theta_{\text{right}} - \sin\theta_{\text{left}}\big] \approx F_T\big[u_x(\text{right}) - u_x(\text{left})\big]$.`],
          teach: 'The net force on a piece of string is tension × the change in slope across it.',
          explain: t`$F \approx ${FT}\,\big[(${s2}) - (${s1})\big] = ${tex(FT * (s2 - s1))}$ N (exactly, with sines, ${tex(net)} N). Negative: the slope decreases across the piece, the string is curving downward, and it is pulled down.`,
        };
      },
    }),
    num({
      id: 'drag-decay', difficulty: 2,
      gen(r) {
        const g = r.pick([0.1, 0.2, 0.5, 1.0]);
        const th = (2 * Math.log(2)) / g;
        return {
          prompt: t`With air drag the string obeys $u_{tt} + \gamma\,u_t = c^2u_{xx}$, $\gamma = ${g}\ \text{s}^{-1}$. A mode $u = T(t)\sin(kx)$ then has $T'' + \gamma T' + c^2k^2T = 0$, and for light damping its amplitude falls as $e^{-\gamma t/2}$. After how many seconds has a plucked mode lost half its amplitude?`,
          visual: { type: 'graph', params: { x: [0, 3 * th], y: [-1.1, 1.1], aspect: 'wide', xlabel: 't (s)', ylabel: 'T(t)', curves: [{ fn: `e^(-${g / 2}x)*cos(${(12 * Math.PI) / (3 * th)}x)`, color: 'accent', width: 1.6 }, { fn: `e^(-${g / 2}x)`, color: 'gold', dash: [5, 4] }, { fn: `-e^(-${g / 2}x)`, color: 'gold', dash: [5, 4] }] }, caption: 'One mode ringing down inside its envelope $e^{-\\gamma t/2}$ (gold). The oscillation frequency is drawn far lower than a real string’s.' },
          answer: th, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Math.log(2) / g, feedback: t`The amplitude decays as $e^{-\gamma t/2}$, not $e^{-\gamma t}$: the half-life is $2\ln2/\gamma$.` }],
          hints: [t`Solve $e^{-\gamma t/2} = \tfrac12$.`],
          teach: t`A drag term $-\gamma u_t$ damps every mode as $e^{-\gamma t/2}$.`,
          explain: t`$e^{-\gamma t/2} = \tfrac12 \Rightarrow t = 2\ln2/\gamma = ${tex(th)}$ s. (Real strings also lose energy into their supports and through internal friction, which depend on frequency.)`,
        };
      },
    }),
    mcq({
      id: 'stiffness', difficulty: 3,
      prompt: t`A stiff piano wire obeys $u_{tt} = c^2u_{xx} - \beta\,u_{xxxx}$ with $\beta > 0$. Try a travelling wave $u = \sin\big(k(x - vt)\big)$. What do you find?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 6], aspect: 'wide', xlabel: 'wavenumber k', ylabel: 'speed', curves: [{ fn: '2 + 0*x', color: 'ink3', dash: [5, 4], label: 'ideal string: v = c', labelAt: 0.3, labelDy: 12 }, { fn: 'sqrt(4 + 0.9*x^2)', color: 'accent', width: 2.4, label: 'stiff wire', labelAt: 3, labelDy: -12 }] }, caption: 'Wave speed against wavenumber for an ideal string (dashed) and a stiff one (c = 2, β = 0.9; illustrative values).' },
      choices: [t`$v = \sqrt{c^2 + \beta k^2}$: short waves run faster, so a pulse spreads out`, t`$v = c$ for every $k$, as for the ideal string`, t`$v = \sqrt{c^2 - \beta k^2}$: short waves are slower`, t`No travelling sine wave solves it`],
      answer: 0,
      why: {
        1: t`The extra term contributes $-\beta k^4\sin(\cdot)$; it does not cancel, so the speed must change with $k$.`,
        2: t`Watch the sign: $u_{xxxx} = +k^4\sin(\cdot)$, and the equation subtracts $\beta u_{xxxx}$, so on the right you get $-c^2k^2 - \beta k^4$ times the sine, matching $-k^2v^2$.`,
        3: t`Sines do solve it, each at its own speed — that wavelength-dependent speed is called **dispersion**.`,
      },
      hints: [t`$u_{tt} = -k^2v^2\sin(\cdot)$, $u_{xx} = -k^2\sin(\cdot)$, $u_{xxxx} = k^4\sin(\cdot)$.`, t`So $-k^2v^2 = -c^2k^2 - \beta k^4$.`],
      teach: 'Stiffness adds a fourth derivative, which makes wave speed depend on wavelength (dispersion).',
      explain: t`$k^2v^2 = c^2k^2 + \beta k^4$, so $v = \sqrt{c^2 + \beta k^2}$. A pulse is a mixture of wavelengths; with dispersion they drift apart, and the pulse spreads. The ideal wave equation is special: every wavelength moves at $c$, so shapes are kept (lesson B3.2).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-water-hammer', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([40, 60, 90, 120]);
        const K = 2.2e9, rho = 998, c = Math.sqrt(K / rho), T = (2 * L) / c;
        return {
          prompt: t`A test stand’s deluge-water line is ${L} m long. When a valve at its end slams shut, the pressure disturbance obeys $p_{tt} = c^2p_{xx}$ with $c = \sqrt{K/\rho}$, where water’s bulk modulus is $K = 2.2$ GPa and $\rho = 998\ \text{kg/m}^3$. How long does the pressure wave take to run to the far end and back, in milliseconds?`,
          visual: { type: 'graph', params: { x: [0, L * 1.05], y: [0, 2.2 * T * 1000], aspect: 'wide', xlabel: 'x along the line (m)', ylabel: 't (ms)', axesAt: 'edge', curves: [{ param: [`${L} - ${c / 1000}*t`, 't'], t: [0, T * 500], color: 'warn', width: 2.4 }, { param: [`${c / 1000}*(t - ${T * 500})`, 't'], t: [T * 500, T * 1000], color: 'warn', width: 2.4 }], vlines: [{ x: L, label: 'valve', color: 'gold' }] }, caption: 'The pressure front’s path in the x–t plane: out from the valve and back after reflecting at the reservoir end.' },
          answer: T * 1000, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: (L / c) * 1000, feedback: 'That is one way. The question asks for there and back.' }, { value: ((2 * L) / Math.sqrt(K * rho)) * 1000, feedback: t`$c = \sqrt{K/\rho}$: divide the modulus by the density inside the root.` }],
          hints: [t`$c = \sqrt{2.2\times10^9/998}$ m/s.`, t`Time there and back: $2L/c$.`],
          teach: 'The same wave equation governs pressure in a liquid line, with c = √(K/ρ).',
          explain: t`$c = \sqrt{2.2\times10^9/998} \approx ${tex(c)}$ m/s, so $2L/c = ${tex(T * 1000)}$ ms. Pipe walls stretch under the pressure, which in a real steel line lowers $c$ by roughly 10–30%; designers of feed systems account for that.`,
        };
      },
    }),
    mcq({
      id: 'cp-large', difficulty: 2,
      prompt: t`A rope is flicked hard enough that its slope reaches about 1 (45°). Which assumption of the derivation fails first, and what does that do to the equation?`,
      visual: element({ constants: { x0: 2.6, dx: 0.8, A: 1.3 }, mag: 1, caption: 'A strongly displaced rope: at the ends of the gold piece the tension points steeply, and the small-slope estimate of the pull is badly off.' }),
      choices: [t`$\sin\theta \approx u_x$ fails; the exact equation is nonlinear in $u_x$`, 'Gravity becomes important; a constant −g term appears', t`The tension disappears, so $c = 0$`, 'Nothing fails: the wave equation holds for any amplitude'],
      answer: 0,
      why: {
        1: 'Gravity on a taut rope is unchanged by flicking it harder; and a constant term would not depend on the amplitude.',
        2: 'The tension is still there — it just pulls along steeply sloped directions.',
        3: t`The derivation used $\sin\theta \approx \tan\theta$; at 45° they differ by 41%.`,
      },
      hints: [t`At 45°, compare $\sin\theta$ with $\tan\theta$.`],
      teach: 'The linear wave equation is the small-slope limit; large amplitudes make the string equation nonlinear.',
      explain: t`The sideways pull is $F_T\,u_x/\sqrt{1 + u_x^2}$, which is linear in $u_x$ only for small slopes. Keeping it gives a nonlinear equation in which waves of large amplitude distort; the length of the string (and with it the tension) also changes.`,
    }),
    multi({
      id: 'cp-other-waves', difficulty: 2, transfer: true,
      prompt: t`Which of these obey the wave equation $\phi_{tt} = c^2\phi_{xx}$ (in a suitable small-amplitude, lossless limit)? Select all that apply.`,
      choices: [
        'the pressure in a liquid-filled pipe (water hammer)',
        'the voltage on a lossless coaxial cable',
        t`each component of a weak gravitational wave, $h$, far from its source`,
        'the temperature along a heat-shield tile',
        'the concentration of a dye carried by a river',
      ],
      answer: [0, 1, 2],
      why: {
        3: 'Heat conduction is first order in time: the heat equation, which spreads rather than propagates.',
        4: 'Carried at one speed in one direction: the first-order transport equation, not the two-way wave equation.',
      },
      hints: ['A wave equation needs a restoring effect and an inertia-like effect: two time derivatives.', 'Diffusion and advection are first order in time.'],
      teach: 'The wave equation appears wherever a quantity has inertia and a restoring stiffness: strings, fluids, circuits, spacetime.',
      explain: t`Pressure ($c = \sqrt{K/\rho}$), a cable’s voltage ($c = 1/\sqrt{LC}$ per unit length) and a weak gravitational wave ($c$ itself) all obey it. Heat and carried dye obey first-order-in-time equations: the heat and transport equations.`,
    }),
  ],
  sources: [SRC.strauss, { label: 'OpenStax University Physics Vol. 1, §16.2–16.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/16-3-wave-speed-on-a-stretched-string' }],
});
