// Parallel transport, holonomy and Gravity Probe B — Derivation Mode. The
// transport equation dV^μ/dλ + Γ^μ_νρ ẋ^ν V^ρ = 0 solved exactly around a
// circle of latitude (V^θ = cos(φ cos θ₀): holonomy 2π(1 − cos θ₀), the cap
// area); geodesics as curves that transport their own tangent; the cone; and
// the same calculation along a circular orbit of the Schwarzschild spacetime,
// whose spin component goes as cos(φ√(1 − 3GM/c²r)) — the geodetic precession
// 2π[1 − √(1 − 3GM/c²r)] per orbit that Gravity Probe B measured (Everitt et
// al. 2011: −6601.8 ± 18.3 mas/yr against −6606.1 predicted). Verified with
// SymPy and numerical transport (scratch v12_13.py; model gr-surface).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C, sci } from './_curvature.js';
import { rnd, surfacePic } from './_tensors.js';

const t = String.raw;
const DEG = Math.PI / 180;
const GM_E = 3.986004418e14;                      // m³/s²
const YR = 3.15576e7;                             // s (Julian year)
const MAS = Math.PI / 648e6;                      // rad per milliarcsecond
const geodetic = (r) => (1.5 * GM_E ** 1.5) / (C * C * r ** 2.5);     // rad/s, circular orbit

const capPic = (colat, progress, caption) => ({ type: 'gr-sphere-transport', params: { mode: 'cap', lat: 90 - colat, progress, readout: false }, caption });

// a cone of half-angle a with a loop around its tip
const conePic = (a) => ({
  type: 'surface3d',
  params: {
    surface: [`v*${rnd(Math.sin(a * DEG), 5)}*cos(u)`, `v*${rnd(Math.sin(a * DEG), 5)}*sin(u)`, `1.4 - v*${rnd(Math.cos(a * DEG), 5)}`], domain: [[0, 6.2832], [0, 2.4]], n: 30, axes: false, alpha: 0.7, colorBy: false,
    yaw: -0.6, pitch: 0.3, dist: 7,
    curves: [{ param: [`1.5*${rnd(Math.sin(a * DEG), 5)}*cos(t)`, `1.5*${rnd(Math.sin(a * DEG), 5)}*sin(t)`, `1.4 - 1.5*${rnd(Math.cos(a * DEG), 5)}`], t: [0, 6.2832], color: 'gold', width: 2.6 }],
  },
  caption: t`A cone of half-angle ${a}° with a loop (gold) around its tip. The paper is flat everywhere except at the tip. Drag to rotate.`,
});

// a gyroscope circling a black hole: spin arrows turning in the same sense as the orbit (illustrative amount)
const orbitSpins = (k) => {
  const arrows = [];
  for (let j = 0; j < 8; j++) {
    const p = (j * Math.PI) / 4, ang = Math.PI / 2 + 0.12 * p;          // drawn drift: illustrative, not this orbit's
    const x = 2.2 * Math.cos(p), y = 2.2 * Math.sin(p);
    arrows.push({ from: [rnd(x, 4), rnd(y, 4)], to: [rnd(x + 0.55 * Math.cos(ang), 4), rnd(y + 0.55 * Math.sin(ang), 4)], color: j === 0 ? 'ink' : 'gold' });
  }
  arrows.push({ from: [rnd(2.75 * Math.cos(0.5), 4), rnd(2.75 * Math.sin(0.5), 4)], to: [rnd(2.75 * Math.cos(0.9), 4), rnd(2.75 * Math.sin(0.9), 4)], color: 'accent', label: 'orbit', labelDx: 6, labelDy: -6 });
  return {
    type: 'graph',
    params: {
      x: [-3.6, 3.6], y: [-3, 3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['0.7*cos(t)', '0.7*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 3 }, { param: ['2.2*cos(t)', '2.2*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.4, dash: true }],
      arrows,
      points: [{ x: -0.62, y: 0.95, r: 0.01, color: 'ink2', label: 'horizon, r = 2M' }, { x: 2.3, y: -0.45, r: 0.01, color: 'accent', label: `r = ${k}M` }],
    },
    caption: 'Schematic, not to scale: a gyroscope on a circular orbit around a black hole, its spin (gold) carried round by parallel transport from the black arrow. It turns in the same sense as the orbit; the drawn amount is illustrative — the calculation gives the real one.',
  };
};

