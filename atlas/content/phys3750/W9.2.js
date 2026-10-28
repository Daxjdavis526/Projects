// Conservation laws for fields: from the wave equation, multiplying by y_t
// gives ∂e/∂t + ∂S/∂x = 0 — energy is conserved locally, not just in total.
// The integral form (a segment changes only by what crosses its ends), the
// same template for heat, charge, mass and probability, sinks (damping), the
// 3D form ∂u/∂t + ∇·S = 0 with the divergence theorem, and the lead-in to
// Poynting's theorem for electromagnetic fields (PHYS 3750 W12).
import { lesson, mcq, num, multi, order } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: a string with T = 100 N, μ = 0.01 kg/m carrying y = A sin(kx − ωt)
const EX = (() => {
  const T = 100, mu = 0.01, A = 0.005, f = 50, v = Math.sqrt(T / mu), w = 2 * Math.PI * f, k = w / v, Z = Math.sqrt(T * mu);
  const ebar = 0.5 * mu * w * w * A * A, Sbar = 0.5 * Z * w * w * A * A;
  return { T, mu, A, f, v, w, k, Z, ebar, Sbar, lam: v / f };
})();

export default lesson({
  id: 'phys3750.W9.2',
  title: 'Conservation laws for fields',
  minutes: 15, difficulty: 3,
  intro: t`For the string of [the last lesson](#/lesson/phys3750.W9.1), differentiate the energy density and use the wave equation $\mu y_{tt} = Ty_{xx}$:

$$\begin{aligned}\frac{\partial e}{\partial t} &= \mu y_ty_{tt} + Ty_xy_{xt} \\ &= T\big(y_ty_{xx} + y_xy_{xt}\big) \\ &= \frac{\partial}{\partial x}\big(Ty_ty_x\big) = -\frac{\partial S}{\partial x}\end{aligned}$$

So $\partial e/\partial t + \partial S/\partial x = 0$: a **local conservation law**. Integrate over a segment and it says the energy inside changes only by what flows in or out through the ends — energy cannot vanish here and reappear there. Every conserved quantity carried by a field obeys the same equation, a density $u$ and a flux $\vec S$:

$$\begin{gathered}\frac{\partial u}{\partial t} + \nabla\cdot\vec S = 0 \\ \Longleftrightarrow\quad \frac{d}{dt}\int_Vu\,dV = -\oint_{\partial V}\vec S\cdot d\vec A\end{gathered}$$

Charge, mass, heat and quantum probability all follow this pattern; losses appear as a sink on the right-hand side.`,
  symbols: [
    { tex: 'u', text: 'the density of the conserved quantity: energy per volume (J/m³), or per length on a string (J/m)' },
    { tex: '\\vec S', text: 'its flux: how much crosses unit area per second (W/m² for energy), pointing the way it flows' },
    { tex: '\\nabla\\cdot\\vec S', text: 'the divergence: the net outflow per unit volume at a point' },
    { tex: 'V,\\ \\partial V', text: 'any fixed region of space and its closed boundary surface' },
    { tex: 'd\\vec A', text: 'an element of the boundary, as a vector along the outward normal, in m²' },
  ],
  why: t`This is the equation Maxwell’s fields will satisfy as Poynting’s theorem (W12), and the template for the stress–energy tensor of general relativity, $\nabla_\mu T^{\mu\nu} = 0$.`,
  visual: {
    type: 'pde-player',
    title: 'What spreads, and what is conserved',
    lead: t`One profile evolved by the wave equation (energy density shaded below) or the heat equation (flux arrows below). The readouts total up the conserved quantity.`,
    tasks: [
      t`Wave: run time forward. The energy density splits and travels with the two pulses, and the total energy readout never changes.`,
      t`Heat: the arrows show the flux $q = -Du_x$, always downhill. The peak drops, but the area $\int u\,dx$ — the total heat — stays fixed.`,
      t`In both, nothing jumps: what leaves one place has visibly flowed through the places in between.`,
    ],
    params: { mode: 'wave', modes: ['wave', 'heat'], energy: true, flux: true, controls: ['mode', 't'], tmax: 5, xt: false },
    caption: t`Exact solutions on an infinite line (no boundaries, no losses): $u_{tt} = c^2u_{xx}$ with $c = 1$ m/s, or $u_t = Du_{xx}$ with $D = 0.5\ \text{m}^2/\text{s}$.`,
  },
  example: {
    prompt: t`A string with $T = ${EX.T}$ N and $\mu = ${EX.mu}$ kg/m carries $y = A\sin(kx - \omega t)$ with $A = ${EX.A * 1000}$ mm at ${EX.f} Hz. Check the conservation law, find the average energy density and flux, and show that the energy travels at the wave speed.`,
    steps: [
      { label: 'Derivatives', text: t`$y_t = -A\omega\cos\phi$, $y_x = Ak\cos\phi$ with $\phi = kx - \omega t$, and $\omega = vk$, $v = \sqrt{T/\mu} = ${tn(EX.v)}$ m/s.` },
      { label: 'Density and flux', text: t`$e = \tfrac12\mu A^2\omega^2\cos^2\phi + \tfrac12TA^2k^2\cos^2\phi = \mu A^2\omega^2\cos^2\phi$ (using $Tk^2 = \mu\omega^2$); $S = -Ty_ty_x = TA^2k\omega\cos^2\phi = v\,e$.` },
      { label: 'Check the law', text: t`$\partial_te = 2\mu A^2\omega^3\cos\phi\sin\phi$ and $\partial_xS = -2TA^2k^2\omega\cos\phi\sin\phi = -2\mu A^2\omega^3\cos\phi\sin\phi$: they cancel exactly.` },
      { label: 'Averages', text: t`$\bar e = \tfrac12\mu\omega^2A^2 = ${tn(EX.ebar)}$ J/m and $\bar S = \tfrac12Z\omega^2A^2 = ${tn(EX.Sbar)}$ W.` },
      { label: 'Energy speed', text: t`$\bar S/\bar e = ${tn(EX.Sbar / EX.ebar)}$ m/s $= v$: the flux is the density carried along at the wave speed. (In a dispersive medium it is carried at the group velocity.)` },
      { label: 'Toward Maxwell', text: t`In W12 the same steps, applied to Maxwell’s equations, give $u = \tfrac12\big(\varepsilon_0E^2 + B^2/\mu_0\big)$, $\vec S = \vec E\times\vec B/\mu_0$ and $\partial u/\partial t + \nabla\cdot\vec S = -\vec J\cdot\vec E$: **Poynting’s theorem**.` },
    ],
    answer: t`$\partial e/\partial t + \partial S/\partial x = 0$ holds identically; $\bar e = ${tn(EX.ebar)}$ J/m, $\bar S = ${tn(EX.Sbar)}$ W, and $\bar S/\bar e = v = ${tn(EX.v)}$ m/s.`,
    visual: curvesPic([
      { fn: `cos(2*pi*x)^2`, color: 'gold', width: 2.2, label: 'e (and S = v e)', labelAt: 0.5, labelDy: -12, labelDx: -40 },
      { fn: `0.6*sin(2*pi*x)`, color: 'accent', dash: [5, 4], width: 1.4, label: 'y', labelAt: 1.27, labelDy: -10 },
    ], [0, 2], [-0.8, 1.25], t`One instant of the travelling wave: the displacement (dashed) and the energy density (gold), largest where the string is steepest and fastest — at the zero crossings. Relative units.`, { xlabel: 'x (wavelengths)', ylabel: '' }),
  },
  practice: [
    order({
      id: 'derive-law', difficulty: 2,
      prompt: t`Put the derivation of the string’s energy conservation law in order.`,
      visual: curvesPic([{ fn: 'e^(-(x - 1)^2/0.3)', color: 'accent', width: 2.2 }, { fn: '0.6*e^(-(x - 1)^2/0.3)*(x - 1)^2*6', color: 'gold', dash: [5, 4], width: 1.4 }], [-1, 3], [-0.1, 1.3], t`A pulse (blue) and its energy density (dashed, relative): it lives where the string is tilted and moving.`, { xlabel: 'x', ylabel: '' }),
      items: [
        t`Start from $e = \tfrac12\mu y_t^2 + \tfrac12Ty_x^2$`,
        t`Differentiate: $\partial_te = \mu y_ty_{tt} + Ty_xy_{xt}$`,
        t`Use the wave equation: $\mu y_{tt} = Ty_{xx}$`,
        t`Recognise $T(y_ty_{xx} + y_xy_{xt}) = \partial_x(Ty_ty_x)$`,
        t`Name $S = -Ty_ty_x$: $\partial_te + \partial_xS = 0$`,
      ],
      hints: ['Begin with the density, differentiate it in time, then bring in the equation of motion.', 'The product rule run backwards makes the flux appear.'],
      teach: 'Multiply the equation of motion by the velocity, then spot a total derivative: the standard route to any energy conservation law.',
      explain: t`The wave equation turns $\mu y_ty_{tt}$ into $Ty_ty_{xx}$; together with $Ty_xy_{xt}$ that is exactly $\partial_x(Ty_ty_x)$ by the product rule. Nothing about the shape of the wave was assumed.`,
    }),
    num({
      id: 'segment-rate', difficulty: 2,
      gen(r) {
        const Sa = r.pick([1.5, 2.4, 3.2]), Sb = r.pick([0.4, 1.1, 2.0, -0.6]);
        const rate = Sa - Sb;
        return {
          prompt: t`At one instant the energy flux on a string is $S = ${Sa}$ W at $x = a$ and $S = ${Sb}$ W at $x = b > a$ (positive means flowing toward $+x$). At what rate is the energy between $a$ and $b$ changing, in W?`,
          visual: curvesPic([{ fn: '0.4*sin(2*x) + 0.15*sin(5*x)', color: 'accent', width: 2.2, domain: [-0.4, 3.6] }], [-0.5, 3.7], [-1, 1.2], t`The segment from $a$ to $b$; the arrows show the flux through its ends (lengths not to scale).`, { xlabel: 'x', ylabel: '', vlines: [{ x: 0.5, label: 'a', color: 'gold' }, { x: 2.8, label: 'b', color: 'gold' }], arrows: [{ from: [0.2, 0.85], to: [0.8, 0.85], color: 'gold', label: `${Sa} W` }, { from: Sb >= 0 ? [2.5, 0.85] : [3.1, 0.85], to: Sb >= 0 ? [3.1, 0.85] : [2.5, 0.85], color: 'gold', label: `${Math.abs(Sb)} W` }] }),
          answer: rate, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: Sa + Sb, feedback: t`Flux at $b$ leaves the segment when it is positive: $dE/dt = S(a) - S(b)$.` }, { value: Sb - Sa, feedback: t`Sign: energy **enters** at $a$ when $S(a) > 0$.` }],
          hints: [t`Integrate $\partial_te = -\partial_xS$ from $a$ to $b$.`, t`$\dfrac{d}{dt}\int_a^be\,dx = S(a) - S(b)$.`],
          teach: t`Integral form in 1D: the energy in a segment changes at the rate $S(a) - S(b)$ — in at one end, out at the other.`,
          explain: t`$dE/dt = ${Sa} - (${Sb}) = ${tn(rate)}$ W${rate > 0 ? ': the segment is gaining energy' : ''}.`,
        };
      },
    }),
    multi({
      id: 'which-conserved', difficulty: 2,
      prompt: t`Which of these density–flux pairs obey a conservation law $\partial u/\partial t + \nabla\cdot\vec S = 0$ with **no** source or sink term? (Select all that apply.)`,
      visual: { type: 'pde-player', params: { mode: 'heat', flux: true, xt: false, t: 1.5, play: false, controls: [], readout: false }, caption: 'Heat diffusing along an insulated rod: the arrows are the flux, always downhill.' },
      choices: [
        t`Electric charge: density $\rho$, flux the current density $\vec J$`,
        t`Mass in a fluid flow: density $\rho$, flux $\rho\vec v$`,
        t`Quantum probability: density $|\psi|^2$, flux the probability current $\vec j$`,
        t`Energy on a string with friction: density $e$, flux $S$`,
        t`Heat in a rod that is cooling through its sides: temperature, flux $-D\,\partial_xu$`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`Friction turns wave energy into heat: $\partial_te + \partial_xS = -by_t^2$, a sink.`,
        4: 'Heat leaving through the sides is a loss term; only an insulated rod conserves its heat.',
      },
      hints: ['Ask for each: can the quantity disappear in place, or only move?', 'Friction and sideways cooling remove the quantity locally — that is a sink.'],
      teach: 'Conservation laws share one form; a loss or gain shows up as a source term on the right.',
      explain: t`Charge (continuity of $\rho$ and $\vec J$), mass (the continuity equation of fluids) and probability (Schrödinger, W10) are exactly conserved. Friction and leaky insulation add sinks: $\partial_tu + \nabla\cdot\vec S = -(\text{loss rate per volume})$.`,
    }),
    num({
      id: 'damping-sink', difficulty: 3,
      gen(r) {
        const b = r.pick([0.02, 0.05, 0.1]), f = r.pick([20, 40, 60]), A = r.pick([2, 4, 6]);   // b in kg/(m s), A in mm
        const w = 2 * Math.PI * f, loss = 0.5 * b * w * w * (A / 1000) ** 2;
        return {
          prompt: t`A string feels a drag force $-b\,y_t$ per unit length, with $b = ${b}$ kg m⁻¹ s⁻¹, so its energy law becomes $\partial_te + \partial_xS = -b\,y_t^2$. A wave $y \approx A\sin(kx - \omega t)$ with $A = ${A}$ mm and $f = ${f}$ Hz passes (assume light damping). What average power is lost per metre of string, in W/m?`,
          visual: curvesPic([{ fn: `${A}*e^(-0.15*x)*sin(2*pi*x)`, color: 'accent', width: 2.2 }, { fn: `${A}*e^(-0.15*x)`, color: 'gold', dash: [5, 4], width: 1.2 }], [0, 6], [-A * 1.3, A * 1.3], t`A wave fading as it travels (y in mm, x in wavelengths; damping exaggerated).`, { xlabel: 'x (wavelengths)', ylabel: 'y (mm)' }),
          answer: loss, units: 'W/m', tol: { rel: 0.01 },
          errors: [{ value: 2 * loss, feedback: t`Average $\cos^2$ over a cycle: $\overline{y_t^2} = \tfrac12\omega^2A^2$.` }, { value: 0.5 * b * f * f * (A / 1000) ** 2, feedback: t`Use $\omega = 2\pi f$.` }],
          hints: [t`$y_t = -A\omega\cos(kx - \omega t)$.`, t`Average sink: $b\,\overline{y_t^2} = \tfrac12b\omega^2A^2$, with $A$ in m.`],
          teach: t`A sink term measures where the conserved quantity leaves the field: here $b\,y_t^2$ per metre becomes heat.`,
          explain: t`$\tfrac12(${b})(${tn(w)})^2(${tn(A / 1000)})^2 = ${tn(loss)}$ W/m. That energy is drawn from the flux, so $S$ decreases along the string and the wave dies away.`,
        };
      },
    }),
    num({
      id: 'heat-segment', difficulty: 2,
      gen(r) {
        const D = r.pick([1e-5, 4e-5, 9.7e-5]), ga = r.pick([-200, -120, 80]), gb = r.pick([-400, -60, 150]), cA = r.pick([2.4e6, 3.5e6]);  // gradients in K/m, ρc in J/(m³ K)
        // heat flux q = −k u_x with k = D ρc (W/m²), through a rod of cross-section 1 cm²
        const area = 1e-4, qa = -D * cA * ga, qb = -D * cA * gb, rate = (qa - qb) * area;
        return {
          prompt: t`In a metal rod of cross-section 1 cm², heat flows with flux $q = -\kappa\,\partial_xu$, where $\kappa = ${tn(D * cA)}$ W m⁻¹ K⁻¹. The temperature gradient is $${ga}$ K/m at $x = a$ and $${gb}$ K/m at $x = b > a$. At what rate is the heat between $a$ and $b$ changing, in W?`,
          visual: curvesPic([{ fn: `300 + ${ga / 100}*x + ${(gb - ga) / 200}*x^2`, color: 'accent', width: 2.2, domain: [0, 1] }], [-0.1, 1.1], [296, 304], t`A sketch of the temperature (K) along the segment, $x$ from $a$ to $b$ in units of the segment length (shape illustrative).`, { xlabel: 'position (segment lengths)', ylabel: 'u (K)' }),
          answer: rate, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: -rate, feedback: t`Heat flows downhill: $q = -\kappa\,\partial_xu$, and $dQ/dt = A\,[q(a) - q(b)]$.` }, { value: (qa - qb), feedback: 'Multiply the flux (W/m²) by the cross-section, 1 cm² = 10⁻⁴ m².' }],
          hints: [t`$q(a) = -\kappa(${ga})$ and $q(b) = -\kappa(${gb})$ W/m².`, t`$dQ/dt = A_{\text{rod}}\,[q(a) - q(b)]$.`],
          teach: 'The same integral law for heat: what flows in at one end minus what flows out at the other.',
          explain: t`$q(a) = ${tn(qa)}$ W/m², $q(b) = ${tn(qb)}$ W/m², so $dQ/dt = 10^{-4}(${tn(qa)} - ${tn(qb)}) = ${tn(rate)}$ W.`,
        };
      },
    }),
    mcq({
      id: 'local-vs-global', difficulty: 3,
      prompt: t`A theory says the total energy of the universe is constant, but lets energy vanish in one place and appear at the same instant somewhere far away. Why do physicists insist on the **local** law $\partial_tu + \nabla\cdot\vec S = 0$ instead?`,
      visual: { type: 'pde-player', params: { mode: 'wave', energy: true, xt: false, t: 3, play: false, controls: [], readout: false }, caption: 'A disturbance whose energy (shaded) has moved away from where it started by travelling, not by jumping.' },
      choices: [
        'In relativity “at the same instant” depends on the observer, so only conservation by flow through the space between is consistent for everyone',
        'Because the local law conserves more energy than the global one does',
        'Because global conservation is never true in any physical theory',
        'Because the local law only applies to waves, which are the only carriers of energy',
      ],
      answer: 0,
      why: {
        1: 'Both conserve the same total; the local law says more: how the energy gets from place to place.',
        2: 'Global conservation is true for isolated systems; it is just not enough on its own.',
        3: 'The same law governs charge, mass and heat, which need not be waves.',
      },
      hints: ['Two distant events that are simultaneous for one observer are not simultaneous for another.', 'A local law forbids jumps: what leaves a region must cross its boundary.'],
      teach: 'Local conservation — density and flux — is the form compatible with relativity: no quantity teleports.',
      explain: t`If energy disappeared here and reappeared there “simultaneously”, a moving observer would see it gone from both places, or present in both, for a while. The continuity equation forbids that, and it is the form every field theory, Maxwell’s and Einstein’s included, takes.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-probe-balance', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([0.5, 1.0, 1.5]), d = r.pick([0.72, 1.0, 1.52]), alpha = r.pick([0.6, 0.9]);
        const Iin = 1361 / (d * d), Pabs = alpha * Iin * Math.PI * R * R;
        return {
          prompt: t`A spherical probe of radius ${R} m sits ${d} AU from the Sun (sunlight $1361/d^2$ W/m² with $d$ in AU) and absorbs a fraction ${alpha} of the light falling on it. In steady state, applying $\frac{d}{dt}\int_Vu\,dV = -\oint\vec S\cdot d\vec A$ to a sphere enclosing the probe, how much power must the probe radiate, in W?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['0.6*cos(t)', '0.6*sin(t)'], t: [0, 2 * Math.PI], color: 'accent', width: 2.4 }, { param: ['1.3*cos(t)', '1.3*sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', dash: [5, 4], width: 1.2 }], arrows: [-0.4, 0, 0.4].map((y) => ({ from: [-2.9, y], to: [-1.4, y], color: 'gold' })), points: [{ x: 1.35, y: 1.05, r: 0, label: 'closed surface', color: 'ink3' }] }, caption: 'Sunlight (gold) on the probe (blue) and an imaginary closed surface around it (dashed). Not to scale.' },
          answer: Pabs, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: alpha * Iin * 4 * Math.PI * R * R, feedback: t`Sunlight falls on the probe’s **cross-section**, $\pi R^2$, not its whole surface $4\pi R^2$.` }, { value: Iin * Math.PI * R * R, feedback: t`Only the absorbed fraction (${alpha}) has to be re-radiated; reflected light was never taken in.` }],
          hints: [t`Steady state: the energy inside is constant, so the net outward flux through the closed surface is zero.`, t`Absorbed power $= ${alpha} \times (1361/${d}^2) \times \pi R^2$; it must all leave again.`],
          teach: t`Steady state means $\oint\vec S\cdot d\vec A = 0$: power out equals power in, through any surface enclosing the body.`,
          explain: t`$${alpha} \times ${tn(Iin)} \times \pi(${R})^2 = ${tn(Pabs)}$ W must be radiated (plus any internal power). Thermal engineers size a spacecraft’s radiators from exactly this balance.`,
        };
      },
    }),
    num({
      id: 'cp-string-ends', difficulty: 3,
      gen(r) {
        const T = r.pick([50, 80, 120]), yta = r.pick([0.3, -0.2, 0.5]), yxa = r.pick([-0.02, -0.05, 0.03]), ytb = r.pick([0.1, -0.4]), yxb = r.pick([0.04, -0.01]);
        const Sa = -T * yta * yxa, Sb = -T * ytb * yxb, rate = Sa - Sb;
        return {
          prompt: t`On a string at tension ${T} N, at one instant: at $x = a$, $y_t = ${yta}$ m/s and $y_x = ${yxa}$; at $x = b > a$, $y_t = ${ytb}$ m/s and $y_x = ${yxb}$. At what rate is the energy between $a$ and $b$ changing, in W?`,
          visual: curvesPic([{ fn: '0.3*sin(2.2*x + 0.4) + 0.1*sin(4*x)', color: 'accent', width: 2.2, domain: [-0.3, 3.3] }], [-0.4, 3.4], [-0.8, 0.8], t`The string between $a$ and $b$ (shape illustrative).`, { xlabel: 'x', ylabel: 'y', vlines: [{ x: 0.3, label: 'a', color: 'gold' }, { x: 2.9, label: 'b', color: 'gold' }] }),
          answer: rate, units: 'W', tol: { rel: 0.01, abs: 1e-3 },
          errors: [{ value: -rate, feedback: t`$S = -Ty_ty_x$ (note the minus sign), and $dE/dt = S(a) - S(b)$.` }].filter((e) => Math.abs(e.value - rate) > 1e-3),
          hints: [t`$S(a) = -T(${yta})(${yxa})$ and $S(b) = -T(${ytb})(${yxb})$.`, t`$dE/dt = S(a) - S(b)$.`],
          teach: 'Fluxes at the ends, in minus out: the local law integrated over a segment.',
          explain: t`$S(a) = ${tn(Sa)}$ W, $S(b) = ${tn(Sb)}$ W, so $dE/dt = ${tn(rate)}$ W.`,
        };
      },
    }),
    mcq({
      id: 'cp-poynting', difficulty: 3, transfer: true,
      prompt: t`In W12 you will derive, from Maxwell’s equations, Poynting’s theorem: $\dfrac{\partial u}{\partial t} + \nabla\cdot\vec S = -\vec J\cdot\vec E$, with $u = \tfrac12(\varepsilon_0E^2 + B^2/\mu_0)$ and $\vec S = \vec E\times\vec B/\mu_0$. By analogy with the string, what is $-\vec J\cdot\vec E$?`,
      visual: { type: 'em-wave', params: { phase: 30, controls: false, readout: false }, caption: 'A plane electromagnetic wave: E and B perpendicular to each other and to the direction of travel — and of the energy flux S. Field strengths not to scale.' },
      choices: [
        'A sink: the rate per volume at which the field does work on charges (heating a wire, driving an antenna’s current)',
        'A second kind of energy flux, flowing along the current instead of along E × B',
        'The energy density of the charges themselves, added to the field’s',
        'A correction that vanishes in every real situation, kept only for mathematical completeness',
      ],
      answer: 0,
      why: {
        1: t`Flux appears inside the divergence. $\vec J\cdot\vec E$ stands alone on the right, like the string’s $-by_t^2$: a local exchange with matter.`,
        2: 'It is not a density: it has units of power per volume and describes a transfer, not something stored.',
        3: 'In a wire carrying current, or an antenna, it is the whole story: the field’s energy turning into heat or motion.',
      },
      hints: [t`Compare with the damped string: $\partial_te + \partial_xS = -by_t^2$.`, t`$\vec J\cdot\vec E$ is force per volume on the charges times their velocity: power per volume.`],
      teach: t`Poynting’s theorem is the field’s energy conservation law: density, flux, and $-\vec J\cdot\vec E$ the exchange with charges.`,
      explain: t`$\vec J\cdot\vec E$ is the power per volume the field delivers to moving charges — Joule heating in a resistor, for instance. Where there are no charges the law is exactly $\partial_tu + \nabla\cdot\vec S = 0$, the equation this lesson ends on.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 14 and 19: conservation of energy; electromagnetic energy (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Griffiths, Introduction to Electrodynamics, 4th ed., §8.1: Poynting’s theorem', url: 'https://doi.org/10.1017/9781108333511' },
  ],
});
