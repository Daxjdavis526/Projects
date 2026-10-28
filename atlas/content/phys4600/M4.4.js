// Liénard–Wiechert potentials (Griffiths §10.3.1–10.3.2). A point charge's
// retarded potentials: V = (1/4πε₀) qc/(Rc − R·v), A = (v/c²)V, everything at
// the retarded time; the factor 1/(1 − R̂·v/c) is the source "seen for
// longer" when it comes toward you. Worked example: a charge at 0.6c passing
// beside a field point — t_r = −γd/c, retarded position −γβd, V = γq/4πε₀d.
// The fields split into a velocity field (∝ 1/R², which for uniform motion
// points from the PRESENT position, flattened into Heaviside's pancake:
// E⊥/E∥ = γ³) and an acceleration field (∝ a/R, transverse): the kink of a
// charge that stops or starts, the start of radiation (M5.3, Larmor). Uses
// the new em4b-kink simulation (exact Liénard–Wiechert field lines, light
// cone). Transfers: the field pulse of an LHC proton bunch at a beam pickup
// (Δt ≈ b/γc), Laplace's speed-of-gravity objection and why aberration
// cancels for uniform motion (Carlip 2000).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { C, sf } from './_em4b.js';

const t = String.raw;
const gam = (b) => 1 / Math.sqrt(1 - b * b);
const MP = 938.27208816;   // proton rest energy, MeV (CODATA 2022)
const LY = 9.4607304725808e15;

// the worked example: β = 0.6, field point at distance d beside the path at the moment the charge passes
const EX = { b: 0.6 };
EX.g = gam(EX.b);
EX.xr = -EX.g * EX.b;          // retarded position, in units of d
EX.R = EX.g;                   // distance from it, in units of d
EX.fac = 1 / (1 - EX.b * EX.b);

/** An em4b-kink picture without controls. */
const kinkPic = (params, caption) => ({ type: 'em4b-kink', params: { controls: false, readout: false, ...params }, caption });

