// Energy, conservative forces and the curl test: a force is conservative when
// it depends only on position and its work is path-independent — on a simply
// connected region, exactly when ∇×F = 0 — and then F = −∇U and K + U is
// conserved. Finding U by integration, work round loops by Stokes, the
// magnetic force (no work, yet not of the form −∇U), central forces, and a
// period from the energy integral for a quartic oscillator.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { simpson } from '../../src/viz/model/numeric.js';
import { sci, r6, pl, gpic, seg, lab, distinct, GM_EARTH } from './_cm.js';

const t = String.raw;

// ∫₀^{π/2} dφ/√(1 + sin²φ) = K(−1), for the quartic oscillator's period
const K_QUARTIC = simpson((p) => 1 / Math.sqrt(1 + Math.sin(p) ** 2), 0, Math.PI / 2, 2000);

// the worked example: F = (y², 2xy + z, y) N, with x, y, z in metres
const EX = (() => { const P = [1, 2, 3]; const U = (x, y, z) => -(x * y * y + y * z); return { P, W: U(0, 0, 0) - U(...P) }; })();

const SEL = (k) => `step(0.5 - abs(c - ${k}))`;

export default lesson({
  id: 'phys3550.M1.3',
  title: 'Energy, conservative forces and the curl test',
  minutes: 16, difficulty: 3,
  intro: t`The work–energy theorem, $\Delta K = \int\vec F\cdot d\vec r$, holds for any force. A force is **conservative** when it depends only on position and its work between two points is the same along every path. Then a potential energy $U(\vec r) = -\int_{\vec r_0}^{\vec r}\vec F\cdot d\vec r$ exists, $\vec F = -\nabla U$, and $E = K + U$ is constant. Checking every path is impossible, but Stokes' theorem turns path-independence into a local test: **the curl must vanish**. This is the physics side of [conservative fields](#/lesson/math2210.C3-5.3) and [curl](#/lesson/math2210.C3-5.5), and the 3D version of [potential-energy functions](#/lesson/phys2210.M8.2).`,
  equation: t`\nabla\times\vec F = 0 \;\iff\; \oint\vec F\cdot d\vec r = 0 \;\iff\; \vec F = -\nabla U`,
  symbols: [
    { tex: '\\vec F(\\vec r)', text: 'a force that depends on position only, in N' },
    { tex: '\\nabla\\times\\vec F', text: 'its curl, in N/m: $\\big(\\partial_yF_z - \\partial_zF_y,\\ \\partial_zF_x - \\partial_xF_z,\\ \\partial_xF_y - \\partial_yF_x\\big)$ — the circulation per unit area round a tiny loop' },
    { tex: '\\oint\\vec F\\cdot d\\vec r', text: 'the work the force does round a closed loop, in J' },
    { tex: 'U(\\vec r)', text: 'the potential energy, in J, defined up to an additive constant' },
    { tex: '\\nabla U', text: 'its gradient $(\\partial_xU, \\partial_yU, \\partial_zU)$, in N; the force points downhill, $-\\nabla U$' },
  ],
  why: t`Energy conservation is the shortcut through almost every mechanics problem — but only after the curl test says $U$ exists; and the Lagrangian of M4 is built from that $U$.`,
  visual: {
    type: 'field2d',
    title: 'Curl, loops and work',
    lead: t`Four plane force fields. The gold circle is a loop; the readout gives the work round it, $\oint\vec F\cdot d\vec r$, and the curl at the probe (drag the white handle).`,
    tasks: [
      t`**Spring** and **saddle**: the curl is 0 everywhere and the work round the loop is 0 — move the probe anywhere.`,
      t`**Swirl** $(-y, x)$: the curl is 2 everywhere, and the loop work equals $2\times$ the loop's area ($\pi\times0.9^2 \approx 2.54$, doubled $\approx 5.09$).`,
      t`**Shear** $(y, 0)$: every arrow points along $x$, yet the curl is $-1$ — the force is stronger on one side of the loop than the other.`,
    ],
    params: {
      P: `${SEL(1)}*(-x) + ${SEL(2)}*y + ${SEL(3)}*(-y) + ${SEL(4)}*y`,
      Q: `${SEL(1)}*(-y) + ${SEL(2)}*x + ${SEL(3)}*x`,
      x: [-3, 3], y: [-3, 3], loop: { r: 0.9, c: [0.8, 0.6] }, probe: [-1.5, -1.2],
      choices: [{ key: 'c', label: 'Force', options: [[1, t`Spring $(-x, -y)$`], [2, t`Saddle $(y, x)$`], [3, t`Swirl $(-y, x)$`], [4, t`Shear $(y, 0)$`]], value: 3, explain: 'Components in newtons, with x and y in metres.' }],
    },
    caption: t`Arrow lengths are compressed so weak and strong regions both show; colour gives the strength. Curl and loop integrals are computed numerically. $(\nabla\times\vec F)_z = \partial_xF_y - \partial_yF_x$.`,
  },
  example: {
    prompt: t`A force field is $\vec F = \big(y^2,\ 2xy + z,\ y\big)$ N, with $x, y, z$ in metres. Is it conservative? If so, find $U$ and the work it does on a particle carried from the origin to $(${EX.P.join(',\\ ')})$ m along any path.`,
    visual: { type: 'field2d', params: { P: 'y^2', Q: '2*x*y', x: [-2.5, 2.5], y: [-2.5, 2.5], probe: false, readout: false }, caption: t`The field's slice in the plane $z = 0$, where it is $(y^2, 2xy)$.` },
    steps: [
      { label: 'Curl, x-component', text: t`$\partial_yF_z - \partial_zF_y = 1 - 1 = 0$.` },
      { label: 'Curl, y and z', text: t`$\partial_zF_x - \partial_xF_z = 0 - 0 = 0$ and $\partial_xF_y - \partial_yF_x = 2y - 2y = 0$. The curl vanishes everywhere, and all of space is simply connected: **conservative**.` },
      { label: 'Integrate for U', text: t`$-\partial_xU = y^2$ gives $U = -xy^2 + f(y, z)$. Then $-\partial_yU = 2xy - \partial_yf = 2xy + z$ needs $f = -yz + g(z)$, and $-\partial_zU = y - g'(z) = y$ gives $g$ = const.` },
      { label: 'Potential', text: t`$U = -(xy^2 + yz) + C$. Check: $-\nabla U = (y^2,\ 2xy + z,\ y)$. ✓` },
      { label: 'Work', text: t`$W = U(0, 0, 0) - U(${EX.P.join(', ')}) = 0 - \big(-(1\cdot4 + 2\cdot3)\big) = ${EX.W}$ J, whatever the path.` },
    ],
    answer: t`Conservative; $U = -(xy^2 + yz)$ (plus a constant); the work is ${EX.W} J along any path.`,
  },
  practice: [
    multi({
      id: 'which', difficulty: 2,
      prompt: t`Which of these forces are conservative? ($k$, $b$, $G$, $M$, $m$ are positive constants.) Select every one.`,
      visual: { type: 'field2d', params: { P: 'y', Q: 'x', x: [-3, 3], y: [-3, 3], probe: false, readout: false }, caption: t`One of the candidates drawn in the plane: $k(y, x)$.` },
      choices: [t`$\vec F = -k\vec r$, a three-dimensional spring`, t`$\vec F = k(-y,\ x,\ 0)$`, t`$\vec F = -\dfrac{GMm}{r^2}\hat r$, gravity`, t`$\vec F = -b\vec v$, linear drag`, t`$\vec F = k(y,\ x,\ 0)$`],
      answer: [0, 2, 4],
      why: { 1: t`Its curl is $(0, 0, 2k) \ne 0$: work round a loop is $2k$ times the area enclosed.`, 3: t`Drag depends on velocity, not position; its work depends on the path's length and speed, and is negative round any loop.` },
      hints: [t`First: does the force depend on position only? Then compute its curl.`, t`Any central force $f(r)\hat r$ has zero curl.`],
      teach: t`Conservative means position-dependent with zero curl (on a simply connected region); velocity-dependent forces fail the first test.`,
      explain: t`The spring and gravity are central forces, curl-free; $k(y, x, 0)$ has curl $(0, 0, k - k) = 0$ and $U = -kxy$. The swirl has curl $2k\hat z$, and drag depends on $\vec v$.`,
    }),
    expr({
      id: 'potential', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([2, 4, 5]), c = r.pick([1, 3, 4]);
        const A = a === 1 ? '' : a, C = c === 1 ? '' : c;
        return {
          prompt: t`Show that $\vec F = \big(${2 * a}xy + ${b},\ ${A}x^2 + ${C}z,\ ${C}y\big)$ N is conservative and find its potential energy $U(x, y, z)$, taking $U = 0$ at the origin.`,
          answer: `-(${a}x^2 y + ${b}x + ${c}y z)`, answerTeX: t`-\left(${A}x^2y + ${b}x + ${C}yz\right)`,
          vars: { x: [-2, 2], y: [-2, 2], z: [-2, 2] }, mode: 'constant', wrt: '*', lhs: 'U',
          errors: [{ answer: `${a}x^2 y + ${b}x + ${c}y z`, feedback: t`Sign: $\vec F = -\nabla U$, so $U$ is minus the integral of $\vec F$.` }, { answer: `-(${a}x^2 y + ${b}x + ${c}y z + ${a}x^2 y + ${c}y z)`, feedback: t`You added the terms from each component separately and counted some twice. Integrate one component, then add only the genuinely new terms.` }],
          hints: [t`Curl: check $\partial_xF_y = \partial_yF_x$, $\partial_yF_z = \partial_zF_y$, $\partial_zF_x = \partial_xF_z$.`, t`$-\partial_xU = ${2 * a}xy + ${b}$ gives $U = -(${A}x^2y + ${b}x) + f(y, z)$; match the $y$- and $z$-components to find $f$.`],
          teach: t`Find $U$ by integrating one component of $-\vec F$ and fixing the "constant", a function of the other variables, from the rest.`,
          explain: t`Curl: $\partial_yF_z - \partial_zF_y = ${c} - ${c} = 0$; $\partial_zF_x - \partial_xF_z = 0$; $\partial_xF_y - \partial_yF_x = ${2 * a}x - ${2 * a}x = 0$. Then $U = -(${A}x^2y + ${b}x + ${C}yz)$, and $-\nabla U$ gives back $\vec F$.`,
          visual: { type: 'field2d', params: { P: `${2 * a}*x*y + ${b}`, Q: `${a}*x^2`, x: [-2, 2], y: [-2, 2], probe: false, readout: false }, caption: t`The force's slice in the plane $z = 0$.` },
        };
      },
    }),
    num({
      id: 'loop-work', difficulty: 2,
      gen(r) {
        const k = r.pick([0.5, 1.5, 2, 3]), R = r.pick([0.5, 1.0, 1.5]);
        const W = 2 * Math.PI * k * R * R;
        return {
          prompt: t`A force $\vec F = ${k}\,(-y,\ x)$ N (with $x, y$ in metres) acts on a bead pushed once anticlockwise round a circle of radius ${R} m centred on the origin. How much work does the force do?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: distinct([{ value: Math.PI * k * R * R, feedback: t`The curl of $k(-y, x)$ is $2k$, not $k$: both components contribute.` }, { value: 2 * Math.PI * k * R, feedback: t`Check: on the circle $|\vec F| = kR$ along the path, and the path is $2\pi R$ long — so $W = 2\pi kR^2$.` }], W),
          hints: [t`On the circle the force is tangent to the path with size $kR$.`, t`Or use Stokes: $\oint\vec F\cdot d\vec r = \iint(\nabla\times\vec F)_z\,dA = 2k\times\pi R^2$.`],
          teach: t`For a non-conservative force the work round a loop is the flux of the curl through it (Stokes' theorem).`,
          explain: t`$(\nabla\times\vec F)_z = \partial_x(${k}x) - \partial_y(-${k}y) = ${2 * k}$ N/m, so $W = ${2 * k}\times\pi(${R})^2 = ${sci(W)}$ J. Round the loop the bead gains energy: no $U$ can describe this force.`,
          visual: { type: 'field2d', params: { P: `-${k}*y`, Q: `${k}*x`, x: [-2, 2], y: [-2, 2], loop: { r: R }, probe: false, readout: false }, caption: t`The swirling force and the loop (gold) the bead goes round.` },
        };
      },
    }),
    mcq({
      id: 'magnetic', difficulty: 3,
      prompt: t`A charged particle moves through a steady magnetic field, feeling $\vec F = q\vec v\times\vec B$. Which statement is right?`,
      visual: { type: 'em-lorentz', params: { view: 'top', species: 'proton', v: 2e6, B: 0.5, sliders: [], arrows: ['v', 'F'], readouts: ['speed'], play: false, t: 0.3 }, caption: t`A charge circling in a uniform magnetic field: the force is always perpendicular to the velocity.` },
      choices: [
        t`It does no work, so the kinetic energy is conserved — but the force depends on $\vec v$, so it is not of the form $-\nabla U(\vec r)$`,
        t`It is conservative, with $U = -q\vec v\cdot\vec B$`,
        t`It is not conservative, so the particle's speed must change round a loop`,
        t`Its curl is zero, so it is conservative`,
      ],
      answer: 0,
      why: {
        1: t`A potential energy has to be a function of position alone; this force depends on velocity, and $q\vec v\cdot\vec B$ is not even what the force derives from.`,
        2: t`"Not conservative" does not mean "does work": $\vec F\perp\vec v$ means $\vec F\cdot d\vec r = 0$ along any actual path, so the speed stays fixed.`,
        3: t`The curl test applies to fields $\vec F(\vec r)$; this force is not one — it changes with the particle's velocity at the same point.`,
      },
      hints: [t`Compute $dW = \vec F\cdot d\vec r = \vec F\cdot\vec v\,dt$.`, t`Can a function of position alone produce a force that depends on velocity?`],
      teach: t`Energy can be conserved without a potential: the magnetic force does no work, but it is velocity-dependent, so it is not $-\nabla U$.`,
      explain: t`$\vec F\cdot\vec v = q(\vec v\times\vec B)\cdot\vec v = 0$, so the speed is constant. It is a separate category from conservative forces (in the Lagrangian of M4 it enters through a vector potential).`,
    }),
    num({
      id: 'quartic-period', difficulty: 3,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), al = r.pick([2, 4, 8]), A = r.pick([0.5, 1.0, 1.5]);
        const E = al * A ** 4, T = (4 / A) * Math.sqrt(m / (2 * al)) * K_QUARTIC;
        return {
          prompt: t`A ${m} kg particle moves in the potential $U = ${al}x^4$ J (with $x$ in m) with amplitude ${A} m. Energy conservation gives $\dot x = \pm\sqrt{(2/m)(E - U)}$, so the period is $T = 4\displaystyle\int_0^A\frac{dx}{\sqrt{(2/m)(E - U)}}$. Evaluate it.`,
          answer: T, units: 's', tol: { rel: 0.01 },
          integrand: `4/sqrt((2/${m})*(${r6(E)} - ${al}*x^4))`, limits: [0, A], vars: { x: [0, A] },
          errors: [{ value: T / 4, feedback: t`That is a quarter of the swing, $0 \to A$. The full period is four quarters.` }, { value: 2 * Math.PI * Math.sqrt(m / (12 * al * A * A)), feedback: t`That linearizes the force at $x = A$; a quartic well is not harmonic, so the integral must be done as it stands.` }],
          hints: [t`$E = U(A) = ${al}A^4$. Substitute $x = A\sin\phi$: then $A^4 - x^4 = A^4\cos^2\phi\,(1 + \sin^2\phi)$.`, t`$T = \dfrac{4}{A}\sqrt{\dfrac{m}{2\alpha}}\displaystyle\int_0^{\pi/2}\frac{d\phi}{\sqrt{1 + \sin^2\phi}}$, and the last integral is $1.311$.`],
          teach: t`In one dimension every force $F(x)$ is conservative, so energy conservation turns the period into a single integral.`,
          explain: t`$T = \dfrac{4}{${A}}\sqrt{\dfrac{${m}}{2\times${al}}}\times1.311 = ${sci(T)}$ s. Unlike a harmonic well, $T \propto 1/A$: bigger swings are faster here.`,
          visual: { type: 'mech-energy', params: { U: `${al}*x^4`, x: [-A * 1.4, A * 1.4], y: [-0.15 * E, 1.6 * E], E: r6(E), x0: -A, m, dragE: false, equilibria: false, readouts: [], bars: false, force: false, xlabel: 'x (m)', ylabel: 'energy (J)' }, caption: t`The quartic well with the energy line; the particle swings between the turning points $\pm A$. Play runs the motion.` },
        };
      },
    }),
    num({
      id: 'central', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 4, 6]), r1 = r.pick([1, 2]), r2 = r1 + r.pick([1, 2, 3]);
        const U = (s) => -k / (2 * s * s), W = U(r1) - U(r2);
        return {
          prompt: t`A central force $\vec F = -\dfrac{${k}}{r^3}\,\hat r$ N ($r$ in m) acts on a particle that spirals out from $r = ${r1}$ m to $r = ${r2}$ m along a winding path. How much work does the force do?`,
          answer: W, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: -W, feedback: t`Sign: the force pulls inward while the particle moves out, so its work is negative.` }, { value: k * (1 / r1 ** 3 - 1 / r2 ** 3), feedback: t`You used the force's values, not its integral. $U(r) = -\int F\,dr$.` }],
          hints: [t`A central force $f(r)\hat r$ is conservative, with $U(r) = -\int f(r)\,dr$: the winding does not matter.`, t`$U = -\dfrac{${k}}{2r^2}$; the work is $U(${r1}) - U(${r2})$.`],
          teach: t`Every central force $f(r)\hat r$ has zero curl, so only the starting and ending radii matter.`,
          explain: t`$U(r) = -${k}/(2r^2)$, so $W = U(${r1}) - U(${r2}) = ${sci(U(r1))} - (${sci(U(r2))}) = ${sci(W)}$ J.`,
          visual: gpic({
            x: [-r2 * 1.25, r2 * 1.25], y: [-r2 * 1.1, r2 * 1.1], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
            curves: [{ param: [`(${r1} + ${r6((r2 - r1) / (4 * Math.PI))}*t)*cos(t)`, `(${r1} + ${r6((r2 - r1) / (4 * Math.PI))}*t)*sin(t)`], t: [0, r6(4 * Math.PI)], color: 'gold', width: 2 }, { param: [`${r1}*cos(t)`, `${r1}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }, { param: [`${r2}*cos(t)`, `${r2}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }],
            points: [{ x: r1, y: 0, color: 'accent', label: 'start' }, { x: r2, y: 0, color: 'warn', label: 'end' }],
          }, t`The winding path (gold) between the circles $r = ${r1}$ m and $r = ${r2}$ m (dashed).`, 'A spiral path between two circles'),
        };
      },
    }),
    mcq({
      id: 'curl-error', difficulty: 2, kind: 'error',
      prompt: t`A student tests $\vec F = (x^2y,\ xy^2)$ by computing $\partial_xF_x - \partial_yF_y = 2xy - 2xy = 0$ and concludes "curl zero, so conservative". What is wrong?`,
      visual: { type: 'field2d', params: { P: 'x^2*y', Q: 'x*y^2', x: [-2, 2], y: [-2, 2], probe: false, readout: false, loop: { r: 0.8, c: [0.9, 0.9] } }, caption: t`The field $(x^2y, xy^2)$ with a loop in the first quadrant.` },
      choices: [
        t`The curl's $z$-component is $\partial_xF_y - \partial_yF_x = y^2 - x^2$, which is not zero: not conservative`,
        t`Nothing — and a zero result always proves the force conservative`,
        t`They should have added: $\partial_xF_x + \partial_yF_y = 4xy \ne 0$ proves it is not conservative`,
        t`The test only works for three-dimensional forces`,
      ],
      answer: 0,
      why: {
        1: t`The quantity they computed is not the curl. Each curl term pairs one component with the derivative along a *different* axis.`,
        2: t`$\partial_xF_x + \partial_yF_y$ is the **divergence**. It measures spreading, and says nothing about whether a potential exists.`,
        3: t`A plane force is a 3D force with $F_z = 0$; its curl has only a $z$-component, $\partial_xF_y - \partial_yF_x$.`,
      },
      hints: [t`Write out $(\nabla\times\vec F)_z$: which derivatives does it contain?`],
      teach: t`$(\nabla\times\vec F)_z = \partial_xF_y - \partial_yF_x$: cross-derivatives, never a component with its own variable.`,
      explain: t`$\partial_xF_y = y^2$ and $\partial_yF_x = x^2$, so the curl is $y^2 - x^2$ — zero only on the lines $y = \pm x$. The force does net work round loops such as the one drawn.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-geo', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([1500, 2000, 3500]), h1 = r.pick([300, 400, 500]);
        const r1 = 6371e3 + h1 * 1e3, r2 = 42164e3;
        const W = GM_EARTH * m * (1 / r2 - 1 / r1);
        return {
          prompt: t`A $${sci(m, 4)}$ kg satellite is raised from a ${h1} km parking orbit ($r_1 = ${sci(r1 / 1e3, 4)}$ km from Earth's centre) to geostationary orbit ($r_2 = 42\,164$ km), along a transfer path that loops partly round Earth. How much work does Earth's gravity do on it? ($GM = 3.986\times10^{14}$ m³/s².) Answer in GJ.`,
          answer: W / 1e9, units: 'GJ', tol: { rel: 0.01 },
          errors: [{ value: -W / 1e9, feedback: t`Sign: gravity pulls inward as the satellite moves outward, so it does negative work.` }, { value: (-m * 9.81 * (r2 - r1)) / 1e9, feedback: t`$mgh$ assumes constant gravity — wrong over tens of thousands of km. Use $U = -GMm/r$.` }],
          hints: [t`Gravity is central, so conservative: only the end radii matter, not the transfer path.`, t`$W = U(r_1) - U(r_2)$ with $U = -GMm/r$.`],
          teach: t`Path independence is what lets mission planners book-keep energy orbit by orbit, ignoring the route between.`,
          explain: t`$W = GMm\left(\dfrac{1}{r_2} - \dfrac{1}{r_1}\right) = ${sci(W, 4)}$ J $= ${sci(W / 1e9, 3)}$ GJ. The engines (and the orbital speed lost on the way up) must supply this.`,
          visual: gpic({
            x: [-48000, 48000], y: [-46000, 46000], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [{ param: ['6371*cos(t)', '6371*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: [`${r6(r1 / 1e3)}*cos(t)`, `${r6(r1 / 1e3)}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1, dash: true }, { param: ['42164*cos(t)', '42164*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1, dash: true }, { polar: `${r6((2 * r1 * r2) / (r1 + r2) / 1e3)}/(1 + ${r6((r2 - r1) / (r2 + r1))}*cos(theta))`, theta: [0, 3.1416], color: 'gold', width: 2 }],
            points: [{ x: r6(r1 / 1e3), y: 0, color: 'accent', r: 4, label: 'start', labelDx: 6, labelDy: 12 }, { x: -42164, y: 0, color: 'warn', r: 4, label: 'GEO', labelDx: 6, labelDy: -10 }],
          }, t`Earth (blue), the parking orbit and the geostationary orbit (dashed), and one possible transfer path (gold) — half an ellipse. To scale.`, 'Earth with a low orbit, a high orbit and a transfer ellipse between them'),
        };
      },
    }),
    mcq({
      id: 'cp-drag', difficulty: 2,
      prompt: t`A puck on a rough floor is pushed round a closed loop back to where it started. Friction does $-6$ J of work on the way. What does this say?`,
      visual: gpic({
        x: [-2.4, 2.4], y: [-1.5, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [{ param: ['1.6*cos(t)', '0.9*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 }],
        arrows: [{ from: [1.6, 0], to: [1.55, 0.25], color: 'gold' }, { from: [0, 0.9], to: [-0.5, 0.86], color: 'warn', label: 'friction', labelDx: -24, labelDy: -10 }, { from: [0, 0.9], to: [0.5, 0.86], color: 'good', label: 'motion', labelDx: 0, labelDy: -10 }],
        points: [{ x: 1.6, y: 0, color: 'accent', label: 'start = end', labelDx: 8 }],
      }, t`A closed path on a rough floor. Friction always opposes the motion, whatever the direction.`, 'A closed loop with friction opposing motion'),
      choices: ['Friction is not conservative: its work round a closed loop is not zero', 'Friction is conservative, with a potential energy that fell by 6 J', 'The work would be zero on a smaller loop', 'Friction is conservative because it depends only on the floor'],
      answer: 0,
      why: { 1: 'A potential energy returns to the same value at the same point, so it cannot account for a net change round a loop.', 2: 'Any loop gives negative work: friction always opposes the motion, so every leg costs energy.', 3: 'Kinetic friction depends on the direction of motion, not only on position: it is not a field F(r).' },
      hints: ['What must the work round a closed loop be for a conservative force?'],
      teach: 'A conservative force does zero work round every closed loop; friction fails because it always opposes the motion.',
      explain: t`For a conservative force $\oint\vec F\cdot d\vec r = U(\text{start}) - U(\text{end}) = 0$. Friction's $-6$ J shows no potential energy can describe it; the energy went into heat.`,
    }),
    expr({
      id: 'cp-potential', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 4, 6]), c = r.pick([1, 3, 5]);
        const C = c === 1 ? '' : c;
        return {
          prompt: t`Two masses on a frictionless table are joined by springs so that one of them feels $\vec F = \big(-${k}x - ${C}y,\ -${C}x - ${k}y\big)$ N (with $x, y$ in m). Check that this force is conservative and find $U(x, y)$ with $U(0, 0) = 0$.`,
          answer: `${k / 2}(x^2 + y^2) + ${c}x y`, answerTeX: t`${k / 2}(x^2 + y^2) + ${C}xy`,
          vars: { x: [-2, 2], y: [-2, 2] }, mode: 'constant', wrt: '*', lhs: 'U',
          errors: [{ answer: `-(${k / 2}(x^2 + y^2) + ${c}x y)`, feedback: t`Sign: $U$ is minus the integral of $\vec F$, and this force pulls toward the origin, so $U$ rises away from it.` }, { answer: `${k / 2}(x^2 + y^2) + ${2 * c}x y`, feedback: t`The cross term appears in both components; it belongs in $U$ only once: $\partial_x(cxy) = cy$.` }],
          hints: [t`Curl test: $\partial_xF_y = -${c}$ and $\partial_yF_x = -${c}$.`, t`$-\partial_xU = -${k}x - ${C}y$ gives $U = ${k / 2}x^2 + ${C}xy + f(y)$.`],
          teach: t`Coupled springs give a quadratic potential with a cross term — the starting point of normal modes (M8).`,
          explain: t`$\partial_xF_y = \partial_yF_x = -${c}$: curl zero. $U = ${k / 2}(x^2 + y^2) + ${C}xy$; check $-\nabla U = (-${k}x - ${C}y,\ -${C}x - ${k}y)$. ✓`,
          visual: { type: 'field2d', params: { P: `-${k}*x - ${c}*y`, Q: `-${c}*x - ${k}*y`, x: [-2, 2], y: [-2, 2], probe: false, readout: false }, caption: t`The force field: everywhere it points back toward the origin, more steeply along one diagonal.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 4: energy and conservative forces', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'OpenStax Calculus Vol. 3, §6.3 Conservative Vector Fields', url: 'https://openstax.org/books/calculus-volume-3/pages/6-3-conservative-vector-fields' },
  ],
});
