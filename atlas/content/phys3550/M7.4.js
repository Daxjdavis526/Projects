// Free precession and the tennis-racket theorem (Taylor §10.9–10.10):
// torque-free motion of a rigid body. Symmetric body (λ₁ = λ₂): ω₃ constant,
// ω⊥ turns round the symmetry axis at Ω_b = (λ₃ − λ₁)ω₃/λ₁ in the body (the
// body cone rolls on the space cone). Earth: H = (C − A)/C = 0.0032738 gives
// Euler's rigid-Earth wobble period A/(C − A) = 304.5 sidereal days ≈ 304
// days; Chandler (1891) found ≈ 433 days — the Earth is not rigid (elastic
// mantle, oceans, fluid core). Asymmetric body: polhodes on the sphere |L| =
// const, closed loops round the largest and smallest axes, the separatrix
// through the middle one — the tennis-racket (Dzhanibekov) flip. Energy
// dissipation at fixed |L|: E = L²/2λ is least about the largest axis, so a
// flexing body creeps there (Explorer 1, 1958: spun about its long, minor
// axis at 750 rpm; flexing whip antennas turned it into a flat spin).
// Explore: cm4-rigid with the energy sink and the middle moment as sliders.
// Practice: body-frame precession period, the thrown plate (wobble 2× spin),
// the phone flip, energy at fixed L, why the major axis wins, Chandler facts,
// the Dzhanibekov nut. Transfer: Explorer 1's flat-spin rate from a uniform-rod model.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { sci, distinct } from './_cm.js';
import { rigidPic, boxFaces } from './_cm4.js';

const t = String.raw;

const EARTH = (() => {
  const H = 0.0032737949, ratio = (1 - H) / H, sid = 86164.0905 / 86400;
  return { H, ratio, Tsid: ratio, Tsol: ratio * sid, obs: 433 };
})();
const EXP1 = (() => {
  const m = 13.97, R = 0.152 / 2, L = 2.03, Il = 0.5 * m * R * R, It = (m * (3 * R * R + L * L)) / 12;
  return { m, R, L, Il, It, rpm: (750 * Il) / It, Eratio: Il / It };
})();