export default lesson({
  id: 'phys4600.M4.4',
  title: 'Liénard–Wiechert potentials',
  minutes: 18, difficulty: 4,
  equation: t`\begin{gathered}V(\vec r, t) = \frac{1}{4\pi\varepsilon_0}\,\frac{qc}{Rc - \vec R\cdot\vec v}, \quad \vec A(\vec r, t) = \frac{\vec v}{c^2}\,V(\vec r, t), \\ \vec R = \vec r - \vec w(t_r),\quad \vec v = \dot{\vec w}(t_r)\end{gathered}`,
  intro: t`Apply the retarded potentials of [M4.3](#/lesson/phys4600.M4.3) to a single point charge moving along a path $\vec w(t)$. There is exactly one retarded time $t_r$ — one moment in the charge’s history whose news is arriving now — and you might expect simply the Coulomb potential from the retarded position, $q/4\pi\varepsilon_0R$. There is an extra factor, $1/(1 - \hat R\cdot\vec v/c)$. It comes from integrating over the charge’s small but finite size: a source coming **toward** you is seen for slightly longer, as its far side catches up with the light from its near side, so it counts for more. From these potentials come the fields. They have two parts: a **velocity field**, which falls as $1/R^2$ and, for uniform motion, points from where the charge is **now** (not where it was); and an **acceleration field**, which falls only as $1/R$ and is the start of radiation.`,
  symbols: [
    { tex: 'q', text: 'the charge, in coulombs' },
    { tex: '\\vec w(t)', text: 'the charge’s position at time t, in m' },
    { tex: 't_r', text: t`the retarded time, the root of $c(t - t_r) = |\vec r - \vec w(t_r)|$` },
    { tex: '\\vec R', text: t`the vector from the charge’s **retarded** position to the field point, length $R$ (Griffiths writes it as a script r)` },
    { tex: '\\vec v', text: t`the charge’s velocity at the retarded time, in m/s` },
    { tex: 'c', text: 'the speed of light' },
  ],
  why: t`These potentials describe every field made by a moving charge: synchrotron light, the pancake field of a relativistic beam, bremsstrahlung in an X-ray tube — and the kinked field lines that are the clearest picture of what radiation is.`,
  visual: {
    type: 'em4b-kink',
    title: 'Field lines of a moving, stopping and starting charge',
    lead: t`Exact field lines of a point charge at one instant ($c = 1$). Coasting at constant speed, its lines are straight and point from where it is **now**, crowded toward the plane across its motion. When it stops or starts, the news spreads outward at $c$ between the two gold circles: inside, the field already knows; outside, it does not yet; in the shell the lines run sideways. The lower panel is the spacetime diagram: the worldline and the past light cone of the probe P. Drag P.`,
    tasks: [
      t`Uniform motion at high speed: the lines point from the present position, not from the violet retarded position — and they bunch into a pancake.`,
      t`Choose “stops” and press Play: a kinked shell sweeps outward at $c$, and the sideways part of the field in it falls off more slowly than the radial part — that is radiation.`,
      t`Shorten the stop time $\tau$: the shell gets thinner and the kink sharper — a bigger acceleration makes a stronger radiation field.`,
    ],
    params: { mode: 'stop', modes: ['uniform', 'stop', 'start'], beta: 0.6, tau: 0.5, time: 3, controls: ['mode', 'beta', 'tau', 'time'] },
    caption: t`Exact Liénard–Wiechert field lines ($c = 1$, lengths in arbitrary units) in the plane containing the charge’s path; the pattern is symmetric about that line. The stop or start is a uniform acceleration lasting $\tau$. Line density in a plane slice is only a guide to field strength.`,
  },
  example: {
    prompt: t`A charge $q$ moves along the $x$-axis at $v = ${EX.b}c$, passing the origin at $t = 0$. At that instant, what are the Liénard–Wiechert potentials at a point a distance $d$ from the origin along $y$, and which way does $\vec E$ point there?`,
    visual: kinkPic({ mode: 'uniform', beta: EX.b, time: 0, probe: [0, 2], panels: ['field', 'cone'] }, t`The charge (red) passing the origin at ${EX.b}c; the probe P beside it, the retarded position in violet. $c = 1$; lengths in arbitrary units.`),
    steps: [
      { label: 'Retarded time', text: t`Solve $c(0 - t_r) = \sqrt{(vt_r)^2 + d^2}$: $t_r = -\gamma d/c$ with $\gamma = 1/\sqrt{1 - v^2/c^2} = ${nice(EX.g)}$. The retarded position is $x = vt_r = -\gamma\beta d = ${nice(EX.xr)}d$.` },
      { label: 'The geometry', text: t`$\vec R$ runs from $(${nice(EX.xr)}d, 0)$ to $(0, d)$: $R = \gamma d = ${nice(EX.R)}d$, and $\hat R\cdot\vec v/c = (\gamma\beta d/\gamma d)\beta = \beta^2 = ${nice(EX.b ** 2)}$.` },
      { label: 'The factor', text: t`$1/(1 - \hat R\cdot\vec v/c) = 1/(1 - ${nice(EX.b ** 2)}) = ${nice(EX.fac)}$.` },
      { label: 'Potentials', text: t`$V = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q}{R(1 - \hat R\cdot\vec v/c)} = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q}{${nice(EX.R)}d \times ${nice(1 - EX.b ** 2)}} = ${nice(EX.g)}\,\dfrac{q}{4\pi\varepsilon_0d} = \gamma\dfrac{q}{4\pi\varepsilon_0d}$, and $\vec A = (\vec v/c^2)V$, along $x$.` },
      { label: 'The field', text: t`Differentiating gives Heaviside’s field: $\vec E$ points straight along $y$ — **from the present position** (the origin), not from the retarded one — with size $\gamma\,q/4\pi\varepsilon_0d^2$, ${nice(EX.g)} times the Coulomb value.` },
      { label: 'Sense check', text: t`$V = \gamma q/4\pi\varepsilon_0d$ is exactly what a Lorentz transformation of the charge’s rest-frame Coulomb potential gives ([M6.1](#/lesson/phys4600.M6.1)). Two routes, one answer.` },
    ],
    answer: t`$V = \gamma\dfrac{q}{4\pi\varepsilon_0d} = ${nice(EX.g)}\dfrac{q}{4\pi\varepsilon_0d}$, $\vec A = \dfrac{\vec v}{c^2}V$; $\vec E$ points from the charge’s present position, with size $\gamma q/4\pi\varepsilon_0d^2$.`,
  },
  practice: [
    num({
      id: 'lw-factor', difficulty: 2,
      gen(r) {
        const b = r.pick([0.3, 0.5, 0.8, 0.9]), [dir, cth] = r.pick([['straight toward the field point', 1], ['straight away from it', -1], ['at 60° to the line joining it to the field point (heading toward that side)', 0.5]]);
        const f = 1 / (1 - b * cth);
        return {
          prompt: t`At the retarded time a charge was moving at $${b}c$ ${dir}. By what factor is its Liénard–Wiechert potential larger than the Coulomb potential $q/4\pi\varepsilon_0R$ from its retarded position?`,
          visual: kinkPic({ mode: 'uniform', beta: b, time: 0, probe: [cth > 0.9 ? 4 : cth < -0.9 ? -4 : 2, cth > 0.9 || cth < -0.9 ? 0.3 : 2.5], panels: ['field'] }, t`A charge moving at ${b}c and a field point P. $c = 1$; arbitrary length units.`),
          answer: f, tol: { rel: 0.005 },
          errors: [{ value: 1 / (1 + b * cth), feedback: t`$\hat R$ points from the charge toward the field point; moving toward the field point makes $\hat R\cdot\vec v$ **positive** and the factor larger than 1.` }, { value: gam(b), feedback: t`That is $\gamma$. The Liénard–Wiechert factor is $1/(1 - \hat R\cdot\vec v/c)$, set by the direction of motion relative to $\hat R$.` }].filter((e) => Math.abs(e.value - f) > 0.01 * f),
          hints: [t`$\dfrac{V}{q/4\pi\varepsilon_0R} = \dfrac{1}{1 - \hat R\cdot\vec v/c}$.`, t`$\hat R\cdot\vec v/c = \beta\cos\theta$ with $\theta$ the angle between the velocity and $\hat R$.`],
          teach: 'The Liénard–Wiechert factor 1/(1 − R̂·v/c) boosts a source coming toward you and weakens one going away.',
          explain: t`$\hat R\cdot\vec v/c = ${b} \times ${cth}$, so the factor is $1/(1 - ${nice(b * cth)}) = ${nice(sf(f, 4))}$.`,
        };
      },
    }),
    num({
      id: 'retarded-x', difficulty: 3,
      gen(r) {
        const b = r.pick([0.28, 0.6, 0.8, 0.96]);
        const xr = -gam(b) * b;
        return {
          prompt: t`A charge moves along $x$ at $${b}c$ and passes the origin at $t = 0$. A detector sits at $(0, d)$. Where was the charge — at what $x$, in units of $d$ — when it sent the field the detector registers at $t = 0$?`,
          visual: kinkPic({ mode: 'uniform', beta: b, time: 0, probe: [0, 2.5], panels: ['cone'], hide: ['retarded'] }, t`Spacetime diagram ($c = 1$): the charge’s worldline (red) and the past light cone of the detector at $t = 0$ (gold, cut through the line of motion).`),
          answer: xr, tol: { rel: 0.005 },
          errors: [{ value: -b, feedback: t`The light from $x = -\beta d$ would arrive at $t = 0$ only if it had travelled just $d$; it must travel $\sqrt{x^2 + d^2}$. Solve $c|t_r| = \sqrt{(vt_r)^2 + d^2}$.` }, { value: -xr, feedback: 'The retarded position is behind the charge (it was there earlier), at negative x.' }],
          hints: [t`Solve $c(0 - t_r) = \sqrt{(vt_r)^2 + d^2}$ for $t_r$.`, t`$t_r = -\gamma d/c$, so $x_r = vt_r = -\gamma\beta d$.`],
          teach: 'For a charge passing beside you, the retarded position lies γβd behind its present position.',
          explain: t`$\gamma = ${nice(sf(gam(b), 4))}$, $x_r = -\gamma\beta d \approx ${nice(sf(xr, 3))}d$. At high speed the news comes from a long way back — yet the field points from the present position.`,
        };
      },
    }),
    mcq({
      id: 'present', difficulty: 3,
      prompt: t`A charge has been coasting at constant velocity forever. At a field point, which way does its electric field point?`,
      visual: kinkPic({ mode: 'uniform', beta: 0.7, time: 0, probe: [-1.5, 2.5], panels: ['cone'] }, t`Spacetime diagram ($c = 1$): the worldline, the probe’s past light cone and the retarded event (violet).`),
      choices: [
        t`Away from where the charge is now — as if the field knew to extrapolate the motion from the retarded event`,
        t`Away from the retarded position, where the charge was when it sent the field`,
        t`Along the charge’s velocity`,
        t`Away from a point halfway between the retarded and present positions`,
      ],
      answer: 0,
      why: {
        1: t`The potentials are set at the retarded position, but the field also contains the velocity, and the combination points from the **present** position — Heaviside’s result.`,
        2: t`The field of a coasting charge is radial (about the present position), not along the velocity.`,
        3: 'There is no such halfway point: the result is exact, and it is the present position.',
      },
      hints: [t`For uniform motion, the charge’s rest frame has a pure Coulomb field. Lorentz-transform it: where does the radial pattern centre in the lab, at a given lab time?`, t`In the Liénard–Wiechert velocity field, $\vec u = c\hat R - \vec v$; $R\vec u/c$ is the vector from where the charge would be now.`],
      teach: 'A uniformly moving charge’s field points from its present position — information about the velocity travels with the field.',
      explain: t`The velocity field is along $\vec u = c\hat R - \vec v$, and $(R/c)\vec u = \vec R - \vec v R/c$ runs from the point the charge has reached by now, moving at $\vec v$ for the light-travel time. If the charge has really kept coasting, that is its present position. If it has changed course, the field still points at where it would have been — until the news arrives.`,
    }),
    num({
      id: 'pancake', difficulty: 3,
      gen(r) {
        const b = r.pick([0.6, 0.8, 0.9, 0.99]);
        const g = gam(b);
        return {
          prompt: t`A charge coasts at $${b}c$. At the same distance from its present position, how many times stronger is its electric field straight out to the side than straight ahead? Use Heaviside’s field, $E \propto \dfrac{1 - \beta^2}{(1 - \beta^2\sin^2\theta)^{3/2}}$, with $\theta$ measured from the velocity.`,
          visual: kinkPic({ mode: 'uniform', beta: b, time: 0, probe: null, panels: ['field'] }, t`Field lines of a charge coasting at ${b}c: bunched toward the plane across the motion. $c = 1$.`),
          answer: g ** 3, tol: { rel: 0.01 },
          errors: [{ value: g, feedback: t`Side-on the field is $\gamma$ times Coulomb, but ahead it is $1/\gamma^2$ times Coulomb: the ratio is $\gamma^3$.` }, { value: g * g, feedback: t`Check the exponent: side-on $(1 - \beta^2)/(1 - \beta^2)^{3/2} = \gamma$; ahead $(1 - \beta^2) = 1/\gamma^2$.` }],
          hints: [t`Side-on, $\theta = 90^\circ$: $E \propto (1 - \beta^2)^{-1/2} = \gamma$.`, t`Ahead, $\theta = 0$: $E \propto 1 - \beta^2 = 1/\gamma^2$.`],
          teach: 'A fast charge’s field is a pancake: γ times Coulomb at the side, 1/γ² ahead — a ratio of γ³.',
          explain: t`$\gamma = ${nice(sf(g, 4))}$, so the ratio is $\gamma^3 \approx ${nice(sf(g ** 3, 3))}$. At high speed nearly all the field is squeezed into a thin disk across the motion.`,
        };
      },
    }),
    mcq({
      id: 'uniform-radiate', difficulty: 2,
      prompt: t`Does a charge coasting at constant velocity radiate?`,
      visual: kinkPic({ mode: 'uniform', beta: 0.6, time: 0, probe: null, panels: ['field'] }, t`A charge coasting at 0.6c: straight field lines, no kinks. $c = 1$.`),
      choices: [
        t`No: with no acceleration only the velocity field remains, which falls as $1/R^2$ and carries no energy off to infinity`,
        t`Yes: any moving charge radiates, at a rate growing with its speed`,
        t`Yes, but only above half the speed of light`,
        t`Only if it is moving toward the observer`,
      ],
      answer: 0,
      why: {
        1: t`Radiation needs the acceleration field. In the charge’s rest frame it is a static Coulomb charge; a change of frame cannot create radiation.`,
        2: 'Speed alone never makes radiation, however close to c.',
        3: 'Whether a charge radiates does not depend on where the observer is.',
      },
      hints: ['What does the charge look like in its own rest frame?', t`Radiated power crosses a large sphere with $S \sim E^2$; a $1/R^2$ field gives $S \sim 1/R^4$, times area $R^2$…`],
      teach: 'Only acceleration radiates: the 1/R acceleration field is the radiation; the velocity field just rides along.',
      explain: t`Power through a sphere of radius $R$ goes as $E^2R^2$. The velocity field gives $1/R^2 \to 0$; only the $1/R$ acceleration field gives a finite power at infinity. A coasting charge has none — the Larmor formula of [M5.3](#/lesson/phys4600.M5.3) depends on $a$, not $v$.`,
    }),
    num({
      id: 'rad-vs-coulomb', difficulty: 3,
      gen(r) {
        const [what, a] = r.pick([['a charged dust grain on a spacecraft accelerating at 1 g', 9.81], ['an electron in a radio antenna, accelerating at about 10¹⁶ m/s²', 1e16], ['an electron in a 10 MV/m accelerator cavity', (1.602176634e-19 * 1e7) / 9.1093837139e-31]]);
        const R = (C * C) / a;
        return {
          prompt: t`For a slow charge, the acceleration field at right angles to the acceleration is $\dfrac{q}{4\pi\varepsilon_0}\dfrac{a}{c^2R}$ and the velocity (Coulomb) field is $\dfrac{q}{4\pi\varepsilon_0}\dfrac{1}{R^2}$. Consider ${what}. Beyond what distance does the radiation field win? Give it in metres.`,
          visual: kinkPic({ mode: 'start', beta: 0.3, tau: 0.8, time: 3, probe: null, panels: ['field'] }, t`A charge kicked into motion: in the shell, the sideways (radiation) field. $c = 1$.`),
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: C / a, feedback: t`Set $a/c^2R = 1/R^2$: $R = c^2/a$, not $c/a$.` }],
          hints: [t`Set the two fields equal: $\dfrac{a}{c^2R} = \dfrac{1}{R^2}$.`, t`$R = c^2/a$.`],
          teach: 'The radiation field (∝ 1/R) beats the Coulomb field (∝ 1/R²) beyond R = c²/a.',
          explain: t`$R = c^2/a \approx ${tex(R, 3)}$ m${R > 1e14 ? t` — about $${nice(sf(R / LY, 2))}$ light-years` : ''}. Close to a charge its Coulomb field dominates; radiation is what is left far away.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pickup', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([0.45, 6.8]) * 1e6, b = r.pick([2, 3, 4]);   // proton energy in MeV, pickup distance in cm
        const g = E / MP, dt = (b * 1e-2) / (g * C);
        return {
          prompt: t`An LHC beam-position pickup sits $${b}$ cm from a proton with total energy ${E / 1e6} TeV (proton rest energy ${nice(MP)} MeV). Heaviside’s field sweeps past it as a pancake: the pickup feels a pulse lasting roughly $\Delta t \approx b/\gamma c$. Estimate $\Delta t$ in femtoseconds.`,
          visual: kinkPic({ mode: 'uniform', beta: 0.95, time: 0, probe: [0, 2], panels: ['field'] }, t`A charge at $0.95c$ — far slower than an LHC proton, whose pancake is thousands of times thinner. $c = 1$.`),
          answer: dt * 1e15, units: 'fs', tol: { rel: 0.01 },
          errors: [{ value: (b * 1e-2) / C * 1e15, feedback: t`Without $\gamma$ the pulse would last $b/c$; the pancake is thinner by the factor $\gamma = E/mc^2$.` }],
          hints: [t`$\gamma = E/mc^2$ with both energies in the same units.`, t`$\Delta t \approx \dfrac{b}{\gamma c}$.`],
          teach: 'A relativistic charge’s field is compressed by γ along the motion, so it passes a nearby point in a time ~ b/γc.',
          explain: t`$\gamma = ${nice(sf(g, 4))}$, so $\Delta t \approx ${nice(sf(dt * 1e15, 3))}$ fs — a single proton’s field passes almost instantaneously. (Real pickups see whole bunches, centimetres long, so their signals last nanoseconds; the estimate is the single-charge limit.)`,
        };
      },
    }),
    mcq({
      id: 'cp-laplace', difficulty: 3, transfer: true,
      prompt: t`In 1805 Laplace argued that if gravity travelled at a finite speed, the Sun’s pull on the Earth would point to where the Sun **was**, and the resulting sideways tug would make the Earth’s orbit grow quickly — so gravity must be thousands of times faster than light. What does electromagnetism suggest is wrong with the argument?`,
      visual: kinkPic({ mode: 'uniform', beta: 0.5, time: 0, probe: [-2, 2.5], panels: ['field'] }, t`A coasting charge: the field at P points from the present position, though P is receiving news from the retarded one (violet). $c = 1$.`),
      choices: [
        t`For a uniformly moving source the field depends on its velocity too, and points from its present (extrapolated) position: the aberration Laplace feared cancels. General relativity shows the same, to even higher order`,
        'Nothing: gravity really does travel much faster than light',
        'The Earth’s orbit is in fact growing at the rate Laplace predicted',
        'Gravity is instantaneous, so the question does not arise',
      ],
      answer: 0,
      why: {
        1: t`GW170817 showed gravitational waves arrive with light to about one part in $10^{15}$.`,
        2: 'The orbit is stable to high precision over billions of years; no such growth is seen.',
        3: 'General relativity, confirmed by gravitational-wave timing, has gravity travelling at c.',
      },
      hints: ['From where does a coasting charge’s field point?', 'Laplace assumed a field that knows only the retarded position, not the velocity.'],
      teach: 'Velocity-dependent fields make the pull of a uniformly moving source point at its present position — retardation without aberration.',
      explain: t`A coasting charge’s field points from its present position although the news left from the retarded one: the velocity dependence extrapolates. In general relativity the cancellation goes further still, so the Sun’s pull points almost exactly at its present position (Carlip 2000). Laplace’s objection was to a theory without velocity-dependent fields.`,
    }),
    mcq({
      id: 'cp-kink', difficulty: 3,
      prompt: t`A charge is stopped abruptly. In the expanding shell that carries the news, how does the sideways (transverse) part of its field depend on the distance $R$ from the charge?`,
      visual: kinkPic({ mode: 'stop', beta: 0.6, tau: 0.3, time: 3.5, probe: null, panels: ['field'] }, t`Field lines of a charge that has stopped: the kinked shell carries the news outward at $c$. $c = 1$.`),
      choices: [
        t`As $1/R$: the shell’s width $c\tau$ stays fixed while the sideways jump grows with $R$, so the transverse field falls more slowly than Coulomb’s $1/R^2$`,
        t`As $1/R^2$, like every electric field of a point charge`,
        t`As $1/R^3$, like a dipole field`,
        'It does not depend on R: the kink is the same size everywhere',
      ],
      answer: 0,
      why: {
        1: t`The radial part does go as $1/R^2$. The transverse part, set by geometry — a line displaced sideways by $vR/c$ across a shell of fixed width — goes as $1/R$.`,
        2: 'A dipole field is the far field of two opposite charges, not this.',
        3: t`The kink’s angle grows with $R$, but the field strength it carries falls as $1/R$.`,
      },
      hints: [t`A field line must join the inner part (from the stopped charge) to the outer part (from where it would be). At distance $R$, how far apart sideways are those two parts?`, t`The sideways offset grows as $vR/c$; it is crossed in a shell of fixed thickness $c\tau$.`],
      teach: 'The kink is radiation: its transverse field falls as 1/R, so its energy flux falls as 1/R² and survives to infinity.',
      explain: t`Purcell’s argument: $E_\perp/E_r \approx (v\sin\theta/c)(R/c\tau) = aR\sin\theta/c^2$, so $E_\perp \approx \dfrac{q}{4\pi\varepsilon_0}\dfrac{a\sin\theta}{c^2R}$ — exactly the acceleration field. Squared and multiplied by the shell’s area $\propto R^2$, it gives an energy independent of $R$: radiation, and the Larmor formula of [M5.3](#/lesson/phys4600.M5.3).`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §10.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Purcell & Morin, Electricity and Magnetism (3rd ed.), §5.7 and Appendix H: the field of a charge that starts or stops', url: 'https://doi.org/10.1017/CBO9781139012973' },
    { label: 'Carlip, Aberration and the speed of gravity, Phys. Lett. A 267, 81 (2000)', url: 'https://doi.org/10.1016/S0375-9601(00)00101-8' },
  ],
});
