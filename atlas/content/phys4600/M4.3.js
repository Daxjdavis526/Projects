// Retarded potentials (Griffiths §10.2.1–10.2.2). In the Lorenz gauge each
// potential obeys a wave equation with a source, □²V = −ρ/ε₀ and
// □²A = −μ₀J, and the solution is the static one with the source read at
// the retarded time t_r = t − 𝓻/c: everything on the field point's past light
// cone, nothing else (the Green's-function derivation is ST-B B9.3, linked,
// not repeated). Retarding the *potentials* works; retarding Coulomb's and
// the Biot–Savart law does not — Jefimenko's equations carry extra terms in
// ρ̇ and J̇. Worked example: an infinite wire whose current is switched on at
// t = 0 (Griffiths Ex. 10.2): nothing until the light front s = ct arrives;
// then A = (μ₀I₀/2π) ln[(ct + √(c²t² − s²))/s], E = −∂A/∂t falling as
// 1/√(c²t² − s²), B overshooting and settling to μ₀I₀/2πs. A drag-the-point
// problem on the past light cone; a measurement transfer (a magnetometer near a
// long launch-pad cable). Uses graph and em4b-kink's light-cone panel.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { MU0, C, PI, sf } from './_em4b.js';

const t = String.raw;

// the wire switched on: A, B, E at distance s (m) and time t (s), current I₀ (A)
function wire(I0, s, tt) {
  const ct = C * tt;
  if (ct <= s) return { on: false, A: 0, B: 0, E: 0 };
  const q = Math.sqrt(ct * ct - s * s);
  return { on: true, A: ((MU0 * I0) / (2 * PI)) * Math.log((ct + q) / s), B: ((MU0 * I0) / (2 * PI * s)) * (ct / q), E: (MU0 * I0 * C) / (2 * PI * q), Bs: (MU0 * I0) / (2 * PI * s) };
}
/** The time (s) after switch-on when B at distance s is within a fraction eps of its static value. */
const settle = (s, eps) => (s * (1 + eps)) / Math.sqrt((1 + eps) ** 2 - 1) / C;

const EX = { I0: 10, s: 3, t: 20e-9 };
EX.w = wire(EX.I0, EX.s, EX.t);
EX.tf = EX.s / C;

/** The wire picture: A (blue) and B/B∞ (teal) against distance at ct = T (in units of the length scale). */
function wirePic(T, caption, { showB = true } = {}) {
  const T4 = +T.toFixed(4);
  return {
    type: 'graph',
    params: {
      x: [0, 5], y: [0, 4], xlabel: 's (in units of the length scale)', ylabel: '', aspect: 'wide',
      curves: [
        { fn: `ln((${T4} + sqrt(max(${T4}^2 - x^2, 0)))/x)*step(${T4} - x)`, domain: [0.02, 5], color: 'accent', width: 2.4, label: 'A', labelAt: 0.12, labelDx: 8, labelDy: 0 },
        ...(showB ? [{ fn: '1/x', domain: [0.25, 5], color: 'ink3', width: 1.2, dash: [5, 4], label: 'static B', labelAt: 4.2, labelDy: -6 }, { fn: `${T4}/(x*sqrt(max(${T4}^2 - x^2, 1e-9)))*step(${T4} - x)`, domain: [0.25, 5], color: 'teal', width: 2.2, label: 'B', labelAt: +(0.87 * T4).toFixed(3), labelDx: 8, labelDy: 0 }] : []),
      ],
      vlines: [{ x: T4, color: 'gold', label: 's = ct' }],
    },
    caption,
  };
}

/** A 1+1 spacetime picture with a static charge's worldline at x0 and an event P (no light cone drawn). */
function conePic(x0, xP, tP, caption, { drag = false, cone = false, mark = null } = {}) {
  return {
    type: 'graph',
    params: {
      x: [-4, 4], y: [-4, 4], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-seconds)', ylabel: 't (s)',
      curves: [
        { param: [String(x0), 't'], t: [-4, 4], color: 'bad', width: 2.4, label: 'charge', labelAt: 3.3, labelDx: 6 },
        ...(cone ? [{ fn: `${tP} - abs(x - ${xP})`, color: 'gold', width: 1.6, dash: [6, 4] }] : []),
      ],
      points: [{ x: xP, y: tP, color: 'gold', r: 5, label: 'P' }, ...(mark ? [{ x: mark[0], y: mark[1], color: 'violet', r: 5, label: 'retarded event' }] : [])],
      ...(drag ? { drag: [{ key: 'p', x: 0, y: -3, snap: 0.1 }] } : {}),
    },
    caption,
  };
}