// GP-B: gyroscope spins pointing at the guide star around a polar orbit (schematic)
const gpbPicture = {
  type: 'graph',
  params: {
    x: [-3.4, 3.8], y: [-2.6, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['1.3*cos(t)', '1.3*sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.6 }, { param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.4, dash: true }],
    arrows: [0, 1, 2, 3, 4, 5].map((j) => { const p = (j * Math.PI) / 3 + 0.4; const x = 2 * Math.cos(p), y = 2 * Math.sin(p); return { from: [rnd(x, 4), rnd(y, 4)], to: [rnd(x + 0.6, 4), rnd(y + 0.12, 4)], color: 'gold' }; }),
    points: [{ x: 3.5, y: 0.75, r: 4, color: 'gold', label: 'guide star' }, { x: -0.35, y: 0, r: 0.01, color: 'teal', label: 'Earth' }],
  },
  caption: 'Schematic, not to scale: Gravity Probe B’s gyroscopes circled the Earth on a polar orbit with their spins aimed at a guide star. Relativity turns them by thousandths of a degree a year — far too little to draw.',
};

// GP-B results as a little chart: measured value with its error bar against the prediction
const gpbChart = {
  type: 'graph',
  params: {
    x: [-5, 50], y: [-0.6, 1.6], xlabel: 'frame-dragging drift (milliarcseconds per year)', ylabel: '', yticks: 0,
    curves: [{ param: ['30 + 14.4*t', '0.6'], t: [0, 1], color: 'accent', width: 3 }],
    vlines: [{ x: 39.2, label: 'GR prediction', color: 'gold' }, { x: 0, label: 'no effect', color: 'ink3' }],
    points: [{ x: 37.2, y: 0.6, color: 'accent', r: 5, label: 'GP-B (±1σ)', labelDx: -86, labelDy: -14 }],
  },
  caption: 'Gravity Probe B’s frame-dragging measurement (blue: the value with its one-standard-deviation error bar) against general relativity’s prediction (gold) and zero. Signs dropped: both are drifts in the same sense.',
};

export default lesson({
  id: 'gr.S13.d',
  title: 'Parallel transport, holonomy and Gravity Probe B',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der', 'est-obs'],
  intro: t`**Parallel transport** carries a vector along a curve without turning it — "turning" as the connection measures it: the vector's covariant derivative along the curve is zero, the equation above. A **geodesic** is the curve whose own tangent is parallel-transported along it.

On a curved space, a vector carried around a closed loop comes back **rotated**. That rotation, the **holonomy**, is the curvature enclosed — and it can be measured from inside. In spacetime, the spin axis of a freely falling gyroscope is parallel-transported, so a gyroscope circling the Earth slowly turns. Gravity Probe B measured that turning to 0.3%.`,
  equation: t`\frac{dV^\mu}{d\lambda} + \Gamma^\mu{}_{\nu\rho}\,\frac{dx^\nu}{d\lambda}\,V^\rho = 0`,
  symbols: [
    { tex: 'V^\\mu(\\lambda)', text: t`the components of the vector being carried, at each point of the curve` },
    { tex: 'x^\\nu(\\lambda)', text: t`the curve it is carried along, labelled by $\lambda$; $dx^\nu/d\lambda$ is its velocity` },
    { tex: '\\lambda', text: t`the label along the curve — any smooth one: unlike the geodesic equation, this one is unchanged by relabelling` },
    { tex: '\\Gamma^\\mu{}_{\\nu\\rho}', text: t`the Christoffel symbols (step 11): how the coordinate basis turns, which the components must undo to keep the vector itself unturned` },
    { tex: '\\mu,\\ \\nu,\\ \\rho', text: t`$\mu$ is free (one equation per component); $\nu$ and $\rho$ are summed` },
  ],
  why: t`Holonomy around small loops is how the Riemann tensor is defined (step 14), and gyroscopes in orbit are how it has been measured: Gravity Probe B's axes turned by 6.6 arcseconds a year, as transport through curved spacetime predicts.`,
  visual: {
    type: 'gr-sphere-transport',
    title: 'An arrow carried round a circle of latitude',
    lead: t`The arrow starts pointing north and is carried east around the circle of latitude $\lambda$ — colatitude $\theta_0 = 90^\circ - \lambda$ — without being turned. Drag "how far around", and compare its final turn with the enclosed area. The worked example finds the answer, $2\pi(1 - \cos\theta_0)$, by solving the transport equation.`,
    tasks: [
      'Set the latitude to 30°: the arrow comes back turned by 180°. The cap above 30°N is a quarter of the sphere, with area πR².',
      'Watch it partway round: relative to the local north it drifts steadily — by sin λ degrees for every degree of longitude.',
      'Move the circle up toward the pole: the turn shrinks with the cap area. A tiny loop is almost flat.',
    ],
    params: { mode: 'cap', lat: 30, progress: 1 },
  },
  example: {
    prompt: t`Carry a vector once around the circle of colatitude $\theta_0$ on a unit sphere ($\theta = \theta_0$, $\phi$ from $0$ to $2\pi$) without turning it. Solve the transport equations and find how much it has turned when it gets back.`,
    visual: capPic(60, 0.3, t`The circle at colatitude 60° (latitude 30°N). Black: the vector at the start, pointing north; red: the same vector carried 30% of the way round. Drag the sliders to follow it.`),
    steps: [
      { label: 'The path', text: t`Label the curve by $\lambda = \phi$: then $d\theta/d\lambda = 0$ and $d\phi/d\lambda = 1$. Only Christoffel symbols with a $\phi$ in the middle slot enter: $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ and $\Gamma^\phi{}_{\phi\theta} = \cot\theta$ (step 11).` },
      { label: 'The equations', text: t`The two components, $dV^\theta/d\phi + \Gamma^\theta{}_{\phi\phi}V^\phi = 0$ and $dV^\phi/d\phi + \Gamma^\phi{}_{\phi\theta}V^\theta = 0$, become $$\frac{dV^\theta}{d\phi} = \sin\theta_0\cos\theta_0\,V^\phi, \qquad \frac{dV^\phi}{d\phi} = -\cot\theta_0\,V^\theta.$$` },
      { label: 'Solve', text: t`Differentiate the first and use the second: $\dfrac{d^2V^\theta}{d\phi^2} = -\cos^2\theta_0\,V^\theta$ — simple harmonic, with angular rate $\cos\theta_0$. Starting from $V = \mathbf e_\theta$: $V^\theta = \cos(\phi\cos\theta_0)$ and $V^\phi = -\sin(\phi\cos\theta_0)/\sin\theta_0$.` },
      { label: 'Read the angle', text: t`In unit vectors, $\hat e_\phi = \mathbf e_\phi/\sin\theta_0$, the components are $\big(\cos(\phi\cos\theta_0),\ -\sin(\phi\cos\theta_0)\big)$: a vector of constant length — metric compatibility at work — turning steadily relative to the local frame by $\phi\cos\theta_0$.` },
      { label: 'Once around', text: t`At $\phi = 2\pi$ the local frame is back where it began, and the vector is turned by $2\pi\cos\theta_0$ against it — the same as $2\pi(1 - \cos\theta_0)$ the other way, modulo a full turn. That is the area of the cap, $2\pi R^2(1 - \cos\theta_0)$, divided by $R^2$. For $\theta_0 = 60^\circ$: $\pi$, a half-turn.` },
      { label: 'Sense checks', text: t`On the equator, $\cos\theta_0 = 0$: the vector keeps its angle to the path, because the equator is a geodesic. Near the pole the turn shrinks to nothing: small loops are nearly flat. And the same calculation along a circular orbit of the Schwarzschild spacetime gives a spin component $\propto\cos\!\big(\phi\sqrt{1 - 3GM/c^2r}\big)$: the gyroscope's turn per orbit is $2\pi\big[1 - \sqrt{1 - 3GM/c^2r}\,\big]$.` },
    ],
    answer: t`$V^\theta = \cos(\phi\cos\theta_0)$, $V^\phi = -\sin(\phi\cos\theta_0)/\sin\theta_0$; once around, the vector comes back turned by $2\pi(1 - \cos\theta_0)$ — the enclosed area over $R^2$.`,
  },
  practice: [
    num({
      id: 'partway', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 40, 70, 75]), phi = r.pick([90, 120, 180]);
        const ang = phi * Math.cos(th * DEG);
        return {
          prompt: t`A vector starts as $\mathbf e_\theta$ (pointing south) and is parallel-transported east along the circle of colatitude $\theta_0 = ${th}^\circ$. Using the solution $V^\theta = \cos(\phi\cos\theta_0)$, $V^{\hat\phi} = -\sin(\phi\cos\theta_0)$, by how many degrees has it turned relative to the local south when it has gone $${phi}^\circ$ of longitude?`,
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: phi * (1 - Math.cos(th * DEG)), feedback: t`That is the turn relative to the starting direction carried "rigidly". Relative to the local frame the turn is $\phi\cos\theta_0$.` }, { value: phi * Math.sin(th * DEG), feedback: t`The rate is $\cos\theta_0$ with $\theta_0$ the colatitude — the sine of the latitude.` }],
          hints: [t`The angle from the local $\hat e_\theta$ is $\phi\cos\theta_0$.`, t`$${phi}^\circ\times\cos ${th}^\circ$.`],
          teach: 'Along a circle of colatitude θ₀ a parallel-transported vector turns against the local frame at the steady rate cos θ₀ per unit of longitude.',
          explain: t`$${phi}^\circ\times\cos ${th}^\circ = ${fmt(ang, 3)}^\circ$. The rate, $\cos\theta_0$ per degree, is the Foucault pendulum's: at latitude $\lambda$, $\cos\theta_0 = \sin\lambda$.`,
          visual: capPic(th, phi / 360, t`The circle at colatitude ${th}°, the vector carried ${phi}° of longitude (red) from its start (black). The black arrow points north here; the turn is the same whichever way it starts.`),
        };
      },
    }),
    mcq({
      id: 'autoparallel', difficulty: 1,
      prompt: t`Put the curve's own velocity into the transport equation, $V^\mu = dx^\mu/d\lambda$. Which curves satisfy it?`,
      choices: [
        t`Geodesics (with an affine label): the equation becomes $\dfrac{d^2x^\mu}{d\lambda^2} + \Gamma^\mu{}_{\nu\rho}\dfrac{dx^\nu}{d\lambda}\dfrac{dx^\rho}{d\lambda} = 0$`,
        'Every closed curve',
        'Circles of latitude on a sphere, which never turn north or south',
        'Only curves in flat space',
      ],
      answer: 0,
      why: {
        1: 'A closed loop generally brings vectors back rotated; its own tangent is not transported unless it is a geodesic.',
        2: t`On a circle of latitude $\theta_0 \neq 90^\circ$ the tangent fails the equation: it must be steered by $\sin\theta_0\cos\theta_0$ per unit of $\phi^2$.`,
        3: 'Great circles on a sphere, and orbits in curved spacetime, transport their own tangent too.',
      },
      hints: [t`With $V^\mu = dx^\mu/d\lambda$, $dV^\mu/d\lambda = d^2x^\mu/d\lambda^2$.`],
      teach: 'A geodesic is an autoparallel: the curve that carries its own direction along without turning it.',
      explain: t`The transport equation for $V^\mu = \dot x^\mu$ is the geodesic equation of step 12. So "straightest" (no turning of the direction) and "stationary proper time" pick out the same curves — the Levi-Civita connection guarantees it.`,
      visual: surfacePic({ mode: 'geodesic', surface: 'sphere', v: 1.0, heading: 25, length: 5.5 }, 'A geodesic (gold) on a sphere: its direction is carried along without turning. Dashed: a circle of latitude, which is not.'),
    }),
    num({
      id: 'cone', difficulty: 2,
      gen(r) {
        const a = r.pick([35, 40, 50, 55]);
        const hol = 360 * (1 - Math.sin(a * DEG));
        return {
          prompt: t`A cone of half-angle $\alpha = ${a}^\circ$ has $d\ell^2 = ds^2 + s^2\sin^2\alpha\,d\phi^2$, so $\Gamma^s{}_{\phi\phi} = -s\sin^2\alpha$ and $\Gamma^\phi{}_{s\phi} = 1/s$. Transporting a vector around the circle $s = s_0$ gives $d^2V^s/d\phi^2 = -\sin^2\alpha\,V^s$, so it turns against the local frame at rate $\sin\alpha$. By how many degrees does it come back turned, after one loop around the tip?`,
          answer: hol, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 360 * Math.sin(a * DEG), feedback: t`That is the turn against the local frame, $2\pi\sin\alpha$. The frame itself turns by $2\pi$: the net turn is $2\pi(1 - \sin\alpha)$.` }, { value: 360 * (1 - Math.cos(a * DEG)), feedback: t`The rate is $\sin\alpha$, from $g_{\phi\phi} = s^2\sin^2\alpha$.` }],
          hints: [t`Once around, the vector turns by $2\pi\sin\alpha$ against a frame that itself turns by $2\pi$.`, t`Net turn: $360^\circ(1 - \sin ${a}^\circ)$.`],
          teach: 'Around a cone’s tip a transported vector turns by the deficit angle 2π(1 − sin α), whatever the size of the loop: the curvature is all at the tip.',
          explain: t`$360^\circ(1 - \sin ${a}^\circ) = ${fmt(hol, 3)}^\circ$, independent of $s_0$ — every loop around the tip encloses the same curvature, concentrated at the tip. That is the angle of the wedge you would cut from a flat disc to make this cone, $2\pi - 2\pi\sin\alpha$.`,
          visual: conePic(a),
        };
      },
    }),
    num({
      id: 'satellite', difficulty: 3,
      gen(r) {
        const [name, rkm] = r.pick([['the International Space Station', 6791], ['a LAGEOS laser-ranging satellite', 12270], ['a GPS satellite', 26562]]);
        const rate = geodetic(rkm * 1e3) * YR / MAS;
        return {
          prompt: t`For a gyroscope on a circular orbit of radius $r$, parallel transport in the Schwarzschild spacetime turns its spin by $2\pi\big[1 - \sqrt{1 - 3GM/c^2r}\,\big] \approx 3\pi GM/(c^2 r)$ per orbit. Divided by the orbital period $2\pi\sqrt{r^3/GM}$, that is a steady rate $\Omega = \tfrac32\,(GM)^{3/2}/(c^2 r^{5/2})$. Find $\Omega$ for ${name}, $r = ${rkm}$ km, in milliarcseconds per year. Use $GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $c = 2.998\times10^{8}$ m/s and 1 yr $= 3.156\times10^{7}$ s.`,
          answer: rate, units: 'mas', tol: { rel: 0.01 },
          errors: [{ value: rate * 2 / 3, feedback: t`Keep the $\tfrac32$: the per-orbit turn is $3\pi GM/(c^2r)$.` }, { value: rate * 1000, feedback: 'That is in microarcseconds. A milliarcsecond is 10⁻³ arcsecond = 4.848 × 10⁻⁹ rad.' }],
          hints: [t`$\Omega = 1.5\times(3.986\times10^{14})^{1.5}/\big((2.998\times10^{8})^2\times(${rkm}\times10^{3})^{2.5}\big)$ rad/s.`, t`Multiply by $3.156\times10^{7}$ s/yr, then divide by $4.848\times10^{-9}$ rad per mas.`],
          teach: 'The geodetic precession of an orbiting gyroscope, Ω = (3/2)(GM)^{3/2}/(c²r^{5/2}), falls steeply with distance: thousands of milliarcseconds a year in low orbit, hundreds at GPS height.',
          explain: t`$\Omega = ${sci(geodetic(rkm * 1e3), 3)}$ rad/s $= ${fmt(rate, 3)}$ mas/yr. The rate falls as $r^{-5/2}$, which is why Gravity Probe B flew in a low orbit, about 650 km up.`,
          visual: gpbPicture,
        };
      },
    }),
    mcq({
      id: 'gyro', difficulty: 2,
      prompt: 'Why is the spin axis of a torque-free gyroscope in free fall parallel-transported along its worldline?',
      choices: [
        t`In its own freely falling frame the Christoffel symbols vanish at its location and no torque acts, so $dS^\mu/d\tau = 0$ there — which, written in any coordinates, is $\dfrac{dS^\mu}{d\tau} + \Gamma^\mu{}_{\nu\rho}u^\nu S^\rho = 0$`,
        'Because a fast-spinning gyroscope cannot turn at all',
        'Because the Earth’s magnetic field holds it aligned',
        'Only on circular orbits; on others the spin is free to wander',
      ],
      answer: 0,
      why: {
        1: 'It does turn — by 6.6 arcseconds a year around the Earth. Fast spin makes it insensitive to small torques, not to the geometry.',
        2: 'GP-B’s rotors were shielded from magnetic fields; a magnetic torque would be a force-like effect, not transport.',
        3: 'Transport along any free-fall worldline holds; circular orbits just make the result easy to compute.',
      },
      hints: ['What does the equivalence principle say about a freely falling laboratory?', t`In such a lab $\Gamma = 0$ at its centre, so the covariant derivative equals the ordinary one there.`],
      teach: 'A free, torque-free gyroscope keeps its spin constant in its own freely falling frame; in general coordinates that statement is parallel transport.',
      explain: t`"Not turning" in a local inertial frame is $dS^\mu/d\tau = 0$ with $\Gamma = 0$; the tensor equation that agrees with it in every coordinate system is $DS^\mu/d\tau = 0$. So general relativity predicts how far an orbiting gyroscope turns relative to distant stars, with no free parameters.`,
      visual: gpbPicture,
    }),
    num({
      id: 'black-hole-gyro', difficulty: 3,
      gen(r) {
        const k = r.pick([6, 8, 10, 20]);
        const turn = 360 * (1 - Math.sqrt(1 - 3 / k));
        return {
          prompt: t`A gyroscope circles a non-spinning black hole on a circular orbit at $r = ${k}M$ ($G = c = 1$; ${k === 6 ? 'the innermost stable orbit' : 'outside the innermost stable orbit, 6M'}). Its spin turns by $2\pi\big[1 - \sqrt{1 - 3M/r}\,\big]$ per orbit. How many degrees is that?`,
          answer: turn, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 540 / k, feedback: t`That is the weak-field approximation $3\pi M/r$, accurate only when $M/r$ is small. Use the exact $2\pi[1 - \sqrt{1 - 3M/r}]$.` }, { value: 360 * Math.sqrt(1 - 3 / k), feedback: t`That is $2\pi\sqrt{1 - 3M/r}$, the turn against the local radial direction. Subtract it from a full turn.` }],
          hints: [t`$1 - 3M/r = 1 - 3/${k}$.`, t`$360^\circ\times\big(1 - \sqrt{1 - 3/${k}}\big)$.`],
          teach: 'Close to a black hole the geodetic precession is enormous — tens of degrees per orbit — where around the Earth it is billionths of a radian.',
          explain: t`$360^\circ\big(1 - \sqrt{${fmt(1 - 3 / k, 4)}}\big) = ${fmt(turn, 3)}^\circ$ per orbit, against $${fmt(540 / k, 3)}^\circ$ from the weak-field formula. Spin precession of this size is part of what shapes the gravitational-wave signals of merging black holes.`,
          visual: orbitSpins(k),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gpb', difficulty: 3, transfer: true,
      prompt: t`Gravity Probe B's gyroscopes flew on a polar orbit of radius about 7027 km (2004–2005). Use $\Omega = \tfrac32\,(GM)^{3/2}/(c^2 r^{5/2})$ with $GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and $c = 2.998\times10^{8}$ m/s to predict their geodetic drift, in milliarcseconds per year (1 yr $= 3.156\times10^{7}$ s, 1 mas $= 4.848\times10^{-9}$ rad).`,
      answer: geodetic(7.027e6) * YR / MAS, units: 'mas', tol: { rel: 0.005 },
      errors: [{ value: (geodetic(7.027e6) * YR / MAS) * 2 / 3, feedback: t`Keep the $\tfrac32$.` }, { value: geodetic(6.371e6) * YR / MAS, feedback: 'Use the orbit’s radius from Earth’s centre, 7027 km, not Earth’s own radius.' }],
      hints: [t`$\Omega = 1.5\times(3.986\times10^{14})^{1.5}/\big((2.998\times10^{8})^2\times(7.027\times10^{6})^{2.5}\big)$ rad/s.`, 'Convert: × 3.156 × 10⁷ s/yr, then ÷ 4.848 × 10⁻⁹ rad/mas.'],
      teach: 'Parallel transport through the curved spacetime around the Earth predicts Gravity Probe B’s geodetic drift of 6.6 arcseconds a year.',
      explain: t`$\Omega = ${sci(geodetic(7.027e6), 3)}$ rad/s $= ${fmt(geodetic(7.027e6) * YR / MAS, 4)}$ mas/yr. The full prediction, with the Earth's flattening and the real orbit, was 6606.1 mas/yr; the experiment measured $6601.8 \pm 18.3$ mas/yr (Everitt et al. 2011) — agreement to 0.3%.`,
      visual: gpbPicture,
    }),
    num({
      id: 'cp-frame-drag', difficulty: 2,
      prompt: t`Gravity Probe B also saw a much smaller drift at right angles: **frame dragging** by the Earth's rotation, which a non-spinning (Schwarzschild) metric does not contain; the spinning-Earth metric predicts 39.2 mas/yr. The measurement was $37.2 \pm 7.2$ mas/yr (one standard deviation). By how many standard deviations does the measurement differ from zero — that is, how firmly was frame dragging detected?`,
      answer: 37.2 / 7.2, tol: { rel: 0.01 },
      errors: [{ value: (39.2 - 37.2) / 7.2, feedback: 'That is the distance from the prediction, about 0.3σ: excellent agreement. The question asks for the distance from zero.' }, { value: 37.2 / 39.2, feedback: 'That is the measured fraction of the prediction. Divide by the uncertainty instead.' }],
      hints: ['A detection’s significance is the value divided by its standard deviation.'],
      teach: 'Gravity Probe B detected frame dragging at about 5 standard deviations, within 0.3σ of the prediction, and measured the geodetic effect to 0.3%.',
      explain: t`$37.2/7.2 = ${fmt(37.2 / 7.2, 3)}$ standard deviations from zero, and $(39.2 - 37.2)/7.2 \approx 0.3$ from general relativity's prediction. The effect is about $3\times10^{-8}$ degrees per day; unexpected torques from patches of electric charge on the rotors had to be modelled out to reach it.`,
      visual: gpbChart,
    }),
    expr({
      id: 'cp-component', difficulty: 2,
      prompt: t`Along the circle of colatitude $\theta$ on a sphere, labelled by $\phi$, the transport equation's $\phi$ component is $\dfrac{dV^\phi}{d\phi} + \Gamma^\phi{}_{\phi\theta}V^\theta = 0$. Writing $V^\theta$ as $V$, what is $dV^\phi/d\phi$?`,
      answer: '-cot(theta)*V', answerTeX: t`-\cot\theta\,V`, lhs: t`\frac{dV^\phi}{d\phi}`,
      vars: { theta: [0.3, 2.8], V: [-2, 2] },
      errors: [{ answer: 'cot(theta)*V', feedback: t`Move the $\Gamma$ term to the right-hand side: it changes sign.` }, { answer: 'sin(theta)*cos(theta)*V', feedback: t`That uses $\Gamma^\theta{}_{\phi\phi}$, which belongs to the $\theta$ component's equation. Here the symbol is $\Gamma^\phi{}_{\phi\theta} = \cot\theta$.` }],
      hints: [t`$\Gamma^\phi{}_{\phi\theta} = \cot\theta$ (step 11).`],
      teach: 'Each component of the transport equation subtracts the Christoffel term that tracks how the basis turns along the path.',
      explain: t`$\dfrac{dV^\phi}{d\phi} = -\cot\theta\,V^\theta$. With $\dfrac{dV^\theta}{d\phi} = \sin\theta\cos\theta\,V^\phi$ it closes into simple harmonic motion at rate $\cos\theta$ — the turn that adds up to the cap's area.`,
      visual: capPic(50, 0.35, 'The circle of colatitude 50°, with the vector carried part of the way round (red) from its start (black).'),
    }),
  ],
  sources: [
    { label: 'Everitt et al., “Gravity Probe B: final results of a space experiment to test general relativity”, Phys. Rev. Lett. 106, 221101 (2011)', url: 'https://arxiv.org/abs/1105.3456' },
    { label: 'Carroll, Lecture Notes on General Relativity, §3.3 (parallel transport) and §3.6', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 14 (gyroscopes in curved spacetime)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
  ],
});