export default lesson({
  id: 'phys3550.M7.4',
  title: 'Free precession and the tennis-racket theorem',
  minutes: 20, difficulty: 4,
  intro: t`With no torque, $\vec L$ is fixed in space and so is the energy — yet the body can still do surprising things. A **symmetric** body ($\lambda_1 = \lambda_2$) knocked off its axis does not wobble at random: $\vec\omega$ circles the symmetry axis at one steady rate, below. The Earth does this — Euler predicted it in 1765, and Chandler found it in 1891, at a period nobody expected. An **asymmetric** body spun near its middle axis flips over and back forever (the tennis-racket theorem). And a body that is not quite rigid, losing energy while $|\vec L|$ stays fixed, ends up spinning about its axis of **largest** moment, because $E = L^2/2\lambda$ is smallest there. That last fact cost the first American satellite its spin.`,
  equation: t`\Omega_b = \frac{\lambda_3 - \lambda_1}{\lambda_1}\,\omega_3 \qquad\qquad E = \frac{L^2}{2\lambda}\ \text{ for a spin about one principal axis}`,
  symbols: [
    { tex: '\\Omega_b', text: 'the rate (rad/s) at which $\\vec\\omega$ circles the symmetry axis, as seen from the **body** (negative: the other way round)' },
    { tex: '\\lambda_1 = \\lambda_2,\\ \\lambda_3', text: 'the principal moments of a symmetric body (kg·m²): the two equal ones and the one about the symmetry axis' },
    { tex: '\\omega_3', text: 'the (constant) component of $\\vec\\omega$ along the symmetry axis, rad/s' },
    { tex: 'E', text: 'the rotational kinetic energy, J' },
    { tex: 'L', text: 'the size of the angular momentum, kg·m²/s — fixed when no torque acts' },
    { tex: '\\lambda', text: 'the principal moment about the spin axis: at fixed $L$, the larger it is, the less energy the spin holds' },
  ],
  why: t`Spacecraft designers live by the **major-axis rule** that Explorer 1 taught; geodesists track the Chandler wobble to locate the pole to centimetres for GPS and VLBI; and the polhode picture is the cleanest example of motion confined by two conserved quantities at once.`,
  visual: {
    type: 'cm4-rigid',
    title: 'Flips, wobbles and an energy sink',
    lead: t`A torque-free box with principal moments 1.5, 2 and 2.6 kg·m². Right (lower, on a phone): $\vec L$ seen from the body moves along a **polhode**, where the sphere $|\vec L| = $ const meets the energy ellipsoid. The violet separatrix passes through axis 2. The whole run is drawn; press Play to watch it.`,
    tasks: [
      t`Axis 2: $\vec L$ runs along the separatrix and round the far side — each crossing is a flip. Slide the middle moment $I_2$ down to 1.5 or up to 2.6: the body becomes symmetric and the flipping stops.`,
      t`Axis 1, energy sink $\kappa = 0.08$: $\vec L$ spirals away from axis 1, crosses the separatrix and settles on axis 3, while $E/E_0$ falls to about $0.58 = \lambda_1/\lambda_3$ and $|\vec L|$ stays at 1.`,
      t`Axis 3 with the sink on: nothing happens. The largest axis is the only spin a leaky body keeps.`,
    ],
    params: { I: [1.5, 2, 2.6], axis: 1, tilt: 5, w: 2, damp: 0, T: 120, controls: ['axis', 'tilt', 'damp', 'I2'], panels: ['body', 'sphere', 'omega'] },
    caption: t`Euler's equations integrated numerically (RK4) for a uniform box. The energy sink is a teaching model: a term that removes energy while keeping $|\vec L|$ fixed. Real dissipation (flexing antennas, sloshing fuel) works through extra moving parts, but drives the spin the same way.`,
  },
  example: {
    prompt: t`The Earth is very nearly a symmetric top: its dynamical flattening is $H = (C - A)/C = ${EARTH.H}$, where $C$ is its moment about the polar axis and $A$ about an equatorial axis. If it were rigid, at what period would its rotation axis wander around its figure axis? Compare with the 433-day Chandler wobble.`,
    visual: rigidPic({ I: [1, 1, 1.3], axis: 3, tilt: 12, w: 2, T: 30, panels: ['body', 'sphere'] }, t`A symmetric body ($\lambda_3/\lambda_1 = 1.3$, hugely exaggerated: the Earth's is $1.0033$) knocked $12^\circ$ off its axis: seen from the body (right), $\vec L$ and $\vec\omega$ circle the symmetry axis steadily.`),
    steps: [
      { label: 'Symmetric Euler', text: t`With $\lambda_1 = \lambda_2$ and no torque, the third equation gives $\dot\omega_3 = 0$. The first two become $\dot\omega_1 = -\Omega_b\,\omega_2$ and $\dot\omega_2 = \Omega_b\,\omega_1$, with $\Omega_b = (\lambda_3 - \lambda_1)\omega_3/\lambda_1$.` },
      { label: 'Solve', text: t`Those are the equations of uniform circular motion: $(\omega_1, \omega_2) = \omega_\perp(\cos\Omega_bt, \sin\Omega_bt)$. Seen from the body, $\vec\omega$ sweeps a cone round the symmetry axis at the steady rate $\Omega_b$. (Seen from space, the symmetry axis cones round the fixed $\vec L$ at $\lambda_3\omega_3/(\lambda_1\cos\theta)$, where $\theta$ is the angle between them.)` },
      { label: 'Earth numbers', text: t`$\frac{\lambda_3 - \lambda_1}{\lambda_1} = \frac{C - A}{A} = \frac{H}{1 - H} = \frac{1}{${sci(EARTH.ratio, 4)}}$, and $\omega_3 = 2\pi$ per sidereal day. So the period is $\frac{2\pi}{\Omega_b} = ${sci(EARTH.ratio, 4)}$ sidereal days $= ${sci(EARTH.Tsol, 3)}$ days.` },
      { label: 'History', text: t`Euler made this prediction (the figure usually quoted is about 305 days), and astronomers searched for a 10-month variation of latitude without success. In 1891 Seth Chandler, looking at every period, found a wobble of about **433 days**, a few metres across at the pole.` },
      { label: 'Why longer', text: t`The Earth is not rigid. As the rotation axis moves, the elastic mantle and the oceans partly re-shape the equatorial bulge around it, which weakens the effective $C - A$ that drives the precession, and the fluid core does not follow the mantle fully. Together they stretch $${sci(EARTH.Tsol, 3)}$ days to about 433. The observed period is a measurement of the Earth's elasticity.` },
    ],
    answer: t`A rigid Earth would wobble with period $A/(C - A) = ${sci(EARTH.ratio, 4)}$ sidereal days $\approx ${sci(EARTH.Tsol, 3)}$ days. The observed Chandler wobble, about 433 days, is $${sci(EARTH.obs / EARTH.Tsol, 3)}$ times longer, because the Earth yields.`,
  },
  practice: [
    num({
      id: 'body-precession', difficulty: 2,
      gen(r) {
        const l1 = r.pick([300, 400, 500]), l3 = r.pick([550, 650, 800]), rpm = r.pick([6, 10, 15]);
        const w3 = (rpm * 2 * Math.PI) / 60, Ob = ((l3 - l1) * w3) / l1, T = (2 * Math.PI) / Ob;
        return {
          prompt: t`A symmetric satellite ($\lambda_1 = \lambda_2 = ${l1}$ kg·m², $\lambda_3 = ${l3}$ kg·m²) spins at $\omega_3 = ${rpm}$ rpm about its symmetry axis, with a small wobble. As seen from the satellite, how long does $\vec\omega$ take to circle the symmetry axis once?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: (2 * Math.PI) / ((l3 * w3) / l1), feedback: t`$\lambda_3\omega_3/\lambda_1$ is the space-frame rate of the axis round $\vec L$. In the body it is the difference, $(\lambda_3 - \lambda_1)\omega_3/\lambda_1$.` }, { value: (2 * Math.PI) / w3, feedback: t`That is the spin period. The wobble in the body runs at $\Omega_b = (\lambda_3 - \lambda_1)\omega_3/\lambda_1$.` }, { value: (2 * Math.PI) / (((l3 - l1) * w3) / l3), feedback: t`Divide by $\lambda_1$, the equal moment: $\Omega_b = (\lambda_3 - \lambda_1)\omega_3/\lambda_1$.` }], T),
          hints: [t`$\Omega_b = \frac{\lambda_3 - \lambda_1}{\lambda_1}\omega_3$, with $\omega_3$ in rad/s.`, t`Period $= 2\pi/\Omega_b$.`],
          teach: t`A symmetric body's $\vec\omega$ circles its axis at $(\lambda_3 - \lambda_1)\omega_3/\lambda_1$, a fraction of the spin rate.`,
          explain: t`$\Omega_b = \frac{${l3 - l1}}{${l1}}\times${sci(w3, 3)} = ${sci(Ob, 3)}$ rad/s, a period of $${sci(T, 3)}$ s. The closer $\lambda_3$ is to $\lambda_1$, the slower the body-frame wobble — the Earth's takes a year.`,
          visual: rigidPic({ I: [l1 / 100, l1 / 100, l3 / 100], axis: 3, tilt: 10, w: 1.5, T: 20, panels: ['sphere'] }, t`$\vec L$ seen from the body, circling the symmetry axis (moments to scale, time not).`),
        };
      },
    }),
    num({
      id: 'plate', difficulty: 3,
      prompt: t`A thin uniform disc (a thrown plate or frisbee) has $\lambda_3 = 2\lambda_1$. Thrown with a small wobble, its symmetry axis cones round $\vec L$ at $\dot\phi = \lambda_3\omega_3/(\lambda_1\cos\theta)$, while the disc turns relative to that coning at $\dot\psi = -\Omega_b$. For a small wobble ($\cos\theta \approx 1$), how many times faster is the wobble than the spin, $|\dot\phi/\dot\psi|$?`,
      answer: 2, tol: { rel: 0.01 },
      errors: [{ value: 0.5, feedback: t`Upside down: $\dot\phi = 2\omega_3$ while $|\dot\psi| = (\lambda_3 - \lambda_1)\omega_3/\lambda_1 = \omega_3$. The wobble is the faster.` }, { value: 1, feedback: t`$\dot\phi = \lambda_3\omega_3/\lambda_1 = 2\omega_3$, not $\omega_3$.` }],
      hints: [t`Put $\lambda_3 = 2\lambda_1$ into $\dot\phi = \lambda_3\omega_3/\lambda_1$ (with $\cos\theta = 1$).`, t`$\dot\phi = 2\omega_3$, and $|\dot\psi| = \Omega_b = (2\lambda_1 - \lambda_1)\omega_3/\lambda_1 = \omega_3$.`],
      teach: t`For a flat disc the wobble of the axis is twice as fast as the spin relative to it.`,
      explain: t`$\dot\phi \approx 2\omega_3$ and $|\dot\psi| = \omega_3$, so the plate's wobble runs twice as fast as its spin — a ratio you can see on a slow-motion video of a thrown plate. (The spin rate a camera sees, $\omega_3$, is $\dot\psi + \dot\phi\cos\theta$.)`,
      visual: rigidPic({ I: [1, 1, 2], axis: 3, tilt: 10, w: 2, T: 12, panels: ['body'] }, t`A thin disc (drawn as a flat square plate with the same moments) wobbling, $\vec L$ (gold) vertical and $\vec\omega$ (red) tracing its cone. Drag to turn.`),
    }),
    mcq({
      id: 'phone', difficulty: 2,
      prompt: t`A phone, $15 \times 7.2 \times 0.8$ cm and roughly uniform, is tossed spinning about each of its three principal axes in turn. About which one does it flip over unpredictably?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, grid: false, scale: 1.3, axisLabels: ['length', 'width', 'thickness'], parallelograms: boxFaces([2.0, 0.96, 0.11], [0, 0, 0], 'accent', 0.35) }, caption: t`The phone as a uniform box: length along $x$, width along $y$, thickness along $z$ (to scale). Drag to turn.` },
      choices: [t`The axis along its width (across the screen, in its plane): the middle moment`, t`The axis along its length: the smallest moment`, t`The axis through the screen: the largest moment`, t`All three, because a phone is not symmetric`],
      answer: 0,
      why: { 1: t`About the length the moment is smallest, $\propto 7.2^2 + 0.8^2$: a stable spin (it twirls like a drill bit).`, 2: t`About the axis through the screen the moment is largest, $\propto 15^2 + 7.2^2$: stable — it spins flat like a frisbee.`, 3: t`Only the middle axis is unstable; the other two are stable spins for a rigid body.` },
      hints: [t`For a uniform box, the moment about an axis is $\propto$ the sum of the squares of the two **other** edges. Order the three.`],
      teach: t`The tennis-racket theorem: a spin about the axis with the middle moment is unstable.`,
      explain: t`The moments go as $7.2^2 + 0.8^2 = 52$, $15^2 + 0.8^2 = 226$ and $15^2 + 7.2^2 = 277$ (cm², times $m/12$): length, width, thickness. The width axis is in the middle, and a phone tossed end over end about it almost always comes down with a half-twist about its length — the same flip as a tennis racket's.`,
    }),
    num({
      id: 'energy-ratio', difficulty: 2,
      gen(r) {
        const lmin = r.pick([20, 30, 40]), lmax = r.pick([60, 80, 100]);
        const ratio = lmin / lmax;
        return {
          prompt: t`A satellite spinning about its minor axis ($\lambda_{\min} = ${lmin}$ kg·m²) slowly loses energy through flexing parts, with no external torque, until it spins about its major axis ($\lambda_{\max} = ${lmax}$ kg·m²). What fraction of its starting rotational energy is left?`,
          answer: ratio, tol: { rel: 0.005 },
          errors: distinct([{ value: lmax / lmin, feedback: t`At fixed $L$, $E = L^2/2\lambda$: a larger moment means **less** energy, so the fraction is below 1.` }, { value: Math.sqrt(ratio), feedback: t`$E \propto 1/\lambda$ at fixed $L$, not $1/\sqrt\lambda$. (It is $\omega$ that goes as $1/\lambda$, and $E = \tfrac12\lambda\omega^2$.)` }, { value: 1, feedback: t`$L$ is conserved, but energy is not: the flexing parts turn it into heat.` }], ratio),
          hints: [t`What is conserved? $\vec L$ (no torque). Write $E$ in terms of $L$ for a spin about one principal axis.`, t`$E = L^2/2\lambda$, so $E_f/E_i = \lambda_{\min}/\lambda_{\max}$.`],
          teach: t`At fixed angular momentum, the spin about the largest principal axis has the least energy.`,
          explain: t`$E_f/E_i = \frac{L^2/2\lambda_{\max}}{L^2/2\lambda_{\min}} = \frac{${lmin}}{${lmax}} = ${sci(ratio, 3)}$. The spin rate falls by the same factor. A body that can only lose energy, at fixed $L$, can only move toward the major axis.`,
          visual: rigidPic({ I: [1, 2, 2.6], axis: 1, tilt: 5, w: 2, damp: 0.06, T: 150, panels: ['sphere'] }, t`$\vec L$ seen from the body of a box with moments 1, 2 and 2.6 kg·m², with a teaching-model energy sink: it spirals off the minor axis (1) and settles on the major axis (3).`),
        };
      },
    }),
    mcq({
      id: 'why-major', difficulty: 2,
      prompt: t`Why does internal energy dissipation make the axis of **largest** moment the only stable spin, when a perfectly rigid body is stable about the smallest one too?`,
      visual: rigidPic({ I: [1, 2, 2.6], axis: 1, tilt: 5, w: 2, damp: 0.05, T: 120, panels: ['sphere', 'omega'] }, t`A teaching-model energy sink: $\vec L$ (seen from the body) spirals from axis 1 to axis 3 while $|\vec L|$ stays fixed.`),
      choices: [t`At fixed $|\vec L|$, the energy $E = L^2/2\lambda$ is least for the largest $\lambda$; losing energy moves $\vec L$ across the polhodes toward that axis, and nowhere else is a minimum`, t`Dissipation adds a torque that points along the largest axis`, t`The smallest axis spins fastest, so it loses energy fastest and stops`, t`Friction always acts to reduce the moment of inertia`],
      answer: 0,
      why: { 1: t`Internal forces exert no net torque, so $\vec L$ stays fixed in space. What changes is the energy, and where $\vec L$ sits relative to the body.`, 2: t`The body does not stop: $L$ is conserved. It changes which axis it spins about, at a lower rate.`, 3: t`The moments are fixed by the body's shape; the energy changes because the spin axis moves within the body.` },
      hints: [t`What is conserved, and what is lost? Write the energy of a spin about one principal axis in terms of the conserved quantity.`],
      teach: t`Energy loss at constant angular momentum drives a spin to the major axis.`,
      explain: t`On the sphere $|\vec L| = $ const, each polhode is a level of energy, highest round the minor axis and lowest round the major axis. Dissipation steps $\vec L$ down through the levels, across the separatrix, to the minimum: a spin about the major axis.`,
    }),
    multi({
      id: 'chandler-facts', difficulty: 2,
      prompt: t`Which statements about the Chandler wobble are correct?`,
      visual: rigidPic({ I: [1, 1, 1.15], axis: 3, tilt: 8, w: 2, T: 60, panels: ['sphere', 'omega'] }, t`Free precession of a symmetric body (flattening exaggerated about 45-fold): seen from the body, $\vec\omega$'s equatorial part circles the axis while $\omega_3$ stays constant.`),
      choices: [t`It is free (torque-free) precession: the rotation axis circles the figure axis with no outside cause needed`, t`A rigid Earth would do it in about 304 days; the observed period is about 433 days`, t`The longer period comes from the Earth not being rigid`, t`It is caused by the Moon's torque on the equatorial bulge`, t`It moves the pole by hundreds of kilometres`],
      answer: [0, 1, 2],
      why: { 3: t`The Moon's and Sun's torques cause the 26 000-year precession of the equinoxes and nutation — forced motions in space. The Chandler wobble is the free motion of the axis within the Earth.`, 4: t`It is a few metres at the pole: tiny, but measured routinely by VLBI and satellite geodesy.` },
      hints: [t`Free means torque-free. What did the worked example compute, and what made the observed period longer?`],
      teach: t`The Chandler wobble is the Earth's free precession, lengthened from about 304 to about 433 days by its elasticity.`,
      explain: t`Euler's rigid-body result gives about 304 days; the Earth's yielding mantle, oceans and core stretch it to about 433. Something must keep re-exciting it (it would otherwise damp out in decades); ocean and atmospheric pressure changes are the leading explanation.`,
    }),
    mcq({
      id: 'dzhanibekov', difficulty: 2,
      prompt: t`In 1985, on the Salyut 7 space station, Vladimir Dzhanibekov watched a wing nut spin off a bolt and fly across the cabin, flipping over every few seconds while it kept spinning. What explains it?`,
      visual: rigidPic({ I: [1, 2, 2.6], axis: 2, tilt: 2, w: 2, T: 40, panels: ['body', 'omega'] }, t`A torque-free box spun near its middle axis: it flips over again and again (left), and $\omega_2$ reverses each time (below).`),
      choices: [t`It was spinning about its intermediate principal axis; with no torque, $\vec L$ stays fixed while the nut repeatedly turns over relative to it`, t`Air currents in the cabin pushed it over each time`, t`Weightlessness makes rigid bodies unstable`, t`Its angular momentum reversed each half cycle`],
      answer: 0,
      why: { 1: t`The flips are regular and happen in vacuum simulations too: Euler's equations alone produce them.`, 2: t`Spins about the largest and smallest axes are stable in orbit as on Earth; gravity plays no part in the free motion.`, 3: t`$\vec L$ is constant without torque. The nut turns over **relative to** $\vec L$; the component $\omega_2$ along the nut's own axis reverses.` },
      hints: [t`Which principal axis was it spinning near, and what do Euler's equations predict for a spin there?`],
      teach: t`The tennis-racket flip is torque-free: the body turns over while its angular momentum stays fixed.`,
      explain: t`A spin near the middle axis follows the separatrix: long quiet spells near $+\hat e_2$ and $-\hat e_2$, joined by quick flips. The effect was well known from Euler's equations (it is a homework problem in most textbooks), but Dzhanibekov's footage made it famous.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-explorer', difficulty: 3, transfer: true,
      prompt: t`Explorer 1 (1958) — a slender cylinder about 2.03 m long and 15.2 cm across, 13.97 kg with its spent rocket stage — was spun at 750 rpm about its long axis. Flexing of its four whip antennas dissipated energy, and it ended in a flat spin about a transverse axis. Model it as a uniform solid cylinder, so $\lambda_{\text{long}} = \tfrac12mR^2$ and $\lambda_{\text{trans}} = \tfrac{1}{12}m(3R^2 + \ell^2)$. With $\vec L$ conserved, at what rate (rpm) does the model end up spinning?`,
      answer: EXP1.rpm, units: 'rpm', tol: { rel: 0.01 },
      errors: [{ value: 750, feedback: t`Angular momentum is conserved, not the spin rate: $\lambda\omega$ is fixed, so the rate falls by $\lambda_{\text{long}}/\lambda_{\text{trans}}$.` }, { value: 750 * Math.sqrt(EXP1.Eratio), feedback: t`It is $L = \lambda\omega$ that is conserved, so $\omega_f = \omega_i\lambda_{\text{long}}/\lambda_{\text{trans}}$, with no square root.` }, { value: 750 * EXP1.It / EXP1.Il, feedback: t`The transverse moment is the larger one, so the final rate is **lower**.` }],
      hints: [t`$\lambda_{\text{long}} = \tfrac12(13.97)(0.076)^2$ and $\lambda_{\text{trans}} = \tfrac{1}{12}(13.97)(3\times0.076^2 + 2.03^2)$.`, t`$\omega_f = \omega_i\,\lambda_{\text{long}}/\lambda_{\text{trans}}$.`],
      teach: t`At fixed angular momentum a spin migrating to a larger moment slows down in proportion.`,
      explain: t`$\lambda_{\text{long}} = ${sci(EXP1.Il, 3)}$ and $\lambda_{\text{trans}} = ${sci(EXP1.It, 3)}$ kg·m², a ratio of $${sci(EXP1.Eratio, 3)}$, so the model ends at $${sci(EXP1.rpm, 3)}$ rpm tumbling end over end, with under 1% of its starting rotational energy. The real satellite's mass was not uniform, so treat this as an estimate. Its lesson — spin a non-rigid spacecraft only about its **major** axis, or carry a nutation damper — has been a design rule ever since.`,
      visual: rigidPic({ I: [EXP1.Il * 10, EXP1.It * 10, EXP1.It * 10], axis: 1, tilt: 0.02, w: 2, T: 10, panels: ['body'], dims: [2.03, 0.152, 0.152], vectors: ['L'] }, t`The Explorer 1 model as a long uniform rod, spinning about its long (minor) axis, $\vec L$ up. Drawn to scale. Drag to turn.`),
    }),
    num({
      id: 'cp-wobble', difficulty: 3,
      gen(r) {
        const H = r.pick([0.002, 0.005, 0.01]), P = r.pick([6, 10, 24]);
        const ratio = (1 - H) / H, T = (ratio * P) / 24;
        return {
          prompt: t`A rigid, nearly symmetric asteroid has dynamical flattening $H = (C - A)/C = ${H}$ and spins once every ${P} hours about its axis of largest moment. If knocked, with what period (in days) would its spin axis wander around its figure axis?`,
          answer: T, units: 'd', tol: { rel: 0.01 },
          errors: distinct([{ value: (P / 24) / H, feedback: t`Close: $\Omega_b/\omega_3 = (C - A)/A = H/(1 - H)$, not $H$. For small $H$ the two differ little, but here they differ by more than the tolerance.` }, { value: ratio * P, feedback: t`That is in hours. Divide by 24 for days.` }], T),
          hints: [t`From $\Omega_b = (C - A)\omega_3/A$, the period is $\frac{A}{C - A}$ spin periods.`, t`$\frac{A}{C - A} = \frac{1 - H}{H}$; multiply by the spin period and convert hours to days.`],
          teach: t`A symmetric body's free-precession period is $A/(C - A)$ spin periods.`,
          explain: t`$A/(C - A) = ${sci(ratio, 4)}$ spins of ${P} h: $${sci(T, 3)}$ days. A real, slightly elastic body would wobble more slowly, as the Earth does, and an asteroid's wobble damps out by internal friction — most asteroids end up spinning about their major axis.`,
          visual: rigidPic({ I: [1, 1, 1.2], axis: 3, tilt: 10, w: 2, T: 30, panels: ['body', 'sphere'] }, t`Free precession of a symmetric body (flattening exaggerated): $\vec\omega$ circles the figure axis as seen from the body (right).`),
        };
      },
    }),
    mcq({
      id: 'cp-design', difficulty: 2,
      prompt: t`A small science satellite will be spin-stabilized. It is a tall cylinder with long flexible wire antennas, and the engineers can choose to spin it about its long axis or about a transverse axis. What should they do?`,
      visual: rigidPic({ I: [0.6, 2.4, 2.4], axis: 1, tilt: 4, w: 2, damp: 0.08, T: 150, panels: ['sphere', 'omega'] }, t`A prolate body spun about its long (minor) axis 1 with a teaching-model energy sink: $\vec L$ (seen from the body) leaves axis 1 and ends on the transverse axes.`),
      choices: [t`Spin about the axis of largest moment (a transverse axis here), or reshape it so the spin axis has the largest moment, or add a nutation damper and active control`, t`Spin about the long axis: it is a stable axis of a rigid body`, t`Spin about the long axis faster, so that the gyroscopic stiffness overcomes the flexing`, t`Spin about the intermediate axis, between the two`],
      answer: 0,
      why: { 1: t`Rigid-body stability is not enough: with flexible parts dissipating energy, the minor axis is unstable — Explorer 1's fate.`, 2: t`Faster spin only stores more energy to dissipate; the drift to the major axis still happens, and in proportion sooner.`, 3: t`The middle axis is unstable even for a rigid body.` },
      hints: [t`The antennas flex and dissipate energy; $\vec L$ is conserved. Which spin can survive energy loss at fixed $L$?`],
      teach: t`The major-axis rule: a spacecraft that dissipates energy can only spin stably about its axis of largest moment.`,
      explain: t`At fixed $L$, energy loss drives the spin to the largest moment. Designers therefore make the spin axis the major axis (squat, disc-like spinners), or, for a tall spinner, add a nutation damper and active control (dual-spin designs keep a de-spun platform on a major-axis rotor).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §10.9–10.10: torque-free motion, the Earth’s wobble', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'R. N. Bracewell and O. K. Garriott, Rotation of artificial Earth satellites, Nature 182, 760 (1958)', url: 'https://doi.org/10.1038/182760a0' },
    { label: 'IERS Conventions (2010), Technical Note 36: dynamical flattening H = 0.0032737949', url: 'https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html' },
    { label: 'S. C. Chandler, On the variation of latitude, Astronomical Journal 11, 59 (1891)', url: 'https://doi.org/10.1086/101603' },
  ],
});