export default lesson({
  id: 'phys4600.M4.3',
  title: 'Retarded potentials',
  minutes: 16, difficulty: 3,
  equation: t`\begin{gathered}V(\vec r, t) = \frac{1}{4\pi\varepsilon_0}\int\frac{\rho(\vec r\,', t_r)}{R}\,d\tau', \quad \vec A(\vec r, t) = \frac{\mu_0}{4\pi}\int\frac{\vec J(\vec r\,', t_r)}{R}\,d\tau', \\ t_r = t - \frac{R}{c}\end{gathered}`,
  intro: t`In the Lorenz gauge ([M4.2](#/lesson/phys4600.M4.2)) each potential obeys a wave equation with a source, $\Box^2V = -\rho/\varepsilon_0$ and $\Box^2\vec A = -\mu_0\vec J$. Their solution is the static formula with one change: each piece of source is counted **as it was** when light now arriving from it set out — at the retarded time $t_r = t - R/c$, where $R$ is the distance from the source point to the field point. The potential here and now is an integral over your **past light cone**. (Why exactly this works — the retarded Green’s function of the wave equation — is in [ST-B B9.3](#/lesson/st-b.B9.3).) One warning: it is the potentials that may simply be retarded. Retard Coulomb’s law or the Biot–Savart law the same way and you get the wrong fields; the true fields, Jefimenko’s equations, carry extra terms in $\dot\rho$ and $\dot{\vec J}$.`,
  symbols: [
    { tex: 'V,\\ \\vec A', text: 'the scalar and vector potentials at the field point, in V and T·m' },
    { tex: '\\rho,\\ \\vec J', text: t`the charge density ($\text{C/m}^3$) and current density ($\text{A/m}^2$) of the source` },
    { tex: '\\vec r\\,', text: 'the source point, integrated over the whole source; the field point is $\\vec r$' },
    { tex: 'R', text: t`the distance $|\vec r - \vec r\,'|$ from source point to field point, in m (Griffiths writes it as a script r)` },
    { tex: 't_r', text: t`the retarded time $t - R/c$: when the source point must have been doing what is felt at $\vec r$ at time $t$` },
    { tex: "d\\tau'", text: 'the volume element at the source point' },
  ],
  why: t`Retarded potentials are where radiation comes from: every antenna pattern, the Larmor formula, and the $1/r$ gravitational waves LIGO hears are retarded solutions of a wave equation.`,
  visual: {
    type: 'graph',
    title: 'A current switched on',
    lead: t`An infinitely long straight wire carries no current until $t = 0$, when a steady current $I_0$ switches on everywhere along it at once. The vector potential at distance $s$ is the retarded integral along the wire. Slide the light front $ct$ outward. Blue: $A$ (in units of $\mu_0I_0/2\pi$). Teal: $B$ (in units of $\mu_0I_0/2\pi$ per unit length), against the static $1/s$ (dashed).`,
    tasks: [
      t`Ahead of the gold front nothing has happened: the news of the switch-on has not arrived.`,
      t`Just behind the front $B$ shoots up — the nearest part of the wire arrives first and all at once — then sinks toward the static value as more distant parts of the wire are heard from.`,
      t`At a fixed $s$, $A$ keeps growing as $\ln(2ct/s)$: the infinite wire never finishes arriving, yet $B = -\partial A/\partial s$ settles.`,
    ],
    params: {
      x: [0, 5], y: [0, 4], xlabel: 's (in units of the length scale)', ylabel: '', aspect: 'wide',
      sliders: [{ key: 'T', label: t`Light front $ct$`, min: 0.1, max: 5, step: 0.05, value: 2, explain: 'How far the news of the switch-on has travelled from the wire, in the same units as s.' }],
      curves: [
        { fn: 'ln((T + sqrt(max(T^2 - x^2, 0)))/x)*step(T - x)', domain: [0.02, 5], color: 'accent', width: 2.4, label: 'A', labelAt: 0.12, labelDx: 8, labelDy: 0 },
        { fn: '1/x', domain: [0.25, 5], color: 'ink3', width: 1.2, dash: [5, 4], label: 'static B', labelAt: 4.2, labelDy: -6 },
        { fn: 'T/(x*sqrt(max(T^2 - x^2, 1e-9)))*step(T - x)', domain: [0.25, 5], color: 'teal', width: 2.2, label: 'B', labelAt: 1.75, labelDx: 8, labelDy: 0 },
      ],
      vlines: [{ x: 'T', color: 'gold', label: 's = ct' }],
    },
    caption: t`An idealized infinite wire with a current switched on instantly everywhere at $t = 0$; $A$ and $B$ are exact for that idealization. The spike of $B$ at the front is real for an instant switch — a real switch-on takes time, which rounds it off.`,
  },
  example: {
    prompt: t`A long straight wire’s current jumps from 0 to ${EX.I0} A at $t = 0$. At $s = ${EX.s}$ m from it, when does anything happen, and what are $A$, $B$ and $E$ at $t = ${EX.t * 1e9}$ ns?`,
    visual: wirePic((C * EX.t) / EX.s, t`The wire’s $A$ and $B$ against distance (in units of ${EX.s} m) at $t = ${EX.t * 1e9}$ ns, when $ct = ${nice(sf(C * EX.t, 4))}$ m. Idealized infinite wire and instant switch.`),
    steps: [
      { label: 'The integral', text: t`$A_z(s, t) = \dfrac{\mu_0}{4\pi}\displaystyle\int\dfrac{I(t_r)}{R}\,dz$ with $R = \sqrt{s^2 + z^2}$. A piece of wire contributes only if its news has arrived, $R < ct$, i.e. $|z| < \sqrt{c^2t^2 - s^2}$.` },
      { label: 'Do it', text: t`$A_z = \dfrac{\mu_0I_0}{2\pi}\ln\dfrac{ct + \sqrt{c^2t^2 - s^2}}{s}$ for $ct > s$, and zero before. Here the front arrives at $t = s/c = ${nice(sf(EX.tf * 1e9, 3))}$ ns.` },
      { label: 'At 20 ns', text: t`$ct = ${nice(sf(C * EX.t, 4))}$ m, so $A_z \approx ${nice(sf(EX.w.A * 1e6, 3))}\ \mu\text{T·m}$.` },
      { label: 'Fields', text: t`$E_z = -\partial A_z/\partial t = -\dfrac{\mu_0I_0c}{2\pi\sqrt{c^2t^2 - s^2}} \approx -${nice(sf(EX.w.E, 3))}$ V/m (against the current), and $B = -\partial A_z/\partial s = \dfrac{\mu_0I_0}{2\pi s}\dfrac{ct}{\sqrt{c^2t^2 - s^2}} \approx ${nice(sf(EX.w.B * 1e6, 3))}$ μT, against the static $${nice(sf(EX.w.Bs * 1e6, 3))}$ μT.` },
      { label: 'Sense check', text: t`As $t \to \infty$, $E \to 0$ and $B \to \mu_0I_0/2\pi s$: the steady wire of magnetostatics. The large $E$ is the price of switching on instantly; it is the field that pushes back on the current — the wire’s inductance seen from outside.` },
    ],
    answer: t`Nothing until ${nice(sf(EX.tf * 1e9, 3))} ns; at 20 ns $A \approx ${nice(sf(EX.w.A * 1e6, 3))}\ \mu\text{T·m}$, $E \approx ${nice(sf(EX.w.E, 3))}$ V/m against the current, $B \approx ${nice(sf(EX.w.B * 1e6, 3))}$ μT (static value ${nice(sf(EX.w.Bs * 1e6, 3))} μT).`,
  },
  practice: [
    {
      type: 'point', id: 'drag-retarded', difficulty: 2,
      gen(r) {
        const x0 = r.pick([-1, 1]), xP = r.pick([-3, 0, 3].filter((v) => Math.abs(v - x0) >= 1)), tP = r.pick([1, 2, 3]);
        const tr = tP - Math.abs(xP - x0);
        return {
          prompt: t`A charge sits at rest at $x = ${x0}$ light-second${Math.abs(x0) === 1 ? '' : 's'} (red worldline). The potential at event P — at $x = ${xP}$, time $t = ${tP}$ s — depends on the charge as it was at the retarded time. Drag the point to the **retarded event** on the charge’s worldline.`,
          visual: conePic(x0, xP, tP, t`A spacetime diagram ($c = 1$: light travels one light-second per second, along $45^\circ$ lines). One space dimension drawn.`, { drag: true }),
          answer: { x: x0, y: tr }, tol: { x: 0.15, y: 0.15 },
          instruction: 'Drag the point to the retarded event, then check.',
          hints: [t`The retarded event is on the charge’s worldline and on P’s **past** light cone: the $45^\circ$ lines running down from P.`, t`$t_r = t_P - |x_P - x_0|/c = ${tP} - ${Math.abs(xP - x0)}$.`],
          teach: 'The retarded event is where the source’s worldline crosses the field point’s past light cone.',
          explain: t`$(x, t) = (${x0}, ${tr})$: light leaving the charge then covers $${Math.abs(xP - x0)}$ light-seconds to reach P at $t = ${tP}$ s.`,
        };
      },
    },
    num({
      id: 'A-wire', difficulty: 2,
      gen(r) {
        const I0 = r.pick([2, 5, 20]), s = r.pick([1, 2, 5]), tt = r.pick([10, 20, 50]) * 1e-9;
        const w = wire(I0, s, tt);
        return {
          prompt: t`A long straight wire’s current jumps from 0 to ${I0} A at $t = 0$. What is the vector potential ${s} m from it at $t = ${tt * 1e9}$ ns, in μT·m? Use $A = \dfrac{\mu_0I_0}{2\pi}\ln\dfrac{ct + \sqrt{c^2t^2 - s^2}}{s}$.`,
          visual: wirePic((C * tt) / s, t`$A$ and $B$ against distance (in units of ${s} m) at this moment; the gold line is the light front.`, { showB: false }),
          answer: w.A * 1e6, units: 'μT m', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I0) / (2 * PI)) * Math.log((2 * C * tt) / s) * 1e6, feedback: t`That is the long-time approximation $\ln(2ct/s)$; here $ct$ is not much larger than $s$, so use the full formula.` }].filter((e) => Math.abs(e.value - w.A * 1e6) > 0.02 * w.A * 1e6),
          hints: [t`First check that the front has arrived: $ct = ${nice(sf(C * tt, 4))}$ m against $s = ${s}$ m.`, t`$\mu_0I_0/2\pi = ${nice(sf((MU0 * I0) / (2 * PI) * 1e6, 3))}\ \mu\text{T·m}$.`],
          teach: 'The retarded potential of the switched-on wire counts only the stretch of wire whose news has arrived: |z| < √(c²t² − s²).',
          explain: t`$ct = ${nice(sf(C * tt, 4))}$ m $> ${s}$ m, so $A = \dfrac{\mu_0I_0}{2\pi}\ln\dfrac{ct + \sqrt{c^2t^2 - s^2}}{s} \approx ${nice(sf(w.A * 1e6, 3))}\ \mu\text{T·m}$.`,
        };
      },
    }),
    num({
      id: 'settle', difficulty: 3,
      gen(r) {
        const s = r.pick([1, 3, 10]), pct = r.pick([1, 5, 10]);
        const T = settle(s, pct / 100);
        return {
          prompt: t`For the wire switched on at $t = 0$, $B = \dfrac{\mu_0I_0}{2\pi s}\dfrac{ct}{\sqrt{c^2t^2 - s^2}}$. How long after the switch-on is $B$, ${s} m from the wire, within ${pct}% of its final value? Give it in ns.`,
          visual: wirePic(2, t`$A$ and $B$ against distance at one moment: behind the front, $B$ overshoots the static $1/s$ (dashed) and settles down.`),
          answer: T * 1e9, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: (s / C) * 1e9, feedback: 'That is when the front arrives. At that instant B is far above its final value; it then settles.' }],
          hints: [t`Set $\dfrac{ct}{\sqrt{c^2t^2 - s^2}} = ${1 + pct / 100}$ and solve for $ct$.`, t`$ct = \dfrac{s(1 + \epsilon)}{\sqrt{(1 + \epsilon)^2 - 1}}$ with $\epsilon = ${pct / 100}$.`],
          teach: 'Behind the front the field settles only as more distant parts of the source come into view.',
          explain: t`$ct = ${nice(sf(C * T, 3))}$ m, so $t \approx ${nice(sf(T * 1e9, 3))}$ ns — about $${nice(sf((C * T) / s, 3))}$ times the light-travel time $s/c$.`,
        };
      },
    }),
    mcq({
      id: 'jefimenko', difficulty: 3,
      prompt: t`The retarded potentials are the static formulas with $\rho$ and $\vec J$ read at $t_r$. Can you find the **electric field** the same way, putting $\rho(\vec r\,', t_r)$ into Coulomb’s law?`,
      visual: { type: 'em4b-kink', params: { mode: 'stop', beta: 0.5, tau: 0.4, time: 3, panels: ['field'], probe: null, readout: false }, caption: t`The field of a charge that has stopped: in the shell where the news of the stop is arriving, the lines run sideways — not what a retarded Coulomb field would give.` },
      choices: [
        t`No: the true field (Jefimenko’s equation) adds terms in $\dot\rho(t_r)$ and $\dot{\vec J}(t_r)$; retarding the potentials is right, retarding the fields is not`,
        'Yes: retardation applies to every static formula in the same way',
        'Yes, but only for charges, not currents',
        t`No, because the electric field is instantaneous and is never retarded`,
      ],
      answer: 0,
      why: {
        1: t`Retarded Coulomb misses the $\dot\rho$ term and the $-\partial\vec A/\partial t$ contribution — the very terms that make radiation.`,
        2: 'The same mistake applies to charges: retarded Coulomb alone is wrong whenever ρ changes in time.',
        3: t`The fields are retarded too: they depend on the source on the past light cone. They just are not simply retarded Coulomb.`,
      },
      hints: [t`$\vec E = -\nabla V - \partial\vec A/\partial t$. Differentiating $\rho(\vec r\,', t - R/c)$ with respect to $\vec r$ hits the $R$ inside $t_r$ too.`, 'Look at the shell in the picture: what makes field lines run sideways?'],
      teach: 'Retard the potentials, not the fields: Jefimenko’s fields carry extra time-derivative terms.',
      explain: t`Jefimenko: $\vec E = \dfrac{1}{4\pi\varepsilon_0}\displaystyle\int\left[\dfrac{\rho(t_r)}{R^2}\hat R + \dfrac{\dot\rho(t_r)}{cR}\hat R - \dfrac{\dot{\vec J}(t_r)}{c^2R}\right]d\tau'$. The last two fall off only as $1/R$ — they are the radiation, invisible to a retarded Coulomb law.`,
    }),
    mcq({
      id: 'static-limit', difficulty: 1,
      prompt: t`What do the retarded potentials give for a charge distribution that has not changed for a very long time?`,
      visual: conePic(-1, 2, 2, t`A static charge’s worldline and an event P with its past light cone (dashed): the cone meets the charge as it always is.`, { cone: true, mark: [-1, -1] }),
      choices: [
        t`Exactly the static Coulomb potential: $\rho(\vec r\,', t_r) = \rho(\vec r\,')$ for any $t_r$`,
        'A potential smaller than Coulomb’s, because the field takes time to arrive',
        'Zero, because retarded potentials describe only radiation',
        'The Coulomb potential multiplied by a light-travel correction factor',
      ],
      answer: 0,
      why: {
        1: 'For a source that has not changed, it does not matter when the light set out: the source looked the same then.',
        2: 'Retarded potentials describe everything — static fields included — not just radiation.',
        3: 'With nothing changing, retardation changes nothing; there is no correction.',
      },
      hints: ['If ρ does not depend on time, what is ρ at the retarded time?', 'Compare with the formula of electrostatics.'],
      teach: 'Retardation only matters when the source changes; static sources give the static potentials exactly.',
      explain: t`$\rho(\vec r\,', t_r) = \rho(\vec r\,')$, so $V$ reduces to $\dfrac{1}{4\pi\varepsilon_0}\displaystyle\int\dfrac{\rho}{R}d\tau'$. The retarded solution contains statics as a special case — a check every new formula should pass.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pad', difficulty: 3, transfer: true,
      gen(r) {
        const s = r.pick([5, 15, 30]), ppm = r.pick([1000, 100]);
        const T = settle(s, ppm * 1e-6);
        return {
          prompt: t`A magnetometer on a launch pad sits ${s} m from a long, straight power cable (treat it as infinite) whose current is switched on abruptly. Its reading must be within ${ppm === 1000 ? '0.1%' : '0.01%'} of the final steady value before the instrument is calibrated. How long after the switch-on, in μs, at the earliest? Use $B = \dfrac{\mu_0I_0}{2\pi s}\dfrac{ct}{\sqrt{c^2t^2 - s^2}}$.`,
          visual: wirePic(1.4, t`$A$ and $B$ against distance shortly after the switch-on (distance in units of the magnetometer’s distance; not to scale in time).`),
          answer: T * 1e6, units: 'μs', tol: { rel: 0.01 },
          errors: [{ value: (s / C) * 1e6, feedback: 'That is when the first news arrives; B is then far from settled.' }],
          hints: [t`Solve $\dfrac{ct}{\sqrt{c^2t^2 - s^2}} = 1 + \epsilon$ for $t$, with $\epsilon = ${ppm * 1e-6}$.`, t`For small $\epsilon$, $ct \approx s/\sqrt{2\epsilon}$.`],
          teach: 'Retarded fields settle slowly: an infinite source keeps arriving, and B approaches its static value only as 1/t².',
          explain: t`$ct = \dfrac{s(1 + \epsilon)}{\sqrt{(1 + \epsilon)^2 - 1}} \approx ${nice(sf(C * T, 3))}$ m, so $t \approx ${nice(sf(T * 1e6, 3))}$ μs — tiny for an instrument, but ${nice(sf((C * T) / s, 3))} times the light-travel time. Real cables are finite and real switches slow, so the true settling follows the current, not this ideal tail.`,
        };
      },
    }),
    mcq({
      id: 'cp-cone', difficulty: 2,
      prompt: t`Which parts of a source determine the retarded potential at an event P?`,
      visual: { type: 'em4b-kink', params: { mode: 'start', beta: 0.6, tau: 0.4, time: 2.5, panels: ['cone'], probe: [-2, 2], readout: false }, caption: t`A spacetime diagram ($c = 1$): a charge’s worldline (red), the past light cone of P (gold, cut through the charge’s line of motion) and the retarded event where they cross.` },
      choices: [
        t`Only those on P’s past light cone: each point of the source as it was when light now reaching P left it`,
        'Everything inside P’s past light cone, i.e. the whole history of the source',
        'The whole source as it is at the same moment as P',
        'Only the part of the source nearest to P',
      ],
      answer: 0,
      why: {
        1: t`In three dimensions the retarded Green’s function lives on the cone itself, not inside it (Huygens’ principle; the inside matters in one and two dimensions).`,
        2: 'That would be instantaneous action at a distance — the Coulomb gauge’s V does it, but no physical field does.',
        3: 'Every part of the source contributes, each weighted by 1/R and read at its own retarded time.',
      },
      hints: [t`$t_r = t - R/c$: one retarded time for each source point.`, 'In 3D, the wave equation’s retarded Green’s function is δ(t − R/c)/R.'],
      teach: 'Retarded potentials integrate over the past light cone, each source point read when its light left.',
      explain: t`Every source point contributes, but each at its own retarded time — the set of events on P’s past light cone. In three dimensions the Green’s function is concentrated on the cone, so the earlier history inside it plays no part ([ST-B B9.3](#/lesson/st-b.B9.3)).`,
    }),
    num({
      id: 'cp-E-front', difficulty: 3,
      gen(r) {
        const I0 = r.pick([1, 10, 100]), s = r.pick([0.5, 2, 4]), k = r.pick([1.5, 2, 3]);
        const tt = (k * s) / C, w = wire(I0, s, tt);
        return {
          prompt: t`A long wire’s current jumps from 0 to ${I0} A at $t = 0$. ${s} m away, what is the size of the induced electric field at the moment $ct = ${k}s$? Use $E = \dfrac{\mu_0I_0c}{2\pi\sqrt{c^2t^2 - s^2}}$, in V/m.`,
          visual: wirePic(k, t`$A$ and $B$ against distance (in units of ${s} m) at this moment; the light front is at $s = ct$.`),
          answer: w.E, units: 'V/m', tol: { rel: 0.01 },
          errors: [{ value: (MU0 * I0 * C) / (2 * PI * k * s), feedback: t`The denominator is $\sqrt{c^2t^2 - s^2}$, not $ct$.` }],
          hints: [t`$\sqrt{c^2t^2 - s^2} = s\sqrt{${k}^2 - 1}$.`, t`$\mu_0c/2\pi \approx 60\ \Omega$.`],
          teach: 'The switched-on wire’s E = −∂A/∂t is largest just behind the front and dies away as 1/t.',
          explain: t`$E = \dfrac{\mu_0I_0c}{2\pi s\sqrt{${k}^2 - 1}} \approx ${nice(sf(w.E, 3))}$ V/m, pointing against the current.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §10.2 and Example 10.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Jefimenko, Electricity and Magnetism (Appleton-Century-Crofts, 1966), and Griffiths & Heald, Am. J. Phys. 59, 111 (1991)', url: 'https://doi.org/10.1119/1.16589' },
  ],
});
